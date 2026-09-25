import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Classic industrial punks (part A): each new punk is built around one historical technology and
// its own visual language, so it does not clone steampunk. Existing presets keep their DNA.
const AVOID = [...STYLE_AVOID, 'generic brass gears everywhere', 'real brand or company logo'];

const punk = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'punk', 'industrial'],
  dna: dna(fields),
  avoid: AVOID,
  briefs,
});

const spec: Spec = {
  pack: 'pack_15',
  category: '1. Classic Industrial Punks',
  updates: {
    'SP15-081': {
      briefs: [
        'A duchess in a whalebone corset pilots a steam-powered mechanical kraken through the flooded ballroom of her own sinking manor, champagne glasses floating past its brass tentacles while the orchestra keeps playing on the balcony. No readable text or logo.',
        'A disgraced inventor tries to sell a clockwork horse to a dragon at a smoky country fair, the dragon suspiciously sniffing the boiler while a crowd in top hats places bets. No readable text or logo.',
        'In a Victorian orphanage attic at midnight, a girl secretly repairs a broken brass angel that has fallen from the cathedral spire, its steam heart ticking faintly in her lap. No readable text or logo.',
      ],
    },
    'SP15-082': {
      briefs: [
        'A cathedral-sized armored zeppelin drops a thousand paper lanterns over a besieged harbor city instead of bombs, its riveted gondola lit from inside by a jazz band playing for the enemy. No readable text or logo.',
        'An oil-stained mechanic in overalls argues with a sulking giant robot who refuses to leave the hangar in the rain, both drinking coffee from enormous and tiny cups. No readable text or logo.',
        'A lone switchman in a gas mask walks the roof of an endless armored train at dawn, fog swallowing the tracks ahead and a crow riding on his shoulder. No readable text or logo.',
      ],
    },
    'SP15-083': {
      briefs: [
        'A Renaissance queen lies in state inside a glass clock whose gears keep her heart turning, courtiers in black kneeling as the great pendulum swings across the chapel. No readable text or logo.',
        'Two rival watchmakers settle a feud with a race of spring-driven mechanical snails across a Florentine piazza, pigeons refereeing from the fountain. No readable text or logo.',
        'A tiny clockwork nightingale sings alone in the ruins of a burned palace library, winding itself with its own beak. No readable text or logo.',
      ],
    },
  },
  creates: [
    punk(
      'Teslapunk',
      'early electrical age punk',
      'teslapunk',
      {
        aesthetic:
          'Teslapunk: the dawn of electricity as wonder and danger, with coil towers, crackling arcs, glass insulators and lightning harnessed in laboratories.',
        subject_treatment:
          "Keep the prompt's subject and setting; power it with visible early electricity (coils, arcs, glass insulators, copper wiring) instead of steam.",
        color_and_tone:
          'Deep night blue and copper with violet-white electric arcs and warm filament amber.',
        lighting_and_shadow:
          'Arc light flashing hard shadows in all directions, bulbs glowing amber and blue sparks at contacts.',
        texture_and_material:
          'Copper coils, porcelain insulators, glass bulbs, varnished wood panels and braided cloth wire.',
        camera_and_composition:
          'Towering coil structures framed from below, arcs cutting diagonally across the frame.',
        atmosphere_and_mood:
          'Electric and awe-struck, genius and danger crackling in the same laboratory air.',
        rendering_and_quality:
          'Detailed period illustration with luminous arc effects and precise electrical hardware.',
        key_features: 'tesla coils; violet arcs; glass insulators; copper wiring',
      },
      [
        'Two rival inventors duel inside a flooded gothic cathedral turned laboratory, their tesla coils facing each other across the nave, lightning forking into the organ pipes while a bride in rubber gloves calmly reads in the front pew. No readable text or logo.',
        'A frazzled village doctor revives a thunderstruck ox with a hand-cranked coil in a barn, the farmers hiding behind hay bales with their hair standing straight up. No readable text or logo.',
        'At the edge of a salt marsh, a lighthouse keeper feeds bottled lightning to a glowing jellyfish-like creature that lives inside the lamp. No readable text or logo.',
      ],
    ),
    punk(
      'Gaslamp Fantasy Punk',
      'gaslit fantasy city punk',
      'gaslamp',
      {
        aesthetic:
          'Gaslamp fantasy punk: a fog-bound 19th-century city where gas lamps, street magic, clockmakers and fae markets mix in narrow cobbled lanes.',
        subject_treatment:
          "Keep the prompt's subject and setting; place it in gaslit fog with one quiet touch of magic hidden in ordinary Victorian life.",
        color_and_tone:
          'Fog grey and soot brown with warm gaslight yellow and small emerald or violet magical accents.',
        lighting_and_shadow:
          'Pools of gaslight in thick fog, silhouettes appearing between lamps and soft haloes.',
        texture_and_material:
          'Wet cobbles, soot-stained brick, wrought iron lamps, wool coats and top hats.',
        camera_and_composition:
          'Narrow street perspectives receding into fog with figures caught between lamps.',
        atmosphere_and_mood:
          'Mysterious and cozy, a city where every alley might hide a small enchantment.',
        rendering_and_quality:
          'Painterly period illustration with soft fog gradients and crisp gaslight glows.',
        key_features: 'gaslight pools; thick fog; cobbled lanes; hidden magic',
      },
      [
        'A funeral procession of lamplighters carries a coffin full of burning gas flames through a fog-drowned city, every street lamp going dark as they pass, fae mourners following on the rooftops. No readable text or logo.',
        "A pickpocket accidentally steals a tiny sleeping dragon from a gentleman's waistcoat and panics in a crowded gaslit omnibus as it starts to wake. No readable text or logo.",
        'A widow in a black veil sets two teacups every night for the ghost who knocks inside her gas lamp, the flame bending toward the empty chair. No readable text or logo.',
      ],
    ),
    punk(
      'Sailpunk',
      'age of sail technology punk',
      'sailpunk',
      {
        aesthetic:
          'Sailpunk: an alternate age of sail where wind power drives everything, from rigged cities and sail-carts to kite-drawn airships.',
        subject_treatment:
          "Keep the prompt's subject and setting; rig it with sails, masts, pulleys and rope so wind is the visible power source.",
        color_and_tone:
          'Canvas cream, tarred wood brown and sea blue with faded red and ochre pennants.',
        lighting_and_shadow:
          'Bright sea light, sails glowing translucent where the sun passes through them.',
        texture_and_material:
          'Canvas, hemp rope, blocks and tackle, tarred planks and salt-stained brass.',
        camera_and_composition:
          'Upward views through rigging and wide horizons with sails catching wind.',
        atmosphere_and_mood:
          'Free and weathered, a world that moves only as fast as the wind allows.',
        rendering_and_quality:
          'Crisp nautical illustration with accurate rigging and luminous canvas.',
        key_features: 'sails everywhere; rope rigging; wind power; glowing canvas',
      },
      [
        'An armada of land-ships with patchwork sails charges across a desert of white salt toward a walled city on stilts, pirate flags without symbols snapping and sand spraying from giant wooden wheels. No readable text or logo.',
        "A grandmother rigs a bedsheet sail to her rocking chair on a windy cliff and races the local children's kite-carts down the hill, shawl flying. No readable text or logo.",
        'A becalmed sail-city drifts silent in fog, its thousand canvas sails hanging limp while the citizens sit on the rooftops whistling for wind. No readable text or logo.',
      ],
    ),
    punk(
      'Foundrypunk',
      'iron casting industry punk',
      'foundrypunk',
      {
        aesthetic:
          'Foundrypunk: an iron-casting civilization of blast furnaces, molten pours, sand molds and giant cast-iron structures glowing in the dark.',
        subject_treatment:
          "Keep the prompt's subject and setting; build it from heavy cast iron and show molten metal being poured or cooled nearby.",
        color_and_tone:
          'Soot black and iron grey with molten orange, yellow-white pours and red glow.',
        lighting_and_shadow:
          'Molten metal as the main light source, casting hot orange rims and deep black shadow.',
        texture_and_material:
          'Rough cast iron, sand molds, slag, scale and sweat-soaked leather aprons.',
        camera_and_composition:
          'Low angles beside pouring ladles and huge silhouetted furnace towers.',
        atmosphere_and_mood:
          'Hellish and proud, heavy labor producing things that are meant to last centuries.',
        rendering_and_quality:
          'Dramatic industrial illustration with intense glow and heavy material weight.',
        key_features: 'molten pours; cast iron; furnace glow; sand molds',
      },
      [
        'A foundry god made of cooling iron rises from the casting pit as the workers finish pouring it, glowing cracks still running through its chest, the ladle crew bowing in their leather aprons. No readable text or logo.',
        'A proud blacksmith family casts a life-size iron statue of their grumpy cat, who sits beside the mold supervising with extreme disapproval. No readable text or logo.',
        'At night an abandoned foundry glows again for one hour, a ghost crew pouring molten light into molds that nobody collects. No readable text or logo.',
      ],
    ),
    punk(
      'Railpunk',
      'railway empire punk',
      'railpunk',
      {
        aesthetic:
          'Railpunk: a civilization built on railways, with rolling cities, locomotive fortresses, station cathedrals and tracks crossing every landscape.',
        subject_treatment:
          "Keep the prompt's subject and setting; put it on, beside or inside rail infrastructure so tracks and locomotives define the world.",
        color_and_tone: 'Soot black, oxblood red, brass and cream with steam-white skies.',
        lighting_and_shadow:
          'Headlamps cutting through steam, station skylights and firebox glow on engineers.',
        texture_and_material:
          'Riveted locomotive plates, iron rails, wooden sleepers, cinders and glass station roofs.',
        camera_and_composition:
          'Converging track perspectives to the horizon and huge locomotives framed head-on.',
        atmosphere_and_mood:
          'Relentless and grand, a world that never stops moving along its iron lines.',
        rendering_and_quality:
          'Detailed period illustration with strong perspective and billowing steam.',
        key_features: 'converging tracks; locomotive fortresses; steam; station cathedrals',
      },
      [
        'A cathedral on rails, spire and all, thunders across a frozen steppe pulled by six locomotives while wolves race alongside and a bishop rings the bell from the moving belfry. No readable text or logo.',
        'A furious stationmaster tries to issue a ticket to an enormous migrating tortoise that has walked onto the platform and refuses to move off the tracks. No readable text or logo.',
        'Deep in a forest, a lost train from a hundred years ago still waits at an overgrown platform, lamps lit, passengers asleep in their seats. No readable text or logo.',
      ],
    ),
    punk(
      'Loompunk',
      'textile machine age punk',
      'loompunk',
      {
        aesthetic:
          'Loompunk: a textile-mill world where punch-card looms compute, thread is data and whole cities are woven on colossal machines.',
        subject_treatment:
          "Keep the prompt's subject and setting; weave it into looms, thread and punch-card mechanisms so pattern becomes the technology.",
        color_and_tone:
          'Undyed linen cream, indigo, madder red and polished wood with bright thread accents.',
        lighting_and_shadow:
          'Tall mill windows throwing parallel beams across rows of looms and floating fibers.',
        texture_and_material: 'Warp threads, punch cards, shuttles, wooden frames and cloth bolts.',
        camera_and_composition:
          'Long rows of looms receding in perspective and close views of threads crossing.',
        atmosphere_and_mood:
          'Rhythmic and industrious, the clatter of machines weaving patterns that think.',
        rendering_and_quality: 'Intricate period illustration with precise thread and card detail.',
        key_features: 'punch-card looms; warp threads; mill windows; woven patterns',
      },
      [
        'The last surviving loom of a burned city weaves a new sky from salvaged thread, workers on scaffolds feeding punch cards while a tapestry of stars unrolls over the ruins. No readable text or logo.',
        "A mill girl discovers the punch-card loom has been secretly weaving portraits of the foreman's cat instead of cloth for three weeks. No readable text or logo.",
        'An old weaver unravels her own shadow thread by thread on a loom in a moonlit attic, her silhouette on the wall getting thinner. No readable text or logo.',
      ],
    ),
    punk(
      'Coalpunk',
      'coal mining age punk',
      'coalpunk',
      {
        aesthetic:
          'Coalpunk: underground mining cities of lamp-lit tunnels, coal carts, pit ponies, pumping engines and soot-blackened faces.',
        subject_treatment:
          "Keep the prompt's subject and setting; take it underground or into a mining town, lit by lamps and dusted with coal.",
        color_and_tone: 'Coal black and slate grey with small warm lamp pools and ember red.',
        lighting_and_shadow:
          'Helmet and hand lamps as the only light, tiny circles in overwhelming darkness.',
        texture_and_material: 'Coal seams, timber props, rail carts, soot and sweat on skin.',
        camera_and_composition:
          'Tunnel perspectives lit only by lamps, and tight framing on faces in the dark.',
        atmosphere_and_mood:
          'Claustrophobic and communal, danger shared by people who trust each other with their lives.',
        rendering_and_quality:
          'Low-key period illustration with heavy darks and precise lamp glows.',
        key_features: 'lamp pools; coal seams; timber props; soot',
      },
      [
        'Miners break through a coal seam into the ribcage of an enormous fossilized dragon glowing faintly underground, their helmet lamps tiny against the dark bones. No readable text or logo.',
        'A pit pony with a helmet lamp leads a panicked group of lost miners back to the lift, clearly having done this many times before. No readable text or logo.',
        'A canary in a cage sings for a single miner who never left the deep shaft, his lamp still burning after decades. No readable text or logo.',
      ],
    ),
  ] satisfies Create[],
};

export default spec;
