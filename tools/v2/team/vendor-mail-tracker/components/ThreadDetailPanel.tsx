/**
 * ThreadDetailPanel
 *
 * Slide-in side panel showing thread details and a follow-up note editor.
 * Accessibility:
 *  - role="dialog" with aria-modal and aria-labelledby
 *  - Focus is moved into the panel on open; returns to the trigger on close
 *  - Escape key closes the panel
 *  - All interactive controls have explicit labels
 *  - Respects prefers-reduced-motion for entrance animation
 */
import { useEffect, useRef, useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { STATUS_META, TEAM_MEMBERS } from "./types";
import type { ThreadNote, ThreadStatus, VendorThread } from "./types";

interface ThreadDetailPanelProps {
  thread: VendorThread | null;
  onClose: () => void;
  onStatusChange: (threadId: string, status: ThreadStatus) => void;
  onOwnerChange: (threadId: string, owner: string) => void;
  onAddNote: (threadId: string, note: ThreadNote) => void;
  onDeleteNote: (threadId: string, noteId: string) => void;
  /** Used to return focus to trigger button on close. */
  triggerRef?: React.RefObject<HTMLElement | null>;
}

const STATUSES: ThreadStatus[] = ["new", "active", "awaiting-reply", "resolved", "archived"];

function CloseIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    >
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.625rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--muted-foreground)",
  marginBottom: "0.375rem",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  borderRadius: "0.625rem",
  border: "1px solid oklch(1 0 0 / 0.1)",
  background: "oklch(1 0 0 / 0.04)",
  color: "var(--foreground)",
  fontSize: "0.8125rem",
  cursor: "pointer",
  outline: "none",
  appearance: "none",
  WebkitAppearance: "none",
};

export function ThreadDetailPanel({
  thread,
  onClose,
  onStatusChange,
  onOwnerChange,
  onAddNote,
  onDeleteNote,
  triggerRef,
}: ThreadDetailPanelProps) {
  const [noteBody, setNoteBody] = useState("");
  const [noteError, setNoteError] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = "vmt-panel-title";

  // Move focus into panel when it opens
  useEffect(() => {
    if (thread) {
      setNoteBody("");
      setNoteError("");
      // Small delay so the entrance animation doesn't fight focus
      const t = setTimeout(() => closeBtnRef.current?.focus(), 80);
      return () => clearTimeout(t);
    } else {
      // Return focus to trigger when panel closes
      if (triggerRef?.current) {
        (triggerRef.current as HTMLElement).focus();
      }
    }
  }, [thread, triggerRef]);

  // Escape closes the panel
  useEffect(() => {
    if (!thread) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [thread, onClose]);

  // Focus trap — keep focus inside the panel while it is open.
  // Re-queries focusable elements on every Tab keypress so newly added notes
  // are included without stale closure captures.
  useEffect(() => {
    if (!thread || !panelRef.current) return;
    const panel = panelRef.current;

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.closest('[aria-hidden="true"]'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [thread]);

  function handleAddNote() {
    if (!thread) return;
    const trimmed = noteBody.trim();
    if (!trimmed) {
      setNoteError("Note cannot be empty.");
      return;
    }
    const note: ThreadNote = {
      id: `note-${Date.now()}`,
      author: "You",
      body: trimmed,
      createdAt: new Date().toISOString(),
    };
    onAddNote(thread.id, note);
    setNoteBody("");
    setNoteError("");
  }

  const isOpen = thread !== null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          aria-hidden="true"
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            background: "oklch(0 0 0 / 0.55)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            animation: "vmt-fade-in 0.18s ease both",
          }}
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        id="vmt-detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!isOpen}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          width: "min(26rem, 100vw)",
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(120% 80% at 12% 0%, oklch(1 0 0 / 0.07), transparent 55%), " +
            "radial-gradient(110% 90% at 100% 100%, oklch(0.4 0.01 270 / 0.18), transparent 60%), " +
            "linear-gradient(155deg, oklch(0.18 0.005 270 / 0.96), oklch(0.12 0.005 270 / 0.98))",
          backdropFilter: "blur(36px) saturate(180%)",
          WebkitBackdropFilter: "blur(36px) saturate(180%)",
          borderLeft: "1px solid oklch(1 0 0 / 0.1)",
          boxShadow:
            "-28px 0 60px -18px oklch(0 0 0 / 0.65), inset 1px 0 0 oklch(1 0 0 / 0.08)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1)",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "oklch(1 0 0 / 0.1) transparent",
        }}
      >
        {thread && (
          <>
            {/* ── Header ────────────────────────────────────────────────── */}
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "0.75rem",
                padding: "1.25rem 1.25rem 1rem",
                borderBottom: "1px solid oklch(1 0 0 / 0.07)",
                background: "oklch(0.15 0.005 270 / 0.85)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
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
                  Vendor Thread
                </p>
                <h2
                  id={titleId}
                  style={{
                    margin: "0 0 0.375rem",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontFamily: "var(--font-mail-preview, inherit)",
                  }}
                >
                  {thread.vendor}
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.6875rem",
                    color: "var(--muted-foreground)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontFamily: "monospace",
                  }}
                >
                  {thread.vendorAddress}
                </p>
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                aria-label="Close thread detail panel"
                onClick={onClose}
                style={{
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  background: "oklch(1 0 0 / 0.05)",
                  color: "var(--muted-foreground)",
                  cursor: "pointer",
                  transition: "background 150ms ease, color 150ms ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "oklch(1 0 0 / 0.1)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "oklch(1 0 0 / 0.05)";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "var(--muted-foreground)";
                }}
                className="glow-ring"
              >
                <CloseIcon />
              </button>
            </div>

            {/* ── Body ──────────────────────────────────────────────────── */}
            <div
              style={{
                flex: 1,
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {/* Subject */}
              <section aria-label="Thread subject">
                <span style={labelStyle}>Subject</span>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.8125rem",
                    color: "var(--foreground)",
                    lineHeight: 1.5,
                  }}
                >
                  {thread.subject}
                </p>
              </section>

              {/* Badges row */}
              <div
                style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}
                aria-label="Current status and priority"
              >
                <StatusBadge status={thread.status} />
                <PriorityBadge priority={thread.priority} />
                {thread.flagged && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      padding: "0.125rem 0.5rem",
                      borderRadius: "999px",
                      border: "1px solid oklch(0.62 0.2 25 / 0.3)",
                      background: "oklch(0.62 0.2 25 / 0.1)",
                      color: "oklch(0.82 0.15 25)",
                      fontSize: "0.625rem",
                      fontWeight: 500,
                    }}
                  >
                    Flagged for review
                  </span>
                )}
              </div>

              {/* Status picker */}
              <section aria-label="Change status">
                <label htmlFor="vmt-status-select" style={labelStyle}>
                  Status
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    id="vmt-status-select"
                    value={thread.status}
                    onChange={(e) =>
                      onStatusChange(thread.id, e.target.value as ThreadStatus)
                    }
                    style={selectStyle}
                    aria-label="Change thread status"
                    className="glow-ring"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_META[s].label}
                      </option>
                    ))}
                  </select>
                  {/* Chevron decoration */}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      right: "0.625rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </section>

              {/* Owner picker */}
              <section aria-label="Assign owner">
                <label htmlFor="vmt-owner-select" style={labelStyle}>
                  Assigned To
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    id="vmt-owner-select"
                    value={thread.owner}
                    onChange={(e) => onOwnerChange(thread.id, e.target.value)}
                    style={selectStyle}
                    aria-label="Assign thread to a team member"
                    className="glow-ring"
                  >
                    {TEAM_MEMBERS.map((m) => (
                      <option key={m} value={m}>
                        {m === "unassigned" ? "Unassigned" : m}
                      </option>
                    ))}
                  </select>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      right: "0.625rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </section>

              {/* Divider */}
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid oklch(1 0 0 / 0.07)",
                  margin: "0",
                }}
              />

              {/* Notes list */}
              <section aria-label="Follow-up notes">
                <span style={labelStyle}>
                  Follow-up Notes{" "}
                  {thread.notes.length > 0 && `(${thread.notes.length})`}
                </span>

                {thread.notes.length === 0 ? (
                  <p
                    style={{
                      margin: "0 0 0.75rem",
                      fontSize: "0.75rem",
                      color: "var(--muted-foreground)",
                      fontStyle: "italic",
                    }}
                  >
                    No notes yet. Add one below.
                  </p>
                ) : (
                  <ul
                    role="list"
                    aria-label="Notes list"
                    style={{
                      listStyle: "none",
                      margin: "0 0 0.75rem",
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.625rem",
                    }}
                  >
                    {thread.notes.map((note) => (
                      <li
                        key={note.id}
                        style={{
                          padding: "0.625rem 0.75rem",
                          borderRadius: "0.625rem",
                          border: "1px solid oklch(1 0 0 / 0.07)",
                          background: "oklch(1 0 0 / 0.02)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "0.375rem",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.6875rem",
                              fontWeight: 600,
                              color: "var(--foreground)",
                            }}
                          >
                            {note.author}
                          </span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <time
                              dateTime={note.createdAt}
                              style={{
                                fontSize: "0.625rem",
                                color: "var(--muted-foreground)",
                              }}
                            >
                              {formatDateTime(note.createdAt)}
                            </time>
                            <button
                              type="button"
                              aria-label={`Delete note by ${note.author}`}
                              onClick={() => onDeleteNote(thread.id, note.id)}
                              style={{
                                display: "grid",
                                placeItems: "center",
                                width: "1.375rem",
                                height: "1.375rem",
                                borderRadius: "0.375rem",
                                border: "none",
                                background: "transparent",
                                color: "var(--muted-foreground)",
                                cursor: "pointer",
                                transition: "background 150ms ease, color 150ms ease",
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background =
                                  "oklch(0.62 0.2 25 / 0.12)";
                                (e.currentTarget as HTMLButtonElement).style.color =
                                  "oklch(0.78 0.15 25)";
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background =
                                  "transparent";
                                (e.currentTarget as HTMLButtonElement).style.color =
                                  "var(--muted-foreground)";
                              }}
                              className="glow-ring"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.75rem",
                            color: "var(--foreground)",
                            lineHeight: 1.55,
                          }}
                        >
                          {note.body}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Note composer */}
                <div
                  role="form"
                  aria-label="Add a follow-up note"
                  style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
                >
                  <label htmlFor="vmt-note-input" style={labelStyle}>
                    Add Note
                  </label>
                  <textarea
                    id="vmt-note-input"
                    value={noteBody}
                    onChange={(e) => {
                      setNoteBody(e.target.value);
                      if (noteError) setNoteError("");
                    }}
                    onKeyDown={(e) => {
                      // Ctrl/Cmd+Enter submits
                      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                        e.preventDefault();
                        handleAddNote();
                      }
                    }}
                    placeholder="Add a follow-up note…"
                    rows={3}
                    aria-required="true"
                    aria-invalid={noteError ? "true" : "false"}
                    aria-describedby={noteError ? "vmt-note-error" : "vmt-note-hint"}
                    style={{
                      resize: "vertical",
                      padding: "0.625rem 0.75rem",
                      borderRadius: "0.625rem",
                      border: `1px solid ${noteError ? "oklch(0.62 0.2 25 / 0.5)" : "oklch(1 0 0 / 0.1)"}`,
                      background: "oklch(1 0 0 / 0.04)",
                      color: "var(--foreground)",
                      fontSize: "0.8125rem",
                      lineHeight: 1.5,
                      outline: "none",
                      fontFamily: "inherit",
                      transition: "border-color 150ms ease",
                    }}
                    className="glow-ring"
                  />
                  {noteError ? (
                    <p
                      id="vmt-note-error"
                      role="alert"
                      style={{
                        margin: 0,
                        fontSize: "0.6875rem",
                        color: "oklch(0.78 0.15 25)",
                      }}
                    >
                      {noteError}
                    </p>
                  ) : (
                    <p
                      id="vmt-note-hint"
                      style={{
                        margin: 0,
                        fontSize: "0.6875rem",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      Press Ctrl+Enter to save quickly.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleAddNote}
                    aria-label="Save follow-up note"
                    style={{
                      alignSelf: "flex-end",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.625rem",
                      border: "1px solid oklch(1 0 0 / 0.15)",
                      background: "oklch(1 0 0 / 0.08)",
                      color: "var(--foreground)",
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "background 150ms ease",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.background =
                        "oklch(1 0 0 / 0.14)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.background =
                        "oklch(1 0 0 / 0.08)")
                    }
                    className="glow-ring"
                  >
                    Save Note
                  </button>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </>
  );
}
