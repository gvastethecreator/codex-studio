import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'clean digital sensor look',
  'generic stock-photo face',
  'celebrity likeness',
  'changing the requested setting',
  'aging props or costume to match the film',
];

// Inherited negatives that suppress the grain, softness or period the stock needs.
const GRAIN_DROP = ['noisy', 'blurry'];

// Rules shared by new presets, matching the photographic guard of the existing film stocks.
const FILM_BASE = [
  'illustration',
  'painting',
  'drawing',
  '3d render',
  'cartoon',
  'anime',
  'synthetic CGI',
  'plastic render',
  'digital HDR overprocessing',
  'oversharpened clarity',
  'generic vintage filter',
  'fake film border',
  'sprocket holes',
  ...AVOID,
];

// Film presets are modifiers: the capture changes, the subject, setting and framing stay as requested.
const keep =
  'Keep the prompt subject, action, setting and framing; change only the capture — emulsion color, grain, contrast curve, halation and lens behavior — so the named film or process is the first read. Do not age the costume, props or setting to match the film, and do not add frame borders, rebates or sprocket holes.';

function film(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? keep, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_01',
  category: '3. Film And Analog Process',
  updates: {
    'SP01-011': {
      dna: film({
        aesthetic:
          'Kodak Portra 400 color negative: a forgiving portrait stock rated at 400 and usually overexposed by a stop, giving creamy low-contrast color and flattering skin.',
        color_and_tone:
          'Peach and apricot skin, warm neutral whites, pastel highlights that roll off instead of clipping, soft sage greens and muted blues; shadows lifted and slightly warm.',
        lighting_and_shadow:
          'Wide latitude: bright skies and faces both hold detail; shadows open rather than crushed, highlight shoulder gentle.',
        texture_and_material:
          'Fine, even, tight grain visible in flat midtones and skies; no digital smoothing on skin.',
        camera_and_composition:
          'Keep the requested framing; 35 mm or 120 rendering with natural lens falloff and modest depth of field.',
        atmosphere_and_mood: 'Tender and unhurried, warmth and softness keeping every edge gentle.',
        rendering_and_quality:
          'Lab-scanned negative look: soft contrast curve, fine grain across the frame, no HDR clarity or oversaturation.',
        key_features:
          'overexposed color negative; peach skin tones; pastel highlight rolloff; lifted warm shadows; fine even grain',
      }),
      avoid: [...AVOID, 'crushed blacks', 'neon saturation'],
      dropAvoid: GRAIN_DROP,
      briefs: [
        'Photograph shot on Kodak Portra 400, overexposed one stop: a weathered old shepherd with a white beard and a flat wool cap resting against a drystone wall with an orphaned lamb asleep in his lap on an overcast afternoon. Creamy pastel sky, ruddy skin, soft sage grass, fine even film grain, gentle low contrast. No text, logo or film border.',
        'Photograph on Kodak Portra 400 of an elderly grey-haired couple, husband and wife, dancing slowly in a farmhouse kitchen before a midsummer bonfire glowing through the window. Soft window light, apricot skin, highlights rolling off without clipping, fine grain in the plaster wall. No text, logo or film border.',
        'Photograph on Kodak Portra 400 of a broad bearded adult man potter with clay-grey forearms trimming a bowl on a kick wheel beside a tall north window. Warm neutral whites, lifted shadows, fine grain across the wet clay and apron. No text, logo or film border.',
      ],
    },
    'SP01-012': {
      dna: film({
        aesthetic:
          'Fujifilm Velvia 50 color slide: a slow, ultra-saturated landscape reversal film shot on a tripod, with dense blacks and almost no exposure latitude.',
        color_and_tone:
          'Electric greens, deep cobalt skies, scarlet and magenta reds pushed hard; warm-magenta bias in dawn and dusk light; shadows fall to rich black.',
        lighting_and_shadow:
          'Narrow latitude: highlights hold only where exposure is exact, shadows block to black; best under soft dawn light or low sun after rain.',
        texture_and_material:
          'Almost invisible fine grain; crisp micro-detail in leaves, rock and water; wet surfaces glossy and saturated.',
        camera_and_composition:
          'Keep the requested framing; tripod-still sharpness front to back, as if shot at a small aperture.',
        atmosphere_and_mood:
          'Vivid and dramatic, saturated color pushing against dense black shadow.',
        rendering_and_quality:
          'Projected-slide intensity: high contrast, saturated but clean color, no HDR halos or digital clarity.',
        key_features:
          'ultra-saturated slide; electric greens; magenta dawn bias; crushed black shadows; near-invisible grain',
      }),
      avoid: [...AVOID, 'lifted matte blacks', 'desaturated palette'],
      dropAvoid: GRAIN_DROP,
      briefs: [
        'Landscape photograph on Fujifilm Velvia 50: a steep moss-green fjord under a bruised thunderhead, a lone longship with a blood-red sail on black water far below. Electric greens, deep cobalt, crushed black cliffs, near-invisible grain, tripod sharpness. No text, logo or film border.',
        'Photograph on Fujifilm Velvia 50 of a ring of lichen-covered standing stones in a meadow of scarlet poppies at dawn, magenta-tinted sky, saturated greens, black shadow between the stones. No text, logo or film border.',
        'Macro photograph on Fujifilm Velvia 50 of a fairy ring of crimson fly agaric mushrooms in a black-green spruce forest after rain, every white wart and water drop crisp, dense black shadows. No text, logo or film border.',
      ],
    },
    'SP01-013': {
      dna: film({
        aesthetic:
          'Ilford HP5 Plus at box speed 400: classic black-and-white documentary negative with a long, even grey scale and honest, moderate grain.',
        color_and_tone:
          'Pure monochrome; full range from paper-white to deep black with generous midtone greys; neutral, untoned.',
        lighting_and_shadow:
          'Medium contrast with open shadows; available light rendered as it falls, skies slightly light without a filter.',
        texture_and_material:
          'Visible, soft-edged grain even in midtones; skin, wool, stone and wood keep real texture.',
        camera_and_composition:
          'Keep the requested framing; 35 mm documentary rendering with natural lens falloff.',
        atmosphere_and_mood: 'Observant and sober, an even grey calm that lets the moment speak.',
        rendering_and_quality:
          'Darkroom-print look on neutral fiber paper; no crushed shadows, no push-processing grit, no digital clarity.',
        key_features:
          'box-speed black-and-white; long neutral grey scale; moderate soft grain; open shadows; documentary honesty',
      }),
      avoid: [...AVOID, 'sepia toning', 'blocked shadows'],
      briefs: [
        "Black-and-white documentary photograph on Ilford HP5 Plus: an adult fencing master adjusting a young adult student's lunge in a whitewashed hall, tall windows throwing soft light across the floorboards. Long neutral grey scale, moderate grain, open shadows. No text, logo or film border.",
        'Black-and-white photograph on Ilford HP5 Plus of an adult rat-catcher with two wire-haired terriers and a long pole in a cobbled courtyard, looking straight into the lens. Visible soft grain, full tonal range from white lime wash to black doorway. No text, logo or film border.',
        'Black-and-white photograph on Ilford HP5 Plus of adult horse traders haggling at a muddy horse fair, a dappled grey mare at the center of the crowd of wool coats and caps. Honest grain, medium contrast, 35 mm documentary framing. No text, logo or film border.',
      ],
    },
    'SP01-014': {
      dna: film({
        aesthetic:
          'Cinestill 800T: tungsten-balanced motion-picture stock with its anti-halation layer removed, so every bright light blooms with a red-orange halo.',
        color_and_tone:
          'Cool teal and cyan shadows from the tungsten balance, warm amber practicals, and saturated red-orange halation rings; daylight turns bluish.',
        lighting_and_shadow:
          'Night and interior practicals — lamps, lanterns, bulbs, fire — as point sources; halation glows around each one and around bright edges.',
        texture_and_material:
          'Medium, visible grain from the fast emulsion; soft glow on glossy surfaces near lights.',
        camera_and_composition:
          'Keep the requested framing; include at least one practical light so its red halo shows.',
        atmosphere_and_mood:
          'Nocturnal and melancholic, warm halos glowing against cool empty shadow.',
        rendering_and_quality:
          'Motion-picture negative look: soft rolloff, halation in-camera rather than painted glow, no digital bloom filter.',
        key_features:
          'red-orange halation halos; tungsten teal shadows; amber practicals; fast-film grain; night cinema stock',
      }),
      avoid: [...AVOID, 'daylight white balance', 'painted glow overlay'],
      dropAvoid: GRAIN_DROP,
      briefs: [
        'Night photograph on Cinestill 800T: an adult toll-keeper in a heavy cloak counting coins at a lantern-lit gatehouse in a city wall, three oil lanterns blooming with red-orange halation, cool teal stonework, medium film grain. No readable text, logo or film border.',
        'Photograph on Cinestill 800T of a remote roadside inn at night in thick fog, lanterns on the door and a coach waiting outside, every lamp ringed with red halation and the fog glowing teal. Visible grain. No readable signs, logo or film border.',
        'Photograph on Cinestill 800T of an adult cellar-tavern keeper polishing a pewter tankard under a string of bare bulbs, each bulb haloed red-orange, teal shadows in the vaulted brick. No readable text, logo or film border.',
      ],
    },
    'SP01-015': {
      dna: film({
        aesthetic:
          'Kodachrome 64 color slide: a slow, sharp reversal stock with dense dye layers, famous for rich reds, deep blues and weighty blacks.',
        color_and_tone:
          'Cardinal and tomato reds that pop, deep saturated blues, warm golden highlights, and dense near-black shadows; skin warm and slightly ruddy.',
        lighting_and_shadow:
          'Bright, direct daylight suits it best; contrast is high, shadows heavy and inky, highlights clean.',
        texture_and_material:
          'Very fine grain and crisp detail; paint, fabric and feathers look dense and solid.',
        camera_and_composition:
          'Keep the requested framing; 35 mm slide sharpness with a slightly warm projected glow.',
        atmosphere_and_mood: 'Confident and vivid, bold reds anchored by heavy inky shadows.',
        rendering_and_quality:
          'Slide-film density and color separation; modern subjects stay modern — no mid-century costume or props unless asked.',
        key_features:
          'dense slide dyes; cardinal red pop; deep blues; inky shadows; very fine grain',
      }),
      avoid: [...AVOID, 'pastel washed color', 'mid-century props not in the prompt'],
      dropAvoid: GRAIN_DROP,
      briefs: [
        'Photograph on Kodachrome 64: an adult abbess in a cardinal-red habit scattering grain for white doves in a sunlit ochre cloister, deep blue sky above the arches, dense inky shadows under the colonnade, very fine grain. No text, logo or film border.',
        'Photograph on Kodachrome 64 of an adult shipwright on a hanging plank repainting the hull of a bright red fishing boat in a dry dock, hard noon sun, tomato red against a deep blue harbor. No text, logo or film border.',
        'Photograph on Kodachrome 64 of an adult juggler practicing with five clubs beside a red lacquered traveling-show wagon on a summer meadow, dense slide color, golden highlights, black shade under the wagon. No text, logo or film border.',
      ],
    },
    'SP01-016': {
      dna: film({
        aesthetic:
          'Polaroid 600 integral instant film: a soft plastic-lens snapshot with built-in flash and the washed, dreamy color of instant chemistry — the emulsion look, not the print frame.',
        color_and_tone:
          'Low-contrast creamy highlights, cyan-green cast in the shadows, warm skin under flash, gently faded saturation; blacks never quite black.',
        lighting_and_shadow:
          'Built-in flash close to the lens: bright soft subject, quick falloff into a dim background, small flash reflections in eyes and glossy surfaces.',
        texture_and_material:
          'Soft overall focus, slightly mottled dye clouds, faint chemical spread unevenness at the image edges; no border drawn.',
        camera_and_composition:
          'Keep the requested framing; square-ish crop welcome, subject within a few meters of the flash.',
        atmosphere_and_mood:
          'Intimate and playful, a close flash moment already fading into memory.',
        rendering_and_quality:
          'Instant-film softness and faded chemistry; no crisp digital detail and no drawn white frame.',
        key_features:
          'integral instant color; cyan-green shadows; creamy low-contrast highlights; close flash falloff; soft plastic lens',
      }),
      avoid: [...AVOID, 'white instant-print frame'],
      dropAvoid: GRAIN_DROP,
      briefs: [
        'Instant photograph on Polaroid 600 film: an adult gardener proudly hugging a giant prize pumpkin in a dim greenhouse at dusk, on-camera flash lighting her face and the orange rind, background falling into murky green. Cyan-green shadows, creamy soft highlights, soft plastic-lens focus. No text, logo or print frame.',
        'Instant photograph on Polaroid 600 film of an adult reenactor in full plate armor eating a sandwich on a folding camp stool behind a medieval-fair tent, flash flattening the steel, faded instant color. No text, logo or print frame.',
        'Instant photograph on Polaroid 600 film of a black cat on a windowsill beside a carved turnip lantern at night, flash reflections in its eyes, cyan-tinted shadows and creamy flash falloff. No text, logo or print frame.',
      ],
    },
    'SP01-017': {
      dna: film({
        aesthetic:
          'Lomo LC-A snapshot: a compact zone-focus camera with a wide 32 mm lens, shot fast from the hip on saturated color negative, known for its tunnel vignette.',
        color_and_tone:
          'Punchy saturated center — deep blues, hot reds, vivid greens — with corners darkened almost to black.',
        lighting_and_shadow:
          'Auto exposure that favors the center; corners underexposed; night shots with long, slightly shaky exposure.',
        texture_and_material:
          'Medium grain, soft edges, sharpish center, occasional zone-focus miss.',
        camera_and_composition:
          'Keep the requested subject and setting; wide close perspective, slightly tilted horizon, subject centered in the bright tunnel.',
        atmosphere_and_mood:
          'Spontaneous and reckless, bright center energy squeezed by dark corners.',
        rendering_and_quality:
          'Heavy optical vignette and saturated negative color; no light leaks, sprocket holes or cross-processing (other presets own those).',
        key_features:
          'tunnel vignette; saturated center; wide 32 mm closeness; tilted hip-shot horizon; soft corners',
      }),
      avoid: [...AVOID, 'light leaks', 'cross-processed colors'],
      briefs: [
        'Photograph on a Lomo LC-A, shot from the hip: an adult drummer leading a torchlit night procession of villagers in carved wooden masks through a narrow lane, tilted horizon, saturated flame orange in the center, corners falling to black, medium grain. No text, logo or film border.',
        'Photograph on a Lomo LC-A from a low hip angle of an adult stilt-walker in a harlequin costume striding over a summer fair crowd, deep blue sky, heavy tunnel vignette, wide close distortion. No text, logo or film border.',
        'Photograph on a Lomo LC-A of a shaggy highland cow pushing its nose toward the lens on a purple heather hillside, wide lens close distortion, saturated center, dark soft corners. No text, logo or film border.',
      ],
    },
    'SP01-018': {
      name: 'Wet Plate Ambrotype',
      dna: film({
        aesthetic:
          'Wet plate ambrotype: a collodion negative on clear glass backed with black varnish so it reads as a positive, with ivory highlights floating on a deep black ground.',
        color_and_tone:
          'Monochrome ivory, warm grey and velvet black; orthochromatic response — blue skies and eyes go pale, reds and lips go dark.',
        lighting_and_shadow:
          'Large soft daylight source and exposures of several seconds; highlights creamy and luminous, shadows dissolving into the black backing.',
        texture_and_material:
          'Glassy depth, subtle collodion pour ripples and small comet marks near the margins; no film grain, surface faintly silvery.',
        camera_and_composition:
          'Keep the requested framing; Petzval-style lens with a sharp center, swirling soft edges and very shallow focus.',
        atmosphere_and_mood: 'Still and solemn, luminous faces floating out of a velvet void.',
        rendering_and_quality:
          'Positive-on-glass look, not a tintype plate or a paper print; modern subjects stay modern (an appliance stays an appliance).',
        key_features:
          'ivory on black glass; orthochromatic tones; Petzval swirl; collodion pour ripples; long-exposure stillness',
      }),
      avoid: [...AVOID, 'tintype metal plate', 'sepia paper print'],
      dropAvoid: ['modern'],
      briefs: [
        'Wet plate ambrotype photograph of an adult plague doctor in a beaked leather mask and waxed coat, seated perfectly still for a long exposure. Ivory highlights floating on black glass, the red cord at his throat turned nearly black by the orthochromatic plate, swirling Petzval blur at the edges, faint collodion pour ripples. No text, logo or frame.',
        'Wet plate ambrotype portrait of an adult woman in a high-necked dark dress holding a human skull in both hands as a memento mori, pale orthochromatic eyes, velvet black background, shallow focus and swirling edges. No text, logo or frame.',
        'Wet plate ambrotype still life of a brass astrolabe, a snuffed candle and a dried rose on a draped table, creamy highlights on the brass, glassy black depth, small comet marks in the corner. No text, logo or frame.',
      ],
    },
    'SP01-019': {
      name: 'Black-and-White Infrared Film',
      dna: film({
        aesthetic:
          'Black-and-white infrared film behind a deep red filter: living foliage glows white, clear skies turn nearly black, and highlights bloom with soft halation.',
        color_and_tone:
          'Monochrome with inverted landscape values: snow-white leaves and grass, near-black sky and water, luminous milky skin; no false color.',
        lighting_and_shadow:
          'Strong sunlight works best; bright infrared reflectors glow and spread light into their surroundings; shadows deep but soft-edged.',
        texture_and_material:
          'Pronounced grain, a dreamy bloom around white foliage, skin smoothed to porcelain by infrared penetration, dark veins sometimes visible.',
        camera_and_composition:
          'Keep the requested framing; include vegetation or sky where the prompt allows so the value inversion reads.',
        atmosphere_and_mood:
          'Otherworldly and frozen, familiar landscapes turned pale as ghost light.',
        rendering_and_quality:
          'Monochrome infrared negative look; not the pink-and-cyan color infrared owned by Photography Eras.',
        key_features:
          'white glowing foliage; near-black sky; halation bloom; milky skin; pronounced grain',
      }),
      avoid: [...AVOID, 'pink or red false-color foliage', 'full color'],
      dropAvoid: GRAIN_DROP,
      briefs: [
        'Black-and-white infrared photograph of an overgrown abbey ruin in a summer meadow, every leaf and blade of grass glowing snow-white with soft halation, the sky behind the broken arches almost black, pronounced grain. No text, logo or film border.',
        'Black-and-white infrared photograph of an adult woman in a dark wool cloak on a rope swing hung from a giant willow, the willow glowing white as frost, her skin milky, the pond below black as ink. No text, logo or film border.',
        'Black-and-white infrared photograph of a hillside of leaning carved stone crosses in tall summer grass, the grass white and luminous, the stones grey, the sky nearly black. No readable inscriptions, logo or film border.',
      ],
    },
    'SP01-020': {
      dna: film({
        aesthetic:
          'Expired color negative: film long past its date, fogged by age and heat, with a lifted base, drifting color casts and weak contrast.',
        color_and_tone:
          'Milky lifted blacks, overall green, magenta or brown cast that drifts across the frame, faded saturation, muddy but readable skin.',
        lighting_and_shadow:
          'Low contrast; shadows fogged grey, highlights dull; best when overexposed so the image survives the fog.',
        texture_and_material:
          'Coarse clumped grain, blotchy dye clouds, occasional faint mottling; no scratches drawn as overlay.',
        camera_and_composition:
          'Keep the requested framing; no borders, light leaks only if faint and at an edge.',
        atmosphere_and_mood: 'Wistful and unreliable, the image half dissolved like an old memory.',
        rendering_and_quality:
          'Chemical aging in the emulsion itself, not a generic vintage filter or a torn-paper texture.',
        key_features:
          'fogged lifted blacks; drifting color cast; coarse clumped grain; low contrast; faded dyes',
      }),
      avoid: [...AVOID, 'crisp saturated color', 'overlay scratches'],
      dropAvoid: GRAIN_DROP,
      briefs: [
        'Photograph on expired color film: an abandoned traveling circus tent in a windy field, faded stripes, a lone adult clown in smudged greasepaint sitting on an upturned bucket at the entrance. Fogged milky blacks, drifting green-magenta cast, coarse clumped grain. No text, logo or film border.',
        'Photograph on expired color film of an adult couple dancing alone in an empty village hall strung with paper lanterns, the whole frame washed brown-magenta, lifted shadows and blotchy grain. No text, logo or film border.',
        'Photograph on expired color film of a sunflower field with a tattered wooden scarecrow wearing a tin crown, the sky fogged to a greenish cream, faded yellows, coarse grain. No text, logo or film border.',
      ],
    },
    'SP01-021': {
      dna: film({
        aesthetic:
          'Large-format 4x5 sheet film: a view camera on a tripod recording extraordinary detail with smooth, seamless tonal gradation.',
        color_and_tone:
          'Rich, smooth tonal transitions, natural restrained color or deep neutral monochrome, subtle highlight rolloff.',
        lighting_and_shadow:
          'Slow, deliberate exposure in natural or window light; full shadow detail and delicate highlights.',
        texture_and_material:
          'Grain practically invisible; every stone joint, feather, thread and pore resolved.',
        camera_and_composition:
          'Keep the requested framing; corrected vertical lines, and a tilted plane of focus that can run along the subject while the rest falls away.',
        atmosphere_and_mood:
          'Monumental and contemplative, slow precision that invites long looking.',
        rendering_and_quality:
          'Sheet-film clarity and tonality without digital sharpening halos or HDR; depth rendered through lens movements.',
        key_features:
          'view-camera detail; seamless tonal gradation; corrected verticals; tilted focus plane; invisible grain',
      }),
      avoid: [...AVOID, 'converging verticals', 'wide-angle distortion'],
      dropAvoid: GRAIN_DROP,
      briefs: [
        'Large-format 4x5 photograph of a vast gothic cathedral nave with perfectly corrected vertical columns, every stone joint crisp, a single adult verger lighting candles far down the aisle, smooth tonal gradation from window to shadow. No text, logo or film border.',
        "Large-format 4x5 photograph of an old adult stonemason's weathered hands resting on a freshly carved gargoyle head, tilted focus plane running along the knuckles and the gargoyle's teeth, stone dust resolved grain by grain. No text, logo or film border.",
        'Large-format 4x5 still-life photograph of a dead pheasant, a pewter jug and three quinces on a scrubbed kitchen table in soft window light, every feather and dent resolved, deep quiet shadows. No text, logo or film border.',
      ],
    },
    'SP01-022': {
      dna: film({
        aesthetic:
          'Disposable single-use camera: a fixed-focus plastic lens, a weak built-in flash and fast consumer film, used without thought at close range.',
        color_and_tone:
          'Contrasty consumer color, flash-warmed skin, slightly green fluorescent or orange tungsten background casts, and a hot center.',
        lighting_and_shadow:
          'Built-in flash blasting the nearest subject, harsh falloff within two meters, dark background, occasional red-eye and hard shadow outline.',
        texture_and_material:
          'Noticeable grain, soft plastic-lens edges, chromatic fringing in the corners, slight motion blur in the background.',
        camera_and_composition:
          'Keep the requested subject and setting; eye-level snapshot, slightly off-level, subjects too close or cut at the edges.',
        atmosphere_and_mood:
          'Candid and funny, blasted bright foregrounds against sudden careless darkness.',
        rendering_and_quality:
          'Cheap-camera honesty — flash hotspot, grain, soft corners — without a drawn date stamp or border.',
        key_features:
          'built-in flash hotspot; harsh falloff; plastic-lens softness; corner fringing; consumer film grain',
      }),
      avoid: [...AVOID, 'date stamp', 'studio lighting'],
      dropAvoid: GRAIN_DROP,
      briefs: [
        'Disposable camera flash snapshot: adult friends in rented medieval costumes crammed around a mead-hall table at a birthday feast, raising horn cups, flash blasting the front row into hot skin and red-eye while the timber hall behind falls dark. Consumer grain, soft corners. No text, logo or date stamp.',
        'Disposable camera flash photo of an adult hiker grinning through a snowstorm at the door of a mountain hut, the flash turning snowflakes into bright white orbs, frost on the beard of her hood, dark background. No text, logo or date stamp.',
        'Disposable camera flash photo at night of an adult angler on a wooden dock holding up a huge pike, fish scales blown bright, the lake behind pitch black, slight chromatic fringing at the corners. No text, logo or date stamp.',
      ],
    },
    'SP01-026': {
      name: 'Pinhole Long Exposure',
      dna: film({
        aesthetic:
          'Pinhole camera long exposure: a lensless box with a tiny aperture, so everything is equally soft and exposures run from seconds to minutes.',
        color_and_tone:
          'Muted, slightly warm color or soft monochrome; heavy natural darkening toward the corners.',
        lighting_and_shadow:
          'Long daylight exposure: static light evenly built up, moving light sources smeared into trails.',
        texture_and_material:
          'Soft focus everywhere with no sharp plane, gentle diffraction glow; moving people, animals and water ghosted or erased.',
        camera_and_composition:
          'Keep the requested subject and setting; infinite soft depth, wide stretched perspective at the edges, strong vignette.',
        atmosphere_and_mood: 'Dreamy and haunted, time made visible as soft ghosts and smears.',
        rendering_and_quality:
          'Uniform lensless softness and time blur, not a tilt-shift or a blurred digital background.',
        key_features:
          'lensless uniform softness; ghosted motion; heavy corner vignette; infinite soft depth; minutes-long exposure',
      }),
      avoid: [...AVOID, 'selective focus bokeh', 'crisp detail'],
      briefs: [
        'Pinhole camera long-exposure photograph of an old stone bridge over a rushing river, the water smoothed to white mist and a hay cart ghosted halfway across, uniform lensless softness, deep vignette. No text, logo or film border.',
        'Pinhole camera photograph of a village well at noon, translucent ghosts of adult water carriers who moved during the minutes-long exposure, the stone well sharp only as it can be without a lens, soft warm tones. No text, logo or film border.',
        'Pinhole camera long exposure of an adult sitting motionless on a carved high-backed chair in a ruined hall while a crow on the armrest smears into a dark blur, wide stretched edges, heavy vignette. No text, logo or film border.',
      ],
    },
  },
  creates: [
    {
      name: 'Redscale Film',
      domain: 'reversed color negative',
      tags: ['redscale', 'color-negative', 'film'],
      dna: film({
        aesthetic:
          'Redscale film: color negative loaded backwards and exposed through its base, so the red-sensitive layer dominates and the whole scene burns red, orange and amber.',
        color_and_tone:
          'Brick red shadows, orange midtones, yellow to cream highlights, almost no blue or green; more exposure shifts the image toward yellow.',
        lighting_and_shadow:
          'Needs generous light and overexposure; bright skies turn pale yellow, shadows dense rust-brown.',
        texture_and_material:
          'Grainy, slightly soft emulsion with warm dye clouds; the scene reads as if shot through heat.',
        camera_and_composition:
          'Keep the requested framing; bright open scenes and skies show the red-to-yellow shift best.',
        atmosphere_and_mood: 'Scorched and strange, a familiar scene seen through burning heat.',
        rendering_and_quality:
          'In-camera reversed-film color, not a red duotone filter; tonal range preserved inside the warm band.',
        key_features:
          'red-orange-amber palette; yellow highlights; rust-brown shadows; no blues; warm grain',
      }),
      avoid: [...FILM_BASE, 'blue sky', 'flat red duotone'],
      briefs: [
        'Redscale film photograph of a caravan of camels with adult riders crossing a high dune at noon, the sky burned to pale yellow, the sand orange, the shadows rust-brown, warm grain throughout. No text, logo or film border.',
        'Redscale film photograph of an adult sword dancer spinning between old olive trees, the leaves turned amber, her dark hair rust-brown, overexposed sky pale cream. No text, logo or film border.',
        'Redscale film photograph of a burned-out stone watchtower on a hill under a swirling dust storm, the whole frame red and orange, only the tower edges catching yellow highlights. No text, logo or film border.',
      ],
    },
    {
      name: 'Super 8 Home-Movie Film',
      domain: 'Super 8 reversal home movie',
      tags: ['super-8', 'home-movie', 'film'],
      dna: film({
        aesthetic:
          'Super 8 home movie: a single frame pulled from a tiny-gauge reversal film shot at 18 frames per second on a handheld family camera.',
        color_and_tone:
          'Warm saturated reversal color, strong reds and yellows, slightly magenta skin, milky highlights and a faint exposure flicker across the frame.',
        lighting_and_shadow:
          'Available daylight or a harsh movie light; auto-exposure swings leave one side slightly brighter.',
        texture_and_material:
          'Coarse, dancing grain relative to the tiny frame, soft focus, motion smear on anything moving, faint dust specks.',
        camera_and_composition:
          'Keep the requested subject and setting; handheld 4:3-feeling framing, slight tilt, subject caught mid-movement.',
        atmosphere_and_mood:
          'Tender and far away, flickering joy caught between two blurred frames.',
        rendering_and_quality:
          'Projected home-movie look without sprocket holes, gate edges, frame counters or scratches drawn as overlay.',
        key_features:
          'coarse home-movie grain; 18 fps motion smear; warm reversal color; exposure flicker; handheld softness',
      }),
      avoid: [...FILM_BASE, 'crisp frozen motion', 'overlay scratches'],
      briefs: [
        'Single frame from a Super 8 home movie: two adult brothers in homemade cardboard knight armor sword-fighting on a back lawn at sunset, the cardboard swords smeared by motion, warm saturated reversal color, coarse dancing grain, slight exposure flicker. No text, logo or film border.',
        'Single frame from a Super 8 home movie of an adult grandmother blowing out candles on a cake shaped like a castle at a crowded family table, harsh movie light from one side, magenta-warm skin, soft focus. No text, logo or film border.',
        'Single frame from a Super 8 home movie of an adult diver mid-air after leaping off a harbor wall into the sea, limbs blurred by the slow shutter, saturated blue water, coarse grain. No text, logo or film border.',
      ],
    },
    {
      name: 'Kodak Tri-X Pushed',
      domain: 'push-processed black-and-white',
      tags: ['tri-x', 'push-processing', 'black-and-white', 'film'],
      dna: film({
        aesthetic:
          'Kodak Tri-X pushed to 1600–3200: black-and-white film underexposed in low light and overdeveloped, giving hard contrast and gritty, clumped grain.',
        color_and_tone:
          'Monochrome with chalky whites, few midtones, and shadows blocked to solid black.',
        lighting_and_shadow:
          'Scarce available light — one bulb, a fire, a doorway — with deep falloff; highlights burn, shadows lose all detail.',
        texture_and_material:
          'Coarse, clumped, sharp-edged grain across the whole frame, strongest in midtone greys; slight motion blur tolerated.',
        camera_and_composition: 'Keep the requested framing; handheld 35 mm closeness.',
        atmosphere_and_mood: 'Raw and urgent, grit and blackness crowding every scrap of light.',
        rendering_and_quality:
          'Push-processed darkroom print: high contrast and grit, not a clean box-speed tonal scale.',
        key_features:
          'push-processed grit; clumped coarse grain; blocked black shadows; chalky highlights; low available light',
      }),
      avoid: [...FILM_BASE, 'color', 'smooth fine grain', 'open shadows'],
      briefs: [
        'Black-and-white photograph on Kodak Tri-X pushed to 3200: an adult bare-knuckle fighter slumped on a stool between rounds in a smoky cellar pit, one bare bulb overhead, sweat shining chalk-white, the crowd behind dissolved into solid black, clumped coarse grain. No text, logo or film border.',
        'Black-and-white photograph on pushed Tri-X of adult miners emerging from a shaft head at dusk, faces blackened, lamp beams burning white, shadows blocked, gritty grain. No text, logo or film border.',
        'Black-and-white photograph on pushed Tri-X of an adult blacksmith plunging a glowing blade into a quench barrel at night, the burst of steam chalk-white, the forge a black mass, grain coarse and clumped. No text, logo or film border.',
      ],
    },
    {
      name: 'Cross-Processed Slide',
      domain: 'E-6 slide film in C-41 chemistry',
      tags: ['cross-processing', 'slide-film', 'film'],
      dna: film({
        aesthetic:
          'Cross-processed slide film: E-6 reversal film developed in C-41 negative chemistry, giving harsh contrast and violently shifted color.',
        color_and_tone:
          'Cyan-green shadows, acid yellow highlights, boosted saturation, skin shifted toward yellow-orange or magenta; whites often blown.',
        lighting_and_shadow:
          'Bright sun and high contrast; highlights clip early, shadows go deep cyan-black.',
        texture_and_material:
          'Punchy medium grain, crisp edges, flat blown areas in skies and skin highlights.',
        camera_and_composition:
          'Keep the requested framing; sunlit subjects and open sky show the color clash most clearly.',
        atmosphere_and_mood: 'Loud and sunburnt, rebellious color clashing in harsh bright sun.',
        rendering_and_quality:
          'Chemical color shift in the emulsion, not an Instagram split-tone; no vignette or light leaks unless asked.',
        key_features:
          'cyan-green shadows; acid yellow highlights; blown whites; boosted saturation; harsh contrast',
      }),
      avoid: [...FILM_BASE, 'natural color balance', 'heavy vignette'],
      briefs: [
        'Cross-processed slide film photograph of an adult archer in a green hood drawing on a straw target on a summer lawn, the grass acid yellow-green, shadows cyan, the sky blown white, harsh contrast. No text, logo or film border.',
        'Cross-processed slide film photograph of an adult roller skater in a sequinned cape carving along a seaside boardwalk, skin shifted orange, sea cyan, sequins blown to white sparks. No text, logo or film border.',
        'Cross-processed slide film photograph of an adult fruit picker on a wooden ladder in a lemon grove, lemons glowing acid yellow, leaves cyan-green, deep cyan-black shade under the trees. No text, logo or film border.',
      ],
    },
    {
      name: 'Bleach Bypass Print',
      domain: 'silver-retention processing',
      tags: ['bleach-bypass', 'silver-retention', 'film'],
      dna: film({
        aesthetic:
          'Bleach bypass: the bleach step skipped so silver stays in the image alongside the color dyes, as in gritty war and crime films.',
        color_and_tone:
          'Color drained to about half saturation, steely grey-green cast, skin pallid, blacks deep and metallic, highlights hard and bright.',
        lighting_and_shadow:
          'High contrast; overcast or hard side light both harden, shadows heavy with silver density.',
        texture_and_material:
          'Gritty visible grain, silvery sheen on wet and metal surfaces, skin texture and dirt emphasized.',
        camera_and_composition:
          'Keep the requested framing; faces, metal and wet surfaces carry the silver sheen.',
        atmosphere_and_mood: 'Grim and exhausted, color drained away under heavy silver weight.',
        rendering_and_quality:
          'Silver-retained print look — desaturated but contrasty — not simple black-and-white or a teal-orange grade.',
        key_features:
          'half-drained color; silver-dense blacks; steely sheen; hard contrast; gritty grain',
      }),
      avoid: [...FILM_BASE, 'vivid saturated color', 'teal and orange grade'],
      briefs: [
        'Bleach bypass photograph of adult mercenaries in mud-caked armor marching through a burned village in cold rain, color drained to steel grey-green, blood-red cloak only half saturated, metallic blacks, gritty grain. No text, logo or film border.',
        'Bleach bypass photograph of an adult tanner scraping a hide on a beam beside a grey river, pallid skin, silver sheen on the wet leather and water, hard contrast. No text, logo or film border.',
        'Bleach bypass photograph of an adult fur trapper checking a snare on a frozen riverbank at dawn, breath steaming, color bled almost out, dense silvery shadows under the pines. No text, logo or film border.',
      ],
    },
    {
      name: 'Lith Print',
      domain: 'lith-developed darkroom print',
      tags: ['lith-print', 'darkroom', 'black-and-white', 'film'],
      dna: film({
        aesthetic:
          'Lith print: a heavily overexposed darkroom print developed in dilute lith developer, pulled at the last second, giving peppery black shadows and soft, warm highlights.',
        color_and_tone:
          'Warm monochrome: salmon, peach and cream highlights against cold charcoal-black shadows — a natural split tone from one print.',
        lighting_and_shadow:
          'Hard, grainy shadows with sudden edges; highlights soft, low contrast and glowing.',
        texture_and_material:
          'Coarse "infectious" pepper grain in the darks, smooth creamy highlights, matte fiber-paper surface.',
        camera_and_composition:
          'Keep the requested framing; enlarger-print look with slightly soft, burned-in corners.',
        atmosphere_and_mood:
          'Moody and intimate, soft glowing lights against gritty handmade darkness.',
        rendering_and_quality:
          'Darkroom paper print look, not a sepia filter; each tone zone behaves differently (pepper shadows, soft highlights).',
        key_features:
          'peppery black shadows; salmon-cream highlights; natural split tone; matte fiber paper; darkroom unpredictability',
      }),
      avoid: [...FILM_BASE, 'full color', 'even sepia wash'],
      briefs: [
        'Lith print photograph of an adult woman in a long coat walking away into sea fog on a shingle beach, the fog glowing peach and cream, the pebbles and her coat peppered charcoal-black, matte fiber-paper texture. No text, logo or border.',
        'Lith print photograph of a lone hawthorn twisted by wind on a bare moor, the sky soft salmon, the branches coarse black with pepper grain, natural split tone. No text, logo or border.',
        'Lith print photograph looking straight up a crumbling lighthouse spiral stair, the spiral steps turning from creamy highlights to gritty black at the center. No text, logo or border.',
      ],
    },
    {
      name: 'Film Soup',
      domain: 'chemically pre-soaked film',
      tags: ['film-soup', 'experimental-film', 'film'],
      dna: film({
        aesthetic:
          'Film soup: color film soaked in household chemicals before shooting, so the damaged emulsion erupts in blooms, bubbles and saturated color stains over a readable photo.',
        color_and_tone:
          'Magenta, cyan, acid yellow and electric green blotches blooming out of otherwise normal color; shifts strongest in skies and flat areas.',
        lighting_and_shadow:
          'Normal photographic light underneath; stains glow as if lit from within.',
        texture_and_material:
          'Round bubble craters, dissolved emulsion patches, speckles and dendritic blooms, concentrated toward edges and sky, leaving the main subject readable.',
        camera_and_composition:
          'Keep the requested framing; the damage frames the subject rather than covering it.',
        atmosphere_and_mood: 'Psychedelic and eerie, a calm picture slowly being eaten by color.',
        rendering_and_quality:
          'Organic chemical damage in the emulsion, not a digital glitch, overlay texture or double exposure.',
        key_features:
          'chemical color blooms; bubble craters; dissolved emulsion patches; readable subject; stained sky',
      }),
      avoid: [...FILM_BASE, 'digital glitch', 'subject hidden by damage'],
      briefs: [
        'Film soup photograph of an adult sorceress in a hooded robe on a sea cliff at dusk, the sky dissolving into magenta and cyan chemical blooms and round bubble craters, her figure and the cliff still clearly readable. No text, logo or film border.',
        'Film soup photograph of a ruined glass greenhouse overrun by wild roses, the panes eaten by acid-yellow and green emulsion blooms, speckled bubbles at the edges. No text, logo or film border.',
        'Film soup photograph of a red deer stag standing in a misty clearing, magenta and electric-green stains blooming at the frame edges and through the mist, the stag untouched at the center. No text, logo or film border.',
      ],
    },
  ],
};

export default spec;
