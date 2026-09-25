import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'copied game characters',
  'console or handheld hardware shown in frame',
  'score counter or health bar',
  'readable interface text',
  'brand or publisher logo',
];

// Display systems redraw the subject inside a hardware limit and keep the requested camera, so one
// fixed-camera subject shows the cluster and palette differences. Presets that own a camera or screen
// layout (floor-plane vista, tile map, tactics grid, text-mode map, visual-novel screen) say so.
const pixel =
  "Keep the prompt subject, action and camera view; redraw it inside this display system's resolution, palette and pixel-cluster limits without adding any game interface.";
const profile = (what: string) =>
  `Keep the prompt subject and action recognizable; this preset owns ${what}, and adds no score, health bar, logo or readable interface text.`;

function px(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? pixel, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_06',
  category: '6. Retro Game Visual Systems',
  updates: {
    'SP06-081': {
      name: 'Four-Shade Pea-Green LCD',
      dna: px({
        aesthetic:
          'Unlit reflective handheld LCD at about 160 by 144 pixels, drawn with exactly four shades of olive green on 8 by 8 tiles.',
        color_and_tone:
          'Four fixed values only: near-black moss, dark olive, pea green and pale lime; midtones faked with checkerboard dither.',
        lighting_and_shadow:
          'Light is expressed only as value steps; the screen itself is unlit, flat and slightly murky.',
        texture_and_material:
          'Faint pixel-gap grid, soft ghosting trail behind moving shapes, one-pixel dark outlines and a dusty plastic sheen.',
        camera_and_composition:
          'Keep the requested view; subject silhouettes simplified to read on a tiny screen with large flat background tiles.',
        atmosphere_and_mood: 'Quiet and portable, a small glowing-green world held in the hands.',
        rendering_and_quality:
          'Hard square pixels with no anti-aliasing and no fifth color; tile repetition allowed in backgrounds.',
        key_features:
          'four olive-green shades; 8x8 tiles; checkerboard dither; pixel-gap grid; LCD ghosting',
      }),
      avoid: [...AVOID, 'fifth color', 'backlit glow', 'smooth gradients'],
      briefs: [
        'Four-shade pea-green LCD scene in side view of a lantern-carrying monk crossing a rope bridge over a chasm, exactly four olive greens, checkerboard dither in the fog, faint pixel-gap grid. No text or logo.',
        'Four-shade pea-green LCD scene of a frog fencer standing on a lily pad with a reed rapier, one-pixel dark outlines, 8x8 water tiles, soft LCD ghosting. No text or logo.',
        'Four-shade pea-green LCD scene of a haunted windmill at night with bats circling its sails, near-black moss sky and pale lime moon. No text or logo.',
      ],
    },
    'SP06-082': {
      name: 'Mode 7 Floor-Plane Vista',
      dna: px({
        aesthetic:
          '16-bit pseudo-3D: one flat tiled ground layer rotated and scaled line by line toward a horizon, with flat sprites riding on top.',
        subject_treatment: profile(
          'a low chase camera looking along an affine-scaled floor plane toward a flat painted horizon',
        ),
        color_and_tone:
          'A 256-color console palette with saturated sky gradients in hard bands and a brightly tiled ground.',
        lighting_and_shadow:
          'No real lighting; sprites carry a small flat oval shadow on the plane.',
        texture_and_material:
          'Ground tiles stretch into huge blocky pixels near the camera and shimmer into aliased noise near the horizon.',
        camera_and_composition:
          'Low tilted view; the plane fills the lower two thirds and meets a flat parallax backdrop at a straight horizon.',
        atmosphere_and_mood: 'Soaring and optimistic, speed over an endless flat world.',
        rendering_and_quality:
          'Visible affine stretching and horizon aliasing; sprites never scale smoothly.',
        key_features:
          'affine-scaled floor plane; stretched near pixels; horizon shimmer; flat parallax backdrop; scaled sprites',
      }),
      avoid: [...AVOID, 'true 3D terrain', 'perspective-correct textures'],
      briefs: [
        'Mode 7 floor-plane vista of a dragon rider skimming low over a patchwork of farm fields, field tiles stretched into big blocks near the camera, flat mountain backdrop at the horizon. No text or logo.',
        'Mode 7 floor-plane vista of a herd of wild horses galloping across a tiled savanna toward a flat mesa backdrop, banded orange sky, aliased grass shimmer near the horizon. No text or logo.',
        'Mode 7 floor-plane vista of a lone ice skater on a vast frozen lake, tiled ice cracks rotating toward snowy peaks on a flat backdrop. No text or logo.',
      ],
    },
    'SP06-083': {
      dna: px({
        aesthetic:
          'Color vector CRT: the subject drawn only as glowing beam lines on pure black, with no pixels and no filled surfaces.',
        subject_treatment:
          'Keep the prompt subject, action and camera view; convert every form into its edges, including hidden edges seen through the transparent wireframe.',
        color_and_tone:
          'Three or four saturated line colors such as cyan, magenta, yellow and green on absolute black.',
        lighting_and_shadow:
          'No shading; brighter dots where the beam lingers at vertices and a soft phosphor bloom around every line.',
        texture_and_material:
          'Perfectly sharp vector lines with slight glow, short phosphor persistence trails and faint beam flicker.',
        camera_and_composition:
          'Keep the requested view; geometry simplified to a few dozen strong edges that read instantly.',
        atmosphere_and_mood: 'Electric and austere, a whole world drawn in light.',
        rendering_and_quality:
          'Clean continuous lines with vertex hot spots; no raster jaggies and no fills.',
        key_features:
          'glowing beam lines; transparent wireframe; vertex hot spots; phosphor bloom; black void',
      }),
      avoid: [...AVOID, 'filled polygons', 'raster pixels', 'textures'],
      briefs: [
        'Vector arcade wireframe of a castle keep with a raised portcullis in three-quarter view, cyan and magenta beam lines, hidden edges visible through the walls, bright vertex hot spots on black. No text or logo.',
        'Vector arcade wireframe of a manta ray gliding upward, a few dozen yellow and green lines with phosphor persistence trails behind the wingtips. No text or logo.',
        'Vector arcade wireframe of a war elephant carrying a howdah, glowing magenta outlines, soft bloom and faint beam flicker. No text or logo.',
      ],
    },
    'SP06-084': {
      dna: px({
        aesthetic:
          'Pre-rendered sprite: the subject modeled and ray-traced on a 90s workstation, then shrunk and color-reduced into a low-resolution game sprite.',
        color_and_tone:
          'Glossy CG color crunched into a small shared palette; smooth gradients break into ordered dither and banding.',
        lighting_and_shadow:
          'Baked studio lighting with bright Phong specular hot spots and soft ray-traced shadows frozen into the sprite.',
        texture_and_material:
          'Plastic-smooth CG surfaces, chrome reflections, a jagged one-pixel dark matte halo where the sprite was cut from its render background.',
        camera_and_composition:
          'Keep the requested view; the subject reads as a finished 3D model locked into a small sprite frame.',
        atmosphere_and_mood: 'Shiny and futuristic in a 90s way, technology showing off.',
        rendering_and_quality:
          'Sharp downsampled pixels over rendered shading; no hand-placed pixel clusters.',
        key_features:
          'ray-traced model shrunk to sprite; Phong highlights; ordered dither; jagged matte halo; small palette',
      }),
      avoid: [...AVOID, 'modern physically based rendering', 'hand-drawn pixel clusters'],
      briefs: [
        'Pre-rendered sprite of a chrome-armored scarab beetle, glossy Phong hot spots, ray-traced reflections crunched into a small palette with ordered dither, jagged dark matte halo against a flat backdrop. No text or logo.',
        'Pre-rendered sprite of a mossy stone golem mid-stride, baked soft shadows, banding across its plastic-smooth CG surface. No text or logo.',
        'Pre-rendered sprite of a glossy crystal ball on a clawed brass stand, ray-traced refraction crunched into dithered bands. No text or logo.',
      ],
    },
    'SP06-085': {
      dna: px({
        aesthetic:
          'Visual novel screen: a waist-up cel-shaded character sprite standing over a softly blurred painted background, with an empty translucent dialogue box.',
        subject_treatment: profile(
          'the visual-novel screen layout: a waist-up sprite over a softened background and an empty text box across the bottom',
        ),
        color_and_tone:
          'Clean cel color on the sprite with two-tone shadows; background slightly desaturated and warm or cool by time of day.',
        lighting_and_shadow:
          'Soft ambient light on the sprite with a thin rim light matching the background; no cast shadow on the backdrop.',
        texture_and_material:
          'Crisp anti-aliased lineart on the sprite, painterly or photo-based background with gentle blur, frosted empty text panel.',
        camera_and_composition:
          'Static frontal screen; the sprite stands centered or at one third, the empty box covers the bottom quarter.',
        atmosphere_and_mood: 'Intimate and still, a pause before someone speaks.',
        rendering_and_quality:
          'Sharp sprite against soft backdrop; the dialogue box stays blank with no names or words.',
        key_features:
          'waist-up cel sprite; blurred painted backdrop; empty translucent text box; rim light; static frontal screen',
      }),
      avoid: [
        ...AVOID,
        'dialogue text',
        'name plate',
        'generic anime schoolgirl',
        'dynamic action',
      ],
      briefs: [
        'Visual novel screen of an adult court alchemist with round smoked spectacles and burn-scarred gloves, waist-up cel sprite over a blurred candlelit laboratory, empty frosted text box at the bottom. No text or logo.',
        'Visual novel screen of a silver-braided adult ferry captain in an oilskin coat, sprite at the left third over a softened misty river pier at dawn, blank dialogue box. No text or logo.',
        'Visual novel screen of a broad-shouldered adult blacksmith with a soot-streaked leather apron, sprite over a blurred rainy forge doorway, warm rim light, empty text panel. No text or logo.',
      ],
    },
    'SP06-086': {
      name: 'Chibi Top-Down Tileworld',
      dna: px({
        aesthetic:
          'Hobbyist top-down RPG map: 16 or 32 pixel square tiles in three-quarter overhead view with two-heads-tall chibi characters.',
        subject_treatment: profile(
          'a three-quarter top-down tile map in which people become two-heads-tall chibi sprites',
        ),
        color_and_tone:
          'Bright flat palette with one-pixel darker outlines; grass, water and roofs each built from a small ramp.',
        lighting_and_shadow:
          'Flat daylight; a fixed dark shadow tile under trees, walls and characters.',
        texture_and_material:
          'Visible tile repetition, auto-tiled edges between grass, water and stone, and blocky roof and wall tiles.',
        camera_and_composition:
          'Overhead three-quarter view on a strict grid; buildings show front walls and roofs, characters face the camera.',
        atmosphere_and_mood: 'Homemade and nostalgic, a small adventure built tile by tile.',
        rendering_and_quality:
          'Grid-aligned tiles, consistent chibi scale and no perspective drift.',
        key_features:
          'square tile grid; chibi sprites; auto-tiled edges; shadow tiles; three-quarter overhead view',
      }),
      avoid: [...AVOID, 'perspective camera', 'realistic proportions', 'isometric diamond tiles'],
      briefs: [
        'Chibi top-down tileworld of a snowy mountain village with a small shrine and three chibi travelers arriving, auto-tiled snow edges, shadow tiles under pines, strict square grid. No text or logo.',
        'Chibi top-down tileworld of a haunted manor garden at dusk with a hedge maze and a lone chibi ghost hunter, repeating hedge tiles and dark shadow tiles. No text or logo.',
        'Chibi top-down tileworld of a desert oasis market with striped tent tiles, a palm-ringed pool and chibi merchants. No text or logo.',
      ],
    },
    'SP06-087': {
      name: 'Handheld Tactics Grid Pixel',
      dna: px({
        aesthetic:
          'Handheld strategy map: bright 15-bit pixel art on a square battle grid, with chunky outlined unit sprites standing on clean terrain tiles.',
        subject_treatment: profile(
          'an overhead tactics grid with units standing on readable terrain tiles',
        ),
        color_and_tone:
          'Oversaturated bright colors made for an unlit screen; blue and red team colors; translucent blue squares for movement range.',
        lighting_and_shadow:
          'Flat top light; a small dark ellipse under each unit and a one-tile shadow on the north side of cliffs.',
        texture_and_material:
          'Clean terrain tiles for plains, forest, river and mountain, thick dark outlines on units, faint grid lines.',
        camera_and_composition:
          'Overhead, slightly tilted grid filling the frame; units about one tile tall, the key clash near the center.',
        atmosphere_and_mood: 'Clear and tactical, a whole battle understood at a glance.',
        rendering_and_quality:
          'Crisp readable icons and terrain; no numbers, stat windows or text on the map.',
        key_features:
          'square battle grid; bright unlit-screen palette; outlined unit sprites; movement-range squares; terrain tiles',
      }),
      avoid: [...AVOID, 'stat windows', 'numbers on tiles', 'dark gritty palette'],
      briefs: [
        'Handheld tactics grid pixel map of blue-team knights and pikemen holding a river ford against red-team raiders, translucent blue movement squares, oversaturated terrain tiles. No text or logo.',
        'Handheld tactics grid pixel map of the siege of a hilltop fort with catapults on the slope, outlined unit sprites and small dark ellipse shadows. No text or logo.',
        'Handheld tactics grid pixel map of rowing galleys maneuvering between the islands of an archipelago, bright sea tiles and faint grid lines. No text or logo.',
      ],
    },
    'SP06-088': {
      name: '32-Bit Vertex Wobble',
      dna: px({
        aesthetic:
          'Early 32-bit console 3D: low-poly models with unfiltered low-resolution textures that warp and jitter because of affine mapping and vertex snapping.',
        color_and_tone:
          'Muted 15-bit color with a fine ordered dither over the whole frame; distance fades into flat fog color.',
        lighting_and_shadow:
          'Gouraud vertex lighting with visible triangle shading steps; simple blob shadows under characters.',
        texture_and_material:
          'Blocky nearest-neighbor textures around 64 pixels wide, swimming texture seams on large polygons and cracks where polygons meet.',
        camera_and_composition:
          'Keep the requested view; short draw distance with dense fog hiding the world beyond a few meters.',
        atmosphere_and_mood: 'Uneasy and dreamlike, a world that trembles slightly.',
        rendering_and_quality:
          'Low internal resolution near 320 by 240, jittering vertices, no texture filtering and no anti-aliasing.',
        key_features:
          'affine texture warping; vertex snapping jitter; nearest-neighbor textures; ordered dither; close fog',
      }),
      avoid: [...AVOID, 'texture filtering', 'high-poly models', 'modern reflections'],
      briefs: [
        'Early 32-bit vertex wobble scene of a lone ferryman poling a flat boat through a fog-swallowed swamp, warped nearest-neighbor water texture, jittering reeds, fine ordered dither and fog a few meters out. No text or logo.',
        'Early 32-bit vertex wobble scene of a derelict carousel in thick fog, low-poly horses with swimming texture seams and Gouraud shading steps. No text or logo.',
        'Early 32-bit vertex wobble scene of a cathedral nave with a reliquary floating above the altar, blocky stained-glass textures and cracks between polygons. No text or logo.',
      ],
    },
    'SP06-089': {
      dna: px({
        aesthetic:
          'Text-mode roguelike map: a world drawn in an 80 by 25 character grid using box-drawing lines, shade blocks, dots and symbols in 16 ANSI colors.',
        subject_treatment: profile(
          'an overhead text-mode map in which every cell is one glyph and creatures are single-character symbols',
        ),
        color_and_tone:
          'Sixteen ANSI colors on black: grey walls, brown floors, blue water, green foliage, one bright color for the key creature.',
        lighting_and_shadow:
          'Light radius shown by bright cells around the viewer fading to dim, unexplored cells left black.',
        texture_and_material:
          'Monospaced cells, double-line box walls, light and dark shade blocks for rock and water, dotted floors.',
        camera_and_composition:
          'Top-down map in a fixed grid; rooms and corridors frame the subject symbol at the center of lit cells.',
        atmosphere_and_mood: 'Tense and cerebral, imagination doing most of the work.',
        rendering_and_quality:
          'Strict cell grid with crisp glyphs; single isolated symbols only, never words or sentences.',
        key_features:
          '80x25 character grid; box-drawing walls; shade-block terrain; 16 ANSI colors; lit radius',
      }),
      avoid: [...AVOID, 'readable words', 'pixel sprites', 'status line'],
      briefs: [
        'Text-mode roguelike map of a treasure vault where a sleeping basilisk coils around a hoard, double-line box walls, yellow shade blocks for gold, one bright green serpent symbol in a lit radius on black. No readable words or logo.',
        'Text-mode roguelike map of a flooded crypt lit by two braziers, blue shade-block water, dotted stone floor and unexplored cells in darkness. No readable words or logo.',
        'Text-mode roguelike map filling the whole frame: a large forest clearing drawn with dense bright green club and spade glyph trees, a ring of grey block standing stones in the center, a yellow at-sign hero, red letter monsters at the edges and a cyan tilde stream, 16 ANSI colors on black, readable at thumbnail size. No readable words or logo.',
      ],
    },
    'SP06-090': {
      dna: px({
        aesthetic:
          'Voxel sprite model: the subject built as a small toy-like model of flat-colored cubes, like a pixel sprite pushed into three dimensions.',
        subject_treatment:
          'Keep the prompt subject and pose; rebuild it as a standalone low-resolution voxel model on a plain ground plane unless a scene is requested.',
        color_and_tone:
          'Limited sprite palette, one flat color per cube, two or three steps per material ramp.',
        lighting_and_shadow:
          'Soft sky light with ambient occlusion in cube corners and one crisp stepped shadow on the ground.',
        texture_and_material:
          'Clearly visible cube edges at a coarse scale of roughly 30 to 60 cubes tall; no smoothing and no textures.',
        camera_and_composition:
          'Three-quarter orthographic view of the model centered on a plain ground tile with generous padding.',
        atmosphere_and_mood: 'Toy-like and charming, a collectible figure made of blocks.',
        rendering_and_quality:
          'Crisp cube faces, clean occlusion and readable silhouette at thumbnail size.',
        key_features:
          'coarse voxel model; flat color per cube; corner occlusion; orthographic three-quarter view; plain ground tile',
      }),
      avoid: [...AVOID, 'block mining game likeness', 'smooth surfaces', 'huge voxel landscape'],
      briefs: [
        "Voxel sprite model of a wizard's tower perched on a floating rock, flat-colored cubes about fifty tall, soft corner occlusion, three-quarter orthographic view on a plain ground tile. No text or logo.",
        "Voxel sprite model of an alchemist's wooden cart loaded with colored bottles, stepped cube shadow and a limited palette. No text or logo.",
        'Voxel sprite model of a sea turtle carrying a tiny palm island on its shell, crisp cube edges and two-step color ramps. No text or logo.',
      ],
    },
    'SP06-091': {
      name: 'White Beam Vector with Color Overlay',
      dna: px({
        aesthetic:
          'Monochrome vector display: bright white beam lines on black, tinted in zones by a translucent printed color overlay sheet laid over the screen.',
        subject_treatment:
          'Keep the prompt subject, action and camera view; draw it as white vector outlines and let the overlay tint horizontal zones of the screen.',
        color_and_tone:
          'White lines only, colored by overlay bands such as red at top, green in the middle and blue below; black stays black.',
        lighting_and_shadow:
          'No shading; line brightness varies with beam speed, with hot dots at line ends.',
        texture_and_material:
          'Sharp beam lines, faint curved-glass reflection, subtle overlay print texture and soft phosphor afterglow.',
        camera_and_composition:
          'Keep the requested view; the overlay bands are aligned to the subject so each zone colors a part of it.',
        atmosphere_and_mood: 'Lonely and luminous, cold space with a hand-painted tint.',
        rendering_and_quality:
          'Clean continuous white lines, flat overlay tint; no raster pixels and no multicolor lines.',
        key_features:
          'white beam lines; translucent color overlay bands; hot line ends; curved-glass reflection; black screen',
      }),
      avoid: [...AVOID, 'multicolor vector lines', 'filled shapes', 'raster pixels'],
      briefs: [
        'White beam vector with color overlay of a lone starship approaching a ringed planet, white outlines on black tinted blue at the bottom and orange across the planet band, hot dots at line ends. No text or logo.',
        'White beam vector with color overlay of a pterodactyl gliding over erupting volcanoes, a red overlay band over the lava, green across the sky. No text or logo.',
        'White beam vector with color overlay of a bell tower with its bells swinging, a gold overlay zone on the bells, faint curved-glass reflection. No text or logo.',
      ],
    },
    'SP06-092': {
      name: 'Fat-Pixel 16-Color Home Computer',
      dna: px({
        aesthetic:
          '8-bit home computer multicolor bitmap: double-wide pixels at 160 by 200 from a fixed palette of sixteen muted colors.',
        color_and_tone:
          'Fixed dusty palette of browns, lilac, light blue, olive, pink-grey and mustard; at most three colors plus a shared background per character cell.',
        lighting_and_shadow:
          'Light stated by palette steps and horizontal dither; blocky cell-aligned shadows.',
        texture_and_material:
          'Pixels twice as wide as tall, color boundaries snapping to 4 by 8 cells, fine horizontal dither patterns.',
        camera_and_composition:
          'Keep the requested view; broad shapes that survive the coarse horizontal resolution.',
        atmosphere_and_mood: 'Homely and melancholic, the glow of a bedroom computer.',
        rendering_and_quality:
          'Strict wide pixels and cell color limits; no colors outside the fixed sixteen.',
        key_features:
          'double-wide pixels; fixed 16 muted colors; 4x8 cell color limit; horizontal dither; bedroom-computer glow',
      }),
      avoid: [...AVOID, 'square pixels', 'saturated neon colors', 'smooth gradients'],
      briefs: [
        'Fat-pixel 16-color home computer scene in side view of a hooded thief crossing the rooftops of a walled town at dusk, double-wide pixels, lilac and brown fixed palette, color snapping to cells. No text or logo.',
        'Fat-pixel 16-color home computer scene of a crab boat unloading its catch at a harbor, mustard and light-blue horizontal dither. No text or logo.',
        'Fat-pixel 16-color home computer scene of a rat thief stealing cheese in a wine cellar among barrels, blocky cell-aligned shadows. No text or logo.',
      ],
    },
    'SP06-093': {
      name: 'Bright Line-Clash Home Micro',
      dna: px({
        aesthetic:
          'Japanese-market 8-bit micro graphics: square pixels in bright candy primaries, with only two colors allowed in each 8 by 1 pixel line segment.',
        color_and_tone:
          'Fifteen fixed saturated colors on black: vivid cyan, magenta, bright yellow, deep blue and grass green; strong complementary pairs.',
        lighting_and_shadow:
          'No gradients; form built from outlines and two-color stripes, shadows as solid dark areas.',
        texture_and_material:
          'Horizontal color-clash fringes where two shapes meet in one 8-pixel segment, crisp outlines and small repeated patterns.',
        camera_and_composition:
          'Keep the requested view; compact, clearly outlined subjects on a black or single-color field.',
        atmosphere_and_mood: 'Bright and plucky, adventure on a small bedroom machine.',
        rendering_and_quality:
          'Square pixels with visible line-clash artifacts; no dithering gradients and no muted colors.',
        key_features:
          'square pixels; two colors per 8x1 segment; horizontal clash fringes; candy primaries; black field',
      }),
      avoid: [...AVOID, 'muted palette', 'soft gradients'],
      dropAvoid: ['western', 'dark', 'muted'],
      briefs: [
        'Bright line-clash home micro scene of a jungle temple entrance guarded by two stone snakes, vivid green and magenta square pixels, horizontal clash fringes where vines cross stone, black sky. No text or logo.',
        'Bright line-clash home micro scene of a small yellow submarine exploring a coral reef, cyan water, candy-colored corals with two colors per line segment. No text or logo.',
        'Bright line-clash home micro scene of a crane-winged sorceress gliding above a pagoda roof at night, deep blue and bright yellow, crisp outlines on black. No text or logo.',
      ],
    },
    'SP06-094': {
      name: 'Scanline Stripe Block Minimalism',
      dna: px({
        aesthetic:
          'Extreme early-console limitation: chunky blocks four pixels wide, one color per object per scanline, and mirrored playfield blocks.',
        color_and_tone:
          'Flat saturated NTSC hues; objects gain multiple colors only as horizontal stripes changing line by line.',
        lighting_and_shadow: 'No light or shadow; color bands stand in for form.',
        texture_and_material:
          'Wide rectangular blocks, horizontal color stripes, symmetrical mirrored walls and tiny 8-pixel-wide sprites.',
        camera_and_composition:
          'Keep the requested view; the subject reduced to a few blocky silhouettes on a flat single-color ground.',
        atmosphere_and_mood: 'Abstract and naive, imagination filling in almost everything.',
        rendering_and_quality:
          'Extremely low horizontal resolution with crisp blocks; no detail beyond what the limit allows.',
        key_features:
          'four-pixel-wide blocks; one color per scanline; horizontal stripe coloring; mirrored playfield; tiny sprites',
      }),
      avoid: [...AVOID, 'detailed sprites', 'dithering', 'rich shading'],
      briefs: [
        'Scanline stripe block minimalism of an adventurer fending off a giant bat in a torchlit hall, blocky mirrored walls, the bat colored in horizontal red and purple stripes, flat black ground. No text or logo.',
        'Scanline stripe block minimalism of a volcano erupting over a sea, lava as stacked orange and yellow scanline bands, chunky four-pixel blocks. No text or logo.',
        'Scanline stripe block minimalism of two biplanes dogfighting above striped clouds, tiny 8-pixel-wide sprites on a flat blue sky. No text or logo.',
      ],
    },
    'SP06-095': {
      name: 'Dither-Heavy 16-Bit Console',
      dna: px({
        aesthetic:
          '16-bit console pixel art with about sixty on-screen colors, using heavy vertical-stripe and checkerboard dither to fake transparency and gradients.',
        color_and_tone:
          'Steppy, slightly dark 9-bit colors with high contrast; gradients built from dither bands, never smooth ramps.',
        lighting_and_shadow:
          'Hard-edged light blocks and dithered glows; shadows as flat dark palette steps.',
        texture_and_material:
          'Vertical line dither and checkerboard patterns that a composite signal would blur into mist, water or glass.',
        camera_and_composition:
          'Keep the requested view; strong silhouettes and parallax layers separated by value.',
        atmosphere_and_mood: 'Crunchy and energetic, with an edge of attitude.',
        rendering_and_quality:
          'Crisp 320 by 224 pixels with deliberate dither everywhere translucency appears; no alpha blending.',
        key_features:
          'vertical-stripe dither; checkerboard fake transparency; steppy 9-bit palette; parallax layers; no alpha blending',
      }),
      avoid: [...AVOID, 'alpha blending', 'smooth gradients'],
      briefs: [
        'Dither-heavy 16-bit console scene of a waterfall cave, the falling mist faked with vertical-stripe dither, steppy blue palette, parallax rock layers. No text or logo.',
        'Dither-heavy 16-bit console scene of a foundry pouring molten steel, checkerboard-dithered heat glow and hard-edged orange light blocks. No text or logo.',
        'Dither-heavy 16-bit console scene of a glass conservatory under an aurora, the panes made translucent with checkerboard dither. No text or logo.',
      ],
    },
    'SP06-096': {
      name: 'Dense Arcade Mega-Sprite',
      dna: px({
        aesthetic:
          'Late arcade pixel art: very large hand-pixeled sprites with dense painterly clusters, dozens of palettes and exhaustive mechanical detail.',
        color_and_tone:
          'Rich but controlled palettes of about sixteen colors per sprite, warm metal browns against cool greys, bright flashes for sparks.',
        lighting_and_shadow:
          'Consistent top-left light with hand-placed highlights, selective dark outlines and pixel-drawn smoke and debris.',
        texture_and_material:
          'Rivets, dents, rust streaks, cloth folds and debris all resolved in pixel clusters; puffs of pixel smoke and flying shards.',
        camera_and_composition:
          'Keep the requested view; the main sprite fills much of the frame, surrounded by small secondary detail.',
        atmosphere_and_mood: 'Loud and generous, every inch of the sprite showing off craft.',
        rendering_and_quality:
          'Hand-placed clusters with no stray pixels; enormous detail kept readable.',
        key_features:
          'huge hand-pixeled sprites; dense clusters; rivets and debris; pixel smoke; selective outlines',
      }),
      avoid: [...AVOID, 'military insignia', 'blurry upscaling', 'copied soldier sprites'],
      dropAvoid: ['weak hardware'],
      briefs: [
        'Dense arcade mega-sprite of a rust-streaked steam tank crushing a wooden barricade, every rivet and dent hand-pixeled, pixel smoke puffs and flying shards. No text or logo.',
        'Dense arcade mega-sprite of a hulking ogre chef stirring a bubbling cauldron, cloth folds and grease stains in dense pixel clusters. No text or logo.',
        'Dense arcade mega-sprite of a stone bridge collapsing into a gorge, dozens of pixel-drawn falling blocks and dust puffs. No text or logo.',
      ],
    },
    'SP06-097': {
      name: 'HAM Copper-Gradient Paint',
      dna: px({
        aesthetic:
          'Late-80s paint-program pixel art: thousands of colors through hold-and-modify mode, with sky gradients made from per-scanline palette changes.',
        color_and_tone:
          'Rich painterly color with horizontal color bleed at hard edges; skies built from smooth-looking horizontal gradient bars.',
        lighting_and_shadow:
          'Painted light with soft digitized shading, dramatic sunsets and glossy highlights.',
        texture_and_material:
          'Horizontal color-fringe smears where shapes meet, fine paint-program brush dither, and banded copper sky bars.',
        camera_and_composition:
          'Keep the requested view; wide landscape-style compositions with layered horizon bands.',
        atmosphere_and_mood: 'Grand and romantic, a painting squeezed out of a home computer.',
        rendering_and_quality:
          'Painterly many-color pixels with visible fringing and horizontal banding; no modern smooth gradients.',
        key_features:
          'hold-and-modify color fringing; per-scanline gradient bars; painterly pixels; digitized shading; wide horizons',
      }),
      avoid: [...AVOID, 'modern smooth gradients', 'flat limited palette'],
      dropAvoid: ['PC'],
      briefs: [
        'HAM copper-gradient paint of a shepherd on a cliff watching a banded sunset, horizontal gradient bars across the sky, color-fringe smears along the cliff edge. No text or logo.',
        'HAM copper-gradient paint of a field of sunflowers under a banded storm sky, painterly petals and horizontal color bleed along every stem. No text or logo.',
        'HAM copper-gradient paint of a giant snail crawling over a garden wall at dusk, glossy digitized shell highlights and fringed edges. No text or logo.',
      ],
    },
    'SP06-098': {
      name: 'Candy-Bright Compact Sprite',
      dna: px({
        aesthetic:
          'Compact 16-bit pixel art: small round-bodied sprites with thick near-black outlines on large flat pastel backgrounds.',
        color_and_tone:
          'Candy-bright saturated 9-bit colors, pink, mint, sky blue and lemon, with two-step shading only.',
        lighting_and_shadow:
          'Minimal shading; one bright highlight pixel cluster and one darker step per shape.',
        texture_and_material:
          'Thick outlines, rounded blobby forms, simple repeated background shapes such as clouds, hills and bricks.',
        camera_and_composition:
          'Keep the requested view; big-headed subjects centered on clean pastel fields with lots of air.',
        atmosphere_and_mood: 'Cheerful and bouncy, cute even when the subject is spooky.',
        rendering_and_quality:
          'Crisp compact sprites with clean outlines; no dither noise and no muddy colors.',
        key_features:
          'round compact sprites; thick near-black outlines; candy-bright palette; two-step shading; pastel backgrounds',
      }),
      avoid: [...AVOID, 'gritty realism', 'muddy colors'],
      dropAvoid: ['western', 'Nintendo', 'limited', 'simple', 'weak', 'slow', 'CGA'],
      briefs: [
        'Candy-bright compact sprite of a round penguin mail carrier sledding down an icy slope on a parcel, thick near-black outlines, mint and sky-blue pastel background. No text or logo.',
        'Candy-bright compact sprite scene of a village of fruit-cake houses with icing roofs, pink and lemon two-step shading, big simple clouds. No text or logo.',
        'Candy-bright compact sprite of a tiny grumpy mummy in a pastel pyramid, cute round body, thick outline, lavender background. No text or logo.',
      ],
    },
    'SP06-099': {
      name: 'Stylus Memo Flipbook Doodle',
      dna: px({
        aesthetic:
          'Handheld stylus memo animation: jaggy black pen lines at 256 by 192 on a white memo page, with a faint onion-skin of the previous frame.',
        color_and_tone:
          'Black ink on white with at most one red or blue ink accent; no shading colors.',
        lighting_and_shadow:
          'No lighting; shadows drawn as simple stamp-pattern fills or scribbled hatching.',
        texture_and_material:
          'Aliased one to three pixel pen strokes, stamped dot and stripe patterns, faint light-grey onion-skin lines.',
        camera_and_composition:
          'Keep the requested view; a loose doodle centered on the page with motion lines and a ghosted previous pose.',
        atmosphere_and_mood: 'Playful and amateur, a joke animated between classes.',
        rendering_and_quality:
          'Low-resolution jaggy lines kept crude and lively; no device, frame counter or interface drawn.',
        key_features:
          'jaggy black stylus lines; one red or blue accent; onion-skin ghost frame; stamp-pattern fills; 256x192 page',
      }),
      avoid: [...AVOID, 'full color', 'smooth vector lines', 'frame counter'],
      dropAvoid: ['color'],
      briefs: [
        'Stylus memo flipbook doodle of a cat chasing its own tail in circles, jaggy black pen lines, a faint onion-skin ghost of the previous pose, red ink on the tail tip, white memo page. No text or logo.',
        'Stylus memo flipbook doodle of an adult lumberjack chopping a tree that springs back up, stamp-pattern bark, motion lines and blue ink wood chips. No text or logo.',
        'Stylus memo flipbook doodle of a paper airplane looping around a crescent moon, dotted stamp stars and a ghosted previous loop. No text or logo.',
      ],
    },
    'SP06-100': {
      name: 'Pocket Camera Thermal Dot Print',
      dna: px({
        aesthetic:
          'Toy pocket-camera photo at 128 by 112 pixels in four greys, edge-enhanced and printed on a narrow strip of thermal paper.',
        subject_treatment:
          'Keep the prompt subject, action and camera view; capture it as a tiny four-grey dithered photograph printed on thermal paper.',
        color_and_tone:
          'Four grey levels only on warm grey-white thermal paper; blacks print slightly brownish and faded.',
        lighting_and_shadow:
          'Harsh contrast from a tiny sensor: bright areas clip to paper white, shadows fill with dense dither.',
        texture_and_material:
          'Bayer ordered dither, bright edge-enhancement halos, visible printer dot rows and slight thermal fading streaks.',
        camera_and_composition:
          'Keep the requested view; close subjects work best, with a slight wide-angle bulge and no printed border frame.',
        atmosphere_and_mood: 'Fond and scrappy, a snapshot kept in a drawer.',
        rendering_and_quality:
          'Chunky square photo pixels with ordered dither; no smooth grayscale and no color.',
        key_features:
          '128x112 four-grey photo; Bayer dither; edge-enhancement halos; thermal paper dot rows; faded print',
      }),
      avoid: [...AVOID, 'generic couple selfie', 'smooth grayscale', 'decorative print frame'],
      briefs: [
        'Pocket camera thermal dot print of a stone gargoyle face in close-up, four greys, Bayer dither in the shadows, bright edge-enhancement halos, faded dot rows on warm thermal paper. No text or logo.',
        'Pocket camera thermal dot print of an adult fisherman holding up a long eel on a wooden pier, harsh clipped sky and slight wide-angle bulge. No text or logo.',
        'Pocket camera thermal dot print of a crooked row of snow-covered beehives, ordered dither in the snow and thermal fading streaks. No text or logo.',
      ],
    },
  },
};

export const aliases = {
  'SP06-081': 'Game Boy Green Monochrome',
  'SP06-082': 'SNES Mode 7 Vista',
  'SP06-086': 'RPG Maker Chibi Tileworld',
  'SP06-087': 'GBA Tactical Pixel',
  'SP06-088': 'PSX Vertex Wobble',
  'SP06-091': 'Vectrex Vector Display',
  'SP06-092': 'C64 Commodore Palette',
  'SP06-093': 'MSX2 Japanese Computer',
  'SP06-094': 'Atari 2600 Extreme Limitation',
  'SP06-095': 'Sega Genesis Dither-Heavy',
  'SP06-096': 'Neo Geo Sprite King',
  'SP06-097': 'Amiga DeluxePaint HAM',
  'SP06-098': 'TurboGrafx PC Engine',
  'SP06-099': 'DS Flipnote Studio',
  'SP06-100': 'Game Boy Camera Thermal Print',
};

export default spec;
