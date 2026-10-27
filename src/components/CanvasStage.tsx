import PhysicsCanvas from "./PhysicsCanvas";
import { Button } from "./ui/button";
import type { PhysicsState, PhysicsStateSetter } from "@/types/types";
import { FaPause, FaPlay } from "react-icons/fa6";

const CanvasStage = ({
  physicsState,
  setState,
}: {
  physicsState: PhysicsState;
  setState: PhysicsStateSetter;
}) => {
  const onPauseToggle = () => {
    setState("isPaused", !physicsState["isPaused"]);
  };

  return (
    <div className="rounded-xl overflow-hidden relative">
      <PhysicsCanvas physicsState={physicsState} />
      <Button
        className={"absolute top-2 right-2 w-10 h-10 sm:w-12 sm:h-12 rounded-xl"}
        variant={"secondary"}
        onClick={onPauseToggle}
      >
        {physicsState["isPaused"] ? <FaPlay /> : <FaPause />}
      </Button>
    </div>
  );
};

export default CanvasStage;
