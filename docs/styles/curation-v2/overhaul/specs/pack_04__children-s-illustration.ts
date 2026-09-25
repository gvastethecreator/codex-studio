import type { Dna, Spec } from '../tools/apply';

const AVOID = ['frightening gore', 'known picture-book characters', 'franchise mascot likeness'];
// Media must not change body proportions (category review); only profiles that say so may.
const KEEP_PROPORTIONS = [...AVOID, 'enlarged head', 'unrequested chibi proportions'];

// Media redraw the subject and keep its proportions; profiles state what they own.
const medium =
  'Keep the prompt subject, its body proportions, action and setting, and redraw them in this medium; simplify shapes for a young reader without enlarging heads or shrinking bodies.';
const profile = (what: string) =>
  `Keep the prompt subject, action and identity; this preset explicitly owns ${what}, and nothing else about the request changes.`;

function kid(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? medium, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_04',
  category: "2. Children's Illustration",
  updates: {
    'SP04-013': {
      dna: kid({
        aesthetic:
          'Chibi super-deformed drawing: every character redrawn about two heads tall with a huge round head, tiny limbs and stubby mitten hands.',
        subject_treatment: profile(
          'the proportion change to a two-heads-tall super-deformed body with oversized head and tiny limbs',
        ),
        color_and_tone:
          'Bright candy palette, pink blush ovals on cheeks, saturated flats with one lighter highlight tone.',
        lighting_and_shadow:
          'Flat cel shading with one soft shadow step and round glossy highlights in large eyes.',
        texture_and_material:
          'Smooth digital fills with thick clean outlines; props drawn oversized and toy-like.',
        camera_and_composition:
          'Centered full-body figures on simple backgrounds, tiny bodies read as a round silhouette.',
        atmosphere_and_mood: 'Playful, comic and huggable, every emotion shown as a big face.',
        rendering_and_quality:
          'Thick even outlines, simplified interiors and expression marks such as sweat drops and sparkles.',
        key_features:
          'two-heads-tall proportions; oversized round head; thick clean outline; blush ovals; oversized props',
      }),
      avoid: AVOID,
      briefs: [
        'Chibi super-deformed image of a tiny adult knight in oversized armor tripping over his own enormous sword in a flower meadow, two heads tall, thick clean outlines, blush ovals and bright candy colors. No text or logo.',
        'Chibi super-deformed image of a round little dragon guarding a hoard of cookies instead of gold, huge glossy eyes and stubby wings, flat cel shading. No text or logo.',
        'Chibi super-deformed image of an adult astronaut in a bulky suit hugging a small moon rock, oversized helmet, sparkle marks. No text or logo.',
      ],
    },
    'SP04-017': {
      dna: kid({
        aesthetic:
          'Classic watercolor storybook: light pencil underdrawing tinted with transparent washes, small animals and cottages observed with naturalist care.',
        color_and_tone:
          'Botanical pastels, sage, fawn and soft blue, warm neutrals, white paper left for highlights.',
        lighting_and_shadow:
          'Soft diffuse daylight, pale cool shadow washes, paper white as the brightest light.',
        texture_and_material:
          'Cold-press paper grain, feathered wash edges fading into white vignettes, fine pencil detail on fur.',
        camera_and_composition:
          'Small intimate vignettes floating on white paper, subject at eye level of a small animal.',
        atmosphere_and_mood: 'Tender, pastoral and comforting, a quiet afternoon in the hedgerow.',
        rendering_and_quality:
          'Delicate observed drawing with transparent layered washes; no digital flats and no hard outlines.',
        key_features:
          'pencil underdrawing; transparent watercolor washes; vignette on white paper; naturalist animal detail; botanical pastels',
      }),
      avoid: KEEP_PROPORTIONS,
      briefs: [
        'Watercolor storybook vignette of a hedgehog in a knitted scarf carrying a tiny lantern home through a bramble hedge at dusk, pencil underdrawing, transparent washes fading into white paper. No text or logo.',
        'Watercolor storybook vignette of a small girl in a yellow coat feeding ducks at a willow pond, soft pastel washes and feathered edges. No text or logo.',
        'Watercolor storybook vignette of a thatched stone cottage in morning mist with a tabby cat asleep on the doorstep, sage and fawn washes. No text or logo.',
      ],
    },
    'SP04-018': {
      dna: kid({
        aesthetic:
          'Painted tissue collage: sheets of paper first painted with brushy textures, then cut and torn into shapes and layered into bold animals and landscapes.',
        color_and_tone:
          'Rich primaries and secondaries mottled inside every shape, set against a plain white ground.',
        lighting_and_shadow:
          'No modeled light; value comes from the painted texture inside each paper piece and slight edge shadows between layers.',
        texture_and_material:
          'Brush streaks, sponge dabs and finger marks inside cut shapes, visible scissor and torn edges, overlapping tissue.',
        camera_and_composition:
          'Large simple silhouettes filling the page, overlapping layers building body parts like a mosaic.',
        atmosphere_and_mood: 'Bright, bold and exploratory, a big shape a toddler can point at.',
        rendering_and_quality:
          'Handmade collage with real paper textures; no outlines and no digital gradients.',
        key_features:
          'hand-painted tissue papers; scissor-cut shapes; mottled brush texture inside shapes; white ground; overlapping layers',
      }),
      avoid: [...KEEP_PROPORTIONS, 'black outlines'],
      dropAvoid: ['painted'],
      briefs: [
        'Painted tissue collage of a peacock fanning a tail of cut paper feathers, each feather mottled with brush streaks in blue, green and gold, scissor-cut edges on a white ground. No text or logo.',
        'Painted tissue collage of a big red crab scuttling across a sandy beach under a sponge-painted sun, overlapping torn layers. No text or logo.',
        'Painted tissue collage of a whale spouting beneath a patterned night sky, streaked blue papers layered like a mosaic. No text or logo.',
      ],
    },
    'SP04-019': {
      dna: kid({
        aesthetic:
          'Wax crayon drawing made the way a child draws: pressure-variable waxy strokes, directional scribble fill and happy disregard for staying inside lines.',
        color_and_tone:
          'A box of bright primary and secondary crayons, colors overlapped by scribbling one over another.',
        lighting_and_shadow:
          'No light logic; darker areas are just pressed harder, and a corner sun with rays is the only light.',
        texture_and_material:
          'Wax buildup and flakes, paper tooth showing through light strokes, uneven directional scribble fill.',
        camera_and_composition:
          'Flat side view on a baseline of grass, a strip of blue sky on top, everything spread out to be seen.',
        atmosphere_and_mood: 'Joyful, innocent and spontaneous, drawn in one happy go.',
        rendering_and_quality:
          'Deliberately unpolished wax marks with wobbly shapes; never smooth blending or perspective accuracy.',
        key_features:
          'waxy pressure strokes; directional scribble fill; paper tooth; sky strip and grass baseline; corner sun',
      }),
      avoid: [...AVOID, 'smooth blending'],
      briefs: [
        'Wax crayon drawing of a lion wearing a paper crown having a tea party with stuffed toys on the grass, pressure-variable waxy strokes, scribble fill running over the lines, a corner sun with rays. No text or logo.',
        'Wax crayon drawing of a rocket ship zooming past a smiling moon and scribbled stars, heavy wax buildup on the night sky. No text or logo.',
        'Wax crayon drawing of a tall giraffe peering into a treehouse window, grass baseline and blue sky strip, paper tooth showing through. No text or logo.',
      ],
    },
    'SP04-020': {
      name: 'Rounded Vector Explainer',
      dna: kid({
        aesthetic:
          'Flat educational vector illustration: subjects built from rounded geometric primitives with no outlines, arranged to explain how something works.',
        color_and_tone:
          'Vibrant flat colors on a deep navy or teal field, each group of things coded by one hue.',
        lighting_and_shadow:
          'Flat shapes with one lighter and one darker tone per object; soft long flat shadows at a fixed angle.',
        texture_and_material:
          'Pure vector cleanliness, rounded corners, tiny highlight dots, no grain and no brush texture.',
        camera_and_composition:
          'Diagram-like cutaway or cross-section views, clear hierarchy, big central subject with small orbiting details.',
        atmosphere_and_mood: 'Optimistic and curious, a complicated idea made friendly.',
        rendering_and_quality:
          'Crisp screen vector with consistent corner radii; no icons, labels, UI panels or readable text.',
        key_features:
          'rounded geometric primitives; no outlines; color-coded flat hues on navy; cutaway diagram view; long flat shadows',
      }),
      avoid: [...KEEP_PROPORTIONS, 'UI panels', 'app icons'],
      briefs: [
        'Rounded vector explainer image of a beehive in cutaway, bees carrying nectar into hexagon cells, flat color-coded ambers on a deep navy field, no outlines, long flat shadows. No labels, text or logo.',
        'Rounded vector explainer image of a volcano in cross-section with a glowing magma chamber and rising plume, simple geometric layers. No labels, text or logo.',
        'Rounded vector explainer image of a V of migrating geese flying over the curved edge of a flat-shaded planet, color-coded continents. No labels, text or logo.',
      ],
    },
    'SP04-021': {
      dna: kid({
        aesthetic:
          'Mid-century gouache picture book: opaque matte paint in flat geometric shapes, stylized foliage and animals reduced to playful modernist forms.',
        color_and_tone:
          'Chalky opaque palette of mustard, teal, tomato red and off-white, flat design contrast.',
        lighting_and_shadow:
          'Even matte illumination; shadows are flat darker shapes, never gradients.',
        texture_and_material:
          'Chalky gouache with dry-brush drag at shape edges and slight streaks inside flat areas.',
        camera_and_composition:
          'Flattened decorative space, repeating patterned foliage, subject placed as a bold graphic shape.',
        atmosphere_and_mood: 'Cheerful atomic-age optimism, stylish and gently humorous.',
        rendering_and_quality:
          'Opaque flat shapes with visible brush edges; no transparency and no photographic modeling.',
        key_features:
          'opaque matte gouache; flat geometric shapes; mustard-teal-tomato palette; dry-brush edges; patterned foliage',
      }),
      avoid: KEEP_PROPORTIONS,
      briefs: [
        'Mid-century gouache picture-book image of a stylized tiger prowling through repeating geometric jungle leaves, opaque mustard, teal and tomato red, dry-brush edges on flat shapes. No text or logo.',
        'Mid-century gouache picture-book image of an adult balloonist in a striped hot-air balloon drifting over a checkerboard of fields, chalky flat paint. No text or logo.',
        'Mid-century gouache picture-book image of a flock of geometric sheep on a round green hill, off-white bodies with flat shadow shapes. No text or logo.',
      ],
    },
    'SP04-022': {
      name: 'Storybook Colored Pencil',
      dna: kid({
        aesthetic:
          'Storybook colored pencil: soft layered wax pencil built up in directional strokes on toothy paper, cozy interiors and animals drawn with warmth.',
        color_and_tone:
          'Muted warm-cool layers, honey, rust, moss and dusty blue, blended by glazing one pencil over another.',
        lighting_and_shadow:
          'Diffuse warm lamplight with low contrast, shadows built by denser layered hatching.',
        texture_and_material:
          'Visible paper tooth speckling through every stroke, directional hatching following form, soft burnished areas.',
        camera_and_composition:
          'Close, cozy framing at child or animal eye level, soft edges falling off toward the paper.',
        atmosphere_and_mood: 'Quiet, reflective and warm, a bedtime-story hush.',
        rendering_and_quality:
          'Intimate hand-pressure nuance with visible strokes; no ink line and no paint.',
        key_features:
          'layered wax pencil; paper tooth speckle; directional hatching; honey and moss palette; cozy close framing',
      }),
      avoid: KEEP_PROPORTIONS,
      briefs: [
        'Storybook colored pencil image of an old badger in a cardigan reading beside a burrow fireplace, layered honey and rust wax pencil, paper tooth speckling through, warm lamplight. No readable text or logo.',
        'Storybook colored pencil image of a child building a blanket fort lit by a flashlight, directional hatching and soft burnished shadows. No text or logo.',
        'Storybook colored pencil image of a sleepy dormouse curled in a basket of wild strawberries, moss and dusty blue glazing. No text or logo.',
      ],
    },
    'SP04-024': {
      dna: kid({
        aesthetic:
          'Preschool stop-motion clay: chunky plasticine characters on a small tabletop set of felt, cardboard and wooden blocks, filmed under bright lamps.',
        color_and_tone:
          'Clean bright primaries in matte clay, felt greens and cardboard browns, cheerful and simple.',
        lighting_and_shadow:
          'Bright even key with soft fill, small crisp contact shadows under characters on the set.',
        texture_and_material:
          'Fingerprints and tool dents in clay, fuzzy felt ground, corrugated cardboard edges and simple sculpted bead eyes.',
        camera_and_composition:
          'Eye-level tabletop view with shallow depth of field that shows the miniature scale.',
        atmosphere_and_mood: 'Gentle, handmade and funny, made for the very young.',
        rendering_and_quality:
          'Physical plasticine and craft materials with visible handling marks; never glossy plastic CG.',
        key_features:
          'chunky plasticine characters; felt and cardboard set; fingerprints and tool dents; bright even lamps; shallow tabletop depth',
      }),
      avoid: [...KEEP_PROPORTIONS, 'glossy plastic CG'],
      briefs: [
        'Preschool stop-motion clay frame of a plasticine penguin family ice-fishing through a hole in a white felt floe, fingerprints in the clay, bright even lamps and shallow tabletop depth. No text or logo.',
        'Preschool stop-motion clay frame of a plasticine octopus chef flipping eight pancakes at once on a cardboard stove, tool dents and small crisp shadows. No text or logo.',
        'Preschool stop-motion clay frame of a plasticine mole digging a tunnel under a felt carrot garden, set shown in cutaway. No text or logo.',
      ],
    },
    'SP04-025': {
      dna: kid({
        aesthetic:
          'Felt-tip marker drawing: broad water-based marker strokes that streak, overlap into darker mixes and bleed slightly into cheap paper.',
        color_and_tone:
          'Saturated marker gamut, hot pink, lime, cyan and orange, darker where strokes overlap.',
        lighting_and_shadow: 'Minimal modeling; a second pass of the same marker makes the shadow.',
        texture_and_material:
          'Parallel stroke streaks, bleed halos at edges, dried-out marker gaps and a few smudges.',
        camera_and_composition:
          'Loose gestural perspective, simple figures with bold outlines drawn in black marker.',
        atmosphere_and_mood: 'Casual, energetic and improvised, drawn fast at the kitchen table.',
        rendering_and_quality:
          'Visible hand-speed decisions and streaky fills; no paint, no smooth gradients.',
        key_features:
          'streaky marker fills; overlap darkening; bleed halos; black marker outlines; saturated hot palette',
      }),
      avoid: KEEP_PROPORTIONS,
      dropAvoid: ['blend'],
      briefs: [
        'Felt-tip marker drawing of a child racing a toy sailboat across a foamy bathtub, streaky cyan and lime fills, black marker outlines, bleed halos at the edges. No text or logo.',
        'Felt-tip marker drawing of a robot walking a dog made of springs through a park, overlapping hot pink and orange strokes. No text or logo.',
        'Felt-tip marker drawing of a parade of ants carrying a huge sandwich across a picnic blanket, dried-out marker gaps. No text or logo.',
      ],
    },
    'SP04-026': {
      dna: kid({
        aesthetic:
          'Pop-up book photograph: the subject engineered in folded, die-cut cardstock that rises out of the gutter of an open book.',
        subject_treatment: profile(
          'the open-book pop-up construction with folds, tabs and layers rising from the page',
        ),
        color_and_tone:
          'Printed cardstock colors with kraft and white edges visible at every cut, a few bright accents.',
        lighting_and_shadow:
          'Directional light from above the book, casting real shadows from each raised layer onto the page.',
        texture_and_material:
          'Matte printed card, crisp folds, v-fold hinges, pull tabs, slightly fuzzy cut edges.',
        camera_and_composition:
          'Three-quarter view of the open book on a table, layers stepping back from the spine.',
        atmosphere_and_mood: 'Surprising and delightful, a world unfolding as the page opens.',
        rendering_and_quality:
          'Believable paper engineering with real depth; never a flat printed page.',
        key_features:
          'die-cut cardstock layers; v-fold hinges and pull tabs; open book gutter; real paper shadows; three-quarter view',
      }),
      avoid: AVOID,
      briefs: [
        'Pop-up book photograph of a castle with a drawbridge rising from the gutter of an open book, a paper dragon on a pull tab curling around a tower, v-fold hinges and real shadows. No text or logo.',
        'Pop-up book photograph of a coral reef unfolding in layered die-cut card, paper fish on springs above the page. No text or logo.',
        'Pop-up book photograph of a circus big top rising from the page with paper acrobats hinged mid-leap, three-quarter view. No text or logo.',
      ],
    },
    'SP04-027': {
      dna: kid({
        aesthetic:
          'Whimsical scratchy ink: fast dip-pen lines that skip and splutter, loosely washed with a few watercolor splashes.',
        color_and_tone:
          'Black ink skeleton with light splashes of watercolor that do not fill the shapes exactly.',
        lighting_and_shadow:
          'Paper-white light with a few wash hints; no cast shadows beyond a quick scribble.',
        texture_and_material:
          'Nib chatter, ink flicks and splatter, broken contours, wash puddles drying with edges.',
        camera_and_composition:
          'Figures in lively gestures, elastic and spiky, floating on white paper with little background.',
        atmosphere_and_mood: 'Humorous, lively and mischievous, a joke caught mid-motion.',
        rendering_and_quality:
          'Deliberately unrefined speed and wobble; never tidy outlines or full painted backgrounds.',
        key_features:
          'scratchy dip-pen line; ink flicks and splatter; loose watercolor splashes; broken contours; white paper',
      }),
      avoid: KEEP_PROPORTIONS,
      briefs: [
        'Whimsical scratchy ink drawing of a lanky adult inventor flying a contraption of kites and birdcages, dip-pen line skipping and spluttering, loose watercolor splashes, white paper around. No text or logo.',
        'Whimsical scratchy ink drawing of a grandmother racing a wheelbarrow downhill with a goose riding in it, ink flicks and splatter. No text or logo.',
        'Whimsical scratchy ink drawing of a crocodile trying on hats in a crowded hat shop, broken contours and wash puddles. No text or logo.',
      ],
    },
    'SP04-028': {
      dna: kid({
        aesthetic:
          'Soft chalk pastel: powdery pigment rubbed and smudged into toothy colored paper, forms dissolving into velvety glow.',
        color_and_tone:
          'Muted pastel spectrum over a mid-tone blue or gray paper, warm glows against cool shadows.',
        lighting_and_shadow:
          'Diffuse low-contrast light, glowing halos rubbed in with a finger, soft edges everywhere.',
        texture_and_material:
          'Strong paper tooth catching pigment, smudge trails, powdery dust, colored paper showing through.',
        camera_and_composition:
          'Simple calm compositions with soft edges and large areas of blended sky or ground.',
        atmosphere_and_mood: 'Nostalgic, calm and sleepy, a bedtime softness.',
        rendering_and_quality:
          'Velvety smudged finish with visible tooth; no pen line and no sharp edges.',
        key_features:
          'powdery chalk pastel; finger-smudged glows; colored paper showing through; soft edges; muted warm-cool palette',
      }),
      avoid: KEEP_PROPORTIONS,
      briefs: [
        'Soft chalk pastel image of a polar bear cub asleep on an ice ridge under green northern lights, powdery pigment smudged into blue-gray paper, glows rubbed in by finger. No text or logo.',
        'Soft chalk pastel image of a hare sitting in a field of dandelion clocks at sunset, seeds drifting, paper tooth catching the light. No text or logo.',
        'Soft chalk pastel image of a child in pajamas watching fireflies from a window seat, warm lamp glow against cool night. No text or logo.',
      ],
    },
    'SP04-029': {
      name: 'Glossy Die-Cut Sticker',
      dna: kid({
        aesthetic:
          'Glossy die-cut sticker: the subject drawn as a bold simplified vinyl sticker with a thick white cut border and a laminate shine.',
        subject_treatment: profile(
          'the sticker format: one isolated subject with a thick white die-cut border on a plain backing',
        ),
        color_and_tone:
          'Saturated flat vector colors with one shade tone and a white border around everything.',
        lighting_and_shadow:
          'One glossy laminate highlight streak across the sticker and a small soft drop shadow on the backing.',
        texture_and_material:
          'Smooth vinyl surface, subtle laminate sheen, slightly lifted corner of the sticker.',
        camera_and_composition:
          'One centered subject with a clean silhouette, plain pale backing around it.',
        atmosphere_and_mood: 'Playful and punchy, a collectible little treasure.',
        rendering_and_quality:
          'Crisp decal-ready shapes readable at small size; no background scene and no readable text.',
        key_features:
          'thick white die-cut border; flat saturated vector; laminate highlight streak; lifted corner; isolated silhouette',
      }),
      avoid: AVOID,
      briefs: [
        'Glossy die-cut sticker of a smiling cactus wearing sunglasses, thick white cut border, flat saturated greens, one laminate highlight streak and a lifted corner on a pale backing. No text or logo.',
        'Glossy die-cut sticker of a sleepy sloth hanging from a crescent moon, soft drop shadow, crisp vector shapes. No text or logo.',
        'Glossy die-cut sticker of a red-capped toadstool house with a tiny round door, white border and vinyl sheen. No text or logo.',
      ],
    },
    'SP04-030': {
      dna: kid({
        aesthetic:
          'Vintage scientific botanical plate: a specimen drawn in fine ink contour and tinted with muted watercolor, with dissected parts arranged around it.',
        subject_treatment: profile(
          'the specimen plate layout: whole subject centered, dissected details and sections arranged around it without labels',
        ),
        color_and_tone:
          'Muted naturalist watercolor tints over warm cream archival paper, true local colors.',
        lighting_and_shadow:
          'Flat specimen illumination from the upper left, minimal shading only to show form.',
        texture_and_material:
          'Aged paper grain, fine stipple and hatch in the ink, thin transparent washes.',
        camera_and_composition:
          'Orthographic specimen views, sections and insets in a balanced grid, fine leader lines without text.',
        atmosphere_and_mood: 'Scholarly, measured and calm, curiosity made precise.',
        rendering_and_quality:
          'High-accuracy naturalist drawing; leader lines point to empty space, never to readable labels.',
        key_features:
          'fine ink contour; muted watercolor tints; dissected insets; cream archival paper; unlabeled leader lines',
      }),
      avoid: [...AVOID, 'readable labels', 'Latin names'],
      briefs: [
        'Vintage botanical plate of a foxglove stem with dissected flower insets and a seed-pod section, fine ink contour and muted purple watercolor tints on cream archival paper, unlabeled leader lines. No text or logo.',
        'Vintage botanical plate of a mandrake plant pulled up with its forked, root-like body shown whole, leaves and flower insets around it. No text or logo.',
        'Vintage botanical plate of a pine sprig and an opened pinecone with seed and scale insets, stipple and hatch. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'High-Contrast Baby Board Book',
      domain: 'infant board-book graphics',
      tags: ['board-book', 'high-contrast', 'infant'],
      dna: kid({
        aesthetic:
          'Infant board book graphics: huge simple shapes in black, white and one red, with bold stripes, dots and spirals a baby can see.',
        color_and_tone:
          'Pure black and white with a single bright red accent; no other hues and no midtones.',
        lighting_and_shadow: 'No lighting at all; shapes are flat and read only by contrast.',
        texture_and_material:
          'Printed matte board with slightly rounded corners, solid ink areas and crisp pattern fills.',
        camera_and_composition:
          'One subject filling the frame, centered and head-on, with big bold patterns inside the shapes.',
        atmosphere_and_mood: 'Calm, clear and captivating for the very youngest eyes.',
        rendering_and_quality:
          'Maximal contrast and minimal detail; no gradients, no small parts and no busy background.',
        key_features:
          'black white and red only; huge flat shapes; stripe dot and spiral patterns; centered head-on subject; rounded board corners',
      }),
      avoid: [...KEEP_PROPORTIONS, 'gradients', 'pastel colors', 'fine detail'],
      briefs: [
        'High-contrast baby board book image of a panda sitting head-on holding one red ball, huge flat black and white shapes, stripe patterns in its ears, printed matte board with rounded corners. No text or logo.',
        'High-contrast baby board book image of a ladybird on a big leaf, bold red and black dots, white leaf with black spiral veins. No text or logo.',
        'High-contrast baby board book image of an owl with enormous concentric-ring eyes and a striped chest, centered and flat. No text or logo.',
      ],
    },
    {
      name: 'Thumbprint Ink Critters',
      domain: 'fingerprint doodle illustration',
      tags: ['thumbprint', 'ink-pad', 'doodle'],
      dna: kid({
        aesthetic:
          'Thumbprint critters: oval fingerprints pressed from colored ink pads, turned into animals and bugs with a few fine pen lines.',
        color_and_tone:
          'Bright stamp-pad colors on white paper, each print uneven in density, black fine-liner details.',
        lighting_and_shadow:
          'No modeled light; lighter and darker areas come from how hard each finger was pressed.',
        texture_and_material:
          'Visible fingerprint ridges and whorls inside every blob, patchy ink, crisp thin pen legs and faces.',
        camera_and_composition:
          'Small characters spread across open white paper, simple action lines and tiny pen-drawn props.',
        atmosphere_and_mood: 'Funny, tiny and homemade, a rainy-afternoon craft.',
        rendering_and_quality:
          'Real fingerprint texture with minimal pen additions; no painted fills and no outlines around prints.',
        key_features:
          'fingerprint ridges in ink blobs; stamp-pad colors; fine black pen details; white paper; tiny characters',
      }),
      avoid: [...KEEP_PROPORTIONS, 'painted fills'],
      briefs: [
        'Thumbprint ink critters of a line of gray fingerprint mice marching across a crusty loaf of bread, fingerprint ridges visible in every body, fine black pen whiskers and tails on white paper. No text or logo.',
        'Thumbprint ink critters of yellow-and-black fingerprint bumblebees buzzing around a tall sunflower drawn in pen, patchy stamp-pad ink. No text or logo.',
        'Thumbprint ink critters of fingerprint snails racing along a garden wall, spiral whorls as shells, pen-drawn finish line pebbles. No text or logo.',
      ],
    },
    {
      name: 'Plasticine Relief Picture',
      domain: 'flat plasticine relief illustration',
      tags: ['plasticine-relief', 'bas-relief', 'tactile'],
      dna: kid({
        aesthetic:
          'Plasticine relief picture: soft modeling clay pressed and smeared flat onto board as a shallow picture, photographed like a painting.',
        color_and_tone:
          'Rich saturated clay colors, smeared blends where two colors meet, deep night blues and glowing yellows.',
        lighting_and_shadow:
          'Low raking light from one side so the shallow ridges and dots cast tiny shadows.',
        texture_and_material:
          'Fingertip smears, rolled clay snakes for outlines, pressed dots and tool-scored lines, glossy thumb-polished spots.',
        camera_and_composition:
          'Flat frontal view of the whole relief board, everything packed edge to edge like a picture-book spread.',
        atmosphere_and_mood: 'Cozy, tactile and richly detailed, a picture you want to touch.',
        rendering_and_quality:
          'Shallow physical relief with real clay texture; not a stop-motion set and not a 3D render.',
        key_features:
          'clay smeared flat on board; rolled clay outlines; pressed dots and scored lines; raking side light; frontal flat view',
      }),
      avoid: [...KEEP_PROPORTIONS, 'deep 3D set', 'CG render'],
      briefs: [
        'Plasticine relief picture of a snowy fir forest at night with a red sleigh pulled by reindeer, clay smeared flat onto board, rolled clay outlines and pressed white dots of snow, raking side light. No text or logo.',
        'Plasticine relief picture of an otter floating on its back holding a sea urchin, smeared blue and green water swirls, tool-scored fur. No text or logo.',
        'Plasticine relief picture of a raccoon sitting on a chimney above a row of stacked houses with glowing yellow windows, frontal flat view. No text or logo.',
      ],
    },
    {
      name: 'Grainy Digital Picture Book',
      domain: 'contemporary textured digital picture book',
      tags: ['digital-grain', 'limited-palette', 'picture-book'],
      dna: kid({
        aesthetic:
          'Contemporary digital picture book: soft flat shapes painted with grainy texture brushes, limited palette and quiet storytelling spaces.',
        color_and_tone:
          'Limited palette of five or six muted colors, dusky pinks, deep teals and warm ochre, shapes overlapping into darker tones.',
        lighting_and_shadow:
          'Simple soft light, glows made with grainy airbrush, shadows as flat translucent shapes.',
        texture_and_material:
          'Fine speckled grain inside every shape, crayon-textured edges, subtle print-like noise.',
        camera_and_composition:
          'Wide spreads with lots of empty space, small characters placed low in a large landscape.',
        atmosphere_and_mood: 'Gentle, quiet and a little melancholy, a story told in pauses.',
        rendering_and_quality:
          'Soft textured digital finish with no outlines and no glossy rendering.',
        key_features:
          'grainy texture brushes; limited muted palette; no outlines; wide empty spreads; small characters in large space',
      }),
      avoid: [...KEEP_PROPORTIONS, 'glossy 3D rendering', 'hard outlines'],
      briefs: [
        'Grainy digital picture-book spread of a moose and a small bird sharing a rowboat on a still lake at dusk, speckled grain in every shape, dusky pink and deep teal palette, wide empty space above. No text or logo.',
        'Grainy digital picture-book spread of a child flying a long-tailed kite on a windy hilltop, crayon-textured edges and warm ochre grass. No text or logo.',
        'Grainy digital picture-book spread of a lonely little robot watering a rooftop garden at night, grainy airbrush glow from a single lamp. No text or logo.',
      ],
    },
    {
      name: 'Victorian Hatched Storybook Plate',
      domain: 'nineteenth-century fairy-tale book plate',
      tags: ['pen-hatching', 'fairy-tale', 'hand-tinted'],
      dna: kid({
        aesthetic:
          'Victorian fairy-tale book plate: detailed pen drawing built from fine parallel hatching and crosshatching, lightly hand-tinted with a few watercolors.',
        color_and_tone:
          'Black ink on cream paper, pale tints of rose, moss and sky blue applied sparingly and unevenly.',
        lighting_and_shadow:
          'Light from the upper left, shadows made of layered hatching, strong white highlights left as paper.',
        texture_and_material:
          'Engraving-like parallel lines, crosshatch shadows, foxed cream paper with slight tint bleed.',
        camera_and_composition:
          'Theatrical framed tableau, characters in period costume, detailed but clear foreground action.',
        atmosphere_and_mood: 'Old-fashioned, curious and gently eerie, a tale told by candlelight.',
        rendering_and_quality:
          'Precise hatched pen detail with restrained tinting; no flat digital color and no outlines-only drawing.',
        key_features:
          'fine parallel hatching; crosshatch shadows; sparing hand tints; cream foxed paper; theatrical tableau',
      }),
      avoid: [...KEEP_PROPORTIONS, 'flat digital color'],
      briefs: [
        'Victorian hatched storybook plate of a toad in a waistcoat rowing a giant teacup across a lily pond, fine parallel pen hatching, pale moss and rose hand tints on foxed cream paper. No text or logo.',
        'Victorian hatched storybook plate of a troll under a stone bridge counting a pile of buttons by candle, crosshatch shadows and white paper highlights. No text or logo.',
        'Victorian hatched storybook plate of a boy in a sailor suit climbing a giant beanstalk into the clouds, engraving-like lines and sky-blue tint. No text or logo.',
      ],
    },
    {
      name: 'Seek-and-Find Busy Panorama',
      domain: 'busy seek-and-find picture book',
      tags: ['seek-and-find', 'busy-scene', 'high-angle'],
      dna: kid({
        aesthetic:
          'Seek-and-find busy panorama: a whole place drawn from high above and packed with dozens of tiny characters each doing something funny.',
        subject_treatment: profile(
          'the high-angle crowded panorama, placing the requested subject as one findable element among many small figures',
        ),
        color_and_tone:
          'Bright varied local colors, evenly distributed so no area dominates, clean light backgrounds.',
        lighting_and_shadow:
          'Even daylight, tiny uniform shadows, no dramatic contrast that would hide details.',
        texture_and_material:
          'Clean line with flat color, small repeating patterns in roofs, crowds and paths.',
        camera_and_composition:
          'High oblique bird-eye view with no vanishing point drama, the scene filled edge to edge with mini stories.',
        atmosphere_and_mood: 'Bustling, funny and generous, a page to explore for hours.',
        rendering_and_quality:
          'Consistent small figure scale, every figure readable as a silhouette, no clutter blur.',
        key_features:
          'high oblique bird-eye view; dozens of tiny figures; mini stories everywhere; even daylight; edge-to-edge detail',
      }),
      avoid: AVOID,
      briefs: [
        'Seek-and-find busy panorama of a medieval castle festival seen from high above, dozens of tiny jugglers, cooks, runaway pigs and musicians, clean line and bright flat colors, edge-to-edge detail. No text or logo.',
        'Seek-and-find busy panorama of an underwater town of fish with shell houses, crab traffic and seahorse markets, even light and tiny figures. No text or logo.',
        'Seek-and-find busy panorama of a village frozen pond crowded with skaters, snowball fights and a dog pulling a sled, high oblique view. No text or logo.',
      ],
    },
  ],
};

export const aliases = {
  'SP04-020': 'Kurzgesagt Vector Flat (Infographic)',
  'SP04-022': 'Colored Pencil',
  'SP04-029': 'Sticker Art',
};

export default spec;
