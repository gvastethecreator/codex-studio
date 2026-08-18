# ADR 0004: Revisioned Studio event synchronization

Status: Accepted

Studio state changes carry monotonic Studio Event Revisions. Each SSE client receives them through a bounded serialized writer. Reconnect correctness comes from revision continuity plus scoped snapshot reconciliation. Full historical replay is added only when a concrete recovery requirement exceeds what durable state snapshots can prove.

## Consequences

- Clients can distinguish an ordered continuation from a missed-change reconciliation.
- Slow clients cannot create unbounded concurrent `writeSSE` work.
- Event payloads remain compact invalidations. Persistent Jobs, Catalog Entries, and logs remain durable truth.
- Process restart or revision discontinuity requires a scoped snapshot. Do not pretend replay is complete.
- A `server.connected` frame is authoritative for the new process epoch. Clients reset their local revision to the server revision after they request reconciliation, even when the new value is lower.
