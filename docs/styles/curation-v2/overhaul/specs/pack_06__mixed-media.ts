import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'uniform beige torn-paper wash over every image',
  'red tape strips added by default',
  'material replacing clothing or skin',
  'readable printed words',
  'changing the requested camera view',
];

// Mixed media rebuild the picture in a physical medium; the material lives on the image surface.
// Three presets (scrapbook, moodboard, planning board) own a page or board layout.
const medium =
  'Keep the prompt subject, pose, action and camera view; rebuild the picture in this medium so the material sits on the image surface and never replaces clothing, skin or anatomy.';
const layout = (what: string) =>
  `Keep the prompt subject as the hero of the arrangement with its identity, clothing and anatomy unchanged; this preset owns ${what}.`;

// Presets built on a photographic base must not be told to avoid photographs.
const PHOTO_DROP = ['photo', 'realistic', 'photorealistic'];

function mm(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? medium, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_06',
  category: '5. Mixed Media',
  updates: {
    'SP06-061': {
      dna: mm({
        aesthetic:
          'Analog cut-paper collage: the subject assembled from scissor-cut pieces of different printed sources, each fragment keeping its own print texture, halftone and color.',
        color_and_tone:
          'Mismatched printed sources held together by one dominant hue family; halftone skin tones, flat construction-paper blocks and one saturated accent fragment.',
        lighting_and_shadow:
          'Each fragment keeps the light of its source photo; a thin, soft drop shadow under every lifted paper edge gives a millimetre of physical depth.',
        texture_and_material:
          'Crisp scissor edges with slight wobble, coated magazine stock beside matte paper, visible halftone rosettes, glue-stick sheen and one or two lifted corners.',
        camera_and_composition:
          'Keep the requested view; the silhouette is readable first, then the eye discovers that each area comes from a different printed source.',
        atmosphere_and_mood:
          'Witty and handmade, a familiar form made strange by its stitched-together sources.',
        rendering_and_quality:
          'Clean cut edges, consistent paper scale and legible fragment boundaries; never a digital blend or a soft transition between pieces.',
        key_features:
          'scissor-cut printed fragments; halftone rosettes; soft paper drop shadows; mixed coated and matte stock; one accent fragment',
      }),
      avoid: [...AVOID, 'torn edges', 'seamless blending', 'digital layer effects'],
      briefs: [
        'Analog cut-paper collage of a plague doctor stalking through a moonlit graveyard, his beak scissor-cut from a glossy chrome print, his coat from halftoned black fabric photos, soft paper drop shadows under every piece. No text or logo.',
        'Analog cut-paper collage of a grey heron standing in reeds at dawn, each feather group cut from a different printed wallpaper, the reeds from green construction paper, one orange accent fragment for the eye. No text or logo.',
        'Analog cut-paper collage of a giant snail carrying a tiny gothic cathedral on its shell, shell spiral cut from halftoned seashell prints, cathedral from cut engraving scraps, lifted paper corners. No text or logo.',
      ],
    },
    'SP06-062': {
      dna: mm({
        aesthetic:
          'Seamless photomontage: several photographs composited into one believable image with an impossible scale or logic, the joins hidden by matched light and grain.',
        color_and_tone:
          'One unified grade across all sources: shared white balance, matched black level and a single color cast so nothing betrays its origin.',
        lighting_and_shadow:
          'Light direction and hardness matched across every element; contact shadows and reflections are rebuilt so impossible objects sit firmly on their ground.',
        texture_and_material:
          'Consistent photographic grain and sharpness across sources; real surfaces such as porcelain, stone, skin and water kept fully photographic.',
        camera_and_composition:
          'Keep the requested view; scale is the surprise, with one element enlarged or shrunk and anchored to a believable horizon line.',
        atmosphere_and_mood:
          'Calm surreal wonder, the impossible presented as a plain everyday fact.',
        rendering_and_quality:
          'Invisible seams, no cut halos, perspective and depth of field agreeing across every source.',
        key_features:
          'impossible scale; matched light direction; unified color grade; rebuilt contact shadows; invisible seams',
      }),
      avoid: [...AVOID, 'visible cut edges', 'paper texture', 'painted look', 'mismatched shadows'],
      dropAvoid: PHOTO_DROP,
      briefs: [
        'Seamless photomontage of an armored knight fishing from the rim of a porcelain teacup the size of a lake, matched overcast light, rebuilt reflections on the tea, one unified cool grade. No text or logo.',
        'Seamless photomontage of a stone castle growing from the shell of a sleeping giant tortoise on a pebble beach, shared low sun, contact shadows under the feet, invisible seams. No text or logo.',
        'Seamless photomontage of a flock of sheep grazing on the face of an enormous brass pocket watch floating above wheat fields, matched grain and warm evening cast. No text or logo.',
      ],
    },
    'SP06-063': {
      dna: mm({
        aesthetic:
          'Decoupage: cut printed motifs glued onto a painted wooden surface and sealed under many coats of varnish until paper and paint read as one skin.',
        color_and_tone:
          'Painted ground in one deep color such as bottle green, oxblood or black, motifs in faded engraving tones, the whole warmed by amber varnish.',
        lighting_and_shadow:
          'Soft light with a broad glossy varnish highlight sliding across the surface; no cast shadows because every paper edge is sanded flush.',
        texture_and_material:
          'Fine crackle glaze, faint paper wrinkles and air bubbles under varnish, sanded motif edges and brush marks in the painted ground.',
        camera_and_composition:
          'Keep the requested view; motifs are arranged to build the subject and wrap slightly over the curve of the painted object surface.',
        atmosphere_and_mood: 'Antique and domestic, an heirloom surface patiently sealed by hand.',
        rendering_and_quality:
          'Unified varnished finish with legible motif cuts; nothing floats above the surface.',
        key_features:
          'cut printed motifs; painted wooden ground; amber varnish sheen; crackle glaze; sanded flush edges',
      }),
      avoid: [...AVOID, 'raised paper edges', 'fresh white paper', 'matte flat print'],
      briefs: [
        'Decoupage wolf howling at a crescent moon, its body built from cut engraving motifs of oak leaves and ferns on a bottle-green painted chest lid, amber varnish with a broad glossy highlight and fine crackle. No text or logo.',
        'Decoupage pair of swans with entwined necks on an oxblood painted wooden serving tray, cut floral engravings forming their feathers, sanded flush edges and air bubbles under the varnish. No text or logo.',
        'Decoupage stag beetle crawling among cut roses on the curved lid of a black painted hatbox, motifs wrapping over the curve, yellowed varnish and crackle glaze. No text or logo.',
      ],
    },
    'SP06-064': {
      dna: mm({
        aesthetic:
          'Found-object assemblage: the subject built in low relief from real salvaged objects glued and wired onto a wooden board or inside a shallow box.',
        color_and_tone:
          'The objects supply the palette: rust orange, weathered wood grey, tarnished brass and chipped enamel, unified by age rather than paint.',
        lighting_and_shadow:
          'Raking side light from one lamp so every object throws a real cast shadow and the relief reads clearly.',
        texture_and_material:
          'Rusted keys, clock gears, spoons, drawer pulls, driftwood, bottle caps and wire, each keeping its true material and scale.',
        camera_and_composition:
          'Keep the requested view; the subject silhouette is read from the arrangement, then each part is recognized as a found object.',
        atmosphere_and_mood:
          'Mysterious and collected, memories given a second life as a creature or place.',
        rendering_and_quality:
          'Physical depth, crisp object edges and believable glue joins; no painted or digital surface.',
        key_features:
          'salvaged objects in relief; raking side light; real cast shadows; rust and brass; board or shallow box',
      }),
      avoid: [...AVOID, 'flat print', 'painted illusion of objects', 'random clutter'],
      briefs: [
        "Found-object assemblage of a dragon's skull built from rusted keys, bent spoons and a broken clock face inside a shallow wooden box, raking lamp light throwing real shadows. No text or logo.",
        'Found-object assemblage of a great horned owl made from bottle caps, driftwood feathers and two brass drawer pulls for eyes, wired onto a weathered board, raking side light. No text or logo.',
        'Found-object assemblage of a tiny chapel built from blank matchboxes, thimbles and a cracked compass rose window, chipped enamel and tarnished brass in raking light. No text or logo.',
      ],
    },
    'SP06-065': {
      dna: mm({
        aesthetic:
          'Scrapbook page: photographs of the subject mounted on patterned paper mats with photo corners, washi tape, die-cut shapes and pressed keepsakes.',
        subject_treatment: layout(
          'the flat scrapbook page layout of mounted prints, mats, tape and keepsakes around the subject',
        ),
        color_and_tone:
          'Soft coordinated pastels and patterned papers built around one color from the subject photos; warm aged whites.',
        lighting_and_shadow:
          'Soft overhead flat-lay light; tiny shadows under photo corners, brads and raised die-cuts.',
        texture_and_material:
          'Deckle-edged mats, translucent washi tape, glossy prints, pressed flowers or feathers, metal brads and non-readable handwriting scribbles.',
        camera_and_composition:
          'Top-down flat lay of one page; two or three overlapping photos of the subject form the anchor, keepsakes cluster around the corners.',
        atmosphere_and_mood: 'Warm and personal, a remembered day kept with care.',
        rendering_and_quality:
          'Tidy layered page with clear overlaps, crisp tape translucency and no readable journaling.',
        key_features:
          'mounted photos with corners; washi tape; deckle mats; pressed keepsakes; flat-lay page',
      }),
      avoid: [...AVOID, 'readable journaling', 'sticker letters', 'digital scrapbook template'],
      briefs: [
        'Scrapbook page about a falconer, top-down flat lay with mounted photos of a hooded falcon on a leather glove, a real feather under translucent washi tape, pressed fern and deckle-edged moss-green mats. No readable writing or logo.',
        "Scrapbook page of a beekeeper's honey harvest, glossy prints of dripping comb, die-cut hexagons, pressed clover and brass brads on honey-yellow patterned paper. No readable writing or logo.",
        'Scrapbook page of a winter sledding day for adults, photos of a red wooden sled on a snowy slope, a knitted mitten scrap, snowflake die-cuts and blue gingham mats. No readable writing or logo.',
      ],
    },
    'SP06-066': {
      dna: mm({
        aesthetic:
          'Trash polka: realistic black-and-grey rendering violently interrupted by bold red brush swaths, smeared circles, bars and ink splatter.',
        color_and_tone:
          'Strictly black, grey scale and one blood-red on off-white; red is always flat and graphic, never shaded.',
        lighting_and_shadow:
          'Dramatic realist lighting inside the grey rendering; the red graphics ignore light entirely.',
        texture_and_material:
          'Soft graphite or ink-wash realism against dry-brush red strokes, splatter dots, drips and stamped abstract bars.',
        camera_and_composition:
          'Keep the requested view; one large red gesture cuts diagonally across the subject, with smaller circles and bars as counterweights.',
        atmosphere_and_mood:
          'Aggressive and chaotic, beauty and vandalism fighting on one surface.',
        rendering_and_quality:
          'Crisp contrast between photographic grey detail and raw red marks; no third color.',
        key_features:
          'black-grey realism; flat red brush swaths; splatter and drips; abstract bars; off-white ground',
      }),
      avoid: [...AVOID, 'additional colors', 'readable lettering', 'gore'],
      briefs: [
        "Trash polka of a raven perched on a dented crusader's helm, soft black-and-grey realism slashed by one diagonal red dry-brush swath, red splatter and a smeared red circle behind the bird. No text or logo.",
        'Trash polka of an anatomical heart wrapped in thorny rose stems, grey ink-wash realism, flat red abstract bars and drips cutting through it on off-white. No text or logo.',
        "Trash polka of a roaring lion's face in grey realism, half of it hidden behind a raw red brush sweep and stamped bars, ink splatter everywhere. No text or logo.",
      ],
    },
    'SP06-067': {
      dna: mm({
        aesthetic:
          'Mixed-media canvas: heavy-body acrylic over gesso with modeling paste, sand, embedded tissue and graphite marks building a thick, scraped surface.',
        color_and_tone:
          'Bold layered color with earlier layers showing through scrapes; one warm dominant against cool neutrals, occasional drips of pure pigment.',
        lighting_and_shadow:
          'Painted light kept simple; real raking light catches the ridges of paste and palette-knife edges.',
        texture_and_material:
          'Palette-knife scraping, gritty sand paste, wrinkled tissue paper glazed in, drips, spray mist and loose graphite lines.',
        camera_and_composition:
          'Keep the requested view; the subject emerges from an expressive field, crisp at its focal point and dissolving into texture at the edges.',
        atmosphere_and_mood: 'Expressive and raw, energy built up layer on layer.',
        rendering_and_quality:
          'Physical relief visible across the canvas; the subject readable despite heavy texture.',
        key_features:
          'modeling paste relief; palette-knife scrapes; embedded tissue; sand grit; drips and graphite',
      }),
      avoid: [...AVOID, 'smooth digital paint', 'readable newspaper'],
      briefs: [
        'Mixed-media canvas of a siege tower burning against a sky of orange sand paste, palette-knife scrapes revealing blue underlayers, drips of cadmium red and loose graphite lines. No text or logo.',
        'Mixed-media canvas of a black horse rearing in a thunderstorm, thick modeling-paste ridges catching raking light, wrinkled tissue glazed into the mane. No text or logo.',
        'Mixed-media canvas of split pomegranates in a clay bowl, heavy-body acrylic seeds in relief, sand-textured table and spray-misted background. No text or logo.',
      ],
    },
    'SP06-068': {
      dna: mm({
        aesthetic:
          'Photocopied zine page: marker drawing, ballpoint hatching and halftoned photo scraps pasted up, then copied twice so everything shares the toner.',
        color_and_tone:
          'Black toner on grey-white copy paper with one hand-added fluorescent highlighter color; midtones break into coarse halftone.',
        lighting_and_shadow:
          'No real light: copier contrast blows the whites and crushes shadows into solid black.',
        texture_and_material:
          'Toner speckle, grey copier streaks, visible paste-up edges, correction-fluid patches and slightly skewed copy.',
        camera_and_composition:
          'Keep the requested view; the drawn subject dominates, photo scraps and hatching fill the page edge to edge.',
        atmosphere_and_mood: 'Raw and underground, made in one night for a small crowd.',
        rendering_and_quality:
          'Second-generation copy loss that keeps the subject legible; one flat highlighter color only.',
        key_features:
          'photocopy toner; marker and ballpoint; halftoned photo scraps; correction fluid; one highlighter color',
      }),
      avoid: [...AVOID, 'readable slogans', 'full color print', 'clean digital lines'],
      dropAvoid: ['noise'],
      briefs: [
        'Photocopied zine page of a gargoyle crouching on a cathedral gutter, marker outlines, ballpoint hatching, a halftoned stone photo scrap pasted behind, copier streaks and one fluorescent pink highlighter stroke. No text or logo.',
        'Photocopied zine page of an adult skateboarder mid-ollie over a drained pool, crushed black shadows, correction-fluid patches and paste-up edges, fluorescent yellow highlighter. No text or logo.',
        'Photocopied zine page of a cramped basement show with adult musicians and a sweaty crowd, toner speckle, skewed copy and coarse halftone faces. No text or logo.',
      ],
    },
    'SP06-069': {
      dna: mm({
        aesthetic:
          'Moodboard color story: cropped images of the subject beside fabric swatches, paint chips and material samples, all tuned to one small palette.',
        subject_treatment: layout(
          'a gridded or overlapping moodboard of crops, swatches and material samples that share one palette',
        ),
        color_and_tone:
          'Four or five colors repeated across every tile; unlabeled paint chips state the palette explicitly.',
        lighting_and_shadow:
          'Even soft daylight with small, consistent shadows under physical swatches.',
        texture_and_material:
          'Linen, wool, brass, clay, stone or leather samples next to matte photo crops and blank paint chips.',
        camera_and_composition:
          'Top-down board of six to nine tiles; one large crop of the subject anchors the grid, details and swatches orbit it.',
        atmosphere_and_mood: 'Considered and calm, a mood distilled into color and touch.',
        rendering_and_quality:
          'Crisp tile edges, accurate material textures and a palette obvious at thumbnail size; no captions.',
        key_features:
          'six to nine tiles; paint chips; fabric swatches; material samples; one shared palette',
      }),
      avoid: [...AVOID, 'readable captions', 'color codes', 'random photo pile'],
      briefs: [
        "Moodboard color story for a desert nomad's tent: one large crop of an indigo tent at dusk, indigo and saffron wool swatches, a brass tray sample, dune crop and blank paint chips in five colors. No text or logo.",
        "Moodboard color story for a moorland witch's cottage: crop of a stone cottage in fog, moss and heather samples, a wrought-iron hinge, grey felt and plum paint chips. No text or logo.",
        'Moodboard color story for a lemon-grove summer supper: crop of a long table under citrus trees, lemon-yellow linen, terracotta shard, olive-wood sample and pale blue chips. No text or logo.',
      ],
    },
    'SP06-070': {
      dna: mm({
        aesthetic:
          'Pinned planning board: sketches, prints and index cards about the subject pinned to cork and linked by colored thread in a hopeful working plan.',
        subject_treatment: layout(
          'the cork planning-board layout of pinned cards, prints and linking thread',
        ),
        color_and_tone:
          'Warm cork brown, cream cards and white prints, with two or three thread and pushpin colors coding the plan.',
        lighting_and_shadow:
          'Soft window light from one side; pins and curled cards cast small crisp shadows on the cork.',
        texture_and_material:
          'Granular cork, curled index cards, glossy prints, pencil sketches, pushpins and taut cotton thread.',
        camera_and_composition:
          'Frontal board view; the largest pinned image of the subject at center, thread radiating to smaller steps around it.',
        atmosphere_and_mood: 'Hopeful and busy, a plan still taking shape.',
        rendering_and_quality:
          'Readable layering, taut thread lines and clear pinned depth; no legible notes.',
        key_features:
          'cork board; pushpins; index-card sketches; colored thread links; central hero print',
      }),
      avoid: [...AVOID, 'conspiracy board', 'red string chaos', 'legible notes'],
      briefs: [
        'Pinned planning board for a mountain expedition, a large print of a snowy summit at center, pencil-sketched ridge routes on index cards, rope samples and green thread tracing the climb across the cork. No text or logo.',
        'Pinned planning board for a stained-glass window commission, a watercolor sketch of a rose window at center, colored glass chips pinned beside it, blue thread linking cartoons of each panel. No text or logo.',
        'Pinned planning board for a walled kitchen garden, a hand-drawn bed plan at center, blank seed packets, soil photos and yellow thread marking the planting rows. No text or logo.',
      ],
    },
    'SP06-071': {
      dna: mm({
        aesthetic:
          'Torn-paper mosaic: the subject built from hundreds of fingernail-sized hand-torn paper bits sorted by color like mosaic tesserae.',
        color_and_tone:
          'Color mixed optically by neighboring scraps; each scrap one flat tone, warm and cool bits interleaved for gradients.',
        lighting_and_shadow:
          'Soft even light; value comes from scrap color, with slight lift shadows at overlapping torn edges.',
        texture_and_material:
          'White fibrous torn edges around every scrap, magazine gloss beside matte paper, faint glue sheen.',
        camera_and_composition:
          'Keep the requested view; scrap size shrinks at the focal point and grows in the background.',
        atmosphere_and_mood: 'Patient and playful, an image that resolves only from a distance.',
        rendering_and_quality:
          'Readable from afar, clearly torn scraps up close; no cut straight edges.',
        key_features:
          'hand-torn scraps; white fiber edges; optical color mixing; smaller scraps at the focus; glue sheen',
      }),
      avoid: [...AVOID, 'scissor-cut edges', 'readable typography', 'school craft look'],
      briefs: [
        'Torn-paper mosaic of a kingfisher diving into a river, hundreds of fingernail-sized torn scraps in turquoise and orange, white fiber edges, smaller scraps around the beak and eye. No text or logo.',
        'Torn-paper mosaic of a harvest moon over a field of pumpkins, warm orange and cool indigo scraps mixing optically, big scraps in the sky. No text or logo.',
        "Torn-paper mosaic close-up of an adult potter's clay-streaked hands shaping a bowl on the wheel, ochre and umber scraps, white torn edges catching light. No text or logo.",
      ],
    },
    'SP06-072': {
      dna: mm({
        aesthetic:
          'Tape art: the image built entirely from strips of colored masking, duct and vinyl tape laid on a flat surface and trimmed with a blade.',
        color_and_tone:
          'Flat solid tape colors in a limited set; value from layering light and dark rolls; no gradients.',
        lighting_and_shadow:
          'Soft frontal light with a faint sheen on vinyl and duct tape; tiny lift shadows at overlapping ends.',
        texture_and_material:
          'Crisp blade-cut curves, torn tape ends, crepe texture on masking tape, cloth weave in duct tape and slight wrinkles.',
        camera_and_composition:
          'Keep the requested view; straight strips build planes, trimmed curves describe the silhouette.',
        atmosphere_and_mood: 'Improvised and graphic, a temporary image made fast and bold.',
        rendering_and_quality:
          'Clean strip geometry and visible overlaps, consistent strip width; no painted fills.',
        key_features:
          'masking, duct and vinyl tape; blade-cut curves; torn ends; flat layered color; strip geometry',
      }),
      avoid: [...AVOID, 'painted fills', 'wall requirement', 'street context'],
      briefs: [
        'Tape art of a charging rhinoceros, planes of grey duct tape and ochre masking tape, blade-cut curves for the horn, torn ends at the dust cloud, faint sheen on the vinyl. No text or logo.',
        'Tape art of a spiral staircase seen from directly below, black and white vinyl strips winding inward, crepe masking tape for the stone treads. No text or logo.',
        'Tape art of a jellyfish drifting in dark water, translucent colored tape layered for the bell, thin trimmed strips for trailing tentacles. No text or logo.',
      ],
    },
    'SP06-073': {
      dna: mm({
        aesthetic:
          'Embroidery on photo: a printed photograph pierced and hand-stitched, thread adding color, pattern or light as a physical layer over the image.',
        subject_treatment:
          'Keep the photographed subject, clothing, anatomy and camera exactly as photographed; thread is stitched through the print around and over it as an added layer, never replacing garments or skin.',
        color_and_tone:
          'Natural photo color, often muted, against one or two saturated thread colors such as gold, vermilion or cobalt.',
        lighting_and_shadow:
          'Photo lighting stays; real light glints on the thread and each stitch casts a tiny shadow on the paper.',
        texture_and_material:
          'Satin-stitch fills, running-stitch lines, French knots, needle holes, slight paper puckering and a loose thread tail.',
        camera_and_composition:
          'Keep the photo framing; stitching follows or extends shapes already in the photo such as rays, contours and patterns.',
        atmosphere_and_mood: 'Personal and tactile, a memory touched by hand.',
        rendering_and_quality:
          'Sharp photographic base with dimensional thread; never flat printed lines pretending to be stitches.',
        key_features:
          'printed photo base; satin and running stitch; French knots; needle holes; thread casting shadow',
      }),
      avoid: [...AVOID, 'fabric replacing the photo', 'thread clothing', 'printed fake stitches'],
      dropAvoid: ['realistic', 'photorealistic'],
      briefs: [
        'Embroidery on photo of a stone bridge over a misty river, gold satin-stitch sun rays bursting from the mist, running-stitch fog lines, needle holes and slight puckering in the print. No text or logo.',
        "Embroidery on photo of an adult dancer mid-leap in a plain grey leotard, her motion trail stitched in arcs of vermilion thread beyond her body, the dancer's clothing and skin left photographic. No text or logo.",
        'Embroidery on photo of a cracked old teapot on a windowsill, its cracks repaired with gold thread and French knots at the joins, a loose thread tail. No text or logo.',
      ],
    },
    'SP06-074': {
      dna: mm({
        aesthetic:
          'Paint over photo: a photographic print partly covered by opaque acrylic swipes, drips and gestural strokes that hide, extend or redraw the image.',
        color_and_tone:
          'Muted photographic tones against bold, saturated paint; one paint color dominates, another answers.',
        lighting_and_shadow:
          'Photo light stays under the paint; the paint catches its own gloss and ridge highlights.',
        texture_and_material:
          'Loaded brush drag, palette-knife smears, drips running down the print, dry-brush edges over the photo grain.',
        camera_and_composition:
          'Keep the photo framing; paint covers roughly a third of the image and follows or breaks its main lines.',
        atmosphere_and_mood: 'Restless and abstracted, reality partly overruled by a gesture.',
        rendering_and_quality:
          'Clear boundary between photograph and physical paint; no digital brush imitation.',
        key_features:
          'photographic print base; opaque acrylic swipes; drips; palette-knife smears; one dominant paint color',
      }),
      avoid: [...AVOID, 'digital brush overlay', 'paint covering the whole print'],
      dropAvoid: ['realistic', 'photorealistic'],
      briefs: [
        'Paint over photo of an abandoned glass greenhouse, wild opaque green acrylic swipes spilling from the broken panes, drips running down the print, the photo grain showing at dry-brush edges. No text or logo.',
        'Paint over photo of an adult fencer in white lunging on a piste, the path of the blade extended as one thick red acrylic swipe across the print. No text or logo.',
        'Paint over photo of a quiet fishing harbor, a black gestural storm painted over the sky with palette-knife smears and ridges catching the light. No text or logo.',
      ],
    },
    'SP06-075': {
      dna: mm({
        aesthetic:
          'Digital collage: hard-masked photo cutouts, flat geometric shapes, duotone gradient maps and halftone overlays layered in software.',
        color_and_tone:
          'Two or three duotone pairs such as teal and coral or ink and lemon; flat color blocks in pure hues.',
        lighting_and_shadow:
          'Stylized light: cutouts carry uniform crisp drop shadows at one angle regardless of their source light.',
        texture_and_material:
          'Pixel-clean mask edges, halftone dot overlays, scanned paper grain as a subtle layer and flat vector shapes.',
        camera_and_composition:
          'Keep the requested view; elements overlap in clear layers with generous negative space and a strong central focus.',
        atmosphere_and_mood: 'Playful and editorial, clean surrealism with a design sensibility.',
        rendering_and_quality:
          'Crisp masks, consistent drop-shadow angle, clean flat color; no torn paper or glue.',
        key_features:
          'hard-masked cutouts; duotone gradient maps; halftone overlays; flat geometric shapes; uniform drop shadows',
      }),
      avoid: [...AVOID, 'torn paper', 'software UI', 'vaporwave props by default'],
      briefs: [
        'Digital collage of a giant koi swimming through a sky of cutout clouds above tiled rooftops, teal and coral duotone, halftone overlay on the scales, uniform crisp drop shadows. No text or logo.',
        "Digital collage of a crowned queen's profile assembled from duotone cutouts of peonies and folded silk, flat lemon circle behind her, hard mask edges and generous negative space. No text or logo.",
        'Digital collage of a rocket lifting off from a potted cactus, ink-and-lemon duotone cutouts, flat geometric smoke shapes and scanned paper grain. No text or logo.',
      ],
    },
    'SP06-076': {
      dna: mm({
        aesthetic:
          'Fumage: soot from a candle flame deposited on paper in plumes, the subject coaxed out of the smoke and refined by erasing and scratching.',
        color_and_tone:
          'Warm brown-black soot on white or cream paper, with only density variation; no added color.',
        lighting_and_shadow:
          'Light is the bare paper: erased and lifted areas become highlights inside velvety smoke darks.',
        texture_and_material:
          'Velvety carbon plumes, feathery smoke edges, eraser lifts, needle-scratched lines and occasional small scorch marks.',
        camera_and_composition:
          'Keep the requested view; the subject condenses out of drifting soot with its edges dissolving into open paper.',
        atmosphere_and_mood: 'Ethereal and dark, forms half-summoned from vapor.',
        rendering_and_quality:
          'Delicate soot gradients with crisp lifted highlights; no brush strokes or ink washes.',
        key_features:
          'candle soot plumes; eraser-lifted highlights; feathery edges; scorch marks; brown-black on cream',
      }),
      avoid: [...AVOID, 'visible flame requirement', 'ink wash', 'brush strokes'],
      briefs: [
        'Fumage of a hooded wraith rising from a crypt floor, velvety candle-soot plumes forming its robes, eraser-lifted highlights on its bony hands, tiny scorch marks on cream paper. No text or logo.',
        'Fumage of a humpback whale diving into the deep, soot density fading downward, feathery smoke edges for the tail spray and needle-scratched barnacle lines. No text or logo.',
        'Fumage of a winter birch forest, trunks lifted out of drifting brown-black soot with an eraser, branches scratched in with a needle. No text or logo.',
      ],
    },
    'SP06-077': {
      dna: mm({
        aesthetic:
          'Coffee painting: brewed coffee applied in dilutions from pale tea-brown washes to thick espresso reductions on cold-press paper.',
        color_and_tone:
          'Monochrome browns from light honey to near black; warmth varies with dilution, no other pigment.',
        lighting_and_shadow:
          'Light is left as bare paper; shadows are built in transparent layered washes.',
        texture_and_material:
          'Hard tide-line blooms where washes dry, fine coffee granules settling in the paper tooth, back-runs and soft wet-in-wet edges.',
        camera_and_composition:
          'Keep the requested view; loose washes at the edges, most layers at the focal point.',
        atmosphere_and_mood: 'Warm and organic, quiet and slightly nostalgic.',
        rendering_and_quality:
          'Visible dilution steps and tide lines; never a sepia filter over a photo.',
        key_features:
          'layered coffee washes; tide-line blooms; granules in paper tooth; espresso darks; cold-press paper',
      }),
      avoid: [...AVOID, 'mug ring requirement', 'kitchen mood', 'sepia photo filter'],
      briefs: [
        'Coffee painting of a camel caravan crossing dunes at dusk, pale tea-brown sky washes, espresso-dark camel silhouettes, tide-line blooms along the dune ridges. No text or logo.',
        'Coffee painting of an old adult innkeeper polishing pewter tankards behind a bar, layered transparent washes, granules settling in the cold-press tooth. No text or logo.',
        'Coffee painting of a tabby cat asleep on a sunlit windowsill, wet-in-wet soft fur edges, bare paper for the sunlight, back-runs in the curtain. No text or logo.',
      ],
    },
    'SP06-078': {
      dna: mm({
        aesthetic:
          'Water-gilded panel: loose gold leaf laid over red bole on gesso, burnished and tooled, with the subject painted in flat matte egg tempera or ink.',
        color_and_tone:
          'Burnished gold fields against matte black, deep red bole showing through cracks, limited earth and lapis accents.',
        lighting_and_shadow:
          'Gold flares bright or dark with viewing angle; painted areas are flat and shadowless.',
        texture_and_material:
          'Leaf seams and tiny gaps, punched and incised tooling patterns in halos and borders, crackle showing red bole, matte tempera strokes.',
        camera_and_composition:
          'Keep the requested view; gold fills the background or haloes the subject, painted forms flat against it.',
        atmosphere_and_mood: 'Rich and reverent, ornament as a sign of value.',
        rendering_and_quality:
          'Genuine metallic leaf behavior with tooling and seams; no yellow paint pretending to be gold.',
        key_features:
          'gold leaf on red bole; punched tooling; burnished glints; matte tempera figures; crackle',
      }),
      avoid: [...AVOID, 'yellow paint as gold', 'gold glitter', 'photographic shading'],
      briefs: [
        'Water-gilded panel of an armored guardian angel with a punched and tooled gold halo, matte tempera armor, burnished gold background with red bole showing through fine cracks. No text or logo.',
        'Water-gilded panel of a white hare sitting among wild strawberries, flat matte tempera on a burnished gold ground, leaf seams visible, incised tooled border. No text or logo.',
        'Water-gilded panel of a tiger stalking through bamboo, black ink stems on a gold leaf field, lapis sky accent, burnished glints. No text or logo.',
      ],
    },
    'SP06-079': {
      dna: mm({
        aesthetic:
          'Paper marbling: floated pigments on a size bath combed and dragged with a stylus into the subject shapes, then lifted onto paper in one print.',
        color_and_tone:
          'Three to five floated colors with crisp boundaries and no blending; veins of the first color run through everything.',
        lighting_and_shadow:
          'No modeled light; form comes only from the flow and density of marbled bands.',
        texture_and_material:
          'Combed feather patterns, stone-like veins, dropped color rings, stylus-drawn motifs and faint fringes where the paper lifted.',
        camera_and_composition:
          'Keep the requested view; the subject is drawn by dragging the stylus, its outline flowing into the surrounding marbled field.',
        atmosphere_and_mood: 'Fluid and hypnotic, a form caught mid-swirl.',
        rendering_and_quality:
          'Crisp pigment boundaries and flowing continuity; no brush marks or digital swirl filters.',
        key_features:
          'floated pigment on size; combed feather patterns; stylus-drawn motif; dropped color rings; crisp flowing boundaries',
      }),
      avoid: [...AVOID, 'digital swirl filter', 'brush marks', 'oil slick photo'],
      briefs: [
        'Paper marbling of a peacock whose tail is combed feather pattern in teal, gold and ink blue, its body stylus-drawn through dropped color rings. No text or logo.',
        'Paper marbling of a sea serpent coiling through waves, the serpent dragged into the size bath through indigo and white veins, crisp pigment boundaries. No text or logo.',
        'Paper marbling of an autumn oak in a gale, dropped rust and ochre rings for the leaves, stone-like veins for the trunk and wind combed across the field. No text or logo.',
      ],
    },
    'SP06-080': {
      dna: mm({
        aesthetic:
          'Multi-layer studio stencil: three or four hand-cut stencils sprayed in tonal steps onto board, rebuilding the subject from flat value shapes.',
        color_and_tone:
          'Three to four flat tones from light to dark in one hue family, plus one accent color; no gradients except overspray.',
        lighting_and_shadow:
          'Light reduced to posterized value shapes: highlight, midtone, shadow and a darkest key layer.',
        texture_and_material:
          'Crisp cut edges with soft overspray halos, bridges holding islands in the cut, slight registration offset between layers, matte aerosol on board.',
        camera_and_composition:
          'Keep the requested view; strong simplified silhouette, value shapes locked together like a puzzle.',
        atmosphere_and_mood: 'Bold and deliberate, crafted rather than rushed.',
        rendering_and_quality:
          'Clean posterized layers with visible bridges and overspray; no brick wall, protest message or slogan.',
        key_features:
          'three to four stencil layers; cut bridges; overspray halos; registration offset; posterized values',
      }),
      avoid: [
        ...AVOID,
        'readable slogan',
        'wall requirement',
        'protest scene',
        'single-ink silhouette',
      ],
      briefs: [
        'Multi-layer studio stencil of a hooded archer drawing a longbow, four posterized olive tones and one orange accent, cut bridges across the bowstring, soft overspray halos on primed board. No text or logo.',
        'Multi-layer studio stencil of a mountain goat balanced on a cliff ledge, three grey tones and a sky-blue accent, slight registration offset between layers. No text or logo.',
        'Multi-layer spray stencil of a hulking invented steam-powered motorcycle with a riveted boiler tank and spoked wheels, built from four flat cut layers (black, charcoal, mid grey, one red accent), visible bridges in the cutouts, soft overspray halos and slight layer misregistration on rough cardboard. Clearly a stencil print, not a photograph or a real motorcycle model. No text or logo.',
      ],
    },
  },
};

export default spec;
