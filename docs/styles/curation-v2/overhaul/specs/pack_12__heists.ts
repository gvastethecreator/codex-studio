import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Video game originals vault, heists, horror and underworld runs: in-game screenshot looks. The ten
// originals get original card briefs; ten new descriptor-named capture looks add bank vault crews,
// casino floor infiltration, found-footage night horror, flashlight corridor horror, sewer tunnel
// crawls, speakeasy shootouts, getaway car chases, museum laser grids, cartoon ghost catchers and
// underworld boat crossings.
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
  category: '7. Heists, Horror & Underworld Runs',
  updates: {
    'SP12-016': { briefs: [
      'Blinking across a ballroom balcony in first person, an original masked assassin freezes time as a chandelier falls toward a gathering of aristocrats in whale-oil light. No readable text or logo.',
      'In a first-person aristocratic mansion, a masked infiltrator hides under a banquet table and a very polite dog brings him a napkin. No readable text or logo.',
      'Through a keyhole in first person, an ornate study is empty, but the painting on the wall has turned to watch the door. No readable text or logo.',
    ] },
    'SP12-019': { briefs: [
      'Raising a hand-cranked flashlight in a flooded subway tunnel, an original survivor in a gas mask sees a pack of mutants frozen in the beam on the tracks ahead. No readable text or logo.',
      'Deep in a subway station turned market, a survivor haggles over a single bullet with a merchant who clearly knows its value. No readable text or logo.',
      'In a first-person subway tunnel, the flashlight flickers off and on, and the abandoned train carriage ahead now has one lit window. No readable text or logo.',
    ] },
    'SP12-024': { briefs: [
      'Sprinting across a collapsing stone bridge in a jungle tomb, an original explorer leaps for a ledge as giant stone blades swing through the dust behind her. No readable text or logo.',
      'In an ancient trap-filled tomb, an explorer carefully avoids every pressure plate and then gets stuck in a very narrow gap. No readable text or logo.',
      'Deep in a tomb, the explorer\'s torch lights a wall carving that shows her own face, carved thousands of years ago. No readable text or logo.',
    ] },
    'SP12-030': { briefs: [
      'Dodging bullets thrown by a giant rubber-hose carnival clown, an original teacup-headed hero runs and guns across a spinning carousel in hand-inked 1930s style. No readable text or logo.',
      'In a hand-inked carnival boss fight, a towering cartoon devil pauses mid-attack because his top hat has fallen off. No readable text or logo.',
      'On a grainy inked carnival stage after the fight, a single balloon floats up from the empty boss arena with a smiling face drawn on it. No readable text or logo.',
    ] },
    'SP12-049': { briefs: [
      'Slashing through a moonlit gothic hall in 2D, an original half-vampire swordsman faces a gigantic skeleton made of stacked coffins rising from the castle floor. No readable text or logo.',
      'In a gothic side-scrolling castle, a noble vampire hunter finds a roast chicken hidden inside a castle wall and eats it with great ceremony. No readable text or logo.',
      'In a moonlit 2D castle corridor, a painting of the castle hangs on the wall, and a tiny light is on in one of its windows. No readable text or logo.',
    ] },
    'SP12-050': { briefs: [
      'Seen from an overhead fixed camera in low-poly polar corridors, an original android officer raises a pistol toward a broken figure crawling out of a red-lit cryo pod. No readable text or logo.',
      'In a retro survival-horror polar station, an android carefully manages her tiny inventory and chooses to keep a single flower instead of ammo. No readable text or logo.',
      'From a fixed overhead camera, an empty polar station room shows a radio that is still broadcasting a signal nobody sent. No readable text or logo.',
    ] },
    'SP12-054': { briefs: [
      'Leaping from a galloping horse onto a copper-roofed train, an original outlaw fires at guards on the rooftops as the locomotive thunders through a canyon at sunset. No readable text or logo.',
      'During a dramatic train robbery, the outlaw gang discovers the safe contains only a very large, very angry goose. No readable text or logo.',
      "Winding through the mountains at night, a train passes a lone station where a conductor waves a lantern at it, and the conductor has no shadow. No readable text or logo.",
    ] },
    'SP12-057': { briefs: [
      'Sailing a stylized galleon into a storm in first person, an original crew fires cannons at a skeleton ship as a kraken tentacle wraps around the mast. No readable text or logo.',
      'On a bright pirate sea, a crew finally digs up the treasure chest, and inside is a very small, very angry crab guarding one coin. No readable text or logo.',
      'On a calm glowing sea at night, a ship drifts past with its lanterns lit, and its entire crew is playing instruments with no sound. No readable text or logo.',
    ] },
    'SP12-066': { briefs: [
      'Riding a rusted tram through a derelict ship in third person, an original engineer in a heavy suit raises a plasma cutter as twisted creatures claw at the glass. No readable text or logo.',
      'Aboard a derelict mining ship, an engineer painstakingly repairs a door, which the creature on the other side politely holds open for him. No readable text or logo.',
      'On an abandoned ship\'s tram platform, the tram arrives with its doors open and its seats full of neatly folded work suits. No readable text or logo.',
    ] },
    'SP12-069': { briefs: [
      'Firing from a dieselpunk airship over a vast desert, an original fleet commander watches radar blips close in as massive flying battleships rise from the dunes. No readable text or logo.',
      'On a crackling radar screen over the desert, an entire enemy fleet turns out to be a single flock of very large birds. No readable text or logo.',
      "Crackling on a desert radar display, a slow blip is circling the fleet in a perfect spiral that tightens with each sweep. No readable text or logo.",
    ] },
  },
  creates: [
    capture('Bank Vault Crew Heist Capture', 'co-op bank heist screenshot', 'vault-heist', {
      aesthetic: 'Bank vault crew heist capture: an original first-person co-op heist screenshot of masked crew members drilling a massive vault door under flickering alarm lights.',
      subject_treatment: `${keep}; show the subject as part of a masked crew breaking into a bank vault.`,
      color_and_tone: "Marble whites, gold, and red alarm light, kept consistent across the whole image.",
      lighting_and_shadow: "Flashing alarms and drill sparks, kept consistent across the whole image.",
      texture_and_material: 'Steel vault door, marble floors and cash stacks.',
      camera_and_composition: "First-person with crew members in frame, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with tense criminal chaos.',
      rendering_and_quality: "Clean capture with no HUD text, kept consistent across the whole image.",
      key_features: 'vault door; masked crew; drill sparks; alarm lights',
    }, [], [
      'Drilling into a massive round vault door under flashing red alarms, an original masked crew watches it swing open to reveal a sleeping dragon curled on the gold. No readable text or logo.',
      'In a tense bank heist, the masked crew finally cracks the vault and finds it contains only a single, very expensive sandwich. No readable text or logo.',
      'Inside an open vault after the heist, the crew has left, and the security camera slowly turns to follow a coin rolling across the floor. No readable text or logo.',
    ]),
    capture('Casino Floor Infiltration Capture', 'stealth casino heist screenshot', 'casino-infiltration', {
      aesthetic: 'Casino floor infiltration capture: an original third-person stealth screenshot of a spy moving across a glittering casino floor, cameras, guards and chandeliers.',
      subject_treatment: `${keep}; show the subject blending into or sneaking across a glittering casino floor.`,
      color_and_tone: "Gold, deep red carpet and green felt, kept consistent across the whole image.",
      lighting_and_shadow: "Chandelier glow and table lamps, kept consistent across the whole image.",
      texture_and_material: "Velvet, polished brass, chips and cards, kept consistent across the whole image.",
      camera_and_composition: "Third-person over-the-shoulder across the floor, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with glamorous tension, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no readable signs, kept consistent across the whole image.",
      key_features: 'casino floor; disguised spy; security cameras; chandeliers',
    }, ['readable signs'], [
      'Walking calmly across a glittering casino floor in a tuxedo, an original spy passes a roulette wheel as a hidden elevator opens behind the high-stakes table. No readable text or logo.',
      'In a glamorous casino, a disguised spy accidentally wins the jackpot, drawing every guard in the building to celebrate him. No readable text or logo.',
      'On an empty casino floor at dawn, one roulette wheel is still spinning slowly, and the ball has not landed. No readable text or logo.',
    ]),
    capture('Found-Footage Night Horror Capture', 'camcorder horror game screenshot', 'found-footage', {
      aesthetic: 'Found-footage night horror capture: an original horror screenshot through a handheld night-vision camcorder, green grain, shaky frame and dark hallways.',
      subject_treatment: `${keep}; show the subject through a shaky night-vision camcorder view.`,
      color_and_tone: "Night-vision green with bright eye reflections, kept consistent across the whole image.",
      lighting_and_shadow: "Infrared glow and deep black corners, kept consistent across the whole image.",
      texture_and_material: "Heavy grain, motion blur and lens smudges, kept consistent across the whole image.",
      camera_and_composition: "Handheld first-person with tilted framing, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with raw terror, kept consistent across the whole image.",
      rendering_and_quality: "Convincing camcorder look with no readable overlays, kept consistent across the whole image.",
      key_features: 'night vision; handheld shake; grain; dark hallway',
    }, ['readable timestamps'], [
      'Filmed through a shaky night-vision camcorder in an abandoned asylum, an original explorer catches a tall figure at the end of the hall standing on the ceiling. No readable text or logo.',
      'Through a night-vision camcorder, a terrified explorer realizes the glowing eyes in the dark belong to a family of very curious raccoons. No readable text or logo.',
      'Through grainy green night vision, a hallway is empty, and a chair in the middle of it has been turned to face the camera. No readable text or logo.',
    ]),
    capture('Flashlight Corridor Horror Capture', 'flashlight exploration horror screenshot', 'flashlight-horror', {
      aesthetic: 'Flashlight corridor horror capture: an original first-person horror screenshot where a single flashlight cone is the only light in a long decaying corridor.',
      subject_treatment: `${keep}; reveal the subject only within a single flashlight beam in darkness.`,
      color_and_tone: 'Near black with a warm white flashlight cone.',
      lighting_and_shadow: "One hard flashlight beam and dense darkness, kept consistent across the whole image.",
      texture_and_material: "Peeling wallpaper, dust motes and wet floors, kept consistent across the whole image.",
      camera_and_composition: "First-person down a long corridor, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with creeping dread, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no HUD, kept consistent across the whole image.",
      key_features: 'flashlight cone; long corridor; darkness; dust motes',
    }, [], [
      "Lighting up a row of doors in a decaying hotel hallway, an original investigator's single beam reveals that every one of them is slowly opening at once. No readable text or logo.",
      'Creeping down a dark hallway with a flashlight, an investigator finds the source of the terrifying scratching noise: a very small, very determined mouse. No readable text or logo.',
      "Caught in a single hard beam at the end of the hallway, a mirror reflects the passage behind the investigator, but not the light she is holding. No readable text or logo.",
    ]),
    capture('Sewer Tunnel Crawl Capture', 'sewer dungeon exploration screenshot', 'sewer-crawl', {
      aesthetic: 'Sewer tunnel crawl capture: an original third-person screenshot of wading through vaulted brick sewers, green glowing water, rats and dripping pipes.',
      subject_treatment: `${keep}; show the subject wading through vaulted brick sewer tunnels.`,
      color_and_tone: "Murky green, brick brown and torch amber, kept consistent across the whole image.",
      lighting_and_shadow: "Torch glow and green water glow, kept consistent across the whole image.",
      texture_and_material: "Wet brick, grates, rust and sludge, kept consistent across the whole image.",
      camera_and_composition: "Third-person behind the character down the tunnel, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with grimy menace, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no HUD, kept consistent across the whole image.",
      key_features: 'vaulted brick sewers; green water; torchlight; rats',
    }, [], [
      'Wading waist-deep through a vaulted sewer, an original rat-catcher raises a torch as a crocodile wearing a crown of rusted grates rises from the glowing water. No readable text or logo.',
      'Deep in a sewer tunnel, a brave adventurer is escorted by a crowd of rats who clearly consider him their new king. No readable text or logo.',
      'At a junction of four sewer tunnels, three are dark and one is lit by candles that someone has recently placed along the ledge. No readable text or logo.',
    ]),
    capture('Speakeasy Shootout Capture', 'prohibition gangster game screenshot', 'speakeasy', {
      aesthetic: 'Speakeasy shootout capture: an original third-person screenshot of a jazz-age speakeasy mid-shootout, flipped tables, shattering bottles and smoky amber light.',
      subject_treatment: `${keep}; place the subject in a jazz-age speakeasy during a chaotic shootout.`,
      color_and_tone: "Amber, deep brown wood and brass, kept consistent across the whole image.",
      lighting_and_shadow: "Smoky lamp light and muzzle flashes, kept consistent across the whole image.",
      texture_and_material: "Wood paneling, glass bottles and velvet, kept consistent across the whole image.",
      camera_and_composition: "Low third-person behind cover, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with stylish violence without gore.',
      rendering_and_quality: "Clean capture with no readable signs, kept consistent across the whole image.",
      key_features: 'speakeasy; flipped tables; shattering bottles; amber smoke',
    }, ['readable signs'], [
      'Diving behind a flipped table as bottles shatter overhead, an original detective returns fire across a smoky speakeasy while the jazz band keeps playing on stage. No readable text or logo.',
      'In the middle of a speakeasy shootout, the bartender calmly keeps polishing the same glass and refuses to look up. No readable text or logo.',
      'In an empty speakeasy after the shooting, the piano keeps playing by itself in the smoky amber light. No readable text or logo.',
    ]),
    capture('Getaway Car Chase Capture', 'crime driving game screenshot', 'getaway-chase', {
      aesthetic: 'Getaway car chase capture: an original chase-camera screenshot of a getaway car tearing through city streets, police lights, sparks and flying debris.',
      subject_treatment: `${keep}; show the subject in a getaway car fleeing through city streets.`,
      color_and_tone: 'Night streets with red and blue police light.',
      lighting_and_shadow: "Headlights, sirens and street lamps, kept consistent across the whole image.",
      texture_and_material: "Wet asphalt, sparks and crumpled metal, kept consistent across the whole image.",
      camera_and_composition: "Chase camera behind the car, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with breakneck escape, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no HUD text, kept consistent across the whole image.",
      key_features: 'getaway car; police lights; sparks; chase camera',
    }, ['car brand logos'], [
      'Swerving through a flooded tunnel with police lights behind, an original getaway driver jumps the car over a rising drawbridge as the heist crew hangs on inside. No readable text or logo.',
      'In a high-speed getaway, the escaping crew stops at a red light because the driver is a stickler for road safety. No readable text or logo.',
      'On a wet night street, the police cars have all stopped chasing and are parked in a silent line behind the getaway car. No readable text or logo.',
    ]),
    capture('Museum Laser Grid Heist Capture', 'museum laser security screenshot', 'laser-heist', {
      aesthetic: 'Museum laser grid heist capture: an original stealth screenshot of a thief contorting through a grid of red security lasers toward a glowing exhibit case.',
      subject_treatment: `${keep}; show the subject slipping through a web of red security lasers in a museum.`,
      color_and_tone: 'Dark gallery with red laser lines and case glow.',
      lighting_and_shadow: "Laser beams in fog and exhibit spotlights, kept consistent across the whole image.",
      texture_and_material: "Marble floors, glass cases and haze, kept consistent across the whole image.",
      camera_and_composition: "Third-person low angle through the lasers, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with precise nerve, kept consistent across the whole image.",
      rendering_and_quality: "Clean capture with no readable plaques, kept consistent across the whole image.",
      key_features: 'laser grid; museum gallery; glowing case; contorting thief',
    }, ['readable plaques'], [
      'Contorting through a web of red lasers in a fog-filled gallery, an original thief reaches a glass case where an ancient egg has just begun to crack. No readable text or logo.',
      'Twisting through a laser grid with incredible skill, a master thief reaches the case and sneezes, triggering every alarm in the city. No readable text or logo.',
      'In a dark museum gallery, the lasers crisscross an empty display case whose glass is broken from the inside. No readable text or logo.',
    ]),
    capture('Cartoon Ghost-Catcher Capture', 'cartoon ghost hunting game screenshot', 'ghost-catcher', {
      aesthetic: 'Cartoon ghost-catcher capture: an original colorful screenshot of a nervous cartoon hero sucking ghosts into a vacuum in a spooky mansion full of glowing spirits.',
      subject_treatment: `${keep}; show the subject catching cartoon ghosts with a glowing vacuum.`,
      color_and_tone: 'Purple and teal spooky palette with glowing ghosts.',
      lighting_and_shadow: "Flashlight cones and ghost glow, kept consistent across the whole image.",
      texture_and_material: "Polished wood, cobwebs and translucent ghosts, kept consistent across the whole image.",
      camera_and_composition: "Third-person in a room full of ghosts, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with playful spooky fun.',
      rendering_and_quality: "Clean cartoon capture with no HUD, kept consistent across the whole image.",
      key_features: 'cartoon ghosts; vacuum beam; spooky mansion; glowing spirits',
    }, [], [
      'Wrestling a giant ghost into a glowing vacuum in a haunted dining room, an original nervous hero is lifted off his feet as plates and portraits swirl around him. No readable text or logo.',
      'In a spooky mansion, a cartoon ghost-catcher accidentally vacuums up the ghost\'s tiny pet ghost dog and now feels terrible about it. No readable text or logo.',
      "Hanging in a spooky mansion hallway after every ghost has been caught, the last portrait on the wall is quietly empty. No readable text or logo.",
    ]),
    capture('Underworld Boat Crossing Capture', 'river of the dead crossing screenshot', 'underworld-boat', {
      aesthetic: 'Underworld boat crossing capture: an original screenshot of a ferry crossing a dark river of souls, lanterns, drifting spirits and a distant gate of the dead.',
      subject_treatment: `${keep}; place the subject on a ferry crossing a dark underworld river.`,
      color_and_tone: 'Black water, pale ghost blue and lantern gold.',
      lighting_and_shadow: "Lantern glow and faint spirit light, kept consistent across the whole image.",
      texture_and_material: "Ancient wood, mist and translucent souls, kept consistent across the whole image.",
      camera_and_composition: 'Wide view across the river toward the gate.',
      atmosphere_and_mood: 'Keep the requested mood with solemn otherworldly calm.',
      rendering_and_quality: "Clean capture with no HUD, kept consistent across the whole image.",
      key_features: 'underworld river; ferry; lanterns; drifting souls',
    }, [], [
      'Crossing a black river of drifting souls, an original hero stands in a lantern-lit ferry as a colossal three-headed guardian dog watches from the far gate. No readable text or logo.',
      'On the ferry across the river of the dead, a passenger is arguing with the ferryman about the fare and trying to pay with a button. No readable text or logo.',
      'On a black river under a starless sky, the ferry returns empty, but the lantern at its bow is still being held up. No readable text or logo.',
    ]),
  ],
};

export default spec;
