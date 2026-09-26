import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Psychological horror art directions: the four referenced directions keep their DNA and get
// original briefs that do not restage their games; sixteen new directions with original names
// build dread from ordinary places, materials and light instead of monsters or gore.
const HORROR_AVOID = ['gore', 'graphic wounds', 'jump-scare monster close-up', 'franchise creature design'];
const dir = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  avoid: string[],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'art-direction', 'psychological-horror'],
  dna: dna(fields),
  avoid: [...avoid, ...HORROR_AVOID, ...STYLE_AVOID],
  briefs,
});

const spec: Spec = {
  pack: 'pack_24',
  category: '1. Psychological Horror Aesthetics',
  updates: {
    'SP24-001': {
      briefs: [
        'A bride in a pale kimono walks through a mountain village where camellias have burst out of every wall and window, petals pooling on the stone steps like something spilled. No readable text or logo.',
        'A schoolteacher sweeps a wooden classroom at dusk while red spider lilies slowly push up through the floorboards around her broom. No readable text or logo.',
        'An empty shrine gate stands in rice fields at twilight, wrapped so thickly in blooming vines that the path behind it has disappeared. No readable text or logo.',
      ],
    },
    'SP24-002': {
      briefs: [
        'A man sits on the edge of an unmade motel bed holding a crumpled envelope, the room around him dissolving into sickly green haze beyond one sharp lamp. No readable text or logo.',
        'A woman stands at a lake shore at dawn where the water is perfectly still and the far bank has simply faded away into dirty cream fog. No readable text or logo.',
        'A long apartment corridor recedes into darkness, one door slightly ajar and a single pale amber light leaking from it across the stained carpet. No readable text or logo.',
      ],
    },
    'SP24-003': {
      briefs: [
        'A soaked visitor stops in the doorway of a derelict hospital lobby, rain dripping from the collapsed ceiling onto rows of empty waiting chairs. No readable text or logo.',
        'A woman in a raincoat stands in a flooded underpass, her flashlight beam catching nothing but drifting rain and a single wet shoe on the concrete. No readable text or logo.',
        'An empty laundromat glows at night through heavy fog, every machine door open and one still slowly turning. No readable text or logo.',
      ],
    },
    'SP24-004': {
      briefs: [
        'A tenant presses his ear to his own apartment wall and finds the wallpaper warm and faintly pulsing like skin. No readable text or logo.',
        'A small apartment seen through the peephole of its own front door looks slightly different each time, the chair moved an inch closer. No readable text or logo.',
        'A bathroom wall has grown a round hole in the night, and beyond it lies a dark corridor that should not fit inside the building. No readable text or logo.',
      ],
    },
  },
  creates: [
    dir(
      'Clinical Pastel Unease',
      'sterile pastel institution dread',
      'clinical-pastel',
      {
        aesthetic:
          'Clinical pastel unease: soft mint, pale pink and hospital cream spaces lit by humming fluorescents, where calm institutional order hides something quietly wrong.',
        subject_treatment:
          "Place the prompt's subject in a clean pastel institutional space, keeping it clear while one small detail sits wrong in the orderly scene.",
        color_and_tone:
          'Mint green, pale pink, cream and chrome with sickly fluorescent tints and very little shadow contrast.',
        lighting_and_shadow:
          'Flat overhead fluorescent light, faint flicker and pale shadows directly beneath objects.',
        texture_and_material:
          'Glossy vinyl floors, painted metal, laminated surfaces and crisp linen with faint stains.',
        camera_and_composition:
          'Symmetrical corridors and rooms with long vanishing points and too much empty floor.',
        atmosphere_and_mood: 'Calm on the surface, deeply unsettling underneath, a clean nightmare.',
        rendering_and_quality:
          'Smooth clean painterly rendering with precise edges and subdued detail.',
        key_features: 'pastel institutional palette; humming fluorescents; symmetry; one wrong detail',
      },
      ['warm cozy lighting', 'high contrast shadows'],
      [
        'A nurse pushes an empty wheelchair down a mint-green corridor that has twice as many doors as it did this morning. No readable text or logo.',
        'A dentist waiting room in pale pink sits completely empty except for one potted plant that has turned to face the door. No readable text or logo.',
        'A patient in a cream gown sits on a perfectly made bed, her reflection in the window sitting on a bed that is unmade. No readable text or logo.',
      ],
    ),
    dir(
      'Tape-Worn Living Room',
      'degraded home video dread',
      'tape-worn',
      {
        aesthetic:
          'Tape-worn living room: ordinary family interiors seen as if through a worn home videotape, with color bleed, soft smear and wrongness hiding in the noise.',
        subject_treatment:
          "Show the prompt's subject in a domestic interior as a worn tape frame, keeping it readable through smear while something uncanny hides in the noise.",
        color_and_tone:
          'Faded browns and oranges, oversaturated reds, bleeding chroma and washed-out highlights.',
        lighting_and_shadow:
          'Harsh on-camera lamp light, blown highlights and murky crushed shadows in the corners.',
        texture_and_material:
          'Tape noise, horizontal tracking lines, soft smear, wood paneling, shag carpet and patterned sofas.',
        camera_and_composition:
          'Handheld home-video framing, slightly tilted, with doorways and dark hallways at the edges.',
        atmosphere_and_mood: 'Nostalgic and wrong, a family memory that should not exist.',
        rendering_and_quality:
          'Degraded analog video look with believable smear and noise, never clean digital.',
        key_features: 'tape noise and tracking lines; chroma bleed; wood-paneled rooms; hidden wrongness',
      },
      ['clean digital sharpness', 'modern interior design'],
      [
        'A family watches television in a wood-paneled den while, in the dark hallway behind them, a figure stands too tall for the doorframe. No readable text or logo.',
        'A birthday cake glows in a dim kitchen and every guest has turned to look at the camera in the exact same instant. No readable text or logo.',
        'A rocking chair moves by itself in an empty living room while tracking lines roll slowly through it. No readable text or logo.',
      ],
    ),
    dir(
      'Flooded Memory Rooms',
      'half-submerged interior dread',
      'flooded-rooms',
      {
        aesthetic:
          'Flooded memory rooms: familiar interiors half filled with still dark water, furniture drowning quietly while mirrors of the room float on the surface.',
        subject_treatment:
          "Put the prompt's subject inside a half-flooded room, keeping it clear above or just beneath the still water line.",
        color_and_tone:
          'Murky teal water, warm drowned lamplight and pale floating objects against dark depths.',
        lighting_and_shadow:
          'Dim light reflected and doubled by the water surface, with dark shadow below the waterline.',
        texture_and_material:
          'Still glossy water, floating paper and petals, soaked wallpaper and sunken furniture.',
        camera_and_composition:
          'Eye level near the waterline, room and reflection mirrored in the frame.',
        atmosphere_and_mood: 'Silent, mournful and suffocating, a memory drowning slowly.',
        rendering_and_quality:
          'Painterly realism with precise reflections and soft underwater blur.',
        key_features: 'half-flooded interiors; mirrored waterline; floating objects; drowned lamplight',
      },
      ['splashing action', 'bright tropical water'],
      [
        'A grandmother sits in her armchair reading while the dark water in her living room rises silently to her knees. No readable text or logo.',
        'A child-sized piano plays itself underwater in a flooded nursery, its reflection on the surface keys pressed in reverse. No readable text or logo.',
        'A dinner table is set for six in a flooded dining room, the candles still burning just above the black water. No readable text or logo.',
      ],
    ),
    dir(
      'Wrong-Face Family Portraits',
      'uncanny formal portrait dread',
      'wrong-face',
      {
        aesthetic:
          'Wrong-face family portraits: formal studio portraits painted with perfect poise, except that faces are subtly too smooth, too still or slightly misplaced.',
        subject_treatment:
          "Render the prompt's subject as a formal posed portrait, keeping clothing and pose precise while the face is calm but subtly wrong.",
        color_and_tone:
          'Muted studio browns, sepia and dusty rose with porcelain-pale skin tones.',
        lighting_and_shadow:
          'Soft old studio light from one side, smooth gradients and a dark mottled backdrop.',
        texture_and_material:
          'Painted canvas backdrop, lace collars, velvet chairs and slightly glossy varnish.',
        camera_and_composition:
          'Centered frontal posed portrait with figures arranged stiffly in rows.',
        atmosphere_and_mood: 'Polite, formal and deeply unnerving, a family that is not quite right.',
        rendering_and_quality:
          'Careful academic portrait painting with smooth finish and subtle distortions.',
        key_features: 'formal posed portraits; subtly wrong faces; studio backdrop; stiff symmetry',
      },
      ['gore', 'monster faces', 'cartoon exaggeration'],
      [
        'A family of five poses in their Sunday best, and every member has exactly the same small smile, including the dog. No readable text or logo.',
        'A married couple sits for a portrait, the husband\'s eyes painted slightly too far apart as if the painter hesitated. No readable text or logo.',
        'An old woman poses beside an empty velvet chair, one gloved hand resting on the shoulder of no one. No readable text or logo.',
      ],
    ),
    dir(
      'Melting Wax Shrine',
      'candle altar dread',
      'wax-shrine',
      {
        aesthetic:
          'Melting wax shrine: cramped altars heaped with candles that have burned for years, wax pouring over photographs, flowers and trinkets in frozen waterfalls.',
        subject_treatment:
          "Surround the prompt's subject with candle shrines and flowing wax, keeping it clear in the warm pooled light.",
        color_and_tone:
          'Ivory and amber wax, deep red glass holders and black soot against warm flickering gold.',
        lighting_and_shadow:
          'Dozens of small candle flames casting warm shifting light and deep trembling shadows.',
        texture_and_material:
          'Layered dripping wax, soot-stained walls, faded photographs and dried flowers.',
        camera_and_composition:
          'Close cluttered framing with the altar filling the frame and darkness beyond.',
        atmosphere_and_mood: 'Devotional, obsessive and claustrophobic, grief turned into ritual.',
        rendering_and_quality:
          'Rich warm painterly rendering with glowing flames and glossy wax detail.',
        key_features: 'years of melted candles; wax waterfalls; soot stains; faded photographs',
      },
      ['cold blue light', 'clean modern room'],
      [
        'A widower lights one more candle on a shrine so thick with wax that his late wife\'s photograph is now just a pale shape inside it. No readable text or logo.',
        'A closet has been turned into a candle altar, wax flowing out under the door into the hallway like a slow golden river. No readable text or logo.',
        'An old telephone sits on a shrine buried in candle wax, its receiver lifted as if someone is still waiting on the line. No readable text or logo.',
      ],
    ),
    dir(
      'Breathing Wallpaper Damp',
      'damp wallpaper interior dread',
      'breathing-wallpaper',
      {
        aesthetic:
          'Breathing wallpaper damp: old rooms whose floral wallpaper is swollen with damp, stains spreading into shapes and the pattern seeming to shift when unobserved.',
        subject_treatment:
          "Place the prompt's subject in a damp room of stained floral wallpaper, keeping it clear while the walls feel subtly alive.",
        color_and_tone:
          'Faded yellow and green florals, brown water stains and grey mildew under weak daylight.',
        lighting_and_shadow:
          'Dim overcast window light, soft shadows and darker damp patches along the walls.',
        texture_and_material:
          'Bubbling wallpaper, peeling seams, mildew blooms and warped floorboards.',
        camera_and_composition:
          'Quiet interior framing with large expanses of wall around the subject.',
        atmosphere_and_mood: 'Stale, suffocating and quietly alive, a house that breathes.',
        rendering_and_quality:
          'Detailed painterly realism with subtle pattern distortion in the stains.',
        key_features: 'damp floral wallpaper; spreading stains; bubbling seams; subtly moving pattern',
      },
      ['bright clean walls', 'gore'],
      [
        'A tenant stares at a water stain on her bedroom wallpaper that has slowly taken the shape of a figure walking toward her. No readable text or logo.',
        'A bubble under old floral wallpaper rises and falls gently, as if the wall is breathing while the family eats dinner. No readable text or logo.',
        'An empty nursery\'s rose-pattern wallpaper has peeled back in one corner to reveal another, older layer of roses that are all closed. No readable text or logo.',
      ],
    ),
    dir(
      'Night-Bus Sodium Limbo',
      'late-night transit dread',
      'night-bus',
      {
        aesthetic:
          'Night-bus sodium limbo: empty late-night buses and stations under orange sodium light, passengers too still and routes that never seem to reach their stop.',
        subject_treatment:
          "Put the prompt's subject on or near a late-night bus or station, keeping it clear under orange sodium light.",
        color_and_tone:
          'Monochrome sodium orange and deep brown-black with sickly green interior bus light.',
        lighting_and_shadow:
          'Harsh sodium streetlights, window reflections and long shadows cutting across seats.',
        texture_and_material:
          'Worn plastic seats, scratched windows, wet asphalt and flickering ceiling panels.',
        camera_and_composition:
          'Long bus interiors with repeating seats, or wide empty stops seen through glass.',
        atmosphere_and_mood: 'Lonely, hypnotic and slightly wrong, a ride with no destination.',
        rendering_and_quality:
          'Moody painterly realism with strong reflections and grain.',
        key_features: 'sodium orange light; empty late buses; window reflections; endless routes',
      },
      ['daylight', 'crowded cheerful scenes'],
      [
        "Past the same shuttered shop for the fifth time, the last bus of the night carries a single sleeping passenger while the driver never turns his head. No readable text or logo.",
        'An empty bus shelter glows orange at 3 a.m. while every seat inside a passing bus is occupied by a coat with no one wearing it. No readable text or logo.',
        'A woman watches her own reflection in the bus window, and her reflection is looking at something behind her. No readable text or logo.',
      ],
    ),
    dir(
      'Taxidermy Parlor Stillness',
      'glass-eyed parlor dread',
      'taxidermy-parlor',
      {
        aesthetic:
          'Taxidermy parlor stillness: cluttered old parlors crowded with mounted animals under glass domes, dozens of glass eyes watching in perfect silence.',
        subject_treatment:
          "Set the prompt's subject among mounted animals and glass domes in a dim parlor, keeping it clear while the animals seem to watch.",
        color_and_tone:
          'Dusty browns, faded velvet reds, amber lamplight and glinting glass eyes.',
        lighting_and_shadow:
          'Weak lamplight and dusty window beams, with glinting highlights in every glass eye.',
        texture_and_material:
          'Fur, feathers, glass domes, dust, velvet upholstery and dark varnished wood.',
        camera_and_composition:
          'Crowded interiors with animals filling shelves and corners around the subject.',
        atmosphere_and_mood: 'Silent, watchful and suffocating, a room holding its breath.',
        rendering_and_quality:
          'Rich detailed painterly realism with precise reflections in the glass.',
        key_features: 'mounted animals; glass domes; watching glass eyes; dusty velvet parlor',
      },
      ['gore', 'living animals moving', 'bright colors'],
      [
        'A collector serves tea in a parlor where every stuffed fox, owl and deer has turned its head a few degrees toward the guest. No readable text or logo.',
        'A single empty glass dome sits among dozens of mounted birds, a small brass plaque beneath it blank and waiting. No readable text or logo.',
        'A maid dusts a stuffed bear on a stair landing and pauses because its glass eyes are wet. No readable text or logo.',
      ],
    ),
    dir(
      'Snowbound Motel Hum',
      'isolated winter motel dread',
      'snowbound-motel',
      {
        aesthetic:
          'Snowbound motel hum: a roadside motel buried in snow, humming ice machines, blinking vacancy tubes and long exterior walkways where every door looks the same.',
        subject_treatment:
          "Place the prompt's subject at a snowed-in roadside motel, keeping it clear against endless white and cold light.",
        color_and_tone:
          'Blue-white snow, sickly yellow door lamps and a single red tube light glowing in the storm.',
        lighting_and_shadow:
          'Weak door lamps and snowglare, long shadows along the walkway and dark room windows.',
        texture_and_material:
          'Piled snow, frosted glass, peeling motel doors, humming machines and icy railings.',
        camera_and_composition:
          'Long exterior walkways receding in perspective, identical doors repeating.',
        atmosphere_and_mood: 'Isolated, cold and hypnotic, the storm will not end.',
        rendering_and_quality:
          'Cold painterly realism with soft falling snow and subtle glow.',
        key_features: 'snow-buried motel; identical doors; humming ice machine; storm isolation',
      },
      ['summer', 'crowded parking lot'],
      [
        'A lone traveler walks the snowy motel walkway looking for room twelve and passes room twelve for the third time. No readable text or logo.',
        'An ice machine hums in a frozen alcove, its door open and frost growing in the shape of a handprint on its lid. No readable text or logo.',
        'Every window of a buried motel is dark except one, where a figure stands facing the storm without moving. No readable text or logo.',
      ],
    ),
    dir(
      'Attic Toy Menace',
      'forgotten toy attic dread',
      'attic-toys',
      {
        aesthetic:
          'Attic toy menace: dusty attics of forgotten dolls, wind-up animals and rocking horses, arranged as if they have been waiting for someone to come back.',
        subject_treatment:
          "Surround the prompt's subject with forgotten toys in a dusty attic, keeping it clear while the toys seem attentive.",
        color_and_tone:
          'Faded pastels, yellowed porcelain and dusty browns under grey attic light.',
        lighting_and_shadow:
          'Single dusty beam from a small window, deep shadows under eaves and glinting button eyes.',
        texture_and_material:
          'Cracked porcelain, moth-eaten fabric, chipped paint, cobwebs and dusty floorboards.',
        camera_and_composition:
          'Low angle across the attic floor with toys in rows facing the subject.',
        atmosphere_and_mood: 'Nostalgic, patient and menacing, forgotten things that remember.',
        rendering_and_quality:
          'Detailed painterly realism with dust particles and subtle eerie arrangement.',
        key_features: 'forgotten toys; rows facing the viewer; dusty beam; cracked porcelain',
      },
      ['cheerful playroom', 'gore'],
      [
        'An adult returns to her childhood attic and finds every doll sitting in a circle around the spot where she used to play. No readable text or logo.',
        'A wind-up monkey on a dusty shelf has worn a groove in the wood from clapping for years with no one winding it. No readable text or logo.',
        'A rocking horse still rocks gently in an attic nobody has entered for decades, dust swirling around its legs. No readable text or logo.',
      ],
    ),
    dir(
      'Mirror-Maze Identity',
      'fragmented reflection dread',
      'mirror-maze',
      {
        aesthetic:
          'Mirror-maze identity: endless reflective corridors where a figure multiplies into countless copies, a few of them moving on their own.',
        subject_treatment:
          "Place the prompt's subject inside a maze of mirrors, keeping the real subject clear among its many reflections.",
        color_and_tone:
          'Cold silver, smoky grey and dim carnival colors reflected and fading into darkness.',
        lighting_and_shadow:
          'Scattered bulbs multiplied into infinite rows, with darkness between reflections.',
        texture_and_material:
          'Old mirror glass with foxing, scratched silvering, dusty frames and fingerprints.',
        camera_and_composition:
          'Repeating reflections receding into infinity, the real figure near center.',
        atmosphere_and_mood: 'Disorienting, lonely and uncanny, not all reflections obey.',
        rendering_and_quality:
          'Precise reflective painting with subtle inconsistencies among copies.',
        key_features: 'infinite reflections; foxed mirror glass; disobedient copies; carnival bulbs',
      },
      ['single clean mirror', 'bright daylight'],
      [
        'A man lost in a mirror maze sees a hundred copies of himself, and one of them is already at the exit waving. No readable text or logo.',
        'A bride checks her veil in a hall of mirrors while every reflection behind her is wearing black. No readable text or logo.',
        'Only one reflection in an endless mirror corridor is holding a candle, and the real woman is not. No readable text or logo.',
      ],
    ),
    dir(
      'Darkroom Safelight Reveal',
      'red safelight photo dread',
      'darkroom',
      {
        aesthetic:
          'Darkroom safelight reveal: a photographic darkroom bathed in red safelight, prints slowly developing in trays to show things that were not there when the photo was taken.',
        subject_treatment:
          "Place the prompt's subject in or on prints developing in a red-lit darkroom, keeping it readable in the monochrome red glow.",
        color_and_tone:
          'Deep safelight red and black, with pale developing prints glowing faintly.',
        lighting_and_shadow:
          'Single red safelight, glossy reflections on wet trays and deep black corners.',
        texture_and_material:
          'Chemical trays, dripping prints on lines, wet paper sheen and enlarger metal.',
        camera_and_composition:
          'Close framing on trays and hanging prints, with the darkroom disappearing into black.',
        atmosphere_and_mood: 'Tense, investigative and eerie, the truth slowly appearing.',
        rendering_and_quality:
          'Moody monochrome red painterly rendering with wet reflections.',
        key_features: 'red safelight; developing prints; hanging wet photos; black corners',
      },
      ['full color daylight', 'digital screens'],
      [
        'A photographer watches a holiday snapshot develop in the tray, and a figure appears standing behind her family that no one saw that day. No readable text or logo.',
        'Wet prints hang on a line in red light, each one showing the same empty chair slightly closer to the camera. No readable text or logo.',
        'A developing print of a quiet lake slowly reveals a hand breaking the surface near the center. No readable text or logo.',
      ],
    ),
    dir(
      'Sleep-Paralysis Bedside',
      'bedroom night paralysis dread',
      'sleep-paralysis',
      {
        aesthetic:
          'Sleep-paralysis bedside: a dim bedroom seen from the pillow at night, the familiar room stretched and heavy while a shadowed presence waits at the edge of vision.',
        subject_treatment:
          "Show the prompt's subject in a dark bedroom from a low bed-level view, keeping it clear while a vague presence hovers at the edge.",
        color_and_tone:
          'Deep navy, charcoal and faint moonlight grey with a weak warm glow from a streetlight.',
        lighting_and_shadow:
          'Moonlight and streetlight slats, shadows too dense in the corners and doorways.',
        texture_and_material:
          'Crumpled sheets, heavy blankets, grainy darkness and softly warped furniture.',
        camera_and_composition:
          'Low pillow-level view with the ceiling and doorway looming, slightly distorted perspective.',
        atmosphere_and_mood: 'Heavy, helpless and suffocating, awake but unable to move.',
        rendering_and_quality:
          'Soft grainy painterly darkness with subtle distortion and blur at the edges.',
        key_features: 'pillow-level view; heavy dark corners; shadowed presence; warped room',
      },
      ['gore', 'monster close-up', 'bright light'],
      [
        'From the pillow a sleeper sees the bedroom door slowly opening onto a hallway that is far longer than the house. No readable text or logo.',
        'A dark shape sits at the foot of the bed, perfectly still, the moonlight passing through it onto the blanket. No readable text or logo.',
        'The ceiling of a small bedroom seems to be lowering, the lamp shade already brushing the sleeper\'s blanket. No readable text or logo.',
      ],
    ),
    dir(
      'Deep-Sea Pressure Dread',
      'deep sea interior dread',
      'deep-sea-pressure',
      {
        aesthetic:
          'Deep-sea pressure dread: cramped submersible interiors and black ocean depths, riveted hulls creaking while vast unseen shapes pass beyond tiny portholes.',
        subject_treatment:
          "Place the prompt's subject inside or just outside a deep-sea vessel, keeping it clear in a small pool of light surrounded by black water.",
        color_and_tone:
          'Black ocean blue, rusted brass, dim green instrument glow and pale headlamp beams.',
        lighting_and_shadow:
          'Tiny pools of light, instrument glow and headlamp beams dissolving into total darkness.',
        texture_and_material:
          'Riveted steel, condensation, brass gauges, thick porthole glass and drifting particles.',
        camera_and_composition:
          'Claustrophobic interiors or small lit figures against enormous black water.',
        atmosphere_and_mood: 'Crushing, silent and immense, something large is passing.',
        rendering_and_quality:
          'Dark painterly realism with precise small highlights and heavy darkness.',
        key_features: 'cramped submersible; tiny portholes; black depths; passing unseen shapes',
      },
      ['bright tropical reef', 'gore'],
      [
        'Inside a tiny submersible a pilot watches the depth gauge while something outside blocks every porthole at once. No readable text or logo.',
        'A diver\'s headlamp beam reaches only a meter into the black water and finds the edge of an eye bigger than her. No readable text or logo.',
        'A research station hums on the sea floor, its windows glowing, and a shadow the size of a mountain drifts slowly over its roof. No readable text or logo.',
      ],
    ),
    dir(
      'Ash-Snow Suburb',
      'burned suburb aftermath dread',
      'ash-snow',
      {
        aesthetic:
          'Ash-snow suburb: a quiet suburban street after a distant fire, grey ash falling like snow onto lawns, cars and swings, the sky a muted orange.',
        subject_treatment:
          "Place the prompt's subject on an ash-covered suburban street, keeping it clear under the falling grey flakes.",
        color_and_tone:
          'Ash grey, faded pastel houses and a muted smoky orange sky with no clear sun.',
        lighting_and_shadow:
          'Diffused orange haze, no sharp shadows, faint glow on the horizon.',
        texture_and_material:
          'Soft ash layers on lawns and cars, falling flakes, faded paint and still air.',
        camera_and_composition:
          'Wide quiet street views with rows of houses fading into haze.',
        atmosphere_and_mood: 'Muted, eerie and elegiac, ordinary life stopped mid-afternoon.',
        rendering_and_quality:
          'Soft hazy painterly realism with gentle falling particles.',
        key_features: 'ash falling like snow; muted orange sky; silent suburb; faded houses',
      },
      ['active flames', 'gore', 'blue clear sky'],
      [
        'A man waters his lawn as grey ash falls like snow over the whole silent street, the sprinkler making clean circles in it. No readable text or logo.',
        'A child\'s bicycle lies in a driveway slowly disappearing under drifting ash beneath a dull orange sky. No readable text or logo.',
        'An ice-cream truck drives slowly down an empty suburb in the ash fall, its music box tune the only sound. No readable text or logo.',
      ],
    ),
    dir(
      'Static-Glow Television Room',
      'television static dread',
      'static-glow',
      {
        aesthetic:
          'Static-glow television room: a dark room lit only by an old television showing static, the grey light flickering over furniture and faces.',
        subject_treatment:
          "Light the prompt's subject only by television static in a dark room, keeping it readable in the cold flickering glow.",
        color_and_tone:
          'Cold blue-grey static light against deep black, with faint warm tones in the far background.',
        lighting_and_shadow:
          'Flickering screen light from one direction, sharp dark shadows cast behind every object.',
        texture_and_material:
          'Screen snow, curved glass, dusty cabinets, patterned upholstery and grainy darkness.',
        camera_and_composition:
          'Television in frame or just off it, with the room disappearing into darkness.',
        atmosphere_and_mood: 'Lonely, hypnotic and uneasy, something wants to come through.',
        rendering_and_quality:
          'Grainy painterly rendering with flickering light falloff and deep black corners.',
        key_features: 'television static glow; flickering shadows; dark room; curved screen',
      },
      ['bright daylight', 'readable screen content'],
      [
        'A woman sleeps on the sofa in the grey glow of a static-filled television, and the static has formed the outline of a hand pressed against the inside of the glass. No readable text or logo.',
        'An empty armchair faces an old television flickering with snow, a warm cup of tea steaming on the armrest. No readable text or logo.',
        'Dozens of televisions stacked in a dark shop window all show static except one, which shows the street outside from the wrong angle. No readable text or logo.',
      ],
    ),
  ],
};

export default spec;
