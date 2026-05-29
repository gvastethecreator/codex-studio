# Technical Debt

This document tracks technical debt that remains relevant while Codex Studio prepares for a stronger open-source preview.

## High priority

Accepted architecture review batch: `docs/architecture/architecture-review-2026-05-29.md`.
Shared execution tracker: `docs/architecture/DEEPENING-ROADMAP.md`.

Current execution queue:

1. Deepen the `Studio Shell` orchestration module.
2. Deepen the `Studio Generation Session` module.
3. Separate `Studio Settings` seams by operational domain.
4. Finish `appFactory` route composition deepening (`events` + `library` extraction complete; continue route-level seam hardening).
5. Deepen `Local Studio Sync` refresh policy semantics.
6. Review naming and seam clarity in the provider-neutral `Local Generation Run` flow.

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

## Medium priority

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

## Performance notes

- Heavy recipe surfaces should remain demand-loaded.
- `react-scan`, Three.js, style catalog data, ZIP export, YAML parsing, and visual background effects should not enter the startup bundle eagerly.
- `ui:source:verify`, `ui:chunks:verify`, and `styles:render:verify` should remain release gates if they continue to catch real regressions.

## Documentation gaps

- Add more catalog-first migration guidance as ADR-0013 continues.
- Add a manual open-source smoke-test checklist.
- Keep provider configuration docs explicit about Provider Secrets staying outside SQLite-backed Studio Settings.

## Closed or mostly closed areas

- Monolithic legacy style pack YAML has been retired in favor of granular manifests.
- Style runtime naming is explicit with `StyleRuntimePack` and `StyleRuntimePreset`.
- Style preset templates exist for image, sprite sheet, and texture authoring.
- External Output Sources provide the safer import boundary for unmanaged output folders.

## Release-facing rule

Technical debt should be prioritized when it blocks one of these outcomes:

- a new user can install and diagnose the studio;
- a contributor can reason about the code without repo history;
- local assets and secrets stay safe;
- validation can catch regressions before a public release.
