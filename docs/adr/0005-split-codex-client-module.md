# ADR 0005: Split Codex Client Module

## Status

Proposed.

## Context

The original Codex client concentrated process supervision, JSON-RPC transport, session pooling, image extraction, and turn orchestration in one large module.

## Decision

Split Codex integration into focused modules under `apps/local-server/src/codex/`:

- process supervision;
- RPC transport;
- session pooling;
- model/session discovery;
- turn orchestration;
- asset extraction.

## Consequences

- Codex integration is easier to test and debug;
- process lifecycle failures are separated from turn execution failures;
- future Codex runtime changes can be localized.
