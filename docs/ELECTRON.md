# Electron development shell

This document does not announce an Electron release. It describes the current development shell and a gradual desktop strategy. The renderer must not couple to desktop APIs.

## Current state

The user channel for this spec is a browser against local-server: `bun run dev` in a checkout, or the portable `Codex Studio.bat` / `Codex Studio.command` launchers after unzip. Electron is not that channel.

The renderer must not couple to desktop APIs. The key seam is Studio Runtime. The renderer resolves `apiBase` in this order: `window.codexStudio?.apiBase`, then `VITE_STUDIO_API_BASE`, then localhost.

## Development shell only

These commands are for developers. They are not first-run onboarding and not the user channel.

1. Run `bun run dev:electron` to try the desktop shell in development.
2. Run `bun run preview:electron` to load a local build.
3. Keep unzip + launcher + browser, or `bun run dev`, as the user path.

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

- Electron is an optional development Studio Runtime shell. It is not the packaged user product for this spec.
- Do not treat `bun run dev:electron` as first-run onboarding.
- This spec does not add electron-builder, does not bundle Bun or Codex CLI, and does not bundle ChatGPT login.
- Consolidate runtime and onboarding on local-server plus the browser. Decouple the renderer.

## Pre-distribution checklist

- [ ] Define Bun packaging and supervision.
- [ ] Make sure that `codex app-server` works in a distributed app.
- [ ] Review Studio Library paths per OS.
- [ ] Define the health and log channel between main, preload, and renderer.
