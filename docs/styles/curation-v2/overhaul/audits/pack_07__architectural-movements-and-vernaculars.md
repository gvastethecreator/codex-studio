# pack_07 :: 2. Architectural Movements And Vernaculars — audit

Audited 2026-09-25 from the contact sheet of current cards (13 primaries + 1 variant) and full manifests. Category kind: theme. Review rule: a preserve-mode photo is not structurally rebuilt; reinterpretation can apply requested design changes.

## Findings

Category-wide:

- All 13 DNA blocks were the shared template ("acts as a transferable architecture/interior router: …"). Only the `key_features` tags named a movement, and no field said how the architecture is built: structure, wall system, roof, openings, ornament placement.
- Nothing stated the structural scope that the category review requires. The template did not say whether a preset re-clads a given building or rebuilds it.
- Template negatives blocked valid prompts: `modern` on Gothic, Neoclassical and Tudor; `corridor`, `city street`, `village street`, `pew rows`, `cathedral nave corridor`; and garbled rules (`mandatory interior interior zones`, `warm wood interior zones`).
- Every card uses the same formula: a golden-hour hero facade under a blue sky with a small cloud, seen frontally or from a low angle. There is no weather, night, interior or use, and each card shows a stereotyped building type (courthouse for Neoclassical, cathedral for Gothic, diner for Googie).
- No real architect names were found in names or DNA. The only vernacular was Adobe/Pueblo, and its DNA said "limewashed" where earth plaster is accurate. It did not mention vigas, latillas, canales or stepped setbacks.

| Preset                     | Card defect                                                            |
| -------------------------- | ---------------------------------------------------------------------- |
| SP07-006 Brutalist         | civic block, golden hour; board-form texture weak                      |
| SP07-007 Art Deco          | strong ornament; hero facade formula                                   |
| SP07-009 Gothic Revival    | generic cathedral facade                                               |
| SP07-021 Deconstructivism  | resembles a specific famous museum; landmark-copy risk                 |
| SP07-022 Neoclassical      | courthouse steps, postcard (its own negative)                          |
| SP07-023 Parametric        | white ribbed wave; acceptable, formula sky                             |
| SP07-024 Painted Lady      | correct trim colours; street postcard (its own negative)               |
| SP07-025 Bauhaus           | correct; generic                                                       |
| SP07-026 Googie            | correct roof; empty                                                    |
| SP07-027 Tudor Revival     | cottage postcard (its own negative)                                    |
| SP07-028 Sustainable Green | a classical villa with planters: greenwashed, no bioclimatic mechanism |
| SP07-029 Adobe/Pueblo      | vigas, ladder and setbacks present; good                               |
| SP07-030 Constructivist    | brick block with stair; weak dynamism                                  |

## Changes

- DNA rewritten for all 13 (version 2). A shared `subject_treatment` states the scope: keep building type, site, camera and reference massing; in preserve mode re-clad only facade, openings, ornament and finish; rebuild roof, massing and structure only when a redesign is requested. Each field now names the construction: board-formed concrete and tie holes, setbacks with spandrel ornament, tracery and polychrome brick, colliding non-orthogonal volumes, correct column orders, gradated algorithmic fins, three-colour trim, ribbon windows on white render, upswept folded-plate roofs, close-studded half-timbering, CLT with rammed earth and brise-soleil, glazed stair cylinders.
- Adobe/Pueblo was corrected to describe the actual construction: sun-dried adobe with earth plaster, projecting log vigas with latillas, wooden canales, stepped setback terraces reached by ladders, and hornos. Dreamcatchers, costume props and "tourist pueblo" staging are now in its negatives.
- Sustainable Green now describes real bioclimatic mechanisms (planted roofs, timber brise-soleil, rammed earth, rain chains to cisterns) instead of a classical building with planters.
- `dropAvoid` removes the view-blocking and garbled template rules. Added category guards: `golden-hour hero facade formula`, `copy of a named landmark`, `mixing construction systems of different movements`, `invented cultural symbols`, `costumed tourist staging`.
- No renames: no names contain an architect, brand or duplicate.
- 60 briefs apply each system to a building type it is not usually shown with (Brutalist monastery, Art Deco telephone exchange, Gothic Revival waterworks, Googie ice rink, Bauhaus racing stable). They vary the weather and time of day (fog, snowstorm, thunderstorm, blue hour, noon) to break the golden-hour formula. Each vernacular preset gets at least two authentic building types. No subject repeats.
- New presets (pending cards), category now 20:
  - Movements: **High-Tech Exposed Structure** (external colour-coded services, tension rods, cast nodes), **Postmodern Pastiche Facade** (flat oversized classical graphics on pastel stucco), **Streamline Moderne** (rounded corners, speed lines, glass block, porthole windows).
  - Vernaculars, described from their real construction: **Sahelian Earthen Architecture** (mud-plastered sun-dried brick, projecting toron palm beams used as permanent scaffolding for the annual replastering, pilasters with conical pinnacles), **Trullo Corbelled Stone** (whitewashed drystone walls, corbelled limestone slab cones, one cone per room), **Tulou Rammed-Earth Ring** (rammed-earth ring wall, windowless base, stacked inward timber galleries around a courtyard), **Gassho Thatch Farmhouse** (steep A-frame grass thatch, rafters lashed with rope instead of nails, attic floors inside the roof, hearth-smoked beams).
- Overlaps checked: Streamline Moderne vs Art Deco (horizontal and rounded vs vertical and stepped, each excluding the other's trait). Postmodern Pastiche Facade vs "Postmodern Pattern Clash" (a graphic style, not architecture). High-Tech vs Deconstructivism (exposed services in regular bays vs colliding volumes). Gassho Thatch vs SP07-008 Japanese Zen and the new Wabi-Sabi interior (building shell and roof vs interior systems). A Stave Church Timber preset was drafted, then replaced because the parallel fantasy-category spec already creates "Tarred Stave-Hall Interlace" with the same mechanism. Trullo vs SP07-071 Fungal Vernacular Miniature (`fantasy mushroom houses` excluded).

## Unsure

- The Sahelian replastering brief shows a great mud mosque facade. It is generic, but a provider may reproduce the one famous example. If the card is a landmark copy, switch the brief to a house facade.

## Pending (local session)

- Generate the 3-card sets with `--card-set` and review. Check that the vernacular cards show the stated construction (toron shadows, slab rings, gallery rings, shingle tiers) and contain no invented symbols or costumes.
- Remove `pending` from the seven new presets after review.
