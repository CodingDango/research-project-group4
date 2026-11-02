import { useEffect, useRef } from "react";
import type {
  PhysicsState,
  PhysicsStateMode,
  PhysicsStatsSetter,
} from "@/types/types";
import p5 from "p5";

const CONFIG = {
  ASPECT: 800 / 500,
  GROUND_Y: 350,
  BALL_RADIUS: 20,
  SIM_SPEED: 4,
  CLOUD_SEED: 6767,
  PPM: 2, // 2 pixels for 1 meter i think
  COLORS: {
    sandboxBg: "#86e6fe",
    sandboxGroundLine: "#0ba42d",
    sandboxGroundFill: "#8e3c2e",
    ball: "#f33e54",
    ballBorder: "#FFFFFF",
    apexLineColor: "#ffa850",
    trajectoryColor: "#f33e54",
    sandboxTextColor: "oklch(0.2077 0.0398 265.7549)",
    coordinateTextColor: "#FFFFFF",
  },
};

// TODO: Put math helpers in a separate file
function degToRad(angle: number) {
  return (angle * Math.PI) / 180;
}

function calculateRange(speed: number, angleDeg: number, gravity: number) {
  if (gravity === 0) return 0;
  const rad = degToRad(angleDeg);
  return (speed ** 2 * Math.sin(2 * rad)) / Math.abs(gravity);
}

function calculateMaxHeight(speed: number, angleDeg: number, gravity: number) {
  if (gravity === 0) return 0;
  const rad = degToRad(angleDeg);
  return (speed ** 2 * Math.sin(rad) ** 2) / (2 * Math.abs(gravity));
}

const metersToPx = (meters: number) => meters * CONFIG.PPM;
const pxToMeters = (pixels: number) => pixels / CONFIG.PPM;

function PhysicsCanvas({
  physicsState,
  setStats,
}: {
  physicsState: PhysicsState;
  setStats: PhysicsStatsSetter;
}) {
  const renderRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(physicsState);
  const setStatsRef = useRef(setStats);

  useEffect(() => {
    stateRef.current = physicsState;
  }, [physicsState]);

  useEffect(() => {
    setStatsRef.current = setStats;
  }, [setStats]);

  useEffect(() => {
    const container = renderRef.current!;

    const sketch = (p: p5) => {
      const ballStartY = CONFIG.GROUND_Y - CONFIG.BALL_RADIUS / 2;
      const ballStartX = 50;
      const ball = {
        x: ballStartX,
        y: ballStartY,
        vx: 0,
        vy: 0,
      };

      let virtualW = 800;
      let scale = 1;

      let isFiring = false;
      let hasLaunched = false;
      let hasReachedApex = false;
      let lastResetCount = stateRef.current.resetCount;

      let nextCloudX = 0;
      let trail: { x: number; y: number }[] = [];
      let clouds: { x: number; y: number }[] = [];
      let lastStatsTime = 0;
      let currentHeight = 0;
      let airTime = 0;

      let launchSnapshot = createLaunchSnapshot();
      let textColorToUse = "";

      updateThemeColors();

      p.randomSeed(CONFIG.CLOUD_SEED);

      p.setup = () => {
        const { w, h } = updateDimensions();
        p.createCanvas(w, h);
        p.angleMode(p.DEGREES);
      };

      p.windowResized = () => {
        const { w, h } = updateDimensions();
        p.resizeCanvas(w, h);
      };

      p.draw = () => {
        const dt = Math.min(p.deltaTime / 1000, 0.05) * CONFIG.SIM_SPEED;

        handleReset();

        if (!stateRef.current.isPaused) {
          updateStats();
          updatePhysics(dt);
        }

        p.clear();
        p.push();

        const cameraX = setupCamera();

        updateThemeColors();
        drawWorld(cameraX);
        drawTrail();
        drawAimingTrajectory(dt);
        drawApexIndicator();
        drawBall();

        p.pop();
        drawHUD();
      };

      p.mousePressed = (event?: MouseEvent) => {
        if (event && (event.target as HTMLElement)?.tagName !== "CANVAS")
          return;
        if (hasLaunched) return;
        if (stateRef.current.isPaused) return;

        fireBall();
      };

      function updatePhysics(dt: number) {
        const { bounciness, friction, isPaused } = stateRef.current;
        const convertedGravity = metersToPx(launchSnapshot.gravity);

        if (!isFiring || isPaused) return;

        airTime += dt / CONFIG.SIM_SPEED;
        ball.vy += convertedGravity * dt;
        ball.x += ball.vx * dt;
        ball.y = Math.min(ballStartY, ball.y + ball.vy * dt);
        trail.push({ x: ball.x, y: ball.y });

        if (ball.y >= ballStartY) {
          // sandbox mode do a bounce
          if (launchSnapshot.mode == "sandbox") {
            ball.vy = -ball.vy * bounciness;
            ball.vx *= friction;
            airTime = 0;
          }

          // if coordinate then don't bounce
          if (launchSnapshot.mode == "coordinate") {
            ball.vx = 0;
            ball.vy = 0;
            ball.y = ballStartY;
            isFiring = false;
          }
        }
      }

      function drawAimingTrajectory(dt: number) {
        const launch = hasLaunched ? launchSnapshot : stateRef.current;
        const convertedGravity = metersToPx(launch.gravity);

        let ghostX = ballStartX;
        let ghostY = ballStartY;
        let ghostVx = metersToPx(launch.speed * p.cos(launch.angle));
        let ghostVy = metersToPx(-launch.speed * p.sin(launch.angle));

        p.noFill();
        p.stroke(`${CONFIG.COLORS.ball}40`);
        p.strokeWeight(3);

        p.beginShape();
        for (let step = 0; step < 300; step++) {
          p.vertex(ghostX, ghostY);
          const prevX = ghostX;
          const prevY = ghostY;

          ghostVy += convertedGravity * dt;
          ghostX += ghostVx * dt;
          ghostY += ghostVy * dt;

          // When it crosses the ground:
          if (ghostY >= ballStartY) {
            // Find the exact slice where it hits the ground (no kink!)
            const fraction = (ballStartY - prevY) / (ghostY - prevY);
            const exactLandingX = prevX + (ghostX - prevX) * fraction;

            p.vertex(exactLandingX, ballStartY);
            break;
          }
        }
        p.endShape();
      }

      function fireBall() {
        const { speed, angle } = stateRef.current;
        ball.vx = metersToPx(speed * p.cos(angle));
        ball.vy = metersToPx(-speed * p.sin(angle));
        isFiring = true;
        hasLaunched = true;
        launchSnapshot = createLaunchSnapshot();
      }

      function handleReset() {
        const { resetCount } = stateRef.current;
        if (resetCount !== lastResetCount) {
          lastResetCount = resetCount;
          resetBall();
        }
      }

      function resetBall() {
        ball.x = ballStartX;
        ball.y = ballStartY;
        ball.vx = 0;
        ball.vy = 0;
        trail = [];
        isFiring = false;
        hasLaunched = false;
        hasReachedApex = false;
        p.randomSeed(CONFIG.CLOUD_SEED);
        clouds = [];
        nextCloudX = 0;
        currentHeight = 0;
        airTime = 0;
      }

      function setupCamera() {
        const groundCameraY = CONFIG.GROUND_Y - (p.height - 80) / scale;

        const ballCameraY = ball.y - (p.height * 0.5) / scale;
        const cameraY = Math.min(groundCameraY, ballCameraY);

        const cameraX = Math.max(0, ball.x - (p.width * 0.3) / scale);

        p.scale(scale);
        p.translate(-cameraX, -cameraY);
        return cameraX;
      }

      // change colors when uh mode changes.
      function updateThemeColors() {
        textColorToUse =
          stateRef.current.mode == "coordinate"
            ? CONFIG.COLORS.coordinateTextColor
            : CONFIG.COLORS.sandboxTextColor;
      }

      function drawWorld(cameraX: number) {
        const mode: PhysicsStateMode = isFiring
          ? launchSnapshot.mode
          : stateRef.current.mode;

        if (mode == "coordinate") {
          drawCoordinateGrid(cameraX);
          return;
        }

        drawBackground(cameraX);
        drawGround(cameraX);
      }

      function drawBackground(cameraX: number) {
        p.background(CONFIG.COLORS.sandboxBg);

        while (nextCloudX < cameraX + virtualW + 300) {
          clouds.push({ x: nextCloudX, y: p.random(-20, 20) });
          nextCloudX += p.random(150, 350);
        }
        clouds = clouds.filter((c) => c.x > cameraX - 150);

        for (const c of clouds) {
          p.noStroke();
          p.fill(255);
          p.rect(c.x - 60, c.y, 120, 45, 30);
          p.circle(c.x, c.y, 50);
        }
      }

      function drawApexIndicator() {
        const launch = hasLaunched ? launchSnapshot : stateRef.current;

        const formulaRange = calculateRange(
          launch.speed,
          launch.angle,
          launch.gravity,
        );
        const formulaMaxHeight = calculateMaxHeight(
          launch.speed,
          launch.angle,
          launch.gravity,
        );

        const apexX = ballStartX + metersToPx(formulaRange / 2);
        const apexY = ballStartY - metersToPx(formulaMaxHeight);

        p.stroke(CONFIG.COLORS.apexLineColor);
        p.strokeWeight(2);

        for (let y = ballStartY + CONFIG.BALL_RADIUS / 2; y > apexY; y -= 12) {
          p.line(apexX, y, apexX, Math.max(apexY + 3, y - 6));
        }

        p.fill(CONFIG.COLORS.apexLineColor);
        p.noStroke();
        p.circle(apexX, apexY + 3, 6);

        p.fill(textColorToUse);
        p.textSize(12);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(`h = ${formulaMaxHeight.toFixed(2)} m`, apexX, apexY - 12);
      }

      function drawGround(cameraX: number) {
        // Outline
        p.stroke(CONFIG.COLORS.sandboxGroundLine);
        p.strokeWeight(6);
        p.line(0, CONFIG.GROUND_Y, 999999, CONFIG.GROUND_Y);

        // Earth body
        p.fill(CONFIG.COLORS.sandboxGroundFill);
        p.noStroke();
        p.rect(cameraX, CONFIG.GROUND_Y + 2, virtualW, 300);
      }

      function drawCoordinateGrid(cameraX: number) {
        // 1. Dark chalkboard / blueprint background
        p.background("#0b0f19");

        const gridStepMeters = 15; // Grid line every 10 meters
        const gridStepPx = metersToPx(gridStepMeters);

        // 2. Faint Grid Lines
        p.stroke("#1e293b");
        p.strokeWeight(1);

        // Vertical grid lines across the visible camera view
        const startX = Math.floor(cameraX / gridStepPx) * gridStepPx;
        for (
          let x = startX + CONFIG.BALL_RADIUS / 2;
          x < cameraX + virtualW + 100;
          x += gridStepPx
        ) {
          p.line(x, -500, x, CONFIG.GROUND_Y + 500);
        }

        // Horizontal grid lines from ground upward
        for (
          let y = ballStartY + CONFIG.BALL_RADIUS / 2;
          y > -500;
          y -= gridStepPx
        ) {
          p.line(cameraX, y, cameraX + virtualW, y);
        }

        // 3. The Main Axes (X-axis and Y-axis) - brighter and thicker
        p.stroke("#475569");
        p.strokeWeight(2);

        // X-Axis (The Ground line)
        p.line(
          cameraX,
          ballStartY + CONFIG.BALL_RADIUS / 2,
          cameraX + virtualW,
          ballStartY + CONFIG.BALL_RADIUS / 2,
        );

        // Y-Axis (Vertical line passing right through the launch point)
        p.line(
          ballStartX - CONFIG.BALL_RADIUS / 2,
          -500,
          ballStartX - CONFIG.BALL_RADIUS / 2,
          1000,
        );

        // Origin dot (0, 0)
        p.fill("#38bdf8");
        p.noStroke();
        p.circle(ballStartX, ballStartY, 6);
      }

      function drawTrail() {
        p.stroke(CONFIG.COLORS.ball);
        p.strokeWeight(3);

        for (let i = 0; i < trail.length - 2; i += 4) {
          const p1 = trail[i];
          const p2 = trail[i + 2];
          p.line(p1.x, p1.y, p2.x, p2.y);
        }
      }

      function drawBall() {
        // Velocity vector arrow
        const velocityArrowDx = !hasLaunched
          ? metersToPx(stateRef.current.speed * p.cos(stateRef.current.angle))
          : ball.vx;

        const velocityArrowDy = !hasLaunched
          ? metersToPx(-stateRef.current.speed * p.sin(stateRef.current.angle))
          : ball.vy;

        drawArrow(
          ball.x,
          ball.y,
          velocityArrowDx,
          velocityArrowDy,
          CONFIG.COLORS.ball,
        );

        // The Ball
        p.fill(CONFIG.COLORS.ball);
        p.stroke(CONFIG.COLORS.ballBorder);
        p.strokeWeight(2);
        p.circle(ball.x, ball.y, CONFIG.BALL_RADIUS);
      }

      function drawHUD() {
        p.fill(0);
        p.noStroke();
        p.fill(textColorToUse);
        p.textSize(16);
        p.text(`${p.frameRate().toFixed(0)} FPS`, 10, 25);
      }

      function updateStats() {
        if (!hasReachedApex) {
          currentHeight = Math.max(currentHeight, ballStartY - ball.y);

          if (ballStartY - ball.y < currentHeight) {
            hasReachedApex = true;
          }
        }
        const speed = pxToMeters(Math.hypot(ball.vx, ball.vy));

        const formulaRange = calculateRange(
          launchSnapshot.speed,
          launchSnapshot.angle,
          launchSnapshot.gravity,
        );

        const formulaMaxHeight = calculateMaxHeight(
          launchSnapshot.speed,
          launchSnapshot.angle,
          launchSnapshot.gravity,
        );

        const range = Math.min(pxToMeters(ball.x - ballStartX), formulaRange);

        const maxHeight = !hasReachedApex
          ? pxToMeters(currentHeight)
          : formulaMaxHeight;

        if (p.millis() - lastStatsTime > 100) {
          lastStatsTime = p.millis();
          setStatsRef.current({
            maxHeight,
            range,
            speed,
            airTime,
          });
        }
      }

      function drawArrow(
        x1: number,
        y1: number,
        dx: number,
        dy: number,
        color: string,
      ) {
        const len = Math.hypot(dx, dy);
        if (len < 1) return;

        const x2 = x1 + dx;
        const y2 = y1 + dy;
        const head = Math.min(len * 0.4, 20);

        p.stroke(color);
        p.strokeWeight(3);
        p.line(x1, y1, x2, y2);

        p.push();
        p.translate(x2, y2);
        p.rotate(p.atan2(dy, dx));
        p.fill(color);
        p.noStroke();
        p.triangle(10, 0, -head, -head / 2, -head, head / 2);
        p.pop();
      }

      function getResponsiveSettings() {
        const w = container.clientWidth;
        const isMobile = w < 600;

        const aspect = isMobile ? 4 / 3 : 16 / 10;
        const targetViewportW = isMobile ? 440 : 750;

        return {
          w,
          h: Math.round(w / aspect),
          targetViewportW,
        };
      }

      function createLaunchSnapshot() {
        return {
          speed: stateRef.current.speed,
          angle: stateRef.current.angle,
          gravity: stateRef.current.gravity,
          mode: stateRef.current.mode,
        };
      }

      function updateDimensions() {
        const { w, h, targetViewportW } = getResponsiveSettings();
        virtualW = targetViewportW;
        scale = w / virtualW;

        return { w, h };
      }
    };

    const instance = new p5(sketch, container);
    return () => instance.remove();
  }, []);

  return <div ref={renderRef} className="w-full select-none touch-none" />;
}

export default PhysicsCanvas;
