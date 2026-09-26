import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Grimdark game systems and tabletop: dark game-camera and tabletop looks as descriptors. Nine
// originals get card briefs; eleven new studies add deckbuilder card art, roguelike death
// tableaux, terrain dioramas, boss arenas, fixed-camera castle horror, loot rarity glow, squad
// tactics grids, painted point-and-click crypts, army painting step guides, macro miniature
// photos and stress-break hero portraits.
const study = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  avoid: string[],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'grimdark-game', 'portable-style-study'],
  dna: dna(fields),
  avoid: [...avoid, 'gore', 'interface text, menus or health bars', 'existing game characters or logos', ...STYLE_AVOID],
  briefs,
});

const keep = 'Preserve the requested identity, count, pose and action with original characters';

const spec: Spec = {
  pack: 'pack_17',
  category: '5. Grimdark Game Systems & Tabletop',
  updates: {
    'SP17-064': { briefs: [
      'Crawling out of a one-bit crypt tile by tile, a giant skeletal serpent coils around a lone hero holding a single dithered candle against the black. No readable text or logo.',
      'Built from hard tile silhouettes, a dungeon rat has stolen the hero\'s only key and is sitting on it with total confidence. No readable text or logo.',
      "Rendered in stark one-bit pixels, a dungeon well glitters with dithered water, and each time the torch flickers the reflection shows a different room. No readable text or logo.",
    ] },
    'SP17-065': { briefs: [
      'Seen from a high isometric angle, a lone warrior fights a horned demon lord on an ashen cathedral floor, glowing loot scattered across the cracked tiles. No readable text or logo.',
      'On a smoky isometric dungeon floor, a hero finally opens a treasure chest after a long battle and finds exactly one gold coin and a crumpled blank apology card. No readable text or logo.',
      'Seen from above, an ash-covered crypt floor has a trail of glowing footprints leading to a wall with no door. No readable text or logo.',
    ] },
    'SP17-066': { briefs: [
      "Spotting a colossal bone guardian waking on the level below, a torch-bearer freezes on a black glassy stair of the catacomb, lit only by pale bone highlights. No readable text or logo.",
      "Stacking skulls by size on severe black tiles, a skeleton trying to organize the crypt has run out of small ones. No readable text or logo.",
      'Looking down into an obsidian stairwell, each level is darker than the one above, and on the lowest level a single bone-white hand rests on the rail. No readable text or logo.',
    ] },
    'SP17-067': { briefs: [
      'Staring out with a scar across her jaw and a lantern at her belt, a veteran dwarf ranger in lived-in leather holds a crossbow bigger than her torso. No readable text or logo.',
      'Posing for his adventurer portrait with total confidence, a half-orc cleric has a small bird nest tangled in his enormous beard. No readable text or logo.',
      'Painted as a sturdy portrait, an old mercenary looks straight out, and the reflection in his steel helmet shows a figure standing behind the painter. No readable text or logo.',
    ] },
    'SP17-068': { briefs: [
      'Emerging from a rusted vault door covered in hazard sigils, a knight in scavenged metal plates leads survivors into a poisoned medieval wasteland. No readable text or logo.',
      "Trying very hard to work out an old radio, a medieval survivor hits it with a mace inside a corroded retro-future bunker. No readable text or logo.",
      "Sealed deep in a rusted vault, an old intercom crackles with a lullaby, and the dust on its speaker grille is freshly disturbed. No readable text or logo.",
    ] },
    'SP17-069': { briefs: [
      'Opening where the altar should be, a starless void swallows a chapel\'s arches as warped halos spin above kneeling monks who dare not look up. No readable text or logo.',
      'In a chapel bent by cosmic geometry, a monk tries to light a candle that keeps floating away into the impossible ceiling. No readable text or logo.',
      'In a quiet chapel, one arch leads to a corridor that is visibly longer than the building. No readable text or logo.',
    ] },
    'SP17-070': { briefs: [
      'Pulsing inside a cathedral of black iron and tendon cables, a vast biomechanical reliquary breathes slowly as monks feed it candles through bone housings. No readable text or logo.',
      'Covered in tendon cables and bone plates, a reliquary machine designed to terrify pilgrims has been lovingly decorated with flowers by the kindly old nuns of the abbey. No readable text or logo.',
      'In a dark iron chapel, a bone-housed machine sits motionless, but one tendon cable is slowly tightening. No readable text or logo.',
    ] },
    'SP17-071': { briefs: [
      'Towering over a ruined future city, black scaffold machines shaped like cathedral cages march in a line while a lone figure stands defiant before them. No readable text or logo.',
      "Among black scaffolds and rusted exoskeletons, a repair crew of goblins tries to fix a vast ritual machine that is beyond saving. No readable text or logo.",
      'In a silent field of rusted restraint frames, one frame stands open, and its chains are still swinging. No readable text or logo.',
    ] },
    'SP17-072': { briefs: [
      'Advancing through a trench lined with ruined cathedral stones, a knight with a gaslight lantern marches beneath drone silhouettes wearing heraldic banners. No readable text or logo.',
      "Making tea on a stove built from an old heraldic shield, a tired soldier sits in a trench that seems to stretch on forever. No readable text or logo.",
      'Above a ruined battlefield of cathedral stones, a single drone hangs silent in the air, its heraldic banner fluttering without wind. No readable text or logo.',
    ] },
  },
  creates: [
    study('Dark Deckbuilder Card Art', 'grim card-battle illustration', 'deckbuilder-art', {
      aesthetic: 'Dark deckbuilder card art: small bold painted card illustrations for a grim card-battle game, one clear action or creature per card with a heavy dark vignette.',
      subject_treatment: `${keep}; paint the subject as one clear bold action or creature for a small card.`,
      color_and_tone: 'Dark muted grounds with one saturated focal color.',
      lighting_and_shadow: "Strong focal light and heavy vignette, kept consistent across the whole image.",
      texture_and_material: "Chunky painterly strokes and simple forms, kept consistent across the whole image.",
      camera_and_composition: "Centered action readable at small size, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with grim tactical punch.',
      rendering_and_quality: "Bold readable illustration with no card text, kept consistent across the whole image.",
      key_features: 'one action per card; heavy vignette; bold shapes; focal color',
    }, ['card text or numbers'], [
      'Striking out of a dark vignette, a single armored gauntlet crushes a glowing heart-shaped crystal, the only red on the whole card. No readable text or logo.',
      "Painted as a bold card action, a knight attempts a mighty block with a shield that is just a frying pan. No readable text or logo.",
      'Framed by a heavy dark vignette, a single candle burns on a card, and the shadow it throws is reaching back toward the flame. No readable text or logo.',
    ]),
    study('Permadeath Roguelike Tableau', 'roguelike defeat scene', 'roguelike-tableau', {
      aesthetic: 'Permadeath roguelike tableau: the frozen moment after a hero falls in a procedural dungeon, fallen gear, lingering monsters and a quiet grim stillness.',
      subject_treatment: `${keep}; freeze the subject in the quiet moment just after a fatal defeat, without gore.`,
      color_and_tone: 'Desaturated dungeon tones with one fading warm light.',
      lighting_and_shadow: 'A last torch or spell light fading into dark.',
      texture_and_material: "Stone tiles, dropped gear, dust and ash, kept consistent across the whole image.",
      camera_and_composition: "Top-down or three-quarter dungeon room view, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with bleak restart melancholy.',
      rendering_and_quality: "Clear readable scene without gore or text, kept consistent across the whole image.",
      key_features: 'fallen hero gear; fading light; lingering monster; dungeon room',
    }, ['gore', 'game over text'], [
      'Lying scattered on a procedural dungeon floor, a fallen hero\'s helmet, sword and fading torch are guarded by the enormous slime that won, now wearing the helmet itself. No readable text or logo.',
      'Right after a hero falls, a tiny goblin who dealt the final blow looks at the camera in total disbelief. No readable text or logo.',
      'In a quiet dungeon room, a fallen adventurer\'s lantern is still glowing, and a new adventurer who looks exactly like him is walking in. No readable text or logo.',
    ]),
    study('Grimdark Terrain Diorama', 'painted grim tabletop terrain', 'terrain-diorama', {
      aesthetic: 'Grimdark terrain diorama: a hand-built tabletop terrain piece of ruined chapels, barbed wire, skull piles and mud, painted and weathered like a hobby showpiece.',
      subject_treatment: `${keep}; set the subject on a hand-built grim terrain diorama base.`,
      color_and_tone: 'Mud browns, rust, bone and weathered stone greys.',
      lighting_and_shadow: "Hobby-photo lighting with soft shadows, kept consistent across the whole image.",
      texture_and_material: 'Sculpted foam stone, static grass, rust washes and drybrush.',
      camera_and_composition: "Close three-quarter view of the diorama base, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with meticulous hobby grimness.',
      rendering_and_quality: "Convincing physical miniature terrain, kept consistent across the whole image.",
      key_features: 'terrain diorama; drybrush weathering; ruined chapel; hobby base',
    }, [], [
      'Built on a hobby base of foam stone and rust washes, a ruined chapel diorama holds a tiny last stand of soldiers against a giant painted rat monster. No readable text or logo.',
      'On a lovingly weathered terrain piece, a single miniature soldier has been placed sitting on a skull pile, eating a sandwich. No readable text or logo.',
      'On a grim terrain base of mud and barbed wire, a ruined chapel door is painted open, and inside there is a tiny light that the painter did not add. No readable text or logo.',
    ]),
    study('Boss Arena Grim Vista', 'grim boss battle arena', 'boss-arena', {
      aesthetic: 'Boss arena grim vista: a vast ruined arena where a small hero faces an enormous boss creature, fog, broken pillars and a single dramatic light.',
      subject_treatment: `${keep}; set the subject as a tiny challenger facing an enormous foe in a ruined arena.`,
      color_and_tone: 'Grey fog, dark stone and one sickly or golden light.',
      lighting_and_shadow: "Dramatic shaft of light and deep fog, kept consistent across the whole image.",
      texture_and_material: "Broken stone, wet floor and creature hide, kept consistent across the whole image.",
      camera_and_composition: "Low wide angle with extreme scale contrast, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with dread before the fight.',
      rendering_and_quality: "Epic painterly scene with clear scale, kept consistent across the whole image.",
      key_features: 'huge boss; tiny hero; ruined arena; dramatic light',
    }, [], [
      'Rising from the fog of a ruined arena, a colossal antlered beast of bone and moss looms over a lone knight who raises a cracked shield beneath a single shaft of light. No readable text or logo.',
      'Standing in a vast foggy arena, a tiny hero faces an enormous boss who has just stepped on a toy and is hopping in pain. No readable text or logo.',
      'In an empty ruined arena, the fog has settled around the shape of something enormous that is lying perfectly still. No readable text or logo.',
    ]),
    study('Fixed-Camera Castle Horror', 'survival horror fixed camera frame', 'fixed-camera', {
      aesthetic: 'Fixed-camera castle horror: survival-horror framing from a high static corner camera in a gloomy castle, pre-rendered backgrounds and a small vulnerable figure.',
      subject_treatment: `${keep}; show the subject small from a static high corner camera in a gloomy room.`,
      color_and_tone: "Muted greens, browns and candle amber, kept consistent across the whole image.",
      lighting_and_shadow: "Dim pre-rendered lighting with deep corners, kept consistent across the whole image.",
      texture_and_material: "Detailed pre-rendered stone, wood and dusty fabrics, kept consistent across the whole image.",
      camera_and_composition: "Awkward high corner angle, off-center figure, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with claustrophobic suspense, kept consistent across the whole image.",
      rendering_and_quality: "Authentic static-camera horror frame, kept consistent across the whole image.",
      key_features: 'fixed corner camera; pre-rendered room; small figure; gloom',
    }, [], [
      'Seen from a high corner camera, a lone investigator steps into a castle dining hall where the long table is set for a feast and every chair has been turned to face her. No readable text or logo.',
      "From an awkward fixed angle, a survivor tries to push a heavy statue to solve a puzzle and has been pushing it the wrong way for an hour. No readable text or logo.",
      'From a static high camera, a long castle hallway is empty, but the portrait at the far end is now closer than it was. No readable text or logo.',
    ]),
    study('Grim Loot Rarity Glow', 'dark item with rarity aura', 'loot-rarity', {
      aesthetic: 'Grim loot rarity glow: a single dark fantasy item lying in the dirt, surrounded by a colored rarity aura of light beams and sparks rising into the dark.',
      subject_treatment: `${keep}; present the subject as a single glowing item with a colored rarity aura.`,
      color_and_tone: 'Dark earth tones with a vivid orange, violet or gold aura.',
      lighting_and_shadow: 'Upward beam of colored light from the item.',
      texture_and_material: "Dirty stone, worn metal and glowing particles, kept consistent across the whole image.",
      camera_and_composition: 'Low close view of the item with a vertical beam.',
      atmosphere_and_mood: 'Keep the requested mood with tempting treasure hunger.',
      rendering_and_quality: "Clear hero item with clean glow, kept consistent across the whole image.",
      key_features: 'single item; rarity light beam; dark ground; sparks',
    }, ['item names or stats'], [
      'Lying in the ashes of a burned-out camp, a cursed crown sends a violet beam into the night sky as three different adventurers creep toward it from the shadows. No readable text or logo.',
      'Surrounded by a legendary golden beam of light, the rarest item in the dungeon turns out to be a single wooden spoon. No readable text or logo.',
      'In a dark forest clearing, an orange rarity beam rises from the grass, but when the torch comes closer there is nothing on the ground. No readable text or logo.',
    ]),
    study('Grim Squad Tactics Grid', 'dark turn-based squad battle', 'squad-tactics', {
      aesthetic: 'Grim squad tactics grid: a top-down or angled grid battlefield where a small squad of dark fantasy units faces overwhelming odds in a ruined town.',
      subject_treatment: `${keep}; place the subject as squad units on a faint tactical grid in a ruined setting.`,
      color_and_tone: 'Muted ruins, dark greens and a single squad color.',
      lighting_and_shadow: "Overcast light with small unit shadows, kept consistent across the whole image.",
      texture_and_material: "Ruined masonry, mud and crisp unit figures, kept consistent across the whole image.",
      camera_and_composition: "Steep angled grid view with clear units, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with desperate calculation, kept consistent across the whole image.",
      rendering_and_quality: "Readable units with no interface, kept consistent across the whole image.",
      key_features: 'faint grid; small squad; ruined town; overwhelming odds',
    }, [], [
      'Pinned in a ruined chapel square on a faint grid, a squad of four mercenaries holds the line as a tide of ghouls pours in from every street. No readable text or logo.',
      'On a tactical grid, the whole squad waits in cover while one soldier has decided to take a nap in the open. No readable text or logo.',
      'On a ruined town grid, all enemy units have vanished, and only one square in the middle is darker than the rest. No readable text or logo.',
    ]),
    study('Painted Point-and-Click Crypt', 'hand-painted adventure game scene', 'point-click', {
      aesthetic: 'Painted point-and-click crypt: a hand-painted adventure-game background of a crypt or gothic interior, full of clickable-looking curious objects, with a small character.',
      subject_treatment: `${keep}; place the subject small in a richly painted gothic room full of curious objects.`,
      color_and_tone: "Moody painted greens, purples and candle gold, kept consistent across the whole image.",
      lighting_and_shadow: "Soft painterly light pools, kept consistent across the whole image.",
      texture_and_material: "Painted stone, curios, cobwebs and old books, kept consistent across the whole image.",
      camera_and_composition: "Side-on stage view with depth layers, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with curious spooky wit.',
      rendering_and_quality: 'Rich painted background with a clear small figure.',
      key_features: 'painted background; curious objects; small character; stage view',
    }, ['cursor or interface'], [
      "Holding a candle up to a sarcophagus whose carved face is winking, a young gravedigger explores a crypt full of curious objects. No readable text or logo.",
      "Having tried combining every item in her bag, an adventurer in a gothic study is now holding a rubber chicken tied to a skeleton key. No readable text or logo.",
      "Glowing faintly on a shelf of curios in a gothic crypt, one unlabeled jar is waiting for someone to notice it. No readable text or logo.",
    ]),
    study('Army Painting Step Guide', 'miniature painting progression', 'paint-steps', {
      aesthetic: 'Army painting step guide: the same grim miniature shown in several stages from grey primer to basecoat, wash and highlights, lined up like a hobby tutorial.',
      subject_treatment: `${keep}; show the subject as one miniature repeated across painting stages.`,
      color_and_tone: 'Progression from grey primer to full grim color.',
      lighting_and_shadow: "Even hobby-photo lighting, kept consistent across the whole image.",
      texture_and_material: "Primer, washes, drybrush and metallic paint, kept consistent across the whole image.",
      camera_and_composition: "Row of identical miniatures at different stages, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with patient hobby craft.',
      rendering_and_quality: "Clear stage differences without numbers, kept consistent across the whole image.",
      key_features: 'stage progression; identical miniatures; primer to finish; hobby',
    }, ['step numbers or labels'], [
      'Lined up from grey primer to finished paint, five copies of the same plague knight miniature grow darker and grimmer at each step until the last one looks truly alive. No readable text or logo.',
      "In a painting guide row, a miniature goblin gets better at every stage, except the last one, where the painter sneezed. No readable text or logo.",
      'Across a row of painting stages, the same hooded figure is painted step by step, and in the final stage its eyes have been painted open. No readable text or logo.',
    ]),
    study('Macro Grim Miniature Photo', 'close-up tabletop miniature photograph', 'macro-mini', {
      aesthetic: 'Macro grim miniature photo: an extreme close-up photograph of a painted grimdark miniature on a battlefield table, shallow depth of field and dramatic hobby lighting.',
      subject_treatment: `${keep}; photograph the subject as a painted miniature in extreme macro close-up.`,
      color_and_tone: "Rich painted colors with dark blurred background, kept consistent across the whole image.",
      lighting_and_shadow: "Dramatic small light source and rim light, kept consistent across the whole image.",
      texture_and_material: "Paint layers, brush marks and sculpted detail, kept consistent across the whole image.",
      camera_and_composition: "Macro lens with razor-thin focus, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with epic scale in miniature.',
      rendering_and_quality: "Convincing macro photography, kept consistent across the whole image.",
      key_features: 'macro focus; painted miniature; shallow depth; dramatic light',
    }, [], [
      'In an extreme macro shot, a painted war-priest miniature raises a glowing censer while an out-of-focus giant monster model looms behind him on the table. No readable text or logo.',
      "Shown in heroic detail with razor-thin focus, a proud painted general miniature has a real crumb of cookie resting on his shield. No readable text or logo.",
      "Blurred in the background of a battlefield table, a single painted figure is facing the camera while all the others face away. No readable text or logo.",
    ]),
    study('Stress-Break Hero Portrait', 'hero portrait under mental strain', 'stress-portrait', {
      aesthetic: 'Stress-break hero portrait: a gritty close portrait of an adventurer at the breaking point, wide eyes, shaking hands, heavy ink shadows and a trembling torchlit glow.',
      subject_treatment: `${keep}; show the subject in a close portrait at the edge of breaking under strain.`,
      color_and_tone: "Sickly torch amber and near-black ink, kept consistent across the whole image.",
      lighting_and_shadow: "Flickering underlight and harsh shadow, kept consistent across the whole image.",
      texture_and_material: "Heavy ink, sweat sheen and scratchy line, kept consistent across the whole image.",
      camera_and_composition: "Tight head-and-shoulders portrait, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with fraying nerves, kept consistent across the whole image.",
      rendering_and_quality: "Expressive intense portrait without gore, kept consistent across the whole image.",
      key_features: 'breaking-point portrait; wide eyes; torch underlight; heavy ink',
    }, ['gore'], [
      'Lit from below by a guttering torch, a veteran crusader stares at something off-panel with wide eyes and white knuckles, his helmet cracked from the last fight. No readable text or logo.',
      "In a tense close portrait, a jester adventurer is at the breaking point because the party has asked him to tell one more joke. No readable text or logo.",
      'In a tight torchlit portrait, a scholar clutches a book to her chest, and her eyes are fixed on a spot just over the viewer\'s shoulder. No readable text or logo.',
    ]),
  ],
};

export default spec;
