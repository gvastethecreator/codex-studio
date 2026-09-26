import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Trading-card symbolic graphic illustration: reduced graphic images where a subject becomes a
// strong symbol without letters. Eight originals get card briefs; twelve new studies add monoline
// emblems, hidden negative-space figures, two-color symbols, grid pictograms, stencil symbols,
// tangram figures, overprint transparency, heavy blocks, horizon minimalism, ripple symbols,
// folded ribbon emblems and halftone dot silhouettes.
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
  tags: [tag, 'graphic-symbol', 'portable-style-study'],
  dna: dna(fields),
  avoid: [...avoid, 'readable lettering', 'real logo', ...STYLE_AVOID],
  briefs,
});

const keep = 'Preserve the requested subject, count, pose and action while reducing it to a clear graphic symbol';

const spec: Spec = {
  pack: 'pack_22',
  category: '14. Symbolic Graphic Illustration',
  updates: {
    'SP22-205': { briefs: [
      'A lighthouse sends its beam across a stormy sea in a compact flat-color print of three inks, the beam a single cream wedge cutting navy waves. No readable text or logo.',
      "Curled into a perfect circle in the snow, a fox dreams of a second fox curled inside its tail, the two reduced to a few flat orange and white shapes on deep blue. No readable text or logo.",
      "Crossing a bridge at sunset, a lone cyclist is followed by her own long shadow, which has decided to take a different road, all in compact flat red, gold and black. No readable text or logo.",
    ] },
    'SP22-206': { briefs: [
      'The black silhouette of a wolf howls at the moon, and the white negative space between its legs forms a small sleeping village. No readable text or logo.',
      'Two faces in profile kiss in white while the black space between them forms a tall candle flame. No readable text or logo.',
      "Framed by the black branches of a winter tree, a white owl hides entirely in the negative space between the limbs, its eyes the only two marks inside the empty shape. No readable text or logo.",
    ] },
    'SP22-207': { briefs: [
      "Walking through a park, a balloon seller realizes one balloon is slowly lifting the entire bench of pigeons behind him, everything held by one even outline weight in calm flat color. No readable text or logo.",
      "Sharing a sunny windowsill, a goldfish has trained the cat to sit, stay and bow, the two drawn nose to glass in clean evenly weighted flat lines. No readable text or logo.",
      "Gliding past a striped lighthouse, a small sailboat is steered by a sleeping dog while a gull reads the map, drawn in evenly weighted lines and soft flat pastel fills. No readable text or logo.",
    ] },
    'SP22-208': { briefs: [
      "Riding a wave taller than its own mast, a tall ship is about to be swallowed by a sea serpent built from the same ordered parallel lines as the water itself. No readable text or logo.",
      "Asleep on a rocky ledge, a great lion is being carefully groomed by three tiny mice, all built from disciplined parallel engraved lines that swell into shadow along his mane. No readable text or logo.",
      "Rising above a sea of clouds, a mountain peak with one tiny climber is drawn in ordered families of engraved lines curving around its slopes and ridges like contour grooves. No readable text or logo.",
    ] },
    'SP22-209': { briefs: [
      "Constructed from snapped-together circles, squares and triangles, a stag is losing pieces of its antlers to a flock of geometric birds carrying them away to build nests. No readable text or logo.",
      "Assembled from identical building-toy blocks, a city skyline is being reassembled by a giant toddler's hand reaching in from the top of the card. No readable text or logo.",
      "Swimming through a sea of navy squares, a whale made of stacked teal semicircles carries a modular submarine in its mouth like a lost toy. No readable text or logo.",
    ] },
    'SP22-210': { briefs: [
      'A peacock\'s tail is rendered as an interwoven textile surface, warp and weft threads forming every eye of its feathers. No readable text or logo.',
      "Across a tapestry of crossing threads, a mountain village is quietly coming undone, one loose thread pulling a whole house up into the sky as the villagers chase after it. No readable text or logo.",
      "Seen from above, a koi pond is rendered as one woven surface of blue and orange strands, the fish rising and sinking as the threads pass over and under each other. No readable text or logo.",
    ] },
    'SP22-211': { briefs: [
      "Mid-leap between trapezes, a circus acrobat is caught by a partner who is only a paper cutout shadow, both simulated as flat pasted shapes with tiny drop shadows. No readable text or logo.",
      "On a fence of cut red and yellow shapes, a rooster crows at a sun that has been pasted on slightly crooked and is sliding off the page. No readable text or logo.",
      "On a deep blue ground, three round owls perch on one bare branch while a fourth owl is still being cut out of paper by a giant pair of scissors at the edge. No readable text or logo.",
    ] },
    'SP22-212': { briefs: [
      "Charging into battle, a knight on horseback is reduced to four graphic shapes and a single red plume, while his opponent is only a looming black rectangle. No readable text or logo.",
      "Steaming on a table, a cup of coffee is reduced to three shapes and one curving line of steam that has twisted itself into a tiny ghost leaving the room. No readable text or logo.",
      "Reduced to almost nothing, a lighthouse on a dark sea becomes one white stripe, one red triangle and one yellow circle, and a single black fin cuts the water below. No readable text or logo.",
    ] },
  },
  creates: [
    study('Monoline Emblem Drawing', 'single-weight line emblem', 'monoline-emblem', {
      aesthetic: 'Monoline emblem drawing: the subject drawn as a compact emblem using one unbroken line weight throughout, rounded joins and balanced negative space inside a simple shape.',
      subject_treatment: `${keep}; draw it with one consistent line weight inside a compact emblem shape.`,
      color_and_tone: 'One line color on a flat contrasting background, such as cream on forest green.',
      lighting_and_shadow: 'No lighting; value comes only from line density and spacing.',
      texture_and_material: 'Uniform smooth line, rounded ends, clean joints and flat ground.',
      camera_and_composition: 'Centered emblem in a circle, shield or badge shape.',
      atmosphere_and_mood: 'Keep the requested mood with clean, calm, badge-like clarity.',
      rendering_and_quality: "Precise single-weight line with even spacing everywhere, kept consistent across the whole image.",
      key_features: 'single line weight; rounded joins; compact emblem; flat ground',
    }, [], [
      "Inside a round badge drawn in one continuous cream line on forest green, a mountain goat stands on a peak that is actually the horn of a much larger goat below. No readable text or logo.",
      "Inside a small monoline shield, a kraken wraps one tentacle around an anchor and another around a teacup, everything drawn in one unbroken single-weight line. No readable text or logo.",
      "Curled around a crescent moon, a sleeping cat becomes a single-weight line badge, its tail wrapping the moon tip and three small stars tucked into the negative space around it. No readable text or logo.",
    ]),
    study('Hidden Figure Negative Space', 'double-image negative space', 'hidden-negative', {
      aesthetic: 'Hidden figure negative space: a graphic image where the empty space between shapes reveals a second hidden subject, a clever double reading.',
      subject_treatment: `${keep}; design the shapes so the negative space hides a related second figure.`,
      color_and_tone: 'Two flat colors such as black and white or navy and cream.',
      lighting_and_shadow: "No lighting; pure flat figure-ground contrast, kept consistent across the whole image.",
      texture_and_material: 'Clean flat shapes with crisp edges and no texture.',
      camera_and_composition: 'Centered balanced design where both readings are visible.',
      atmosphere_and_mood: 'Keep the requested mood with a clever moment of discovery.',
      rendering_and_quality: "Precise figure-ground design that reads both ways, kept consistent across the whole image.",
      key_features: 'double reading; hidden negative-space figure; two flat colors; crisp edges',
    }, [], [
      'A tall black tree stands in a white field, and the white spaces between its branches secretly form the profile of an old woman smiling. No readable text or logo.',
      'A navy bear silhouette hides a salmon leaping upstream in the cream space of its belly. No readable text or logo.',
      "Two dancing hands reach toward each other across a black field, and the white gap between their fingers forms a dove in flight that only appears when you stop looking at the hands. No readable text or logo.",
    ]),
    study('Bold Two-Color Symbol', 'high-impact two-color graphic', 'two-color-symbol', {
      aesthetic: 'Bold two-color symbol: the subject reduced to a heroic graphic symbol in exactly two strong flat colors, like a protest print or a sporting pennant without letters.',
      subject_treatment: `${keep}; reduce it to a strong heroic silhouette in two flat colors.`,
      color_and_tone: 'Exactly two colors such as red and black or orange and navy.',
      lighting_and_shadow: "Shadows as solid second-color shapes, no gradients, kept consistent across the whole image.",
      texture_and_material: 'Flat ink with slight print texture and crisp stencil-like edges.',
      camera_and_composition: "Dynamic diagonal or centered heroic composition, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with bold rallying energy.',
      rendering_and_quality: 'Clean powerful graphic reduction with no extra colors.',
      key_features: 'exactly two colors; heroic silhouette; flat shapes; print texture',
    }, [], [
      'A fist holding a garden trowel rises from a sprouting field in bold red and black, like a rallying print for the world\'s gardeners. No readable text or logo.',
      "Charging across a diagonal composition, a rhino is reduced to bold orange and navy blocks, its horn a single sharp wedge breaking through the edge of the card. No readable text or logo.",
      "Raising a lantern into a howling storm, a lone lighthouse keeper stands on the rocks in only two flat colors, rain and waves carved from the same deep indigo shape. No readable text or logo.",
    ]),
    study('Grid-Built Pictograms', 'pictograms constructed on a grid', 'grid-pictograms', {
      aesthetic: 'Grid-built pictograms: subjects constructed as clean pictogram figures on a visible square grid, with consistent stroke widths and quarter-circle corners.',
      subject_treatment: `${keep}; build it from grid-aligned strokes and quarter circles like a pictogram.`,
      color_and_tone: 'One solid color on white or a pale ground with faint grid lines.',
      lighting_and_shadow: "No lighting; solid flat pictogram shapes, kept consistent across the whole image.",
      texture_and_material: 'Solid geometric strokes, rounded corners and faint construction grid.',
      camera_and_composition: 'Centered pictogram within a square with the grid visible.',
      atmosphere_and_mood: 'Keep the requested mood with orderly universal clarity.',
      rendering_and_quality: "Precise grid alignment and consistent stroke width, kept consistent across the whole image.",
      key_features: 'visible square grid; consistent strokes; quarter-circle corners; pictogram figure',
    }, ['readable labels'], [
      'A figure riding a dragon is built as a pictogram on a faint square grid, every stroke the same width and every corner a quarter circle. No readable text or logo.',
      "Juggling five frying pans at once, a busy chef becomes a clean grid-built pictogram in one solid color, every limb and pan built from the same rounded stroke on a square grid. No readable text or logo.",
      "Casting a spell over a tiny frog, a wizard is reduced to consistent grid strokes, a pointed hat triangle and a round spark, like a sign for an unusually magical public building. No readable text or logo.",
    ]),
    study('Stencil Symbol Graphic', 'spray stencil symbol', 'stencil-symbol', {
      aesthetic: 'Stencil symbol graphic: the subject cut as a stencil with bridges holding the islands together, sprayed in one color with soft overspray on a wall or paper.',
      subject_treatment: `${keep}; cut it as a stencil shape with bridges and spray it flat.`,
      color_and_tone: 'One sprayed color, often black or red, on concrete, brick or paper.',
      lighting_and_shadow: "Flat sprayed shapes with no modeled shading, kept consistent across the whole image.",
      texture_and_material: 'Stencil bridges, overspray halos, drips and rough wall texture.',
      camera_and_composition: 'Frontal centered stencil on a wall or sheet.',
      atmosphere_and_mood: 'Keep the requested mood with raw street urgency.',
      rendering_and_quality: "Crisp stencil edges with believable spray texture, kept consistent across the whole image.",
      key_features: 'stencil bridges; overspray halo; single sprayed color; wall texture',
    }, ['readable graffiti tags'], [
      'A rat wearing a crown and holding a paintbrush is sprayed on a brick wall as a black stencil, the bridges visible across its tail. No readable text or logo.',
      "Sprayed in red stencil across a crumbling concrete wall, a dove carrying a wrench flies toward a broken factory window, overspray fuzzing the edges of its wings. No readable text or logo.",
      "Across a rolled-down shop shutter at night, someone has sprayed a giant eye with a keyhole for a pupil that stares at passing cars, paint drips running from its lower lashes. No readable text or logo.",
    ]),
    study('Tangram-Piece Figures', 'figures from tangram shapes', 'tangram', {
      aesthetic: 'Tangram-piece figures: subjects assembled only from the seven classic tangram shapes, triangles, a square and a parallelogram, with small gaps between the pieces.',
      subject_treatment: `${keep}; assemble it from tangram triangles, a square and a parallelogram.`,
      color_and_tone: 'Each piece a different flat color or all one color on a plain ground.',
      lighting_and_shadow: 'No lighting; flat pieces with thin gaps between them.',
      texture_and_material: 'Clean geometric pieces, thin separation gaps and optional wood grain.',
      camera_and_composition: 'Centered figure with generous empty space around it.',
      atmosphere_and_mood: 'Keep the requested mood with playful puzzle cleverness.',
      rendering_and_quality: "Precise geometric assembly with recognizable silhouettes, kept consistent across the whole image.",
      key_features: 'seven tangram shapes; small gaps; flat colors; puzzle silhouette',
    }, ['curved shapes'], [
      "Running at full speed, a fox is assembled from the seven tangram pieces in different oranges, and one triangle has fallen off behind it as it runs. No readable text or logo.",
      "Built from seven wooden tangram pieces, a sailing ship is being attacked by a tangram sea monster whose only pieces are borrowed from the ship's own hull. No readable text or logo.",
      "Charging across an empty page, a knight made of triangles and a single square faces a tangram dragon, but they are both built from the same seven pieces. No readable text or logo.",
    ]),
    study('Transparent Overprint Shapes', 'overlapping transparent ink shapes', 'overprint-shapes', {
      aesthetic: 'Transparent overprint shapes: the subject built from overlapping translucent flat shapes whose overlaps create new colors, like layered printing inks.',
      subject_treatment: `${keep}; build it from overlapping translucent shapes whose overlaps describe its form.`,
      color_and_tone: 'Translucent cyan, magenta and yellow shapes mixing into new overlap colors.',
      lighting_and_shadow: 'Value comes from overlap density rather than light.',
      texture_and_material: 'Flat translucent shapes, crisp edges and slight print grain.',
      camera_and_composition: "Balanced composition of overlapping shapes on white, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with bright playful layering.',
      rendering_and_quality: "Clean overlaps with accurate multiplied colors, kept consistent across the whole image.",
      key_features: 'translucent overlapping shapes; overlap colors; flat print; white ground',
    }, ['opaque shapes'], [
      "In a flock of translucent birds, cyan, magenta and yellow wings overlap into purples and greens, and one black bird appears exactly where all three colors cross. No readable text or logo.",
      "Built from overlapping translucent buildings in three inks, a city at dusk hides a giant sleeping cat that only exists where all the buildings overlap. No readable text or logo.",
      "Spinning mid-pirouette, a dancer is made of three overlapping translucent circles and triangles in pink, teal and yellow, the overlaps forming her face, skirt and arms. No readable text or logo.",
    ]),
    study('Heavy Block Symbolism', 'massive block graphic shapes', 'heavy-block', {
      aesthetic: 'Heavy block symbolism: the subject rendered in massive solid geometric blocks, thick slabs and hard corners, monumental and brutally simple.',
      subject_treatment: `${keep}; reduce it to thick heavy blocks and slabs.`,
      color_and_tone: 'Concrete greys, black and one strong accent color.',
      lighting_and_shadow: "Hard flat shadow slabs giving monumental weight, kept consistent across the whole image.",
      texture_and_material: 'Solid flat blocks, subtle concrete grain and hard edges.',
      camera_and_composition: 'Low monumental angle with the symbol dominating the frame.',
      atmosphere_and_mood: "Keep the requested mood with monumental gravity, kept consistent across the whole image.",
      rendering_and_quality: "Clean massive shapes with a strong silhouette, kept consistent across the whole image.",
      key_features: 'massive blocks; hard corners; concrete palette; monumental weight',
    }, ['delicate thin lines'], [
      'A giant hand holding a tiny house is built from massive grey blocks towering over the frame, one window glowing orange. No readable text or logo.',
      "Charging across a flat grey plain, a bull made of thick concrete slabs kicks up square dust clouds, its horns two heavy beams jutting straight toward the viewer. No readable text or logo.",
      "Sitting on a massive slab pedestal under a single red moon, a monumental owl carved from heavy blocks watches over a tiny sleeping village far below. No readable text or logo.",
    ]),
    study('Horizon Line Minimalism', 'minimal horizon composition', 'horizon-minimal', {
      aesthetic: 'Horizon line minimalism: vast empty compositions with a single horizon line and a tiny subject, most of the frame flat sky or sea in one or two colors.',
      subject_treatment: `${keep}; make the subject tiny on a single horizon line with vast empty space.`,
      color_and_tone: 'Two or three calm flat colors, sky and ground clearly divided.',
      lighting_and_shadow: 'Minimal flat light with at most a tiny shadow.',
      texture_and_material: "Smooth flat color fields with subtle grain, kept consistent across the whole image.",
      camera_and_composition: 'Low or centered horizon with a tiny subject and huge negative space.',
      atmosphere_and_mood: 'Keep the requested mood with silent contemplative vastness.',
      rendering_and_quality: "Precise minimal composition with clean flat fields, kept consistent across the whole image.",
      key_features: 'single horizon line; tiny subject; vast empty space; flat colors',
    }, ['busy detail'], [
      'A tiny rider on a camel crosses a single orange horizon line under an immense flat lilac sky that fills nine tenths of the card. No readable text or logo.',
      "Floating exactly where a flat grey sea meets a flat pale sky, a small red boat carries one fisherman who has fallen asleep with his line trailing into nothing. No readable text or logo.",
      "On a thin horizon line under a vast flat navy night, a single house has left one light on, and a tiny figure is walking away from it toward the edge of the card. No readable text or logo.",
    ]),
    study('Concentric Ripple Symbol', 'concentric ring graphic symbol', 'ripple-symbol', {
      aesthetic: 'Concentric ripple symbol: the subject placed at the center of expanding concentric rings like ripples or sound waves, graphic and hypnotic.',
      subject_treatment: `${keep}; center it and let concentric rings ripple outward from it.`,
      color_and_tone: 'Alternating bands of two or three colors radiating outward.',
      lighting_and_shadow: 'No modeled light; rhythm of rings creates depth.',
      texture_and_material: 'Clean ring bands, crisp edges and flat color.',
      camera_and_composition: 'Perfectly centered subject with rings to the edges.',
      atmosphere_and_mood: "Keep the requested mood with hypnotic resonance, kept consistent across the whole image.",
      rendering_and_quality: 'Precise evenly spaced rings with a crisp central symbol.',
      key_features: 'concentric rings; centered subject; alternating bands; hypnotic rhythm',
    }, [], [
      "Sitting on a lily pad, a frog has just sneezed, and concentric green and cream ripple rings spread from it so strongly that they tip over a distant fishing boat. No readable text or logo.",
      "Belting a high note on a dark blue ground, an opera singer's open mouth sends concentric gold sound rings across the card, shaking three tiny birds off a wire. No readable text or logo.",
      "Dropping from a branch above, a falling apple sits at the exact center of expanding gold and red rings, as if the whole orchard were ripples on a pond. No readable text or logo.",
    ]),
    study('Folded Ribbon Emblem', 'folded ribbon banner symbol', 'folded-ribbon', {
      aesthetic: 'Folded ribbon emblem: the subject wrapped or framed by a single flat folded ribbon with crisp turns and shaded folds, like a classic emblem banner without text.',
      subject_treatment: `${keep}; wrap or frame it with a single flat folded ribbon.`,
      color_and_tone: 'Bold ribbon colors such as crimson or teal with darker fold shading.',
      lighting_and_shadow: 'Flat shading on ribbon folds with simple highlights.',
      texture_and_material: 'Flat ribbon, crisp folds, forked tails and clean edges.',
      camera_and_composition: 'Centered emblem with the ribbon sweeping across it.',
      atmosphere_and_mood: 'Keep the requested mood with celebratory emblem pride.',
      rendering_and_quality: "Clean graphic ribbon with convincing folds, kept consistent across the whole image.",
      key_features: 'single folded ribbon; forked tails; crisp folds; blank banner',
    }, ['readable banner text'], [
      "On a lonely peak, a heroic mountain goat stands with a blank crimson ribbon tied around its horns like a victory sash, forked tails whipping in a gale. No readable text or logo.",
      "Wrapped in a teal ribbon that folds three times around its fuzzy body, a bee hovers like a proud emblem, the ribbon ends fluttering into two neat swallowtail points. No readable text or logo.",
      "Tied by a folded golden ribbon, a crossed pair of oars rises above three wavy lines while a small octopus tries very hard to steal one of them. No readable text or logo.",
    ]),
    study('Halftone Dot Silhouette', 'silhouette made of halftone dots', 'dot-silhouette', {
      aesthetic: 'Halftone dot silhouette: a bold silhouette built from large halftone dots that grow and shrink across the shape, graphic and punchy like an enlarged print.',
      subject_treatment: `${keep}; build its silhouette from large halftone dots of varying size.`,
      color_and_tone: 'One dot color on a flat contrasting ground.',
      lighting_and_shadow: 'Value from dot size, big dots dark and small dots light.',
      texture_and_material: 'Large round dots on a regular grid with crisp edges.',
      camera_and_composition: "Bold centered silhouette filling the frame, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with punchy pop-graphic energy.',
      rendering_and_quality: "Precise dot grid with smooth size transitions, kept consistent across the whole image.",
      key_features: 'large halftone dots; varying dot size; bold silhouette; flat ground',
    }, [], [
      "Leaping from a navy sea, a dolphin built from large coral halftone dots is shedding dots behind it like spray, the specks forming a trail of smaller dolphins. No readable text or logo.",
      "Wearing a crooked party hat, a grinning skull is made entirely of big black halftone dots on bright yellow, the dots shrinking to nothing where its eye sockets catch the light. No readable text or logo.",
      "Galloping across the whole card, a running horse becomes a field of growing and shrinking teal dots on white, its mane dissolving into scattered specks behind it. No readable text or logo.",
    ]),
  ],
};

export default spec;
