import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Medieval atlas painted RPG and tactics: the painted surfaces of role-playing and strategy games
// (maps, portraits, key art, backdrops) as descriptors without game names. Five originals get card
// briefs; fifteen new studies add tactics maps, unit portrait cards, chibi watercolor party
// sketches, tarot class cards, ink-wash strategy scrolls, hub-town backdrops, sprites on painted
// dioramas, codex character plates, campfire rest scenes, skirmish oil sketches, costume concept
// sheets, candlelit party portraits, pastel journey paintings, loot still lifes and class line-ups.
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
  tags: [tag, 'painted-rpg', 'portable-style-study'],
  dna: dna(fields),
  avoid: [...avoid, 'interface, menus or health bars', 'existing game characters or logos', ...STYLE_AVOID],
  briefs,
});

const keep = 'Preserve the requested identity, count, pose and action with original characters';

const spec: Spec = {
  pack: 'pack_23',
  category: '9. Painted RPG & Tactics',
  updates: {
    'SP23-037': { briefs: [
      'Crossing a flooded valley at dawn, a caravan of pilgrims follows a whale that swims through the shallow water between the hills, painted in transparent washes with pale reserved light on its back. No readable text or logo.',
      'Resting under a lone tree, a young swordsman has fallen asleep while his tiny fire spirit companion roasts a mushroom far too close to his boot, all in clear luminous watercolor. No readable text or logo.',
      "Standing alone in a misty field of pale grey washes, a ruined bell tower is ringing its bell although the rope hangs perfectly still. No readable text or logo.",
    ] },
    'SP23-038': { briefs: [
      "Carrying a whole market town across a desert, a mountain-sized tortoise plods on while merchants shout from its shell, everything built from rounded matte gouache shapes. No readable text or logo.",
      'Built from rounded gouache volumes, a knight-in-training chases a runaway suit of armor that has decided it would rather be a gardener. No readable text or logo.',
      "Shining its beam into a dark sea, a lighthouse on a cliff has attracted something enormous and round that is rising slowly to meet the light, all in matte gouache. No readable text or logo.",
    ] },
    'SP23-039': { briefs: [
      'Separated into clean painted planes of warm and cool color, a sky fortress drops its anchor into a canyon as a flock of griffins circles its towers. No readable text or logo.',
      "Standing in crisp warm-to-cool painted planes, a proud blacksmith presents a sword to a hero who is clearly much too short to lift it. No readable text or logo.",
      'Among cleanly separated painted planes, a forest shrine glows at dusk, and every stone lantern is lit except the one facing the dark path. No readable text or logo.',
    ] },
    'SP23-040': { briefs: [
      'Drawn with decisive contours and broad flat shadows, a pirate queen stands on the prow of a ship made from the skeleton of a sea beast, its ribs curving over her crew. No readable text or logo.',
      "Proudly presenting his wares, a goblin merchant has laid out what is clearly the hero's own stolen equipment, drawn with confident contours and flat shadow shapes. No readable text or logo.",
      'Framed in bold contour and broad matte shadow, a lone traveler stands at a crossroads where all four signposts point back the way she came. No readable text or logo.',
    ] },
    'SP23-041': { briefs: [
      'Built from small deliberate pixel clusters, a white wolf the size of a hill lies across a snowy pass, and a line of tiny travelers is walking along its spine. No readable text or logo.',
      "Arguing at a crossroads, a party of heroes has not noticed that the smallest member is holding the map upside down, all in tidy small pixel clusters. No readable text or logo.",
      'Rendered in tidy pixel clusters, a quiet inn at night has all its windows dark except the attic, where a candle is moving from window to window. No readable text or logo.',
    ] },
  },
  creates: [
    study('Hand-Painted Tactics Map', 'painted grid battle map', 'tactics-map', {
      aesthetic: 'Hand-painted tactics map: a top-down painted battlefield of hills, rivers and ruins with a faint square or hex grid, small painted unit figures placed like pieces on a board.',
      subject_treatment: `${keep}; place the subject as small painted units on a gridded top-down battlefield.`,
      color_and_tone: 'Earthy greens and ochres with bright unit colors.',
      lighting_and_shadow: "Soft overhead light with small unit shadows, kept consistent across the whole image.",
      texture_and_material: 'Painterly terrain, faint grid lines and crisp unit figures.',
      camera_and_composition: 'High top-down or steep angled view of the field.',
      atmosphere_and_mood: 'Keep the requested mood with calculated strategic tension.',
      rendering_and_quality: "Readable terrain and units without interface, kept consistent across the whole image.",
      key_features: 'faint grid; painted terrain; small units; top-down battlefield',
    }, [], [
      'Across a painted battlefield with a faint hex grid, two small armies face each other over a river, and a colossal sleeping serpent is curled underneath the bridge between them. No readable text or logo.',
      'On a gridded painted map, a single lost sheep has wandered into the middle of the battle, and both armies have stopped to watch it. No readable text or logo.',
      'On a top-down painted field, every unit has moved except one small figure standing alone in a grid square that is painted completely black. No readable text or logo.',
    ]),
    study('Parchment Unit Portrait Card', 'painted unit portrait on parchment', 'unit-portrait', {
      aesthetic: 'Parchment unit portrait card: a painted half-length portrait of a soldier, mage or creature on aged parchment with soft vignette edges, as used to present units in strategy games.',
      subject_treatment: `${keep}; paint the subject as a half-length portrait on aged parchment.`,
      color_and_tone: "Warm parchment beige with muted painted colors, kept consistent across the whole image.",
      lighting_and_shadow: 'Soft side light with a vignette fading to parchment.',
      texture_and_material: "Paper fibers, oil-like brushwork and stained edges, kept consistent across the whole image.",
      camera_and_composition: "Half-length figure centered with fading edges, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with seasoned soldierly character.',
      rendering_and_quality: "Refined portrait with no stats or labels, kept consistent across the whole image.",
      key_features: 'half-length portrait; aged parchment; vignette edges; unit character',
    }, ['stats or labels'], [
      'Painted on stained parchment, a scarred veteran pikewoman looks straight out with one clouded eye, a tiny sparrow nesting in the crest of her helmet. No readable text or logo.',
      "Posing with great seriousness, a goblin archer holds a bow that is clearly twice as tall as he is, painted as a portrait on stained parchment. No readable text or logo.",
      'On a faded parchment portrait, a pale scout in a hood stares from the vignette, and the parchment around her face has begun to burn inward. No readable text or logo.',
    ]),
    study('Chibi Watercolor Party Sketch', 'cute watercolor adventurer group', 'chibi-party', {
      aesthetic: 'Chibi watercolor party sketch: a loose watercolor and pencil sketch of a small adventuring party drawn with big heads and tiny bodies, soft washes and playful poses.',
      subject_treatment: `${keep}; draw the subject as chibi figures with big heads and small bodies in soft wash.`,
      color_and_tone: "Soft pastel watercolor washes with pencil lines, kept consistent across the whole image.",
      lighting_and_shadow: "Light airy washes with few shadows, kept consistent across the whole image.",
      texture_and_material: "Pencil lines, watercolor blooms and white paper, kept consistent across the whole image.",
      camera_and_composition: 'Group of figures loosely arranged on white paper.',
      atmosphere_and_mood: 'Keep the requested mood with warm playful camaraderie.',
      rendering_and_quality: "Loose charming sketch with clear expressions, kept consistent across the whole image.",
      key_features: 'chibi proportions; pencil and watercolor; adventuring party; white paper',
    }, [], [
      'Posing for a group sketch, a chibi adventuring party stands in a row while the huge dragon behind them has also squeezed into the picture with a peace sign. No readable text or logo.',
      'Drawn in soft washes, a tiny chibi paladin gives a speech while the rest of the party has fallen asleep on the pile of loot. No readable text or logo.',
      'In a loose pencil sketch, a small chibi mage stands alone at the edge of the page, and the party beside her has been erased, leaving faint outlines. No readable text or logo.',
    ]),
    study('Painted Tarot Class Card', 'character class in tarot frame', 'tarot-class', {
      aesthetic: 'Painted tarot class card: a character class painted as a tall tarot-style card with an ornamental border, symbolic props and a single emblematic pose.',
      subject_treatment: `${keep}; paint the subject in a single emblematic pose framed like a tarot card.`,
      color_and_tone: "Rich jewel tones with gold border lines, kept consistent across the whole image.",
      lighting_and_shadow: "Soft dramatic light on the central figure, kept consistent across the whole image.",
      texture_and_material: 'Painterly figure, gilded border and aged card surface.',
      camera_and_composition: 'Tall vertical card with centered figure and symbols.',
      atmosphere_and_mood: "Keep the requested mood with mystic destiny, kept consistent across the whole image.",
      rendering_and_quality: 'Clear emblematic composition with no numbers or titles.',
      key_features: 'tarot frame; emblematic pose; symbolic props; gilded border',
    }, ['card numbers or titles'], [
      'Framed like a tarot card, a necromancer stands on a hill of sleeping skeletons, holding a lantern in which a tiny moth is trapped and glowing. No readable text or logo.',
      'In a gilded tarot frame, a bard strikes a heroic pose with a lute that has only one string left, and he is not bothered at all. No readable text or logo.',
      "Holding a lantern on a tall tarot-style card, a hooded wanderer walks along a cliff edge while her lantern light falls on a second set of footprints walking beside her own. No readable text or logo.",
    ]),
    study('Ink-Wash Strategy Scroll', 'east asian ink tactical painting', 'ink-strategy', {
      aesthetic: 'Ink-wash strategy scroll: sweeping monochrome ink landscapes with armies as tiny brush dots moving through mountains and rivers, splashes of red for banners.',
      subject_treatment: `${keep}; render the subject as tiny brushwork figures in a vast ink landscape.`,
      color_and_tone: 'Black and grey ink washes with small red accents.',
      lighting_and_shadow: "Mist and wash gradients create depth, kept consistent across the whole image.",
      texture_and_material: 'Rice-paper texture, wet ink blooms and dry brush.',
      camera_and_composition: 'Wide horizontal landscape with armies as small marks.',
      atmosphere_and_mood: 'Keep the requested mood with grand strategic scale.',
      rendering_and_quality: "Expressive ink with clear army movements, kept consistent across the whole image.",
      key_features: 'ink landscape; tiny army dots; red banners; misty mountains',
    }, ['readable calligraphy'], [
      'Through misty ink mountains, two armies of tiny brush dots converge on a single bridge, while above them a great dragon of wet ink uncoils from the clouds. No readable text or logo.',
      'In a sweeping ink landscape, a vast army marches in perfect formation, and a single red dot at the end is clearly going the wrong way. No readable text or logo.',
      'Across empty grey washes, one small red banner stands on a hill surrounded by mist, and there are no soldiers left beside it. No readable text or logo.',
    ]),
    study('Painted Hub-Town Backdrop', 'painted game town background', 'hub-town', {
      aesthetic: 'Painted hub-town backdrop: a lush painted town square where adventurers rest between quests, shops, fountains and banners arranged like a stage set waiting for characters.',
      subject_treatment: `${keep}; set the subject in a detailed painted town square like a stage backdrop.`,
      color_and_tone: 'Warm afternoon golds, terracotta roofs and green ivy.',
      lighting_and_shadow: "Warm late light with long soft shadows, kept consistent across the whole image.",
      texture_and_material: 'Painterly stone, wood signs, cloth awnings and foliage.',
      camera_and_composition: "Frontal or slightly elevated stage-like view, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with cozy safe haven.',
      rendering_and_quality: 'Rich detailed backdrop with no text on signs.',
      key_features: 'painted town square; shop fronts; fountain; stage-like view',
    }, ['readable shop signs'], [
      'In a warm painted town square, the fountain statue of a hero has climbed down from its pedestal to buy bread, and nobody seems surprised. No readable text or logo.',
      'Across a golden painted square, every shopkeeper is shouting at the same hero, who is holding a single copper coin. No readable text or logo.',
      "At dusk in a lovingly painted town square, every townsperson has stopped mid-step and is staring up at the clock tower, whose hands are moving backward. No readable text or logo.",
    ]),
    study('Sprites on Painted Diorama', 'pixel sprites in painterly 3d diorama', 'sprite-diorama', {
      aesthetic: 'Sprites on painted diorama: crisp pixel-art characters standing inside a soft painterly 3D miniature world with tilt-shift depth of field, bloom and warm light.',
      subject_treatment: `${keep}; render characters as crisp pixel sprites inside a soft 3D miniature world.`,
      color_and_tone: 'Warm glowing lights and rich painterly environment colors.',
      lighting_and_shadow: 'Soft bloom, point lights and shallow depth blur.',
      texture_and_material: "Pixel sprites against painted 3D textures, kept consistent across the whole image.",
      camera_and_composition: "Elevated three-quarter diorama view with blurred edges, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with nostalgic storybook warmth.',
      rendering_and_quality: "Crisp sprites contrasted with soft 3D depth, kept consistent across the whole image.",
      key_features: 'pixel sprites; painted 3D diorama; depth blur; warm bloom',
    }, [], [
      'Inside a glowing painted diorama of a canyon city, a crisp pixel hero stands on a bridge while a huge pixel dragon circles through the soft blurred sky. No readable text or logo.',
      'In a warm miniature tavern world, a tiny pixel bard is playing so badly that the soft 3D candles around him are leaning away. No readable text or logo.',
      'Through the soft blur of a painted diorama forest, a single crisp pixel figure stands on a path that fades into bright out-of-focus nothing. No readable text or logo.',
    ]),
    study('Ornate Codex Character Plate', 'ornamental character art plate', 'codex-plate', {
      aesthetic: 'Ornate codex character plate: a full-length character painting set in an ornamental frame of filigree and gems, like a collectible codex entry, with a pale patterned backdrop.',
      subject_treatment: `${keep}; paint the subject full-length inside an ornamental filigree frame.`,
      color_and_tone: 'Soft pastel backdrop with rich costume colors and gold ornament.',
      lighting_and_shadow: "Even soft light with delicate highlights, kept consistent across the whole image.",
      texture_and_material: 'Fine painterly costume detail and gilded filigree frame.',
      camera_and_composition: "Full-length centered figure in a tall frame, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with elegant collectible pride.',
      rendering_and_quality: "Polished detailed figure with no captions, kept consistent across the whole image.",
      key_features: 'ornamental frame; full-length figure; filigree; patterned backdrop',
    }, ['captions'], [
      'Inside a gem-studded filigree frame, a moth-winged queen of the night market stands full-length, her cloak covered in thousands of tiny glowing lanterns. No readable text or logo.',
      "Posing with great importance, a proud frog knight in full costume holds a lily-pad shield inside a collectible gold filigree frame. No readable text or logo.",
      'Within a delicate gold frame, a porcelain-masked dancer stands full-length, and a thin crack runs down the mask into the frame itself. No readable text or logo.',
    ]),
    study('Painted Campfire Rest Scene', 'rpg rest by campfire painting', 'campfire-rest', {
      aesthetic: 'Painted campfire rest scene: a small party resting around a campfire at night, warm firelight on faces and gear, dark forest pressing in, painted with quiet intimacy.',
      subject_treatment: `${keep}; gather the subject around a campfire in a warm pool of light.`,
      color_and_tone: "Warm orange firelight against deep blue night, kept consistent across the whole image.",
      lighting_and_shadow: "Firelight from below with deep surrounding darkness, kept consistent across the whole image.",
      texture_and_material: "Painterly faces, leather gear, smoke and sparks, kept consistent across the whole image.",
      camera_and_composition: 'Circle of figures around the fire at eye level.',
      atmosphere_and_mood: 'Keep the requested mood with fragile nighttime comfort.',
      rendering_and_quality: "Intimate painterly scene with readable faces, kept consistent across the whole image.",
      key_features: 'campfire circle; warm firelight; dark forest; resting party',
    }, [], [
      'Around a small campfire in a dark forest, an adventuring party tells stories while a giant with lantern eyes sits quietly behind them, listening. No readable text or logo.',
      "By a crackling fire, a party of heroes stares hungrily at a single roasting sausage that the smallest of them caught after a long hunt. No readable text or logo.",
      'Around a dying campfire, one traveler keeps watch, and outside the circle of light the trees are standing closer than they were an hour ago. No readable text or logo.',
    ]),
    study('Diagonal Skirmish Oil Sketch', 'loose oil battle sketch', 'skirmish-sketch', {
      aesthetic: 'Diagonal skirmish oil sketch: a loose fast oil sketch of a fantasy clash, bodies and banners thrown along a strong diagonal, broken color and dust.',
      subject_treatment: `${keep}; throw the subject into a loose diagonal clash of bodies, banners and dust.`,
      color_and_tone: 'Dusty ochres, steel greys and splashes of banner red.',
      lighting_and_shadow: "Harsh sun through dust, strong value contrast, kept consistent across the whole image.",
      texture_and_material: 'Loose oil strokes, dragged paint and dust haze.',
      camera_and_composition: "Strong diagonal from corner to corner, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with chaotic momentum, kept consistent across the whole image.",
      rendering_and_quality: "Energetic sketchy finish, not polished, kept consistent across the whole image.",
      key_features: 'diagonal clash; loose oil strokes; dust haze; banners',
    }, ['gore'], [
      'Along a violent diagonal of dust and banners, a cavalry charge crashes into a wall of shields as a war-elephant rears behind them in the haze. No readable text or logo.',
      'In a fast loose oil sketch, two armies clash across a field while a farmer calmly drives his cart of cabbages straight through the middle. No readable text or logo.',
      'Through dragged grey paint and dust, a lone banner-bearer runs up a slope toward a hilltop where the enemy should be, but the hill is empty. No readable text or logo.',
    ]),
    study('Sepia Costume Concept Sheet', 'game costume design sheet', 'costume-sheet', {
      aesthetic: 'Sepia costume concept sheet: a production sheet of one character in several costume variations, pencil and sepia wash with small detail callouts drawn as sketches, not words.',
      subject_treatment: `${keep}; show the subject in three or four costume variations side by side.`,
      color_and_tone: 'Sepia and warm grey washes with one accent color.',
      lighting_and_shadow: "Simple consistent light for design clarity, kept consistent across the whole image.",
      texture_and_material: "Pencil lines, sepia wash and toned paper, kept consistent across the whole image.",
      camera_and_composition: 'Row of full-length figures with small detail sketches.',
      atmosphere_and_mood: 'Keep the requested mood with focused design exploration.',
      rendering_and_quality: "Clear design sheet with no written notes, kept consistent across the whole image.",
      key_features: 'costume variations; sepia wash; detail sketches; toned paper',
    }, ['written notes or labels'], [
      "Shown in four costume variations, each mask stranger than the last, a plague-doctor alchemist fills a warm-toned concept sheet with small sketches of her glass vials. No readable text or logo.",
      'Across a costume sheet, a hero tries on four different armors, and in every version the same small cat is hiding in a different pocket. No readable text or logo.',
      'On toned paper, a knight is drawn in three costume variations, and in the fourth sketch the armor stands alone and empty. No readable text or logo.',
    ]),
    study('Candlelit Oil Party Portrait', 'group portrait in candlelight', 'party-portrait', {
      aesthetic: 'Candlelit oil party portrait: a formal oil group portrait of an adventuring party posed in a dark hall by candlelight, rich chiaroscuro and varnished shadows.',
      subject_treatment: `${keep}; pose the subject as a formal group portrait lit by candles.`,
      color_and_tone: 'Deep umber shadows, warm candle gold and rich fabrics.',
      lighting_and_shadow: "Candlelight chiaroscuro with dark backgrounds, kept consistent across the whole image.",
      texture_and_material: "Varnished oil, velvet, metal glints and crackle, kept consistent across the whole image.",
      camera_and_composition: 'Group arranged in tiers like a formal portrait.',
      atmosphere_and_mood: 'Keep the requested mood with solemn legendary pride.',
      rendering_and_quality: "Rich old-master finish with readable faces, kept consistent across the whole image.",
      key_features: 'group portrait; candlelight; chiaroscuro; varnished oil',
    }, [], [
      'Posed formally in a candlelit hall, a party of monster hunters stands proudly around the mounted head of a beast whose eyes are, unmistakably, still open. No readable text or logo.',
      'In a solemn oil group portrait, a legendary party poses with great dignity, except for the rogue in the back who is visibly stealing the painter\'s brush. No readable text or logo.',
      "Posed in a dark candlelit portrait, five adventurers hold perfectly still, but the candle flames are all bending toward the painter as if something were breathing in. No readable text or logo.",
    ]),
    study('Pastel Twilight Journey Painting', 'soft pastel travel painting', 'pastel-journey', {
      aesthetic: 'Pastel twilight journey painting: soft chalk-pastel landscapes of a lonely journey at dusk, blended skies of peach and lavender, tiny travelers on long roads.',
      subject_treatment: `${keep}; place the subject small on a long road beneath a vast blended pastel sky.`,
      color_and_tone: "Peach, lavender, dusty rose and soft teal, kept consistent across the whole image.",
      lighting_and_shadow: "Glowing twilight with soft blended shadows, kept consistent across the whole image.",
      texture_and_material: 'Chalk pastel grain, blended skies and paper tooth.',
      camera_and_composition: "Wide landscape, road leading to the horizon, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with gentle melancholy wandering.',
      rendering_and_quality: "Soft blended finish with clear small figures, kept consistent across the whole image.",
      key_features: 'pastel sky; long road; tiny travelers; chalk grain',
    }, [], [
      'Under a vast peach and lavender sky, two tiny travelers walk a long road toward a mountain that is actually the sleeping head of an enormous stone giant. No readable text or logo.',
      'On a long pastel road at dusk, a traveler walks with a donkey that is carrying far more luggage than seems physically possible. No readable text or logo.',
      'In soft twilight pastels, a lone figure stands at the end of a road that simply stops in a field, the sky continuing below it. No readable text or logo.',
    ]),
    study('Painted Loot Still Life', 'treasure item painting', 'loot-still-life', {
      aesthetic: 'Painted loot still life: a rich painterly still life of adventuring treasure, swords, potions, maps and coins arranged on a table like a Dutch still life.',
      subject_treatment: `${keep}; arrange the subject as treasure in a rich painted still life.`,
      color_and_tone: 'Deep shadows with gleaming gold, glass and gem colors.',
      lighting_and_shadow: "Single window light with rich reflections, kept consistent across the whole image.",
      texture_and_material: "Glass bottles, metal, leather, parchment and velvet, kept consistent across the whole image.",
      camera_and_composition: "Table-top arrangement against a dark background, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with tempting abundance, kept consistent across the whole image.",
      rendering_and_quality: "Painterly realism with convincing materials, kept consistent across the whole image.",
      key_features: 'treasure still life; glass potions; gold; dark background',
    }, ['readable map labels'], [
      'On a dark table, a still life of adventuring loot glows in window light, and the dragon egg in the middle has just cracked open, its tiny claw on a gold coin. No readable text or logo.',
      'In a painterly treasure still life, every item gleams magnificently except the hero\'s actual prize, a slightly moldy piece of cheese. No readable text or logo.',
      'A rich still life of potions and coins sits on a table, and one bottle contains a tiny figure pressing its hands against the glass. No readable text or logo.',
    ]),
    study('Class Line-Up Wash Drawing', 'character class lineup drawing', 'class-lineup', {
      aesthetic: 'Class line-up wash drawing: a row of different character classes standing side by side on a shared ground line, drawn in graphite with transparent color washes.',
      subject_treatment: `${keep}; line the subject up with other classes on a shared ground line.`,
      color_and_tone: "Graphite greys with soft transparent color accents, kept consistent across the whole image.",
      lighting_and_shadow: "Consistent soft light and small ground shadows, kept consistent across the whole image.",
      texture_and_material: "Graphite lines, color washes and white paper, kept consistent across the whole image.",
      camera_and_composition: "Horizontal row of full-length figures, same scale, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with confident ensemble character.',
      rendering_and_quality: "Clear silhouettes that read distinctly, kept consistent across the whole image.",
      key_features: 'class line-up; shared ground line; graphite and wash; distinct silhouettes',
    }, ['labels'], [
      "Standing in a line on the same ground, a warrior, a mage, a rogue and a cleric pose heroically beside a fifth class nobody expected, a large and confident bee. No readable text or logo.",
      'In a graphite line-up of heroes, each character is posing dramatically except the healer, who is already bandaging the warrior\'s stubbed toe. No readable text or logo.',
      'In a row of classes drawn in grey and wash, one outline at the end has been drawn but never filled in, and it is standing slightly closer. No readable text or logo.',
    ]),
  ],
};

export default spec;
