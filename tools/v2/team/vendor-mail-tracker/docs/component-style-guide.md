# Vendor Mail Tracker — Component Style Guide

This guide documents the visual tokens and patterns used in the tool.
All values are folder-local copies of the main app design system.

**No shared design system files are modified by this tool.**
If you need to change tokens, edit this document and the local CSS inside
`preview.html` only.

---

## Color Tokens (OKLCH)

These values replicate `src/features/design-system/styles/tokens.css` exactly.

| Token | Dark value | Purpose |
|---|---|---|
| `--background` | `oklch(0.18 0.005 270)` | Page background |
| `--foreground` | `oklch(0.96 0.005 270)` | Primary text |
| `--muted-foreground` | `oklch(0.7 0.01 270)` | Secondary/hint text |
| `--card` | `oklch(0.22 0.006 270)` | Card background |
| `--border` | `oklch(1 0 0 / 8%)` | Subtle border |
| `--input` | `oklch(1 0 0 / 12%)` | Input border |
| `--ring` | `oklch(0.7 0.01 270 / 50%)` | Focus ring base |
| `--glass` | `oklch(0.22 0.006 270 / 0.32)` | Frosted glass surface |
| `--glass-strong` | `oklch(0.18 0.005 270 / 0.55)` | Heavy frosted glass |

---

## Semantic Accent Colors

Used for status and priority states. Never rely on color alone — always pair
with text or icon.

| Meaning | Color | Usage |
|---|---|---|
| Success / Active | `oklch(0.9 0.15 145)` (emerald-300) | Active status, saved notes |
| Warning / Awaiting | `oklch(0.88 0.16 85)` (amber-300) | Awaiting Reply status |
| Danger / Urgent / Flagged | `oklch(0.72 0.2 25)` (red-300) | Urgent priority, flags, overdue |
| Info / New | `oklch(0.82 0.12 270)` (violet-300) | New status |
| Resolved | `oklch(0.82 0.1 210)` (sky-300) | Resolved status |
| Archived | `oklch(0.7 0.01 270)` (zinc) | Archived status |
| Review needed | `oklch(0.88 0.12 85)` (amber-200) | reviewRequired badge |

---

## Typography

| Role | Family | Usage |
|---|---|---|
| Interface | `Inter` | All UI chrome, labels, buttons |
| Mail / Preview headings | `Space Grotesk` | Vendor names, thread titles, stat numbers |

Font sizes follow a tight scale:

| Size | Value | Usage |
|---|---|---|
| `2xs` | `0.5625rem` | Stat labels, metadata |
| `xs` | `0.625rem` | Badge text, eyebrow labels |
| `sm` | `0.6875rem` | Thread meta, timestamps |
| `base-sm` | `0.75rem` | Notes body, secondary text |
| `base` | `0.8125rem` | Primary body, select options |
| `md` | `0.875rem` | Vendor names |
| `lg` | `0.9375rem` | Panel headings |
| `xl` | `1.125rem` | Stat counts |
| `2xl` | `1.375rem` | Page title |

---

## Surface Patterns

| Class | Background | Blur | Border | Usage |
|---|---|---|---|---|
| `.glass` | `var(--glass)` | `blur(24px)` | `oklch(1 0 0 / 7%)` | List panel, filter bar |
| `.glass-strong` | `var(--glass-strong)` | `blur(32px)` | `oklch(1 0 0 / 8%)` | Detail panel, toasts |
| `.glass-tile` | `oklch(0.14 0.005 270 / 0.48)` | `blur(28px)` | `oklch(1 0 0 / 14%)` | Icon tiles, empty state icon |
| Card | `oklch(1 0 0 / 2%)` | — | `oklch(1 0 0 / 8%)` | Thread cards |
| Card (selected) | `oklch(1 0 0 / 5%)` | — | `oklch(1 0 0 / 20%)` | Active thread card |
| Card (flagged) | `oklch(0.62 0.2 25 / 4%)` | — | `oklch(0.62 0.2 25 / 25%)` | Flagged thread card |

---

## Focus Ring

All interactive elements use the `.glow-ring` class which is defined once in
`preview.html`. This mirrors the main app's `interactions.css`:

```css
.glow-ring:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px oklch(1 0 0 / 0.2),
    0 0 24px oklch(1 0 0 / 0.08);
}
```

---

## Border Radius

All radii derive from `--radius: 0.875rem`:

| Name | Value | Usage |
|---|---|---|
| `sm` | `0.375rem` | Inner chips, small icons |
| `md` | `0.5rem` | Buttons, badges |
| `lg` | `0.625rem` | Inputs, selects, note cards |
| `xl` | `0.75rem` | Thread cards |
| `2xl` | `0.875rem` | Error banner |
| `3xl` | `1rem` | Filter tab bar |
| `panel` | `0` (edge) | Detail panel (flush to viewport edge) |
| `full` | `999px` | Stat badges, count pills |

---

## Motion

All animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

| Pattern | Duration | Easing | Usage |
|---|---|---|---|
| Panel slide | `240ms` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | ThreadDetailPanel open/close |
| Toast entrance | `220ms` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | FeedbackToast appear |
| Skeleton shimmer | `1600ms` | `ease-in-out` | LoadingShell pulse |
| Backdrop fade | `180ms` | `ease` | Panel backdrop |
| Hover transitions | `150ms` | `ease` | Button/card hover |

---

## Component Inventory

| Component | File | States |
|---|---|---|
| `VendorTrackerApp` | `components/VendorTrackerApp.tsx` | loading, error, ready |
| `VendorThreadCard` | `components/VendorThreadCard.tsx` | default, selected, flagged, overdue |
| `ThreadDetailPanel` | `components/ThreadDetailPanel.tsx` | open (slide-in), closed |
| `StatusFilter` | `components/StatusFilter.tsx` | active tab, inactive tab |
| `PriorityBadge` | `components/PriorityBadge.tsx` | low, medium, high, urgent |
| `StatusBadge` | `components/StatusBadge.tsx` | new, active, awaiting-reply, resolved, archived |
| `EmptyLane` | `components/EmptyLane.tsx` | per-filter messages |
| `LoadingShell` | `components/LoadingShell.tsx` | shimmer skeleton |
| `ErrorBanner` | `components/ErrorBanner.tsx` | with/without retry |
| `FeedbackToast` | `components/FeedbackToast.tsx` | neutral, success, warning, danger |
