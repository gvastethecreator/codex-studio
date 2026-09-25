# pack_07 :: 4. Landscape And Garden Systems — audit

Audited 2026-09-25 from the contact sheet of current cards (10 primaries + 2 variants) and full manifests. Category kind: theme. Review rule: do not introduce a garden where no landscape transformation was requested.

## Findings

Category-wide:

- All 10 DNA blocks were the shared template ("acts as a transferable architecture/interior router: …"). Nothing described the ground-plane system: plan geometry, planting, edging, path material, water. Several names hid the garden type behind euphemisms: Tournament Turf Strategy (sports turf), Topiary Wayfinding Trap (hedge maze), Water-Horizon Hospitality (vanishing-edge pool).
- No field said that the preset must leave a non-landscape prompt alone, although the category review requires it.
- The negatives blocked occupants and uses: `people`, `person`, `people scene`, `golfers`, `players`, `flag`, `pole`, `cup marker`, `benches`, `chair`, `sofa`, `bed`. Some rules were garbled (`zen interior zones`, `tourist greenhouse interior zones`).
- The cards look alike: every one is empty, at golden hour, with warm raking light. Three of them (044, 045, 048) use the same corten-steel edging look. SP07-048 shows a recognisable real city skyline with a real tower. SP07-046 is a resort postcard.
- SP07-050 Botanical Iron Glasshouse overlaps SP07-033 Conservatory Bioclimate (category 3). Both cards show a centred glass corridor with a wet floor.

| Preset                       | Card defect                                                     |
| ---------------------------- | --------------------------------------------------------------- |
| SP07-041 Formal Topiary Axis | correct parterre; golden-hour postcard                          |
| SP07-042 Cottage Bloom       | good planting; empty path                                       |
| SP07-043 Karesansui          | good raking; the variant is the same idea                       |
| SP07-044 Postindustrial      | corten and wet concrete path; no industrial relic               |
| SP07-045 Xeriscape           | corten and agaves; close to 044                                 |
| SP07-046 Water-Horizon       | resort infinity-pool postcard                                   |
| SP07-047 Topiary Trap        | a curved hedge garden, not a maze                               |
| SP07-048 Biophilic Terrace   | real skyline with a landmark tower; the variant is corten again |
| SP07-049 Tournament Turf     | golf fairway; good stripes                                      |
| SP07-050 Iron Glasshouse     | centred glass corridor with a wet floor; same as SP07-033       |

## Changes

- DNA rewritten for all 10 (version 2). A shared `subject_treatment` states the contract: reorganise ground plane, planting, edging and paths only where the prompt has outdoor ground; add no garden to an interior, object or portrait prompt. Fields now name the systems: a single axis with mirrored clipped parterres; tiered self-seeding cottage planting; raked gravel furrows and odd-number stones; industrial relics kept among pioneer planting; spaced rosettes over decomposed granite with dry creeks; vanishing-edge pools; head-high hedge walls with broken sightlines; modular deep planters on decks; striped mowing and contoured greens.
- SP07-050 is now the structure and display planting: a curvilinear wrought-iron vault, a net of rib shadows, a spiral stair and gallery, and a water-lily tank. Humid haze is assigned to SP07-033 in its own DNA.
- `dropAvoid` removes the occupant-blocking and garbled rules. Added category guards: `golden-hour garden postcard formula`, `corten steel edging as default`, `real city skyline or landmark`, `adding a garden to an interior or object prompt`.
- No renames. The euphemistic names are kept because the brief allows renames only for persons, brands or duplicates; the DNA now says plainly what each preset is.
- 60 briefs with varied light and season (hoarfrost, fog, snowfall, downpour, thunderstorm, moonlight) and occupants (duellists, a jousting tournament, a courier lost in a maze, a fox in grasses). Two briefs (Karesansui behind a modern house, Perennial Drift around an abandoned farmhouse) prove the rule by keeping a requested building unchanged. No subject repeats; there are no trams, cyclists, umbrellas or real skylines.
- New presets (pending cards), category now 20:
  - **Picturesque Landscape Park**: serpentine lake, grazed turf, tree clumps, an eye-catcher, a ha-ha.
  - **Chahar Bagh Water Garden**: four quarters divided by stone channels, raised walks over sunken beds, chadar chute, central pavilion.
  - **Moss Stroll Garden**: many-species moss carpets, stepping stones, irregular pond. It excludes raked gravel to stay apart from Karesansui.
  - **Terraced Water-Stair Garden**: hillside terraces, balustraded stairs, a water staircase, grottoes.
  - **Scholar Garden Rockery**: moon gates, perforated lake rock, zigzag bridges, lattice windows.
  - **Naturalistic Perennial Drift**: grass matrix with repeated perennials and winter seedheads.
  - **Crevice Rock Garden**: stone slabs on edge with alpine cushions in the crevices.
  - **Cloister Herb Garth**: quartered wattle-edged beds around a well inside an arcade.
  - **Walled Espalier Potager**: fan and cordon fruit trained on brick, box-edged vegetable beds, cold frames.
  - **Stepped Paddy Terraces**: contour-following flooded terraces held by bunds, irrigation from the forest above.
- Overlaps checked: Terraced Water-Stair vs SP07-041 Formal Topiary Axis (hillside terraces and water vs a flat parterre; `flat parterre plain` excluded). Moss Stroll vs SP07-043 Karesansui. Cloister Herb Garth vs SP07-042 Cottage Bloom (ordered medicinal quarters vs informal spill). Perennial Drift vs SP07-044 Postindustrial (no relics; planting is the subject). Names were checked against all presets, including "Moss" and "Mossy Rock" in materials.

## Unsure

- Chahar Bagh, Scholar Garden and Paddy Terraces are real cultural landscapes. The DNA describes construction only (channels, rockery, bunds) and excludes readable inscriptions, souvenir lanterns and costumed staging. Review the cards for stereotyped props.

## Pending (local session)

- Generate the 3-card sets with `--card-set` and review. Check that the Karesansui and Perennial Drift "requested building" cards keep the building unchanged, and that no card shows a real skyline.
- Remove `pending` from the ten new presets after review.
