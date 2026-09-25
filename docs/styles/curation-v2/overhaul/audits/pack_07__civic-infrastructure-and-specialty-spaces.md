# pack_07 :: 3. Civic Infrastructure And Specialty Spaces — audit

Audited 2026-09-25 from the contact sheet of current cards (9 primaries + 2 variants) and full manifests. Category kind: theme. Review rule: a requested room must not become a station or library under a surface treatment.

## Findings

Category-wide:

- All 9 DNA blocks were the shared template ("acts as a transferable architecture/interior router: …"). They listed tags such as `leather-paper-brass hierarchy` and `thermal-lane compression` without saying what the materials, light or circulation of each space type are. SP07-038's aesthetic even began "ossuary-subterranean style sample with …".
- The template had no rule that stops a treatment from converting the requested room, which is the category's main risk.
- The negatives removed what a space needs: `people`, `staff`, `hands`, `visitor`, `diver`, `person` (so a requested occupant is blocked), `slot machine`, `playing cards`, `chips`, `gambling table` on Casino, `reading table`, `lamps`, `desk lamp`, `open book prop` on the library preset, `chair`, `ground level`. Some rules were garbled (`server-interior zones aisle lock`, `office interior zones`).
- Six of the nine cards are the same composition: a centred one-point corridor with a wet mirror-gloss floor (subway, conservatory, ruin, library, ossuary, data center). This is the formula the template's own `corridor perspective` negative tried to block.

| Preset                      | Card defect                                              |
| --------------------------- | -------------------------------------------------------- |
| SP07-032 Transit Patina     | platform corridor with wet floor; grime and tile weak    |
| SP07-033 Conservatory       | centred glass corridor, wet floor                        |
| SP07-034 Institutional Ruin | centred hall and stair, wet floor; decay good            |
| SP07-035 Bibliographic      | long reading table down the centre; a library by default |
| SP07-036 Casino             | empty; no pattern density or reflections                 |
| SP07-037 Aquarium           | strong water optics; good                                |
| SP07-038 Ossuary            | niche corridor; the variant with carved niches is better |
| SP07-039 Data Center        | centred aisle; the variant shows detail                  |
| SP07-040 Arboreal Shelter   | treehouse bolted to a trunk; good                        |

## Changes

- DNA rewritten for all 9 (version 2). A shared `subject_treatment` states the contract: keep the requested place, its function, occupants and action; bring the space type's materials, wear, circulation and light; become that space type only when the prompt asks for it. Each field now names the mechanism: bevelled chipped tile, riveted painted columns and fluorescent green cast (Transit); condensation, glazing bars and misting (Conservatory); curled delaminating paint and collapsed ceiling tiles (Ruin); oak bays, rolling brass ladders and green lamp pools (Bibliographic); low mirrored ceiling, loud carpet and pot-light grid (Casino); depth attenuation and caustics (Aquarium); carved chalk vaults with empty niches and calcite (Ossuary, human-remains negatives kept); containment aisles and perforated floor (Data Center); trunk bolts and rope lashings (Arboreal).
- `dropAvoid` removes the occupant-blocking, equipment-blocking and garbled rules. Added category guards: `one-point corridor perspective as default`, `wet mirror-gloss floor as default`, `turning the requested room into a station or library`, `readable signage or wayfinding text`.
- No renames. The names are euphemistic (see Unsure) but contain no person, brand or duplicate.
- 60 briefs. Each preset gets one authentic space and two transfers to a different room (transit patina on a night bakery, conservatory on a barbershop, casino on an all-night breakfast room, data center on a cryo-vault of kings), which tests the category rule directly. Views vary: overhead, side-on, from the stage, from the centre of a rotunda. No subject repeats.
- New presets (pending cards), category now 20: **Anatomical Theatre Tiers**, **Flooded Column Cistern**, **Observatory Dome Instrumentation**, **Victorian Pumping Station Ironwork**, **Horseshoe Opera Auditorium**, **Oak-Panelled Courtroom**, **Radial Panopticon Cell Block**, **Yellow-Light Clean Room**, **White-Cube Gallery**, **Cold War Bunker**, **Glazed-Tile Municipal Baths**.
- Overlaps checked: Pumping Station vs SP07-057 Neo-Victorian Steamwork (fantasy steampunk; `steampunk gadget clutter` excluded). Clean Room vs SP07-039 Data Center (yellow monochrome gowned fab vs black racks with LED points). Cistern vs SP07-038 Ossuary (flooded columns vs dry carved niches). Cold War Bunker vs SP07-034 Institutional Ruin (intact and in use vs abandoned decay). White-Cube vs SP07-001 Modern Minimalist (exhibition box with a single spotlit object vs domestic joinery). Names were checked against all presets. A turbine hall was considered and dropped because it is too close to the pumping station.

## Unsure

- The category review says the old names "force a place through euphemistic names" (Bibliographic Classicism, Casino Sensory Grid, Arboreal Craft Shelter). The brief allows renames only for persons, brands or duplicates, so they are kept. The DNA now carries the materials rather than the place. A later rename pass could be considered.

## Pending (local session)

- Generate the 3-card sets with `--card-set` and review. The key check: the "applied to" cards must show the requested room (bakery, barbershop, breakfast room) and not a station, library or casino floor.
- Remove `pending` from the eleven new presets after review.
