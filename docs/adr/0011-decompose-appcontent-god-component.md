# ADR 0011: Decompose AppContent God Component

## Status

Proposed.

## Context

`AppContent.tsx` owned routing, onboarding, command handlers, queue behavior, modals, overlays, and layout. A large shell component makes small changes risky and hard to review.

## Decision

Decompose `AppContent` into focused shell modules:

- route interpretation;
- command orchestration;
- modal/overlay composition;
- panel layout;
- queue and status surfaces;
- provider/onboarding readiness surfaces.

## Consequences

- smaller files with clearer purpose;
- easier UI testing;
- lower risk when changing one surface;
- temporary prop drilling may exist during migration until ownership boundaries settle.
