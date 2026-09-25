# pack_07 :: 1. Interior Design Systems — audit

Audited 2026-09-25 from the contact sheet of current cards (16 primaries, no variants) and full manifests. Category kind: theme. Review rule: preserve the requested room function and constraints; do not add the sample furniture bundle.

## Findings

Category-wide:

- All 16 DNA blocks were the shared template ("acts as a transferable architecture/interior router: …") with the same seven fields for every preset. Only the first five `key_features` tags differed, so nothing said how each system is built: joinery, floor, wall finish, light source, textile.
- The negatives fought the category rule. Template rules like `sofa`, `lamp`, `curtain`, `kitchen appliance`, `corridor`, `dining table`, `person`, `weapon`, `basement`, `modern` blocked rooms and objects a prompt may ask for. Many rules were garbled (`mandatory interior interior zones`, `showroom living interior zones`).
- The cards look like one furniture catalog: 10 of 16 are sunlit living rooms with a big view window, an olive branch in a vase and a coffee table. Nothing shows that the system could restyle a different room.
- SP07-013 Mediterranean Villa shows an exterior courtyard, not an interior. SP07-016 Bauhaus shows a replica of a well-known designer lounge chair. SP07-014 Cyberpunk shows a clean kitchen in daylight with a skyline.

| Preset                     | Card defect                                                                    |
| -------------------------- | ------------------------------------------------------------------------------ |
| SP07-001 Modern Minimalist | white sofa + view window; reads as a generic render, no shadow gaps or joinery |
| SP07-002 Industrial Loft   | empty loft, strong trusses and glazing; acceptable but no function             |
| SP07-003 Mid-Century       | lounge chair + credenza + view + olive branch: catalog formula                 |
| SP07-004 Scandi Hygge      | beige living room with olive tree; no small warm lights or northern dusk       |
| SP07-005 Bohemian          | dense and correct, but another living room                                     |
| SP07-008 Japanese Zen      | shoji and tatami correct; empty room with a table                              |
| SP07-011 Penthouse         | skyline postcard (the preset's own negative)                                   |
| SP07-012 Rustic Cabin      | fireplace tableau (the preset's own negative)                                  |
| SP07-013 Mediterranean     | exterior courtyard with an olive tree; not an interior                         |
| SP07-014 Cyberpunk         | clean daytime kitchen with a skyline; no neon, no cable density                |
| SP07-015 Victorian         | staircase, strong pattern; good                                                |
| SP07-016 Bauhaus           | glass dining table plus a designer lounge-chair replica                        |
| SP07-017 Maximalist        | strong, but living room with fireplace again                                   |
| SP07-018 Farmhouse         | dining table (the preset's own negative)                                       |
| SP07-019 Art Nouveau       | stair and stained glass; good                                                  |
| SP07-020 Memphis           | strong and distinctive                                                         |

## Changes

- DNA rewritten for all 16 (version 2). A shared `subject_treatment` states the theme contract: keep the room function, occupants and action; rebuild shell, surfaces, joinery, furniture vocabulary and light; add only what that room needs. Each field now names the construction: shadow gaps and push-latch joinery (Minimalist), riveted trusses and gridded window shadow (Loft), tapered splayed legs and book-matched walnut (Mid-Century), tatami module and washi light (Zen), book-matched marble and layered cove light (Penthouse), saddle-notched logs and adze marks (Cabin), deep reveals and shutter light bars (Mediterranean), surface-run cable looms and outside neon spill (Cyberpunk), and so on.
- `dropAvoid` removes the room-blocking and garbled template negatives on all 16. Added category guards: `furniture catalog staging`, `olive branch in a vase as default decor`, `panoramic window view as default backdrop`, `real designer furniture replicas`, `replacing the requested room with a living room`.
- No renames (no person, brand or duplicate names).
- 60 briefs: every brief restyles a different room function (scriptorium, armoury, alchemist laboratory, séance parlor, dragon hoard vault, back-room clinic, dentist's office, laundromat …), which tests the rule that the system restyles the room and does not replace it. Dark fantasy is used where it fits. No living rooms, no trams, buses, cyclists or umbrellas, and no subject is repeated.
- New presets (pending cards), category now 20:
  - **Shaker Peg-Rail Interior**: peg rail, built-in drawer walls, milk paint, oval bentwood boxes.
  - **Wabi-Sabi Earthen Interior**: cracked clay plaster, gold-seamed repaired ceramics, raking single light. Its negatives exclude the tatami module so that it stays separate from Japanese Zen.
  - **Arts and Crafts Inglenook**: quarter-sawn oak, pegged through-tenons, built-in hearth nook, hammered copper.
  - **Space-Age Fiberglass Interior**: molded white shells, conversation pit, shag, porthole openings.
- Overlaps checked: Space-Age vs SP07-010 Futuristic Pod (megastructure category, a sci-fi habitat, not a 1960s domestic interior). Arts and Crafts vs SP07-015 Victorian (Victorian = dense brocade and French polish; Arts and Crafts = exposed pegged joinery and no clutter, listed in its negatives). Shaker vs Farmhouse Chic (Shaker = peg rail, built-ins and no ornament; Farmhouse = shiplap and barn doors). Bauhaus Interior vs SP07-025 Bauhaus Architecture (interior furniture and planes vs building mass). Names were checked against all presets.

## Pending (local session)

- Generate the 3-card sets with `--card-set` and review. Check that each card shows the named room function, not a living room, and that no card contains a recognisable designer-chair replica.
- Remove `pending` from the four new presets after review.
