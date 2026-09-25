---
name: codex-studio-setup
description: Set up a local Codex Studio checkout end to end from the welcome-screen handoff prompt.
---

# Cozy Studio Setup

Use when a user asks to make this repo ready for first run, or when the welcome
screen provides a setup handoff prompt.

## Objective

Bring a Codex Studio checkout to a runnable local state:

- dependencies installed and repo scripts runnable
- `.env.local` bootstrap present and sane
- Studio Library initialized outside the repo
- SQLite migrations, default library, and default workspace created
- Studio Settings Sign in present, with the ChatGPT provider selected for image jobs
- UI and backend start cleanly
- Codex CLI and `codex app-server` only when the user explicitly wants the Codex provider
- closeout checks run once

## Onboarding loop

Copy prompt and Ask Codex on the welcome surface use this skill as the Setup Prompt
(`CODEX_STUDIO_SETUP_SKILL_PATH` in `lib/onboardingSetupPrompt.ts`). Keep that
ownership. Do not move the prompt body into the renderer.

The product loop is detect, consent, mutate, stream, re-validate. One primary CTA:

1. Missing Bun: open <https://bun.sh/docs/installation>. Never silent-install Bun.
2. ChatGPT login missing: Sign in from the welcome flow or Studio Settings and keep the
   ChatGPT provider. Login is not bundled. Codex CLI is not required for this path.
3. Codex provider selected and Codex CLI missing: open <https://github.com/openai/codex>.
   Never silent-install Codex. Run `codex login` only when the user explicitly wants the
   Codex app-server route.
4. Studio Library or Bootstrap Configuration missing: in-app Setup, or
   `bun run studio:onboard --setup`, after explicit consent.
5. Codex provider selected, and Codex Product Runtime is not ready: start app-server
   through the local backend. Leave app-server stopped when ChatGPT HTTP is the selected
   image route.
6. Ready: Open Studio.

Ask Codex is an extra path when Codex CLI exists. Grok Imagine is an optional provider
row, never a Studio installer.

Default Studio Library is a folder named `Codex Studio` in the user home. Existing
`STUDIO_LIBRARY_DIR` is kept. Do not auto-migrate `AI-Studio-Library`. Preferred Output
Path is not the generate destination. New generations go under `outputs/<workspace>/`
inside the Studio Library.

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
2. `README.md`
3. `docs/TROUBLESHOOTING.md`

For UI onboarding changes, also read:

1. `components/OnboardingModal.tsx`
2. `hooks/useStudioOnboarding.ts`
3. `hooks/useStudioRuntime.ts`
4. `components/overlays/StudioSystemOverlays.tsx`

## Setup Workflow

1. Inspect current state.
   - `git status --short`
   - Bun can run repo scripts. Collect tool metadata only when it helps diagnosis.
   - Codex Runtime Doctor status, selected executable, and app-server support. Collect CLI metadata only when it helps diagnosis.
   - make sure that `.env.local` exists without printing secret values
   - inspect `package.json` scripts

2. Initialize local bootstrap.
   - Run `bun install` only when dependencies are missing or stale enough to
     block scripts. Never silent-install Bun or Codex CLI.
   - Prefer `bun run studio:onboard --setup` (or in-app Setup) when the probe says
     library or Bootstrap Configuration is missing. Mutations need consent.
   - Run `bun run studio:init` when `.env.local`, Studio Library folders,
     SQLite state, default library, or default workspace are missing after that.
   - Keep existing `.env.local` values unless they are invalid. If editing is
     needed, preserve user-specific paths and never add secrets.

3. Verify local runtime.
   - Start with `bun run dev` for full local stack when possible.
   - Use `bun run dev:server` and `bun run dev:ui` separately only when that
     makes diagnosis clearer.
   - Check `GET /api/health` and `/api/codex/session`.
   - Use `/api/app-server/start` or the UI button to start `codex app-server`
     when backend health says the backend is reachable but app-server is down.
   - If ChatGPT auth is missing, stop and ask the user to Sign in from Studio Settings, then select the ChatGPT provider. Do not run `codex login` or start app-server unless the user explicitly wants the Codex route. Do not fake readiness.

4. Diagnose failures.
   - For missing Codex CLI, report PATH/install issue and exact failed command.
   - Do not block on an exact Bun or Codex release when app readiness,
     supported scripts, app-server support, and Local Codex Session are healthy.
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

- changed files
- setup actions performed
- commands run and pass or fail result
- current readiness summary from `/api/health` and `/api/codex/session` when reachable
- any remaining user-only actions, such as Studio Settings Sign in. Mention interactive `codex login` only when the Codex app-server route was requested.
