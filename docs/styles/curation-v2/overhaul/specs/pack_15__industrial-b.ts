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
        'A war of hot-air balloons over a burning vineyard, gondola crews hurling barrels of wine at each other while the patched envelopes of both fleets glow orange against the smoke. No readable text or logo.',
        'A wedding held in a floating wicker gondola above the clouds goes wrong when the cake counts as ballast and gets thrown overboard. No readable text or logo.',
        'A lone balloon with its burner out drifts silently above a moonlit sea of clouds, a sleeping child and a lantern its only passengers. No readable text or logo.',
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
        'Hard-hat divers in copper helmets hold a candlelit funeral for a leviathan on the seabed, their air hoses rising like pillars toward the distant surface light. No readable text or logo.',
        'A diver in a copper helmet tries to politely return a stolen pocket watch to a very offended giant crab on a shipwreck. No readable text or logo.',
        'Inside a riveted undersea station, a diver finds his own helmet already hanging on the wall, still wet, with a bundle of seaweed tied to it. No readable text or logo.',
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
        'Telegraph lines strung across a continent start carrying messages from the dead, and operators in a candlelit relay station stare as the brass keys tap by themselves. No readable text or logo.',
        'A crow colony has learned to tap the telegraph wires and now runs a gossip network across the valley, one crow wearing a tiny visor. No readable text or logo.',
        "A lonely lineman on a snowbound pole listens to two lovers' messages crossing the wire in the dark, sparks racing past his gloves. No readable text or logo.",
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
        "A steam-powered ice crawler breaks through the frozen sea and finds a lost expedition's ship perfectly preserved in a cavern of blue ice, lanterns still hanging from its masts. No readable text or logo.",
        'A polar explorer tries to teach a penguin colony to pull his supply sledge, the penguins clearly unionizing. No readable text or logo.',
        'Inside a frosted canvas tent, the last explorer writes by boiler light while a white figure waits patiently outside the flap. No readable text or logo.',
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
        'A black gusher erupts in the middle of a frontier cathedral during a sermon, oil raining over the pews as the congregation drops to its knees in joy and horror. No readable text or logo.',
        'Two oil barons duel with wooden derricks like giant jousting lances on a dusty plain while roughnecks sell popcorn. No readable text or logo.',
        'A rusted pumpjack still nods alone in a ghost town at dusk, a coyote asleep in its shadow. No readable text or logo.',
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
        "A rebel press prints ten thousand blank posters that come alive as paper birds and swarm the tyrant's palace at dawn, apprentices cheering from the cellar stairs. No readable text or logo.",
        'A typesetter accidentally sets the entire newspaper upside down and the whole town starts reading while standing on its head. No readable text or logo.',
        "In an abandoned print shop, the rotary press turns by itself at midnight, printing faces of people who haven't been born yet. No readable text or logo.",
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
        "A windmill giant walks across flooded fields during a storm, its four sails spinning as arms, carrying a whole village's grain on its back to high ground. No readable text or logo.",
        'A miller hires a family of bears to push his broken millstone around while he fixes the water wheel, the bears unexpectedly efficient. No readable text or logo.',
        "At midnight an old water mill grinds starlight instead of grain, the miller's daughter catching the glowing flour in a sack. No readable text or logo.",
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
        'At a masked ball, the porcelain automata quietly lock the doors and begin a waltz of their own while the aristocrats freeze against the gilded walls. No readable text or logo.',
        'A clockwork footman attempts to serve tea during an earthquake with perfect composure, cups flying around him while every guest screams. No readable text or logo.',
        "An inventor's widow dances alone in her salon with the automaton he built in his own likeness, its porcelain face cracked. No readable text or logo.",
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
        'A paddle steamer carrying a traveling circus runs aground on the back of a sleeping river leviathan, elephants and acrobats staring as the island begins to breathe. No readable text or logo.',
        'A riverboat card game gets heated when the dealer is revealed to be a very large catfish in a waistcoat. No readable text or logo.',
        'A sunken paddle wheel still turns slowly underwater in a flooded delta, fish swimming through its lanterns at night. No readable text or logo.',
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
        'A staircase of canal locks climbs into the clouds to a floating reservoir city, narrowboats rising step by step past waterfalls as lock keepers work the gears in the mist. No readable text or logo.',
        'A narrowboat family discovers their towpath horse has been quietly replaced by a unicorn, which is terrible at pulling. No readable text or logo.',
        'In a drained canal at night, a lock keeper finds hundreds of lost wedding rings glinting in the mud under his lamp. No readable text or logo.',
      ],
    ),
  ] satisfies Create[],
};

export default spec;
