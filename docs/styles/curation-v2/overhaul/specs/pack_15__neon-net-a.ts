import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Neon, net and signal punks (part A): each new punk grows from one information technology.
// Briefs follow the creativity standard: one striking idea each, rotating tones, relevant to the tech.
const AVOID = [...STYLE_AVOID, 'real brand or company logo', 'readable interface text'];

const punk = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'punk', 'signal'],
  dna: dna(fields),
  avoid: AVOID,
  briefs,
});

const spec: Spec = {
  pack: 'pack_15',
  category: '2. Neon, Net & Signal Punks',
  updates: {
    'SP15-084': {
      briefs: [
        'A back-alley surgeon installs a glowing prosthetic eye into a street samurai while a rainstorm of neon reflections pours down the clinic window, the patient calmly eating noodles with chopsticks through the procedure. No readable text or logo.',
        'Three grandmothers with hacked chrome knitting needles run the most feared data-smuggling ring in the market district from a steaming dumpling stall. No readable text or logo.',
        'On the flooded lowest level of a megacity, a child floats a paper boat lit by a salvaged LED past drowned billboards that still flicker underwater. No readable text or logo.',
      ],
    },
    'SP15-085': {
      briefs: [
        'A living city whose buildings are nodes and whose streets are glowing packet routes reroutes itself around a wound after an earthquake, pulses of light flowing past the rubble like blood around a clot. No readable text or logo.',
        'Pigeons wearing tiny relay backpacks form a mesh network over a rooftop village, one pigeon clearly overloaded and dragging a cable. No readable text or logo.',
        'A single abandoned node blinks alone in a desert, still forwarding messages from people who stopped answering years ago. No readable text or logo.',
      ],
    },
  },
  creates: [
    punk(
      'Holopunk',
      'hologram street punk',
      'holopunk',
      {
        aesthetic:
          'Holopunk: a street culture of cheap holograms, where ads, pets, disguises and ghosts are projected light flickering over grimy reality.',
        subject_treatment:
          "Keep the prompt's subject and setting; overlay or replace parts of it with translucent projected light that glitches at the edges.",
        color_and_tone:
          'Grimy concrete greys under translucent cyan, violet and pink projected light.',
        lighting_and_shadow:
          'Projected light that casts no shadows, flickering scanlines and projector beams through haze.',
        texture_and_material:
          'Semi-transparent holograms with scanlines and dropouts over wet concrete and rust.',
        camera_and_composition:
          'Street-level frames where the hologram and the real object overlap awkwardly.',
        atmosphere_and_mood:
          'Dazzling and fake, a city where you can never be sure what is really there.',
        rendering_and_quality:
          'Crisp illustration with convincing translucent glow and projector artifacts.',
        key_features: 'translucent holograms; scanline flicker; projector beams; grimy reality',
      },
      [
        'A giant holographic koi swims through a flooded street market, passing through the bodies of shoppers, until its projector sputters and it flickers into a pixelated shark for one horrifying second. No readable text or logo.',
        'A broke teenager wears a flickering holographic tuxedo to a wedding, the illusion glitching to reveal his pajamas every time he sneezes. No readable text or logo.',
        'A widow keeps a hologram of her husband reading at the kitchen table every morning, the projector failing so he stutters mid-gesture in the dawn light. No readable text or logo.',
      ],
    ),
    punk(
      'Dronepunk',
      'drone swarm punk',
      'dronepunk',
      {
        aesthetic:
          'Dronepunk: skies thick with delivery, police and hobby drones, swarms forming shapes, and people living under a constant buzz.',
        subject_treatment:
          "Keep the prompt's subject and setting; fill the air around it with drones of many sizes, some forming swarms or shapes.",
        color_and_tone:
          'Hazy sky grey and dusk orange with tiny blinking red, green and white drone lights.',
        lighting_and_shadow:
          'Drone spotlights pinning subjects from above, blinking navigation lights in the dusk.',
        texture_and_material:
          'Carbon rotor arms, plastic shells, tethered packages and strung-up drone nets.',
        camera_and_composition:
          'Low angles looking up into swarms, or top-down views from a drone above.',
        atmosphere_and_mood:
          'Buzzing and watched, freedom and surveillance sharing the same crowded sky.',
        rendering_and_quality:
          'Detailed illustration with many small readable drones and crisp lights.',
        key_features: 'drone swarms; spotlights from above; blinking nav lights; rotor haze',
      },
      [
        'Ten thousand delivery drones abandon their routes and swarm into the shape of a giant whale above the city at dusk, their lights blinking in unison while people on rooftops drop their groceries. No readable text or logo.',
        "An old farmer herds a flock of runaway lawnmower drones back into the barn with a shepherd's crook and a very tired dog. No readable text or logo.",
        "A single police drone hovers outside a child's window every night, and tonight the child has left it a small paper hat. No readable text or logo.",
      ],
    ),
    punk(
      'Fiberpunk',
      'optical fiber light punk',
      'fiberpunk',
      {
        aesthetic:
          'Fiberpunk: a city threaded with glowing optical fibers, where data travels as visible light through cables, clothing and even hair.',
        subject_treatment:
          "Keep the prompt's subject and setting; weave thin glowing fibers through it so light pulses along cables, fabric or strands.",
        color_and_tone:
          'Deep night navy and black with thread-thin cyan, magenta and gold light lines.',
        lighting_and_shadow:
          'Light emitted only from fiber tips and strands, faint glows on nearby faces.',
        texture_and_material:
          'Bundles of glass fiber, woven light fabrics, braided cables and dark matte surfaces.',
        camera_and_composition:
          'Close views of glowing strands and wide views of cities laced with light threads.',
        atmosphere_and_mood:
          'Delicate and electric, information made into something you could almost touch.',
        rendering_and_quality: 'Luminous illustration with fine thread-like light and deep darks.',
        key_features: 'glowing fibers; light pulses; woven light fabric; dark city',
      },
      [
        "A bridal procession walks through a blacked-out city, the bride's veil woven from ten thousand optical fibers carrying the messages of everyone who loves her, pulsing gold in the dark. No readable text or logo.",
        'A cable repair crew untangles a giant knot of glowing fibers that a very confused octopus has made in the harbor. No readable text or logo.',
        "An old woman braids glowing fiber into her granddaughter's hair by candlelight, each strand pulsing with a lullaby. No readable text or logo.",
      ],
    ),
    punk(
      'Arcadepunk',
      'arcade culture punk',
      'arcadepunk',
      {
        aesthetic:
          'Arcadepunk: a culture built inside neon arcades, where tokens are currency, high scores are honor and cabinets glow like shrines.',
        subject_treatment:
          "Keep the prompt's subject and setting; surround it with arcade cabinets, tokens, joysticks and screen glow.",
        color_and_tone:
          'Carpet purple, cabinet black and saturated screen colors with neon pink trim.',
        lighting_and_shadow:
          'Screen glow lighting faces from below and neon tubes along the ceiling.',
        texture_and_material:
          'Worn joysticks, scratched plexiglass, patterned carpet and metal tokens.',
        camera_and_composition:
          'Rows of cabinets receding into glow, players framed by screen light.',
        atmosphere_and_mood:
          'Obsessive and joyful, rivalries and legends measured in coins and points.',
        rendering_and_quality: 'Vivid illustration with glowing screens and tactile worn details.',
        key_features: 'cabinet rows; screen glow; tokens; neon trim',
      },
      [
        'Two rival gangs settle a street war with a single game on a glowing arcade cabinet in an abandoned mall, hundreds of members crowding silently behind the players under flickering neon. No readable text or logo.',
        'An elderly monk has held the high score on a dusty cabinet for forty years, and a nervous kid has finally come to challenge him with his last token. No readable text or logo.',
        'After closing, the arcade cabinets keep playing themselves in the dark, their screens lighting an empty carpet. No readable text or logo.',
      ],
    ),
    punk(
      'Pagerpunk',
      '90s telecom punk',
      'pagerpunk',
      {
        aesthetic:
          'Pagerpunk: a late-90s telecom underground of beepers, phone booths, flip phones and payphone codes whispered across the city.',
        subject_treatment:
          "Keep the prompt's subject and setting; place it among pagers, payphones, cords and blinking displays without readable text.",
        color_and_tone:
          'Translucent teal and purple plastics, payphone silver and sodium streetlight orange.',
        lighting_and_shadow:
          'Streetlights, backlit green pager screens and phone booth glow in the night.',
        texture_and_material:
          'Translucent plastic shells, coiled phone cords, scratched booth glass and belt clips.',
        camera_and_composition:
          'Night streets with phone booths as islands of light and close-ups of blinking devices.',
        atmosphere_and_mood:
          'Nostalgic and conspiratorial, secret messages beeping in pockets across the city.',
        rendering_and_quality:
          'Grainy late-90s illustration with glowing small screens and plastic sheen.',
        key_features: 'pagers; payphone booths; coiled cords; green backlit screens',
      },
      [
        'Every payphone in the city rings at the same moment at midnight, and a courier in a translucent purple jacket must decide which booth to answer as thousands of pagers beep in the dark apartments above. No readable text or logo.',
        'A spy grandmother receives urgent coded pages on a translucent beeper clipped to her apron while calmly frying dumplings. No readable text or logo.',
        'An abandoned phone booth in a snowfield glows green, its receiver swinging as if someone just hung up. No readable text or logo.',
      ],
    ),
    punk(
      'Satpunk',
      'satellite age punk',
      'satpunk',
      {
        aesthetic:
          'Satpunk: a world obsessed with satellites, of rooftop dishes, orbital junk, uplink shrines and people tracking lights across the sky.',
        subject_treatment:
          "Keep the prompt's subject and setting; point dishes and antennas toward the sky and show satellites or orbital debris overhead.",
        color_and_tone:
          'Night sky indigo with white satellite streaks, dish silver and warm window lights.',
        lighting_and_shadow: 'Starlight, satellite glints and warm light from rooftop shacks.',
        texture_and_material:
          'Weathered satellite dishes, cable bundles, solar panels and scrap antenna forests.',
        camera_and_composition:
          'Rooftops full of dishes pointing up, with long-exposure satellite trails in the sky.',
        atmosphere_and_mood:
          'Yearning and connected, people listening to the sky for voices from orbit.',
        rendering_and_quality:
          'Detailed night illustration with fine satellite trails and dish textures.',
        key_features: 'rooftop dish forests; satellite trails; orbital debris; uplink shacks',
      },
      [
        'A village of dish-covered rooftops turns every antenna toward a dying satellite falling in slow fire across the night sky, families holding candles on the roofs as its last signal plays. No readable text or logo.',
        'A goat balanced on a satellite dish in the mountains has somehow become the best signal repeater in the valley, and villagers queue to stand near it. No readable text or logo.',
        "An astronaut's abandoned capsule drifts over a sleeping desert town, a single light blinking in its window. No readable text or logo.",
      ],
    ),
    punk(
      'Wirepunk',
      'tangled cable city punk',
      'wirepunk',
      {
        aesthetic:
          'Wirepunk: dense cities where every surface is buried under tangled cables, junction boxes and illegal taps, wires as the true architecture.',
        subject_treatment:
          "Keep the prompt's subject and setting; bury the surroundings in tangled cables, taped splices and hanging wire bundles.",
        color_and_tone:
          'Black and grey cable masses with colored insulation accents and sodium orange light.',
        lighting_and_shadow:
          'Streetlamps filtering through wire canopies, sparks from bad splices.',
        texture_and_material:
          'Rubber insulation, electrical tape, junction boxes, rusted poles and dripping water.',
        camera_and_composition:
          'Upward views into cable canopies and narrow alleys roofed by wires.',
        atmosphere_and_mood: 'Chaotic and alive, a city held together by improvised connections.',
        rendering_and_quality:
          'Dense line illustration with readable cable structure and spark accents.',
        key_features: 'cable canopies; tape splices; junction boxes; sparks',
      },
      [
        'A wire-canopied market alley catches fire at one bad splice and sparks race along ten thousand cables overhead like a lit fuse, vendors ducking as a whole neighborhood briefly lights up in gold. No readable text or logo.',
        'An electrician monkey swings through the cable jungle of an old city, stealing insulation tape from human linemen. No readable text or logo.',
        'A child sleeps in a hammock woven from salvaged cables above a humming alley, fireflies of stray sparks around her. No readable text or logo.',
      ],
    ),
    punk(
      'Neurapunk',
      'neural implant punk',
      'neurapunk',
      {
        aesthetic:
          'Neurapunk: a culture of neural implants, shared dreams and memory markets, where glowing ports and cable crowns connect minds.',
        subject_treatment:
          "Keep the prompt's subject and setting; add neural ports, cable crowns or glowing thought-lines connecting heads and machines.",
        color_and_tone: 'Clinical white and slate with glowing violet and teal thought-lines.',
        lighting_and_shadow:
          'Soft medical light plus glowing implant ports and floating memory projections.',
        texture_and_material:
          'Smooth implant plates, braided neural cables, clinic fabrics and glass vials.',
        camera_and_composition:
          'Close portraits with ports visible and wide scenes of linked sleepers.',
        atmosphere_and_mood:
          'Intimate and unsettling, minds opened like doors that anyone could walk through.',
        rendering_and_quality:
          'Clean clinical illustration with soft glows and delicate cable detail.',
        key_features: 'neural ports; cable crowns; memory projections; linked sleepers',
      },
      [
        'In a candlelit memory market, a thief sells stolen childhood memories as glowing marbles pulled from the neural ports of sleeping aristocrats, buyers holding them up to their eyes to see the dreams inside. No readable text or logo.',
        'Two old friends link neural ports to share a single memory of a summer beach, and both burst out laughing at exactly the same moment. No readable text or logo.',
        'A sleeping girl is connected by a glowing cable crown to a dying tree, dreaming for it through the night. No readable text or logo.',
      ],
    ),
  ] satisfies Create[],
};

export default spec;
