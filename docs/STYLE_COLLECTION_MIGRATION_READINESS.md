# Style Collection Migration Readiness

Status: source manifest migration deferred.

Date: 2026-07-04

## Decision

Do not move or rename source YAML manifests for this refactor round.

The V2 collection layer already gives the user-facing reorganization we need:
new visible style packs, coherent ordering, cross-links, source provenance,
collection routes, and folded Source Packs access. Physical manifest moves
would add risk without improving the current UX enough to justify it.

## Why Source YAML Stays Put

- Existing `packId` and preset ids are stable references for routes, favorites,
  selected style slots, generated default image paths, and audit scripts.
- Source packs remain the authoring and runtime ownership layer; collections are
  projections, not a second preset source of truth.
- Collection entries can include a source pack, source category, explicit
  preset, query, or future manual group without duplicating YAML.
- Source provenance chips keep debugging and audit context visible inside
  collection detail.
- Duplicate-family triage found candidates, variants, and false positives, but
  no generated preview evidence yet supports merge/archive work.

## Compatibility Contract

- `#recipe-styles/collection/<collection_id>` opens a V2 collection.
- `#recipe-styles/pack_XX` still opens the original source pack.
- `#recipe-styles/user_styles` still opens local user-authored styles.
- `#recipe-styles/favorites` still opens saved favorites.
- Selected official styles keep using preset ids, not collection ids.
- User styles remain local-first and outside repo manifests.
- Favorites and user-style refs do not need migration while source ids stay
  stable.

## Alias Plan

No alias map is required for this round because source ids do not change.

If a later migration changes any source `packId`, add an explicit alias table
before moving files:

```ts
const STYLE_SOURCE_PACK_ALIASES = {
  old_pack_id: 'new_pack_id',
} as const;
```

Future alias support must cover:

- hash route normalization
- favorite/user-style selected ids
- runtime source provenance
- manifest pack/category refs
- generated default image paths
- style catalog search filters
- browser and source-audit gates

## Duplicate Family Policy

The duplicate report is now a triage tool only:

- `exact_duplicate_candidate` means preview evidence is required before any
  merge, alias, archive, or `styleFamilyId`.
- `useful_variant_family` means keep siblings unless generated previews prove
  redundant output.
- `false_positive_candidate` means shared wording collided with a different
  scene, motif, or narrative purpose.

No `styleFamilyId` should be written to manifests in this round.

## Required Verification

Before a future physical migration can land, run:

```bash
bun run styles:verify
bun run styles:browser:verify -- --url=http://localhost:17222/#recipe-styles
bun run test -- components/recipes/styleTabRouting.test.ts
bun run test -- components/recipes/styles/collections
```

Current refactor closeout should still run the same checks, but passing them
confirms the collection-first rollout, not permission to move source YAML.

## Migration Gate

Only revisit source manifest moves after all of these are true:

- generated preview evidence exists for each exact duplicate candidate being
  changed
- alias behavior is implemented and tested
- favorites/user-style compatibility has a focused test, not only a browser
  smoke
- `styles:source:verify` accepts the new source layout
- browser gates pass for collection, source pack, favorites, and My Styles
