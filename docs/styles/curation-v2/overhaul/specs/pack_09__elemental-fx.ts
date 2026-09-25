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
        "Photograph of a knight's helmet dripping with thick lime slime strands onto a stone floor. No text or logo.",
        'Photograph of a crown oozing violet slime on a velvet cushion. No text or logo.',
        'Photograph of a hand pulling slime strands from a treasure chest. No text or logo.',
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
        'Photograph of a stone golem fist with glowing magma veins. No text or logo.',
        'Photograph of a magma-cracked egg in a nest of ash. No text or logo.',
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
        "Photograph of a knight's gauntlet crackling with blue lightning arcs between its fingers. No text or logo.",
        'Photograph of a violin with electric arcs jumping between its strings. No text or logo.',
        'Photograph of a raven with lightning crawling across its feathers. No text or logo.',
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
        "Photograph of a hooded figure's cloak trailing curling smoke in a sunlit courtyard. No text or logo.",
        'Photograph of a teapot pouring smoke instead of tea. No text or logo.',
        'Photograph of a crown wrapped in slow grey smoke. No text or logo.',
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
        'Photograph of a warhammer striking water, a frozen crown splash around it. No text or logo.',
        'Photograph of a crown dropped into a bowl, water splash frozen. No text or logo.',
        "Photograph of a horse's hoof hitting a puddle, splash frozen. No text or logo.",
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
        'Photograph of a staff tip glowing with cyan plasma filaments. No text or logo.',
        "Photograph of a knight's visor leaking magenta energy. No text or logo.",
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
        "Photograph of a floating knight's helmet surrounded by iridescent oil swirls on black water. No text or logo.",
        'Photograph of a rowboat in rainbow oil-film water. No text or logo.',
        'Photograph of a swan swimming through oil-film swirls. No text or logo.',
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
        "Photograph of sparks trailing from a dragon's claws on stone. No text or logo.",
        "Photograph of sparks fountaining from a knight's shield hit by a blade. No text or logo.",
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
        'Photograph of a knight in armor surrounded by drifting iridescent soap bubbles. No text or logo.',
        'Photograph of a dragon exhaling a stream of soap bubbles. No text or logo.',
        'Photograph of a crown with bubbles clinging to it. No text or logo.',
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
        'Photograph of a cauldron spilling heavy dry-ice fog over its rim. No text or logo.',
        'Photograph of a coffin with fog pouring from under its lid. No text or logo.',
        'Photograph of a throne with fog flowing down its steps. No text or logo.',
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
        'Photograph of a stern knight standing still as a confetti burst falls around him. No text or logo.',
        'Photograph of a skeleton wearing a party hat in a confetti shower. No text or logo.',
        'Photograph of a dragon sneezing confetti. No text or logo.',
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
        'Photograph of a knight on horseback dusted in fine powder snow. No text or logo.',
        'Photograph of a snow-dusted crown on a stone. No text or logo.',
        'Photograph of a piano with snow drifting on its lid. No text or logo.',
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
        'Photograph of a blank parchment scroll releasing drifting embers in a dark study. No text or logo.',
        "Photograph of a fallen knight's cloak smoldering with embers. No text or logo.",
        'Photograph of a phoenix feather shedding embers. No text or logo.',
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
        "Photograph of a submerged knight's gauntlet releasing black ink clouds. No text or logo.",
        'Photograph of a crown sinking and trailing crimson ink. No text or logo.',
        'Photograph of a quill releasing indigo ink clouds underwater. No text or logo.',
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
        'Photograph of a sleeping wolf wrapped in green aurora ribbons in snow. No text or logo.',
        "Photograph of a knight's sword wrapped in violet aurora light. No text or logo.",
        'Photograph of a lantern emitting aurora ribbons. No text or logo.',
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
        'Photograph of a shield exploding into ice shards on impact. No text or logo.',
        'Photograph of an ice burst from a staff tip. No text or logo.',
        'Photograph of a stone floor bursting with ice shards under a boot. No text or logo.',
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
        'Photograph of a mushroom-crowned knight releasing glowing spores in a dark forest. No text or logo.',
        'Photograph of a flower-shaped lantern puffing golden pollen. No text or logo.',
        'Photograph of a deer shaking spores from its antlers. No text or logo.',
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
        'Photograph of a book releasing shadow tendrils in a sunny library. No text or logo.',
        "Photograph of a knight's cloak dissolving into reaching shadow tendrils. No text or logo.",
        'Photograph of a mirror with shadow tendrils creeping out. No text or logo.',
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
        'Photograph of a sandstone statue wrapped in a tight spiral of blowing sand. No text or logo.',
        "Photograph of a nomad's lantern inside a sand swirl. No text or logo.",
        'Photograph of a camel skull with sand spiraling around it. No text or logo.',
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
        'Photograph of a samurai helmet surrounded by a swirl of pink petals. No text or logo.',
        'Photograph of a sword thrust through a spiral of crimson petals. No text or logo.',
        'Photograph of a white horse in a petal storm. No text or logo.',
      ],
    },
  ] satisfies Create[],
};

export default spec;
