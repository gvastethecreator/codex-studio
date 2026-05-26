# ADR 0021: Store Task Spec, Compile Provider Input

## Status

Accepted.

## Context

Persisting only provider payloads loses product intent and makes old jobs hard to inspect. Persisting only UI state is not sufficient for reliable replays.

## Decision

Persist Task Specs and compile provider input when execution starts. Provider payloads may be logged as redacted diagnostics, but Task Specs are the primary durable artifact.

## Consequences

- jobs are inspectable and replayable at the product level;
- provider migrations are easier;
- compilation behavior must be deterministic and covered by tests.
