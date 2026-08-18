# Electron: proposed direction

This document does not announce an Electron release. It defines a gradual desktop strategy. The renderer must not couple to desktop APIs.

## Current state

The primary flow is still React/Vite UI plus a local Bun/Hono backend over HTTP.

The key seam is Studio Runtime. The renderer resolves `apiBase` in this order: `window.codexStudio?.apiBase`, then `VITE_STUDIO_API_BASE`, then localhost.

## Fast path

1. Run `bun run dev:electron` to try the desktop shell in development.
2. Run `bun run preview:electron` to load a local build.
3. Keep the web app as the primary path while the runtime stabilizes.

## Security baseline

- Use an explicit `preload` script for `BrowserWindow`.
- Keep `nodeIntegration: false`.
- Keep `contextIsolation: true`.
- Use `sandbox: true` when it works.
- Expose only minimal wrappers through `contextBridge`.
- Block unexpected navigation and arbitrary window opens.

## Real friction

The hard part is not opening an Electron window. The hard part is packaging the local backend, including Bun and `codex app-server`, inside a desktop distribution.

## Phased strategy

| Phase | Goal                                                   |
| ----- | ------------------------------------------------------ |
| 1     | Prepared renderer with a stable runtime seam           |
| 2     | Minimal desktop adapter (`main` + `preload`)           |
| 3     | Serious packaging with embedded Bun or another runtime |

## Current practical decision

- Do not attempt a final Electron release yet.
- Consolidate runtime and onboarding. Decouple the renderer.
- Treat Electron as a future adapter, not a rewrite.

## Pre-distribution checklist

- [ ] Define Bun packaging and supervision.
- [ ] Make sure that `codex app-server` works in a distributed app.
- [ ] Review Studio Library paths per OS.
- [ ] Define the health and log channel between main, preload, and renderer.
