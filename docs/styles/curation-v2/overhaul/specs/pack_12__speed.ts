import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Video game originals vault, speed, sport and competitive arenas: in-game screenshot looks. The
// ten originals get original card briefs; ten new descriptor-named capture looks add kart item
// chaos, street skate trick lines, backcountry snowboarding, digital pinball tables, versus stage
// fighters, wrestling ring entrances, motocross mud jumps, esports stadium broadcasts, fantasy golf
// courses and sailing regattas.
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
  avoid: [...avoid, 'existing game characters, logos or levels', 'readable interface text', 'real brand sponsors', ...STYLE_AVOID],
  briefs,
});

const keep = 'Preserve the requested identity, count, pose and action with original characters';

const spec: Spec = {
  pack: 'pack_12',
  category: '5. Speed, Sport & Competitive Arenas',
  updates: {
    'SP12-008': { briefs: [
      'Screaming through a neon canyon at night, an original anti-gravity racer banks through a corkscrew as rivals\' hover-craft leave glowing trails and a weapon blast lights the track walls. No readable text or logo.',
      'In a futuristic hover race, the leading craft suddenly slows to a crawl because a small maintenance drone has wandered onto the track. No readable text or logo.',
      'Along an empty night circuit, the track lights pulse in sequence toward a finish arch that has no stands and no crowd. No readable text or logo.',
    ] },
    'SP12-017': { briefs: [
      'Soaring off a half-pipe in a comic-shaded arena, an original roller-skating champion fires twin pistols mid-spin as armored enforcers aim up from the concrete bowl below. No readable text or logo.',
      'In a comic-shaded skate arena, a deadly roller champion has to pause mid-trick to retie a loose skate lace. No readable text or logo.',
      'In a silent concrete arena between rounds, a single skate is still rolling slowly across the floor toward the center. No readable text or logo.',
    ] },
    'SP12-021': { briefs: [
      'Drifting sideways through a desert canyon at sunset, an original rally car throws a towering dust plume as a festival hot-air balloon drifts overhead. No readable text or logo.',
      'In a colorful open-world race, a driver pulls over at the most beautiful viewpoint in the desert to take a photo while the other racers blast past. No readable text or logo.',
      'On a desert road at dusk, a lone parked car has its headlights on, pointed at a sand dune that was not there yesterday. No readable text or logo.',
    ] },
    'SP12-031': { briefs: [
      'On a compact pixel grid island, an original trio of small mechs pushes a giant insect into the sea just as the tidal wave warning cells flash across the tiles. No readable text or logo.',
      'In a tiny pixel tactics grid, a powerful mech misses its attack and instead knocks a harmless cow into the river. No readable text or logo.',
      "Resting on a small pixel island between turns, the ocean tiles around it have started to drain away, revealing something vast and pale underneath. No readable text or logo.",
    ] },
    'SP12-039': { briefs: [
      'Stomping on the beat across a graphic cel-shaded arena, an original guitar-wielding brawler smashes a robot drummer whose cymbals flash in time with the music. No readable text or logo.',
      'In a rhythm-action arena, a powerful villain is defeated because he could not resist tapping his foot to the hero\'s song. No readable text or logo.',
      'On an empty cel-shaded stage, the lights still pulse on the beat, and a single spotlight keeps finding a spot where no one is standing. No readable text or logo.',
    ] },
    'SP12-047': { briefs: [
      'Rocket-jumping across a gothic sci-fi arena over a lava pit, an original armored gladiator fires at an opponent mid-air while jump pads glow below. No readable text or logo.',
      'In a retro arena shooter, a fearsome warrior respawns and immediately falls off the same ledge he fell off the last time. No readable text or logo.',
      'In an empty gothic arena between matches, a single health orb spins slowly in the air above a jump pad. No readable text or logo.',
    ] },
    'SP12-059': { briefs: [
      'Clashing in a prismatic lane under a crystal tree, an original team of five heroes unleashes glowing abilities on a towering ancient guardian as creep waves march past. No readable text or logo.',
      'In a fierce isometric arena match, a legendary hero ignores the battle entirely to farm a single stubborn creep in the jungle. No readable text or logo.',
      'Across an isometric battle map at dawn, all the lanes are empty and every tower has turned its crystal toward the river. No readable text or logo.',
    ] },
    'SP12-063': { briefs: [
      'Blazing past towering obelisks on a desert track at impossible speed, an original anti-gravity racer threads between two rivals as the track twists into a vertical loop. No readable text or logo.',
      'In a saturated sci-fi race, the fastest pilot in the galaxy has lost because he stopped to let a family of desert lizards cross. No readable text or logo.',
      'On a desert racetrack at twilight, one obelisk beside the course is glowing, although the power to the track has been off for hours. No readable text or logo.',
    ] },
    'SP12-065': { briefs: [
      'Crossing blades in an ornate crystal hall, two original weapon masters collide mid-air as their swords throw sparks across the stained floor of the arena. No readable text or logo.',
      'In an ornate duel hall, a heavily armored warrior swings a gigantic sword while his opponent calmly dodges with a teacup in hand. No readable text or logo.',
      'In a crystal duel hall after the fight, the two weapons lie crossed on the floor, and the crystals reflect a third figure. No readable text or logo.',
    ] },
    'SP12-075': { briefs: [
      "Flipping mid-air after driving up a curved stadium wall, an original rally car strikes a giant glowing ball toward the goal as boost trails streak the arena. No readable text or logo.",
      'In a car soccer match, an entire team of rocket cars chases the ball into the corner, while the ball has quietly rolled into their own goal. No readable text or logo.',
      'In an empty stadium at night, the giant ball sits motionless on the center mark, and every car is parked facing it. No readable text or logo.',
    ] },
  },
  creates: [
    capture('Kart Racing Item Chaos Capture', 'cartoon kart racing screenshot', 'kart-chaos', {
      aesthetic: 'Kart racing item chaos capture: an original cartoon kart race screenshot with bouncy karts, item explosions, banana peels and colorful tracks through fantasy lands.',
      subject_treatment: `${keep}; show the subject driving a cartoon kart amid flying items and rivals.`,
      color_and_tone: "Saturated primary colors and sunny skies, kept consistent across the whole image.",
      lighting_and_shadow: "Bright cartoon light with small shadows, kept consistent across the whole image.",
      texture_and_material: "Glossy karts, grass, candy-like tracks and explosions, kept consistent across the whole image.",
      camera_and_composition: 'Chase camera behind the kart with rivals nearby.',
      atmosphere_and_mood: "Keep the requested mood with gleeful chaos, kept consistent across the whole image.",
      rendering_and_quality: "Clean cartoon capture with no HUD text, kept consistent across the whole image.",
      key_features: 'cartoon karts; item explosions; fantasy track; chase camera',
    }, [], [
      'Drifting around a volcano track in a cartoon kart, an original raccoon racer dodges a flaming shell as a giant chicken rival lays eggs across the road behind her. No readable text or logo.',
      'In a chaotic kart race, the last-place driver finally gets a powerful item and it is a single, very slow bubble. No readable text or logo.',
      "Crossing the finish line on a bright cartoon track, the winner discovers the podium is already occupied by a tiny kart nobody saw on the course. No readable text or logo.",
    ]),
    capture('Street Skate Trick Line Capture', 'skateboarding game screenshot', 'skate-line', {
      aesthetic: 'Street skate trick line capture: an original skateboarding game screenshot of a mid-air trick over city stairs and rails, fisheye feel and sunny concrete.',
      subject_treatment: `${keep}; show the subject mid-trick on a skateboard over urban features.`,
      color_and_tone: "Sunny concrete greys with bold clothing colors, kept consistent across the whole image.",
      lighting_and_shadow: "Bright afternoon sun and crisp shadows, kept consistent across the whole image.",
      texture_and_material: 'Concrete, metal rails, grip tape and clean painted walls.',
      camera_and_composition: "Low fisheye-style follow camera, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with loose street freedom.',
      rendering_and_quality: 'Clean capture with no trick names or scores.',
      key_features: 'mid-air trick; city stairs; fisheye; sunny concrete',
    }, ['readable graffiti'], [
      'Flying over a giant fountain in a sunny plaza, an original skater grinds a statue\'s outstretched sword as pigeons scatter from the stone hero\'s shoulders. No readable text or logo.',
      'Mid-air over a huge set of stairs, a skater realizes too late that the landing is covered in wet cement. No readable text or logo.',
      'In an empty skate plaza at dusk, one board rolls slowly down the stairs on its own. No readable text or logo.',
    ]),
    capture('Backcountry Snowboard Descent Capture', 'snowboard mountain game screenshot', 'snowboard', {
      aesthetic: 'Backcountry snowboard descent capture: an original snowboarding screenshot of a rider carving deep powder down a vast mountain, snow spray and blue sky.',
      subject_treatment: `${keep}; show the subject carving or jumping on a snowboard down a vast slope.`,
      color_and_tone: 'Brilliant white, deep blue sky and bright outerwear.',
      lighting_and_shadow: "Hard alpine sun with blue snow shadows, kept consistent across the whole image.",
      texture_and_material: "Powder spray, ice ridges and pine trees, kept consistent across the whole image.",
      camera_and_composition: "Wide follow camera down the mountain, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with exhilarating freedom, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no HUD text, kept consistent across the whole image.",
      key_features: 'powder spray; vast mountain; blue sky; carving rider',
    }, [], [
      'Launching off a cornice above a glacier, an original snowboarder soars over a sleeping ice dragon curled across the whole valley below. No readable text or logo.',
      'Carving through perfect powder, a snowboarder is overtaken by a mountain goat that is somehow also snowboarding. No readable text or logo.',
      'On a vast white slope, a single set of board tracks leads into a cloud and does not come out the other side. No readable text or logo.',
    ]),
    capture('Digital Pinball Table Capture', 'fantasy pinball game screenshot', 'digital-pinball', {
      aesthetic: 'Digital pinball table capture: an original screenshot of a glowing fantasy pinball table, ramps, bumpers, flippers and a chrome ball with light trails.',
      subject_treatment: `${keep}; turn the subject into the theme of a glowing pinball table.`,
      color_and_tone: 'Glowing reds, golds and blues on dark playfield.',
      lighting_and_shadow: "Bumper flashes and ramp glow, kept consistent across the whole image.",
      texture_and_material: "Chrome ball, plastic ramps, printed playfield art, kept consistent across the whole image.",
      camera_and_composition: "Angled top-down view of the whole table, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with flashing arcade thrill.',
      rendering_and_quality: "Clean capture with no score text, kept consistent across the whole image.",
      key_features: 'pinball table; chrome ball; bumpers; ramps',
    }, ['score text'], [
      'Racing up a ramp on a dragon-themed pinball table, a chrome ball lights the beast\'s eyes as its sculpted jaw opens to swallow the ball into a hidden lock. No readable text or logo.',
      'On a fantasy pinball table, the ball has somehow come to rest perfectly balanced on the tip of a flipper and refuses to move. No readable text or logo.',
      'On a dark pinball table, the lights flash for a ball that is not there, and the flippers move on their own. No readable text or logo.',
    ]),
    capture('Versus Stage Fighter Capture', 'two-player fighting game screenshot', 'versus-fighter', {
      aesthetic: 'Versus stage fighter capture: an original side-view fighting game screenshot of two fighters mid-clash on a dramatic stage with a watching crowd.',
      subject_treatment: `${keep}; show the subject as one of two fighters mid-clash on a side-view stage.`,
      color_and_tone: "Vivid fighter colors against a dramatic stage, kept consistent across the whole image.",
      lighting_and_shadow: "Impact flashes and stage light, kept consistent across the whole image.",
      texture_and_material: "Detailed fighters, stage props and impact effects, kept consistent across the whole image.",
      camera_and_composition: "Side-on camera with both fighters framed, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with explosive rivalry, kept consistent across the whole image.",
      rendering_and_quality: 'Clean capture with no health bars or text.',
      key_features: 'two fighters; side view; impact flash; dramatic stage',
    }, ['health bars'], [
      'Clashing on a rooftop stage under a thunderstorm, an original monk fighter meets a masked robot mid-kick as lightning flashes and the crowd below cheers. No readable text or logo.',
      'On a side-view fighting stage, two fierce fighters freeze mid-clash because a food vendor has walked between them. No readable text or logo.',
      'On an empty side-view stage, one fighter stands ready, facing a shadow on the wall that is striking the same pose. No readable text or logo.',
    ]),
    capture('Wrestling Ring Entrance Capture', 'pro wrestling entrance screenshot', 'ring-entrance', {
      aesthetic: 'Wrestling ring entrance capture: an original pro-wrestling screenshot of a wrestler making a dramatic entrance down a ramp, pyrotechnics, spotlights and roaring crowd.',
      subject_treatment: `${keep}; show the subject making a flamboyant entrance toward a wrestling ring.`,
      color_and_tone: 'Dark arena with bright spotlights and pyro colors.',
      lighting_and_shadow: "Spotlights, pyrotechnic flashes and haze, kept consistent across the whole image.",
      texture_and_material: "Ring ropes, capes, sequins and smoke, kept consistent across the whole image.",
      camera_and_composition: "Low angle up the ramp, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with theatrical bravado, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no name graphics, kept consistent across the whole image.",
      key_features: 'entrance ramp; pyrotechnics; spotlights; roaring crowd',
    }, ['name graphics'], [
      'Striding down a ramp through bursts of green fire, an original masked wrestler in a cape of feathers raises both arms as a stuffed griffin rises behind him. No readable text or logo.',
      'Making a dramatic wrestling entrance, a fearsome champion trips on his own cape at the top of the ramp. No readable text or logo.',
      'In a dark arena, the spotlight finds the entrance ramp, the pyro fires, and nobody walks out. No readable text or logo.',
    ]),
    capture('Motocross Mud Jump Capture', 'dirt bike racing screenshot', 'motocross', {
      aesthetic: 'Motocross mud jump capture: an original dirt-bike racing screenshot of a rider mid-air over muddy whoops, flying clods of earth and a crowd on the hill.',
      subject_treatment: `${keep}; show the subject mid-air on a dirt bike over a muddy track.`,
      color_and_tone: "Mud brown, bright jerseys and grey sky, kept consistent across the whole image.",
      lighting_and_shadow: "Overcast light with flying mud silhouettes, kept consistent across the whole image.",
      texture_and_material: "Mud clods, knobby tires and wet dirt, kept consistent across the whole image.",
      camera_and_composition: "Low angle under the jump, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with gritty adrenaline, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no sponsor text, kept consistent across the whole image.",
      key_features: 'dirt bike; mid-air jump; flying mud; crowd',
    }, [], [
      'Launching off a muddy ramp in a thunderstorm, an original rider soars over a flooded ravine as a rival\'s bike cartwheels behind him in a shower of mud. No readable text or logo.',
      'Mid-air over a mud jump, a rider realizes his front wheel has come off and is flying ahead of him. No readable text or logo.',
      'On a muddy track after the race, one set of tire tracks leads off the course into the forest. No readable text or logo.',
    ]),
    capture('Esports Stadium Broadcast Capture', 'esports arena broadcast screenshot', 'esports-stadium', {
      aesthetic: 'Esports stadium broadcast capture: an original broadcast view of an esports arena, players in glass booths, giant screens and a roaring crowd in colored light.',
      subject_treatment: `${keep}; show the subject in an esports arena with booths and giant screens.`,
      color_and_tone: 'Dark arena with team blue and red light.',
      lighting_and_shadow: "Stage lights, screen glow and crowd lights, kept consistent across the whole image.",
      texture_and_material: "Glass booths, headsets and LED screens, kept consistent across the whole image.",
      camera_and_composition: "Wide broadcast angle across the arena, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with electric competition, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no readable team names, kept consistent across the whole image.",
      key_features: 'glass booths; giant screens; crowd; team lights',
    }, ['readable team names'], [
      'On a giant stadium screen above two glass booths, an original grand final reaches its peak as a pixel dragon on screen breathes fire and the crowd leaps to its feet. No readable text or logo.',
      'In a packed esports arena, the tense final is paused because one player\'s grandmother has arrived with snacks. No readable text or logo.',
      'In an empty esports stadium at night, every screen is still showing the final frame, and one booth light is still on. No readable text or logo.',
    ]),
    capture('Fantasy Golf Course Capture', 'magical golf game screenshot', 'fantasy-golf', {
      aesthetic: 'Fantasy golf course capture: an original golf game screenshot on a magical course with floating greens, castle hazards, lava bunkers and a bright shot trail.',
      subject_treatment: `${keep}; show the subject taking a shot on a magical golf course.`,
      color_and_tone: "Lush greens, sky blue and magical accents, kept consistent across the whole image.",
      lighting_and_shadow: "Bright daylight with glowing shot trail, kept consistent across the whole image.",
      texture_and_material: "Manicured grass, stone ruins and water, kept consistent across the whole image.",
      camera_and_composition: "Behind the golfer toward a distant green, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with whimsical leisure, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no distance text, kept consistent across the whole image.",
      key_features: 'floating greens; magical hazards; shot trail; golfer',
    }, ['distance numbers'], [
      'Teeing off from a cliff above a floating green, an original wizard golfer sends a glowing ball over a sleeping dragon that guards the only path to the hole. No readable text or logo.',
      'On a magical golf course, the ball lands in a bunker that turns out to be a very annoyed sand creature. No readable text or logo.',
      'On a misty magical green, the flag on the final hole is moving toward the golfer on its own. No readable text or logo.',
    ]),
    capture('Sailing Regatta Race Capture', 'sailboat racing game screenshot', 'regatta', {
      aesthetic: 'Sailing regatta race capture: an original sailing race screenshot of sleek boats heeling in strong wind, spray, buoys and dramatic sky over the sea.',
      subject_treatment: `${keep}; show the subject racing a sailboat in strong wind and spray.`,
      color_and_tone: 'Deep sea blue, white sails and bright hulls.',
      lighting_and_shadow: "Bright sun on spray with cloud shadows, kept consistent across the whole image.",
      texture_and_material: "Taut sails, wet decks and waves, kept consistent across the whole image.",
      camera_and_composition: "Low angle near the waterline, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with wind-whipped competition, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no sail numbers, kept consistent across the whole image.",
      key_features: 'heeling boats; spray; buoys; strong wind',
    }, ['sail numbers'], [
      'Heeling hard in a gale, an original racing yacht rounds the final buoy as a colossal sea turtle surfaces between the boats and lifts a rival on its shell. No readable text or logo.',
      'In a tight regatta, a crew is leading comfortably until a seagull lands on the sail and refuses to leave. No readable text or logo.',
      'On a calm sea at the end of a race, one sailboat is still out there, its sails full although there is no wind. No readable text or logo.',
    ]),
  ],
};

export default spec;
