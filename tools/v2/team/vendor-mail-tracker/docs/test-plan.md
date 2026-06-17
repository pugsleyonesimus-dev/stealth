# Vendor Mail Tracker — Test Plan

---

## Automated Tests

### Fixture contract test

Run from the repository root:

```bash
node --test tools/v2/team/vendor-mail-tracker/tests/vendor-tracker-fixtures.test.mjs
```

Covers:
- Tool identifier and version in fixture metadata
- All VendorThread fields match the contract in `specs.md`
- All 5 statuses are represented in the fixture
- ISO 8601 datetime format on `lastMessageAt` and `note.createdAt`
- Business rules: flagged → reviewRequired, unassigned → reviewRequired
- expectedCards match their source threads
- reviewNotes are present and non-empty

Expected output (all passing):

```
✔ fixture has the correct tool identifier and version
✔ fixture contains parallel threads and expectedCards arrays
✔ every thread satisfies the VendorThread contract
✔ flagged threads must have reviewRequired: true
✔ unassigned threads must have reviewRequired: true
✔ expectedCards match their source threads
✔ fixture includes reviewNotes
```

---

## Manual UI Review Checklist

### Setup

```bash
npx serve tools/v2/team/vendor-mail-tracker
# Open: http://localhost:3000/preview.html
```

### Loading state

- [ ] Skeleton cards appear immediately on page load for ~600 ms.
- [ ] "Loading vendor threads…" is announced by screen reader.
- [ ] Skeleton cards have no interactive elements.

### Error state (manual simulation)

- Rename `fixtures/sample-vendor-threads.json` temporarily to trigger a 404.
- [ ] Error banner appears with "Failed to load" heading and message.
- [ ] "Retry" button re-triggers the load attempt.
- [ ] Error is announced immediately (assertive live region).
- Restore the fixture file.

### Thread list (ready state)

- [ ] 5 thread cards render after loading.
- [ ] Each card shows: StatusBadge, PriorityBadge, vendor name, subject, owner, last message date.
- [ ] Thread `thread-vendor-003` shows an overdue accent stripe (left red bar) and "Overdue" label.
- [ ] Thread `thread-vendor-003` shows the flag icon filled (flagged).
- [ ] Thread `thread-vendor-001` shows "Unassigned" in italics.
- [ ] All cards with `reviewRequired: true` show the "Review" badge.

### Filter tabs

- [ ] "All" tab shows count of 5.
- [ ] Each status tab shows the correct count.
- [ ] Clicking a tab filters the list correctly.
- [ ] Selecting "Archived" shows only the archived thread.
- [ ] When no threads match (try "Active" after manually resolving all — or just verify the empty state by switching to a filter with 0), `EmptyLane` renders with the correct message and "View all threads" button.
- [ ] "View all threads" button resets filter to "All".

### Keyboard navigation — filter tabs

- [ ] Tab into the tablist.
- [ ] Arrow Right moves focus to next tab and applies the filter.
- [ ] Arrow Left moves focus to previous tab and applies the filter.
- [ ] Home moves to first tab; End moves to last tab.
- [ ] Tab key exits the tablist entirely.

### Thread card interaction

- [ ] Clicking a card opens the detail panel.
- [ ] The panel slides in from the right.
- [ ] Focus moves to the panel's close button.
- [ ] Pressing Escape closes the panel.
- [ ] Focus returns to the card that was clicked.
- [ ] Clicking the flag button toggles flagged state without opening the panel.
- [ ] A feedback toast appears after flagging/unflagging.

### Detail panel — content

- [ ] Vendor name and address are shown in the header.
- [ ] Subject line is shown.
- [ ] StatusBadge and PriorityBadge are present.
- [ ] "Flagged for review" tag appears for `thread-vendor-003`.
- [ ] Status dropdown shows the current status.
- [ ] Owner dropdown shows the current owner.

### Detail panel — status change

- [ ] Change status via the dropdown.
- [ ] A success toast announces the new status.
- [ ] The card in the list updates its StatusBadge immediately.
- [ ] If the new status does not match the active filter, the card disappears from the filtered view.

### Detail panel — owner change

- [ ] Change owner to another team member.
- [ ] A success toast announces the new owner.
- [ ] The card footer updates the owner name.

### Detail panel — notes

- [ ] `thread-vendor-002` shows 1 existing note.
- [ ] `thread-vendor-003` shows 2 existing notes with correct author and timestamp.
- [ ] Delete a note — it disappears and a toast confirms.
- [ ] Add a note: type in the textarea, click "Save Note" — note appears at the bottom of the list.
- [ ] Add a note with Ctrl+Enter — note is saved.
- [ ] Submitting an empty note shows inline validation error ("Note cannot be empty.").
- [ ] After fixing the error and re-submitting, the error clears.

### Detail panel — focus trap

- [ ] With the panel open, Tab cycles only through panel elements (close button, selects, note controls).
- [ ] Shift+Tab also cycles within the panel.

### Feedback toasts

- [ ] Toasts appear at the bottom center of the screen.
- [ ] Success toasts have a green icon.
- [ ] Warning toasts have an amber icon.
- [ ] Neutral toasts have a blue icon.
- [ ] Clicking the × button dismisses a toast.
- [ ] Toasts auto-dismiss after 4 seconds.
- [ ] Screen reader announces each new toast (polite live region).

### Reduced motion

- [ ] Enable "Reduce motion" in system accessibility settings (or OS display settings).
- [ ] Panel slide animation is suppressed (panel appears instantly).
- [ ] Toast animation is suppressed (toast appears instantly).
- [ ] Skeleton shimmer slows to near-static.

### Responsive layout

- [ ] On narrow viewports (< 640 px), the layout stacks correctly.
- [ ] The filter tabs scroll horizontally without clipping.
- [ ] The detail panel fills the full viewport width on narrow screens.
- [ ] Stat badges in the header wrap gracefully.

---

## Out of Scope

- End-to-end tests against live inbox data
- Authentication flows
- Stellar/wallet interactions
- Database persistence
- Real-time sync between team members
