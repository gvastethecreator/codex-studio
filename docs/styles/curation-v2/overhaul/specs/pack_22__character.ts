import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Trading-card character and readable forms: rendering approaches that make a character read at a
// glance. Eight originals get card briefs; twelve new studies add chunky proportions, big
// expressions, faction color, hybrid anatomy, heroic stance, shape language, painted busts, glowing
// outlines, minimal lines, weathered realism, iconic masks and gesture-line poses.
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
  tags: [tag, 'portable-style-study'],
  dna: dna(fields),
  avoid: [...avoid, ...STYLE_AVOID],
  briefs,
});

const keep = 'Preserve the requested identity, count, pose and action';

const spec: Spec = {
  pack: 'pack_22',
  category: '5. Character & Readable Forms',
  updates: {
    'SP22-133': { briefs: [
      'A griffin guardian perches on a ruined arch, one continuous clear silhouette with soft restrained volume inside. No readable text or logo.',
      'A swamp troll leans on a club beside a lily pond, its outline bold and unbroken around gentle shading. No readable text or logo.',
      'A winged cat messenger sits on a chimney, readable from across the room by its clean contour alone. No readable text or logo.',
    ] },
    'SP22-134': { briefs: [
      'A coral dragon uncoils from a reef, every curve of its body modeled with brush marks that follow the surface. No readable text or logo.',
      "A mushroom druid spreads glowing arms in a dark grove, soft organic brush strokes wrapping around each rounded cap, finger and swollen root. No readable text or logo.",
      'A giant tree spirit kneels to greet a traveler, its bark painted in flowing marks that follow the trunk. No readable text or logo.',
    ] },
    'SP22-135': { briefs: [
      'A chubby dwarf warrior with a huge beard and tiny legs charges into battle, all broad simple cartoon shapes. No readable text or logo.',
      'A penguin pirate captain stands on a tiny iceberg ship, condensed into a few clear shapes and flat shadows. No readable text or logo.',
      "A cactus gunslinger faces a tumbleweed outlaw at high noon in a dusty street, both reduced to compact readable toon shapes and flat shadows. No readable text or logo.",
    ] },
    'SP22-136': { briefs: [
      "Kneeling beside a mossy log, an old field scientist sketches a giant stag beetle, both drawn with precise proportions and selective fine detail on every antenna. No readable text or logo.",
      'A snowy owl lands on a frozen branch, every feather group accurate while the background stays simple. No readable text or logo.',
      "A deep-sea anglerfish hovers in total darkness with its lure glowing, described like a careful field-guide plate with accurate fins, teeth and tiny scales. No readable text or logo.",
    ] },
    'SP22-137': { briefs: [
      'A rubbery acrobat genie spills out of a lamp in flowing curves and broad painted volume. No readable text or logo.',
      'A giant octopus chef flips pancakes with all eight arms, bodies bending in playful painted rhythms. No readable text or logo.',
      "A lanky scarecrow dances wildly in a moonlit cornfield, his straw limbs looping in elastic painted curves while crows applaud from the fence. No readable text or logo.",
    ] },
    'SP22-138': { briefs: [
      "Raising a round shield in a ruined temple, a beetle warrior shows armor divided into distinct drawn color cells of emerald and gold separated by dark lines. No readable text or logo.",
      'A stained-glass phoenix spreads its wings, every feather a separate cell of color bound in dark lines. No readable text or logo.',
      "A harlequin jester juggles flaming pins in a crowded square, his costume broken into bright color cells that follow every twist of his body. No readable text or logo.",
    ] },
    'SP22-139': { briefs: [
      "Meditating on a rain-soaked rooftop, a cyber monk glows as fine luminous ink lines weave through his robes and break into clean reserved shapes. No readable text or logo.",
      "A tiger spirit prowls through a jungle made of fine energetic lines, the maze of ink wrapping its stripes and swirling off its tail. No readable text or logo.",
      "A street racer leans on her motorbike under a bridge as looping ink lines race over its chrome and spill across the wet asphalt. No readable text or logo.",
    ] },
    'SP22-140': { briefs: [
      'A healer cradles an injured fox by candlelight, both modeled in small soft plane changes and luminous midtones. No readable text or logo.',
      'A retired knight shares tea with a small dragon, their faces painted with quiet discreet edges. No readable text or logo.',
      "A sleeping bard lies in a sunlit hayloft with her lute on her chest, a soft glow on her face and dust floating in the warm light. No readable text or logo.",
    ] },
  },
  creates: [
    study('Chunky Chibi Proportions', 'big-head small-body character design', 'chunky-chibi', {
      aesthetic: 'Chunky chibi proportions: characters redrawn with oversized heads, stubby limbs and round bodies, cute and instantly readable while keeping their key traits.',
      subject_treatment: `${keep}; redraw figures with big heads and small rounded bodies while keeping their costumes and props recognizable.`,
      color_and_tone: 'Bright cheerful colors with soft cel shading and rosy cheek accents.',
      lighting_and_shadow: 'Simple soft two-tone shading with small shiny highlights on eyes and hair.',
      texture_and_material: 'Clean line art, smooth fills, oversized eyes and simplified costume details.',
      camera_and_composition: 'Preserve the requested framing with the character centered and full-body.',
      atmosphere_and_mood: 'Keep the requested mood while making it cuter and more playful.',
      rendering_and_quality: 'Clean polished chibi rendering with clear readable silhouettes.',
      key_features: 'oversized head; stubby limbs; big eyes; simplified costume',
    }, ['realistic proportions'], [
      'A tiny armored dragon slayer with a huge helmet struggles to lift a sword twice her size. No readable text or logo.',
      'A chibi lich king holds a teacup with both stubby hands, his giant crown sliding over his eyes. No readable text or logo.',
      "A squad of chibi ninjas balances on each other's giant heads in a kitchen to reach a cookie jar on the top shelf, all wobbling dangerously. No readable text or logo.",
    ]),
    study('Big-Expression Portrait', 'emotion-first character portrait', 'big-expression', {
      aesthetic: 'Big-expression portrait: character close-ups where the face carries one strong emotion, exaggerated eyebrows, mouth and eyes that read instantly.',
      subject_treatment: `${keep}; frame the character close and push one clear emotion in the face while keeping likeness.`,
      color_and_tone: 'Saturated colors with a background tint matching the emotion.',
      lighting_and_shadow: 'Clear facial lighting that sculpts the expression, soft background falloff.',
      texture_and_material: 'Painterly skin, expressive brows, readable wrinkles and bold eye shapes.',
      camera_and_composition: 'Close portrait or bust framing with the face filling most of the frame.',
      atmosphere_and_mood: 'Amplify the emotion the prompt requests, readable across a room.',
      rendering_and_quality: 'Expressive but polished painting with clear facial acting.',
      key_features: 'close face framing; one strong emotion; exaggerated brows; tinted background',
    }, ['blank neutral face'], [
      'A goblin realizes he has sold the wrong treasure map, his whole face collapsing in horror. No readable text or logo.',
      'A dwarf tastes an elven salad for the first time and his beard seems to curl in disgust. No readable text or logo.',
      "A vampire sees morning sunlight creeping under the crypt door, eyes wide, fangs bared and cape clutched to his chin in pure comic panic. No readable text or logo.",
    ]),
    study('Faction Color Coding', 'team color identity design', 'faction-color', {
      aesthetic: 'Faction color coding: characters designed around one bold faction color scheme so allegiance reads instantly, with accents repeated across costume and gear.',
      subject_treatment: `${keep}; dress and equip the characters in a clear shared color scheme showing their faction.`,
      color_and_tone: 'One dominant faction color with a secondary accent and neutral base tones.',
      lighting_and_shadow: 'Clean readable lighting that keeps faction colors strong in shadow.',
      texture_and_material: 'Banners without symbols, sashes, dyed armor trims and colored gear.',
      camera_and_composition: 'Preserve the requested framing with faction colors leading the eye.',
      atmosphere_and_mood: 'Keep the requested mood with clear team identity and pride.',
      rendering_and_quality: "Clean polished rendering with consistent color logic, kept consistent across the whole image.",
      key_features: 'dominant faction color; repeated accents; clear allegiance; neutral base',
    }, ['random unrelated colors', 'readable emblems'], [
      'Three rival guild duelists meet in a plaza, one all crimson, one all teal and one all gold. No readable text or logo.',
      'An army of frog knights in lime green faces an army of toads in deep violet across a pond. No readable text or logo.',
      "A cyber gang in matching hot orange jackets surrounds a lone courier dressed all in cobalt on a rainy overpass, nobody sure who is outnumbered. No readable text or logo.",
    ]),
    study('Hybrid Creature Anatomy', 'believable creature fusion design', 'hybrid-anatomy', {
      aesthetic: 'Hybrid creature anatomy: creatures fused from two or more animals with believable joints, muscles and skin transitions, painted like convincing concept art.',
      subject_treatment: `${keep}; if the subject is a creature, blend its animal parts with believable anatomy at every join.`,
      color_and_tone: 'Naturalistic animal colors blending smoothly at the transitions.',
      lighting_and_shadow: 'Clear anatomical lighting that reveals muscle and joint structure.',
      texture_and_material: 'Fur fading into scales, feathers into hide, believable skin transitions.',
      camera_and_composition: 'Preserve the requested framing with the full creature visible.',
      atmosphere_and_mood: 'Keep the requested mood with a sense of real possible biology.',
      rendering_and_quality: "Convincing anatomical concept painting with clean transitions, kept consistent across the whole image.",
      key_features: 'fused animal parts; believable joints; skin transitions; concept-art realism',
    }, ['random collage parts', 'gore'], [
      'A bear with the head and wings of an owl perches heavily on a pine branch that bends under it. No readable text or logo.',
      'A deer with a peacock tail and hooves of polished stone stands in a temple garden. No readable text or logo.',
      "A crocodile with the fluffy golden mane of a lion suns itself on a riverbank, the fur blending believably into its scaly neck. No readable text or logo.",
    ]),
    study('Heroic Proportion Stance', 'idealized heroic figure pose', 'heroic-stance', {
      aesthetic: 'Heroic proportion stance: idealized heroic figures with long legs, broad shoulders and confident grounded poses, drawn to look powerful and iconic.',
      subject_treatment: `${keep}; give figures heroic proportions and a confident grounded stance.`,
      color_and_tone: 'Strong saturated costume colors against simpler muted backgrounds.',
      lighting_and_shadow: 'Dramatic upward key light and strong rim light on the figure.',
      texture_and_material: 'Clean costume materials, capes, armor and flowing fabric.',
      camera_and_composition: 'Low camera angle, full-body figure dominating the frame.',
      atmosphere_and_mood: 'Keep the requested mood with bold heroic confidence.',
      rendering_and_quality: "Polished dynamic figure rendering with clean anatomy, kept consistent across the whole image.",
      key_features: 'heroic proportions; low angle; grounded stance; rim light',
    }, ['slouched weak pose'], [
      'A baker stands on a flour-dusted counter in a heroic pose, rolling pin raised like a legendary sword. No readable text or logo.',
      "A librarian guards the door of a burning library with arms folded and cape billowing, books flying out of the windows behind her like birds. No readable text or logo.",
      'An old fisherman stands on the bow of his boat facing a storm, legs planted like a statue. No readable text or logo.',
    ]),
    study('Shape-Language Caricature', 'circle square triangle personalities', 'shape-language', {
      aesthetic: 'Shape-language caricature: characters built from dominant basic shapes, round for friendly, square for sturdy, triangular for sharp, so personality reads instantly.',
      subject_treatment: `${keep}; build each character from one dominant shape that matches its personality.`,
      color_and_tone: 'Clean graphic colors with simple shading and strong shape contrast.',
      lighting_and_shadow: 'Simple flat shadows that reinforce the dominant shapes.',
      texture_and_material: 'Clean line art, bold shape silhouettes and minimal detail.',
      camera_and_composition: 'Preserve the requested framing with shape contrast between characters.',
      atmosphere_and_mood: 'Keep the requested mood with clear, readable character personality.',
      rendering_and_quality: "Crisp graphic character design with clear silhouettes, kept consistent across the whole image.",
      key_features: 'round friendly shapes; square sturdy shapes; triangle sharp shapes; clear silhouettes',
    }, ['muddled shapes'], [
      'A round cheerful baker, a square sturdy blacksmith and a triangular sly thief share a tavern table. No readable text or logo.',
      'A triangular villain sorcerer looms over a round little hero who is not impressed at all. No readable text or logo.',
      "A square golem and a round fairy build a snowman together in a meadow, and somehow the snowman comes out perfectly triangular. No readable text or logo.",
    ]),
    study('Painted Character Bust', 'painterly portrait bust card', 'painted-bust', {
      aesthetic: 'Painted character bust: head-and-shoulders character portraits in rich painterly style, with detailed faces and costumes fading into loose brushwork.',
      subject_treatment: `${keep}; show the character as a head-and-shoulders bust with a finely painted face.`,
      color_and_tone: 'Rich skin tones and costume colors against a softly painted background.',
      lighting_and_shadow: 'Classic portrait lighting with soft shadows and gentle rim light.',
      texture_and_material: 'Detailed face and costume texture fading to loose strokes at the edges.',
      camera_and_composition: 'Head and shoulders bust, slightly off-center, three-quarter view.',
      atmosphere_and_mood: 'Keep the requested mood with personality and presence.',
      rendering_and_quality: "Polished painterly face with loose confident edges, kept consistent across the whole image.",
      key_features: 'head-and-shoulders bust; detailed face; loose edges; portrait light',
    }, ['full-body scene'], [
      'An orc diplomat in a fine velvet coat smiles politely while hiding a dagger in his collar. No readable text or logo.',
      "An elderly sea captain with a parrot on her shoulder squints at the horizon, salt in her braids and a brass spyglass tucked under her arm. No readable text or logo.",
      'A young witch with an owl feather in her hat looks up from a spell, soot on her cheek. No readable text or logo.',
    ]),
    study('Glowing Outline Pop', 'luminous outlined character art', 'glowing-outline', {
      aesthetic: 'Glowing outline pop: characters outlined in thick glowing colored lines against dark backgrounds, bold and electric like a collectible holo card.',
      subject_treatment: `${keep}; outline the characters in luminous colored lines that make them pop from dark space.`,
      color_and_tone: 'Dark backgrounds with vivid glowing cyan, magenta or gold outlines.',
      lighting_and_shadow: 'Outlines glowing and casting colored light onto nearby surfaces.',
      texture_and_material: 'Smooth fills, glowing strokes, soft bloom and small sparkle accents.',
      camera_and_composition: 'Preserve the requested framing with characters centered against darkness.',
      atmosphere_and_mood: 'Keep the requested mood with electric collectible energy.',
      rendering_and_quality: "Clean luminous outlines with controlled bloom, kept consistent across the whole image.",
      key_features: 'glowing colored outlines; dark background; bloom; collectible pop',
    }, ['flat daylight'], [
      "A skeleton guitarist shreds on a dark stage in front of a roaring crowd, his bones outlined in glowing magenta lines that pulse with each chord. No readable text or logo.",
      'A cyber samurai draws a blade outlined in cyan light that glows across the rainy street. No readable text or logo.',
      "A cat spirit leaps across rooftops through the night sky, its body only a glowing gold outline trailing sparks behind its tail. No readable text or logo.",
    ]),
    study('Minimal Line Character', 'few-line minimal character', 'minimal-line', {
      aesthetic: 'Minimal line character: characters captured in the fewest possible lines, a single confident stroke for each form, with lots of empty space.',
      subject_treatment: `${keep}; reduce the characters to a handful of clean lines that still read clearly.`,
      color_and_tone: 'Black line on white with at most one flat accent color.',
      lighting_and_shadow: 'No shading; form implied by line placement alone.',
      texture_and_material: 'Clean confident strokes with slight taper and empty paper.',
      camera_and_composition: 'Preserve the requested framing with generous empty space.',
      atmosphere_and_mood: 'Keep the requested mood with calm elegant simplicity.',
      rendering_and_quality: 'Precise minimal line work, never sketchy or overworked.',
      key_features: 'few lines; single strokes; empty space; one accent color',
    }, ['detailed rendering'], [
      'A samurai waits in the rain drawn in only seven lines and one red dot for his sash. No readable text or logo.',
      'A dancing witch kicks up her heels in a few swooping strokes and one purple hat. No readable text or logo.',
      "A cat asleep on a sunny windowsill is suggested by only three confident lines and a single yellow eye opening a sliver. No readable text or logo.",
    ]),
    study('Weathered Veteran Rendering', 'gritty realistic character rendering', 'weathered-veteran', {
      aesthetic: 'Weathered veteran rendering: realistic characters painted with every scar, wrinkle, stain and patch visible, their history written into skin and gear.',
      subject_treatment: `${keep}; render the characters with realistic wear, scars and weathered gear appropriate to them.`,
      color_and_tone: 'Muted earthy tones, worn leather browns, dulled metal and tired skin.',
      lighting_and_shadow: 'Hard side light revealing texture, scars and deep eye shadows.',
      texture_and_material: 'Scratched armor, patched cloth, dirt, sweat, scars and worn straps.',
      camera_and_composition: 'Preserve the requested framing with close detail on the face and gear.',
      atmosphere_and_mood: 'Keep the requested mood with gritty lived-in authenticity.',
      rendering_and_quality: "Detailed realistic painting with believable wear, kept consistent across the whole image.",
      key_features: 'visible scars and wrinkles; worn gear; hard side light; muted tones',
    }, ['clean shiny costume', 'gore'], [
      'An old sellsword polishes a dented helmet by a campfire, every scar on his hands telling a story. No readable text or logo.',
      "A retired pirate queen with a patched coat and long grey braids counts her last gold coins by candlelight in a creaking tavern. No readable text or logo.",
      "A dwarven miner with a soot-black beard and a cracked lantern rests on a cart of ore after a thirty-hour shift, knuckles scarred and raw. No readable text or logo.",
    ]),
    study('Iconic Mask Read', 'mask-driven character silhouette', 'iconic-mask', {
      aesthetic: 'Iconic mask read: characters defined by one striking mask or helmet shape that is readable at a glance, with the rest of the costume simplified around it.',
      subject_treatment: `${keep}; give each character one bold mask or helmet silhouette and simplify the rest.`,
      color_and_tone: 'Strong contrast between the mask and a simplified dark or muted costume.',
      lighting_and_shadow: 'Dramatic light focused on the mask with the body falling into shadow.',
      texture_and_material: 'Carved, lacquered or metal mask surfaces with clean simple clothing.',
      camera_and_composition: 'Preserve the requested framing with the mask as the focal point.',
      atmosphere_and_mood: 'Keep the requested mood with mysterious iconic presence.',
      rendering_and_quality: 'Polished rendering with a crisp memorable mask silhouette.',
      key_features: 'striking mask silhouette; simplified costume; focal lighting; iconic read',
    }, ['busy overdetailed costume', 'franchise masks'], [
      "A plague-doctor duelist stands in a foggy square wearing a long silver beak mask, everything else a plain black coat and gloves. No readable text or logo.",
      'A forest guardian hides behind a mask of antlers and bark, her body shrouded in green. No readable text or logo.',
      "A masked thief with a grinning crescent-moon mask vanishes into the dark alley, only the pale mask still visible for a heartbeat. No readable text or logo.",
    ]),
    study('Gesture-Line Action Pose', 'line-of-action driven pose', 'gesture-line', {
      aesthetic: 'Gesture-line action pose: characters drawn along one sweeping line of action, poses pushed to maximum energy with clear rhythm through the whole body.',
      subject_treatment: `${keep}; build each pose along a strong curved line of action that carries through the body.`,
      color_and_tone: 'Clean colors that do not distract from the pose, with one accent.',
      lighting_and_shadow: 'Simple lighting that emphasizes the flow of the pose.',
      texture_and_material: 'Clean lines, flowing fabric and hair following the action curve.',
      camera_and_composition: 'Preserve the requested framing with a dynamic diagonal composition.',
      atmosphere_and_mood: 'Keep the requested mood with explosive kinetic energy.',
      rendering_and_quality: 'Clear dynamic figure drawing with strong readable rhythm.',
      key_features: 'strong line of action; pushed poses; flowing rhythm; diagonal composition',
    }, ['stiff static pose'], [
      "A monk leaps into a flying kick over a temple courtyard, his whole body one sweeping curve from pointed toe to reaching fingertip. No readable text or logo.",
      "A dancer swordswoman spins mid-air above a stage, her whole body, flying hair and blade forming one continuous flowing S-curve. No readable text or logo.",
      "A goalkeeper dives for a thunderous shot in a rain-soaked stadium, her body a perfect arc stretching across the whole frame. No readable text or logo.",
    ]),
  ],
};

export default spec;
