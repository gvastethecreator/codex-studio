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
      'Keep the prompt framing; show enough of the patterned surface for the motif to read at card size.',
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
        "Photograph of an adult knight's cloak lined with rust and indigo paisley, spread on a castle stair. No text or logo.",
        'Photograph of a hot-air balloon with an envelope printed in large paisley botehs rising at dawn over a valley, the curved teardrops filled with intricate saffron, teal and crimson inner detail. No text or logo.',
        'Photograph of an old reading chair upholstered in gold and burgundy paisley in a bookshop corner, curved teardrop botehs with intricate filling, a sleeping cat on the cushion. No text or logo.',
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
        'Photograph of an opera house corridor with walls hung in crimson damask, tone-on-tone floral motifs catching the sconce light, a violinist tuning up beneath a gilded mirror. No text or logo.',
        'Photograph of a coffin draped in black-on-black damask in a candlelit chapel, reversible woven flowers shimmering only where the light grazes the cloth. No text or logo.',
        'Photograph of a tall woman in a floor-length ivory damask gown on a spiral stair, tone-on-tone floral sheen shifting as she turns. No text or logo.',
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
        'Photograph of a crow perched on a garden fence wearing a tiny black-and-white houndstooth waistcoat, the jagged four-pointed checks crisp against its glossy feathers. No text or logo.',
        'Photograph of a vintage roadster interior upholstered in black-and-white houndstooth, the broken check pattern running across the seats and door panels in afternoon sun. No text or logo.',
        'Photograph of a retired detective in a brown houndstooth coat and cap feeding pigeons on a bench, the jagged check pattern sharp in soft autumn light. No text or logo.',
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
        "Photograph of a highland warrior's kilt and plaid in green and navy tartan on a misty moor. No text or logo.",
        "Photograph of a horse's saddle blanket in red and green tartan on a misty moor, intersecting stripes forming a clear woven sett, dew on the wool fibers. No text or logo.",
        'Photograph of a set of bagpipes wrapped in blue and green tartan resting on a stone wall in the Highlands, the plaid sett crisp and the drones gleaming. No text or logo.',
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
        'Photograph of a vintage scooter painted with red-and-white polka dots parked on a seaside promenade, evenly spaced dots curving over the fenders in bright sun. No text or logo.',
        'Photograph of a giant inflatable whale covered in yellow and white polka dots in a public pool, children splashing around it and dots stretched on its curves. No text or logo.',
        'Photograph of a tall pointed witch hat in black with white polka dots on a hat stand, evenly spaced round dots following the cone and brim. No text or logo.',
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
        'Photograph of a vintage hot rod painted in woodland camouflage blotches parked in a forest clearing, disruptive greens and browns blending it into the trees. No text or logo.',
        "Photograph of a soldier's field jacket in desert camouflage hanging on a wooden peg in a tent, disruptive tan and brown blotches. No text or logo.",
        'Photograph of a garden shed painted in urban grey camouflage blotches standing among concrete walls, disruptive angular patches catching the light. No text or logo.',
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
        "Photograph of a street magician's robe in rainbow tie-dye spirals performing in a sunny plaza, radial dye bursts with soft bleeding edges across the sleeves. No text or logo.",
        'Photograph of a festival banner in purple and orange tie-dye spirals flapping between trees, radial bursts bleeding softly at the edges. No text or logo.',
        'Photograph of a tie-dyed canvas sail on a small dinghy at sea, a spiral burst of teal and pink bleeding into white. No text or logo.',
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
        'Photograph of a vintage bicycle entirely covered in a hand-knitted cable sleeve parked on a cobbled street, visible knit stitches, cables and ribbing wrapping the frame. No text or logo.',
        'Photograph of a knitted egg cozy on a breakfast table shaped like a sleeping hen, visible knit stitches and ribbed edges, a boiled egg peeking out. No text or logo.',
        'Photograph of a bus stop in a small town wrapped in colorful yarn-bombing knits, cables and ribbing around the poles and bench. No text or logo.',
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
        'Photograph of a stuffed bear made of faded indigo denim sitting on a patchwork bed, diagonal twill weave visible and whiskered fading on its paws. No text or logo.',
        "Photograph of a mechanic's denim overalls hanging on a workshop hook, faded indigo twill with oil marks and worn pale knees. No text or logo.",
        'Photograph of a sofa upholstered in patchwork denim in a loft, different indigo shades and diagonal twill weave, frayed seams at the arms. No text or logo.',
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
        'Photograph of a sun hat woven in basket-weave rattan on a beach chair, over-under interlaced strips forming a crisp checked texture and a ribbon band. No text or logo.',
        'Photograph of a large basket-weave rattan fish trap resting on a riverbank, over-under strips interlaced in a tight pattern, water beading on the wet reed. No text or logo.',
        'Photograph of a garden daybed in basket-weave rattan on a terrace, over-under interlaced strips casting a checkered shadow on the tiles. No text or logo.',
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
        'Photograph of a modern building facade clad in a honeycomb hexagon pattern of gold panels, tessellated cells catching the sunset over a plaza. No text or logo.',
        'Photograph of a model in a honeycomb-patterned yellow gown walking through a greenhouse, tessellated hexagon cells across the fabric. No text or logo.',
        'Photograph of a bathroom floor tiled in black and white honeycomb hexagons, a claw-foot tub and morning light across the tessellation. No text or logo.',
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
        'Photograph of a fountain covered in blue-and-white azulejo tiles in a sunny courtyard, ornate painted repeats curving around the basin and water sparkling. No text or logo.',
        'Photograph of a tram stop bench and wall covered in blue-and-white azulejo tiles, ornate floral repeats, a waiting passenger reading a book. No text or logo.',
        'Photograph of a stone well in a village square covered in blue-and-white azulejo tiles, glazed painted repeats and a bucket on the rim. No text or logo.',
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
        'Photograph of a cross-stitched sampler of a lighthouse and sailing ships on even-weave linen, pixel-like X stitches in navy and red, the needle still threaded. No text or logo.',
        'Photograph of a cross-stitched portrait of a grandmother in a wooden hoop, X stitches forming soft pixel shading on even-weave fabric. No text or logo.',
        'Photograph of a cross-stitched owl pillow on a rocking chair, pixel-like X stitches in brown and gold on cream even-weave. No text or logo.',
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
        'Photograph of a four-poster bed hung with blue toile de Jouy showing engraved pastoral vignettes of shepherds, ruins and sailing boats on cream cloth. No text or logo.',
        'Photograph of a woman in a red toile de Jouy gown in an orangery, single-color engraved pastoral scenes repeating across the skirt. No text or logo.',
        'Photograph of a wing chair covered in black toile de Jouy by a window, engraved vignettes of hunters and hounds on cream fabric. No text or logo.',
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
        "Photograph of a caravan leader's long coat in indigo ikat with feathered diamond motifs, the blurred edges of the resist-dyed pattern shimmering in desert light. No text or logo.",
        'Photograph of an ikat saddle blanket on a resting camel, red and gold blurred-edge motifs woven from resist-dyed yarns. No text or logo.',
        'Photograph of a market tent made of ikat cloth in a bazaar, feathered geometric motifs glowing as sunlight shines through. No text or logo.',
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
        'Photograph of a batik sarong with sea serpent and wave motifs hanging on a line by the sea, fine crackle lines from the wax resist and layered indigo and brown. No text or logo.',
        'Photograph of a large batik banner of rice fields and birds in a village hall, crackled wax lines and layered ochre, green and indigo. No text or logo.',
        'Photograph of a woman wearing a batik headwrap at a market stall, crackled wax-resist lines and layered dye colors. No text or logo.',
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
        "Photograph of a swordsman's robe in indigo shibori ripples standing in a bamboo grove, folded and bound resist patterns in white on deep blue. No text or logo.",
        'Photograph of indigo shibori curtains moving in a temple doorway, stitched resist patterns glowing as light passes through. No text or logo.',
        'Photograph of a large kite made of indigo shibori cloth flying over a beach, folded resist rings and bound spots. No text or logo.',
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
        'Photograph of a golden retriever wearing an argyle sweater by a fireplace, overlapping diamonds and thin crossing lines in green and cream. No text or logo.',
        'Photograph of an argyle-patterned golf bag on a misty course, overlapping diamonds and diagonal crossing lines. No text or logo.',
        'Photograph of argyle socks on a skeleton sitting in a classroom chair, bright diamonds and thin diagonal lines. No text or logo.',
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
        "Photograph of a nomad's tent and saddlebags in kilim flatweave on a mountain plateau, geometric diamonds, hooks and stepped motifs in madder red and indigo. No text or logo.",
        'Photograph of a wooden chest covered in kilim flatweave in a stone house, stepped diamonds and hook motifs in rust and ivory. No text or logo.',
        'Photograph of a traveler wearing a kilim cloak on a snowy pass, flat-woven hooks and diamonds in red and black. No text or logo.',
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
        'Photograph of a round shield carved with continuous Celtic knotwork, interlaced bands weaving over and under around a central boss. No text or logo.',
        'Photograph of a green cloak embroidered with gold Celtic knotwork along the hem, continuous interlaced bands catching firelight. No text or logo.',
        'Photograph of a weathered stone cross on a hill covered in Celtic knotwork, lichen in the interlaced grooves. No text or logo.',
      ],
    },
  ] satisfies Create[],
};

export default spec;
