import type { PropsWithChildren } from "react";

import "./Badge.css";

export type BadgeTone = "review" | "success" | "neutral" | "accent";

interface BadgeProps {
  tone: BadgeTone;
}

export function Badge({ children, tone }: PropsWithChildren<BadgeProps>) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
