import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Medieval atlas modern visual techniques: contemporary stylized real-time and 2D game rendering
// methods as portable looks. Six originals get card briefs; fourteen new studies add pastel
// toy-town 3D, anime toon ramps, watercolor and ink-wash shaders, clear-line 3D, glowing forest
// silhouettes, cozy isometric rooms, one-bit dithered 3D, rotoscoped flat motion, unlit gradient
// low poly, 2D skeletal cutouts, stylized magic VFX, crosshatch shading and wind-swept grasslands.
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
  tags: [tag, 'modern-game-render', 'portable-style-study'],
  dna: dna(fields),
  avoid: [...avoid, 'interface or HUD', 'existing game characters or logos', ...STYLE_AVOID],
  briefs,
});

const keep = 'Preserve the requested identity, count, pose and action with original characters';

const spec: Spec = {
  pack: 'pack_23',
  category: '11. Modern Visual Techniques',
  updates: {
    'SP23-047': { briefs: [
      'Rising out of a canyon of stacked flat painted planes, a stone colossus shoulders a waterfall while tiny climbers scale the ledges of its back, depth made only by overlapping layers. No readable text or logo.',
      "Crouched behind a garden hedge of flat stacked shapes, a fox thief waits for a chicken who is hiding behind the next layer, equally sure of itself. No readable text or logo.",
      "Following a lantern through a night forest of stacked flat planes, a traveler notices it is always exactly one layer ahead of her. No readable text or logo.",
    ] },
    'SP23-048': { briefs: [
      'Laid out as a clean explanatory sheet, an original griffin is shown from front, side and back with wing-fold sketches and a small scale silhouette beside a horse, all without words. No readable text or logo.',
      "Arranged as a tidy reference sheet, a goblin chef is shown from three angles with close-up sketches of his five important ladles. No readable text or logo.",
      'Presented on a neat explanatory sheet, a mysterious lantern is drawn from every side, and in the last view its flame points in the opposite direction. No readable text or logo.',
    ] },
    'SP23-049': { briefs: [
      'Pushing through a snowdrift, a tusked mammoth carries a shrine on its back, its fur and the carved wood showing hand-modeled surface variation under a controlled raster finish. No readable text or logo.',
      "Sculpted slightly lopsided with irregular hand-modeled surfaces, a clay-like knight is trying to stand perfectly straight out of pride. No readable text or logo.",
      'Shaped with soft sculptural light and a fine raster grain, a quiet stone well has a single fingerprint pressed into its rim, as if someone large touched it. No readable text or logo.',
    ] },
    'SP23-050': { briefs: [
      "Carrying a little wooden village on its back, a flying whale drifts above matte clouds, its rounded body lit by short soft contact shadows. No readable text or logo.",
      "Balanced on a matte rounded hill, a round knight has fallen over and is rolling slowly downhill while his horse watches calmly. No readable text or logo.",
      'Resting on a soft matte table, a round music box sits open and silent, and its small dancer has stepped off the pedestal to sit at the edge. No readable text or logo.',
    ] },
    'SP23-051': { briefs: [
      "Parading through a canyon town, a festival of lantern spirits moves in curving flat color planes, their bodies drawn in economical lines and patterned robes. No readable text or logo.",
      "Swinging through curved flat-color planes, a monkey steals a king's crown and places it on a confused turtle. No readable text or logo.",
      "Carrying an umbrella under a clear evening sky, a girl walks through curving planes of flat color while rain falls only on her. No readable text or logo.",
    ] },
    'SP23-052': { briefs: [
      "Riding a wave that curls into the shape of a dragon, a wind spirit leaps across masses of sea and cloud, crisp color boundaries glowing against deep blue. No readable text or logo.",
      "Built from luminous geometric curves, a fox and a crow play a serious game of chess on a tree stump while the pieces keep rolling away. No readable text or logo.",
      "Rising from curving hills at night, a lake of glowing geometric fish swims upward into the sky, and the last fish has turned back to watch the one person still on the shore. No readable text or logo.",
    ] },
  },
  creates: [
    study('Soft Pastel Toy-Town 3D', 'rounded cozy pastel game 3d', 'toy-town-3d', {
      aesthetic: 'Soft pastel toy-town 3D: cozy rounded real-time 3D with pastel colors, chunky soft shapes, gentle ambient light and a slightly curved miniature world.',
      subject_treatment: `${keep}; render the subject as chunky rounded pastel shapes in a cozy miniature world.`,
      color_and_tone: 'Mint, peach, butter yellow and sky blue pastels.',
      lighting_and_shadow: "Soft ambient light with gentle occlusion, kept consistent across the whole image.",
      texture_and_material: "Smooth matte surfaces and simple painted details, kept consistent across the whole image.",
      camera_and_composition: 'Slightly high three-quarter view on a curved ground.',
      atmosphere_and_mood: 'Keep the requested mood with warm cozy safety.',
      rendering_and_quality: "Clean soft real-time render, kept consistent across the whole image.",
      key_features: 'pastel palette; chunky round shapes; curved world; soft ambient light',
    }, [], [
      'Wandering into a pastel toy town, a gigantic friendly sea serpent has curled around the entire village square to nap, while tiny villagers set up a market on its tail. No readable text or logo.',
      'Opening a tiny pastel shop, a raccoon merchant proudly sells exactly one item, a single enormous turnip, to a line of eager customers. No readable text or logo.',
      "At the edge of a round pastel island, a small fisherman sits on his dock, and the gentle waves are washing up hundreds of tiny identical rubber ducks. No readable text or logo.",
    ]),
    study('Anime Toon-Ramp 3D', 'anime-shaded real-time 3d', 'toon-ramp', {
      aesthetic: 'Anime toon-ramp 3D: real-time 3D characters shaded with crisp anime ramps, hard shadow edges, painted faces, rim light and bright stylized skies.',
      subject_treatment: `${keep}; render the subject as a 3D model with crisp two-step anime shading and painted details.`,
      color_and_tone: "Bright saturated colors with cool shadow tones, kept consistent across the whole image.",
      lighting_and_shadow: "Hard-edged ramp shadows and bright rim light, kept consistent across the whole image.",
      texture_and_material: 'Clean painted textures, hair clumps and crisp highlights.',
      camera_and_composition: "Dynamic low-angle action or wide scenic shot, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with bright adventurous energy.',
      rendering_and_quality: "Clean anime-like 3D render, kept consistent across the whole image.",
      key_features: 'toon ramp shading; rim light; painted textures; bright sky',
    }, [], [
      'Gliding off a cliff above a sea of clouds, a young swordswoman spreads a paraglider as a floating island city appears ahead, her cloak shaded in crisp anime ramps. No readable text or logo.',
      'Posing dramatically on a rooftop, a hero prepares a special attack while a pigeon lands on his sword and refuses to leave. No readable text or logo.',
      'Standing in a bright meadow under a perfect sky, a girl looks at her shadow, which has the crisp hard edge of the ramp shading but a different shape. No readable text or logo.',
    ]),
    study('Watercolor-Shaded 3D', 'real-time watercolor shader', 'watercolor-shader', {
      aesthetic: 'Watercolor-shaded 3D: 3D scenes rendered to look like watercolor, pigment pooling at edges, paper texture and soft bleeding washes applied to moving geometry.',
      subject_treatment: `${keep}; render the subject in 3D with watercolor edge pooling and paper texture.`,
      color_and_tone: 'Transparent washes with darker pigment at the edges.',
      lighting_and_shadow: "Soft light expressed through wash density, kept consistent across the whole image.",
      texture_and_material: "Paper grain, edge darkening and wet blooms, kept consistent across the whole image.",
      camera_and_composition: "Scenic 3D view with painterly depth, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with gentle storybook motion.',
      rendering_and_quality: "Convincing watercolor look over 3D forms, kept consistent across the whole image.",
      key_features: 'watercolor shader; edge pooling; paper grain; 3D depth',
    }, [], [
      'Sailing a paper boat down a river through a watercolor 3D forest, a tiny knight in a walnut helmet is pursued by a frog the size of a house. No readable text or logo.',
      'Running through a washed-out meadow, a dog chases a butterfly that leaves a small trail of wet pigment blooms behind it. No readable text or logo.',
      'Standing in a watercolor-rendered village street, a lone figure casts a shadow that bleeds outward on the paper like spilled ink. No readable text or logo.',
    ]),
    study('Ink-Wash Shaded 3D', 'sumi ink shader render', 'ink-shader', {
      aesthetic: 'Ink-wash shaded 3D: 3D worlds rendered like sumi ink painting, bold brush outlines, grey wash shading and paper white skies, with celestial color accents.',
      subject_treatment: `${keep}; render the subject in 3D with brush-ink outlines and grey wash shading.`,
      color_and_tone: 'Ink black, wash greys, paper white and a few bright accents.',
      lighting_and_shadow: "Shading as ink wash density, kept consistent across the whole image.",
      texture_and_material: "Brush outlines, dry brush and rice-paper grain, kept consistent across the whole image.",
      camera_and_composition: "Wide scenic view with calligraphic motion, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with mythic brush energy.',
      rendering_and_quality: "Clean ink shader over 3D forms, kept consistent across the whole image.",
      key_features: 'brush outlines; ink wash shading; paper white sky; bright accents',
    }, ['readable calligraphy'], [
      'Running across a sea of brushed ink waves, a white wolf goddess leaves blooming flowers of red ink wherever her paws touch the water. No readable text or logo.',
      "Drawn by the sweep of a brush in 3D, a monk tries to meditate while a sparrow keeps landing on his large ink-stroke hat. No readable text or logo.",
      'Across a paper-white valley, a bridge is only half painted in ink, and a traveler is standing exactly where the brushstroke stops. No readable text or logo.',
    ]),
    study('Clear-Line 3D Render', 'ligne claire shader 3d', 'clear-line-3d', {
      aesthetic: 'Clear-line 3D render: 3D worlds rendered with even black outlines and flat colors like European clear-line comics, wide deserts and pale skies.',
      subject_treatment: `${keep}; render the subject in 3D with even black outlines and flat unshaded colors.`,
      color_and_tone: 'Flat pale sand, sky blue and muted pastel planes.',
      lighting_and_shadow: "Minimal flat shadows, mostly unshaded, kept consistent across the whole image.",
      texture_and_material: "Uniform outlines and clean flat fills, kept consistent across the whole image.",
      camera_and_composition: "Wide cinematic landscapes with small figures, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with vast calm exploration.',
      rendering_and_quality: "Crisp outline render with flat clean color, kept consistent across the whole image.",
      key_features: 'even black outlines; flat colors; vast landscapes; pale sky',
    }, [], [
      'Crossing an endless pale desert, a traveler on a giant long-legged beetle passes the half-buried face of a colossal statue, everything outlined in even clear black line. No readable text or logo.',
      "Parked in a flat-colored desert, a hover-cart has broken down and its driver is arguing with a calm lizard who clearly knows the way. No readable text or logo.",
      "Walking across a vast pale salt flat, a caravan of camels casts clean black-outlined shadows, but one shadow in the middle belongs to something with far too many legs. No readable text or logo.",
    ]),
    study('Glowing Forest Silhouette Layers', 'backlit silhouette platformer art', 'glow-silhouette', {
      aesthetic: 'Glowing forest silhouette layers: layered dark silhouettes of forest and creatures against glowing blue and teal light, luminous spirits and soft bloom, like a lyrical platformer.',
      subject_treatment: `${keep}; render the subject as a dark or softly glowing silhouette among layered backlit forest.`,
      color_and_tone: 'Deep indigo silhouettes with teal, cyan and gold glows.',
      lighting_and_shadow: "Strong backlight and soft bloom between layers, kept consistent across the whole image.",
      texture_and_material: "Clean silhouettes, glowing particles and misty layers, kept consistent across the whole image.",
      camera_and_composition: 'Side-view layered depth with a small central figure.',
      atmosphere_and_mood: 'Keep the requested mood with lyrical luminous melancholy.',
      rendering_and_quality: "Clean layered glow without harsh noise, kept consistent across the whole image.",
      key_features: 'layered silhouettes; backlit glow; spirit particles; side view',
    }, [], [
      "Escaping a giant owl whose dark shape fills the whole upper canopy, a small luminous spirit leaps between backlit branches in teal light. No readable text or logo.",
      "Followed by a line of tiny light-spirits who think it is their mother, a round forest creature hops across luminous mushrooms in the dark. No readable text or logo.",
      'Deep in layered blue silhouettes, a single glowing figure walks forward while the dark shapes of the trees behind it are slowly leaning in. No readable text or logo.',
    ]),
    study('Cozy Isometric Room Render', 'small isometric interior render', 'iso-room', {
      aesthetic: 'Cozy isometric room render: a single cut-away room seen from an isometric angle, packed with small furniture, plants and warm lamps like a tiny dollhouse.',
      subject_treatment: `${keep}; place the subject in a single cozy isometric cut-away room.`,
      color_and_tone: 'Warm lamp amber, wood tones and soft pastels.',
      lighting_and_shadow: "Warm interior lights and soft shadows, kept consistent across the whole image.",
      texture_and_material: 'Clean low-poly or smooth models with small details.',
      camera_and_composition: 'Isometric cut-away room floating on a plain background.',
      atmosphere_and_mood: 'Keep the requested mood with snug domestic calm.',
      rendering_and_quality: "Tidy detailed miniature render, kept consistent across the whole image.",
      key_features: 'isometric cut-away; tiny furniture; warm lamps; plain background',
    }, ['readable book titles'], [
      "Knitting a long scarf by the fireplace, a retired dragon curls its tail around a teapot and a stack of books inside a small cut-away room. No readable text or logo.",
      'In a tiny isometric bedroom, a wizard\'s apprentice has spilled a potion and every plant in the room is now waving at him. No readable text or logo.',
      'Floating on a plain background, a cozy isometric room has everything ready for guests, with one extra chair that is facing the wall. No readable text or logo.',
    ]),
    study('One-Bit Dithered 3D', 'monochrome dithered 3d shader', 'one-bit-3d', {
      aesthetic: 'One-bit dithered 3D: 3D scenes rendered in only black and white pixels, shading made of ordered dither, like an old desktop engraving brought to life.',
      subject_treatment: `${keep}; render the subject in 3D using only black and white dithered pixels.`,
      color_and_tone: 'Pure black and white, or two tinted tones.',
      lighting_and_shadow: "Dither density shows light and shadow, kept consistent across the whole image.",
      texture_and_material: "Crisp ordered dither patterns on 3D surfaces, kept consistent across the whole image.",
      camera_and_composition: "First-person or cinematic 3D view, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with cold eerie precision.',
      rendering_and_quality: "Crisp one-bit dithering without gray, kept consistent across the whole image.",
      key_features: 'one-bit dither; black and white; 3D scene; ordered pattern',
    }, ['grey tones'], [
      'Frozen on the deck of a ghost ship, a crew of sailors struggles with a giant tentacle rising from the sea, every surface shaded only in black and white dither. No readable text or logo.',
      'On a dithered one-bit ship deck, a captain proudly poses while a seagull in perfect dither stands on his hat. No readable text or logo.',
      "Along a black and white dithered ship deck in the fog, the ropes are coiling themselves slowly around the mast while the crew sleeps. No readable text or logo.",
    ]),
    study('Rotoscoped Flat-Color Motion', 'traced live-action animation frame', 'rotoscope', {
      aesthetic: 'Rotoscoped flat-color motion: animation frames traced over real movement, lifelike motion in flat simple colors with slightly wobbly outlines.',
      subject_treatment: `${keep}; render the subject with realistic traced motion in flat color and wobbly outline.`,
      color_and_tone: "Flat limited colors with realistic silhouettes, kept consistent across the whole image.",
      lighting_and_shadow: 'Simple flat shadow shapes traced from real light.',
      texture_and_material: "Slightly wobbly outlines and flat fills, kept consistent across the whole image.",
      camera_and_composition: "Cinematic frame with natural motion, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with uncanny lifelike motion.',
      rendering_and_quality: "Convincing rotoscope frame, kept consistent across the whole image.",
      key_features: 'traced motion; flat color; wobbly outlines; lifelike pose',
    }, [], [
      'Vaulting over a castle wall with perfectly real acrobatic motion, a thief in flat red cloth lands in front of a guard mid-yawn, outlines slightly wobbling. No readable text or logo.',
      "Traced from real movement, an elderly wizard performs an extremely convincing dance move, to the horror of his apprentice. No readable text or logo.",
      'With lifelike traced motion, a figure turns around in a dark hallway, and its flat face has no features at all. No readable text or logo.',
    ]),
    study('Unlit Gradient Low-Poly', 'flat unlit gradient 3d landscapes', 'unlit-gradient', {
      aesthetic: 'Unlit gradient low-poly: minimalist 3D landscapes with flat unlit polygons, soft sky gradients and atmospheric color fog, calm and meditative.',
      subject_treatment: `${keep}; render the subject as simple unlit low-poly shapes in gradient color fog.`,
      color_and_tone: 'Sunset gradients of orange, pink and violet fog.',
      lighting_and_shadow: "No lighting; color fog creates depth, kept consistent across the whole image.",
      texture_and_material: "Flat untextured polygons, kept consistent across the whole image.",
      camera_and_composition: 'Wide horizon with small figures and layered hills.',
      atmosphere_and_mood: "Keep the requested mood with meditative stillness, kept consistent across the whole image.",
      rendering_and_quality: "Clean minimal shapes and smooth gradients, kept consistent across the whole image.",
      key_features: 'unlit polygons; gradient fog; flat shapes; meditative horizon',
    }, [], [
      'Sliding down endless gradient dunes on a board, a lone traveler races a flock of paper birds toward a violet horizon where a huge flat moon is rising. No readable text or logo.',
      "Having climbed to the top of a flat pink hill, a llama refuses to come down and stares out at the sunset fog. No readable text or logo.",
      'In flat violet fog, a single low-poly lamppost stands in a field, lit, although there is no light in this world. No readable text or logo.',
    ]),
    study('2D Skeletal Cutout Character', 'jointed flat 2d rig art', 'skeletal-cutout', {
      aesthetic: '2D skeletal cutout character: flat painted character pieces joined at visible pivots like a digital puppet, crisp edges and slight overlaps at elbows and knees.',
      subject_treatment: `${keep}; build the subject from flat painted parts joined at pivots like a puppet.`,
      color_and_tone: "Bold painted colors on each flat part, kept consistent across the whole image.",
      lighting_and_shadow: "Painted-in shading on each piece, kept consistent across the whole image.",
      texture_and_material: "Crisp cut edges, overlaps and pivot joints, kept consistent across the whole image.",
      camera_and_composition: "Side view in an action pose, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with bouncy puppet charm.',
      rendering_and_quality: "Clean rigged-part look, kept consistent across the whole image.",
      key_features: 'flat parts; pivot joints; overlapping limbs; action pose',
    }, [], [
      'Swinging a huge hammer in a side-view pose, a dwarf built from flat painted parts pivots at every joint while his beard is a separate swinging piece. No readable text or logo.',
      'Assembled from flat puppet parts, a knight has been put together with one arm on backward and is trying to salute anyway. No readable text or logo.',
      'Hanging still on a dark stage, a flat jointed puppet figure has all its parts slightly separated, as if something just pulled it apart. No readable text or logo.',
    ]),
    study('Stylized Magic VFX Burst', 'hand-crafted game spell effect', 'magic-vfx', {
      aesthetic: 'Stylized magic VFX burst: hand-designed game spell effects, sharp swirling shapes, glowing ribbons and crystal shards bursting with bold stylized color.',
      subject_treatment: `${keep}; wrap the subject in a bold stylized burst of spell effects.`,
      color_and_tone: 'Hot magenta, cyan and gold against dark surroundings.',
      lighting_and_shadow: "Emissive effect light illuminating the figure, kept consistent across the whole image.",
      texture_and_material: "Sharp stylized flame shapes, ribbons and shards, kept consistent across the whole image.",
      camera_and_composition: "Dynamic centered burst with figure in action, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with explosive magical power.',
      rendering_and_quality: "Crisp stylized effects, not realistic smoke, kept consistent across the whole image.",
      key_features: 'stylized spell shapes; glowing ribbons; crystal shards; emissive light',
    }, ['realistic smoke'], [
      'Summoning a storm of crystal shards and violet ribbons, a battle mage lifts an entire collapsing bridge into the air above a canyon. No readable text or logo.',
      "Casting his first spell, a young mage produces a huge glowing magical explosion that leaves behind a single small, confused sheep. No readable text or logo.",
      "Around an empty altar, a spell of gold ribbons and shards keeps swirling although whoever cast it is nowhere to be seen. No readable text or logo.",
    ]),
    study('Crosshatch-Shaded 3D', 'hatching shader 3d render', 'hatch-shader', {
      aesthetic: 'Crosshatch-shaded 3D: 3D scenes shaded with pen-and-ink crosshatching that follows the forms, like an etching come to life.',
      subject_treatment: `${keep}; render the subject in 3D with form-following crosshatch shading.`,
      color_and_tone: 'Black ink hatching on cream paper, optional sepia.',
      lighting_and_shadow: "Hatch density follows light and shadow, kept consistent across the whole image.",
      texture_and_material: "Crosshatch strokes, paper grain and ink lines, kept consistent across the whole image.",
      camera_and_composition: "Cinematic 3D view with depth, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with old-book adventure, kept consistent across the whole image.",
      rendering_and_quality: "Consistent hatch shader over 3D forms, kept consistent across the whole image.",
      key_features: 'crosshatch shader; form-following strokes; cream paper; 3D depth',
    }, [], [
      'Steering a clockwork airship through a canyon of floating rocks, a captain leans over the rail as crosshatched clouds swirl beneath the hull. No readable text or logo.',
      "Rendered in etched hatching, a serious owl librarian stamps books while a mouse tries to sneak one out under its coat. No readable text or logo.",
      "Spiraling down into the dark, a stairwell of etched strokes gets denser with every step until the bottom is nothing but ink. No readable text or logo.",
    ]),
    study('Wind-Swept Stylized Grassland', 'painterly wind grass real-time scene', 'wind-grass', {
      aesthetic: 'Wind-swept stylized grassland: vast real-time fields of painterly grass and flowers bending in the wind, glowing golden light and drifting leaves.',
      subject_treatment: `${keep}; place the subject in a vast field of painterly grass bending in the wind.`,
      color_and_tone: "Golden grass, red flowers and warm sky, kept consistent across the whole image.",
      lighting_and_shadow: "Low golden sun with rim-lit grass, kept consistent across the whole image.",
      texture_and_material: "Stylized grass blades, petals and drifting leaves, kept consistent across the whole image.",
      camera_and_composition: "Wide cinematic field with a lone figure, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with windswept longing, kept consistent across the whole image.",
      rendering_and_quality: "Painterly real-time field with coherent wind, kept consistent across the whole image.",
      key_features: 'wind-swept grass; golden light; drifting leaves; lone figure',
    }, [], [
      'Riding through a sea of golden grass, a lone horse archer is followed by a guiding wind that bends the whole field into a path toward a burning shrine. No readable text or logo.',
      'Lying in a field of wind-swept flowers, a knight has fallen asleep while his horse eats every single flower around him. No readable text or logo.',
      "In a vast grassland at dusk, the wind blows every blade one way, except in a perfect circle around a figure standing still. No readable text or logo.",
    ]),
  ],
};

export default spec;
