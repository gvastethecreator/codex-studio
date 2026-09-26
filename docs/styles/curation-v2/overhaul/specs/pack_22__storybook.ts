import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Trading-card storybook and animation: warm, readable narrative illustration methods. Eight
// originals get card briefs; twelve new studies add picture-book washes, background plates, pencil
// tests, crayon texture, airbrushed fables, folk motifs, moonlit gouache, squash-and-stretch,
// vignette ovals, lamp glow, tinted fable plates and watercolor woodland critters.
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
  tags: [tag, 'portable-style-study'],
  dna: dna(fields),
  avoid: [...avoid, ...STYLE_AVOID],
  briefs,
});

const keep = 'Preserve the requested identity, proportions, pose and action';

const spec: Spec = {
  pack: 'pack_22',
  category: '4. Storybook & Animation',
  updates: {
    'SP22-125': { briefs: [
      'A fox knight rides a hare through a forest of interlacing flat gouache vines, the decoration richest only around the pair. No readable text or logo.',
      'A sea witch combs her hair on a rock while flat patterned waves curl around her in tapestry-like shapes. No readable text or logo.',
      'A dragon sleeps on a hill of flat patterned flowers under a sky of geometric stars. No readable text or logo.',
    ] },
    'SP22-126': { briefs: [
      'A young sky pirate leaps between two airships, a flexible line and clean color fills catching her mid-jump. No readable text or logo.',
      'A goblin chef juggles cleavers in a busy kitchen, drawn like an animation frame with bold clean fills. No readable text or logo.',
      'A tiny robot waters a single flower on a rooftop, its shadow one clean darker fill. No readable text or logo.',
    ] },
    'SP22-127': { briefs: [
      'A round cloud creature bounces over rooftops at dawn, its body smooth and soft like a squeezable toy. No readable text or logo.',
      'A chubby dragon hatchling tries to breathe fire and only makes a tiny smoke ring, modeled in soft rounded volumes. No readable text or logo.',
      "A snowman wizard casts a sparkly spell on a frozen hill, his round body and carrot nose shaded in smooth broad planes like a soft toy. No readable text or logo.",
    ] },
    'SP22-128': { briefs: [
      'A peacock queen walks through a garden where every leaf, feather and fountain repeats the same curling ornamental mark. No readable text or logo.',
      'A river spirit rises from the reeds, the water flowing in rhythmic curved strokes that echo her hair. No readable text or logo.',
      'A tree of lanterns grows in a village square, its branches swirling in repeated ornamental curves. No readable text or logo.',
    ] },
    'SP22-129': { briefs: [
      'A farmer and his giant turnip ride to market on a cart, perspective joyfully wrong and colors bold. No readable text or logo.',
      'A cat mayor greets a parade of animals in a village where every house leans a little differently. No readable text or logo.',
      'A dragon and a knight share a picnic on a lopsided hill, painted with charming hand-made wobbles. No readable text or logo.',
    ] },
    'SP22-130': { briefs: [
      'A caravan crosses layered dunes under a moon, depth told only by overlapping flat silhouettes of camels and hills. No readable text or logo.',
      'A castle on a cliff rises above five flat layers of pine forest in different blues. No readable text or logo.',
      'A whale passes beneath a tiny boat, both flat shapes overlapping in a calm flat sea. No readable text or logo.',
    ] },
    'SP22-131': { briefs: [
      'A bear librarian reads a bedtime story to owls in a treehouse, soft chalky textures and bright color accents. No readable text or logo.',
      'A red fox walks home through a snowy village at night in soft velvety chalk with glowing yellow windows. No readable text or logo.',
      "A kite festival fills a green hill with color as families run with strings, the soft chalk grain softening every kite, tail and cloud. No readable text or logo.",
    ] },
    'SP22-132': { briefs: [
      'A monster hunter faces a giant squid on a dock, condensed into bold readable poster shapes and decisive brush marks. No readable text or logo.',
      'An explorer holds a torch in a jungle temple as snakes coil around the columns, painted like a vintage adventure poster. No readable text or logo.',
      "A rocket racer roars past a ringed planet trailing orange flame, her whole ship condensed into bold contrast-led painted poster shapes. No readable text or logo.",
    ] },
  },
  creates: [
    study('Loose Ink Picture-Book Wash', 'loose ink line and watercolor picture book', 'loose-ink-wash', {
      aesthetic: 'Loose ink picture-book wash: quick expressive ink lines with loose watercolor washes that spill past the lines, like a lively classic children\'s picture book.',
      subject_treatment: `${keep}; draw the subject with loose confident ink and let color washes spill freely past the lines.`,
      color_and_tone: 'Fresh transparent watercolor colors with lots of white paper and gentle warm accents.',
      lighting_and_shadow: 'Simple soft shadow washes and bright white paper for light areas.',
      texture_and_material: 'Scratchy dip-pen lines, loose wash blooms, paper grain and splash marks.',
      camera_and_composition: 'Preserve the requested framing with airy white space around the subject.',
      atmosphere_and_mood: 'Keep the requested mood with a playful, warm and spontaneous charm.',
      rendering_and_quality: 'Loose expressive line and wash with clear storytelling, never overworked.',
      key_features: 'loose ink line; spilling watercolor; white paper space; spontaneous charm',
    }, ['overworked rendering'], [
      'A grumpy troll babysits three baby goats under his bridge, loose ink scribbles and splashes of green wash everywhere. No readable text or logo.',
      'A mouse knight rides a snail into battle against a very surprised beetle, drawn in quick lively ink and bright washes. No readable text or logo.',
      'A giant and a little girl share an umbrella in the rain, washes of blue spilling past their outlines. No readable text or logo.',
    ]),
    study('Painted Background Plate', 'lush painted animation background', 'background-plate', {
      aesthetic: 'Painted background plate: lush hand-painted animation background with soft gouache detail, flat-colored characters placed crisply on top.',
      subject_treatment: `${keep}; place the subject as a crisp flat-colored figure over a richly painted background.`,
      color_and_tone: 'Rich naturalistic painted backgrounds in greens and blues with brighter flat character colors.',
      lighting_and_shadow: 'Painted atmospheric light in the background, simple flat shadows on characters.',
      texture_and_material: 'Soft gouache brushwork in foliage and sky, clean cel-like figures.',
      camera_and_composition: 'Preserve the requested framing like a classic animation layout shot.',
      atmosphere_and_mood: 'Keep the requested mood with nostalgic animated wonder and calm.',
      rendering_and_quality: 'Painterly backgrounds and clean figures clearly separated in finish.',
      key_features: 'lush painted background; flat crisp characters; gouache foliage; layout shot',
    }, ['photographic background'], [
      'A tiny knight walks a mossy forest path under towering painted trees as sunbeams fall through the leaves. No readable text or logo.',
      'A cat witch flies over a painted seaside town at sunset, her flat black silhouette crisp against soft clouds. No readable text or logo.',
      'A robot gardener tends a greenhouse painted in rich blues and greens with dew on every leaf. No readable text or logo.',
    ]),
    study('Pencil-Test Keyframe', 'rough animation pencil drawings', 'pencil-test', {
      aesthetic: 'Pencil-test keyframe: rough animation drawings in blue and red pencil with construction lines, timing arcs and ghosted in-between poses.',
      subject_treatment: `${keep}; draw the subject as a lively rough key pose with construction lines and faint ghost poses.`,
      color_and_tone: 'Blue construction pencil, red or graphite clean-up lines on white animation paper.',
      lighting_and_shadow: 'No modeled light; simple tone scribbles only where needed.',
      texture_and_material: 'Sketchy pencil strokes, erased marks, peg holes and paper grain.',
      camera_and_composition: 'Preserve the requested framing on an animation paper sheet.',
      atmosphere_and_mood: 'Keep the requested mood with energetic in-progress motion.',
      rendering_and_quality: 'Loose but confident motion drawing with clear gesture and arcs.',
      key_features: 'blue construction lines; ghosted poses; motion arcs; animation paper',
    }, ['finished color painting'], [
      'A dragon takes off in three ghosted key poses on animation paper, blue construction circles in its wings. No readable text or logo.',
      'A dancing skeleton kicks up its heels with motion arcs showing every swing of its bony legs. No readable text or logo.',
      'A cat pounces on a ball of yarn, the in-between poses sketched faintly behind the final leap. No readable text or logo.',
    ]),
    study('Wax Crayon Storybook Texture', 'waxy crayon picture book', 'crayon-storybook', {
      aesthetic: 'Wax crayon storybook texture: picture-book illustration built with waxy crayons over washes, the paper grain catching the wax in bright broken strokes.',
      subject_treatment: `${keep}; color the subject in textured wax crayon strokes that follow its shape.`,
      color_and_tone: 'Bright crayon colors over soft watercolor base washes with white grain flecks.',
      lighting_and_shadow: 'Simple light with darker crayon layering in shadows.',
      texture_and_material: 'Waxy broken strokes, paper tooth flecks and crayon resist over washes.',
      camera_and_composition: 'Preserve the requested framing with cozy readable shapes.',
      atmosphere_and_mood: 'Keep the requested mood with playful handmade warmth and joy.',
      rendering_and_quality: 'Textured crayon layers with clear shapes, never sloppy scribble.',
      key_features: 'waxy crayon strokes; paper grain flecks; wash base; handmade warmth',
    }, ['smooth digital fill'], [
      'A bear in a knitted hat fishes on a frozen lake, his fur a layer of warm brown crayon over a blue wash. No readable text or logo.',
      'A family of foxes picnics in a meadow of crayon flowers, grain sparkling in every petal. No readable text or logo.',
      "A friendly volcano bakes bread in its crater for the whole village, crayon smoke curling up into a sky of waxy blue and pink. No readable text or logo.",
    ]),
    study('Soft Airbrush Fable', 'gentle airbrushed fairy tale', 'airbrush-fable', {
      aesthetic: 'Soft airbrush fable: gentle airbrushed fairy-tale illustration with smooth glowing gradients, soft edges and dreamy pastel light.',
      subject_treatment: `${keep}; render the subject with soft airbrushed volume and glowing edges.`,
      color_and_tone: 'Pastel pinks, lilacs, sky blues and warm glows with smooth gradients.',
      lighting_and_shadow: 'Soft glowing light with airbrushed halos and gentle shadow falloff.',
      texture_and_material: 'Smooth sprayed gradients, soft masked edges and a faint mist of paint.',
      camera_and_composition: 'Preserve the requested framing with a glowing dreamy focal point.',
      atmosphere_and_mood: 'Keep the requested mood with tender, dreamy fairy-tale softness.',
      rendering_and_quality: 'Clean soft gradients with defined silhouettes, never blurry mush.',
      key_features: 'soft airbrushed gradients; pastel glow; masked edges; dreamy light',
    }, ['harsh contrast'], [
      'A unicorn foal sleeps on a cloud as tiny stars drift down around it in soft pink and lilac glow. No readable text or logo.',
      'A princess frog sits on a lily pad under a glowing moon, her crown glinting in airbrushed light. No readable text or logo.',
      "A crystal castle floats above a calm pastel sea at dusk, glowing softly from inside as tiny airbrushed stars drift around its towers. No readable text or logo.",
    ]),
    study('Folk Motif Storybook', 'folk art pattern storybook', 'folk-motif', {
      aesthetic: 'Folk motif storybook: picture-book illustration full of flat folk-art patterns, symmetrical flowers, birds and borders in bright traditional colors.',
      subject_treatment: `${keep}; paint the subject in flat folk-art shapes decorated with traditional patterns.`,
      color_and_tone: 'Bright red, cobalt, yellow and green on cream or black grounds.',
      lighting_and_shadow: 'No modeled light; flat decorative color throughout the image.',
      texture_and_material: 'Flat painted motifs, dotted details, symmetrical flowers and simple brush marks.',
      camera_and_composition: 'Preserve the requested framing with symmetrical decorative borders.',
      atmosphere_and_mood: 'Keep the requested mood with festive traditional folk joy.',
      rendering_and_quality: 'Crisp flat decorative painting with rhythmic patterns throughout.',
      key_features: 'folk flower motifs; symmetry; bright traditional colors; decorative borders',
    }, ['realistic shading', 'readable lettering'], [
      'A rooster king sits on a throne of painted tulips, his feathers a pattern of red and cobalt dots. No readable text or logo.',
      "Two bears in wedding clothes dance under a painted border of symmetrical flowers and birds as the whole village claps in rows. No readable text or logo.",
      "A great river fish curls around a painted tree of life full of folk-art birds, its scales patterned with red and cobalt dots and tulips. No readable text or logo.",
    ]),
    study('Moonlit Gouache Picture-Book', 'night gouache storybook', 'moonlit-gouache', {
      aesthetic: 'Moonlit gouache picture-book: bedtime night scenes painted in opaque gouache blues, with glowing windows, stars and soft moonlight.',
      subject_treatment: `${keep}; place the subject in a gentle moonlit night painted in opaque blues.`,
      color_and_tone: 'Deep navy and teal nights with glowing warm yellow windows and silver moonlight.',
      lighting_and_shadow: 'Soft moonlight rims and warm window glows in a blue night.',
      texture_and_material: 'Opaque matte gouache, dry-brush stars and soft painted edges.',
      camera_and_composition: 'Preserve the requested framing with a big sky and a glowing focal point.',
      atmosphere_and_mood: 'Keep the requested mood with calm, cozy bedtime wonder.',
      rendering_and_quality: 'Clean opaque night painting with gentle glowing accents.',
      key_features: 'deep blue night; glowing windows; silver moonlight; opaque gouache',
    }, ['daylight'], [
      'An owl mail carrier delivers a glowing letter to a treehouse window under a huge silver moon. No readable text or logo.',
      'A sleepy dragon curls around a village well at night, the windows around it glowing warm yellow. No readable text or logo.',
      'A lighthouse keeper and her cat watch shooting stars from the gallery on a calm blue night. No readable text or logo.',
    ]),
    study('Squash-and-Stretch Keyposes', 'exaggerated cartoon motion poses', 'squash-stretch', {
      aesthetic: 'Squash-and-stretch keyposes: cartoon illustration with bodies squashed flat on impact and stretched long in motion, bursting with elastic energy.',
      subject_treatment: `${keep}; exaggerate the subject's motion with bold squash and stretch while keeping it recognizable.`,
      color_and_tone: 'Bright saturated cartoon colors with clean flat shading.',
      lighting_and_shadow: 'Simple flat shadows and small highlights that follow the stretched shapes.',
      texture_and_material: 'Clean line art, smear frames, motion lines and elastic bodies.',
      camera_and_composition: 'Preserve the requested framing with dynamic diagonal action lines.',
      atmosphere_and_mood: 'Keep the requested mood with bouncy, comic, energetic fun.',
      rendering_and_quality: 'Crisp clean cartoon rendering with clear readable exaggeration.',
      key_features: 'squash on impact; stretched motion; smear frames; bouncy energy',
    }, ['stiff realism'], [
      'A giant hammer comes down on a goblin who squashes flat like a pancake and immediately pops back up grinning. No readable text or logo.',
      "A griffin sneezes so hard in the throne room that its whole body stretches like taffy across the page while the king ducks behind his throne. No readable text or logo.",
      'A knight falls off a horse, stretching long in the air before bouncing off a haystack. No readable text or logo.',
    ]),
    study('Storybook Vignette Oval', 'soft vignette framed illustration', 'vignette-oval', {
      aesthetic: 'Storybook vignette oval: illustration contained in a soft oval vignette that fades into cream paper at the edges, like plates in an old storybook.',
      subject_treatment: `${keep}; center the subject within a soft oval scene that fades gently into the paper.`,
      color_and_tone: 'Soft muted watercolor and ink colors fading to warm cream paper at the edges.',
      lighting_and_shadow: 'Gentle soft lighting inside the oval, fading shadows toward the edges.',
      texture_and_material: 'Fine ink, watercolor, soft faded edges and warm paper texture.',
      camera_and_composition: 'Preserve the requested subject inside a centered oval vignette.',
      atmosphere_and_mood: 'Keep the requested mood with nostalgic storybook gentleness.',
      rendering_and_quality: 'Delicate detailed illustration with smooth fading vignette edges.',
      key_features: 'oval vignette; fading edges; cream paper; old storybook plate',
    }, ['hard rectangular frame', 'readable captions'], [
      'A rabbit in a waistcoat hurries through a garden inside a soft oval that fades into cream paper. No readable text or logo.',
      'A mermaid sings to a passing ship, the whole scene dissolving gently at the oval edges. No readable text or logo.',
      'A giant asleep on a mountain is framed in a fading oval like an old book plate. No readable text or logo.',
    ]),
    study('Bedtime Lamp Glow', 'warm lamp-lit interior storybook', 'lamp-glow', {
      aesthetic: 'Bedtime lamp glow: cozy interior storybook scenes lit by one warm lamp or candle, deep soft shadows and golden light on quilts and faces.',
      subject_treatment: `${keep}; place the subject in a cozy interior lit by a single warm lamp.`,
      color_and_tone: 'Golden amber lamp light, deep plum and brown shadows and soft quilt colors.',
      lighting_and_shadow: 'One warm light source with soft falloff into cozy dark corners.',
      texture_and_material: 'Quilts, wooden furniture, books, soft painted textures and warm glow.',
      camera_and_composition: 'Preserve the requested framing with the lamp near the focal point.',
      atmosphere_and_mood: 'Keep the requested mood with safe, sleepy, comforting warmth.',
      rendering_and_quality: 'Soft painterly lighting with warm glow and gentle detail.',
      key_features: 'single warm lamp; cozy shadows; golden glow; quilts and books',
    }, ['cold harsh light'], [
      'A grandmother dragon reads to three hatchlings by a lamp, their eyes glowing sleepily in the golden light. No readable text or logo.',
      'A mouse family eats supper under a candle stub, the huge shadows of the cheese dancing on the wall. No readable text or logo.',
      'A monster under the bed reads its own storybook by flashlight, looking scared of the dark too. No readable text or logo.',
    ]),
    study('Hand-Tinted Fable Plates', 'hand-colored engraved fable illustrations', 'tinted-fable', {
      aesthetic: 'Hand-tinted fable plates: fine engraved line illustrations of fables, colored by hand with thin washes that slightly miss the lines.',
      subject_treatment: `${keep}; draw the subject in fine engraved lines and tint it with light hand-applied washes.`,
      color_and_tone: 'Pale hand-applied tints of rose, sage and sky blue over black engraved lines.',
      lighting_and_shadow: 'Shading in fine engraved hatching, tints adding soft color.',
      texture_and_material: 'Crisp engraved lines, uneven hand tints, slight off-register color and aged paper.',
      camera_and_composition: 'Preserve the requested framing like a classic fable plate.',
      atmosphere_and_mood: 'Keep the requested mood with old-fashioned moral-tale charm.',
      rendering_and_quality: 'Precise fine engraving finished with delicate, slightly imperfect hand tinting.',
      key_features: 'engraved line; hand-applied tints; off-register color; aged paper',
    }, ['digital flat color'], [
      'A fox and a crow argue over a cheese on a branch, finely engraved and tinted in pale rose and sage. No readable text or logo.',
      'A tortoise crosses the finish line past a sleeping hare, the grass tinted green slightly beyond its lines. No readable text or logo.',
      "A lion gently lets a tiny mouse go in an engraved forest glade, the grass and mane tinted with soft washes that slip past the lines. No readable text or logo.",
    ]),
    study('Woodland Watercolor Critters', 'gentle animal character watercolor', 'woodland-critters', {
      aesthetic: 'Woodland watercolor critters: gentle watercolor animal characters in little clothes, softly detailed fur and cozy woodland settings.',
      subject_treatment: `${keep}; if the subject is an animal, keep it natural with small charming touches; otherwise place it among woodland creatures.`,
      color_and_tone: 'Soft earthy watercolor browns, mossy greens and gentle warm highlights.',
      lighting_and_shadow: 'Soft dappled forest light with gentle watercolor shadows.',
      texture_and_material: 'Fine fur strokes, soft washes, tiny clothing details and leaf litter.',
      camera_and_composition: 'Preserve the requested framing with cozy eye-level animal views.',
      atmosphere_and_mood: 'Keep the requested mood with tender, cozy woodland charm.',
      rendering_and_quality: 'Delicate detailed watercolor with soft edges and careful fur.',
      key_features: 'watercolor animals; tiny clothes; soft fur detail; cozy woodland',
    }, ['aggressive predators', 'gore'], [
      "On a rainy woodland morning a hedgehog postman in a tiny cap delivers a sack of acorns to a badger's round front door. No readable text or logo.",
      'A family of rabbits hosts a tea party inside a hollow log, the teacups made of acorn caps. No readable text or logo.',
      'An old owl knits a scarf by lamplight in a tree hollow while snow falls outside. No readable text or logo.',
    ]),
  ],
};

export default spec;
