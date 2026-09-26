import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Video game originals vault, sci-fi frontiers and mech zones: in-game screenshot looks. The ten
// originals get original card briefs; ten new descriptor-named capture looks add mech canopy views,
// weightless station drifts, planet colony overviews, asteroid dogfights, rover photo modes, mech
// garage loadouts, survey visors, station side-views, ice moon outposts and gravity-flip corridors.
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
  category: '3. Sci-Fi Frontiers & Mech Zones',
  updates: {
    'SP12-003': { briefs: [
      'Grinding across endless dunes from a high strategy camera, an original land carrier the size of a city launches tracked scouts toward a buried alien ship whose spine rises out of the sand. No readable text or logo.',
      'In a desert strategy view, a colossal carrier moves at full speed toward battle while one tiny scout buggy has gotten stuck in a dune and is waving its antenna. No readable text or logo.',
      'Seen from above in a sandstorm, a line of scouts leaves tracks toward a wreck, and a second set of tracks is already leading away from it. No readable text or logo.',
    ] },
    'SP12-005': { briefs: [
      'Crouched behind a crate in a flickering freight corridor, an original engineer holds up an analog motion tracker whose beep points straight at the ceiling vent above her. No readable text or logo.',
      'In a first-person freight station, a terrified crew member hides in a locker and realizes the station\'s cat is already hiding in there with him. No readable text or logo.',
      'Down a first-person maintenance corridor lit by emergency red, a vent cover lies on the floor, and the grille bolts have been neatly placed beside it. No readable text or logo.',
    ] },
    'SP12-011': { briefs: [
      'Wading through a flooded art-deco pressure hall in first person, an original diver raises a glowing hand as a hulking brass-suited guardian stomps through the leaking bulkhead. No readable text or logo.',
      'In an undersea deco hall, a proud city founder\'s statue stands in grand pose while a small octopus has settled comfortably into its hat. No readable text or logo.',
      'Through a round brass window in a sunken deco corridor, a vast silhouette drifts past, larger than the building. No readable text or logo.',
    ] },
    'SP12-018': { briefs: [
      'From an elevated tower-defense view, an original citadel core glows under a storm as waves of alien walkers march along winding paths lined with blazing turret beams. No readable text or logo.',
      "Firing all at once from their glowing towers, every turret in the storm citadel targets a single slow alien who is carrying the stolen power core like a baby. No readable text or logo.",
      'From above, a winding defense path glows with turrets, and all of them have slowly turned to aim at the core they are meant to protect. No readable text or logo.',
    ] },
    'SP12-023': { briefs: [
      'Glowing under a red dust storm, an original Martian colony of connected domes shelters a vast green garden where drones tend trees taller than the airlocks. No readable text or logo.',
      'In a Martian colony builder, the colonists have built an enormous expensive dome entirely for one very pampered potato plant. No readable text or logo.',
      'From an overhead colony view, one dome on the edge has its lights on and its airlock open, but no pipe connects it to the rest. No readable text or logo.',
    ] },
    'SP12-033': { briefs: [
      'Defending cartoon garden rows at dusk, an original army of fruit-shooting plants holds back a wave of shambling scarecrows led by a giant lumbering pumpkin brute. No readable text or logo.',
      'In a bright cartoon lawn defense, one sunflower has given up and is sunbathing with sunglasses while the rest of the plants panic. No readable text or logo.',
      'On a cartoon garden lawn at night, every lane is empty except for the last row, where a single dug-up patch of soil is moving. No readable text or logo.',
    ] },
    'SP12-042': { briefs: [
      'Floating in a brutalist concrete hall, an original agent hurls a telekinetic chunk of pillar at a levitating hiss of red astral corruption as file cabinets orbit around her. No readable text or logo.',
      'In a vast brutalist office, a paranormal agent calmly uses telekinesis to make coffee while everything else in the room floats in chaos. No readable text or logo.',
      'In a concrete bureau corridor, a red astral glow leaks from beneath a door marked only with a black square. No readable text or logo.',
    ] },
    'SP12-045': { briefs: [
      'Ducking behind a rusted utility shed on a forest road, an original survivor watches a retrofuturist mech stalk between the pines, its searchlight sweeping the ferns. No readable text or logo.',
      'On a quiet forest road, a menacing patrol machine stops to let a family of hedgehogs cross before continuing its hunt. No readable text or logo.',
      'Among tall pines at dusk, an abandoned mech kneels in the moss, and its cockpit light blinks on as the player passes. No readable text or logo.',
    ] },
    'SP12-046': { briefs: [
      'Racing a hoverbike across pale dunes drawn in clear outlines, an original nomad glides past the skeleton of a colossal ancient beast toward a glowing ruin on the horizon. No readable text or logo.',
      'In a clean-outlined desert, a young nomad proudly shows her new hoverbike to a camel who is completely unimpressed. No readable text or logo.',
      'On a flat outlined desert at dusk, a single hoverbike stands parked by a mask shrine, with the engine still humming. No readable text or logo.',
    ] },
    'SP12-068': { briefs: [
      'Soaring on rails above an ancient forge-city, an original armored dragon rider locks onto a swarm of biomechanical wasps as colossal gears turn in the canyon walls. No readable text or logo.',
      'Flying on rails through an ancient dock, a dragon rider aims at a fearsome enemy ship, and the dragon instead decides to chase a flock of birds. No readable text or logo.',
      'On an on-rails flight over a silent ancient dock, a colossal machine below slowly turns its single eye to follow the dragon. No readable text or logo.',
    ] },
  },
  creates: [
    capture('Mech Canopy View Capture', 'first-person mech cockpit screenshot', 'mech-canopy', {
      aesthetic: 'Mech canopy view capture: an original first-person view from inside a giant mech canopy, framed by cockpit struts and glass, with the battlefield far below.',
      subject_treatment: `${keep}; frame the subject through the glass canopy of a towering mech.`,
      color_and_tone: 'Dim cockpit greys with bright battlefield light outside.',
      lighting_and_shadow: "Backlit canopy glass and interior glow strips, kept consistent across the whole image.",
      texture_and_material: 'Scratched glass, metal struts and rain on the canopy.',
      camera_and_composition: "Cockpit frame with a wide view outside, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with heavy mechanical power.',
      rendering_and_quality: "Clean capture with no readable instrument text, kept consistent across the whole image.",
      key_features: 'mech cockpit frame; canopy glass; battlefield below; rain streaks',
    }, ['readable instruments'], [
      'Looking down through a rain-streaked mech canopy, an original pilot sees an enemy walker the size of a skyscraper rise from the harbor below. No readable text or logo.',
      'From inside a giant mech cockpit, the pilot watches a tiny kitten climb onto the canopy glass and refuse to move. No readable text or logo.',
      "Looking out through cockpit glass at night, the pilot sees a dark city below where one window in the tallest tower is the only light, pointed back at the machine. No readable text or logo.",
    ]),
    capture('Weightless Station Drift Capture', 'zero gravity space station screenshot', 'weightless-station', {
      aesthetic: 'Weightless station drift capture: an original screenshot inside a space station in zero gravity, floating crew, drifting objects, tethers and the planet in the window.',
      subject_treatment: `${keep}; show the subject floating weightless among drifting objects inside a station.`,
      color_and_tone: 'Clean white modules, blue planet glow and warning orange.',
      lighting_and_shadow: "Planet light through windows and panel glow, kept consistent across the whole image.",
      texture_and_material: "Padded walls, cables, floating tools and tethers, kept consistent across the whole image.",
      camera_and_composition: "Rotated camera with no fixed up direction, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with floating calm or peril.',
      rendering_and_quality: "Clean capture with no readable labels, kept consistent across the whole image.",
      key_features: 'zero gravity; floating objects; station module; planet window',
    }, ['readable labels'], [
      'Drifting through a station module after an explosion, an original engineer grabs a floating wrench as a cracked window reveals a massive alien ship blotting out the planet. No readable text or logo.',
      'Floating in a zero-gravity galley, an astronaut tries to eat a bowl of noodles that has escaped and is drifting across the module. No readable text or logo.',
      'Inside a silent station module, every loose object has drifted to one wall, as if something on the other side is pulling. No readable text or logo.',
    ]),
    capture('Planet Overview Colony Capture', 'orbital strategy planet screenshot', 'planet-overview', {
      aesthetic: 'Planet overview colony capture: an original strategy screenshot of a whole small planet seen from orbit, colonies, routes and weather drawn on its curved surface.',
      subject_treatment: `${keep}; show the subject as colonies and structures on a small planet seen from orbit.`,
      color_and_tone: 'Planet blues, greens and deserts on black space.',
      lighting_and_shadow: "Day-night terminator across the globe, kept consistent across the whole image.",
      texture_and_material: "Clouds, city lights and glowing route lines, kept consistent across the whole image.",
      camera_and_composition: "Orbital view of a curved planet, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with godlike overview, kept consistent across the whole image.",
      rendering_and_quality: "Clean strategy capture with no readable UI, kept consistent across the whole image.",
      key_features: 'small planet; orbital view; colony lights; route lines',
    }, [], [
      'Seen from orbit, an original small planet glows with colony lights and route lines as a comet the size of a continent approaches its night side. No readable text or logo.',
      'From an orbital strategy view, a whole planet has been carefully colonized except one small island that belongs entirely to penguins. No readable text or logo.',
      "Glowing across the night side of a small world seen from orbit, every colony is lit except one city that has just gone dark. No readable text or logo.",
    ]),
    capture('Asteroid Belt Dogfight Capture', 'space fighter chase screenshot', 'asteroid-dogfight', {
      aesthetic: 'Asteroid belt dogfight capture: an original third-person space-fighter screenshot weaving through tumbling asteroids, laser streaks and engine trails.',
      subject_treatment: `${keep}; show the subject in a small fighter craft chasing or fleeing through asteroids.`,
      color_and_tone: 'Black space with orange engine glow and red and green lasers.',
      lighting_and_shadow: "Hard sunlight on asteroids, engine glow, kept consistent across the whole image.",
      texture_and_material: "Rocky asteroids, sleek hulls and particle trails, kept consistent across the whole image.",
      camera_and_composition: "Chase camera behind the fighter, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with high-speed daring, kept consistent across the whole image.",
      rendering_and_quality: "Clean space capture with no HUD text, kept consistent across the whole image.",
      key_features: 'asteroids; laser streaks; chase camera; engine trails',
    }, [], [
      'Banking between tumbling asteroids from a chase camera, an original fighter pilot dodges laser fire as a giant space worm bursts out of the rock ahead. No readable text or logo.',
      'In a daring asteroid chase, the hero pilot skillfully weaves through the rocks while the enemy pilot is clearly stuck on one. No readable text or logo.',
      'In a quiet asteroid field, one asteroid is perfectly round and smooth, and the fighter\'s lights reflect in it like a mirror. No readable text or logo.',
    ]),
    capture('Rover Photo-Mode Capture', 'planet rover photo mode screenshot', 'rover-photo', {
      aesthetic: 'Rover photo-mode capture: an original photo-mode screenshot of a small exploration rover on an alien landscape, cinematic depth of field and dramatic sky.',
      subject_treatment: `${keep}; show the subject beside or as an exploration rover in a cinematic alien vista.`,
      color_and_tone: 'Alien sky colors, rust or teal ground and rover white.',
      lighting_and_shadow: "Low alien sun and long shadows, kept consistent across the whole image.",
      texture_and_material: "Regolith, rover panels, dust and rocks, kept consistent across the whole image.",
      camera_and_composition: "Low cinematic angle with shallow focus, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with lonely discovery, kept consistent across the whole image.",
      rendering_and_quality: "Polished photo-mode capture with no UI, kept consistent across the whole image.",
      key_features: 'small rover; alien vista; depth of field; low sun',
    }, [], [
      'Parked on the rim of an alien canyon under two setting suns, an original rover watches a herd of giant floating jellyfish drift over the valley below. No readable text or logo.',
      'In photo mode, a lonely rover has arranged little rocks into a smiley face beside its tracks. No readable text or logo.',
      'On an alien plain at dusk, the rover\'s tracks lead up to a second identical rover, parked facing it. No readable text or logo.',
    ]),
    capture('Mech Garage Loadout Capture', 'mech customization garage screenshot', 'mech-garage', {
      aesthetic: 'Mech garage loadout capture: an original screenshot of a giant mech on a service gantry in a garage, arms swapped out, sparks, crane rigs and technicians.',
      subject_treatment: `${keep}; show the subject on a service gantry in a mech workshop.`,
      color_and_tone: 'Industrial greys with hazard yellow and welding blue.',
      lighting_and_shadow: "Overhead floodlights and welding sparks, kept consistent across the whole image.",
      texture_and_material: "Metal plates, cables, oil and scaffolds, kept consistent across the whole image.",
      camera_and_composition: 'Low angle up the gantry at the mech.',
      atmosphere_and_mood: 'Keep the requested mood with proud mechanical craft.',
      rendering_and_quality: "Clean capture with no readable stat panels, kept consistent across the whole image.",
      key_features: 'mech on gantry; swapped parts; sparks; technicians',
    }, ['stat panels'], [
      'Towering on a service gantry, an original mech has its arm swapped for a massive drill as sparks shower down on technicians and a pilot looks up in awe. No readable text or logo.',
      "Proudly unveiling his customized war machine on the service gantry, a pilot has painted it entirely in pastel pink with flower decals. No readable text or logo.",
      'In a dark mech hangar after hours, one parked machine has its head turned toward the door, though nobody moved it. No readable text or logo.',
    ]),
    capture('Survey Visor Alien Flora Capture', 'scanner visor alien plants screenshot', 'survey-visor', {
      aesthetic: 'Survey visor alien flora capture: an original first-person screenshot through a scanning visor, alien plants and creatures outlined with soft analysis glows.',
      subject_treatment: `${keep}; view the subject through a scanning visor that outlines alien life.`,
      color_and_tone: "Lush alien colors with cyan scan outlines, kept consistent across the whole image.",
      lighting_and_shadow: "Natural alien light with visor glow overlays, kept consistent across the whole image.",
      texture_and_material: "Strange plants, glowing spores and visor glass, kept consistent across the whole image.",
      camera_and_composition: "First-person view with a curved visor edge, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with curious alien discovery.',
      rendering_and_quality: "Clean capture with no readable data, kept consistent across the whole image.",
      key_features: 'scanning visor; alien flora; cyan outlines; first person',
    }, ['readable data'], [
      'Through a scanning visor, an original explorer outlines a towering alien flower that is slowly opening to reveal it is actually a creature with a hundred eyes. No readable text or logo.',
      'Scanning alien plants with great seriousness, an explorer\'s visor highlights a small shrub that is clearly waving back at her. No readable text or logo.',
      'Through a visor in an alien forest, the scanner outlines every plant in cyan, except one tall shape it refuses to outline. No readable text or logo.',
    ]),
    capture('Station Management Side-View', 'space station management sim screenshot', 'station-sideview', {
      aesthetic: 'Station management side-view: an original side-view cross-section screenshot of a space station, tiny crew in rooms, corridors, reactors and docking ships.',
      subject_treatment: `${keep}; show the subject as tiny crew in a side-view cross-section of a station.`,
      color_and_tone: 'Clean module whites, reactor blue and hazard red.',
      lighting_and_shadow: "Room lights with dark space around, kept consistent across the whole image.",
      texture_and_material: "Modular rooms, pipes and tiny crew sprites, kept consistent across the whole image.",
      camera_and_composition: "Side-view cutaway of many rooms, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with busy small-world charm.',
      rendering_and_quality: "Tidy management capture with no readable UI, kept consistent across the whole image.",
      key_features: 'station cross-section; tiny crew; modular rooms; docking ships',
    }, [], [
      'Seen in side-view cross-section, an original space station hums with tiny crew running between rooms as an alien vine grows through the lower decks toward the reactor. No readable text or logo.',
      'In a busy side-view station, every crew member is working hard except one who has built a secret hammock in the air ducts. No readable text or logo.',
      'In a side-view station cutaway, one room on the edge has its lights on but no door leading into it. No readable text or logo.',
    ]),
    capture('Ice Moon Outpost Capture', 'frozen moon base screenshot', 'ice-moon', {
      aesthetic: 'Ice moon outpost capture: an original third-person screenshot of a small base on a frozen moon, a giant ringed planet in the sky, cracked ice and blue floodlights.',
      subject_treatment: `${keep}; set the subject at a small outpost on a frozen moon under a giant ringed planet.`,
      color_and_tone: 'Ice blue, white and dim orange planet glow.',
      lighting_and_shadow: "Floodlights on ice with deep blue shadows, kept consistent across the whole image.",
      texture_and_material: "Cracked ice, frosted metal and snow drifts, kept consistent across the whole image.",
      camera_and_composition: 'Wide view with the planet dominating the sky.',
      atmosphere_and_mood: 'Keep the requested mood with isolated frozen awe.',
      rendering_and_quality: "Clean capture with no HUD text, kept consistent across the whole image.",
      key_features: 'frozen moon; ringed planet sky; floodlights; cracked ice',
    }, [], [
      'Standing outside a frozen moon outpost under a giant ringed planet, an original technician watches a crack in the ice glow as something enormous swims beneath it. No readable text or logo.',
      'On an icy moon, a lone researcher has built a small snowman outside the outpost and given it a spare helmet. No readable text or logo.',
      'Outside a frozen outpost, a fresh line of footprints leads away across the ice toward nothing, and none lead back. No readable text or logo.',
    ]),
    capture('Gravity-Flip Corridor Capture', 'gravity shifting puzzle screenshot', 'gravity-flip', {
      aesthetic: 'Gravity-flip corridor capture: an original screenshot of a sci-fi corridor where gravity points in different directions, characters walking on walls and ceilings.',
      subject_treatment: `${keep}; place the subject in a corridor where gravity changes direction.`,
      color_and_tone: 'Clean white panels with orange and blue gravity zones.',
      lighting_and_shadow: "Glowing gravity field panels, kept consistent across the whole image.",
      texture_and_material: "Polished panels, floating dust and field glows, kept consistent across the whole image.",
      camera_and_composition: "Disorienting angle with multiple floors in view, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with mind-bending playfulness, kept consistent across the whole image.",
      rendering_and_quality: "Clean puzzle capture with no readable text, kept consistent across the whole image.",
      key_features: 'gravity zones; wall-walking; disorienting angle; clean panels',
    }, [], [
      'Walking along the ceiling of a gravity-flipped corridor, an original test subject reaches for a glowing cube floating in the middle while a turret on the wall tracks her upside down. No readable text or logo.',
      "Standing on the wall of a sideways corridor, a scientist casually drinks coffee that pours sideways into the cup. No readable text or logo.",
      'In a corridor where gravity changes direction, a door on the ceiling is slowly opening downward. No readable text or logo.',
    ]),
  ],
};

export default spec;
