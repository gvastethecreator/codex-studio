import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'licensed fantasy location',
  'copy of a known film or game building',
  'readable runes or inscriptions',
  'glossy mirror floor by default',
  'decorative waterfall by default',
  'swapping the requested structure for a castle or temple',
];

// Themes rebuild the requested structure in an imagined construction logic; its function, footprint and camera stay.
const theme =
  'Keep the requested structure or object, its function, footprint and camera; rebuild its walls, roof, openings and ornament in this construction logic, and never swap it for a castle, temple or fixed fantasy landmark.';

function arch(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? theme, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_07',
  category: '5. Fantasy And Mythic Architecture',
  updates: {
    'SP07-051': {
      dna: arch({
        aesthetic:
          'Grown sanctuary architecture: living beech and ash trunks trained into tall lancet arches, pale limestone shells grafted between them, and branch forks forming the window tracery.',
        color_and_tone:
          'Bone-white limestone, silver-grey bark, fern and moss greens, thin silver inlay lines; low saturation in a high, airy value key.',
        lighting_and_shadow:
          'Soft canopy-filtered daylight with green bounce and no hard sun; the branch tracery throws lace-like shadow patterns across the pale stone.',
        texture_and_material:
          'Bark grain fusing seamlessly into chiselled limestone, lichen at the footings, silver wire inlay tracing every joint, leaves growing through the tracery.',
        camera_and_composition:
          'Keep the requested view; stress tall narrow proportions, trunks reading as columns and the canopy closing overhead like a vault.',
        atmosphere_and_mood:
          'Hushed, ancient and gentle, a building that was grown over centuries rather than laid.',
        rendering_and_quality:
          'Painterly-realist architectural illustration with fine linework in the tracery and soft foliage edges; no HDR glare or blown haze.',
        key_features:
          'trunks trained into lancet arches; branch-fork window tracery; pale limestone with silver inlay; filtered green canopy light; moss and lichen at the footings',
      }),
      avoid: [...AVOID, 'industrial steel', 'pointed-ear character', 'neon'],
      briefs: [
        'Grown sanctuary architecture: a council hall formed by four colossal beech trunks trained into lancet arches at the edge of a misty ravine, branch-fork tracery windows, pale limestone panels with silver inlay, soft green canopy light. No text or logo.',
        'Grown sanctuary architecture: a slender scriptorium tower rising out of a birch grove in autumn fog, seen from below, its spiral stair wrapped in living bark and lichen, lace shadows of tracery on bone-white stone. No text or logo.',
        'Grown sanctuary architecture applied to an ordinary public library reading hall: the same long room and rows of shelves, but the columns are living ash trunks and the ceiling is a canopy vault with silver-inlaid limestone ribs. No readable book titles or logo.',
      ],
    },
    'SP07-052': {
      dna: arch({
        aesthetic:
          'Megalithic mountain-hall architecture: walls cut from single granite blocks with hairline joints, stepped angular relief bands, hammered gold edging and molten heat running in floor and wall grooves.',
        color_and_tone:
          'Charcoal and slate granite, hammered gold, deep orange glow inside the channels as the only warm note; everything else stays cool grey.',
        lighting_and_shadow:
          'Low warm under-light rising from the glowing channels, black darkness overhead, a hard 1:8 ratio that carves the relief bands.',
        texture_and_material:
          'Tool-dressed granite with drill scars and razor arrises, gold sheet riveted into grooves, soot darkening the upper courses.',
        camera_and_composition:
          'Keep the requested view; squat trabeated proportions with massive horizontal lintels and a low eye line that stresses weight.',
        atmosphere_and_mood:
          'Heavy, patient and proud, as if built to outlast the mountain around it.',
        rendering_and_quality:
          'Crisp architectural render with sharp stone edges and bloom limited to the heat channels; no fog wash over the masonry.',
        key_features:
          'single-block granite megaliths; stepped angular relief without readable runes; hammered gold edging; glowing heat channels in grooves; squat trabeated proportions',
      }),
      avoid: [
        ...AVOID,
        'dwarf character',
        'hero forge scene',
        'anvil and hammer prop',
        'timber-dominant finish',
      ],
      briefs: [
        'Megalithic mountain-hall architecture: a royal mint vault beneath a mountain, walls of single granite blocks with hairline joints, hammered gold edging, molten heat glowing in the floor grooves, low eye line under massive lintels. No text or logo.',
        'Megalithic mountain-hall architecture: a stairway city descending in stepped granite terraces into a dark chasm, seen from the top edge, rivers of orange heat traced in the grooves of every step, black void above. No text or logo.',
        'Megalithic mountain-hall architecture applied to a modern hydroelectric turbine hall: the same row of turbine housings and gantry, rebuilt as squat granite megaliths with gold-edged relief bands and glowing heat channels. No readable signage or logo.',
      ],
    },
    'SP07-053': {
      dna: arch({
        aesthetic:
          'Suspended architecture: buildings sit on inverted rock islands torn from the ground, root-hung strata dangling underneath, linked by thin chain bridges across an open void.',
        color_and_tone:
          'Sun-bleached limestone tops, rust-red and ochre strata undersides, deep sky blue and cloud white; values lighten with distance.',
        lighting_and_shadow:
          'High hard sun with bright rims on every island edge; undersides lit only by cool bounce from the cloud sea below.',
        texture_and_material:
          'Layered sediment strata, dangling roots and dripping stalactites under each island, weathered stone and iron chain above.',
        camera_and_composition:
          'Keep the requested view but always show the underside and the empty drop beneath; islands stack in depth through aerial haze.',
        atmosphere_and_mood:
          'Vertiginous and sublime, weight hanging where nothing should hold it.',
        rendering_and_quality:
          'Aerial-perspective painting with strong value falloff by distance and a sharp, detailed foreground island.',
        key_features:
          'inverted rock islands; root-hung strata undersides; chain bridges over void; aerial haze depth; hard high-sun rims',
      }),
      avoid: [
        ...AVOID,
        'required castle',
        'ground-level building',
        'dragon',
        'waterfall pouring off island edge',
      ],
      briefs: [
        'Suspended architecture: a cliff monastery split across three inverted rock islands above a gorge, rust-red strata and dangling roots beneath each, thin chain bridges between them, hard high sun rimming the edges. No text or logo.',
        'Suspended architecture: a lone bell tower on a small floating rock at dawn, seen from far below so its root-hung underside fills the frame, cloud sea glowing under it, other islands fading in aerial haze. No text or logo.',
        'Suspended architecture applied to a roadside petrol station: canopy, pumps and small shop kept intact but sitting on an inverted rock island hanging in open sky, chain bridge as the access road. No readable signage or logo.',
      ],
    },
    'SP07-054': {
      dna: arch({
        aesthetic:
          'Techno-brutalist megablock: board-marked concrete modules stacked and cantilevered into a mountain-like mass, service conduits and cable stays strung across the facades, rust-black steel panels.',
        color_and_tone:
          'Warm grey concrete, rust black, oxide-orange rain streaks, pinpoints of sodium amber and utility green; muted overall.',
        lighting_and_shadow:
          'Flat overcast dusk sky, deep black recesses between modules, hundreds of tiny utility lights; no dramatic sun.',
        texture_and_material:
          'Board-formed concrete with tie holes and rain staining, rusted cladding, sagging cable bundles and patched conduit runs.',
        camera_and_composition:
          'Keep the requested view; telephoto compression stacks the modules into a wall, looking up at the overhangs.',
        atmosphere_and_mood:
          'Oppressive, dense and labyrinthine, a structure that keeps growing by accretion.',
        rendering_and_quality:
          'Matte photographic grit, detailed module repetition, restrained glow; not the sober single-slab look of classic brutalism.',
        key_features:
          'stacked cantilevered concrete modules; conduits and cable stays across facades; rust-black panels; telephoto compression; tiny utility lights at dusk',
      }),
      avoid: [
        ...AVOID,
        'fantasy castle silhouette',
        'neon cyberpunk alley',
        'clean glass curtain wall',
      ],
      briefs: [
        'Techno-brutalist megablock: a citadel of stacked board-marked concrete modules climbing a mountain ridge, cable stays and conduits strung between cantilevers, rust streaks, tiny amber utility lights at overcast dusk, telephoto compression. No text or logo.',
        'Techno-brutalist megablock: a pilgrim hostel of hundreds of cantilevered concrete cells piled around the rim of a crater, seen from the crater floor looking up, deep black recesses and sagging cable bundles. No text or logo.',
        'Techno-brutalist megablock applied to a city hospital: the same wards, entrance canopy and helipad, rebuilt as stacked rust-stained concrete modules with conduits running across every facade. No readable signage or logo.',
      ],
    },
    'SP07-055': {
      dna: arch({
        aesthetic:
          'Full-scale confectionery architecture: sugar-glass windows, marshmallow domes, candy-striped load-bearing columns and piped-icing cornices built at real building size.',
        color_and_tone:
          'Pastel pink, mint, butter yellow and peppermint red against translucent amber sugar; soft high-key values.',
        lighting_and_shadow:
          'Bright soft daylight with subsurface glow through sugar glass and gummy panes; shadows tinted pink rather than grey.',
        texture_and_material:
          'Crystallized sugar sparkle, matte powdered marshmallow, glossy hard candy and ridged royal icing at architectural scale.',
        camera_and_composition:
          'Keep the requested view at human scale with full-size doors and steps; never a tabletop gingerbread model.',
        atmosphere_and_mood:
          'Dreamlike and slightly uncanny, sweetness scaled up until it becomes monumental.',
        rendering_and_quality:
          'Soft-edged surreal realism; candy materials behave like building materials and carry believable loads.',
        key_features:
          'sugar-glass windows; marshmallow domes; candy-striped columns; piped-icing cornices; building-scale candy materials',
      }),
      avoid: [
        ...AVOID,
        'tabletop gingerbread house',
        'dessert table',
        'candy mascot',
        'melting horror candy',
      ],
      briefs: [
        'Full-scale confectionery architecture: a cathedral with three marshmallow domes and a sugar-glass rose window glowing amber, peppermint-striped columns carrying piped-icing cornices, seen from the foot of its steps in bright soft light. No text or logo.',
        'Full-scale confectionery architecture: a clock tower of hard-candy blocks standing alone in a meadow at golden hour, long pink-tinted shadow, the clock face a blank disc of sugar glass. No numerals, text or logo.',
        'Full-scale confectionery architecture applied to a municipal fire station: engine bays, hose tower and roll-up doors all kept, built from butter-yellow hard candy with icing trim and gummy window panes. No readable signage or logo.',
      ],
    },
    'SP07-056': {
      dna: arch({
        aesthetic:
          'Deep-sea deco architecture: stepped Art Deco setbacks built for crushing depth, domed pressure-glass windows in riveted brass frames, coral and barnacles colonizing every ledge.',
        color_and_tone:
          'Blue-green murk, verdigris copper, wet brass glints and warm amber from lit windows; black beyond ten metres.',
        lighting_and_shadow:
          'Warm light glowing out of the windows, cold blue shafts from the surface far above, rapid falloff into darkness.',
        texture_and_material:
          'Riveted brass, verdigris patina, barnacle crust, coral fans and condensation beads on thick convex glass.',
        camera_and_composition:
          'Keep the requested view; suspended particles and blue haze swallow distant forms, silhouettes read through murk.',
        atmosphere_and_mood:
          'Pressurized, silent and opulent, luxury holding its breath against the ocean.',
        rendering_and_quality:
          'Underwater volumetric rendering with drifting particulate and softened distance; brass highlights stay crisp up close.',
        key_features:
          'stepped deco setbacks; domed pressure-glass portholes; riveted brass and verdigris; coral and barnacle crust; blue murk falloff',
      }),
      avoid: [...AVOID, 'dry sunlit lobby', 'diver character', 'submarine cockpit'],
      briefs: [
        'Deep-sea deco architecture: an ambassador residence on the ocean floor, stepped brass setbacks crusted with coral, rows of domed pressure-glass windows glowing amber, a cold shaft of blue surface light cutting through drifting particles. No text or logo.',
        'Deep-sea deco architecture: the grand auditorium of a sunken opera house seen from the upper balcony, tiers of riveted brass boxes under verdigris, fish drifting where the audience would sit, blue murk swallowing the stage. No text or logo.',
        'Deep-sea deco architecture applied to a neighbourhood cinema lobby: ticket counter, carpeted stair and poster frames kept, but the walls are riveted pressure-glass and brass, barnacles on the handrails. Poster frames empty, no text or logo.',
      ],
    },
    'SP07-057': {
      dna: arch({
        aesthetic:
          'Victorian steamwork architecture: brick and cast-iron buildings wrapped in riveted copper boiler plate, exterior pipe runs, dial clusters and venting steam as working building services.',
        color_and_tone:
          'Soot-dark brick red, copper brown, verdigris green and amber gaslight in foggy grey air; warm-cool split.',
        lighting_and_shadow:
          'Pools of amber gaslight, steam plumes catching and diffusing the light, dim smoggy daylight behind.',
        texture_and_material:
          'Rows of rivets, soot streaks, oil staining, cast-iron lattice girders and dial faces without readable numbers.',
        camera_and_composition:
          'Keep the requested view; dense vertical pipe runs and chimneys organize the facade into strong vertical rhythm.',
        atmosphere_and_mood:
          'Industrious, humid and clanking, a city that runs on pressure and coal.',
        rendering_and_quality:
          'Engraving-like detail density in metalwork with soft steam; not a glass conservatory and not a vehicle scene.',
        key_features:
          'riveted copper boiler plate; exterior pipe runs; dial clusters without numbers; venting steam; amber gaslight in smog',
      }),
      avoid: [...AVOID, 'glass conservatory default', 'locomotive hero', 'readable gauge numbers'],
      briefs: [
        'Victorian steamwork architecture: an alchemists guild hall clad in riveted copper boiler plate, pipe runs climbing the brick facade to tall chimneys, steam venting into foggy evening air lit by amber gaslight. No text or logo.',
        'Victorian steamwork architecture: a riverside watermill rebuilt with two copper boiler towers, seen across the dark river in smog, the wheel turning under plumes of steam and a row of glowing dial clusters. No numbers, text or logo.',
        'Victorian steamwork architecture applied to a corner laundromat: the same washing machines and folding tables, but every machine is a riveted copper boiler with pipe runs across the ceiling and steam hanging under gaslight. No readable signage or logo.',
      ],
    },
    'SP07-058': {
      dna: arch({
        aesthetic:
          'Crystal-grown architecture: walls and towers built from clustered hexagonal quartz and amethyst prisms, cleavage planes serving as floors, light travelling inside the stone.',
        color_and_tone:
          'Sapphire, amethyst violet and milky white quartz with thin spectral fringes at every edge; cool, saturated jewel tones.',
        lighting_and_shadow:
          'Light enters one face and exits another, casting caustics and small rainbow dispersions across floors; glow from inside the prisms.',
        texture_and_material:
          'Hard hexagonal facets, cloudy inclusions, frosted fracture surfaces at the base of each cluster, razor-sharp terminations.',
        camera_and_composition:
          'Keep the requested view; prism clusters radiate from a base so silhouettes stay spiky and asymmetric.',
        atmosphere_and_mood:
          'Cold, resonant and otherworldly, a building that seems to have crystallized overnight.',
        rendering_and_quality:
          'Refraction-accurate glass rendering with crisp facets; distinct from ice, which is cyan, bubbled and melting.',
        key_features:
          'hexagonal quartz and amethyst prisms; internal light transmission; caustics and rainbow dispersion; frosted fracture bases; spiky asymmetric silhouettes',
      }),
      avoid: [...AVOID, 'opaque brick masonry', 'ice and snow', 'single temple spire postcard'],
      briefs: [
        "Crystal-grown architecture: an oracle's chamber inside a cluster of giant amethyst prisms, light entering one facet and scattering caustics and tiny rainbows over a frosted quartz floor, seen from a low corner. No text or logo.",
        'Crystal-grown architecture: an amphitheatre of radiating sapphire and milky quartz prisms set into a desert canyon at noon, rows of seats formed by cleavage planes, spiky asymmetric silhouette against the sky. No text or logo.',
        'Crystal-grown architecture applied to a municipal water tower: tank, legs and ladder kept, but grown from clustered hexagonal quartz prisms, the water visible glowing inside the translucent tank. No text or logo.',
      ],
    },
    'SP07-059': {
      dna: arch({
        aesthetic:
          'Earth-sheltered pastoral architecture: dwellings dug into turf mounds with round doors and round windows, lime-plastered faces and hand-hewn oak frames.',
        color_and_tone:
          'Meadow greens, warm ochre lime plaster, honey oak and small brass accents; soft, sunny, mid-saturation palette.',
        lighting_and_shadow:
          'Low late-afternoon sun with long soft shadows on the turf and warm window glow beginning inside.',
        texture_and_material:
          'Turf with wildflowers over the roofs, trowel-marked lime plaster, adzed oak lintels, worn flagstone thresholds.',
        camera_and_composition:
          'Keep the requested view; low eye level at doorstep height so the round openings and turf curve dominate.',
        atmosphere_and_mood: 'Snug, settled and unhurried, homes that belong to the hill.',
        rendering_and_quality:
          'Warm naturalistic illustration with soft edges; an original design, never a copy of a known film village.',
        key_features:
          'turf-mound roofs; round doors and windows; lime-plastered faces; adzed oak frames; low warm afternoon sun',
      }),
      avoid: [...AVOID, 'known film hobbit-hole copy', 'tall square house', 'village postcard'],
      briefs: [
        'Earth-sheltered pastoral architecture on a windswept northern sea cliff: five turf-roofed dwellings half-buried in the slope, round doors of grey slate slabs set in dry-stone arches, round porthole windows glowing amber, sheep grazing on the roofs, storm light over the sea. Not Hobbiton: no green doors, no brass center knob, no English village. No text or logo.',
        'Earth-sheltered pastoral architecture in a snowy alpine valley at dusk: a turf-roofed cheese cellar dug into the hillside, round door of banded iron and weathered larch, lanterns on either side, snow piled on the mound. No green doors or brass knobs. No text or logo.',
        'Earth-sheltered pastoral architecture in a red desert: a bermed caravanserai of adobe mounds with round wooden doors under painted arches, date palms on top, long evening shadows. No green doors or English cottage details. No readable text or logo.',
      ],
    },
    'SP07-060': {
      dna: arch({
        aesthetic:
          'Cartoon haunted architecture: rubbery crooked buildings that lean, bulge and twist, drawn with thick ink outlines and flat cel shading.',
        color_and_tone:
          'Moonlit violet and indigo base, toxic lime glow from openings, black ink; flat fills with one shadow tone each.',
        lighting_and_shadow:
          'One flat moon backlight rim plus lime glow spilling from windows; two-tone cel shadows with hard edges.',
        texture_and_material:
          'No surface texture beyond simple shingle and plank line patterns; wobbling hand-inked contours.',
        camera_and_composition:
          'Keep the requested view; exaggerate lean and squash so the silhouette reads as a caricature of the structure.',
        atmosphere_and_mood:
          'Spooky-comic and mischievous, frightening only in the way a cartoon is.',
        rendering_and_quality:
          'Clean animation background finish with crisp ink and flat color; no realistic horror, gore or monsters.',
        key_features:
          'crooked rubbery silhouettes; thick ink outlines; flat two-tone cel shading; violet and toxic-lime palette; moon backlight rim',
      }),
      avoid: [...AVOID, 'realistic horror', 'gore', 'monster', 'photoreal render'],
      briefs: [
        "Cartoon haunted architecture: a crooked wizard's academy of five towers leaning in different directions on a hill, thick ink outlines, flat violet cel shading, toxic-lime light pouring from every window, full moon rimming the roofs. No text or logo.",
        'Cartoon haunted architecture: a squashed and twisting windmill in a thunderstorm, its sails bent like rubber, lightning frozen in flat lime, seen from a steep low angle. No text or logo.',
        "Cartoon haunted architecture applied to a small dentist's clinic: reception window, waiting-room chairs and the chair lamp all kept, but the whole building leans and bulges in thick ink with violet and lime cel shading. No readable signage or logo.",
      ],
    },
    'SP07-061': {
      dna: arch({
        aesthetic:
          'Glacial ice architecture: faceted ice buttresses, frozen column rhythms and vaults carved from clear and blue glacier ice with trapped air bubbles.',
        color_and_tone:
          'White to cyan to deep glacier blue by thickness, mint aurora rim light; cold palette with no warm light.',
        lighting_and_shadow:
          'Low polar sun transmitted through thick ice turning blue inside, long blue shadows on snow, faint aurora edge glow.',
        texture_and_material:
          'Polished planes beside rough chisel marks, bubble streams and fracture planes inside the ice, rime frost on edges.',
        camera_and_composition:
          'Keep the requested view; repeated faceted buttresses set a strict frozen rhythm across the facade.',
        atmosphere_and_mood: 'Silent, severe and pristine, cold enough to ring.',
        rendering_and_quality:
          'Subsurface transmission rendering with crisp facets; distinct from colored crystal, which is hexagonal and jewel-toned.',
        key_features:
          'faceted ice buttresses; blue subsurface transmission; trapped bubble streams; low polar sun; mint aurora rim',
      }),
      avoid: [...AVOID, 'warm fireplace glow', 'frozen waterfall cascade', 'jewel-colored crystal'],
      briefs: [
        'Glacial ice architecture: a polar observatory dome carved from blue glacier ice, faceted buttresses marching around it, low sun turning the thick walls deep blue inside, faint mint aurora on the rim. No text or logo.',
        'Glacial ice architecture: an ice harbour gate between two frozen headlands with ships locked in the sea ice below, trapped bubble streams visible in its columns, long blue shadows across the snow. No text or logo.',
        'Glacial ice architecture applied to a covered market hall: stalls, lanterns and a vaulted roof kept, the whole hall carved from clear and blue glacier ice with faceted buttresses and frost on every beam, merchants in furs. No readable signage or logo.',
      ],
    },
    'SP07-062': {
      dna: arch({
        aesthetic:
          'Canopy rope vernacular: platforms and huts lashed to giant tree trunks with catenary ropes, woven palm panels, radial floor joists and swaying rope bridges, no nails anywhere.',
        color_and_tone:
          'Warm bark browns, straw gold weaving, deep leaf greens and small patches of sky; natural mid-contrast palette.',
        lighting_and_shadow:
          'Dappled high sun through the leaves, bright coins of light on platforms, deep green shade between trunks.',
        texture_and_material:
          'Lashing knots, frayed fibre rope, woven palm and rattan panels, bark contact points and hanging vines.',
        camera_and_composition:
          'Keep the requested view; layer platforms vertically between trunks so height and suspension read clearly.',
        atmosphere_and_mood: 'Airy, resourceful and alive, a structure that sways with the forest.',
        rendering_and_quality:
          'Naturalistic illustration with detailed knots and weaving; no galvanized hardware or polished metal.',
        key_features:
          'catenary rope lashings; radial platforms around trunks; woven palm panels; rope bridges; dappled canopy light',
      }),
      avoid: [...AVOID, 'polished metal', 'ground-level hut', 'jungle village postcard'],
      briefs: [
        'Canopy rope vernacular: a circular meeting hall built on a radial timber platform lashed around the trunk of a giant forest tree, woven palm-leaf walls, rope bridges fanning out to other trees, dappled sunlight on the planks. No text or logo.',
        'Canopy rope vernacular at dusk: a lookout hut of woven reeds hanging on catenary ropes in the crown of a giant tree, lanterns glowing, seen from far below between huge trunks. No text or logo.',
        'Canopy rope vernacular applied to a small bakery: oven, counter and bread racks kept, built on a lashed platform between two trunks with woven walls and a rope-hung basket lowering loaves to the ground. No readable signage or logo.',
      ],
    },
    'SP07-063': {
      dna: arch({
        aesthetic:
          'Sepulchral civic monumentalism: public buildings designed as necropolis architecture, black basalt colonnades, bone-marble inlay grids and oxidized bronze doors at inhuman height.',
        color_and_tone:
          'Black basalt, bone white marble, verdigris bronze and a faint spectral pale-green glow; near-monochrome and severe.',
        lighting_and_shadow:
          'Low cold overcast light raking across the colonnades, deep narrow shadows between pilasters, pale glow from within.',
        texture_and_material:
          'Honed basalt with a dull sheen, precise marble inlay in lapidary grids, bronze with green oxidation runs.',
        camera_and_composition:
          'Keep the requested view; endless repeated pilasters and a low eye line make the building tower over the viewer.',
        atmosphere_and_mood: 'Solemn, bureaucratic and funereal, the state as a tomb.',
        rendering_and_quality:
          'Severe architectural render with crisp stone edges and restrained glow; no skulls, gore or cemetery props.',
        key_features:
          'black basalt colonnades; bone-marble inlay grids; oxidized bronze doors; endless repeated pilasters; cold raking overcast light',
      }),
      avoid: [...AVOID, 'skull decoration', 'gore', 'cemetery headstones', 'lush garden'],
      briefs: [
        'Sepulchral civic monumentalism: a hall of records for the dead, a black basalt colonnade of endless pilasters with bone-marble inlay grids, towering verdigris bronze doors, cold raking overcast light, low eye line. No text or logo.',
        'Sepulchral civic monumentalism: an avenue of mausoleum-like ministries receding in rain, identical black facades repeating to a vanishing point, pale green glow behind narrow slit windows. No text or logo.',
        'Sepulchral civic monumentalism applied to a telephone exchange: switch-room windows, cable ducts and loading bay kept, but built as a black basalt mass with marble inlay and oxidized bronze doors. No readable signage or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Rock-Hewn Colossus Facade',
      domain: 'rock-cut cliff architecture',
      tags: ['rock-cut', 'cliff-facade', 'monolithic'],
      dna: arch({
        aesthetic:
          'Rock-cut architecture: the whole building carved in one piece into a cliff face, columns, pediments and giant relief figures cut in place, rooms as dark hollow voids behind.',
        color_and_tone:
          'Rose and ochre sandstone with visible banded strata, black doorway voids, clear blue sky; warm and high contrast.',
        lighting_and_shadow:
          'Hard low sun raking across the relief, cutting deep black shadows in every recess and doorway.',
        texture_and_material:
          'Chisel-pitted sandstone, strata lines running straight through the carving, wind erosion softening the upper details, no masonry joints at all.',
        camera_and_composition:
          'Keep the requested view and always show the unquarried rock surrounding the carved facade on every side.',
        atmosphere_and_mood:
          'Ancient, immovable and monumental, a building that was released from the mountain.',
        rendering_and_quality:
          'Sharp daylight realism with legible tool marks; the facade and cliff read as one continuous stone.',
        key_features:
          'carved in one piece from the cliff; banded sandstone strata through the carving; giant relief figures; black doorway voids; hard raking sun',
      }),
      avoid: [...AVOID, 'masonry block joints', 'free-standing building', 'readable carved text'],
      briefs: [
        'Rock-cut architecture: a desert tomb-palace carved in one piece into a rose sandstone cliff, two colossal seated relief figures flanking a black doorway void, banded strata running through the columns, hard low sun raking the relief. No text or logo.',
        'Rock-cut architecture: a canyon cistern hall seen from inside, pillars left standing in the solid rock, a shaft of sun from a carved opening above, chisel marks on every surface and water still in the basin. No text or logo.',
        'Rock-cut architecture applied to a modern hotel: balconies, lobby entrance and rows of windows kept, all carved directly into an ochre cliff face with no masonry joints, unquarried rock framing the whole facade. No readable signage or logo.',
      ],
    },
    {
      name: 'Tarred Stave-Hall Interlace',
      domain: 'northern timber stave architecture',
      tags: ['stave-church', 'tarred-timber', 'interlace'],
      dna: arch({
        aesthetic:
          'Northern stave architecture: vertical timber staves, steep stacked roofs clad in tarred scale shingles, carved beast-head gable finials and interlace-carved portals.',
        color_and_tone:
          'Pine-tar black-brown, weathered silver grey, red-ochre trim, snow white or dark spruce green around; low-key and earthy.',
        lighting_and_shadow:
          'Low northern winter sun grazing the tarred shingles so each scale catches a small sheen; long cold shadows.',
        texture_and_material:
          'Overlapping pointed shingles, sticky tar gloss, adzed staves, deep-cut interlace knotwork relief around doors.',
        camera_and_composition:
          'Keep the requested view; the tiered roof silhouette with finials must read clearly against the sky.',
        atmosphere_and_mood: 'Austere, windswept and devout, craft built against long winters.',
        rendering_and_quality:
          'Crisp timber detail with visible carving depth; interlace stays ornamental and never forms readable runes.',
        key_features:
          'tarred scale-shingle roofs; stacked tiered roof silhouette; carved beast-head finials; interlace portals; low grazing winter sun',
      }),
      avoid: [...AVOID, 'horned helmet costume', 'longship hero', 'stone masonry walls'],
      briefs: [
        'Northern stave architecture: a mead hall in a snowbound spruce forest, tiered roofs of tarred scale shingles glinting in low winter sun, carved beast-head finials on every gable, interlace portal glowing with firelight. No text or logo.',
        'Northern stave architecture: a small fjord-side chapel at blue twilight seen from the water, its stacked black roofs and finials silhouetted against pale sky, red-ochre trim, snow on the shingles. No text or logo.',
        'Northern stave architecture applied to a ski lift station: cable wheel, boarding platform and ticket hut kept, built from vertical tarred staves with a stacked shingle roof and interlace-carved doorposts. No readable signage or logo.',
      ],
    },
    {
      name: 'Cloud-Tier Lacquer Pagoda',
      domain: 'celestial tiered-eave architecture',
      tags: ['tiered-eaves', 'lacquer', 'cloud-sea'],
      dna: arch({
        aesthetic:
          'Celestial tiered-eave architecture: stacked upswept roofs carried on interlocking bracket sets, vermilion lacquered columns, gold leaf and glazed jade tiles rising through cloud layers.',
        color_and_tone:
          'Vermilion, jade green tile, gold leaf and ink-black beams against pale gold mist; saturated accents on a soft ground.',
        lighting_and_shadow:
          'Soft golden-hour light through mist bands; each higher tier fades a step lighter, with glossy highlights on lacquer.',
        texture_and_material:
          'Mirror-glossy lacquer, ribbed glazed roof tiles, burnished gold leaf and intricately carved bracket clusters.',
        camera_and_composition:
          'Keep the requested view; tiers stack vertically with bands of cloud or mist separating them.',
        atmosphere_and_mood: 'Serene, ceremonial and elevated, a building halfway into the sky.',
        rendering_and_quality:
          'Refined painterly realism with precise eave curves and bracket detail; no hanging signboards or calligraphy.',
        key_features:
          'stacked upswept eaves; interlocking bracket sets; vermilion lacquer and gold leaf; glazed jade tiles; mist bands between tiers',
      }),
      avoid: [...AVOID, 'calligraphy signboards', 'dragon mascot', 'tourist postcard pagoda'],
      briefs: [
        'Celestial tiered-eave architecture: a nine-tier palace gate tower rising out of a cloud sea at golden hour, each upswept jade-tiled roof separated by a band of mist, vermilion lacquer columns and gold-leaf brackets glowing. No text or logo.',
        'Celestial tiered-eave architecture: a small mountain tea house clinging to a rock ledge in rain, three stacked eaves dripping, lacquer shining wet, mist pouring through the valley below. No text or logo.',
        'Celestial tiered-eave architecture applied to a modern apartment tower: balconies and window grid kept, each floor capped with an upswept glazed-tile eave on carved brackets, clouds drifting between the upper floors. No readable signage or logo.',
      ],
    },
    {
      name: 'Woven Willow Roundhouse',
      domain: 'woven wattle and thatch architecture',
      tags: ['wattle', 'thatch', 'roundhouse'],
      dna: arch({
        aesthetic:
          'Woven wattle architecture: circular buildings of living willow withies and hazel wattle, clay daub infill and tall conical thatch roofs.',
        color_and_tone:
          'Straw gold, willow green-grey, clay ochre and peat-smoke blue; soft earthy palette with low contrast.',
        lighting_and_shadow:
          'Misty morning light with smoke seeping through the thatch; soft shadows and a warm glow at the low doorways.',
        texture_and_material:
          'Basket-weave wattle, bundled reed thatch, cracked daub with finger marks, sprouting willow shoots on living walls.',
        camera_and_composition:
          'Keep the requested view; circular plans and conical roofs dominate, clustered together at ground level.',
        atmosphere_and_mood:
          'Quiet, communal and rooted, architecture woven by hand from the marsh.',
        rendering_and_quality:
          'Naturalistic painting with tactile weave detail; no ropes, platforms or tree-lashing construction.',
        key_features:
          'woven willow and hazel wattle; conical reed thatch; clay daub infill; circular plans; smoke through thatch in mist',
      }),
      avoid: [...AVOID, 'rope-lashed tree platform', 'turf mound', 'costumed druid character'],
      briefs: [
        'Woven wattle architecture: a council ring of roundhouses around a circle of standing stones on a misty moor, conical reed thatch smoking softly, willow walls sprouting green shoots, warm glow at the low doorways. No text or logo.',
        'Woven wattle architecture: a tall woven willow watchtower rising from a reed marsh at dawn, seen from water level, its basket-weave walls and thatched cap reflected in still peat-brown water. No text or logo.',
        'Woven wattle architecture applied to a roadside farm shop: counter, crates and produce shelves kept inside a round wattle-and-daub building with a conical thatch roof. No readable signage or logo.',
      ],
    },
    {
      name: 'Chitin Carapace Architecture',
      domain: 'insect-shell organic architecture',
      tags: ['chitin', 'carapace', 'organic'],
      dna: arch({
        aesthetic:
          'Carapace architecture: roofs and walls of overlapping iridescent shell plates on segmented ribs, jointed buttresses and amber resin membranes as windows.',
        color_and_tone:
          'Black-green chitin with oil-slick blue, violet and bronze sheen, glowing amber resin panes; dark and glossy.',
        lighting_and_shadow:
          'Iridescent sheen shifting across the plates with angle; backlit amber membranes glow from inside at dusk.',
        texture_and_material:
          'Glossy shell plates with fine punctures and growth lines, flexible segment joints, veined translucent resin.',
        camera_and_composition:
          'Keep the requested view; segmented ribs set a repeating arthropod rhythm along roofs and walls.',
        atmosphere_and_mood:
          'Alien, elegant and slightly unsettling, a building that could have molted.',
        rendering_and_quality:
          'Precise specular rendering of iridescent surfaces; architecture only, with no insects or creatures.',
        key_features:
          'overlapping iridescent shell plates; segmented rib structure; jointed buttresses; amber resin membrane windows; oil-slick sheen',
      }),
      avoid: [...AVOID, 'insects', 'creature', 'gore'],
      briefs: [
        'Carapace architecture: a palace on jointed stilts over a black swamp, roofs of overlapping black-green shell plates with oil-slick violet sheen, segmented ribs arching overhead, amber resin windows glowing at dusk. No text or logo.',
        'Carapace architecture: a riverside boathouse seen from low on the water, its curved roof a single glossy bronze-sheened shell plate on jointed buttresses, veined amber membrane doors backlit by lamps. No text or logo.',
        'Carapace architecture applied to a concert hall: foyer, stage house and tiered auditorium roof kept, clad in overlapping iridescent shell plates on segmented ribs, amber resin glazing along the foyer. No readable signage or logo.',
      ],
    },
    {
      name: 'Star-Lattice Desert Palace',
      domain: 'geometric lattice desert architecture',
      tags: ['lattice-screen', 'desert', 'geometric'],
      dna: arch({
        aesthetic:
          'Star-lattice desert architecture: whitewashed and rose-stone halls wrapped in carved screens of interlocking geometric star patterns, horseshoe arches and shaded courtyards.',
        color_and_tone:
          'Sand rose, chalk white plaster, cobalt and turquoise tile, patches of hot gold light; warm with cool tile accents.',
        lighting_and_shadow:
          'Hard sun through the lattice projects crisp star-shaped patterns across floors and walls; interiors cool and dim between them.',
        texture_and_material:
          'Pierced carved stone and cedar screens, glazed tile, smooth lime plaster and still courtyard water.',
        camera_and_composition:
          'Keep the requested view; the projected light pattern must cross the main surfaces of the frame.',
        atmosphere_and_mood: 'Cool shelter from blazing heat, contemplative and precise.',
        rendering_and_quality:
          'Sharp-edged light patterns with crisp geometry; ornament stays geometric and never forms calligraphy or text.',
        key_features:
          'carved geometric star lattices; star-shaped light patterns projected by hard sun; horseshoe arches; cobalt tile; courtyard shade',
      }),
      avoid: [...AVOID, 'calligraphy', 'flying carpet', 'genie character'],
      briefs: [
        'Star-lattice desert architecture: a palace courtyard at noon, a long still pool between horseshoe arches, hard sun through carved stone screens projecting crisp star-shaped light across chalk-white walls and cobalt tile. No text or logo.',
        'Star-lattice desert architecture: a caravanserai on the edge of red dunes in late afternoon, seen from outside, its high rose walls pierced by carved lattice windows and a single dark arched gate. No text or logo.',
        'Star-lattice desert architecture applied to an airport departure hall: gates, seating rows and baggage belt kept, with carved lattice screens on every glass wall throwing star-shaped sunlight across the floor. No readable signage, screens or logo.',
      ],
    },
    {
      name: 'Nautilus Chamber Architecture',
      domain: 'spiral shell-grown architecture',
      tags: ['nautilus', 'spiral', 'nacre'],
      dna: arch({
        aesthetic:
          'Spiral shell architecture: buildings grown as logarithmic spirals with chambered interiors divided by curved septa, porcelain-white exteriors and nacre-lined rooms.',
        color_and_tone:
          'Porcelain white with rust-tan tiger stripes outside, pearl pink, silver and soft green iridescence inside.',
        lighting_and_shadow:
          'Soft daylight wrapping the spiral with gentle gradients; interiors glow with pearly iridescent reflections.',
        texture_and_material:
          'Smooth glazed shell, fine growth lines following the spiral, mirror-soft nacre with shifting color.',
        camera_and_composition:
          'Keep the requested view; the logarithmic spiral and its chamber sequence organize the whole composition.',
        atmosphere_and_mood: 'Calm, mathematical and oceanic, growth made into architecture.',
        rendering_and_quality:
          'Smooth organic rendering with accurate nacre iridescence and clean spiral geometry, no rough masonry.',
        key_features:
          'logarithmic spiral plan; chambered interiors with curved septa; tiger-striped porcelain exterior; nacre-lined rooms; soft wrapping daylight',
      }),
      avoid: [...AVOID, 'sea creature', 'beach souvenir shell', 'square rooms'],
      briefs: [
        'Spiral shell architecture: a mansion on a tidal rock grown as a vast logarithmic spiral, porcelain-white with rust-tan tiger stripes, surf breaking below, soft overcast light wrapping the curve. No text or logo.',
        'Spiral shell architecture: a public bathhouse interior seen from the innermost chamber looking outward, curved nacre septa opening one after another, pearly pink and green iridescence on steam-damp walls. No text or logo.',
        'Spiral shell architecture applied to a multistorey car park: ramps, parking bays and barrier kept, the whole ramp system grown as a chambered logarithmic spiral with nacre-lined levels. No readable signage or logo.',
      ],
    },
  ],
};

export default spec;
