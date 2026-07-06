# Style Collection Refactor Roadmap

This roadmap tracks the complete V2 refactor from legacy source-pack browsing
to collection-first style packs.

## Goal

Ship a collection-first Styles browser where user-facing style packs follow
creative intent, while current source manifests, preset ids, favorites, user
styles, runtime chunks, and direct pack links keep working.

## Status

| Phase                    | Status | Result                                                                |
| ------------------------ | ------ | --------------------------------------------------------------------- |
| 0. Architecture          | Done   | V2 architecture and target ordering documented.                       |
| 1. Contracts & Metadata  | Done   | Collection contracts, families, definitions, and validation landed.   |
| 2. Runtime Projection    | Done   | Collection resolver, summaries, provenance, and focused tests landed. |
| 3. Collection Landing UI | Done   | Landing is family-grouped with Source Packs always visible below.     |
| 4. Collection Detail UI  | Done   | Collections open as virtual packs through the existing preset grid.   |
| 5. Route Compatibility   | Done   | Collection, personal, favorites, and source pack routes are tested.   |
| 6. Facets & Overrides    | Done   | Facet matching and mixed-category overrides are modeled and tested.   |
| 7. Duplicate Families    | Done   | Non-destructive duplicate-family report and triage landed.            |
| 8. Migration Readiness   | Done   | Source YAML migration is deferred with compatibility proof.           |

## Verification Rhythm

Use small checks after each slice:

```bash
bun run test -- components/recipes/styles/collections/styleCollectionProjection.test.ts
bun run check -- components/recipes/styles/collections docs/STYLE_COLLECTION_REFACTOR_ROADMAP.md
```

Use source/runtime checks after UI wiring:

```bash
bun run styles:runtime:check
bun run styles:render:verify
bun run styles:source:verify
```

Use browser checks after collection UI changes:

```bash
bun run styles:browser:verify -- --url=http://localhost:17222/#recipe-styles
```

Use broad gates at round closeout:

```bash
bun run test
bun run check
bun run build
```

## Phase Tasks

### Phase 1: Contracts & Metadata

- [x] Add collection family/type contracts.
- [x] Add V2 family ordering.
- [x] Add visible pack definitions.
- [x] Add source pack/category/preset entry model.
- [x] Add validation helper.
- [x] Test metadata against generated runtime packs.

### Phase 2: Runtime Projection

- [x] Build source index from runtime packs.
- [x] Resolve pack entries.
- [x] Resolve category entries.
- [x] Resolve preset entries.
- [x] Resolve query entries.
- [x] Deduplicate within a collection.
- [x] Support exclude entries.
- [x] Preserve source pack/category provenance.
- [x] Add runtime summary adapter for landing cards.

### Phase 3: Collection Landing UI

- [x] Add collection summaries to `StylesRecipe`.
- [x] Render family sections in V2 order.
- [x] Keep Personal row prominent.
- [x] Keep Source Packs view accessible.
- [x] Keep Source Packs accessible as an always-expanded section with compact
      lazy cards.
- [x] Keep chunk budget under current Styles recipe limit through browser gate coverage.

### Phase 4: Collection Detail UI

- [x] Add collection tab/state mode.
- [x] Render resolved collection presets through existing card component.
- [x] Show source pack/category chips.
- [x] Keep favorite/apply/copy behavior unchanged.
- [x] Keep search working inside collection detail.
- [x] Keep `My Styles` editable actions intact.

### Phase 5: Route Compatibility

- [x] Support `#recipe-styles/collection/<collection_id>`.
- [x] Preserve `#recipe-styles/pack_XX`.
- [x] Preserve `#recipe-styles/user_styles`.
- [x] Preserve `#recipe-styles/favorites`.
- [x] Add focused route tests if helpers are extracted.

### Phase 6: Facets & Overrides

- [x] Add collection-level facet UI model.
- [x] Add task filter compatibility.
- [x] Add preset-level overrides for mixed categories.
- [x] Start with `pack_02/lighting-and-atmosphere`.
- [x] Continue with `pack_02/caricature-and-cartoon-styles`.

### Phase 7: Duplicate Families

- [x] Generate duplicate-family report.
- [x] Classify exact duplicate candidates, useful variants, and false positives.
- [x] Defer `styleFamilyId` until generated preview evidence exists.
- [x] Do not archive or merge presets without generated preview evidence.

### Phase 8: Migration Readiness

- [x] Decide whether source YAML moves are needed.
- [x] Document alias plan requirement for future source pack id changes.
- [x] Validate favorites/user-style compatibility.
- [x] Run full styles verification before any migration lands.

## Current Proof Checks

- `pack_02/photography-eras` resolves under `Analog Film & Photo Processes`.
- `pack_02/photography-eras` does not resolve under `Cinema & Film Genres`.
- V2 definitions validate against generated runtime packs.
- Projection tests pass.
- `#recipe-styles/collection/analog_film_process` opens the virtual collection
  grid directly.
- `#recipe-styles/pack_04` still opens the legacy source pack directly.
- `styles:browser:verify` now validates collection navigation first, then the
  legacy `pack_05` render budget path through the always-visible Source Packs
  section.
- `styles:runtime:check` confirms generated runtime data is current.
- `styles:source:verify` confirms this slice did not add legacy source-pack
  path dependencies.
- `bun run build` passes with `StylesRecipe` at 69.58 KB against the 80 KB
  budget after moving the collection/source-pack landing into a lazy surface.
- `Analog Film & Photo Processes` shows source provenance chips for both
  `pack_01` and `pack_02`, including `3. Film And Analog Process` and
  `4. Photography Eras`.
- `styles:browser:verify` opens `My Styles` and confirms the Create Style
  action remains available.
- `components/recipes/styleTabRouting.test.ts` covers landing fallback,
  collection routes, source pack routes, `user_styles`, and `favorites`.
- Projection tests confirm entry-level `displayCategory` and `facetOverrides`
  survive runtime projection.
- `Lighting, Optics & Atmosphere` projects `pack_02` lighting/atmosphere
  overrides.
- `Animation & Cartoons` projects `pack_02` caricature/cartoon overrides.
- `styleCollectionFacets.test.ts` covers workflow/task matching and aggregate
  facets from collection-level metadata plus entry-level overrides.
- `docs/STYLE_DUPLICATE_FAMILY_REPORT.md` records a non-destructive duplicate
  candidate snapshot: 17 packs, 1,649 presets, 77 candidate families.
- `scripts/report-style-duplicate-families.test.ts` covers seed matching,
  normalized-name matching, markdown bounds, and broad-alias noise avoidance.
- Duplicate-family triage now classifies 58 exact duplicate candidates, 17
  useful variant families, and 2 false-positive candidates.
- `docs/STYLE_COLLECTION_MIGRATION_READINESS.md` defers source YAML moves and
  documents future alias requirements before any physical migration.
- `bun run styles:verify` passed for 17 packs and 1,649 presets, including
  strict taxonomy coverage, runtime check, template validation, source audit,
  and render-budget verification.
- `bun run styles:browser:verify -- --url=http://localhost:17222/#recipe-styles`
  passed with `violations=0`.
- `bun run test` passed with 180 files and 643 tests.
- `bun run build` passed; `StylesRecipe` remains at 69.58 KB against the 80 KB
  chunk budget.
- Full `bun run check` still fails only on unrelated `.scratch/TODO.md`
  formatting.
- Collection folder thumbnails now use collection-specific candidates before
  source-pack fallbacks, so `sourcePackIds` remain provenance metadata instead
  of an accidental cover-image contract.
- `bun run test -- components/recipes/styles/collections/styleCollectionFolderImages.test.ts components/recipes/styles/collections/styleCollectionProjection.test.ts`
  passed with 2 files and 14 tests.
- `bun run check -- components/recipes/StyleCollectionsLandingSurface.tsx components/recipes/styles/collections/styleCollectionFolderImages.ts components/recipes/styles/collections/styleCollectionFolderImages.test.ts components/recipes/styles/collections/styleCollectionDefinitions.ts docs/STYLE_COLLECTION_ARCHITECTURE_PLAN.md`
  passed for the touched implementation and architecture docs.
- Style cards are no longer hidden behind group/category show-more controls:
  all groups and all cards are part of the plan in landing and detail, while
  offscreen groups still use placeholders for browser performance.
- The collection landing and style detail surfaces both include a left
  navigation panel with a compact collapsed rail.
- The ultra-wide Styles shell now keeps References, Style Map, and Style Slots
  as independently collapsible panels with bounded widths.
- `bun run test -- components/recipes/styleBrowserRenderPlan.test.ts components/recipes/styleGridVirtualization.test.ts scripts/report-style-render-budget.test.ts components/recipes/styles/collections/styleCollectionFolderImages.test.ts`
  passed with 4 files and 12 tests.
- `bun run check -- components/recipes/StylesRecipe.tsx components/recipes/StyleCollectionsLandingSurface.tsx components/recipes/styleBrowserRenderPlan.ts components/recipes/styleBrowserRenderPlan.test.ts components/recipes/styleGridVirtualization.ts components/recipes/styleGridVirtualization.test.ts scripts/report-style-render-budget.ts scripts/report-style-render-budget.test.ts scripts/verify-styles-browser-gate.ts`
  passed for the touched UI, render-plan, budget, and browser-gate files.
- `bun run styles:browser:verify -- --url=http://127.0.0.1:17222/#recipe-styles --timeout=30000`
  passed with `violations=0`; `pack_05` renders 5 groups, 70 eager cards,
  135 planned cards, and 0 hidden cards.
- Ultra-wide Playwright checks at `2560x1080` confirmed Source Packs render 17
  visible cards, the landing/detail navigation panels collapse to rails, and
  References/Style Slots use bounded side-panel widths.
- Follow-up ultra-wide alignment pass standardized References, Style Slots, and
  active pack headers at 48px; the active pack header now uses the same detail
  grid columns as the card surface, so title, toolbar, group headers, and cards
  align on one horizontal rhythm with panels open or collapsed.
- Collapsed ultra-wide Playwright checks confirmed References and Style Slots
  rails stay at 40px while the active pack title and card grid share `x=120`.
- `bun run test` passed with 181 files and 651 tests after one transient
  timeout in `scripts/split-style-preset-manifests.test.ts` passed on isolated
  rerun and full rerun.
- `bun run build` passed; `StylesRecipe` is 75.53 KB against the 80 KB chunk
  budget.
- Full `bun run check` still fails only on unrelated `.scratch/TODO.md`
  formatting.

## Current Follow-up Slice

- Review the collection-first flow with the user in the browser.
- Review the new ultra-wide panel collapse behavior in desktop/ultra-wide
  screenshots.
- Revisit collection detail grouping only after users try the provenance-chip
  version; the current source-category grouping is acceptable for rollout.
