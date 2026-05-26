# ADR 0007: Consolidate Generation Flows

## Status

Proposed.

## Context

Image generation and image editing paths duplicated job orchestration logic. Duplication made behavior drift likely and hid bugs in one-off call paths.

## Decision

Route generation-like work through the same local generation pipeline and persistent job model. Specialized inputs, such as an edit input image, should be modeled as task assets rather than separate orchestration.

## Consequences

- generation and editing share queue, catalog, logs, and error behavior;
- tests can cover one pipeline;
- provider adapters receive a consistent Generation Task contract.
