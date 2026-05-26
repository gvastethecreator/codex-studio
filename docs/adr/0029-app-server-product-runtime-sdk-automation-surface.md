# ADR 0029: App Server as Product Runtime and SDK Automation Surface

## Status

Accepted.

## Context

`codex app-server` can act both as the product runtime for local generation and as a future automation/SDK surface. Treating it as incidental tooling would understate its architectural role.

## Decision

Use `codex app-server` as the primary product runtime integration for Codex-backed generation and expose backend seams that can later support SDK-style automation.

## Consequences

- Codex integration is explicit in the architecture;
- runtime readiness and diagnostics are first-class UI concerns;
- future automation can reuse the same backend contracts.
