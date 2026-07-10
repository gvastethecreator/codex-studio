# ADR 0004: Revisioned Studio event synchronization

Status: Accepted

Studio state changes carry monotonic Studio Event Revisions and reach each SSE client through a bounded serialized writer. Reconnect correctness comes from revision continuity plus scoped snapshot reconciliation; full historical replay is added only when a concrete recovery requirement exceeds what durable state snapshots can prove.

## Consequences

- Clients can distinguish an ordered continuation from a missed-change reconciliation.
- Slow clients cannot create unbounded concurrent `writeSSE` work.
- Event payloads remain compact invalidations; Persistent Jobs, Catalog Entries, and logs remain durable truth.
- Process restart or revision discontinuity requires a scoped snapshot instead of pretending replay is complete.
- A `server.connected` frame is authoritative for the new process epoch. Clients reset their local revision to the server revision after requesting reconciliation, even when the new value is lower.
