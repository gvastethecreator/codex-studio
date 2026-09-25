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
        'Surreal painting of a lighthouse drooping like soft wax over a sea cliff, its lamp still burning, beneath a precise dream sky of pale green fading to violet with one long shadow on the rocks. No text or logo.',
        'Surreal painting of a grandfather clock melting over the branch of a dead olive tree in a flat ochre desert, the pendulum dripping, under an eerie cloudless sky. No text or logo.',
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
        'Liminal photograph of a covered village market square completely empty at dawn under flat overcast light, stalls shuttered, puddles and one abandoned shopping cart. No text or logo.',
        'Liminal photograph of a hotel corridor at 3 a.m. with one flickering ceiling light, patterned carpet stretching into darkness and every door slightly ajar. No text or logo.',
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
        "Psychedelic painting of a bearded sage's face dissolving into swirling magenta and acid-green patterns, his beard flowing into melting paisley and vibrating concentric rings. No text or logo.",
        'Psychedelic painting of a tiger whose stripes melt into vibrating orange and violet waves, its eyes radiating concentric color rings. No text or logo.',
        'Psychedelic painting of a mushroom forest where the caps drip into swirling saturated patterns, a small cottage glowing among them. No text or logo.',
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
        'Dreamcore image of a carousel horse standing alone in a pastel meadow at dusk, soft haze, a floating balloon and faint childhood eeriness. No text or logo.',
        "Dreamcore image of a child's bedroom with clouds drifting through the window into the room, pastel walls and a nightlight glowing in daylight. No text or logo.",
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
        'Magical realist painting of a village blacksmith at work whose sparks calmly turn into orange butterflies drifting out of the forge door. No text or logo.',
        'Magical realist painting of an old man sitting on a well in a quiet courtyard, drawing up a bucket full of stars while his neighbors hang laundry. No text or logo.',
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
        "Double exposure of a firefighter's silhouette filled with a burning forest, flames rising through her helmet and shoulders against a pale sky. No text or logo.",
        "Double exposure of a wolf's head filled with a snowy pine forest and a rising moon, the edges of the silhouette fading into white. No text or logo.",
        "Double exposure of a woman's profile filled with a stormy sea and a lighthouse, waves crashing where her hair would be. No text or logo.",
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
        'Impossible-perspective drawing of monks climbing endless staircases in a monastery where every wall is also a floor, stairs looping back on themselves. No text or logo.',
        'Impossible-perspective drawing of a water mill where the stream flows downhill in a loop and returns to its own source, the wheel turning forever. No text or logo.',
        'Impossible-perspective drawing of a library whose shelves connect in a Penrose-like loop, readers walking upside down on the balconies above. No text or logo.',
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
        'Vaporwave image of a marble bust of a Roman athlete on a pink grid floor with palm trees and a gradient sunset, pastel teal and pink haze and a floating dolphin. No text or logo.',
        'Vaporwave image of an empty swimming pool at night with pastel neon, classical columns and a striped sunset reflected in the tiles. No text or logo.',
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
        'Biomechanical surreal image of a throne fused with ribbed vertebrae and glossy black tubes, organic anatomy merging with machinery in dark monochrome. No text or logo.',
        'Biomechanical surreal image of a grand piano whose keys become ribs and whose legs are glossy ribbed tubes, dark silver monochrome. No text or logo.',
        "Biomechanical surreal image of a woman's profile fused with ribbed metal cables and vertebrae along her neck, glossy dark monochrome. No text or logo.",
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
        'Collage surrealist image of a gentleman in a bowler hat whose head is a cut-out vintage hot-air balloon, pasted onto an old seaside postcard. No text or logo.',
        'Collage surrealist image of an elephant with butterfly wings cut from a Victorian engraving, flying over a pasted city photo. No text or logo.',
        'Collage surrealist image of a lighthouse growing from a teacup on a vintage tablecloth, cut edges and mismatched print textures. No text or logo.',
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
        'Metaphysical painting of a classical statue in an empty arcaded square with long raking shadows, a distant train and a green sky, enigmatic stillness. No text or logo.',
        'Metaphysical painting of a lone horse standing in an empty arcaded piazza at late afternoon, stretched shadows and a red tower. No text or logo.',
        'Metaphysical painting of a tower and a small steam train on the horizon behind an empty arcade, long shadows. No text or logo.',
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
        'Pop surrealist painting of a big-eyed girl riding a candy-colored skull horse through a lollipop forest, glossy cute-grotesque with dark undertones. No text or logo.',
        'Pop surrealist painting of a pastel octopus wearing a tiara, glossy candy colors and one tear on its big eye. No text or logo.',
        'Pop surrealist painting of a big-headed witch girl holding a bleeding cupcake, candy pink and mint with a dark background. No text or logo.',
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
        'Dark fantasy painting of a lone warrior facing a colossal skeletal beast in a ruined cathedral, fading light through broken windows. No text or logo.',
        'Dark fantasy painting of a witch queen on a thorn throne in a drowned hall, pale light on black water. No text or logo.',
        'Dark fantasy painting of a city of bells built into a cliff, fog and fading sunset, bells ringing without ringers. No text or logo.',
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
        'Solarpunk image of a hillside town covered in terraced gardens and solar sails, villagers harvesting fruit on rooftops. No text or logo.',
        'Solarpunk image of a bicycle repair cooperative under a solar canopy, vines on the frames and children learning. No text or logo.',
        'Solarpunk image of a floating greenhouse market on a wide river, glass domes and solar panels on barges, traders passing baskets of vegetables between boats at golden hour. No text or logo.',
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
        'Weirdcore low-fi photo of a mascot costume standing in a suburban kitchen, oddly framed and harshly flash-lit. No text or logo.',
        'Weirdcore low-fi photo of a beige hallway with far too many identical doors, a single red balloon floating at eye level and the flash reflecting off the glossy floor. No text or logo.',
        'Weirdcore low-fi photo of a suburban lawn where eyes grow like flowers on thin stems, oddly cropped at a tilt, overexposed sky and a garden hose coiled nearby. No text or logo.',
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
        'Surreal photograph of a colossal snail carrying a whole village on its shell across a wheat field, farmers tiny beside it. No text or logo.',
        'Surreal photograph of a tiny man with an umbrella standing under a giant dewdrop on a leaf. No text or logo.',
        'Surreal photograph of a giant porcelain teacup lying on its side in a bay, forming a harbor with small fishing boats moored inside its rim and gulls on the handle. No text or logo.',
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
        'Symbolist painting of a pale queen with a sleeping panther under a violet twilight sky, jewel tones and hazy mystery. No text or logo.',
        'Symbolist painting of an angel standing in a misty swamp holding a lily, hazy emerald and gold. No text or logo.',
        'Symbolist painting of a sphinx and a young poet meeting at dusk, jewel tones and soft haze. No text or logo.',
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
        'Surreal photograph of a fisherman at a still lake whose reflection is a skeleton wearing his hat, calm evening light. No text or logo.',
        'Mirror world photograph of an old woman whose bathroom mirror shows her young, both touching the glass. No text or logo.',
        'Mirror world photograph of a rainy city street where a puddle reflects a dense green jungle with parrots instead of the buildings above it, commuters stepping around. No text or logo.',
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
        "Fever-dream painting of a banquet where the roast pig stares back, candles sweat wax and the guests' faces swell in the heat. No text or logo.",
        'Fever-dream painting of a nurse in a hallway that stretches and bends, swollen doorframes and sweating walls. No text or logo.',
        'Fever-dream painting of a carnival at night where the rides warp and melt in the heat, swollen balloons. No text or logo.',
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
        'Surreal photograph of a monk floating cross-legged above a monastery courtyard, books floating calmly around him in morning light. No text or logo.',
        'Surreal photograph of a family picnic where the blanket, plates and dog float calmly a meter above the grass. No text or logo.',
        'Surreal photograph of stones of a ruined abbey floating calmly apart in the air, sheep grazing beneath. No text or logo.',
      ],
    },
  ] satisfies Create[],
};

export default spec;
