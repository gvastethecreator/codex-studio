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

All gates last verified 2026-05-25:

- `bun run test` → 66 files, 204 tests
- `bun run build` → UI + server clean
- `bun run providers:verify` → 17 rows, all clean
- `bun run recipes:verify` → catalog OK, source audit 0 violations
- `bun run styles:verify` → 11 packs, 1,253 presets, full taxonomy/default coverage (1 new preset without image), runtime current, source audit OK



## Providers State (2026-05-25)

- **Codex**: full provider boundary with compiled inputs, stable session contract, Recipe Provider Directives preferred over legacy context.
- **Dry run**: diagnostic adapter active.
- **fal.ai**: hosted executor complete — retries, CDN upload, hosted result normalization, asset role mapping (`input`→`image_url`, `mask`→`mask_url`, `control`→`control_image_url`, `reference`→`reference_image_urls`), no-secret transcripts.
- **Google Gemini**: hosted executor complete — `generateContent`, inline local assets, `image_edit` with image-first parts ordering by role priority + explicit edit-mode instruction suffix, no-secret transcripts.
- **ComfyUI**: local workflow executor complete — template loading, prompt submission, history polling, view/download, Studio Library import. Blocked until both `COMFY_API_URL`/`COMFYUI_API_URL` and `COMFY_WORKFLOW_TEMPLATE_PATH` configured.

## UI Chunk State (2026-05-25)

| Chunk | Size | Strategy |
|---|---|---|
| `StylesRecipe` | 1,183 KB | `React.lazy`, eagerly loads 1.37MB `styleRuntimeData.generated.ts` |
| `index` | 1,114 KB | Main entry. Overlays detached via `React.lazy(AppOverlays)` |
| `CameraAnglesRecipe` | 557 KB | `React.lazy` |
| `StylePresetCatalogSearchSurface` | 190 KB | `React.lazy` + async YAML glob (was 2,113 KB) |
| All modals | 2–21 KB each | Conditional render + `React.lazy` with `Suspense`

## New This Session

- **Recipe evaluation harness**: `recipes:evaluate` script + test (2 tests). Generates bare/legacy/directives variants, measures savings (41–56% directives vs legacy).
- **10× chunk reduction**: `stylePresetCatalogData.ts` lazy glob, search surface async, chunk 2,113→189 KB.
- **Demand-mounted overlays**: `ImageEditorModal`, `TrashModal`, `LimitReachedModal`, `StudioSettingsModal`, `DashboardModal`, `DebugPanel`, `OnboardingModal` all lazy + conditional. `AppOverlays` lazy from `AppContent`.
- **UI integration tests**: `QueuePanel.test.ts` (3 tests), `StudioViewport.test.ts` (2 tests).
- **Style preset authoring guide**: `docs/STYLE_PRESET_AUTHORING.md` with YAML template, taxonomy contract, validation commands.
- **Docs synchronized**: roadmap and handoff reflect all completed work.

## Major Work Completed

Provider boundary:

- Google Gemini/Nano Banana executor added behind external provider registry.
- fal.ai executor exists with hosted result normalization, local asset upload, retry, and no-secret transcripts.
- Google `image_edit` sends image assets before the prompt text to align with edit-mode conventions.
- ComfyUI now has a concrete executor that loads a workflow template from `COMFY_WORKFLOW_TEMPLATE_PATH`, merges prompt/negative-prompt, submits to `/prompt`, polls `/history` for the first image, and downloads via `/view` into the Studio Library. Comfy remains blocked until both local endpoint and workflow template path are configured.
- Shared hosted/inline result handling exists in `externalProviderResults.ts`.
- External preflight exposes secret/runtime state without secret values.

Command Center / demand-mounted UI:

- Recipe surfaces are demand-loaded; initial UI bundle dropped from ~4.87 MB to ~1.10 MB.
- Styles grid uses progressive expansion and viewport-aware mounting.
- Style Preset Catalog search is a lazy Demand-Mounted Surface.
- `AppOverlays` itself is lazy from `AppContent`.
- All heavy modals (`ImageEditorModal`, `TrashModal`, `LimitReachedModal`, `StudioSettingsModal`, `DashboardModal`, `DebugPanel`, `OnboardingModal`) are lazy-demand-mounted with conditional render + `Suspense`.
- Each modal now in its own chunk outside the main bundle.

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
- Reduce remaining large chunks (StylesRecipe + StylePresetCatalogSearchSurface).
- Move any remaining global status/usage/provider/library/settings controls into Command Center.

Likely files:

- `components/HeaderToolbar.tsx`
- `components/ui/TopToolbar.tsx`
- `hooks/useStudioShell.ts`
- `components/recipes/StylesRecipe.tsx`
- `components/recipes/StylePresetCatalogSearchSurface.tsx`
- `components/recipes/styleGridVirtualization.ts`

### Providers

Completed.

Next useful work:

- Add richer edit-mode request mapping for Google (beyond basic text-position swap).
- Wire provider-specific image_edit conventions per executor (mask roles, strength, compositing layers).

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
- Add db/worker/lifecycle DI seams (logger seam done, others remain).
- ~~Clarify Studio Runtime adapter vs `useStudioRuntime` orchestrator naming~~ — DONE. Both files now have JSDoc distinguishing them. `services/studioRuntime.ts` = static config adapter ("where is the backend?"). `hooks/useStudioRuntime.ts` = React orchestrator (wires readiness, diagnostics, onboarding, session, recovery, sync).
- ~~Add frontend logging adapter~~ — DONE. `utils/runtimeLogger.ts` already existed with `runtimeLogger` facade used by 11 consumers. No raw `console.*` in UI code — only in scripts/backend.
- ~~Improve UI integration tests for Toolbar, QueuePanel, StudioPage, Local Studio Sync~~ — DONE. Added `QueuePanel.test.ts` (3 tests), `StudioViewport.test.ts` (2 tests), expanded `useStudioHeaderToolbarConfig.test.ts`. Suite at 66 files, 204 tests.

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
