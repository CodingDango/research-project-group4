import p5 from "p5";
import { useEffect, useRef } from "react";
import { SimulationScene } from "@/components/simulation/SimulationScene";
import type { PhysicsState, PhysicsStatsSetter } from "@/types/types";
import { useTheme } from "../providers/theme-provider";
import { resolveTheme } from "@/lib/utils";

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
  const simulationRef = useRef<SimulationScene>(null);
  const { theme } = useTheme();

  useEffect(() => {
    stateRef.current = physicsState;
  }, [physicsState]);

  useEffect(() => {
    setStatsRef.current = setStats;
  }, [setStats]);

  useEffect(() => {
    simulationRef.current?.setTheme(resolveTheme(theme));
  }, [theme]);

  useEffect(() => {
    const container = renderRef.current!;
    if (!container) return;
    container.innerHTML = "";

    let scene: SimulationScene;

    const sketch = (p: p5) => {
      p.setup = () => {
        scene = new SimulationScene(p, stateRef.current);
        simulationRef.current = scene;
        const { w, h } = scene.updateDimensions(container.clientWidth);
        p.createCanvas(w, h);
        p.angleMode(p.DEGREES);
      };

      p.windowResized = () => {
        const { w, h } = scene.updateDimensions(container.clientWidth);
        p.resizeCanvas(w, h);
      };

      p.draw = () => {
        const dt = Math.min(p.deltaTime / 1000, 0.05);
        scene.update(dt, stateRef.current, setStatsRef.current);
        scene.render(stateRef.current);
      };

      p.mousePressed = () => {
        // if (event && (event.target as HTMLElement)?.tagName !== "CANVAS") {
        //   return;
        // }
      };
    };

    const instance = new p5(sketch, container);
    return () => {
      instance.remove();
      container.innerHTML = "";
    };
  }, []);

  return <div ref={renderRef} className="w-full select-none touch-none" />;
}

export default PhysicsCanvas;
