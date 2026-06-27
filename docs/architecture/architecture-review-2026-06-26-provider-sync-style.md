# Architecture review - Codex Studio provider, sync, and style seams

Date: 2026-06-26

## Summary

- Current architecture docs already cover the broad direction: Codex-first, local-first, Catalog Entry as durable truth, summary-first hot reads, Provider Boundary, Demand-Mounted Surfaces, and granular Style Preset Manifests.
- This review does not reopen completed lazy-loading, AppContent extraction, or Catalog Page summary-read work.
- The remaining friction is concentrated in Modules where the Interface is still shaped like the implementation: provider registration is spread across several files, Local Studio Sync still uses broad refresh as its main lever, Settings and Shell still repack large surfaces, and Style search can drift from manifest truth.
- Three subagent passes agreed that the next useful work is not a new architecture lane. It is a sharper execution batch over existing seams, plus two concrete drift fixes: live Provider Settings reads and manifest-accurate Style search.

## Subagent agreement

- Dewey, frontend shell/UX: protect summary-first job reads, deepen Local Studio Sync, move Settings hydration into its own Demand-Mounted Surface Module, then reduce remaining high-churn Shell inputs.
- Mill, backend/runtime: fix stale provider settings first, then consolidate provider definitions, extract Persistent Job Intake, and continue ADR-0014 dependency seams.
- Aristotle, catalog/styles/storage: pass Catalog command summaries and typed events through the frontend seam, restore manifest task semantics in Style search, and delay async External Output Source imports until catalog event scoping exists.

## Recommendations

### 1. Make Provider Settings reads live at the Provider Boundary

**Recommendation strength**: Strong

**Files**

- `apps/local-server/src/providerRoutes.ts`
- `apps/local-server/src/appFactory.ts`
- `apps/local-server/src/settingsRoutes.ts`
- `apps/local-server/src/providerCapabilities.ts`

**Problem**

`createProviderRoutes()` names its dependency `readSettings`, but the Interface receives a one-time settings object. `appFactory.ts` passes `readEditableStudioSettings(settingsStorage)` during app construction, so `/api/providers` can keep reporting an old default provider after Studio Settings are patched.

> Contradicts ADR-0023 in implementation: Studio Settings are editable app preferences, but this Provider Boundary read can be stale.

Deletion test: deleting `providerRoutes.ts` would move the stale snapshot problem into `appFactory.ts` callers. The Module is not deep enough because freshness is not local to the route seam.

**Solution**

Deepen the Provider Boundary read Module so each request crosses a live settings read at the seam. Keep the HTTP Adapter thin, but make provider capability and preflight reads consume current settings/runtime facts instead of construction-time snapshots.

**Benefits**

- locality: provider freshness bugs concentrate in one Module instead of route construction.
- leverage: Settings save, Command Center provider status, and Settings provider diagnostics all benefit from the same freshness rule.
- tests: one route-seam test can patch settings and prove `/api/providers` reflects the new value without restarting the app.

**Before / After**

- Before: app construction reads Studio Settings once, and provider routes reuse that object.
- After: provider routes ask the Provider Boundary read Module for current Studio Settings on every request.

**Dependencies / sequencing**

- Do this first. It is small, user-visible, and reduces false evidence for later Provider Boundary work.
- Unblocks a cleaner Provider Registry Module because consumers can trust provider status snapshots.

**Documentation follow-ups**

- Update `docs/TECHNICAL_DEBT.md` recent backend dependency-injection progress after the fix lands.
- Link the fix from `docs/architecture/DEEPENING-ROADMAP.md` under backend route composition.

### 2. Consolidate provider definitions into one Provider Registry Module

**Recommendation strength**: Strong

**Files**

- `apps/local-server/src/providerCapabilities.ts`
- `apps/local-server/src/providers/runtimeConfig.ts`
- `apps/local-server/src/providers/providerInputCompiler.ts`
- `apps/local-server/src/providers/externalProviderExecutors.ts`
- `apps/local-server/src/providers/externalProvider.ts`
- `apps/local-server/src/workerRouting.ts`
- `packages/shared/src/providerCapabilities.ts`
- `packages/shared/src/generationContracts.ts`

**Problem**

Provider identity is duplicated across capability reports, runtime preflight, compiler lookup, executor lookup, and worker routing. Adding or changing one Generation Provider requires knowing several lists and their hidden invariants. The Interface is shallow: it exposes almost as much provider wiring knowledge as the implementation.

Deletion test: deleting any one provider list does not remove provider complexity; it makes the same provider facts reappear in the other lists.

**Solution**

Deepen a backend Provider Registry Module that owns provider definitions once and publishes projections for capability reads, runtime preflight, compiler lookup, executor Adapter lookup, and worker target routing. The Provider Boundary remains Codex-first; this only improves Locality for optional providers.

**Benefits**

- locality: provider ids, runtime requirements, compiler presence, executor presence, and routing policy change in one Module.
- leverage: route handlers, worker routing, provider audits, and tests cross the same provider definition seam.
- tests: one provider-registry fixture can prove capability, preflight, compiler, and executor projections stay consistent.

**Before / After**

- Before: `google`, `fal`, and `comfy` appear in runtime config, compiler registry, executor registry, and worker routing independently.
- After: one Provider Registry Module is the source for those projections.

**Dependencies / sequencing**

- Depends on recommendation 1 so provider reads are fresh before the registry is deepened.
- Do before adding more providers or enabling planned providers.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` Provider Boundary seam list.
- Update `SKILLS.md` provider workflow so agents edit the registry first.
- Consider a new ADR only if the registry changes how provider executability is decided.

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

`jobRoutes.ts` is an HTTP Adapter, but it also owns provider selection, reference persistence, source-spec mutation, validation, persistence, event publishing, and enqueue. Its Interface requires route tests to stub the whole job intake sequence.

The same route still accepts `codex_imagegen` for new POST requests even though `GenerationTaskKind` is provider-independent and excludes it. Worker compatibility for old rows is valid; new job intake still leaking provider-specific task vocabulary is the friction.

> Contradicts ADR-0019 for new jobs: Generation Task and Generation Provider are separate concepts, but `codex_imagegen` is still accepted at the creation seam.

**Solution**

Deepen a Persistent Job Intake Module behind the route. The route stays the HTTP Adapter. Job intake owns validation, reference hydration, provider blocker checks, job creation, event publication, and enqueue. Keep legacy `codex_imagegen` read/worker compatibility, but migrate or reject it at new job intake.

**Benefits**

- locality: job intake invariants live in one Module instead of an HTTP route.
- leverage: browser generation, retry, recipe runs, and tests all cross one intake seam.
- tests: the interface is the test surface; focused intake tests can simulate provider blockers, reference failures, and invalid task specs without Hono request setup.

**Before / After**

- Before: HTTP parsing and job intake implementation are interleaved in `jobRoutes.ts`.
- After: the route decodes input and hands it to Persistent Job Intake; intake returns either a queued Persistent Job or a normalized validation error.

**Dependencies / sequencing**

- Do after recommendation 1 and before broad WorkerController changes.
- Pair the `codex_imagegen` decision with intake extraction so compatibility policy is explicit.

**Documentation follow-ups**

- Add `Persistent Job Intake` to `CONTEXT.md` if accepted.
- Update `docs/ARCHITECTURE.md` job flow.
- Update `docs/TECHNICAL_DEBT.md` backend dependency-injection section.
- Add ADR follow-up only if the compatibility policy for new `codex_imagegen` requests is surprising.

### 4. Protect summary-first job reads with a shell-facing activity-job Module

**Recommendation strength**: Strong

**Files**

- `services/localStudioService.ts`
- `hooks/useLocalStudioSync.ts`
- `hooks/localStudioSyncProjection.ts`
- `lib/buildStudioPageController.ts`
- `components/studio/StudioOperationsRail.tsx`
- `packages/shared/src/types.ts`

**Problem**

`listStudioJobs()` returns `JobSummary[]`, but the frontend activity path still names and types `studioJobs` like full `Job[]`. `buildStudioGenerationPlaceholders()` reads `job.sourceSpec?.metadata` and `job.sourceSpec?.output`, which belong to detail-shaped jobs, not summary-first hot reads.

Deletion test: deleting the current projection would push job-summary/detail reconciliation into page and rail callers. The Module should earn its keep by hiding that distinction.

**Solution**

Deepen a shell-facing activity-job Module that normalizes backend Job Summaries, SSE job payloads, and linked Browser Queue jobs into a compact presentation model. Page, operations, and debug surfaces consume that model instead of detail-shaped jobs.

**Benefits**

- locality: summary/detail compatibility stays in one Module.
- leverage: Shell, Operations Rail, Debug Panel, and generation placeholders get the same activity model.
- tests: fixtures can prove placeholders do not require `sourceSpec` on hot-list jobs.

**Before / After**

- Before: summary-first backend reads still reach frontend Modules through a full-Job-shaped Interface.
- After: the Shell crosses a compact activity-job Interface aligned with ADR-0031.

**Dependencies / sequencing**

- Do before deeper Local Studio Sync event ownership.
- Unblocks reliable scoped invalidation because event payloads no longer need to masquerade as full jobs.

**Documentation follow-ups**

- Update `docs/architecture/DEEPENING-ROADMAP.md` Local Studio Sync partial item.
- Update `docs/TECHNICAL_DEBT.md` summary-first hot reads note.

### 5. Deepen Local Studio Sync and Catalog Command events together

**Recommendation strength**: Strong

**Files**

- `hooks/useLocalStudioSync.ts`
- `hooks/localStudioSyncRefreshPolicy.ts`
- `services/studioEventSource.ts`
- `hooks/useCatalog.ts`
- `apps/local-server/src/catalogCommands.ts`
- `apps/local-server/src/catalogRoutes.ts`
- `packages/shared/src/types.ts`

**Problem**

Local Studio Sync still exposes broad `refreshBackendState()` and treats asset/catalog events as triggers for the same full catch-up. Catalog command results already contain matched/changed/failed counts, but `useCatalog()` treats mutations as fire-and-refresh and hides partial outcomes. `restoreCatalogBatch()` still iterates loaded trash-page entries instead of crossing the full-scope filter command seam.

Deletion test: deleting `localStudioSyncRefreshPolicy.ts` would leave broad refresh calls scattered again. The current Module is useful, but still shallow because it does not own scoped invalidation or bounded job waiting.

**Solution**

Deepen Local Studio Sync into the runtime event Seam and deepen Catalog Command results into a frontend-visible Interface. Pass typed catalog events with event kind/scope through the event Adapter. Let catalog mutations surface command summaries and partial failures. Add bounded job waiting to Local Studio Sync so generation runs do not own a parallel job watcher.

**Benefits**

- locality: event handling, catch-up policy, catalog invalidation, and job waiting concentrate in one runtime sync Module.
- leverage: catalog grid, trash, workspace commands, queue previews, and generation waits share the same event truth.
- tests: bursty catalog events, connection recovery, partial Catalog command failures, and job terminal waits can be tested at the sync seam.

**Before / After**

- Before: asset and catalog events both call broad refresh; command summaries stop at the backend.
- After: typed events and command summaries cross the seam and drive scoped refresh or UI feedback.

**Dependencies / sequencing**

- Depends on recommendation 4.
- Do before trash/workspace UX polish, async External Output Source import, or readiness freshness consolidation.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` Local Studio Sync seam.
- Update `docs/architecture/DEEPENING-ROADMAP.md` accepted 2026-06-21 partial item.
- Update `docs/TECHNICAL_DEBT.md` catalog-first and runtime-storage progress.

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

The flat Settings compatibility Interface is gone, but the Shell still repacks settings, provider, output-source, and maintenance domains into overlay props. Full Settings refresh fetches editable settings, External Output Sources, provider capabilities, and provider runtime preflight together. That gives domain names without full Depth.

Deletion test: deleting `useStudioSettings.ts` would scatter fetch/loading/error/toast logic across Shell and Settings Modal. The Module is earning its place, but it should hide more of the implementation.

**Solution**

Deepen a Settings Surface Module that owns open-time hydration, per-domain loading/error state, and demand-mounted refresh rules. Keep only compact Settings/Provider summary data at the Command Center seam; let the Settings surface own heavy domains while mounted.

**Benefits**

- locality: Settings, provider diagnostics, External Output Source, and maintenance fetch policy each stay with the surface that uses them.
- leverage: Shell and Overlay controller stop repacking low-level fields.
- tests: surface tests can verify opening Settings hydrates heavy domains without requiring a full Studio Shell harness.

**Before / After**

- Before: Shell creates a wide overlay settings payload and tracks when to refresh settings.
- After: Shell opens a Settings Surface; the surface owns demand-mounted data hydration.

**Dependencies / sequencing**

- Can run after recommendation 5, or in parallel if scoped strictly to Settings surface loading.
- Avoid widening `useStudioShell.ts` while doing this work.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` Demand-Mounted Surface list.
- Update `docs/architecture/DEEPENING-ROADMAP.md` Studio Shell/Settings items.

### 7. Build Style Search Projection from manifest truth

**Recommendation strength**: Strong

**Files**

- `components/recipes/stylePresetManifests.ts`
- `components/recipes/stylePresetCatalogSearchData.ts`
- `components/recipes/StylePresetCatalogSearchSurface.tsx`
- `components/recipes/styles/runtimeTypes.ts`
- `components/recipes/styles/styleRuntimeData.generated.ts`
- `components/recipes/styles/manifests/presets/pack_06/SP06-119.yaml`

**Problem**

Style Preset Manifests carry task semantics such as `sprite_sheet`, but `StyleRuntimePreset` omits `supportedTasks`. Runtime search then assigns `DEFAULT_STYLE_PRESET_SUPPORTED_TASKS`, so task filters can drift from manifest truth. `SP06-119` is a concrete example: the manifest includes `sprite_sheet`, but the runtime search path does not read that field from the manifest.

> Implementation drift against ADR-0025: granular Style Preset Manifests are supposed to preserve preset identity and editing Locality, but runtime search rebuilds part of that identity from defaults.

**Solution**

Deepen a Style Search Projection Module that is manifest-derived. Either carry `supportedTasks`, tags, and category id into runtime data, or load the search projection from manifests while keeping the visual runtime pack lightweight.

**Benefits**

- locality: style search truth follows Style Preset Manifest edits.
- leverage: search, task filters, catalog lookup, and authoring validation cross the same projection.
- tests: one fixture around a sprite preset such as `SP06-119` can prove task filters reflect manifest data.

**Before / After**

- Before: runtime search composes task semantics from defaults.
- After: runtime search uses manifest-authored task semantics.

**Dependencies / sequencing**

- Do before more direct style preset authoring or task-specific style UX.
- Keep chunk budgets intact; this is a projection deepening, not a reason to eager-load all YAML into the visual Styles Recipe.

**Documentation follow-ups**

- Update `SKILLS.md` Style Preset workflow if the projection becomes a required generated artifact.
- Update `docs/STYLE_PRESET_AUTHORING.md` with the search-projection validation step.
- Update `docs/architecture/DEEPENING-ROADMAP.md` Style Preset Manifest follow-up.

### 8. Add a Storage Repair Plan Module after the Reference Store decision

**Recommendation strength**: Strong

**Files**

- `apps/local-server/src/storageMaintenance.ts`
- `apps/local-server/src/referenceManager.ts`
- `scripts/studio-storage-maintenance.ts`
- `docs/architecture/architecture-review-2026-06-21-second-pass-runtime-ux.md`
- `docs/TECHNICAL_DEBT.md`

**Problem**

Storage Maintenance reports reference dedupe counts and missing thumbnail source-file counts, but it does not produce typed repair plans. Without a repair-plan Module, future cleanup pressure will spread across scripts, storage maintenance, reference persistence, and catalog cleanup.

Deletion test: deleting aggregate counters would not remove cleanup complexity; it would make agents rediscover it by scanning files manually.

**Solution**

After the content-addressed Reference Store decision is accepted, deepen Storage Maintenance with a Storage Repair Plan Module. It should create dry-run plan items for reference migration, orphan Catalog Entry cleanup, and thumbnail backfill, with guarded write Adapters like existing compaction/backfill commands.

**Benefits**

- locality: storage repair decisions live beside storage audits instead of across ad hoc scripts.
- leverage: Studio Settings Maintenance, automation scripts, and release checks can consume the same dry-run plan.
- tests: plan fixtures can prove no prompt, transcript, secret, or inline image data is printed.

**Before / After**

- Before: audit reports counts; agents decide repairs manually.
- After: audit can produce typed repair plans with guarded write paths.

**Dependencies / sequencing**

- Depends on the content-addressed Reference Store recommendation from the 2026-06-21 second-pass review.
- Do orphan Catalog Entry cleanup after Reference Store planning, not before.

**Documentation follow-ups**

- Update `docs/TECHNICAL_DEBT.md` storage maintenance section.
- Consider an ADR only when the Reference Store storage layout is chosen.
- Update `SKILLS.md` storage maintenance workflow after write Adapters exist.

### 9. Route larger External Output Source imports through an Import Operation seam

**Recommendation strength**: Worth exploring

**Files**

- `apps/local-server/src/outputSources.ts`
- `apps/local-server/src/outputSourceRoutes.ts`
- `hooks/useStudioSettings.ts`
- `components/StudioSettingsModal.tsx`
- `packages/shared/src/types.ts`

**Problem**

External Output Source import copies files, creates thumbnails, and registers Catalog Entries inside one request loop. The UI has a per-source boolean and a final toast, but no progress or partial result stream. That is acceptable for small imports and shallow for larger imports.

**Solution**

Keep small imports synchronous, but add an Import Operation seam for larger batches. The backend operation Adapter reports imported/skipped counts incrementally through the same event stream discipline used by catalog/job activity.

**Benefits**

- locality: copy, thumbnail, catalog registration, progress, and skipped-file reporting stay in one import Module.
- leverage: Settings can show progress without learning filesystem or thumbnail details.
- tests: operation fixtures can prove path safety and partial import reporting without large real folders.

**Before / After**

- Before: Settings waits for a request loop and receives final counts.
- After: Settings can start an import operation and observe progress events for larger batches.

**Dependencies / sequencing**

- Do after recommendation 5. It needs typed event handling and catalog invalidation first.
- Keep ADR-0026 intact: registration is required before import, and import still copies into the Studio Library before catalog operations.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` External Output Source flow if promoted.
- Update `SKILLS.md` output-folder workflow.

### 10. Seal Legacy Visual Batch snapshots as a DTO

**Recommendation strength**: Worth exploring

**Files**

- `lib/studioLegacyVisualBatchTypes.ts`
- `lib/studioLegacyVisualSnapshotExport.ts`
- `contexts/LegacyVisualBatchContext.tsx`
- `scripts/catalog-first-source-audit.ts`
- `types.ts`

**Problem**

The compatibility Interface is named legacy, but `LegacyVisualBatch` is still an alias of live `GenerationBatch`. Any future `GenerationBatch` change can silently widen the legacy compatibility surface.

Deletion test: deleting the alias would expose exactly which export/import fields are really needed. That is the sign the compatibility Module should own a sealed snapshot shape.

**Solution**

Define a sealed Legacy Visual Batch snapshot DTO in the legacy Module and make export/import Adapters translate explicitly. Keep runtime product decisions Catalog Entry first.

**Benefits**

- locality: legacy compatibility fields stop tracking live product type drift.
- leverage: source audits can enforce a smaller compatibility seam.
- tests: snapshot export/import fixtures can prove compatibility without importing broader `GenerationBatch` behavior.

**Before / After**

- Before: legacy snapshot type equals the live visual batch type.
- After: legacy snapshot type is an explicit DTO owned by the compatibility Module.

**Dependencies / sequencing**

- Do after recommendation 5 or as release hardening if Catalog work is already open.
- Keep low risk by changing only compatibility Adapters first.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` Visual Batch compatibility note.
- Update ADR-0013 progress if the compatibility seam shrinks.

## Batch documentation fan-out if accepted

- `CONTEXT.md`: add accepted terms only if they become named Modules: `Provider Registry`, `Persistent Job Intake`, `Style Search Projection`, `Storage Repair Plan`, `Import Operation`.
- `docs/adr/`: only add or update ADRs for hard-to-reverse decisions: Provider Registry ownership, `codex_imagegen` intake policy, Reference Store layout.
- `docs/architecture/DEEPENING-ROADMAP.md`: fold these recommendations into existing provider, sync, catalog, settings, style, and storage rows instead of creating a parallel tracker.
- `docs/TECHNICAL_DEBT.md`: update active queue after implementation starts, not before.
- `SKILLS.md`: update provider, style, storage, and output-source workflows after accepted changes land.

## Suggested execution order

1. Make Provider Settings reads live at the Provider Boundary. Small, direct, and fixes stale user-visible state.
2. Consolidate provider definitions into one Provider Registry Module. Do this while provider state is fresh and before adding more adapters.
3. Extract Persistent Job Intake and close new `codex_imagegen` intake drift. This reduces route depth problems before WorkerController work.
4. Protect summary-first job reads with a shell-facing activity-job Module. This keeps ADR-0031 honest in the frontend.
5. Deepen Local Studio Sync and Catalog Command events together. This unlocks scoped invalidation, bounded job waiting, and better trash/workspace feedback.
6. Move Settings hydration into a Settings Surface Module. This shrinks Shell/overlay churn once sync inputs are clearer.
7. Build Style Search Projection from manifest truth. This can proceed independently if the style working tree is quiet.
8. Add a Storage Repair Plan Module after the Reference Store decision. Storage repairs need the storage layout decision first.
9. Route larger External Output Source imports through an Import Operation seam. Promote only if larger imports are a real workflow; it depends on typed events.
10. Seal Legacy Visual Batch snapshots as a DTO. Good release hardening after catalog event work or when touching compatibility exports.
