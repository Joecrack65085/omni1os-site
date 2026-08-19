// src/lib/themePresets.ts
// Predefined theme options a school can pick at registration instead of
// (or in addition to) the auto palette pulled from their logo.
export const THEME_PRESETS = [
  { id: "signature", label: "Omni Signature", colors: ["#E1007F", "#8B5CF6", "#4F8EF7"] },
  { id: "ocean", label: "Ocean", colors: ["#0891B2", "#0369A1", "#0F172A"] },
  { id: "forest", label: "Forest", colors: ["#15803D", "#166534", "#052E16"] },
  { id: "sunrise", label: "Sunrise", colors: ["#F97316", "#EA580C", "#7C2D12"] },
  { id: "royal", label: "Royal", colors: ["#4338CA", "#3730A3", "#1E1B4B"] },
  { id: "crimson", label: "Crimson", colors: ["#DC2626", "#991B1B", "#450A0A"] },
] as const;

export type ThemePresetId = (typeof THEME_PRESETS)[number]["id"];
