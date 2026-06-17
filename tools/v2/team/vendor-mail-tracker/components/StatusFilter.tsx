/**
 * StatusFilter
 *
 * Tab-bar filter for switching between thread status views.
 * Uses role="tablist" / role="tab" / aria-selected for full screen-reader
 * semantics. Keyboard: Left/Right arrows move focus between tabs.
 */
import { useRef } from "react";
import { FILTER_TABS } from "./types";
import type { StatusFilter as StatusFilterValue, VendorThread } from "./types";

interface StatusFilterProps {
  active: StatusFilterValue;
  threads: VendorThread[];
  onChange: (value: StatusFilterValue) => void;
}

/** Count threads per status for badge labels. "all" counts everything. */
function useCounts(threads: VendorThread[]) {
  const counts: Record<string, number> = { all: threads.length };
  for (const t of threads) {
    counts[t.status] = (counts[t.status] ?? 0) + 1;
  }
  return counts;
}

export function StatusFilter({ active, threads, onChange }: StatusFilterProps) {
  const counts = useCounts(threads);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const tabs = tabRefs.current.filter(Boolean) as HTMLButtonElement[];
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = (index + 1) % tabs.length;
      tabs[next].focus();
      onChange(FILTER_TABS[next].value);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = (index - 1 + tabs.length) % tabs.length;
      tabs[prev].focus();
      onChange(FILTER_TABS[prev].value);
    } else if (e.key === "Home") {
      e.preventDefault();
      tabs[0].focus();
      onChange(FILTER_TABS[0].value);
    } else if (e.key === "End") {
      e.preventDefault();
      tabs[tabs.length - 1].focus();
      onChange(FILTER_TABS[tabs.length - 1].value);
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Filter vendor threads by status"
      style={{
        display: "flex",
        gap: "0.125rem",
        padding: "0.25rem",
        borderRadius: "0.75rem",
        border: "1px solid oklch(1 0 0 / 0.07)",
        background: "oklch(1 0 0 / 0.03)",
        overflowX: "auto",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {FILTER_TABS.map(({ value, label }, i) => {
        const isActive = active === value;
        const count = counts[value] ?? 0;

        return (
          <button
            key={value}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            role="tab"
            aria-selected={isActive}
            aria-controls={`vmt-panel-${value}`}
            id={`vmt-tab-${value}`}
            tabIndex={isActive ? 0 : -1}
            type="button"
            onClick={() => onChange(value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.375rem 0.75rem",
              borderRadius: "0.5rem",
              border: "none",
              fontSize: "0.75rem",
              fontWeight: isActive ? 600 : 400,
              cursor: "pointer",
              transition: "background 150ms ease, color 150ms ease",
              background: isActive ? "oklch(1 0 0 / 0.09)" : "transparent",
              color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
              outline: "none",
              whiteSpace: "nowrap",
              fontVariantNumeric: "tabular-nums",
            }}
            className="glow-ring"
          >
            {label}
            {count > 0 && (
              <span
                aria-label={`${count} thread${count !== 1 ? "s" : ""}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "1.125rem",
                  height: "1.125rem",
                  padding: "0 0.25rem",
                  borderRadius: "999px",
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  background: isActive
                    ? "oklch(1 0 0 / 0.15)"
                    : "oklch(1 0 0 / 0.06)",
                  color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
