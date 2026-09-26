import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Video game originals vault, wilderness hunts and harsh frontiers: in-game screenshot looks. The
// ten originals get original card briefs; ten new descriptor-named capture looks add bow-hunt
// stalking, blizzard treks, safari photo expeditions, dog-sled runs, canyon horseback frontiers,
// diving-bell descents, volcanic crater expeditions, swamp canoe trackers, crafting camps and
// giant beast riding.
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
  category: '6. Wilderness Hunts & Harsh Frontiers',
  updates: {
    'SP12-002': { briefs: [
      'Drawing a bow from a giant glowing branch in first person, an original hunter aims at a six-legged beast grazing in a canopy of floating jellyfish-like plants. No readable text or logo.',
      'In a vast alien jungle seen in first person, a skilled hunter carefully sneaks up on her prey, which turns out to be a small, very curious frog with four eyes. No readable text or logo.',
      'From first person high in an alien canopy at night, every glowing plant has gone dark in a perfect line leading toward the hunter. No readable text or logo.',
    ] },
    'SP12-010': { briefs: [
      'Rolling beneath a molten hammer in a volcanic forge, an original ashen knight dodges a towering blacksmith demon as sparks rain from the anvil the size of a house. No readable text or logo.',
      'In a smouldering forge, a hardened warrior finally reaches the legendary blacksmith, who only wants to know if he wiped his boots. No readable text or logo.',
      'Deep in a volcanic forge, a single bonfire burns beside an anvil, and the embers rising from it drift downward. No readable text or logo.',
    ] },
    'SP12-022': { briefs: [
      'Trudging across a snowfield toward a lone cabin in first person, an original survivor sees a wolf pack\'s eyes glowing at the tree line as the blizzard closes in. No readable text or logo.',
      'Warming up in a sparse winter cabin, a survivor carefully cooks her last can of beans while a crow watches from the window with great interest. No readable text or logo.',
      'Outside a snowbound cabin at night, fresh footprints lead up to the door from the outside, and the door is already bolted from the inside. No readable text or logo.',
    ] },
    'SP12-027': { briefs: [
      'Descending a glowing basalt cavern on ropes in first person, an original crew of dwarven miners drills into a crystal vein as a giant burrowing bug cracks the wall beside them. No readable text or logo.',
      'In a co-op cave extraction, the whole team has lost the mine cart while one miner is very proudly holding a single tiny gem. No readable text or logo.',
      'Deep in a dark mineral cave, a mining helmet lamp lies on the ground, still switched on and pointing at an unexplored tunnel. No readable text or logo.',
    ] },
    'SP12-029': { briefs: [
      'Gliding over an alien coral reef with a hand scanner, an original diver watches a leviathan the length of a ship pass silently beneath her small submarine. No readable text or logo.',
      'Exploring a bright alien reef, a diver discovers a fish so dim it keeps swimming into her mask and apologizing. No readable text or logo.',
      'In a first-person dive at dusk, the reef lights dim one by one as something far below turns toward the surface. No readable text or logo.',
    ] },
    'SP12-034': { briefs: [
      'Lying on a canyon ridge with a scoped rifle, an original marksman tracks a convoy crossing a bridge as heat haze and wind ripple the long view. No readable text or logo.',
      'Hidden in perfect camouflage on a canyon ridge, a sniper is found immediately by a friendly mountain goat that wants to share his lunch. No readable text or logo.',
      'Through a scope across a canyon, a distant figure on the opposite ridge is looking back through a scope of its own. No readable text or logo.',
    ] },
    'SP12-040': { briefs: [
      'Leaping onto the back of a thunder-crested beast on a stormy plain, an original hunter drives a great sword into its armored plates as lightning splits the sky. No readable text or logo.',
      'On a wide hunting plain, a fearsome monster hunter spends the whole morning trying to catch a small rabbit-like creature that keeps outrunning him. No readable text or logo.',
      'On a quiet plain after a storm, a hunter\'s camp is intact but the huge tracks around it circle the tents and then vanish. No readable text or logo.',
    ] },
    'SP12-041': { briefs: [
      'Climbing a painterly fire lookout at dusk, an original ranger watches a forest fire glow across the ridges as a strange light blinks back from a distant tower. No readable text or logo.',
      'In a warm painterly forest, a lonely lookout ranger has trained a raccoon to deliver notes to the next tower. No readable text or logo.',
      "Watching from a painterly lookout at night, the ranger sees a distant tower answer her lamp signals, although that tower was abandoned years ago. No readable text or logo.",
    ] },
    'SP12-067': { briefs: [
      'Advancing across a bronze marsh at dawn, an original army of thousands in banners and lacquered armor wades toward a fortress on stilts as war elephants trumpet in the reeds. No readable text or logo.',
      'In a massive strategy battle, a whole army waits for the command to charge while the general is still deciding which banner looks best. No readable text or logo.',
      'Over a misty marsh after a battle, a single banner still flies from a fortress tower, and no one is left to hold it. No readable text or logo.',
    ] },
    'SP12-073': { briefs: [
      'Clinging to the fur of a colossus as tall as a mountain, an original tiny rider climbs toward a glowing mark on its head as it strides through an overgrown orchard. No readable text or logo.',
      'After a long heroic climb up a colossal creature, a tiny rider discovers the giant has fallen peacefully asleep in the orchard. No readable text or logo.',
      'In a vast empty orchard, a colossus lies still like a hill, and the trees growing on its back are in full bloom. No readable text or logo.',
    ] },
  },
  creates: [
    capture('Bow Hunt Stalking Capture', 'first-person bow hunting screenshot', 'bow-stalk', {
      aesthetic: 'Bow hunt stalking capture: an original first-person screenshot of drawing a bow in dense forest, arrow nocked, prey partially hidden in ferns and dappled light.',
      subject_treatment: `${keep}; show the subject from the hunter's first-person view with a drawn bow.`,
      color_and_tone: 'Forest greens, bark browns and golden light shafts.',
      lighting_and_shadow: "Dappled light through the canopy, kept consistent across the whole image.",
      texture_and_material: "Bowstring, fletching, ferns and moss, kept consistent across the whole image.",
      camera_and_composition: "First-person with bow in foreground, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with silent predatory patience.',
      rendering_and_quality: "Clean capture without gore or HUD, kept consistent across the whole image.",
      key_features: 'drawn bow; first-person; dense forest; hidden prey',
    }, [], [
      'Drawing a bow through dense ferns in first person, an original hunter aims at a white stag whose antlers hold a crown of glowing flowers. No readable text or logo.',
      'From first person with a drawn bow, a hunter finally has a perfect shot at a boar, which is standing beside a broken wooden fence and looking deeply offended. No readable text or logo.',
      'From first person in dense forest, the prey the hunter has been stalking is now standing directly behind him, reflected in the bowstring\'s dew. No readable text or logo.',
    ]),
    capture('Blizzard Trek Survival Capture', 'snowstorm survival trek screenshot', 'blizzard-trek', {
      aesthetic: 'Blizzard trek survival capture: an original third-person screenshot of a lone traveler bent against a howling blizzard, rope trailing, lantern glow in white-out snow.',
      subject_treatment: `${keep}; show the subject pushing through a blizzard with limited visibility.`,
      color_and_tone: "White-grey snow with warm lantern orange, kept consistent across the whole image.",
      lighting_and_shadow: "Diffuse white-out and a small warm glow, kept consistent across the whole image.",
      texture_and_material: "Swirling snow, frosted fabric and ice, kept consistent across the whole image.",
      camera_and_composition: "Third-person behind the traveler, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with desperate endurance, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no HUD, kept consistent across the whole image.",
      key_features: 'blizzard; white-out; lantern; lone traveler',
    }, [], [
      'Bent against a howling blizzard with a lantern in hand, an original traveler pulls a sled across a frozen lake as a shadow as big as a ship passes beneath the ice. No readable text or logo.',
      'Struggling through a blizzard for hours, a traveler finally reaches shelter and discovers it is a very small doghouse. No readable text or logo.',
      'In a white-out blizzard, the rope tied to the traveler\'s belt stretches back into the snow and is being gently tugged. No readable text or logo.',
    ]),
    capture('Safari Photo Expedition Capture', 'wildlife photography game screenshot', 'safari-photo', {
      aesthetic: 'Safari photo expedition capture: an original wildlife photography game screenshot through a camera viewfinder of strange creatures on a golden savanna.',
      subject_treatment: `${keep}; frame the subject through a camera viewfinder on a wildlife expedition.`,
      color_and_tone: "Golden grass, acacia greens and blue sky, kept consistent across the whole image.",
      lighting_and_shadow: "Warm late-afternoon sun, kept consistent across the whole image.",
      texture_and_material: "Grass, dust, animal hides and viewfinder frame, kept consistent across the whole image.",
      camera_and_composition: "Viewfinder crop lines around the subject, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with patient discovery, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no readable settings, kept consistent across the whole image.",
      key_features: 'viewfinder frame; savanna; strange creatures; golden light',
    }, ['readable camera settings'], [
      'Through a camera viewfinder on a golden savanna, an original photographer frames a herd of long-necked creatures with glowing spots crossing a river at sunset. No readable text or logo.',
      'Through a wildlife viewfinder, the rarest creature on the savanna has finally appeared, and it is posing dramatically for the camera. No readable text or logo.',
      'Through a viewfinder at dusk, the tall grass is perfectly still, except for a line of it that is moving toward the jeep. No readable text or logo.',
    ]),
    capture('Dog-Sled Frontier Run Capture', 'sled dog race screenshot', 'dog-sled', {
      aesthetic: 'Dog-sled frontier run capture: an original third-person screenshot of a sled team racing across a frozen frontier, spray of snow, aurora and pine forest.',
      subject_treatment: `${keep}; show the subject racing a dog sled across frozen wilderness.`,
      color_and_tone: 'White snow, deep blue night and green aurora.',
      lighting_and_shadow: "Aurora glow and sled lantern, kept consistent across the whole image.",
      texture_and_material: "Snow spray, fur, wood runners and frost, kept consistent across the whole image.",
      camera_and_composition: "Low chase angle behind the team, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with wild frontier momentum.',
      rendering_and_quality: "Clean capture with no HUD, kept consistent across the whole image.",
      key_features: 'sled dogs; frozen frontier; aurora; snow spray',
    }, [], [
      'Racing under a green aurora, an original musher drives a team of huskies across a frozen river as a giant white owl swoops low beside the sled. No readable text or logo.',
      'On a frozen trail, a sled team is running at full speed while the musher has fallen off and is being dragged behind, cheerfully. No readable text or logo.',
      'Under the aurora, a sled team stops on the ice and every dog turns to stare at the same empty spot in the trees. No readable text or logo.',
    ]),
    capture('Canyon Horseback Frontier Capture', 'western frontier riding screenshot', 'canyon-horse', {
      aesthetic: 'Canyon horseback frontier capture: an original third-person screenshot of a rider on horseback crossing red canyon country, vast mesas and dust at golden hour.',
      subject_treatment: `${keep}; show the subject on horseback crossing a vast red canyon landscape.`,
      color_and_tone: "Red rock, sage green and golden sky, kept consistent across the whole image.",
      lighting_and_shadow: "Low golden sun and long shadows, kept consistent across the whole image.",
      texture_and_material: "Red rock, dust, leather tack and scrub, kept consistent across the whole image.",
      camera_and_composition: "Wide cinematic view with rider small, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with lonesome frontier grandeur.',
      rendering_and_quality: "Clean capture with no HUD, kept consistent across the whole image.",
      key_features: 'horseback rider; red canyons; mesas; golden hour',
    }, [], [
      'Riding along a canyon rim at golden hour, an original frontier scout spots a train of covered wagons being followed by a dust devil shaped like a giant rider. No readable text or logo.',
      "Stopping to fill his canteen among red rock mesas, a rugged rider watches his horse drink the entire river first. No readable text or logo.",
      'On a vast mesa at sunset, a saddled horse stands alone, and its rider\'s long shadow stretches across the rock without anyone to cast it. No readable text or logo.',
    ]),
    capture('Diving Bell Descent Capture', 'deep-sea diving bell screenshot', 'diving-bell', {
      aesthetic: 'Diving bell descent capture: an original screenshot of a brass diving bell lowered into black ocean depths, its lamps revealing strange creatures and ruins.',
      subject_treatment: `${keep}; show the subject inside or around a brass diving bell in the deep sea.`,
      color_and_tone: "Black depths, brass gold and bioluminescent blue, kept consistent across the whole image.",
      lighting_and_shadow: "Bell lamps cutting into darkness, kept consistent across the whole image.",
      texture_and_material: "Riveted brass, round portholes and particles, kept consistent across the whole image.",
      camera_and_composition: "Bell in the center with darkness around, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with deep uneasy wonder.',
      rendering_and_quality: "Clean capture with no HUD, kept consistent across the whole image.",
      key_features: 'brass diving bell; deep sea; lamp beams; strange creatures',
    }, [], [
      'Lowered into the black depths, an original brass diving bell lights up a sunken cathedral where giant pale eels curl around the bell tower. No readable text or logo.',
      'Deep in the ocean, a diving bell\'s lamp reveals a fearsome anglerfish that is using its glowing lure to read a book. No readable text or logo.',
      'Through the porthole of a diving bell, a lamp beam shows the ocean floor, and a line of footprints leads away across the sand. No readable text or logo.',
    ]),
    capture('Volcanic Crater Expedition Capture', 'volcano exploration screenshot', 'crater-expedition', {
      aesthetic: 'Volcanic crater expedition capture: an original third-person screenshot of explorers descending into an active crater, lava lakes, ash clouds and heat shimmer.',
      subject_treatment: `${keep}; show the subject on an expedition into an active volcanic crater.`,
      color_and_tone: 'Black rock, glowing orange lava and ash grey.',
      lighting_and_shadow: "Lava glow from below and ash haze, kept consistent across the whole image.",
      texture_and_material: "Cooled lava crust, sulfur and heat shimmer, kept consistent across the whole image.",
      camera_and_composition: "Wide view down into the crater, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with scorching peril, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no HUD, kept consistent across the whole image.",
      key_features: 'volcanic crater; lava lake; ash clouds; explorers',
    }, [], [
      'Descending into an active crater on a rope bridge, an original expedition sees a salamander the size of a whale rise from the lava lake below. No readable text or logo.',
      'At the edge of a lava lake, a daring explorer tries to roast marshmallows on a very long stick. No readable text or logo.',
      'In a quiet crater, the lava has cooled into black crust, except for one glowing crack in the shape of an open eye. No readable text or logo.',
    ]),
    capture('Swamp Canoe Tracker Capture', 'swamp canoe exploration screenshot', 'swamp-canoe', {
      aesthetic: 'Swamp canoe tracker capture: an original first-person screenshot paddling a canoe through a misty swamp, cypress knees, fireflies and ripples in dark water.',
      subject_treatment: `${keep}; show the subject from a canoe gliding through a misty swamp.`,
      color_and_tone: "Murky greens, mist grey and firefly gold, kept consistent across the whole image.",
      lighting_and_shadow: "Soft dusk light through mist, kept consistent across the whole image.",
      texture_and_material: 'Still water, moss, cypress bark and paddle wood.',
      camera_and_composition: "First-person with the canoe bow in view, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with quiet uneasy tracking.',
      rendering_and_quality: "Clean capture with no HUD, kept consistent across the whole image.",
      key_features: 'canoe bow; misty swamp; fireflies; dark water',
    }, [], [
      'Paddling a canoe through a misty swamp in first person, an original tracker follows a trail of floating lanterns toward a witch\'s house on chicken-leg stilts. No readable text or logo.',
      'Gliding through a peaceful swamp, a canoeist realizes the log he has been resting his paddle on has blinked. No readable text or logo.',
      'From a canoe in a still swamp, the ripples spread out from the boat, and a second set of ripples is coming toward it from the mist. No readable text or logo.',
    ]),
    capture('Crafting Camp Base Capture', 'survival crafting base screenshot', 'crafting-camp', {
      aesthetic: 'Crafting camp base capture: an original survival-crafting screenshot of a handmade wilderness base, workbenches, campfire, drying racks and tools around a tent.',
      subject_treatment: `${keep}; place the subject in a handmade survival base full of crafted tools.`,
      color_and_tone: 'Warm fire orange, wood browns and forest green.',
      lighting_and_shadow: "Campfire glow at dusk, kept consistent across the whole image.",
      texture_and_material: 'Rope lashings, hides, rough wood and stone tools.',
      camera_and_composition: "Third-person view over the camp, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with scrappy self-reliance, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no inventory UI, kept consistent across the whole image.",
      key_features: 'crafted base; workbenches; campfire; drying racks',
    }, ['inventory UI'], [
      'Building a wooden palisade around a crafting camp at dusk, an original survivor hammers the last stake as a herd of giant armored beetles marches past the fire. No readable text or logo.',
      'In a survival camp, a castaway has crafted an elaborate throne of logs and sits on it proudly while it is raining. No readable text or logo.',
      'Around a campfire at night, every crafted tool has been moved from the workbench and laid in a neat circle on the ground. No readable text or logo.',
    ]),
    capture('Giant Beast Riding Capture', 'riding a huge creature screenshot', 'beast-riding', {
      aesthetic: 'Giant beast riding capture: an original third-person screenshot of a rider on the back of an enormous tame creature, saddle platforms and a vast landscape below.',
      subject_treatment: `${keep}; show the subject riding on the back of an enormous creature.`,
      color_and_tone: "Earthy creature tones and wide sky, kept consistent across the whole image.",
      lighting_and_shadow: "Open daylight with creature shadow, kept consistent across the whole image.",
      texture_and_material: 'Hide, fur or scales, saddle ropes and platforms.',
      camera_and_composition: 'Over-the-shoulder view from the saddle across the vast creature back.',
      atmosphere_and_mood: "Keep the requested mood with majestic companionship, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no HUD, kept consistent across the whole image.",
      key_features: 'enormous mount; saddle platform; vast landscape; rider',
    }, [], [
      'Riding a saddle platform on the back of a walking mountain-sized tortoise, an original caravan leader looks out over a desert as smaller caravans follow in its shadow. No readable text or logo.',
      'On the back of an enormous tame beast, a rider tries to steer while the creature is determined to stop and eat every tree. No readable text or logo.',
      "Crossing a plain at night on a huge tame creature, the rider notices that the beast's eye, looking back at her, is wide open and unblinking. No readable text or logo.",
    ]),
  ],
};

export default spec;
