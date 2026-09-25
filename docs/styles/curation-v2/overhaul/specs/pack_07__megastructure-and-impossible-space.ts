import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'black and gold sci-fi palette by default',
  'franchise ship or station likeness',
  'readable signage or screens',
  'glossy mirror floor by default',
];

// Two contracts: megastructure and habitat profiles keep the requested geometry stable and own surfaces and scale;
// paradox profiles advertise the structural change they make.
const habitat = (what: string) =>
  `Keep the requested subject, action and geometry stable; this preset owns ${what}, and it never bends, loops or breaks the requested structure.`;
const paradox = (what: string) =>
  `Keep the requested subject recognisable; this preset openly changes its structure into ${what}, and that advertised structural change is the purpose of the preset.`;

function space(parts: Dna): Dna {
  return parts;
}

const spec: Spec = {
  pack: 'pack_07',
  category: '7. Megastructure And Impossible Space',
  updates: {
    'SP07-010': {
      dna: space({
        aesthetic:
          'Pod architecture: rooms and shells molded as cornerless white polymer capsules with seamless joints, rounded thresholds and soft cyan light embedded in the seams.',
        subject_treatment: habitat(
          'the seamless capsule enclosure and its molded polymer surfaces',
        ),
        color_and_tone:
          'Gloss white and pale grey with soft cyan seam glow and one warm accent material such as tan upholstery; very high key.',
        lighting_and_shadow:
          'Indirect cove light from recessed seams, almost shadowless, gentle gradients along the curved walls.',
        texture_and_material:
          'Glossy molded polymer, generous fillets instead of corners, no visible screws, grout or panel gaps.',
        camera_and_composition:
          'Keep the requested layout and view; every edge becomes a radius and openings become rounded ovals.',
        atmosphere_and_mood: 'Calm, clinical and optimistic, a future that has been sanded smooth.',
        rendering_and_quality:
          'Clean product-grade render with soft reflections; no clouds, rings or orbital setting added by default.',
        key_features:
          'cornerless white polymer shells; seamless molded joints; rounded oval thresholds; cyan seam glow; shadowless cove light',
      }),
      avoid: [...AVOID, 'cloud city backdrop', 'orbital ring backdrop'],
      briefs: [
        'Pod architecture: a capsule hotel carved into a sheer cliff, a honeycomb of cornerless white polymer pods with rounded oval openings, cyan light glowing in every seam, seen from across the valley at blue hour. No text or logo.',
        'Pod architecture: a single meditation capsule resting on a black mirror-still lake, its seamless white shell split by one oval threshold, soft cyan seam glow reflected in the water. No text or logo.',
        'Pod architecture applied to a hotel bathroom with its basin, shower and mirror kept in place, every corner rounded into molded white polymer, cyan light in the seams, shadowless cove light. No text or logo.',
      ],
    },
    'SP07-031': {
      dna: space({
        aesthetic:
          'Working space-station interior: beige equipment racks, circular hatches, blue hook-and-loop patches and retention straps, cables bungeed to every wall and no up or down.',
        subject_treatment: habitat(
          'the microgravity utility-module surfaces, stowage and floating clutter',
        ),
        color_and_tone:
          'Equipment beige, off-white, hook-and-loop blue and cable grey, with small red and yellow handle accents; low contrast.',
        lighting_and_shadow:
          'Flat fluorescent strip panels, few shadows, one porthole spilling cool planet light across the clutter.',
        texture_and_material:
          'Velcro fuzz, fabric stowage bags, screwed panels, bungee cords, scuffed handrails; labels left blank.',
        camera_and_composition:
          'Keep the requested layout; objects float tethered, gear is clipped to walls and ceiling alike.',
        atmosphere_and_mood:
          'Cramped, practical and lived-in, a workplace where nothing can be put down.',
        rendering_and_quality:
          'Documentary interior photograph realism; never an ornate gold station exterior.',
        key_features:
          'beige equipment racks; circular hatches; blue hook-and-loop patches and straps; floating tethered objects; flat fluorescent strip light',
      }),
      avoid: [...AVOID, 'ornate gold station exterior'],
      briefs: [
        'Working space-station interior: a greenhouse module with lettuce trays strapped to all four walls, floating water droplets, blue hook-and-loop patches, beige racks and flat fluorescent light, a porthole of blue planet light. No text or logo.',
        "Working space-station interior turned into an alchemist's workshop, glass flasks and retorts held by bungee cords, a brass astrolabe floating on a tether, beige panels and circular hatch behind. No readable labels or logo.",
        'Working space-station interior applied to a home kitchen with the same counter, fridge and sink layout, utensils velcroed to the cabinets, a kettle floating on a strap, flat fluorescent light. No readable labels or logo.',
      ],
    },
    'SP07-064': {
      dna: space({
        aesthetic:
          'Buoyant retrofuture architecture: pearl-ivory streamline superstructures held aloft on gas envelopes and ring platforms above a sea of clouds, champagne metal seams and perimeter beacons.',
        subject_treatment: habitat(
          'the airborne platform setting above the clouds and the streamline finish',
        ),
        color_and_tone:
          'Pearl ivory, champagne gold, sunset peach and lavender clouds; soft pastel gradients with no black.',
        lighting_and_shadow:
          'Low sunset side light, clouds glowing from below, soft beacon points along every rim.',
        texture_and_material:
          'Enamel-smooth ivory panels, brushed champagne seams, taut fabric gas envelopes with rib lines.',
        camera_and_composition:
          'Keep the requested geometry; the cloud floor always lies below, with no ground or baseplate in view.',
        atmosphere_and_mood: 'Serene, elegant and buoyant, mid-century optimism at altitude.',
        rendering_and_quality:
          'Airbrushed retro-futurist illustration polish with soft gradients and crisp streamline edges.',
        key_features:
          'pearl-ivory streamline forms; gas envelopes and ring platforms; champagne metal seams; cloud sea below; airbrushed sunset gradients',
      }),
      avoid: [...AVOID, 'dark gritty sci-fi', 'ground-level city'],
      briefs: [
        'Buoyant retrofuture architecture: an observatory ring moored to three gas envelopes above a lavender cloud sea at sunset, pearl-ivory dome, champagne seams, beacons pulsing along the rim, airbrushed gradients. No text or logo.',
        'Buoyant retrofuture architecture: an aerial vineyard of terraced ivory platforms hanging from rib-lined gas envelopes, rows of vines in the peach light, clouds glowing below. No text or logo.',
        'Buoyant retrofuture architecture applied to a roadside motel kept exactly as it is, its row of doors and parking bays lifted onto an ivory ring platform above a cloud sea. No readable signage or logo.',
      ],
    },
    'SP07-075': {
      dna: space({
        aesthetic:
          'Impossible circulation: stairs, ramps and walkways that connect into closed loops, climbing forever yet returning to their start, built as solid architecture.',
        subject_treatment: paradox(
          'a closed impossible circulation loop of stairs, ramps or channels',
        ),
        color_and_tone:
          'Pale board-formed concrete, warm limestone and clear sky blue; calm, even and believable.',
        lighting_and_shadow:
          'One consistent midday sun with crisp shadows, making the impossible connections look physically real.',
        texture_and_material:
          'Board-formed concrete, worn stair nosings, limestone treads, simple iron railings.',
        camera_and_composition:
          'Elevated near-isometric view chosen so the loop closes exactly at the viewpoint.',
        atmosphere_and_mood:
          'Calm and quietly dizzying, a structure that makes sense until it does not.',
        rendering_and_quality:
          'Architectural photograph realism, not lithograph linework or tessellated print, which belongs to Escher Style.',
        key_features:
          'closed circulation loops; endlessly ascending stairs; built concrete and limestone; consistent midday sun; elevated near-isometric view',
      }),
      avoid: [...AVOID, 'lithograph linework', 'tessellated animals'],
      briefs: [
        'Impossible circulation: a monastery cloister where four limestone stairways climb forever around a courtyard and meet at their own start, board-formed concrete landings, crisp midday shadows, elevated near-isometric view. No text or logo.',
        'Impossible circulation: a hillside waterworks whose aqueduct channels carry water uphill in a closed loop back to their own source, a mill wheel turning at the top, clear sky. No text or logo.',
        'Impossible circulation applied to an ordinary apartment block external staircase, the concrete flights rising floor after floor and arriving back at the ground-floor door. No readable signage or logo.',
      ],
    },
    'SP07-076': {
      dna: space({
        aesthetic:
          'Stellar shell megastructure: a star enclosed by a shell or swarm of near-black hexagonal panels and graphite heat fins, solar gold light leaking through every gap.',
        subject_treatment: habitat('the star-enclosing shell setting and its planet-sized scale'),
        color_and_tone:
          'Graphite black panels, molten solar gold and white-hot corona; the only colors are black, gold and white.',
        lighting_and_shadow:
          'The star as a single blinding backlight; panels silhouetted, corona rim light on every edge.',
        texture_and_material:
          'Hexagonal panel tiling, ribbed heat fins, micrometeor pitting and panel gaps at planetary scale.',
        camera_and_composition:
          'Keep the requested geometry; the curvature of the shell and tiny scale cues convey planet-sized distance.',
        atmosphere_and_mood: 'Awesome, cold and silent, engineering on the scale of a star.',
        rendering_and_quality:
          'Hard-edged space rendering with controlled bloom; no ornate gold filigree or baroque trim.',
        key_features:
          'near-black hexagonal shell panels; graphite heat fins; solar gold leaking through gaps; corona rim light; planet-scale curvature',
      }),
      avoid: [...AVOID, 'ornate gold filigree', 'ground-level planet surface'],
      briefs: [
        'Stellar shell megastructure: a half-built swarm of near-black hexagonal panels around a red dwarf star, gaps still open with solar gold pouring through, corona rim light on thousands of heat fins. No text or logo.',
        'Stellar shell megastructure: the inner surface of the shell seen from a maintenance ledge, hex panels curving away in every direction, the white-hot star below filling the frame with light. No text or logo.',
        'Stellar shell megastructure applied to a glass greenhouse dome kept in its exact shape, clad in near-black hexagonal heat-fin panels with gold light leaking through the seams. No text or logo.',
      ],
    },
    'SP07-077': {
      dna: space({
        aesthetic:
          'Orbital ribbon habitat: a landscape laid on the inside of a vast ring, the ground rising into the sky on both sides, held in by charcoal containment walls.',
        subject_treatment: habitat('the ring-habitat setting whose horizon curves upward'),
        color_and_tone:
          'Ocean cyan bands, green and ochre land strips, atmospheric blue haze and charcoal walls; natural and airy.',
        lighting_and_shadow:
          'Sunlight falling from overhead through shade panels, the far arc of the ring hazed and bright.',
        texture_and_material:
          'Real terrain, clouds and water on the near ground, fading to a map-like band as the ring rises away.',
        camera_and_composition:
          'Keep the requested subject in the foreground; the horizon never falls away but always climbs upward.',
        atmosphere_and_mood: 'Expansive and uncanny, the whole world overhead.',
        rendering_and_quality:
          'Naturalistic landscape rendering with correct aerial haze along the rising arc; never a globe view.',
        key_features:
          'horizon curving upward; landscape band overhead; charcoal containment walls; ocean-cyan strips; aerial haze along the arc',
      }),
      avoid: [...AVOID, 'globe seen from space', 'flat horizon'],
      briefs: [
        'Orbital ribbon habitat: a coastal fishing village on the inner surface of a ring, the ocean band arching up into the sky behind it, charcoal containment wall at the edge, aerial haze on the rising arc. No text or logo.',
        'Orbital ribbon habitat: a desert band with red dunes climbing overhead into haze, a salt lake glinting halfway up the sky, sun falling through shade panels. No text or logo.',
        'Orbital ribbon habitat applied to a farmhouse and barn kept exactly as they are, the wheat fields behind them curving up into the sky and over the top of the frame. No text or logo.',
      ],
    },
    'SP07-078': {
      dna: space({
        aesthetic:
          'Cybernetic hive infrastructure: recursive grids of cube-shell alcoves stacked on service frames, dense conduit bundles and graphite panels, each cell lit phosphor green.',
        subject_treatment: habitat('the recursive cube-cell grid and conduit surfaces'),
        color_and_tone:
          'Graphite, black and phosphor green with pale steel conduit highlights; monochrome green on dark.',
        lighting_and_shadow:
          'Green glow from inside each cell, darkness between them, faint haze giving depth to the grid.',
        texture_and_material:
          'Matte graphite panels, braided conduit bundles, cable trays, identical cube cells repeating to infinity.',
        camera_and_composition:
          'Keep the requested layout; walls become repeating cell grids receding in deep one-point perspective.',
        atmosphere_and_mood:
          'Relentless and mechanical, a place built for processes rather than people.',
        rendering_and_quality:
          'Precise hard-surface rendering with exact repetition; no concrete, no dusk sky, no gold.',
        key_features:
          'recursive cube-cell alcoves; conduit bundles on service frames; graphite panels; phosphor-green cell glow; deep one-point repetition',
      }),
      avoid: [...AVOID, 'insect hive', 'creature'],
      briefs: [
        'Cybernetic hive infrastructure: a server hive rising like a cathedral nave of stacked cube alcoves, every cell glowing phosphor green, conduit bundles hanging between tiers, deep one-point perspective into haze. No text or logo.',
        'Cybernetic hive infrastructure: a docking hangar where small maintenance pods slot into green-lit cube cells on vast graphite service frames, seen from below. No text or logo.',
        'Cybernetic hive infrastructure applied to a hotel lobby with its reception desk and seating kept, the walls turned into stacked green-lit cube alcoves with braided conduit bundles. No readable signage or logo.',
      ],
    },
    'SP07-079': {
      dna: space({
        aesthetic:
          'Absolute black monolith: architecture reduced to matte light-absorbing black volumes with no ornament, readable only by a faint silver edge light and its shadow.',
        subject_treatment: habitat(
          'the light-absorbing black material and the vast empty setting around it',
        ),
        color_and_tone:
          'Absolute black volumes against silver-grey sky and pale ground; no other color at all.',
        lighting_and_shadow:
          'Flat overcast light, a hairline silver highlight on one edge, a crisp pale shadow on the ground.',
        texture_and_material:
          'Surfaces show no texture, reflection or detail; only the silhouette and the ground shadow describe form.',
        camera_and_composition:
          'Keep the requested geometry; a vast empty ground and one tiny scale cue such as a tree or a boulder.',
        atmosphere_and_mood: 'Austere, silent and ominous, an absence standing in the landscape.',
        rendering_and_quality:
          'Minimal photographic rendering with pure black planes; no panels, runes or ornament.',
        key_features:
          'matte light-absorbing black volume; hairline silver edge light; vast empty ground; one tiny scale cue; crisp pale shadow',
      }),
      avoid: [...AVOID, 'gold trim', 'panel detailing'],
      briefs: [
        'Absolute black monolith: a cube mausoleum of light-absorbing black standing on a white salt flat, one bare tree beside it as a scale cue, a hairline of silver edge light, flat overcast sky. No text or logo.',
        'Absolute black monolith: a stepped black ziggurat emerging from low fog on a moor, its terraces readable only by thin silver edges and the pale shadow in the fog. No text or logo.',
        'Absolute black monolith applied to a suburban house kept in its exact shape, porch and chimney included, made of pure light-absorbing black so only its roofline catches a silver edge. No text or logo.',
      ],
    },
    'SP07-080': {
      dna: space({
        aesthetic:
          'Analog space-age retrotech: interiors clad in copper and brass hexagonal nodes, organic coral-like ribs, glowing glass tubes and braided cable runs.',
        subject_treatment: habitat('the retrotech wall, ceiling and fixture surfaces'),
        color_and_tone:
          'Warm copper and brass, amber and teal glass glow, cream enamel; saturated warm with cool accents.',
        lighting_and_shadow:
          'Glow from glass tubes and backlit hex nodes, warm pools, soft shadows between the ribs.',
        texture_and_material:
          'Brushed copper, patinated brass, frosted glass tubes, braided fabric cable, cream enamel panels.',
        camera_and_composition:
          'Keep the requested layout; ribs rise along the walls and hex-node clusters replace flat surfaces.',
        atmosphere_and_mood:
          'Warm, humming and exploratory, the future as a 1970s engineer imagined it.',
        rendering_and_quality:
          'Rich tactile interior rendering; no circular wall roundels, no central console, no steam.',
        key_features:
          'copper-brass hexagonal nodes; organic coral-like ribs; glowing glass tubes; braided cable runs; amber and teal glow',
      }),
      avoid: [...AVOID, 'circular wall roundels', 'central console room', 'steam venting'],
      briefs: [
        'Analog space-age retrotech: a deep-space botanical laboratory with coral-like copper ribs arching over tables of seedlings, amber glass tubes glowing along the walls, braided cables looping between hex-node clusters. No text or logo.',
        'Analog space-age retrotech: a music listening lounge with walls of backlit brass hex nodes, teal glass tubes pulsing above low cream enamel sofas, warm pools of light on the floor. No text or logo.',
        'Analog space-age retrotech applied to a railway waiting room with its benches, clock and ticket window kept, rebuilt in copper hex nodes, coral ribs and glowing glass tubes. No readable text, numerals or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Droste Recursive Room',
      domain: 'self-containing recursive space',
      tags: ['droste', 'recursion', 'paradox'],
      dna: space({
        aesthetic:
          'Droste recursion: the space contains a smaller exact copy of itself through a window, doorway or frame, which contains another, receding without end.',
        subject_treatment: paradox('a self-containing recursion that repeats inside itself'),
        color_and_tone:
          'The scene palette repeated at every level, each recursion a step cooler and dimmer toward the center.',
        lighting_and_shadow:
          'One lighting setup repeated exactly at every level, so the copies read as the same place.',
        texture_and_material:
          'Materials stay identical at every scale until they blur into a point at the vanishing center.',
        camera_and_composition:
          'Frontal or spiral composition, the recursion centered or twisting inward on a Droste spiral.',
        atmosphere_and_mood: 'Hypnotic and vertiginous, a room with no final wall.',
        rendering_and_quality:
          'Seamless recursion with no visible seam or collage frame; the copies are continuous space.',
        key_features:
          'space containing its own copy; endless inward repetition; centered or spiral recursion; cooler dimmer levels; seamless continuity',
      }),
      avoid: [...AVOID, 'psychedelic color melt', 'mirror reflections instead of real recursion'],
      briefs: [
        'Droste recursion: a candle-lit great hall whose far window opens onto the same hall, whose window opens onto it again, receding to a point, each level slightly cooler and dimmer. No text or logo.',
        'Droste recursion: a clock tower facade twisting inward on a Droste spiral, the tower appearing again and again inside its own clock face, smaller with every turn. No numerals, text or logo.',
        'Droste recursion applied to a small bakery shopfront whose display window contains the same shopfront, loaves and awning repeated inward without end. No readable signage or logo.',
      ],
    },
    {
      name: 'Folded-Horizon City',
      domain: 'folded ground-plane paradox',
      tags: ['fold', 'horizon', 'paradox'],
      dna: space({
        aesthetic:
          'Folded horizon: the ground plane hinges upward along a sharp crease and folds over itself, streets and buildings continuing upside down overhead.',
        subject_treatment: paradox(
          'a ground plane folded along a hinge so the setting continues overhead',
        ),
        color_and_tone:
          'Ordinary daylight neutrals of the place, with the overhead half slightly hazier and bluer.',
        lighting_and_shadow:
          'One sun lighting both halves consistently, so shadows point the same way on the folded plane.',
        texture_and_material:
          'The real materials of the requested setting, unchanged, only relocated by the fold.',
        camera_and_composition:
          'Horizon replaced by a crisp fold line; the upper half of the frame is the same world hanging overhead.',
        atmosphere_and_mood: 'Disorienting and grand, the world closing like a book.',
        rendering_and_quality:
          'Photographic realism along a clean hinge, not a smooth ring curve or a mirror reflection.',
        key_features:
          'ground hinging along a sharp crease; setting continuing upside down overhead; one consistent sun; fold line instead of horizon; hazier upper half',
      }),
      avoid: [...AVOID, 'mirror reflection', 'smooth ring curve'],
      briefs: [
        'Folded horizon: a walled medieval town whose streets hinge upward along a sharp crease and continue upside down overhead, rooftops and towers hanging above the market square, one sun lighting both halves. No text or logo.',
        'Folded horizon: terraced hill farms folding up like a page, the upper terraces hanging overhead with their orchards pointing down, a river running up the crease. No text or logo.',
        'Folded horizon applied to a suburban cul-de-sac whose far end hinges up and folds over the street, the same houses and driveways hanging upside down above it. No text or logo.',
      ],
    },
    {
      name: 'Anamorphic Viewpoint Alignment',
      domain: 'single-viewpoint anamorphic space',
      tags: ['anamorphic', 'perspective', 'paradox'],
      dna: space({
        aesthetic:
          'Anamorphic alignment: fragments scattered through deep space line up into one perfect shape only from the camera position and are broken from anywhere else.',
        subject_treatment: paradox(
          'scattered fragments that assemble only from this single viewpoint',
        ),
        color_and_tone:
          'One strong flat color or material for the aligned shape against the natural tones of the setting.',
        lighting_and_shadow:
          'Real light and shadows on each fragment betray their different depths while the shape stays unified.',
        texture_and_material:
          'Painted or built fragments on walls, floors, rocks and posts at very different distances.',
        camera_and_composition:
          'Locked at the single alignment point; small clues at the edges reveal the fragments are far apart.',
        atmosphere_and_mood: 'Delightful and uncanny, a trick that only works right here.',
        rendering_and_quality:
          'Photographic realism with exact alignment; no flat overlay or composited graphic.',
        key_features:
          'fragments at different depths; one perfect shape from one viewpoint; flat strong color; shadows revealing depth; edge clues to the trick',
      }),
      avoid: [...AVOID, 'flat graphic overlay'],
      briefs: [
        'Anamorphic alignment: stone blocks scattered across a quarry at very different distances line up into one perfect round arch from the camera point, their long shadows betraying the gaps. No text or logo.',
        'Anamorphic alignment: red painted segments across the pillars, floor and roof trusses of an old warehouse assembling into a single ring from this viewpoint, dusty light shafts. No text or logo.',
        'Anamorphic alignment applied to a public swimming pool whose tiles, lane ropes and ladders align into one giant spiral seen from the diving board. No text or logo.',
      ],
    },
    {
      name: 'Mobius Loop Architecture',
      domain: 'single-surface twisted loop structure',
      tags: ['mobius', 'loop', 'paradox'],
      dna: space({
        aesthetic:
          'Mobius architecture: a road, deck or building band twisted once and joined to itself, so its top surface flows onto its underside without an edge crossing.',
        subject_treatment: paradox(
          'a single-surface band with one twist that makes inside become outside',
        ),
        color_and_tone:
          'Clean structural whites and greys with the functional colors of the surface, such as asphalt or lane paint.',
        lighting_and_shadow:
          'Sun catching the twist so the surface turns from light to shadow in one continuous gradient.',
        texture_and_material:
          'Continuous paving, railings or glazing that run unbroken across the twist.',
        camera_and_composition:
          'An angle that shows the whole loop and the twist, so the single surface can be followed with the eye.',
        atmosphere_and_mood:
          'Elegant, endless and slightly dizzying, a path that never reaches an edge.',
        rendering_and_quality:
          'Precise architectural rendering with continuous surface details that never jump.',
        key_features:
          'band twisted once and joined; top flowing onto underside; continuous paving across the twist; whole-loop view; light-to-shadow gradient',
      }),
      avoid: [...AVOID, 'figure-eight knot', 'broken surface seam'],
      briefs: [
        'Mobius architecture: a ceremonial stone road through a pine forest lifting off the ground and twisting once into a closed loop, its paving flowing onto its underside, low sun catching the twist. No text or logo.',
        'Mobius architecture: a city ring-road viaduct above rooftops twisted into a single Mobius band, lane paint continuing unbroken around the underside, seen from a high angle. No text or logo.',
        'Mobius architecture applied to a running track twisted into a Mobius band, lanes continuing on its underside, the infield grass on both faces. No text or logo.',
      ],
    },
    {
      name: 'Colossal Scale Displacement',
      domain: 'object-as-landscape scale paradox',
      tags: ['scale-shift', 'colossal', 'paradox'],
      dna: space({
        aesthetic:
          'Colossal scale displacement: an ordinary object enlarged to the size of a hill or canyon and treated as terrain, with roads, trees and weather at its true scale.',
        subject_treatment: paradox(
          'the requested object enlarged to landscape scale and inhabited as terrain',
        ),
        color_and_tone:
          'The object in its real colors, softened by aerial haze on its far parts like a mountain.',
        lighting_and_shadow:
          'Landscape light with cloud shadows sweeping across the object and long shadows at its base.',
        texture_and_material:
          'Object material at colossal scale: scratches as ravines, weathering, moss and small trees growing on it.',
        camera_and_composition:
          'A wide landscape view with tiny scale cues such as trees, roads or boats against the object.',
        atmosphere_and_mood: 'Absurd and awe-struck, familiar things turned into geography.',
        rendering_and_quality:
          'Photographic landscape realism with correct haze and scale cues; never a tabletop miniature.',
        key_features:
          'ordinary object at landscape scale; aerial haze on the object; tiny scale cues; cloud shadows; weathering and growth on its surface',
      }),
      avoid: [...AVOID, 'tabletop miniature look', 'tilt-shift blur'],
      briefs: [
        "Colossal scale displacement: an abandoned knight's helmet the size of a mountain lying in a valley, a village built inside its visor, moss on its crest, cloud shadows sweeping across the steel. No text or logo.",
        'Colossal scale displacement: an open pocket watch lying in a desert, its gears forming terraced canyons, a caravan road winding across the crystal, aerial haze on the far rim. No numerals, text or logo.',
        'Colossal scale displacement applied to a pair of reading glasses as big as a bridge, spanning a wide river, small boats passing under the lenses. No text or logo.',
      ],
    },
    {
      name: 'Multi-Gravity Block Cluster',
      domain: 'local-gravity paradox',
      tags: ['gravity', 'cluster', 'paradox'],
      dna: space({
        aesthetic:
          'Multi-gravity cluster: blocks of a place floating together, each face with its own down, so trees, water and furniture obey the gravity of their own surface.',
        subject_treatment: paradox(
          'floating blocks whose faces each have their own gravity direction',
        ),
        color_and_tone:
          'Natural palette of the setting with a soft sky surrounding the cluster on all sides.',
        lighting_and_shadow:
          'One sun lighting every face consistently, so shadows fall in many directions relative to each local ground.',
        texture_and_material:
          'Real ground surfaces on every face: turf, flagstones, water sheets pouring between faces.',
        camera_and_composition:
          'Show at least three faces with different downs, so the paradox is readable at a glance.',
        atmosphere_and_mood: 'Playful and unsettling, several worlds sharing one block.',
        rendering_and_quality: 'Photographic realism, not lithograph linework or a staircase loop.',
        key_features:
          'faces with their own gravity; trees and water obeying local down; floating block cluster; one consistent sun; three or more readable faces',
      }),
      avoid: [...AVOID, 'lithograph linework', 'endless stair loop'],
      briefs: [
        'Multi-gravity cluster: floating castle courtyards stacked at right angles in open sky, each with its own down, a well, trees and banners obeying their own ground, one sun lighting every face. No text or logo.',
        'Multi-gravity cluster: a garden of grass-covered cubes where a stream pours off one face and runs sideways across the next, trees growing in three directions. No text or logo.',
        'Multi-gravity cluster applied to an office block whose floors each have gravity pointing a different way, desks and plants stuck to walls and ceilings of neighbouring floors. No readable screens, text or logo.',
      ],
    },
    {
      name: 'Terraced Arcology Pyramid',
      domain: 'city-in-one-building megastructure',
      tags: ['arcology', 'terraced', 'megastructure'],
      dna: space({
        aesthetic:
          'Terraced arcology: an entire city built as one stepped pyramid, every slope lined with homes, farms and gardens, the hollow core a sunlit atrium.',
        subject_treatment: habitat('the terraced pyramid megastructure and its city-scale setting'),
        color_and_tone:
          'Sand concrete, deep green crops and orchards, water glints and pale sky; warm and fertile.',
        lighting_and_shadow:
          'Raking morning sun across the terraces, each step casting a line of shadow on the one below.',
        texture_and_material:
          'Concrete terrace walls, irrigation channels, planted balconies, glass skylights into the atrium.',
        camera_and_composition:
          'Keep the requested geometry; the stepped slope and its thousands of terraces set the scale.',
        atmosphere_and_mood: 'Hopeful, dense and green, a whole civilization in one building.',
        rendering_and_quality:
          'Detailed architectural visualization with legible terrace repetition; not a sterile line style.',
        key_features:
          'stepped pyramid city; terraced farms and homes; hollow sunlit atrium; irrigation channels; raking morning sun',
      }),
      avoid: [...AVOID, 'ancient temple pyramid', 'desert ruin'],
      briefs: [
        'Terraced arcology: a stepped pyramid city rising out of a flooded plain, every terrace lined with rice paddies, orchards and homes, raking morning sun drawing shadow lines down the slope. No text or logo.',
        'Terraced arcology: the hollow atrium inside the pyramid, hundreds of green terraces facing inward around a sunlit void, irrigation water falling in thin threads between levels. No text or logo.',
        'Terraced arcology applied to one ordinary apartment balcony, its railing, chairs and potted plants unchanged, shown as one of thousands stepping up the arcology slope. No text or logo.',
      ],
    },
    {
      name: 'Orbital Tether Anchor',
      domain: 'space elevator megastructure',
      tags: ['space-elevator', 'tether', 'megastructure'],
      dna: space({
        aesthetic:
          'Space elevator: a single ribbon tether rising from an ocean anchor platform straight up through the atmosphere, climber cars crawling along it toward orbit.',
        subject_treatment: habitat('the tether rising into orbit and its vast vertical scale'),
        color_and_tone:
          'Steel grey platform, ocean blue, a thin silver tether fading into deep blue then black at the top.',
        lighting_and_shadow:
          'Dawn light catching the upper tether long before the ocean below, a bright line into dark sky.',
        texture_and_material:
          'Braided ribbon cable, massive anchor bollards, sea spray, climber cars as small bright boxes.',
        camera_and_composition:
          'Keep the requested geometry; a strong vertical line of the tether vanishing to a point above.',
        atmosphere_and_mood: 'Aspirational and vertiginous, a road that goes straight up.',
        rendering_and_quality:
          'Photographic realism with correct atmospheric fade along the tether; no fantasy beanstalk.',
        key_features:
          'ribbon tether rising to orbit; ocean anchor platform; climber cars; dawn light on the upper tether; vertical vanishing line',
      }),
      avoid: [...AVOID, 'giant beanstalk', 'rocket launch'],
      briefs: [
        'Space elevator: an ocean anchor platform at dawn, massive bollards and sea spray below, the thin silver tether rising straight up and lit gold high above while the sea is still dark. No text or logo.',
        'Space elevator: a climber car halfway up the tether above the curve of the planet, the ribbon vanishing both up into black and down into blue haze. No text or logo.',
        'Space elevator applied to a small harbour fishing pier kept exactly as it is, nets and moored boats in front, the tether rising behind it into the sky. No text or logo.',
      ],
    },
    {
      name: 'Abyss-Span Bridge City',
      domain: 'inhabited bridge megastructure',
      tags: ['bridge-city', 'abyss', 'megastructure'],
      dna: space({
        aesthetic:
          'Bridge city: an entire town built on a colossal bridge spanning a bottomless chasm, houses stacked on the deck and hanging beneath the arches.',
        subject_treatment: habitat('the colossal bridge deck setting and the abyss beneath it'),
        color_and_tone:
          'Weathered stone greys, timber browns, warm window light and a blue-black void below; strong value drop.',
        lighting_and_shadow:
          'Daylight on the deck, deep shadow under the arches, the abyss fading to black with mist.',
        texture_and_material:
          'Massive masonry piers, timber galleries, chains and pulleys, laundry lines and hanging gardens.',
        camera_and_composition:
          'Keep the requested geometry; always show the drop below and the far chasm wall for scale.',
        atmosphere_and_mood: 'Precarious and lively, a town that refuses to look down.',
        rendering_and_quality:
          'Detailed painterly realism with strong depth falloff into the chasm.',
        key_features:
          'town built on a colossal bridge; houses hanging under arches; bottomless chasm below; masonry piers; misty depth falloff',
      }),
      avoid: [...AVOID, 'modern suspension bridge only', 'river below'],
      briefs: [
        'Bridge city: a medieval town built along a colossal stone bridge across a bottomless gorge, houses hanging beneath the arches on chains, mist swallowing the drop below, afternoon light on the deck. No text or logo.',
        'Bridge city at night: lamplit windows and galleries hanging beneath the deck over a black abyss, pulleys and baskets descending into the mist, seen from the chasm wall. No text or logo.',
        'Bridge city applied to a row of terraced houses kept exactly as they are, standing on the deck of a colossal bridge with the chasm dropping away behind their back gardens. No text or logo.',
      ],
    },
    {
      name: 'Vertical Shaft Sinkhole City',
      domain: 'inward-facing pit megastructure',
      tags: ['sinkhole', 'shaft-city', 'megastructure'],
      dna: space({
        aesthetic:
          'Shaft city: a city lining the inner walls of a colossal cylindrical sinkhole, ring terraces spiraling down, the only sky a disc of light far above.',
        subject_treatment: habitat(
          'the cylindrical shaft setting and its inward-facing ring terraces',
        ),
        color_and_tone:
          'Rock ochre and grey, warm lamp light on lower rings, a bright white sky disc; values darken with depth.',
        lighting_and_shadow:
          'Daylight falling from the opening and fading ring by ring, lamps taking over in the lower levels.',
        texture_and_material:
          'Raw rock walls, cantilevered platforms, spiral ramps, ropes and hanging greenery.',
        camera_and_composition:
          'Keep the requested geometry; circular rings frame the view, looking up to the sky disc or down into the dark.',
        atmosphere_and_mood: 'Enclosed and communal, a city turned inside out.',
        rendering_and_quality:
          'Painterly realism with a smooth light gradient from opening to depth.',
        key_features:
          'city lining a cylindrical sinkhole; spiral ring terraces; bright sky disc overhead; light fading with depth; cantilevered platforms',
      }),
      avoid: [...AVOID, 'open horizon', 'mine elevator cage'],
      briefs: [
        'Shaft city: a mining city spiraling down the walls of a giant sinkhole, cantilevered platforms and ramps ringed around the void, lamp light warming the lower rings, a bright disc of sky above. No text or logo.',
        'Shaft city: the view straight up from the bottom of the shaft, rings of terraces and hanging greenery narrowing toward a white sky disc, ropes crossing the void. No text or logo.',
        'Shaft city applied to a small cafe terrace with its tables, awning and potted plants kept, clinging to one ring of the shaft wall with the pit dropping away beyond the railing. No readable signage or logo.',
      ],
    },
    {
      name: 'Ocean-Barrier Megadam',
      domain: 'sea-holding dam megastructure',
      tags: ['megadam', 'sea-wall', 'megastructure'],
      dna: space({
        aesthetic:
          'Ocean megadam: a curved concrete wall kilometres high holding back a raised sea, spillway gates and buttresses dwarfing the land in its lee.',
        subject_treatment: habitat('the ocean-holding dam and its overwhelming scale'),
        color_and_tone:
          'Wet grey concrete, dark sea green at the brim, pale spray and green lowland below; heavy and cold.',
        lighting_and_shadow:
          'Low sun behind the wall throwing the lowland into a vast shadow; spray catching light along the crest.',
        texture_and_material:
          'Streaked concrete, rust weeping from gates, algae lines at old water levels, spray mist.',
        camera_and_composition:
          'Keep the requested geometry; look up from the lowland so the wall fills the frame and the sea shows at the crest.',
        atmosphere_and_mood: 'Precarious and monumental, calm life under a wall of water.',
        rendering_and_quality:
          'Photographic realism with correct haze at the top of the wall; no disaster breach unless asked.',
        key_features:
          'kilometre-high curved sea wall; ocean at the brim; buttresses and spillway gates; vast shadow over the lowland; spray at the crest',
      }),
      avoid: [...AVOID, 'dam breach disaster', 'river dam only'],
      briefs: [
        'Ocean megadam: a kilometre-high curved sea wall with the ocean brimming at its crest, spray drifting along the top, buttresses marching into haze, low sun behind it casting a vast shadow over the lowland. No text or logo.',
        'Ocean megadam at night during a storm, waves breaking over the crest in pale plumes, rust-streaked spillway gates lit by sodium lamps far above. No text or logo.',
        'Ocean megadam applied to a small farmstead kept exactly as it is, barn and orchard in the foreground, the colossal sea wall rising behind it into the clouds. No text or logo.',
      ],
    },
  ],
};

export default spec;
