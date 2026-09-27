import type { Spec } from '../tools/apply';
import { cr } from './_authors';

// Video games of the 1990s: each preset names its game, studio and hardware and rebuilds that
// game's real on-screen look. Cards stage original characters and places in that look.
const T = ['games-90s', 'video-game-era'];

const spec: Spec = {
  pack: 'pack_27',
  category: '5. Video Games 90s',
  newCategory: { id: 'video-games-90s' },
  updates: {},
  creates: [
    cr('Doom 1993 - id Software Sprite Shooter', 'nineties PC game', [...T, 'doom'], {
      look: 'id Software Doom (1993) look: first-person 2.5D corridors, low-resolution brown and red textures, flat sprite monsters, a weapon sprite at screen bottom and a status bar with a face.',
      subject:
        'show the subject in first person inside flat-walled corridors, every monster and object a flat cut-out picture that always faces the camera.',
      color: 'Hellish brown, blood red, techbase grey and toxic green.',
      light:
        'Whole rooms lit at one flat brightness, some flickering, darker rooms simply dimming every pixel toward black.',
      texture:
        'Chunky square pixels you can count, walls of tiny repeating brown and grey tiles, and flat sprite enemies with no depth.',
      camera: 'First-person view with a weapon sprite and status bar.',
      mood: 'frantic hellish action',
      render:
        'A 1993 PC frame at 320 by 200 stretched to 4:3: coarse, pixelated and sharp-edged, with a gun sprite at the bottom and a status bar strip.',
      key: 'Doom flat sprite monsters; chunky pixel corridors; brown and red; status bar strip',
      avoid: ['a green-armored space marine face', 'horned red demons'],
      briefs: [
        'In a first-person 2.5D techbase corridor of brown and grey textures, a flat sprite of a furious office printer spits paper at the player, whose screen-bottom weapon is a chunky pixel stapler. The status bar face looks worried. No readable text or logo.',
        'A flickering hell-red chamber is full of flat sprite demons made of kitchen appliances. A toaster fires fireballs. No readable text or logo.',
        'An empty pixel corridor ends at a glowing blue keycard door. Toxic green sludge flows below. No readable text or logo.',
      ],
    }),
    cr('Myst 1993 - Cyan Pre-Rendered Island', 'nineties adventure game', [...T, 'myst'], {
      look: 'Cyan Myst (1993) look: still pre-rendered 3D island scenes, early CGI surfaces, strange mechanical puzzles, libraries and quiet surreal emptiness.',
      subject:
        'show the subject as a still early computer-rendered scene of a quiet surreal island, perfectly smooth and motionless.',
      color: 'Early CGI greens, stone grey and brass.',
      light:
        'Soft early computer-render light with glassy highlights and hard, perfectly clean shadows.',
      texture:
        'Plastic-smooth early CGI surfaces with simple repeating wood and stone textures, color reduced with fine dithering dots.',
      camera: 'Still first-person node views.',
      mood: 'quiet surreal mystery',
      render:
        'A 1993 still frame at 544 by 332 in 256 colors: slightly grainy dithered gradients, crisp edges and an eerily empty, frozen look.',
      key: 'Myst still island frames; glassy early CGI; dithered 256 colors; mechanical puzzles',
      briefs: [
        'Still and glassy early computer rendering of a lonely island dock leading to a brass telescope tower beside a giant gear half-sunk in the water, dithered clouds hanging motionless above and nobody anywhere. No readable text or logo.',
        'Smooth plastic-looking library room holds two strange books on pedestals and a glowing map table beside a cold fireplace, every surface frozen in dithered early computer light. No readable text or logo.',
        'A single brass lever stands on a mossy rock in a still CGI forest. A clock tower hums in the distance. No readable text or logo.',
      ],
    }),
    cr(
      'Final Fantasy VII 1997 - Pre-Rendered Backdrop Polygons',
      'nineties console role-playing game',
      [...T, 'ff7'],
      {
        look: 'Square Final Fantasy VII (1997) look: detailed pre-rendered CGI backdrops with blocky low-poly chibi characters walking in front, industrial steampunk cities and Tetsuya Nomura designs.',
        subject:
          'build the subject as a tiny chunky figure of a handful of untextured color blocks, with oversized boxy hands and head, dwarfed by a lush painted backdrop.',
        color: 'Mako green glow, rusty industrial browns and night blue.',
        light:
          'Glowing lights painted into the detailed backdrop, while the chunky figures stay evenly lit with plain smooth shading.',
        texture:
          'Smoothly shaded plain color blocks for the figures, pasted onto a far more refined and detailed computer-rendered background image.',
        camera: 'Fixed cinematic angle of a pre-rendered scene.',
        mood: 'melancholy steampunk adventure',
        render:
          'A 1997 PlayStation frame at 320 by 240: the clash between crude blocky figures and the rich detailed backdrop must be obvious.',
        key: 'FF7 lush painted backdrops; tiny chunky block figures; mako green glow',
        avoid: ['a spiky blond soldier with a buster sword', 'existing franchise characters'],
        briefs: [
          'In front of a lush painted steampunk train station glowing green, a tiny chunky flower seller and a retired mechanic made of plain color blocks argue over a broken ticket machine with their oversized mitten hands. No readable text or logo.',
          'Three tiny blocky adventurers stand on a richly painted rusty bridge above glowing green pipes while a chunky fortune-telling crow in a waistcoat reads their future from a deck of bottle caps. No readable text or logo.',
          'Lush painted slum market at night where a tiny blocky noodle vendor made of plain color shapes serves a towering stack of bowls to a queue of chunky dockworkers under glowing green lamps. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Resident Evil 1996 - Fixed-Camera Mansion Dread',
      'nineties survival horror game',
      [...T, 're-96'],
      {
        look: 'Capcom Resident Evil (1996) look: fixed cinematic camera angles over pre-rendered mansion rooms, low-poly characters, tank-control dread and door-opening transitions.',
        subject:
          'build every figure from a few dozen hard flat facets, with mitten hands, a block head wearing a painted face and a stiff upright stance, standing inside a still painted mansion room.',
        color: 'Dim mansion browns, dusty reds and dim green.',
        light:
          'Lamplight and shadows painted into the still room image, while the figures stay flatly lit with only a dark blob under their feet.',
        texture:
          'Grainy tiny textures stretched over angular figures that sit visibly on top of a soft detailed painted room, never quite matching its lighting.',
        camera: 'Fixed high-angle security-camera shots.',
        mood: 'claustrophobic survival dread',
        render:
          'A 1996 PlayStation frame at 320 by 240 on a CRT television: soft, slightly banded color and stair-stepped edges, like a period magazine screenshot.',
        key: 'Fixed cameras; painted mansion rooms; blocky mitten-handed figures; survival dread',
        avoid: ['S.T.A.R.S. uniforms', 'zombie dogs through windows'],
        briefs: [
          'From a fixed high-angle camera, a stiff mitten-handed insurance adjuster in a trench coat stands frozen in a painted mansion dining hall as a slow shuffling shape appears in the far doorway. A typewriter sits on a side table. No readable text or logo.',
          'Seen from a fixed corner camera, a blocky chef with a painted-on face backs away across a painted kitchen where the refrigerator door hangs open and something drips steadily onto the tiles. No readable text or logo.',
          'A heavy mansion door creaks open in a slow first-person transition, darkness waiting beyond it, while a single flickering candle on the painted carpet shows a trail of wet footprints leading inside. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Chrono Trigger 1995 - Toriyama Sixteen-Bit Time Travel',
      'nineties console role-playing game',
      [...T, 'chrono-trigger'],
      {
        look: 'Square Chrono Trigger (1995) SNES look: vibrant 16-bit sprites with Akira Toriyama designs, lush tile maps, time eras from prehistory to future and fairground warmth.',
        subject:
          'draw the subject as a small bright sprite about a tenth of the screen tall, with a big expressive head, walking across tile-built era maps.',
        color: 'Vibrant SNES greens, blues and warm fairground colors.',
        light: 'Bright flat sprite colors with gentle banded gradients in skies and water.',
        texture:
          'Crisp square pixels, each sprite in a small palette with dark outlines, on repeating grass, stone and wood tiles.',
        camera: 'Top-down three-quarter view of tile maps.',
        mood: 'joyful time-traveling adventure',
        render:
          'A 1995 Super Nintendo frame at 256 by 224: sharp pixels, bright saturated colors and a slightly squashed 4:3 look.',
        key: 'Chrono Trigger bright sprites; Toriyama big-head figures; tile maps; time eras',
        avoid: ['a red spiky-haired boy with a katana', 'a frog knight'],
        briefs: [
          'Across a bright tile-built medieval fairground, a big-headed sprite of a retired clockmaker and his round robot assistant step into a glowing time portal while balloons and a dancing crowd of tiny sprites wave. No readable text or logo.',
          'Squat big-headed sprite caveman grills fish beside a prehistoric lake while dinosaurs made of chunky square pixels watch from the tall ferns. No readable text or logo.',
          'Ruined future dome of grey pixel tiles glows under a banded sky, a single sprite flower growing in the rubble while a rusty robot sits beside it. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Donkey Kong Country 1994 - Rare Pre-Rendered Sprites',
      'nineties console platformer',
      [...T, 'dkc'],
      {
        look: 'Rare Donkey Kong Country (1994) SNES look: pre-rendered 3D models turned into glossy sprites, lush jungles, mine carts, banana hoards and atmospheric parallax.',
        subject:
          'show the subject as a glossy rubbery 3D-looking character flattened into pixel sprites running across lush jungle stages.',
        color: 'Jungle green, banana yellow and sunset orange.',
        light:
          'Shiny rounded highlights frozen into the sprites and soft hazy depth in the layered jungle.',
        texture:
          'Sprites that look like shiny plastic toy renders squeezed into a limited pixel palette, with slight grainy banding.',
        camera: 'Side-scrolling jungle platform view.',
        mood: 'lush jungle adventure',
        render:
          'A 1994 Super Nintendo frame at 256 by 224: 3D-looking characters but clearly made of flat pixels, dark jungle layers behind.',
        key: 'DKC shiny toy-like sprites; layered jungle; mine carts; banded color',
        avoid: ['a gorilla with a red tie', 'a monkey with a red cap'],
        briefs: [
          'Glossy toy-like sprite of a round-bellied tapir in a construction helmet rides a mine cart through a canyon of glowing crystals as a parrot flaps ahead through layered jungle. No readable text or logo.',
          'Shiny rubbery sprite sloth swings across a misty jungle lagoon on long vines while snapping crocodiles bob below and fireflies drift through the layered haze. No readable text or logo.',
          'Glinting hoard of coconuts glows in a banded jungle cave, a barrel cannon waiting beside it and a shiny sprite monkey peeking from behind a stalagmite. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Sonic the Hedgehog 1991 - Sega Loop Zone Speed',
      'nineties console platformer',
      [...T, 'sonic-91'],
      {
        look: 'Sega Sonic the Hedgehog (1991) Mega Drive look: checkerboard hills, loop-de-loops, palm trees, bright saturated blue skies and speed.',
        subject:
          'draw the subject as a small fast pixel sprite racing through checkered hills, loops and palm trees.',
        color: 'Saturated sky blue, grass green and checkerboard brown.',
        light: 'Bright flat daylight colors with strong blue sky bands and no shading.',
        texture:
          'Crisp square pixels, bold outlines and repeating checkered soil tiles in few colors.',
        camera: 'Side-scrolling speed view.',
        mood: 'bright blazing speed',
        render:
          'A 1991 Sega Mega Drive frame at 320 by 224: sharp pixels, bold primary colors and scrolling parallax bands.',
        key: 'Sonic checkered hills; loops; palm trees; bold pixel speed',
        avoid: ['a blue hedgehog with red shoes', 'gold rings'],
        briefs: [
          'Across checkerboard hills and a giant loop-de-loop under a saturated blue sky, a sprite of a speedy armadillo in roller skates blasts past palm trees collecting shiny acorns. The water sparkles below. No readable text or logo.',
          'A sprite badger surfs a waterfall at top speed through a bright zone. Robot bees chase him. No readable text or logo.',
          'An empty checkerboard hill with a single loop sits under a bright sky. A spring waits at the bottom. No readable text or logo.',
        ],
      },
    ),
    cr('Street Fighter II 1991 - Capcom Sprite Versus', 'nineties fighting game', [...T, 'sf2'], {
      look: 'Capcom Street Fighter II (1991) look: large detailed fighting sprites, world stage backgrounds with cheering crowds, health bars and chunky special-move effects.',
      subject:
        'draw two fighters as large detailed pixel sprites facing each other on a lively stage, one on each side.',
      color: 'Bright arcade colors with detailed stage backdrops.',
      light: 'Flat arcade colors with hard pixel shading bands on muscles and cloth.',
      texture:
        'Large hand-drawn pixel sprites with visible square pixels, stage backgrounds full of animated pixel onlookers.',
      camera: 'Side versus view with health bars.',
      mood: 'competitive arcade intensity',
      render:
        'A 1991 arcade frame at 384 by 224: crisp pixels, two health bar shapes across the top and a timer box between them.',
      key: 'SF2 large pixel fighters; lively stages; versus health bars',
      avoid: ['existing fighting game characters'],
      briefs: [
        'On a detailed fighting stage in a crowded fish market, two large sprites face off, a retired sushi chef and a baker in a flour-dusted apron, as the crowd of cheering fishmongers waves from the background. Health bars glow at the top. No readable text or logo.',
        'A sprite librarian fighter blocks a flying kick in a quiet reading room stage. The patrons keep reading. No readable text or logo.',
        'An empty fighting stage waits in a moonlit temple courtyard with stone lanterns. Cherry petals drift across the flagstones while monks watch quietly from the balcony. No readable text or logo.',
      ],
    }),
    cr(
      'Metal Slug 1996 - Nazca SNK Pixel War',
      'nineties arcade action game',
      [...T, 'metal-slug'],
      {
        look: 'Nazca and SNK Metal Slug (1996) look: incredibly detailed hand-drawn pixel art, comedic soldiers, chunky tanks and explosions animated frame by frame.',
        subject:
          'draw the subject as dense comedic pixel art with chunky vehicles, tiny soldiers and huge explosions.',
        color: 'Desert tan, military green and explosion orange.',
        light: 'Bright pixel explosions and fire with hard banded shading on metal.',
        texture:
          'Very dense hand-placed pixels with thick outlines, rivets, dents and debris drawn pixel by pixel.',
        camera: 'Side-scrolling war view.',
        mood: 'comedic explosive chaos',
        render:
          'A 1996 Neo Geo arcade frame at 304 by 224: crisp tiny pixels, busy side-scrolling battlefield.',
        key: 'Metal Slug dense pixels; comedic war; chunky tanks; huge explosions',
        avoid: ['a tiny green tank with a cannon'],
        briefs: [
          'In densely detailed pixel art, a comedic grandmother soldier drives a chunky ice cream truck tank through a desert town as enemy soldiers panic and drop their lunches. Pixel explosions bloom everywhere. No readable text or logo.',
          'A pixel camel with a machine gun on its back charges across the dunes. The enemy flees. No readable text or logo.',
          'A detailed pixel prisoner waits tied to a post with a gift box. He is smiling. No readable text or logo.',
        ],
      },
    ),
    cr(
      'The Secret of Monkey Island 1990 - LucasArts Painted Adventure',
      'nineties adventure game',
      [...T, 'monkey-island'],
      {
        look: 'LucasArts The Secret of Monkey Island (1990) look: moody painted pixel backgrounds, Caribbean pirate towns at night, small characters and witty verb interface.',
        subject:
          'draw the subject as small pixel characters standing in moody painted-looking Caribbean scenes.',
        color: 'Moody Caribbean night blue, tavern orange and sea teal.',
        light: 'Moonlit blue nights and warm tavern window glow built from dithered pixel shades.',
        texture:
          'Painted-looking backgrounds made of visible square pixels and dithering, in a 256-color palette.',
        camera: 'Side-view scenes with a verb interface.',
        mood: 'witty piratical adventure',
        render:
          'A 1990 PC VGA frame at 320 by 200: soft painterly pixels above a strip of verb buttons shown as blank boxes.',
        key: 'Monkey Island moody pixel scenes; pirate towns; verb button strip',
        avoid: ['a blond wannabe pirate in a white shirt', 'a ghost pirate'],
        briefs: [
          'On a moonlit painted pixel dock in a Caribbean pirate town, a small pixel accountant tries to buy a ship with a rubber chicken while a parrot heckles from a lamppost. The tavern glows orange. No readable text or logo.',
          'Three important-looking pixel pirates sit around a candlelit tavern table scheming about a map. One of them is fast asleep, snoring into his grog mug. No readable text or logo.',
          'A pixel treasure map glows on a desk under a single candle. A monkey sits on the chair. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Diablo 1996 - Blizzard Gothic Isometric',
      'nineties PC action role-playing game',
      [...T, 'diablo-96'],
      {
        look: 'Blizzard North Diablo (1996) look: dark gothic isometric pre-rendered sprites, blood-red and brown dungeons, candlelit cathedral town of Tristram and grim atmosphere.',
        subject:
          'show the subject as a small figure seen from a high diagonal angle in dark gothic dungeon rooms.',
        color: 'Dark brown, blood red and candle gold.',
        light:
          'A small circle of light around the hero, everything beyond it sinking into near black.',
        texture:
          'Grainy rendered-then-shrunk sprites and floor tiles in a murky 256-color palette with visible dithering.',
        camera: 'Isometric view with a light radius.',
        mood: 'grim gothic dread',
        render:
          'A 1996 PC frame at 640 by 480: gloomy, grainy and pixelated, with red and blue orb shapes at the bottom corners.',
        key: 'Diablo diagonal view; light circle; gothic dungeon; red and blue orbs',
        avoid: ['a horned red demon lord'],
        briefs: [
          'Seen from high on the diagonal in a cathedral dungeon, a small grainy village blacksmith holds a lantern whose circle of light reveals a crowd of shambling bone shapes just at its edge. No readable text or logo.',
          'Grainy village square at night seen from high on the diagonal, a single campfire glowing and a lone cow standing in its circle of light while the rest sinks into black. No readable text or logo.',
          'An isometric treasure chest glows faintly in a dark stone crypt. The light radius of the approaching hero barely reaches it, and something shifts in the shadows. No readable text or logo.',
        ],
      },
    ),
    cr('StarCraft 1998 - Blizzard Sci-Fi RTS', 'nineties strategy game', [...T, 'starcraft'], {
      look: 'Blizzard StarCraft (1998) look: isometric pre-rendered sci-fi units, alien creep, industrial space bases, dark space platforms and RTS interface.',
      subject:
        'show the subject as tiny units seen from a high diagonal angle on dark sci-fi terrain.',
      color: 'Dark space blue, alien purple and industrial grey.',
      light: 'Shaded tiny units with bright glints on dark rocky or alien-creep ground.',
      texture:
        'Tiny rendered-then-shrunk unit sprites and grainy tile terrain in a limited palette.',
      camera: 'Isometric RTS view with interface.',
      mood: 'tense sci-fi warfare',
      render:
        'A 1998 PC frame at 640 by 480: small crisp pixel units, a minimap box and command panel shapes along the bottom.',
      key: 'StarCraft tiny units; diagonal view; alien creep; bottom command panel',
      avoid: ['existing faction units'],
      briefs: [
        'On a dark space platform seen from high on the diagonal, a squad of tiny delivery robots builds a noodle stand while a purple alien carpet creeps toward it from the map edge. No readable text or logo.',
        'Tiny crisp mining drones harvest glowing crystals on a snowy moon outpost seen from above at an angle, while a hungry creature watches from the ridge. No readable text or logo.',
        'An isometric sci-fi base stands empty under a purple alien sky. Its alarms blink red, its turrets turn slowly, and the creep spreads toward the gate. No readable text or logo.',
      ],
    }),
    cr(
      'Crash Bandicoot 1996 - Naughty Dog Cartoon 3D',
      'nineties console platformer',
      [...T, 'crash'],
      {
        look: 'Naughty Dog Crash Bandicoot (1996) look: cartoon 3D corridors into the screen, lush tropical islands, wooden crates, running-toward-camera chases and vibrant PS1 colors.',
        subject:
          'show the subject from behind as a rubbery cartoon figure running into the screen down a narrow jungle path.',
        color: 'Vibrant tropical green, crate brown and ocean blue.',
        light:
          'Bright tropical light with colors that shift from corner to corner across each surface.',
        texture:
          'Figures and crates with simple shapes and a few painted details, jungle walls of blurry textures that wobble slightly.',
        camera: 'Behind-the-character corridor view.',
        mood: 'zany tropical fun',
        render:
          'A 1996 PlayStation frame at 512 by 240 on a CRT: soft, a little jagged, wooden crates and fruit along a path.',
        key: 'Crash jungle path; crates; rubbery cartoon runner; soft PS1 image',
        avoid: ['an orange bandicoot in jeans'],
        briefs: [
          'Running into the screen down a narrow jungle path, a zany rubbery iguana in sneakers smashes wooden crates of mangoes while a giant boulder rolls after him and the soft textures wobble. No readable text or logo.',
          'A cartoon 3D penguin surfs a river of lava on a crate lid. The volcano rumbles. No readable text or logo.',
          'Lone wooden crate with blurry painted planks sits on a tropical beach under a simple palm tree, ticking, while a crab edges nervously away along the soft sand. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Super Mario 64 1996 - N64 Blurry Texture Worlds',
      'nineties console platformer',
      [...T, 'mario-64'],
      {
        look: 'Nintendo Super Mario 64 (1996) look: bright blocky 3D worlds with blurry filtered textures, painting portals, floating islands, fog at the draw distance and cheerful primary colors.',
        subject:
          'show the subject in bright toy-like worlds of big simple shapes: smooth hills, flat cube platforms and round trees.',
        color: 'Cheerful primary colors and grass green.',
        light: 'Flat cheerful light, simple smooth shading and colored fog fading distant hills.',
        texture:
          'Tiny textures stretched and smeared into soft blurry color, grass and brick patterns barely readable.',
        camera: 'Third-person chase camera.',
        mood: 'cheerful playful exploration',
        render:
          'A 1996 Nintendo 64 frame at 320 by 240: very soft, almost out-of-focus image with smooth simple shapes.',
        key: 'N64 soft blur; toy-like simple worlds; smeared textures; colored fog',
        avoid: ['a mustached plumber in red and blue', 'a princess castle with star doors'],
        briefs: [
          'Across a bright toy-like world of smooth hills and flat cube platforms, a beaver in overalls leaps between floating wooden rafts toward a windmill made of simple blocks under colored fog. No readable text or logo.',
          'Smoothly simple turtle skates down a frozen river canyon of soft blurry ice, a crowd of round snowmen with coal-dot faces cheering from the smeared white banks. No readable text or logo.',
          'Floating island of flat grassy cubes drifts in a soft blue sky, a round red balloon tied to a simple wooden signpost fluttering beside a sleepy smooth-shelled snail. No readable text or logo.',
        ],
      },
    ),
    cr(
      'GoldenEye 007 1997 - Rare N64 Fog Shooter',
      'nineties console shooter',
      [...T, 'goldeneye'],
      {
        look: 'Rare GoldenEye 007 (1997) N64 look: first-person corridors with blurry textures, heavy fog, low frame rate, stiff low-poly guards and Cold War facilities.',
        subject:
          'build figures from a few boxy chunks with flat painted-on faces and stiff arms, walking plain box-shaped corridors seen in first person.',
        color: 'Military grey, snow white and fog.',
        light:
          'Flat shadowless light and a thick grey-blue fog wall that swallows everything a short way ahead.',
        texture:
          'Every wall and uniform is a tiny texture stretched large and smeared into soft blurry color, like fuzzy wallpaper with no crisp detail.',
        camera: 'First-person view with a weapon model.',
        mood: 'tense spy infiltration',
        render:
          'A 1997 Nintendo 64 frame at 320 by 240 on a CRT: very soft and blurry overall, with a small chunky gun model in the lower right.',
        key: 'GoldenEye fog wall; smeared blurry textures; boxy stiff guards; facilities',
        avoid: ['a tuxedoed spy', 'a gun barrel logo'],
        briefs: [
          'In first person through a thick grey-blue fog wall, a boxy night janitor holding a mop like a weapon creeps through a Cold War dam facility while stiff chunky guards patrol the snowy catwalk ahead. No readable text or logo.',
          'A boxy security guard stands frozen in a tiled bathroom stall staring straight ahead, his cap a simple wedge and his mustache a flat blurry smear painted onto a block face. No readable text or logo.',
          'Empty corridor dissolves into a thick grey fog wall ahead, smeared blurry wall textures leading to a locked vault door while a red alarm light spins over the boxy doorframe. No readable text or logo.',
        ],
      },
    ),
    cr('PaRappa the Rapper 1996 - Paper-Flat Rhythm', 'nineties rhythm game', [...T, 'parappa'], {
      look: 'NanaOn-Sha PaRappa the Rapper (1996) look: paper-flat 2D characters by Rodney Greenblat in 3D worlds, bright pop colors and rhythm game energy.',
      subject:
        'show the subject as a paper-thin flat cartoon cutout, visibly without thickness, standing in a bright simple 3D set.',
      color: 'Bright pop pink, yellow, blue and green.',
      light: 'Flat cheerful light with bright colors and no real shading on the flat characters.',
      texture:
        'Flat cutout characters with thin black outlines that disappear when turned sideways, in simple blocky rooms.',
      camera: 'Stage-like rhythm scenes.',
      mood: 'cheerful rhythmic optimism',
      render:
        'A 1996 PlayStation frame at 320 by 240: soft, bright and simple, with a row of button symbol shapes near the top.',
      key: 'PaRappa paper-thin cutouts; Greenblat designs; pop colors; button prompt row',
      avoid: ['a rapping dog in a knit hat', 'an onion martial arts master'],
      briefs: [
        'In a bright pop 3D kitchen, a paper-flat cartoon cutout of a giraffe baker raps instructions to a paper-flat frog apprentice who keeps flipping pancakes onto the ceiling. The whole set bounces to the beat. No readable text or logo.',
        'A paper-flat cat driving instructor raps behind the wheel of a toy car. The road wobbles. No readable text or logo.',
        'A paper-flat microphone stands alone on a bright pink stage with a paper-flat curtain. The spotlight bounces to the beat and a paper audience waves its flat hands. No readable text or logo.',
      ],
    }),
    cr('Half-Life 1998 - Valve Black Mesa Facility', 'nineties PC shooter', [...T, 'half-life'], {
      look: 'Valve Half-Life (1998) look: first-person science facility corridors, orange and beige lab textures, flickering fluorescents, scientists in lab coats and resonance cascade chaos.',
      subject:
        'show the subject in first person in science facility corridors, people with boxy heads, simple faces and stiff lab coats.',
      color: 'Facility beige, hazard orange and industrial grey.',
      light: 'Flickering fluorescent light with soft blotchy light patches baked onto walls.',
      texture:
        'Blurry low-detail wall and floor textures, simple boxy props and figures built from visible straight-edged chunks.',
      camera: 'First-person corridor view.',
      mood: 'unraveling facility dread',
      render:
        'A 1998 PC frame at 640 by 480: slightly blurry, with a crosshair and health and armor number shapes at the bottom.',
      key: 'Half-Life facility; boxy lab coats; flickering fluorescents; blotchy baked light',
      avoid: ['an orange hazard suit with a crowbar', 'a man in a blue suit with a briefcase'],
      briefs: [
        'Along a first-person science facility corridor, a panicked boxy cafeteria worker in a paper hat runs past flickering fluorescents as a portal of green light opens beside the vending machines. No readable text or logo.',
        'Two blocky scientists with simple painted faces argue beside a test chamber as sparks fly, neither noticing the ceiling vent slowly swinging open above them. No readable text or logo.',
        'An empty tram rolls slowly into a silent facility station deep underground. The monorail lights flicker and a security guard waves from behind the glass. No readable text or logo.',
      ],
    }),
    cr(
      'Grim Fandango 1998 - LucasArts Calavera Noir',
      'nineties adventure game',
      [...T, 'grim-fandango'],
      {
        look: 'LucasArts Grim Fandango (1998) look: Day of the Dead calavera characters, art deco film noir, pre-rendered backgrounds with low-poly skeletons and smoky atmosphere.',
        subject:
          'show the subject as calavera skeleton figures with simple smooth heads standing in lush painted art deco scenes.',
        color: 'Noir amber, marigold orange and deep teal.',
        light:
          'Smoky noir lighting and neon painted into the detailed backgrounds, with plainly lit figures on top.',
        texture:
          'Simple smooth skeleton figures with painted faces over rich, detailed painted art deco rooms.',
        camera: 'Cinematic noir fixed angles.',
        mood: 'smoky deco noir',
        render:
          'A 1998 PC frame at 640 by 480: soft figures clearly simpler than the detailed painted backdrop behind them.',
        key: 'Grim Fandango calaveras; art deco noir; painted backdrops; simple smooth figures',
        avoid: ['a skeleton travel agent in a suit and a demon mechanic'],
        briefs: [
          'Smoky painted art deco nightclub of the afterlife, where a smooth simple calavera jazz singer in a sequin gown performs under neon marigold lights while skeleton patrons sip glowing drinks. No readable text or logo.',
          'A skeleton detective stands on a rainy deco street holding a paper umbrella. His cigarette glows. No readable text or logo.',
          'A single marigold rests on a deco desk under a noir lamp. A skeleton hand reaches for it. No readable text or logo.',
        ],
      },
    ),
    cr(
      'EarthBound 1994 - Ape Suburban Psychedelia',
      'nineties console role-playing game',
      [...T, 'earthbound'],
      {
        look: 'Ape and HAL EarthBound (1994) SNES look: small suburban sprite towns, oblique perspective, quirky everyday enemies and psychedelic swirling battle backgrounds.',
        subject:
          'draw the subject as a small quirky sprite in simple suburban towns, or facing an enemy over a swirling pattern.',
        color: 'Pastel suburban colors and psychedelic battle swirls.',
        light: 'Flat simple colors in town and wildly cycling bright colors in battle backgrounds.',
        texture:
          'Crisp simple pixel sprites with few colors, battle backdrops of wavy animated psychedelic stripes.',
        camera: 'Oblique top-down town view or battle screen.',
        mood: 'quirky suburban surrealism',
        render:
          'A 1994 Super Nintendo frame at 256 by 224: plain crisp pixels, cozy town or trippy battle screen with blank rolling-meter boxes.',
        key: 'EarthBound quirky sprites; suburban towns; psychedelic battle stripes',
        avoid: ['a boy in a red cap with a baseball bat'],
        briefs: [
          'On a psychedelic swirling battle background, a quirky enemy made of a grumpy office stapler faces a tiny sprite party of a retired mailman, a dog and a librarian. The swirls pulse in pastel colors. No readable text or logo.',
          'A small sprite town at dusk holds a burger shop, a drugstore and a suspicious crashed meteor. A cop stands guard. No readable text or logo.',
          'A single sprite telephone rings in an empty suburban living room at night. Beside it the swirling psychedelic battle background is already leaking through the wallpaper. No readable text or logo.',
        ],
      },
    ),
    cr('Ecco the Dolphin 1992 - Sega Alien Ocean', 'nineties console game', [...T, 'ecco'], {
      look: 'Sega Ecco the Dolphin (1992) look: detailed underwater pixel art, eerie deep blue oceans, glyph crystals, alien architecture and lonely atmosphere.',
      subject:
        'draw the subject swimming through eerie detailed pixel oceans with alien crystals and deep caverns.',
      color: 'Deep ocean blue, crystal cyan and alien purple.',
      light: 'Filtered blue underwater light bands and glowing crystal pixels in the dark.',
      texture:
        'Detailed pixel rocks, coral and water layers with visible square pixels and dithered depth.',
      camera: 'Side-view underwater exploration.',
      mood: 'lonely alien ocean',
      render:
        'A 1992 Sega Mega Drive frame at 320 by 224: crisp pixels in deep blues, lonely and vast.',
      key: 'Ecco pixel oceans; glyph crystals; alien depths; lonely blues',
      avoid: ['a bottlenose dolphin with star markings'],
      briefs: [
        'In detailed pixel art of an eerie deep ocean, a lonely sea turtle swims past glowing glyph crystals and the sunken remains of an alien spiral tower. Shafts of light fall from far above. No readable text or logo.',
        'A pixel humpback whale sings to a glowing crystal buried in the sand of a deep reef. Schools of tiny fish gather in rings around the sound. No readable text or logo.',
        'A single glowing crystal floats in a dark pixel ocean trench. Something enormous passes behind it. No readable text or logo.',
      ],
    }),
  ],
};

export default spec;
