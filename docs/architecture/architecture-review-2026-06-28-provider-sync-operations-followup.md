# Architecture review - Codex Studio provider, sync, and operation seams follow-up

Date: 2026-06-28

Status: implemented and verified.

## Summary

- This review follows `docs/architecture/architecture-review-2026-06-26-provider-sync-style.md` and reconciles that batch against the current worktree.
- The broad direction still holds: Codex-first, local-first, Catalog Entry as durable truth, Provider Boundary, Studio Settings over editable config, Demand-Mounted Surfaces, and summary-first hot reads.
- At review time, several 2026-06-26 items were partially implemented and the remaining friction was concentrated where Modules exposed implementation-shaped Interfaces: provider facts, job intake, Local Studio Sync, Settings hydration, Command Center status, style search, recipe discovery, and legacy compatibility.
- The accepted batch did not create a new architecture lane. It finished current seams where the repo already had source guards, route adapters, and partial projections.

## Subagent agreement

- James, backend/runtime: summary-first reads and provider executors were partially deepened; live Provider Settings reads, Provider Registry, Persistent Job Intake, and sync-owned job waiting were the highest-leverage backend seams.
- Einstein, shell/UX: Demand-Mounted Surfaces and toolbar builders existed; Shell Activity Jobs, Local Studio Sync invalidation, Settings Surface hydration, and Command Center provider/status projection still leaked implementation detail into UI callers.
- Meitner, styles/catalog/storage: backend Catalog Command results, manifest catalog CLI, safe External Output Source import, storage audit, and catalog-first guards existed; Style Search Projection, Catalog Operation Result, Import Operation, Storage Repair Plan, and sealed Legacy Visual Batch DTO were still open.

## Pre-implementation state of the 2026-06-26 review

- Implemented enough to treat as closed: route extraction for backend groups, summary-first `/api/jobs` read path, backend Catalog Command summaries, provider executor shells, granular Style Preset Manifest authoring and validation, Demand-Mounted Surface chunking.
- Partial before this batch: Provider Boundary freshness, Provider Registry, Persistent Job Intake, frontend activity-job projection, Local Studio Sync scoped invalidation and bounded job waiting, Settings Surface depth, Style Search Projection, Import Operation, Storage Repair Plan, Legacy Visual Batch DTO.
- New friction found in that pass: Recipe Module discovery/search had two different catalog surfaces, and Command Center stored compact/provider preferences without a complete product projection.

## Recommendations

### 1. Make Provider Settings reads live at the Provider Boundary

**Recommendation strength**: Strong

**Files**

- `apps/local-server/src/providerRoutes.ts`
- `apps/local-server/src/appFactory.ts`
- `apps/local-server/src/settingsRoutes.ts`
- `apps/local-server/src/providerCapabilities.ts`

**Problem**

`createProviderRoutes()` still receives a Studio Settings value, while other routes receive a settings reader. `/api/providers` can report stale default-provider state after Studio Settings are patched. The route Adapter has a snapshot-shaped Interface.

**Solution**

Deepen a Provider Boundary read Module so provider capability and preflight reads cross a live Studio Settings seam per request. Keep the HTTP Adapter thin.

**Benefits**

- locality: provider freshness lives in one Module.
- leverage: Command Center status, Settings provider diagnostics, and provider blocker tests share one freshness rule.
- tests: one route-seam test can patch Studio Settings and prove `/api/providers` changes without recreating the app.

**Before / After**

- Before: app construction reads Studio Settings once and passes the value to provider routes.
- After: provider routes read current Studio Settings at request time.

**Dependencies / sequencing**

- Do first. It is small and makes provider status evidence reliable for later work.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` Provider Boundary seam.
- Update `docs/TECHNICAL_DEBT.md` backend dependency-injection progress.

### 2. Consolidate provider facts into a Provider Registry Module

**Recommendation strength**: Strong

**Files**

- `apps/local-server/src/providerCapabilities.ts`
- `apps/local-server/src/providers/runtimeConfig.ts`
- `apps/local-server/src/providers/providerInputCompiler.ts`
- `apps/local-server/src/providers/externalProviderExecutors.ts`
- `apps/local-server/src/workerRouting.ts`
- `packages/shared/src/providerCapabilities.ts`
- `packages/shared/src/generationContracts.ts`

**Problem**

Provider identity is still duplicated across capability reporting, runtime preflight, compiler lookup, executor Adapter lookup, and worker routing. Adding a Generation Provider requires editing several lists and remembering hidden invariants.

**Solution**

Deepen one Provider Registry Module that owns provider definitions and publishes projections for capability reads, runtime requirements, compiler lookup, executor Adapter lookup, and worker target routing.

**Benefits**

- locality: provider ids, runtime requirements, compiler presence, executor presence, and routing policy change in one Module.
- leverage: audits, route handlers, worker routing, and provider tests cross the same seam.
- tests: one registry fixture can prove every provider has consistent capability, preflight, compiler, executor, and routing projections.

**Before / After**

- Before: `google`, `fal`, and `comfy` are repeated across runtime config, compiler registry, executor registry, and routing.
- After: one registry projects those facts into the existing Modules.

**Dependencies / sequencing**

- Depends on recommendation 1.
- Do before adding providers or changing executability policy.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` Provider Boundary section.
- Update `SKILLS.md` provider workflow if accepted.
- Add an ADR only if executability policy changes.

### 3. Extract Persistent Job Intake from the job route Adapter

**Recommendation strength**: Strong

**Files**

- `apps/local-server/src/jobRoutes.ts`
- `apps/local-server/src/appFactory.ts`
- `apps/local-server/src/referenceManager.ts`
- `apps/local-server/src/workerRouting.ts`
- `packages/shared/src/generationContracts.ts`
- `packages/shared/src/types.ts`

**Problem**

`jobRoutes.ts` is an HTTP Adapter, but it also owns request decoding, provider selection, reference hydration, source-spec validation, job persistence, event publication, and enqueue. New POST requests still accept `codex_imagegen`, even though Generation Task and Generation Provider are separate concepts.

**Solution**

Deepen a Persistent Job Intake Module behind `POST /api/jobs`. The route decodes transport input; intake owns provider blocker checks, reference persistence, Generation Task Spec validation, job creation, publish, and enqueue. Keep legacy `codex_imagegen` row compatibility in worker routing, but make new-job policy explicit.

**Benefits**

- locality: intake invariants live in one Module instead of an HTTP route.
- leverage: UI generation, retry, recipe runs, and tests cross one intake seam.
- tests: blocked provider, invalid source spec, reference failure, and legacy-kind policy can be tested without Hono setup.

**Before / After**

- Before: route Adapter and intake implementation are interleaved.
- After: route Adapter calls Persistent Job Intake and returns normalized success/error results.

**Dependencies / sequencing**

- Do after recommendation 1.
- Pair the `codex_imagegen` decision with this extraction.

**Documentation follow-ups**

- Add `Persistent Job Intake` to `CONTEXT.md` if accepted.
- Update `docs/ARCHITECTURE.md` generation flow.
- Add an ADR only if the new `codex_imagegen` request policy is surprising.

### 4. Protect summary-first reads with a Shell Activity Job Module

**Recommendation strength**: Strong

**Files**

- `services/localStudioService.ts`
- `hooks/useLocalStudioSync.ts`
- `hooks/localStudioSyncProjection.ts`
- `lib/buildStudioPageController.ts`
- `components/studio/StudioOperationsRail.tsx`
- `packages/shared/src/types.ts`

**Problem**

`listStudioJobs()` returns `JobSummary[]`, but `Local Studio Sync` and Shell-facing operations still type and name the data as full `Job[]`. Some callers still expect `sourceSpec`-like detail on hot reads.

**Solution**

Deepen a Shell Activity Job Module that normalizes Job Summaries, SSE job payloads, and linked Browser Queue jobs into one compact presentation model for Command Center, Queue, placeholders, and Debug Panel.

**Benefits**

- locality: summary/detail reconciliation stays in one Module.
- leverage: Command Center, Queue, operations rail, and Debug Panel consume the same activity model.
- tests: fixtures can prove hot-read jobs with `sourceSpec: null` still render safe placeholders and active counts.

**Before / After**

- Before: summary-first backend data crosses full-job-shaped Interfaces.
- After: Shell callers cross a compact activity-job Interface aligned with ADR-0031.

**Dependencies / sequencing**

- Do before deeper Local Studio Sync job waiting.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` Local Studio Sync and Studio Shell notes.
- Update `docs/TECHNICAL_DEBT.md` summary-first progress.

### 5. Deepen Local Studio Sync invalidation and Catalog Operation Result together

**Recommendation strength**: Strong

**Files**

- `hooks/useLocalStudioSync.ts`
- `hooks/localStudioSyncRefreshPolicy.ts`
- `hooks/useCatalog.ts`
- `services/studioEventSource.ts`
- `apps/local-server/src/catalogCommands.ts`
- `apps/local-server/src/catalogRoutes.ts`
- `packages/shared/src/types.ts`

**Problem**

Catalog events are typed, and backend Catalog Commands return count summaries, but the frontend still treats catalog and asset events as broad refresh triggers. `runCatalogMutation()` discards command results, and `restoreCatalogBatch()` depends on trash entries currently loaded in the client.

**Solution**

Deepen Local Studio Sync into the runtime event seam and deepen Catalog Operation Result into a frontend-visible Module. Pass catalog event kind/scope through the event Adapter, use command summaries for toasts and partial failures, and add bounded job waiting to Local Studio Sync.

**Benefits**

- locality: event handling, invalidation, job waiting, and command feedback concentrate in one sync path.
- leverage: catalog grid, trash, workspace commands, queue previews, and generation waits share one event truth.
- tests: scoped catalog events, partial command failures, restore-by-filter, and reconnect catch-up can be tested at the seam.

**Before / After**

- Before: asset/catalog events trigger broad refresh; command summaries stop at the backend.
- After: typed catalog events and operation results drive scoped refresh and visible feedback.

**Dependencies / sequencing**

- Depends on recommendation 4.
- Do before Import Operation.

**Documentation follow-ups**

- Update `docs/architecture/DEEPENING-ROADMAP.md` Local Studio Sync partial item.
- Update `docs/active/runtime-storage-ux-plan-2026-06-21.md`.

### 6. Move Settings hydration into a Settings Surface Module

**Recommendation strength**: Strong

**Files**

- `hooks/useStudioSettings.ts`
- `hooks/useStudioShell.ts`
- `hooks/useStudioOverlayController.ts`
- `components/StudioSettingsModal.tsx`
- `components/overlays/StudioSystemOverlays.tsx`
- `services/localStudioService.ts`

**Problem**

`useStudioSettings()` has domain names, but the Studio Shell still triggers open-time refresh and repacks settings, provider, output-source, and maintenance domains into overlay props. Heavy reads and error state still cross a wide shell Interface.

**Solution**

Deepen a Settings Surface Module that owns open-time hydration, per-domain loading/error state, and heavy refresh rules. Keep compact settings/provider summary data at the Command Center seam.

**Benefits**

- locality: provider diagnostics, External Output Source state, maintenance actions, and settings persistence stay with the surface using them.
- leverage: Shell and overlay controller stop learning the implementation detail of each Settings domain.
- tests: surface tests can prove startup reads summary data while opening Settings hydrates heavy domains.

**Before / After**

- Before: Studio Shell knows when to refresh heavy Settings domains.
- After: Studio Shell opens a Settings Surface; the surface owns heavy domain hydration.

**Dependencies / sequencing**

- Can run after recommendation 5, or independently if scoped to Settings-only loading.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` Demand-Mounted Surface list.
- Update `docs/TECHNICAL_DEBT.md` Settings and External Output UX.

### 7. Complete the Command Center Projection Module

**Recommendation strength**: Strong

**Files**

- `lib/buildStudioHeaderToolbarProps.ts`
- `components/HeaderToolbar.tsx`
- `components/StudioSettingsModal.tsx`
- `hooks/useStudioShell.ts`
- `packages/shared/src/studioSettings.ts`

**Problem**

The Command Center exists visually, but product status is not fully projected there. `commandCenterCompactMode` is stored in Studio Settings, but the toolbar does not consume it. Provider display is an id string, not a provider capability/preflight projection.

**Solution**

Deepen a Command Center Projection Module that combines Studio Settings, Studio Readiness, provider capability/preflight status, queue state, and compact-mode preference into one product model consumed by the toolbar.

**Benefits**

- locality: toolbar status rules live in one Module.
- leverage: desktop and mobile toolbar states use the same provider/readiness/queue projection.
- tests: compact-mode, blocked provider, queue counts, and runtime warning states can be tested without mounting the Shell.

**Before / After**

- Before: toolbar receives provider id and runtime label separately.
- After: toolbar receives one Command Center projection with provider state and command availability.

**Dependencies / sequencing**

- Do after recommendation 1 so provider status is fresh.
- Do after or alongside recommendation 6 if compact Settings summary moves.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` Command Center seam.
- Update `docs/DESIGN.md` if compact-mode behavior becomes user-visible.

### 8. Build Style Search Projection from manifest truth

**Recommendation strength**: Strong

**Files**

- `components/recipes/stylePresetManifests.ts`
- `components/recipes/stylePresetCatalogSearchData.ts`
- `components/recipes/StylePresetCatalogSearchSurface.tsx`
- `components/recipes/styles/runtimeTypes.ts`
- `components/recipes/styles/styleRuntimeData.generated.ts`
- `components/recipes/styles/manifests/presets/pack_06/SP06-119.yaml`

**Problem**

Style Preset Manifests carry task semantics, but UI search still builds an index from runtime packs and assigns `DEFAULT_STYLE_PRESET_SUPPORTED_TASKS`. That can make task filters drift from the manifest-authored truth.

**Solution**

Deepen a Style Search Projection Module that is manifest-derived while preserving Demand-Mounted Surface behavior and chunk budgets. Search can load a compact manifest projection instead of reconstructing task semantics from runtime visual packs.

**Benefits**

- locality: Style Preset Manifest edits update search truth through one projection.
- leverage: UI search, CLI search, task filters, and authoring validation share the same facts.
- tests: a fixture around a sprite-capable preset can prove task filters reflect manifest data.

**Before / After**

- Before: visual runtime packs are reused for search and fill missing task facts with defaults.
- After: search uses a manifest-derived projection and stays demand-mounted.

**Dependencies / sequencing**

- Can run independently of provider/backend work.
- Must preserve `ui:source:verify`, `ui:chunks:verify`, and style browser gates.

**Documentation follow-ups**

- Update `docs/STYLE_PRESET_AUTHORING.md`.
- Update `SKILLS.md` Style Preset workflow if a generated search projection becomes required.

### 9. Unify Recipe Module discovery and search through a Recipe Discovery Projection

**Recommendation strength**: Worth exploring

**Files**

- `lib/recipeCatalog.ts`
- `components/RecipesView.tsx`
- `scripts/query-recipe-modules.ts`
- `lib/recipeAliases.ts`
- `lib/recipeModules.ts`

**Problem**

The UI uses `RECIPE_DISCOVERY_CATALOG`, while CLI/agent search uses `RECIPE_CATALOG`. Character Lab aliases are visible as recipe discovery cards but not searchable through the same Interface. Discovery and search are close but not the same Module.

**Solution**

Deepen a Recipe Discovery Projection Module with adapters for UI cards, CLI search, and agent queries. Keep aliases as discovery entries, not new Recipe Modules.

**Benefits**

- locality: alias/search/display behavior changes in one Module.
- leverage: UI, CLI, and agents query the same recipe discovery model.
- tests: alias search, task filters, provider filters, and JSON output can use one projection fixture.

**Before / After**

- Before: UI discovery includes aliases; CLI search does not.
- After: one Recipe Discovery Projection has explicit alias semantics for both.

**Dependencies / sequencing**

- Do after higher-risk runtime seams unless recipe search is active work.
- Preserve the rule that Recipe Modules produce Generation Task Specs; aliases should not become task-spec builders.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` Recipe Module Catalog section.
- Update `SKILLS.md` recipe inspection commands if accepted.

### 10. Route larger External Output Source imports through an Import Operation seam

**Recommendation strength**: Worth exploring

**Files**

- `apps/local-server/src/outputSources.ts`
- `apps/local-server/src/outputSourceRoutes.ts`
- `hooks/useStudioSettings.ts`
- `components/StudioSettingsModal.tsx`
- `packages/shared/src/types.ts`

**Problem**

External Output Source import currently copies selected files and creates Catalog Entries inside one request loop. That is fine for small imports, but shallow for larger imports because progress, skipped reasons, and partial results only appear at the end.

**Solution**

Keep small imports synchronous, but add an Import Operation Module for larger batches. The operation owns progress events, skipped-file reasons, final summaries, and path-safety checks while preserving ADR-0026 registration-before-import.

**Benefits**

- locality: copy, thumbnail, catalog registration, progress, and skipped-file reporting stay in one Module.
- leverage: Settings can show progress without learning filesystem or thumbnail implementation detail.
- tests: path escape, duplicate name handling, skipped file reporting, and final summaries can be tested at one seam.

**Before / After**

- Before: Settings waits for a single request result.
- After: Settings starts an Import Operation and observes progress plus a final summary for large batches.

**Dependencies / sequencing**

- Do after recommendation 5, so event scoping exists.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` External Output Source flow.
- Update `SKILLS.md` output-folder workflow if accepted.

### 11. Seal Legacy Visual Batch snapshots as a DTO

**Recommendation strength**: Worth exploring

**Files**

- `lib/studioLegacyVisualBatchTypes.ts`
- `lib/studioLegacyVisualSnapshotExport.ts`
- `lib/studioLegacyVisualSnapshotImport.ts`
- `lib/studioStorageRecovery.ts`
- `scripts/catalog-first-source-audit.ts`
- `types.ts`

**Problem**

The compatibility seam is named legacy, but `LegacyVisualBatch` is still an alias of live `GenerationBatch`. A future live type change can silently widen the legacy compatibility surface.

**Solution**

Define a sealed Legacy Visual Batch snapshot DTO in the legacy Module and make import/export Adapters translate explicitly. Keep product decisions Catalog Entry first.

**Benefits**

- locality: compatibility fields stop tracking live product type drift.
- leverage: catalog-first source audits can enforce a smaller compatibility seam.
- tests: snapshot export/import fixtures prove compatibility without importing broad live behavior.

**Before / After**

- Before: legacy snapshot type equals the live Visual Batch type.
- After: legacy snapshot type is explicit and owned by compatibility Modules.

**Dependencies / sequencing**

- Do after recommendation 5 or as release hardening when catalog compatibility files are already open.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` Visual Batch compatibility note.
- Update ADR-0013 progress if accepted.

### 12. Add a Storage Repair Plan Module after Reference Store decision

**Recommendation strength**: Speculative

**Files**

- `apps/local-server/src/storageMaintenance.ts`
- `apps/local-server/src/referenceManager.ts`
- `scripts/studio-storage-maintenance.ts`
- `docs/TECHNICAL_DEBT.md`

**Problem**

Storage Maintenance reports reference dedupe and missing thumbnail facts, but repair decisions remain manual. Without a repair-plan Module, future cleanup logic will spread across scripts, maintenance routes, reference persistence, and catalog cleanup.

**Solution**

After the content-addressed Reference Store decision, deepen Storage Maintenance with a Storage Repair Plan Module. It should produce dry-run plan items for reference migration, orphan Catalog Entry cleanup, and thumbnail repair, with guarded write Adapters.

**Benefits**

- locality: storage repair decisions live beside storage audits.
- leverage: Settings Maintenance, automation scripts, and release checks consume the same dry-run plan.
- tests: plan fixtures can prove no prompt, transcript, Provider Secret, or inline image data is printed.

**Before / After**

- Before: audits report counts and agents decide repairs manually.
- After: audits can produce typed repair plans with guarded write paths.

**Dependencies / sequencing**

- Depends on a Reference Store decision; do not promote before that.

**Documentation follow-ups**

- Update `docs/TECHNICAL_DEBT.md` storage maintenance section.
- Add an ADR only when storage layout is chosen.

## Suggested execution order

1. Provider Settings live reads - small and makes provider evidence trustworthy.
2. Provider Registry Module - consolidates repeated provider facts before more provider work.
3. Persistent Job Intake - shrinks the route Adapter and closes new-job `codex_imagegen` policy.
4. Shell Activity Job Module - protects summary-first hot reads before sync owns job waiting.
5. Local Studio Sync invalidation plus Catalog Operation Result - turns existing backend summaries/events into frontend leverage.
6. Settings Surface Module - reduces Shell/overlay churn after sync and catalog inputs are clearer.
7. Command Center Projection Module - product-visible, best after provider/status facts are reliable.
8. Style Search Projection - independent style slice; keep demand-mounted and chunk budgets intact.
9. Recipe Discovery Projection - useful once recipe discovery/search work resumes.
10. Import Operation - depends on scoped events; promote only when large imports matter.
11. Legacy Visual Batch DTO - release hardening after catalog compatibility files are open.
12. Storage Repair Plan - defer until Reference Store layout is decided.

## Documentation fan-out if accepted

- `CONTEXT.md`: add only accepted named Modules: `Provider Registry`, `Persistent Job Intake`, `Shell Activity Job`, `Catalog Operation Result`, `Style Search Projection`, `Recipe Discovery Projection`, `Import Operation`, `Storage Repair Plan`.
- `docs/adr/0032-provider-registry-and-persistent-job-intake.md`: records Provider Registry ownership and new-job intake compatibility policy.
- `docs/adr/`: add a later ADR only if the Reference Store / Storage Repair layout decision becomes hard to reverse.
- `docs/architecture/DEEPENING-ROADMAP.md`: accepted batch section tracks the twelve recommendations and exit criteria while existing provider, sync, settings, styles, catalog-first, and storage rows stay as historical context.
- `docs/active/runtime-storage-ux-plan-2026-06-21.md`: update Local Studio Sync and Catalog Operation Result status if accepted.
- `docs/TECHNICAL_DEBT.md`: update active queue after implementation starts.
- `SKILLS.md`: update provider, recipe, style, storage, and output-source workflows only after corresponding Modules land.

## Implementation ledger

- Recommendations 1-3 landed behind live Provider Settings reads, `Provider Registry`, and `Persistent Job Intake`.
- Recommendations 4-7 landed behind `Shell Activity Job`, scoped `Catalog Operation Result`, `Settings Surface`, and `Command Center Projection`.
- Recommendations 8-12 landed behind `Style Search Projection`, `Recipe Discovery Projection`, `Import Operation`, explicit `Legacy Visual Batch` DTOs, and dry-run `Storage Repair Plan`.
- Final verification complete: focused interface tests passed (18 files / 48 tests), `bun run check` passed, `bun run test` passed (158 files / 544 tests), `bun run build` passed, and Playwright visual smoke passed with `provider-sync-ops-visual-clean-ok`.
- Visual evidence: `output/playwright/provider-sync-ops-home.png`, `output/playwright/provider-sync-ops-settings-provider.png`, `output/playwright/provider-sync-ops-recipes.png`, `output/playwright/provider-sync-ops-mobile-commands.png`, and `output/playwright/provider-sync-ops-mobile-settings.png`.
