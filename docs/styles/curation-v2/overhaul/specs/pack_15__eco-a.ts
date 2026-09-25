import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Eco, repair and climate punks (part A): each new punk answers one climate problem with its own
// visual technology. Briefs follow the creativity standard with rotating tones.
const AVOID = [...STYLE_AVOID, 'real brand or company logo', 'generic glass utopia'];

const punk = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'punk', 'climate'],
  dna: dna(fields),
  avoid: AVOID,
  briefs,
});

const spec: Spec = {
  pack: 'pack_15',
  category: '3. Eco, Repair & Climate Punks',
  updates: {
    'SP15-087': {
      briefs: [
        'An old coal power station has been turned into a vertical orchard, its cooling towers overflowing with fruit trees and waterfalls while retired miners harvest apples from the gantries at sunrise. No readable text or logo.',
        'A city council meeting is held in a treehouse, and the mayor is a very serious goat wearing a solar-panel hat. No readable text or logo.',
        'At night the solar gardens on every rooftop glow softly with stored sunlight, and a girl reads by the light of a single glowing leaf. No readable text or logo.',
      ],
    },
    'SP15-088': {
      briefs: [
        'A colossal war machine from a forgotten conflict has been repaired into a walking village, its gun turrets now water tanks and its armor patched with quilts, gardens and laundry lines. No readable text or logo.',
        'A repair café full of neighbors fixing a very nervous robot vacuum with thread, glue and a lot of encouragement. No readable text or logo.',
        'An old woman sews a golden patch over a crack in the sky above her village, the thread glinting in the dusk. No readable text or logo.',
      ],
    },
    'SP15-091': {
      briefs: [
        'A nomad city of windcatcher towers crawls across the dunes on giant sand-sleds, its gardens hidden in cool shaded courtyards while a sandstorm wall approaches on the horizon. No readable text or logo.',
        'A camel wearing mirrored sunshades and a water-condensing hat is the most respected elder in the desert town. No readable text or logo.',
        'In a silent salt desert, a single fog-catching net fills a glass bottle drop by drop at dawn. No readable text or logo.',
      ],
    },
  },
  creates: [
    punk(
      'Floodpunk',
      'sea-level-rise stilt city punk',
      'floodpunk',
      {
        aesthetic:
          'Floodpunk: drowned cities rebuilt above the waterline on stilts, rafts and rooftop bridges, with boats as streets and old towers as islands.',
        subject_treatment:
          "Keep the prompt's subject and setting; raise water around it and rebuild life on stilts, rafts and rope bridges above the flood.",
        color_and_tone:
          'Murky green-blue water, weathered wood and rust with bright laundry and boat colors.',
        lighting_and_shadow: 'Hazy humid daylight and rippling water reflections on everything.',
        texture_and_material:
          'Stilts, lashed timber, patched tarps, sagging rope bridges and algae-stained concrete below.',
        camera_and_composition:
          'Waterline views with drowned streets below and life stacked above.',
        atmosphere_and_mood:
          'Resilient and melancholic, a city that refused to leave when the sea came in.',
        rendering_and_quality:
          'Detailed illustration with convincing water reflections and layered structures.',
        key_features: 'stilts; drowned streets; rooftop bridges; boats as streets',
      },
      [
        'A drowned cathedral rises from the sea with only its spires above water, turned into a floating market where boats dock at the rose window and children dive for coins in the flooded nave. No readable text or logo.',
        'A postman on a paddleboard delivers letters to fifth-floor windows of a flooded street, balancing a parcel on his head while an unimpressed pelican follows him and inspects every envelope. No readable text or logo.',
        'Under the clear water of a flooded city, a traffic light still blinks at empty streets full of fish. No readable text or logo.',
      ],
    ),
    punk(
      'Hopepunk',
      'radical kindness punk',
      'hopepunk',
      {
        aesthetic:
          'Hopepunk: defiant tenderness in hard times, with shared kitchens, mended flags, candle vigils and communities holding each other up in ruins.',
        subject_treatment:
          "Keep the prompt's subject and setting; show people caring for each other and something small and warm surviving in a hard place.",
        color_and_tone: 'Soft warm golds and roses against grey ruins and stormy blues.',
        lighting_and_shadow:
          'Small pools of candle, lantern and firelight held against cold, dark surroundings.',
        texture_and_material:
          'Mended fabrics, chipped mugs, patched tents and hand-painted banners without words.',
        camera_and_composition: 'Groups huddled around small light sources in wide dark spaces.',
        atmosphere_and_mood:
          'Tender and stubborn, kindness as an act of rebellion when everything is falling apart.',
        rendering_and_quality:
          'Warm painterly illustration with soft light and careful human gestures.',
        key_features: 'shared light; mended things; huddled communities; warm against cold',
      },
      [
        'In the ruins of a bombed opera house, an entire city gathers under candlelight to hear one old woman sing, soldiers from both sides quietly sitting together in the broken seats. No readable text or logo.',
        'A hundred strangers form a human chain to pass a single birthday cake over a flooded street to a girl on a balcony. No readable text or logo.',
        'A small lantern left burning in the window of an abandoned house still guides travelers across the snowy pass. No readable text or logo.',
      ],
    ),
    punk(
      'Seedpunk',
      'seed vault agriculture punk',
      'seedpunk',
      {
        aesthetic:
          'Seedpunk: guardians of seeds and soil, with seed vaults, pollination rigs, crop libraries and farmers as heroes of the future.',
        subject_treatment:
          "Keep the prompt's subject and setting; fill it with seeds, drawers of samples, sprouting trays and hand-built farming tools.",
        color_and_tone: 'Earthy browns and seed golds with fresh sprout green and vault steel.',
        lighting_and_shadow: 'Warm lamps over seed drawers and sunlight falling on fields.',
        texture_and_material:
          'Seed packets without text, wooden drawers, clay pots, soil and jute sacks.',
        camera_and_composition:
          'Rows of seed drawers and sprouting trays, or tiny figures in giant fields.',
        atmosphere_and_mood: 'Patient and precious, the future of the world held in tiny grains.',
        rendering_and_quality:
          'Detailed botanical illustration with rich natural textures in every seed and leaf.',
        key_features: 'seed vaults; sprouting trays; drawers of samples; farmer guardians',
      },
      [
        'Armed seed-keepers escort a single glowing seed across a wasteland in a lantern-lit caravan, while the barren hills behind them start turning green wherever it passes. No readable text or logo.',
        'A seed library where a grumpy squirrel librarian in tiny spectacles checks out acorns to schoolchildren, stamping each seed packet with its paw and glaring at a boy who returned his late. No readable text or logo.',
        'Deep in a mountain vault, a single sprout has cracked through a sealed drawer and is growing toward a crack of daylight. No readable text or logo.',
      ],
    ),
    punk(
      'Windpunk',
      'wind energy punk',
      'windpunk',
      {
        aesthetic:
          'Windpunk: a world powered by wind, with forests of turbines, kite generators, whistling towers and cities that move with the weather.',
        subject_treatment:
          "Keep the prompt's subject and setting; add turbines, kites, sails and wind chimes, with everything leaning into the wind.",
        color_and_tone: 'Sky blues and cloud whites with bright turbine whites and kite colors.',
        lighting_and_shadow:
          'Fast-moving cloud shadows racing across the land in bright, gusty daylight.',
        texture_and_material:
          'Turbine blades, kite fabric, tensioned cables, wind chimes and grass bent flat.',
        camera_and_composition:
          'Wide windy landscapes with turbines on ridges and figures braced against gusts.',
        atmosphere_and_mood: 'Restless and joyful, a civilization that dances with every storm.',
        rendering_and_quality: 'Airy dynamic illustration with strong sense of wind motion.',
        key_features: 'turbine forests; kite generators; leaning figures; cloud shadows',
      },
      [
        'A storm-harvesting fleet of giant kite generators flies over a thundering sea, each kite towing a boat full of cheering engineers as lightning feeds the glowing cables. No readable text or logo.',
        'An old man straps himself to the sail of his windmill every stormy night for the ride, spinning around laughing in his pajamas while his wife brings tea to the doorway and waits. No readable text or logo.',
        'On a silent windless day, a whole turbine forest stands still and the town holds its breath waiting. No readable text or logo.',
      ],
    ),
    punk(
      'Bamboopunk',
      'bamboo construction punk',
      'bamboopunk',
      {
        aesthetic:
          'Bamboopunk: a green high-tech world built from bamboo, lashed towers, flexible bridges, woven domes and fast-growing groves.',
        subject_treatment:
          "Keep the prompt's subject and setting; build its structures and tools from bamboo poles, lashings and woven panels.",
        color_and_tone: 'Fresh bamboo greens and golden cured cane with misty jade backgrounds.',
        lighting_and_shadow: 'Soft light filtered through bamboo leaves and woven screens.',
        texture_and_material: 'Bamboo poles, rattan lashings, woven panels and hanging lanterns.',
        camera_and_composition:
          'Tall vertical bamboo towers, arching flexible bridges and deep misty forest groves.',
        atmosphere_and_mood:
          'Graceful and resilient, structures that bend in storms instead of breaking.',
        rendering_and_quality:
          'Elegant detailed illustration with precise lashings and soft greens.',
        key_features: 'lashed bamboo towers; woven domes; flexible bridges; misty groves',
      },
      [
        'A bamboo skyscraper bends almost to the ground in a typhoon and springs back upright with every resident still waving from the balconies. No readable text or logo.',
        'A panda family has moved into the new bamboo apartment block and is eating the walls. No readable text or logo.',
        'A lone bamboo flute hangs from a branch in a misty mountain grove and plays itself when the wind passes, a young monk sitting beneath it pretending he is not listening. No readable text or logo.',
      ],
    ),
    punk(
      'Rewildpunk',
      'rewilding punk',
      'rewildpunk',
      {
        aesthetic:
          'Rewildpunk: cities surrendered back to wild nature, with forests bursting through highways, animals in towers and people living lightly among them.',
        subject_treatment:
          "Keep the prompt's subject and setting; let wild nature reclaim the built world around it, with animals sharing the space.",
        color_and_tone:
          'Deep greens and mossy browns over weathered concrete grey with flower colors.',
        lighting_and_shadow: 'Dappled forest light falling through broken roofs and overpasses.',
        texture_and_material: 'Moss, vines, cracked concrete, rusted steel and animal tracks.',
        camera_and_composition: 'Wild landscapes framed by ruins of highways, malls and towers.',
        atmosphere_and_mood: 'Lush and humbling, nature quietly taking back what was always hers.',
        rendering_and_quality:
          'Richly detailed illustration with dense vegetation and wildlife living among the ruins.',
        key_features:
          'forests through highways; animals in towers; moss on concrete; dappled light',
      },
      [
        'A herd of elk migrates down an eight-lane highway overgrown with forest, traffic signs tangled in vines and a family of bears asleep in an abandoned toll booth. No readable text or logo.',
        'A wolf pack has taken over a shopping mall escalator and a very polite security guard is still trying to do his job. No readable text or logo.',
        'A single deer drinks from a fountain in the flooded lobby of a skyscraper, sunlight falling through the broken glass roof. No readable text or logo.',
      ],
    ),
    punk(
      'Monsoonpunk',
      'monsoon city punk',
      'monsoonpunk',
      {
        aesthetic:
          'Monsoonpunk: cities designed for torrential rain, with waterfall streets, umbrella roofs, rain-harvesting towers and life that goes on in the downpour.',
        subject_treatment:
          "Keep the prompt's subject and setting; drench it in heavy monsoon rain with rain-harvesting structures and people carrying on.",
        color_and_tone: 'Rain greys and deep greens with saturated umbrella colors and lamp amber.',
        lighting_and_shadow:
          'Diffuse rain light, glowing windows and reflections in flooded streets.',
        texture_and_material:
          'Sheets of rain, waterproof tarps, gutters, rain chains and soaked fabrics.',
        camera_and_composition:
          'Streets seen through curtains of rain with waterfalls pouring off roofs.',
        atmosphere_and_mood:
          'Drenched and lively, a city that treats the storm as part of the family.',
        rendering_and_quality:
          'Atmospheric illustration with convincing rain sheets and wet reflections.',
        key_features: 'rain curtains; waterfall roofs; umbrella canopies; rain chains',
      },
      [
        'A wedding procession wades waist-deep through a monsoon-flooded street, the bride on a floating platform of lotus leaves while musicians play under a moving canopy of a hundred umbrellas. No readable text or logo.',
        'A cricket match continues in the monsoon with every player holding an umbrella, including the ball, somehow. No readable text or logo.',
        'A rain-harvesting tower fills slowly through the night, a lone keeper listening to the drumming on its roof. No readable text or logo.',
      ],
    ),
  ] satisfies Create[],
};

export default spec;
