# ADR 0010: Decompose God Contexts

## Status

Proposed.

## Context

Large React contexts accumulated unrelated responsibilities: generation state, assets, selection, UI state, modals, settings, and persistence. This made rendering behavior and tests difficult to isolate.

## Decision

Split broad contexts into smaller providers and hooks grouped by ownership:

- generation state and queue;
- catalog/assets;
- selection and workspace state;
- modal/panel UI state;
- settings and runtime readiness.

## Consequences

- fewer unrelated re-renders;
- hooks become easier to test;
- ownership boundaries are clearer for future contributors;
- migration should happen incrementally to avoid destabilizing the shell.
