import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Media, vapor and glitch punks (part A): each punk turns one media device or format into a whole culture.
const AVOID = [
  ...STYLE_AVOID,
  'real brand or company logo',
  'readable interface text or numerals',
  'real celebrity likeness',
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
  tags: [tag, 'punk', 'media'],
  dna: dna(fields),
  avoid: AVOID,
  briefs,
});

const spec: Spec = {
  pack: 'pack_15',
  category: '7. Media, Vapor & Glitch Punks',
  updates: {
    'SP15-107': {
      briefs: [
        'A marble statue of a forgotten sea god rises from a pastel checkerboard ocean at sunset, chrome-trimmed dolphins circling its knees while soft cathode halos glow around a colossal floating seashell. No readable text or logo.',
        'A tired office worker falls asleep at his desk and wakes up floating on an inflatable flamingo in a pastel mall fountain, still holding his coffee and a stapler. No readable text or logo.',
        'In an empty pastel shopping mall at closing time, a single escalator keeps moving slowly under pink and teal lights, carrying nobody at all. No readable text or logo.',
      ],
    },
    'SP15-108': {
      briefs: [
        'A starship bridge built entirely from chunky beige cassette-futurist consoles hums in the dark as the crew slams sliders and paired reels spin, a vast alien planet filling the round viewport ahead. No readable text or logo.',
        'An engineer tries to fix the spaceship computer by rewinding its giant cassette reel with a pencil, the entire crew watching in tense silence. No readable text or logo.',
        'Alone in a dim research station, a scientist listens to a recording of rain on a chunky cassette player, its tiny reels turning in the lamplight. No readable text or logo.',
      ],
    },
    'SP15-109': {
      briefs: [
        'Pirate broadcasters hijack every screen in a dark city at once, phosphor lines crawling across the skyscrapers as a masked figure appears in color bars on a thousand televisions in a thousand windows. No readable text or logo.',
        'A pirate TV crew broadcasting from a rooftop has to keep adjusting their giant antenna whenever a pigeon lands on it, one crew member dedicated only to shooing birds. No readable text or logo.',
        'Late at night, an old man falls asleep in front of a flickering television as a strange pirate signal quietly shows the stars above his own house. No readable text or logo.',
      ],
    },
    'SP15-110': {
      briefs: [
        'A knight in shining armor charges across a perfect green field as the world around him begins to glitch into displaced RGB blocks, his horse tearing apart into compression pixels at the edges but still galloping. No readable text or logo.',
        'A man at a family dinner glitches halfway out of existence, his top half displaced into RGB blocks, while his mother calmly keeps passing the potatoes. No readable text or logo.',
        'A quiet portrait of a woman looking out a rainy window slowly breaks into small clipped pixel clusters only where her tears are falling. No readable text or logo.',
      ],
    },
  },
  creates: [
    punk(
      'Filmpunk',
      'celluloid projection culture punk',
      'filmpunk',
      {
        aesthetic:
          'Filmpunk: a culture built around physical celluloid, with projection booths, film strips hung like laundry, splicing benches and beams of light through dust.',
        subject_treatment:
          "Keep the prompt's subject and setting; surround it with reels, hanging film strips, projectors and projected beams of light.",
        color_and_tone:
          'Warm amber projector light, deep cinema reds and blacks with sepia celluloid tones.',
        lighting_and_shadow: 'A single bright projector beam cutting through dusty darkness.',
        texture_and_material:
          'Celluloid strips, metal reels, brass projectors, velvet seats, floating dust.',
        camera_and_composition:
          'Dark rooms crossed by beams, with film strips looping through the frame.',
        atmosphere_and_mood:
          'Romantic, flickering and nostalgic, dreams made of light and plastic.',
        rendering_and_quality:
          'Warm cinematic illustration with light beams and fine dust particles.',
        key_features: 'projector beams; hanging film strips; splicing benches; floating dust',
      },
      [
        'A projectionist in a burning old cinema keeps the reel running as flames climb the velvet curtains, the audience frozen in the beam watching a silent film of the same cinema burning. No readable text or logo.',
        'A film editor hangs miles of film strips across her apartment to dry, and her cat is hopelessly tangled in the final cut of a masterpiece. No readable text or logo.',
        'In an empty projection booth, an old projectionist holds a single frame of film up to the light, a small smiling face glowing between his fingers. No readable text or logo.',
      ],
    ),
    punk(
      'Camcorderpunk',
      'home video camcorder punk',
      'camcorder',
      {
        aesthetic:
          'Camcorderpunk: the world through a 1990s home camcorder, with shaky handheld framing, soft video blur, blown highlights, tape tracking lines and family-event chaos.',
        subject_treatment:
          "Keep the prompt's subject and setting; show it as handheld home video footage, shaky, softly blurred and badly exposed.",
        color_and_tone:
          'Oversaturated warm video colors, blown whites and muddy shadows with slight color bleed.',
        lighting_and_shadow: 'Harsh on-camera light or blown window light, flat and unflattering.',
        texture_and_material:
          'Video noise, tracking lines, soft focus, chromatic bleed and interlace texture.',
        camera_and_composition:
          'Tilted handheld framing, awkward zooms and subjects half out of frame.',
        atmosphere_and_mood:
          'Chaotic, intimate and funny, memories nobody meant to make beautiful.',
        rendering_and_quality:
          'Authentic low-resolution video rendering with noise, bleed and tracking lines.',
        key_features: 'shaky handheld framing; tracking lines; blown highlights; color bleed',
      },
      [
        'Shaky camcorder footage of a family barbecue in the backyard as a colossal shadow blots out the sun, uncle still flipping burgers while the camera tilts slowly up toward something enormous in the sky. No readable text or logo.',
        "Home video of a dad trying to film his daughter's first bike ride, running beside her, until he trips over the dog and the camera spins wildly into the hedge. No readable text or logo.",
        'Soft, blurry camcorder footage of an empty childhood bedroom at dusk, a single night light glowing, the tape hissing quietly. No readable text or logo.',
      ],
    ),
    punk(
      'Dialuppunk',
      'early internet dial-up punk',
      'dialuppunk',
      {
        aesthetic:
          'Dialuppunk: the early home internet, with beige tower computers, glowing modem lights, tangled phone cords, clunky 3D avatars and bedrooms lit by a single monitor.',
        subject_treatment:
          "Keep the prompt's subject and setting; surround it with beige computers, modems, phone cords and early low-poly virtual worlds.",
        color_and_tone:
          'Beige plastic, CRT blue glow and dark bedrooms with bright primary low-poly colors.',
        lighting_and_shadow: 'Faces lit only by a blue monitor glow and small green modem lights.',
        texture_and_material:
          'Beige plastic, coiled phone cords, keyboard grime, low-poly shapes and dithering.',
        camera_and_composition: 'Cramped bedroom desks at night and chunky early virtual spaces.',
        atmosphere_and_mood:
          'Lonely, curious and exciting, the first time the whole world connected.',
        rendering_and_quality:
          'Nostalgic illustration mixing warm room detail with dithered low-poly worlds.',
        key_features: 'beige towers; modem lights; tangled cords; low-poly avatars',
      },
      [
        'A teenager in a dark bedroom connects to the early internet and a vast low-poly world unfolds out of her monitor into the room, blocky castles and floating avatars filling the space above her bed. No readable text or logo.',
        'A whole family freezes in horror as grandma picks up the phone and cuts off the dial-up connection in the middle of the most important download of the decade. No readable text or logo.',
        'At three in the morning, a boy chats with a stranger on the other side of the world, the blue monitor glow the only light in his sleeping house. No readable text or logo.',
      ],
    ),
    punk(
      'Teletextpunk',
      'chunky mosaic broadcast page punk',
      'teletextpunk',
      {
        aesthetic:
          'Teletextpunk: everything built from chunky blocky mosaic graphics of old broadcast pages, with eight flat colors, stepped edges and black backgrounds.',
        subject_treatment:
          "Keep the prompt's subject and setting; reduce it to coarse block mosaic shapes of eight flat colors on black, without letters.",
        color_and_tone:
          'Pure black backgrounds with saturated red, green, yellow, blue, magenta, cyan and white blocks.',
        lighting_and_shadow: 'Flat screen glow with no shading, only solid mosaic cells.',
        texture_and_material:
          'Coarse rectangular mosaic cells, stepped diagonals and slight screen glow.',
        camera_and_composition:
          'Flat centered page-like compositions made entirely of large blocks.',
        atmosphere_and_mood: 'Charming, crude and futuristic, a past idea of the digital future.',
        rendering_and_quality: 'Strict coarse mosaic rendering with solid cells and glowing edges.',
        key_features: 'coarse mosaic cells; eight flat colors; black background; stepped edges',
      },
      [
        'A dragon made of chunky blocky mosaic cells breathes stepped red and yellow fire over a castle drawn from only eight colors, the whole epic battle glowing on a black screen in a dark room. No readable text or logo.',
        'A weather presenter made entirely of crude mosaic blocks points proudly at a blocky map where every single region shows the same smiling yellow sun. No readable text or logo.',
        'A blocky mosaic moon hangs over a stepped black sea, one small white block of a boat drifting beneath it. No readable text or logo.',
      ],
    ),
    punk(
      'Y2Kpunk',
      'millennium chrome future punk',
      'y2kpunk',
      {
        aesthetic:
          'Y2Kpunk: the millennium future, with liquid chrome blobs, translucent candy-colored plastics, inflatable furniture, bubble shapes and glossy techno optimism.',
        subject_treatment:
          "Keep the prompt's subject and setting; restyle it with liquid chrome, translucent candy plastic and bubbly inflatable shapes.",
        color_and_tone:
          'Iridescent silver, icy blue, candy pink and lime with translucent tints and bright white.',
        lighting_and_shadow:
          'Glossy studio light with bright specular reflections on chrome and plastic.',
        texture_and_material:
          'Liquid chrome, translucent colored plastic, inflatable vinyl and holographic sheen.',
        camera_and_composition:
          'Glossy centered hero shots and wide-angle distortion with bubbly shapes.',
        atmosphere_and_mood: 'Optimistic, shiny and hyper, the future as a glossy toy.',
        rendering_and_quality:
          'High-gloss CGI-like rendering with clean reflections and bubbly forms.',
        key_features: 'liquid chrome; translucent plastic; inflatable furniture; bubble shapes',
      },
      [
        'A giant liquid chrome wave rises over a city of translucent candy-colored towers at the stroke of midnight on the millennium, reflecting fireworks as millions of people in silver jackets look up. No readable text or logo.',
        'A man sits on an inflatable translucent armchair that slowly deflates during an important job interview, lowering him inch by inch below the desk. No readable text or logo.',
        'A girl lies in a bubble-shaped translucent pod bed, watching the light through the tinted plastic turn her room icy blue at dawn. No readable text or logo.',
      ],
    ),
    punk(
      'Idolpunk',
      'manufactured pop idol media punk',
      'idolpunk',
      {
        aesthetic:
          'Idolpunk: an original pop-idol machine, with holographic stages, glowing fan lightsticks, sparkling costumes and a factory-like media world behind the glamour.',
        subject_treatment:
          "Keep the prompt's subject and setting; turn it into a glittering idol performance with holographic stages, lightsticks and a media machine behind it.",
        color_and_tone:
          'Candy pastels and sparkling whites with seas of colored lightsticks in darkness.',
        lighting_and_shadow: 'Blazing stage spotlights and glowing crowds against dark arenas.',
        texture_and_material:
          'Sequins, glitter, holographic foil, stage smoke and glossy plastic sticks.',
        camera_and_composition:
          'Performers centered on huge stages with oceans of fan lights below.',
        atmosphere_and_mood: 'Dazzling and slightly uneasy, joy manufactured at industrial scale.',
        rendering_and_quality: 'Glossy sparkling illustration with bright stage light and glitter.',
        key_features: 'holographic stages; seas of lightsticks; sequin costumes; media machine',
      },
      [
        'An original idol group performs on a stage floating above a stadium of a hundred thousand glowing lightsticks, while backstage a vast factory of identical costumes and smiling masks runs on conveyor belts. No readable text or logo.',
        'An idol trying to keep a perfect smile during a concert while a moth lands on her nose and the entire front row panics on her behalf. No readable text or logo.',
        'After the concert, a young idol sits alone in an empty dressing room, removing sparkling makeup under harsh mirror lights. No readable text or logo.',
      ],
    ),
    punk(
      'Faxpunk',
      'thermal fax paper punk',
      'faxpunk',
      {
        aesthetic:
          'Faxpunk: a world transmitted by fax, with curling thermal paper, streaky grey scan lines, crushed contrast and endless paper spilling from machines.',
        subject_treatment:
          "Keep the prompt's subject and setting; render it as a streaky fax transmission on curling thermal paper, spilling from a machine.",
        color_and_tone:
          'Faded grey and black on warm thermal paper white, with fading brown edges.',
        lighting_and_shadow:
          'Harsh office fluorescent light with crushed fax contrast in the image itself.',
        texture_and_material:
          'Curling thermal paper, streaky horizontal scan lines, toner speckle and grain.',
        camera_and_composition:
          'Images emerging line by line from machines, paper piling on office floors.',
        atmosphere_and_mood: 'Urgent and bureaucratic, messages from far away arriving slowly.',
        rendering_and_quality:
          'Low-fidelity fax rendering with streaks, speckle and crushed tones.',
        key_features: 'curling thermal paper; scan streaks; crushed contrast; spilling paper',
      },
      [
        'A fax machine in an abandoned embassy suddenly begins printing an endless streaky image of a vast approaching fleet, the curling thermal paper spilling down the stairs and out into the empty street. No readable text or logo.',
        'An office worker tries to fax a sandwich to a colleague and the machine starts printing grainy greyscale pictures of it, meter after meter. No readable text or logo.',
        "A faded fax of a child's drawing of a house curls on an old desk in the evening light, slowly disappearing as the thermal paper fades. No readable text or logo.",
      ],
    ),
    punk(
      'Microfichepunk',
      'microfiche archive punk',
      'microfichepunk',
      {
        aesthetic:
          'Microfichepunk: forgotten archives read through glowing microfiche machines, with tiny film cards, magnified grainy photographs and endless cabinets of drawers.',
        subject_treatment:
          "Keep the prompt's subject and setting; show it as a grainy magnified photograph glowing on a microfiche reader in a dim archive.",
        color_and_tone:
          'Negative-like greys, ghostly whites and sickly green reader glow in dark archive rooms.',
        lighting_and_shadow:
          'The reader screen as the main light, lighting faces and dusty drawers.',
        texture_and_material:
          'Grainy magnified film, scratches, steel cabinets, dusty drawers and cards.',
        camera_and_composition: 'Close views of glowing screens and long rows of archive cabinets.',
        atmosphere_and_mood: 'Obsessive and eerie, secrets hidden in tiny squares of film.',
        rendering_and_quality: 'Grainy low-key rendering with scratched magnified film texture.',
        key_features: 'glowing reader screens; magnified grain; archive drawers; film scratches',
      },
      [
        'A researcher scrolls through a microfiche archive and finds a grainy magnified photograph of herself standing in this same archive a hundred years ago, the green glow lighting her shocked face. No readable text or logo.',
        'A bored archivist uses a microfiche reader to magnify a tiny photo of her cat, who is now glowing enormous on the wall behind her. No readable text or logo.',
        'In a vast dark archive, one reader glows green on an empty desk, a scratched photograph of an old seaside town still on its screen. No readable text or logo.',
      ],
    ),
  ] satisfies Create[],
};

export default spec;
