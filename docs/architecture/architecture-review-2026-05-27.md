# Architecture review - Codex Studio

Date: 2026-05-27

## Summary

- Current friction clusters around six modules where the interface is still close to the implementation: `Studio Shell`, `Studio Generation Session`, `Recipe Module`, `Local Generation Run`, `WorkerController`, and `Local Studio Sync`.
- Existing ADRs already set direction (ADR-0011, ADR-0013, ADR-0014). The review does not re-litigate those decisions; it deepens them.
- The main risk today is shallow orchestration modules that spread behavior across many callers, reducing locality and leverage.

## Recommendations

### 1. Deepen the Studio Shell module

**Recommendation strength**: Strong

**Files**

- `hooks/useStudioShell.ts`
- `components/AppContent.tsx`
- `lib/buildStudioPageController.ts`
- `lib/buildStudioHeaderToolbarProps.ts`

**Problem**

`useStudioShell` still coordinates many seams at once (Image Catalog mutations, Local Generation Run session wiring, overlays, Studio Readiness, Command Center projection). Its interface is broad (`root`, `background`, `toasts`, `headerToolbar`, `viewport`, `generationDock`, `overlays`) and callers still need deep implementation knowledge.

Deletion test: deleting `useStudioShell` would not remove complexity; it would reappear in `AppContent` and spread further across adapters.

**Solution**

Keep `useStudioShell` only as a thin composition module and move remaining orchestration into deeper modules with narrow interfaces, especially the catalog-mutation workflow and overlay composition workflow.

**Benefits**

- locality: shell behavior changes concentrate in fewer places.
- leverage: shell callers consume smaller interfaces.
- testability: tests cross one seam per concern instead of one oversized seam.

**Before / After**

- Before: one module composes most top-level behavior and exposes a wide interface.
- After: one composition module delegates to deeper modules that each own one behavior cluster.

**Dependencies / sequencing**

- First in execution order.
- Extends ADR-0011 and ADR-0024.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` (Studio Shell seams).
- Update `docs/TECHNICAL_DEBT.md` execution status.
- Update `docs/architecture/DEEPENING-ROADMAP.md` progress.

### 2. Deepen the Studio Generation Session module

**Recommendation strength**: Strong

**Files**

- `hooks/useStudioGenerationSession.ts`
- `hooks/useStudioGenerationActions.ts`
- `hooks/useGenerationPipeline.ts`
- `hooks/useStudioShell.ts`

**Problem**

Generation behavior is split across modules with overlapping orchestration: queue cancel policy in `useStudioGenerationSession`, request shaping in `useStudioGenerationActions`, and lifecycle/error policy in `useGenerationPipeline`. The seam exists, but callers still need to understand several modules to reason about one generation flow.

Deletion test: removing `useStudioGenerationSession` would push queue/action composition back into `useStudioShell` and reduce locality immediately.

**Solution**

Deepen `Studio Generation Session` so it owns one complete generation interface: request preparation, queue policy, cancel semantics, and lifecycle outcomes. Keep `useGenerationPipeline` as a lower adapter, not a second orchestration module.

**Benefits**

- locality: generation bugs stop bouncing across three modules.
- leverage: one interface for both generate and edit paths.
- testability: session tests assert outcomes at one seam.

**Before / After**

- Before: orchestration split between session/actions/pipeline modules.
- After: session module owns generation orchestration; lower adapters stay implementation detail.

**Dependencies / sequencing**

- Second in execution order.
- Should run before deeper Local Generation Run reshaping to avoid double churn.

**Documentation follow-ups**

- Update generation seam notes in `docs/ARCHITECTURE.md`.
- Add tracking section in `docs/architecture/DEEPENING-ROADMAP.md`.

### 3. Deepen the Recipe Module seam and retire split registries

**Recommendation strength**: Strong

**Files**

- `lib/recipeModules.ts`
- `lib/recipeContext.ts`
- `lib/recipeContextBuilders/*`
- `components/recipes/recipeModuleUi.ts`
- `services/localGenerationRun.ts`

**Problem**

Recipe behavior is split between `RECIPE_MODULES` and `RECIPE_CONTEXT_BUILDERS`, plus helper wrappers. The seam is real (many adapters import it), but depth is low because callers still need to know multiple entry points.

Deletion test: removing one registry does not remove complexity; it forces callers to absorb context and validation rules.

**Solution**

Move recipe-specific implementation behind each Recipe Module and keep one module-level interface for defaults, validation, context/directives, and Generation Task Spec production. Keep the Recipe Module Catalog as read-only discovery.

**Benefits**

- locality: recipe changes happen in one module.
- leverage: fewer helper concepts for callers.
- testability: one seam per recipe module.

**Before / After**

- Before: two registries and helper wrappers for one concept.
- After: one deep Recipe Module interface, one thin catalog interface.

**Dependencies / sequencing**

- Third in execution order.
- Extends ADR-0012 and ADR-0020.

**Documentation follow-ups**

- Update recipe module sections in `docs/ARCHITECTURE.md`.
- Update roadmap/debt tracking docs.

### 4. Deepen Local Generation Run lifecycle ownership

**Recommendation strength**: Strong

**Files**

- `services/localGenerationRun.ts`
- `hooks/useGenerationPipeline.ts`
- `contexts/GenerationContext.tsx`

**Problem**

`runLocalGeneration` owns backend execution details, but `useGenerationPipeline` still owns a large slice of lifecycle policy (begin/finish state, modal behavior, messaging). The seam is split, so failure semantics and cancellation semantics are not fully local.

Deletion test: deleting `runLocalGeneration` would replicate backend choreography in pipeline callers. Deleting pipeline lifecycle logic would replicate UI lifecycle decisions in multiple adapters.

**Solution**

Concentrate lifecycle outcomes in Local Generation Run (completed/cancelled/failed semantics and progress policy), then make pipeline a thin UI adapter.

**Benefits**

- locality: lifecycle semantics live in one module.
- leverage: adapters consume one execution outcome model.
- testability: run behavior becomes easier to test without UI wiring.

**Before / After**

- Before: lifecycle ownership split between run module and pipeline module.
- After: run module owns lifecycle semantics; pipeline maps to UI only.

**Dependencies / sequencing**

- Fourth in execution order.
- Should follow Recommendation 2.

**Documentation follow-ups**

- Update generation flow section in `docs/ARCHITECTURE.md`.
- Update `docs/TECHNICAL_DEBT.md` status line for this module.

### 5. Finish the WorkerController seam promised by ADR-0014

**Recommendation strength**: Strong

**Files**

- `apps/local-server/src/worker.ts`
- `apps/local-server/src/appFactory.ts`
- `apps/local-server/src/workerCatalogContext.ts`
- `apps/local-server/src/workerRouting.ts`

**Problem**

`createWorkerController` advertises dependency injection, but `worker.ts` still imports runtime decisions directly (`readEditableStudioSettings`, `resolveJobCatalogContext`, `resolveWorkerRuntimeTarget`). The seam is partially real, not fully real.

Deletion test: deleting DI from WorkerController would force tests to use real runtime dependencies; current locality and testability would regress immediately.

**Solution**

Move remaining runtime decisions behind injected adapters from `appFactory` so WorkerController implementation uses the same seam it exposes.

**Benefits**

- locality: runtime wiring and worker behavior separate cleanly.
- leverage: backend tests control worker behavior through one interface.
- testability: fewer hidden imports and less ambient state.

**Before / After**

- Before: explicit seam with hidden direct imports.
- After: explicit seam with explicit adapters only.

**Dependencies / sequencing**

- Fifth in execution order.
- Direct extension of ADR-0014.

**Documentation follow-ups**

- Update backend seam section in `docs/ARCHITECTURE.md`.
- Update ADR-0014 status when complete.

### 6. Deepen Local Studio Sync state ownership

**Recommendation strength**: Worth exploring

**Files**

- `hooks/useLocalStudioSync.ts`
- `services/studioEventSource.ts`
- `services/localStudioService.ts`

**Problem**

`useLocalStudioSync` currently owns transport orchestration, reducer state, log projection, connection policy, and catalog refresh triggers. The module works, but depth is limited because transport behavior and projection behavior are coupled.

Deletion test: deleting this module would scatter SSE and refresh policy across multiple adapters.

**Solution**

Split transport adapter concerns from activity projection concerns, then keep one deep sync module interface for callers.

**Benefits**

- locality: transport failures and projection bugs debug in one place each.
- leverage: callers consume one stable sync interface.
- testability: transport and projection can be tested independently.

**Before / After**

- Before: one module mixes transport implementation and projection implementation.
- After: one deep sync interface backed by distinct internal adapters.

**Dependencies / sequencing**

- Last in execution order.
- No ADR conflict; aligns with existing runtime/sync direction.

**Documentation follow-ups**

- Update Local Studio Sync notes in `docs/ARCHITECTURE.md`.
- Add backlog status to `docs/architecture/DEEPENING-ROADMAP.md`.

## Suggested execution order

1. Deepen `Studio Shell`.
2. Deepen `Studio Generation Session`.
3. Deepen `Recipe Module` and retire split registries.
4. Deepen `Local Generation Run` lifecycle ownership.
5. Finish `WorkerController` dependency seam (ADR-0014).
6. Deepen `Local Studio Sync` internal adapters.

This order minimizes churn: first reduce top-level orchestration spread, then stabilize generation seams, then finish backend seam hardening, and finally tighten sync internals.

## Documentation fan-out

- `docs/ARCHITECTURE.md`: refresh seam descriptions for Studio Shell, generation, recipe, worker, sync.
- `docs/TECHNICAL_DEBT.md`: keep execution queue aligned with accepted recommendations.
- `docs/architecture/DEEPENING-ROADMAP.md`: track sequencing and status.
- `docs/adr/`: only add/update ADR when a recommendation introduces a hard-to-reverse decision.
