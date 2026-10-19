import { useEffect, useRef } from 'react';
import p5 from 'p5';

function PhysicsCanvas() {
  const renderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = renderRef.current!;

    const sketch = (p: p5) => {
      const ASPECT = 700 / 400;          // keep your original proportions
      const WORLD_W = 700;               // your "design" size
      let scale = 1;

      let x = 50, y = 350;
      const angle = 45, speed = 60, gravity = 9.8;
      let time = 0;
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

      p.draw = () => {
        p.background(30);
        p.scale(scale);   // everything below is drawn in 700x400 "world" units

        p.stroke(80);
        p.strokeWeight(2);
        p.line(0, 350, 700, 350);

        p.noStroke();
        p.fill(0, 200, 255, 150);
        for (const pt of trail) p.circle(pt.x, pt.y, 3);

        if (isFiring) {
          const vx = speed * p.cos(angle);
          const vy = speed * p.sin(angle);
          x = 50 + vx * time;
          y = 350 - (vy * time - 0.5 * gravity * time * time);
          trail.push({ x, y });
          time += 0.08;
          if (y >= 350 && time > 0.5) {
            y = 350;
            isFiring = false;
          }
        }

        p.fill(255, 80, 80);
        p.circle(x, y, 20);

        p.fill(200);
        p.textSize(16);
        p.text('Click anywhere on the screen to LAUNCH!', 20, 30);
      };

      p.mousePressed = () => {
        x = 50; y = 350; time = 0; trail = []; isFiring = true;
      };
    };

    const instance = new p5(sketch, container);
    return () => instance.remove();
  }, []);

  return <div ref={renderRef} className="w-full" />;
}

export default PhysicsCanvas;