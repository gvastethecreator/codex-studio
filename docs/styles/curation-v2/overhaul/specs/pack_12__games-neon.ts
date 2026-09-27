import type { Spec } from '../tools/apply';
import { ga } from './_authors';

// Video game pass, neon urban and night ops: each preset names its game, studio and year and
// states the real render technique and camera, so cards stop defaulting to glossy generic 3D.
// Briefs stay; they already keep each look in its genre with original characters.
const spec: Spec = {
  pack: 'pack_12',
  category: '1. Neon Urban & Night Ops',
  updates: Object.fromEntries([
    ga('SP12-001', 'Katana Zero 2019 - Askiisoft Neo-Noir Pixel Slash', {
      look: 'Askiisoft Katana Zero (2019) look: side-view pixel art at low resolution, neo-noir motel and club interiors, teal and magenta neon, VHS scanline glitches, slow-motion afterimages and one-hit sword kills.',
      subject:
        'render people as small crisp pixel-art sprites with readable silhouettes, trailing afterimages and sharp slash arcs.',
      color: 'Teal window light, hot magenta neon, deep purple shadow and blood red accents.',
      light:
        'Flat neon pools on pixel floors with bright slash flashes and dark rooms between lights.',
      texture: 'Low-resolution pixel art with VHS scanlines, chromatic glitch and tape noise.',
      camera: 'Flat side-view room cutaway with the whole fight readable in one screen.',
      mood: 'cool neo-noir slaughter',
      render:
        'A 2019 side-view frame at 640 by 360 scaled up: crisp tiny pixel sprites in neon rooms, VHS tracking lines and a timer bar shape at the top.',
      key: 'Katana Zero pixel noir; VHS glitch; slow-motion afterimages; neon rooms',
      avoid: ['a samurai in a long coat with a headband'],
    }),
    ga('SP12-014', "Mirror's Edge 2008 - DICE White Rooftop Runner", {
      look: "DICE Mirror's Edge (2008) look: first-person parkour across sterile white rooftops, runner vision painting the route red, clean blue sky, glass towers and graphic primary accents.",
      subject:
        'render people as sleek athletic runners, seen mostly as first-person arms and legs reaching for ledges and pipes.',
      color:
        'Sterile white, clear sky blue, runner-vision red and small yellow and orange accents.',
      light:
        'Bright overexposed sun on white surfaces with soft global illumination and clean shadows.',
      texture:
        'Clean matte white concrete, glass and polished metal with almost no grime, pipes and ledges picked out in bright red.',
      camera: 'First-person view with visible arms and legs, tilted in motion over rooftop gaps.',
      mood: 'clean vertigo freedom',
      render:
        'A 2008 console frame at 1280 by 720 in first person: soft baked light, glowing overexposed whites, arms and hands reaching into view.',
      key: "Mirror's Edge white city; runner vision red; first-person arms",
    }),
    ga('SP12-025', 'Streets of Rage 4 2020 - Lizardcube Hand-Drawn Brawler', {
      look: 'Lizardcube and Guard Crush Streets of Rage 4 (2020) look: hand-drawn 2D animation with thick brush outlines, flat cel color and soft painted neon streets in a side-scrolling beat em up.',
      subject:
        'render people as hand-drawn animated fighters with thick brush outlines, chunky proportions and big readable poses.',
      color: 'Neon pink, cyan and orange signs over deep blue night streets.',
      light: 'Painted neon glow with flat cel shadows and soft rim light on fighters.',
      texture: 'Hand-drawn 2D animation lines and flat painted fills over painted backgrounds.',
      camera: 'Side-scrolling beat em up view with a deep street lane for fighters.',
      mood: 'punchy street-brawl swagger',
      render:
        'A 2020 side-view frame at 1920 by 1080: hand-drawn fighters on a painted neon street lane, health bar shapes along the top.',
      key: 'Streets of Rage 4 hand-drawn; thick brush lines; neon street lane',
      avoid: ['existing brawler heroes'],
    }),
    ga('SP12-032', 'Shadow Gambit 2023 - Mimimi Isometric Stealth', {
      look: 'Mimimi Games Shadow Gambit: The Cursed Crew (2023) look: isometric real-time stealth tactics, painterly stylized 3D, cursed pirate crews, green vision cones and glowing magic outlines.',
      subject:
        'render people as small stylized 3D characters with exaggerated silhouettes, readable from a high isometric angle.',
      color: 'Deep sea teal, lantern gold, cursed green glow and warm harbor wood.',
      light: 'Moonlit night with lantern pools and bright green vision cones.',
      texture: 'Painterly stylized textures on chunky low-detail 3D assets.',
      camera: 'High isometric tactics camera with vision cones and paths.',
      mood: 'sly cursed stealth',
      render:
        'A 2023 frame at 1920 by 1080 from a high diagonal angle: small stylized figures, green vision cones on the ground, portrait icons at the bottom.',
      key: 'Shadow Gambit isometric; vision cones; cursed pirates; painterly 3D',
    }),
    ga('SP12-043', 'Earth Defense Force 5 2017 - Sandlot Arcade Kaiju Swarm', {
      look: 'Sandlot Earth Defense Force 5 (2017) look: budget third-person arcade shooter, giant ants and kaiju swarming cities, huge explosions, simple textures, destructible buildings and B-movie chaos.',
      subject:
        'render people as small generic armored soldiers dwarfed by giant insects and monsters in third person.',
      color: 'Hazy daylight blue, concrete grey, orange explosions and acid green.',
      light: 'Flat daylight with bright explosions and dust clouds.',
      texture: 'Simple low-detail textures, crumbling blocky buildings and particle debris.',
      camera: 'Third-person shoulder view looking up at giant enemies.',
      mood: 'gleeful B-movie mayhem',
      render:
        'A 2017 console frame at 1920 by 1080 in third person: plain textures, blocky buildings collapsing into dust, a crosshair and a small radar circle.',
      key: 'EDF giant ants; B-movie kaiju; crumbling city; arcade chaos',
    }),
    ga('SP12-048', 'Cloudpunk 2020 - Ion Lands Voxel Rain City', {
      look: 'Ion Lands Cloudpunk (2020) look: dense voxel cyberpunk city of stacked towers, endless rain, neon signs, flying hovercars and misty depths far below.',
      subject:
        'render people as small blocky voxel figures and hovercars built from visible cubes.',
      color: 'Neon magenta, cyan and amber glowing through blue rain mist.',
      light: 'Neon signs glowing through thick rain fog with deep dark canyons.',
      texture: 'Visible voxel cubes, rain streaks and glowing volumetric fog.',
      camera: 'Third-person chase view behind a hovercar between towers.',
      mood: 'lonely rain-soaked melancholy',
      render:
        'A 2020 frame at 1920 by 1080 from a hovercar: cube-built city blocks and figures sharp as toy blocks, glowing through thick rain fog.',
      key: 'Cloudpunk voxels; rain city; hovercars; neon fog',
    }),
    ga('SP12-056', 'Ghostrunner 2020 - One More Level Cyber Parkour', {
      look: 'One More Level Ghostrunner (2020) look: first-person cyber-ninja parkour up a vertical megatower, katana in hand, red and cyan neon, dark industrial metal and one-hit deaths.',
      subject:
        'render people as cybernetic figures seen from first person, with a katana hand and chrome cyber limbs.',
      color: 'Black carbon metal, blood red neon, cyan highlights and orange sparks.',
      light: 'Harsh neon strips and sparks against dark industrial shafts.',
      texture: 'Carbon black metal, grime, cables and glossy neon reflections.',
      camera: 'First-person wall-run view with the blade in frame.',
      mood: 'razor-sharp vertical speed',
      render:
        'A 2020 first-person frame at 1920 by 1080: katana-holding cyber hand at the bottom right, red neon strips streaking with motion blur.',
      key: 'Ghostrunner first-person katana; wall-runs; red neon megatower',
    }),
    ga('SP12-062', 'Yakuza 0 2015 - RGG Kamurocho Street Brawl', {
      look: 'Ryu Ga Gotoku Studio Yakuza 0 (2015) look: realistic third-person brawling in dense Japanese nightlife streets of 1988, red lanterns, crowded signs, heat actions and melodramatic heat aura glow.',
      subject:
        'render people as realistic Japanese city characters in suits and street clothes, with heat aura glow during brawls.',
      color: 'Red lantern glow, neon sign color and warm wet asphalt.',
      light: 'Dense sign light, lantern glow and bright heat-action flashes.',
      texture:
        'Wet reflective streets, crisp suits and dense glowing sign clusters, detailed up close but slightly soft in the distance.',
      camera: 'Third-person brawl view in a crowded street ring.',
      mood: 'melodramatic street-fight bravado',
      render:
        'A 2015 PlayStation 4 frame at 1920 by 1080 in third person: fighters with a colored aura, a health bar and heat gauge shapes top left.',
      key: 'Yakuza nightlife streets; heat aura; red lanterns; brawls',
      avoid: ['a man in a grey suit with a red shirt', 'a man in a snakeskin jacket and eyepatch'],
    }),
    ga('SP12-071', 'Half-Life 2 2004 - Valve City 17 Resistance', {
      look: 'Valve Half-Life 2 (2004) look: first-person Source engine view of an Eastern European city under alien occupation, brutalist citadel, canals, rusty metal and overgrown ruins.',
      subject:
        'render people as tired resistance citizens in blue work clothes and scavenged gear, seen from first person.',
      color: 'Desaturated teal, concrete grey, rust brown and faded green.',
      light:
        'Overcast flat light with crisp dark shadows under ledges and a slightly hazy distance.',
      texture:
        'Rust, concrete and grime textures that look sharp from afar but blurry up close, simple blocky debris.',
      camera: 'First-person view with a weapon at screen right.',
      mood: 'grim occupied resistance',
      render:
        'A 2004 PC frame at 1024 by 768 in first person: muted teal-grey city, a weapon at bottom right, health and ammo number shapes at the bottom.',
      key: 'Half-Life 2 City 17; citadel; canals; first-person',
      avoid: ['tall three-legged alien striders', 'a red crowbar', 'gas-masked occupation police'],
    }),
    ga('SP12-078', 'Mark of the Ninja 2012 - Klei Ink Stealth', {
      look: 'Klei Entertainment Mark of the Ninja (2012) look: side-view 2D stealth with hand-drawn cartoon animation, deep black silhouettes in shadow, bright lit zones and sound rings.',
      subject:
        'render people as hand-drawn cartoon characters, lit in color and flattened to black silhouettes in shadow.',
      color: 'Deep black shadow, warm lantern yellow and muted indigo.',
      light: 'Hard light pools that turn figures into silhouettes when dark.',
      texture:
        'Clean hand-drawn cartoon lines and flat color fills, whole figures dropping to pure black inside shadow areas.',
      camera: 'Side-view cutaway of rooms and vents.',
      mood: 'tense silent stealth',
      render:
        'A 2012 side-view frame at 1280 by 720: lit pools of color and black silhouette shadow zones, concentric sound ring outlines.',
      key: 'Mark of the Ninja silhouettes; light pools; sound rings',
    }),
    ga('SP12-099', 'Geometry Wars 2003 - Bizarre Creations Neon Grid', {
      look: 'Bizarre Creations Geometry Wars (2003) look: top-down twin-stick shooter on a warping neon grid, glowing vector shapes, particle explosions and swarms of geometric enemies.',
      subject:
        'render every subject as a glowing neon vector shape or ship seen from directly above.',
      color: 'Black void with neon cyan, magenta, green and yellow glow.',
      light:
        'Every shape glows from its own thin bright lines, with soft halos and bursts of sparks on black.',
      texture:
        'Thin glowing vector outlines, a warping grid and showers of glowing square particles.',
      camera: 'Top-down arena view over a warping grid.',
      mood: 'hypnotic bullet frenzy',
      render:
        'A 2003 frame at 640 by 480 seen straight down: glowing shapes swarming a small claw ship over a bending grid.',
      key: 'Geometry Wars neon grid; vector shapes; particle bloom',
    }),
    ga('SP12-100', 'Deus Ex Human Revolution 2011 - Eidos Gold Cyber Stealth', {
      look: 'Eidos Montreal Deus Ex: Human Revolution (2011) look: black-and-gold cyber-renaissance palette, third-person cover stealth in rainy alleys, augmented bodies and Renaissance-inspired clothing.',
      subject:
        'render people as augmented agents with sleek black clothing and glowing gold cyber details.',
      color: 'Black and warm gold with amber haze.',
      light: 'Gold amber haze with flashlight sweeps and holograms.',
      texture:
        'Wet asphalt, leather and polished black augment plating, everything tinted gold, slightly soft game-engine detail.',
      camera: 'Third-person cover view behind a crouched agent.',
      mood: 'conspiratorial gold noir',
      render:
        'A 2011 console frame at 1280 by 720 in third person: gold haze over the whole image, a small radar box shape bottom left.',
      key: 'Deus Ex black and gold; cover stealth; augmented agents',
      avoid: ['a bearded agent in sunglasses and a trench coat'],
    }),
    ga('SP12-101', 'Shadowrun Returns 2013 - Harebrained Isometric Matrix', {
      look: 'Harebrained Schemes Shadowrun Returns (2013) look: painted isometric cyberpunk-fantasy rooms, turn-based tactics, deckers jacked into a glowing Matrix and cluttered tech dens.',
      subject:
        'render people as small painted isometric characters with cyberware, jacked-in cables and street gear.',
      color: 'Painted grime brown, neon cyan and Matrix green.',
      light: 'Monitor glow and neon in dim painted rooms.',
      texture:
        'Hand-painted rooms seen from above at an angle, with small simple 3D figures standing on them.',
      camera: 'Fixed isometric tactics view of a room.',
      mood: 'gritty tech-noir scheming',
      render:
        'A 2013 PC frame at 1280 by 720: painted den with small figures, a row of blank action buttons at the bottom.',
      key: 'Shadowrun isometric; painted dens; Matrix glow',
    }),
    ga('SP12-102', 'Jak II 2003 - Naughty Dog Haven City Hover Chase', {
      look: 'Naughty Dog Jak II (2003) look: stylized PS2 third-person action in a dense futuristic walled city, hover zoomers flying traffic lanes, police gunships and warm cartoon proportions.',
      subject:
        'show people as rubbery cartoon characters with big expressive faces and simple smooth shapes, riding hover bikes.',
      color: 'Industrial teal, brass and warm amber glow.',
      light: 'Warm hazy light that softens the distance, with glowing traffic lanes in the sky.',
      texture:
        'Smooth simple cartoon shapes with soft blurry painted textures, chunky rounded vehicles.',
      camera: 'Chase camera behind a hover zoomer.',
      mood: 'rebellious chase thrill',
      render:
        'A 2003 PlayStation 2 frame at 640 by 448: soft slightly jagged image, a hover bike seen from behind racing between walls.',
      key: 'Jak II hover bikes; walled city; chase camera; soft hazy cartoon world',
      avoid: ['a green-haired hero with goggles and an orange ottsel'],
    }),
    ga('SP12-103', 'River City Girls 2019 - WayForward Pixel Brawler', {
      look: 'WayForward River City Girls (2019) look: bright detailed pixel-art beat em up, anime-inspired character sprites, crowded Japanese streets and shops, comic hit effects and loud pop color.',
      subject: 'render people as bright detailed pixel-art brawler sprites with anime proportions.',
      color: 'Loud pop pink, lemon, teal and warm lantern orange.',
      light: 'Bright lantern light and white flashing hit sparks with no soft shading.',
      texture:
        'Detailed crisp pixel art with bold outlines and careful dithering on clothes and hair.',
      camera: 'Side-scrolling brawler lane.',
      mood: 'bratty chaotic fun',
      render:
        'A 2019 side-view frame at 1920 by 1080: large pixel brawler sprites on a street lane, portrait and bar shapes top left.',
      key: 'River City Girls pixel art; pop colors; street brawl',
    }),
    ga('SP12-104', 'Hitman 2016 - IO Interactive Sniper Scope', {
      look: 'IO Interactive Hitman (2016) look: sleek realistic city rooftops, polished Glacier engine lighting, a round sniper scope view with reticle and calm clinical assassination tension.',
      subject: 'render people as realistic distant figures seen through a round scope reticle.',
      color: 'Night blue, sodium amber and clean scope black.',
      light: 'Realistic night city light with warm window glow and cool streetlights.',
      texture: 'Realistic glass, stone and fabric at a distance, softened by the scope lens.',
      camera: 'Round scope view with a thin reticle.',
      mood: 'cold patient focus',
      render:
        'A 2016 frame at 1920 by 1080: a round black scope view filling the screen, thin crosshair lines, a figure framed inside.',
      key: 'Hitman sniper scope; reticle; city rooftops',
      avoid: ['a bald man in a black suit with a red tie and a barcode tattoo'],
    }),
    ga('SP12-105', 'Call of Duty 4 2007 - Infinity Ward Thermal Gunship Feed', {
      look: 'Infinity Ward Call of Duty 4: Modern Warfare (2007) look: grainy black-and-white thermal gunship camera feed, white-hot figures, crosshair brackets and circling aerial perspective.',
      subject: 'render people as white-hot thermal silhouettes seen from high above.',
      color: 'Monochrome white-hot on grey and black.',
      light:
        'Everything in greyscale thermal: warm bodies and engines glowing white-hot, cold ground dark grey.',
      texture: 'Grainy thermal noise, horizontal scan lines and slight blur from zoom.',
      camera: 'Circling overhead thermal feed with brackets.',
      mood: 'detached surveillance dread',
      render:
        'A 2007 frame at 1280 by 720 looking straight down: white figures on grey, corner bracket marks and a crosshair.',
      key: 'Thermal gunship feed; white-hot figures; brackets',
    }),
    ga('SP12-106', 'Horizon Chase Turbo 2018 - Aquiris Retro Arcade Racer', {
      look: 'Aquiris Horizon Chase Turbo (2018) look: retro arcade racing in simple solid-color shapes with no textures, huge gradient sunsets and winding roads seen from behind.',
      subject:
        'show every car and rider as simple smooth shapes of flat solid colors, each side of a car a single color, seen from behind.',
      color: 'Sunset orange, magenta and teal gradients.',
      light:
        'Huge gradient sunset sky with every surface lit as one flat solid color, no reflections.',
      texture: 'Plain solid-color faces with sharp edges and no texture at all, like cut paper.',
      camera: 'Rear arcade chase camera on curving roads.',
      mood: 'nostalgic arcade joy',
      render:
        'A 2018 frame at 1920 by 1080: a car seen from behind on a winding road under a gradient sunset, position number shapes top left.',
      key: 'Horizon Chase flat solid-color shapes; gradient sunsets; rear chase',
    }),
    ga('SP12-107', 'The Messenger 2018 - Sabotage 8-Bit Ninja', {
      look: 'Sabotage Studio The Messenger (2018) look: 8-bit NES-style pixel ninja platformer, tiny sprites, limited palette, pagoda rooftops under a big moon and flat color bands.',
      subject:
        'show people as tiny ninja sprites built from a few square pixels in a handful of flat colors.',
      color: 'Limited 8-bit palette of night blue, moon yellow and red.',
      light: 'Flat colors with no gradients, dark blue night and a huge pale moon.',
      texture: 'Chunky square pixels in a small palette, repeating brick and roof tiles.',
      camera: 'Side-scrolling platformer view.',
      mood: 'playful retro ninja',
      render:
        'A 2018 side-view frame at 384 by 216 scaled up: tiny ninja sprite on rooftops, a thin bar shape at the top.',
      key: 'The Messenger chunky pixels; tiny ninja sprites; big moon',
    }),
    ga('SP12-108', 'Hi-Fi Rush 2023 - Tango Gameworks Rhythm Cel', {
      look: 'Tango Gameworks Hi-Fi Rush (2023) look: bright comic cel-shaded 3D, thick outlines, halftone dots, everything in the world bouncing to the beat and big onomatopoeia-shaped effects.',
      subject:
        'render people as bright cel-shaded cartoon characters with thick outlines and bouncy poses.',
      color: 'Bright pop yellow, magenta, cyan and orange.',
      light: 'Flat bright cartoon light with shadows made of halftone dots.',
      texture:
        'Thick outlines, flat bright fills, halftone dots and bouncing comic sound-effect shapes.',
      camera: 'Third-person action view synced to the beat.',
      mood: 'rhythmic comic exuberance',
      render:
        'A 2023 frame at 1920 by 1080 in third person: cel-shaded hero mid-combo, a beat pulse circle and bar shapes on screen.',
      key: 'Hi-Fi Rush cel; halftone; beat-synced world',
      avoid: ['a spiky-haired guitarist with a robotic arm and a robot cat'],
    }),
  ]),
};

export default spec;
