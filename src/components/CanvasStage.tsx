import PhysicsCanvas from "./PhysicsCanvas";
import { Button } from "./ui/button";
import type { PhysicsState, PhysicsStateSetter } from "@/types/types";
import { FaPause, FaPlay } from "react-icons/fa6";
import { RiResetLeftFill as Reset } from "react-icons/ri";

const CanvasStage = ({
  physicsState,
  setState,
}: {
  physicsState: PhysicsState;
  setState: PhysicsStateSetter;
}) => {
  const handlePause = () => {
    setState("isPaused", !physicsState["isPaused"]);
  };
  const handleReset = () => {
    setState("resetCount", physicsState["resetCount"] + 1);
    setState("isPaused", false);
  };

  return (
    <div className="rounded-xl overflow-hidden relative">
      <PhysicsCanvas physicsState={physicsState} />
      {physicsState['isPaused'] && <div className="absolute inset-0 bg-black/50"></div>} 
      <div className="absolute top-2 right-2 flex flex-col gap-2 z-1">
        <Button
          className={"w-10 h-10 sm:w-12 sm:h-12 rounded-xl"}
          variant={"secondary"}
          onClick={handlePause}
        >
          {physicsState["isPaused"] ? <FaPlay /> : <FaPause />}
        </Button>
        <Button
          className={"w-10 h-10 sm:w-12 sm:h-12 rounded-xl"}
          onClick={handleReset}
          variant={"secondary"}
        >
          <Reset />
        </Button>
      </div>
    </div>
  );
};

export default CanvasStage;
