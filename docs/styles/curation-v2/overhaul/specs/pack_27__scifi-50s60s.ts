import type { Spec } from '../tools/apply';
import { cr } from './_authors';

// Science fiction cinema of the 1950s and 1960s: each preset names its film and director and
// rebuilds that film's production look (matte paintings, sets, lighting, film stock). Cards stage
// original moments, never the film's own creatures, robots or scenes.
const T = ['scifi-50s-60s', 'scifi-cinema'];
const tech =
  'Fifties Technicolor dye transfer grain with saturated primaries and soft studio halation.';
const bw = 'Fifties black-and-white 35mm grain with deep blacks and silvery midtones.';

const spec: Spec = {
  pack: 'pack_27',
  category: '7. Sci-Fi Cinema 50s & 60s',
  newCategory: { id: 'scifi-cinema-50s-60s' },
  updates: {},
  creates: [
    cr(
      'Destination Moon 1950 - Bonestell Matte Frontier',
      'fifties science fiction cinema',
      [...T, 'destination-moon'],
      {
        look: 'Irving Pichel Destination Moon (1950) look: Chesley Bonestell painted lunar matte backdrops, sleek finned rockets on gantries, Technicolor space suits and sober engineering optimism.',
        subject:
          'stage the subject against painted Bonestell-style lunar mattes and gleaming finned rockets.',
        color: 'Technicolor suit red and yellow, silver hull and black lunar sky.',
        light: 'Hard single-source sunlight on the moon with pitch-black shadows.',
        texture: tech,
        camera: 'Wide stagey frames against painted cyclorama horizons.',
        mood: 'earnest frontier optimism',
        render: 'Authentic early-fifties Technicolor science fiction frame.',
        key: 'Bonestell lunar mattes; finned rocket; Technicolor suits',
        briefs: [
          'On a painted lunar plain under a pitch-black sky, a retired schoolteacher in a bright yellow pressure suit plants a small potted geranium beside a gleaming finned rocket while the crew watches through the porthole. No readable text or logo.',
          'Inside a riveted rocket cockpit, two engineers in red suits argue over a slide rule as the painted Earth drifts past the window. Every dial glows softly in Technicolor green. No readable text or logo.',
          'A silver finned rocket stands alone on a gantry in the desert before dawn. Floodlights sweep its hull and a single engineer checks her wristwatch. No readable text or logo.',
        ],
      },
    ),
    cr(
      'The Day the Earth Stood Still 1951 - Wise Cold War Calm',
      'fifties science fiction cinema',
      [...T, 'day-earth-stood-still'],
      {
        look: 'Robert Wise The Day the Earth Stood Still (1951) look: crisp black-and-white Washington streets, a smooth saucer on a park lawn, Bernard Herrmann theremin unease and calm documentary staging.',
        subject:
          'stage the subject in crisp black-and-white civic spaces with calm, reportorial framing.',
        color: 'Silvery black and white with bright saucer highlights.',
        light: 'Even daylight and hard night floodlights on smooth metal.',
        texture: bw,
        camera: 'Level documentary framing with crowds held behind barriers.',
        mood: 'calm cold war unease',
        render: 'Authentic early-fifties black-and-white science fiction frame.',
        key: 'Wise realism; saucer on the lawn; crowds; theremin unease',
        avoid: ['a tall silver robot with a visor slit', 'a man in a silver spacesuit'],
        briefs: [
          'On a quiet public lawn at dawn, a smooth silver saucer rests beside a band shell while a lone ice-cream vendor, the only person not running, calmly offers the open hatch a cone. Crowds peer from behind police barriers. No readable text or logo.',
          'Every car on a city avenue has stopped dead at noon, and a bus driver steps out to stare at the silent traffic lights. A newspaper blows down the empty lane. No readable text or logo.',
          'A boarding house parlor at night holds a radio broadcasting urgent news to a room of worried lodgers. The window behind them glows with a steady white light. No readable text or logo.',
        ],
      },
    ),
    cr(
      'War of the Worlds 1953 - Pal Technicolor Invasion',
      'fifties science fiction cinema',
      [...T, 'war-of-the-worlds-53'],
      {
        look: 'George Pal and Byron Haskin The War of the Worlds (1953) look: saturated Technicolor invasion, green heat-ray glow, burning Californian towns, miniature effects and wire-held machines.',
        subject:
          'stage the subject amid saturated Technicolor devastation lit by glowing green alien light.',
        color: 'Saturated fire orange, alien green and smoky sky blue.',
        light: 'Glowing green beams and burning town light.',
        texture: tech,
        camera: 'Low angles looking up at hovering miniature machines.',
        mood: 'apocalyptic Technicolor panic',
        render: 'Authentic fifties Technicolor invasion frame.',
        key: 'Pal Technicolor invasion; green beams; miniature effects',
        avoid: ['manta-shaped hovering war machines with a cobra head'],
        briefs: [
          'A small-town church choir keeps singing in the pews while, through the stained-glass windows, a green glow sweeps across the burning hills outside. The choirmaster refuses to stop the hymn. No readable text or logo.',
          'Families load pickup trucks with mattresses and birdcages on a highway as a green light rises over the ridge. A dog sits calmly on a pile of suitcases. No readable text or logo.',
          'At dawn a smoking crater in a farm field holds a strange metal cylinder. A lone farmer stands at the edge holding a lantern. No readable text or logo.',
        ],
      },
    ),
    cr(
      'It Came from Outer Space 1953 - Arnold Desert 3D',
      'fifties science fiction cinema',
      [...T, 'it-came-from-outer-space'],
      {
        look: 'Jack Arnold It Came from Outer Space (1953) look: black-and-white Arizona desert nights, Joshua trees, telephone lines, 3D depth with objects thrust toward the lens and eerie glowing shimmer.',
        subject:
          'stage the subject in stark black-and-white desert nights with objects pushed toward the lens.',
        color: 'Desert silver, deep black night and glowing white shimmer.',
        light: 'Harsh moonlight and car headlights across the sand.',
        texture: bw,
        camera: 'Stereoscopic depth with foreground objects jutting at the lens.',
        mood: 'lonely desert strangeness',
        render: 'Authentic fifties 3D desert science fiction frame.',
        key: 'Arnold desert; Joshua trees; 3D depth; glowing shimmer',
        briefs: [
          'On a lonely desert highway at midnight, a telephone lineman halfway up a pole freezes as a shimmering ripple slides along the wires toward him, the Joshua trees stark against the moon. No readable text or logo.',
          'A diner waitress on her break stares into the desert as a meteor streak splits the sky above the gas pumps. Her coffee cup hangs in midair. No readable text or logo.',
          'A crater in the sand at dawn still glows faintly at the bottom. Footprints lead away from it toward the town lights. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Them 1954 - Douglas Atomic Documentary Noir',
      'fifties science fiction cinema',
      [...T, 'them'],
      {
        look: 'Gordon Douglas Them! (1954) look: black-and-white atomic-age noir with documentary police procedure, New Mexico sandstorms, storm drains, flamethrowers and giant creatures glimpsed in shadow.',
        subject:
          'stage the subject with procedural documentary realism in sandstorms and concrete storm drains.',
        color: 'Hard black and white with bright flamethrower flare.',
        light: 'Flashlights and flamethrower glow in tunnel darkness.',
        texture: bw,
        camera: 'Procedural medium shots and deep tunnel perspectives.',
        mood: 'tense atomic procedural',
        render: 'Authentic fifties atomic creature feature frame.',
        key: 'Them atomic noir; storm drains; flashlights; sandstorm',
        avoid: ['giant ants'],
        briefs: [
          'Deep in a concrete storm drain beneath Los Angeles, two sanitation inspectors in hard hats lower their flashlights toward a sound like clicking typewriters echoing from the dark ahead. No readable text or logo.',
          'In a desert sandstorm, a state trooper finds a trailer torn open from the outside and a child’s doll lying in the sand. His radio crackles with static. No readable text or logo.',
          'A briefing room of stern officials watches a flickering film projector in total silence. On the screen, only a huge shadow crosses a dune. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Godzilla 1954 - Honda Toho Atomic Tragedy',
      'fifties science fiction cinema',
      [...T, 'godzilla-54'],
      {
        look: 'Ishiro Honda Godzilla (1954) look: somber black-and-white Tokyo in ruins, suitmation and miniature destruction, fleeing crowds, power lines, newsreel grain and atomic grief.',
        subject:
          'stage the subject in somber black-and-white miniature cityscapes and fleeing crowds.',
        color: 'Mournful black and white with fire glow.',
        light: 'Burning city light and searchlights through smoke.',
        texture: bw,
        camera: 'Low miniature angles and newsreel crowd shots.',
        mood: 'grieving atomic tragedy',
        render: 'Authentic fifties Toho monster film frame.',
        key: 'Honda somber Tokyo; miniatures; searchlights; atomic grief',
        avoid: ['a dorsal-finned reptile kaiju breathing a beam'],
        briefs: [
          'In a smoke-filled hospital corridor after the attack, a young nurse holds a Geiger counter to a crying boy while searchlights sweep the broken windows. The needle is trembling. No readable text or logo.',
          'On the roof of a department store, a radio announcer keeps describing the burning skyline into his microphone. Behind him the tower is starting to lean. No readable text or logo.',
          'A fishing boat drifts on a calm sea at dawn, its crew gone and its nets glowing faintly. A seagull lands on the empty wheelhouse. No readable text or logo.',
        ],
      },
    ),
    cr(
      'This Island Earth 1955 - Universal Technicolor Space Opera',
      'fifties science fiction cinema',
      [...T, 'this-island-earth'],
      {
        look: 'Joseph Newman This Island Earth (1955) look: lurid Technicolor space opera, flying saucer interiors with glowing tubes, a burning planet under meteor bombardment and big-brained alien scientists.',
        subject:
          'stage the subject in lurid Technicolor saucer interiors and meteor-lit alien skies.',
        color: 'Lurid Technicolor orange, teal and violet glow.',
        light: 'Glowing tubes and meteor fire.',
        texture: tech,
        camera: 'Wide painted-sky frames and glowing console close-ups.',
        mood: 'lurid cosmic adventure',
        render: 'Authentic fifties Technicolor space opera frame.',
        key: 'This Island Earth Technicolor; saucer tubes; meteor planet',
        avoid: ['a bug-eyed alien with an exposed brain and pincer claws'],
        briefs: [
          'Inside a saucer lit by glowing orange tubes, a kidnapped physics professor in a tweed jacket tries to politely correct an equation on a glowing alien blackboard while the planet below burns under meteors. No readable text or logo.',
          'Two scientists in white coats watch a glowing interociter screen assemble itself on a lab bench. The kit arrived in the mail. No readable text or logo.',
          'Meteors rain across a violet sky over a domed city. A single tram keeps running on schedule through the fire. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Forbidden Planet 1956 - MGM CinemaScope Alien World',
      'fifties science fiction cinema',
      [...T, 'forbidden-planet'],
      {
        look: 'Fred McLeod Wilcox Forbidden Planet (1956) look: CinemaScope Metrocolor alien world with a green sky and painted desert, a gleaming saucer cruiser, vast Krell-scale machinery and electronic tonalities.',
        subject:
          'stage the subject under a painted green alien sky or among colossal machine chambers.',
        color: 'Painted green sky, coral desert and chrome.',
        light: 'Studio stage light and glowing machine panels.',
        texture: 'Fifties Metrocolor CinemaScope grain with painted cyclorama backdrops.',
        camera: 'Wide CinemaScope frames dwarfing crews.',
        mood: 'grand alien mystery',
        render: 'Authentic fifties MGM science fiction frame.',
        key: 'Forbidden Planet green sky; CinemaScope; colossal machinery',
        avoid: ['a bubble-headed robot with spinning antennas', 'an invisible id monster outline'],
        briefs: [
          'Under a painted green alien sky, the cook of a saucer cruiser in a crisp uniform tries to grow a tomato plant in the coral desert sand while the crew watches from the ramp. No readable text or logo.',
          'Tiny crew members stand on a catwalk inside a machine chamber whose power shafts drop for miles. Every panel glows in sequence. No readable text or logo.',
          'A saucer cruiser rests on a coral plain at dusk under two moons. A lone deer grazes near its landing leg. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Invasion of the Body Snatchers 1956 - Siegel Suburban Paranoia',
      'fifties science fiction cinema',
      [...T, 'body-snatchers-56'],
      {
        look: 'Don Siegel Invasion of the Body Snatchers (1956) look: black-and-white small-town paranoia, noir shadows in cozy houses, greenhouses, neighbors who are not quite right and running figures on highways.',
        subject:
          'stage the subject in ordinary small-town settings twisted by noir shadow and paranoia.',
        color: 'Noir black and white with grey suburban tones.',
        light: 'Noir shadows through blinds and headlights at night.',
        texture: bw,
        camera: 'Low noir angles and deep-focus streets.',
        mood: 'creeping suburban paranoia',
        render: 'Authentic fifties paranoid science fiction frame.',
        key: 'Body Snatchers paranoia; small town; noir shadow',
        avoid: ['giant seed pods'],
        briefs: [
          'At a small-town Sunday barbecue, a family doctor notices that every neighbor is smiling the same smile and flipping burgers in perfect unison. Noir shadows fall across the lawn. No readable text or logo.',
          'A woman hides behind the blinds of her kitchen as the whole street quietly gathers at the town square at dawn. None of them speak. No readable text or logo.',
          'In a basement greenhouse, a single lamp swings above a table covered with a sheet. Something beneath it has the shape of a person. No readable text or logo.',
        ],
      },
    ),
    cr(
      'The Incredible Shrinking Man 1957 - Arnold Giant Scale',
      'fifties science fiction cinema',
      [...T, 'shrinking-man'],
      {
        look: 'Jack Arnold The Incredible Shrinking Man (1957) look: black-and-white oversized sets turning a basement into a wilderness, giant matchboxes, threads, water heaters and existential scale.',
        subject:
          'stage the subject tiny among colossal everyday objects in oversized black-and-white sets.',
        color: 'Silvery black and white basement gloom.',
        light: 'Hard light through a basement window.',
        texture: bw,
        camera: 'Low scale-shifting angles on giant props.',
        mood: 'existential scale awe',
        render: 'Authentic fifties oversized-set science fiction frame.',
        key: 'Shrinking Man giant props; basement wilderness; scale',
        avoid: ['a man fighting a giant spider with a sewing needle'],
        briefs: [
          'A tiny accountant in a torn shirt climbs a colossal spool of thread in a basement, using a paperclip as a grappling hook while a leaking water heater thunders above him like a waterfall. No readable text or logo.',
          'A thimble full of rainwater serves as a lake for a tiny woman washing her dress. A cat’s shadow crosses the window above. No readable text or logo.',
          'A single crumb of bread lies on a vast concrete floor. It is the only food for miles. No readable text or logo.',
        ],
      },
    ),
    cr(
      'The Fly 1958 - Neumann Technicolor Lab Horror',
      'fifties science fiction cinema',
      [...T, 'the-fly-58'],
      {
        look: 'Kurt Neumann The Fly (1958) look: saturated Technicolor Montreal home laboratory, teleportation booths with glowing panels, elegant fifties domesticity and scientific dread.',
        subject:
          'stage the subject in saturated fifties domestic labs with glowing teleportation booths.',
        color: 'Technicolor lab teal, domestic pastel and warning red.',
        light: 'Glowing booth light and warm domestic lamps.',
        texture: tech,
        camera: 'Stagey medium shots in lab and home interiors.',
        mood: 'elegant scientific dread',
        render: 'Authentic fifties Technicolor lab horror frame.',
        key: 'The Fly lab booths; Technicolor domestic; teleport glow',
        avoid: ['a man with a fly head', 'a fly with a human head in a web'],
        briefs: [
          'In an elegant basement laboratory, a wife in a pastel apron serves tea to her husband as a glass booth behind them flashes and a houseplant inside reappears slightly greener. No readable text or logo.',
          'Two teleportation booths hum in a tidy lab while a cat sits between them, deciding. The warning light is red. No readable text or logo.',
          'A domestic kitchen at night holds a single glowing teleport pod beside the refrigerator. Its door is ajar and nothing is inside. No readable text or logo.',
        ],
      },
    ),
    cr(
      'The Time Machine 1960 - Pal Victorian Future Color',
      'sixties science fiction cinema',
      [...T, 'time-machine-60'],
      {
        look: 'George Pal The Time Machine (1960) look: Metrocolor Victorian parlor with a brass sled time machine, time-lapse effects of passing years and a lush far-future Eden of domed temples.',
        subject:
          'stage the subject in Victorian brass-and-velvet interiors or lush distant-future gardens.',
        color: 'Victorian brass, velvet red and future garden green.',
        light: 'Warm lamplight and time-lapse sun streaks.',
        texture: 'Early-sixties Metrocolor grain with soft optical time-lapse effects.',
        camera: 'Stagey Victorian framing and time-lapse window views.',
        mood: 'wistful temporal wonder',
        render: 'Authentic sixties Metrocolor time-travel frame.',
        key: 'Pal time machine sled; Victorian brass; time-lapse',
        avoid: ['pale subterranean cannibal creatures'],
        briefs: [
          'In a Victorian parlor, a retired governess sits in a brass sled machine with a spinning dish behind her while outside the window the seasons flicker past in seconds and a shop across the street changes hats. No readable text or logo.',
          'In a lush far-future garden, a man in Victorian tweed shares his pocket watch with curious children who have never seen one. A domed temple rises behind them. No readable text or logo.',
          'A brass time machine sits alone in a dusty parlor with a vase of wilted flowers. The clock on the wall has no hands. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Village of the Damned 1960 - Rilla English Village Stare',
      'sixties science fiction cinema',
      [...T, 'village-damned'],
      {
        look: 'Wolf Rilla Village of the Damned (1960) look: black-and-white English village, eerie calm, identical pale children with glowing eyes and quiet domestic menace.',
        subject:
          'stage the subject in calm black-and-white English village life with quiet menace.',
        color: 'Pale English grey and white with glowing eyes.',
        light: 'Flat overcast English light.',
        texture: bw,
        camera: 'Still framing with rows of identical figures.',
        mood: 'quiet uncanny menace',
        render: 'Authentic sixties English science fiction frame.',
        key: 'Village of the Damned; identical figures; glowing eyes',
        briefs: [
          'Every resident of a quiet English hamlet has fallen asleep mid-task at the same instant: the postman over his bicycle, the vicar at the gate, a cow in the lane. Only the church clock keeps ticking. No readable text or logo.',
          'A row of identical pale adult chess club members stare calmly across the table at a nervous vicar. Their eyes begin to glow. No readable text or logo.',
          'A tea table set for eight waits in a sunny cottage garden. Every chair has been pulled out exactly the same distance. No readable text or logo.',
        ],
      },
    ),
    cr(
      'La Jetee 1962 - Marker Still-Photo Time Loop',
      'sixties science fiction cinema',
      [...T, 'la-jetee'],
      {
        look: 'Chris Marker La Jetée (1962) look: a science fiction film told almost entirely in grainy black-and-white still photographs, post-war Paris ruins, underground camps and a haunting airport jetty.',
        subject:
          'stage the subject as a single grainy black-and-white still photograph from a photo-novel film.',
        color: 'Grainy black and white with washed greys.',
        light: 'Natural light of documentary stills.',
        texture: 'Coarse photographic grain like enlarged documentary stills.',
        camera: 'Frozen still-photo frames with dissolves.',
        mood: 'haunted memory loop',
        render: 'Authentic sixties still-photograph film frame.',
        key: 'La Jetée stills; ruins; jetty; memory loop',
        briefs: [
          'Captured as a single grainy still photograph, a man in a hospital gown sits blindfolded beneath a stone vault as scientists whisper around him, his hand reaching for a memory of a sunny airport terrace. No readable text or logo.',
          'A frozen still shows a woman on an airport jetty turning toward the camera as her scarf lifts in the wind. The planes behind her never move. No readable text or logo.',
          'A still photograph of ruined Paris streets shows a single statue standing untouched. Pigeons are frozen in flight above it. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Ikarie XB-1 1963 - Polak Czech Spaceship Modernism',
      'sixties science fiction cinema',
      [...T, 'ikarie-xb1'],
      {
        look: 'Jindřich Polák Ikarie XB-1 (1963) look: Czechoslovak black-and-white spaceship modernism, sleek curved white interiors, dance parties among the stars and humanist crew drama.',
        subject:
          'stage the subject in sleek curved sixties modernist spaceship interiors in black and white.',
        color: 'Luminous white modernism and deep space black.',
        light: 'Glowing ceilings and soft modernist light.',
        texture: bw,
        camera: 'Wide elegant frames of curved corridors.',
        mood: 'humanist cosmic modernism',
        render: 'Authentic sixties Czech science fiction frame.',
        key: 'Ikarie modernism; curved white interiors; crew dance',
        briefs: [
          'In a curved white lounge aboard a starship, the whole crew in sleek sixties uniforms dances to a jazz record while a vast black window shows the stars drifting past. A child sleeps on a modernist sofa. No readable text or logo.',
          'A ship’s doctor listens to an astronaut’s heartbeat in a glowing white clinic. Outside, a dark derelict drifts close. No readable text or logo.',
          'An empty curved corridor of the ship glows at night. A single wristwatch lies on the floor. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Alphaville 1965 - Godard Neon Paris Future',
      'sixties science fiction cinema',
      [...T, 'alphaville'],
      {
        look: 'Jean-Luc Godard Alphaville (1965) look: black-and-white nighttime Paris shot as a future city, neon, glass office blocks, trench coats, flashing lights and poetic noir detachment.',
        subject:
          'stage the subject in real sixties Paris architecture filmed at night as a cold future city.',
        color: 'High-contrast black and white with flashing neon.',
        light: 'Blinking neon and harsh flash bulbs.',
        texture: 'Grainy high-speed black-and-white film stock.',
        camera: 'Handheld noir frames and flashing negative inserts.',
        mood: 'cool poetic alienation',
        render: 'Authentic sixties French New Wave science fiction frame.',
        key: 'Alphaville neon Paris; trench coats; flashing light',
        avoid: ['a trench-coated detective with a fedora and a flash camera'],
        briefs: [
          'In a glass office block at night, a poet in a turtleneck reads verse aloud to a humming computer console while the neon arrows outside blink toward exits that lead nowhere. No readable text or logo.',
          'A woman in a white coat walks down a hotel corridor lit by a flashing ceiling light. Every door she passes is numbered but blank. No readable text or logo.',
          'A single neon equation flashes on and off above a deserted ring road at night. The traffic lights keep changing for nobody. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Fantastic Voyage 1966 - Fleischer Inner Space Color',
      'sixties science fiction cinema',
      [...T, 'fantastic-voyage'],
      {
        look: 'Richard Fleischer Fantastic Voyage (1966) look: psychedelic Technicolor journey inside a human body, a miniaturized submarine drifting through glowing blood vessels, heart chambers and lungs.',
        subject: 'stage the subject miniaturized inside glowing psychedelic organic tunnels.',
        color: 'Glowing red, amber and violet organic hues.',
        light: 'Backlit translucent organic walls.',
        texture: 'Sixties Technicolor grain with gel-lit translucent sets.',
        camera: 'Wide inner-space vistas around a tiny submarine.',
        mood: 'psychedelic inner wonder',
        render: 'Authentic sixties inner-space adventure frame.',
        key: 'Fantastic Voyage inner space; glowing vessels; mini sub',
        briefs: [
          'Inside a glowing violet blood vessel, a miniaturized crew in white wetsuits repairs their tiny submarine’s propeller while red cells drift past like giant soft cushions. No readable text or logo.',
          'A miniaturized scientist floats through a vast amber chamber of the inner ear. The walls tremble with a distant heartbeat. No readable text or logo.',
          'A tiny glowing submarine drifts alone in a vast red chamber. A single white cell approaches slowly. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Fahrenheit 451 1966 - Truffaut Firehouse Pastels',
      'sixties science fiction cinema',
      [...T, 'fahrenheit-451'],
      {
        look: 'François Truffaut Fahrenheit 451 (1966) look: cool pastel Technicolor suburbia by Nicolas Roeg, glossy red fire engines, black uniforms, monorails and quiet book-burning dystopia.',
        subject:
          'stage the subject in cool pastel sixties suburbs with glossy red fire engines and black uniforms.',
        color: 'Glossy fire-engine red, pastel suburb and black uniform.',
        light: 'Flat cool daylight with orange fire.',
        texture: tech,
        camera: 'Elegant Roeg compositions and zooms.',
        mood: 'cool quiet dystopia',
        render: 'Authentic sixties Technicolor dystopia frame.',
        key: 'Fahrenheit 451 red engines; pastel suburbs; monorail',
        briefs: [
          'On a pastel suburban lawn, a fireman in a black uniform pauses before lighting a pile of seed packets and garden almanacs as the elderly gardener who owns them calmly keeps watering her roses. No readable text or logo.',
          'A monorail glides over identical pastel houses as passengers stroke their own sleeves to feel something. A red fire engine races below. No readable text or logo.',
          'In a snowy forest clearing, people walk in slow circles reciting to themselves. Each one is a whole book. No readable text or logo.',
        ],
      },
    ),
    cr(
      '2001 A Space Odyssey 1968 - Kubrick Clinical Cosmos',
      'sixties science fiction cinema',
      [...T, '2001'],
      {
        look: 'Stanley Kubrick 2001: A Space Odyssey (1968) look: Super Panavision clinical white spacecraft interiors, one-point symmetry, slow docking ballets, front-projected deserts and vast silent cosmos.',
        subject:
          'stage the subject in clinical symmetrical white spacecraft interiors or silent cosmic vastness.',
        color: 'Clinical white, deep black space and warning red.',
        light: 'Even glowing white panels and hard starlight.',
        texture: 'Super Panavision 70mm clarity with fine grain.',
        camera: 'Perfect one-point symmetry and slow graceful motion.',
        mood: 'silent cosmic awe',
        render: 'Authentic late-sixties 70mm science fiction frame.',
        key: '2001 symmetry; white interiors; silent cosmos',
        avoid: ['a red camera eye in a panel', 'a black monolith', 'a fetus floating in space'],
        briefs: [
          'In a perfectly symmetrical white centrifuge, a lone astronaut in a tracksuit shadowboxes while jogging the curved floor, his dinner tray of pastel paste waiting on the table at the vanishing point. No readable text or logo.',
          'A slender white space station rotates slowly while a shuttle glides in to dock, perfectly in time with a waltz. Earth glows beneath. No readable text or logo.',
          'An empty white room with a glowing floor holds a single dining chair and a wine glass. The glass has just fallen. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Barbarella 1968 - Vadim Pop Psychedelic Space',
      'sixties science fiction cinema',
      [...T, 'barbarella'],
      {
        look: 'Roger Vadim Barbarella (1968) look: psychedelic pop-art space fantasy, fur-lined spaceships, plastic bubble sets, glittering costumes, Jean-Claude Forest comic designs and campy dreamlike color.',
        subject:
          'stage the subject in camp psychedelic pop-art sets with glitter, plastic and fur.',
        color: 'Psychedelic pink, orange, violet and gold.',
        light: 'Colored gels and glittering highlights.',
        texture: 'Late-sixties Technicolor grain with plastic and fur textures.',
        camera: 'Camp stagey frames with floating sets.',
        mood: 'camp dreamy playfulness',
        render: 'Authentic late-sixties pop psychedelic frame.',
        key: 'Barbarella pop psychedelia; fur spaceship; plastic bubbles',
        avoid: [
          'a blonde astronaut in a clear vinyl spacesuit',
          'a blind angel with feathered wings',
        ],
        briefs: [
          'Inside a fur-lined spaceship with a shag-carpet cockpit, a retired diplomat in a glittering orange jumpsuit calmly knits while floating in zero gravity as psychedelic nebulae swirl past the bubble window. No readable text or logo.',
          'In a plastic bubble city, citizens relax in transparent lounge pods filled with colored smoke. A robot bartender serves them glowing pills. No readable text or logo.',
          'A single glittering boot floats in an empty violet void. A trail of sparkling bubbles follows it. No readable text or logo.',
        ],
      },
    ),
  ],
};

export default spec;
