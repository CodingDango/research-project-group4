import { useState } from "react";
import PhysicsCanvas from "./components/PhysicsCanvas";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Label } from "./components/ui/label";
import { Slider } from "./components/ui/slider";
import { Input } from "./components/ui/input";
import type { PhysicsState } from "./types/types";

function App() {
  const [physicsState, setPhysicsState] = useState<PhysicsState>({
    angle: 45,
    speed: 60,
    gravity: 9.8
  });

  const [textState, setTextState] = useState({
    launchAngleText: "0",
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
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <div className="w-full flex justify-between">
                  <Label htmlFor="launch-angle">Launch Angle</Label>
                  <Input
                    className="w-13 bg-secondary rounded-lg text-center"
                    type="number"
                    value={textState["launchAngleText"]}
                    min={0}
                    max={90}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const raw = e.target.value;
                      const clamped = Math.max(0, Math.min(90, Number(raw)));
                      setTextState({ launchAngleText: String(clamped) });
                      setState("angle", clamped);
                    }}
                    onBlur={() =>
                      setTextState({
                        launchAngleText: String(
                          physicsState["angle"],
                        ),
                      })
                    }
                  />
                </div>
                <Slider
                  min={0}
                  max={90}
                  step={1}
                  value={[physicsState["angle"]]}
                  id="launch-angle"
                  onValueChange={(values) => {
                    const newAngle = Array.isArray(values) ? values[0] : values;
                    setPhysicsState((prev) => ({
                      ...prev,
                      angle: newAngle,
                    }));
                    setTextState({ launchAngleText: String(newAngle) });
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-lg overflow-hidden">
          <PhysicsCanvas physicsState={physicsState}/>
        </div>
      </div>
    </div>
  );
}

export default App;
