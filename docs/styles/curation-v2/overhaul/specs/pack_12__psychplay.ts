import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Video game originals vault, psychological and tactical gameplay: gameplay-frame captures. The six
// reference-titled originals get fully original card briefs; fourteen new descriptor-named gameplay
// looks add fog-town radio static, otherworld rust transitions, looping hallways, camouflage jungle
// stealth, base infiltration, cargo treks, sanity distortion, asylum walkthroughs, rainy border
// crossings, dream-logic puzzles, lighthouse isolation, time-loop mansions, forest sniper duels
// and suburban night walks.
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
  category: '11. Psychological & Tactical Gameplay',
  updates: {
    'SP12-093': { briefs: [
      'Recoiling at the bend of a narrow old shopping lane, an original young woman in a long grey coat faces a vast crimson flower mass that has burst through a wooden storefront and curls over the street. No readable text or logo.',
      'In a foggy old town lane, a frightened young woman finally finds safety in a shrine, only to be scolded by a very strict fox statue. No readable text or logo.',
      'On a foggy rural lane, every paper lantern hangs still except one, which sways toward a house whose door has been sealed with red thread. No readable text or logo.',
    ] },
    'SP12-094': { briefs: [
      'Seen from an elevated old-console camera in thick fog, an original man walks down an empty lakeside road as a radio in his pocket crackles and a hunched shape limps out of the mist. No readable text or logo.',
      'In a foggy town seen from a high console-era camera, a man carefully examines a locked door for a key and finds only a very small note-less envelope. No readable text or logo.',
      'From a high fixed angle in heavy fog, a bench by a lake is empty, and fresh wet footprints lead from the water to it. No readable text or logo.',
    ] },
    'SP12-095': { briefs: [
      'Following an original survivor over the shoulder through a rust-streaked hospital hallway, the camera reveals a faceless figure standing perfectly still under a flickering light. No readable text or logo.',
      'In a decaying hospital seen over the shoulder, a nervous survivor slowly opens a door and a small cat walks out, deeply unbothered. No readable text or logo.',
      'Over the shoulder in a foggy apartment corridor, the radio static rises, and a door at the far end has been left slightly open for the player. No readable text or logo.',
    ] },
    'SP12-096': { briefs: [
      'Peering through a hole in his apartment wall from first person, an original tenant sees the neighboring room slowly filling with twisting chains and a figure made of shadows. No readable text or logo.',
      'Trapped in his own apartment, a man spends the day checking every lock twice, and the only visitor is a moth that keeps knocking on the window. No readable text or logo.',
      'In a locked apartment, the front door is chained from the inside, and a pair of shoes that are not his stand neatly beside it. No readable text or logo.',
    ] },
    'SP12-097': { briefs: [
      'Crawling through jungle ferns seen from an overhead camera, an original soldier in face paint slips past a patrol while a crocodile watches from the river beside him. No readable text or logo.',
      'From an overhead jungle view, a highly trained soldier hides perfectly in a pile of leaves, except that a snake has chosen to nap on his back. No readable text or logo.',
      'From above in a dense jungle, a guard patrol stops at a clearing, and a single abandoned cardboard crate sits in the middle of it. No readable text or logo.',
    ] },
    'SP12-098': { briefs: [
      'Hunched under an enormous stack of cargo, an original courier crosses a mossy rock plain as invisible creatures leave handprints in the black tar spreading around her. No readable text or logo.',
      'Carrying a comically tall tower of packages across a rocky valley, a lone courier stops to admire a single tiny flower growing in a crack. No readable text or logo.',
      'Across a silent grey plain, a line of fresh footprints leads toward a cliff edge, then continues in the air, printed on nothing. No readable text or logo.',
    ] },
  },
  creates: [
    play('Fog-Town Radio Static Gameplay', 'foggy town horror gameplay', 'fog-radio', {
      aesthetic: 'Fog-town radio static gameplay: an original third-person horror capture of a lone figure in a town drowned in white fog, with a crackling radio warning of nearby threats.',
      subject_treatment: `${keep}; show the subject small in a fog-drowned town with limited visibility.`,
      color_and_tone: "Grey-white fog, rust brown and muted colors, kept consistent across the whole image.",
      lighting_and_shadow: "Flat foggy daylight and a small flashlight, kept consistent across the whole image.",
      texture_and_material: 'Wet asphalt, rusted signs without text and fog.',
      camera_and_composition: "Third-person with figures fading into fog, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with lonely creeping dread.',
      rendering_and_quality: "Clean capture with no readable signs, kept consistent across the whole image.",
      key_features: 'thick fog; lone figure; empty town; radio crackle',
    }, ['readable signs'], [
      'Walking down a street swallowed by white fog, an original man clutches a crackling radio as a towering silhouette with a strange helmet drags something heavy just out of sight. No readable text or logo.',
      'In a fog-drowned town, a nervous visitor reacts to his radio crackling and discovers it is only picking up a very enthusiastic cooking show. No readable text or logo.',
      'In a fog-filled town square, a phone booth rings, and the fog around it is shaped like someone waiting. No readable text or logo.',
    ]),
    play('Otherworld Rust Transition Gameplay', 'reality-shift horror gameplay', 'rust-otherworld', {
      aesthetic: 'Otherworld rust transition gameplay: an original capture of a room peeling away into a rusted otherworld of grates, chains and sirens mid-transformation.',
      subject_treatment: `${keep}; show the subject as the world around them peels into a rusted nightmare version.`,
      color_and_tone: "Rust red, black grates and siren glow, kept consistent across the whole image.",
      lighting_and_shadow: "Flickering light and deep dark grating, kept consistent across the whole image.",
      texture_and_material: "Peeling walls, rusted metal and chain-link, kept consistent across the whole image.",
      camera_and_composition: "Third-person as the room transforms, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with dreadful transformation, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture without gore or UI, kept consistent across the whole image.",
      key_features: 'peeling reality; rust grates; sirens; transformation',
    }, ['gore'], [
      'As a siren wails, the walls of an original school hallway peel away like burning paper, revealing rusted chain-link and grates where the floor used to be. No readable text or logo.',
      'Mid-transformation into a rusted nightmare world, a classroom still has one perfectly normal potted plant that refuses to change. No readable text or logo.',
      'In a hallway half-peeled into rust and grating, a single door remains untouched, painted bright white and slightly open. No readable text or logo.',
    ]),
    play('Looping Hallway Horror Gameplay', 'repeating corridor horror gameplay', 'looping-hallway', {
      aesthetic: 'Looping hallway horror gameplay: an original first-person capture of an ordinary house hallway that repeats endlessly, each loop subtly more wrong.',
      subject_treatment: `${keep}; place the subject in an endlessly repeating ordinary hallway.`,
      color_and_tone: "Dim warm hallway light turning sickly, kept consistent across the whole image.",
      lighting_and_shadow: "A single ceiling lamp and dark doorways, kept consistent across the whole image.",
      texture_and_material: "Plain wallpaper, wooden floors and framed photos, kept consistent across the whole image.",
      camera_and_composition: "First-person down an L-shaped hallway, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with mounting wrongness, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no UI, kept consistent across the whole image.",
      key_features: 'looping hallway; first-person; subtle wrongness; ceiling lamp',
    }, [], [
      'Walking the same L-shaped hallway for the tenth time in first person, an original visitor notices the framed family photos now all show the backs of their heads. No readable text or logo.',
      'Stuck in an endlessly looping hallway, a visitor gives up and makes himself comfortable, and the hallway looks slightly disappointed. No readable text or logo.',
      "Reaching the end of the repeating corridor once more, the visitor finds the bathroom door closed this time, and the light underneath it is moving. No readable text or logo.",
    ]),
    play('Camouflage Jungle Stealth Gameplay', 'overhead jungle stealth gameplay', 'jungle-stealth', {
      aesthetic: 'Camouflage jungle stealth gameplay: an original overhead or third-person capture of a camouflaged soldier crawling through dense jungle past patrols.',
      subject_treatment: `${keep}; show the subject camouflaged and crawling through jungle past patrols.`,
      color_and_tone: 'Deep jungle greens with mud and sunlight flecks.',
      lighting_and_shadow: "Dappled jungle light, kept consistent across the whole image.",
      texture_and_material: "Ferns, mud, face paint and camo fabric, kept consistent across the whole image.",
      camera_and_composition: "Low third-person in the undergrowth, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with patient infiltration, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no UI, kept consistent across the whole image.",
      key_features: 'camouflage; jungle crawl; patrols; dappled light',
    }, [], [
      'Crawling through ferns in face paint, an original soldier freezes as a patrol walks within a foot of her while a giant hornet nest hums above them all. No readable text or logo.',
      "Hidden in face paint among the jungle ferns, a soldier is found anyway by a curious monkey that insists on grooming his hair. No readable text or logo.",
      'In a dense jungle, a patrol stops and stares at a bush that is breathing slightly faster than the others. No readable text or logo.',
    ]),
    play('Guard Patrol Base Infiltration Gameplay', 'military base stealth gameplay', 'base-infiltration', {
      aesthetic: 'Guard patrol base infiltration gameplay: an original third-person capture of sneaking into a floodlit military base at night, searchlights, fences and guard towers.',
      subject_treatment: `${keep}; show the subject sneaking through a floodlit base at night.`,
      color_and_tone: "Night blue, searchlight white and concrete grey, kept consistent across the whole image.",
      lighting_and_shadow: "Sweeping searchlights and hard shadows, kept consistent across the whole image.",
      texture_and_material: "Chain-link, concrete and crates, kept consistent across the whole image.",
      camera_and_composition: "Third-person from behind cover, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with taut stealth, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no UI, kept consistent across the whole image.",
      key_features: 'searchlights; guard towers; fences; night base',
    }, [], [
      'Hiding behind crates as a searchlight sweeps the yard, an original infiltrator spots a colossal walking tank being rolled out of the hangar. No readable text or logo.',
      'In a floodlit base, a stealth operative hides inside a crate that a guard then carefully carries into his own office. No readable text or logo.',
      'In a quiet floodlit base, every searchlight has turned to point at the same spot on the fence. No readable text or logo.',
    ]),
    play('Cargo-Laden Wasteland Trek Gameplay', 'burdened traversal gameplay', 'cargo-trek', {
      aesthetic: 'Cargo-laden wasteland trek gameplay: an original third-person capture of a lone porter carrying a towering pack across a vast empty landscape of rock and moss.',
      subject_treatment: `${keep}; show the subject burdened by a huge pack crossing a vast landscape.`,
      color_and_tone: "Muted greens, grey rock and pale sky, kept consistent across the whole image.",
      lighting_and_shadow: "Overcast diffuse light, kept consistent across the whole image.",
      texture_and_material: "Moss, wet rock, straps and cargo cases, kept consistent across the whole image.",
      camera_and_composition: "Wide third-person with a small figure, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with lonely perseverance, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no UI, kept consistent across the whole image.",
      key_features: 'towering pack; vast landscape; lone porter; moss and rock',
    }, [], [
      'Hunched under a pack twice her height, an original porter crosses a valley of moss and rock as colossal translucent whales drift through the clouds above. No readable text or logo.',
      'Crossing a vast valley with a towering pack, a porter stumbles and every single package lands perfectly stacked beside him. No readable text or logo.',
      'On a vast empty plain, a lone porter sets down her pack and finds a second set of footprints walking beside her own. No readable text or logo.',
    ]),
    play('Sanity Distortion Gameplay', 'psychological distortion gameplay', 'sanity-distortion', {
      aesthetic: 'Sanity distortion gameplay: an original first-person capture where the room warps, walls breathe and colors bleed as the character\'s grip on reality slips.',
      subject_treatment: `${keep}; show the subject in a room that warps and breathes around them.`,
      color_and_tone: "Shifting desaturated tones with bleeding color, kept consistent across the whole image.",
      lighting_and_shadow: "Warping light and vignette, kept consistent across the whole image.",
      texture_and_material: "Stretched walls, doubled edges and chromatic fringes, kept consistent across the whole image.",
      camera_and_composition: "First-person with warped perspective, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with unravelling perception, kept consistent across the whole image.",
      rendering_and_quality: "Clean distortion with no UI, kept consistent across the whole image.",
      key_features: 'warping walls; breathing room; color bleed; first-person',
    }, [], [
      'Staring at a study that is slowly breathing in first person, an original writer watches the bookshelves bend inward as ink from the spines drips onto the floor. No readable text or logo.',
      'As the room warps around him, a panicking man finds that the only thing that has not changed is his extremely calm goldfish. No readable text or logo.',
      'In a warped first-person room, the door frame has stretched so tall that the handle is now out of reach. No readable text or logo.',
    ]),
    play('Asylum Walkthrough Gameplay', 'abandoned asylum exploration gameplay', 'asylum-walk', {
      aesthetic: 'Asylum walkthrough gameplay: an original first-person capture of exploring an abandoned asylum ward, peeling paint, overturned wheelchairs and daylight through dirty windows.',
      subject_treatment: `${keep}; show the subject exploring an abandoned asylum ward.`,
      color_and_tone: "Faded mint green, rust and grey daylight, kept consistent across the whole image.",
      lighting_and_shadow: "Dirty window light and dark rooms, kept consistent across the whole image.",
      texture_and_material: "Peeling paint, tiles and old furniture, kept consistent across the whole image.",
      camera_and_composition: "First-person down a long ward, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with melancholy unease, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture without gore or UI, kept consistent across the whole image.",
      key_features: 'abandoned asylum; peeling paint; long ward; dirty windows',
    }, ['gore'], [
      'Walking an abandoned asylum ward in first person, an original explorer finds every bed turned to face a single window where a figure is watching from the courtyard. No readable text or logo.',
      'Exploring an empty asylum, a nervous investigator is terrified by a wheelchair that turns out to be pushed by a bored cat. No readable text or logo.',
      'In a faded asylum ward, one bed is freshly made with clean sheets among dozens of rotting ones. No readable text or logo.',
    ]),
    play('Rainy Border Crossing Stealth Gameplay', 'wartime border stealth gameplay', 'border-crossing', {
      aesthetic: 'Rainy border crossing stealth gameplay: an original third-person capture of sneaking across a rain-soaked border post, barriers, flashlights and wet mud.',
      subject_treatment: `${keep}; show the subject crossing a rain-soaked border post undetected.`,
      color_and_tone: "Wet greys, yellow floodlights and dark green, kept consistent across the whole image.",
      lighting_and_shadow: "Floodlights through heavy rain, kept consistent across the whole image.",
      texture_and_material: "Mud, wet wood barriers and rain streaks, kept consistent across the whole image.",
      camera_and_composition: "Low third-person near the barrier, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with nervous determination, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no readable signs, kept consistent across the whole image.",
      key_features: 'border post; heavy rain; floodlights; barrier',
    }, ['readable signs'], [
      'Crawling through mud under a border barrier in pouring rain, an original courier holds a sealed case as a guard\'s flashlight passes inches above her. No readable text or logo.',
      "Sneaking past every guard at a flooded frontier post, a spy realizes he could have simply walked through the open gate. No readable text or logo.",
      'At a border post in heavy rain, the guard booth light is on and the radio is playing, but the chair inside is empty and still spinning. No readable text or logo.',
    ]),
    play('Dream-Logic Puzzle Gameplay', 'surreal dream puzzle gameplay', 'dream-logic', {
      aesthetic: 'Dream-logic puzzle gameplay: an original first-person capture of an impossible dream space, doors in the sky, stairs that loop and furniture floating in soft light.',
      subject_treatment: `${keep}; place the subject in an impossible dream space with looping stairs and floating rooms.`,
      color_and_tone: "Soft pastels with deep dreamy shadows, kept consistent across the whole image.",
      lighting_and_shadow: "Soft sourceless light, kept consistent across the whole image.",
      texture_and_material: "Floating furniture, clouds and impossible geometry, kept consistent across the whole image.",
      camera_and_composition: "First-person toward impossible architecture, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with gentle surreal wonder.',
      rendering_and_quality: "Clean capture with no UI, kept consistent across the whole image.",
      key_features: 'impossible geometry; floating furniture; looping stairs; dream light',
    }, [], [
      'Standing on a staircase that loops back into the sky in first person, an original dreamer reaches for a door floating above a sea of pink clouds where whales sleep. No readable text or logo.',
      "Solving a riddle in an impossible pastel dreamscape, the dreamer opens a fridge and steps through it onto a sunny beach. No readable text or logo.",
      'In a pastel dream room, every piece of furniture floats except a chair that is stuck firmly to the ceiling. No readable text or logo.',
    ]),
    play('Lighthouse Isolation Gameplay', 'isolated keeper narrative gameplay', 'lighthouse-isolation', {
      aesthetic: 'Lighthouse isolation gameplay: an original first-person narrative capture inside a remote lighthouse during a storm, lamp room, logbook desk and churning sea.',
      subject_treatment: `${keep}; show the subject inside a remote lighthouse during a storm.`,
      color_and_tone: "Storm grey, lamp gold and sea green, kept consistent across the whole image.",
      lighting_and_shadow: "Sweeping lamp beam and lightning, kept consistent across the whole image.",
      texture_and_material: "Brass lamp, wet stone and wooden desk, kept consistent across the whole image.",
      camera_and_composition: "First-person from inside the lamp room, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with isolated creeping paranoia.',
      rendering_and_quality: "Clean capture with no readable log text, kept consistent across the whole image.",
      key_features: 'lighthouse interior; storm; sweeping beam; isolation',
    }, ['readable log text'], [
      'Looking out from a storm-lashed lamp room in first person, an original keeper sees the beam catch a shape rising from the sea that is taller than the lighthouse. No readable text or logo.',
      'In a remote lighthouse during a storm, a lonely keeper plays cards with a seagull, and the seagull is winning. No readable text or logo.',
      "Up in a storm-battered lamp room, the keeper's chair is empty, and wet footprints lead up the spiral stairs from the sea. No readable text or logo.",
    ]),
    play('Time-Loop Mansion Mystery Gameplay', 'repeating day mystery gameplay', 'time-loop', {
      aesthetic: 'Time-loop mansion mystery gameplay: an original third-person capture of a mansion party where the same evening repeats, guests frozen in the same poses and clocks everywhere.',
      subject_treatment: `${keep}; place the subject in a mansion party trapped in a repeating evening.`,
      color_and_tone: "Warm party gold with cold clock-face silver, kept consistent across the whole image.",
      lighting_and_shadow: "Chandelier light and long shadows, kept consistent across the whole image.",
      texture_and_material: "Velvet, polished wood and ticking clocks, kept consistent across the whole image.",
      camera_and_composition: "Third-person through the ballroom crowd, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with mysterious déjà vu.',
      rendering_and_quality: "Clean capture with no readable clock numerals, kept consistent across the whole image.",
      key_features: 'time loop; mansion party; clocks; frozen guests',
    }, ['readable clock numerals'], [
      'Walking through a mansion ballroom as every clock strikes midnight again, an original investigator notices the same glass of wine falling from the same guest\'s hand for the hundredth time. No readable text or logo.',
      'Trapped in a repeating evening, a detective has memorized the whole party and now finishes everyone\'s sentences for them. No readable text or logo.',
      'In a looping mansion evening, every clock shows midnight except one small clock in the study, which has started counting backward. No readable text or logo.',
    ]),
    play('Forest Sniper Duel Gameplay', 'patient sniper duel gameplay', 'sniper-duel', {
      aesthetic: 'Forest sniper duel gameplay: an original first-person capture of a patient sniper duel in an old forest, scope glint, moss-covered hides and drifting mist.',
      subject_treatment: `${keep}; show the subject in a patient sniper duel hidden in an old forest.`,
      color_and_tone: "Mossy greens, mist grey and bark brown, kept consistent across the whole image.",
      lighting_and_shadow: 'Soft forest light and a single scope glint.',
      texture_and_material: "Moss, ferns, mist and camo cloth, kept consistent across the whole image.",
      camera_and_composition: "First-person through a scope or foliage, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with patient hunter tension.',
      rendering_and_quality: "Clean capture with no UI, kept consistent across the whole image.",
      key_features: 'sniper duel; scope glint; old forest; mist',
    }, [], [
      'Lying still under a blanket of moss in first person, an original marksman spots a faint scope glint from an old hunter who has been waiting in the ferns for three days. No readable text or logo.',
      'In a patient forest sniper duel, both marksmen have waited so long that a bird has built a nest on one of their rifles. No readable text or logo.',
      'Through a scope in a misty forest, the enemy sniper\'s hide is empty, and the scope glint is now coming from right behind the player. No readable text or logo.',
    ]),
    play('Suburban Night Walk Horror Gameplay', 'quiet suburb night horror gameplay', 'suburban-night', {
      aesthetic: 'Suburban night walk horror gameplay: an original third-person capture of walking an empty suburb at night, porch lights, humming streetlamps and something wrong down the block.',
      subject_treatment: `${keep}; show the subject walking an empty suburban street at night.`,
      color_and_tone: "Orange streetlamps, dark lawns and blue night, kept consistent across the whole image.",
      lighting_and_shadow: "Pools of streetlamp light between darkness, kept consistent across the whole image.",
      texture_and_material: 'Asphalt, lawns, picket fences and mailboxes without text.',
      camera_and_composition: "Third-person down the middle of the street, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with quiet domestic unease.',
      rendering_and_quality: "Clean capture with no readable signs, kept consistent across the whole image.",
      key_features: 'empty suburb; streetlamps; porch lights; night walk',
    }, ['readable signs'], [
      'Walking down the middle of an empty suburb at night, an original young woman sees every porch light switch off house by house behind her, following her home. No readable text or logo.',
      'On a quiet suburban street at night, a nervous walker is startled by a figure that turns out to be a neighbor in a bathrobe walking a very small dog. No readable text or logo.',
      'On an empty suburban street, one house has all its lights on and its front door wide open, and a sprinkler is watering the living room carpet. No readable text or logo.',
    ]),
  ],
};

export default spec;
