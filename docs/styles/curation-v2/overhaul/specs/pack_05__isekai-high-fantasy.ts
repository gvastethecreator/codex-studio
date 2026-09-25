import type { Dna, Spec } from '../tools/apply';

// Category-wide negatives: the current cards collapse into one hooded youth with a glowing orb in front of a
// portal arch, or into empty sunset landscapes; neutral household tasks must stay household tasks.
const AVOID = [
  'hooded youth holding a glowing orb',
  'glowing portal archway',
  'generic cloaked adventurer',
  'household task turned into a quest or cooking scene',
  'photorealistic rendering',
  'franchise character design',
];

// These are fantasy-anime styles: they redraw the requested subject in the medium and keep what the prompt asked for.
const redraw =
  'Keep the prompt subject, action, setting and camera and redraw them in this fantasy anime finish; a neutral household task stays that task and never becomes a quest, battle or cooking vignette.';

function fa(extra: string, parts: Omit<Dna, 'subject_treatment'>): Dna {
  const { aesthetic, ...rest } = parts;
  return { aesthetic, subject_treatment: `${redraw} ${extra}`, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_05',
  category: '3. Isekai & High Fantasy',
  updates: {
    'SP05-095': {
      name: 'Faded-Line Pale Wash Cel',
      dna: fa(
        'Figures get slender proportions, small calm faces and few internal lines; secondary contours dissolve into the wash while the focal silhouette stays precise.',
        {
          aesthetic:
            'Modern TV anime cel over pale watercolor background boards: thin warm-grey lineart that fades to nothing at outer edges, two-tone cel shading and wide airy painted skies.',
          color_and_tone:
            'Desaturated sage, pale amber and blue-grey at low contrast; whites never pure, blacks lifted to soft slate, one warm accent at most.',
          lighting_and_shadow:
            'High soft daylight from a broad sky, a single cel shadow tier only slightly darker than the base, no rim light and no bloom.',
          texture_and_material:
            'Transparent watercolor granulation in skies and ground, tiny speckled light flecks drifting in the air, clean flat cel fills on figures.',
          camera_and_composition:
            'Keep the requested view; favor small focal figures against large open space, a low horizon and detail thinning toward the frame edges.',
          atmosphere_and_mood:
            'Wistful, unhurried and still, as if time passes slowly around the subject.',
          rendering_and_quality:
            'Lines break and fade selectively, gradients stay smooth and forms stay anatomically stable; restraint instead of effects.',
          key_features:
            'fading warm-grey lineart; pale watercolor background boards; lifted slate blacks; single soft shadow tier; drifting light flecks',
        },
      ),
      avoid: [...AVOID, 'saturated neon color', 'heavy black outlines', 'dramatic rim light'],
      briefs: [
        'Faded-line pale wash cel of an elderly adult elf herbalist kneeling alone in a vast windswept meadow, pressing one blue flower into a blank leather journal, tiny figure against a huge pale watercolor sky, warm-grey lineart fading at the edges, sage and pale amber, drifting light flecks. No text or logo.',
        'Faded-line pale wash cel of a ruined watchtower swallowed by white heather on a hilltop, a single raven on its broken parapet, low horizon, lifted slate shadows, transparent watercolor granulation in the sky and one soft cel shadow tier. No text or logo.',
        'Faded-line pale wash cel of an adult fisherwoman mending a net on a quiet wooden dock in plain morning light, the task shown simply, slender proportions, sage water and blue-grey planks, thin fading contours. No text or logo.',
      ],
    },
    'SP05-099': {
      name: 'Worn Bronze Concentric-Line Cel',
      dna: fa(
        'Silhouettes are weighted forward and low with squared shoulders; do not add a shield, barrier, collar or weapon the prompt did not ask for.',
        {
          aesthetic:
            'Gritty TV-anime cel with heavy dark-brown lineart and nested contour echoes: two or three parallel strokes trace each major outline like growth rings.',
          color_and_tone:
            'Aged bronze, stone grey and earth brown with one small amber accent; a mid-dark key with compressed, never clipped highlights.',
          lighting_and_shadow:
            'Hard low side light catches raised edges in thin bronze rims, while a deep three-tone cel shadow holds the large forms together.',
          texture_and_material:
            'Scuffed dry-brush over the cel fills, chipped-edge highlights and faint scratches read as rendering wear rather than a new material.',
          camera_and_composition:
            'Keep the requested view; a slightly low angle and heavy diagonals push the weight of the subject toward the viewer.',
          atmosphere_and_mood: 'Steadfast and hard-won, a quiet refusal to fall.',
          rendering_and_quality:
            'Firm outer contours, textured midtones and exactly one controlled specular highlight on each focal form.',
          key_features:
            'nested concentric contour echoes; heavy dark-brown lineart; bronze edge rims; three-tone cel shadow; scuffed dry-brush wear',
        },
      ),
      avoid: [...AVOID, 'hero portrait pose', 'shiny new armor'],
      briefs: [
        'Worn bronze concentric-line cel of an adult gate warden bracing a splintered oak door with his whole back against a storm of hail, worm-level angle, heavy dark-brown lineart echoed in nested contour rings around his shoulders, bronze edge rims and three-tone cel shadow. No text or logo.',
        'Worn bronze concentric-line cel of two adult monks hauling a cracked bronze bell up into a belfry on straining ropes, seen from directly below, scuffed dry-brush wear, amber accent on the bell lip, deep stone-grey shadow. No text or logo.',
        'Worn bronze concentric-line cel of an adult farmhand splitting firewood in a snowy yard at dusk, an ordinary chore drawn with weight, axe mid-swing, concentric line echoes along his arms, chipped-edge highlights on the logs. No text or logo.',
      ],
    },
    'SP05-248': {
      name: 'Naturalist Sketchbook Anime Cel',
      dna: fa(
        'Functional structure is spelled out, how a hinge, shell or knot works, with selective detail on the focal object; never add a kitchen, meal or creature carcass.',
        {
          aesthetic:
            "Manga-derived cel painting with a naturalist's eye: fine brown pen lineart describing joints, scales, seams and grain over flat earthy fills with cutaway-diagram clarity.",
          color_and_tone:
            'Earthy moss green, ochre, rust and warm paper neutrals in a mid key, lightly saturated, with small notes of lichen blue.',
          lighting_and_shadow:
            'Even overcast light with a warm reflected bounce under forms and a single cool shadow tone; no dramatic sources.',
          texture_and_material:
            'Pen hatching on shadowed planes, stippled organic surfaces and visible paper tooth under flat watercolor-like fills.',
          camera_and_composition:
            'Keep the requested view; the focal object is centered like a specimen plate with a generous margin and clear overlaps.',
          atmosphere_and_mood:
            'Curious, grounded and companionable, the pleasure of understanding how things work.',
          rendering_and_quality:
            'Crisp pen detail on the focal form and simpler blocks beyond it; every mark explains structure rather than decorating.',
          key_features:
            'fine brown pen lineart; specimen-plate clarity; earthy moss and ochre fills; stippled organic texture; warm reflected bounce',
        },
      ),
      avoid: [...AVOID, 'cooking scene', 'food as default subject', 'annotations or labels'],
      briefs: [
        'Naturalist sketchbook anime cel of an adult ranger kneeling beside a giant armored beetle asleep on a mossy log, measuring its horn with a knotted cord, specimen-plate composition, fine brown pen lineart on every plate and joint, moss and ochre fills, stippled bark. No text or logo.',
        'Naturalist sketchbook anime cel of a rotting stump crowded with shelf fungi and a single copper salamander, close macro view, pen hatching in the crevices, paper tooth under flat washes, warm reflected bounce under each cap. No text or logo.',
        'Naturalist sketchbook anime cel of an adult man darning a wool sock by a cottage window, a plain household task with the needle path and every loop of yarn drawn clearly, earthy rust and lichen-blue palette, no food anywhere. No text or logo.',
      ],
    },
    'SP05-252': {
      name: 'Amber Dusk Rounded Cel',
      dna: fa(
        'Faces and bodies get soft rounded proportions and gentle expressions; do not add food, companions or a campfire the prompt did not name.',
        {
          aesthetic:
            'Cozy TV-anime cel with soft rounded lineart, a blended amber glow and airbrushed twilight gradients, every corner of every shape softened.',
          color_and_tone:
            'Amber, honey and cream in lit areas against twilight blue and dusty violet shadow, a warm-cool split of roughly sixty to forty.',
          lighting_and_shadow:
            'A low warm key wraps around forms from one side and falls off in a soft airbrushed gradient into cool ambient shadow.',
          texture_and_material:
            'Smooth airbrushed gradients, faint paper grain and a gentle diffusion glow laid over the highlights.',
          camera_and_composition:
            'Keep the requested view; relaxed eye-level spacing with a soft vignette pulling attention toward the warm center.',
          atmosphere_and_mood:
            'Comforting, generous and sleepy, the calm at the end of a long day.',
          rendering_and_quality:
            'Rounded clean contours, gentle two-tone shading and a light diffusion filter, with focal edges still readable inside the glow.',
          key_features:
            'rounded soft lineart; amber-to-twilight color split; airbrushed glow falloff; light diffusion filter; cream highlights',
        },
      ),
      avoid: [...AVOID, 'campfire cooking pot', 'banquet table', 'hard black shadows'],
      briefs: [
        'Amber dusk rounded cel of an adult shepherdess leading a flock of plump sheep over a heather ridge, long diagonal line of woolly backs, warm amber key from the low side, twilight-blue shadows, soft rounded lineart and airbrushed falloff. No text or logo.',
        'Amber dusk rounded cel of a sleepy green dragon curled around a haystack in a barn loft, amber light slanting through the plank gaps, dusty violet shadow, diffusion glow on the straw, every shape softened. No text or logo.',
        'Amber dusk rounded cel of an adult grandmother folding patchwork quilts on a bed in a lamplit cottage room, just the chore and the calm, honey and cream highlights, soft vignette, gentle two-tone shading. No text or logo.',
      ],
    },
    'SP05-257': {
      name: 'Slate Twilight Single-Violet Cel',
      dna: fa(
        'Reduce internal detail to a few decisive lines; the violet accent lands on something already in the prompt, never on an added token or prop.',
        {
          aesthetic:
            'Spare cool-toned anime cel: dry economical lineart, broad slate flats and exactly one violet accent that carries all the color in the frame.',
          color_and_tone:
            'Slate, cold blue-grey and ink navy desaturated to near monochrome, broken by a single saturated violet shape.',
          lighting_and_shadow:
            'Low even moon-cool ambient light with one narrow white highlight on the focal edge; shadows are one flat darker slate.',
          texture_and_material:
            'Smooth restrained flats and dry, slightly broken line ends, with no grain and no glow anywhere.',
          camera_and_composition:
            'Keep the requested view; wide horizontal negative space with the focal subject off-center on a strong horizon line.',
          atmosphere_and_mood: 'Wry, poised and quiet, a composed calm with a hint of irony.',
          rendering_and_quality:
            'Sparse detail, exact focal edges and one accent heavy enough to hold the whole frame.',
          key_features:
            'near-monochrome slate palette; single violet accent; dry economical line; wide horizontal negative space; one narrow highlight',
        },
      ),
      avoid: [...AVOID, 'multiple accent colors', 'market stall', 'glow effects'],
      briefs: [
        'Slate twilight single-violet cel of an adult ferryman poling a flat barge across a black mountain lake under a thin moon, tiny figure far left on a long horizon line, near-monochrome slate and ink navy, his violet lantern the only color, dry economical lineart. No text or logo.',
        'Slate twilight single-violet cel of an adult falconer standing on a frozen ridge, the falcon lifting from a violet leather glove, huge band of empty blue-grey sky, one narrow white highlight on the wing, flat darker-slate shadow. No text or logo.',
        'Slate twilight single-violet cel of an adult woman sweeping snow off a cottage doorstep at blue hour, nothing more than the chore, her violet scarf the single accent, wide horizontal negative space, broken dry line ends. No text or logo.',
      ],
    },
    'SP05-258': {
      name: 'Fine-Line Brass Glint Cel',
      dna: fa(
        'Screws, joints and seams of the existing object are drawn with care; do not add toolboxes, extra hands or a workshop.',
        {
          aesthetic:
            'Practical anime cel drawing with hairline mechanical lineart, grounded realistic proportions and small warm brass specular glints on every metal part.',
          color_and_tone:
            'Warm brass, walnut brown and muted olive against clean neutral greys, saturation kept moderate and even.',
          lighting_and_shadow:
            'Soft top light with small localized reflected glints on metal and a calm single-tone cel shadow beneath forms.',
          texture_and_material:
            'Hairline detail on mechanisms, subtle wood grain and tiny brass sparkle points, with flat fills everywhere else.',
          camera_and_composition:
            'Keep the requested view; a slightly elevated three-quarter angle makes the construction of objects easy to read.',
          atmosphere_and_mood:
            'Humble, capable and attentive, the satisfaction of a job done properly.',
          rendering_and_quality:
            'Crisp focal structure and useful rather than decorative detail, with no heavy effects or bloom.',
          key_features:
            'hairline mechanical lineart; brass specular glints; grounded proportions; construction-readable three-quarter angle; calm single-tone shadow',
        },
      ),
      avoid: [...AVOID, 'photorealistic hands', 'product photograph', 'toolbox pile'],
      briefs: [
        'Fine-line brass glint cel of an adult dwarf locksmith on a ladder fitting a brass key into the enormous lock of a castle gate, tiny figure against the huge iron door, hairline mechanical lineart on every tumbler plate, brass specular glints, walnut and olive palette. No text or logo.',
        'Fine-line brass glint cel of a clockwork brass owl perched on a stone windowsill with a hatch open in its chest showing gears, elevated three-quarter view, tiny sparkle points on each cog, calm single-tone shadow. No text or logo.',
        'Fine-line brass glint cel of an adult man tightening a squeaky hinge on a pantry cupboard door with a screwdriver, a small household repair kept small, grounded proportions, hairline screws and wood grain, brass glint on the hinge. No text or logo.',
      ],
    },
    'SP05-259': {
      name: 'Picture-Book Crayon Line Anime',
      dna: fa(
        'Figures simplify to soft rounded silhouettes with tiny dot features while keeping their age and identity; do not add crowns or castles.',
        {
          aesthetic:
            'Fable-like anime drawn as a picture book: wobbly colored-pencil lineart, flat crayon-textured fills and simplified rounded shapes with small dot eyes.',
          color_and_tone:
            'Warm ochre, soft coral, cream and gentle blue-green shadows at mid saturation, with paper white showing through the color.',
          lighting_and_shadow:
            'Flat soft light and minimal shading: one pale shadow shape under each form instead of modeled volume.',
          texture_and_material:
            'Visible waxy crayon strokes following the form, colored-pencil hatching and cream paper tooth between strokes.',
          camera_and_composition:
            'Keep the requested view; flattened picture-book staging with clear scale contrast and plenty of plain space.',
          atmosphere_and_mood: 'Tender and quietly brave, earnest as a bedtime story.',
          rendering_and_quality:
            'Simple silhouettes, uneven hand-drawn line weight and deliberate gaps in the coloring, never polished digital gloss.',
          key_features:
            'wobbly colored-pencil line; waxy crayon fills; dot eyes and rounded bodies; flat picture-book staging; paper tooth showing',
        },
      ),
      avoid: [...AVOID, 'glossy digital shading', 'detailed sparkling anime eyes'],
      briefs: [
        'Picture-book crayon line anime of a tiny adult knight in oversized armor looking up at a gentle hill giant sitting cross-legged, extreme scale contrast, wobbly colored-pencil lineart, waxy ochre and coral crayon fills, dot eyes, paper tooth showing. No text or logo.',
        'Picture-book crayon line anime of a small frog with an acorn-cap hat sitting on a lily pad in a castle moat under a huge round moon, flat staging, blue-green crayon water, one pale shadow shape under the pad. No text or logo.',
        'Picture-book crayon line anime of an adult woman knitting a long striped scarf in a rocking chair, the scarf spilling across the floor, an ordinary evening with no adventure, rounded shapes, deliberate gaps in the coloring. No text or logo.',
      ],
    },
    'SP05-260': {
      name: 'Candy Pastel Bloom Cel',
      dna: fa(
        'Figures get large bright eyes, glossy hair highlights and clean costume shapes; do not add a banquet, crowd or idol lineup.',
        {
          aesthetic:
            'Polished mobile-game splash-art cel in candy pastels: crisp soft colored lineart, glossy two-tone shading and a luminous bloom pass over highlights.',
          color_and_tone:
            'Mint, blush pink, lilac and buttery cream with white-hot highlights, bright and high-key, shadows tinted lavender instead of grey.',
          lighting_and_shadow:
            'Broad frontal light with a soft bloom halo around highlights and small sparkles on glossy edges.',
          texture_and_material:
            'Smooth cel fills, satin gloss bands on hair and fabric and floating petal-like light specks.',
          camera_and_composition:
            'Keep the requested view; a centered subject with airy spacing and a soft pastel gradient behind it.',
          atmosphere_and_mood: 'Joyful, sweet and abundant, festive without needing a party.',
          rendering_and_quality:
            'Colored lineart instead of black, clean color separation and a controlled bloom that never washes out form.',
          key_features:
            'candy pastel palette; colored lineart; lavender-tinted shadows; satin gloss bands; soft bloom halo',
        },
      ),
      avoid: [...AVOID, 'dark gritty palette', 'black outlines', 'banquet table'],
      briefs: [
        'Candy pastel bloom cel of an adult unicorn keeper brushing the long lilac mane of a unicorn in a meadow of blush blossoms, centered composition, colored lineart, satin gloss bands on the mane, lavender-tinted shadows and a soft bloom halo. No text or logo.',
        'Candy pastel bloom cel of a floating island castle with ribbon-like waterfalls spilling into a mint sky, seen from a steep low angle, buttery cream towers, white-hot highlights, floating petal specks. No text or logo.',
        'Candy pastel bloom cel of an adult young man ironing a white shirt on a board in a sunny room, just a household chore made sweet, mint and blush palette, glossy two-tone shading, sparkles on the iron edge. No text or logo.',
      ],
    },
    'SP05-091': {
      name: 'Cyan Crystal-Facet Glow Cel',
      dna: fa(
        'Surfaces keep their real material; the crystal logic lives only in edge highlights and planes of light, never turning objects into glass.',
        {
          aesthetic:
            'Airy digital anime cel with crystalline edge breaks: forms are rimmed by thin faceted highlights and layered with translucent cyan planes of light.',
          color_and_tone:
            'Cyan, ice blue and pearl white with a small blush-pink accent; high-key, cool and clean throughout.',
          lighting_and_shadow:
            'Broad cool ambient light, crisp refraction-like highlight shards along edges and a restrained cyan bloom.',
          texture_and_material:
            'Smooth digital gradients, pinpoint prismatic glints and faint hexagonal sparkle particles floating in the air.',
          camera_and_composition:
            'Keep the requested view; depth is built from overlapping translucent planes and an open, calm perspective.',
          atmosphere_and_mood: 'Luminous, tender and spacious, like cold clear morning air.',
          rendering_and_quality:
            'Clean tapered cel edges, soft transitions, sharp glints and controlled glow, with no interface elements anywhere.',
          key_features:
            'faceted crystal edge highlights; translucent cyan planes; pearl-white high key; prismatic pinpoint glints; restrained cyan bloom',
        },
      ),
      avoid: [
        ...AVOID,
        'HUD elements',
        'game menu',
        'everything turned to glass',
        'glass pavilion',
      ],
      briefs: [
        'Cyan crystal-facet glow cel of an adult ice sorceress stepping barefoot across the face of a frozen waterfall, vertical composition, thin faceted highlights rimming her silhouette, translucent cyan planes layered behind her, pearl-white high key. No text or logo.',
        'Cyan crystal-facet glow cel of a white stag standing in a snowbound birch forest at dawn, refraction-like highlight shards along its antlers, hexagonal sparkle particles in the air, a single blush-pink accent in the sky. No text or logo.',
        'Cyan crystal-facet glow cel of an adult woman rinsing glass jars at a stone sink by a window, an everyday chore that stays a chore, cyan light planes on the water, prismatic pinpoint glints on the jar rims, restrained bloom. No text or logo.',
      ],
    },
    'SP05-092': {
      name: 'Violet Echo-Line Gothic Cel',
      dna: fa(
        'Echo lines trail existing forms by a small offset and fade out; never duplicate the subject into a second figure.',
        {
          aesthetic:
            'Ornate dark anime cel in which each focal contour is echoed by fine silver after-image lines, as if the moment had been drawn several times over.',
          color_and_tone:
            'Deep violet, slate and ink black in a low cold key, with silver and pale lilac reserved for the echoes.',
          lighting_and_shadow:
            'Narrow silver rim light and faint repeated glints along the echo lines while large planes sink into violet shadow.',
          texture_and_material:
            'Ribbon-fine brush lines, translucent layered washes and subtle grain held inside the darks.',
          camera_and_composition:
            'Keep the requested view; nested curves and repeated spacing lead the eye inward toward the focal form.',
          atmosphere_and_mood: 'Hushed, ornate and uneasy, a moment that feels already lived.',
          rendering_and_quality:
            'Crisp focal contour, softly lost secondary edges and echo lines decreasing in opacity outward.',
          key_features:
            'silver after-image echo lines; violet-slate low key; narrow silver rims; ribbon-fine brush line; fading repetition',
        },
      ),
      avoid: [...AVOID, 'doubled character', 'gore'],
      briefs: [
        'Violet echo-line gothic cel of an adult clock keeper hauling on the chain of an enormous pendulum inside a crumbling bell tower, the swinging pendulum trailed by fading silver after-image lines, deep violet and ink black, narrow silver rim light. No text or logo.',
        'Violet echo-line gothic cel of a spiral of pale moths circling an iron candle chandelier in a vaulted crypt, seen from below, each wing echoed by ribbon-fine silver lines, nested curves drawing the eye upward. No text or logo.',
        'Violet echo-line gothic cel of an adult violinist playing alone in a roofless ruined ballroom under falling ash, the bow arm echoed three times in lilac lines, softly lost background edges, subtle grain in the darks. No text or logo.',
      ],
    },
    'SP05-093': {
      name: 'Sepia Moss Dry-Brush Cel',
      dna: fa(
        'Figures stay cleanly cel-shaded while their surroundings get painterly depth; do not add a road, a staff or a traveling party.',
        {
          aesthetic:
            'Film-quality anime with painterly background art: dry-brush contour accents, detailed sepia and moss landscapes and pale open skies behind clean cel figures.',
          color_and_tone:
            'Earthy sepia, moss green, ink blue and parchment, with pale sky values keeping the whole image open.',
          lighting_and_shadow:
            'Diffused daylight with long gentle value shifts and atmospheric perspective that fades distant forms toward blue.',
          texture_and_material:
            'Dry pigment breaks, paper grain and transparent wash edges in the painted background, flat clean fills on figures.',
          camera_and_composition:
            'Keep the requested view; generous depth with foreground, middle and far planes separated by air.',
          atmosphere_and_mood:
            'Curious and quietly expansive, the sense of a big world just past the frame.',
          rendering_and_quality:
            'Painterly background with tactile detail, crisp cel figures and dry-brush lines only where they clarify form.',
          key_features:
            'painterly sepia-moss backgrounds; dry-brush contour accents; atmospheric blue fade; clean cel figures; parchment highlights',
        },
      ),
      avoid: [...AVOID, 'map labels', 'road party'],
      briefs: [
        'Sepia moss dry-brush cel of a string of laden pack mules climbing a cliff switchback toward a monastery perched on a rock spire, tiny clean cel figures, painterly sepia rock, pale open sky, distant peaks fading to ink blue. No text or logo.',
        'Sepia moss dry-brush cel of a ruined aqueduct striding across a moss-green valley with sheep grazing under its arches, three planes separated by air, dry pigment breaks on the stone, parchment highlights. No text or logo.',
        'Sepia moss dry-brush cel of an adult roofer patching the thatch of a farmhouse with fresh straw bundles, a plain repair job, crisp cel figure against painterly moss hills, atmospheric blue fade behind. No text or logo.',
      ],
    },
    'SP05-094': {
      name: 'Springy Comic-Timing Cel',
      dna: fa(
        'Exaggerate faces and poses, blank stares, sweat drops and flailing limbs, only around action already in the prompt; do not add a party or tavern.',
        {
          aesthetic:
            'Comedy TV-anime cel with elastic lineart, exaggerated deadpan faces and punchy flat shapes caught on the beat just after the gag lands.',
          color_and_tone:
            'Cheerful yellow, coral and aqua flats over clean mid-values; bright, simple and low in shadow density.',
          lighting_and_shadow:
            'Flat bright light with one hard cel shadow tier and quick value pops placed for emphasis.',
          texture_and_material:
            'Smooth flat fills, brisk brush flicks, speed marks and simple symbol effects drawn as shapes, never as text.',
          camera_and_composition:
            'Keep the requested view; an off-center focal point and slightly tilted framing give comic imbalance.',
          atmosphere_and_mood: 'Light, dry and comic, a beat of awkward silence.',
          rendering_and_quality:
            'Simple readable forms, sharp accents and springy line variation, with no excess effects.',
          key_features:
            'elastic springy lineart; deadpan exaggerated faces; yellow-coral-aqua flats; sweat-drop symbol shapes; post-gag pause timing',
        },
      ),
      avoid: [...AVOID, 'lewd gag', 'speech bubbles', 'tavern'],
      briefs: [
        'Springy comic-timing cel of an adult wizard whose grand fireball fizzles into a single sad puff of smoke while a goblin opposite him shrugs, deadpan faces, sweat-drop shapes, yellow-coral-aqua flats, tilted framing, the silence after the gag. No text or logo.',
        'Springy comic-timing cel of an adult knight stuck head-first in a wine barrel, armored legs kicking, speed marks and elastic lineart, one hard cel shadow tier, off-center composition. No text or logo.',
        'Springy comic-timing cel of an adult woman losing a wrestling match with a fitted bedsheet that refuses to fold, a household chore kept a chore, flailing elastic limbs, blank stare, bright flat colors. No text or logo.',
      ],
    },
    'SP05-098': {
      name: 'Rounded Sky-Blue Friendly Cel',
      dna: fa(
        'Round off corners and group small details into friendly shapes; do not add a mascot creature, a crowd or banners.',
        {
          aesthetic:
            'Bright friendly anime cel with rounded silhouettes, simplified volumes and clean sky-blue accents set against warm cream.',
          color_and_tone:
            'Clear sky blue, warm cream, soft grass green and sandy earth, saturated but gentle and evenly balanced.',
          lighting_and_shadow:
            'Even diffuse daylight with soft round highlights describing volume and pale blue shadows.',
          texture_and_material:
            'Smooth cel shading and satin highlights with almost no surface noise or grain.',
          camera_and_composition:
            'Keep the requested view; uncluttered spacing with repeated rounded shapes leading to the focal point.',
          atmosphere_and_mood:
            'Optimistic, generous and easygoing, a world where everyone gets along.',
          rendering_and_quality:
            'Stable silhouettes, soft shadow edges and clean color blocking with every corner rounded.',
          key_features:
            'rounded silhouettes; sky-blue accents on cream; soft round highlights; pale blue shadows; uncluttered color blocks',
        },
      ),
      avoid: [...AVOID, 'slime mascot', 'kingdom crowd', 'sharp angular shapes'],
      briefs: [
        'Rounded sky-blue friendly cel of an adult farmer and a round stone golem planting a sapling together on a hilltop, the golem twice her height, rounded silhouettes, sky-blue accents on cream, soft round highlights, pale blue shadows. No text or logo.',
        'Rounded sky-blue friendly cel of a gentle sea serpent arching over a harbor of round-roofed cottages, its coils forming repeated rounded shapes, clear sky blue and sandy earth, satin highlights on its scales. No text or logo.',
        'Rounded sky-blue friendly cel of an adult man hanging a wooden birdhouse on a garden tree, an easy weekend task, uncluttered color blocks, warm cream bark, soft shadow edges. No text or logo.',
      ],
    },
    'SP05-100': {
      name: 'Vertical Mineral Amber Cel',
      dna: fa(
        'Forms are articulated by tall facet-like value shifts; do not add a dungeon corridor, lantern or monster.',
        {
          aesthetic:
            'Luminous anime cel built from tall mineral-like planes: vertical facets of value, warm amber point lights and cool teal depth.',
          color_and_tone:
            'Amber and pale gold points of light against cool teal and deep blue-green shadow.',
          lighting_and_shadow:
            'Small warm point highlights with a soft contained glow against cool ambient light, like light caught inside quartz.',
          texture_and_material:
            'Crisp faceted accents, subtle grain and smooth transitions between the vertical planes.',
          camera_and_composition:
            'Keep the requested view; vertically stacked planes and shifts of scale emphasize height.',
          atmosphere_and_mood: 'Hopeful and humble, a small warmth inside something vast.',
          rendering_and_quality:
            'Clean cel edges, layered depth and readable contrast without heavy bloom.',
          key_features:
            'vertical mineral facets; amber point lights; cool teal depth; contained quartz-like glow; stacked vertical planes',
        },
      ),
      avoid: [...AVOID, 'dungeon corridor', 'hallway perspective'],
      briefs: [
        'Vertical mineral amber cel of an adult dwarf miner chiselling at the foot of towering amber crystal columns in a cavern, tiny figure at the bottom of the frame, vertical facets of value, warm point lights, cool teal depth. No text or logo.',
        'Vertical mineral amber cel of an underground waterfall pouring between teal basalt columns, amber glowworms dotting the rock like stars, stacked vertical planes, contained quartz-like glow. No text or logo.',
        'Vertical mineral amber cel of an adult woman lighting candles one by one up a tall stone stairwell at night, a household evening routine, each flame a small amber point, tall facet-like shadows, teal ambient. No text or logo.',
      ],
    },
    'SP05-241': {
      dna: fa(
        'Repeated elements already in the prompt line up at even intervals; never add a map, board, chart or symbols.',
        {
          aesthetic:
            'Precision anime cel organized on an invisible modular grid: forms repeat at measured intervals and align to shared horizontals and verticals.',
          color_and_tone:
            'Indigo, muted gold and small cyan notes over clean neutral greys, with crisp mid-key contrast.',
          lighting_and_shadow:
            'Even top light producing identical short shadows under every repeated form, with no implied screen glow.',
          texture_and_material:
            'Smooth flat fills and exact hard-edged line breaks, with no painterly texture anywhere.',
          camera_and_composition:
            'Keep the requested view; frontal or high orthogonal angles are preferred where alignment and rhythm read clearly.',
          atmosphere_and_mood: 'Orderly and collaborative, many parts moving as one.',
          rendering_and_quality:
            'Sparse balanced graphic marks, stable forms and a clear focal priority inside the repetition.',
          key_features:
            'invisible modular grid; repeated forms at even intervals; identical short shadows; indigo-gold-cyan palette; hard-edged flats',
        },
      ),
      avoid: [...AVOID, 'map table', 'board game', 'group huddled over a table'],
      briefs: [
        'Systemic cooperation grid cel of a line of adult archers drawing in unison along a castle wall, seen from high above, every figure at an even interval with identical short shadows, indigo and muted gold, hard-edged flats. No text or logo.',
        'Systemic cooperation grid cel of an orchard planted in exact rows with adult harvesters on identical ladders passing baskets hand to hand, high orthogonal view, measured spacing, small cyan notes. No text or logo.',
        'Systemic cooperation grid cel of an adult tiler laying square stone tiles across a floor in a precise staggered pattern, a plain home job, frontal top-down view, crisp line breaks, even top light. No text or logo.',
      ],
    },
    'SP05-242': {
      dna: fa(
        'Secondary contours blur into the brushwork while the face or focal gesture stays clear and exposed.',
        {
          aesthetic:
            'Atmospheric painted anime with soft lost edges, layered low contrast and rough earth-toned brushwork, as if seen through settling smoke.',
          color_and_tone:
            'Muted clay, olive, charcoal and dusk blue with compressed values and no pure white or black.',
          lighting_and_shadow:
            'Diffuse side light with broad soft shadows, no rim light and no glow.',
          texture_and_material:
            'Smudged pigment, dragged brush streaks, uneven grain and thumb-blended edges across the whole surface.',
          camera_and_composition:
            'Keep the requested view; tight framing leaves little escape space around the subject.',
          atmosphere_and_mood: 'Quiet, exposed and fragile, tired rather than tragic.',
          rendering_and_quality:
            'A legible focal subject against loosely painted surroundings; texture never turns to mud over the face.',
          key_features:
            'lost smoky edges; clay-olive-charcoal range; smudged dragged brushwork; compressed values; clear exposed focal face',
        },
      ),
      avoid: [...AVOID, 'crisp clean cel', 'bright saturated color', 'heroic pose'],
      briefs: [
        'Smoke-mud vulnerability painting of an adult foot soldier sitting alone in a muddy siege trench, dented helmet in his lap, tight framing, lost smoky edges, clay and charcoal brushwork, only his tired face kept clear. No text or logo.',
        'Smoke-mud vulnerability painting of a riderless warhorse standing head-down in a rain-soaked field after battle, dragged olive and dusk-blue streaks, compressed values, diffuse side light. No text or logo.',
        'Smoke-mud vulnerability painting of an adult washerwoman wringing laundry at a cold river bank, an everyday task with no drama added, thumb-blended edges, muted clay palette, her reddened hands the clear focal gesture. No text or logo.',
      ],
    },
    'SP05-243': {
      dna: fa(
        'Figures take period anatomy, long limbs, sharp jaws and detailed hair clumps, without copying any canon character or ensemble.',
        {
          aesthetic:
            'Late-1980s to early-1990s OVA hand-painted cel: confident color blocks, airbrushed highlights on hair and armor, glossy eye highlights and painted background boards.',
          color_and_tone:
            'Rich saturated color blocks, warm sunset highlights against cool blue-violet shadows, slightly faded like filmed cels.',
          lighting_and_shadow:
            'Strong painted directional light, a two-tone cel shadow plus an airbrushed highlight band on hair and metal.',
          texture_and_material:
            'Fine analog film grain, faint cel dust and soft color bleed at edges over gouache-painted backgrounds.',
          camera_and_composition:
            'Keep the requested view; foreground and distance are separated by layered color planes like a multiplane camera.',
          atmosphere_and_mood: 'Cinematic, earnest and epic in the old analog way.',
          rendering_and_quality:
            'Crisp ink contour, broad controlled shading, restrained grain and the slight softness of cels shot on film.',
          key_features:
            'airbrushed highlight bands; hand-painted cel blocks; gouache background boards; film grain and cel dust; long-limbed period anatomy',
        },
      ),
      avoid: [...AVOID, 'modern digital bloom', 'flat vector look', 'tapestry layout'],
      briefs: [
        'Classic OVA hand-painted cel of an adult sorceress with windblown hair standing on a sea cliff as a burning fleet drifts below at sunset, airbrushed highlight bands on her hair, gouache sky, film grain and cel dust. No text or logo.',
        'Classic OVA hand-painted cel of an adult griffin rider banking past a mountain fortress through airbrushed cumulus clouds, multiplane depth, warm sunset highlights against blue-violet shadow, long-limbed period anatomy. No text or logo.',
        'Classic OVA hand-painted cel of an adult armored swordswoman kneeling beside a stone cairn in a windy highland, cape and grass streaming, two-tone cel shadow with an airbrushed band on the steel, slight filmed softness. No text or logo.',
      ],
    },
    'SP05-244': {
      name: 'Tall Textile-Rhythm Formal Cel',
      dna: fa(
        'Fine repeating line marks run inside existing clothing and surfaces; do not add ceremonial dress, a court or a throne.',
        {
          aesthetic:
            'Formal anime cel shaped by tall vertical rhythms and textile-like repeating line patterns, ornament balanced as carefully as woven cloth.',
          color_and_tone:
            'Muted indigo, parchment and restrained cinnabar with small gold notes, composed in a quiet mid key.',
          lighting_and_shadow:
            'Even deliberate light with small precise highlights on ornament and shallow flat shadows.',
          texture_and_material:
            'Fine repeated brocade-like strokes and restrained fabric texture used as surface treatment, not as a material change.',
          camera_and_composition:
            'Keep the requested view; tall vertical spacing and near-symmetry, with tall narrow framing when the prompt leaves it open.',
          atmosphere_and_mood: 'Solemn and poised, destiny felt as stillness.',
          rendering_and_quality:
            'Sparse, even-scale ornament, clean edges and a consistent detail scale across the image.',
          key_features:
            'tall vertical rhythm; brocade-like repeating line pattern; indigo-parchment-cinnabar palette; near symmetry; precise ornament highlights',
        },
      ),
      avoid: [...AVOID, 'throne room', 'photographed fabric', 'product shot'],
      briefs: [
        'Tall textile-rhythm formal cel of an adult scholar-official walking the length of a vermilion colonnade in light rain, tall narrow framing, columns repeating like warp threads, brocade-like line pattern in her robe, indigo and cinnabar. No text or logo.',
        'Tall textile-rhythm formal cel of a qilin standing motionless between tall pine trunks in morning mist, near symmetry, fine repeated strokes on its scales, parchment sky, small gold notes. No text or logo.',
        'Tall textile-rhythm formal cel of an adult weaver warping a tall upright loom in a plain room, the daily work only, vertical threads setting the rhythm, shallow flat shadows, precise ornament highlights. No text or logo.',
      ],
    },
    'SP05-245': {
      name: 'Carmine Angular Windswept Cel',
      dna: fa(
        'Pointed chins, narrow noses and hair and cloth swept in one direction; motion follows the prompt action and no battle is added.',
        {
          aesthetic:
            '1990s action-romance anime cel with sharp angular features, long tapered strokes and everything, hair, cloth and grass, caught in one hard wind.',
          color_and_tone:
            'Carmine red accents slicing through cool blue-grey and slate in high contrast.',
          lighting_and_shadow:
            'Hard directional edge light with crisp shadow breaks under one bright open sky.',
          texture_and_material:
            'Smooth fills with dry-brush wind streaks and tapered hatching along cloth folds.',
          camera_and_composition:
            'Keep the requested view; strong tilted diagonals and overlapping angled shapes carry the motion.',
          atmosphere_and_mood: 'Emotionally forward and dramatic, longing carried on the wind.',
          rendering_and_quality:
            'Clear silhouettes, crisp edges and few but decisive tapered marks.',
          key_features:
            'carmine accents; angular 1990s features; one-direction wind sweep; long tapered strokes; tilted diagonals',
        },
      ),
      avoid: [...AVOID, 'tarot card', 'mecha copy', 'weapon-first pose'],
      briefs: [
        'Carmine angular windswept cel of an adult swordsman leaping the gap between two jagged cliff peaks, carmine cape snapping behind him, strong tilted diagonal, angular 1990s features, dry-brush wind streaks. No text or logo.',
        'Carmine angular windswept cel of an adult woman clinging to the mast of a storm-tossed airship, sails and hair torn in one direction, carmine sash against slate cloud, hard edge light. No text or logo.',
        'Carmine angular windswept cel of a field of ripe wheat flattened by a gale around a lone scarecrow with a carmine rag, long tapered strokes following the wind, blue-grey sky, high contrast. No text or logo.',
      ],
    },
    'SP05-246': {
      name: 'Jewel Arabesque Curve Cel',
      dna: fa(
        'Arabesque linework decorates existing surfaces; do not add markets, caravans, deserts or labyrinths.',
        {
          aesthetic:
            'Ornamented anime cel led by jewel color and arabesque curves: contours flow in elegant S-arcs and fine decorative line rhythms sit inside shapes.',
          color_and_tone: 'Jewel blue, turquoise, amber and saffron in a rich warm-cool balance.',
          lighting_and_shadow:
            'Warm light rolls over curved planes with sparse, sharp jewel-point specular stars.',
          texture_and_material:
            'Smooth painted color with fine gold-line ornament and an enamel-like tile shine.',
          camera_and_composition:
            'Keep the requested view; flowing S-curve spacing guides the eye through the frame.',
          atmosphere_and_mood: 'Graceful, warm and lively, like music in motion.',
          rendering_and_quality:
            'Rich but controlled color with delicate line detail sitting over clean cel shapes.',
          key_features:
            'arabesque S-curve contours; jewel blue and turquoise; fine gold-line ornament; jewel-point specular stars; enamel tile shine',
        },
      ),
      avoid: [...AVOID, 'market aisle', 'camel caravan', 'desert default'],
      briefs: [
        'Jewel arabesque curve cel of an adult djinn uncoiling in a turquoise smoke S-curve from a fountain in a tiled courtyard, enamel tile shine, fine gold-line ornament on his bracers, jewel-point specular stars. No text or logo.',
        'Jewel arabesque curve cel of an adult carpet flier gliding over domed rooftops at dusk, the carpet rippling in an S-arc, jewel blue sky, saffron domes, warm light rolling over curved planes. No text or logo.',
        'Jewel arabesque curve cel of an adult potter painting turquoise glaze arabesques on a tall jar at her wheel, a quiet day of work, flowing curves echoing the brush, amber and jewel blue palette. No text or logo.',
      ],
    },
    'SP05-249': {
      name: 'Indigo Block-Print Cel',
      dna: fa(
        'Simplify forms into clear masses with selective etched line detail; never turn the subject into printed pages or add a press.',
        {
          aesthetic:
            'Anime cel painting crossed with relief printing: inky indigo blocks, fine hatchwork, cream paper grain and slightly off-register edges.',
          color_and_tone:
            'Cream, deep indigo and restrained amber, limited to two or three flat inks.',
          lighting_and_shadow:
            'Flat broad light with graphic shadow shapes carved as solid indigo ink.',
          texture_and_material:
            'Fine hatch marks, cream paper grain, ink squash at block edges and a small misregistration between colors.',
          camera_and_composition:
            'Keep the requested view; bold flat masses are balanced against small detailed areas.',
          atmosphere_and_mood: 'Quietly studious and devoted, patient work by lamplight.',
          rendering_and_quality:
            'Clean block boundaries, controlled hatching and visible print texture throughout.',
          key_features:
            'inky indigo blocks; cream paper grain; fine hatchwork; slight off-register edges; amber accent ink',
        },
      ),
      avoid: [...AVOID, 'readable pages', 'printing press prop'],
      briefs: [
        'Indigo block-print cel of an adult bookbinder stitching the spine of a thick leather codex by candlelight, blank pages, solid indigo shadow shapes, fine hatchwork on the leather, one amber accent ink for the flame. No text or logo.',
        'Indigo block-print cel of a flock of cranes lifting off an indigo river beside a walled town, bold flat masses of water, cream paper grain in the sky, slight off-register edges on the wings. No text or logo.',
        'Indigo block-print cel of an adult dyer hanging long indigo-dyed cloths to dry on poles in a courtyard, just the daily work, ink squash at block edges, cream and indigo with a touch of amber. No text or logo.',
      ],
    },
    'SP05-250': {
      name: 'Grounded Matte Geometry Cel',
      dna: fa(
        'Simplify secondary detail and let the subject settle into stable geometric shapes; add no religion, halos or temples.',
        {
          aesthetic:
            'Quiet anime cel with matte painted planes organized by simple geometry, squares, triangles and verticals, under broad gentle light.',
          color_and_tone:
            'Natural earth tones, pale gold and muted blue-grey, matte and low in saturation.',
          lighting_and_shadow:
            'Broad soft morning light with no rays or halos and a single soft shadow tier.',
          texture_and_material:
            'Matte gouache-like planes, fine grain and clean transitions between edges.',
          camera_and_composition:
            'Keep the requested view; centered symmetrical balance and steady horizontals.',
          atmosphere_and_mood: 'Calm, ethical and steady, a promise quietly kept.',
          rendering_and_quality: 'Clean silhouettes, gentle shadows and a modest amount of detail.',
          key_features:
            'matte gouache planes; simple stable geometry; pale gold and blue-grey; no rays or halos; centered balance',
        },
      ),
      avoid: [...AVOID, 'god rays', 'halo', 'temple hallway', 'stone bridge at sunset'],
      briefs: [
        'Grounded matte geometry cel of an adult knight in plain plate armor sitting on a square stone step in snow beside a grey wolf, centered symmetrical balance, matte gouache planes, pale gold morning light, no rays. No text or logo.',
        'Grounded matte geometry cel of a square stone watchtower on a flat rocky plateau with a single triangular fir, steady horizon, blue-grey sky, one soft shadow tier. No text or logo.',
        'Grounded matte geometry cel of an adult man sharpening a knife on a whetstone at a plain wooden table, a household chore only, the table, stone and blade forming simple verticals and rectangles, earth tones. No text or logo.',
      ],
    },
    'SP05-253': {
      name: 'Glass-Green High-Key Herbarium Cel',
      dna: fa(
        'Veinlike strokes echo existing contours only; never add plants, a laboratory or bookshelves.',
        {
          aesthetic:
            'Refined high-key anime cel with glass-green translucence and delicate veinlike linework, like a pressed-specimen plate under clear light.',
          color_and_tone:
            'Glass green, pale cream and muted gold in a high key where whites dominate.',
          lighting_and_shadow:
            'Soft high-key daylight with clean reflected highlights and no visible glow source.',
          texture_and_material:
            'Transparent layered washes, fine vein detail and tidy painted surfaces.',
          camera_and_composition:
            'Keep the requested view; orderly spacing with plenty of pale ground around the subject.',
          atmosphere_and_mood: 'Serene, clean and composed, like cool air in the morning.',
          rendering_and_quality:
            'Thin crisp contours over transparent washes with minimal bloom and no clutter.',
          key_features:
            'glass-green translucence; veinlike linework; high-key cream ground; transparent washes; muted gold accents',
        },
      ),
      avoid: [...AVOID, 'laboratory room', 'crowded table', 'dark low key'],
      briefs: [
        'Glass-green high-key herbarium cel of an adult court apothecary holding a green glass vial up to a tall window, glass-green translucence through the vial onto her sleeve, veinlike linework on her gloves, high-key cream ground. No text or logo.',
        'Glass-green high-key herbarium cel of a row of glass bell jars on a garden wall, each sheltering a single fern frond, orderly spacing, transparent washes, muted gold on the jar rims. No text or logo.',
        'Glass-green high-key herbarium cel of an adult man repotting a leggy fern at a sunlit windowsill, a small household task, thin crisp contours over transparent green washes, lots of pale ground. No text or logo.',
      ],
    },
    'SP05-254': {
      name: 'Lavender Halo-Arc Shoujo Cel',
      dna: fa('Arcs follow existing contours; add no portals, sigils or school uniforms.', {
        aesthetic:
          'Early-1990s shoujo fantasy cel: tall slender figures, large sparkling eyes, flowing hair and ornamental halo-like value rings arcing behind focal forms.',
        color_and_tone:
          'Lavender, deep blue and selective warm red in clean melodramatic contrast.',
        lighting_and_shadow:
          'Soft rim light and luminous ring-shaped value accents that stay graphic rather than glowing.',
        texture_and_material:
          'Smooth cel fills, star-shaped sparkle marks and fine flower-like screen accents.',
        camera_and_composition:
          'Keep the requested view; curved spacing and arcs frame the focal emphasis.',
        atmosphere_and_mood: 'Tender and melodramatic, a heartbeat before a confession.',
        rendering_and_quality:
          'Clear silhouettes, fine ornament and controlled bloom around the focal forms.',
        key_features:
          'halo-like value rings; lavender and deep blue; large sparkling eyes; star sparkle marks; flowing hair arcs',
      }),
      avoid: [...AVOID, 'school uniform', 'readable sigil', 'shrine hallway'],
      briefs: [
        'Lavender halo-arc shoujo cel of an adult woman releasing a white dove from cupped hands under a star-filled sky, halo-like value rings arcing behind her head, large sparkling eyes, flowing hair, star sparkle marks. No text or logo.',
        'Lavender halo-arc shoujo cel of an adult swordswoman seen in the reflection of a still pool, ring accents rippling out from her image, deep blue water, a single warm red ribbon. No text or logo.',
        'Lavender halo-arc shoujo cel of an adult dancer spinning through a field of tall irises, her skirt tracing arcs, soft rim light, flower-like screen accents, tender melodramatic contrast. No text or logo.',
      ],
    },
    'SP05-255': {
      name: 'Gem-Facet Rising-Line Cel',
      dna: fa('Upward line accents follow existing motion; add no team, rescue or vehicle.', {
        aesthetic:
          'Bright 1990s magical-adventure cel with long upward-sweeping lines, clear gem-tone color shifts and faceted gem highlights.',
        color_and_tone:
          'Ruby, sapphire and emerald hues with bright gold, clear and saturated, shifting warm to cool along the lines.',
        lighting_and_shadow:
          'Luminous edge highlights and crisp contained glow, with faceted gem glints on focal points.',
        texture_and_material: 'Smooth cel fills, fine facet breaks and small sparkle accents.',
        camera_and_composition:
          'Keep the requested view; rising diagonals and vertical lift carry the eye upward.',
        atmosphere_and_mood:
          'Buoyant, optimistic and energetic, everything lifting toward the sky.',
        rendering_and_quality:
          'Sharp contours and bright color separation, with glow reserved for small focal accents.',
        key_features:
          'upward-sweeping lines; ruby-sapphire-emerald hues; faceted gem glints; crisp contained glow; rising diagonals',
      }),
      avoid: [...AVOID, 'gem-studded vehicle', 'group lineup', 'readable glyphs'],
      briefs: [
        'Gem-facet rising-line cel of an adult sorceress summoning an emerald serpent that spirals up around her into the sky, long upward-sweeping lines, faceted gem glints on its scales, ruby and gold accents. No text or logo.',
        'Gem-facet rising-line cel of a great winged lion bursting up out of a sapphire sea, feathers tipped with faceted highlights, rising diagonal from bottom left, crisp contained glow. No text or logo.',
        'Gem-facet rising-line cel of an adult woman shaking a rug out of a balcony window, the dust rising in sparkling ruby and sapphire lines, an ordinary spring-cleaning moment, sharp contours. No text or logo.',
      ],
    },
    'SP05-096': {
      name: 'Hyper-Saturated Impossible Perspective Cel',
      dna: fa(
        'Keep subjects recognizable and fold the perspective around them without adding cards, chess pieces or dice.',
        {
          aesthetic:
            'High-saturation digital anime with candy-neon color planes, chromatic aberration fringes and deliberately impossible, tilted perspective.',
          color_and_tone:
            'Magenta, cyan and yellow on dark violet, oversaturated with rainbow-shifted edges.',
          lighting_and_shadow:
            'Hard clean highlights, emissive graphic edges and colored rather than grey shadows.',
          texture_and_material:
            'Flat opaque color, polished accents and thin chromatic fringing on contours.',
          camera_and_composition:
            'Keep the framing but bend the perspective: several vanishing points, floating planes and upside-down elements.',
          atmosphere_and_mood: 'Bold, cerebral and kinetic, a world that plays by other rules.',
          rendering_and_quality:
            'Sharp silhouettes that stay readable despite the distortion, with clean color separation.',
          key_features:
            'candy-neon planes; chromatic aberration fringes; multiple vanishing points; colored shadows; floating inverted elements',
        },
      ),
      avoid: [...AVOID, 'chess pieces', 'playing cards', 'dice', 'game UI'],
      briefs: [
        'Hyper-saturated impossible perspective cel of an adult sorcerer standing on a staircase that loops upside down between floating islands, several vanishing points, magenta and cyan planes on dark violet, chromatic fringes on his coat. No text or logo.',
        'Hyper-saturated impossible perspective cel of a castle hanging upside down above a magenta sea with its towers reflected upright, floating planes, emissive yellow edges, colored shadows. No text or logo.',
        'Hyper-saturated impossible perspective cel of an adult man mopping a tiled floor that curves up the walls and over the ceiling, a household chore in a bent room, candy-neon color, sharp readable silhouette. No text or logo.',
      ],
    },
    'SP05-251': {
      name: 'Khaki Compressed-Diagonal Cel',
      dna: fa(
        'Compress shapes where motion is present; add no aircraft, gear, flags or insignia.',
        {
          aesthetic:
            'Compact, forceful military-fantasy anime cel with swept diagonals, crisp silhouettes and clipped high-key contrast, drawn like a newsreel still.',
          color_and_tone:
            'Muted khaki, field grey and deep blue-grey with clean pale highlights, a disciplined limited range.',
          lighting_and_shadow:
            'Hard overcast-sky light with short shadow breaks and a bright sky behind dark compact silhouettes.',
          texture_and_material:
            'Crisp filled shapes, restrained metallic glints and a trace of painted grain.',
          camera_and_composition:
            'Keep the requested view; steep diagonal horizons and directional overlap group the silhouettes.',
          atmosphere_and_mood: 'Tense, disciplined and precise, a held breath before orders.',
          rendering_and_quality:
            'Economical detail, stable contours and strong contrast without overloading the image.',
          key_features:
            'swept diagonals; khaki and field grey; clipped high-key sky; compact silhouettes; newsreel-still stillness',
        },
      ),
      avoid: [...AVOID, 'military insignia', 'flags', 'aircraft'],
      briefs: [
        'Khaki compressed-diagonal cel of an adult officer-mage bracing against a gale on a fortress rampart, greatcoat snapping, steep diagonal horizon, compact dark silhouette against a clipped high-key sky, khaki and field grey. No text or logo.',
        'Khaki compressed-diagonal cel of a wedge of adult war mages flying in formation through torn storm cloud, swept diagonals, short shadow breaks, restrained metallic glints on buckles. No text or logo.',
        'Khaki compressed-diagonal cel of an adult soldier polishing a pair of boots on a barracks cot, an off-duty chore and nothing more, tight diagonal composition, pale highlights, trace of painted grain. No text or logo.',
      ],
    },
    'SP05-097': {
      name: 'Ivory-Charcoal Baroque Symmetry Cel',
      dna: fa(
        'Emphasize major shapes with measured contour and balanced weighty detail; add no throne, army, skulls or architecture.',
        {
          aesthetic:
            'Monumental anime cel painting with baroque bilateral symmetry, heavy value planes and a restrained ornamental silhouette language.',
          color_and_tone:
            'Bone ivory, charcoal and muted brass in a cold limited range with deep values.',
          lighting_and_shadow:
            'Cool controlled light divides large planes and reserves narrow highlights for the focal forms.',
          texture_and_material:
            'Matte shadow masses, smooth enamel-like accents and faint powdery grain in the darks.',
          camera_and_composition:
            'Keep the requested view; formal mirror balance and broad negative space around a central axis.',
          atmosphere_and_mood: 'Severe and composed, a heavy pressure that never turns violent.',
          rendering_and_quality:
            'Detail held within clean edges and deep values, with subtle grain softening the darkest areas.',
          key_features:
            'baroque bilateral symmetry; ivory against charcoal; cold narrow highlights; monumental value planes; powdery grain',
        },
      ),
      avoid: [
        ...AVOID,
        'skeletal ruler',
        'skull pile',
        'cathedral interior default',
        'grey 3D render',
      ],
      briefs: [
        'Ivory-charcoal baroque symmetry cel of a colossal hooded ivory statue straddling a black valley pass, two tiny adult travelers walking between its feet on the central axis, mirror balance, charcoal cliffs, cold narrow highlights. No text or logo.',
        'Ivory-charcoal baroque symmetry cel of an adult noblewoman in black mourning dress seated perfectly centered on a long bench, her veil and sleeves falling in mirrored folds, muted brass clasp, broad dark negative space. No text or logo.',
        'Ivory-charcoal baroque symmetry cel of an adult butler laying silverware along a long dining table seen straight down its axis, a household duty drawn with monumental calm, ivory cloth, charcoal room, powdery grain. No text or logo.',
      ],
    },
    'SP05-247': {
      name: 'Lilac Thorn-Line Chiaroscuro Cel',
      dna: fa(
        'Fine branching strokes may echo existing contours but must not add plants, a cottage or a garden.',
        {
          aesthetic:
            'Luminous botanical anime cel in chiaroscuro: intricate thorny branching contours, lilac highlights and deep brown darkness framing a lit center.',
          color_and_tone:
            'Cool lilac and muted greens against warm cream and deep umber, most of the frame in shadow.',
          lighting_and_shadow:
            'Small warm highlights emerging from cool deep shadow, a soft pool of light around the focal edges.',
          texture_and_material:
            'Fine thorn-like line detail, delicate grain and soft painted color layered in the darks.',
          camera_and_composition:
            'Keep the requested view; dark branching framing values close in around a lit center.',
          atmosphere_and_mood: 'Romantic and quietly uncanny, beauty with thorns.',
          rendering_and_quality:
            'Detailed contours against softly painted distance, precise focal form and restrained glow.',
          key_features:
            'thorny branching contours; lilac glints; umber chiaroscuro framing; lit center; delicate grain',
        },
      ),
      avoid: [...AVOID, 'cottage garden default', 'flower wall'],
      briefs: [
        'Lilac thorn-line chiaroscuro cel of a tall antlered forest spirit bending down to look at an adult woman in a pitch-dark wood, thorny branching contours framing a single pool of light, lilac glints on the antlers, deep umber darkness. No text or logo.',
        'Lilac thorn-line chiaroscuro cel of a hare asleep inside a hollow of black briars at night, the briars drawn as fine thorn lines closing in, soft lilac highlights on its fur, lit center. No text or logo.',
        'Lilac thorn-line chiaroscuro cel of an adult man reading by one candle in a low attic under bundles of drying herbs, a quiet evening at home, warm small highlight in cool shadow, delicate grain. No text or logo.',
      ],
    },
    'SP05-256': {
      name: 'Vermilion Indigo Tapered-Ink Cel',
      dna: fa(
        'Flowing tapered marks describe existing movement rather than a pursuit; add no shrine, well, sword or talisman.',
        {
          aesthetic:
            'Folkloric 1990s anime cel with tapered brush-ink contours, warm vermilion accents and faded indigo dusk values, as if the cels were slightly sun-faded.',
          color_and_tone:
            'Vermilion, cream, muted indigo and charcoal in nostalgic, slightly faded contrast.',
          lighting_and_shadow:
            'Soft dusk-like shadow and restrained warm edge light, without requiring night or a new source.',
          texture_and_material:
            'Faded cel color, tapering brush lines that swell and thin, and subtle grain.',
          camera_and_composition:
            'Keep the requested view; gentle horizontal rhythm with long flowing contours.',
          atmosphere_and_mood: 'Nostalgic and mythic, a story told at dusk.',
          rendering_and_quality:
            'A focal silhouette sharp enough to read through the soft color fade and low-contrast detail.',
          key_features:
            'tapered brush-ink contours; vermilion accents; faded indigo dusk; sun-faded cel color; horizontal flow',
        },
      ),
      avoid: [...AVOID, 'red-robed character copy', 'shrine hallway', 'readable talisman'],
      briefs: [
        'Vermilion indigo tapered-ink cel of an adult archer drawing a longbow on a hill of silver pampas grass at dusk, vermilion sleeve the only warm note, tapered brush contours flowing along the grass, faded indigo sky. No text or logo.',
        'Vermilion indigo tapered-ink cel of a many-tailed fox spirit leaping across a moonlit rice paddy, tails trailing in long horizontal brush strokes, sun-faded cel color, vermilion tail tips. No text or logo.',
        'Vermilion indigo tapered-ink cel of an adult woman beating a futon over a veranda rail on a late afternoon, a household chore only, dust drifting in soft dusk shadow, swelling and thinning ink lines. No text or logo.',
      ],
    },
  },
};

export const aliases = {
  'SP05-095': 'Frieren – Afterquest Melancholy Fantasy',
  'SP05-099': 'Shield Hero – Defensive Underdog Fantasy',
  'SP05-248': 'Delicious in Dungeon - Stove-Top Monster Cuisine',
  'SP05-252': 'Campfire Cooking in Another World - Merchant Road Stew',
  'SP05-257': 'Tsukimichi - Moonlit Merchant Wanderer',
  'SP05-258': 'Handyman Saitou in Another World - Toolbox Party Quest',
  'SP05-259': 'Ranking of Kings - Storybook Crown Courage',
  'SP05-260': 'Princess Connect! Re:Dive - Banquet Quest Pastel',
  'SP05-091': 'Sword Art Online – Glowing VR Adventure',
  'SP05-092': 'Re:Zero – Reset-Loop Dark Fantasy',
  'SP05-093': 'Mushoku Tensei – Wandering Mage Chronicle',
  'SP05-094': 'Konosuba – Party-Quest Comedy',
  'SP05-098': 'Slime Isekai – Monster-Nation Bright Fantasy',
  'SP05-100': 'DanMachi – Dungeon Lantern Adventure',
  'SP05-244': 'The Twelve Kingdoms - Imperial Destiny Chronicle',
  'SP05-245': 'The Vision of Escaflowne - Windblown Tarot Fantasy',
  'SP05-246': 'Magi - Labyrinth Jewel Caravan',
  'SP05-249': 'Ascendance of a Bookworm - Printing Press Devotion',
  'SP05-250': 'The Faraway Paladin - Quiet Temple Quest',
  'SP05-253': "The Saint's Magic Power Is Omnipotent - Herbarium Court Glow",
  'SP05-254': 'Fushigi Yuugi - Celestial Maiden Portal Epic',
  'SP05-255': 'Magic Knight Rayearth - Gem-Engine Rescue Quest',
  'SP05-096': 'No Game No Life – Hyper-Saturated Strategy Fantasy',
  'SP05-251': 'Saga of Tanya the Evil - Aerial War Mage Doctrine',
  'SP05-097': 'Overlord – Bone Throne Dark Dominion',
  'SP05-247': "The Ancient Magus' Bride - Thorn Cottage Enchantment",
  'SP05-256': 'Inuyasha - Shrine-Well Sengoku Pursuit',
};

export default spec;
