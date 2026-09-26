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
        "Visiting the grave of a dwarf friend who died two centuries ago, an ageless elf mage in a faded cloak brushes moss off the stone and sets down the same cheap sweet they shared on their first quest. No readable text or logo.",
        "An old dwarf blacksmith and a young priest argue gently about the best way to fold a map while their elf companion quietly watches clouds drift over a pale meadow. No readable text or logo.",
        "On a quiet hilltop at dawn, a small bronze statue of a long-forgotten party of heroes stands half hidden by tall grass and wildflowers. No readable text or logo.",
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
        "Bracing a dented bronze pot lid against a stampede of armored boars, a stubborn village cook in a leather apron holds the line while rings of impact ripple out across the muddy square behind her. No readable text or logo.",
        "Falsely accused and covered in flour, a baker sits outside the town gate sharpening a bread knife while a stray dog loyally shares his blanket. No readable text or logo.",
        "A battered bronze shield leans against a tavern wall at night, dents catching the warm lamplight like scars on a face. No readable text or logo.",
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
        "Crouched beside a dungeon campfire, a scholarly adventurer sketches the anatomy of a giant walking mushroom in her notebook while her companion quietly slices its cap into a bubbling stew pot. No readable text or logo.",
        "Four tired adventurers argue over whether a slime can be dried like fruit, the specimen wobbling indignantly on a drying rack between them. No readable text or logo.",
        "In a quiet dungeon corridor, a neatly labeled row of monster spices hangs drying beside a sleeping iron golem. No readable text or logo.",
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
        "Stirring a sizzling pan of garlic mushrooms over a campfire at dusk, a middle-aged office worker in a borrowed cloak laughs as an enormous fluffy lynx politely waits for the first bite. No readable text or logo.",
        "A dragon the size of a barn sulks at the edge of a campsite until someone hands it a tiny skewer of grilled onions. No readable text or logo.",
        "On a flat rock beside a dying campfire, a single glossy rice ball sits on a leaf under the first evening stars. No readable text or logo.",
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
        "Crossing a slate-grey wasteland under a huge moon, an unassuming traveling merchant leads a caravan of polite giant spiders carrying sacks of flour, one violet lantern swinging at the front. No readable text or logo.",
        "A plain-faced shopkeeper haggles calmly with a nervous dragon over the price of a single violet potion bottle. No readable text or logo.",
        "Under a slate twilight sky, a lone violet flower grows from a crack in an abandoned market stall. No readable text or logo.",
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
        "Kneeling beside a cracked magic door in a dungeon corridor, a quiet handyman with a brass toolbox fixes the hinge while an impatient knight, a mage and a thief watch in stunned silence. No readable text or logo.",
        "Squinting through thick glasses in a candlelit workshop, a retired carpenter repairs a knight’s dented helmet with a tiny brass hammer while the knight nervously waits in his underclothes. No readable text or logo.",
        "On a workshop bench at night, a set of brass tools lies neatly arranged beside a half-repaired magic staff. No readable text or logo.",
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
        "Marching up the stairs of a towering pastel castle, a tiny round-faced baker with a crooked paper crown carries a cake twice his size to the grumpy giant queen at the top. No readable text or logo.",
        "A small shadow creature and a retired court jester share an apple on the castle wall, laughing silently at the sunset. No readable text or logo.",
        "In a soft crayon-drawn storybook meadow, a small paper crown lies forgotten in the grass beside a sleeping lamb and a bouquet of wildflowers. No readable text or logo.",
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
        "At a fantasy guild banquet glowing with pastel light, a grandmother adventurer in a lemon-yellow robe stacks her plate with glowing fruit tarts while three younger warriors watch in awe. No readable text or logo.",
        "A hungry knight fights a giant floating pudding monster and keeps taking bites between sword strikes. No readable text or logo.",
        "An empty banquet table glows in the sunset, one untouched strawberry tart sparkling at the center. No readable text or logo.",
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
        "Logging into a floating castle of cyan crystal for the first time, a retired schoolteacher in a clumsy beginner’s tunic swings a practice sword and watches a training dummy shatter into glittering polygons. No readable text or logo.",
        "Two guildmates in their fifties fish from the edge of a floating virtual island, their lines glowing cyan in the void. No readable text or logo.",
        "A single crystal sword stands in a virtual meadow at dusk, slowly dissolving into floating light cubes. No readable text or logo.",
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
        "Waking once again in the same gothic mansion bedroom, a tired middle-aged clerk sees faint violet echo-lines of himself repeating the same morning around the room. No readable text or logo.",
        "A butler serves tea at a long table as violet ghost images of dozens of earlier dinners flicker at every seat. No readable text or logo.",
        "A pocket watch lies open on a gothic nightstand, its hands spinning backward under violet moonlight. No readable text or logo.",
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
        "Teaching her first magic lesson in a mossy village schoolhouse, a gray-haired wandering mage patiently guides a farmer’s hands as a tiny stream of water rises from a wooden bucket. No readable text or logo.",
        "Three travelers share a thin blanket in a rainy barn, the painted fields outside glowing sepia in the storm light. No readable text or logo.",
        "A worn traveling staff leans against a mossy milestone on an empty country road at dawn. No readable text or logo.",
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
        "Proudly announcing her ultimate spell to a crowd of villagers, a retired court wizard accidentally blows up her own house and collapses face-first into a haystack, still smiling. No readable text or logo.",
        "A party of adventurers flees across a cabbage field from a swarm of flying cabbages, one knight happily volunteering to be hit. No readable text or logo.",
        "On a sticky tavern table in a cheap fantasy village, a pile of unpaid guild bills surrounds one half-eaten frog leg and a spilled mug. No readable text or logo.",
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
        "Building a new town square together under a bright sky-blue morning, goblin carpenters, lizard masons and a retired human engineer cheer as the last beam of a clock tower slides into place. No readable text or logo.",
        "A giant friendly ogre chef serves soup to a line of tiny forest spirits in a busy monster-town market. No readable text or logo.",
        "A small wooden signpost stands at the edge of a new monster town, a flower crown hanging from its top. No readable text or logo.",
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
        "Climbing a vertical dungeon shaft lit by amber lanterns, a middle-aged adventurer hauls a sack of glowing mineral crystals toward the tiny circle of daylight far above. No readable text or logo.",
        "A goddess of a small bakery familia bandages an adventurer’s arm while her bread burns in the oven. No readable text or logo.",
        "Deep in a silent crystal dungeon, a single amber lantern hangs from a glowing mineral outcrop above a rope that disappears into darkness. No readable text or logo.",
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
        "Around a huge round table in an overgrown ruined office tower, a bespectacled strategist in a long coat moves carved wooden pieces representing every guild while vines creep through the broken windows. No readable text or logo.",
        "A guild of cooks and tailors plans a festival on a rooftop garden above a moss-covered city. No readable text or logo.",
        "Above an empty overgrown avenue, a ruined highway sign is completely wrapped in flowering vines, with a family of birds nesting in its frame. No readable text or logo.",
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
        "After a clumsy fight with a single goblin, a muddy band of beginner adventurers in cheap patched gear sits by a smoky campfire at dawn, silently passing around one bruised apple. No readable text or logo.",
        "A novice priest washes her only shirt in a stream, soft watercolor light around her tired shoulders. No readable text or logo.",
        "In a muddy field under a pale pastel morning sky, a broken wooden practice sword lies beside a worn boot and a trampled flower. No readable text or logo.",
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
        "Crossing a stone bridge toward a painted mountain fortress, a weathered dwarf, a dignified elf archer and an aging knight in detailed plate armor pause to watch a dragon circle the peaks. No readable text or logo.",
        "An elf and a dwarf argue over the correct way to light a campfire in a rainy forest. No readable text or logo.",
        "In an empty stone throne hall, a tattered royal banner hangs crookedly while dusk light falls through tall windows across the thick dust. No readable text or logo.",
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
        "Standing in a vast jade throne hall, a newly chosen queen who was once a farmer lets her long vermilion robes spill down the steps as rows of ministers bow in perfect rhythmic lines. No readable text or logo.",
        "A tall mythical unicorn in human form waits under a misty pine for a ruler who has not arrived yet. No readable text or logo.",
        "On a silk cushion in a silent jade court at dawn, an empty imperial seal waits beside a folded robe and a single burning incense stick. No readable text or logo.",
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
        "Standing on a windswept cliff above a floating fortress, a fortune-teller in a carmine scarf holds a spread of hand-painted cards as her hair and cloak whip in the gale. No readable text or logo.",
        "An armored knight and a farm girl share bread on a hill while a huge airship drifts past the moons. No readable text or logo.",
        "Spinning high in the wind above a green valley at sunset, a single carmine feather drifts past the silhouette of a distant airship. No readable text or logo.",
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
        "Riding a flying carpet over a turquoise-domed desert city, an elderly spice merchant in jeweled robes throws handfuls of saffron that swirl into glowing arabesque patterns above the market. No readable text or logo.",
        "In a crowded bazaar full of hanging lanterns, a giant friendly blue djinn helps a tired water seller balance a tower of clay jars on her head. No readable text or logo.",
        "In a moonlit palace courtyard lined with arabesque arches, an empty golden lamp rests on a silk cushion beside a quiet fountain. No readable text or logo.",
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
        "Pressing her first hand-carved wooden block onto rough homemade paper, a determined elderly seamstress in a medieval workshop gasps as an indigo flower pattern appears perfectly on the sheet. No readable text or logo.",
        "A merchant and a priest argue over the price of a single handmade picture book in a candlelit shop. No readable text or logo.",
        "Across a quiet attic lit by one candle, a long string of freshly printed indigo pages dries slowly above a cluttered wooden press. No readable text or logo.",
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
        "In a ruined stone temple, a gentle skeleton knight and a ghostly old priest teach a grown apprentice how to hold a sword with the same care as a prayer book. No readable text or logo.",
        "By the crackling fire of a ruined temple, a gentle mummy grandmother knits a long woolen scarf while her grown apprentice sleeps under a borrowed cloak. No readable text or logo.",
        "On a cracked stone altar inside a moss-covered ruined temple, a single fresh loaf of bread sits in a beam of morning light. No readable text or logo.",
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
        "Surrounded by glass shelves of glowing herbs in a sunlit royal greenhouse, a tired office worker turned healer brews a mint potion that sparkles so brightly the knights outside the window squint. No readable text or logo.",
        "In a sunlit palace corridor, a shy royal librarian tries to thank a potion maker with a bouquet of herbs she grew herself, blushing to the ears. No readable text or logo.",
        "On a sunny greenhouse windowsill crowded with drying herbs, a single glass vial of green potion glows softly as a bee circles it curiously. No readable text or logo.",
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
        "Falling through the pages of an ancient book into a lavender sky, a librarian in her forties is caught by seven celestial warriors whose constellations glow around their halos. No readable text or logo.",
        "A shrine warrior and a scholar share a quiet moonlit walk in an ancient palace garden. No readable text or logo.",
        "An old red-bound book lies open on a library floor, lavender light rising from its pages. No readable text or logo.",
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
        "Leaping between floating islands in armor studded with ruby facets, a retired firefighter summoned to a fantasy world raises a glowing sword as rising speed lines blaze behind her. No readable text or logo.",
        "On a tiny floating island above the clouds, a gem-armored postwoman shares a picnic lunch with a fluffy round floating creature that keeps stealing her grapes. No readable text or logo.",
        "At the bottom of a clear fantasy spring surrounded by ferns, a single emerald gem glows while tiny silver fish circle it slowly. No readable text or logo.",
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
        "Standing on a floating chessboard above a hyper-saturated sky of magenta and cyan, two retired accountants challenge a god to a game of cards as whole continents rotate impossibly below. No readable text or logo.",
        "On a giant glowing chessboard floating in a neon sky, an enormous chess knight bows respectfully to the tiny grandmother who has just beaten it. No readable text or logo.",
        "Above an impossible staircase that twists back on itself at sunset, a single glowing die floats and slowly turns to show a new number. No readable text or logo.",
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
        "Flying in a tight diagonal formation over muddy trenches, a squadron of aerial war mages in khaki greatcoats casts glowing shields as artillery bursts orange behind them. No readable text or logo.",
        "An exhausted staff officer eats rations in a bunker while maps of the front shake on the wall. No readable text or logo.",
        "A pair of flight goggles hangs from a barbed wire fence in the grey morning fog. No readable text or logo.",
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
        "Seated on an ivory throne in perfect symmetry, a skeletal accountant-lord in ornate robes reviews the kingdom’s taxes while monstrous servants wait in two flawless rows. No readable text or logo.",
        "In a grand baroque kitchen, a towering insect warrior in ornate armor carefully polishes a single porcelain teacup for its master’s evening tea. No readable text or logo.",
        "In an enormous empty throne hall of ivory and charcoal, a black throne glows under a single beam of cold moonlight. No readable text or logo.",
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
        "In a thorn-wrapped English cottage garden, a retired schoolteacher bargains politely with a fae creature made of brambles and moth wings for the return of her lost reading glasses. No readable text or logo.",
        "Beside a misty pond at dawn, a small mossy bog spirit shares a pot of tea with an old herbalist wrapped in a knitted shawl. No readable text or logo.",
        "At dusk in an empty English cottage, a thorny wild rose has grown through the broken window and blooms above the dusty kitchen table. No readable text or logo.",
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
        "Climbing out of an old shrine well into a feudal forest, a modern pharmacist with her bag of medicine meets a vermilion-robed fox demon who is suspiciously interested in her aspirin. No readable text or logo.",
        "Beside a burned-out feudal village, a traveling monk and a stern demon slayer argue loudly over who gets the last rice ball in the lunch box. No readable text or logo.",
        "An old shrine well sits under a sacred tree, a faint glow coming from its depths. No readable text or logo.",
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
