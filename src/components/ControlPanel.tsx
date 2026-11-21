import { Button } from "./ui/button";
import type { PhysicsState, PhysicsStateSetter } from "@/types/types";
import { FaPause, FaPlay } from "react-icons/fa6";
import { RiResetLeftFill as Reset } from "react-icons/ri";
import { AiOutlineZoomIn as ZoomIn, AiOutlineZoomOut as ZoomOut} from "react-icons/ai";

import { Card, CardContent } from "./ui/card";
import { useState } from "react";

const ControlPanel = ({
  physicsState,
  setPhysicsState,
}: {
  physicsState: PhysicsState;
  setPhysicsState: PhysicsStateSetter;
}) => {
  const [isLaunchDisabled, setIsLaunchDisabled] = useState(false);

  const handlePause = () => {
    setPhysicsState("isPaused", !physicsState["isPaused"]);
  };
  const handleReset = () => {
    setPhysicsState("resetBallCount", physicsState["resetBallCount"] + 1);
    setPhysicsState("isPaused", false);
    setIsLaunchDisabled(false);
  };
  const handleLaunch = () => {
    setPhysicsState("launchCount", physicsState["launchCount"] + 1);
    setIsLaunchDisabled(true);
  };
  const handleResetCamera = () => {
    setPhysicsState("resetCameraCount", physicsState["resetCameraCount"] + 1);
    setPhysicsState('zoom', 1);
  };
  const handleZoom = (method: 'decrease' | 'increase') => {
    const change = method == 'decrease' ? -0.1 : 0.1;
    setPhysicsState('zoom', physicsState['zoom'] + change);
  }

  return (
    <Card>
      <CardContent className="grid grid-cols-12 gap-2">
        <Button
          className={"col-span-2 w-full h-10 sm:h-12 rounded-2xl font-semibold"}
          variant={"default"}
          onClick={handleLaunch}
          disabled={isLaunchDisabled}
        >
          Launch
        </Button>
        <Button
          className={" w-full h-10 sm:h-12 rounded-2xl"}
          variant={"secondary"}
          onClick={handlePause}
        >
          {physicsState["isPaused"] ? <FaPlay /> : <FaPause />}
        </Button>
        <Button
          className={"w-full h-10 sm:h-12 rounded-2xl"}
          onClick={handleReset}
          variant={"secondary"}
        >
          <Reset />
        </Button>
        <Button
          className={"col-start-9 w-full h-10 sm:h-12 rounded-2xl"}
          onClick={() => handleZoom('increase')}
          variant={"secondary"}
        >
          <ZoomIn/>
        </Button>
        <Button
          className={"col-start-10 w-full h-10 sm:h-12 rounded-2xl"}
          onClick={() => handleZoom('decrease')}
          variant={"secondary"}
        >
          <ZoomOut className="scale-1.5!"/>
        </Button>
        <Button
          className={"col-start-11 col-span-2 w-full h-10 sm:h-12 rounded-2xl"}
          onClick={handleResetCamera}
          variant={"secondary"}
        >
          Reset Camera
        </Button>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;
