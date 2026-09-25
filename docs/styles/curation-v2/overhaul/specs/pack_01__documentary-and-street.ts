import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'staged advertisement',
  'stock-photo gloss',
  'generic stock-photo face',
  'celebrity likeness',
  'inventing an event the prompt did not ask for',
];

// Documentary treatments witness the prompt; they do not add events, crowds or places.
const witness =
  'Keep the prompt subject, action and setting; render them as an unposed moment seen by a working photographer, without inventing an event, crowd or location the prompt did not ask for.';
// Viewpoint profiles own the camera position and lens; the subject and setting stay the prompt's.
const viewpoint =
  'Keep the prompt subject, action and setting; this preset owns the camera position and lens, so re-stage only the viewpoint as described.';

function doc(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? witness, ...rest } as Dna;
}

const PHOTO = [
  'illustration',
  'painting',
  'drawing',
  '3d render',
  'cartoon',
  'anime',
  'synthetic CGI',
  'plastic render',
  ...AVOID,
];

const spec: Spec = {
  pack: 'pack_01',
  category: '4. Documentary And Street',
  updates: {
    'SP01-023': {
      dna: doc({
        aesthetic:
          'Action-camera point of view: a tiny ultra-wide camera strapped to a helmet, chest, handlebar or pole, seeing about 150 degrees with a bulging fisheye curve.',
        subject_treatment: viewpoint,
        color_and_tone:
          'Punchy small-sensor color, bright saturated skies and foliage, slightly crunchy contrast, shadows that block quickly.',
        lighting_and_shadow:
          'Whatever the outdoors gives, usually hard sun; flare streaks when the sun enters the dome, no added light.',
        texture_and_material:
          'Over-sharpened fine detail, spray and mud droplets on the lens dome, motion blur only at the extreme edges.',
        camera_and_composition:
          'Mounted camera close to the action: strong barrel distortion, curved horizon, a piece of the wearer or their gear (hands, helmet rim, handlebar, ski tips) intruding at the frame edge, deep focus everywhere.',
        atmosphere_and_mood:
          'Immersive and breathless, the viewer strapped into the motion with no safe distance.',
        rendering_and_quality:
          'Consumer action-cam realism: crisp center, stretched corners, no cinematic depth of field or smooth grading.',
        key_features:
          '150-degree fisheye; curved horizon; wearer or gear in frame; droplets on the dome; deep focus',
      }),
      avoid: [...AVOID, 'shallow depth of field', 'rectilinear lens'],
      briefs: [
        "Helmet-mounted action-camera photograph of an adult knight galloping down a muddy hillside in a cavalry charge, the horse's ears and braided mane at the bottom edge, fisheye barrel curve bending the horizon, mud clods flying at the dome lens. No text or logo.",
        'Chest-mounted action-camera photograph of an adult ice climber on a frozen sea stack, her gloved hands and two ice axes filling the foreground, the 150-degree view bending the grey waves far below, spray drops on the lens. No text or logo.',
        'Action-camera photograph on a pole held by an adult paraglider above a jagged mountain ridge, his grinning face and harness in the lower third, the bright wing canopy bending across the top of the fisheye frame. No text or logo.',
      ],
    },
    'SP01-024': {
      dna: doc({
        aesthetic:
          'Drone nadir aerial: the camera pointing straight down from 60 to 120 meters, turning the ground into a flat map of shapes, paths and shadows.',
        subject_treatment: viewpoint,
        color_and_tone:
          'Clean saturated color, strong local hues against neutral ground, shadows as dark graphic shapes.',
        lighting_and_shadow:
          'Low sun gives long shadows that reveal height; noon light flattens everything into pattern.',
        texture_and_material:
          'Surfaces read as texture fields — water, sand, roofs, crops, snow — with people and objects reduced to small marks.',
        camera_and_composition:
          'Perfectly top-down, no horizon, flattened perspective, subject placed as a small shape inside a larger pattern, strong symmetry or diagonal lines.',
        atmosphere_and_mood:
          'Detached and epic, the familiar world turned into an abstract map seen from far above.',
        rendering_and_quality:
          'Sharp drone survey clarity with no tilt-shift blur, fisheye curve or oblique angle.',
        key_features:
          'straight-down nadir view; flattened map perspective; long shadows reveal height; tiny human marks; pattern fields',
      }),
      avoid: [...AVOID, 'visible horizon', 'oblique angle', 'tilt-shift miniature blur'],
      briefs: [
        'Straight-down drone photograph of a medieval army camp laid out in rings of pale canvas tents in a snowy field, long low-sun shadows stretching from every tent and pole, tiny adult figures between them. No readable banners, text or logo.',
        'Straight-down drone photograph of a red wooden fishing boat in turquoise shallows, two adult fishers hauling a perfect circle of net around a dark shoal, sand ripples below the clear water. No text or logo.',
        'Straight-down drone photograph of an overgrown hedge maze beside a roofless manor, a single adult figure standing at its center casting a long evening shadow across the paths. No text or logo.',
      ],
    },
    'SP01-046': {
      dna: doc({
        aesthetic:
          'Classic black-and-white street photography: a 28–35 mm rangefinder at zone focus, catching the decisive instant when gesture and geometry line up.',
        color_and_tone:
          'High-contrast monochrome, deep blacks and bright paper whites, few muted greys.',
        lighting_and_shadow:
          'Hard available sun or overcast; shadows used as black shapes in the composition.',
        texture_and_material:
          'Honest grain, real wear on clothes and walls, slight motion blur in feet or hands.',
        camera_and_composition:
          'Eye level or lower, subject off-center within layered depth, a leap, glance or crossing aligned with a line, stair or doorway.',
        atmosphere_and_mood:
          'Alert and fleeting, a small coincidence frozen before it dissolves back into the street.',
        rendering_and_quality:
          'Darkroom-print contrast and grain, not a posed portrait and not a gritty digital filter.',
        key_features:
          'decisive moment; high-contrast black and white; gesture aligned with geometry; 28–35 mm closeness; honest grain',
      }),
      avoid: [...AVOID, 'posed', 'studio', 'color'],
      briefs: [
        "Black-and-white street photograph at the instant an adult baker's apprentice leaps a gutter with a tray of loaves while a black cat freezes on the stair above him, hard sun and deep shadow, 28 mm, grain. No text or logo.",
        'Black-and-white street photograph during a carnival of adults in grotesque papier-mâché heads, one reveler lifting his giant head to light a pipe while the others march on, high contrast, zone-focused. No text or logo.',
        'Black-and-white street photograph of an adult knife-grinder at his foot-pedal wheel, a fan of sparks lighting the face of an adult woman pausing beside him, low angle, black doorway behind. No text or logo.',
      ],
    },
    'SP01-052': {
      dna: doc({
        aesthetic:
          'Sports action photography: a 300–400 mm telephoto at f/2.8 and 1/2000 s freezing the peak instant of an effort.',
        color_and_tone:
          'Clean vivid color on the athlete, background dissolved into soft color blocks.',
        lighting_and_shadow:
          'Hard daylight or stadium floods from above; sweat and flying material catch bright specular highlights.',
        texture_and_material:
          'Frozen dust, sand, water, splinters and sweat drops hanging around the body; fabric rippled by force.',
        camera_and_composition:
          'Tight telephoto crop on the peak of action, compressed background, crowd or landscape reduced to blur, eye contact or strain visible.',
        atmosphere_and_mood:
          'Explosive and strained, the body at maximum effort held still for one frame.',
        rendering_and_quality:
          'Razor-sharp subject against creamy telephoto blur, no motion smear on the athlete.',
        key_features:
          'telephoto freeze at peak action; compressed blurred background; flying debris frozen; strained faces; hard top light',
      }),
      avoid: [...AVOID, 'static pose', 'wide-angle distortion', 'readable jersey numbers'],
      briefs: [
        'Sports photograph of an adult athlete at a highland games at the instant a huge wooden caber tips over its peak, the kilt swinging, mud frozen off his boots, 400 mm compression turning the crowd into soft color. No text or logo.',
        "Sports photograph of two adult wrestlers in a sand pit at a village fair as one is thrown over the other's hip, a spray of sand frozen in the air, faces strained, telephoto blur behind. No text or logo.",
        'Sports photograph of adult rowers in a long wooden boat race, one oar blade tearing out of dark water with a sheet of spray frozen in mid-air, 1/2000 s, background shoreline blurred. No text or logo.',
      ],
    },
    'SP01-060': {
      dna: doc({
        aesthetic:
          'War reportage: a 35 mm witness close to exhausted people in harsh conditions, shot fast, without heroics or staging.',
        color_and_tone:
          'Desaturated ochre, khaki and ash grey, skin dulled by dust, occasional muted red accent.',
        lighting_and_shadow:
          'Harsh sun or flat smoky overcast; smoke and dust diffuse the light; no glamour lighting.',
        texture_and_material:
          'Dust in the air, grit on faces and cloth, frayed and patched gear, film grain.',
        camera_and_composition:
          'Close and slightly tilted, subjects caught between actions, foreground obstruction, horizon not perfectly level.',
        atmosphere_and_mood:
          'Unflinching and weary, quiet exhaustion instead of spectacle or triumph.',
        rendering_and_quality:
          'Credible press photograph; no explosions, gore or heroic posing unless the prompt asks for them.',
        key_features:
          'desaturated dust palette; 35 mm closeness; tilted urgent framing; exhaustion over spectacle; grain',
      }),
      avoid: [...AVOID, 'posed', 'heroic poster pose', 'gore', 'explosion not in the prompt'],
      briefs: [
        'Documentary war photograph of adult foot soldiers in dented kettle helmets asleep against a breached castle wall at dawn, dust hanging in the air, desaturated ochre and ash grey, 35 mm, tilted horizon, grain. No gore, text or logo.',
        'Documentary war photograph of an adult field surgeon washing her hands in a bucket outside a canvas hospital tent, smoke haze turning the sun white, weary face turned from the lens. No gore, text or logo.',
        'Documentary war photograph of adult refugees pushing loaded handcarts across a broken stone bridge in harsh noon sun, dust kicked up, one looking back toward the camera. No text or logo.',
      ],
    },
    'SP01-061': {
      dna: doc({
        aesthetic:
          'Paparazzi night shot: a long lens and a blasting on-camera flash catching a startled subject leaving somewhere, pressed by other photographers.',
        color_and_tone:
          'Flash-washed skin, blown whites, dark warm background, rival flashes as white bursts.',
        lighting_and_shadow:
          'Hard direct flash from the lens axis, a black shadow outline behind, practical light in the background falling into darkness.',
        texture_and_material:
          'High-ISO noise, motion blur on the background and hands, flash glare on glossy fabric and jewelry.',
        camera_and_composition:
          'Off-balance framing through shoulders and raised hands, subject turning or shielding their face, slightly tilted horizon.',
        atmosphere_and_mood:
          'Urgent and intrusive, a private moment ripped open by a sudden white burst.',
        rendering_and_quality:
          'Tabloid snapshot rawness; only invented, fictional subjects, never a recognizable real person.',
        key_features:
          'blasting on-axis flash; startled shielding subject; rival flash bursts; tilted crowded framing; high-ISO noise',
      }),
      avoid: [...AVOID, 'real person likeness', 'posed red-carpet smile'],
      briefs: [
        'Paparazzi night photograph of an adult vampire-lord character leaving a masquerade ball, raising a gloved hand to shield his pale face from a blasting flash, rival flashes bursting white behind, tilted framing through shoulders. Fictional person. No text or logo.',
        'Paparazzi flash photograph of an adult sorceress in a black feathered cape stepping down from a carriage at night, startled eyes, glare on her silver jewelry, motion blur in the crowd of lenses. Fictional person. No text or logo.',
        'Paparazzi flash photograph of an adult masked jewel thief caught in the doorway of a museum gala, a velvet bag clutched to his chest, flash-washed face, black shadow outline on the marble behind. Fictional person. No text or logo.',
      ],
    },
    'SP01-064': {
      dna: doc({
        aesthetic:
          'Live concert photography: stage lighting cutting through haze, shot from the pit at high ISO during a peak moment of performance.',
        color_and_tone:
          'Saturated gel colors — red, blue, magenta, amber — against black, skin taking the color of the beam.',
        lighting_and_shadow:
          'Backlight fans and spots through haze, visible beams, silhouetted rims, lens flare from fixtures.',
        texture_and_material:
          'Haze, sweat, grain from high ISO, motion blur on hair and hands, crowd hands in the foreground.',
        camera_and_composition:
          'Low pit angle or from behind the crowd, performer mid-gesture, beams radiating, foreground hands or instruments cropped.',
        atmosphere_and_mood:
          'Loud and euphoric, heat and noise felt through the color and the haze.',
        rendering_and_quality:
          'High-ISO live realism with clean blacks; no studio lighting and no invented band logos.',
        key_features:
          'gel beams through haze; backlit performer; pit angle; crowd hands foreground; high-ISO grain',
      }),
      avoid: [...AVOID, 'quiet', 'bright daylight', 'band logo'],
      briefs: [
        'Concert photograph from the pit of an adult hurdy-gurdy player in a folk-metal band throwing his head back under red and blue beams slicing through haze, sweat flying, crowd hands raised in the foreground, high-ISO grain. No text or logo.',
        'Concert photograph of an adult frame-drum player silhouetted in front of a white backlight fan, the beams radiating through thick haze, a sea of dark heads below. No text or logo.',
        'Concert photograph of an adult cellist in a black gown playing in a cathedral under a single cold spotlight, blue haze filling the vaults above, candles on the altar steps. No text or logo.',
      ],
    },
    'SP01-070': {
      dna: doc({
        aesthetic:
          'Editorial travel photography: a place discovered through a traveler, with the journey layered into the frame as route, scale and local light.',
        color_and_tone:
          'Natural destination color, warm late-day light, local accent hues against dusty neutrals.',
        lighting_and_shadow:
          'Available daylight: dawn departures, raking afternoon sun, window spill inside dwellings.',
        texture_and_material:
          'Road dust, weathered stone, textiles, water sheen and patina of age, all rendered tactile.',
        camera_and_composition:
          '24–50 mm, a human figure for scale inside the landscape or architecture, leading path or road, foreground detail from the local place.',
        atmosphere_and_mood:
          'Curious and restless, the pleasure of arriving somewhere far from home.',
        rendering_and_quality:
          'Magazine travel realism with restrained grading; no brochure gloss, selfie framing or tourist-trap staging.',
        key_features:
          'traveler for scale; route and path in frame; local accent color; warm raking daylight; tactile place detail',
      }),
      avoid: [...AVOID, 'tourist trap', 'selfie', 'brochure gloss'],
      briefs: [
        'Travel photograph of an adult traveler leading a laden mule up a zigzag path toward a monastery clinging to a cliff face, morning sun raking the rock, prayer flags without writing snapping in the wind, 35 mm. No text or logo.',
        'Travel photograph inside a felt yurt of an adult traveler sharing salt tea with an adult nomad herder, a shaft of light from the roof ring falling on patterned carpets and a steaming kettle. No text or logo.',
        'Travel photograph of an adult passenger at the rail of a small ferry as it glides into a walled fortress harbor at first light, gulls, mist and warm stone ahead. No text or logo.',
      ],
    },
    'SP01-075': {
      dna: doc({
        aesthetic:
          'Urban exploration photography: abandoned buildings recorded on a tripod, with decay, light shafts and silence as the subject.',
        color_and_tone:
          'Desaturated rust, moss green, peeling pastel paint and grey concrete, with warm or cold light shafts.',
        lighting_and_shadow:
          'Natural light through collapsed roofs, broken windows and doorways; long exposure keeps the shadows detailed.',
        texture_and_material:
          'Peeling paint, rust bloom, fallen plaster, moss and ivy invading floors, dust in the beams.',
        camera_and_composition:
          '16–24 mm symmetrical view down a hall or nave, wide foreground debris, at most one small human figure for scale.',
        atmosphere_and_mood: 'Lonely and hushed, time pressing on a room that everyone has left.',
        rendering_and_quality:
          'Tripod-sharp exposure with restrained HDR; no fake grunge overlay or horror props.',
        key_features:
          'abandoned interior; light shafts through collapse; peeling paint and rust; symmetrical wide view; tiny human scale',
      }),
      avoid: [...AVOID, 'clean', 'new', 'horror props'],
      briefs: [
        'Urban exploration photograph of an abandoned opera house, a fallen crystal chandelier lying on moss-covered velvet seats, light shafts pouring through the broken dome, one tiny adult explorer with a headlamp on the stage. No text or logo.',
        'Urban exploration photograph of a flooded abandoned chapel, rows of pews half under still green water, peeling blue plaster, a shaft of light through the empty rose window. No text or logo.',
        'Urban exploration photograph of an abandoned observatory, a rusted brass telescope pointing at a hole in the dome, ivy climbing its mount, dust in the single beam of daylight. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Layered Color Street',
      domain: 'layered color street photography',
      tags: ['street', 'color', 'documentary'],
      dna: doc({
        aesthetic:
          'Layered color street photography: saturated color and hard light organized into three or four planes of depth, each holding its own small action.',
        color_and_tone:
          'Rich saturated color fields — saffron, cobalt, crimson, white — separated by deep shadow gaps.',
        lighting_and_shadow:
          'Strong low sun that splits the scene into bright color planes and black shadow shapes.',
        texture_and_material:
          'Sun-baked walls, cloth, skin and dust rendered with slide-like density and fine grain.',
        camera_and_composition:
          '28–50 mm, a cropped foreground figure or object, a midground gesture and a background incident, all readable at once.',
        atmosphere_and_mood:
          'Busy yet composed, many small lives stacked into one complex, balanced frame.',
        rendering_and_quality:
          'Saturated documentary color without HDR; separation comes from light and color, not sharpening.',
        key_features:
          'three or four depth planes; saturated color fields; black shadow gaps; foreground crop; simultaneous small actions',
      }),
      avoid: [...PHOTO, 'posed', 'flat single-plane composition'],
      briefs: [
        "Layered color street photograph at a harbor festival: an adult fisherwoman's orange oilskin shoulder cropped in the foreground, two adult dancers in blue mid-spin in the midground, a whitewashed wall in hard sun with one lit window behind, black shadow gaps between. No text or logo.",
        'Layered color street photograph of a riverside laundry where adults wring out long sheets of saffron, cobalt and crimson cloth, the sheets forming hanging planes of color with deep shadow between them. No text or logo.',
        "Layered color street photograph of an adult village wedding procession passing a yellow wall, an adult drummer in deep shadow in the foreground, the bride's red veil catching sun in the midground, a goat on a stair in the background. No text or logo.",
      ],
    },
    {
      name: 'Telephoto Compression Street',
      domain: 'long-lens compressed street',
      tags: ['telephoto', 'street', 'documentary'],
      dna: doc({
        aesthetic:
          'Telephoto street compression: a 300–600 mm lens from far away, stacking distant layers so near and far press into one flat wall.',
        subject_treatment: viewpoint,
        color_and_tone:
          'Muted, slightly hazy color from the air between camera and subject; shapes over detail.',
        lighting_and_shadow:
          'Backlight or side light through atmosphere; heat shimmer and haze soften far planes.',
        texture_and_material:
          'Repeated shapes stacking (roofs, heads, cloaks, chimneys) into dense pattern.',
        camera_and_composition:
          'Extremely narrow field of view, flattened depth, huge background objects (sun, moon, towers) looming behind small subjects, shallow focus on one layer.',
        atmosphere_and_mood:
          'Crowded and dreamlike, distance collapsed so everything seems to press together.',
        rendering_and_quality:
          'Long-lens rendering with atmospheric softness; no wide-angle perspective lines.',
        key_features:
          'extreme telephoto compression; stacked layers; giant background sun or moon; heat haze; flattened depth',
      }),
      avoid: [...PHOTO, 'wide-angle perspective', 'deep converging lines'],
      briefs: [
        'Telephoto 600 mm photograph compressing a long line of adult pilgrims on a mountain road into a single wall of hooded cloaks, a huge setting sun hanging directly behind them in the haze. No text or logo.',
        'Telephoto photograph of an adult lamplighter on a tall wooden ladder, tiny against an enormous rising moon that fills the frame behind the chimney tops. No text or logo.',
        'Telephoto 400 mm photograph of adult chimney sweeps working across layered slate roofs, dozens of chimneys stacked flat into a wall of brick, smoke haze between the rows. No text or logo.',
      ],
    },
    {
      name: 'Hard-Shadow Street Geometry',
      domain: 'graphic shadow street photography',
      tags: ['shadow', 'street', 'documentary'],
      dna: doc({
        aesthetic:
          'Hard-shadow street geometry: exposure set for the sunlit patches so everything else falls into solid black shapes, and the subject steps into the light.',
        color_and_tone:
          'Bright warm highlights against black; color limited to what the sun touches, or crisp monochrome.',
        lighting_and_shadow:
          'Hard low or noon sun cut by walls, arcades, grilles and stairs into slashes, combs and rectangles of light.',
        texture_and_material:
          'Sun-grazed stone and fabric in the lit shapes; shadow areas nearly featureless.',
        camera_and_composition:
          'Composition built around the shadow shapes; subject placed exactly in a slice of light, often with their own long shadow.',
        atmosphere_and_mood:
          'Graphic and tense, a lone figure balanced on a thin edge between light and void.',
        rendering_and_quality:
          'Clean deep blacks and protected highlights; no fill light lifting the shadows.',
        key_features:
          'subject in a slice of light; solid black shadow shapes; hard sun; long cast shadows; underexposed surroundings',
      }),
      avoid: [...PHOTO, 'fill light', 'lifted shadows', 'overcast flat light'],
      briefs: [
        'Street photograph of an adult water-carrier stepping into a single slash of sunlight between two black shadowed walls, her long shadow falling down a stone stair, everything else solid black. No text or logo.',
        'Street photograph of an adult barber shaving a customer outdoors, the shadow of an iron balcony grille projected across both of them as a pattern of black curls on sunlit skin. No text or logo.',
        'Street photograph of an adult porter carrying a tall birdcage across a courtyard where the arcade throws a comb of black shadows, the porter caught in one bar of hard light. No text or logo.',
      ],
    },
    {
      name: 'Reflection-Layered Street',
      domain: 'glass reflection street photography',
      tags: ['reflection', 'street', 'documentary'],
      dna: doc({
        aesthetic:
          'Reflection-layered street photography: shooting through window glass so the room behind and the street reflected on it overlap in one ambiguous frame.',
        color_and_tone:
          'Two color worlds blended: warm interior light mixing with cool reflected daylight; semi-transparent overlaps.',
        lighting_and_shadow:
          'Balanced exposure between inside and outside so both layers read; dark areas of one layer reveal the other.',
        texture_and_material:
          'Glass imperfections, bullseye distortion, condensation or dust on the pane, crisp edges where layers meet.',
        camera_and_composition:
          'Camera close to the glass, subject inside framed by reflected shapes from outside (or the reverse); no single clear depth plane.',
        atmosphere_and_mood:
          'Dreamlike and ambiguous, two moments folded into one surface of glass.',
        rendering_and_quality:
          'In-camera optical overlap, not a digital double exposure or blend-mode composite.',
        key_features:
          'through-glass layering; reflected street over interior; semi-transparent overlap; glass flaws; ambiguous depth',
      }),
      avoid: [...PHOTO, 'digital double exposure', 'readable shop lettering'],
      briefs: [
        'Photograph through an apothecary window: shelves of glass jars and hanging dried herbs inside overlapping with the reflection of an adult passer-by in a hooded cloak and the snowy lane behind her. No readable labels, text or logo.',
        'Photograph through the thick bullseye glass of a tavern window: adult drinkers laughing by the fire inside, overlaid with the reflected blue street and a passing lantern outside. No text or logo.',
        "Photograph through a clockmaker's shop window: an adult clockmaker bent over a movement with a loupe, the reflection of a great clock tower across the square layered over her workbench. No readable dials, text or logo.",
      ],
    },
    {
      name: 'Slow-Shutter Crowd Drag',
      domain: 'slow-shutter motion street',
      tags: ['slow-shutter', 'motion-blur', 'documentary'],
      dna: doc({
        aesthetic:
          'Slow-shutter drag: a quarter to one second exposure where one still subject stays sharp while everything moving streaks around it.',
        color_and_tone: 'Natural color; moving areas blend into soft ribbons of mixed hue.',
        lighting_and_shadow:
          'Dim daylight, dusk or interior light that allows a long shutter without blowing out.',
        texture_and_material:
          'Ghosted walkers, smeared cloaks, streaked wheels and birds; the still subject crisp in texture.',
        camera_and_composition:
          'Tripod or braced camera; still subject centered or on a third, motion flowing past on both sides.',
        atmosphere_and_mood:
          'Calm inside rush, a single point of stillness while the world streams past.',
        rendering_and_quality:
          'Optical motion blur with a genuinely sharp anchor, not a digital radial blur.',
        key_features:
          'one sharp still subject; streaked moving crowd; quarter-second exposure; ghosted figures; stillness versus flow',
      }),
      avoid: [...PHOTO, 'everything frozen sharp', 'digital radial blur'],
      briefs: [
        'Slow-shutter photograph of an adult street fiddler standing perfectly still, bow on the strings, while a crowd of adult festival-goers streams past on both sides as ribbons of color. No text or logo.',
        'Slow-shutter photograph of an adult city guard motionless under a stone gate arch while carts, horses and walkers blur through the passage around him at dusk. No text or logo.',
        'Slow-shutter photograph of an adult woman in a red cloak standing still in the middle of a bridge while a flock of pigeons and hurrying walkers smear past her. No text or logo.',
      ],
    },
    {
      name: 'Over-Under Split Shot',
      domain: 'half-underwater dome port photography',
      tags: ['split-shot', 'underwater', 'documentary'],
      dna: doc({
        aesthetic:
          'Over-under split shot: a dome port held half in the water, so the waterline cuts the frame and shows the world above and below at once.',
        subject_treatment: viewpoint,
        color_and_tone:
          'Warm sunlit air above, green or turquoise water below, the two separated by a bright wavy waterline.',
        lighting_and_shadow:
          'Daylight from above; sun rays and caustics below the surface; the upper half usually brighter.',
        texture_and_material:
          'Droplets on the upper dome, refraction bending shapes at the line, particles and bubbles in the water.',
        camera_and_composition:
          'Waterline crossing the middle or lower third, subject spanning both halves when possible, wide lens at water level.',
        atmosphere_and_mood: 'Curious and double, two worlds meeting at one thin trembling line.',
        rendering_and_quality:
          'Real optical split with refraction at the waterline, not a stitched composite.',
        key_features:
          'waterline splits the frame; above and below at once; dome droplets; underwater caustics; subject across both halves',
      }),
      avoid: [...PHOTO, 'straight clean composite seam'],
      briefs: [
        'Over-under split photograph of an adult pearl diver holding the side of a wooden boat, above the waterline her boat and a cliff village in sun, below it her legs and a school of silver fish in turquoise water. No text or logo.',
        'Over-under split photograph of a flooded chapel: above the waterline a carved stone arch and ivy, below it a submerged staircase descending into green water with shafts of light. No text or logo.',
        'Over-under split photograph of an adult raft ferryman poling across a jungle river, the pole and a huge whiskered catfish visible below the line, the raft and green canopy above. No text or logo.',
      ],
    },
    {
      name: 'Documentary Typology Portrait',
      domain: 'frontal typological portrait',
      tags: ['typology', 'portrait', 'documentary'],
      dna: doc({
        aesthetic:
          'Documentary typology portrait: a medium-format frontal full-length portrait of a person as their trade, one of an imagined series, with no drama in light or pose.',
        subject_treatment:
          'Keep the prompt subject and setting; stand the person upright and square to the camera, full length, looking into the lens, holding the tool or object that defines them.',
        color_and_tone:
          "Soft neutral color or quiet monochrome; the sitter's clothes carry the only accents.",
        lighting_and_shadow: 'Even overcast daylight, no key light, gentle shadow under the feet.',
        texture_and_material:
          'Worn work clothes, tools and hands rendered with medium-format clarity.',
        camera_and_composition:
          'Camera at chest height, centered subject, full body with a little ground and plain local background, symmetrical frame.',
        atmosphere_and_mood:
          'Dignified and matter-of-fact, a person simply presented as who they are.',
        rendering_and_quality:
          'Medium-format precision and restraint; no dramatic grading, wide-angle distortion or candid blur.',
        key_features:
          'frontal full-length stance; direct gaze; defining tool in hand; even overcast light; centered symmetrical frame',
      }),
      avoid: [...PHOTO, 'dramatic lighting', 'candid motion'],
      briefs: [
        'Documentary typology portrait, frontal and full length, of an adult gravedigger holding a spade upright, standing square to the camera before a lichen-covered cemetery wall, even overcast light, medium-format clarity. No text or logo.',
        'Documentary typology portrait of an adult cheesemaker in a white smock holding a great wheel of cheese against her hip, standing centered in a whitewashed dairy doorway, direct gaze, soft daylight. No text or logo.',
        "Documentary typology portrait of two adult sisters who are blacksmiths standing side by side in leather aprons, one holding tongs and one a hammer, square to the camera in front of the forge's brick wall. No text or logo.",
      ],
    },
    {
      name: 'Low Oblique Aerial',
      domain: 'oblique aerial photography',
      tags: ['aerial', 'oblique', 'documentary'],
      dna: doc({
        aesthetic:
          'Low oblique aerial: a camera in a helicopter or small plane looking down at 30–45 degrees from a few hundred meters, showing relief, depth and often the horizon.',
        subject_treatment: viewpoint,
        color_and_tone: 'Natural landscape color with atmospheric blue in the distance.',
        lighting_and_shadow:
          'Low raking sun at dawn or dusk that carves terrain relief and casts long shadows from structures.',
        texture_and_material:
          'Fields, cliffs, walls, water and roads read as relief and texture; people tiny but visible.',
        camera_and_composition:
          'Angled downward view with depth receding to a high horizon or distant haze; subject in the near third.',
        atmosphere_and_mood:
          'Expansive and exploratory, the land revealed as a whole shape at once.',
        rendering_and_quality:
          'Aerial survey clarity with haze falloff; distinct from a straight-down drone view and from tilt-shift miniature blur.',
        key_features:
          '30–45 degree downward angle; raking dawn light; terrain relief; distant haze and horizon; tiny human scale',
      }),
      avoid: [...PHOTO, 'straight-down nadir view', 'tilt-shift miniature blur'],
      briefs: [
        'Low oblique aerial photograph of a fortified island monastery at dawn, the causeway and tidal flats glowing, long shadows from its walls and towers, haze on the distant coastline. No text or logo.',
        'Low oblique aerial photograph of a caravan of covered wagons crossing white salt flats, their long shadows raking across the crust, mountains in blue haze at the horizon. No text or logo.',
        'Low oblique aerial photograph of a volcanic crater lake ringed by black cliffs, a tiny adult hiker standing on the rim, morning mist spilling over the edge. No text or logo.',
      ],
    },
    {
      name: 'Frame-Within-Frame Observational',
      domain: 'observational doorway framing',
      tags: ['observational', 'framing', 'documentary'],
      dna: doc({
        aesthetic:
          'Observational frame-within-frame: the photographer stays in the dark next room and records life through a doorway, window or arch, unnoticed.',
        color_and_tone:
          'Dark underexposed foreground frame, warm or daylight-lit subject area beyond, natural color.',
        lighting_and_shadow:
          'The subject space is lit by its own windows or lamps; the frame surrounding it stays in shadow.',
        texture_and_material:
          'Door jambs, stone arches and window mullions in soft silhouette; subject area detailed.',
        camera_and_composition:
          'A dark frame occupying the edges, the subject small and centered inside it, eye level, 35–50 mm, straight verticals.',
        atmosphere_and_mood:
          'Quiet and discreet, the viewer an unseen witness to an intimate, private moment.',
        rendering_and_quality:
          'Natural exposure favoring the lit interior; no flash and no staged eye contact.',
        key_features:
          'dark doorway or arch frame; subject lit beyond; unseen observer; small centered subject; straight verticals',
      }),
      avoid: [...PHOTO, 'posed eye contact', 'flash'],
      briefs: [
        'Photograph through a half-open workshop door from a dark corridor: an adult luthier fitting strings to a lute at a bench in warm window light, the door frame a black border around him. No text or logo.',
        'Photograph through a ruined stone arch of adult washerwomen beating linen on flat rocks at a river, morning light on the water, the arch in soft dark silhouette. No text or logo.',
        'Photograph from a dark farmhouse kitchen through a small window of an adult farmer crossing a snowy yard at dusk with a lantern, the window mullions framing him. No text or logo.',
      ],
    },
    {
      name: 'Humanist Reportage',
      domain: 'humanist black-and-white reportage',
      tags: ['humanist', 'black-and-white', 'documentary'],
      dna: doc({
        aesthetic:
          'Humanist reportage: tender black-and-white photographs of ordinary people at eye level with a 50 mm lens, finding dignity and gentle humor in everyday life.',
        color_and_tone:
          'Soft monochrome with long grey midtones, gentle contrast, no crushed blacks.',
        lighting_and_shadow: 'Overcast daylight or soft window light; shadows open and forgiving.',
        texture_and_material:
          'Moderate grain; worn clothes, bread, stone and hands rendered warmly.',
        camera_and_composition:
          '50 mm at eye level, subjects close enough to read expression, simple backgrounds, a small humorous or tender detail.',
        atmosphere_and_mood:
          'Warm and compassionate, quiet affection for people going about their day.',
        rendering_and_quality:
          'Soft darkroom print; distinct from gritty high-contrast street photography.',
        key_features:
          'tender everyday moment; soft grey monochrome; 50 mm eye level; overcast light; gentle humor',
      }),
      avoid: [...PHOTO, 'harsh contrast', 'color', 'posed'],
      briefs: [
        'Humanist black-and-white photograph of an old adult couple sharing a loaf of bread on a bench by a canal, his hat tipped over one eye, her laughing, soft overcast light, 50 mm. No text or logo.',
        'Humanist black-and-white photograph of an adult laundress laughing as she pins a sheet on a line strung between two houses, a dog asleep in the basket below. No text or logo.',
        'Humanist black-and-white photograph of an adult cobbler kneeling to fit a new boot on an adult customer in a tiny workshop, both looking critically at the toe, soft window light. No text or logo.',
      ],
    },
    {
      name: 'High-ISO Night Reportage',
      domain: 'available-light night reportage',
      tags: ['night', 'high-iso', 'documentary'],
      dna: doc({
        aesthetic:
          'High-ISO night reportage: handheld at ISO 6400–12800 with no flash, using only the practical light of fires, lamps and windows.',
        color_and_tone:
          'Warm practicals against deep blue-black, slightly muddy saturation, color noise in the shadows.',
        lighting_and_shadow:
          'Small pools of practical light, faces lit from one side, large areas of near-black.',
        texture_and_material:
          'Visible luminance and color noise, slight motion softness in hands, glowing embers or flames.',
        camera_and_composition:
          'Wide aperture shallow focus, 35 mm handheld, subject turned toward the light source.',
        atmosphere_and_mood:
          'Hushed and nocturnal, work carrying on while the rest of the world sleeps.',
        rendering_and_quality:
          'Honest digital high-ISO noise and soft focus falloff; no flash, no noise reduction smear.',
        key_features:
          'no flash; practical light pools; high-ISO noise; shallow handheld focus; deep blue-black shadows',
      }),
      avoid: [...PHOTO, 'flash', 'clean noiseless shadows'],
      briefs: [
        'High-ISO night photograph of adult bakers working at three in the morning in a cellar bakehouse, lit only by the glowing oven mouth, flour dust hanging in the orange light, deep noisy shadows. No text or logo.',
        'High-ISO night photograph of adult barge workers loading sacks by torchlight at a river quay, flames reflected in black water, color noise in the dark hull. No text or logo.',
        'High-ISO night photograph of an adult fire-watch keeper on a bell tower scanning the sleeping city with a hooded lantern, the lantern lighting only her face and hand. No text or logo.',
      ],
    },
  ],
};

export default spec;
