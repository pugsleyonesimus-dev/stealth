/**
 * VendorThreadCard
 *
 * Displays a single vendor thread as a selectable card in the tracker list.
 * Interactive controls (flag, open) are keyboard-accessible. The card itself
 * is a button so the whole row is keyboard-reachable. Status and priority
 * information is conveyed via both color AND text (WCAG 1.4.1).
 *
 * Urgency indicator appears when replyDueAt is set and in the past.
 */
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";
import type { VendorThread } from "./types";

interface VendorThreadCardProps {
  thread: VendorThread;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggleFlag: (id: string) => void;
}

/** Format ISO datetime as a readable relative-ish label. */
function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Returns true when the reply deadline has passed. */
function isOverdue(replyDueAt: string | null): boolean {
  if (!replyDueAt) return false;
  return new Date(replyDueAt).getTime() < Date.now();
}

function FlagIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function VendorThreadCard({
  thread,
  isSelected,
  onSelect,
  onToggleFlag,
}: VendorThreadCardProps) {
  const overdue = isOverdue(thread.replyDueAt);

  return (
    <article
      aria-label={`Vendor thread: ${thread.vendor} — ${thread.subject}`}
      aria-current={isSelected ? "true" : undefined}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "0.75rem",
        border: `1px solid ${
          isSelected
            ? "oklch(1 0 0 / 0.2)"
            : thread.flagged
              ? "oklch(0.62 0.2 25 / 0.25)"
              : "oklch(1 0 0 / 0.08)"
        }`,
        background: isSelected
          ? "oklch(1 0 0 / 0.05)"
          : thread.flagged
            ? "oklch(0.62 0.2 25 / 0.04)"
            : "oklch(1 0 0 / 0.02)",
        transition: "border-color 160ms ease, background 160ms ease",
      }}
    >
      {/* Overdue accent stripe */}
      {overdue && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "3px",
            height: "100%",
            background: "oklch(0.62 0.2 25 / 0.7)",
            borderRadius: "3px 0 0 3px",
          }}
        />
      )}

      {/* Main clickable area */}
      <button
        type="button"
        onClick={() => onSelect(thread.id)}
        aria-expanded={isSelected}
        aria-label={`Open thread: ${thread.subject} from ${thread.vendor}`}
        style={{
          display: "block",
          width: "100%",
          textAlign: "left",
          padding: "0.875rem 1rem 0.875rem 1rem",
          paddingLeft: overdue ? "1.25rem" : "1rem",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
        className="glow-ring"
      >
        {/* Row 1: badges + date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexWrap: "wrap" }}>
            <StatusBadge status={thread.status} />
            <PriorityBadge priority={thread.priority} />
            {thread.reviewRequired && (
              <span
                title="Needs human review"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.125rem 0.5rem",
                  borderRadius: "999px",
                  border: "1px solid oklch(0.82 0.15 85 / 0.25)",
                  background: "oklch(0.82 0.15 85 / 0.08)",
                  color: "oklch(0.88 0.12 85)",
                  fontSize: "0.625rem",
                  fontWeight: 500,
                }}
              >
                <WarnIcon />
                Review
              </span>
            )}
          </div>
          <time
            dateTime={thread.lastMessageAt}
            aria-label={`Last message: ${new Date(thread.lastMessageAt).toLocaleDateString()}`}
            style={{
              flexShrink: 0,
              fontSize: "0.6875rem",
              color: "var(--muted-foreground)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatDate(thread.lastMessageAt)}
          </time>
        </div>

        {/* Row 2: vendor name */}
        <p
          style={{
            margin: "0 0 0.25rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--foreground)",
            fontFamily: "var(--font-mail-preview, inherit)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {thread.vendor}
        </p>

        {/* Row 3: subject */}
        <p
          style={{
            margin: "0 0 0.625rem",
            fontSize: "0.75rem",
            color: "var(--muted-foreground)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {thread.subject}
        </p>

        {/* Row 4: footer meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "0.5rem",
            borderTop: "1px solid oklch(1 0 0 / 0.05)",
          }}
        >
          {/* Owner */}
          <span
            style={{
              fontSize: "0.6875rem",
              color:
                thread.owner === "unassigned"
                  ? "var(--muted-foreground)"
                  : "var(--foreground)",
              fontStyle: thread.owner === "unassigned" ? "italic" : "normal",
            }}
          >
            {thread.owner === "unassigned" ? "Unassigned" : thread.owner}
          </span>

          {/* Notes count */}
          {thread.notes.length > 0 && (
            <span
              aria-label={`${thread.notes.length} note${thread.notes.length !== 1 ? "s" : ""}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.6875rem",
                color: "var(--muted-foreground)",
              }}
            >
              <NoteIcon />
              {thread.notes.length}
            </span>
          )}

          {/* Overdue indicator */}
          {overdue && (
            <span
              role="img"
              aria-label="Overdue — reply deadline has passed"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.6875rem",
                color: "oklch(0.78 0.15 25)",
                fontWeight: 500,
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Overdue
            </span>
          )}
        </div>
      </button>

      {/* Flag button — sits outside the main card button to avoid nesting */}
      <button
        type="button"
        aria-label={
          thread.flagged ? `Unflag thread from ${thread.vendor}` : `Flag thread from ${thread.vendor} for review`
        }
        aria-pressed={thread.flagged}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFlag(thread.id);
        }}
        style={{
          position: "absolute",
          top: "0.625rem",
          right: "0.625rem",
          display: "grid",
          placeItems: "center",
          width: "1.625rem",
          height: "1.625rem",
          borderRadius: "0.375rem",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: thread.flagged ? "oklch(0.72 0.2 25)" : "var(--muted-foreground)",
          transition: "background 150ms ease, color 150ms ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "oklch(1 0 0 / 0.06)";
          if (!thread.flagged)
            (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.72 0.2 25)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          if (!thread.flagged)
            (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)";
        }}
        className="glow-ring"
      >
        <FlagIcon filled={thread.flagged} />
      </button>
    </article>
  );
}
