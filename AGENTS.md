# Codex Studio Agent Guide

This file is for agents working inside this repo. Vocabulary lives in `CONTEXT.md`; decisions live in `docs/adr/`; system shape lives in `docs/ARCHITECTURE.md`.

## Current Direction

- Codex Studio is Codex-first, local-first, and library-backed.
- `codex app-server` is the interactive Codex Product Runtime.
- Codex SDK or scripts are Codex Automation Surface only: audits, migrations, checks, maintenance.
- Generation Task and Generation Provider are separate concepts.
- Recipe Modules should produce Generation Task Specs.
- Providers compile specs into compact provider inputs.
- Studio Settings are editable app preferences; Bootstrap Configuration and Provider Secrets stay outside SQLite-backed settings.
- The top toolbar is the Command Center.
- Heavy diagnostics, settings, provider internals, and visual effects should be Demand-Mounted Surfaces.

## Required Context Pass

Before architecture or runtime work, read:

1. `CONTEXT.md`
2. `docs/ARCHITECTURE.md`
3. Latest relevant ADRs in `docs/adr/`
4. `docs/active/professionalization-roadmap.md`
5. `docs/TECHNICAL_DEBT.md`

Before UI work, also read:

1. `docs/DESIGN.md`
2. `components/HeaderToolbar.tsx`
3. `components/ui/TopToolbar.tsx`
4. `hooks/useStudioShell.ts`

Before provider, recipe, preset, or output work, also read `SKILLS.md`.

## Commands

Use Bun scripts. Prefer focused checks while iterating, then full gate at close.

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

## Safety Rules

- Never delete, move, or rewrite Studio Library data unless user explicitly requests it.
- Do not operate destructively on arbitrary paths. Register/import External Output Sources first.
- Do not store Provider Secret values in SQLite, catalog metadata, logs, screenshots, or docs.
- Do not commit `.env.local`, generated images, SQLite DBs, transcripts, logs, or local output folders.
- Preserve dirty worktree changes you did not make.
- Use `apply_patch` for manual file edits.
- Keep `CONTEXT.md` glossary-only.

## Code Rules

- Shared domain contracts belong in `packages/shared/src`.
- Frontend backend calls go through `services/localStudioService.ts` or `services/studioEventSource.ts`.
- Backend provider execution belongs behind provider adapters, not route handlers.
- Job kinds should describe provider-independent tasks.
- Provider-specific options belong in provider config/input, not generic task names.
- New behavior needs tests. Use `vite-plus/test`.
- Keep Visual Batch as compatibility only. Durable image truth is Catalog Entry.

## Validation Closeout

Do not claim completion without fresh command output. Minimum closeout for broad changes:

```bash
bun run test
bun run check
bun run build
```

If one gate cannot run, report exact command, failure/blocker, and risk.
