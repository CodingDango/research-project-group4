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
      const WORLD_W = 700; // your "design" size
      const groundY = 350;
      const startX = 50;
      const startY = groundY - 10;
      const backgroundColor = "#86e6fe";
      const groundStrokeColor = "#0ba42d";
      const groundColor = "#8e3c2e";
      const bounciness = 0.8;
      const dt = 0.08;
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

      // p5 calls this automatically when the window resizes
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

      p.draw = () => {
        const { gravity } = stateRef.current;

        // Camera
        const cameraX = Math.max(0, ballX - WORLD_W * 0.4);
        p.translate(-cameraX, 0);

        // background
        p.background(backgroundColor);
        p.scale(scale); // everything below is drawn in 700x400 "world" units
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

        p.fill(255, 80, 80);
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
