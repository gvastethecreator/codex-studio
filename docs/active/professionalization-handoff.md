# Codex Studio Professionalization Handoff

## Context

Repo: `D:\DEV\codex-studio`.

User mode: `$caveman` active. Keep replies short and technical.

Active goal: continue the full professionalization work. Do not mark the goal complete. The user explicitly said there is still much left.

Use PowerShell without profile (`login:false` / `-NoProfile`) because oh-my-posh previously caused hangs/noise. If `rg` fails in this checkout, use `Get-ChildItem` and `Select-String`.

## Required Reading

Before architecture or runtime work:

- `CONTEXT.md`
- `docs/ARCHITECTURE.md`
- latest relevant ADRs in `docs/adr/`
- `docs/active/professionalization-roadmap.md`
- `docs/TECHNICAL_DEBT.md`

Before provider, recipe, preset, or output work:

- `SKILLS.md`

## Current Direction

- Codex-first, local-first, library-backed.
- `codex app-server` is the Codex Product Runtime.
- SDK/scripts are Codex Automation Surface.
- Generation Task and Generation Provider stay separate.
- Recipe Modules produce Generation Task Specs.
- Providers compile specs into compact provider inputs.
- Provider Secrets stay outside SQLite, settings, logs, transcripts, and docs.
- Command Center is the top toolbar.
- Heavy diagnostics/settings/provider internals should be Demand-Mounted Surfaces.

## Recent Verified State

Recent broad gates:

- `bun run providers:verify` passed.
- `bun run test` passed earlier after provider work: 59 files, 191 tests.
- `bun run build` passed earlier. Remaining warnings: large chunks (`StylesRecipe`, `index`, `StylePresetCatalogSearchSurface`) and `vite:asset` timing.
- `bun run check` still fails globally because of existing formatting drift across many files. Use focused `bun run check:fix -- <files>` while iterating.

Recent domain gates:

- `bun run styles:verify` passed: 11 packs, 1,252 presets, runtime current, source audit OK.
- `bun run recipes:verify` passed: catalog OK, source audit OK.
- Focused tests around style/recipe guards passed.

## Major Work Completed

Provider boundary:

- Google Gemini/Nano Banana executor added behind external provider registry.
- fal.ai executor exists with hosted result normalization, local asset upload, retry, and no-secret transcripts.
- Shared hosted/inline result handling exists in `externalProviderResults.ts`.
- External preflight exposes secret/runtime state without secret values.

Style presets:

- 1,252 Style Preset Manifests exist under `components/recipes/styles/manifests/`.
- All packs have persisted taxonomy and default images.
- `styles:verify` now validates taxonomy/default coverage, runtime sync, and source usage.
- `styles:source:verify` prevents runtime re-import of legacy pack YAML.
- `styles:split` now refuses destructive legacy migration by default.
- `styles:split:legacy` is the explicit migration-only path.

Recipe modules:

- Recipe Modules are declarative and tested.
- Recipe surfaces consume centralized UI projection helpers.
- Context builders are split per recipe.
- Recipe Provider Directives are generated and used by compilers.
- `recipes:source:verify` keeps React recipe surfaces UI-only.

Docs and guides:

- `README.md`, `SKILLS.md`, `docs/ARCHITECTURE.md`, and `docs/active/professionalization-roadmap.md` have been kept in sync with the professionalization direction.

## Dirty Worktree Warning

The worktree is very dirty. Do not revert.

Expect many modified/untracked files across:

- provider adapters/tests
- style manifests and generated runtime data
- recipe modules/catalog/context builders
- settings/output-source UI/backend
- docs
- `bun.lock`

Always inspect current file state before editing.

## Immediate Follow-Up Options

Pick one vertical slice per session.

### UI / Command Center / Performance

Next useful work:

- Measure rendered UI for large expanded Styles packs.
- Verify `StylePresetCatalogSearchSurface` is truly demand-mounted in browser.
- Reduce remaining large chunks.
- Move any remaining global status/usage/provider/library/settings controls into Command Center.

Likely files:

- `components/HeaderToolbar.tsx`
- `components/ui/TopToolbar.tsx`
- `hooks/useStudioShell.ts`
- `components/recipes/StylesRecipe.tsx`
- `components/recipes/StylePresetCatalogSearchSurface.tsx`
- `components/recipes/styleGridVirtualization.ts`

### Providers

Next useful work:

- Finish concrete ComfyUI executor work.
- Require endpoint plus workflow template before Comfy becomes executable.
- Keep Comfy behind local workflow boundary and no-secret transcript rules.
- Improve Google edit-mode request mapping.

Likely files:

- `apps/local-server/src/providers/runtimeConfig.ts`
- `apps/local-server/src/providers/externalProvider.ts`
- `apps/local-server/src/providers/externalProviderExecutors.ts`
- `apps/local-server/src/providers/externalProviderInputs.ts`
- `apps/local-server/src/providers/googleExecutor.ts`
- possible `apps/local-server/src/providers/comfyExecutor.ts`

Validate with:

- `bun run providers:verify`
- focused provider tests

### Style Presets

Next useful work:

- Author new presets directly in granular YAML.
- Add authoring examples for humans/agents.
- Retire `components/recipes/styles/packs/*.yaml` after compatibility parity no longer needs them.
- Add changed-file scoped style verification if useful.

Validate with:

- `bun run styles:verify`
- `bun run styles:catalog -- --query=<text> --limit=20`

### Recipe Modules

Next useful work:

- Compare compact Compiled Provider Inputs against real Codex output quality.
- Build an evaluation/harness before removing legacy Recipe Context from job metadata.
- Keep React surfaces UI-only.

Validate with:

- `bun run recipes:verify`
- `bun run providers:verify`

### Settings / External Outputs

Next useful work:

- Finish user-facing selected-file import from registered External Output Sources.
- Preserve rule: registration is not import.
- Never move/delete external source files unless explicitly requested.

Likely files:

- `apps/local-server/src/outputSources.ts`
- `apps/local-server/src/outputSources.test.ts`
- `components/StudioSettingsModal.tsx`
- `services/localStudioService.ts`
- `hooks/useStudioSettings.ts`

## Technical Debt Still Relevant

See `docs/TECHNICAL_DEBT.md`. Highest priority:

- Further split `components/AppContent.tsx`.
- Move visual cache toward catalog-first surfaces.
- Add backend DI seams for db/logger/worker/lifecycle.
- Clarify Studio Runtime adapter vs `useStudioRuntime` orchestrator naming.
- Add frontend logging adapter.
- Improve UI integration tests for Toolbar, QueuePanel, StudioPage, Local Studio Sync.

## Recommended Skills

- `$caveman` for compact communication.
- `improve-codebase-architecture` for architecture slices.
- `build-web-apps:frontend-testing-debugging` or `browser:browser` for rendered UI/perf work.
- `openai-docs` when touching Codex official app-server/SDK alignment.
- `diagnose` for flaky Windows/tooling/perf bugs.

## Safe Next Plan

1. Read required context files listed above.
2. Pick one vertical slice.
3. Add focused tests or guards first.
4. Implement with small scoped edits.
5. Run focused `check:fix`, focused tests, then relevant domain gate.
6. Leave goal active unless every roadmap/debt item is truly proven complete.
