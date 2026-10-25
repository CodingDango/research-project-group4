import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type AppSelectItem = {
  value: string
  label: string
}

export default function AppSelect({ 
  items, 
  label, 
  onChange 
}: { 
  items: AppSelectItem[]
  label: string
  onChange?: (value: string | null) => void // 1. This lets the parent know what was picked
}) {
  const [selectedValue, setSelectedValue] = useState<string | null>(items[0]?.value || null)
  const selectedItem = items.find((item) => item.value === selectedValue)

  return (
    <Select 
      value={selectedValue} 
      onValueChange={(val) => {
        setSelectedValue(val)
        onChange?.(val)
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
  )
}
