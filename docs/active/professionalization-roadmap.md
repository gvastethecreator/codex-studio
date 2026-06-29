# Codex Studio Professionalization Roadmap

## Objective

Turn Codex Studio into a more professional local-first image studio while preserving its Codex-first product center. The work should reduce token waste, clarify provider boundaries, improve UI command flow, make configuration editable, and make recipes and style presets easier for people and agents to maintain.

## Execution order

1. **Agent And Project Guide**
   - Add or update `AGENTS.md`, `SKILLS.md`, and architecture docs.
   - Keep `CONTEXT.md` as glossary-only.
   - Document validation commands, safe file operations, Codex official-doc alignment, provider work, recipe work, style-preset work, and token audits.

2. **Base Task/Provider Contracts**
   - Introduce shared types for **Generation Task**, **Generation Provider**, **Generation Task Spec**, **Compiled Provider Input**, and **Provider Session Contract**.
   - Preserve Codex-first behavior while making provider selection explicit.
   - Keep task names provider-independent.
   - Done: provider capabilities are modeled as shared data so UI, API, and tests can distinguish active adapters from planned or unconfigured providers.

3. **Provider Boundary With Codex As The Core**
   - Move existing Codex image generation behind the provider interface first.
   - Do not add external providers until the Codex provider proves the contract with current jobs, assets, catalog entries, metadata, logs, and diagnostics.
   - Audit repeated prompt boilerplate and move stable instructions into the provider/session contract.
   - Done: Local Generation Run now resolves provider selection from explicit input or Studio Settings before creating Generation Task Specs and Jobs.
   - Done: Settings now exposes provider capability status from `/api/providers` without leaking secret values.
   - Done: job creation now rejects providers that are planned, unconfigured, or unknown instead of silently routing them into Codex.
   - Done: added a dry-run Provider Boundary compiler fixture so future adapters can prove Compiled Provider Input shape before calling hosted SDKs or local runtimes.
   - Done: added external compiler conformance fixtures for Google, fal.ai, and ComfyUI. They compile Generation Task Specs into compact provider inputs without serializing inline image data, Provider Secrets, or runtime endpoints.
   - Done: added a Provider Input Compiler registry so diagnostics and future adapters can compile provider inputs through one seam instead of importing provider-specific modules directly.
   - Done: Codex imagegen stable instructions now live in one Provider Session Contract reused by the compiler, persistent thread developer instructions, and fallback prompt.
   - Done: added `providers:audit` / `providers:verify` so Recipe Module specs and external conformance fixtures can prove Compiled Provider Input size, compactness, Recipe Provider Directives coverage, stable-instruction omission, and inline-data/secret leak safety.
   - Done: added external provider runtime preflight for Google, fal.ai, and ComfyUI so Provider Secret sources and local endpoints are validated without exposing secret values.
   - Done: `/api/providers/preflight` and Settings expose non-secret preflight diagnostics so users can see missing Provider Secret sources or invalid local endpoints before execution adapters exist.
   - Done: added an external provider adapter shell behind the worker Provider Boundary. It compiles provider inputs, applies runtime preflight, reports missing runtime requirements clearly, and delegates real execution through a provider executor.
   - Done: fal.ai now has the first concrete hosted executor. It reads `FAL_KEY` or `FAL_API_KEY` from backend env only, posts compact inputs to `fal.run`, downloads the first image result into the Studio Library, writes a non-secret transcript, and marks fal capability executable only when preflight passes.
   - Done: external provider executors now live behind a registry. The shell no longer hardcodes fal.ai, and Google/ComfyUI can be added without changing execution flow or enabling planned providers early.
   - Done: fal.ai executor now retries transient request/download failures, records request/image attempts in the non-secret transcript, and redacts configured secret values from provider error snippets.
   - Done: hosted provider result handling now has a shared normalizer for retry, image URL extraction, asset download, mime/ext inference, local asset pathing, non-secret transcripts, and response snippets. fal.ai consumes it; Google/fal-compatible hosted executors can reuse it.
   - Done: fal.ai executor maps hosted task asset `sourceUrl` refs into common request fields (`image_url`, `mask_url`, `control_image_url`, `reference_image_urls`).
   - Done: fal.ai executor uploads `localPath` task assets to fal CDN via `@fal-ai/client` before request body creation, without putting Provider Secrets in compiled inputs, logs, transcripts, or API responses.
   - Done: fal.ai `image_edit` now fails before network when no `input` or `external_output` asset can map to `image_url`, and inline assets produce an actionable compact-input policy error instead of pretending upload can happen from omitted bytes.
   - Done: hosted transcripts can include no-secret provider diagnostics. fal.ai records asset counts, asset roles, request field names, and image/mask/reference usage without storing hosted input URLs or secret values.
   - Done: Google Gemini image API now has a concrete hosted executor. It calls `generateContent`, stores inline image data as Local Assets, supports text-to-image plus localPath-backed `image_edit`, and marks Google executable only when backend preflight finds a configured Provider Secret.
   - Done: Google `image_edit` now sends image assets before the prompt text to match edit-mode conventions, orders assets by role priority, and appends explicit edit-mode instructions to the prompt for better Gemini edit fidelity.
   - Done: Codex image jobs now persist local paths for all inline task assets, strip persisted inline bytes after local-path hydration, replay retry inline assets through the same reference-persistence path, and use isolated per-job sessions whenever image inputs are present, preventing stale visual context from earlier reusable pack threads.
   - Done: ComfyUI now has a concrete executor that reads `COMFY_WORKFLOW_TEMPLATE_PATH` to load and merge user prompt/negative-prompt into a JSON workflow template for local runtimes. It submits the workflow via `/prompt`, polls `/history`, finds the first image output, and streams the result into the Studio Library via the shared `storeHostedImageResult` normalizer. Comfy remains blocked from execution until both `COMFY_API_URL`/`COMFYUI_API_URL` and `COMFY_WORKFLOW_TEMPLATE_PATH` are configured.
   - Done: added `providers:source:verify` and wired it into `providers:verify` so route handlers and non-provider backend modules cannot import provider compilers, concrete executors, or hosted-result internals.
   - Done: ComfyUI capability is executable only when a concrete executor exists and preflight passes both local endpoint and workflow template config.

4. **Studio Settings**
   - Add backend/API support for editable Studio Settings stored with the Studio Library.
   - Keep `.env.local` for Bootstrap Configuration, ports, development flags, and secrets.
   - Done: Studio Library layout now keeps internal state in `.studio/` and generated image outputs in `outputs/`.
   - Done: Studio Settings now persist output organization preferences for subfolders by date/provider/model/recipe plus a file-name template.
   - Done: support output-source discovery and registration without unmanaged destructive file operations.
   - Done: backend can list registered source image files and import selected files by copying them into the Studio Library as Catalog Entries.
   - Done: `library:layout:verify` now blocks raw `libraryDir` joins for DB, transcripts, assets, outputs, and `.studio` outside the layout helper/migration script. Default-generation scripts and metadata embedding now resolve through `resolveLibraryPathFromRoot`.
   - Done: Settings exposes registered source scanning, file selection, explicit selected-file import, and provider runtime preflight state.

5. **Command Center And Demand-Mounted UI**
   - Move global status, usage, active provider, queue summary, library/workspace switching, and settings entry points into the top toolbar.
   - Convert heavy diagnostics, settings, activity, and provider internals into Demand-Mounted Surfaces.
   - Avoid permanent floating global panels.
   - Done: recipe surfaces are demand-loaded; the initial UI bundle dropped from about 4.87 MB to about 1.10 MB, with the heavy Styles surface isolated in its own chunk.
   - Done: Styles grid now renders categories and large categories progressively with explicit expansion controls.
   - Done: Styles runtime data no longer imports the full editorial catalog, dropping the built Styles Recipe chunk from about 2.20 MB to about 1.18 MB.
   - Done: Styles category groups now use viewport-aware mounting with estimated placeholders, so offscreen preset cards do not mount until their group is near the Style Browser viewport.
   - Done: Style Preset Catalog search is now a lazy Demand-Mounted Surface opened from Styles, so the editorial YAML graph loads only when needed.
   - Done: Styles runtime presets are now split into lazy pack indexes and per-category chunks. `StylesRecipe` imports only runtime pack summaries on mount; the active pack loads through `loadStyleRuntimePack()`, which composes category chunks. Latest build: `StylesRecipe` 42.05 KB, `pack_05` index 22.13 KB, largest `pack_05` category chunk `anime-style-spectrum-12` 59.33 KB.
   - Done: all heavy modals (`ImageEditorModal`, `TrashModal`, `LimitReachedModal`, `StudioSettingsModal`, `DashboardModal`, `DebugPanel`, `OnboardingModal`) are now lazy-demand-mounted with conditional render + `Suspense`. Each modal in its own chunk outside the main bundle.
   - Done: `AppOverlays` itself is `React.lazy` from `AppContent` with a `Suspense` boundary, deferring all overlay chunks until after initial paint.
   - Done: `CameraAnglesRecipe` no longer statically imports `three`. The camera viewport hook loads Three.js only after the viewport mounts, dropping the built recipe chunk from about 557 KB to 22.83 KB while isolating `three.module` as its own demand-loaded 722.74 KB chunk.
   - Done: production-only entry cleanup removed eager `react-scan`, lazy-loaded ZIP export dependencies (`jszip`/`file-saver`) only when exporting multiple images, removed the legacy liquid background effect, and route-lazy loaded `StudioPage`, `RecipesView`, and `RecipePage`. Latest build: main `index` dropped from 1,114.06 KB to 446.20 KB; remaining >500 KB warning is the demand-loaded `three.module` camera viewport chunk.
   - Done: added `styles:render` / `styles:render:verify` to measure Styles render budgets per pack from the same render-plan logic and sorted category order used by `StylesRecipe`. Current worst case is `pack_05`: 12 categories, 372 presets, 4 mounted sections, 2 eager sections, 2 placeholder sections, 32 eager cards, 64 planned cards, 240 presets hidden behind category expansion.
   - Done: verified `pack_05` in the browser at `http://127.0.0.1:5173/#recipe-styles`. Collapsed state matched the render plan: 4 mounted groups, 2 eager groups, 2 placeholders, 32 rendered cards, 64 planned cards, 68 hidden cards in mounted groups, and 8 hidden categories / 240 hidden styles. Expanded categories state also matched: 12 groups, 2 eager, 10 placeholders, 32 rendered cards, 192 planned cards, 180 hidden cards inside mounted groups.
   - Done: added optional `styles:browser` / `styles:browser:verify` as a reusable Playwright gate for Styles. It runs through `tsx` (Node) for Windows stability, checks `pack_05` collapsed/expanded DOM counts, verifies the Style Preset Catalog stays demand-mounted until opened, queries `boudoir`, and captures console issues after a timestamped reload. Latest verify pass against `http://localhost:3001/#recipe-styles` reported 0 violations with `VITE_ENABLE_REACT_SCAN=false` on the dev server.
   - Done: added `ui:chunks` / `ui:chunks:verify` and wired chunk verification into `bun run build`, `build:ui`, and `validate:full`. The guard enforces budgets for `index`, `StylesRecipe`, `StylePresetCatalogSearchSurface`, `stylePresetCatalogData`, `CameraAnglesRecipe`, `three.module`, and `jszip`.
   - Done: added `ui:source:verify` and wired it into `validate:full` before build. The guard blocks static imports that would undo demand-mounted boundaries for `react-scan`, `three`, catalog search data/YAML parser, ZIP vendors, Liquid background, and route pages.
   - Done: added UI integration tests for QueuePanel stats (3 tests), StudioViewport routing (2 tests), and HeaderToolbar status/labels (existing test preserved). Suite now at 66 files, 204 tests.
   - Next: decide whether `styles:browser:verify` is stable enough to join broader release validation or should remain an explicit/manual gate.

6. **Recipe Modules**
   - Done: `lib/recipeModules.ts` now exposes declarative module metadata, parameter descriptors, supported tasks, and Codex-first provider compatibility.
   - Done: module compatibility is checked before provider compilation.
   - Done: recipe metadata is preserved in Generation Task Spec metadata for traceability.
   - Done: added a Recipe Module Catalog and `recipes:catalog`/`recipes:verify` scripts so humans and agents can inspect recipe identity, tasks, providers, and parameters without reading React pages.
   - Done: `RecipesView` now uses Recipe Module Catalog metadata for card text instead of duplicating titles and descriptions in the React page.
   - Done: Recipe Module parameter descriptors now include groups, controls, defaults, enum options, numeric ranges, required flags, and validation before Generation Task Spec creation.
   - Done: Recipe Module Catalog exposes `defaultParams`, `parameterGroups`, and `requiredParameterIds`, and `recipes:verify` checks enum options, slider types, and required/default conflicts.
   - Done: recipe surfaces now consume central Recipe Module options/defaults/ranges through a small UI projection helper for Spritesheet, Remaster, Cinematic, Character, Camera, and Timeline controls.
   - Done: camera translation and Timeline temporal mapping now live in tested provider-independent derived-param helpers instead of React surfaces.
   - Done: Character, Cinematic, and Spritesheet prompt fragments now live in tested provider-independent helpers instead of being embedded directly in the shared Recipe Context builder.
   - Done: full Recipe Context builders now live in per-Recipe Module files behind a single registry, leaving `lib/recipeContext.ts` as the small envelope resolver.
   - Done: all current Recipe Modules now include compact Recipe Provider Directives in Generation Task Specs, and Codex plus external provider compilers prefer them over legacy Recipe Context when present.
   - Done: added `recipes:source:verify` and wired it into `recipes:verify` so React recipe surfaces stay UI-only and cannot pull task-spec builders, Recipe Context builders, Recipe Provider Directives, or provider compilers back into components.
   - Done: added `recipes:evaluate` script and test harness that generates bare/legacy/directives prompt variants per recipe module, measures token savings (41–56% directives vs legacy), and writes JSON evaluation reports. Supports `--dry-run`, `--out=<dir>`, and `--recipe=<id>` filters.
   - Done: added `recipes:evaluate:live` as the explicit live-comparison harness. It reuses the evaluation specs, plans legacy/directives (or bare) variants by default without creating jobs, and only runs real Codex jobs with `--execute`. The live report records job ids, compact prompt sizes, metrics, catalog refs, and transcript paths plus a Markdown review template, without storing generated assets in repo.
   - Done: added `lib/recipeModuleExamples.ts` plus `recipes:examples:verify` for provider-independent `sprite_sheet` and `texture_generate` blueprints. These build Generation Task Specs, stay `example_only`, and only allow Codex-first providers (`codex`, `dry_run`).
   - Next: execute representative `recipes:evaluate:live -- --execute` runs on a ready local Codex session and record reviewer notes before removing legacy Recipe Context from job metadata.

7. **Style Preset Manifests**
   - Done: generated lightweight Style Pack Manifests plus granular Style Preset Manifests under `components/recipes/styles/manifests/`.
   - Done: visual runtime packs are now composed from granular manifests so current UI keeps working without monolithic pack YAML.
   - Done: validation covers graph refs, duplicate/orphan manifests, pack/category reference drift, pack namespace drift, and legacy preset count parity.
   - Done: runtime Styles data no longer imports monolithic legacy pack YAML when granular manifests are present.
   - Done: style default scripts now load and validate granular manifests only; fallback to legacy pack YAML is retired.
   - Done: added a manifest-first Style Preset Catalog interface for direct preset, pack, and category lookups.
   - Done: Styles favorites and pack resolution now use the Style Preset Catalog instead of scanning compatibility packs.
   - Done: Style Preset Manifests now have an editorial taxonomy contract, and the split script emits it for future manifest generation.
   - Done: added `styles:validate` so individual granular preset edits can be verified without touching legacy pack YAML.
   - Done: added `styles:taxonomy` and backfilled persisted taxonomy for `SP01-001` as the first direct-authoring proof.
   - Done: `pack_01` now has persisted taxonomy across all 80 Style Preset Manifests and passes strict pack validation.
   - Done: `styles:validate -- --coverage` reports taxonomy and default-image coverage by pack so backfills can be audited incrementally.
   - Done: `pack_02` now has persisted taxonomy across all 120 Style Preset Manifests and passes strict pack validation.
   - Done: `pack_03` now has persisted taxonomy across all 80 Style Preset Manifests and passes strict pack validation.
   - Done: `pack_04` now has persisted taxonomy across all 100 Style Preset Manifests and passes strict pack validation.
   - Done: `pack_05` now has persisted taxonomy across all 372 Style Preset Manifests and passes strict pack validation.
   - Done: `pack_06` through `pack_11` now have persisted taxonomy across their remaining 500 Style Preset Manifests and pass strict pack validation.
   - Done: `styles:validate -- --coverage --strict-taxonomy` now proves all Style Preset Manifests have persisted taxonomy and default images.
   - Done: added `styles:catalog` so humans and agents can query the Style Preset Catalog by text, pack, category, tag, task, and JSON output without scanning compatibility packs.
   - Done: split the heavy Style Preset Catalog graph into `stylePresetCatalogData.ts` and generated a compact `styleRuntimeData.generated.ts` path for `stylesData.ts`, so the visual Styles Recipe no longer constructs catalog/taxonomy indexes at mount time.
   - Done: added `styles:runtime:check` and `styles:verify` so generated Styles runtime data can be proven current without rewriting files.
   - Done: Style Preset Manifest validation now checks authoring-contract drift beyond graph references, including duplicate packs/categories, empty identities, unknown packs, empty visual DNA, taxonomy pack/category drift, and taxonomy tag/task drift.
   - Done: added `styles:source:verify` and wired it into `styles:verify` so runtime code cannot accidentally reintroduce legacy pack YAML as the authoring source. Legacy usage is now limited to compatibility types/tests plus the source-audit guard.
   - Done: `styles:split` now refuses to overwrite granular manifests from legacy pack YAML.
   - Next: author new presets directly in granular files and keep `styles:runtime` in sync with manifest edits.
   - Done: authored `SP01-081` (Soft Editorial Window) as first direct-granular preset proof. Full authoring cycle verified: create YAML → register in pack manifest → add repo default image → validate → regenerate runtime data. Added `docs/STYLE_PRESET_AUTHORING.md` with YAML template, taxonomy contract, and workflow commands.
   - Done: added `assets/recipes/styles/defaults/SP01-081.webp` and updated the manifest taxonomy/assets block. Latest `styles:verify` shows 1,253/1,253 presets with taxonomy and default images; no missing default-image sample remains.
   - Done: Style Preset Catalog search data is now split into lazy per-pack YAML chunks. `stylePresetCatalogData.ts` uses `eager: false` globs with async `loadStylePresetCatalog()`. The `StylePresetCatalogSearchSurface` is demand-mounted via `React.lazy` in `StylesRecipe` and loads catalog data asynchronously with a loading state. The search surface chunk dropped from about 2,113 KB to about 189 KB.
   - Done: Style Preset Catalog search now demand-loads the catalog data module and YAML parser separately. Latest build: `StylePresetCatalogSearchSurface` 7.22 KB, `stylePresetCatalogData` 148.37 KB, `js-yaml` 39.60 KB.
   - Done: visual Styles runtime data is now split by pack and category. `styleRuntimeData.generated.ts` is a small summary/loader index, `styleRuntimePacks.generated/<pack>.ts` composes category chunks from `styleRuntimePacks.generated/<pack>/<category>.ts`, `stylesData.ts` exposes async loaders, and `StylesRecipe` loads the current pack on demand instead of importing the full 1.4 MB generated runtime or a 498 KB pack chunk.
   - Done: Style Pack Manifest validation now rejects duplicate top-level `presetRefs`, category refs missing from the pack-level list, and refs that point outside the pack namespace.
   - Done: `styles:source:verify` now also blocks generated runtime check temp files (`styleRuntimeData.generated.check.*.tmp.ts` and per-pack check temps), keeping the generated preset pipeline from committing verification artifacts.
   - Done: `styles:source:verify` now fails if legacy pack YAML reappears in `scripts/style-migration/legacy-packs` or in the retired `components/recipes/styles/packs` path.
   - Done: deleted `components/recipes/legacyStylesData.ts`, removing the importable runtime module over legacy pack YAML. Remaining legacy access is limited to compatibility tests plus the source-audit guard.
   - Done: `styles:verify` now includes `styles:render:verify`, so broad preset work also proves large packs remain bounded in the Styles browser initial render path.
   - Done: moved monolithic legacy pack YAML out of the normal Styles authoring path into a migration-only folder, then retired that migration path.
   - Done: `styles:source:verify` now fails if YAML files reappear in retired `components/recipes/styles/packs/`, and the migration README documents the migration-only boundary.
   - Done: moved migration-only legacy pack YAML out of `components/` entirely into `scripts/style-migration/legacy-packs/`, so the Styles UI tree contains only manifest-first authoring/runtime files.
   - Done: `styles:source:verify` now blocks any YAML under `components/recipes/styles/` outside `manifests/`, keeping the normal authoring tree manifest-only.
   - Done: retired `styles:split:legacy` and deleted all remaining monolithic migration pack YAML. `styles:source:verify` now fails if YAML reappears in `scripts/style-migration/legacy-packs/`.
   - Done: retired remaining YAML mutation helpers (`scripts/expand-pack-02-pack-05.ts`, `scripts/reorder-style-packs.ts`) as non-destructive guards. Category-base audit now reads composed granular manifests through `loadPacks()`.
   - Done: introduced explicit `StyleRuntimePack` / `StyleRuntimePreset` names and `composeStyleRuntimePacksFromManifests()`.
   - Done: retired old `StylePack`, `StylePresetDef`, and `composeStylePacksFromManifests()` runtime aliases. `styles:source:verify` now blocks those names everywhere except the source-audit guard/test.
   - Done: split Styles type contracts into `styles/manifestTypes.ts` for manifest authoring/catalogs and `styles/runtimeTypes.ts` for runtime UI/default-generation data. The old `styles/types.ts` barrel is deleted, and `styles:source:verify` blocks imports from that retired path.
   - Done: retired remaining pack-summary and generated-loader compatibility exports in Styles runtime (`STYLE_RUNTIME_PACK_SUMMARIES`, `loadStyleRuntimePack()`, and `loadStyleRuntimePacks()` are now canonical).
   - Done: added repo-local Style Preset Manifest templates for image, sprite-sheet, and texture presets under `components/recipes/styles/manifests/templates/`, plus `styles:templates:verify` to keep task-specific template coverage from drifting.
   - Done: added `styles:scaffold` as a non-destructive authoring CLI for new granular presets. It dry-runs by default, requires `--write` to mutate, scaffolds from the repo templates, accepts category id or exact category name, updates both pack-level and category `presetRefs`, supports optional `--default-image`, and has focused coverage in `scripts/scaffold-style-preset.test.ts`.

8. **Pipeline And Token Efficiency**
   - Done: `scripts/tooling-task.ts` forwards extra args for filtered `test`, `check`, `check:fix`, `fmt`, `fmt:check`, and `test:coverage` runs. Focused validation now executes only requested files during iteration.
   - Done: Codex imagegen stable instructions moved into one Provider Session Contract and Styles recipe payloads now compile from compact Recipe Provider Directives when available.
   - Done: `providers:audit` reports source spec size, compiled payload size, prompt character estimates, directive/context deltas, and unsafe inline-data/secret leakage for current provider compilers.
   - Done: added `recipes:evaluate` script and test harness. Generates bare/legacy/directives prompt variants per recipe, measures size savings (41–56% directives vs legacy), and writes JSON evaluation reports. Supports `--dry-run`, `--out=<dir>`, and `--recipe=<id>` filters.
   - Done: added `recipes:evaluate:live` so token-optimized prompt variants can be queued through the local backend on demand, with runtime readiness checks and repo-local review artifacts instead of committed images.
   - Done: added backend DI seam for logger. `appFactory` now accepts `dependencies.logger` and injects it into the worker controller. `getDefaultWorkerController` accepts an optional `logger` override. `useStudioRuntime` hook and `services/studioRuntime.ts` now have clarifying JSDoc distinguishing the React orchestrator from the static config adapter.
   - Done: audited all broad validation scripts — `validate-style-preset-manifests.ts` already supports `--pack=` / `--preset=` filters, `audit-provider-inputs.ts` supports `--provider=` / `--recipe=` / `--no-external-fixtures`, `query-recipe-modules.ts` supports `--provider=` / `--query=` / `--task=` / `--parameter=`. All can be scoped to changed files.
   - Done: frontend bundle cleanup avoids loading dev-only scanner and ZIP/export dependencies during normal startup.
   - Next: execute representative live Codex comparisons with `recipes:evaluate:live -- --execute`, then verify Styles render-plan budgets in a live browser pass.

9. **Catalog-First Visual Batch Migration**
   - Done: split `lib/studioCatalogView.ts` into a pure Catalog Entry read model. Legacy snapshot export now lives in `lib/studioLegacyVisualSnapshotExport.ts`; Catalog Entry image materialization lives in `lib/studioCatalogImageAdapter.ts`.
   - Done: added `catalog:source:verify` and wired it into `validate:full`, blocking regressions where `StudioCatalogView` imports Visual Batch adapters or `useCatalog` reads `catalog-cache`/global batch state.

- Done: `useStudioGallery` can now receive `StudioCatalogView` and materialize `imagesWithConfig` directly from Catalog Entries through `materializeCatalogEntryImageWithConfig`, while Visual Batches remain only for current selection/action compatibility.
- Done: `useImageManager` now accepts an optional image list, so gallery selection/delete/select-all/clear counts can operate on Catalog Entry materialized images when `catalogView` is present. Visual Batches remain as fallback for legacy callers.
- Done: workspace strip counts and thumbnails now prefer `StudioCatalogView` Catalog Entries; `GenerationBatch[]` is fallback only for legacy callers.
- Done: trash modal now receives archived Catalog Entry groups from `buildArchivedImageGroupsFromCatalog()` instead of `GenerationBatch[]`; restore/empty actions still target catalog entry ids through `trashCatalog.view`.
- Done: dashboard stats now receive catalog-derived `imagesCount` plus a snapshot export callback; `DashboardModal` no longer needs `GenerationBatch[]`.
- Done: workspace snapshot export now uses `buildLegacyVisualBatchSnapshot()` to make the legacy-compatible `GenerationBatch[]` edge explicit; workspace ZIP images still prefer `StudioCatalogView`.
- Done: legacy Visual Batch cache keys and snapshot validation now live in `studioLegacyVisualBatchStore`; `catalog:source:verify` fails if raw `catalog-cache`/`catalog-trash` strings spread outside that compatibility module.
- Done: `GlobalContext` public import/archive methods and reducer actions now say `LegacyVisualBatches` explicitly instead of generic replace/archive batch names.
- Done: recovery/runtime merge path now says `mergeLegacyVisualBatches` at the public edge; `LegacyVisualBatchContext` converts snapshots into refs and reducer stores only recovered refs through `REGISTER_RECOVERED_LEGACY_VISUAL_BATCH_REFS`; no generic `mergeBatches` API remains.
- Done: generated output append path now says `registerGeneratedLegacyVisualBatchRef`, while reducer stores only refs through `REGISTER_GENERATED_LEGACY_VISUAL_BATCH_REF`; no generic `prependBatch` public API remains.
- Done: `GlobalContext` no longer exposes `legacyVisualBatches` / `legacyVisualTrash`.
- Done: internal `GlobalState` no longer stores `legacyVisualBatches` / `legacyVisualTrash`, and delete/favorite legacy mirror actions were removed.
- Done: gallery, workspace strip, and vault transfer hooks now take `catalogView` as the primary path and no longer accept `legacyVisualBatches` fallback input.
- Done: storage recovery now receives legacy batch ids explicitly, overlay/page controller counts are `catalogVisualGroupCount` / `visualGroupsCount`, and Archived Images wording no longer says generic archived batches.
- Done: `useCatalog` now exposes only Catalog Entries and `StudioCatalogView`; Visual Batch materialization moved out of the hook and into the Studio Shell compatibility edge.
- Done: `useStudioShell` no longer calls `materializeVisualBatchesFromCatalog()` for the overlay/page count path. It now reads `catalogVisualGroupCount: number` from `activeCatalog.view.byBatchId.size`. `useStudioOverlayController` interface updated from `catalogVisualBatches: GenerationBatch[]` to `catalogVisualGroupCount: number`. All downstream consumers only needed `.length`.
- Done: `legacyVisualTrash` state and 4 trash reducer actions removed from `GlobalState`/`globalReducer`. `archiveLegacyVisualBatches`, `restoreLegacyVisualBatchFromTrash`, `restoreAllLegacyVisualBatchesFromTrash`, `emptyLegacyVisualTrash` context methods removed. `deleteImages()` simplified to drop empty batches. `useStudioShell`/`useVaultTransfer` no longer call trash side-effect mirrors.
- Done: `legacyVisualBatches` extracted from `GlobalContext` into dedicated `LegacyVisualBatchContext`, then reduced to an id registry with its own `legacyVisualBatchReducer`. Provider tree now `GlobalProvider > LegacyVisualBatchProvider > GenerationProvider`. `GlobalContext` is pure layout/background/session state.
- Done: gallery, workspace strip, and vault export builder `legacyVisualBatches` fallback params removed. `buildStudioGalleryImages` accepts only `catalogView`. `buildWorkspacesWithThumbs` returns zero-count workspaces without catalog. `buildLegacyVisualBatchSnapshot` and `buildWorkspaceExportImages` return empty arrays without catalog. `useImageManager` `legacyVisualBatches` prop and `GenerationBatch` dependency removed. `useStudioShell` `shouldAutoOpen` now checks catalog emptiness only.
- Done: dead `GenerationBatch` import removed from `components/overlays/types.ts`.
- Done: visible legacy workspace snapshot JSON import removed from Dashboard/System surfaces and `useVaultTransfer`; snapshots are export-only metadata.
- Done: storage recovery now reuses `studioLegacyVisualSnapshotImport` for legacy array and single-batch candidates instead of validating Visual Batch payloads directly.
- Done: `useStudioRuntime` and `useStudioStorageRecovery` no longer take `GenerationBatch[]` directly. Recovery now receives existing legacy batch ids and emits an explicit `LegacyVisualBatchSnapshot` through the import callback.
- Done: generated-job append now passes through `localGenerationVisualBatchCompat`, making the Local Generation Result to legacy Visual Batch update an explicit compatibility edge. `GenerationContext` now gets that legacy updater from `LegacyVisualBatchContext`, not `GlobalContext`.
- Done: `runLocalGeneration` no longer returns a `GenerationBatch`. It returns catalog-derived local result data, and `localGenerationVisualBatchCompat` builds the legacy Visual Batch only at the cache append edge.
- Done: `LegacyVisualBatchContext` public append API is now `registerGeneratedLegacyVisualBatchRef`, and reducer action is `REGISTER_GENERATED_LEGACY_VISUAL_BATCH_REF`, so generated-job compatibility stores only refs.
- Done: `catalog:source:verify` now blocks `LegacyVisualBatchContext` from reintroducing IndexedDB persistence for Visual Batches. Active `GenerationBatch[]` cache is in-memory only; `catalog-cache`/`catalog-trash` remain recovery-only legacy keys.
- Done: `catalog:source:verify` now blocks generated-job legacy append helpers from spreading outside `localGenerationVisualBatchCompat`, `GenerationContext`, `LegacyVisualBatchContext`, and the reducer/test edge.
- Done: `catalog:source:verify` now blocks new direct `useLegacyVisualBatches()` consumers outside `GenerationContext`, `LegacyVisualBatchContext`, and `useStudioShell`, keeping Visual Batch usage as orchestration/compatibility only.
- Done: `LegacyVisualBatchContext` no longer exposes the full `legacyVisualBatches` snapshot. It exposes `legacyVisualBatchIds` for recovery dedupe plus compatibility actions, and `catalog:source:verify` blocks snapshot export from returning.
- Done: `legacyVisualBatchReducer` now stores only `legacyVisualBatchRefs` ids/workspace ids instead of full legacy snapshots. It no longer imports `LegacyVisualBatchSnapshot`; `catalog:source:verify` blocks snapshot types from returning there. Confirmed workspace clear now calls the Catalog archive path, not the hidden id registry.
- Done: legacy recovery options no longer carry noop `ensureWorkspaces`; storage recovery now passes only the options the reducer actually consumes.
- Done: workspace snapshot JSON import no longer exists as a user action. Real image import is only via External Output Sources.
- Done: `useStudioRuntime` no longer imports `LegacyVisualBatchSnapshot` directly. That type is limited to storage recovery hook edges, and `catalog:source:verify` blocks hook-level spread.
- Done: legacy snapshot export moved into `studioLegacyVisualSnapshotExport`, and Catalog Entry image-with-config materialization moved into `studioCatalogImageAdapter`.
- Done: deleted the empty `studioCatalogVisualBatchAdapter` alias module after replacing remaining callers with explicit snapshot/image adapters.
- Done: deleted `studioVisualBatchCatalog`; Catalog Entry image materialization now lives only in `studioCatalogImageAdapter`, while legacy `GenerationBatch[]` materialization stays in `studioLegacyVisualSnapshotExport`.
- Next: keep shrinking the remaining `GenerationBatch[]` compatibility surface in storage recovery and generated-job append paths.

## Guardrails

- Treat Codex as the primary product integration, not just one provider among many.
- Keep provider-specific SDKs, credentials, retries, and output discovery behind backend adapters.
- Keep external provider capabilities blocked until a concrete executor is wired; the adapter shell is not enough to mark a provider executable.
- Do not weaken recipe data to save tokens; optimize provider compilers and repeated session instructions instead.
- Import external outputs into a Studio Library before catalog, delete, move, tag, or metadata operations.
- Use `resolveLibraryPathFromRoot(libraryDir, ...)` for all logical Studio Library paths outside the layout helper/migration internals.
- Keep UI labels and workflows consistent with the existing professional tool direction.
- Do not mark this roadmap complete until style generation scripts, recipe modules, provider adapters, settings/output-source UX, and UI performance follow-ups are audited against current files.
- Registration is not import: External Output Source registry proves safe path intent only. Import must be an explicit copy into the Studio Library.
