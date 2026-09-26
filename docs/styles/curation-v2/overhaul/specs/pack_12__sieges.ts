import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Video game originals vault, sieges, warfronts and last stands: in-game screenshot looks. The ten
// originals get original card briefs; ten new descriptor-named capture looks add wall-breach horde
// defense, trench assault cameras, catapult crew views, hex wargame boards, barricade night
// holdouts, spaceport evacuations, lane-battle sieges, castle-builder sieges, massed cavalry
// charges and snowfield artillery duels.
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
  category: '4. Sieges, Warfronts & Last Stands',
  updates: {
    'SP12-007': { briefs: [
      'Holding a frozen bridge on a hand-painted tactical grid, an original band of horned giants and archers faces a column of stone-armored invaders marching out of a snowstorm. No readable text or logo.',
      'On a painted snowy battlefield, a mighty horned giant waits for his turn while a tiny archer spends forever deciding where to move. No readable text or logo.',
      'Across a painted glacier at dusk, a caravan banner stands planted in the snow, and the caravan tracks behind it are already filling with fresh snow. No readable text or logo.',
    ] },
    'SP12-009': { briefs: [
      'Storming a cartoon castle in thick outlines, four original knights in different colored armor bash through a gate as a giant armored barbarian chief throws a ram at them. No readable text or logo.',
      'In a thick-outlined cartoon siege, a knight triumphantly rescues a princess who immediately rescues his pet owl from a tree. No readable text or logo.',
      'On a cartoon castle wall at night, a line of defenders all look outward, while behind them a small door in the tower slowly opens. No readable text or logo.',
    ] },
    'SP12-026': { briefs: [
      'Advancing across tiered isometric ruins overgrown with vines, an original unit of lancers and mages flanks a rebel dragon rider perched on a toppled pillar. No readable text or logo.',
      'On an isometric tactical map, an entire army waits in formation while one unit is stuck on a slightly too high tile. No readable text or logo.',
      'Among isometric ruins, one tile at the center is raised higher than all others, with a single rusted sword standing in it. No readable text or logo.',
    ] },
    'SP12-035': { briefs: [
      'Stacked floor upon floor in a burning vertical lift, original monster cards slam into each other as an infernal elevator carries the battle down toward a molten core. No readable text or logo.',
      'On a vertical defense lift, a mighty demon card faces down its opponent, which is a single stubborn goat card that refuses to move. No readable text or logo.',
      'Deep in an infernal lift shaft, every floor is lit and fighting except the lowest one, which is quietly dark. No readable text or logo.',
    ] },
    'SP12-038': { briefs: [
      'Firing a full broadside across a stormy ocean, an original iron battleship sends glowing shell tracers toward a reef fortress as a kraken rises between them. No readable text or logo.',
      'In a naval battle camera view, an enormous warship turns heroically and immediately runs aground on a tiny sandbar with one palm tree. No readable text or logo.',
      'On a calm grey sea after a battle, a lone smokestack juts from the water, and its whistle is still blowing. No readable text or logo.',
    ] },
    'SP12-052': { briefs: [
      'Pushing across a chunky industrial bridge in first person, an original squad of team-colored heroes charges a rolling payload as a rocket-armed rival leaps over the rail. No readable text or logo.',
      'In a stylized team shooter, the whole blue team charges the objective while their medic has stopped to pet a cat on the bridge. No readable text or logo.',
      'On an empty industrial bridge between rounds, the payload cart is rolling forward on its own. No readable text or logo.',
    ] },
    'SP12-060': { briefs: [
      'Kneeling before a towering basilica altar in dark pixel art, an original penitent raises a thorned blade as a colossal weeping bishop-statue lifts itself from the floor. No readable text or logo.',
      'In a dark pixel basilica, a grim penitent warrior is forced to wait while an extremely slow procession of monks crosses his path. No readable text or logo.',
      'In a candlelit pixel basilica, the statues along the nave all hold candles, and one statue\'s candle has just been relit. No readable text or logo.',
    ] },
    'SP12-064': { briefs: [
      'Defending a steampunk colony at night from an isometric view, original turret lines blaze as a horde of thousands pours out of the fog toward the last wooden wall. No readable text or logo.',
      'In an isometric colony defense, the commander has built walls everywhere, including accidentally around his own headquarters with no door. No readable text or logo.',
      'From an isometric view at night, the colony is quiet and the walls are intact, but one watchtower light has turned to face inward. No readable text or logo.',
    ] },
    'SP12-076': { briefs: [
      'Under a glowing aurora, an original clan of isometric raiders storms a snowy bastion as a giant ice troll wakes on the hill above both armies. No readable text or logo.',
      'In a snowy isometric settlement, the entire clan has gone to war except one villager who is still peacefully fishing through a hole in the ice. No readable text or logo.',
      'Across a snowy settlement under the northern lights, every house has smoke rising from its chimney except the chieftain\'s hall. No readable text or logo.',
    ] },
    'SP12-079': { briefs: [
      'Dropping in from orbit under a sky of fire, an original squad of armored troopers lands beside a citadel beacon as a swarm of alien bugs surges over the ridge. No readable text or logo.',
      'Holding an extraction point, a team of heroic troopers fights off an alien horde while one of them is still trying to read the instruction card on the beacon. No readable text or logo.',
      'At a silent extraction zone after a battle, the beacon is still flashing and the dropship door is open, with no one inside. No readable text or logo.',
    ] },
  },
  creates: [
    capture('Wall-Breach Horde Defense Capture', 'wall defense against horde screenshot', 'horde-defense', {
      aesthetic: 'Wall-breach horde defense capture: an original elevated screenshot of defenders on a stone wall as an overwhelming horde surges through a breach, torches and debris everywhere.',
      subject_treatment: `${keep}; show the subject defending a wall breach against an enormous horde.`,
      color_and_tone: "Torch orange, smoke grey and dark stone, kept consistent across the whole image.",
      lighting_and_shadow: "Firelight on stone and silhouetted masses, kept consistent across the whole image.",
      texture_and_material: "Stone rubble, wooden barricades and smoke, kept consistent across the whole image.",
      camera_and_composition: 'Elevated angle over the wall and the breach.',
      atmosphere_and_mood: 'Keep the requested mood with desperate last-stand pressure.',
      rendering_and_quality: "Clear readable crowd action, no HUD text, kept consistent across the whole image.",
      key_features: 'wall breach; horde surge; torchlight; elevated view',
    }, [], [
      'Pouring through a shattered wall in an endless tide, an original horde of goblins is held back by a single giant defender swinging a broken gate as torches fall around him. No readable text or logo.',
      "Bracing for the horde behind a shattered gap in the stones, a crowd of defenders watches the first invader arrive: a small goblin carrying a white flag. No readable text or logo.",
      'Along a silent wall after the siege, the breach has been sealed, and fresh scratches cover the stones from the inside. No readable text or logo.',
    ]),
    capture('Trench Assault Camera Capture', 'first-person trench assault screenshot', 'trench-assault', {
      aesthetic: 'Trench assault camera capture: an original first-person screenshot climbing out of a muddy trench into a smoke-filled no-man\'s-land with flares overhead.',
      subject_treatment: `${keep}; show the subject from first person in a muddy trench assault.`,
      color_and_tone: "Mud brown, smoke grey and flare red, kept consistent across the whole image.",
      lighting_and_shadow: "Flare light and drifting smoke, kept consistent across the whole image.",
      texture_and_material: "Mud, barbed wire, sandbags and craters, kept consistent across the whole image.",
      camera_and_composition: "First-person over the trench lip, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with grim dreadful courage.',
      rendering_and_quality: "Gritty capture without gore or HUD text, kept consistent across the whole image.",
      key_features: 'muddy trench; flares; barbed wire; first-person',
    }, ['gore'], [
      'Climbing over the lip of a muddy trench in first person, an original soldier stares into smoke where a steam-powered war machine the size of a church lurches through the wire. No readable text or logo.',
      'Crouched in a muddy trench, a squad waits tensely for the whistle while their sergeant is carefully making tea on a tiny stove. No readable text or logo.',
      "Looking over a muddy parapet at dawn, the no-man's-land is silent, and a single flare hangs in the sky without falling. No readable text or logo.",
    ]),
    capture('Catapult Crew View Capture', 'siege engine crew screenshot', 'catapult-crew', {
      aesthetic: 'Catapult crew view capture: an original third-person screenshot from behind a siege catapult crew as the arm fires toward a distant castle, projectile arc visible.',
      subject_treatment: `${keep}; show the subject operating or riding a siege engine as it fires.`,
      color_and_tone: 'Earthy wood browns, sky blue and fire orange.',
      lighting_and_shadow: "Daylight with burning projectile glow, kept consistent across the whole image.",
      texture_and_material: "Wooden beams, rope, stone and dust, kept consistent across the whole image.",
      camera_and_composition: "Behind the catapult toward the target, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with rowdy siege energy.',
      rendering_and_quality: 'Clean capture with a visible arc, no text.',
      key_features: 'catapult arm; projectile arc; crew; distant castle',
    }, [], [
      'Launching a flaming boulder toward a distant castle, an original catapult crew braces as the arm snaps forward and a dragon perched on the target tower takes off in alarm. No readable text or logo.',
      'Behind a siege catapult, the crew fires with great ceremony and accidentally launches their own cook, who is still holding a ladle. No readable text or logo.',
      'Behind a silent catapult, the arm is loaded and ready, but the crew is gone and the rope is slowly fraying. No readable text or logo.',
    ]),
    capture('Hex Wargame Board Capture', 'digital hex wargame screenshot', 'hex-wargame', {
      aesthetic: 'Hex wargame board capture: an original screenshot of a digital hex-grid wargame with terrain hexes, unit counters and a painted map beneath the grid.',
      subject_treatment: `${keep}; show the subject as unit counters on a painted hex-grid map.`,
      color_and_tone: 'Muted map greens and browns with bold unit colors.',
      lighting_and_shadow: "Flat board light, kept consistent across the whole image.",
      texture_and_material: "Painted terrain, hex lines and counter chips, kept consistent across the whole image.",
      camera_and_composition: "Top-down angled board view, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with cerebral grand strategy.',
      rendering_and_quality: "Clean board with no readable numbers, kept consistent across the whole image.",
      key_features: 'hex grid; unit counters; painted map; top-down',
    }, ['readable counter numbers'], [
      'On a painted hex map of a river valley, an original army of red counters crosses a bridge while a single black counter shaped like a dragon sits alone on a mountain hex. No readable text or logo.',
      'On a hex wargame board, a grand army is perfectly arranged except for one counter that has wandered into the lake hex. No readable text or logo.',
      'On a hex map at the end of a war, every unit counter has been removed except one, facing the edge of the board. No readable text or logo.',
    ]),
    capture('Barricade Night Holdout Capture', 'survival barricade defense screenshot', 'barricade-holdout', {
      aesthetic: 'Barricade night holdout capture: an original third-person survival screenshot of survivors defending a boarded-up farmhouse at night, flashlights and silhouettes at the windows.',
      subject_treatment: `${keep}; show the subject defending a barricaded building at night.`,
      color_and_tone: 'Dark blues with flashlight white and lamp amber.',
      lighting_and_shadow: "Flashlight beams and window silhouettes, kept consistent across the whole image.",
      texture_and_material: "Wooden boards, nails, broken glass and mud, kept consistent across the whole image.",
      camera_and_composition: "Over-the-shoulder view toward the windows, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with tense survival dread.',
      rendering_and_quality: "Clean capture without gore or HUD text, kept consistent across the whole image.",
      key_features: 'boarded windows; flashlights; night; survivors',
    }, ['gore'], [
      'Nailing the last board over a farmhouse window, an original survivor freezes as her flashlight catches dozens of shapes standing perfectly still in the cornfield outside. No readable text or logo.',
      "Holding out in a boarded farmhouse at night, a group of survivors has sealed every window except the one with the pet door. No readable text or logo.",
      'Inside a silent boarded farmhouse, the boards on one window have been pried off neatly and stacked on the floor inside. No readable text or logo.',
    ]),
    capture('Spaceport Evacuation Holdout', 'sci-fi evacuation defense screenshot', 'spaceport-evac', {
      aesthetic: 'Spaceport evacuation holdout: an original screenshot of soldiers holding a landing pad while civilians board the last transport under a burning alien sky.',
      subject_treatment: `${keep}; show the subject holding a landing pad during a desperate evacuation.`,
      color_and_tone: 'Burning orange sky, metal greys and warning lights.',
      lighting_and_shadow: "Engine glow and fire light, kept consistent across the whole image.",
      texture_and_material: "Metal decking, smoke and dust, kept consistent across the whole image.",
      camera_and_composition: "Wide third-person view of the pad, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with heroic urgency, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture without gore or HUD text, kept consistent across the whole image.",
      key_features: 'landing pad; last transport; burning sky; defenders',
    }, ['gore'], [
      'Holding the last landing pad under a burning alien sky, an original squad fires at crawling war-beasts while the final transport lifts off with its ramp still open. No readable text or logo.',
      'During a desperate spaceport evacuation, one passenger insists on bringing an enormous potted tree onto the last transport. No readable text or logo.',
      'On an evacuated spaceport at night, every ship has gone except one small shuttle with its lights on and engines running. No readable text or logo.',
    ]),
    capture('Lane-Battle Siege Capture', 'lane-based siege strategy screenshot', 'lane-siege', {
      aesthetic: 'Lane-battle siege capture: an original side-view strategy screenshot where two castles face each other across horizontal lanes and units march to clash in the middle.',
      subject_treatment: `${keep}; show the subject as units marching along lanes between two castles.`,
      color_and_tone: "Bright opposing team colors on green fields, kept consistent across the whole image.",
      lighting_and_shadow: "Flat bright light, kept consistent across the whole image.",
      texture_and_material: "Cartoon units, stone castles and grass lanes, kept consistent across the whole image.",
      camera_and_composition: "Side view with castles at both edges, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with playful tug-of-war, kept consistent across the whole image.",
      rendering_and_quality: "Clean readable capture with no UI text, kept consistent across the whole image.",
      key_features: 'opposing castles; horizontal lanes; marching units; clash',
    }, [], [
      'Marching along three lanes between two castles, an original army of blue knights clashes with red skeletons as a giant catapult-turtle lumbers down the middle lane. No readable text or logo.',
      "Meeting in the middle of the field between two castles, both marching armies stop and sit down together to share a picnic. No readable text or logo.",
      'Between two castles on a quiet lane, a single unit walks steadily toward the enemy gate, and no one on either side sent it. No readable text or logo.',
    ]),
    capture('Castle Builder Siege Overview', 'castle management siege screenshot', 'castle-builder', {
      aesthetic: 'Castle builder siege overview: an original top-down management screenshot of a castle town under siege, busy villagers, walls, farms and an army at the gates.',
      subject_treatment: `${keep}; show the subject within a busy castle town seen from above during a siege.`,
      color_and_tone: "Green fields, stone grey and banner colors, kept consistent across the whole image.",
      lighting_and_shadow: "Soft daylight with small shadows, kept consistent across the whole image.",
      texture_and_material: 'Tiny villagers, fields, wooden houses and stone walls.',
      camera_and_composition: "Top-down angled view over the whole town, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with busy defensive industry.',
      rendering_and_quality: "Tidy detailed capture with no UI, kept consistent across the whole image.",
      key_features: 'castle town; tiny villagers; siege army; top-down',
    }, [], [
      'Seen from above, an original castle town races to finish its walls as a besieging army of ogres arrives, while villagers carry stones and farmers herd sheep inside. No readable text or logo.',
      "Defending the walls of a besieged town seen from above, every villager fights except the baker, who keeps handing fresh bread over the parapet to the enemy. No readable text or logo.",
      'From above a quiet castle town, the fields are harvested and the gates are shut, and a single path of footprints leads out of the walls into the forest. No readable text or logo.',
    ]),
    capture('Massed Cavalry Charge Capture', 'large-scale battle cavalry screenshot', 'cavalry-charge', {
      aesthetic: 'Massed cavalry charge capture: an original large-scale battle screenshot of hundreds of horsemen charging across a plain into a pike line, dust and banners.',
      subject_treatment: `${keep}; show the subject in a vast cavalry charge with hundreds of riders.`,
      color_and_tone: "Dust ochre, banner colors and steel grey, kept consistent across the whole image.",
      lighting_and_shadow: "Low sun through dust clouds, kept consistent across the whole image.",
      texture_and_material: "Horse hides, armor, dust and grass, kept consistent across the whole image.",
      camera_and_composition: "Low wide angle along the charging line, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with thundering momentum, kept consistent across the whole image.",
      rendering_and_quality: "Epic crowd capture without gore or HUD, kept consistent across the whole image.",
      key_features: 'hundreds of riders; pike line; dust; banners',
    }, ['gore'], [
      'Thundering across an open plain at sunset, an original wave of hundreds of horsemen charges a pike line as a giant war-bear leads the front of the charge. No readable text or logo.',
      'In an epic cavalry charge across the plain, one horse has stopped to eat a very appealing patch of flowers while the rest thunder on. No readable text or logo.',
      'On a silent plain after a charge, the dust is settling, and a single riderless horse stands facing the camera. No readable text or logo.',
    ]),
    capture('Snowfield Artillery Duel Capture', 'winter artillery battle screenshot', 'snow-artillery', {
      aesthetic: 'Snowfield artillery duel capture: an original third-person screenshot of cannons firing across a white snowfield, black smoke, fir trees and distant muzzle flashes.',
      subject_treatment: `${keep}; show the subject crewing or dodging cannons across a snowfield.`,
      color_and_tone: 'White snow, black smoke and orange muzzle flash.',
      lighting_and_shadow: "Overcast light with bright flashes, kept consistent across the whole image.",
      texture_and_material: "Snow, cannon iron, wooden wheels and smoke, kept consistent across the whole image.",
      camera_and_composition: "Wide view across the snowfield, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with cold booming tension.',
      rendering_and_quality: "Clean capture without gore or HUD, kept consistent across the whole image.",
      key_features: 'snowfield; cannons; black smoke; muzzle flashes',
    }, ['gore'], [
      'Firing across a white snowfield, an original cannon crew watches a black smoke plume as a huge iron walking fortress emerges from the fir forest opposite. No readable text or logo.',
      'On a snowy battlefield, an artillery crew aims carefully and fires a shot that lands exactly on a snowman built by the other side. No readable text or logo.',
      'Across a silent snowfield, a single cannon stands abandoned, and snow has not settled on its still-warm barrel. No readable text or logo.',
    ]),
  ],
};

export default spec;
