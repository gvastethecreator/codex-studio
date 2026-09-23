# Codex Studio agent rules

This file is for agents that work in this repo.

## Setup

If the user asks for setup, getting started, first run, or onboarding, or if the checkout is not initialized, follow `skills/codex-studio-setup/SKILL.md` before ad hoc commands.

1. Read this file, `README.md`, and `skills/codex-studio-setup/SKILL.md`.
2. Inspect repo and app-owned runtime state without printing secrets: `git status --short`, Codex Runtime Doctor, `.env.local` presence, Studio Library init, `/api/health`, and `/api/codex/session` when reachable.
3. Run `bun install` only when missing or stale dependencies block setup.
4. Run `bun run studio:init` when `.env.local`, the Studio Library, SQLite state, the default library, or the default workspace is missing.
5. Start the local runtime with `bun run dev` when needed, then confirm the UI and backend are healthy.
6. If ChatGPT auth is missing, stop. Ask the user to Sign in from Studio Settings, or run `codex login` and choose ChatGPT.
7. Do not block setup on an exact Bun or Codex release when readiness, supported scripts, app-server support, and Local Codex Session are healthy.
8. Close with one validation pass and a short readiness summary.

## Commands

Use Bun scripts. Select affected tests at integration; use the full gate for broad changes. Do not run an aggregate and its included checks twice.

```bash
bun run test
bun run check
bun run build
bun run validate:fast
bun run validate:full
```

For focused unit tests:

```bash
bun run test -- path/to/test.ts
```

If `rg` fails on Windows in this checkout, use PowerShell `Get-ChildItem` and `Select-String`.

## Safety

- Never delete, move, or rewrite Studio Library data unless the user asks for that action.
- Do not operate on arbitrary paths. Register or import External Output Sources first.
- Do not store Provider Secret values in SQLite, catalog metadata, logs, screenshots, or docs.
- Do not commit `.env.local`, generated images, SQLite DBs, transcripts, logs, or local output folders.
- Preserve dirty worktree changes that you did not make.
- Never print secrets.

## Code

- Shared domain contracts belong in `packages/shared/src`.
- Frontend backend calls go through `services/studio-api/` or `services/studioEventSource.ts`.
- Backend provider execution belongs behind provider adapters, not route handlers.
- Job kinds must describe provider-independent tasks.
- Provider-specific options belong in provider settings or input, not generic task names.
- New behavior needs tests. Reuse a nearby case for meaningful uncovered behavior. Import test APIs from `vitest`; `vitest.config.ts` owns test configuration.
- Keep the legacy workspace snapshot shape export-only. Durable and UI image truth is Catalog Entry.

## Agent skills

### Issue tracker

GitHub Issues and Project `#8` hold live state. `.scratch/` holds synchronized local mirrors. See `docs/agents/issue-tracker.md`.

### Triage labels

Use `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, or `wontfix` for triage. See `docs/agents/triage-labels.md`.

### Domain docs

This repository uses one product context. Read the root `CONTEXT.md` and relevant `docs/adr/` entries when they exist. See `docs/agents/domain.md`.

### Style curation continuation

For category/preset curation, read `docs/styles/curation-v2/agent-kit/START-HERE.md`. Generate one bounded packet with `bun scripts/style-curation/agent-kit.mjs packet --key="<exact key from list>"`. Keep original identities, distinguish visual styles from modifiers/profiles/themes, and record real validation separately from pending image review. The kit is not permission to archive, migrate user data, call providers or mark the PR accepted. Its report validator checks records, not image quality.

## Closeout

Do not claim completion without fresh command output. Minimum closeout for broad changes:

```bash
bun run test
bun run check
bun run build
```

If one gate cannot run, report the exact command, the failure or blocker, and the risk.
