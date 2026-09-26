import type { Spec } from '../tools/apply';
import { au } from './_authors';

// 90s golden era, author pass: each preset names its creator, director or series and the concrete
// look of late analog cel. Works that repeat are split into manga-author look and anime look.
const cel90 =
  'Late analog hand-painted cel over painted backgrounds, subtle film grain, soft cel edge halation.';

const spec: Spec = {
  pack: 'pack_16',
  category: '2. 90s Golden Era',
  updates: Object.fromEntries([
    au('SP05-011', 'Masami Obari - Generational Aura Clash', {
      look: 'Masami Obari nineties fighting OVA look: extreme heroic posing, sharp angular muscular anatomy, glossy highlights, flaring auras and speed backgrounds in explosive battle films.',
      subject:
        'draw people with Obari anatomy, sharp chins, pointed noses, taut muscles with glossy highlight streaks and extreme contrapposto poses.',
      color: 'Saturated sunset orange, electric blue auras and deep violet shadows.',
      light: 'Blazing aura backlight, sharp rim light and hard glossy highlight shapes on muscles.',
      texture: cel90,
      camera:
        'Low dramatic angles, extreme foreshortened fists and famous obari poses facing the lens.',
      mood: 'hot-blooded explosive rivalry',
      render: 'Glossy 1990s fighting OVA frame with sharp dramatic anatomy and highlights.',
      key: 'Masami Obari poses; glossy highlights; sharp anatomy; blazing auras',
    }),
    au('SP05-012', 'Ojamajo Doremi - Sparkling Magical Chorus', {
      look: 'Toei late-nineties magical girl television look as in Ojamajo Doremi: round chibi-proportioned designs, huge eyes, candy-colored costumes and sparkling transformation sequences.',
      subject:
        'draw people with rounded chibi-leaning proportions, big round heads, large sparkly eyes and candy costumes, even when adults.',
      color: 'Candy pink, lemon yellow, mint and sky blue with sparkles.',
      light: 'Bright cheerful light with sparkle bursts and glittering transformation glow.',
      texture: cel90,
      camera: 'Transformation spins, lineup group poses and bouncy comedic framing with sparkles.',
      mood: 'sweet sparkling cheer',
      render: 'Bright late-1990s television cel frame with round cute design clarity.',
      key: 'Toei magical girl; round chibi designs; candy costumes; sparkling transformations',
    }),
    au('SP05-014', 'Cowboy Bebop - Jazzy Space-Noir Melancholy', {
      look: 'Shinichiro Watanabe and Toshihiro Kawamoto look of Cowboy Bebop (1998): lanky stylish designs, lived-in rusty ships, film noir lighting, smoke and jazz, and worn retro-future cities.',
      subject:
        'draw people with Kawamoto designs, long lanky limbs, loose hair, narrow eyes, sharp noses and slouched cool postures in worn clothes.',
      color: 'Muted teal, cigarette amber, rust brown and noir shadow.',
      light: 'Noir chiaroscuro with smoky light shafts, neon signs and dim cockpit glow.',
      texture: cel90,
      camera: 'Cinematic noir framing, low angles in rain, long lens compositions.',
      mood: 'cool melancholy drift',
      render: 'Polished 1998 Sunrise television frame with cinematic noir grading.',
      key: 'Kawamoto lanky designs; film noir; rusty ships; smoke and jazz; retro-future',
      avoid: [
        'a green-haired bounty hunter in a blue suit',
        'a red swordfish spaceship',
        'existing franchise characters',
      ],
    }),
    au('SP05-015', 'Masamune Shirow - Philosophical Cyber-Ops Vertigo', {
      look: 'Masamune Shirow manga art as in his Ghost in the Shell and Appleseed books: meticulous cyberpunk mechanics, cute-strong athletic women, dense tech detail and early digital color pages.',
      subject:
        'draw people with Shirow designs, athletic curvy bodies, round expressive faces, plugs and cables, tactical gear and exposed cyborg joints.',
      color: 'Early digital airbrush colors, metallic blues, skin warms and neon greens.',
      light: 'Glossy airbrushed highlights, screen glow and hard metallic reflections.',
      texture: 'Precise pen linework, dense mechanical detail, airbrushed digital color gradients.',
      camera: 'Dynamic action panels with tech cutaways and busy mechanical backgrounds.',
      mood: 'cerebral tactical intensity',
      render: 'Meticulous manga illustration with dense technical detail and airbrush color.',
      key: 'Masamune Shirow mechanics; athletic cyborgs; dense tech detail; airbrush color',
      avoid: [
        'a purple-haired cyborg major in a thermoptic suit',
        'spider-tank robots with pod heads',
        'existing franchise characters',
      ],
    }),
    au('SP05-016', 'Yoshihiro Togashi - Spirit Tournament Pressure', {
      look: 'Yoshihiro Togashi manga look as in Yu Yu Hakusho: sharp confident brush-pen lines, stylish delinquent heroes, eerie demons and shifting between clean and rough inking.',
      subject:
        'draw people with Togashi designs, slick hair, sharp eyes, lean bodies, school uniforms and eerie demon faces.',
      color: 'Black ink with grey screentone and occasional muted red.',
      light: 'Stark ink shadows, eerie glow from spirit energy and moonlight.',
      texture: 'Confident brush-pen line, screentone, rough sketchy inking in intense panels.',
      camera: 'Tense manga panel close-ups, dynamic tournament stances, eerie wide shots.',
      mood: 'tense eerie competition',
      render: 'Stylish black-and-white shonen manga illustration with sharp inking.',
      key: 'Togashi brush-pen; delinquent heroes; eerie demons; screentone; manga panels',
    }),
    au('SP05-017', 'Trust and Betrayal - Wandering Atonement Cel Drama', {
      look: 'Kazuhiro Furuhashi OVA look of Rurouni Kenshin: Trust and Betrayal (1999): realistic painterly period drama, muted Kyoto palettes, blood-red accents on snow and live-action cinematography.',
      subject:
        'draw people with realistic proportions, restrained faces, period kimono and hakama, and deeply serious expressions.',
      color: 'Muted earth browns, snow white, ink black and stark blood-red accents.',
      light: 'Soft natural light, overcast snow, candle-lit interiors and deep shadows.',
      texture: 'Painterly cel with watercolor textures, live-action inserts feel and snowfall.',
      camera: 'Cinematic still compositions, long silences and snow-covered wide landscape shots.',
      mood: 'somber atoning restraint',
      render: 'Mature painterly 1999 OVA frame with cinematic realism.',
      key: 'Trust and Betrayal realism; muted period Kyoto; snow; restrained drama',
      avoid: [
        'a red-haired swordsman with a cross-shaped cheek scar',
        'a reverse-blade sword',
        'existing franchise characters',
      ],
    }),
    au('SP05-018', 'Yasuhiro Nightow - Dusty Space-Western Absurdity', {
      look: 'Yasuhiro Nightow manga look as in Trigun: scratchy energetic pen lines, dense mechanical guns, flapping coats, desert grit and gags breaking into super-deformed faces.',
      subject:
        'draw people with Nightow designs, lanky figures, spiky hair, dramatic coats and grimacing or goofy faces.',
      color: 'Black ink with grey screentone and dusty sepia washes.',
      light: 'Harsh desert sun rendered with hard ink shadows and speckled textures.',
      texture: 'Scratchy pen lines, dense crosshatching, speed lines and sand grit.',
      camera: 'Dynamic manga angles, extreme perspective guns, sudden comic panels.',
      mood: 'dusty absurd heroism',
      render: 'Energetic black-and-white manga illustration with scratchy density and speed lines.',
      key: 'Yasuhiro Nightow scratchy line; desert grit; big coats; super-deformed gags',
      avoid: [
        'a spiky blond gunman in a red coat and round sunglasses',
        'existing franchise characters',
      ],
    }),
    au('SP05-161', 'Dragon Ball Z - Planetary Aura Impact', {
      look: 'Toei Animation Dragon Ball Z television look (1989-1996): Minoru Maeda and Tadayoshi Yamamuro muscular designs, golden flaming auras, rocky wastelands and planet-cracking impacts.',
      subject:
        'draw people with DBZ muscular designs, sharp angular eyes, square jaws, spiky hair and gi-like clothes torn by battle.',
      color: 'Aura gold, sky blue, orange gi tones and rocky tan.',
      light: 'Flaming aura glow, energy beam flashes and impact bursts.',
      texture: cel90,
      camera: 'Wide explosion shots, speed-line clashes, low power-up angles.',
      mood: 'titanic power escalation',
      render: 'Bold 1990s Toei television frame with sharp muscular aura effects.',
      key: 'DBZ muscles; golden aura; rocky wastelands; energy beams; impact bursts',
      avoid: [
        'orange gi with a kanji emblem',
        'golden spiky super-saiyan hair',
        'existing franchise characters',
      ],
    }),
    au('SP05-163', 'Yoshiaki Kawajiri - Smoke-Jazz Noir Cool', {
      look: 'Yoshiaki Kawajiri Madhouse direction as in Ninja Scroll and Wicked City: slick realistic adult designs, deep shadows, smoky noir cities, long cool poses and bursts of violence.',
      subject:
        'draw people with Kawajiri realism, long elegant limbs, sharp cheekbones, narrow eyes and dark stylish clothes.',
      color: 'Deep blacks, smoky amber, noir blue and sharp red accents.',
      light: 'Hard-edged noir shadows, streetlight shafts through smoke, silhouettes.',
      texture: cel90,
      camera: 'Cool silhouetted compositions, long lens shots and rain-lit streets.',
      mood: 'slick smoky menace',
      render: 'Dark sophisticated Madhouse OVA frame with deep shadow design.',
      key: 'Yoshiaki Kawajiri noir; deep shadows; smoky cities; elegant adult designs',
    }),
    au('SP05-164', 'Ghost in the Shell 1995 - Wet Techno-Noir Consciousness', {
      look: 'Mamoru Oshii film Ghost in the Shell (1995) with Hiroyuki Okiura designs: realistic sober characters, rain-soaked Hong Kong-like cityscapes, green-tinted grading and philosophical stillness.',
      subject:
        'draw people with Okiura realism, calm serious faces, grounded anatomy and practical tactical clothing.',
      color: 'Green-tinted grading, wet grey, teal neon and dim amber.',
      light: 'Diffuse rainy light, reflections in canals and cold monitor glow.',
      texture: cel90,
      camera:
        'Long contemplative shots of the city, reflections, ferry rides and still observation.',
      mood: 'quiet contemplative techno-noir',
      render: 'Precise 1995 Production I.G feature frame with cinematic realism.',
      key: 'Oshii stillness; Okiura realism; wet city; green grading; reflections',
      avoid: ['a purple-haired cyborg major in a thermoptic suit', 'existing franchise characters'],
    }),
    au('SP05-165', 'Yu Yu Hakusho - Spirit Pressure Rivalry', {
      look: 'Studio Pierrot Yu Yu Hakusho television look (1992): sharp nineties shonen designs, spirit energy blasts, demon tournaments and moody color-keyed night scenes.',
      subject:
        'draw people with nineties Pierrot designs, sharp eyes, slick hair, school uniforms and demon features.',
      color: 'Spirit blue, blood red, night purple and school-uniform green.',
      light: 'Spirit energy glow, moonlit rooftops and color-keyed dramatic lighting.',
      texture: cel90,
      camera: 'Standoff compositions, energy blasts toward the lens, dramatic close-ups.',
      mood: 'fierce spirited rivalry',
      render: 'Classic early-1990s shonen television cel frame with energy effects.',
      key: 'Pierrot nineties shonen; spirit blasts; demon tournament; moody color keys',
      avoid: [
        'a green school uniform delinquent with slicked hair',
        'existing franchise characters',
      ],
    }),
    au('SP05-166', 'Rurouni Kenshin TV - Redemption Restraint', {
      look: 'Studio Gallop Rurouni Kenshin television look (1996): bright nineties cel, Meiji-era Tokyo streets, graceful sword action with speed lines, warm humor and melancholy.',
      subject:
        'draw people with nineties shonen designs, large eyes, flowing hair, kimono, hakama and Meiji Western clothes.',
      color: 'Warm Meiji earth tones, indigo, crimson and cherry blossom pink.',
      light: 'Warm daylight, sunset silhouettes and dramatic sword flash highlights.',
      texture: cel90,
      camera: 'Sword duel framing with speed lines, street scenes and sunset silhouettes.',
      mood: 'gentle wistful redemption',
      render: 'Bright 1996 television cel frame with graceful sword action.',
      key: 'Kenshin TV cel; Meiji streets; speed-line sword action; warm melancholy',
      avoid: [
        'a red-haired swordsman with a cross-shaped cheek scar',
        'a reverse-blade sword',
        'existing franchise characters',
      ],
    }),
    au('SP05-167', 'Outlaw Star - Engine-Trail Outlaw Adventure', {
      look: 'Sunrise Outlaw Star television look (1998): late-nineties space adventure, glossy ship interiors, grappler ship arms, magic-tech guns and colorful alien frontier towns.',
      subject:
        'draw people with late-nineties Sunrise designs, spiky hair, big expressive eyes, jackets and adventurer gear.',
      color: 'Bright space teal, engine orange, desert tan and chrome.',
      light: 'Engine flares, cockpit glow and harsh frontier sunlight.',
      texture: cel90,
      camera: 'Chase shots with engine trails, cockpit views and frontier town wides.',
      mood: 'rollicking outlaw adventure',
      render: 'Energetic late-1990s Sunrise television frame with space adventure color.',
      key: 'Outlaw Star adventure; engine trails; frontier towns; magic-tech guns',
    }),
    au('SP05-169', 'Serial Experiments Lain - Wired Identity Dissolution', {
      look: 'Yoshitoshi ABe designs and Ryutaro Nakamura direction as in Serial Experiments Lain (1998): eerie suburban stillness, humming power lines, red-dotted shadows and digital glitch dissolution.',
      subject:
        'draw people with ABe designs, thin delicate lines, small quiet faces, bob haircuts and plain clothes.',
      color: 'Washed-out whites, power-line grey, CRT blue and red speckled shadows.',
      light: 'Harsh washed-out sunlight, shadows filled with red dots, monitor glow in dark rooms.',
      texture: 'Thin line cel, digital glitch artifacts, noise and CRT scanlines.',
      camera: 'Static uneasy framing, power lines crossing the sky, isolated figures.',
      mood: 'eerie wired dissociation',
      render: 'Unsettling 1998 television frame with digital glitch atmosphere.',
      key: 'Yoshitoshi ABe designs; power lines; red-dot shadows; CRT glitch; eerie stillness',
    }),
    au('SP05-170', 'Cardcaptor Sakura - Storybook Seal Magic', {
      look: 'CLAMP designs animated by Madhouse in Cardcaptor Sakura (1998): elegant elongated shojo figures, huge glossy eyes, ornate costumes, magic circles and floral storybook ornament.',
      subject:
        'draw people with CLAMP and Madhouse designs, long limbs, huge glossy eyes, fluttering hair and ornate magical costumes.',
      color: 'Pastel pink, gold, lilac and soft sky blue.',
      light: 'Soft magical glows, sparkles and moonlit bedroom light.',
      texture: cel90,
      camera: 'Graceful spinning poses, magic circle compositions, storybook frames.',
      mood: 'gentle sparkling wonder',
      render: 'Polished late-1990s Madhouse television frame with ornate shojo detail.',
      key: 'CLAMP elegance; magic circles; ornate costumes; pastel sparkle; storybook',
      avoid: [
        'a sealing wand with a star head',
        'a yellow winged plush guardian',
        'existing franchise characters',
      ],
    }),
    au('SP05-173', 'Trigun 1998 - Dust-Warm Pacifist Melancholy', {
      look: 'Madhouse Trigun television look (1998): late-nineties cel with desert frontier towns, warm dusty sunsets, bright character colors and a melancholy that sneaks under slapstick.',
      subject:
        'draw people with nineties Madhouse designs, lanky bodies, expressive faces, long coats and dusty frontier clothes.',
      color: 'Desert amber, dusty sky blue, sunset orange and bright costume color accents.',
      light: 'Hot desert sunlight, long dusk shadows and warm saloon lamps.',
      texture: cel90,
      camera: 'Wide frontier towns, low gunfight angles and dusk silhouettes.',
      mood: 'warm dusty melancholy',
      render: 'Warm late-1990s Madhouse television frame with desert light.',
      key: 'Trigun anime desert; dusky frontier; lanky designs; warm melancholy',
      avoid: [
        'a spiky blond gunman in a red coat and round sunglasses',
        'existing franchise characters',
      ],
    }),
    au('SP05-174', 'Battle Angel OVA - Iron Ruin Tragedy', {
      look: 'Madhouse Battle Angel OVA look (1993) with Nobuteru Yuki designs: rusted scrapyard city beneath a floating city, detailed cyborg bodies, somber early-nineties cel and tragic romance.',
      subject:
        'draw people with Nobuteru Yuki designs, large soulful eyes, slender cyborg bodies with mechanical joints and ragged clothes.',
      color: 'Rust orange, steel blue, grime brown and pale sky light.',
      light: 'Diffuse industrial light, sparks and backlight from the floating city.',
      texture: cel90,
      camera: 'Scrapyard wides under the hanging city, close-ups on mechanical parts.',
      mood: 'tragic rusted longing',
      render: 'Somber early-1990s OVA frame with detailed cyborg mechanics.',
      key: 'Nobuteru Yuki designs; scrapyard city; cyborg bodies; rust; tragedy',
    }),
    au('SP05-175', 'Revolutionary Girl Utena - Rose Ritual Symbolism', {
      look: 'Kunihiko Ikuhara and Chiho Saito look of Revolutionary Girl Utena (1997): elegant shojo designs, princely uniforms, rose motifs, surreal architecture, shadow-puppet interludes and ritual duels.',
      subject:
        'draw people with Chiho Saito designs, long elegant limbs, flowing hair, sharp lashes and princely uniforms.',
      color: 'Rose pink, crimson, gold and pale lavender sky.',
      light: 'Theatrical spotlights, rose petal glows and surreal skies.',
      texture: cel90,
      camera: 'Symmetrical staging, repeated stock shots, surreal staircases and arenas.',
      mood: 'ritual theatrical symbolism',
      render: 'Stylized late-1990s J.C.Staff television frame with theatrical rose symbolism.',
      key: 'Ikuhara ritual; Chiho Saito designs; roses; surreal arenas; princely uniforms',
      avoid: [
        'a pink-haired girl in a boys uniform',
        'a floating upside-down castle',
        'existing franchise characters',
      ],
    }),
    au('SP05-179', 'Takehiko Inoue - Warm Rivalry Portrait', {
      look: 'Takehiko Inoue manga look from Slam Dunk to Vagabond: realistic athletic anatomy, confident brush ink, expressive sweat and grit, and portraits full of pride and camaraderie.',
      subject:
        'draw people with Inoue realism, accurate athletic bodies, expressive faces, sweat and real hair.',
      color: 'Black ink with grey washes and occasional warm watercolor.',
      light: 'Natural light carried by ink wash values, bright highlights on sweat.',
      texture: 'Brush ink lines, dry brush, ink wash and watercolor bleed.',
      camera: 'Portrait close-ups, sports and duel moments frozen with realistic weight.',
      mood: 'proud warm rivalry',
      render: 'Masterful realist brush-ink manga illustration with painterly finish.',
      key: 'Takehiko Inoue realism; brush ink; athletic anatomy; sweat and grit',
    }),
    au('SP05-180', 'Gunsmith Cats - Precision Action Cel', {
      look: 'Kenichi Sonoda Gunsmith Cats OVA look (1995): precise detailed firearms and cars, clean cute-sexy designs, American city settings and crisp action choreography.',
      subject:
        'draw people with Sonoda designs, clean detailed faces, athletic bodies, casual nineties clothes and precise mechanical props.',
      color: 'Urban grey, brick red, denim blue and chrome.',
      light: 'Muzzle flash light, streetlight glow and bright daylight on cars.',
      texture: cel90,
      camera: 'Precise action framing, detailed gun and car close-ups, chase shots.',
      mood: 'crisp kinetic precision',
      render: 'Crisp detailed 1995 OVA frame with mechanical precision.',
      key: 'Kenichi Sonoda precision; detailed guns and cars; American cities; crisp action',
    }),
  ]),
};

export default spec;
