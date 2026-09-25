import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Street, riot and DIY punks (part A): each punk is a hands-on street culture with its own tools and marks.
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
  updates: {
    'SP15-101': {
      briefs: [
        'A photocopied dragon made of torn xerox scraps and paste-over halftone blocks rips itself off a laundromat wall and roars across the street, its misregistered edges flapping like loose paper in the wind. No readable text or logo.',
        'A tiny grandmother runs an underground zine empire from her kitchen table, scissors, glue stick and a jammed copier surrounded by a crowd of tattooed teenagers waiting politely for the next issue. No readable text or logo.',
        "At three in the morning a lone copy-shop clerk watches the machine print page after page of the same grainy photo of a stranger's face, getting darker with every copy. No readable text or logo.",
      ],
    },
    'SP15-102': {
      briefs: [
        'A skater launches off the lip of an empty drained swimming pool at the top of a ruined luxury hotel, her board flipping against a storm sky while the whole crew screams from the cracked diving board. No readable text or logo.',
        'A very old man in a tweed suit and slippers casually grinds a handrail on his way to the pharmacy while a crowd of stunned young skaters drops their boards in disbelief. No readable text or logo.',
        'Under a highway bridge at dusk, a girl sits alone on her scuffed board repainting its underside with a small brush, a single streetlight buzzing overhead. No readable text or logo.',
      ],
    },
    'SP15-103': {
      briefs: [
        'A wall of modular synthesizers the size of a cathedral organ fills an abandoned power station, and a lone performer patches cables between towers as the rhythm makes the rusted turbines begin to turn again. No readable text or logo.',
        'A synth nerd tries to patch a modular rig into his houseplant and the fern starts producing aggressive techno, the cat fleeing the room in horror. No readable text or logo.',
        'In a small dark bedroom, one blinking oscillator light pulses slowly on a homemade synth while its builder sleeps with headphones still on. No readable text or logo.',
      ],
    },
    'SP15-104': {
      briefs: [
        'A gang of streetpunks in patched leather and tartan stands shoulder to shoulder on a rain-soaked bridge facing a line of armored riot shields, spikes gleaming in the orange streetlight before the first move. No readable text or logo.',
        'A towering mohawked punk with studded boots gently helps an old lady carry her groceries across a busy street, while she lectures him about the state of his jacket. No readable text or logo.',
        'Late at night on a bus stop bench, a streetpunk carefully sews a patch onto his worn jacket by the light of a flickering sign. No readable text or logo.',
      ],
    },
    'SP15-105': {
      briefs: [
        'A thousand dancers under UV light fill a flooded abandoned cathedral at dawn, laser bands tracing the ribs of the vault while the water around their knees glows electric green and violet. No readable text or logo.',
        'At a rave in a supermarket after closing, a security guard in reflective tape gives up and dances with a shopping cart among the glowing aisles. No readable text or logo.',
        'Outside after the rave, a single dancer sits on a curb at sunrise, her reflective jacket catching the first light as the music fades behind her. No readable text or logo.',
      ],
    },
    'SP15-106': {
      briefs: [
        'A caravan of crust punks rides a patched and hand-sewn freight train across a burning red desert, their denim covered in plain fabric patches and safety pins, dogs asleep on every car. No readable text or logo.',
        "A crust punk shows up to a fancy wedding in his most patched outfit, safety pins everywhere, and is somehow the best dancer, the bride's grandmother his biggest fan. No readable text or logo.",
        'Under a bridge, a crust punk sits by a small fire mending a torn jacket with uneven stitches while his old dog sleeps against his boots. No readable text or logo.',
      ],
    },
  },
  creates: [
    punk(
      'Squatpunk',
      'squatted building culture punk',
      'squatpunk',
      {
        aesthetic:
          'Squatpunk: abandoned buildings reclaimed by communities, with scrap barricades, communal kitchens, painted murals and rooms rebuilt from salvage.',
        subject_treatment:
          "Keep the prompt's subject and setting; move it into a reclaimed abandoned building full of salvaged furniture, murals and handmade repairs.",
        color_and_tone:
          'Faded concrete greys and brick red with bright hand-painted mural colors and warm lamps.',
        lighting_and_shadow:
          'Mixed light from broken windows, string lights and candles in dim rooms.',
        texture_and_material:
          'Cracked plaster, scrap wood, painted walls, mattresses, salvaged doors and plants.',
        camera_and_composition:
          'Busy interiors packed with people, handmade furniture and layered repairs.',
        atmosphere_and_mood:
          'Defiant, crowded and warm, a home built by people who refused to leave.',
        rendering_and_quality:
          'Richly cluttered illustration with layered textures and warm pockets of light.',
        key_features: 'reclaimed buildings; salvage furniture; murals; communal warmth',
      },
      [
        'Squatters in a crumbling grand opera house have turned the whole stage into a communal kitchen, feeding hundreds of neighbors under a cracked chandelier while bulldozers idle outside the doors at dawn. No readable text or logo.',
        'A squat collective holds a very formal committee meeting about whose turn it is to do the dishes, twenty people voting seriously around a table made from an old door. No readable text or logo.',
        'In a dark empty room of a reclaimed factory, a woman paints a small bright window of blue sky onto a bare concrete wall by candlelight. No readable text or logo.',
      ],
    ),
    punk(
      'Buskerpunk',
      'street performer culture punk',
      'buskerpunk',
      {
        aesthetic:
          'Buskerpunk: street performers turning every corner into a stage, with homemade instruments, one-man bands, fire tricks and open instrument cases.',
        subject_treatment:
          "Keep the prompt's subject and setting; turn it into a street performance with homemade instruments, props and a gathered crowd.",
        color_and_tone:
          'Warm street tones of brick and cobblestone with bright costume colors and brass shine.',
        lighting_and_shadow:
          'Golden evening light and streetlamps, with fire or lanterns lighting performers.',
        texture_and_material:
          'Worn brass, painted wood, patched costumes, cobblestones and coins in cases.',
        camera_and_composition:
          'Performers centered with circles of crowd around them on busy streets.',
        atmosphere_and_mood: 'Joyful, scrappy and magnetic, art for anyone walking past.',
        rendering_and_quality:
          'Lively illustration with warm light and expressive performer poses.',
        key_features: 'one-man bands; homemade instruments; street crowds; open cases',
      },
      [
        'A one-man band with a drum on his back, cymbals on his knees and a tuba made of plumbing pipes leads a whole city square into a chaotic dance during a thunderstorm, nobody willing to stop. No readable text or logo.',
        'A street mime performing being trapped in an invisible box suddenly discovers the box is real, and the crowd applauds wildly while he quietly panics. No readable text or logo.',
        'In an empty subway corridor late at night, an old violinist plays for no one, his open case holding only a single coin and a paper flower. No readable text or logo.',
      ],
    ),
    punk(
      'Stencilpunk',
      'layered spray stencil punk',
      'stencilpunk',
      {
        aesthetic:
          'Stencilpunk: everything built from layered spray stencils, with crisp cut edges, overspray halos, two- or three-color layers and bridges left in the cut shapes.',
        subject_treatment:
          "Keep the prompt's subject and setting; render it as layered spray-stencil shapes with cut bridges and overspray on walls.",
        color_and_tone:
          'Limited palettes of black, one bright color and a mid tone on concrete or brick.',
        lighting_and_shadow:
          'Light and shadow expressed only as flat stencil layers, no smooth gradients.',
        texture_and_material:
          'Spray paint overspray, drips, concrete, brick and cut card stencil edges.',
        camera_and_composition:
          'Bold graphic silhouettes placed on real walls with strong negative space.',
        atmosphere_and_mood:
          'Quick, clever and rebellious, an image made in minutes before anyone notices.',
        rendering_and_quality:
          'Crisp flat layered stencil illustration with visible overspray and drips.',
        key_features: 'cut stencil layers; overspray halos; stencil bridges; limited palette',
      },
      [
        'A three-layer spray stencil of a giant whale swimming up the side of a gray office tower, its overspray halo catching the dawn light as the first commuters stop and stare upward. No readable text or logo.',
        'A stencil artist sprays a perfect silhouette of a police officer on a wall, and the real officer standing next to it strikes the exact same pose, both looking equally unimpressed. No readable text or logo.',
        'On a quiet alley wall, a small black stencil of a girl letting go of a balloon drips slightly in the rain. No readable text or logo.',
      ],
    ),
    punk(
      'Protestpunk',
      'giant puppet protest parade punk',
      'protestpunk',
      {
        aesthetic:
          'Protestpunk: street marches led by giant handmade puppets, papier-mache effigies, drum lines and cardboard costumes towering over the crowds.',
        subject_treatment:
          "Keep the prompt's subject and setting; turn it into a street march led by huge handmade puppets and papier-mache figures, with blank banners.",
        color_and_tone:
          'Bright painted papier-mache colors, cardboard brown and street grey with bold primary accents.',
        lighting_and_shadow: 'Bright daylight or orange streetlight on the rising puppet heads.',
        texture_and_material:
          'Papier-mache, painted cardboard, bamboo poles, cloth, drumskins and paint.',
        camera_and_composition:
          'Low angles with puppets towering above packed crowds in narrow streets.',
        atmosphere_and_mood: 'Loud, hopeful and theatrical, protest as a huge homemade festival.',
        rendering_and_quality:
          'Vivid energetic illustration with handmade textures and dynamic crowds.',
        key_features: 'giant puppets; papier-mache effigies; drum lines; blank banners',
      },
      [
        'A papier-mache giant twelve meters tall with painted cardboard hands lumbers down a flooded avenue at the head of a march, a thousand drummers behind it and blank banners rippling in the wind. No readable text or logo.',
        'The giant protest puppet gets stuck under a bridge and forty people in cardboard costumes argue furiously about how to fold its enormous nose. No readable text or logo.',
        'After the march, an exhausted puppeteer sleeps in an empty square beside the huge papier-mache head, its painted eyes looking up at the stars. No readable text or logo.',
      ],
    ),
    punk(
      'Courierpunk',
      'bike messenger culture punk',
      'courierpunk',
      {
        aesthetic:
          'Courierpunk: fearless bike messengers of the city, with fixed-gear bikes, huge messenger bags, radio headsets and death-defying traffic runs.',
        subject_treatment:
          "Keep the prompt's subject and setting; turn it into a high-speed bike courier run through dense traffic and city streets.",
        color_and_tone:
          'Grimy city greys and taxi yellow with bright jersey colors and red tail lights.',
        lighting_and_shadow:
          'Harsh daylight between towers or streaked headlights and tail lights at night.',
        texture_and_material:
          'Worn bike frames, bag canvas, rain-slick asphalt, chains and scuffed helmets.',
        camera_and_composition: 'Low fast angles with motion blur, weaving between cars and buses.',
        atmosphere_and_mood: 'Reckless, proud and fast, the city as a racetrack.',
        rendering_and_quality: 'Dynamic illustration with speed streaks and gritty street texture.',
        key_features: 'fixed-gear bikes; messenger bags; traffic weaving; speed streaks',
      },
      [
        'A bike messenger races a collapsing wave of falling scaffolding down a narrow city street, weaving between frozen taxis with a single urgent parcel strapped to her back and debris raining behind her. No readable text or logo.',
        'A courier delivers a wedding cake by fixed-gear bike through rush hour traffic, the cake perfectly intact while the courier is covered head to toe in icing. No readable text or logo.',
        'At midnight in the rain, a lone courier rests against a lamppost eating noodles from a box, her bike leaning beside her and steam rising into the cold. No readable text or logo.',
      ],
    ),
    punk(
      'Garagepunk',
      'garage band and workshop punk',
      'garagepunk',
      {
        aesthetic:
          'Garagepunk: suburban garages turned into band rehearsal rooms and workshops, with egg-carton walls, secondhand amps, car parts and oil-stained floors.',
        subject_treatment:
          "Keep the prompt's subject and setting; move it into a cluttered garage full of amps, tools, cables and half-fixed machines.",
        color_and_tone:
          'Oily concrete grey, faded wood and dusty tones with warm bulb light and red amp glow.',
        lighting_and_shadow:
          'Bare bulbs and sunlight through a half-open garage door, strong shadows.',
        texture_and_material:
          'Egg-carton foam, worn amps, cables, workbench tools, car parts and oil stains.',
        camera_and_composition: 'Cramped interiors with a band and clutter crowding every corner.',
        atmosphere_and_mood: 'Loud, amateur and joyful, noise made with whatever is lying around.',
        rendering_and_quality: 'Warm gritty illustration with cluttered detail and bulb glow.',
        key_features: 'egg-carton walls; secondhand amps; half-open door; workshop clutter',
      },
      [
        'A garage band plays so loud that the half-restored muscle car on the lift starts by itself and drives out through the garage door into the suburban night, the band still playing on its roof. No readable text or logo.',
        'A dad tries to park his car in the garage and finds a full four-piece band, a drum kit and a sleeping bass player occupying every inch. No readable text or logo.',
        'After everyone leaves, a teenage drummer sits alone on an upturned bucket in the garage, tapping softly on a snare under a single swinging bulb. No readable text or logo.',
      ],
    ),
    punk(
      'Hardcorepunk',
      'basement hardcore show punk',
      'hardcorepunk',
      {
        aesthetic:
          'Hardcorepunk: sweaty basement and hall shows, with stage-diving bodies, packed crowds, low ceilings, harsh flash light and raw black-and-white energy.',
        subject_treatment:
          "Keep the prompt's subject and setting; turn it into an explosive packed show, with bodies flying, low ceilings and harsh flash light.",
        color_and_tone:
          'High-contrast black and white or near-mono with flashes of sweaty skin tone and red.',
        lighting_and_shadow: 'Harsh direct flash freezing motion against deep black backgrounds.',
        texture_and_material:
          'Sweat, denim, basement brick, low pipes, cables and grainy flash photo texture.',
        camera_and_composition:
          'Wide-angle crowd-level shots with bodies mid-air and fists in the frame.',
        atmosphere_and_mood: 'Explosive, cathartic and communal, total energy in a tiny room.',
        rendering_and_quality: 'Grainy high-contrast rendering with frozen motion and deep blacks.',
        key_features: 'stage dives; harsh flash; packed basements; frozen motion',
      },
      [
        'A singer stage-dives from the top of a speaker stack in a tiny basement, frozen mid-air by the flash above a sea of reaching hands, the low ceiling pipes dripping sweat onto the crowd. No readable text or logo.',
        'A polite librarian in a cardigan accidentally walks into a hardcore show and within minutes is crowd-surfing across the room, glasses still perfectly on her nose. No readable text or logo.',
        'After the show, the empty basement floor is covered in sweat and scattered shoes, one amplifier still humming under a bare bulb. No readable text or logo.',
      ],
    ),
  ] satisfies Create[],
};

export default spec;
