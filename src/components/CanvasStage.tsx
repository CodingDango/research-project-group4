import PhysicsCanvas from "./simulation/PhysicsCanvas";

import type {
  PhysicsState,
  PhysicsStateSetter,
  PhysicsStatsSetter,
} from "@/types/types";

const CanvasStage = ({
  physicsState,
  setStats,
}: {
  physicsState: PhysicsState;
  setPhysicsState: PhysicsStateSetter;
  setStats: PhysicsStatsSetter;
}) => {


  return (
    <div className="rounded-xl overflow-hidden relative">
      <PhysicsCanvas physicsState={physicsState} setStats={setStats}/>
      {physicsState["isPaused"] && (
        <div className="absolute inset-0 bg-black/50"></div>
      )}
    </div>
  );
};

export default CanvasStage;
