import type { Theme } from "@/types/types";
import type { Theme as ProviderTheme } from "@/components/providers/theme-provider";

export { cn } from "cn"

export function resolveTheme(preference: ProviderTheme): Theme {
  if (preference === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  }
  return preference;
}