# Electron: Proposed Direction

This document does not announce an immediate Electron release. It defines a gradual strategy for desktop support without coupling the renderer to desktop APIs.

## Current State

The primary flow is still React/Vite UI + local Bun/Hono backend over HTTP.

The key seam is `Studio Runtime`: the renderer resolves `apiBase` dynamically (`window.codexStudio?.apiBase` -> `VITE_STUDIO_API_BASE` -> localhost by default).

## Fast Path

1. `bun run dev:electron` validates the desktop shell in development.
2. `bun run preview:electron` tests local build loading.
3. Keep the web app as the primary path while the runtime stabilizes.

## Security Baseline

- Use an explicit `preload` script for `BrowserWindow`.
- Keep `nodeIntegration: false`.
- Keep `contextIsolation: true`.
- Use `sandbox: true` when viable.
- Expose only minimal wrappers through `contextBridge`.
- Block unexpected navigation and arbitrary window opens.

## Real Friction

The hard part is not opening an Electron window. The hard part is packaging the local backend correctly, including Bun and `codex app-server`, inside a desktop distribution.

## Phased Strategy

| Phase | Goal                                                   |
| ----- | ------------------------------------------------------ |
| 1     | Prepared renderer with a stable runtime seam           |
| 2     | Minimal desktop adapter (`main` + `preload`)           |
| 3     | Serious packaging with embedded Bun or another runtime |

## Current Practical Decision

- Do not attempt a final Electron release yet.
- Consolidate runtime/onboarding and decouple the renderer.
- Treat Electron as a future adapter, not a rewrite.

## Pre-Distribution Checklist

- [ ] Define Bun packaging/supervision.
- [ ] Validate `codex app-server` behavior in a distributed app.
- [ ] Review Studio Library paths per OS.
- [ ] Define the health/log channel between main, preload, and renderer.
