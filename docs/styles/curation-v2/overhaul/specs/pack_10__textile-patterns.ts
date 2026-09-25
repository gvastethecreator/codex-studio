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
        'Photograph of a dragon egg wrapped in paisley silk. No text or logo.',
        "Photograph of a wizard's armchair upholstered in gold paisley. No text or logo.",
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
        'Photograph of a throne room wall hung with crimson damask, a knight kneeling before it. No text or logo.',
        'Photograph of a damask-covered coffin in a chapel. No text or logo.',
        "Photograph of a queen's black damask gown. No text or logo.",
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
        'Photograph of a crow wearing a tiny houndstooth waistcoat on a fence. No text or logo.',
        "Photograph of a knight's tabard in black-and-white houndstooth. No text or logo.",
        'Photograph of a houndstooth armchair in a library. No text or logo.',
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
        'Photograph of a tartan-covered dragon saddle. No text or logo.',
        'Photograph of a tartan wrapped bagpipe. No text or logo.',
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
        "Photograph of a knight's armor painted with red-and-white polka dots in a battlefield. No text or logo.",
        'Photograph of a polka-dot dragon. No text or logo.',
        'Photograph of a polka-dot witch hat. No text or logo.',
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
        'Photograph of a dragon painted in woodland camouflage blotches lying in a forest. No text or logo.',
        'Photograph of camo-covered knight armor. No text or logo.',
        'Photograph of a camo castle wall. No text or logo.',
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
        "Photograph of a wizard's robe in rainbow tie-dye spirals. No text or logo.",
        'Photograph of a tie-dye knight banner. No text or logo.',
        'Photograph of a tie-dyed dragon wing canvas. No text or logo.',
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
        "Photograph of a knight's horse wearing a full knitted cable barding. No text or logo.",
        'Photograph of a knitted dragon egg cozy. No text or logo.',
        'Photograph of a knitted crown. No text or logo.',
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
        'Photograph of a denim-textured dragon plush on a castle bed. No text or logo.',
        'Photograph of a denim knight tabard. No text or logo.',
        'Photograph of a denim-covered throne. No text or logo.',
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
        "Photograph of a knight's helmet woven in basket-weave rattan. No text or logo.",
        'Photograph of a basket-weave dragon. No text or logo.',
        'Photograph of a basket-weave throne. No text or logo.',
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
        "Photograph of a knight's shield embossed with a honeycomb hexagon pattern. No text or logo.",
        'Photograph of a honeycomb-patterned gown. No text or logo.',
        'Photograph of a honeycomb-tiled floor under a throne. No text or logo.',
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
        'Photograph of a dragon statue covered in blue-and-white azulejo tiles. No text or logo.',
        "Photograph of an azulejo-tiled knight's armor. No text or logo.",
        'Photograph of an azulejo-tiled well. No text or logo.',
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
        'Photograph of a cross-stitched sampler showing a dragon and castle in X stitches, no lettering. No text or logo.',
        'Photograph of a cross-stitched knight portrait. No text or logo.',
        'Photograph of a cross-stitched owl pillow. No text or logo.',
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
        'Photograph of a four-poster bed hung with blue toile showing dragons and knights in engraved vignettes. No text or logo.',
        'Photograph of a toile gown. No text or logo.',
        'Photograph of a toile-covered armchair. No text or logo.',
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
        "Photograph of a caravan leader's coat in indigo ikat with feathered diamond motifs. No text or logo.",
        'Photograph of an ikat saddle blanket on a camel. No text or logo.',
        'Photograph of an ikat tent. No text or logo.',
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
        'Photograph of a batik sarong with dragon and wave motifs and fine crackle lines. No text or logo.',
        'Photograph of a batik banner. No text or logo.',
        'Photograph of a batik headwrap. No text or logo.',
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
        "Photograph of a samurai's robe in indigo shibori ripples. No text or logo.",
        'Photograph of shibori curtains in a temple. No text or logo.',
        'Photograph of a shibori kite. No text or logo.',
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
        'Photograph of a dragon wearing an argyle sweater by a fireplace. No text or logo.',
        'Photograph of argyle knight tabard. No text or logo.',
        'Photograph of argyle socks on a skeleton. No text or logo.',
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
        "Photograph of a nomad's tent and saddlebags in kilim flatweave. No text or logo.",
        'Photograph of a kilim-covered chest. No text or logo.',
        'Photograph of a kilim cloak. No text or logo.',
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
        'Photograph of a shield carved with continuous Celtic knotwork. No text or logo.',
        'Photograph of a cloak embroidered with gold knotwork. No text or logo.',
        'Photograph of a stone cross with knotwork. No text or logo.',
      ],
    },
  ] satisfies Create[],
};

export default spec;
