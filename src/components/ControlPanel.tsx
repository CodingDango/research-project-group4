import { Button } from "./ui/button";
import type { PhysicsState, PhysicsStateSetter } from "@/types/types";
import { FaPause, FaPlay } from "react-icons/fa6";
import { RiResetLeftFill as Reset } from "react-icons/ri";
import { Card, CardContent } from "./ui/card";
import { useState } from "react";

const ControlPanel = ({
  physicsState,
  setPhysicsState,
}: {
  physicsState: PhysicsState;
  setPhysicsState: PhysicsStateSetter;
}) => {
  const [isLaunchDisabled, setIsLaunchDisabled] = useState(false)

  const handlePause = () => {
    setPhysicsState("isPaused", !physicsState["isPaused"]);
  };
  const handleReset = () => {
    setPhysicsState("resetCount", physicsState["resetCount"] + 1);
    setPhysicsState("isPaused", false);
    setIsLaunchDisabled(false);
  };
  const handleLaunch = () => {{
    setPhysicsState('launchCount', physicsState['launchCount'] + 1);
    setIsLaunchDisabled(true);
  }}

  return (
    <Card>
      <CardContent className="grid grid-cols-10 gap-2">
        <Button
          className={"col-span-2 w-full h-10 sm:h-12 rounded-2xl font-semibold"}
          variant={'default'}
          onClick={handleLaunch}
          disabled={isLaunchDisabled}
        >
          Launch
        </Button>
        <Button
          className={" w-full h-10 sm:h-12 rounded-2xl"}
          variant={'secondary'}
          onClick={handlePause}
        >
          {physicsState["isPaused"] ?  <FaPlay /> : <FaPause />  }
        </Button>
        <Button
          className={"w-full h-10 sm:h-12 rounded-2xl"}
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
