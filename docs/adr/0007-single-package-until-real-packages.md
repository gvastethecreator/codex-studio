# ADR 0007: Single package until real packages

## Status

Accepted

## Context

Root declared Bun workspaces without child package manifests.

## Decision

Remain a single Bun package until a verified packaging need requires real package.json boundaries.

## Consequences

- Remove fake root `workspaces` declarations.
- Prefer logical module splits over monorepo fashion.
