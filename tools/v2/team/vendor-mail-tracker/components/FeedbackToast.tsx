/**
 * FeedbackToast
 *
 * Folder-local feedback/notification layer. Uses aria-live="polite" so screen
 * readers announce state changes without interrupting the current flow.
 * Mirrors the pattern from src/features/design-system/feedback/ but is fully
 * self-contained and does not import from the main app.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { FeedbackItem, FeedbackTone } from "./types";

// ─── Hook ─────────────────────────────────────────────────────────────────────

let sequence = 0;

export function useFeedbackToast() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, tone: FeedbackTone = "neutral", duration = 4000) => {
      const id = `vmt-toast-${Date.now()}-${sequence++}`;
      setItems((prev) => [...prev, { id, message, tone }]);
      if (duration > 0) {
        timers.current.set(id, setTimeout(() => dismiss(id), duration));
      }
      return id;
    },
    [dismiss],
  );

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  return { items, notify, dismiss };
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconSuccess() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8l4 4 6-7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconWarning() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 6v3M8 11v.5M1.5 13L8 2l6.5 11H1.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconDanger() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M8 5v3.5M8 11v.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconNeutral() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M8 7.5v3M8 5v.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Tone config ──────────────────────────────────────────────────────────────

const toneConfig: Record<
  FeedbackTone,
  { className: string; Icon: () => JSX.Element; ariaLabel: string }
> = {
  neutral: {
    className: "border-white/10 text-foreground",
    Icon: IconNeutral,
    ariaLabel: "Information",
  },
  success: {
    className: "border-emerald-300/20 text-emerald-100",
    Icon: IconSuccess,
    ariaLabel: "Success",
  },
  warning: {
    className: "border-amber-300/20 text-amber-100",
    Icon: IconWarning,
    ariaLabel: "Warning",
  },
  danger: {
    className: "border-red-300/20 text-red-100",
    Icon: IconDanger,
    ariaLabel: "Error",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface FeedbackToastViewportProps {
  items: FeedbackItem[];
  onDismiss: (id: string) => void;
}

export function FeedbackToastViewport({ items, onDismiss }: FeedbackToastViewportProps) {
  return (
    /*
     * aria-live="polite" announces new items to screen readers without
     * interrupting whatever the user is doing. aria-atomic prevents partial
     * reads when items change.
     */
    <div
      aria-live="polite"
      aria-atomic="true"
      role="status"
      style={{
        position: "fixed",
        bottom: "1.25rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
        width: "min(28rem, calc(100vw - 2rem))",
        pointerEvents: "none",
      }}
    >
      {items.map((item) => {
        const { className, Icon, ariaLabel } = toneConfig[item.tone];
        return (
          <div
            key={item.id}
            role="alert"
            style={{
              pointerEvents: "auto",
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: "1rem",
              border: "1px solid",
              background: "oklch(0.18 0.005 270 / 0.92)",
              backdropFilter: "blur(32px) saturate(160%)",
              WebkitBackdropFilter: "blur(32px) saturate(160%)",
              boxShadow: "0 18px 50px -12px rgba(0,0,0,0.7)",
              animation: "vmt-toast-in 0.22s cubic-bezier(0.2,0.8,0.2,1) both",
            }}
            className={className}
          >
            {/* sr-only label for the tone */}
            <span className="sr-only">{ariaLabel}:</span>
            <Icon />
            <span
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: "0.875rem",
                color: "var(--foreground)",
              }}
            >
              {item.message}
            </span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => onDismiss(item.id)}
              style={{
                flexShrink: 0,
                padding: "0.25rem",
                borderRadius: "0.5rem",
                color: "var(--muted-foreground)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "background 150ms ease, color 150ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "oklch(1 0 0 / 0.07)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--muted-foreground)";
              }}
              className="glow-ring"
            >
              <CloseIcon />
            </button>
          </div>
        );
      })}
    </div>
  );
}
