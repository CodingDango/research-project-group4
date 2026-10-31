import { useState } from "react";

import { type PhysicsStats, type PhysicsState, type PhysicsStateSetter } from "./types/types";

import InformationPanel from "./components/InformationPanel";
import CanvasStage from "./components/CanvasStage";
import ControlPanel from "./components/ControlPanel";

function App() {
  const [physicsState, setPhysicsState] = useState<PhysicsState>({
    angle: 45,
    speed: 60,
    gravity: 9.8,
    bounciness: 0.8,
    friction: 0.8,
    isPaused: false,
    mode: "sandbox",
    resetCount: 0,
  });

  const [physicsStats, setPhysicsStats] = useState<PhysicsStats>({
    speed: 0,
    airTime: 0,
    distance: 0,
    maxHeight: 0,
  });

  const setState: PhysicsStateSetter = (key, value) => {
    setPhysicsState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-background text-foreground min-h-screen max-w-4xl p-4 sm:p-6 mx-auto">
      <div className="mt-6 flex flex-col gap-6">
        <CanvasStage physicsState={physicsState} setPhysicsState={setState} setStats={setPhysicsStats}/>
        <InformationPanel stats={physicsStats}/>
        <ControlPanel physicsState={physicsState} setPhysicsState={setState} />
      </div>
    </div>
  );
}

export default App;
