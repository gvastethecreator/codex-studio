import type { Create, Dna, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';

// Surrealism & Dream: each preset declares one mechanism — a structural distortion, a mood, or a
// world theme — and does not force stock liminal props (empty pools, hallways, clocks) by default.
const AVOID = [
  ...STYLE_AVOID,
  'stock liminal props unless requested',
  'copying a famous surrealist painting',
];

const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
const pad = (t: string, min: number, tail: string) =>
  words(t) < min ? `${t.replace(/\.$/, '')}, ${tail}` : t;

function dream(
  kind: 'distortion' | 'mood' | 'theme',
  aesthetic: string,
  mechanism: string,
  color: string,
  light: string,
  texture: string,
  mood: string,
  key: string,
): Dna {
  const lead = {
    distortion:
      "Keep the prompt's subject and setting, but apply this structural distortion to them",
    mood: "Keep the prompt's subject, setting and composition, and shift only the mood, palette and atmosphere",
    theme:
      "Translate the prompt's subject into this dream-world theme while keeping it recognizable",
  }[kind];
  return {
    aesthetic,
    subject_treatment: `${lead}: ${mechanism}`,
    color_and_tone: pad(color, 9, 'applied consistently so the dream logic reads as one world.'),
    lighting_and_shadow: pad(light, 9, 'supporting the dream logic without adding stock props.'),
    texture_and_material: pad(
      texture,
      9,
      'rendered with enough realism that the impossible feels believable.',
    ),
    camera_and_composition:
      'Keep the prompt framing; place the distortion or dream element where it reads instantly at card size.',
    atmosphere_and_mood: pad(mood, 8, 'arising from the mechanism rather than added scenery.'),
    rendering_and_quality:
      'Painterly or photoreal finish chosen by the prompt, with clean edges and no muddy haze.',
    key_features: key,
  };
}

const spec: Spec = {
  pack: 'pack_10',
  category: '4. Surrealism & Dream',
  updates: {
    'SP10-031': {
      name: 'Melting Dream Surrealism',
      dna: dream(
        'distortion',
        'Melting dream surrealism: hard objects softening and drooping over edges under an eerie, precise dream sky.',
        'one or two rigid elements soften and droop over edges while everything else stays hyper-precise.',
        'Clear desert blues, ochre and long shadows.',
        'Low crisp sun with long hard shadows.',
        'Glossy precise painting with melting forms.',
        'Uncanny, still, dreamlike and precise.',
        'melting rigid forms; precise rendering; long shadows',
      ),
      avoid: AVOID,
      briefs: [
        "Surreal painting of a knight's helmet and sword melting over the edge of a stone altar in a vast ochre desert, long crisp shadows. No text or logo.",
        'Surreal painting of a castle tower drooping like wax over a cliff. No text or logo.',
        "Surreal painting of a crown melting on a sleeping lion's head. No text or logo.",
      ],
    },
    'SP10-032': {
      dna: dream(
        'mood',
        'Liminal space mood: the feeling of transitional, empty, slightly wrong places at odd hours.',
        'the scene feels emptied, quiet and slightly off, with flat institutional light and nobody around.',
        'Pale yellow, beige and fluorescent green-white.',
        'Flat fluorescent or overcast light.',
        'Plain surfaces and faint wear.',
        'Unsettling, empty, nostalgic and quiet.',
        'emptied transitional feeling; flat light; off-hours quiet',
      ),
      avoid: AVOID,
      briefs: [
        'Liminal photograph of an empty castle throne room at 3am lit by flat fluorescent tubes, nobody there. No text or logo.',
        'Liminal photograph of a medieval market square completely empty under overcast light. No text or logo.',
        'Liminal photograph of a monastery corridor with one flickering light. No text or logo.',
      ],
    },
    'SP10-033': {
      dna: dream(
        'mood',
        'Psychedelic art: saturated swirling color, vibrating patterns and melting contours.',
        'color saturates and contours ripple with swirling patterns while forms stay recognizable.',
        'Vibrant rainbow, magenta, acid green and orange.',
        'Glowing, self-luminous color.',
        'Swirling patterns and vibrating outlines.',
        'Euphoric, intense, trippy and alive.',
        'swirling saturated color; vibrating contours',
      ),
      avoid: AVOID,
      briefs: [
        "Psychedelic painting of a wizard's face dissolving into swirling magenta and acid-green patterns. No text or logo.",
        'Psychedelic painting of a dragon. No text or logo.',
        'Psychedelic painting of a mushroom forest castle. No text or logo.',
      ],
    },
    'SP10-034': {
      dna: dream(
        'mood',
        'Dreamcore mood: soft, pastel, nostalgic unreality with a faint childhood eeriness.',
        'the scene becomes soft-focus, pastel and hazy with a nostalgic unreal feeling.',
        'Pastel sky blue, pink and cream.',
        'Soft bloom and haze.',
        'Soft focus and faint grain.',
        'Nostalgic, comforting, eerie and unreal.',
        'pastel soft focus; nostalgic haze; faint eeriness',
      ),
      avoid: AVOID,
      briefs: [
        'Dreamcore image of a small castle on a pastel cloud field under soft bloom, eerily still. No text or logo.',
        'Dreamcore image of a carousel horse in a meadow. No text or logo.',
        "Dreamcore image of a knight's bedroom. No text or logo.",
      ],
    },
    'SP10-035': {
      dna: dream(
        'distortion',
        'Magical realism: an ordinary scene rendered realistically where one impossible thing happens calmly.',
        'the scene stays realistic and everyday, but one impossible element is accepted as normal.',
        'Warm natural palette.',
        'Natural daylight.',
        'Realistic textures.',
        'Calm, poetic, quietly astonishing and tender.',
        'realistic everyday scene; one calm impossibility',
      ),
      avoid: AVOID,
      briefs: [
        'Magical realist painting of an old woman hanging laundry while one sheet floats away carrying a sleeping swan. No text or logo.',
        'Magical realist painting of a blacksmith whose sparks become butterflies. No text or logo.',
        'Magical realist painting of a knight fishing stars from a well. No text or logo.',
      ],
    },
    'SP10-036': {
      dna: dream(
        'distortion',
        'Surreal double exposure: two images fused inside one silhouette.',
        "a second image fills the subject's silhouette.",
        'Muted base with secondary image tones.',
        'Soft even light.',
        'Blended photographic layers.',
        'Reflective, symbolic, dreamy and poetic.',
        'second image inside silhouette; blended layers',
      ),
      avoid: AVOID,
      briefs: [
        "Double exposure of a knight's silhouette filled with a burning forest. No text or logo.",
        'Double exposure of a wolf filled with a snowy castle. No text or logo.',
        'Double exposure of a crowned head filled with stormy sea. No text or logo.',
      ],
    },
    'SP10-037': {
      name: 'Impossible Perspective',
      dna: dream(
        'distortion',
        'Impossible perspective: architecture and objects that connect in geometrically impossible loops and staircases.',
        "the setting's structure loops impossibly — stairs rising into themselves, walls that are floors.",
        'Neutral stone greys and creams.',
        'Even, precise light.',
        'Precise line and stone.',
        'Puzzling, precise, infinite and uncanny.',
        'impossible loops; stairs into themselves; walls as floors',
      ),
      avoid: AVOID,
      briefs: [
        'Impossible-perspective drawing of monks climbing endless staircases in a castle where every wall is also a floor. No text or logo.',
        'Impossible-perspective waterfall mill. No text or logo.',
        'Impossible-perspective library. No text or logo.',
      ],
    },
    'SP10-038': {
      dna: dream(
        'theme',
        'Vaporwave theme: pastel 80s-90s digital nostalgia with classical busts, grids and sunsets.',
        'the subject is placed in a pastel digital-nostalgia world with grids, gradients and classical motifs.',
        'Pink, teal, lavender and sunset gradients.',
        'Neon glow.',
        'Glossy digital surfaces.',
        'Nostalgic, ironic, dreamy and hazy.',
        'pastel gradient; grid floor; classical motifs; neon',
      ),
      avoid: AVOID,
      briefs: [
        "Vaporwave image of a knight's marble bust on a pink grid floor under a teal sunset. No text or logo.",
        'Vaporwave dragon. No text or logo.',
        'Vaporwave castle. No text or logo.',
      ],
    },
    'SP10-039': {
      name: 'Biomechanical Surrealism',
      dna: dream(
        'theme',
        'Biomechanical surrealism: organic anatomy fused with ribbed machinery in dark monochrome.',
        "the subject's forms fuse with ribbed tubes, vertebrae and mechanical plating.",
        'Dark grey, bone and metallic sheen.',
        'Low, glossy rim light.',
        'Glossy ribbed biomech surfaces.',
        'Dark, unsettling, cold and alien.',
        'fused anatomy and machinery; ribbed tubes; monochrome',
      ),
      avoid: [...AVOID, 'sexual imagery'],
      briefs: [
        'Biomechanical surreal image of a throne fused with ribbed vertebrae and glossy tubes. No text or logo.',
        'Biomechanical dragon skull. No text or logo.',
        'Biomechanical knight. No text or logo.',
      ],
    },
    'SP10-040': {
      dna: dream(
        'distortion',
        'Collage surrealism: cut-and-paste vintage imagery combined into impossible scenes.',
        'parts of the subject are replaced by cut-out vintage image fragments with visible edges.',
        'Aged print colors.',
        'Mixed light from sources.',
        'Paper cut edges and print grain.',
        'Witty, strange, nostalgic and absurd.',
        'cut vintage fragments; visible paper edges',
      ),
      avoid: AVOID,
      briefs: [
        'Collage surrealist image of a knight whose head is a cut-out vintage hot-air balloon. No text or logo.',
        'Collage surreal dragon. No text or logo.',
        'Collage surreal castle. No text or logo.',
      ],
    },
    'SP10-041': {
      dna: dream(
        'mood',
        'Metaphysical art mood: empty arcades, long shadows and enigmatic stillness.',
        'the scene is emptied and stilled with long raking shadows and enigmatic silence.',
        'Ochre, deep green sky and terracotta.',
        'Late sun with long shadows.',
        'Smooth painted surfaces.',
        'Enigmatic, melancholic, still and silent.',
        'long shadows; enigmatic stillness; arcades',
      ),
      avoid: AVOID,
      briefs: [
        "Metaphysical painting of a knight's statue in an empty arcaded square with long shadows. No text or logo.",
        'Metaphysical painting of a lone horse. No text or logo.',
        'Metaphysical painting of a tower and train. No text or logo.',
      ],
    },
    'SP10-042': {
      dna: dream(
        'theme',
        'Pop surrealism: glossy cute-grotesque characters in candy colors with dark undertones.',
        'the subject becomes a glossy big-eyed cute-grotesque character in candy colors.',
        'Candy pastels with dark accents.',
        'Soft glossy light.',
        'Smooth glossy paint.',
        'Cute, creepy, playful and dark.',
        'big-eyed cute-grotesque; candy gloss',
      ),
      avoid: AVOID,
      briefs: [
        'Pop surrealist painting of a big-eyed girl knight riding a candy-colored skull horse. No text or logo.',
        'Pop surrealist dragon. No text or logo.',
        'Pop surrealist witch. No text or logo.',
      ],
    },
    'SP10-043': {
      dna: dream(
        'theme',
        'Dark fantasy dream theme: gothic, grim, mythic worlds of ruins, monsters and fading light.',
        'the subject is placed in a grim gothic dream-world of ruins, mist and ominous scale.',
        'Desaturated greys, blood red and gold accents.',
        'Low dramatic light and fog.',
        'Painterly rich textures.',
        'Grim, epic, ominous and mythic.',
        'gothic ruins; mist; ominous scale',
      ),
      avoid: AVOID,
      briefs: [
        'Dark fantasy painting of a lone knight facing a colossal skeletal dragon in a ruined cathedral. No text or logo.',
        'Dark fantasy witch queen. No text or logo.',
        'Dark fantasy city of bells. No text or logo.',
      ],
    },
    'SP10-044': {
      dna: dream(
        'theme',
        'Solarpunk theme: hopeful green futures with gardens, solar tech and community.',
        'the subject is placed in a lush sustainable green-tech world.',
        'Fresh greens, sunny gold and white.',
        'Bright warm daylight.',
        'Plants, wood and glass.',
        'Hopeful, bright, communal and green.',
        'green tech; gardens; hopeful future',
      ),
      avoid: AVOID,
      briefs: [
        'Solarpunk image of a castle covered in gardens and solar sails with villagers harvesting. No text or logo.',
        'Solarpunk knight. No text or logo.',
        'Solarpunk dragon roost. No text or logo.',
      ],
    },
    'SP10-045': {
      dna: dream(
        'mood',
        'Weirdcore mood: off-putting low-fi uncanniness with odd framing and wrong details.',
        'the image becomes low-fi, oddly framed and subtly wrong without adding text.',
        'Oversaturated or washed low-fi colors.',
        'Harsh flash or flat light.',
        'Low-resolution grain.',
        'Disturbing, nostalgic, wrong and strange.',
        'low-fi wrongness; odd framing',
      ),
      avoid: AVOID,
      briefs: [
        'Weirdcore low-fi photo of a knight standing in a suburban kitchen, oddly framed, flash-lit. No text or logo.',
        'Weirdcore dragon in a hallway. No text or logo.',
        'Weirdcore castle in a field of eyes. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Scale Inversion Surrealism',
      domain: 'scale inversion surrealism',
      tags: ['scale-inversion', 'surreal', 'dream'],
      dna: dream(
        'distortion',
        'Scale inversion: familiar objects or creatures at impossible scales relative to their surroundings.',
        'one element of the prompt becomes enormous or tiny relative to everything else.',
        'Natural palette.',
        'Natural light.',
        'Realistic textures.',
        'Awe-filled, absurd, quiet and strange.',
        'impossible scale; giant or tiny element',
      ),
      avoid: AVOID,
      briefs: [
        'Surreal photograph of a colossal snail carrying a castle across a wheat field, villagers tiny beside it. No text or logo.',
        'Surreal image of a tiny knight fighting a housecat. No text or logo.',
        'Surreal image of a giant teacup harbor. No text or logo.',
      ],
    },
    {
      name: 'Symbolist Dreamscape',
      domain: 'symbolist dream painting',
      tags: ['symbolism', 'dreamscape', 'dream'],
      dna: dream(
        'mood',
        'Symbolist dreamscape: hazy, jewel-toned allegorical painting of myth and mystery.',
        'the scene becomes a hazy allegory with jewel tones and mystic stillness.',
        'Deep blues, violet, gold.',
        'Soft glowing haze.',
        'Painterly glazes.',
        'Mystical, melancholic, allegorical and lush.',
        'hazy jewel-tone allegory',
      ),
      avoid: AVOID,
      briefs: [
        'Symbolist painting of a pale queen with a sleeping panther under a violet twilight sky. No text or logo.',
        'Symbolist painting of an angel in a swamp. No text or logo.',
        'Symbolist painting of a sphinx and knight. No text or logo.',
      ],
    },
    {
      name: 'Mirror World Surrealism',
      domain: 'mirror world reflections',
      tags: ['mirror', 'reflection', 'dream'],
      dna: dream(
        'distortion',
        'Mirror world: reflections that show a different reality than the scene.',
        'a reflective surface in the scene shows a different version of the subject or world.',
        'Natural palette with contrasting reflection palette.',
        'Natural light.',
        'Realistic reflections.',
        'Uncanny, poetic, mysterious and split.',
        'reflection shows another reality',
      ),
      avoid: AVOID,
      briefs: [
        'Surreal photograph of a knight at a lake whose reflection is a skeleton king. No text or logo.',
        'Mirror world image of an old woman whose mirror shows her young. No text or logo.',
        'Mirror world castle puddle. No text or logo.',
      ],
    },
    {
      name: 'Fever Dream Grotesque',
      domain: 'grotesque fever dream',
      tags: ['fever-dream', 'grotesque', 'dream'],
      dna: dream(
        'mood',
        'Fever dream grotesque: sweaty, warped, overheated dream imagery with swollen forms.',
        'forms swell and warp slightly, colors overheat, and the air feels feverish.',
        'Sickly yellows, reds and greens.',
        'Hot hazy light.',
        'Sweaty glossy surfaces.',
        'Feverish, uncomfortable, intense and strange.',
        'swollen warped forms; overheated palette',
      ),
      avoid: AVOID,
      briefs: [
        'Fever-dream painting of a banquet where the roast pig stares back and candles sweat. No text or logo.',
        'Fever dream knight. No text or logo.',
        'Fever dream carnival. No text or logo.',
      ],
    },
    {
      name: 'Levitation Surrealism',
      domain: 'levitation surreal photography',
      tags: ['levitation', 'surreal', 'dream'],
      dna: dream(
        'distortion',
        'Levitation: people and objects floating calmly in mid-air as if gravity paused.',
        'the subject and some objects float in mid-air while the rest stays grounded.',
        'Natural palette.',
        'Natural light with cast shadows below.',
        'Realistic textures.',
        'Weightless, calm, magical and quiet.',
        'floating subjects; paused gravity',
      ),
      avoid: AVOID,
      briefs: [
        'Surreal photograph of a monk floating cross-legged above a monastery courtyard, books floating around. No text or logo.',
        'Levitating knight and horse. No text or logo.',
        'Levitating castle stones. No text or logo.',
      ],
    },
  ] satisfies Create[],
};

export default spec;
