# ADR 0005: Persistent Jobs as queue truth

Status: Accepted

Persistent Job Intake records the complete executable queue before work begins, and the UI projects progress from Persistent Jobs plus Catalog Entries. The browser submits directly through the generation pipeline and does not own a parallel queue lifecycle.

## Consequences

- Pending work survives refresh before its first item starts.
- Generation requests dispatch directly to Persistent Job Intake; backend worker concurrency owns waiting.
- Retry, cancellation, recovery, and progress have one durable lifecycle.
- Job Summaries carry the compact workspace, recipe, and aspect-ratio facts needed for refresh-safe presentation.
- The former browser queue, backend-link reconciliation, cooldown, and Force mode are removed rather than kept as compatibility machinery.
