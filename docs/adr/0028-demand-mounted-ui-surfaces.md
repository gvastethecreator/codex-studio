# ADR 0028: Demand-Mounted UI Surfaces

## Status

Accepted.

## Context

Heavy surfaces such as modals, dashboards, editors, and inspectors can add render and bundle cost even when hidden.

## Decision

Mount heavy UI surfaces on demand. Keep lightweight triggers and state in the shell, but defer heavy components until opened or needed.

## Consequences

- initial render is lighter;
- hidden surfaces do less work;
- state restoration and focus behavior must be handled carefully when surfaces mount and unmount.
