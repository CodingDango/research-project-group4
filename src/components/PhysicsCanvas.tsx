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
      const ASPECT = 700 / 400; // keep your original proportions
      const WORLD_W = 700; // your "design" size
      const groundY = 325;
      const startX = 50;
      const startY = groundY - 10;
      const backgroundColor = "#86e6fe";
      const groundStrokeColor = "#0ba42d";
      const groundColor = "#8e3c2e";
      const bounciness = 0.8;
      const dt = 0.08;
      let scale = 1;

      let [x, y] = [startX, startY];
      let [vx, vy] = [0, 0];
      let time = 0;
      let isFiring = false;
      let hasJustFired = false;
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

      p.draw = () => {
        const { angle, speed, gravity } = stateRef.current;

        p.background(backgroundColor);
        p.scale(scale); // everything below is drawn in 700x400 "world" units

        // Ground outline
        p.stroke(groundStrokeColor);
        p.strokeWeight(6);
        p.line(0, groundY, WORLD_W, groundY);

        // Ground itself
        p.fill(groundColor);
        p.noStroke();
        p.rect(0, groundY + 2, WORLD_W, 300);

        // Trajectory
        p.noStroke();
        p.fill(255, 80, 80);

        for (const pt of trail) p.circle(pt.x, pt.y, 3);

        if (hasJustFired) {
          vx = speed * p.cos(angle);
          vy = -speed * p.sin(angle);
          hasJustFired = false;
        }

        if (isFiring) {
          vy += gravity * dt;
          x += vx * dt;
          y = Math.min(startY, (y + vy * dt))
          trail.push({ x, y });

          // handle ground interaction
          if (y >= startY) {
            vy = -vy * bounciness;
          }
        }

        p.fill(255, 80, 80);
        p.stroke("#FFFFFF");
        p.strokeWeight(2);
        p.circle(x, y, 20);
      };

      p.mousePressed = () => {
        if (
          p.mouseX >= 0 &&
          p.mouseX <= p.width &&
          p.mouseY >= 0 &&
          p.mouseY <= p.height
        ) {
          x = startX;
          y = startY;
          time = 0;
          trail = [];
          isFiring = true;
          hasJustFired = true;
        }
      };
    };

    const instance = new p5(sketch, container);
    return () => instance.remove();
  }, []);

  return <div ref={renderRef} className="w-full" />;
}

export default PhysicsCanvas;
