import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Trading-card anime illustration: collectible anime rendering methods with original characters.
// Eight originals get card briefs; twelve new studies add holo shine, ink-brush splash, watercolor
// key visuals, neon rims, pastel idol gradients, halftone tones, scenic backdrops, bold battle
// lines, sparkle bursts, production sketches, lace gothic portraits and mecha panel lines.
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
  tags: [tag, 'anime', 'portable-style-study'],
  dna: dna(fields),
  avoid: [...avoid, 'franchise character likeness', ...STYLE_AVOID],
  briefs,
});

const keep = 'Preserve the requested identity, count, pose and action with original character designs';

const spec: Spec = {
  pack: 'pack_22',
  category: '6. Anime Illustration',
  updates: {
    'SP22-141': { briefs: [
      'A young summoner calls a crystal fox out of a glowing circle, fine clean anime line and two compact shadow tones. No readable text or logo.',
      'A sky knight salutes from the back of a white pegasus above the clouds, rendered in crisp controlled cel planes. No readable text or logo.',
      'A shrine guardian sweeps petals from temple steps, her outline clean and her colors simple and bright. No readable text or logo.',
    ] },
    'SP22-142': { briefs: [
      'A moon priestess holds a pearl of light in cupped hands, soft modeled skin and tiny drawn highlights shimmering. No readable text or logo.',
      'A mermaid princess rests on a coral throne, her scales painted with pearly sheen and fine line accents. No readable text or logo.',
      'A snow spirit smiles in a winter forest, her pale hair glowing with soft pearl highlights. No readable text or logo.',
    ] },
    'SP22-143': { briefs: [
      'A poet and a swallow share a quiet moment on a balcony, long delicate curves and open paper around them. No readable text or logo.',
      'A dancer in flowing silk turns on a bridge of petals, drawn in fine romantic lines with pale washes. No readable text or logo.',
      'A prince reads under a willow while its branches trail in long thin curves around him. No readable text or logo.',
    ] },
    'SP22-144': { briefs: [
      'A rainy-day courier runs through a market, structural ink lines with soft wet translucent washes bleeding beyond them. No readable text or logo.',
      "A cat-eared alchemist brews tea in a cluttered study full of bubbling flasks, broken ink contours softened by controlled translucent washes of green. No readable text or logo.",
      'A lighthouse girl waves at a passing whale, sea and sky painted in loose wet washes. No readable text or logo.',
    ] },
    'SP22-145': { briefs: [
      'A dragon empress sits on a throne of jade and gold, every ornate detail layered clearly around her strong silhouette. No readable text or logo.',
      "A celestial archer draws a bow made of starlight on a cloud bridge, her armor polished and richly detailed with engraved constellations and jewels. No readable text or logo.",
      'A clockwork maiden winds her own heart key, gears and lace painted in ornate polished layers. No readable text or logo.',
    ] },
    'SP22-146': { briefs: [
      "Spinning through a storm of falling red leaves, a blade dancer is defined by sharp angular shadow facets across her armor and flowing sleeves. No readable text or logo.",
      'A cyber wolf-girl crouches on a rooftop, taut curves and straight shadow cuts across her armor. No readable text or logo.',
      "A crystal knight shatters a stone golem in a quarry, every flying fragment and every shadow cut clean, straight and angular. No readable text or logo.",
    ] },
    'SP22-147': { briefs: [
      'A flower witch floats in a meadow of glowing blossoms, soft-edged painting with gentle bloom around her. No readable text or logo.',
      "A sleepy dragon girl curls up in a hammock of pink clouds at sunset, her horns and tail painted in soft continuous glowing volume. No readable text or logo.",
      'A lantern festival glows over a river as a couple leans on a railing, edges melting into warm light. No readable text or logo.',
    ] },
    'SP22-148': { briefs: [
      'A thunder warrior raises a hammer, reduced to a few broad flat color blocks and small sharp details. No readable text or logo.',
      'A bunny-eared bard plays a lute on a rock, her whole design built from bold flat graphic shapes. No readable text or logo.',
      'A samurai frog stands in the rain in three flat blocks of color and a few crisp line marks. No readable text or logo.',
    ] },
  },
  creates: [
    study('Holo-Foil Anime Shine', 'holographic foil card anime', 'holo-foil-anime', {
      aesthetic: 'Holo-foil anime shine: anime illustration finished like a rare holographic card, with rainbow foil sheen sweeping across hair, armor and background patterns.',
      subject_treatment: `${keep}; render the characters in clean anime style with a rainbow holographic sheen over selected areas.`,
      color_and_tone: 'Vivid anime colors overlaid with shifting rainbow foil bands of pink, teal and gold.',
      lighting_and_shadow: 'Clean cel lighting with a diagonal foil glare sweeping across the image.',
      texture_and_material: 'Holographic foil patterns, sparkle points and glossy card surface reflections.',
      camera_and_composition: 'Preserve the requested framing with the character centered and heroic.',
      atmosphere_and_mood: 'Keep the requested mood with the thrill of pulling a rare card.',
      rendering_and_quality: 'Crisp anime art with controlled foil sheen, never muddy rainbow wash.',
      key_features: 'rainbow foil sheen; sparkle points; diagonal glare; rare-card feel',
    }, ['dull matte finish', 'readable card text'], [
      "A star mage leaps across a swirling galaxy background that shimmers with rainbow foil bands, her cloak full of tiny glinting stars. No readable text or logo.",
      'A fox shrine maiden stands in a torii gate, her white robes sweeping with holographic sheen. No readable text or logo.',
      "A dragon knight raises her lance on a cliff as her armor glints with shifting holographic foil colors from pink to teal. No readable text or logo.",
    ]),
    study('Ink-Brush Anime Splash', 'anime with sumi brush splashes', 'ink-brush-anime', {
      aesthetic: 'Ink-brush anime splash: clean anime characters set against explosive black sumi brush splashes and dry-brush streaks, with one vivid accent color.',
      subject_treatment: `${keep}; draw the characters in crisp anime line and surround their action with bold ink brush splashes.`,
      color_and_tone: 'Black ink splashes, white paper and one vivid accent like crimson or gold.',
      lighting_and_shadow: 'Strong contrast from black ink masses against bright white space.',
      texture_and_material: 'Dry brush streaks, ink spatter, wet splash edges and clean character lines.',
      camera_and_composition: 'Preserve the requested framing with dynamic diagonal ink sweeps.',
      atmosphere_and_mood: 'Keep the requested mood with explosive martial energy.',
      rendering_and_quality: 'Clean anime figures with bold expressive ink, never messy faces.',
      key_features: 'sumi brush splashes; dry-brush streaks; one accent color; crisp anime figure',
    }, ['full color background'], [
      'A swordswoman cuts through a storm of black ink splashes, a single crimson ribbon trailing from her hilt. No readable text or logo.',
      "A monk strikes a dragon made of pure black ink that bursts across the white page around him, one gold bead glowing on his wrist. No readable text or logo.",
      'An archer releases an arrow that leaves a sweeping streak of dry black brush across the sky. No readable text or logo.',
    ]),
    study('Watercolor Key Visual', 'watercolor anime key art', 'watercolor-key', {
      aesthetic: 'Watercolor key visual: anime key-art composition painted in luminous watercolor, with clean character linework and soft blooming skies.',
      subject_treatment: `${keep}; draw the characters with clean anime line and paint them and the scene in luminous watercolor.`,
      color_and_tone: 'Bright transparent watercolor blues, pinks and golds with white paper highlights.',
      lighting_and_shadow: 'Soft watercolor shadows and glowing sky light with gentle blooms.',
      texture_and_material: 'Wet blooms, granulating skies, paper grain and crisp ink line.',
      camera_and_composition: 'Preserve the requested framing like a poster key visual with big sky.',
      atmosphere_and_mood: 'Keep the requested mood with hopeful luminous wonder.',
      rendering_and_quality: 'Clean line with fresh transparent washes, never muddy.',
      key_features: 'luminous watercolor; clean anime line; blooming skies; key-art layout',
    }, ['opaque digital paint'], [
      'Three young adventurers stand on a hill as a sky whale swims through blooming watercolor clouds. No readable text or logo.',
      'A girl on a bicycle races a train along the coast under a pink and gold watercolor sky. No readable text or logo.',
      "A witch apprentice flies on a broom over a patchwork town at dawn, the rooftops and fields painted in soft blooming transparent washes. No readable text or logo.",
    ]),
    study('Neon Rim Anime Night', 'anime with neon rim lighting', 'neon-rim-anime', {
      aesthetic: 'Neon rim anime night: anime characters in dark city nights with vivid pink and cyan neon rim lights outlining faces, hair and weapons.',
      subject_treatment: `${keep}; place the characters in night light with strong neon rims defining their silhouettes.`,
      color_and_tone: 'Deep indigo darkness with hot pink and electric cyan rim lights.',
      lighting_and_shadow: 'Dual-color neon rim lights and dark shadowed faces.',
      texture_and_material: 'Wet reflective surfaces, glowing edges and clean cel shading.',
      camera_and_composition: 'Preserve the requested framing with rim lights on both sides of the figure.',
      atmosphere_and_mood: 'Keep the requested mood with cool nocturnal tension.',
      rendering_and_quality: "Crisp anime rendering with saturated controlled glow, kept consistent across the whole image.",
      key_features: 'pink and cyan rims; dark night; wet reflections; cool tension',
    }, ['daylight', 'readable signs'], [
      'A street racer girl leans on her bike in the rain, pink and cyan neon outlining her helmet and hair. No readable text or logo.',
      'A demon hunter draws twin blades in a dark alley, each blade catching a different neon color. No readable text or logo.',
      'A cyber cat-girl sits on a rooftop edge, her tail rimmed in glowing cyan against a pink sky. No readable text or logo.',
    ]),
    study('Pastel Gradient Idol Card', 'pastel idol card anime', 'pastel-idol', {
      aesthetic: 'Pastel gradient idol card: cheerful anime idols painted with soft pastel gradients, sparkles, ribbons and glossy hair shine like a collectible idol card.',
      subject_treatment: `${keep}; render the characters as bright stage performers with pastel gradients and sparkles.`,
      color_and_tone: 'Candy pastels of pink, mint, lilac and baby blue with white sparkles.',
      lighting_and_shadow: 'Soft stage glow, glossy hair highlights and gentle shadows.',
      texture_and_material: 'Satin ribbons, glitter sparkles, glossy hair bands and soft gradients.',
      camera_and_composition: 'Preserve the requested framing with a dynamic stage pose.',
      atmosphere_and_mood: 'Keep the requested mood with bubbly joyful energy.',
      rendering_and_quality: "Polished glossy anime rendering with clean gradients, kept consistent across the whole image.",
      key_features: 'pastel gradients; sparkles; glossy hair; idol stage pose',
    }, ['dark grim palette', 'readable text'], [
      'A trio of idol singers jumps in the air on a pastel stage as ribbons and sparkles explode around them. No readable text or logo.',
      'A shy idol practices alone in a mirror room, pastel light glowing in her twin tails. No readable text or logo.',
      'A dragon idol sings on a floating stage, her wings shimmering in mint and pink gradients. No readable text or logo.',
    ]),
    study('Halftone Tone Anime', 'color anime with screentone dots', 'halftone-anime', {
      aesthetic: 'Halftone tone anime: color anime illustration shaded with visible screentone dot patterns instead of smooth gradients, like a colored manga page.',
      subject_treatment: `${keep}; shade the characters with clean dot and line screentone patterns over flat colors.`,
      color_and_tone: 'Bright flat colors with dot-pattern shading in darker tints.',
      lighting_and_shadow: 'Shadows and highlights made from screentone dot density.',
      texture_and_material: 'Round dot tones, line tones, crisp ink outlines and flat fills.',
      camera_and_composition: 'Preserve the requested framing with bold graphic composition.',
      atmosphere_and_mood: 'Keep the requested mood with lively printed comic energy.',
      rendering_and_quality: "Clean screentone application with crisp consistent dots, kept consistent across the whole image.",
      key_features: 'screentone dot shading; flat colors; crisp ink; printed comic feel',
    }, ['smooth airbrush gradients'], [
      "A boxer throws a devastating punch in a crowded ring, the impact shadows on her face and fist built from bold screentone dots. No readable text or logo.",
      "A ghost detective lights a lantern in a narrow alley at night, the walls and fog shaded entirely in dotted screentone patterns. No readable text or logo.",
      'A magical cat stretches on a sunny windowsill, its shadow a soft field of pink dots. No readable text or logo.',
    ]),
    study('Scenic Backdrop Anime Card', 'detailed scenery with anime figures', 'scenic-anime', {
      aesthetic: 'Scenic backdrop anime card: small anime characters placed in lavishly detailed painted landscapes, clouds and light, where the scenery tells the story.',
      subject_treatment: `${keep}; keep the characters small but clear inside a richly detailed painted setting.`,
      color_and_tone: 'Vivid sky blues, lush greens and golden sunset light.',
      lighting_and_shadow: 'Detailed natural light with crepuscular rays and glowing clouds.',
      texture_and_material: 'Painted foliage, towering clouds, reflective water and fine architecture.',
      camera_and_composition: 'Wide shots with small figures and big dramatic skies.',
      atmosphere_and_mood: 'Keep the requested mood with nostalgic sweeping beauty.',
      rendering_and_quality: "Highly detailed scenery with clean small characters, kept consistent across the whole image.",
      key_features: 'lavish scenery; small figures; dramatic skies; nostalgic light',
    }, ['empty background'], [
      'Two travelers rest on a hill of wildflowers as a colossal thunderhead glows gold at sunset. No readable text or logo.',
      "A lone swordswoman walks along a flooded railway toward a distant city under towering sunset clouds, her reflection trailing her in the still water. No readable text or logo.",
      "A young mechanic and her robot watch meteors streak from a rooftop garden above a sleeping town full of glowing windows. No readable text or logo.",
    ]),
    study('Bold-Line Battle Card', 'thick-line action anime card', 'bold-battle', {
      aesthetic: 'Bold-line battle card: high-energy anime action with thick heavy outlines, dramatic speed lines, flying debris and intense faces.',
      subject_treatment: `${keep}; draw the characters with thick powerful outlines and push the action with speed lines.`,
      color_and_tone: 'Saturated primary colors, fiery oranges and deep shadows.',
      lighting_and_shadow: "Hard dramatic shading with bright impact flashes, kept consistent across the whole image.",
      texture_and_material: 'Thick ink lines, speed lines, debris, sweat drops and energy crackles.',
      camera_and_composition: "Extreme angles and foreshortening with diagonal action, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood at maximum battle intensity.',
      rendering_and_quality: "Bold confident inking with clear readable action, kept consistent across the whole image.",
      key_features: 'thick outlines; speed lines; flying debris; extreme angles',
    }, ['calm static pose'], [
      "A martial artist punches clean through a boulder on a mountaintop, thick lines, speed streaks and rock fragments exploding outward. No readable text or logo.",
      "Two rivals clash fists in mid-air above a crumbling arena, debris and shockwaves flying in every direction around their snarling faces. No readable text or logo.",
      "A beast tamer rides a charging rhino-dragon through a burning plain, her foreshortened fist thrust straight toward the viewer. No readable text or logo.",
    ]),
    study('Sparkle-Burst Magical Card', 'magical sparkle effects anime', 'sparkle-burst', {
      aesthetic: 'Sparkle-burst magical card: anime spellcasters surrounded by starbursts, glitter trails, glowing circles and ribbons of light filling the card.',
      subject_treatment: `${keep}; surround the characters with bursts of sparkles and glowing magical effects.`,
      color_and_tone: 'Bright magical colors of violet, gold and cyan with white star glints.',
      lighting_and_shadow: 'Characters lit by the magic itself with bright glows.',
      texture_and_material: 'Starburst glints, glitter trails, glowing rings and light ribbons.',
      camera_and_composition: 'Preserve the requested framing with effects radiating from the center.',
      atmosphere_and_mood: 'Keep the requested mood with dazzling magical wonder.',
      rendering_and_quality: 'Clean crisp sparkles and glows around polished characters.',
      key_features: 'starburst sparkles; glowing rings; light ribbons; magical glow',
    }, ['dull muted palette'], [
      'A young witch spins her wand as a spiral of gold stars and violet ribbons bursts around her. No readable text or logo.',
      'A crystal fairy transforms in a burst of glittering light, rings of cyan magic around her. No readable text or logo.',
      'A cat wizard sneezes and a cloud of sparkles and tiny stars fills the whole library. No readable text or logo.',
    ]),
    study('Production Sketch Anime', 'rough anime production drawing', 'production-sketch', {
      aesthetic: 'Production sketch anime: rough anime production drawings with colored pencil construction, light color notes and energetic unfinished lines.',
      subject_treatment: `${keep}; draw the characters as lively production sketches with visible construction.`,
      color_and_tone: 'Blue and red pencil lines with light marker color notes on white paper.',
      lighting_and_shadow: 'Simple shadow shapes blocked with light marker or pencil.',
      texture_and_material: 'Sketchy pencil strokes, construction circles, erased marks and marker patches.',
      camera_and_composition: 'Preserve the requested framing on a drawing sheet.',
      atmosphere_and_mood: 'Keep the requested mood with creative in-progress energy.',
      rendering_and_quality: "Loose confident sketching with clear readable gesture, kept consistent across the whole image.",
      key_features: 'blue and red pencil; construction lines; marker notes; unfinished energy',
    }, ['polished final render', 'readable notes'], [
      'A mech pilot girl climbs into her cockpit, drawn in blue construction pencil with red clean-up lines. No readable text or logo.',
      "A ninja cat leaps across moonlit rooftops, three rough poses sketched in blue pencil with light grey marker shadows beneath each jump. No readable text or logo.",
      'A sword saint kneels in the rain, rough pencil lines and grey marker washes suggesting the storm. No readable text or logo.',
    ]),
    study('Lace-Gothic Anime Portrait', 'gothic lolita anime portraiture', 'lace-gothic', {
      aesthetic: 'Lace-gothic anime portrait: elegant dark anime portraits with lace, roses, ribbons and candlelight, delicate and melancholy.',
      subject_treatment: `${keep}; portray the characters in elegant gothic dress with lace and roses framing them.`,
      color_and_tone: 'Black, burgundy and ivory with deep rose red and candle gold accents.',
      lighting_and_shadow: "Soft candlelight with deep elegant shadows, kept consistent across the whole image.",
      texture_and_material: 'Fine lace, velvet, satin ribbons, rose petals and dark wood.',
      camera_and_composition: 'Portrait or half-body framing with ornamental roses around the figure.',
      atmosphere_and_mood: 'Keep the requested mood with elegant gothic melancholy.',
      rendering_and_quality: 'Delicate detailed anime rendering of lace and fabric.',
      key_features: 'black lace; roses; candlelight; melancholy elegance',
    }, ['bright casual clothing'], [
      'A vampire doll maker sits among her creations, a rose tucked into her black lace collar. No readable text or logo.',
      "A melancholy violinist in a burgundy gown plays alone in a candlelit chapel filled with red roses, tears catching the flame light. No readable text or logo.",
      "A raven-haired witch in black lace holds a single white rose in a moonlit garden where every other rose is black. No readable text or logo.",
    ]),
    study('Mecha Panel-Line Card', 'detailed mecha line art', 'mecha-panel', {
      aesthetic: 'Mecha panel-line card: anime mecha drawn with precise panel lines, vents, bolts and armor seams, cel shaded with crisp metallic highlights.',
      subject_treatment: `${keep}; render machines and armored figures with precise panel lines and mechanical detail.`,
      color_and_tone: 'Bold mecha color schemes of white, blue, red and yellow with metallic greys.',
      lighting_and_shadow: 'Crisp cel shadows and sharp metallic specular highlights.',
      texture_and_material: 'Panel seams, vents, bolts, decals without text and glowing sensor eyes.',
      camera_and_composition: "Low heroic angles emphasizing mecha scale, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with mechanical power and scale.',
      rendering_and_quality: 'Precise clean mechanical line art with consistent cel shading.',
      key_features: 'precise panel lines; vents and bolts; metallic highlights; heroic angles',
    }, ['organic sloppy lines', 'readable decals'], [
      "Floodlights glare across a hangar as a pilot climbs the ladder toward the open cockpit of a kneeling giant robot, every panel seam, vent and bolt drawn crisp. No readable text or logo.",
      "A small rabbit-shaped mech waters a vegetable garden on a space station, its vents puffing steam and its ear antennas twitching at every drop. No readable text or logo.",
      "Above a flooded city at dusk two armored giants duel, sparks flying from their plated panels as their reflections fight in the water below. No readable text or logo.",
    ]),
  ],
};

export default spec;
