import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Occult, myth and gothic punks (part B): oracle, golem, gargoyle, masque, mirror, astrolabe and djinn cultures.
const AVOID = [
  ...STYLE_AVOID,
  'gore',
  'graphic wounds',
  'real religious leader likeness',
  'readable runes or scripture',
];

const punk = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'punk', 'occult'],
  dna: dna(fields),
  avoid: AVOID,
  briefs,
});

const spec: Spec = {
  pack: 'pack_15',
  category: '8. Occult, Myth & Gothic Punks',
  updates: {},
  creates: [
    punk(
      'Oraclepunk',
      'prophecy machine oracle punk',
      'oraclepunk',
      {
        aesthetic:
          'Oraclepunk: oracles who read the future through smoke, trance and strange machines, with vapor-filled temples, bronze tripods and seekers waiting in long lines.',
        subject_treatment:
          "Keep the prompt's subject and setting; bring in a veiled oracle, rising vapors, bronze tripods and anxious seekers.",
        color_and_tone:
          'Pale marble and bronze with drifting violet-grey smoke and warm brazier orange.',
        lighting_and_shadow: 'Brazier fire glowing through thick smoke, faces half hidden in haze.',
        texture_and_material:
          'Weathered marble, bronze tripods, laurel leaves, veils and curling vapor.',
        camera_and_composition:
          'Temple interiors with the oracle framed high in smoke above small seekers.',
        atmosphere_and_mood: 'Mysterious and tense, every answer arriving as a riddle.',
        rendering_and_quality:
          'Hazy atmospheric illustration with layered smoke and warm fire glow.',
        key_features: 'veiled oracle; rising vapors; bronze tripods; waiting seekers',
      },
      [
        'A veiled oracle on a bronze tripod above a volcanic fissure foretells the fall of an empire, and the smoke rising around her forms the shape of an army marching toward the kneeling king. No readable text or logo.',
        'A modern oracle with a prophecy machine gives a nervous man the answer to his deepest question, and the machine prints only a picture of a sandwich. No readable text or logo.',
        'After the last seeker leaves, the oracle lifts her veil and sips tea alone on the temple steps, smoke still drifting behind her. No readable text or logo.',
      ],
    ),
    punk(
      'Golempunk',
      'clay golem workshop punk',
      'golempunk',
      {
        aesthetic:
          'Golempunk: workshops where clay golems are sculpted and awakened, with giant clay bodies, glowing sigil hearts, potter wheels and river-mud foundries.',
        subject_treatment:
          "Keep the prompt's subject and setting; bring in massive handmade clay golems with glowing chest sigils and finger-marked surfaces.",
        color_and_tone:
          'Earthy terracotta, river-mud brown and ochre with a single glowing gold sigil light.',
        lighting_and_shadow: 'Warm workshop light and the golden glow from each golem chest.',
        texture_and_material:
          'Wet clay, fingerprints, cracked dry mud, kiln brick and wooden tools.',
        camera_and_composition:
          'Towering golems beside small human makers for strong scale contrast.',
        atmosphere_and_mood: 'Earthy, protective and heavy, strength made from the riverbank.',
        rendering_and_quality:
          'Tactile sculptural illustration with finger-marked clay and warm glow.',
        key_features: 'clay golems; glowing chest sigils; fingerprints in clay; potter workshops',
      },
      [
        'A clay golem the size of a hill rises from a riverbank to defend a small village from a flood, its glowing chest sigil lighting the storm as it holds back the water with both enormous arms. No readable text or logo.',
        'A sculptor accidentally awakens a clay golem while it is only half finished, and it wanders the workshop with one arm missing asking politely for the rest. No readable text or logo.',
        'An old potter presses her thumbprint into the chest of a tiny clay golem on her workbench, and a faint gold light flickers inside. No readable text or logo.',
      ],
    ),
    punk(
      'Gargoylepunk',
      'living gargoyle rooftop punk',
      'gargoylepunk',
      {
        aesthetic:
          'Gargoylepunk: stone gargoyles that wake at night and guard the city, with carved wings, rain-spout mouths, cathedral rooftops and moonlit patrols.',
        subject_treatment:
          "Keep the prompt's subject and setting; set it on gothic rooftops at night, with living stone gargoyles guarding or moving through it.",
        color_and_tone:
          'Weathered stone greys and moss greens under deep blue moonlight with warm window glows.',
        lighting_and_shadow: 'Cold moonlight and rain sheen on stone, warm city lights far below.',
        texture_and_material:
          'Weathered limestone, moss, lichen, rain-streaked stone and lead roofing.',
        camera_and_composition: 'Rooftop ledges with gargoyles perched high over the glowing city.',
        atmosphere_and_mood: 'Watchful, gruff and loyal, monsters that protect the sleeping.',
        rendering_and_quality: 'Moody textured illustration with moonlit stone and rain detail.',
        key_features: 'living gargoyles; cathedral rooftops; moonlit patrols; rain-streaked stone',
      },
      [
        'A hundred stone gargoyles tear themselves from a cathedral at midnight and fly out over the rain-soaked city to fight an enormous shadow crawling up the bell tower. No readable text or logo.',
        'A gargoyle sits on a rooftop and very grumpily watches a pigeon nesting on its head, too proud to admit it has grown fond of it. No readable text or logo.',
        'On a quiet roof ledge before dawn, a small gargoyle turns back to stone next to a sleeping child who climbed up to watch it. No readable text or logo.',
      ],
    ),
    punk(
      'Masquepunk',
      'occult masquerade punk',
      'masquepunk',
      {
        aesthetic:
          'Masquepunk: secret masquerades of hidden identities, with ornate masks, candlelit ballrooms, occult societies, feathers and glances behind porcelain faces.',
        subject_treatment:
          "Keep the prompt's subject and setting; turn it into a masked ball where every figure hides behind ornate masks and costumes.",
        color_and_tone:
          'Deep velvet black and gold with porcelain white masks and rich jewel accents.',
        lighting_and_shadow: 'Candelabra light glinting on masks and gilded mirrors in dark halls.',
        texture_and_material:
          'Porcelain, gold leaf, feathers, velvet, lace and polished marble floors.',
        camera_and_composition:
          'Crowded ballroom compositions with masked faces turned toward the viewer.',
        atmosphere_and_mood: 'Seductive, secretive and dangerous, nobody is who they seem.',
        rendering_and_quality: 'Opulent detailed illustration with glinting masks and candle glow.',
        key_features: 'ornate masks; candlelit ballrooms; hidden identities; gold and feathers',
      },
      [
        'At a secret masquerade in a sinking palace, every guest removes their porcelain mask at the stroke of midnight and beneath each mask is another mask, while the water rises across the marble floor. No readable text or logo.',
        'A man at a masquerade has worn the exact same mask as the host and they keep being mistaken for each other in increasingly awkward situations. No readable text or logo.',
        'After the ball, a single porcelain mask lies on the steps of an empty palace, a feather drifting slowly beside it at dawn. No readable text or logo.',
      ],
    ),
    punk(
      'Mirrorpunk',
      'occult mirror world punk',
      'mirrorpunk',
      {
        aesthetic:
          'Mirrorpunk: a culture obsessed with haunted mirrors, with silvered halls, cracked reflections, reflections that move on their own and doors into mirror worlds.',
        subject_treatment:
          "Keep the prompt's subject and setting; multiply and distort it through antique mirrors where reflections disagree with reality.",
        color_and_tone:
          'Tarnished silver, antique gold frames and cool grey-blue with deep black shadows.',
        lighting_and_shadow: 'Candle and moonlight bouncing endlessly between facing mirrors.',
        texture_and_material: 'Silvered glass, tarnish, cracks, gilded frames and dust sheets.',
        camera_and_composition:
          'Infinite mirror corridors and figures facing reflections that differ.',
        atmosphere_and_mood:
          'Uncanny and hypnotic, the fear that your reflection has its own plans.',
        rendering_and_quality:
          'Precise reflective illustration with layered mirror depth and tarnish.',
        key_features:
          'haunted mirrors; disagreeing reflections; infinite corridors; tarnished silver',
      },
      [
        'A queen walks down an endless hall of antique mirrors and every reflection of her turns to watch, until the last one steps out of the frame wearing her crown. No readable text or logo.',
        'A man brushing his teeth notices his reflection is brushing much more thoroughly than he is, and it gives him a very disappointed look. No readable text or logo.',
        'An old dust sheet slips off a mirror in an abandoned mansion, revealing a candlelit room full of people that is not behind the glass. No readable text or logo.',
      ],
    ),
    punk(
      'Astrolabepunk',
      'occult astronomy instrument punk',
      'astrolabepunk',
      {
        aesthetic:
          'Astrolabepunk: star-reading guilds with giant brass astrolabes, orreries, domed observatories and zodiac machines turning above candlelit scholars.',
        subject_treatment:
          "Keep the prompt's subject and setting; surround it with brass astrolabes, turning orreries and domed observatories under the stars.",
        color_and_tone: 'Polished brass and gold with deep midnight blue and pale starlight.',
        lighting_and_shadow: 'Starlight through open domes and candles glinting on brass rings.',
        texture_and_material:
          'Engraved brass rings, gears, glass lenses, star maps drawn as pictures only.',
        camera_and_composition:
          'Circular compositions with concentric rings and domes framing the sky.',
        atmosphere_and_mood: 'Wondrous and precise, the universe measured by candlelight.',
        rendering_and_quality:
          'Crisp detailed illustration with fine engraved brass and starlight.',
        key_features: 'giant astrolabes; turning orreries; observatory domes; brass rings',
      },
      [
        'A brass orrery as large as a cathedral slowly turns beneath an open observatory dome, and as its planets align the real stars above begin to move with it. No readable text or logo.',
        'An astronomer spends years building a perfect orrery and discovers he forgot one planet, which is now staring at him from the sky. No readable text or logo.',
        'A young astronomer sits alone on an observatory floor at night, turning a small brass astrolabe to find her way home. No readable text or logo.',
      ],
    ),
    punk(
      'Djinnpunk',
      'smoke spirit bargain punk',
      'djinnpunk',
      {
        aesthetic:
          'Djinnpunk: spirits of smoke and fire bound in brass lamps and bottles, with desert markets of sealed vessels, swirling smoke giants and dangerous bargains.',
        subject_treatment:
          "Keep the prompt's subject and setting; bring in a towering smoke spirit rising from a brass vessel, and the bargain it offers.",
        color_and_tone:
          'Brass gold and turquoise with swirling violet and ember-orange smoke over desert tones.',
        lighting_and_shadow:
          'Glowing ember light inside the smoke spirit lighting faces from above.',
        texture_and_material:
          'Hammered brass, glass bottles, silk rugs, desert sand and curling smoke.',
        camera_and_composition: 'Low angles with a huge smoke figure towering over small humans.',
        atmosphere_and_mood: 'Tempting and dangerous, every wish comes with a price.',
        rendering_and_quality: 'Glowing illustration with flowing smoke forms and brass detail.',
        key_features: 'brass lamps; smoke giants; sealed bottles; dangerous bargains',
      },
      [
        'A spirit of ember smoke rises from a cracked brass lamp in a desert market, towering above the rooftops as merchants flee and a young thief realizes she has just released something very old. No readable text or logo.',
        'A spirit freed from a bottle after a thousand years is disappointed to find its liberator only wants a better parking space. No readable text or logo.',
        'On a quiet market stall at night, a small sealed blue bottle glows faintly, a tiny smoke hand pressed against the inside of the glass. No readable text or logo.',
      ],
    ),
  ] satisfies Create[],
};

export default spec;
