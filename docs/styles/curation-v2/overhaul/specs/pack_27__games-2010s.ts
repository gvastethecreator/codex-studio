import type { Spec } from '../tools/apply';
import { cr } from './_authors';

// Video games of the 2010s: each preset names its game, studio and year and rebuilds that game's
// real on-screen look. Cards stage original characters and places in that look. Games already
// named in pack_12 (Cuphead, Hades, Ori, Journey, Fez and others) are not repeated here.
const T = ['games-2010s', 'video-game-era'];

const spec: Spec = {
  pack: 'pack_27',
  category: '12. Video Games 2010s',
  newCategory: { id: 'video-games-2010s' },
  updates: {},
  creates: [
    cr('Limbo 2010 - Playdead Monochrome Silhouette', 'twenty-tens indie game', [...T, 'limbo'], {
      look: 'Playdead Limbo (2010) look: side-scrolling black silhouettes on a grey foggy monochrome world, film grain, vignette, deadly traps and eerie forest silence.',
      subject: 'render every subject as a black silhouette against grey foggy monochrome layers.',
      color: 'Monochrome black, grey fog and white glow.',
      light:
        'Soft grey fog light that fades to near white behind and darkens heavily toward every edge of the frame.',
      texture:
        'Flicker of film grain, soft blur on far layers and crisp black silhouettes in front.',
      camera: 'Side-scrolling view with parallax fog layers.',
      mood: 'eerie silent dread',
      render:
        'A 2010 side-view frame at 1280 by 720 in pure greyscale: black cut-out shapes over layers of grey fog, heavy vignette.',
      key: 'Limbo silhouettes; grey fog; film grain; vignette',
      avoid: ['a small silhouette boy with glowing white eyes', 'a giant silhouette spider'],
      briefs: [
        'In a grey foggy forest drawn only in black silhouettes, a tiny postman on a bicycle pedals across a rope bridge while enormous silhouetted moths hang motionless among the trees above him. No readable text or logo.',
        'A black silhouette lighthouse stands on a grey hill in thick fog. Its lamp flickers once, and the waves below make no sound at all. No readable text or logo.',
        'A single silhouette umbrella floats down a misty grey river past dead reeds. A rope swing sways on the far bank as if someone just let go. No readable text or logo.',
      ],
    }),
    cr(
      'Minecraft 2011 - Mojang Voxel Block World',
      'twenty-tens sandbox game',
      [...T, 'minecraft'],
      {
        look: 'Mojang Minecraft (2011) look: blocky voxel world of one-meter cubes, sixteen-pixel textures, square sun, blocky trees, torchlit caves and first-person building.',
        subject: 'render every subject built from blocky cubes with sixteen-pixel textures.',
        color: 'Grass green, dirt brown, sky blue and torch orange.',
        light:
          'Flat daylight on cube faces, each face one of a few brightness steps, torchlight fading in blocky steps.',
        texture:
          'Every surface a cube face with a sixteen-by-sixteen pixel texture, blurry nowhere, crisp square pixels everywhere.',
        camera: 'First-person view with a blocky hand.',
        mood: 'cozy creative freedom',
        render:
          'A 2011 PC frame at 1280 by 720: world built entirely from one-meter cubes, a square sun, a hotbar of blank slots at the bottom.',
        key: 'Minecraft cubes; 16px textures; square sun; torches',
        avoid: ['a green four-legged creeper', 'a blocky man in a cyan shirt'],
        briefs: [
          'In a blocky voxel world of sixteen-pixel textures, a cube-built grandmother tends a pumpkin farm on a floating island she built herself while a square sun sets behind blocky clouds. No readable text or logo.',
          'A torchlit blocky mine shaft descends into lava-lit caverns full of glittering ore. A minecart waits half-full at the bottom. No readable text or logo.',
          'A single blocky cottage with a chimney stands on a snowy cube mountain at night. Its windows glow orange against the square moon. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Bastion 2011 - Supergiant Painted Floating Ruins',
      'twenty-tens action game',
      [...T, 'bastion'],
      {
        look: 'Supergiant Games Bastion (2011) look: lush hand-painted isometric ruins that rebuild themselves as you walk, floating islands in a void, Jen Zee painting and warm narrated melancholy.',
        subject:
          'render the subject small on hand-painted isometric fragments assembling in a void.',
        color: 'Warm painted amber, teal and void blue.',
        light: 'Soft painted sunset light with glowing edges on floating ground pieces.',
        texture:
          'Lush hand-painted tiles and props with visible brush marks, seen from a high diagonal angle.',
        camera: 'Isometric view over floating ground pieces.',
        mood: 'warm narrated melancholy',
        render:
          'A 2011 frame at 1280 by 720: small hero on painted ground fragments rising out of an empty sky-colored void.',
        key: 'Bastion painted isometric; assembling ground; void',
        avoid: ['a white-haired kid with a giant hammer'],
        briefs: [
          'As hand-painted ground tiles fly up from the void to form a path under her feet, a traveling seamstress walks across floating ruins toward a tiny cottage glowing with lanterns. No readable text or logo.',
          'A painted market square hangs in the sky, half assembled, with fruit stalls still floating into place. A cat sleeps on the one finished bench. No readable text or logo.',
          'A single painted tree grows from a floating island at dusk. Its falling leaves drift down into the endless blue void below. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Hotline Miami 2012 - Dennaton Top-Down Neon',
      'twenty-tens action game',
      [...T, 'hotline-miami'],
      {
        look: 'Dennaton Games Hotline Miami (2012) look: top-down pixel art in pulsing eighties neon, psychedelic color shifts, animal masks, carpeted rooms and brutal one-hit action.',
        subject: 'render the subject as small top-down pixel figures in neon-lit rooms.',
        color: 'Pulsing neon magenta, cyan and hot orange.',
        light: 'Throbbing neon pinks and cyans cycling across the whole screen.',
        texture:
          'Chunky low-resolution pixels with color bleeding into neighbors and a slight wobble of the whole view.',
        camera: 'Top-down view with a wobbling screen.',
        mood: 'feverish neon frenzy',
        render:
          'A 2012 PC frame: small top-down pixel figures in a tilted neon room, flat floor patterns, a thick chromatic smear.',
        key: 'Hotline Miami neon; top-down pixels; animal masks',
        avoid: ['a man in a letterman jacket and rooster mask'],
        briefs: [
          'In top-down pixel art pulsing with magenta and cyan neon, a pizza delivery rider in a fox mask slips through a carpeted Miami apartment full of snoring party guests without waking any of them. No readable text or logo.',
          'A neon nightclub seen from above throbs with color as dancers freeze mid-step. One person is standing still near the bar. No readable text or logo.',
          'A top-down pixel phone rings on a neon-lit kitchen floor. The whole screen wobbles to the beat of the ringtone. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Kentucky Route Zero 2013 - Cardboard Computer Magic Realism',
      'twenty-tens adventure game',
      [...T, 'kentucky-route-zero'],
      {
        look: 'Cardboard Computer Kentucky Route Zero (2013) look: flat untextured angular shapes like a paper theater, magic realist Kentucky roads, single lamps and deep blue darkness.',
        subject:
          'show the subject as flat untextured angular figures of one or two solid colors on a theatrical stage-like set.',
        color: 'Muted night blues, warm amber pools and stark silhouettes.',
        light: 'Single lamps and theatrical spotlights cutting shapes out of deep dark blue.',
        texture:
          'Plain flat-colored angular shapes with no texture at all, like a paper theater set.',
        camera: 'Wide theatrical staging like a play.',
        mood: 'quiet magic-realist melancholy',
        render:
          'A 2013 PC frame at 1280 by 720: sparse flat shapes, small figures, wide dark spaces and one warm lamp.',
        key: 'Kentucky Route Zero flat untextured shapes; theatrical light; wide dark stages',
        briefs: [
          'Beneath a single stage-like spotlight on an empty Kentucky gas station at night, a tired antiques deliveryman and his old dog stand beside a truck while a huge bird silhouette crosses the moon. No readable text or logo.',
          'An underground highway runs through a cave lit by one amber lamp. A pickup truck idles at a fork in the road. No readable text or logo.',
          'A bar sits on the back of a giant eagle flying through the night sky. A lone musician plays guitar on its roof. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Papers Please 2013 - Pope Border Booth Pixels',
      'twenty-tens simulation game',
      [...T, 'papers-please'],
      {
        look: 'Lucas Pope Papers, Please (2013) look: grim low-resolution pixel art of a border checkpoint booth, muted Soviet greys and browns, document stamps and queues in the cold.',
        subject: 'render the subject as grim muted pixel figures at a cold border booth.',
        color: 'Muted grey, drab brown and stamp red.',
        light: 'Flat cold light in drab greys, browns and olive with no gradients.',
        texture:
          'Chunky low-resolution pixels, tiny stiff figures in a queue and big pixel documents on a desk.',
        camera: 'Booth desk view with a window.',
        mood: 'grim bureaucratic tension',
        render:
          'A 2013 PC frame at 570 by 320 scaled up: booth desk below, queue of small grim figures above, stamp shapes.',
        key: 'Papers Please booth; muted pixels; stamps; queue',
        briefs: [
          'In grim muted pixel art, a tired border inspector in a drab booth studies the passport of a traveling circus bear standing patiently at the window while a long queue shivers in the snow outside. No readable text or logo.',
          'A pixel checkpoint wall stands under a grey sky with guards in long coats. A single pigeon crosses without papers. No readable text or logo.',
          'A pixel desk holds a red stamp and a stack of forms in a cold booth. The heater beside it flickers and dies. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Transistor 2014 - Supergiant Art Nouveau Cyber City',
      'twenty-tens action game',
      [...T, 'transistor'],
      {
        look: 'Supergiant Games Transistor (2014) look: painterly isometric cyberpunk city in art nouveau curves, glowing turquoise and red, Jen Zee illustration and elegant digital melancholy.',
        subject:
          'render the subject in painterly isometric art nouveau city streets with digital glow.',
        color: 'Turquoise, crimson and warm gold.',
        light: 'Glowing turquoise digital accents and soft painted light on elegant streets.',
        texture:
          'Painterly illustration with art nouveau curves and gold trim, seen from a high diagonal angle.',
        camera: 'Isometric city view.',
        mood: 'elegant digital melancholy',
        render:
          'A 2014 frame at 1280 by 720: painted city plaza, a small figure with a glowing sword, turquoise highlights.',
        key: 'Transistor art nouveau city; turquoise glow; painterly',
        avoid: ['a red-haired singer carrying a glowing talking sword'],
        briefs: [
          'On a painterly art nouveau street in a glowing turquoise city, an elderly jazz pianist rolls her piano on a cart past empty cafés while white digital shapes pixelate the buildings behind her. No readable text or logo.',
          'An elegant rooftop garden overlooks a city fading into white pixels. A bench waits under a crimson umbrella. No readable text or logo.',
          'A glowing turquoise lamp post stands alone on a curving bridge at dusk. Its light is slowly dissolving into squares. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Undertale 2015 - Toby Fox Charming Lo-Fi RPG',
      'twenty-tens role-playing game',
      [...T, 'undertale'],
      {
        look: 'Toby Fox Undertale (2015) look: charming lo-fi pixel RPG, simple sprites, black battle screens with bullet-hell hearts, snowy towns, quirky monsters and heartfelt humor.',
        subject: 'render the subject as simple lo-fi pixel sprites in quirky underground towns.',
        color: 'Simple lo-fi palettes on black.',
        light: 'Flat simple colors with no shading, many screens mostly black.',
        texture:
          'Simple crisp pixel sprites with few colors and thick outlines, plain repeating floor tiles.',
        camera: 'Top-down RPG view or black battle box.',
        mood: 'quirky heartfelt humor',
        render:
          'A 2015 PC frame at 640 by 480: small sprites in quirky rooms or a white-bordered battle box on black.',
        key: 'Undertale lo-fi sprites; battle box; quirky monsters',
        avoid: [
          'a skeleton in a blue hoodie',
          'a goat mother in purple robes',
          'a striped-shirt child',
        ],
        briefs: [
          'In a snowy lo-fi pixel town underground, a shy cactus shopkeeper offers a nervous traveler a free cinnamon bun while a snowman in the square cheerfully asks to be taken far away. No readable text or logo.',
          'A black battle box holds a tiny heart dodging falling spaghetti. The monster across it is apologizing. No readable text or logo.',
          'A single golden flower grows in a patch of light at the bottom of a dark cave. A tiny pixel bird watches it. No readable text or logo.',
        ],
      },
    ),
    cr('Splatoon 2015 - Nintendo Ink Turf Pop', 'twenty-tens shooter game', [...T, 'splatoon'], {
      look: 'Nintendo Splatoon (2015) look: glossy candy-colored ink splattered across plazas and skate parks, squid-kid fashion, street culture and bright urban pop.',
      subject: 'render the subject in glossy candy-colored ink-splattered urban arenas.',
      color: 'Neon orange, magenta and electric blue ink.',
      light: 'Bright daylight with glossy wet highlights on ink puddles and toy-like surfaces.',
      texture: 'Shiny wet splats of neon ink over clean chunky toy-like buildings and ramps.',
      camera: 'Third-person arena view.',
      mood: 'bright bouncy fun',
      render:
        'A 2015 Wii U frame at 1280 by 720: bright candy colors, glossy ink, a round meter shape in a corner.',
      key: 'Splatoon glossy ink; turf splats; urban pop',
      avoid: ['squid-kid inklings with tentacle hair', 'a sea urchin coach'],
      briefs: [
        'In a bright urban plaza splashed with glossy neon ink, a retired traffic warden rolls a paint roller across the ground in electric blue while children in bucket hats cheer from the fountain. No readable text or logo.',
        'A skate park is half covered in magenta ink and half in orange. A pigeon stands exactly on the line between them. No readable text or logo.',
        'A single glossy ink splat drips down a vending machine in an empty plaza. The drink it dispenses is the same color. No readable text or logo.',
      ],
    }),
    cr('Inside 2016 - Playdead Muted Dystopia', 'twenty-tens indie game', [...T, 'inside'], {
      look: 'Playdead Inside (2016) look: muted 2.5D dystopia in soft grey and cold blue, a small red figure, rows of mind-controlled workers, flooded labs and eerie restrained lighting.',
      subject:
        'render the subject small in muted grey 2.5D dystopian spaces with restrained light.',
      color: 'Muted grey, cold blue and one small red accent.',
      light: 'Soft restrained beams of light through grey haze, one small red accent.',
      texture: 'Smooth simple 3D shapes with almost no surface detail, softened by fog.',
      camera: 'Side-scrolling 2.5D cinematic view.',
      mood: 'eerie restrained dread',
      render:
        'A 2016 side-view frame at 1920 by 1080: muted grey layers, a tiny figure in red, wide empty space.',
      key: 'Inside muted grey; red accent; mind-controlled rows',
      avoid: ['a small boy in a red sweater', 'a giant flesh blob'],
      briefs: [
        'In a muted grey factory hall, a small figure in a red raincoat hides behind a crate as rows of identical workers march in perfect step toward a glowing doorway. No readable text or logo.',
        'A flooded laboratory glows cold blue under a single lamp. Something moves beneath the dark water. No readable text or logo.',
        'A cornfield at night is swept by cold searchlights from a distant truck. One stalk sways differently from the rest. No readable text or logo.',
      ],
    }),
    cr(
      'Superhot 2016 - Superhot Team White Red Crystal',
      'twenty-tens shooter game',
      [...T, 'superhot'],
      {
        look: 'Superhot Team Superhot (2016) look: stark white minimalist rooms, crystalline red enemies that shatter, time that moves only when you move, and slow frozen bullet trails.',
        subject: 'render people as faceless crystalline red figures in stark white rooms.',
        color: 'Stark white, crystal red and black accents.',
        light: 'Flat clean white light with no shadows worth noticing.',
        texture:
          'Faceted red glassy figures that shatter into shards against smooth white planes and black objects.',
        camera: 'First-person view with frozen motion.',
        mood: 'cool frozen tension',
        render:
          'A 2016 PC frame at 1920 by 1080: bare white rooms, red crystal figures frozen mid-motion, a black weapon.',
        key: 'Superhot white rooms; red crystal figures; frozen time',
        briefs: [
          'Frozen mid-moment in a stark white café, a crystalline red waiter shatters into shards as a thrown coffee cup hangs in the air trailing a slow white streak across the room. No readable text or logo.',
          'An elevator in a white building opens on three red crystal figures standing perfectly still. Nothing moves until you do. No readable text or logo.',
          'A single red crystal fist hangs in the air of an empty white room. Its shards drift outward very slowly. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Hollow Knight 2017 - Team Cherry Hand-Drawn Gloom',
      'twenty-tens metroidvania game',
      [...T, 'hollow-knight'],
      {
        look: 'Team Cherry Hollow Knight (2017) look: hand-drawn gloomy insect kingdom, blue-grey caverns, ink-black bug characters with white masks, glowing lanterns and melancholic depth.',
        subject: 'render the subject as small hand-drawn bug figures in gloomy layered caverns.',
        color: 'Gloomy blue-grey, ink black and pale white.',
        light: 'Soft lantern glow and pale light shafts in dark blue caverns.',
        texture: 'Clean hand-drawn inked sprites over softly painted, blurred background layers.',
        camera: 'Side-view metroidvania with deep parallax.',
        mood: 'melancholic gloomy wonder',
        render:
          'A 2017 side-view frame at 1920 by 1080: small bug knight in a gloomy layered cavern, mask shapes top left.',
        key: 'Hollow Knight gloom; insect kingdom; hand-drawn',
        avoid: ['a small knight with a white horned mask and nail'],
        briefs: [
          'In a gloomy blue-grey cavern of an insect kingdom, a small beetle cartographer with a lantern sketches a map while giant pale roots hang overhead and rain falls from a hole in the ceiling. No readable text or logo.',
          'A hand-drawn bug village rests on a bench in the rain. A lone lamp glows over a well. No readable text or logo.',
          'A cracked white shell lies on a mossy ledge above an endless dark chasm. A tiny glowing moth circles it. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Nier Automata 2017 - PlatinumGames Faded Ruin',
      'twenty-tens action game',
      [...T, 'nier-automata'],
      {
        look: 'PlatinumGames NieR:Automata (2017) look: sun-faded ruined city overgrown with green, desaturated sepia sheen, round rusty machine lifeforms, elegant androids and melancholic open spaces.',
        subject: 'render the subject in sun-faded overgrown city ruins with a sepia sheen.',
        color: 'Faded sepia, overgrown green and pale sky.',
        light: 'Bright hazy sun over overgrown ruins, washed into a faded sepia sheen.',
        texture: 'Soft desaturated textures, bloom on bright areas and moss over cracked concrete.',
        camera: 'Third-person view over open ruins.',
        mood: 'melancholic faded beauty',
        render:
          'A 2017 PlayStation 4 frame at 1920 by 1080: faded colors, overgrown city, simple round machine enemies.',
        key: 'Nier ruined city; sepia haze; round machines',
        avoid: ['a white-haired android in a black blindfold and dress'],
        briefs: [
          'In a sun-faded city overgrown with green vines, a round rusty machine with a tiny watering can tends a garden of flowers growing through the cracked asphalt while deer graze nearby. No readable text or logo.',
          'An amusement park glows in the hazy distance with fireworks at noon. The ferris wheel has not turned in centuries. No readable text or logo.',
          'A single rusted robot sits on a ruined overpass watching the sunset. Moss has grown over its shoulders. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Fortnite 2017 - Epic Cartoon Battle Island',
      'twenty-tens multiplayer game',
      [...T, 'fortnite'],
      {
        look: 'Epic Games Fortnite (2017) look: bright stylized cartoon 3D island, chunky readable characters, instant building ramps and walls, loot llamas and saturated playful color.',
        subject: 'render the subject as bright chunky cartoon 3D characters on a stylized island.',
        color: 'Saturated grass green, sky blue and loot purple.',
        light: 'Bright cheerful daylight with soft clean shadows.',
        texture:
          'Clean smooth cartoon materials with simple color gradients and chunky readable shapes.',
        camera: 'Third-person over-the-shoulder view.',
        mood: 'playful competitive chaos',
        render:
          'A 2017 frame at 1920 by 1080: bright stylized island, wooden ramps being built, circular minimap shape.',
        key: 'Fortnite cartoon island; building ramps; bright color',
        avoid: ['existing Fortnite skins', 'a purple loot llama piñata'],
        briefs: [
          'On a bright cartoon island, a cheerful farmer in overalls builds a wooden ramp in seconds to rescue her cat from a tree while a storm of purple energy closes in on the horizon. No readable text or logo.',
          'A cartoon bus floats through the sky beneath a hot-air balloon. Passengers jump out in every direction. No readable text or logo.',
          'A tiny wooden fort stands alone on a hill in a cartoon sunset. A single glowing chest waits inside. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Celeste 2018 - Maddy Makes Games Pixel Mountain',
      'twenty-tens platformer game',
      [...T, 'celeste'],
      {
        look: 'Maddy Makes Games Celeste (2018) look: crisp pixel-art mountain climbing, snowy ruins, glowing dash trails, lush pastel palettes and a heartfelt climb against anxiety.',
        subject: 'render the subject as a tiny pixel climber on crisp snowy mountain levels.',
        color: 'Pastel snow pinks, teal and dusk purple.',
        light: 'Soft pastel glow in snowy pinks and blues, colored trails behind dashes.',
        texture:
          'Crisp detailed pixel tiles and a tiny pixel climber, with smooth particle snow drifting over them.',
        camera: 'Side-view single-screen platformer.',
        mood: 'determined heartfelt climb',
        render:
          'A 2018 frame at 320 by 180 scaled up: crisp pixel mountain level, tiny red-haired climber, drifting snow.',
        key: 'Celeste pixel mountain; dash trails; pastel snow',
        avoid: ['a red-haired climber in a blue jacket'],
        briefs: [
          'On a crisp pixel mountain ledge under pastel dusk, a tiny retired mail carrier with a backpack dashes across a gap leaving a glowing trail while strawberries hover above spiky ice. No readable text or logo.',
          'A pixel campfire burns on a snowy ledge at night. Two travelers share a bag of marshmallows. No readable text or logo.',
          'A ruined pixel hotel on the mountainside is full of dust and floating debris. One lamp is still lit. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Return of the Obra Dinn 2018 - Pope 1-Bit Dither',
      'twenty-tens mystery game',
      [...T, 'obra-dinn'],
      {
        look: 'Lucas Pope Return of the Obra Dinn (2018) look: 1-bit dithered monochrome 3D like an old Macintosh, frozen tableaux of deaths aboard an East Indiaman ship, and deduction.',
        subject: 'render the subject as a frozen 1-bit dithered monochrome tableau.',
        color: '1-bit black and pale green-white only.',
        light: 'Light made only of dither dot density, no grey tones at all.',
        texture: 'Every surface pure black or pure white dots in coarse dither patterns.',
        camera: 'First-person frozen tableau view.',
        mood: 'eerie frozen mystery',
        render:
          'A 2018 frame at 640 by 360 scaled up: first-person frozen scene on a ship in two colors only.',
        key: 'Obra Dinn 1-bit dither; frozen tableaux; ship',
        briefs: [
          'In 1-bit dithered monochrome, a frozen moment aboard a sailing ship shows the cook mid-lunge with a ladle while a sailor hangs from the rigging and a crab-like shadow crosses the deck. No readable text or logo.',
          'A dithered captain’s cabin shows a chest wide open and a map on the table. Every object is frozen. No readable text or logo.',
          'A 1-bit dithered sailing ship drifts into a quiet harbor at dawn with torn sails and a broken mast. Nobody stands on deck, and the lifeboats are gone. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Octopath Traveler 2018 - Square Enix HD-2D Diorama',
      'twenty-tens role-playing game',
      [...T, 'octopath'],
      {
        look: 'Square Enix Octopath Traveler (2018) look: HD-2D blend of pixel sprites in 3D diorama towns, tilt-shift depth of field, bloom, dynamic light and storybook medieval fantasy.',
        subject: 'render the subject as pixel sprites standing in tilt-shift 3D diorama towns.',
        color: 'Warm storybook golds and cool shadow blues.',
        light: 'Warm lantern light and glowing bloom over small towns with blurred edges.',
        texture:
          'Crisp flat pixel sprites standing in detailed miniature 3D towns with strong background blur.',
        camera: 'Tilted diorama view with strong depth of field.',
        mood: 'storybook nostalgic adventure',
        render:
          'A 2018 Switch frame at 1280 by 720: pixel characters in a tilt-shift diorama, top and bottom softly out of focus.',
        key: 'Octopath HD-2D; tilt-shift diorama; pixel sprites',
        avoid: ['existing Octopath travelers'],
        briefs: [
          'In a tilt-shift HD-2D diorama of a canal town, a pixel-sprite apothecary sells glowing tonics from a boat while lanterns bloom warmly and rain ripples the water around her. No readable text or logo.',
          'A pixel sprite knight rests at a campfire in a 3D forest diorama. Fireflies bloom in soft focus. No readable text or logo.',
          'An HD-2D diorama of a snowy mountain inn glows at night. Its sign sways in the wind. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Disco Elysium 2019 - ZA/UM Oil Painted Detective',
      'twenty-tens role-playing game',
      [...T, 'disco-elysium'],
      {
        look: 'ZA/UM Disco Elysium (2019) look: isometric oil-painted city of Revachol with thick expressive brushwork, painted character portraits, rain, cold harbor light and melancholic political satire.',
        subject:
          'render the subject in thick expressive oil-painted brushwork on a rainy isometric harbor city.',
        color: 'Muddy oil greys, rust and cold harbor teal.',
        light: 'Cold rainy harbor light and warm yellow windows in thick paint.',
        texture:
          'Thick expressive oil brushstrokes on every surface, seen from a high diagonal angle.',
        camera: 'Isometric view over painted streets.',
        mood: 'melancholic satirical introspection',
        render:
          'A 2019 PC frame at 1920 by 1080: painted harbor streets with a small figure and a dialogue panel shape at right.',
        key: 'Disco Elysium oil paint; isometric harbor; portraits',
        avoid: ['a disheveled detective in a green jacket and tie'],
        briefs: [
          'In thick oil-painted brushwork, a disheveled harbor fishmonger argues philosophy with a talking necktie hanging from a lamp post while rain falls on the isometric streets of a cold port city. No readable text or logo.',
          'An oil-painted hostel café glows warmly at dawn. A tired policeman stares at an empty coffee cup. No readable text or logo.',
          'A painted fishing village is swept by cold wind. A single phasmid insect sits on a reed. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Untitled Goose Game 2019 - House House Flat Village',
      'twenty-tens puzzle game',
      [...T, 'goose-game'],
      {
        look: 'House House Untitled Goose Game (2019) look: flat pastel English village gardens of simple untextured shapes, a white goose and quiet mischief.',
        subject: 'render the subject in flat pastel untextured English village gardens.',
        color: 'Soft pastel greens, cream and brick orange.',
        light: 'Soft flat daylight with gentle shadows and no strong contrast.',
        texture: 'Untextured flat pastel shapes, simple rounded hedges, fences and garden objects.',
        camera: 'High three-quarter view of gardens.',
        mood: 'gentle mischievous comedy',
        render:
          'A 2019 frame at 1920 by 1080: high angle over a pastel English garden, a white goose, flat shapes.',
        key: 'Goose Game pastel village; flat shapes; mischief',
        avoid: ['a white goose honking'],
        briefs: [
          'In a flat pastel English village garden, a mischievous hedgehog steals a gardener’s straw hat and hides behind a watering can while the gardener searches the rose beds. No readable text or logo.',
          'A pastel village pub terrace sits in afternoon sun with a pint left unattended. A duck eyes it from the fence. No readable text or logo.',
          'A single garden rake lies across a flat pastel lawn. Someone is about to step on it. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Outer Wilds 2019 - Mobius Tiny Solar System',
      'twenty-tens exploration game',
      [...T, 'outer-wilds'],
      {
        look: 'Mobius Digital Outer Wilds (2019) look: tiny walkable planets, a rickety wooden spaceship, campfire marshmallows, banjo songs, simple smooth painted color and a twenty-two-minute cosmic loop.',
        subject:
          'show the subject on a tiny round planet you could walk around in minutes, beside a rickety wooden spacecraft.',
        color: 'Warm campfire orange, deep space blue and planet pastels.',
        light: 'Campfire glow and low sunlight curving around the tiny planet.',
        texture:
          'Simple smooth shapes with painted gradients, wooden planks and patchy grass on small rounded worlds.',
        camera: 'First-person view on tiny planets.',
        mood: 'curious cosmic wonder',
        render:
          'A 2019 frame at 1920 by 1080: tiny planet with a clearly curved horizon, wooden ship, huge sun in the sky.',
        key: 'Outer Wilds tiny curved planets; wooden ship; campfire; huge sun',
        briefs: [
          'On a tiny round planet you could walk around in a minute, a four-eyed astronaut roasts a marshmallow at a campfire beside a rickety wooden spaceship while the sun swells on the horizon. No readable text or logo.',
          'A small planet made of sand pours its dunes onto its twin through a sand column. A tiny ship flies between. No readable text or logo.',
          'An ancient stone ruin floats in a comet tail. A mask glows on a pedestal inside. No readable text or logo.',
        ],
      },
    ),
  ],
};

export default spec;
