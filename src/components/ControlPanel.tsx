import { Button } from "./ui/button";
import type { PhysicsState, PhysicsStateSetter } from "@/types/types";
import { FaPause, FaPlay } from "react-icons/fa6";
import { RiResetLeftFill as Reset } from "react-icons/ri";
import { Card, CardContent } from "./ui/card";


const ControlPanel = ({
  physicsState,
  setPhysicsState,
}: {
  physicsState: PhysicsState;
  setPhysicsState: PhysicsStateSetter;
}) => {
  const handlePause = () => {
    setPhysicsState("isPaused", !physicsState["isPaused"]);
  };
  const handleReset = () => {
    setPhysicsState("resetCount", physicsState["resetCount"] + 1);
    setPhysicsState("isPaused", false);
  };

  return (
    <Card >
      <CardContent className="flex flex-row-reverse gap-2">
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
      
      </CardContent>
    </Card>
  );
};

export default ControlPanel;
