import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Eco, repair and climate punks (part B): ten more climate punks with their own technologies.
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
  updates: {},
  creates: [
    punk(
      'Beepunk',
      'pollinator guardian punk',
      'beepunk',
      {
        aesthetic:
          'Beepunk: a culture built around saving pollinators, with hive towers, flower corridors, beekeeper guilds and honey-gold architecture.',
        subject_treatment:
          "Keep the prompt's subject and setting; surround it with hives, bees, flower corridors and hexagonal honey-gold structures.",
        color_and_tone:
          'Honey gold, pollen yellow and wildflower colors against warm wax amber and green.',
        lighting_and_shadow:
          'Warm golden sunlight glowing through wax combs and translucent wings everywhere.',
        texture_and_material:
          'Wax combs, woven skeps, veiled suits, pollen dust and wildflower meadows.',
        camera_and_composition:
          'Close views among swarming bees and wide views of hive towers in meadows.',
        atmosphere_and_mood:
          'Humming and generous, a whole civilization organized around keeping the flowers alive.',
        rendering_and_quality:
          'Luminous detailed illustration with glowing combs and delicate bee wings.',
        key_features: 'hive towers; wax combs; flower corridors; veiled beekeepers',
      },
      [
        'A queen bee the size of a horse is carried through a festival city on a honeycomb palanquin, beekeepers in veils bowing as a million bees form a glowing golden cloud over the parade. No readable text or logo.',
        'A beekeeper discovers the hive has built a perfect wax replica of his house, including a tiny version of himself asleep in the chair. No readable text or logo.',
        'In a dead gray valley, a single beekeeper walks alone at dawn carrying one small hive and a handful of seeds. No readable text or logo.',
      ],
    ),
    punk(
      'Tidepunk',
      'tidal energy punk',
      'tidepunk',
      {
        aesthetic:
          'Tidepunk: coastal cities powered by the rhythm of tides, with tidal turbines, sea gates, floating docks and streets that appear and vanish twice a day.',
        subject_treatment:
          "Keep the prompt's subject and setting; place it on a tidal shore with sea gates, turbines and streets half covered by water.",
        color_and_tone:
          'Slate sea greys, sand beige and kelp green with rusted orange turbine hubs.',
        lighting_and_shadow:
          'Low coastal sun glinting on wet flats and water pouring through sea gates.',
        texture_and_material:
          'Barnacled concrete, turbine blades, wet sand ripples, chains and seaweed.',
        camera_and_composition:
          'Wide tidal flats with structures standing in shallow water at low or high tide.',
        atmosphere_and_mood: 'Rhythmic and patient, life timed to the breathing of the sea.',
        rendering_and_quality: 'Crisp coastal illustration with wet reflections and moving water.',
        key_features: 'tidal turbines; sea gates; vanishing streets; wet flats',
      },
      [
        'When the tide goes out, a whole sunken market town rises from the sea for three hours, traders racing to sell their goods on dripping streets before the water comes back. No readable text or logo.',
        'A fisherman waits patiently for the tide while his boat sits on the sand and a crab steals his lunch. No readable text or logo.',
        'At high tide a lighthouse stands alone in the sea, its door leading to a staircase that goes down into the water. No readable text or logo.',
      ],
    ),
    punk(
      'Urban Farmpunk',
      'city farming punk',
      'urban-farm',
      {
        aesthetic:
          'Urban farmpunk: dense cities turned into farms, with rooftop fields, balcony rice terraces, subway mushroom caves and livestock in parking garages.',
        subject_treatment:
          "Keep the prompt's subject and setting; farm every surface around it, from roofs and balconies to tunnels and staircases.",
        color_and_tone:
          'Crop greens and grain golds against concrete grey, with red tomatoes and flower accents.',
        lighting_and_shadow: 'Sunlight on rooftop fields and grow-light pink in underground farms.',
        texture_and_material: 'Soil beds, irrigation pipes, crates, concrete and climbing vines.',
        camera_and_composition:
          'Vertical cityscapes where every level is a different kind of farm.',
        atmosphere_and_mood:
          'Busy and nourishing, a city that learned to feed itself from its own walls.',
        rendering_and_quality:
          'Dense lively illustration with readable crops and city structures together.',
        key_features: 'rooftop fields; balcony terraces; grow-light caves; livestock in garages',
      },
      [
        'A herd of cows is lifted by crane from one skyscraper rooftop pasture to another above rush-hour traffic, the farmers waving calmly and office workers pressed against the windows. No readable text or logo.',
        'A retired banker in a pinstripe suit grows a prize-winning giant pumpkin inside his office cubicle, the vine climbing over the partition walls while his coworkers take meetings around it. No readable text or logo.',
        'Deep in an abandoned subway tunnel, glowing mushroom farms light the tracks where trains once ran. No readable text or logo.',
      ],
    ),
    punk(
      'Heatwavepunk',
      'extreme heat adaptation punk',
      'heatwave',
      {
        aesthetic:
          'Heatwavepunk: life adapted to killing heat, with white reflective cities, shade sails, night markets, cooling towers and people living after dark.',
        subject_treatment:
          "Keep the prompt's subject and setting; bake it in extreme heat with shade structures, reflective surfaces and life shifted to night.",
        color_and_tone: 'Bleached white, burning orange sky and deep cool blues in the shade.',
        lighting_and_shadow:
          'Blinding sun with hard dark shade, or warm night markets under string lights.',
        texture_and_material:
          'Reflective white paint, shade sails, misting pipes, clay jars and sweat.',
        camera_and_composition:
          'Empty sun-bleached streets by day and crowded night scenes after sunset.',
        atmosphere_and_mood:
          'Oppressive and resourceful, people surviving the sun by inventing a nocturnal life.',
        rendering_and_quality:
          'High-contrast illustration with heat shimmer and deep cooling shade.',
        key_features: 'shade sails; reflective white city; heat shimmer; night markets',
      },
      [
        'At midnight the entire city finally wakes up, and a crowded night market fills a sun-cracked plaza under string lights while giant misting towers breathe cool fog over the dancing crowd. No readable text or logo.',
        'A man carries his refrigerator on his back through a blazing street to sleep inside it. No readable text or logo.',
        'At noon a completely empty city shimmers in the heat, a single cat asleep in the only shadow. No readable text or logo.',
      ],
    ),
    punk(
      'Mangrovepunk',
      'mangrove coast punk',
      'mangrove',
      {
        aesthetic:
          'Mangrovepunk: coastal villages grown into mangrove forests, with root bridges, stilt houses, tidal channels and walls made by living trees.',
        subject_treatment:
          "Keep the prompt's subject and setting; weave it into tangled mangrove roots, tidal channels and houses on stilts.",
        color_and_tone: 'Murky tea-brown water, dense leaf greens and weathered silver wood.',
        lighting_and_shadow: 'Dappled light through a dense canopy and glinting tidal water.',
        texture_and_material:
          'Arching roots, mud, oyster shells, stilt timber and woven palm roofs.',
        camera_and_composition:
          'Low boat-level views gliding through long tunnels of arching roots over dark water.',
        atmosphere_and_mood:
          'Tangled and protective, a forest that holds the sea back with its hands.',
        rendering_and_quality:
          'Richly textured illustration with complex root structures and water.',
        key_features: 'arching roots; stilt houses; tidal channels; living walls',
      },
      [
        'A cyclone crashes against a coastal village and the mangrove forest around it rises up, its roots locking together like a living wall as families watch from their stilt houses. No readable text or logo.',
        'Children race canoes through the tunnels of mangrove roots while a lazy crocodile referees from a log. No readable text or logo.',
        'An abandoned stilt house slowly swallowed by mangrove roots, a lantern still hanging in the window. No readable text or logo.',
      ],
    ),
    punk(
      'Cobpunk',
      'earthen building punk',
      'cobpunk',
      {
        aesthetic:
          'Cobpunk: sculpted earthen architecture of cob, adobe and rammed earth, with rounded walls, living roofs and hand-shaped homes.',
        subject_treatment:
          "Keep the prompt's subject and setting; shape its buildings and furniture from sculpted earth, straw and clay by hand.",
        color_and_tone: 'Warm ochre, terracotta and straw gold with living-roof greens.',
        lighting_and_shadow:
          'Soft sunlight on curved walls and warm light glowing through round windows.',
        texture_and_material:
          'Hand-smoothed clay, straw, rammed-earth layers, bottle windows and grass roofs.',
        camera_and_composition:
          'Organic rounded buildings clustered together like a hillside village grown from the ground.',
        atmosphere_and_mood: 'Earthy and gentle, homes that feel grown rather than built.',
        rendering_and_quality: 'Warm tactile illustration with visible handprints in clay walls.',
        key_features: 'curved clay walls; bottle windows; living roofs; handprints',
      },
      [
        'A village of sculpted clay houses is built on the back of a sleeping giant tortoise, children pressing handprints into the fresh walls as the tortoise slowly wakes up. No readable text or logo.',
        'A potter accidentally builds her entire clay house in the shape of an enormous teapot, spout included, and the neighbors now gather every morning to watch steam pour out of the chimney-spout. No readable text or logo.',
        'A glowing bottle-glass window in a clay wall sends a pattern of colored light across an empty bedroom at dawn. No readable text or logo.',
      ],
    ),
    punk(
      'Wildfirepunk',
      'wildfire resilience punk',
      'wildfire',
      {
        aesthetic:
          'Wildfirepunk: communities living with fire, with firebreak towns, ember shelters, smoke masks, controlled burns and forests reborn from ash.',
        subject_treatment:
          "Keep the prompt's subject and setting; bring fire and smoke close, with shelters, firefighters and new growth among the ashes.",
        color_and_tone: 'Smoky orange skies, ember red and ash grey with sudden green new growth.',
        lighting_and_shadow:
          'Orange-filtered daylight through smoke and flickering ember glow at night.',
        texture_and_material:
          'Ash, charred bark, fire-resistant canvas, smoke masks and scorched earth.',
        camera_and_composition:
          'Towering smoke columns over small figures, and close views of ash and sprouts.',
        atmosphere_and_mood: 'Dangerous and defiant, people who learned to live beside the flames.',
        rendering_and_quality: 'Dramatic smoky illustration with glowing embers and ash texture.',
        key_features: 'smoke skies; ember shelters; controlled burns; green sprouts in ash',
      },
      [
        'Firefighters on horseback guide a herd of animals through a burning forest at night, deer, bears and owls following their lanterns while the sky glows orange behind the smoke. No readable text or logo.',
        'A grandmother bakes bread in the embers of a controlled burn while the fire crew waits for a slice. No readable text or logo.',
        'The morning after the fire, a single bright green sprout rises from a field of black ash. No readable text or logo.',
      ],
    ),
    punk(
      'Compostpunk',
      'soil and decomposition punk',
      'compost',
      {
        aesthetic:
          'Compostpunk: a culture that worships decay and soil, with compost cathedrals, worm farms, fungal recyclers and gardens grown from waste.',
        subject_treatment:
          "Keep the prompt's subject and setting; turn waste into soil around it with compost heaps, worms, fungi and new growth.",
        color_and_tone:
          'Rich soil browns, rot purples and mushroom creams with fresh sprout greens.',
        lighting_and_shadow: 'Warm steam rising from heaps in cool morning light.',
        texture_and_material: 'Dark soil, worms, fungi, rotting leaves, steam and wooden bins.',
        camera_and_composition:
          'Close ground-level views of soil life and wide views of compost structures.',
        atmosphere_and_mood: 'Earthy and hopeful, decay treated as the beginning of everything.',
        rendering_and_quality: 'Richly textured illustration with organic detail and warm steam.',
        key_features: 'compost heaps; worms and fungi; steaming soil; new growth',
      },
      [
        'An entire abandoned shopping mall is being slowly eaten by a giant fungal recycler, mushrooms growing through the escalators while monks in robes tend the compost cathedral that was once the food court. No readable text or logo.',
        'A worm farmer proudly presents a worm the size of a snake at the village fair. No readable text or logo.',
        'Steam rises from a compost heap in a frosty garden at dawn, a robin waiting on the fork handle. No readable text or logo.',
      ],
    ),
    punk(
      'Watershedpunk',
      'water harvesting punk',
      'watershed',
      {
        aesthetic:
          'Watershedpunk: communities that harvest every drop, with fog nets, rain towers, stepwells, aqueducts and water shrines in dry lands.',
        subject_treatment:
          "Keep the prompt's subject and setting; channel water through it with nets, stepwells, cisterns and aqueducts.",
        color_and_tone: 'Dry ochre and terracotta with precious clear blues of collected water.',
        lighting_and_shadow: 'Harsh sun on dry land and cool shade over glinting water pools.',
        texture_and_material:
          'Stone stepwells, fog nets, clay pipes, cisterns and wet moss in the shade.',
        camera_and_composition:
          'Deep stepwell perspectives and dry landscapes crossed by thin water channels.',
        atmosphere_and_mood:
          'Reverent and resourceful, water treated as the most sacred thing there is.',
        rendering_and_quality:
          'Precise illustration with geometric stone structures and glinting water.',
        key_features: 'stepwells; fog nets; aqueducts; water shrines',
      },
      [
        'A thousand-step stepwell descends into the earth like an inverted palace, villagers carrying jars down its geometric stairs to a single shimmering pool at the bottom as pigeons swirl overhead. No readable text or logo.',
        'A goat has learned to stand under the fog net every morning with its mouth open. No readable text or logo.',
        'A small water shrine in a dry canyon holds a single cup of water that is never empty. No readable text or logo.',
      ],
    ),
    punk(
      'Solar Nomadpunk',
      'solar caravan punk',
      'solar-nomad',
      {
        aesthetic:
          'Solar nomadpunk: caravans that follow the sun across deserts and plains, with solar sails, fold-out camps, battery camels and night-glowing tents.',
        subject_treatment:
          "Keep the prompt's subject and setting; turn it into a traveling caravan powered by solar panels, sails and stored light.",
        color_and_tone:
          'Sand gold, dusk violet and panel blue with warm glowing tent light at night.',
        lighting_and_shadow:
          'Blazing day sun on panels and soft stored light glowing from tents at night.',
        texture_and_material:
          'Folding solar panels, canvas tents, woven blankets, cables and dusty wheels.',
        camera_and_composition: 'Long caravans crossing horizons and glowing camps under stars.',
        atmosphere_and_mood: 'Free and wandering, a home that moves wherever the sun leads.',
        rendering_and_quality:
          'Warm cinematic illustration with glowing camps and vast landscapes.',
        key_features: 'solar sails; caravan trains; glowing tents; battery pack animals',
      },
      [
        'A kilometer-long solar caravan unfolds its panels like the wings of a giant moth at sunrise on a salt plain, children running along the caravan as the whole moving town turns toward the light. No readable text or logo.',
        'A nomad sells cups of sun-heated tea from a camel wearing solar panels as a saddle. No readable text or logo.',
        'At night a single tent glows on an empty plain, powered by the day it just crossed. No readable text or logo.',
      ],
    ),
  ] satisfies Create[],
};

export default spec;
