import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'franchise character likeness',
  'copied franchise costume or emblem',
  'signature franchise weapon',
  'generic spiky-haired teen protagonist',
  'adding a fight or power effect to a quiet prompt',
  'readable glyphs or sigils',
];

// Every preset here is a drawing style: the prompt is redrawn in the medium. The category review
// requires that an ordinary quiet activity keeps its action and location, so effect marks attach
// only to motion or energy the prompt already contains.
const redraw =
  'Redraw the prompt subject, action and setting in this anime drawing language and keep all three; a quiet everyday activity stays quiet and in place, and effect marks attach only to motion or energy the prompt already contains, never adding a fight, weapon or franchise costume.';

function sh(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? redraw, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_05',
  category: '1. Modern Shonen & Action',
  updates: {
    'SP05-034': {
      name: 'Crosshatched Primary Hero Cel',
      dna: sh({
        aesthetic:
          'Hero-TV anime built on a manga ink base: heavy variable contours and crosshatched shadow wedges printed over flat primary-color cel fills.',
        color_and_tone:
          'Saturated primary red, cobalt blue and sunflower yellow on clean white; hatched shadows use a darker shade of each local color instead of grey.',
        lighting_and_shadow:
          'Bright high-front noon key, a single hard cel shadow tier filled with pen hatching, and crisp white specular ticks on hair and cloth.',
        texture_and_material:
          'Smooth cel fills with patches of visible pen hatching confined to shadow planes; seams and folds drawn as bold ink strokes, no painted texture.',
        camera_and_composition:
          'Keep the requested framing; add slight wide-lens foreshortening to the nearest limb and hold a clear silhouette against a simplified background.',
        atmosphere_and_mood:
          'Earnest, sunny optimism with a thread of strain carried by the hatched shadows.',
        rendering_and_quality:
          'Thick-to-thin contour hierarchy, hatching only inside shadows, flat bright fills and silhouettes that read at thumbnail size.',
        key_features:
          'heavy manga contour; crosshatched cel shadow wedges; primary red, cobalt and yellow; wide-lens limb foreshortening; white specular ticks',
      }),
      avoid: [...AVOID, 'numbered hero suit', 'green curly hair with freckles', 'cape emblem'],
      briefs: [
        'Crosshatched primary hero cel of an adult blacksmith-turned-guardian bracing a collapsing castle portcullis on her shoulders, her boots foreshortened toward the lens, crosshatched shadow wedges over flat cobalt and red fills, noon light glinting in white ticks on her sweat. No text or logo.',
        'Crosshatched primary hero cel of an adult river guide hauling a stranded ox out of a flooded ford by its halter, sunflower-yellow oilskin coat, heavy variable ink contour, hatched shadows in dark cobalt under the churning water. No text or logo.',
        'Crosshatched primary hero cel of an adult baker quietly kneading dough at dawn in a small tiled bakery, flour on her forearms, the same thick manga contour and pen-hatched shadow wedges on a calm task, red apron and cobalt tiles. No text or logo.',
      ],
    },
    'SP05-133': {
      name: 'Deadpan Filigree Brick Comedy',
      dna: sh({
        aesthetic:
          'Straight-faced comedy anime: lace-like filigree curls and ornate decoration interrupted by blunt brick-square forms and a face kept completely blank with dot eyes and a flat mouth line.',
        color_and_tone:
          'Clean pastel lilac, mint and cream for the ornate parts; flat brick-tan and black for the blunt blocks; strong black-white contrast.',
        lighting_and_shadow:
          'Flat even light with one hard cel shadow; blunt blocks get a solid black side plane like cut stone.',
        texture_and_material:
          'Smooth cel fills; filigree drawn in fine uniform pen line, blocky forms in a heavy uniform outline with no taper.',
        camera_and_composition:
          'Keep the requested framing; set the blank face centered and symmetric while ornate shapes frame it formally.',
        atmosphere_and_mood: 'Absurd deadpan wit; the face never reacts to anything around it.',
        rendering_and_quality:
          'Exactly two line weights, fine filigree and heavy block, with frozen symmetric poses so the joke is the contrast between ornament and bluntness.',
        key_features:
          'expressionless dot-eyed face; filigree against brick-square forms; pastel lilac and mint; heavy uniform block outline; symmetric frozen staging',
      }),
      avoid: [...AVOID, 'cream puff prop', 'magic-school crest', 'wand duel pose'],
      briefs: [
        'Deadpan filigree brick comedy of an adult knight calmly lifting a fallen stone gargoyle above his head with one hand, face completely blank with dot eyes, lace-like iron gate curls framing brick-square muscles, pastel lilac sky, heavy uniform block outline. No text or logo.',
        'Deadpan filigree brick comedy of an adult noblewoman at a masked ball waltzing stiffly with an empty suit of armor, both faces blank, filigree chandeliers in mint and cream, symmetric frozen staging. No text or logo.',
        'Deadpan filigree brick comedy of an adult tailor quietly threading a needle at a window, expressionless dot eyes, ornate pastel curls of draped fabric around square blunt hands, completely still. No text or logo.',
      ],
    },
    'SP05-134': {
      name: 'Fluorescent Everyday Snap Action',
      dna: sh({
        aesthetic:
          'Everyday-object action anime: calm thin contours and flat retail color, broken by a single snapped motion where one limb or object becomes a short straight smear with crisp speed ticks.',
        color_and_tone:
          'Pale fluorescent white, mint and cool grey dominate; one warm tangerine accent marks the snapped element.',
        lighting_and_shadow:
          'Flat overhead cool-white wash with almost no modelling; only the snapped element casts a crisp short shadow.',
        texture_and_material:
          'Smooth flat fills and fine even lines; the smear is three to five parallel straight strokes, never a soft blur.',
        camera_and_composition:
          'Keep the requested framing; stack the scene in clear horizontal lanes and let the snap cut diagonally across one lane.',
        atmosphere_and_mood: 'Mundane calm with one instant of startling precision.',
        rendering_and_quality:
          'Minimal detail and clean shapes, with the snap the only streaked element in the frame.',
        key_features:
          'calm thin contours; one snapped straight smear; pale fluorescent palette; single tangerine accent; horizontal lane staging',
      }),
      avoid: [...AVOID, 'apron-wearing retired assassin', 'shop counter'],
      briefs: [
        'Fluorescent everyday snap action of an adult castle cook catching three falling copper pots at once in a stone kitchen, one arm snapped into a straight parallel-stroke smear with crisp speed ticks, pale cool-white walls, a tangerine hearth flame as the only warm accent. No text or logo.',
        'Fluorescent everyday snap action of an adult courier on foot flicking a spinning parcel up onto a third-floor balcony, the parcel a short snapped smear, flat mint and grey facades stacked in horizontal lanes. No text or logo.',
        'Fluorescent everyday snap action of an adult laundromat attendant folding a white sheet under flat fluorescent light, calm thin contours and mint-grey fills, only the last flick of the sheet drawn as a small snapped smear. No text or logo.',
      ],
    },
    'SP05-032': {
      dna: sh({
        aesthetic:
          'Dark modern exorcism anime: confident brush-pen contours, large spotted black shadow masses, and supernatural energy drawn as ink-smoke ribbons rimmed in cyan and violet.',
        color_and_tone:
          'Near-black ink and cool concrete greys with only two accents, electric cyan and bruise violet, both reserved for energy edges.',
        lighting_and_shadow:
          'Hard side light carves half of each face into solid black, with a thin cyan-violet rim along the lit edge.',
        texture_and_material:
          'Dry brush-pen grain at contour tails, spotted blacks, and ink-smoke bands with feathered edges.',
        camera_and_composition:
          'Keep the requested framing; tilt the horizon a few degrees and compress space around the focal form with deep black gaps.',
        atmosphere_and_mood: 'Coiled menace and cool confidence, danger held in shadow.',
        rendering_and_quality:
          'Big black shapes read first; smoke ribbons and rims carry the only color, with no particle confetti.',
        key_features:
          'brush-pen contour; spotted black masses; ink-smoke energy ribbons; cyan-violet rim light; tilted horizon',
      }),
      avoid: [...AVOID, 'blindfold', 'finger talisman', 'eye tattoo'],
      briefs: [
        'Gritty urban curses anime of an adult exorcist monk facing a many-armed shadow creature in a ruined abbey chapel, ink-smoke ribbons rimmed cyan and violet coiling from his raised palm, half his face carved into solid spotted black, horizon tilted. No text or logo.',
        'Gritty urban curses anime of an adult night-shift nurse walking an empty hospital corridor while an ink-smoke shape clings to the ceiling above her, brush-pen contour, cool concrete greys, one violet rim on her cap. No text or logo.',
        'Gritty urban curses anime of an adult tattoo artist quietly cleaning her needles at a steel counter late at night, spotted black shadows and dry brush-pen contour, only a faint violet rim on her cheek, no creature and no energy. No text or logo.',
      ],
    },
    'SP05-035': {
      dna: sh({
        aesthetic:
          'Vertical-survival anime: thick sharp contours with harsh stress lines on faces and knuckles, figures dwarfed by colossal walls and cliffs, and taut cable-line motion trails.',
        color_and_tone:
          'Cold slate, muted olive, sand and bone neutrals, with one small ember-orange accent on the focal figure.',
        lighting_and_shadow:
          'Overcast top light, grouped cool shadows, and a narrow warm edge only on the focal figure.',
        texture_and_material:
          'Broad untextured value planes; stone drawn as stacked vertical strata lines, fabric as stiff folds.',
        camera_and_composition:
          'Keep the requested framing; favor steep worm-eye or plunging overhead views where the request allows, with long verticals.',
        atmosphere_and_mood: 'Vertigo, grit and stubborn survival against sheer height.',
        rendering_and_quality:
          'Hard stress-line hatching under eyes and along tendons, crisp silhouettes against flat pale sky.',
        key_features:
          'facial stress lines; towering vertical strata; taut cable motion trails; cold slate and olive palette; plunging verticals',
      }),
      avoid: [...AVOID, 'wing emblem', 'waist-mounted grapple rig'],
      briefs: [
        'Gritty wallbound survival anime of an adult climber in a leather harness swinging across the face of a sheer thousand-foot fortress wall on a taut cable, cable-line motion trail behind her, stress lines on her knuckles, plunging overhead view into fog. No text or logo.',
        'Gritty wallbound survival anime of an adult bell-ringer hauling a massive rope inside a narrow stone tower shaft, worm-eye view up the vertical strata, cold slate light from a slit window, ember-orange scarf. No text or logo.',
        'Gritty wallbound survival anime of an adult shepherd resting against the foot of a colossal olive-grey cliff while his flock grazes, stacked vertical strata towering above, calm face with only faint stress lines. No text or logo.',
      ],
    },
    'SP05-036': {
      dna: sh({
        aesthetic:
          'Late-war anime drama: thin, slightly scratchy contours over brush-textured painted backgrounds, desaturated like old wartime photographs under a soft film grain.',
        color_and_tone:
          'Charcoal, ash grey, dust ochre and faded khaki, with worn crimson or tarnished gold as the only accent.',
        lighting_and_shadow:
          'Diffuse smoky daylight, soft graded shadows, and a narrow pale rim separating figures from haze.',
        texture_and_material:
          'Visible bristle marks in skies, walls and smoke; faint grain laid evenly over the cels.',
        camera_and_composition:
          'Keep the requested framing; asymmetric compositions set small figures against large, heavy painted masses.',
        atmosphere_and_mood: 'Mournful gravity and the weight of consequence.',
        rendering_and_quality:
          'Thin lines with soft modelled cel shading, painterly backgrounds and restrained color.',
        key_features:
          'brush-textured painted backgrounds; desaturated wartime palette; thin scratchy contour; soft film grain; small figures against heavy masses',
      }),
      avoid: [...AVOID, 'armband insignia'],
      briefs: [
        'Colossal war drama anime of an adult widow in a grey shawl at the edge of a burned medieval village field, smoke columns painted with visible bristle texture, a tarnished gold locket the only warm accent, soft film grain. No text or logo.',
        'Colossal war drama anime of an adult cavalry scout leading a limping mule along a muddy trench under an ash-grey sky, small figures against a heavy painted hillside, thin scratchy contours. No text or logo.',
        'Colossal war drama anime of an adult postmistress sorting letters at a wooden counter by a dusty window, desaturated ochre light, thin scratchy lines and soft grain on an ordinary afternoon. No readable letters or logo.',
      ],
    },
    'SP05-039': {
      dna: sh({
        aesthetic:
          'Bright adventure-TV anime: slim clean contours and simple sunlit cel color, with inner power drawn as a translucent, wobbling double outline that hugs a figure like heat shimmer.',
        color_and_tone:
          'Clear sky blue, leaf green, white and warm skin tones; each shimmer outline in its own soft hue at low opacity.',
        lighting_and_shadow:
          'Clean midday light, one cel shadow tier, and a pale bounce under chins and brims.',
        texture_and_material:
          'Smooth flat fills; the shimmer outline slightly blurred and wavering, never a solid glow.',
        camera_and_composition:
          'Keep the requested framing; roomy compositions with clear intervals between figures, readable at a glance like a strategy map.',
        atmosphere_and_mood:
          'Playful curiosity sharpened by quiet calculation, bright and open but always a step ahead.',
        rendering_and_quality:
          'Crisp lines, minimal texture, and the shimmer halo only where the prompt shows focus or effort.',
        key_features:
          'slim clean contour; translucent wobbling aura outline; sunlit cel palette; clear figure intervals; one-tier cel shadow',
      }),
      avoid: [...AVOID, 'spiky white-haired boy', 'playing-card weapon'],
      briefs: [
        'Tactical adventure shonen anime of an adult ranger balancing on one foot atop a tall stone pillar in a canyon, a translucent sky-blue double outline wobbling around her like heat shimmer, slim clean contours, clear midday sun. No text or logo.',
        'Tactical adventure shonen anime of two adult chess rivals facing each other across a board on a windswept cliff terrace, each wrapped in a different translucent shimmer outline, ember and teal, clear interval between them. No readable pieces, text or logo.',
        'Tactical adventure shonen anime of an adult beekeeper lifting a honeycomb frame in a sunny meadow, slim contours and one-tier cel shadow, no shimmer outline at all on this calm task. No text or logo.',
      ],
    },
    'SP05-121': {
      name: 'Printed-Wave Effect Trail Cel',
      dna: sh({
        aesthetic:
          'Polished digital cel anime whose motion and energy trails are drawn as woodblock-print elements: curling wave crests, stylized flame tongues and wind bands in flat graded color.',
        color_and_tone:
          'Winter blue, warm amber and cream on figures; trails in indigo-to-white or vermilion-to-gold bokashi gradients.',
        lighting_and_shadow:
          'Soft cinematic key with a warm glow where a trail passes, cool grouped shadows elsewhere.',
        texture_and_material:
          'Smooth digital cel on figures; trails with flat print color, carved outline and faint paper grain.',
        camera_and_composition:
          'Keep the requested framing; trails curve in nested arcs around the subject and leave it fully legible.',
        atmosphere_and_mood:
          'Ceremonial grace and restrained resolve, motion flowing like a performed rite rather than a brawl.',
        rendering_and_quality:
          'Clear contrast between soft digital shading on figures and flat printed trails; garment patterns kept small.',
        key_features:
          'woodblock-print effect trails; bokashi-graded waves and flames; clean digital cel figures; winter blue and amber; nested trail arcs',
      }),
      avoid: [...AVOID, 'checkered haori', 'bamboo muzzle', 'hanafuda earrings'],
      briefs: [
        'Printed-wave effect trail cel of an adult lantern-bearer spinning through a snowy pine forest at night, her swinging lantern leaving an indigo woodblock wave crest with white curling foam, soft digital cel shading on her figure. No text or logo.',
        'Printed-wave effect trail cel of a grey heron lifting off a frozen mountain pond, its wingbeats leaving flat printed wind bands in vermilion-to-gold bokashi, winter blue ice below. No text or logo.',
        'Printed-wave effect trail cel of an adult tea master pouring water from an iron kettle in a quiet tatami room, the steam a single small printed curl in grey bokashi, no added energy trails. No text or logo.',
      ],
    },
    'SP05-124': {
      name: 'Ultramarine Glare Foreshortening',
      dna: sh({
        aesthetic:
          'Hyper-focused competition anime: razor-clean contours, extreme wide-lens foreshortening, and eyes that trail streaks of ultramarine light while backgrounds dissolve into converging blue vectors.',
        color_and_tone:
          'Electric ultramarine, ink black, white and cool cyan; skin in cool pale tones.',
        lighting_and_shadow:
          'Hard blue-white rim from behind, cyan underlight on faces, deep blue shadow planes.',
        texture_and_material: 'Clean vector layers with hard-edged glow bands and no grain.',
        camera_and_composition:
          'Keep the requested framing; exaggerate foreshortening toward the lens and aim concentric wedges at the focal eye.',
        atmosphere_and_mood: 'Predatory concentration, ego sharpened to a point.',
        rendering_and_quality:
          'Sharp vector lines, glowing eye-light trails, and a background reduced to converging vectors.',
        key_features:
          'ultramarine eye-light trails; extreme wide-lens foreshortening; converging blue vector backgrounds; blue-white rim; hard-edged glow',
      }),
      avoid: [...AVOID, 'soccer kit copy'],
      briefs: [
        'Ultramarine glare foreshortening of an adult archer drawing a longbow on a torchlit tournament field, fingers foreshortened huge toward the lens, a streak of ultramarine light trailing from her eye along the arrow line, background dissolved into converging blue vectors. No text or logo.',
        'Ultramarine glare foreshortening of an adult sprinter exploding off the blocks on an empty night track, one spiked shoe foreshortened into the lens, blue-white rim light, cyan eye trail. No text or logo.',
        'Ultramarine glare foreshortening of an adult watchmaker peering through a loupe at a tiny gear, tweezers foreshortened toward the viewer, cool cyan underlight and a thin ultramarine eye streak on a completely still task. No text or logo.',
      ],
    },
    'SP05-128': {
      name: 'Inverted Negative Ink Opera',
      dna: sh({
        aesthetic:
          'Ceremonial ink anime that flips into photographic negative: broad black brush contours, huge ivory fields, and one region inverted so shadows turn white and highlights black.',
        color_and_tone:
          'Black, ivory and deep violet; the inverted region swaps black and white and carries one saturated crimson flash.',
        lighting_and_shadow:
          'Stark top light and deep shadow masses cut by crisp white gaps; inside the inverted zone light reads as black.',
        texture_and_material:
          'Solid ink fields with faint paper grain and dry-brush tails on the longest strokes.',
        camera_and_composition:
          'Keep the requested framing; formal, near-symmetric staging with one strong diagonal and wide negative space.',
        atmosphere_and_mood:
          'Solemn grandeur that turns suddenly cold, stillness broken by one stark flash.',
        rendering_and_quality:
          'Flat masses and clean negative cuts, with the inversion confined to one region or silhouette.',
        key_features:
          'partial photographic-negative inversion; broad black brush contour; ivory negative space; single crimson flash; formal diagonal',
      }),
      avoid: [...AVOID, 'black hakama with white sash', 'skull mask'],
      briefs: [
        'Inverted negative ink opera of an adult bone-pale king rising from a throne in a vaulted hall, the right half of the frame flipped into photographic negative with white shadows, a single crimson flash across his cloak, broad black brush contours. No text or logo.',
        'Inverted negative ink opera of an adult priestess releasing a flock of crows from a cathedral balcony, the crows inverted to white against a black sky, ivory stone and one violet sash. No text or logo.',
        'Inverted negative ink opera of an adult cellist tuning her instrument alone on an empty stage, broad brush contours and a vast ivory field, only the cello shadow inverted, no crimson and no action. No text or logo.',
      ],
    },
    'SP05-131': {
      name: 'Sky-Blue Low-Angle Brawler Cel',
      dna: sh({
        aesthetic:
          'Street-youth anime: heavy clean contours with sharp tapered ends, low worm-eye angles, and flapping coats against a wide saturated sky with towering white clouds.',
        color_and_tone:
          'Saturated sky blue, cloud white and black, with one warm vermilion or spring-green accent.',
        lighting_and_shadow:
          'Bright sun behind clouds, figures backlit, hard shadow blocks with a narrow bright edge.',
        texture_and_material:
          'Smooth cel; cloud edges as crisp scalloped lines, cloth folds as sharp tapered strokes.',
        camera_and_composition:
          'Keep the requested content; push a low angle and forceful diagonals with sky filling over half the frame.',
        atmosphere_and_mood:
          'Brazen confidence and protective loyalty, the open sky making every stance feel larger.',
        rendering_and_quality:
          'Decisive line weight and broad sky, with cloth flutter lines only where wind or motion already exists.',
        key_features:
          'worm-eye low angle; sky blue and cloud white; tapered contour ends; flapping cloth folds; backlit hard shadows',
      }),
      avoid: [...AVOID, 'numbered gang jacket', 'bandaged knuckles'],
      briefs: [
        'Sky-blue low-angle brawler cel of three adult fishermen standing on a harbor seawall to face an incoming storm, worm-eye angle, oilskin coats flapping in sharp tapered strokes, towering scalloped clouds filling the sky. No text or logo.',
        'Sky-blue low-angle brawler cel of an adult pigeon keeper releasing a burst of birds from a rooftop coop, low angle into saturated blue sky, vermilion jacket, backlit hard shadows. No text or logo.',
        'Sky-blue low-angle brawler cel of an adult roofer eating a rice ball on a ridge beam at lunch, sitting still, huge sky and white clouds behind, only a light breeze in his sleeves. No text or logo.',
      ],
    },
    'SP05-135': {
      name: 'Broken-Rule Halftone Shatter',
      dna: sh({
        aesthetic:
          'Rule-breaking action anime: the picture cracked into angular glass-like shards, each shard shifting color and halftone, with uneven broken contours and abrupt cutout breaks.',
        color_and_tone:
          'Black and warm coral base; individual shards flip to bright yellow or cobalt.',
        lighting_and_shadow:
          'Hard edge separation, each shard lit on its own terms with small bright cuts.',
        texture_and_material:
          'Rough ink, broken halftone dot fields and dry scattered texture in the shard gaps.',
        camera_and_composition:
          'Keep the requested framing; fracture lines radiate from one focal point and the subject stays readable across the shards.',
        atmosphere_and_mood: 'Mischief and unstable luck, the rules visibly breaking.',
        rendering_and_quality:
          'Broken contour, small shard displacement and a tightly controlled accent palette.',
        key_features:
          'glass-shard fracture; halftone that changes per shard; coral and black with yellow or cobalt; broken contours; radial fracture focal point',
      }),
      avoid: [...AVOID, 'cracked mirror prop'],
      briefs: [
        'Broken-rule halftone shatter of an adult gambler flipping a gold coin in a torchlit dungeon tavern, the whole picture cracked into glass-like shards radiating from the coin, each shard in coral, yellow or cobalt halftone. No text or logo.',
        'Broken-rule halftone shatter of an adult stuntwoman falling backward off a clock-tower ledge, the fracture lines spreading from her outstretched hand, rough broken ink contours, cobalt and coral shards. No text or logo.',
        'Broken-rule halftone shatter of an adult florist trimming stems at a workbench, the image split into a few calm coral and cobalt halftone shards, her ordinary task unchanged. No text or logo.',
      ],
    },
    'SP05-136': {
      name: 'Etched Branch-Lightning Cel',
      dna: sh({
        aesthetic:
          'Magic-squad anime: thick spiky contours, fine etched engraving in leather, metal and stone, and energy drawn as jagged branching lightning in black-edged gold.',
        color_and_tone:
          'Deep forest green, black, ivory and restrained gold; lightning gold with black edges.',
        lighting_and_shadow:
          'Clear cel shadows with bright edge accents only where lightning passes.',
        texture_and_material:
          'Polished cel with thin etched engraving lines on hard materials, cloth kept plain.',
        camera_and_composition:
          'Keep the requested framing; orderly clusters linked by broad diagonals, lightning branches framing rather than covering the subject.',
        atmosphere_and_mood: 'Rowdy determination held inside a formal structure.',
        rendering_and_quality:
          'Precise linework, spiky hair and cloth ends, ornament kept selective.',
        key_features:
          'black-edged gold lightning branches; etched engraving detail; forest green, black and gold; spiky contour ends; polished cel',
      }),
      avoid: [...AVOID, 'five-leaf clover', 'floating spellbook', 'bull emblem'],
      briefs: [
        'Etched branch-lightning cel of an adult hedge-witch striking a standing-stone circle at midnight, black-edged gold lightning branching from her raised staff across forest-green sky, etched engraving on the stones. No text or logo.',
        'Etched branch-lightning cel of an armored adult knight kneeling as lightning splits the oak tree behind him, fine etched engraving on his breastplate, spiky cloak ends, green-black storm. No text or logo.',
        'Etched branch-lightning cel of an adult bookbinder tooling gold ornament into a leather cover by candlelight, thin etched lines and polished cel, no lightning at all. No readable text or logo.',
      ],
    },
    'SP05-138': {
      name: 'Sumi-Black Neon Edge Stillness',
      dna: sh({
        aesthetic:
          'Cinematic ink anime: severe dry sumi-brush blacks, long still holds, and a single thin neon edge of magenta or cyan on otherwise matte darkness.',
        color_and_tone:
          'Deep indigo, ink black and bone white, with one neon magenta or cyan edge line.',
        lighting_and_shadow:
          'Low hard light from one side, broad matte shadow masses, the neon edge on a single contour only.',
        texture_and_material:
          'Dry brush grain at contour tails, matte dark fields and sparse speck grain.',
        camera_and_composition:
          'Keep the requested content; organize it in wide horizontal bands like a cinema frame, with deliberate empty space and one strong diagonal.',
        atmosphere_and_mood:
          'Quiet grief hardening into resolve, long silences held before a single decisive edge.',
        rendering_and_quality:
          'Precise dark contour, minimal detail, and exactly one neon edge in the frame.',
        key_features:
          'severe sumi-brush black; single neon edge line; wide horizontal banding; long still hold; matte indigo darks',
      }),
      avoid: [...AVOID, 'goldfish spirits', 'katana near-plane'],
      briefs: [
        'Sumi-black neon edge stillness of an adult mourner kneeling before a burned-out forge at night, severe dry sumi-brush black filling two thirds of the frame, one thin neon magenta edge along her shoulder, wide horizontal bands. No text or logo.',
        'Sumi-black neon edge stillness of a black stallion standing in a flooded rice field at dusk, matte indigo water in wide horizontal bands, one cyan edge along its mane. No text or logo.',
        'Sumi-black neon edge stillness of an adult cook ladling broth at a quiet late-night counter, dry brush grain, matte dark fields, a single cyan edge on the rising steam. No text or logo.',
      ],
    },
    'SP05-139': {
      name: 'Crosshatched Giant-Scale Panic',
      dna: sh({
        aesthetic:
          'Horror-scale action translated to color anime: coarse dense crosshatching, grimacing faces, and enormous forms looming over tiny figures, with dust and steam drawn as layered hatch masses.',
        color_and_tone: 'Muted olive, stone grey and dried brown with a pale sickly flesh accent.',
        lighting_and_shadow:
          'Hazy backlight through dust, hard silhouette shadows, faces half buried in hatching.',
        texture_and_material:
          'Dry pen crosshatch in every shadow, abrasion on stone, plumes built as hatched volumes.',
        camera_and_composition:
          'Keep the requested framing; exaggerate scale with tiny foreground figures and a vast form overhead in compressed depth bands.',
        atmosphere_and_mood:
          'Bleak urgency and helpless awe, tiny figures dwarfed by something far too large.',
        rendering_and_quality:
          'Crosshatched shadows and clear silhouettes, dread through scale rather than gore.',
        key_features:
          'coarse dense crosshatching; extreme scale contrast; hatched dust plumes; olive and stone palette; grimacing faces',
      }),
      avoid: [...AVOID, 'exposed-muscle giant', 'gore', 'eaten body'],
      briefs: [
        'Crosshatched giant-scale panic of adult villagers fleeing across a stone bridge as the face of a colossal stone golem rises through dust behind them, dense dry crosshatching, tiny grimacing figures, hatched dust plumes. No text or logo.',
        'Crosshatched giant-scale panic of an adult fisherman in a rowboat beneath the looming hull of a rotting ghost ship, coarse crosshatch on the planks, olive fog in compressed depth bands. No text or logo.',
        'Crosshatched giant-scale panic of an adult cobbler repairing a boot at a workbench, crosshatched shadows and stone-grey walls, calm face and nothing looming, the ordinary task left intact. No text or logo.',
      ],
    },
    'SP05-140': {
      name: 'Pale Calm Spell Geometry',
      dna: sh({
        aesthetic:
          'Quiet fantasy anime: fine exact outlines, pale matte color, and magic drawn as thin concentric rings and polygons of light, precise and unhurried.',
        color_and_tone:
          'Pale cyan, parchment, lavender-grey and soft sage, with restrained cool shadow.',
        lighting_and_shadow:
          'Soft diffuse daylight, gentle value transitions, a few clean bright edges on the rings.',
        texture_and_material: 'Smooth matte color, fine line detail and very little grain.',
        camera_and_composition:
          'Keep the requested framing; open spacing with generous sky or floor around precise focal geometry.',
        atmosphere_and_mood:
          'Understated authority and reflective calm, power shown without strain or noise.',
        rendering_and_quality:
          'Exact contours and a quiet palette, geometry lines thin and legible with no glyphs.',
        key_features:
          'concentric geometric light rings; pale cyan and parchment; fine exact outline; open quiet spacing; soft diffuse light',
      }),
      avoid: [...AVOID, 'pointed ears with white twin tails'],
      briefs: [
        'Pale calm spell geometry of an adult hermit mage holding back an avalanche with one raised hand in a pale snowfield, thin concentric rings and hexagons of light suspended before the snow wall, fine exact outlines. No text or logo.',
        'Pale calm spell geometry of a ruined stone observatory at dawn where thin geometric rings orbit a broken brass telescope, parchment sky and lavender-grey stone, open spacing. No text or logo.',
        'Pale calm spell geometry of an adult gardener watering a row of lavender in a quiet monastery garden, pale matte color and fine outlines, no rings or magic at all. No text or logo.',
      ],
    },
    'SP05-037': {
      dna: sh({
        aesthetic:
          'Comedy action anime built on the impact frame: calm simple cel shots where one moment snaps to high-contrast black, white and red with thick radial wedges and a jagged silhouette.',
        color_and_tone:
          'Muted soft cel color for the calm part; the impact zone in black, white and signal red with a yellow spark.',
        lighting_and_shadow:
          'Flat even light, then hard inverted light with pure black shadows inside the impact zone.',
        texture_and_material:
          'Clean cel fills, impact lines as thick tapered wedges, untouched negative space.',
        camera_and_composition:
          'Keep the requested framing; a broad empty stage with oversized radial punctuation centered on one small detail.',
        atmosphere_and_mood: 'Deadpan timing and an absurdly oversized reaction.',
        rendering_and_quality:
          'Deliberate disproportion between a trivial action and a huge impact graphic.',
        key_features:
          'single impact frame zone; black, white and signal red; thick radial wedges; muted calm cel; broad empty stage',
      }),
      avoid: [...AVOID],
      briefs: [
        'Impact frame comedy hero anime of an adult armored knight stubbing his toe on a castle stair, the stair corner bursting into a black, white and red impact frame with thick radial wedges while the rest of the scene stays muted and soft. No text or logo.',
        'Impact frame comedy hero anime of an adult farmer yanking a giant turnip out of a field, the root snapping free inside a jagged black-red impact zone with a yellow spark, broad empty sky. No text or logo.',
        'Impact frame comedy hero anime of an adult librarian stamping a single book at a quiet desk, only the tiny stamp contact drawn as a small red-black impact frame, everything else calm and muted. No readable text or logo.',
      ],
    },
    'SP05-129': {
      name: 'Dual-Detail Deadpan Satire',
      dna: sh({
        aesthetic:
          'Satirical hero anime with split detail levels: the main figure drawn in minimal round lines with dot eyes, everything around it rendered in dense, polished detail.',
        color_and_tone:
          'Clean black-white values with saturated warm and cool accents; the simple figure in flat pale colors.',
        lighting_and_shadow:
          'Dramatic hard lighting and polished highlights on the detailed parts; the simple figure lit flat.',
        texture_and_material:
          'Smooth cel fills; detailed zones with fine hatching, muscle, scale and stone detail.',
        camera_and_composition:
          'Keep the requested framing; absurd scale contrast with the simple figure placed precisely in broad quiet space.',
        atmosphere_and_mood:
          'Deadpan grandeur and understated satire, the plain figure unimpressed by an epic world.',
        rendering_and_quality:
          'The detail gap is the joke: one plain figure against a lavishly finished world.',
        key_features:
          'minimal dot-eyed main figure; hyper-detailed surroundings; polished hard lighting; flat pale figure fill; absurd scale contrast',
      }),
      avoid: [...AVOID, 'bald caped hero', 'yellow jumpsuit'],
      briefs: [
        'Dual-detail deadpan satire of an adult dragon-hunter drawn as a plain round-lined figure with dot eyes, yawning in front of an enormous, lavishly detailed armored dragon with polished scales and hard dramatic light. No text or logo.',
        'Dual-detail deadpan satire of an adult tourist with a blank dot-eyed face eating a plain sandwich atop a gothic cathedral spire, the carved stone saints around her rendered in dense polished detail. No text or logo.',
        'Dual-detail deadpan satire of an elderly adult pensioner reading a blank newspaper on a park bench, drawn simply with dot eyes, while the sparrows at her feet are rendered in dense feather detail. No readable text or logo.',
      ],
    },
    'SP05-132': {
      name: 'Full-Color Manhwa Shadow Glow',
      dna: sh({
        aesthetic:
          'Full-color vertical webcomic action: smooth airbrushed digital painting, narrow dark contours, deep black-violet shadows, glowing cyan eyes and smoky shadow silhouettes rising from the ground.',
        color_and_tone: 'Black, indigo and violet with cold cyan highlights; skin cool and pale.',
        lighting_and_shadow:
          'Deep value falloff and restrained cool rims; glow confined to eyes and a few edges.',
        texture_and_material:
          'Soft airbrushed gradients, smoke as feathered wisps, crisp luminous edges.',
        camera_and_composition:
          'Keep the requested framing; tall stacked planes and strong vertical scale suited to scroll reading.',
        atmosphere_and_mood:
          'Quiet awe and rising dominance, darkness gathering upward toward a cold glow.',
        rendering_and_quality:
          'Glossy digital finish with dark tonal depth and thin cyan edges, no panel borders.',
        key_features:
          'airbrushed digital painting; glowing cyan eyes; smoky shadow silhouettes; black and violet palette; tall vertical staging',
      }),
      avoid: [
        ...AVOID,
        'shadow soldier army lineup',
        'hooded black hunter coat',
        'status window UI',
      ],
      briefs: [
        'Full-color manhwa shadow glow of an adult necromancer queen standing in a flooded crypt as a single smoky shadow wolf rises from the black water behind her, glowing cyan eyes, airbrushed violet gradients, tall vertical staging. No text or logo.',
        'Full-color manhwa shadow glow of an adult raid healer climbing a vertical shaft in a crystal cavern, stacked planes of violet crystal above, cold cyan edge light on her hands. No text or logo.',
        'Full-color manhwa shadow glow of an adult night guard reading by a single desk lamp in a silent museum hall, airbrushed gradients and deep violet shadows, no smoke and no glowing eyes. No readable text or logo.',
      ],
    },
    'SP05-040': {
      dna: sh({
        aesthetic:
          'Composited digital-effects anime: crisp cel characters layered over richly lit, near-photographic painted backgrounds with volumetric light shafts, drifting embers and shallow depth-of-field blur.',
        color_and_tone: 'Nocturnal navy and ivory with glowing cyan or gold particle accents.',
        lighting_and_shadow:
          'Motivated volumetric beams, bloom around light sources, a controlled rim on characters.',
        texture_and_material:
          'Clean cel on figures, finely detailed painted backgrounds, particles soft and round.',
        camera_and_composition:
          'Keep the requested framing; lens-like depth with blurred foreground elements, sharp midground and bokeh in the distance.',
        atmosphere_and_mood: 'Calm formality in the moment before a storm.',
        rendering_and_quality:
          'Tight compositing: sharp cel edges, soft volumetric light, particles and bloom kept in check.',
        key_features:
          'cel figures over detailed painted backgrounds; volumetric light shafts; drifting embers and bokeh; navy and ivory; shallow depth of field',
      }),
      avoid: [...AVOID],
      briefs: [
        'Blade field urban fantasy anime of an adult alchemist in a cathedral crypt watching a ring of cold blue embers spiral above a stone altar, volumetric light shafts through dust, crisp cel figure over a detailed painted vault, shallow depth of field. No text or logo.',
        'Blade field urban fantasy anime of a white stag crossing a snowy temple courtyard at night, gold embers drifting, blurred foreground lantern bokeh, navy sky and ivory snow. No text or logo.',
        'Blade field urban fantasy anime of an adult violin maker varnishing a violin in a workshop at dusk, volumetric window shafts and gentle dust motes, shallow depth of field, no embers or magic. No text or logo.',
      ],
    },
    'SP05-123': {
      name: 'White-Core Flame Halo Cel',
      dna: sh({
        aesthetic:
          'Fire-brigade anime: flames drawn as flat stylized tongues with a hard white-hot core, orange body and scarlet edge, set in radiating halo rings over strong dark contours and film grain.',
        color_and_tone:
          'Charcoal and ivory with bright orange, scarlet and warm yellow; every flame core pure white.',
        lighting_and_shadow:
          'Fire as the primary source: warm uplight, decisive silhouette shadows, subtle light-leak bloom.',
        texture_and_material: 'Dense flat color, light speckle grain and painted spark flecks.',
        camera_and_composition:
          'Keep the requested framing; concentric halo rings centered on the focal area with broad negative space.',
        atmosphere_and_mood:
          'Fervent, almost liturgical heat, fire treated as ritual rather than disaster.',
        rendering_and_quality:
          'Strong silhouette cuts, limited warm bloom and carefully placed ring geometry.',
        key_features:
          'white-hot flame cores; flat stylized flame tongues; radiating halo rings; charcoal and orange palette; light-leak film grain',
      }),
      avoid: [...AVOID, 'reflective-striped bunker gear', 'sharp-toothed grin', 'nun prayer pose'],
      briefs: [
        'White-core flame halo cel of an adult fire-priest walking unharmed out of a burning timber church, flames drawn as flat tongues with white-hot cores, a radiating halo ring behind her head, charcoal smoke and ivory ash. No text or logo.',
        'White-core flame halo cel of an adult foundry worker pouring molten bronze into a statue mould, the stream edged scarlet around a white core, concentric warm rings in the furnace mouth, light-leak grain. No text or logo.',
        'White-core flame halo cel of an adult shrine keeper lighting a row of oil lamps at dusk, small flat flame tongues with white cores, strong dark contours, no halo rings and no blaze. No text or logo.',
      ],
    },
    'SP05-125': {
      name: 'Hazard-Orange Monster Response Cel',
      dna: sh({
        aesthetic:
          'Civic-defense anime: sturdy dark contours, clean machine-precise vehicles and equipment in high-visibility orange and yellow, and scale measured by grid-like tick marks on structures.',
        color_and_tone:
          'High-visibility yellow and warm orange against deep blue-grey and pale neutral.',
        lighting_and_shadow: 'Even daylight, pale highlights and clearly separated shadow shapes.',
        texture_and_material:
          'Matte color blocks, panel seams and rivets, fine grain only in the darks.',
        camera_and_composition:
          'Keep the requested framing; wide clean frames with grid intervals that make scale measurable.',
        atmosphere_and_mood: 'Measured resilience and calm procedure under threat.',
        rendering_and_quality:
          'Stable silhouettes, crisp machine edges and controlled color blocks without chaos.',
        key_features:
          'hi-vis orange and yellow equipment; grid tick scale marks; sturdy dark contour; matte blue-grey; wide procedural framing',
      }),
      avoid: [...AVOID, 'numbered defense suit', 'glowing monster core'],
      briefs: [
        'Hazard-orange monster response cel of an adult crane operator in a hi-vis orange cab lifting a colossal fossil skull out of a quarry, machine-precise crane with grid tick marks along the boom, deep blue-grey rock. No text or logo.',
        'Hazard-orange monster response cel of an adult harbor pilot steering an orange tugboat to guide a stranded giant manta ray back to open water, wide clean frame, yellow floats, matte grey sea. No text or logo.',
        'Hazard-orange monster response cel of an adult road-crew worker repainting a yellow safety railing along a river path on a quiet morning, sturdy contours and matte color blocks, nothing monstrous. No text or logo.',
      ],
    },
    'SP05-126': {
      name: 'Acid Occult Color-Burst Smear',
      dna: sh({
        aesthetic:
          'Paranormal comedy anime: elastic bright contours, doubled reaction lines, and sudden palette flips into acid teal, hot pink and lime, with fluid smear frames melting shapes during fast motion.',
        color_and_tone:
          'Dark ink ground with teal, hot pink and lime bursts; the palette flips only inside the effect zone.',
        lighting_and_shadow:
          'Opposed bright accents and sharp shadow cuts, no literal glow source.',
        texture_and_material:
          'Clean cel with mottled translucent color regions; smears as streaked, melted shapes.',
        camera_and_composition:
          'Keep the requested framing; gather contrasting color rhythms around the focal area and leave room to breathe.',
        atmosphere_and_mood:
          'Buoyant surprise and romance-tinged chaos, color flipping with every startled beat.',
        rendering_and_quality:
          'Flexible contour, vivid color collision and controlled smear marks.',
        key_features:
          'acid teal, hot pink and lime; melting smear frames; doubled reaction lines; elastic contour; palette flips',
      }),
      avoid: [...AVOID, 'grey alien head', 'ghost grandmother'],
      briefs: [
        'Acid occult color-burst smear of an adult ghost-hunter couple tumbling down a haunted manor staircase, their bodies melting into teal and hot-pink smear frames, a lime spirit wisp overhead, doubled reaction lines. No text or logo.',
        'Acid occult color-burst smear of an adult ice skater spinning on a frozen lake at night, her spin melting into acid teal and lime smear frames against a dark ink sky. No text or logo.',
        'Acid occult color-burst smear of an adult man repotting a cactus on his balcony, doubled reaction lines only where he flinches from a spine, teal and pink palette, no ghost. No text or logo.',
      ],
    },
    'SP05-127': {
      name: 'Toxic Flower Etched Ink',
      dna: sh({
        aesthetic:
          'Garden-horror anime: fine etched contours, lush ornamental flowers and vines in poison pastels, broken by compact angular shapes and dry crosshatch in the shadows.',
        color_and_tone:
          'Muted jade, chalk and dark wine, with poison-pastel petals of lilac and coral.',
        lighting_and_shadow: 'Low-key shadow fields, dappled small pale highlights under foliage.',
        texture_and_material:
          'Dry ink grain with fine crosshatching in selected shadows; petals smooth and waxy.',
        camera_and_composition:
          'Keep the requested framing; layered shallow planes of foliage frame a clear focal path.',
        atmosphere_and_mood:
          'Beautiful menace, ornate and watchful, lovely petals hiding a quiet threat.',
        rendering_and_quality:
          'Fine etched detail, quiet dark values and carefully limited pastel accents.',
        key_features:
          'fine etched contour; poison-pastel flowers; jade, chalk and wine; dry crosshatch shadows; foliage framing planes',
      }),
      avoid: [...AVOID, 'white-robed shaved-head executioner', 'lotus-faced statue'],
      briefs: [
        'Toxic flower etched ink of an adult plague doctor wading waist-deep through a jungle of giant poison orchids, fine etched contours, lilac and coral petals, dry crosshatch in the jade shadows. No text or logo.',
        'Toxic flower etched ink of a moss-covered skeleton in rusted armor with coral and lilac flowers sprouting from its visor, wine-dark ground, etched ink detail. No text or logo.',
        'Toxic flower etched ink of an adult greenhouse keeper potting seedlings on a quiet morning, etched contours and pastel petals, crosshatched shadows under the benches. No text or logo.',
      ],
    },
    'SP05-038': {
      dna: sh({
        aesthetic:
          'Minimal psychic anime: plain forms drawn with lightly layered searching pencil contours in wide blank space, with a few peripheral shapes subtly warped as if bent by pressure.',
        color_and_tone:
          'Airy pastels, mostly paper white, with one small acid yellow-green accent.',
        lighting_and_shadow:
          'Soft flat values and pale, lightly drawn edges; almost no cast shadow.',
        texture_and_material:
          'Pencil grain under irregular translucent washes that stop short of the lines.',
        camera_and_composition:
          'Keep the requested framing; leave wide empty space and keep the few warped shapes near the focal area.',
        atmosphere_and_mood:
          'Quiet unease and introspection, pressure felt in the empty space more than seen.',
        rendering_and_quality:
          'Airy hand-drawn marks, sparse distortion and a large share of untouched paper.',
        key_features:
          'searching pencil contours; wide blank space; subtly warped peripheral shapes; airy pastels; acid yellow-green accent',
      }),
      avoid: [...AVOID],
      briefs: [
        'Psychedelic psychic minimalism of an adult fortune-teller seated at a small table in an empty white room, teacups around her subtly warping and lifting, searching pencil contours, one cup in acid yellow-green. No text or logo.',
        'Psychedelic psychic minimalism of an adult kite flier on a bare hill, the horizon line gently bending around her, airy pastel washes and vast untouched paper. No text or logo.',
        'Psychedelic psychic minimalism of an adult commuter waiting alone at an empty crosswalk, light pencil lines and pastel washes, only the curb line faintly bending. No text or logo.',
      ],
    },
    'SP05-130': {
      name: 'Paint-on-Glass Surge Burst',
      dna: sh({
        aesthetic:
          'Hand-painted eruption anime: frame-by-frame paint-on-glass smears, loose oil strokes and saturated overpaint bursting outward over simple, sturdy cel figures.',
        color_and_tone:
          'Acid pink, yellow-green and cyan against deep indigo; figures in plain muted cel color.',
        lighting_and_shadow:
          'Flat intense color with rough unlit edges; the paint itself reads as the light.',
        texture_and_material: 'Rough pencil, dry brush, wet oil smears and thumb-smudged paint.',
        camera_and_composition:
          'Keep the requested framing; clear focal zones with turbulent paint gathered around them.',
        atmosphere_and_mood:
          'Candid emotional overload breaking through calm, feeling spilling out as raw paint.',
        rendering_and_quality:
          'Raw paint crossings and acidic bursts while the figure silhouette stays sturdy and readable.',
        key_features:
          'paint-on-glass smears; thumb-smudged oil strokes; acid pink, lime and cyan; deep indigo ground; plain sturdy cel figures',
      }),
      avoid: [...AVOID, 'bowl-cut boy'],
      briefs: [
        'Paint-on-glass surge burst of an adult wandering oracle screaming on a cliff edge as smears of pink and cyan paint explode from her hair across a stormy indigo sky, thumb-smudged oil strokes, her figure plain cel. No text or logo.',
        'Paint-on-glass surge burst of a humpback whale breaching through a sea that turns into swirling wet oil paint, acid lime and pink spray, deep indigo night. No text or logo.',
        'Paint-on-glass surge burst of an adult office worker staring at a cup of coffee, the steam painted as tiny thumb-smudged oil swirls, the rest in plain muted cel, no eruption. No text or logo.',
      ],
    },
    'SP05-137': {
      name: 'Chalk-Schematic Inventor Cel',
      dna: sh({
        aesthetic:
          'Inventor adventure anime: clean cel figures overlaid with faint chalk schematic strokes, construction lines, cross-sections, arcs and dimension ticks without numbers.',
        color_and_tone: 'Mineral green, chalk white, warm mineral gold and dark ink.',
        lighting_and_shadow:
          'Clear pale highlights and stable dark value anchors; chalk lines stay unlit and flat.',
        texture_and_material:
          'Chalky dusty strokes over smooth cel fields, lightly granular color.',
        camera_and_composition:
          'Keep the requested framing; diagram-like layered spacing with open margins for the schematic lines.',
        atmosphere_and_mood:
          'Practical optimism and restless curiosity, every problem already half sketched into a solution.',
        rendering_and_quality:
          'Legible construction lines, mineral color and restrained chalk texture, never a readable formula.',
        key_features:
          'chalk schematic overlay; unnumbered dimension ticks; mineral green and chalk white; clean cel figures; open diagram margins',
      }),
      avoid: [...AVOID, 'stone crack lines on the face'],
      briefs: [
        'Chalk-schematic inventor cel of an adult inventor launching a hand-built wooden glider off a medieval castle wall, faint chalk construction lines tracing the wing ribs and flight arc, mineral green sky. No readable formulas, text or logo.',
        'Chalk-schematic inventor cel of a timber watermill in a mountain stream, chalk cross-section strokes revealing its hidden gears, mineral gold wood and chalk-white water. No readable text or logo.',
        'Chalk-schematic inventor cel of an adult apothecary grinding herbs with mortar and pestle, a single faint chalk arc following the pestle, clean cel and open margins. No text or logo.',
      ],
    },
    'SP05-031': {
      dna: sh({
        aesthetic:
          'Ink-wash action painting: calligraphic sumi strokes with fine tapers form contours and motion, bleeding into wet watercolor washes of jewel color over broad cel silhouettes.',
        color_and_tone:
          'Garnet, jade and lapis jewel accents on warm pale paper neutrals, with dark ink.',
        lighting_and_shadow:
          'Soft luminous edges and grouped cel shadows; washes glow where paper shows through.',
        texture_and_material:
          'Wet-in-wet bleeds, bloom rings at wash edges and dry-brush flicks at stroke ends.',
        camera_and_composition:
          'Keep the requested framing; choreographed curves balanced by open paper margins.',
        atmosphere_and_mood:
          'Graceful intensity and ceremonial poise, strength expressed as a single flowing brush gesture.',
        rendering_and_quality:
          'Broad color washes, controlled ornament and smooth calligraphic edges.',
        key_features:
          'calligraphic sumi strokes; wet jewel-color washes; bloom rings; open paper margins; dry-brush flicks',
      }),
      avoid: [...AVOID],
      briefs: [
        'Painterly blade fantasy anime of an adult dancer with long silk sleeves whirling through falling plum blossoms, each sleeve a single calligraphic sumi stroke bleeding into garnet wash, open paper margins. No text or logo.',
        'Painterly blade fantasy anime of a tiger leaping across a mountain stream, its stripes dry-brush sumi flicks bleeding into jade and lapis washes, bloom rings in the spray. No text or logo.',
        'Painterly blade fantasy anime of an adult weaver working a wooden loom in a quiet room, calligraphic ink contours and soft wet washes of lapis thread, graceful stillness. No text or logo.',
      ],
    },
    'SP05-033': {
      dna: sh({
        aesthetic:
          'Punk screen-print action poster: scratchy heavy contours, lopsided cutout shapes, ink splatter used as graphic pattern, halftone breaks and off-register red.',
        color_and_tone: 'Saturated red, black and warm paper, with one cool teal accent.',
        lighting_and_shadow: 'Flat high-contrast blocks with only a few white cuts.',
        texture_and_material:
          'Ink spatter, halftone dots and coarse screen texture with slight registration slip.',
        camera_and_composition:
          'Keep the requested framing; dense poster balance around an off-center focal mass with clean outer margins.',
        atmosphere_and_mood:
          'Unruly comedy and sudden surprise, loud and messy like a punk gig flyer.',
        rendering_and_quality: 'Rough printed marks, bold flat shapes and a clear poster rhythm.',
        key_features:
          'screen-print poster look; ink splatter pattern; off-register red; scratchy heavy contour; warm paper ground',
      }),
      avoid: [...AVOID],
      briefs: [
        'Chaotic splatter action poster of an adult rat-catcher sprinting through a monastery wine cellar with a sack of escaping rats, red ink splatter used as pattern, off-register black contours on warm paper. No text or logo.',
        'Chaotic splatter action poster of an adult punk drummer mid-fill, sticks and cymbals exploding into halftone red and black, one teal accent on the snare. No text or logo.',
        "Chaotic splatter action poster of an adult barber trimming a customer's hair, the falling clippings printed as black ink spatter, scratchy contours and off-register red on a calm task. No text or logo.",
      ],
    },
    'SP05-122': {
      name: 'Muted Cinematic Grime Frenzy',
      dna: sh({
        aesthetic:
          'Grounded cinematic anime: sober adult proportions, thin precise lines, desaturated film-graded color and handheld framing, with sudden violent motion shown as fluorescent streaks.',
        color_and_tone:
          'Soot grey, dull rust and pale concrete, with fluorescent yellow-green streak accents.',
        lighting_and_shadow:
          'Motivated practical light from overhead tubes or windows with soft grounded falloff.',
        texture_and_material:
          'Grime, scuffs and subtle film grain; lens-like shallow depth of field.',
        camera_and_composition:
          'Keep the requested content; handheld off-center framing, tight crops and shallow depth.',
        atmosphere_and_mood:
          'Worn tension and dry absurdity, exhausted people in grimy places doing strange things.',
        rendering_and_quality:
          'Restrained cinematic finish, grain confined to shadows, main silhouette always clear.',
        key_features:
          'desaturated film grade; handheld off-center framing; thin precise lines; fluorescent streak accents; grime and shallow depth',
      }),
      avoid: [...AVOID, 'chainsaw-headed figure', 'blood spray'],
      briefs: [
        'Muted cinematic grime frenzy of an adult gravedigger swinging his lantern in a rain-soaked cemetery at night, handheld off-center frame, a fluorescent yellow-green streak where the lantern arcs, soot-grey stones. No text or logo.',
        'Muted cinematic grime frenzy of an adult dog-catcher lunging for a runaway hound in a grimy concrete underpass, shallow depth of field, fluorescent streak on the snapping leash. No text or logo.',
        'Muted cinematic grime frenzy of an adult mechanic eating instant noodles on an upturned crate in a grimy garage, practical tube light, desaturated grade, no streaks. No text or logo.',
      ],
    },
    'SP05-025': {
      dna: sh({
        aesthetic:
          'Psychological-thriller anime: fine deliberate black strokes, gothic chiaroscuro at sharp dramatic angles, bone-white fields and one isolated vermilion accent.',
        color_and_tone: 'Ink black and bone white with a single restrained vermilion accent.',
        lighting_and_shadow:
          'Firm black-to-white shadow blocks with minimal midtone; faces split by hard light.',
        texture_and_material: 'Dry matte paper grain over otherwise clean flat fields.',
        camera_and_composition:
          'Keep the requested content; static asymmetric balance at a steep Dutch or overhead angle, one isolated accent.',
        atmosphere_and_mood:
          'Cerebral suspense and controlled stillness, every shadow suggesting a calculation in progress.',
        rendering_and_quality: 'Crisp edges, limited color, and quiet fields around the accent.',
        key_features:
          'gothic chiaroscuro; fine deliberate black stroke; bone-white fields; single vermilion accent; steep dramatic angle',
      }),
      avoid: [...AVOID, 'red apple motif'],
      briefs: [
        'Shadow notebook thriller anime of an adult inquisitor seated at the end of a long candlelit table staring at a single red wax seal, hard light splitting his face, steep overhead angle, bone-white tablecloth. No text or logo.',
        'Shadow notebook thriller anime of an adult detective on a spiral staircase looking down into darkness, dizzying overhead angle, fine black strokes, a vermilion scarf the only color. No text or logo.',
        'Shadow notebook thriller anime of an adult night-shift pharmacist peeling an orange at her kitchen table, hard black-to-white shadow blocks, the vermilion peel the only color. No text or logo.',
      ],
    },
    'SP05-148': {
      name: 'Amber Jazz-Age Ensemble Cel',
      dna: sh({
        aesthetic:
          'Prohibition-era ensemble anime: lively variable contours, many overlapping characters in syncopated clusters, period tailoring, flat amber and brass color with printed grain.',
        color_and_tone: 'Brass gold, amber, dark brown and ink black, with cream shirt fronts.',
        lighting_and_shadow: 'Warm lamplight edge highlights against crisp dark value blocks.',
        texture_and_material:
          'Subtle printed grain in flat color fields; pinstripes and felt drawn as sparse lines.',
        camera_and_composition:
          'Keep the requested framing; an irregular, syncopated rhythm of overlapping figures around the focal forms.',
        atmosphere_and_mood:
          'Buoyant disorder and dry wit, many stories colliding to one swinging beat.',
        rendering_and_quality:
          'Amber-black contrast, overlapping shapes and rhythm carried by spacing.',
        key_features:
          'overlapping ensemble clusters; brass and amber palette; period tailoring; printed grain; syncopated rhythm',
      }),
      avoid: [...AVOID, 'tommy gun'],
      briefs: [
        'Amber jazz-age ensemble cel of adult pickpockets, dancers and a stowaway musician colliding in a hotel ballroom, overlapping syncopated clusters, brass and amber lamplight, printed grain. No text or logo.',
        'Amber jazz-age ensemble cel of an adult trumpeter playing on a fire escape at dusk, the notes echoed by three neighbors leaning out of windows, lively variable contours in brass and brown. No text or logo.',
        'Amber jazz-age ensemble cel of an adult diner waitress pouring coffee for three regulars at a counter, calm amber light, overlapping shoulders in a relaxed rhythm. No text or logo.',
      ],
    },
    'SP05-021': {
      name: 'Teal-Orange Sakuga Smear',
      dna: sh({
        aesthetic:
          'Journey-adventure anime at its most animated: tapered black-ink contours that thicken at turns, limbs stretched into smear frames, and dust or leaf trails curling behind fast motion.',
        color_and_tone: 'Clear teal and warm orange against ink-dark and paper-light neutrals.',
        lighting_and_shadow: 'Golden-hour hard two-step shadows with small white edge cuts.',
        texture_and_material:
          'Smooth cel flats with sparse dry-ink grain; smears drawn as stretched, tapered shapes.',
        camera_and_composition:
          'Keep the requested framing; open diagonal flow with rising arcs and unblocked negative space.',
        atmosphere_and_mood:
          'Buoyant resolve and forward curiosity, the road ahead always open and bright.',
        rendering_and_quality:
          'Crisp silhouettes and flat fills, with smears and trails only on motion already present.',
        key_features:
          'stretched limb smear frames; tapered ink contour; curling dust and leaf trails; teal and orange; two-step shadow',
      }),
      avoid: [...AVOID, 'orange jumpsuit', 'whisker cheek marks'],
      briefs: [
        'Teal-orange sakuga smear of an adult falconer leaping between pine treetops after her bird, legs stretched into tapered smear frames, a curling trail of needles behind her, golden-hour teal and orange. No text or logo.',
        'Teal-orange sakuga smear of a red fox chasing a spiral of leaves across a harvested wheat field, its legs smeared, dust curling behind in tapered ink shapes. No text or logo.',
        'Teal-orange sakuga smear of an adult potter trimming a bowl on a kick wheel, tapered ink contours and two-step shadows, only the spinning wheel carrying a small smear. No text or logo.',
      ],
    },
    'SP05-022': {
      dna: sh({
        aesthetic:
          'Fashion-plate supernatural anime: elongated slender figures in fine variable contours with deliberate gaps, set against stark black-white divisions and large blank ivory space.',
        color_and_tone: 'Monochrome black and ivory with a single restrained violet accent.',
        lighting_and_shadow:
          'Severe cel shadows and a narrow violet-white rim; backgrounds often dropped to flat light.',
        texture_and_material: 'Matte dark fields offset by translucent ink-like bands.',
        camera_and_composition:
          'Keep the requested framing; vertical balance, wide negative space and one curving visual path.',
        atmosphere_and_mood:
          'Cool composure with latent tension, elegance held like a breath before moving.',
        rendering_and_quality:
          'Precise contours, sharp value blocks and very few luminous accents.',
        key_features:
          'elongated fashion-plate proportions; blank ivory negative space; stark black-white division; single violet accent; fine gapped contour',
      }),
      avoid: [...AVOID],
      briefs: [
        'Urban spirit blade anime of an adult ghost-bride in an elongated black gown drifting down a blank ivory staircase, fine gapped contours, a stark black-white division through the frame, a violet veil the only color. No text or logo.',
        'Urban spirit blade anime of a black cat walking a thin ledge across a blank white void, elongated shadow, one violet eye, vast ivory negative space. No text or logo.',
        'Urban spirit blade anime of an adult pianist stretching her long fingers before practice in an empty room, slender fashion-plate proportions, flat ivory background and severe cel shadow. No text or logo.',
      ],
    },
    'SP05-023': {
      name: 'Elastic Big-Grin Adventure Cel',
      dna: sh({
        aesthetic:
          'Sunny seafaring adventure anime: bold rounded outlines, rubbery exaggerated anatomy with huge grins and stretched limbs, broad flexible curves and flat vivid color.',
        color_and_tone: 'Bright ocean blue, warm red and gold, clean white and dark outlines.',
        lighting_and_shadow: 'High summer sun, broad pale highlights and clear cel shadow groups.',
        texture_and_material: 'Clean flat color with lightly softened pigment edges.',
        camera_and_composition:
          'Keep the requested framing; roomy balance, flexible diagonals and generous negative space.',
        atmosphere_and_mood:
          'Playful openness and generous momentum, a sunny, big-hearted adventure with room to stretch.',
        rendering_and_quality: 'Vivid flat colors, legible outlines and little small-scale detail.',
        key_features:
          'rubbery exaggerated anatomy; huge grins; bold rounded outlines; ocean blue, red and gold; flexible diagonals',
      }),
      avoid: [...AVOID, 'straw hat with red open vest', 'stretching rubber punch'],
      briefs: [
        'Elastic big-grin adventure cel of an adult island postwoman riding a giant sea turtle across bright blue waves with a satchel of letters, rubbery stretched arm waving, huge grin, bold rounded outlines. No readable text or logo.',
        'Elastic big-grin adventure cel of an adult strongman hauling a festival float up a steep hill, his arms stretched like taffy, red and gold flags, broad flexible curves. No text or logo.',
        'Elastic big-grin adventure cel of a plump bald old fisherman with a huge curling grey mustache, a knitted blue beanie and a striped wool sweater, napping in a hammock on a harbor porch, rubbery arms drooping to the floor, a cat asleep on his belly, flat vivid color and calm summer light. Original character: no straw hat, no red vest, no young hero. No text or logo.',
      ],
    },
    'SP05-028': {
      dna: sh({
        aesthetic:
          'Road-movie anime: dry brush lines with imperfect tapered ends, flattened slightly oversized forms, dusty grain and long landscapes crossed on foot.',
        color_and_tone: 'Dusty ochre and sepia against pale cyan sky and deep brown shadow.',
        lighting_and_shadow: 'Late sun in warm and cool value bands with minimal internal shading.',
        texture_and_material:
          'Scratched brush edges over subtle analog grain, with clean resting areas.',
        camera_and_composition:
          'Keep the requested framing; off-axis focal weight, broad quiet margins and low wide horizons.',
        atmosphere_and_mood:
          'Laid-back confidence on a long road, time moving slowly under a wide sky.',
        rendering_and_quality: 'Subdued color, visible brush grain and uncluttered silhouettes.',
        key_features:
          'dry brush line; dusty ochre and sepia; long low horizons; analog grain; off-axis focal weight',
      }),
      avoid: [...AVOID],
      briefs: [
        'Lo-fi sword roadtrip anime of an adult wandering minstrel crossing a dry salt flat with a lute on his back toward a distant ruined castle, dry brush lines, a long low horizon and dusty ochre sky. No text or logo.',
        'Lo-fi sword roadtrip anime of an adult drifter hitchhiking beside a broken-down truck on a dusty mountain road, sepia dust, pale cyan sky, off-axis framing. No text or logo.',
        'Lo-fi sword roadtrip anime of an adult orchard picker eating a peach on a wooden porch step at sunset, scratched brush edges and analog grain, a quiet pause. No text or logo.',
      ],
    },
    'SP05-029': {
      dna: sh({
        aesthetic:
          'Punk-indie anime: manga panel cuts bursting into the frame, torn overdrawn contours, collage blocks and wonky pop shapes with screen-print halftone and registration slip.',
        color_and_tone: 'Abrupt complementary color blocks with black and small white breaks.',
        lighting_and_shadow:
          'Flat graphic separations with little modelled volume and no soft gradients.',
        texture_and_material:
          'Screen-print halftone, paper-cut edges and controlled registration slip.',
        camera_and_composition:
          'Keep the requested content; tilted panels of varied size with a clear central reading path.',
        atmosphere_and_mood: 'Irreverent playfulness and quick shifts in emphasis.',
        rendering_and_quality:
          'Rough printed edges, deliberate misalignment and legible broad shapes.',
        key_features:
          'tilted manga panel cuts; torn overdrawn contour; complementary color blocks; halftone collage; registration slip',
      }),
      avoid: [...AVOID],
      briefs: [
        'Chaotic indie adolescence anime of an adult on a battered yellow scooter jumping a river levee, the frame split into tilted panels with torn overdrawn contours, complementary blue and orange blocks, halftone sky. No text or logo.',
        'Chaotic indie adolescence anime of a small dragon hatching from an egg on a cluttered bedroom desk, panel cuts bursting into the frame, pink and green collage blocks, registration slip. No text or logo.',
        'Chaotic indie adolescence anime of an adult brushing her teeth at a cracked mirror, the scene split into a few tilted panels and halftone blocks, ordinary morning routine. No text or logo.',
      ],
    },
    'SP05-142': {
      name: 'Humid Tropic Grit Cel',
      dna: sh({
        aesthetic:
          'Tropical crime anime: weighty pressure-heavy contours, sweat-sheened skin, harsh sun, dense humid haze and scuffed ink on sun-bleached surfaces.',
        color_and_tone:
          'Deep slate, faded teal, rust and muted amber, with sharp sweat highlights.',
        lighting_and_shadow:
          'Harsh overhead tropical sun, hard low-key shadows and a hazy, washed background.',
        texture_and_material:
          'Scuffed ink, soft grain, rust bloom and peeling paint on hard surfaces.',
        camera_and_composition:
          'Keep the requested framing; compact asymmetric framing with strong diagonals and deep negative space.',
        atmosphere_and_mood: 'Weathered tension and dry resolve in the heat.',
        rendering_and_quality:
          'Gritty edge texture, grounded values and an uncluttered focal path.',
        key_features:
          'sweat-sheen highlights; humid haze; pressure-heavy contour; rust and faded teal; harsh overhead sun',
      }),
      avoid: [...AVOID, 'twin pistols', 'gun', 'torpedo boat'],
      briefs: [
        'Humid tropic grit cel of an adult smuggler captain steering a rust-streaked launch through a mangrove swamp, sweat sheen on her arms, humid haze, pressure-heavy contours and harsh overhead sun. No text or logo.',
        'Humid tropic grit cel of an adult dock boss on a sun-bleached pier arguing with a pelican over a fish crate, scuffed ink, faded teal paint, strong diagonal. No text or logo.',
        'Humid tropic grit cel of an adult fruit seller slicing a mango under a tin awning at noon, sweat-sheen highlights and hard shadows, a quiet ordinary task. No text or logo.',
      ],
    },
    'SP05-143': {
      name: 'Cold Starfield Night Noir',
      dna: sh({
        aesthetic:
          'Urban night noir anime: fine dark contours threaded by thin cyan lines, an unnaturally starry sky over a blue-black city, and faint glowing cyan edges on figures.',
        color_and_tone: 'Blue-black and charcoal with narrow cyan highlights and pinpoint stars.',
        lighting_and_shadow:
          'Cool reflected accents against deep shadow, without adding a new light fixture.',
        texture_and_material:
          'Broken reflective highlights and fine surface streaks over matte dark fields.',
        camera_and_composition:
          'Keep the requested framing; guarded negative space, off-center balance and a large sky where the view allows.',
        atmosphere_and_mood:
          'Lonely secrecy and restrained unease, a quiet city under a sky that feels false.',
        rendering_and_quality:
          'Thin cyan line accents, dark reflective values and generous empty space.',
        key_features:
          'false starfield sky; thin cyan contour threads; blue-black city; glowing cyan edges; guarded negative space',
      }),
      avoid: [...AVOID],
      briefs: [
        'Cold starfield night noir of an adult watchman standing on a water tower above a blacked-out city, an unnaturally dense starfield overhead, thin cyan lines tracing his coat, guarded negative space. No text or logo.',
        'Cold starfield night noir of an adult courier in a long coat crossing an empty suspension bridge beneath the stars, blue-black cables threaded with cyan, off-center balance. No text or logo.',
        'Cold starfield night noir of an adult night janitor mopping a glass lobby, reflective streaks on the floor, a sliver of starfield in the windows, calm and ordinary. No text or logo.',
      ],
    },
    'SP05-144': {
      name: 'Record-Scratch Stutter Swagger',
      dna: sh({
        aesthetic:
          'Hip-hop period anime: flattened woodblock-style landscapes under loose ink-brush figures, with record-scratch stutter frames of doubled offset outlines and rewind jitter.',
        color_and_tone:
          'Dusty gold, warm brown and subdued blue-grey, with an occasional spray-paint magenta accent.',
        lighting_and_shadow: 'Soft warm-cool bands with few hard shadow groups.',
        texture_and_material: 'Fine vinyl-like scratches and dry print grain over warm flats.',
        camera_and_composition:
          'Keep the requested framing; offbeat balance with relaxed weight on one side.',
        atmosphere_and_mood: 'Unhurried swagger and an easy, syncopated rhythm.',
        rendering_and_quality:
          'Warm dusty color, scratch texture and stutter outlines only on moving parts.',
        key_features:
          'doubled offset stutter outlines; vinyl scratch texture; flattened woodblock landscape; dusty gold and brown; offbeat balance',
      }),
      avoid: [...AVOID],
      briefs: [
        'Record-scratch stutter swagger of an adult street dancer spinning on one hand in a feudal rice-paddy village, her legs doubled into offset stutter outlines like a scratched record, flattened woodblock hills, dusty gold light. No text or logo.',
        'Record-scratch stutter swagger of a rooster strutting along a temple wall, each step a doubled jittering outline, vinyl scratches over warm brown flats, magenta tail accent. No text or logo.',
        'Record-scratch stutter swagger of an adult teahouse owner fanning herself on her veranda in the afternoon heat, loose ink-brush figure, only the fan carrying a small stutter outline. No text or logo.',
      ],
    },
  },
};

export const aliases = {
  'SP05-034': 'Bright Hero Academy',
  'SP05-133': 'Mashle - Brickwall Comedy Spell-School Brawl',
  'SP05-134': 'Sakamoto Days - Convenience-Store Assassin Sprint',
  'SP05-121': 'Demon Slayer - Lantern Bloodline Sword Ballet',
  'SP05-124': 'Blue Lock - Predator-Ego Sports Assault',
  'SP05-128': 'Bleach: Thousand-Year Blood War - Royal Black Blade Opera',
  'SP05-131': 'Wind Breaker - Delinquent Street Protector Rush',
  'SP05-135': 'Undead Unluck - Rule-Breaker Curse Impact',
  'SP05-136': 'Black Clover - Grimoire Thunder Squad',
  'SP05-138': 'Kagurabachi - Sword Oath Under Neon Rain',
  'SP05-139': 'Attack on Titan - Wall Rupture Desperation',
  'SP05-140': 'Frieren Combat Flashback - Ancient Calm Spell Impact',
  'SP05-129': 'One-Punch Man - Prestige Hero Impact Satire',
  'SP05-132': 'Solo Leveling - Shadow Monarch Raid Ascension',
  'SP05-123': 'Fire Force - Cathedral Inferno Brigade',
  'SP05-125': 'Kaiju No. 8 - Civic Monster Response Unit',
  'SP05-126': 'Dandadan - Paranormal Turbo Romance Brawl',
  'SP05-127': "Hell's Paradise - Poison Garden Executioner",
  'SP05-130': 'Mob Psycho 100 - Psychic Paint-Surge Meltdown',
  'SP05-137': 'Dr. Stone - Science Kingdom Action Blueprint',
  'SP05-122': 'Chainsaw Man - Filthy Devil-Hunter Frenzy',
  'SP05-148': 'Baccano! - Jazz Railcrime Ensemble',
  'SP05-021': 'Headband Ninja Journey',
  'SP05-023': 'Grand Pirate Adventure',
  'SP05-142': 'Black Lagoon - South Seas Gun-Runner Grit',
  'SP05-143': 'Darker than Black - Contract Killer Night Rain',
  'SP05-144': 'Samurai Champloo - Lo-Fi Edo Swagger',
};

export default spec;
