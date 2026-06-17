# Vendor Mail Tracker — Specs

## Purpose

Surface incoming vendor email threads in a structured, team-visible tracker.
Team members can monitor thread status, assign owners, log follow-up notes,
and flag threads that need attention. The tool is isolated from the main
Stealth Mail application.

## Release Scope

- Release tier: V2 later-release tool
- Audience: team
- Folder ownership: `tools/v2/team/vendor-mail-tracker/`
- Integration status: isolated mini-product workspace

## In-Scope Behavior

- Display vendor threads as tracker cards with status, priority, owner, and
  last-activity timestamp.
- Filter threads by status tab: All / New / Active / Awaiting Reply /
  Resolved / Archived.
- Open a thread detail panel to view subject, vendor address, and follow-up
  notes.
- Add, edit, and delete follow-up notes (folder-local state only).
- Assign or reassign a thread owner (from a local team member list).
- Change thread status via a status picker.
- Flag/unflag a thread for review.
- Display empty, loading, error, and success UI states.
- Full keyboard navigation and screen-reader labeling throughout.
- Visual urgency indicator for threads overdue for a reply.
- In-tool feedback toasts for confirm and error actions.

## Out-of-Scope Behavior

- Main app routing or dashboard registration
- Inbox ingestion or mail rendering engine changes
- Authentication, wallet, or Stellar integration
- Database writes or network requests
- Shared design system changes
- Notification delivery or real-time collaboration

## Vendor Thread Card Contract

Each thread card must include:

- `id`: stable fixture-local identifier
- `vendor`: vendor display name
- `vendorAddress`: vendor email address
- `subject`: thread subject line
- `lastMessageAt`: ISO datetime string
- `status`: one of `new`, `active`, `awaiting-reply`, `resolved`, `archived`
- `priority`: one of `low`, `medium`, `high`, `urgent`
- `owner`: assigned team member name or `unassigned`
- `flagged`: boolean — true when team flagged for review
- `replyDueAt`: ISO datetime string or `null`
- `notes`: array of `{ id, author, body, createdAt }`
- `reviewRequired`: boolean — true when extraction needs human confirmation

## UI States

| State | Trigger | Component |
|---|---|---|
| Empty | No threads match the active filter | `EmptyLane` |
| Loading | Fixture/data load in progress | `LoadingShell` |
| Error | Load failure or action failure | `ErrorBanner` |
| Success | Action confirmed (status change, note saved) | `FeedbackToast` |

## Accessibility Requirements

- All interactive controls must have accessible labels.
- Focus must be managed when the detail panel opens and closes.
- Keyboard: Tab moves between controls; Enter/Space activates; Escape closes
  panels.
- Status and priority badges must not rely on color alone.
- Screen-reader announcements for async state changes (aria-live regions).
- Reduced-motion: animations must respect `prefers-reduced-motion`.

## Required Issue Categories

- Architecture
- Feature
- UI and accessibility
- Security and performance
- Testing and documentation

## Contributor Boundary

All changes for this issue must stay inside `tools/v2/team/vendor-mail-tracker/`.
If the tool needs a future connection to shared inbox data, routing, or
production UI, open a follow-up issue instead of adding integration here.
