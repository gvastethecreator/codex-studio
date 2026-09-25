import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Classic industrial punks (part B): ten more punks, each grown from one historical technology.
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
  updates: {},
  creates: [
    punk(
      'Balloonpunk',
      'hot-air balloon age punk',
      'balloonpunk',
      {
        aesthetic:
          'Balloonpunk: a sky society of patched hot-air balloons, wicker gondolas, sandbag ballast and floating markets tethered above the clouds.',
        subject_treatment:
          "Keep the prompt's subject and setting; lift it into the air on balloons, gondolas and tethers, with ropes and ballast visible.",
        color_and_tone:
          'Striped balloon reds, mustard and teal against pale sky blue and cloud white.',
        lighting_and_shadow:
          'Bright high-altitude sun with burner flames glowing inside the envelopes.',
        texture_and_material:
          'Patched silk envelopes, wicker baskets, hemp nets, sandbags and brass burners.',
        camera_and_composition:
          'Views up at clustered balloons and down from gondolas over tiny landscapes.',
        atmosphere_and_mood:
          'Buoyant and adventurous, a whole community drifting slowly wherever the wind decides.',
        rendering_and_quality:
          'Airy period illustration with bright envelopes and crisp rigging detail.',
        key_features: 'patched envelopes; wicker gondolas; tethers; burner glow',
      },
      [
        'Balloonpunk illustration of a floating market of patched striped balloons tethered together above the clouds, traders passing baskets between wicker gondolas on ropes, burner flames glowing inside the envelopes and sandbags hanging below. No readable text or logo.',
        'Balloonpunk illustration of a postal balloonist dropping parcels on tiny parachutes to a mountain village far below, wind snapping the ribbons on her gondola. No readable text or logo.',
        'Balloonpunk illustration of a race of home-made balloons over a river valley at dawn, each basket crewed by a different family waving flags without symbols. No readable text or logo.',
      ],
    ),
    punk(
      'Diverpunk',
      'hard-hat diving age punk',
      'diverpunk',
      {
        aesthetic:
          'Diverpunk: an undersea industrial age of copper hard-hat divers, air hoses, diving bells and riveted underwater stations.',
        subject_treatment:
          "Keep the prompt's subject and setting; take it underwater with hard-hat diving gear, air hoses and riveted structures.",
        color_and_tone:
          'Deep sea green and blue with polished copper, brass and pale shafts of light.',
        lighting_and_shadow:
          'Sunbeams from the surface and lamp beams from helmets in murky water.',
        texture_and_material:
          'Copper helmets with bolted faceplates, canvas suits, rubber hoses and barnacled iron.',
        camera_and_composition: 'Low seafloor views looking up at hoses rising to the surface.',
        atmosphere_and_mood: 'Slow and weighty, every step an effort in a silent, dangerous world.',
        rendering_and_quality:
          'Moody period illustration with suspended particles and gleaming copper.',
        key_features: 'copper hard hats; air hoses; diving bells; riveted stations',
      },
      [
        'Diverpunk illustration of hard-hat divers in canvas suits building a riveted underwater station on the seabed, copper helmets gleaming in surface sunbeams, air hoses rising to a barge far above and fish drifting past. No readable text or logo.',
        'Diverpunk illustration of a riveted diving bell lowered into a sunken cathedral, lamplight revealing flooded pews, drifting hymn books and a curious octopus on the altar rail. No readable text or logo.',
        'Diverpunk illustration of a diver shaking hands with a giant turtle beside a shipwreck, bubbles rising from his helmet valve. No readable text or logo.',
      ],
    ),
    punk(
      'Telegraphpunk',
      'telegraph wire age punk',
      'telegraphpunk',
      {
        aesthetic:
          'Telegraphpunk: a world wired by telegraph lines, where messages hum along poles, operators tap keys and cities are laced with overhead wires.',
        subject_treatment:
          "Keep the prompt's subject and setting; string telegraph wires, poles and relay stations through it, with signals as sparks along the lines.",
        color_and_tone:
          'Weathered wood brown, copper wire orange and grey sky with small blue signal sparks.',
        lighting_and_shadow: 'Flat overcast light with little blue sparks traveling along wires.',
        texture_and_material:
          'Wooden poles, glass insulators, copper wire, brass telegraph keys and paper tape.',
        camera_and_composition:
          'Dense webs of wires criss-crossing the sky above streets and plains.',
        atmosphere_and_mood:
          'Connected and restless, news racing across a continent faster than any rider.',
        rendering_and_quality:
          'Precise period illustration with fine line wires and small spark accents.',
        key_features: 'overhead wire webs; poles and insulators; telegraph keys; signal sparks',
      },
      [
        'Telegraphpunk illustration of a busy city street beneath a dense web of telegraph wires strung between tall wooden poles, tiny blue signal sparks racing along the lines while messenger boys cycle below. No readable text or logo.',
        'Telegraphpunk illustration of a lone operator at a relay hut on the prairie tapping a brass key at night, wires humming overhead. No readable text or logo.',
        'Telegraphpunk illustration of line workers repairing a snapped wire on a pole during a snowstorm, sparks dancing at the break. No readable text or logo.',
      ],
    ),
    punk(
      'Polar Steam Expedition Punk',
      'arctic expedition machine punk',
      'polar-steam',
      {
        aesthetic:
          'Polar expedition punk: steam-powered ice crawlers, fur-clad explorers, frozen ships and heated tents on endless white.',
        subject_treatment:
          "Keep the prompt's subject and setting; send it into polar cold with steam machines, sledges and frost on every surface.",
        color_and_tone:
          'Blinding white and ice blue with tarred black machines and warm lantern orange.',
        lighting_and_shadow:
          'Low polar sun with long blue shadows and lamps glowing inside frosted windows.',
        texture_and_material: 'Frost-covered iron, fur parkas, canvas tents, sled runners and ice.',
        camera_and_composition:
          'Tiny expeditions against vast white horizons, or close frosted faces.',
        atmosphere_and_mood:
          'Brave and freezing, stubborn explorers pushing machines into places that do not want them.',
        rendering_and_quality: 'Crisp cold illustration with frost detail and warm light accents.',
        key_features: 'steam ice crawlers; frost; fur parkas; lantern-lit tents',
      },
      [
        'Polar expedition punk illustration of a steam-powered ice crawler hauling sledges across an endless white plain, its chimney puffing black smoke, fur-clad explorers walking beside it and a frozen ship locked in the ice behind. No readable text or logo.',
        'Polar expedition illustration of explorers huddled in a heated canvas tent, a small boiler glowing and frost on the inside walls. No readable text or logo.',
        'Polar expedition illustration of a lone explorer in a fur parka planting an expedition pole on a glacier summit under green aurora, a steam crawler waiting far below. No readable text or logo.',
      ],
    ),
    punk(
      'Petropunk',
      'early oil age punk',
      'petropunk',
      {
        aesthetic:
          'Petropunk: the early oil boom as an alternate world of derricks, gushers, pipelines, refineries and oil-soaked frontier towns.',
        subject_treatment:
          "Keep the prompt's subject and setting; surround it with derricks, pipelines and crude oil, glossy black on everything.",
        color_and_tone:
          'Glossy black crude, dusty ochre plains, rust and flare orange against pale sky.',
        lighting_and_shadow:
          'Harsh prairie sun and gas flare glow at night, glossy highlights on oil.',
        texture_and_material:
          'Wooden derricks, riveted tanks, pipelines, oil-soaked cloth and mud.',
        camera_and_composition:
          'Forests of derricks on the horizon and low angles under gushing wells.',
        atmosphere_and_mood:
          'Greedy and exhilarating, fortunes rising and falling with every new gusher.',
        rendering_and_quality: 'Gritty period illustration with glossy oil and dusty atmosphere.',
        key_features: 'wooden derricks; gushers; pipelines; flare glow',
      },
      [
        'Petropunk illustration of a black gusher erupting over a forest of wooden derricks on a dusty plain, oil raining down on cheering workers, riveted tanks and pipelines stretching to a flaring refinery. No readable text or logo.',
        'Petropunk illustration of a boomtown main street at night lit by roaring gas flares, oil-stained wagons, saloons with swinging doors and workers counting pay under a lantern. No readable text or logo.',
        'Petropunk illustration of a pipeline crawler machine walking on iron stilts across a red canyon, a black pipeline unrolling behind it and roughnecks riding on top. No readable text or logo.',
      ],
    ),
    punk(
      'Printpunk',
      'printing press revolution punk',
      'printpunk',
      {
        aesthetic:
          'Printpunk: a world driven by printing presses, where pamphlets, posters and giant rotary presses power revolutions and city life.',
        subject_treatment:
          "Keep the prompt's subject and setting; fill it with presses, paper stacks, ink rollers and blank posters (no readable text).",
        color_and_tone: 'Paper cream, black ink and oxblood red with steel press grey.',
        lighting_and_shadow:
          'Workshop lamps and skylights over presses, crisp shadows of hanging sheets.',
        texture_and_material:
          'Metal type blocks, ink rollers, paper stacks, iron presses and ink-stained aprons.',
        camera_and_composition:
          'Crowded workshops with sheets hanging overhead and presses in the foreground.',
        atmosphere_and_mood:
          'Urgent and rebellious, ideas spreading faster than anyone can stop them.',
        rendering_and_quality:
          'Engraving-like period illustration with crisp lines and ink texture.',
        key_features: 'rotary presses; hanging sheets; ink rollers; blank posters',
      },
      [
        'Printpunk illustration of a secret print shop in a cellar at night, a giant iron rotary press spinning out blank broadsheets, apprentices hanging wet sheets on lines overhead and ink rollers glistening. No readable text or logo.',
        'Printpunk illustration of a paper airship drifting over a city square and dropping thousands of blank pamphlets that swirl down onto a surprised crowd. No readable text or logo.',
        'Printpunk illustration of a typesetter arranging metal blocks by candlelight in a cramped workshop, ink on her fingers and wet sheets hanging overhead. No readable text or logo.',
      ],
    ),
    punk(
      'Millpunk',
      'water and wind mill punk',
      'millpunk',
      {
        aesthetic:
          'Millpunk: a countryside of water wheels, windmills and wooden gearing driving saws, pumps and grinders in every village.',
        subject_treatment:
          "Keep the prompt's subject and setting; power it with visible wooden wheels, sails and gears turned by water or wind.",
        color_and_tone: 'Oak brown, millstone grey and green countryside with river blue.',
        lighting_and_shadow:
          'Soft daylight with spray glittering off water wheels and sails casting sweeping shadows.',
        texture_and_material:
          'Wooden cog wheels, millstones, sail cloth, mossy stone and flowing water.',
        camera_and_composition:
          'Rustic village views with wheels and sails dominating the skyline.',
        atmosphere_and_mood:
          'Pastoral and ingenious, humble wooden machines doing the work of giants.',
        rendering_and_quality:
          'Warm rustic illustration with accurate, believable wooden mechanisms and water spray.',
        key_features: 'water wheels; windmill sails; wooden gearing; millstones',
      },
      [
        'Millpunk illustration of a riverside village where giant wooden water wheels drive saws, looms and a millstone through visible wooden gearing, spray glittering in the sun and children fishing from the wheel housing. No readable text or logo.',
        'Millpunk illustration of a windmill-powered drawbridge lifting its wooden deck to let a barge pass, sails turning and villagers waiting with carts on both banks. No readable text or logo.',
        'Millpunk illustration of a miller oiling huge wooden cogs inside a creaking windmill at dusk, flour dust glowing in the last light through a small window. No readable text or logo.',
      ],
    ),
    punk(
      'Automaton Salonpunk',
      'aristocratic automata punk',
      'automaton',
      {
        aesthetic:
          'Automaton salonpunk: 18th-century salons full of elegant mechanical automata that write, play music and serve tea among powdered aristocrats.',
        subject_treatment:
          "Keep the prompt's subject and setting; place it among delicate automata with porcelain faces, silk clothing and visible inner mechanisms.",
        color_and_tone: 'Pastel rococo pinks and blues, gilt gold and porcelain white.',
        lighting_and_shadow: 'Candlelit chandeliers and soft window light in gilded salons.',
        texture_and_material:
          'Porcelain faces, silk, gilt frames, fine brass mechanisms under open panels.',
        camera_and_composition:
          'Elegant salon interiors with the automata posed among the guests like people.',
        atmosphere_and_mood:
          'Refined and uncanny, beauty and clockwork precision hiding something slightly eerie.',
        rendering_and_quality:
          'Delicate rococo illustration with fine mechanical detail visible under open panels.',
        key_features: 'porcelain automata; rococo salon; open panels; candlelight',
      },
      [
        'Automaton salonpunk illustration of a candlelit rococo salon where a porcelain-faced automaton in silk plays a harpsichord for powdered guests, a panel on its back open to show fine brass mechanisms, gilt mirrors reflecting the candles. No readable text or logo.',
        'Automaton salon illustration of an afternoon tea party served by mechanical footmen with porcelain hands and silk livery, aristocrats watching a tray balance perfectly on a gear-driven wrist. No readable text or logo.',
        'Automaton salon illustration of an inventor winding a life-size dancer automaton in a gilded workshop, its back panel open and a small audience peeking through the door. No readable text or logo.',
      ],
    ),
    punk(
      'Paddlewheelpunk',
      'river steamboat punk',
      'paddlewheel',
      {
        aesthetic:
          'Paddlewheelpunk: wide rivers ruled by towering paddle steamers, floating casinos, dock towns and mechanical river fortresses.',
        subject_treatment:
          "Keep the prompt's subject and setting; put it on or beside a great river with paddle steamers and docks.",
        color_and_tone: 'Muddy river brown, white-painted decks and red wheels with sunset gold.',
        lighting_and_shadow:
          'Hazy river sunlight, deck lanterns at dusk and reflections on brown water.',
        texture_and_material:
          'Painted wooden decks, huge paddle wheels, smokestacks, ropes and mud banks.',
        camera_and_composition:
          'Wide river views with steamers passing and low shots near churning wheels.',
        atmosphere_and_mood:
          'Lazy and grand, fortunes gambled on slow boats drifting down wide water.',
        rendering_and_quality:
          'Warm period illustration with glowing water reflections and drifting river haze.',
        key_features: 'paddle wheels; twin smokestacks; river docks; lantern decks',
      },
      [
        'Paddlewheelpunk illustration of a towering four-deck paddle steamer churning down a wide brown river at sunset, twin smokestacks puffing, a brass calliope playing on deck and a dock town waving from the bank. No readable text or logo.',
        'Paddlewheelpunk illustration of a floating casino steamboat lit by hundreds of lanterns on a misty river night, music drifting across the water and rowboats ferrying guests. No readable text or logo.',
        'Paddlewheelpunk illustration of a mechanical river fortress with four giant paddle wheels guarding a marshy delta at dawn, flags without symbols snapping above its turrets. No readable text or logo.',
      ],
    ),
    punk(
      'Canalpunk',
      'canal age engineering punk',
      'canalpunk',
      {
        aesthetic:
          'Canalpunk: a country of engineered canals with lock staircases, aqueducts over valleys, boat lifts and horse-drawn narrowboats.',
        subject_treatment:
          "Keep the prompt's subject and setting; route water through it with locks, aqueducts and narrowboats as the main infrastructure.",
        color_and_tone:
          'Brick red, canal green water, painted narrowboat colors and mossy stone grey.',
        lighting_and_shadow: 'Soft English daylight with reflections doubled in still canal water.',
        texture_and_material:
          'Brick aqueducts, wooden lock gates, painted boats and iron winding gear.',
        camera_and_composition:
          'Long canal perspectives, stepped locks and aqueducts spanning valleys.',
        atmosphere_and_mood:
          'Patient and peaceful, a slow engineered world that runs at walking pace.',
        rendering_and_quality:
          'Gentle detailed illustration with calm reflections and precise engineering.',
        key_features: 'lock staircases; aqueducts; narrowboats; still reflections',
      },
      [
        'Canalpunk illustration of a staircase of brick locks climbing a green hillside, painted narrowboats rising step by step while lock keepers turn iron winding gear and a horse waits on the towpath. No readable text or logo.',
        'Canalpunk illustration of a long brick aqueduct carrying a canal high over a misty valley at sunrise, a painted narrowboat crossing and sheep grazing far below. No readable text or logo.',
        'Canalpunk illustration of a giant rotating boat lift raising a narrowboat between two canal levels, iron arms turning slowly and families watching from a stone terrace. No readable text or logo.',
      ],
    ),
  ] satisfies Create[],
};

export default spec;
