import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Bio, myco and body punks (part A): each new punk treats one living system as technology.
// No gore: bodies and organisms are shown as crafted, strange and beautiful.
const AVOID = [...STYLE_AVOID, 'gore', 'graphic wounds', 'real brand or company logo'];

const punk = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  briefs: [string, string, string],
): Create => ({ name, domain, tags: [tag, 'punk', 'bio'], dna: dna(fields), avoid: AVOID, briefs });

const spec: Spec = {
  pack: 'pack_15',
  category: '4. Bio, Myco & Body Punks',
  updates: {
    'SP15-094': {
      briefs: [
        'A bio-engineered cathedral grown from coral-like bone breathes slowly over a flooded city, its stained windows made of living membranes that change color with the prayers of the congregation inside. No readable text or logo.',
        'A lab technician tries to return a genetically engineered pet that has grown into a very affectionate house-sized axolotl, the shop owner hiding behind the counter. No readable text or logo.',
        'Inside a dim greenhouse lab, a scientist whispers goodnight to rows of glowing seed pods that pulse softly in reply. No readable text or logo.',
      ],
    },
    'SP15-095': {
      briefs: [
        'A mycelial city grows overnight in the ruins of a war zone, pale fungal towers lifting the rubble gently into the sky while survivors wake up in beds made of soft mushroom caps. No readable text or logo.',
        'A mushroom forager argues with a talking puffball that refuses to be picked and keeps sneezing spores in his face. No readable text or logo.',
        'Deep underground, a lone miner follows glowing fungal threads that spell out a path toward a buried door. No readable text or logo.',
      ],
    },
    'SP15-096': {
      briefs: [
        'A marathon of augmented runners crosses a mountain pass, each body modified differently, one with gecko hands climbing the cliff shortcut, one with gills swimming the river, all racing toward a finish line at dawn. No readable text or logo.',
        'A retired dancer has replaced her knees with elegant brass hinges and now performs pirouettes that last for minutes, to the dismay of her dance teacher. No readable text or logo.',
        'An old sailor with a hand-carved whalebone arm teaches his grandson to tie knots by lantern light. No readable text or logo.',
      ],
    },
  },
  creates: [
    punk(
      'Slimepunk',
      'slime mold network punk',
      'slimepunk',
      {
        aesthetic:
          'Slimepunk: slime molds as living computers and urban planners, with yellow veined networks spreading across maps, streets and machines.',
        subject_treatment:
          "Keep the prompt's subject and setting; let branching yellow slime-mold networks spread across its surfaces, connecting points like living maps.",
        color_and_tone:
          'Vivid slime yellow and orange veins against dark soil, grey concrete and pale petri glass.',
        lighting_and_shadow:
          'Soft diffuse light with a glossy wet sheen on every slime vein and pulse.',
        texture_and_material:
          'Wet branching veins, pulsating fans, petri glass, oat flakes and damp stone.',
        camera_and_composition:
          'Top-down map-like views of networks and close macro views of pulsing fans.',
        atmosphere_and_mood:
          'Uncanny and clever, a brainless organism that plans better than any engineer.',
        rendering_and_quality:
          'Glossy organic illustration with intricate branching network detail.',
        key_features: 'yellow slime networks; map-like branching; wet sheen; pulsing fans',
      },
      [
        'City engineers gather around a giant table where a slime mold has grown the perfect subway map between piles of oats, the yellow network glowing under their lamps while the mayor argues with it. No readable text or logo.',
        'A slime mold escapes its petri dish overnight and routes itself to the office coffee machine, taking the fastest possible path across every desk. No readable text or logo.',
        'In an abandoned library, yellow slime veins have spread across the old maps, quietly redrawing the roads of the world. No readable text or logo.',
      ],
    ),
    punk(
      'Chitinpunk',
      'insect shell technology punk',
      'chitinpunk',
      {
        aesthetic:
          'Chitinpunk: architecture and armor grown like insect shells, with iridescent plates, segmented joints and beetle-wing canopies.',
        subject_treatment:
          "Keep the prompt's subject and setting; rebuild its structures and gear from segmented chitin plates with iridescent sheen.",
        color_and_tone: 'Iridescent beetle greens, bronze and violet sheen over deep black shell.',
        lighting_and_shadow:
          'Raking light revealing iridescent shifts and glossy highlights on curved plates.',
        texture_and_material:
          'Glossy chitin plates, segmented joints, translucent wing membranes and fine hairs.',
        camera_and_composition:
          'Close views of plated surfaces and wide views of shell-built structures.',
        atmosphere_and_mood:
          'Alien and beautiful, a world that borrowed its engineering from beetles.',
        rendering_and_quality: 'Glossy detailed illustration with rich iridescent color shifts.',
        key_features: 'iridescent plates; segmented joints; wing canopies; beetle sheen',
      },
      [
        'A city of towers shaped like giant beetle shells opens its iridescent wing-roofs at sunrise, thousands of citizens flying out on gliders made of translucent insect wings. No readable text or logo.',
        'A knight in shining beetle armor is extremely embarrassed when his wing cases pop open in the middle of a formal banquet. No readable text or logo.',
        'An empty shell of an enormous cicada clings to an old bell tower after the storm, still shimmering. No readable text or logo.',
      ],
    ),
    punk(
      'Symbiontpunk',
      'symbiotic partnership punk',
      'symbiont',
      {
        aesthetic:
          'Symbiontpunk: humans living in partnership with other organisms, with moss coats, fish-cleaned wounds, bird-helpers and plant companions woven into daily life.',
        subject_treatment:
          "Keep the prompt's subject and setting; pair it with a living companion organism that helps it in a visible, symbiotic way.",
        color_and_tone:
          'Soft greens and earthy browns with bright accents from companion creatures.',
        lighting_and_shadow: 'Gentle natural daylight and small bioluminescent glows at night.',
        texture_and_material:
          'Moss cloaks, living vines, feathers, scales and woven natural fibers.',
        camera_and_composition:
          'Close pairings of person and companion organism, with their bond central.',
        atmosphere_and_mood:
          'Gentle and strange, lives completely braided together with other species.',
        rendering_and_quality:
          'Delicate naturalist illustration with careful creature and plant detail.',
        key_features: 'companion organisms; moss cloaks; living partnership; gentle glow',
      },
      [
        'A night watchman walks the city walls wearing a cloak of glowing moss while a huge moth companion lights the way ahead, both pausing to bow to an owl that shares the patrol. No readable text or logo.',
        'A barber whose assistant is a small octopus that trims beards with remarkable precision and an attitude. No readable text or logo.',
        'An old gardener sleeps under a tree that bends its branches over him every time it rains. No readable text or logo.',
      ],
    ),
    punk(
      'Botanipunk',
      'plant technology punk',
      'botanipunk',
      {
        aesthetic:
          'Botanipunk: technology grown from plants, with gourd lanterns, vine cables, leaf solar sails, carnivorous-plant security and seed-pod vehicles.',
        subject_treatment:
          "Keep the prompt's subject and setting; replace its machines and tools with grown plant equivalents.",
        color_and_tone: 'Lush leaf greens, gourd oranges and flower pinks with glowing sap gold.',
        lighting_and_shadow:
          'Sunlight through translucent leaves and glowing gourd lanterns at dusk.',
        texture_and_material: 'Woody vines, gourds, leaves, seed pods, sap and bark.',
        camera_and_composition: 'Botanical scenes where every object turns out to be a plant.',
        atmosphere_and_mood:
          'Lush and playful, a civilization that grows its tools instead of building them.',
        rendering_and_quality:
          'Botanical illustration style with precise, believable plant anatomy.',
        key_features: 'grown tools; vine cables; gourd lanterns; seed-pod vehicles',
      },
      [
        'Bandits armed with giant pitcher plants ambush a caravan of seed-pod carriages on a jungle road, vine cables snapping and glowing gourd lanterns swinging in the struggle. No readable text or logo.',
        'A florist sells a bouquet that starts biting the customer, who looks mildly flattered by the attention. No readable text or logo.',
        'A single gourd lantern grows on a vine in an empty garden, glowing brighter as night falls. No readable text or logo.',
      ],
    ),
    punk(
      'Mothpunk',
      'moth and nocturnal punk',
      'mothpunk',
      {
        aesthetic:
          'Mothpunk: a nocturnal culture drawn to light, with dusty moth-wing cloaks, lamp cults, night markets and delicate feathered antennae.',
        subject_treatment:
          "Keep the prompt's subject and setting; make it nocturnal and moth-like, drawn to lamps, with powdery wings and soft fur.",
        color_and_tone: 'Dusty greys, browns and pale lunar greens with warm lamp gold.',
        lighting_and_shadow: 'Single lamps in darkness with moths swirling in halos around them.',
        texture_and_material:
          'Powdery wing scales, soft fur, feathered antennae and paper lanterns.',
        camera_and_composition: 'Figures circling light sources in otherwise dark scenes.',
        atmosphere_and_mood: 'Soft and obsessive, beauty that cannot stay away from the flame.',
        rendering_and_quality:
          'Delicate low-key illustration with powdery textures and glowing lamps.',
        key_features: 'moth-wing cloaks; lamp halos; feathered antennae; nocturnal glow',
      },
      [
        'A cult of moth-winged pilgrims circles a lighthouse in endless spirals every night, their dusty cloaks catching the beam while the terrified keeper tries to turn off the lamp. No readable text or logo.',
        'A moth-winged waiter keeps getting distracted by candles while serving dinner at a very fancy restaurant. No readable text or logo.',
        'A great pale moth rests on the window of a sleeping child, its wings covering the whole glass. No readable text or logo.',
      ],
    ),
    punk(
      'Termitepunk',
      'termite mound architecture punk',
      'termitepunk',
      {
        aesthetic:
          'Termitepunk: cities built like termite mounds, with towering earthen spires, natural ventilation shafts, tunnels and colony-scale cooperation.',
        subject_treatment:
          "Keep the prompt's subject and setting; house it in towering earthen mounds full of tunnels and ventilation chimneys.",
        color_and_tone:
          'Red earth, ochre clay and dusty savanna gold with cool shadowed tunnel browns.',
        lighting_and_shadow:
          'Hot savanna sun on mound exteriors and cool shafts of light inside tunnels.',
        texture_and_material: 'Packed red earth, tunnel walls, ventilation holes and dry grass.',
        camera_and_composition: 'Towering mound skylines and cutaway views of tunnel networks.',
        atmosphere_and_mood:
          'Industrious and ancient, a society as patient and cooperative as a colony.',
        rendering_and_quality:
          'Earthy detailed illustration with clearly readable tunnel architecture.',
        key_features: 'earthen spires; ventilation shafts; tunnel networks; red earth',
      },
      [
        'A savanna city of towering red-earth spires breathes cool air through its chimneys at noon, thousands of citizens moving through its tunnels while giraffes graze between the mounds. No readable text or logo.',
        'An architect tries to present blueprints to the city council, which is a very large and very serious termite queen. No readable text or logo.',
        'At dusk a lone mound glows from inside, every ventilation hole a tiny window of candlelight. No readable text or logo.',
      ],
    ),
    punk(
      'Lichenpunk',
      'lichen and slow growth punk',
      'lichenpunk',
      {
        aesthetic:
          'Lichenpunk: a slow, patient culture living with lichen, where time is measured in crusts on stone and buildings are dated by their colors.',
        subject_treatment:
          "Keep the prompt's subject and setting; crust it with colorful lichen that shows how long everything has been there.",
        color_and_tone:
          'Orange, sulfur yellow and grey-green lichen rosettes over cold stone greys.',
        lighting_and_shadow:
          'Soft overcast northern light that brings out every crust and rosette.',
        texture_and_material: 'Lichen crusts, old stone, weathered bone and wind-worn wood.',
        camera_and_composition:
          'Close views of lichen patterns and wide views of ancient crusted places.',
        atmosphere_and_mood: 'Patient and timeless, a world where nothing is ever in a hurry.',
        rendering_and_quality: 'Finely textured illustration with rich lichen color patterns.',
        key_features: 'lichen crusts; ancient stone; slow time; colorful rosettes',
      },
      [
        'Pilgrims travel to a stone giant that has stood still for a thousand years, reading the history of the world in the lichen maps grown across its face. No readable text or logo.',
        'A very old tortoise has so much lichen on its shell that villagers use it as a moving garden. No readable text or logo.',
        'An abandoned stone chair on a cliff, crusted orange and grey, still facing the sea it once watched. No readable text or logo.',
      ],
    ),
  ] satisfies Create[],
};

export default spec;
