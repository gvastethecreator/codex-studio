# Performance and fluidity architecture review - 2026-06-29

Status: first slice implemented; remaining candidates queued.

Scope: performance and perceived fluidity without removing animation quality. This pass used `improve`, `improve-codebase-architecture`, `technical-debt-audit`, and repo-local measurement. Chrome DevTools MCP was configured in the Codex host, but native DevTools tools were not callable in this thread after restart, so measurements used Playwright plus browser DOM/performance probes.

## Sources read

- Required repo context: `CONTEXT.md`, `docs/ARCHITECTURE.md`, `docs/TECHNICAL_DEBT.md`, `docs/active/professionalization-roadmap.md`, recent ADRs through `docs/adr/0033-public-library-and-job-intake-boundaries.md`, and `docs/DESIGN.md`.
- Performance surfaces: `hooks/useCatalog.ts`, `components/ImageGrid.tsx`, `components/ui/ActionButton.tsx`, `components/Tooltip.tsx`, `components/shell/StudioViewport.tsx`, `components/RecipeRouter.tsx`, `components/HeaderToolbar.tsx`, `components/Toolbar.tsx`, `components/QueuePanel.tsx`, `components/recipes/StylesRecipe.tsx`, `hooks/useLocalStudioSync.ts`, and `services/studioEventSource.ts`.
- Verification references: `scripts/report-ui-chunks.ts`, `scripts/report-style-render-budget.ts`, `scripts/verify-styles-browser-gate.ts`, `scripts/catalog-first-source-audit.test.ts`.

## Measurements

Baseline probe before the catalog slice saw Home mounting roughly `12,136` DOM nodes, `1,646` buttons, `3,906` JS listeners, and multiple long tasks. The highest-leverage local cause was the active catalog loading a 200-entry page and each `ImageGrid` card mounting the full secondary command chrome.

After the first slice:

- Desktop Home after onboarding closed: `48` masonry items, about `2,007` DOM nodes, `252` buttons, `122` tooltip nodes, and no console/page errors in the focused probe.
- Desktop hover/focus on first card: secondary actions mount from `6` to `12` total action buttons, and the card rect stays stable (`165.328125 x 110.109375` before and after hover).
- Mobile 390px: `48` masonry items, about `4,258` DOM nodes, `534` buttons, and actions remain mounted for touch access.

The improvement is real, but subagent probes still found long tasks and eager recipe/style assets after Home. This review therefore treats the catalog slice as the first accepted cut, not the whole performance story.

## Subagent agreement

- Strict Module lens: page size alone is not enough; the durable Interface should budget DOM/buttons/tooltips and avoid linear hidden chrome.
- UX/motion lens: keep image preview, selection, favorite, view transitions, and transform/opacity motion. Move secondary/destructive actions behind intent instead of removing animation polish.
- Runtime lens: after the catalog cut, remaining jank likely comes from recipe preloading, style result rescans, broad shell projections, and high-frequency React timers.

## Candidate 1 - Catalog Render Budget Module

**Files** - `lib/catalogRenderBudget.ts`, `hooks/useCatalog.ts`, `lib/catalogRenderBudget.test.ts`.

**Problem** - Active, workspace, and trash catalog reads used the same default page size. That made the hot Home grid pay for a summary-sized page even when only the active grid needed to render.

**Solution** - Add a `Catalog Render Budget` Module that owns per-surface page budgets: active grid `48`, workspace summary `200`, trash `80`, queue previews `24`.

**Benefits** - Leverage: callers get one small Interface for render budgets instead of knowing magic numbers. Locality: future page-size tuning happens in one Module and one test.

**Before / After** - Before: `useStudioCatalogController()` called `useCatalog()` three times and inherited `200`. After: each Catalog Page read declares its surface budget.

**Recommendation strength** - Strong. Implemented.

**Dependencies / sequencing** - First, because it immediately lowers card count before deeper grid work.

**Documentation follow-ups** - Added to `CONTEXT.md`, `docs/ARCHITECTURE.md`, `docs/adr/0034-catalog-fluidity-budget.md`, and `docs/architecture/DEEPENING-ROADMAP.md`.

## Candidate 2 - Catalog Card Action Surface

**Files** - `components/ImageGrid.tsx`, `lib/catalogCardActionSurface.ts`, `lib/catalogCardActionSurface.test.ts`, `components/ui/ActionButton.tsx`, `components/Tooltip.tsx`.

**Problem** - Every grid card mounted six secondary actions plus tooltips even when idle. `content-visibility` helped paint/layout but not React tree size, buttons, or tooltip nodes.

**Solution** - Add a `Catalog Card Action Surface` Module that defines when secondary actions mount: always on touch widths, selected cards, or active hover/focus cards. `ImageGrid` stays the visual Adapter.

**Benefits** - Leverage: Home preserves motion and command access while avoiding the worst button/tooltip multiplier. Locality: touch vs desktop policy is now testable outside JSX.

**Before / After** - Before: secondary card actions existed for every loaded card. After: desktop mounts them on intent; mobile keeps them available.

**Recommendation strength** - Strong. Implemented.

**Dependencies / sequencing** - Follows Candidate 1; keeps mobile UX intact before considering a singleton command surface.

**Documentation follow-ups** - Same as Candidate 1.

## Candidate 3 - Catalog Grid Render Plan

**Files** - `components/ImageGrid.tsx`, `lib/studioCatalogView.ts`, proposed `lib/catalogGridRenderPlan.ts`.

**Problem** - Loading more Catalog Entries still grows React nodes linearly. The current masonry buckets map all loaded entries; `content-visibility` does not reduce construction cost.

**Solution** - Add a `Catalog Grid Render Plan` Module that returns mounted ids, column spacers, and overscan from entries, scroll root, estimated card height, and force-mounted ids for selected/hovered/transitioning/modal images.

**Benefits** - Leverage: grid callers keep rich animations but pay DOM cost for visible cards. Locality: scroll math, overscan, and view-transition exceptions become one test surface.

**Before / After** - Before: each loaded Catalog Entry becomes a card. After: loaded entries may remain in data, but only planned cards mount.

**Recommendation strength** - Strong.

**Dependencies / sequencing** - Do after Candidates 1 and 2 so the render budget is stable before windowing.

**Documentation follow-ups** - Add to `CONTEXT.md` only when implemented.

## Candidate 4 - Route Preload Budget

**Files** - `components/shell/StudioViewport.tsx`, `components/RecipeRouter.tsx`, `scripts/report-ui-chunks.ts`.

**Problem** - `preloadAllRecipeComponents()` runs after mount and can import recipe/style assets before visible route intent. Chunk gates pass, but parse/compile work still competes with early Home interaction.

**Solution** - Add a `Route Preload Budget` Module with intent adapters: active route preload, hover/near-click recipe preload, and capped idle-budget preload.

**Benefits** - Leverage: route speed remains good while early interaction gets main-thread priority. Locality: preload policy stops living as a timer in the viewport shell.

**Before / After** - Before: idle preloads all recipes. After: preloads are ordered by route/user intent and idle budget.

**Recommendation strength** - Strong.

**Dependencies / sequencing** - Next after catalog slice; subagents measured remaining long tasks and style assets from preload behavior.

**Documentation follow-ups** - Likely ADR update if preload semantics change.

## Candidate 5 - Studio Animation Clock

**Files** - `components/HeaderToolbar.tsx`, `components/Toolbar.tsx`, `components/QueuePanel.tsx`, `lib/gsapMotion.tsx`.

**Problem** - Queue progress, elapsed text, and prompt scramble use React state intervals as fast as 30ms/100ms/250ms. This preserves animation intent but can cause render storms during generation.

**Solution** - Add a `Studio Animation Clock` Module backed by CSS variables, GSAP, WAAPI, or throttled adapters. React should own semantic state; animation frames should not invalidate broad shell surfaces.

**Benefits** - Leverage: animations stay fluid while React commits fall. Locality: timing policy becomes testable with fake timers and visual probes.

**Before / After** - Before: high-frequency timers live in multiple UI Modules. After: consumers subscribe to coarse semantic updates or compositor-friendly values.

**Recommendation strength** - Strong.

**Dependencies / sequencing** - Do before cutting animation quality; the goal is moving cost, not removing motion.

**Documentation follow-ups** - Update `docs/DESIGN.md` animation implementation notes when accepted.

## Candidate 6 - Style Result Index

**Files** - `components/recipes/StylesRecipe.tsx`, `components/recipes/styleBrowserRenderPlan.ts`, `components/recipes/stylePresetManifests.ts`.

**Problem** - Style browsing can rescan image results per preset/group. The visual browser is rich, but lookup cost should not scale as presets times images.

**Solution** - Add a `Style Result Index` Module keyed by preset id and recipe id, with a `Style Browser Session` Adapter for filters, expanded groups, and preload plans.

**Benefits** - Leverage: style browsing stays visual while result lookup becomes near `O(images + presets)`. Locality: style result matching stops living in render code.

**Before / After** - Before: render path filters/sorts broad image sets. After: render path reads an indexed projection.

**Recommendation strength** - Strong.

**Dependencies / sequencing** - Do after Route Preload Budget so style assets and result lookup are not optimized in conflicting places.

**Documentation follow-ups** - Extend style browser gates.

## Candidate 7 - Runtime Event Reducer

**Files** - `hooks/useLocalStudioSync.ts`, `hooks/localStudioSyncRefreshPolicy.ts`, `services/studioEventSource.ts`, `services/localGenerationRun.ts`.

**Problem** - SSE is shared, but bursts of job/catalog/log events can still trigger repeated refreshes and per-job catch-up work.

**Solution** - Add a `Runtime Event Reducer` Module that coalesces event bursts by microtask/frame, groups scopes, and feeds bounded refresh requests to Local Studio Sync and job waiting.

**Benefits** - Leverage: generation bursts become fewer backend reads and fewer shell invalidations. Locality: event coalescing gets one Interface.

**Before / After** - Before: events call refresh policy directly. After: events enter a reducer that emits one refresh plan.

**Recommendation strength** - Worth exploring.

**Dependencies / sequencing** - Do after hot UI surfaces are under budget; event churn is most visible during generation.

**Documentation follow-ups** - Update ADR-0031 if reducer becomes part of summary-first hot-read policy.

## Candidate 8 - Settings Surface Session

**Files** - `hooks/useSettingsSurface.ts`, `lib/settingsSurface.ts`, `components/StudioSettingsModal.tsx`.

**Problem** - Settings is demand-mounted, but open-time hydration and broad provider/output/maintenance state can still compete with modal animation.

**Solution** - Add a `Settings Surface Session` Module that hydrates once per closed-to-open transition and lazy-loads provider, output-source, and maintenance panels.

**Benefits** - Leverage: Settings opens faster without reducing diagnostics depth. Locality: open-transition state and refresh policy live in one Module.

**Before / After** - Before: the Settings Surface name exists, but hydration is still mostly wrapper logic. After: the session owns open-time fetch policy and panel adapters.

**Recommendation strength** - Worth exploring.

**Dependencies / sequencing** - Do after animation clock if modal open animation still stutters.

**Documentation follow-ups** - Update `docs/ARCHITECTURE.md` and technical debt after implementation.

## Suggested execution order

1. Catalog Render Budget Module. Implemented.
2. Catalog Card Action Surface. Implemented.
3. Route Preload Budget.
4. Studio Animation Clock.
5. Style Result Index.
6. Catalog Grid Render Plan.
7. Runtime Event Reducer.
8. Settings Surface Session.

This order keeps visible animation quality first, then removes invisible main-thread work, then handles large-library durability.
