import type { Dna, Spec } from '../tools/apply';

// Review rule: graphite, charcoal and pen must stay distinguishable even on the same simple object.
const draw =
  "Redraw the prompt's subject, pose, setting and framing with this drawing tool only; line quality, pressure response and paper behavior must identify the tool even on a simple object.";

function d(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? draw, ...rest } as Dna;
}

const AVOID = [
  'changing the requested subject',
  'mixing in a second drawing tool',
  'painted color fill',
];

// Guard for new presets, matching the inherited drawing negatives of the category.
const DRAW_BASE = [
  'photo',
  'photorealistic',
  '3d render',
  'painterly fill',
  'wrong drawing tool',
  'airbrushed smoothness',
  'generic AI gloss',
  ...AVOID,
];

const spec: Spec = {
  pack: 'pack_06',
  category: '2. Drawing & Sketching',
  updates: {
    'SP06-016': {
      dna: d({
        aesthetic:
          'Graphite pencil drawing: tone built with a range of hard and soft pencils in layered directional strokes, from crisp H-grade lines to dense 8B darks.',
        color_and_tone:
          'Pure greyscale from bare white paper to a dark silvery grey that never reaches true black; the darkest passages carry a metallic sheen.',
        lighting_and_shadow:
          'A clear single light: cast shadows laid with firm pressure, half-tones in lighter parallel strokes, highlights left as untouched paper.',
        texture_and_material:
          'Smooth drawing paper with fine tooth catching graphite in the mid-tones, faint smudge where the hand rested, erased highlights with soft edges.',
        camera_and_composition:
          'Keep the requested framing; the drawing may fade out unfinished toward the paper edges.',
        atmosphere_and_mood: 'Patient and observational, quiet attention to form.',
        rendering_and_quality:
          'Visible stroke direction following the form, crisp contours on the light side, graphite shine in the darks; no charcoal velvet black and no ink line.',
        key_features:
          'layered directional pencil strokes; silvery graphite sheen in darks; paper-white highlights; fine tooth in mid-tones; unfinished vignetted edges',
      }),
      avoid: [...AVOID, 'pure velvet black', 'ink outlines', 'color'],
      briefs: [
        "Graphite pencil drawing of a knight's dented great helm resting on a straw bale, layered directional strokes following the curved steel, silvery 8B sheen in the eye slit, paper-white highlights on the dents. No text or logo.",
        'Graphite pencil drawing of a single iron door key lying on a folded linen cloth, crisp H-grade contour on the lit side, soft graded shadow, the drawing fading out toward the paper edge. No text or logo.',
        'Graphite pencil drawing of an adult old seamstress threading a needle by a window, fine tooth catching graphite in the half-tones, erased highlight on the thread. No text or logo.',
      ],
    },
    'SP06-017': {
      dna: d({
        aesthetic:
          'Expressive charcoal drawing: willow vine charcoal swept in broad gestures, pushed into velvety blacks with compressed charcoal and wiped or erased back to light.',
        color_and_tone:
          'Deep matte velvet black with no sheen, smoky greys rubbed with the side of the hand, bright lights pulled out with a kneaded eraser.',
        lighting_and_shadow:
          'Big dramatic light and shadow masses; shadows fused into one dark shape, light carved out subtractively.',
        texture_and_material:
          'Rough laid paper with charcoal dust caught in the ridges, finger smudges, broken dragged strokes and fallen black powder.',
        camera_and_composition:
          'Keep the requested framing; gestural construction lines and corrections stay visible around the main forms.',
        atmosphere_and_mood: 'Raw and physical, energy caught in fast sweeping gestures.',
        rendering_and_quality:
          'Soft lost edges, smeared tones and eraser lifts next to a few hard compressed accents; no graphite shine, no clean line work.',
        key_features:
          'velvet matte blacks; smudged smoky greys; kneaded-eraser lifted lights; visible gesture lines; charcoal dust on laid paper',
      }),
      avoid: [...AVOID, 'graphite shine', 'clean outlines', 'fine even hatching'],
      dropAvoid: ['noise', 'blurry'],
      briefs: [
        'Expressive charcoal drawing of an adult gravedigger leaning on his spade in a rain-lashed churchyard at night, velvet compressed-charcoal blacks, rain lifted out in eraser streaks, smudged grey fog between the tombstones. No text or logo.',
        'Expressive charcoal drawing of a single crow skull on a stone slab, matte black eye socket, smoky rubbed shadow, bright bone edges pulled out with a kneaded eraser. No text or logo.',
        'Expressive charcoal drawing of a warhorse galloping through dust, sweeping willow-charcoal gestures, visible construction lines around the legs, black powder falling from the strokes. No text or logo.',
      ],
    },
    'SP06-018': {
      dna: d({
        aesthetic:
          'Dip pen and ink: a flexible steel nib swelling from hairline to heavy line under pressure, with all tone built from hatching, cross-hatching and stippling.',
        color_and_tone:
          'Pure black ink on white; greys exist only as the density of lines and dots, from open parallel hatching to near-solid cross-hatch.',
        lighting_and_shadow:
          'A clear light direction expressed through hatch density; highlights are bare paper, deep shadow is four-direction cross-hatching.',
        texture_and_material:
          'Smooth hot-press paper, swelling and tapering nib lines, tiny ink catches at stroke starts, occasional fine spatter.',
        camera_and_composition:
          'Keep the requested framing; hatching follows the surface of each form so the lines describe volume.',
        atmosphere_and_mood: 'Crisp, precise and old-fashioned, a book-plate clarity.',
        rendering_and_quality:
          'Every value made from line or dot, no grey wash, no smudge; line weight varies with pressure along each stroke.',
        key_features:
          'swelling flexible-nib line; hatching and cross-hatching for tone; stippled half-tones; bare-paper highlights; pure black on white',
      }),
      avoid: [...AVOID, 'grey wash', 'smudged tone', 'uniform technical line weight'],
      briefs: [
        'Dip pen and ink drawing of a walled monastery on a sea stack, the cliffs built from dense cross-hatching, the surf as bare paper, swelling nib lines on the roofs. No text or logo.',
        'Dip pen and ink drawing of a single snail shell on bare paper, its spiral described by curved hatching that follows the form, stippled half-tones, crisp swelling contour. No text or logo.',
        'Dip pen and ink drawing of a gargoyle crouched on a cathedral gutter above a medieval town, four-direction cross-hatching in its mouth, hairline rooftops far below. No text or logo.',
      ],
    },
    'SP06-019': {
      name: 'Ballpoint Scribble Shading',
      dna: d({
        aesthetic:
          'Ballpoint scribble drawing: tone built from tangled looping circular scribbles of a cheap ballpoint, layered denser and harder where it needs to go dark.',
        color_and_tone:
          'Blue or black ballpoint only; pale where the loops are open, a glossy near-solid ink mass where dozens of layers pile up.',
        lighting_and_shadow:
          'Light shown by leaving loops open and sparse; shadows as dense overlapping scribble knots with glossy ink buildup.',
        texture_and_material:
          'Paper indented by pen pressure, small ink blobs at loop turns, slightly glossy ink in the darkest areas, no erasures.',
        camera_and_composition:
          'Keep the requested framing; the scribble density shapes the forms and the edges trail off in loose loops.',
        atmosphere_and_mood: 'Restless and obsessive, nervous energy turned into form.',
        rendering_and_quality:
          'Continuous circular scribble marks everywhere, no straight hatching and no clean outlines; ink blobs and indents visible.',
        key_features:
          'tangled circular scribble tone; ballpoint ink blobs; glossy dense darks; pressure indentations; loose trailing edges',
      }),
      avoid: [
        ...AVOID,
        'straight parallel hatching',
        'clean vector outline',
        'lined notebook paper',
      ],
      briefs: [
        'Ballpoint scribble drawing of a chained dungeon troll slumped on a stool, its bulk built from dense tangled blue circular scribbles, glossy ink knots in the shadows, open loops on the lit shoulder. No text or logo.',
        'Ballpoint scribble drawing of a pair of worn leather boots with loose laces, circular scribble tone, ink blobs at the loop turns, paper indented by the pen. No text or logo.',
        'Ballpoint scribble drawing of an adult tattooed sailor asleep in a swaying hammock, black ballpoint loops thickening into glossy darks under the hammock, edges trailing off in loose scribbles. No text or logo.',
      ],
    },
    'SP06-020': {
      name: 'Burnished Colored Pencil',
      dna: d({
        aesthetic:
          'Burnished colored pencil: many light layers of wax-based pencil laid in small circular strokes, then pressed hard with a colorless blender until the paper tooth disappears.',
        color_and_tone:
          'Jewel-rich saturated color built from layered hues, such as crimson over violet or yellow under green, with deep complementary darks instead of black.',
        lighting_and_shadow:
          'Strong directional light with smooth, fully saturated shadow transitions and bright polished highlights.',
        texture_and_material:
          'Glossy waxy sheen where burnished, tiny white paper specks only in the unburnished lights, slight wax bloom in heavy darks.',
        camera_and_composition:
          'Keep the requested framing; subjects often sit against a clean white paper field.',
        atmosphere_and_mood: 'Rich, careful and jewel-like, colors almost glowing.',
        rendering_and_quality:
          'Smooth burnished surfaces with crisp edges; no pencil hatching visible in the finished areas, no watery washes.',
        key_features:
          'layered wax pencil in circular strokes; burnished glossy surface; complementary layered darks; paper tooth filled; clean white field',
      }),
      avoid: [...AVOID, 'loose sketchy hatching', 'watercolor washes', 'grey or black shading'],
      briefs: [
        'Burnished colored pencil drawing of a jeweled ceremonial dagger lying on crimson velvet, layered wax color polished to a glossy sheen, violet-crimson darks, bright burnished highlights on the blade. No text or logo.',
        'Burnished colored pencil drawing of a scarlet macaw on a bare branch against clean white paper, every feather layered in circular strokes and burnished smooth. No text or logo.',
        'Burnished colored pencil drawing of a split geode full of violet crystals, complementary yellow in the shadows, waxy sheen on the facets, tiny paper specks in the lights. No text or logo.',
      ],
    },
    'SP06-021': {
      dna: d({
        aesthetic:
          'Soft pastel drawing: pure pigment sticks dragged and layered on sanded or velour pastel paper, blended with fingers in places and left as broken strokes in others.',
        color_and_tone:
          'Luminous matte saturated color, strong complementary contrasts, a toned paper color showing between strokes.',
        lighting_and_shadow:
          'Glowing light made of layered warm strokes over cool underlayers; shadows kept colorful rather than grey.',
        texture_and_material:
          'Powdery pigment clinging to the grit of the paper, broken side-of-stick strokes, finger-blended soft passages, loose dust.',
        camera_and_composition:
          'Keep the requested framing; broad blended areas in the background, crisp broken strokes at the focal point.',
        atmosphere_and_mood: 'Soft, velvety and luminous, like light held in powder.',
        rendering_and_quality:
          'Dry powdery matte finish with visible stroke breaks on the paper grit; no wet washes and no glossy wax.',
        key_features:
          'powdery pigment on gritty toned paper; broken side-of-stick strokes; finger-blended passages; saturated complementary color; matte luminous glow',
      }),
      avoid: [...AVOID, 'wet wash', 'glossy waxy finish', 'hard ink outlines'],
      dropAvoid: ['noise', 'blurry'],
      briefs: [
        'Soft pastel drawing of an adult fortune teller in layered shawls inside a lamplit tent, warm orange strokes over cool violet underlayers, powdery pigment clinging to dark toned paper. No text or logo.',
        'Soft pastel drawing of a lavender field at dusk rolling toward a single dark tree, broken side-of-stick strokes of violet and gold, finger-blended sky. No text or logo.',
        'Soft pastel drawing of two brown hares boxing on their hind legs in a spring field, crisp broken strokes on the fur, soft blended green behind, toned paper showing between marks. No text or logo.',
      ],
    },
    'SP06-022': {
      dna: d({
        aesthetic:
          'Oil pastel drawing: chunky greasy sticks pressed on thick and unblended, layered color over color and scratched back through with a blade to reveal what lies under.',
        color_and_tone:
          'Bold saturated primaries and secondaries, strong color layering where one hue shows through another, no subtle gradients.',
        lighting_and_shadow:
          'Simple bold light and shadow shapes in contrasting colors; lights often laid thick over darker layers.',
        texture_and_material:
          'Sticky waxy buildup, smeared thumb marks, sgraffito scratches revealing underlayers, crumbs of pastel on the surface.',
        camera_and_composition:
          'Keep the requested framing; forms simplified into chunky shapes with thick outlines of color.',
        atmosphere_and_mood: 'Loud, joyful and tactile, a crude bold energy.',
        rendering_and_quality:
          'Thick unblended strokes, sgraffito line detail, waxy semi-gloss surface; no fine lines and no smooth gradients.',
        key_features:
          'thick greasy unblended strokes; sgraffito scratches through layers; waxy crumbs and smears; bold saturated color; chunky simplified shapes',
      }),
      avoid: [...AVOID, 'fine detail', 'smooth gradient', 'powdery dry pastel'],
      briefs: [
        'Oil pastel drawing of a dragon breathing fire over a thatched village, chunky greasy strokes of red and orange, its scales scratched through a black top layer with a blade, waxy crumbs on the surface. No text or logo.',
        'Oil pastel drawing of a jug stuffed with sunflowers on a blue table, thick unblended yellow over green, thumb-smeared shadows, petals outlined in heavy color. No text or logo.',
        'Oil pastel drawing of an adult fisherwoman hauling a net of silver fish onto a rocky shore, bold simplified shapes, sgraffito lines in the net, waxy semi-gloss sheen. No text or logo.',
      ],
    },
    'SP06-023': {
      dna: d({
        aesthetic:
          'Silverpoint drawing: a silver stylus drawn over a white bone-ash prepared ground, leaving extremely fine uniform grey lines that cannot be erased.',
        color_and_tone:
          'Pale cool silver-grey lines on warm cream ground, very narrow value range, older marks tarnishing to a soft brown.',
        lighting_and_shadow:
          'Gentle modeling with fine parallel hatching only; the deepest shadow is still only a mid-grey.',
        texture_and_material:
          'Smooth chalky prepared ground, hair-fine lines of identical width, no smudge, faint tarnish warmth in dense hatching.',
        camera_and_composition:
          'Keep the requested framing; often a study sheet with the subject isolated on the bare ground.',
        atmosphere_and_mood: 'Delicate, precise and hushed, a drawing that whispers.',
        rendering_and_quality:
          'Thin unvarying line width, parallel diagonal hatching, no corrections or erasures, no dark accents.',
        key_features:
          'hair-fine uniform metal lines; cream bone-ash ground; parallel diagonal hatching; pale narrow value range; warm tarnish in dense areas',
      }),
      avoid: [...AVOID, 'dark black accents', 'smudged tone', 'thick lines'],
      briefs: [
        'Silverpoint drawing of an adult squire in three-quarter profile with cropped hair, modeled only in hair-fine parallel diagonal hatching, pale grey on cream bone-ash ground, warm tarnish in the densest shadow. No text or logo.',
        'Silverpoint drawing of a greyhound curled asleep, its ribs described in fine uniform lines, the dog isolated on bare cream ground. No text or logo.',
        'Silverpoint study sheet of an adult pair of hands clasping a small closed book, repeated in two angles, hushed narrow value range. No text or logo.',
      ],
    },
    'SP06-024': {
      dna: d({
        aesthetic:
          'Conté crayon drawing: square sticks of hard pressed chalk in sanguine red, bistre brown, black and white used on a mid-toned buff paper.',
        color_and_tone:
          'Earth range of red, brown and black for shadows, white for highlights, and the buff paper serving as the mid-tone.',
        lighting_and_shadow:
          'Strong sculptural light: dark crayon only in shadows, white only on the brightest planes, paper tone left between.',
        texture_and_material:
          'Firm square-edge strokes, crisp corners of the stick for lines and the flat side for tone, paper grain visible through light passes.',
        camera_and_composition:
          'Keep the requested framing; broad sculptural planes with confident contour lines.',
        atmosphere_and_mood: 'Warm, classical and sculptural, like an old study sheet.',
        rendering_and_quality:
          'Controlled hard chalk hatching with crisp edges, three values plus paper tone; less smudging than charcoal.',
        key_features:
          'sanguine, bistre and black crayon; white chalk highlights; buff paper as mid-tone; square-stick hatching; sculptural planes',
      }),
      avoid: [...AVOID, 'full color', 'white paper background', 'heavy smudging'],
      briefs: [
        'Conté crayon drawing of an adult blacksmith woman lifting a hammer over the anvil, sanguine and black square-stick hatching for the muscles, white chalk sparks, buff paper as the mid-tone. No text or logo.',
        'Conté crayon drawing of a ruined fortress gateway overgrown with ivy, bistre brown for the stone shadows, crisp stick-corner contours, paper grain in the sky. No text or logo.',
        'Conté crayon study of an adult model in a hooded robe seated on a block, broad sculptural drapery planes, white highlights only on the peaks of the folds. No text or logo.',
      ],
    },
    'SP06-025': {
      dna: d({
        aesthetic:
          'Technical pen drafting: fixed-width tubular nibs in a strict line-weight hierarchy, with ruled straight lines, template ellipses and measured parallel hatching.',
        color_and_tone:
          'Black ink on white or pale vellum; tone only as evenly spaced mechanical hatching or dot screens.',
        lighting_and_shadow:
          'Minimal shading: section cuts and cast shadows filled with uniform parallel hatching at a fixed angle.',
        texture_and_material:
          'Smooth drafting film or vellum, perfectly even line width per nib, crisp corners, no pressure variation.',
        camera_and_composition:
          'Keep the requested subject but present it as orthographic, isometric, cutaway or exploded view with clean construction.',
        atmosphere_and_mood:
          'Rational, calm and exacting, the pleasure of understanding how things work.',
        rendering_and_quality:
          'Three line weights at most, heavy outline, medium edges, fine hatching; no freehand wobble, no labels or dimensions.',
        key_features:
          'fixed-width line hierarchy; ruled and templated geometry; uniform angled hatching; cutaway or exploded views; smooth vellum',
      }),
      avoid: [
        ...AVOID,
        'pressure-varied line',
        'freehand sketchiness',
        'dimension labels or callout text',
      ],
      briefs: [
        'Technical pen cutaway drawing of a siege trebuchet, the counterweight box sectioned open, three fixed line weights, uniform 45-degree hatching on the cut timber, no labels. No text or logo.',
        'Technical pen exploded-view drawing of a pocket watch movement, gears and springs floating apart along ruled axes, template ellipses, crisp even lines on vellum. No text, dimensions or logo.',
        'Technical pen section drawing through a stone watermill, the wheel and gear train visible inside, mechanical hatching in the walls, heavy outer contour. No text or logo.',
      ],
    },
    'SP06-026': {
      name: 'Alcohol Marker Rendering',
      dna: d({
        aesthetic:
          'Alcohol marker rendering: broad chisel-tip markers laid in fast parallel streaks and blended while wet, finished with a fineliner outline and white gel highlights.',
        color_and_tone:
          'Clean transparent layered color, cool greys for shadows under hue layers, bright saturated accents, crisp white paper highlights.',
        lighting_and_shadow:
          'Studio product lighting: two or three layered value steps per form, reflected light on edges, white gel pen specular dots.',
        texture_and_material:
          'Visible parallel streak direction, darker overlaps where strokes crossed, slight bleed at edges on smooth marker paper.',
        camera_and_composition:
          'Keep the requested framing; the rendered object may sit on a loose marker background swatch with the paper white around it.',
        atmosphere_and_mood: 'Quick, confident and professional, a design studio sketch.',
        rendering_and_quality:
          'Streaky but controlled marker passes, thin ink outlines, gel pen highlights; no paint texture and no pencil smudging.',
        key_features:
          'chisel-tip parallel streaks; cool grey marker shadows; fineliner outline; white gel highlights; marker background swatch',
      }),
      avoid: [...AVOID, 'painterly brush texture', 'pencil smudging', 'brand logos'],
      briefs: [
        'Alcohol marker rendering of a spiked armored war wagon in three-quarter view, parallel chisel-tip streaks on the iron plates, cool grey shadows, white gel sparkles on the spikes, a loose orange swatch behind. No text or logo.',
        'Alcohol marker rendering of a steel battle-axe crossed over a round wooden shield, layered transparent color, fineliner outline, crisp white paper highlights. No text or logo.',
        'Alcohol marker fashion rendering of an adult model striding in an oversized crimson coat, fast parallel streaks in the fabric folds, cool grey skin shadows, gel pen highlights. No text or logo.',
      ],
    },
    'SP06-027': {
      dna: d({
        aesthetic:
          'Chalk dust drawing on a dark slate board: soft white and pale colored chalk rubbed into tone with the fingertips, with ghostly half-erased earlier marks behind.',
        color_and_tone:
          'Dusty white and a few pale chalk colors on near-black green or charcoal slate; values built by chalk pressure and rubbing.',
        lighting_and_shadow:
          'Reversed value logic: light is what you draw, the dark board is the shadow; soft glow from rubbed chalk halos.',
        texture_and_material:
          'Gritty chalk strokes broken by the board surface, finger-rubbed dust clouds, ghost smears of wiped drawings, powder along the bottom edge.',
        camera_and_composition:
          'Keep the requested framing; the drawing floats on the dark board with empty dark space around it.',
        atmosphere_and_mood: 'Temporary and dreamy, a drawing that could be wiped away.',
        rendering_and_quality:
          'Soft dusty edges, broken strokes and rubbed glow; no readable writing, no clean vector lines.',
        key_features:
          'white chalk on dark slate; finger-rubbed dust tone; ghost erasure smears; broken gritty strokes; light as the drawn element',
      }),
      avoid: [...AVOID, 'readable writing', 'white background', 'crisp vector lines'],
      dropAvoid: ['noise', 'blurry'],
      briefs: [
        'Chalk dust drawing of a sea serpent coiling around a three-masted ship on dark slate, finger-rubbed white fog on the waves, ghost smears of an earlier wiped drawing behind. No text or logo.',
        'Chalk dust drawing of a comet blazing over a mountain pass, its tail a rubbed glow of pale blue chalk, broken gritty strokes on the peaks. No text or logo.',
        'Chalk dust drawing of an adult astronomer at a brass telescope on a tower balcony, the figure in pressured white strokes, the night sky left as the dark board. No text or logo.',
      ],
    },
    'SP06-028': {
      name: 'Clayboard Scratch Drawing',
      dna: d({
        aesthetic:
          'Scratchboard drawing: a black ink layer over white clay scratched away with a knife and wire brush, so every mark is a white line pulled out of darkness.',
        color_and_tone:
          'Pure black and white; greys only as density of fine white scratched lines, optional thin color glaze over scratched whites.',
        lighting_and_shadow:
          'Subtractive light: forms emerge where scratches gather thickest, deep shadow stays solid unscratched black.',
        texture_and_material:
          'Razor-thin crisp white lines, stippled scratch dots, wire-brush fur texture, a matte clay surface.',
        camera_and_composition:
          'Keep the requested framing; a strong single light source makes subjects emerge from black.',
        atmosphere_and_mood: 'Dramatic, nocturnal and precise, carved out of the dark.',
        rendering_and_quality:
          'Consistently crisp white scratched lines following the form; no grey wash, no black drawn lines on white.',
        key_features:
          'white lines scratched from black; wire-brush fur texture; stippled scratch dots; solid black shadows; form-following line direction',
      }),
      avoid: [...AVOID, 'black ink lines on white', 'grey wash', 'soft blending'],
      briefs: [
        'Scratchboard drawing of a barn owl swooping at night, every feather a crisp white line scratched from black, the face disc glowing where scratches gather thickest, solid black sky. No text or logo.',
        'Scratchboard drawing of a moonlit forest of dead twisted trees, bark in form-following scratched lines, fog as stippled scratch dots. No text or logo.',
        'Scratchboard drawing of a coiled rattlesnake on a rock, scales scratched one by one, wire-brush texture on the lichen, pure black shadows. No text or logo.',
      ],
    },
    'SP06-029': {
      dna: d({
        aesthetic:
          'Cut-paper silhouette: the subject reduced to a single solid black shape cut from paper, with all information carried by the outline.',
        color_and_tone:
          'Solid flat black shape on white or pale cream paper, no interior greys, one optional flat background tone.',
        lighting_and_shadow:
          'No modeling at all; the silhouette itself is the only value, shaped as if backlit.',
        texture_and_material:
          'Crisp scissor-cut edges with tiny irregularities, fine cut details such as lace, hair strands and leaf tips, paper grain.',
        camera_and_composition:
          'Keep the requested subject but pose it in profile or side view so the outline reads clearly.',
        atmosphere_and_mood: 'Elegant, clear and a little theatrical, like a shadow play.',
        rendering_and_quality:
          'One unbroken black mass with intricate cut edges; no interior lines, no gradients, no highlights.',
        key_features:
          'single solid black shape; profile readable outline; scissor-cut edge detail; no interior modeling; flat paper ground',
      }),
      avoid: [...AVOID, 'interior details', 'gradients', 'three-quarter or frontal pose'],
      briefs: [
        'Cut-paper silhouette of a witch on a broomstick crossing a full moon above twisted crooked rooftops, one solid black shape with intricate scissor-cut bristles and cloak fringe, pale cream paper. No text or logo.',
        'Cut-paper silhouette of two adult duelists lunging with rapiers in profile, the blades as hair-thin cut strips, no interior lines. No text or logo.',
        'Cut-paper silhouette of a camel caravan with adult riders walking along a dune ridge, crisp side-view outlines, fine cut tassels and bridles. No text or logo.',
      ],
    },
    'SP06-030': {
      dna: d({
        aesthetic:
          'Continuous line drawing: the whole image drawn with one unbroken line of even weight that never lifts from the paper.',
        color_and_tone: 'One black line on white; no fill, no shading, no second color.',
        lighting_and_shadow:
          'No shading; volume is suggested only by the line doubling back and overlapping itself.',
        texture_and_material:
          'Smooth paper, a single smooth fineliner stroke with loops where it travels between forms.',
        camera_and_composition:
          'Keep the requested framing; the line enters at one side and exits at another, connecting every part of the subject.',
        atmosphere_and_mood: 'Graceful, minimal and playful, a single thought in one stroke.',
        rendering_and_quality:
          'Even weight, fluid curves, simplified but recognizable forms, visible connecting loops; no breaks, no sketchy repeats.',
        key_features:
          'one unbroken line; even line weight; connecting loops between forms; no fill or shading; simplified elegant contours',
      }),
      avoid: [...AVOID, 'broken separate lines', 'shading', 'sketchy repeated strokes'],
      briefs: [
        'Continuous line drawing of an adult cellist playing with closed eyes, one unbroken black line running from the scroll through her arms into the bow, connecting loops, no fill. No text or logo.',
        'Continuous line drawing of a cat stretching into a long arch, a single even-weight line looping from tail to whiskers on white paper. No text or logo.',
        'Continuous line drawing of a teapot pouring into two cups, the one line doubling back to suggest the steam, simplified elegant contours. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Blind Contour Drawing',
      domain: 'contour drawn without looking at the paper',
      tags: ['blind-contour', 'line', 'observational'],
      dna: d({
        aesthetic:
          'Blind contour drawing: a slow single pen line made while the eye follows the subject and never looks at the paper, so proportions drift and parts misalign.',
        color_and_tone: 'One black or sepia fineliner line on white paper, no fill and no tone.',
        lighting_and_shadow:
          'No shading; only the contour and inner edges that the eye traced, including folds and wrinkles.',
        texture_and_material:
          'Wobbly slow line with tiny tremors, overshoots where features failed to meet, cheap sketchbook paper.',
        camera_and_composition:
          'Keep the requested subject and view; its parts shift out of register, with an eye drifting off the face or a hand growing too large.',
        atmosphere_and_mood: 'Honest, awkward and funny, full of searching attention.',
        rendering_and_quality:
          'Continuous wandering line with misaligned features and overshoots; never corrected, never cleaned up.',
        key_features:
          'slow wobbling single line; drifting proportions; misaligned features; overshooting joins; no shading',
      }),
      avoid: [...DRAW_BASE, 'accurate proportions', 'clean confident outline', 'shading'],
      briefs: [
        'Blind contour drawing of an adult woman in a knitted hat, one slow wobbling fineliner line, her left eye drifting up onto the forehead, the nose overshooting the mouth, no shading. No text or logo.',
        'Blind contour drawing of a potted fern with dozens of fronds, the pot lopsided, leaves wandering off in tremoring lines that never quite join. No text or logo.',
        'Blind contour drawing of an armored gauntlet with every plate and rivet traced, the fingers drifting out of alignment, overshooting joins. No text or logo.',
      ],
    },
    {
      name: 'Reed Pen Drawing',
      domain: 'cut-reed pen and brown ink',
      tags: ['reed-pen', 'ink', 'mark-making'],
      dna: d({
        aesthetic:
          'Reed pen drawing: a cut reed dipped in brown ink making blunt, slightly splitting strokes, with the landscape built from rhythmic dashes, dots and short curls.',
        color_and_tone:
          'Warm walnut-brown or faded iron-gall ink on cream laid paper; tone made by the size and crowding of marks.',
        lighting_and_shadow:
          'Bright open light: sunlit areas left almost bare, shade described by denser rows of short thick marks.',
        texture_and_material:
          'Chunky dry-edged strokes where the reed ran out, split-nib double lines, ink pooling at stroke ends, laid-paper chain lines.',
        camera_and_composition:
          'Keep the requested framing; each surface gets its own pattern of marks, such as dashes for fields and curls for foliage.',
        atmosphere_and_mood: 'Sun-baked and vigorous, a lively scene made from rhythm.',
        rendering_and_quality:
          'Blunt varied marks with dry edges, no fine hatching, no wash, no hairline nib strokes.',
        key_features:
          'blunt split reed strokes; rhythmic dashes, dots and curls; brown ink on cream laid paper; dry-edged marks; pattern per surface',
      }),
      avoid: [...DRAW_BASE, 'fine steel-nib hairlines', 'grey wash', 'smooth tonal shading'],
      briefs: [
        'Reed pen drawing of a harvest field with sheaves and a farmhouse under a blazing sun, the stubble as rows of blunt brown dashes, the sun as rings of short strokes, dry split marks on cream laid paper. No text or logo.',
        'Reed pen drawing of an olive grove on a stony hillside, foliage built from short curls, trunks in chunky split strokes, bare paper for sunlight. No text or logo.',
        'Reed pen drawing of a tavern courtyard with a stone well and a sleeping dog, each surface given its own rhythm of dots and dashes, ink pooling at stroke ends. No text or logo.',
      ],
    },
    {
      name: 'Graphite Powder Lift-Out',
      domain: 'subtractive powdered graphite drawing',
      tags: ['graphite-powder', 'subtractive', 'tonal'],
      dna: d({
        aesthetic:
          'Graphite powder lift-out: the paper first covered in a smooth grey-black layer of powdered graphite brushed on with a soft pad, then the image erased out of it in light.',
        color_and_tone:
          'Soft silvery charcoal-grey ground, lifted lights ranging from pale grey to crisp white, a few pencil darks added last.',
        lighting_and_shadow:
          'Glowing subtractive light: light sources and lit edges are erased shapes with soft halos into the surrounding grey.',
        texture_and_material:
          'Velvety even graphite haze, kneaded-eraser dabs, sharp eraser-pen lines for the brightest highlights, faint swirl of the brushing pad.',
        camera_and_composition:
          'Keep the requested framing; the subject emerges from a smoky enveloping ground.',
        atmosphere_and_mood: 'Misty, ghostly and cinematic, forms appearing out of smoke.',
        rendering_and_quality:
          'Soft halo edges around lifted lights, silvery sheen, eraser marks visible; no line drawing and no hatching.',
        key_features:
          'brushed powdered graphite ground; erased lights with halos; eraser-pen sharp highlights; silvery sheen; forms emerging from haze',
      }),
      avoid: [...DRAW_BASE, 'white paper background', 'outline drawing', 'hatching'],
      briefs: [
        'Graphite powder lift-out drawing of a veiled adult widow emerging from darkness, the lace veil erased out of a silvery grey ground with an eraser pen, soft halos around her face. No text or logo.',
        'Graphite powder lift-out drawing of a single candle burning in a dark chapel, the flame and its glow lifted to pure white, the pews barely emerging from smoky haze. No text or logo.',
        'Graphite powder lift-out drawing of a lantern-bearer walking through fog between tall pines, shafts of light erased in soft streaks, kneaded-eraser dabs in the mist. No text or logo.',
      ],
    },
    {
      name: 'Watercolor Pencil Dissolve',
      domain: 'water-soluble pencil touched with a wet brush',
      tags: ['watercolor-pencil', 'line-and-wash', 'sketch'],
      dna: d({
        aesthetic:
          'Watercolor pencil drawing: colored lines hatched with water-soluble pencils, then partly brushed with clean water so some strokes melt into washes while others stay crisp.',
        color_and_tone:
          'Fresh mid-saturated colors, stronger where pencil was pressed hard; dissolved areas slightly brighter and more transparent than the dry lines.',
        lighting_and_shadow:
          'Directional light with shadows hatched in dry pencil and lit areas dissolved into a pale wash, or the reverse.',
        texture_and_material:
          'Pencil hatching still visible under washes, soft bleeding where water touched, paper white between strokes, watercolor paper tooth.',
        camera_and_composition:
          'Keep the requested framing; the drawing stays sketchy at the edges with dry lines trailing off.',
        atmosphere_and_mood: 'Fresh and light, an outdoor sketchbook page in progress.',
        rendering_and_quality:
          'A deliberate mix of crisp dry pencil strokes and melted wash zones, hatching ghosts under water; no opaque paint.',
        key_features:
          'dry pencil hatching beside dissolved washes; ghost strokes under water; soft bleed edges; paper white gaps; sketchy trailing edges',
      }),
      avoid: [...DRAW_BASE, 'opaque paint', 'fully blended washes', 'uniform flat color'],
      briefs: [
        'Watercolor pencil drawing of a cluster of red-capped mushrooms on a mossy log, hatched in dry pencil, the moss dissolved into soft green washes with the pencil ghosts still visible. No text or logo.',
        'Watercolor pencil drawing of a hummingbird hovering at a foxglove, the wings in crisp dry strokes, the flower bells melted into violet wash, paper white between. No text or logo.',
        'Watercolor pencil drawing of a crooked street of half-timbered houses, beams hatched in brown pencil, plaster walls brushed into pale washes, lines trailing off at the edges. No text or logo.',
      ],
    },
    {
      name: 'Carpenter Pencil Block Sketch',
      domain: 'flat chisel-lead pencil sketch',
      tags: ['carpenter-pencil', 'broad-stroke', 'graphite'],
      dna: d({
        aesthetic:
          'Carpenter pencil sketch: a flat rectangular lead sharpened with a knife, used on its broad side for wide blocky strokes and on its edge for thin lines.',
        color_and_tone:
          'Soft dark graphite greys in wide flat bands, bare paper for lights, a few thin sharp edge lines for accents.',
        lighting_and_shadow:
          'Planes of light and shadow blocked in as flat, same-width strokes; each plane one or two passes.',
        texture_and_material:
          'Wide chisel strokes with hard parallel sides, abrupt thick-to-thin turns when the pencil rotates, rough paper grain showing through.',
        camera_and_composition:
          'Keep the requested framing; the subject is simplified into faceted planes with a strong silhouette.',
        atmosphere_and_mood: 'Blunt, sturdy and quick, a builder’s sure hand.',
        rendering_and_quality:
          'Faceted blocky tone with sharp-sided strokes and thin edge accents; no smooth gradients and no fine hatching.',
        key_features:
          'wide flat chisel strokes; thick-to-thin rotation marks; faceted planes; bare paper lights; thin edge accents',
      }),
      avoid: [...DRAW_BASE, 'smooth graded shading', 'fine hatching', 'ink line'],
      briefs: [
        'Carpenter pencil sketch of a crumbling city gate and watchtower, the stone faces blocked in with wide flat chisel strokes, thin edge lines for the arrow slits, bare paper for the sunlit wall. No text or logo.',
        'Carpenter pencil sketch of an adult woodcutter splitting a log with an axe, his figure faceted into blocky planes, thick-to-thin turns along the arms. No text or logo.',
        'Carpenter pencil sketch of a stack of wine barrels in a vaulted cellar, curved staves in flat broad strokes, rough paper grain showing through the shadows. No text or logo.',
      ],
    },
  ],
};

export const aliases = {
  'SP06-019': 'Ballpoint Pen',
  'SP06-020': 'Colored Pencil',
  'SP06-026': 'Marker (Copic)',
  'SP06-028': 'Scratchboard',
};

export default spec;
