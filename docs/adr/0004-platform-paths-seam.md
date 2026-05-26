# ADR 0004: Platform Paths Seam

## Status

Proposed.

## Context

Some early code used hardcoded Windows paths and machine-specific assumptions. A local-first open-source app must work across Windows, macOS, and Linux.

## Decision

Introduce a platform path seam that resolves home-based defaults and Studio Library paths through a shared helper instead of scattered string literals.

## Consequences

- cross-platform setup becomes easier to reason about;
- tests can exercise path behavior without depending on a contributor's machine;
- path policy is centralized before desktop packaging work begins.
