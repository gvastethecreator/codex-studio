import type { Spec } from '../tools/apply';
import { cr } from './_authors';

// Action cinema of the 1980s and 1990s: each preset names its film and director and rebuilds that
// film's production look (grade, lensing, stunt staging, film stock). Cards stage original
// action moments, never the film's own heroes, villains or set pieces.
const T = ['action-80s-90s', 'action-cinema'];
const film80 =
  'Eighties 35mm film grain with diffusion glow on highlights and rich saturated print color.';
const film90 = 'Nineties 35mm film grain with punchy print contrast and early digital compositing.';

const spec: Spec = {
  pack: 'pack_27',
  category: '11. Action Cinema 80s & 90s',
  newCategory: { id: 'action-cinema-80s-90s' },
  updates: {},
  creates: [
    cr(
      'Raiders of the Lost Ark 1981 - Spielberg Pulp Serial',
      'eighties action cinema',
      [...T, 'raiders'],
      {
        look: 'Steven Spielberg Raiders of the Lost Ark (1981) look: golden pulp serial adventure, dusty tombs, desert chases, torchlit temples, snakes and sunlit Saturday-matinee thrills.',
        subject:
          'stage the subject in dusty golden pulp-serial adventure among tombs and desert roads.',
        color: 'Dust gold, khaki and torch orange.',
        light: 'Hard desert sun and torchlight in tombs.',
        texture: film80,
        camera: 'Classic adventure coverage with bold silhouettes.',
        mood: 'rollicking pulp adventure',
        render: 'Authentic early-eighties adventure frame.',
        key: 'Raiders pulp serial; tombs; desert chase; torchlight',
        avoid: [
          'a fedora and bullwhip adventurer',
          'a golden idol on a pedestal',
          'a rolling giant boulder',
        ],
        briefs: [
          'In a torchlit desert tomb, a retired museum cataloguer in a cardigan tiptoes past a pit of hissing lizards holding a clipboard, while a rival team of treasure hunters argues at the entrance behind her. No readable text or logo.',
          'An old flying boat idles at a jungle dock as a botanist sprints toward it clutching a potted orchid. Arrows thud into the pier. No readable text or logo.',
          'A sealed crate sits in the middle of an endless government warehouse. A forklift reverses slowly away from it. No readable text or logo.',
        ],
      },
    ),
    cr(
      'First Blood 1982 - Kotcheff Rain Forest Survival',
      'eighties action cinema',
      [...T, 'first-blood'],
      {
        look: 'Ted Kotcheff First Blood (1982) look: rain-soaked Pacific Northwest forests, mud, cliff faces, a small-town police station and gritty improvised wilderness survival.',
        subject:
          'stage the subject in rain-soaked forests, cliffs and mud with gritty survival realism.',
        color: 'Wet forest green, mud brown and grey rain.',
        light: 'Overcast rain light and flare glow at night.',
        texture: film80,
        camera: 'Handheld forest tracking and low cliff angles.',
        mood: 'gritty hunted survival',
        render: 'Authentic early-eighties survival action frame.',
        key: 'First Blood rain forest; mud; cliffs; survival',
        avoid: ['a shirtless veteran with a red headband and a big knife'],
        briefs: [
          'In a rain-soaked Pacific Northwest forest, a stubborn wedding photographer in a muddy tuxedo improvises a raincoat from a garbage bag while search dogs bay somewhere down the valley. No readable text or logo.',
          'A small-town sheriff stands at a cliff edge in pouring rain, staring down at a river. Only his hat is dry. No readable text or logo.',
          'A cave entrance in a mossy cliff glows with a tiny campfire at night. Helicopter searchlights sweep the trees. No readable text or logo.',
        ],
      },
    ),
    cr(
      'The Terminator 1984 - Cameron Blue Night Pursuit',
      'eighties action cinema',
      [...T, 'terminator-84'],
      {
        look: 'James Cameron The Terminator (1984) look: low-budget blue-grey Los Angeles nights, neon discos, police stations, sodium streets and a relentless nightmare pursuit.',
        subject:
          'stage the subject in blue-grey eighties Los Angeles nights with neon and relentless pursuit.',
        color: 'Night blue-grey, neon pink and sodium orange.',
        light: 'Blue night light and harsh neon.',
        texture: film80,
        camera: 'Low gritty night tracking.',
        mood: 'relentless nocturnal dread',
        render: 'Authentic mid-eighties Cameron frame.',
        key: 'Terminator blue nights; neon; pursuit',
        avoid: ['a chrome endoskeleton with red eyes', 'a man in a leather jacket and sunglasses'],
        briefs: [
          'In a neon-lit eighties nightclub full of smoke, a waitress in a pink uniform freezes behind the bar as a tall figure pushes steadily through the dancers straight toward her booth. No readable text or logo.',
          'A police station at night is lit only by fluorescent tubes. A duty officer yawns as headlights appear outside. No readable text or logo.',
          'A factory floor of hydraulic presses glows blue at dawn. Something crawls slowly between the machines. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Police Story 1985 - Jackie Chan Stunt Glass',
      'eighties action cinema',
      [...T, 'police-story'],
      {
        look: 'Jackie Chan Police Story (1985) look: Hong Kong practical stunt comedy, shattering sugar-glass malls, shanty hillsides flattened by cars, repeated takes of a single stunt and bruised slapstick.',
        subject:
          'stage the subject in real practical stunts through shattering glass and Hong Kong streets.',
        color: 'Mall neon, glass glitter and Hong Kong grey.',
        light: 'Bright mall light glittering on falling glass.',
        texture: film80,
        camera: 'Wide stunt coverage repeated from several angles.',
        mood: 'bruised slapstick bravado',
        render: 'Authentic eighties Hong Kong action frame.',
        key: 'Police Story glass mall; practical stunts; slapstick',
        briefs: [
          'In a glittering Hong Kong shopping mall, a delivery cook slides down a pole strung with light bulbs that explode around him while shards of sugar glass rain onto terrified shoppers below. No readable text or logo.',
          'A stolen car tears straight through a hillside shanty town of tin roofs in one real stunt. Laundry, chickens and roof sheets fly everywhere around it. No readable text or logo.',
          'A bus stops suddenly on a steep street. A man clings to the back with an umbrella handle. No readable text or logo.',
        ],
      },
    ),
    cr('Predator 1987 - McTiernan Jungle Heat', 'eighties action cinema', [...T, 'predator'], {
      look: 'John McTiernan Predator (1987) look: sweltering Central American jungle, sweat and muscle, thermal-vision point of view, shimmering camouflage and mud-caked ambush.',
      subject:
        'stage the subject in sweltering jungle with thermal-vision color and shimmering camouflage.',
      color: 'Jungle green, sweat gold and thermal rainbow.',
      light: 'Hot dappled jungle light and night flares.',
      texture: film80,
      camera: 'Low jungle angles and thermal point-of-view inserts.',
      mood: 'sweltering hunted tension',
      render: 'Authentic late-eighties jungle action frame.',
      key: 'Predator jungle; thermal vision; shimmer camouflage',
      avoid: ['a dreadlocked alien hunter with mandibles', 'three red laser dots'],
      briefs: [
        'Seen in shimmering thermal rainbow colors, a sweating team of wildlife photographers in the jungle crouches around a camera trap while one of the tree branches above them seems to breathe. No readable text or logo.',
        'A mud-caked birdwatcher hides waist-deep in a jungle river at night, binoculars raised. Only his eyes move while the canopy above rustles strangely. No readable text or logo.',
        'A jungle clearing is strung with vines and hanging traps. A single boot print leads in. No readable text or logo.',
      ],
    }),
    cr('Die Hard 1988 - McTiernan Tower Siege', 'eighties action cinema', [...T, 'die-hard'], {
      look: 'John McTiernan Die Hard (1988) look: glass Los Angeles skyscraper at Christmas, air ducts, elevator shafts, broken glass underfoot, walkie-talkies and sweaty barefoot siege.',
      subject:
        'stage the subject inside a half-built glass tower at night with ducts, shafts and broken glass.',
      color: 'Night office amber, glass blue and Christmas red.',
      light: 'Office fluorescents, emergency light and explosions.',
      texture: film80,
      camera: 'Low anamorphic frames in cramped shafts.',
      mood: 'sweaty cornered siege',
      render: 'Authentic late-eighties siege action frame.',
      key: 'Die Hard tower; air ducts; broken glass; Christmas',
      avoid: ['a barefoot cop in a white tank top'],
      briefs: [
        'Crawling through a skyscraper air duct with a lighter held out ahead, an office caterer in a Santa hat drags a tray of canapés behind her while walkie-talkie static echoes through the vents. No readable text or logo.',
        'An elevator shaft yawns black in a half-built floor. A limo driver sits in the garage below, eating snacks. No readable text or logo.',
        'Broken glass glitters across an empty executive floor at Christmas. A lit tree stands among bullet holes. No readable text or logo.',
      ],
    }),
    cr(
      'The Killer 1989 - John Woo Heroic Bloodshed',
      'eighties action cinema',
      [...T, 'the-killer'],
      {
        look: 'John Woo The Killer (1989) look: Hong Kong heroic bloodshed, doves bursting in slow motion, candle-filled churches, two-handed shootouts, freeze frames and operatic loyalty.',
        subject:
          'stage the subject in operatic slow-motion standoffs among doves, candles and churches.',
        color: 'Candle amber, church white and night blue.',
        light: 'Hundreds of candles and backlit doves.',
        texture: film80,
        camera: 'Slow motion, freeze frames and mirrored standoffs.',
        mood: 'operatic loyal melancholy',
        render: 'Authentic late-eighties Hong Kong action frame.',
        key: 'John Woo doves; candle church; slow motion',
        briefs: [
          'In slow motion inside a candle-filled seaside church, two exhausted rivals in rumpled white suits share a single cigarette on a pew as a flock of doves bursts through the broken stained glass. No readable text or logo.',
          'Two men stand face to face in a kitchen, each aiming a spatula at the other. Neither blinks. No readable text or logo.',
          'A white suit jacket lies on the steps of a church at dusk. A dove lands beside it. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Point Break 1991 - Bigelow Surf Adrenaline',
      'nineties action cinema',
      [...T, 'point-break'],
      {
        look: 'Kathryn Bigelow Point Break (1991) look: sun-drenched California surf, huge waves, skydiving, backyard chases, rubber masks and adrenaline-junkie spirituality.',
        subject:
          'stage the subject in sun-drenched surf, skydives and backyard foot chases with adrenaline.',
        color: 'Surf blue, sun gold and wetsuit black.',
        light: 'Bright Pacific sun and golden dusk.',
        texture: film90,
        camera: 'Handheld chase and airborne skydive frames.',
        mood: 'euphoric adrenaline rush',
        render: 'Authentic early-nineties action frame.',
        key: 'Point Break surf; skydiving; foot chases',
        avoid: ['rubber masks of former presidents'],
        briefs: [
          'Hanging in freefall above the California coast, a retired choir director in a borrowed jumpsuit laughs with her arms spread as the surf breaks in white lines far below. No readable text or logo.',
          'A surfer paddles out alone into a monstrous storm wave at dusk. The whole beach watches. No readable text or logo.',
          'A backyard foot chase ends with a pit bull asleep on a pile of spilled groceries. A fence is still rattling. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Hard Boiled 1992 - John Woo Hospital Long Take',
      'nineties action cinema',
      [...T, 'hard-boiled'],
      {
        look: 'John Woo Hard Boiled (1992) look: Hong Kong teahouse and hospital shootouts, a long continuous take through corridors, babies carried through gunfire, jazz clubs and hard blue grade.',
        subject:
          'stage the subject in long continuous takes through Hong Kong teahouses and hospital corridors.',
        color: 'Hospital blue, teahouse jade and muzzle orange.',
        light: 'Fluorescent corridors and muzzle flashes.',
        texture: film90,
        camera: 'Long continuous tracking takes.',
        mood: 'frantic heroic chaos',
        render: 'Authentic early-nineties Hong Kong action frame.',
        key: 'Hard Boiled long take; teahouse; hospital corridors',
        briefs: [
          'In a long continuous take down a hospital corridor, a night nurse carries a basket of sleeping newborns past bursting sprinkler pipes and a toppled trolley while alarms wail. No readable text or logo.',
          'Birdcages hang above a crowded dim-sum teahouse as steam fills the room. One cage door is open. No readable text or logo.',
          'A jazz club clarinetist plays alone after closing. A paper crane sits on his music stand. No readable text or logo.',
        ],
      },
    ),
    cr('Speed 1994 - de Bont Runaway Bus', 'nineties action cinema', [...T, 'speed'], {
      look: 'Jan de Bont Speed (1994) look: sunny Los Angeles freeways, a runaway city bus, gaps in overpasses, sweaty passengers and ticking-clock highway suspense.',
      subject: 'stage the subject on sunny freeways with a runaway vehicle and ticking suspense.',
      color: 'Sunny freeway beige, sky blue and bus yellow.',
      light: 'Bright California daylight.',
      texture: film90,
      camera: 'Low speedometer inserts and wide freeway shots.',
      mood: 'sweaty ticking suspense',
      render: 'Authentic mid-nineties action frame.',
      key: 'Speed runaway bus; freeway; ticking suspense',
      briefs: [
        'On a sun-baked Los Angeles freeway, a school crossing guard grips the wheel of a runaway ice-cream truck while passengers inside hold melting cones and the speedometer needle trembles just above fifty. No readable text or logo.',
        'An unfinished overpass ends in open sky ahead of a speeding bus. Every passenger leans back. No readable text or logo.',
        'An empty airport runway at dusk holds a single rolling city bus. Its door is open and nobody is inside. No readable text or logo.',
      ],
    }),
    cr('Heat 1995 - Mann Cold Blue Los Angeles', 'nineties action cinema', [...T, 'heat-95'], {
      look: 'Michael Mann Heat (1995) look: cool blue Los Angeles nights, glass houses on the ocean, sodium freeways, downtown shootouts and meticulous professional cool.',
      subject:
        'stage the subject in cool blue Los Angeles nights with glass architecture and professional restraint.',
      color: 'Cool steel blue, sodium orange and glass reflections.',
      light: 'Blue night city glow and harsh daylight downtown.',
      texture: film90,
      camera: 'Long lens compression and wide night cityscapes.',
      mood: 'cool meticulous tension',
      render: 'Authentic mid-nineties Mann frame.',
      key: 'Heat cool blue LA; glass houses; downtown shootout',
      briefs: [
        'In a glass beach house glowing blue at night, a lonely jewel appraiser in a grey suit stands at the window eating cereal from the box while the ocean crashes in the dark beyond the reflections. No readable text or logo.',
        'Two professionals sit across a diner table at midnight, coffee untouched. The city lights blur behind them. No readable text or logo.',
        'An armored truck stands open on a downtown street at noon. Paper money drifts in the wind. No readable text or logo.',
      ],
    }),
    cr(
      'Mission Impossible 1996 - De Palma Suspended Heist',
      'nineties action cinema',
      [...T, 'mission-impossible-96'],
      {
        look: 'Brian De Palma Mission: Impossible (1996) look: sleek white vault rooms, wire-suspended infiltration, dutch angles, Prague nights, gadgets and paranoid spy elegance.',
        subject:
          'stage the subject in sleek white vaults and Prague nights with wire suspension and dutch angles.',
        color: 'Clinical white, Prague night blue and steel.',
        light: 'Clean vault light and moody night streets.',
        texture: film90,
        camera: 'Dutch angles and overhead suspended shots.',
        mood: 'paranoid spy elegance',
        render: 'Authentic mid-nineties spy frame.',
        key: 'Mission Impossible white vault; suspended; dutch angles',
        avoid: ['a man suspended on wires above a white vault floor'],
        briefs: [
          'Lowered on a thin wire through a ceiling vent into a pure white library vault, a retired librarian in black gloves reaches for a single overdue book while a single bead of sweat falls toward the pressure-sensitive floor. No readable text or logo.',
          'A tilted Prague street at night glistens with rain. A man waits under a lamp holding two identical briefcases. No readable text or logo.',
          'A high-speed train races through a tunnel with a helicopter tethered behind it. The last carriage is dark. No readable text or logo.',
        ],
      },
    ),
    cr('Face Off 1997 - John Woo Operatic Mirror', 'nineties action cinema', [...T, 'face-off'], {
      look: 'John Woo Face/Off (1997) look: operatic Hollywood action with mirrored standoffs, churches and doves, speedboats, slow motion and baroque gun ballet.',
      subject:
        'stage the subject in operatic mirrored standoffs with doves, churches and slow motion.',
      color: 'Church white, candle gold and ocean blue.',
      light: 'Backlit doves and candlelight.',
      texture: film90,
      camera: 'Slow motion mirrored compositions.',
      mood: 'baroque operatic duality',
      render: 'Authentic late-nineties Woo frame.',
      key: 'Face/Off mirrors; doves; operatic standoffs',
      briefs: [
        'On opposite sides of a two-way mirror, two identical twins in matching tuxedos slowly raise the same wine glass at the same moment while doves flutter in the church beyond. No readable text or logo.',
        'Two speedboats circle each other at dusk off a rocky coast, spraying golden water in slow motion. Both drivers wear the same white suit and the same grin. No readable text or logo.',
        'A candlelit church altar holds a single white dove and an empty gun case. Wax drips onto the floor. No readable text or logo.',
      ],
    }),
    cr('Con Air 1997 - West Prison Plane Mayhem', 'nineties action cinema', [...T, 'con-air'], {
      look: 'Simon West Con Air (1997) look: sweaty prison transport plane, desert boneyards, Las Vegas crash landings, over-the-top explosions and golden-hour bravado.',
      subject:
        'stage the subject aboard a sweaty cargo plane or in desert boneyards at golden hour.',
      color: 'Golden hour orange, desert tan and orange jumpsuits.',
      light: 'Golden hour and explosion flare.',
      texture: film90,
      camera: 'Low heroic angles and slow-motion explosions.',
      mood: 'over-the-top sweaty bravado',
      render: 'Authentic late-nineties Bruckheimer-style frame.',
      key: 'Con Air prison plane; desert boneyard; golden hour',
      briefs: [
        'Inside a rattling cargo plane at golden hour, a nervous flight attendant in an orange jumpsuit serves peanuts to a row of shackled bank robbers who are all politely waiting their turn. No readable text or logo.',
        'An aircraft boneyard in the desert holds rows of rusting planes at sunset. One has its lights on. No readable text or logo.',
        'A pink stuffed bunny lies on a desert runway at dusk beside long black skid marks. Sirens approach and a plane wheel is still spinning nearby. No readable text or logo.',
      ],
    }),
    cr('Run Lola Run 1998 - Tykwer Techno Loop', 'nineties action cinema', [...T, 'run-lola-run'], {
      look: 'Tom Tykwer Run Lola Run (1998) look: Berlin techno sprint, red hair, animation interludes, split screens, rapid photo flashes of strangers’ futures and looping twenty-minute time runs.',
      subject:
        'stage the subject sprinting through Berlin streets with split screens and techno rhythm.',
      color: 'Bright red, Berlin grey and green.',
      light: 'Flat Berlin daylight.',
      texture: film90,
      camera: 'Tracking sprints, split screens and snapshot inserts.',
      mood: 'breathless looping urgency',
      render: 'Authentic late-nineties German frame.',
      key: 'Run Lola Run sprint; split screens; techno loops',
      avoid: ['a woman with bright red hair in a blue tank top'],
      briefs: [
        'Sprinting through Berlin streets in a split-screen frame, a gray-haired postman in a green uniform leaps a stroller while the other half of the screen shows a telephone slowly falling toward the floor. No readable text or logo.',
        'A stack of snapshot photographs shows a stranger’s whole future in seconds. A cyclist waits at the lights. No readable text or logo.',
        'A red telephone spins in the air above an apartment floor. The clock beside it shows twenty minutes to noon. No readable text or logo.',
      ],
    }),
    cr('Ronin 1998 - Frankenheimer Paris Car Chase', 'nineties action cinema', [...T, 'ronin'], {
      look: 'John Frankenheimer Ronin (1998) look: desaturated grey-blue France, real high-speed car chases through Paris tunnels and Nice streets, professional mercenaries and muted cool.',
      subject:
        'stage the subject in real high-speed European car chases with desaturated grey-blue grade.',
      color: 'Desaturated grey, steel blue and tail-light red.',
      light: 'Overcast European daylight and tunnel lamps.',
      texture: film90,
      camera: 'Real in-car and bumper-mounted chase shots.',
      mood: 'cool professional tension',
      render: 'Authentic late-nineties chase frame.',
      key: 'Ronin car chases; grey-blue France; tunnels',
      briefs: [
        'Racing the wrong way through a Paris tunnel in a battered grey sedan, a meticulous sommelier grips the wheel as oncoming headlights stream past and a crate of wine rattles in the back seat. No readable text or logo.',
        'Mercenaries plan over a café table in the rain, a coffee cup marking the target. Nobody uses real names. No readable text or logo.',
        'A silver case sits on the empty seat of a parked car in Nice. The engine is still running. No readable text or logo.',
      ],
    }),
    cr(
      'Crouching Tiger 2000 - Ang Lee Wuxia Bamboo',
      'turn-of-the-century action cinema',
      [...T, 'crouching-tiger'],
      {
        look: 'Ang Lee Crouching Tiger, Hidden Dragon (2000) look: wuxia swordplay balancing on bamboo tops, rooftop chases, desert bandit romance, Yuen Woo-ping wire work and painterly Chinese landscapes.',
        subject:
          'stage the subject in graceful wuxia wire-work among swaying bamboo, rooftops and landscapes.',
        color: 'Bamboo green, desert ochre and silk tones.',
        light: 'Soft misty daylight and moonlit rooftops.',
        texture: film90,
        camera: 'Wide graceful wire-work tableaux.',
        mood: 'graceful poetic longing',
        render: 'Authentic wuxia film frame.',
        key: 'Crouching Tiger bamboo tops; wire work; wuxia',
        briefs: [
          'Balancing on the swaying tops of a bamboo forest, an elderly tea merchant in grey silk duels a young courier with a broom and a folded umbrella while mist drifts through the green canopy. No readable text or logo.',
          'Two figures run lightly across the moonlit tiled rooftops of a walled city, barely touching the tiles. Dogs bark below and lanterns sway in the courtyards. No readable text or logo.',
          'A comb lies in the sand of a desert caravan route. A bandit on horseback returns for it. No readable text or logo.',
        ],
      },
    ),
    cr('Mad Max 2 1981 - Miller Wasteland Convoy', 'eighties action cinema', [...T, 'mad-max-2'], {
      look: 'George Miller Mad Max 2: The Road Warrior (1981) look: sun-scorched Australian wasteland, fortified oil refinery compounds, punk leather raiders, gyrocopters and a desperate tanker convoy chase.',
      subject: 'stage the subject in sun-scorched wasteland compounds and wild vehicle convoys.',
      color: 'Scorched ochre, rust and black leather.',
      light: 'Blazing wasteland sun and dust.',
      texture: film80,
      camera: 'Low wide-angle convoy chase shots.',
      mood: 'savage wasteland desperation',
      render: 'Authentic early-eighties wasteland frame.',
      key: 'Road Warrior wasteland; refinery fort; convoy chase',
      avoid: ['a man in a hockey mask with a mohawk entourage', 'a black V8 interceptor'],
      briefs: [
        'In a sun-scorched wasteland, a tiny wind-powered gyrocopter piloted by a retired dentist in goggles circles over a fortified refinery built of scrap and oil drums. No readable text or logo.',
        'A convoy of patched buses and tow trucks races across the dust at dawn. A child throws a boomerang from the roof. No readable text or logo.',
        'A single can of dog food rests on an oil drum in the wasteland. A dog waits beside it. No readable text or logo.',
      ],
    }),
    cr(
      'Commando 1985 - Lester Cartoon One-Man Army',
      'eighties action cinema',
      [...T, 'commando'],
      {
        look: 'Mark L. Lester Commando (1985) look: cartoonish one-man-army action, tropical islands, face paint and camouflage, shopping mall mayhem, one-liners and absurd explosions.',
        subject:
          'stage the subject in cartoonish one-man-army action with face paint, islands and explosions.',
        color: 'Jungle green, explosion orange and mall pastel.',
        light: 'Bright tropical sun and fireballs.',
        texture: film80,
        camera: 'Low heroic hero shots and wide explosions.',
        mood: 'absurd cheerful mayhem',
        render: 'Authentic mid-eighties action frame.',
        key: 'Commando one-man army; face paint; absurd explosions',
        avoid: ['a muscular man in camouflage face paint with a rocket launcher'],
        briefs: [
          'On a tropical island, a mild-mannered florist in camouflage face paint strides away from a greenhouse as it explodes into a fireball of flower petals behind her. No readable text or logo.',
          'A shopping mall garden center erupts in chaos as a man swings on a hanging basket. Shoppers keep browsing. No readable text or logo.',
          'A suburban tool shed door stands open, lit from inside by a single swinging bulb. Every tool on the pegboard has been taken except one tiny screwdriver. No readable text or logo.',
        ],
      },
    ),
    cr('Hard Target 1993 - Woo Bayou Mardi Gras', 'nineties action cinema', [...T, 'hard-target'], {
      look: 'John Woo Hard Target (1993) look: New Orleans bayous and Mardi Gras warehouses, slow-motion leaps, mullets and long coats, float warehouses and operatic American action.',
      subject:
        'stage the subject in New Orleans bayous and Mardi Gras float warehouses with slow-motion action.',
      color: 'Mardi Gras gold, purple and swamp green.',
      light: 'Warehouse shafts through dust and bayou glare.',
      texture: film90,
      camera: 'Slow-motion leaps and dove-lit tableaux.',
      mood: 'operatic swampy bravado',
      render: 'Authentic early-nineties Woo frame.',
      key: 'Hard Target bayou; Mardi Gras floats; slow motion',
      briefs: [
        'In a dusty warehouse full of giant Mardi Gras floats, a jazz trumpeter in a long coat leaps in slow motion between a papier-mâché dragon and a golden jester head while doves scatter. No readable text or logo.',
        'An airboat speeds through the misty bayou at dawn, its fan roaring above the water. A startled heron takes off beside it and cypress knees flash past. No readable text or logo.',
        'A single purple Mardi Gras mask hangs from a cypress branch over dark water. A snake coils below it. No readable text or logo.',
      ],
    }),
  ],
};

export default spec;
