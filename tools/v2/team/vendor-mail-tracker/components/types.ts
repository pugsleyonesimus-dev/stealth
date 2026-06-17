/**
 * Vendor Mail Tracker — shared types
 *
 * All types are folder-local. Do not import from or export to the main app.
 */

// ─── Thread status ────────────────────────────────────────────────────────────

export type ThreadStatus =
  | "new"
  | "active"
  | "awaiting-reply"
  | "resolved"
  | "archived";

export type ThreadPriority = "low" | "medium" | "high" | "urgent";

// ─── Filter ───────────────────────────────────────────────────────────────────

/** "all" is a synthetic UI-only filter — not a real status value. */
export type StatusFilter = "all" | ThreadStatus;

// ─── Data contracts ───────────────────────────────────────────────────────────

export interface ThreadNote {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface VendorThread {
  id: string;
  vendor: string;
  vendorAddress: string;
  subject: string;
  lastMessageAt: string;
  status: ThreadStatus;
  priority: ThreadPriority;
  owner: string;
  /** true when team has flagged for review */
  flagged: boolean;
  /** ISO datetime or null — when set and in the past, shows urgency indicator */
  replyDueAt: string | null;
  notes: ThreadNote[];
  /** true when the card needs human confirmation on any extracted field */
  reviewRequired: boolean;
}

// ─── Action payloads ──────────────────────────────────────────────────────────

export type ThreadAction =
  | { type: "set-status"; threadId: string; status: ThreadStatus }
  | { type: "set-owner"; threadId: string; owner: string }
  | { type: "toggle-flag"; threadId: string }
  | { type: "add-note"; threadId: string; note: ThreadNote }
  | { type: "delete-note"; threadId: string; noteId: string };

// ─── Feedback toast ───────────────────────────────────────────────────────────

export type FeedbackTone = "neutral" | "success" | "warning" | "danger";

export interface FeedbackItem {
  id: string;
  message: string;
  tone: FeedbackTone;
}

// ─── Metadata helpers ─────────────────────────────────────────────────────────

export const STATUS_META: Record<
  ThreadStatus,
  { label: string; description: string }
> = {
  new: {
    label: "New",
    description: "Inbound thread not yet triaged",
  },
  active: {
    label: "Active",
    description: "Thread is in progress",
  },
  "awaiting-reply": {
    label: "Awaiting Reply",
    description: "Waiting for vendor to respond",
  },
  resolved: {
    label: "Resolved",
    description: "Thread is closed and complete",
  },
  archived: {
    label: "Archived",
    description: "Thread archived for reference",
  },
} as const;

export const PRIORITY_META: Record<
  ThreadPriority,
  { label: string; order: number }
> = {
  low: { label: "Low", order: 0 },
  medium: { label: "Medium", order: 1 },
  high: { label: "High", order: 2 },
  urgent: { label: "Urgent", order: 3 },
} as const;

export const FILTER_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "active", label: "Active" },
  { value: "awaiting-reply", label: "Awaiting Reply" },
  { value: "resolved", label: "Resolved" },
  { value: "archived", label: "Archived" },
];

/** Team members available for assignment in the fixture context. */
export const TEAM_MEMBERS = [
  "unassigned",
  "Alex M.",
  "Casey L.",
  "Jordan R.",
  "Sam T.",
  "Taylor K.",
] as const;

export type TeamMember = (typeof TEAM_MEMBERS)[number];
