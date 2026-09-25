import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'one-point corridor perspective as default',
  'wet mirror-gloss floor as default',
  'turning the requested room into a station or library',
  'readable signage or wayfinding text',
];

// Template negatives that blocked people or the equipment a requested space needs, or were garbled.
const SPACE_DROP = [
  'people',
  'staff',
  'hands',
  'person',
  'character',
  'guard',
  'inspector',
  'visitor',
  'diver',
  'people crowd',
  'slot machine',
  'kiosk',
  'console',
  'terminal',
  'display screen',
  'playing cards',
  'chips',
  'gambling table',
  'required library',
  'reading table',
  'lamps',
  'desk lamp',
  'open book prop',
  'hand holding book',
  'shelf aisle',
  'chair',
  'chair/table focus',
  'ground level',
  'ground-level hut',
  'dark',
  'dry',
  'digital',
  'modern',
  'mandatory interior interior zones',
  'office interior zones',
  'server-interior zones aisle lock',
  'office furniture focus',
];

// Specialty spaces are themes: they bring a space type's materials, wear, circulation and light to the requested place.
const place =
  "Keep the requested place, its function, occupants and action; bring this space type's materials, wear, circulation logic and light onto it, and turn it into that space type only when the prompt asks for that place.";

function space(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? place, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_07',
  category: '3. Civic Infrastructure And Specialty Spaces',
  updates: {
    'SP07-032': {
      dna: space({
        aesthetic:
          'Metropolitan transit patina: the worn public skin of an old underground railway, with bevelled glazed tile, riveted steel columns, tactile safety edges and decades of grime in every joint.',
        color_and_tone:
          'Cream and white tile yellowed by age, one faded colour band as abstract wayfinding, safety yellow, green-grey painted steel, grime darkening the grout; flat fluorescent cast.',
        lighting_and_shadow:
          'Rows of fluorescent tubes giving flat greenish light, dim pools between fixtures, hard shadows under beams, deeper darkness toward tunnel mouths.',
        texture_and_material:
          'Bevelled subway tile with chipped corners, riveted I-beam columns layered with paint, tactile dimpled platform edge, worn terrazzo, rust weeping from bolts.',
        camera_and_composition:
          'Keep the requested view; favour oblique or side views across tiled walls and columns rather than a centred vanishing corridor.',
        atmosphere_and_mood:
          'Tired, public and nocturnal, the city worn smooth by millions of passing hands.',
        rendering_and_quality:
          'Low-light documentary photograph with specific grime and chips, abstract colour bands only, no readable maps or signs.',
        key_features:
          'chipped bevelled subway tile; riveted painted steel columns; tactile yellow safety edge; fluorescent greenish light; grime-dark grout',
      }),
      avoid: [...AVOID, 'clean new tile', 'sunny daylight', 'readable maps', 'subway-car hero'],
      dropAvoid: SPACE_DROP,
      briefs: [
        'Metropolitan transit patina platform at three in the morning, seen from the side: an adult violinist in a long coat playing alone against chipped cream tile, riveted green columns receding, fluorescent tubes buzzing overhead, a faded red band running along the wall. No readable signs, text or logo.',
        'Metropolitan transit patina applied to a night-shift bakery kitchen: flour-dusted adult bakers pulling trays from a deck oven against yellowed bevelled tile, a tactile yellow edge along the floor drain, riveted steel columns, flat greenish tube light. No text or logo.',
        "Metropolitan transit patina applied to a wizard's underground post office: adult clerks in sleeve garters sorting sealed scrolls into pigeonholes under riveted beams, grime-dark grout and chipped tile, fluorescent light mixing with candle glow. No readable text or logo.",
      ],
    },
    'SP07-033': {
      dna: space({
        aesthetic:
          'Conservatory bioclimate: a glasshouse climate machine of thin glazing bars, heating pipes and misting lines, where humidity and filtered light are the architecture.',
        color_and_tone:
          'Milky white glass light, many saturated greens, white-painted iron or timber glazing bars, rust and verdigris on pipes; soft low contrast through haze.',
        lighting_and_shadow:
          'Daylight diffused by fogged glass and mist, leaf shadows softened by humidity, shafts where vents open; no hard sun edges.',
        texture_and_material:
          'Condensation beads and runs on panes, white-painted glazing bars, cast-iron heating pipes under slatted benches, gravel floors, misting nozzles, algae on glass.',
        camera_and_composition:
          'Keep the requested view; layer foliage foreground, midground subject and fogged glass background; avoid a centred glass corridor.',
        atmosphere_and_mood: 'Warm, dripping and hushed, a tropical air held behind glass.',
        rendering_and_quality:
          'Soft humid photograph with real condensation and haze, varied plant species, no plant-shop display.',
        key_features:
          'condensation-beaded glass; white-painted glazing bars; misting haze; cast-iron heating pipes; layered tropical foliage',
      }),
      avoid: [...AVOID, 'dry dusty interior', 'plant shop display', 'hard sun shadows'],
      dropAvoid: SPACE_DROP,
      briefs: [
        'Conservatory bioclimate palm house at dawn: an adult gardener in rubber boots hosing a giant water-lily pond, misting nozzles hissing, condensation running down the white glazing bars, a haze of green behind her. No text or logo.',
        'Conservatory bioclimate applied to a hospital fever ward: iron beds with white sheets under a fogged glass roof, banana leaves and tree ferns between the beds, heating pipes ticking, soft humid light on an adult nurse. No text or logo.',
        'Conservatory bioclimate applied to a barbershop: an adult barber shaving a customer beneath beaded glass panes, orchids and staghorn ferns hanging over the mirrors, a misting line dripping into a brass basin, morning haze. No text or logo.',
      ],
    },
    'SP07-034': {
      dna: space({
        aesthetic:
          'Institutional ruin patina: an abandoned public building decaying in place, with paint peeling in curls, collapsed ceiling tiles, rust bleeding from fixtures and plants reclaiming the floor.',
        color_and_tone:
          'Faded institutional green, cream and pale blue paint over grey plaster, rust orange streaks, moss green on floors, cool daylight; desaturated with one living green.',
        lighting_and_shadow:
          'Daylight through broken skylights and dirty windows in soft shafts, dust in the air, darker rooms beyond.',
        texture_and_material:
          'Lead paint delaminating in curled flakes, water-stained plaster, sagging acoustic tiles, corroded radiators and light fittings, moss and saplings through cracked floor tile.',
        camera_and_composition:
          'Keep the requested view; show the room function through its leftover fixtures, light shaft crossing the frame, no centred corridor.',
        atmosphere_and_mood: 'Melancholic, quiet and abandoned, time settling in dust.',
        rendering_and_quality:
          'Urban-exploration photograph with precise decay detail, no gore, creatures or horror staging.',
        key_features:
          'curled delaminating paint; collapsed ceiling tiles; rust-bleed from fixtures; moss through cracked floor; dusty skylight shafts',
      }),
      avoid: [
        ...AVOID,
        'fresh clean surfaces',
        'gore',
        'horror creatures',
        'asylum horror staging',
      ],
      dropAvoid: SPACE_DROP,
      briefs: [
        'Institutional ruin patina telephone switchboard hall: rows of abandoned switchboards with dangling cords, pale green paint curling off the walls, a birch sapling growing through the floor, a single dusty skylight shaft. No readable text or logo.',
        'Institutional ruin patina applied to a royal ballroom: a chandelier lying collapsed on moss-covered parquet, faded blue paint peeling in curls from the pilasters, rust streaks from the sconces, cool light through broken windows. No text or logo.',
        'Institutional ruin patina applied to a derelict cinema projection booth: two iron projectors furred with rust, film reels scattered, cream paint delaminating, a thin shaft of light through the projection port. No text or logo.',
      ],
    },
    'SP07-035': {
      dna: space({
        aesthetic:
          'Bibliographic classicism: the material language of a great old reading room — oak shelving bays, cast-iron galleries, brass rails and rolling ladders, leather and gilt under a coffered ceiling.',
        color_and_tone:
          'Oak brown, oxblood and bottle-green leather, worn gold leaf, brass, and green-glass lamp light; warm amber midtones, dark corners.',
        lighting_and_shadow:
          'Soft top light from a lantern or clerestory, green-shaded task lamps making warm pools, deep shadow in the shelving bays.',
        texture_and_material:
          'Quarter-sawn oak bays with carved end panels, brass rails and ladders on tracks, cast-iron spiral stairs, leather and cloth spines, card-drawer cabinets, worn gilding.',
        camera_and_composition:
          'Keep the requested view; stack vertical tiers of shelving or galleries, one warm lamp pool as the focus, no centred aisle.',
        atmosphere_and_mood: 'Studious, hushed and venerable, knowledge stored in wood and brass.',
        rendering_and_quality:
          'Warm low-light photograph with legible joinery and brass wear, spines without readable titles.',
        key_features:
          'oak shelving bays with rolling brass ladders; cast-iron galleries; green-shaded lamp pools; worn gilt coffering; leather spines',
      }),
      avoid: [...AVOID, 'readable book titles', 'bookstore aisle', 'plastic shelving'],
      dropAvoid: SPACE_DROP,
      briefs: [
        'Bibliographic classicism medieval monastery library: chained books on slanted oak lecterns, an adult monk reading by a green-glass lamp, brass rails, two tiers of shelving under a gilt coffered ceiling fading into dark. No readable text or logo.',
        "Bibliographic classicism applied to a perfumer's organ: a curved oak cabinet of tiered shelves holding hundreds of amber vials, a rolling brass ladder, an adult perfumer blending at the central desk under a lamp pool. No readable labels, text or logo.",
        "Bibliographic classicism applied to a violin-maker's workshop: unvarnished violins and cellos hanging in oak shelving bays, a cast-iron spiral stair to a gallery of seasoning wood, a single green-shaded lamp over the bench. No text or logo.",
      ],
    },
    'SP07-036': {
      dna: space({
        aesthetic:
          'Casino sensory grid: a windowless, clockless interior designed to hold attention, with low mirrored and gilded ceilings, busy patterned carpet, chandeliers and endless reflections.',
        color_and_tone:
          'Saturated red, gold and purple with green felt and pink-blue neon accents; everything warm and bright, no daylight tones anywhere.',
        lighting_and_shadow:
          'Hundreds of small pot lights and chandeliers from a low ceiling, glowing edges and neon strips, almost no shadow, no time of day.',
        texture_and_material:
          'Loud geometric or floral wool carpet, mirrored ceiling panels, polished brass trim, lacquered wood, green baize, crystal drops, glossy lacquer.',
        camera_and_composition:
          'Keep the requested view; compress space with a low ceiling and reflections, fill the frame edge to edge with pattern and light.',
        atmosphere_and_mood: 'Dazzling, timeless and slightly suffocating, a trap for attention.',
        rendering_and_quality:
          'Saturated interior photograph with crisp reflections and glints, no readable signs or screens.',
        key_features:
          'windowless low mirrored ceiling; busy patterned carpet; hundreds of pot lights; red gold and neon; endless reflections',
      }),
      avoid: [...AVOID, 'daylight', 'windows', 'readable screens', 'calm muted palette'],
      dropAvoid: SPACE_DROP,
      briefs: [
        "Casino sensory grid roulette table seen from directly above: adult players' hands sliding stacks of chips across green baize, a spinning wheel blurred, patterned red carpet at the edges, the mirrored ceiling reflecting the lamp grid. No readable text or logo.",
        "Casino sensory grid applied to a goblin king's throne room: a gilded throne under a low mirrored ceiling, a riot of red and gold patterned carpet, neon trim along the columns, courtiers in velvet crowding the reflections. No text or logo.",
        'Casino sensory grid applied to an all-night hotel breakfast room: sleepless adult guests eating eggs at green baize tables under a low mirrored ceiling, loud patterned carpet, hundreds of pot lights, no windows and no clocks. No readable screens, text or logo.',
      ],
    },
    'SP07-037': {
      dna: space({
        aesthetic:
          'Immersive aquarium optics: a room seen through or beside thick acrylic water walls, where blue attenuation, refraction and caustics shape everything.',
        color_and_tone:
          'Cyan to deep ultramarine with depth, warm colours absorbed first, silhouettes nearly black against the glowing tank; cool low key.',
        lighting_and_shadow:
          'Light coming from the water itself, rippling caustic nets on floors and faces, dark room around the glowing panel.',
        texture_and_material:
          'Thick curved acrylic with slight distortion at the edges, suspended particles, bubbles, wet stone and rock, dark polished floor catching caustics.',
        camera_and_composition:
          'Keep the requested view; silhouettes in the foreground against a large bright water field, no tunnel corridor.',
        atmosphere_and_mood: 'Hypnotic, cool and dreamlike, as if breathing underwater.',
        rendering_and_quality:
          'Photograph with correct depth colour loss, clean caustics and particle depth, no fish mascots.',
        key_features:
          'blue depth attenuation; rippling caustic nets; thick curved acrylic distortion; suspended particles; dark silhouettes against glowing water',
      }),
      avoid: [...AVOID, 'dry flat lighting', 'cartoon fish mascots', 'aquarium tunnel corridor'],
      dropAvoid: SPACE_DROP,
      briefs: [
        'Immersive aquarium optics jellyfish gallery: an adult visitor silhouetted before a floor-to-ceiling curved acrylic wall of drifting moon jellyfish, caustic ripples sliding across her coat and the dark floor. No text or logo.',
        'Immersive aquarium optics applied to a bedroom: a bed facing a whole wall of thick acrylic onto a kelp forest, blue light rippling over the sheets, a manta ray gliding past, an adult sleeper curled under the covers. No text or logo.',
        'Immersive aquarium optics applied to a submarine observation lounge: adult passengers silhouetted in armchairs before a vast curved window as a whale drifts past, caustic light rippling over the ceiling. No text or logo.',
      ],
    },
    'SP07-038': {
      dna: space({
        aesthetic:
          'Ossuary subterranean architecture: chambers carved into chalk, tuff or limestone, with low compressed barrel vaults and walls of empty stacked niches, crusted with calcite.',
        color_and_tone:
          'Chalk white, bone-cream and ochre stone, grey mortar, dark soot above lamp niches, warm small light against cold stone.',
        lighting_and_shadow:
          'Lanterns or candles in niches as the only source, warm falloff into darkness within a few metres, soft round shadows in each niche.',
        texture_and_material:
          'Pick-marked carved stone, calcite drip crusts and flowstone, dusty lime mortar, damp mineral bloom, worn stair treads cut into rock.',
        camera_and_composition:
          'Keep the requested view; low vaults pressing the top of the frame, rhythm of niches along the wall, no endless tunnel.',
        atmosphere_and_mood: 'Silent, buried and ancient, cool air far below ground.',
        rendering_and_quality:
          'Low-light photograph with carved tool marks and mineral crust detail, niches empty, no human remains or horror display.',
        key_features:
          'carved chalk and tuff chambers; low compressed barrel vaults; walls of empty stacked niches; calcite crust; lantern-only light',
      }),
      avoid: [...AVOID, 'human remains', 'skulls', 'bones', 'gore', 'horror display'],
      dropAvoid: SPACE_DROP,
      briefs: [
        'Ossuary subterranean chalk cellar of a champagne house: bottles resting in rows of carved niches under a low barrel vault, an adult cellar master turning them by lantern light, calcite crust on the walls. No readable labels, text or logo.',
        'Ossuary subterranean mushroom farm in old limestone quarry chambers: oyster mushrooms fruiting from sacks stacked in empty carved niches, a single lantern, pick-marked walls and damp mineral bloom. No text or logo.',
        'Ossuary subterranean chapel for a secret order: a stone altar under a compressed vault, empty niches holding only candles, an adult initiate in a grey hood kneeling, flowstone glistening. No text or logo.',
      ],
    },
    'SP07-039': {
      dna: space({
        aesthetic:
          'Data center grid: a sealed technical hall of hot and cold aisle containment, perforated raised floor, overhead cable trays and racks blinking in a cold white light.',
        color_and_tone:
          'Matte black racks, cool white and pale grey surfaces, yellow fibre raceway, tiny blue, green and amber status LEDs; clinical, cool, high order.',
        lighting_and_shadow:
          'Even cold LED strips above the aisles, glow of status lights in the dark rack faces, hard shadow lines from cable trays.',
        texture_and_material:
          'Perforated steel floor tiles, mesh rack doors, bundled patch cables combed into looms, yellow fibre trays, sealed containment doors with rubber gaskets.',
        camera_and_composition:
          'Keep the requested view; use the modular grid of racks and floor tiles as order, oblique or overhead views rather than a centred aisle.',
        atmosphere_and_mood: 'Cold, humming and inhuman, order sealed in chilled air.',
        rendering_and_quality:
          'Crisp technical photograph with clean cable dressing and tiny LED points, no readable screens or monitor walls.',
        key_features:
          'hot and cold aisle containment; perforated raised floor; yellow fibre raceway; blinking status LEDs; combed cable looms',
      }),
      avoid: [...AVOID, 'messy clutter', 'monitor wall', 'surveillance camera'],
      dropAvoid: SPACE_DROP,
      briefs: [
        'Data center grid applied to a cryo-vault of sleeping ancient kings: frost-rimmed stone sarcophagi racked in sealed cold-aisle containment, blue status LEDs blinking on each, perforated floor, yellow cable trays overhead. Oblique view. No text or logo.',
        'Data center grid applied to a hydroponic lettuce farm: rows of racks holding trays of green lettuce under cold white LEDs, combed irrigation lines like cable looms, an adult technician in a white coat checking roots. No text or logo.',
        'Data center grid seen from directly overhead: a grid of black rack roofs, yellow fibre raceways and perforated tiles, one adult engineer kneeling with an open floor tile beside her. No readable screens, text or logo.',
      ],
    },
    'SP07-040': {
      dna: space({
        aesthetic:
          'Arboreal craft shelter: hand-built timber structures in living trees, platforms bolted to trunks with heavy steel bolts, rope lashings, suspension bridges and small shingled roofs.',
        color_and_tone:
          'Silver-weathered timber, bark browns, rope tan, leaf greens, galvanised steel grey; dappled light with warm highlights.',
        lighting_and_shadow:
          'Dappled canopy light moving across decks, warm lanterns at dusk, cool green shade below the platforms.',
        texture_and_material:
          'Weathered cedar planks, square lashings of manila rope, galvanised bolts and cable, bark pressed against framing, cedar shingles and moss.',
        camera_and_composition:
          'Keep the requested view; show how the structure grips the trunk, height below it, bridges leading between trees.',
        atmosphere_and_mood: 'Adventurous, handmade and airy, living high among the leaves.',
        rendering_and_quality:
          'Natural-light photograph with honest joinery, lashing detail and bark contact, no plastic playground kit.',
        key_features:
          'platforms bolted to living trunks; rope lashings; plank suspension bridges; silver-weathered cedar; dappled canopy light',
      }),
      avoid: [...AVOID, 'plastic playground kit', 'children treehouse postcard'],
      dropAvoid: SPACE_DROP,
      briefs: [
        'Arboreal craft shelter treetop apothecary: a shingled hut wrapped around a giant oak trunk, jars of tincture on rope-hung shelves, an adult herbalist grinding roots on the deck, a plank bridge disappearing into the canopy. No text or logo.',
        "Arboreal craft shelter applied to a canopy research station in a rainforest: three platforms linked by swaying plank bridges, galvanised cable and rope lashings, an adult scientist with binoculars watching a hornbill. Worm's-eye view. No text or logo.",
        'Arboreal craft shelter applied to a wedding feast high in redwoods at dusk: a long table on a cedar deck bolted around the trunk, lanterns hanging from lashed beams, adult guests crossing a rope bridge with plates. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Anatomical Theatre Tiers',
      domain: 'early modern anatomical theatre',
      tags: ['anatomical-theatre', 'tiered', 'timber'],
      dna: space({
        aesthetic:
          'Anatomical theatre: steep concentric oval tiers of carved timber balustrades rising around a small central table, lit from a lantern skylight, built so every spectator looks down.',
        color_and_tone:
          'Dark walnut and oak, candle amber, pale linen and a cold grey skylight; strong central brightness falling away up the tiers.',
        lighting_and_shadow:
          'One top light from the lantern skylight onto the centre, supplementary candles on the rails, spectators in shadow above.',
        texture_and_material:
          'Turned timber balusters on each tier, worn standing rails, a stone or wooden central table, linen cloth, brass instruments.',
        camera_and_composition:
          'Keep the requested view; look down from the top tier into the funnel of rings, or up from the centre at the stacked balustrades.',
        atmosphere_and_mood:
          'Intense, scholarly and theatrical, every eye pressed toward one point.',
        rendering_and_quality:
          'Low-light photograph with crisp baluster rhythm and central light pool, no gore; any body stays covered.',
        key_features:
          'steep concentric oval timber tiers; turned baluster rails; lantern skylight onto the centre; central demonstration table; spectators looking down',
      }),
      avoid: [...AVOID, 'gore', 'exposed organs', 'flat lecture hall seating'],
      briefs: [
        'Anatomical theatre tiers at a medieval university: adult students in black gowns crammed on five steep oval rings of turned balusters, looking down at a lecturer beside a sheet-covered form on a stone table, grey skylight falling on the centre. Top-tier view. No text or logo.',
        "Anatomical theatre tiers applied to a clockmaker's guild demonstration: a master lifting the brass heart out of a life-size automaton on the central table, candles on every rail, faces of adult apprentices ringed above. No text or logo.",
        "Anatomical theatre tiers applied to a puppet opera: marionettes performing on the small central table, the puppeteers hidden above in the lantern, adult spectators in carnival masks leaning over the stacked oval rails. Worm's-eye view from the centre. No text or logo.",
      ],
    },
    {
      name: 'Flooded Column Cistern',
      domain: 'underground column cistern',
      tags: ['cistern', 'columns', 'underground-water'],
      dna: space({
        aesthetic:
          'Flooded column cistern: a vast underground reservoir hall of reused stone columns carrying brick cross vaults, standing in shallow still water that doubles every column.',
        color_and_tone:
          'Warm amber uplights on red-brown brick and honey stone, black-green water, dark depths between columns; strong warm-to-black range.',
        lighting_and_shadow:
          'Low lights at column bases throwing warm light up the shafts, reflections in still water, darkness swallowing the far rows.',
        texture_and_material:
          'Mismatched stone columns and capitals, thin Roman-style brick in herringbone vaults, lime mineral tide lines, dripping water rings, moss at the waterline.',
        camera_and_composition:
          'Keep the requested view; stand low near the waterline so columns and their reflections form a symmetrical forest receding in diagonal rows.',
        atmosphere_and_mood: "Cavernous, still and echoing, the city's hidden reservoir.",
        rendering_and_quality:
          'Low-light photograph with glassy reflections and precise brick coursing, no fantasy glow effects.',
        key_features:
          'forest of stone columns in still water; brick cross vaults; warm uplights at column bases; mirror reflections; mineral tide lines',
      }),
      avoid: [...AVOID, 'dry floor', 'fantasy glow effects', 'modern concrete tank'],
      briefs: [
        'Flooded column cistern with a lone adult boatman poling a flat skiff between rows of stone columns, warm uplights doubling every shaft in the black water, brick vaults disappearing into darkness. Low waterline view. No text or logo.',
        'Flooded column cistern applied to a subterranean fish farm: floating timber pens between the column rows, an adult fisher scattering feed that ripples the amber reflections, brick vaults fading into darkness. No text or logo.',
        'Flooded column cistern applied to a candlelit concert: an adult cellist playing on a floating timber platform among the columns, hundreds of candles on floating boards, brick vaults glowing above. No text or logo.',
      ],
    },
    {
      name: 'Observatory Dome Instrumentation',
      domain: 'astronomical observatory interior',
      tags: ['observatory', 'dome', 'instruments'],
      dna: space({
        aesthetic:
          'Observatory dome interior: a rotating hemispherical dome with an open shutter slit, a massive equatorial telescope mount on a pier, and a raised observing floor ringed by brass and iron.',
        color_and_tone:
          'Deep night blue through the slit, dim red working light, riveted steel grey, brass gold and dark enamel; very low key.',
        lighting_and_shadow:
          'Starlight and sky glow through the shutter, dim red lamps to preserve night vision, instrument brass catching the only highlights.',
        texture_and_material:
          'Riveted curved dome ribs and sheet panels, rail and wheels at the dome base, cast-iron pier, enamelled telescope tube, brass setting circles and counterweights.',
        camera_and_composition:
          'Keep the requested view; the slit carving a band of sky across the dome, the telescope diagonal pointing into it.',
        atmosphere_and_mood: 'Patient, nocturnal and awed, a small room aimed at infinity.',
        rendering_and_quality:
          'Night photograph with clean star points, red light kept low, riveted structure legible.',
        key_features:
          'rotating dome with open shutter slit; equatorial telescope on a pier; dim red working light; riveted dome ribs; brass setting circles',
      }),
      avoid: [...AVOID, 'daylight', 'white work light', 'planetarium projection'],
      briefs: [
        'Observatory dome instrumentation at midnight: the shutter slit open onto a green aurora, a giant enamelled refractor angled into it, an adult astronomer on a wooden ladder at the eyepiece under dim red light. No text or logo.',
        "Observatory dome instrumentation applied to a medieval astrologer's tower room: a riveted iron dome over stone walls, a brass armillary sphere on a pier where the telescope would be, parchment charts under red lamplight. No readable text or logo.",
        'Observatory dome instrumentation applied to a mountaintop cafe at night: small round tables on the observing floor under a riveted dome, the slit open to a bright comet, brass counterweights on the walls, adult guests with cups in dim red light. No text or logo.',
      ],
    },
    {
      name: 'Victorian Pumping Station Ironwork',
      domain: 'Victorian engine house interior',
      tags: ['pumping-station', 'cast-iron', 'polychrome'],
      dna: space({
        aesthetic:
          'Victorian pumping station ironwork: an engine house turned into a cathedral of machinery, with ornate cast-iron columns, galleries and brackets painted in polychrome around giant beam engines.',
        color_and_tone:
          'Deep red, green, cream and gilt on cast iron, polished brass and steel, glazed brick; rich colour with oily dark shadows.',
        lighting_and_shadow:
          'Tall arched windows letting in side light, gleams on brass and oil, dark pits around the engines.',
        texture_and_material:
          'Cast-iron columns with foliate capitals, pierced iron gallery screens, octagonal floor plates, beam engines with polished brass, glazed brick walls.',
        camera_and_composition:
          'Keep the requested view; look up through layers of painted ironwork galleries, one huge wheel or beam crossing the frame.',
        atmosphere_and_mood: 'Grand, proud and mechanical, engineering dressed as a temple.',
        rendering_and_quality:
          'Detailed photograph with crisp ornament and clean paint, oil sheen, no steampunk gadget clutter.',
        key_features:
          'polychrome painted cast-iron columns; foliate capitals and pierced galleries; giant beam engines; polished brass; tall arched windows',
      }),
      avoid: [...AVOID, 'steampunk gadget clutter', 'goggles and gears decor', 'plain grey steel'],
      briefs: [
        'Victorian pumping station ironwork engine hall: four giant beam engines rocking under galleries of red-and-green painted cast iron with gilded foliate capitals, an adult engineer with an oil can on the iron stair, arched windows streaming side light. Low upward view. No text or logo.',
        'Victorian pumping station ironwork applied to a tea salon: small marble tables under pierced iron galleries and polychrome columns, a polished brass urn the size of a boiler, adult guests in afternoon dress. No text or logo.',
        'Victorian pumping station ironwork applied to a dragon stable: a chained sleeping dragon in the pit where the engines would be, gilded iron columns rising around it, arched windows casting side light across its scales. No text or logo.',
      ],
    },
    {
      name: 'Horseshoe Opera Auditorium',
      domain: 'horseshoe opera house interior',
      tags: ['opera-house', 'auditorium', 'gilt'],
      dna: space({
        aesthetic:
          'Horseshoe opera auditorium: a stacked horseshoe of private boxes in four or five tiers facing a proscenium, with red velvet, gilded plaster and a great chandelier at the centre of a painted ceiling.',
        color_and_tone:
          'Crimson velvet, ivory and gold leaf, warm candle-like chandelier light, dark stage mouth; rich, warm and high contrast between box interiors and fronts.',
        lighting_and_shadow:
          'The chandelier and small box sconces as warm sources, stage light spilling from the proscenium, dark box interiors behind gilt fronts.',
        texture_and_material:
          'Carved and gilded plaster box fronts, red velvet upholstery and drapes, painted ceiling roundel, parquet stalls, heavy tasselled stage curtain.',
        camera_and_composition:
          'Keep the requested view; from the stage look back at the horseshoe of tiers, or from a high box across to the proscenium.',
        atmosphere_and_mood:
          'Glamorous, expectant and theatrical, a whole society watching itself.',
        rendering_and_quality:
          'Warm low-light photograph with crisp gilt ornament and velvet depth, no readable programmes or signs.',
        key_features:
          'stacked horseshoe of boxes; red velvet and gilded plaster; central crystal chandelier; painted ceiling roundel; proscenium arch',
      }),
      avoid: [...AVOID, 'modern cinema seats', 'flat fan-shaped hall', 'readable programmes'],
      briefs: [
        'Horseshoe opera auditorium seen from the stage during a ghost performance: five tiers of gilded boxes filled with pale translucent adult spectators in period dress, the chandelier burning low, crimson velvet swallowing the light. No text or logo.',
        'Horseshoe opera auditorium applied to a parliament of owls: owls perched on every gilded box rail in rising tiers, one great horned owl presiding from the proscenium, chandelier glinting in their eyes. No text or logo.',
        'Horseshoe opera auditorium applied to a boxing match: a roped ring built over the stalls, two adult fighters in the spotlight, the horseshoe tiers of red velvet boxes packed with spectators in evening dress. High box view. No text or logo.',
      ],
    },
    {
      name: 'Oak-Panelled Courtroom',
      domain: 'traditional courtroom interior',
      tags: ['courtroom', 'oak-panelling', 'civic'],
      dna: space({
        aesthetic:
          'Oak-panelled courtroom: a hierarchy built in joinery, with a raised bench under a canopy, a railed dock, a jury box, counsel tables and a public gallery, all in dark panelled oak.',
        color_and_tone:
          'Dark oak brown, green leather, brass, cream plaster above the panelling, grey daylight; sober and low saturation.',
        lighting_and_shadow:
          'High clerestory or lantern daylight falling on the well of the court, darker panelled edges, green-shaded lamps on the bench.',
        texture_and_material:
          'Raised-and-fielded oak panels, turned rails and spindles around the dock, green leather seats, brass rails, carved canopy over the bench.',
        camera_and_composition:
          'Keep the requested view; low angle from the well toward the raised bench to stress hierarchy, or from the dock looking out.',
        atmosphere_and_mood: 'Grave, formal and tense, judgement built into the furniture.',
        rendering_and_quality:
          'Sober daylight photograph with legible joinery, no readable crests, mottoes or documents.',
        key_features:
          'raised bench under a carved canopy; railed dock; raised-and-fielded oak panelling; green leather and brass; clerestory light on the well',
      }),
      avoid: [...AVOID, 'readable crests or mottoes', 'flags', 'modern office furniture'],
      briefs: [
        'Oak-panelled courtroom trial of a werewolf: a shaggy adult defendant in chains standing in the railed dock, the judge in a black robe under the carved canopy, clerestory light falling on the well between them. Low angle from the well. No readable text or logo.',
        'Oak-panelled courtroom applied to a council of witches: adult witches in dark hats seated in the jury box and on the bench, a cauldron steaming in the well of the court, green leather and brass rails. No text or logo.',
        "Oak-panelled courtroom applied to a ship's wardroom on a man-of-war: officers at a long table inside a raised-and-fielded oak cabin, a railed stern gallery like a dock, grey sea light through the stern windows. No text or logo.",
      ],
    },
    {
      name: 'Radial Panopticon Cell Block',
      domain: 'radial prison architecture',
      tags: ['panopticon', 'cell-block', 'radial'],
      dna: space({
        aesthetic:
          'Radial panopticon cell block: tiers of identical cells with iron galleries and stairs ringing a tall top-lit hall, all visible from a central observation point.',
        color_and_tone:
          'Whitewashed brick, grey and black iron, pale green institutional paint, cold daylight from above; restrained, cold and repetitive.',
        lighting_and_shadow:
          'Top light from a roof lantern down the central void, galleries casting striped shadows, cell doors dark.',
        texture_and_material:
          'Cast-iron galleries with lattice balustrades, safety netting between tiers, riveted cell doors with small hatches, whitewashed brick, stone floors worn by pacing.',
        camera_and_composition:
          'Keep the requested view; from the centre, radiating wings or rings of cells recede symmetrically; repetition of doors dominates.',
        atmosphere_and_mood: 'Watched, cold and ordered, a building designed to be seen through.',
        rendering_and_quality:
          'Sober photograph with exact repetition and ironwork detail, no violence or gore.',
        key_features:
          'tiers of identical cells around a central void; iron lattice galleries; roof lantern top light; safety netting; central observation point',
      }),
      avoid: [...AVOID, 'violence', 'gore', 'riot scene'],
      briefs: [
        'Radial panopticon cell block from the central rotunda: four wings of three-tier iron galleries radiating away, identical riveted doors, safety nets strung between the tiers, a shaft of roof-lantern light on the stone floor. No text or logo.',
        'Radial panopticon cell block applied to a bee-keeping cooperative: tiers of identical cells holding straw bee skeps instead of prisoners, adult beekeepers in veils on the iron galleries, the central void filled with drifting bees in top light. No text or logo.',
        "Radial panopticon cell block applied to a grand hotel atrium: round tiers of identical room doors with lattice balustrades rising to a glass lantern, an adult bellhop crossing the empty floor, cold morning light. Worm's-eye view. No text or logo.",
      ],
    },
    {
      name: 'Yellow-Light Clean Room',
      domain: 'semiconductor clean room',
      tags: ['clean-room', 'semiconductor', 'yellow-light'],
      dna: space({
        aesthetic:
          'Yellow-light clean room: a semiconductor fabrication bay lit by filtered amber light, with laminar-flow ceiling filters, perforated floors and workers in full-body gowns.',
        color_and_tone:
          'Monochrome saturated yellow-amber light over white surfaces, white gowns turned butter yellow, small cool reflections in steel; one-colour cast.',
        lighting_and_shadow:
          'Even filtered yellow light from a grid of ceiling panels, almost shadowless, soft glossy highlights on polished steel.',
        texture_and_material:
          'Ceiling of fan filter units, perforated raised floor, brushed stainless benches, sealed tool enclosures, bunny-suit gowns with hoods, masks and gloves.',
        camera_and_composition:
          'Keep the requested view; long bay of repeating tool enclosures, gowned figures small and faceless, symmetry softened by yellow haze.',
        atmosphere_and_mood: 'Sterile, silent and uncanny, a sealed world with one colour.',
        rendering_and_quality:
          'Clean photograph with a single yellow cast held consistently, no readable screens or labels.',
        key_features:
          'filtered yellow-amber light; full-body gowned figures; laminar-flow ceiling filters; perforated floor; stainless tool enclosures',
      }),
      avoid: [...AVOID, 'white daylight', 'readable screens', 'mess or dust'],
      briefs: [
        'Yellow-light clean room fabrication bay: two adult technicians in full-body gowns carrying a pod of silicon wafers between stainless tool enclosures, the whole bay drowned in butter-yellow filtered light. No readable screens, text or logo.',
        'Yellow-light clean room applied to a potion laboratory: gowned adult alchemists handling glowing vials in sealed glove boxes, a grid of ceiling filters above, amber light turning every glass yellow. No text or logo.',
        'Yellow-light clean room applied to a sushi counter: a gowned and masked adult chef slicing fish on a stainless bench under a laminar hood, gowned diners on stools, everything monochrome butter yellow. No text or logo.',
      ],
    },
    {
      name: 'White-Cube Gallery',
      domain: 'contemporary art gallery',
      tags: ['gallery', 'white-cube', 'exhibition'],
      dna: space({
        aesthetic:
          'White-cube gallery: a neutral exhibition box of seamless white walls, pale polished concrete floor and track lights, where one object is presented as if nothing else exists.',
        color_and_tone:
          'Pure matte white walls, pale grey concrete, the exhibited object as the only colour; high key and silent.',
        lighting_and_shadow:
          'Ceiling track spots aimed at the object, soft even wash on the walls, one crisp shadow under the object.',
        texture_and_material:
          'Seamless skim-plastered walls without skirting, sealed polished concrete, recessed track lighting, a low white plinth, no labels.',
        camera_and_composition:
          'Keep the requested view; frontal, one object centred with large empty white margins, sightline to a second room through a wide opening.',
        atmosphere_and_mood: 'Reverent, cool and exacting, anything placed here becomes art.',
        rendering_and_quality:
          'Clean gallery photograph with even white without clipping, no wall text or labels.',
        key_features:
          'seamless white walls; polished pale concrete; track spotlights; single object on a low plinth; large empty margins',
      }),
      avoid: [...AVOID, 'wall labels', 'crowded salon hang', 'coloured walls'],
      briefs: [
        "White-cube gallery exhibiting a single battered knight's helm on a low white plinth, one track spot throwing a crisp shadow, an adult visitor standing far back in the next room, huge empty white walls. No text or logo.",
        "White-cube gallery applied to a blacksmith's forge: an anvil and a quenching trough presented on polished concrete like sculpture, the smith in a leather apron at work under white track lights, seamless white walls. No text or logo.",
        'White-cube gallery presenting a single black meteorite on a low white plinth in an otherwise empty room, a track spot catching its pitted surface, a crisp shadow, pale concrete floor stretching to a wide opening. No text or logo.',
      ],
    },
    {
      name: 'Cold War Bunker',
      domain: 'Cold War bunker interior',
      tags: ['bunker', 'cold-war', 'concrete'],
      dna: space({
        aesthetic:
          'Cold War bunker: a buried reinforced-concrete shelter of blast doors, air-filtration machinery, bunk rooms and control desks, painted in institutional colours and lit by caged lamps.',
        color_and_tone:
          'Pale institutional green and cream paint, grey concrete, olive steel, a red stripe on valves, amber indicator lamps; muted and slightly sickly.',
        lighting_and_shadow:
          'Caged incandescent bulbs and flickering fluorescent tubes, low ceilings with hard shadows, dark rooms beyond thick doorways.',
        texture_and_material:
          'Round steel blast doors with wheel locks, thick concrete with painted lower walls, ducts and filtration housings, metal bunks, bakelite switches and analogue dials.',
        camera_and_composition:
          'Keep the requested view; frame through a thick door opening, low ceiling pressing down, machinery lining the walls.',
        atmosphere_and_mood: 'Enclosed, anxious and waiting, a world sealed against the end.',
        rendering_and_quality:
          'Low-light photograph with period analogue detail and worn paint, no readable signs or screens.',
        key_features:
          'round steel blast doors; pale green painted concrete; caged bulbs and fluorescent tubes; air-filtration ducts; analogue dials',
      }),
      avoid: [...AVOID, 'readable signs', 'modern flat screens', 'weapons display'],
      briefs: [
        'Cold War bunker control room: adult operators in cardigans at bakelite desks studded with analogue dials, a map wall without readable text, caged bulbs, a round blast door hanging open behind them. No readable text or logo.',
        'Cold War bunker applied to a radio-play recording room: adult actors in cardigans crowding one microphone, a sound engineer behind thick glass with analogue dials, pale green painted concrete, a wheel-locked blast door, caged bulbs. No readable text or logo.',
        "Cold War bunker applied to a hibernating bear's den: a huge brown bear asleep on metal bunks heaped with blankets, fluorescent tube flickering, olive steel ducts and a blast door ajar. No text or logo.",
      ],
    },
    {
      name: 'Glazed-Tile Municipal Baths',
      domain: 'Edwardian public swimming baths',
      tags: ['public-baths', 'glazed-tile', 'civic'],
      dna: space({
        aesthetic:
          'Municipal swimming baths of the early twentieth century: a long pool hall of glazed brick and tile under arched iron roof trusses, with changing cubicles lining a gallery around the water.',
        color_and_tone:
          'White and cream glazed brick with a band of green or blue tile, turquoise water, painted iron roof, warm wood cubicle doors; clean and bright with steam haze.',
        lighting_and_shadow:
          'Daylight from a long glazed roof or clerestory, reflected rippling light on tiled walls, steam softening the far end.',
        texture_and_material:
          'Glazed brick with coloured tile bands, arched riveted iron trusses, timber cubicle doors along a railed gallery, mosaic lane lines, brass fittings.',
        camera_and_composition:
          'Keep the requested view; long view down the pool or from the gallery, cubicle doors repeating along both sides.',
        atmosphere_and_mood: 'Echoing, civic and bright, a public luxury of water.',
        rendering_and_quality:
          'Photograph with crisp tile joints, ripple reflections and gentle steam, no readable signs.',
        key_features:
          'glazed brick with coloured tile bands; arched iron roof trusses; changing cubicles along a gallery; turquoise water; ripple reflections on tile',
      }),
      avoid: [...AVOID, 'resort pool', 'plastic water slides', 'readable signs'],
      briefs: [
        'Glazed-tile municipal baths at opening time: an adult swimmer in a striped period costume diving from the end board, cubicle doors lining both galleries, arched iron trusses above, ripples throwing light across green-banded glazed brick. No text or logo.',
        'Glazed-tile municipal baths applied to a public laundry: adult washerwomen at rows of tiled sinks where the pool would be, steam rising to the iron trusses, cream and blue tile bands. No text or logo.',
        'Glazed-tile municipal baths with a kraken in the deep end: pale tentacles curling over the tiled edge toward the cubicles, rippling light on white glazed brick, the gallery empty. No text or logo.',
      ],
    },
  ],
};

export default spec;
