import type { Spec } from '../tools/apply';
import { ga } from './_authors';

// Video game pass, speed, sport and competitive arenas: each preset names its game, studio and
// year and states the real render technique and camera. Briefs stay in their sport or race.
const spec: Spec = {
  pack: 'pack_12',
  category: '5. Speed, Sport & Competitive Arenas',
  updates: Object.fromEntries([
    ga('SP12-008', 'Wipeout HD 2008 - Studio Liverpool Anti-Grav Neon', {
      look: 'Studio Liverpool Wipeout HD (2008) look: anti-gravity racing on futuristic neon circuits, sleek team craft, The Designers Republic graphic identity, weapon pads and blazing speed blur.',
      subject:
        'render vehicles as sleek anti-gravity racing craft with team liveries and glowing engines.',
      color: 'Neon cyan, magenta, electric yellow and night black.',
      light: 'Track lights streaking past with bright weapon blasts.',
      texture: 'Glossy craft hulls, clean track surfaces and speed blur.',
      camera: 'Low chase camera behind the craft.',
      mood: 'electric breakneck speed',
      render:
        'A 2008 PlayStation 3 frame at 1920 by 1080 from behind the craft: neon track streaking past, speed blur, a position and lap shape block at the top.',
      key: 'Wipeout anti-grav; Designers Republic; neon circuits',
    }),
    ga('SP12-017', 'Rollerdrome 2022 - Roll7 Comic Cel Skate Arena', {
      look: 'Roll7 Rollerdrome (2022) look: comic cel-shaded 3D with thick ink lines, seventies-futurist blood sport arenas, roller skaters firing pistols mid-trick and bullet time.',
      subject: 'render people as ink-lined comic figures on roller skates in bold sporty outfits.',
      color: 'Warm seventies orange, cream concrete and teal.',
      light: 'Flat comic light with shadows as solid ink shapes and hatching.',
      texture:
        'Thick ink outlines and flat cel color on every surface, speed lines when time slows.',
      camera: 'Third-person view mid-trick over bowls.',
      mood: 'stylish deadly flow',
      render:
        'A 2022 frame at 1920 by 1080 in third person: skater mid-air in a concrete arena, ink outlines, small bar shapes.',
      key: 'Rollerdrome ink lines; skate arena; bullet time',
    }),
    ga('SP12-021', 'Forza Horizon 5 2021 - Playground Festival Open Road', {
      look: 'Playground Games Forza Horizon 5 (2021) look: photoreal open-world festival racing across Mexican deserts and jungles, sunsets, dust plumes, balloons and colorful festival sites.',
      subject: 'render vehicles as photoreal cars with dust and motion, drivers inside.',
      color: 'Sunset gold, desert ochre and festival pink.',
      light: 'Golden sunset light with thick glowing dust in the air.',
      texture:
        'Photoreal car paint with sharp reflections, dust and terrain slightly soft at a distance.',
      camera: 'Chase camera behind drifting cars.',
      mood: 'joyful festival freedom',
      render:
        'A 2021 frame at 3840 by 2160 from a chase camera behind the car: a speedometer arc bottom right and a small minimap bottom left.',
      key: 'Forza Horizon festival; desert dust; photoreal cars',
    }),
    ga('SP12-031', 'Into the Breach 2018 - Subset Pixel Mech Tactics', {
      look: 'Subset Games Into the Breach (2018) look: compact isometric pixel grid tactics, small mechs pushing giant insects, clear tile warnings and a tiny island map.',
      subject:
        'render every subject as small crisp pixel mechs and giant insects on isometric tiles.',
      color: 'Muted tile greens, warning orange and deep ocean.',
      light: 'Flat pixel colors with bright red and orange warning tiles.',
      texture: 'Crisp square pixels, small mech and insect sprites on diagonal square tiles.',
      camera: 'Isometric grid tactics view.',
      mood: 'tight strategic tension',
      render:
        'A 2018 PC frame at 1280 by 720: an 8 by 8 diagonal grid of tiles, small sprites, bar and icon shapes at the edges.',
      key: 'Into the Breach grid; pixel mechs; giant insects',
      avoid: ['existing Vek insect designs'],
    }),
    ga('SP12-039', 'No Straight Roads 2020 - Metronomik Rock Versus EDM', {
      look: 'Metronomik No Straight Roads (2020) look: bright cel-shaded rhythm action, rock band heroes versus EDM empire bosses, stage-sized boss arenas and music-synced attacks.',
      subject: 'render people as bright cartoon musicians with big hair and instruments.',
      color: 'Neon purple, hot pink and lime.',
      light: 'Concert stage lights pulsing in magenta and cyan.',
      texture: 'Clean cel shading with thick outlines and neon glow effects.',
      camera: 'Third-person stage arena view.',
      mood: 'rebellious rock energy',
      render:
        'A 2020 frame at 1920 by 1080 in third person: cartoon musicians fighting a stage boss, beat-pulse ring shapes.',
      key: 'No Straight Roads rock; stage arenas; beat attacks',
    }),
    ga('SP12-047', 'Quake III Arena 1999 - id Software Gothic Arena', {
      look: 'id Software Quake III Arena (1999) look: fast first-person arena shooter with gothic and tech architecture, jump pads, lava pits, floating items and blocky armored gladiators.',
      subject:
        'show people as blocky armored figures with simple faces and stiff limbs, seen from first person.',
      color: 'Gothic stone brown, lava orange and teal energy.',
      light:
        'Colored light baked onto walls in soft blotches, glowing orange lava and bright jump pad beams.',
      texture:
        'Stone and metal textures that look sharp from afar and blurry up close, curved gothic arches made of visible straight segments.',
      camera: 'First-person view with weapon.',
      mood: 'frantic arena bloodsport',
      render:
        'A 1999 PC frame at 640 by 480 in first person: a chunky weapon at bottom center, health and ammo number shapes at the bottom.',
      key: 'Quake III gothic arena; blocky gladiators; jump pads; lava',
    }),
    ga('SP12-059', 'Dota 2 2013 - Valve Painted MOBA', {
      look: 'Valve Dota 2 (2013) look: isometric MOBA with painted stylized fantasy terrain, three lanes, towers, creep waves, glowing hero abilities and ancient structures.',
      subject: 'render people as stylized painted fantasy heroes with glowing abilities.',
      color: 'Radiant green versus dire red earth.',
      light: 'Painted light with bright spell glows over lanes and trees.',
      texture: 'Hand-painted stylized textures on chunky heroes and buildings, seen from above.',
      camera: 'Isometric MOBA view.',
      mood: 'fierce competitive clash',
      render:
        'A 2013 PC frame at 1920 by 1080 from a high angle: three lanes, small heroes and creep waves, a minimap square and ability row at the bottom.',
      key: 'Dota 2 painted lanes; towers; creep waves',
      avoid: ['existing Dota heroes'],
    }),
    ga('SP12-063', 'F-Zero GX 2003 - Amusement Vision Hyper Speed', {
      look: 'Amusement Vision F-Zero GX (2003) look: hyper-speed anti-gravity racing on twisting tubes and loops, saturated alien cities and deserts, thirty rival machines and extreme speed lines.',
      subject: 'render vehicles as sleek colorful hover machines at extreme speed.',
      color: 'Saturated desert gold, neon blue and pink.',
      light: 'Bright glowing track lights and bloom at huge speed.',
      texture: 'Glossy simple hover machines, heavy radial speed blur toward the edges.',
      camera: 'Low chase camera on twisting tracks.',
      mood: 'dizzying hyper speed',
      render:
        'A 2003 GameCube frame at 640 by 480 from behind: a hover machine in a loop, a power bar and position shape.',
      key: 'F-Zero GX loops; hover machines; hyper speed',
      avoid: ['a blue hover racer with a pilot in a helmet and scarf'],
    }),
    ga('SP12-065', 'Soulcalibur VI 2018 - Project Soul Weapon Duel', {
      look: 'Bandai Namco Project Soul Soulcalibur VI (2018) look: 3D weapon fighting in ornate historical-fantasy stages, colorful weapon trails, dramatic sparks and flowing costumes.',
      subject: 'render people as ornate weapon fighters in flowing historical-fantasy costumes.',
      color: 'Crystal blue, gold and weapon trail colors.',
      light: 'Dramatic stage light with sparks from weapon clashes.',
      texture: 'Polished ornate costumes and metal, glowing weapon trails.',
      camera: 'Side-on 3D fighting camera.',
      mood: 'epic duelist grandeur',
      render:
        'A 2018 frame at 1920 by 1080 from the side: two fighters on an ornate stage, health bar shapes across the top.',
      key: 'Soulcalibur weapon trails; ornate stages',
      avoid: ['existing Soulcalibur fighters'],
    }),
    ga('SP12-075', 'Rocket League 2015 - Psyonix Car Soccer', {
      look: 'Psyonix Rocket League (2015) look: rocket-powered cars flipping in enclosed stadiums, glowing ball, boost trails, curved walls and bright team colors.',
      subject: 'render vehicles as small rocket cars with boost flames.',
      color: 'Team blue and orange with neon arenas.',
      light: 'Bright stadium floodlights and orange boost flame glow.',
      texture: 'Glossy small cars, bright turf and a huge ball, clean and sharp.',
      camera: 'Chase camera behind the car.',
      mood: 'boosted competitive fun',
      render:
        'A 2015 frame at 1920 by 1080 behind a car: giant ball ahead, a score block shape at the top and a boost circle bottom right.',
      key: 'Rocket League stadium; boost trails; giant ball',
    }),
    ga('SP12-139', 'Crash Team Racing 2019 - Beenox Cartoon Kart', {
      look: 'Beenox Crash Team Racing Nitro-Fueled (2019) look: bright cartoon kart racing, drifting sparks, item chaos, volcano and jungle tracks, and animated-film characters.',
      subject: 'render people and animals as cartoon kart racers with big expressions.',
      color: 'Bright jungle green, lava orange and sky blue.',
      light: 'Bright cartoon light with blue and orange drift sparks.',
      texture: 'Glossy stylized cartoon karts and characters, soft clean shapes.',
      camera: 'Chase camera behind the kart.',
      mood: 'chaotic kart fun',
      render:
        'A 2019 frame at 1920 by 1080 from behind the kart: a position number shape and an item box shape at the top.',
      key: 'CTR cartoon karts; drift sparks; item chaos',
      avoid: ['an orange bandicoot', 'existing kart racers'],
    }),
    ga('SP12-140', "Tony Hawk's Pro Skater 2 2000 - Neversoft Skate Lines", {
      look: "Neversoft Tony Hawk's Pro Skater 2 (2000) look: PlayStation skateboarding with blocky skaters, boxy sunny plazas, rails and ramps, wobbling blurry textures and big air.",
      subject:
        'show people as blocky skaters with simple painted faces and baggy clothes made of a few flat panels.',
      color: 'Sunny plaza tan, sky blue and punk colors.',
      light: 'Bright flat daylight with no real shadows, colors a little washed out.',
      texture:
        'Blurry textures that wobble and stretch across flat panels, simple box-shaped plazas, rails and ramps.',
      camera: 'Third-person chase view behind the skater.',
      mood: 'punk trick freedom',
      render:
        'A 2000 PlayStation frame at 512 by 240 on a CRT: soft and jagged, a skater in the air, a trick meter bar shape at the top.',
      key: 'THPS2 blocky skaters; box-shaped plazas; big air; soft PS1 image',
      avoid: ['real professional skaters'],
    }),
    ga('SP12-141', 'SSX Tricky 2001 - EA Canada Big Air', {
      look: 'EA Canada SSX Tricky (2001) look: over-the-top snowboarding, impossible mountain courses, giant air tricks, bright character designs and glittering powder.',
      subject: 'render people as bold stylized snowboarders in colorful outfits.',
      color: 'Glittering white, sky blue and neon outfits.',
      light: 'Bright alpine light with sparkling snow and bloom.',
      texture:
        'Smooth simple snow slopes with soft blurry textures, glossy boards and loud outfits.',
      camera: 'Chase camera during big air.',
      mood: 'wild big-air joy',
      render:
        'A 2001 PlayStation 2 frame at 640 by 448: boarder mid-trick over a huge drop, a boost meter shape, slightly jagged edges.',
      key: 'SSX big air; impossible courses; powder',
    }),
    ga('SP12-142', 'Pinball FX 2017 - Zen Studios Digital Tables', {
      look: 'Zen Studios Pinball FX3 (2017) look: digital pinball tables with animated 3D toys, chrome balls, lit ramps, flippers and themed sculpted beasts that move.',
      subject: 'render every subject as a sculpted animated pinball toy on a lit table.',
      color: 'Chrome, glowing ramp neon and table art.',
      light: 'Colorful table lights and flashing inserts under glass.',
      texture:
        'Chrome ball, glossy plastic ramps and sculpted animated toys on a printed playfield.',
      camera: 'High table view down the playfield.',
      mood: 'flashy arcade thrill',
      render:
        'A 2017 frame at 1920 by 1080 looking down a pinball table from the bottom, a dot-matrix display shape at the top.',
      key: 'Pinball FX tables; animated toys; chrome ball',
    }),
    ga('SP12-143', 'Guilty Gear Strive 2021 - Arc System Works Anime 2.5D', {
      look: 'Arc System Works Guilty Gear Strive (2021) look: 3D rendered to look like hand-drawn anime, limited animation frames, heavy-metal stages and huge impact effects.',
      subject: 'render people as anime fighters with sharp cel shading and bold silhouettes.',
      color: 'Rock red, electric purple and bold contrast.',
      light: 'Dramatic stage light with bright impact flashes and bold color bursts.',
      texture: '3D figures shaded like 2D anime, with drawn lines and flat color blocks.',
      camera: 'Side-view 2.5D fighting camera.',
      mood: 'heavy-metal fighting intensity',
      render:
        'A 2021 frame at 1920 by 1080 from the side: two anime fighters clashing, health bar shapes across the top.',
      key: 'Guilty Gear anime 2.5D; impact effects; metal',
      avoid: ['existing Guilty Gear fighters'],
    }),
    ga('SP12-144', 'WWF No Mercy 2000 - AKI N64 Wrestling', {
      look: 'AKI Corporation WWF No Mercy (2000) look: Nintendo 64 wrestling with blocky bodies, smeared blurry faces, arena spotlights, pyro and a crowd painted as a flat backdrop.',
      subject:
        'show people as blocky wrestlers with simple smeared faces, thick limbs made of a few chunks.',
      color: 'Arena purple, pyro green and ring white.',
      light: 'Arena spotlights and pyro bursts over a dark crowd.',
      texture: 'Tiny textures smeared into soft blur, the crowd a flat picture of blotches.',
      camera: 'Entrance ramp view.',
      mood: 'campy arena spectacle',
      render:
        'A 2000 Nintendo 64 frame at 320 by 240: very soft and blurry, two blocky wrestlers in a ring, a spirit meter shape.',
      key: 'No Mercy blocky wrestlers; blurry smeared textures; pyro',
      avoid: ['real wrestlers'],
    }),
    ga('SP12-145', 'Motorstorm 2006 - Evolution Studios Mud Festival', {
      look: 'Evolution Studios MotorStorm (2006) look: off-road festival racing in deep mud and dust, bikes, buggies and trucks crashing, persistent mud deformation.',
      subject: 'render people and vehicles as mud-caked riders and machines.',
      color: 'Mud brown, storm grey and rust orange.',
      light: 'Storm light with mud flying through the air.',
      texture: 'Deep mud that deforms under wheels, dirty metal and motion blur.',
      camera: 'Chase camera during jumps.',
      mood: 'brutal muddy chaos',
      render:
        'A 2006 PlayStation 3 frame at 1280 by 720 from behind the vehicle: mud-covered screen edges and a boost gauge shape.',
      key: 'MotorStorm mud; crashes; off-road festival',
    }),
    ga('SP12-146', 'League of Legends Worlds 2017 - Riot AR Stadium Show', {
      look: 'Riot Games League of Legends World Championship (2017) broadcast look: esports stadium with glass player booths, giant screens and an augmented-reality dragon flying over the crowd.',
      subject: 'render people as anonymous crowds and players in team jerseys under huge screens.',
      color: 'Stadium blue, gold and dragon fire.',
      light: 'Stadium light with glowing projected creatures filling the arena.',
      texture: 'Sharp broadcast camera image with slight compression and lens glow.',
      camera: 'Wide broadcast stadium shot.',
      mood: 'electric grand final',
      render:
        'A 2017 broadcast frame at 1920 by 1080: stadium crowd, glowing projected dragon over the stage, a lower-third bar shape.',
      key: 'Worlds AR dragon; stadium; broadcast',
      avoid: ['real esports players'],
    }),
    ga('SP12-147', "Everybody's Golf 2017 - Clap Hanz Cartoon Links", {
      look: "Clap Hanz Everybody's Golf (2017) look: bright cartoon golf with big-headed golfers, lush fairways, shot arcs and cheerful exaggerated reactions.",
      subject: 'render people as big-headed cheerful cartoon golfers.',
      color: 'Lush fairway green and sky blue.',
      light: 'Bright cheerful daylight on soft green fairways.',
      texture: 'Soft stylized cartoon surfaces with simple smooth shapes.',
      camera: 'Behind-the-golfer shot view.',
      mood: 'cheerful playful sport',
      render:
        'A 2017 frame at 1920 by 1080 behind a golfer: shot arc line, a power bar shape at the bottom.',
      key: "Everybody's Golf cartoon; fairways; shot arcs",
    }),
    ga('SP12-148', 'Assassins Creed IV Black Flag 2013 - Ubisoft Stormy Sailing', {
      look: "Ubisoft Assassin's Creed IV: Black Flag (2013) look: third-person tall-ship sailing on dynamic Caribbean oceans, storms, rogue waves, spray and sails full of wind.",
      subject: 'render vessels as sailing ships with crews on deck.',
      color: 'Storm teal, sail white and Caribbean blue.',
      light: 'Stormy light with sudden sun breaks over the sea.',
      texture: 'Rolling water, spray and canvas sails, slightly soft detail on distant ships.',
      camera: 'Third-person ship camera.',
      mood: 'windswept seafaring daring',
      render:
        'A 2013 frame at 1920 by 1080 from behind the ship: waves over the bow, a small minimap and bar shapes.',
      key: 'Black Flag ocean; storms; sails',
      avoid: ['a hooded assassin'],
    }),
  ]),
};

export default spec;
