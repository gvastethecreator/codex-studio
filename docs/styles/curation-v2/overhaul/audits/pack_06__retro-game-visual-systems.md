# pack_06 :: 6. Retro Game Visual Systems — audit

Audited 2026-09-25 from the contact sheet (20 primaries) and full manifests. The category already has 20 presets; none added.

## Findings

- All 20 DNA blocks were the art-medium router template with tag lists pasted into each field.
- **Franchise and brand anchors everywhere in the active DNA**: key_features and rendering named specific games and platforms (Final Fantasy VI, Super Mario Kart, Asteroids, Tempest, Battlezone, Donkey Kong Country, Killer Instinct, Fate/stay night, Yume Nikki, Ib, Advance Wars, Fire Emblem, Silent Hill, Metal Gear Solid, Dwarf Fortress, NetHack, Minecraft, 3D Dot Game Heroes, Metal Slug, King of Fighters, Samurai Shodown, Sonic, Streets of Rage, Defender of the Crown, Shadow of the Beast, Bonk, Rondo of Blood, Hudson Soft, Konami). These pull copied characters and HUDs into cards.
- **15 names were console, computer or software brands** (Game Boy, SNES, RPG Maker, GBA, PSX, Vectrex, C64/Commodore, MSX2, Atari 2600, Sega Genesis, Neo Geo, Amiga DeluxePaint, TurboGrafx PC Engine, DS Flipnote Studio, Game Boy Camera).
- The review rule (a fixed-camera subject shows cluster differences; perspective changes need the profile) was not stated: Mode 7, tile map, tactics grid and text-mode map silently changed the camera.
- Odd inherited negatives: `western` (SP06-093, SP06-098), `Nintendo`, `CGA`, `weak`, `slow` (SP06-098), `PC` (SP06-097), `weak hardware` (SP06-096), and `color` on the stylus memo preset whose red/blue ink is part of the medium.

| Preset                | Card defect                                              |
| --------------------- | -------------------------------------------------------- |
| SP06-084 FMV Sprites  | photoreal pilot and jet, no sprite reduction             |
| SP06-085 Visual Novel | generic brunette on a train platform                     |
| SP06-086 RPG Maker    | sci-fi hangar, not a chibi tile map                      |
| SP06-089 ANSI         | green blobs, no glyphs or box walls                      |
| SP06-092 C64          | 16-bit-looking river map, too many colors, square pixels |
| SP06-093 MSX2         | maze close to a famous arcade maze                       |
| SP06-094 Atari 2600   | island with a lighthouse (trope)                         |
| SP06-096 / 097        | two generic 16-bit waterfalls, indistinguishable         |
| SP06-098 PC Engine    | futuristic hover racer close to a known racing game      |
| SP06-099 Flipnote     | draws the handheld console itself                        |
| SP06-100 Camera Print | generic couple selfie                                    |

SP06-081, 082, 083, 088, 091 cards read correctly; 087 and 090 are acceptable.

## Changes

- DNA rewritten for all 20 (version 2), naming the actual hardware mechanism instead of games: four olive shades and LCD ghosting; affine-scaled floor plane with horizon shimmer; color vector lines with vertex hot spots; ray-traced models crunched into sprites with matte halos; 8x1 line clash; double-wide pixels with 4x8 cell limits; one color per scanline; vertical-stripe dither instead of alpha; hold-and-modify fringing and per-scanline gradient bars; affine warping and vertex snapping; Bayer-dithered 128x112 thermal print.
- Contract: display systems keep the requested camera. Mode 7 Floor-Plane Vista, Visual Novel Screen, Chibi Top-Down Tileworld, Handheld Tactics Grid Pixel and Text-Mode Roguelike ANSI are declared profiles that own their camera or screen layout. None may add a score, health bar or readable interface text; the visual-novel text box stays empty.
- Renamed 15 (old names in `aliases`): Four-Shade Pea-Green LCD, Mode 7 Floor-Plane Vista, Chibi Top-Down Tileworld, Handheld Tactics Grid Pixel, 32-Bit Vertex Wobble, White Beam Vector with Color Overlay, Fat-Pixel 16-Color Home Computer, Bright Line-Clash Home Micro, Scanline Stripe Block Minimalism, Dither-Heavy 16-Bit Console, Dense Arcade Mega-Sprite, HAM Copper-Gradient Paint, Candy-Bright Compact Sprite, Stylus Memo Flipbook Doodle, Pocket Camera Thermal Dot Print.
- Near-duplicates separated: the two vector presets are now color multi-line wireframe (SP06-083) versus white beam tinted by an overlay sheet (SP06-091); the two 16-bit presets are dither-heavy dark palette (SP06-095) versus candy-bright compact sprites (SP06-098); Voxel Block Sprites is a standalone coarse model on a ground tile, distinct from SP06-052 Voxel Art and SP03-022 Voxel Art. Text-Mode Roguelike ANSI is a map profile, distinct from SP06-060 ASCII Art (tonal glyph rendering).
- `dropAvoid` removes the odd brand and "weak" negatives listed above, plus `color` on the stylus memo preset. New negatives forbid copied game characters, console hardware in frame, score counters and publisher logos; negatives do not describe specific characters, so they cannot prime them (only a generic "block mining game likeness" on the voxel preset).
- 60 new briefs with original subjects and fixed cameras for the palette presets so cluster differences show; no dragons, knights or castles repeated across presets.

## Pending (local session)

- Generate cards; check that Candy-Bright, Dither-Heavy and HAM cards are visibly different, and that no card shows a console, a HUD or a known game character.
- Text-Mode Roguelike cards must use isolated symbols only; reject any card that forms readable words.
