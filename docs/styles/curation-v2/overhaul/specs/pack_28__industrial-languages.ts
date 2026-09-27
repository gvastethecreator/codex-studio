import type { Spec } from '../tools/apply';
import { cr } from './_authors';

// Industrial form languages: each preset names the designer, era or school whose product form
// language it applies. The requested subject is rebuilt as a product in that language, keeping
// its function recognizable; cards stage original products, never real branded ones.
const T = ['industrial-design-language', 'form-language'];
const studio = 'Clean industrial design studio render with honest materials and precise seams.';

const spec: Spec = {
  pack: 'pack_28',
  category: '4. Industrial Form Languages',
  newCategory: { id: 'industrial-form-languages' },
  updates: {},
  creates: [
    cr('Dieter Rams - Braun Less But Better', 'industrial design language', [...T, 'dieter-rams'], {
      look: 'Dieter Rams Braun design language of the 1960s: less but better, rectilinear white and grey boxes, perforated grilles, a single colored accent control and quiet functional order.',
      subject:
        'rebuild the subject as a quiet rectilinear white-and-grey product with perforated grilles and one colored accent control.',
      color: 'Off-white, warm grey and one orange or green accent.',
      light: 'Soft even studio light.',
      texture: 'Matte plastic, brushed aluminum and perforations.',
      camera: 'Frontal orthographic product view.',
      mood: 'calm functional honesty',
      render: studio,
      key: 'Rams less but better; rectilinear; perforated grille; accent',
      avoid: ['the Braun logo', 'a real Braun product'],
      briefs: [
        'Standing on a plain grey plinth, a beehive has been rebuilt as a quiet rectilinear off-white appliance with a perforated entrance grille, a single orange dial and precise aluminum feet. No readable text or logo.',
        'On a clean desk, a bird feeder becomes a small grey box with a perforated seed grille and one green switch. The shadows are soft and even. No readable text or logo.',
        'A row of identical white speaker boxes stands on a shelf, each with a perfect circular grille. Only one has an orange knob. No readable text or logo.',
      ],
    }),
    cr(
      'Streamline Moderne - Thirties Aerodynamic Product',
      'industrial design language',
      [...T, 'streamline'],
      {
        look: 'Streamline Moderne product language of the 1930s by Raymond Loewy and Norman Bel Geddes: teardrop aerodynamic forms, chrome speed lines, rounded corners and optimistic machine-age motion.',
        subject:
          'rebuild the subject as a teardrop aerodynamic product with chrome speed lines and rounded corners.',
        color: 'Cream enamel, chrome and deep maroon.',
        light: 'Glossy studio light on chrome.',
        texture: 'Enamel, chrome and bakelite.',
        camera: 'Three-quarter side profile.',
        mood: 'optimistic machine-age speed',
        render: studio,
        key: 'Streamline teardrop; chrome speed lines; machine age',
        briefs: [
          'On a polished showroom floor, a humble garden wheelbarrow has become a teardrop-shaped cream enamel machine with chrome speed lines sweeping from nose to tail and a bakelite handle. No readable text or logo.',
          'A pencil sharpener shaped like a streamlined locomotive gleams on a desk. Its chrome fins catch the lamp light. No readable text or logo.',
          'A cream enamel toaster with three chrome speed lines waits on a kitchen counter at dawn. Its rounded body reflects the window. No readable text or logo.',
        ],
      },
    ),
    cr('Luigi Colani - Biodynamic Organic Form', 'industrial design language', [...T, 'colani'], {
      look: 'Luigi Colani biodynamic design language: flowing organic curves inspired by nature and aerodynamics, bulbous seamless shells, no straight lines and futuristic seventies plastic.',
      subject:
        'rebuild the subject as a flowing bulbous seamless organic shell with no straight lines.',
      color: 'Glossy white, orange and seventies ochre.',
      light: 'Soft wraparound studio light on curves.',
      texture: 'Glossy seamless fiberglass and plastic.',
      camera: 'Three-quarter flowing view.',
      mood: 'fluid futuristic organicism',
      render: studio,
      key: 'Colani biodynamic; bulbous curves; no straight lines',
      briefs: [
        'In a white studio, an ordinary office desk has been reshaped into a flowing bulbous glossy-orange shell with no straight lines, its drawers melting into organic curves. No readable text or logo.',
        'A bicycle becomes a seamless white fiberglass teardrop with a hidden rider pod. It looks ready to swim. No readable text or logo.',
        'A telephone flows like a seashell in glossy ochre plastic. The receiver curls into the body. No readable text or logo.',
      ],
    }),
    cr(
      'Space Age Seventies - Molded Plastic Pod Design',
      'industrial design language',
      [...T, 'space-age'],
      {
        look: 'Sixties and seventies space age product language: molded glossy plastic pods, round portholes, egg shapes, white with bold orange, avocado and chrome.',
        subject:
          'rebuild the subject as a glossy molded plastic pod with porthole windows and egg shapes.',
        color: 'White, bold orange, avocado and chrome.',
        light: 'Bright retro-future light.',
        texture: 'Glossy molded plastic and chrome.',
        camera: 'Frontal retro-future view.',
        mood: 'playful space-age optimism',
        render: studio,
        key: 'Space age pods; portholes; egg shapes; orange',
        briefs: [
          'In a white shag-carpeted room, a doghouse has been rebuilt as a glossy white egg-shaped plastic pod with an orange porthole door and a tiny chrome antenna. No readable text or logo.',
          'A radio becomes an orange plastic sphere with a round speaker porthole. It hangs from a chrome chain. No readable text or logo.',
          'An avocado-green plastic chair shaped like an egg holds a sleeping cat. The lamp above is a white bubble. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Y2K Translucent - Candy Plastic Tech',
      'industrial design language',
      [...T, 'y2k-translucent'],
      {
        look: 'Late nineties Y2K translucent product language: candy-colored see-through plastic shells revealing electronics, rounded bubbly forms and playful consumer tech.',
        subject:
          'rebuild the subject as a rounded bubbly product in candy translucent plastic showing its insides.',
        color: 'Translucent blueberry, tangerine, lime and grape.',
        light: 'Bright light glowing through plastic.',
        texture: 'Translucent colored plastic and visible circuits.',
        camera: 'Three-quarter product view on white.',
        mood: 'cheerful millennial optimism',
        render: studio,
        key: 'Y2K translucent; candy plastic; visible insides',
        avoid: ['a real iMac G3 or Apple logo'],
        briefs: [
          'On a white table, a toaster has been rebuilt as a bubbly tangerine translucent plastic shell showing glowing heating coils, circuit boards and a tiny fan inside. No readable text or logo.',
          'Hanging from a chrome chain in a white room, a radio has become a glossy orange plastic sphere with a round speaker porthole. No readable text or logo.',
          'A lime translucent alarm clock shows every gear and battery inside. It glows in a dark bedroom. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Teenage Engineering - Playful Precision Modular',
      'industrial design language',
      [...T, 'teenage-engineering'],
      {
        look: 'Teenage Engineering design language: small precise modular devices with grids of chunky buttons, bold single colors, exposed screws, aluminum casings and playful minimal icons.',
        subject:
          'rebuild the subject as a small precise modular device with chunky button grids and exposed screws.',
        color: 'Bold single colors on bare aluminum and grey.',
        light: 'Crisp product studio light.',
        texture: 'Anodized aluminum, rubber buttons and screws.',
        camera: 'Top-down precise product view.',
        mood: 'playful precise curiosity',
        render: studio,
        key: 'Teenage Engineering; button grid; exposed screws; bold color',
        avoid: ['real Teenage Engineering products or logo'],
        briefs: [
          'Seen from above on grey felt, a kitchen scale has become a small precise aluminum device with a grid of chunky orange rubber buttons, exposed hex screws and a tiny monochrome display of pictogram icons. No readable text or logo.',
          'A walkie-talkie becomes a flat bright-yellow slab with a knob grid and exposed screws. A lanyard hangs from its corner. No readable text or logo.',
          'On a dark bedroom nightstand, a lime translucent alarm clock shows every gear and battery inside. It glows softly at three in the morning. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Jony Ive Unibody - Seamless Aluminum Minimal',
      'industrial design language',
      [...T, 'unibody'],
      {
        look: 'Unibody minimalism of the 2000s and 2010s: seamless machined aluminum shells, continuous radii, no visible fasteners, glass and a single glowing indicator.',
        subject:
          'rebuild the subject as a seamless machined aluminum unibody with continuous radii and no fasteners.',
        color: 'Silver aluminum, space grey and white glass.',
        light: 'Soft gradient product light.',
        texture: 'Bead-blasted aluminum and glass.',
        camera: 'Hero three-quarter product shot.',
        mood: 'serene precise luxury',
        render: studio,
        key: 'Unibody aluminum; continuous radii; no fasteners',
        avoid: ['the Apple logo', 'a real iPhone or MacBook'],
        briefs: [
          'Against a soft gradient backdrop, a garden watering can has been rebuilt as a single seamless bead-blasted aluminum unibody with continuous radii, a glass window showing the water level and no visible fasteners. No readable text or logo.',
          'A hammer becomes a seamless space-grey aluminum tool with a glass strike face. A single white light glows in the handle. No readable text or logo.',
          'A birdhouse becomes a silver unibody with a round glass entrance. A sparrow lands on its smooth roof. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Faceted Low-Poly Industrial - Polygonal Stainless',
      'industrial design language',
      [...T, 'faceted'],
      {
        look: 'Faceted polygonal industrial language: flat planar stainless panels, sharp creases, low-poly angular geometry and brutal unpainted metal like a folded origami machine.',
        subject:
          'rebuild the subject from flat planar stainless panels with sharp creases and low-poly angles.',
        color: 'Raw stainless grey with black glass.',
        light: 'Hard directional light revealing facets.',
        texture: 'Brushed unpainted stainless steel.',
        camera: 'Low three-quarter angle.',
        mood: 'brutal angular confidence',
        render: studio,
        key: 'Faceted stainless; planar panels; sharp creases',
        avoid: ['a real Cybertruck'],
        briefs: [
          'On a concrete floor, a baby stroller has been rebuilt from flat planar stainless panels with sharp creases and black glass windows, its low-poly angles catching hard directional light. No readable text or logo.',
          'A coffee maker becomes a faceted stainless polyhedron with a triangular spout. Steam rises from a crease. No readable text or logo.',
          'Sitting in a garden, a dog kennel built from flat stainless panels shows sharp creases and an angular door propped open with a chewed bone. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Soft Blob Design - Twenty-Twenties Puffy Forms',
      'industrial design language',
      [...T, 'blob'],
      {
        look: 'Twenty-twenties soft blob design language: puffy inflated rounded forms, matte pastel colors, pillowy seams, soft-touch materials and friendly squishy objects.',
        subject:
          'rebuild the subject as a puffy inflated rounded object in matte pastel soft-touch material.',
        color: 'Matte pastel lilac, peach and mint.',
        light: 'Soft diffused light.',
        texture: 'Soft-touch matte, puffy seams.',
        camera: 'Close cozy product view.',
        mood: 'squishy friendly comfort',
        render: studio,
        key: 'Soft blob; puffy inflated; matte pastel',
        briefs: [
          'On a pastel floor, a fire extinguisher has been rebuilt as a puffy inflated matte peach object with pillowy seams and a soft rounded nozzle that looks squeezable. No readable text or logo.',
          'A bookshelf becomes a set of puffy mint cushions stacked like clouds. Books lean against the soft walls. No readable text or logo.',
          'A lilac puffy lamp glows like a soft pillow on a nightstand. A cat presses its paw into it. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Bauhaus Product - Geometric Primary Object',
      'industrial design language',
      [...T, 'bauhaus-product'],
      {
        look: 'Bauhaus product language of the 1920s: pure geometric volumes of circle, square and triangle, tubular steel, primary colors and form follows function.',
        subject:
          'rebuild the subject from pure geometric volumes, tubular steel and primary colors.',
        color: 'Primary red, yellow, blue with black and white.',
        light: 'Clear daylight studio.',
        texture: 'Tubular chrome, lacquered wood and glass.',
        camera: 'Frontal geometric view.',
        mood: 'clear rational purity',
        render: studio,
        key: 'Bauhaus geometry; tubular steel; primary colors',
        briefs: [
          'In a white studio, a baby cradle has been rebuilt from a yellow half-cylinder, a red square headboard and a blue triangle rocker on bent tubular chrome. No readable text or logo.',
          'A table lamp becomes a red sphere on a blue cylinder with a chrome arm. It lights a geometric desk. No readable text or logo.',
          'A kettle becomes a perfect black sphere with a yellow triangle handle. It sits on a square stove. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Brutalist Object - Raw Concrete Product',
      'industrial design language',
      [...T, 'brutalist-object'],
      {
        look: 'Brutalist product language: heavy raw cast concrete and rough metal objects, monolithic blocks, exposed aggregate, board-formed texture and unapologetic mass.',
        subject:
          'rebuild the subject as a heavy monolithic cast concrete object with board-formed texture.',
        color: 'Raw concrete grey and rusted steel.',
        light: 'Hard raking light on texture.',
        texture: 'Board-formed concrete and exposed aggregate.',
        camera: 'Low heavy monumental angle.',
        mood: 'heavy monumental calm',
        render: studio,
        key: 'Brutalist concrete; monolithic; board-formed',
        briefs: [
          'Under hard raking light, a desk lamp has been rebuilt as a heavy monolithic cast concrete block with board-formed texture, a rusted steel arm and a single stubborn bulb. No readable text or logo.',
          'A bird bath becomes a stacked concrete monolith in a garden. A sparrow bathes on its rough top. No readable text or logo.',
          'A radio becomes a concrete cube with a single steel knob. It sits heavily on a wooden table. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Soviet Industrial - Utilitarian Cold War Appliance',
      'industrial design language',
      [...T, 'soviet-industrial'],
      {
        look: 'Soviet industrial product language of the 1960s to 1980s: utilitarian stamped metal, bakelite knobs, chunky toggles, pale green and cream enamel and indestructible function.',
        subject:
          'rebuild the subject as a utilitarian stamped-metal appliance with bakelite knobs and enamel paint.',
        color: 'Pale institutional green, cream and bakelite brown.',
        light: 'Flat institutional light.',
        texture: 'Stamped steel, enamel and bakelite.',
        camera: 'Frontal documentary product view.',
        mood: 'stubborn utilitarian endurance',
        render: studio,
        key: 'Soviet industrial; stamped steel; bakelite; pale green',
        briefs: [
          'On an institutional table, an electric kettle has been rebuilt as a chunky pale-green stamped-metal appliance with bakelite knobs, a heavy toggle switch and a dial gauge. No readable text or logo.',
          'A vacuum cleaner becomes a cream enamel cylinder on runners with a chunky bakelite handle. It looks indestructible. No readable text or logo.',
          'A pale-green radio with a single enormous tuning knob sits on a lace doily. Its speaker grille is dented. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Military Ruggedized - Field Equipment Form',
      'industrial design language',
      [...T, 'ruggedized'],
      {
        look: 'Military ruggedized equipment language: rubber-armored corners, olive drab and tan cases, oversized latches, MIL-spec connectors and drop-proof bulk.',
        subject:
          'rebuild the subject as rugged field equipment with rubber-armored corners and oversized latches.',
        color: 'Olive drab, tan and black rubber.',
        light: 'Harsh field daylight.',
        texture: 'Textured polymer, rubber armor and latches.',
        camera: 'Three-quarter field kit view.',
        mood: 'tough dependable readiness',
        render: studio,
        key: 'Ruggedized; rubber armor; latches; olive drab',
        briefs: [
          'On a dusty field bench, a picnic basket has been rebuilt as an olive-drab ruggedized case with rubber-armored corners, oversized latches and a pressure valve. No readable text or logo.',
          'A hair dryer becomes a tan rugged field tool with a rubber-armored grip. It hangs from a strap. No readable text or logo.',
          'A rugged olive lunchbox with MIL-spec latches sits on a tank hull. A sandwich peeks out. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Kawaii Product - Japanese Cute Appliance',
      'industrial design language',
      [...T, 'kawaii-product'],
      {
        look: 'Japanese kawaii product language: rounded appliances with tiny faces, pastel colors, stubby limbs, soft corners and mascot personality.',
        subject:
          'rebuild the subject as a rounded pastel appliance with a tiny face and mascot personality.',
        color: 'Pastel pink, cream and baby blue.',
        light: 'Soft bright cheerful light.',
        texture: 'Smooth glossy plastic.',
        camera: 'Frontal cute product view.',
        mood: 'sweet cheerful charm',
        render: studio,
        key: 'Kawaii appliance; tiny face; pastel; mascot',
        avoid: ['Hello Kitty or licensed mascots'],
        briefs: [
          'On a pastel kitchen counter, a rice cooker has been rebuilt as a rounded pink appliance with a tiny sleepy face, stubby feet and a steam vent shaped like a little bow. No readable text or logo.',
          'A fire alarm becomes a round baby-blue cloud with a startled face. It hangs on a nursery ceiling. No readable text or logo.',
          'A cream stapler with a tiny smiling face sits on a desk, its jaw open like a laugh. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Scandinavian Craft - Warm Wood and Wool',
      'industrial design language',
      [...T, 'scandi-craft'],
      {
        look: 'Scandinavian craft product language: warm oiled oak and birch, felted wool, soft rounded edges, muted earth colors and honest joinery.',
        subject: 'rebuild the subject in warm oiled wood and felted wool with soft rounded edges.',
        color: 'Oak, birch, oat and muted sage.',
        light: 'Soft northern window light.',
        texture: 'Oiled wood grain and felted wool.',
        camera: 'Calm interior product view.',
        mood: 'warm calm hygge',
        render: studio,
        key: 'Scandinavian craft; oiled wood; felt; rounded',
        briefs: [
          'By a soft northern window, a desktop computer has been rebuilt in warm oiled oak with a felted oat-wool speaker cover, rounded birch keys and honest visible joinery. No readable text or logo.',
          'A telephone becomes a smooth birch pebble with a sage felt earpiece. It rests on a linen runner. No readable text or logo.',
          'A space heater becomes an oak cabinet with a wool grille. A dog sleeps in front of it. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Art Deco Machine Age - Chrome and Bakelite',
      'industrial design language',
      [...T, 'deco-product'],
      {
        look: 'Art Deco machine-age product language: stepped geometric forms, sunburst motifs, chrome bands, black bakelite and luxurious symmetrical glamour.',
        subject:
          'rebuild the subject with stepped symmetrical forms, sunburst motifs, chrome bands and black bakelite.',
        color: 'Black bakelite, chrome and gold.',
        light: 'Glamorous gallery spotlight.',
        texture: 'Bakelite, chrome and lacquer.',
        camera: 'Symmetrical frontal view.',
        mood: 'glamorous machine-age luxury',
        render: studio,
        key: 'Art Deco product; stepped forms; sunburst; chrome',
        briefs: [
          'Under a gallery spotlight, a microwave oven has been rebuilt as a symmetrical stepped black bakelite cabinet with a chrome sunburst door and gold-banded controls. No readable text or logo.',
          'A hair dryer becomes a chrome and bakelite rocket with stepped fins. It rests on a vanity mirror. No readable text or logo.',
          'A deco radio with a sunburst grille glows warmly on a lacquered sideboard. Its dial is gold. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Generative Parametric - Lattice Optimized Form',
      'industrial design language',
      [...T, 'parametric-product'],
      {
        look: 'Generative parametric product language: topology-optimized organic lattices, voronoi cells, 3D-printed titanium and nylon, bone-like struts and algorithmic efficiency.',
        subject:
          'rebuild the subject as a topology-optimized lattice form with bone-like struts and voronoi cells.',
        color: 'Titanium grey and white nylon.',
        light: 'Soft technical light.',
        texture: '3D-printed lattice and voronoi cells.',
        camera: 'Three-quarter technical view.',
        mood: 'algorithmic organic efficiency',
        render: studio,
        key: 'Parametric lattice; topology optimized; voronoi',
        briefs: [
          'On a lab bench, a dining chair has been rebuilt as a topology-optimized titanium lattice of bone-like struts and voronoi cells, printed in one piece. No readable text or logo.',
          'A bike helmet becomes a white nylon voronoi shell. Light pours through its cells onto a desk. No readable text or logo.',
          'A lattice-printed lamp casts a web of shadows across a white wall. Its base looks like coral. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Memphis Group Object - Postmodern Playful Product',
      'industrial design language',
      [...T, 'memphis-object'],
      {
        look: 'Memphis Group object language by Ettore Sottsass: playful postmodern products with clashing laminates, squiggle patterns, bold primary shapes and irreverent stacking.',
        subject:
          'rebuild the subject as a playful postmodern object of stacked bold shapes and clashing laminate patterns.',
        color: 'Clashing pink, yellow, teal and black squiggle patterns.',
        light: 'Bright flat studio light.',
        texture: 'Patterned laminates and lacquer.',
        camera: 'Frontal playful product view.',
        mood: 'irreverent postmodern fun',
        render: studio,
        key: 'Memphis object; laminates; squiggles; stacked shapes',
        briefs: [
          'In a bright studio, a filing cabinet has been rebuilt as a playful stack of a pink cylinder, a yellow squiggle-laminate cube and a teal triangle, its drawers pulling out of different shapes. No readable text or logo.',
          'A kettle becomes a teal cone with a black-and-white squiggle handle and a yellow ball lid. No readable text or logo.',
          'A table lamp stacks a pink sphere on a speckled laminate column. It leans at a jaunty angle. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Raygun Gothic - Retro-Future Appliance',
      'industrial design language',
      [...T, 'raygun-gothic'],
      {
        look: 'Raygun Gothic retro-future appliance language: pulp fifties science fiction shapes with fins, rings, antenna spires, polished chrome and atomic starbursts.',
        subject:
          'rebuild the subject as a retro-future appliance with fins, rings, antenna spires and chrome.',
        color: 'Polished chrome, atomic turquoise and red.',
        light: 'Glossy chrome highlights.',
        texture: 'Polished chrome and enamel.',
        camera: 'Low heroic product view.',
        mood: 'pulp futurist optimism',
        render: studio,
        key: 'Raygun Gothic; fins; rings; chrome spires',
        briefs: [
          'On a checkered kitchen floor, a vacuum cleaner has been rebuilt as a chrome rocket with tail fins, orbiting rings and an antenna spire, trailing an atomic-turquoise hose. No readable text or logo.',
          'A mailbox becomes a chrome ray gun on a post with a starburst flag. A dog barks at it. No readable text or logo.',
          'Hanging on a spotless clinic wall, a garden hose reel has become a white dispenser with a single soft blue button. A nurse walks past it. No readable text or logo.',
        ],
      },
    ),
    cr(
      'Medical Device Clean - Hygienic White Product',
      'industrial design language',
      [...T, 'medical-product'],
      {
        look: 'Medical device product language: hygienic white and pale blue shells, soft radii, touch-screen panels, antimicrobial surfaces and calm clinical trust.',
        subject:
          'rebuild the subject as a hygienic white and pale-blue medical device with soft radii.',
        color: 'Clinical white and pale blue.',
        light: 'Bright clean clinical light.',
        texture: 'Smooth antimicrobial plastic.',
        camera: 'Clean three-quarter product view.',
        mood: 'calm clinical trust',
        render: studio,
        key: 'Medical device; hygienic white; pale blue; soft radii',
        briefs: [
          'In a bright clean room, a barbecue grill has been rebuilt as a hygienic white medical-style device with pale-blue accents, soft radii, a touch panel and a sterile glass lid. No readable text or logo.',
          'A toy robot becomes a white medical assistant with soft blue lights. It waits beside a hospital bed. No readable text or logo.',
          'A garden hose reel becomes a white clinical dispenser with a soft blue button. It hangs on a clean wall. No readable text or logo.',
        ],
      },
    ),
  ],
};

export default spec;
