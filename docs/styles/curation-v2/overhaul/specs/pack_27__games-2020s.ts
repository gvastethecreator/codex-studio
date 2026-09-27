import type { Spec } from '../tools/apply';
import { cr } from './_authors';

// Video games of the 2020s: each preset names its game, studio and year and rebuilds that game's
// real on-screen look. Cards stage original characters and places in that look. Games already
// named in pack_12 (Hades, Elden Ring, Ghost of Tsushima, Sable and others) are not repeated here.
const T = ['games-2020s', 'video-game-era'];

const spec: Spec = {
  pack: 'pack_27',
  category: '13. Video Games 2020s',
  newCategory: { id: 'video-games-2020s' },
  updates: {},
  creates: [
    cr(
      'Cyberpunk 2077 2020 - CD Projekt Night City Neon',
      'twenty-twenties role-playing game',
      [...T, 'cyberpunk-2077'],
      {
        look: 'CD Projekt Red Cyberpunk 2077 (2020) look: dense photoreal Night City megastructures, yellow-teal neon, holographic ads, chrome implants, rain and first-person street grime.',
        subject:
          'render people with chrome implants and street fashion in dense neon megacity streets.',
        color: 'Neon yellow, teal and magenta over wet asphalt.',
        light:
          'Neon holograms and signs reflected sharply in rain puddles and chrome, deep black shadows between.',
        texture:
          'Photoreal grime, chrome and glossy wet asphalt, with slightly soft game-engine detail and pop-in crowds.',
        camera: 'First-person street view.',
        mood: 'gritty neon hustle',
        render:
          'A 2020 PC frame at 2560 by 1440 in first person: mirror-sharp reflections, a small minimap circle top right and a hand at the edge.',
        key: 'Cyberpunk 2077 Night City neon; chrome implants',
        avoid: [
          'a man with a chrome arm and aviator sunglasses',
          'a mohawked netrunner with a face tattoo',
        ],
        briefs: [
          'In first person on a rain-soaked megacity street drowning in yellow and teal neon, a street-food vendor with a chrome jaw flips glowing noodles for a queue of workers while holographic koi swim across the buildings above. No readable text or logo.',
          'A cramped megabuilding apartment glows with a single hologram TV. A cat sleeps on a chrome arm left on the table. No readable text or logo.',
          'An empty elevated highway glows neon at four in the morning. One car is parked sideways with its door open. No readable text or logo.',
        ],
      },
    ),
    cr(
      'It Takes Two 2021 - Hazelight Toy Adventure',
      'twenty-twenties co-op game',
      [...T, 'it-takes-two'],
      {
        look: 'Hazelight It Takes Two (2021) look: animated-film co-op adventure through tiny worlds of a family home, giant toys, garden sheds, snow globes and warm playful color.',
        subject:
          'render the subject as tiny animated-film figures crossing giant everyday household worlds.',
        color: 'Warm toy colors, garden green and cozy amber.',
        light: 'Warm household window light and soft bounce, like an animated family film.',
        texture:
          'Smooth animated-film materials, fuzzy fabric, glossy toy plastic and oversized household objects.',
        camera: 'Split-screen or third-person co-op view.',
        mood: 'playful cooperative warmth',
        render:
          'A 2021 console frame at 1920 by 1080, split vertically into two gameplay views, each following a tiny figure.',
        key: 'It Takes Two tiny worlds; giant toys; co-op',
        avoid: ['a clay man and a wooden woman doll', 'a talking book with a mustache'],
        briefs: [
          'Shrunk to the size of thumbtacks, two elderly neighbors climb a giant bookshelf together, one boosting the other onto a dictionary while a toy robot guards the top shelf. No readable text or logo.',
          'A garden shed becomes an enormous factory of tools and spinning saws for two tiny travelers. A spider watches from a tin. No readable text or logo.',
          'A snow globe on a windowsill holds a tiny winter village. Two figures skate on its frozen pond. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Deaths Door 2021 - Acid Nerve Crow Reaper',
      'twenty-twenties action game',
      [...T, 'deaths-door'],
      {
        look: 'Acid Nerve Death’s Door (2021) look: isometric soft-lit 3D in muted grey offices of death, overgrown ruins, a tiny crow reaper, glowing doors and quiet melancholic humor.',
        subject:
          'render the subject small in isometric soft-lit muted ruins and grey afterlife offices.',
        color: 'Muted grey, moss green and soft door glow.',
        light: 'Soft diffuse grey light and the warm glow of standing doorways.',
        texture:
          'Clean simple 3D shapes with soft shading and almost no surface detail, muted greys with pops of color.',
        camera: 'Isometric top-down action view.',
        mood: 'quiet wry melancholy',
        render:
          'A 2021 frame at 1920 by 1080 from a high diagonal angle: small crow figure in muted ruins, a few pip shapes in a corner.',
        key: "Death's Door crow reaper; grey offices; glowing doors",
        avoid: ['a tiny crow reaper with a sword'],
        briefs: [
          'In an isometric grey afterlife office lit by soft glowing doors, a tired moth clerk stamps forms at an endless desk while a line of small souls in hats waits patiently in the quiet. No readable text or logo.',
          'An overgrown garden estate is full of stone pots and slumbering statues. One door glows at the end of the path. No readable text or logo.',
          'A tiny rowboat drifts through a flooded ruined chapel under soft grey light. A lantern glows on its bow and a moth pilot steers with a single oar. No readable text or logo.',
        ],
      },
    ),
    cr('Sifu 2022 - Sloclap Painterly Kung Fu', 'twenty-twenties action game', [...T, 'sifu'], {
      look: 'Sloclap Sifu (2022) look: painterly stylized 3D kung fu with flat-shaded faces, Hong Kong clubs, art galleries and temples, bold color, and bodies aging with each defeat.',
      subject: 'render people as painterly stylized kung fu fighters with flat-shaded faces.',
      color: 'Bold neon club pink, temple gold and jade.',
      light: 'Stylized painted light with soft colored shadows on flat-shaded faces.',
      texture: 'Simplified 3D with painterly brush textures, faces in flat planes of color.',
      camera: 'Third-person fight view.',
      mood: 'disciplined painterly fury',
      render:
        'A 2022 frame at 1920 by 1080 in third person: a fighter mid-strike among painted thugs, a thin bar shape at the bottom.',
      key: 'Sifu painterly kung fu; flat shading; aging',
      briefs: [
        'In a painterly neon nightclub, a grey-haired dumpling chef in a kung fu stance fends off a crowd of club bouncers with a bamboo steamer lid while pink lights flood the dance floor. No readable text or logo.',
        'An art gallery full of colorful sculptures becomes a fighting arena. A painting hangs crooked on the wall. No readable text or logo.',
        'A quiet temple courtyard in autumn holds a wooden training dummy. Its arms are worn smooth. No readable text or logo.',
      ],
    }),
    cr(
      'Tunic 2022 - Isometric Fox Storybook Manual',
      'twenty-twenties adventure game',
      [...T, 'tunic'],
      {
        look: 'Andrew Shouldice Tunic (2022) look: isometric tilt-shift diorama world, soft saturated color, a tiny fox hero and hand-illustrated instruction manual pages with secret language.',
        subject: 'render the subject small in saturated tilt-shift isometric dioramas.',
        color: 'Saturated green, gold and ruin blue.',
        light: 'Soft glowing light with the top and bottom of the frame gently out of focus.',
        texture:
          'Smooth simple shapes with clean saturated colors, rounded grass tufts and bright little buildings.',
        camera: 'Isometric tilt-shift view.',
        mood: 'mysterious cozy exploration',
        render:
          'A 2022 frame at 1920 by 1080 from a high diagonal angle: tiny fox figure in a saturated diorama with blurred edges.',
        key: 'Tunic isometric diorama; tilt-shift; storybook',
        avoid: ['a small fox in a green tunic with a sword'],
        briefs: [
          'In a saturated tilt-shift diorama of mossy ruins, a tiny badger explorer with a lantern finds a glowing chest behind a waterfall while fireflies drift over golden fields. No readable text or logo.',
          'An illustrated instruction manual page shows a map of a forest in faded ink. A coffee ring stains one corner. No readable text or logo.',
          'A tiny stone bridge crosses a glittering stream in a toy-like valley. A frog guard waits on the far side. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Stray 2022 - BlueTwelve Cat Robot City',
      'twenty-twenties adventure game',
      [...T, 'stray'],
      {
        look: 'BlueTwelve Stray (2022) look: dense walled neon slum city of stacked balconies, air conditioners and cables, a small orange cat, gentle robots with screen faces and warm light.',
        subject:
          'render the subject at cat height in dense neon slum alleys among gentle screen-faced robots.',
        color: 'Warm neon orange, teal and grimy concrete.',
        light: 'Warm neon signs and hanging bulbs glowing in grimy narrow alleys.',
        texture:
          'Detailed grimy concrete, cables and cardboard, rendered with soft console-game sharpness.',
        camera: 'Low cat-height third-person view.',
        mood: 'gentle curious wonder',
        render:
          'A 2022 console frame at 1920 by 1080: camera low at cat height, screen-faced robots in alleys, a small button prompt shape.',
        key: 'Stray walled city; screen-face robots; cat view',
        avoid: ['an orange tabby cat with a small drone backpack'],
        briefs: [
          'At cat height in a dense neon slum alley, a small grey kitten naps in a basket of laundry while gentle robots with screen faces trade spare parts at a stall under hanging bulbs. No readable text or logo.',
          'A robot barber shows a smiley face on its screen while trimming a potted plant. Cables hang everywhere. No readable text or logo.',
          'A rooftop of air conditioners and satellite dishes glows under neon rain. A bucket collects water drop by drop. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Neon White 2022 - Angel Matrix Heaven Speedrun',
      'twenty-twenties action game',
      [...T, 'neon-white'],
      {
        look: 'Angel Matrix Neon White (2022) look: bright white-and-cyan heavenly architecture, first-person parkour speedrunning, cards as weapons, demons popping into light and anime visual-novel interludes.',
        subject:
          'render the subject in bright white heavenly architecture during first-person speedruns.',
        color: 'Heavenly white, cyan and gold.',
        light: 'Blinding clean white light with glowing blue and red target outlines.',
        texture: 'Clean simple white geometry, glowing edges and flat-color anime demons.',
        camera: 'First-person parkour view.',
        mood: 'euphoric heavenly speed',
        render:
          'A 2022 first-person frame at 1920 by 1080: floating white platforms, a card-shaped weapon at bottom right, speed lines.',
        key: 'Neon White heaven; parkour; card weapons',
        avoid: ['a masked assassin in a white hood'],
        briefs: [
          'In first person over a blinding white-and-cyan heavenly city, a speed-walking librarian vaults off floating marble slabs toward a glowing finish line while little demons pop into sparkles around her. No readable text or logo.',
          'A heavenly café sits on a cloud with marble chairs. A single card lies on the table glowing. No readable text or logo.',
          'A gold finish ring hangs above a cyan waterfall in heaven. A pigeon lands on it. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Pentiment 2022 - Obsidian Illuminated Manuscript',
      'twenty-twenties adventure game',
      [...T, 'pentiment'],
      {
        look: 'Obsidian Pentiment (2022) look: sixteenth-century Bavarian village drawn like a living illuminated manuscript and woodcut, parchment backgrounds, ink outlines and hand-lettered speech.',
        subject: 'render people as flat illuminated-manuscript and woodcut figures on parchment.',
        color: 'Parchment cream, ink black and illumination gold and red.',
        light: 'Flat even light as on a manuscript page, no cast shadows.',
        texture:
          'Parchment grain, ink outlines, woodcut hatching and flat washes of color on figures.',
        camera: 'Flat side-view manuscript page.',
        mood: 'scholarly village mystery',
        render:
          'A 2022 side-view frame at 1920 by 1080: a village drawn like a manuscript page with small flat figures walking.',
        key: 'Pentiment manuscript; woodcut; parchment village',
        briefs: [
          'Drawn like a living illuminated manuscript, a village baker and a traveling monk argue over a missing loaf in a sixteenth-century Bavarian square while a goat eats the church notices. No readable text or logo.',
          'A scriptorium of monks copies books at long desks in woodcut style. One monk has fallen asleep on his page. No readable text or logo.',
          'A parchment map of a village has a small drawn tree growing off its edge. A snail crawls along it. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Cult of the Lamb 2022 - Massive Monster Cute Occult',
      'twenty-twenties roguelike game',
      [...T, 'cult-of-the-lamb'],
      {
        look: 'Massive Monster Cult of the Lamb (2022) look: cute cartoon woodland animals in dark occult rituals, bold outlines, pastel-and-crimson palettes and cheerful creepy cult management.',
        subject:
          'render the subject as cute bold-outlined cartoon animals in pastel occult settings.',
        color: 'Pastel purple, crimson and forest green.',
        light: 'Warm candle glow and red ritual light on dark ground.',
        texture: 'Bold outlines and flat cartoon shading on cute animals, flat ground textures.',
        camera: 'Three-quarter top-down view.',
        mood: 'cute creepy cheer',
        render:
          'A 2022 frame at 1920 by 1080 from a high angle: cute cartoon animals in an occult camp, heart shapes top left.',
        key: 'Cult of the Lamb cute occult; bold outlines',
        avoid: ['a small lamb with a red crown'],
        briefs: [
          'In a pastel woodland camp, a cute cartoon hedgehog leads a ring of chanting frogs and mice in a candlelit ritual around a giant glowing mushroom while one frog eats a snack. No readable text or logo.',
          'A cute cartoon shrine stands in a dark forest with pastel candles. A bunny offers a turnip. No readable text or logo.',
          'A tiny wooden outhouse glows ominously purple in a pastel meadow at dusk. A small cartoon bird waits outside, tapping its foot and holding a newspaper. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Vampire Survivors 2022 - poncle Sprite Swarm',
      'twenty-twenties roguelike game',
      [...T, 'vampire-survivors'],
      {
        look: 'poncle Vampire Survivors (2022) look: retro gothic pixel sprites, a tiny hero swarmed by thousands of enemies, screen-filling weapon effects, gems and chaotic bullet-heaven density.',
        subject: 'render the subject as a tiny pixel sprite swarmed by thousands of pixel enemies.',
        color: 'Gothic pixel greens, gem blue and weapon white.',
        light: 'Flat pixel colors with bright flashing weapon effects everywhere.',
        texture: 'Chunky retro pixel sprites on a plain repeating grass or stone floor.',
        camera: 'Top-down swarm view.',
        mood: 'chaotic addictive frenzy',
        render:
          'A 2022 PC frame: one tiny sprite in the center surrounded by hundreds of pixel monsters and swirling projectiles.',
        key: 'Vampire Survivors swarm; pixel sprites; weapon chaos',
        briefs: [
          'In retro gothic pixel art, a tiny grandmother with a garlic aura stands in the center of a forest as thousands of pixel bats, skeletons and ghosts swarm toward her and scatter into blue gems. No readable text or logo.',
          'A pixel library floor is carpeted with countless spinning books. A small figure runs through them. No readable text or logo.',
          'A single roast chicken sits in a pixel wall on a dark stone floor. Glowing gems surround it. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Baldurs Gate 3 2023 - Larian Cinematic Fantasy',
      'twenty-twenties role-playing game',
      [...T, 'baldurs-gate-3'],
      {
        look: 'Larian Studios Baldur’s Gate 3 (2023) look: cinematic high-fantasy role-playing, detailed painterly realism, torchlit camps, tadpole horror, dice-driven drama and grand gothic cities.',
        subject:
          'render the subject as detailed cinematic fantasy characters in torchlit camps and cities.',
        color: 'Warm torch amber, forest green and gothic purple.',
        light: 'Warm campfire and torchlight with deep night blues around.',
        texture: 'Detailed realistic fantasy materials with slightly soft game-engine sharpness.',
        camera: 'Cinematic dialogue close-ups and isometric views.',
        mood: 'dramatic fantasy intrigue',
        render:
          'A 2023 PC frame at 2560 by 1440 from a high angle: a small party in a camp, a hotbar of blank slots along the bottom.',
        key: "Baldur's Gate 3 cinematic fantasy; campfire; gothic city",
        avoid: ['existing Baldur’s Gate companions', 'a mind flayer with face tentacles'],
        briefs: [
          'Around a torchlit camp at night, a halfling bard, a dwarf cook and a wizened wizard argue over a stew pot while a roll of the dice glows in the air above the fire. No readable text or logo.',
          'A gothic city gate glows at dusk with torches and banners. A cart of cabbages waits at the check. No readable text or logo.',
          'A forest shrine hides a crypt door behind hanging vines and mossy statues. A single candle burns before it, and fresh footprints lead inside. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Alan Wake 2 2023 - Remedy Dark Place Noir',
      'twenty-twenties horror game',
      [...T, 'alan-wake-2'],
      {
        look: 'Remedy Alan Wake 2 (2023) look: photoreal Pacific Northwest noir, rain and fog, a nightmarish New York Dark Place, live-action overlays, flashlight beams and meta horror.',
        subject: 'render the subject in photoreal rainy noir towns and nightmarish city streets.',
        color: 'Wet forest green, noir blue and flashlight white.',
        light: 'A flashlight beam cutting through fog, neon signs smeared on wet streets.',
        texture: 'Photoreal wet surfaces with heavy film grain and slight motion softness.',
        camera: 'Over-the-shoulder flashlight view.',
        mood: 'surreal noir dread',
        render:
          'A 2023 frame at 2560 by 1440 in third person over the shoulder: flashlight cone, dark fog, a small weapon icon shape.',
        key: 'Alan Wake 2 noir; Dark Place; flashlight fog',
        briefs: [
          'In a photoreal rainy Pacific Northwest diner at night, a small-town sheriff stares at a jukebox playing by itself while neon letters in the fog outside rearrange into a door. No readable text or logo.',
          'A New York subway station floods with dark water and flickering lights. A typewriter clacks somewhere. No readable text or logo.',
          'A lakeside cabin sits in fog with every light on. A manuscript page floats on the water. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Sea of Stars 2023 - Sabotage Pixel Solstice RPG',
      'twenty-twenties role-playing game',
      [...T, 'sea-of-stars'],
      {
        look: 'Sabotage Studio Sea of Stars (2023) look: lush modern pixel art RPG inspired by Chrono Trigger, dynamic day-night lighting, sparkling seas, solstice magic and sweeping vistas.',
        subject:
          'render the subject as detailed modern pixel sprites in lush dynamically lit landscapes.',
        color: 'Sunset gold, moon blue and lush green.',
        light: 'Dynamic day-night light, glowing torches and long pixel shadows.',
        texture: 'Lush detailed pixel art with soft modern lighting laid over the pixels.',
        camera: 'Three-quarter top-down RPG view.',
        mood: 'warm heroic nostalgia',
        render:
          'A 2023 frame at 1920 by 1080: crisp pixel sprites in a lush pixel landscape with smooth glowing light.',
        key: 'Sea of Stars pixel art; day-night light; solstice',
        avoid: ['existing Sea of Stars heroes'],
        briefs: [
          'On a lush pixel-art cliff at golden sunset, a pixel sprite cook and a moonlit sword student share a fish supper while the sea sparkles below and the sky shifts toward night. No readable text or logo.',
          'A pixel harbor town glows at night with lanterns reflected in the water. A ghost ship drifts past. No readable text or logo.',
          'A pixel mountain temple glows under both sun and moon at once. A bell rings silently. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Lies of P 2023 - Neowiz Belle Epoque Puppet City',
      'twenty-twenties action game',
      [...T, 'lies-of-p'],
      {
        look: 'Neowiz Lies of P (2023) look: dark Belle Époque city of Krat, gas lamps, broken puppets with porcelain faces, cobblestone streets and ornate gothic machinery.',
        subject:
          'render the subject in dark Belle Époque streets with gas lamps and broken porcelain puppets.',
        color: 'Gaslight amber, soot black and porcelain white.',
        light: 'Gas lamps glowing through fog on dark wet cobblestones.',
        texture:
          'Detailed soot, cracked porcelain and brass with a slightly soft game-engine finish.',
        camera: 'Third-person soulslike view.',
        mood: 'eerie ornate decay',
        render:
          'A 2023 frame at 2560 by 1440 in third person: a figure seen from behind in foggy streets, bar shapes top left.',
        key: 'Lies of P Belle Époque; puppets; gas lamps',
        avoid: ['a puppet boy with a mechanical arm and a long nose'],
        briefs: [
          'On a foggy Belle Époque street lit by gas lamps, a porcelain-faced puppet shoeshiner keeps polishing an empty shoe beside a fallen streetcar while crows perch on the ornate iron balconies. No readable text or logo.',
          'An ornate hotel lobby glows with gaslight and dusty chandeliers. A cricket sits on the reception bell. No readable text or logo.',
          'A cracked porcelain mask lies on wet cobblestones under a lamp. Its painted smile is still perfect. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Pizza Tower 2023 - Tour De Pizza Cartoon Chaos',
      'twenty-twenties platformer game',
      [...T, 'pizza-tower'],
      {
        look: 'Tour De Pizza Pizza Tower (2023) look: frantic hand-drawn nineties cartoon animation in the spirit of Wario Land, squash-and-stretch exaggeration, chunky outlines and chaotic speed.',
        subject: 'render the subject as frantic squash-and-stretch hand-drawn cartoon figures.',
        color: 'Loud cartoon yellow, tomato red and purple.',
        light: 'Flat cartoon colors with no shading at all.',
        texture: 'Chunky hand-drawn outlines, wobbling squash-and-stretch sprites and flat color.',
        camera: 'Side-scrolling chaotic platformer view.',
        mood: 'frantic cartoon chaos',
        render:
          'A 2023 frame at 960 by 540: frantic side-view cartoon sprite smashing blocks, a TV-shaped box in the corner.',
        key: 'Pizza Tower frantic cartoon; squash and stretch',
        avoid: ['a pudgy Italian chef running on all fours'],
        briefs: [
          'In frantic hand-drawn cartoon style, a lanky plumber in a sweaty undershirt sprints through a collapsing cheese factory with his face stretched in panic as giant rats chase him. No readable text or logo.',
          'A cartoon tower of pizza boxes wobbles to the ceiling. A tiny mouse sits at the top. No readable text or logo.',
          'A hand-drawn kitchen oven bursts open with a burst of cartoon smoke rings. A timer rings madly. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Chants of Sennaar 2023 - Rundisc Moebius Tower',
      'twenty-twenties puzzle game',
      [...T, 'chants-of-sennaar'],
      {
        look: 'Rundisc Chants of Sennaar (2023) look: Moebius-inspired flat-colored ligne claire tower of Babel, pastel architecture, veiled travelers and puzzles deciphering invented glyph languages.',
        subject:
          'render the subject in pastel ligne claire tower architecture with veiled travelers.',
        color: 'Pastel ochre, lilac and sky teal.',
        light: 'Flat clean light with soft pastel shadows.',
        texture: 'Clean thin outlines and flat pastel color on simple 3D architecture.',
        camera: 'Wide architectural third-person view.',
        mood: 'serene curious deciphering',
        render:
          'A 2023 frame at 1920 by 1080: small veiled traveler in vast pastel tower architecture, clean outlines.',
        key: 'Chants of Sennaar Moebius; tower; glyph language',
        briefs: [
          'In a pastel ligne claire tower city, a veiled traveler kneels before a carved wall of strange invented glyphs while monks on the terraces above bow toward a floating lantern. No readable text or logo.',
          'A spiral staircase wraps a pastel tower into the clouds. Each level has a different style of arch. No readable text or logo.',
          'A single glyph carved on a pastel stone door glows faintly at the top of the tower. A patient cat sits beneath it, as if it already knows the meaning. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Balatro 2024 - LocalThunk CRT Poker Psychedelia',
      'twenty-twenties roguelike game',
      [...T, 'balatro'],
      {
        look: 'LocalThunk Balatro (2024) look: pixel-art poker cards on a swirling psychedelic CRT-filtered felt background, jokers with holographic foils, chips and multipliers flashing.',
        subject:
          'render the subject as pixel-art playing cards and jokers on swirling psychedelic CRT felt.',
        color: 'Swirling red, teal felt and foil gold.',
        light: 'CRT glow over a swirling psychedelic background, foil shine on some cards.',
        texture: 'Pixel-art playing cards with scanlines and a slight curved-screen warp.',
        camera: 'Flat card table view.',
        mood: 'hypnotic gambling rush',
        render:
          'A 2024 frame at 1920 by 1080: a hand of pixel cards at the bottom, a row of joker cards above, swirling felt behind.',
        key: 'Balatro CRT swirl; pixel cards; foil jokers',
        briefs: [
          'On a swirling psychedelic CRT felt background, a hand of pixel-art playing cards fans out showing an original joker who is a sleeping owl in a bow tie, his card glittering with holographic foil. No readable text or logo.',
          'A stack of pixel poker chips wobbles as the background swirls red and teal. Scanlines ripple across. No readable text or logo.',
          'A single pixel card face down on swirling felt glows gold at the edges. The CRT warp bends it. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Animal Well 2024 - Shared Memory Dark Pixel Well',
      'twenty-twenties metroidvania game',
      [...T, 'animal-well'],
      {
        look: 'Shared Memory Animal Well (2024) look: tiny dark pixel art with glowing bioluminescent light sources, eerie giant animals, a small blob hero and dense hand-crafted secrets.',
        subject: 'render the subject as tiny pixel sprites in dark wells lit by glowing sources.',
        color: 'Deep black with glowing teal, pink and amber.',
        light: 'Small glowing pixel light sources in near-total darkness.',
        texture: 'Tiny detailed pixel art with soft modern glow and bloom around lights.',
        camera: 'Side-view single-screen metroidvania.',
        mood: 'eerie curious mystery',
        render:
          'A 2024 frame at 320 by 180 scaled up: a tiny blob sprite in a dark well, glowing plants and a huge animal shape.',
        key: 'Animal Well glowing pixels; dark wells; giant animals',
        avoid: ['a small round blob hero'],
        briefs: [
          'In a dark pixel well lit by glowing teal flowers, a tiny snail explorer holding a firecracker stares up at an enormous pixel chameleon whose eye slowly opens in the gloom. No readable text or logo.',
          'A glowing pixel candle flickers in a dark underground shrine deep inside the well. Tiny pixel ghosts gather around its warm light and hum together. No readable text or logo.',
          'A bubble floats up a dark pixel shaft past sleeping seahorses. It glows pink as it rises. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Astro Bot 2024 - Team Asobi Toy Platform Joy',
      'twenty-twenties platformer game',
      [...T, 'astro-bot'],
      {
        look: 'Team Asobi Astro Bot (2024) look: glossy toy-like robot platforming, bright playful worlds of candy colors, physics-driven props, cheering tiny bots and joyful polish.',
        subject: 'render the subject as tiny glossy toy robots in bright playful platform worlds.',
        color: 'Glossy candy blue, sunny yellow and white.',
        light: 'Bright cheerful daylight with glossy highlights on every toy surface.',
        texture: 'Glossy plastic toy surfaces, rounded edges and bright primary colors.',
        camera: 'Third-person platformer view.',
        mood: 'pure playful joy',
        render:
          'A 2024 console frame at 3840 by 2160: tiny glossy robot on a bright toy platform, sharp and colorful.',
        key: 'Astro Bot glossy toys; playful worlds; tiny bots',
        avoid: ['a small white robot with blue eyes and a jetpack'],
        briefs: [
          'In a bright glossy toy world, a tiny red robot with a watering can hops across floating strawberry platforms while dozens of little robots cheer and wave from a candy-striped hill. No readable text or logo.',
          'A glossy toy beach holds a sandcastle guarded by a crab robot. The waves are made of jelly. No readable text or logo.',
          'A tiny robot sleeps in a teacup on a giant table. A spoon hangs over it like a slide. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Clair Obscur Expedition 33 2025 - Sandfall Belle Epoque Fantasy',
      'twenty-twenties role-playing game',
      [...T, 'expedition-33'],
      {
        look: 'Sandfall Interactive Clair Obscur: Expedition 33 (2025) look: Belle Époque-inspired dark fantasy, painterly surreal landscapes, a giant painted monolith, graceful expeditioners and melancholic beauty.',
        subject:
          'render the subject as graceful Belle Époque expeditioners in painterly surreal landscapes.',
        color: 'Painterly gold, rose and deep blue.',
        light: 'Soft painterly glow with surreal floating light sources.',
        texture: 'Detailed painterly realism with slightly soft game-engine sharpness.',
        camera: 'Cinematic third-person vistas.',
        mood: 'melancholic surreal beauty',
        render:
          'A 2025 frame at 2560 by 1440: turn-based battle with a party on one side and a surreal enemy, blank command shapes.',
        key: 'Expedition 33 Belle Époque; painterly surreal; expedition',
        avoid: ['a giant Paintress figure on a monolith'],
        briefs: [
          'Across a painterly surreal landscape of floating petals, a Belle Époque expedition of a botanist, an old cellist and a tailor walks toward a distant shimmering tower as the sky ripples like wet paint. No readable text or logo.',
          'A cliffside village of ornate Belle Époque houses hangs over a sea of golden clouds. A lamppost glows at dusk. No readable text or logo.',
          'A single easel stands on a beach of glass sand. Its canvas shows the same beach at night. No readable text or logo.',
        ],
      },
    ),
  ],
};

export default spec;
