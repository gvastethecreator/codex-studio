# Codex Studio Plan

## Goal

Turn the existing visual app into a local studio for generating, organizing, and managing images with the authenticated Codex/ChatGPT session on the user's machine, without requiring `OPENAI_API_KEY` for the main flow.

The studio should use `codex app-server` as the local programmatic integration and `$imagegen` or the current Codex image-generation capability when real generation runs through Codex.

## Product constraints

- The Studio Library lives outside the repo, by default under the user's home directory at `~/AI-Studio-Library`.
- `STUDIO_LIBRARY_DIR` in `.env.local` configures the library path.
- SQLite inside the Studio Library is the local source of truth.
- The generation queue runs in the backend and can survive UI closure.
- The first reliable path must include dry-run validation and real Codex generation.
- Projects, libraries, jobs, logs, and assets should be inspectable from the UI.

## Target architecture

- React/Vite UI for the studio surface.
- Bun/Hono local backend for API, worker, Studio Library access, SQLite, and SSE.
- `codex app-server` supervised by the backend.
- Provider Boundary for Codex-first generation and future/external providers.
- Image Catalog as the durable model for generated assets.
- External Output Sources as the safe import path for unmanaged folders.

## First-run flow

1. `bun run studio:init` creates the Studio Library, logs, SQLite state, and `.env.local` if needed.
2. `bun run dev` starts the local backend and UI.
3. Onboarding validates backend reachability, Studio Library readiness, Codex CLI availability, `codex app-server`, and Local Codex Session state.
4. The user can run a dry-run or create a real generation job.
5. The backend writes assets, transcripts, logs, and catalog entries.
6. The UI refreshes from `/api/catalog` and live SSE events.

## Open-source preparation

- Keep documentation English and first-user oriented.
- Keep generated assets, SQLite files, logs, local prompts, and machine paths out of the repo.
- Keep Provider Secrets outside SQLite-backed Studio Settings.
- Add standard community health files for GitHub.
- Keep validation commands documented and runnable.

## Risks

- Codex CLI behavior and `codex app-server` availability may vary by local installation.
- Real generation may require approvals or permissions depending on local Codex configuration.
- Electron packaging is exploratory until Bun + local backend + app-server supervision are solved cleanly.
