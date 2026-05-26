# ADR 0024: Toolbar Command Center

## Status

Accepted.

## Context

Primary actions were scattered across panels, modals, and contextual controls. This made keyboard/accessibility work and contributor navigation harder.

## Decision

Treat the toolbar as a command center for high-frequency actions and route commands through explicit handlers instead of burying behavior in leaf controls.

## Consequences

- core actions are easier to find;
- command handlers can be tested and reused;
- panels can stay focused on local state and presentation.
