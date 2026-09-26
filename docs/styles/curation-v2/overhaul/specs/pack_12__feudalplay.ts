import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Video game originals vault, graphic and feudal gameplay: gameplay-frame captures. The six
// reference-titled originals get fully original card briefs; fourteen new descriptor-named gameplay
// looks add cel-shaded samurai duels, ink-brush brawlers, arena combo hack-and-slash, mounted
// archery, shinobi stealth, siege command, warband formations, hand-drawn feudal brawlers, spirit
// hunters, comic-panel action, directional swordplay, samurai tactics grids, gladiator arenas and
// lance jousts.
const play = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  avoid: string[],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'gameplay-capture', 'portable-style-study'],
  dna: dna(fields),
  avoid: [...avoid, 'existing game characters, logos or levels', 'readable interface text', 'gore', ...STYLE_AVOID],
  briefs,
});

const keep = 'Preserve the requested identity, count, pose and action with original characters';

const spec: Spec = {
  pack: 'pack_12',
  category: '10. Graphic & Feudal Gameplay',
  updates: {
    'SP12-087': { briefs: [
      'Trailing an original hulking horseman of the apocalypse in third person, the camera catches him hurling a giant scythe through a ruined city as winged demons scatter. No readable text or logo.',
      'In a stylized third-person ruin, a massively muscled warrior tries to squeeze through a narrow doorway designed for normal people. No readable text or logo.',
      'In a third-person view of a burned-out city, a colossal horse stands saddled in the rubble, its rider nowhere to be seen. No readable text or logo.',
    ] },
    'SP12-088': { briefs: [
      'Leaping across a side-scrolling procession of penitents, an original hooded warrior slashes at a colossal weeping statue that lurches down the cathedral nave. No readable text or logo.',
      'In a dark side-scrolling cathedral, a grim warrior has to wait while a very slow procession of hooded monks shuffles across the path. No readable text or logo.',
      "Lining a gothic side-scrolling hall, every carved statue weeps stone tears, except one whose painted eyes have quietly closed. No readable text or logo.",
    ] },
    'SP12-089': { briefs: [
      'Framed by a fixed dramatic camera in a feudal castle courtyard, an original samurai absorbs glowing demon souls into his gauntlet as horned ogres burst through a paper wall. No readable text or logo.',
      "In a fixed-camera throne hall, a proud warrior spends so long admiring his new armor that the demons have sat down to wait. No readable text or logo.",
      'From a fixed camera angle, a castle courtyard is silent at night, and a paper lantern drifts across it against the wind. No readable text or logo.',
    ] },
    'SP12-090': { briefs: [
      'Locked in a brutal melee on a castle rampart, an original knight and an armored viking warrior clash shields as a samurai climbs the wall behind them. No readable text or logo.',
      'On a crowded battlefield, a heavily armored warrior executes a perfect combo on an enemy, who turns out to be a practice dummy. No readable text or logo.',
      "Lying together on a fortress rampart after a battle, three helmets from three different factions still have their plumes stirring in the wind. No readable text or logo.",
    ] },
    'SP12-091': { briefs: [
      'Clashing on a 2.5D stage above a volcanic temple, an original fire monk and a lightning-armed ninja meet mid-air as molten rock rains behind them. No readable text or logo.',
      'On a 2.5D fighting stage, a fearsome fighter performs an elaborate special move while his opponent calmly steps aside and waves. No readable text or logo.',
      'On an empty 2.5D stage, the crowd in the background has frozen mid-cheer, all facing the camera. No readable text or logo.',
    ] },
    'SP12-092': { briefs: [
      'Advancing through a torchlit crypt in side-view, an original band of four desperate adventurers faces a pale swine-headed abbot rising from a pool of black water. No readable text or logo.',
      'In a side-view dungeon party, a heroic leper, a nervous jester and two others argue about who carries the torch. No readable text or logo.',
      'In a side-view crypt corridor, the torch dims to its last flicker, and a fifth silhouette appears at the back of the party. No readable text or logo.',
    ] },
  },
  creates: [
    play('Cel-Shaded Samurai Duel Gameplay', 'toon-shaded samurai duel gameplay', 'samurai-duel', {
      aesthetic: 'Cel-shaded samurai duel gameplay: an original third-person capture of a samurai duel with bold toon shading, falling leaves, wind lines and dramatic standoffs.',
      subject_treatment: `${keep}; show the subject in a cel-shaded samurai duel standoff.`,
      color_and_tone: "Autumn reds, gold light and deep shadow, kept consistent across the whole image.",
      lighting_and_shadow: "Two-tone cel shading and rim light, kept consistent across the whole image.",
      texture_and_material: "Flat shaded cloth, blades and leaves, kept consistent across the whole image.",
      camera_and_composition: "Low wide third-person standoff, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with tense stillness, kept consistent across the whole image.",
      rendering_and_quality: "Clean toon capture with no UI, kept consistent across the whole image.",
      key_features: 'cel shading; samurai standoff; falling leaves; wind lines',
    }, [], [
      'Standing in a field of red maple leaves, an original samurai faces a masked rival as wind lines whip between them in bold toon-shaded light. No readable text or logo.',
      'In a dramatic cel-shaded duel, two samurai stare each other down for so long that a squirrel has fallen asleep between them. No readable text or logo.',
      'In a toon-shaded field at dusk, a single samurai stands facing an opponent who is only a shadow cast by nothing. No readable text or logo.',
    ]),
    play('Ink-Brush Brawler Gameplay', 'sumi-ink action gameplay', 'ink-brawler', {
      aesthetic: 'Ink-brush brawler gameplay: an original action capture where every character and strike is painted in wet black ink with splashes of red, on a rice-paper world.',
      subject_treatment: `${keep}; render the subject as a wet ink-painted fighter in an ink-wash world.`,
      color_and_tone: "Black ink, paper white and red accents, kept consistent across the whole image.",
      lighting_and_shadow: "Ink density instead of light, kept consistent across the whole image.",
      texture_and_material: "Brush splashes, dry brush and paper grain, kept consistent across the whole image.",
      camera_and_composition: "Side-on action with splash effects, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with explosive calligraphic energy.',
      rendering_and_quality: "Clean ink capture with no UI, kept consistent across the whole image.",
      key_features: 'ink-painted fighters; splash strikes; rice paper; red accents',
    }, [], [
      'Slashing through a horde of ink-blot demons, an original ronin leaves arcs of wet black brush strokes across a rice-paper battlefield splashed with red. No readable text or logo.',
      'In an ink-painted brawler, a fearsome warrior slips on his own ink splash and lands in a comical blot. No readable text or logo.',
      'On a rice-paper battlefield, a single ink figure stands alone, and the brush strokes around it are slowly fading. No readable text or logo.',
    ]),
    play('Arena Combo Hack-and-Slash Gameplay', 'stylish combo action gameplay', 'combo-arena', {
      aesthetic: 'Arena combo hack-and-slash gameplay: an original stylish action capture of a hero juggling enemies mid-air, flashy weapon trails and a gothic arena.',
      subject_treatment: `${keep}; show the subject mid-combo juggling enemies in a stylish arena.`,
      color_and_tone: "Dark arena with vivid weapon-trail colors, kept consistent across the whole image.",
      lighting_and_shadow: "Flashy effect lighting and rim light, kept consistent across the whole image.",
      texture_and_material: "Gothic stone, coat flare and weapon glow, kept consistent across the whole image.",
      camera_and_composition: "Dynamic low angle in the air, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with swaggering flair, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no combo text, kept consistent across the whole image.",
      key_features: 'air juggle; weapon trails; stylish hero; gothic arena',
    }, ['combo text'], [
      'Juggling three demons mid-air with a greatsword and twin pistols, an original stylish hunter flips over a stained-glass window as it shatters around him. No readable text or logo.',
      'In a flashy combo arena, a hero performs an incredible string of attacks on an enemy that has already given up and is holding a white flag. No readable text or logo.',
      'In an empty gothic arena, the weapon trails of a battle still hang in the air, glowing, with no fighters left. No readable text or logo.',
    ]),
    play('Mounted Archery Plains Gameplay', 'horseback archery gameplay', 'mounted-archery', {
      aesthetic: 'Mounted archery plains gameplay: an original third-person capture of a rider shooting arrows at full gallop across windswept steppe grass.',
      subject_treatment: `${keep}; show the subject shooting a bow from a galloping horse on open plains.`,
      color_and_tone: 'Golden grass, wide blue sky and earth tones.',
      lighting_and_shadow: "Low sun with long shadows, kept consistent across the whole image.",
      texture_and_material: "Wind-bent grass, leather and horsehair, kept consistent across the whole image.",
      camera_and_composition: "Chase camera beside the galloping horse, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with wild freedom, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no UI, kept consistent across the whole image.",
      key_features: 'horseback archery; galloping; steppe grass; low sun',
    }, [], [
      'Galloping across a windswept steppe, an original horse archer turns in the saddle to loose an arrow at a giant hawk swooping down on the herd. No readable text or logo.',
      'On the open plains, a skilled horse archer fires perfectly while his horse is clearly more interested in the flowers. No readable text or logo.',
      'On a vast steppe at dusk, a riderless horse gallops past with a quiver full of arrows still strapped to the saddle. No readable text or logo.',
    ]),
    play('Third-Person Shinobi Stealth Gameplay', 'ninja stealth action gameplay', 'shinobi-stealth', {
      aesthetic: 'Third-person shinobi stealth gameplay: an original capture of a ninja crouched on castle rooftops at night, patrols below, grappling lines and moonlight.',
      subject_treatment: `${keep}; show the subject as a crouching shinobi above patrolling guards at night.`,
      color_and_tone: "Moonlit blue, tile black and lantern amber, kept consistent across the whole image.",
      lighting_and_shadow: "Moonlight rims and guard lanterns, kept consistent across the whole image.",
      texture_and_material: "Roof tiles, cloth wraps and grappling rope, kept consistent across the whole image.",
      camera_and_composition: "Over-the-shoulder looking down on guards, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with silent precision, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no UI, kept consistent across the whole image.",
      key_features: 'shinobi; castle rooftops; patrols below; moonlight',
    }, [], [
      'Crouched on a castle rooftop under a full moon, an original shinobi watches a patrol pass below as a grappling line stretches toward the keep where a demon lord waits. No readable text or logo.',
      'On a moonlit rooftop, a stealthy ninja is spotted immediately because a stray cat keeps following him and meowing. No readable text or logo.',
      "Catching on the eaves of a pagoda roof at night, the ninja's grappling hook holds fast, and the rope is being pulled taut from the other end. No readable text or logo.",
    ]),
    play('Castle Siege Command Gameplay', 'feudal siege strategy gameplay', 'siege-command', {
      aesthetic: 'Castle siege command gameplay: an original strategy capture of commanding a feudal siege from above, battering rams, ladders, archers and burning towers.',
      subject_treatment: `${keep}; show the subject as units in a feudal siege seen from a commanding height.`,
      color_and_tone: "Earth tones, stone grey and fire orange, kept consistent across the whole image.",
      lighting_and_shadow: "Smoke-filtered daylight and fire, kept consistent across the whole image.",
      texture_and_material: "Stone walls, wooden siege engines and banners, kept consistent across the whole image.",
      camera_and_composition: "High angled strategy view, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with commanding strategy, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no UI, kept consistent across the whole image.",
      key_features: 'siege engines; castle walls; archers; high view',
    }, [], [
      'From a high command view, an original army storms a mountain castle with siege towers and rams as burning arrows arc over the moat like a rain of comets. No readable text or logo.',
      'In a grand siege from above, the entire army waits at the gate because nobody remembered to bring the battering ram. No readable text or logo.',
      'From above, the siege has ended, the castle gates stand open, and a single banner inside has been changed in the night. No readable text or logo.',
    ]),
    play('Warband Formation Battle Gameplay', 'medieval formation battle gameplay', 'warband', {
      aesthetic: 'Warband formation battle gameplay: an original third-person capture from inside a shield wall as two medieval formations collide on a muddy field.',
      subject_treatment: `${keep}; place the subject within a shield wall formation in a medieval battle.`,
      color_and_tone: "Mud brown, faded banners and steel grey, kept consistent across the whole image.",
      lighting_and_shadow: "Overcast light and dust, kept consistent across the whole image.",
      texture_and_material: "Shields, mud, mail and pole weapons, kept consistent across the whole image.",
      camera_and_composition: "Low third-person within the formation, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with crushing collective force.',
      rendering_and_quality: "Clean capture without gore or UI, kept consistent across the whole image.",
      key_features: 'shield wall; formations colliding; muddy field; banners',
    }, ['gore'], [
      'Braced inside a shield wall as the enemy line crashes in, an original warrior sees a giant war-bear break through the formation beside her. No readable text or logo.',
      'Inside a shield wall, a nervous soldier realizes he is holding his shield upside down, and his neighbors have noticed. No readable text or logo.',
      'On a muddy field after the formations have left, a single shield stands upright, planted in the ground facing the empty enemy line. No readable text or logo.',
    ]),
    play('Hand-Drawn Feudal Brawler Gameplay', '2D hand-drawn feudal action gameplay', 'feudal-brawler', {
      aesthetic: 'Hand-drawn feudal brawler gameplay: an original side-scrolling capture with hand-animated warriors, bold outlines and painted feudal villages under attack.',
      subject_treatment: `${keep}; show the subject as a hand-drawn warrior in a side-scrolling feudal brawl.`,
      color_and_tone: "Warm painted backgrounds with bold character colors, kept consistent across the whole image.",
      lighting_and_shadow: "Painted light and flat character shadows, kept consistent across the whole image.",
      texture_and_material: "Hand-inked lines, painted wood and paper walls, kept consistent across the whole image.",
      camera_and_composition: "Side-on lane with foreground and background, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with lively feudal action.',
      rendering_and_quality: "Clean hand-drawn capture with no UI, kept consistent across the whole image.",
      key_features: 'hand-drawn warriors; side-scrolling; painted village; bold outlines',
    }, [], [
      'Fighting across a hand-painted feudal village, an original swordswoman leaps between rooftops as oni raiders set the rice fields alight behind her. No readable text or logo.',
      "Having defeated every bandit in a painted feudal village, a heroic warrior is chased off by an angry grandmother with a broom. No readable text or logo.",
      "Glowing in a painted village at dusk after the villagers have gone indoors, one paper window shows a large shadow moving behind it. No readable text or logo.",
    ]),
    play('Spirit Hunter Action Gameplay', 'folklore spirit hunting action gameplay', 'spirit-hunter', {
      aesthetic: 'Spirit hunter action gameplay: an original third-person capture of a hunter fighting folklore spirits in a moonlit shrine, talismans, glowing spirit trails and mist.',
      subject_treatment: `${keep}; show the subject battling folklore spirits in a moonlit shrine.`,
      color_and_tone: "Moonlit blue, spirit violet and talisman gold, kept consistent across the whole image.",
      lighting_and_shadow: "Spirit glow and moonlight, kept consistent across the whole image.",
      texture_and_material: "Shrine wood, paper talismans and mist, kept consistent across the whole image.",
      camera_and_composition: "Third-person with spirits circling, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with eerie folklore action.',
      rendering_and_quality: "Clean capture with no readable talismans, kept consistent across the whole image.",
      key_features: 'folklore spirits; moonlit shrine; talismans; spirit trails',
    }, ['readable talisman text'], [
      'Hurling glowing talismans in a moonlit shrine, an original spirit hunter pins a giant umbrella spirit to a torii gate as foxfire spins around her. No readable text or logo.',
      'In a moonlit shrine, a spirit hunter prepares a powerful seal, and the mischievous spirit steals her talismans one by one. No readable text or logo.',
      'At a shrine at midnight, a row of paper lanterns lights up one by one, leading toward the hunter from the dark forest. No readable text or logo.',
    ]),
    play('Comic-Panel Action Gameplay', 'comic-book panel action gameplay', 'comic-panel', {
      aesthetic: 'Comic-panel action gameplay: an original capture where the game world is split into comic-book panels, bold inks, halftone shading and action spilling across borders.',
      subject_treatment: `${keep}; show the subject fighting across comic-book panels with action breaking the borders.`,
      color_and_tone: 'Bold inks with flat comic colors and halftone.',
      lighting_and_shadow: "Heavy ink shadows, kept consistent across the whole image.",
      texture_and_material: "Panel borders, halftone dots and paper, kept consistent across the whole image.",
      camera_and_composition: "Multi-panel page with a dominant action panel, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with pulpy momentum, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no speech bubbles, kept consistent across the whole image.",
      key_features: 'comic panels; halftone; action across borders; bold inks',
    }, ['speech bubbles or lettering'], [
      'Punching through the border between two comic panels, an original masked vigilante sends a feudal warlord flying into the next panel in a burst of halftone dots. No readable text or logo.',
      "Leaping from frame to frame across a printed page, a hero lands in the gutter and gets stuck between two panels. No readable text or logo.",
      "Filling a printed page, every frame shows the hero, except the last one, which shows only the reader's own room. No readable text or logo.",
    ]),
    play('Directional Swordplay Duel Gameplay', 'stance-based sword duel gameplay', 'stance-duel', {
      aesthetic: 'Directional swordplay duel gameplay: an original third-person capture of a tense sword duel where fighters shift stances high, left and right in heavy armor.',
      subject_treatment: `${keep}; show the subject in a tense heavy-armor sword duel of shifting stances.`,
      color_and_tone: "Steel grey, torchlight and faction colors, kept consistent across the whole image.",
      lighting_and_shadow: "Torchlit courtyard with sparks, kept consistent across the whole image.",
      texture_and_material: "Plate armor, chain mail and stone, kept consistent across the whole image.",
      camera_and_composition: "Over-the-shoulder facing the opponent, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with measured tension, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no stance UI, kept consistent across the whole image.",
      key_features: 'heavy armor duel; shifting stances; sparks; courtyard',
    }, ['stance indicators'], [
      'Circling in a torchlit courtyard, an original armored knight shifts to a high guard as her opponent\'s blade throws sparks off her pauldron. No readable text or logo.',
      'In a tense heavy-armor duel, two fighters mirror each other\'s stances so perfectly that they both give up and shake hands. No readable text or logo.',
      'In a torchlit courtyard, a single fighter stands in guard, facing her own reflection in a polished shield propped against the wall. No readable text or logo.',
    ]),
    play('Samurai Tactics Grid Gameplay', 'feudal turn-based tactics gameplay', 'samurai-tactics', {
      aesthetic: 'Samurai tactics grid gameplay: an original isometric turn-based capture of feudal units on a grid in a mountain temple, clan banners and movement tiles.',
      subject_treatment: `${keep}; show the subject as feudal units on an isometric tactics grid.`,
      color_and_tone: "Earthy temple tones with clan color accents, kept consistent across the whole image.",
      lighting_and_shadow: "Soft daylight and tile highlights, kept consistent across the whole image.",
      texture_and_material: "Stone steps, wood, banners and grid tiles, kept consistent across the whole image.",
      camera_and_composition: "Isometric grid view, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with patient strategy, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no UI numbers, kept consistent across the whole image.",
      key_features: 'isometric grid; feudal units; clan banners; temple',
    }, [], [
      'On an isometric grid in a mountain temple, an original squad of samurai, archers and a monk surrounds a giant armored oni on the temple steps. No readable text or logo.',
      'In a feudal tactics grid, a master strategist moves every unit perfectly, except for one archer who is facing the wrong way. No readable text or logo.',
      'On an isometric temple grid, one tile glows as if selected, but no unit on either side has chosen it. No readable text or logo.',
    ]),
    play('Gladiator Arena Crowd Gameplay', 'arena combat gameplay', 'gladiator-arena', {
      aesthetic: 'Gladiator arena crowd gameplay: an original third-person capture of gladiators fighting in a sunlit sand arena, roaring crowd, beasts and emperor box.',
      subject_treatment: `${keep}; show the subject fighting in a sunlit sand arena before a crowd.`,
      color_and_tone: "Bright sand, sun gold and crowd colors, kept consistent across the whole image.",
      lighting_and_shadow: "Harsh midday sun and dust, kept consistent across the whole image.",
      texture_and_material: "Sand, bronze armor and stone tiers, kept consistent across the whole image.",
      camera_and_composition: 'Low angle with the crowd in the tiers.',
      atmosphere_and_mood: "Keep the requested mood with roaring spectacle, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture without gore or UI, kept consistent across the whole image.",
      key_features: 'sand arena; roaring crowd; gladiators; beasts',
    }, ['gore'], [
      'Facing a chariot pulled by two lions in a roaring sand arena, an original gladiator raises a net and trident as the emperor leans forward in his box. No readable text or logo.',
      'In a packed arena, a fearsome gladiator is booed by the crowd because he refused to fight a friendly tortoise. No readable text or logo.',
      'In an empty sunlit arena after the games, the sand has been raked smooth except for a single line of footprints to the center. No readable text or logo.',
    ]),
    play('Horseback Lance Joust Gameplay', 'tournament joust gameplay', 'joust', {
      aesthetic: 'Horseback lance joust gameplay: an original first- or third-person capture of a tournament joust, lances lowered, splintering wood and banner-lined lists.',
      subject_treatment: `${keep}; show the subject charging in a tournament joust with lance lowered.`,
      color_and_tone: "Bright heraldic banners, green field and steel, kept consistent across the whole image.",
      lighting_and_shadow: "Clear daylight and dust, kept consistent across the whole image.",
      texture_and_material: "Splintering lances, caparisons and armor, kept consistent across the whole image.",
      camera_and_composition: "Down the tilt barrier toward the opponent, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with chivalric impact, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no UI, kept consistent across the whole image.",
      key_features: 'joust; lowered lances; tilt barrier; banners',
    }, [], [
      'Charging down the tilt barrier with lance lowered, an original knight meets a rival whose lance explodes into splinters across the banner-lined lists. No readable text or logo.',
      'At a grand tournament, a proud knight charges down the lists while his horse decides at the last moment to stop for a snack. No readable text or logo.',
      'At the far end of the lists, the opposing knight is waiting, visor closed, and his horse is standing perfectly still in a cloud of dust. No readable text or logo.',
    ]),
  ],
};

export default spec;
