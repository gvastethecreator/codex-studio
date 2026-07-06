import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import * as yaml from 'js-yaml';

import type { StylePresetManifest } from '../../components/recipes/styles/manifestTypes';

const packId = 'pack_12';
const presetDir = path.join(
  process.cwd(),
  'components',
  'recipes',
  'styles',
  'manifests',
  'presets',
  packId,
);

interface GameCategoryLanguage {
  frame: string;
  subjectLogic: string;
  palette: string;
  light: string;
  material: string;
  composition: string;
  mood: string;
  finish: string;
  avoidRules: string[];
}

interface TokenCue {
  palette?: string;
  light?: string;
  material?: string;
  composition?: string;
  mood?: string;
  mechanic?: string;
}

const categoryLanguage: Record<string, GameCategoryLanguage> = {
  'neon-urban-and-night-ops': {
    frame:
      'urban night-action readability, vertical route layering, wet asphalt glow, and covert pressure',
    subjectLogic:
      'express covert movement, chase pressure, street-level conflict, evacuation tension, and rooftop-route clarity without requiring one urban scene',
    palette:
      'black glass, wet concrete, saturated signage, emergency red, cyan edge light, and toxic green accents',
    light:
      'practical neon, police strobes, backlit rain, window grids, traffic glow, and hard rim highlights',
    material:
      'rain-slick pavement, carbon panels, patched jackets, utility metal, glowing signage substrate, and urban grime',
    composition:
      'stacked rooftops, underpasses, side routes, cover layers, vanishing street lines, and mission-node depth',
    mood: 'dangerous, nocturnal, stylish, humid, kinetic, and conspiratorial',
    finish:
      'game-cinematic clarity with readable silhouettes, deep contrast, controlled bloom, and no menu or HUD dependence',
    avoidRules: ['generic cyberpunk alley', 'readable signage text'],
  },
  'arcane-temples-and-mythic-realms': {
    frame:
      'ritual architecture, mythic scale, ceremonial lanes, relic energy, and sacred spatial order',
    subjectLogic:
      'express ritual hierarchy, artifact weight, ceremonial route pressure, and mythic trial readability without forcing a temple scene',
    palette:
      'mineral gold, moonlit blue, jade, orchid, volcanic green, marble white, and prismatic ritual accents',
    light:
      'altar glow, rune bounce, moon shafts, crystal caustics, brazier halos, and sacred backlight',
    material:
      'carved stone, polished relic metal, paper talismans, wet moss, lacquer, crystal, incense haze, and worn ritual cloth',
    composition:
      'processional paths, altar anchors, radial chambers, duel lanes, threshold frames, and sacred symmetry broken by action',
    mood: 'reverent, mysterious, dangerous, mythic, ceremonial, and charged with old power',
    finish:
      'ornate but legible game-art finish with disciplined focal hierarchy and no generic fantasy postcard staging',
    avoidRules: ['generic fantasy postcard', 'soft pretty temple blur'],
  },
  'sci-fi-frontiers-and-mech-zones': {
    frame:
      'frontier science fiction, hard-surface machinery, exposed infrastructure, hazard alarms, and operational scale',
    subjectLogic:
      'express operational scale, machine relationships, frontier labor, breach pressure, and engineered movement without requiring a mech battle',
    palette:
      'dust ochre, oxide orange, utility white, alarm red, teal monitors, gunmetal, and industrial blue',
    light:
      'bay floodlights, warning strobes, reactor glow, dust haze, underwater beams, and cold lab panels',
    material:
      'scratched armor, hydraulic joints, carbon shells, bolted plates, polymer glass, cables, and mineral dust',
    composition:
      'large-small scale contrast, hangar lanes, convoy spacing, breach corridors, dock silhouettes, and readable machinery clusters',
    mood: 'tense, industrial, exploratory, militarized, frontier-worn, and technically precise',
    finish:
      'clean hard-surface readability with believable engineering, atmospheric depth, and no asset-render isolation',
    avoidRules: ['asset-render isolation', 'generic sci-fi corridor'],
  },
  'sieges-warfronts-and-last-stands': {
    frame:
      'tactical warfront staging, defensive geometry, damage history, co-op readability, and last-stand pressure',
    subjectLogic:
      'express defensive pressure, breach geometry, faction clarity, barricade rhythm, and survival stakes without forcing one battle scene',
    palette:
      'smoke grey, worn iron, battlefield blue, ember orange, frost white, and siege-banner accents',
    light:
      'searchlights, muzzle flashes, burning horizons, storm breaks, aurora glow, and smoke-filtered sun',
    material:
      'shattered masonry, scorched metal, splintered wood, wet mud, broken glass, ice crust, banners, and supply rigging',
    composition:
      'defense lines, capture points, bridge chokeholds, ruined courtyards, layered fronts, and clear ally-enemy spacing',
    mood: 'urgent, battered, heroic, grim, tactical, and physically costly',
    finish:
      'battle-readable production art with clear factions, clean depth cues, and no chaotic poster overcrowding',
    avoidRules: ['chaotic poster overcrowding', 'unreadable battle smoke'],
  },
  'speed-sport-and-competitive-arenas': {
    frame:
      'competitive arena energy, lane logic, player-role clarity, speed trails, and readable match flow',
    subjectLogic:
      'express competition roles, lane tension, speed control, ranked focus, and contest readability without forcing a sports broadcast',
    palette:
      'team-color contrast, hot magenta, cobalt, obsidian, sand gold, lava red, and prismatic highlights',
    light:
      'track strips, arena floods, energy gates, holographic trails, trophy glints, and motion-lit edges',
    material:
      'polished arena floors, volcanic glass, carbon helmets, crystal barriers, dust tracks, neon rails, and worn competition gear',
    composition:
      'race lanes, duel circles, draft grids, finish-line diagonals, champion focal points, and high-speed parallax',
    mood: 'competitive, fast, theatrical, sharp, high-stakes, and crowd-charged',
    finish:
      'high-motion game-art finish with crisp lane readability, controlled streaks, and no fake broadcast overlay',
    avoidRules: ['fake broadcast overlay', 'sports-logo clutter'],
  },
  'wilderness-hunts-and-harsh-frontiers': {
    frame:
      'hostile biome traversal, survival pressure, creature scale, weathered camps, and readable hunt routes',
    subjectLogic:
      'express survival pressure, terrain hazards, creature scale, extraction timing, and frontier resource logic without forcing a landscape postcard',
    palette:
      'earth ochre, moss green, frost blue, volcanic black, coral color, bronze mud, and storm-violet accents',
    light:
      'bioluminescence, campfire pools, blizzard glare, forge heat, underwater shafts, and storm flashes',
    material:
      'wet foliage, mineral crust, fur, coral, packed snow, mud, rope, leather, patched tents, and chipped field gear',
    composition:
      'tracking paths, campsite anchors, predator scale reveals, terrain chokepoints, resource clusters, and horizon danger',
    mood: 'feral, precarious, exploratory, weather-beaten, predatory, and resource-starved',
    finish:
      'survival-game art with clear traversal cues, tactile terrain, and no generic scenic wallpaper',
    avoidRules: ['generic scenic wallpaper', 'friendly nature postcard'],
  },
  'heists-horror-and-underworld-runs': {
    frame:
      'illicit route planning, horror escalation, underworld thresholds, trap timing, and stealth readability',
    subjectLogic:
      'express stealth timing, illicit access, trap pressure, corruption, pursuit routes, and horror reveal logic without requiring one heist shot',
    palette:
      'inky black, sick green, opera red, copper shadow, moonlit blue, rust, and carnival poison color',
    light:
      'knife-edge spotlights, emergency bulbs, sick fluorescents, moon slashes, lantern pools, and signal static',
    material:
      'velvet curtains, rusted rails, wet tile, bone props, thorned stone, pirate rigging, train metal, and corrupted signage',
    composition:
      'escape lanes, hiding pockets, trap corridors, surveillance angles, looming thresholds, and reveal-after-reveal depth',
    mood: 'dangerous, clandestine, haunted, predatory, decadent, and unstable',
    finish:
      'adult genre-game finish with controlled darkness, readable threats, and no flattened spooky fog',
    avoidRules: ['flattened spooky fog', 'safe cartoon horror'],
  },
  'puzzle-chambers-and-adventure-setpieces': {
    frame:
      'adventure setpiece logic, puzzle readability, environmental affordances, hub rhythm, and landmark staging',
    subjectLogic:
      'express puzzle affordances, hub readability, traversal choices, central devices, reward rhythm, and escape logic without requiring a literal dungeon room',
    palette:
      'warm tavern amber, sapphire blue, clockwork brass, prism light, dust white, mushroom red, and moon silver',
    light:
      'portal glow, puzzle beams, lantern pools, stained shafts, crystal refraction, and guided objective light',
    material:
      'worn stone, brass gears, painted signs without readable text, carved rails, puzzle blocks, tavern wood, and polished relics',
    composition:
      'readable paths, central devices, modular rooms, layered doors, reward pedestals, and before-after traversal views',
    mood: 'curious, adventurous, readable, mysterious, playful when relevant, and mechanically inviting',
    finish:
      'environment-adventure art with clear affordances, satisfying depth, and no generic quest-poster layout',
    avoidRules: ['generic quest-poster layout', 'unreadable puzzle clutter'],
  },
};

const tokenCues: Record<string, TokenCue> = {
  abyss: { palette: 'bottomless blue-black', light: 'distant abyss glow', mood: 'submerged dread' },
  alarm: {
    palette: 'warning red against utility white',
    light: 'rotating alarm strobes',
    mechanic: 'breach-state urgency',
  },
  alloy: {
    material: 'brushed alloy trunks and mechanical bark',
    mechanic: 'nature-machine fusion',
  },
  ancient: {
    material: 'eroded stone and buried machine plating',
    mood: 'old technology waking up',
  },
  arcane: {
    light: 'rune-lit scholarly glow',
    material: 'ink, vellum, brass, and crystal',
    mechanic: 'knowledge-as-power readability',
  },
  archer: {
    composition: 'long aim lanes and target silhouettes',
    mechanic: 'precision trial rhythm',
  },
  arena: {
    composition: 'circular contest space and ranked focal hierarchy',
    mechanic: 'competitive role clarity',
  },
  armada: {
    composition: 'fleet silhouettes and layered sky routes',
    mechanic: 'mass movement at horizon scale',
  },
  assassin: {
    light: 'knife-thin spotlights and masked shadow',
    mechanic: 'silent strike readability',
  },
  assault: {
    composition: 'breach vectors and advancing line pressure',
    mechanic: 'attack route staging',
  },
  astral: {
    palette: 'starfield violets and cold gold',
    light: 'celestial rim glow',
    mechanic: 'cosmic rule geometry',
  },
  aurora: { palette: 'green-violet sky ribbons', light: 'aurora wash over snow and armor' },
  basilica: {
    composition: 'tall nave perspective and final-stand axis',
    mood: 'sacred ruin pressure',
  },
  basilisk: {
    material: 'quarry dust, scaled stone, and petrified edges',
    mechanic: 'escape from a dangerous gaze',
  },
  bastion: {
    composition: 'layered defensive walls and high battlements',
    mechanic: 'holdout fortification',
  },
  bazaar: {
    material: 'market cloth, crates, brass trays, and survival stalls',
    composition: 'dense vendor lanes and trade-route clutter',
  },
  beast: {
    composition: 'predator scale reveal and tracking path tension',
    mood: 'hunt-or-be-hunted pressure',
  },
  bioluminescent: {
    palette: 'deep teal with living cyan and violet pulses',
    light: 'organism glow through wet leaves',
  },
  boss: {
    composition: 'arena focal throne and readable threat scale',
    mechanic: 'boss encounter hierarchy',
  },
  brawler: {
    composition: 'close combat spacing and hard impact lanes',
    mechanic: 'street-fight readability',
  },
  breach: {
    composition: 'ruptured threshold and emergency flow',
    mechanic: 'containment failure beat',
  },
  bridge: {
    composition: 'single chokepoint span and opposing route pressure',
    mechanic: 'capture-point tension',
  },
  bronze: {
    palette: 'muddy bronze, oxidized green, and campfire amber',
    material: 'bronze fittings and marsh-wet canvas',
  },
  canyon: {
    palette: 'red rock, dust tan, and hard blue shadow',
    composition: 'cliff corridors and long-range sightlines',
  },
  capture: {
    mechanic: 'contested objective zone',
    composition: 'clear control radius and approach lanes',
  },
  carbon: {
    material: 'carbon fiber, black glass, and rooftop composite panels',
    mood: 'sleek high-altitude danger',
  },
  carnival: {
    palette: 'poison carnival color and dirty bulbs',
    light: 'flickering midway lights',
    mood: 'cursed spectacle',
  },
  castle: {
    material: 'thorned stone, iron gates, and moon-wet masonry',
    mood: 'gothic raid pressure',
  },
  cathedral: {
    composition: 'dusty nave, rally lanes, and sacred scale',
    mood: 'ritual race through ruins',
  },
  cavern: {
    light: 'echoing crystal and sound-wave glow',
    composition: 'acoustic chamber depth',
    mechanic: 'sound puzzle feedback',
  },
  celestial: {
    palette: 'pearl gold, harbor blue, and star-lit trade colors',
    mood: 'mythic commerce and naval ceremony',
  },
  chamber: {
    composition: 'central monolith and modular puzzle floor',
    mechanic: 'room-scale puzzle logic',
  },
  champion: {
    composition: 'hero focal pedestal and opponent ring',
    mechanic: 'trial-of-skill framing',
  },
  chase: {
    composition: 'diagonal escape lanes and rooftop parallax',
    mechanic: 'high-speed pursuit rhythm',
  },
  chess: {
    composition: 'board lanes and opposing value fields',
    mechanic: 'strategy made visible',
  },
  citadel: {
    composition: 'fortified skyline and defense-grid strata',
    mechanic: 'protected objective logic',
  },
  clockwork: {
    palette: 'brass, oil black, and sky silver',
    material: 'gears, clock plates, and polished mechanisms',
  },
  cobalt: {
    palette: 'deep cobalt with orange arena markers',
    material: 'dock steel and scuffed sport plating',
  },
  colony: {
    material: 'greenhouse glass, orbital struts, and modular colony shells',
    mechanic: 'builder-system legibility',
  },
  colossus: {
    composition: 'small scale markers against a massive orchard-scale form',
    mechanic: 'scale encounter reveal',
  },
  convoy: {
    composition: 'staggered vehicle spacing and dust trails',
    mechanic: 'escort-route readability',
  },
  copper: {
    palette: 'copper orange, canyon shadow, and worn leather',
    mechanic: 'robbery route timing',
  },
  coral: {
    palette: 'reef pink, turquoise, and deep-sea blue',
    material: 'coral branches, wet armor, and bubbles',
  },
  court: {
    composition: 'balcony layers, stage axes, and masked audience depth',
    mood: 'decadent assassination theater',
  },
  coven: {
    light: 'wet lantern circles and sick ritual glow',
    mood: 'witchcraft pressure in a marsh arena',
  },
  crimson: {
    palette: 'crimson rock and black rifle silhouette',
    mechanic: 'long-range threat readability',
  },
  crown: {
    material: 'faceted crystal, polished floor, and ceremonial metal',
    mood: 'duel-hall prestige',
  },
  crystal: {
    palette: 'prismatic blue-white with sharp color splits',
    light: 'crystal refraction and caustic shards',
  },
  cursed: {
    mood: 'unlucky spectacle and poisoned celebration',
    material: 'painted props, grime, and broken bulbs',
  },
  deep: {
    composition: 'vertical descent and extraction-route depth',
    mood: 'underground pressure',
  },
  defense: {
    mechanic: 'defense wave readability',
    composition: 'protected core, lanes, and fallback positions',
  },
  desert: {
    palette: 'sun-baked ochre, bone white, and hot shadow blue',
    light: 'heat haze and hard desert sun',
  },
  dock: {
    material: 'rigging, cranes, wet metal, and dragon-scale docking gear',
    composition: 'shipyard layers',
  },
  docks: {
    material: 'wet boards, sport rails, and industrial dock paint',
    composition: 'waterline arena lanes',
  },
  drift: { composition: 'sideways motion arcs and dust wake', mechanic: 'controlled skid rhythm' },
  duel: {
    composition: 'two-sided focal symmetry and readable attack lanes',
    mechanic: 'one-on-one contest pressure',
  },
  dungeon: {
    material: 'black forge stone, lava seams, and iron gates',
    light: 'furnace glow from below',
  },
  eclipse: { palette: 'black sun, red corona, and throne gold', light: 'eclipse backlight' },
  emberwood: {
    palette: 'ember orange against damp forest green',
    material: 'charred timber and ranger gear',
  },
  evacuation: {
    composition: 'civilian flow, monster scale, and route signage without readable text',
    mechanic: 'escape-route urgency',
  },
  extraction: {
    mechanic: 'co-op extraction timing',
    composition: 'lift point, resource pile, and hostile perimeter',
  },
  forge: {
    material: 'molten metal, soot, anvils, and volcanic brick',
    light: 'orange furnace bloom',
  },
  forgotten: {
    mood: 'abandoned transit dread',
    material: 'mildew tile, old ads without text, and wet rails',
  },
  fortress: {
    composition: 'ice walls, approach trenches, and gate pressure',
    material: 'frosted stone and siege rigging',
  },
  frozen: {
    palette: 'cold blue, market amber, and snow glare',
    light: 'lanterns diffused through frost',
  },
  gala: { material: 'silk, mirror floors, and masked ornament', mood: 'elegant stealth pressure' },
  glacier: {
    palette: 'white ice, cobalt shadow, and cold steel',
    light: 'snow glare and blue bounce',
  },
  grand: {
    mechanic: 'premium racing spectacle',
    composition: 'wide speedway and luminous finish line',
  },
  grid: {
    composition: 'defense grid nodes and pulsing control lines',
    mechanic: 'systemic tactical overlay without UI',
  },
  harbor: {
    palette: 'wet harbor blues, sodium orange, and fog black',
    material: 'docks, hulls, ropes, and rain-slick stone',
  },
  heist: {
    mechanic: 'stealth route timing',
    composition: 'entry points, cover pockets, and loot-path focus',
  },
  holographic: {
    palette: 'transparent cyan, magenta refraction, and black chrome',
    light: 'hologram streaks and lens-split glow',
  },
  horror: { mood: 'claustrophobic body-horror transit', light: 'failing carriage lights' },
  hunt: {
    mechanic: 'tracking, ambush, and scale reveal',
    composition: 'tracking-scale contrast against a dangerous landmark',
  },
  iron: {
    palette: 'wet iron, smoke grey, and ember highlights',
    material: 'riveted armor and corroded plates',
  },
  jade: { palette: 'jade green, ash black, and volcanic orange', light: 'green ritual heat' },
  jungle: {
    material: 'wet leaves, vines, and moss-black stone',
    composition: 'dense occlusion with glowing path breaks',
  },
  kaiju: {
    composition: 'giant silhouette behind evacuation routes',
    mechanic: 'disaster-scale readability',
  },
  koi: {
    palette: 'neon koi orange, black water, and cyan signage',
    material: 'rainy river reflections',
  },
  laboratory: {
    material: 'glass tanks, containment frames, and sterile metal',
    mechanic: 'experiment instability',
  },
  lava: { palette: 'hot red-orange against black basalt', light: 'lava bounce and heat shimmer' },
  lotus: { palette: 'midnight blue with pink lotus neon', mood: 'elegant covert ritual' },
  lunar: { palette: 'moon silver, basalt grey, and cold blue', light: 'low lunar rim light' },
  marsh: {
    material: 'reeds, peat water, green copper, and wet roots',
    mood: 'humid occult pressure',
  },
  mech: {
    material: 'hydraulic limbs, armor plates, pistons, and dust-chipped paint',
    mechanic: 'machine-scale choreography',
  },
  mecha: {
    material: 'ancient plating fused into temple stone',
    mechanic: 'dormant machine divinity',
  },
  mechball: {
    mechanic: 'contact-sport machine play',
    composition: 'goal lanes and collision arcs',
  },
  megacity: {
    composition: 'stacked high-rise depth and rooftop escape lanes',
    mood: 'vertical urban velocity',
  },
  metro: {
    material: 'train glass, platform tile, rails, and station glow',
    composition: 'linear transit perspective',
  },
  midnight: {
    light: 'low blue night with sharp neon accents',
    mood: 'quiet late-night infiltration',
  },
  mine: {
    material: 'ore dust, cable lifts, helmets, and wet rock',
    light: 'headlamp cones and shaft glow',
  },
  mirage: { light: 'heat shimmer and mirror haze', mood: 'luxury deception' },
  monastery: {
    composition: 'high terraces and disciplined duel lanes',
    mood: 'windy ritual focus',
  },
  moonbase: {
    material: 'white panels, airlock seams, and lunar dust',
    light: 'sterile station light and alarm red',
  },
  moonlit: {
    palette: 'blue silver, black pine, and pale target light',
    light: 'moon shafts on aiming lanes',
  },
  mushroom: {
    palette: 'red caps, moss green, and warm toy-like highlights',
    material: 'spongy caps and soft forest floor',
  },
  mutation: {
    material: 'wet organic growth over subway tile',
    mood: 'infection creeping through infrastructure',
  },
  mythic: { mood: 'legendary defense under impossible pressure', light: 'golden omen light' },
  naval: {
    material: 'wet hulls, reef iron, ropes, and cannon smoke',
    composition: 'ship-to-shore skirmish lanes',
  },
  neon: {
    palette: 'electric magenta, cyan, acid green, and glossy black',
    light: 'neon edge glow and wet reflections',
  },
  night: { light: 'low-key night lighting with practical pools', mood: 'late-hour danger' },
  ninja: {
    mechanic: 'silent traversal and sudden strike',
    composition: 'shadow gaps and rooftop paths',
  },
  nomad: {
    material: 'solar fabric, rail dust, and portable machinery',
    mood: 'mobile frontier camp',
  },
  obelisk: {
    composition: 'monolith checkpoints and relic route markers',
    mood: 'ancient race pressure',
  },
  obsidian: {
    palette: 'black glass, lava edge, and arena gold',
    material: 'polished volcanic stone',
  },
  opera: {
    material: 'velvet, gold trim, masks, and stage dust',
    light: 'theater spotlight and red curtain shadow',
  },
  orbital: {
    composition: 'ring habitat arcs and greenhouse modules',
    light: 'planet bounce and sterile sun',
  },
  orchard: {
    material: 'gnarled branches, fruit color, and defensive machinery',
    mood: 'pastoral zone turned tactical',
  },
  orchid: {
    palette: 'orchid pink, jade green, and palace gold',
    mood: 'luxury garden puzzle calm',
  },
  outbreak: {
    mechanic: 'infection spread and containment retreat',
    mood: 'panic under cold weather',
  },
  palace: {
    material: 'polished tile, silk screens, and ornate rails',
    composition: 'formal halls with hidden route options',
  },
  parkour: {
    composition: 'jumpable edges, rail gaps, and roofline rhythm',
    mechanic: 'movement route readability',
  },
  phantom: { mood: 'ghost-performance tension', light: 'stage glow through spectral haze' },
  pirate: {
    material: 'sails, brass, wet planks, and storm rope',
    mood: 'airborne underworld adventure',
  },
  pixel: {
    material: 'chunky pixels, tavern wood, and jewel-like UI-free icons',
    mood: 'cozy retro quest energy',
  },
  polar: {
    palette: 'cold white, signal red, and blue-grey steel',
    light: 'radio beacon through snowfall',
  },
  prismatic: {
    palette: 'split-spectrum team colors',
    light: 'facet highlights and draft-grid glow',
  },
  quarry: {
    material: 'cut stone, dust, ropes, and broken rails',
    composition: 'stepped extraction paths',
  },
  quantum: {
    palette: 'violet rift light, sterile white, and teal lab glow',
    mechanic: 'unstable portal hazard',
  },
  radio: { material: 'antenna wires, static screens, and dune dust', mood: 'signal-war paranoia' },
  rail: {
    composition: 'long track perspective and carriage modules',
    mechanic: 'linear route pressure',
  },
  ranger: {
    material: 'field cloak, bows, outpost timber, and ember ash',
    mechanic: 'scout defense posture',
  },
  rebellion: { mood: 'green urban uprising', composition: 'metro barricades and route takeover' },
  reef: {
    palette: 'deep teal, coral red, and wet black',
    material: 'reef stone, hulls, and salt spray',
  },
  relic: {
    material: 'ancient metal, sand, and glowing inscriptions without text',
    mechanic: 'artifact checkpoint race',
  },
  rift: {
    light: 'split-dimensional glow and hard rim tear',
    composition: 'portal seam as focal anchor',
  },
  river: {
    composition: 'waterline routes and reflection corridors',
    material: 'black water and luminous fish color',
  },
  robot: {
    material: 'utility robots, orchard frames, and clean hazard paint',
    mechanic: 'automated defense logic',
  },
  rooftop: {
    composition: 'high ledges, skylines, and escape vectors',
    mood: 'height-risk chase energy',
  },
  ruins: {
    material: 'overgrown stone, broken walls, and tactical cover',
    composition: 'gridlike paths through decay',
  },
  samurai: {
    material: 'lacquer armor, rain cloth, and blade shine',
    mechanic: 'disciplined duel silhouette',
  },
  sandstorm: {
    light: 'dust-dimmed sun and abrasive air glow',
    mood: 'low-visibility race pressure',
  },
  sapphire: {
    palette: 'sapphire blue, warm gold, and polished market color',
    material: 'cards, counters, and bazaar lacquer',
  },
  shadow: { light: 'black velvet shadow and thin spotlight', mood: 'assassin-court secrecy' },
  shrine: {
    composition: 'ceremonial path and altar focal point',
    material: 'stone steps, offerings, and worn gates',
  },
  siege: {
    mechanic: 'besieged objective logic',
    composition: 'walls, breach lanes, and fallback rings',
  },
  signal: {
    light: 'blinking radio beacon and static glow',
    mechanic: 'communication failure pressure',
  },
  skate: { composition: 'curved ramps and molten track lines', mechanic: 'trick-route flow' },
  sky: {
    composition: 'vertical cloud depth and suspended pathways',
    light: 'high-altitude rim light',
  },
  smuggler: {
    mechanic: 'hidden cargo route',
    composition: 'dockside cover and contraband focal points',
  },
  sniper: {
    composition: 'long sightline, hard cover, and distant target read',
    mechanic: 'precision threat route',
  },
  solar: {
    palette: 'warm solar gold, dusty white, and panel blue',
    material: 'portable panels and nomad rigging',
  },
  sound: {
    mechanic: 'audio-feedback puzzle logic',
    composition: 'rings, echoes, and responsive surfaces',
  },
  static: { light: 'radio-static flicker', material: 'grainy screens and antenna silhouettes' },
  stealth: {
    mechanic: 'masked route planning and soft-footed staging',
    composition: 'cover pockets and mirrored sightlines',
  },
  storm: {
    light: 'lightning flashes and shield-grid glow',
    mood: 'defense under weather pressure',
  },
  subway: { material: 'old tile, wet rails, and tunnel mold', composition: 'linear tunnel dread' },
  survival: {
    mechanic: 'resource scarcity and shelter readability',
    mood: 'cold market desperation',
  },
  tactical: {
    mechanic: 'turn-based cover and route clarity',
    composition: 'isometric cover lanes',
  },
  tavern: {
    material: 'warm wood, table clutter, and quest lamps',
    mood: 'hub comfort before danger',
  },
  temple: {
    material: 'worn stone, carved traps, and ritual metal',
    composition: 'trap gauntlet depth',
  },
  theater: { light: 'stage cues and rhythm-beat glow', mechanic: 'timed performance combat' },
  thorn: { material: 'black vines, castle stone, and moonlit thorns', mood: 'gothic raid menace' },
  throne: { composition: 'final boss axis and eclipse halo', mood: 'endgame ritual dread' },
  thunder: { light: 'storm flashes over open plains', mood: 'beast hunt under violent weather' },
  titan: {
    composition: 'colossal target framed by small scale markers',
    mechanic: 'giant encounter scale',
  },
  tower: {
    composition: 'vertical signal landmark and perimeter route',
    light: 'beacon glow in cold air',
  },
  trade: {
    mechanic: 'faction commerce conflict',
    composition: 'docks, sails, and negotiation standoff',
  },
  train: {
    composition: 'carriage rhythm, track vanishing points, and platform chokeholds',
    material: 'steam metal and worn upholstery',
  },
  trap: {
    mechanic: 'timed hazard readability',
    composition: 'gauntlet lanes and warning silhouettes',
  },
  underwater: {
    palette: 'teal pressure shadows and red lab alarms',
    light: 'filtered beams through glass and water',
  },
  verdant: {
    palette: 'wet green over stone and rebellion red accents',
    material: 'plants overrunning civic infrastructure',
  },
  verdigris: {
    palette: 'green copper, storm blue, and pirate brass',
    material: 'oxidized metal and wet sails',
  },
  volcanic: {
    palette: 'black basalt, ember orange, and ash grey',
    light: 'lava glow and soot-dimmed highlights',
  },
  volcano: {
    light: 'volcanic backlight and jade ritual glow',
    material: 'ash, obsidian, and carved shrine rock',
  },
  witch: { mood: 'wetland occult menace', material: 'bones, herbs, reeds, and dark water' },
};

const stopWords = new Set(['and', 'the', 'of', 'a', 'an', 'co', 'op']);

function argValue(name: string) {
  return process.argv
    .find((arg) => arg.startsWith(`--${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');
}

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function visualValue(manifest: StylePresetManifest, key: string) {
  const value = manifest.visualDna[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : '';
}

function isAlreadyEnriched(manifest: StylePresetManifest) {
  return visualValue(manifest, 'aesthetic').includes('transferable game-art direction built from');
}

function normalizedCategoryId(manifest: StylePresetManifest) {
  const taxonomyCategoryId = manifest.taxonomy?.categoryId;
  if (typeof taxonomyCategoryId === 'string' && taxonomyCategoryId in categoryLanguage) {
    return taxonomyCategoryId;
  }

  const normalized = manifest.category
    .replace(/^\d+\.\s*/, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized in categoryLanguage ? normalized : 'neon-urban-and-night-ops';
}

function tokensForName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token && !stopWords.has(token));
}

function unique(values: string[]) {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const clean = value.replace(/\s+/g, ' ').trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(clean);
  }

  return output;
}

function collectCue(tokens: string[], field: keyof TokenCue, fallback: string, limit = 3) {
  const values = unique(
    tokens.map((token) => tokenCues[token]?.[field]).filter(Boolean) as string[],
  );
  return [...values.slice(0, limit), fallback].slice(0, limit + 1).join('; ');
}

function firstCue(value: string) {
  return value.split(';')[0]?.trim() || value.trim();
}

function titleCue(tokens: string[], limit = 5) {
  return tokens
    .slice(0, limit)
    .map((token) => token.replace(/^\w/, (letter) => letter.toUpperCase()))
    .join(', ');
}

function sentence(value: string) {
  return value.endsWith('.') ? value : `${value}.`;
}

function cueParts(manifest: StylePresetManifest) {
  const tokens = tokensForName(manifest.name);
  const category = categoryLanguage[normalizedCategoryId(manifest)];
  const tokenTitle = titleCue(tokens);

  return {
    category,
    tokenTitle,
    palette: collectCue(tokens, 'palette', category.palette),
    light: collectCue(tokens, 'light', category.light),
    material: collectCue(tokens, 'material', category.material),
    composition: collectCue(tokens, 'composition', category.composition),
    mood: collectCue(tokens, 'mood', category.mood),
    mechanic: collectCue(tokens, 'mechanic', category.frame),
  };
}

function buildGameVaultDna(manifest: StylePresetManifest) {
  const cue = cueParts(manifest);

  return {
    aesthetic: sentence(
      `A transferable game-art direction built from tokenized palette, material, encounter, and mood cues: route prompt X through ${cue.mechanic}, using the preset as art direction rather than a required scene, mission, character, or card image`,
    ),
    subject_treatment: sentence(
      `Preserve the user's subject while translating silhouette, role, scale, equipment, route pressure, and encounter readability with this grammar: ${cue.category.subjectLogic}`,
    ),
    color_and_tone: sentence(
      `Grade the image with ${cue.palette}; keep tonal hierarchy strong enough for gameplay readability, thumbnail clarity, and subject recognition`,
    ),
    lighting_and_shadow: sentence(
      `Drive the lighting with ${cue.light}; use highlights and shadow pockets to reveal routes, hazards, factions, or focal threats without hiding prompt content`,
    ),
    texture_and_material: sentence(
      `Build surfaces from ${cue.material}; make props, clothing, creatures, vehicles, architecture, and terrain share the same production-world logic`,
    ),
    camera_and_composition: sentence(
      `Use reusable game-composition grammar from ${cue.category.frame}: lane rhythm, scale contrast, objective hierarchy, readable negative space, encounter depth, and motion vectors should adapt to portraits, objects, creatures, environments, and action scenes`,
    ),
    atmosphere_and_mood: sentence(
      `Keep the mood ${cue.mood}; the result can be adult, harsh, seductive, eerie, or violent when prompt X asks for it, but the preset should not force a new storyline`,
    ),
    rendering_and_quality: sentence(
      `Finish as ${cue.category.finish}; preserve clean focal hierarchy, believable material response, heavy-denoise clarity, and no readable UI, text, logos, or stock key-art gloss`,
    ),
    key_features: `${cue.tokenTitle}; ${firstCue(cue.mechanic)}; ${firstCue(cue.palette)}; ${firstCue(cue.light)}; ${firstCue(cue.material)}; ${firstCue(cue.composition)}; ${firstCue(cue.mood)}`,
    creative_brief:
      wordCount(visualValue(manifest, 'creative_brief')) >= 20 &&
      !visualValue(manifest, 'creative_brief').includes('style-card')
        ? visualValue(manifest, 'creative_brief')
        : sentence(
            `Apply this preset as a reusable video-game art-direction router over prompt X: preserve the user's subject and intent, then translate palette, lighting, material logic, route readability, encounter mood, and production finish through this preset`,
          ),
  };
}

function uniqueRules(rules: string[]) {
  const blockedRules = new Set(['copied card composition']);
  return unique(rules).filter((rule) => rule.length > 0 && !blockedRules.has(rule.toLowerCase()));
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const force = process.argv.includes('--force');
  const presetFilter = argValue('preset');
  const fileNames = (await readdir(presetDir))
    .filter((fileName) => fileName.endsWith('.yaml'))
    .sort((first, second) => first.localeCompare(second));
  let changed = 0;

  for (const fileName of fileNames) {
    const filePath = path.join(presetDir, fileName);
    const manifest = yaml.load(await readFile(filePath, 'utf8')) as StylePresetManifest;
    if (presetFilter && manifest.id !== presetFilter) continue;
    if (!force && isAlreadyEnriched(manifest)) continue;

    const category = categoryLanguage[normalizedCategoryId(manifest)];
    manifest.visualDna = {
      ...manifest.visualDna,
      ...buildGameVaultDna(manifest),
    };
    manifest.avoidRules = uniqueRules([
      ...(manifest.avoidRules ?? []),
      ...category.avoidRules,
      'fixed scene',
      'official card framing',
      'generic game screenshot',
      'readable UI',
      'watermark',
      'logo',
    ]);
    manifest.attributes = {
      ...manifest.attributes,
      negativePrompt: manifest.avoidRules.join(', '),
    };

    changed += 1;

    if (dryRun) {
      console.log(`[pack12:dna] would update ${manifest.id} ${manifest.name}`);
      continue;
    }

    await writeFile(
      filePath,
      yaml.dump(manifest, {
        lineWidth: 100,
        noRefs: true,
        sortKeys: false,
      }),
      'utf8',
    );
  }

  console.log(`[pack12:dna] ${dryRun ? 'dry-run' : 'updated'} presets=${changed}`);
}

await main();
