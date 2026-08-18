# Codex Studio Agent Guide

This file is for agents that work in this repo. Vocabulary lives in `CONTEXT.md`. System shape lives in `docs/ARCHITECTURE.md`. Specialized workflows live in `SKILLS.md`.

## Current direction

- Codex Studio is Codex-first, local-first, and library-backed.
- `codex app-server` is the interactive Codex Product Runtime.
- Codex SDK or scripts are Codex Automation Surface only: audits, migrations, tests, and maintenance.
- Generation Task and Generation Provider are separate concepts.
- Recipe Modules must produce Generation Task Specs.
- Providers compile specs into compact provider inputs.
- Studio Settings are editable app preferences. Bootstrap Configuration and Provider Secrets stay outside SQLite-backed settings.
- The top toolbar is the Command Center.
- Heavy diagnostics, settings, provider internals, and visual effects must be Demand-Mounted Surfaces.

## Setup / first run

If the user asks for setup, getting started, first run, or onboarding, or if the checkout is not initialized, use `skills/codex-studio-setup/SKILL.md` before ad hoc commands.

Setup agent flow:

1. Read this guide, `README.md`, `SKILLS.md`, and `skills/codex-studio-setup/SKILL.md`.
2. Inspect repo and app-owned runtime state without printing secrets:
   - `git status --short`
   - Bun can run repo scripts. Record tool metadata only when it helps diagnosis.
   - Codex Runtime Doctor status, app-server support, and selected executable. Record CLI metadata only when it helps diagnosis.
   - `.env.local` presence
   - Studio Library path and initialization state
   - `/api/health` and `/api/codex/session` when the server is reachable
3. Run `bun install` only when dependencies are missing or stale enough to block setup.
4. Run `bun run studio:init` when `.env.local`, the Studio Library, SQLite state, the default library, or the default project is missing.
5. Start or make sure that the local runtime works with `bun run dev` when needed. Then make sure that the UI and backend are healthy.
6. If ChatGPT auth is missing, stop. Ask the user to run `codex login` and choose ChatGPT. Do not claim setup is complete until that user-only step is done and you make sure that it works.
7. Do not block setup on an exact Bun or Codex release when readiness, supported scripts, app-server support, and Local Codex Session are healthy.
8. Close with one validation pass and a short readiness summary.

## Required context pass

Before architecture or runtime work, read:

1. `CONTEXT.md`
2. `docs/ARCHITECTURE.md`
3. `ROADMAP.md`
4. `SKILLS.md` when the change touches providers, recipes, presets, output, storage, or setup workflows

Before UI work, also read:

1. `docs/DESIGN.md`
2. `components/HeaderToolbar.tsx`
3. `components/ui/TopToolbar.tsx`
4. `hooks/useStudioShell.ts`

Before provider, recipe, preset, or output work, also read `SKILLS.md`.

## Commands

Use Bun scripts. Prefer focused tests while you iterate. Then run the full gate at close.

```bash
bun run test
bun run check
bun run build
bun run validate:fast
bun run validate:full
```

For focused unit tests:

```bash
vp test run path/to/test.ts
```

If `rg` fails on Windows in this checkout, use PowerShell `Get-ChildItem` and `Select-String`.

## Safety rules

- Never delete, move, or rewrite Studio Library data unless the user asks for that action.
- Do not operate on arbitrary paths. Register or import External Output Sources first.
- Do not store Provider Secret values in SQLite, catalog metadata, logs, screenshots, or docs.
- Do not commit `.env.local`, generated images, SQLite DBs, transcripts, logs, or local output folders.
- Preserve dirty worktree changes that you did not make.
- Use `apply_patch` for manual file edits.
- Keep `CONTEXT.md` glossary-only.

## Code rules

- Shared domain contracts belong in `packages/shared/src`.
- Frontend backend calls go through the domain modules under `services/studio-api/` or `services/studioEventSource.ts`.
- Backend provider execution belongs behind provider adapters, not route handlers.
- Job kinds must describe provider-independent tasks.
- Provider-specific options belong in provider settings or input, not generic task names.
- New behavior needs tests. Use `vite-plus/test`.
- Keep the legacy workspace snapshot shape export-only. Durable and UI image truth is Catalog Entry.

## Validation closeout

Do not claim completion without fresh command output. Minimum closeout for broad changes:

```bash
bun run test
bun run check
bun run build
```

If one gate cannot run, report the exact command, the failure or blocker, and the risk.

## Agent skills

### Issue tracker

GitHub Issues and the linked GitHub Project hold live state. `.scratch/` holds synchronized local mirrors. See `docs/agents/issue-tracker.md`.

### Triage labels

Use `bug` and `enhancement` categories with `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Use the single-context layout rooted at `CONTEXT.md` and `docs/adr/`. See `docs/agents/domain.md`.
