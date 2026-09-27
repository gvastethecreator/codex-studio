import type { Spec } from '../tools/apply';
import { ga, keep } from './_authors';

// Video game pass, sieges, warfronts and last stands: each preset names its game, studio and
// year and states the real render technique and camera. Briefs that restaged a game's own
// heroes or units (the four colored knights, the horned giants, the lane armies) are replaced.
const spec: Spec = {
  pack: 'pack_12',
  category: '4. Sieges, Warfronts & Last Stands',
  updates: Object.fromEntries([
    ga('SP12-007', 'The Banner Saga 2014 - Stoic Hand-Painted Saga', {
      look: 'Stoic The Banner Saga (2014) look: hand-animated 2D in the Eyvind Earle and Sleeping Beauty tradition, flat painted Norse landscapes, caravans on snow and turn-based tactical grids.',
      subject:
        'render people as hand-animated Norse figures with clean flat shapes, fur, braids and weathered armor.',
      color: 'Muted snow blue, birch white, ochre and deep red banners.',
      light: 'Soft flat painted light with pale winter skies.',
      texture: 'Hand-painted flat backgrounds and clean hand-drawn animation lines.',
      camera: 'Side tactical grid view or wide caravan landscape.',
      mood: 'weary stoic endurance',
      render:
        'A 2014 frame at 1920 by 1080: flat painted Norse landscape with a small caravan or a tactical grid of hand-animated figures, banner shapes at the bottom.',
      key: 'Banner Saga Eyvind Earle painting; caravans; tactical grid',
      avoid: ['horned giant warriors', 'stone-armored invaders of the source game'],
      briefs: [
        'Holding a frozen bridge on a hand-painted tactical grid, an original band of towering bearded shieldbearers and archers faces a column of bark-armored raiders marching out of a snowstorm. No readable text or logo.',
        'On a painted snowy battlefield, a towering bearded warrior waits for his turn while a tiny archer spends forever deciding where to move. No readable text or logo.',
        keep('SP12-007')[2],
      ],
    }),
    ga('SP12-009', 'Castle Crashers 2008 - The Behemoth Cartoon Brawl', {
      look: 'The Behemoth Castle Crashers (2008) look: Dan Paladin thick-outline 2D cartoon, round-headed characters with simple faces, bright flat colors and side-scrolling co-op brawling.',
      subject:
        'render people as round-headed thick-outline cartoon figures with tiny dot eyes and chunky gear.',
      color: 'Bright flat grass green, sky blue and primary colors.',
      light:
        'Flat cartoon colors with no gradients and no shadows except a dark oval under each figure.',
      texture:
        'Thick black outlines and flat vector color fills, simple scribbly grass and castle walls.',
      camera: 'Side-scrolling brawler view.',
      mood: 'silly co-op mayhem',
      render:
        'A 2008 Xbox 360 side-view frame at 1280 by 720: four round-headed knights brawling, portrait and bar shapes along the top.',
      key: 'Castle Crashers thick outlines; round heads; co-op brawl',
      avoid: ['four knights in red, green, blue and orange armor', 'animal orb companions'],
      briefs: [
        'Storming a cartoon castle in thick outlines, four original rescuers, a baker, a beekeeper, a lumberjack and a nun, bash through a gate as a giant barbarian chief throws a battering ram at them. No readable text or logo.',
        'In a thick-outlined cartoon siege, a beekeeper triumphantly rescues a princess, who immediately rescues his pet owl from a tree. No readable text or logo.',
        keep('SP12-009')[2],
      ],
    }),
    ga('SP12-026', 'Tactics Ogre 1995 - Quest Isometric Sprite Tactics', {
      look: 'Quest Tactics Ogre: Let Us Cling Together (1995) look: isometric tactical RPG with Akihiko Yoshida character designs as small detailed sprites on tiered tile maps of ruins and highlands.',
      subject:
        'show people as small detailed pixel sprites with long elegant proportions, standing on tiered diagonal terrain.',
      color: 'Muted earth, vine green and faded medieval blue.',
      light: 'Soft even pixel colors on stacked diagonal tiles with no cast shadows.',
      texture:
        'Crisp square pixels, detailed small sprites and textured stone and grass tiles stacked in tiers.',
      camera: 'Isometric view over tiered tile maps.',
      mood: 'grave political war',
      render:
        'A 1995 Super Nintendo frame at 256 by 224: a diagonal battlefield of stacked pixel tiles, a small status box in a corner.',
      key: 'Tactics Ogre isometric; Yoshida sprites; tiered ruins',
    }),
    ga('SP12-035', 'Monster Train 2020 - Shiny Shoe Infernal Floors', {
      look: 'Shiny Shoe Monster Train (2020) look: roguelike deckbuilder on a hellish train with three stacked floors plus the burning pyre, cartoon demon units and flame-orange card effects.',
      subject:
        'render every subject as cartoon demon units and cards battling on stacked train floors.',
      color: 'Infernal orange, ember red and deep purple.',
      light: 'Warm pyre fire glow and bright flashes when cards are played.',
      texture:
        'Clean chunky cartoon 3D creatures standing on train floors, flat card frames in hand.',
      camera: 'Side view of stacked train floors.',
      mood: 'fiery strategic chaos',
      render:
        'A 2020 PC frame at 1920 by 1080: a vertical stack of train floors with cartoon demons, a fan of blank cards along the bottom.',
      key: 'Monster Train stacked floors; pyre; demon cards',
    }),
    ga('SP12-038', 'World of Warships 2015 - Wargaming Naval Broadside', {
      look: 'Wargaming World of Warships (2015) look: realistic naval combat with detailed WWII-style battleships, shell tracers arcing across open ocean, smoke screens and third-person ship camera.',
      subject: 'render vessels as detailed realistic warships seen from a third-person camera.',
      color: 'Steel grey, ocean blue and tracer orange.',
      light: 'Stormy grey daylight with muzzle flashes and orange shell trails.',
      texture:
        'Realistic hulls, white water spray and black gun smoke, slightly soft in the distance.',
      camera: 'Third-person naval camera.',
      mood: 'thunderous naval clash',
      render:
        'A 2015 PC frame at 1920 by 1080 from a camera behind the ship: shell arcs, a minimap square and ship bar shapes at the bottom.',
      key: 'World of Warships broadside; tracers; naval camera',
    }),
    ga('SP12-052', 'Overwatch 2016 - Blizzard Hero Payload', {
      look: 'Blizzard Overwatch (2016) look: bright animated-film stylized 3D, chunky readable hero silhouettes, colorful near-future maps and payload escort objectives.',
      subject:
        'render people as colorful animated-film heroes with exaggerated readable silhouettes.',
      color: 'Bright optimistic orange, teal and sunny whites.',
      light: 'Warm clean daylight with soft bounce light, colors bright and friendly.',
      texture: 'Smooth painted surfaces, clean readable shapes and chunky colorful costumes.',
      camera: 'First-person view with a stylized weapon.',
      mood: 'hopeful team heroics',
      render:
        'A 2016 first-person frame at 1920 by 1080: a chunky colorful weapon in hand, teammates ahead, an ability icon row at the bottom.',
      key: 'Overwatch animated-film heroes; payload; bright maps',
      avoid: ['existing Overwatch heroes'],
    }),
    ga('SP12-060', 'Blasphemous 2019 - The Game Kitchen Pixel Penance', {
      look: 'The Game Kitchen Blasphemous (2019) look: dark detailed pixel art metroidvania steeped in Andalusian Holy Week imagery, baroque basilicas, grotesque religious enemies and penitent suffering.',
      subject:
        'render people as detailed dark pixel sprites in religious robes, thorns and baroque armor.',
      color: 'Bone white, dried blood red, candle gold and black stone.',
      light: 'Candle halos and stained-glass shafts in deep shadow.',
      texture:
        'Dense detailed pixel art with baroque gold ornament, thorns and robes, crisp square pixels throughout.',
      camera: 'Side-view metroidvania frame.',
      mood: 'penitent grotesque solemnity',
      render:
        'A 2019 side-view frame at 640 by 360 scaled up: dark pixel cathedral, a small penitent sprite, a thorned bar shape top left.',
      key: 'Blasphemous pixels; Holy Week; baroque grotesque',
      avoid: ['a penitent in a tall spiked capirote helm'],
    }),
    ga('SP12-064', 'They Are Billions 2019 - Numantian Steampunk Horde', {
      look: 'Numantian Games They Are Billions (2019) look: isometric steampunk colony defense with painted 2D units, wooden walls, turrets and hordes of thousands pouring out of the fog.',
      subject:
        'render people as tiny painted steampunk soldiers and colonists facing massive hordes.',
      color: 'Steampunk brass, fog grey and night blue.',
      light: 'Night fog with turret muzzle flashes and small lamp glows.',
      texture: 'Detailed painted 2D buildings and tiny units seen from high on a diagonal.',
      camera: 'Isometric strategy view.',
      mood: 'desperate horde defense',
      render:
        'A 2019 PC frame at 1920 by 1080: tiny colony walls, a vast grey horde massing in fog, resource shapes at the top.',
      key: 'They Are Billions hordes; steampunk walls; isometric',
    }),
    ga('SP12-076', 'Northgard 2018 - Shiro Norse Isometric Clans', {
      look: 'Shiro Games Northgard (2018) look: stylized isometric Norse settlement strategy, cartoonish chunky villagers, snowy tiles, aurora skies and mythical creatures.',
      subject: 'render people as chunky stylized Norse villagers and warriors.',
      color: 'Snow white, aurora green and warm hearth orange.',
      light: 'Soft winter light with green aurora glow on snow.',
      texture:
        'Chunky simple shapes with soft painted colors and no fine detail, rounded roofs and trees.',
      camera: 'Isometric strategy view.',
      mood: 'hardy clan survival',
      render:
        'A 2018 PC frame at 1920 by 1080 from a high diagonal: small Norse village in snow, resource shapes at the top.',
      key: 'Northgard isometric; Norse clans; aurora',
    }),
    ga('SP12-079', 'Helldivers 2 2024 - Arrowhead Orbital Drop', {
      look: 'Arrowhead Game Studios Helldivers 2 (2024) look: third-person co-op shooter with satirical military propaganda tone, orbital drops, strategems beams, alien bug swarms and fiery skies.',
      subject: 'render people as armored troopers in heavy helmets and capes.',
      color: 'Fire orange, alien acid and military yellow.',
      light: 'Burning orange skies and bright white orbital strike flashes.',
      texture: 'Gritty armor, dust clouds and alien bug carapace, with heavy particle smoke.',
      camera: 'Third-person over-the-shoulder view.',
      mood: 'chaotic satirical heroism',
      render:
        'A 2024 frame at 1920 by 1080 in third person over the shoulder: trooper firing at a bug swarm, a small compass strip at the top.',
      key: 'Helldivers orbital drop; bug swarm; beacons',
      avoid: ['existing Helldiver armor and insignia'],
    }),
    ga('SP12-129', 'Orcs Must Die 2011 - Robot Entertainment Trap Defense', {
      look: 'Robot Entertainment Orcs Must Die! (2011) look: comic stylized third-person trap defense, cartoon orc and goblin hordes, fortress corridors, traps and exaggerated effects.',
      subject: 'render people as comic stylized cartoon defenders facing cartoon hordes.',
      color: 'Warm torch orange, stone grey and goblin green.',
      light: 'Warm torch light and bright trap flashes in stone halls.',
      texture: 'Chunky stylized painted 3D, exaggerated cartoon orcs and simple stone walls.',
      camera: 'Third-person view behind the defender.',
      mood: 'gleeful horde defense',
      render:
        'A 2011 frame at 1920 by 1080 in third person: defender facing a cartoon horde in a hallway, trap icon row at the bottom.',
      key: 'Orcs Must Die hordes; trap defense; comic stylized',
    }),
    ga('SP12-130', 'Battlefield 1 2016 - DICE Great War Trenches', {
      look: 'DICE Battlefield 1 (2016) look: first-person Great War trenches, mud, barbed wire, early tanks, smoke, sepia-tinted skies and cinematic Frostbite lighting.',
      subject: 'render people as Great War soldiers in wool uniforms, helmets and gas masks.',
      color: 'Mud brown, smoke grey and sepia sky.',
      light: 'Hazy grey daylight with flare glow and smoke columns.',
      texture: 'Mud, barbed wire, wood and wool, sharp nearby and dissolving into smoke beyond.',
      camera: 'First-person view over a trench lip.',
      mood: 'harrowing wartime dread',
      render:
        'A 2016 first-person frame at 1920 by 1080: rifle at bottom right, trench and smoke, a small compass and minimap shape.',
      key: 'Battlefield 1 trenches; mud; smoke; war machines',
    }),
    ga('SP12-131', 'Chivalry 2 2021 - Torn Banner Siege Crew', {
      look: 'Torn Banner Studios Chivalry 2 (2021) look: chaotic medieval siege battles, catapults and trebuchets, burning castles, shouting crews and bright banners.',
      subject: 'render people as grubby medieval soldiers and siege crews in padded jackets.',
      color: 'Banner red, siege fire orange and stone grey.',
      light: 'Bright daylight with fire glow and drifting smoke.',
      texture: 'Mud, wood, leather and smoke, slightly soft game-engine detail.',
      camera: 'First-person view behind siege engines.',
      mood: 'rowdy medieval chaos',
      render:
        'A 2021 first-person frame at 1920 by 1080: a raised weapon at bottom right, siege crews and burning castle walls, bar shapes bottom left.',
      key: 'Chivalry 2 siege; catapults; burning castles',
    }),
    ga('SP12-132', 'Battle for Wesnoth 2005 - Wesnoth Painted Hex', {
      look: 'Battle for Wesnoth (2005) look: turn-based fantasy strategy on painted hex maps, small painted unit sprites, rivers, castles and mountain hexes.',
      subject: 'render people as small painted fantasy unit sprites standing on hexes.',
      color: 'Painted greens, river blue and parchment.',
      light: 'Even top light on painted hex terrain.',
      texture:
        'Painted hex tiles of forest, water and hills, small crisp painted unit sprites standing on them.',
      camera: 'Top-down hex map view.',
      mood: 'thoughtful tactical campaign',
      render:
        'A 2005 PC frame at 1024 by 768: hex map with units and a side panel of blank boxes at the right.',
      key: 'Wesnoth painted hexes; unit sprites; fantasy map',
    }),
    ga('SP12-133', 'Resident Evil 7 2017 - Capcom Louisiana Farmhouse', {
      look: 'Capcom Resident Evil 7: Biohazard (2017) look: first-person horror in a rotting Louisiana farmhouse, photoreal decay, VHS found-footage grain, flashlight beams and humid dread.',
      subject:
        'render people as ordinary survivors in dirty everyday clothes, seen from first person.',
      color: 'Rotting brown, humid green and flashlight white.',
      light: 'A narrow flashlight beam in heavy darkness, everything outside it lost in black.',
      texture: 'Photoreal rot, mold and wet wood, grainy in the dark areas.',
      camera: 'First-person view at boarded windows.',
      mood: 'humid claustrophobic terror',
      render:
        'A 2017 first-person frame at 1920 by 1080: a hand holding a flashlight at the bottom, dark farmhouse hallway, no other interface.',
      key: 'RE7 farmhouse; photoreal rot; flashlight',
      avoid: ['existing Baker family members'],
    }),
    ga('SP12-134', 'Halo Reach 2010 - Bungie Last Stand', {
      look: 'Bungie Halo: Reach (2010) look: doomed planet last stand, burning skies, armored super-soldiers, alien war-beasts, spaceports and evacuation transports.',
      subject: 'render people as chunky armored soldiers under a burning alien sky.',
      color: 'Burning orange sky, steel grey and plasma blue.',
      light: 'Orange fire glow across the sky with blue plasma flashes.',
      texture: 'Chunky armor plates and scorched metal, clean but simple shapes.',
      camera: 'First-person view at a landing pad.',
      mood: 'doomed heroic sacrifice',
      render:
        'A 2010 Xbox 360 first-person frame at 1280 by 720: a rifle at bottom right, burning skyline, a small radar circle bottom left.',
      key: 'Halo Reach last stand; burning sky; evacuation',
      avoid: ['green armored super-soldier with gold visor', 'existing Covenant species'],
    }),
    ga('SP12-135', 'Clash Royale 2016 - Supercell Cartoon Arena', {
      look: 'Supercell Clash Royale (2016) look: bright chunky cartoon mobile arena, two towers per side, lanes across a river bridge and tiny exaggerated units.',
      subject: 'render every subject as a tiny chunky exaggerated cartoon unit.',
      color: 'Bright grass green, blue and red teams.',
      light: 'Bright flat cartoon daylight with little shadow.',
      texture: 'Glossy chunky cartoon shapes with huge heads and tiny bodies.',
      camera: 'Top-down arena view.',
      mood: 'cheeky competitive chaos',
      render:
        'A 2016 phone frame, tall portrait: arena seen from above, two lanes and bridges, a row of blank cards at the bottom.',
      key: 'Clash Royale arena; chunky cartoon; lanes',
      avoid: ['existing Clash units'],
      briefs: [
        'Marching along the lanes between two towers, an original army of blue gnome engineers clashes with red mushroom warriors as a giant catapult-turtle lumbers across the middle bridge. No readable text or logo.',
        keep('SP12-135')[1],
        keep('SP12-135')[2],
      ],
    }),
    ga('SP12-136', 'Stronghold 2001 - Firefly Castle Sim', {
      look: 'Firefly Studios Stronghold (2001) look: isometric 2D castle-building simulation, tiny busy peasants, farms, walls and sieges on a medieval landscape.',
      subject: 'render people as tiny busy medieval peasants and soldiers from above.',
      color: 'Pastoral green, stone grey and thatch gold.',
      light: 'Soft daylight on a diagonal map with small crisp shadows.',
      texture:
        'Tiny rendered-then-shrunk sprites of peasants and buildings, grainy grass and stone.',
      camera: 'Isometric castle overview.',
      mood: 'industrious medieval siege',
      render:
        'A 2001 PC frame at 1024 by 768 from a high diagonal: tiny busy castle, a carved panel of blank buttons at the bottom.',
      key: 'Stronghold isometric; tiny peasants; castle walls',
    }),
    ga('SP12-137', 'Mount & Blade II Bannerlord 2020 - TaleWorlds Cavalry', {
      look: 'TaleWorlds Mount & Blade II: Bannerlord (2020) look: massive medieval field battles with hundreds of horsemen, dust, pike lines and sunset plains.',
      subject: 'render people as medieval riders and infantry in mail and cloth.',
      color: 'Sunset gold, dust brown and banner colors.',
      light: 'Low sun through thick dust, warm backlight on riders.',
      texture: 'Realistic mail, cloth and dust, slightly soft detail on distant troops.',
      camera: 'Low third-person battle view.',
      mood: 'thunderous medieval clash',
      render:
        'A 2020 frame at 1920 by 1080 in third person from horseback: massed battle, a compass strip at the top and bar shapes bottom left.',
      key: 'Bannerlord cavalry; massed battle; dust',
    }),
    ga('SP12-138', 'Valkyria Chronicles 2008 - Sega Canvas Watercolor War', {
      look: 'Sega Valkyria Chronicles (2008) look: CANVAS engine watercolor war, pencil hatching lines on 3D, paper texture, WWII-inspired European battlefields and giant iron land fortresses.',
      subject: 'render people as anime soldiers with sketchy watercolor shading.',
      color: 'Soft watercolor snow, olive and sepia.',
      light: 'Watercolor wash light with paper grain visible over the whole image.',
      texture:
        'Pencil hatching over watercolor paper laid onto 3D, ink outlines on soldiers and tanks.',
      camera: 'Third-person tactical view.',
      mood: 'bittersweet wartime tactics',
      render:
        'A 2008 PlayStation 3 frame at 1280 by 720: sketchy watercolor battlefield, a small command bar shape at the bottom.',
      key: 'Valkyria CANVAS watercolor; hatching; iron fortresses',
      avoid: ['a blue-haired Valkyria with a lance and shield'],
    }),
  ]),
};

export default spec;
