import { useState } from "react";
import PhysicsCanvas from "./components/PhysicsCanvas";
import {
  Card,
  CardContent,
} from "./components/ui/card";
import type { PhysicsState } from "./types/types";
import SliderField from "./components/SliderField";
import NumberInput from "./components/NumberInput";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";
import { FaPause } from "react-icons/fa6";
import AppSelect from "./components/AppSelect";

function App() {
  const [physicsState, setPhysicsState] = useState<PhysicsState>({
    angle: 45,
    speed: 60,
    gravity: 9.8,
    bounciness: 0.8,
    friction: 0.8,
  });

  const setState = (key: string, value: number) => {
    setPhysicsState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-background text-foreground min-h-screen max-w-4xl p-4 sm:p-6 mx-auto">
      <div className="mt-12 flex flex-col gap-6">
        <div className="rounded-lg overflow-hidden relative">
          <PhysicsCanvas physicsState={physicsState} />
          <Button
            className={"absolute top-4 right-4 w-10 h-10"}
            variant={"secondary"}
          >
            <FaPause />
          </Button>
        </div>
        <Card className="overflow-y-auto max-h-80  md:max-h-75 h-full">
          <CardContent>
            <div className="flex flex-col gap-12">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="font-heading text-base leading-snug font-medium">
                    Control Panel
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    This is where you do stuff
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="flex flex-col gap-6">
                    <SliderField
                      htmlFor="speed"
                      labelText="Speed:"
                      max={200}
                      min={0}
                      physicsKey="speed"
                      physicsState={physicsState}
                      setState={setState}
                    />

                    <SliderField
                      htmlFor="launch-angle"
                      labelText="Launch Angle:"
                      max={90}
                      min={0}
                      physicsKey="angle"
                      physicsState={physicsState}
                      setState={setState}
                    />
                  </div>

                  <div className="flex items-start">
                    <div className="flex gap-4">
                      <Label>Gravity:</Label>
                      <NumberInput
                        min={0}
                        max={100}
                        value={physicsState["gravity"]}
                        key={"gravity"}
                        onChange={(v) => setState("gravity", v)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="">
                <div className="flex flex-col gap-6">
                  <div className="flex gap-4">
                    <Label className="text-nowrap">Select Mode</Label>
                    <div className="w-full">
                      <AppSelect
                        items={[
                          { value: "sandbox", label: "Sandbox" },
                          { value: "coordinate", label: "Coordinate Plane" },
                        ]}
                        label="Select Mode"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
