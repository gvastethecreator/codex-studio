import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Trading-card ornament and symbolic illustration: decorative framing and symbolic arrangement
// around a readable subject. Eight originals get card briefs; twelve new studies add arabesque
// scrolls, mandala rings, arched icon frames, heraldic mantling, celestial wheels, whiplash curves,
// baroque cartouches, doily lace, emblem-book allegory, sacred geometry, chintz and halo bursts.
const study = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  avoid: string[],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'ornament', 'portable-style-study'],
  dna: dna(fields),
  avoid: [...avoid, 'readable lettering', 'religious symbols by default', ...STYLE_AVOID],
  briefs,
});

const keep = 'Preserve the requested identity, proportions, pose and action at the center';

const spec: Spec = {
  pack: 'pack_22',
  category: '11. Ornament & Symbolic Illustration',
  updates: {
    'SP22-181': { briefs: [
      'A heron stands in a moonlit pond divided into luminous leaded color segments of cobalt, amber and green, each segment glowing like a window. No readable text or logo.',
      'A fox spirit curls around a lantern, its fur broken into glowing jewel-colored panes with dark lead lines between them. No readable text or logo.',
      "Above the mountains, the sunrise has shattered into radiant leaded segments of stained color, and a single bird is flying through a missing pane. No readable text or logo.",
    ] },
    'SP22-182': { briefs: [
      'A jazz-age aviator stands before a sunburst of stepped deco planes in gold, black and jade, her airplane wings echoing the geometry. No readable text or logo.',
      'A peacock perches on a stepped fountain built from sharp geometric deco planes and fan shapes. No readable text or logo.',
      "Speeding through a deco landscape of zigzag mountains, a glamorous streamlined train pours silver steam under radiating sun rays, its passengers waving from porthole windows arranged in perfect symmetry. No readable text or logo.",
    ] },
    'SP22-183': { briefs: [
      'A river goddess rises from the water as flowing ornamental lines of her hair become the currents curling around the whole card. No readable text or logo.',
      'A dancer spins as ribbon-like ornamental lines swirl from her skirt into vines, birds and clouds. No readable text or logo.',
      "While a cat sleeps deeply on a cushion, its dreams spill out of its ears as swirling ornamental lines that wrap around it and turn into a garden full of fish. No readable text or logo.",
    ] },
    'SP22-184': { briefs: [
      'A jeweled beetle queen rests on a leaf edged in fine silver filigree scrolls that curl out from her wing cases. No readable text or logo.',
      "Over a frozen lake framed in delicate gold filigree that looks almost like frost, a skater traces patterns on the ice that continue the filigree outward. No readable text or logo.",
      "Hovering at a flower, a hummingbird trails a single fine filigree thread from its tail that stitches the whole sky together behind it. No readable text or logo.",
    ] },
    'SP22-185': { briefs: [
      'A saint-like beekeeper holds a honeycomb against a flat painted ground, her halo and the honey picked out in flat gilt pigment. No readable text or logo.',
      "On a deep blue ground, a black horse gallops after the stars that are fleeing across the sky, its bridle and every star touched with flat gold paint. No readable text or logo.",
      "Under a tree whose fruit are flat gilt circles, a sleeping lion has a small monkey quietly stealing one golden fruit from beside his paw. No readable text or logo.",
    ] },
    'SP22-186': { briefs: [
      'A dragon coils around a porcelain vase, painted in cobalt ink washes like blue-and-white china with soft pooled edges. No readable text or logo.',
      "On a willow bridge painted in delicate blue ink wash, a lonely fisherman has hooked a small dragon-like carp that is pulling him off the edge into porcelain-white space. No readable text or logo.",
      "In cobalt wash on a pale porcelain ground, a pair of cranes dance around a crack that has run through the whole plate, one feather left pure white. No readable text or logo.",
    ] },
    'SP22-187': { briefs: [
      'A knight on a white horse is divided into glossy opaque enamel segments of red, blue and gold separated by fine metal lines. No readable text or logo.',
      'A koi fish leaps from a wave built from polished enamel cells in coral and turquoise. No readable text or logo.',
      "Perched on a jeweled branch, a crowned owl glows in segmented opaque enamel, every feather a separate shining cell of cobalt, gold and coral divided by raised metal walls. No readable text or logo.",
    ] },
    'SP22-188': { briefs: [
      'A leaping carp is painted in a single calligraphic gesture of ink wash, its tail flicking into splashes across the card. No readable text or logo.',
      "In a bamboo grove of single calligraphic strokes, a tiger made of just three brush marks hides so well that only its two eyes give it away. No readable text or logo.",
      "On a hill at dusk, a lone rider suggested by three gestural brush marks races a storm that is one enormous wet sweep of ink across the sky. No readable text or logo.",
    ] },
  },
  creates: [
    study('Arabesque Scroll Frame', 'interlaced arabesque ornament frame', 'arabesque-scroll', {
      aesthetic: 'Arabesque scroll frame: the subject set within interlacing arabesque scrolls and stylized foliage that flow endlessly around it in gold and deep jewel colors.',
      subject_treatment: `${keep}; surround the subject with interlacing scroll and leaf ornament that never overlaps its face.`,
      color_and_tone: 'Gold ornament on deep lapis, emerald or burgundy grounds with cream highlights.',
      lighting_and_shadow: 'Flat decorative light with gentle modeled shading on the central subject.',
      texture_and_material: 'Fine gold line, interlaced stems, stylized leaves and painted grounds.',
      camera_and_composition: 'Symmetrical framing with the subject centered in an ornamental niche.',
      atmosphere_and_mood: 'Keep the requested mood with rich, rhythmic, luxurious calm.',
      rendering_and_quality: "Precise balanced ornament with clean interlacing lines, kept consistent across the whole image.",
      key_features: 'interlacing scrolls; stylized foliage; gold on jewel grounds; central niche',
    }, ['cluttered random ornament'], [
      'A falcon perches on a gloved hand at the center of a lapis panel, gold arabesque scrolls winding endlessly around it into stylized vines. No readable text or logo.',
      'A sleeping gazelle lies in a garden niche while emerald and gold interlacing leaves curl out to every corner. No readable text or logo.',
      'A wandering astronomer holds a brass astrolabe framed by flowing arabesque scrollwork in burgundy and gold. No readable text or logo.',
    ]),
    study('Mandala Ring Ornament', 'concentric radial ornament rings', 'mandala-rings', {
      aesthetic: 'Mandala ring ornament: the subject placed at the center of concentric radial rings of repeated petals, dots and patterns expanding outward in perfect symmetry.',
      subject_treatment: `${keep}; place the subject in the central circle with radial pattern rings around it.`,
      color_and_tone: 'Harmonious saturated palettes such as turquoise, saffron, magenta and gold.',
      lighting_and_shadow: 'Flat even decorative lighting with no cast shadows.',
      texture_and_material: 'Fine repeated petals, dots, lines and concentric bands.',
      camera_and_composition: "Perfectly centered radial symmetry filling the square, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with meditative balanced harmony.',
      rendering_and_quality: "Precise symmetrical patterning with crisp repeated shapes, kept consistent across the whole image.",
      key_features: 'concentric rings; radial symmetry; repeated petals; central subject',
    }, ['asymmetric clutter', 'religious deity likeness'], [
      'A sleeping owl sits in the center circle while rings of turquoise feathers, saffron dots and magenta petals expand outward in perfect symmetry. No readable text or logo.',
      'A spinning dancer becomes the heart of a mandala, her skirt repeating outward into twelve rings of pattern. No readable text or logo.',
      "At the very center of radial rings of orbits, comets and tiny stars, a small planet with one lonely house on top floats like the eye of a cosmic mandala. No readable text or logo.",
    ]),
    study('Arched Icon Frame', 'arched devotional card frame', 'arched-frame', {
      aesthetic: 'Arched icon frame: the subject framed in a tall rounded or pointed arch with decorative columns, like a devotional icon or fortune card, gilded and solemn.',
      subject_treatment: `${keep}; stand the subject inside a tall decorated arch like an icon.`,
      color_and_tone: 'Deep reds, midnight blues and gold with ivory highlights.',
      lighting_and_shadow: 'Soft glowing light on the subject with gilded frame reflections.',
      texture_and_material: 'Painted columns, gilded arch edges, small ornaments and aged surface.',
      camera_and_composition: 'Tall vertical frame with the subject centered under the arch.',
      atmosphere_and_mood: 'Keep the requested mood with solemn iconic presence.',
      rendering_and_quality: "Clean painted frame and polished central figure, kept consistent across the whole image.",
      key_features: 'tall arch frame; decorative columns; gilded edges; iconic pose',
    }, ['religious deity likeness'], [
      'A plague rat king stands solemnly under a gilded pointed arch with twisted columns, holding a candle and a tiny cheese scepter. No readable text or logo.',
      'A lighthouse keeper holds up her lantern inside a tall rounded arch painted midnight blue and gold. No readable text or logo.',
      "Under a painted arch framed by climbing roses and gold stars, a fox magician in a velvet cape shuffles a deck of blank cards that burst into moths as they fly. No readable text or logo.",
    ]),
    study('Heraldic Mantling Swirl', 'heraldic mantling and supporters', 'heraldic-mantling', {
      aesthetic: 'Heraldic mantling swirl: the subject presented like a coat of arms, with swirling cloth mantling, helm, supporters and a shield-like central emblem without lettering.',
      subject_treatment: `${keep}; present the subject as the central charge of a heraldic arrangement.`,
      color_and_tone: 'Heraldic tinctures of red, blue, green and black with gold and silver.',
      lighting_and_shadow: 'Flat heraldic color with light modeling on the mantling folds.',
      texture_and_material: 'Flowing leafy mantling, crest, shield shape and ornamental supporters.',
      camera_and_composition: "Symmetrical armorial composition centered on the shield, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with proud ceremonial grandeur.',
      rendering_and_quality: "Crisp heraldic design with elegant swirling mantling, kept consistent across the whole image.",
      key_features: 'swirling mantling; shield emblem; heraldic tinctures; supporters',
    }, ['readable mottos', 'real coats of arms'], [
      'A proud frog wearing a tiny helm sits atop a shield flanked by two supporting herons, red and gold mantling swirling around them. No readable text or logo.',
      'A family of bakers is honored with a heraldic shield showing a crossed rolling pin and loaf, supported by two lions in aprons. No readable text or logo.',
      "On a blue field, a heraldic emblem shows a fish wearing armor, supported by two lobsters, while silver mantling curls around them like breaking waves. No readable text or logo.",
    ]),
    study('Celestial Wheel Ornament', 'astrological wheel design', 'celestial-wheel', {
      aesthetic: 'Celestial wheel ornament: the subject set at the hub of an ornate wheel of stars, moons, planets and constellation figures, like an old astronomical chart.',
      subject_treatment: `${keep}; place the subject at the hub of a decorated celestial wheel.`,
      color_and_tone: 'Deep night blue with gold, silver and soft cream star highlights.',
      lighting_and_shadow: 'Glowing starlight with gilded reflections on the ornament.',
      texture_and_material: 'Fine engraved rings, star points, moon phases and constellation figures.',
      camera_and_composition: "Circular centered composition filling the frame, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with cosmic mystery and wonder.',
      rendering_and_quality: "Precise decorative celestial rendering with delicate detail, kept consistent across the whole image.",
      key_features: 'celestial wheel; moon phases; constellation figures; gold on night blue',
    }, ['readable zodiac symbols'], [
      'A sleeping astronomer floats at the hub of a gold celestial wheel, moon phases and constellation animals circling around him. No readable text or logo.',
      "At the center of a star wheel, a black cat is batting the tiny planets out of their engraved silver orbits one by one. No readable text or logo.",
      "At the heart of a wheel of suns and moons, a sunflower is turning its head to follow all twelve suns at once and has become very dizzy. No readable text or logo.",
    ]),
    study('Whiplash Curve Ornament', 'art nouveau whiplash lines', 'whiplash-curve', {
      aesthetic: 'Whiplash curve ornament: flowing art-nouveau style whiplash curves of hair, stems and ribbons that snap and flow around the subject in elegant rhythm.',
      subject_treatment: `${keep}; let hair, stems and ribbons around the subject flow into whiplash curves.`,
      color_and_tone: 'Soft sage, dusty rose, ochre and cream with outlined gold accents.',
      lighting_and_shadow: "Flat decorative color with soft subtle modeling, kept consistent across the whole image.",
      texture_and_material: 'Flowing contour lines, stylized flowers, ribbons and mosaic halos.',
      camera_and_composition: 'Vertical elegant composition with curves framing the subject.',
      atmosphere_and_mood: 'Keep the requested mood with graceful poetic elegance.',
      rendering_and_quality: "Clean flowing lines with harmonious decorative balance, kept consistent across the whole image.",
      key_features: 'whiplash curves; flowing hair and stems; soft palette; decorative halo',
    }, ['stiff straight lines'], [
      'A dragonfly queen rests on a lily, her long hair snapping into whiplash curves that become stems, ribbons and a round halo. No readable text or logo.',
      "In a garden at dusk, a cellist plays so beautifully that the vines have grown up her instrument and into her hair, all flowing together in long whiplash curves. No readable text or logo.",
      "Turning its head, a peacock unfurls a tail of whiplash lines that sweep to the edge of the card and pull the whole sky along with them. No readable text or logo.",
    ]),
    study('Baroque Cartouche Frame', 'ornate baroque cartouche', 'baroque-cartouche', {
      aesthetic: 'Baroque cartouche frame: the subject shown inside an ornate curling baroque cartouche of scrolls, shells, acanthus leaves and sweeping flourishes in gilded relief.',
      subject_treatment: `${keep}; frame the subject inside a curling gilded cartouche.`,
      color_and_tone: 'Gilded gold frames with rich painted interiors in crimson and deep teal.',
      lighting_and_shadow: "Dramatic light catching the raised gilded curls, kept consistent across the whole image.",
      texture_and_material: 'Carved scrolls, shells, acanthus leaves and polished gilt surfaces.',
      camera_and_composition: 'Central oval or shield-shaped cartouche with curling edges.',
      atmosphere_and_mood: 'Keep the requested mood with opulent theatrical grandeur.',
      rendering_and_quality: "Richly detailed ornament with clean central painting, kept consistent across the whole image.",
      key_features: 'curling cartouche; gilded scrolls; acanthus leaves; central painting',
    }, ['minimalist flat'], [
      'A pompous parrot duke poses in a curling gilded cartouche of shells and acanthus leaves, his feathers as ornate as the frame. No readable text or logo.',
      "Inside a heavy baroque cartouche of scrolls, a stormy seascape shows a single ship, and one carved gold scroll of the frame has reached into the painting to steady the mast. No readable text or logo.",
      "Staring out of a crimson oval surrounded by carved gold curls and acanthus scrolls, a pale vampire countess holds a wilting rose and a single silver key to a locked crypt. No readable text or logo.",
    ]),
    study('Doily Lace Border', 'paper lace doily ornament', 'doily-lace', {
      aesthetic: 'Doily lace border: the subject set on or framed by delicate cut-paper lace doilies, with intricate pierced patterns, scalloped edges and soft shadows.',
      subject_treatment: `${keep}; place the subject on a lace doily ground or within a lacy scalloped border.`,
      color_and_tone: 'White or cream lace on pastel or deep colored grounds.',
      lighting_and_shadow: 'Soft light casting delicate lace shadows beneath the paper.',
      texture_and_material: 'Pierced paper lace, scalloped edges, embossing and soft paper fibers.',
      camera_and_composition: 'Centered subject within a circular or heart-shaped lace frame.',
      atmosphere_and_mood: 'Keep the requested mood with sweet, delicate, sentimental charm.',
      rendering_and_quality: 'Precise intricate lace detail with soft believable shadows.',
      key_features: 'paper lace doily; scalloped edges; pierced patterns; soft shadows',
    }, ['heavy dark frames'], [
      'A tiny mouse knight bows on a white lace doily as if on a stage, the pierced pattern casting delicate shadows around him. No readable text or logo.',
      "In a heart-shaped paper lace frame on pale pink, a strawberry cake has one slice missing, and a tiny guilty mouse is visible through the pierced lace. No readable text or logo.",
      "Framed by scalloped cream lace on deep blue paper, a pair of swans glides across a moonlit pond, their necks curving into a heart that ripples in the still water. No readable text or logo.",
    ]),
    study('Emblem-Book Allegory', 'symbolic emblem book image', 'emblem-allegory', {
      aesthetic: 'Emblem-book allegory: symbolic single images from old emblem books, where a hand from a cloud, a burning heart or an anchor tells a moral in one strange scene.',
      subject_treatment: `${keep}; combine the subject with one or two symbolic objects in a strange allegorical scene.`,
      color_and_tone: 'Engraved black line with optional pale hand tints on aged paper.',
      lighting_and_shadow: "Fine hatching shadows and bright open sky, kept consistent across the whole image.",
      texture_and_material: 'Engraved line, landscape backdrops, clouds and symbolic props.',
      camera_and_composition: 'Circular or rectangular vignette with a symbolic central scene.',
      atmosphere_and_mood: 'Keep the requested mood with puzzling moral mystery.',
      rendering_and_quality: "Clean engraved allegory with clear symbolic objects, kept consistent across the whole image.",
      key_features: 'symbolic objects; hand from cloud; moral scene; engraved vignette',
    }, ['readable mottos'], [
      'A hand reaching out of a cloud waters a single tulip growing from a skull on a quiet hillside, engraved like an old emblem book. No readable text or logo.',
      'A snail carries a tiny castle on its back while a clock floats in the sky above it. No readable text or logo.',
      'An anchor grows leaves and roots on a stormy beach as a ship sinks in the distance. No readable text or logo.',
    ]),
    study('Sacred Geometry Overlay', 'geometric construction lines overlay', 'sacred-geometry', {
      aesthetic: 'Sacred geometry overlay: the subject overlaid with fine golden geometric construction lines, circles, triangles and golden spirals that echo its proportions.',
      subject_treatment: `${keep}; overlay the subject with fine geometric circles and spirals aligned to its shape.`,
      color_and_tone: 'Dark rich grounds with fine gold or white geometric lines.',
      lighting_and_shadow: 'Soft modeled subject lighting beneath glowing line work.',
      texture_and_material: 'Thin precise lines, intersecting circles, golden spirals and nodes.',
      camera_and_composition: 'Centered composition with geometry radiating from the subject.',
      atmosphere_and_mood: 'Keep the requested mood with mystical mathematical order.',
      rendering_and_quality: "Precise clean geometry over a polished subject, kept consistent across the whole image.",
      key_features: 'golden construction lines; intersecting circles; golden spiral; dark ground',
    }, ['random lines'], [
      'A nautilus-shelled wizard meditates as fine golden circles and a golden spiral trace the exact proportions of his shell and staff. No readable text or logo.',
      "Mid-leap across a dark field, a wild horse is overlaid with intersecting golden triangles, circles and arcs that follow every limb, hoof and mane curl like a hidden map of its motion. No readable text or logo.",
      "Growing tall beside a stone wall, a single sunflower sits under a web of glowing geometric lines that trace the exact spirals of its seeds out into the evening sky. No readable text or logo.",
    ]),
    study('Chintz Floral Surround', 'dense chintz flower surround', 'chintz-floral', {
      aesthetic: 'Chintz floral surround: the subject nestled in dense glossy chintz flowers, peonies, roses and birds packed edge to edge like an old printed fabric.',
      subject_treatment: `${keep}; surround the subject with a dense packed field of printed-looking flowers.`,
      color_and_tone: 'Rich rose pinks, leaf greens and cream on dark or pale grounds.',
      lighting_and_shadow: 'Soft printed shading with glossy highlights on petals.',
      texture_and_material: 'Dense overlapping flowers, birds, leaves and glazed fabric sheen.',
      camera_and_composition: 'All-over floral pattern with the subject in a clear central space.',
      atmosphere_and_mood: 'Keep the requested mood with lush, cozy, romantic abundance.',
      rendering_and_quality: 'Densely detailed floral rendering with a readable central subject.',
      key_features: 'dense chintz flowers; packed pattern; glossy petals; central subject',
    }, ['sparse empty background'], [
      'A grumpy grandmother vampire sips tea in an armchair while a dense chintz of peonies, roses and tiny birds covers every surface around her. No readable text or logo.',
      "Napping in a nest of printed-looking roses that fill the card from edge to edge, a fox has blended in so well that only its black ear tips give it away. No readable text or logo.",
      "Curled up among glossy chintz peonies and fluttering songbirds, a porcelain teapot has grown a lizard tail and tiny clawed feet, steam puffing from its spout like sleepy breath. No readable text or logo.",
    ]),
    study('Radiant Halo Burst', 'radiating halo and rays', 'halo-burst', {
      aesthetic: 'Radiant halo burst: the subject backed by a huge radiating halo of straight and wavy rays, concentric rings and small stars, bold and celebratory.',
      subject_treatment: `${keep}; place a large radiating halo or sunburst behind the subject.`,
      color_and_tone: 'Gold, cream and warm reds radiating from the subject into deep backgrounds.',
      lighting_and_shadow: 'Backlit glow from the halo with rim light on the subject.',
      texture_and_material: 'Alternating straight and wavy rays, concentric rings and star points.',
      camera_and_composition: "Centered subject with rays reaching every edge, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with triumphant celebration, kept consistent across the whole image.",
      rendering_and_quality: 'Clean bold rays with a crisp polished subject.',
      key_features: 'radiating rays; concentric halo; star points; triumphant glow',
    }, ['religious deity likeness'], [
      'A humble pigeon stands proudly on a crust of bread in front of a huge golden sunburst halo of straight and wavy rays. No readable text or logo.',
      "Standing before radiating rings of light and tiny stars, a champion chef raises a golden ladle in triumph while a defeated soup pot weeps quietly at his feet. No readable text or logo.",
      "Posing triumphantly on a mossy rock, a garden gnome holds up a giant turnip in front of a blazing red and gold halo, as if he has just saved the whole garden. No readable text or logo.",
    ]),
  ],
};

export default spec;
