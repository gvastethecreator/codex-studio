type BriefPack = { id: string };
type BriefPreset = { id: string; name: string; category?: string };

type BriefFamily =
  | 'cinema'
  | 'broadcast'
  | 'animation'
  | 'photography'
  | 'lighting'
  | 'sensor'
  | 'caricature'
  | 'diy'
  | 'render'
  | 'product'
  | 'material'
  | 'organic'
  | 'environment'
  | 'technical-sheet'
  | 'comic'
  | 'storybook'
  | 'editorial'
  | 'print'
  | 'concept'
  | 'anime-action'
  | 'mecha'
  | 'fantasy'
  | 'dark-fantasy'
  | 'retro-game'
  | 'game-ui'
  | 'game-direction'
  | 'essential-art';

const BRIEFS: Record<BriefFamily, readonly string[]> = {
  cinema: [
    'A ferry arriving at a foggy island dock, passengers small against the open water',
    'An adult night-shift baker closing a brightly lit shop on a quiet street',
    'A mountain rescue team crossing a narrow snow ridge beneath heavy clouds',
    'Two adult siblings finding an old radio in a sunlit attic, hands and faces readable',
    'A lone cyclist entering a tunnel as daylight fades behind them',
    'A crowded train platform moments before the last train departs',
    'A lighthouse keeper walking toward a beacon above a rough winter sea',
    'An empty neighborhood pool under a single streetlamp after midnight',
    'A field medic tending an injured hiker beside a remote trail',
    'A small boat passing beneath a vast suspension bridge at dawn',
    'An adult courier climbing a stairwell during a city blackout',
    'A family loading a weathered station wagon before a long road trip',
    'A radio astronomer watching a remote observatory turn toward the night sky',
    'A young adult violinist waiting backstage beside a partly open curtain',
    'A bus driver taking a break at the final stop in falling snow',
    'A flood barrier holding back rising water at the edge of a town',
    'A greenhouse worker checking seedlings as a storm darkens the glass roof',
    'An adult diver surfacing beside a research vessel in choppy water',
  ],
  broadcast: [
    'A weather presenter beside a blank regional map, full figure and studio monitors visible',
    'A radio host speaking into a microphone in a compact sound booth',
    'Two adult anchors reviewing blank cue cards at a simple news desk',
    'A field reporter standing beside a closed transit station during light rain',
    'A cooking host arranging fresh vegetables on a clean studio counter',
    'A sports commentator at a small desk overlooking an empty arena',
    'An adult interviewer listening across a pair of plain chairs in a bright studio',
    'A sound engineer adjusting a mixing console beneath a row of status lights',
    'A camera operator filming a dance rehearsal from the side of a stage',
    'A public-access host demonstrating a hand-built tabletop model',
    'An adult presenter pointing toward a blank display wall with simple diagrams',
    'A late-night host waiting alone beneath a pool of warm stage light',
    'A studio floor manager giving a silent countdown beside a camera rig',
    'A documentary crew interviewing a harbor worker near moored boats',
    'A live orchestra seen from the broadcast camera position above the hall',
    'A compact podcast table with two adults and visible recording equipment',
    'A news helicopter seen through a control-room window above a distant city',
    'A stage performer framed by a wide empty television set',
  ],
  animation: [
    'An original adult courier leaping between two low rooftops with a satchel secured',
    'A small wind-up robot trying to carry an oversized folded map',
    'An adult gardener chasing loose paper across a windy greenhouse aisle',
    'A curious fox crossing a stepping-stone creek with a tiny pack',
    'A paper kite caught briefly in the branches of a flowering tree',
    'A young adult cook balancing three plates while turning through a kitchen doorway',
    'A friendly mountain creature peeking around a trail sign, entire silhouette visible',
    'An original adult cyclist coasting down a broad hill at sunset',
    'A tiny maintenance robot opening a stuck door in a quiet station',
    'A pair of adult dancers mirroring each other in a simple rehearsal room',
    'A playful dog shaking water beside a garden path',
    'A novice astronomer setting up a telescope in a rooftop garden',
    'A young adult mechanic testing a paper airplane in a workshop',
    'A sleepy dragon curled around a hillside tree, wings and tail readable',
    'A rowboat carrying three original animal friends across a calm pond',
    'A flock of paper birds escaping from an open sketchbook',
    'An adult musician carrying a large drum down a narrow lane',
    'A tiny repair crew guiding a rolling toolbox through a busy workshop',
  ],
  photography: [
    'An adult street vendor arranging citrus fruit before the market opens',
    'A weathered red bicycle leaning against a pale brick wall after rain',
    'A coastal footpath winding past wind-bent grass toward a distant headland',
    'An adult tailor measuring cloth beside a tall sunlit window',
    'A bowl of ripe peaches and a folded linen napkin on a kitchen table',
    'A city tram crossing a wet intersection beneath old shopfronts',
    'An adult woodworker checking a hand plane at a clutter-free bench',
    'A row of mountain cabins seen across a clear alpine lake',
    'A small sailboat passing a striped harbor marker in early morning haze',
    'A pair of muddy hiking boots beside a trail map and compass',
    'An adult florist carrying a bundle of long-stemmed flowers through a doorway',
    'A quiet apartment kitchen with an open window and a bowl of pears',
    'A dog resting beside its adult owner on a shaded park bench',
    'An aerial view of a river delta dividing into narrow silver channels',
    'An old cinema marquee seen from the opposite side of a nearly empty street',
    'A close view of a gloved hand holding a newly found seashell on a beach',
  ],
  lighting: [
    'A glass-roofed conservatory at blue hour, one lit path leading into the greenery',
    'A lone adult violinist practicing beside a warm desk lamp',
    'A wet city crosswalk reflecting a row of red traffic signals at night',
    'A small fishing boat crossing a narrow band of sunrise on dark water',
    'A stone stairway with a bright doorway at its upper landing',
    'An adult runner passing beneath alternating pools of light in an underpass',
    'A pale moon above a dark ridge and a quiet lake',
    'A paper lantern illuminating a quiet outdoor tea garden after rain',
    'A row of workshop windows glowing against a cold winter evening',
    'A lighthouse beam sweeping over cliffs and low ocean mist',
    'A narrow sunbeam crossing an empty library reading room',
    'A night bus waiting beneath a blue station canopy',
    'A greenhouse interior lit by a single bright work lamp among seedlings',
    'A theater stage with one performer standing inside a narrow shaft of light',
    'A small cabin window glowing in a broad snowy forest',
    'An adult diver exploring a shallow reef beneath broken shafts of sunlight',
  ],
  sensor: [
    'A thermal view of two hikers crossing an open ridge, heat silhouettes clearly separated',
    'An overhead security-camera view of a quiet station entrance with paths and exits visible',
    'A microscope view of a pollen grain against a clean dark field, surface ridges resolved',
    'A telescope view of the Moon over a sparse field of stars, crater edges readable',
    'An infrared view of rooftops and tree canopies after a warm afternoon',
    'A night-vision view of a search team moving through a forest clearing',
    'An aerial survey of a river bend and surrounding farmland, boundaries clearly visible',
    'A close technical view of a gloved hand holding a non-branded inspection sensor',
    'A radiographic study of a hand gripping a simple wooden handle, bones clearly aligned',
    'A dashboard camera view of an empty road through a mountain pass',
    'A sonar display showing a research boat above a broad underwater ridge',
    'A satellite view of clouds casting long shadows across a rugged coastline',
    'A depth camera view of an adult walking through a plain indoor corridor',
    'A high-speed study of one water droplet breaking apart above a metal surface',
    'A low-light image of an owl perched on a branch at the forest edge',
    'A rangefinder view of a lone runner crossing an open snowfield',
    'A polarized-light view of layered mineral crystals in a dark field',
    'A radar scope with a small research vessel and coastline rendered as clear traces',
  ],
  caricature: [
    'An original adult chef proudly carrying a comically tall stack of pancakes',
    'An original adult librarian balancing a leaning tower of oversized books',
    'An original adult bus driver waving while steering a tiny city bus',
    'An original adult gardener wrestling with an enormous tangled hose',
    'An original adult opera singer warming up beside a very small piano',
    'An original adult detective inspecting a magnifying glass larger than their head',
    'An original adult cyclist pushing a bicycle with an impossibly large front wheel',
    'An original adult fisherman presenting a tiny fish beside an oversized net',
    'An original adult clockmaker peering through a cluster of tiny gears',
    'An original adult baker dusted with flour beside a comically wide loaf',
    'An original adult musician carrying an enormous tuba down a narrow stair',
    'An original adult mail carrier sorting a spill of brightly colored letters',
    'An original adult mountain guide pointing toward a very small summit flag',
    'An original adult painter leaning away from a hilariously long brush',
    'An original adult tailor measuring a sleeve that trails across the floor',
    'An original adult botanist examining a giant leaf with a tiny hand lens',
    'An original adult chef trying to flip one oversized pancake in midair',
    'An original adult dog walker followed by a lively tangle of leashes',
    'An original adult drummer holding a pair of comically oversized drumsticks',
    'An original adult gardener riding a small cart loaded with giant pumpkins',
  ],
  diy: [
    'A handmade cardboard theater with three cut-paper characters on a tiny stage',
    'An adult maker stitching a bright fabric puppet at a well-used worktable',
    'A small stop-motion set of a paper boat sailing across a painted tabletop sea',
    'A young adult bookbinder folding colorful signatures beside simple hand tools',
    'A miniature cardboard city block assembled from recycled boxes and painted windows',
    'An adult artist cutting layered paper leaves for a wall collage',
    'A hand-built wooden automaton with visible gears standing on a workbench',
    'A tiny felt animal being sewn by hand beside thread and fabric scraps',
    'An adult printmaker pulling a simple two-color print from a small press',
    'A homemade shadow-puppet screen with a tree and two figures cut from paper',
    'A child-safe craft table with folded paper stars and blunt scissors',
    'A hand-painted miniature greenhouse assembled from thin wood and clear panels',
    'An adult maker repairing a toy train with small hand tools',
    'A collage landscape built from torn magazine color blocks and paper scraps',
    'A knitted scarf drying across a simple wooden rack beside a window',
    'An open sketchbook surrounded by colored pencils, paper clips, and cut shapes',
    'A miniature stage made from matchbox-sized wood pieces and painted scenery',
    'An adult hobbyist assembling a simple paper glider at a kitchen table',
  ],
  render: [
    'A compact electric kettle shown in three-quarter view on a neutral studio sweep',
    'A glass elevator crossing the atrium of a bright contemporary building',
    'A low-poly island observatory on a grassy ridge beneath a pale sky',
    'A small service robot with clear joints standing on a clean studio floor',
    'A curved pedestrian bridge spanning a narrow city canal',
    'A transparent cutaway of a desk fan showing its motor and blade assembly',
    'A sculpted stone archway in a simple sunlit courtyard',
    'A stylized underwater research station surrounded by soft coral shapes',
    'A stack of interlocking geometric blocks with one bright accent piece',
    'A compact camera body with lens, controls, and materials clearly readable',
    'A small tram traveling through a clean miniature city street',
    'A human-scale indoor treehouse built around a central timber column',
    'A simplified wind turbine standing above rolling green hills',
    'A sculptural chair with woven seat and visible frame geometry',
    'A cutaway view of a compact greenhouse with benches and irrigation lines',
    'A simple ceramic-free desk lamp with a bent metal stem and broad shade',
    'A stylized mountain cable car crossing a deep forest valley',
    'A small modular cabin shown with its roof lifted to reveal the interior',
  ],
  product: [
    'Unbranded over-ear headphones on a clean surface, cushions and headband fully visible',
    'A compact silver camera with a short lens and clearly separated controls',
    'A sculptural desk lamp with a slim metal arm and broad diffusing shade',
    'A pair of trail shoes shown in side view with tread and lacing visible',
    'A reusable water bottle with a simple loop cap and brushed finish',
    'A small wireless speaker with fabric grille and rounded rectangular silhouette',
    'An ergonomic office chair shown in three-quarter view with visible adjustments',
    'A compact electric kettle with handle, spout, and lid clearly separated',
    'A handheld game controller with unbranded buttons and readable grip geometry',
    'A safety helmet with clear shell, strap, and ventilation details',
    'A folding bicycle lock arranged in a simple studio composition',
    'A pair of unbranded hiking poles with grips, straps, and tips visible',
    'A small countertop coffee grinder with hopper, dial, and grounds cup',
    'A lightweight travel backpack with open compartments and clean fabric seams',
    'A stainless steel hand tool with ergonomic grip and replaceable head',
    'A compact desk fan with protective grille and visible pivot stand',
    'A modular storage organizer with several trays arranged at different heights',
    'A simple wristwatch with a blank face, leather strap, and polished case',
  ],
  material: [
    'A close study of brushed aluminum, polished steel, and matte graphite sample plates',
    'A clear glass block catching broad reflections against a dark background',
    'A folded piece of coarse linen beside a smoother cotton swatch',
    'A weathered timber board showing end grain, knots, and a clean cut edge',
    'A layered cross-section of translucent colored resin with visible depth',
    'A small pile of river stones with wet and dry surfaces side by side',
    'A softly wrinkled sheet of metallic foil under a broad studio light',
    'A close view of woven carbon fiber beside a matte polymer shell',
    'A patch of cracked dry clay beside a smooth damp section',
    'Three painted metal panels showing satin, gloss, and chipped finishes',
    'A translucent ice block with trapped bubbles and a clear silhouette',
    'A woven basket-like fiber panel shown as a simple material sample',
    'A close study of layered plywood edges and a smooth sealed face',
    'A dark rubber tread sample beside a molded flexible gasket',
    'A thin sheet of copper with natural oxidation across one corner',
    'A softly lit ceramic-free glass and steel assembly with clean joinery',
    'A small polished stone beside a rough-cut mineral fragment',
    'A panel of recycled paper pulp with visible fibers and uneven edges',
  ],
  organic: [
    'An original friendly forest creature with layered leaf-like fins, full silhouette visible',
    'A translucent jellyfish drifting through a sparse underwater scene',
    'A small gecko clinging to a broad tropical leaf, toes and tail readable',
    'An original adult field researcher holding a harmless glowing sea organism',
    'A close portrait of a moth with patterned wings spread against a plain field',
    'A small tree frog resting on a wet branch after rain',
    'An original soft-bodied alien plant with curled tendrils and a rooted base',
    'A biomechanical hand study with articulated joints and smooth organic contours',
    'A cluster of luminous mushrooms growing around a fallen branch',
    'A long-legged shore bird stepping through shallow water',
    'An original gentle cave creature with broad fins and a rounded body',
    'A single dandelion seed head caught in a quiet breeze above grass',
    'A detailed cutaway of a leaf showing branching veins and outer edge',
    'A small school of translucent fish turning together in open water',
    'A curled fern frond emerging from dark soil, spiral and leaflets clear',
    'An original adult marine biologist observing a large ray in a clear tank',
    'A butterfly emerging from a chrysalis attached to a thin twig',
    'A broad mushroom cap and gilled underside shown against a simple forest floor',
  ],
  environment: [
    'A cliffside research outpost connected by a narrow footbridge above the sea',
    'A compact market square in a hillside town after a light rain',
    'A raised boardwalk winding through a broad marsh at sunrise',
    'A snowy rail station nestled between dark evergreen slopes',
    'A wind-powered farm across rolling grassland under a wide sky',
    'An underground transit hall with clear platforms, stairs, and signage panels left blank',
    'A quiet riverside neighborhood seen from a small pedestrian bridge',
    'A glass greenhouse complex beside an open field and distant tree line',
    'A cliff path passing a beacon tower above a calm blue inlet',
    'A mountain village connected by a high cable car line',
    'A broad salt flat with a low research station near the horizon',
    'An overgrown concrete viaduct crossing a green valley',
    'A compact coastal harbor with boats, sheds, and a stone breakwater',
    'A desert wind farm with distant turbines and a service track',
    'A forest footbridge crossing a narrow stream between tall trees',
    'A small observatory beneath a clear night sky on a high plateau',
    'A low city skyline seen across a broad urban park and reflecting pond',
    'A terraced hillside orchard with a winding path and distant farmhouse',
  ],
  'technical-sheet': [
    'A clean reference sheet for an original climbing helmet, front side and rear views, no readable text',
    'A technical breakdown of a compact desk fan with exploded blade motor and grille views',
    'An orthographic study of a folding bicycle, side front and frame-fold sequence',
    'A clear cutaway diagram of a small greenhouse showing vents, benches, and irrigation',
    'A character turnaround sheet for an original adult harbor pilot in practical work clothes',
    'A parts study of an unbranded handheld radio with buttons antenna and battery layout',
    'A reference page for a small research submersible with top side and interior views',
    'An exploded view of a mechanical pencil with the grip barrel and lead feed separated',
    'A botanical field plate of a fern with frond, stem, and spore details',
    'A design sheet for an original compact rescue drone with top and side silhouettes',
    'A simple process diagram showing a water filter with clear inlet and outlet paths',
    'A reference sheet for a modular trail shelter with plan side and assembly views',
    'An orthographic study of a walking boot showing sole tread seams and lace routing',
    'A cutaway technical illustration of a small hydroelectric turbine and water channel',
    'A character model sheet for an original adult bicycle mechanic, neutral front and side poses',
    'A clear map-like diagram of a mountain footpath with contour lines and trail junctions',
    'A product teardown sheet for a compact camera with lens body and controls separated',
    'A botanical comparison plate of three distinct seed pods with cross-sections and scale marks',
  ],
  comic: [
    'An original adult masked rescuer lifting a fallen beam to open an exit',
    'An original adult courier sprinting through a crowded market with a sealed parcel',
    'An original adult inventor testing a small winged glider above a rooftop',
    'An original adult mountain climber reaching a ledge as a storm rolls in',
    'An original adult detective examining footprints beside a broken garden gate',
    'An original adult guardian shielding a group of evacuees from falling debris',
    'An original adult spacefarer repairing a damaged rover on a rocky plain',
    'An original adult street artist painting a large blank wall mural',
    'An original adult diver discovering a bright beacon beneath a sea arch',
    'An original adult mechanic leaping aside as a runaway robot rolls past',
    'An original adult drummer leading a parade through a narrow city street',
    'An original adult climber crossing a rope bridge above a misty ravine',
    'An original adult librarian opening a hidden door between tall shelves',
    'An original adult gardener rescuing seedlings from a sudden summer downpour',
    'An original adult pilot stepping from a compact rescue aircraft at a mountain outpost',
    'An original adult explorer raising a lantern inside a broad underground chamber',
    'An original adult fencer practicing a clear guard stance in an empty hall',
    'An original adult firefighter guiding a hose around a corner in a training yard',
  ],
  storybook: [
    'A small fox carrying apples through a quiet autumn orchard',
    'An adult lighthouse keeper sharing a meal with a friendly seabird',
    'A young adult gardener discovering a tiny bridge beneath broad leaves',
    'A family of rabbits crossing a meadow on their way home before dusk',
    'A friendly giant helping repair a small village footbridge',
    'A young adult astronomer finding a fallen paper star in a garden',
    'A cheerful dog pulling a little wagon of books along a tree-lined lane',
    'An old train crossing a green valley toward a small hill town',
    'A tiny woodland school beneath a broad tree, windows and path visible',
    'An adult baker placing warm loaves on a window sill to cool',
    'A curious child-sized robot watering a row of garden seedlings',
    'A pair of otters building a small shelter beside a stream',
    'A young adult musician playing a concertina to a group of birds',
    'A small dragon helping an adult shepherd guide sheep through a gate',
    'A paper boat sailing through a shallow puddle beneath a bright sky',
    'A cozy library wagon parked beneath a flowering tree',
    'A helpful bear carrying firewood toward a cabin at twilight',
    'A little harbor tug guiding a larger boat into a sheltered cove',
  ],
  editorial: [
    'An adult commuter holding an open umbrella at a sharply angled crosswalk',
    'A single bright red chair beneath a broad empty museum wall',
    'A pair of adult hands repairing a small pocket watch over a work mat',
    'A close arrangement of citrus halves, leaves, and a plain glass of water',
    'A city bicycle parked beside a clean geometric staircase',
    'An adult athlete tying a shoe on the edge of an empty track',
    'A stack of blank paper sheets casting long graphic shadows on a table',
    'A pair of small sailboats seen against a broad flat horizon',
    'An adult florist carrying a wide bundle of branches through a doorway',
    'A single yellow raincoat hanging beside a bright blue entry door',
    'A close study of hands shaping a loaf on a flour-dusted board',
    'A wind turbine viewed through the open frame of a city window',
    'A dog waiting beside an empty park fountain in winter',
    'An adult commuter crossing a bridge above a slow river',
    'A broad-leafed plant casting a sharp shadow across a pale wall',
    'A small portable radio on a picnic blanket beneath a tree',
    'A row of colorful umbrellas drying outside a narrow storefront',
    'A clean overhead arrangement of climbing rope, carabiners, and a folded map',
  ],
  print: [
    'A mountain goat standing on a rocky shelf above layered distant ridges',
    'An adult dockworker pulling a rope beside stacked harbor crates',
    'A night moth resting against a simple crescent moon and dark branches',
    'A broad-leafed plant growing from a cracked stone wall',
    'A small fox looking back from a winding woodland path',
    'A wind-bent pine tree on a bare coastal headland',
    'An old tram crossing a narrow bridge between close city buildings',
    'A hand holding a glowing lantern above a flooded forest path',
    'A single heron standing in shallow reeds beside a still pond',
    'A weathered rowboat tied to a short wooden pier',
    'An adult climber silhouetted against a broad snow-covered summit',
    'A compact greenhouse with geometric panes and climbing vines',
    'A pair of swallows circling a tall water tower',
    'An old bicycle leaning beneath a flowering street tree',
    'A crescent-shaped sandbar surrounded by dark ocean water',
    'A small group of adults carrying a long timber beam together',
    'A stone bridge reflected in a narrow canal beneath bare branches',
    'A cluster of wind-bent grasses around a single bright seed head',
  ],
  concept: [
    'A rescue station built into the side of a steep glacier valley',
    'An original adult cartographer studying an enormous blank map in a field tent',
    'A floating garden platform linked to a small riverside town',
    'A wind-powered observatory on a remote desert plateau',
    'An abandoned transit terminal reclaimed by climbing vines and young trees',
    'A compact underwater habitat anchored beside a deep ocean ridge',
    'A mountain pass protected by a chain of small signal towers',
    'An original adult courier crossing a suspended walkway between tall city blocks',
    'A forest research cabin raised above seasonal floodwater',
    'A new pedestrian bridge connecting two crowded old neighborhoods',
    'A cliffside weather station facing a wall of distant rain',
    'A greenhouse district built around an elevated rail line',
    'A modular emergency shelter set on a snowy ridge',
    'A small observatory on a quiet island beneath a sweeping star field',
    'A hillside wind farm with a winding maintenance road',
    'A broad public staircase descending from a hilltop garden into the city',
    'A compact rescue rover parked beside a high-altitude trail marker',
    'A river settlement connected by narrow wooden walkways and small boats',
  ],
  'anime-action': [
    'An original adult martial artist pivoting into a clear, balanced defensive stance',
    'An original adult courier dashing across a rain-dark rooftop with a small pack',
    'An original adult archer releasing an arrow across a windy open field',
    'An original adult fencer stepping through a clean advancing lunge in a practice hall',
    'An original adult climber jumping between two broad rock shelves',
    'An original adult rescue pilot banking above a mountain pass',
    'An original adult runner accelerating through a tunnel toward daylight',
    'An original adult staff fighter turning through a wide circular motion on a beach',
    'An original adult goalkeeper reaching toward a fast-moving ball',
    'An original adult skater making a high clean turn above an empty ramp',
    'An original adult firefighter carrying a hose through a training course',
    'An original adult diver swimming toward a bright opening beneath an ice shelf',
    'An original adult explorer leaping over a narrow stream between rocks',
    'An original adult pilot climbing into a compact aircraft before takeoff',
    'An original adult drummer striking a decisive pose under stage lights',
    'An original adult sailor pulling a taut line aboard a pitching boat',
    'An original adult cyclist racing around a broad velodrome turn',
    'An original adult courier sliding beneath a closing station gate',
    'An original adult mountain guide planting a flag at a windy summit',
    'An original adult mechanic swinging a heavy workshop door clear of the path',
    'An original adult dancer finishing a fast turn on an open stage',
    'An original adult rower driving an oar through choppy water',
    'An original adult climber securing a rope above a steep ravine',
    'An original adult rescue worker guiding a small drone above a flooded road',
  ],
  mecha: [
    'An original compact utility mech lifting a damaged rail beam in a repair yard',
    'A small uncrewed survey drone crossing a red-rock canyon at dusk',
    'An original adult pilot inspecting a broad-shouldered maintenance mech in a hangar',
    'A pair of unmanned cargo robots moving a crate through a bright orbital station',
    'An original rescue mech carrying a floodlight across a snowy ridge',
    'A compact tracked rover climbing a loose volcanic slope',
    'A walking construction machine setting a steel support beside a new bridge',
    'An original adult mechanic opening a service panel on a weathered field robot',
    'A small exploration drone hovering above a broad desert basin',
    'A heavy cargo exosuit walking through a rain-soaked harbor yard',
    'An original unmanned survey craft passing above a distant ring-shaped moon',
    'A pair of compact repair robots working beneath a grounded research aircraft',
    'An original adult pilot standing beside a slim training mech, full silhouettes clear',
    'A mining rover illuminating a quiet underground tunnel with twin work lamps',
    'An original orchard robot tending a row of young trees on a hillside',
    'A small inspection drone moving along the outside of a glass research dome',
    'A heavy-lift robot carrying a wind turbine blade across a field',
    'An original rescue walker stepping through shallow floodwater near a town',
    'A compact lunar rover passing a line of low scientific instruments',
    'A pilotless cargo craft descending toward a remote mountain landing pad',
    'A maintenance mech paused beside a long row of charging bays',
    'Two original adult technicians checking the articulated hand of a service robot',
    'A small reconnaissance machine crossing a windswept salt flat',
    'A utility exoskeleton carrying equipment through a narrow industrial corridor',
  ],
  fantasy: [
    'An original adult mapmaker crossing a mossy bridge toward a hillside observatory',
    'A young adult herbalist gathering glowing leaves beside a clear stream',
    'A broad-winged griffin resting on a cliff above a green valley',
    'An original adult ranger guiding a lantern-lit boat through forest mist',
    'A quiet hilltop library built around a single ancient tree',
    'An original adult smith shaping a bright metal key in an open workshop',
    'A small dragon carrying a bundle of letters above a walled village',
    'An adult traveler meeting a giant tortoise at a woodland crossroads',
    'A stone observatory aligned with a bright comet above a mountain lake',
    'An original adult scout following luminous tracks through a broad meadow',
    'A forest archway framing a distant waterfall and stepped hillside',
    'An original adult healer tending a tired pack animal at a trail shelter',
    'A small river ferry guided by a friendly water spirit',
    'A high bridge joining two cliffside towns above drifting clouds',
    'An original adult scholar discovering a hidden garden beneath a ruined tower',
    'A pair of broad-horned mountain beasts standing beneath a pale aurora',
    'A traveling musician resting beside a campfire under tall pines',
    'A small stone village gathered around a clear spring and footbridge',
    'An original adult falconer releasing a bird above a green coastal bluff',
    'A giant flowering tree rising behind a quiet hillside farm',
    'A group of original adult travelers crossing a rope bridge above a ravine',
    'A bright crystal cave with a narrow path leading toward an underground lake',
    'An original adult astronomer studying a star chart on a mountain roof',
    'A windmill turning above a patchwork valley with a winding stream',
  ],
  'dark-fantasy': [
    'An original adult ferryman guiding a small boat through a flooded stone tunnel',
    'A lone bell tower rising above a quiet mist-covered village',
    'An original adult archivist carrying a lantern through a vast underground library',
    'A weathered bridge crossing a black river beneath bare winter trees',
    'A pale moth resting on the cracked window of an abandoned conservatory',
    'An original adult watchkeeper standing at a rain-soaked city gate',
    'A ruined observatory with its brass telescope pointed toward a clouded moon',
    'A stone stair descending into a cavern lit by sparse blue crystals',
    'An original adult traveler approaching a distant lighthouse through sea fog',
    'A flock of crows circling above an empty hilltop chapel',
    'An old iron footbridge over a gorge filled with low drifting mist',
    'A solitary tree growing through the roof of a collapsed stone hall',
    'An original adult herbalist gathering pale mushrooms along a forest path',
    'A broken clock face half-buried in dark grass beside a ruined station',
    'A narrow boat moored below a tall cliffside cemetery wall',
    'A dark greenhouse with one living vine reaching toward a high window',
    'An original adult messenger walking through an empty market beneath storm clouds',
    'A black hound standing at the edge of a moonlit field',
    'A long-abandoned signal tower above a rocky winter coastline',
    'A small lantern glowing in the window of a remote mountain cabin',
  ],
  'retro-game': [
    'A side-view platform route across mossy stone ledges above a clear stream',
    'A compact top-down forest path with a bridge, two clear forks, and a small shrine',
    'A tiny racing craft rounding a bright canyon track, full vehicle silhouette readable',
    'A side-view workshop level with ladders, moving lifts, and broad platforms',
    'A top-down harbor map with docks, boats, and a winding route between piers',
    'A simple dungeon room with a central switch, two doors, and visible floor pattern',
    'A side-view mountain climb with ladders, snow ledges, and a small summit hut',
    'A compact puzzle board of colored blocks arranged around one empty space',
    'A top-down farm map with crop rows, a barn, and intersecting footpaths',
    'A side-view underwater stage with a clear reef tunnel and open swimming lane',
    'A small spaceship hangar scene with one craft, repair tools, and a wide exit',
    'A top-down city block with a plaza, train entrance, and readable street routes',
    'A side-view castle courtyard with a bridge, tower, and broad walkable platforms',
    'A compact ice-rink level with rails, gates, and a clear lap path',
    'A top-down desert outpost with tents, water tanks, and a looping route',
    'A side-view forest level with stump platforms, a footbridge, and layered trees',
    'A small strategy map showing a river crossing, three settlements, and open terrain',
    'A compact maze of glowing corridors with one clearly marked central chamber',
    'A top-down island map with a lighthouse, a cove, and a looping coastal trail',
    'A side-view rail-yard level with a handcar, low ramps, and visible track switches',
  ],
  'game-ui': [
    'A single-screen fantasy inventory layout with item slots, a character silhouette, no readable text',
    'A clean tactical map interface with terrain blocks, route lines, and blank label panels',
    'A game pause menu over a quiet forest scene with four empty button shapes',
    'A compact character-selection screen with three original adult silhouettes and blank name bars',
    'A readable health and equipment HUD arranged around an original rescue pilot portrait',
    'A blank quest-log screen with simple icons, short rows, and a parchment-like panel',
    'A strategy game settlement panel showing a small town map and empty resource counters',
    'A clean ability wheel with eight distinct symbols around a central blank circle',
    'A game settings panel with sliders, toggle shapes, and a small landscape preview',
    'A card collection grid of original abstract creatures with empty title strips',
    'A compact minimap overlay with roads, a player marker, and two points of interest',
    'A blank dialogue interface with two original adult portraits and clear response rows',
    'A crafting screen showing three material icons, a central workbench, and empty labels',
    'A high-contrast equipment comparison panel with two item silhouettes and simple stat bars',
    'A game mission briefing screen with an empty map frame and three icon-only objectives',
    'A simple rhythm-game lane with falling geometric notes above a broad timing bar',
    'A readable spell-selection interface with six distinct elemental symbols and empty captions',
    'An arcade score panel beside a compact original flying vehicle and clear progress meter',
    'A platform game level-select screen with a path of six unlabelled landscape tiles',
    'A mobile game shop layout with item silhouettes, blank price tags, and a clear purchase area',
  ],
  'game-direction': [
    'An original adult explorer standing beside a trail marker at the entrance to a forest level',
    'A small repair robot crossing a broad industrial platform above a dark shaft',
    'An overhead view of an island settlement with clear roads, docks, and garden plots',
    'A bright arena with several distinct cover shapes and wide paths between them',
    'A tiny delivery vehicle moving through a readable city block with a raised rail line',
    'A broad field of layered hills with one visible path winding toward a watchtower',
    'An original adult pilot checking equipment beside a compact training aircraft',
    'A clear top-down farming scene with crop rows, paths, a water channel, and a barn',
    'A compact cave room with a bridge, two exits, and a glowing crystal cluster',
    'A small harbor town level with a crane, footbridge, boats, and open plaza',
    'A wide forest clearing staged for a team encounter, with distinct entry routes',
    'An original adult courier riding a bicycle through a broad sunlit park path',
    'A small base camp with tents, a landing pad, and a route into the mountains',
    'A clean side view of an original adult climber traversing a low rocky wall',
    'A simple board-game battlefield with two teams of abstract wooden pieces and clear lanes',
    'A quiet train station level with platform edges, stairs, and a visible exit route',
    'An original adult marine researcher preparing a small submersible beside a dock',
    'A hillside race course with switchbacks, barriers, and a clear finish marker',
    'A small woodland village level with a mill, footbridge, garden, and branching paths',
    'A readable city rooftop route linking vents, low walls, and a maintenance ladder',
  ],
  'essential-art': [
    'An adult potter-free craft worker carving a small wooden bird at a plain bench',
    'A lone cyclist resting beside a broad field of wild grasses',
    'A close view of a hand holding a ripe pear against a simple window light',
    'A small sailboat passing between two tall sea cliffs',
    'An adult gardener planting young herbs in a narrow courtyard bed',
    'A red kite flying above a low green hill and a winding path',
    'A weathered wooden footbridge crossing a clear mountain stream',
    'An adult musician tuning a guitar beside an open backstage door',
    'A close study of a monarch butterfly resting on a leaf',
    'A small city tram passing a row of old brick buildings',
    'An adult runner warming up beside a quiet track at sunrise',
    'A bowl of fresh apples and a folded cloth on a kitchen counter',
    'A mountain cabin seen across a still lake in early morning mist',
    'An adult bicycle mechanic adjusting a wheel at a clean work stand',
    'A cluster of paper lanterns hanging above a narrow evening street',
    'A dog waiting beside its adult owner at a shaded trail junction',
    'A broad tree casting a clear shadow across a quiet village square',
    'A small lighthouse standing at the end of a stone harbor wall',
  ],
};

const FILM_GENRE_SUBJECTS: ReadonlyArray<readonly [RegExp, readonly string[]]> = [
  [
    /film noir/,
    [
      'An original adult private investigator waiting beneath venetian-blind shadows in a rain-streaked office',
      'An adult cab driver paused beside a lone streetlamp while a figure crosses a wet alley',
      'Two original adults meeting beside a late-night train platform under hard overhead lights',
    ],
  ],
  [
    /spaghetti western/,
    [
      'An original adult rider arriving at a dusty frontier station as a steam train pulls away',
      'Two original adult strangers facing each other across a sun-baked western town street',
      'An adult traveler stepping from a weathered stagecoach outside a remote desert settlement',
    ],
  ],
  [
    /80s sci-fi/,
    [
      'An original adult astronaut inside a retrofuturist orbital cockpit with chunky CRT monitors',
      'A small crew of original adults crossing a moonbase corridor lined with analog control panels',
      'An original adult engineer repairing a starship navigation console built from tactile switches and screens',
    ],
  ],
  [
    /technicolor musical/,
    [
      'An original adult singer leading a chorus of dancers across a grand theater stage',
      'An original adult dance pair performing on a decorated rooftop as the orchestra plays below',
      'A lively musical ensemble stepping through a bright station concourse with a conductor in view',
    ],
  ],
  [
    /french new wave/,
    [
      'Two original adult friends talking outside a small Paris cinema as pedestrians pass',
      'An adult traveler walking alone along a narrow Paris street with a compact film camera',
      'An original adult couple sharing coffee at a sidewalk table beside a parked scooter',
    ],
  ],
  [
    /grindhouse|exploitation/,
    [
      'An old muscle car pulling into a roadside diner beneath a flickering sign at night',
      'An adult mechanic closing a remote garage as a dusty car waits beneath a single lamp',
      'A nearly empty drive-in theater with a weathered screen and two cars in the foreground',
    ],
  ],
  [
    /silent film/,
    [
      'An original adult stage magician caught in a harmless slapstick mishap with a collapsing table',
      'An adult theater performer reacting with broad gestures to a runaway hat on an empty stage',
      'Two original adults in a playful physical-comedy chase through a simple parlor set',
    ],
  ],
  [
    /found footage/,
    [
      'Two original adult researchers recording a dark lighthouse stairwell with a handheld camcorder',
      'An adult hiker filming a deserted forest cabin while a flashlight beam crosses the doorway',
      'A pair of original adults searching an empty service tunnel with a small camera and work light',
    ],
  ],
  [
    /kaiju/,
    [
      'An original giant sea creature stepping beside a miniature harbor built from model buildings',
      'A huge original reptilian creature towering over a compact miniature city block and toy-sized vehicles',
      'An original horned giant emerging behind a small-scale coastal power station and model breakwater',
    ],
  ],
  [
    /kung fu studio epic|shaw brothers/,
    [
      'Two original adult martial artists facing off in a broad courtyard with practice staffs',
      'An original adult martial artist leaping between stone terraces above a training courtyard',
      'A group of original adult students practicing synchronized stances in a mountain hall',
    ],
  ],
  [
    /cyberpunk anime/,
    [
      'An original adult motorcycle courier crossing an elevated city lane beneath oversized analog billboards',
      'An original adult mechanic repairing a compact hoverbike in a neon-lit alley of an older megacity',
      'Two original adult couriers meeting beside a payphone beneath stacked elevated train tracks',
    ],
  ],
  [
    /wes anderson/,
    [
      'A centered adult bellhop standing in the exact middle of a symmetrical pastel hotel lobby',
      'An original adult stationmaster framed symmetrically between matching clocks and platform doors',
      'A centered family group posing in a carefully balanced room with matching windows and lamps',
    ],
  ],
  [
    /blockbuster teal|teal & orange/,
    [
      'An adult rescue pilot beside a damaged aircraft at blue dusk with orange firelight on the wing',
      'A small rescue boat crossing deep blue water toward a warm orange beacon in heavy weather',
      'An adult climber reaching a ridge as orange emergency flares burn against a blue night sky',
    ],
  ],
  [
    /giallo/,
    [
      'An original adult guest following a red-gloved figure through a geometric hotel corridor',
      'A lone adult musician waiting beside a red-lit theater doorway while a shadow crosses the wall',
      'An adult woman discovering an open apartment door at the end of a sharply lit hallway',
    ],
  ],
  [
    /mumblecore/,
    [
      'Two original adult roommates having a quiet conversation beside half-packed moving boxes',
      'An adult couple sharing an unhurried breakfast in a small apartment kitchen',
      'Three original adult friends talking on a front stoop after carrying furniture upstairs',
    ],
  ],
  [
    /space opera/,
    [
      'An original adult starship crew gathered around a large analog navigation console',
      'An original adult pilot standing beside a worn exploration craft beneath a broad ringed planet',
      'A small crew of original adults crossing a hangar toward a waiting deep-space vessel',
    ],
  ],
];

const MATERIAL_SUBJECTS: ReadonlyArray<readonly [RegExp, readonly string[]]> = [
  [
    /glass|crystal/,
    [
      'A thick clear glass block catching crisp reflections against a dark background',
      'A faceted crystal prism splitting a narrow beam of white light across a plain table',
      'A curved glass lens with visible internal reflections on a clean studio surface',
    ],
  ],
  [
    /liquid|fluid/,
    [
      'A continuous ribbon of clear water pouring over a smooth rock into a shallow pool, flow and splash shape visible',
      'A bright blue liquid stream curling through the air and landing in a broad clear basin, unbroken flow visible',
      'A heavy droplet striking a shallow sheet of water, crown splash and circular ripples clearly formed',
      'A steady stream of amber liquid pouring from a tilted metal ladle into a shallow pool, surface ripples visible',
    ],
  ],
  [
    /subsurface|sss/,
    [
      'A thin orange slice held against a bright backlight, translucent pulp and soft scattered glow clearly visible',
      'A pale beeswax candle glowing at the edges beside its small flame, transmitted light visible through the wax',
      'A ripe peach half under warm backlighting, soft flesh and translucent skin visibly scattering light',
      'A small piece of amber resin lit from behind, warm internal glow and fine inclusions visible',
    ],
  ],
  [
    /chrome|metal/,
    [
      'A polished chrome motorcycle helmet reflecting a broad studio light and its surroundings',
      'A brushed steel hand tool with a polished chrome joint and clearly shaped grip',
      'A compact chrome desk lamp with curved metal stem and crisp reflected highlights',
    ],
  ],
  [
    /fur|hair/,
    [
      'A close portrait of an original adult with long windblown curls, individual strands clearly separated',
      'A red fox sitting in winter grass, fine fur along its cheeks and tail plainly visible',
      'A dark horse with a long flowing mane standing against a simple pale background',
    ],
  ],
  [
    /slime|goo/,
    [
      'A translucent green gel droplet stretching from a broad soft blob, glossy surface and elastic strands visible',
      'Several clear gelatinous forms pressed together on a plain dark surface, smooth edges and internal bubbles visible',
      'A bright blue slime-like mass slowly flowing over a clean geometric ledge, cohesive glossy surface visible',
    ],
  ],
  [
    /carbon fiber/,
    [
      'A close view of a carbon-fiber bicycle frame showing diagonal weave around the joints',
      'A lightweight racing helmet with visible carbon-fiber weave and a clear visor',
      'A compact drone body with carbon-fiber panels, edges and woven surface clearly visible',
    ],
  ],
  [
    /hologram/,
    [
      'A blue holographic mountain map projected above an open hand, terrain contours clearly visible',
      'A small holographic human figure standing above a dark circular projector base',
      'A luminous wireframe globe hovering over a simple tabletop projector',
    ],
  ],
  [
    /porcelain/,
    [
      'A white porcelain teacup with a thin handle and fine glaze highlights on a plain surface',
      'A small crackle-glazed porcelain bird sculpture with a clear silhouette and delicate surface lines',
      'A sculpted porcelain mask resting upright against a neutral background, smooth glaze and fine relief visible',
      'A white porcelain dinner plate with a raised botanical relief and softly glazed rim',
    ],
  ],
  [
    /caustic/,
    [
      'Sunlight refracted through a clear swimming pool, bright caustic patterns crossing the pale floor',
      'A glass prism casting a web of focused light across a dark wall',
      'Clear water rippling above a tiled pool floor with moving bands of refracted light',
    ],
  ],
  [
    /ice sculpture/,
    [
      'A carved ice arch with clear edges, trapped bubbles, and light passing through its thick supports',
      'A life-size ice heron sculpture with transparent feathers and a clean upright silhouette',
      'A faceted ice sculpture shaped like a curling wave on a dark plinth',
    ],
  ],
  [
    /bronze statue/,
    [
      'A small bronze horse statue with a raised foreleg and visible green patina in its recesses',
      'A bronze adult dancer sculpture captured mid-turn, flowing limbs and cast-metal surface visible',
      'A seated bronze owl sculpture with crisp feather relief and a weathered base',
    ],
  ],
  [
    /marble statue/,
    [
      'A marble sculpture of an adult runner leaning into a stride, carved folds and stone grain visible',
      'A carved marble horse head with clear planes and fine gray veins',
      'A marble hand study with fingers gently curved, chisel marks and pale veins visible',
    ],
  ],
];

type NamedSubjectRule = readonly [RegExp, readonly string[]];

const NAMED_SUBJECTS: Partial<Record<string, readonly NamedSubjectRule[]>> = {
  pack_02: [
    [
      /90s sitcom|analog sitcom multicam/,
      [
        'Three original adult roommates squeezed together on a small living-room couch while a studio camera faces them',
        'An original adult family sharing a meal on a clearly staged sitcom living-room set',
      ],
    ],
    [
      /news broadcast|local news chroma key/,
      [
        'Two original adult news anchors at a desk with a blank weather map on the display behind them',
        'An adult field reporter standing beside a blank city map while a camera operator films',
      ],
    ],
    [
      /soap opera/,
      [
        'Two original adults meeting in a hospital corridor, one holding a sealed envelope',
        'An adult couple having a tense conversation in a carefully dressed apartment doorway',
      ],
    ],
    [
      /reality tv confessional/,
      [
        'An original adult contestant speaking from a chair toward a visible interview camera',
        'An adult cook giving a confessional interview beside a brightly lit competition kitchen',
      ],
    ],
    [
      /hype williams|fisheye glam video/,
      [
        'An original adult singer leaning close to a wide-angle video camera on a crowded stage',
        'An adult dancer performing at the center of a circular crowd beneath concert lights',
      ],
    ],
    [
      /cctv|security cam/,
      [
        'An overhead security-camera view of a quiet station entrance with paths and exits visible',
        'A fixed security-camera view of a library lobby with doors and reception desk clearly visible',
      ],
    ],
    [
      /vhs home video/,
      [
        'An adult family filming a birthday cake and gathered relatives in a small living room',
        'Two original adult friends recording a backyard cookout with a shoulder-mounted home camera',
      ],
    ],
    [
      /public access tv|home movies/,
      [
        'An original adult host demonstrating a homemade model on a modest local television set',
        'An original adult family filming a casual meal together around a kitchen table',
      ],
    ],
    [
      /infomercial/,
      [
        'An adult presenter demonstrating an unbranded countertop mixer on a bright television set',
        'An original adult host showing a compact cleaning tool beside a simple before-and-after display',
      ],
    ],
    [
      /sports broadcast|vhs sports replay/,
      [
        'A runner crossing a finish line as a sideline camera and small replay monitor capture the moment',
        'A goalkeeper diving toward a ball while a television camera tracks the play from beside the field',
      ],
    ],
    [
      /weather channel|weather radar doppler/,
      [
        'A weather presenter beside a blank regional map with a clear storm band moving across it',
        'A radar display showing a spiral rain band approaching a small coastal town, no readable labels',
      ],
    ],
    [
      /mtv.*grunge|interlaced music video/,
      [
        'An original adult grunge band performing in a low-ceiling basement venue beneath simple stage lights',
        'An adult singer performing close to a handheld camera while a drummer plays behind them',
      ],
    ],
    [
      /cooking show|late night infomercial gloss/,
      [
        'An adult cooking host arranging fresh vegetables and a pan on a clean studio counter',
        'An adult presenter preparing a simple meal while overhead studio cameras film the counter',
      ],
    ],
    [
      /nature documentary/,
      [
        'An adult field researcher quietly observing a heron at the edge of a marsh',
        'A close view of a fox crossing a forest clearing while a distant documentary crew films',
      ],
    ],
    [
      /public access cable crawl/,
      [
        'A small television displaying a plain color-bar program with an empty crawl strip along the bottom',
        'A local studio monitor showing a simple blank announcement panel beside its control desk',
      ],
    ],
    [
      /emergency broadcast signal break/,
      [
        'A television screen interrupted by a simple warning symbol and broad horizontal signal bars',
        'A control-room monitor showing a blank emergency alert frame beside a bank of switches',
      ],
    ],
    [
      /classic disney golden age cel feature/,
      [
        'An original woodland animal crossing a stone bridge toward a warmly lit cottage',
        'A small group of original animal friends gathering around a lantern in a forest clearing',
      ],
    ],
    [
      /studio ghibli.*nature/,
      [
        'A young adult botanist following a narrow path through an immense green forest',
        'A quiet hillside village surrounded by tall trees, a stream, and a broad summer sky',
      ],
    ],
    [
      /pixar.*family feature/,
      [
        'An original adult family welcoming a small friendly household robot at their front door',
        'A parent and child repairing a little toy vehicle together at a kitchen table',
      ],
    ],
    [
      /laika.*stop-motion/,
      [
        'A handmade puppet explorer standing on a miniature set beside a tiny winding staircase',
        'Two crafted puppets sharing a lantern beneath the branches of a small model forest',
      ],
    ],
    [
      /looney tunes/,
      [
        'An original elastic cartoon anteater dodging a rolling stack of empty barrels, with no familiar franchise animal',
        'A fast-moving cartoon platypus and a sleepy armadillo racing across a simple dirt track, both original silhouettes',
      ],
    ],
    [
      /fleischer.*rubber hose/,
      [
        'A lanky original cartoon jazz singer dancing beside a small upright piano',
        'A long-limbed cartoon street musician playing a horn beneath a city lamp',
      ],
    ],
    [
      /spider-verse/,
      [
        'An original masked adult hero swinging between two broad city rooftops',
        'An original adult climber leaping across a row of elevated city fire escapes',
      ],
    ],
    [
      /upa style/,
      [
        'A geometric adult commuter waiting beside a simple city tram and sharply shaped buildings',
        'An original office worker crossing a plaza of clear circles, rectangles, and flat facades',
      ],
    ],
    [
      /south park/,
      [
        'An original adult postal worker pushing a bicycle through a snowy mountain-town street, with simple cut-paper shapes',
        'An original adult gardener carrying seedlings past a plain mountain-town storefront in flat cut-paper layers',
      ],
    ],
    [
      /ugly-cute creature/,
      [
        'One original floppy moss-green forest creature peeking from a fallen log, with asymmetrical eyes and an awkward but friendly silhouette; no pool',
      ],
    ],
    [
      /ed, edd n eddy/,
      [
        'An original adult bicycle mechanic trying to balance a stack of mismatched tires in a neighborhood workshop, with wobbly cartoon contours',
      ],
    ],
    [
      /cow and chicken/,
      [
        'An original purple lizard and orange armadillo tangled in a springy garden hose, loud primary colors and elastic slapstick silhouettes',
      ],
    ],
    [
      /catdog/,
      [
        'One original two-toned accordion-bodied cartoon robot with a single expressive head stretching between two shelves, impossible elastic bends visible',
      ],
    ],
    [
      /spongebob/,
      [
        'An original adult cook reacting to burnt toast in one extreme gross-up close view, face comically distorted with dense hand-painted pores and lumpy texture',
      ],
    ],
    [
      /beavis and butt-head/,
      [
        'One original bored adult ticket clerk slouching beside a plain bus-terminal counter, awkward flat cartoon linework and no teenage duo or couch',
      ],
    ],
    [
      /dr\. katz/,
      [
        'An unbranded desk fan wobbling beside a plain coffee mug, both drawn with visibly jittering repeated pencil contours against a sparse wall',
      ],
    ],
    [
      /angela anaconda/,
      [
        'An original adult street sweeper with a grayscale photocopied face on a hand-colored paper-cut body, standing beside a simple city curb',
      ],
    ],
    [
      /papercraft animation/,
      [
        'A cut-paper boat sailing through a handmade paper river between folded trees',
        'Two layered paper characters crossing a cardboard footbridge in a tiny stage set',
      ],
    ],
    [
      /flash animation/,
      [
        'An original simple cartoon figure trying to carry an oversized stack of folders',
        'A cheerful cartoon dog chasing a bouncing ball through a spare living room',
      ],
    ],
    [
      /oil paint animation/,
      [
        'A windmill turning above a broad field as clouds move over the hills',
        'An adult painter walking through a garden path at the edge of a village',
      ],
    ],
    [
      /pixel art animation/,
      [
        'A tiny original pixel character running across a bridge above a bright stream',
        'A small pixel-art bird flapping above a compact rooftop garden',
      ],
    ],
    [
      /rotoscop/,
      [
        'An original adult cyclist turning through a plain contemporary intersection, photographic motion visibly traced with hand-drawn contours that follow the body and bicycle',
      ],
    ],
    [
      /daguerreotype/,
      [
        'A contemporary adult repair technician in a plain jacket posing beside a modern folding bicycle against a neutral wall',
        'A present-day adult musician seated with a compact keyboard against a simple studio backdrop',
      ],
    ],
    [
      /tintype/,
      [
        'Two contemporary adult commuters standing beside an electric bicycle near a concrete station entrance',
        'A present-day adult gardener holding a plain watering can against a simple workshop wall',
      ],
    ],
    [
      /autochrome/,
      [
        'A contemporary adult gardener in a plain T-shirt standing among flowers beside a modern glass greenhouse',
        'A present-day adult cyclist resting beneath a flowering street tree beside a compact city bicycle',
      ],
    ],
    [
      /kodachrome/,
      [
        'A contemporary adult traveler standing beside a modern compact hatchback at a sunlit coastal overlook',
        'Two present-day adult friends unloading backpacks beside a modern electric car near a colorful summer hillside',
      ],
    ],
    [
      /polaroid/,
      [
        'Two original adult friends smiling in a close instant-film portrait at a kitchen party',
        'An adult musician holding a guitar in a casual square-framed backstage portrait',
      ],
    ],
    [
      /disposable camera/,
      [
        'A group of original adult friends gathered beside a bonfire on a beach at dusk',
        'An adult family posing together at a summer picnic with a disposable camera visible',
      ],
    ],
    [
      /lomo(graphy)?/,
      [
        'An adult cyclist descending a steep city street between colorful storefronts',
        'A red tram curving through a narrow neighborhood street after rain',
      ],
    ],
    [
      /wet plate collodion|silver plate tonality/,
      [
        'An adult railway worker standing beside an early steam locomotive at a rural station',
        'An original adult botanist holding a specimen leaf against a dark studio backdrop',
      ],
    ],
    [
      /infrared film/,
      [
        'A white-barked forest path winding beneath bright foliage and a deep open sky',
        'An adult hiker crossing a tree-lined meadow under a wide summer cloud bank',
      ],
    ],
    [
      /cyanotype \(photo\)/,
      [
        'A contact print of fern leaves and seed heads arranged on a broad sheet of light-sensitive paper',
        'A photographic silhouette of a bicycle wheel and stems against a deep blue field',
      ],
    ],
    [
      /early digital/,
      [
        'An adult commuter waiting beside a city bus beneath a row of bright station lights',
        'A compact camera on a desk beside a low-resolution photo displayed on a small monitor',
      ],
    ],
    [
      /pinhole camera/,
      [
        'A quiet courtyard seen from inside a dark room through a tiny circular opening',
        'A winding city street and distant clock tower seen through a pinhole-camera perspective',
      ],
    ],
    [
      /golden hour/,
      [
        'An adult cyclist riding along a grassy ridge in the last warm light of day',
        'A small harbor and moored boats glowing in the low light before sunset',
      ],
    ],
    [
      /blue hour/,
      [
        'A city tram waiting beneath a deep blue evening sky just after sunset',
        'An adult runner crossing a bridge as the first street lamps come on',
      ],
    ],
    [
      /rembrandt lighting|split lighting|butterfly lighting/,
      [
        'An original adult musician posed in a simple dark portrait studio, face turned toward one lamp',
        'A close portrait of an original adult baker in a quiet kitchen, one side of the face in soft shadow',
      ],
    ],
    [
      /neon noir/,
      [
        'An adult courier standing beneath a red shop sign on a rain-dark city street',
        'A lone taxi turning through a narrow alley beneath blue and magenta signs',
      ],
    ],
    [
      /god rays/,
      [
        'A narrow forest path crossed by strong shafts of sunlight between tall trees',
        'An adult traveler walking through a broad stone hall where high windows cast visible beams',
      ],
    ],
    [
      /silhouette/,
      [
        'An adult climber standing in profile on a ridge against a bright open sky',
        'A dancer pausing in the doorway of a lit theater with their full outline visible',
      ],
    ],
    [
      /double exposure/,
      [
        'A clear adult profile portrait blended with the branching shape of a forest canopy',
        'A close adult portrait overlaid with a city skyline and a broad evening moon',
      ],
    ],
    [
      /bokeh/,
      [
        'A macro view of a dew-covered seed head against broad circles of colored garden light',
        'A close view of a small glass-winged insect against a soft field of reflected lights',
      ],
    ],
    [
      /day for night/,
      [
        'A quiet city park and footbridge rendered beneath a dark moonlit-looking sky',
        'An empty country road beneath a deep blue evening sky with visible tree silhouettes',
      ],
    ],
    [
      /candlelight/,
      [
        'An adult reader studying a map beside one burning candle in a dark room',
        'Two original adults sharing a quiet meal around a small candlelit table',
      ],
    ],
    [
      /bioluminescence/,
      [
        'Blue bioluminescent waves curling along a dark beach beneath a sparse star field',
        'An adult diver swimming above glowing plankton in clear night water',
      ],
    ],
    [
      /strobe light/,
      [
        'An adult dancer frozen mid-turn beneath a single bright stage strobe',
        'A drummer striking a cymbal on a dark stage with the motion sharply paused',
      ],
    ],
    [
      /prism effect/,
      [
        'A clear glass prism splitting a narrow sunbeam into colored bands across a white wall',
        'An adult child holding a small prism that throws light onto a garden path',
      ],
    ],
    [
      /rim lighting/,
      [
        'A dark horse standing at the edge of a field with a bright outline around its mane',
        'An adult cyclist beside a bicycle, both silhouettes edged by a low setting sun',
      ],
    ],
    [
      /underwater light/,
      [
        'An adult diver swimming through a clear reef while bright surface rays reach the seabed',
        'A turtle passing over pale sand beneath shafts of light in shallow blue water',
      ],
    ],
    [
      /light painting/,
      [
        'An adult photographer drawing a long curved light trail with a handheld lamp in a dark field',
        'A bicycle wheel traced by a bright circular light in a black studio',
      ],
    ],
    [
      /softbox studio/,
      [
        'An original adult tailor posing beside a clean gray studio backdrop and simple soft light',
        'A pair of unbranded running shoes arranged on a neutral studio sweep',
      ],
    ],
    [
      /anamorphic overflare/,
      [
        'A night bus approaching with bright headlights that stretch across the dark wet road',
        'A singer standing beneath a row of stage lamps that flare across the lens',
      ],
    ],
    [
      /political satire/,
      [
        'Two original adult city candidates debating beside a blank campaign lectern',
        'An original adult mayor struggling to hold an oversized ceremonial key at a town meeting',
      ],
    ],
    [
      /liquid melt caricature/,
      [
        'An original cartoon adult face drooping comically as if softened by a hot afternoon',
        'A close exaggerated cartoon portrait with eyebrows and cheeks stretching into elastic curves',
      ],
    ],
    [
      /ugly-cute creature|crude crayon monster|mucus monster|classroom freakout/,
      [
        'An original odd little creature peeking from behind a school desk with its full silhouette visible',
        'A lumpy friendly monster standing beside a small farmhouse gate under a cloudy sky',
        'A bright goo creature bobbing in an empty public swimming lane',
      ],
    ],
    [
      /kindergarten family portrait|toxic suburb family/,
      [
        'An original adult family posing together outside a modest suburban home',
        'Two original adults and their child gathered around a kitchen table for a family portrait',
      ],
    ],
    [
      /rejected corporate mascot/,
      [
        'An awkward original company mascot waving beside a plain office reception desk',
        'A strange cheerful animal mascot standing alone in a blank trade-show booth',
      ],
    ],
    [
      /office boredom|therapy doodle/,
      [
        'An original adult office worker staring blankly at a stack of folders beside a potted fern',
        'An adult therapist listening to a client in two plain chairs inside a small office',
      ],
    ],
    [
      /notebook anxiety/,
      [
        'An original young adult student gripping a blank notebook before an empty classroom',
        'A close view of a blank notebook covered with anxious margin doodles beside a school desk',
      ],
    ],
    [
      /photo-cutout/,
      [
        'A layered paper-cut portrait of an original child with a sharply outlined face and coat',
        'An original child-sized figure assembled from mismatched photo-cut paper pieces in a classroom',
      ],
    ],
    [
      /jawbreaker scam/,
      [
        'Three original neighborhood kids trying to carry one enormous striped jawbreaker',
        'An adult corner-shop owner watching a group of kids pitch a homemade candy scheme',
      ],
    ],
    [
      /beige suburban anxiety/,
      [
        'An original adult office worker returning to a bland suburban kitchen after a long day',
        'An adult neighbor standing awkwardly beside a beige lawn and a silent garage door',
      ],
    ],
    [
      /sewer kid grotesque/,
      [
        'An original small sewer creature climbing a ladder toward a round street-level drain',
        'Two odd original underground creatures peeking from a maintenance tunnel beneath a city',
      ],
    ],
    [
      /shared-body|dayjob chaos/,
      [
        'Two original oddball coworkers squeezed behind one small office desk during a hectic workday',
        'A pair of mismatched cartoon creatures sharing one long body while carrying grocery bags',
      ],
    ],
    [
      /grunge close-up grossout|garbage pail|veiny close-up/,
      [
        'A close exaggerated cartoon face with bulging eyes, wrinkled cheeks, and comically visible veins',
        'An original cartoon adult grimacing in close-up with puffed cheeks and messy hair',
      ],
    ],
    [
      /couch slouch/,
      [
        'Two original adult friends slouching on a couch while a television glows in the corner',
        'An original adult pair sitting silently on a couch amid scattered snack wrappers',
      ],
    ],
    [
      /spiky edgy attitude/,
      [
        'An original punk cartoon adult with a tall spiky hairstyle leaning against a brick wall',
        'An original cartoon skater with sharp hair tufts standing beside a scratched board',
      ],
    ],
    [
      /flipbook rough animation/,
      [
        'An open flipbook showing an original cartoon runner in several successive poses',
        'An adult hand rapidly flipping through a small sketchbook of a bouncing ball',
      ],
    ],
    [
      /cave painting/,
      [
        'An ancient stone cave wall bearing simple animal silhouettes and hand marks',
        'A prehistoric painted bison and running deer arranged across a rough cave surface',
      ],
    ],
    [
      /skateboard deck graphic/,
      [
        'A wooden skateboard deck shown from above with an original bold animal graphic',
        'An adult skater carrying a decorated board beside a concrete ramp',
      ],
    ],
    [
      /napkin.*blueprint/,
      [
        'A rough mechanical diagram sketched on a paper napkin beside a coffee cup and pencil',
        'An adult inventor drawing a simple folding bicycle plan on a café napkin',
      ],
    ],
    [
      /punk zine/,
      [
        'An open handmade zine spread with torn paper portraits, clipped shapes, and blank caption strips',
        'An adult artist arranging photocopied cutouts and tape into a small punk zine page',
      ],
    ],
    [
      /night vision/,
      [
        'A night-vision view of an adult search team crossing a forest clearing, figures and path distinct',
        'A green low-light view of a small boat moving toward a dock after dark',
      ],
    ],
    [
      /silly scribble|office whiteboard doodle/,
      [
        'An adult office worker drawing a quick cartoon on a crowded whiteboard beside blank task boxes',
        'A loose doodle of a bicycle and smiling sun beside simple notes on a whiteboard',
      ],
    ],
    [
      /crumpled-paper scribble/,
      [
        'A rough pencil drawing of a tiny house and winding path on a crumpled sheet of paper',
        'An adult hand sketching a quick cartoon bird across a wrinkled paper page',
      ],
    ],
    [
      /uncanny valley/,
      [
        'An original doll-like adult portrait with an almost-natural smile in an empty studio',
        'An original mannequin-faced performer standing beneath a single plain hallway light',
      ],
    ],
    [
      /rubber-hose insanity/,
      [
        'An original long-limbed cartoon adult dancing beside a small upright piano',
        'A lanky cartoon street musician bending around a curved brass horn',
      ],
    ],
    [
      /grotesque exaggeration/,
      [
        'An original cartoon face with an oversized nose, uneven ears, and a delighted expression',
        'An original adult caricature with a long chin and oversized round glasses, shoulders visible',
      ],
    ],
    [
      /newspaper sunday funnies/,
      [
        'Three original neighborhood characters reacting to a runaway garden hose in a simple comic strip',
        'An original adult shopkeeper and two customers sharing a small visual gag at a counter',
      ],
    ],
    [
      /meat puppet/,
      [
        "A grotesque homemade creature puppet with stitched seams held at arm's length in a plain room",
        'An original soft monster puppet slumped on a worktable beside scraps of fabric and thread',
      ],
    ],
    [
      /toddler crayon panic/,
      [
        'An original small child clutching a handful of crayons beside a page of oversized doodles',
        'An original toddler watching a bright crayon drawing spill across a sheet of paper',
      ],
    ],
    [
      /cow and chicken|loud primary/,
      [
        'An original farmyard cow and tiny bird reacting to a toppled bucket in bright colors',
        'A cheerful original cow and small chicken racing across a simple barnyard',
      ],
    ],
    [
      /spongebob|gross-up freeze frame/,
      [
        'A close-up of an original cartoon sea creature with puffed cheeks and a comically startled expression',
        'An original undersea character caught mid-blink beside a simple coral ledge',
      ],
    ],
    [
      /courage the cowardly dog|rural nightmare/,
      [
        'An original nervous farm dog peeking from behind a porch post at a strange shadow',
        'A small worried dog standing beside a lonely farmhouse as an odd light glows outside',
      ],
    ],
  ],
  pack_03: [
    [
      /studio lighting \(3 point\)/,
      [
        'A matte grey sculpted bust on a dark studio sweep, its face shaped by a warm key light from the left, a softer fill from the right, and a bright rim from behind; the three lighting roles read separately',
      ],
    ],
    [
      /pixar renderman|feature animation renderer/,
      [
        'An original small robot helping an adult gardener carry seedlings through a bright greenhouse',
        'An original adult family watching a friendly animated animal cross their backyard',
      ],
    ],
    [
      /zbrush|digital clay sculpt/,
      [
        "An expressive clay sculpt of an original adult explorer's head and shoulders on a plain turntable",
        'A digital-clay creature bust with broad planes, deep eye sockets, and a clean silhouette',
      ],
    ],
    [
      /unreal engine 5|unity hdrp/,
      [
        'A real-time game environment with a small research outpost, cliffs, and a winding coastal path',
        'An original adult traveler crossing a detailed forest clearing toward a distant stone gate',
      ],
    ],
    [
      /claymation/,
      [
        'A handmade clay puppet crossing a miniature wooden bridge between two clay trees',
        'A small clay stop-motion kitchen set with an original puppet baker and a loaf of bread',
      ],
    ],
    [
      /low poly/,
      [
        'A faceted low-poly mountain island with a lighthouse, small harbor, and clear waterline',
        'A low-poly rescue helicopter resting on a ridge above a sharply faceted valley',
      ],
    ],
    [
      /voxel/,
      [
        'A compact voxel harbor town with a lighthouse, docks, and a winding block-built path',
        'A voxel forest clearing with a small cabin, footbridge, and blocky stream',
      ],
    ],
    [
      /isometric 3d/,
      [
        'An isometric miniature train station with platform, clock, footbridge, and tiny waiting figures',
        'An isometric cutaway of a compact greenhouse with planted rows, workbench, and glass roof',
        'An isometric workshop corner with tool wall, workbench, stool, and neatly arranged parts',
      ],
    ],
    [
      /wireframe on shaded/,
      [
        'A shaded sphere and stepped cube overlaid with clean visible polygon wireframes',
        'A shaded mechanical wheel with its curved surface topology shown as an even wire grid',
      ],
    ],
    [
      /wireframe render/,
      [
        'A wireframe pedestrian bridge crossing a dark river, every structural beam clearly outlined',
        'A wireframe model of a compact cabin with roof, walls, doors, and window openings visible',
      ],
    ],
    [
      /knolling/,
      [
        'A precise overhead arrangement of camera parts, screws, lens caps, and a small driver tool',
        'A neatly aligned flat lay of bicycle repair tools, cables, bolts, and two gears',
      ],
    ],
    [
      /metaballs/,
      [
        'Several smooth glossy spheres merging into one continuous organic cluster',
        'A set of three rounded liquid forms joining through soft connected necks on a plain surface',
      ],
    ],
    [
      /nurbs surface/,
      [
        'A smooth curved chair shell shown as a continuous surface with clean edges',
        'A streamlined car body study with broad uninterrupted curves and a clear side silhouette',
      ],
    ],
    [
      /fractal 3d/,
      [
        'A branching geometric crystal form repeating into smaller structures against a dark field',
        'A recursive stone arch pattern opening into nested faceted corridors',
      ],
    ],
    [
      /glitch 3d/,
      [
        'A geometric city block with a few displaced building sections and broken alignment',
        'A suspended cube structure with several layers shifted sideways in clean digital fragments',
      ],
    ],
    [
      /toon shader/,
      [
        'An original adult bicycle messenger standing beside a compact delivery bike, full figure visible',
        'An original friendly repair robot holding one oversized wrench in a clean studio space',
      ],
    ],
    [
      /motion graphics/,
      [
        'A composition of colored spheres, rings, and ribbons moving around a clear central point',
        'Several geometric panels and smooth arcs arranged in a readable flowing sequence',
      ],
    ],
    [
      /3d typography/,
      [
        'A short row of large blank sculpted letterforms with thick extruded sides and clear spacing',
        'Three dimensional block letters arranged on steps with visible depth and clean silhouettes',
      ],
    ],
    [
      /3d icon/,
      [
        'A single dimensional compass icon with raised needle and a simple rounded base',
        'A small dimensional backpack icon with clear straps, pockets, and a raised silhouette',
      ],
    ],
    [
      /retro cgi/,
      [
        'A chunky early-computer-era 3D dolphin leaping above a simple checkerboard floor',
        'A low-resolution 3D sports car parked beside a blocky roadside palm tree',
      ],
    ],
    [
      /clay ui/,
      [
        'A tactile game interface panel with rounded buttons, raised sliders, and a blank display area',
        'A small sculpted settings screen with soft raised toggles, knobs, and empty label bars',
      ],
    ],
    [
      /papercraft 3d/,
      [
        'A folded paper lighthouse standing on a layered paper cliff above a cutout sea',
        'A small paper city block assembled from folded buildings, trees, and a bridge',
      ],
    ],
    [
      /lego brick-built/,
      [
        'A brick-built harbor rescue station with a boat, tower, and low seawall',
        'A block-built mountain railway crossing a bridge above a tiny village',
      ],
    ],
    [
      /origami 3d/,
      [
        'A folded paper crane standing beside several geometric paper leaves',
        'A small origami sailboat on a folded paper wave beneath angular paper clouds',
      ],
    ],
    [
      /ambient occlusion/,
      [
        'A matte gray model of a compact bus with soft contact shadows beneath its wheels',
        'Three gray geometric blocks meeting at a corner with clear dark creases and contact shadows',
      ],
    ],
    [
      /diorama lighting/,
      [
        'A miniature railway station, trees, platform, and tiny figures arranged on one display base',
        'A small cutaway garden scene with a footbridge, stream, and model trees on a square plinth',
      ],
    ],
    [
      /architectural visualization|archviz/,
      [
        'An industrial loft interior with exposed beams, broad factory windows, and a clear open floor plan',
        'A compact modern library interior with long shelves, central stair, and tall glazed facade',
        'A brick workshop conversion with steel columns, mezzanine, and large industrial windows',
      ],
    ],
    [
      /kitbash/,
      [
        'A compact industrial rover assembled from distinct panels, wheels, vents, and exposed fasteners',
        'A modular spacecraft engine built from layered pipes, plates, and service hatches',
      ],
    ],
    [
      /game asset/,
      [
        'A single unbranded bronze-colored key with a clear silhouette on a neutral game asset turntable',
        'A compact sci-fi field radio shown alone with antenna, grip, screen, and buttons visible',
      ],
    ],
    [
      /product render/,
      [
        'Unbranded over-ear headphones on a clean surface, cushions and headband fully visible',
        'A compact silver camera with a short lens and clearly separated controls',
      ],
    ],
    [
      /automotive render/,
      [
        'An unbranded electric hatchback shown in three-quarter view on a simple studio sweep',
        'A compact rally car parked on a clean gravel turnout with wheels and body shape visible',
      ],
    ],
    [
      /jewelry render/,
      [
        'A simple silver ring with a clear polished band on a neutral studio surface',
        'A pair of unbranded gold earrings arranged beside a folded dark cloth',
      ],
    ],
    [
      /hard surface modeling/,
      [
        'A mechanical service robot with articulated panels, bolts, vents, and visible joint covers',
        'A compact field generator with clear housing panels, fasteners, and cooling fins',
      ],
    ],
    [
      /exploded view/,
      [
        'A compact desk fan separated into aligned motor, blade, grille, switch, and base components',
        'An exploded technical view of a small camera with lens, body, controls, and fasteners spaced apart',
      ],
    ],
    [
      /cybernetic implant/,
      [
        'A small modular forearm prosthetic with visible hinge, grip sensor, and replaceable panels',
        'A close design study of a mechanical knee implant with clear joints and attachment points',
      ],
    ],
    [
      /glassmorphism ui/,
      [
        'A translucent dashboard of three floating panels with simple charts and blank headings',
        'A clear glass-like settings window over a muted desktop with toggles and empty rows',
      ],
    ],
    [
      /neon sign 3d/,
      [
        'A bright unlettered neon outline of a mountain above a small roadside diner entrance',
        'A glowing geometric fish sign mounted on a dark brick wall at night',
      ],
    ],
    [
      /character design \(t-pose\)/,
      [
        'An original adult mechanic standing in a neutral full-body pose, front and side silhouettes clear',
        'An original adult mountain guide in a neutral T-pose with both arms extended horizontally, plain outdoor clothing and empty hands',
      ],
    ],
    [
      /medical illustration 3d/,
      [
        'A clean anatomical model of a human knee joint with bones, cartilage, and tendons visible',
        'A translucent 3D study of a hand showing bones and major tendons in a neutral pose',
      ],
    ],
    [
      /food cgi/,
      [
        'A sliced citrus fruit with glossy pulp and a few droplets on a clean studio surface',
        'A golden croissant broken once to show its layered interior beside a plain plate',
      ],
    ],
    [
      /collectible avatar/,
      [
        'An original adult explorer avatar bust with distinctive scarf, coat collar, and neutral background',
        'An original small forest-creature avatar with a clear silhouette and plain display base',
      ],
    ],
    [
      /digital fashion/,
      [
        'An original adult model standing in a sculptural pleated coat, full garment silhouette visible',
        'An original adult model wearing a layered technical outfit with clear seams and fabric panels',
      ],
    ],
    [
      /organic modeling/,
      [
        'An original smooth creature bust with broad cheek forms, curled horns, and a clear silhouette',
        'A stylized tree root form twisting into an open loop against a plain background',
      ],
    ],
    [
      /balloon art|inflatable/,
      [
        'A balloon-built giraffe sculpture with visible twisted segments and a clean full silhouette',
        'A small balloon dog sculpture made from connected glossy inflated sections',
      ],
    ],
    [
      /neon city/,
      [
        'A dense high-rise street with elevated trains, stacked signs, and a rain-dark road',
        'A narrow night market street beneath bright signs and layered apartment towers',
      ],
    ],
    [
      /bioluminescent forest/,
      [
        'A forest trail lined with glowing fungi, roots, and small blue points of light',
        'An adult hiker crossing a dark grove where luminous plants trace the path',
      ],
    ],
    [
      /virtual reality environment/,
      [
        'An original adult standing inside a spacious virtual gallery with floating landscape windows',
        'A calm virtual training room with a central platform, hand controls, and broad open space',
      ],
    ],
    [
      /scientific visualization/,
      [
        'A clear 3D cutaway of branching airways inside a translucent chest silhouette',
        'A scientific model of ocean currents wrapping around a small island and seafloor ridge',
      ],
    ],
    [
      /environment design/,
      [
        'A quiet cliffside research base connected by a footbridge above the sea',
        'A mountain transit station integrated into a steep forest slope',
      ],
    ],
    [
      /3d map/,
      [
        'A raised-relief island map showing coastline, hills, roads, and a small harbor',
        'A 3D terrain model of a mountain valley with a river, pass, and marked settlements',
      ],
    ],
    [
      /abstract background/,
      [
        'A spacious field of layered translucent curves and soft geometric forms with a clear center',
        'Broad bands of color and floating shapes arranged as an open background composition',
      ],
    ],
    [
      /3d scan|photogrammetry/,
      [
        'A scanned stone footbridge presented with visible surface detail and a clean isolated silhouette',
        'A photogrammetric model of a weathered tree stump shown alone on a neutral turntable',
      ],
    ],
    [
      /vfx simulation.*fire|vfx simulation/,
      [
        'A compact burst of flame and smoke rising from a dark ground plane, full plume visible',
        'A rolling gray smoke plume curling above a small controlled fire in an open field',
      ],
    ],
  ],
  pack_04: [
    [
      /modern superhero \(digital\)/,
      [
        'An original adult superhero in an unbranded two-color suit poised on a broad rooftop, full heroic silhouette and expressive digital-comic inking clearly visible',
      ],
    ],
    [
      /underground comix/,
      [
        'An original adult bus passenger juggling too many shopping bags at a crooked bus stop, satirical expressions and rough uneven DIY ink marks visible',
      ],
    ],
    [
      /whimsical ink/,
      [
        'A crooked little greenhouse and one curious bird drawn mainly in expressive black pen contours, with only sparse pale color accents',
      ],
    ],
    [
      /speedpaint/,
      [
        'A mountain rescue outpost blocked in with broad fast brushstrokes, visible unfinished edges and large exploratory color masses rather than photo detail',
      ],
    ],
    [
      /blueprint schematic/,
      [
        'A clean engineering blueprint of a compact rescue boat with plan, side, and hull-section views',
        'A technical blueprint of a small pedestrian bridge with dimensions, supports, and assembly details',
      ],
    ],
    [
      /ui\/hud design/,
      [
        'A game HUD layout with health, map, inventory, and objective panels arranged around an empty center',
        'A cockpit interface sheet with instrument groups, blank labels, and clear information hierarchy',
      ],
    ],
    [
      /callout detail sheet/,
      [
        'A technical detail sheet of a hiking boot with large sole, lacing, and seam inset views connected by clear leader lines; use only three short legible labels: SOLE, LACE, SEAM, with no filler text or invented dimensions',
        'A technical detail sheet of a compact camera with large lens, button, and port inset views connected by clear leader lines; use only three short legible labels: LENS, BUTTON, PORT, with no filler text or invented dimensions',
      ],
    ],
    [
      /anatomy reference sheet/,
      [
        'An anatomical reference sheet of an adult hand showing palm, back, and finger-joint views, with three clearly connected color-keyed callouts for bone, tendon, and muscle and no empty callout circles or filler text',
        'A clear muscular study of an adult shoulder and arm in relaxed front and side poses, with three clearly connected color-keyed callouts for bone, tendon, and muscle and no empty callout circles or filler text',
      ],
    ],
    [
      /ui\/hud wireframe/,
      [
        'A grayscale wireframe of a game screen with minimap, inventory, status bars, and blank panels',
        'A simple interface wireframe showing menu column, content area, and empty label blocks',
      ],
    ],
    [
      /monster size comparison/,
      [
        'A simple scale chart of three original creature silhouettes and one adult human silhouette standing on the same baseline, ordered from shortest to tallest with a single clear vertical meter ruler; no unrelated detail panels',
        'Several original fantasy beast silhouettes arranged from smallest to largest on one shared baseline beside a human silhouette and a single clear vertical meter ruler; no unrelated detail panels',
      ],
    ],
    [
      /scientific botanical/,
      [
        'A botanical plate of a fern with whole frond, stem, and spore details in separate studies',
        'A clear scientific drawing of a flowering iris with petal, leaf, and root details',
      ],
    ],
    [
      /kurzgesagt|infographic/,
      [
        'An educational diagram showing the layers of a forest canopy and the animals living at each level',
        'A simple visual explainer of the water cycle with clouds, rainfall, river, and ocean',
      ],
    ],
    [
      /pop-up book/,
      [
        'An open pop-up book with a layered forest, folded trees, and a small paper footbridge',
        'An open storybook whose pages rise into a three-dimensional harbor town and lighthouse',
      ],
    ],
    [
      /sticker art/,
      [
        'A sheet of original cheerful animal stickers with clear outlines and separate blank margins',
        'A small collection of playful food, plant, and travel stickers arranged on a clean page',
      ],
    ],
    [
      /claymation style/,
      [
        'A clay puppet gardener standing among miniature clay vegetables and a small fence',
        'Two handmade clay animal puppets crossing a miniature bridge in a tiny forest set',
      ],
    ],
    [
      /paper cutout/,
      [
        'A layered paper-cut landscape with folded hills, a small house, and overlapping trees',
        'An original paper-cut adult traveler crossing a footbridge between stacked paper cliffs',
      ],
    ],
    [
      /art deco poster/,
      [
        'A tall city tower framed by sunburst shapes, stepped borders, and a small adult figure',
        'An elegant ocean liner shown against a symmetrical fan of geometric rays',
      ],
    ],
    [
      /mucha art nouveau/,
      [
        'An original adult botanist framed by a circular border of curling flowers and leaves',
        'An original adult musician surrounded by flowing vines and a broad decorative halo',
      ],
    ],
    [
      /propaganda poster/,
      [
        'An original adult rescue worker raising a hand toward a blank sunburst banner',
        'A group of workers carrying a timber beam together beneath a bold blank banner',
      ],
    ],
    [
      /psychedelic poster/,
      [
        'An adult rock band playing beneath spiraling stage lights and broad flowing shapes',
        'A dancer standing before a large concert stage framed by looping abstract forms',
      ],
    ],
    [
      /minimalist vector/,
      [
        'A single bright red bicycle beside a simple angular tree on a pale field',
        'A lone lighthouse and two broad waves reduced to a few clean geometric shapes',
      ],
    ],
    [
      /collage art \(dada\)/,
      [
        'A surreal paper collage of an adult portrait, a clock face, and cutout cloud shapes',
        'An assembled collage of a bicycle wheel, newspaper-like blank blocks, and a paper moon',
      ],
    ],
    [
      /bauhaus poster/,
      [
        'A geometric composition of a tram, circles, and diagonal rails with a blank title area',
        'A simple concert poster layout built from a piano silhouette, circles, and rectangles',
      ],
    ],
    [
      /national park poster/,
      [
        'A mountain lake and pine ridge framed as a destination view with a blank caption band',
        'A desert canyon trail leading toward a distant mesa beneath a broad clear sky',
      ],
    ],
    [
      /movie poster \(painted\)/,
      [
        'An original adult explorer standing before a storm-dark lighthouse with a blank title area',
        'An original adult pilot beside a grounded aircraft beneath a wide dramatic sky',
      ],
    ],
    [
      /fashion illustration/,
      [
        'An original adult model in a long sculptural coat, full figure and garment silhouette visible',
        'An original adult model wearing a layered evening outfit beside a simple studio backdrop',
      ],
    ],
    [
      /album cover \(surreal\)/,
      [
        'A small sailboat floating above a quiet meadow beneath an oversized pale moon',
        'An adult musician standing inside a room whose open door reveals a calm ocean horizon',
      ],
    ],
    [
      /pulp magazine cover/,
      [
        'An original adult explorer holding a lantern at the mouth of a deep jungle cave',
        'An original adult pilot escaping a storm-battered island with a small supply case',
      ],
    ],
    [
      /travel poster/,
      [
        'A mountain railway curling past a lake and a small alpine station',
        'A coastal footpath leading toward a bright harbor town and distant headland',
      ],
    ],
    [
      /gig poster/,
      [
        'An adult four-piece band performing on a small stage beneath a row of hanging lamps',
        'A close view of a drummer and guitarist playing together in a crowded basement venue',
      ],
    ],
    [
      /street protest stencil/,
      [
        'A peaceful group of adults carrying blank signs along a broad city avenue',
        'An adult speaker addressing a small crowd beside a simple blank placard wall',
      ],
    ],
    [
      /character sheet/,
      [
        'A character turnaround sheet for an original adult harbor pilot in practical work clothes',
        'A front, side, and rear design sheet for an original adult greenhouse caretaker',
      ],
    ],
    [
      /environment concept|rough environment pass/,
      [
        'A cliffside research outpost linked by a narrow bridge above a foggy inlet',
        'A compact hillside transit station surrounded by tall forest and winding paths',
      ],
    ],
    [
      /vehicle design/,
      [
        'A concept sheet for an unbranded electric rescue truck with front, side, and rear views',
        'A compact exploration rover shown in profile beside its wheel and suspension studies',
      ],
    ],
    [
      /creature design iteration|creature design/,
      [
        'An original broad-finned cave creature shown in front, side, and three-quarter views',
        'An original small forest beast with curled horns, long ears, and clear silhouette studies',
      ],
    ],
    [
      /isometric game art/,
      [
        'An isometric game scene of a small harbor, lighthouse, boardwalk, and visible walking routes',
        'An isometric courtyard with stairs, workshop, garden beds, and a central well-free fountain',
      ],
    ],
    [
      /storyboard sketch/,
      [
        'A four-panel storyboard of an adult courier entering a station, checking a map, and boarding a train',
        'A three-frame action sequence of a small boat leaving a harbor as a storm approaches',
      ],
    ],
    [
      /prop design|prop variant/,
      [
        'A design sheet of three original brass-and-wood handheld signal lanterns with distinct silhouettes',
        'A prop study comparing four practical field radios with different handles, dials, and antennas',
      ],
    ],
    [
      /keyframe art/,
      [
        'An original adult climber reaching the summit ridge as a rescue helicopter approaches',
        'An adult diver discovering a bright opening beneath a broad underwater rock arch',
      ],
    ],
    [
      /photobash|paintover iteration/,
      [
        'A proposed mountain station integrated into steep terrain, shown with guide shapes and access paths',
        'A coastal city block combining a ferry terminal, broad seawall, and elevated rail bridge',
      ],
    ],
    [
      /low poly concept/,
      [
        'A low-poly mountain rescue station with a helipad, access road, and steep surrounding ridges',
        'A faceted low-poly island with a small harbor, trees, and angular cliffs',
      ],
    ],
    [
      /weapon design|weapon tier progression/,
      [
        'A design sheet comparing three nonfunctional ceremonial staffs with different heads and grips',
        'Three fantasy shield-and-tool sets arranged by size with clear material and silhouette differences',
      ],
    ],
    [
      /thumbnail silhouette exploration|silhouette iteration sheet/,
      [
        'A grid of distinct full-body silhouettes for an original adult mountain rescuer carrying different packs',
        'A row of creature silhouettes comparing broad, narrow, winged, and horned body shapes',
      ],
    ],
    [
      /gesture energy sketch/,
      [
        'An original adult dancer shown in three loose full-body poses with clear movement arcs',
        'An adult runner changing direction in a sequence of energetic gesture studies',
      ],
    ],
    [
      /material texture exploration sheet/,
      [
        'A grid of wood, weathered steel, woven fabric, and frosted glass material swatches',
        'A set of surface samples comparing painted metal, raw stone, leather, and clear resin',
      ],
    ],
    [
      /mood color script pass/,
      [
        'Three small color panels showing a harbor at dawn, storm, and blue evening',
        'A short sequence of a forest path shifting from warm afternoon to cool night',
      ],
    ],
    [
      /architecture massing model/,
      [
        'A simple block model of a public library with tall hall, low wing, courtyard, and entry path',
        'A massing study of an industrial loft conversion with central stair and open workshop floor',
      ],
    ],
    [
      /costume design exploration/,
      [
        'A costume board comparing three practical coats and packs for an original adult mountain guide',
        'Three uniform concepts for an adult harbor crew, with clear silhouette and layer differences',
      ],
    ],
    [
      /lighting scenario pass/,
      [
        'Three small studies of the same railway platform at dawn, midday, and night',
        'A single forest clearing shown under overcast, low sunset, and lantern light',
      ],
    ],
    [
      /foliage design kit/,
      [
        'A foliage kit sheet of broad leaves, fern fronds, small branches, and ground plants',
        'A set of distinct alpine shrubs, grasses, and pine branches arranged for environment design',
      ],
    ],
    [
      /composition thumbnail grid/,
      [
        'A grid of small compositions framing a lighthouse, cliff path, and distant sea in varied layouts',
        'A set of tiny scene thumbnails featuring a lone cabin, valley, and winding trail',
      ],
    ],
    [
      /world map concept/,
      [
        'A hand-drawn fantasy map with mountain chains, rivers, forests, and several small settlements',
        'A coastal region map with island groups, ports, cliffs, and a winding inland road',
      ],
    ],
    [
      /hokusai woodcut/,
      [
        'A tall ocean wave curling above two small fishing boats near a distant headland',
        'A mountain ridge rising behind a broad river and a few small boats',
      ],
    ],
    [
      /tattoo flash/,
      [
        'A clean tattoo flash sheet of an anchor, moth, wild rose, and small dagger on blank paper',
        'A traditional flash page of a swallow, lantern, crossed branches, and a simple heart',
      ],
    ],
    [
      /graffiti \(tag\)|calligraphy \(blackletter\)|brush pen ink/,
      [
        'Large expressive letterforms painted across a blank brick wall with no readable words',
        'A blackletter calligraphy study of decorative capitals and sweeping pen strokes on pale paper',
      ],
    ],
  ],
  pack_05: [
    [
      /headband ninja/,
      [
        'An original adult scout wearing a plain cloth headband, practicing staff forms in a forest clearing',
        'An original adult martial artist with a simple headband crossing a tiled rooftop at dawn',
      ],
    ],
    [
      /urban spirit blade|blade field urban fantasy/,
      [
        'An original adult sword bearer standing in a rain-dark city lane beside a faint floating light',
        'An original adult courier carrying a sheathed blade past an old urban stone arch',
      ],
    ],
    [
      /grand pirate adventure/,
      [
        'An original adult ship captain and crew raising a sail aboard a small wooden vessel',
        'An adult navigator studying a blank sea chart on deck as the ship enters a bright harbor',
      ],
    ],
    [
      /shadow notebook/,
      [
        'An original adult figure framed by severe red-and-black geometric shadows against a plain city wall, with no hand, page, notebook, or writing',
        'An original adult portrait reduced to angular black shadow planes and one red light accent, with no hand, page, notebook, or writing',
      ],
    ],
    [
      /lo-fi sword roadtrip/,
      [
        'An original adult bicycle courier pausing beside a coastal tram stop at dusk, with loose offbeat motion and no period costume or weapon',
        'An original adult dancer crossing an empty modern bridge at sunset, with loose rhythmic gesture and no period costume or weapon',
      ],
    ],
    [
      /chaotic indie adolescence/,
      [
        'Two original young adults carrying instruments and skateboards through a lively neighborhood street',
        'A group of original young adults leaving a small community hall after a noisy rehearsal',
      ],
    ],
    [
      /painterly blade fantasy/,
      [
        'An original adult sword bearer standing in a windy field below distant mountains',
        'An original adult fencer practicing a broad sword stance beside a stone wall',
      ],
    ],
    [
      /gritty urban curses/,
      [
        'An original adult night worker noticing a strange shadow beneath a city subway stair',
        'An adult messenger facing an unusual spectral shape in an empty alley after rain',
      ],
    ],
    [
      /chaotic splatter action/,
      [
        'An original adult skater bursting through a harmless cloud of bright paint and paper confetti',
        'An original adult stunt performer tumbling through scattered leaves and stage debris',
      ],
    ],
    [
      /bright hero academy/,
      [
        'A group of original adult trainees practicing rescue drills in a bright training courtyard',
        'An original adult student learning a defensive stance beside classmates in a large gym',
      ],
    ],
    [
      /wallbound survival/,
      [
        'An original adult rope-access worker crossing a vast suspended bridge above a coastal gorge, with vertical scale and tether rhythm but no army, wall, or evacuation',
        'An original adult climber securing a safety line on an enormous wind-swept cliff, with vertiginous depth and no military harness, city gate, or crowd',
      ],
    ],
    [
      /wall rupture/,
      [
        'An original adult weather observer on a lighthouse balcony facing a colossal storm front over the sea, with urgent scale and no city gate, military outfit, or rescue crowd',
        'An original adult field geologist fleeing a huge rockslide across an open quarry, with compressed action planes and no fortified wall, soldier, or rescue crowd',
      ],
    ],
    [
      /colossal war drama/,
      [
        'A towering original giant emerging beyond a fortified city as tiny defenders gather on the wall',
        'An immense creature crossing a battlefield toward a line of distant signal towers',
      ],
    ],
    [
      /impact frame comedy hero/,
      [
        'An unimpressed original adult holding a small umbrella while a harmless oversized gust scatters paper around them in concentric impact rings, deadpan rather than a fight',
        'An original adult standing calmly with a teacup as a runaway cart bumps an empty stack of boxes behind them, with absurdly oversized but harmless impact geometry',
      ],
    ],
    [
      /psychic.*minimalism/,
      [
        'A small original adult silhouette beneath a bare streetlamp in wide pale negative space, with only three hovering paper squares and a faint pastel aura',
        'An original adult figure standing in a sparse open plaza, with a few rough-sketched floating shapes and generous blank space',
      ],
    ],
    [
      /psychic paint-surge/,
      [
        'An original adult muralist on an open rooftop as acid-bright paint-like energy bursts across the sky in broad expressive strokes, no floating furniture or white-shirt room',
        'An original adult silhouette against a dark empty plaza while neon paint ribbons erupt into a rough emotional wave, no floating furniture or white-shirt room',
      ],
    ],
    [
      /tactical adventure shonen/,
      [
        'A team of original adult explorers planning a route over a blank map at a campsite',
        'Three original adult adventurers choosing paths at a mountain trail junction',
      ],
    ],
    [
      /demon slayer|lantern bloodline sword ballet/,
      [
        'An original adult sword dancer practicing beneath a row of warm paper lanterns',
        'An original adult guardian standing with a sheathed blade before a lantern-lit mountain gate',
      ],
    ],
    [
      /chainsaw man|devil-hunter/,
      [
        'An original adult monster responder carrying a compact powered rescue saw through a damaged street',
        'An original adult salvage worker facing a horned mechanical creature in a rubble-strewn lot',
      ],
    ],
    [
      /fire force|cathedral inferno/,
      [
        'An original adult glassblower shaping glowing glass in an open workshop, ember halos and ceremonial heat geometry visible without a brigade uniform or refinery fire',
        'An original adult kiln worker opening a ceramic furnace, concentric ember light and heat distortion visible without a brigade uniform or refinery fire',
      ],
    ],
    [
      /blue lock|predator-ego sports/,
      [
        'An original adult soccer striker controlling a ball at the edge of an empty stadium pitch',
        'Two original adult soccer players sprinting toward a loose ball near the goal',
      ],
    ],
    [
      /kaiju no\. 8|civic monster response/,
      [
        'An original adult city response team guiding residents away from a giant creature near a bridge',
        'An original adult rescue pilot circling a huge sea creature approaching a coastal town',
      ],
    ],
    [
      /dandadan|paranormal turbo romance/,
      [
        'Two original adult friends confronting an odd glowing shape in an empty train station',
        'An original adult pair running together from a harmless floating ghost through a city passage',
      ],
    ],
    [
      /hell's paradise|poison garden/,
      [
        'An original adult explorer moving carefully through a dense garden of unusual toxic-looking plants',
        'A lone adult traveler crossing a bright but overgrown island garden with a small pack',
      ],
    ],
    [
      /thousand-year blood war|royal black blade/,
      [
        'An original adult sword bearer standing in a dark ceremonial hall beneath tall windows',
        'An original adult guard crossing a black-stone courtyard in falling rain',
      ],
    ],
    [
      /one-punch man|hero impact satire/,
      [
        'An unimpressed original adult baker holding a tray as a harmless puff of flour forms an absurdly huge shock ring behind them, no sports court or hero costume',
        'An original adult gardener watching a tiny watering mishap create an oversized comic dust burst, with deadpan reaction and no sports gear or hero costume',
      ],
    ],
    [
      /wind breaker|street protector/,
      [
        'A group of original adult neighbors escorting a younger cyclist through a rainy street',
        'An original adult street-rescue team helping reopen a blocked neighborhood road',
      ],
    ],
    [
      /solo leveling|shadow monarch/,
      [
        'An original adult cave explorer facing several tall shadows near a glowing underground doorway',
        'An original adult adventurer entering a broad cavern lit by a single blue crystal',
      ],
    ],
    [
      /mashle|spell-school brawl/,
      [
        'An original adult athlete carrying a stack of books across a quiet magic academy courtyard',
        'An original adult student demonstrating strength beside a row of floating practice objects',
      ],
    ],
    [
      /sakamoto days|convenience-store assassin/,
      [
        'An unflappable original adult park groundskeeper catching a wind-blown traffic cone beside a riverside path, with crisp speed lanes and no store, product shelf, or assassin costume',
        'An original adult transit cleaner effortlessly stopping a rolling suitcase at an open station platform, with compact action timing and no store, product shelf, or assassin costume',
      ],
    ],
    [
      /undead unluck|rule-breaker curse/,
      [
        'Two original adult travelers helping each other cross a wind-battered bridge',
        'An original adult runner protecting a companion from a sudden rain of falling leaves',
      ],
    ],
    [
      /black clover|grimoire thunder/,
      [
        'An original adult field mage opening a blank spellbook as lightning branches above a hill',
        'A team of original adult mages standing beneath a storm with open books and raised hands',
      ],
    ],
    [
      /dr\. stone|science kingdom/,
      [
        'An original adult scientist assembling a simple radio from parts at an outdoor workbench',
        'A small team of adult researchers building a water wheel beside a forest stream',
      ],
    ],
    [
      /kagurabachi|sword oath under neon/,
      [
        'An original adult swordsmith testing a newly polished blade beneath a rain-lit workshop sign',
        'An original adult blade bearer crossing a neon-lit alley with a sheathed sword',
      ],
    ],
    [
      /frieren combat flashback/,
      [
        'An original adult mage releasing a small burst of light beside a quiet mountain path',
        'An original adult spellcaster and companion crossing an old stone bridge after a battle',
      ],
    ],
    [
      /black lagoon|south seas gun-runner/,
      [
        'An original adult boat crew speeding through rough harbor water in a compact launch',
        'An adult sea courier steering a small boat between cargo ships at dusk',
      ],
    ],
    [
      /darker than black|contract killer night rain/,
      [
        'An original adult figure crossing a rain-dark rooftop as a distant city glows below',
        'An adult night courier pausing beneath a streetlamp in a narrow wet alley',
      ],
    ],
    [
      /samurai champloo|lo-fi edo/,
      [
        'An original adult percussionist carrying a small drum across a contemporary city bridge at golden hour, with offbeat rhythm and no kimono, sword, or Edo street',
        'An original adult street musician turning through a modern tram stop at sunset, with brushy beat-synced motion and no kimono, sword, or Edo street',
      ],
    ],
    [
      /baccano|jazz railcrime/,
      [
        'A small jazz ensemble playing inside a passenger train car with travelers watching',
        'Original adult passengers and a band sharing a lively dining-car table at night',
      ],
    ],
    [
      /sword art online|glowing vr adventure/,
      [
        'An adult cyclist pausing beneath a translucent station canopy, crystalline cyan light and layered digital depth but no armor, sword, or game interface',
        'A small glass pavilion reflected in a rain-wet public square, luminous cyan planes and tactile digital light but no adventurer or weapon',
      ],
    ],
    [
      /re:zero|reset-loop/,
      [
        'An original adult traveler standing before a clock tower at the same quiet town square',
        'An adult courier returning to a small stone gate beneath a sky with a repeated moon',
      ],
    ],
    [
      /mushoku tensei|wandering mage/,
      [
        'An original adult wandering mage carrying a staff along a broad rural road',
        'An original adult spell student practicing a small light spell beside a hillside path',
      ],
    ],
    [
      /konosuba|party-quest comedy/,
      [
        'An adult trying to catch a gust of loose paper outside a sunlit library, playful magical fragments and elastic comic timing but no quest party or tavern',
        'An ordinary bicycle tipping harmlessly into a bed of flowers, exaggerated magical sparkle and anticlimactic comic rhythm but no adventurers or food',
      ],
    ],
    [
      /frieren.*afterquest|melancholy fantasy/,
      [
        'An old glass greenhouse beside a still lake at sunset, quiet light and sparse memory-like motes but no elf, mage, staff, or road',
        'A single weathered garden bench beneath an evening sky, gentle horizon light and delicate floating motes but no character or quest scene',
      ],
    ],
    [
      /no game no life|strategy fantasy/,
      [
        'A small mechanical kite suspended above a modern plaza, impossible floating planes and saturated neon color but no board, pieces, or players',
        'A pedestrian bridge rendered as interlocking impossible color planes beneath a vivid sky, without characters, chess, or game interface',
      ],
    ],
    [
      /overlord|bone throne/,
      [
        'An ivory clock tower framed symmetrically inside a dim archive, cold dust and restrained baroque ornament but no throne, skeleton, or court',
        'A pale stone observatory with nested arches under cold moonlight, monumental symmetry but no ruler, armor, or character',
      ],
    ],
    [
      /slime isekai|monster-nation/,
      [
        'A rounded blue glass pavilion in a quiet landscaped square, soft gel-blue accents and buoyant forms but no creature or fantasy crowd',
        'A cluster of smooth blue glass lamps suspended above a simple footbridge, cheerful translucent color but no slime or ruler',
      ],
    ],
    [
      /shield hero|defensive underdog/,
      [
        'An adult conservator repairing a weathered bronze garden arch, concentric protective light and worn metal texture but no shield, weapon, or armor',
        'A small stone footbridge holding firm above a swollen river, layered bronze-toned light arcs and resilient material but no hero or battle',
      ],
    ],
    [
      /danmachi|dungeon lantern/,
      [
        'A tall glass atrium filled with hanging crystal prisms, vertical depth and warm light rising from its base but no corridor, adventurer, or lantern',
        'A vertical mineral garden with faceted glass terraces and one warm illuminated pool below, without dungeon, hallway, or figure',
      ],
    ],
    [
      /twelve kingdoms|imperial destiny/,
      [
        'Jade-and-cinnabar patterned fabric draped across a plain chair, measured vertical folds and ceremonial color without a court figure or insignia',
        'A folded jade textile beside a small red lacquer box, long graphic intervals and precise woven geometry without imperial costume',
      ],
    ],
    [
      /escaflowne|windblown tarot/,
      [
        'A compact winged airship crossing a windy valley above a medieval town',
        'An original adult pilot standing beside a small gear-driven flying machine on a ridge',
      ],
    ],
    [
      /\bmagi\b|labyrinth jewel caravan/,
      [
        'A jewel merchant caravan approaching a distant maze-like sandstone city at sunset',
        'An original adult traveler carrying a bright cut crystal through a desert market',
      ],
    ],
    [
      /ancient magus|thorn cottage/,
      [
        'A small cottage wrapped in flowering thorn branches at the edge of a deep forest',
        'An original adult scholar opening a garden gate entwined with unusual flowering vines',
      ],
    ],
    [
      /delicious in dungeon|stove-top monster cuisine/,
      [
        'An earthenware plate, fresh herbs, folded linen, and warm steam on a plain kitchen counter, tactile fantasy materials without cook, creature, or preparation scene',
        'A close material study of ceramic bowls, dried herbs, and rising steam against a quiet neutral background, without character or monster',
      ],
    ],
    [
      /ascendance of a bookworm|printing press/,
      [
        'An adult bookbinder operating a small wooden printing press in a quiet workshop',
        'A young adult reader arranging hand-printed pages beside a compact press and ink roller',
      ],
    ],
    [
      /faraway paladin|quiet temple quest/,
      [
        'A simple stone footbridge at dawn, gentle vow-like light passing through its arches but no paladin, armor, emblem, or temple',
        'A weathered stone wall and a small flowering tree under solemn morning light, without knight, shrine, or sacred insignia',
      ],
    ],
    [
      /tanya the evil|aerial war mage/,
      [
        'An original adult mage in a flight coat hovering above a distant mountain airfield',
        'An adult aerial scout guiding a small squadron through cloud gaps above a plain',
      ],
    ],
    [
      /campfire cooking|merchant road stew/,
      [
        'An original adult merchant cooking a simple camp stew beside a forest road',
        'A small group of adult travelers sharing hot food beside a wagon at dusk',
      ],
    ],
    [
      /saint's magic|herbarium court/,
      [
        'An original adult botanist cataloging medicinal herbs in a sunlit palace greenhouse',
        'A young adult herbalist arranging gathered leaves beside a garden bench and blank labels',
      ],
    ],
    [
      /fushigi yuugi|celestial maiden portal/,
      [
        'An original adult traveler stepping through a bright stone arch into a distant landscape',
        'An adult scholar standing before a celestial gate with a winding road beyond it',
      ],
    ],
    [
      /magic knight rayearth|gem-engine rescue/,
      [
        'An original adult knight operating a crystal-powered rescue machine in a mountain pass',
        'A compact gear-and-gem engine glowing inside a small armored transport vehicle',
      ],
    ],
    [
      /inuyasha|shrine-well sengoku/,
      [
        'An original adult traveler standing beside an old stone well in a forest shrine yard',
        'A historical forest path leading past a small shrine and a deep stone well',
      ],
    ],
    [
      /tsukimichi|moonlit merchant/,
      [
        'An original adult traveling merchant opening a lantern-lit market stall beneath a full moon',
        'A merchant wagon crossing a moonlit road toward a small mountain town',
      ],
    ],
    [
      /handyman saitou|toolbox party/,
      [
        'Close view of anonymous adult hands repairing a plain brass music box with one small screwdriver, warm metal detail but no group or crowded workbench',
        'An adult hand adjusting a single loose hinge on a simple wooden window, practical warmth and one tool but no adventure party',
      ],
    ],
    [
      /ranking of kings|storybook crown courage/,
      [
        'A tiny red kite lifting above a row of humble houses beneath oversized storybook clouds, gentle courage without child, crown, cape, or castle',
        'A small paper boat setting out across a broad pond in warm storybook light, brave scale without royal character or costume',
      ],
    ],
    [
      /princess connect|banquet quest/,
      [
        'Two original adult neighbors handing each other a book in a sunlit library, gentle pastel camaraderie but no banquet, food, or fixed cast',
        'Two original adult gardeners sharing seedlings beneath soft pastel afternoon light, simple friendship without a quest group or meal',
      ],
    ],
    [
      /neon kinetic alloy sprint/,
      [
        'A compact racing mech sprinting down a lit industrial track with sparks behind its feet',
        'Two original utility robots racing across a neon service lane between towers',
      ],
    ],
    [
      /surveillance verdict grid/,
      [
        'A city surveillance room with an adult operator watching a grid of blank camera feeds',
        'A small inspection drone scanning a night street from above a marked city grid',
      ],
    ],
    [
      /hydraulic attrition/,
      [
        'A heavy industrial mech bracing on hydraulic legs beneath a lifted steel beam',
        'A close mechanical study of a thick hydraulic arm supporting a damaged vehicle chassis',
      ],
    ],
    [
      /luminous beam opera/,
      [
        'A vast orbital communications ring under repair, with a cyan-and-rose aurora traveling around its panels above a distant planet; no firing spacecraft, laser weapons, or readable interface',
        'An unarmed orbital relay station waking in sequence as luminous cyan-and-rose energy runs along its outer structure; no firing spacecraft, laser weapons, or readable interface',
      ],
    ],
    [
      /gothic tech/,
      [
        'A tall machine guardian standing inside a dark gothic railway hall',
        'An original adult mechanic inspecting a quiet service robot beneath cathedral-like arches',
      ],
    ],
    [
      /geometric ignition/,
      [
        'A compact launch vehicle igniting above a geometric steel platform at dusk',
        'An angular maintenance robot powering on inside a bright square hangar',
      ],
    ],
    [
      /sleek collapse romance/,
      [
        'One original adult in a plain technical coat sitting on a rain-wet platform and shielding a small engineered flower, with distant sunset ruins and no couple or bodysuit',
        'A solitary original adult in a simple work jacket tending a small luminous plant beneath a broken elevated rail at dusk, with no couple or bodysuit',
      ],
    ],
    [
      /remote command|tactical network/,
      [
        'An original adult operator guiding a field drone from a compact control room',
        'A tactical operations table with a blank map, small vehicle markers, and an adult coordinator',
      ],
    ],
    [
      /orbital rivalry/,
      [
        'Two unarmed abstract orbital structures stabilizing a broken solar array above a blue planet, asymmetrically spaced with tall arcs and crystalline seams; no confrontation or weapons',
        'Two distinct unarmed orbital habitats cooperating to restore a damaged light-collecting grid, one near and one distant; no duel, cannon, or weapons',
      ],
    ],
    [
      /municipal machine/,
      [
        'A pair of street-maintenance robots clearing branches beside a city tram line',
        'An adult municipal mechanic servicing a compact sidewalk-cleaning machine',
      ],
    ],
    [
      /armored chrome noir/,
      [
        'An unbranded chrome armored vehicle parked beneath a single warehouse light',
        'A polished protective exosuit standing alone in a rain-dark industrial corridor',
      ],
    ],
    [
      /sterile arcology/,
      [
        'A vast clean arcology atrium with planted balconies, transit levels, and tiny adult figures',
        'A bright enclosed city block beneath a glass roof with clear towers and walkways',
      ],
    ],
    [
      /scrap velocity/,
      [
        'A compact salvage rover racing across a field of harmless metal wreckage',
        'An original adult pilot jumping a small utility mech over a low pile of scrap panels',
      ],
    ],
    [
      /cyber-goth mausoleum/,
      [
        'A small service robot passing between tall stone memorials under a dim red signal light',
        'A quiet machine graveyard arranged along a gothic cemetery wall at night',
      ],
    ],
    [
      /rust-wire descent/,
      [
        'A compact repair drone descending a deep shaft along bundled rusted cables',
        'An original adult mechanic climbing down a service ladder beside old hanging wires',
      ],
    ],
    [
      /white machine elegy/,
      [
        'A weathered white railway signal cabinet with its casing open on an empty outdoor platform after rain, one cyan indicator and dust in oblique light; no humanoid robot or hangar',
        'A pale enamel-coated station control box beside wet tracks at dawn, one exposed mechanical panel and a single cool pilot light; no humanoid robot or hangar',
      ],
    ],
    [
      /punitive neon vice/,
      [
        'A narrow neon-lit alley with a closed repair shop and one adult courier passing through',
        'An original adult mechanic standing beside a bright sign in a rain-dark street',
      ],
    ],
    [
      /terminal megastructure/,
      [
        'A tiny maintenance craft approaching the immense wall of a silent orbital megastructure',
        'A distant adult figure crossing the base of a colossal industrial tower',
      ],
    ],
    [
      /coral resonance/,
      [
        'A small exploration drone hovering over a bright coral reef beneath clear water',
        'An original adult diver inspecting a coral-covered research machine on the seabed',
      ],
    ],
    [
      /dustfront drone/,
      [
        'A survey drone crossing a dusty ridge above a remote outpost, full silhouette visible',
        'An adult mechanic repairing a small dust-covered scout drone beside a field shelter',
      ],
    ],
    [
      /vacuum-fortress/,
      [
        'A compact service craft approaching a fortress-like station against a black orbital sky',
        'An adult pilot guiding a small shuttle toward an isolated space defense platform',
      ],
    ],
    [
      /extinction interface/,
      [
        'An adult operator studying a blank emergency command interface with a single red status symbol',
        'A simple machine-control panel with warning lights and an empty central display',
      ],
    ],
    [
      /pop-cyber simulation/,
      [
        'An adult player testing a bright virtual city simulation on a compact console',
        'A small digital driving arena with one unbranded vehicle and a luminous grid floor',
      ],
    ],
    [
      /compact attrition hardware/,
      [
        'A small service mech with thick joints and scuffed armor standing beside a repair bench',
        'A compact tracked machine carrying tools through a narrow industrial corridor',
      ],
    ],
    [
      /monumental ignition/,
      [
        'A large orbital habitat seen from the side as emergency thrusters ignite in sequence to push it away from drifting debris, planet curving diagonally behind; no rocket, launch tower, or vertical ascent',
        'A broad orbital service platform using small emergency engines to turn away from debris, long side profile against a diagonal planetary horizon; no rocket, launch tower, or vertical ascent',
      ],
    ],
    [
      /tokusatsu digital grid/,
      [
        'An original adult rescue hero in a plain protective suit standing beside a giant city-scale robot',
        'A large practical-looking creature towering over a small line of city rescue vehicles',
      ],
    ],
    [
      /bubblegum cosmic/,
      [
        'A brightly colored personal spacecraft crossing a playful field of small planets',
        'An original adult space pilot floating beside a cheerful compact orbital station',
      ],
    ],
    [
      /tri-fire riot geometry/,
      [
        'A three-engine utility machine crossing a smoky industrial plaza under red signal lights',
        'A compact emergency mech clearing a path through a geometric city street after a blackout',
      ],
    ],
    [
      /luminous natural cycle calm/,
      [
        'A dew-wet leaf resting on dark stone beside a forest pond under cool moonlight, pale living haze but no person, sunset, or castle',
        'A small fern emerging between wet stones beneath a moonlit tree, restrained ecological glow and no figure or town',
      ],
    ],
    [
      /sun-reclaimed concrete mystery/,
      [
        'An original adult explorer finding a sunlit garden inside an abandoned concrete tower',
        'A quiet overgrown transit hall with a bright shaft of daylight and a visible stairway',
      ],
    ],
    [
      /machine mourning/,
      [
        'A small deactivated robot resting beneath trees at the edge of a quiet machine yard',
        'An adult mechanic placing a flower beside a silent service machine in an empty hangar',
      ],
    ],
    [
      /civic rumor breakdown/,
      [
        'An ordinary street corner after rain, two mismatched window lights reflected on the pavement with uneasy civic stillness but no crowd or noticeboard',
        'An empty public tram shelter at dusk, muted shop windows and layered wet reflections without gossiping figures or ruined city',
      ],
    ],
    [
      /red-optic security noir/,
      [
        'A security robot with one red sensor scanning an empty industrial corridor',
        'An original adult night guard watching a small red camera light from a dark control room',
      ],
    ],
    [
      /lantern retribution ritual/,
      [
        'A small footbridge in a quiet city park, red-gold light tracing its edges against deep shadow but no cloaked figure, lantern, or ritual setting',
        'A weathered stair rail catching a narrow amber light in an empty courtyard, ceremonial spacing without a person or Gothic hall',
      ],
    ],
    [
      /action burst alley/,
      [
        'An original adult courier in a yellow raincoat vaulting a low barrier in an otherwise empty rain-wet lane, strong forward diagonal but no pursuers or fight',
      ],
    ],
    [
      /vertigo energy cross/,
      [
        'An original adult maintenance worker crossing a narrow gap between two roof platforms during a safety drill, blue-violet crossing vectors but no ball or opponents',
      ],
    ],
    [
      /neon vector discharge/,
      [
        'A small uncrewed survey drone banking around a glass tower at dusk, precise violet-cyan vector trails without people, fire, or rescue scene',
      ],
    ],
    [
      /monumental impact burst/,
      [
        'A heavy wave striking an empty sea wall, amber spray and reddish stone fragments radiating from one impact without a fighter or adversary',
      ],
    ],
    [
      /upward thunder momentum/,
      [
        'A small sailplane lifting into an open storm-lit sky above a cliff, extreme upward perspective and white-blue streaks without athlete, ball, or uniform',
      ],
    ],
    [
      /systemic cooperation grid/,
      [
        'A strategy table with colored route lines connecting several small towns across a blank map',
        'A cooperative party of original adult explorers arranging tokens along a branching dungeon grid',
      ],
    ],
    [
      /pop-signal|engineered romance/,
      [
        'Two original adult couriers sharing a quiet moment beside a small repair robot on a neon street',
        'An original adult pilot and a companion robot watching distant city lights from a rooftop',
      ],
    ],
    [
      /devilman crybaby|neon tragic metamorphosis/,
      [
        'One clear shard of dark glass on a matte plane, red and magenta edge reflections distorting its silhouette without person, demon, or canonical setting',
        'A folded strip of translucent black film caught in a crimson light beam, tense shape change against open darkness without figure or franchise prop',
      ],
    ],
    [
      /crimson hunger|hunger metamorphosis/,
      [
        'Two fractured lacquer pieces on a plain charcoal ground, crimson edge light and changing shadow geometry but no person, robe, or creature',
        'A broken red enamel disk casting an irregular shadow on dark paper, vivid transformation through shape alone without a humanoid figure',
      ],
    ],
    [
      /crimson gothic authority/,
      [
        'An original adult ruler standing on a high stair in a dark crimson stone hall',
        'A tall ceremonial chair beneath red windows in an empty gothic audience chamber',
      ],
    ],
    [
      /crosshatched doom weight/,
      [
        'A weathered stone arch on an empty hillside at dusk, heavy crosshatched shadow masses but no cloaked person or Gothic tower',
      ],
    ],
    [
      /eclipse scar weight/,
      [
        'A plain ceramic disk with one dark mineral crack against a neutral field, crescent shadow and compressed charcoal values but no figure or tower',
      ],
    ],
    [
      /pale threshold horror/,
      [
        'A pale open doorway at the end of an empty corridor with a narrow dark threshold',
        'An original adult standing before a lit door in a silent abandoned house',
      ],
    ],
    [
      /invasive anatomy/,
      [
        'A strange plantlike creature growing fine root tendrils across a dim stone wall',
        'An original adult figure studying a translucent anatomical silhouette beneath cold light',
      ],
    ],
    [
      /abyssal toll/,
      [
        'An adult diver descending toward a luminous opening deep beneath a dark ocean shelf',
        'A small lantern-lit boat floating above a deep underwater chasm',
      ],
    ],
    [
      /procedural low-fantasy grit/,
      [
        'A worn iron hinge beside one cracked stone slab on a bare surface, practical grit and measured marks without people, map, or adventure equipment',
        'A scuffed door latch and folded plain cloth on a simple bench, restrained weathering without a party or medieval street',
      ],
    ],
    [
      /black signal nihilism/,
      [
        'A plain white chair under one narrow red fluorescent light in an otherwise empty room, severe negative space but no operator or tower',
        'A folded pale cloth beneath a faint red line of light on a black floor, sparse signal-like contrast without equipment or skyline',
      ],
    ],
    [
      /clinical innocence rupture/,
      [
        'A simple white flower on an uncluttered steel table under cool clinical light, one offset red thread but no corridor or person',
        'A plain porcelain button on a pale tabletop, sterile shadow geometry interrupted by one warm mark and no human figure',
      ],
    ],
    [
      /rose-black baroque/,
      [
        'An original adult aristocrat standing among dark roses in an ornate stone courtyard',
        'A black iron balcony tangled with red roses above a shadowed manor garden',
      ],
    ],
    [
      /grimy sorcery collision/,
      [
        'An original adult spellcaster bracing against a burst of dusty light in a cramped workshop',
        'Two adult travelers confronting a strange glowing mark on a rain-dark stone wall',
      ],
    ],
    [
      /winter guilt suspicion/,
      [
        'An original adult waiting alone at a snowy forest crossing while a second figure watches from afar',
        'Two adult travelers noticing each other across a winter station platform',
      ],
    ],
    [
      /sun-bleached cruel discipline/,
      [
        'A row of adult trainees standing in formation across a harshly sunlit stone courtyard',
        'An adult drill leader addressing a line of exhausted trainees on a dry training ground',
      ],
    ],
    [
      /rusted neon adolescent dread/,
      [
        'An original young adult standing beneath a broken neon sign on a rain-dark city street',
        'Two original young adults waiting outside a closed arcade beneath rusted signs',
      ],
    ],
    [
      /mineral loneliness fracture/,
      [
        'A single rough quartz cluster on a blank pale field, angular fracture shadows and ample negative space but no traveler or canyon',
        'One cracked slate fragment standing upright on a plain light surface, mineral planes separated by sparse dark gaps without ruins or figure',
      ],
    ],
    [
      /moral suspicion realism/,
      [
        'Two original adults exchanging a wary look across a quiet public hallway',
        'An original adult standing alone in a plain room after a tense conversation',
      ],
    ],
    [
      /lush abyssal toll/,
      [
        'An adult diver descending toward a luminous opening deep beneath a dark ocean shelf',
        'A small lantern-lit boat floating above a deep underwater chasm',
      ],
    ],
  ],
  pack_06: [
    [
      /visual novel screen/,
      [
        'A visual novel dialogue screen with two original adult portraits, a quiet cafe backdrop, and blank text box',
        'An original adult character standing before a rainy station window with an empty dialogue panel',
      ],
    ],
    [
      /fmv pre-rendered sprites/,
      [
        'A full-screen cinematic still of an original adult pilot beside a landed aircraft in a desert',
        'A cinematic frame of two original adults entering a rain-soaked city station',
      ],
    ],
    [
      /game boy camera thermal print/,
      [
        'A tiny monochrome thermal-style portrait of two original adult friends framed shoulder to shoulder',
        'A compact black-and-white snapshot of a bicycle and rider printed on a narrow paper strip',
      ],
    ],
    [
      /ds flipnote studio/,
      [
        'An open handheld screen showing a simple flipbook sequence of an original cartoon bird taking flight',
        'A small drawn animation sequence of a bouncing ball displayed on a pocket-size screen',
      ],
    ],
    [
      /text-mode roguelike|roguelike tile glyph/,
      [
        'A dungeon map built from simple text-like symbols with corridors, room markers, and one exit',
        'A compact tile map of a cave with walls, passages, stairs, and a single player marker',
      ],
    ],
    [
      /chibi platformer.*hud/,
      [
        'A platform game HUD with a tiny original character portrait, two status bars, and blank icon slots',
        'A compact game overlay with a small character icon, life markers, and an empty level counter',
      ],
    ],
    [
      /chibi platformer/,
      [
        'An original compact game character jumping between broad floating platforms above a stream',
        'A small round adventurer landing on a grassy platform beside a simple ladder',
      ],
    ],
    [
      /metroidvania parallax/,
      [
        'A side-view cavern path with foreground pillars, middle-ground ruins, and distant blue cliffs',
        'A layered forest passage with near branches, a central footpath, and distant mountains',
      ],
    ],
    [
      /diegetic hud/,
      [
        'An adult pilot looking through a cockpit visor with a few simple status marks around the view',
        "A compact wrist display and field map visible in an original adult explorer's gloved hands",
      ],
    ],
    [
      /fighting game select screen/,
      [
        'A character-select screen with six original adult fighters, distinct silhouettes, and blank name bars',
        'Four original martial artists posed in separate selection panels around an empty central arena',
      ],
    ],
    [
      /isometric strategy tile/,
      [
        'An isometric strategy map showing a river crossing, bridge, forest tiles, and three small outposts',
        'An isometric settlement board with fields, roads, a watchtower, and clear terrain cells',
      ],
    ],
    [
      /moba splash/,
      [
        'Three original adult adventurers defending a stone bridge against a towering forest creature',
        'An original adult ranger and armored companion charging across a broad battlefield toward a giant beast',
      ],
    ],
    [
      /visual novel neon backdrop/,
      [
        'Two original adult friends talking on a neon-lit rooftop above a quiet city street',
        'An original adult traveler waiting beneath an illuminated station sign in light rain',
      ],
    ],
    [
      /soulslike/,
      [
        'An original adult armored wanderer crossing a ruined bridge toward a distant bell tower',
        'A lone adult knight standing before a vast weathered gate in a foggy valley',
      ],
    ],
    [
      /battle royale/,
      [
        'An original adult contestant surveying an island arena from a rocky ridge with a supply pack',
        'Three original adult competitors crossing an open field toward a distant safe shelter',
      ],
    ],
    [
      /arsenal icon kit/,
      [
        'A grid of original sci-fi equipment icons including a helmet, shield, radio, and energy cell',
        'A set of six clear weapon-free survival gear symbols arranged on a blank square sheet',
      ],
    ],
    [
      /parchment interface/,
      [
        'A fantasy game interface with map, inventory slots, and blank parchment labels around an empty center',
        'A parchment quest journal layout with a small map, item icons, and clear blank writing rows',
      ],
    ],
    [
      /gacha foil frame/,
      [
        'A collectible card frame around an original adult sky-pilot portrait, with no readable text',
        'An ornate foil card border enclosing an original forest creature portrait and blank title strip',
      ],
    ],
    [
      /save-room lighting/,
      [
        'A small survival shelter with a desk, first-aid kit, closed door, and single warm lamp',
        'A quiet safe room with a cot, supply shelves, and a bright table lamp near the entrance',
      ],
    ],
    [
      /shadow readability/,
      [
        'An original adult scout crossing a dim courtyard with clear sightlines, cover, and a bright exit',
        'A stealthy adult figure moving between two lit doorways across a dark warehouse floor',
      ],
    ],
    [
      /arcade racing/,
      [
        'An unbranded racing car drifting around a neon-lit city circuit, road and vehicle clearly visible',
        'Two compact race cars speeding down a glowing coastal track at night',
      ],
    ],
    [
      /pixel inventory icon system/,
      [
        'A tidy grid of pixel inventory icons showing rope, lantern, compass, boots, and a blank slot',
        'A compact item menu of pixel-art tools, food, and travel gear with empty label bars',
      ],
    ],
    [
      /cozy sim seasonal palette/,
      [
        'A small farm village in autumn with a footbridge, garden plots, warm windows, and winding paths',
        'A quiet spring town square with flower beds, a little market, and a clear walking route',
      ],
    ],
    [
      /boss encounter key art/,
      [
        'An original adult adventurer facing a huge horned stone guardian across a broad ruined hall',
        'A compact original hero standing before an enormous luminous creature at the edge of a cavern',
      ],
    ],
  ],
};

function hashIndex(value: string, count: number): number {
  let hash = 2166136261;
  for (const character of value) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return (hash >>> 0) % count;
}

function namedSubjectBrief(pack: BriefPack, preset: BriefPreset): string | null {
  const rules = NAMED_SUBJECTS[pack.id];
  if (!rules) return null;
  const name = preset.name.toLowerCase();
  for (const [pattern, subjects] of rules) {
    if (pattern.test(name)) {
      const ordinal = Number(preset.id.match(/(\d+)$/)?.[1]);
      const variant = Number.isFinite(ordinal)
        ? ordinal
        : hashIndex(`${preset.id}|${preset.name}`, subjects.length);
      return subjects[variant % subjects.length];
    }
  }
  return null;
}

function filmGenreBrief(preset: BriefPreset): string | null {
  const name = preset.name.toLowerCase();
  for (const [pattern, subjects] of FILM_GENRE_SUBJECTS) {
    if (pattern.test(name)) {
      const ordinal = Number(preset.id.match(/(\d+)$/)?.[1]);
      const variant = Number.isFinite(ordinal)
        ? ordinal
        : hashIndex(`${preset.id}|${preset.name}`, subjects.length);
      return subjects[variant % subjects.length];
    }
  }
  return null;
}

function materialBrief(preset: BriefPreset): string | null {
  const name = preset.name.toLowerCase();
  for (const [pattern, subjects] of MATERIAL_SUBJECTS) {
    if (pattern.test(name)) {
      const ordinal = Number(preset.id.match(/(\d+)$/)?.[1]);
      const variant = Number.isFinite(ordinal)
        ? ordinal
        : hashIndex(`${preset.id}|${preset.name}`, subjects.length);
      return subjects[variant % subjects.length];
    }
  }
  return null;
}

function pick(family: BriefFamily, pack: BriefPack, preset: BriefPreset): string {
  const pool = BRIEFS[family];
  const ordinal = Number(preset.id.match(/(\d+)$/)?.[1]);
  const baseIndex = Number.isFinite(ordinal)
    ? ordinal
    : hashIndex(`${preset.id}|${preset.name}`, pool.length);
  const offset = hashIndex(`${pack.id}|${family}|${preset.category ?? ''}`, pool.length);
  return pool[(baseIndex + offset) % pool.length];
}

function sensorBrief(preset: BriefPreset): string | null {
  const name = preset.name.toLowerCase();
  const specialized: Array<[RegExp, readonly string[]]> = [
    [
      /thermal/,
      [
        'A thermal view of two hikers crossing an open ridge, heat silhouettes clearly separated',
        'A thermal image of a compact city block after sunset, rooftops and warm streets distinct',
        'A thermal view of a small boat moving through cold water near a dark shore',
      ],
    ],
    [
      /cctv|security camera|surveillance/,
      [
        'An overhead security-camera view of a quiet station entrance with paths and exits visible',
        'A fixed security-camera view of a library lobby with doors and desk clearly visible',
        'A wide security-camera view of an empty parking structure with ramps and exits legible',
      ],
    ],
    [
      /microscope|micrograph/,
      [
        'A microscope view of a pollen grain against a clean dark field, surface ridges resolved',
        'A microscope view of a fern spore cluster, individual rounded forms sharply separated',
        'A microscope image of a snowflake crystal on a plain dark field, branches clearly visible',
      ],
    ],
    [
      /telescope|astronom/,
      [
        'A telescope view of the Moon over a sparse field of stars, crater edges readable',
        'A telescope view of a bright nebula framed by a few distinct stars',
        'A telescope view of Saturn and its rings against a sparse black sky',
      ],
    ],
    [
      /x-ray|radiograph/,
      [
        'A radiographic study of a hand gripping a simple wooden handle, bones clearly aligned',
        'A radiograph of a bird wing spread in a clear lateral view',
        'A clean radiographic view of a small mechanical hinge with inner parts visible',
      ],
    ],
    [
      /dash ?cam|in-car|dashboard camera/,
      [
        'A dashboard camera view of an empty road through a mountain pass',
        'A dashboard camera view approaching a wet city intersection with traffic lights ahead',
        'A dashboard camera view of a forest road curving beneath a low bridge',
      ],
    ],
    [
      /drone|aerial|satellite/,
      [
        'An aerial survey of a river bend and surrounding farmland, boundaries clearly visible',
        'A satellite view of a rugged coastline with clouds casting long shadows',
        'A straight-down drone view of a compact harbor and its breakwater',
      ],
    ],
  ];
  for (const [pattern, subjects] of specialized) {
    if (pattern.test(name)) {
      const index = hashIndex(`${preset.id}|${name}`, subjects.length);
      return subjects[index];
    }
  }
  return null;
}

function familyFor(pack: BriefPack, preset: BriefPreset): BriefFamily {
  const category = (preset.category ?? '').toLowerCase();
  const name = preset.name.toLowerCase();

  if (pack.id === 'pack_02') {
    if (/sensor|technical imaging/.test(category)) return 'sensor';
    if (/caricature|cartoon/.test(category)) return 'caricature';
    if (/hand-drawn|diy|craft/.test(category)) return 'diy';
    if (/animation/.test(category)) return 'animation';
    if (/photography/.test(category)) return 'photography';
    if (/lighting|atmosphere/.test(category)) return 'lighting';
    if (/broadcast|tv/.test(category)) return 'broadcast';
    if (/film/.test(category)) return 'cinema';
    if (/thermal|cctv|microscope|telescope|sensor|camera/.test(name)) return 'sensor';
    return 'cinema';
  }

  if (pack.id === 'pack_03') {
    if (/sensor|technical shader/.test(category)) return 'sensor';
    if (/hard surface|product cgi/.test(category)) return 'product';
    if (/product|hardware|archviz/.test(name)) return 'product';
    if (/organic|bio cgi/.test(category)) return 'organic';
    if (/environment|worldbuilding/.test(category)) return 'environment';
    if (/material/.test(category)) return 'material';
    if (/lighting|atmosphere/.test(category)) return 'lighting';
    if (/render|3d style/.test(category)) return 'render';
    return 'render';
  }

  if (pack.id === 'pack_04') {
    if (/technical|reference sheet|diagram/.test(category)) return 'technical-sheet';
    if (/comic book/.test(category)) return 'comic';
    if (/children/.test(category)) return 'storybook';
    if (/editorial|poster/.test(category)) return 'editorial';
    if (/ink|print/.test(category)) return 'print';
    if (/concept art/.test(category)) return 'concept';
    if (/technical sheet|turnaround|blueprint|diagram/.test(name)) return 'technical-sheet';
    return 'comic';
  }

  if (pack.id === 'pack_05') {
    if (/mecha|cyberpunk/.test(category)) return 'mecha';
    if (/isekai|high fantasy/.test(category)) return 'fantasy';
    if (/dark fantasy|seinen/.test(category)) return 'dark-fantasy';
    if (/action|shonen/.test(category)) return 'anime-action';
    if (/mecha|cyberpunk/.test(name)) return 'mecha';
    if (/dark|gothic|horror/.test(name)) return 'dark-fantasy';
    if (/fantasy|magic|dragon|quest/.test(name)) return 'fantasy';
    return 'anime-action';
  }

  if (/retro game|game visual/.test(category)) return 'retro-game';
  if (/game art|ui/.test(category)) {
    if (
      /ui|interface|hud|menu|inventory|map|icon|screen|card|shop|dialog|settings|selection|equipment/.test(
        name,
      )
    ) {
      return 'game-ui';
    }
    if (/sprite|pixel|voxel|retro|platformer|arcade|fighting|strategy/.test(name))
      return 'retro-game';
    return 'game-direction';
  }
  if (/ui|interface|hud|menu|inventory|icon|sprite|pixel|voxel/.test(name)) return 'game-ui';
  if (/game|platformer|arcade|jrpg|fighting|strategy|racing/.test(name)) return 'game-direction';
  return 'essential-art';
}

/** Returns a representative preview subject for legacy cards in packs 02 to 06. */
export function legacyBriefPacks02to06(pack: BriefPack, preset: BriefPreset): string | null {
  if (!/^pack_0[2-6]$/.test(pack.id)) return null;
  if (pack.id === 'pack_02' && /film genres/i.test(preset.category ?? '')) {
    return filmGenreBrief(preset) ?? pick('cinema', pack, preset);
  }
  if (pack.id === 'pack_03' && /materials/i.test(preset.category ?? '')) {
    return materialBrief(preset) ?? pick('material', pack, preset);
  }
  const namedSubject = namedSubjectBrief(pack, preset);
  if (namedSubject) return namedSubject;
  if (
    (pack.id === 'pack_02' && /sensor|technical imaging/i.test(preset.category ?? '')) ||
    (pack.id === 'pack_03' && /sensor|technical shader/i.test(preset.category ?? ''))
  ) {
    return sensorBrief(preset) ?? pick('sensor', pack, preset);
  }
  if (pack.id === 'pack_06' && /jrpg/i.test(preset.name)) {
    return 'An original traveler and a small companion arriving at a compact hill town, buildings and paths clearly arranged for a game view';
  }
  return pick(familyFor(pack, preset), pack, preset);
}
