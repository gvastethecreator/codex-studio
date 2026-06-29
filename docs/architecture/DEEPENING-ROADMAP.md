# Hoja de ruta de deepening arquitectónico

Esta hoja de ruta sigue refactors que convierten módulos superficiales en módulos más profundos, con mejor locality, leverage y testabilidad. Las decisiones relacionadas viven en `docs/adr/`.

Current findings index: `docs/architecture/architecture-review-2026-06-21-runtime-storage-ux.md`.
Additional second-pass findings: `docs/architecture/architecture-review-2026-06-21-second-pass-runtime-ux.md`.
Provider/sync/operations follow-up findings: `docs/architecture/architecture-review-2026-06-28-provider-sync-operations-followup.md`.
Improve/debt audit findings: `docs/architecture/architecture-review-2026-06-28-improve-debt-audit.md`.
Performance/fluidity findings: `docs/architecture/architecture-review-2026-06-29-performance-fluidity.md`.

## Conceptos

- **Depth:** a small interface that hides significant useful behavior.
- **Locality:** related behavior changes in one place instead of many callers.
- **Deletion test:** if deleting a module makes complexity disappear, it was likely a pass-through. If complexity reappears across many callers, the module was earning its keep.

## Lote de revisión aceptado - 2026-05-29

The current accepted batch comes from `docs/architecture/architecture-review-2026-05-29.md`.

Execution order for the accepted batch:

1. Deepen the `Studio Shell` orchestration module.
2. Deepen the `Studio Generation Session` module.
3. Separate `Studio Settings` seams by operational domain.
4. Deepen `appFactory` runtime composition (finish stream + library route extraction).
5. Deepen `Local Studio Sync` refresh policy semantics.
6. Review naming and seam clarity in `Local Generation Run` provider-neutral flow.

## Lote de revisión aceptado - 2026-05-31

The latest accepted batch comes from `docs/architecture/architecture-review-2026-05-31.md`.

Execution order for this batch:

1. Deepen `Studio Shell` composition policy.
2. Deepen `Workspace lifecycle` invariants.
3. Remove dual `Studio Settings` interface (domain + flat compatibility).
4. Deepen `Command Center` projection policy.
5. Add direct test surface for `createStudioApp` composition seam.
6. Deepen `Local Studio Sync` refresh policy semantics.

## Accepted review batch - 2026-06-19

The current front-performance batch comes from `docs/architecture/architecture-review-2026-06-19-front-performance.md`.

Execution order for this batch:

1. Fix Browser Queue terminal outcome ownership. Done.
2. Deepen Catalog Page / Gallery pagination. Partial: page state and load-more reached the grid; backend full-scope bulk commands remain.
3. Give Local Studio Sync one runtime event ownership seam. Partial: browser SSE streams are shared with ref-counted leases; job waiting still needs the full sync seam.
4. Align Demand-Mounted Surface behavior with data loading and errors. Partial: lazy surfaces now show loading/error states, and Settings heavy reads run on open.
5. Make Command Center commands capability-aware and responsive. Partial: compact runtime/queue/settings commands remain reachable below `xl`, and dashboard no-op commands were removed.
6. Reduce Studio Shell high-churn surfaces. Partial: settings domains are memoized and dead operations-rail props were removed.
7. Split Style Browser session from style application behavior. Pending, blocked for now by active style worktree churn.
8. Put Composer and Browser Queue persistence on a payload budget. Partial: inline recovery budget implemented; Local Asset refs remain future work.
9. Consolidate Studio Readiness and Codex model freshness. Partial: Codex model catalog fetch is now owned by generation config and passed into Toolbar.
10. Close source-audit temp-file hygiene. Done.

## Accepted review batch - 2026-06-21

This runtime-storage-UX batch refines the 2026-06-19 front-performance work. It is anchored by `docs/architecture/architecture-review-2026-06-21-runtime-storage-ux.md`, `docs/active/runtime-storage-ux-plan-2026-06-21.md`, and ADR-0031.

Execution order for this batch:

1. Add summary-first hot reads for jobs and Catalog Pages. Done for `/api/jobs` and `/api/catalog` default reads.
2. Add cheap hot-plan indexes for jobs, job events, and Codex turns. Done.
3. Add `storage:audit` and guarded `storage:compact` maintenance commands. Done for read-only audit and dry-run/write-with-confirm compaction.
4. Add conservative log rotation and SQL log retention. Done.
5. Move backend Catalog commands to full-scope filter operations with count summaries. Done for archive/restore/purge by filter; remaining UX copy can surface partial failures more clearly.
6. Give Local Studio Sync ownership of typed catalog events, scoped invalidation, and bounded job waiting. Partial: stream and sync now consume discriminated `catalog.created` / `catalog.updated` / `catalog.deleted`; bounded job waiting and scoped insertion remain.
7. Add provider-neutral Job Trace Summary before transcript retention. Partial: Job Detail exposes `traceSummary`; dedicated persisted retention rows remain deferred until transcript retention starts.
8. Revisit Style Browser session split and Studio Readiness freshness only after storage/sync measurements settle.

## Additional candidate review - 2026-06-21

The second-pass audit is anchored by `docs/architecture/architecture-review-2026-06-21-second-pass-runtime-ux.md`.

Suggested follow-up order:

1. Add tooling-log retention for `logs/tooling`. Done.
2. Add reference dedupe audit coverage and design a content-addressed Reference Store. Audit coverage done; store design remains.
3. Backfill missing historical thumbnails in bounded batches. First write batch warmed 137 recoverable rows; 784 remaining rows point at missing source files and need orphan-metadata cleanup, not thumbnail generation.
4. Measure Studio Readiness request overlap before consolidating freshness.
5. Add catalog search timing before deciding on FTS.
6. Consider async External Output Source imports only if large imports block Settings in real use.

## Accepted review batch - 2026-06-28

The provider/sync/operations follow-up batch comes from `docs/architecture/architecture-review-2026-06-28-provider-sync-operations-followup.md` and ADR-0032.

Execution order for this batch:

1. Make Provider Settings reads live at the Provider Boundary.
2. Consolidate provider facts into a Provider Registry Module.
3. Extract Persistent Job Intake from the job route Adapter.
4. Protect summary-first reads with a Shell Activity Job Module.
5. Deepen Local Studio Sync invalidation and Catalog Operation Result together.
6. Move Settings hydration into a Settings Surface Module.
7. Complete Command Center Projection Module.
8. Build Style Search Projection from manifest truth.
9. Unify Recipe Module discovery and search through Recipe Discovery Projection.
10. Route larger External Output Source imports through an Import Operation seam.
11. Seal Legacy Visual Batch snapshots as a DTO.
12. Add a Storage Repair Plan Module after Reference Store decision.

## Seguimiento de trabajo

### Accepted batch: improve/debt safety boundaries - 2026-06-28

- **Status:** Implemented and verified
- **Findings:** `docs/architecture/architecture-review-2026-06-28-improve-debt-audit.md`
- **ADR:** `docs/adr/0033-public-library-and-job-intake-boundaries.md`
- **Plan:** `plans/008-public-library-job-intake-reference-boundaries.md`
- **Files:** `apps/local-server/src/publicLibraryAssetPolicy.ts`, `apps/local-server/src/libraryRoutes.ts`, `apps/local-server/src/persistentJobIntake.ts`, `apps/local-server/src/referenceManager.ts`, `packages/shared/src/generationContracts.ts`.
- **Depends on:** ADR-0032.
- **Unblocks:** safer local asset serving, malformed job intake handling, and bounded reference persistence before deeper Recipe/Settings/Provider follow-ups.
- **Concrete steps:**
  - implemented: `/library/*` crosses a public asset allowlist instead of serving any Studio Library-relative path;
  - implemented: Persistent Job Intake validates malformed `sourceSpec` input before asset dereference or reference persistence;
  - implemented: reference persistence enforces count and byte budgets before creating directories or files.
- **Exit criteria:** focused boundary tests pass; `bun run test`, `bun run check`, and `bun run build` pass or blockers are recorded.
- **Exit proof:** focused boundary tests passed (`bun run test -- apps/local-server/src/publicLibraryAssetPolicy.test.ts apps/local-server/src/libraryRoutes.test.ts apps/local-server/src/referenceManager.test.ts apps/local-server/src/persistentJobIntake.test.ts apps/local-server/src/jobRoutes.test.ts packages/shared/src/generationContracts.test.ts`, 6 files / 29 tests); `bun run test` passed (159 files / 551 tests); `bun run check` passed; `bun run build` passed. No visual verification was required because this batch changed backend contracts and docs only.
- **Docs:** keep this tracker, ADR-0033, and plan 008 aligned.

### Accepted batch: performance and fluidity - 2026-06-29

- **Status:** First slice implemented; remaining candidates queued.
- **Findings:** `docs/architecture/architecture-review-2026-06-29-performance-fluidity.md`
- **ADR:** `docs/adr/0034-catalog-fluidity-budget.md`
- **Files:** `lib/catalogRenderBudget.ts`, `lib/catalogCardActionSurface.ts`, `hooks/useCatalog.ts`, `components/ImageGrid.tsx`.
- **Depends on:** ADR-0028 and ADR-0031.
- **Unblocks:** lighter Home initial render, catalog-grid DOM budgets, card command demand mounting, and future route-preload / animation-clock work.
- **Concrete steps:**
  - implemented: active Catalog Page render budget is 48 entries; workspace summary and trash keep separate budgets;
  - implemented: desktop secondary card actions mount only on hover, focus, or selection;
  - implemented: mobile keeps card actions mounted for touch access;
  - pending: Route Preload Budget, Studio Animation Clock, Style Result Index, Catalog Grid Render Plan, Runtime Event Reducer, Settings Surface Session.
- **Exit criteria:** focused budget tests pass; `bun run test`, `bun run check`, and `bun run build` pass or blockers are recorded; Playwright visual/perf smoke verifies desktop hover/focus and mobile action access.
- **Exit proof:** `bun run test -- lib/catalogRenderBudget.test.ts lib/catalogCardActionSurface.test.ts lib/studioCatalogView.test.ts hooks/useStudioGallery.test.ts scripts/catalog-first-source-audit.test.ts` passed (5 files / 11 tests); `bun run test` passed (161 files / 555 tests); `bun run check` passed; `bun run build` passed, including `ui:chunks:verify`; Playwright visual/perf smoke on `http://localhost:17225/` passed with `visual-clean-ok`, desktop 48 cards / 2007 nodes / 252 buttons, hover actions 6 -> 12 with stable card rect, mobile 48 cards with touch actions preserved. Screenshots: `output/playwright/perf-fluidity-desktop-idle.png`, `output/playwright/perf-fluidity-desktop-hover.png`, `output/playwright/perf-fluidity-mobile-grid.png`. Perf JSON: `output/perf/perf-fluidity-catalog-2026-06-29.json`.

### Accepted batch: provider sync and operations follow-up - 2026-06-28

- **Status:** Implemented and verified
- **Findings:** `docs/architecture/architecture-review-2026-06-28-provider-sync-operations-followup.md`
- **ADR:** `docs/adr/0032-provider-registry-and-persistent-job-intake.md`
- **Files:** `apps/local-server/src/providerRoutes.ts`, `apps/local-server/src/providers/*`, `apps/local-server/src/jobRoutes.ts`, `apps/local-server/src/persistentJobIntake.ts`, `hooks/useLocalStudioSync.ts`, `hooks/useCatalog.ts`, `hooks/useStudioShell.ts`, `hooks/useSettingsSurface.ts`, `lib/buildStudioHeaderToolbarProps.ts`, `lib/commandCenterProjection.ts`, `components/recipes/styleSearchProjection.ts`, `lib/recipeDiscoveryProjection.ts`, `lib/importOperation.ts`, `lib/studioLegacyVisualBatchTypes.ts`, storage maintenance modules.
- **Depends on:** ADR-0023, ADR-0024, ADR-0026, ADR-0030, ADR-0031.
- **Unblocks:** fresher provider status, route-thin job creation, summary-first shell activity reads, scoped catalog refresh, demand-mounted settings data, manifest-backed search, recipe discovery parity, and safer storage/import maintenance.
- **Concrete steps:**
  - implemented: provider capability/preflight reads use live Studio Settings per request;
  - implemented: Provider Registry now feeds capability definitions, runtime requirements, compiler availability, executor routing, and worker routing;
  - implemented: `POST /api/jobs` now crosses Persistent Job Intake, with `codex_imagegen` recorded as a compatibility alias instead of durable task truth;
  - implemented: Shell Activity Job protects summary-first hot reads for queue, operations rail, debug, and shell activity surfaces;
  - implemented: Catalog Operation Result and typed Local Studio Sync catalog events now drive scoped refresh, visible feedback, and bounded job waiting;
  - implemented: Settings Surface owns open-time heavy hydration and resolved library fallback for the Settings modal;
  - implemented: Command Center Projection combines compact mode, provider capability/preflight status, runtime readiness, and queue state for `HeaderToolbar`;
  - implemented: Style Search Projection wraps manifest/runtime search filters and pack planning for the lazy surface and scripts;
  - implemented: Recipe Discovery Projection unifies UI and script discovery while keeping aliases separate from Recipe Modules;
  - implemented: Import Operation owns External Output Source import summary, toast tone, and pending-file removal;
  - implemented: Legacy Visual Batch snapshots are explicit DTOs translated at import/export edges;
  - implemented: Storage Repair Plan derives guarded dry-run repair items from storage audit without choosing a destructive Reference Store layout.
- **Exit criteria:** all twelve recommendations are implemented or explicitly deferred for a load-bearing reason; focused tests cover each new Module interface; `bun run test`, `bun run check`, and `bun run build` pass or any blocker is reported with exact command; frontend changes have Playwright visual verification.
- **Exit proof:** focused interface tests passed (`bun run test -- apps/local-server/src/providers/providerRegistry.test.ts apps/local-server/src/providerRoutes.test.ts apps/local-server/src/persistentJobIntake.test.ts apps/local-server/src/jobRoutes.test.ts lib/shellActivityJob.test.ts hooks/localStudioSyncProjection.test.ts services/studioEventSource.test.ts lib/catalogOperationResult.test.ts hooks/useStudioPageController.test.ts hooks/useStudioOverlayController.test.ts hooks/useStudioHeaderToolbarConfig.test.ts lib/settingsSurface.test.ts lib/commandCenterProjection.test.ts components/recipes/styleSearchProjection.test.ts lib/recipeDiscoveryProjection.test.ts lib/importOperation.test.ts lib/studioLegacyVisualBatchTypes.test.ts packages/shared/src/storageMaintenance.test.ts`, 18 files / 48 tests); `bun run check` passed; `bun run test` passed (158 files / 544 tests); `bun run build` passed; Playwright smoke passed with `provider-sync-ops-visual-clean-ok` on `http://localhost:17222/` plus local server `http://127.0.0.1:17223/`, covering Command Center/home, Settings provider capabilities, Recipes, mobile commands, and mobile Settings. Screenshots: `output/playwright/provider-sync-ops-home.png`, `output/playwright/provider-sync-ops-settings-provider.png`, `output/playwright/provider-sync-ops-recipes.png`, `output/playwright/provider-sync-ops-mobile-commands.png`, `output/playwright/provider-sync-ops-mobile-settings.png`.
- **Docs:** keep this tracker, `CONTEXT.md`, `docs/ARCHITECTURE.md`, and the findings document aligned as implementation sharpens.

### 1. Deepen the `Studio Shell` orchestration module

- **Status:** In progress
- **Files:** `hooks/useStudioShell.ts`, `hooks/useCatalog.ts`, `hooks/useStudioViewState.ts`,
  `hooks/useStudioNavigation.ts`, `hooks/useStudioGenerationSession.ts`,
  `hooks/useStudioSettings.ts`, `hooks/useStudioActivitySession.ts`,
  `hooks/useQueueManager.ts`, `lib/queueStateMachine.ts`, `components/AppContent.tsx`,
  `lib/buildStudioHeaderToolbarProps.ts`, `lib/buildStudioPageController.ts`
- **Depends on:** none
- **Unblocks:** more focused shell integration tests; narrower `Command Center` and overlay seams
- **Concrete steps:**
  - done: extracted `Image Catalog` commands, queue-result derivation, trash grouping, and refresh choreography into `useStudioCatalogController()` in `hooks/useCatalog.ts`, with regression coverage for legacy `workspaceId: null` handling;
  - done: deepened `buildStudioPageController()` so the `Studio Shell` now crosses grouped `debug`, `grid`, and `operations` contexts instead of one flat interface that mirrored implementation detail;
  - done: deepened `buildStudioHeaderToolbarProps()` so the `Command Center` seam now derives runtime status, queue counts, queue toggling, and provider fallback internally instead of leaving those decisions in `useStudioShell.ts`;
  - done: deepened the viewport presentation seam so `buildStudioViewportController()` now owns `StudioViewport` / `StudioGenerationDock` projection and removes the inline `recipePagePropsRef` glue from `useStudioShell.ts`;
  - done: deepened the overlay composition seam so `buildStudioShellOverlayController()` now derives `Studio Settings` library fallback and background-toggle wiring from runtime/settings modules instead of rebuilding those details inline in `useStudioShell.ts`;
  - done: `buildStudioShellOverlayController()` now consumes grouped settings domains (`settingsDomain` / `providerDomain` / `outputSourcesDomain`) at the shell seam instead of a single flat settings payload, reducing coupling to settings implementation detail in `useStudioShell.ts`;
  - done: deepened `useStudioViewState()` so queue/editor/preview/overlay visibility now cross grouped surfaces instead of another flat list of shell-local setters, while also removing the duplicate editor-image setter from the return contract;
  - done: deepened `useStudioNavigation()` so route synchronization now crosses grouped `recipe` / `modal` / `editor` / `shell` surfaces and stops carrying unused flat props through `useStudioShell.ts`;
  - done: deepened queue execution ownership so `startQueuedJobExecution()` in `lib/queueStateMachine.ts` now owns per-job execution semantics, backend job-link capture, and terminal result mapping instead of leaving that lifecycle inline inside `useQueueManager.ts`;
  - done: deepened `useStudioGenerationSession()` so generation session state now crosses grouped `queue` / `actions` surfaces instead of flattening queue orchestration and generation actions back into one shallow session contract;
  - done: deepened `useStudioSettings()` so editable settings,
    provider capability/runtime-preflight reads, and External Output Source commands
    now cross one grouped `data` surface instead of another flat shell contract;
  - done: `useStudioSettings()` now also exposes explicit `settingsDomain`, `providerDomain`, and `outputSourcesDomain` grouped surfaces while preserving compatibility fields for incremental caller migration;
  - done: `useStudioShell.ts` now consumes `settingsDomain.settings.defaultProviderId` for `Command Center` provider fallback, proving incremental migration to the new grouped settings seam.
  - done: deepened `useStudioActivitySession()` so selected-job inspection and
    debug-panel toggling now cross grouped `selection` / `debugPanel` surfaces
    instead of leaking runtime-detail fields through `useStudioShell.ts`;
  - separate shell navigation, generation/queue, and overlay orchestration into deeper modules;
  - keep `useStudioShell()` only if it still adds leverage after the split.
- **Exit criteria:** `useStudioShell.ts` stops owning catalog mutation choreography and no longer acts as the single implementation sink for shell routing, queue, overlays, and runtime wiring.
- **Docs:** update `docs/ARCHITECTURE.md`, `docs/TECHNICAL_DEBT.md`, and the findings index.

### 2. Deepen the `Studio Generation Session` module

- **Status:** In progress
- **Files:** `hooks/useStudioGenerationSession.ts`, `hooks/useStudioGenerationActions.ts`,
  `hooks/useGenerationPipeline.ts`, `hooks/useStudioShell.ts`
- **Depends on:** recommendation 1
- **Unblocks:** one generation seam for queue/actions/lifecycle behavior
- **Concrete steps:**
  - done: extracted lifecycle policy (`executeGeneration`, `executeEdit`, `cancelPersistentJob`) into `useStudioGenerationLifecycle.ts` so session composition no longer owns cancel side effects inline;
  - done: `useStudioGenerationSession.ts` now composes queue/actions through `useStudioGenerationLifecycle()` instead of coupling directly to pipeline/cancel imports;
  - done: request shaping now lives in `lib/studioGenerationRequest.ts`, and `useStudioGenerationActions.ts` consumes that seam instead of owning payload-assembly rules inline;
  - concentrate request shaping, cancel policy, and lifecycle outcomes behind the session seam;
  - keep `useGenerationPipeline.ts` as execution adapter rather than parallel orchestration;
  - reduce hook-level spread in `useStudioShell.ts`.
- **Exit criteria:** queue + actions + lifecycle behavior can be reasoned through one session interface.
- **Docs:** update `docs/ARCHITECTURE.md`, `docs/TECHNICAL_DEBT.md`, and findings index.

### 3. Move `Recipe Module` behaviour out of the static registry

- **Status:** In progress
- **Files:** `lib/recipeModules.ts`, `lib/recipeContext.ts`, `components/recipes/recipeModuleUi.ts`, `services/localGenerationRun.ts`
- **Depends on:** recommendation 2 preferred, but not strictly required
- **Unblocks:** cleaner recipe tests, smaller `Local Generation Run` interface, less cross-file recipe churn
- **Concrete steps:**
  - done: `lib/recipeModules.ts` now owns `buildRecipeModuleContext()` and no longer depends on `lib/recipeContext.ts` for module context generation;
  - done: `lib/recipeContext.ts` now delegates context generation to `recipeModules`, reducing split-registry coupling at the seam;
  - move defaults, validation, recipe-context building, directives, and `Generation Task Spec` production closer to each `Recipe Module`;
  - keep the `Recipe Module Catalog` as the query module for UI and tooling;
  - update audits so the seam remains enforced after the move.
- **Exit criteria:** recipe-specific implementation no longer accumulates in one growing central registry plus a second recipe-context registry.
- **Docs:** update `docs/ARCHITECTURE.md`, `docs/TECHNICAL_DEBT.md`, and the findings index.

### 4. Deepen the `Local Generation Run` lifecycle seam

- **Status:** In progress
- **Files:** `services/localGenerationRun.ts`, `hooks/useGenerationPipeline.ts`, `contexts/GenerationContext.tsx`
- **Depends on:** recommendation 3
- **Unblocks:** clearer cancellation/retry semantics and more focused generation tests
- **Concrete steps:**
  - done: extracted browser/runtime helpers (`toGenerationDataUrl`, abort guards, delay-with-abort, cancellation detection) into `services/localGenerationRuntimeAdapters.ts` so `localGenerationRun.ts` keeps orchestration-local behavior;
  - done: added focused adapter coverage in `services/localGenerationRuntimeAdapters.test.ts` for abort classification and data-url passthrough behavior;
  - done: `services/localGenerationRun.ts` now exposes `runLocalGenerationWithLifecycle()` with explicit `completed` / `cancelled` / `failed` outcomes and duration;
  - done: `hooks/useGenerationPipeline.ts` now consumes lifecycle outcomes instead of duplicating cancel/error classification across generate/edit flows;
  - done: `hooks/useGenerationPipeline.ts` now centralizes cancelled/failed/error outcome policy in shared helpers (`handleNonCompletedGenerationOutcome`, `reportGenerationError`, duration formatter), reducing duplicated lifecycle implementation detail between generate and edit flows;
  - move lifecycle ownership, cancellation, terminal outcome mapping, and batch pacing behind the `Local Generation Run` seam;
  - reduce duplicated control flow in `useGenerationPipeline.ts` for generate vs edit;
  - shrink the interface that `GenerationContext` republishes.
- **Exit criteria:** generate and edit flows cross one deeper lifecycle seam instead of splitting behaviour across service, hook, and context.
- **Docs:** update `docs/ARCHITECTURE.md`, `docs/TECHNICAL_DEBT.md`, and the findings index.

### 5. Finish the `WorkerController` dependency seam promised by ADR-0014

- **Status:** In progress
- **Files:** `apps/local-server/src/worker.ts`, `apps/local-server/src/appFactory.ts`, `apps/local-server/src/workerCatalogContext.ts`, `apps/local-server/src/workerRouting.ts`
- **Depends on:** recommendation 4 preferred for lower churn
- **Unblocks:** more isolated worker tests and future runtime experiments
- **Concrete steps:**
  - done: extracted asset finalization into `apps/local-server/src/workerAssetFinalizer.ts`, so `worker.ts` no longer owns inline asset/catalog completion choreography;
  - done: added focused seam coverage in `apps/local-server/src/workerAssetFinalizer.test.ts`, validating organized-path `publicUrl` and completion event/status flow;
  - done: extracted generated-asset pathing into `apps/local-server/src/workerAssetPathing.ts` so `WorkerController` no longer owns unique target-path resolution and move choreography inline;
  - done: `finalizeJobAsset()` now persists `publicUrl` from the organized asset path (post-move) instead of the discovered pre-move path, improving asset locality/consistency;
  - done: added focused seam coverage in `apps/local-server/src/workerAssetPathing.test.ts` for mime inference, path organization, and unique target-path resolution;
  - done: `createWorkerController()` now accepts injected `readEditableStudioSettings`, `resolveJobCatalogContext`, and `resolveWorkerRuntimeTarget` collaborators instead of hard-coding those runtime decisions;
  - done: `apps/local-server/src/appFactory.ts` now composes the worker with explicit runtime collaborator wiring instead of relying on implicit defaults;
  - move settings, catalog-context, runtime-target, and asset-finalization collaborators to the explicit worker seam;
  - make `appFactory.ts` the real composition module for worker dependencies;
  - reduce hidden module imports inside `worker.ts`.
- **Exit criteria:** worker tests can cross the `WorkerController` seam without relying on ambient imports or real filesystem behaviour unless intentionally chosen.
- **Docs:** update ADR-0014 status, `docs/ARCHITECTURE.md`, `docs/TECHNICAL_DEBT.md`, and the findings index.

### 9. Deepen `appFactory` runtime route composition

- **Status:** In progress
- **Files:** `apps/local-server/src/appFactory.ts`, `apps/local-server/src/outputSourceRoutes.ts`,
  `apps/local-server/src/providerRoutes.ts`, `apps/local-server/src/settingsRoutes.ts`,
  `apps/local-server/src/codexRoutes.ts`, `apps/local-server/src/librariesRoutes.ts`,
  `apps/local-server/src/projectRoutes.ts`, `apps/local-server/src/jobRoutes.ts`,
  `apps/local-server/src/assetLogRoutes.ts`, `apps/local-server/src/runtimeRoutes.ts`,
  `apps/local-server/src/studioControlRoutes.ts`
- **Depends on:** recommendation 5 of `architecture-review-2026-05-29.md`
- **Unblocks:** narrower route seams in backend runtime composition and easier route-level tests
- **Concrete steps:**
  - done: extracted `Output Sources` route composition into `createOutputSourceRoutes()` in `apps/local-server/src/outputSourceRoutes.ts`;
  - done: `appFactory.ts` now mounts `app.route('/api/output-sources', createOutputSourceRoutes(...))` instead of inlining those handlers;
  - done: added route-seam tests in `apps/local-server/src/outputSourceRoutes.test.ts` covering register/list/import flow and event publication.
  - done: extracted provider capability/preflight route composition into `createProviderRoutes()` in `apps/local-server/src/providerRoutes.ts`;
  - done: `appFactory.ts` now mounts `app.route('/api/providers', createProviderRoutes(...))` instead of inlining provider handlers;
  - done: added route-seam tests in `apps/local-server/src/providerRoutes.test.ts` for capability and preflight responses.
  - done: extracted `settings` route composition into `createSettingsRoutes()` in `apps/local-server/src/settingsRoutes.ts`;
  - done: `appFactory.ts` now mounts `app.route('/api/settings', createSettingsRoutes(...))` instead of inlining settings handlers;
  - done: added route-seam tests in `apps/local-server/src/settingsRoutes.test.ts` for read and patch/persistence behavior.
  - done: extracted `codex` route composition (`/models`, `/session`, `/account`) into `createCodexRoutes()` in `apps/local-server/src/codexRoutes.ts`;
  - done: `appFactory.ts` now mounts `app.route('/api/codex', createCodexRoutes(...))` instead of inlining codex handlers;
  - done: added route-seam tests in `apps/local-server/src/codexRoutes.test.ts` for model/session/account delegation.
  - done: extracted `libraries` route composition into `createLibrariesRoutes()` in `apps/local-server/src/librariesRoutes.ts`;
  - done: `appFactory.ts` now mounts `app.route('/api/libraries', createLibrariesRoutes(...))` instead of inlining library handlers;
  - done: added route-seam tests in `apps/local-server/src/librariesRoutes.test.ts` for list/create/default/delete flows.
  - done: extracted `projects` route composition into `createProjectRoutes()` in `apps/local-server/src/projectRoutes.ts`;
  - done: `appFactory.ts` now mounts `app.route('/api/projects', createProjectRoutes(...))` instead of inlining project handlers;
  - done: added route-seam tests in `apps/local-server/src/projectRoutes.test.ts` for list/create/event/log behavior.
  - done: extracted `jobs` route composition into `createJobRoutes()` in `apps/local-server/src/jobRoutes.ts`;
  - done: `appFactory.ts` now mounts `app.route('/api/jobs', createJobRoutes(...))` instead of inlining job handlers;
  - done: added route-seam tests in `apps/local-server/src/jobRoutes.test.ts` for list/detail/cancel/create flow and provider-blocker validation.
  - done: extracted lightweight `assets/logs` route composition into `createAssetLogRoutes()` in `apps/local-server/src/assetLogRoutes.ts`;
  - done: `appFactory.ts` now mounts `app.route('/api', createAssetLogRoutes(...))` for `/api/assets` and `/api/logs`;
  - done: added route-seam tests in `apps/local-server/src/assetLogRoutes.test.ts` for assets/logs responses.
  - done: extracted `health/bootstrap/app-server-start` route composition into `createRuntimeRoutes()` in `apps/local-server/src/runtimeRoutes.ts`;
  - done: `appFactory.ts` now mounts `app.route('/api', createRuntimeRoutes(...))` instead of inlining health/bootstrap/start handlers;
  - done: added route-seam tests in `apps/local-server/src/runtimeRoutes.test.ts` for health, bootstrap-config, and app-server start diagnostics.
  - done: extracted `studio/reset` route composition into `createStudioControlRoutes()` in `apps/local-server/src/studioControlRoutes.ts`;
  - done: `appFactory.ts` now mounts `app.route('/api/studio', createStudioControlRoutes(...))` instead of inlining studio reset handler;
  - done: added route-seam tests in `apps/local-server/src/studioControlRoutes.test.ts` for reset delegation.
  - done: extracted event stream route composition into `createEventStreamRoutes()` in `apps/local-server/src/eventStreamRoutes.ts`;
  - done: `appFactory.ts` now mounts `app.route('/api', createEventStreamRoutes(...))` instead of inlining `/api/events` SSE handling;
  - done: added route-seam tests in `apps/local-server/src/eventStreamRoutes.test.ts` for SSE handshake headers and initial `server.connected` payload;
  - done: extracted library asset-serving route composition into `createLibraryRoutes()` in `apps/local-server/src/libraryRoutes.ts`;
  - done: `appFactory.ts` now mounts `app.route('/', createLibraryRoutes(...))` instead of inlining `/library/*` serving and thumbnail fallback;
  - done: added route-seam tests in `apps/local-server/src/libraryRoutes.test.ts` for traversal safety, missing-file 404, and thumbnail variant serving.
- **Exit criteria:** `appFactory.ts` acts mainly as runtime composition module, with heavy route groups mounted from focused route modules.
- **Docs:** update `docs/ARCHITECTURE.md` backend seam section once providers/codex route groups are also extracted.

### 10. Deepen `Studio Shell` composition policy (2026-05-31 batch)

- **Status:** In progress
- **Files:** `hooks/useStudioShell.ts`, `components/AppContent.tsx`,
  `lib/buildStudioHeaderToolbarProps.ts`, `lib/buildStudioPageController.ts`
- **Depends on:** none
- **Unblocks:** narrower shell interface and stable integration test surface
- **Concrete steps:**
  - define one deep composition-policy module for cross-seam shell invariants;
  - keep `useStudioShell.ts` as a thinner adapter interface over that policy;
  - add focused tests for shell policy (without mounting full UI tree).
- **Exit criteria:** shell callers stop depending on broad cross-domain wiring details.
- **Docs:** `docs/ARCHITECTURE.md`, `docs/TECHNICAL_DEBT.md`, findings index.

### 11. Deepen `Workspace lifecycle` invariants (2026-05-31 batch)

- **Status:** In progress
- **Files:** `hooks/useWorkspaceStrip.ts`, `hooks/useStudioActionConfirmations.ts`,
  `hooks/useCatalog.ts`, `lib/buildStudioHeaderToolbarProps.ts`, `components/header/WorkspaceStrip.tsx`
- **Depends on:** 10
- **Unblocks:** deterministic workspace switch/delete/clear behavior
- **Concrete steps:**
  - done: added `lib/workspaceLifecycle.ts` with shared lifecycle invariants for switch and delete ordering;
  - done: routed `buildStudioHeaderToolbarProps`, `useStudioActionConfirmations`, and `useWorkspaceStrip` through the shared lifecycle seam;
  - done: added focused seam tests in `lib/workspaceLifecycle.test.ts` for default workspace guard, switch behavior, and clear-before-delete ordering.
  - next: add integration tests that cover the full strip + confirmation flow through the same seam.
- **Exit criteria:** workspace policy no longer leaks across strip/confirm/catalog callers.
- **Docs:** `docs/ARCHITECTURE.md`, `docs/TECHNICAL_DEBT.md`.

### 12. Retire dual `Studio Settings` interface (2026-05-31 batch)

- **Status:** Done
- **Files:** `hooks/useStudioSettings.ts`, `hooks/useStudioShell.ts`, `components/StudioSettingsModal.tsx`
- **Depends on:** 10
- **Unblocks:** smaller settings fixtures and clearer domain seams
- **Concrete steps:**
  - done: migrated remaining shell callers to `settingsDomain` / `providerDomain` / `outputSourcesDomain`.
  - done: removed flat compatibility fields from `useStudioSettings` return contract.
  - next: add focused hook tests for domain-only interface behavior.
- **Exit criteria:** no caller depends on flat compatibility fields.
- **Docs:** `docs/ARCHITECTURE.md`, `docs/TECHNICAL_DEBT.md`.

### 13. Deepen `Command Center` projection policy (2026-05-31 batch)

- **Status:** Done
- **Files:** `lib/buildStudioHeaderToolbarProps.ts`, `lib/buildStudioPageController.ts`, `components/HeaderToolbar.tsx`
- **Depends on:** 10
- **Unblocks:** explicit projection invariants and reduced shell wiring spread
- **Concrete steps:**
  - done: compressed projection inputs into a policy seam with explicit invariants by grouping provider, queue, and actions contexts;
  - done: kept `HeaderToolbar` as a visual adapter;
  - done: added direct tests for projection policy outputs.
- **Exit criteria:** projection invariants are testable through a dedicated module interface.
- **Docs:** `docs/ARCHITECTURE.md`, findings index.

### 14. Add direct test surface for `createStudioApp` composition seam (2026-05-31 batch)

- **Status:** Done
- **Files:** `apps/local-server/src/appFactory.ts`, `apps/local-server/src/appFactory.test.ts`
- **Depends on:** none
- **Unblocks:** safe backend composition changes and ADR-0014 closure criteria
- **Concrete steps:**
  - done: create first composition tests for injected codex/project seams and catalog command wiring;
  - done: added failure-path coverage for codex route composition (`/api/codex/models` error path).
  - done: added runtime wiring coverage for injected app-server dependencies (`/api/app-server/start`).
  - done: added runtime failure-path composition coverage for `/api/app-server/start` when injected `ensureAppServer` throws.
  - done: added worker dependency wiring coverage for job cancel conflict path (`/api/jobs/:id/cancel` -> injected `cancelQueuedOrRunningJob`).
  - done: added worker status wiring coverage for runtime health composition (`/api/health`).
- **Exit criteria:** `createStudioApp` has direct seam tests that cover primary wiring paths.
- **Docs:** `docs/adr/0014-backend-dependency-injection-seams.md`, `docs/ARCHITECTURE.md`.

### 15. Deepen `Local Studio Sync` refresh policy semantics (2026-05-31 batch)

- **Status:** In progress
- **Files:** `hooks/useLocalStudioSync.ts`, `hooks/localStudioSyncRefreshPolicy.ts`, `hooks/localStudioSyncProjection.ts`
- **Depends on:** 10, 13
- **Unblocks:** resilient refresh behavior under burst and reconnect patterns
- **Concrete steps:**
  - done: modeled refresh triggers with explicit event categories (`asset_added`, `connection_lost`, `connection_restored`) inside `localStudioSyncRefreshPolicy`.
  - done: expanded coalescing semantics to include reconnect transitions (`false -> true`) in addition to asset-added/disconnect.
  - done: added focused tests for reconnect and mixed burst trigger scenarios in `hooks/localStudioSyncRefreshPolicy.test.ts`.
  - done: added differentiated retry/backoff semantics for reconnect refresh failures (`connection_restored`) without introducing retries for asset-only refresh failures.
  - next: add integration-level coverage through `useLocalStudioSync` to validate reconnect retry behavior with event-stream bursts.
- **Exit criteria:** refresh behavior evolves behind policy seam without hook churn.
- **Docs:** `docs/ARCHITECTURE.md`, `docs/TECHNICAL_DEBT.md`.

### 16. Deepen `Studio Overlay Controller` settings seam (2026-05-31 batch)

- **Status:** Done
- **Files:** `hooks/useStudioOverlayController.ts`, `components/overlays/types.ts`,
  `components/overlays/StudioSystemOverlays.tsx`, `hooks/useStudioOverlayController.test.ts`
- **Depends on:** 10, 12
- **Unblocks:** smaller system-overlay interface and clearer domain ownership for `Studio Settings` data
- **Concrete steps:**
  - done: `StudioSystemOverlaysProps` now groups settings data and actions under `settingsModule` instead of exposing a broad flat settings surface;
  - done: `buildStudioOverlayController()` now publishes grouped `settingsModule` data into `systemOverlays`;
  - done: `StudioSystemOverlays` now consumes grouped `settingsModule` domains and keeps modal wiring behavior unchanged;
  - done: updated overlay seam tests to assert `settingsModule` paths.
  - done: reduced the remaining controller argument flattening by renaming the shell seam input to `settingsModule` and threading the grouped settings module straight through the controller.
- **Exit criteria:** no new callers depend on flat settings fields in `systemOverlays`; overlay settings wiring remains domain-grouped.
- **Docs:** `docs/ARCHITECTURE.md`, findings index.

### 6. Deepen `Local Studio Sync` state ownership

- **Status:** In progress
- **Files:** `hooks/useLocalStudioSync.ts`, `services/studioEventSource.ts`, `services/localStudioService.ts`
- **Depends on:** recommendations 1-5
- **Unblocks:** clearer transport/projection seams and isolated sync tests
- **Concrete steps:**
  - done: extracted connection/asset refresh policy into `hooks/localStudioSyncRefreshPolicy.ts`, so `useLocalStudioSync.ts` no longer inlines reconnect refresh orchestration;
  - done: added focused policy tests in `hooks/localStudioSyncRefreshPolicy.test.ts` for asset-trigger refresh, reconnect coalescing, and connected-event no-op behavior;
  - done: `localStudioSyncRefreshPolicy` now coalesces backend refresh requests for both asset-added and disconnect events through one `requestRefresh` path, improving sync locality under bursty event streams;
  - done: extracted projection/reducer concerns into `hooks/localStudioSyncProjection.ts`;
  - done: `useLocalStudioSync.ts` now composes transport behavior with imported projection helpers instead of co-locating both concerns;
  - separate transport adapter behavior from activity projection behavior;
  - keep one deep sync interface for shell/runtime callers;
  - add focused tests for connection-change fallback and catalog refresh triggers.
- **Exit criteria:** sync transport and sync projection can evolve independently behind one sync seam.
- **Docs:** update `docs/ARCHITECTURE.md`, `docs/TECHNICAL_DEBT.md`, and the findings index.

### 7. Finish catalog-first cleanup at the legacy export and recovery edge

- **Status:** Done
- **Files:** `hooks/useVaultTransfer.ts`, `lib/studioWorkspaceExport.ts`, `lib/studioStorageRecovery.ts`, `lib/studioLegacyVisualBatchStore.ts`
- **Depends on:** recommendations 1-6
- **Unblocks:** clearer contributor understanding of the `Image Catalog` as the durable model
- **Concrete steps:**
  - done: `useVaultTransfer.ts` now exposes `exportLegacyVisualBatchSnapshot()` and keeps `exportWorkspaceSnapshot` only as a compatibility alias;
  - done: `useStudioShell.ts` now consumes the explicit legacy export name at the vault seam and stops carrying unused vault-export wiring;
  - done: `lib/studioWorkspaceExport.ts` now exposes explicit `exportLegacyVisualBatchSnapshot()` naming while preserving a compatibility alias for incremental migration;
  - done: overlay and operations seams now expose explicit legacy export naming (`handleExportLegacyVisualBatchSnapshot` / `exportLegacyVisualBatchSnapshot`) without neutral alias fields;
  - done: compatibility alias remains centralized in `useVaultTransfer.ts` only and is tagged deprecated for incremental migration;
  - done: legacy export and recovery paths are explicit as compatibility-only seams.
- **Exit criteria:** the remaining legacy path is obviously compatibility-only and no new product flow depends on it.
- **Docs:** update `docs/TECHNICAL_DEBT.md` and the findings index.

### 8. Reorganize `Style Preset Manifest` taxonomy and anime pack topology

- **Status:** In progress
- **Files:** `components/recipes/styles/manifests/packs/*.yaml`,
  `components/recipes/styles/manifests/presets/**/*.yaml`,
  `docs/architecture/style-preset-restructure-2026-05-28.md`,
  `docs/STYLE_PRESET_AUTHORING.md`
- **Depends on:** ADR-0025 (granular style manifests)
- **Unblocks:** cleaner style browsing/search relevance, safer preset authoring, smaller taxonomy drift risk
- **Concrete steps:**
  - done: accepted and documented reorganization plan in `docs/architecture/style-preset-restructure-2026-05-28.md`;
  - done: normalized mixed-language pack metadata where safe (`pack_14`, `pack_15` descriptions);
  - next: split anime inventory (`pack_05` + `pack_13`) into 3 coherent pack groups with stable preset identity;
  - next: decompose legacy single-category `videojuegos` packs (`pack_01`, `pack_02`, `pack_03`, `pack_04`, `pack_07`, `pack_09`, `pack_11`) into domain-specific categories;
  - next: normalize category id naming to `kebab-case` and enforce English taxonomy ids/tags;
  - next: add source/validation guardrails to block reintroduction of catch-all category ids and mixed naming styles.
- **Exit criteria:** no pack depends on category id `videojuegos`; category ids are consistently `kebab-case`; taxonomy ids/tags are English-only; style validation remains green after each migration batch.
- **Docs:** update `docs/STYLE_PRESET_AUTHORING.md`, `SKILLS.md`, and the findings index.

## Fase 1: base de backend

- ADR 0002: callable app factory.
- ADR 0003: extract reference manager.
- ADR 0004: platform paths seam.
- ADR 0005: split Codex client module.
- ADR 0006: SSE job watcher.
- ADR 0007: consolidate generation flows.

## Fase 2: estado frontend y componentes

- ADR 0010: decompose god contexts.
- ADR 0011: decompose `AppContent` god component.
- ADR 0013: resolve the catalog/batch dual model.

## Fase 3: recipes y módulos de UI

- ADR 0012: recipe context builder seam.
- ADR 0015: extract the 3D viewport from the Camera recipe.

## Fase 4: migración de modelo de datos

- ADR 0008: multi-library disk catalog.
- ADR 0009: embedded image metadata.
- ADR 0014: backend dependency-injection seams.
- ADR 0016: deduplicate image extraction.
- ADR 0017: centralize configuration.

## Orden recomendado

1. Backend foundation first, so the local API can be tested and supervised cleanly.
2. Frontend state next, so the shell can consume fewer shallow interfaces.
3. Recipe and UI module extraction in parallel where it does not disrupt data migration.
4. Catalog-first data migration once sync, SSE, and shell boundaries are stable.

For the currently accepted batch, prefer the explicit order in **Accepted review batch - 2026-05-27**.

## Métricas de éxito

- **Testability:** modules can be tested through their public interface without unrelated module mocking.
- **Modularity:** deleting one module does not break unrelated concerns.
- **AI navigability:** understanding how an image is generated should not require reading many unrelated files.
- **Operational clarity:** logs, health, and diagnostics should lead users to the next action.
