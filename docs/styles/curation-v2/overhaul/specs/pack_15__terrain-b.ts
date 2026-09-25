import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Ocean, ice and terrain punks (part B): fire, rock, wetland, jungle, salt and mountain cultures.
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
  updates: {},
  creates: [
    punk(
      'Volcanopunk',
      'volcanic forge culture punk',
      'volcanopunk',
      {
        aesthetic:
          'Volcanopunk: forge cities built on the flanks of active volcanoes, with lava-channel foundries, obsidian armor, ash-grey streets and heat-shimmer everywhere.',
        subject_treatment:
          "Keep the prompt's subject and setting; place it on a living volcano, among lava channels, basalt forges and drifting ash.",
        color_and_tone:
          'Molten orange and red glowing against black basalt, charcoal ash and sulfur yellow.',
        lighting_and_shadow:
          'Hot glow from lava below lighting faces upward, smoky dark skies above.',
        texture_and_material:
          'Black basalt, glassy obsidian, cooling lava crust, ash, soot and heat haze.',
        camera_and_composition:
          'Dramatic slopes with glowing rivers cutting through dark rock and tiny figures.',
        atmosphere_and_mood: 'Fierce and proud, a people who live on top of the fire and use it.',
        rendering_and_quality:
          'High-contrast glowing illustration with heat shimmer and ash particle detail.',
        key_features: 'lava-channel foundries; obsidian armor; ash skies; upward lava glow',
      },
      [
        'Volcano smiths pour a river of living lava down a stone channel into the mold of a giant bell, the whole mountain city gathering on the ash-covered slopes to hear it ring for the first time. No readable text or logo.',
        'A volcanic city has a bakery that cooks bread by lowering it on a very long chain into the crater, and today the baker is arguing with the mountain because it burned the loaves. No readable text or logo.',
        'A child stands on cooled black lava at night and watches a thin orange river glide past her boots, warming her hands on the glow like a campfire. No readable text or logo.',
      ],
    ),
    punk(
      'Geyserpunk',
      'geothermal steam culture punk',
      'geyserpunk',
      {
        aesthetic:
          'Geyserpunk: a culture powered by geysers and hot springs, with steam-timed clocks, terraced mineral pools, pipe organs of vents and bathhouse cities.',
        subject_treatment:
          "Keep the prompt's subject and setting; surround it with erupting geysers, steaming terraced pools and geothermal pipes.",
        color_and_tone:
          'Mineral turquoise pools, sulfur yellow and rust orange crusts with white steam.',
        lighting_and_shadow:
          'Soft diffused light through drifting steam, bright sun catching spray.',
        texture_and_material:
          'Mineral terraces, bubbling mud, copper pipes, wet stone and billowing steam.',
        camera_and_composition:
          'Wide views of terraced pools and tall eruptions dwarfing bathers below.',
        atmosphere_and_mood:
          'Warm, steamy and rhythmic, a city that lives by the timing of the earth.',
        rendering_and_quality:
          'Soft luminous illustration with layered steam and saturated mineral colors.',
        key_features: 'erupting geysers; mineral terraces; steam clocks; bathhouse cities',
      },
      [
        'A giant geyser erupts on schedule in the center of a terraced bathhouse city, and every citizen raises a cup to catch the hot rain while steam-driven bells ring out across the turquoise pools. No readable text or logo.',
        'A very punctual geyser is two minutes late for the first time in a thousand years and the entire town waits in panic, clocks in hand, staring at the quiet bubbling hole. No readable text or logo.',
        'An old couple sits in a small hot spring at dawn, steam rising around them in the snow, holding hands without saying a word. No readable text or logo.',
      ],
    ),
    punk(
      'Cavepunk',
      'underground cave city punk',
      'cavepunk',
      {
        aesthetic:
          'Cavepunk: whole civilizations living deep in cave systems, with stalactite towers, glowworm skies, underground rivers and carved stone streets.',
        subject_treatment:
          "Keep the prompt's subject and setting; move it deep underground among stalactites, carved stone and glowing cave life.",
        color_and_tone:
          'Dark wet stone greys and ochres with blue-green glowworm light and warm torch amber.',
        lighting_and_shadow:
          'Torchlight and glowing cave organisms in deep darkness, dramatic shadows on rock.',
        texture_and_material:
          'Wet limestone, dripping stalactites, carved stone, still water and crystals.',
        camera_and_composition:
          'Vast caverns with tiny figures and forests of stalactites overhead.',
        atmosphere_and_mood: 'Hushed, echoing and ancient, a sky made of rock.',
        rendering_and_quality:
          'Atmospheric low-light illustration with wet stone highlights and deep space.',
        key_features: 'stalactite towers; glowworm skies; underground rivers; torch amber',
      },
      [
        'An underground king holds court on a throne carved from a single giant stalactite while ten thousand glowworms spread across the cavern ceiling like a green starry sky that none of his subjects has ever seen above ground. No readable text or logo.',
        'A cave town holds a very solemn ceremony to welcome the first visitor from the surface, who is a confused tourist still holding a map and a flashlight. No readable text or logo.',
        'A boy rows a small boat along a silent underground river, his single lantern reflected in the black water beneath a ceiling of dripping stone. No readable text or logo.',
      ],
    ),
    punk(
      'Canyonpunk',
      'canyon wall city punk',
      'canyonpunk',
      {
        aesthetic:
          'Canyonpunk: cities carved into red canyon walls, with cliff dwellings, rope bridges spanning chasms, wind-glider couriers and sunset-lit sandstone.',
        subject_treatment:
          "Keep the prompt's subject and setting; carve it into layered red canyon walls, with bridges across deep drops.",
        color_and_tone:
          'Red, orange and ochre sandstone bands with deep blue shadow and sunset gold.',
        lighting_and_shadow:
          'Hard sun striking canyon walls with deep blue shade in the gorge below.',
        texture_and_material:
          'Layered sandstone, carved adobe, woven rope bridges, leather and dust.',
        camera_and_composition:
          'Dizzying views across chasms, bridges and cliff dwellings at many heights.',
        atmosphere_and_mood: 'Bold and windswept, a frontier living on the edge of the drop.',
        rendering_and_quality: 'Warm saturated illustration with strong strata lines and depth.',
        key_features: 'cliff dwellings; chasm bridges; wind gliders; sandstone strata',
      },
      [
        'A courier on a patchwork wind-glider races a dust storm across a mile-deep canyon, cliff dwellers on every ledge cheering as she dives beneath a swaying rope bridge at the last second. No readable text or logo.',
        'Two rival cliff towns on opposite canyon walls shout insults at each other across the gorge every morning, and the echo turns every insult into a compliment by the time it arrives. No readable text or logo.',
        'At sunset, a shepherd sits alone at the edge of a carved cliff home, dangling his feet over the glowing red canyon while his goats sleep behind him. No readable text or logo.',
      ],
    ),
    punk(
      'Cliffpunk',
      'vertical sea-cliff colony punk',
      'cliffpunk',
      {
        aesthetic:
          'Cliffpunk: towns bolted to vertical sea cliffs among seabird colonies, with ladder streets, harness workers, wind turbines and waves exploding far below.',
        subject_treatment:
          "Keep the prompt's subject and setting; bolt it to a sheer sea cliff with ladders, harnesses and seabirds wheeling around.",
        color_and_tone:
          'Grey and white chalky stone, sea blue and white foam with orange safety harness accents.',
        lighting_and_shadow:
          'Bright windy daylight with fast cloud shadows and spray glinting below.',
        texture_and_material:
          'Chalk cliff, bolted steel, iron ladders, ropes, nesting straw and sea spray.',
        camera_and_composition:
          'Vertical views hanging on the cliff, with the sea far below and birds around.',
        atmosphere_and_mood:
          'Windy, loud and daring, everyday life with a huge fall beneath every step.',
        rendering_and_quality:
          'Crisp airy illustration with strong vertical depth and flying seabirds.',
        key_features: 'ladder streets; harness workers; seabird colonies; waves far below',
      },
      [
        'Harnessed builders bolt a new house onto a sheer sea cliff in a gale while thousands of seabirds scream around them and a giant wave explodes against the rocks three hundred meters below. No readable text or logo.',
        'A cliff village postman delivers letters by rappelling past every window, and the gulls have learned to steal the mail right out of his satchel mid-descent. No readable text or logo.',
        'A girl sits on a narrow ledge beside a puffin nest at dawn, both watching the fishing boats come in across the calm grey sea. No readable text or logo.',
      ],
    ),
    punk(
      'Swamppunk',
      'bayou swamp culture punk',
      'swamppunk',
      {
        aesthetic:
          'Swamppunk: stilt towns deep in bayous and mangrove swamps, with fan-boat taverns, lantern-hung cypress trees, gator-hide gear and mist on black water.',
        subject_treatment:
          "Keep the prompt's subject and setting; set it among stilt houses, cypress roots and still black swamp water in mist.",
        color_and_tone: 'Murky greens and browns, black water, moss grey and warm lantern orange.',
        lighting_and_shadow:
          'Hazy dim light through hanging moss and warm lanterns reflected on dark water.',
        texture_and_material:
          'Weathered stilts, hanging moss, cypress roots, duckweed, rusted tin roofs.',
        camera_and_composition:
          'Low water-level views through roots and moss with boats gliding between houses.',
        atmosphere_and_mood:
          'Humid, mysterious and musical, stories told on porches over dark water.',
        rendering_and_quality: 'Moody illustration with soft mist layers and rich reflections.',
        key_features: 'stilt towns; hanging moss; lantern reflections; black water',
      },
      [
        'A floating swamp carnival lit by a thousand lanterns drifts through the cypress forest at midnight, fiddlers playing on its roof while the eyes of hundreds of alligators glow in the black water around it. No readable text or logo.',
        'An old swamp witch runs a fan-boat taxi service and absolutely refuses to slow down, her terrified passengers clinging to the rails as she laughs through the moss. No readable text or logo.',
        'In the thick morning mist, a heron stands perfectly still on the porch rail of an abandoned stilt house as a small rowboat drifts past in silence. No readable text or logo.',
      ],
    ),
    punk(
      'Junglepunk',
      'rainforest canopy culture punk',
      'junglepunk',
      {
        aesthetic:
          'Junglepunk: canopy cities in dense rainforests, with vine elevators, treetop markets, waterfall power and bright parrots and frogs everywhere.',
        subject_treatment:
          "Keep the prompt's subject and setting; weave it into a dense green canopy with vines, giant leaves, waterfalls and treetop platforms.",
        color_and_tone:
          'Deep saturated greens with parrot red, frog blue and orchid pink accents and golden light.',
        lighting_and_shadow:
          'Dappled light shafts breaking through the canopy into humid green shadow.',
        texture_and_material:
          'Giant leaves, hanging vines, moss, bark, waterfall spray and woven platforms.',
        camera_and_composition:
          'Layered depth of foliage with platforms at many heights and animals peeking in.',
        atmosphere_and_mood: 'Lush, loud and teeming, a city where nature is always winning.',
        rendering_and_quality: 'Richly layered illustration with dense foliage and humid light.',
        key_features: 'canopy cities; vine elevators; light shafts; bright jungle animals',
      },
      [
        'A canopy city on giant trees prepares for war as a stampede of ancient forest elephants pushes through the jungle below, archers on vine swings and treetop drums shaking every leaf. No readable text or logo.',
        'A tiny poison-dart frog serves as the terrifying head of security at a treetop market, and every merchant bows as it hops past their stalls. No readable text or logo.',
        'In the soft dawn mist, a girl lies on a giant leaf high in the canopy listening to the whole jungle wake up around her. No readable text or logo.',
      ],
    ),
    punk(
      'Saltflatpunk',
      'salt flat speed culture punk',
      'saltflatpunk',
      {
        aesthetic:
          'Saltflatpunk: nomad speed-racers of endless white salt flats, with land-yachts, mirror-flooded horizons, salt-block towns and blinding sun.',
        subject_treatment:
          "Keep the prompt's subject and setting; place it on an infinite white salt flat, with mirror reflections and speed machines.",
        color_and_tone:
          'Blinding white salt, pale blue sky and mirror reflections with hot orange and chrome accents.',
        lighting_and_shadow:
          'Harsh overhead sun and hard short shadows, with glare off the white ground.',
        texture_and_material:
          'Cracked hexagonal salt crust, chrome, sailcloth, salt blocks and thin flood water.',
        camera_and_composition:
          'Minimal flat horizons with mirror reflections and tiny fast machines.',
        atmosphere_and_mood: 'Blinding, empty and fast, freedom and heat with nowhere to hide.',
        rendering_and_quality: 'Clean bright illustration with crisp reflections and heat shimmer.',
        key_features: 'mirror horizons; land-yachts; hexagon salt crust; blinding sun',
      },
      [
        'A hundred wind-powered land-yachts race across a flooded salt flat that mirrors the sky perfectly, so the racers seem to sail through clouds with a thunderstorm approaching on the horizon. No readable text or logo.',
        'A salt flat nomad builds a whole house out of salt blocks and then discovers his very large cow has been licking the walls all night. No readable text or logo.',
        'A lone figure walks across a mirror-still salt flat at dusk, perfectly reflected upside down beneath her feet under the first stars. No readable text or logo.',
      ],
    ),
    punk(
      'Alpinepunk',
      'high mountain culture punk',
      'alpinepunk',
      {
        aesthetic:
          'Alpinepunk: villages and monasteries on impossible mountain peaks, with cable-car towns, avalanche walls, prayer-flag bridges and climbers who never come down.',
        subject_treatment:
          "Keep the prompt's subject and setting; perch it on steep snowy peaks with cable lines, stone walls and thin clouds below.",
        color_and_tone:
          'Snow white, granite grey and deep sky blue with bright flag colors and warm wood.',
        lighting_and_shadow:
          'Crisp high-altitude sun with deep blue shadows and clouds glowing below.',
        texture_and_material: 'Granite, packed snow, ice, weathered timber, steel cable and wool.',
        camera_and_composition:
          'Dizzying high views with peaks above clouds and cable cars crossing between.',
        atmosphere_and_mood: 'Thin-aired, spiritual and daring, a people living above the clouds.',
        rendering_and_quality:
          'Crisp bright illustration with sharp ridges and clear atmospheric depth.',
        key_features: 'cable-car towns; peaks above clouds; avalanche walls; prayer-flag bridges',
      },
      [
        'A mountain monastery above the clouds fires its great horns as an avalanche thunders toward the village below, and monks on cable cars race to raise the stone avalanche walls in time. No readable text or logo.',
        'A mountain goat has been elected mayor of a peak village and is conducting its first very serious council meeting while chewing the official papers. No readable text or logo.',
        'An old climber sits alone on a summit at sunrise, the clouds glowing pink far below, pouring tea from a flask for a friend who never returned. No readable text or logo.',
      ],
    ),
  ] satisfies Create[],
};

export default spec;
