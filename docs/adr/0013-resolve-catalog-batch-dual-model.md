# ADR 0013: Resolve Catalog/Batch Dual Model

## Status

Proposed.

## Context

The app still contains legacy Visual Batch state while the backend catalog is the durable source of truth. Keeping both as primary models creates synchronization bugs and unclear ownership.

## Decision

Promote Catalog Entries to the durable model. Keep `GenerationBatch[]` only as a visual compatibility projection at the UI boundary until legacy consumers are migrated.

## Consequences

- reload behavior becomes deterministic;
- search, filtering, and metadata live in the catalog;
- old UI surfaces can migrate gradually;
- every new feature should prefer catalog IDs over batch-local identities.
