export const iconNames = [
  "book-open",
  "chevrons-up-down",
  "layout-dashboard",
  "files",
  "database",
  "chart-no-axes-combined",
  "clipboard-check",
  "users",
  "settings",
  "chevron-down",
  "chevron-right",
  "search",
  "bell",
  "plus",
  "layers",
] as const;

export type IconName = (typeof iconNames)[number];
export type IconSize = 12 | 14 | 16 | 18 | 20 | 22 | 26 | 30;
export type IconTone = "default" | "accent";
