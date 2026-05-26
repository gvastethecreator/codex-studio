# ADR 0001: Local Codex Studio

## Status

Accepted.

## Context

The original app was a React/Vite SPA for browser-based image generation. The new product direction is a local-first studio that uses the user's authenticated Codex/ChatGPT session through `codex app-server`, without requiring `OPENAI_API_KEY` for the main flow.

## Decision

Build Codex Studio as a local app with:

- a Bun/Hono backend;
- `codex app-server` supervised by the backend;
- SQLite in an external Studio Library;
- React/Vite as the studio UI;
- `~/AI-Studio-Library` as the default library path;
- Codex image generation as the primary generation route.

Browser automation is not the critical path. It can be explored later as an auxiliary fallback if needed.

## Consequences

Positive:

- no direct API key requirement for the primary flow;
- jobs and assets survive UI reloads;
- the Studio Library is portable and separate from the source repo;
- logs and transcripts make real generations debuggable.

Negative:

- the product depends on Codex being installed, authenticated, and available on the machine;
- `codex app-server` behavior may change and must be validated against the real process;
- the backend must manage child processes, logs, filesystem, and failure modes.
