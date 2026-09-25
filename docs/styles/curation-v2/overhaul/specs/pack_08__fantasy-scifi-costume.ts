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
        'Photograph of an adult woman lighthouse keeper in sealed technical modular outerwear — laminated shell panels, strap-fed utility harness and taped seams — climbing a storm-lashed iron ladder. No text or logo.',
        'Photograph of an elderly adult man falconer in slate modular technical outerwear with detachable panels and a gauntlet pocket, a hawk on his arm on a windy ridge. No text or logo.',
        'Photograph of an adult monk in ochre modular shell layers with magnetic closures walking through a sandstorm between ruined pillars. No text or logo.',
      ],
    },
    'SP08-009': {
      briefs: [
        'Photograph of an adult woman airship engineer in steampunk attire — brass-buckled corset over a linen shirt, leather tool bandolier and gear-watch chains — adjusting a valve on a rattling boiler. No text or logo.',
        'Photograph of an elderly adult man clockmaker in a steampunk waistcoat with layered chains, copper goggles and sleeve garters at a bench of tiny automatons. No text or logo.',
        'Photograph of an adult man in steampunk engineering attire riding a mechanical ostrich across a moor. No text or logo.',
      ],
    },
    'SP08-013': {
      briefs: [
        'Photograph of an adult woman in ethereal fantasy formalwear — translucent layered silver gauze with fine starlight embroidery and long fluid lines — walking barefoot across a frozen waterfall. No text or logo.',
        'Photograph of an adult man in translucent pale-blue ethereal robes with silvered embroidery reading by moonlight in a ruined library. No text or logo.',
        'Photograph of an elderly adult woman in layered moth-grey translucent fantasy gowns releasing lanterns over a lake. No text or logo.',
      ],
    },
    'SP08-015': {
      briefs: [
        'Photograph of an adult cosplayer in a convention-craft foam armor of an original demon knight — segmented EVA panels, painted weathering and visible strap assembly — posing in a convention hallway. No text or logo.',
        'Photograph of an elderly adult man in a handmade foam-and-thermoplastic owl-knight costume with giant craft wings at a village fair. No text or logo.',
        'Photograph of an adult woman in a foam-built crab-armor costume with thermoplastic claws, fixing a strap in a parking lot at dusk. No text or logo.',
      ],
    },
    'SP08-040': {
      briefs: [
        'Photograph of an adult woman in a retro pressure suit — rounded quilted volume, gasketed collar ring and fishbowl helmet under her arm — standing in a medieval tavern doorway. No text or logo.',
        'Photograph of an elderly adult man in a silver retro space suit fishing from a rowboat on a still lake. No text or logo.',
        'Photograph of two adults in matching orange retro pressure suits with quilted volume and gasketed collar rings dancing in a snowy pine forest at dusk, fishbowl helmets set on a fallen log beside them. No text or logo.',
      ],
    },
    'SP08-041': {
      briefs: [
        'Photograph of an adult woman blacksmith with cybernetic couture — contour-channeled forearm augmentation integrated into a tailored leather apron and glowing seam lines — hammering a blade. No text or logo.',
        'Photograph of an elderly adult man in a tailored grey suit whose collar and jaw carry precise implant contour channels, feeding pigeons in a rainy square. No text or logo.',
        'Photograph of an adult dancer in cybernetic couture with luminous spine channels mid-leap in an empty cathedral. No text or logo.',
      ],
    },
    'SP08-042': {
      briefs: [
        'Photograph of an adult woman in post-apocalyptic scavenger wear — mismatched tire-rubber pauldrons, patched canvas, road-sign shin guards and goggles — crossing a flooded highway on stilts. No text or logo.',
        'Photograph of an elderly adult man in layered scavenged survival gear with visible repairs tending a rooftop garden in a ruined city. No text or logo.',
        'Photograph of an adult knight whose armor is rebuilt from scavenged scrap and hubcaps riding a mule through ash. No text or logo.',
      ],
    },
    'SP08-043': {
      briefs: [
        'Photograph of an adult woman in space-opera royal couture — towering sculpted collar, crimson-and-gold vertical robes and jeweled headdress — standing on a rain-soaked castle balcony. No text or logo.',
        'Photograph of an elderly adult man in ceremonial space-opera robes of ivory with gilded shoulder architecture seated alone on a vast stone throne. No text or logo.',
        'Photograph of an adult man in midnight-blue space-opera couture with a sculpted waist and towering shoulder architecture walking through a dusty desert bazaar, silk panels trailing in the hot wind among spice stalls. No text or logo.',
      ],
    },
    'SP08-044': {
      briefs: [
        'Photograph of an adult woman in wizard robes — long vertical indigo layers, deep cowl and fine silver celestial embroidery — waiting at a modern bus stop in the rain. No text or logo.',
        'Photograph of an elderly adult man in moss-green layered wizard robes with a deep hood tending a greenhouse of glowing plants. No text or logo.',
        'Photograph of an adult wizard in burgundy robes embroidered with constellations standing on a sea cliff at night. No text or logo.',
      ],
    },
    'SP08-045': {
      briefs: [
        'Photograph of an adult woman baker in a graphic heroic stretch suit — bold teal and cream color panels, angular seam lines and gauntlet-to-boot transitions — pulling bread from an oven. No text or logo.',
        'Photograph of an elderly adult man in a crimson-and-black heroic suit with no emblem walking his dog through autumn leaves. No text or logo.',
        'Photograph of an adult knight wearing a violet heroic stretch suit under a tabard, standing heroically on a castle gatehouse. No text or logo.',
      ],
    },
    'SP08-046': {
      briefs: [
        'Photograph of an adult woman mech pilot in a sealed interface suit — support bands, capsule seam paths and compact connector hardware — sitting on a hay bale in a barn. No text or logo.',
        'Photograph of an elderly adult man in a white-and-orange mech pilot suit fishing on a pier. No text or logo.',
        'Photograph of an adult monk in a charcoal mech interface suit meditating inside a stone temple. No text or logo.',
      ],
    },
    'SP08-047': {
      briefs: [
        'Photograph of an adult woman in vampire-lord tailoring — high collar, tapered longline black coat with blood-red lining and silver clasps — walking through a sunny flower market. No text or logo.',
        'Photograph of an elderly adult man in an aristocratic vampire coat with a high collar playing an organ in a ruined chapel. No text or logo.',
        'Photograph of an adult man in vampire-lord tailoring with a high collar, tapered black longline coat and blood-red lining standing in a gondola gliding through a fogbound canal at night, a single lantern on the prow. No text or logo.',
      ],
    },
    'SP08-048': {
      briefs: [
        'Photograph of an adult woman in zombie-survivor utility wear — patched layers, field-repair seams and duct-taped padding — barricading a castle door with a pitchfork. No text or logo.',
        'Photograph of an elderly adult man in distressed survivor gear with a makeshift armored scarf reading by candlelight in a bunker. No text or logo.',
        'Photograph of two adults in patched survivor layers cooking over a fire in a ruined mall atrium. No text or logo.',
      ],
    },
    'SP08-049': {
      briefs: [
        'Photograph of an adult woman in pelagic tail couture — scalloped pearlescent scale lattice, fin-shaped hems and a long fishtail train — descending a wet stone staircase to the sea. No text or logo.',
        'Photograph of an adult man in a pelagic couture coat with fin-seam rhythms and nacre scales standing in a salt marsh at dawn. No text or logo.',
        'Photograph of an elderly adult woman in a teal fishtail-train gown with scalloped scales at a candlelit harbor feast. No text or logo.',
      ],
    },
    'SP08-050': {
      briefs: [
        'Photograph of an adult woman in alien avant-garde fashion — asymmetric synthetic panels, deliberate cutouts and a strap lattice — walking through a medieval hay market. No text or logo.',
        'Photograph of an elderly adult man in an asymmetric iridescent alien-fashion coat with strap lattices feeding goats. No text or logo.',
        'Photograph of an adult dancer in cutout synthetic alien couture posing on a volcanic black beach. No text or logo.',
      ],
    },
    'SP08-065': {
      briefs: [
        'Photograph of an adult woman in a neon light suit — narrow emissive circuit paths over matte modular panels — skating on a frozen castle moat at night. No text or logo.',
        'Photograph of an elderly adult man in a matte black suit with cyan emissive seams walking through a dark pine forest. No text or logo.',
        'Photograph of an adult knight whose armor is lined with thin magenta light circuits standing in a rainy courtyard. No text or logo.',
      ],
    },
    'SP08-078': {
      name: 'Holographic Projection Figure',
      briefs: [
        'Photograph of an adult woman queen rendered as a hologram — translucent bands, horizontal scanlines and faint ghost edges — flickering above a stone well in a village square. No text or logo.',
        'Photograph of an elderly adult man sitting in an armchair whose clothes and body are rendered as a cyan hologram with interference bands. No text or logo.',
        'Photograph of an adult knight projected as a flickering blue hologram guarding an empty museum hall at night, translucent bands and horizontal scanlines across the armor, faint ghost edges on the real display cases behind. No text or logo.',
      ],
    },
    'SP08-079': {
      briefs: [
        'Photograph of an adult woman thief in a refractive concealment veil — transparent lens-like fabric bending the torchlit corridor behind her with prismatic edges — sneaking past sleeping guards. No text or logo.',
        'Photograph of an adult man in a refractive cloak on a forest path, the trees bending visibly through it with rainbow edges. No text or logo.',
        'Photograph of an elderly adult woman in a refractive veil sitting on a park bench, the bench visible through her distorted silhouette. No text or logo.',
      ],
    },
    'SP08-080': {
      briefs: [
        'Photograph of an adult woman in shadow couture — light-absorbing near-black layers with smoke-soft fading hems and a thin rim of light — standing in a bright white marble hall. No text or logo.',
        'Photograph of an adult man in a shadow-form coat whose hems dissolve into dark mist, walking through a sunny wheat field. No text or logo.',
        'Photograph of an elderly adult woman in layered shadow couture seated at a candlelit dinner table. No text or logo.',
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
        'Photograph of an adult woman knight in iridescent green-violet chitin insectoid armor with elytra-like cape panels, kneeling in a moonlit rose garden. Raking light. No text or logo.',
        'Photograph of an elderly adult beekeeper in matte black-and-amber beetle-shell armor segments with membrane joints tending wooden hives in a wildflower meadow, bees landing on the iridescent plates in warm evening light. No text or logo.',
        'Photograph of an adult dancer in bronze mantis-plate armor with membrane joints posing on a rooftop at dusk. No text or logo.',
      ],
    },
  ] satisfies Create[],
};

export default spec;
