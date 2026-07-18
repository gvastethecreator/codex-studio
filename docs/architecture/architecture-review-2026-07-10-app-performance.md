# Architecture review — Codex Studio performance and general app seams

Resolution note: the [2026-07-18 simplification](./simplification-2026-07-18.md) removes the Browser Queue reconciliation described in this historical review and makes Persistent Jobs the only live queue model.

Date: 2026-07-10

Acceptance status: Accepted on 2026-07-10 for full implementation

## Summary

- Startup had two concrete pressure points: the main UI entry was 499.97 KiB and the shell fetched a redundant 200-entry catalog page measuring 4,002,045 bytes on the current Studio Library.
- The first reversible slice is implemented: the main entry is 455.50 KiB, generation execution is demand-loaded, the redundant catalog page is gone, workspace aggregation is indexed, and Settings hydration no longer repeats while the surface remains open.
- Remaining friction is architectural. Readiness, catalog detail, queue truth, event recovery, shell detail hydration, and style thumbnail discovery still leak implementation across their seams.
- The existing Animation Sequence review remains separate. This review does not accept or duplicate its pending recommendations.

## Implemented performance slice

- `components/AppContent.tsx` demand-loads `StudioGenerationDock`; its chunk is 34.02 KiB and the main entry fell from 499.97 KiB to 460.79 KiB.
- `hooks/useGenerationPipeline.ts` demand-loads `localGenerationRun` on first execution; the final main entry is 455.86 KiB and the new runner chunk is 4.84 KiB.
- `hooks/useCatalog.ts` no longer fetches an all-workspace 200-entry Catalog Page. The removed request measured 4,002,045 bytes because historical prompts dominated the response.
- `apps/local-server/src/catalog.ts` aggregates workspace facts without ranking full prompt rows, and `apps/local-server/src/db.ts` adds a covering index for the aggregate and latest-image lookup. The current 5,487-row Studio Library returns the same 27,197-byte HTTP projection in 6.1–9.8 ms after warmup, down from the 2.3–2.6 second baseline.
- `hooks/useSettingsSurface.ts` hydrates from the stable refresh command. Browser verification observed exactly one request each for Settings, output sources, providers, and provider preflight per open.
- `components/AppContent.tsx` mounts the `AppOverlays` graph only while an image, editor, system, Trash, or confirmation surface is active.
- `scripts/report-ui-chunks.ts` now guards the generation dock, generation runner, and Vite's decimal 500,000-byte startup threshold.

## Recommendations

### 1. Deepen Studio Readiness into one lifecycle module

**Recommendation strength**: Very strong

**Files**

- `hooks/useStudioRuntime.ts`
- `hooks/useStudioOnboarding.ts`
- `hooks/useStudioDiagnostics.ts`
- `hooks/useStudioSessionVerifier.ts`
- `apps/local-server/src/runtimeRoutes.ts`
- `apps/local-server/src/codexRuntimeDoctor.ts`
- `apps/local-server/src/init.ts`

**Problem**

Studio Readiness is reconstructed by several frontend hooks while the backend `/api/health` route may run synchronous Codex Runtime Doctor probes. Forced probes measured 1.74–2.68 seconds and block the Bun event loop. Frontend callers can hold separate health, session, diagnostics, and onboarding snapshots, so refresh ordering leaks across the seam.

**Solution**

Deepen Studio Readiness into one backend lifecycle module with an asynchronous single-flight refresh and one cached snapshot carrying age and refresh state. Deepen the frontend runtime module so onboarding, diagnostics, session verification, and manual refresh consume one readiness projection instead of coordinating independent copies.

**Benefits**

- locality: capability probing, cache age, refresh ownership, and teardown concentrate in one module
- leverage: one interface serves startup, Command Center, onboarding, job intake, and diagnostics
- depth: callers read readiness intent while the implementation absorbs slow probes and refresh deduplication

**Before / After**

Before, health and session callers can independently trigger or mirror runtime work. After, one lifecycle module publishes the latest readiness projection and refresh state.

**Dependencies / sequencing**

- First structural recommendation because event-loop stalls affect every backend route.
- Preserve `/api/runtime/doctor` as the explicit deep diagnostic path.
- Keep Provider Secret values outside the snapshot.

**Documentation follow-ups**

- Sharpen **Studio Readiness** and **App-Server Lifecycle** in `CONTEXT.md` if accepted.
- Add an ADR only if health changes from refresh-on-read to stale-while-refresh.
- Track backend and frontend migration in `docs/architecture/WORKPLAN.md`.

### 2. Deepen the Catalog Read Model

**Recommendation strength**: Very strong

**Files**

- `packages/shared/src/types.ts`
- `apps/local-server/src/catalog.ts`
- `apps/local-server/src/catalogRoutes.ts`
- `hooks/useCatalog.ts`
- `hooks/useWorkspaceStrip.ts`
- `lib/studioCatalogImageAdapter.ts`

**Problem**

The current `CatalogImageSummary` only removes `generationConfig`; it still carries full prompt and negative-prompt text and performs synchronous filesystem probes per row. On the measured historical page, prompt text accounted for about 94% of a multi-megabyte response. Trash entries also load before the Trash surface opens, and catalog mutations fan out refreshes across independent reads.

**Solution**

Deepen the Catalog Read Model into explicit hot summary, workspace summary, and on-demand detail projections. Keep short display text and persisted availability state in hot reads; load full prompt, generation config, and repair diagnostics through the existing detail route. Demand-mount Trash entries and keep scoped invalidation behind the catalog seam.

**Benefits**

- locality: projection policy and payload budgets concentrate in one module
- leverage: one compact interface serves grid, workspace strip, queue previews, and Command Center counts
- interface shrinks; implementation absorbs prompt detail, existence state, and refresh scope

**Before / After**

The first slice removed the redundant all-workspace page without moving complexity to callers. The remaining slice turns the current large summary into a genuinely compact projection with detail loaded by intent.

**Dependencies / sequencing**

- Follow Studio Readiness or proceed independently on the backend projection.
- Preserve Catalog Entry as durable image truth.
- Add compatibility coverage before changing prompt fields consumed by gallery restore/export paths.

**Documentation follow-ups**

- Sharpen **Catalog Page** and add **Catalog Detail** only if the new projection is accepted.
- Track consumer migration and payload budgets in `docs/architecture/WORKPLAN.md`.

### 3. Make shell detail hydration genuinely demand-mounted

**Recommendation strength**: Strong

**Files**

- `components/AppContent.tsx`
- `components/AppOverlays.tsx`
- `components/overlays/StudioSystemOverlays.tsx`
- `hooks/useStudioSettings.ts`
- `hooks/useSettingsSurface.ts`
- `hooks/useLocalStudioSync.ts`
- `hooks/useStudioShell.ts`

**Problem**

The root overlay graph is now gated by visible state, but several controllers and data reads remain shell-owned. Structured logs load before the debug surface is visible, Trash entries load before Trash opens, and the Settings controller remains mounted for the full app lifetime. Before the root guard, the closed overlay graph measured about 30.6 KiB raw and 10.6 KiB gzip.

**Solution**

Deepen each Demand-Mounted Surface so its controller, hydration, and heavy implementation mount together. Keep only compact Command Center summaries in the shell and pass commands that open the deeper module.

**Benefits**

- locality: detail state and fetch policy live with the surface that consumes them
- leverage: the shell interface becomes status plus commands instead of every detail domain
- depth: one visible-surface interface hides data hydration and optional implementation

**Before / After**

Before, lazy rendering still pays controller and request costs. After, closed Settings, diagnostics, Trash, and overlay surfaces contribute neither hydration nor heavy module work.

**Dependencies / sequencing**

- The stable Settings refresh dependency is already landed as a guard.
- Move one surface at a time and preserve Command Center status.
- Verify first-run onboarding because it legitimately needs an overlay at startup.

**Documentation follow-ups**

- Sharpen **Demand-Mounted Surface** in `CONTEXT.md` if controller ownership becomes part of the term.
- Add surface-by-surface tasks to `docs/architecture/WORKPLAN.md`.

### 4. Give the Studio Event Stream durable ordering and backpressure

**Recommendation strength**: Strong

**Files**

- `apps/local-server/src/events.ts`
- `apps/local-server/src/eventStreamRoutes.ts`
- `services/studioEventSource.ts`
- `hooks/localStudioSyncRefreshPolicy.ts`
- `hooks/useLocalStudioSync.ts`

**Problem**

Backend events are process-memory-only, carry no monotonic identifier, and write to SSE clients without a serialized bounded queue. Reconnects cannot request missed events, slow clients have no explicit backpressure, and the frontend compensates with repeated snapshot refreshes.

**Solution**

Deepen the event module around monotonic revisions, compact invalidation events, bounded per-connection writes, and snapshot reconciliation. Add replay only if persisted revisions prove necessary; do not turn every full record into an event payload.

**Benefits**

- locality: ordering, reconnect, and backpressure policy concentrate in one module
- leverage: one interface serves jobs, logs, catalog invalidation, and future workflow runs
- depth: subscribers consume ordered state change while implementation absorbs transport recovery

**Before / After**

Before, reconnect correctness depends on broad refetch timing. After, the client knows whether it is current and requests one scoped snapshot when it is not.

**Dependencies / sequencing**

- Design after the readiness lifecycle so backend liveness has one owner.
- Implement before removing browser queue reconciliation.
- Preserve the existing shared/ref-counted frontend EventSource adapter.

**Documentation follow-ups**

- Add **Studio Event Revision** to `CONTEXT.md` only if accepted.
- Record persistence/replay trade-offs in an ADR if durable event storage is chosen.
- Track transport and reconciliation tests in `docs/architecture/WORKPLAN.md`.

### 5. Make Persistent Jobs the only queue truth

**Recommendation strength**: Very strong

**Files**

- `hooks/useQueueManager.ts`
- `lib/browserQueueBackendSync.ts`
- `services/localGenerationRun.ts`
- `apps/local-server/src/persistentJobIntake.ts`
- `hooks/useStudioShell.ts`

**Problem**

The frontend persists `QueueJob` state in IndexedDB, links it to backend job ids, reconciles two status models, and separately counts unlinked Persistent Jobs. Pending browser work is not durable backend truth until execution begins, so recovery and cancellation policy leak across the seam.

**Solution**

Deepen Persistent Job Intake so a complete user run is durable before execution. Project queue groups and progress from Persistent Jobs and Catalog Entries, then retire browser queue reconciliation as a source of truth.

**Benefits**

- locality: enqueue, retry, cancellation, recovery, and progress concentrate in one module
- leverage: one interface serves queue UI, refresh recovery, automation, and workflow recipes
- deletion test: removing browser reconciliation should remove complexity rather than scatter it

**Before / After**

Before, a queue item has browser and backend lifecycles. After, the browser renders one durable backend lifecycle and keeps only presentation state.

**Dependencies / sequencing**

- Follow the Studio Event Stream recommendation so updates have a reliable reconciliation path.
- Preserve provider-independent Generation Tasks.
- Migrate one queue action at a time with refresh-recovery tests.

**Documentation follow-ups**

- Sharpen **Persistent Job Intake** and **Shell Activity Job** in `CONTEXT.md` if accepted.
- Add an ADR for the browser-queue retirement and migration strategy.
- Track compatibility removal in `docs/architecture/WORKPLAN.md`.

### 6. Replace per-thumbnail dynamic modules with pack-scoped thumbnail projections

**Recommendation strength**: Strong

**Files**

- `lib/styleThumbnailCatalog.ts`
- `lib/styleDefaultImages.generated.ts`
- `components/recipes/stylesData.ts`
- `scripts/generate-style-runtime-data.ts`
- `scripts/report-ui-chunks.ts`

**Problem**

The style thumbnail glob creates roughly 2,280 tiny JavaScript chunks. The measured build contains 2,524 JavaScript chunks even though the thumbnail loader function has no active callers. Replacing it with one eager monolith would move too much style data into the route, so the current interface is shallow in the opposite direction: one module per asset.

**Solution**

Generate pack-scoped thumbnail URL projections and load only the active pack projection. Keep image files as assets, not executable modules, and add chunk-count plus tiny-chunk budgets to the build report.

**Benefits**

- locality: thumbnail discovery and generated references concentrate per style pack
- leverage: one pack interface serves many thumbnails without thousands of module requests
- depth: the interface exposes asset URLs while implementation absorbs manifest generation and pack loading

**Before / After**

Before, asset discovery expands into thousands of micro-modules. After, an active pack loads one compact URL projection and the browser requests only visible image assets.

**Dependencies / sequencing**

- Independent of runtime and queue work.
- Keep it after the higher-risk lifecycle decisions unless packaging/file-count becomes the release blocker.
- Preserve existing style runtime and source-audit guards.

**Documentation follow-ups**

- Add **Style Thumbnail Projection** to `CONTEXT.md` only if accepted.
- Add JS chunk-count and tiny-chunk targets to `SKILLS.md` and `docs/architecture/WORKPLAN.md`.

## Suggested execution order

1. Deepen Studio Readiness — removes synchronous event-loop stalls and duplicate snapshot ownership.
2. Deepen the Catalog Read Model — builds on the landed read-path slice and removes the largest remaining payload waste.
3. Make shell detail hydration demand-mounted — reduces startup requests and shell ownership incrementally.
4. Give the Studio Event Stream durable ordering and backpressure — establishes reliable reconciliation.
5. Make Persistent Jobs the only queue truth — removes the dual queue lifecycle after event recovery is dependable.
6. Replace per-thumbnail modules with pack-scoped projections — large packaging win, independent implementation lane.

## Preserved strengths

- Route surfaces already use explicit lazy imports and intent/idle preload budgets.
- Three.js and JSZip remain demand-loaded behind measured chunk budgets.
- `services/studioEventSource.ts` is a deep shared/ref-counted client adapter; the missing depth is on backend ordering and recovery.
- Provider Boundary and Persistent Job Intake keep Generation Task separate from Generation Provider.
- `apps/local-server/src/appFactory.ts` remains a useful composition root and does not need another pass-through module.

## Documentation fan-out after acceptance

- `CONTEXT.md`: add or sharpen only accepted domain terms.
- `docs/adr/*.md`: record stale-while-refresh readiness, durable event replay, and browser queue retirement only when accepted.
- `docs/architecture/WORKPLAN.md`: create the shared execution tracker and link back to this review.
- `SKILLS.md`: add finalized performance budgets and workflow checks after their modules exist.
