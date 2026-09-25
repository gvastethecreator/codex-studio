import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Street, riot and DIY punks (part B): riot, market, rooftop, poster, dance, car and sticker cultures.
const AVOID = [...STYLE_AVOID, 'real brand or company logo', 'readable slogans or band names'];

const punk = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'punk', 'street'],
  dna: dna(fields),
  avoid: AVOID,
  briefs,
});

const spec: Spec = {
  pack: 'pack_15',
  category: '6. Street, Riot & DIY Punks',
  updates: {},
  creates: [
    punk(
      'Grrrlpunk',
      'feminist DIY riot punk',
      'grrrlpunk',
      {
        aesthetic:
          'Grrrlpunk: fierce feminist DIY punk, with cut-and-paste collage, marker-scrawled skin, babydoll dresses with combat boots and all-women bands on tiny stages.',
        subject_treatment:
          "Keep the prompt's subject and setting; give its figures fierce DIY punk styling with collage textures, boots and bold hand-drawn marks.",
        color_and_tone: 'Hot pink, black and xerox grey with red marker and cheap glitter accents.',
        lighting_and_shadow:
          'Harsh flash or bare stage lights with high contrast and hard shadows.',
        texture_and_material:
          'Photocopy grain, torn paper collage, marker on skin, glitter, lace and leather.',
        camera_and_composition:
          'Confrontational close framing, figures facing the viewer, collage edges cutting the frame.',
        atmosphere_and_mood: 'Loud, defiant and sisterly, taking up space without apology.',
        rendering_and_quality: 'Raw collage-like illustration with photocopy grain and bold marks.',
        key_features: 'cut-and-paste collage; marker marks; boots and lace; fierce direct gaze',
      },
      [
        'An all-women punk band plays on the roof of a stalled city bus in a traffic jam, guitars screaming as hundreds of drivers climb out of their cars to dance on the hoods. No readable text or logo.',
        "A punk grandmother in a lace dress and combat boots headbangs in the front row of her granddaughter's first show, embarrassing everyone and loving every second. No readable text or logo.",
        'In a bathroom mirror before the show, a young woman carefully draws bold marker stars on her collarbone, alone, taking a deep breath. No readable text or logo.',
      ],
    ),
    punk(
      'Fleamarketpunk',
      'flea market salvage punk',
      'fleamarketpunk',
      {
        aesthetic:
          'Fleamarketpunk: a world assembled from flea-market finds, with mismatched antique furniture, secondhand clothes, tangled lamps and haggling crowds.',
        subject_treatment:
          "Keep the prompt's subject and setting; rebuild its clothes, furniture and props from mismatched secondhand flea-market finds.",
        color_and_tone: 'Faded vintage colors, mustard, teal and rust with brass and dusty velvet.',
        lighting_and_shadow: 'Warm afternoon sun through market awnings and tangles of old lamps.',
        texture_and_material:
          'Chipped enamel, brass, velvet, old wood, cracked leather and tangled cords.',
        camera_and_composition:
          'Crowded stall compositions piled high with objects and haggling people.',
        atmosphere_and_mood: 'Curious, chatty and bargain-hunting, every object has a past life.',
        rendering_and_quality:
          'Densely detailed illustration with rich vintage textures and worn surfaces.',
        key_features: 'mismatched antiques; secondhand outfits; piled stalls; haggling crowds',
      },
      [
        'A flea market so enormous it has swallowed an entire abandoned airport, stalls piled on grounded planes, and a fortune teller haggling over a stuffed crocodile on the wing of a jumbo jet. No readable text or logo.',
        "A man tries to haggle for a single antique chair and walks away having somehow bought the entire stall, including the vendor's very old parrot. No readable text or logo.",
        'At closing time, a vendor dusts off a small music box, winds it once and listens alone as her empty stall fills with the soft melody. No readable text or logo.',
      ],
    ),
    punk(
      'Rooftoppunk',
      'rooftop DIY culture punk',
      'rooftoppunk',
      {
        aesthetic:
          'Rooftoppunk: the secret life of city rooftops, with pigeon coops, water-tower hideouts, rooftop gardens, string lights and parties above the traffic.',
        subject_treatment:
          "Keep the prompt's subject and setting; lift it onto crowded city rooftops with water towers, gardens, coops and skyline views.",
        color_and_tone:
          'Tar black and brick with sunset orange skies, plant greens and warm string lights.',
        lighting_and_shadow: 'Golden hour sun or evening string lights against a glowing skyline.',
        texture_and_material:
          'Tar paper, wooden water towers, chicken wire coops, potted plants and bricks.',
        camera_and_composition:
          'Rooftop scenes with the city spread out behind, figures near ledges.',
        atmosphere_and_mood: 'Free, secret and dreamy, a hidden village above the city.',
        rendering_and_quality:
          'Warm atmospheric illustration with detailed skyline depth and rooftop clutter.',
        key_features: 'water towers; pigeon coops; rooftop gardens; skyline string lights',
      },
      [
        'A rooftop pigeon keeper releases ten thousand birds at sunset over the city, the flock wheeling in a huge spiral around the water towers as neighbors on every roof look up in silence. No readable text or logo.',
        'A rooftop garden grows so well that a pumpkin rolls off the edge, and three floors down a startled businessman catches it perfectly. No readable text or logo.',
        'Two old friends sit on folding chairs inside an empty water tower at night, their feet dangling out the hatch above the glittering city. No readable text or logo.',
      ],
    ),
    punk(
      'Wheatpastepunk',
      'wheatpaste poster culture punk',
      'wheatpastepunk',
      {
        aesthetic:
          'Wheatpastepunk: walls built up from layers of wheatpasted paper posters, with peeling corners, torn edges, rain wrinkles and huge pasted portraits.',
        subject_treatment:
          "Keep the prompt's subject and setting; render it as huge wheatpasted paper art over layered peeling posters on city walls.",
        color_and_tone:
          'Paper cream and newsprint grey with faded poster colors and wet paste shine.',
        lighting_and_shadow:
          'Flat overcast light or harsh streetlight catching wrinkles and peeling edges.',
        texture_and_material:
          'Wrinkled paper, dried paste, torn poster layers, brick and plywood hoardings.',
        camera_and_composition:
          'Walls filled edge to edge with giant pasted images and layered fragments.',
        atmosphere_and_mood: 'Temporary and bold, art pasted up at night and gone by next week.',
        rendering_and_quality:
          'Tactile illustration with visible paper wrinkles and layered tears.',
        key_features: 'layered posters; peeling corners; paste wrinkles; giant pasted portraits',
      },
      [
        'A giant pasted-paper portrait of a sleeping giantess covers the entire side of a condemned building, and as the rain peels her away layer by layer an older face appears beneath. No readable text or logo.',
        'A wheatpaste artist pastes a life-size paper tiger on a wall, and a passing dog has spent the whole afternoon barking at it without backing down. No readable text or logo.',
        'On a wet night, a torn corner of an old poster flaps in the wind, revealing half of a smiling face underneath. No readable text or logo.',
      ],
    ),
    punk(
      'Breakpunk',
      'breakdance cypher punk',
      'breakpunk',
      {
        aesthetic:
          'Breakpunk: breakdance cyphers on cardboard mats, with freezes, windmills, headspins, boomboxes and circles of hyped crowds on concrete.',
        subject_treatment:
          "Keep the prompt's subject and setting; turn it into a dance cypher with dancers mid-freeze and spin on cardboard, surrounded by a crowd.",
        color_and_tone:
          'Concrete grey, cardboard brown and bright tracksuit colors with sunlit highlights.',
        lighting_and_shadow:
          'Bright street sun or sodium streetlight with strong shadows beneath dancers.',
        texture_and_material:
          'Flattened cardboard, concrete, nylon tracksuits, sneakers and boombox chrome.',
        camera_and_composition: 'Low circular compositions with a dancer at the center mid-move.',
        atmosphere_and_mood: 'Competitive, joyful and gravity-defying, battles decided by style.',
        rendering_and_quality: 'Dynamic illustration with frozen athletic poses and motion lines.',
        key_features: 'cardboard mats; freezes and spins; boomboxes; crowd circles',
      },
      [
        'A breakdancer spins on his head at the exact center of a traffic roundabout at rush hour, cars circling him like a crowd while a boombox strapped to a lamppost drives the beat. No readable text or logo.',
        'A grandmother challenges a crew of young breakers and wins the battle with one perfectly timed freeze while holding her handbag. No readable text or logo.',
        'Alone in an empty mall parking lot at night, a dancer practices windmills on a single piece of cardboard under one buzzing light. No readable text or logo.',
      ],
    ),
    punk(
      'Lowriderpunk',
      'lowrider car culture punk',
      'lowriderpunk',
      {
        aesthetic:
          'Lowriderpunk: handcrafted lowrider cars and bikes, with candy-paint flake, chrome wire wheels, hydraulic hops and murals painted on hoods and trunks.',
        subject_treatment:
          "Keep the prompt's subject and setting; build it into a custom lowrider world of candy paint, chrome, hydraulics and cruising streets.",
        color_and_tone:
          'Deep candy reds, purples and teals with chrome shine and warm sunset boulevards.',
        lighting_and_shadow:
          'Golden sunset reflections sliding across polished candy paint and chrome.',
        texture_and_material:
          'Metal-flake candy paint, chrome spokes, velvet upholstery, pinstriping and asphalt.',
        camera_and_composition: 'Low three-quarter views of cars, with some cars hopping mid-air.',
        atmosphere_and_mood: 'Proud, slow and dazzling, cruising low and slow as art.',
        rendering_and_quality: 'Glossy illustration with deep reflections and detailed chrome.',
        key_features: 'candy paint flake; chrome wire wheels; hydraulic hops; painted murals',
      },
      [
        'A candy-red lowrider hops so high at the neighborhood contest that it hangs in the air above the crowd at sunset, its chrome wheels spinning and the painted angel on its hood seeming to fly. No readable text or logo.',
        "A lowrider owner installs hydraulics on his grandmother's mobility scooter, and now she bounces proudly down the street to church every Sunday. No readable text or logo.",
        'At dusk, an old man slowly polishes the chrome of his lowrider in a quiet driveway, his reflection stretched across the deep purple paint. No readable text or logo.',
      ],
    ),
    punk(
      'Stickerbombpunk',
      'sticker bomb collage punk',
      'stickerbomb',
      {
        aesthetic:
          'Stickerbombpunk: every surface buried under overlapping stickers, with layered cartoon creatures, bold symbols, scuffed edges and die-cut shapes.',
        subject_treatment:
          "Keep the prompt's subject and setting; cover its surfaces in dense overlapping graphic stickers of creatures and symbols, without words.",
        color_and_tone:
          'Saturated sticker colors, bright primaries and neon accents with white die-cut borders.',
        lighting_and_shadow: 'Flat even light with slight gloss on vinyl sticker surfaces.',
        texture_and_material:
          'Glossy vinyl, peeling corners, scuffed paper stickers and die-cut white edges.',
        camera_and_composition: 'Dense all-over coverage with the underlying form still readable.',
        atmosphere_and_mood:
          'Chaotic, playful and loud, a surface that became a community collage.',
        rendering_and_quality: 'Crisp graphic illustration with dense layered sticker detail.',
        key_features: 'overlapping stickers; die-cut edges; cartoon creatures; peeling corners',
      },
      [
        'An entire subway train arrives completely buried in thousands of stickers of cartoon creatures, eyes and monsters, so dense it looks like a living beast of color screaming into the station. No readable text or logo.',
        'A man falls asleep on a park bench for five minutes and wakes up covered head to toe in stickers placed by a gang of giggling kids. No readable text or logo.',
        'On an old lamppost buried in stickers, one small peeling sticker of a smiling sun is the last bright thing on a grey rainy morning. No readable text or logo.',
      ],
    ),
  ] satisfies Create[],
};

export default spec;
