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
        'Steampunk illustration of a lady cartographer adjusting the brass sextant of a mapping dirigible above a foggy harbor city, sepia-lithograph linework, matte gouache color and riveted Victorian machinery with visible pressure gauges and steam valves. No readable text or logo.',
        'Steampunk illustration of a clockwork elephant carrying a mobile library through a desert caravan, pistons in its legs, a librarian reading on its back under a canvas awning. No readable text or logo.',
        'Steampunk illustration of a Victorian submarine surfacing beside a lighthouse at dawn, portholes glowing, crew in brass diving helmets climbing onto the hull. No readable text or logo.',
      ],
    },
    'SP15-082': {
      briefs: [
        'Dieselpunk illustration of a streamlined interwar flying boat landing on a grey sea beside a fortified refinery island, compact engine masses, pressed steel panels, piston rhythm and exhaust smudging the sky. No readable text or logo.',
        'Dieselpunk illustration of a mechanic with oil-streaked arms tuning a colossal radial engine in a hangar lit by sodium lamps. No readable text or logo.',
        'Dieselpunk illustration of an armored land train crossing a frozen steppe at night under sweeping searchlights, smokestacks roaring, gun turrets turning and soldiers in greatcoats on the roof platforms. No readable text or logo.',
      ],
    },
    'SP15-083': {
      briefs: [
        'Clockpunk folio drawing of a Renaissance inventor testing a spring-driven flying machine from a tower balcony, fine ink construction lines, visible escapements and wound springs, apprentices holding ropes below. No readable text or logo.',
        'Clockpunk folio drawing of a clockwork knight automaton seated at a chessboard, its chest open to show the gear train. No readable text or logo.',
        'Clockpunk folio drawing of a canal city whose stone bridges rotate on huge exposed clock mechanisms at noon, boats waiting, ink construction lines showing every escapement and spring. No readable text or logo.',
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
        'Teslapunk illustration of a woman inventor standing between two towering coils in a stone laboratory at night, violet-white arcs leaping over her head to a caged glass globe, copper wiring and porcelain insulators everywhere. No readable text or logo.',
        'Teslapunk illustration of an electric tram pulling a glowing carriage through a rainy Victorian street, sparks spraying from the overhead wire and passengers lit by amber filament bulbs. No readable text or logo.',
        'Teslapunk illustration of a lighthouse powered by a giant coil on a cliff, arcs dancing between its tip and the storm clouds while keepers shelter behind glass. No readable text or logo.',
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
        'Gaslamp fantasy illustration of a lamplighter on a ladder lighting a gas lamp in a foggy cobbled lane, tiny winged fae gathering in the new glow while a hansom cab passes below, soot brick and soft haloes of light. No readable text or logo.',
        'Gaslamp fantasy illustration of a night market under railway arches where a goblin sells glowing jars beside a chestnut roaster, fog drifting between the stalls. No readable text or logo.',
        'Gaslamp fantasy illustration of a detective in a bowler hat examining footprints of frost on a warm summer pavement under a gas lamp. No readable text or logo.',
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
        'Sailpunk illustration of a wind-powered land ship with three masts racing across a salt flat, sails glowing in the sun, crew hauling ropes and pennants snapping, tarred wooden wheels leaving tracks. No readable text or logo.',
        'Sailpunk illustration of a harbor city whose windmill-sailed towers pump water and grind grain, rope bridges between them and ships in the bay. No readable text or logo.',
        'Sailpunk illustration of a young navigator riding a kite-drawn skiff over waves at dawn, the huge kite pulling her lines taut. No readable text or logo.',
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
        'Foundrypunk illustration of workers pouring a river of molten iron from a giant ladle into sand molds for a cast-iron bridge, orange-white glow lighting their leather aprons and goggles, blast furnaces roaring behind. No readable text or logo.',
        'Foundrypunk illustration of a cast-iron city of arched bridges and towers at night, every joint still glowing faintly from casting. No readable text or logo.',
        'Foundrypunk illustration of a young molder pressing a pattern of a lion into sand, a cooling iron lion statue beside her. No readable text or logo.',
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
        'Railpunk illustration of a walled city built on the flatbeds of an immense slow train crossing a snowy plain, houses, chimneys and a church spire riding on carriages, a locomotive the size of a fortress pulling it all. No readable text or logo.',
        'Railpunk illustration of a cathedral-like station hall with a glass roof where trains arrive from every direction in clouds of steam. No readable text or logo.',
        'Railpunk illustration of a signalwoman alone in a brick tower at a vast junction, pulling iron levers to switch tracks during a thunderstorm while two locomotives approach through the rain. No readable text or logo.',
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
        'Loompunk illustration of a vast mill hall where punch-card looms weave a giant tapestry map of the city, threads rising to the ceiling, mill girls feeding chains of cards while light beams cross the dusty air. No readable text or logo.',
        'Loompunk illustration of a weaver-engineer reading a pattern encoded in a long chain of punch cards draped over her shoulders. No readable text or logo.',
        'Loompunk illustration of a suspension bridge being woven from steel cable on a colossal loom that straddles a river gorge, weavers on scaffolds guiding the shuttle through the gap. No readable text or logo.',
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
        'Coalpunk illustration of miners riding a cart down a steep underground rail into a vast cavern city, helmet lamps making small circles of light on coal seams and timber props, a huge pumping engine breathing in the dark. No readable text or logo.',
        'Coalpunk illustration of a canary in a cage hanging in a tunnel beside a miner reading the flame of his safety lamp. No readable text or logo.',
        'Coalpunk illustration of a mining town at shift change, soot-faced workers walking home under a smoky black sky, lamps swinging and children running to meet them at the pithead gate. No readable text or logo.',
      ],
    ),
  ] satisfies Create[],
};

export default spec;
