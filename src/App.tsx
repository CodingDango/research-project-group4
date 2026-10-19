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

function App() {
  const [physicsVariables, setPhysicsVariables] = useState({
    launchAngle: 0,
    velocityX: 0,
    velocityY: 0,
  });

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
                  <span className="py-2 px-4 bg-secondary rounded-lg">{physicsVariables['launchAngle']}°</span>
                </div>
                <Slider
                  min={0}
                  max={360}
                  defaultValue={physicsVariables["launchAngle"]}
                  id="launch-angle"
                  onValueChange={(values) =>
                    setPhysicsVariables(prev => ({
                      ...prev,
                      launchAngle: Array.isArray(values) ? values[0] : values
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-lg overflow-hidden">
          <PhysicsCanvas />
        </div>
      </div>
    </div>
  );
}

export default App;
