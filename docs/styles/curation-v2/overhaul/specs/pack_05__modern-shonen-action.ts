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
        "Holding up a collapsing bakery ceiling with both arms, a volunteer firefighter in a dented homemade hero suit grins through the flour storm while customers crawl out between her boots. No readable text or logo.",
        "Grinning at a traffic jam, a retired hero in a faded cape directs cars with exaggerated flying-punch gestures while the real traffic officer takes notes on his technique. No readable text or logo.",
        "At dawn on an empty training rooftop, a single pair of battered red boots stands beside a thermos, the sunrise crosshatched across the concrete. No readable text or logo.",
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
        "Ignoring a swirling spell circle cast by three furious archmages, a blank-faced librarian in a formal robe simply lifts the entire enchanted tower and moves it two meters to the left. No readable text or logo.",
        "At an elegant tea ceremony, a deadpan gardener cracks a walnut between two fingers and the explosion of shell knocks every ornate teacup off the table. No readable text or logo.",
        "On an ornate marble balcony, a single dumbbell rests on a velvet cushion where the ceremonial magic wand should be. No readable text or logo.",
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
        "Blocking three knife-throwing robbers with a rolling snack shelf, a calm night-shift cashier catches every blade in a dangling bag of rice crackers without spilling her coffee. No readable text or logo.",
        "Bouncing between hanging laundry lines, a delivery courier flicks a spinning bottle cap that ricochets off four walls and switches off the ringleader’s flashlight. No readable text or logo.",
        "Under a flickering fluorescent tube, a stack of shopping baskets stands perfectly balanced on one sharpened chopstick. No readable text or logo.",
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
        "Standing in a flooded subway station, an exorcist in a dark raincoat faces a many-mouthed spirit made of forgotten umbrellas, each mouth whispering a different missed train. No readable text or logo.",
        "A night-shift nurse wheels a cart down an empty ward while a spirit with twelve teeth-lined eyes clings to the ceiling above her, trying very hard to be scary. No readable text or logo.",
        "In a deserted parking garage, a lone vending machine hums, and every drink behind its glass has a tiny staring eye. No readable text or logo.",
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
        "Swinging on steel cables between cathedral spires, a lamplighter escapes a colossal stone gargoyle that has pulled itself off the roof and is chasing her across the town. No readable text or logo.",
        "A bell-ringer hauls the great rope with his whole body as a giant hand slowly closes around the tower, the bell swinging wildly beside his face. No readable text or logo.",
        "At the foot of an enormous wall at dusk, a shepherd sits with his flock, and on the other side something taller than the wall is breathing. No readable text or logo.",
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
        "At the edge of a burned wheat field, a widow in a grey shawl reads a letter her husband dictated before the battle, while the smoke behind her slowly clears into a golden evening. No readable text or logo.",
        "A cavalry scout leads a limping mule through a ruined orchard, stopping to lift a fallen bird’s nest back into a shattered tree. No readable text or logo.",
        "In a quiet village post office, a stack of undelivered letters glows in the late afternoon light, one envelope sealed with a dried flower. No readable text or logo.",
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
        "Balancing on a single stone pillar above a canyon of fog, a ranger calmly calculates the wind while three rival treasure hunters on nearby pillars try to stare her down. No readable text or logo.",
        "Two chess rivals face each other across a board carved into a cliff edge, and every captured piece falls hundreds of meters into the river below. No readable text or logo.",
        "A beekeeper lifts a honeycomb frame at sunset, and the bees arrange themselves into a perfect warning pattern around her hands. No readable text or logo.",
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
        "Spinning through a snowy pine forest at night, a lantern-bearer swings her lamp in a full circle and its light unrolls behind her as a curling woodblock-print wave. No readable text or logo.",
        "A grey heron lifts off a frozen mountain pond, each wingbeat leaving painted ukiyo-e ripples hanging in the frosty air. No readable text or logo.",
        "A tea master pours boiling water from an iron kettle, and the steam curls into stylized printed clouds above the cup. No readable text or logo.",
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
        "Drawing a longbow on a torchlit tournament field, an archer glares down the arrow as her rivals behind her melt into circling wolves made of shadow. No readable text or logo.",
        "Exploding off the starting blocks, a sprinter’s spiked shoe fills half the frame as a giant hungry eye opens in the stadium lights behind her. No readable text or logo.",
        "Alone in a quiet workshop, a watchmaker peers through a loupe, his magnified eye glaring like a predator at the tiny gears. No readable text or logo.",
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
        "Rising from a bone-white throne in a vaulted hall, a pale sovereign flicks one finger and half of the chamber snaps into a black-and-white photographic negative. No readable text or logo.",
        "A priestess releases a flock of crows from a cathedral balcony, and the birds turn white against a suddenly black sky as they cross the moon. No readable text or logo.",
        "A cellist tunes her instrument alone on a dark stage, and every note inverts the spotlight into a black circle around her feet. No readable text or logo.",
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
        "Standing on a harbor seawall under an enormous sky, three fishermen in rolled sleeves square up against an incoming storm as if it were a rival gang. No readable text or logo.",
        "A pigeon keeper throws open her rooftop coop and a burst of birds swirls around her like a protective escort over the town. No readable text or logo.",
        "On a quiet roof ridge at sunset, a roofer eats a rice ball, his hammer resting beside him like a guardian’s sword. No readable text or logo.",
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
        "Flipping a gold coin in a torchlit tavern, a gambler watches the coin land on its edge, and the whole room cracks apart into floating halftone shards. No readable text or logo.",
        "A stuntwoman falls backward off a clock tower, and every tick of the clock shatters the sky behind her into a new panel. No readable text or logo.",
        "A florist trims one stem at her workbench, and the snip splits the room into two mismatched halves of dotted halftone. No readable text or logo.",
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
        "Slamming her staff into a circle of standing stones at midnight, a hedge-witch unleashes jagged black lightning that splits into branches across the stormy sky. No readable text or logo.",
        "A kneeling knight in dented armor grits her teeth as crackling lightning splits the ground around her into glowing cracks. No readable text or logo.",
        "A bookbinder tools gold ornament into a leather cover, and tiny black sparks crawl along every line she presses. No readable text or logo.",
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
        "Kneeling before a burned-out forge at night, a mourner in a dark coat grips the handle of an unfinished blade as a thin neon sign flickers red across its edge. No readable text or logo.",
        "A black stallion stands motionless in a flooded rice field at night, only the rim of its mane lit by a distant teal sign. No readable text or logo.",
        "A cook ladles broth at a late-night street stall, steam and silence heavy around him, one knife gleaming on the board. No readable text or logo.",
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
        "Villagers flee across a stone bridge as the grinning face of a colossal moss-covered statue rises from the river, its eyes blinking slowly. No readable text or logo.",
        "A fisherman in a small rowboat looks up at a lighthouse, and a giant hand with too many knuckles is gripping the top of it. No readable text or logo.",
        "A cobbler repairs a boot at his workbench, unaware that the enormous eye in the window behind him has been watching for an hour. No readable text or logo.",
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
        "Holding back an avalanche with one raised hand, a hermit mage in a pale robe barely looks up from her book as thin geometric rings hold the snow in midair. No readable text or logo.",
        "In a ruined stone observatory at dawn, thin geometric rings of light rotate slowly around a sleeping old wizard. No readable text or logo.",
        "A gardener waters a row of lavender while a faint geometric circle glows under the watering can. No readable text or logo.",
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
        "Stubbing his toe on a castle stair, an armored knight strikes a twisted fashion-model pose of pure agony while the sky behind him turns magenta. No readable text or logo.",
        "A farmer yanks a giant turnip out of the ground with a dramatic flamboyant pose, both arms twisted like a runway model. No readable text or logo.",
        "A librarian stamps a single book with menacing intensity, shadows crawling up the shelves behind her. No readable text or logo.",
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
        "Yawning as a mountain-sized dragon collapses behind him, a dragon-hunter drawn with plain round lines and dot eyes holds his grocery list while rubble rains down. No readable text or logo.",
        "A dot-eyed tourist eats an ice cream while a hyper-detailed battle rages behind her, and she only notices when a drip lands on her shoe. No readable text or logo.",
        "An elderly pensioner reads a blank newspaper on a bench, his face plain and calm, while the city behind him is spectacularly on fire. No readable text or logo.",
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
        "Standing knee-deep in a flooded crypt, a necromancer queen raises one hand as smoky shadow knights rise from the water, their eyes glowing violet. No readable text or logo.",
        "A raid healer climbs a vertical shaft by the glow of her own spell, huge shadowy shapes watching from the darkness below. No readable text or logo.",
        "A night guard reads by a single desk lamp, his own shadow on the wall slowly turning to look at him with glowing eyes. No readable text or logo.",
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
        "In a cathedral crypt, an alchemist watches a ring of cold blue embers rise into hundreds of floating glass daggers pointing toward the vaulted ceiling. No readable text or logo.",
        "A white stag crosses a snowy temple courtyard as swords made of light slowly sprout from its hoofprints. No readable text or logo.",
        "A violin maker varnishes a violin in her workshop, and faint magic circuit lines glow along the wood grain. No readable text or logo.",
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
        "Walking out of a burning timber chapel untouched, a fire-priest in a soot-black cassock spreads her arms as the flames around her burn white at the center and orange at the edges. No readable text or logo.",
        "A foundry worker pours molten bronze into a bell mold, the stream glowing white-hot inside a halo of orange sparks. No readable text or logo.",
        "A shrine keeper lights a row of oil lamps at dusk, and each small flame burns with a bright white heart. No readable text or logo.",
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
        "Operating a crane from a scuffed orange cab, a middle-aged cleanup worker lifts a colossal monster tooth off a flattened shopping street while her crew hoses down the pavement. No readable text or logo.",
        "A harbor pilot steers an orange tugboat past the floating ribcage of a sea monster bigger than the harbor itself. No readable text or logo.",
        "A road-crew worker repaints a lane line around a single giant footprint pressed into the asphalt. No readable text or logo.",
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
        "Tumbling down a haunted manor staircase, a ghost-hunter couple in their forties grab each other as their flashlights smear into acid-green and magenta streaks around a laughing spirit. No readable text or logo.",
        "An ice skater spins on a frozen lake at night as neon occult lights smear into rings around her blades. No readable text or logo.",
        "A man repots a cactus on his balcony while a tiny glowing alien watches from the flowerpot, both perfectly calm. No readable text or logo.",
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
        "Wading waist-deep through a jungle of giant poison orchids, a plague doctor in waxed linen notices that every blossom has quietly turned to face him. No readable text or logo.",
        "A moss-covered skeleton in rusted armor sits against a tree, flowers with tiny human faces blooming from its ribs. No readable text or logo.",
        "A greenhouse keeper pots seedlings at dawn, and one sprout has grown a single perfect eyelash. No readable text or logo.",
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
        "In an empty white room, a fortune-teller with a blank face sets down her teacup as the whole table floats upward in a scribbled storm of psychic energy. No readable text or logo.",
        "A kite flier on a bare hill stares blankly as the horizon wobbles and ripples like a badly drawn line. No readable text or logo.",
        "A commuter waits alone at an empty crossing, and the traffic light quietly bends toward her. No readable text or logo.",
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
        "Screaming on a cliff edge, a wandering oracle unleashes a surge of painted pink and cyan brushstrokes that swirls up and repaints the entire stormy sky. No readable text or logo.",
        "Breaching far out at sea, a humpback whale bursts through water that suddenly turns into thick swirling paint-on-glass color, pink and cyan streaks flying off its fins. No readable text or logo.",
        "An office worker stares at a cup of coffee until the surface swirls into tiny painted galaxies. No readable text or logo.",
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
        "Launching a hand-built wooden glider off a castle wall, an inventor in patched overalls grins as chalk schematics of lift and drag appear in the air around the wings. No readable text or logo.",
        "A timber watermill turns in a mountain stream, chalk diagrams of gears and flow sketched over its wheel. No readable text or logo.",
        "In a cluttered village shop, an apothecary grinds herbs with a heavy mortar while glowing molecular chalk diagrams float above the bowl like curious fireflies. No readable text or logo.",
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
        "Whirling through falling plum blossoms on a misty mountain terrace, a dancer’s long silk sleeves slice the petals into a spiral while her sword stays sheathed at her hip. No readable text or logo.",
        "A tiger leaps across a mountain stream, its stripes dissolving into flowing ink-wash brushstrokes as it lands. No readable text or logo.",
        "A weaver works a wooden loom in a quiet pavilion, the silk rolling out painted with drifting clouds. No readable text or logo.",
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
        "Sprinting through a monastery wine cellar with a sack of squirming rats over his shoulder, a rat-catcher crashes through barrels as dark wine splatters across the frame like ink. No readable text or logo.",
        "A punk drummer mid-fill smashes through her kit, sticks and cymbals flying in loose chaotic ink strokes. No readable text or logo.",
        "A barber trims a customer’s hair with deadpan calm while the shop behind them is slowly collapsing. No readable text or logo.",
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
        "Swinging his lantern in a rain-soaked cemetery at night, a gravedigger backs away from a freshly opened grave while the lamplight wobbles across muted grey headstones. No readable text or logo.",
        "A dog-catcher lunges for a runaway hound in a grimy alley, both of them sliding through a puddle. No readable text or logo.",
        "A mechanic eats instant noodles under a flickering garage light, too tired to notice the rain. No readable text or logo.",
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
        "Seated at the end of a long candlelit table, an inquisitor stares at a single sealed envelope while her shadow on the wall seems to be reading it already. No readable text or logo.",
        "A detective on a spiral staircase looks down at the suspect below, both of them smiling the same small smile. No readable text or logo.",
        "A night-shift pharmacist peels an orange in perfect spiral, her eyes never leaving the security monitor. No readable text or logo.",
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
        "Pickpockets, dancers and a stowaway trumpeter collide in a grand hotel ballroom as the chandelier swings and a bootlegger hides champagne under the cake. No readable text or logo.",
        "A trumpeter plays on a fire escape at dusk, amber light pouring through laundry lines around him. No readable text or logo.",
        "A diner waitress pours coffee for three suspicious men in fedoras, each hiding something under the table. No readable text or logo.",
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
        "Leaping between pine treetops after her falcon, a falconer stretches into a long painterly smear of teal and orange as the bird dives ahead of her. No readable text or logo.",
        "A red fox chases a spiral of leaves across a harvested field, its body smearing into streaks of warm color. No readable text or logo.",
        "A potter trims a bowl on a kick wheel, the spinning clay smearing into teal and orange rings. No readable text or logo.",
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
        "Drifting down a blank ivory staircase in an elongated black gown, a ghost-bride holds a long sword as if it were a bouquet, her veil trailing into empty white space. No readable text or logo.",
        "A black cat walks a thin ledge across a blank white page, only its shadow keeping it company. No readable text or logo.",
        "A pianist stretches her long fingers before a concert, standing alone in a vast white space. No readable text or logo.",
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
        "Riding a giant sea turtle across bright blue waves, an island postwoman with an enormous grin stretches her arm impossibly far to deliver a parcel to a passing ship. No readable text or logo.",
        "A strongman hauls a festival float uphill single-handed, grinning so wide his face nearly splits in half. No readable text or logo.",
        "A plump old fisherman with a huge curling mustache naps on his boat while seagulls carry away his lunch. No readable text or logo.",
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
        "Crossing a dry salt flat at noon, a wandering minstrel with a lute on his back hitches a ride on a donkey cart driven by a grinning grandmother. No readable text or logo.",
        "A drifter sits beside a broken-down bus on an empty desert road, a mangy dog sharing her last orange. No readable text or logo.",
        "An orchard picker eats a peach on a wooden porch at sunset, the road stretching away behind her. No readable text or logo.",
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
        "Jumping a river levee on a battered scooter, a forty-year-old accountant screams with joy as the frame splits into manga panels around her. No readable text or logo.",
        "A small dragon hatches from an egg on a cluttered desk, knocking over pens and snack wrappers in a chaotic burst. No readable text or logo.",
        "A woman brushes her teeth at a cracked mirror as a giant robot quietly walks past her window. No readable text or logo.",
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
        "Steering a rust-streaked launch through a mangrove swamp at noon, a smuggler captain in a sweat-soaked tank top eyes a patrol boat through the humid haze. No readable text or logo.",
        "A dock boss on a sun-bleached pier argues with a fisherman over a crate that is definitely not full of fish. No readable text or logo.",
        "Under a rusty tin awning in a port market, a fruit seller slices a mango with a machete, calmly ignoring the loud gunrunner argument next door. No readable text or logo.",
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
        "Standing on a water tower above a blacked-out city, a watchman looks up as one star in the false sky suddenly falls, and a building across town lights up blue. No readable text or logo.",
        "A courier in a long coat crosses an empty square at night, her shadow flickering with electric sparks. No readable text or logo.",
        "Mopping a glass lobby at three in the morning, a tired night janitor notices reflections of strange unfamiliar stars glimmering in every puddle. No readable text or logo.",
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
        "Spinning on one hand in a feudal rice-paddy village, a street dancer freezes mid-move as the whole scene stutters like a scratched record around him. No readable text or logo.",
        "Strutting along a crumbling temple wall at noon, a proud rooster moves in stuttering freeze-frame beats as if the whole scene were being scratched on a turntable. No readable text or logo.",
        "A teahouse owner fans herself on her porch, the heat shimmer pulsing like a slow beat. No readable text or logo.",
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
