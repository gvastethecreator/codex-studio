import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'readable fake text',
  'readable ticker',
  'logo clutter',
  'real presenter likeness',
  'celebrity likeness',
  'franchise likeness',
  'adding a presenter or host the prompt did not ask for',
];

// Broadcast formats keep the prompt's content and render it as a frame of the format.
const frame =
  'Keep the prompt subject, action and setting; render them as a frame of this broadcast format, without adding a presenter, host, audience or readable caption the prompt did not ask for.';
// Graphic formats are profiles that own the whole frame; any bands or panels stay textless.
const graphic =
  'Keep the prompt subject as the content of the graphic; this preset owns the on-screen layout, and every band, panel or symbol stays free of readable text.';

function tv(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? frame, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_02',
  category: '2. TV And Broadcast',
  updates: {
    'SP02-017': {
      dna: tv({
        aesthetic:
          '90s sitcom set look: a bright three-wall studio set lit by an even overhead wash, staged so every actor faces the audience side.',
        color_and_tone:
          'Warm beige, cream and wood tones with one or two cheerful accent colors; low contrast.',
        lighting_and_shadow:
          'Flat overhead studio wash from many fixtures, soft multiple shadows, no dark corners anywhere on the set.',
        texture_and_material:
          'Floral sofas, wood paneling, kitchen counters and knickknacks, all clean and new-looking.',
        camera_and_composition:
          'Wide proscenium framing from the missing fourth wall, actors spread in a shallow arc, doors and stairs visible.',
        atmosphere_and_mood:
          'Cozy and comic, a safe living room where every problem resolves by the end.',
        rendering_and_quality:
          'Clean broadcast color of the set itself; tape artifacts belong to Analog Sitcom Multicam, not here.',
        key_features:
          'three-wall studio set; flat overhead wash; actors staged toward the fourth wall; beige and cream palette; proscenium framing',
      }),
      avoid: [...AVOID, 'cinematic', 'dark moody light'],
      briefs: [
        '90s sitcom frame of a family of adult ogres squeezed onto a floral sofa in a bright three-wall living-room set, one holding a giant bowl of popcorn, everyone facing the missing fourth wall, flat overhead wash. No text or logo.',
        '90s sitcom frame of an adult wizard roommate bursting through the front door of a beige apartment set holding a smoking cauldron, two adult roommates frozen on the couch mid-sip. No text or logo.',
        '90s sitcom frame of two adult knights in full armor arguing over the last slice of pie at a kitchen-counter set, bright even light, stairs and doors visible behind. No text or logo.',
      ],
    },
    'SP02-121': {
      dna: tv({
        aesthetic:
          'Analog sitcom multicam: a frame of a studio comedy recorded on broadcast videotape and dubbed a few generations, so the signal itself carries the look.',
        color_and_tone:
          'Slightly bleeding reds and oranges, lifted blacks, warm tape cast, soft highlight blooming.',
        lighting_and_shadow: 'Even studio wash softened further by the tape; no deep shadows.',
        texture_and_material:
          'Interlace combing on movement, dot crawl on edges, chroma bleed, faint tracking ripple at the bottom.',
        camera_and_composition:
          'Multicam medium shots cutting between actors, framed a little loose.',
        atmosphere_and_mood: 'Nostalgic and warm, a rerun remembered through worn tape.',
        rendering_and_quality:
          'Standard-definition tape signal with generation loss; no film grain or HD sharpness.',
        key_features:
          'interlace combing; chroma bleed; dot crawl; tape generation softness; loose multicam medium shots',
      }),
      avoid: [...AVOID, 'cinematic noir', 'HD sharpness'],
      briefs: [
        'Analog multicam sitcom frame on worn videotape of an adult vampire landlord knocking on an apartment-set door, a pie in his other hand, interlace combing on his cape, chroma bleed on the red door. No text or logo.',
        'Analog multicam frame of adult regulars on stools at a witch-run diner counter set, bubbling cauldron behind the counter, tape softness and dot crawl. No text or logo.',
        'Analog multicam frame of an adult family of translucent ghosts seated at a dinner-table set, lifted blacks and warm tape cast, a tracking ripple at the bottom edge. No text or logo.',
      ],
    },
    'SP02-018': {
      dna: tv({
        aesthetic:
          'Network news studio look: the subject lit and framed as a headline segment in front of a cool blue LED video wall.',
        color_and_tone:
          'Cool blue and white studio palette, glossy surfaces, a single red accent, crisp HD color.',
        lighting_and_shadow:
          'Soft frontal key with bright hair light and blue backlight from the LED wall; no dramatic shadow.',
        texture_and_material: 'Glossy desk surfaces, glass, brushed metal, clean fabrics.',
        camera_and_composition:
          'Medium shot at desk height, subject centered or on a third, video wall softly out of focus behind.',
        atmosphere_and_mood: 'Urgent and authoritative, every subject presented as breaking news.',
        rendering_and_quality:
          'Crisp HD broadcast signal; no ticker, no readable graphics and no added anchor.',
        key_features:
          'blue LED video wall; glossy desk; soft key with hair light; desk-height medium shot; crisp HD',
      }),
      avoid: [...AVOID, 'movie grain'],
      briefs: [
        'News-studio frame of an adult crowned queen giving a solemn statement at a glossy desk, cool blue LED wall showing a blurred castle behind her, soft key and bright hair light, crisp HD. No ticker, text or logo.',
        'News-studio frame of an adult alchemist holding up a glowing green potion at the desk as the camera pushes in, blue studio light, glass and brushed metal set. No text or logo.',
        'News-studio frame of a speckled dragon egg displayed on a pedestal beside the news desk, the LED wall glowing blue behind it, crisp HD. No text or logo.',
      ],
    },
    'SP02-122': {
      dna: tv({
        aesthetic:
          'Local news chroma-key package: the subject keyed over a background plate on a budget, with telltale green halos and mismatched light.',
        color_and_tone:
          'Studio-blue foreground over an oversaturated background plate; faint green spill on edges.',
        lighting_and_shadow:
          'Foreground and background lit differently, so the subject never quite sits in the plate.',
        texture_and_material:
          'Hard or fringed key edges, blocky compression around hair, a flat inset rectangle.',
        camera_and_composition:
          'Subject standing in front of the plate, a small inset box in an upper corner.',
        atmosphere_and_mood: 'Earnest and slightly clumsy, local television trying its best.',
        rendering_and_quality:
          'Standard-definition video with visible compositing flaws; no readable graphics.',
        key_features:
          'chroma-key halo; mismatched foreground and plate light; green spill; inset rectangle; SD compression',
      }),
      avoid: [...AVOID, 'seamless composite', 'cinematic grain'],
      briefs: [
        'Local-news chroma-key frame of an adult weather mage in a starry robe keyed over a stormy sea plate, a green halo around her hat and sleeves, mismatched warm and cold light. No text or logo.',
        'Local-news chroma-key frame of an adult town crier with a brass bell keyed over a castle-gate background, fringed key edges and an empty inset box in the corner. No text or logo.',
        'Local-news chroma-key frame of a goat keyed over a snowy mountain plate, jagged key edges around its beard, blocky compression. No text or logo.',
      ],
    },
    'SP02-019': {
      dna: tv({
        aesthetic:
          'Daytime soap opera: high-gloss video with heavy diffusion, melodramatic close-ups and slow zooms onto shocked faces.',
        color_and_tone:
          'Warm glowing skin, creamy highlights, soft pastel interiors, bloom around every light.',
        lighting_and_shadow:
          'Soft frontal key, strong backlight halo on hair, diffusion filter spreading highlights.',
        texture_and_material:
          'Silk, satin, polished wood and chandeliers, all rendered with video smoothness.',
        camera_and_composition:
          'Tight close-ups and two-shots, slow push-ins, one face turned toward the lens.',
        atmosphere_and_mood: 'Melodramatic and glossy, a secret about to be revealed.',
        rendering_and_quality: 'High-frame-rate video gloss with diffusion bloom; no film grain.',
        key_features:
          'diffusion bloom; hair backlight halo; melodramatic close-up; slow push-in; video gloss',
      }),
      avoid: [...AVOID, 'film grain', 'gritty'],
      briefs: [
        'Soap-opera frame of an adult duchess turning sharply toward the camera in a candle-lit drawing room, diffusion bloom around the candles, backlit hair halo, slow push-in. No text or logo.',
        'Soap-opera frame of two adult twin brothers in a mansion library, one revealed from behind a velvet curtain as the other gasps, glossy video light. No text or logo.',
        'Soap-opera frame of an adult nurse and an adult surgeon in a tense near-embrace in a hospital corridor, soft diffusion, warm glowing skin. No text or logo.',
      ],
    },
    'SP02-020': {
      dna: tv({
        aesthetic:
          'Reality TV confessional: a contestant alone in a chair speaking straight into the lens against a colored backdrop.',
        color_and_tone:
          'Saturated backdrop color (purple, teal, orange), neutral skin, crisp video.',
        lighting_and_shadow:
          'One soft key and a colored backlight on the backdrop; clean, flat, slightly harsh.',
        texture_and_material: 'Sharp video texture, visible makeup, casual or costume clothing.',
        camera_and_composition:
          'Centered chest-up framing, eyes into the lens, slight wide-angle closeness.',
        atmosphere_and_mood: 'Confessional and gossipy, private feelings performed for everyone.',
        rendering_and_quality:
          'Crisp reality-TV video with no readable name captions or show graphics.',
        key_features:
          'direct-to-lens confession; colored backdrop; centered chest-up shot; soft key; crisp video',
      }),
      avoid: [...AVOID, 'scripted drama lighting', 'name caption'],
      briefs: [
        'Reality-TV confessional frame of an adult dwarf miner in a soot-streaked tunic complaining straight into the lens, purple backdrop, soft key, crisp video. No caption, text or logo.',
        'Reality-TV confessional frame of an adult elf contestant crying mascara onto a silk collar against a teal backdrop, looking into the lens. No caption, text or logo.',
        'Reality-TV confessional frame of an adult knight contestant leaning in to whisper a secret to the camera, helmet on his lap, orange backdrop. No caption, text or logo.',
      ],
    },
    'SP02-021': {
      name: 'Fisheye Glam Music Video',
      dna: tv({
        aesthetic:
          'Fisheye glam music video: late-90s luxury performance video shot through an extreme fisheye lens, with chrome, velvet and slow-motion opulence.',
        color_and_tone:
          'Chrome silver, ice white, deep purple velvet and gold; high gloss and saturation.',
        lighting_and_shadow:
          'Bright colored backlights, glossy specular highlights, glowing floor.',
        texture_and_material:
          'Chrome, patent leather, velvet, crystal and satin, all highly reflective.',
        camera_and_composition:
          'Extreme fisheye close to the performer, bulging center, curved horizon, low wide angle.',
        atmosphere_and_mood: 'Opulent and larger than life, a star leaning straight into the lens.',
        rendering_and_quality: 'Glossy 35 mm music-video look; invented performers only.',
        key_features:
          'extreme fisheye bulge; chrome and purple velvet; glossy specular light; performer close to lens; slow-motion opulence',
      }),
      avoid: [...AVOID, 'boring framing', 'rectilinear lens'],
      briefs: [
        'Fisheye glam music-video frame of an adult sorceress in chrome-silver robes leaning into the lens inside a tunnel of mirrors, the center bulging, purple and white backlights. No text or logo.',
        'Fisheye music-video frame of an adult performer in a silver puffer coat and gold chains leaning into the lens in a white void, glossy floor reflecting, low wide angle. Invented person. No text or logo.',
        'Fisheye music-video frame of an adult dancer in a purple velvet suit on a spinning chrome platform, the curved horizon swinging around him. No text or logo.',
      ],
    },
    'SP02-022': {
      dna: tv({
        aesthetic:
          'Security monitor wall: several CCTV feeds shown together in a quad split on a CRT monitor, so the scene is seen from four fixed cameras at once.',
        subject_treatment: graphic,
        color_and_tone:
          'Grainy black and white or washed green feeds, glowing phosphor, dark monitor bezel.',
        lighting_and_shadow:
          'Each feed lit by its own location; monitor glow spilling onto the dark desk.',
        texture_and_material: 'Low resolution, compression blocks, scanlines and CRT curvature.',
        camera_and_composition:
          'Four panels in a two-by-two grid, each a high-corner view of a different part of the scene.',
        atmosphere_and_mood:
          'Watchful and uneasy, something appearing in one feed and not in the others.',
        rendering_and_quality:
          'Multi-feed monitor presentation; distinct from the single-camera CCTV profile in pack_01; no readable labels.',
        key_features:
          'two-by-two feed grid; CRT curvature and scanlines; high-corner views; grainy monochrome; one anomaly',
      }),
      avoid: [...AVOID, 'color hd', 'readable camera labels'],
      briefs: [
        "Security monitor quad split on a CRT showing four grainy black-and-white feeds of a castle's gate, stairwell, treasury and stable, a masked adult figure appearing only in the treasury feed. No labels, text or logo.",
        "Single full-frame CCTV feed from a high corner fisheye camera inside a tavern kitchen at night: an adult thief in a knight's surcoat freezes mid-step while lifting a roast from the spit, the whole room bent by the wide lens, grainy monochrome, blown hotspot from the hearth, scanlines. No timestamp, labels, text or logo.",
        'Single full-frame night-vision CCTV feed of a cobbled castle courtyard where a huge winged dragon has just landed among parked hay carts, its eyes glowing white in infrared, green-grey monochrome, heavy compression blocks. No timestamp, labels, text or logo.',
      ],
    },
    'SP02-023': {
      dna: tv({
        aesthetic:
          'VHS home video: a family camcorder recording in the 1990s, played back from a worn tape.',
        color_and_tone:
          'Oversaturated reds, bleeding color, blue-green shadows, warm tungsten indoors.',
        lighting_and_shadow:
          'On-camera light or harsh available light; blown windows and deep shadow falloff.',
        texture_and_material:
          'Tracking lines, head-switching noise at the bottom, soft focus, auto-focus hunting.',
        camera_and_composition:
          'Handheld, zoom wobble, family members crowding and waving at the lens.',
        atmosphere_and_mood: 'Tender and chaotic, family memory in a warm fuzz.',
        rendering_and_quality:
          'Consumer VHS signal; a date stamp or REC mark only as unreadable shapes.',
        key_features:
          'camcorder handheld; tracking lines and head-switching noise; bleeding reds; zoom wobble; blown windows',
      }),
      avoid: [...AVOID, 'hd', 'readable date stamp'],
      briefs: [
        'VHS home-video frame of an adult family singing around a backyard table as a dragon-shaped birthday cake is carried out, candles blooming, tracking lines at the bottom, bleeding reds. No readable date stamp or logo.',
        'VHS home-video frame of adult siblings building a snow fort in a backyard, one throwing a snowball at the lens, zoom wobble and head-switching noise. No readable text or logo.',
        'VHS home-video frame of an adult grandmother unwrapping a hand-carved wooden sword at a holiday table, warm tungsten light and blown window behind. No readable text or logo.',
      ],
    },
    'SP02-024': {
      dna: tv({
        aesthetic:
          'Public access TV studio: a sincere amateur show taped in a tiny community studio with cheap sets and uneven lighting.',
        color_and_tone:
          'Muddy colors, a bright blue curtain or glitter backdrop, blown faces, UHF color noise.',
        lighting_and_shadow:
          'One or two badly placed lights, hot spots, harsh shadows on the curtain.',
        texture_and_material:
          'Cheap props, tinsel, plywood desks, noisy UHF reception and bad keying.',
        camera_and_composition: 'Static wide shot, framing slightly off, microphone cable visible.',
        atmosphere_and_mood: 'Awkward and sincere, homemade passion on a zero budget.',
        rendering_and_quality: 'Low-grade analog signal; any graphics blocky and textless.',
        key_features:
          'tiny community studio; blue curtain backdrop; badly placed lights; UHF noise; awkward static framing',
      }),
      avoid: [...AVOID, 'professional polish'],
      briefs: [
        'Public-access TV frame of an adult retired blacksmith proudly showing a miniature iron castle he forged, on a plywood desk before a sagging blue curtain, one harsh light, UHF noise. No text or logo.',
        'Public-access TV frame of an adult tarot reader in a sequined shawl on a cheap set with a glitter backdrop and a badly keyed starfield behind her. No text or logo.',
        'Public-access TV frame of an adult trio of lute players performing in a tiny studio, a microphone cable across the floor, static wide shot, muddy colors. No text or logo.',
      ],
    },
    'SP02-123': {
      dna: tv({
        aesthetic:
          'Public access cable crawl: a community-bulletin slide from a character generator, with gradient backgrounds, clip-art and scrolling bands, played over VHS noise.',
        subject_treatment: graphic,
        color_and_tone:
          'Royal blue to purple gradients, saturated yellow and magenta bands, VHS color bleed.',
        lighting_and_shadow: 'Flat graphic light; no scene lighting beyond the inset photo.',
        texture_and_material:
          'Pixelated clip-art, drop-shadowed shapes, scanlines, chroma noise and an unsteady crawl band.',
        camera_and_composition:
          'Title-safe slide layout: an inset still of the subject, empty title bars, a crawl band at the bottom.',
        atmosphere_and_mood:
          'Endless and oddly comforting, community notices looping through the night.',
        rendering_and_quality:
          'Analog cable character-generator look with all text replaced by blank bars.',
        key_features:
          'gradient bulletin slide; pixel clip-art; blank crawl band; inset still photo; VHS noise',
      }),
      avoid: [...AVOID, 'crisp typography', 'high production value'],
      briefs: [
        'Public-access cable bulletin slide on a royal-blue gradient with a pixelated clip-art castle, an inset photo of a village fair and blank yellow title bars, a textless crawl band at the bottom, VHS noise. No readable text or logo.',
        'Public-access cable slide showing an inset still of a lost grey donkey, magenta and yellow empty bars around it, scanlines and chroma bleed. No readable text or logo.',
        'Public-access cable slide of a cheap photo of a bake-sale table framed by drop-shadowed clip-art stars, the crawl band running blank blocks. No readable text or logo.',
      ],
    },
    'SP02-025': {
      dna: tv({
        aesthetic:
          'Infomercial before-and-after: a split screen contrasting a gray, clumsy "before" struggle with a bright, triumphant "after".',
        color_and_tone:
          'Left half desaturated or black and white; right half saturated primaries and bright whites.',
        lighting_and_shadow:
          'Flat, gloomy light on the before side; overlit high-key light on the after side.',
        texture_and_material: 'Exaggerated mess and frustration versus spotless gleaming results.',
        camera_and_composition:
          'Vertical split with a hard dividing line, the same subject in both halves, exaggerated expressions.',
        atmosphere_and_mood: 'Absurd and persuasive, frustration flipped into miracle.',
        rendering_and_quality:
          'Late-night video comparison look; no readable price or phone number.',
        key_features:
          'hard vertical split; gray before versus bright after; same subject twice; exaggerated struggle; overlit result',
      }),
      avoid: [...AVOID, 'readable price', 'phone number'],
      briefs: [
        'Infomercial split screen: on the gray black-and-white left an adult knight struggles to scrub rust off his armor, on the bright color right the same knight holds up a gleaming chestplate with a huge smile. No text or logo.',
        'Infomercial split screen of an adult witch tangled in the bristles of a broom on the gloomy left side, gliding serenely on the bright right side. No text or logo.',
        'Infomercial split screen of an adult baker staring at a collapsed loaf on the gray left, proudly lifting a perfect golden loaf on the bright right. No text or logo.',
      ],
    },
    'SP02-126': {
      dna: tv({
        aesthetic:
          'Late-night infomercial gloss: an overlit demonstration set where a miracle product performs, surrounded by starbursts and arrows.',
        color_and_tone:
          'Hot red, yellow and blue graphics over bright white; glossy saturated products.',
        lighting_and_shadow:
          'Overlit high-key from every direction; hard specular gloss on the product.',
        texture_and_material:
          'Chrome, plastic, bubbling liquids and spotless counters, with glossy sheen.',
        camera_and_composition:
          'Product front and center, textless starburst and arrow callout shapes pointing at it.',
        atmosphere_and_mood: 'Frantic and overexcited, every second a miracle demonstration.',
        rendering_and_quality: 'Glossy late-night video with callout shapes that stay textless.',
        key_features:
          'overlit demo set; textless starburst callouts; glossy product; hot primaries; frantic energy',
      }),
      avoid: [...AVOID, 'tasteful minimalism', 'readable price'],
      briefs: [
        'Late-night infomercial frame of an adult salesman in a bright blazer demonstrating a self-stirring cauldron on an overlit kitchen set, textless yellow starbursts and red arrows pointing at the bubbling pot. No text or logo.',
        'Late-night infomercial frame of a glowing whetstone sharpening a battered dagger to a mirror edge on a white counter, blue and red callout shapes, glossy highlights. No text or logo.',
        'Late-night infomercial frame of an enchanted mop scrubbing a dungeon flagstone floor by itself, a path of sparkling clean stone behind it, overlit and glossy. No text or logo.',
      ],
    },
    'SP02-026': {
      dna: tv({
        aesthetic:
          'Live sports broadcast: an HD telephoto camera on the rail following the action under floodlights, with the flat, bright look of a live feed.',
        color_and_tone:
          'Saturated field color, bright floodlit whites, clean neutral broadcast grading.',
        lighting_and_shadow:
          'Stadium floodlights from several directions creating multiple soft shadows.',
        texture_and_material: 'Sharp HD detail on athletes, slightly compressed crowd behind.',
        camera_and_composition:
          'Long telephoto from the side, athletes compressed against a blurred crowd, action centered.',
        atmosphere_and_mood: 'Electric and immediate, the moment happening live.',
        rendering_and_quality:
          'Clean HD live feed; any scorebug reduced to a textless shape or omitted.',
        key_features:
          'rail telephoto; floodlit multiple shadows; compressed crowd; saturated field color; live HD feed',
      }),
      avoid: [...AVOID, 'movie grade', 'readable scoreboard'],
      briefs: [
        'Live sports broadcast frame of an adult dragon-boat crew racing on a lake, paddles in unison and spray flying, telephoto from the shore, saturated water and floodlit dusk. No text or logo.',
        'Live sports broadcast frame of an adult archer at full draw in a floodlit stadium final, multiple soft shadows, crowd compressed and blurred behind. No text or logo.',
        'Live sports broadcast frame of an adult rider and horse clearing a hedge in a steeplechase, rail telephoto, mud flying, bright broadcast color. No text or logo.',
      ],
    },
    'SP02-124': {
      dna: tv({
        aesthetic:
          'VHS sports replay: an analog freeze-frame breakdown with hand-drawn telestrator circles and arrows and a stepped replay inset.',
        subject_treatment: graphic,
        color_and_tone:
          'Faded tape color, yellow and white telestrator strokes, blue replay inset border.',
        lighting_and_shadow: 'Frozen stadium light from the original footage; no new lighting.',
        texture_and_material:
          'Freeze-frame jitter, motion combing, tape noise and chunky telestrator lines.',
        camera_and_composition:
          'Main frozen frame with circles and arrows on the key action, plus a small inset of stepped positions.',
        atmosphere_and_mood: 'Analytical and dramatic, one decisive moment dissected.',
        rendering_and_quality:
          'Analog replay package whose graphics stay entirely textless and hand-drawn.',
        key_features:
          'telestrator circles and arrows; freeze-frame jitter; stepped replay inset; tape noise; motion combing',
      }),
      avoid: [...AVOID, 'filmic slow cinema', 'clean vector'],
      briefs: [
        'VHS sports replay freeze-frame of an adult fencing touch, a yellow telestrator circle around the blade tip and an arrow along the lunge, motion combing and tape noise. No text or logo.',
        'VHS sports replay of an adult pole vaulter clearing the bar, a stepped inset showing four positions, white telestrator arcs over the jump. No text or logo.',
        "VHS sports replay of a knight's lance shattering on a shield, three stepped frames in an inset, chunky arrows pointing at the splinters. No text or logo.",
      ],
    },
    'SP02-027': {
      dna: tv({
        aesthetic:
          'Weather channel forecast graphic: a composited map with isobars, weather symbols and temperature gradients, rendered in broadcast graphic style.',
        subject_treatment: graphic,
        color_and_tone:
          'Blue-to-red temperature gradients, green land, white isobars, bright yellow suns.',
        lighting_and_shadow: 'Soft 3D map shading and glowing symbols; no scene lighting.',
        texture_and_material:
          'Satellite-style terrain texture, translucent cloud layers and softly beveled weather symbols.',
        camera_and_composition:
          'Map view tilted slightly in 3D, symbols placed over regions, clean layered composition.',
        atmosphere_and_mood: 'Helpful and orderly, the sky explained in shapes and colors.',
        rendering_and_quality:
          'Broadcast forecast graphics with no readable place names or numbers.',
        key_features:
          'composited forecast map; isobar lines; weather symbols; temperature gradient; textless 3D map',
      }),
      avoid: [...AVOID, 'readable place names', 'readable numbers'],
      briefs: [
        'Weather-channel forecast graphic of an invented island kingdom, white isobars curving over a blue-to-red temperature gradient, glowing sun and storm-cloud symbols on each region, tilted 3D map. No readable names, numbers or logo.',
        'Weather-channel graphic of a satellite composite of a storm spiraling over a mountainous fantasy continent, curved wind-flow arrows and translucent cloud layers. No readable text or logo.',
        'Weather-channel graphic of a 3D mountain valley map with snowflake symbols, blue cold bands and a line of approaching clouds. No readable text or logo.',
      ],
    },
    'SP02-125': {
      dna: tv({
        aesthetic:
          'Doppler radar graphic: a radar sweep turning precipitation into green, yellow, orange and red cells over a dark map.',
        subject_treatment: graphic,
        color_and_tone:
          'Dark navy map with radar reflectivity colors from green through yellow to red and magenta.',
        lighting_and_shadow: 'Glowing sweep line and cell colors; no physical light.',
        texture_and_material:
          'Blocky radar pixels, contour bands, a rotating sweep with a fading trail.',
        camera_and_composition: 'Top-down radar view with the sweep origin at the center or edge.',
        atmosphere_and_mood: 'Urgent and alarming, a storm read as color fields.',
        rendering_and_quality:
          'Abstract radar graphic, not a photograph of weather; no readable labels.',
        key_features:
          'radar sweep line; green-to-red reflectivity cells; dark map; blocky radar pixels; top-down view',
      }),
      avoid: [...AVOID, 'photoreal weather', 'readable labels'],
      briefs: [
        'Doppler radar graphic of a squall line sweeping toward a dark coastline, green and yellow cells with a red core, the glowing sweep line trailing behind. No readable labels or logo.',
        'Doppler radar graphic of a single storm cell with a hook-shaped red and magenta echo, contour bands around it on a navy map. No readable labels or logo.',
        'Doppler radar graphic of a huge storm system whose reflectivity cells happen to form the outline of a coiled dragon, top-down, blocky radar pixels. No readable labels or logo.',
      ],
    },
    'SP02-028': {
      name: '90s Grunge Music Video',
      dna: tv({
        aesthetic:
          '90s grunge music video: distressed film and video mixed with jump cuts, video feedback and anti-polish aggression.',
        color_and_tone:
          'Dirty greens, rust browns and washed yellows, crushed blacks, occasional feedback color burst.',
        lighting_and_shadow: 'Single bulbs, work lights and strobes; harsh and uneven.',
        texture_and_material:
          'Scratched film, video feedback trails, flannel, sweat, hair in motion, peeling walls.',
        camera_and_composition:
          'Handheld and tilted, performer cut off by the frame, frames stuttering.',
        atmosphere_and_mood: 'Angry and raw, loud feeling with no interest in looking pretty.',
        rendering_and_quality:
          'Distressed mixed-media music-video look; no clean studio polish or channel logo.',
        key_features:
          'distressed film and video; jump-cut stutter; single bulb light; video feedback; tilted handheld',
      }),
      avoid: [...AVOID, 'clean polish', 'channel logo'],
      briefs: [
        '90s grunge music-video frame of an adult bassist thrashing in a flooded basement under a single swinging bulb, scratched film, hair whipping, a stutter of doubled frames. No text or logo.',
        '90s grunge music-video frame of an adult singer screaming into a microphone on a hay bale in a dark barn, video feedback trails in green and rust. No text or logo.',
        '90s grunge music-video frame of an adult drummer in a crumbling ballroom with torn curtains, strobe light and tilted handheld framing. No text or logo.',
      ],
    },
    'SP02-127': {
      dna: tv({
        aesthetic:
          'Interlaced music-video glow: 90s cable performance video with blown colored gels, soft-focus bloom and dreamy interlaced motion.',
        color_and_tone:
          'Magenta, electric blue and amber gels, blooming highlights, soft glowing skin.',
        lighting_and_shadow: 'Colored backlights through haze, soft frontal glow, lens diffusion.',
        texture_and_material: 'Interlace lines on movement, chroma smear, motion echo trails.',
        camera_and_composition:
          'Slow circling moves around a performer, silhouettes against colored haze.',
        atmosphere_and_mood: 'Dreamy and romantic, a slow song made visible.',
        rendering_and_quality: 'Analog video glow; distinct from fisheye glam and grunge distress.',
        key_features:
          'blown colored gels; soft-focus bloom; interlace motion echo; haze silhouettes; slow circling camera',
      }),
      avoid: [...AVOID, 'clean digital cinema', 'natural light'],
      briefs: [
        'Interlaced music-video frame of an adult diva in a sheer silver gown singing under magenta and blue gels, soft bloom around her, interlace echo on her raised hand. No text or logo.',
        'Interlaced music-video frame of an adult saxophonist silhouetted in amber fog, a halo of soft-focus glow around the horn. No text or logo.',
        'Interlaced music-video frame of three adult singers in white suits on a slowly rotating stage, colored haze and motion echo trails. No text or logo.',
      ],
    },
    'SP02-029': {
      dna: tv({
        aesthetic:
          'Cooking show: a bright TV kitchen set with warm appetite lighting and overhead mirror shots of hands at work.',
        color_and_tone:
          'Warm whites, copper and wood, saturated fresh ingredients, clean stainless steel.',
        lighting_and_shadow:
          'Soft bright key over the counter, warm practicals behind, glossy food highlights.',
        texture_and_material:
          'Sizzling pans, steam, flour dust, chopped herbs and glistening sauces.',
        camera_and_composition:
          'Alternating overhead demonstration angle and waist-up counter shot, ingredients arranged in bowls.',
        atmosphere_and_mood: 'Warm and inviting, craft and appetite shared with the viewer.',
        rendering_and_quality:
          'Clean broadcast color; no readable recipe graphics or brand labels.',
        key_features:
          'bright TV kitchen set; overhead demo angle; steam and sizzle; prepped ingredient bowls; warm appetite light',
      }),
      avoid: [...AVOID, 'messy', 'readable recipe card'],
      briefs: [
        'Cooking-show frame of an adult dwarf chef searing a giant mushroom steak in a cast-iron pan on a bright TV kitchen set, steam rising, prepped bowls of herbs around him. No text or logo.',
        'Cooking-show overhead frame of adult hands folding dumplings on a floured wooden board, a row of finished dumplings and bowls of filling, warm macro light. No text or logo.',
        'Cooking-show frame of an adult elf baker pulling a glowing golden pie from a stone oven on a bright set, copper pans hanging behind. No text or logo.',
      ],
    },
    'SP02-030': {
      dna: tv({
        aesthetic:
          'Premium TV nature documentary: patient telephoto, slow motion and sweeping aerials, graded for spectacle and clarity.',
        color_and_tone:
          'Rich natural color, golden savannah light, deep ocean teal, lush greens, clean blacks.',
        lighting_and_shadow: 'Low sun, backlight on fur and spray, soft overcast in forests.',
        texture_and_material:
          'Fur, feathers, water droplets and dust shown in slow-motion clarity.',
        camera_and_composition:
          'Long telephoto behavior shots, slow-motion peak moments, or wide aerial sweeps with tiny animals.',
        atmosphere_and_mood: 'Awe-filled and patient, the drama of the natural world unfolding.',
        rendering_and_quality: 'High-end documentary grade; no narrator, captions or channel logo.',
        key_features:
          'slow-motion peak moment; telephoto patience; sweeping aerials; rich natural grade; documentary clarity',
      }),
      avoid: [...AVOID, 'cheap studio', 'channel logo'],
      briefs: [
        'Nature-documentary frame of a herd of wildebeest plunging into a brown river, spray frozen in slow motion, golden late light, telephoto from the far bank. No text or logo.',
        'Nature-documentary aerial frame sweeping over a waterfall canyon as a condor glides below the camera, mist rising, lush green walls. No text or logo.',
        "Nature-documentary slow-motion frame of a chameleon's tongue shooting out to catch a beetle, every droplet and scale sharp, soft green background. No text or logo.",
      ],
    },
    'SP02-115': {
      name: 'Marker-Edge Improvised Sitcom Cartoon',
      dna: tv({
        aesthetic:
          'Marker-edge sitcom cartoon: a homemade-looking TV animation drawn with dry felt markers, wobbly outlines and deliberately awkward timing.',
        subject_treatment:
          'Keep the prompt subject, action and setting; redraw them as a hand-made marker cartoon with simple shapes, without adding characters from any existing show.',
        color_and_tone:
          'Flat marker fills with streaks, muted primaries, uncolored gaps at the edges.',
        lighting_and_shadow:
          'No rendered lighting; flat color only, occasional marker hatching for shadow.',
        texture_and_material:
          'Dry marker streaks, uneven line weight, paper tooth and slight line boil.',
        camera_and_composition:
          'Static sitcom staging, characters in a row, simple kitchen or living-room layouts.',
        atmosphere_and_mood: 'Deadpan and awkward, humor in long pauses and shrugs.',
        rendering_and_quality: 'Hand-drawn TV softness; not a slick vector cartoon or 3D.',
        key_features:
          'dry marker linework; streaky flat fills; line boil; static sitcom staging; awkward deadpan timing',
      }),
      avoid: [...AVOID, 'digital slick vector', '3d', 'realistic'],
      briefs: [
        'Marker-edge sitcom cartoon frame of an adult game master and three adult friends at a kitchen table playing a dice game, wobbly felt-marker outlines, streaky flat fills, deadpan faces. No text or logo.',
        'Marker-edge cartoon frame of an adult knight in full armor trying and failing to fit through a small car door, flat muted colors, line boil. No text or logo.',
        'Marker-edge cartoon frame of an adult man and his cat both staring blankly at a smoking microwave, long awkward pause, dry marker texture. No text or logo.',
      ],
    },
    'SP02-128': {
      dna: tv({
        aesthetic:
          'Emergency broadcast signal break: an interrupted transmission where color bars, scanline tears and a warning shape cut through the picture.',
        subject_treatment: graphic,
        color_and_tone:
          'SMPTE-like color bars, harsh red and black warning shapes, gray signal snow.',
        lighting_and_shadow:
          'Screen glow only; a CRT lighting a dark room when the screen is shown.',
        texture_and_material:
          'Horizontal tearing, rolling bars, snow static, phosphor burn and flicker.',
        camera_and_composition:
          'The subject barely visible behind broken bands of signal, bars and a triangle warning symbol.',
        atmosphere_and_mood: 'Hostile and alarming, a transmission that should not be happening.',
        rendering_and_quality:
          'Analog signal failure look; the warning uses only symbols, no readable text.',
        key_features:
          'color bars; scanline tear; signal snow; warning triangle symbol; subject half lost behind noise',
      }),
      avoid: [...AVOID, 'soft film', 'friendly graphics'],
      briefs: [
        'Emergency broadcast signal break: color bars torn by horizontal scanlines over a faint image of a volcano erupting behind a village, a red warning triangle symbol pulsing in the center. No readable text or logo.',
        'Emergency signal break on an old CRT in a dark room, signal snow and a large warning triangle, the phosphor glow lighting an empty armchair. No readable text or logo.',
        'Emergency signal break frame of an empty torchlit throne room stuttering between rolling color bars and gray static. No readable text or logo.',
      ],
    },
  },
};

export default spec;
