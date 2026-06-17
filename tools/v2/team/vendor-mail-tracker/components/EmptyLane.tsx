/**
 * EmptyLane
 *
 * Shown when no threads match the active filter. Provides a clear message and
 * optional action so users are never stranded. Fully self-contained — no main
 * app imports.
 */
import type { StatusFilter } from "./types";

interface EmptyLaneProps {
  activeFilter: StatusFilter;
  onClearFilter: () => void;
}

function InboxIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12H16l-2 3H10l-2-3H2" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </svg>
  );
}

const messages: Record<StatusFilter, { title: string; description: string }> = {
  all: {
    title: "No vendor threads yet",
    description:
      "When vendor emails arrive, they will appear here. Add your first thread to get started.",
  },
  new: {
    title: "No new threads",
    description: "All new inbound vendor threads have been triaged.",
  },
  active: {
    title: "Nothing active right now",
    description:
      "Threads you are actively working on will appear here. Triage a new thread to start.",
  },
  "awaiting-reply": {
    title: "No threads awaiting reply",
    description: "Threads waiting for a vendor response will appear here.",
  },
  resolved: {
    title: "No resolved threads",
    description: "Threads you have closed and completed will appear here.",
  },
  archived: {
    title: "Archive is empty",
    description: "Archived threads are kept here for reference.",
  },
};

export function EmptyLane({ activeFilter, onClearFilter }: EmptyLaneProps) {
  const { title, description } = messages[activeFilter];
  const showClear = activeFilter !== "all";

  return (
    <div
      role="status"
      aria-label={title}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "3rem 1.5rem",
        gap: "0",
      }}
    >
      {/* Icon tile — mirrors design system EmptyState glass-tile pattern */}
      <div
        aria-hidden="true"
        style={{
          marginBottom: "1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "3.5rem",
          height: "3.5rem",
          borderRadius: "1rem",
          border: "1px solid oklch(1 0 0 / 0.14)",
          background:
            "linear-gradient(135deg, oklch(1 0 0 / 0.08), oklch(1 0 0 / 0.015) 60%, oklch(1 0 0 / 0.04)), oklch(0.14 0.005 270 / 0.48)",
          backdropFilter: "blur(28px) saturate(180%)",
          color: "var(--muted-foreground)",
        }}
      >
        <InboxIcon />
      </div>

      <h2
        style={{
          fontFamily: "var(--font-mail-preview, inherit)",
          fontSize: "1.125rem",
          fontWeight: 600,
          color: "var(--foreground)",
          margin: "0 0 0.5rem",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          fontSize: "0.8125rem",
          lineHeight: "1.6",
          color: "var(--muted-foreground)",
          maxWidth: "22rem",
          margin: "0",
        }}
      >
        {description}
      </p>

      {showClear && (
        <button
          type="button"
          onClick={onClearFilter}
          style={{
            marginTop: "1.25rem",
            padding: "0.5rem 1rem",
            borderRadius: "0.625rem",
            border: "1px solid oklch(1 0 0 / 0.1)",
            background: "oklch(1 0 0 / 0.04)",
            color: "var(--foreground)",
            fontSize: "0.8125rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 150ms ease",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "oklch(1 0 0 / 0.08)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "oklch(1 0 0 / 0.04)")
          }
          className="glow-ring"
        >
          View all threads
        </button>
      )}
    </div>
  );
}
