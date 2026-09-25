import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'changing the requested location',
  'franchise likeness',
  'celebrity likeness',
  'readable fake text',
  'light that does not match the named setup',
];

// Cinematic lighting modifiers: content and location stay constant; only the film-set lighting changes.
const keep =
  'Keep the prompt subject, action, setting and framing constant; change only the cinematic lighting setup, its haze and its grade, so the light is the difference, not a new location.';

function lit(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? keep, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_02',
  category: '5. Lighting And Atmosphere',
  updates: {
    'SP02-061': {
      name: 'Magic Hour Backlight',
      dna: lit({
        aesthetic:
          'Magic-hour backlight cinematography: the low sun placed directly behind the subject, with a bounce board filling faces and a warm film grade.',
        color_and_tone:
          'Amber-gold highlights, honey skin from warm bounce, lifted cool shadows, gentle halation.',
        lighting_and_shadow:
          'Sun as a hard backlight and rim, large bounce fill from the front at a 3:1 ratio, dust and hair glowing.',
        texture_and_material: 'Flare veils, backlit dust, glowing hair and fabric edges.',
        camera_and_composition:
          'Keep the requested framing; lens facing into the sun so flare and rim read.',
        atmosphere_and_mood: 'Romantic and fleeting, the last few minutes of good light on set.',
        rendering_and_quality:
          'Filmic highlight rolloff and flare veiling; the still-photo golden hour lives in pack_01.',
        key_features:
          'sun directly behind subject; bounce-filled faces; rim and flare; warm film grade; 3:1 ratio',
      }),
      avoid: AVOID,
      briefs: [
        'Magic-hour film still of an adult rider leading a horse through tall wheat, the sun directly behind them rimming mane and hair in gold, faces filled by warm bounce, a veil of flare. No text or logo.',
        'Magic-hour film still of an adult couple dancing slowly on a hilltop, backlit by a sun touching the horizon, dust glowing around their feet. No text or logo.',
        'Magic-hour film still of an adult scarecrow-maker lifting a finished scarecrow onto its pole in a field, sun behind the straw hat, warm bounce on her face. No text or logo.',
      ],
    },
    'SP02-062': {
      name: 'Blue Hour Cinematography',
      dna: lit({
        aesthetic:
          'Blue-hour cinematography: shooting in the short window after sunset, balancing a deep blue ambient sky against warm practical lights rigged in frame.',
        color_and_tone:
          'Cobalt and violet ambience, warm tungsten practicals, skin in mixed cool and warm light.',
        lighting_and_shadow:
          'Sky as a vast soft source, practicals boosted to read, a small warm key hidden near a lamp or window.',
        texture_and_material: 'Glowing windows, lamps and lanterns; faint haze catching the light.',
        camera_and_composition:
          'Keep the requested framing; include a practical source and some sky.',
        atmosphere_and_mood: 'Quiet and suspended, a scene held between day and night.',
        rendering_and_quality:
          'Clean low-light film image with rich blues; no trams or wet-street clichés.',
        key_features:
          'deep blue ambient sky; warm practicals in frame; hidden warm key; faint haze; balanced exposure',
      }),
      avoid: [...AVOID, 'tram', 'wet street'],
      briefs: [
        'Blue-hour film still of an adult ferryman lighting a lantern on the deck of a river barge, cobalt sky over the water, the lantern the only warm light on his face. No text or logo.',
        'Blue-hour film still of a mountain inn with glowing windows, an adult guest leaning on a wooden balcony, violet peaks behind. No text or logo.',
        'Blue-hour film still of an adult woman walking home along a snowy village lane past lit windows, blue snow and warm doorways. No text or logo.',
      ],
    },
    'SP02-063': {
      name: 'Cinematic Chiaroscuro Key',
      dna: lit({
        aesthetic:
          'Cinematic chiaroscuro key: one large soft source high to the side with heavy negative fill, producing deep contrast ratios and sculpted faces.',
        color_and_tone: 'Warm umber highlights, near-black shadows, muted period grade.',
        lighting_and_shadow:
          'Single key at 45 degrees and above, black flags on the fill side for an 8:1 ratio, a lit triangle on the shadow cheek.',
        texture_and_material: 'Skin, wool and wood modeled by soft-edged falloff into darkness.',
        camera_and_composition: 'Keep the requested framing; faces turned toward the key.',
        atmosphere_and_mood: 'Grave and intimate, a hush before a decision.',
        rendering_and_quality: 'Low-key film exposure with detail kept in the midtones.',
        key_features:
          'single high side key; negative fill; 8:1 contrast ratio; lit cheek triangle; umber grade',
      }),
      avoid: AVOID,
      briefs: [
        'Film still with a chiaroscuro key of an adult inquisitor questioning a prisoner across a bare table, one soft key high on the left, black negative fill, faces sculpted out of darkness. No text or logo.',
        'Chiaroscuro film still of an adult chess master leaning over a board, his hand hovering above a piece, a lit triangle on his shadow cheek. No text or logo.',
        'Chiaroscuro film still of an adult blind bard tuning a small harp, warm umber light from one side, the room black behind. No text or logo.',
      ],
    },
    'SP02-064': {
      name: 'Neon Practical Noir',
      dna: lit({
        aesthetic:
          'Neon practical noir: interiors lit only by neon tubes and signs rigged in frame, shot wide open in haze with a cool film grade.',
        color_and_tone:
          'Magenta, red and cyan tube light, deep blacks, skin taking the color of the nearest tube.',
        lighting_and_shadow:
          'Hard colored practicals as key and edge, very low ambient, haze revealing each tube.',
        texture_and_material:
          'Glass tubes, chrome, smoke, sweat and lacquer catching colored highlights.',
        camera_and_composition:
          'Keep the requested framing; at least one tube visible or clearly motivating the light.',
        atmosphere_and_mood: 'Lonely and electric, a late hour humming with color.',
        rendering_and_quality:
          'Clean saturated practicals without readable signage; not the rainy-street cliché.',
        key_features:
          'neon tubes as the only light; colored practical key and edge; haze; deep blacks; unreadable signs',
      }),
      avoid: [...AVOID, 'readable neon sign', 'wet street reflections'],
      briefs: [
        'Neon-practical film still of an adult bartender polishing glasses in a narrow bar lit only by red and blue tubes along the shelves, haze hanging in the air, no readable signs. No text or logo.',
        'Neon-practical film still of an adult boxer taping her hands in a locker room under a buzzing magenta tube, chrome lockers catching the color. No text or logo.',
        'Neon-practical film still of an adult tattooist bent over a client in a tiny parlor lit by cyan tubes and a red lamp. No readable signs or logo.',
      ],
    },
    'SP02-065': {
      name: 'Hazed Window Shafts',
      dna: lit({
        aesthetic:
          'Hazed window shafts: large film lights pushed through windows into a room filled with haze, so the light becomes solid beams.',
        color_and_tone:
          'Warm or daylight-white beams against grey-brown ambient, lifted shadows from the haze.',
        lighting_and_shadow:
          'Hard HMI-like source outside the windows, crisp parallel beams, subjects stepping in and out of light.',
        texture_and_material:
          'Haze density, dust motes and window mullion patterns printed on the floor.',
        camera_and_composition:
          'Keep the requested framing; beams crossing the frame diagonally past the subject.',
        atmosphere_and_mood: 'Solemn and reverent, a quiet room filled with visible light.',
        rendering_and_quality: 'Film-set volumetrics with smooth haze and no banding.',
        key_features:
          'hard source through windows; hazed interior; parallel beams; mullion patterns on the floor; lifted shadows',
      }),
      avoid: AVOID,
      briefs: [
        'Film still of an adult monk sweeping the floor of a hazy library as hard beams pour through tall windows, dust motes in the shafts, mullion shadows on the floorboards. No text or logo.',
        'Film still of an adult couple dancing alone in an abandoned ballroom, beams through tall shutters crossing them in the haze. No text or logo.',
        'Film still of an adult widow sitting beside a closed coffin in a hazy parlor, one beam from the curtain gap falling across her hands. No text or logo.',
      ],
    },
    'SP02-066': {
      name: 'Cinematic Silhouette Backdrop',
      dna: lit({
        aesthetic:
          'Cinematic silhouette: subjects blocked against a blown-out bright background — sky, doorway or cyclorama — exposed so they fall to pure black.',
        color_and_tone:
          'Saturated sunset, white doorway glow or colored cyc behind; subjects black.',
        lighting_and_shadow:
          'All light behind the subject; no front fill; a thin edge of spill on contours.',
        texture_and_material: 'Readable gestures and props defined only by outline.',
        camera_and_composition:
          'Keep the requested framing; subjects separated from each other against the brightest area.',
        atmosphere_and_mood: 'Iconic and tense, drama told entirely through shape.',
        rendering_and_quality: 'Clean black shapes against a smooth bright field; no muddy detail.',
        key_features:
          'subjects against blown background; pure black shapes; no front fill; separated gestures; smooth bright field',
      }),
      avoid: [...AVOID, 'front-lit subject'],
      briefs: [
        'Film still of two adult duelists facing each other on a ridge as black silhouettes against an enormous orange sunset sky, swords lowered, space between them. No text or logo.',
        'Film still of an adult figure in a long coat standing in a doorway as a black shape against a blinding white corridor. No text or logo.',
        'Film still of an adult rider on a camel crossing a dune as a crisp black silhouette against a white-hot desert sky. No text or logo.',
      ],
    },
    'SP02-067': {
      dna: lit({
        aesthetic:
          'In-camera double exposure: two images superimposed on the same film, with the darker areas of one revealing the other.',
        subject_treatment:
          'Keep the prompt subject as the primary image and blend a second image that belongs to the prompt inside its dark areas, without inventing unrelated scenery.',
        color_and_tone: 'Soft, low-contrast blend; highlights of one image washing out the other.',
        lighting_and_shadow:
          'The first image lit so its silhouette or shadows leave room for the second.',
        texture_and_material: 'Translucent overlaps, soft edges where the two images meet.',
        camera_and_composition:
          'A clear primary silhouette with the secondary image fitted inside it.',
        atmosphere_and_mood: 'Dreamlike and memory-laden, two moments sharing one frame.',
        rendering_and_quality: 'Optical superimposition look; not a hard digital cutout.',
        key_features:
          'two superimposed images; second image inside the dark areas; soft translucent blend; primary silhouette; dreamlike',
      }),
      avoid: [...AVOID, 'hard digital cutout'],
      briefs: [
        "Double-exposure film still of an adult soldier's profile with a burning village superimposed inside the dark of his helmet and shoulder, soft translucent blend. No text or logo.",
        "Double-exposure film still of an adult woman's profile dissolving into a forest of white birches inside her hair and face. No text or logo.",
        'Double-exposure film still of a howling wolf whose silhouette holds a moonlit mountain range and pine forest. No text or logo.',
      ],
    },
    'SP02-068': {
      dna: lit({
        aesthetic:
          'Bokeh macro: a fast macro lens wide open so one tiny plane is sharp and background lights melt into large glowing discs.',
        color_and_tone: 'Glowing colored discs of light, clean subject color, soft dark gaps.',
        lighting_and_shadow:
          'Point lights or sparkling highlights far behind the subject; subject softly front-lit.',
        texture_and_material:
          'Round or cat-eye bokeh discs, some with onion-ring texture; crisp subject detail.',
        camera_and_composition: 'Keep the requested framing; background lights behind the subject.',
        atmosphere_and_mood: 'Delicate and magical, a tiny world glowing in soft light.',
        rendering_and_quality: 'Optical bokeh with smooth falloff; not a digital blur filter.',
        key_features:
          'paper-thin focus plane; large glowing bokeh discs; cat-eye edges; crisp small subject; point lights behind',
      }),
      avoid: [...AVOID, 'deep focus', 'digital blur filter'],
      briefs: [
        'Bokeh macro film still of a tiny snail on a red mushroom, a string of warm fairy lights behind it melting into large glowing discs. No text or logo.',
        'Bokeh macro still of a glass marble resting on moss, colored city lights behind turning into swirling cat-eye bokeh. No text or logo.',
        'Bokeh macro still of an adult hand holding a jar of fireflies, the fireflies inside sharp points and the ones outside soft glowing discs. No text or logo.',
      ],
    },
    'SP02-069': {
      name: 'Cinematic Split Key',
      dna: lit({
        aesthetic:
          'Cinematic split key: a hard light at exactly 90 degrees to the lens with full negative fill, cutting the subject into a lit half and a black half.',
        color_and_tone: 'Hard contrast, restrained color, the dark half near black.',
        lighting_and_shadow:
          'Perpendicular hard key, black flags on the other side, a crisp line down the center.',
        texture_and_material: 'Grazing light exaggerating texture on the lit half.',
        camera_and_composition:
          'Keep the requested framing; subject frontal enough for the division to read.',
        atmosphere_and_mood: 'Divided and menacing, two natures inside one face.',
        rendering_and_quality: 'Clean film blacks and detailed highlights along the split line.',
        key_features:
          '90-degree hard key; full negative fill; center split line; grazing texture; near-black half',
      }),
      avoid: AVOID,
      briefs: [
        'Film still with a split key of an adult double agent staring into the lens, one half of his face lit hard from the side, the other half swallowed by black. No text or logo.',
        "Split-key film still of an elderly adult woman demon hunter with cropped white hair and a ritual scar across her brow, holding a silver dagger beside her face, the grazing side light revealing every scar and blade nick on the lit half, the other half black. No text or logo.",
        'Split-key film still of an adult judge in a black robe behind a bench, a crisp line of light and dark down the center of the face. No text or logo.',
      ],
    },
    'SP02-070': {
      name: 'Old Hollywood Beauty Key',
      dna: lit({
        aesthetic:
          'Old Hollywood beauty key: a hard spotlight high and centered in front of the face, making a small butterfly shadow under the nose, with a glowing backlight.',
        color_and_tone:
          'Silvery black and white or soft glamour color, luminous skin, deep backgrounds.',
        lighting_and_shadow:
          'Fresnel spot above the lens, butterfly nose shadow, strong hair light and edge kicker.',
        texture_and_material: 'Satin, pearls, sequins and lacquered hair catching crisp speculars.',
        camera_and_composition: 'Keep the requested framing; faces frontal to the key.',
        atmosphere_and_mood: 'Glamorous and timeless, a studio portrait of a screen idol.',
        rendering_and_quality:
          'Studio-era glamour finish with soft diffusion; invented faces only.',
        key_features:
          'high centered hard spot; butterfly nose shadow; glowing hair light; satin speculars; soft diffusion',
      }),
      avoid: [...AVOID, 'real actor likeness'],
      briefs: [
        'Old Hollywood beauty-key portrait of an adult fictional screen actress with finger waves and pearls, a hard spot above the lens casting a small butterfly shadow, glowing hair light, silvery black and white. No text or logo.',
        'Old Hollywood beauty-key portrait of an adult fictional leading man in a tuxedo with slicked hair, edge kicker along his jaw. No text or logo.',
        'Old Hollywood beauty-key portrait of an adult sorceress in a sequined gown and jeweled circlet, crisp speculars on every sequin. No text or logo.',
      ],
    },
    'SP02-071': {
      dna: lit({
        aesthetic:
          'Day for night: a scene shot in daylight and underexposed, graded blue so it reads as moonlit night, with telltale hard sun shadows.',
        color_and_tone:
          'Deep blue-grey grade, dark sky, crushed shadows, faint color left in highlights.',
        lighting_and_shadow:
          'Hard sunlight used as "moonlight", sharp shadows and backlight glints that real moonlight would not give.',
        texture_and_material: 'Sun glints on water and metal turned to cold silver.',
        camera_and_composition:
          'Keep the requested framing; sky darkened with a filter, no visible sun.',
        atmosphere_and_mood: 'Uneasy and stylized, a night that feels too bright.',
        rendering_and_quality: 'Classic film trick look; not a real low-light exposure.',
        key_features:
          'daylight underexposed; blue night grade; hard sun shadows; darkened sky; silver glints',
      }),
      avoid: [...AVOID, 'visible sun disc'],
      briefs: [
        'Day-for-night film still of an adult cavalry patrol crossing a ridge, graded deep blue as moonlight, hard sun shadows under the horses giving away the trick. No text or logo.',
        'Day-for-night film still of an adult smuggler rowing a boat into a rocky cove, silver glints on the water, darkened sky. No text or logo.',
        'Day-for-night film still of adult sentries walking a castle wall, crisp daylight shadows turned cold blue. No text or logo.',
      ],
    },
    'SP02-072': {
      name: 'Candlelit Low-Light Cinema',
      dna: lit({
        aesthetic:
          'Candlelit low-light cinema: scenes lit only by real candles, shot with extremely fast lenses so the frame glows warm and focus is razor thin.',
        color_and_tone:
          'Deep amber and gold, velvety brown-black, flesh glowing like old paintings.',
        lighting_and_shadow:
          'Many candles as the only sources, soft falloff within a meter, flickering warm modeling.',
        texture_and_material: 'Wax, powdered wigs, silk, glassware and wood glowing warmly.',
        camera_and_composition:
          'Keep the requested framing; very shallow focus, candles visible in frame.',
        atmosphere_and_mood: 'Intimate and painterly, a period room breathing in candlelight.',
        rendering_and_quality:
          'Ultra-fast-lens film look with soft focus falloff; no electric light.',
        key_features:
          'candles as only light; ultra-fast-lens shallow focus; amber glow; painterly faces; velvety dark',
      }),
      avoid: [...AVOID, 'electric light'],
      briefs: [
        'Candlelit film still of adult card players in an elegant salon lit only by dozens of candles, faces glowing amber, focus so shallow only one player is sharp. No text or logo.',
        'Candlelit film still of an adult governess reading a sealed letter by a single candle at a writing desk, velvety darkness around her. No readable text or logo.',
        'Candlelit film still of an adult composer playing a harpsichord in a candlelit music room, flames reflected in the lacquered lid. No text or logo.',
      ],
    },
    'SP02-073': {
      name: 'Bioluminescent Fantasy Glow',
      dna: lit({
        aesthetic:
          'Bioluminescent fantasy glow: cinematic night scenes lit by glowing plants, fungi and creatures, stylized brighter and more saturated than nature.',
        color_and_tone:
          'Electric cyan, teal and violet glows with magenta accents against deep navy.',
        lighting_and_shadow:
          'Soft upward and ambient glow from organisms, faces lit cold from below and around.',
        texture_and_material:
          'Glowing veins, spores and trails; wet leaves and skin catching speckled light.',
        camera_and_composition:
          'Keep the requested framing; glowing organisms must be the visible sources.',
        atmosphere_and_mood: 'Enchanted and alien, a living night that shines.',
        rendering_and_quality:
          'Clean stylized glow with deep blacks; original designs, no franchise worlds.',
        key_features:
          'glowing flora and fungi as sources; cyan and violet; floating spores; faces lit from below; navy darkness',
      }),
      avoid: AVOID,
      briefs: [
        'Film still of an adult ranger walking through a night forest of glowing blue ferns and violet mushrooms, spores floating, her face lit cold from below. No text or logo.',
        'Film still of a glowing translucent creature drifting over a still cave lake, its light rippling across the stalactites. No text or logo.',
        'Film still of an adult healer kneeling in glowing moss, cyan light rising through her fingers. No text or logo.',
      ],
    },
    'SP02-074': {
      name: 'Club Strobe Stutter',
      dna: lit({
        aesthetic:
          'Club strobe stutter: a dark space lit only by rapid strobe flashes, so a long exposure catches the subject in several frozen positions at once.',
        color_and_tone:
          'Cold white flashes on black, occasional colored gel tint, crushed ambient.',
        lighting_and_shadow:
          'Repeated hard bursts from one side; everything between flashes stays black.',
        texture_and_material:
          'Stacked translucent copies of moving limbs and hair, crisp in each flash.',
        camera_and_composition: 'Keep the requested framing; motion arcs across the frame.',
        atmosphere_and_mood: 'Frenetic and disorienting, time chopped into flashes.',
        rendering_and_quality:
          'Multiple frozen positions in one frame; the single strobe freeze lives in pack_01.',
        key_features:
          'several frozen positions; strobe bursts on black; stacked limbs; motion arcs; cold flashes',
      }),
      avoid: AVOID,
      briefs: [
        'Club-strobe film still of an adult dancer in a dark club caught in four frozen positions by repeated strobe bursts, cold white on black. No text or logo.',
        'Club-strobe film still of a tavern brawl frozen three times in one frame, a thrown tankard stacked along its arc. No text or logo.',
        'Club-strobe film still of an adult juggler of flaming clubs, each club frozen several times along its loop. No text or logo.',
      ],
    },
    'SP02-075': {
      dna: lit({
        aesthetic:
          'Prism effect: a glass prism or crystal held in front of the lens, splitting light into rainbow smears and ghost reflections at the frame edges.',
        color_and_tone: 'Natural base color with spectral rainbow streaks and soft pastel ghosts.',
        lighting_and_shadow:
          'A bright source refracted through the prism; flares and rainbows bending across the frame.',
        texture_and_material:
          'Hazy refracted edges, softly doubled shapes and thin spectral fringes along contours.',
        camera_and_composition:
          'Keep the requested framing; one edge of the frame softened by the prism.',
        atmosphere_and_mood: 'Dreamy and experimental, reality slipping through glass.',
        rendering_and_quality:
          'Real in-camera refraction through glass; never a digital rainbow overlay.',
        key_features:
          'prism rainbow smears; ghost reflections at the edge; spectral fringes; doubled shapes; hazy refraction',
      }),
      avoid: [...AVOID, 'digital rainbow overlay'],
      briefs: [
        'Film still through a prism of an adult violinist playing on a rooftop at sunset, a rainbow smear bending across one side of the frame, her bow ghosted twice. No text or logo.',
        'Film still through a prism of a hilltop castle reflected three times in soft spectral ghosts across the sky. No text or logo.',
        'Film still through a prism of an adult astronomer lifting a lens to the stars, rainbow flares arcing from the lantern beside him. No text or logo.',
      ],
    },
    'SP02-076': {
      dna: lit({
        aesthetic:
          'Rim lighting: one or two hard backlights outlining the subject with a glowing edge against a dark background.',
        color_and_tone: 'Dark background, bright white or warm edge, little front detail.',
        lighting_and_shadow:
          'Kicker lights behind and to the side of the subject, very low front fill, a halo on hair and shoulders.',
        texture_and_material: 'Fur, hair, fabric edges and breath catching the rim.',
        camera_and_composition:
          'Keep the requested framing; subject against a darker area so the edge reads.',
        atmosphere_and_mood: 'Dramatic and heroic, form defined by a line of light.',
        rendering_and_quality: 'Clean edge highlights without blooming into the background.',
        key_features:
          'glowing edge outline; backlight kickers; dark background; low front fill; halo on hair',
      }),
      avoid: AVOID,
      briefs: [
        'Rim-lit film still of an adult warrior in a heavy fur cloak standing in a dark hall, twin backlights outlining the fur and helmet in white, face in near darkness. No text or logo.',
        'Rim-lit film still of a wolf howling on a rock at night, its fur outlined in silver by a backlight. No text or logo.',
        'Rim-lit film still of an adult cellist on a dark stage, a warm halo along her hair, shoulders and the edge of the cello. No text or logo.',
      ],
    },
    'SP02-077': {
      dna: lit({
        aesthetic:
          'Underwater light: sunlight refracted through a rippling surface, throwing moving caustic nets across everything below.',
        color_and_tone: 'Cyan and aqua attenuation, warm tones dropping away with depth.',
        lighting_and_shadow:
          'Dappled caustic patterns moving over subjects and floor, sunbeams from above.',
        texture_and_material:
          'Floating particles, rising bubbles and slowly drifting hair and fabric.',
        camera_and_composition: 'Keep the requested framing; caustics visible on the subject.',
        atmosphere_and_mood: 'Weightless and serene, sound and time slowed down.',
        rendering_and_quality:
          'Real underwater light behavior; a lighting modifier, not a nature scene.',
        key_features:
          'moving caustic nets; sunbeams from the surface; cyan attenuation; floating particles; drifting fabric',
      }),
      avoid: [...AVOID, 'dry studio light'],
      briefs: [
        'Film still of an adult swimmer in a flowing dress suspended in a deep pool, caustic nets rippling across the dress and tiles, sunbeams slanting from above. No text or logo.',
        'Film still of a sunken marble statue at the bottom of a flooded courtyard, caustics crawling over its face. No text or logo.',
        'Film still of an adult man in a dark suit floating on his back underwater in a swimming pool, caustic light patterns across his face. No text or logo.',
      ],
    },
    'SP02-078': {
      name: 'Motion Light Trails',
      dna: lit({
        aesthetic:
          'Motion light trails: a slow shutter while lit things move, so torches, lanterns and lamps leave glowing streaks behind them.',
        color_and_tone:
          'Warm or colored streaks against dark blue night, sharp static surroundings.',
        lighting_and_shadow:
          'Moving practical lights leave continuous trails; static scene lit by ambient.',
        texture_and_material: 'Smooth ribbons of light, faint ghosted figures carrying them.',
        camera_and_composition:
          'Keep the requested framing; the trails trace the path of movement.',
        atmosphere_and_mood: 'Flowing and ceremonial, movement written in light.',
        rendering_and_quality:
          'Clean long-exposure trails; handheld light drawing belongs to pack_01 Light Painting.',
        key_features:
          'trails from moving practical lights; ghosted carriers; sharp static surroundings; dark blue night; flowing paths',
      }),
      avoid: AVOID,
      briefs: [
        'Long-exposure film still of a torchlit procession winding up a mountain path at night, the torches drawn into a glowing ribbon, the walkers faint ghosts. No text or logo.',
        'Long-exposure film still of a horse-drawn carriage with lanterns crossing a stone bridge, its lamps streaking in two warm lines. No text or logo.',
        'Long-exposure film still of an adult poi spinner on a beach, flames tracing spiraling trails around a faint figure. No text or logo.',
      ],
    },
    'SP02-079': {
      dna: lit({
        aesthetic:
          'Softbox studio light: large diffused sources close to the subject on a seamless backdrop, giving wraparound light and soft-edged shadows.',
        color_and_tone:
          'Clean neutral color, bright soft whites, gentle grey gradient on the seamless.',
        lighting_and_shadow:
          'Big softbox key, fill card opposite, soft contact shadow, no hard edges anywhere.',
        texture_and_material:
          'Every surface shown clearly, with long smooth highlight gradients across curves.',
        camera_and_composition:
          'Keep the requested framing; subject isolated against the seamless.',
        atmosphere_and_mood: 'Calm and clean, attention on the subject alone.',
        rendering_and_quality:
          'Controlled studio exposure; a lighting modifier that keeps the subject unchanged.',
        key_features:
          'large softbox key; seamless backdrop; wraparound light; soft contact shadow; smooth gradients',
      }),
      avoid: [...AVOID, 'hard shadows'],
      briefs: [
        "Softbox studio photograph of an ornate silver knight's helmet with a crest of long white feathers on a charcoal seamless, one big softbox wrapping smooth gradients along the polished steel and feathers, soft contact shadow. No text or logo.",
        'Softbox studio portrait of an adult model holding a carved crystal skull, wraparound light on skin and crystal, clean white seamless. No text or logo.',
        'Softbox studio photograph of a bouquet of dried thistles and roses on a pale seamless, soft even light and a gentle gradient. No text or logo.',
      ],
    },
    'SP02-080': {
      name: 'Anamorphic Overflare',
      dna: lit({
        aesthetic:
          'Anamorphic overflare: bright lights pointed into an anamorphic lens so long horizontal blue streaks and veiling flares cross the frame.',
        color_and_tone: 'Glossy blue and cyan streaks, bright whites, deep cool blacks.',
        lighting_and_shadow:
          'Practical lights, flashlights and searchlights aimed near the lens, creating streaks and glowing veils.',
        texture_and_material:
          'Horizontal flare lines, oval highlights, lens veiling over the image.',
        camera_and_composition:
          'Keep the requested framing; light sources placed in or at the edge of frame.',
        atmosphere_and_mood: 'Kinetic and glossy, spectacle blazing across the lens.',
        rendering_and_quality:
          'True anamorphic flare behavior on invented designs, never any franchise ships or costumes.',
        key_features:
          'long horizontal blue flares; oval highlights; lens veiling; lights aimed at the lens; glossy blacks',
      }),
      avoid: [...AVOID, 'real director reference'],
      briefs: [
        'Anamorphic film still of an adult starship captain on a glossy bridge, long horizontal blue flares streaking from the consoles across the frame, oval highlights. No readable screens or logo.',
        'Anamorphic film still of an adult knight raising a glowing sword in a dark cave, the blade throwing a horizontal cyan streak across the lens. No text or logo.',
        'Anamorphic film still of a spaceport at night, searchlights sweeping into the lens and veiling the landing pads in blue streaks. No text or logo.',
      ],
    },
  },
};

export default spec;
