import { useState } from "react";

import {
  type PhysicsStats,
  type PhysicsState,
  type PhysicsStateSetter,
} from "../types/types";

import InformationPanel from "./InformationPanel";
import CanvasStage from "./CanvasStage";
import VariablePanel from "./VariablePanel";
import ControlPanel from "./ControlPanel";

function CoordinateApp() {
  const [physicsState, setPhysicsState] = useState<PhysicsState>({
    angle: 45,
    speed: 60,
    gravity: 9.8,
    bounciness: 0.8,
    friction: 0.8,
    isPaused: false,
    mode: "coordinate",
    resetBallCount: 0,
    launchCount: 0,
    resetCameraCount: 0,
    zoom: 1,
  });

  const [physicsStats, setPhysicsStats] = useState<PhysicsStats>({
    velocity: 0,
    airTime: 0,
    range: 0,
    maxHeight: 0,
  });

  const setState: PhysicsStateSetter = (key, value) => {
    setPhysicsState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-4xl p-4 my-8 sm:p-6 mx-auto">
      <div className="flex flex-col gap-6">
        <ControlPanel setPhysicsState={setState} physicsState={physicsState} />
        <div className="border rounded-2xl">
          <CanvasStage
            physicsState={physicsState}
            setPhysicsState={setState}
            setStats={setPhysicsStats}
          />
        </div>
        <InformationPanel stats={physicsStats} />

        <VariablePanel physicsState={physicsState} setPhysicsState={setState} />
      </div>
    </div>
  );
}

export default CoordinateApp;
