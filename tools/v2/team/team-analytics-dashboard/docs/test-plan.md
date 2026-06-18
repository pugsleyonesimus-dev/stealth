# Test Plan

## Automated Fixture Test

Run from the repository root:

```bash
node --test tools/v2/team/team-analytics-dashboard/tests/analytics-fixtures.test.mjs
```

Expected result:

- the sample fixture parses as JSON
- each source report maps to one expected snapshot
- all local analytics statuses are represented
- metrics are non-negative when source data is available
- blocked snapshots require human review
- healthy snapshots do not require review

## Manual Review Checklist

1. Open `fixtures/sample-team-analytics.json`.
2. Confirm all team reports are synthetic.
3. Confirm each expected snapshot has a traceable `sourceReportId`.
4. Confirm `docs/review-notes.md` documents out-of-scope live analytics
   behavior.
5. Confirm no files outside `tools/v2/team/team-analytics-dashboard/` changed.

## Edge Cases Covered

- healthy team with low backlog
- watch state with growing backlog
- needs-attention state with slow response time
- blocked state with incomplete source data

## Future Integration Tests

When implementation code is added, add tests for:

- configurable response-time thresholds
- stale report detection
- role-based dashboard access
- anonymized aggregate metrics
- notification throttling and audit log creation
