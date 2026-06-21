# Architecture review - Codex Studio front performance

Date: 2026-06-19

## Summary

- The current frontend friction is not one giant file. It is a set of shallow Modules where the Interface leaks pagination, refresh, terminal outcome, loading, and runtime freshness rules to callers.
- The highest-risk functional bug is the Browser Queue terminal outcome seam: failed or cancelled generation outcomes can resolve through the pipeline and be marked completed by the queue.
- The highest visible performance risk is the Image Catalog path: three Catalog Pages refresh together, only the first loaded page is actionable, and the grid has no render window.
- Demand-Mounted Surfaces improved bundle shape, but several surfaces still load data eagerly, fail with blank fallbacks, or mount heavy preview work too early.
- This review does not propose TypeScript interfaces yet. It names the Modules to deepen and the verification that should prove each recommendation.

## Recommendations

### 1. Fix Browser Queue terminal outcome ownership

**Recommendation strength**: Strong

**Files**

- `hooks/useGenerationPipeline.ts`
- `lib/queueStateMachine.ts`
- `hooks/useQueueManager.ts`
- `services/localGenerationRun.ts`

**Problem**

The Browser Queue Module is shallow. Its Interface receives execution as `Promise<void>`, so `queueStateMachine` treats any resolved run as completed. `useGenerationPipeline` handles failed and cancelled `LocalGenerationLifecycleOutcome` values by showing toast/log side effects and then returning. That means terminal state is carried by convention instead of crossing the queue seam.

Deletion test: deleting the queue state machine would not remove the terminal-state complexity. It would push failure/cancel/completed mapping back into `useQueueManager.ts` and generation callers.

**Solution**

Deepen the Browser Queue execution Module so generation terminal outcome crosses one seam and queue status mapping lives in one place. Non-completed outcomes should not be encoded as "resolved but side-effected" runs.

**Benefits**

- locality: failure/cancel/completed mapping changes in one Module.
- leverage: queued, forced, retried, and backend-linked jobs use the same terminal semantics.
- tests: one focused check can prove a failed generation becomes a failed queue item.

**Before / After**

- Before: generation reports failure as UI side effects, queue sees a resolved run.
- After: generation outcome reaches the queue Module, and the queue owns status mapping.

**Dependencies / sequencing**

- Do this first. It is a correctness bug, not only architecture debt.
- Unblocks safer queue concurrency and retry tests.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` for Browser Queue / Local Generation Run semantics.
- Update `docs/architecture/DEEPENING-ROADMAP.md` under Studio Generation Session.
- Add a task in the accepted workplan once this review is approved.

### 2. Deepen Catalog Page and Gallery so pagination is real

**Recommendation strength**: Strong

**Files**

- `hooks/useCatalog.ts`
- `hooks/useStudioGallery.ts`
- `components/studio/StudioGridSurface.tsx`
- `components/ImageGrid.tsx`
- `services/localStudioService.ts`
- `apps/local-server/src/catalogRoutes.ts`
- `apps/local-server/src/catalog.ts`

**Problem**

The Catalog Page Module exposes `hasMore`, `loadMore`, `isLoading`, and `error`, but the gallery path consumes only materialized images. The grid never calls `loadMore`, so a workspace with more than 200 Catalog Entries is truncated. Bulk actions such as clear workspace, restore all trash, and empty trash operate on loaded entries, not the full matching Catalog Entry scope.

Deletion test: deleting `useCatalog` would not remove this complexity; every caller would need to rediscover page status, loaded-entry scope, and refresh choreography.

**Solution**

Deepen the catalog read Module and separate full-scope catalog commands from loaded page state. The grid should receive status, retry/load-more behavior, and an honest "partial page" state instead of a flat image list. Bulk mutations should run by catalog filter on the backend or through a dedicated command Module, not by iterating the currently loaded page.

**Benefits**

- locality: pagination and mutation scope live in catalog Modules instead of grid callers.
- leverage: Image Grid, trash, workspace strip, and dashboard counts can share one truthful Catalog Entry model.
- tests: seed 201+ entries and prove load-more and bulk commands affect the intended scope.

**Before / After**

- Before: first page looks like the whole workspace; errors and loading collapse into empty UI.
- After: page state, loading, errors, and full-scope commands are explicit at the catalog seam.

**Dependencies / sequencing**

- Do after recommendation 1, before grid virtualization.
- Backend bulk commands should land before UI bulk-action polish.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` for Image Catalog and Catalog Page behavior.
- Update `docs/TECHNICAL_DEBT.md` catalog-first migration notes.
- Cross-link any accepted backend command decision from this findings document.

### 3. Give Local Studio Sync one runtime event ownership seam

**Recommendation strength**: Strong

**Files**

- `services/studioEventSource.ts`
- `hooks/useLocalStudioSync.ts`
- `services/localGenerationRun.ts`
- `hooks/localStudioSyncRefreshPolicy.ts`

**Problem**

`StudioEventStream` is reusable, but runtime ownership is split. The shell opens one `EventSource`; each Local Generation Run opens another stream; `watchJob()` also catches up by listing all jobs. Asset events trigger a broad backend refresh, then a broad catalog refresh. The transport adapter has useful implementation, but the product-level Local Studio Sync Module is not deep enough.

Deletion test: deleting `studioEventSource.ts` would push raw event wiring into multiple callers. Deleting only `useLocalStudioSync.ts` would still leave generation with its own stream and catch-up behavior.

**Solution**

Deepen Local Studio Sync so one Module owns the live event adapter, job waiting, connection state, and catalog invalidation. Generation should wait for jobs through that seam instead of opening a second runtime stream.

**Benefits**

- locality: reconnect, backpressure, job catch-up, and asset invalidation change together.
- leverage: shell activity, queue, generation, and catalog refresh share one event session.
- tests: one probe can count `EventSource` instances during queued jobs and prove expected refresh scope.

**Before / After**

- Before: event transport is shared by type but duplicated at runtime.
- After: Local Studio Sync owns the event session and exposes job/catolog effects through one seam.

**Dependencies / sequencing**

- Do after recommendation 1 because queue outcome semantics define what job waiting must return.
- Then narrow catalog invalidation from recommendation 2.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` for Local Studio Sync.
- Update ADR-0006 only if the accepted work changes SSE ownership semantics.

### 4. Align Demand-Mounted Surface behavior with data loading and errors

**Recommendation strength**: Strong

**Files**

- `components/AppContent.tsx`
- `components/shell/StudioViewport.tsx`
- `components/overlays/StudioSystemOverlays.tsx`
- `components/overlays/StudioImageOverlays.tsx`
- `hooks/useStudioSettings.ts`
- `hooks/useStudioShell.ts`

**Problem**

Demand-Mounted Surfaces are lazy-loaded, but several use `fallback={null}` and have no visible failure state. Settings UI is demand-mounted, but `useStudioSettings` eagerly fetches settings, output sources, provider capabilities, and preflight at shell startup. Preview overlays lazy-load `AppOverlays`, then pull `ImageCarousel` into that chunk and map all thumbnails when opened.

Deletion test: deleting the lazy wrappers would worsen startup, but deleting the settings/preview adapters would reveal that data loading and heavy render work are not owned by the visible surface.

**Solution**

Keep the demand-mounted decision from ADR-0028, but deepen each surface so mounting, loading, error/retry, focus restore, and data freshness belong to the surface Module. The Command Center should read only a small settings/provider summary until the full Settings surface opens.

**Benefits**

- locality: each surface owns its loading and failure behavior.
- leverage: blank lazy gaps and eager settings fetches are fixed once at the Demand-Mounted Surface seam.
- tests: throttled chunks and failed dynamic imports can be verified through one surface harness.

**Before / After**

- Before: lower startup bundle, but blank fallbacks and eager settings data.
- After: lower startup bundle plus honest loading/error UI and on-open data fetches.

**Dependencies / sequencing**

- Do after recommendation 3 if settings/catalog invalidation will use the shared runtime event seam.
- Preview thumbnail windowing can follow the first visible-loading pass.

**Documentation follow-ups**

- Update ADR-0028 with implementation status if accepted.
- Update `docs/ARCHITECTURE.md` Demand-Mounted Surface notes.

### 5. Reduce Studio Shell high-churn surfaces

**Recommendation strength**: Strong

**Files**

- `contexts/GenerationContext.tsx`
- `hooks/useStudioShell.ts`
- `lib/buildStudioPageController.ts`
- `hooks/useStudioOverlayController.ts`
- `lib/buildStudioHeaderToolbarProps.ts`

**Problem**

`GenerationContext` exposes config, pipeline, recipe, UI chrome, and modal state through one Interface. `useStudioShell.ts` consumes nearly all of it, then rebuilds overlay, page, viewport, dock, and header props with very large dependency arrays. The current Studio Shell Module has more depth than before, but it still has high-churn wiring where prompt typing, modal state, catalog state, queue state, and runtime state can invalidate broad shell projections.

Deletion test: deleting `useStudioShell.ts` would push complexity back into `AppContent.tsx`; the Module earns its keep, but its Interface still exposes too much implementation detail from child Modules.

**Solution**

Deepen the Studio Shell policy around lower-churn selectors: generation config, execution session, modal session, and shell chrome should cross narrower seams. Page and overlay controllers should stay close to the surfaces that consume them when that improves locality.

**Benefits**

- locality: shell-specific invariants stop moving with unrelated generation or modal details.
- leverage: fewer callers learn the full generation implementation shape.
- tests: React Profiler checks can prove prompt typing does not rerender unrelated header, overlay, or grid surfaces.

**Before / After**

- Before: one shell hook assembles nearly every renderable surface.
- After: the shell remains the Studio Shell, but broad cross-domain churn is cut down.

**Dependencies / sequencing**

- Do after recommendations 1-4 clarify queue, sync, catalog, and settings seams.
- Keep this as a sequence of small prefactors, not a rewrite.

**Documentation follow-ups**

- Update `docs/architecture/DEEPENING-ROADMAP.md` item 10.
- Update `docs/TECHNICAL_DEBT.md` once exit criteria are sharper.

### 6. Make Command Center commands capability-aware and responsive

**Recommendation strength**: Strong

**Files**

- `components/HeaderToolbar.tsx`
- `components/ui/TopToolbar.tsx`
- `lib/buildStudioHeaderToolbarProps.ts`
- `components/DashboardModal.tsx`
- `components/RightSystemPanel.tsx`
- `hooks/useStudioShell.ts`

**Problem**

The Command Center decision is accepted, but the current Module is not deep enough. `TopToolbar` is a visual wrapper, while `HeaderToolbar` owns navigation, runtime, provider, queue, trash, help, workspace, and settings presentation. Several critical commands are hidden behind `xl:flex`, so queue/settings/runtime access can disappear below XL. Dashboard/system surfaces also expose commands such as snapshot recovery through no-op or compatibility-only behavior.

Deletion test: deleting `HeaderToolbar` would scatter command behavior across surfaces. The seam is real, but its Interface is still mixed with visual details and incomplete capability state.

**Solution**

Deepen Command Center command projection so commands know whether they are enabled, disabled with reason, compatibility-only, or hidden. Add a responsive command adapter so essential actions remain reachable below XL. Move no-op commands out of visible surfaces until they have real behavior or a disabled reason.

**Benefits**

- locality: command reachability and capability rules live in one Module.
- leverage: header, dashboard, and system panels present the same command truth.
- tests: viewport checks can prove settings, queue, runtime, and diagnostics remain reachable.

**Before / After**

- Before: command layout hides essential actions and some visible actions do nothing.
- After: commands are reachable, honest, and routed through one projection seam.

**Dependencies / sequencing**

- Can run in parallel with recommendation 4 after settings summary is separated.
- Should not wait for full shell deepening.

**Documentation follow-ups**

- Update ADR-0024 implementation notes if accepted.
- Update `docs/DESIGN.md` interaction guidance for command reachability.

### 7. Split Style Browser session from style application behavior

**Recommendation strength**: Strong

**Files**

- `components/recipes/StylesRecipe.tsx`
- `components/recipes/styleBrowserRenderPlan.ts`
- `components/recipes/styleGridVirtualization.ts`
- `components/recipes/stylesData.ts`
- `lib/recipeModules.ts`

**Problem**

The Style Browser is optimized in chunks, but `StylesRecipe.tsx` still mixes pack loading, favorites, search, viewport mounting, hover previews, prompt construction, and generation parameter assembly. It also performs render-phase state updates when image counts, filter keys, or recipe preset ids change. The preset visual state path scans generated images per visible preset, which can become `presets x images` work.

Deletion test: deleting `StylesRecipe.tsx` would scatter style session state, render policy, and style application semantics across recipe callers. The Module is doing real work, but the Interface is too close to the implementation.

**Solution**

Deepen a Style Browser Session Module for pack/search/favorites/loading/render-plan state, and a separate Style Application Module for transforming a selected Style Preset Manifest into generation params. Move render-phase state changes to effects or event handlers.

**Benefits**

- locality: style browsing bugs do not require editing generation prompt behavior.
- leverage: style application can be tested without mounting the React surface.
- tests: StrictMode/render warnings, failed pack load states, and style params can be checked directly.

**Before / After**

- Before: one React surface owns browser state and workflow semantics.
- After: React collects choices; deeper Modules own style session and style application behavior.

**Dependencies / sequencing**

- Do after recommendation 2 if catalog/grid work changes image result lookup.
- Keep existing render budget scripts; add a focused render-phase regression check.

**Documentation follow-ups**

- Update `SKILLS.md` Style Preset workflow only after the accepted Module shape is implemented.
- Update `docs/ARCHITECTURE.md` Recipe Module / Style Preset sections.

### 8. Put Composer and Browser Queue persistence on a payload budget

**Recommendation strength**: Worth exploring

**Files**

- `hooks/useGenerationConfig.ts`
- `hooks/useIndexedDBStorage.ts`
- `hooks/useQueueManager.ts`
- `lib/browserQueuePersistence.ts`
- `utils/idb.ts`

**Problem**

The composer persists `generation-config` in IndexedDB, including attachment `dataUrl` values. The Browser Queue persists up to 100 Queue Jobs, each with cloned config attachments. This is useful recovery behavior, but the Interface has no byte budget, expiry, or Local Asset reference path. Large pasted references can turn a convenience cache into startup and storage cost.

Deletion test: deleting IndexedDB persistence would remove recovery behavior, but every caller would need a replacement for drafts and pending queue jobs. The Module should stay, but with a deeper persistence policy.

**Solution**

Deepen browser persistence with an explicit payload budget and recovery policy. Store large references as managed Local Asset refs when possible, or drop/expire oversized transient data with an honest recovery message.

**Benefits**

- locality: storage limits and recovery behavior live in persistence Modules.
- leverage: composer, queue, and reset flows share one persistence contract.
- tests: payload-size fixtures can prove large references do not make startup unbounded.

**Before / After**

- Before: persisted convenience data can include large base64 assets.
- After: persistence has a visible ceiling and a clear upgrade path for managed assets.

**Dependencies / sequencing**

- Do after recommendation 1 because queue terminal outcomes affect persisted queue state.
- Can be done before broad shell work.

**Documentation follow-ups**

- Update `docs/TECHNICAL_DEBT.md` local storage notes.
- Update reset/recovery docs if the accepted behavior changes user-visible recovery.

### 9. Consolidate Studio Readiness and Codex model freshness

**Recommendation strength**: Worth exploring

**Files**

- `hooks/useStudioRuntime.ts`
- `hooks/useStudioDiagnostics.ts`
- `hooks/useStudioOnboarding.ts`
- `hooks/useStudioSessionVerifier.ts`
- `hooks/useGenerationConfig.ts`
- `components/Toolbar.tsx`

**Problem**

Studio Readiness is derived in one place, but data freshness is owned by several Modules. Diagnostics polls health/session, onboarding owns another health state, session verification fetches health/session again, and `refreshRuntime()` can run overlapping health reads. Codex model catalog reads are duplicated by `useGenerationConfig` and `Toolbar`.

Deletion test: deleting any one fetch owner does not remove readiness complexity; it only hides part of freshness or fallback behavior.

**Solution**

Deepen a Studio Readiness data Module that owns cached health/session/model freshness, refresh reasons, and fallback status. Onboarding, diagnostics, session verification, generation config, and toolbar should adapt that state instead of fetching independently.

**Benefits**

- locality: runtime freshness and fallback policy change in one Module.
- leverage: Command Center, onboarding, and toolbar share the same readiness truth.
- tests: mocked request counters can prove expected request counts on mount and refresh.

**Before / After**

- Before: multiple hooks fetch overlapping runtime facts.
- After: one readiness data seam owns freshness; UI Modules consume projections.

**Dependencies / sequencing**

- Do after recommendation 4 separates settings summary from full settings load.
- Keep polling conservative; do not add a broad cache until request duplication is measured.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` Studio Readiness.
- Consider ADR update only if readiness ownership changes a hard product decision.

### 10. Close source-audit temp-file hygiene before trusting Styles gates

**Recommendation strength**: Strong

**Files**

- `scripts/generate-style-runtime-data.ts`
- `scripts/style-authoring-source-audit.ts`
- `lib/staleStyleDefaultImages.generated.check.*.tmp.ts`
- `lib/styleDefaultImages.generated.check.*.tmp.ts`
- `components/recipes/styleRuntimeData.generated.check.*.tmp.ts`

**Problem**

Generated check temp files exist in the working tree filesystem. They are ignored by git, but `style-authoring-source-audit.ts` scans the filesystem and treats generated temp files as failures. They also distort file-size exploration and make broad audits noisy.

Deletion test: deleting the temp files cleans the symptom, but the source-audit and check-generation Modules still need a reliable cleanup or temp-location policy.

**Solution**

Deepen the runtime-check Module so check files are written to a real temp area or cleaned reliably even when verification fails. Keep the source audit strict, but make the check command responsible for not leaving repo-local temp source files behind.

**Benefits**

- locality: generated check-file cleanup belongs to the generator Module.
- leverage: `styles:verify`, `validate:full`, and architecture audits stop tripping over leftover temp files.
- tests: a forced failing check can prove temp files are removed or isolated.

**Before / After**

- Before: ignored temp source files remain under repo source folders.
- After: checks leave no source-tree temp files for audits to scan.

**Dependencies / sequencing**

- Do before relying on `styles:verify` as a signal for current style work.
- Safe as a small maintenance slice, independent of UI refactors.

**Documentation follow-ups**

- Update `SKILLS.md` only if the command usage changes.
- Add a note to `docs/TECHNICAL_DEBT.md` if cleanup cannot be automatic.

## Suggested execution order

1. Fix Browser Queue terminal outcome ownership. This is the most direct correctness bug.
2. Deepen Catalog Page / Gallery pagination and full-scope catalog commands. This fixes visible truncation and unsafe partial bulk actions.
3. Give Local Studio Sync one runtime event ownership seam. This reduces stream duplication and makes catalog invalidation smaller.
4. Align Demand-Mounted Surface behavior with data loading and errors. This protects startup performance and removes blank UI states.
5. Make Command Center commands capability-aware and responsive. This fixes reachable functionality without waiting for a shell rewrite.
6. Reduce Studio Shell high-churn surfaces. Do this after the main data/runtime seams are narrower.
7. Split Style Browser session from style application behavior. This is large, but can be sliced around render-phase updates first.
8. Put Composer and Browser Queue persistence on a payload budget. This is a contained storage/performance safety pass.
9. Consolidate Studio Readiness and Codex model freshness. Measure duplicate requests first, then deepen only the pieces that pay back.
10. Close source-audit temp-file hygiene. This can happen anytime before using Styles gates for release confidence.

## Implementation progress

2026-06-19:

- Done: Browser Queue execution now receives an explicit `GenerationExecutionOutcome`, so resolved `failed` and `cancelled` generation outcomes no longer become completed queue jobs.
- Done: Styles runtime check files now live under the OS temp directory and are removed as one temp tree. Existing repo-local generated check temp files were removed.
- Partial: Catalog Page state now reaches the Image Grid (`total`, `hasMore`, loading, error, load more). Partial-catalog bulk actions that would only affect the loaded page are hidden until all entries are loaded.
- Partial: Command Center runtime, queue, and settings commands remain reachable below `xl` as compact controls. Provider text remains width-gated because Settings is the canonical small-width entry.
- Partial: Browser Queue and Composer IndexedDB recovery now have a 512 KB inline-attachment budget. Oversized queued references restore as failed queue items; oversized composer references are not persisted.
- New debt found: current broad `check` and `build` are blocked by unrelated style manifest/asset work in the dirty worktree. `build` still fails on generated imports for missing `SP15-*` default images; `check` still fails on pack_17 formatting.
- Partial: Local Studio Sync and Local Generation Run now share one browser SSE connection through ref-counted stream leases. Generation still waits through `watchJob()` rather than a full Local Studio Sync job-waiting seam.
- Partial: Demand-Mounted Surfaces now have visible loading/error states, and Settings startup only reads the lightweight Studio Settings summary. Provider preflight and External Output Sources refresh when Settings opens.
- Partial: Studio Readiness/model freshness was narrowed by making `useGenerationConfig()` the single Codex model catalog owner; `Toolbar` now consumes the catalog through props instead of fetching it again.
- Partial: Studio Shell churn was reduced by memoizing `useStudioSettings()` domain surfaces and removing dead operations-rail props from the page-controller seam.
- Done: Dashboard no-op commands were removed. The visible dashboard no longer exposes recover/settings actions without real behavior.
- Done: `runSingleCodexImagegenJob()` now closes only streams it owns, while injected shared streams remain open for their owner.
- Done: Image Carousel thumbnails are render-windowed around the active image instead of mounting every workspace thumbnail.
- Done: Queue rail close/toggle behavior is now visually reachable, and the mobile queue rail renders as a full-width overlay instead of squeezing the catalog. The bottom composer wraps into stable mobile rows; Playwright visual checks confirmed no footer element overlap and no horizontal overflow at 390 px, 820 px, and 1440 px.

## Documentation fan-out if accepted

- `docs/ARCHITECTURE.md`: update Studio Shell, Local Studio Sync, Studio Readiness, Image Catalog, Command Center, and Demand-Mounted Surface sections.
- `docs/architecture/DEEPENING-ROADMAP.md`: add accepted recommendations as active work items and set this file as the current findings index.
- `docs/TECHNICAL_DEBT.md`: replace stale frontend debt with this ordered queue.
- `docs/DESIGN.md`: add command reachability and non-blank demand-mounted loading expectations.
- `SKILLS.md`: update only after accepted implementation changes alter style or validation workflow commands.
- `docs/adr/`: reopen ADR-0024 or ADR-0028 only if accepted work changes those decisions rather than implementation status.
