import type { Dna, Spec } from '../tools/apply';

// Review rule: changing the medium alters edges and layering while subject and framing stay constant.
const paint =
  "Redraw the prompt's subject, pose, setting and framing in this paint medium; only edges, layering, paint body and surface change, while identity, proportions and camera stay as requested.";

function p(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? paint, ...rest } as Dna;
}

const AVOID = [
  'changing the requested subject',
  'changing the requested framing',
  'mixed media collage',
];

// Guard for new presets, matching the inherited painting negatives of the category.
const PAINT_BASE = [
  'photo',
  'photorealistic',
  '3d render',
  'plastic CGI finish',
  'flat digital filter',
  'pasted photo texture',
  'wrong paint medium',
  'generic AI gloss',
  ...AVOID,
];

const spec: Spec = {
  pack: 'pack_06',
  category: '1. Traditional Painting',
  updates: {
    'SP06-001': {
      dna: p({
        aesthetic:
          'Classic studio oil painting: transparent warm darks laid in thin, opaque lead-white lights built up thick, and form turned by a strong single light in the academic chiaroscuro manner.',
        color_and_tone:
          'Earth palette of raw umber, burnt sienna, yellow ochre and vermilion with lead white; deep warm shadows, one cool accent, values grouped into a clear light mass and dark mass.',
        lighting_and_shadow:
          'One high side light at roughly a four-to-one ratio; the shadow side dissolves into the dark ground while lit planes turn through soft half-tones to small thick highlights.',
        texture_and_material:
          'Linen canvas weave visible in thin darks, raised bristle-brush impasto only in the brightest lights, a faint amber varnish film over the whole surface.',
        camera_and_composition:
          'Keep the requested framing; the dark ground swallows the edges so the lit area becomes the focal point.',
        atmosphere_and_mood: 'Grave and weighty, a quiet drama carried by the fall of light.',
        rendering_and_quality:
          'Lost edges in shadow, found edges on the light side, thick lights over thin darks; brushwork stays visible up close and resolves at a distance.',
        key_features:
          'thin transparent darks and thick lights; single side light chiaroscuro; earth palette with lead white; linen weave in shadows; amber varnish glow',
      }),
      avoid: [...AVOID, 'even flat lighting', 'pastel palette', 'smooth airbrushed skin'],
      briefs: [
        'Classic oil painting of an adult plague doctor reading a cracked grimoire by a single candle in a vaulted crypt, the beak mask turning from thick lead-white highlights into a dark umber ground, strong chiaroscuro, linen weave showing in the thin shadows. No text or logo.',
        'Classic oil painting still life of a pewter jug, a split pomegranate and a dead pheasant on a dark oak table, one high side light, thin transparent darks, thick impasto on the metal and seeds, amber varnish glow. No text or logo.',
        'Classic oil painting of an adult falconer woman in a fur-trimmed cloak with a hooded falcon on her glove, three-quarter view against a near-black ground, lost edges in shadow and found edges on the lit cheek. No text or logo.',
      ],
    },
    'SP06-002': {
      dna: p({
        aesthetic:
          'Soft transparent watercolor: diluted pigment flooded wet-in-wet onto damp cold-press paper, with the white of the paper serving as the only white.',
        color_and_tone:
          'Pale transparent washes that granulate and mix on the paper; soft blues, sap greens and rose, values rarely darker than a mid-tone.',
        lighting_and_shadow:
          'Highlights are reserved untouched paper; shadows are a second glaze laid over a dry first wash, never opaque paint.',
        texture_and_material:
          'Cold-press paper tooth, granulating pigment in the valleys, cauliflower blooms where wet met damp, hard tide lines at the edges of dried pools.',
        camera_and_composition:
          'Keep the requested framing; edges of the image fade into bare paper instead of a hard rectangular border.',
        atmosphere_and_mood: 'Gentle and airy, a scene breathing through damp light.',
        rendering_and_quality:
          'Soft bled edges beside a few crisp dry-brush accents; no white paint, no opaque cover, no digital gradient.',
        key_features:
          'wet-in-wet bleeding washes; reserved paper whites; granulation and blooms; hard tide lines; vignette into bare paper',
      }),
      avoid: [...AVOID, 'opaque white paint', 'thick impasto', 'hard outlines'],
      dropAvoid: ['blurry'],
      briefs: [
        'Soft watercolor of a grey heron lifting off from misty reeds at dawn, wet-in-wet blue and rose washes bleeding into each other, the wings left as reserved white paper, cauliflower blooms in the water. No text or logo.',
        'Soft watercolor of a ruined abbey arch swallowed by ivy under drifting rain clouds, granulating grey washes, the scene fading into bare cold-press paper at the corners. No text or logo.',
        'Soft watercolor of a red fox asleep in snow-dusted bracken, the snow as untouched paper, pale sienna fur bleeding into violet shadow washes with hard tide lines. No text or logo.',
      ],
    },
    'SP06-003': {
      dna: p({
        aesthetic:
          'Contemporary acrylic painting: fast-drying opaque color laid in clean flat shapes with taped or hard edges, layered one over another without blending.',
        color_and_tone:
          'High-key synthetic hues such as cadmium-free orange, phthalo turquoise and quinacridone pink, each shape a single flat value, strong complementary pairs.',
        lighting_and_shadow:
          'Light and shadow simplified into two or three flat value steps per form; cast shadows as crisp, colored shapes.',
        texture_and_material:
          'Faint primed canvas grain under a satin-matte plastic skin, slight ridges where a flat brush stopped, no oily sheen.',
        camera_and_composition:
          'Keep the requested framing; forms read as interlocking flat color areas with clear silhouettes.',
        atmosphere_and_mood: 'Bright, direct and sunny, energy carried by bold color contrast.',
        rendering_and_quality:
          'Hard, clean edges between opaque layers, no soft blending or glazing, color fields even from edge to edge.',
        key_features:
          'opaque hard-edged color shapes; two or three flat value steps; complementary high-key palette; satin-matte acrylic skin; crisp colored cast shadows',
      }),
      avoid: [...AVOID, 'soft blending', 'glazed oil depth', 'muted earth palette'],
      briefs: [
        'Modern acrylic painting of adult synchronized swimmers seen straight from above in a turquoise pool, their bodies and ripples cut into hard-edged opaque shapes, pink and orange caps, crisp colored shadows on the tiles. No text or logo.',
        'Modern acrylic painting of a row of tall cacti throwing hard violet shadows across a salmon adobe wall at noon, flat opaque color fields, two value steps per form. No text or logo.',
        'Modern acrylic painting of an adult trapeze artist at the top of her swing against a flat cobalt circus tent, hard edges, quinacridone pink costume, satin-matte surface. No text or logo.',
      ],
    },
    'SP06-004': {
      dna: p({
        aesthetic:
          'Flat opaque gouache illustration: chalky matte color applied in even single-layer shapes, with small dry-brush textures inside each shape.',
        color_and_tone:
          'Chalky mid-saturation palette with a lot of white mixed in, muted teal, mustard, brick red and dusty pink; each area a solid unbroken tone.',
        lighting_and_shadow:
          'Graphic lighting: one flat shadow shape per form, painted as a darker solid tone rather than modeled.',
        texture_and_material:
          'Dead-matte powdery surface, faint streaks where the brush ran dry, slight paper tooth showing through lighter colors.',
        camera_and_composition:
          'Keep the requested framing; simplify forms into clean overlapping silhouettes with little interior detail.',
        atmosphere_and_mood: 'Cheerful and tidy, a mid-century picture-book calm.',
        rendering_and_quality:
          'Crisp shape edges with small dry-brush speckle, no glossy highlights, no transparent washes, no line art outline.',
        key_features:
          'flat chalky opaque shapes; one flat shadow per form; dry-brush streaks; dead-matte surface; muted mid-century palette',
      }),
      avoid: [...AVOID, 'glossy highlights', 'transparent washes', 'black outlines'],
      briefs: [
        "Flat gouache illustration of an alchemist's shop shelf crowded with stoppered bottles, dried herbs and a brass scale, each object a chalky opaque shape with one flat shadow, dry-brush streaks on the wood. No readable labels or logo.",
        'Flat gouache illustration of a mountain goat on a narrow cliff ledge above layered blue valleys, the ridges as stacked flat silhouettes in muted teal and dusty pink. No text or logo.',
        'Flat gouache illustration of an adult beekeeper in a white veil lifting a honeycomb frame, mustard hives behind, bees as small flat dots, dead-matte powdery surface. No text or logo.',
      ],
    },
    'SP06-005': {
      dna: p({
        aesthetic:
          'Egg tempera on a gessoed panel: pure pigment bound in yolk, built from thousands of tiny parallel and cross-hatched brush strokes, often set against burnished gold leaf.',
        color_and_tone:
          'Clear bright pigments such as ultramarine, vermilion, malachite green and lead-tin yellow over a green-earth underlayer in flesh; tooled gold ground.',
        lighting_and_shadow:
          'Soft even light from within; modeling built by hatching light over dark, with no cast shadows and no strong directional source.',
        texture_and_material:
          'Smooth ivory gesso panel, fine hatched strokes that never blend, burnished gold leaf with punched dot patterns around halos and borders of the forms.',
        camera_and_composition:
          'Keep the requested framing but flatten depth into stacked, frontal planes; figures and buildings sit on the picture plane.',
        atmosphere_and_mood: 'Still, luminous and devotional, precise craft over drama.',
        rendering_and_quality:
          'Every form modeled in visible fine hatching, crisp contours, matte eggshell sheen; no loose brushwork, no oil glazing.',
        key_features:
          'fine cross-hatched modeling; burnished and punched gold leaf; green-earth underpainting in flesh; frontal stacked space; matte eggshell sheen',
      }),
      avoid: [...AVOID, 'loose brushwork', 'deep atmospheric perspective', 'dramatic cast shadows'],
      briefs: [
        'Egg tempera panel of an armored adult woman knight spearing a coiled green wyrm, burnished gold-leaf ground with punched dot halo, her face modeled in fine hatching over green earth, ultramarine cloak. No text or logo.',
        'Egg tempera panel of a walled hill town of pink and ochre towers stacked frontally up a hill, tiny adult figures at the gate, every roof hatched in fine parallel strokes, gold sky. No text or logo.',
        'Egg tempera panel of a white unicorn kneeling in a flowered meadow beside an adult lady in a vermilion gown, each flower a crisp hatched shape, gold leaf behind. No text or logo.',
      ],
    },
    'SP06-006': {
      dna: p({
        aesthetic:
          'Encaustic hot-wax painting: pigmented beeswax melted, brushed on and fused with heat, then scraped and re-layered so color sits inside a translucent skin.',
        color_and_tone:
          'Deep saturated colors seen through amber-tinted wax, warm honey glow in the lights, cloudy semi-transparent layers over darker underlayers.',
        lighting_and_shadow:
          'Light enters the wax and glows back out, giving soft luminous edges and gentle rounded shadow transitions.',
        texture_and_material:
          'Thick waxy skin with pooled drips, torch-fused melted edges, scraped channels revealing earlier colors, a soft satin sheen.',
        camera_and_composition:
          'Keep the requested framing; fine details melt away while the main shapes stay firm.',
        atmosphere_and_mood: 'Warm, intimate and ancient, like something sealed in amber.',
        rendering_and_quality:
          'Softened fused edges, visible scraping and layering depth, translucent color over opaque; no crisp hatching or photographic detail.',
        key_features:
          'translucent fused wax layers; scraped channels revealing underlayers; amber honey glow; soft melted edges; satin wax sheen',
      }),
      avoid: [...AVOID, 'crisp fine detail', 'flat matte paint', 'glossy varnish'],
      dropAvoid: ['blurry'],
      briefs: [
        'Encaustic painting of a frontal funerary-style portrait of an adult merchant woman with gold earrings and dark eyes, pigmented beeswax fused into a warm honey glow, scraped channels in the background revealing red underlayers. No text or logo.',
        'Encaustic painting of lotus blossoms floating on a dark pond, petals dissolving into translucent amber wax layers, torch-fused melted edges. No text or logo.',
        'Encaustic painting of a luna moth with spread wings over scraped cobalt wax, the green wings glowing through the translucent skin, pooled wax drips at the lower edge. No text or logo.',
      ],
    },
    'SP06-007': {
      dna: p({
        aesthetic:
          'True buon fresco: mineral pigments painted into wet lime plaster so color becomes part of the wall, worked one day-patch at a time.',
        color_and_tone:
          'Earth and mineral palette of red ochre, yellow ochre, green earth, lime white and smalt blue; soft chalky mid-values with no deep blacks.',
        lighting_and_shadow:
          'Diffuse daylight modeling in broad light and shadow areas; simplified volumes suited to viewing across a room.',
        texture_and_material:
          'Rough lime plaster with trowel marks, faint seams between day-patches, hairline cracks, small flaked losses revealing pale plaster underneath.',
        camera_and_composition:
          'Keep the requested framing; forms are broad and readable from a distance, with architectural stability.',
        atmosphere_and_mood: 'Grand, calm and weathered, a painting centuries into the wall.',
        rendering_and_quality:
          'Matte chalky color sunk into plaster, broad brushwork, controlled wear only at seams and edges; no gloss and no oil depth.',
        key_features:
          'pigment sunk into lime plaster; day-patch seams; mineral earth palette; hairline cracks and flaked losses; broad readable forms',
      }),
      avoid: [...AVOID, 'glossy paint', 'deep black shadows', 'saturated neon color'],
      briefs: [
        'Buon fresco of a procession of hooded monks carrying a gilded reliquary along a vaulted wall, red and yellow ochre sunk into lime plaster, a day-patch seam running through the crowd, small flaked losses. No text or logo.',
        'Buon fresco ceiling lunette of a starry smalt-blue night with a crescent moon over sleeping adult shepherds and their flock, hairline cracks, chalky matte color. No text or logo.',
        'Buon fresco of adult nobles feasting at a long banquet table with hounds begging underneath, broad readable forms, green earth shadows, trowel marks in the plaster. No text or logo.',
      ],
    },
    'SP06-008': {
      dna: p({
        aesthetic:
          'East Asian ink wash: a single loaded brush of carbon ink on absorbent paper, one stroke per form, with pressure and water content doing all the modeling.',
        color_and_tone:
          'Black ink diluted into five tones from dense black to palest grey, large areas of untouched paper, at most one small touch of red or ochre.',
        lighting_and_shadow:
          'No cast light; volume and distance come from ink density, with dark near forms and pale dissolving far forms.',
        texture_and_material:
          'Absorbent rice paper with feathered bleeding at stroke edges, dry-brush flying white where the brush ran out, splashed ink in the darks.',
        camera_and_composition:
          'Keep the requested framing but leave large empty paper as mist, water or sky; the subject sits off-center.',
        atmosphere_and_mood: 'Quiet and spare, energy concentrated in a few decisive strokes.',
        rendering_and_quality:
          'Each stroke laid once without correction, varying from wet bleed to dry flying white; no outlines filled in afterward.',
        key_features:
          'one-stroke brush forms; five ink tones; feathered bleed on rice paper; dry-brush flying white; large empty paper as mist',
      }),
      avoid: [...AVOID, 'full color painting', 'filled-in outlines', 'busy background'],
      dropAvoid: ['blurry'],
      briefs: [
        'Ink wash painting of a lone red-crowned crane standing on one leg in a frozen marsh, body left as bare paper, the neck and tail in single loaded strokes, reeds in dry-brush flying white, one touch of red on the crown. No text, seal or logo.',
        "Ink wash painting of a hermit's thatched hut beneath a tall waterfall on a towering mountain, pale far peaks dissolving into empty paper mist, dense black pines near the bottom. No text, seal or logo.",
        'Ink wash painting of a coiling dragon breaking out of storm clouds, splashed ink for the clouds, the scales in quick pressure-varied strokes, feathered bleed everywhere. No text, seal or logo.',
      ],
    },
    'SP06-009': {
      dna: p({
        aesthetic:
          'Impressionist oil sketch: short separate strokes of unmixed color laid side by side outdoors, catching one moment of changing daylight rather than fixed forms.',
        color_and_tone:
          'Broken color with no black, shadows made of violet and blue, lights of cream, lemon and pink; complementary strokes vibrate against each other.',
        lighting_and_shadow:
          'Strong natural daylight at a specific hour; colored shadows and reflected light matter more than modeled volume.',
        texture_and_material:
          'Short thick dabs and commas of paint on a light ground, visible bristle tracks, ground peeking through between strokes.',
        camera_and_composition:
          'Keep the requested framing; edges blur where light is strongest and small detail is dropped in favour of patches of color.',
        atmosphere_and_mood: 'Light, fresh and fleeting, a breath of air caught quickly.',
        rendering_and_quality:
          'Detail dissolved into distinct strokes, no blending on the canvas, no black outlines; the image resolves only at a distance.',
        key_features:
          'short broken strokes of pure color; violet and blue shadows; no black; light ground showing through; blurred edges in bright light',
      }),
      avoid: [...AVOID, 'black shadows', 'smooth blending', 'sharp fine detail'],
      briefs: [
        'Impressionist oil painting of a tournament tent camp at dawn, striped pavilions and pennants fluttering, horses grazing between them, violet shadows on dewy grass, short broken strokes of lemon and pink light. No text or logo.',
        'Impressionist oil painting of an adult laundress hanging white sheets that billow in the wind, the sheets glowing blue and gold in broken color, her figure dissolved into quick dabs. No text or logo.',
        'Impressionist oil painting of a snowy village chapel at sunset, the snow made of violet, rose and cream strokes, no black anywhere, light ground peeking between the dabs. No text or logo.',
      ],
    },
    'SP06-010': {
      dna: p({
        aesthetic:
          'Pointillist dot painting: the whole image built from small round dots of pure color placed side by side so the eye mixes them at a distance.',
        color_and_tone:
          'Pure unmixed dots in complementary pairs, orange against blue, red against green; mid-tones made by interleaving two colors rather than blending them.',
        lighting_and_shadow:
          'Clear daylight with luminous haloes: lighter dots gather along a form where it meets a dark area, darker dots where it meets a light one.',
        texture_and_material:
          'Uniform small dots of slightly raised oil paint on a white ground, dot size constant across the picture.',
        camera_and_composition:
          'Keep the requested framing; forms become calm, geometric silhouettes with stiff, orderly contours.',
        atmosphere_and_mood: 'Still, shimmering and orderly, a moment frozen in bright air.',
        rendering_and_quality:
          'No strokes, lines or blended areas at all; every value produced by dot density and color pairing.',
        key_features:
          'uniform dots of pure color; complementary color pairs; optical mixing; contrast haloes at edges; stiff geometric silhouettes',
      }),
      avoid: [...AVOID, 'brushstrokes', 'blended gradients', 'pixel grid'],
      briefs: [
        'Pointillist painting of adults dancing around a harvest bonfire at dusk, the flames in orange and yellow dots set against blue-violet dot shadows, light haloes around every silhouette. No text or logo.',
        'Pointillist painting of a peacock displaying its tail on a stone balustrade, the eyespots formed from interleaved green, blue and gold dots, stiff orderly contours. No text or logo.',
        'Pointillist painting of a sunlit orchard with adult pickers on wooden ladders, the apples as red dots in green foliage, shadows built from blue and violet dots, uniform dot size. No text or logo.',
      ],
    },
    'SP06-011': {
      dna: p({
        aesthetic:
          'Palette-knife painting: paint spread and scraped onto the canvas with a steel knife in flat, sharp-edged slabs instead of brushed.',
        color_and_tone:
          'Pure tube colors pulled together on the canvas with streaks of two colors in one slab; strong value jumps between neighbouring planes.',
        lighting_and_shadow:
          'Raking light catches the ridges of each slab, so the paint relief itself adds highlight and shadow.',
        texture_and_material:
          'Thick sculptural slabs with sharp ridges where the knife lifted, smooth flat faces where it pressed, bare canvas in the gaps.',
        camera_and_composition:
          'Keep the requested framing; forms built from a few big planes, small details reduced to single knife marks.',
        atmosphere_and_mood: 'Bold and physical, a scene built with force.',
        rendering_and_quality:
          'Clean flat knife faces with hard edges and streaked color, no bristle marks and no soft blending.',
        key_features:
          'flat steel-knife slabs; sharp lifted ridges; streaked two-color swipes; raking-light relief; bare canvas gaps',
      }),
      avoid: [...AVOID, 'bristle brush marks', 'smooth glazing', 'fine linear detail'],
      briefs: [
        'Palette-knife painting of a castle keep burning at night, flames in thick orange and yellow knife slabs, the black stone walls in flat scraped planes, sparks as single knife flicks. No text or logo.',
        'Palette-knife painting of a sliced watermelon and a bunch of purple grapes on a crumpled white cloth, each seed and grape a single knife mark, sharp ridges catching raking light. No text or logo.',
        'Palette-knife painting of a storm wave crashing over black rocks, the foam in thick streaked white and teal slabs, bare canvas showing between strokes. No text or logo.',
      ],
    },
    'SP06-012': {
      dna: p({
        aesthetic:
          'Aerosol spray painting: color laid in layers through cut stencils and freehand can control, with soft sprayed falloff, hard stencil edges and drips.',
        color_and_tone:
          'Saturated fluorescent and primary aerosol colors over a dark or faded fade; smooth sprayed gradients from one color to another.',
        lighting_and_shadow:
          'Graphic lighting in stencil layers: a dark layer, a mid layer and a sprayed highlight, with glow suggested by soft overspray halos.',
        texture_and_material:
          'Fine speckled mist at the edge of every spray, runs and drips where paint pooled, slightly offset stencil layers on a rough painted surface.',
        camera_and_composition:
          'Keep the requested framing; the subject reads as bold layered stencil shapes against a sprayed fade background.',
        atmosphere_and_mood: 'Urgent, loud and improvised, made fast in one session.',
        rendering_and_quality:
          'Hard stencil edges mixed with soft freehand fades, visible speckle and drips; no brush marks and no readable tags.',
        key_features:
          'layered stencil shapes; soft freehand fades; overspray speckle halos; paint drips and runs; offset registration',
      }),
      avoid: [...AVOID, 'brush marks', 'readable tags or lettering', 'clean vector gradients'],
      dropAvoid: ['noise'],
      briefs: [
        'Spray paint artwork of a snarling wild boar head bursting out of a cloud of orange overspray, three offset stencil layers, drips running down from its tusks, fluorescent pink fade behind. No text, tags or logo.',
        'Spray paint artwork of a swarm of jellyfish glowing in stenciled layers over a deep blue freehand fade, their tendrils as soft sprayed lines, speckled mist haloes. No text, tags or logo.',
        'Spray paint artwork of a hooded adult archer drawing a longbow, the figure in black and red stencil layers, a sprayed yellow glow around the arrowhead, runs of paint under her feet. No text, tags or logo.',
      ],
    },
    'SP06-013': {
      dna: p({
        aesthetic:
          'Eighties commercial airbrush painting: frisket-masked shapes filled with seamless sprayed gradients, chrome reflections and hard pin-point star highlights.',
        color_and_tone:
          'Sunset gradients of magenta, orange and violet, chrome surfaces reflecting a horizon split into sky color above and brown ground below, cyan accents.',
        lighting_and_shadow:
          'Idealized glossy light: long smooth gradients across every form, sharp white specular stars on edges, strong rim light.',
        texture_and_material:
          'Grainless illustration-board surface, crisp frisket-cut edges, a faint spray stipple only in the deepest gradients.',
        camera_and_composition:
          'Keep the requested framing; forms are idealized and streamlined, often set against a large glowing horizon or sky.',
        atmosphere_and_mood: 'Slick, optimistic and glamorous, dreamy commercial fantasy.',
        rendering_and_quality:
          'Perfectly smooth gradients with masked hard edges and sparkle highlights; no brush marks, no digital noise.',
        key_features:
          'seamless sprayed gradients; frisket-masked hard edges; chrome horizon reflections; star-sparkle highlights; sunset magenta and cyan palette',
      }),
      avoid: [...AVOID, 'visible brushstrokes', 'muted earth palette', 'rough texture'],
      briefs: [
        'Eighties airbrush painting of a chrome-winged pegasus galloping over a glossy sunset sea, the wings reflecting a magenta horizon, star-sparkle highlights on the hooves, seamless sprayed gradients. No text or logo.',
        'Eighties airbrush painting of a dolphin leaping through a ring of tropical sunset light, the skin a smooth sprayed gradient from violet to cyan, frisket-cut edges and sparkles. No text or logo.',
        'Eighties airbrush painting of an adult astronaut whose mirrored visor reflects a huge ringed planet, chrome helmet with pin-point star highlights, smooth grainless gradients. No text or logo.',
      ],
    },
    'SP06-014': {
      dna: p({
        aesthetic:
          'Casein paint illustration: milk-protein paint laid in opaque velvety layers, the matte workhorse medium of mid-century magazine and book illustration.',
        color_and_tone:
          'Rich but softly chalky color with high chroma in the lights, warm-cool contrast between planes, velvety deep darks that are never glossy.',
        lighting_and_shadow:
          'Clear storytelling light: a warm key and cool shadows, shapes modeled in a few firm planes and soft transitions.',
        texture_and_material:
          'Velvety matte film on illustration board, soft dry-brush scumbles over dark underlayers, slight brush ridges in the lights.',
        camera_and_composition:
          'Keep the requested framing; clear, narrative staging with a readable focal figure and simplified background.',
        atmosphere_and_mood: 'Warm, sturdy and adventurous, an old illustrated story come alive.',
        rendering_and_quality:
          'Firm planes, soft scumbled edges and bright opaque highlights; velvet-matte everywhere, never glossy or airbrushed.',
        key_features:
          'velvety matte opaque film; warm key and cool shadows; dry-brush scumbles over dark; firm modeled planes; mid-century illustration staging',
      }),
      avoid: [...AVOID, 'glossy varnish', 'transparent washes', 'airbrushed smoothness'],
      briefs: [
        'Casein paint illustration of an adult woman explorer crossing a sagging rope bridge over a misty jungle gorge, warm key light on her jacket, cool velvety greens below, dry-brush scumbles in the mist. No text or logo.',
        'Casein paint illustration of a family of snowy owls huddled on a frosted pine branch at dusk, velvet-matte whites against deep blue, firm modeled planes in the feathers. No text or logo.',
        'Casein paint illustration of adult sailors playing cards at a lamplit table in a harbor tavern, warm lamp glow against cool blue windows, velvety dark corners. No text or logo.',
      ],
    },
    'SP06-015': {
      dna: p({
        aesthetic:
          'Black velvet painting: bright opaque paint laid over black velvet so the fabric itself is the darkest value and forms glow out of the dark.',
        color_and_tone:
          'Deep velvet black everywhere the paint is thin; saturated turquoise, magenta, gold and moonlight white on the lit edges only.',
        lighting_and_shadow:
          'Glowing rim light: forms exist only where light hits them, the shadow side left as bare black velvet.',
        texture_and_material:
          'Soft velvet pile catching the paint, fuzzy edges where the brush dragged across the nap, a slight sheen on the black.',
        camera_and_composition:
          'Keep the requested framing; the subject is centered and emerges from surrounding darkness.',
        atmosphere_and_mood: 'Kitsch yet sincere, nocturnal and theatrical in its glow.',
        rendering_and_quality:
          'Soft fuzzy transitions into bare black, bright luminous lights, no painted background tone at all.',
        key_features:
          'bare black velvet as shadow; glowing rim-lit edges; saturated turquoise, magenta and gold; velvet pile fuzz; subject emerging from darkness',
      }),
      avoid: [...AVOID, 'light background', 'painted grey shadows', 'daylight scene'],
      briefs: [
        'Black velvet painting of a snarling black panther crouched on a moonlit branch, only its rim-lit muscles and turquoise eyes glowing out of bare velvet black, soft fuzzy edges. No text or logo.',
        'Black velvet painting of an adult flamenco dancer in a swirling red dress, gold light catching the ruffles and her raised arms, everything else lost in black velvet. No text or logo.',
        'Black velvet painting of a lone wolf howling at a huge glowing moon above a frozen glacier, magenta and moonlight-white edges, the velvet pile catching the paint. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Alla Prima Plein-Air Sketch',
      domain: 'wet-into-wet outdoor oil sketch',
      tags: ['alla-prima', 'plein-air', 'oil'],
      dna: p({
        aesthetic:
          'Alla prima plein-air oil sketch: painted outdoors in a single wet-into-wet session on a small toned panel, each passage laid once and left.',
        color_and_tone:
          'Fresh mixed color with a warm orange or red-earth toned ground showing between strokes; clean values, strong light-to-shadow temperature shift.',
        lighting_and_shadow:
          'Real outdoor light at one time of day, painted in two big families of light and shadow before the sun moves.',
        texture_and_material:
          'Juicy loaded strokes dragged into wet paint, soft mixing at the stroke edges, toned ground left bare in places, small panel format.',
        camera_and_composition:
          'Keep the requested framing; big shapes blocked first, details suggested by a few final accents, edges unfinished at the borders.',
        atmosphere_and_mood: 'Fresh, spontaneous and alive, painted fast against the light.',
        rendering_and_quality:
          'Confident single-pass strokes, wet edges softly merged, bare toned ground visible; not polished or reworked.',
        key_features:
          'single-session wet-into-wet strokes; warm toned ground peeking through; two families of light and shadow; loose unfinished borders; small panel sketch',
      }),
      avoid: [...PAINT_BASE, 'polished academic finish', 'tight detail', 'glazed layers'],
      briefs: [
        'Alla prima plein-air oil sketch of an old stone bridge over a mill stream in late-afternoon light, juicy wet-into-wet strokes, the warm red-earth ground showing between them, loose unfinished borders. No text or logo.',
        'Alla prima plein-air oil sketch of a village market stall heaped with cabbages, onions and pumpkins under a striped awning, sunlit and shaded families of color painted in one pass. No text or logo.',
        'Alla prima plein-air oil sketch of a cliff-top windmill with its sails turning against fast clouds, big shapes blocked in with loaded strokes, bare toned panel at the edges. No text or logo.',
      ],
    },
    {
      name: 'Reverse Glass Painting',
      domain: 'folk painting behind glass',
      tags: ['reverse-glass', 'folk-art', 'glass'],
      dna: p({
        aesthetic:
          'Reverse glass painting: opaque paint applied to the back of a glass pane in reverse order, outlines and highlights first and background last, viewed through the glossy glass.',
        color_and_tone:
          'Bright flat folk colors, crimson, cobalt, emerald and yellow, with dark outline strokes and patches of metallic foil showing through unpainted areas.',
        lighting_and_shadow:
          'No modeled shadow; volume suggested only by a few painted highlight strokes, and a glassy sheen reflects across the whole surface.',
        texture_and_material:
          'Perfectly flat paint seen through glass, crisp first-laid outlines, crumpled gold or silver foil backing glittering in the gaps, faint glass reflection.',
        camera_and_composition:
          'Keep the requested framing; forms are flat, frontal and decorative, filled edge to edge with ornament in the spaces.',
        atmosphere_and_mood: 'Naive, festive and devout, bright as a village feast day.',
        rendering_and_quality:
          'Uniform opaque color behind crisp outlines, glossy glass surface over everything, foil sparkle; no brush texture and no gradients.',
        key_features:
          'paint behind glass seen through a glossy pane; outlines laid first; flat bright folk colors; crumpled foil backing; decorative frontal layout',
      }),
      avoid: [...PAINT_BASE, 'visible brush texture', 'soft gradients', 'realistic shading'],
      briefs: [
        'Reverse glass painting of a rooster crowing on a flowering branch, flat crimson and emerald folk colors behind glossy glass, crumpled gold foil glittering between the petals, crisp dark outlines. No text or logo.',
        'Reverse glass painting of an adult peasant couple dancing in embroidered festival clothes, flat cobalt and yellow shapes, a few painted highlight strokes, glass sheen across the scene. No text or logo.',
        'Reverse glass painting of a stag leaping over a bed of tulips, silver foil backing showing through the sky, decorative frontal layout filled with ornament. No text or logo.',
      ],
    },
    {
      name: 'Fine-Line Silk Painting',
      domain: 'meticulous outline and color on silk',
      tags: ['fine-line', 'silk', 'mineral-color'],
      dna: p({
        aesthetic:
          'Meticulous fine-line painting on sized silk: every form drawn first in hair-thin even ink outlines, then filled with many thin layers of mineral and plant color.',
        color_and_tone:
          'Soft layered color, malachite green, azurite blue, cinnabar and pale gold, on an aged honey-toned silk ground; gradations built by repeated thin washes.',
        lighting_and_shadow:
          'Even, shadowless light; volume made by gradating color inside each outline from edge to center.',
        texture_and_material:
          'Fine visible silk weave, flat mineral pigment slightly powdery, hair-fine ink contours of perfectly even thickness.',
        camera_and_composition:
          'Keep the requested framing; subjects sit in open space on the silk ground with careful, elegant spacing.',
        atmosphere_and_mood:
          'Refined, patient and serene, attention given to every feather and petal.',
        rendering_and_quality:
          'Every hair, vein and feather individually outlined and tinted; no loose brushwork, no cast shadows, no blending across outlines.',
        key_features:
          'hair-thin even ink outlines; layered mineral color washes; aged honey silk ground; gradated color inside each outline; shadowless meticulous detail',
      }),
      avoid: [...PAINT_BASE, 'loose splashy brushwork', 'cast shadows', 'heavy black outlines'],
      briefs: [
        'Fine-line silk painting of a pair of golden pheasants perched on a blossoming plum branch, every feather outlined in hair-thin ink and tinted with cinnabar and gold washes, open honey-toned silk around them. No text, seal or logo.',
        'Fine-line silk painting of an adult court musician playing a zither in an open pavilion, azurite and malachite robes gradated inside crisp outlines, silk weave visible. No text, seal or logo.',
        'Fine-line silk painting of a white tiger crouched on a rock beneath a twisted pine, each hair of the fur drawn individually, pale mineral tints, shadowless even light. No text, seal or logo.',
      ],
    },
    {
      name: 'Sanded Lacquer Painting',
      domain: 'layered and polished lacquer panel',
      tags: ['lacquer', 'eggshell-inlay', 'gold-leaf'],
      dna: p({
        aesthetic:
          'Sanded lacquer painting: many layers of tree lacquer, gold and silver leaf and crushed eggshell built on a black panel, then sanded back and polished so images surface from within.',
        color_and_tone:
          'Deep glossy black and cinnabar red, warm gold and silver leaf, ivory eggshell mosaic, and a brown-amber glaze where layers were sanded through.',
        lighting_and_shadow:
          'Light comes from the materials: leaf and eggshell shine against black depth, with soft glowing halos where sanding thinned the lacquer.',
        texture_and_material:
          'Mirror-polished surface with no brush marks, crackled eggshell tesserae, flecks of metal leaf, soft sanded transitions between layers.',
        camera_and_composition:
          'Keep the requested framing; forms read as bright shapes emerging from a deep black ground.',
        atmosphere_and_mood:
          'Precious, nocturnal and mysterious, like light found under still water.',
        rendering_and_quality:
          'Glassy polished finish, sanded-through gradations, crisp eggshell inlay edges; no visible strokes or matte areas.',
        key_features:
          'polished black lacquer depth; crushed eggshell inlay; gold and silver leaf; sanded-through amber gradations; images surfacing from within',
      }),
      avoid: [...PAINT_BASE, 'matte surface', 'visible brushstrokes', 'pastel palette'],
      briefs: [
        'Sanded lacquer painting of a pair of phoenixes circling each other in gold leaf and cinnabar red on deep black lacquer, their tails fading into sanded amber, mirror-polished surface. No text or logo.',
        'Sanded lacquer painting of a crescent moon inlaid in crushed eggshell above a black pond with silver-leaf reflections, crackled tesserae glowing from within the polish. No text or logo.',
        'Sanded lacquer painting of an adult herder leading a water buffalo across a rice terrace at dusk, gold leaf water, eggshell highlights on the horns, soft sanded gradations. No text or logo.',
      ],
    },
    {
      name: 'Tonalist Veil Oil',
      domain: 'muted tonal atmospheric oil',
      tags: ['tonalism', 'atmospheric', 'oil'],
      dna: p({
        aesthetic:
          'Tonalist oil painting: thin veils of close-valued color scumbled and rubbed over each other until the scene sinks into a single enveloping hour of haze or dusk.',
        color_and_tone:
          'One dominant tone, grey-green, smoky blue or dusky brown, with every value compressed into a narrow middle range and a single faint warm light.',
        lighting_and_shadow:
          'Diffused twilight or fog light with no hard shadows; forms emerge only as slightly darker or lighter veils.',
        texture_and_material:
          'Thin rubbed and scumbled layers, dragged dry paint over a toned ground, soft weave texture showing through the veils.',
        camera_and_composition:
          'Keep the requested framing; simplify it into a few large soft masses with wide quiet space.',
        atmosphere_and_mood:
          'Hushed, melancholic and dreamlike, a scene remembered rather than seen.',
        rendering_and_quality:
          'Softened edges everywhere, close values, no crisp detail and no saturated color; depth built by layered haze.',
        key_features:
          'single enveloping tone; compressed middle values; scumbled thin veils; one faint warm light; soft lost edges',
      }),
      avoid: [...PAINT_BASE, 'saturated color', 'hard edges', 'high contrast'],
      briefs: [
        'Tonalist oil painting of a lone oak in a misty meadow at twilight, the whole scene veiled in grey-green scumbles, compressed values, one faint warm glow low on the horizon. No text or logo.',
        'Tonalist oil painting of a moored fishing skiff on a still harbor at dusk, smoky blue veils dissolving boat, water and sky into one tone, soft lost edges. No text or logo.',
        'Tonalist oil painting of a solitary farmhouse with a single lit window across a flooded winter field, dusky brown haze, the reflection a slightly lighter veil. No text or logo.',
      ],
    },
  ],
};

export default spec;
