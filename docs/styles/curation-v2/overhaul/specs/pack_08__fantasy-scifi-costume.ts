import type { Create, Spec } from '../tools/apply';
import { WARDROBE_AVOID, wear } from './_wardrobe';

// DNA for this category was already rewritten in the cloud curation pass; this batch adds three
// briefs per preset that show each construction on a clearly different wearer and setting.
const AVOID = [...WARDROBE_AVOID, 'franchise costume replica'];

const spec: Spec = {
  pack: 'pack_08',
  category: '4. Fantasy Sci-Fi Costume',
  updates: {
    'SP08-006': {
      briefs: [
        "Climbing a storm-lashed iron lighthouse, a keeper in sealed laminated shell panels, a strap-fed harness and taped seams stays bone dry as waves explode below. No readable text or logo.",
        "On a windy ridge an elderly falconer in slate modular outerwear unzips a detachable gauntlet pocket to let his hawk land. No readable text or logo.",
        "Walking through a sandstorm between ruined pillars, a monk in ochre modular shell layers snaps each magnetic closure shut against the grit. No readable text or logo.",
      ],
    },
    'SP08-009': {
      briefs: [
        "An airship engineer in a brass-buckled corset over a linen shirt, leather tool bandolier and watch chains wrestles a valve on a rattling boiler mid-flight. No readable text or logo.",
        "An elderly clockmaker in a chained waistcoat, copper goggles and sleeve garters bends over a bench where his tiny automatons are unionizing. No readable text or logo.",
        "Riding a mechanical ostrich across a windswept moor, a gentleman in a tailored engineering coat keeps one hand firmly on his top hat. No readable text or logo.",
      ],
    },
    'SP08-013': {
      briefs: [
        "Barefoot on a frozen lake, a woman in translucent layered silver gauze with fine starlight embroidery leaves no footprints on the ice. No readable text or logo.",
        "A reader in translucent pale-blue robes with silvered embroidery sits by moonlight in a ruined library, the fabric glowing brighter than the moon. No readable text or logo.",
        "An elderly woman in layered moth-grey translucent gowns releases lanterns over a lake, and moths follow the hem of her sleeves. No readable text or logo.",
      ],
    },
    'SP08-015': {
      briefs: [
        "Mid-roar on a crowded expo floor, a cosplayer in handmade foam armor of an original demon knight shows off segmented panels, painted weathering and visible straps. No readable text or logo.",
        "An elderly man in a handmade foam owl-knight costume with giant craft wings wins first prize at a village fair, beaming. No readable text or logo.",
        "In a parking lot at dusk a woman in a foam crab-armor costume struggles to fix a strap with her enormous thermoplastic claws. No readable text or logo.",
      ],
    },
    'SP08-040': {
      briefs: [
        "A traveler in a retro quilted pressure suit with a gasketed collar ring and fishbowl helmet under one arm stands in the doorway of a medieval tavern. No readable text or logo.",
        "An elderly man in a silver pressure suit fishes from a rowboat on a still lake, his helmet serving as the bait bucket. No readable text or logo.",
        "Two dancers in matching orange pressure suits waltz in a snowy pine forest at dusk, their fishbowl helmets resting on a fallen log. No readable text or logo.",
      ],
    },
    'SP08-041': {
      briefs: [
        "A blacksmith's forearm augmentation flows into her tailored leather apron along glowing seam channels as she hammers red-hot steel. No readable text or logo.",
        "An elderly man in a tailored grey suit, precise implant channels tracing his collar and jaw, feeds pigeons in a rainy square. No readable text or logo.",
        "Mid-leap in an empty cathedral, a dancer in cybernetic couture lets her luminous spine channels throw pale light across the vaulted ceiling. No readable text or logo.",
      ],
    },
    'SP08-042': {
      briefs: [
        "Crossing a flooded highway on stilts, a scavenger wears tire-rubber pauldrons, patched canvas, repurposed shin guards and cracked goggles. No readable text or logo.",
        "An elderly survivor in layered repaired gear tends tomatoes in a rooftop garden above a ruined city, his coat patched with a curtain. No readable text or logo.",
        "A wandering squire in armor rebuilt from hubcaps and scrap rides a mule through falling ash, a dented saucepan for a helmet. No readable text or logo.",
      ],
    },
    'SP08-043': {
      briefs: [
        "On a rain-soaked balcony a monarch in towering sculpted collar, crimson-and-gold vertical robes and jeweled headdress watches a fleet descend. No readable text or logo.",
        "An elderly ruler in ivory ceremonial robes with gilded shoulder architecture sits alone on a vast stone throne, a single moth circling. No readable text or logo.",
        "Silk panels trailing in the dust, a man in midnight-blue ceremonial couture with towering shoulders haggles for figs in a desert bazaar. No readable text or logo.",
      ],
    },
    'SP08-044': {
      briefs: [
        "Waiting at a modern bus stop in the rain, a sorceress in long indigo layers and a deep cowl embroidered with silver constellations checks the timetable. No readable text or logo.",
        "An elderly gardener in moss-green layered robes and a deep hood tends a greenhouse of glowing plants that lean toward his embroidery. No readable text or logo.",
        "A mage in burgundy robes embroidered with constellations stands on a sea cliff at night, the stars above rearranging to match his hem. No readable text or logo.",
      ],
    },
    'SP08-045': {
      briefs: [
        "A baker in a graphic heroic stretch suit with bold teal and cream panels and angular seams pulls a tray of bread from the oven like a rescue. No readable text or logo.",
        "An elderly man in a crimson-and-black heroic suit with no emblem walks his dog through autumn leaves, cape tucked into his belt. No readable text or logo.",
        "Striking a heroic pose on a gatehouse, a knight wears a violet stretch suit under his tabard while the guards pretend not to notice. No readable text or logo.",
      ],
    },
    'SP08-046': {
      briefs: [
        "A pilot in a sealed interface suit with support bands, capsule seam paths and compact connectors sits on a hay bale in a barn, sharing an apple with a horse. No readable text or logo.",
        "An elderly man in a white-and-orange interface suit fishes on a pier, his connector cables coiled neatly beside the tackle box. No readable text or logo.",
        "A monk in a charcoal interface suit meditates inside a stone temple, every connector port capped with a tiny lotus. No readable text or logo.",
      ],
    },
    'SP08-047': {
      briefs: [
        "Through a sunny flower market walks a woman in a high-collared, tapered black longline coat with blood-red lining and silver clasps, buying only black roses. No readable text or logo.",
        "An elderly aristocrat in a high-collared coat plays an organ in a ruined chapel, bats hanging from the pipes like notes. No readable text or logo.",
        "Standing in a gondola gliding through a fogbound canal at night, a man in a high-collared black longline coat lets the red lining spill over the side. No readable text or logo.",
      ],
    },
    'SP08-048': {
      briefs: [
        "Barricading a castle door with a pitchfork, a survivor wears patched layers, field-repaired seams and duct-taped padding. No readable text or logo.",
        "An elderly man in distressed survivor gear and a makeshift armored scarf reads by candlelight in a bunker, glasses taped at the bridge. No readable text or logo.",
        "Two survivors in patched layers cook over a fire in a ruined mall atrium, a shopping cart serving as their stove. No readable text or logo.",
      ],
    },
    'SP08-049': {
      briefs: [
        "Descending a wet stone staircase to the sea, a woman in a gown of scalloped pearlescent scales with fin-shaped hems drags a long fishtail train. No readable text or logo.",
        "A man in a coat with fin-seam rhythms and nacre scales stands in a salt marsh at dawn as herons mistake him for one of their own. No readable text or logo.",
        "An elderly woman in a teal fishtail-train gown with scalloped scales presides over a candlelit harbor feast. No readable text or logo.",
      ],
    },
    'SP08-050': {
      briefs: [
        "Through a medieval hay market walks a woman in asymmetric synthetic panels, deliberate cutouts and a strap lattice, farmers dropping their pitchforks. No readable text or logo.",
        "An elderly man in an asymmetric iridescent coat with strap lattices feeds goats, which are very interested in the straps. No readable text or logo.",
        "On a volcanic black beach a dancer in cutout synthetic couture holds a pose while steam rises around her ankles. No readable text or logo.",
      ],
    },
    'SP08-065': {
      briefs: [
        "Skating on a frozen moat at night, a woman in matte modular panels traced with narrow emissive circuit paths draws glowing lines on the ice. No readable text or logo.",
        "An elderly man in a matte black suit with cyan emissive seams walks through a dark pine forest, the only light for miles. No readable text or logo.",
        "A knight whose armor is lined with thin magenta light circuits stands in a rainy courtyard, each drop glowing as it lands. No readable text or logo.",
      ],
    },
    'SP08-078': {
      name: 'Holographic Projection Figure',
      briefs: [
        "Flickering above a stone well in a village square, a queen rendered in translucent bands and horizontal scanlines greets baffled villagers. No readable text or logo.",
        "An elderly man sits in a real armchair while his clothes and body flicker as a cyan hologram with interference bands. No readable text or logo.",
        "Projected as a flickering blue guard, a knight watches over an empty museum hall at night, scanlines crawling across the armor. No readable text or logo.",
      ],
    },
    'SP08-079': {
      briefs: [
        "Sneaking past sleeping guards, a thief in a transparent lens-like veil bends the torchlit corridor behind her into prismatic edges. No readable text or logo.",
        "On a forest path a man in a refractive cloak lets the trees bend visibly through him with thin rainbow edges. No readable text or logo.",
        "An elderly woman in a refractive veil sits on a park bench, the bench visible through her warped silhouette while pigeons stare. No readable text or logo.",
      ],
    },
    'SP08-080': {
      briefs: [
        "In a bright white marble hall stands a woman in light-absorbing near-black layers with smoke-soft hems and a thin rim of light. No readable text or logo.",
        "A man in a coat whose hems dissolve into dark mist walks through a sunny wheat field, leaving a trail of shade. No readable text or logo.",
        "An elderly woman in layered light-swallowing couture sits at a candlelit dinner, the candles leaning away from her. No readable text or logo.",
      ],
    },
  },
  creates: [
    {
      name: 'Chitin Insectoid Armor',
      domain: 'insect-shell costume armor',
      tags: ['chitin', 'insectoid', 'costume'],
      dna: wear(
        'Chitin insectoid armor: segmented iridescent exoskeleton plates shaped like beetle, mantis or wasp shells, overlapping at joints with membrane-like fabric between.',
        'segmented, overlapping chitin plates with iridescent sheen over the torso, shoulders and limbs, jointed at elbows and knees with thin membrane-like fabric; optional elytra-like cape panels.',
        'Oil-slick iridescence — green, violet and bronze — or matte black and amber.',
        'Raking light that reveals the iridescent shift on each plate.',
        'Lacquered chitin shells, translucent membrane fabric, fine hairs and joint seams.',
        'Full figure showing plate segmentation clearly.',
        'Alien, elegant, unsettling and armored.',
        'Crisp, glossy, detailed finish.',
        'segmented iridescent chitin plates; membrane joints; elytra cape panels; oil-slick sheen; raking light',
      ),
      avoid: [...AVOID, 'full insect transformation of the body'],
      briefs: [
        "Kneeling in a moonlit rose garden, a knight in iridescent green-violet chitin armor spreads elytra-like cape panels under raking light. No readable text or logo.",
        "An elderly beekeeper in matte black-and-amber shell segments with membrane joints tends wooden hives while bees land on the iridescent plates. No readable text or logo.",
        "A dancer in bronze mantis-plate armor with membrane joints poses on a rooftop at dusk, arms folded like a praying insect. No readable text or logo.",
      ],
    },
  ] satisfies Create[],
};

export default spec;
