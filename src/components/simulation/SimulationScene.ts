import p5 from "p5";
import {
  getPhysicsAtTime,
  calculateFlightTime,
  calculateRange,
  calculateMaxHeight,
  metersToPx,
  pxToMeters,
} from "@/lib/physics";
import type {
  PhysicsState,
  PhysicsStatsSetter,
  Theme,
  ThemeColors,
} from "@/types/types";
import { CONFIG } from "@/lib/config";

export class SimulationScene {
  private p: p5;

  // layout
  public virtualW = 800;
  public scale = 1;

  // Physics
  public ballStartX = 60;
  public ballStartY = CONFIG.GROUND_Y - CONFIG.BALL_RADIUS / 2;
  public simTime = 0;
  public totalFlightTime = 0;
  public isFiring = false;
  public hasLaunched = false;
  public hasReachedApex = false;
  public lastResetBallCount = 0;
  public lastLaunchCount = 0;

  // camera
  private cameraX = 0;
  private cameraY = 0;
  private lastResetCameraCount = 0;
  private zoom = 1;
  private lastZoom = 1;
  private isDragging = false;
  private isScrubbingBall = false;
  private lastTouchX = 0;
  private lastTouchY = 0;

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

  // theme
  private currentTheme: Theme = "dark";

  constructor(p: p5, initialState: PhysicsState) {
    this.p = p;
    this.currentTheme = localStorage.getItem("vite-ui-theme") as Theme;
    this.launchSnapshot = this.snapshot(initialState);
    this.p.randomSeed(CONFIG.CLOUD_SEED);
  }

  public setTheme(theme: Theme) {
    this.currentTheme = theme;
  }

  private getTheme(key: keyof ThemeColors) {
    const theme = CONFIG.COLORS[this.currentTheme] ? this.currentTheme : "dark";
    return CONFIG.COLORS[theme][key];
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

  public handleZoom(state: PhysicsState) {
    this.zoom = Math.min(
      Math.max(state.zoom, CONFIG.MIN_ZOOM),
      CONFIG.MAX_ZOOM,
    );

    if (this.zoom === this.lastZoom) return;

    const p = this.p;
    const oldZoom = this.lastZoom;
    const newZoom = this.zoom;

    // 1. Find the point in the world that is currently at the center of the screen
    const viewW = p.width / (this.scale * oldZoom);
    const viewH = p.height / (this.scale * oldZoom);
    const worldCenterX = this.cameraX + viewW / 2;
    const worldCenterY = this.cameraY + viewH / 2;

    // 2. Adjust camera so that exact same center point stays in the center
    const newViewW = p.width / (this.scale * newZoom);
    const newViewH = p.height / (this.scale * newZoom);
    this.cameraX = worldCenterX - newViewW / 2;
    this.cameraY = worldCenterY - newViewH / 2;

    // 3. Keep them in sync
    this.lastZoom = newZoom;
  }

  public update(dt: number, state: PhysicsState, setStats: PhysicsStatsSetter) {
    this.handleButtons(state);
    this.handleZoom(state);
    this.handleCanvasTouch();
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

    this.setupCamera();
    this.drawCoordinateGrid();
    this.drawTrail(state);
    this.drawVectorArrows(state);
    this.drawAimingTrajectory(state);
    this.drawApexIndicator(state);
    this.drawRangeIndicator(state);
    this.drawApexInspectionPoint(state);
    this.drawFloatingBadge(state);
    this.drawBall();

    p.pop();
    this.drawHUD();
  }

  public handleButtons(state: PhysicsState) {
    this.handleLaunch(state);

    if (state.resetBallCount !== this.lastResetBallCount) {
      this.lastResetBallCount = state.resetBallCount;
      this.reset();
    }

    if (state.resetCameraCount !== this.lastResetCameraCount) {
      this.lastResetCameraCount = state.resetCameraCount;
      this.cameraX = 0;
      this.cameraY = 0;
      this.zoom = 1;
      this.lastZoom = 1;
    }
  }

  public updateDimensions(w: number) {
    const isMobile = w < 600;
    const aspect = isMobile ? 4 / 3 : 16 / 10;
    this.virtualW = isMobile ? 400 : 750;
    this.scale = w / this.virtualW;
    return { w, h: Math.round(w / aspect) };
  }

  private setupCamera() {
    const p = this.p;
    const totalScale = this.scale * this.zoom;
    p.scale(totalScale);
    p.translate(-this.cameraX, -this.cameraY);
  }

  private scrubTrajectory(worldMouseX: number) {
    const { speed, angle, gravity } = this.launchSnapshot;
    const rad = (angle * Math.PI) / 180;
    const v0x = speed * Math.cos(rad);
    if (v0x <= 0) return;

    // Time = Distance / Speed
    const draggedMetersX = pxToMeters(worldMouseX - this.ballStartX);
    const targetTime = draggedMetersX / v0x;

    this.simTime = Math.max(0, Math.min(this.totalFlightTime, targetTime));
    this.isFiring = false;

    // Move ball
    const phys = getPhysicsAtTime(this.simTime, speed, angle, gravity);
    this.ball.x = this.ballStartX + metersToPx(phys.x);
    this.ball.y = this.ballStartY - metersToPx(phys.y);
    this.ball.vx = metersToPx(phys.vx);
    this.ball.vy = metersToPx(-phys.vy);
  }

  public handleCanvasTouch() {
    const p = this.p;

    if (!p.mouseIsPressed) {
      this.isDragging = false;
      this.isScrubbingBall = false;
      return;
    }

    if (
      p.mouseX < 0 ||
      p.mouseX > p.width ||
      p.mouseY < 0 ||
      p.mouseY > p.height
    ) {
      this.isDragging = false;
      this.isScrubbingBall = false;
      return;
    }

    const totalScale = this.scale * this.zoom || 1;
    const worldMouseX = this.cameraX + p.mouseX / totalScale;
    const worldMouseY = this.cameraY + p.mouseY / totalScale;

    if (!this.isDragging) {
      this.isDragging = true;
      this.lastTouchX = p.mouseX;
      this.lastTouchY = p.mouseY;

      // Did user touch the ball?
      const dx = worldMouseX - this.ball.x;
      const dy = worldMouseY - this.ball.y;
      if (dx * dx + dy * dy < 900) {
        this.isScrubbingBall = true;
      }
      return;
    }
    if (this.isScrubbingBall) {
      this.scrubTrajectory(worldMouseX);
    } else {
      const dx = p.mouseX - this.lastTouchX;
      const dy = p.mouseY - this.lastTouchY;
      this.lastTouchX = p.mouseX;
      this.lastTouchY = p.mouseY;

      this.panCamera(dx, dy, totalScale);
    }
  }

  private panCamera(dx: number, dy: number, totalScale: number) {
    if (dx === 0 && dy === 0) return;
    this.cameraX -= dx / totalScale;
    this.cameraY -= dy / totalScale;
  }

  private drawCoordinateGrid() {
    const p = this.p;
    p.background(this.getTheme("gridBg"));

    const gridStepMeters = CONFIG.GRID_STEP;
    const gridStepPx = metersToPx(gridStepMeters);

    const originX = this.ballStartX;
    const originY = this.ballStartY;

    const totalScale = this.scale * this.zoom || 1;
    const visibleW = p.width / totalScale;
    const visibleH = p.height / totalScale;

    const visibleLeft = this.cameraX - 100;
    const visibleRight = this.cameraX + visibleW + 100; // <-- Now accounts for zoom!
    const visibleTop = this.cameraY - 100;
    const visibleBottom = this.cameraY + visibleH + 100; // <-- Now accounts for zoom!

    // GRID LINES
    p.stroke(this.getTheme("gridLines"));
    p.strokeWeight(CONFIG.GRID[this.currentTheme]?.gridLineStroke);

    // Vertical lines across the whole visible screen
    const startX =
      originX - Math.ceil((originX - visibleLeft) / gridStepPx) * gridStepPx;
    for (let x = startX; x < visibleRight; x += gridStepPx) {
      p.line(x, visibleTop, x, visibleBottom);
    }

    // Horizontal lines across the whole visible screen
    const startY =
      originY - Math.ceil((originY - visibleTop) / gridStepPx) * gridStepPx;
    for (let y = startY; y < visibleBottom; y += gridStepPx) {
      p.line(visibleLeft, y, visibleRight, y);
    }

    // X AND Y AXIS
    p.stroke(this.getTheme("gridAxis"));
    p.strokeWeight(2);

    // X-Axis
    p.line(visibleLeft, originY, visibleRight, originY);

    // Y-Axis
    p.line(originX, visibleTop, originX, visibleBottom);
  }

  private drawAimingTrajectory(state: PhysicsState) {
    const p = this.p;
    const launch = this.hasLaunched ? this.launchSnapshot : state;
    const { speed, angle, gravity } = launch;

    const duration = calculateFlightTime(speed, angle, gravity);
    if (duration <= 0) return;

    p.noFill();
    p.stroke(`${this.getTheme("ball")}40`);
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
    const speedSign = Math.sign(phys.vy) == 1 ? "" : "-";
    const label = `x: ${phys.x.toFixed(1)}m y: ${phys.y.toFixed(1)}m`;
    const speedLabel = `t = ${this.simTime.toFixed(2)}s, v = ${speedSign}${speed.toFixed(1)} m/s`;

    p.push();
    p.textSize(10);
    p.textAlign(p.CENTER, p.CENTER);

    // Position it floating right above this.ball
    const boxW = Math.max(p.textWidth(label), p.textWidth(speedLabel)) + 14;
    const boxH = 30;
    const boxX = this.ball.x;
    const boxY = this.ball.y - CONFIG.BALL_RADIUS - 22;

    p.fill(this.getTheme("badgeBg"));
    p.stroke(this.getTheme("badgeOutline"));
    p.strokeWeight(1);
    p.rectMode(p.CENTER);
    p.rect(boxX, boxY, boxW, boxH, 5);

    // Text inside the badge
    p.noStroke();
    p.fill(255);
    p.text(label, boxX, boxY - 5);
    p.fill(this.getTheme("badgeSecondaryText"));
    p.text(speedLabel, boxX, boxY + 6);

    p.pop();
  }

  private getWorldMouse() {
    const totalScale = this.scale * this.zoom || 1;
    return {
      x: this.cameraX + this.p.mouseX / totalScale,
      y: this.cameraY + this.p.mouseY / totalScale,
    };
  }

  private drawApexInspectionPoint(state: PhysicsState) {
    const p = this.p;
    const launch = this.hasLaunched ? this.launchSnapshot : state;
    const duration = calculateFlightTime(
      launch.speed,
      launch.angle,
      launch.gravity,
    );

    if (duration <= 0) return;

    const point = 0.5;
    const mouse = this.getWorldMouse();
    const t = point * duration;
    const phys = getPhysicsAtTime(
      t,
      launch.speed,
      launch.angle,
      launch.gravity,
    );

    const px = this.ballStartX + metersToPx(phys.x);
    const py = this.ballStartY - metersToPx(phys.y);

    const dx = (mouse.x - px) ** 2;
    const dy = (mouse.y - py) ** 2;
    const distToMouse = dx + dy;
    const reach = 144; // 12^2 so about 12 pixels range;
    const isHovered = distToMouse < reach;

    if (
      (isHovered && p.mouseIsPressed) ||
      (this.isScrubbingBall && dx < reach)
    ) {
      this.simTime = t;
      this.hasLaunched = true;
      this.launchSnapshot = this.snapshot(state);

      // Snap coords
      this.ball.x = px;
      this.ball.y = py;
      this.ball.vx = metersToPx(phys.vx);
      this.ball.vy = metersToPx(-phys.vy);
    }

    // draw the point
    p.push();
    p.fill(this.getTheme("point"));
    p.stroke(this.getTheme("pointOutline"));
    p.strokeWeight(1);
    p.circle(px, py, isHovered ? 11 : 8);
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

    p.stroke(this.getTheme("rangeLine"));
    p.strokeWeight(2);
    this.drawDashedLine(startX, y, endX, y);
    p.line(startX, y - tick, startX, y + tick);
    p.line(endX, y - tick, endX, y + tick);

    p.noStroke();
    p.fill(this.getTheme("rangeLine"));
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

    p.stroke(this.getTheme("apexLine"));
    p.strokeWeight(2);
    this.drawDashedLine(apexX, this.ballStartY, apexX, apexY);

    p.fill(this.getTheme("apexLine"));
    p.noStroke();
    p.circle(apexX, apexY, 6);
    p.textSize(12);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(`max height = ${formulaMaxHeight.toFixed(2)} m`, apexX, apexY - 32);
  }

  private drawTrail(state: PhysicsState) {
    // If ball hasn't moved yet, don't draw
    if (this.simTime <= 0) return;

    const p = this.p;
    const launch = this.hasLaunched ? this.launchSnapshot : state;
    const { speed, angle, gravity } = launch;
    if (speed <= 0 || gravity <= 0) return;

    p.noFill();
    p.stroke(this.getTheme("ball"));
    p.strokeWeight(3);

    // Sample 40 smooth points from 0 up to current simTime
    const STEPS = 40;

    p.beginShape();
    for (let i = 0; i <= STEPS; i++) {
      const t = (i / STEPS) * this.simTime;
      const phys = getPhysicsAtTime(t, speed, angle, gravity);

      const px = this.ballStartX + metersToPx(phys.x);
      const py = this.ballStartY - metersToPx(phys.y);

      p.vertex(px, py);
    }
    p.endShape();
  }

  private drawBall() {
    const p = this.p;
    p.fill(this.getTheme("ball"));
    p.stroke(this.getTheme("ballBorder"));
    p.strokeWeight(2);
    p.circle(this.ball.x, this.ball.y, CONFIG.BALL_RADIUS);
  }

  private drawHUD() {
    const p = this.p;
    p.fill(this.getTheme("hudText"));
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
      this.getTheme("ball"),
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
