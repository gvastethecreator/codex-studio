import type { Spec } from '../tools/apply';
import { ga } from './_authors';

// Video game pass, gothic and dungeon gameplay: each preset names its game, studio and year and
// states the real render technique and camera. The cave descent moves to Noita because the idol
// and boulder platformer already names Spelunky in the arcane category.
// Intentional-v1 presets (SP12-081 to SP12-098) keep their own policy and stay out of this pass.
const spec: Spec = {
  pack: 'pack_12',
  category: '9. Gothic & Dungeon Gameplay',
  updates: Object.fromEntries([
    ga('SP12-179', 'Children of Morta 2019 - Dead Mage Painterly Pixel', {
      look: 'Dead Mage Children of Morta (2019) look: top-down action roguelite in detailed painterly pixel art, family of heroes, crypts and caves with glowing spell effects.',
      subject: 'render people as detailed painterly pixel heroes seen from above.',
      color: 'Warm torch amber, crypt teal and spell glow.',
      light: 'Warm pixel torchlight pools and bright spell glow in dark crypts.',
      texture:
        'Painterly pixel art with soft color clusters and detailed hand-placed shading, seen from above.',
      camera: 'Top-down roguelite view.',
      mood: 'warm heroic struggle',
      render:
        'A 2019 frame at 1920 by 1080 of scaled pixels: small heroes in a crypt from above, portrait and bar shapes in a corner.',
      key: 'Children of Morta pixels; crypts; spell glow',
    }),
    ga('SP12-180', 'Salt and Sanctuary 2016 - Ska Studios Grim Hand-Drawn', {
      look: 'Ska Studios Salt and Sanctuary (2016) look: side-view hand-drawn grim fantasy, thick-lined gothic characters, towering bosses and moody castle halls.',
      subject: 'render people as thick-lined hand-drawn grim warriors.',
      color: 'Moonlit grey, rust and blood red.',
      light: 'Stained pale moonlight with deep flat shadows.',
      texture: 'Thick hand-drawn ink lines, muted flat colors and grim scratchy detail.',
      camera: 'Side-view castle view.',
      mood: 'grim gothic dread',
      render:
        'A 2016 side-view frame at 1920 by 1080: grim inked warrior facing a huge boss, bar shapes top left.',
      key: 'Salt and Sanctuary hand-drawn; side-view; bosses',
    }),
    ga('SP12-181', 'Legend of Grimrock 2012 - Almost Human Grid Dungeon', {
      look: 'Almost Human Legend of Grimrock (2012) look: first-person grid dungeon crawler with stone corridors, torches, pressure plates and real-time monsters.',
      subject: 'render people and monsters in stone corridors seen from first person.',
      color: 'Torch amber, stone grey and moss green.',
      light: 'Flickering torchlight fading quickly into dark stone corridors.',
      texture: 'Detailed stone blocks and iron gates with slightly soft repeating textures.',
      camera: 'First-person grid view.',
      mood: 'claustrophobic dungeon tension',
      render:
        'A 2012 first-person frame at 1920 by 1080: a square grid corridor, four party portrait boxes at the right edge.',
      key: 'Grimrock grid dungeon; torches; stone corridors',
    }),
    ga('SP12-182', 'Elden Ring 2022 - FromSoftware Lands Between', {
      look: 'FromSoftware Elden Ring (2022) look: third-person open-world dark fantasy, golden Erdtree light, colossal bosses, ruined arenas and lock-on duels.',
      subject: 'render people as weathered Tarnished warriors in mixed armor.',
      color: 'Golden light, ash grey and flame orange.',
      light: 'Golden light from a giant glowing tree in the sky, with fire glow below.',
      texture: 'Weathered stone and mixed armor, detailed but slightly soft in the distance.',
      camera: 'Third-person lock-on view.',
      mood: 'epic desperate duel',
      render:
        'A 2022 frame at 1920 by 1080 in third person: warrior facing a giant boss, bar shapes top left and a lock-on dot.',
      key: 'Elden Ring bosses; golden light; lock-on',
      avoid: ['existing Elden Ring bosses', 'a giant golden tree'],
    }),
    ga('SP12-183', 'Enter the Gungeon 2016 - Dodge Roll Pixel Bullet Hell', {
      look: 'Dodge Roll Enter the Gungeon (2016) look: top-down pixel bullet hell dungeon, gun puns, bullet-shaped enemies, spirals of glowing projectiles and dodge rolls.',
      subject: 'render people as small pixel gunslingers seen from above.',
      color: 'Dungeon grey and neon bullet colors.',
      light: 'Flat pixel light with bright glowing bullet dots everywhere.',
      texture: 'Detailed crisp pixel sprites and dungeon tiles seen from above.',
      camera: 'Top-down dungeon view.',
      mood: 'frantic bullet chaos',
      render:
        'A 2016 frame at 480 by 270 scaled up: small gunslinger sprite dodging a bullet-hell pattern, heart shapes top left.',
      key: 'Gungeon pixel bullets; top-down; bosses',
      avoid: ['bullet-shaped enemies with guns'],
    }),
    ga('SP12-184', 'Gauntlet 2014 - Arrowhead Co-op Dungeon', {
      look: 'Arrowhead Game Studios Gauntlet (2014) look: isometric co-op dungeon brawler, four color-coded heroes, endless goblin swarms, spawners and treasure.',
      subject: 'render people as four color-coded dungeon heroes.',
      color: 'Hero red, blue, green and gold.',
      light: 'Warm dungeon torchlight with glowing magic hits.',
      texture: 'Chunky stylized stone, gear and swarming monsters seen from a high angle.',
      camera: 'Isometric co-op view.',
      mood: 'chaotic co-op fun',
      render:
        'A 2014 frame at 1920 by 1080: four color-coded heroes in a dungeon, four portrait shapes at the corners.',
      key: 'Gauntlet co-op; four heroes; swarms',
      avoid: ['existing Gauntlet heroes'],
    }),
    ga('SP12-185', 'Alone in the Dark 1992 - Infogrames Polygon Manor', {
      look: 'Infogrames Alone in the Dark (1992) look: flat-shaded polygon characters over hand-drawn manor backgrounds, fixed camera angles and 1920s Lovecraftian dread.',
      subject:
        'show people as figures built from a few flat-colored untextured blocks, with simple dot faces, standing in painted rooms.',
      color: 'Muted manor browns and gloom.',
      light:
        'Gloomy light painted into the still room backgrounds, figures lit with flat solid colors.',
      texture:
        'Flat solid-color blocky figures with no texture, pasted over detailed hand-painted manor rooms.',
      camera: 'Fixed high angle.',
      mood: 'Lovecraftian manor dread',
      render:
        'A 1992 PC VGA frame at 320 by 200 from a fixed high camera: chunky pixels, blocky figure in a painted room.',
      key: 'Alone in the Dark flat-colored block figures; painted manor rooms; fixed camera',
    }),
    ga('SP12-186', 'Thief The Dark Project 1998 - Looking Glass Shadow Stealth', {
      look: 'Looking Glass Thief: The Dark Project (1998) look: first-person stealth in a gothic steampunk city, deep shadows, lanterns and boxy blocky guards.',
      subject:
        'show people as blocky guards and thieves with simple faces and stiff limbs, mostly lost in shadow.',
      color: 'Deep shadow and lantern amber.',
      light: 'Deep darkness broken by warm lantern pools, most of the screen near black.',
      texture: 'Blurry low-detail stone and wood textures on boxy architecture.',
      camera: 'First-person shadow view.',
      mood: 'tense sneaky patience',
      render:
        'A 1998 PC frame at 640 by 480 in first person: dark gothic street, a glowing gem-shaped light meter at the bottom center.',
      key: 'Thief deep shadows; lantern pools; boxy gothic city; light gem',
    }),
    ga('SP12-187', 'Hunt Showdown 2019 - Crytek Bayou Hunt', {
      look: 'Crytek Hunt: Showdown (2019) look: 1895 Louisiana bayou hunting of monsters, fog villages, gritty period weapons and realistic lighting.',
      subject: 'render people as gritty 1895 bounty hunters.',
      color: 'Fog grey, swamp green and lamplight.',
      light: 'Foggy dusk light over a swampy bayou.',
      texture: 'Realistic old wood, mud and period guns, grainy and a little soft.',
      camera: 'First-person hunting view.',
      mood: 'gritty monster hunt',
      render:
        'A 2019 first-person frame at 1920 by 1080: a lever rifle at the bottom, foggy bayou, small compass strip at the top.',
      key: 'Hunt Showdown bayou; fog; monsters',
    }),
    ga('SP12-188', 'Dungeon Keeper 1997 - Bullfrog Imp Dungeon', {
      look: 'Bullfrog Productions Dungeon Keeper (1997) look: top-down dungeon building, imps digging rock, lava rivers, trap rooms and heroes invading.',
      subject: 'render people as small cartoonish imps and heroes from above.',
      color: 'Lava orange and earth brown.',
      light: 'Orange lava glow in dark carved tunnels.',
      texture: 'Chunky blurry textures on blocky dungeon walls, small cartoon imp sprites.',
      camera: 'Top-down dungeon view.',
      mood: 'devilishly mischievous building',
      render:
        'A 1997 PC frame at 640 by 480 from above: blocky dungeon rooms, tiny imps digging, a side panel of blank buttons.',
      key: 'Dungeon Keeper imps; lava; traps',
    }),
    ga('SP12-189', 'Grim Dawn 2016 - Crate Gritty Isometric', {
      look: 'Crate Entertainment Grim Dawn (2016) look: gritty Victorian dark fantasy isometric ARPG, necromancers, graveyards, grim ruins and heavy particle effects.',
      subject: 'render people as gritty Victorian dark fantasy heroes.',
      color: 'Muted grey-brown with spell glows.',
      light: 'Grim overcast grey light with sickly green spell glow.',
      texture: 'Gritty detailed ground and ruins seen from a high diagonal.',
      camera: 'Isometric ARPG view.',
      mood: 'grim desperate war',
      render:
        'A 2016 PC frame at 1920 by 1080: small hero in ruins, red and blue orb shapes and a skill bar at the bottom.',
      key: 'Grim Dawn gritty; necromancer; isometric',
    }),
    ga('SP12-190', 'Noita 2020 - Nolla Games Falling-Pixel Physics', {
      look: 'Nolla Games Noita (2020) look: side-view roguelite where every pixel is simulated, burning, flowing and falling, caves of liquid, fire and chaotic spells.',
      subject: 'render people as tiny robed pixel wizards.',
      color: 'Deep cave dark with fire and toxic liquids.',
      light: 'Bright fire and spell glow on dark pixel caverns.',
      texture:
        'Every pixel simulated: sand falling, water flowing and fire spreading as tiny colored pixels.',
      camera: 'Side-view cave view.',
      mood: 'chaotic alchemical danger',
      render:
        'A 2020 frame at 480 by 270 scaled up: tiny robed wizard sprite in a cave where pixels burn and flow.',
      key: 'Noita pixel physics; fire; liquids',
    }),
    ga('SP12-191', 'Pillars of Eternity II 2018 - Obsidian Painted Deadfire', {
      look: 'Obsidian Entertainment Pillars of Eternity II: Deadfire (2018) look: painted isometric RPG of an archipelago, ship boarding, pirates, ghosts and rich painted scenes.',
      subject: 'render people as small painted isometric pirates and ghosts.',
      color: 'Fog grey, ghost green and sea teal.',
      light: 'Soft painted fog light over water and ships.',
      texture: 'Rich painted scenes seen from a high diagonal with small 3D figures.',
      camera: 'Isometric deck view.',
      mood: 'eerie piratical adventure',
      render:
        'A 2018 PC frame at 1920 by 1080: painted port with small pirates and a ghost, portrait boxes at the bottom.',
      key: 'Deadfire painted isometric; pirates; ghosts',
    }),
    ga('SP12-192', "Don't Starve 2013 - Klei Gothic Paper Cartoon", {
      look: "Klei Entertainment Don't Starve (2013) look: gothic Tim Burton-like paper cartoon survival, scratchy ink lines, campfire circles, shadow creatures and twisted forests.",
      subject: 'render people as scratchy gothic paper cartoon survivors.',
      color: 'Muted sepia and firelight.',
      light: 'A small circle of campfire light in total darkness.',
      texture: 'Scratchy ink lines, paper-cutout figures and grungy paper texture.',
      camera: 'Three-quarter overhead view.',
      mood: 'eerie gothic survival',
      render:
        'A 2013 frame at 1920 by 1080: gothic paper-cartoon survivor by a campfire, round gauge shapes top right.',
      key: "Don't Starve paper; campfire; shadows",
      avoid: ['a gentleman scientist with spiky hair'],
    }),
  ]),
};

export default spec;
