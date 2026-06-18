# Team Analytics Dashboard

Team Analytics Dashboard is an isolated V2 team tool workspace for reviewing
team-level email performance metrics before a future dashboard integration.

## Ownership Boundary

All work for this tool must stay inside:

```text
tools/v2/team/team-analytics-dashboard/
```

Do not wire this tool into the main app, routing, inbox architecture, wallet
core, Stellar core, database schema, or shared design system unless a future
integration issue explicitly allows it.

## Reviewer Setup

This issue adds folder-local documentation, fixtures, and a standalone Node test.
No app install is required to review the contribution.

Run from the repository root:

```bash
node --test tools/v2/team/team-analytics-dashboard/tests/analytics-fixtures.test.mjs
```

The test validates the sample analytics fixture against the local review
contract described in `specs.md`.

## Analytics Workflow

1. Capture synthetic team metric snapshots.
2. Normalize totals, response times, backlog, and alert state.
3. Route each snapshot to `healthy`, `watch`, `needs-attention`, or `blocked`.
4. Preserve a source report id for auditability.
5. Keep live aggregation and dashboard wiring out of scope until a future issue
   allows app integration.

## Fixtures

The folder-local fixture at `fixtures/sample-team-analytics.json` contains:

- a healthy support team snapshot
- a watch-state sales team snapshot with growing backlog
- a needs-attention operations snapshot with slow response time
- a blocked finance snapshot with missing source data

The fixture intentionally uses synthetic teams, dates, and report ids so
contributors can validate behavior without using real performance or mailbox
data.

## Documentation Map

- `specs.md` defines the local analytics snapshot contract and scope.
- `docs/test-plan.md` lists automated and manual review steps.
- `docs/review-notes.md` explains validation and known limits.
- `tests/analytics-fixtures.test.mjs` validates the fixture contract.

## Known Limitations

- This contribution does not add app UI or live metric aggregation.
- Dashboard behavior is represented through fixture expectations only.
- Data retention, privacy controls, live charts, and notification delivery remain
  out of scope for this isolated V2 folder.
