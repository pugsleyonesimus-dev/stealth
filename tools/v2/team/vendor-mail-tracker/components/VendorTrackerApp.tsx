/**
 * VendorTrackerApp
 *
 * Root shell for the Vendor Mail Tracker tool.
 * Orchestrates state via useVendorTracker, renders the layout, and mounts all
 * sub-components. This component is NOT registered in the main app — it is the
 * entry point for the folder-local preview page only.
 *
 * Layout:
 *   ┌─────────────────────────────────┐
 *   │  Header (title, stats)           │
 *   ├─────────────────────────────────┤
 *   │  StatusFilter tabs               │
 *   ├─────────────────────────────────┤
 *   │  Thread list                     │
 *   │    · LoadingShell                │
 *   │    · ErrorBanner                 │
 *   │    · VendorThreadCard × N        │
 *   │    · EmptyLane                   │
 *   └─────────────────────────────────┘
 *   ThreadDetailPanel (fixed side panel, overlay)
 *   FeedbackToastViewport (fixed bottom)
 */
import { useRef } from "react";
import { useVendorTracker } from "../hooks/useVendorTracker";
import { useFeedbackToast, FeedbackToastViewport } from "./FeedbackToast";
import { StatusFilter } from "./StatusFilter";
import { VendorThreadCard } from "./VendorThreadCard";
import { ThreadDetailPanel } from "./ThreadDetailPanel";
import { LoadingShell } from "./LoadingShell";
import { ErrorBanner } from "./ErrorBanner";
import { EmptyLane } from "./EmptyLane";
import type { ThreadNote, ThreadStatus } from "./types";

// ─── Mini stat badge ──────────────────────────────────────────────────────────

function StatBadge({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.125rem",
        padding: "0.5rem 0.875rem",
        borderRadius: "0.625rem",
        border: "1px solid oklch(1 0 0 / 0.07)",
        background: "oklch(1 0 0 / 0.03)",
        minWidth: "3.5rem",
      }}
    >
      <span
        style={{
          fontSize: "1.125rem",
          fontWeight: 700,
          lineHeight: 1,
          color: accent ?? "var(--foreground)",
          fontFamily: "var(--font-mail-preview, inherit)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: "0.5625rem",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--muted-foreground)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export function VendorTrackerApp() {
  const tracker = useVendorTracker();
  const toast = useFeedbackToast();

  // Ref used to return focus to the selected card after the panel closes
  const lastSelectedRef = useRef<HTMLElement | null>(null);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalNew = tracker.threads.filter((t) => t.status === "new").length;
  const totalFlagged = tracker.threads.filter((t) => t.flagged).length;
  const totalOverdue = tracker.threads.filter(
    (t) => t.replyDueAt && new Date(t.replyDueAt) < new Date(),
  ).length;

  // ── Wrapped actions with feedback ─────────────────────────────────────────

  function handleStatusChange(threadId: string, status: ThreadStatus) {
    tracker.setStatus(threadId, status);
    toast.notify(`Status updated to "${status.replace("-", " ")}"`, "success");
  }

  function handleOwnerChange(threadId: string, owner: string) {
    tracker.setOwner(threadId, owner);
    const label = owner === "unassigned" ? "Unassigned" : owner;
    toast.notify(`Assigned to ${label}`, "success");
  }

  function handleToggleFlag(threadId: string) {
    const thread = tracker.threads.find((t) => t.id === threadId);
    tracker.toggleFlag(threadId);
    toast.notify(
      thread?.flagged ? "Flag removed" : "Thread flagged for review",
      thread?.flagged ? "neutral" : "warning",
    );
  }

  function handleAddNote(threadId: string, note: ThreadNote) {
    tracker.addNote(threadId, note);
    toast.notify("Note saved", "success");
  }

  function handleDeleteNote(threadId: string, noteId: string) {
    tracker.deleteNote(threadId, noteId);
    toast.notify("Note deleted", "neutral");
  }

  function handleSelectThread(id: string) {
    tracker.selectThread(id);
  }

  function handleClosePanel() {
    tracker.selectThread(null);
    // Focus returns to the card via triggerRef inside ThreadDetailPanel
  }

  return (
    <div
      id="vmt-root"
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 600px at 10% -10%, oklch(0.45 0.02 270 / 0.35), transparent 60%), " +
          "radial-gradient(900px 500px at 90% 10%, oklch(0.4 0.015 240 / 0.3), transparent 60%), " +
          "radial-gradient(700px 500px at 50% 110%, oklch(0.35 0.015 280 / 0.35), transparent 60%), " +
          "oklch(0.18 0.005 270)",
        color: "var(--foreground)",
        fontFamily: "var(--font-interface, Inter, system-ui, sans-serif)",
        fontFeatureSettings: '"cv11", "ss01", "ss03"',
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Skip-to-content link for keyboard users */}
      <a
        href="#vmt-thread-list"
        style={{
          position: "absolute",
          top: "-2.5rem",
          left: "1rem",
          padding: "0.5rem 0.875rem",
          borderRadius: "0 0 0.5rem 0.5rem",
          background: "var(--foreground)",
          color: "var(--background)",
          fontSize: "0.75rem",
          fontWeight: 600,
          zIndex: 9999,
          textDecoration: "none",
          transition: "top 120ms ease",
        }}
        onFocus={(e) => ((e.currentTarget as HTMLAnchorElement).style.top = "0")}
        onBlur={(e) => ((e.currentTarget as HTMLAnchorElement).style.top = "-2.5rem")}
      >
        Skip to thread list
      </a>

      {/* ── Outer container ─────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: "42rem",
          margin: "0 auto",
          padding: "2rem 1rem 6rem",
        }}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 0.25rem",
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "var(--muted-foreground)",
                }}
              >
                Team Tool · V2
              </p>
              <h1
                style={{
                  margin: 0,
                  fontSize: "1.375rem",
                  fontWeight: 700,
                  color: "var(--foreground)",
                  fontFamily: "var(--font-mail-preview, inherit)",
                  letterSpacing: "-0.01em",
                }}
              >
                Vendor Mail Tracker
              </h1>
              <p
                style={{
                  margin: "0.375rem 0 0",
                  fontSize: "0.8125rem",
                  color: "var(--muted-foreground)",
                }}
              >
                Track and triage incoming vendor email threads.
              </p>
            </div>

            {/* Stats row — only rendered when data is loaded */}
            {tracker.loadState === "ready" && (
              <div
                role="group"
                aria-label="Thread summary stats"
                style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
              >
                <StatBadge label="Total" value={tracker.threads.length} />
                {totalNew > 0 && (
                  <StatBadge
                    label="New"
                    value={totalNew}
                    accent="oklch(0.82 0.12 270)"
                  />
                )}
                {totalFlagged > 0 && (
                  <StatBadge
                    label="Flagged"
                    value={totalFlagged}
                    accent="oklch(0.78 0.15 25)"
                  />
                )}
                {totalOverdue > 0 && (
                  <StatBadge
                    label="Overdue"
                    value={totalOverdue}
                    accent="oklch(0.72 0.2 25)"
                  />
                )}
              </div>
            )}
          </div>
        </header>

        {/* ── Filter tabs ─────────────────────────────────────────────────── */}
        {tracker.loadState === "ready" && (
          <div style={{ marginBottom: "1rem" }}>
            <StatusFilter
              active={tracker.activeFilter}
              threads={tracker.threads}
              onChange={tracker.setActiveFilter}
            />
          </div>
        )}

        {/* ── Main thread list ────────────────────────────────────────────── */}
        <main
          id="vmt-thread-list"
          aria-label="Vendor thread list"
          aria-live="polite"
          aria-busy={tracker.loadState === "loading"}
        >
          {/* Loading */}
          {tracker.loadState === "loading" && <LoadingShell />}

          {/* Error */}
          {tracker.loadState === "error" && (
            <ErrorBanner message={tracker.errorMessage} onRetry={tracker.retry} />
          )}

          {/* Thread list */}
          {tracker.loadState === "ready" && (
            <>
              {tracker.filteredThreads.length === 0 ? (
                <EmptyLane
                  activeFilter={tracker.activeFilter}
                  onClearFilter={() => tracker.setActiveFilter("all")}
                />
              ) : (
                <ul
                  role="list"
                  aria-label={`${tracker.filteredThreads.length} vendor thread${tracker.filteredThreads.length !== 1 ? "s" : ""}`}
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {tracker.filteredThreads.map((thread) => (
                    <li key={thread.id}>
                      <VendorThreadCard
                        thread={thread}
                        isSelected={tracker.selectedThreadId === thread.id}
                        onSelect={(id) => {
                          // Capture the card element as the focus return target
                          lastSelectedRef.current =
                            document.querySelector(
                              `[aria-label^="Vendor thread: ${thread.vendor}"]`,
                            ) ?? null;
                          handleSelectThread(id);
                        }}
                        onToggleFlag={handleToggleFlag}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Side panel ──────────────────────────────────────────────────────── */}
      <ThreadDetailPanel
        thread={tracker.selectedThread}
        onClose={handleClosePanel}
        onStatusChange={handleStatusChange}
        onOwnerChange={handleOwnerChange}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
        triggerRef={lastSelectedRef as React.RefObject<HTMLElement | null>}
      />

      {/* ── Feedback toasts ─────────────────────────────────────────────────── */}
      <FeedbackToastViewport items={toast.items} onDismiss={toast.dismiss} />
    </div>
  );
}
