# Style curation v2 — review and implementation

## What this change does

This is a category-by-category **source/text review plus executable prompt and navigation corrections**, not a claim that 1,689 image styles have been visually certified. The 1,677 original manifests are unchanged. Their names, IDs, source categories, reference metadata, favorites and saved drafts remain recoverable. No user library or generated image is modified. No provider execution or paid generation is part of the validation.

Baseline: main `d70601886e64ef13859b367e6cc5a85983c9ca6f`. The repository source snapshot at `f9182951b628c3ba693daaa8401d4cbe67dc7d53` contains the same catalogue source.

| Scope                                          | Before | This branch |
| ---------------------------------------------- | -----: | ----------: |
| Manifest packs                                 |     17 |          20 |
| Source categories                              |    118 |         121 |
| Presets                                        |  1,677 |       1,689 |
| Original presets deleted or overwritten        |      — |           0 |
| New text-authored studies                      |      — |          12 |
| Categories with image acceptance still pending |      — |         121 |

The catalogue is large because it mixes visual language, material/light modifiers, deliberate camera/output profiles and thematic directions. These are distinct purposes, not proof of low quality. A profile should keep its intentional viewpoint; a material modifier should keep its material identity. Universal removal of every concrete noun would destroy useful capabilities.

## Implemented corrections

### 1. A provider-facing metadata boundary

`styleLayerComposer.ts` retains name, displayName, search aliases, source pack and original brief as metadata, but emits neutral layer labels. The final serializer in `packages/shared/src/styles/legacyStylePrompt.ts` admits only the eight known active visual fields. `lib/recipeContextBuilders/styles.ts` reconstructs legacy context at the last boundary, ignoring historical cached names, briefs, role instructions and diversity text.

Renaming a preset or its pack no longer changes the legacy image prompt when the active DNA is unchanged. This applies to normal generation, copied prompts and newly saved blend field values. Existing search aliases remain searchable. Old user-authored DNA containing names is **not rewritten in place**.

**Important limit:** an enabled DNA field can still describe a motel, monster or ruin. The serializer cannot prove whether that language is stylistic or narrative. This PR does not use a regex to silently rewrite all 1,677 presets. The category review identifies the targeted editorial work; the new studies demonstrate what a portable derivative looks like.

### 2. Preserve references unless reinterpretation is selected

Legacy style generation no longer chooses random camera, gesture, lighting or palette instructions on each click. The registered plan and the dispatched plan are the same. With image references, preserve mode suppresses the camera/composition field without mutating the original selection or saved mask. An explicit preserve/reinterpret control is available when references exist. Reinterpretation allows the active camera field again; it does not force unrelated scene content.

All-disabled layers and camera-only layers suppressed by preservation cannot dispatch an empty style plan. The UI count reflects effective legacy layers. Strength values remain relative language-level priorities, not calibrated image-space percentages.

The existing `intentional-v1` path and its saved request contract are retained. Twelve new policies are derived from the new YAML manifests and validated through its existing schema; the prior registry is not replaced.

### 3. Preserve identity, shorten presentation

All 118 original source-category keys remain unchanged. Short display labels are resolved using **actual pack ownership**, never by guessing from an `SP05` prefix: anime packs 13 and 16 legitimately contain legacy SP05 identifiers.

The collection projection and both grouped catalogue surfaces use the short labels. Canonical group keys, routes and thumbnail identities remain stable. Global indexed search and loaded-pack search accept the new labels as additional aliases. Existing collection IDs remain valid. Collection and family titles are shorter; `portable_visual_studies` is a new cross-pack collection. No old collection is hidden or deleted in this pass.

### 4. Explicitly pending previews

New studies have `assets: {}`, `taxonomy.hasDefaultImage: false`, and matching `attributes.previewStatus` / `attributes.ui.previewStatus: pending`. Cards show **Preview pending**, not an unrelated legacy thumbnail. Other missing images show **No preview**.

Manifest validation rejects a fabricated default URL for a pending study and rejects inconsistent status fields. Provider-variant verification exempts only explicitly pending studies from missing-image requirements; it still validates variants that actually exist and still requires existing non-pending presets. No global incomplete-assets bypass is introduced.

### 5. Reproducible category coverage

[`CATEGORY-REVIEW.md`](./CATEGORY-REVIEW.md) contains one diagnostic section for each of the 118 original categories, with specific problems, things to retain, proposed action, cross-subject acceptance check and representative source excerpts.

`scripts/style-curation/category-reviews.json` tracks all 121 categories, source counts, source-text hashes, explicit ownership and evidence IDs. `styles:curation:verify` fails on unreviewed categories, duplicate reviews, invalid evidence, count changes or source-text drift. A source edit requires revisiting the corresponding review; changing a hash alone is not editorial approval.

Identical normalized eight-field DNA is reported as a comparison candidate, not an automatic deletion. The initial 1,677-source inventory had zero such exact groups. This does **not** prove there are no semantic or visual duplicates. Different negative rules, intended scope and rendered results must be compared before consolidation.

## New authoring studies

These are derivatives, not replacements. Their `attributes.ui.derivedFrom` points to existing references, while their IDs and source ownership are independent. Pack 18 is deliberately not reused: an earlier intentional registry already reserves SP18 identifiers.

| Pack                 | Study           | Visual mechanism                                             |
| -------------------- | --------------- | ------------------------------------------------------------ |
| 19 — Ink Structures  | Dry Cut         | Solid relief ink and deliberate carved negative gaps         |
|                      | Elastic Contour | Pressure-responsive contours with selective internal drawing |
|                      | Bristle Rhythm  | Directional dry-brush marks with quiet unpainted intervals   |
|                      | Pooled Ink      | Absorbent ink edges and grouped tonal pools                  |
| 20 — Print Registers | Offset Drift    | Controlled registration displacement on graphic color planes |
|                      | Stencil Duotone | Two printable ink layers with deliberate overprint           |
|                      | Toner Blocks    | Toner aggregation and selective reproduction breakup         |
|                      | Engraved Tone   | Directional engraved lines building form and value           |
| 21 — Paper & Pigment | Stacked Paper   | Cut shapes, layer thickness and bounded contact shadows      |
|                      | Resist Wash     | Transparent washes interrupted by protected light shapes     |
|                      | Opaque Planes   | Opaque pigment, deliberate edges and flattened value planes  |
|                      | Pressed Relief  | Shallow paper deformation and restrained raking light        |

Each has eight authored visual fields, explicit negative rules, provenance, a validated intentional policy and a visible pending-preview state. None has been promoted on the basis of a fabricated image comparison.

## Editorial decisions still pending

The category table is deliberately a **decision register**, not a destructive migration. Follow its category-specific action when doing the next authoring pass. In particular:

- Keep capture/gameplay and technical-output profiles useful; extract transferable derivatives rather than stripping their camera or HUD grammar indiscriminately.
- Keep material, wardrobe and environment transformations explicit; do not disguise content changes as a universal style.
- Compare ink/print/pixel/anime overlaps using the same requested subjects before turning near-duplicates into variants.
- Separate reference-only names and sample descriptions from runtime DNA in targeted versioned derivatives.
- Add reversible visibility/archive controls and redirect manifests only after selecting actual merge/archive candidates. They are not implemented by this PR, and nothing is secretly archived.

## Image acceptance protocol

Use the same five requested subjects across candidates: an ordinary object, a person doing a mundane action, an interior, an exterior and a graphic composition. Keep provider/model/settings identical where supported; compare repeated outputs and fixed seeds only where the provider actually exposes them. Include one conflicting request such as an explicit camera, daylight, requested text or supplied composition.

Record (1) requested-content preservation, (2) unrequested props/scenery/pose, (3) recognizable visual identity across subjects, (4) genuinely distinct behavior relative to the nearest existing candidate and (5) preview-to-runtime correspondence. A beautiful single card is not acceptance. Save actual results separately from the authoring manifest and never count textual review as image validation.

Preserve mode additionally requires identical subject intent and framing, no automatic restaging and no reintroduced camera field. Reinterpret mode should make structural changes only within the requested scope. Negative prompts must not contradict explicitly requested media or content unnoticed.

## Verification

Use Bun and the repository lockfile. No dependency or package-manager changes are required.

```bash
bun install --frozen-lockfile
bun run styles:runtime
bun run styles:thumbnails
bun run styles:curation:verify
bun run styles:runtime:check
bun run styles:thumbnails:check
bun run test -- components/recipes/styleLayerComposer.test.ts components/recipes/styleCurationBoundary.test.ts components/recipes/userStyleDraftBuilders.test.ts components/recipes/styles/collections/styleCollectionProjection.test.ts packages/shared/src/styles/legacyStylePrompt.test.ts scripts/audit-style-curation.test.ts
bun run test
bun run check
bun run build
```

The PR and workflow artifacts must record the **actual exit status** of these commands. A running or skipped job is not a pass. Source coverage, unit tests and a production build do not replace the image acceptance protocol.

## Rollback and compatibility

Revert this PR to restore previous prompt and presentation behavior. There are no database migrations, deletion operations, workspace rewrites or destructive archive operations. Generated runtime/search/thumbnail/policy files are projections of checked-in sources and can be regenerated. Original IDs and records remain intact throughout. Any composition using a new SP19/SP20/SP21 study depends on those new IDs and should be exported before rolling back their introduction.
