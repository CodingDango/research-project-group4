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
  SIM_SPEED: 1.5,
  CLOUD_SEED: 6767,
  RANGE_LINE_OFFSET: 25,
  PPM: 2, // 2 pixels for 1 meter i think
  DASH_LENGTH: 6,
  DASH_GAP: 4,
  COLORS: {
    sandboxBg: "#86e6fe",
    sandboxGroundLine: "#0ba42d",
    sandboxGroundFill: "#8e3c2e",
    ball: "#f33e54",
    ballBorder: "#FFFFFF",
    apexLineColorSandbox: "#ffa850",
    apexLineColorCoords: "#a1b5cf",
    rangeLineColor: "#ffa850",
    rangeLineColorCoords: "#a1b5cf",
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
      let simTime = 0; // Our master time tracker in seconds
      let totalFlightTime = 0; // When it hits the ground in seconds

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
          updatePhysics(dt);
          updateStats();
        }

        p.clear();
        p.push();

        const cameraX = setupCamera();

        updateThemeColors();
        drawWorld(cameraX);
        drawTrail();
        drawAimingTrajectory(dt);
        drawApexIndicator();
        drawRangeIndicator();
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
        const { isPaused } = stateRef.current;

        if (!isFiring || isPaused) return;

        simTime += dt * CONFIG.SIM_SPEED;

        if (simTime >= totalFlightTime) {
          simTime = totalFlightTime;
          isFiring = false;
          isFiring = false;
        }

        const physics = getPhysicsAtTime(
          simTime,
          launchSnapshot.speed,
          launchSnapshot.angle,
          launchSnapshot.gravity,
        );

        // Convert Physics (meters, Y-up) to Canvas (pixels, Y-down)
        ball.x = ballStartX + metersToPx(physics.x);
        ball.y = ballStartY - metersToPx(physics.y);
        ball.vx = metersToPx(physics.vx);
        ball.vy = metersToPx(-physics.vy); // Negative because canvas Y goes down!

        trail.push({ x: ball.x, y: ball.y });
      }

      function drawAimingTrajectory() {
        const launch = hasLaunched ? launchSnapshot : stateRef.current;
        const { speed, angle, gravity } = launch;

        if (gravity <= 0 || speed <= 0) return;

        // 1. Calculate total duration for the arc
        const rad = degToRad(angle);
        const v0y = speed * Math.sin(rad);
        const flightDuration = (2 * v0y) / gravity;

        if (flightDuration <= 0) return;

        p.noFill();
        p.stroke(`${CONFIG.COLORS.ball}40`);
        p.strokeWeight(3);

        // 2. Sample 60 smooth points from t = 0 to t = flightDuration
        const STEPS = 60;

        p.beginShape();
        for (let i = 0; i <= STEPS; i++) {
          const t = (i / STEPS) * flightDuration;

          // Exact position in meters
          const pos = getPhysicsAtTime(t, speed, angle, gravity);

          // Convert to canvas pixels
          const px = ballStartX + metersToPx(pos.x);
          const py = ballStartY - metersToPx(pos.y);

          p.vertex(px, py);
        }
        p.endShape();
      }

      function fireBall() {
        const { speed, angle, gravity } = stateRef.current;
        const rad = degToRad(angle);
        const v0y = speed * Math.sin(rad);

        totalFlightTime = gravity > 0 ? (2 * v0y) / gravity : 0;
        simTime = 0;
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
        totalFlightTime = 0;
        simTime = 0;
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

      function drawRangeIndicator() {
        const launch = hasLaunched ? launchSnapshot : stateRef.current;
        const range = calculateRange(
          launch.speed,
          launch.angle,
          launch.gravity,
        );
        if (range <= 0) return;

        const startX = ballStartX;
        const endX = ballStartX + metersToPx(range);
        const y = CONFIG.GROUND_Y + CONFIG.RANGE_LINE_OFFSET;
        const tick = 6;

        const rangeColor =
          launch.mode == "sandbox"
            ? CONFIG.COLORS.rangeLineColor
            : CONFIG.COLORS.rangeLineColorCoords;

        p.stroke(rangeColor);
        p.strokeWeight(2);

        // Horizontal span
        drawDashedLine(startX, y, endX, y);

        // End caps
        p.line(startX, y - tick, startX, y + tick);
        p.line(endX, y - tick, endX, y + tick);

        // Label centered under the span
        p.noStroke();
        p.fill(rangeColor);
        p.textSize(12);
        p.textAlign(p.CENTER, p.TOP);
        p.text(`range = ${range.toFixed(2)} m`, (startX + endX) / 2, y + tick + 4);
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

        const apexColor =
          launch.mode == "sandbox"
            ? CONFIG.COLORS.apexLineColorSandbox
            : CONFIG.COLORS.apexLineColorCoords;

        p.stroke(apexColor);
        p.strokeWeight(2);

        drawDashedLine(
          apexX,
          ballStartY + CONFIG.BALL_RADIUS / 2,
          apexX,
          apexY + CONFIG.BALL_RADIUS / 2,
        );

        p.fill(apexColor);
        p.noStroke();
        p.circle(apexX, apexY + 3, 6);

        p.fill(apexColor);
        p.textSize(12);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(
          `max height = ${formulaMaxHeight.toFixed(2)} m`,
          apexX,
          apexY - 12,
        );
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

        for (
          let y = ballStartY + CONFIG.BALL_RADIUS / 2;
          y > -500;
          y -= gridStepPx
        ) {
          p.line(cameraX, y, cameraX + virtualW, y);
        }

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
        // speed vector arrow
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

        const values = isFiring ? launchSnapshot : stateRef.current;

        const velocity =
          pxToMeters(Math.hypot(ball.vx, ball.vy)) * Math.sign(-ball.vy);

        const formulaRange = calculateRange(
          values.speed,
          values.angle,
          values.gravity,
        );

        const formulaMaxHeight = calculateMaxHeight(
          values.speed,
          values.angle,
          values.gravity,
        );

        const airTime = values.gravity > 0 ? (2 * values.speed * p.sin(values.angle)) / values.gravity : 0;

        if (p.millis() - lastStatsTime > 100) {
          lastStatsTime = p.millis();
          setStatsRef.current({
            maxHeight: formulaMaxHeight,
            range: formulaRange,
            velocity,
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

      function drawDashedLine(x1: number, y1: number, x2: number, y2: number) {
        const len = Math.hypot(x2 - x1, y2 - y1);
        if (len === 0) return;

        const ux = (x2 - x1) / len;
        const uy = (y2 - y1) / len;

        for (let d = 0; d < len; d += CONFIG.DASH_LENGTH + CONFIG.DASH_GAP) {
          const end = Math.min(d + CONFIG.DASH_LENGTH, len);
          p.line(x1 + ux * d, y1 + uy * d, x1 + ux * end, y1 + uy * end);
        }
      }
      function getPhysicsAtTime(
        t: number,
        v0: number,
        angleDeg: number,
        g = 9.81,
      ) {
        const rad = degToRad(angleDeg);
        const v0x = v0 * Math.cos(rad);
        const v0y = v0 * Math.sin(rad);

        const x = v0x * t;
        const y = Math.max(0, v0y * t - 0.5 * g * t * t);

        const vx = v0x;
        const vy = v0y - g * t;

        return { x, y, vx, vy };
      }
    };

    const instance = new p5(sketch, container);
    return () => instance.remove();
  }, []);

  return <div ref={renderRef} className="w-full select-none touch-none" />;
}

export default PhysicsCanvas;
