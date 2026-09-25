import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'readable text',
  'readable handwriting',
  'brand logo',
  'franchise likeness',
  'celebrity likeness',
  'adding the drawing support as an extra object in the scene',
];

// DIY media: the subject is drawn with the tool on the support; the support is the surface, not an added prop.
const drawn =
  'Keep the prompt subject intact and draw it with this tool on this support; the support is shown only as the drawing surface, never added as an extra object in the scene.';

function diy(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? drawn, ...rest } as Dna;
}

const BASE = ['photorealistic rendering', '3d render', 'polished digital art', ...AVOID];

const spec: Spec = {
  pack: 'pack_02',
  category: '8. Hand-Drawn And DIY Media',
  updates: {
    'SP02-091': {
      dna: diy({
        aesthetic:
          'Office whiteboard doodle: dry-erase markers on a glossy whiteboard, drawn fast during a meeting, with the ghosts of earlier half-erased drawings underneath.',
        color_and_tone:
          'Glossy white board, marker blue, red, green and black, faint grey ghosting.',
        lighting_and_shadow: 'Office fluorescent glare streaks across the board surface.',
        texture_and_material:
          'Streaky marker strokes that skip on the gloss, smudged edges where a hand brushed, eraser swipes.',
        camera_and_composition:
          'The whole board seen flat, arrows and circles connecting the drawn subject.',
        atmosphere_and_mood: 'Bored and playful, inspiration sneaking into a long meeting.',
        rendering_and_quality:
          'Real marker on glossy board with glare; no readable words, only arrows and shapes.',
        key_features:
          'dry-erase marker streaks; half-erased ghost drawings; fluorescent glare; arrows and circles; four-color markers',
      }),
      avoid: [...BASE, 'bicycle'],
      briefs: [
        'Office whiteboard doodle of a dragon attacking a castle drawn in blue, red and green dry-erase marker, arrows labelling nothing but pointing at the flames, half-erased flowchart ghosts underneath, fluorescent glare across the board. No readable words or logo.',
        'Whiteboard doodle of a cat-shaped rocket ship with a flame tail and orbit arrows around a scribbled moon, streaky marker skipping on the gloss. No readable words or logo.',
        'Whiteboard doodle of an octopus juggling coffee mugs, eraser swipes across one tentacle, faint ghost drawings behind. No readable words or logo.',
      ],
    },
    'SP02-092': {
      dna: diy({
        aesthetic:
          'Crumpled-paper scribble: a pencil and ink drawing on paper that was crushed into a ball and flattened again, the creases cutting through the art.',
        color_and_tone:
          'Off-white and yellowed paper, graphite grey, blue ballpoint, a coffee-brown stain.',
        lighting_and_shadow:
          'Low side light raking across the creases so every fold casts a tiny shadow.',
        texture_and_material:
          'Sharp crease network, broken lines where ink skipped over folds, abraded fibers.',
        camera_and_composition:
          'Paper seen flat, filling the frame, the drawing warped slightly by the folds.',
        atmosphere_and_mood: 'Wistful and rescued, a thrown-away idea given a second chance.',
        rendering_and_quality:
          'Real crumpled-paper surface with light across the folds; not a texture overlay.',
        key_features:
          'crease network through the drawing; raking side light; skipped ink over folds; yellowed paper; coffee stain',
      }),
      avoid: BASE,
      briefs: [
        'Crumpled-paper scribble of a lighthouse keeper cat in a raincoat drawn in pencil and blue ink, the flattened paper crossed by sharp creases, low side light casting tiny shadows on every fold. No readable text or logo.',
        'Crumpled-paper scribble of a sailing ship in a storm, the ink broken where it crossed the folds, a coffee stain in one corner. No readable text or logo.',
        'Crumpled-paper scribble of a sleeping fox curled inside a teacup, pencil and ink lines broken by sharp creases, yellowed paper with abraded fibers and tiny shadows on every fold. No readable text or logo.',
      ],
    },
    'SP02-093': {
      dna: diy({
        aesthetic:
          'Prehistoric cave painting: ochre, charcoal and red iron pigment blown and smeared onto a bumpy limestone wall by firelight.',
        subject_treatment:
          'Keep the prompt subject intact and paint it as a cave-wall image in pigment on rock, simplified into flowing outlines and filled silhouettes, without adding a cave scene around it.',
        color_and_tone:
          'Red and yellow ochre, charcoal black, bone-white calcite on warm tan stone.',
        lighting_and_shadow:
          'Flickering torchlight from below, the rock relief catching warm light.',
        texture_and_material:
          'Spray-blown hand stencils, finger-smeared pigment, cracks and calcite drips, rock bulges used as body volume.',
        camera_and_composition:
          'Figures arranged along the natural contours of the wall, overlapping freely.',
        atmosphere_and_mood: 'Ancient and ritual, the first images made by firelight.',
        rendering_and_quality:
          'Real pigment on stone; not a flat tribal graphic and not modern clip art.',
        key_features:
          'ochre and charcoal pigment; spray-blown hand stencils; rock relief as volume; torchlight; overlapping figures',
      }),
      avoid: [...BASE, 'flat tribal graphic', 'modern clip art'],
      briefs: [
        'Prehistoric cave painting of a herd of mammoths in red ochre and charcoal flowing along the bulges of a limestone wall, spray-blown hand stencils around them, flickering torchlight from below. No text or logo.',
        'Prehistoric cave painting of a hunter facing a cave bear, finger-smeared charcoal outlines, calcite drips running through the scene. No text or logo.',
        'Prehistoric cave painting of a flock of swans in flight in yellow ochre on warm stone, one wing following a crack in the rock. No text or logo.',
      ],
    },
    'SP02-096': {
      dna: diy({
        aesthetic:
          'Skateboard deck graphic: 80s punk screenprint artwork with dripping slime, bold iconography and thick black keylines, printed flat in loud spot colors.',
        subject_treatment:
          'Keep the prompt subject intact and render it as a flat screenprinted deck-style graphic; the board itself is never drawn or added.',
        color_and_tone:
          'Toxic green, hot pink, electric purple and yellow spot colors on black, with slime drips.',
        lighting_and_shadow: 'No rendered light; flat spot colors with cel-style halftone shading.',
        texture_and_material:
          'Screenprint misregistration, thick keylines, drippy slime edges, worn print scuffs.',
        camera_and_composition:
          'Tall centered emblem composition with the subject rising out of flames or slime.',
        atmosphere_and_mood: 'Rebellious and loud, pure street-culture swagger in every drip.',
        rendering_and_quality:
          'Flat screenprint art only; no skateboard object, no brand or magazine names.',
        key_features:
          'flat spot-color screenprint; dripping slime; thick keylines; tall emblem composition; misregistration',
      }),
      avoid: [...BASE, 'skateboard object', 'magazine name'],
      briefs: [
        'Skateboard-deck-style screenprint graphic of a snarling panther skull wreathed in green slime and purple flames, thick black keylines, spot colors slightly misregistered, tall emblem layout. No skateboard, text or logo.',
        'Deck-style screenprint graphic of a winged eyeball bursting out of a cracked egg, hot pink and toxic green drips. No skateboard, text or logo.',
        'Deck-style screenprint graphic of a grinning octopus riding a wave of fire, halftone shading, bold yellow and black. No skateboard, text or logo.',
      ],
    },
    'SP02-098': {
      dna: diy({
        aesthetic:
          'Napkin scribble blueprint: a late-night idea sketched in ballpoint on a soft paper cocktail napkin, lines feathering into the tissue.',
        color_and_tone:
          'Off-white embossed napkin, blue or black ballpoint, coffee or wine ring stains.',
        lighting_and_shadow: 'Warm bar light from one side, faint shadows in the embossed pattern.',
        texture_and_material:
          'Ink bleeding and feathering into soft tissue, embossed napkin border, condensation wrinkles.',
        camera_and_composition:
          'Napkin seen from above on a bar surface, the sketch filling most of it.',
        atmosphere_and_mood: 'Urgent and inspired, genius scribbled before the idea escapes.',
        rendering_and_quality:
          'Real ballpoint on tissue; no readable notes, only lines, arrows and shapes.',
        key_features:
          'ballpoint feathering on tissue; embossed napkin border; ring stains; exploded-view arrows; bar light',
      }),
      avoid: BASE,
      briefs: [
        'Napkin scribble blueprint in blue ballpoint of a flying machine with bat wings and a pedal-powered propeller, ink feathering into the soft tissue, a wine ring overlapping one wing, warm bar light. No readable notes or logo.',
        'Napkin blueprint of a clockwork owl drawn as an exploded view with arrows, condensation wrinkling the corner. No readable notes or logo.',
        'Napkin blueprint of a treehouse fortress with rope bridges, embossed border and a coffee ring stain. No readable notes or logo.',
      ],
    },
    'SP02-099': {
      dna: diy({
        aesthetic:
          'Punk zine cut-and-paste: photocopied collage of cut-out images and shapes, taped and glued, then copied again until the blacks crush and the greys break into grit.',
        color_and_tone:
          'Black and white toner with one or two fluorescent spot colors added by hand.',
        lighting_and_shadow:
          'No lighting; photocopy contrast with blown whites and crushed blacks.',
        texture_and_material:
          'Toner speckle, torn and scissored edges, tape strips, staple marks and copy-of-a-copy degradation.',
        camera_and_composition: 'Chaotic page layout, collage elements overlapping at angles.',
        atmosphere_and_mood: 'Angry and handmade, anti-design energy on a borrowed copier.',
        rendering_and_quality: 'Real photocopied collage; cut-out letter shapes stay unreadable.',
        key_features:
          'photocopy toner grit; scissored collage; tape strips; fluorescent spot color; crushed blacks',
      }),
      avoid: BASE,
      briefs: [
        'Punk zine cut-and-paste page of a snarling wolf made from photocopied fragments, taped at angles, toner grit and crushed blacks, one fluorescent pink stripe added by hand. No readable words or logo.',
        'Punk zine collage of a crowned skull cut from an old engraving, surrounded by scissored stars and tape strips, copy-of-a-copy degradation. No readable words or logo.',
        'Punk zine collage of a moth with eyes on its wings built from torn magazine scraps and staples, fluorescent yellow accent. No readable words or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Notebook Margin Ballpoint Doodle',
      domain: 'ballpoint notebook doodle',
      tags: ['ballpoint', 'notebook', 'doodle'],
      dna: diy({
        aesthetic:
          'Notebook margin doodle: a blue ballpoint drawing grown obsessively in the margin of a lined school notebook, with dense hatching and pressed-in grooves.',
        color_and_tone: 'Blue ballpoint on white, pale blue rules and a red margin line.',
        lighting_and_shadow:
          'Flat page light; tone built only by stacked hatching and pen pressure.',
        texture_and_material:
          'Ink blobs, pressed grooves, shiny overworked patches, ruled lines behind the drawing.',
        camera_and_composition:
          'Page seen flat, the drawing crowding the margin and spilling over the rules.',
        atmosphere_and_mood: 'Absorbed and restless, a lesson ignored for a better idea.',
        rendering_and_quality:
          'Real ballpoint on lined paper; handwriting reduced to unreadable squiggles.',
        key_features:
          'blue ballpoint hatching; lined notebook paper; red margin line; ink blobs and grooves; spilling doodle',
      }),
      avoid: BASE,
      briefs: [
        'Notebook margin ballpoint doodle of a knight on a winged horse drawn in dense blue hatching along the red margin line of a lined page, ink blobs and pressed grooves, spilling across the rules. No readable handwriting or logo.',
        'Notebook margin ballpoint doodle of a tower of stacked cats wearing crowns climbing the margin of a lined page, dense blue hatching, overworked shiny ballpoint patches and pressed-in grooves. No readable handwriting or logo.',
        'Notebook margin doodle of a sea monster coiling around the page edge, hatching getting darker toward the spine. No readable handwriting or logo.',
      ],
    },
    {
      name: 'Sticky-Note Wall Mosaic',
      domain: 'sticky-note mosaic',
      tags: ['sticky-notes', 'mosaic', 'office-craft'],
      dna: diy({
        aesthetic:
          'Sticky-note wall mosaic: a large image built from dozens of square colored sticky notes on a wall, each note one pixel.',
        color_and_tone:
          'Limited sticky-note colors — yellow, pink, orange, lime, cyan — on a pale wall.',
        lighting_and_shadow: 'Office light with tiny curled edges casting small shadows.',
        texture_and_material:
          'Slightly curled paper corners, visible gaps between notes, one or two fallen notes.',
        camera_and_composition:
          'Wall seen straight on, the subject readable as a coarse square grid image.',
        atmosphere_and_mood: 'Playful and collaborative, office supplies turned into art.',
        rendering_and_quality:
          'Real paper notes with curl and shadow; blank notes with no writing.',
        key_features:
          'square sticky-note pixels; limited note colors; curled corners; grid gaps; straight-on wall view',
      }),
      avoid: BASE,
      briefs: [
        'Sticky-note wall mosaic of a green dragon breathing orange fire, built from dozens of square notes on a pale office wall, curled corners casting tiny shadows, one note fallen to the floor. No writing or logo.',
        'Sticky-note mosaic of a giant yellow sun with a smiling face over pink mountains, visible gaps between the notes. No writing or logo.',
        'Sticky-note wall mosaic of a cyan whale leaping from lime-green waves, each square note one coarse pixel on a pale office wall, curled corners and a few notes fluttering loose. No writing or logo.',
      ],
    },
    {
      name: 'Continuous-Line Toy Screen Drawing',
      domain: 'knob-drawn toy screen',
      tags: ['toy-screen', 'continuous-line', 'retro-toy'],
      dna: diy({
        aesthetic:
          'Continuous-line toy screen drawing: a picture drawn with two knobs on a silver-grey toy screen, one unbroken dark line of stair-stepped diagonals.',
        color_and_tone:
          'Silver-grey powder screen with thin dark grey lines, inside a red plastic frame edge.',
        lighting_and_shadow: 'Soft screen sheen, no shading except denser zig-zag fills.',
        texture_and_material:
          'Stair-stepped diagonals, curves made of tiny steps, faint remnants of shaken-away lines.',
        camera_and_composition:
          'Screen seen straight on, the drawing as one continuous connected line.',
        atmosphere_and_mood: 'Patient and nostalgic, a toy mastered with stubborn care.',
        rendering_and_quality: 'Real single-line knob drawing; no brand name on the frame.',
        key_features:
          'one continuous line; stair-stepped diagonals; silver-grey screen; red toy frame; zig-zag fills',
      }),
      avoid: BASE,
      briefs: [
        'Continuous-line toy screen drawing of a castle on a hill with a winding road, one unbroken dark line of stair-stepped diagonals on silver-grey powder, red plastic frame edge. No brand name or logo.',
        'Continuous-line toy screen drawing of a cat face with long whiskers, curves built from tiny steps. No brand name or logo.',
        'Toy screen sketch of a steam locomotive crossing a trestle bridge, its smoke drawn as zig-zag scribbles filling the sky, every curve built from tiny steps of one never-lifted line, a knob-turning hand at the corner. No brand name or logo.',
      ],
    },
    {
      name: 'Fogged Mirror Finger Drawing',
      domain: 'finger drawing in condensation',
      tags: ['condensation', 'finger-drawing', 'ephemeral'],
      dna: diy({
        aesthetic:
          'Fogged mirror finger drawing: a picture traced with a fingertip in the steam on a bathroom mirror or window, clear lines cut through white fog.',
        color_and_tone: 'Milky white fog, clear dark lines showing the reflection or view behind.',
        lighting_and_shadow:
          'Soft bathroom light behind the glass, with water droplets catching small highlights.',
        texture_and_material:
          'Rounded fingertip line width, drips running down from the lines, fog creeping back.',
        camera_and_composition:
          'Glass seen straight on, the drawing centered, vague shapes behind the fog.',
        atmosphere_and_mood: 'Fleeting and intimate, a picture that will vanish in a minute.',
        rendering_and_quality: 'Real condensation and drips; no readable words written in the fog.',
        key_features:
          'fingertip lines in fog; drips running down; milky white glass; clear view through the lines; ephemeral',
      }),
      avoid: BASE,
      briefs: [
        'Fogged mirror finger drawing of a whale breaching under a crescent moon, fingertip lines cut through the steam, drips running down from the tail, soft bathroom light. No written words or logo.',
        'Fogged window finger drawing of a smiling snail with a spiral shell, a dark rainy garden visible through the lines. No written words or logo.',
        'Fogged mirror finger drawing of a crowned frog, the fog already creeping back over its legs. No written words or logo.',
      ],
    },
    {
      name: 'Beach Sand Stick Drawing',
      domain: 'stick drawing in wet sand',
      tags: ['sand-drawing', 'beach', 'ephemeral'],
      dna: diy({
        aesthetic:
          'Beach sand stick drawing: a large picture scratched into smooth wet sand with a stick, grooves filling with water, waiting for the tide.',
        color_and_tone: 'Tan and grey wet sand, darker wet grooves, silver reflections of the sky.',
        lighting_and_shadow: 'Low sun raking across the grooves so every line has a shadowed edge.',
        texture_and_material:
          'Ridged sand displaced along each line, shell fragments, foam edge nearby.',
        camera_and_composition:
          'Seen from above or a high angle, the drawing large on the beach, a wave edge in one corner.',
        atmosphere_and_mood: 'Carefree and temporary, a drawing the sea will take back.',
        rendering_and_quality:
          'Real grooves in wet sand; not sand sculpture and not colored sand art.',
        key_features:
          'stick grooves in wet sand; raking low sun; water filling lines; wave edge nearby; high angle view',
      }),
      avoid: BASE,
      briefs: [
        'Beach sand stick drawing of a giant octopus scratched into smooth wet sand, grooves filling with water, low sun raking across the lines, a wave edge creeping in at one corner, seen from above. No text or logo.',
        'Beach sand stick drawing of a sailing ship with curling waves, shell fragments along the lines. No text or logo.',
        'Beach sand stick drawing of a dragon coiled in a spiral, the first line of foam already washing over its tail. No text or logo.',
      ],
    },
    {
      name: 'Carved Desk Graffiti',
      domain: 'carved wooden desk graffiti',
      tags: ['carving', 'desk-graffiti', 'wood'],
      dna: diy({
        aesthetic:
          'Carved desk graffiti: a picture gouged into an old varnished wooden school desk with a compass point, pen ink rubbed into the grooves.',
        color_and_tone:
          'Honey and brown varnished wood, pale raw wood in fresh grooves, blue ink in old ones.',
        lighting_and_shadow: 'Window light across the desk showing the depth of the cuts.',
        texture_and_material:
          'Splintered groove edges, wood grain, layers of older carvings and scratches underneath.',
        camera_and_composition: 'Desk top seen from above, the carving among older marks.',
        atmosphere_and_mood: 'Rebellious and nostalgic, years of boredom cut into wood.',
        rendering_and_quality: 'Real carved grooves with depth; no readable initials or words.',
        key_features:
          'gouged grooves in varnished wood; ink-filled cuts; older carvings underneath; splintered edges; window light',
      }),
      avoid: BASE,
      briefs: [
        'Carved desk graffiti of a skull wearing a pirate hat gouged into an old varnished school desk, fresh pale grooves and blue ink rubbed into older cuts, window light showing their depth. No initials, words or logo.',
        'Carved desk graffiti of a rocket circling a planet, splintered edges among layers of older scratches. No initials, words or logo.',
        'Carved desk graffiti of a lightning-struck tree gouged into an old varnished school desk, ink pooled in the deepest grooves, splintered edges and faint older carvings around it. No initials, words or logo.',
      ],
    },
    {
      name: 'Kraft Paper Bag Marker Sketch',
      domain: 'marker on kraft paper',
      tags: ['kraft-paper', 'marker', 'sketch'],
      dna: diy({
        aesthetic:
          'Kraft paper bag sketch: black marker and white paint pen drawn on a flattened brown paper bag, with its folds and gusset creases.',
        color_and_tone:
          'Brown kraft, black marker lines, white paint-pen highlights, one red accent.',
        lighting_and_shadow:
          'White paint pen used for light, black marker for shadow; flat page light.',
        texture_and_material:
          'Fibrous kraft, bag folds and a gusset crease, marker bleed into the fibers.',
        camera_and_composition: 'Bag flattened and seen straight on, drawing crossing the folds.',
        atmosphere_and_mood: 'Scrappy and charming, a proud drawing made during a lunch break.',
        rendering_and_quality: 'Real marker on kraft; no printed store logo on the bag.',
        key_features:
          'brown kraft ground; black marker and white highlights; bag folds; marker bleed; one red accent',
      }),
      avoid: BASE,
      briefs: [
        'Kraft paper bag sketch of an owl in a top hat drawn in black marker with white paint-pen highlights on a flattened brown bag, the fold lines crossing its wings, one red accent on the hat band. No printed logo or text.',
        'Kraft paper bag sketch of a stag beetle warrior holding a spear, marker bleeding into the fibers. No logo or text.',
        'Kraft paper bag sketch of a steaming bowl of noodles with a tiny dragon in it, white highlights on the steam. No logo or text.',
      ],
    },
    {
      name: 'Graph-Paper Pixel Doodle',
      domain: 'graph paper square filling',
      tags: ['graph-paper', 'pixel-doodle', 'pen'],
      dna: diy({
        aesthetic:
          'Graph-paper pixel doodle: a picture made by filling graph-paper squares one by one with colored pens, like hand-made pixel art.',
        color_and_tone:
          'Pale blue grid on white, felt-pen fills in a limited set of bright colors.',
        lighting_and_shadow: 'No rendered lighting; shading comes only from darker filled squares.',
        texture_and_material:
          'Streaky felt-pen fills, squares slightly over the lines, one mis-colored square.',
        camera_and_composition: 'Sheet seen flat, the subject centered in a coarse square grid.',
        atmosphere_and_mood: 'Methodical and cheerful, patience rewarded square by square.',
        rendering_and_quality: 'Real pen on graph paper; not digital pixel art.',
        key_features:
          'filled graph-paper squares; streaky felt pen; pale blue grid; limited colors; hand-made pixels',
      }),
      avoid: BASE,
      briefs: [
        'Graph-paper pixel doodle of a knight holding a flaming sword, each graph square filled by hand with streaky felt pen, pale blue grid showing through, one square colored by mistake. No text or logo.',
        'Graph-paper pixel doodle of a mushroom house with a smoking chimney and a tiny door, each square filled by hand with streaky felt pen in bright limited colors, pale grid showing through. No text or logo.',
        'Graph-paper pixel doodle of a jumping frog catching a fly with its long tongue, felt-pen fills slightly over the lines, a pale blue grid and one crossed-out square. No text or logo.',
      ],
    },
    {
      name: 'Dusty Car Window Drawing',
      domain: 'finger drawing in dust',
      tags: ['dust-drawing', 'car-window', 'street'],
      dna: diy({
        aesthetic:
          'Dusty car window drawing: a picture drawn with fingertips and palms in the thick grime on a car rear window, the clean glass showing darker through the lines.',
        color_and_tone: 'Beige-grey dust layer, dark clean-glass lines, a faint interior behind.',
        lighting_and_shadow:
          'Daylight on the dusty glass; the clean strokes look darker and glossier.',
        texture_and_material:
          'Soft grime edges, smudged palm tones, fingernail fine lines, drip streaks.',
        camera_and_composition: 'The window seen straight on, filling the frame; no whole car.',
        atmosphere_and_mood: 'Cheeky and surprising, art found on a neglected surface.',
        rendering_and_quality: 'Real finger drawing in grime; no written joke words.',
        key_features:
          'finger lines in grime; dark clean glass through strokes; smudged palm tones; drip streaks; straight-on window',
      }),
      avoid: [...BASE, 'whole car in frame'],
      briefs: [
        'Dusty car window drawing of a howling wolf under a full moon, drawn with fingertips in thick beige grime, the clean glass dark through the strokes, palm smudges for the clouds. No written words or logo.',
        'Dusty window drawing of a sea turtle swimming among bubbles, fingernail fine lines for the shell pattern. No written words or logo.',
        'Dusty window drawing of a mountain range with a rising sun, rain drip streaks cutting through the dust. No written words or logo.',
      ],
    },
    {
      name: 'Crayon Rubbing Frottage',
      domain: 'crayon rubbing over textures',
      tags: ['frottage', 'crayon-rubbing', 'texture'],
      dna: diy({
        aesthetic:
          'Crayon rubbing frottage: thin paper laid over leaves, coins, wood and grates and rubbed with the side of a crayon, the textures composed into a picture.',
        color_and_tone:
          'Waxy crayon colors on thin paper, strong where raised surfaces caught the crayon.',
        lighting_and_shadow: 'No lighting; tone comes from how hard the crayon was rubbed.',
        texture_and_material:
          'Leaf veins, wood grain, coin ridges and grate patterns picked up in waxy strokes with directional sheen.',
        camera_and_composition: 'Flat paper, the subject assembled from different rubbed textures.',
        atmosphere_and_mood: 'Curious and tactile, the world collected by touch.',
        rendering_and_quality:
          'Real wax rubbing with directional strokes; not a digital texture fill.',
        key_features:
          'rubbed textures composing the subject; waxy directional strokes; leaf and wood grain patterns; thin paper; crayon color',
      }),
      avoid: BASE,
      briefs: [
        'Crayon rubbing frottage of a fox whose body is rubbed from wood grain, its tail from a fern leaf and its eye from a coin, green and orange wax on thin paper. No text or logo.',
        'Crayon rubbing frottage of a castle built from rubbed brick, grate and bark textures, purple crayon. No text or logo.',
        'Crayon rubbing frottage of a fish made from rubbed leaf veins and a scaled metal grate, blue and silver wax. No text or logo.',
      ],
    },
    {
      name: 'Ballpoint Skin Doodle',
      domain: 'pen doodle on skin',
      tags: ['skin-doodle', 'ballpoint', 'body-art'],
      dna: diy({
        aesthetic:
          'Ballpoint skin doodle: a playful blue pen drawing on the back of an adult hand or forearm, the ink catching in skin creases.',
        subject_treatment:
          'Keep the prompt subject intact and draw it in pen on an adult hand or forearm, which appears only as the drawing surface.',
        color_and_tone: 'Blue or black ballpoint on warm skin tones.',
        lighting_and_shadow: 'Soft daylight on the skin; the ink sits flat on top.',
        texture_and_material:
          'Lines skipping over pores and creases, faded patches where the skin rubbed.',
        camera_and_composition:
          'Close view of the hand or forearm filling the frame, drawing centered.',
        atmosphere_and_mood: 'Playful and personal, a small drawing carried around all day.',
        rendering_and_quality: 'Real pen on skin, not a tattoo; no written words.',
        key_features:
          'pen lines on skin; ink skipping creases; faded rubbed patches; close hand view; not a tattoo',
      }),
      avoid: [...BASE, 'tattoo', 'real person likeness'],
      briefs: [
        'Ballpoint skin doodle of a tiny octopus wrapping its arms around the knuckles of an adult hand, blue ink skipping over the skin creases, soft daylight. No written words or logo.',
        'Ballpoint skin doodle of a compass rose and a sailing ship on an adult forearm, faded where a sleeve rubbed. No written words or logo.',
        'Ballpoint skin doodle of a spider hanging from a thread drawn on the back of an adult hand, black ink. No written words or logo.',
      ],
    },
    {
      name: 'Glowing Peg-Board Picture',
      domain: 'light-up peg board',
      tags: ['peg-board', 'light-toy', 'retro-toy'],
      dna: diy({
        aesthetic:
          'Glowing peg-board picture: translucent colored pegs pushed into a black backlit board, each peg a glowing dot of light.',
        color_and_tone: 'Glowing red, orange, yellow, green, blue and white dots on black.',
        lighting_and_shadow:
          'Backlight shining through each peg; dim glow halos on the black board.',
        texture_and_material:
          'Round faceted peg caps, visible hexagonal hole grid, a few empty holes.',
        camera_and_composition:
          'Board seen straight on, the subject built from dots on a staggered grid.',
        atmosphere_and_mood: 'Warm and nostalgic, a bedroom glowing in the dark.',
        rendering_and_quality:
          'Real glowing peg-toy look with its plastic board, and no brand name.',
        key_features:
          'glowing translucent pegs; black backlit board; staggered dot grid; glow halos; limited peg colors',
      }),
      avoid: BASE,
      briefs: [
        'Glowing peg-board picture of a red dragon curled around a yellow sun, each translucent peg a glowing dot on a black backlit board, soft glow halos. No brand name or text.',
        'Glowing peg-board picture of a blue jellyfish drifting with long green tentacles, each translucent peg a glowing dot of light on a black backlit board with soft halos. No brand name or text.',
        'Glowing peg-board picture of an orange campfire under white stars with two tiny travelers beside it, translucent pegs glowing on a black backlit board, a few empty holes. No brand name or text.',
      ],
    },
    {
      name: 'Gear-Ring Spiral Drawing',
      domain: 'toothed-ring spiral drawing toy',
      tags: ['spiral-drawing', 'geometric', 'retro-toy'],
      dna: diy({
        aesthetic:
          'Gear-ring spiral drawing: looping hypotrochoid patterns drawn with a pen through toothed plastic wheels, layered in several colors to form the subject.',
        color_and_tone: 'Fine gel-pen lines in two to four bright colors on white.',
        lighting_and_shadow: 'No lighting; density of overlapping loops creates tone.',
        texture_and_material:
          'Thin looping lines, slight wobble where the wheel slipped, pen skips.',
        camera_and_composition: 'Flat paper, rosette patterns arranged to shape the subject.',
        atmosphere_and_mood: 'Hypnotic and precise, patterns blooming from a spinning wheel.',
        rendering_and_quality:
          'Real pen-on-paper spirals with slight ink skips, and no brand name.',
        key_features:
          'looping hypotrochoid rosettes; gel-pen colors; overlapping loop density; slipped-wheel wobble; white paper',
      }),
      avoid: BASE,
      briefs: [
        'Gear-ring spiral drawing of a peacock whose tail is made of overlapping rosette patterns in teal, purple and gold gel pen, a slipped-wheel wobble in one loop. No brand name or text.',
        'Gear-ring spiral drawing of a flower bouquet where each bloom is a different looping rosette in pink, orange and violet gel pen, stems drawn as long thin hypotrochoid loops, one pen skip. No brand name or text.',
        'Gear-ring spiral drawing of an owl built from nested spirals, pen skips in the fine lines. No brand name or text.',
      ],
    },
    {
      name: 'Bedsheet Banner Paint',
      domain: 'house paint on bedsheet',
      tags: ['banner', 'house-paint', 'diy'],
      dna: diy({
        aesthetic:
          'Bedsheet banner paint: a big image painted with leftover house paint and a wide brush on an old bedsheet, hung by its corners.',
        color_and_tone: 'Flat bold house-paint colors, patterned or faded sheet showing through.',
        lighting_and_shadow:
          'Daylight through the thin fabric making the paint look darker and the sheet glow.',
        texture_and_material:
          'Wrinkles and sagging, paint soaking and bleeding into the weave, drips at the bottom.',
        camera_and_composition:
          'Sheet hanging flat-ish, filling the frame, pegs or ropes at the corners.',
        atmosphere_and_mood: 'Proud and homemade, a big announcement made with what was at hand.',
        rendering_and_quality: 'Real paint on fabric; images only, no painted slogans.',
        key_features:
          'house paint on bedsheet; bleeding into weave; wrinkles and drips; backlit thin fabric; hung by the corners',
      }),
      avoid: BASE,
      briefs: [
        'Bedsheet banner painted with leftover house paint showing a giant red heart-shaped balloon lifting a tiny house, paint bleeding into the faded floral sheet, drips at the bottom, daylight glowing through the fabric. No slogans or text.',
        'Bedsheet banner painting of a huge green frog with a crown, hung by ropes at the corners, wrinkles across the paint. No slogans or text.',
        'Bedsheet banner painting of a sun rising over waves in bold yellow and blue, wide brush strokes. No slogans or text.',
      ],
    },
  ],
};

export default spec;
