import type { Spec } from '../tools/apply';
import { ga, keep } from './_authors';

// Video game pass, heists, horror and underworld runs: each preset names its game, studio and
// year and states the real render technique and camera. Briefs that restaged a game's own hero
// (the teacup head, the half-vampire swordsman, the suited engineer) are replaced.
const spec: Spec = {
  pack: 'pack_12',
  category: '7. Heists, Horror & Underworld Runs',
  updates: Object.fromEntries([
    ga('SP12-016', 'Dishonored 2012 - Arkane Painterly Dunwall', {
      look: 'Arkane Studios Dishonored (2012) look: first-person stealth in a painterly whale-oil industrial city designed by Viktor Antonov, exaggerated faces, heavy brushstroke textures and supernatural powers.',
      subject:
        'render people with painterly exaggerated faces, long jaws and Victorian industrial clothing, seen from first person.',
      color: 'Whale-oil amber, sickly green, bruised blue and aristocratic red.',
      light: 'Hazy whale-oil lamps and soft painterly shafts through smoke.',
      texture: 'Visible painterly brushstroke textures on stone, cloth and metal.',
      camera: 'First-person view with a blade hand and a power hand.',
      mood: 'decadent plague-city intrigue',
      render:
        'A 2012 first-person frame at 1280 by 720: painted city with a blade in one hand, a glowing power in the other, bar shapes top left.',
      key: 'Dishonored painterly; whale-oil city; exaggerated faces',
      avoid: ['a metal skull mask with lenses'],
    }),
    ga('SP12-019', 'Metro 2033 2010 - 4A Games Moscow Tunnels', {
      look: '4A Games Metro 2033 (2010) look: first-person survival horror in post-apocalyptic Moscow metro tunnels, gas masks, hand-cranked lights, makeshift station towns and mutants.',
      subject:
        'render people as ragged metro survivors in gas masks and patched coats, seen from first person.',
      color: 'Tunnel black, flashlight white, rust and sickly green.',
      light: 'Flashlight beams in deep tunnel darkness and warm station fires.',
      texture: 'Grimy concrete, rust, condensation on the mask glass.',
      camera: 'First-person view through a cracked gas mask.',
      mood: 'suffocating underground dread',
      render:
        'A 2010 first-person frame at 1280 by 720: gas-mask glass edge around the view, flashlight beam, a watch-like gauge on a wrist.',
      key: 'Metro tunnels; gas masks; flashlight; station towns',
    }),
    ga('SP12-024', 'Tomb Raider 2013 - Crystal Dynamics Survivor', {
      look: 'Crystal Dynamics Tomb Raider (2013) look: gritty third-person survival adventure, collapsing tombs, jungle ruins, climbing axes, torches and cinematic trap set pieces.',
      subject: 'render people as dirty bruised explorers in practical survival gear.',
      color: 'Torch amber, wet stone grey and jungle green.',
      light: 'Torch glow in dusty tomb darkness, warm on faces and black beyond.',
      texture: 'Mud, wet stone, rope and dust, slightly soft console-game detail.',
      camera: 'Third-person cinematic chase view.',
      mood: 'gritty perilous survival',
      render:
        'A 2013 frame at 1920 by 1080 in third person: explorer squeezing past traps in a tomb, no interface except a small ammo shape.',
      key: 'Tomb Raider 2013 traps; tombs; gritty survival',
      avoid: ['a brunette explorer with a ponytail and climbing axes'],
    }),
    ga('SP12-030', 'Cuphead 2017 - Studio MDHR 1930s Rubber Hose', {
      look: 'Studio MDHR Cuphead (2017) look: hand-inked 1930s rubber-hose animation, watercolor backgrounds, film grain, run-and-gun boss fights and bouncing cartoon characters.',
      subject:
        'render people and creatures as rubber-hose cartoon characters with pie-cut eyes and white gloves.',
      color: 'Faded 1930s watercolor palette with warm film tint.',
      light: 'Flat cartoon colors with warm vintage film tint and grain.',
      texture:
        'Hand-inked black lines, flat colors, watercolor painted backgrounds and dust and scratch marks.',
      camera: 'Side-view run-and-gun boss arena.',
      mood: 'jaunty frantic danger',
      render:
        'A 2017 side-view frame at 1920 by 1080 like old cartoon film: a small hero against a huge boss, playing-card shapes bottom left.',
      key: 'Cuphead rubber hose; 1930s; watercolor; film grain',
      avoid: ['a cup-headed hero', 'a mug-headed hero', 'the devil boss with a pitchfork'],
      briefs: [
        'Dodging bullets thrown by a giant rubber-hose carnival clown, an original matchbox-headed hero runs and guns across a spinning carousel in hand-inked 1930s style. No readable text or logo.',
        'In a hand-inked carnival boss fight, a towering cartoon walrus ringmaster pauses mid-attack because his top hat has fallen off. No readable text or logo.',
        keep('SP12-030')[2],
      ],
    }),
    ga('SP12-049', 'Symphony of the Night 1997 - Konami Gothic Sprite Castle', {
      look: 'Konami Castlevania: Symphony of the Night (1997) look: lavish 2D gothic sprite art with Ayami Kojima inspired elegance, moonlit castle halls, huge animated bosses and rich backgrounds.',
      subject:
        'show people as elegant tall pixel sprites with long hair and capes, drawn with many colors and fine detail.',
      color: 'Moonlit indigo, blood crimson and gilded gold.',
      light: 'Moonlight through tall gothic windows and warm candle pixels.',
      texture:
        'Lavish detailed pixel sprites over painted-looking pixel backgrounds in deep blues and reds.',
      camera: 'Side-view metroidvania castle view.',
      mood: 'elegant gothic menace',
      render:
        'A 1997 PlayStation side-view frame at 256 by 240: crisp pixel castle hall, a small ornate bar shape top left.',
      key: 'Symphony of the Night lavish sprites; gothic castle; moonlit halls',
      avoid: [
        'a silver-haired dhampir with a black cape',
        'a whip-wielding vampire hunter in leather',
      ],
      briefs: [
        'Slashing through a moonlit gothic hall in 2D, an original vampire-hunting nun with a chained censer faces a gigantic skeleton made of stacked coffins rising from the castle floor. No readable text or logo.',
        keep('SP12-049')[1],
        keep('SP12-049')[2],
      ],
    }),
    ga('SP12-050', 'Signalis 2022 - rose-engine Low-Poly Polar Horror', {
      look: 'rose-engine Signalis (2022) look: survival horror deliberately made to look like an old console game, coarse pixelated textures on simple shapes, a polar facility, red emergency light and an overhead camera.',
      subject:
        'show people as simple blocky anime figures with coarse pixelated faces and stiff uniforms, seen from an overhead camera.',
      color: 'Emergency red, cold white and black.',
      light: 'Harsh red emergency light with deep black shadows.',
      texture:
        'Coarse pixelated textures on simple angular shapes, fine dither dots in gradients, like an old console game.',
      camera: 'Fixed overhead survival horror camera.',
      mood: 'cold cosmic dread',
      render:
        'A 2022 frame deliberately made at 640 by 480 on a CRT look: overhead view of a cramped corridor, soft grain and jagged edges.',
      key: 'Signalis coarse pixel textures; red emergency; overhead camera; retro horror',
      avoid: ['a blue-haired android officer with a scar'],
    }),
    ga('SP12-054', 'Red Dead Redemption 2 2018 - Rockstar Studios Train Heist', {
      look: 'Rockstar Studios Red Dead Redemption 2 (2018) look: photoreal 1899 frontier, rich naturalistic light, steam locomotives through canyons, outlaw gangs and horseback action.',
      subject: 'render people as weathered 1899 outlaws in hats and long coats.',
      color: 'Sunset copper, canyon red and dust.',
      light: 'Natural sunset light with dust glowing in the air.',
      texture:
        'Photoreal leather, steel, wood and dust, with sharp detail and slight softness in motion.',
      camera: 'Third-person action view.',
      mood: 'gritty outlaw daring',
      render:
        'A 2018 frame at 3840 by 2160 in third person: outlaw on a moving train, a small round minimap bottom left.',
      key: 'RDR2 train heist; outlaws; canyon sunset',
      avoid: ['a bearded outlaw in a flat-brimmed hat and satchel'],
    }),
    ga('SP12-057', 'Sea of Thieves 2018 - Rare Painterly Pirates', {
      look: 'Rare Sea of Thieves (2018) look: stylized painterly pirate adventure, gorgeous dynamic water, chunky exaggerated pirates, galleons, skeletons and glowing seas.',
      subject: 'render people as chunky exaggerated cartoon pirates.',
      color: 'Painterly teal sea, sunset gold and storm grey.',
      light: 'Painted sky light glowing on clear green-blue waves.',
      texture: 'Chunky stylized wood and cloth, glossy painted water with foam.',
      camera: 'First-person view on deck.',
      mood: 'rollicking pirate adventure',
      render:
        'A 2018 first-person frame at 1920 by 1080: hand on a ship wheel or item, cartoon pirates on deck, a small bar shape bottom left.',
      key: 'Sea of Thieves painterly; water; galleons',
    }),
    ga('SP12-066', 'Dead Space 2008 - EA Redwood Derelict Ship', {
      look: 'EA Redwood Shores Dead Space (2008) look: third-person survival horror on a derelict mining ship, diegetic interface on the suit, dark industrial corridors and twisted necromorphs.',
      subject: 'render people as engineers in heavy industrial suits with glowing lights.',
      color: 'Industrial rust, emergency red and suit cyan.',
      light: 'Flickering dark industrial light with red emergency lamps.',
      texture: 'Grimy metal corridors and biological mess on walls, heavy darkness.',
      camera: 'Close over-the-shoulder view.',
      mood: 'isolated industrial horror',
      render:
        'A 2008 frame at 1280 by 720 in third person over the shoulder: a heavy suit with glowing lights on its back, no other interface.',
      key: 'Dead Space derelict ship; heavy suit; diegetic UI',
      avoid: ['an engineer suit with a glowing blue spine bar', 'existing necromorph designs'],
      briefs: [
        'Riding a rusted tram through a derelict ship in third person, an original welder in a patched pressure suit raises a cutting torch as twisted creatures claw at the glass. No readable text or logo.',
        keep('SP12-066')[1],
        keep('SP12-066')[2],
      ],
    }),
    ga('SP12-069', 'HighFleet 2021 - Koshutin Dieselpunk Radar War', {
      look: 'Konstantin Koshutin HighFleet (2021) look: dieselpunk flying battleships over desert, analog radar screens, cockpit instruments, CRT glow and strategic tension.',
      subject: 'render every subject as dieselpunk airships and analog instruments.',
      color: 'CRT green, desert tan and brass.',
      light: 'Green radar glow and hot desert sun through cockpit glass.',
      texture: 'Analog dials, CRT scanlines on a round radar screen and riveted steel.',
      camera: 'Side-view battle or radar screen view.',
      mood: 'cold strategic dread',
      render:
        'A 2021 frame at 1920 by 1080: a bridge console with a round radar screen, dials and airships outside.',
      key: 'HighFleet airships; analog radar; dieselpunk',
    }),
    ga('SP12-159', 'Payday 2 2013 - Overkill Masked Crew', {
      look: 'Overkill Software Payday 2 (2013) look: first-person co-op heists, masked crews in suits, vault drills, flashing alarms and police assaults.',
      subject: 'render people as heist crew in suits and custom masks.',
      color: 'Alarm red, vault steel and suit black.',
      light: 'Flashing red alarms and flat white fluorescent bank light.',
      texture: 'Vault steel, dark suits, clown-like masks and stacks of money.',
      camera: 'First-person view at a vault.',
      mood: 'tense heist adrenaline',
      render:
        'A 2013 first-person frame at 1920 by 1080: gun in hand, vault door with a drill, small bar and icon shapes bottom right.',
      key: 'Payday vault drill; masked crew; alarms',
      avoid: ['clown heist masks'],
    }),
    ga('SP12-160', 'No One Lives Forever 2000 - Monolith Sixties Spy', {
      look: 'Monolith No One Lives Forever (2000) look: first-person sixties spy shooter with mod fashion, casino glamour, gadgets and boxy simple interiors with blurry textures.',
      subject: 'render people as groovy sixties spies in mod fashion and tuxedos.',
      color: 'Mod orange, casino red and gold.',
      light: 'Warm casino glamour lighting with simple flat shading.',
      texture:
        'Blurry textures on simple boxy walls and furniture, figures with smooth simple faces.',
      camera: 'First-person casino view.',
      mood: 'groovy spy glamour',
      render:
        'A 2000 PC frame at 800 by 600 in first person: a gun at the bottom, a sixties casino of simple shapes, number shapes in the corners.',
      key: 'NOLF sixties spy; mod fashion; casino',
    }),
    ga('SP12-161', 'Outlast 2013 - Red Barrels Night Vision', {
      look: 'Red Barrels Outlast (2013) look: first-person found-footage horror through a camcorder with green night vision, asylum halls, grain and battery icons.',
      subject: 'render people as ghastly figures in grainy green night vision.',
      color: 'Night-vision green and black.',
      light: 'Everything in green night-vision glow, eyes reflecting white.',
      texture: 'Heavy grain, digital noise and camcorder blur over a dark asylum.',
      camera: 'Shaky first-person camcorder view.',
      mood: 'helpless hunted terror',
      render:
        'A 2013 first-person frame at 1920 by 1080 through a camcorder: corner brackets, a battery shape and a blinking record dot.',
      key: 'Outlast night vision; camcorder; asylum',
    }),
    ga('SP12-162', 'Alan Wake 2010 - Remedy Flashlight Horror', {
      look: 'Remedy Entertainment Alan Wake (2010) look: third-person psychological thriller where a flashlight beam burns away darkness, Pacific Northwest towns, fog and TV-episode tension.',
      subject:
        'render people as ordinary writers and townsfolk holding flashlights against the dark.',
      color: 'Night blue, flashlight white and fog grey.',
      light: 'A single hard flashlight beam in thick fog, everything else near black.',
      texture: 'Realistic wood, fog and shadow, a little soft and grainy.',
      camera: 'Over-the-shoulder flashlight view.',
      mood: 'suspenseful psychological dread',
      render:
        'A 2010 Xbox 360 frame at 1280 by 720 in third person over the shoulder: flashlight cone in foggy woods, a small battery bar shape.',
      key: 'Alan Wake flashlight; dark presence; fog',
      avoid: ['a writer in a tweed jacket with elbow patches'],
    }),
    ga('SP12-163', 'A Plague Tale Innocence 2019 - Asobo Rat Swarm', {
      look: 'Asobo Studio A Plague Tale: Innocence (2019) look: third-person medieval France under plague, torchlight against rat swarms, muddy villages and sewers.',
      subject: 'render people as medieval commoners in worn wool.',
      color: 'Torch orange, mud brown and plague grey.',
      light: 'Rings of torchlight holding back darkness filled with rats.',
      texture: 'Mud, wet stone, fur and a carpet of thousands of rats.',
      camera: 'Third-person view with torches.',
      mood: 'desperate medieval dread',
      render:
        'A 2019 frame at 1920 by 1080 in third person: a girl with a torch in a sewer ringed by rats, no interface.',
      key: 'Plague Tale rat swarms; torchlight; sewers',
      avoid: ['a young noble girl with a sling and her little brother'],
    }),
    ga('SP12-164', 'Mafia 2020 - Hangar 13 Prohibition Noir', {
      look: 'Hangar 13 Mafia: Definitive Edition (2020) look: 1930s prohibition city, speakeasies, tommy guns, classic cars and warm amber noir lighting.',
      subject: 'render people as 1930s gangsters and detectives in fedoras.',
      color: 'Amber smoke, mahogany and deep green.',
      light: 'Smoky amber speakeasy light with warm lamps.',
      texture: 'Polished wood, glass and wool suits, sharp and clean.',
      camera: 'Third-person cover view.',
      mood: 'smoky gangland tension',
      render:
        'A 2020 frame at 1920 by 1080 in third person: gangster in a speakeasy, a small minimap shape bottom left.',
      key: 'Mafia prohibition; speakeasy; amber noir',
    }),
    ga('SP12-165', 'Driver 1999 - Reflections Seventies Chase', {
      look: 'Reflections Interactive Driver (1999) look: PlayStation seventies car chases with boxy muscle cars, flat-panel city blocks, police lights and a soft jagged image.',
      subject:
        'show every car as a boxy seventies muscle car built from a few flat panels with painted-on windows and lights.',
      color: 'Night blue, police red and sodium orange.',
      light: 'Blue and red police lights and flat orange street lamps with no real shadows.',
      texture: 'Blurry wobbling textures on boxy buildings and cars, flat painted windows.',
      camera: 'Chase camera behind the car.',
      mood: 'gritty chase thrill',
      render:
        'A 1999 PlayStation frame at 512 by 240 on a CRT from behind the car: soft, jagged, a damage bar shape.',
      key: 'Driver 1999 boxy muscle cars; seventies chase; police lights; soft PS1',
    }),
    ga('SP12-166', 'Sly Cooper 2002 - Sucker Punch Toon Heist', {
      look: 'Sucker Punch Sly Cooper and the Thievius Raccoonus (2002) look: cel-shaded cartoon heist, animal thieves, blue night palettes, laser grids and sneaky poses.',
      subject: 'render people as cel-shaded cartoon animal thieves with sneaky poses.',
      color: 'Night blue, laser red and gold.',
      light: 'Cartoon night light with glowing red laser beams.',
      texture: 'Cel shading with thick ink outlines on cartoon animals and rooftops.',
      camera: 'Third-person sneak view.',
      mood: 'sly playful heist',
      render:
        'A 2002 PlayStation 2 frame at 640 by 448: cel-shaded thief sneaking past lasers, jagged edges, a small gauge shape.',
      key: 'Sly Cooper cel; animal thieves; lasers',
      avoid: ['a raccoon thief in a blue hat with a cane'],
    }),
    ga('SP12-167', "Luigi's Mansion 3 2019 - Next Level Games Ghost Hotel", {
      look: "Next Level Games Luigi's Mansion 3 (2019) look: animated-film haunted hotel, goofy colorful ghosts, suction vacuum effects, swirling furniture and soft spooky light.",
      subject: 'render people as nervous cartoon ghost catchers with big expressions.',
      color: 'Spooky purple, ghost green and warm gold.',
      light: 'Soft spooky purple light and bright green vacuum glow.',
      texture:
        'Animated-film-quality rounded shapes, velvet, brass and glowing translucent ghosts.',
      camera: 'Third-person room view.',
      mood: 'goofy spooky fun',
      render:
        'A 2019 Switch frame at 1920 by 1080: nervous cartoon ghost catcher in a haunted hotel corridor, a small heart shape.',
      key: 'Luigi Mansion ghosts; vacuum; haunted hotel',
      avoid: ['a nervous plumber in green', 'existing Nintendo characters'],
    }),
    ga('SP12-168', 'Hades 2020 - Supergiant Painted Underworld', {
      look: 'Supergiant Games Hades (2020) look: isometric roguelike in Jen Zee painted art, bold inked Greek myth characters, glowing underworld chambers and ember colors.',
      subject: 'render people as bold inked painted Greek myth figures.',
      color: 'Underworld crimson, ember orange and soul teal.',
      light: 'Ember and soul glow in dark underworld chambers.',
      texture: 'Painted art with bold ink outlines, seen from a high diagonal angle.',
      camera: 'Isometric chamber view.',
      mood: 'defiant mythic swagger',
      render:
        'A 2020 frame at 1920 by 1080: small inked figure fighting in a painted underworld chamber, a bar shape bottom left.',
      key: 'Hades Jen Zee; underworld; Greek myth',
      avoid: ['a laurel-crowned prince with flaming feet'],
    }),
  ]),
};

export default spec;
