import type { Spec } from '../tools/apply';
import { ga, keep } from './_authors';

// Video game pass, psychological and tactical gameplay: each preset names its game, studio and
// year and states the real render technique and camera. Presets that duplicated a neighbor
// (the second jungle stealth, the second cargo trek) move to other games with the same genre.
// Intentional-v1 presets (SP12-081 to SP12-098) keep their own policy and stay out of this pass.
const spec: Spec = {
  pack: 'pack_12',
  category: '11. Psychological & Tactical Gameplay',
  updates: Object.fromEntries([
    ga('SP12-207', 'Silent Hill 1999 - Team Silent PS1 Fog', {
      look: 'Team Silent Silent Hill (1999) look: PlayStation horror with thick fog hiding a tiny draw distance, crackling radio, blocky town streets, darkness and heavy grain.',
      subject:
        'show people as blocky figures with simple smeared faces, half lost in a grey fog wall.',
      color: 'White fog and rust.',
      light:
        'Thick grey fog that swallows everything a few steps away, a flashlight cone at night.',
      texture:
        'Blurry textures that wobble on simple boxy streets and buildings, grain over everything.',
      camera: 'Third-person fog view.',
      mood: 'unknowable foggy dread',
      render:
        'A 1999 PlayStation frame at 320 by 240 on a CRT: soft, jagged and foggy, a static crackle of grain.',
      key: 'Silent Hill 1999 fog wall; blocky figures; grainy soft PS1',
      avoid: ['a pyramid-helmeted executioner'],
      briefs: [
        'Walking down a street swallowed by white fog, an original man clutches a crackling radio as a towering silhouette on stilt-like legs drags a squeaking hospital gurney just out of sight. No readable text or logo.',
        keep('SP12-207')[1],
        keep('SP12-207')[2],
      ],
    }),
    ga('SP12-208', 'Silent Hill Homecoming 2008 - Double Helix Peeling Otherworld', {
      look: 'Double Helix Silent Hill: Homecoming (2008) look: walls peeling away like burning paper into a rusted otherworld of grates and chain link, sirens and industrial rot.',
      subject: 'render people as survivors caught between normal rooms and rust.',
      color: 'Rust red, ash and dirty metal.',
      light: 'Dark rooms lit by red siren light and a flashlight.',
      texture: 'Peeling paper curling away to reveal rust and grates underneath.',
      camera: 'Third-person transition view.',
      mood: 'screaming nightmare shift',
      render:
        'A 2008 frame at 1280 by 720 in third person: a room mid-transformation into rust, a small flashlight cone.',
      key: 'Homecoming peeling walls; rust otherworld; sirens',
    }),
    ga('SP12-209', 'P.T. 2014 - Kojima Productions Looping Hallway', {
      look: 'Kojima Productions P.T. (2014) look: photoreal first-person L-shaped suburban hallway that repeats endlessly, a radio, family photos and flickering light.',
      subject: 'render people as unseen first-person visitors in a domestic hallway.',
      color: 'Dim beige, sickly green and shadow.',
      light: 'A single flickering hallway bulb with deep dark corners.',
      texture: 'Photoreal domestic walls, frames and floorboards with slight grain.',
      camera: 'First-person hallway view.',
      mood: 'looping domestic terror',
      render:
        'A 2014 first-person frame at 1920 by 1080: an L-shaped hallway, no interface at all.',
      key: 'P.T. looping hallway; photoreal; dread',
    }),
    ga('SP12-210', 'Crysis 2007 - Crytek Jungle Stealth', {
      look: 'Crytek Crysis (2007) look: first-person tropical island jungle in lush CryEngine detail, dense foliage, cloaking stealth, patrols and god rays.',
      subject: 'render people as soldiers in face paint and jungle gear.',
      color: 'Lush jungle green and sun gold.',
      light: 'Bright god rays through dense tropical foliage.',
      texture: 'Dense photoreal foliage, sharp nearby and softer beyond, very busy with leaves.',
      camera: 'First-person jungle view.',
      mood: 'tense predatory stealth',
      render:
        'A 2007 PC frame at 1920 by 1200 in first person: rifle at bottom right, jungle, a small compass and number shapes.',
      key: 'Crysis jungle; foliage; stealth',
      avoid: ['a ribbed nanosuit'],
    }),
    ga('SP12-211', 'Metal Gear Solid 1998 - Konami Shadow Base', {
      look: 'Konami Metal Gear Solid (1998) look: PlayStation stealth at a snowy Alaskan base with blocky soldiers, sweeping searchlights, boxy corridors and a radar box.',
      subject:
        'show people as blocky soldiers and guards with smeared painted faces and stiff chunky limbs.',
      color: 'Snow white, steel grey and night blue.',
      light: 'Night with sweeping searchlight cones on snowy ground.',
      texture: 'Blurry textures that wobble on boxy base buildings, grainy snow.',
      camera: 'Overhead stealth camera.',
      mood: 'tense cold infiltration',
      render:
        'A 1998 PlayStation frame at 320 by 240 on a CRT from a high camera: soft, jagged, a radar box shape top right.',
      key: 'MGS1 blocky soldiers; searchlights; snowy base; radar box',
      avoid: ['a soldier in a sneaking suit with a bandana', 'existing Metal Gear walkers'],
    }),
    ga('SP12-212', "Jusant 2023 - Don't Nod Climbing Pilgrimage", {
      look: "Don't Nod Jusant (2023) look: stylized painterly climbing up a huge tower in a drought world, a small climber with a pack, ropes, moss and whale-like creatures drifting in the air.",
      subject: 'render people as small stylized climbers with big packs.',
      color: 'Soft stone, moss green and sky blue.',
      light: 'Soft painted light on warm stone cliffs.',
      texture: 'Painterly stone and cloth with soft brush detail.',
      camera: 'Wide climbing view.',
      mood: 'quiet meditative ascent',
      render:
        'A 2023 frame at 1920 by 1080 in third person: small climber with a big pack on a vast cliff, no interface.',
      key: 'Jusant climbing; drought world; floating whales',
    }),
    ga('SP12-213', 'Layers of Fear 2016 - Bloober Team Shifting Rooms', {
      look: 'Bloober Team Layers of Fear (2016) look: first-person Victorian house that shifts behind you, a painter descending into madness, warped rooms and dripping paint.',
      subject: 'render people as haunted artists seen from first person.',
      color: 'Victorian brown, oil paint and shadow.',
      light: 'Candlelight with rooms that seem to bend and stretch.',
      texture: 'Oil paint, wood and plaster, with paintings melting on the walls.',
      camera: 'First-person warped view.',
      mood: 'unraveling artistic madness',
      render:
        'A 2016 first-person frame at 1920 by 1080: a room warping as the view turns, no interface.',
      key: 'Layers of Fear shifting rooms; paint; madness',
    }),
    ga('SP12-214', 'Condemned 2005 - Monolith Derelict First-Person', {
      look: 'Monolith Productions Condemned: Criminal Origins (2005) look: first-person grimy derelict buildings, forensic flashlight, melee pipes and gaunt figures in darkness.',
      subject: 'render people as gaunt figures in a grimy derelict interior.',
      color: 'Grimy green, flashlight white and rust.',
      light: 'A narrow flashlight beam in dark derelict rooms.',
      texture: 'Grimy decay, stained walls and debris with slightly blurry textures.',
      camera: 'First-person flashlight view.',
      mood: 'grimy lurking dread',
      render:
        'A 2005 Xbox 360 first-person frame at 1280 by 720: a pipe held at the bottom, a bar shape at the top.',
      key: 'Condemned grime; flashlight; derelict',
    }),
    ga('SP12-215', 'Splinter Cell Chaos Theory 2005 - Ubisoft Montreal Night Stealth', {
      look: 'Ubisoft Montreal Splinter Cell: Chaos Theory (2005) look: third-person stealth in rain and darkness, light meters, green night-vision goggles and guards with flashlights.',
      subject: 'render people as stealth operatives in dark gear.',
      color: 'Night black, goggle green and rain blue.',
      light: 'Near-total darkness with flashlight sweeps; night vision turns everything green.',
      texture:
        'Wet dark gear and rain with glossy highlights, deep black shadows swallowing most surfaces.',
      camera: 'Third-person stealth view.',
      mood: 'tense silent infiltration',
      render:
        'A 2005 frame at 1024 by 768 in third person: operative in shadow, a light meter bar shape bottom right.',
      key: 'Splinter Cell darkness; goggles; rain',
      avoid: ['three green night-vision lenses'],
    }),
    ga('SP12-216', 'LSD Dream Emulator 1998 - Asmik Ace PS1 Dreams', {
      look: 'Asmik Ace LSD Dream Emulator (1998) look: surreal PlayStation dream exploration of simple blocky pastel worlds, warped textures and impossible links between places.',
      subject:
        'show people as simple blocky dream figures with flat painted faces in surreal pastel places.',
      color: 'Pastel pink, sky blue and surreal colors.',
      light: 'Flat dream light in odd pastel colors with no shadows.',
      texture: 'Stretched and warped blurry textures on simple shapes, strange repeated patterns.',
      camera: 'First-person dream view.',
      mood: 'uncanny dreamy drift',
      render:
        'A 1998 PlayStation frame at 320 by 240 on a CRT in first person: soft, jagged and surreal, no interface.',
      key: 'LSD Dream Emulator pastel blocky dreams; warped textures; surreal',
    }),
    ga('SP12-217', 'Dear Esther 2012 - The Chinese Room Island', {
      look: 'The Chinese Room Dear Esther (2012) look: first-person walk across a lonely Hebridean island, lighthouses, storms, caves and melancholic narration.',
      subject: 'render people as lonely wanderers seen from first person.',
      color: 'Storm grey, sea teal and lamp gold.',
      light: 'Stormy grey light with a lighthouse beam sweeping.',
      texture: 'Realistic rock and sea spray, slightly soft and lonely.',
      camera: 'First-person lamp room view.',
      mood: 'melancholic windswept isolation',
      render:
        'A 2012 first-person frame at 1920 by 1080: rocky island path, lighthouse ahead, no interface.',
      key: 'Dear Esther island; lighthouse; storm',
    }),
    ga('SP12-218', 'Deathloop 2021 - Arkane Lyon Retro Loop', {
      look: 'Arkane Lyon Deathloop (2021) look: sixties retro-futurist island party in a time loop, mod colors, masked partygoers and stylized painterly art.',
      subject: 'render people as masked sixties partygoers.',
      color: 'Mod orange, teal and gold.',
      light: 'Bright sixties party lights at midnight.',
      texture: 'Stylized painted surfaces with bold retro colors and patterns.',
      camera: 'First-person party view.',
      mood: 'stylish looping intrigue',
      render:
        'A 2021 first-person frame at 1920 by 1080: a gun held at the bottom, masked partygoers, small power slot shapes.',
      key: 'Deathloop sixties; masks; time loop',
    }),
    ga('SP12-219', 'STALKER Shadow of Chernobyl 2007 - GSC Zone Forest', {
      look: 'GSC Game World S.T.A.L.K.E.R.: Shadow of Chernobyl (2007) look: first-person survival in the Zone, misty forests, anomalies, rusted Soviet ruins and snipers.',
      subject: 'render people as stalkers in hoods and gas masks.',
      color: 'Grey-green mist and rust.',
      light: 'Grey overcast mist over ruined industry.',
      texture: 'Grimy concrete and rust with blurry textures up close, dull greens and browns.',
      camera: 'First-person scope view.',
      mood: 'paranoid patient survival',
      render:
        'A 2007 PC frame at 1280 by 1024 in first person: rifle at the bottom, misty Zone, a small minimap circle top left.',
      key: 'STALKER Zone; mist; anomalies',
    }),
    ga('SP12-220', 'Yomawari Night Alone 2015 - Nippon Ichi Night Walk', {
      look: 'Nippon Ichi Software Yomawari: Night Alone (2015) look: a small chibi girl with a flashlight walking a dark Japanese suburb at night, cute art and creeping spirits.',
      subject: 'render people as small chibi figures with flashlights.',
      color: 'Night blue with flashlight yellow.',
      light: 'A small flashlight cone in dark night streets.',
      texture: 'Soft hand-drawn art with simple outlines and flat colors.',
      camera: 'Top-down night walk view.',
      mood: 'cute creeping dread',
      render:
        'A 2015 frame at 960 by 544: tiny chibi girl with a flashlight on a dark street, a heart shape in a corner.',
      key: 'Yomawari night walk; chibi; spirits',
    }),
  ]),
};

export default spec;
