type BriefPack = { id: string };
type BriefPreset = { id: string; name: string; category?: string };

type PackBriefs = Record<string, readonly string[]>;

const PACK_BRIEFS: Record<string, PackBriefs> = {
  pack_07: {
    interior: [
      'A sunlit reading room with one low chair, a long window and clear wall geometry',
      'A compact kitchen with an island, open shelves and a side-lit work surface',
      'A calm bedroom with a low bed, folded textiles and a tall window',
      'A small dining room with a round table, four chairs and a broad doorway',
      'A narrow townhouse stair hall with a timber rail and daylight from above',
      'A quiet study with a writing desk, built-in shelves and a plain rug',
      'A loft living space with exposed beams, tall windows and a clear floor plan',
      'A tiled courtyard room opening through two broad arches to a garden',
      'A modest apartment entry with a bench, coat hooks and a bright side wall',
      'A greenhouse lounge with a glazed roof, planted edges and a central path',
      'A small bath with a stone basin, one high window and visible wall surfaces',
      'A cafe interior with a counter, a few tables and daylight across the floor',
      'A cabin room with a built-in bunk, timber walls and a view through one window',
      'A museum gallery with three framed works, a bench and clear circulation space',
      'A quiet sunroom with woven chairs, broad glazing and a single potted tree',
      'A small library alcove with reading tables, shelves and a central skylight',
    ],
    architecture: [
      'A compact concrete civic hall with deep window recesses and a broad stair',
      'A curved art-deco theater facade with a stepped crown and vertical windows',
      'A timber farmhouse with a pitched roof, porch and open field beyond',
      'A narrow Victorian row house with bay windows, painted trim and a front stoop',
      'A whitewashed coastal home with a shaded courtyard and flat roofline',
      'A brick warehouse facade with repeated arches, tall doors and a loading court',
      'A small stone chapel on a hillside, with a simple tower and surrounding trees',
      'A modern pavilion with a long roof plane, slender supports and open sides',
      'A stepped city apartment block with balconies and a tree-lined street',
      'A timber mountain lodge with a broad roof, deep eaves and rocky ground',
      'A row of colorful narrow houses on a sloped lane, each roof and doorway distinct',
      'A low desert courtyard house with thick walls, shaded openings and a flat horizon',
      'A riverside mill building with a water wheel, stone base and timber upper floor',
    ],
    civic: [
      'A quiet metro platform with a stopped train, columns and a clear exit stair',
      'A public library reading hall with a long central table and high windows',
      'A glass conservatory with a central aisle, planting beds and arched roof ribs',
      'A small railway station waiting room with benches, ticket windows and daylight',
      'A covered market arcade with empty stalls, tiled floor and a visible roof span',
      'A civic swimming hall with a long pool, repeating beams and pale reflected light',
      'A compact theater lobby with a stair, ticket counter and patterned floor',
      'A pedestrian bridge over a canal with railings, supports and both approaches visible',
      'A quiet casino gaming room with empty tables, low lighting and a clear ceiling grid',
    ],
    garden: [
      'A formal garden path framed by clipped hedges and a centered stone stair',
      'A small Japanese-inspired courtyard with stepping stones, moss and a maple canopy',
      'A broad lawn bordered by flowering beds and a simple timber pergola',
      'A terraced hillside garden with retaining walls, fruit trees and a winding path',
      'A quiet water garden with a narrow rill, flat stepping stones and reeds',
      'A shaded courtyard planted with ferns around a circular open patch of gravel',
      'A coastal garden terrace with low grasses, a reflecting pool and distant sea',
      'A productive kitchen garden with straight beds, trellis rows and a central aisle',
      'A woodland garden path crossing beneath mature trees and layered groundcover',
      'A symmetric parterre with clipped green borders, gravel paths and a clear axis',
    ],
    fantasy: [
      'An original stone sanctuary integrated into the roots of a broad ancient tree',
      'A fictional mountain citadel with tiered bridges, dark stone and a distant peak',
      'A moonlit observatory with a ribbed dome, narrow tower and open night sky',
      'A small fantasy bridge spanning a glowing stream between carved rock walls',
      'A high cliff monastery with stacked terraces, banners and a cloud-filled ravine',
      'An original underground hall with crystalline pillars and a shallow reflective floor',
      'A quiet forest gatehouse built from timber, slate and intertwined branches',
      'A stepped desert temple rising above wind-shaped stone terraces',
      'A fictional frost palace with translucent arches and a blue glacial courtyard',
      'A round hilltop keep with a low stone wall, narrow tower and open meadow',
      'A moss-covered forge hall with broad chimneys and a stream running beside it',
      'A Neo-Victorian glasshouse with copper ribs, a high roof and overgrown vines',
      'A small shrine on a rocky island, linked to shore by a narrow arched bridge',
    ],
    miniature: [
      'A hand-built paper model of a narrow street with tiny houses and visible folded edges',
      'A miniature timber railway station on a grassy base with a short track section',
      'A cut-paper courtyard model with layered walls, steps and a small central tree',
      'A tiny model greenhouse made from clear panels, wire ribs and planted rows',
      'A miniature stone bridge and stream assembled on a compact scenic base',
      'A handmade cardboard row house with a removable roof and visible paper seams',
      'A small architectural maquette of a hillside library with stacked terraces',
      'A whimsical sugar-cast archway with crisp edges and a few colored sugar details',
      'A wooden toy windmill on a painted field base, blades and tower fully visible',
      'A tiny market square model with stalls, paving and a central open space',
    ],
    impossible: [
      'A compact living pod suspended inside a circular frame above a cloud layer',
      'A long orbital habitat wrapped around a central open void, shown in three-quarter view',
      'A small house with an exterior stair that loops back into its own upper wall',
      'A vast interior where two staircases meet at different impossible angles',
      'A ring-shaped sky bridge crossing a deep canyon between distant towers',
      'A floating station built from repeating modules above a curved planet horizon',
      'A narrow corridor that bends upward into a vaulted ceiling without a visible end',
      'A spherical city shell with layered openings and tiny lights across its surface',
      'A stepped tower whose terraces fold inward around a central shaft',
    ],
  },
  pack_08: {
    contemporary: [
      'An adult model in a sculptural cream evening coat, full figure against a plain studio wall',
      'An adult model wearing a precise charcoal suit with a clean shoulder line and straight trousers',
      'An adult model in a relaxed linen outfit with a long overshirt and simple flat shoes',
      'An adult model wearing a bright athletic jacket and matching track trousers, full-body pose',
      'An adult model in a minimal black dress with a sharp collar and clear hemline',
      'An adult model wearing a soft blue work shirt, dark trousers and simple sneakers',
      'An adult model in a tailored red carpet gown with a clean silhouette and no jewelry focus',
      'An adult model wearing a practical olive uniform with visible pocket construction',
      'An adult model in a crisp sweater, straight jeans and plain low shoes, full figure',
    ],
    subculture: [
      'An adult model in layered black streetwear with an oversized jacket and blank cap',
      'An adult model wearing a soft floral dress, textured cardigan and plain boots',
      'An adult model in a dark tailored outfit with lace layers and simple silver accents',
      'An adult model in a worn leather jacket, plain tee and dark denim, standing pose',
      'An adult model wearing a loose flannel shirt, faded jeans and scuffed sneakers',
      'An adult model in a pastel layered outfit with pleats, ribbon details and a full skirt',
      'An adult model in a practical field jacket, cargo trousers and plain hiking boots',
      'An adult model wearing a long earth-tone coat over simple layered clothing',
      'An adult model in a sleeveless denim jacket, straight trousers and canvas shoes',
      'An adult model wearing a dark academic blazer, knit vest and plain trousers',
      'An adult model in a bright dance outfit with loose reflective panels and flat shoes',
      'An adult model wearing a modest rockabilly-inspired jacket, cuffed trousers and plain shoes',
      'An adult model in a layered hippie-inspired shirt and long skirt, neutral studio setting',
      'An adult model in a muted cottage-inspired dress with a high neckline and apron-like layer',
      'An adult model in utility streetwear with a short jacket, relaxed trousers and no logos',
    ],
    historical: [
      'An adult model in a 1950s-inspired fitted jacket and full skirt, plain studio backdrop',
      'An adult model wearing a Renaissance-inspired velvet tunic with a simple draped mantle',
      'An adult model in a formal Roman-inspired tunic and mantle, standing front three-quarter view',
      'An adult model wearing a pleated 1920s-inspired evening dress with a simple headband',
      'An adult model in a Victorian mourning coat with a high collar and plain dark skirt',
      'An adult model wearing an ancient Egyptian-inspired linen wrap with broad collar shapes',
      'An adult model in a layered seafaring outfit with a heavy wool cloak and leather belt',
      'An adult model wearing a practical frontier work jacket, broad trousers and plain boots',
      'An adult model in a 1970s-inspired satin shirt and flared trousers, full figure',
      'An adult model in a restrained ceremonial jacket with embroidered panels and a long sash',
      'An adult model wearing a pleated revolutionary-era coat and simple waistcoat',
    ],
    costume: [
      'An adult model in modular technical outerwear with detachable panels and visible fasteners',
      'An adult model in an original retro space suit with a rounded helmet tucked under one arm',
      'An adult model wearing an original streamlined protective suit with a smooth blank chest panel',
      'An adult model in a constructed brass-and-leather engineer outfit with practical closures',
      'An adult model in an original flowing fantasy robe with layered sleeves and a plain clasp',
      'An adult model wearing an original caped athletic costume with a blank emblem area',
      'An adult model in a practical mech-pilot jumpsuit with padded shoulders and utility seams',
      'An adult model in an original dark formal cloak with a high collar and restrained red lining',
      'An adult model wearing a weathered survival suit assembled from mismatched fabric panels',
      'An adult model in an original sea-inspired costume with layered fin-like fabric panels',
      'An adult model in an original nonhuman-inspired couture outfit with sculpted soft antenna forms',
      'An adult model wearing a neon-edged bodysuit with plain surfaces and no symbols',
      'An adult model in a translucent layered veil over a simple fitted outfit, silhouette visible',
      'An adult model wearing a reflective holographic coat over plain dark clothes',
      'An adult model in a shadow-like black layered outfit with a sharp readable silhouette',
      'An adult model in a padded field suit with broad straps and a simple utility belt',
      'An adult model wearing an original ceremonial fantasy jacket with layered shoulder pieces',
      'An adult model in a practical explorer suit with a close-fitting hood and visible seam lines',
      'An adult model in a sculpted lightweight armor suit with a blank unmarked chest plate',
    ],
    fabric: [
      'A glossy cobalt polymer sheet folded into broad ridges, with sharp reflected highlights',
      'A pair of dark denim panels showing seam stitching, faded creases and woven grain',
      'A close view of a soft fur-textured coat collar with individual fibers visible',
      'A small section of interlinked metal rings draped in a curved chainmail fold',
      'A thick knitted wool swatch with large loops and a rolled edge',
      'A length of silver satin falling into three deep fluid folds across a dark surface',
      'A brown tweed jacket sleeve showing flecks, cuff construction and woven fibers',
      'A square of sequined fabric catching small points of light across its surface',
      'A translucent plastic sheet folded over itself with crisp overlapping edges',
      'A folded velvet textile showing a directional pile that shifts from dark to bright',
      'A piece of fine lace fabric with open floral loops and visible thread structure',
      'A leather armor panel with stitched borders, shallow embossing and worn corners',
      'A fan of layered feathers arranged to show shafts, barbs and soft color transitions',
      'A rough burlap cloth folded into angular layers with coarse fibers and loose threads',
      'A sheet of origami paper forming a small geometric flower with clear creases',
      'A clear bubble-wrap panel compressed at one corner, with individual air cells visible',
      'A smoke-like fabric form twisting around an empty center against a plain background',
      'A translucent aqua textile ribbon curling into two broad water-like folds',
      'A red-orange fabric form with flame-shaped edges and visible cloth weave',
      'A small porcelain doll head and shoulder form with painted features and a plain backdrop',
      'A close detail of painted skin with a small ornamental ink motif, no recognizable figure',
      'A forearm-shaped display form with clean body paint bands and a plain background',
      'A folded bandage textile showing overlapping layers, frayed edges and soft shadows',
      'A dark paper panel with delicate gold leaf fragments along its torn edge',
      'A translucent gel-like sleeve form folded over itself with glossy highlights',
      'A small stone-like sculptural bust on a plain plinth, with a smooth weathered surface',
    ],
  },
  pack_09: {
    natural: [
      'A raw oak plank cross-section with open grain, small knots and a clean cut edge',
      'A polished mahogany board with long dark grain and a soft reflected highlight',
      'A curl of pale birch bark beside a strip of intact bark texture',
      'A close view of polished granite showing dark mineral grains and a clean edge',
      'A rough sandstone slab with layered pores and a broken corner',
      'A white marble surface with fine gray veins crossing a broad polished plane',
      'A split slate tile showing thin layers and a jagged outer edge',
      'A moss-covered rock surface with visible green growth between dark mineral ridges',
      'A handful of rounded river stones, each with a distinct wet surface and shape',
      'A sharp black obsidian fragment catching a narrow edge highlight',
      'A small tuft of gray wolf-like fur showing guard hairs and a soft undercoat',
      'A close surface study of green reptile scales with varied size and a subtle sheen',
      'A fan of blue-gray feathers showing central shafts and fine barbs',
      'A branching piece of coral with tiny cavities against a pale background',
      'A honeycomb wax surface with several crisp hexagonal cells and warm translucency',
      'A clear glacier ice slab with trapped bubbles and a cool blue edge',
      'A raw amethyst-like crystal cluster with sharp facets and a dark neutral base',
      'A dried sponge-like sea specimen with open pores and a sandy color palette',
      'A black volcanic rock fragment with small vesicles and rough edges',
      'A shallow layer of pale beach sand with fine ripples and a few dark grains',
      'A cooled lava rock surface with irregular ridges and deep porous shadows',
      'A delicate cobweb stretched between two rough twigs, fine threads catching light',
      'A pearly shell fragment with iridescent inner layers and a chipped edge',
    ],
    manmade: [
      'A brushed aluminum panel with directional grain, a folded seam and cool reflections',
      'A thin gold leaf sheet lifting from a dark flat surface, torn edge clearly visible',
      'A copper plate with a green patina bloom around its seams and corners',
      'A small forged carbon-fiber panel showing woven strands and resin highlights',
      'A raw concrete sample with aggregate flecks, pores and one clean sawn edge',
      'An aged brick surface with varied mortar joints and a chipped corner',
      'A wet asphalt patch reflecting a narrow strip of pale sky',
      'A molded plastic panel with shallow ribs, a clean parting seam and satin highlights',
      'A worn rubber tire tread section with deep grooves and fine surface cracks',
      'A shattered glass panel with separated triangular fragments on a plain surface',
      'A glossy latex sheet folded into two broad curves with bright edge reflections',
      'A corrugated cardboard cross-section with a torn paper edge and visible fluting',
      'A clear bubble-wrap sheet with varied round air cells, cropped as a tactile surface',
      'A small square of reflective sequined fabric showing individually attached discs',
      'A matte cork board section with varied pores and a straight cut edge',
      'A close strip of hook-and-loop fastener separated into its two textured sides',
      'A pool of liquid mercury-like metal forming rounded reflective beads on a dark plane',
      'A white polystyrene foam block with cut cells and one rough broken corner',
      'A plywood edge showing alternating veneers and a smooth sanded face',
      'An OSB board sample with long wood flakes pressed in visible layers',
      'A linoleum floor tile with a subtle marbled pattern and one visible cut edge',
      'A chain-link fence fragment with crisp wire intersections and soft shadow',
      'A small solar panel section with orderly dark cells and thin silver grid lines',
      'A single barbed-wire strand coiled once on a plain gray surface, sharp points visible',
    ],
    weathering: [
      'A rusty iron hinge plate with orange corrosion, dark pits and a worn screw hole',
      'A cracked porcelain surface with a few separated flakes and a pale background',
      'A painted wall panel where old color peels away in irregular curled layers',
      'A plaster corner marked by spreading water stains and mineral tide lines',
      'A damp wood board with small mold blooms and darkened grain in close view',
      'A charred timber strip with blackened ridges and warm brown grain between them',
      'A scratched metal sheet with intersecting abrasions and a soft overhead light',
      'A dusty tabletop with a clean wiped arc crossing the powdery surface',
      'A metal panel with thin oil stains and rainbow sheen pooled in shallow streaks',
      'A sandpaper sheet with coarse grit grains and one worn smooth patch',
      'A cracked mud surface with polygon plates and deep narrow seams',
      'A tar patch with a matte center, sticky ridges and a ragged boundary',
      'A weathered door panel with gray grain, worn paint and softened corners',
    ],
    tactile: [
      'A folded midnight velvet swatch showing directional pile and soft compressed ridges',
      'A thin layer of frost growing over a dark glass plane, crystalline edge detail visible',
      'A square of soft felt with cut fibers and a slightly uneven edge',
      'A dense synthetic-fur swatch with fibers combed in two opposing directions',
      'A piece of dry white chalk broken across a dusty slate surface with powder trails',
      'A fiberglass insulation tuft with fine strands and warm light along its cut edge',
      'A long-pile carpet sample with compressed tracks and a visible bound edge',
      'A short artificial-grass surface with bent blades and a clean cropped boundary',
    ],
    elemental: [
      'A glossy amber gel droplet stretched into a slow curved ribbon on a neutral plane',
      'A bright orange magma fissure glowing through a dark rough crust, tightly framed',
      'A single branching lightning arc crossing a deep blue-black cloud field',
      'A pale smoke plume coiling in open space with its edges softly lit',
      'A clear water splash frozen into separate arcs and beads against a dark field',
      'A compact violet energy glow surrounded by thin branching filaments',
      'An iridescent oil film spreading across a shallow puddle in flowing color bands',
      'A small cluster of bright sparks scattering from a single point on a dark field',
      'Several soap bubbles touching, with clear rims and soft rainbow reflections',
      'A cool dry-ice fog bank curling along a flat surface in shallow layers',
      'A few paper confetti shapes suspended midair against a plain background',
      'A powdery snow drift with wind-carved ridges and a crisp shaded edge',
    ],
  },
  pack_10: {
    geometric: [
      'A blue guitar and folded cloth reconstructed from broad angular color planes',
      'A balanced arrangement of red, blue and yellow rectangles with precise open gaps',
      'A diagonal stack of black and ochre bars with one circular counterweight',
      'A high-contrast optical field of curved black lines expanding from a small center',
      'A clean grid of primary color blocks divided by narrow black lines',
      'A fern-like branching shape repeated at smaller scales over a quiet dark field',
      'A low-poly mountain ridge made from distinct triangular faces and open sky',
      'Three simple white geometric forms balanced against a deep blue field',
      'A radial star pattern built from interlocking blue and cream polygons',
      'A branching Voronoi field of irregular colored cells with clear dark borders',
    ],
    organic: [
      'Cobalt and coral ink blooms spreading into translucent feathered edges on pale paper',
      'A dark ferrofluid mound with fine magnetic spikes radiating from one center',
      'A ribbon of pale smoke curling through a warm shaft of light against charcoal',
      'A single oil-slick ring spreading across water in green, violet and amber bands',
      'A large clear bubble with a thin iridescent rim against a deep gray field',
      'A branching mycelium network crossing a dark soil surface in fine pale lines',
      'Acrylic pigment pouring into layered ribbons across a small vertical canvas',
      'A reaction-diffusion pattern of coral cells expanding over a cool blue field',
      'Fine sand forming concentric vibration rings around one small center point',
      'A distant nebula-like cloud of violet and blue gas with a dark open center',
    ],
    glitch: [
      'A city tram image breaking into horizontal red and cyan motion bands',
      'A portrait-free landscape split into thin vertical strips shifted at varied heights',
      'A dark analog monitor with curved scan lines and a small misaligned color block',
      'A simple geometric image rendered as coarse black-and-white character-like marks',
      'A rainy street reflection breaking into large square compression blocks',
      'A clean white object with red and blue edge separation against a dark field',
      'A flatbed scan of folded fabric with stretched pixels and hard crop edges',
      'A halftone close-up of a bicycle wheel built from evenly spaced black dots',
      'A small lighthouse shape rendered with a restrained one-bit black-and-white palette',
      'A frame of an empty hallway with color channels slightly displaced at the edges',
    ],
    surreal: [
      'A pale stair emerging from a still lake and ending beneath a low cloud',
      'An empty corridor with a bright doorway at each end and no visible windows',
      'A quiet garden where a long shadow bends around a sunlit stone wall',
      'A still life of an open book whose pages continue as a narrow road',
      'A lone red chair balanced on a wide platform above a cloud layer',
      'A glass greenhouse reflected in itself across a shallow sheet of water',
      'A blue city street curving upward into a pale evening sky',
      'A small moon suspended inside a dim indoor swimming pool',
      'Two distant doors standing in a broad empty field with long shadows',
      'A staircase passing through a square opening in a low grassy hill',
      'A quiet train platform where the roof ribs gradually dissolve into branches',
      'A simple kitchen window looking out onto a miniature night sky',
      'A coastal road folded into a loop above dark water, with clear horizon lines',
      'An original biomechanical arch with ribbed forms and a clean empty passage',
      'A lush rooftop garden among compact city towers at warm late-afternoon light',
    ],
    pattern: [
      'A repeating paisley surface with curled teardrop motifs and a clear border rhythm',
      'A dark damask textile sample with broad floral scrolls and visible woven texture',
      'A compact houndstooth repeat across a folded black-and-cream cloth swatch',
      'A red and navy tartan fabric arranged in one broad diagonal fold',
      'A pale surface covered in evenly spaced dark polka dots of two sizes',
      'A broken camouflage repeat of leaf-like patches across a folded fabric panel',
      'A tie-dye cloth spiral with clear rings of indigo, coral and pale yellow',
      'A knitted textile close-up with a regular rib pattern and visible yarn loops',
      'A folded denim panel with a diagonal twill weave, seam and copper-free stitching',
      'A woven basket surface with alternating over-under bands and a cropped edge',
      'A repeating honeycomb motif stitched across a plain fabric field',
      'A blue-and-white geometric tile repeat with distinct grout lines and no lettering',
      'A cross-stitch sampler showing a small original leaf motif in a counted grid',
    ],
    texture: [
      'A terrazzo sample with scattered stone chips embedded in a pale polished matrix',
      'A marble slab with warm diagonal veins and a smooth reflective plane',
      'A close view of dark wood grain sweeping across a single finished board',
      'A carbon-fiber surface with fine diagonal weave and restrained edge highlights',
      'A pebbled leather panel with a curved stitched seam and soft side light',
      'A glitter surface showing dense points of reflected light over deep teal',
      'A rusted sheet with branching orange patina against a rough dark substrate',
      'A holographic foil swatch shifting from blue to magenta along folded ridges',
      'A small section of interlocked chainmail rings against a dark flat background',
      'A scaled reptile-skin surface pattern with varied raised plates and soft shadows',
      'A gold-repaired ceramic fragment with fine seams crossing a matte pale surface',
    ],
    diagram: [
      'An illustrative circuit-board layout with branching copper traces and blank component pads',
      'A stylized topographic contour map with several nested elevation lines and no labels',
      'A decorative square grid of black and white modules with no encoded or scannable content',
      'A simple building elevation drawing with crisp blue lines and blank annotation areas',
      'A chalk diagram of connected circles and arrows on a dark board, with no words',
    ],
    units: [
      'A small harbor scene built from many separate colored dots with visible open spacing',
      'A hillside landscape assembled from square ceramic tesserae with dark grout seams',
      'A single tree framed by colored glass panes with narrow leaded boundaries',
    ],
    finish: [
      'A branching abstract line motif formed from bright neon tubes on a dark field',
      'A small embossed silver foil star pressed into deep blue paper with crisp edges',
      'A short row of blind-pressed letters on textured paper, too abstract to read',
    ],
  },
  pack_11: {
    toys: [
      'A small fire lookout tower assembled from generic interlocking toy bricks, no markings',
      'An original large-headed vinyl collectible figure in plain clothes and simple shoes',
      'A hand-shaped clay frog with visible fingerprints and a plain painted base',
      'A low-poly paper fox assembled from folded cream and rust-colored facets',
      'A handmade crochet whale with visible yarn loops and small stitched fins',
      'A soft plush rabbit with simple button-free facial stitching and visible seams',
      'An original retro action figure in a blank jacket with articulated knees and elbows',
      'A small cluster of sculpted balloons twisted into a bright abstract flower form',
      'A handmade felt tabletop landscape with simple hills, clouds and stitched edges',
      'A carved wooden pull-toy horse on small wheels, grain and joints visible',
      'An illustrated sticker sheet of original fruit, stars and tiny garden tools, no words',
      'A simple clay character posed beside a miniature kitchen counter',
      'A small tin wind-up bird with visible key, painted wings and a plain background',
      'A shallow diorama box showing a tiny forest footbridge and layered paper trees',
      'A cloth doll with stitched button-like eyes, simple dress and visible handmade seams',
      'A small mosaic tile panel forming an original blue fish motif with distinct grout',
      'A stitched embroidery hoop showing a simple sun above two hills, thread texture clear',
      'A layered sand bottle landscape with colored strata and a clean cutaway side',
    ],
    medium: [
      'A white chalk drawing of a small sailing boat and waves on a dark board',
      'An original flash-style drawing of a red apple, a blue ribbon and bold black outlines',
      'A small landscape assembled from translucent colored glass pieces and dark leading',
      'A handmade felt tabletop weather scene with a sun, two clouds and stitched contours',
      'A close urban wall with layered aerosol color fields and soft overspray edges',
      'A compact cluster of glowing tube lines forming an abstract flower-like outline',
      'A bold silkscreen image of an original orange and blue bird against a flat field',
    ],
    aesthetic: [
      'An original round yellow face with a simple curved smile and two raised eyes on a pale field',
      'A tiny pixel-art bicycle beside a square tree under a limited blue sky',
      'A chrome-like horizon with a single red sun above a dark reflective plane',
      'A compact rooftop garden with solar lights and broad leaves against a city skyline',
      'A small diesel-era delivery truck parked beside a brick depot in muted tones',
      'A cottage path with foxgloves, a low stone wall and warm afternoon light',
      'A dark academic desk with stacked blank books, a brass lamp and window shadows',
      'An original brass instrument panel with gears and a round pressure dial without numbers',
      'An empty convenience-store aisle under pale fluorescent lights, viewed symmetrically',
      'A small gothic stone arch surrounded by dark ivy and one pale shaft of light',
      'A pastel tabletop with an original toy-like cloud, heart and star arrangement',
      'A lone armored silhouette crossing a dark ridge beneath a muted red sky',
      'A bright aqua fountain pool beside a curved white pavilion and clean blue sky',
      'A bold interior of mismatched geometric wall panels and a single low chair',
      'A liquid optical tunnel of concentric color rings around an open center',
      'A handful of holographic flakes scattered over a deep indigo surface',
      'A small original brass-and-leather field camera with gears visible and no lettering',
    ],
    food: [
      'A latte surface with a crisp fern pattern in crema, photographed from directly above',
      'A composed fine-dining plate with a single seared vegetable, sauce and open ceramic space',
      'A small cluster of colorful sugar candies on a pale surface with hard-edged shadows',
      'A neat sushi assortment with distinct rice, seaweed and fish textures on a plain plate',
      'A simple burger and crisp fries on a metal tray, layers clearly separated',
      'A coupe glass holding a citrus cocktail with clear ice and one curved peel',
      'A bakery window with three loaves and a folded cloth visible behind the glass',
      'A handful of fresh citrus and berries suspended in a compact splash of clear water',
      'A dark chocolate stream curling over a square piece of chocolate on a plain board',
      'A tidy bento meal with rice, greens and grilled vegetables separated into compartments',
      'A cut slice of cheese pizza with a long strand of melted cheese and crisp crust',
    ],
    micro: [
      'An illustrative electron-microscope-like view of layered mineral grains with no scale labels',
      'A close insect-eye surface with hundreds of small dark facets catching blue light',
      'A luminous cluster of illustrative cells with translucent membranes and open dark gaps',
      'A six-armed snowflake crystal isolated against a deep blue background',
      'A magnified circuit-board corner with fine traces, solder points and no readable labels',
      'A water droplet reflecting a tiny upside-down green garden against a plain field',
      'A woven fabric macro with crossing fibers, small lint strands and a shallow focus plane',
      'A rusty metal macro with layered orange flakes and dark pits in a narrow focus band',
      'A close human iris with radial amber fibers and a small catchlight, no face visible',
      'A clear soap bubble with a thin rainbow film and a soft dark reflection',
      'A single feather barb enlarged to show parallel filaments and branching structure',
      'A leaf underside showing fine branching veins and a softly lit green surface',
      'A close cheek-skin texture with visible pores, even light and no identifying face features',
      'A plume of dark ink unfurling into clear water with delicate branching edges',
      'A small patch of illustrative fungal threads and round spores on a dark field',
      'A cluster of clear crystals growing from a rough pale mineral base',
      'A vinyl record groove section catching narrow concentric reflections',
      'A close strip of hook-and-loop fabric showing tiny hooks beside soft loops',
      'A sea sponge macro with open pores and branching cavities against a muted blue field',
      'A close patch of moss with tiny leaves, dew points and dark gaps below',
      'A sandpaper grain surface with angular particles in a shallow band of light',
      'A cork macro showing irregular pores, thin fibers and a clean cut edge',
      'A carbon-fiber weave close-up with repeating dark strands and subtle silver highlights',
      'A dandelion seed head with several individual parachute filaments crisp against soft green',
    ],
    sensor: [
      'An illustrative x-ray-style image of a seashell showing inner chambers in pale translucent tones',
      'A single person-shaped thermal silhouette crossing a dark open walkway with warm and cool zones',
    ],
    technical: [
      'A clean illustrative blueprint drawing of a desk lamp in front, side and top views, with blank annotation areas',
    ],
  },
};

const SPECIAL_SUBJECTS: Record<string, readonly [RegExp, string][]> = {
  pack_07: [
    [
      /modern minimalist/i,
      'A spare living room with one low sofa, a pale wall and a single broad window',
    ],
    [
      /mediterranean villa/i,
      'A whitewashed villa courtyard with an arched loggia, olive tree and warm stone paving',
    ],
    [
      /brutalist architecture/i,
      'A compact concrete civic hall with deep window recesses and a broad stair',
    ],
    [
      /victorian painted lady/i,
      'A narrow Victorian row house with colorful painted trim, bay windows and a front stoop',
    ],
    [
      /metropolitan transit patina/i,
      'A quiet metro platform with a stopped train, worn columns and a clear exit stair',
    ],
    [
      /casino sensory grid/i,
      'An empty gaming room with a few tables, layered light panels and clear floor geometry',
    ],
    [
      /formal topiary axis/i,
      'A symmetrical parterre with clipped green borders, gravel paths and a centered stone stair',
    ],
    [
      /water-horizon hospitality/i,
      'A low garden terrace with an infinity pool, coastal grasses and distant sea',
    ],
    [
      /verdant elven sanctuary/i,
      'An original stone sanctuary integrated into old tree roots beside a narrow stream',
    ],
    [
      /neo-victorian steamwork/i,
      'A copper-ribbed glasshouse with a high roof, broad walkway and overgrown vines',
    ],
    [
      /papercraft diorama construction/i,
      'A hand-built paper model of a narrow street with tiny houses and visible folded edges',
    ],
    [
      /confectionery structural ornament/i,
      'A crisp sugar-cast arch with scalloped edges and a few colored sugar details',
    ],
    [
      /futuristic pod/i,
      'A compact living pod suspended inside a circular frame above a cloud layer',
    ],
    [
      /stellar shell megastructure/i,
      'A spherical orbital habitat with layered openings and tiny lights across its shell',
    ],
    [
      /industrial loft/i,
      'A converted warehouse loft interior with brick piers, steel windows and an open timber floor',
    ],
    [
      /mid-century modern/i,
      'A mid-century living room with a low walnut sideboard, tapered chair and broad picture window',
    ],
    [
      /scandinavian hygge/i,
      'A warm Scandinavian sitting room with a wool throw, pale timber table and soft window light',
    ],
    [
      /bohemian eclectic/i,
      'A layered living room with mixed woven textiles, mismatched chairs and clustered plants',
    ],
    [
      /japanese zen/i,
      'A quiet Japanese-inspired interior with a low table, shoji-like screens and a clear floor plane',
    ],
    [
      /luxury penthouse/i,
      'A high-rise penthouse living room with a broad window wall and a distant city skyline',
    ],
    [
      /rustic cabin/i,
      'A compact timber cabin interior with a stone hearth, rough beams and one deep window',
    ],
    [
      /cyberpunk apartment/i,
      'A compact city apartment with saturated window light, dark panels and a tightly planned kitchenette',
    ],
    [
      /victorian mansion/i,
      'A richly trimmed Victorian parlor with a curved stair, tall windows and patterned floor',
    ],
    [
      /bauhaus interior/i,
      'A crisp interior with tubular chairs, a square table and a red, blue and cream wall composition',
    ],
    [
      /maximalist decor/i,
      'A colorful sitting room layered with framed art, patterned cushions and mismatched furniture',
    ],
    [
      /farmhouse chic/i,
      'A bright farmhouse dining room with a long timber table, simple chairs and exposed ceiling beams',
    ],
    [
      /art nouveau interior/i,
      'A curved art-nouveau room with botanical ironwork, flowing wall trim and a tall arched window',
    ],
    [
      /memphis design/i,
      'A playful room with bold geometric furniture, striped surfaces and contrasting color blocks',
    ],
    [
      /^art deco$/i,
      'A stepped art-deco theater facade with a sunburst crown, vertical windows and polished stone',
    ],
    [
      /gothic revival/i,
      'A dark stone church facade with pointed arches, narrow tracery windows and a steep roof',
    ],
    [
      /deconstructivism/i,
      'An angular civic building made from interlocking tilted volumes and sharp roof planes',
    ],
    [
      /neoclassical/i,
      'A restrained neoclassical library facade with a broad colonnade, central stair and balanced wings',
    ],
    [
      /parametric architecture/i,
      'A flowing public pavilion with a ribbed curved facade and a continuous roof edge',
    ],
    [
      /bauhaus architecture/i,
      'A rectilinear Bauhaus school facade with white planes, ribbon windows and a simple entry stair',
    ],
    [
      /googie architecture/i,
      'A roadside diner with a sweeping boomerang roof, angled supports and broad glazing',
    ],
    [
      /tudor revival/i,
      'A Tudor-style cottage with dark timber framing, light infill panels and a steep roof',
    ],
    [
      /sustainable green/i,
      'A compact civic building with planted terraces, deep shade and visible rainwater channels',
    ],
    [
      /adobe\/?pueblo/i,
      'A stepped earthen residence with rounded corners, roof ladders and deep-set windows',
    ],
    [
      /soviet constructivist/i,
      'A red-brick civic block with an assertive stair tower and long horizontal window bands',
    ],
    [
      /orbital utility habitat/i,
      'A practical orbital habitat module with repeated pressure-ring corridors and a small docking arm',
    ],
    [
      /conservatory bioclimate/i,
      'A glass conservatory with a central aisle, planting beds and arched roof ribs',
    ],
    [
      /institutional ruin patina/i,
      'A deserted institutional hall with worn stone stairs, broken skylights and a long central aisle',
    ],
    [
      /bibliographic classicism/i,
      'A classical library reading hall with tall book stacks, a long table and a vaulted ceiling',
    ],
    [
      /immersive aquarium optics/i,
      'A curved aquarium gallery with one broad blue viewing tank and a dark public walkway',
    ],
    [
      /ossuary subterranean/i,
      'A small underground memorial hall with stacked niches, a central aisle and low stone vaults',
    ],
    [
      /data center grid/i,
      'A data center aisle with parallel server racks, overhead cable trays and a clear vanishing point',
    ],
    [
      /arboreal craft shelter/i,
      'A small timber shelter wrapped around a living trunk, with a raised path through its branches',
    ],
    [
      /cottage bloom layering/i,
      'A cottage garden path bordered by mixed flowers, soft grasses and low stone edging',
    ],
    [
      /karesansui dry abstraction/i,
      'A dry rock garden with raked gravel arcs, three stones and a quiet boundary wall',
    ],
    [
      /postindustrial ecological promenade/i,
      'A reclaimed factory walkway bordered by wetland planting and weathered brick walls',
    ],
    [
      /xeriscape climate grammar/i,
      'A drought-tolerant courtyard with gravel bands, succulents and sculptural shade screens',
    ],
    [
      /topiary wayfinding trap/i,
      'A clipped hedge maze with two branching paths and a visible central clearing',
    ],
    [
      /elevated biophilic terrace/i,
      'A planted roof terrace with layered grasses, raised paths and a compact city skyline',
    ],
    [
      /tournament turf strategy/i,
      'A carefully striped game lawn with a clear approach path, bunkers and low boundary trees',
    ],
    [
      /botanical iron glasshouse/i,
      'A botanical glasshouse with a narrow iron frame, climbing plants and a long central aisle',
    ],
    [
      /dwarven megalithic forge/i,
      'An original underground forge hall with massive stone piers, a broad furnace and a deep central aisle',
    ],
    [
      /suspended fortress sublime/i,
      'A fictional fortress suspended between two cliff faces by a sequence of narrow bridges',
    ],
    [
      /techno-brutalist compression/i,
      'A fictional compact tower combining heavy concrete volumes and tightly nested metal bridges',
    ],
    [
      /confectionery surrealism/i,
      'An original candy-colored pavilion with curled roof edges, striped columns and a clear open plaza',
    ],
    [
      /abyssal deco pressure/i,
      'A deep-sea art-deco hall with tiered arches, dark blue walls and a glowing central window',
    ],
    [
      /prismatic mineral megastructure/i,
      'A large faceted mineral hall with translucent columns and a clearly visible central passage',
    ],
    [
      /bermed round-door pastoral/i,
      'A low earthen hillside home with a round timber door, grass roof and stone path',
    ],
    [
      /haunted toon deformation/i,
      'A crooked storybook house with a bent tower, uneven roof and a broad empty doorway',
    ],
    [
      /cryomorphic palace geometry/i,
      'A palace of clear ice arches and stepped frozen terraces beneath a pale winter sky',
    ],
    [
      /canopy rope vernacular/i,
      'A high tree-canopy settlement linked by rope bridges and small timber platforms',
    ],
    [
      /sepulchral civic monumentalism/i,
      'A monumental stone memorial with a long colonnade, deep shadow and a quiet forecourt',
    ],
    [
      /aerostatic cloud retrofuture/i,
      'A retrofuturist sky terminal with a mooring mast and small airships above the clouds',
    ],
    [
      /studded abs brick system/i,
      'A small original brick-built observatory with a round roof, tiny windows and visible block joints',
    ],
    [
      /wet-sand ephemeral modeling/i,
      'A hand-shaped wet-sand miniature fort with crisp ridges, a moat and scattered grains',
    ],
    [
      /corrugated cardboard improvisation/i,
      'A small improvised cardboard workshop model with a pitched roof and exposed corrugated edges',
    ],
    [
      /pressurized vinyl playform/i,
      'A bright inflatable play structure with rounded chambers, seams and a clear open entrance',
    ],
    [
      /fungal vernacular miniature/i,
      'A tiny woodland dwelling formed from mushroom-like caps, moss and a narrow winding path',
    ],
    [
      /bottle-glass curio miniature/i,
      'A miniature greenhouse built from colored glass fragments and thin metal ribs',
    ],
    [
      /subterranean bio-cutaway/i,
      'A cutaway miniature showing an underground habitat, root layers and connected chambers',
    ],
    [
      /toy-scale sectional cutaway/i,
      'A toy-scale house model with one wall removed to reveal stacked rooms and stair connections',
    ],
    [
      /impossible circulation optical paradox/i,
      'A compact architectural space with stairs meeting at impossible angles around a central void',
    ],
    [
      /orbital ribbon habitat/i,
      'A long orbital habitat wrapped as a continuous ribbon around a bright open center',
    ],
    [
      /cybernetic hive infrastructure/i,
      'A vast branching infrastructure chamber with repeated metallic cells and narrow access bridges',
    ],
    [
      /absolute black monolith/i,
      'A single black monolith rising from a broad empty plane under a narrow strip of light',
    ],
    [
      /dimensional retrotech surfaces/i,
      'A retrofuturist room of layered chrome panels, curved trim and a simple central doorway',
    ],
  ],
  pack_08: [
    [
      /haute couture/i,
      'An adult model in a sculptural cream evening coat, full figure against a plain studio wall',
    ],
    [
      /streetwear hypebeast/i,
      'An adult model in layered black streetwear with an oversized jacket and blank cap',
    ],
    [
      /technical modular outerwear/i,
      'An adult model in modular technical outerwear with detachable panels and visible fasteners',
    ],
    [
      /steampunk engineering attire/i,
      'An adult model wearing a brass-and-leather engineer outfit with practical closures and no insignia',
    ],
    [
      /cybernetic implant/i,
      'An adult model in a plain technical jacket with one small decorative metal temple attachment',
    ],
    [
      /ethereal fantasy/i,
      'An adult model in flowing pale layers with translucent sleeves and a quiet studio backdrop',
    ],
    [
      /convention craft costume/i,
      'An adult model in an original hand-assembled foam costume with blank panels and no character marks',
    ],
    [
      /space suit \(retro\)/i,
      'An adult model in an original retro space suit with a rounded helmet tucked under one arm',
    ],
    [
      /vintage 1950s/i,
      'An adult model in a 1950s-inspired fitted jacket and full skirt, plain studio backdrop',
    ],
    [
      /lolita fashion/i,
      'An adult model in a modest pastel layered outfit with pleats, ribbon details and a full skirt',
    ],
    [
      /roman ceremonial regalia/i,
      'An adult model in a formal Roman-inspired tunic and mantle, front three-quarter view',
    ],
    [
      /post-apocalyptic scavenger/i,
      'An adult model in a weathered layered survival outfit made from mismatched fabric panels',
    ],
    [
      /space opera royal/i,
      'An adult model in an original ceremonial long coat with layered shoulders and a plain mantle',
    ],
    [
      /wizard robes/i,
      'An adult model in a layered midnight-blue robe with a high collar and simple clasp',
    ],
    [
      /superhero spandex/i,
      'An adult model in an original caped athletic costume with a blank chest panel and no symbols',
    ],
    [
      /mech pilot suit/i,
      'An adult model in a padded pilot jumpsuit with shoulder harness and visible seam construction',
    ],
    [
      /vampire lord/i,
      'An adult model in a dark formal coat with a high collar and restrained red lining',
    ],
    [
      /zombie survivor/i,
      'An adult model in a worn survival jacket with repaired seams and layered fabric panels',
    ],
    [
      /pelagic tail couture/i,
      'An adult model in an original sea-inspired gown with layered fin-shaped fabric panels',
    ],
    [
      /alien fashion/i,
      'An adult model in original nonhuman-inspired couture with sculpted soft antenna-like forms',
    ],
    [
      /neon light suit/i,
      'An adult model in a dark fitted suit edged with restrained neon lines and no symbols',
    ],
    [
      /refractive concealment veil/i,
      'An adult model wearing a translucent prism-like veil over a simple fitted outfit, silhouette visible',
    ],
    [
      /hologram/i,
      'An adult model rendered as a translucent blue holographic silhouette in plain clothes',
    ],
    [
      /high-gloss polymer/i,
      'A glossy cobalt polymer sheet folded into broad ridges, with sharp reflected highlights',
    ],
    [
      /shadow form/i,
      'An original dark human-like silhouette with a clear outline against a softly lit blank backdrop',
    ],
    [
      /burlap\/?rags/i,
      'A rough burlap cloth folded into angular layers with coarse fibers and loose threads',
    ],
  ],
  pack_09: [
    [
      /oak wood \(raw\)/i,
      'A raw oak plank cross-section with open grain, small knots and a clean cut edge',
    ],
    [
      /snake scales/i,
      'A close surface study of green reptile scales with varied size and a subtle sheen',
    ],
    [
      /brushed aluminum/i,
      'A brushed aluminum panel with directional grain, a folded seam and cool reflections',
    ],
    [
      /rusty iron/i,
      'A rusty iron hinge plate with orange corrosion, dark pits and a worn screw hole',
    ],
    [
      /velvet fabric/i,
      'A folded midnight velvet swatch showing directional pile and soft compressed ridges',
    ],
    [/water damage/i, 'A plaster corner marked by spreading water stains and mineral tide lines'],
    [
      /bubble wrap/i,
      'A clear bubble-wrap sheet with varied round air cells, cropped as a tactile surface',
    ],
    [
      /slime\/?goo/i,
      'A glossy amber gel droplet stretched into a slow curved ribbon on a neutral plane',
    ],
    [
      /chalk \(dry\)/i,
      'A piece of dry white chalk broken across a dusty slate surface with powder trails',
    ],
    [
      /oil on water/i,
      'An iridescent oil film spreading across a shallow puddle in flowing color bands',
    ],
    [
      /fire & magma/i,
      'A bright orange magma fissure glowing through a dark rough crust, tightly framed',
    ],
    [
      /electricity|lightning/i,
      'A single branching lightning arc crossing a deep blue-black cloud field',
    ],
    [/smoke\/?fog/i, 'A pale smoke plume coiling in open space with its edges softly lit'],
    [
      /water splash/i,
      'A clear water splash frozen into separate arcs and beads against a dark field',
    ],
    [/plasma\/?energy/i, 'A compact violet energy glow surrounded by thin branching filaments'],
    [/sparks/i, 'A small cluster of bright sparks scattering from a single point on a dark field'],
    [
      /soap bubbles/i,
      'Several soap bubbles touching, with clear rims and soft rainbow reflections',
    ],
    [/dry ice fog/i, 'A cool dry-ice fog bank curling along a flat surface in shallow layers'],
    [/confetti/i, 'A few paper confetti shapes suspended midair against a plain background'],
    [/snow \(powder\)/i, 'A powdery snow drift with wind-carved ridges and a crisp shaded edge'],
  ],
  pack_10: [
    [/cubism/i, 'A blue guitar and folded cloth reconstructed from broad angular color planes'],
    [
      /bauhaus style/i,
      'A balanced arrangement of primary-color circles, bars and squares with precise open gaps',
    ],
    [
      /constructivism/i,
      'A diagonal stack of red and black planes with a cream circle and strong upward rhythm',
    ],
    [
      /op art/i,
      'A high-contrast field of curved black lines expanding from a small off-center point',
    ],
    [/mondrian/i, 'A clean grid of primary-color rectangles divided by narrow black lines'],
    [
      /fractal geometry/i,
      'A fern-like branching shape repeated at smaller scales over a quiet dark field',
    ],
    [
      /low poly abstract/i,
      'A compact mountain form built from distinct triangular facets and open sky',
    ],
    [
      /suprematism/i,
      'Three simple geometric forms balanced across a wide cream field with ample negative space',
    ],
    [/islamic geometric/i, 'A radial star pattern built from interlocking blue and cream polygons'],
    [/voronoi pattern/i, 'A branching field of irregular colored cells with crisp dark borders'],
    [
      /alcohol ink/i,
      'Cobalt and coral ink blooms spreading into translucent feathered edges on pale paper',
    ],
    [
      /smoke photography/i,
      'A pale smoke plume curling across dark open space with a softly lit edge',
    ],
    [
      /oil slick/i,
      'An iridescent oil film spreading across a shallow puddle in flowing color bands',
    ],
    [/macro bubble/i, 'One large clear bubble with a thin rainbow film and a dark reflected edge'],
    [
      /mycelium network/i,
      'A branching mycelium network crossing a dark substrate in fine pale lines',
    ],
    [/ferrofluid/i, 'A dark ferrofluid mound with fine magnetic spikes radiating from one center'],
    [
      /acrylic pour/i,
      'A close abstract pour of coral, cream and blue pigment flowing into layered ribbons',
    ],
    [
      /reaction diffusion/i,
      'A field of coral cells expanding into branching blue gaps across a flat plane',
    ],
    [
      /cymatics/i,
      'Fine pale grains forming concentric vibration rings around one small center point',
    ],
    [
      /nebula cloud/i,
      'A distant violet and blue nebula cloud with luminous edges and a dark open center',
    ],
    [/datamosh/i, 'A city tram image breaking into horizontal red and cyan motion bands'],
    [/jpeg artifacts/i, 'A rainy street reflection breaking into large square compression blocks'],
    [
      /surrealism \(dali\)/i,
      'A quiet room where the horizon line bends gently upward across a bare floor',
    ],
    [/vaporwave/i, 'A pink sun above a blue grid walkway with empty columns and a wide open sky'],
    [
      /liminal space/i,
      'An empty office corridor with repeating doors, pale ceiling lights and no visible people',
    ],
    [
      /psychedelic art/i,
      'A butterfly-shaped color field with concentric bands radiating across a dark background',
    ],
    [/dreamcore/i, 'An empty bedroom with one doorway opening into a soft cloud-filled blue sky'],
    [
      /magical realism/i,
      'A quiet kitchen where a small rain cloud hangs above a sunlit wooden table',
    ],
    [
      /double exposure/i,
      'An adult silhouette filled with a layered forest canopy and pale evening sky',
    ],
    [/escher style/i, 'A stone stair that loops into itself around a small central courtyard'],
    [
      /biomechanical \(giger\)/i,
      'An original ribbed archway with smooth organic supports and a clear empty passage',
    ],
    [
      /collage surrealism/i,
      'A cut-paper sailboat floating across layered blue hills and torn cream paper shapes',
    ],
    [
      /metaphysical art/i,
      'A single red chair casting a long precise shadow across an otherwise empty plaza',
    ],
    [
      /lowbrow \(pop surrealism\)/i,
      'An original playful raccoon-shaped toy beneath oversized yellow flowers',
    ],
    [
      /dark fantasy/i,
      'An original dark stone gate standing between bare trees beneath a low clouded sky',
    ],
    [
      /solarpunk/i,
      'A green rooftop terrace with solar canopies, raised beds and a bright city beyond',
    ],
    [
      /weirdcore/i,
      'An empty playground with ordinary objects slightly out of scale beneath a pale sky',
    ],
    [/pixel sorting/i, 'A red bicycle silhouette stretched into orderly horizontal color strips'],
    [
      /vhs glitch/i,
      'A blurred empty street frame with horizontal tape-tracking bands and a shifted color edge',
    ],
    [
      /crt monitor/i,
      'A dark CRT monitor showing a simple colored square beneath curved scan lines',
    ],
    [
      /ascii art/i,
      'A small owl silhouette assembled from monochrome character-like marks, with no readable words',
    ],
    [
      /scanography/i,
      'A single fern frond pressed flat on a scanner bed with its veins sharply visible',
    ],
    [
      /halftone pattern/i,
      'A close-up bicycle wheel rendered with evenly spaced halftone dots against a pale field',
    ],
    [
      /dithering \(1-bit\)/i,
      'A small lighthouse silhouette rendered in coarse black-and-white dither dots',
    ],
    [
      /chromatic aberration/i,
      'A white geometric ring with red and cyan edges shifted in opposite directions',
    ],
    [
      /paisley pattern/i,
      'A repeating paisley surface with curled teardrop motifs and a clear border rhythm',
    ],
    [
      /terrazzo/i,
      'A terrazzo sample with scattered stone chips embedded in a pale polished matrix',
    ],
    [
      /circuit board/i,
      'An illustrative circuit-board layout with branching traces and blank component pads',
    ],
    [
      /qr code style/i,
      'A decorative square grid of black and white modules with no encoded or scannable content',
    ],
    [
      /pointillism/i,
      'A small harbor scene built from many separate colored dots with visible open spacing',
    ],
    [
      /mosaic \(tile\)/i,
      'A hillside landscape assembled from square ceramic tesserae with dark grout seams',
    ],
    [
      /stained glass/i,
      'A small tree silhouette framed by translucent colored glass panes and narrow lead boundaries',
    ],
    [
      /neon light lines/i,
      'A branching abstract line motif formed from bright neon tubes on a dark field',
    ],
    [
      /foil stamping/i,
      'A small embossed silver foil star pressed into deep blue paper with crisp edges',
    ],
    [
      /letterpress/i,
      'A short row of blind-pressed abstract marks on textured paper, too indistinct to read',
    ],
  ],
};

const PACK_11_SUBJECTS: Record<string, string> = {
  'lego toy brick build':
    'A small fire lookout tower assembled from generic interlocking toy bricks, with no brand marks',
  'funko pop vinyl collectible figure':
    'An original large-headed vinyl collectible figure in plain clothes and simple shoes',
  'play-doh clay': 'A hand-shaped clay frog with visible fingerprints and a plain painted base',
  'papercraft low poly': 'A low-poly paper fox assembled from folded cream and rust-colored facets',
  'amigurumi crochet': 'A handmade crochet whale with visible yarn loops and small stitched fins',
  plushie: 'A soft plush rabbit with simple stitched features, visible seams and no accessories',
  'action figure (90s)':
    'An original retro action figure in a blank jacket with articulated knees and elbows',
  'balloon art': 'A small cluster of balloons twisted into one recognizable blue dog figure',
  'wooden toy':
    'A carved wooden pull-toy train with simple wheels, visible grain and joined blocks',
  'sticker art':
    'A sheet of original fruit, stars and tiny garden-tool stickers, with no words or brands',
  'clay stop-motion comedy':
    'An original clay creature caught mid-step beside a small uneven clay obstacle',
  'tin toy': 'A small tin wind-up bird with a visible key, painted wings and a plain background',
  'diorama box': 'A shallow diorama box showing a tiny forest footbridge and layered paper trees',
  'button eye doll':
    'A cloth doll with stitched button-like eyes, a simple dress and visible handmade seams',
  'mosaic tile':
    'A small mosaic panel forming an original blue fish motif from distinct square tiles',
  embroidery:
    'A stitched hoop showing a simple sun above two hills, with thread texture in clear view',
  'sand art': 'A compact cutaway of colored sand layers forming a small dune and hillside',
  'ice carving':
    'A small carved ice sculpture of a leaping fish, with crisp edges and trapped bubbles',
  'chalkboard art': 'A white chalk drawing of a small sailing boat and waves on a dark board',
  'tattoo flash (old school)':
    'An original bold anchor-and-ribbon illustration with simple red, blue and black shapes',
  'stained glass':
    'A small arched window panel assembled from translucent colored glass and dark leading',
  'felt signal handmade broadcast':
    'A handmade felt weather scene with a sun, two clouds and stitched contours',
  'aerosol velocity layering':
    'A close urban wall with layered aerosol color fields and soft overspray edges',
  'gas-tube halo typography':
    'A ring of glowing glass tubes around a blank center, with no letters or readable text',
  'silkscreen icon impact':
    'A bold silkscreen image of an original orange and blue bird against a flat field',
  'emoji 3d':
    'An original round yellow face with a simple curved smile and two raised eyes on a pale field',
  'indexed pixel constraint':
    'A tiny pixel-art bicycle beside a square tree under a limited blue sky',
  'chrome horizon voltage':
    'A chrome-like horizon with a single red sun above a dark reflective plane',
  solarpunk:
    'A sunlit rooftop garden beneath a light solar canopy, with a compact city skyline beyond',
  dieselpunk:
    'An original compact airship above a brick-roofed industrial district in muted colors',
  cottagecore: 'A cottage garden path with foxgloves, a low stone wall and warm afternoon light',
  'dark academia':
    'A dark wooden study desk with stacked blank books, a brass lamp and window shadows',
  'liminal consumer vapor':
    'An empty corner shop aisle under pale fluorescent lights, viewed symmetrically',
  steampunk:
    'An original brass instrument panel with exposed gears and a round dial without numbers',
  biopunk: 'A small translucent seed pod with branching fibers on a dark green field',
  'gothic horror':
    'An empty stone corridor with pointed arches, a distant doorway and deep soft shadows',
  'kawaii pastel': 'A pastel tabletop with an original toy-like cloud, heart and star arrangement',
  grimdark: 'A lone armored silhouette crossing a dark ridge beneath a muted red sky',
  'frutiger aero':
    'A bright aqua pool beside a curved white pavilion, distant clouds reflected on the surface',
  'postmodern pattern clash':
    'A compact interior of mismatched geometric wall panels and one low chair',
  'liquid optic recursion':
    'A close abstract pool of liquid color forming nested rings around an open center',
  'holographic flake scatter':
    'A handful of iridescent flakes scattered over a deep indigo surface',
  'latte art':
    'A latte surface with a crisp fern pattern in crema, photographed from directly above',
  'michelin fine-dining editorial':
    'A composed fine-dining plate with one seared vegetable, a small sauce stroke and open space',
  'candy land': 'A few brightly colored sugar candies on a pale surface with hard-edged shadows',
  'sushi platter':
    'A neat sushi assortment with distinct rice, seaweed and fish textures on a plain plate',
  'fast food commercial':
    'A simple burger and crisp fries on a metal tray, with their layers clearly separated',
  'cocktail macro': 'A coupe glass holding a citrus cocktail with clear ice and one curved peel',
  'bakery window':
    'Three fresh loaves on a bakery shelf behind a clear window, crusts and crumb visible',
  'fruit explosion': 'Fresh citrus and berries caught midair above a clear splash of water',
  'chocolate flow':
    'A dark chocolate ribbon curling over a single square of chocolate on a plain board',
  'bento box':
    'A tidy bento meal with rice, greens and grilled vegetables separated into compartments',
  'pizza melt': 'A cut slice of cheese pizza with a long strand of melted cheese and crisp crust',
  'electron microscope':
    'An illustrative electron-microscope-like view of mineral grains, with no scale labels',
  'insect eye':
    'A macro view of an insect eye made of hundreds of small dark facets catching blue light',
  'cellular life':
    'A luminous cluster of illustrative cells with translucent membranes and clear dark gaps',
  snowflake: 'A six-armed snowflake crystal isolated against a deep blue background',
  'circuit board':
    'A magnified circuit-board corner with fine traces and solder points, with no readable labels',
  'water drop reflection':
    'One clear water droplet reflecting an upside-down green garden against a plain field',
  'fiber/fabric macro':
    'A woven fabric macro showing crossing fibers, lint strands and a narrow focus plane',
  'rust/decay macro':
    'A rusty metal macro with layered orange flakes and dark pits in a narrow focus band',
  'iris/eye macro':
    'A close human iris with radial amber fibers and a small catchlight, with no face visible',
  'soap bubble': 'A clear soap bubble with a thin rainbow film and a soft dark reflection',
  'feather macro':
    'A single feather barb enlarged to show parallel filaments and branching structure',
  'leaf veins': 'A leaf underside showing fine branching veins across a softly lit green surface',
  'skin pores':
    'A close human cheek-skin texture with visible pores, even light and no identifying face features',
  'ink in water': 'A plume of dark ink unfurling into clear water with delicate branching edges',
  'fungi/mold':
    'Illustrative fungal threads and round spores crossing a dark surface in close view',
  'crystal growth': 'A cluster of clear crystals growing from a rough pale mineral base',
  'vinyl record grooves':
    'A vinyl record macro with concentric grooves catching narrow reflected highlights',
  velcro: 'A close strip of hook-and-loop fabric showing tiny hooks beside soft loops',
  sponge: 'A sea-sponge macro with open pores and branching cavities against a muted blue field',
  moss: 'A close patch of moss with tiny leaves, dew points and dark gaps below',
  sandpaper: 'A sandpaper grain surface with angular particles in a shallow band of light',
  cork: 'A cork macro showing irregular pores, thin fibers and a clean cut edge',
  'carbon fiber':
    'A carbon-fiber weave close-up with repeating dark strands and subtle silver highlights',
  'dandelion seed':
    'A dandelion seed head with individual parachute filaments crisp against soft green',
  'x-ray':
    'An illustrative x-ray-style image of a seashell showing inner chambers in pale translucent tones',
  'thermal vision':
    'A single person-shaped thermal silhouette crossing a dark open walkway with warm and cool zones',
  blueprint:
    'An illustrative blueprint drawing of a desk lamp in front, side and top views, with blank annotation areas',
};

const CATEGORY_MAP: Record<string, ReadonlyArray<readonly [RegExp, keyof PackBriefs]>> = {
  pack_07: [
    [/interior design systems/i, 'interior'],
    [/architectural movements|vernaculars/i, 'architecture'],
    [/civic infrastructure|specialty spaces/i, 'civic'],
    [/landscape|garden systems/i, 'garden'],
    [/fantasy|mythic architecture/i, 'fantasy'],
    [/toy craft|miniature architecture/i, 'miniature'],
    [/megastructure|impossible space/i, 'impossible'],
  ],
  pack_08: [
    [/contemporary fashion/i, 'contemporary'],
    [/subcultures/i, 'subculture'],
    [/fantasy sci-fi costume/i, 'costume'],
    [/historical/i, 'historical'],
    [/fabric|texture focus/i, 'fabric'],
  ],
  pack_09: [
    [/natural materials/i, 'natural'],
    [/man-made materials/i, 'manmade'],
    [/weathering|decay/i, 'weathering'],
    [/tactile surfaces/i, 'tactile'],
    [/elemental|fx/i, 'elemental'],
  ],
  pack_10: [
    [/geometric abstraction/i, 'geometric'],
    [/fluid|organic/i, 'organic'],
    [/digital glitch|noise/i, 'glitch'],
    [/surrealism|dream/i, 'surreal'],
    [/textile|ornamental patterns/i, 'pattern'],
    [/material surface textures/i, 'texture'],
    [/diagram|data systems/i, 'diagram'],
    [/point|mosaic|glass systems/i, 'units'],
    [/print|light finishes/i, 'finish'],
  ],
  pack_11: [
    [/toys|crafts/i, 'toys'],
    [/artistic mediums/i, 'medium'],
    [/aesthetics/i, 'aesthetic'],
    [/food|drink/i, 'food'],
    [/micro|macro/i, 'micro'],
    [/sensor|technical imaging/i, 'sensor'],
    [/diagram|technical drawing/i, 'technical'],
  ],
};

function stableIndex(id: string, category: string, length: number): number {
  let hash = 2166136261;
  for (const character of `${id}|${category}`) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return (hash >>> 0) % length;
}

function cleanPresetName(name: string): string {
  return name
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/[\/&]/g, ' and ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function materialSample(name: string): string {
  const finish = name.match(/\(([^)]+)\)/)?.[1]?.toLowerCase();
  const subject = cleanPresetName(name);
  const finishDetails: Record<string, string> = {
    raw: 'raw open grain and an unsealed matte face',
    polished: 'polished highlights and a smooth reflective face',
    rough: 'a rough broken face with irregular pores',
    carrara: 'fine gray marble veining',
    split: 'thin split layers along a sharp edge',
    forged: 'compressed carbon-fiber weave and resin depth',
    aged: 'worn brick faces and irregular mortar joints',
    wet: 'a wet reflective sheen across the surface',
    cracked: 'fine cracks crossing the surface',
    'injection molded': 'molded ribs, parting seams and a clean plastic edge',
    tire: 'deep rubber tread grooves',
    shattered: 'sharp broken fragments with visible glass edges',
    shiny: 'a glossy sheen with bright reflected highlights',
    'shou sugi ban': 'charred ridges crossing visible wood grain',
    sea: 'open marine pores and a branching natural structure',
    synthetic: 'uniform fibers with a soft brushed edge',
    'liquid metal': 'rounded reflective liquid-metal beads',
    beach: 'fine ripples across loose sand grains',
    powder: 'powdery ridges and a soft granular edge',
    cooled: 'a dark porous crust with cooled lava ridges',
    styrofoam: 'expanded cells and a clean cut foam edge',
    shag: 'long dense fibers bent in two directions',
  };
  const detail = finish
    ? (finishDetails[finish] ?? `${finish} surface texture`)
    : 'its recognizable surface structure';
  return `A tightly framed close-up of ${subject}, showing ${detail} across a cropped material sample with its light response visible`;
}

function pack07NamedScene(name: string, family: keyof PackBriefs): string {
  const subject = cleanPresetName(name);
  switch (family) {
    case 'interior':
      return `A room interior shaped by the ${subject} design direction, with its furniture, openings and wall geometry clearly visible`;
    case 'architecture':
      return `An exterior architectural study of a ${subject} building, with facade, roofline and entry clearly visible`;
    case 'civic':
      return `A public interior shaped by ${subject} planning, with its circulation path and defining spatial structure visible`;
    case 'garden':
      return `A garden landscape arranged around ${subject} principles, with path geometry and planting pattern clearly visible`;
    case 'fantasy':
      return `An original fictional building with ${subject} architecture, an unmistakable silhouette and a clear open passage`;
    case 'miniature':
      return `A small hand-built architectural model demonstrating ${subject} construction, with scale cues and material edges visible`;
    case 'impossible':
      return `An original architectural space demonstrating ${subject} geometry, with a clear central form and strong depth cues`;
    default:
      return `A representative architectural scene for ${subject}, framed around one clearly readable structure`;
  }
}

function pack08NamedSubject(name: string, family: keyof PackBriefs): string {
  const subject = cleanPresetName(name);
  if (family !== 'fabric') {
    return `An adult model wearing an original ${subject} outfit, full figure against a plain studio backdrop`;
  }

  if (/smoke dress/i.test(name))
    return 'A smoke-like fabric form twisting into a dress silhouette around an empty center';
  if (/water dress/i.test(name))
    return 'A translucent aqua garment form flowing into broad water-like folds';
  if (/fire dress/i.test(name))
    return 'A red-orange garment form with flame-shaped edges and a clearly visible cloth weave';
  if (/denim on denim/i.test(name))
    return 'Two overlapping denim panels showing blue twill weave, worn creases and seam stitching';
  if (/fur coat/i.test(name))
    return 'A close view of a soft fur coat collar with individual guard hairs and undercoat visible';
  if (/chainmail/i.test(name))
    return 'A chainmail swatch draped in one broad curve, with linked metal rings clearly separated';
  if (/knitted wool/i.test(name))
    return 'A thick knitted wool swatch with large loops, a rolled edge and soft fibers';
  if (/liquid satin/i.test(name))
    return 'A length of silver satin falling into three deep fluid folds across a dark surface';
  if (/tweed suit/i.test(name))
    return 'A brown tweed jacket sleeve showing flecks, cuff construction and woven fibers';
  if (/sequins/i.test(name))
    return 'A square of sequined fabric catching small points of light across its surface';
  if (/transparent plastic/i.test(name))
    return 'A translucent plastic sheet folded over itself with crisp overlapping edges';
  if (/^velvet$/i.test(name))
    return 'A folded velvet swatch showing directional pile that shifts from dark to bright';
  if (/^lace$/i.test(name))
    return 'A piece of fine lace fabric with open loops and visible thread structure';
  if (/leather armor/i.test(name))
    return 'A leather armor panel with stitched borders, shallow embossing and worn corners';
  if (/^feathers$/i.test(name))
    return 'A fan of layered feathers arranged to show shafts, barbs and soft color transitions';
  if (/porcelain doll/i.test(name))
    return 'A small porcelain doll figure with painted features, a simple dress and a plain background';
  if (/tattoo skin/i.test(name))
    return 'A close skin surface study with one small ornamental ink motif and no identifying face';
  if (/body paint/i.test(name))
    return 'An adult model shown as a neutral full-body display form with clean abstract body-paint bands';
  if (/bandage|mummy/i.test(name))
    return 'A neutral mannequin wrapped in overlapping cloth bandages with visible fabric edges';
  if (/gold leaf/i.test(name))
    return 'A torn sheet of gold leaf catching soft light along its delicate uneven edge';
  if (/viscous gel couture/i.test(name))
    return 'A glossy gel-like garment form folded into broad translucent ridges';
  if (/stone statue/i.test(name))
    return 'A small stone sculptural bust on a plain plinth with a smooth weathered surface';
  if (/origami paper/i.test(name))
    return 'A small geometric flower folded from one sheet of colored paper with clear crease lines';
  if (/bubble wrap/i.test(name))
    return 'A clear bubble-wrap panel compressed at one corner, with individual air cells visible';
  return `A close-up material swatch of ${subject}, folded into broad layers so its texture and edge are clearly visible`;
}

function pack10NamedSubject(name: string, family: keyof PackBriefs): string {
  const subject = cleanPresetName(name);
  if (family === 'pattern') {
    return `A cropped textile or tile sample showing a repeating ${subject} motif, with the repeat and border clearly visible`;
  }
  if (family === 'texture') return materialSample(name);
  if (family === 'diagram') {
    return `An illustrative ${subject} diagram with clear line hierarchy and blank areas instead of labels or functional data`;
  }
  if (family === 'geometric') {
    return `A clean abstract composition illustrating ${subject} through a small set of distinct geometric forms`;
  }
  if (family === 'organic') {
    return `An abstract close-view study of ${subject}, with its flowing or branching structure clearly visible on a plain field`;
  }
  return '';
}

function pack11NamedSubject(name: string): string | null {
  return PACK_11_SUBJECTS[name.toLowerCase()] ?? null;
}

/** Returns only the representative subject or scene; shared style guidance is added by the caller. */
export function legacyBriefPacks07to11(pack: BriefPack, preset: BriefPreset): string | null {
  const categories = CATEGORY_MAP[pack.id];
  if (!categories) return null;

  const name = preset.name.toLowerCase();
  if (pack.id === 'pack_11') return pack11NamedSubject(name);

  const special = SPECIAL_SUBJECTS[pack.id]?.find(([pattern]) => pattern.test(name))?.[1];
  if (special) return special;

  const category = preset.category ?? '';
  const key = categories.find(([pattern]) => pattern.test(category))?.[1];
  if (pack.id === 'pack_09' && key !== 'elemental') return materialSample(preset.name);
  if (pack.id === 'pack_08' && key) return pack08NamedSubject(preset.name, key);
  if (pack.id === 'pack_07' && key) return pack07NamedScene(preset.name, key);
  if (pack.id === 'pack_10' && key) {
    const named = pack10NamedSubject(preset.name, key);
    if (named) return named;
  }
  const pool = key ? PACK_BRIEFS[pack.id][key] : undefined;
  if (!pool?.length) return null;
  return pool[stableIndex(preset.id, category, pool.length)];
}
