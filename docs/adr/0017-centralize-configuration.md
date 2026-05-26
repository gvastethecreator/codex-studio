# ADR 0017: Centralize Configuration

## Status

Proposed.

## Context

Configuration values were scattered across env parsing, scripts, docs, UI assumptions, and backend defaults. This increases setup friction and makes releases fragile.

## Decision

Centralize runtime configuration around a typed config module and documented `.env.example`. The backend owns server/library/provider configuration. The UI consumes runtime readiness and public configuration through API endpoints, not duplicated constants.

## Consequences

- setup instructions and runtime behavior stay aligned;
- missing or invalid settings can produce actionable diagnostics;
- CI and local development use the same documented defaults;
- configuration changes require updates to docs and validation tests.
