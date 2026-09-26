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
      'Keep the prompt framing; place the distortion or dream element where it reads instantly at a glance.',
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
        "A helmet and sword melt over the edge of a stone altar in a vast ochre desert, casting long crisp shadows toward a horizon that is too close. No readable text or logo.",
        "A lighthouse droops like soft wax over a sea cliff, its lamp still burning beneath a pale green dream sky. No readable text or logo.",
        "A grandfather clock melts over the branch of a dead olive tree, its pendulum dripping onto the flat desert sand. No readable text or logo.",
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
        "An empty throne room at 3 a.m. is lit by flat buzzing fluorescent tubes, a single plastic chair set beside the throne. No readable text or logo.",
        "A covered village market sits completely empty at dawn under flat overcast light, stalls shuttered and one abandoned shopping cart. No readable text or logo.",
        "A hotel corridor at 3 a.m. stretches into darkness under one flickering light, every door slightly ajar. No readable text or logo.",
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
        "A bearded sage's face dissolves into swirling magenta and acid-green, his beard flowing into melting paisley. No readable text or logo.",
        "A tiger's stripes melt into vibrating orange and violet waves, its eyes radiating concentric rings of color. No readable text or logo.",
        "In a mushroom forest the caps drip into swirling saturated patterns around a small glowing cottage. No readable text or logo.",
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
        "A small castle sits on a field of pastel clouds under soft bloom, eerily still, one window lit in the middle of the day. No readable text or logo.",
        "A carousel horse stands alone in a pastel meadow at dusk, a single balloon floating beside it in the haze. No readable text or logo.",
        "Clouds drift through an open window into a pastel bedroom, and the nightlight glows even though it is daytime. No readable text or logo.",
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
        "In a sunny back garden an old woman hangs laundry while one white sheet calmly floats away over the rooftops carrying a sleeping swan. No readable text or logo.",
        "A village blacksmith keeps working while his sparks turn into orange butterflies and drift out of the forge door. No readable text or logo.",
        "An old man sits on a well in a quiet courtyard drawing up a bucket full of stars while his neighbors hang laundry. No readable text or logo.",
      ],
    },
    'SP10-036': {
      name: 'Surreal Silhouette Fusion',
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
        "A firefighter's silhouette is filled with a burning forest, flames rising through her helmet and shoulders against a pale sky. No readable text or logo.",
        "A wolf's head holds a snowy pine forest and a rising moon, its edges fading into white. No readable text or logo.",
        "A woman's profile contains a stormy sea and a lighthouse, waves crashing where her hair should be. No readable text or logo.",
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
        "Monks climb endless staircases in a monastery where every wall is also a floor, their paths looping back on themselves. No readable text or logo.",
        "A water mill's stream flows downhill in a loop and returns to its own source, the wheel turning forever. No readable text or logo.",
        "A library's shelves connect in an impossible loop, readers walking upside down on the balconies above. No readable text or logo.",
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
        "A marble bust of a knight stands on a pink grid floor beneath a teal sunset, a potted palm beside it. No readable text or logo.",
        "A Roman athlete's bust gazes over palm trees and a gradient sunset in pastel teal and pink haze. No readable text or logo.",
        "An empty swimming pool at night glows in pastel neon, classical columns reflecting a striped sunset in its tiles. No readable text or logo.",
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
        "A throne fuses with ribbed vertebrae and glossy black tubes, anatomy and machinery merging in dark monochrome. No readable text or logo.",
        "A piano's keys become ribs and its legs glossy ribbed tubes, all in dark silver monochrome. No readable text or logo.",
        "A woman's profile fuses with ribbed metal cables and vertebrae along her neck, glossy and dark. No readable text or logo.",
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
        "A gentleman in a bowler hat has a cut-out vintage hot-air balloon for a head, pasted onto an old seaside postcard. No readable text or logo.",
        "An elephant with butterfly wings cut from a Victorian engraving flies over a pasted city photo. No readable text or logo.",
        "A lighthouse grows out of a teacup on a vintage tablecloth, cut edges and mismatched print textures showing. No readable text or logo.",
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
        "A classical statue stands in an empty arcaded square with long raking shadows, a distant train crossing under a green sky. No readable text or logo.",
        "A lone horse stands in an empty piazza in late afternoon, stretched shadows reaching toward a red tower. No readable text or logo.",
        "A tower and a small steam train wait on the horizon behind an empty arcade, shadows stretching unnaturally long. No readable text or logo.",
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
        "A big-eyed woman rides a candy-colored skeleton horse through a lollipop forest, glossy and cute with something dark underneath. No readable text or logo.",
        "A pastel octopus wears a tiara, glossy candy colors and one perfect tear on its enormous eye. No readable text or logo.",
        "A big-headed witch holds a cupcake oozing raspberry jam like a wound, candy pink and mint against black. No readable text or logo.",
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
        "A lone warrior faces a colossal skeletal beast in a ruined cathedral, fading light through the broken windows. No readable text or logo.",
        "A witch queen sits on a throne of thorns in a drowned hall, pale light on the black water. No readable text or logo.",
        "A city of bells is carved into a cliff, fog and fading sunset, the bells ringing with nobody pulling the ropes. No readable text or logo.",
      ],
    },
    'SP10-044': {
      name: 'Green Future Dream',
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
        "A hillside town is covered in terraced gardens and solar sails, villagers harvesting fruit on their rooftops. No readable text or logo.",
        "A bicycle repair cooperative works under a solar canopy, vines climbing the frames and elders teaching apprentices. No readable text or logo.",
        "Glass domes and solar barges drift down a wide river as a floating market, traders passing baskets of vegetables from boat to boat. No readable text or logo.",
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
        "A mascot costume stands in a suburban kitchen, oddly framed and harshly flash-lit, nobody visible inside. No readable text or logo.",
        "A beige hallway has far too many identical doors and one red balloon floating at eye level. No readable text or logo.",
        "On a suburban lawn eyes grow like flowers on thin stems, cropped at a tilt under an overexposed sky. No readable text or logo.",
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
        "A colossal snail carries a whole village on its shell across a wheat field, the farmers tiny beside it. No readable text or logo.",
        "A tiny man in a raincoat shelters with his umbrella beneath a giant dewdrop hanging from a blade of grass, a beetle towering nearby. No readable text or logo.",
        "A giant porcelain teacup lies on its side in a bay, forming a harbor with fishing boats moored inside its rim. No readable text or logo.",
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
        "A pale queen rests beside a sleeping panther under a violet twilight sky, jewel tones veiled in haze. No readable text or logo.",
        "An angel stands in a misty swamp holding a lily, hazy emerald and gold around her. No readable text or logo.",
        "A sphinx and a young poet meet at dusk in jewel tones and soft haze, neither willing to speak first. No readable text or logo.",
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
        "A fisherman at a still lake sees his reflection as a skeleton wearing his hat, the evening light perfectly calm. No readable text or logo.",
        "An old woman's bathroom mirror shows her young, and both are touching the glass from opposite sides. No readable text or logo.",
        "A puddle on a rainy city street reflects a dense green jungle full of parrots instead of the buildings above. No readable text or logo.",
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
        "At a sweltering banquet the roast pig stares back, candles sweat wax and the guests' faces swell in the heat. No readable text or logo.",
        "A nurse walks a hallway that stretches and bends, swollen doorframes and walls beaded with sweat. No readable text or logo.",
        "A carnival at night warps and melts in the heat, swollen balloons sagging over the rides. No readable text or logo.",
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
        "A monk floats cross-legged above a monastery courtyard, books drifting calmly around him in the morning light. No readable text or logo.",
        "At a family picnic the blanket, plates and dog float calmly a meter above the grass. No readable text or logo.",
        "The stones of a ruined abbey float calmly apart in the air while sheep graze beneath them. No readable text or logo.",
      ],
    },
  ] satisfies Create[],
};

export default spec;
