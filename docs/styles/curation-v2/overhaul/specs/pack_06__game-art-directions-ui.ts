import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'copied game characters',
  'known game HUD layout',
  'readable interface text',
  'numbers and stat values',
  'publisher or studio logo',
];

// Three contracts, following the review rule that a sprite stays an asset unless gameplay or an
// interface is requested: asset presets isolate the subject; art directions keep the requested scene
// and camera; interface and framing presets own a stated layout with blank, textless panels.
const asset =
  'Keep the prompt subject and its design; present it as a standalone game asset on a plain field, and build a gameplay scene or interface only when the prompt asks for one.';
const direction =
  'Keep the prompt subject, action, setting and camera; this art direction sets palette, light, shape language and finish, and adds no interface elements.';
const owns = (what: string) =>
  `Keep the prompt subject and action recognizable; this preset owns ${what}, with blank panels and icon shapes instead of any readable text, numbers or logos.`;

function ga(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? direction, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_06',
  category: '7. Game Art Directions & UI',
  updates: {
    'SP06-101': {
      dna: ga({
        aesthetic:
          'Pixel diorama: flat pixel-art sprites and pixel textures placed inside a real 3D miniature set, lit with modern bloom and tilt-shift depth of field.',
        subject_treatment: owns(
          'a high tilted camera over a miniature 3D diorama in which characters stay flat pixel sprites',
        ),
        color_and_tone:
          'Warm storybook palette with saturated pixel textures, glowing warm point lights and cool ambient shadows.',
        lighting_and_shadow:
          'Real-time point lights, soft bloom around lamps and fires, sprites casting soft 3D shadows onto the set.',
        texture_and_material:
          'Chunky pixel textures on 3D blocks, flat billboarded character sprites, particle dust and water shimmer.',
        camera_and_composition:
          'High oblique camera over a floating chunk of the world, strong tilt-shift blur at the top and bottom of frame.',
        atmosphere_and_mood:
          'Nostalgic and wondrous, a remembered childhood game rebuilt as a toy set.',
        rendering_and_quality:
          'Crisp pixel sprites against depth-blurred 3D surroundings; no pixel scaling blur on the sprites.',
        key_features:
          'pixel sprites in 3D diorama; tilt-shift blur; bloom point lights; pixel textures on blocks; floating world chunk',
      }),
      avoid: [...AVOID, 'flat 2D tile map'],
      briefs: [
        'Pixel diorama of a cliffside mountain monastery where a tiny pixel monk rings a bronze bell, pixel-textured stone blocks, warm bloom from braziers, strong tilt-shift blur above and below. No text or logo.',
        'Pixel diorama of a mining town built inside a cavern, flat pixel miners on 3D rail trestles, glowing point lights and floating dust particles. No text or logo.',
        "Pixel diorama of a swamp witch's hut on stilts over green water, pixel reed textures, water shimmer and a soft cast shadow from the sprite witch. No text or logo.",
      ],
    },
    'SP06-102': {
      dna: ga({
        aesthetic:
          'Roguelike tile set: each subject reduced to one square pictographic tile with a stark silhouette in two or three colors on black.',
        subject_treatment:
          'Keep the prompt subject recognizable; present it as one tile or a sheet of matching tiles on a black grid, and build a dungeon map only when the prompt asks for one.',
        color_and_tone:
          'Black ground with two or three flat colors per tile; bone white, rust red, moss green or cold blue as tile accents.',
        lighting_and_shadow:
          'No modeled light; value comes from silhouette cutouts and one inner highlight shape.',
        texture_and_material:
          'Hard-edged 32 pixel tiles, one-pixel inner detail lines, no gradients, a faint grid between tiles.',
        camera_and_composition:
          'Orthographic tiles in an even grid with equal padding; each silhouette centered and readable at tiny size.',
        atmosphere_and_mood: 'Stark and tactical, danger read in a single glance.',
        rendering_and_quality:
          'Consistent tile size, line weight and palette across the whole set; no text glyphs.',
        key_features:
          'square pictograph tiles; black ground; two or three colors; even grid; stark silhouettes',
      }),
      avoid: [...AVOID, 'letters as creatures', 'perspective scene', 'soft shading'],
      briefs: [
        'Roguelike tile set of twelve dungeon creatures on a black grid, a bat, a slime, a cave spider, a giant rat and more, each a stark bone-white and rust-red silhouette on one 32 pixel tile. No text or logo.',
        'Roguelike tile set of forest terrain, pine trees, stumps, toadstools, boulders and brambles as moss-green pictographs with faint grid lines. No text or logo.',
        'Roguelike tile set of traps and doors, spike pits, a lowered gate, levers, pressure plates and a locked chest in cold blue and bone white. No text or logo.',
      ],
    },
    'SP06-103': {
      name: 'Side-Scroll Parallax Gloom',
      dna: ga({
        aesthetic:
          'Side-scrolling exploration art: a dark near-black gameplay plane in front of four to six parallax layers that fade into colored fog.',
        subject_treatment: owns('a flat side-on view built from layered parallax planes'),
        color_and_tone:
          'Foreground near black, midground rich teal or violet, background washed into pale fog; one warm accent for the focal light.',
        lighting_and_shadow:
          'Backlit silhouettes with thin rim light, god-rays through gaps, glowing flora and embers as small light sources.',
        texture_and_material:
          'Painted or pixel textures that lose contrast with each layer, crisp foreground edges, drifting particles.',
        camera_and_composition:
          'Strict side view; the walkable silhouette runs across the lower third, depth stacked in horizontal bands.',
        atmosphere_and_mood: 'Lonely and curious, a vast place explored one room at a time.',
        rendering_and_quality:
          'Clear value separation between planes so the foreground path always reads.',
        key_features:
          'strict side view; stacked parallax layers; near-black foreground; fog-washed background; rim-lit silhouettes',
      }),
      avoid: [...AVOID, 'perspective camera', 'flat single-layer backdrop'],
      dropAvoid: ['background scene'],
      briefs: [
        'Side-scroll parallax gloom of a lone acrobat leaping between hanging iron cages in a vast cavern, near-black foreground ledge, five teal parallax layers fading into fog, one warm torch accent. No text or logo.',
        'Side-scroll parallax gloom of a flooded gothic aqueduct with a wanderer poling a small raft, violet midground arches, god-rays through broken vaults. No text or logo.',
        'Side-scroll parallax gloom of the inside of a clock tower, giant swinging pendulums as silhouettes in front, gears fading into amber fog behind. No text or logo.',
      ],
    },
    'SP06-104': {
      dna: ga({
        aesthetic:
          'Diegetic sci-fi HUD: translucent holographic panels, brackets and arcs projected into the world around the subject, glowing cyan and magenta.',
        subject_treatment: owns(
          'a layer of in-world holographic interface around and over the subject',
        ),
        color_and_tone:
          'Dark scene grade with cyan primary and magenta or amber secondary glows; interface additive and luminous.',
        lighting_and_shadow:
          'Holograms cast soft colored light on nearby surfaces; the rest of the scene stays low-key.',
        texture_and_material:
          'Thin vector lines, segmented arcs, hexagon grids, faint scanlines and slight chromatic fringing on the projections.',
        camera_and_composition:
          'Keep the requested view; brackets frame the focal point, panels sit on an asymmetric grid with safe margins.',
        atmosphere_and_mood: 'Focused and tense, information wrapped around the moment.',
        rendering_and_quality:
          'Crisp luminous lines with no legible glyphs; interface never hides the subject.',
        key_features:
          'holographic brackets; segmented arcs; hexagon grid; scanlines; cyan and magenta glow',
      }),
      avoid: [
        ...AVOID,
        'readable interface copy',
        'weapon requirement',
        'generic cyborg woman face',
      ],
      briefs: [
        'Diegetic sci-fi HUD around an adult mechanic inspecting a prosthetic arm on a workbench, cyan holographic brackets and segmented arcs tracing each joint, magenta warning hexagons with no text. No text or logo.',
        'Diegetic sci-fi HUD of a rooftop greenhouse seen through the targeting reticle of a visor, faint scanlines and luminous arcs over the plants. No text or logo.',
        'Diegetic sci-fi HUD scanning an ancient stone idol in a jungle, translucent hexagon grids wrapping its face in cyan light. No text or logo.',
      ],
    },
    'SP06-105': {
      dna: ga({
        aesthetic:
          '90s arcade fighter select screen: a grid of bold hand-painted pixel portraits of original fighters with diagonal energy slashes and a versus split.',
        subject_treatment: owns(
          'a fighter-select layout of portrait tiles, a highlighted selection and diagonal versus panels',
        ),
        color_and_tone:
          'Saturated gradient backgrounds per fighter, hot red, electric blue, acid green, gold selection glow.',
        lighting_and_shadow:
          'Dramatic portrait light from below or the side with hard pixel highlights on muscles and armor.',
        texture_and_material:
          'Painterly pixel portraits with dense clusters, crisp tile borders, speed-line slashes and glow edges.',
        camera_and_composition:
          'Tiled grid of tight portraits or a diagonal split with two large figures facing off; strong symmetry.',
        atmosphere_and_mood: 'Competitive and loud, the charge before the first round.',
        rendering_and_quality:
          'Consistent portrait crop and pixel density; blank name plates, no numbers or timers.',
        key_features:
          'portrait tile grid; diagonal versus split; painterly pixel portraits; gradient backgrounds; selection glow',
      }),
      avoid: [...AVOID, 'known fighting-game characters', 'readable character name'],
      briefs: [
        'Retro fighting game select screen of eight original fighters in painterly pixel portrait tiles, a minotaur wrestler, a clockwork fencer, a masked plague herbalist and a crab-armored brawler among them, gradient backgrounds and a gold selection glow. No text or logo.',
        'Retro fighting game versus split of a mechanical scarecrow facing a lava-skinned salamander duelist, diagonal hot red and electric blue panels, speed-line slashes. No text or logo.',
        'Retro fighting game select screen with a masked jaguar warrior selected large on the left over a tiled roster of small blank portraits, acid-green energy slashes. No text or logo.',
      ],
    },
    'SP06-106': {
      dna: ga({
        aesthetic:
          'Isometric strategy tiles: each subject built on a 2:1 diamond tile with beveled edges, as a clean atlas-ready game asset.',
        subject_treatment: asset,
        color_and_tone:
          'Clear readable greens, sand and slate with slightly saturated team-color accents; side faces one step darker.',
        lighting_and_shadow:
          'Fixed top-left sun on every tile; short consistent shadows falling inside the tile footprint.',
        texture_and_material:
          'Simple painted textures, beveled tile edges, a visible soil or rock cross-section on the tile sides.',
        camera_and_composition:
          'True 2:1 isometric projection, no vanishing point, tiles centered on a plain light background with equal spacing.',
        atmosphere_and_mood: 'Orderly and inviting, a board game ready to be played.',
        rendering_and_quality:
          'Crisp edges and consistent tile size and light across the set; no perspective drift.',
        key_features:
          '2:1 diamond tiles; beveled edges; cross-section tile sides; fixed top-left sun; plain background',
      }),
      avoid: [...AVOID, 'perspective camera', 'army requirement', 'full map scene'],
      briefs: [
        'Isometric strategy tile of a lumber camp on one 2:1 diamond tile, stacked logs and a saw pit, beveled edges and soil cross-section on the sides, fixed top-left sun, plain light background. No text or logo.',
        'Isometric strategy tile of a wizard academy with a crooked observatory dome on a single tile, slate roofs and a purple team-color banner without symbols. No text or logo.',
        'Isometric strategy tile set of coastline pieces, sea cliffs, a sandy cove and a small harbor, each on its own diamond tile with equal spacing. No text or logo.',
      ],
    },
    'SP06-107': {
      dna: ga({
        aesthetic:
          'Hero splash art: a painterly 3D-looking champion with exaggerated heroic proportions exploding out of a diagonal composition in ability-colored effects.',
        subject_treatment: owns(
          'a diagonal heroic splash composition built around one champion-like focal figure',
        ),
        color_and_tone:
          'Saturated complementary palette: warm hero lighting against cool environment, each ability given one signature glow color.',
        lighting_and_shadow:
          'Strong key from the ability effect, bright rim light, deep shaped shadows that sculpt big forms.',
        texture_and_material:
          'Soft painted gradients over sculpted forms, crisp hard-surface armor edges, swirling particle and energy trails.',
        camera_and_composition:
          'Low to mid heroic angle on a strong diagonal; big-medium-small shape hierarchy, background simplified into effects.',
        atmosphere_and_mood: 'Triumphant and kinetic, a hero at the peak of power.',
        rendering_and_quality:
          'Polished painterly finish with clean silhouette; effects never hide the face or pose.',
        key_features:
          'diagonal splash; exaggerated heroic proportions; ability-color rim light; particle trails; sculpted painted forms',
      }),
      avoid: [...AVOID, 'known champion likeness', 'literal battle crowd'],
      briefs: [
        'Hero splash art of a stone-skinned earth shaman slamming the ground, amber cracks erupting on a diagonal, cool blue canyon behind, strong rim light and swirling rock particles. No text or logo.',
        'Hero splash art of a ghost ferrywoman swinging a spectral oar that trails green chains of light, low heroic angle and sculpted painted forms. No text or logo.',
        'Hero splash art of a clockwork dwarf engineer launching a swarm of brass drones, orange ability glow against teal sky, exaggerated proportions. No text or logo.',
      ],
    },
    'SP06-108': {
      dna: ga({
        aesthetic:
          'Visual-novel backdrop: a clean anime-painted location with no characters, graded in neon night color and staged for a character to stand in later.',
        subject_treatment:
          'Keep the prompt setting and camera; paint it as an empty story backdrop, and add characters only when the prompt names them.',
        color_and_tone:
          'Deep indigo base with magenta and cyan neon washes, warm practical lights as small accents.',
        lighting_and_shadow:
          'Soft neon spill on surfaces, gentle bloom around signs and windows, smooth gradient shadows.',
        texture_and_material:
          'Clean anime background painting, crisp architectural lines, soft gradient skies and glossy reflective floors.',
        camera_and_composition:
          'Eye-level, near-symmetrical framing with an open central area where a character could stand; lower quarter kept calm.',
        atmosphere_and_mood: 'Wistful and quiet, a place waiting for its scene.',
        rendering_and_quality:
          'Polished, uncluttered backdrop with blank signs; no people, dialogue boxes or words.',
        key_features:
          'empty anime backdrop; neon magenta and cyan wash; bloom; open central stage; blank signs',
      }),
      avoid: [...AVOID, 'dialogue box', 'people in frame by default', 'readable signage'],
      briefs: [
        'Visual-novel backdrop of an empty apartment rooftop at night with laundry lines and potted plants, magenta and cyan neon washes from the city below, open central stage, blank signs. No text or logo.',
        'Visual-novel backdrop of a quiet noodle counter after closing, stools up, warm lamp over the counter and cyan neon through the doorway. No text or logo.',
        'Visual-novel backdrop of an empty aquarium tunnel glowing blue, a whale shark shadow passing overhead, near-symmetrical framing. No text or logo.',
      ],
    },
    'SP06-109': {
      name: 'Eroded Grandeur Dark Fantasy',
      dna: ga({
        aesthetic:
          'Dark fantasy art direction of eroded grandeur: colossal ruined architecture, worn stone and dim gold, with a tiny figure against oppressive scale.',
        color_and_tone:
          'Desaturated ash grey, bone and ochre with one dim gold or ember accent; low overall saturation.',
        lighting_and_shadow:
          'Overcast diffuse light, pale god-rays through ruins, deep atmospheric perspective and faint ember glows.',
        texture_and_material:
          'Pitted, eroded stone, rusted and tarnished metal, torn banners, moss and ash drifts.',
        camera_and_composition:
          'Keep the requested view; when unspecified, a low patient frame with huge negative space above a small figure.',
        atmosphere_and_mood: 'Melancholic and oppressive, the ruin of a vanished age.',
        rendering_and_quality:
          'Painterly realism with restrained detail and heavy atmosphere; no glossy fantasy color.',
        key_features:
          'colossal ruins; tiny figure; desaturated ash palette; pale god-rays; eroded stone and tarnish',
      }),
      avoid: [...AVOID, 'bright saturated fantasy', 'known boss likeness'],
      briefs: [
        'Eroded grandeur dark fantasy of a tiny knight standing before a colossal fallen statue of a king, pitted stone, ash drifts and a pale god-ray, desaturated bone and ochre palette. No text or logo.',
        "Eroded grandeur dark fantasy of a pilgrim climbing to a giant's tomb carved into a cliff face, torn banners, dim gold ember light in the doorway. No text or logo.",
        "Eroded grandeur dark fantasy of a withered tree grown through a dragon's ribcage in a grey valley, moss on the bones and deep atmospheric haze. No text or logo.",
      ],
    },
    'SP06-110': {
      dna: ga({
        aesthetic:
          'Chibi platformer sprite: a two-to-three-heads-tall pixel character drawn with squash and stretch, shown as a small sprite sheet of key poses.',
        subject_treatment: asset,
        color_and_tone:
          'Bright saturated palette with three-step ramps and a darker hue-shifted outline color per material.',
        lighting_and_shadow:
          'Simple top-left light, one highlight cluster per form and a small oval shadow under each pose.',
        texture_and_material:
          'Clean 32 to 48 pixel sprites, selective outlines, squash on landing and stretch on jumps.',
        camera_and_composition:
          'Orthographic side view, poses in a tidy row on a plain white or pale field, consistent scale and pivot.',
        atmosphere_and_mood: 'Bouncy and cheerful, instantly lovable at small size.',
        rendering_and_quality:
          'Pixel-perfect clusters with consistent proportions across poses; no background scene.',
        key_features:
          'chibi proportions; squash and stretch; sprite-sheet row; hue-shifted outlines; plain field',
      }),
      avoid: [...AVOID, 'platform level scene'],
      briefs: [
        'Chibi platformer sprite sheet of a round mole courier with a satchel, idle, run, jump and landing squash poses in a tidy row on a plain white field, hue-shifted outlines. No text or logo.',
        'Chibi platformer sprite sheet of a frog wizard casting a bubble spell, stretch on the cast pose, bright three-step ramps. No text or logo.',
        'Chibi platformer sprite sheet of a radish warrior with a leaf sword, squash on landing and a small oval shadow under each pose. No text or logo.',
      ],
    },
    'SP06-111': {
      dna: ga({
        aesthetic:
          'Stylized competitive-shooter art direction: chunky readable forms, bright saturated PBR-lite materials and color coding that separates everything at distance.',
        color_and_tone:
          'Sunny saturated palette against an encroaching violet storm gradient; rarity tints in white, green, blue, purple and gold.',
        lighting_and_shadow:
          'Bright sun with soft ambient fill, strong rim light that separates silhouettes from terrain.',
        texture_and_material:
          'Simplified hand-painted textures on chunky shapes, soft plastic-like sheen, clean stylized foliage clumps.',
        camera_and_composition:
          'Keep the requested view; favor wide readability with the subject isolated against simple terrain.',
        atmosphere_and_mood: 'Energetic and playful, with pressure building at the horizon.',
        rendering_and_quality:
          'Clean, bright, low-noise rendering; silhouettes readable at a distance.',
        key_features:
          'chunky stylized forms; rarity color tints; violet storm gradient; strong rim light; clean foliage clumps',
      }),
      avoid: [
        ...AVOID,
        'known battle royale skins',
        'realistic military gear',
        'weapon requirement',
      ],
      briefs: [
        'Stylized competitive-shooter art of a squad of three adventurers gliding on wingsuits toward a colorful island, sunny saturated palette, rim light, violet storm gradient creeping at the horizon. No text or logo.',
        'Stylized competitive-shooter art of a glowing supply crate on a grassy hilltop with a gold rarity tint, a violet storm wall approaching over chunky terrain. No text or logo.',
        'Stylized competitive-shooter art of an adult in a patchwork jacket and oversized sneakers striking a confident pose on a round platform, clean ambient fill and blue rarity rim light. No text or logo.',
      ],
    },
    'SP06-112': {
      dna: ga({
        aesthetic:
          'Sci-fi equipment icon kit: hard-surface items rendered at three-quarter view as matching inventory icons with emissive accent strips.',
        subject_treatment: asset,
        color_and_tone:
          'Gunmetal, white ceramic and black rubber with one emissive accent color shared by the whole set.',
        lighting_and_shadow:
          'Studio key from top-left, cool rim light on the right, subtle glow from emissive strips.',
        texture_and_material:
          'Panel lines, beveled edges, brushed metal, matte polymer and small warning-stripe details without text.',
        camera_and_composition:
          'Each item at the same three-quarter angle, centered with equal padding in a grid on a dark gradient field.',
        atmosphere_and_mood: 'Precise and collectible, gear laid out before a mission.',
        rendering_and_quality:
          'Crisp silhouettes, consistent scale and light across the kit; no labels or numbers.',
        key_features:
          'three-quarter icon angle; emissive accent strips; panel lines and bevels; dark gradient field; equal grid padding',
      }),
      avoid: [...AVOID, 'gun requirement', 'soldier requirement', 'labels on items'],
      briefs: [
        'Sci-fi equipment icon kit of six salvage tools, plasma cutter, grapple launcher, handheld scanner, magnetic clamp, drill and cable spool, same three-quarter angle, orange emissive strips, dark gradient grid. No text or logo.',
        'Sci-fi equipment icon kit of exosuit modules, boots, gauntlet, chest plate and backpack thruster, white ceramic and gunmetal with cyan emissive accents. No text or logo.',
        'Sci-fi equipment icon kit of alien artifact cores, spheres and crystals held in brushed-metal cradles, violet emissive glow and equal padding. No text or logo.',
      ],
    },
    'SP06-113': {
      dna: ga({
        aesthetic:
          'Fantasy MMO parchment interface: aged parchment and leather panels with carved wood or metal borders, wax seals and icon slots.',
        subject_treatment: owns(
          'a parchment interface panel in which the subject appears as an inked illustration, icon or map',
        ),
        color_and_tone:
          'Warm parchment beige, burnt umber ink, oxblood wax and tarnished brass trim, with small jewel-tone icon accents.',
        lighting_and_shadow:
          'Soft even light with slight vignette; embossed borders and seals cast short shadows.',
        texture_and_material:
          'Stained fibrous parchment, tooled leather, carved border ornaments, cracked wax seals, inked lines.',
        camera_and_composition:
          'Frontal panel layout with ornate frame, one illustrated zone and rows of empty slots or nodes.',
        atmosphere_and_mood: 'Adventurous and scholarly, a guildhall record of the journey.',
        rendering_and_quality:
          'Clean interface hierarchy; any writing is illegible squiggle, never words or numbers.',
        key_features:
          'parchment panel; carved ornate border; wax seal; icon slots; inked illustration',
      }),
      avoid: [...AVOID, 'readable map labels', 'castle requirement', 'legible script'],
      briefs: [
        'Fantasy MMO parchment interface of a quest journal page with an inked map of a marsh and a heron illustration, carved oak border, oxblood wax seal, lines of illegible squiggle. No text or logo.',
        'Fantasy MMO parchment interface of a guild crafting panel, rows of brass-trimmed slots holding herbs and ores, a stained parchment center with an inked anvil. No text or logo.',
        'Fantasy MMO parchment interface of a talent tree tooled into a leather panel, glowing rune nodes linked by inked lines, jewel-tone icon accents. No text or logo.',
      ],
    },
    'SP06-114': {
      dna: ga({
        aesthetic:
          'Gacha character card: a vertical collectible card with an ornate iridescent foil frame around a clean anime-painted character illustration.',
        subject_treatment: owns(
          'a vertical collectible-card frame with a foil border and rarity gems around the subject',
        ),
        color_and_tone:
          'Bright clean anime color in the art window, rainbow holographic foil and gold filigree on the frame.',
        lighting_and_shadow:
          'Glamorous key light on the character, sparkle and lens-flare bursts, foil catching rainbow reflections.',
        texture_and_material:
          'Holographic foil shimmer, embossed gold filigree, faceted rarity gems, particle bursts and petals in the art.',
        camera_and_composition:
          'Vertical card; the character breaks slightly out of the art window, ornate border hierarchy, star gems at top.',
        atmosphere_and_mood: 'Dazzling and precious, the thrill of a rare pull.',
        rendering_and_quality:
          'Polished anime finish with crisp foil edges; no stats, numbers or name banner.',
        key_features:
          'vertical card; iridescent foil frame; rarity gems; clean anime paint; figure breaking the frame',
      }),
      avoid: [...AVOID, 'readable stats', 'generic anime schoolgirl', 'revealing outfit'],
      briefs: [
        'Gacha character card of an adult tide priestess with a coral crown and flowing blue robes, rainbow holographic foil frame, faceted rarity gems at the top, water droplets bursting out of the art window. No text or logo.',
        'Gacha character card of an old one-eyed swordmaster in a worn haori among falling plum blossoms, gold filigree border and sparkle bursts. No text or logo.',
        'Gacha character card of a thunder qilin rearing in storm clouds, lightning breaking the foil frame, violet and gold holographic shimmer. No text or logo.',
      ],
    },
    'SP06-115': {
      dna: ga({
        aesthetic:
          'Survival-horror safe room: a pre-rendered-looking interior lit by one warm lamp pool inside cold darkness, seen from a fixed high camera.',
        color_and_tone:
          'Sickly green-grey and brown in the dark, one warm amber pool of light; crushed but not empty shadows.',
        lighting_and_shadow:
          'Single small warm source, steep falloff, deep shadows in corners, faint cold light from a doorway.',
        texture_and_material:
          'Peeling paint, stained tiles, worn wood and damp plaster, soft film grain over a slightly soft pre-rendered finish.',
        camera_and_composition:
          'Keep the requested view; when unspecified, a fixed high-corner angle with slightly awkward perspective and empty space.',
        atmosphere_and_mood: 'Briefly safe yet uneasy, a held breath before going back out.',
        rendering_and_quality:
          'Soft pre-rendered look with fine grain; no monsters or gore unless the prompt asks.',
        key_features:
          'single warm lamp pool; fixed high-corner camera; green-grey darkness; damp worn surfaces; fine grain',
      }),
      avoid: [...AVOID, 'gore', 'monster requirement', 'typewriter save icon'],
      briefs: [
        'Survival-horror safe room in a chapel vestry, one oil lamp pooling amber light on a locked cabinet, sickly green-grey darkness in the corners, fixed high-corner camera and fine grain. No text or logo.',
        'Survival-horror safe room in a flooded hospital laundry, a single work lamp over a dry folding table, cold light from the doorway and stained tiles. No text or logo.',
        "Survival-horror safe room in a ship's cabin below deck, a single candle stub on a sea chest, damp wood and awkward high perspective. No text or logo.",
      ],
    },
    'SP06-116': {
      dna: ga({
        aesthetic:
          'Stealth art direction: the world divided into readable lit and unlit zones, cool blue shadow where you hide and warm pools where you are seen.',
        color_and_tone:
          'Deep blue-violet shadows, warm sodium or lantern pools, very little midtone between them.',
        lighting_and_shadow:
          'Hard-edged light pools with clear boundaries, moonlight as cool fill, strong occluder shadows.',
        texture_and_material:
          'Rough stone, tiled roofs, wooden shutters and cloth, details visible in light and lost in shadow.',
        camera_and_composition:
          'Keep the requested view; when unspecified, an oblique high angle that shows the hiding path and the light to avoid.',
        atmosphere_and_mood: 'Silent and tense, patience measured in footsteps.',
        rendering_and_quality: 'Clean value design where shadow and light zones read at a glance.',
        key_features:
          'lit and unlit zones; hard-edged light pools; cool blue shadows; warm lantern light; visible hiding path',
      }),
      avoid: [...AVOID, 'weapon requirement', 'guard requirement', 'muddy midtones'],
      briefs: [
        'Stealth art direction of an adult thief crouched beneath a manor window ledge while a lantern pool sweeps the courtyard, deep blue shadow on one side, hard-edged warm light on the other. No text or logo.',
        'Stealth art direction of a harbor warehouse at night, crates forming a dark hiding path between two sodium light pools. No text or logo.',
        'Stealth art direction of a moonlit orchard wall below a watchtower, cool moon fill, the tower beam cutting a hard-edged pool across the grass. No text or logo.',
      ],
    },
    'SP06-117': {
      dna: ga({
        aesthetic:
          'Arcade racing art direction: glossy vehicles and streaking neon light trails pulled toward a vanishing point at exaggerated speed.',
        color_and_tone:
          'Saturated magenta, cyan and orange light trails against deep blue dusk or night; glossy reflections everywhere.',
        lighting_and_shadow:
          'Neon and headlight streaks, bloom on every light source, bright specular sweeps across curved bodies.',
        texture_and_material:
          'Mirror-glossy paint, wet-look reflective road, motion-streaked scenery and sparks.',
        camera_and_composition:
          'Keep the requested view; favor a low wide angle with strong vanishing-point pull and diagonal lanes.',
        atmosphere_and_mood: 'Euphoric and fast, speed felt as color.',
        rendering_and_quality:
          'Sharp subject against radial motion streaks; no brand badges or signage text.',
        key_features:
          'neon light trails; low wide angle; vanishing-point pull; glossy reflections; radial motion streaks',
      }),
      avoid: [...AVOID, 'car brand badge', 'readable signage', 'licensed car likeness'],
      briefs: [
        'Arcade racing art direction of a hover-sled tearing through a red canyon at dusk, magenta and cyan light trails, low wide angle with strong vanishing-point pull, sparks off the rock walls. No text or logo.',
        'Arcade racing art direction of armored beetles racing down a desert dune at sunset, orange light streaks and glossy shells, diagonal lanes of sand. No text or logo.',
        "Arcade racing art direction of an invented wedge-shaped rally buggy with oversized knobby tires, exposed roll cage and twin roof lamps, drifting on a spiral mountain road at night, headlight streaks and bloom around every curve. Not a real car model; no badges, text or logo.",
      ],
    },
    'SP06-118': {
      dna: ga({
        aesthetic:
          'RPG pixel inventory icons: small 32 by 32 pixel item icons with a one-pixel dark outline, top-left light and a matched slot frame.',
        subject_treatment: asset,
        color_and_tone:
          'Three-to-four-step hue-shifted ramps per material, warm highlights and cool shadows, one saturated accent per item.',
        lighting_and_shadow:
          'Consistent top-left light across every icon, one bright specular pixel on metal and glass.',
        texture_and_material:
          'Clean pixel clusters for leather, iron, glass, wood and cloth; no noise, no dithering chatter.',
        camera_and_composition:
          'Each item centered in an identical square slot with equal padding, arranged as a neat grid.',
        atmosphere_and_mood: 'Satisfying and collectible, loot sorted with care.',
        rendering_and_quality:
          'Pixel-perfect edges and uniform scale and outline weight across the set; no numbers.',
        key_features:
          '32x32 pixel icons; one-pixel outline; hue-shifted ramps; top-left light; matched square slots',
      }),
      avoid: [...AVOID, 'item counts', 'painterly icons', 'mixed icon scales'],
      briefs: [
        'RPG pixel inventory icons of cursed rings and amulets, eight 32 by 32 icons in matched slots, one-pixel dark outlines, sickly green gem accents and one specular pixel on each band. No text or logo.',
        'RPG pixel inventory icons of cooking ingredients, a river fish, a crusty loaf, a cheese wheel and an onion, hue-shifted ramps in a neat grid. No text or logo.',
        'RPG pixel inventory icons of beast trophies, a wolf fang, a curled ram horn, an eagle feather and a green serpent scale, uniform scale and outline weight. No text or logo.',
      ],
    },
    'SP06-119': {
      dna: ga({
        aesthetic:
          'Cozy life-sim art direction: soft pixel or painted forms with rounded shapes, gentle outlines and warm seasonal palettes.',
        color_and_tone:
          'One season per image: spring pastels, summer greens, autumn ambers or winter blues, always warm-leaning and low contrast.',
        lighting_and_shadow:
          'Soft sunny light, short soft shadows, warm window glow in evening scenes.',
        texture_and_material:
          'Rounded wood, soft foliage clumps, knitted and woven textures, small scattered details like flowers and leaves.',
        camera_and_composition:
          'Keep the requested view; tidy spacing, cozy negative space and small useful objects arranged invitingly.',
        atmosphere_and_mood: 'Gentle and comforting, daily routine as a small pleasure.',
        rendering_and_quality:
          'Clean soft outlines and a controlled seasonal palette; nothing harsh or gritty.',
        key_features:
          'seasonal palette; rounded forms; soft outlines; warm light; cozy negative space',
      }),
      avoid: [...AVOID, 'harsh contrast', 'gritty textures', 'known farming game likeness'],
      dropAvoid: ['background scene'],
      briefs: [
        'Cozy life-sim art of a lakeside fishing dock in autumn, rounded wooden planks, amber and rust foliage clumps, a tackle box and a thermos, soft sunny light and tidy spacing. No text or logo.',
        'Cozy life-sim art of a greenhouse interior in winter, snow on the glass, potted seedlings in rows, warm lamp glow and soft blue shadows. No text or logo.',
        'Cozy life-sim art of a cherry orchard in spring with a row of painted beehives, pastel blossoms drifting and short soft shadows. No text or logo.',
      ],
    },
    'SP06-120': {
      dna: ga({
        aesthetic:
          'Boss encounter key art: a colossal threat towering over a tiny challenger, cinematic painterly rendering built on extreme scale contrast.',
        subject_treatment: owns(
          'a low-angle key-art composition built on extreme scale contrast between threat and challenger',
        ),
        color_and_tone:
          'Dark smoky base with one ominous color for the boss (ember red, poison green or cold violet) and a small warm light on the hero.',
        lighting_and_shadow:
          'Strong backlight and rim light on the colossus, silhouetted challenger, smoke and ash catching light.',
        texture_and_material:
          'Rough painted detail on the boss, drifting ash, embers and dust, simplified foreground ground plane.',
        camera_and_composition:
          'Low angle from behind the small challenger, boss filling the upper two thirds, diagonal tension lines.',
        atmosphere_and_mood: 'Ominous and awe-struck, the moment before an impossible fight.',
        rendering_and_quality:
          'Cinematic painterly finish, clear silhouettes at both scales; no health bars or titles.',
        key_features:
          'extreme scale contrast; low angle from behind the hero; boss rim light; drifting ash; one ominous color',
      }),
      avoid: [...AVOID, 'boss health bar', 'title lettering', 'gore'],
      briefs: [
        'Boss encounter key art of a colossal moth queen with ember-red wing eyes hovering over a tiny torch-bearer, low angle from behind the challenger, ash drifting through strong backlight. No text or logo.',
        'Boss encounter key art of a titan built from shipwrecks rising out of a black sea before a lone rowboat, poison-green light in its hull ribs, diagonal waves. No text or logo.',
        'Boss encounter key art of a many-armed bone-white tree spirit in a burning forest, cold violet glow in its hollows, a small warrior silhouetted below. No text or logo.',
      ],
    },
  },
};

export const aliases = {
  'SP06-103': 'Metroidvania Parallax Gloom',
  'SP06-109': 'Soulslike Tarnished Atmosphere',
};

export default spec;
