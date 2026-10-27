import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type AppSelectItem = {
  value: string;
  label: string;
};

export default function AppSelect({
  items,
  label,
  defaultValue,
  onChange,
}: {
  items: AppSelectItem[];
  label: string;
  defaultValue?: string;
  onChange?: (value: string | undefined) => void; // 1. This lets the parent know what was picked
}) {
  const findItem = (value: string | undefined) =>
    items.find((item) => item?.value == value);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    defaultValue ? findItem(defaultValue)?.value : items[0]?.value,
  );
  const selectedItem = findItem(selectedValue);

  return (
    <Select
      value={selectedValue}
      onValueChange={(val) => {
        setSelectedValue(val || undefined);
        onChange?.(val || undefined);
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select option...">
          {selectedItem?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
