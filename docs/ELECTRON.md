# Electron: Proposed Direction

This document does not announce an immediate Electron release. It defines the recommended path toward desktop support without turning the renderer into a bundle of desktop APIs.

## Current state

Today the product works as a React/Vite UI that talks to a local Bun/Hono backend over HTTP. That flow is useful and remains the main path.

The key piece that prepares the ground is **Studio Runtime**:

- the renderer no longer blindly assumes `http://localhost:17223`;
- it first tries `window.codexStudio?.apiBase`;
- then `VITE_STUDIO_API_BASE`;
- and only then falls back to the default localhost value.

This gives the app a real seam for a future desktop adapter.

The repo also includes a minimal Electron shell to explore that path without promising final packaging yet:

- `bun run dev:electron` — starts the local backend + Vite + an Electron window against the dev server.
- `bun run preview:electron` — builds `dist/`, starts the local backend, and loads the packaged UI inside Electron.

If the backend or renderer is already running, the scripts try to reuse them before starting new processes.

Useful variables:

- `STUDIO_ELECTRON_API_BASE` points to another local backend.
- `STUDIO_ELECTRON_RENDERER_URL` uses another dev server during `dev:electron`.

## Security baseline

Based on current Electron guidance, this project should preserve these rules:

- `BrowserWindow` with explicit `preload`;
- `nodeIntegration: false`;
- `contextIsolation: true`;
- `sandbox: true` when viable for the real needs;
- expose only minimal wrappers from `preload` through `contextBridge`;
- do not leak the full `ipcRenderer` into the renderer;
- block unexpected navigation and arbitrary window opens.

In development, Electron can load the dev server URL. In production, it must load packaged local files.

## The real friction

The Electron window itself is not the hard part. The real bottleneck is the local backend:

- `apps/local-server` uses Bun-specific APIs like `Bun.serve` and `Bun.file`;
- Electron's desktop main process runs on Node, not Bun;
- the product also depends on `codex app-server` and the user's authenticated local session.

In other words: adding a `BrowserWindow` is easy. Packaging the full local runtime correctly is the serious part.

## Recommended phased strategy

### Phase 1: renderer prepared

Partially done now:

- the renderer resolves its API base from runtime;
- onboarding already validates backend, Codex CLI, `codex app-server`, and local library;
- the UI remains functional in the browser without being tied to Electron.

### Phase 2: minimal desktop adapter

Goal:

- create `main` + `preload` processes;
- load the Vite UI in dev and static files in production;
- inject `window.codexStudio.apiBase` from `preload`;
- keep the local backend as a separate process supervised by desktop.

Current state:

- `electron/main.cjs` creates a safe `BrowserWindow` and blocks unexpected navigation;
- `electron/preload.cjs` exposes only `window.codexStudio` through `contextBridge`;
- `dev:electron` and `preview:electron` start the desktop shell without coupling the renderer to Electron APIs.

This phase avoids rewriting the renderer and makes Electron a new adapter at the Studio Runtime seam.

### Phase 3: serious packaging

Options to evaluate:

1. package Bun with the app and supervise `apps/local-server` as a child process;
2. port the local backend adapter to a Node-compatible runtime if Electron becomes the main distribution channel.

Option 1 preserves more current code. Option 2 reduces external runtime dependencies, but requires more backend-adapter work.

## Practical decision for now

For the next open-source stage, the recommendation is:

- **do not** attempt a full Electron release yet;
- **do** keep consolidating Studio Runtime and onboarding;
- **do** keep the renderer free of direct Electron dependencies;
- **do** treat Electron as a future adapter, not as a product rewrite.

In short: there is already a working desktop shell to validate UX and seams. There is not yet a final packaged and supported desktop distribution.

## Checklist before attempting a desktop build

- define how Bun will be packaged or supervised;
- confirm `codex app-server` behavior inside a distributed desktop app;
- review OS-specific Studio Library paths;
- decide the logs and health-check channel between main, preload, and renderer;
- add navigation and window-open restrictions from the first prototype.
