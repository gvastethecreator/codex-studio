import type { Spec } from '../tools/apply';
import { au } from './_authors';

// 2000s classics, author pass: each preset names its creator, designer or studio adaptation and the
// concrete look of early digital television animation. Repeated works split manga art from anime.
const dig00 =
  'Early digital cel paint with clean thin lines, soft gradient highlights and digitally composited painted backgrounds.';

const spec: Spec = {
  pack: 'pack_16',
  category: '3. 2000s Classics',
  updates: Object.fromEntries([
    au('SP05-147', 'Toradora! - Winter Friction Romance', {
      look: 'J.C.Staff Toradora! television look (2008) with Masayoshi Tanaka designs: clean late-2000s romantic comedy cel, large bright eyes, winter school streets and warm lamplit apartments.',
      subject:
        'draw people with Tanaka designs, large bright eyes with crisp highlights, fine hair strands and winter coats and scarves.',
      color: 'Winter blue, snow white, warm lamp orange and scarf reds.',
      light: 'Cold winter daylight, warm streetlamps and soft glowing window light at night.',
      texture: dig00,
      camera: 'Romantic two-shots, snowy street wides and comic close-up reactions between rivals.',
      mood: 'prickly tender romance',
      render: 'Polished late-2000s romantic comedy television frame with bright clean designs.',
      key: 'Masayoshi Tanaka designs; winter romance; bright eyes; comic friction',
    }),
    au('SP05-149', 'Akira Amano - Clan Comedy Escalation', {
      look: 'Akira Amano Hitman Reborn! look: stylish mafia comedy with sharp elegant suits, spiky flame-lit hair, chaotic gag escalation that turns into dramatic flame battles.',
      subject:
        'draw people with Amano designs, slim stylish bodies, spiky hair, sharp suits and exaggerated gag faces.',
      color: 'Sky orange flames, black suits, crisp whites and warm family-home colors.',
      light: 'Warm household light that flips into dramatic flame-glow battle lighting.',
      texture: dig00,
      camera: 'Crowded gag compositions, sudden dramatic battle angles and family table shots.',
      mood: 'chaotic family escalation',
      render: 'Energetic 2000s shonen television frame with stylish mafia flair.',
      key: 'Akira Amano style; mafia suits; flaming hair; gag escalation',
    }),
    au('SP05-151', 'Kyoto Animation Haruhi - Pop Reality Bend', {
      look: 'Kyoto Animation The Melancholy of Haruhi Suzumiya look (2006): Noizi Ito designs animated with polished school realism, then reality bending into pop, flat bright shapes and closed spaces.',
      subject:
        'draw people with Noizi Ito designs, big clear eyes, neat hair ribbons, school uniforms and precise everyday acting.',
      color: 'Bright school colors, sky blue, pale grey closed-space tint and pop accents.',
      light: 'Clear school daylight, then flat eerie grey light when reality bends.',
      texture: dig00,
      camera: 'Everyday school framing interrupted by impossible warped perspective shots.',
      mood: 'playful uncanny whimsy',
      render: 'Precise 2006 Kyoto Animation television frame with reality-bending twists.',
      key: 'Noizi Ito designs; KyoAni polish; reality bending; closed spaces; pop whimsy',
      avoid: [
        'a yellow hair ribbon with an armband',
        'blue light giants in a grey city',
        'existing franchise characters',
      ],
    }),
    au('SP05-152', 'Hideaki Sorachi - Anachronistic Deadpan Mayhem', {
      look: 'Hideaki Sorachi Gintama look: Edo samurai streets full of spaceships, vending machines and aliens, lazy deadpan faces, sudden serious sword action and gag-style breaks.',
      subject:
        'draw people with Sorachi designs, dead-fish half-lidded eyes, natural perm hair, kimono mixed with modern items and deadpan poses.',
      color: 'Edo earth tones, kimono patterns, neon sci-fi accents and sky blue.',
      light:
        'Ordinary daylight for gags, dramatic moonlight and rim light for serious sword scenes.',
      texture: dig00,
      camera: 'Deadpan static comedy framing, then fast diagonal sword duel angles.',
      mood: 'deadpan anachronistic chaos',
      render: 'Energetic 2000s Sunrise television frame mixing gag art and serious action.',
      key: 'Hideaki Sorachi deadpan; Edo with spaceships; lazy eyes; gag-to-serious shifts',
      avoid: ['a silver-perm samurai with a wooden sword', 'existing franchise characters'],
    }),
    au('SP05-154', 'Blood+ - Clinical Nocturne Tactics', {
      look: 'Production I.G Blood+ television look (2005): sober realistic designs by Chizu Hashii, military bases, vampires and grand cities at night, cold clinical palettes and tragic duty.',
      subject:
        'draw people with Hashii realism, restrained faces, slender figures, military uniforms and dark formal clothes.',
      color: 'Cold blue, clinical white, deep crimson and night black.',
      light: 'Cold clinical light, moonlit exteriors and harsh red emergency light.',
      texture: dig00,
      camera: 'Measured compositions, tactical rooms, silhouettes in windows at night.',
      mood: 'cold tactical dread',
      render: 'Sober 2005 Production I.G television frame with realist restraint.',
      key: 'Production I.G realism; clinical night palette; vampires; tactical rooms',
    }),
    au('SP05-156', 'Higurashi - Summer Loop Paranoia', {
      look: 'Studio Deen Higurashi television look (2006): cute moe rural designs, cicada-heavy summer village, and sudden horror close-ups where pupils shrink and faces fill with shadow.',
      subject:
        'draw people with round cute moe designs, huge eyes that can shrink into pinpoint pupils, and summer village clothes.',
      color: 'Summer green, dusk orange, cicada heat haze and sudden deep red shadow.',
      light: 'Blazing summer light that switches to ominous dusk with faces half in black shadow.',
      texture: dig00,
      camera: 'Cheerful village wides turning into claustrophobic extreme close-ups of eyes.',
      mood: 'sweet paranoid dread',
      render: 'Mid-2000s Studio Deen television frame that shifts from cute to horror.',
      key: 'Higurashi moe to horror; shrinking pupils; cicada summer; dusk dread',
    }),
    au('SP05-157', 'Oh! Great - Vertical Speed Rebellion', {
      look: 'Oh! Great manga art as in Air Gear: hyper-detailed inked cityscapes, extreme fisheye perspective, sexy athletic figures, speed lines and graffiti-covered urban rooftops.',
      subject:
        'draw people with Oh! Great anatomy, lean athletic bodies, wild hair, detailed skate gear and extreme poses.',
      color: 'Black ink with screentone plus neon graffiti accents in color pages.',
      light: 'Hard urban light with dramatic ink shadows and glinting highlights.',
      texture: 'Dense inked detail, screentone, speed lines, graffiti and architectural rendering.',
      camera: 'Extreme fisheye and vertical perspective, figures leaping off buildings into sky.',
      mood: 'rebellious vertical velocity',
      render: 'Hyper-detailed manga illustration with extreme perspective and energy.',
      key: 'Oh! Great detail; fisheye perspective; skate rooftops; speed lines',
    }),
    au('SP05-159', 'Nana 2006 - Black-Lipstick Melodrama Punk', {
      look: 'Madhouse Nana television look (2006): Ai Yazawa designs in motion, punk fashion, cramped Tokyo apartments, rainy streets and emotional band melodrama.',
      subject:
        'draw people with Yazawa designs, tall slender bodies, long legs, heavy eyeliner, punk fashion and chokers.',
      color: 'Black, crimson, smoky grey and soft apartment pastels.',
      light: 'Rainy grey daylight, warm apartment lamps and stage spotlights.',
      texture: dig00,
      camera:
        'Fashion-shoot framing, cramped apartment interiors and smoky live stage performances.',
      mood: 'aching punk melodrama',
      render: 'Stylish 2006 Madhouse television frame with fashion-forward designs.',
      key: 'Ai Yazawa designs animated; punk fashion; rainy Tokyo; band melodrama',
    }),
    au('SP05-160', 'Ouran 2006 - Rose Elite Comedy', {
      look: 'BONES Ouran High School Host Club television look (2006): pink rose-petal backgrounds, sparkling bishonen, lavish academy salons and fast gag reaction shots.',
      subject:
        'draw people with elegant bishonen designs, slim bodies, sparkling eyes, tailored suits and comedic chibi reactions.',
      color: 'Rose pink, champagne gold, pastel lavender and crisp white.',
      light: 'Sparkling bright light with rose-petal glow and soft bloom.',
      texture: dig00,
      camera: 'Posed group portraits, sudden gag close-ups and salon wides.',
      mood: 'lavish comedic flirtation',
      render: 'Glossy 2006 BONES television frame with sparkle and rose backgrounds.',
      key: 'Ouran rose backgrounds; sparkling bishonen; lavish salons; gag reactions',
    }),
    au('SP05-024', 'Fullmetal Alchemist Brotherhood - Alchemical Moral Geometry', {
      look: 'BONES Fullmetal Alchemist: Brotherhood television look (2009): clean confident designs from Hiromu Arakawa, transmutation circles flaring blue, European industrial towns and war-scarred drama.',
      subject:
        'draw people with Arakawa-derived designs, sturdy bodies, clear expressive faces, coats, uniforms and automail limbs.',
      color: 'Military blue, brick red, alchemy cyan and dusty ochre.',
      light: 'Blue-white alchemy flashes, warm lamplight and harsh desert sun.',
      texture: dig00,
      camera: 'Dynamic action with circle compositions, drawn from above and at ground level.',
      mood: 'earnest moral struggle',
      render: 'Crisp 2009 BONES television frame with dynamic action animation.',
      key: 'FMA Brotherhood; transmutation circles; automail; military uniforms',
      avoid: [
        'a short blond alchemist in a red coat with a metal arm',
        'a suit of empty armor',
        'existing franchise characters',
      ],
    }),
    au('SP05-026', 'Code Geass - Operatic Rebellion Strategy', {
      look: 'Sunrise Code Geass television look (2006) with CLAMP designs: extremely tall slender figures, long thin limbs, theatrical poses, royal empire uniforms and knightmare frames.',
      subject:
        'draw people with CLAMP proportions, very long legs, narrow faces, sharp eyes and ornate uniforms with high collars.',
      color: 'Imperial purple, glossy black, royal gold and deep crimson accents.',
      light: 'Dramatic stage-like lighting, eye glows and flames behind silhouettes.',
      texture: dig00,
      camera: 'Theatrical hand-pointing poses, low angles and chess-piece symbolism.',
      mood: 'grand operatic defiance',
      render: 'Dramatic 2006 Sunrise television frame with CLAMP elegance.',
      key: 'CLAMP proportions; theatrical poses; imperial uniforms; chess symbolism',
      avoid: [
        'a black helmeted mask with a pointed crest',
        'a red bird-shaped eye sigil',
        'existing franchise characters',
      ],
    }),
    au('SP05-027', 'Gurren Lagann - Spiral Overdrive Bravado', {
      look: 'Hiroyuki Imaishi and Gainax Gurren Lagann look (2007): Atsushi Nishigori designs, sharp angular faces, jagged drill motifs, loose rough action animation and ever-escalating scale.',
      subject:
        'draw people with Nishigori designs, angular faces, pointed teeth, wild hair and sunglasses, in bold heroic poses.',
      color: 'Hot red, drill yellow, sky blue and spiral green.',
      light: 'Blazing heroic backlight, spiral energy glow and explosion flashes.',
      texture: dig00,
      camera: 'Extreme perspective, escalating scale from ground to galaxy, heroic pose stills.',
      mood: 'boundless defiant bravado',
      render: 'Raw energetic 2007 Gainax frame with loose rough action lines.',
      key: 'Imaishi action; Nishigori designs; drills and spirals; escalating scale',
      avoid: [
        'a spiky-haired rebel with a cape and flaming sunglasses',
        'a tiny drill-headed robot',
        'existing franchise characters',
      ],
    }),
    au('SP05-030', 'Soul Eater - Gothic Soul-Pop Action', {
      look: 'BONES Soul Eater television look (2008): Atsushi Ohkubo designs, Tim Burton-like crooked city, grinning sun and moon, stark black shapes and punk gothic pop.',
      subject:
        'draw people with Ohkubo designs, triangular grins with pointed teeth, lanky bodies, punk gothic clothes and stitched details.',
      color: 'Black, blood red, bone white and acid yellow.',
      light: 'Flat graphic shadows, glowing grinning sun and moon, stark silhouettes.',
      texture: dig00,
      camera: 'Crooked Dutch angles, rooftop leaps and crooked architecture.',
      mood: 'playful gothic mischief',
      render: 'Graphic 2008 BONES television frame with gothic pop flair.',
      key: 'Atsushi Ohkubo grins; crooked city; grinning sun and moon; gothic pop',
      avoid: ['a scythe-weapon partner with white hair', 'existing franchise characters'],
    }),
    au('SP05-141', 'Hellsing TV - Gothic Resonance Punk', {
      look: 'Gonzo Hellsing television look (2001): gothic punk vampire action with heavy red and black design, long coats, ruined churches, lurid lighting and early digital grain.',
      subject:
        'draw people with Gonzo designs, tall lean figures, long coats, sharp teeth and hair shadowing the eyes.',
      color: 'Blood red, black, ash grey and cold moon blue.',
      light: 'Lurid red and moonlit blue light, harsh shadows and gunfire flashes.',
      texture: dig00,
      camera: 'Low gothic angles, churches and alleys, silhouettes against huge moons.',
      mood: 'lurid gothic menace',
      render: 'Moody early-2000s Gonzo television frame with digital grain.',
      key: 'Gonzo gothic punk; red and black; ruined churches; vampire menace',
      avoid: [
        'a vampire in a red greatcoat and round orange glasses',
        'existing franchise characters',
      ],
    }),
    au('SP05-145', 'Eureka Seven - Sky-Surf Romantic Momentum', {
      look: 'BONES Eureka Seven television look (2005) with Kenichi Yoshida designs: airy sky-surfing, boards riding trapar waves, soft pastels, big skies and youth romance.',
      subject:
        'draw people with Yoshida designs, clean simple faces, lanky teens and adults in streetwear and flight gear.',
      color: 'Sky cyan, pastel green, sunset peach and trapar glow.',
      light: 'Big open sky light, trapar wave glow and golden sunsets.',
      texture: dig00,
      camera: 'Sweeping aerial shots, surfing arcs across clouds and cockpit views.',
      mood: 'buoyant youthful momentum',
      render: 'Airy 2005 BONES television frame with open-sky freedom.',
      key: 'Kenichi Yoshida designs; sky surfing; pastel skies; trapar waves',
    }),
    au('SP05-146', 'Yana Toboso - Velvet Covenant Gothic', {
      look: 'Yana Toboso Black Butler look: Victorian gothic manga art, elegant tailcoats, lace and velvet, demonic contracts, candlelit manors and fine ornamental detail.',
      subject:
        'draw people with Toboso designs, slender elegant bodies, sharp eyes, Victorian formal clothes and gloved hands.',
      color: 'Black velvet, deep crimson, candle gold and bone white.',
      light: 'Flickering candlelight, deep manor shadows and small demonic red eye glints.',
      texture: 'Fine ink linework, lace and embroidery detail, screentone and gothic ornament.',
      camera: 'Formal manor compositions, elegant close-ups and staircase scenes.',
      mood: 'elegant sinister devotion',
      render: 'Refined gothic manga illustration with Victorian ornamental detail.',
      key: 'Yana Toboso Victorian gothic; tailcoats; candlelight; demonic contract',
      avoid: [
        'a black-haired demon butler with a pentagram on the hand',
        'a boy earl with an eyepatch',
        'existing franchise characters',
      ],
    }),
    au('SP05-150', 'Shakugan no Shana - Crimson Threshold Embers', {
      look: 'J.C.Staff Shakugan no Shana television look (2005) with Noizi Ito designs: school streets frozen inside sealed fire domes, blazing crimson hair and eyes, and falling embers.',
      subject:
        'draw people with Noizi Ito designs, big bright eyes, long hair turning crimson in battle and school or coat clothes.',
      color: 'Crimson flame, black, ember orange and sealed-space grey.',
      light: 'Ember glow and flaming hair light in a frozen grey sealed world.',
      texture: dig00,
      camera: 'Frozen crowds, swordfights on rooftops and flame trails across the sky.',
      mood: 'fiery resolute intensity',
      render: 'Vivid 2005 J.C.Staff television frame with ember effects.',
      key: 'Noizi Ito designs; crimson flames; sealed spaces; falling embers',
      avoid: [
        'a red-haired flame-haze girl with a black coat and katana',
        'existing franchise characters',
      ],
    }),
    au('SP05-153', 'Katsura Hoshino - Techno-Gothic Exorcism', {
      look: 'Katsura Hoshino D.Gray-man look: gothic exorcist manga art, elaborate coats with silver trims, crosses, clowns and akuma machines, fine lines and dramatic black shapes.',
      subject:
        'draw people with Hoshino designs, slender elegant figures, delicate faces, long uniform coats and dramatic hair.',
      color: 'Black coats, silver trim, crimson accents and cold stained-glass colors.',
      light: 'Stained-glass light, dark cathedrals and glowing weapon effects.',
      texture: 'Fine elegant ink lines, ornamental coat trims, screentone and gothic detail.',
      camera: 'Dramatic diagonal compositions, cathedral interiors and machine demons.',
      mood: 'haunted gothic resolve',
      render: 'Elegant gothic manga illustration with dramatic black-and-white design.',
      key: 'Katsura Hoshino gothic; exorcist coats; cathedrals; machine demons',
      avoid: [
        'a white-haired exorcist with a scar and a cursed red arm',
        'existing franchise characters',
      ],
    }),
    au('SP05-155', 'Familiar of Zero - Noble Arcane Romcom', {
      look: 'J.C.Staff The Familiar of Zero television look (2006) with Eiji Usatsuka designs: bright pastel fantasy academy, cloaks and wands, tsundere slapstick and glossy anime eyes.',
      subject:
        'draw people with Usatsuka designs, big glossy eyes, pastel hair colors, academy cloaks and exaggerated flustered reactions.',
      color: 'Pastel pink, academy navy, sky blue and castle stone cream.',
      light: 'Bright fantasy daylight, magic sparkles and slapstick explosion flashes.',
      texture: dig00,
      camera: 'Academy courtyard wides, slapstick reaction close-ups and magic duels.',
      mood: 'flustered comic romance',
      render: 'Bright mid-2000s light novel adaptation television frame with glossy eyes.',
      key: 'Eiji Usatsuka designs; pastel academy; wands and cloaks; tsundere slapstick',
    }),
    au('SP05-158', 'Yuki Urushibara - Ecological Whisper Healing', {
      look: 'Yuki Urushibara Mushishi manga art: soft brush and pen lines, loose natural ink washes, quiet mountain villages and strange translucent life forms drawn with folk simplicity.',
      subject:
        'draw people with Urushibara simplicity, quiet plain faces, loose hair, rural clothes and calm unhurried gestures.',
      color: 'Muted greens, earth browns and pale watercolor washes like her color pages.',
      light: 'Soft natural forest light and faint glowing life forms.',
      texture: 'Brush-pen lines, ink washes, watercolor bleeding and paper texture.',
      camera: 'Quiet contemplative panels of forests, rivers and villages.',
      mood: 'hushed healing calm',
      render: 'Gentle hand-drawn manga illustration with watercolor softness and quiet restraint.',
      key: 'Yuki Urushibara brushwork; watercolor pages; forest life forms; quiet villages',
    }),
  ]),
};

export default spec;
