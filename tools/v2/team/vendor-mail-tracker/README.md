# Vendor Mail Tracker

Vendor Mail Tracker is an isolated V2 team tool workspace. It surfaces
incoming vendor email threads in a structured tracker so team members can
monitor status, log follow-ups, and flag threads that need attention — without
wiring anything into the production app yet.

## Ownership Boundary

All work for this tool must stay inside:

```text
tools/v2/team/vendor-mail-tracker/
```

Do not wire this tool into the main app, routing, inbox architecture, wallet
core, Stellar core, database schema, or shared design system unless a future
integration issue explicitly allows it.

## Reviewer Setup

No app install is required to review this contribution.

Run the local fixture test from the repository root:

```bash
node --test tools/v2/team/vendor-mail-tracker/tests/vendor-tracker-fixtures.test.mjs
```

The test uses Node's built-in test runner and validates the sample vendor
fixture against the expected tracker contract.

To review the UI components, open the standalone preview page:

```bash
# From the repo root — serve the tool folder as a static site
npx serve tools/v2/team/vendor-mail-tracker
# Then open http://localhost:3000/preview.html
```

## Tool Workflow

1. Receive incoming vendor email threads in a shared team inbox.
2. Each thread is represented as a **Vendor Thread Card** with status, priority,
   assigned owner, and last-activity timestamp.
3. Team members triage new threads: assign an owner, set a status, add a
   follow-up note.
4. Threads progress through statuses: `new → active → awaiting-reply →
   resolved → archived`.
5. Flagged threads surface in a dedicated review lane.
6. Threads overdue for a reply trigger a visual urgency indicator.

## UI Components

All components are folder-local and not registered in the main app:

| Component | File | Purpose |
|---|---|---|
| `VendorTrackerApp` | `components/VendorTrackerApp.tsx` | Root shell, state, layout |
| `VendorThreadCard` | `components/VendorThreadCard.tsx` | Single vendor thread row/card |
| `ThreadDetailPanel` | `components/ThreadDetailPanel.tsx` | Slide-in detail + note editor |
| `StatusFilter` | `components/StatusFilter.tsx` | Tab bar filtering by status |
| `PriorityBadge` | `components/PriorityBadge.tsx` | Priority pill (low/medium/high/urgent) |
| `StatusBadge` | `components/StatusBadge.tsx` | Status pill with icon |
| `EmptyLane` | `components/EmptyLane.tsx` | Empty state for filtered views |
| `LoadingShell` | `components/LoadingShell.tsx` | Skeleton loading state |
| `ErrorBanner` | `components/ErrorBanner.tsx` | Inline error state with retry |
| `FeedbackToast` | `components/FeedbackToast.tsx` | In-tool notification toasts |

## Fixtures

The folder-local fixture at `fixtures/sample-vendor-threads.json` contains:

- a new inbound thread from a software vendor
- an active negotiation thread with overdue reply
- a thread awaiting vendor reply
- a resolved contract thread
- a flagged thread with compliance concern

Each fixture item includes the source thread, expected tracker card, and
explicit review notes.

## Documentation Map

- `specs.md` — local product contract and contributor boundaries
- `docs/component-style-guide.md` — visual token reference (no shared design
  system changes)
- `docs/accessibility-notes.md` — keyboard, focus, and screen-reader checklist
- `docs/test-plan.md` — manual and automated review steps
- `tests/vendor-tracker-fixtures.test.mjs` — validates the fixture contract

## Known Limitations

- This contribution does not integrate with live inbox data.
- Authentication, routing, database writes, and notification side effects are
  out of scope.
- Stellar/wallet features are not connected.
- A future integration issue will wire the tool into the main app shell.
