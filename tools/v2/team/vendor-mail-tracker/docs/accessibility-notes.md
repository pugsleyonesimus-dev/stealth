# Vendor Mail Tracker — Accessibility Notes

This document records every accessibility decision, technique, and known
limitation for the Vendor Mail Tracker UI components. Full WCAG validation
requires manual testing with assistive technologies.

---

## Standards Target

WCAG 2.1 Level AA.

---

## Keyboard Navigation

### Tab order

The natural DOM order defines tab order. No `tabindex` values above `0` are
used. The skip link at the top of the page lets keyboard users jump directly
to `#vmt-thread-list`.

### Skip-to-content link

A visually hidden "Skip to thread list" link is the first focusable element in
`VendorTrackerApp`. It becomes visible on `:focus` so sighted keyboard users
can see it.

### Filter tabs (`StatusFilter`)

The tab strip uses `role="tablist"` / `role="tab"` / `aria-selected`. Arrow
key navigation (Left/Right/Home/End) moves focus between tabs without requiring
Tab. This matches the ARIA Authoring Practices Guide roving-tabindex pattern.

Tab key leaves the tablist (does not cycle inside it), following the ARIA APG
recommendation.

### Thread cards (`VendorThreadCard`)

Each card has two focusable elements:
1. The main card button — opens the detail panel (labeled with vendor and subject).
2. The flag toggle button — positioned absolutely, receives its own focus stop.

Both use `.glow-ring` for the focus ring. Neither nests an interactive element
inside another interactive element — the flag button is a sibling of the card
button via CSS absolute positioning, not a child.

### Detail panel (`ThreadDetailPanel`)

- Opens with CSS `transform: translateX()` — focus is programmatically moved to
  the close button after a brief delay (80 ms) to let the animation settle.
- A focus trap keeps focus inside the panel while it is open (Tab / Shift+Tab
  wrap around).
- Escape closes the panel and returns focus to the last-selected card.
- The panel carries `role="dialog"`, `aria-modal="true"`, and
  `aria-labelledby` pointing to the vendor heading.

### Form controls in detail panel

- Status and owner `<select>` elements have explicit `<label>` elements with
  `htmlFor` matching the element `id`.
- The note textarea carries `aria-required`, `aria-invalid`, and
  `aria-describedby` (pointing to either the error message or the hint).
- Ctrl+Enter / Cmd+Enter submits the note without requiring mouse interaction.

---

## Screen Reader Labels

| Element | Technique | Label |
|---|---|---|
| Skip link | Visible on focus | "Skip to thread list" |
| Thread card (button) | `aria-label` | "Open thread: {subject} from {vendor}" |
| Flag toggle | `aria-label` + `aria-pressed` | "Flag/Unflag thread from {vendor}" |
| Close button | `aria-label` | "Close thread detail panel" |
| Delete note button | `aria-label` | "Delete note by {author}" |
| Status select | `<label>` + `aria-label` | "Change thread status" |
| Owner select | `<label>` + `aria-label` | "Assign thread to a team member" |
| Note textarea | `<label>` + `aria-required` + `aria-describedby` | "Add Note" |
| Thread list `<ul>` | `aria-label` | "{n} vendor thread(s)" |
| Filter tablist | `aria-label` | "Filter vendor threads by status" |
| Count badges | `aria-label` | "{n} thread(s)" |
| Stats group | `role="group"` + `aria-label` | "Thread summary stats" |
| Loading state | `role="status"` + `aria-busy` + `aria-label` | "Loading vendor threads" |
| Error state | `role="alert"` + `aria-live="assertive"` | Announced immediately |
| Empty state | `role="status"` + `aria-label` | Per-filter message |
| Feedback toasts | `aria-live="polite"` + `role="status"` / `role="alert"` | Polite by default |
| Badge icons | `aria-hidden="true"` | Text label carries meaning |
| Overdue indicator | `role="img"` + `aria-label` | "Overdue — reply deadline has passed" |
| Last message time | `<time>` + `dateTime` + `aria-label` | Full date in label |

---

## Color Independence (WCAG 1.4.1)

No information is conveyed by color alone:

- **PriorityBadge**: colored dot (aria-hidden) + text label ("Low", "Medium", "High", "Urgent")
- **StatusBadge**: icon (aria-hidden) + text label
- **Overdue indicator**: clock icon + "Overdue" text
- **Flagged stripe**: visual indicator + flag icon with aria-label
- **Review badge**: warning icon + "Review" text
- **Error banner**: alert icon + "Failed to load" heading + message text

---

## Focus Visibility (WCAG 2.4.7 / 2.4.11)

All focusable elements show the `.glow-ring` focus ring on `:focus-visible`.
The ring uses a 2 px white outline plus a soft glow, which exceeds the WCAG 2.4.11
minimum focus appearance requirements.

The `.glow-ring` class is defined once in `preview.html` and applied to every
interactive element via `className="glow-ring"`.

---

## Motion and Animation (WCAG 2.3.3)

- The `ThreadDetailPanel` slide-in transition (`240ms`) is suppressed via
  `transition: none` when `prefers-reduced-motion: reduce` is active.
- Toast entrance animation collapses to a simple opacity fade under reduced motion.
- Skeleton shimmer animation slows to a near-static opacity shift under reduced
  motion.
- The global rule in `preview.html` collapses all `animation-duration` and
  `transition-duration` values to `0.01ms` under `prefers-reduced-motion`.

---

## Announced State Changes (WCAG 4.1.3)

| Action | Announcement mechanism |
|---|---|
| Status change | `FeedbackToast` with `aria-live="polite"` |
| Owner change | `FeedbackToast` with `aria-live="polite"` |
| Flag toggled | `FeedbackToast` with `aria-live="polite"` |
| Note saved | `FeedbackToast` with `aria-live="polite"` |
| Note deleted | `FeedbackToast` with `aria-live="polite"` |
| Load error | `ErrorBanner` with `role="alert"` (assertive) |
| Loading | `LoadingShell` with `aria-live="polite"` + `aria-busy` |
| Empty state | `EmptyLane` with `role="status"` |

---

## Known Gaps / Manual Testing Required

1. **Contrast ratios**: oklch values are used throughout. Automated color-
   contrast checking against these values requires a tool that supports oklch.
   Manual verification with a supported contrast checker is recommended before
   a real release.

2. **Screen reader order on mobile**: virtual cursor behavior on iOS VoiceOver
   and Android TalkBack with the absolute-positioned flag button inside a card
   should be tested manually.

3. **Select element styling**: the `<select>` elements use inline styles with
   `appearance: none`. Screen readers handle native selects differently across
   AT/browser combinations — manual testing with NVDA/JAWS/VoiceOver is
   recommended.

4. **Touch target sizes**: all interactive elements should be at least 44×44 CSS
   pixels per WCAG 2.5.8 (AA). The flag button is 26×26 and may need enlargement
   on a touch-targeted device.

5. **High contrast mode**: Windows High Contrast / Forced Colors Mode should be
   tested. CSS `forced-colors` media query overrides may be needed for the inline
   background styles used in several components.
