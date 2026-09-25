import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'franchise likeness',
  'recognizable film character',
  'real actor likeness',
  'celebrity likeness',
  'adding genre costumes or plot the prompt did not ask for',
];

// Genres are cinema treatments: camera, light, stock and grade transfer; costumes, sets and plots do not.
const genre =
  "Keep the prompt subject, action and setting; translate them through this genre's camera, lighting, film stock and grade, without adding genre costumes, sets or plot events the prompt did not ask for.";

function film(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? genre, ...rest } as Dna;
}

const BASE = ['watermark', 'readable fake text', 'logo clutter', ...AVOID];

const spec: Spec = {
  pack: 'pack_02',
  category: '1. Film Genres',
  updates: {
    'SP02-001': {
      dna: film({
        aesthetic:
          'Film noir: 1940s black-and-white crime cinema built from one hard key light, slatted shadows and oppressive darkness.',
        color_and_tone:
          'Monochrome with deep charcoal blacks, silver highlights and very few midtones.',
        lighting_and_shadow:
          'Hard low-angle key through blinds, banisters or window frames throwing striped shadows; faces half lost in black.',
        texture_and_material:
          'Fine silver grain, cigarette smoke or fog catching the key light, glossy dark surfaces.',
        camera_and_composition:
          'Low or tilted angles, 35–40 mm, deep focus with a looming foreground shape and a subject trapped in shadow.',
        atmosphere_and_mood: 'Fatalistic and tense, danger hiding in every band of shadow.',
        rendering_and_quality:
          'Projected 35 mm black-and-white print; an everyday domestic action keeps its setting under the noir light.',
        key_features:
          'slatted hard key; black-and-white low key; tilted low angles; smoke in the beam; subject half in shadow',
      }),
      avoid: [...BASE, 'color', 'bright even light'],
      briefs: [
        'Film-noir still in black and white of an adult widow in a veiled hat at the top of a spiral stair, a single hard lamp throwing her shadow three stories down the wall, deep charcoal blacks. No text or logo.',
        'Film-noir still of an adult cloaked informant whispering to an adult detective through the lattice of a confessional, slatted light striping both faces, smoke in the beam. No text or logo.',
        'Film-noir still of an adult man washing dishes at a kitchen sink late at night, venetian-blind shadows striping the tiles and his shirt, a low tilted camera. No text or logo.',
      ],
    },
    'SP02-002': {
      dna: film({
        aesthetic:
          'Spaghetti western: 1960s widescreen frontier cinema that alternates extreme wide landscapes with extreme close-ups of eyes, under merciless sun.',
        color_and_tone:
          'Sun-bleached ochre, dusty yellow and burnt sienna, pale blue sky, dark sweat-stained shadows.',
        lighting_and_shadow:
          'Hard overhead noon sun, squinting faces, short black shadows, dust glowing in backlight.',
        texture_and_material:
          'Dust, stubble, sweat, cracked leather and grit in every wrinkle; coarse grain.',
        camera_and_composition:
          '2.35:1 widescreen feel inside the frame: either a tiny figure on a vast horizon or a face cropped from brow to lip.',
        atmosphere_and_mood: 'Operatic and tense, a long silence stretched before sudden violence.',
        rendering_and_quality: 'Faded Techniscope color and grain; no clean modern grade.',
        key_features:
          'extreme close-up versus extreme wide; noon sun; sun-bleached ochre; dust and sweat; widescreen tension',
      }),
      avoid: [...BASE, 'clean', 'overcast'],
      briefs: [
        'Spaghetti-western extreme close-up of the squinting eyes of an adult one-eyed mercenary in a dusty desert monastery courtyard, sweat and grit in every wrinkle, sun-bleached ochre, frame cropped from brow to lip. No text or logo.',
        'Spaghetti-western extreme wide still of three adult riders facing each other across a white salt pan at noon, tiny against the horizon, short black shadows under the horses. No text or logo.',
        'Spaghetti-western still of an adult gravedigger leaning on his spade in a wind-blown desert cemetery of wooden crosses, a dust devil spinning behind him, harsh noon light. No text or logo.',
      ],
    },
    'SP02-003': {
      dna: film({
        aesthetic:
          '80s practical sci-fi cinema: smoke-filled sets, backlit haze and glowing practical lights, shot on 35 mm anamorphic with streaking lens flares.',
        color_and_tone:
          'Deep blue-black with electric magenta, cyan and sodium-orange practicals; skin in mixed colored light.',
        lighting_and_shadow:
          'Strong backlight through smoke, spinning fans and searchlights casting moving shafts, faces lit by small practicals.',
        texture_and_material:
          'Dense haze, steam, grimy industrial surfaces, cables and practical model detail.',
        camera_and_composition:
          'Anamorphic widescreen feel with horizontal blue flares, slow push-ins, figures silhouetted against haze.',
        atmosphere_and_mood: 'Brooding and dystopian, a heavy night that never seems to end.',
        rendering_and_quality:
          'Practical-effects cinema with film grain; no clean CGI and no franchise designs.',
        key_features:
          'backlit smoke; anamorphic blue flares; neon and sodium practicals; spinning fan shafts; grimy industrial sets',
      }),
      avoid: [...BASE, 'modern cgi', 'clean daylight'],
      briefs: [
        '80s sci-fi film still of an adult engineer walking through a smoke-filled reactor corridor, shafts of light cut by a huge spinning fan behind her, a horizontal blue anamorphic flare across the frame. No text or logo.',
        '80s sci-fi film still of a giant hover-barge descending over a smog-covered industrial city at night, searchlights sweeping through haze, tiny glowing windows below. No readable signs or logo.',
        '80s sci-fi film still of an adult bounty hunter with a glowing visor eating at a steam-filled noodle counter, magenta and cyan practicals through the steam. No readable signs or logo.',
      ],
    },
    'SP02-004': {
      dna: film({
        aesthetic:
          'Technicolor musical: golden-age three-strip dye-transfer color on theatrical studio sets with painted backdrops and staged spectacle.',
        color_and_tone:
          'Hyper-saturated ruby red, emerald green and sapphire blue, creamy skin, luminous highlights.',
        lighting_and_shadow:
          'Bright high-key studio light with colored backlights and a follow spot on the lead.',
        texture_and_material:
          'Satin, tulle, sequins, painted canvas skies and polished stage floors.',
        camera_and_composition:
          'Wide proscenium framing or high crane shots of symmetrical group formations, lead centered.',
        atmosphere_and_mood: 'Joyous and theatrical, dreamlike spectacle with no shadow of doubt.',
        rendering_and_quality:
          'Dye-transfer saturation and gentle softness; painted backdrops obviously painted.',
        key_features:
          'three-strip saturation; painted backdrops; high-key studio light; crane-shot formations; satin and sequins',
      }),
      avoid: [...BASE, 'faded color', 'dark gritty'],
      briefs: [
        'Technicolor musical still from a high crane angle: a chorus of adult dancers in emerald satin gowns fanning out down a giant staircase of a painted palace, ruby curtains, a follow spot on the adult lead in white. No text or logo.',
        'Technicolor musical still of an adult sailor dancing on a painted harbor set strung with ruby-red lanterns, a canvas sunset sky behind him, polished stage floor reflecting the colors. No text or logo.',
        'Technicolor musical still of an adult witch in a sapphire gown singing while seated on a painted crescent moon suspended over a starry canvas sky. No text or logo.',
      ],
    },
    'SP02-005': {
      dna: film({
        aesthetic:
          'French New Wave: early-1960s handheld cinema on fast black-and-white film, real locations, available light and jump-cut spontaneity.',
        color_and_tone:
          'Grey-rich black and white or pale muted color; overexposed skies and windows.',
        lighting_and_shadow:
          'Available daylight and practical lamps only; no studio lighting setups.',
        texture_and_material: 'Visible grain, slight softness, real worn interiors and streets.',
        camera_and_composition:
          'Handheld 35 mm, off-balance framing, actors glancing into the lens, sudden cropped gestures.',
        atmosphere_and_mood:
          'Restless and playful, youthful improvisation with a touch of melancholy.',
        rendering_and_quality: 'Loose documentary cinema look; no polished studio perfection.',
        key_features:
          'handheld black and white; available light; glances into the lens; off-balance framing; overexposed windows',
      }),
      avoid: [...BASE, 'studio lighting', 'stable symmetrical framing'],
      briefs: [
        'French New Wave still in black and white of an adult couple running hand in hand across an old stone bridge, laughing, handheld and tilted, the sky blown to white. No text or logo.',
        'French New Wave still of an adult woman in a striped shirt in a cramped attic room looking straight into the lens mid-sentence, window light only, visible grain. No text or logo.',
        'French New Wave still of an adult man and woman arguing in the front seats of a small car, filmed from the back seat, windows overexposed, handheld. No text or logo.',
      ],
    },
    'SP02-006': {
      dna: film({
        aesthetic:
          'Grindhouse exploitation cinema: a battered 1970s release print of a lurid B-movie, full of scratches, cue marks and splice damage.',
        color_and_tone:
          'Faded magenta-red shift, yellowed highlights, crushed blacks, lurid saturated costume accents.',
        lighting_and_shadow:
          'Cheap colored gels and harsh single lamps; shadows muddy from print decay.',
        texture_and_material:
          'Vertical scratches, dust flecks, a round cue mark in a corner, gate weave and a heavy grain storm.',
        camera_and_composition:
          'Crash zooms and low-budget framing; props and sets slightly too visible as props.',
        atmosphere_and_mood: 'Sleazy and gleeful, cheap thrills projected too many times.',
        rendering_and_quality:
          'Worn release-print damage in the image itself; no title cards or readable text.',
        key_features:
          'print scratches and cue marks; magenta color shift; heavy grain; cheap gel lighting; lurid props',
      }),
      avoid: [...BASE, 'clean', 'hd', 'wet street neon cliché'],
      briefs: [
        'Grindhouse film still of an adult barbarian queen with a double axe lounging on a papier-mâché skull throne under cheap red gels, vertical scratches, a round cue mark in the corner, magenta-faded print. No text or logo.',
        'Grindhouse film still of an adult swamp creature in an obvious rubber suit rising from a lagoon lit by green and red gels, heavy grain storm, splice flicker. No text or logo.',
        'Grindhouse film still of an adult masked wrestler grappling a cardboard-and-bandage mummy in a cheap tomb set, crash-zoom framing, yellowed faded print. No text or logo.',
      ],
    },
    'SP02-007': {
      dna: film({
        aesthetic:
          'Silent film: 1920s orthochromatic cinema with heavy stage makeup, an iris vignette and hand-cranked flicker, often tinted sepia or blue.',
        color_and_tone:
          'Monochrome tinted amber-sepia for day or blue for night; orthochromatic dark lips and pale eyes.',
        lighting_and_shadow:
          'Bright arc or daylight studio light, flat faces, crisp shadows on painted sets.',
        texture_and_material: 'Scratches, dust, frame-edge flicker and soft focus from old lenses.',
        camera_and_composition:
          'Locked-off wide theatrical framing or a circular iris closing on the subject.',
        atmosphere_and_mood: 'Expressive and nostalgic, big gestures in a silent flickering world.',
        rendering_and_quality:
          'Projected nitrate print look; invented characters only, never a recognizable screen comedian.',
        key_features:
          'iris vignette; sepia or blue tint; flicker and scratches; heavy stage makeup; theatrical framing',
      }),
      avoid: [...BASE, 'color', 'tramp comedian costume'],
      briefs: [
        'Silent-film still tinted amber of an adult aviator in leather goggles waving from the wing of a flying biplane above a village, a circular iris vignette closing around her, flicker and scratches. No intertitle text or logo.',
        'Silent-film still tinted night blue of an adult tightrope walker crossing between two church towers above a torchlit square, orthochromatic pale eyes, soft old lens. No intertitle text or logo.',
        'Silent-film still in sepia of an adult stage magician in a cape making a woman in a cabinet vanish on a painted theater set, heavy makeup, iris framing. No intertitle text or logo.',
      ],
    },
    'SP02-008': {
      dna: film({
        aesthetic:
          'Found-footage horror: a frame from a consumer camcorder or phone carried by a panicking person in the dark.',
        color_and_tone:
          'Night-mode green-grey or sickly low-light color, crushed blacks, blown flashlight hotspots.',
        lighting_and_shadow:
          'A single flashlight or camera light cone; everything outside it falls to noisy black.',
        texture_and_material:
          'Video noise, compression smear, motion blur, lens smudges and interlace tearing.',
        camera_and_composition:
          'Shaky handheld, tilted, subject half out of frame, something barely visible in the dark.',
        atmosphere_and_mood:
          'Panicked and claustrophobic, dread coming from what the light has not reached.',
        rendering_and_quality:
          'Consumer-video low fidelity; no readable timestamp or cinematic lighting.',
        key_features:
          'flashlight cone; night-mode green; shaky handheld; video noise and smear; half-seen threat in the dark',
      }),
      avoid: [...BASE, 'steady', 'cinematic lighting', 'readable timestamp'],
      briefs: [
        'Found-footage horror frame from a camcorder of adult explorers descending into catacombs, a wall of stacked skulls leaping out of the flashlight cone, the rest noisy black, shaky tilted frame. No readable timestamp or logo.',
        'Found-footage frame of an adult running through a cornfield at night, looking back over her shoulder, flashlight swinging, motion smear and green night-mode noise. No readable timestamp or logo.',
        'Found-footage frame pointed down a cellar stair toward a doorway where a pale figure stands just at the edge of the camera light, grainy and compressed. No readable timestamp or logo.',
      ],
    },
    'SP02-009': {
      dna: film({
        aesthetic:
          'Kaiju suitmation cinema: a performer in a rubber creature suit stomping through detailed miniature sets, shot low to fake enormous scale.',
        subject_treatment:
          'Keep the prompt subject and setting; render them as practical miniatures and suits filmed at giant scale, without adding a monster the prompt did not ask for.',
        color_and_tone:
          'Black and white or faded early Eastmancolor, grey smoke, orange fire accents.',
        lighting_and_shadow:
          'Hard studio floods mimicking daylight, smoke diffusing it, flickering practical fires.',
        texture_and_material:
          'Rubber suit folds, plaster rubble, balsa miniatures, visible wire supports and model water.',
        camera_and_composition:
          'Very low camera among the miniatures, forced perspective, smoke and debris in the foreground.',
        atmosphere_and_mood: 'Charming and terrifying at once, handmade catastrophe on a tabletop.',
        rendering_and_quality:
          'Practical-effects film look; original creatures only, no famous monster designs.',
        key_features:
          'rubber-suit performer; detailed miniatures; low camera forced perspective; smoke and model fire; faded film stock',
      }),
      avoid: [...BASE, 'cgi', 'famous monster design'],
      briefs: [
        'Kaiju suitmation film still of a giant armored beetle in a visible rubber suit crushing a detailed balsa miniature castle, plaster rubble flying, low camera among model trees, black-and-white film. No text or logo.',
        'Kaiju suitmation still of a colossal stone golem wading into a miniature harbor, model fishing boats rocking in tank water, smoke and orange practical fires, faded Eastmancolor. No text or logo.',
        'Kaiju suitmation still of a gigantic moth-winged beast on wires hovering over a model cathedral, the wings obviously fabric, searchlight beams through smoke. No text or logo.',
      ],
    },
    'SP02-010': {
      name: '70s Kung Fu Studio Epic',
      dna: film({
        aesthetic:
          '70s kung fu studio epic: martial-arts cinema shot on lavish studio sets with painted skies, crash zooms and acrobatic wire-assisted choreography.',
        color_and_tone:
          'Saturated primaries: palace gold, lacquer red, jade green, painted blue skies.',
        lighting_and_shadow:
          'Bright even studio light with colored fill, crisp shadows on painted sets.',
        texture_and_material:
          'Silk robes, lacquered wood, painted backdrops, stage dust kicked up by footwork.',
        camera_and_composition:
          'Wide staging for full-body action, sudden crash zooms onto faces, fighters mid-air or mid-strike.',
        atmosphere_and_mood: 'Acrobatic and heroic, choreographed rhythm with theatrical bravado.',
        rendering_and_quality: 'Studio-film grain and saturation; no modern gritty action grade.',
        key_features:
          'painted studio sets; crash zooms; wire acrobatics; saturated primaries; full-body choreography',
      }),
      avoid: [...BASE, 'modern action grade', 'shaky cam'],
      briefs: [
        '70s kung fu studio still of two adult swordswomen dueling on the tips of tall bamboo stalks against a painted blue sky, silk sleeves flying, crash-zoom framing. No text or logo.',
        '70s kung fu studio still of an adult elderly master balancing on one finger on the rim of a huge bronze temple bell, lacquer red columns behind, even studio light. No text or logo.',
        '70s kung fu studio still of an adult drunken-boxing fighter tumbling over a tavern table as benches fly, wide staging, gold and red set. No text or logo.',
      ],
    },
    'SP02-011': {
      dna: film({
        aesthetic:
          '90s cyberpunk anime film: dense cel animation over hand-painted backgrounds, with a sickly green CRT cast and techno-organic clutter.',
        subject_treatment:
          'Keep the prompt subject, action and setting; render them as 90s cel-animated film frames with painted backgrounds, without adding franchise characters or designs.',
        color_and_tone:
          'Green and teal cast, deep shadow cyan, muted skin, occasional warm monitor glow.',
        lighting_and_shadow:
          'Hard cel shadows in two tones, glowing screens and window light as sources.',
        texture_and_material:
          'Cel grain, painted background texture, dense cables and pipes, reflective visors.',
        camera_and_composition:
          'Cinematic layouts with deep background paintings, low angles and long lens compression.',
        atmosphere_and_mood:
          'Melancholic and philosophical, technology pressing in from every side.',
        rendering_and_quality:
          'Film-print cel animation with slight gate weave; no modern digital sheen.',
        key_features:
          'cel animation with painted backgrounds; green CRT cast; two-tone cel shadows; dense cables; film grain',
      }),
      avoid: [...BASE, 'modern digital anime', 'photograph'],
      briefs: [
        '90s cyberpunk anime film frame of an adult cyborg sniper lying prone on a rooftop tangled with cables, a painted city of pipes below, green CRT cast, two-tone cel shadows. No readable text or logo.',
        '90s cyberpunk anime frame of an adult hacker jacked into a terminal by thick cables in a cramped room lit by several monitors showing only abstract glow, cel grain. No readable screens or logo.',
        '90s cyberpunk anime frame of a police tiltrotor gunship hovering over a canal district at dusk, painted background water and towers, teal and amber cast. No readable signs or logo.',
      ],
    },
    'SP02-012': {
      name: 'Symmetrical Storybook Cinema',
      dna: film({
        aesthetic:
          'Symmetrical storybook cinema: meticulously centered compositions, pastel dollhouse sets and deadpan performers, as if every frame were a page of a picture book.',
        color_and_tone:
          'Curated pastel palette — pink, mustard, mint, powder blue — with one strong accent.',
        lighting_and_shadow:
          'Soft frontal light, very few shadows, clean and flat like a lit diorama.',
        texture_and_material:
          'Handmade miniatures, uniforms, patterned wallpaper and precise props.',
        camera_and_composition:
          'Dead-center one-point perspective, subject frontal and centered, perfectly balanced left and right.',
        atmosphere_and_mood: 'Whimsical and melancholic, deadpan charm inside strict order.',
        rendering_and_quality: 'Crisp storybook film look; no handheld mess and no asymmetry.',
        key_features:
          'dead-center symmetry; pastel dollhouse palette; frontal deadpan subject; flat soft light; one-point perspective',
      }),
      avoid: [...BASE, 'asymmetrical', 'messy handheld'],
      briefs: [
        'Symmetrical storybook film still of an adult beekeeping nun standing dead center in a pink stone cloister, identical hives lined up on both sides, pastel light, one-point perspective. No text or logo.',
        'Symmetrical storybook still of an adult royal cartographer seated precisely at the center of a mustard-yellow map room, drawers and globes mirrored left and right, deadpan stare. No readable maps or logo.',
        'Symmetrical storybook still of an adult ferry captain on the bridge of a mint-and-powder-blue paddle steamer, perfectly frontal, lifebuoys mirrored on each side. No text or logo.',
      ],
    },
    'SP02-013': {
      dna: film({
        aesthetic:
          'Blockbuster teal-and-orange: modern action cinema graded to push skin and fire toward orange and shadows and skies toward teal, with flares and spark bloom.',
        color_and_tone:
          'Teal shadows and sky, orange skin, fire and sparks; high contrast and saturation.',
        lighting_and_shadow:
          'Hard rim light, explosions or sunsets as backlight, anamorphic flares.',
        texture_and_material: 'Flying sparks, embers, debris and smoke; sweat and grime on skin.',
        camera_and_composition:
          'Low heroic angles, slow-motion feel, subject silhouetted against fire or sky.',
        atmosphere_and_mood: 'Loud and epic, spectacle at maximum volume.',
        rendering_and_quality:
          'Glossy digital cinema grade with clean bloom; no muted natural color.',
        key_features:
          'teal and orange grade; heroic low angle; sparks and embers; anamorphic flares; rim-lit silhouette',
      }),
      avoid: [...BASE, 'natural color', 'flat light'],
      briefs: [
        'Blockbuster teal-and-orange film still of an adult dragon rider leaping from a crumbling tower as a fireball erupts below, teal storm sky, orange fire on her armor, sparks everywhere. No text or logo.',
        'Blockbuster still of an adult siege engineer silhouetted against a burning trebuchet at dusk, embers spiraling, heroic low angle, anamorphic flare. No text or logo.',
        'Blockbuster still of a great stone bridge collapsing into a gorge as adult cavalry gallop across, orange dust and teal river mist, slow-motion debris. No text or logo.',
      ],
    },
    'SP02-014': {
      dna: film({
        aesthetic:
          'Giallo: 1970s Italian thriller cinema of baroque interiors flooded with saturated colored gels and tense, stylized close-ups.',
        color_and_tone:
          'Deep red, cobalt blue and acid green gels on dark baroque interiors; glossy blacks.',
        lighting_and_shadow:
          'Colored gels from opposite sides, hard shadows, sudden pools of saturated light.',
        texture_and_material:
          'Velvet, marble, lacquer, black leather gloves and glass reflections.',
        camera_and_composition:
          'Extreme close-ups of eyes and hands, slow zooms, long corridors in deep perspective.',
        atmosphere_and_mood:
          'Stylish and paranoid, beauty and menace sharing the same colored light.',
        rendering_and_quality: 'Saturated 35 mm film look with grain; implied threat, never gore.',
        key_features:
          'red, blue and green gels; baroque interiors; eye and hand close-ups; deep corridors; implied threat',
      }),
      avoid: [...BASE, 'natural lighting', 'gore'],
      briefs: [
        'Giallo film still of an adult ballerina alone in a blue-lit rehearsal hall, a red-lit doorway behind her where a shadow waits, mirrors doubling the colors. No text or logo.',
        'Giallo film still of a baroque marble staircase drenched in red and cobalt gels, a single feathered carnival mask lying on the steps. No text or logo.',
        "Giallo extreme close-up of an adult woman's eye reflecting a green-lit corridor and a gloved hand, grainy saturated film. No text or logo.",
      ],
    },
    'SP02-015': {
      dna: film({
        aesthetic:
          'Mumblecore: low-budget indie cinema shot on consumer video in real apartments with available light and improvised, awkward conversation.',
        color_and_tone:
          'Ungraded natural daylight color, slightly flat, mixed window and lamp white balance.',
        lighting_and_shadow: 'Whatever the room offers: a window, a ceiling lamp, a laptop glow.',
        texture_and_material:
          'Soft consumer-video texture, lived-in clutter, unmade beds and mismatched mugs.',
        camera_and_composition:
          'Handheld medium shots, accidental framing, heads cut off, people talking off-camera.',
        atmosphere_and_mood: 'Awkward and intimate, small uncertain moments between people.',
        rendering_and_quality: 'Unpolished indie realism; no cinematic grade or glamour.',
        key_features:
          'available light apartments; consumer video softness; handheld accidental framing; lived-in clutter; awkward intimacy',
      }),
      avoid: [...BASE, 'polished', 'dramatic lighting'],
      briefs: [
        'Mumblecore film still of two adult friends eating cereal on a mattress on the floor of a half-empty apartment, morning window light, handheld framing cutting one of them in half. No text or logo.',
        'Mumblecore still of an adult woman alone trying to assemble a flat-pack bookshelf, parts scattered on the rug, ceiling-lamp light, a little out of focus. No text or logo.',
        'Mumblecore still of two adult siblings sitting on a sagging porch at dusk, not looking at each other, consumer-video softness. No text or logo.',
      ],
    },
    'SP02-016': {
      dna: film({
        aesthetic:
          '70s space opera: practical-effects science fiction with kitbashed model starships, optical composites and a worn, lived-in future.',
        color_and_tone:
          'Worn ochre, grey panel, dusty olive and beige, with glowing engine blues and blaster reds.',
        lighting_and_shadow:
          'Hard single-source light on models, backlit smoke in hangars, twin-sun desert light.',
        texture_and_material:
          'Greebled model surfaces, scratched paint, oil stains, weathered flight suits.',
        camera_and_composition:
          'Model ships passing close to the lens, wide desert or hangar vistas, optical glow around engines.',
        atmosphere_and_mood: 'Adventurous and scrappy, a used universe full of possibility.',
        rendering_and_quality:
          'Film grain and slight optical-composite matte lines; no franchise ships or costumes.',
        key_features:
          'kitbashed model ships; used-future weathering; optical composite glow; backlit hangar smoke; film grain',
      }),
      avoid: [...BASE, 'cgi', 'franchise starship design'],
      briefs: [
        '70s space-opera film still of an adult smuggler repairing the battered landing strut of a kitbashed freighter on a desert moon, twin suns low, oil-stained flight suit. No text or logo.',
        '70s space-opera still of a greebled model dreadnought gliding past a ringed planet, optical glow around its engines, faint matte lines. No text or logo.',
        '70s space-opera still of a hangar crowded with mismatched ships and adult mechanics in orange suits, backlit smoke and hanging work lights. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'German Expressionist Cinema',
      domain: 'expressionist silent film',
      tags: ['expressionism', 'silent-film', 'black-and-white'],
      dna: film({
        aesthetic:
          'German Expressionist cinema: 1920s films with painted, crooked sets, shadows drawn on the walls and performers moving like marionettes.',
        color_and_tone:
          'Stark black and white or green-tinted monochrome, painted light and shadow shapes.',
        lighting_and_shadow:
          'Painted and real shadows exaggerated and elongated, looming silhouettes thrown across slanted walls.',
        texture_and_material:
          'Canvas flats painted with jagged lines, heavy theatrical makeup, film scratches.',
        camera_and_composition:
          'Tilted, zig-zag perspectives, doorways and windows as sharp trapezoids, figures small against distorted architecture.',
        atmosphere_and_mood: 'Nightmarish and uncanny, the world bent by a troubled mind.',
        rendering_and_quality:
          'Silent-era print with deliberate artifice; not realistic architecture.',
        key_features:
          'painted crooked sets; elongated looming shadows; zig-zag perspective; theatrical makeup; stark monochrome',
      }),
      avoid: [...BASE, 'realistic architecture', 'color'],
      briefs: [
        'German Expressionist film still of an adult lamplighter climbing a crooked painted street where the houses lean inward and shadows are painted onto the walls, stark black and white. No intertitle text or logo.',
        'German Expressionist still of an adult sleepwalker gliding along a jagged painted rooftop with arms outstretched, a huge elongated shadow following her. No intertitle text or logo.',
        'German Expressionist still of an adult clockmaker whose shadow stretches three times his height up a slanted wall of painted zig-zag lines, green-tinted monochrome. No intertitle text or logo.',
      ],
    },
    {
      name: '80s Sword-and-Sorcery Film',
      domain: '80s practical fantasy cinema',
      tags: ['sword-and-sorcery', '80s-cinema', 'fantasy'],
      dna: film({
        aesthetic:
          '80s sword-and-sorcery cinema: practical fantasy films with backlit fog, torch-lit sets, rubber creatures and sweaty, rim-lit warriors on 35 mm.',
        color_and_tone:
          'Blue backlit fog against orange torchlight, deep blacks, bronze skin highlights.',
        lighting_and_shadow:
          'Strong blue backlight through fog, warm torches as key, hard rim light outlining muscles and blades.',
        texture_and_material:
          'Fur, oiled leather, rough bronze and iron, foam-rubber creatures, dry-ice smoke on the floor.',
        camera_and_composition:
          'Low heroic angles, silhouettes on smoky altars, anamorphic flares from torches.',
        atmosphere_and_mood: 'Savage and mythic, pulpy heroism in a haze of smoke.',
        rendering_and_quality:
          '35 mm grain and practical-effects charm; not a painted pulp illustration.',
        key_features:
          'blue backlit fog; orange torch key; rim-lit warriors; practical rubber creatures; smoky altars',
      }),
      avoid: [...BASE, 'clean digital grade', 'painted illustration'],
      briefs: [
        '80s sword-and-sorcery film still of an adult barbarian warrior raising a broadsword on a smoking stone altar, blue fog backlighting him, orange torches on each side, dry-ice smoke on the floor. No text or logo.',
        '80s sword-and-sorcery still of an adult sorceress in bone jewelry on a cliff-top throne, torches flaring, a rim of blue light on her horned headdress. No text or logo.',
        '80s sword-and-sorcery still of a giant foam-rubber serpent rising from a flooded temple pool as an adult warrior braces with a spear, fog and torchlight. No text or logo.',
      ],
    },
    {
      name: 'Italian Neorealism',
      domain: 'postwar neorealist cinema',
      tags: ['neorealism', 'black-and-white', 'documentary-cinema'],
      dna: film({
        aesthetic:
          'Italian neorealism: postwar black-and-white cinema shot in real streets and courtyards with non-actors, available light and plain, honest framing.',
        color_and_tone: 'Soft grey black and white with open shadows and hazy daylight.',
        lighting_and_shadow: 'Natural daylight and overcast skies; no studio lighting or glamour.',
        texture_and_material: 'Worn clothes, rubble, laundry lines, cracked plaster and cobbles.',
        camera_and_composition:
          'Eye-level medium and wide shots, people embedded in crowds and real places, long lenses rare.',
        atmosphere_and_mood: 'Humane and aching, ordinary struggle filmed with compassion.',
        rendering_and_quality: 'Grainy postwar film stock; no stylization and no heroic posing.',
        key_features:
          'real locations; non-actor faces; available daylight; eye-level framing; soft grey black and white',
      }),
      avoid: [...BASE, 'glamour lighting', 'color'],
      briefs: [
        'Italian neorealist film still of adult fishermen hauling a wooden boat up a pebble beach while their wives watch from the sea wall, overcast daylight, grainy black and white. No text or logo.',
        'Italian neorealist still of an adult man searching a crowded courtyard of laundry lines and handcarts for his stolen cart, eye-level, soft grey light. No text or logo.',
        'Italian neorealist still of an adult woman carrying a water jug up a half-ruined stone stair past neighbors on their balconies, hazy daylight. No text or logo.',
      ],
    },
    {
      name: 'Peplum Sword-and-Sandal Epic',
      domain: 'peplum epic cinema',
      tags: ['peplum', 'epic-cinema', 'widescreen'],
      dna: film({
        aesthetic:
          'Peplum sword-and-sandal epic: late-1950s widescreen color films of mythic strongmen, painted skies and plaster temples.',
        color_and_tone:
          'Eastmancolor gold, marble white, imperial purple and blood red under a painted blue sky.',
        lighting_and_shadow:
          'Bright hard studio sun, oiled skin highlights, crisp shadows on plaster columns.',
        texture_and_material:
          'Plaster columns, gilded props, leather sandals, oiled muscles and linen tunics.',
        camera_and_composition:
          'Wide widescreen tableaux, heroic low angles, crowds of extras arranged in symmetrical ranks.',
        atmosphere_and_mood: 'Grand and naive, mythic heroics staged with theatrical confidence.',
        rendering_and_quality:
          'Vintage widescreen color print where the props and painted skies read openly as props.',
        key_features:
          'painted skies; plaster temples; oiled strongmen; Eastmancolor gold and purple; widescreen tableaux',
      }),
      avoid: [...BASE, 'gritty realism', 'desaturated grade'],
      briefs: [
        'Peplum epic film still of an adult strongman pushing apart two plaster temple columns as the pediment cracks above him, painted blue sky, gold and purple costumes on fleeing extras. No text or logo.',
        'Peplum still of an adult gladiatrix saluting in a painted arena, ranks of extras in the stands, hard studio sun on her bronze helmet. No text or logo.',
        'Peplum still of an adult queen reclining on a golden barge with purple sails on a painted river, fan-bearers in symmetrical rows. No text or logo.',
      ],
    },
  ],
};

export default spec;
