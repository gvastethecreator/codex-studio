import type { Create, Dna, Spec } from '../tools/apply';
import { MATERIAL_AVOID } from './_material';

// Elemental FX: a contained effect around or on the target named in the prompt. It never adds a
// new event, disaster or environment; emitted particles stay close to the target.
const AVOID = [
  ...MATERIAL_AVOID,
  'unrequested disaster or event',
  'effect filling the whole scene',
];

const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
const pad = (t: string, min: number, tail: string) =>
  words(t) < min ? `${t.replace(/\.$/, '')}, ${tail}` : t;

function fx(
  aesthetic: string,
  behavior: string,
  color: string,
  light: string,
  texture: string,
  mood: string,
  key: string,
): Dna {
  return {
    aesthetic,
    subject_treatment: `Contain the effect on or immediately around the target named in the prompt (object, figure, hand, weapon or surface), keeping the target, its pose and the setting; the effect never becomes a new event or fills the scene: ${behavior}`,
    color_and_tone: pad(
      color,
      9,
      'concentrated around the target while the rest of the scene keeps its palette.',
    ),
    lighting_and_shadow: pad(
      light,
      9,
      'so the effect lights the target and casts believable local light.',
    ),
    texture_and_material: pad(texture, 9, 'with physically plausible motion, density and falloff.'),
    camera_and_composition:
      'Keep the prompt framing; place the effect where it interacts with the target so its shape and motion read at card size.',
    atmosphere_and_mood: pad(mood, 8, 'coming from the effect rather than added scenery.'),
    rendering_and_quality:
      'Photoreal or cinematic VFX quality with clean edges, readable motion and no noisy haze over the whole frame.',
    key_features: `${key}; contained around the target`,
  };
}

const spec: Spec = {
  pack: 'pack_09',
  category: '5. Elemental And FX',
  updates: {
    'SP09-043': {
      dna: fx(
        'Slime and goo: thick translucent slime dripping, stretching and pooling on the target.',
        'glossy slime coats parts of the target, stretching into strands and pooling below.',
        'Lime, violet or clear slime with glossy highlights.',
        'Backlight for translucency and wet highlights.',
        'Viscous slime with strands, drips and bubbles.',
        'Gross, playful, strange and sticky.',
        'dripping slime strands; glossy pools',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an old iron sewer grate in a cobbled alley with thick translucent lime slime oozing up through the bars, stretching in long strands and pooling across the wet stones under a streetlamp. No text or logo.',
        'Photograph of a crystal chandelier in a dark ballroom dripping thick violet slime from every arm, long translucent strands stretching toward a glossy puddle on the parquet. No text or logo.',
        'Photograph of a gloved hand lifting the lid of an old sea chest and pulling glistening green slime strands from the coins inside, translucent goo sagging and pooling on the deck. No text or logo.',
      ],
    },
    'SP09-051': {
      dna: fx(
        'Fire and magma: flame and molten rock contained on the target — glowing cracks, dripping magma and licking flames.',
        'the target glows with magma cracks and short licking flames without burning away.',
        'Orange, yellow and deep red with black crust.',
        'Self-illuminating glow casting warm light.',
        'Molten cracks, crust, flames and embers.',
        'Fierce, dangerous, primal and hot.',
        'glowing magma cracks; licking flames; black crust',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a sword blade glowing with magma cracks and licking flames held in a dark hall. No text or logo.',
        'Photograph of a stone golem fist the size of a boulder resting in a quarry, glowing orange magma veins running through its cracks, flames licking the knuckles and molten drops falling onto the gravel. No text or logo.',
        'Photograph of a huge egg with glowing magma cracks lying in a nest of grey ash on a volcanic slope, molten light pulsing from the fissures and small flames curling at the base. No text or logo.',
      ],
    },
    'SP09-052': {
      dna: fx(
        'Electricity: branching arcs and crackling bolts crawling over and around the target.',
        'lightning arcs crawl over the target and jump between its edges.',
        'Electric blue-white with violet fringes.',
        'Flickering bright arcs lighting the target.',
        'Branching arcs, sparks and ionized glow.',
        'Charged, dangerous, energetic and sudden.',
        'branching lightning arcs; sparks; blue-white glow',
      ),
      avoid: AVOID,
      briefs: [
        "Photograph of a blacksmith's anvil in a dark forge crackling with branching blue lightning arcs, bolts crawling over the horn and jumping to the hammer on the floor, sparks in the air. No text or logo.",
        'Photograph of a cello on a dark concert stage with bright electric arcs jumping between its strings and crawling down the endpin, violet glow on the polished wood. No text or logo.',
        'Photograph of a raven perched on a wet iron fence with fine blue lightning crawling across its feathers, arcs leaping to the railing tips in the rain at night. No text or logo.',
      ],
    },
    'SP09-053': {
      dna: fx(
        'Smoke and fog: curling smoke rising from or wrapping the target in soft volumes.',
        'smoke curls from the target and wraps it loosely without hiding it.',
        'Grey, white or tinted smoke.',
        'Backlight and side light revealing smoke volumes.',
        'Curling smoke wisps and soft volumes.',
        'Mysterious, soft, drifting and quiet.',
        'curling smoke wisps; soft volumes',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a hooded figure crossing a sunlit monastery courtyard, the cloak trailing soft curling grey smoke that coils around the pillars and dissolves into the bright air. No text or logo.',
        'Photograph of a porcelain teapot pouring a slow stream of white smoke instead of tea into a cup on a kitchen table, the smoke curling over the rim and spilling onto the saucer. No text or logo.',
        'Photograph of an antique pocket watch lying open on black velvet, wrapped in slow ribbons of grey smoke rising from its gears, a thin beam of light cutting through. No text or logo.',
      ],
    },
    'SP09-054': {
      dna: fx(
        'Water splash: a frozen crown or burst of water striking the target.',
        'a sharp water splash bursts from or against the target, frozen mid-air.',
        'Clear water with bright highlights.',
        'Hard strobe light freezing droplets.',
        'Splash crowns, droplets and sheets.',
        'Fresh, kinetic, sudden and bright.',
        'frozen water splash; droplets; strobe crispness',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a heavy war hammer striking the surface of a still pond, a frozen crown splash of water rising around the head, droplets suspended in midair against a dark treeline. No text or logo.',
        'Photograph of a ripe strawberry dropped into a bowl of milk, a white crown splash frozen around it, single droplets hanging in the air above a pale blue backdrop. No text or logo.',
        "Photograph of a galloping horse's hoof hitting a muddy puddle on a country lane, a burst of brown water frozen mid-splash, droplets catching the low sun. No text or logo.",
      ],
    },
    'SP09-056': {
      dna: fx(
        'Plasma energy: contained glowing energy — orbs, beams or auras — emanating from the target.',
        'a glowing energy aura or orb forms around the target or in a hand.',
        'Cyan, magenta or gold energy.',
        'Self-illuminating glow lighting nearby surfaces.',
        'Plasma filaments, glow and heat shimmer.',
        'Powerful, magical, futuristic and intense.',
        'plasma aura; glowing filaments; local glow',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a monk holding a small orb of gold plasma between his palms in a dark temple. No text or logo.',
        "Photograph of a wooden staff tip glowing with a sphere of cyan plasma filaments in a dark cave, crackling threads of light reaching toward the rock walls and lighting the mage's sleeve. No text or logo.",
        'Photograph of an old valve radio on a kitchen shelf leaking magenta plasma light from its speaker grille, glowing filaments curling out into the dark room. No text or logo.',
      ],
    },
    'SP09-057': {
      dna: fx(
        'Oil on water: iridescent oil film swirling over water around the target.',
        'rainbow oil-film swirls spread on water around the target.',
        'Iridescent rainbow film over dark water.',
        'Soft light for thin-film iridescence.',
        'Thin oil film with swirling interference colors.',
        'Toxic, beautiful, eerie and slick.',
        'iridescent oil swirls; thin-film color',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a yellow rubber duck floating on black harbor water surrounded by swirling iridescent oil film, rainbow bands of magenta, gold and teal curling around it. No text or logo.',
        'Photograph of a small wooden rowboat moored in a still dock basin, rainbow oil film swirling across the black water around its hull, reflections of cranes above. No text or logo.',
        'Photograph of a white swan swimming through swirls of iridescent oil film on a dark canal, the rainbow bands parting around its breast and rippling in its wake. No text or logo.',
      ],
    },
    'SP09-058': {
      dna: fx(
        'Sparks: hot sparks spraying from the target in bright streaks.',
        'bright sparks spray from a point on the target in streaks.',
        'Orange-gold streaks with white-hot centers.',
        'Sparks lighting the target in warm flashes.',
        'Streaking sparks and glowing particles.',
        'Industrial, energetic, fiery and alive.',
        'spark spray streaks; white-hot centers',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of sparks spraying from a sword being sharpened on a wheel in a dark smithy. No text or logo.',
        'Photograph of a worker in a shipyard cutting a giant anchor chain with an angle grinder, bright orange sparks spraying in long streaks across the dark hull. No text or logo.',
        "Photograph of a flint striking steel in a dark cave, a burst of hot sparks falling onto dry tinder, streaks of light reflected in a traveler's eyes. No text or logo.",
      ],
    },
    'SP09-059': {
      dna: fx(
        'Soap bubbles: iridescent bubbles floating around or clinging to the target.',
        'iridescent soap bubbles float around and cling to the target.',
        'Thin-film rainbow iridescence.',
        'Soft backlight on bubble surfaces.',
        'Thin bubbles with swirling colors and reflections.',
        'Playful, light, dreamy and delicate.',
        'iridescent soap bubbles; thin-film swirls',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an elderly barber shaving a customer in an old barber shop surrounded by drifting iridescent soap bubbles, rainbow films catching the window light. No text or logo.',
        'Photograph of a stone whale fountain in a town square exhaling a stream of iridescent soap bubbles instead of water, children chasing them in the sun. No text or logo.',
        'Photograph of an old bicycle bell and handlebar with iridescent soap bubbles clinging to the chrome, a few floating free in the warm evening light. No text or logo.',
      ],
    },
    'SP09-061': {
      dna: fx(
        "Dry ice fog: low, heavy white fog pouring and spilling over the target's edges.",
        'heavy dry-ice fog pours from and over the target, hugging surfaces.',
        'Dense white fog with cool tint.',
        'Low side light on rolling fog.',
        'Heavy rolling fog tendrils.',
        'Theatrical, eerie, cold and magical.',
        'pouring dry-ice fog; rolling tendrils',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an iron cauldron on a stone floor spilling heavy white dry-ice fog over its rim, the fog pouring down and spreading in low waves across the flagstones. No text or logo.',
        'Photograph of a wooden coffin in a crypt with dense dry-ice fog pouring from under its lid and flowing down the steps of the dais, candles glowing through. No text or logo.',
        "Photograph of a wedding dance floor with heavy dry-ice fog flowing around the couple's ankles, the low white fog spilling off the edge of the stage. No text or logo.",
      ],
    },
    'SP09-062': {
      dna: fx(
        'Confetti: colorful paper confetti bursting or falling around the target.',
        'a burst of confetti around the target, some pieces landing on it.',
        'Multicolor confetti.',
        'Bright festive light.',
        'Paper confetti pieces with motion blur.',
        'Festive, joyful, chaotic and celebratory.',
        'confetti burst; colorful paper pieces',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a stern tax clerk sitting perfectly still at a cluttered desk as a burst of colorful paper confetti falls around him, some landing on his spectacles. No text or logo.',
        'Photograph of a skeleton in a paper party hat sitting at a banquet table in a colorful confetti shower, streamers hanging from its ribs and candles glowing. No text or logo.',
        'Photograph of a pirate ship cannon firing a huge burst of colorful confetti across the deck, the crew ducking and paper swirling in the sea wind. No text or logo.',
      ],
    },
    'SP09-067': {
      dna: fx(
        'Powder snow: fine snow dusting the target and drifting around it.',
        'fine powder snow dusts the target and drifts in the air around it.',
        'White snow with cool blue shadows.',
        'Soft cold light.',
        'Fine powder snow and flakes.',
        'Quiet, cold, soft and serene.',
        'powder snow dusting; drifting flakes',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a red fox standing in a birch forest dusted in fine powder snow, flakes caught in its fur and whiskers, snow drifting from the branches above. No text or logo.',
        'Photograph of a wooden beehive in a winter orchard dusted with fine powder snow, snow drifting against its base and on the roof, a single bee at the entrance. No text or logo.',
        'Photograph of an upright piano left in a courtyard with fine powder snow drifting across its lid and keys, footprints leading up to the bench. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Ember Drift',
      domain: 'drifting ember particles',
      tags: ['embers', 'particles', 'elemental'],
      dna: fx(
        'Ember drift: glowing embers rising and drifting slowly from the target.',
        'glowing embers rise from the target and drift upward.',
        'Orange and gold embers against dark.',
        'Embers casting tiny warm lights.',
        'Glowing ember particles with trails.',
        'Melancholic, warm, fading and magical.',
        'rising embers; warm trails',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a blank parchment scroll unrolling on a desk in a dark study, glowing embers rising from its edges and drifting slowly toward the ceiling beams. No text or logo.',
        'Photograph of a half-burnt letter resting in a fireplace grate, glowing embers lifting from its curled edges and drifting up the chimney in the dark. No text or logo.',
        'Photograph of a long red feather held in an open palm, shedding glowing embers that drift slowly upward into the night air of a garden. No text or logo.',
      ],
    },
    {
      name: 'Ink Cloud in Water',
      domain: 'ink diffusion in water',
      tags: ['ink', 'diffusion', 'elemental'],
      dna: fx(
        'Ink in water: dark ink blooming into billowing clouds from the target underwater.',
        'ink blooms from the target into billowing clouds in clear water.',
        'Black, indigo or crimson ink clouds.',
        'Backlit clear water.',
        'Billowing ink plumes and filaments.',
        'Mysterious, slow, elegant and dark.',
        'billowing ink plumes; clear water',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a rusted anchor sinking in clear water, releasing billowing clouds of black ink that bloom behind it, light filtering down from the surface. No text or logo.',
        'Photograph of a split pomegranate sinking through clear water, trailing clouds of crimson ink that curl and billow behind it against a pale background. No text or logo.',
        'Photograph of a feather quill submerged in water releasing indigo ink clouds that billow upward in slow tendrils, a white backdrop and fine bubbles. No text or logo.',
      ],
    },
    {
      name: 'Aurora Ribbons',
      domain: 'aurora light ribbons',
      tags: ['aurora', 'ribbons', 'elemental'],
      dna: fx(
        'Aurora ribbons: shimmering green and violet light ribbons wrapping the target.',
        'ribbons of aurora light wrap loosely around the target.',
        'Green, teal and violet glow.',
        'Soft self-illuminating glow.',
        'Translucent curtain-like light ribbons.',
        'Magical, serene, cold and wondrous.',
        'aurora light ribbons; translucent glow',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a grey wolf sleeping in deep snow under a spruce, wrapped in shimmering green aurora ribbons that curl around its body and rise into the night sky. No text or logo.',
        'Photograph of a child asleep in a tent pitched on the tundra, shimmering violet and green aurora ribbons wrapping the canvas and spilling out of the open flap. No text or logo.',
        'Photograph of an iron lantern on a frozen jetty emitting shimmering green aurora ribbons that coil upward into the dark sky over the ice. No text or logo.',
      ],
    },
    {
      name: 'Ice Shard Burst',
      domain: 'ice shard explosion',
      tags: ['ice', 'shards', 'elemental'],
      dna: fx(
        'Ice shard burst: sharp ice crystals exploding outward from a point on the target.',
        'ice shards burst from a point on the target, frozen mid-flight.',
        'Clear and blue ice with white frost.',
        'Cold backlight on shards.',
        'Sharp ice crystals and frost dust.',
        'Violent, cold, crystalline and sharp.',
        'ice shard burst; frost dust',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a crystal wine glass exploding into sharp ice shards on a dark table, crystals bursting outward from the rim, frost spreading across the tablecloth. No text or logo.',
        'Photograph of a town fountain freezing in a sudden burst, jagged ice crystals exploding outward from the spout and frost racing over the basin. No text or logo.',
        'Photograph of a boot stamping on a stone floor as sharp ice shards burst outward in a ring from the impact, frost crawling between the flagstones. No text or logo.',
      ],
    },
    {
      name: 'Pollen and Spores',
      domain: 'glowing pollen and spores',
      tags: ['pollen', 'spores', 'elemental'],
      dna: fx(
        'Pollen and spores: clouds of fine glowing pollen or spores puffing from the target.',
        'puffs of fine pollen or spores drift from the target.',
        'Golden pollen or pale green spores.',
        'Backlight making particles glow.',
        'Fine drifting particle clouds.',
        'Organic, dreamy, alive and strange.',
        'glowing pollen clouds; drifting spores',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an old mossy tree stump in a dark forest puffing clouds of glowing green spores into the night, fine particles drifting through a beam of moonlight. No text or logo.',
        'Photograph of a flower-shaped glass lantern hanging in a greenhouse puffing golden pollen from its petals, the fine glowing dust drifting through warm air. No text or logo.',
        'Photograph of a young deer shaking its head in a misty meadow at dawn, glowing spores puffing from its antlers and drifting in the low sunlight. No text or logo.',
      ],
    },
    {
      name: 'Shadow Tendrils',
      domain: 'shadow tendrils',
      tags: ['shadow', 'tendrils', 'elemental'],
      dna: fx(
        'Shadow tendrils: black smoky tendrils reaching out from the target.',
        'dark tendrils reach from the target like living smoke.',
        'Deep black with violet edges.',
        'Contrast light making tendrils read.',
        'Smoky tendrils with soft edges.',
        'Ominous, dark, supernatural and creeping.',
        'black shadow tendrils; violet edges',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an open book on a table in a sunny library releasing black smoky shadow tendrils that reach across the floorboards toward the shelves. No text or logo.',
        "Photograph of a teddy bear under a child's bed with black smoky shadow tendrils reaching out from beneath the blanket into the moonlit room. No text or logo.",
        'Photograph of an antique mirror in a hallway with black shadow tendrils creeping out of the glass and curling over the gilded frame onto the wallpaper. No text or logo.',
      ],
    },
    {
      name: 'Sandstorm Veil',
      domain: 'swirling sand veil',
      tags: ['sand', 'swirl', 'elemental'],
      dna: fx(
        'Sandstorm veil: a tight swirl of sand spiraling around the target.',
        'a tight spiral of blowing sand wraps around the target.',
        'Ochre and tan sand.',
        'Warm light filtering through sand.',
        'Blowing sand grains in spiral motion.',
        'Harsh, mysterious, arid and wild.',
        'spiraling sand veil; blowing grains',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a sandstone statue of a seated scribe wrapped in a tight spiral of blowing sand, grains streaming around its shoulders under a hazy orange sun. No text or logo.',
        "Photograph of a nomad's brass lamp standing on a dune inside a tight swirl of sand, the flame steady at the calm center while grains race around it. No text or logo.",
        'Photograph of a bleached camel skull on cracked ground with a tight spiral of sand whirling around it, grains glowing in low desert light. No text or logo.',
      ],
    },
    {
      name: 'Petal Storm',
      domain: 'swirling flower petals',
      tags: ['petals', 'swirl', 'elemental'],
      dna: fx(
        'Petal storm: a swirl of flower petals spiraling around the target.',
        'petals swirl in a spiral around the target, some resting on it.',
        'Pink, white or crimson petals.',
        'Soft backlight on petals.',
        'Floating petals with motion.',
        'Romantic, graceful, fleeting and poetic.',
        'swirling petals; spiral motion',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a lacquered samurai helmet on a wooden stand surrounded by a spiraling swirl of pink cherry petals, blossoms caught against the dark lacquer. No text or logo.',
        'Photograph of a fencer lunging with a foil through a spiral of crimson rose petals in a white hall, petals splitting around the blade. No text or logo.',
        'Photograph of a white horse standing in a meadow at the center of a petal storm, pale blossoms spiraling around it in the wind. No text or logo.',
      ],
    },
  ] satisfies Create[],
};

export default spec;
