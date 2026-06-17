/**
 * StatusBadge
 *
 * Folder-local status pill. Uses icon + text — never color alone (WCAG 1.4.1).
 * Pure inline styles — no Tailwind dependency so it renders correctly in the
 * standalone preview.
 */
import type { ThreadStatus } from "./types";

interface StatusBadgeProps {
  status: ThreadStatus;
  style?: React.CSSProperties;
}

type BadgeTokens = {
  border: string;
  background: string;
  color: string;
};

const tokens: Record<ThreadStatus, BadgeTokens> = {
  new: {
    border: "oklch(0.72 0.12 270 / 0.25)",
    background: "oklch(0.72 0.12 270 / 0.1)",
    color: "oklch(0.85 0.1 270)",
  },
  active: {
    border: "oklch(0.75 0.15 145 / 0.25)",
    background: "oklch(0.75 0.15 145 / 0.1)",
    color: "oklch(0.85 0.12 145)",
  },
  "awaiting-reply": {
    border: "oklch(0.82 0.15 85 / 0.25)",
    background: "oklch(0.82 0.15 85 / 0.1)",
    color: "oklch(0.9 0.12 85)",
  },
  resolved: {
    border: "oklch(0.75 0.1 210 / 0.25)",
    background: "oklch(0.75 0.1 210 / 0.1)",
    color: "oklch(0.86 0.08 210)",
  },
  archived: {
    border: "oklch(0.7 0.01 270 / 0.2)",
    background: "oklch(0.7 0.01 270 / 0.08)",
    color: "oklch(0.65 0.01 270)",
  },
};

// ─── Inline SVG icons — zero external dependencies ───────────────────────────

function IconNew() {
  return (
    <svg width="9" height="9" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="8" cy="8" r="2" fill="currentColor" />
    </svg>
  );
}

function IconActive() {
  return (
    <svg width="9" height="9" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 5v3l2 1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconAwaiting() {
  return (
    <svg width="9" height="9" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path
        d="M2 8h10M9 5l3 3-3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconResolved() {
  return (
    <svg width="9" height="9" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path
        d="M3 8l3.5 3.5 6.5-7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconArchived() {
  return (
    <svg width="9" height="9" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <rect x="2" y="5" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="2" />
      <path d="M1 5h14M6 9h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const icons: Record<ThreadStatus, () => JSX.Element> = {
  new: IconNew,
  active: IconActive,
  "awaiting-reply": IconAwaiting,
  resolved: IconResolved,
  archived: IconArchived,
};

const labels: Record<ThreadStatus, string> = {
  new: "New",
  active: "Active",
  "awaiting-reply": "Awaiting Reply",
  resolved: "Resolved",
  archived: "Archived",
};

export function StatusBadge({ status, style }: StatusBadgeProps) {
  const t = tokens[status];
  const Icon = icons[status];
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
      <Icon />
      {labels[status]}
    </span>
  );
}
