import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'golden-hour hero facade formula',
  'copy of a named landmark',
  'mixing construction systems of different movements',
  'invented cultural symbols',
  'costumed tourist staging',
];

// Template negatives that blocked a building type or view a prompt may ask for, or were garbled.
const ARCH_DROP = [
  'modern',
  'corridor',
  'generic corridor',
  'city street',
  'village street',
  'pew rows',
  'cathedral nave corridor',
  'box',
  'square',
  'boring',
  'mandatory interior interior zones',
  'warm wood interior zones',
  'generic facade',
];

// Movements and vernaculars are themes with a structural scope that must be stated.
const build =
  'Keep the requested building type, site, camera and any reference massing; in preserve mode re-clad only facade materials, openings, ornament and finish, and rebuild roof, massing and structure in this system only when a redesign is requested.';

function arch(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? build, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_07',
  category: '2. Architectural Movements And Vernaculars',
  updates: {
    'SP07-006': {
      dna: arch({
        aesthetic:
          'Brutalist architecture: cast-in-place concrete left raw, showing board-formed plank grain and tie holes, heavy cantilevered upper masses and deep-set repetitive window bays.',
        color_and_tone:
          'Mineral greys from warm oatmeal to cold blue-grey, rain streaks darkening vertical faces; almost no applied color, contrast carried by shadow.',
        lighting_and_shadow:
          'Raking side light that pulls out plank texture, deep black shadow under cantilevers and inside window reveals, overcast light for heaviness.',
        texture_and_material:
          'Board-marked concrete with timber grain printed in it, bush-hammered ribbed panels, regular formwork tie holes, water staining and lichen at drips.',
        camera_and_composition:
          'Keep the requested view; low angle to stress weight, strong horizontal overhangs, repetitive bays running out of frame, people small at the base.',
        atmosphere_and_mood: 'Monumental, severe and honest, weight made visible.',
        rendering_and_quality:
          'Architectural photograph with crisp plank grain and sharp shadow edges, straight verticals, no smooth plaster or glossy cladding.',
        key_features:
          'board-formed concrete with plank grain; formwork tie holes; heavy cantilevered masses; deep-set repetitive window bays; rain-streaked grey faces',
      }),
      avoid: [
        ...AVOID,
        'painted finish hiding the concrete',
        'glass curtain wall dominance',
        'delicate trim',
      ],
      dropAvoid: ARCH_DROP,
      briefs: [
        'Brutalist architecture monastery on a sea cliff in driving rain: board-formed concrete cells cantilevered over the drop, deep-set window slots, rain streaks darkening the plank-grained walls, a single adult monk crossing a raised concrete walkway far below. Low angle. No text or logo.',
        'Brutalist architecture fire station seen from across a snowy square at dusk: three deep garage bays under a massive cantilevered concrete beam, bush-hammered ribbed piers, one red engine glowing inside. No readable text or logo.',
        'Brutalist architecture observatory on a bare mountain ridge: a board-marked concrete drum with a steel dome, repetitive tie-hole grid visible in raking morning light, a switchback road climbing toward it. No text or logo.',
      ],
    },
    'SP07-007': {
      dna: arch({
        aesthetic:
          'Art Deco architecture: stepped setback massing, strong vertical piers, and ornament concentrated in spandrels, crowns and entrances as chevrons, zigzags, sunbursts and stylised relief.',
        color_and_tone:
          'Cream limestone or glazed terracotta with black granite base, polished nickel, brass and gold, emerald or jade accents; high contrast at entrances.',
        lighting_and_shadow:
          'Floodlighting from below at night grazing vertical piers, or crisp daylight picking out relief; stepped crowns lit against a dark sky.',
        texture_and_material:
          'Glazed terracotta and faience cladding, polished black granite, cast aluminium or nickel spandrel panels, etched glass, geometric terrazzo at entries.',
        camera_and_composition:
          'Keep the requested view; upward view emphasising verticality and setbacks, symmetrical entrance centred, ornament bands crisp.',
        atmosphere_and_mood: 'Glamorous, optimistic and streamlined power reaching upward.',
        rendering_and_quality:
          'Sharp architectural photograph with clean geometric ornament and precise metal reflections, no signage lettering.',
        key_features:
          'stepped setback massing; vertical piers with chevron spandrels; sunburst crown; glazed terracotta and black granite; polished nickel and brass',
      }),
      avoid: [...AVOID, 'rustic materials', 'readable signage', 'nightclub stage'],
      dropAvoid: ARCH_DROP,
      briefs: [
        "Art Deco architecture cinema palace in a mountain pine town at night: a symmetrical black granite entrance under a fan of polished brass sunburst rays, chevron-patterned terrazzo forecourt, floodlights grazing the vertical piers, an adult couple in evening coats arriving. Worm's-eye view. No readable marquee, text or logo.",
        'Art Deco architecture riverside power station in winter fog: two fluted brick-and-terracotta chimneys framing a symmetrical entrance of polished nickel doors, zigzag relief panels, black granite base wet with mist. No text or logo.',
        'Art Deco architecture telephone exchange tower on a clear winter morning: a stepped setback shaft of cream glazed terracotta, low sun raking the chevron spandrels between vertical piers, a sunburst crown against pale blue sky, polished nickel entrance doors below. No text or logo.',
      ],
    },
    'SP07-009': {
      dna: arch({
        aesthetic:
          'Gothic Revival architecture: pointed arches, lancet and traceried windows, buttresses, steep roofs with pinnacles and crockets, applied with nineteenth-century precision.',
        color_and_tone:
          'Pale limestone ashlar or polychrome red and yellow brick banding, slate-grey roofs, dark leaded glass; muted overall with stained glass colour inside.',
        lighting_and_shadow:
          'Soft overcast or low slanting light that deepens tracery and buttress shadows; interiors lit in coloured shafts from stained glass.',
        texture_and_material:
          'Dressed limestone with sharp mouldings, carved crockets and finials, polychrome brick, slate roofs, cast-iron cresting, leaded stained glass.',
        camera_and_composition:
          'Keep the requested view; strong verticals, pointed arches framing depth, spires or gables breaking the skyline.',
        atmosphere_and_mood: 'Aspiring, solemn and romantic, piety rendered in stone.',
        rendering_and_quality:
          'Detailed architectural photograph with legible tracery and moulding, straight verticals, no ruin or horror decay unless requested.',
        key_features:
          'pointed lancet arches; stone tracery windows; pinnacles and crockets; polychrome brick banding; steep slate roofs',
      }),
      avoid: [...AVOID, 'horror ruin', 'readable religious text', 'flat modern cladding'],
      dropAvoid: ARCH_DROP,
      briefs: [
        'Gothic Revival architecture academy for necromancers on a moor at twilight: polychrome brick halls with lancet windows glowing faint green, pinnacled gables and a slate spire, crows lifting off cast-iron cresting. No text or logo.',
        'Gothic Revival architecture railway-hotel dining hall: pointed-arch arcades of pale limestone, a rib-vaulted ceiling, stained glass throwing coloured shafts across long white-clothed tables with adult diners. No text or logo.',
        'Gothic Revival architecture pumping-station waterworks seen across a reservoir: traceried windows and pinnacled buttresses on a brick engine house, a tall chimney disguised as a bell tower, reflection in still grey water. No text or logo.',
      ],
    },
    'SP07-021': {
      dna: arch({
        aesthetic:
          'Deconstructivist architecture: fragmented volumes that collide at non-orthogonal angles, tilted walls, slashed openings and cantilevers that seem to lack support.',
        color_and_tone:
          'Brushed zinc, titanium and stainless silver, raw concrete grey and white render; cool palette where color comes from reflected sky.',
        lighting_and_shadow:
          'Hard sun producing sharp angular shadow cuts across tilted planes, reflections shifting from bright to dark on each facet.',
        texture_and_material:
          'Standing-seam metal and shingled titanium cladding, exposed steel, board-formed concrete fragments, glazing cut into irregular slashes.',
        camera_and_composition:
          'Keep the requested view; dynamic oblique angle, no horizon kept level with any wall, volumes cropped so the collision fills the frame.',
        atmosphere_and_mood: 'Unsettled, kinetic and provocative, as if stability were undone.',
        rendering_and_quality:
          'Crisp architectural photograph, clean metal reflections and knife-edge shadows, no copy of a named landmark museum.',
        key_features:
          'colliding non-orthogonal volumes; tilted walls; slashed window cuts; brushed zinc and titanium cladding; unsupported-looking cantilevers',
      }),
      avoid: [...AVOID, 'symmetrical facade', 'plain glass box', 'museum postcard'],
      dropAvoid: ARCH_DROP,
      briefs: [
        'Deconstructivist architecture war memorial chapel in a field of snow: shattered zinc-clad volumes leaning against each other, a slashed window cut spilling a thin blade of light into the white, one adult visitor in a dark coat for scale. No text or logo.',
        'Deconstructivist architecture library wing punched through an old stone townhouse, seen from street level: a titanium-shingled wedge bursting out of the facade at a steep angle, knife-edge shadows at noon. No readable text or logo.',
        'Deconstructivist architecture ferry terminal on a grey harbour: tilted concrete and steel planes stacked like cracked ice floes, glazing cut into diagonal slashes, a ferry docking below. No text or logo.',
      ],
    },
    'SP07-022': {
      dna: arch({
        aesthetic:
          'Neoclassical architecture: a temple front of correctly proportioned columns and pediment, rusticated base, strict bilateral symmetry and calm ashlar walls.',
        color_and_tone:
          'White marble, pale honey limestone and stucco, grey lead roofs and verdigris domes; low saturation, clear light-to-shadow value steps.',
        lighting_and_shadow:
          'Clear raking sun that models column fluting and the deep shadow behind the portico, or even soft light for a calm frontal read.',
        texture_and_material:
          'Fluted columns in Doric, Ionic or Corinthian order, finely jointed ashlar, rusticated ground storey, carved entablature and pediment relief, stone steps.',
        camera_and_composition:
          'Keep the requested view; frontal symmetry on the central axis, steps leading up to the portico, pediment near the top third.',
        atmosphere_and_mood: 'Serene, rational and authoritative, order made permanent.',
        rendering_and_quality:
          'Clean architectural photograph with correct column entasis and orders, crisp mouldings, no readable inscriptions.',
        key_features:
          'pedimented temple portico; fluted columns of a correct order; rusticated base; strict bilateral symmetry; pale ashlar stone',
      }),
      avoid: [...AVOID, 'asymmetry', 'readable inscription', 'mixed column orders'],
      dropAvoid: ARCH_DROP,
      briefs: [
        'Neoclassical architecture greenhouse orangery in a winter park: a Doric portico of pale limestone fronting tall arched glazing, orange trees glowing inside, snow on the rusticated base, strict frontal symmetry. No text or logo.',
        'Neoclassical architecture royal riding school on a flat plain: a long Tuscan colonnade under a low pediment, an adult rider schooling a white stallion on the sand in front, soft overcast light on honey ashlar. No text or logo.',
        'Neoclassical architecture tomb of a forgotten queen half-drowned in a flooded marsh at dawn: a small Ionic temple front rising from black water, mist in the portico, mirrored columns. No readable inscription, text or logo.',
      ],
    },
    'SP07-023': {
      dna: arch({
        aesthetic:
          'Parametric architecture: facades and roofs generated by algorithm, with ribs, louvres or panels that change size, rotation and spacing gradually across doubly curved surfaces.',
        color_and_tone:
          'Mostly white and pale grey composite with glass, occasional warm timber louvres; value gradients created by changing rib density.',
        lighting_and_shadow:
          'Low sun raking across fins so shadow density shifts continuously along the surface; soft embedded linear light at night.',
        texture_and_material:
          'Glass-fibre reinforced concrete and composite panels, CNC-cut aluminium fins, laminated timber ribs, seamless joints between panels.',
        camera_and_composition:
          'Keep the requested view; follow one sweeping curve across the frame, show how the rib pattern gradates from dense to open.',
        atmosphere_and_mood: 'Fluid, precise and futuristic, a surface that seems to breathe.',
        rendering_and_quality:
          'Clean architectural photograph with continuous gradients in fin spacing, smooth curves without faceting errors.',
        key_features:
          'gradated fin and louvre spacing; doubly curved white surfaces; algorithmic panel rotation; seamless composite joints; raking light through ribs',
      }),
      avoid: [...AVOID, 'brick', 'orthogonal box massing', 'generic shopping mall'],
      dropAvoid: ARCH_DROP,
      briefs: [
        'Parametric architecture beehive research pavilion in a lavender field: a timber-ribbed dome whose ribs widen into hexagonal openings toward the top, bees drifting through raking morning light, one adult beekeeper in white. No text or logo.',
        'Parametric architecture desert concert shell at night: a white doubly curved canopy of rotating aluminium fins glowing from embedded light, dunes behind, a small orchestra of adults below. No text or logo.',
        'Parametric architecture pedestrian bridge over a gorge: a twisting white lattice whose ribs grow denser at the supports, mist rising from the river far below, seen from a cliff edge. No text or logo.',
      ],
    },
    'SP07-024': {
      dna: arch({
        aesthetic:
          'Victorian Painted Lady: timber row-house facades in Italianate, Stick and Queen Anne manners, with bay windows and every bracket, spindle and shingle picked out in three or more paint colours.',
        color_and_tone:
          'Body in a pastel or deep heritage colour — sage, rose, butter, lavender, teal — with contrasting trim and a third accent on details; saturated but harmonious.',
        lighting_and_shadow:
          'Bright side light that throws the shadows of brackets and spindlework onto the siding, or soft fog light that flattens the colour blocks.',
        texture_and_material:
          'Painted clapboard, fish-scale and diamond shingles, turned spindles, scroll-sawn brackets and gingerbread, stained-glass transoms, steep front steps.',
        camera_and_composition:
          'Keep the requested view; frontal elevation or a row stepping up a hill, the bay window column centred, trim readable.',
        atmosphere_and_mood: 'Cheerful, proud and ornamental, colour as neighbourly display.',
        rendering_and_quality:
          'Sharp daylight photograph with clean paint edges on each trim piece, no peeling unless requested.',
        key_features:
          'three-plus colour trim scheme; angled bay windows; fish-scale shingles; turned spindlework and brackets; painted clapboard siding',
      }),
      avoid: [...AVOID, 'single-colour paint', 'grey siding', 'preserved street postcard'],
      dropAvoid: ARCH_DROP,
      briefs: [
        "Victorian Painted Lady witch's apothecary on a steep hill street in fog: a narrow timber facade in plum, sage and gold trim, fish-scale shingles, a bay window crowded with glowing jars, a black cat on the steps. No readable signs, text or logo.",
        "Victorian Painted Lady clockmaker's shop and home squeezed onto a corner lot: a round turret with butter-yellow clapboard and teal spindle balconies, rose brackets, a large clock face without numerals in the gable, bright side light throwing bracket shadows. No text or logo.",
        'Victorian Painted Lady row of six narrow houses turned into a floating houseboat street on a canal, each facade a different pastel with contrasting gingerbread trim, bay windows reflected in green water. No text or logo.',
      ],
    },
    'SP07-025': {
      dna: arch({
        aesthetic:
          'Bauhaus architecture: asymmetric composition of white rendered cubic wings, flat roofs, ribbon windows and a glass curtain wall on steel mullions, with no ornament.',
        color_and_tone:
          'White and light grey render, black steel window frames, dark glass; at most one small primary accent on a door or balcony soffit.',
        lighting_and_shadow:
          'Clear daylight with crisp cube shadows, glass wall reflecting sky, cantilevered balconies casting thin horizontal bands.',
        texture_and_material:
          'Smooth rendered masonry, slender steel window sections, plate glass curtain walls, tubular steel railings, flat roof parapets.',
        camera_and_composition:
          'Keep the requested view; oblique corner view showing two asymmetric wings, strong horizontals of windows and balconies.',
        atmosphere_and_mood: 'Rational, light and progressive, form following use.',
        rendering_and_quality:
          'Crisp architectural photograph with sharp edges and clean render, no decoration or pitched roofs.',
        key_features:
          'asymmetric white cubic wings; ribbon windows; glass curtain wall on steel mullions; flat roofs; thin cantilevered balconies',
      }),
      avoid: [...AVOID, 'decoration', 'pitched roof tiles', 'generic office block'],
      dropAvoid: ARCH_DROP,
      briefs: [
        'Bauhaus architecture seaside sanatorium on dunes: white cubic wings stepping down toward the sea, ribbon windows, thin balconies where adult patients rest in deck chairs under blankets, crisp noon shadows. No text or logo.',
        'Bauhaus architecture abbey brewery in a forest clearing: an asymmetric white brewhouse with a full-height glass curtain wall showing copper kettles inside, flat roof, a red door, pines around it. No text or logo.',
        'Bauhaus architecture stable for racehorses: long flat-roofed white wings with ribbon clerestory windows, tubular steel rails along a paddock, a groom leading a grey horse across the gravel. No text or logo.',
      ],
    },
    'SP07-026': {
      dna: arch({
        aesthetic:
          'Googie architecture: car-age roadside modernism with upswept cantilevered roofs, boomerang and parabolic forms, starbursts, angled glass walls and neon.',
        color_and_tone:
          'Turquoise, coral red, lemon and white with chrome and stone veneer; bright desert sky by day, neon pinks and blues at night.',
        lighting_and_shadow:
          'Hard desert sun with strong shadows under thin cantilevered roofs, or night neon tubes outlining the forms.',
        texture_and_material:
          'Thin folded-plate concrete or steel roofs, angled plate glass, flagstone and stone veneer walls, terrazzo, chrome and enamel panels, neon tubing.',
        camera_and_composition:
          'Keep the requested view; low angle under the upswept roof edge, the boomerang line crossing the frame diagonally.',
        atmosphere_and_mood: 'Buoyant, jet-age and playful, speed promised to passers-by.',
        rendering_and_quality:
          'Saturated period-colour photograph, crisp roof edges and neon glow, no readable signs.',
        key_features:
          'upswept cantilevered roof; boomerang and parabolic forms; starburst ornaments; angled plate glass; neon outlines',
      }),
      avoid: [...AVOID, 'readable sign text', 'car hero', 'gas station postcard'],
      dropAvoid: ARCH_DROP,
      briefs: [
        "Googie architecture wizard's roadside potion stand in a desert at night: a boomerang roof cantilevered over a glass kiosk, neon starbursts in pink and turquoise, bottles glowing on chrome shelves. No readable signs, text or logo.",
        'Googie architecture ice-rink pavilion in the desert at noon: a parabolic white concrete roof swooping up to a point over the glittering rink, an angled glass wall, stone veneer side walls, an adult skater mid-spin in hard shadow. No text or logo.',
        'Googie architecture bowling alley seen from the parking lot at dusk: a zigzag folded-plate roof, a giant starburst on a steel mast, coral and lemon panels, neon outlining every edge. No readable signs, text or logo.',
      ],
    },
    'SP07-027': {
      dna: arch({
        aesthetic:
          'Tudor Revival architecture: decorative half-timbering over stucco on upper storeys, steep cross gables, tall clustered brick chimneys and leaded diamond-pane casements.',
        color_and_tone:
          'Dark brown or black timbers against cream stucco, warm red handmade brick, grey-green slate or clay tile roofs, moss accents.',
        lighting_and_shadow:
          'Soft overcast or low warm light, shadows under jettied upper floors and deep eaves, windows glowing amber at dusk.',
        texture_and_material:
          'Stained timber boards in close studding and curved braces, textured stucco infill, clinker brick, carved bargeboards, leaded diamond glass.',
        camera_and_composition:
          'Keep the requested view; three-quarter view that shows several gables stepping, chimneys breaking the roofline.',
        atmosphere_and_mood: 'Storybook, settled and homely, with an old-English romance.',
        rendering_and_quality:
          'Detailed photograph with timber pattern clear and regular, no cottage postcard staging.',
        key_features:
          'decorative half-timbering over stucco; steep cross gables; clustered brick chimneys; leaded diamond-pane casements; jettied upper storey',
      }),
      avoid: [...AVOID, 'cottage postcard', 'glass curtain wall', 'fake plastic timber'],
      dropAvoid: ARCH_DROP,
      briefs: [
        'Tudor Revival architecture coaching inn in a snowstorm at night: half-timbered gables over a carriage arch, clustered chimneys smoking, leaded diamond windows glowing amber, a hooded rider arriving. No readable signs, text or logo.',
        "Tudor Revival architecture falconer's mews at the edge of a forest: a long jettied timber-and-stucco range with open hatches, hooded falcons on perches inside, an adult falconer in a leather gauntlet. No text or logo.",
        'Tudor Revival architecture watermill on a fast stream: steep cross gables with carved bargeboards, a jettied timber-and-stucco upper floor over a turning wooden wheel, spray and morning mist. No text or logo.',
      ],
    },
    'SP07-028': {
      dna: arch({
        aesthetic:
          'Sustainable green architecture: bioclimatic design where the building shades, ventilates and waters itself, with planted roofs and terraces, deep overhangs and exposed engineered timber.',
        color_and_tone:
          'Warm cross-laminated timber, rammed-earth ochres and greys, many greens from planting, dark photovoltaic glass; natural and mid-contrast.',
        lighting_and_shadow:
          'Daylight filtered through timber brise-soleil and foliage, dappled shade on terraces, deep overhangs keeping facades cool.',
        texture_and_material:
          'Cross-laminated timber and glulam frames, rammed-earth walls with visible strata, sedum and meadow roofs, integrated photovoltaic panels, rainwater cisterns and chains.',
        camera_and_composition:
          'Keep the requested view; show how planting and shading layers wrap the building, from ground to roof edge.',
        atmosphere_and_mood: 'Calm, hopeful and grounded, a building that belongs to its climate.',
        rendering_and_quality:
          'Natural-light architectural photograph, real plant variety rather than a generic green wall, no greenwashed corporate gloss.',
        key_features:
          'planted sedum and meadow roofs; timber brise-soleil; cross-laminated timber frame; rammed-earth strata walls; rain chains to cisterns',
      }),
      avoid: [
        ...AVOID,
        'generic plant wall',
        'greenwashed corporate facade',
        'smokestack industrial mood',
      ],
      dropAvoid: ARCH_DROP,
      briefs: [
        'Sustainable green architecture hillside wine cellar and tasting hall dug into terraced vines, rammed-earth walls with ochre strata, a meadow roof blending into the slope, timber louvres shading the glass. No text or logo.',
        "Sustainable green architecture pilgrims' hostel above a glacier valley: a cross-laminated timber frame under a photovoltaic canopy, rain chains feeding a stone cistern, a meadow roof full of alpine flowers, adult walkers with staffs arriving. No text or logo.",
        'Sustainable green architecture housing terrace on a river delta: stepped timber flats with sedum roofs and hanging planters, brise-soleil casting striped shade, flood channels planted with reeds and a heron standing in them. No text or logo.',
      ],
    },
    'SP07-029': {
      dna: arch({
        aesthetic:
          'Adobe and Pueblo architecture: thick load-bearing walls of sun-dried adobe brick finished in earth plaster, flat roofs on projecting log vigas, stepped setback storeys and rounded parapets.',
        color_and_tone:
          'Earth plaster in the local soil colour — tan, ochre, rose-brown — with weathered grey-silver timber, deep blue or turquoise-painted doors and window frames as the only colour.',
        lighting_and_shadow:
          'High dry sun with hard shadows from projecting vigas and canales across the walls; deep dark inside small window openings.',
        texture_and_material:
          'Hand-smoothed mud plaster with soft rounded corners, round peeled-log vigas and latilla poles, wooden canales draining the roof, beehive horno ovens, wooden ladders to upper terraces.',
        camera_and_composition:
          'Keep the requested view; show the stepped setbacks and viga shadow rhythm, walls thick at openings, sky a large clear field.',
        atmosphere_and_mood: 'Rooted, sun-baked and quiet, shelter shaped by hands and earth.',
        rendering_and_quality:
          'Clear daylight photograph with honest hand-worked plaster irregularity; no costumed figures, dreamcatchers or tourist-trade props.',
        key_features:
          'sun-dried adobe with earth plaster; projecting log vigas; stepped setback terraces with ladders; wooden canales; rounded soft parapets',
      }),
      avoid: [
        ...AVOID,
        'sharp machined edges',
        'log-cabin walls',
        'dreamcatchers and costume props',
      ],
      dropAvoid: ARCH_DROP,
      briefs: [
        'Adobe and Pueblo architecture terraced village at the moment of a summer thunderstorm: stepped earth-plastered blocks with wooden ladders between roofs, vigas throwing hard shadows, water beginning to pour from the canales, black clouds over the mesa. No text or logo.',
        'Adobe and Pueblo architecture mission-style infirmary courtyard: thick earth-plastered walls with rounded parapets, a portal of peeled vigas on carved corbels, a turquoise door, an adult healer grinding herbs in the shade. No text or logo.',
        'Adobe and Pueblo architecture bakehouse courtyard at first light: three beehive horno ovens smoking before a stepped earth-plastered block, an adult baker sliding loaves in with a long wooden paddle, viga shadows stretched across the plaster. No text or logo.',
      ],
    },
    'SP07-030': {
      dna: arch({
        aesthetic:
          'Constructivist architecture of the 1920s avant-garde: dynamic compositions of cylinders, prisms and slabs, cantilevers, glazed stair towers and exposed frames expressing function and movement.',
        color_and_tone:
          'Grey render and raw concrete, black steel, cream walls, with a restrained red accent on one element; stark mid-to-high contrast.',
        lighting_and_shadow:
          'Hard daylight carving each volume, glazed cylinders glowing at night, diagonal shadow cast by cantilevers.',
        texture_and_material:
          'Rendered brick and concrete frames, steel lattice masts, large industrial glazing in glazed stair cylinders, ribbon windows, open roof terraces.',
        camera_and_composition:
          'Keep the requested view; steep diagonal angles, volumes set against a big sky, one cantilever or mast cutting across the frame.',
        atmosphere_and_mood: 'Urgent, utopian and machine-like, architecture as a social engine.',
        rendering_and_quality:
          'Stark photograph with clear geometric volumes, no flags, slogans, propaganda posters or readable text.',
        key_features:
          'colliding cylinders and prisms; glazed stair cylinder; dramatic cantilevers; steel lattice mast; single red accent',
      }),
      avoid: [...AVOID, 'propaganda poster', 'flags', 'readable slogans', 'luxury retail gloss'],
      dropAvoid: ARCH_DROP,
      briefs: [
        "Constructivist architecture workers' club for miners at dusk: a cylindrical glazed stair tower glowing beside a cantilevered auditorium wedge, a steel lattice radio mast rising behind, snow on the flat roofs. Steep diagonal view. No text or logo.",
        'Constructivist architecture glider club on a steppe hilltop: a concrete prism hangar jutting over the slope on thin columns, ribbon windows, a single red steel launch gantry, a white glider lifting off into a huge sky. No text or logo.',
        'Constructivist architecture bakery factory seen from above: a circular production hall with a conveyor ring, a rectangular slab of offices cantilevered off one side, smoke from a single chimney. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'High-Tech Exposed Structure',
      domain: 'high-tech architecture',
      tags: ['high-tech', 'exposed-services', 'steel'],
      dna: arch({
        aesthetic:
          'High-tech architecture: the building turned inside out, with structure, ducts, lifts and stairs carried on the outside, tension rods, cast steel nodes and prefabricated panels on show.',
        color_and_tone:
          'Silver steel and white with colour-coded services — blue for air, green for water, yellow for electrics, red for circulation; clean and bright.',
        lighting_and_shadow:
          'Crisp daylight with a web of thin shadow from rods and trusses; lit glass lift cars and stair tubes at night.',
        texture_and_material:
          'Painted tubular steel trusses, cast steel joints, stainless tension cables, corrugated and glass panels, external ducts in gloss enamel.',
        camera_and_composition:
          'Keep the requested view; close enough to read the joints and colour-coded ducts, strong repetition of structural bays.',
        atmosphere_and_mood: 'Optimistic, engineered and transparent, a machine shown working.',
        rendering_and_quality:
          'Sharp architectural photograph with precise joints and clean enamel colours, no hidden services.',
        key_features:
          'external colour-coded ducts; tension rods and cast steel nodes; external glass lifts; tubular steel trusses; prefabricated panels',
      }),
      avoid: [...AVOID, 'hidden services', 'ornament', 'stone cladding'],
      briefs: [
        'High-tech exposed structure seed vault research station on a rock island: steel trusses, blue air ducts and red stair tubes all on the outside, a glass lift climbing the face at dusk, surf breaking below. No text or logo.',
        'High-tech exposed structure hospital for dragons: a tall hangar with tubular steel masts and tension cables holding up the roof, green water ducts snaking down the outside, a sleeping dragon visible through the glass end wall. No text or logo.',
        'High-tech exposed structure mountain cable-car station clinging to a cliff: cast steel nodes, yellow electrical conduits and a stainless cable wheel all exposed, cloud below, a red cabin arriving. No text or logo.',
      ],
    },
    {
      name: 'Postmodern Pastiche Facade',
      domain: 'postmodern architecture',
      tags: ['postmodern', 'pastiche', 'pastel'],
      dna: arch({
        aesthetic:
          'Postmodern architecture of the 1980s: classical elements used as oversized flat graphics — broken pediments, giant keystones, cut-out arches, stubby columns — on stucco boxes.',
        color_and_tone:
          'Salmon, pale teal, butter yellow, lilac and terracotta stripes with white, sometimes polished granite and mirrored glass; high-key and witty.',
        lighting_and_shadow:
          'Bright flat daylight that keeps colour fields strong, crisp cast shadows only where cut-outs pierce the facade.',
        texture_and_material:
          'Smooth painted stucco, polychrome banded tile, polished granite veneer, mirrored or tinted glass, exaggerated mouldings in painted foam or precast.',
        camera_and_composition:
          'Keep the requested view; frontal elevation, symmetry exaggerated then broken by one playful element, top of the building like a furniture crown.',
        atmosphere_and_mood: 'Ironic, colourful and theatrical, history quoted with a wink.',
        rendering_and_quality:
          'Bright crisp photograph with flat colour fields and sharp outlines, no weathering or readable signs.',
        key_features:
          'oversized broken pediment; giant flat keystone; cut-out arches; pastel stripe banding; stubby exaggerated columns',
      }),
      avoid: [...AVOID, 'correct classical proportions', 'raw concrete', 'readable signs'],
      briefs: [
        'Postmodern pastiche facade customs house on a border bridge, a salmon and teal striped stucco box crowned with a giant broken pediment, a cut-out arch through which the river is visible. No text or logo.',
        'Postmodern pastiche facade fire temple of a desert cult: stubby lilac columns holding an oversized keystone arch, butter yellow walls, a polished granite stair, a thin plume of smoke from the flat roof. No text or logo.',
        'Postmodern pastiche facade public swimming baths on a suburban corner at noon: a terracotta and white banded stucco front with a round cut-out window, a giant flat keystone over mirror-glass doors, an adult swimmer with a towel leaving. No readable signs, text or logo.',
      ],
    },
    {
      name: 'Streamline Moderne',
      domain: 'streamline moderne architecture',
      tags: ['streamline', 'moderne', 'nautical'],
      dna: arch({
        aesthetic:
          'Streamline Moderne architecture: horizontal speed lines, rounded corners and curved end walls, porthole windows, glass block and ship-like railings on smooth white render.',
        color_and_tone:
          'White or cream render with pale mint, sky blue or salmon trim, chrome and stainless steel; sunny, clean, high-key.',
        lighting_and_shadow:
          'Strong sun sliding around curved corners in a smooth gradient, thin shadow bands under horizontal fins.',
        texture_and_material:
          'Smooth render with triple speed-line grooves, glass block curved walls, tubular steel ship railings, porthole windows, stainless steel trim.',
        camera_and_composition:
          'Keep the requested view; three-quarter view on a rounded corner so horizontals sweep around it.',
        atmosphere_and_mood: 'Breezy, fast and sunny, a building dressed as an ocean liner.',
        rendering_and_quality:
          'Clean photograph with smooth curved gradients and crisp horizontals, no Art Deco zigzags or vertical crowns.',
        key_features:
          'rounded corners with horizontal speed lines; porthole windows; curved glass block walls; tubular ship railings; smooth white render',
      }),
      avoid: [...AVOID, 'zigzag ornament', 'vertical stepped crown', 'rough materials'],
      briefs: [
        "Streamline Moderne harbour master's office on a stone pier in a gale: a white rounded building with triple speed lines, porthole windows, a curved glass block stair, tubular railings streaming with spray. No text or logo.",
        'Streamline Moderne airship mooring terminal on a hilltop: a curved white terminal with mint speed-line trim and a rounded observation deck, a silver airship tethered to a mast above it. No text or logo.',
        'Streamline Moderne dairy at the edge of green pastures at dusk: long white horizontals with triple speed lines, a curved glass block corner glowing from inside, steel milk churns lined up on the loading ramp. No text or logo.',
      ],
    },
    {
      name: 'Sahelian Earthen Architecture',
      domain: 'Sahelian mud-brick architecture',
      tags: ['sahelian', 'mud-brick', 'vernacular'],
      dna: arch({
        aesthetic:
          'Sahelian earthen architecture of the Niger bend: sun-dried mud-brick walls rendered with mud plaster, tapering buttress pilasters rising into conical pinnacles, and toron palm-wood beams projecting from the walls.',
        color_and_tone:
          'Uniform earth colour of the local clay — warm grey-brown to ochre — with pale dry dust highlights and darker damp patches after replastering; sky and shadow give the contrast.',
        lighting_and_shadow:
          'Harsh vertical sun giving short sharp shadows from each toron beam and pilaster, deep dark doorways, soft dust haze at dawn or dusk.',
        texture_and_material:
          'Hand-smeared mud plaster with finger marks, rows of projecting palm-wood toron that serve as permanent scaffolding for annual replastering, sloping battered walls, flat roofs with ceramic drain pipes.',
        camera_and_composition:
          'Keep the requested view; frontal elevation showing the rhythm of pilasters and toron, walls filling the frame against a pale sky.',
        atmosphere_and_mood: 'Massive, communal and sun-hardened, a building renewed each year.',
        rendering_and_quality:
          'Documentary daylight photograph with true earth texture and toron shadow pattern, no invented symbols or costume staging.',
        key_features:
          'mud-plastered sun-dried brick; projecting toron palm beams; buttress pilasters with conical pinnacles; battered walls; ceramic roof drain spouts',
      }),
      avoid: [...AVOID, 'fired red brick', 'smooth cement render', 'tribal costume props'],
      briefs: [
        'Sahelian earthen architecture on replastering day: dozens of adult men climbing the toron beams of a great mud-brick mosque facade with baskets of wet mud, pinnacles rising above, dust hanging in the early light. Frontal view. No text or logo.',
        "Sahelian earthen architecture merchant's house in a riverside town: a two-storey mud-brick facade with pilaster rows, a carved wooden window screen, ceramic drain spouts, a narrow sandy lane in harsh noon shadow. No text or logo.",
        'Sahelian earthen architecture granary cluster at the edge of a millet field: small tapering mud-plastered towers with conical thatch lids, the rainy-season sky turning dark behind them. No text or logo.',
      ],
    },
    {
      name: 'Trullo Corbelled Stone',
      domain: 'Apulian trullo drystone architecture',
      tags: ['trullo', 'drystone', 'corbelled'],
      dna: arch({
        aesthetic:
          'Trullo architecture of Apulia: thick whitewashed drystone walls under conical roofs corbelled from overlapping grey limestone slabs, each cone topped with a carved pinnacle and one cone per room.',
        color_and_tone:
          'Brilliant lime white walls against weathered grey and lichen-yellow stone cones, red earth and olive green around; bright, clean contrast.',
        lighting_and_shadow:
          'Strong Mediterranean sun with sharp shadows on the stepped slab courses of each cone; cool dark interiors seen through small doors.',
        texture_and_material:
          'Dry-laid limestone chiancarelle slabs in concentric rings, rough lime-washed walls, small deep-set openings, stone steps and drystone field walls.',
        camera_and_composition:
          'Keep the requested view; show a cluster of cones of different heights, the ring coursing readable, whitewash against sky.',
        atmosphere_and_mood: 'Rustic, sunlit and whimsical in shape, built without mortar.',
        rendering_and_quality:
          'Clear daylight photograph with each slab ring legible and lime texture honest, no painted-on stone or fantasy exaggeration.',
        key_features:
          'corbelled limestone slab cones; whitewashed drystone walls; carved cone pinnacles; one cone per room; small deep-set doors',
      }),
      avoid: [...AVOID, 'mortared brick', 'thatched roof', 'fantasy mushroom houses'],
      briefs: [
        'Trullo corbelled stone cluster as a winter shepherd farm: five whitewashed cones of stacked grey slabs on a frosty hillside, sheep penned in a drystone enclosure, smoke from one chimney in pale morning sun. No text or logo.',
        "Trullo corbelled stone blacksmith's forge: a single fat cone with a soot-blackened doorway glowing orange, an adult smith hammering at an anvil just inside, olive trees and red earth around. No text or logo.",
        'Trullo corbelled stone harvest feast at night: a long table laid between a cluster of whitewashed cones, lamps strung from cone to cone, lichen-yellow slabs catching the warm light, adults passing bread and wine. No text or logo.',
      ],
    },
    {
      name: 'Tulou Rammed-Earth Ring',
      domain: 'Fujian tulou rammed-earth architecture',
      tags: ['tulou', 'rammed-earth', 'vernacular'],
      dna: arch({
        aesthetic:
          'Fujian tulou architecture: a massive circular or square rammed-earth outer wall several storeys high, windowless at the base, enclosing inward-facing timber galleries around an open courtyard.',
        color_and_tone:
          'Warm yellow-brown rammed earth, dark weathered fir galleries, grey fired roof tiles, red paper lanterns only where the prompt allows; earthy and warm.',
        lighting_and_shadow:
          'Daylight falling into the courtyard in a bright circle while galleries sit in shade; the outer wall catching low sun with rain-streak shadow.',
        texture_and_material:
          'Layered rammed-earth strata with formwork lines, small high slit windows, continuous timber galleries with plank railings on each storey, a wide overhanging grey tile roof ring.',
        camera_and_composition:
          'Keep the requested view; from inside show the full ring of galleries stacked in a curve, from outside show the fortress-like wall and its single gate.',
        atmosphere_and_mood: 'Defended, communal and enclosing, a village inside one wall.',
        rendering_and_quality:
          'Documentary photograph with readable earth layering and timber structure, no invented ornament or theme-park styling.',
        key_features:
          'rammed-earth ring wall with formwork layers; windowless base with high slit windows; stacked inward timber galleries; open central courtyard; overhanging grey tile roof ring',
      }),
      avoid: [...AVOID, 'brick facade', 'glass curtain wall', 'theme-park styling'],
      briefs: [
        'Tulou rammed-earth ring seen from inside at dawn: four storeys of dark timber galleries curving all the way round, an adult drying rice in the sunlit courtyard below, mist lying on the grey tile roof ring. Wide circular composition. No text or logo.',
        'Tulou rammed-earth ring as a mountain fortress in heavy rain: the windowless yellow-brown earth wall rising from terraced tea fields, water sheeting off the wide roof, the single arched gate shut. No text or logo.',
        'Tulou rammed-earth ring reimagined as a silk-weaving cooperative: a square rammed-earth enclosure whose stacked timber galleries hold a wooden loom at every door, skeins of dyed silk drying on poles across the courtyard, adult weavers at work. No text or logo.',
      ],
    },
    {
      name: 'Gassho Thatch Farmhouse',
      domain: 'Japanese gassho-zukuri farmhouse',
      tags: ['gassho-zukuri', 'thatch', 'vernacular'],
      dna: arch({
        aesthetic:
          'Gassho-zukuri farmhouse of the snowy Japanese mountains: a very steep A-frame roof of thick grass thatch, like hands pressed together, over a timber house with several attic floors inside the roof.',
        color_and_tone:
          'Golden-grey weathered thatch, smoke-darkened timber, white plaster and paper screens, snow white or paddy green around; warm lamplit windows against cold surroundings.',
        lighting_and_shadow:
          'Soft snow light or low autumn sun on the thatch slopes, deep shade under the thick eaves, warm glow from the hearth and paper windows.',
        texture_and_material:
          'Thick layered susuki grass thatch trimmed to a clean slope, rafters lashed with rope and straw cords instead of nails, soot-blackened beams from the irori hearth smoke, slatted attic floors.',
        camera_and_composition:
          'Keep the requested view; show the steep triangular gable facing the valley, roof far taller than the walls, several houses aligned the same way.',
        atmosphere_and_mood: 'Sheltering, communal and patient, a roof built to carry deep snow.',
        rendering_and_quality:
          'Photograph with clear thatch layering and rope-lashed joinery, no fantasy exaggeration or souvenir lanterns.',
        key_features:
          'steep A-frame grass thatch roof; rope-lashed rafters without nails; multi-storey attic in the roof; soot-darkened beams from the hearth; gables aligned to the valley',
      }),
      avoid: [...AVOID, 'tiled temple roof', 'souvenir lanterns', 'nailed modern framing'],
      briefs: [
        'Gassho thatch farmhouse village on a winter night: a dozen steep A-frame thatch roofs heavy with snow, all gables facing the same way down the valley, paper windows glowing warm, snow falling past the lamplight. No text or logo.',
        'Gassho thatch farmhouse on re-thatching day: dozens of adult villagers on ladders and ropes across one huge roof slope, bundles of golden grass passed hand to hand, the old grey thatch stripped on one side. No text or logo.',
        'Gassho thatch farmhouse attic interior: rope-lashed rafters rising into the peak, soot-blackened beams, slatted floors letting smoke from the hearth below drift up through shafts of light, silkworm trays stacked along the eaves. No text or logo.',
      ],
    },
  ],
};

export default spec;
