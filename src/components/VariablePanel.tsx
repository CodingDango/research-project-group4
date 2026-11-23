import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import SliderField from "./SliderField";
import NumberInput from "./NumberInput";
import type {
  PhysicsState,
  PhysicsStateSetter,
} from "@/types/types";

const VariablePanel = ({
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
                Variable Panel
              </h2>
              <p className="text-sm text-muted-foreground">
                This is where you edit variables
              </p>
            </div>
            <div className="grid grid-cols-2 grid-rows-2 gap-8">
              <div className="row-start-1 row-end-1 col-start-1 col-end-1">
                <SliderField
                  htmlFor="speed"
                  labelText="Speed:"
                  max={200}
                  min={0}
                  physicsKey="speed"
                  physicsState={physicsState}
                  setState={setPhysicsState}
                />
              </div>
              <div className="row-start-2 row-end-2 col-start-1 col-end-1">
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

              <div className="row-span-2 grid grid-cols-1 sm:grid-cols-2 ">
                <div>
                  <Label className="w-24 inline-block">Gravity:</Label>
                  <NumberInput
                    min={0}
                    max={100}
                    value={physicsState["gravity"]}
                    key={"gravity"}
                    onChange={(v) => setPhysicsState("gravity", v)}
                  />
                </div>
                <div>
                  <Label className="w-24 inline-block">Initial Height:</Label>
                  <NumberInput
                    min={0}
                    max={100}
                    value={0}
                    key={"gravity"}
                    onChange={(v) => setPhysicsState("gravity", v)}
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

export default VariablePanel;
