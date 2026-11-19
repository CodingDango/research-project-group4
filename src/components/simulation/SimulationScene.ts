import p5 from "p5";
import {
  getPhysicsAtTime,
  calculateFlightTime,
  calculateRange,
  calculateMaxHeight,
  metersToPx,
  pxToMeters,
} from "@/lib/physics";
import type { PhysicsState, PhysicsStatsSetter } from "@/types/types";
import { CONFIG } from "@/lib/config";

export class SimulationScene {
  private p: p5;

  // Layout & Scaling
  public virtualW = 800;
  public scale = 1;
  public ballStartX = 60;
  public ballStartY = CONFIG.GROUND_Y - CONFIG.BALL_RADIUS / 2;

  // Physics & Simulation Clock
  public simTime = 0;
  public totalFlightTime = 0;
  public isFiring = false;
  public hasLaunched = false;
  public hasReachedApex = false;
  public lastResetCount = 0;
  public lastLaunchCount = 0;

  // Ball State
  public ball = {
    x: this.ballStartX,
    y: CONFIG.GROUND_Y - CONFIG.BALL_RADIUS / 2,
    vx: 0,
    vy: 0,
  };
  public trail: { x: number; y: number }[] = [];

  // Environment
  public nextCloudX = 0;
  public clouds: { x: number; y: number }[] = [];
  public currentHeight = 0;
  public lastStatsTime = 0;

  // Snapshot of variables when ball was launched
  public launchSnapshot: {
    speed: number;
    angle: number;
    gravity: number;
    mode: string;
  };

  constructor(p: p5, initialState: PhysicsState) {
    this.p = p;
    this.launchSnapshot = this.snapshot(initialState);
    this.p.randomSeed(CONFIG.CLOUD_SEED);
  }

  private snapshot(state: PhysicsState) {
    return {
      speed: state.speed,
      angle: state.angle,
      gravity: state.gravity,
      mode: state.mode,
    };
  }

  public handleLaunch(state: PhysicsState) {
    if (state.launchCount == this.lastLaunchCount) return;
    
    this.lastLaunchCount = state.launchCount;
    
    if (this.hasLaunched || state.isPaused) return;

    const { speed, angle, gravity } = state;
    this.totalFlightTime = calculateFlightTime(speed, angle, gravity);
    this.simTime = 0;
    this.isFiring = true;
    this.hasLaunched = true;
    this.launchSnapshot = this.snapshot(state);
  }

  public reset() {
    this.ball.x = this.ballStartX;
    this.ball.y = this.ballStartY;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.trail = [];
    this.isFiring = false;
    this.hasLaunched = false;
    this.hasReachedApex = false;
    this.clouds = [];
    this.nextCloudX = 0;
    this.currentHeight = 0;
    this.totalFlightTime = 0;
    this.simTime = 0;
    this.p.randomSeed(CONFIG.CLOUD_SEED);
  }

  public update(dt: number, state: PhysicsState, setStats: PhysicsStatsSetter) {
    this.handleLaunch(state);

    if (state.resetCount !== this.lastResetCount) {
      this.lastResetCount = state.resetCount;
      this.reset();
    }

    this.updateStats(state, setStats);

    if (!this.isFiring || state.isPaused) return;

    this.simTime += dt * CONFIG.SIM_SPEED;

    if (this.simTime >= this.totalFlightTime) {
      this.simTime = this.totalFlightTime;
      this.isFiring = false;
      this.ball.vy = -this.launchSnapshot.speed;
    }

    const phys = getPhysicsAtTime(
      this.simTime,
      this.launchSnapshot.speed,
      this.launchSnapshot.angle,
      this.launchSnapshot.gravity,
    );

    this.ball.x = this.ballStartX + metersToPx(phys.x);
    this.ball.y = this.ballStartY - metersToPx(phys.y);
    this.ball.vx = metersToPx(phys.vx);
    this.ball.vy = metersToPx(-phys.vy);

    this.trail.push({ x: this.ball.x, y: this.ball.y });
  }

  public render(state: PhysicsState) {
    const p = this.p;
    p.clear();
    p.push();

    const cameraX = this.setupCamera();
    this.drawWorld(cameraX, state);
    this.drawTrail();
    this.drawAimingTrajectory(state);
    this.drawApexIndicator(state);
    this.drawRangeIndicator(state);
    this.drawFloatingBadge(state);
    this.drawBall(state);

    p.pop();
    this.drawHUD(state);
  }

  public updateDimensions(w: number) {
    const isMobile = w < 600;
    const aspect = isMobile ? 4 / 3 : 16 / 10;
    this.virtualW = isMobile ? 440 : 750;
    this.scale = w / this.virtualW;
    return { w, h: Math.round(w / aspect) };
  }

  private setupCamera() {
    const p = this.p;
    const groundCameraY = CONFIG.GROUND_Y - (p.height - 80) / this.scale;
    const ballCameraY = this.ball.y - (p.height * 0.5) / this.scale;
    const cameraY = Math.min(groundCameraY, ballCameraY);
    const cameraX = Math.max(0, this.ball.x - (p.width * 0.3) / this.scale);

    p.scale(this.scale);
    p.translate(-cameraX, -cameraY);
    return cameraX;
  }

  private drawWorld(cameraX: number, state: PhysicsState) {
    const mode = this.isFiring ? this.launchSnapshot.mode : state.mode;
    if (mode === "coordinate") {
      this.drawCoordinateGrid(cameraX);
    } else {
      this.drawBackground(cameraX);
      this.drawGround(cameraX);
    }
  }

  private drawBackground(cameraX: number) {
    const p = this.p;
    p.background(CONFIG.COLORS.sandboxBg);

    while (this.nextCloudX < cameraX + this.virtualW + 300) {
      this.clouds.push({ x: this.nextCloudX, y: p.random(-20, 20) });
      this.nextCloudX += p.random(150, 350);
    }
    this.clouds = this.clouds.filter((c) => c.x > cameraX - 150);

    for (const c of this.clouds) {
      p.noStroke();
      p.fill(255);
      p.rect(c.x - 60, c.y, 120, 45, 30);
      p.circle(c.x, c.y, 50);
    }
  }

  private drawGround(cameraX: number) {
    const p = this.p;
    p.stroke(CONFIG.COLORS.sandboxGroundLine);
    p.strokeWeight(6);
    p.line(0, CONFIG.GROUND_Y, 999999, CONFIG.GROUND_Y);

    p.fill(CONFIG.COLORS.sandboxGroundFill);
    p.noStroke();
    p.rect(cameraX, CONFIG.GROUND_Y + 2, this.virtualW, 300);
  }

  private drawCoordinateGrid(cameraX: number) {
    const p = this.p;
    p.background("#0b0f19");

    const gridStepMeters = CONFIG.GRID_STEP;
    const gridStepPx = metersToPx(gridStepMeters);

    const originX = this.ballStartX;
    const originY = this.ballStartY;

    // 1. FAINT GRID LINES
    p.stroke("#1e293b");
    p.strokeWeight(1);
    // VERTICAL LINES:
    // Start 50px behind the camera (or -50m), step forward across the whole screen
    const startX =
      originX -
      Math.ceil((originX - (cameraX - 100)) / gridStepPx) * gridStepPx;
    for (let x = startX; x < cameraX + this.virtualW + 100; x += gridStepPx) {
      p.line(x, -1000, x, originY + 200); // extends above and below
    }

    // HORIZONTAL LINES:
    // Start below the ground and go way up into the sky
    for (let y = originY + gridStepPx * 3; y > -1000; y -= gridStepPx) {
      p.line(cameraX - 100, y, cameraX + this.virtualW + 100, y);
    }

    // 2. MAIN AXES (X and Y axis lines)
    p.stroke("#475569");
    p.strokeWeight(2);

    // X-Axis (Ground / y = 0)
    p.line(cameraX, originY, cameraX + this.virtualW, originY);

    // Y-Axis (Vertical line right through x = 0)
    p.line(originX, -1000, originX, originY + 500);
  }

  private drawAimingTrajectory(state: PhysicsState) {
    const p = this.p;
    const launch = this.hasLaunched ? this.launchSnapshot : state;
    const { speed, angle, gravity } = launch;

    const duration = calculateFlightTime(speed, angle, gravity);
    if (duration <= 0) return;

    p.noFill();
    p.stroke(`${CONFIG.COLORS.ball}40`);
    p.strokeWeight(3);

    const STEPS = 60;
    p.beginShape();
    for (let i = 0; i <= STEPS; i++) {
      const t = (i / STEPS) * duration;
      const pos = getPhysicsAtTime(t, speed, angle, gravity);
      p.vertex(
        this.ballStartX + metersToPx(pos.x),
        this.ballStartY - metersToPx(pos.y),
      );
    }
    p.endShape();
  }

  private drawFloatingBadge(state: PhysicsState) {
    const p = this.p;

    // 1. Get current values from the active snapshot or state
    const launch = this.hasLaunched ? this.launchSnapshot : state;
    const phys = getPhysicsAtTime(
      this.simTime,
      launch.speed,
      launch.angle,
      launch.gravity,
    );

    const speed = Math.hypot(phys.vx, phys.vy);

    const label = `x: ${phys.x.toFixed(1)}m, y: ${phys.y.toFixed(1)}m`;
    const speedLabel = `t = ${this.simTime.toFixed(2)}s | ${speed.toFixed(1)} m/s`;

    p.push();
    p.textSize(10);
    p.textAlign(p.CENTER, p.CENTER);

    // Position it floating right above this.ball
    const boxW = Math.max(p.textWidth(label), p.textWidth(speedLabel)) + 14;
    const boxH = 30;
    const boxX = this.ball.x;
    const boxY = this.ball.y - CONFIG.BALL_RADIUS - 22;

    // Semi-transparent pill background
    p.fill(15, 23, 42, 220);
    p.stroke(71, 85, 105);
    p.strokeWeight(1);
    p.rectMode(p.CENTER);
    p.rect(boxX, boxY, boxW, boxH, 5);

    // Text inside the pill
    p.noStroke();
    p.fill(255);
    p.text(label, boxX, boxY - 5);
    p.fill(148, 163, 184); // muted text for time & speed
    p.text(speedLabel, boxX, boxY + 6);

    p.pop();
  }

  private drawRangeIndicator(state: PhysicsState) {
    const p = this.p;
    const launch = this.hasLaunched ? this.launchSnapshot : state;
    const range = calculateRange(launch.speed, launch.angle, launch.gravity);
    if (range <= 0) return;

    const startX = this.ballStartX;
    const endX = this.ballStartX + metersToPx(range);
    const y = CONFIG.GROUND_Y + CONFIG.GRID_STEP;
    const tick = 6;
    const color =
      launch.mode === "sandbox"
        ? CONFIG.COLORS.rangeLineColor
        : CONFIG.COLORS.rangeLineColorCoords;

    p.stroke(color);
    p.strokeWeight(2);
    this.drawDashedLine(startX, y, endX, y);
    p.line(startX, y - tick, startX, y + tick);
    p.line(endX, y - tick, endX, y + tick);

    p.noStroke();
    p.fill(color);
    p.textSize(12);
    p.textAlign(p.CENTER, p.TOP);
    p.text(`range = ${range.toFixed(2)} m`, (startX + endX) / 2, y + tick + 4);
  }

  private drawApexIndicator(state: PhysicsState) {
    const p = this.p;
    const launch = this.hasLaunched ? this.launchSnapshot : state;
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

    const apexX = this.ballStartX + metersToPx(formulaRange / 2);
    const apexY = this.ballStartY - metersToPx(formulaMaxHeight);
    const color =
      launch.mode === "sandbox"
        ? CONFIG.COLORS.apexLineColorSandbox
        : CONFIG.COLORS.apexLineColorCoords;

    p.stroke(color);
    p.strokeWeight(2);
    this.drawDashedLine(apexX, this.ballStartY, apexX, apexY);

    p.fill(color);
    p.noStroke();
    p.circle(apexX, apexY, 6);
    p.textSize(12);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(`max height = ${formulaMaxHeight.toFixed(2)} m`, apexX, apexY - 12);
  }

  private drawTrail() {
    const p = this.p;
    p.stroke(CONFIG.COLORS.ball);
    p.strokeWeight(3);
    for (let i = 0; i < this.trail.length - 2; i += 4) {
      p.line(
        this.trail[i].x,
        this.trail[i].y,
        this.trail[i + 2].x,
        this.trail[i + 2].y,
      );
    }
  }

  private drawBall(state: PhysicsState) {
    const p = this.p;
    p.fill(CONFIG.COLORS.ball);
    p.stroke(CONFIG.COLORS.ballBorder);
    p.strokeWeight(2);
    p.circle(this.ball.x, this.ball.y, CONFIG.BALL_RADIUS);
  }

  private drawHUD(state: PhysicsState) {
    const p = this.p;
    const color =
      state.mode === "coordinate"
        ? CONFIG.COLORS.coordinateTextColor
        : CONFIG.COLORS.sandboxTextColor;
    p.fill(color);
    p.noStroke();
    p.textSize(16);
    p.text(`${p.frameRate().toFixed(0)} FPS`, 10, 25);
  }

  private updateStats(state: PhysicsState, setStats: PhysicsStatsSetter) {
    const p = this.p;
    const values = this.isFiring ? this.launchSnapshot : state;
    const velocity =
      pxToMeters(Math.hypot(this.ball.vx, this.ball.vy)) *
      Math.sign(-this.ball.vy);
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
    const airTime = calculateFlightTime(
      values.speed,
      values.angle,
      values.gravity,
    );

    if (p.millis() - this.lastStatsTime > 100) {
      this.lastStatsTime = p.millis();
      setStats({
        maxHeight: formulaMaxHeight,
        range: formulaRange,
        velocity,
        airTime,
      });
    }
  }

  private drawVectorArrows(state: PhysicsState) {
    const p = this.p;
    const velocityArrowDx = !this.hasLaunched
      ? metersToPx(state.speed * p.cos(state.angle))
      : this.ball.vx;

    const velocityArrowDy = !this.hasLaunched
      ? metersToPx(-state.speed * p.sin(state.angle))
      : this.ball.vy;

    this.drawArrow(
      this.ball.x,
      this.ball.y,
      velocityArrowDx,
      velocityArrowDy,
      CONFIG.COLORS.ball,
    );
  }

  private drawArrow(
    x1: number,
    y1: number,
    dx: number,
    dy: number,
    color: string,
  ) {
    const p = this.p;
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

  private drawDashedLine(x1: number, y1: number, x2: number, y2: number) {
    const p = this.p;
    const len = Math.hypot(x2 - x1, y2 - y1);
    if (len === 0) return;
    const ux = (x2 - x1) / len;
    const uy = (y2 - y1) / len;

    for (let d = 0; d < len; d += CONFIG.DASH_LENGTH + CONFIG.DASH_GAP) {
      const end = Math.min(d + CONFIG.DASH_LENGTH, len);
      p.line(x1 + ux * d, y1 + uy * d, x1 + ux * end, y1 + uy * end);
    }
  }
}
