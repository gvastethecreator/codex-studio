# Codex Studio Professionalization Handoff

Repo: `D:\DEV\codex-studio`

Keep this handoff inside the project. The active goal remains open; do not mark it complete. The user explicitly wants continued professionalization work and says there is still much left.

## Operating Notes

- Use PowerShell without profile (`login:false` / `-NoProfile`) because shell startup previously hung/noised with oh-my-posh.
- Preserve dirty worktree changes. This branch is intentionally very dirty.
- Use `apply_patch` for manual edits.
- Prefer focused tests while iterating, then relevant domain gate/build.
- If `rg` fails, fall back to `Get-ChildItem` + `Select-String`.

## Required Context

Before architecture/runtime work read:

- `CONTEXT.md`
- `docs/ARCHITECTURE.md`
- latest relevant ADRs in `docs/adr/`
- `docs/active/professionalization-roadmap.md`
- `docs/TECHNICAL_DEBT.md`

Before provider, recipe, preset, or output work read:

- `SKILLS.md`

## Current Architecture Direction

- Codex-first, local-first, library-backed.
- `codex app-server` is the Codex Product Runtime.
- SDK/scripts are Codex Automation Surface.
- Generation Task and Generation Provider stay separate.
- Recipe Modules produce Generation Task Specs.
- Providers compile specs into compact provider inputs.
- Provider Secrets stay outside SQLite, settings, logs, transcripts, screenshots, and docs.
- Command Center is the top toolbar.
- Heavy diagnostics/settings/provider internals should stay Demand-Mounted Surfaces.

## Recently Verified Gates

Fresh focused gates from the latest slices:

- `bun run styles:verify` passed: 11 packs, 1,253 presets, taxonomy/default-image coverage complete, runtime current, source/render guards OK.
- `bun run catalog:source:verify` passed: 9 rules / 0 violations.
- Browser validation for `http://127.0.0.1:5173/#recipe-styles` passed after fixing the toolbar model-label crash: root mounted, expanded `SHOW 19 MORE`, searched `boudoir`, no fresh console errors/warnings after timestamp-filtered reload.
- Focused `vp test run lib/codexExecution.test.ts` passed: 1 file / 5 tests.
- Focused `vp check lib/codexExecution.ts lib/codexExecution.test.ts` passed.
- `styles:render:verify` now covers expanded category budget and the `pack_01` search scenario `boudoir`; latest run passed with worst expanded group at 42 cards and search at 1 rendered card.
- `bun run styles:verify` passed after the expanded/search render guard: 11 packs, 1,253 presets, taxonomy/default-image coverage complete, runtime current, source/render guards OK.
- `recipes:verify` now includes `recipes:evaluate -- --verify`, so recipe module verification fails if compact Recipe Provider Directives stop beating legacy Recipe Context prompts by at least 30%.
- Focused `recipes:evaluate -- --verify --recipe=styles` passed: 1 pair, 0 failures.
- `catalog:source:verify` now has 9 rules. It blocks legacy cache key drift, `LegacyVisualBatchContext` IndexedDB persistence, full snapshot export from `LegacyVisualBatchContext`, new `GenerationBatch` imports outside explicit legacy compatibility adapters/tests/shared type files, generated-job legacy append usage outside the compat/context edge, new `useLegacyVisualBatches()` consumers outside Studio Shell / generated-job compatibility, and hook-level `LegacyVisualBatchSnapshot` usage outside storage recovery compatibility.
- Focused `vp test run scripts/catalog-first-source-audit.test.ts` passed: 2 tests.
- `hooks/useVaultTransfer.ts` no longer imports `GenerationBatch` or `LegacyVisualBatchSnapshot`; vault is export/download-only.
- Focused vault/export builder coverage now lives in `lib/studioWorkspaceExport.test.ts`; the old hook-level builder test was removed.
- `GenerationBatch` is now centralized behind `lib/studioLegacyVisualBatchTypes.ts` for legacy compatibility modules. Snapshot import/export, legacy validation, and local-generation compat now consume `LegacyVisualBatch`/`LegacyVisualBatchSnapshot` aliases instead of importing the base type directly.
- Current `GenerationBatch` text references are limited to `types.ts`, `studioLegacyVisualBatchTypes.ts`, and the catalog source audit/test fixtures.
- Workspace snapshot/export builders moved out of `hooks/useVaultTransfer.ts` into pure catalog-first `lib/studioWorkspaceExport.ts`; the hook now owns file I/O orchestration only.
- Focused `vp test run lib/studioWorkspaceExport.test.ts scripts/catalog-first-source-audit.test.ts` passed: 5 tests.
- Focused `vp test run lib/localGenerationVisualBatchCompat.test.ts contexts/legacyVisualBatchReducer.test.ts scripts/catalog-first-source-audit.test.ts` passed: 3 files / 9 tests.
- Focused `vp check hooks/useGenerationPipeline.ts scripts/catalog-first-source-audit.ts scripts/catalog-first-source-audit.test.ts` passed.
- Focused `vp test run scripts/catalog-first-source-audit.test.ts` passed after adding the context-consumer guard.
- Focused `vp check scripts/catalog-first-source-audit.ts scripts/catalog-first-source-audit.test.ts` passed after adding the context-consumer guard.
- `LegacyVisualBatchContext` now exposes `legacyVisualBatchIds` instead of the full `legacyVisualBatches` snapshot. `useStudioShell` only receives IDs for recovery dedupe.
- `legacyVisualBatchReducer` is now an IDs-only registry. It no longer stores full legacy snapshots or mirrors image delete/favorite mutations.
- Workspace clear confirmation now calls the Catalog clear path instead of the hidden legacy id registry, so confirmed clear still archives Catalog Entries.
- Workspace snapshot JSON import UI was removed. JSON snapshots are export-only metadata; image import must use Settings > External Output Sources to become Catalog Entries.
- Focused `vp check contexts/LegacyVisualBatchContext.tsx hooks/useStudioShell.ts scripts/catalog-first-source-audit.ts scripts/catalog-first-source-audit.test.ts` passed after removing the public snapshot.
- `useStudioRuntime` no longer imports `LegacyVisualBatchSnapshot` directly; that type is now hidden behind `useStudioStorageRecovery`'s recovery callback type.
- Focused `vp check hooks/useStudioRuntime.ts hooks/useStudioStorageRecovery.ts scripts/catalog-first-source-audit.ts scripts/catalog-first-source-audit.test.ts` passed after isolating hook-level snapshot usage.
- `styles:source:verify` now fails if any YAML under `components/recipes/styles/` lives outside the manifest authoring tree.
- Focused `vp test run scripts/style-authoring-source-audit.test.ts` passed: 6 tests.
- Focused `vp check scripts/style-authoring-source-audit.ts scripts/style-authoring-source-audit.test.ts` passed.
- `bun run build` passed after the latest catalog/legacy slices; UI/server build clean, chunk budgets OK. Warnings about `vite:asset` timing and chunks over 500 KB are known/non-blocking because budget guards pass.
- Full `bun run check` currently fails on formatting issues across 169 files. Do not run global `--fix` casually; fix touched scopes or do a dedicated formatting slice.

Earlier broad gates in this branch also passed, but rerun fresh before claiming broad completion:

- `bun run test`
- `bun run check`
- `bun run build`
- `bun run validate:full`

## Current Completed Slices

### Prompt / Attachments

- Codex provider now sends attached local/reference images as turn input items.
- Compiled prompts are compact and omit transport metadata like recipe id, preset id, `Recipe Module`, and duplicate recipe summary blocks.
- Codex imagegen output instructions preserve the denoise workaround: `Apply a heavy strong denoise to the resulting image.`

Relevant files:

- `apps/local-server/src/codex/turnInput.ts`
- `apps/local-server/src/codex/imagegenContract.ts`
- `apps/local-server/src/providers/codexProvider.ts`
- `services/localGenerationRun.ts`

### Studio Library Layout

- Physical Studio Library layout migrated:
  - `.studio/` for SQLite, config/state, logs, transcripts, references, masks, internal trash.
  - `outputs/` for generated images, thumbnails, exports, output trash.
- `D:\AI-Studio-Library` was physically migrated. Last dry-run reported `moved: 0`, `updatedDbRows: 0`.
- Root contains `.studio`, `outputs`, and `README.txt`.
- Output organization settings support subfolder tokens and filename template.
- `library:layout:verify` guards against new raw `libraryDir` joins for `library.sqlite`, `transcripts`, `assets`, `outputs`, or `.studio` outside layout helper/migration internals.
- Default-generation scripts and metadata embedding now route DB/transcripts/assets lookups through `resolveLibraryPathFromRoot`.

Relevant files:

- `apps/local-server/src/library.ts`
- `apps/local-server/src/outputOrganization.ts`
- `apps/local-server/src/worker.ts`
- `packages/shared/src/studioSettings.ts`
- `components/StudioSettingsModal.tsx`
- `scripts/migrate-studio-library-layout.ts`
- `scripts/studio-library-layout-source-audit.ts`

### Style Presets

- Real authoring path is granular manifests:
  - `components/recipes/styles/manifests/packs/*.yaml`
  - `components/recipes/styles/manifests/presets/<pack>/<preset>.yaml`
- `components/recipes/styles` now contains only `manifests/` and `types.ts`.
- `styles:source:verify` blocks YAML under `components/recipes/styles/` unless it lives in `manifests/`.
- Legacy monolithic YAML was removed from `components/` and from `scripts/style-migration/legacy-packs/`.
- `styles:split` refuses destructive legacy overwrite by default.
- `styles:split:legacy` was retired; `styles:split` is now a non-destructive guard that tells agents to edit manifests directly.
- `style-default-utils` now loads granular manifests only; the legacy YAML fallback is gone. `audit-style-category-bases` uses composed manifests.
- Old YAML mutation helpers `scripts/expand-pack-02-pack-05.ts` and `scripts/reorder-style-packs.ts` are retired guards.
- Explicit runtime names now exist: `StyleRuntimePack`, `StyleRuntimePreset`, and `composeStyleRuntimePacksFromManifests()`.
- Old `StylePack`, `StylePresetDef`, and `composeStylePacksFromManifests()` runtime aliases are retired. `styles:source:verify` blocks them everywhere except the source-audit guard/test.
- `styles:source:verify` blocks:
  - runtime imports of legacy pack YAML,
  - generated check temp files,
  - legacy-only preset additions,
  - YAML files recreated in retired `components/recipes/styles/packs/`.
- `SP01-081` direct-granular authoring proof exists with default image.
- Full style verification passed: 1,253/1,253 taxonomy and default images.

Relevant files:

- `components/recipes/styles/manifests/`
- `scripts/style-migration/legacy-packs/` must stay free of YAML files.
- `scripts/style-authoring-source-audit.ts`
- `scripts/split-style-preset-manifests.ts`
- `docs/STYLE_PRESET_AUTHORING.md`

### Catalog-First Visual Batch Migration

Catalog Entries are durable truth. Visual Batch is compatibility only.

Completed:

- `GlobalContext` no longer owns active visual batch state.
- `LegacyVisualBatchContext` owns in-memory legacy visual compatibility state.
- `legacyVisualTrash` removed.
- Gallery/workspace/vault hooks no longer accept `legacyVisualBatches` fallback params.
- `useCatalog` returns Catalog Entries + `StudioCatalogView` only.
- `useStudioShell` uses `catalogVisualGroupCount` instead of materializing `GenerationBatch[]` for overlay/page counts.
- `studioCatalogVisualBatchAdapter` deleted.
- `studioVisualBatchCatalog` deleted.
- Catalog Entry image helpers live in `lib/studioCatalogImageAdapter.ts`.
- Legacy snapshot export lives in `lib/studioLegacyVisualSnapshotExport.ts`.
- Storage recovery uses `LegacyVisualBatchSnapshot` types from `studioLegacyVisualSnapshotImport.ts`.
- `runLocalGeneration` no longer returns `GenerationBatch`; it returns catalog-derived local result data.
- `localGenerationVisualBatchCompat` builds the legacy Visual Batch only at append edge.
- `LegacyVisualBatchContext` append API is explicitly named `prependGeneratedLegacyVisualBatch`.
- `catalog:source:verify` enforces generated-job legacy append isolation: `appendLocalGenerationResultToLegacyVisualBatches`, `prependGeneratedLegacyVisualBatch`, and `REGISTER_GENERATED_LEGACY_VISUAL_BATCH_ID` cannot spread outside the local-generation compat/context/reducer edge.
- `catalog:source:verify` enforces `useLegacyVisualBatches()` isolation: only `GenerationContext`, `LegacyVisualBatchContext`, and `useStudioShell` may consume it directly.
- `catalog:source:verify` enforces no full snapshot export from `LegacyVisualBatchContext`; public API is IDs plus compatibility actions only.
- `catalog:source:verify` enforces hook-level `LegacyVisualBatchSnapshot` isolation: only `useStudioStorageRecovery` may mention it.
- Active Visual Batches are in-memory only. `catalog-cache` and `catalog-trash` are legacy recovery keys only.
- `catalog:source:verify` blocks `LegacyVisualBatchContext` from reintroducing `useIndexedDBStorage`, raw cache keys, or direct `utils/idb` access.

Relevant files:

- `contexts/LegacyVisualBatchContext.tsx`
- `contexts/legacyVisualBatchReducer.ts`
- `lib/studioCatalogView.ts`
- `lib/studioCatalogImageAdapter.ts`
- `lib/studioLegacyVisualSnapshotExport.ts`
- `lib/studioLegacyVisualSnapshotImport.ts`
- `lib/localGenerationVisualBatchCompat.ts`
- `scripts/catalog-first-source-audit.ts`

### Provider Boundary

- Codex, dry-run, fal.ai, Google Gemini image API, and ComfyUI are behind Provider Boundary.
- fal.ai has hosted executor with retry, CDN upload, role mapping, result normalization, no-secret transcripts.
- Google has hosted executor with `generateContent`, inline result import, and image-first edit mode.
- ComfyUI has local executor using `COMFY_API_URL`/`COMFYUI_API_URL` plus `COMFY_WORKFLOW_TEMPLATE_PATH`; blocked until both are configured.
- External preflight exposes secret/runtime state without secret values.
- `providers:verify` now includes `providers:source:verify`, blocking provider compiler/executor imports outside `apps/local-server/src/providers/`.

Relevant files:

- `apps/local-server/src/providers/providerInputCompiler.ts`
- `apps/local-server/src/providers/externalProvider.ts`
- `apps/local-server/src/providers/externalProviderExecutors.ts`
- `apps/local-server/src/providers/externalProviderResults.ts`
- `apps/local-server/src/providers/googleExecutor.ts`
- `apps/local-server/src/providers/falExecutor.ts`
- `apps/local-server/src/providers/comfyExecutor.ts`
- `scripts/provider-boundary-source-audit.ts`
- `apps/local-server/src/providers/runtimeConfig.ts`

## Known Dirty Worktree

The worktree is very dirty by design. Expect changes across:

- provider adapters/tests,
- prompt/turn input,
- Studio Library layout/output organization,
- settings/output-source UI/backend,
- catalog-first visual compatibility,
- styles manifests/runtime/migration,
- docs,
- `bun.lock`.

Do not revert unrelated changes.

## Good Next Slices

Pick one vertical slice per session.

### Catalog-First UI

- Continue shrinking/removing `LegacyVisualBatchContext`; it is now only an id registry for recovery dedupe and generated append compatibility.
- Keep `catalog:source:verify` green.
- Add a guard if any new component starts depending on `legacyVisualBatches` outside compatibility context.

Useful validation:

- `bun run catalog:source:verify`
- `bun run test -- contexts/legacyVisualBatchReducer.test.ts lib/localGenerationVisualBatchCompat.test.ts lib/studioStorageRecovery.test.ts lib/studioWorkspaceExport.test.ts`
- `bun run build`

### Style Presets

- Author new presets directly in granular YAML.
- Add more human/agent authoring examples.
- Next preset cleanup is reducing remaining alias/export compatibility and `STYLE_PACKS` doc/runtime vocabulary, not editing legacy YAML.
- Replace static render budget with browser-render measurement for expanded packs.

Useful validation:

- `bun run styles:verify`
- `bun run styles:catalog -- --query=<text> --limit=20`
- `bun run build`

### UI / Command Center / Performance

- Measure rendered UI for large expanded Styles packs.
- Verify Style Preset Catalog Search is demand-mounted in browser.
- Move any remaining global status/provider/library/settings surfaces into Command Center if found.

Useful validation:

- `bun run ui:source:verify`
- `bun run ui:chunks:verify`
- Browser/Playwright screenshot/perf pass if changing rendered UI.

### Recipe Modules / Tokens

- Run live Codex output quality comparison using `recipes:evaluate`.
- Keep compact Recipe Provider Directives while preserving output quality.
- Do not remove legacy Recipe Context from stored job metadata without evidence.

Useful validation:

- `bun run recipes:verify`
- `bun run providers:verify`
- `bun run library:layout:verify`

### Settings / External Outputs

- Improve selected-file import UX for registered External Output Sources.
- Preserve rule: registration is not import.
- Never move/delete external source files unless explicitly requested.

Useful files:

- `apps/local-server/src/outputSources.ts`
- `components/StudioSettingsModal.tsx`
- `services/localStudioService.ts`
- `hooks/useStudioSettings.ts`

### Backend Architecture

- Add db/worker/lifecycle DI seams beyond the logger seam.
- Keep Provider Secrets out of SQLite/settings/transcripts.

Useful validation:

- focused backend tests,
- `bun run providers:verify`,
- `bun run build`.

## Technical Debt Still Relevant

See `docs/TECHNICAL_DEBT.md`. Highest remaining items:

- Further split `components/AppContent.tsx`.
- Continue catalog-first UI migration until Visual Batch compatibility can be deleted.
- Add backend DI seams for db/worker/lifecycle.
- Run real rendered UI/perf measurements for heavy style surfaces.
- Final open-source artifact audit before release.

## Safe Loop

1. Read required context files.
2. Pick one vertical slice.
3. Add or update focused tests/guards first when practical.
4. Implement scoped change.
5. Run focused tests plus relevant domain gate.
6. Run `bun run build` before claiming a slice done.
7. Leave goal active unless every roadmap/debt item is proven complete.
