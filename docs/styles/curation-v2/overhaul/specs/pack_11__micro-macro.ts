import type { Dna, Spec, Update } from '../tools/apply';
import { STYLE_AVOID } from './_style';

// Micro and macro: each preset is one magnification method plus the specimen texture it reveals.
// The prompt subject is either shown at that scale or emerges from that texture (a creature formed
// by frost dendrites, a scene inside a water drop). Cellular themes stay illustrative, not medical.
const AVOID = [...STYLE_AVOID, 'medical gore', 'readable scale bar text'];

const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
const pad = (t: string, min: number, tail: string) =>
  words(t) < min ? `${t.replace(/\.$/, '')}, ${tail}` : t;

function macro(
  aesthetic: string,
  method: string,
  color: string,
  light: string,
  texture: string,
  mood: string,
  key: string,
): Dna {
  return {
    aesthetic,
    subject_treatment: `Show the prompt's subject at this magnification, or let its shape and action emerge from this specimen texture while staying recognizable: ${method}`,
    color_and_tone: pad(color, 9, 'as the instrument or lens would record it.'),
    lighting_and_shadow: pad(light, 9, 'matching the real imaging setup at this scale.'),
    texture_and_material: pad(texture, 9, 'resolved in fine detail at extreme magnification.'),
    camera_and_composition:
      'Extreme close-up or microscope field with shallow or instrument-specific depth, the specimen filling the frame and scale implied by structure.',
    atmosphere_and_mood: pad(mood, 8, 'from discovering a hidden world at tiny scale.'),
    rendering_and_quality:
      'Scientific-grade macro or micrograph realism with crisp structure and believable optics.',
    key_features: key,
  };
}

const u = (dna: Dna, briefs: [string, string, string], name?: string): Update => ({
  ...(name ? { name } : {}),
  dna,
  avoid: AVOID,
  briefs,
});

const spec: Spec = {
  pack: 'pack_11',
  category: '5. Micro Macro',
  updates: {
    'SP11-056': u(
      macro(
        'Scanning electron micrograph: grey, razor-sharp microscopic landscape with deep focus and edge glow.',
        'rendered as a greyscale SEM image with bright edges, deep focus and sculptural microstructures; false color only if asked.',
        'Monochrome grey with bright edge highlights.',
        'Electron-beam edge glow with no cast shadows.',
        'Microscopic ridges, spores, hairs and crystalline grains.',
        'Alien, precise, eerie and fascinating.',
        'greyscale SEM; edge glow; deep focus; microstructure',
      ),
      [
        "A tardigrade in plated armor stands guard on a pollen grain as big as a boulder, every crease razor sharp in grey microscopic relief. No readable text or logo.",
        "A field of diatom shells lies arranged like the ruins of a cathedral, lace-like pores in every shell under deep greyscale focus. No readable text or logo.",
        "A moth's wing scales overlap like tiles on a dark roof, one scale lifted and curled back, a speck of dust resting on it like a stone. No readable text or logo.",
      ],
    ),
    'SP11-057': u(
      macro(
        'Insect compound eye macro: a curved dome of hexagonal ommatidia, iridescent and glassy.',
        'shown through or reflected across a compound eye: hexagonal lens grid, curved dome, iridescent sheen.',
        'Iridescent greens, bronzes and reds.',
        'Soft ring light with a sparkle in each facet.',
        'Hexagonal facets, fine hairs and chitin.',
        'Alien, intricate, watchful and strange.',
        'hexagonal ommatidia; curved dome; iridescent facets',
      ),
      [
        "A dragonfly's compound eye fills the frame, thousands of hexagonal facets each reflecting a tiny burning torch. No readable text or logo.",
        "Red and green interference bands ripple across a horsefly's compound eye, a gothic window reflected in every facet. No readable text or logo.",
        "A jumping spider's glossy black main eyes reflect a hooded wanderer holding a lantern, iridescent scales around its face. No readable text or logo.",
      ],
    ),
    'SP11-058': u(
      macro(
        'Cellular life: stained microscope-slide cells with membranes, nuclei and organelles in vivid histology color.',
        'formed from cells: membranes, nuclei, vesicles and fibers under a light microscope with histology staining.',
        'Pink and purple histology stains, or fluorescent green, blue and red.',
        'Brightfield backlight or dark-field fluorescence.',
        'Soft membranes, granular cytoplasm and fibers.',
        'Organic, wondrous, alive and intimate.',
        'membranes; nuclei; histology stain; microscope field',
      ),
      [
        "A colony of glowing cells grows into the silhouette of a crowned serpent, blue nuclei and green membranes under fluorescence. No readable text or logo.",
        "Pink and violet stained tissue folds on a slide until it reads as a mountain fortress at dusk under soft brightfield light. No readable text or logo.",
        "Fluorescent neurons branch like a black winter forest, one bright cell glowing amber at the center like a lantern in the woods. No readable text or logo.",
      ],
    ),
    'SP11-059': u(
      macro(
        'Snowflake macro: a single six-sided ice crystal with fractal dendrites on dark wool.',
        'formed from or held within a six-fold ice crystal: dendrites, plates, sharp symmetry and frosty sparkle.',
        'Icy white and pale blue on dark background.',
        'Backlit or ring-lit crystal glints.',
        'Clear ice, dendrite branches and tiny bubbles.',
        'Cold, delicate, perfect and fleeting.',
        'six-fold symmetry; dendrites; ice sparkle; dark wool',
      ),
      [
        "Resting alone on black wool, one six-armed ice crystal ends every dendrite in tiny claw-like branches around its hexagonal heart. No readable text or logo.",
        "A thick hexagonal plate sits at the center of a crystal like a frozen throne room, feathery dendrites radiating outward. No readable text or logo.",
        "Frost crystals grow across an old leaded window in the shape of a rider on horseback, backlit by pale dawn. No readable text or logo.",
      ],
    ),
    'SP11-060': u(
      macro(
        'Circuit macro: chip die and circuit board seen close like a glittering city of traces and components.',
        'built from silicon die patterns, copper traces, solder and tiny components like a miniature city.',
        'Green solder mask, copper gold and rainbow die sheen.',
        'Raking light with metallic glints.',
        'Copper traces, solder beads and silicon patterns.',
        'Precise, dense, urban and electric.',
        'die patterns; copper traces; solder; city scale',
      ),
      [
        "Seen up close from above, a green board becomes a walled city of copper-trace streets, chip towers and capacitor silos. No readable text or logo.",
        "A bare silicon die shimmers with rainbow interference, its logic blocks laid out like a labyrinth garden with one dust particle trapped inside. No readable text or logo.",
        "At a low angle warm diodes glow like windows in a sleeping town, copper roads and solder beads catching the light. No readable text or logo.",
      ],
      'Circuit Board Macro',
    ),
    'SP11-061': u(
      macro(
        'Water drop macro: a clear droplet acting as a lens, holding an upside-down miniature world.',
        'seen inside or refracted by a water droplet: a spherical lens with an inverted world, meniscus and highlights.',
        'Clear water with rich colors of the refracted scene.',
        'Backlight with sparkling specular highlights.',
        'Water surface tension, beads and glossy highlights.',
        'Delicate, magical, clear and quiet.',
        'droplet lens; inverted world; meniscus; sparkle',
      ),
      [
        "A droplet hanging from a black thorn holds an upside-down image of a dark castle under a red moon. No readable text or logo.",
        "Dew drops strung along a spider thread at dawn each hold an inverted image of a torch procession winding through fog. No readable text or logo.",
        "A single raindrop on a dark leaf refracts a raven taking flight across a stormy sky, its edge glowing. No readable text or logo.",
      ],
    ),
    'SP11-062': u(
      macro(
        'Fiber macro: fabric seen so close that threads become cables and weave becomes architecture.',
        'woven into or shown among individual threads: twisted fibers, weave crossings and loose fuzz.',
        'Thread colors with soft shadowed depth.',
        'Side light revealing twist and weave depth.',
        'Individual fibers, twist, fuzz and weave.',
        'Tactile, intricate, cozy and surprising.',
        'thread twist; weave crossings; fuzz',
      ),
      [
        "Twisted wool fibers rise like a forest of ropes while a lost ladybird climbs between them looking for a way out. No readable text or logo.",
        "On an old tapestry the gold-thread stitches of a serpent become giant twisted cables, frayed ends curling like vines. No readable text or logo.",
        "A silk weave shimmers like a moonlit landscape of woven hills, one pulled thread running across it like a silver river. No readable text or logo.",
      ],
    ),
    'SP11-063': u(
      macro(
        'Rust macro: corroded metal with flaking paint, blisters and orange oxide landscapes.',
        'formed from or shown on corroded metal: flaking paint, rust blisters, pitting and oxide stains.',
        'Rust orange, peeling paint colors and dark iron.',
        'Raking light across flakes.',
        'Flaking paint, rust bloom and pitted steel.',
        'Decaying, beautiful, patient and melancholic.',
        'rust bloom; flaking paint; pitting',
      ),
      [
        "On an old iron helmet flaking red paint and orange blisters form the coastline of a burning kingdom seen from above. No readable text or logo.",
        "On a ship's hull corrosion blooms spread like kraken tentacles through peeling teal paint and crusted salt. No readable text or logo.",
        "Along the bit of an old skeleton key oxide crystals rise like crumbling towers, flakes of paint caught between them. No readable text or logo.",
      ],
    ),
    'SP11-064': u(
      macro(
        'Iris macro: a human eye so close that the iris becomes a radial landscape of fibers and color.',
        'reflected in or shaped from an iris: radial fibers, crypts, pupil and wet corneal highlights.',
        'Rich iris colors with dark pupil.',
        'Ring-light reflection on the cornea.',
        'Radial fibers, crypts and wet surface.',
        'Intimate, mysterious, alive and hypnotic.',
        'radial iris fibers; pupil; corneal reflection',
      ),
      [
        "A green-gold human iris fills the frame, radial fibers and crypts forming a ring of canyons around the black pupil. No readable text or logo.",
        "A pale grey iris holds the tiny reflection of a woman with a candle in its pupil, a dark limbal ring framing everything. No readable text or logo.",
        "A deep violet and amber iris radiates like a solar eclipse, a lone hooded figure reflected small in the pupil. No readable text or logo.",
      ],
    ),
    'SP11-065': u(
      macro(
        'Soap bubble macro: swirling thin-film interference colors on a floating sphere.',
        'formed from or reflected on a soap-film surface: swirling rainbow interference, black thin spots and floating spheres.',
        'Rainbow interference colors on black.',
        'Soft reflected light on the film.',
        'Swirling thin-film colors and film edges.',
        'Ephemeral, dreamy, delicate and magical.',
        'thin-film interference; swirling rainbow; spheres',
      ),
      [
        "Swirling interference colors on a bubble's skin form a storm around a dark planet-like spot, rainbow bands racing. No readable text or logo.",
        "A bubble drifts through a dark castle hall, its skin reflecting a candlelit banquet in curved rainbow colors. No readable text or logo.",
        "A cluster of bubbles joined by thin walls floats like a palace, each surface reflecting a stained-glass window. No readable text or logo.",
      ],
    ),
    'SP11-067': u(
      macro(
        'Feather macro: barbs and barbules in precise rows with iridescent sheen.',
        'shaped from or shown among feather structure: barbs, barbules, hooks and structural iridescence.',
        'Natural feather colors with iridescent green, blue and purple.',
        'Side light revealing iridescence.',
        'Barbs, barbules and hooks.',
        'Elegant, delicate, precise and wild.',
        'barbs; barbules; iridescence',
      ),
      [
        "Split into rows like a dark forest, the barbs of a raven's plume shimmer with violet and green sheen as the light shifts. No readable text or logo.",
        "Staring back from a peacock's train, one eye of blue and bronze barbules shifts its iridescence as the light moves across it. No readable text or logo.",
        "Soft downy barbs of an owl feather spread like a snowy landscape at dusk, a tiny seed caught in the fringe. No readable text or logo.",
      ],
    ),
    'SP11-068': u(
      macro(
        'Leaf vein macro: backlit leaf showing a glowing network of veins and cells.',
        'formed from or traced in leaf veins: backlit veins, cells and chlorophyll glow.',
        'Glowing greens and golds, or autumn reds.',
        'Strong backlight through the leaf.',
        'Vein network, cells and leaf edges.',
        'Living, intricate, calm and luminous.',
        'backlit veins; cell pattern; chlorophyll glow',
      ),
      [
        "Backlit, an autumn maple leaf branches like a tree of life, red and gold cells glowing between its veins. No readable text or logo.",
        "Against a dark sky, the lace-like network of a bleached skeleton leaf forms the tracery of a gothic rose window. No readable text or logo.",
        "Seen with light behind it, a green blade's network reads as a river delta from above, cells like tiny fields glowing in the sun. No readable text or logo.",
      ],
    ),
    'SP11-069': u(
      macro(
        'Skin macro: human skin as a terrain of pores, fine lines and tiny hairs.',
        'shown on skin at extreme magnification: pores, lines, fine hairs and texture as landscape.',
        'Natural skin tones.',
        'Soft raking light.',
        'Pores, fine lines and hairs.',
        'Intimate, uncanny, organic and honest.',
        'pores; fine lines; hairs; skin terrain',
      ),
      [
        "On the back of a hand fine lines and pores form a desert of dunes, a single hair standing like a lone tree. No readable text or logo.",
        "An old blackwork tattoo of a serpent has settled into the pores and fine lines of the skin, its edges softly blurred. No readable text or logo.",
        "A fingertip's ridge pattern forms a labyrinth with a bead of sweat at its center like a pool. No readable text or logo.",
      ],
    ),
    'SP11-070': u(
      macro(
        'Ink in water: dye clouds blooming and curling through clear water.',
        'formed by ink clouds in water: blooms, curls, vortex rings and tendrils.',
        'Rich ink colors on white or black.',
        'Even backlight through water.',
        'Soft ink tendrils and clouds.',
        'Fluid, mysterious, graceful and dreamlike.',
        'ink clouds; vortex rings; tendrils',
      ),
      [
        "Black and crimson clouds bloom through clear water into a winged beast, tendrils trailing down from its tail. No readable text or logo.",
        "A cloud of pale indigo unfurls through dark water into a ghostly lady in a flowing gown. No readable text or logo.",
        "Violet and gold drops sink as vortex rings that stack into the smoke towers of a castle on white. No readable text or logo.",
      ],
    ),
    'SP11-071': u(
      macro(
        'Mold and fungi macro: fuzzy colonies, hyphae and spore heads in a petri dish.',
        'grown as mold or fungal colonies: fuzzy hyphae, spore heads, rings and agar.',
        'Moldy greens, whites, yellows and black spores.',
        'Soft lab light on agar.',
        'Fuzzy hyphae, spores and agar gel.',
        'Eerie, organic, creeping and fascinating.',
        'fuzzy colonies; hyphae; spore heads; agar',
      ),
      [
        "In a petri dish fuzzy colonies have grown into a crowned skull, green spore rings and black specks for eyes. No readable text or logo.",
        "Black-capped spore heads rise like a forest on a crust of old bread, fuzzy hyphae drifting like fog between them. No readable text or logo.",
        "Colored fungal patches spread across a slice of bread like the map of rival kingdoms at war along their borders. No readable text or logo.",
      ],
    ),
    'SP11-072': u(
      macro(
        'Crystal growth macro: chemical garden crystals growing into sharp geometric forms.',
        'grown from crystals: needles, cubes, clusters and chemical garden towers.',
        'Clear crystals with vivid chemical colors.',
        'Backlight through crystal.',
        'Faceted crystals and growth lines.',
        'Magical, sharp, slow and wondrous.',
        'crystal clusters; needles; chemical garden',
      ),
      [
        "In a glass jar blue and green crystal towers grow into a castle skyline of faceted spires. No readable text or logo.",
        "On black volcanic stone, needles of white salt slowly grow upward into the curved ribcage of a giant beast with a sharp faceted spine. No readable text or logo.",
        "A rainbow bismuth crystal rises like a stepped temple staircase, iridescent oxide colors shifting across it. No readable text or logo.",
      ],
    ),
    'SP11-073': u(
      macro(
        'Vinyl groove macro: record grooves as wavy canyons of sound.',
        'shown along record grooves: wavy canyons, dust and stylus.',
        'Black vinyl with rainbow sheen.',
        'Raking light showing groove waves.',
        'Vinyl grooves, dust and stylus.',
        'Nostalgic, precise, musical and deep.',
        'wavy grooves; stylus; dust',
      ),
      [
        "Record grooves ripple like a line of dancers as the stylus tip glides through the canyon. No readable text or logo.",
        "Dust particles sit like boulders in an old record's groove while a hair lies across it like a fallen tree. No readable text or logo.",
        "The grooves of a loud passage become jagged cliffs, the stylus throwing a long shadow across them. No readable text or logo.",
      ],
    ),
    'SP11-074': u(
      macro(
        'Hook-and-loop macro: plastic hooks and fiber loops like a strange forest.',
        'shown among hook-and-loop fastener: curved hooks, tangled loops and fibers.',
        'Plain fastener colors.',
        'Side light.',
        'Plastic hooks and loops.',
        'Strange, tactile, alien and playful.',
        'hooks; loops; fibers',
      ),
      [
        "Stiff black plastic barbs form a thorny forest while tangled fiber loops hang between them like vines in a jungle night. No readable text or logo.",
        "Lined up like a field of scythes under pale light, rows of curved plastic barbs wait while blurred fiber loops tangle behind them. No readable text or logo.",
        "Fiber loops grow like a tangled jungle canopy, one torn strand drooping across a gap like a broken bridge. No readable text or logo.",
      ],
      'Hook-and-Loop Macro',
    ),
    'SP11-075': u(
      macro(
        'Sponge macro: open cells, holes and bubbles like a cave system.',
        'shown among sponge structure: open cells, holes and walls.',
        'Sponge colors.',
        'Soft light into holes.',
        'Porous open cells.',
        'Cavernous, soft, odd and playful.',
        'open cells; holes; walls',
      ),
      [
        "A natural sea sponge becomes a cave system, light filtering through its pores onto a tiny water droplet. No readable text or logo.",
        "In warm amber light the open cells of a sponge arrange themselves into a hidden watching face. No readable text or logo.",
        "Synthetic foam cells form a honeycomb city of round rooms, soft light glowing through the thin walls. No readable text or logo.",
      ],
    ),
    'SP11-076': u(
      macro(
        'Moss macro: a tiny forest of leaves and spore capsules.',
        'placed in or grown from moss: tiny leaves, spore stalks and dew.',
        'Rich greens with dew.',
        'Soft forest light.',
        'Tiny leaves, dew and spore stalks.',
        'Miniature, lush, calm and magical.',
        'tiny leaves; spore capsules; dew',
      ),
      [
        "A miniature forest of moss holds spore capsules on thin stalks like lanterns while a beetle wanders through dew. No readable text or logo.",
        "In a quiet forest a fallen stone face lies buried in tiny green leaves that fill its eye sockets, spore capsules sprouting from its brow. No readable text or logo.",
        "A small snail climbs a tall spore stalk like a slow beast scaling a tower, dew beading on the capsule above it. No readable text or logo.",
      ],
    ),
    'SP11-077': u(
      macro(
        'Sandpaper macro: sharp grains like a rocky mountain landscape.',
        'shown among sandpaper grit: angular grains, glue and backing.',
        'Grit browns, greys and reds.',
        'Raking light.',
        'Angular grains and glue.',
        'Harsh, rugged, gritty and surprising.',
        'angular grains; glue; grit',
      ),
      [
        "Angular abrasive grains rise into a rocky mountain range under raking light, pools of dried glue sitting between them like frozen lakes. No readable text or logo.",
        "A single red garnet grain rises like a fortress on a hill of grey abrasive grit. No readable text or logo.",
        "Fine grit spreads like a desert of glittering crystal boulders with one human hair lying across it like a fallen log. No readable text or logo.",
      ],
      'Sandpaper Grit Macro',
    ),
    'SP11-078': u(
      macro(
        'Cork macro: honeycomb cells of cork bark.',
        'shown among cork cell structure: honeycomb cells and pores.',
        'Warm tan and brown.',
        'Soft side light.',
        'Honeycomb cells and pores.',
        'Warm, natural, curious and tactile.',
        'honeycomb cells; pores',
      ),
      [
        "Seen through a microscope, cork cells form a honeycomb of hollow rooms, warm light passing through their thin walls. No readable text or logo.",
        "The cut end of an old wine stopper shows wine-stained pores like red caves and broken cell walls at the edge. No readable text or logo.",
        "Deep cracks in oak bark open like canyons while a small spider crosses a honeycomb ridge. No readable text or logo.",
      ],
    ),
    'SP11-079': u(
      macro(
        'Carbon fiber weave macro: twill weave of black fibers with glossy resin.',
        'shown on or woven into carbon fiber weave: twill, tows and resin gloss.',
        'Black and grey with glossy highlights.',
        'Hard rim light.',
        'Woven tows and resin.',
        'Technical, sleek, strong and cool.',
        'twill weave; tows; resin gloss',
      ),
      [
        "Glossy black tows in a twill weave overlap like armor scales, resin highlights and hard rim light along each one. No readable text or logo.",
        "A twill weave bends over the rim of a helmet shell, deep glossy black and every fiber tow catching the light. No readable text or logo.",
        "A woven dark landscape seen from above holds one frayed tow lifting out like a fallen tree. No readable text or logo.",
      ],
      'Carbon Fiber Weave Macro',
    ),
    'SP11-080': u(
      macro(
        'Dandelion seed macro: fine pappus hairs and seeds.',
        'shown with or formed from dandelion seeds: pappus, hairs and seeds.',
        'Soft white and gold.',
        'Backlight.',
        'Fine hairs and seeds.',
        'Delicate, hopeful, light and fleeting.',
        'pappus; fine hairs; seeds',
      ),
      [
        "Backlit at sunset, a seed head breaks apart into glowing parachutes, fine hairs catching the light. No readable text or logo.",
        "A single seed on a glowing parachute of fine hairs drifts past the black silhouette of a hilltop castle at dusk, lit gold from behind. No readable text or logo.",
        "Seeds caught in a dew-covered spider web glitter like trapped stars, their fine hairs sparkling against the dark edge of a forest. No readable text or logo.",
      ],
    ),
  },
};

export default spec;
