# ADR 0018: Codex-First Provider Boundary

## Status

Accepted.

## Context

The product is Codex-first, but provider-specific details should not leak through the UI or core task model. Additional providers such as fal.ai, Google Gemini, and ComfyUI can exist as optional adapters.

## Decision

Introduce a Provider Boundary that keeps Codex as the default adapter while modeling other providers behind the same backend contract.

## Consequences

- the UI sends provider-independent Generation Tasks;
- optional providers do not dilute the primary Codex product story;
- provider secrets stay in backend runtime configuration, not browser state.
