import { useEffect, useRef } from "react";
import type { PhysicsState } from "@/types/types";
import p5 from "p5";

function PhysicsCanvas({ physicsState }: { physicsState: PhysicsState }) {
  const renderRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(physicsState);

  useEffect(() => {
    stateRef.current = physicsState;
  }, [physicsState]);

  useEffect(() => {
    const container = renderRef.current!;

    const sketch = (p: p5) => {
      const ASPECT = 800 / 500; // keep your original proportions
      const WORLD_W = 750; // your "design" size
      const groundY = 350;
      const startX = 50;
      const startY = groundY - 10;
      const backgroundColor = "#86e6fe";
      const groundStrokeColor = "#0ba42d";
      const groundColor = "#8e3c2e";
      const bounciness = 0.8;
      const simSpeed = 5;

      let scale = 1;
      let [ballX, ballY] = [startX, startY];
      let [ballVx, ballVy] = [0, 0];
      let isFiring = false;
      let trail: { x: number; y: number }[] = [];

      const getSize = () => {
        const w = container.clientWidth;
        return { w, h: w / ASPECT };
      };

      p.setup = () => {
        const { w, h } = getSize();
        p.createCanvas(w, h);
        p.angleMode(p.DEGREES);
        scale = w / WORLD_W;
      };

      p.windowResized = () => {
        const { w, h } = getSize();
        p.resizeCanvas(w, h);
        scale = w / WORLD_W;
      };

      function cloud(cx: number, cy: number) {
        p.noStroke();
        p.fill(255);
        p.rect(cx - 60, cy, 120, 45, 30); // wide bottom pill
        p.circle(cx, cy, 50); // smaller pill on top
      }

      function arrow(
        x1: number,
        y1: number,
        dx: number,
        dy: number,
        color: string,
      ) {
        const len = Math.hypot(dx, dy);
        if (len < 1) return; // nothing to draw

        const x2 = x1 + dx;
        const y2 = y1 + dy;
        const head = Math.min(len * 0.4, 20); // arrowhead grows with the arrow, up to a limit

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

      p.draw = () => {
        p.clear();
        const { gravity } = stateRef.current;
        const dt = Math.min(p.deltaTime / 1000, 0.05) * simSpeed;

        if (isFiring) {
          ballVy += gravity * dt;
          ballX += ballVx * dt;
          ballY = Math.min(startY, ballY + ballVy * dt);
          trail.push({ x: ballX, y: ballY });

          // handle ground interaction
          if (ballY >= startY) {
            ballVy = -ballVy * bounciness;
          }
        }

        // Camera
        const cameraX = Math.max(0, ballX - WORLD_W * 0.4);
        p.scale(scale);
        p.translate(-cameraX, 0);

        // background
        p.background(backgroundColor);
        cloud(100, 50);

        // Ground outline
        p.stroke(groundStrokeColor);
        p.strokeWeight(6);
        p.line(0, groundY, 999999, groundY); // using a big ass number

        // Ground itself
        p.fill(groundColor);
        p.noStroke();
        p.rect(0, groundY + 2, 999999, 300);

        // Trajectory
        p.noStroke();
        p.fill(255, 80, 80);
        for (const pt of trail) p.circle(pt.x, pt.y, 3);

        const k = 1;

        // Total velocity (red)
        arrow(ballX, ballY, ballVx * k, ballVy * k, "#FF5050");

        // Horizontal part (green): only x, no y
        // arrow(ballX, ballY, ballVx * k, 0, "#78c916");

        // Vertical part (blue): no x, only y
        // arrow(ballX, ballY, 0, ballVy * k, "#4aa8ff");

        // Ball
        p.fill("#FF5050");
        p.stroke("#FFFFFF");
        p.strokeWeight(2);
        p.circle(ballX, ballY, 20);
      };

      p.mousePressed = () => {
        if (
          p.mouseX >= 0 &&
          p.mouseX <= p.width &&
          p.mouseY >= 0 &&
          p.mouseY <= p.height
        ) {
          const { speed, angle } = stateRef.current;
          ballX = startX;
          ballY = startY;
          ballVx = speed * p.cos(angle);
          ballVy = -speed * p.sin(angle);
          trail = [];
          isFiring = true;
        }
      };
    };

    const instance = new p5(sketch, container);
    return () => instance.remove();
  }, []);

  return <div ref={renderRef} className="w-full" />;
}

export default PhysicsCanvas;
