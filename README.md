# Codex Studio

> A local-first image studio that uses your authenticated Codex/ChatGPT session — no `OPENAI_API_KEY` required.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Bun](https://img.shields.io/badge/runtime-Bun-black?logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)

**Current status: early open-source preview.** The technical foundation works well locally. The current goal is to polish onboarding, documentation, and ergonomics so more people can install it without needing to know the repo's internal history.

## Why this project is interesting

- **No `OPENAI_API_KEY` required** for the main flow.
- **Uses your local Codex/ChatGPT session** already authenticated on your machine.
- **Persistent job queue** with local execution tracking backed by SQLite.
- **Assets, logs, and transcripts live outside the repo**, in a configurable local library.
- **Full creative UI** with recipes, workspaces, visual grid, and review tools.
- **Multiple provider support** — Codex (primary), fal.ai, Google Gemini, ComfyUI (planned).

## How it works

1. The React/Vite UI receives prompts, recipes, reference images, and user actions.
2. The local Bun/Hono backend creates and supervises persistent jobs.
3. `codex app-server` executes real Codex turns to generate or edit images.
4. The local library stores assets, SQLite, transcripts, and operational logs.
5. The UI catches up over HTTP, listens to live activity over SSE, and maintains a compatible visual cache so the studio stays usable even when generation happens outside the browser.

## Data model

- **SQLite + Image Catalog** are the durable source of truth for jobs, catalogued images, libraries, and logs.
- **IndexedDB** keeps `GenerationBatch[]` in `catalog-cache` as a visual compatibility cache for the current grid.
- **`GET /api/events`** distributes live job, log, and asset events to the frontend.
- **`/api/codex/session`** is the canonical read of the local Codex/ChatGPT session used by onboarding and diagnostics.

## Prerequisites

Before starting the studio, make sure you have:

- **Bun** installed and available in PATH — [bun.sh](https://bun.sh)
- **Codex CLI** installed and authenticated with a **ChatGPT login** on the same machine.
- `codex app-server` support from that Codex installation.
- A modern browser with IndexedDB support.

If Codex is missing or the local session is unavailable, the UI can start but real generation will not complete. See [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md) for common issues.

## Quick start

```bash
bun install
bun run studio:init
bun run dev
```

After that you should have:

- UI: <http://localhost:17222>
- Local API: <http://localhost:17223/api/health>
- Default library: `~/AI-Studio-Library` (on Windows: `%USERPROFILE%\AI-Studio-Library`)
- Logs: `~/AI-Studio-Library/logs`
- SQLite: `~/AI-Studio-Library/db/studio.sqlite`

### First run

`bun run studio:init` creates the local library structure, initializes SQLite, generates a default project, and creates `.env.local` if it does not yet exist.

The repo ships `.env.example` with safe placeholders so tools, tasks, and new environments have explicit variables from the first clone. Machine-specific values should go in `.env.local`.

The UI automatically opens a first-run guide to verify the local backend, Codex CLI, `codex app-server`, and the library path. You can reopen it at any time from the `Setup` button in the header.

To start only part of the system:

- `bun run dev:ui` — Vite UI without the local backend.
- `bun run dev:server` — Hono API + `codex app-server` supervisor.
- `bun run dev:electron` — Electron desktop shell over the local dev flow.

## Local configuration

The backend loads values from `.env.local`. You can let `bun run studio:init` create it automatically or copy the template from `.env.example`.

Available variables:

- `STUDIO_LIBRARY_DIR`
- `STUDIO_SERVER_PORT`
- `STUDIO_CODEX_WS_PORT`
- `VITE_STUDIO_API_BASE`

Optional Electron shell variables:

- `STUDIO_ELECTRON_API_BASE` — reuse an already-running local backend instead of `http://localhost:17223`.
- `STUDIO_ELECTRON_RENDERER_URL` — point the desktop shell to a Vite dev server other than the default `http://localhost:17222`.

Example library paths:

- Windows: `%USERPROFILE%\AI-Studio-Library`
- macOS: `/Users/<your-user>/AI-Studio-Library`
- Linux: `/home/<your-user>/AI-Studio-Library`

## Useful scripts

```bash
bun run dev           # local backend + integrated UI
bun run dev:server    # Hono API + codex app-server supervisor
bun run dev:ui        # Vite+ UI only (vp dev)
bun run dev:electron  # Electron desktop shell for local development
bun run studio:init   # create library, SQLite, and default project
bun run styles:validate # validate granular style manifests
bun run fmt           # format with Oxfmt via Vite+
bun run lint          # lint with Oxlint via Vite+
bun run check         # unified format + lint + type-check via Vite+
bun run test          # unit test suite with Vitest via Vite+
bun run test:unit     # quick subset for iteration
bun run test:coverage # HTML coverage + console summary
bun run validate:fast # fast loop: unit tests + server verification
bun run validate:full # full gate: check + tests + build
bun run build         # build UI (Vite+/Rolldown) + backend verification
bun run preview:electron # test Electron shell loading `dist/`
bun run tooling:logs  # open `logs/tooling` with latest command logs
```

For large refactors, use `bun run validate:fast` while iterating and `bun run validate:full` at close. `bun run check` runs the unified format, lint, and type-check loop over Vite+, making it the recommended command for local validation.

VS Code tasks in `.vscode/tasks.json` mirror this flow with short emoji-labeled names.

### Tooling logs

Quality and build commands (`fmt`, `lint`, `check`, `test`, `build`, `validate:*`) write persistent logs to `logs/tooling/`.

- Each run generates a timestamped file.
- A `*.latest.log` per task is also updated.
- This makes it easy to debug intermittent failures without re-running commands just to read the console.

## Repository structure

```text
.
├─ apps/local-server/     # local Bun/Hono backend and worker
├─ components/            # main studio UI
├─ contexts/              # global and generation state
├─ docs/                  # architecture, services, ADRs, and guides
├─ hooks/                 # sync, pipeline, and persistence
├─ packages/shared/       # types shared between UI and backend
├─ scripts/               # initialization scripts and internal utilities
└─ services/              # frontend adapters toward the local backend
```

### Style preset manifests

Legacy monolithic packs are retired. The main loader consumes the granular structure:

- `components/recipes/styles/manifests/packs/*.yaml` — lightweight Style Pack Manifests, categories, and references.
- `components/recipes/styles/manifests/presets/<pack>/<preset>.yaml` — editable Style Preset Manifests, one file per preset.

Edit the granular manifests under `components/recipes/styles/manifests/`. `bun run styles:split` refuses to overwrite them from legacy YAML. `styles:source:verify` fails if legacy YAML reappears or if the runtime re-uses retired pack exports. The UI consumes `StyleRuntimePack` through compact loaders generated from the granular manifests.

## Documentation

- [`CONTEXT.md`](./CONTEXT.md) — canonical project language and terms.
- [`AGENTS.md`](./AGENTS.md) — rules for agents and automated contributors.
- [`SKILLS.md`](./SKILLS.md) — specialized workflows for providers, recipes, presets, settings, and outputs.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — system overview.
- [`docs/SERVICES.md`](./docs/SERVICES.md) — service map and integration points.
- [`docs/DEV_GUIDE.md`](./docs/DEV_GUIDE.md) — conventions for extending recipes and UI.
- [`docs/TOOLING.md`](./docs/TOOLING.md) — current tooling stack, commands, and logs.
- [`docs/ELECTRON.md`](./docs/ELECTRON.md) — strategy and constraints for a future desktop build.
- [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md) — common setup and runtime errors.
- [`docs/IMPLEMENTATION_LOG.md`](./docs/IMPLEMENTATION_LOG.md) — log of applied tasks during the catch-up phase.
- [`docs/TECHNICAL_DEBT.md`](./docs/TECHNICAL_DEBT.md) — known technical debt and next focus areas.
- [`docs/adr/0001-local-codex-studio.md`](./docs/adr/0001-local-codex-studio.md) — foundational architectural decision.
- [`ROADMAP.md`](./ROADMAP.md) — product priorities for the open-source stage.

## Contributing

If you want to help prepare the project for a more solid open-source release, see [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## License

This repository is distributed under the [MIT](./LICENSE) license.
