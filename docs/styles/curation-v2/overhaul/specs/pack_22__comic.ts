import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Trading-card comic and cartoon illustration: panel-ready comic methods with original
// characters and no lettering. Eight originals get card briefs; twelve new studies add painted
// covers, four-color newsprint, watercolor graphic novels, bouncy brush cartoons, scratchy indie
// comics, glowing flat webcomics, sunny magazine cartoons, bean shapes, creature features, pulp
// sci-fi panels, charcoal graphic novels and wordless pantomime strips.
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
  tags: [tag, 'comic', 'portable-style-study'],
  dna: dna(fields),
  avoid: [...avoid, 'speech bubbles', 'lettering', 'franchise character likeness', ...STYLE_AVOID],
  briefs,
});

const keep = 'Preserve the requested identity, count, pose and action with original character designs';

const spec: Spec = {
  pack: 'pack_22',
  category: '9. Comic & Cartoon Illustration',
  updates: {
    'SP22-165': { briefs: [
      'A hulking bridge troll demands a toll from a tiny goose in a waistcoat, both carried by clear variable-weight ink contours and solid shadow masses under the planks. No readable text or logo.',
      'A retired superhero waters her garden in a faded cape, her aging muscles modeled with bold ink lines and a few sharp black shadow shapes. No readable text or logo.',
      'A sea captain wrestles a giant squid on the deck of a sinking ship, every tentacle and rope drawn in confident weighted ink. No readable text or logo.',
    ] },
    'SP22-166': { briefs: [
      'A gentle giant carries an entire village on his shoulders across a flooded valley, painted in weighty medium-scale brushwork with a warm delicate glow. No readable text or logo.',
      'A goblin chef presents a monstrous cake to a nervous king, forms built from confident painterly shapes and heavy volume. No readable text or logo.',
      'A wolf in a long coat plays the saxophone on a rainy street corner, painted in bold shapes with soft reflected streetlight. No readable text or logo.',
    ] },
    'SP22-167': { briefs: [
      'A caveman proudly shows his tribe the first wheel, which is square, drawn in economical hand-inked curves with big flat color fields. No readable text or logo.',
      'A knight and a dragon play chess by a campfire, both drawn with expressive hand-inked lines and large flat areas of orange and teal. No readable text or logo.',
      'A cat burglar tiptoes across a museum ceiling on a rope, her body a few expressive ink curves and flat black and pink fills. No readable text or logo.',
    ] },
    'SP22-168': { briefs: [
      "Racing a motorcycle gang down a desert highway, a rocket-powered grandma in curlers leans into the wind with her knitting still in hand, all compact simplified shapes and intense flat color. No readable text or logo.",
      'A fat friendly monster hugs a lighthouse during a storm, its round body a single bright pink shape against deep blue waves. No readable text or logo.',
      'A robot lunch lady serves glowing soup to a line of chunky space aliens, every form broad, curved and brightly colored. No readable text or logo.',
    ] },
    'SP22-169': { briefs: [
      'A stretchy detective reaches around three corners of a city block to grab a fleeing thief, her limbs flowing in painted elastic curves. No readable text or logo.',
      'A dancing hippo in a tutu leaps across a stage, fluid painted shadows and flexible contours making it weightless. No readable text or logo.',
      'A rubbery ghost squeezes through a keyhole into a haunted library, its body swelling and thinning with each brush stroke. No readable text or logo.',
    ] },
    'SP22-170': { briefs: [
      'A vigilante crouches on a gargoyle in the rain, carved out of large black brush groups with only the edge of her mask left open. No readable text or logo.',
      'A werewolf transforms under a streetlamp, its fur exploding in bold brush-ink masses and bright paper reserves. No readable text or logo.',
      'A lone gunslinger walks out of a blazing saloon, silhouette brushed in heavy black against white fire. No readable text or logo.',
    ] },
    'SP22-171': { briefs: [
      'A proud peacock florist arranges a bouquet in her tiny shop, fine decorative line patterns swirling around her bold clear silhouette. No readable text or logo.',
      'A mermaid DJ spins seashell records at an underwater party, delicate line ornaments and bubbles decorating the scene around her. No readable text or logo.',
      'A cat astronaut floats in a starfield of fine-line decorative flourishes, her bold helmet the dominant shape. No readable text or logo.',
    ] },
    'SP22-172': { briefs: [
      'A pompous emperor tries on invisible new clothes before a mirror, painted as a controlled caricature with exaggerated chin and tiny crown. No readable text or logo.',
      'A grumpy wizard with an enormous nose and tiny spectacles glares at a spellbook that has bitten his finger. No readable text or logo.',
      'A snobbish poodle aristocrat sips tea with her nose so high it pokes above the frame. No readable text or logo.',
    ] },
  },
  creates: [
    study('Painted Comic Cover Art', 'fully painted comic cover', 'comic-cover', {
      aesthetic: 'Painted comic cover art: a single dramatic fully painted comic cover moment, rich gouache or oil rendering, heroic lighting and a bold central composition without lettering.',
      subject_treatment: `${keep}; stage the subject as the dramatic central moment of a painted cover.`,
      color_and_tone: 'Rich saturated painted color with strong complementary contrast and dramatic highlights.',
      lighting_and_shadow: 'Dramatic cover lighting with strong key light, rim light and deep shadows.',
      texture_and_material: 'Visible paint strokes, glossy highlights and detailed costumes and props.',
      camera_and_composition: 'Bold central composition with a dramatic angle and space left clear at the top.',
      atmosphere_and_mood: 'Keep the requested mood at its most dramatic, a moment that sells the story.',
      rendering_and_quality: 'Polished painterly rendering with clear readable focal action throughout.',
      key_features: 'single dramatic moment; painted rendering; heroic light; central composition',
    }, ['panel borders', 'readable title'], [
      'A masked heroine holds up a collapsing bridge with both arms while terrified commuters rush past beneath her in the rain, painted like an iconic comic cover. No readable text or logo.',
      'A giant ape made of storm clouds grips the top of a skyscraper as tiny fighter planes dive around it, lit by lightning. No readable text or logo.',
      'A lone detective stands over a mysterious glowing suitcase in a dark alley, shadows of many watching figures stretching across the wall. No readable text or logo.',
    ]),
    study('Four-Color Newsprint Hero', 'vintage four-color comic print', 'four-color-newsprint', {
      aesthetic: 'Four-color newsprint hero: vintage comic book look printed on yellowed newsprint with coarse color dots, flat primary colors and slightly misregistered bold black ink.',
      subject_treatment: `${keep}; ink the subject boldly and fill it with flat primary colors and coarse dot tints.`,
      color_and_tone: 'Flat red, yellow, blue and their dot mixes on warm yellowed newsprint.',
      lighting_and_shadow: 'Simple black shadows and dot-tint shading instead of gradients.',
      texture_and_material: 'Coarse halftone dots, off-register color, pulpy paper grain and bold ink.',
      camera_and_composition: 'Dynamic single-panel framing with heroic angles and action poses.',
      atmosphere_and_mood: 'Keep the requested mood with nostalgic golden-age excitement and energy.',
      rendering_and_quality: 'Authentic vintage print texture with crisp bold ink linework.',
      key_features: 'coarse color dots; flat primaries; yellowed newsprint; misregistered ink',
    }, ['modern digital gradients'], [
      'A caped lumberjack hero lifts a runaway train off the tracks, flat red and blue fills and coarse dots on yellowed newsprint. No readable text or logo.',
      'A flying mailman in goggles delivers a parcel to a spaceship over the city, printed in slightly misregistered four-color dots. No readable text or logo.',
      'A villain made entirely of spaghetti rises from a giant pot as terrified diners flee, in bold vintage newsprint colors. No readable text or logo.',
    ]),
    study('Watercolor Graphic Novel', 'watercolor-painted graphic novel panel', 'watercolor-graphic-novel', {
      aesthetic: 'Watercolor graphic novel: literary graphic novel panels painted in loose watercolor over light pencil or ink, with soft washes, bleeding edges and quiet emotional lighting.',
      subject_treatment: `${keep}; draw the subject lightly and paint it with expressive loose watercolor washes.`,
      color_and_tone: 'Soft muted washes of grey-blue, ochre and rose with warm accent lights.',
      lighting_and_shadow: 'Soft wash shadows and glowing untouched paper highlights.',
      texture_and_material: 'Bleeding wash edges, pencil underdrawing, granulation and paper texture.',
      camera_and_composition: "Cinematic single-panel framing with quiet storytelling space, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with a reflective literary tenderness.',
      rendering_and_quality: 'Loose expressive washes with clear readable figures and emotion.',
      key_features: 'loose watercolor washes; pencil underdrawing; bleeding edges; literary mood',
    }, ['hard cel shading'], [
      'An old woman sits on a train platform with a suitcase and a caged canary, waiting for someone who is not coming, painted in soft grey-blue washes. No readable text or logo.',
      'Two estranged brothers fish from opposite ends of the same rowboat on a misty lake at dawn, the water a single pale bleeding wash. No readable text or logo.',
      'A lighthouse keeper reads letters by lamplight while a storm pounds the windows, warm ochre glow against cold washes. No readable text or logo.',
    ]),
    study('Bouncy Brush Cartoon', 'thick-thin brush cartoon line', 'bouncy-brush', {
      aesthetic: 'Bouncy brush cartoon: cartoon characters drawn with lively thick-to-thin brush lines that swell and taper, giving every pose a springy rhythmic bounce.',
      subject_treatment: `${keep}; draw the subject with springy swelling brush lines and bouncy exaggerated poses.`,
      color_and_tone: 'Cheerful flat colors with light shading under energetic black brush line.',
      lighting_and_shadow: 'Minimal flat shadows that echo the rhythm of the line.',
      texture_and_material: 'Tapered brush strokes, ink weight variation and clean flat fills.',
      camera_and_composition: 'Playful compositions with characters bouncing across the frame.',
      atmosphere_and_mood: 'Keep the requested mood with springy joyful cartoon energy.',
      rendering_and_quality: 'Confident lively brush inking with clear readable silhouettes.',
      key_features: 'thick-thin brush line; springy poses; flat fills; rhythmic bounce',
    }, ['stiff uniform line'], [
      'A rabbit mail carrier bounces down a hill with a sack of letters flying everywhere behind her, every line swelling with springy brush energy. No readable text or logo.',
      'A grandpa dances with his cane at a village fair, his whole body curving like a spring as the band plays on. No readable text or logo.',
      'A pack of puppies tumbles out of a laundry basket onto a kitchen floor in a cascade of bouncing brush lines. No readable text or logo.',
    ]),
    study('Scratchy Indie Comic', 'raw pen indie comic', 'scratchy-indie', {
      aesthetic: 'Scratchy indie comic: raw personal comic drawing with scratchy ballpoint or nib lines, wobbly perspective and honest imperfect charm.',
      subject_treatment: `${keep}; draw the subject with scratchy imperfect lines that still capture it clearly.`,
      color_and_tone: 'Black ink with occasional muted watercolor or marker spot color.',
      lighting_and_shadow: 'Scribbled hatching shadows and plenty of white paper.',
      texture_and_material: 'Scratchy lines, corrections, ink blots and cheap paper texture.',
      camera_and_composition: "Casual diary-like framing with slightly wonky perspective, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with intimate, awkward, honest humor.',
      rendering_and_quality: 'Loose imperfect drawing that remains readable and expressive.',
      key_features: 'scratchy pen lines; wobbly perspective; hatched shadows; diary honesty',
    }, ['polished commercial rendering'], [
      'A tired roommate discovers a family of raccoons has moved into the bathtub and they are all wearing his towels, drawn in scratchy honest pen. No readable text or logo.',
      'A shy musician plays her first gig to an audience of exactly three people and one dog, all drawn in wobbly ballpoint lines. No readable text or logo.',
      'A person sits on a rooftop at night eating cereal straight from the box while the city hums below. No readable text or logo.',
    ]),
    study('Glow-Flat Webcomic', 'flat color webcomic with glow', 'glow-webcomic', {
      aesthetic: 'Glow-flat webcomic: clean flat-colored digital comic art with soft glowing light effects, gradient skies and bright modern color.',
      subject_treatment: `${keep}; render the subject in clean flat color with soft glowing lights and gradients.`,
      color_and_tone: 'Bright modern palettes of teal, coral and violet with soft glowing gradients.',
      lighting_and_shadow: 'Flat shadows plus soft glow around light sources and magic.',
      texture_and_material: 'Clean digital line, flat fills, soft glow halos and subtle grain.',
      camera_and_composition: "Vertical scroll-friendly framing with the character centered, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with cozy modern fantasy warmth.',
      rendering_and_quality: 'Clean crisp digital rendering with controlled glow effects.',
      key_features: 'flat modern color; soft glow halos; gradient skies; clean digital line',
    }, ['muddy textures'], [
      'A witch runs a late-night bakery where the bread glows softly on the shelves and her cat counts coins at the register. No readable text or logo.',
      'A ghost and a vampire share an umbrella under a pink neon-lit rain, their faces glowing in soft gradient light. No readable text or logo.',
      'A young druid waters a houseplant that has grown glowing fruit, the whole apartment lit in teal and gold. No readable text or logo.',
    ]),
    study('Sunny Magazine Cartoon', 'cheerful magazine illustration cartoon', 'sunny-magazine', {
      aesthetic: 'Sunny magazine cartoon: cheerful mid-century magazine cartoon style with rounded characters, clean lines, sunny palettes and gentle comedic situations.',
      subject_treatment: `${keep}; draw the subject as a friendly rounded cartoon in a gently funny situation.`,
      color_and_tone: 'Sunny yellows, sky blues, tomato reds and soft cream backgrounds.',
      lighting_and_shadow: 'Simple sunny lighting with light flat shadow shapes.',
      texture_and_material: 'Clean ink lines, flat fills, slight print texture and rounded forms.',
      camera_and_composition: "Clear single-panel gag composition with readable staging, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with warm, gentle, wholesome humor.',
      rendering_and_quality: 'Tidy polished cartoon rendering with clear shapes and staging.',
      key_features: 'rounded cartoon characters; sunny palette; gentle gag; clean ink',
    }, ['dark grim palette'], [
      'A dad tries to barbecue in the backyard while a very determined seagull steals every sausage, drawn in sunny rounded cartoon style. No readable text or logo.',
      'A knight on vacation sunbathes in full armor on a beach towel, slowly heating up like a toaster. No readable text or logo.',
      'A family picnic is invaded by one polite ant carrying a tiny picnic basket of its own. No readable text or logo.',
    ]),
    study('Bean-Shape Cartoon', 'minimal blob character cartoon', 'bean-shape', {
      aesthetic: 'Bean-shape cartoon: ultra-simple characters made of soft bean and blob shapes with tiny limbs and dot eyes, expressive through posture alone.',
      subject_treatment: `${keep}; reduce figures to simple bean-shaped bodies with dot eyes while keeping their key props.`,
      color_and_tone: 'Soft flat pastels with one bold accent color per character.',
      lighting_and_shadow: 'Almost no shading, maybe a single soft shadow under each bean.',
      texture_and_material: 'Smooth clean shapes, thin limbs, dot eyes and tiny accessories.',
      camera_and_composition: "Simple compositions with generous empty background space, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with gentle, cute, understated comedy.',
      rendering_and_quality: "Clean minimal shapes with precise expressive posture, kept consistent across the whole image.",
      key_features: 'bean-shaped bodies; dot eyes; tiny limbs; minimal pastels',
    }, ['detailed anatomy'], [
      "Facing off on a tiny hill, a knight shaped like a bean meets a slightly larger bean-shaped troll, both holding tiny swords and looking equally unsure about the whole thing. No readable text or logo.",
      'A line of little bean ghosts floats through a haunted house, one of them carrying a very small candle. No readable text or logo.',
      "Behind a diner counter, a round little chef shaped like a bean flips a pancake that is bigger than he is while two bean customers gasp and drop their forks. No readable text or logo.",
    ]),
    study('Creature Feature Comic', 'monster movie comic art', 'creature-feature', {
      aesthetic: 'Creature feature comic: classic monster-movie comic art with towering creatures, screaming crowds, dramatic low angles and lurid saturated color.',
      subject_treatment: `${keep}; stage the subject as a thrilling creature-feature moment with dramatic scale.`,
      color_and_tone: 'Lurid greens, sickly yellows, bright crimsons and deep purple night skies.',
      lighting_and_shadow: 'Dramatic up-lighting and searchlights with heavy black shadows.',
      texture_and_material: 'Bold inked creature texture, slime, scales and crumbling buildings.',
      camera_and_composition: 'Low heroic angles with tiny fleeing figures and towering monsters.',
      atmosphere_and_mood: 'Keep the requested mood with pulpy thrilling monster-movie fun.',
      rendering_and_quality: 'Bold vivid comic rendering without gore, clear readable scale.',
      key_features: 'towering creature; fleeing crowds; lurid colors; dramatic low angle',
    }, ['gore'], [
      'A giant tomato monster rises out of a vegetable garden and chases screaming gardeners down a suburban street under purple night skies. No readable text or logo.',
      'A colossal jellyfish drifts over a beach town at night, its glowing tentacles tangled in the ferris wheel. No readable text or logo.',
      'A sleepy sea monster rests its enormous head on a lighthouse while the keeper tries to shoo it away with a broom. No readable text or logo.',
    ]),
    study('Pulp Sci-Fi Panel', 'retro space adventure comic', 'pulp-scifi', {
      aesthetic: 'Pulp sci-fi panel: retro space-adventure comic panels with finned rockets, ray guns, bubble helmets, alien jungles and bold optimistic color.',
      subject_treatment: `${keep}; place the subject in a retro space adventure with finned ships and bubble helmets.`,
      color_and_tone: 'Bold teal, orange, magenta and chrome silver with starry black skies.',
      lighting_and_shadow: 'Glowing ray-gun light, rim-lit helmets and dramatic planet glow.',
      texture_and_material: 'Chrome rockets, glass bubble helmets, alien plants and ink detail.',
      camera_and_composition: 'Dynamic action angles with planets and rockets in the background.',
      atmosphere_and_mood: 'Keep the requested mood with optimistic retro adventure spirit.',
      rendering_and_quality: 'Crisp vintage comic rendering with bold clean color.',
      key_features: 'finned rockets; bubble helmets; ray-gun glow; alien jungles',
    }, ['gritty modern realism'], [
      'A space explorer in a bubble helmet befriends a giant six-legged alien cat in a jungle of glowing purple ferns, her finned rocket parked behind her. No readable text or logo.',
      'A crew of retirees pilots a chrome rocket through an asteroid field, one of them knitting calmly in the co-pilot seat. No readable text or logo.',
      'A robot butler serves tea on the surface of a ringed planet while two astronauts argue about the view. No readable text or logo.',
    ]),
    study('Charcoal Graphic Novel', 'moody charcoal comic panel', 'charcoal-novel', {
      aesthetic: 'Charcoal graphic novel: moody graphic novel panels drawn in smudged charcoal, heavy blacks, soft greys and erased highlights for a cinematic noir mood.',
      subject_treatment: `${keep}; draw the subject in rich charcoal with dramatic blacks and erased lights.`,
      color_and_tone: 'Monochrome charcoal blacks and greys, occasionally one muted red accent.',
      lighting_and_shadow: 'Dramatic noir lighting, heavy shadows and eraser-lifted highlights.',
      texture_and_material: 'Smudged charcoal, paper tooth, fingerprints and eraser marks.',
      camera_and_composition: "Cinematic single-panel framing with deep shadow areas, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with brooding noir atmosphere.',
      rendering_and_quality: "Expressive charcoal drawing with clear readable figures, kept consistent across the whole image.",
      key_features: 'smudged charcoal; heavy blacks; erased highlights; noir mood',
    }, ['bright color'], [
      'A detective in a trench coat stands in a flooded subway tunnel as a train light approaches from the dark, drawn in smudged charcoal with one erased beam. No readable text or logo.',
      'An old boxer sits alone in an empty gym, a single red glove the only color in the charcoal gloom. No readable text or logo.',
      'A widow stands at a rain-streaked window watching a ship leave the harbor, the fog rubbed soft with a finger. No readable text or logo.',
    ]),
    study('Wordless Pantomime Strip', 'silent gag cartoon moment', 'pantomime-strip', {
      aesthetic: 'Wordless pantomime strip: silent cartoon moments told entirely through expression and body language, with clean line, clear staging and no words at all.',
      subject_treatment: `${keep}; tell a small silent story through the subject's pose and expression.`,
      color_and_tone: 'Simple limited palette with one color highlighting the key action.',
      lighting_and_shadow: 'Clean simple lighting that keeps the staging readable.',
      texture_and_material: 'Clean confident line, simple backgrounds and expressive faces.',
      camera_and_composition: 'Clear stage-like framing with the gag readable at a glance.',
      atmosphere_and_mood: 'Keep the requested mood with quiet clever visual humor.',
      rendering_and_quality: 'Precise expressive cartooning that needs no text to understand.',
      key_features: 'wordless storytelling; expressive body language; clear staging; one accent color',
    }, ['speech bubbles', 'captions'], [
      'A mime is trapped inside an invisible box and a pigeon politely lands on top of the invisible roof, both looking at each other in silent surprise. No readable text or logo.',
      'A knight bows to a lady who hands him a flower, and he sneezes so hard his armor flies apart in every direction. No readable text or logo.',
      'A cat waits by a fishbowl while the fish, wearing a tiny helmet, stares back with total confidence. No readable text or logo.',
    ]),
  ],
};

export default spec;
