# ADR 0005: Persistent Jobs as queue truth

Status: Accepted

Persistent Job Intake records the complete executable queue before work begins, and the UI projects queue groups and progress from Persistent Jobs plus Catalog Entries. IndexedDB queue state becomes temporary compatibility only and is removed after every caller has migrated.

## Consequences

- Pending work survives refresh before its first item starts.
- Browser presentation items are dispatched to Persistent Job Intake immediately; browser concurrency/rest state never leaves a backlog waiting only in React state.
- Retry, cancellation, recovery, and progress have one durable lifecycle.
- The migration uses expand-contract so existing browser queue sessions remain readable until compatibility removal is proven.
