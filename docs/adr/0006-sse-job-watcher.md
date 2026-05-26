# ADR 0006: SSE Job Watcher

## Status

Proposed.

## Context

The frontend had multiple polling loops even though the backend exposed live server-sent events at `/api/events`.

## Decision

Use `services/studioEventSource.ts` as the shared SSE adapter and provide `watchJob()` for Promise-style terminal job waiting. General sync and generation waiting should share the same event stream where possible.

## Consequences

- less polling noise;
- faster job state updates;
- one connection can feed jobs, assets, logs, and connection status;
- reconnection and catch-up behavior becomes a shared concern.
