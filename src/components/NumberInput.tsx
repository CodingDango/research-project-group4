import { Input } from "./ui/input";

function NumberInput({
  value,
  min,
  max,
  onChange,
  className = "w-13 bg-secondary rounded-lg text-center",
}: {
  className?: string;
  value: number;
  min: number;
  max: number;
  onChange?: (v: number) => void;
}) {
  return (
    <Input
      className={className || "w-13 bg-secondary rounded-lg text-center"}
      type="number"
      value={String(value)}
      min={min}
      max={max}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const clamped = Math.max(min, Math.min(max, Number(raw)));
        onChange?.(clamped);
      }}
    />
  );
}

export default NumberInput;