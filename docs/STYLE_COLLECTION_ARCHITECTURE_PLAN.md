# Style Collection Architecture Plan

This document describes how to implement the V2 Style browser architecture.
The goal is to reorganize user-facing style packs aggressively without breaking
existing source manifests, saved references, favorites, generated runtime data,
or direct pack URLs.

Execution tracking lives in
[`STYLE_COLLECTION_REFACTOR_ROADMAP.md`](./STYLE_COLLECTION_REFACTOR_ROADMAP.md).

## Goals

- Present styles in a coherent user-facing order instead of legacy pack order.
- Support new visible style packs that do not have to match the 17 source packs.
- Keep `My Styles` local-first and visibly distinct.
- Allow the same preset to appear in more than one visible pack without
  duplicating YAML.
- Preserve source provenance for debugging, audits, favorites, and migrations.
- Make later manifest migration optional, not required for the first UX win.

## Non-Goals

- Do not move source YAML in the first implementation slice.
- Do not change preset ids, default image paths, or source pack ids yet.
- Do not duplicate official presets into multiple manifest files.
- Do not store user-created styles in repo manifests.
- Do not make collections a second durable preset source of truth.

## Layer Model

V2 uses four layers:

1. **Source manifest layer**
   Existing `Style Pack Manifest` and `Style Preset Manifest` files.
2. **Collection definition layer**
   Curated user-facing pack groups. These can point to packs, categories,
   presets, or query rules.
3. **Runtime projection layer**
   A generated/read model that resolves collection entries into ordered runtime
   presets with source provenance.
4. **Browser presentation layer**
   UI state, routing, cards, facets, source-pack fallback, and selection.

Only layer 1 owns official preset content.

## Source Packs vs Collections

`Source packs` are canonical ownership and provenance boundaries. They answer:
where does a preset live, which generated runtime chunk owns it, what direct
legacy URL should keep working, and which manifest must be audited if a preset
changes.

`Collections` are user-facing navigation surfaces. They answer: which creative
intent is the user trying to reach, which slices from multiple source packs
belong together, and which cross-links should be visible without duplicating
preset YAML.

This distinction matters in the UI:

- Source pack cards may use source-pack-wide thumbnails.
- Collection cards must prefer collection-specific thumbnails from
  `featuredPresetIds`, preset entries, category entries, or whole-pack entries
  included in that collection.
- `sourcePackIds` are provenance and loading metadata, not a collection cover
  contract. A broad source pack link must not pull unrelated card imagery into
  a focused collection.
- Mixed collections with renamed categories should declare `featuredPresetIds`
  until dedicated category thumbnails exist.

## User-Facing Order

The default browser should show families first, then packs inside each family.

| Family                     | Visible packs                                                                                                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Personal                   | My Styles, Favorites, Recent                                                                                                                                                  |
| Capture & Reality          | Photography & Camera Styles; Analog Film & Photo Processes; Lighting, Optics & Atmosphere; Scientific, Surveillance & Technical Imaging                                       |
| Screen & Motion            | Cinema & Film Genres; TV, Broadcast & Analog Video; Animation & Cartoons; Anime & Manga                                                                                       |
| Illustration & Art Media   | Comics & Sequential Art; Illustration & Publishing; Drawing, Ink & Printmaking; Painting & Traditional Media; Digital Art & Concept Art                                       |
| Design, Assets & Materials | 3D, CGI & Product Render; Materials, Textures & Surfaces; Patterns & Ornament; Fashion, Costume & Wearables; Architecture, Interiors & Places; Games, UI & Interactive Worlds |
| Worlds & Genres            | Myth, Folklore & Ritual; Dungeon, Dark Fantasy & Wargame; Punk & Alternate Futures; Surreal, Dream & Symbolic                                                                 |
| Experimental & Play        | Abstract, Glitch & Systems; Toys, Craft, Food & Scale Play                                                                                                                    |

This order follows user intent: personal first, real-world capture, moving
image, art media, production/design assets, worlds/genres, then experimental
and playful styles.

## Data Contracts

Add source-level contracts near the style runtime/catalog code.

```ts
export type StyleCollectionEntryKind = 'pack' | 'category' | 'preset' | 'query' | 'manual_group';

export interface StyleCollectionEntry {
  id: string;
  kind: StyleCollectionEntryKind;
  packId?: string;
  categoryId?: string;
  presetId?: string;
  query?: StyleCollectionQuery;
  title?: string;
  description?: string;
  role?: 'primary' | 'secondary' | 'cross_link';
  includeMode?: 'include' | 'exclude';
}

export interface StyleCollection {
  id: string;
  title: string;
  familyId: string;
  description: string;
  icon: string;
  order: number;
  entries: StyleCollectionEntry[];
  facets?: StyleCollectionFacets;
  sourcePackIds: string[];
  featuredPresetIds?: string[];
}

export interface StyleCollectionFamily {
  id: string;
  title: string;
  description: string;
  order: number;
}
```

Runtime projection should expose resolved items without hiding provenance:

```ts
export interface StyleCollectionRuntimePreset {
  presetId: string;
  sourcePackId: string;
  sourceCategoryId: string;
  collectionId: string;
  collectionEntryId: string;
  collectionRole: 'primary' | 'secondary' | 'cross_link';
}

export interface StyleCollectionRuntimeSummary {
  id: string;
  title: string;
  familyId: string;
  presetCount: number;
  taskCounts: Record<string, number>;
  sourcePackIds: string[];
  featuredPresetIds: string[];
}
```

## Metadata Location

Recommended first implementation:

- `components/recipes/styles/collections/styleCollectionTypes.ts`
- `components/recipes/styles/collections/styleCollectionDefinitions.ts`
- `components/recipes/styles/collections/styleCollectionProjection.ts`
- `components/recipes/styles/collections/styleCollectionValidation.ts`

Use TypeScript first. It gives type safety, easier imports, and focused tests.
YAML can come later if non-developer editing becomes important.

## Resolution Rules

Collection entries resolve in this order:

1. `pack`: include all source pack presets in source order.
2. `category`: include source category presets in category order.
3. `preset`: include one explicit preset.
4. `query`: include presets matching task/tag/facet/source rules.
5. `manual_group`: group child entries under a visible subsection.

Deduplication rules:

- A collection should not show the same preset twice.
- First `primary` entry wins ordering.
- Later duplicate cross-links can increment provenance/count metadata but should
  not render duplicate cards in the same collection.
- The same preset may appear in different collections.

Sorting rules:

- Preserve source order inside source packs/categories.
- Collection entry order controls cross-pack order.
- Manual featured presets can appear in card previews without changing the main
  ordered list.

## Routing

Keep current routes:

- `#recipe-styles`
- `#recipe-styles/pack_02`
- `#recipe-styles/user_styles`

Add collection routes:

- `#recipe-styles/collections`
- `#recipe-styles/collection/<collection_id>`
- `#recipe-styles/source/<pack_id>` as optional clearer source-pack route.

Compatibility:

- Existing `#recipe-styles/pack_XX` opens source pack view.
- New collection cards open collection view.
- If a source pack is no longer shown as top-level, direct links still work.
- Selected style ids stay preset ids, not collection ids.

## Browser Architecture

The Styles browser should have three modes:

1. **Collections**
   Default. Shows family groups and visible style packs.
2. **Collection Detail**
   Shows resolved presets, subgroups, source chips, task badges, and facets.
3. **Source Packs**
   Advanced/source view. Shows current 17 packs for compatibility, audit, and
   debugging.

UI state should track:

- active browser mode
- selected collection id
- selected source pack id
- selected category id
- search text
- task filter
- facet filters
- support panel visibility for References, Style Map, and Style Slots

Source pack and collection browsing should share card rendering and selection
logic. The difference is the runtime preset list feeding the view.

## My Styles Integration

`My Styles` remains a virtual local pack backed by SQLite.

Rules:

- It appears in Personal family.
- It can also appear in search results and selected slots.
- It does not participate in official manifest runtime generation.
- It can be included in collection runtime composition as a virtual source pack.
- Official collection metadata must not mutate or persist user style rows.

## Favorites And Recent

Favorites and Recent should behave like virtual collections:

- `favorites`: projection from saved favorite preset ids.
- `recent`: projection from local usage state when available.
- Both can include official presets and user styles.
- Missing source presets should show a recoverable stale-reference state, not
  crash collection rendering.

## Facets

Facets are not mandatory for Slice 1, but the architecture should leave a slot.

Initial facet groups:

- `medium`: photography, film, drawing, painting, print, 3d, textile, material.
- `domain`: cinema, broadcast, fashion, architecture, games, scientific, product.
- `workflow`: image, edit, texture, sprite, style-card.
- `era`: analog, early-digital, retro, contemporary, future.
- `technique`: lighting, optics, surface, glitch, collage, ink, render-engine.
- `world`: anime, myth, punk, dungeon, sci-fi, fantasy, surreal.

Facets can be:

- derived from source tags/tasks
- assigned at collection entry level
- overridden per preset for mixed categories

Mixed categories that need preset-level overrides first:

- `pack_02/lighting-and-atmosphere`
- `pack_02/caricature-and-cartoon-styles`
- `pack_10/fluid-and-organic`
- `pack_10/diagram-print-and-light-systems`
- `pack_11/aesthetics`
- `pack_11/micro-macro`

## Source Compatibility

Compatibility rules:

- Source pack ids stay valid.
- Preset ids stay valid.
- Favorite/user-style selected ids stay preset ids.
- `StyleRuntimePreset.packId` keeps source pack identity.
- Collection projection adds source provenance instead of replacing source ids.
- Runtime generation can be checked without rewriting manifests.

If future migration changes pack ids:

- add pack alias map
- keep legacy route redirects
- migrate favorites/user refs through alias lookup
- record migration in docs and tests

## Validation

Focused tests:

- collection definition schema validation
- entry resolution for pack/category/preset/query entries
- deduplication inside one collection
- cross-collection reuse of one preset
- compatibility for source pack direct routes
- virtual `My Styles` collection behavior
- missing stale preset ref behavior

Focused commands:

```bash
bun run check -- components/recipes/styles/collections
bun run test -- components/recipes/styles/collections
bun run styles:runtime:check
bun run styles:render:verify
```

Browser smoke after UI slice:

```bash
bun run styles:browser:verify -- --url=http://localhost:17222/#recipe-styles
```

Manual smoke:

- landing shows family groups in V2 order
- `Photography Eras` appears under Photography/Analog, not Cinema
- `Cinema`, `Broadcast`, `Animation`, and `Anime` are separate
- source route `#recipe-styles/pack_02` still works
- selecting a preset from collection detail fills style slot
- user style selection still works

## Implementation Slices

### Slice 1: Contracts And Metadata

- Add collection types.
- Add family definitions in V2 order.
- Add visible pack definitions.
- Add `pack_02` proof mapping.
- Add validation helper.
- Add focused unit tests.

### Slice 2: Runtime Projection

- Resolve collections from current runtime packs.
- Count presets/tasks/source packs.
- Deduplicate within collection.
- Preserve source provenance.
- Add collection summaries for landing cards.

### Slice 3: Collection Landing UI

- Replace pack-first landing with family-grouped collection landing.
- Keep source packs available as secondary view.
- Keep `My Styles` prominent.
- Reuse existing preset card rendering where possible.

### Slice 4: Collection Detail UI

- Render collection subgroups.
- Add source provenance chips.
- Keep selection/favorites behavior unchanged.
- Add task badges and count summaries.

### Slice 5: Route Compatibility

- Add collection hash handling.
- Keep old pack hash handling.
- Add tests for route parsing if route helpers are extracted.

### Slice 6: Facets And Overrides

- Add collection-level facets.
- Add preset-level overrides only for mixed categories.
- Add filters after collection navigation is stable.

### Slice 7: Migration Readiness

- Generate duplicate-family report.
- Identify exact duplicate vs variant families.
- Decide whether any source manifests should move.
- Add alias/compatibility plan before moving YAML.

## File Ownership

Likely touched implementation files:

- `components/recipes/StylesRecipe.tsx`
- `components/recipes/styles/styleBrowserRenderPlan.ts`
- `components/recipes/styles/stylesData.ts`
- `components/recipes/styles/runtimeTypes.ts`
- new `components/recipes/styles/collections/*`
- focused tests under the same collection folder or adjacent test files

Avoid touching:

- source YAML manifests in Slice 1-5
- generated runtime files unless runtime projection requires it
- user style storage/API unless virtual collection integration needs a small
  adapter

## Open Questions

| Question                                          | Recommendation                                                                                |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Should visible packs be called collections in UI? | No. Use "Style packs" or "Packs" for users; keep "collection" as internal architecture.       |
| Should one preset appear in multiple packs?       | Yes, through cross-links only. Do not duplicate YAML.                                         |
| Should `pack_02` disappear from UI?               | It should disappear from default top-level navigation, but remain accessible in Source Packs. |
| Should collection metadata live in YAML?          | Start in TypeScript; revisit YAML after structure stabilizes.                                 |
| Should source pack names be renamed immediately?  | Only visible labels. Source ids and manifests stay stable.                                    |
