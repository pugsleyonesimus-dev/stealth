/**
 * LoadingShell
 *
 * Skeleton loading state shown while fixture data initialises.
 * Uses CSS animation — respects prefers-reduced-motion.
 * Announces loading state to screen readers via aria-busy + role="status".
 */

function SkeletonLine({
  width = "100%",
  height = "0.75rem",
  radius = "0.375rem",
}: {
  width?: string;
  height?: string;
  radius?: string;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        width,
        height,
        borderRadius: radius,
        background: "oklch(1 0 0 / 0.06)",
        animation: "vmt-shimmer 1.6s ease-in-out infinite",
      }}
    />
  );
}

function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      style={{
        borderRadius: "0.75rem",
        border: "1px solid oklch(1 0 0 / 0.06)",
        background: "oklch(1 0 0 / 0.02)",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.625rem",
      }}
    >
      {/* Top row: badge + date */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SkeletonLine width="5rem" height="1.125rem" radius="999px" />
        <SkeletonLine width="3.5rem" height="0.625rem" />
      </div>
      {/* Vendor name */}
      <SkeletonLine width="55%" height="0.875rem" />
      {/* Subject */}
      <SkeletonLine width="80%" height="0.75rem" />
      <SkeletonLine width="60%" height="0.75rem" />
      {/* Footer row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "0.5rem",
          borderTop: "1px solid oklch(1 0 0 / 0.05)",
        }}
      >
        <SkeletonLine width="4.5rem" height="0.625rem" />
        <SkeletonLine width="3rem" height="1rem" radius="999px" />
      </div>
    </div>
  );
}

export function LoadingShell() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading vendor threads"
      style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}
    >
      <span className="sr-only">Loading vendor threads…</span>

      {/* Render 4 skeleton cards */}
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
