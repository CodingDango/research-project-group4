import { useState } from "react";
import PhysicsCanvas from "./components/PhysicsCanvas";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import type { PhysicsState } from "./types/types";
import SliderField from "./components/SliderField";
import NumberInput from "./components/NumberInput";
import { Label } from "./components/ui/label";

function App() {
  const [physicsState, setPhysicsState] = useState<PhysicsState>({
    angle: 45,
    speed: 60,
    gravity: 9.8,
  });

  const setState = (key: string, value: number) => {
    setPhysicsState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-background text-foreground min-h-screen max-w-4xl p-6 mx-auto">
      <div className="mt-12 flex flex-col gap-6">
        <Card>
          <CardHeader className="">
            <CardTitle>Variable Panel</CardTitle>
            <CardDescription>This is where you edit variables</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <SliderField
                  htmlFor="launch-angle"
                  labelText="Launch Angle"
                  max={90}
                  min={0}
                  physicsKey="angle"
                  physicsState={physicsState}
                  setState={setState}
                />
                <SliderField
                  htmlFor="speed"
                  labelText="Speed"
                  max={200}
                  min={0}
                  physicsKey="speed"
                  physicsState={physicsState}
                  setState={setState}
                />

                <div className="flex gap-4">
                  <Label>Gravity</Label>
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
          </CardContent>
        </Card>

        <div className="rounded-lg overflow-hidden">
          <PhysicsCanvas physicsState={physicsState} />
        </div>
      </div>
    </div>
  );
}

export default App;
