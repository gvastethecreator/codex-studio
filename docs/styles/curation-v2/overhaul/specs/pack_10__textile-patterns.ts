import type { Create, Dna, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';

// Textile & ornamental patterns: the motif is a surface modifier on the target named in the prompt
// (garment, object, wall, upholstery). Stitch-built patterns say so explicitly.
const AVOID = [...STYLE_AVOID, 'pattern covering the whole scene instead of the target'];

const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
const pad = (t: string, min: number, tail: string) =>
  words(t) < min ? `${t.replace(/\.$/, '')}, ${tail}` : t;

function pattern(
  aesthetic: string,
  motif: string,
  color: string,
  texture: string,
  mood: string,
  key: string,
  support = 'printed or woven onto the surface',
): Dna {
  return {
    aesthetic,
    subject_treatment: `Apply this motif ${support} of the target named in the prompt (garment, object, upholstery, wall); if none is named, use it on the main subject's clothing or surface. Keep shape, pose and setting: ${motif}`,
    color_and_tone: pad(
      color,
      9,
      'on the patterned surface while the rest of the scene keeps its palette.',
    ),
    lighting_and_shadow:
      'Natural light that follows the surface, so the pattern bends with folds and curves.',
    texture_and_material: pad(texture, 9, 'with the pattern scaled correctly to the target.'),
    camera_and_composition:
      'Keep the prompt framing; show enough of the patterned surface for the motif to read at a glance.',
    atmosphere_and_mood: pad(mood, 8, 'carried by the pattern and its colors.'),
    rendering_and_quality:
      'Crisp, correctly repeating pattern that wraps believably around form, without smeared or random motifs.',
    key_features: key,
  };
}

const spec: Spec = {
  pack: 'pack_10',
  category: '5. Textile & Ornamental Patterns',
  updates: {
    'SP10-046': {
      dna: pattern(
        'Paisley: curved teardrop botehs with intricate inner filling.',
        'repeating teardrop botehs filled with florals and dots.',
        'Rust, indigo, gold and cream.',
        'Printed or woven fabric with fine detail.',
        'Bohemian, ornate, warm and flowing.',
        'teardrop botehs; intricate filling',
      ),
      avoid: AVOID,
      briefs: [
        "Spread across a stone stair, a warrior's cloak falls open to reveal a lining of rust and indigo teardrop botehs curling like flames. No readable text or logo.",
        "At dawn a hot-air balloon rises over a valley, its envelope printed with giant curved teardrops full of intricate filling. No readable text or logo.",
        "In a bookshop corner an old reading chair is upholstered in gold and burgundy teardrop motifs, one worn bald where a reader always sits. No readable text or logo.",
      ],
    },
    'SP10-047': {
      dna: pattern(
        'Damask: reversible woven floral motifs in tone-on-tone sheen.',
        'large symmetrical floral damask motifs shown by matte and satin contrast.',
        'Tone-on-tone crimson, ivory or black.',
        'Woven jacquard with satin sheen.',
        'Regal, formal, rich and quiet.',
        'tone-on-tone damask; satin/matte contrast',
      ),
      avoid: AVOID,
      briefs: [
        "An opera house corridor is hung in crimson tone-on-tone florals that only appear where the sconce light grazes the weave. No readable text or logo.",
        "In a candlelit chapel a coffin is draped in black-on-black woven flowers that shimmer only when the flame moves. No readable text or logo.",
        "On a spiral stair a floor-length ivory gown shifts its tone-on-tone floral sheen with every step. No readable text or logo.",
      ],
    },
    'SP10-049': {
      dna: pattern(
        'Houndstooth: broken check of four-pointed jagged shapes.',
        'crisp houndstooth broken checks.',
        'Black and white or brown and cream.',
        'Woven wool twill.',
        'Classic, sharp, tailored and graphic.',
        'houndstooth broken check',
        'woven into the fabric',
      ),
      avoid: AVOID,
      briefs: [
        "A crow perched on a garden fence wears a tiny black-and-white waistcoat of jagged four-pointed checks, looking very pleased with itself. No readable text or logo.",
        "Inside a vintage roadster the seats are covered in black-and-white broken checks running seamlessly across the stitching. No readable text or logo.",
        "A retired detective in a brown broken-check coat and cap feeds pigeons on a bench, the jagged pattern sharp in soft light. No readable text or logo.",
      ],
    },
    'SP10-050': {
      dna: pattern(
        'Tartan: intersecting colored stripes forming a woven plaid sett.',
        'a tartan sett of crossing stripes with twill diagonals.',
        'Deep green, navy, red and yellow lines.',
        'Woven wool twill.',
        'Rugged, clan-proud, warm and bold.',
        'tartan sett; twill diagonals',
        'woven into the fabric',
      ),
      avoid: AVOID,
      briefs: [
        "On a misty moor a highland warrior's kilt and plaid in green and navy stripes whip in the wind. No readable text or logo.",
        "Draped over a horse on a dewy moor, a saddle blanket of intersecting red and green stripes forms a crisp woven sett. No readable text or logo.",
        "Resting on a stone wall in the hills, a set of bagpipes is wrapped in blue and green plaid, its drones pointing at the clouds. No readable text or logo.",
      ],
    },
    'SP10-051': {
      dna: pattern(
        'Polka dot: evenly spaced round dots on a contrasting ground.',
        'evenly spaced round dots.',
        'White on red, black on white or navy.',
        'Printed fabric or painted surface.',
        'Playful, retro, cheerful and bold.',
        'even round dots',
      ),
      avoid: AVOID,
      briefs: [
        "Parked on a seaside promenade, a vintage scooter is painted in evenly spaced red-and-white dots that curve over its bodywork. No readable text or logo.",
        "In a public pool a giant inflatable whale covered in yellow and white dots bobs among swimmers in sunhats. No readable text or logo.",
        "On a hat stand a tall pointed witch hat in black with white dots follows the cone perfectly down to its brim. No readable text or logo.",
      ],
    },
    'SP10-052': {
      dna: pattern(
        'Camouflage: disruptive organic blotch pattern for concealment.',
        'organic camouflage blotches in 3-4 tones.',
        'Woodland greens, desert tans or urban greys.',
        'Printed ripstop or paint.',
        'Military, rugged, hidden and practical.',
        'camouflage blotches',
      ),
      avoid: [...AVOID, 'military insignia'],
      briefs: [
        "Parked in a forest clearing, a vintage hot rod painted in woodland blotches disappears into the ferns around it. No readable text or logo.",
        "Hanging on a wooden peg in a tent, a field jacket in desert blotches of tan and brown shows sand in every fold. No readable text or logo.",
        "Standing among concrete walls, a garden shed painted in angular grey blotches nearly vanishes from view. No readable text or logo.",
      ],
    },
    'SP10-053': {
      dna: pattern(
        'Tie-dye: radial or spiral dye bursts with soft bleeding edges.',
        'spiral or radial dye bursts with soft edges.',
        'Saturated rainbow or indigo.',
        'Dyed cotton with bleed.',
        'Joyful, free, hippie and bright.',
        'tie-dye spirals; bleeding edges',
        'dyed into the fabric',
      ),
      avoid: AVOID,
      briefs: [
        "Performing in a sunny plaza, a street magician's robe swirls in rainbow spirals whose edges bleed softly into each other. No readable text or logo.",
        "Strung between trees, a festival banner flaps in purple and orange spiral bursts bleeding at the edges. No readable text or logo.",
        "Out at sea, a small dinghy's canvas sail bursts into a teal and pink spiral bleeding into white. No readable text or logo.",
      ],
    },
    'SP10-057': {
      dna: pattern(
        'Knitted texture: visible knit stitches, cables and ribbing forming the surface.',
        'visible knit stitches and cables as a surface texture.',
        'Wool colors.',
        'Knit stitches with fuzz.',
        'Cozy, handmade, warm and soft.',
        'knit stitches; cables',
        'built from knit stitches on the surface',
      ),
      avoid: AVOID,
      briefs: [
        "Parked on a cobbled street, a vintage bicycle is entirely covered in a hand-knitted cable sleeve, ribbing wrapped around every spoke. No readable text or logo.",
        "On a breakfast table a knitted egg cozy shaped like a sleeping hen keeps a boiled egg warm under ribbed wings. No readable text or logo.",
        "In a small town a bus stop is wrapped in colorful yarn, cables and ribbing climbing the poles and bench. No readable text or logo.",
      ],
    },
    'SP10-058': {
      dna: pattern(
        'Denim texture: indigo twill with diagonal weave and fading.',
        'indigo twill with diagonal weave and whiskered fading.',
        'Indigo blues.',
        'Twill weave with fading.',
        'Casual, rugged, American and worn.',
        'indigo twill; diagonal weave',
        'woven into the fabric',
      ),
      avoid: AVOID,
      briefs: [
        "On a patchwork bed sits a stuffed bear made of faded indigo twill, whiskered pale where it has been hugged. No readable text or logo.",
        "Hanging on a workshop hook, a mechanic's overalls show faded indigo twill, oil marks and worn pale knees. No readable text or logo.",
        "In a loft a sofa is upholstered in patchwork indigo of different shades, frayed seams at the arms. No readable text or logo.",
      ],
    },
    'SP10-065': {
      dna: pattern(
        'Basket weave: over-under interlaced strips like woven rattan.',
        'over-under interlaced strips.',
        'Natural rattan, straw and tan.',
        'Woven strips with gaps.',
        'Handmade, natural, rustic and airy.',
        'over-under interlaced strips',
        'woven as the surface',
      ),
      avoid: AVOID,
      briefs: [
        "On a beach chair a sun hat of over-under rattan strips casts a checked shadow on the sand. No readable text or logo.",
        "Resting on a riverbank, a large woven fish trap drips water through its tight over-under strips. No readable text or logo.",
        "On a sunny terrace a garden daybed of interlaced rattan casts a checkered shadow across the tiles. No readable text or logo.",
      ],
    },
    'SP10-066': {
      dna: pattern(
        'Honeycomb pattern: tessellated hexagon cells as a surface motif.',
        'tessellated hexagon cells.',
        'Gold, amber or monochrome.',
        'Hexagonal cells with raised edges.',
        'Orderly, organic, natural and precise.',
        'hexagon tessellation',
      ),
      avoid: AVOID,
      briefs: [
        "At sunset the whole facade of a modern tower clad in gold hexagon panels glows cell by cell like a hive coming to life. No readable text or logo.",
        "Walking through a greenhouse, a model wears a yellow gown tessellated in hexagon cells like a walking hive. No readable text or logo.",
        "A bathroom floor tiled in black and white hexagons catches morning light around a claw-foot tub. No readable text or logo.",
      ],
    },
    'SP10-070': {
      dna: pattern(
        'Azulejo: glazed blue-and-white painted tiles with ornate repeats.',
        'blue-and-white glazed tile repeats with ornate borders.',
        'Cobalt blue on white glaze.',
        'Glazed ceramic tiles with grout.',
        'Mediterranean, fresh, ornate and bright.',
        'blue-white glazed tiles; ornate repeats',
        'as glazed tiles on the surface',
      ),
      avoid: AVOID,
      briefs: [
        "In a sunny courtyard a fountain is covered in blue-and-white painted tiles, ornate repeats curving around the basin. No readable text or logo.",
        "At a tram stop the bench and wall are covered in blue-and-white floral tiles, a waiting passenger reading a newspaper. No readable text or logo.",
        "In a village square a stone well is covered in glazed blue-and-white tiles, a bucket resting on its rim. No readable text or logo.",
      ],
    },
    'SP10-075': {
      dna: pattern(
        'Cross stitch: X-shaped stitches forming pixel-like motifs on even-weave fabric.',
        'X-stitch motifs on an even-weave grid.',
        'Embroidery floss colors.',
        'X stitches on aida cloth.',
        'Homely, handmade, charming and patient.',
        'X stitches; even-weave grid',
        'built from cross stitches on the fabric',
      ),
      avoid: AVOID,
      briefs: [
        "On even-weave linen a lighthouse and sailing ships are stitched in pixel-like navy and red crosses, the hoop still clamped on. No readable text or logo.",
        "In a wooden hoop a grandmother's portrait is stitched in tiny crosses that form soft pixel shading on her cheeks. No readable text or logo.",
        "On a rocking chair an owl pillow is stitched in brown and gold crosses on cream even-weave. No readable text or logo.",
      ],
    },
  },
  creates: [
    {
      name: 'Toile de Jouy',
      domain: 'toile scenic print',
      tags: ['toile', 'scenic-print', 'pattern'],
      dna: pattern(
        'Toile de Jouy: single-color engraved pastoral scenes repeated on cream cloth.',
        'repeated single-color engraved vignettes.',
        'Red, blue or black on cream.',
        'Printed cotton.',
        'Romantic, antique, pastoral and refined.',
        'engraved vignettes; single color on cream',
      ),
      avoid: AVOID,
      briefs: [
        "A four-poster bed is hung in blue-on-cream engraved pastoral vignettes of shepherds, ruins and sailing boats. No readable text or logo.",
        "In an orangery a woman wears a red gown whose skirt repeats engraved pastoral scenes in a single color. No readable text or logo.",
        "By a window a wing chair is covered in black engraved vignettes of hunters and hounds on cream cloth. No readable text or logo.",
      ],
    },
    {
      name: 'Ikat Blur',
      domain: 'ikat resist-dyed weave',
      tags: ['ikat', 'weave', 'pattern'],
      dna: pattern(
        'Ikat: resist-dyed yarns woven into blurred-edge geometric motifs.',
        'blurred-edge diamond and hook motifs.',
        'Indigo, madder red, ochre and cream.',
        'Woven threads with feathered edges.',
        'Handcrafted, rich, earthy and vibrant.',
        'blurred-edge ikat motifs',
        'dyed into the yarn before weaving',
      ),
      avoid: AVOID,
      briefs: [
        "A caravan leader's long coat shows feathered indigo diamonds, the resist-dyed edges shimmering as if out of focus. No readable text or logo.",
        "On a resting camel lies a saddle blanket of red and gold motifs whose woven edges blur like heat haze. No readable text or logo.",
        "In a bazaar a market tent of feathered geometric cloth glows as sunlight shines through it. No readable text or logo.",
      ],
    },
    {
      name: 'Batik Wax Resist',
      domain: 'batik wax resist dye',
      tags: ['batik', 'wax-resist', 'pattern'],
      dna: pattern(
        'Batik: wax-resist dyed cloth with crackled lines and layered colors.',
        'wax-resist motifs with fine crackle lines.',
        'Indigo, brown and cream.',
        'Dyed cotton with crackle.',
        'Earthy, handcrafted, intricate and warm.',
        'wax-resist motifs; crackle lines',
        'dyed into the cloth',
      ),
      avoid: AVOID,
      briefs: [
        "Hanging on a line by the sea, a sarong of sea serpent and wave motifs shows fine crackle lines through layered dye. No readable text or logo.",
        "In a village hall a large banner of rice fields and birds shows crackled wax lines in ochre, green and indigo. No readable text or logo.",
        "At a market stall a woman wears a headwrap of crackled wax-resist lines and layered dye colors. No readable text or logo.",
      ],
    },
    {
      name: 'Shibori Indigo',
      domain: 'shibori indigo dye',
      tags: ['shibori', 'indigo', 'pattern'],
      dna: pattern(
        'Shibori: indigo shaped-resist dyeing with folded, bound and stitched patterns.',
        'soft indigo resist patterns from folding and binding.',
        'Indigo and white.',
        'Dyed cotton or silk.',
        'Calm, handmade, fluid and deep.',
        'indigo shibori resist',
        'dyed into the cloth',
      ),
      avoid: AVOID,
      briefs: [
        "Standing in a bamboo grove, a swordsman's robe ripples in white folded-resist patterns on deep indigo. No readable text or logo.",
        "In a temple doorway indigo curtains move, stitched resist patterns glowing as light passes through them. No readable text or logo.",
        "Flying over a beach, a large kite of indigo cloth shows folded resist rings and bound white spots. No readable text or logo.",
      ],
    },
    {
      name: 'Argyle',
      domain: 'argyle diamond knit',
      tags: ['argyle', 'diamond', 'pattern'],
      dna: pattern(
        'Argyle: overlapping diamonds with thin diagonal crossing lines.',
        'diamonds with thin crossing diagonals.',
        'Navy, burgundy, green and cream.',
        'Knit wool.',
        'Preppy, classic, cozy and playful.',
        'argyle diamonds; crossing lines',
        'knitted into the surface',
      ),
      avoid: AVOID,
      briefs: [
        "By a fireplace a golden retriever wears a sweater of overlapping green and cream diamonds, looking deeply dignified. No readable text or logo.",
        "On a misty golf course a bag patterned in overlapping diamonds and thin diagonal lines waits by the flag. No readable text or logo.",
        "In an empty classroom after hours a skeleton sits upright at a desk wearing bright diamond-patterned socks with thin crossing lines. No readable text or logo.",
      ],
    },
    {
      name: 'Kilim Geometric',
      domain: 'kilim flatweave',
      tags: ['kilim', 'flatweave', 'pattern'],
      dna: pattern(
        'Kilim: flat-woven geometric diamonds, hooks and stepped motifs.',
        'stepped diamonds and hook motifs.',
        'Madder red, indigo, saffron.',
        'Flatweave wool with slits.',
        'Nomadic, bold, warm and ancient.',
        'kilim stepped diamonds; flatweave',
        'flat-woven as the surface',
      ),
      avoid: AVOID,
      briefs: [
        "On a mountain plateau a nomad's tent and saddlebags show flat-woven diamonds, hooks and stepped motifs. No readable text or logo.",
        "In a stone house a wooden chest is covered in flat weave of stepped diamonds and hooks in rust and ivory. No readable text or logo.",
        "On a snowy pass a traveler wears a cloak of flat-woven hooks and diamonds in red and black. No readable text or logo.",
      ],
    },
    {
      name: 'Celtic Knotwork',
      domain: 'celtic interlace knotwork',
      tags: ['celtic', 'knotwork', 'pattern'],
      dna: pattern(
        'Celtic knotwork: continuous interlaced bands weaving over and under.',
        'continuous over-under interlace bands.',
        'Gold, green and deep red.',
        'Carved, embroidered or painted.',
        'Ancient, mystic, intricate and flowing.',
        'over-under interlace; continuous bands',
        'carved, embroidered or painted onto the surface',
      ),
      avoid: AVOID,
      briefs: [
        "A round shield is carved with continuous interlaced bands weaving over and under around a central boss. No readable text or logo.",
        "By a hall fire a green cloak lies across a bench, its hem embroidered in gold interlaced bands that weave over and under without end. No readable text or logo.",
        "On a hill a weathered stone cross is covered in interlaced knotwork, lichen filling the grooves. No readable text or logo.",
      ],
    },
  ] satisfies Create[],
};

export default spec;
