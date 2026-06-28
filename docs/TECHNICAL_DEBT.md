# Deuda técnica

Este documento registra deuda técnica activa mientras Codex Studio se prepara para una release open-source más sólida.

## Alta prioridad

Referencia de arquitectura aceptada:

- `docs/architecture/architecture-review-2026-06-28-improve-debt-audit.md` (current improve/debt audit)
- `docs/adr/0033-public-library-and-job-intake-boundaries.md`
- `docs/architecture/architecture-review-2026-06-21-second-pass-runtime-ux.md` (candidate follow-up findings)
- `docs/architecture/architecture-review-2026-06-21-runtime-storage-ux.md`
- `docs/architecture/architecture-review-2026-06-19-front-performance.md`
- `docs/architecture/architecture-review-2026-05-29.md`
- `docs/architecture/DEEPENING-ROADMAP.md`

Cola de ejecución actual:

1. Continuar el lote front-performance 2026-06-19: finish full Local Studio Sync job-waiting ownership, backend full-scope Catalog Page commands, Style Browser session split, and remaining Studio Readiness freshness.
2. Profundizar orquestación de `Studio Shell`.
3. Profundizar `Studio Generation Session`.
4. Reducir traducción de overlays de sistema tras separar seams de `Studio Settings` por dominio operativo.
5. Completar deepening de rutas en `appFactory`.
6. Mejorar semántica de refresh en `Local Studio Sync`.
7. Revisar claridad de seams en `Local Generation Run`.

Prioridad inmediata del lote runtime-storage-UX 2026-06-21:

- Surface partial-failure UX for full-scope backend Catalog commands.
- Type catalog events and give Local Studio Sync scoped invalidation plus bounded job waiting.
- Add provider-neutral Job Trace Summary before transcript retention.
- Harden storage compaction with recoverable-vs-omitted payload reporting.
- Keep summary-first hot reads as a release guard: list endpoints must not select, parse, or return oversized historical payloads.

Recent runtime-storage progress:

- Done 2026-06-28: `plans/008-public-library-job-intake-reference-boundaries.md` closed `/library/*` public-asset allowlisting, malformed `Persistent Job Intake` validation, and reference count/byte budgets.
- `JobSummary` is now the default hot read shape for `/api/jobs`.
- Catalog Page reads no longer select or parse full `generation_config` by default.
- Hot-plan indexes were added for jobs, job events, and Codex turns.
- `storage:audit` and guarded `storage:compact` commands now exist.
- Backend process logs use a shared rotating writer and SQL `system_logs` has bounded recent retention.
- Backend Catalog archive/restore/purge commands now operate by explicit filter instead of loaded client pages.
- Local Studio Sync now listens to `catalog.updated` / `catalog.deleted` through the shared event stream.

Second-pass candidate follow-ups from 2026-06-21:

- Done: repo-local tooling log retention for `logs/tooling`; timestamped logs are pruned per task and `.latest.log` stays.
- Add a content-addressed Reference Store before deleting or retaining reference files aggressively. `storage:audit` now reports reference dedupe stats first.
- Backfill missing historical catalog thumbnails so gallery cold paths do not generate thumbnails inside HTTP requests. First write batch warmed 137 recoverable rows; 784 remaining rows point at missing source files and should be handled by an orphan-metadata cleanup plan.
- Measure Studio Readiness request overlap before consolidating freshness ownership.
- Add catalog search timing before deciding whether FTS is justified.

### 1. Further decompose `components/AppContent.tsx`

`AppContent` already delegates a significant amount of work to hooks and shell modules, but it still concentrates overlay composition, navigation wiring, and context coordination.

Recent progress in the `Studio Shell` track:

- `useStudioCatalogController()` now owns `Image Catalog` mutation choreography, queue previews, and trash grouping.
- `buildStudioPageController()` now crosses grouped `debug` / `grid` / `operations` contexts instead of a flat prop mirror.
- `buildStudioHeaderToolbarProps()` now derives `Command Center` runtime status, queue counts, queue toggle behavior, and provider fallback inside the toolbar seam.
- `buildStudioViewportController()` now owns `StudioViewport` / `StudioGenerationDock` projection so `useStudioShell.ts` no longer needs the ad-hoc `recipePagePropsRef` presenter glue.
- `buildStudioShellOverlayController()` now owns overlay-side `Studio Settings` library fallback and background-toggle wiring so `useStudioShell.ts` no longer rebuilds those decisions inline.
- `useStudioViewState()` now groups queue/editor/preview/overlay state behind focused surfaces and removes duplicate editor-image setter wiring from `useStudioShell.ts`.
- `useStudioNavigation()` now crosses grouped `recipe` / `modal` / `editor` / `shell` navigation surfaces and drops unused flat props from the shell contract.
- `startQueuedJobExecution()` in `lib/queueStateMachine.ts` now owns per-job queue execution semantics and terminal outcome mapping so `useQueueManager.ts` stays the queue orchestrator instead of another lifecycle sink.
- `useStudioGenerationSession()` now returns grouped `queue` / `actions` surfaces so `useStudioShell.ts` no longer consumes another spread of generation-session implementation detail.
- `useStudioSettings()` now returns a grouped `data` surface so editable settings, provider preflight/capability reads, and External Output Source actions cross one shell-facing seam instead of another flat settings contract.
- `useStudioActivitySession()` now returns grouped `selection` / `debugPanel` surfaces so job inspection state and debug-panel toggling stop leaking as another flat shell dependency list.
- `useStudioSettings()` domain surfaces are memoized so broad shell projections do not invalidate on every render without data changes.
- `StudioOperationsRail` no longer carries dashboard/reset/export props it does not render.
- `StudioOperationsRail` exposes a real close action; on mobile it becomes a full-width overlay, and the bottom composer now wraps into stable rows instead of forcing controls into one crowded line.

Recommended next steps:

- keep moving runtime wiring into `useStudioRuntime` and shell-specific hooks;
- keep overlay orchestration in focused controllers;
- add integration tests around the shell after each extraction.

### 2. Complete the catalog-first migration

SQLite/Image Catalog is the durable source of truth. Visual Batch compatibility remains for recovery and generated append paths, but it should not drive new product decisions.

Current direction:

- `StudioCatalogView` is the catalog read model.
- `studioCatalogImageAdapter` materializes UI image data from Catalog Entries.
- `studioLegacyVisualSnapshotExport` owns legacy `GenerationBatch[]` export compatibility.
- Legacy export naming is explicit (`exportLegacyVisualBatchSnapshot`) and the neutral alias remains only in `useVaultTransfer` as deprecated compatibility.
- `LegacyVisualBatchContext` stores lightweight refs rather than full snapshots.
- `catalog:source:verify` blocks regressions where catalog code starts depending on Visual Batch storage again.

Recommended next steps:

- make grid, export, trash, and workspace flows fully Catalog Entry based;
- shrink remaining recovery and generated append compatibility edges;
- keep IndexedDB as recovery/UI convenience only.

### 3. Continue backend dependency-injection seams

`appFactory.ts` provides useful seams, but some backend modules still rely on singletons or module-level state.

Recommended next steps:

- continue moving DB, logger, event bus, worker, and provider dependencies behind explicit factory inputs;
- strengthen isolated tests for catalog, worker lifecycle, and provider execution;
- preserve the Provider Boundary so route handlers and non-provider modules do not import concrete provider executors directly.

Recent delta:

- `useStudioSettings` removed the flat compatibility interface and now exposes only domain seams (`settingsDomain`, `providerDomain`, `outputSourcesDomain`) for shell callers.
- `createStudioApp` composition tests now also cover codex failure-path behavior and app-server runtime dependency wiring.
- `createStudioApp` now accepts library/workspace route dependency overrides; workspace routes no longer require singleton functions at route construction, and composition tests cover injected library/workspace lists.

## Prioridad media

### 1. Studio Runtime vs Studio Readiness naming

Docs distinguish the concepts, but code still uses similar names for a static runtime adapter and a React orchestrator.

Recommended next step: decide whether the hook name should become more explicit before exposing more extension seams.

### 2. Uniform frontend logging

Several components and utilities still use direct `console.*` calls.

Recommended next step: introduce a small UI logging adapter with levels and consistent context fields.

### 3. GSAP local animation parity

The local animation compatibility layer avoids `motion/react`, but not every exit/layout semantic has equivalent coverage yet.

Recommended next step: strengthen exit transitions and list animation helpers where real UI needs them.

### 4. UI integration tests

More coverage is needed around `Toolbar`, `QueuePanel`, `StudioPage`, `useLocalStudioSync`, onboarding, and reset flows.

### 5. Dependency compatibility reviews

After major Vite+, Rolldown, OXC, React, or Bun updates, run the full validation loop and check real compatibility rather than assuming ecosystem stability.

### 6. Final artifact audit before release

Before a public release candidate, review tracked files and history for local prompts, generated assets, SQLite files, logs, and machine-specific paths.

## Notas de rendimiento

- Heavy recipe surfaces should remain demand-loaded.
- `react-scan`, Three.js, style catalog data, ZIP export, and YAML parsing should not enter the startup bundle eagerly.
- `ui:source:verify`, `ui:chunks:verify`, and `styles:render:verify` should remain release gates if they continue to catch real regressions.

## Brechas de documentación

- Add more catalog-first migration guidance as ADR-0013 continues.
- Done: manual release checks now live in `docs/active/release-manual-checklist.md`.
- Keep large style-generation logs behind the short active index; avoid adding new local absolute backup paths to active docs.
- Keep provider configuration docs explicit about Provider Secrets staying outside SQLite-backed Studio Settings.

## Áreas cerradas (o casi cerradas)

- Monolithic legacy style pack YAML has been retired in favor of granular manifests.
- Style runtime naming is explicit with `StyleRuntimePack` and `StyleRuntimePreset`.
- Style preset templates exist for image, sprite sheet, and texture authoring.
- External Output Sources provide the safer import boundary for unmanaged output folders.

## Regla de priorización hacia release

Technical debt should be prioritized when it blocks one of these outcomes:

- a new user can install and diagnose the studio;
- a contributor can reason about the code without repo history;
- local assets and secrets stay safe;
- validation can catch regressions before a public release.
