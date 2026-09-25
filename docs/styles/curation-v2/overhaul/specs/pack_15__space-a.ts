import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Space, atomic and ray punks (part A): each punk is a culture shaped by one place or job in space.
const AVOID = [
  ...STYLE_AVOID,
  'real space agency insignia',
  'real brand or company logo',
  'franchise spaceship design',
];

const punk = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'punk', 'space'],
  dna: dna(fields),
  avoid: AVOID,
  briefs,
});

const spec: Spec = {
  pack: 'pack_15',
  category: '9. Space, Atomic & Ray Punks',
  updates: {
    'SP15-117': {
      briefs: [
        'A streamlined atomic-age city of enamel towers and radial starburst spires glows on a desert plateau at dusk, a gleaming finned rocket lifting off from the central plaza while families wave from boomerang-shaped balconies. No readable text or logo.',
        'A cheerful atomic-age housewife vacuums the living room with a small personal nuclear reactor strapped to her back, the family dog glowing faintly on the terrazzo floor. No readable text or logo.',
        'A boy lies on the roof of a mid-century house at night, watching a silver satellite blink across the starry sky above the quiet suburb. No readable text or logo.',
      ],
    },
    'SP15-118': {
      briefs: [
        'A pulp space hero in a finned bubble helmet fires a crackling ray-beam across a jungle moon at a towering tentacled robot, speed contours streaking behind her rocket pack as a ringed planet fills the sky. No readable text or logo.',
        'A ray-gun wielding space captain tries to intimidate an alien invader who turns out to be a tiny fluffy creature holding a very small ray gun of its own. No readable text or logo.',
        'A lonely rocket with sharp tapered fins stands on a silent alien plain at dawn, its pilot sitting on the ladder staring at two rising suns. No readable text or logo.',
      ],
    },
    'SP15-119': {
      briefs: [
        'Salvagers in patched suits cut apart a colossal derelict warship drifting in orbit, cable tethers and recovered hull panels spinning slowly around them as a planet turns below in silence. No readable text or logo.',
        'A salvage crew proudly rebuilds their ship entirely from recovered parts, and now its front half is a kitchen oven and its engine is a very large fridge. No readable text or logo.',
        'A salvager sits alone in the cockpit of a patched ship at night, fixing a small music box she found floating among the wreckage. No readable text or logo.',
      ],
    },
    'SP15-120': {
      briefs: [
        'A pale moon-lit city of curved habitats and silver gardens stretches across a lunar valley at night, relay towers glowing softly as a great silent migration of glowing moths crosses the Earth-lit sky. No readable text or logo.',
        'A lunar gardener proudly grows the first moon tomato and the entire colony gathers in a crowded greenhouse to watch her slice it, three astronauts crying openly. No readable text or logo.',
        'In a quiet moonlit greenhouse, an old woman sits among pale glowing plants, watching the blue Earth rise over the grey horizon. No readable text or logo.',
      ],
    },
  },
  creates: [
    punk(
      'Orbitalpunk',
      'orbital ring habitat punk',
      'orbitalpunk',
      {
        aesthetic:
          'Orbitalpunk: working-class life on crowded orbital rings and stations, with spinning habitat wheels, patched modules, laundry in zero wind and the planet always below.',
        subject_treatment:
          "Keep the prompt's subject and setting; move it onto a crowded spinning orbital habitat with the planet curving below the windows.",
        color_and_tone:
          'Worn white and grey modules, blue planet glow and warm interior lights against black space.',
        lighting_and_shadow:
          'Hard unfiltered sunlight and deep space shadow, softened by planet glow.',
        texture_and_material:
          'Scuffed composite panels, patched insulation, handrails, cables and small portholes.',
        camera_and_composition:
          'Curved horizons of habitat rings with the planet filling half the frame.',
        atmosphere_and_mood:
          'Cramped, lively and fragile, a neighborhood spinning above the world.',
        rendering_and_quality: 'Clean detailed illustration with crisp hard light and planet glow.',
        key_features:
          'spinning habitat rings; patched modules; planet below; crowded neighborhoods',
      },
      [
        'A giant orbital ring city spins above a storm-covered planet as a solar flare approaches, and a million residents rush along curved streets to close the shields while the sun turns violet. No readable text or logo.',
        'Residents of an orbital station hang laundry on a line across a spinning habitat wheel, and one sock escapes and slowly orbits the whole station for months. No readable text or logo.',
        'A child sleeps in a tiny bunk beside a round porthole, the blue curve of the planet slowly turning past her face all night. No readable text or logo.',
      ],
    ),
    punk(
      'Marspunk',
      'red planet frontier punk',
      'marspunk',
      {
        aesthetic:
          'Marspunk: a rough frontier culture on the red planet, with dust-caked domes, pressure-suit cowboys, rover caravans, rust storms and a tiny blue Earth in a pink sky.',
        subject_treatment:
          "Keep the prompt's subject and setting; set it on the red Martian frontier, with domes, rovers, rust dust and pressure suits.",
        color_and_tone:
          'Rust red, ochre and butterscotch sky with dusty whites and cold blue Martian sunsets.',
        lighting_and_shadow: 'Dim hazy sunlight through dust, blue sunsets and dome glow at night.',
        texture_and_material:
          'Rust dust, cracked regolith, scuffed suit fabric, dome glass and rover tires.',
        camera_and_composition:
          'Wide frontier landscapes with small domes and caravans under huge skies.',
        atmosphere_and_mood: 'Tough, lonely and pioneering, a wild west under a pink sky.',
        rendering_and_quality: 'Dusty cinematic illustration with hazy depth and fine rust grain.',
        key_features: 'dust-caked domes; rover caravans; rust storms; tiny blue Earth',
      },
      [
        'A caravan of battered rovers races across a red desert to outrun a planet-wide dust storm, the wall of rust towering kilometers high as a lone rider in a pressure suit waves the others toward the domes. No readable text or logo.',
        'A Martian sheriff in a dusty pressure suit tries to arrest a runaway farm robot that is stealing potatoes from the colony greenhouse. No readable text or logo.',
        'A colonist stands alone outside the dome at a blue Martian sunset, looking at a tiny bright dot that is home. No readable text or logo.',
      ],
    ),
    punk(
      'Asteroidpunk',
      'asteroid miner punk',
      'asteroidpunk',
      {
        aesthetic:
          'Asteroidpunk: gritty asteroid miners, with tethered drill crews, ore-hauling tugs, spinning rocks, dust clouds and makeshift bars carved into hollow asteroids.',
        subject_treatment:
          "Keep the prompt's subject and setting; move it into an asteroid field with tethered miners, drills, tugs and floating rock dust.",
        color_and_tone:
          'Charcoal and iron rock with dusty ochre, harsh white work lights and dark space.',
        lighting_and_shadow:
          'Harsh floodlights and hard sun on tumbling rocks, deep black shadows.',
        texture_and_material:
          'Pitted rock, metallic ore veins, grimy suits, drills, tethers and dust.',
        camera_and_composition: 'Tumbling rocks at many depths with small crews tethered to them.',
        atmosphere_and_mood: 'Dangerous, grimy and blue-collar, hard work at the edge of nothing.',
        rendering_and_quality:
          'Gritty high-contrast illustration with floating dust particles and harsh work light.',
        key_features: 'tethered drill crews; tumbling asteroids; ore tugs; floating dust',
      },
      [
        'Miners drill into an asteroid and crack open a hollow core glowing with a vast crystal cavern, the tethered crew floating inside it in stunned silence as the rock slowly tumbles toward a gas giant. No readable text or logo.',
        'An asteroid miner accidentally nudges a small rock that nudges another and another, and now the entire crew watches a slow-motion cosmic domino disaster. No readable text or logo.',
        'In a bar carved into a hollow asteroid, an old miner sits alone with a floating drink, watching rocks tumble past the window. No readable text or logo.',
      ],
    ),
    punk(
      'Cosmonautpunk',
      'retro space program punk',
      'cosmonautpunk',
      {
        aesthetic:
          'Cosmonautpunk: a bold retro space program built on grit, with orange pressure suits, round capsule hatches, heroic poster-like compositions and brutal launch complexes.',
        subject_treatment:
          "Keep the prompt's subject and setting; give it retro space-program gear, capsule hardware and heroic launch complexes.",
        color_and_tone:
          'Signal orange suits, olive and steel grey hardware with red accents and pale sky.',
        lighting_and_shadow: 'Strong flat daylight or launch flames lighting figures from below.',
        texture_and_material:
          'Canvas pressure suits, riveted capsules, round portholes, concrete and steel.',
        camera_and_composition: 'Low heroic angles with figures looking up at towering rockets.',
        atmosphere_and_mood: 'Heroic, stubborn and brave, space reached with hammers and courage.',
        rendering_and_quality:
          'Bold graphic illustration with poster-like heroic framing and grit.',
        key_features:
          'orange pressure suits; round capsule hatches; heroic angles; launch complexes',
      },
      [
        'A cosmonaut in a battered orange suit climbs out of a round capsule that has landed in a frozen forest, and a crowd of astonished villagers with torches stands in the snow around the smoking hatch. No readable text or logo.',
        'Mission control spends hours fixing a capsule problem that is eventually solved by the cosmonaut kicking the panel very hard. No readable text or logo.',
        'A cosmonaut floats alone inside a small capsule, a tiny wooden toy horse drifting beside her helmet as the Earth passes the porthole. No readable text or logo.',
      ],
    ),
    punk(
      'Megastructurepunk',
      'space megastructure punk',
      'megastructurepunk',
      {
        aesthetic:
          'Megastructurepunk: life on and inside colossal space megastructures, with ring worlds, star-sized shells, endless trusses and cities built into the seams.',
        subject_treatment:
          "Keep the prompt's subject and setting; place it on or inside a colossal space megastructure that dwarfs everything.",
        color_and_tone:
          'Steel grey and bronze structure against star light with deep blue space and warm city glows.',
        lighting_and_shadow:
          'Starlight raking across enormous trusses, cities glowing in the shadows.',
        texture_and_material:
          'Endless trusses, hull plating, cables, landscapes laid on metal and haze.',
        camera_and_composition:
          'Impossible scale with horizons curving up into the sky and tiny figures.',
        atmosphere_and_mood: 'Overwhelming and humbling, people as dust on the work of giants.',
        rendering_and_quality:
          'Epic detailed illustration with atmospheric scale and fine structure.',
        key_features: 'ring worlds; endless trusses; upward-curving horizons; cities in seams',
      },
      [
        'On the inside of a ring world, a whole ocean curves up into the sky and over the top, and a sailing ship crosses it heading toward a sunrise that never moves. No readable text or logo.',
        'A maintenance worker on a star-sized megastructure is told to go fix a loose bolt, and discovers the bolt is the size of a mountain. No readable text or logo.',
        'A small farmhouse sits alone on an endless metal plain of a megastructure, one window lit beneath a sky of giant trusses. No readable text or logo.',
      ],
    ),
    punk(
      'Cometpunk',
      'comet rider punk',
      'cometpunk',
      {
        aesthetic:
          'Cometpunk: nomads who ride and live on comets, with ice-cave homes, glowing tails, anchor harpoons and villages carried through the solar system.',
        subject_treatment:
          "Keep the prompt's subject and setting; set it on a comet's icy surface or glowing tail, with nomad camps and harpoon anchors.",
        color_and_tone:
          'Icy white and cold blue with glowing cyan and gold tails against deep space.',
        lighting_and_shadow: 'Blazing sun on ice, glowing tail light washing across the surface.',
        texture_and_material: 'Dirty ice, dust jets, frost-crusted gear, harpoon cables and tents.',
        camera_and_composition: 'Figures on the comet with the tail streaming dramatically behind.',
        atmosphere_and_mood: 'Wild, free and wandering, a village on a shooting star.',
        rendering_and_quality: 'Luminous illustration with glowing tail streams and icy detail.',
        key_features: 'comet villages; glowing tails; ice caves; harpoon anchors',
      },
      [
        'Comet riders harpoon a blazing comet as it swings past the sun and ride its glowing tail across the solar system, their whole ice village clinging to the surface as the tail roars behind them. No readable text or logo.',
        'A comet nomad tries to roast marshmallows over a dust jet and every single one gets blasted into orbit. No readable text or logo.',
        'A child stands at the mouth of an ice cave on a comet, watching the sun grow smaller as her home heads back into the dark. No readable text or logo.',
      ],
    ),
    punk(
      'Zero-G Punk',
      'weightless life punk',
      'zero-g',
      {
        aesthetic:
          'Zero-G Punk: a culture born in weightlessness, with floating hair, drifting objects, strap tethers, spherical rooms and people living upside down and sideways.',
        subject_treatment:
          "Keep the prompt's subject and setting; make it weightless, with figures, liquids and objects floating freely in every direction.",
        color_and_tone:
          'Soft whites and pale greys with bright floating objects and blue Earth light.',
        lighting_and_shadow:
          'Soft even interior light with floating objects casting small scattered shadows.',
        texture_and_material:
          'Floating water spheres, loose hair, fabric, tethers and padded walls.',
        camera_and_composition:
          'Rotated compositions with no clear up or down and objects everywhere.',
        atmosphere_and_mood: 'Playful, dreamy and strange, a life without a floor.',
        rendering_and_quality: 'Clean airy illustration with floating objects and water spheres.',
        key_features: 'floating objects; drifting hair; water spheres; no up or down',
      },
      [
        'A weightless orchestra plays inside a giant spherical concert hall, musicians floating in every direction with their instruments while globes of water drift through the air like glowing jellyfish. No readable text or logo.',
        'A dinner party in zero gravity turns into chaos when someone opens the soup, and a slowly spinning blob of it chases the guests around the room. No readable text or logo.',
        'An astronaut sleeps curled in the air in a quiet module, her hair floating around her like a halo in the soft light. No readable text or logo.',
      ],
    ),
    punk(
      'Solarsailpunk',
      'solar sail voyager punk',
      'solarsailpunk',
      {
        aesthetic:
          'Solarsailpunk: voyagers who cross space on vast solar sails, with gossamer mirror sheets, rigging lines, sail-crews in harnesses and ships pushed by sunlight.',
        subject_treatment:
          "Keep the prompt's subject and setting; bring in vast shimmering solar sails, rigging lines and crews working the sails in space.",
        color_and_tone:
          'Shimmering gold and silver sails with deep space black and bright sun white.',
        lighting_and_shadow: 'Blazing sunlight reflecting off vast mirror sails, rim-lit crews.',
        texture_and_material:
          'Gossamer mirror film, thin rigging, harnesses, carbon spars and starlight.',
        camera_and_composition:
          'Huge sails filling the frame with tiny crew figures along the rigging.',
        atmosphere_and_mood: 'Graceful, romantic and adventurous, sailing the sea of light.',
        rendering_and_quality:
          'Luminous elegant illustration with reflective sails and fine rigging.',
        key_features: 'mirror sails; fine rigging; harnessed sail crews; sun-pushed ships',
      },
      [
        'A fleet of solar sail ships with mirror sails the size of cities races out of a solar storm, crews in harnesses trimming the rigging as the golden light blazes off every sheet. No readable text or logo.',
        'A sail-crew member tries to fold a solar sail the size of a country back into its box and is now completely wrapped in shimmering film. No readable text or logo.',
        'A single sailor sits on a spar of a vast silent solar sail, the gold sheet glowing behind her as she drifts far from any star. No readable text or logo.',
      ],
    ),
  ] satisfies Create[],
};

export default spec;
