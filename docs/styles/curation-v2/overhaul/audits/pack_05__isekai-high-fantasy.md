# pack_05 :: 3. Isekai & High Fantasy — audit

Audited 2026-09-25 from the contact sheet (30 primaries + 22 variants) and full manifests. The category has 30 presets, so no new presets were added. Review line: `kind=mixed`; validation "A neutral household task must not become a fantasy quest or cooking vignette."

## Findings

- **27 of 30 names were anime titles** (Frieren, Shield Hero, Delicious in Dungeon, Campfire Cooking, Tsukimichi, Handyman Saitou, Ranking of Kings, Princess Connect, Sword Art Online, Re:Zero, Mushoku Tensei, Konosuba, "Slime Isekai", DanMachi, Twelve Kingdoms, Escaflowne, Magi, Bookworm, Faraway Paladin, Saint's Magic Power, Fushigi Yuugi, Rayearth, No Game No Life, Tanya, Overlord, Ancient Magus' Bride, Inuyasha). The card generator writes the name into the card prompt, so the names asked for those shows.
- The DNA was not template text, but it was abstract and interchangeable. Almost every preset read as "cel illustration with X contours, Y accents, restrained glow". It said little about how each look is made (line color and weight, shadow tiers, background painting, airbrush, bloom, grain, print texture). That explains why the cards collapsed into one look.
- Cards:
  - **Repeated trope:** a hooded young adventurer holding a glowing orb in front of a portal arch or glowing doorway appears in 099-01, 252-01, 257-01, 258-01, 259-01, 245-01, 246-01, 253-01, 254-01, 255-01 and 256-01.
  - Primaries often fall back to empty scenery. There are three sunsets over water (095, 259, 250) and three stone bridges (099, 242, 250). 091 and 098 are both a glass pavilion by a pool.
  - **Off-style cards:** 248 (a photographic bowl), 258 (photoreal hands on a brass box), 244 (a photographed textile on a chair), 097 (a grey 3D cathedral), 255 (a jewel vehicle that looks like a bus) and 096/094-01 (vector emblems rather than anime cel).
  - 241 shows a group huddled over a map table. 252 and 248-01 are cooking scenes, which the validation rule forbids.
- No card shows a recognizable canon character, but 252-01, 259-01 and 255-01 have generic "isekai protagonist" costumes.

## Changes

- **Renamed 27 presets** to their visual mechanism. IDs are unchanged and the old names are in `export const aliases`:
  - Faded-Line Pale Wash Cel
  - Worn Bronze Concentric-Line Cel
  - Naturalist Sketchbook Anime Cel
  - Amber Dusk Rounded Cel
  - Slate Twilight Single-Violet Cel
  - Fine-Line Brass Glint Cel
  - Picture-Book Crayon Line Anime
  - Candy Pastel Bloom Cel
  - Cyan Crystal-Facet Glow Cel
  - Violet Echo-Line Gothic Cel
  - Sepia Moss Dry-Brush Cel
  - Springy Comic-Timing Cel
  - Rounded Sky-Blue Friendly Cel
  - Vertical Mineral Amber Cel
  - Tall Textile-Rhythm Formal Cel
  - Carmine Angular Windswept Cel
  - Jewel Arabesque Curve Cel
  - Indigo Block-Print Cel
  - Grounded Matte Geometry Cel
  - Glass-Green High-Key Herbarium Cel
  - Lavender Halo-Arc Shoujo Cel
  - Gem-Facet Rising-Line Cel
  - Hyper-Saturated Impossible Perspective Cel
  - Khaki Compressed-Diagonal Cel
  - Ivory-Charcoal Baroque Symmetry Cel
  - Lilac Thorn-Line Chiaroscuro Cel
  - Vermilion Indigo Tapered-Ink Cel

  The names were checked against every preset name in the repo (lint), and there are no clashes. Kept: Systemic Cooperation Grid Style, Smoke-Mud Vulnerability Style and Classic OVA Quest Tapestry Style ("OVA" is a release format, not a title).

- **Rewrote the DNA of all 30 presets.** Each keeps its former identity (palette, mood, contour idea) and now names a concrete mechanism:
  - fading warm-grey lineart on watercolor boards
  - nested concentric contour echoes
  - naturalist pen lineart with specimen-plate staging
  - wobbly colored pencil and crayon
  - colored lineart with lavender-tinted shadows and a bloom pass
  - silver after-image echo lines
  - OVA airbrushed highlight bands with film grain and cel dust
  - relief-print indigo blocks with misregistration
  - chromatic-aberration impossible perspective
  - and so on.

  Near neighbours were separated:
  - 253 is high-key glass green; 247 is lilac chiaroscuro with thorn lines.
  - 093 has crisp cel figures on painterly backgrounds; 242 is smudged lost edges throughout.
  - 246 uses arabesque S-curves; 255 uses upward lines with gem facets.
  - 243 is the analog OVA look; 245 and 256 are specific 1990s line languages.

  Franchise names were removed from the DNA. The only remnant is a generic "mascot creature" guard.

- `subject_treatment` is one shared contract (a const) plus a preset-specific sentence: keep the subject, action, setting and camera, redraw them in the finish, and never turn a neutral household task into a quest, battle or cooking vignette. A category `AVOID` adds these negatives: hooded youth holding a glowing orb, glowing portal archway, generic cloaked adventurer, household task turned into a quest or cooking scene, photorealistic rendering, franchise character design. Preset-specific negatives target each card defect (glass pavilion, stone bridge at sunset, gem-studded vehicle, grey 3D render, map table, product shot).
- **90 new briefs** with original adult characters and no repeated subject across the category. Most lean toward dark medieval or high fantasy: gate warden, bell hauling, armored beetle, clock keeper, siege trench, colossal statue, antlered spirit, fox spirit, and others. **26 presets have one brief that is a plain household chore or daily task** (darning, sweeping snow, ironing, folding a fitted sheet, beating a futon, laying silverware), which proves the validation rule. No brief contains food preparation, a portal, an orb-holder, a bridge or a sunset lake.

## Pending (local session)

- Generate the `--card-set` and check that the orb-and-portal trope and the photographic or 3D cards are gone.
- Check that the household-chore cards stay chores.
- Check that 243 and 245/256 really show different eras (analog OVA grain versus angular 1990s line).
- Check that 259 reads as crayon, not glossy anime.
- Unsure: "Tapestry" stays in the 243 name and could pull a tapestry layout (mitigated with a `tapestry layout` avoid). The kept name "Systemic Cooperation Grid Style" is abstract; a rename was not required by the rules.
