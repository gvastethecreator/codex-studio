# pack_04 :: 1. Comic Book Styles — audit

Audited 2026-09-25 from the contact sheet (14 primaries + 16 variants) and full manifests. The category had 14 presets; 6 are added.

## Findings

- All 14 DNA blocks were the router template ("acts as a transferable illustration router", "treat color as comic production language …"), each field ending in the same generic list of comic media, so the presets differed only by a few pasted tag words.
- The DNA named real people and a franchise: Superman (SP04-001), R. Crumb (SP04-009), Alex Ross and Norman Rockwell (SP04-010), Junji Ito (SP04-011), Moebius (SP04-012). The template also asked every preset for "panel logic" and "speech-shape space", which works against the review rule that a single image must not grow panels or balloons.
- Names: SP04-008 used a film/comic title (Sin City), SP04-011 and SP04-012 used artists' names.

| Preset              | Card defects                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| SP04-001            | Variant 01 shows a square-jawed hero who reads as Superman; a lighthouse in the primary.            |
| SP04-002            | Variant 01 is a caped hero with a chest emblem, very close to a known character.                    |
| SP04-003            | Generic muscular suit hero on a skyline in both cards; nothing specific to the medium beyond gloss. |
| SP04-005 / SP04-006 | Generic long-haired young woman in two cards and a generic brunette in the rain.                    |
| SP04-009            | Bus-stop sign and tram in the primary (trope).                                                      |
| SP04-010            | Firefighter card is a painting with no graphic-novel identity.                                      |
| SP04-014            | Primary looks like a high-resolution painting, not pixels.                                          |
| SP04-016            | Three near-identical dark-coat figures in cyan-magenta.                                             |

## Changes

- DNA rewritten for all 14 (version 2), each around one mechanism: four-color Ben-Day newsprint, energy-dot crackle, glossy digital rim-lit color, G-pen plus screentone, floral screentone and sparkles, two-step webtoon cel shading on gradients, uniform clear line, binary black and white carving, obsessive crosshatch, outline-free gouache, obsessive fine-line hatching, stipple plus pastel matte color, one-pixel outlines with dither, cyan-magenta duotone on black.
- One shared `subject_treatment` states the review rule: redraw the subject as one image and never add panels, gutters, balloons, captions or sound effects. Every brief ends with "Single image, no panels, balloons, text or logo." The shared negatives add panels, balloons, sound-effect lettering and known hero emblems.
- Renamed (old names kept as aliases): SP04-008 **Binary Ink Noir Comic**, SP04-011 **Obsessive Fine-Line Horror Manga**, SP04-012 **Dreamline Stipple Sci-Fi Comic**. Artist and franchise names were removed from all DNA.
- SP04-014 now describes comic inking made in pixels (one-pixel outlines, ordered dither as halftone), which separates it from pack_06 Pixel Art (16-bit). SP04-016 drops the inherited `nature` negative, which blocked subject transfer.
- New presets: **Gekiga Drybrush Realism**, **Greywash Horror Magazine**, **Feathered-Brush Adventure Strip**, **Airbrush Manhua Action**, **Non-Photo Blue Pencils**, **Direct-Color Album Watercolor**. Overlap checked by grep: no gekiga, manhua, direct-color or comic ink-wash preset exists. pack_22 has Screen-Tone Manga and Halftone Pop Manga, and pack_04 Ink And Print has Brush Pen Ink and Monotype; the new presets are defined by comic production stages and schools, not by those media alone.
- 60 briefs, no repeated subject; original heroes only (paladin, storm-caller, star-titan), no trams, buses or lighthouses.

## Pending (local session)

- Generate the cards. Check that none of them adds panels or balloons, that SP04-001/002/003 heroes do not look like known characters, and that SP04-014 renders at a visible pixel grid.
