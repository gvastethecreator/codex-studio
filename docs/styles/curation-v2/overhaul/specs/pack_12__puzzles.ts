import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Video game originals vault, puzzle chambers and adventure setpieces: in-game screenshot looks.
// The ten originals get original card briefs; ten new descriptor-named capture looks add sliding-
// block temples, hand-drawn adventure rooms, tilt-maze marbles, clockwork tower puzzles, rotating
// puzzle-box dioramas, first-person escape rooms, minecart chases, collapsing bridges, treasure
// island digs and shadow-casting puzzles.
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
  avoid: [...avoid, 'existing game characters, logos or levels', 'readable interface text', ...STYLE_AVOID],
  briefs,
});

const keep = 'Preserve the requested identity, count, pose and action with original characters';

const spec: Spec = {
  pack: 'pack_12',
  category: '8. Puzzle Chambers & Adventure Setpieces',
  updates: {
    'SP12-004': { briefs: [
      'Sailing a bright wooden airship over an endless ocean of clouds, an original sky pirate crew fires harpoons at a flying stone whale whose back carries an ancient ruined city. No readable text or logo.',
      'On the deck of a sunny skyship, a young sky pirate captain gives a heroic speech while the ship\'s cat steers them straight into a cloud. No readable text or logo.',
      'Drifting in a sea of clouds at dusk, a lone airship has its sails furled and its deck lamps lit, and no crew moves aboard. No readable text or logo.',
    ] },
    'SP12-012': { briefs: [
      'Inside a cozy top-down pixel tavern at harvest festival, an original farmer dances with a giant friendly mushroom creature while the whole village cheers around the fire. No readable text or logo.',
      'In a pixel farm-town tavern, a farmer proudly presents a prize-winning pumpkin that is bigger than the bar itself. No readable text or logo.',
      "Closing up a cozy pixel tavern for the night, the innkeeper finds a pair of tiny muddy footprints leading from the fireplace to the cider barrel. No readable text or logo.",
    ] },
    'SP12-036': { briefs: [
      'Standing in a clean modular test chamber in first person, an original subject places a glowing gate on the ceiling as a giant robotic arm lowers a cube toward a laser. No readable text or logo.',
      'In a spotless white test chamber, a test subject solves the puzzle perfectly, and the testing machine plays a tiny, sarcastic celebration. No readable text or logo.',
      'In a clean white chamber, the exit door is open, but the observation window above is fogged from the inside by someone breathing. No readable text or logo.',
    ] },
    'SP12-037': { briefs: [
      'Leaping across a toy-like floating island of candy-colored blocks, an original tiny hero in a striped cat costume dives onto a giant spiked tortoise boss. No readable text or logo.',
      'In a bright toy-box platformer, a small hero triumphantly reaches the flagpole, and the flag is being held by a very proud caterpillar. No readable text or logo.',
      'On a bright toy-like island, the level is complete, the music has stopped, and one block in the sky still flashes, waiting to be hit. No readable text or logo.',
    ] },
    'SP12-051': { briefs: [
      "Playing her last card in a candlelit market duel, an original rogue watches the enemy's intent icon glow above a towering clockwork golem. No readable text or logo.",
      "Building a deck made entirely of one card, a mighty warrior faces a card battle armed only with a very small, very powerful potato. No readable text or logo.",
      'On an empty bazaar card table, the enemy\'s hand is laid face down, and one card is slowly turning itself over. No readable text or logo.',
    ] },
    'SP12-058': { briefs: [
      'Rotating a blocky pixel world in a single turn, an original tiny explorer in a fez reveals a hidden door as the whole echo cavern pivots around her in bright colors. No readable text or logo.',
      'In a rotating pixel puzzle world, a tiny explorer turns the whole level around and finds a small owl who has been standing there waiting for hours. No readable text or logo.',
      'In a blocky pixel cavern, rotating the world reveals a wall covered in the same symbol, and one of them is glowing. No readable text or logo.',
    ] },
    'SP12-072': { briefs: [
      'Airborne over a massive dune at dawn, an original off-road rally truck lands in a spray of sand as an ancient buried cathedral emerges from the desert ahead. No readable text or logo.',
      'In a brutal desert rally, a racer stops in the middle of the dunes to help a lost camel find its herd. No readable text or logo.',
      'In a vast desert at dusk, one set of tire tracks leads straight into a dune and disappears. No readable text or logo.',
    ] },
    'SP12-074': { briefs: [
      'Seated at a candlelit table in a dark cabin, an original player places a squirrel card as the looming dealer across the table reveals a hand of carved bone creatures. No readable text or logo.',
      'Across a candlelit deck table, the ominous dealer is very upset because the player has just played a card of a cat that refuses to fight. No readable text or logo.',
      'On a dark card table lit by one candle, the dealer\'s chair is empty, and the cards are still being dealt. No readable text or logo.',
    ] },
    'SP12-077': { briefs: [
      'Sneaking across a side-view industrial quarry, an original bug-eyed worker leads a line of fellow escapees past a sleeping guard creature as the smokestacks glow. No readable text or logo.',
      'In a cinematic side-view factory escape, a brave worker leads his friends to freedom, and they all politely wait in line at the exit. No readable text or logo.',
      'In a side-view quarry at night, every worker has escaped, and the conveyor belt keeps carrying empty crates into the dark. No readable text or logo.',
    ] },
    'SP12-080': { briefs: [
      'Locked onto a towering knight made of rusted bells in a ruined keep, an original lone warrior rolls under a crushing swing as fog pours through the broken gate. No readable text or logo.',
      'In a punishing ruined keep, a battered warrior finally reaches a bonfire and falls asleep before he can sit down. No readable text or logo.',
      'Behind a fog wall in a ruined keep, a boss arena is empty, and the only sound is a slow bell tolling from beneath the floor. No readable text or logo.',
    ] },
  },
  creates: [
    capture('Sliding-Block Temple Puzzle Capture', 'sliding block puzzle screenshot', 'sliding-block', {
      aesthetic: 'Sliding-block temple puzzle capture: an original top-down puzzle screenshot of heavy stone blocks pushed across a temple floor grid onto glowing pressure plates.',
      subject_treatment: `${keep}; show the subject pushing heavy stone blocks on a temple grid.`,
      color_and_tone: 'Sandstone ochre, moss green and glowing plate blue.',
      lighting_and_shadow: "Torchlight and plate glow, kept consistent across the whole image.",
      texture_and_material: "Carved stone, dust and grid lines, kept consistent across the whole image.",
      camera_and_composition: "Top-down view of the puzzle floor, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with patient cleverness, kept consistent across the whole image.",
      rendering_and_quality: "Clean readable puzzle layout, kept consistent across the whole image.",
      key_features: 'stone blocks; pressure plates; temple grid; top-down',
    }, [], [
      'Pushing the last stone block onto a glowing plate, an original explorer watches the temple floor split open to reveal a sleeping golem beneath. No readable text or logo.',
      "Having pushed every heavy stone perfectly into place on the temple floor, an explorer realizes he has trapped himself in the corner. No readable text or logo.",
      "Settled on a temple puzzle floor, the stone blocks have grown a thin layer of moss overnight, and the moss is shaped like handprints. No readable text or logo.",
    ]),
    capture('Hand-Drawn Adventure Room Capture', 'point-and-click hand-drawn room screenshot', 'adventure-room', {
      aesthetic: 'Hand-drawn adventure room capture: an original point-and-click adventure screenshot of a lovingly drawn cluttered room full of curious objects and a small hero.',
      subject_treatment: `${keep}; place the subject in a hand-drawn room full of curious clickable objects.`,
      color_and_tone: "Warm storybook colors with soft shading, kept consistent across the whole image.",
      lighting_and_shadow: "Soft painted light from a window, kept consistent across the whole image.",
      texture_and_material: "Hand-drawn lines, painted fills and clutter, kept consistent across the whole image.",
      camera_and_composition: "Side-on stage view of a single room, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with witty curiosity, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no cursor or text, kept consistent across the whole image.",
      key_features: 'hand-drawn room; curious objects; small hero; stage view',
    }, ['cursor or verbs'], [
      'Standing in a hand-drawn wizard\'s workshop full of bubbling flasks, an original young apprentice holds a rubber chicken with a pulley as a stuffed crocodile winks from the ceiling. No readable text or logo.',
      'In a cluttered hand-drawn room, a clever hero tries to use a banana on every object in sight, including the confused cat. No readable text or logo.',
      "Tucked into a lovingly drawn attic, one drawer in a tall cabinet is slightly open, and a thin line of light spills out of it. No readable text or logo.",
    ]),
    capture('Tilt Maze Rolling-Ball Capture', 'tilting maze ball game screenshot', 'tilt-maze', {
      aesthetic: 'Tilt maze rolling-ball capture: an original screenshot of a glossy ball rolling through a tilting maze board suspended in space, rails, holes and ramps.',
      subject_treatment: `${keep}; show the subject as a ball or rider inside a tilting maze board.`,
      color_and_tone: "Glossy candy colors on a dark sky, kept consistent across the whole image.",
      lighting_and_shadow: "Bright reflections on the ball and rails, kept consistent across the whole image.",
      texture_and_material: 'Glossy ball, wooden or plastic board and rails.',
      camera_and_composition: "Angled view of the tilted board, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with delicate balance, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no timer text, kept consistent across the whole image.",
      key_features: 'tilting maze; glossy ball; floating board; holes and ramps',
    }, [], [
      'Rolling across a tilting maze suspended over a starry void, an original glass ball containing a tiny astronaut races toward the goal as the board cracks behind it. No readable text or logo.',
      'On a floating tilt maze, a ball has avoided every hole in the board and then stopped perfectly on the edge of the last one. No readable text or logo.',
      "Suspended in space, a maze board holds a ball that is rolling uphill toward a hole that was not there before. No readable text or logo.",
    ]),
    capture('Clockwork Tower Puzzle Capture', 'gear puzzle tower screenshot', 'clockwork-puzzle', {
      aesthetic: 'Clockwork tower puzzle capture: an original screenshot inside a giant clock tower where the player repositions gears and pendulums to open the way up.',
      subject_treatment: `${keep}; place the subject among giant gears and pendulums inside a clock tower.`,
      color_and_tone: "Brass, copper and warm dusty light, kept consistent across the whole image.",
      lighting_and_shadow: "Light through a clock face window, kept consistent across the whole image.",
      texture_and_material: "Gears, chains, wooden beams and dust, kept consistent across the whole image.",
      camera_and_composition: "Vertical view up the tower interior, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with ticking ingenuity, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no readable numerals, kept consistent across the whole image.",
      key_features: 'giant gears; pendulums; clock face window; vertical tower',
    }, ['readable clock numerals'], [
      'Leaping between turning gears inside a giant clock tower, an original apprentice slots a missing cog into place as the huge pendulum starts to swing again. No readable text or logo.',
      'Inside a massive clock tower, a hero finally fixes the mechanism, and every gear starts turning backward. No readable text or logo.',
      "Ticking inside a quiet clock tower, the gears have started to turn in a rhythm like a heartbeat that speeds up when the player moves. No readable text or logo.",
    ]),
    capture('Rotating Puzzle-Box Diorama Capture', 'isometric puzzle-box diorama screenshot', 'puzzle-box', {
      aesthetic: 'Rotating puzzle-box diorama capture: an original screenshot of a small isometric diorama world on a rotating box, secret panels, tiny rooms and hidden mechanisms.',
      subject_treatment: `${keep}; show the subject tiny inside a rotating diorama puzzle box.`,
      color_and_tone: "Warm wood tones with soft pastel accents, kept consistent across the whole image.",
      lighting_and_shadow: "Soft studio light on a floating diorama, kept consistent across the whole image.",
      texture_and_material: "Wood, brass hinges and miniature details, kept consistent across the whole image.",
      camera_and_composition: "Isometric view of a floating box diorama, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with tactile secrecy, kept consistent across the whole image.",
      rendering_and_quality: "Clean miniature capture with no UI, kept consistent across the whole image.",
      key_features: 'puzzle box; isometric diorama; secret panels; tiny rooms',
    }, [], [
      "Turning a floating wooden box on its side, an original tiny explorer reveals a hidden room inside where a miniature dragon guards a key the size of her arm. No readable text or logo.",
      'On a floating puzzle box diorama, a tiny character solves one side and immediately gets stuck on the underside. No readable text or logo.',
      "Resting on a table, an intricate puzzle box has been solved, and from inside it comes the faint sound of another box being opened. No readable text or logo.",
    ]),
    capture('First-Person Escape Room Capture', 'escape room puzzle game screenshot', 'escape-room', {
      aesthetic: 'First-person escape room capture: an original first-person screenshot of a locked room full of clues, combination locks, hidden compartments and ticking dread.',
      subject_treatment: `${keep}; show the subject in a locked puzzle room full of clues and locks.`,
      color_and_tone: "Warm lamp light with dark corners, kept consistent across the whole image.",
      lighting_and_shadow: "Desk lamp pools and shadowed corners, kept consistent across the whole image.",
      texture_and_material: "Locks, wooden drawers, papers without text, kept consistent across the whole image.",
      camera_and_composition: "First-person over a desk of clues, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with ticking urgency, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no readable clues, kept consistent across the whole image.",
      key_features: 'locked room; clues; combination locks; first-person',
    }, ['readable clue text'], [
      'Leaning over a desk of locked boxes in first person, an original investigator opens a hidden drawer and finds a mechanical bird that begins to sing the combination. No readable text or logo.',
      "Having solved every complex puzzle in a locked room, the player realizes the door was unlocked all along. No readable text or logo.",
      'In a locked puzzle room, the door slowly opens by itself, and the hallway beyond is another identical locked room. No readable text or logo.',
    ]),
    capture('Minecart Chase Setpiece Capture', 'minecart ride chase screenshot', 'minecart-chase', {
      aesthetic: 'Minecart chase setpiece capture: an original screenshot of a runaway minecart racing through a mine on rickety rails, sparks, drops and pursuing danger.',
      subject_treatment: `${keep}; show the subject in a runaway minecart on rickety mine rails.`,
      color_and_tone: "Dark rock, lantern amber and crystal glints, kept consistent across the whole image.",
      lighting_and_shadow: "Sparks from the rails and lantern light, kept consistent across the whole image.",
      texture_and_material: "Rickety wood, rusted rails and rock, kept consistent across the whole image.",
      camera_and_composition: "Low chase angle behind the cart, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with breakneck adventure, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no HUD, kept consistent across the whole image.",
      key_features: 'runaway minecart; rickety rails; sparks; mine tunnels',
    }, [], [
      "Ducking under a beam on rickety mine rails, an original explorer races her cart as a giant rock worm bursts through the tunnel wall right behind it. No readable text or logo.",
      'On a runaway minecart ride, the explorers are screaming while the old miner beside them calmly eats his sandwich. No readable text or logo.',
      'In a dark mine, an empty minecart rolls out of the tunnel, still carrying a lit lantern. No readable text or logo.',
    ]),
    capture('Collapsing Bridge Setpiece Capture', 'bridge collapse action screenshot', 'bridge-collapse', {
      aesthetic: 'Collapsing bridge setpiece capture: an original cinematic screenshot of a hero sprinting across a bridge crumbling into a chasm, planks falling and dust rising.',
      subject_treatment: `${keep}; show the subject racing across a bridge as it collapses behind them.`,
      color_and_tone: "Dusty ochres, deep chasm shadows and sky, kept consistent across the whole image.",
      lighting_and_shadow: "Dramatic light with falling debris shadows, kept consistent across the whole image.",
      texture_and_material: "Splintering wood, rope and falling stone, kept consistent across the whole image.",
      camera_and_composition: "Low angle facing the running hero, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with heart-pounding urgency, kept consistent across the whole image.",
      rendering_and_quality: "Clean cinematic capture with no HUD, kept consistent across the whole image.",
      key_features: 'collapsing bridge; chasm; falling planks; sprinting hero',
    }, [], [
      'Sprinting across a rope bridge collapsing into a jungle chasm, an original explorer leaps for the far ledge as a giant condor swoops through the falling planks. No readable text or logo.',
      'Racing across a crumbling bridge, a hero reaches safety and then remembers he left his hat on the other side. No readable text or logo.',
      'On the far side of a chasm, a rope bridge hangs broken, and fresh footprints lead across its missing middle. No readable text or logo.',
    ]),
    capture('Treasure Island Dig Capture', 'pirate treasure digging screenshot', 'treasure-dig', {
      aesthetic: 'Treasure island dig capture: an original third-person screenshot of digging on a tropical island at the spot marked on a map, palm trees, shovels and a glinting chest.',
      subject_treatment: `${keep}; show the subject digging for treasure on a tropical island.`,
      color_and_tone: "Turquoise sea, white sand and palm green, kept consistent across the whole image.",
      lighting_and_shadow: "Bright tropical sun, kept consistent across the whole image.",
      texture_and_material: "Sand, wood, old maps and metal chests, kept consistent across the whole image.",
      camera_and_composition: "Third-person view over the dig site, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with adventurous greed, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no readable map labels, kept consistent across the whole image.",
      key_features: 'tropical island; digging; treasure chest; palm trees',
    }, ['readable map labels'], [
      'Digging at the spot marked on an old map, an original pirate crew uncovers a chest that is chained shut and quietly breathing. No readable text or logo.',
      'On a tropical island, a pirate digs for hours and finds a small note-less box containing another, smaller map. No readable text or logo.',
      'On a quiet island beach, a freshly dug hole is empty, and footprints lead from it into the sea. No readable text or logo.',
    ]),
    capture('Shadow-Casting Puzzle Capture', 'light and shadow puzzle screenshot', 'shadow-puzzle', {
      aesthetic: 'Shadow-casting puzzle capture: an original puzzle screenshot where objects are rotated in front of a lamp until their combined shadow forms a hidden shape on the wall.',
      subject_treatment: `${keep}; arrange the subject so its shadow forms a surprising shape on a wall.`,
      color_and_tone: 'Dark room, warm lamp light and crisp shadows.',
      lighting_and_shadow: "Single lamp casting a sharp shadow, kept consistent across the whole image.",
      texture_and_material: "Found objects, plaster wall and lamp glass, kept consistent across the whole image.",
      camera_and_composition: "Objects in foreground, shadow on the wall, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with quiet revelation, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with a clear shadow shape, kept consistent across the whole image.",
      key_features: 'single lamp; hidden shadow shape; rotated objects; wall',
    }, [], [
      'Rotating a pile of broken furniture in front of a lamp, an original solver reveals the shadow of a dragon on the wall that is slowly opening its mouth. No readable text or logo.',
      'After carefully arranging scrap objects in front of a lamp, a player finally forms the shadow of a majestic stag, but the cat walks in and ruins it. No readable text or logo.',
      'In a dark room, a lamp casts the shadow of a pile of junk onto the wall, and the shadow is shaped like a person standing behind it. No readable text or logo.',
    ]),
  ],
};

export default spec;
