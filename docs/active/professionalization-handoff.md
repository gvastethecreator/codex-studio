# Codex Studio Professionalization Handoff

Location: repo-local handoff at `docs/active/professionalization-handoff.md`. Keep future handoff updates inside this project, not in OS temp.

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
- `bun run styles:verify` → 11 packs, 1,253 presets, full taxonomy/default-image coverage, runtime current, source audit OK
- `bun run styles:render:verify` → render budgets OK; largest pack `pack_05` stays at 64 initial cards from 372 presets
- `bun run ui:chunks:verify` → chunk budgets OK; now part of `bun run build`
- `bun run ui:source:verify` → demand-mounted source boundaries OK; now part of `validate:full`
- `bun run catalog:source:verify` → Catalog View remains Catalog Entry-first; now part of `validate:full`

## Providers State (2026-05-25)

- **Codex**: full provider boundary with compiled inputs, stable session contract, Recipe Provider Directives preferred over legacy context.
- **Dry run**: diagnostic adapter active.
- **fal.ai**: hosted executor complete — retries, CDN upload, hosted result normalization, asset role mapping (`input`→`image_url`, `mask`→`mask_url`, `control`→`control_image_url`, `reference`→`reference_image_urls`), no-secret transcripts.
- **Google Gemini**: hosted executor complete — `generateContent`, inline local assets, `image_edit` with image-first parts ordering by role priority + explicit edit-mode instruction suffix, no-secret transcripts.
- **ComfyUI**: local workflow executor complete — template loading, prompt submission, history polling, view/download, Studio Library import. Blocked until both `COMFY_API_URL`/`COMFYUI_API_URL` and `COMFY_WORKFLOW_TEMPLATE_PATH` configured.

## UI Chunk State (2026-05-25)

| Chunk                             | Size         | Strategy                                                    |
| --------------------------------- | ------------ | ----------------------------------------------------------- |
| `StylesRecipe`                    | 42 KB        | `React.lazy`, imports pack summaries, loads active pack     |
| `pack_05` runtime index           | 22 KB        | Composes lazy category chunks; was 498 KB as one pack chunk |
| `pack_05` largest category chunk  | 59 KB        | `anime-style-spectrum-12` generated preset data             |
| `index`                           | 446.20 KB    | Main shell; scanner/export/background/routes detached       |
| `CameraAnglesRecipe`              | 22.83 KB     | `React.lazy`; viewport dynamically imports `three`          |
| `three.module`                    | 722.74 KB    | Demand-loaded by Camera viewport                            |
| `StylePresetCatalogSearchSurface` | 7.22 KB      | UI shell only; catalog data/parser loaded on open           |
| `stylePresetCatalogData`          | 148.37 KB    | Demand-loaded YAML glob map for catalog search              |
| `js-yaml`                         | 39.60 KB     | Demand-loaded parser for catalog search                     |
| All modals                        | 2–21 KB each | Conditional render + `React.lazy` with `Suspense`           |

## New This Session

- **Recipe evaluation harness**: `recipes:evaluate` script + test (2 tests). Generates bare/legacy/directives variants, measures savings (41–56% directives vs legacy).
- **10× chunk reduction**: `stylePresetCatalogData.ts` lazy glob, search surface async, chunk 2,113→189 KB.
- **Styles runtime split**: `styleRuntimeData.generated.ts` is now a small pack-summary/loader index. Generated preset data lives in lazy pack indexes plus per-category chunks under `styleRuntimePacks.generated/<pack>/<category>.ts`, so `StylesRecipe` no longer eagerly imports the full 1.4 MB runtime or a 498 KB pack chunk.
- **Stricter pack manifest validation**: Style Pack Manifests now reject duplicate top-level `presetRefs`, category refs missing from the pack-level list, and refs outside the pack namespace.
- **Generated temp guard**: `styles:source:verify` now rejects `styleRuntimeData.generated.check.*.tmp.ts` and per-pack check temp files; `.gitignore` covers future temp artifacts.
- **Legacy-only preset guard**: `styles:source:verify` now compares `components/recipes/styles/packs/*.yaml` against granular manifests and fails if a preset exists only in legacy pack YAML. Latest repo audit: 1,252 legacy presets, 1,253 granular manifests, 0 legacy-only presets.
- **Legacy runtime module removed**: `components/recipes/legacyStylesData.ts` was deleted. Legacy pack YAML is no longer exposed through an importable runtime module; remaining legacy access is script/test migration-only.
- **Styles render budget guard**: `styles:render:verify` reports initial categories/cards per pack from generated runtime data and is wired into `styles:verify`. Latest worst case: `pack_05`, 12 categories, 372 presets, 64 initial preset cards.
- **Camera viewport split**: `hooks/useCameraViewport.ts` now imports `three` dynamically when the viewport mounts. Latest build: `CameraAnglesRecipe` 22.83 KB, `three.module` 722.74 KB.
- **Main entry split**: `main.tsx` loads `react-scan` only in dev, ZIP export loads `jszip`/`file-saver` only on demand, `LiquidBlackBackground` is lazy, and `StudioViewport` lazy-loads route pages. Latest build: `index` 446.20 KB, down from 1,114.06 KB.
- **Catalog search split**: `StylePresetCatalogSearchSurface` now imports `stylePresetCatalogData` dynamically, and that module imports `js-yaml` dynamically. Latest build: surface 7.22 KB, data glob 148.37 KB, parser 39.60 KB.
- **SP01-081 default image closed**: `Soft Editorial Window` now has `assets/recipes/styles/defaults/SP01-081.webp`, manifest `assets.defaultImage`, and taxonomy `hasDefaultImage: true`. Latest `styles:verify` has no missing default images.
- **UI chunk guard**: `scripts/report-ui-chunks.ts` adds budgeted chunk verification; `ui:chunks:verify` is wired into `build`, `build:ui`, and `validate:full`.
- **UI source guard**: `scripts/ui-demand-surface-audit.ts` blocks static imports that would undo demand-mounted splits. `ui:source:verify` is wired into `validate:full` before build.
- **Catalog-first seam**: `lib/studioCatalogView.ts` is now a pure Catalog Entry read model. `lib/studioCatalogVisualBatchAdapter.ts` owns temporary Visual Batch materialization. `catalog:source:verify` blocks regressions back to `GenerationBatch`/`catalog-cache` in the catalog-first seam.
- **Gallery reads Catalog View**: `useStudioGallery` accepts `catalogView` and builds `imagesWithConfig` from Catalog Entries via `materializeCatalogEntryImageWithConfig`. `useImageManager` now accepts optional image lists, so gallery selection/delete/select-all/clear counts can use Catalog Entry materialized images while Visual Batches remain as fallback.
- **Workspace strip reads Catalog View**: `useWorkspaceStrip` accepts `catalogView` and computes workspace counts/thumbnails from Catalog Entries first. `GenerationBatch[]` remains only fallback for legacy callers.
- **Trash modal reads Catalog View**: `lib/studioCatalogTrashView.ts` builds archived Catalog Entry groups for `TrashModal`; UI no longer needs `GenerationBatch[]` for trash display.
- **Dashboard reads catalog counts**: `DashboardModal` receives catalog-derived `imagesCount` and an export callback; it no longer receives `GenerationBatch[]` only to count images/export.
- **Workspace snapshot export names legacy edge**: `useVaultTransfer` now has `buildLegacyVisualBatchSnapshot()` for the JSON snapshot compatibility format, plus `buildWorkspaceExportImages()` for ZIP image export. Both prefer `StudioCatalogView`; Visual Batch arrays remain fallback for legacy import/archive edges.
- **Legacy Visual Batch cache isolated**: `lib/studioLegacyVisualBatchStore.ts` owns `catalog-cache`/`catalog-trash` key strings and legacy snapshot validation. `catalog:source:verify` fails if those raw keys spread outside that module/tests.
- **GlobalContext legacy API named**: public import/archive methods are now `importLegacyVisualBatches` and `archiveLegacyVisualBatches`; reducer actions are `IMPORT_LEGACY_VISUAL_BATCHES` and `ARCHIVE_LEGACY_VISUAL_BATCHES`.
- **Recovery merge named legacy**: runtime recovery now calls `mergeLegacyVisualBatches`; reducer action is `MERGE_LEGACY_VISUAL_BATCHES`. No generic `mergeBatches` public API remains.
- **Generated output append named compat**: generation pipeline now calls `prependGeneratedVisualBatch`; reducer action is `PREPEND_GENERATED_VISUAL_BATCH`. No generic `prependBatch` public API remains.
- **GlobalContext active cache named legacy**: public state is now `legacyVisualBatches` / `legacyVisualTrash`, not generic `batches` / `trash`.
- **GlobalState internal cache named legacy**: reducer state is now `legacyVisualBatches` / `legacyVisualTrash`, and remaining delete/favorite/clear/restore/empty reducer actions carry `LEGACY_VISUAL` names.
- **Gallery/workspace/vault fallback named legacy**: `useStudioGallery`, `useWorkspaceStrip`, and `useVaultTransfer` now take `catalogView` as the primary path and only accept `legacyVisualBatches` as the explicit fallback.
- **Runtime/overlay count names catalog visual groups**: `useStudioRuntime` / `useStudioStorageRecovery` now receive `legacyVisualBatches` explicitly for recovery. Overlay/page controller counts now use `catalogVisualGroupCount` / `visualGroupsCount`, and Archived Images text avoids generic batch wording.
- **useCatalog no longer materializes Visual Batches**: `useCatalog` returns Catalog Entries and `StudioCatalogView` only. `materializeVisualBatchesFromCatalog()` is now imported by `useStudioShell` at the compatibility edge that still feeds Visual Batch-based UI props.
- **Latest focused validation**: `bun run test -- hooks/useStudioOverlayController.test.ts hooks/useStudioPageController.test.ts hooks/useStudioGallery.test.ts hooks/useWorkspaceStrip.test.ts hooks/useVaultTransfer.test.ts hooks/useStudioOverlayController.test.ts contexts/globalReducer.test.ts scripts/catalog-first-source-audit.test.ts` passed 7 files / 17 tests; `bun run catalog:source:verify` passed with 3 rules / 0 violations; `bun run build` passed UI/server build plus chunk guard.
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
- Style Preset Catalog search is a lazy Demand-Mounted Surface; its UI shell, catalog data glob, and YAML parser are separate chunks.
- `StylesRecipe` loads the active style pack async from generated pack indexes that compose per-category chunks.
- `main.tsx` keeps `react-scan` out of production startup; `downloadMultipleImagesAsZip()` demand-loads ZIP/export libraries; `LiquidBlackBackground`, `StudioPage`, `RecipesView`, and `RecipePage` are lazy route/effect chunks.
- `bun run build` fails if budgeted UI chunks regress.
- `bun run validate:full` fails before build if known heavy demand-mounted imports return to startup/source shells.
- `bun run validate:full` also fails if the catalog-first read model regresses back to Visual Batch/cache dependencies.
- `AppOverlays` itself is lazy from `AppContent`.
- All heavy modals (`ImageEditorModal`, `TrashModal`, `LimitReachedModal`, `StudioSettingsModal`, `DashboardModal`, `DebugPanel`, `OnboardingModal`) are lazy-demand-mounted with conditional render + `Suspense`.
- Each modal now in its own chunk outside the main bundle.

Style presets:

- 1,253 Style Preset Manifests exist under `components/recipes/styles/manifests/`.
- All packs have persisted taxonomy and default images.
- `styles:verify` now validates taxonomy/default coverage, pack/category reference drift, runtime sync, and source usage.
- `styles:runtime` now generates one lightweight loader index plus pack indexes and per-category runtime chunks under `components/recipes/styleRuntimePacks.generated/`.
- `styles:source:verify` prevents runtime re-import of legacy pack YAML, generated check temp files, and legacy-only preset additions.
- `styles:render:verify` prevents large packs from mounting unbounded cards in the initial Styles browser render path.
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
- Keep `ui:source:verify` and `ui:chunks:verify` together when changing Command Center, overlays, route shells, Catalog Search, Camera, or export flows.
- Reduce remaining large chunks only where user-visible: optional future `three.module` isolation if Camera route needs faster first mount, plus rendered perf measurements.
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
- Retire `components/recipes/styles/packs/*.yaml` after compatibility parity no longer needs them; until then, keep `styles:source:verify` green with 0 legacy-only presets.
- Replace static render budget with browser measurement once local Playwright/browser harness is chosen for this repo.
- Add changed-file scoped style verification if useful.

Validate with:

- `bun run styles:verify`
- `bun run ui:chunks:verify`
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

### Catalog-first Visual Batch Migration

Next useful work:

- Reduce remaining shell `catalogVisualBatches` and legacy snapshot compatibility adapter usage once grid/export consumers can accept Catalog Entries directly.
- Keep `lib/studioCatalogVisualBatchAdapter.ts` as the only compatibility adapter while `ImageGrid` still expects Visual Batches.
- Next concrete target: split active visual compatibility state out of `GlobalContext` or keep only local transient recovery/import state there.
- Do not add new durable image decisions to `catalog-cache`.

Validate with:

- `bun run catalog:source:verify`
- `bun run test -- hooks/useVaultTransfer.test.ts lib/studioLegacyVisualBatchStore.test.ts lib/studioStorageRecovery.test.ts scripts/catalog-first-source-audit.test.ts`

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
