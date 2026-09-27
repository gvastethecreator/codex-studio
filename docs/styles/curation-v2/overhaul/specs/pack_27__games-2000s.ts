import type { Spec } from '../tools/apply';
import { cr } from './_authors';

// Video games of the 2000s: each preset names its game, studio and year and rebuilds that
// game's real on-screen look. Cards stage original characters and places in that look.
// Okami, Half-Life 2, Shadow of the Colossus, MGS3, Silent Hill 2, Mirror's Edge and
// Castle Crashers already live in pack_12 and pack_24.
const T = ['games-2000s', 'video-game-era'];

const spec: Spec = {
  pack: 'pack_27',
  category: '6. Video Games 2000s',
  newCategory: { id: 'video-games-2000s' },
  updates: {},
  creates: [
    cr(
      'The Wind Waker 2002 - Nintendo Toon Cel Seas',
      'two-thousands console adventure game',
      [...T, 'wind-waker'],
      {
        look: 'Nintendo The Legend of Zelda: The Wind Waker (2002) look: bright toon cel-shaded 3D, huge expressive eyes, flat color with crisp two-tone shadows, swirling stylized wind, clouds and a sparkling open sea.',
        subject:
          'render the subject as a toon cel-shaded 3D figure with huge expressive eyes and crisp two-tone shading.',
        color: 'Sparkling sea blue, grass green and warm sunset orange.',
        light:
          'Bright sun with every shadow a single hard-edged darker flat tone, no soft gradients anywhere.',
        texture:
          'Flat cartoon color fills with simple shapes, swirl-shaped smoke, wind curls and clouds drawn as flat curled ribbons.',
        camera: 'Wide third-person view over islands and sea.',
        mood: 'bright seafaring wonder',
        render:
          'A 2002 GameCube frame at 640 by 480: clean smooth edges, bright flat colors, slightly soft image like a period screenshot.',
        key: 'Wind Waker toon shading; huge eyes; swirl clouds; open sea',
        avoid: ['a green-tunic elf hero', 'a talking red boat'],
        briefs: [
          'A toon cel-shaded grandmother with huge worried eyes sails a tiny bathtub boat across a sparkling sea, her laundry flapping as a sail, while swirl-shaped clouds race past and a whale spouts a curly fountain behind her. No readable text or logo.',
          'A cel-shaded postman seagull delivers letters to a tiny island with one palm tree. Swirl-shaped wind carries the envelopes across the bright blue water. No readable text or logo.',
          'A cel-shaded volcano island smokes in curly two-tone puffs at sunset. A small raft of cheerful pigs drifts past it on the golden sea. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Jet Set Radio 2000 - Smilebit Graffiti Cel',
      'two-thousands console action game',
      [...T, 'jet-set-radio'],
      {
        look: 'Smilebit Jet Set Radio (2000) look: early thick-outline cel-shaded 3D, inline-skating graffiti gangs, Tokyo-inspired streets, fisheye tilt and loud funk-pop color.',
        subject:
          'render the subject as a thick-outline cel-shaded skater figure in loud graffiti streets.',
        color: 'Loud funk-pop yellow, magenta, lime and sky blue.',
        light:
          'Bright flat daylight with thick black outlines around every figure and building edge.',
        texture:
          'Thick black outlines, flat cartoon fills and walls of loud spray paint in simple repeating tiles.',
        camera: 'Low fisheye tilt following the skater.',
        mood: 'rebellious funky street energy',
        render:
          'A 2000 Dreamcast frame at 640 by 480: crisp outlined cartoon look, wide slightly curved street view, simple chunky buildings.',
        key: 'JSR thick outlines; graffiti skaters; fisheye; funk colors',
        avoid: ['existing skater gang members'],
        briefs: [
          'In thick-outline cel-shaded 3D, a gang of elderly inline skaters in tracksuits grinds down a bus-stop rail while spraying sunflower graffiti across a police van, the whole street bent by a low fisheye tilt. No readable text or logo.',
          'A cel-shaded delivery girl skates up a giant half-pipe water tower. Her spray can leaves a trail of cartoon stars across the rusty metal. No readable text or logo.',
          'An empty cel-shaded plaza glows under loud yellow sky, covered in fresh graffiti flowers. A pigeon wearing headphones bobs to an unseen beat. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Rez 2001 - United Game Artists Wireframe Synesthesia',
      'two-thousands rhythm shooter',
      [...T, 'rez'],
      {
        look: 'United Game Artists Rez (2001) look: glowing vector wireframe worlds inside a computer network, a translucent wireframe humanoid avatar, lock-on lasers and Kandinsky-inspired synesthesia.',
        subject:
          'render the subject as a glowing translucent wireframe figure inside a pulsing vector network.',
        color: 'Black void with neon cyan, magenta and orange lines.',
        light: 'Self-lit glowing vector lines that pulse to a beat.',
        texture:
          'Thin glowing lines outlining see-through shapes, dots and bursts of square light particles on black.',
        camera: 'On-rails view behind the wireframe avatar.',
        mood: 'trance-like digital rapture',
        render:
          'A 2001 PlayStation 2 frame at 640 by 448: glowing lines with a soft blur halo, simple geometry and a lock-on cursor shape.',
        key: 'Rez wireframe; lock-on lasers; synesthesia; neon void',
        avoid: ['existing avatar forms'],
        briefs: [
          'Inside a pulsing vector network, a translucent wireframe ballerina glides on rails through a tunnel of cyan cubes, firing lock-on lasers that burst every orange wireframe jellyfish into rings of sound-shaped particles. No readable text or logo.',
          'A wireframe whale made of magenta lines swims through a black data ocean. Every beat splits it into smaller glowing fish. No readable text or logo.',
          'A single glowing wireframe flower opens in the middle of an empty neon grid. Its petals pulse in time with a distant bass drum. No readable text or logo.',
        ],
      },
    ),
    cr('Halo 2001 - Bungie Ringworld Sci-Fi', 'two-thousands console shooter', [...T, 'halo-ce'], {
      look: 'Bungie Halo: Combat Evolved (2001) look: vast ringworld skies, bright green alien grass fields, purple glossy alien architecture, chunky armored soldiers and a first-person weapon with ammo counter.',
      subject:
        'render the subject in first-person or third-person across vast ringworld landscapes and glossy alien structures.',
      color: 'Ringworld sky blue, alien purple and grass green.',
      light:
        'Bright open-sky daylight with one simple shiny highlight on purple alien surfaces and no real shadows on grass.',
      texture:
        'Plain low-detail surfaces: grass as a flat green texture on smooth rolling hills, alien metal as smooth purple with one simple shiny highlight, and crisp but blocky armor shapes.',
      camera: 'First-person view with a weapon at screen right.',
      mood: 'epic alien frontier',
      render:
        'A 2001 original Xbox frame at 640 by 480: clean simple geometry, blurry textures up close and a hazy short draw distance, clearly early-2000s and not the later remaster.',
      key: 'Halo ringworld sky; purple alien structures; flat green fields; early Xbox simplicity',
      avoid: ['a green armored super soldier with a gold visor', 'existing alien species'],
      briefs: [
        'Under a vast ringworld sky that curves up into space, a first-person park ranger with a flare gun crosses a bright green alien meadow toward a glossy purple structure where a flock of floating jellyfish guards the entrance. No readable text or logo.',
        'A chunky armored gardener drives a six-wheeled buggy across a ringworld beach. The ring arcs overhead into the blue sky. No readable text or logo.',
        'A glossy purple alien bridge hums with light across a deep canyon. A lone pelican perches on the railing as the sun sets. No readable text or logo.',
      ],
    }),
    cr(
      'ICO 2001 - Team Ico Bleached Castle',
      'two-thousands console adventure game',
      [...T, 'ico'],
      {
        look: 'Team Ico ICO (2001) look: vast bleached stone castle, overexposed bloom, washed-out color, tiny figures lost in monumental architecture, soft misty sea light and silent melancholy.',
        subject:
          'render the subject as small figures lost in monumental bleached stone architecture with heavy bloom.',
        color: 'Bleached stone, faded moss green and pale sea grey.',
        light:
          'Overexposed light that blooms and bleeds white over the edges of arches and windows.',
        texture:
          'Soft washed-out stone with simple blocky architecture, tiny figures with little detail, everything slightly hazy.',
        camera: 'Wide distant cinematic camera dwarfing the figures.',
        mood: 'silent tender melancholy',
        render:
          'A 2001 PlayStation 2 frame at 640 by 448: soft, bleached and grainy, with jagged shimmering edges on distant towers.',
        key: 'ICO bleached castle; heavy bloom; tiny figures; melancholy',
        avoid: ['a horned boy and a glowing pale girl holding hands'],
        briefs: [
          'In an overexposed stone courtyard of a vast bleached castle, a tiny lighthouse keeper leads a glowing lost deer by a rope across a broken bridge, bloom light pouring through the arches over the misty sea. No readable text or logo.',
          'Two small figures sit on a huge stone windmill blade high above the sea. Seagulls circle in the bleached, hazy light. No readable text or logo.',
          'An empty stone stairway climbs into white bloom light inside a monumental hall. Moss grows in the cracks and dust hangs still. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Metroid Prime 2002 - Retro Studios Visor Scan',
      'two-thousands console adventure game',
      [...T, 'metroid-prime'],
      {
        look: 'Retro Studios Metroid Prime (2002) look: first-person view through a curved combat visor with HUD arcs, rain and fog droplets on the glass, alien ruins, bioluminescent caverns and scan overlays.',
        subject:
          'render the subject seen through a curved first-person visor with HUD arcs and droplets on the glass.',
        color: 'Alien teal, bioluminescent orange and visor green.',
        light:
          'Cave glow and colored light reflected faintly on the inside of a curved helmet visor.',
        texture:
          'Water droplets and fog on the visor glass, alien stone with simple repeating textures beyond it.',
        camera: 'First-person through a curved helmet visor.',
        mood: 'lonely alien exploration',
        render:
          'A 2002 GameCube frame at 640 by 480: curved visor frame shapes around the edges, clean but simple world beyond.',
        key: 'Metroid Prime visor; droplets; scan overlay; alien ruins',
        avoid: ['an orange power suit with an arm cannon', 'floating jellyfish parasites'],
        briefs: [
          'Through a curved first-person visor streaked with rain droplets, a scan overlay locks onto a giant sleeping snail curled around the ruins of an alien temple, bioluminescent moss glowing along its shell in the fog. No readable text or logo.',
          'A visor reflection faintly shows a tired face inside while a frozen alien waterfall glitters ahead. The HUD arcs glow green at the edges. No readable text or logo.',
          'An alien lava cavern shimmers through a fogged visor lens. A single glowing flower pulses in a crack between the ancient stones. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Viewtiful Joe 2003 - Clover Tokusatsu Comic Cel',
      'two-thousands console action game',
      [...T, 'viewtiful-joe'],
      {
        look: 'Clover Studio Viewtiful Joe (2003) look: bold comic-book cel shading, tokusatsu hero poses, 2.5D side-scrolling film sets, speed lines, slow-motion blur and pop-art color.',
        subject: 'render the subject as a bold cel-shaded tokusatsu hero on a 2.5D comic film set.',
        color: 'Pop-art red, yellow, pink and black.',
        light: 'Flat comic-book light with a hot glow and blur trail when time slows.',
        texture:
          'Thick ink outlines, flat bright fills, speed lines and flat cardboard-looking scenery.',
        camera: '2.5D side-scrolling film set view.',
        mood: 'outrageous heroic swagger',
        render:
          'A 2003 GameCube frame at 640 by 480: side-scrolling comic panel look with film grain and bright pop colors.',
        key: 'Viewtiful Joe comic cel; tokusatsu poses; speed lines',
        avoid: ['a red hero with a V-shaped visor and scarf'],
        briefs: [
          'On a 2.5D comic film set, a cel-shaded retired dentist in a homemade tokusatsu suit strikes a heroic pose in slow motion as a giant rubber-costumed crab robot explodes behind him in pop-art speed lines. No readable text or logo.',
          'A cel-shaded grandmother dives through a studio window in slow motion. Movie lights and speed lines burst around her in red and yellow. No readable text or logo.',
          'An empty film set of cardboard skyscrapers waits under stage lights. A giant rubber monster costume slumps in the corner, zipper open. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Prince of Persia Sands of Time 2003 - Ubisoft Golden Haze',
      'two-thousands console action game',
      [...T, 'pop-sot'],
      {
        look: 'Ubisoft Prince of Persia: The Sands of Time (2003) look: golden bloom haze, Persian palaces, acrobatic wall-running, sand swirling particles, silk curtains and dreamy soft focus.',
        subject:
          'render the subject mid-acrobatics in golden hazy Persian palaces with drifting sand particles.',
        color: 'Golden sand, palace turquoise and dusk amber.',
        light: 'Golden light that blooms softly over everything, as if seen through warm gauze.',
        texture:
          'Soft blurry palace textures, simple columns and arches, and flat drifting sand sparkle particles.',
        camera: 'Third-person acrobatic camera along palace walls.',
        mood: 'dreamy acrobatic legend',
        render:
          'A 2003 PlayStation 2 frame at 640 by 448: dreamy soft focus, shimmering jagged edges and a sand-glass bar shape in a corner.',
        key: 'Sands of Time golden haze; wall-running; palace; sand particles',
        avoid: ['a shirtless prince with a dagger of time'],
        briefs: [
          'Through golden bloom haze in a Persian palace, an acrobatic tea merchant runs along a turquoise wall above a courtyard fountain, balancing a tray of glasses while swirling sand particles freeze time around him. No readable text or logo.',
          'A palace librarian swings from a silk curtain across a hazy golden hall. Scrolls float in the dreamy slow-motion sand. No readable text or logo.',
          'An hourglass as big as a tower glows gold in an empty throne room. Sand flows upward through it into the soft haze. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Katamari Damacy 2004 - Namco Rolling Toy World',
      'two-thousands console game',
      [...T, 'katamari'],
      {
        look: 'Namco Katamari Damacy (2004) look: a toy world of plain untextured blocks in candy colors, a sticky ball rolling up everyday objects and absurd scale.',
        subject:
          'show the subject as a tiny boxy toy figure pushing a sticky ball among everyday objects built from plain untextured blocks.',
        color: 'Candy pink, mint, lemon and sky blue.',
        light: 'Flat cheerful light with no harsh shadows, every object a plain bright color.',
        texture:
          'Objects made of a few plain flat-colored blocks with no surface detail, like painted wooden toys.',
        camera: 'Third-person view behind a rolling ball.',
        mood: 'absurdist joyful chaos',
        render:
          'A 2004 PlayStation 2 frame at 640 by 448: simple bright blocks, jagged edges and a slightly soft image.',
        key: 'Katamari plain blocky toy world; rolling ball; candy colors; absurd',
        avoid: ['a tiny green prince with a rod-shaped head', 'a giant king in tights'],
        briefs: [
          'In a flat-shaded candy-colored town, a tiny round beetle pushes a sticky ball that has already rolled up cats, bicycles, a birthday cake and a panicking mailman, the whole lump now taller than the houses. No readable text or logo.',
          'Giant sticky ball of rolled-up teapots and umbrellas rolls across a simple toy-block park of flat bright colors, pigeons fleeing in all directions under the mint sky. No readable text or logo.',
          'A single flat-shaded strawberry sits on a huge kitchen table in a candy world. A tiny sticky ball approaches it from the edge. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Paper Mario TTYD 2004 - Intelligent Systems Papercraft Stage',
      'two-thousands console role-playing game',
      [...T, 'paper-mario'],
      {
        look: 'Intelligent Systems Paper Mario: The Thousand-Year Door (2004) look: paper-flat characters folding and fluttering in cardboard theater sets, audience seats, stage curtains and warm storybook color.',
        subject: 'render the subject as a paper-flat cutout figure on a cardboard theater stage.',
        color: 'Warm storybook red, gold and cream.',
        light: 'Warm stage spotlights falling on paper sets and paper-thin figures.',
        texture:
          'Paper-thin cutout figures with white edges, cardboard folds, tape and hinges on the stage sets.',
        camera: 'Side-view theater stage with audience.',
        mood: 'whimsical theatrical charm',
        render:
          'A 2004 GameCube frame at 640 by 480: clean and soft, flat paper figures on a cardboard theater stage.',
        key: 'Paper-flat figures; cardboard theater; audience; storybook',
        avoid: ['a mustached plumber in red and blue', 'existing Nintendo characters'],
        briefs: [
          'On a cardboard theater stage under warm spotlights, a paper-flat hedgehog detective and a paper-flat umbrella battle a folding dragon made of newspaper, while a paper audience of mice cheers from the seats. No readable text or logo.',
          'A lighthouse folds open like a pop-up book on a cardboard stage, flat as a sheet. A cutout boat sails past it on painted cardboard waves while the audience gasps. No readable text or logo.',
          'Inside an empty cardboard theater, the red curtain hangs half open over the stage. A single cutout star dangles on a string above the boards, swaying slightly. No readable text or logo.',
        ],
      },
    ),
    cr(
      'World of Warcraft 2004 - Blizzard Painted Chunky Fantasy',
      'two-thousands PC online game',
      [...T, 'wow-vanilla'],
      {
        look: 'Blizzard World of Warcraft (2004) look: blurry hand-painted textures on chunky simple shapes, oversized shoulder pads and weapons, saturated fantasy zones.',
        subject:
          'render the subject with chunky cartoon proportions and oversized gear painted in hand-painted textures.',
        color: 'Saturated forest green, twilight purple and gold.',
        light:
          'Soft painted sky light, with shadows painted straight into the textures rather than cast.',
        texture:
          'Chunky simple shapes wrapped in blurry hand-painted textures, oversized shoulder pads and weapons, no photo detail.',
        camera: 'Third-person over-the-shoulder view.',
        mood: 'cozy epic fantasy',
        render:
          'A 2004 PC frame at 1024 by 768: soft painted textures, simple geometry, fog at mid distance and small bar shapes at the bottom.',
        key: 'WoW hand-painted; chunky proportions; saturated zones',
        avoid: ['existing races and faction crests', 'orc warchiefs'],
        briefs: [
          'In a hand-painted twilight forest zone, a chunky cartoon fisherman with enormous shoulder pads shaped like clams casts a line into a glowing purple lake as a giant painted moon hangs over pine hills. No readable text or logo.',
          'A chunky painted innkeeper pours cider for a line of tiny travelers. The tavern fire flickers in baked painted light. No readable text or logo.',
          'A hand-painted zeppelin dock floats above a golden wheat field at dusk. A single chicken waits patiently for the next flight. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Psychonauts 2005 - Double Fine Warped Mindscape',
      'two-thousands console platformer',
      [...T, 'psychonauts'],
      {
        look: 'Double Fine Psychonauts (2005) look: Scott Campbell cartoon designs with lopsided heads and spindly limbs, warped mindscape levels, surreal floating architecture and Tim Burton-like whimsy.',
        subject:
          'render the subject as a lopsided spindly cartoon figure inside a warped surreal mindscape.',
        color: 'Muted camp greens with surreal mindscape purples.',
        light: 'Theatrical colored lighting inside minds, with flat moody tints on simple shapes.',
        texture:
          'Painted cartoon textures on lopsided simple geometry, props bent and stretched like a stage set.',
        camera: 'Third-person platformer camera.',
        mood: 'weird whimsical psychology',
        render:
          'A 2005 Xbox frame at 640 by 480: soft, slightly blurry cartoon textures and simple warped shapes.',
        key: 'Psychonauts lopsided designs; warped mindscape; whimsy',
        avoid: ['a goggled boy in a psychic suit'],
        briefs: [
          'Inside the warped mindscape of a nervous accountant, a lopsided spindly cartoon kid leaps between floating filing cabinets while a giant anxious eyeball in a necktie watches from a sky full of floating receipts. No readable text or logo.',
          'A spindly camp counselor with a huge chin stands by a lake at dusk. Behind him a door floats in midair, glowing purple. No readable text or logo.',
          'A warped mindscape of a baker is an upside-down town of cakes. Frosting rivers flow up into a lopsided moon. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Killer7 2005 - Grasshopper Flat-Shaded Noir',
      'two-thousands console action game',
      [...T, 'killer7'],
      {
        look: 'Grasshopper Manufacture Killer7 (2005) look: stark flat-shaded cel graphics with blown-out whites, heavy black shadows, sharp angular figures, blood-red accents and surreal political noir.',
        subject:
          'render the subject as a stark flat-shaded angular figure in blown-out white and heavy black.',
        color: 'Blown-out white, heavy black and blood red.',
        light:
          'Harsh blown-out white light with shadows as solid black shapes and nothing in between.',
        texture:
          'Every surface a flat solid color with no gradient or texture, angular shapes with sharp edges.',
        camera: 'Low dramatic angles along rail paths.',
        mood: 'cold surreal noir',
        render:
          'A 2005 GameCube frame at 640 by 480: stark flat blocks of color, jagged edges and heavy film grain.',
        key: 'Killer7 flat shading; blown-out whites; stark noir',
        avoid: ['existing assassin personas'],
        briefs: [
          'In stark flat-shaded graphics with blown-out white walls, an angular hotel concierge in a black suit stands at a rail junction in an empty lobby as laughing flat-shaded figures shimmer out of the heavy black shadows. No readable text or logo.',
          'A flat-shaded wheelchair sits alone in an overexposed white corridor. A red telephone rings on the floor beside it. No readable text or logo.',
          'An angular flat-shaded city block glows white at noon with pitch-black alleys. A single red umbrella floats above the street. No readable text or logo.',
        ],
      },
    ),
    cr(
      'GTA San Andreas 2004 - Rockstar Loading Screen Art',
      'two-thousands game illustration',
      [...T, 'gta-sa-loading'],
      {
        look: 'Rockstar Games Grand Theft Auto: San Andreas (2004) loading screen look: bold black ink outlines, flat cel color blocks, gritty early-nineties West Coast city characters and sun-baked streets.',
        subject:
          'render the subject as a bold ink-outlined flat-color illustration of gritty sun-baked street life.',
        color: 'Sun-baked orange, palm green and faded denim blue.',
        light: 'Hard West Coast sun with flat blocks of cel shadow on faces and cars.',
        texture:
          'Bold black ink outlines and flat color fills with light grain, like printed promotional art.',
        camera: 'Dynamic loading-screen illustration crop.',
        mood: 'gritty sun-baked swagger',
        render:
          'A 2004 loading screen illustration: bold flat inked art of street life filling the frame, with a thin progress bar shape at the bottom.',
        key: 'GTA SA loading art; bold ink; flat color; West Coast',
        avoid: ['existing gang characters', 'a bandana-wearing protagonist in a white tank top'],
        briefs: [
          'In bold ink outlines and flat sun-baked colors, a stern grandmother in a housecoat leans on a lowrider hopping in front of a taco truck, palm trees and power lines behind her on a hot West Coast street. No readable text or logo.',
          'An ink-outlined mail carrier on a BMX bike flies over a dry canal at sunset. Palm trees cast long flat shadows. No readable text or logo.',
          'A flat-color barbershop corner glows orange under a hot sky. A cat sleeps on the hood of a dusty old convertible. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Gears of War 2006 - Epic Grey-Brown Grit',
      'two-thousands console shooter',
      [...T, 'gears'],
      {
        look: 'Epic Games Gears of War (2006) look: desaturated grey-brown Unreal Engine 3 grit, bulky armored soldiers, crumbling baroque ruins, cover-shooter over-the-shoulder view and bloom highlights.',
        subject:
          'render the subject bulky and armored in desaturated grey-brown baroque ruins with over-the-shoulder framing.',
        color: 'Desaturated grey, brown and ash with blue highlights.',
        light: 'Grey overcast light with glossy wet highlights on armor and bloom on bright spots.',
        texture:
          'Bumpy rubble and armor that look detailed but plasticky, shiny edges, grey-brown everything.',
        camera: 'Low over-the-shoulder view behind cover.',
        mood: 'grim heavy survival',
        render:
          'A 2006 Xbox 360 frame at 1280 by 720: shiny plasticky surfaces, textures that pop in, a reticle and a small weapon icon shape.',
        key: 'Gears grey-brown; bulky armor; baroque ruins; cover',
        avoid: ['chainsaw rifles', 'existing squad members'],
        briefs: [
          'From a low over-the-shoulder view, a bulky armored florist crouches behind a crumbling baroque fountain in grey-brown ruins, clutching a potted sunflower, while specular bloom glints off the wet rubble ahead. No readable text or logo.',
          'Two bulky armored mail carriers sprint between cover in a ruined opera square. Ash falls through the grey overcast light. No readable text or logo.',
          'A crumbling baroque library stands in desaturated ruins. A single blue flower grows through the cracked grey floor. No readable text or logo.',
        ],
      },
    ),
    cr(
      'BioShock 2007 - Irrational Art Deco Undersea',
      'two-thousands PC shooter',
      [...T, 'bioshock'],
      {
        look: 'Irrational Games BioShock (2007) look: decaying art deco underwater city, leaking glass tunnels, neon signs, ocean light through windows, first-person hands and retro-futurist menace.',
        subject:
          'render the subject in a first-person view of a decaying art deco underwater city.',
        color: 'Deco gold, deep ocean teal and flickering neon.',
        light: 'Blue ocean light through tall windows and flickering deco neon on wet floors.',
        texture:
          'Wet marble and brass with shiny reflections, leaking water sheets, simple blocky props up close.',
        camera: 'First-person view with visible hands.',
        mood: 'decadent drowned menace',
        render:
          'A 2007 Xbox 360 frame at 1280 by 720: glossy wet shading, soft bloom, a first-person hand and weapon at bottom right.',
        key: 'BioShock deco; undersea city; leaking glass; neon',
        avoid: ['a diving-suit giant with a drill', 'little girls with glowing eyes'],
        briefs: [
          'In first-person, gloved hands hold a brass lantern in a decaying art deco ballroom under the sea, water leaking down a gold staircase while a whale drifts past the tall windows and neon flickers in the gloom. No readable text or logo.',
          'An art deco glass tunnel stretches through the deep ocean, cracked and dripping. A school of silver fish swims between the brass ribs. No readable text or logo.',
          'An abandoned deco vending machine glows teal in a flooded hallway. A tiny octopus sits on top of it, watching. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Team Fortress 2 2007 - Valve Painterly Mercenaries',
      'two-thousands PC shooter',
      [...T, 'tf2'],
      {
        look: 'Valve Team Fortress 2 (2007) look: J.C. Leyendecker-inspired painterly shading, exaggerated silhouettes, rim-lit warm and cool team colors and 1960s spy-industrial architecture.',
        subject:
          'render the subject with an exaggerated readable silhouette and Leyendecker-style painterly shading.',
        color: 'Warm team red, cool team blue and desert tan.',
        light: 'Warm rim light around every figure and soft painted gradients on faces and cloth.',
        texture:
          'Painted soft gradients with no fine detail, figures with exaggerated readable shapes and clean flat materials.',
        camera: 'Heroic low third-person or first-person view.',
        mood: 'comedic mercenary mayhem',
        render:
          'A 2007 PC frame at 1280 by 720: clean smooth shading, bright team colors, simple architecture and HUD shapes in corners.',
        key: 'TF2 painterly; Leyendecker shading; exaggerated silhouettes',
        avoid: ['existing mercenary classes'],
        briefs: [
          'In painterly Leyendecker-style shading, a comically huge accountant with an exaggerated silhouette defends a 1960s desert warehouse with a tennis racket while a tiny rival in cool blue sneaks behind him with a clipboard. No readable text or logo.',
          'A painterly cook with a tall hat hurls pies from a red industrial rooftop. The desert glows warm tan behind him. No readable text or logo.',
          'An empty painterly spy base sits in a desert canyon at noon. A single briefcase glows on a table under a hanging lamp. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Borderlands 2009 - Gearbox Ink-Hatched Wasteland',
      'two-thousands console shooter',
      [...T, 'borderlands'],
      {
        look: 'Gearbox Borderlands (2009) look: thick black ink outlines and hand-drawn hatching on 3D, cel-shaded wasteland, rusty junk towns, punk bandits and dusty sun-bleached colors.',
        subject:
          'render the subject with thick ink outlines and hand-drawn hatching over cel-shaded 3D in a dusty wasteland.',
        color: 'Sun-bleached tan, rust orange and sky blue.',
        light: 'Hard desert sun with shadows drawn as ink hatching lines.',
        texture: 'Thick black ink outlines and hand-drawn hatching painted onto every 3D surface.',
        camera: 'First-person view with a gun or dusty vistas.',
        mood: 'rowdy wasteland absurdity',
        render:
          'A 2009 Xbox 360 frame at 1280 by 720: comic-inked 3D world, bright dusty colors, a reticle and bar shapes.',
        key: 'Borderlands ink hatching; wasteland; junk towns',
        avoid: ['a one-wheeled robot', 'masked psycho bandits'],
        briefs: [
          'In thick ink outlines and hand-drawn hatching, a rowdy wasteland ice-cream vendor drives a rusty truck with a giant cone on top through a junk town while dusty bandits chase it on scrap motorbikes. No readable text or logo.',
          'An ink-hatched vending machine stands alone in a sun-bleached desert. A skinny dog with goggles guards it from a rock. No readable text or logo.',
          'A rusty junk town of shipping containers glows at sunset in cel-shaded ink. Laundry flaps from wires between the rooftops. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Braid 2008 - Number None Painted Time Puzzle',
      'two-thousands indie puzzle platformer',
      [...T, 'braid'],
      {
        look: 'Number None Braid (2008) look: David Hellman painted impressionistic backgrounds, soft watercolor clouds, glowing puzzle pieces, a small suited figure and dreamy time-rewinding shimmer.',
        subject:
          'render the subject as a small figure in soft painted impressionistic side-view platform worlds.',
        color: 'Soft watercolor gold, green and dusk blue.',
        light: 'Glowing dreamy light with shimmering soft haze over the scenery.',
        texture:
          'Soft impressionistic brush strokes in the backgrounds, small clean painted character sprites.',
        camera: 'Side-view platform scenes.',
        mood: 'wistful dreamy regret',
        render:
          'A 2008 Xbox 360 side-view frame at 1280 by 720: soft painted layers with a small crisp character.',
        key: 'Braid painted backgrounds; puzzle pieces; time shimmer',
        avoid: ['a red-haired man in a suit and tie'],
        briefs: [
          'In a soft painted impressionistic world, a small figure in a raincoat climbs a ladder of glowing puzzle pieces into golden watercolor clouds, while a green time shimmer rewinds a falling vase back onto the windowsill of a distant castle. No readable text or logo.',
          'A small painted figure walks through a ruined garden where the rain falls upward. Glowing puzzle pieces hang in the air. No readable text or logo.',
          'A painted stone bridge fades into golden watercolor mist. A single glowing puzzle piece rests on its railing. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Alien Hominid 2002 - The Behemoth Flash Cartoon',
      'two-thousands indie action game',
      [...T, 'newgrounds-flash'],
      {
        look: 'The Behemoth Alien Hominid (2002) Newgrounds Flash look: Dan Paladin thick-line vector cartoon art, chunky silly characters, bright flat colors, cartoon explosions and absurd violence.',
        subject:
          'render the subject as a chunky thick-line vector cartoon in bright flat Flash-era colors.',
        color: 'Bright flat vector greens, yellows and reds.',
        light: 'Flat light with no gradients, every shape a solid bright color.',
        texture:
          'Thick wobbly black vector lines and flat fills, simple shapes and scribbly effects.',
        camera: 'Side-scrolling cartoon action view.',
        mood: 'silly absurd mayhem',
        render:
          'A 2002 Flash browser game frame: crisp vector cartoon, side-scrolling chaos on a plain background.',
        key: 'Newgrounds Flash; thick-line vector; silly chaos',
        avoid: ['a small yellow alien with antennae'],
        briefs: [
          'In chunky thick-line vector cartoon art, a tiny angry potato in a space helmet shoots jelly beans at a line of government agents in trench coats, while a cartoon truck explodes into flat yellow stars behind them. No readable text or logo.',
          'A chunky vector cartoon cow in sunglasses drives a tank through a suburban lawn. Flat red explosions pop behind every mailbox. No readable text or logo.',
          'A single thick-line cartoon UFO crashed in a flat green field sits smoking. A confused farmer pokes it with a rake. No readable text or logo.',
        ],
      },
    ),
  ],
};

export default spec;
