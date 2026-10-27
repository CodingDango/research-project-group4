import PhysicsCanvas from "./PhysicsCanvas";
import { Button } from "./ui/button";
import type { PhysicsState } from "@/types/types";
import { FaPause } from "react-icons/fa6";

const CanvasStage = ({
  physicsState,
}: {
  physicsState: PhysicsState;
  
}) => {
  return (
    <div className="rounded-lg overflow-hidden relative">
      <PhysicsCanvas physicsState={physicsState} />
      <Button
        className={"absolute top-4 right-4 w-10 h-10"}
        variant={"secondary"}
      >
        <FaPause />
      </Button>
    </div>
  );
};

export default CanvasStage;
