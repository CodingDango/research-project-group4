import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import SliderField from "./SliderField";
import NumberInput from "./NumberInput";
import AppSelect from "./AppSelect";
import type { PhysicsState, PhysicsStateSetter } from "@/types/types";

const ControlPanel = ({
  physicsState,
  setPhysicsState,
}: {
  physicsState: PhysicsState;
  setPhysicsState: PhysicsStateSetter;
}) => {
  return (
    <Card className="h-full">
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
                  setState={setPhysicsState}
                />

                <SliderField
                  htmlFor="launch-angle"
                  labelText="Launch Angle:"
                  max={90}
                  min={0}
                  physicsKey="angle"
                  physicsState={physicsState}
                  setState={setPhysicsState}
                />
              </div>

              <div className="flex items-start">
                <div className="w-full sm:w-auto flex justify-between gap-4">
                  <Label>Gravity:</Label>
                  <NumberInput
                    min={0}
                    max={100}
                    value={physicsState["gravity"]}
                    key={"gravity"}
                    onChange={(v) => setPhysicsState("gravity", v)}
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
                    defaultValue={physicsState["mode"]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;
