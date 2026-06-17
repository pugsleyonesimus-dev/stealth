/**
 * ErrorBanner
 *
 * Inline error state with a retry action. Uses role="alert" so screen readers
 * announce the error immediately without requiring focus.
 */

interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
}

function AlertIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 9v4M12 17v.5M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 009 9 9.75 9.75 0 006.74-2.74L21 16" />
      <path d="M21 7v9h-9" />
    </svg>
  );
}

export function ErrorBanner({
  message = "Something went wrong loading vendor threads.",
  onRetry,
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        padding: "1rem 1.25rem",
        borderRadius: "0.875rem",
        border: "1px solid oklch(0.62 0.2 25 / 0.25)",
        background: "oklch(0.62 0.2 25 / 0.07)",
        color: "oklch(0.9 0.08 25)",
      }}
    >
      {/* Icon */}
      <span
        style={{
          flexShrink: 0,
          marginTop: "0.05rem",
          display: "grid",
          placeItems: "center",
          width: "1.75rem",
          height: "1.75rem",
          borderRadius: "50%",
          border: "1px solid oklch(0.62 0.2 25 / 0.3)",
          background: "oklch(0.62 0.2 25 / 0.12)",
        }}
      >
        <AlertIcon />
      </span>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "oklch(0.92 0.06 25)",
          }}
        >
          Failed to load
        </p>
        <p
          style={{
            margin: "0.25rem 0 0",
            fontSize: "0.75rem",
            lineHeight: 1.5,
            color: "oklch(0.78 0.08 25)",
          }}
        >
          {message}
        </p>
      </div>

      {/* Retry button */}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          aria-label="Retry loading vendor threads"
          style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            padding: "0.375rem 0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid oklch(0.62 0.2 25 / 0.3)",
            background: "oklch(0.62 0.2 25 / 0.1)",
            color: "oklch(0.9 0.08 25)",
            fontSize: "0.75rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 150ms ease",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background =
              "oklch(0.62 0.2 25 / 0.18)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background =
              "oklch(0.62 0.2 25 / 0.1)")
          }
          className="glow-ring"
        >
          <RetryIcon />
          Retry
        </button>
      )}
    </div>
  );
}
