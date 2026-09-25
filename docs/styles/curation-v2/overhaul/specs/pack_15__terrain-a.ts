import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Ocean, ice and terrain punks (part A): each punk is a culture shaped by one extreme landscape or sea.
const AVOID = [...STYLE_AVOID, 'real brand or company logo', 'generic stock landscape postcard'];

const punk = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'punk', 'terrain'],
  dna: dna(fields),
  avoid: AVOID,
  briefs,
});

const spec: Spec = {
  pack: 'pack_15',
  category: '5. Ocean, Ice & Terrain Punks',
  updates: {
    'SP15-097': {
      briefs: [
        'A pearlescent liquid-glass cathedral rises out of a flat turquoise sea at dusk, its spires branching like coral circuitry, while a congregation of synthetic manta rays glides through the open nave in slow formation. No readable text or logo.',
        'A very serious businessman in a pearl-sheen suit commutes to work riding a giant iridescent digital goldfish down a flooded neon avenue, reading his morning messages inside a floating bubble lens. No readable text or logo.',
        'A lone swimmer floats on her back in a still aqua lagoon at night while thousands of tiny glass-like jellyfish hover above the water, glowing coral pink and sea-glass green around her. No readable text or logo.',
      ],
    },
    'SP15-098': {
      briefs: [
        'A fortress of faceted thermal-shell panels grips the edge of a collapsing glacier as an armored icebreaker convoy forces its way through the pressure ridges below, one amber signal lamp burning on the command tower. No readable text or logo.',
        'Polar engineers in thick insulated suits hold a formal tea party inside a transparent ice-shell dome, pinkies raised, while a curious walrus presses its whiskered face against the glass outside. No readable text or logo.',
        'A single climber sleeps inside a small crystalline shelter wedged into a blue crevasse, the ice facets around her glowing faintly with the light of her last warm lamp. No readable text or logo.',
      ],
    },
  },
  creates: [
    punk(
      'Abyssalpunk',
      'deep-sea trench punk',
      'abyssalpunk',
      {
        aesthetic:
          'Abyssalpunk: cultures living in the deepest ocean trenches, with pressure-hulled towns, anglerfish-lure lamps and total crushing darkness around every scene.',
        subject_treatment:
          "Keep the prompt's subject and setting; sink it into the black abyss, lit only by small lures and pressure-hull portholes.",
        color_and_tone:
          'Near-total black with deep navy, pale bone white and small cold cyan or amber lure lights.',
        lighting_and_shadow:
          'Tiny isolated light sources swallowed by darkness within a few meters, sharp falloff.',
        texture_and_material:
          'Thick riveted pressure hulls, porthole glass, marine snow, pale translucent deep-sea creatures.',
        camera_and_composition:
          'Small lit islands of detail inside vast darkness, huge creatures half seen at the edges.',
        atmosphere_and_mood:
          'Crushing, silent and awe-struck, the terror and wonder of the deepest place on Earth.',
        rendering_and_quality:
          'Low-key illustration with precise small light pools and drifting marine snow particles.',
        key_features: 'pressure-hull towns; lure lamps; marine snow; darkness swallowing light',
      },
      [
        'A deep-trench village of riveted pressure spheres hangs from a cable over the abyss, and its only streetlight is the glowing lure of a sleeping anglerfish the size of a cathedral curled around the town. No readable text or logo.',
        'A trench postman in a bulky brass diving suit knocks politely on the porthole of a pressure house while an enormous translucent squid waits behind him holding three more parcels in its tentacles. No readable text or logo.',
        'Marine snow drifts past a single lit porthole in total darkness, where an old diver sits reading beside a tiny cold lamp, unaware of the huge pale eye opening just outside the glass. No readable text or logo.',
      ],
    ),
    punk(
      'Reefpunk',
      'coral-grown reef architecture punk',
      'reefpunk',
      {
        aesthetic:
          'Reefpunk: whole towns grown from living coral in warm shallow seas, with branching coral towers, sponge furniture and fish swimming through every open window.',
        subject_treatment:
          "Keep the prompt's subject and setting; grow its buildings, furniture and props out of living coral, sponge and shell in clear shallow water.",
        color_and_tone:
          'Vivid coral orange, magenta, lime and violet over sunlit turquoise and white sand.',
        lighting_and_shadow:
          'Bright caustic sunlight rippling across coral surfaces through shallow clear water.',
        texture_and_material:
          'Branching and brain coral, porous sponge, sea fans, shell and rippled sand.',
        camera_and_composition:
          'Busy underwater streets seen at eye level with schools of fish crossing the frame.',
        atmosphere_and_mood:
          'Lively, warm and colorful, a city that is also a living reef ecosystem.',
        rendering_and_quality:
          'Saturated underwater illustration with crisp caustic light and dense organic detail.',
        key_features: 'grown coral towers; caustic light; fish in windows; sponge furniture',
      },
      [
        'A coral opera house slowly grown over three hundred years blooms open its petal roof at noon, and the whole reef city swims up in their finest shell jewelry to hear a humpback whale sing the premiere. No readable text or logo.',
        'A reef family eats breakfast at a brain-coral table while a clownfish repeatedly swims through the kitchen window, steals the toast and escapes past the grandmother waving her sponge slipper. No readable text or logo.',
        'After a heatwave, a lone coral gardener floats through a bleached white district of the reef city, gently painting living color back onto one small branch with her fingertips. No readable text or logo.',
      ],
    ),
    punk(
      'Submarinepunk',
      'submarine crew culture punk',
      'submarinepunk',
      {
        aesthetic:
          'Submarinepunk: cramped riveted submarine life, with brass periscopes, bunk-lined corridors, red battle lamps and crews that never see the sun.',
        subject_treatment:
          "Keep the prompt's subject and setting; move it inside tight riveted submarine compartments full of pipes, valves and gauges.",
        color_and_tone:
          'Olive drab, brass and oiled steel with red battle lighting and cold green sonar glow.',
        lighting_and_shadow:
          'Red emergency lamps and green sonar screens cutting through cramped shadowy spaces.',
        texture_and_material:
          'Riveted steel, sweating pipes, brass valves, worn canvas bunks and condensation.',
        camera_and_composition:
          'Claustrophobic interiors with pipes crowding the edges and crew packed close together.',
        atmosphere_and_mood:
          'Tense, sweaty and brotherly, silent running deep beneath an enemy fleet.',
        rendering_and_quality:
          'Gritty detailed illustration with dense mechanical clutter and strong colored light.',
        key_features: 'riveted compartments; red battle lamps; sonar glow; brass valves',
      },
      [
        'Under red battle lamps a submarine crew holds its breath in total silence as the shadow of an enormous iron warship passes overhead, every eye fixed on the sweating captain gripping the periscope handles. No readable text or logo.',
        'The submarine cook tries to flip pancakes in a galley that tilts forty degrees during an emergency dive, batter, pans and one terrified sailor sliding across the floor together. No readable text or logo.',
        'A young sonar operator alone on night watch closes her eyes and listens to whale song through her headphones, the green screen glowing softly on her face in the dark compartment. No readable text or logo.',
      ],
    ),
    punk(
      'Kelppunk',
      'kelp forest culture punk',
      'kelppunk',
      {
        aesthetic:
          'Kelppunk: towering golden kelp forests turned into vertical cities, with rope-and-float dwellings, otter allies and slow swaying streets of seaweed.',
        subject_treatment:
          "Keep the prompt's subject and setting; tie it into swaying kelp stalks, floats and rope walkways in a green-gold underwater forest.",
        color_and_tone:
          'Golden brown, olive and bottle green kelp in cool blue-green water with sun shafts.',
        lighting_and_shadow:
          'Sun shafts slanting down through the kelp canopy into cool green gloom below.',
        texture_and_material:
          'Glossy kelp blades, gas-filled floats, woven kelp rope, driftwood and sea urchins.',
        camera_and_composition:
          'Tall vertical frames with kelp stalks rising like columns and figures climbing them.',
        atmosphere_and_mood:
          'Swaying, calm and cathedral-like, a forest that breathes with the tide.',
        rendering_and_quality:
          'Luminous underwater illustration with layered swaying stalks and soft light shafts.',
        key_features: 'kelp cathedral stalks; float dwellings; sun shafts; otter allies',
      },
      [
        'An army of kelp riders mounted on giant sea otters charges down through the golden forest canopy toward an invading swarm of purple urchins, sun shafts flashing off their shell-plate armor. No readable text or logo.',
        'A sea otter union leader holds a very serious strike meeting on a raft of floating kelp, dozens of otters holding their paws up while one keeps cracking a clam on its belly. No readable text or logo.',
        'A child sleeps wrapped in a hammock of woven kelp high in the forest canopy, rocking gently with the tide as a harbor seal drifts past her and looks in. No readable text or logo.',
      ],
    ),
    punk(
      'Tundrapunk',
      'arctic tundra nomad punk',
      'tundrapunk',
      {
        aesthetic:
          'Tundrapunk: nomadic cultures of the endless frozen tundra, with reindeer-drawn sled towns, fur-and-felt tents, bone tools and horizons of flat white.',
        subject_treatment:
          "Keep the prompt's subject and setting; set it on a vast flat tundra with sled caravans, felt tents and heavy fur clothing.",
        color_and_tone:
          'Snow white, pale grey sky and low pink sun with deep red and indigo felt accents.',
        lighting_and_shadow:
          'Low polar sun casting long blue shadows across snow for most of the day.',
        texture_and_material:
          'Thick fur, felted wool, carved bone, sled runners, packed snow and frost.',
        camera_and_composition:
          'Wide flat horizons with small caravans crossing, long lines of shadow and breath.',
        atmosphere_and_mood: 'Enduring, quiet and vast, people who move with the herds forever.',
        rendering_and_quality:
          'Crisp cold illustration with fine fur texture and long low-sun shadows.',
        key_features: 'reindeer sled towns; felt tents; long polar shadows; fur and bone',
      },
      [
        'A whole town on sleds, felt tents, forges and a small temple strapped to runners, migrates across the frozen tundra behind ten thousand reindeer as a pink polar sun hangs low for the third day. No readable text or logo.',
        'A tundra grandmother wins the annual reindeer race while knitting a scarf, her sled overtaking three young champions who stare in disbelief through their frosted eyebrows. No readable text or logo.',
        'In the long blue twilight, a lone herder sits in the snow among his sleeping reindeer and shares warm tea with a curious arctic fox. No readable text or logo.',
      ],
    ),
    punk(
      'Aurorapunk',
      'aurora-powered polar punk',
      'aurorapunk',
      {
        aesthetic:
          'Aurorapunk: a polar culture that harvests the northern lights, with antenna towers, glowing aurora batteries and sky-fishing nets strung across the night.',
        subject_treatment:
          "Keep the prompt's subject and setting; place it under a vivid aurora being caught, stored or channeled by polar machinery.",
        color_and_tone:
          'Aurora green, violet and magenta ribbons over deep night blue and cold snow.',
        lighting_and_shadow:
          'Rippling aurora light washing colored glows across snow, faces and metal.',
        texture_and_material:
          'Frosted antenna masts, glass aurora jars, copper coils and powdery snow.',
        camera_and_composition:
          'Low horizons with huge skies of moving aurora and small towers reaching up.',
        atmosphere_and_mood: 'Electric and reverent, a people who drink light from the sky.',
        rendering_and_quality:
          'Luminous night illustration with flowing aurora ribbons and crisp frost detail.',
        key_features: 'harvested aurora; glowing light jars; antenna towers; sky nets',
      },
      [
        'Aurora fishers cast enormous copper nets into the night sky from the tops of frozen antenna towers and haul down a thrashing ribbon of green and violet light that floods the village below with color. No readable text or logo.',
        'A clumsy apprentice drops a jar of harvested aurora in the snow and the entire village turns bright magenta for a week, including the very unamused chieftain and his dogs. No readable text or logo.',
        'An old woman in a frozen cabin opens a small glass jar and lets a thin thread of saved aurora curl around her sleeping husband like a blanket of light. No readable text or logo.',
      ],
    ),
    punk(
      'Fjordpunk',
      'fjord cliff village punk',
      'fjordpunk',
      {
        aesthetic:
          'Fjordpunk: villages carved into the sheer walls of deep fjords, with cliff-hung houses, rope lifts, waterfall mills and longboats far below.',
        subject_treatment:
          "Keep the prompt's subject and setting; hang it on towering fjord cliffs above dark water, with ladders, lifts and waterfalls.",
        color_and_tone:
          'Slate grey cliffs, deep green water and mossy greens with tarred black wood and red roofs.',
        lighting_and_shadow:
          'Moody overcast light with sudden sun breaking through mist onto the cliffs.',
        texture_and_material: 'Wet stone, tarred timber, turf roofs, rope, mist and falling water.',
        camera_and_composition:
          'Extreme vertical scale with tiny houses high on cliff walls over deep water.',
        atmosphere_and_mood: 'Dramatic, damp and hardy, life clinging to walls of stone.',
        rendering_and_quality: 'Atmospheric illustration with deep vertical scale and misty depth.',
        key_features: 'cliff-hung houses; rope lifts; waterfall mills; mist over dark water',
      },
      [
        'A storm of longships sails into a narrow fjord while defenders cut loose a waterfall dam carved into the cliff, a white wall of water thundering down toward the invaders in the mist. No readable text or logo.',
        'A village baker delivers bread by rope lift to houses glued to a thousand-meter cliff, and a goat rides along in the basket every morning without paying. No readable text or logo.',
        "On a tiny turf-roofed ledge high above a misty fjord, an old fisherman lowers a lantern on a rope to guide his daughter's boat home at dusk. No readable text or logo.",
      ],
    ),
    punk(
      'Archipelagopunk',
      'island-hopping archipelago punk',
      'archipelagopunk',
      {
        aesthetic:
          'Archipelagopunk: a scattered nation of tiny islands linked by outrigger ferries, rope bridges, floating markets and shared canoe roads across turquoise water.',
        subject_treatment:
          "Keep the prompt's subject and setting; spread it across small islands linked by boats, bridges and floating platforms.",
        color_and_tone:
          'Turquoise shallows, deep blue channels, white sand and palm greens with woven tan and red.',
        lighting_and_shadow:
          'Bright tropical sun with strong reflections and cloud shadows moving across the water.',
        texture_and_material:
          'Woven pandanus sails, lashed timber, rope bridges, coconut fibre and wet sand.',
        camera_and_composition:
          'High views over chains of islets and busy water traffic between them.',
        atmosphere_and_mood:
          'Open, sociable and seafaring, a country made of water and small land.',
        rendering_and_quality:
          'Bright crisp illustration with clear water reflections and woven detail.',
        key_features: 'island chains; outrigger ferries; rope bridges; floating markets',
      },
      [
        'Hundreds of outrigger canoes lash themselves together into one giant floating bridge across a storm-dark channel so a whole island festival can walk to the next island before the typhoon arrives. No readable text or logo.',
        'The smallest island of the archipelago, just one palm tree and a hut, holds a proud independence parade for its entire population of one man and his pig. No readable text or logo.',
        'Two lovers on neighboring islets send lanterns to each other along a single rope stretched across the dark water, glowing slowly over the waves at night. No readable text or logo.',
      ],
    ),
    punk(
      'Stormpunk',
      'storm-chasing weather punk',
      'stormpunk',
      {
        aesthetic:
          'Stormpunk: a culture that lives inside permanent storms, with lightning rods, wind-proof bunkers, storm-sail ships and crews who ride the weather.',
        subject_treatment:
          "Keep the prompt's subject and setting; engulf it in violent storm weather, with lightning, driving rain and storm-proof machinery.",
        color_and_tone:
          'Bruised purple and slate storm clouds, electric white lightning and rain-soaked dark metals.',
        lighting_and_shadow:
          'Sudden lightning flashes freezing scenes in stark white against deep storm dark.',
        texture_and_material:
          'Wet oilskins, lightning rods, heavy chains, storm shutters, sheets of rain.',
        camera_and_composition:
          'Dramatic low angles with tilted horizons and huge cloud masses overhead.',
        atmosphere_and_mood: 'Wild and exhilarating, people who laugh in the face of the storm.',
        rendering_and_quality:
          'High-contrast dramatic illustration with streaking rain and bright lightning.',
        key_features: 'lightning rods; storm-sail ships; driving rain; lightning flashes',
      },
      [
        'A storm-sail warship rides the rim of a mile-wide hurricane like a surfer, its crew chained to the deck and laughing as a lightning bolt strikes the copper mast and lights every sailor in white. No readable text or logo.',
        'Storm chasers hold a picnic on a hill in the eye of a hurricane, calmly pouring tea while a cow, a bicycle and a garden shed spin slowly around them in the wall of wind. No readable text or logo.',
        "Between thunderclaps, a lighthouse keeper's child sits at a rain-streaked window counting seconds, her face lit white for an instant by each lightning flash. No readable text or logo.",
      ],
    ),
  ] satisfies Create[],
};

export default spec;
