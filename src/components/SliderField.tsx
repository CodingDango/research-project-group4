import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import type { PhysicsState, PhysicsStateSetter } from "@/types/types";
import NumberInput from "./NumberInput";

function SliderField({
  htmlFor,
  labelText,
  min,
  max,
  physicsKey,
  physicsState,
  setState,
}: {
  htmlFor: string;
  labelText: string;
  min: number;
  max: number;
  physicsKey: keyof PhysicsState;
  physicsState: PhysicsState;
  setState: PhysicsStateSetter;
}) {
  const value: number = Number.isFinite(physicsState[physicsKey])
    ? (physicsState[physicsKey] as number)
    : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="w-full flex justify-between">
        <Label htmlFor={htmlFor}>{labelText}</Label>
        <NumberInput
          min={min}
          max={max}
          value={value}
          onChange={(v) => setState(physicsKey, v)}
        />
      </div>
      <Slider
        min={min}
        max={max}
        step={1}
        value={[value]}
        id="launch-angle"
        onValueChange={(values) => {
          const newValue = Array.isArray(values) ? values[0] : values;
          setState(physicsKey, newValue);
        }}
      />
    </div>
  );
}

export default SliderField;
