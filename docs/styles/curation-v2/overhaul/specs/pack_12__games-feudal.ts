import type { Spec } from '../tools/apply';
import { ga, keep } from './_authors';

// Video game pass, graphic and feudal gameplay: each preset names its game, studio and year and
// states the real render technique and camera. The pistol-and-greatsword hunter brief is replaced.
// SP12-087 to SP12-092 are intentional-v1 presets with their own policy and stay out of this pass.
const spec: Spec = {
  pack: 'pack_12',
  category: '10. Graphic & Feudal Gameplay',
  updates: Object.fromEntries([
    ga('SP12-193', 'Samurai Shodown 2019 - SNK Ink Cel Duel', {
      look: 'SNK Samurai Shodown (2019) look: 3D weapon fighting rendered with ink-brushed cel shading, falling leaves, dramatic ink-splash slashes and feudal Japanese stages.',
      subject: 'render people as ink-outlined cel-shaded samurai in flowing clothing.',
      color: 'Maple red, ink black and parchment.',
      light: 'Bold toon light with ink-brushed shadows and maple leaves in the air.',
      texture: 'Ink-brush outlines and flat cel fills on flowing clothing.',
      camera: 'Side-on duel camera.',
      mood: 'tense single-strike duel',
      render:
        'A 2019 frame at 1920 by 1080 from the side: two samurai dueling, health bar shapes across the top.',
      key: 'Samurai Shodown ink cel; maple leaves; duel',
      avoid: ['existing Samurai Shodown fighters'],
    }),
    ga('SP12-194', 'Sumioni 2012 - Acquire Ink Brush Brawler', {
      look: 'Acquire Sumioni: Demon Arts (2012) look: side-view action painted in sumi-e ink on rice paper, drawn ink platforms, red accents and ink-blot demons.',
      subject: 'render people as ink-brush figures with red accents.',
      color: 'Ink black, rice paper and red.',
      light: 'Flat paper light with no shading beyond ink density.',
      texture: 'Wet black ink brush strokes on rice paper, with small red accents.',
      camera: 'Side-view brawler.',
      mood: 'swift painted fury',
      render:
        'A 2012 PlayStation Vita side-view frame at 960 by 544: ink-brush figure fighting on paper, an ink gauge shape.',
      key: 'Sumioni ink; rice paper; red accents',
    }),
    ga('SP12-195', 'Devil May Cry 5 2019 - Capcom Style Combo', {
      look: 'Capcom Devil May Cry 5 (2019) look: photoreal stylish action, gothic cities, air juggles, flashy weapon trails, demons and style meter swagger.',
      subject: 'render people as stylish demon hunters in long coats.',
      color: 'Gothic red, black and neon trails.',
      light: 'Dramatic gothic night light with glowing weapon trails.',
      texture: 'Photoreal leather and stone with sharp detail and bright effects.',
      camera: 'Third-person combo view.',
      mood: 'cocky stylish mayhem',
      render:
        'A 2019 frame at 1920 by 1080 in third person: demon hunter mid-combo, a style rank letter shape at the right.',
      key: 'DMC5 combos; weapon trails; gothic city',
      avoid: [
        'a white-haired hunter in a red coat with twin pistols',
        'a greatsword and twin pistols',
      ],
      briefs: [
        'Juggling three demons mid-air with a chainsaw umbrella and a flintlock, an original stylish hunter flips over a stained-glass window as it shatters around him. No readable text or logo.',
        keep('SP12-195')[1],
        keep('SP12-195')[2],
      ],
    }),
    ga('SP12-196', 'Ghost of Tsushima 2020 - Sucker Punch Wind and Leaves', {
      look: 'Sucker Punch Ghost of Tsushima (2020) look: third-person samurai open world with guiding wind, fields of pampas grass and flowers, falling leaves and painterly color.',
      subject: 'render people as samurai and Mongol riders in period armor.',
      color: 'Pampas gold, maple red and sky.',
      light: 'Golden painterly light with wind sweeping through grass.',
      texture: 'Realistic grass fields, cloth and armor, with leaves blowing across the view.',
      camera: 'Third-person riding view.',
      mood: 'windswept poetic combat',
      render:
        'A 2020 frame at 1920 by 1080 in third person: samurai in a pampas field, no interface except a small bar.',
      key: 'Tsushima wind; pampas fields; falling leaves',
      avoid: ['a samurai with a white ghost mask'],
    }),
    ga('SP12-197', 'Tenchu Stealth Assassins 1998 - Acquire PS1 Fog Ninja', {
      look: 'Acquire Tenchu: Stealth Assassins (1998) look: PlayStation ninja stealth on moonlit rooftops with blocky ninja, a thick fog wall and a soft jagged image.',
      subject:
        'show people as blocky ninja with simple painted faces, built from a few flat panels.',
      color: 'Night blue fog and moon.',
      light: 'Pale moonlight and a thick fog wall a short distance away.',
      texture:
        'Blurry textures that wobble on flat panels, simple boxy rooftops and walls fading into fog.',
      camera: 'Third-person rooftop view.',
      mood: 'silent deadly patience',
      render:
        'A 1998 PlayStation frame at 320 by 240 on a CRT: soft, jagged and foggy, a small awareness meter shape at the bottom.',
      key: 'Tenchu fog wall; blocky ninja; rooftops; soft PS1',
    }),
    ga('SP12-198', 'Age of Empires II 1999 - Ensemble Isometric Siege', {
      look: 'Ensemble Studios Age of Empires II (1999) look: isometric sprite RTS of medieval armies, castles, siege towers and rams, bright painted terrain.',
      subject:
        'show people as tiny unit sprites seen from high on the diagonal, each only a few dozen pixels tall.',
      color: 'Grass green, castle stone and team colors.',
      light: 'Bright even daylight with small crisp shadows.',
      texture:
        'Tiny rendered-then-shrunk sprites of units and buildings, grainy grass and water tiles.',
      camera: 'High isometric RTS view.',
      mood: 'grand strategic siege',
      render:
        'A 1999 PC frame at 1024 by 768: tiny castle and army on a diagonal map, a carved panel and minimap diamond at the bottom.',
      key: 'AoE II tiny sprites; diagonal map; siege; castles',
    }),
    ga('SP12-199', 'Mordhau 2020 - Triternion Medieval Melee', {
      look: 'Triternion Mordhau (2020) look: first-person medieval melee battles, shield walls, gritty realistic armor, muddy fields and chaotic mass fights.',
      subject: 'render people as gritty medieval soldiers in mail and plate.',
      color: 'Mud brown, steel and banner colors.',
      light: 'Grey overcast battle light.',
      texture: 'Realistic mud, mail and steel, slightly soft in the distance.',
      camera: 'First-person shield wall view.',
      mood: 'chaotic brutal melee',
      render:
        'A 2020 first-person frame at 1920 by 1080: a sword raised at the bottom right, shield wall ahead, bar shapes bottom left.',
      key: 'Mordhau melee; shield walls; mud',
    }),
    ga('SP12-200', 'Muramasa The Demon Blade 2009 - Vanillaware Painted Feudal', {
      look: 'Vanillaware Muramasa: The Demon Blade (2009) look: lush hand-painted 2D feudal Japan by George Kamitani, flowing sword arcs, layered scenery and yokai.',
      subject: 'render people as elegant hand-painted feudal figures.',
      color: 'Lush green, sunset gold and cherry pink.',
      light: 'Warm painted glow with soft colored backlight.',
      texture: 'Hand-painted 2D art with elegant flowing lines and bright ukiyo-e-like colors.',
      camera: 'Side-scrolling view.',
      mood: 'lush elegant adventure',
      render:
        'A 2009 Wii side-view frame at 640 by 480: elegant painted swordsman in a feudal landscape, a small blade gauge shape.',
      key: 'Muramasa painted; feudal Japan; sword arcs',
    }),
    ga('SP12-201', 'Pocky & Rocky 1992 - Natsume Shrine Maiden', {
      look: 'Natsume Pocky & Rocky (1992) look: top-down SNES shooter with shrine maidens hurling ofuda talismans at yokai, bright 16-bit shrines and spirit swarms.',
      subject:
        'show people as bright little pixel sprites with big heads, a shrine maiden and yokai in a small palette.',
      color: 'Shrine red, moon blue and foxfire.',
      light: 'Flat pixel colors with no gradients.',
      texture: 'Crisp square pixels, bold outlines and repeating shrine and forest tiles.',
      camera: 'Top-down shooter view.',
      mood: 'spirited yokai chaos',
      render:
        'A 1992 Super Nintendo frame at 256 by 224 from above: small shrine maiden throwing talismans, score shapes at the top.',
      key: 'Pocky & Rocky pixel shrine maiden; talismans; yokai',
      avoid: ['a shrine maiden with a tanuki partner'],
    }),
    ga('SP12-202', 'Comix Zone 1995 - Sega Comic Page Brawler', {
      look: 'Sega Technical Institute Comix Zone (1995) look: brawler set inside comic book pages, heroes jumping between panels, hand-drawn villains and halftone effects.',
      subject: 'render people as comic-page heroes inside panels.',
      color: 'Comic print colors and halftone.',
      light: 'Flat comic-book colors with no gradients.',
      texture: 'Printed halftone dots and ink lines, heroes inside panel borders on a page.',
      camera: 'Comic page panel view.',
      mood: 'rowdy comic-book action',
      render:
        'A 1995 Sega Mega Drive frame at 320 by 224: a comic page with the hero fighting inside a panel, pixelated halftone.',
      key: 'Comix Zone panels; halftone; page brawl',
      avoid: ['a blond artist hero with a pet rat'],
    }),
    ga('SP12-203', 'Kingdom Come Deliverance 2018 - Warhorse Realistic Medieval', {
      look: 'Warhorse Studios Kingdom Come: Deliverance (2018) look: realistic fifteenth-century Bohemia, historically accurate armor, torchlit courtyards and first-person swordplay.',
      subject: 'render people as historically accurate medieval fighters.',
      color: 'Torch amber, steel and earth.',
      light: 'Warm torchlit night on stone and timber.',
      texture: 'Realistic steel and cloth with slightly soft game-engine detail.',
      camera: 'First-person duel view.',
      mood: 'grounded tense duel',
      render:
        'A 2018 first-person frame at 1920 by 1080: sword at the bottom, torchlit village, a small compass at the bottom.',
      key: 'Kingdom Come realism; swordplay; Bohemia',
    }),
    ga('SP12-204', 'Shogun Showdown 2023 - Roboatino Pixel Tactics', {
      look: 'Roboatino Shogun Showdown (2023) look: turn-based pixel tactics on a line of feudal Japanese tiles, samurai, monks and oni in crisp sprites.',
      subject: 'render people as crisp pixel samurai and oni.',
      color: 'Temple red, stone and night blue.',
      light: 'Flat pixel colors with bright red and blue accents.',
      texture: 'Crisp pixel samurai and oni on a single row of tiles.',
      camera: 'Tactical side view.',
      mood: 'tight tactical tension',
      render:
        'A 2023 frame at 640 by 360 scaled up: pixel fighters on a line of tiles, blank tile cards below.',
      key: 'Shogun Showdown pixels; oni; tactics',
    }),
    ga('SP12-205', 'Ryse Son of Rome 2013 - Crytek Colosseum', {
      look: 'Crytek Ryse: Son of Rome (2013) look: third-person Roman gladiator combat in a sunlit colosseum, crowds, cinematic armor detail and dust.',
      subject: 'render people as Roman gladiators and legionaries.',
      color: 'Sand gold, Roman red and bronze.',
      light: 'Hot sun and dust in a packed arena.',
      texture: 'Detailed bronze and leather, glossy and crisp, sand and blood on the arena floor.',
      camera: 'Third-person arena view.',
      mood: 'roaring arena spectacle',
      render:
        'A 2013 Xbox One frame at 1600 by 900 in third person: gladiator in the colosseum with roaring crowds, button prompt shapes.',
      key: 'Ryse colosseum; gladiators; crowds',
    }),
    ga('SP12-206', 'Defender of the Crown 1986 - Cinemaware Painted Joust', {
      look: 'Cinemaware Defender of the Crown (1986) look: Amiga painted pixel art of medieval England, the famous jousting view down the tilt, banners and castles.',
      subject: 'render people as painted Amiga pixel knights and nobles.',
      color: 'Rich Amiga banners and green fields.',
      light: 'Painted daylight in rich flat colors.',
      texture: 'Painted-looking scenes made of visible square pixels and dithering.',
      camera: 'First-person joust view down the lists.',
      mood: 'chivalric romantic drama',
      render:
        'A 1986 Amiga frame at 320 by 200: painterly pixel joust or castle scene, a simple framed border.',
      key: 'Defender of the Crown joust; Amiga painting',
    }),
  ]),
};

export default spec;
