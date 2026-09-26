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
      'Keep the prompt framing; place the effect where it interacts with the target so its shape and motion read at a glance.',
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
        "In a cobbled alley thick translucent lime ooze rises up through an iron sewer grate, stretching in long strands toward a curious rat. No readable text or logo.",
        "In a dark ballroom a crystal chandelier drips thick violet ooze from every arm, strands stretching down toward the dance floor. No readable text or logo.",
        "A gloved hand lifts the lid of an old sea chest and pulls glistening green strands from the coins inside. No readable text or logo.",
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
        "Held aloft in a dark hall, a sword blade splits with glowing molten cracks while flames lick along its edge. No readable text or logo.",
        "In a quarry rests a stone fist the size of a boulder, orange molten veins running through its cracks. No readable text or logo.",
        "On a volcanic slope a huge egg glows through fissures of molten light, pulsing in a nest of grey ash. No readable text or logo.",
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
        "In a dark forge an anvil crackles with branching blue arcs that crawl over the horn and jump to the blacksmith's hammer. No readable text or logo.",
        "On a dark concert stage bright arcs jump between the strings of a cello and crawl down its endpin. No readable text or logo.",
        "Perched on a wet iron fence, a raven lets fine blue sparks crawl across its feathers and leap to the railing tips. No readable text or logo.",
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
        "Crossing a sunlit monastery courtyard, a hooded figure trails soft curling grey plumes that coil around the pillars behind him. No readable text or logo.",
        "On a kitchen table a porcelain teapot pours a slow stream of white vapor instead of tea, curling over the cup's rim. No readable text or logo.",
        "Lying open on black velvet, an antique pocket watch is wrapped in slow grey ribbons rising from its gears. No readable text or logo.",
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
        "A heavy war hammer strikes a still pond and a frozen crown of water rises around its head, droplets hanging in the air. No readable text or logo.",
        "Dropped into a bowl of milk, a ripe strawberry throws up a perfect white crown frozen around it. No readable text or logo.",
        "A galloping hoof hits a muddy puddle on a country lane, a burst of brown water frozen mid-air in sunlight. No readable text or logo.",
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
        "In a dark temple a monk holds a small orb of gold energy between his palms, the light carving his face out of shadow. No readable text or logo.",
        "In a dark cave a wooden staff tip glows with a sphere of cyan filaments reaching toward the damp walls. No readable text or logo.",
        "On a kitchen shelf an old valve radio leaks magenta energy from its speaker grille, glowing filaments curling toward the kettle. No readable text or logo.",
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
        "A yellow rubber duck floats on black harbor water ringed by swirling iridescent film in bands of magenta and green. No readable text or logo.",
        "Moored in a still dock basin, a small rowboat sits in a slick of rainbow swirls reflecting its hull. No readable text or logo.",
        "A white swan glides through a dark city canal at dusk as swirling rainbow film parts around its breast and closes again behind its tail. No readable text or logo.",
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
        "In a dark smithy a sword pressed to a grinding wheel throws a fan of bright streaks across the floor. No readable text or logo.",
        "In a shipyard at night a worker cuts through a giant anchor chain as long orange streaks spray past his visor. No readable text or logo.",
        "In a dark cave flint strikes steel and a burst of hot streaks falls onto dry tinder, reflected in a pool. No readable text or logo.",
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
        "In an old barber shop an elderly barber shaves a customer surrounded by drifting iridescent bubbles. No readable text or logo.",
        "In a town square a stone whale fountain exhales iridescent bubbles instead of water while adults in business suits chase them. No readable text or logo.",
        "On an old bicycle, bubbles cling to the chrome bell and handlebar while a few float free in warm evening light. No readable text or logo.",
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
        "On a stone floor an iron cauldron spills heavy white vapor over its rim, pouring down and spreading in low waves. No readable text or logo.",
        "In a crypt dense white vapor pours from under a coffin lid and flows down the steps of the dais. No readable text or logo.",
        "At a wedding, heavy white vapor flows around the dancing couple's ankles and spills off the edge of the floor. No readable text or logo.",
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
        "A stern tax clerk sits perfectly still at a cluttered desk as a burst of colorful paper bits rains down on him. No readable text or logo.",
        "At a banquet table a skeleton in a paper party hat sits in a colorful shower, streamers hanging from its ribs. No readable text or logo.",
        "A pirate ship's cannon fires a huge burst of colorful paper across the deck as the crew ducks. No readable text or logo.",
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
        "A red fox stands in a birch forest dusted with fine powder, flakes caught in its whiskers as more drifts from the branches. No readable text or logo.",
        "In a winter orchard a wooden beehive is dusted in fine white powder, a single bee peering out of the entrance. No readable text or logo.",
        "Left in a courtyard, an upright piano gathers fine drifting powder across its lid, footprints leading up to the bench. No readable text or logo.",
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
        "In a dark study a blank parchment scroll unrolls on a desk as glowing embers rise from its edges toward the ceiling. No readable text or logo.",
        "In a fireplace grate a half-burnt letter lifts glowing embers from its curled edges up the chimney. No readable text or logo.",
        "Held in an open palm, a long red feather sheds glowing embers that drift upward into a night garden. No readable text or logo.",
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
        "Sinking in clear water, a rusted anchor releases billowing clouds of black ink that bloom behind it. No readable text or logo.",
        "A split pomegranate sinks slowly through clear water in a glass tank, trailing curling clouds of crimson that billow like smoke behind it. No readable text or logo.",
        "Submerged in a tall glass of water, a feather quill releases indigo clouds that billow upward in slow tendrils against a white backdrop. No readable text or logo.",
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
        "Sleeping in deep snow under a spruce, a grey wolf is wrapped in shimmering green light ribbons that curl around its body. No readable text or logo.",
        "On the tundra a lone traveler sleeps in a tent while violet and green light ribbons wrap the canvas and spill across the snow. No readable text or logo.",
        "On a frozen jetty an iron lantern emits shimmering green ribbons that coil upward into the dark sky. No readable text or logo.",
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
        "On a dark table a crystal wine glass explodes into sharp ice shards, frost spreading across the wood. No readable text or logo.",
        "In a sudden cold snap a town fountain freezes mid-spray, jagged ice crystals exploding outward from the spout as pigeons scatter. No readable text or logo.",
        "A boot stamps on a stone floor and sharp ice shards burst outward in a ring from the impact. No readable text or logo.",
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
        "In a dark forest an old mossy stump puffs clouds of glowing green spores into the night. No readable text or logo.",
        "In a greenhouse a flower-shaped glass lantern puffs golden dust from its petals into the humid air. No readable text or logo.",
        "In a misty meadow at dawn a young deer shakes its head and glowing spores puff from its antlers. No readable text or logo.",
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
        "In a sunny library an open book on a table releases black smoky tendrils that reach across the floorboards. No readable text or logo.",
        "Under a guest bed in a moonlit room, a teddy bear lies half hidden while black smoky tendrils reach out from beneath the blanket. No readable text or logo.",
        "In a hallway black tendrils creep out of an antique mirror and curl over the gilded frame onto the wallpaper. No readable text or logo.",
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
        "A seated scribe carved in stone is wrapped in a tight spiral of blowing sand streaming around its shoulders. No readable text or logo.",
        "On a dune a nomad's brass lamp burns steadily at the calm center of a tight swirl of sand. No readable text or logo.",
        "On cracked ground a bleached camel skull sits inside a tight spiral of sand glowing in low desert light. No readable text or logo.",
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
        "On a wooden stand a lacquered helmet is circled by a spiraling swirl of pink cherry blossoms. No readable text or logo.",
        "In a white hall a fencer lunges through a spiral of crimson rose petals that split around the blade. No readable text or logo.",
        "In a meadow a white horse stands at the center of a spiraling storm of pale blossoms. No readable text or logo.",
      ],
    },
  ] satisfies Create[],
};

export default spec;
