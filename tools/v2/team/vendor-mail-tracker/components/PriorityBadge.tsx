/**
 * PriorityBadge
 *
 * Folder-local priority pill. Uses both color and text so it never relies on
 * color alone — WCAG 1.4.1 compliant. Pure inline styles — no Tailwind
 * dependency so it renders correctly in the standalone preview.
 */
import type { ThreadPriority } from "./types";

interface PriorityBadgeProps {
  priority: ThreadPriority;
  style?: React.CSSProperties;
}

type BadgeTokens = {
  border: string;
  background: string;
  color: string;
  dotColor: string;
};

const tokens: Record<ThreadPriority, BadgeTokens> = {
  low: {
    border: "oklch(0.7 0.01 270 / 0.2)",
    background: "oklch(0.7 0.01 270 / 0.1)",
    color: "oklch(0.82 0.005 270)",
    dotColor: "oklch(0.65 0.01 270)",
  },
  medium: {
    border: "oklch(0.75 0.12 210 / 0.25)",
    background: "oklch(0.75 0.12 210 / 0.1)",
    color: "oklch(0.88 0.08 210)",
    dotColor: "oklch(0.7 0.14 210)",
  },
  high: {
    border: "oklch(0.82 0.15 85 / 0.25)",
    background: "oklch(0.82 0.15 85 / 0.1)",
    color: "oklch(0.9 0.12 85)",
    dotColor: "oklch(0.78 0.16 85)",
  },
  urgent: {
    border: "oklch(0.62 0.2 25 / 0.25)",
    background: "oklch(0.62 0.2 25 / 0.1)",
    color: "oklch(0.82 0.14 25)",
    dotColor: "oklch(0.72 0.2 25)",
  },
};

const labels: Record<ThreadPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function PriorityBadge({ priority, style }: PriorityBadgeProps) {
  const t = tokens[priority];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        borderRadius: "999px",
        border: `1px solid ${t.border}`,
        background: t.background,
        color: t.color,
        padding: "0.125rem 0.5rem",
        fontSize: "0.625rem",
        fontWeight: 500,
        lineHeight: 1,
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: "0.375rem",
          height: "0.375rem",
          borderRadius: "50%",
          background: t.dotColor,
          flexShrink: 0,
        }}
      />
      {labels[priority]}
    </span>
  );
}
