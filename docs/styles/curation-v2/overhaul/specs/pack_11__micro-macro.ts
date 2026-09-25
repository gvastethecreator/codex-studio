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
        'Scanning electron micrograph of a tardigrade in plated armor standing guard on a pollen grain like a boulder, greyscale, bright edge glow along its folds and claws, spiky pollen spheres around it, deep focus. No text or scale bar.',
        'Greyscale SEM image of a field of diatom shells arranged like the ruins of a cathedral, lace-like pores in every shell, a single spore resting on an arch, bright edge glow and deep focus. No text or scale bar.',
        "Electron micrograph of a moth's wing scales overlapping like tiles on a dark roof, one scale lifted and curled, a dust mite crawling across the ridges, crisp greyscale edge glow. No text or scale bar.",
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
        "Extreme macro of a dragonfly's compound eye filling the frame, thousands of hexagonal facets each reflecting a tiny torch flame, iridescent green and bronze, fine hairs along the rim, soft ring light sparkle. No text or logo.",
        "Macro of a horsefly's compound eye with red and green interference bands, a gothic window reflected across every facet, glassy hexagons curving away into blur. No text or logo.",
        'Macro portrait of a jumping spider with glossy black main eyes reflecting a hooded wanderer holding a lantern, iridescent scales on its head and fine hairs catching the ring light. No text or logo.',
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
        'Fluorescence microscope image where a colony of cells grows into the silhouette of a crowned serpent, blue nuclei, green membranes and red fibers glowing on black inside a round microscope field. No text or scale bar.',
        'Brightfield histology slide stained pink and violet in which the tissue folds read as a mountain fortress at dusk, soft backlight, granular cytoplasm and dark nuclei like windows. No text or scale bar.',
        'Fluorescent neurons branching like a black winter forest, one bright cell glowing amber at the center like a lantern in the woods, dendrites crossing in blue and magenta. No text or scale bar.',
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
        'Macro photograph of a single snowflake resting on black wool, its six dendrite arms ending in tiny claw-like branches around a hexagonal plate, crystal-clear ice with trapped bubbles and pale blue glints. No text or logo.',
        'Snowflake macro with a thick hexagonal plate at the center like a frozen throne room, feathery dendrites radiating outward, backlit so the ridges glow cold blue. No text or logo.',
        'Frost crystals growing across an old leaded window in the shape of a rider on horseback, feathery ice ferns, dawn backlight turning the frost gold at the edges. No text or logo.',
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
        'Macro photograph of a circuit board seen as a walled city from above: copper-trace streets, chip towers, capacitor silos and solder domes, one component shaped like a coiled serpent at the gate, raking light glinting. No text or logo.',
        'Silicon die macro with rainbow interference sheen, its logic blocks laid out like a labyrinth garden, a single dust particle at the center like a lost wanderer. No text or logo.',
        'Circuit board macro at night angle with warm LEDs glowing like windows in a sleeping town, copper roads, solder-bead boulders and a mite crossing a trace bridge. No text or logo.',
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
        'Macro of a water droplet hanging from a black thorn, inside it an upside-down image of a dark castle under a red moon, blurred forest behind, crisp specular highlights on the surface. No text or logo.',
        'Row of dew drops strung along a spider thread at dawn, each drop holding an inverted image of a burning torch procession, golden bokeh behind. No text or logo.',
        'Single raindrop on a dark leaf refracting a raven taking flight across a stormy sky, meniscus edge glowing, smaller droplets around it. No text or logo.',
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
        'Extreme macro of coarse wool fabric where twisted fibers rise like a forest of ropes, a lost ladybird climbing between them, side light revealing every strand and fuzz. No text or logo.',
        'Macro of an old embroidered tapestry where the gold-thread stitches of a serpent become giant twisted cables, frayed ends and dust in the weave. No text or logo.',
        'Silk weave macro shimmering like a moonlit landscape of woven hills, one pulled thread running across it like a river, soft side light. No text or logo.',
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
        'Macro of a rusted iron helmet where flaking red paint and orange rust blisters form the coastline of a burning kingdom, raking light across every flake and pit. No text or logo.',
        'Rust macro on an old ship hull where corrosion blooms spread like the tentacles of a kraken, peeling teal paint and salt crust, raking light. No text or logo.',
        'Macro of a rusted skeleton key where oxide crystals rise like crumbling towers along the bit, flakes of paint caught in the teeth, dark iron beneath. No text or logo.',
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
        'Extreme macro of a green-gold human iris filling the frame, radial fibers and crypts like a ring of canyons, the black pupil reflecting a burning village, wet corneal highlight. No text or logo.',
        'Macro of a pale grey iris with a witch holding a candle reflected in the pupil, fine fibers and a dark limbal ring, soft ring-light reflection. No text or logo.',
        'Iris macro in deep violet and amber radiating like a solar eclipse, a lone hooded figure reflected small in the pupil, glossy wet surface. No text or logo.',
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
        'Macro of a soap bubble surface where swirling interference colors form a storm around a dark planet-like spot, rainbow film on black, film edges thinning into gold. No text or logo.',
        'Soap bubble drifting through a dark castle hall, its skin reflecting a candlelit banquet table in curved rainbow colors, tiny black thin spots on top. No text or logo.',
        'Cluster of soap bubbles joined by thin walls like a floating palace, each surface reflecting a stained-glass window, swirling magenta and teal film. No text or logo.',
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
        'Macro of a raven feather where the barbs split into rows like a dark forest, iridescent violet and green sheen, a single water droplet resting between barbules. No text or logo.',
        'Macro of a peacock feather eye, blue and bronze barbules forming a watchful dragon-like eye, structural iridescence shifting under side light. No text or logo.',
        'Owl feather macro with soft downy barbs like a snowy landscape at dusk, fringe edges catching light, a tiny seed caught in the plumage. No text or logo.',
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
        'Backlit macro of an autumn maple leaf whose veins branch like a tree of life, glowing red and gold cells between them, sunlight streaming through a small insect-bitten hole. No text or logo.',
        'Macro of a leaf skeleton with lace-like veins forming the tracery of a gothic rose window, backlit against a dark sky. No text or logo.',
        'Green leaf macro where the veins read as a river delta seen from above, cells like tiny fields, chlorophyll glowing in strong backlight. No text or logo.',
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
        'Extreme macro of skin on the back of a hand where fine lines and pores form a desert landscape of dunes, a single fine hair like a lone tree, soft raking light. No text or logo.',
        'Skin macro of an old blackwork tattoo of a serpent, ink settled into pores and fine lines, slightly blurred edges, soft side light. No text or logo.',
        'Macro of a fingertip whose ridge pattern forms a labyrinth, a bead of sweat at its center like a pool, soft raking light. No text or logo.',
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
        'Ink in water forming a winged beast, black and crimson clouds curling into wings and a tail, tendrils trailing downward, lit on clean white. No text or logo.',
        'Ink in water: a cloud of pale indigo ink unfurling through dark water into a ghostly lady in a flowing gown, tendrils trailing from her sleeves and hem, lit evenly against black. No text or logo.',
        'Ink drops sinking in clear water as vortex rings that stack into the smoke towers of a castle, violet and gold ink on white. No text or logo.',
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
        'Petri dish with mold colonies grown into the shape of a crowned skull, fuzzy white hyphae, green spore rings and black spore heads on amber agar, soft lab light. No text or logo.',
        'Macro of mold spore heads rising like a forest of black-capped trees on a crust of old bread, fuzzy hyphae fog between them, dim light. No text or logo.',
        'Fungal growth spreading across a slice of bread in colored patches like the map of rival kingdoms, fuzzy borders where they meet. No text or logo.',
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
        'Macro of a chemical garden where blue and green crystal towers grow into a castle skyline in a glass jar, faceted spires, backlight glowing through the crystals. No text or logo.',
        'Crystal growth forming the ribcage of a giant beast from white salt needles on black volcanic stone, sharp faceted spines catching a cold side light, tiny crystals still sprouting at the tips. No text or logo.',
        'Macro of a rainbow bismuth crystal grown like a stepped temple staircase, iridescent oxide colors shifting across its square hopper terraces, hard side light and a black background. No text or logo.',
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
        'Extreme macro of vinyl record grooves where the sound waves ripple like a line of dancers, the stylus tip moving through like a colossus, raking light and rainbow sheen. No text or logo.',
        'Groove macro of an old record with dust particles like boulders and a hair like a fallen tree across the canyon, rainbow sheen. No text or logo.',
        'Vinyl record macro where the grooves of a loud passage become jagged cliffs, the stylus throwing a long shadow, dark glossy surface. No text or logo.',
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
        'Extreme macro of hook-and-loop fastener where black plastic hooks form a thorny forest and tangled loops hang like vines, a dust mite caught between them, side light. No text or logo.',
        'Hook-and-loop macro with curved hooks lined up like a field of scythes under a pale light, loops blurred in the background. No text or logo.',
        'Extreme macro of hook-and-loop fastener loops grown like a tangled jungle canopy, one torn fiber drooping across the gap like a rope bridge, soft side light and deep shadows between the loops. No text or logo.',
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
        'Extreme macro of a natural sea sponge where the holes become a cave system, light filtering through pores, a tiny water droplet hanging from a cave ceiling. No text or logo.',
        'Sponge macro in warm amber light where the open cells and shadows arrange into a hidden watching face, soft glow through the thin walls, droplets clinging to the pore edges. No text or logo.',
        'Macro of synthetic sponge cells like a honeycomb city of round rooms, soft light glowing through the thin foam walls, one cell holding a single trapped bubble. No text or logo.',
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
        'Macro of moss as a miniature forest, spore capsules on thin stalks like lanterns, dew drops, a beetle wandering through soft forest light. No text or logo.',
        'Macro of moss covering a fallen stone carving of a face in a forest, tiny moss leaves filling its eye sockets, spore capsules rising like eyelashes, morning dew on everything. No text or logo.',
        'Moss macro where a small snail climbs a tall spore stalk like a slow dragon scaling a tower, dew beads on the capsule, soft green forest light and blurred moss hills behind. No text or logo.',
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
        'Extreme macro of coarse sandpaper where angular grains become a rocky mountain range, glue pooled between them like frozen lakes, raking light. No text or logo.',
        'Extreme macro of sandpaper with a single red garnet grain rising like a fortress on a hill of grey abrasive grit, glue pooled around its base, harsh raking light. No text or logo.',
        'Macro of fine sandpaper grit like a desert of glittering crystal boulders, one human hair lying across it like a fallen pillar, raking light casting long shadows. No text or logo.',
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
        'Microscope view of cork cells forming a honeycomb of hollow rooms, warm tan light through thin walls, one dark pore like a tunnel entrance. No text or logo.',
        'Macro of the cut end of an old wine cork, wine-stained pores like red caves, broken cell walls at the cut edge and a single dried drop of wine like a ruby. No text or logo.',
        'Macro of cork oak bark with deep cracks like canyons, honeycomb cell texture on the ridges and a small spider crossing a ridge, warm side light. No text or logo.',
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
        'Macro of carbon fiber twill weave where the glossy black tows form armor-like scales, resin highlights and hard rim light. No text or logo.',
        'Macro of carbon fiber weave following the curve of a helmet shell, the twill pattern bending over the rim, deep glossy clearcoat reflecting a hard rim light. No text or logo.',
        'Macro of carbon fiber weave like a woven dark landscape seen from above, one frayed tow lifting out like a fallen tree, resin gloss catching a cold light. No text or logo.',
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
        'Backlit macro of a dandelion seed head at sunset, seeds breaking away on glowing parachutes, fine pappus hairs catching the golden light. No text or logo.',
        'Backlit macro of a single dandelion seed drifting past a black castle silhouette at dusk, its pappus hairs glowing gold, a few more seeds blurred in the orange sky. No text or logo.',
        'Macro of dandelion seeds caught in a dew-covered spider web like trapped stars, pappus hairs glittering, a dark forest background and the spider waiting at the edge. No text or logo.',
      ],
    ),
  },
};

export default spec;
