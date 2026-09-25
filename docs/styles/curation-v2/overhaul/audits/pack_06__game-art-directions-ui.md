# pack_06 :: 7. Game Art Directions & UI — audit

Audited 2026-09-25 from the contact sheet (20 primaries) and full manifests. The category already has 20 presets; none added.

## Findings

- All 20 DNA blocks were the art-medium router template; every key_features ended with the same shared tail ("gameplay-readable hierarchy, genre-specific surface language, UI-aware composition, and production-art clarity"), so presets differed only by their first clause.
- The review rule (a sprite stays an asset unless gameplay or an interface is requested) was not stated: asset, art-direction and interface presets all used the same "transform any subject" wording.
- Two names came from game titles: "Metroidvania" (two franchise titles joined) and "Soulslike Tarnished" (a game series plus a protagonist title).
- SP06-103 carried `background scene` in its negatives although parallax layers are its technique; SP06-119 carried it although the cozy palette applies to scenes.

| Preset                   | Card defect                                                            |
| ------------------------ | ---------------------------------------------------------------------- |
| SP06-105 Fighting Select | **shows two well-known fighting-game characters** (franchise likeness) |
| SP06-104 Cyberpunk HUD   | generic young woman's face in a helmet                                 |
| SP06-108 VN Backdrop     | couple on a rooftop; a backdrop should be empty                        |
| SP06-111 Battle Royale   | close to a well-known battle royale's look and cast                    |
| SP06-114 Gacha Foil      | generic anime woman, no visible foil frame                             |
| SP06-117 Arcade Racing   | generic sports car, reads as a licensed car ad                         |
| SP06-101 JRPG Diorama    | spiky-haired hero in the familiar JRPG pose                            |
| SP06-109 / SP06-120      | same caped swordsman seen from behind in both                          |

SP06-102, 106, 110, 112, 113, 118 cards read as intended assets or panels; 115 and 116 are acceptable moods.

## Changes

- DNA rewritten for all 20 (version 2) under three stated contracts:
  - **assets** (Isometric Strategy Tile, Chibi Platformer Sprite, Sci-Fi Arsenal Icon Kit, RPG Pixel Inventory Icons, Roguelike Tile Glyph): subject isolated on a plain field; a scene or interface only when requested;
  - **art directions** (Eroded Grandeur, Battle Royale Colorway, Survival Horror Save-Room, Stealth, Arcade Racing, Cozy Sim, VN Backdrop): keep subject, setting and camera; set palette, light, shape and finish;
  - **owned layouts** (Pixel Diorama camera, Side-Scroll parallax view, Diegetic HUD, Fighter Select, MMO Parchment panel, Gacha card frame, MOBA splash, Boss key art): the layout is stated, and panels stay blank with no text or numbers.
- Distinct mechanisms per preset: pixel sprites inside a tilt-shifted 3D diorama (not the flat tile map of SP06-086); pictograph tiles on black (not the character map of SP06-089); 2:1 bevel-edged tiles with cross-section sides (not SP04-052 Isometric Game Art scenes); lit and unlit stealth zones; single lamp pool from a fixed high corner; rarity tints against a violet storm gradient.
- Renamed 2 (old names in `aliases`): SP06-103 → **Side-Scroll Parallax Gloom**, SP06-109 → **Eroded Grandeur Dark Fantasy**. Other genre words (JRPG, MOBA, gacha, roguelike, cyberpunk, survival horror) are genre names, not titles, and were kept.
- `dropAvoid: background scene` on SP06-103 and SP06-119. New shared negatives: copied game characters, known HUD layouts, readable interface text, numbers and stat values, studio logos. Fighter Select negatives add known fighting-game characters and readable names.
- 60 new briefs with original characters and creatures (minotaur wrestler, clockwork fencer, tide priestess, thunder qilin, moth queen); no subject repeats; the VN backdrops contain no people.

## Pending (local session)

- Regenerate SP06-105 first and reject any card that resembles an existing fighting-game roster.
- Confirm that interface cards (HUD, parchment, gacha, select screen) render blank panels with no letters or digits.
