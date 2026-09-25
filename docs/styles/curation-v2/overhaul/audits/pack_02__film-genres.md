# pack_02 :: 1. Film Genres — audit

Audited 2026-09-25 from the contact sheet (16 primaries) and full manifests.

## Category-wide defects

- All 16 DNA blocks were the "transferable cinematic-media router" template with the same "lens grammar, film stock behavior, genre blocking, projection texture" filler.
- **Real people and franchises in active fields**: "Sergio Leone style", "Morricone mood" (SP02-002), "Blade Runner aesthetic" (SP02-003), "Godzilla 1954" (SP02-009), "Ghost in the Shell style" (SP02-011), "rebel olive, droid beige" (SP02-016), plus real names in two preset names (SP02-010 "Shaw Brothers", SP02-012 "Wes Anderson"). Preset names are injected into the prompt through `creative_brief`, so these asked for the originals.
- **Card likeness violations**: SP02-007 Silent Film shows a recognizable tramp comedian; SP02-009 shows a Godzilla-like monster.
- Genre DNA added costumes, sets and plot by default, against the review rule that a domestic activity keeps its setting under noir.
- Repeated subjects: a lighthouse in SP02-001 and SP02-013; a wet street with a car and neon in SP02-006 (trope).

## Per-preset card defects

| Preset                         | Card defect                                        |
| ------------------------------ | -------------------------------------------------- |
| SP02-001 Film Noir             | lighthouse; noir light fine                        |
| SP02-002 Spaghetti Western     | generic cowboy, no close-up or widescreen tension  |
| SP02-003 80s Sci-Fi            | astronaut cockpit; neon reads, franchise-coded     |
| SP02-004 Technicolor Musical   | dancing couple; acceptable                         |
| SP02-005 French New Wave       | café couple in color, not New Wave                 |
| SP02-006 Grindhouse            | wet street, car and neon sign (trope); damage weak |
| SP02-007 Silent Film           | **recognizable tramp comedian**                    |
| SP02-008 Found Footage         | panicked woman in a tunnel; acceptable             |
| SP02-009 Kaiju                 | **Godzilla-like creature**                         |
| SP02-010 Kung Fu Studio        | leaping fighter; acceptable                        |
| SP02-011 Cyberpunk Anime       | reads as generic digital anime, not 90s cels       |
| SP02-012 Symmetrical Storybook | taxidermist; symmetry fine                         |
| SP02-013 Teal & Orange         | lifeboat and lighthouse                            |
| SP02-014 Giallo                | red corridor woman; acceptable                     |
| SP02-015 Mumblecore            | couple with boxes; acceptable                      |
| SP02-016 Space Opera (70s)     | franchise-coded pilot and fighter                  |

## Changes

- DNA rewritten for all 16 (version 2) as cinema treatments: camera, light, stock and grade transfer; costumes, sets and plots do not unless the prompt asks. Every franchise and real-name reference was removed from the active fields and negatives were added (`franchise likeness`, `recognizable film character`, `real actor likeness`, `famous monster design`, `tramp comedian costume`).
- Renamed SP02-010 to **70s Kung Fu Studio Epic** and SP02-012 to **Symmetrical Storybook Cinema**.
- Kaiju (SP02-009) keeps its miniature-and-suit mechanism but no longer adds a monster to prompts that do not ask for one; its cards use original creatures.
- 3 new briefs per preset, all original characters, no repeated subject.
- New presets (pending cards): German Expressionist Cinema, 80s Sword-and-Sorcery Film, Italian Neorealism, Peplum Sword-and-Sandal Epic. Checked against Gothic Horror (pack_11 aesthetic), Tape-Scanned Sword & Sorcery (pack_17 print zine) and Folk Horror Punk (pack_15): different media.
- Related fix in pack_01: SP01-047 renamed Zone System Landscape for the same reason.

## Pending (local session)

- Regenerate the cards; SP02-007 and SP02-009 must be regenerated before anything else because their current cards are likeness violations.
