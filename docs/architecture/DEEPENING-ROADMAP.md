# Architecture Deepening Roadmap

This roadmap tracks refactors that turn shallow modules into deeper modules with better locality, leverage, and testability. Related decisions live in `docs/adr/`.

## Concepts

- **Deep module**: a small interface that hides meaningful implementation complexity.
- **Shallow module**: a wide interface that leaks most of its implementation to callers.
- **Deepening**: reducing public surface area while moving policy and invariants behind a clearer owner.

## Accepted Review Batches

### 2026-05-29

- Finish `Studio Shell` deepening.
- Deepen `Studio Generation Session`.
- Split `Studio Settings` by operational domain.
- Finish `appFactory` route/dependency seams.
- Make `Local Studio Sync` refresh semantics explicit.
- Clarify `Local Generation Run` naming and provider neutrality.

### 2026-05-31

- Reduce shell fan-in/fan-out.
- Unify workspace lifecycle invariants.
- Retire flat settings compatibility surfaces.
- Deepen Command Center projection policy.
- Improve `createStudioApp` composition tests.
- Reduce overlay-domain translation.

### 2026-06-19

- Continue front-performance work.
- Keep heavy recipe, catalog, ZIP, Three.js, settings, diagnostics, and provider internals demand-mounted.
- Maintain chunk budgets and render-plan guards.

### 2026-06-21

- Continue runtime-storage UX hardening.
- Keep summary-first hot reads.
- Add typed catalog events and scoped Local Studio Sync invalidation.
- Add provider-neutral Job Trace Summary before expanding transcript retention.

### 2026-06-28

- Harden public library and persistent job intake boundaries.
- Keep reference persistence and public-asset serving behind explicit allowlists.
- Strengthen validation response shape and byte/count budgets.

### 2026-06-29

- Preserve Catalog Render Budget.
- Keep Catalog Card Action Surface lightweight by default.
- Keep route preloading budget-driven by route and explicit recipe intent.
- Keep Image Grid Geometry Budget in front of Catalog image priority and LCP discovery.
- Continue with Studio Animation Clock, CLS/reflow, and large-library grid windowing.

## Work Tracking

### 1. Deepen `Studio Shell` Orchestration

Move runtime wiring, page projection, overlay composition, queue summaries, and toolbar status behind focused controllers. Keep `useStudioShell.ts` as a facade.

Exit criteria:

- callers receive grouped domain surfaces, not flat implementation mirrors;
- shell policy has direct unit coverage;
- overlay and toolbar state do not recompute unrelated domains.

### 2. Deepen `Studio Generation Session`

Own queue execution semantics, terminal outcome mapping, and generation lifecycle in one seam.

Exit criteria:

- queue consumers do not duplicate lifecycle policy;
- retry/cancel/failure handling crosses a narrow interface;
- tests cover terminal transitions.

### 3. Move Recipe Behavior Out Of Static Registry

Keep `lib/recipeModules.ts` declarative. Put derived params, context builders, examples, and directives in tested helpers and registries.

Exit criteria:

- React surfaces collect parameters only;
- provider compilers consume task specs/directives;
- `recipes:verify` and `recipes:source:verify` stay green.

### 4. Deepen `Local Generation Run`

Keep provider-neutral lifecycle concepts and move provider-specific compilation/execution behind adapters.

Exit criteria:

- result materialization is catalog-first;
- Codex-specific behavior stays behind provider seams;
- local generation tests cover failure and terminal states.

### 5. Finish `WorkerController` Dependency Seam

Inject DB, logger, event bus, provider registry, worker lifecycle, and process/runtime dependencies through explicit factory inputs.

Exit criteria:

- backend route tests do not rely on hidden singletons;
- worker tests can use fake dependencies;
- public route behavior remains unchanged.

### 6. Deepen `Local Studio Sync` State Ownership

Give catalog, jobs, readiness, and connection events scoped invalidation rules.

Exit criteria:

- refresh reasons are typed;
- reconnect paths do bounded catch-up;
- UI avoids broad refetches for unrelated events.

### 7. Finish Catalog-First Cleanup

Keep Visual Batch as compatibility only. Durable truth is Catalog Entry.

Exit criteria:

- grid, export, trash, and workspace flows prefer Catalog Entry;
- legacy snapshot import/export stays explicitly named;
- `catalog:source:verify` blocks new Visual Batch dependencies.

### 8. Reorganize Style Preset Taxonomy And Anime Pack Topology

Keep style manifests granular, English, category-specific, and queryable.

Exit criteria:

- manifest taxonomy is persisted and English;
- runtime data is generated from granular manifests;
- legacy pack YAML stays retired.

### 9. Deepen `appFactory` Runtime Route Composition

Separate route dependencies, event streams, library serving, and app-server runtime wiring.

Exit criteria:

- route construction is testable with dependency overrides;
- app-server and library routes do not capture stale settings;
- failure paths have direct coverage.

## Recommended Order

1. Shell and generation-session seams.
2. Settings and Command Center domain surfaces.
3. App factory and worker dependency seams.
4. Local Studio Sync event semantics.
5. Catalog-first compatibility cleanup.
6. Style manifest taxonomy/runtime cleanup.

## Success Metrics

- Smaller public interfaces for shell, settings, sync, and generation modules.
- More tests at module seams, fewer broad UI-only assertions.
- Faster initial bundle and bounded render costs.
- Clear docs that match current code ownership.
- Release checks catch regressions before public users do.
