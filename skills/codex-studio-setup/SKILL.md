---
name: codex-studio-setup
description: Set up a local Codex Studio checkout end to end from the welcome-screen handoff prompt.
---

# Codex Studio Setup

Use when a user asks to make this repo ready for first run, or when the welcome
screen provides a setup handoff prompt.

## Objective

Bring a Codex Studio checkout to a runnable local state:

- dependencies installed;
- `.env.local` bootstrap present and sane;
- Studio Library initialized outside the repo;
- SQLite migrations/default library/default project created;
- Codex CLI available and authenticated with ChatGPT login;
- `codex app-server` reachable through the backend;
- UI and backend start cleanly;
- closeout checks run once.

## Safety

- Preserve dirty worktree changes you did not make.
- Never commit or print Provider Secret values.
- Do not store Provider Secrets in SQLite, catalog metadata, logs,
  screenshots, docs, or committed files.
- Do not delete, move, compact, or rewrite Studio Library data unless the user
  explicitly confirms that destructive operation.
- Keep generated images, SQLite files, transcripts, logs, local outputs, and
  `.env.local` uncommitted.
- Use `apply_patch` for manual repo edits.
- Run broad gates only at closeout unless a focused failure requires a small
  targeted check.

## Required Context

Before changing repo files, read:

1. `AGENTS.md`
2. `CONTEXT.md`
3. `docs/ARCHITECTURE.md`
4. `ROADMAP.md`
5. `SKILLS.md`
6. `README.md`
7. `docs/TROUBLESHOOTING.md`

For UI onboarding changes, also read:

1. `docs/DESIGN.md`
2. `components/OnboardingModal.tsx`
3. `hooks/useStudioOnboarding.ts`
4. `hooks/useStudioRuntime.ts`
5. `components/overlays/StudioSystemOverlays.tsx`

## Setup Workflow

1. Inspect current state.
   - `git status --short`
   - `bun --version`
   - `codex --version`
   - check whether `.env.local` exists without printing secret values
   - inspect `package.json` scripts

2. Initialize local bootstrap.
   - Run `bun install` only when dependencies are missing or stale enough to
     block scripts.
   - Run `bun run studio:init` when `.env.local`, Studio Library folders,
     SQLite state, default library, or default project are missing.
   - Keep existing `.env.local` values unless they are invalid. If editing is
     needed, preserve user-specific paths and never add secrets.

3. Verify local runtime.
   - Start with `bun run dev` for full local stack when possible.
   - Use `bun run dev:server` and `bun run dev:ui` separately only when that
     makes diagnosis clearer.
   - Check `GET /api/health` and `/api/codex/session`.
   - Use `/api/app-server/start` or the UI button to start `codex app-server`
     when backend health says the backend is reachable but app-server is down.
   - If ChatGPT auth is missing, stop and ask the user to run `codex login`
     and choose ChatGPT. Do not fake readiness.

4. Diagnose failures.
   - For missing Codex CLI, report PATH/install issue and exact failed command.
   - For occupied ports, identify conflicting ports from `.env.local` and
     suggest safe alternative values.
   - For Studio Library failures, fix missing folders via `bun run studio:init`
     or report permissions/path blockers.
   - For provider-secret checks, report only configured/missing/invalid state
     and source names, never values.

5. Close out once.
   - `bun run test`
   - `bun run check`
   - `bun run build`
   - For frontend onboarding changes, run visual verification in browser before
     claiming done.

## Report Format

End with:

- changed files;
- setup actions performed;
- commands run and pass/fail result;
- current readiness summary from `/api/health` and `/api/codex/session` when
  reachable;
- any remaining user-only actions, such as interactive `codex login`.
