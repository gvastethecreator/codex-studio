# Hoja de ruta de deepening arquitectónico

Esta hoja de ruta sigue refactors que convierten módulos superficiales en módulos más profundos, con mejor locality, leverage y testabilidad. Las decisiones relacionadas viven en `docs/adr/`.

Current findings index: `docs/architecture/architecture-review-2026-05-29.md`.

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

## Seguimiento de trabajo

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
