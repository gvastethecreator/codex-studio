# Architecture Deepening Roadmap

This roadmap tracks refactors that turn shallow modules into deeper modules with better locality, leverage, and testability. Related decisions live in `docs/adr/`.

Current findings index: `docs/architecture/architecture-review-2026-05-27.md`.

## Concepts

- **Depth:** a small interface that hides significant useful behavior.
- **Locality:** related behavior changes in one place instead of many callers.
- **Deletion test:** if deleting a module makes complexity disappear, it was likely a pass-through. If complexity reappears across many callers, the module was earning its keep.

## Accepted review batch — 2026-05-27

The current accepted batch comes from `docs/architecture/architecture-review-2026-05-27.md`.

Execution order for the accepted batch:

1. Deepen the `Studio Shell` orchestration module.
2. Move `Recipe Module` behaviour out of the static registry.
3. Deepen the `Local Generation Run` lifecycle seam.
4. Finish the `WorkerController` dependency seam promised by ADR-0014.
5. Finish catalog-first cleanup at the legacy export and recovery edge.

## Work tracker

### 1. Deepen the `Studio Shell` orchestration module

- **Status:** In progress
- **Files:** `hooks/useStudioShell.ts`, `hooks/useCatalog.ts`, `components/AppContent.tsx`, `lib/buildStudioHeaderToolbarProps.ts`, `lib/buildStudioPageController.ts`
- **Depends on:** none
- **Unblocks:** more focused shell integration tests; narrower `Command Center` and overlay seams
- **Concrete steps:**
	- done: extracted `Image Catalog` commands, queue-result derivation, trash grouping, and refresh choreography into `useStudioCatalogController()` in `hooks/useCatalog.ts`, with regression coverage for legacy `workspaceId: null` handling;
	- done: deepened `buildStudioPageController()` so the `Studio Shell` now crosses grouped `debug`, `grid`, and `operations` contexts instead of one flat interface that mirrored implementation detail;
	- done: deepened `buildStudioHeaderToolbarProps()` so the `Command Center` seam now derives runtime status, queue counts, queue toggling, and provider fallback internally instead of leaving those decisions in `useStudioShell.ts`;
	- separate shell navigation, generation/queue, and overlay orchestration into deeper modules;
	- keep `useStudioShell()` only if it still adds leverage after the split.
- **Exit criteria:** `useStudioShell.ts` stops owning catalog mutation choreography and no longer acts as the single implementation sink for shell routing, queue, overlays, and runtime wiring.
- **Docs:** update `docs/ARCHITECTURE.md`, `docs/TECHNICAL_DEBT.md`, and the findings index.

### 2. Move `Recipe Module` behaviour out of the static registry

- **Status:** Planned
- **Files:** `lib/recipeModules.ts`, `lib/recipeContext.ts`, `components/recipes/recipeModuleUi.ts`, `services/localGenerationRun.ts`
- **Depends on:** recommendation 1 preferred, but not strictly required
- **Unblocks:** cleaner recipe tests, smaller `Local Generation Run` interface, less cross-file recipe churn
- **Concrete steps:**
	- move defaults, validation, recipe-context building, directives, and `Generation Task Spec` production closer to each `Recipe Module`;
	- keep the `Recipe Module Catalog` as the query module for UI and tooling;
	- update audits so the seam remains enforced after the move.
- **Exit criteria:** recipe-specific implementation no longer accumulates in one growing central registry plus a second recipe-context registry.
- **Docs:** update `docs/ARCHITECTURE.md`, `docs/TECHNICAL_DEBT.md`, and the findings index.

### 3. Deepen the `Local Generation Run` lifecycle seam

- **Status:** Planned
- **Files:** `services/localGenerationRun.ts`, `hooks/useGenerationPipeline.ts`, `contexts/GenerationContext.tsx`
- **Depends on:** recommendation 2
- **Unblocks:** clearer cancellation/retry semantics and more focused generation tests
- **Concrete steps:**
	- move lifecycle ownership, cancellation, terminal outcome mapping, and batch pacing behind the `Local Generation Run` seam;
	- reduce duplicated control flow in `useGenerationPipeline.ts` for generate vs edit;
	- shrink the interface that `GenerationContext` republishes.
- **Exit criteria:** generate and edit flows cross one deeper lifecycle seam instead of splitting behaviour across service, hook, and context.
- **Docs:** update `docs/ARCHITECTURE.md`, `docs/TECHNICAL_DEBT.md`, and the findings index.

### 4. Finish the `WorkerController` dependency seam promised by ADR-0014

- **Status:** Planned
- **Files:** `apps/local-server/src/worker.ts`, `apps/local-server/src/appFactory.ts`, `apps/local-server/src/workerCatalogContext.ts`, `apps/local-server/src/workerRouting.ts`
- **Depends on:** recommendation 3 preferred for lower churn
- **Unblocks:** more isolated worker tests and future runtime experiments
- **Concrete steps:**
	- move settings, catalog-context, runtime-target, and asset-finalization collaborators to the explicit worker seam;
	- make `appFactory.ts` the real composition module for worker dependencies;
	- reduce hidden module imports inside `worker.ts`.
- **Exit criteria:** worker tests can cross the `WorkerController` seam without relying on ambient imports or real filesystem behaviour unless intentionally chosen.
- **Docs:** update ADR-0014 status, `docs/ARCHITECTURE.md`, `docs/TECHNICAL_DEBT.md`, and the findings index.

### 5. Finish catalog-first cleanup at the legacy export and recovery edge

- **Status:** Planned
- **Files:** `hooks/useVaultTransfer.ts`, `lib/studioWorkspaceExport.ts`, `lib/studioStorageRecovery.ts`, `lib/studioLegacyVisualBatchStore.ts`
- **Depends on:** recommendations 1–4
- **Unblocks:** clearer contributor understanding of the `Image Catalog` as the durable model
- **Concrete steps:**
	- keep legacy export and recovery paths explicit and clearly named as legacy-only;
	- prevent new callers from treating legacy snapshot export as a normal seam;
	- decide whether snapshot export remains a product feature or becomes a migration-only tool.
- **Exit criteria:** the remaining legacy path is obviously compatibility-only and no new product flow depends on it.
- **Docs:** update `docs/TECHNICAL_DEBT.md` and the findings index.

## Phase 1: backend foundation

- ADR 0002: callable app factory.
- ADR 0003: extract reference manager.
- ADR 0004: platform paths seam.
- ADR 0005: split Codex client module.
- ADR 0006: SSE job watcher.
- ADR 0007: consolidate generation flows.

## Phase 2: frontend state and components

- ADR 0010: decompose god contexts.
- ADR 0011: decompose `AppContent` god component.
- ADR 0013: resolve the catalog/batch dual model.

## Phase 3: recipes and UI modules

- ADR 0012: recipe context builder seam.
- ADR 0015: extract the 3D viewport from the Camera recipe.

## Phase 4: data model migration

- ADR 0008: multi-library disk catalog.
- ADR 0009: embedded image metadata.
- ADR 0014: backend dependency-injection seams.
- ADR 0016: deduplicate image extraction.
- ADR 0017: centralize configuration.

## Recommended order

1. Backend foundation first, so the local API can be tested and supervised cleanly.
2. Frontend state next, so the shell can consume fewer shallow interfaces.
3. Recipe and UI module extraction in parallel where it does not disrupt data migration.
4. Catalog-first data migration once sync, SSE, and shell boundaries are stable.

For the currently accepted batch, prefer the explicit order in **Accepted review batch — 2026-05-27**.

## Success metrics

- **Testability:** modules can be tested through their public interface without unrelated module mocking.
- **Modularity:** deleting one module does not break unrelated concerns.
- **AI navigability:** understanding how an image is generated should not require reading many unrelated files.
- **Operational clarity:** logs, health, and diagnostics should lead users to the next action.
