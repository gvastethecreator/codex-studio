import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Video game originals vault, neon urban and night ops: in-game screenshot looks. The ten
// reference-titled originals get fully original card briefs; ten new descriptor-named capture looks
// add top-down neon shooters, rain-slick stealth alleys, hacker-den isometrics, hover-taxi chases,
// night-market brawlers, rooftop scope views, drone night feeds, arcade night racers, pixel night
// ninjas and neon rhythm street battles.
const capture = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  avoid: string[],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'game-capture', 'portable-style-study'],
  dna: dna(fields),
  avoid: [...avoid, 'existing game characters, logos or levels', 'readable interface text', 'gore', ...STYLE_AVOID],
  briefs,
});

const keep = 'Preserve the requested identity, count, pose and action with original characters';

const spec: Spec = {
  pack: 'pack_12',
  category: '1. Neon Urban & Night Ops',
  updates: {
    'SP12-001': { briefs: [
      'Slicing through a motel hallway in one frozen frame of side-view pixel action, an original masked swordsman deflects a bullet back at a gunman while the glass partition behind them explodes into slow-motion shards. No readable text or logo.',
      'Standing in a pixel-art motel room full of defeated guards, a lone assassin realizes the target he was hired to eliminate is the hotel\'s very old cat. No readable text or logo.',
      'Frozen in a side-on pixel corridor lit by teal window light, a door at the end stands ajar, and the replay-style afterimages show someone who has already walked through it. No readable text or logo.',
    ] },
    'SP12-014': { briefs: [
      'Leaping between white rooftops in first person, an original runner\'s arms reach for a red-marked ledge as a drone swarm sweeps the gap below her in the clean glass city. No readable text or logo.',
      'Mid-sprint across a pristine white rooftop, a parkour courier suddenly finds a very confused pigeon perched on the only red-marked handhold. No readable text or logo.',
      'From a first-person view on a clean white roof, every route marker glows red and leads straight off the edge into fog. No readable text or logo.',
    ] },
    'SP12-025': { briefs: [
      'Punching through a neon-lit street in hand-drawn side-scrolling style, an original brawler lifts a goon over her head while a crowd of punks charges from both screen edges. No readable text or logo.',
      'On a hand-drawn neon street, a tough fighter picks up a roast chicken from a broken barrel to heal, and eats it with great dignity. No readable text or logo.',
      'On a side-scrolling street at night, the enemies have stopped attacking and are all looking toward the next alley, where the neon signs are flickering off. No readable text or logo.',
    ] },
    'SP12-032': { briefs: [
      'Seen from an isometric harbor view, an original crew of cursed pirates freezes a patrol in mid-step with a shadowy spell as lantern vision cones sweep the docks. No readable text or logo.',
      'In an isometric harbor, a stealthy pirate has hidden perfectly inside a barrel, except for a parrot sitting very visibly on top of it. No readable text or logo.',
      'On an isometric night dock, all the guard vision cones are pointed away from one crate, which is slowly moving on its own. No readable text or logo.',
    ] },
    'SP12-043': { briefs: [
      'Firing wildly from a harbor crane in third person, an original soldier holds back a kaiju-sized ant climbing a container ship while civilians flee along the pier. No readable text or logo.',
      'In an arcade harbor battle, a soldier dives heroically out of the way of a giant insect, which is only trying to reach the ice cream truck. No readable text or logo.',
      'Across a ruined harbor at dawn, a giant beetle shell lies overturned, and the wide arcade camera shows something much larger moving under the water beyond it. No readable text or logo.',
    ] },
    'SP12-048': { briefs: [
      'Weaving a voxel hovercar through stacked crystal canyons in the rain, an original courier delivers a glowing package to an apartment balcony a mile above the ground. No readable text or logo.',
      'In a voxel rain city, a hover-taxi driver is stuck in a traffic jam of flying cars while a pigeon made of blocks overtakes all of them. No readable text or logo.',
      'Between rain-soaked voxel towers, one apartment window glows at the very bottom of the canyon where no roads go. No readable text or logo.',
    ] },
    'SP12-056': { briefs: [
      'Wall-running along a carbon-black megatower in first person, an original cyber-ninja slices through a laser barrier as the city drops away a thousand floors below. No readable text or logo.',
      'Mid-dash along a megacity wall, a cyber-ninja is forced to stop because a window cleaner on his platform has refused to move. No readable text or logo.',
      'From a first-person view high in a vertical megacity, the blade in the player\'s hand reflects a figure standing directly behind the camera. No readable text or logo.',
    ] },
    'SP12-062': { briefs: [
      'Brawling through a dense nightlife street of red lanterns and koi-shaped signs, an original street fighter swings a bicycle at three thugs while onlookers cheer from a karaoke bar. No readable text or logo.',
      'On a neon nightlife street, a tough brawler takes a break mid-fight to help an old lady win a prize at the claw machine. No readable text or logo.',
      "Down a crowded neon alley, a koi-shaped sign has started swimming slowly along the wall, leaving a wet trail of light on the bricks behind it. No readable text or logo.",
    ] },
    'SP12-071': { briefs: [
      'Crouching in an overgrown canal beneath a towering alien citadel, an original resistance fighter aims a crowbar-and-rifle combo at a walker striding through the green ruins. No readable text or logo.',
      'In a first-person canal hideout, a resistance member proudly shows off a weapon that is clearly just a crowbar taped to a flashlight. No readable text or logo.',
      'Through a first-person view of a rusted canal, a metal door is covered in rebel markings except one symbol freshly painted over in grey. No readable text or logo.',
    ] },
    'SP12-078': { briefs: [
      'Hanging upside down from an inked lotus lantern, an original ninja drops silently behind a guard whose vision cone sweeps the side-view palace hall in soft yellow. No readable text or logo.',
      'In a side-view palace, a stealthy ninja hides in plain sight as a very obviously fake potted plant, and the guard is considering watering it. No readable text or logo.',
      'In a silhouetted side-view hall, a guard\'s vision cone sweeps the room and passes through a shadow that has no one casting it. No readable text or logo.',
    ] },
  },
  creates: [
    capture('Top-Down Neon Twin-Stick Capture', 'overhead neon shooter game screenshot', 'topdown-neon', {
      aesthetic: 'Top-down neon twin-stick capture: an original overhead shooter screenshot with glowing enemies, bright projectile trails and dark grid floors, readable in a glance.',
      subject_treatment: `${keep}; show the subject from directly above as a readable player or enemy sprite among glowing projectiles.`,
      color_and_tone: 'Black and deep blue floors with hot magenta, cyan and lime glows.',
      lighting_and_shadow: "Emissive projectiles and enemies lighting the floor, kept consistent across the whole image.",
      texture_and_material: 'Clean vector-like sprites, grid floors and particle bursts.',
      camera_and_composition: "Fixed overhead camera with the player centered, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with frantic arcade intensity.',
      rendering_and_quality: "Crisp glowing game capture with minimal HUD, kept consistent across the whole image.",
      key_features: 'overhead camera; glowing projectiles; grid floor; swarm enemies',
    }, [], [
      'Seen from directly above on a glowing grid, a lone original ship spins in the center of a spiral swarm of magenta enemies as a ring of cyan bullets blossoms outward. No readable text or logo.',
      'From overhead on a neon grid, a tiny player ship is being chased by an enormous swarm that is, on closer look, entirely made of glowing rubber ducks. No readable text or logo.',
      'On a dark overhead grid, all the enemies have frozen in place and turned to face the same empty corner of the arena. No readable text or logo.',
    ]),
    capture('Rain-Slick Alley Stealth Capture', 'third-person rainy stealth screenshot', 'rain-stealth', {
      aesthetic: 'Rain-slick alley stealth capture: an original third-person stealth game screenshot in wet neon alleys, reflections on puddles, steam vents and guard flashlights.',
      subject_treatment: `${keep}; show the subject crouched or hidden in a wet neon alley from an over-the-shoulder camera.`,
      color_and_tone: 'Wet black, sodium orange and teal neon reflections.',
      lighting_and_shadow: "Neon signs, flashlight cones and puddle reflections, kept consistent across the whole image.",
      texture_and_material: "Wet asphalt, brick, steam and chain-link, kept consistent across the whole image.",
      camera_and_composition: "Over-the-shoulder view with a clear sneaking route, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with taut rainy suspense.',
      rendering_and_quality: "Real-time game look with readable stealth cues, kept consistent across the whole image.",
      key_features: 'rain puddles; neon reflections; flashlight cones; over-shoulder view',
    }, [], [
      'Crouched behind a dumpster in a rain-slick alley, an original infiltrator waits as a guard\'s flashlight sweeps the puddles, reflecting a towering corporate hologram overhead. No readable text or logo.',
      'Sneaking through a wet neon alley, a stealth agent is foiled by a stray cat that has decided to follow him and meow loudly. No readable text or logo.',
      "Sweeping over a wet puddle, a guard's flashlight catches a reflection that shows the infiltrator standing right behind him in the alley. No readable text or logo.",
    ]),
    capture('Isometric Hacker Den Capture', 'isometric cyberpunk room screenshot', 'hacker-den', {
      aesthetic: 'Isometric hacker den capture: an original isometric screenshot of a cramped cyberpunk room with glowing monitors, cables, and a character jacked into a terminal.',
      subject_treatment: `${keep}; show the subject in a cramped isometric room full of glowing screens and cables.`,
      color_and_tone: 'Dark room with green, cyan and magenta monitor glow.',
      lighting_and_shadow: "Monitor glow and small practical lights, kept consistent across the whole image.",
      texture_and_material: "Cables, clutter, cracked screens and neon strips, kept consistent across the whole image.",
      camera_and_composition: "Isometric cutaway room view, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with cramped digital obsession.',
      rendering_and_quality: 'Tidy isometric detail with no readable screen text.',
      key_features: 'isometric room; glowing monitors; cables; terminal',
    }, ['readable screen text'], [
      'Jacked into a terminal in a cramped isometric den, an original hacker is surrounded by monitors showing a gigantic glowing serpent of code coiling through the city grid. No readable text or logo.',
      'In a cluttered isometric hacker room, a legendary netrunner is struggling to untangle a single enormous knot of cables. No readable text or logo.',
      "Surrounded by glowing screens in a cramped room seen from above at an angle, a hacker notices every monitor shows the room from a different view, including one from inside the closet. No readable text or logo.",
    ]),
    capture('Hover-Taxi Chase Capture', 'flying car chase game screenshot', 'hover-chase', {
      aesthetic: 'Hover-taxi chase capture: an original chase-camera screenshot of a flying taxi weaving through vertical traffic lanes between megatowers, motion blur and holograms.',
      subject_treatment: `${keep}; show the subject in or around a flying vehicle from a chase camera.`,
      color_and_tone: 'Night blue, taxi yellow and pink hologram light.',
      lighting_and_shadow: "Traffic light streaks and hologram glow, kept consistent across the whole image.",
      texture_and_material: 'Glossy car panels, glass towers and rain streaks.',
      camera_and_composition: 'Chase camera behind the vehicle with speed lines.',
      atmosphere_and_mood: 'Keep the requested mood with breakneck urban thrill.',
      rendering_and_quality: 'Real-time capture with motion blur, no HUD text.',
      key_features: 'flying taxi; vertical traffic; chase camera; holograms',
    }, [], [
      'Banking hard between two megatowers from a chase camera, an original hover-taxi dodges a police gunship while its passenger clings to the door with a stolen briefcase. No readable text or logo.',
      'In a high-speed hover chase, a taxi driver still stops at every floating red light while the police behind him are furious. No readable text or logo.',
      'From a chase camera behind a hover-taxi, the traffic lanes ahead are completely empty, and every hologram has switched to the same smiling face. No readable text or logo.',
    ]),
    capture('Night-Market Brawler Capture', 'side-scrolling street fight screenshot', 'night-market', {
      aesthetic: 'Night-market brawler capture: an original side-scrolling beat-em-up screenshot in a crowded night market, food stalls, lanterns and breakable props.',
      subject_treatment: `${keep}; show the subject mid-fight in a side-scrolling night market lane.`,
      color_and_tone: 'Warm lantern orange, steam white and neon pink.',
      lighting_and_shadow: "Lantern and stall light with steam glow, kept consistent across the whole image.",
      texture_and_material: "Food stalls, crates, steam and hand-drawn sprites, kept consistent across the whole image.",
      camera_and_composition: "Side-on lane with enemies from both sides, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with rowdy festive chaos.',
      rendering_and_quality: "Clean hand-drawn game capture, kept consistent across the whole image.",
      key_features: 'side-scrolling lane; food stalls; lanterns; breakable props',
    }, [], [
      'Knocking a thug through a noodle stall in a side-scrolling night market, an original fighter catches a flying bowl without spilling a drop as lanterns swing overhead. No readable text or logo.',
      'Mid-brawl in a night market, the hero and the gang leader both pause because the dumpling vendor has just announced fresh dumplings. No readable text or logo.',
      'In a side-scrolling night market, all the stalls are lit and steaming but the lane ahead is deserted, and a single lantern is rolling toward the player. No readable text or logo.',
    ]),
    capture('Rooftop Scope View Capture', 'sniper scope night game screenshot', 'scope-view', {
      aesthetic: 'Rooftop scope view capture: an original first-person sniper screenshot through a round scope over a night city, reticle, lens glare and distant targets.',
      subject_treatment: `${keep}; frame the subject through a circular scope with a reticle from a distant rooftop.`,
      color_and_tone: 'Dark vignette with cool city lights in the lens.',
      lighting_and_shadow: "Lens glare and distant window light, kept consistent across the whole image.",
      texture_and_material: 'Scope glass, reticle lines and night city detail.',
      camera_and_composition: "Circular scope view with black surround, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with patient tense focus.',
      rendering_and_quality: "Clean scope capture with no readable numbers, kept consistent across the whole image.",
      key_features: 'scope circle; reticle; night city; lens glare',
    }, ['readable range numbers'], [
      'Through a round night scope, an original sniper watches a masked courier on a distant rooftop hand a glowing case to a winged drone-bird. No readable text or logo.',
      'Framed in a sniper scope far across the city, the target is a man in pajamas watering his balcony plants and waving cheerfully. No readable text or logo.',
      'Through a scope pointed at a dark window, the reticle rests on an empty room, and a hand is slowly drawing the curtain closed. No readable text or logo.',
    ]),
    capture('Drone Night Feed Capture', 'surveillance drone game screenshot', 'drone-feed', {
      aesthetic: 'Drone night feed capture: an original surveillance-drone screenshot in grainy night vision, tagged silhouettes, scan lines and a wide overhead view.',
      subject_treatment: `${keep}; show the subject from above through a grainy drone night-vision feed.`,
      color_and_tone: "Green or thermal white-hot monochrome, kept consistent across the whole image.",
      lighting_and_shadow: "Night-vision glow and hot thermal silhouettes, kept consistent across the whole image.",
      texture_and_material: "Sensor grain, scan lines and blocky compression, kept consistent across the whole image.",
      camera_and_composition: "Top-down or steep drone angle with markers, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with cold watchful distance.',
      rendering_and_quality: "Convincing sensor feed with no readable data, kept consistent across the whole image.",
      key_features: 'night vision; drone angle; target brackets; scan lines',
    }, ['readable data text'], [
      'From a grainy drone feed, an original squad of thermal silhouettes stacks up outside a warehouse while a huge heat signature moves inside it, far too big for a person. No readable text or logo.',
      'Seen in night vision from a drone, a highly trained strike team is surrounding a suspicious van that turns out to hold a sleeping dog. No readable text or logo.',
      'On a thermal drone feed of an empty street, a single cold dark shape stands among the warm lamps, not moving. No readable text or logo.',
    ]),
    capture('Arcade Night Racer Capture', 'retro arcade night racing screenshot', 'arcade-racer', {
      aesthetic: 'Arcade night racer capture: an original behind-the-car arcade racing screenshot on a neon night highway, sunset gradients, palm silhouettes and speed streaks.',
      subject_treatment: `${keep}; show the subject racing from a behind-the-car arcade camera on a neon highway.`,
      color_and_tone: 'Sunset magenta, violet and cyan with road lights.',
      lighting_and_shadow: "Neon road lights and tail-light glow, kept consistent across the whole image.",
      texture_and_material: 'Glossy car paint, road stripes and speed lines.',
      camera_and_composition: "Behind-the-car view with a vanishing road, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with euphoric retro speed.',
      rendering_and_quality: 'Clean arcade capture with no readable HUD text.',
      key_features: 'behind-car camera; neon highway; sunset gradient; speed streaks',
    }, ['car brand logos'], [
      'Racing down a neon highway toward a giant setting sun, an original convertible drifts past a rival as the road ahead rises into a glowing loop over the sea. No readable text or logo.',
      'On a neon arcade highway, the fastest car in the race is being overtaken by a tractor with enormous glowing spoilers. No readable text or logo.',
      'On an endless neon highway at night, the road ahead keeps repeating the same billboard, and each time it shows the car a little closer. No readable text or logo.',
    ]),
    capture('Pixel Night Ninja Capture', 'retro pixel ninja action screenshot', 'pixel-ninja', {
      aesthetic: 'Pixel night ninja capture: an original retro pixel action screenshot of a ninja on moonlit rooftops, parallax skylines, small sprites and sharp colors.',
      subject_treatment: `${keep}; render the subject as a small pixel sprite in a moonlit rooftop action scene.`,
      color_and_tone: 'Deep indigo night with moon yellow and red accents.',
      lighting_and_shadow: "Moonlight rims and flat pixel shading, kept consistent across the whole image.",
      texture_and_material: 'Crisp pixel sprites, tile roofs and parallax layers.',
      camera_and_composition: "Side-scrolling rooftop view, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with sharp retro action.',
      rendering_and_quality: "Clean pixel capture with no readable HUD, kept consistent across the whole image.",
      key_features: 'pixel ninja; moonlit rooftops; parallax skyline; small sprites',
    }, [], [
      "Throwing three stars at a demon kite swooping across the skyline, an original ninja leaps between pagoda rooftops under a giant yellow moon in crisp retro sprites. No readable text or logo.",
      "Landing perfectly after a dramatic jump across moonlit rooftops, a small sprite ninja immediately slips on a single loose roof tile. No readable text or logo.",
      "Standing perfectly still on a moonlit rooftop, a small sprite ninja watches his own shadow keep running along the tiles without him. No readable text or logo.",
    ]),
    capture('Neon Rhythm Street Battle', 'music rhythm combat screenshot', 'rhythm-battle', {
      aesthetic: 'Neon rhythm street battle: an original rhythm-action screenshot where fighters strike on the beat, pulsing neon streets, beat rings and speaker-stack cities.',
      subject_treatment: `${keep}; show the subject striking on the beat amid pulsing rings and speakers.`,
      color_and_tone: "Pulsing magenta, cyan and yellow on black, kept consistent across the whole image.",
      lighting_and_shadow: "Beat-synced light pulses and neon rims, kept consistent across the whole image.",
      texture_and_material: "Glossy streets, speaker stacks and light rings, kept consistent across the whole image.",
      camera_and_composition: "Dynamic third-person arena with beat rings, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with musical kinetic joy.',
      rendering_and_quality: "Clean vibrant capture with no readable text, kept consistent across the whole image.",
      key_features: 'beat rings; neon pulses; speaker stacks; rhythmic strikes',
    }, [], [
      'Striking on the beat in a neon street arena, an original guitarist fighter knocks a robot bouncer backward as every speaker stack in the city pulses in sync. No readable text or logo.',
      'In a pulsing rhythm battle, a fearsome boss dances beautifully in perfect time while the hero keeps tripping over the beat. No readable text or logo.',
      "Pulsing in time with the music, the whole street keeps the beat, but the puddles are rippling to a slower rhythm nobody can hear. No readable text or logo.",
    ]),
  ],
};

export default spec;
