import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import * as yaml from 'js-yaml';

import type { StylePresetManifest } from '../../components/recipes/styles/manifestTypes';

const packId = 'pack_14';
const presetDir = path.join(
  process.cwd(),
  'components',
  'recipes',
  'styles',
  'manifests',
  'presets',
  packId,
);

interface CategoryMythicLanguage {
  routerRole: string;
  subjectSystem: string;
  paletteLogic: string;
  lightLogic: string;
  materialLogic: string;
  compositionLogic: string;
  moodLogic: string;
  finishLogic: string;
  defaultAvoid: string[];
}

interface TokenCue {
  aesthetic?: string;
  subject?: string;
  color?: string;
  light?: string;
  material?: string;
  composition?: string;
  mood?: string;
  finish?: string;
}

const categoryLanguage: Record<string, CategoryMythicLanguage> = {
  'mythic-symbolism': {
    routerRole:
      'symbolist myth-noir iconography with emblem logic, relic pressure, occult negative space, and adult editorial restraint',
    subjectSystem:
      'turning prompt identity into symbolic silhouette, omen-bearing contour, emblem spacing, and restrained ritual detail',
    paletteLogic:
      'blackened neutrals, relic gold, ash white, bruised crimson, oxidized green, and one disciplined omen accent',
    lightLogic:
      'eclipse-like falloff, thin halo edges, candle-density glow, and shadow that behaves like symbolic weight',
    materialLogic:
      'obsidian polish, ash residue, salt-bone grain, tarnished metal, wax, velvet, paper, and carved-stone tactility',
    compositionLogic:
      'icon axes, seal geometry, threshold spacing, processional rhythm, and diagram-like symbolic hierarchy',
    moodLogic:
      'hushed authority, occult elegance, grief, accusation, secrecy, and a sense of ancient systems still operating',
    finishLogic:
      'denoised illustrated finish with crisp symbol reads, controlled blacks, no muddy texture paste, and no fake lettering',
    defaultAvoid: ['generic occult logo', 'cute fantasy mascot', 'random symbol collage'],
  },
  'mythic-ritual-noir': {
    routerRole:
      'ritual noir with legalistic omen logic, candle compression, confessional shadow, taboo elegance, and ceremonial menace',
    subjectSystem:
      'routing forms through vow pressure, witness marks, forensic relic detail, concealed intent, and severe edge control',
    paletteLogic:
      'velvet black, sealing-wax red, old ivory, tarnished brass, moonsteel blue, rain gloss, and restrained poisonous glow',
    lightLogic:
      'low-key noir pools, narrow rim cuts, wet reflections, candle bloom, and occult glow that never flattens the subject',
    materialLogic:
      'wax seals, ledger paper, velvet pile, rain-wet stone, tarnish, soot, blade sheen, veils, and powdery ash',
    compositionLogic:
      'interrogation axes, compressed processional bands, sealed-grid order, reflected doubles, and off-axis ritual tension',
    moodLogic:
      'adult secrecy, suspicion, judgment, mourning, seduction, dread, and the feeling of a private rite becoming public',
    finishLogic:
      'clean noir illustration with heavy denoise, readable silhouettes, disciplined glow, and no accidental UI or readable text',
    defaultAvoid: ['detective cliche', 'generic satanic ritual', 'overexposed neon'],
  },
  'mythic-pantheons': {
    routerRole:
      'pantheon-scale legend grammar with regalia pressure, mythic jurisdiction, dualities, lineage marks, and sovereign symbolism',
    subjectSystem:
      'scaling prompt forms through divine rank, oath geometry, verdict weight, regalia-like edges, and mythic cause-and-effect',
    paletteLogic:
      'mineral darks, royal metal, storm blue, cinder orange, tidal green, funeral rose, sun-gold, and cold ivory accents',
    lightLogic:
      'oracular backglow, storm breaks, solar slashes, underwater gloom, firelit judgment, and sculptural chiaroscuro',
    materialLogic:
      'bronze, stone, glass, thorn, bone, water, smoke, root, scale, feather, hammered iron, and polished relic surfaces',
    compositionLogic:
      'frieze rhythm, ring authority, mirrored duality, oath-path diagonals, heraldic massing, and mythic scale contrast',
    moodLogic:
      'austere grandeur, cosmic obligation, sacred violence, stewardship, trial, inheritance, and severe ceremonial beauty',
    finishLogic:
      'painterly myth-noir polish with grounded material physics, denoised darks, and strong form hierarchy',
    defaultAvoid: ['generic fantasy pantheon', 'comic-book deity posing', 'toy-like armor'],
  },
  'mythic-cosmology': {
    routerRole:
      'cosmological omen design with orbital law, astral records, meridian axes, eclipse timing, and catastrophic elegance',
    subjectSystem:
      'mapping prompt forms through orbit, axis, spiral, balance, omen annotation, scale compression, and celestial consequence',
    paletteLogic:
      'void black, star salt, eclipse gold, lunar blue, nebula bruise, comet white, auroral green, and severe red warning notes',
    lightLogic:
      'planetary rim light, occult backlight, starfall sparks, auroral veils, lunar frost, and signal-like bell illumination',
    materialLogic:
      'astrolabe glass, salt crust, meteor dust, black paper, brass rings, celestial chalk, basin water, and scorched archive grain',
    compositionLogic:
      'orbital spirals, meridian cuts, radial verdicts, balance axes, archive grids, and measured cosmic compression',
    moodLogic:
      'fatalism, astronomical dread, prophetic calm, state secrecy, alarm, wonder, and the beauty of a system turning against itself',
    finishLogic:
      'high-clarity dark editorial finish with precise celestial marks, controlled haze, denoised shadows, and no fake diagrams',
    defaultAvoid: ['generic space opera', 'decorative starfield only', 'sci-fi HUD'],
  },
  'mythic-greek-epics': {
    routerRole:
      'Greek epic noir with bronze law, laurel governance, oracle fragments, maritime strategy, and sun-struck fatalism',
    subjectSystem:
      'shaping prompt identity through civic oath, carved profile, bronze force, measured discipline, and tragic public consequence',
    paletteLogic:
      'Aegean blue-black, bronze, marble ivory, olive green, red thread, smoke gray, laurel shadow, and harsh dawn gold',
    lightLogic:
      'hard dawn planes, oracle smoke glow, bronze bounce, sea-haze contrast, and severe sculptural shadow',
    materialLogic:
      'bronze patina, marble dust, olive wood, red thread fiber, sailcloth, ash, salt, engraved stone, and spear-edge glints',
    compositionLogic:
      'frieze order, labyrinth logic, oath-line diagonals, public-measure spacing, and monument-like silhouette balance',
    moodLogic:
      'tragic law, public honor, strategic pressure, fatal prophecy, disciplined return, and unsentimental heroic aftermath',
    finishLogic:
      'classical-noir illustration with crisp profiles, restrained grain, readable metal, and no museum-label text',
    defaultAvoid: ['clean marble postcard', 'generic gladiator fantasy', 'tourist Greece'],
  },
  'mythic-african-cosmologies': {
    routerRole:
      'African cosmology noir with oral-history rhythm, carved lineage, rain law, star memory, trickster wit, and civic myth',
    subjectSystem:
      'translating prompt forms through ancestral marks, council rhythm, carved contour, stewardship weight, and communal signal logic',
    paletteLogic:
      'night umber, baobab gray, calabash ochre, star white, rain green, ember orange, palm black, and ceremonial gold',
    lightLogic:
      'fire-circle glow, storm flashes, star counsel glints, rain sheen, and carved-edge highlights with deep breathable shadow',
    materialLogic:
      'carved wood, calabash shell, beadwork, drum skin, rain gloss, river silt, palm fiber, ash, iron, and soot-dark cloth',
    compositionLogic:
      'council rings, lineage bands, relay rhythm, navigation arcs, mask-plane balance, and communal authority spacing',
    moodLogic:
      'ancestral intelligence, civic gravity, playful danger, sovereignty, stewardship, rain hunger, and remembered fire',
    finishLogic:
      'authorial illustrated finish with tactile craft, controlled dark values, denoised texture, and no decorative stereotype drift',
    defaultAvoid: ['tourist folklore', 'tribal pattern cliche', 'random animal mascot'],
  },
  'mythic-japanese-kami-yokai': {
    routerRole:
      'kami and yokai myth-noir with boundary seals, wet ink, foxfire glow, paper-lantern hush, and legalistic supernatural bargains',
    subjectSystem:
      'letting prompt forms pass through seal logic, borrowed identity, rain-soft edges, vow marks, and uncanny threshold behavior',
    paletteLogic:
      'ink black, foxfire blue, wet vermilion, lantern cream, snow white, cypress green, moon silver, and rain-dark indigo',
    lightLogic:
      'paper lantern bloom, rain reflections, dawn hush, foxfire edges, snow-diffused glow, and narrow supernatural rim light',
    materialLogic:
      'washi paper, wet ink, lacquer, sealed cord, rain gloss, snow powder, scale shimmer, bell metal, and carved wood grain',
    compositionLogic:
      'asymmetric seal placement, crossing lines, boundary panels, kagura motion arcs, vow-path rhythm, and quiet negative space',
    moodLogic:
      'uncanny politeness, whispered threat, old bargain logic, purification silence, weather command, and ambiguous mercy',
    finishLogic:
      'refined illustrated finish with clean ink edges, denoised darks, readable glow, and no chibi or slapstick drift',
    defaultAvoid: ['anime-chibi', 'slapstick yokai', 'urban-neon overload'],
  },
  'mythic-norse-sagas': {
    routerRole:
      'Norse saga noir with rune law, ash-world memory, frost authority, longnight endurance, and iron oath momentum',
    subjectSystem:
      'pressing prompt forms into rune cuts, ice weight, saga profile, oath momentum, burial memory, and weathered authority',
    paletteLogic:
      'frost blue, ash gray, iron black, blood-rust, yew green, glacier white, raven dark, and low ember warmth',
    lightLogic:
      'longnight rim light, cold sky breaks, forge glow, ice reflection, funeral ember, and hard northern silhouette cuts',
    materialLogic:
      'rune-carved wood, hammered iron, ice crust, ash, fur-like matte softness, bone, soot, quench steam, and weathered stone',
    compositionLogic:
      'saga-panel rhythm, runic axes, oath-line diagonals, worldtree verticality, weighing symmetry, and last-stand mass pressure',
    moodLogic:
      'stoic dread, winter sovereignty, fatal courage, ancestral memory, lawful violence, and the patience of old vows',
    finishLogic:
      'grain-controlled dark illustration with crisp rune-like edges, believable cold material, and no generic Viking costume',
    defaultAvoid: ['generic Viking cosplay', 'muddy snow noise', 'cartoon berserker'],
  },
  'mythic-mesoamerican-suns': {
    routerRole:
      'Mesoamerican sun-cycle noir with obsidian discipline, jade resonance, feathered ascent, solar oath, and echoing water memory',
    subjectSystem:
      'routing prompt forms through solar recurrence, cut-stone geometry, feather-scale tension, jade silence, and oath-cycle order',
    paletteLogic:
      'obsidian black, jade green, solar yellow, blood red, cenote teal, limestone gray, feather blue, and dry gold accents',
    lightLogic:
      'eclipse rim, water-reflected sun, carved-stone shadow, jade glow, and solar cuts that feel ritual but not decorative',
    materialLogic:
      'obsidian sheen, jade, carved limestone, feather texture, scale gleam, water mineral stain, ash, and cut pigment residue',
    compositionLogic:
      'calendar-like cycles, stepped geometry, continuity bands, solar axes, echo rings, and oath-weighted symmetry',
    moodLogic:
      'cyclical dread, sacred continuity, oath pressure, solar violence, underworld hush, and lucid ceremonial abstraction',
    finishLogic:
      'precise mythic illustration with clean stone and mineral reads, denoised darks, and no tourist artifact styling',
    defaultAvoid: ['tourist artifact', 'generic temple adventure', 'oversaturated jungle fantasy'],
  },
};

const tokenCues: Record<string, TokenCue> = {
  abyssal: {
    aesthetic: 'abyssal negative-space pressure',
    color: 'deep ultramarine-black and cold green undertones',
    light: 'submerged edge glow and swallowed highlights',
    material: 'wet black mineral sheen and pressure-dark gradients',
    mood: 'subaqueous dread and monumental silence',
  },
  academy: {
    aesthetic: 'civic knowledge ritual',
    composition: 'institutional order translated into measured spacing',
    mood: 'argument, hierarchy, and cultivated restraint',
  },
  aegis: {
    aesthetic: 'protective emblem authority',
    subject: 'shield-like contour pressure and armored boundary logic',
    material: 'polished bronze, worn edge marks, and ceremonial scratches',
  },
  aegean: {
    color: 'Aegean blue-black, marble ivory, and salt-worn bronze',
    light: 'sea-haze light and hard sun cuts',
  },
  afterlife: {
    aesthetic: 'threshold judgment symbolism',
    mood: 'post-mortal calm, verdict weight, and sacred unease',
  },
  alarm: {
    light: 'warning glints and hard signal flashes',
    mood: 'immediate omen pressure',
    composition: 'repeating alert rhythm and radial emphasis',
  },
  anansi: {
    aesthetic: 'trickster intelligence and webbed fate logic',
    composition: 'woven diagonals and sly connective rhythms',
    mood: 'wit, danger, and narrative reversal',
  },
  ancestor: {
    aesthetic: 'ancestral memory system',
    material: 'carved patina, soot, hand-worn edges, and ceremonial residue',
    mood: 'lineage gravity and remembered witness',
  },
  archive: {
    composition: 'classified archive grids and preserved-fragment spacing',
    material: 'aged paper, sealed dust, brittle edges, and indexed relic marks',
    mood: 'forbidden knowledge under preservation pressure',
  },
  ash: {
    color: 'ash gray, char black, and dim ember warmth',
    light: 'low ember haze and powder-soft falloff',
    material: 'powdered ash, soot residue, matte char, and dry mineral dust',
    mood: 'mourning, aftermath, and burned authority',
  },
  ashen: {
    color: 'ash gray, bone white, and dead ember accents',
    material: 'soot, matte residue, carbon dust, and weathered relic surfaces',
    mood: 'exhausted prophecy and end-cycle gravity',
  },
  ascent: {
    composition: 'upward procession, tiered lift, and vertical omen lines',
    mood: 'severe transcendence rather than optimism',
  },
  astral: {
    color: 'void blue, star white, and old gold pinpoints',
    light: 'remote astral sparks and cold rim glints',
    composition: 'celestial spacing and measured orbit arcs',
  },
  astrolabe: {
    composition: 'nested rings, measured pivots, and navigational geometry',
    material: 'etched brass, glass lenses, and blackened instrument edges',
  },
  auroral: {
    color: 'green-violet aurora over cold dark values',
    light: 'veiled auroral glow and spectral rim shifts',
    mood: 'beautiful instability and atmospheric warning',
  },
  baobab: {
    aesthetic: 'rooted ancestral scale and tree-memory authority',
    subject: 'heavy rooted silhouettes and ancient branching mass',
    color: 'baobab gray, night umber, and dry ochre highlights',
    light: 'starlit bark glints and council-fire edge warmth',
    material: 'dry bark grain, gray wood, and dust-filled creases',
    composition: 'rooted vertical weight and council-like radial spacing',
    mood: 'elder counsel, slow memory, and grounded cosmic witness',
    finish: 'tactile bark readability with denoised dark editorial restraint',
  },
  balance: {
    composition: 'axis symmetry, counterweight spacing, and measured tension',
    mood: 'judgment held at the edge of collapse',
  },
  ballcourt: {
    composition: 'ritual-game geometry and solar contest axes',
    material: 'cut stone, mineral dust, and obsidian abrasion',
  },
  bargain: {
    mood: 'polite danger, hidden cost, and supernatural negotiation',
    composition: 'two-sided tension and contract-like spacing',
  },
  basin: {
    material: 'dark water film, mineral ring stains, and reflective depth',
    composition: 'contained circular readings and echoing interior arcs',
  },
  beacon: {
    light: 'piercing signal light and long directional falloff',
    composition: 'call-and-response spacing with a dominant signal axis',
  },
  bell: {
    light: 'metallic glints and sound-like radial illumination',
    material: 'aged bronze, clapper marks, and vibration-worn patina',
    composition: 'ringing circles and alarm-like spacing',
  },
  binding: {
    aesthetic: 'binding rite pressure and tightened oath mechanics',
    subject: 'bound-edge logic and tightened silhouette pressure',
    color: 'wax red, cord black, and old ivory restraint',
    light: 'thin glints caught on cord, wax, and compressed edges',
    material: 'cord, wax, blade sheen, and compressed paper fibers',
    composition: 'tightened intervals and constraint-based visual order',
    mood: 'vow enforcement and controlled danger',
    finish: 'sharp bound-edge clarity with clean dark-value separation',
  },
  blackwater: {
    color: 'blackwater blue, oil-dark green, and silver reflection breaks',
    light: 'glossy dark reflections and hidden underlight',
    material: 'wet mineral film and slow ripple distortion',
  },
  blood: {
    color: 'dried crimson, black red, and moon-pale contrast',
    mood: 'sacrificial intensity without gore dependency',
  },
  bone: {
    color: 'bone white, old ivory, and gray salt shadows',
    material: 'porous bone grain, powder residue, and brittle edge chips',
  },
  borrowed: {
    subject: 'identity slippage, borrowed contour, and unstable likeness',
    mood: 'uncertain selfhood and ritual disguise',
  },
  boundary: {
    composition: 'boundary lines, seal spacing, and guarded transition zones',
    mood: 'permission withheld at a visible threshold',
  },
  bronze: {
    color: 'bronze, verdigris green, smoke gray, and dark marble values',
    light: 'warm metal bounce and hard rim glints',
    material: 'bronze patina, engraved scratches, hammered planes, and oily smoke',
  },
  broken: {
    aesthetic: 'fractured sanctity and interrupted symmetry',
    subject: 'broken contour logic and repaired silhouette tension',
    material: 'cracked enamel, chipped glass, snapped gold leaf, and exposed underlayers',
    mood: 'damaged reverence',
  },
  burial: {
    color: 'cold earth gray, funeral black, and quiet ivory',
    material: 'pressed soil, cloth dust, stone weight, and old metal',
    mood: 'memorial restraint and buried memory',
  },
  calabash: {
    color: 'ochre shell, smoke brown, and pale carved highlights',
    material: 'calabash shell, carved skin, oil sheen, and hand-worn marks',
  },
  candle: {
    light: 'small candle bloom, waxy falloff, and compressed darkness',
    material: 'wax, soot, singed paper, and warm smoke stains',
  },
  carp: {
    material: 'scale shimmer, wet ink, and moonlit water skin',
    composition: 'curved crossing motion and reflective arcs',
  },
  celestial: {
    composition: 'celestial marker placement and star-map spacing',
    light: 'pinpoint star glints and cold heavenly rim light',
  },
  cenote: {
    color: 'cenote teal, limestone gray, obsidian black, and solar yellow',
    light: 'reflected water light and high vertical sun cuts',
    material: 'mineral water staining and wet stone edges',
  },
  chapel: {
    aesthetic: 'sacred-architecture pressure without a required locale',
    light: 'narrow devotional rays and cold abyssal contrast',
    composition: 'vertical nave-like rhythm converted into abstract hierarchy',
  },
  chariot: {
    composition: 'solar transit diagonals and wheel-like momentum',
    material: 'bronze spokes, leather tension, and sun-baked dust',
  },
  choir: {
    composition: 'absent-voice rhythm and grouped vertical spacing',
    mood: 'hollow ceremony and collective silence',
  },
  cinder: {
    color: 'cinder orange, soot black, and heated gold',
    light: 'coal glow and smoked highlight edges',
    material: 'cinder dust, scorched pigment, and ember cracks',
  },
  cipher: {
    composition: 'coded spacing, hidden order, and segmented symbol logic',
    mood: 'encrypted knowledge and occult restraint',
  },
  civic: {
    mood: 'public obligation and legal gravity',
    composition: 'civic spacing, measured hierarchy, and orderly procession',
  },
  clockwork: {
    composition: 'gear-like repetition and mechanical verdict rhythm',
    material: 'blackened brass, clock teeth, oil, and precise metal edges',
  },
  comet: {
    light: 'white-hot streaks and cold trailing sparks',
    composition: 'broken trajectory arcs and impact-oriented spacing',
  },
  command: {
    mood: 'command pressure and sovereign inevitability',
    composition: 'directive axes and forceful visual hierarchy',
  },
  commons: {
    mood: 'shared-resource gravity and communal consequence',
    composition: 'distributed authority and repeated civic beats',
  },
  compression: {
    composition: 'compressed bands, tight shadow mass, and pressure-heavy spacing',
    mood: 'claustrophobic ritual concentration',
  },
  confessional: {
    light: 'slit-like noir illumination and glossy reflection breaks',
    mood: 'private guilt and formal disclosure',
  },
  conservation: {
    material: 'preserved velvet, archival dust, gloved-care surfaces, and stabilized decay',
    mood: 'museum-level secrecy and fragile reverence',
  },
  containment: {
    composition: 'sealed boundaries and controlled overflow',
    mood: 'danger held inside a precise system',
  },
  continuity: {
    composition: 'cycle bands and repeated solar intervals',
    mood: 'sacred recurrence and unbroken obligation',
  },
  counsel: {
    aesthetic: 'grave advisory myth and shared judgment pressure',
    subject: 'council-weighted mass and decision-bearing contour',
    color: 'old gold, night umber, and star-white decision points',
    light: 'small decision glints arranged like listening stars',
    material: 'handled wood, worn metal, dust, and record-like surface traces',
    composition: 'council-ring spacing and star-like decision points',
    mood: 'grave deliberation and shared ancestral intelligence',
    finish: 'measured council clarity with tactile craft and no decorative clutter',
  },
  crossing: {
    composition: 'threshold lines, diagonal passage, and divided value fields',
    mood: 'transition under oath pressure',
  },
  crown: {
    subject: 'regalia-like silhouette emphasis and authority-bearing contour',
    material: 'charred metal, tarnish, and sharp ceremonial edges',
  },
  crocodile: {
    material: 'armored scale texture and river-dark gloss',
    mood: 'patient danger and contractual force',
  },
  cyclops: {
    subject: 'monolithic single-focus mass and forge-weighted profile',
    light: 'forge glare and one dominant hot point',
  },
  dawn: {
    color: 'cold dawn gold, pale gray, and bruised shadow',
    light: 'low sunrise cuts and disciplined early light',
    mood: 'purification, discipline, and irreversible beginning',
  },
  death: {
    aesthetic: 'mortuary omen design and beautiful fatality',
    subject: 'mortality-weighted silhouette pressure and final-form restraint',
    material: 'bone dust, funeral polish, and cold edge wear',
    mood: 'mortality pressure and beautiful fatality',
    color: 'bone pale accents against funeral darks',
  },
  decree: {
    mood: 'official omen authority and spoken law',
    composition: 'edict-like hierarchy and formal spacing',
  },
  deliberation: {
    mood: 'slow judgment and collective weight',
    composition: 'balanced argument planes and measured pauses',
  },
  departure: {
    composition: 'leaving arcs and soul-like upward distance',
    mood: 'solemn release and final passage',
  },
  destiny: {
    mood: 'tempered inevitability and cosmic pressure',
    composition: 'fate lines held in measured suspension',
  },
  divination: {
    light: 'small occult glows and reflective reading surfaces',
    material: 'salt grains, scratched plates, and dark liquid shine',
  },
  doctrine: {
    composition: 'rule-bound panels and saga-like sequence order',
    mood: 'codified belief and stern memory',
  },
  drum: {
    material: 'taut drum skin, carved wood, soot, and hand-polished rims',
    composition: 'pulse rhythm and relay spacing',
  },
  duality: {
    composition: 'mirrored halves, tidal opposition, and paired value systems',
    mood: 'productive contradiction and sacred split identity',
  },
  eclipse: {
    color: 'eclipse black, corona gold, ash white, and bruised red accents',
    light: 'occluded corona glow, hard rim fire, and sudden value collapse',
    composition: 'orbital occlusion, circular tension, and darkened central gravity',
    mood: 'suspended catastrophe and sacred interruption',
  },
  echo: {
    composition: 'repeated rings, delayed silhouettes, and memory-return spacing',
    light: 'soft reflected glints and acoustic-looking pulses',
  },
  eight: {
    composition: 'eight-beat ritual rhythm and looped motion structure',
  },
  elephant: {
    subject: 'large stewarding mass and slow protective contour',
    mood: 'memory, patience, and grave responsibility',
  },
  endurance: {
    material: 'weathered surfaces and repaired pressure marks',
    mood: 'survival, patience, and cold persistence',
  },
  equinox: {
    composition: 'equalized halves and hinge-like balance',
    light: 'balanced dawn-and-dusk illumination',
  },
  erased: {
    material: 'scraped paper, erased pigment, and ghosted residue',
    mood: 'censorship, absence, and forbidden memory',
  },
  etiquette: {
    composition: 'formal spacing and severe social geometry',
    mood: 'polite dread and petrified manners',
  },
  exorcism: {
    light: 'purging glow and hard shadow separation',
    mood: 'controlled expulsion and ceremonial severity',
  },
  faces: {
    subject: 'layered identity planes and face-like pattern drift',
    material: 'painted skin, mask lacquer, and rubbed pigment',
  },
  falling: {
    composition: 'descending arcs and broken recurrence',
    mood: 'cosmic failure and beautiful collapse',
  },
  fate: {
    composition: 'threaded causality and weighted intersections',
    mood: 'inevitability with trickster intelligence',
  },
  feathered: {
    color: 'iridescent blue-green, solar gold, and black feather shadow',
    material: 'barbed feather texture, scale gleam, and dry pigment',
    composition: 'ascending feather rhythm and layered contour',
  },
  fire: {
    light: 'ember glow, sharp orange cores, and smoky falloff',
    material: 'charred edges, soot, and heat-bent distortion',
    mood: 'deliberation under dangerous warmth',
  },
  fjord: {
    color: 'cold water blue, glacier gray, and iron black',
    composition: 'long horizontal cuts and navigational depth',
  },
  forge: {
    light: 'forge glare, ember sparks, and hot-cold metal contrast',
    material: 'hammered metal, scale flakes, quench steam, and blackened tools',
  },
  forging: {
    light: 'forge glow and quench steam halos',
    material: 'hammered iron, burned oil, and carved rune residue',
  },
  foxfire: {
    aesthetic: 'spectral trickster flame and whispered boundary magic',
    subject: 'spectral edge behavior and sly flame-like contour shifts',
    color: 'blue foxfire, wet vermilion, and deep ink black',
    light: 'small supernatural flame edges and soft spectral falloff',
    material: 'blue flame haze, wet ink shine, and smoke-soft residues',
    composition: 'small flame points and sly boundary crossings',
    mood: 'whispered trickster menace',
    finish: 'clean spectral glow with denoised ink-dark restraint',
  },
  frost: {
    color: 'frost blue, white-gray, and iron shadow',
    light: 'cold rim light and crystalline bounce',
    material: 'ice crust, hoarfrost, brittle edges, and matte snow powder',
  },
  frostbound: {
    color: 'frost blue, bone white, and sealed gray',
    material: 'frozen patina, cracked ice, and cold-preserved relic surfaces',
    mood: 'locked endurance and winter oath pressure',
  },
  funeral: {
    color: 'mourning black, faded rose, old ivory, and tarnished metal',
    mood: 'formal grief and psychopomp restraint',
    composition: 'slow procession rhythm and elegiac spacing',
  },
  ghost: {
    material: 'transparent ink haze and dim residue',
    mood: 'hunger, absence, and unresolved obligation',
  },
  glacier: {
    color: 'blue-white ice, slate shadow, and mineral gray',
    material: 'compressed ice, scraped stone, and frozen dust',
  },
  glass: {
    color: 'cold glass green, reflected black, and pale edge highlights',
    light: 'refracted glints and brittle rim shine',
    material: 'cracked glass, polished shard edges, and translucent distortion',
  },
  gods: {
    aesthetic: 'divine jurisdiction and rank-bearing mythic pressure',
    subject: 'dual authority and elevated symbolic mass without forcing a deity portrait',
    color: 'cold ivory, royal metal, and storm-shadow accents',
    light: 'oracular backglow and high-rank rim separation',
    material: 'regalia-like metal, stone, water sheen, and polished relic edges',
    composition: 'ranked authority, paired jurisdiction, and mythic scale contrast',
    mood: 'divine consequence and split jurisdiction',
    finish: 'rank-readable mythic polish without deity-portrait dependency',
  },
  governance: {
    composition: 'formal rule systems and institutional visual order',
    mood: 'administrative severity and public consequence',
  },
  grave: {
    color: 'grave gray, star black, and tarnished bell metal',
    material: 'cold stone, mineral dust, and rubbed bronze',
    mood: 'funerary warning and astral unease',
  },
  griot: {
    aesthetic: 'oral-history authority and star-memory cadence',
    composition: 'story-ring rhythm and mnemonic repetition',
    mood: 'witnessed memory and spoken lineage',
  },
  grimoire: {
    material: 'black paper, worn leather, veiled ink, and sealed dust',
    composition: 'secret-page layering and forbidden index order',
  },
  guardian: {
    subject: 'protective contour pressure and ward-like silhouette grammar',
    mood: 'guarded warmth and old responsibility',
  },
  halo: {
    light: 'fractured halo glow and regrowth highlights',
    composition: 'broken circular emphasis and repaired sanctity',
  },
  harvest: {
    color: 'iron black, dry gold, and field-brown undertones',
    material: 'worked metal, cut fiber, and seasonal dust',
    mood: 'labor, stewardship, and hard-earned abundance',
  },
  hearth: {
    light: 'low warm hearth glow against deep ash shadow',
    material: 'soot, clay, worn iron, and soft ember dust',
    mood: 'guarded warmth and domestic sanctity without cozy softness',
  },
  helios: {
    light: 'solar beacon rays and harsh godlike exposure control',
    color: 'sun gold, bronze, and dark blue contrast',
  },
  heroes: {
    subject: 'returned-champion silhouette pressure and memorial scale',
    mood: 'aftermath, tribute, and unsentimental return',
  },
  hoplite: {
    subject: 'disciplined shield-line contour and bronze mass',
    material: 'bronze, leather, linen, and dust-polished metal',
  },
  hundred: {
    composition: 'multiplicity without clutter and repeated identity beats',
    mood: 'ritual excess under strict order',
  },
  hungry: {
    mood: 'spiritual hunger, debt, and uneasy shelter',
  },
  hyena: {
    mood: 'border wit, mockery, and dangerous intelligence',
    composition: 'off-balance grin-like rhythm and edgewise movement',
  },
  ice: {
    color: 'ice blue, black iron, and white mineral flash',
    material: 'frozen metal, cold vapor, and sharpened translucent edges',
  },
  iceblade: {
    subject: 'blade-like silhouette cuts and quench-sharp contour',
    material: 'ice, polished iron, quench steam, and brittle glints',
  },
  icon: {
    aesthetic: 'damaged sacred-icon discipline and frontal symbolic gravity',
    subject: 'flat sacred-plane pressure and silhouette-as-emblem treatment',
    color: 'aged gold, varnish brown, black shadow, and chipped ivory',
    light: 'flat gold-leaf glints with narrow sacred rim light',
    composition: 'icon-axis balance and sacred flatness with shadow depth',
    material: 'gold leaf chips, varnish cracks, and painted relic surface',
    mood: 'reverence damaged by noir suspicion',
    finish: 'crisp icon-surface recognition with controlled cracks and no readable lettering',
  },
  infiltration: {
    light: 'narrow stealth glints and moonsteel edge control',
    mood: 'sacred theft, secrecy, and quiet intrusion',
  },
  intelligence: {
    composition: 'signal hierarchy and coded observation points',
    mood: 'watchfulness, strategy, and raven-dark analysis',
  },
  iron: {
    color: 'iron black, rust red, and dry harvest gold',
    material: 'hammered iron, oxidized edges, and hard matte wear',
  },
  jade: {
    color: 'jade green, black water, and limestone pale accents',
    light: 'subtle jade glow and reflective depth',
    material: 'polished jade, mineral stains, and cool carved planes',
  },
  jarl: {
    mood: 'frost authority and severe rank',
    subject: 'rank-bearing mass and winter command silhouette',
  },
  judgment: {
    composition: 'verdict axes and formal weighing balance',
    mood: 'unavoidable judgment and public consequence',
  },
  jurisprudence: {
    composition: 'legalistic order, precedent bands, and rule-based spacing',
    mood: 'supernatural law and dry procedural authority',
  },
  kagura: {
    composition: 'ritual motion arcs and controlled performance rhythm',
    mood: 'sacred movement and weather-command tension',
  },
  kappa: {
    material: 'wet shell sheen, river film, and slick green-black texture',
    mood: 'procedural mischief and watery legal pressure',
  },
  knowledge: {
    composition: 'preserved knowledge grids and hidden-reference order',
    mood: 'secret learning and dangerous clarity',
  },
  knife: {
    aesthetic: 'blade-oath severity and ritual incision logic',
    subject: 'blade-line contour, decisive cuts, and danger held in silhouette',
    color: 'dark steel, wax red, and old ivory tension',
    light: 'thin blade glints and sharp value cuts',
    material: 'dark steel, wax, cord, and powdery fingerprints',
    composition: 'knife-line diagonals and close ritual pressure',
    mood: 'controlled threat and irreversible decision',
    finish: 'sharp metal readability with disciplined denoise and no glossy toy drift',
  },
  knot: {
    composition: 'interlocked loops and renewal geometry',
    material: 'cord, scale, and tightened surface crossings',
  },
  labyrinth: {
    composition: 'maze logic, thread paths, and compressed decision turns',
    mood: 'intellectual danger and trapped choice',
  },
  lantern: {
    light: 'paper-lantern bloom and soft amber containment',
    material: 'washi paper, soot, bamboo ribs, and warm translucent fiber',
  },
  laurel: {
    color: 'laurel green, marble ivory, and old bronze',
    composition: 'wreath-like civic order and measured academy spacing',
  },
  legal: {
    composition: 'document-like hierarchy and rule-bound spacing',
    mood: 'instrumental law and oracle procedure',
  },
  ledger: {
    material: 'crimson ledger paper, ink bleed, and sealed margins',
    composition: 'columnar judgment grid and accounting-like rhythm',
  },
  leviathan: {
    subject: 'immense submerged mass and abyssal contour pressure',
    mood: 'cathedral-scale dread translated into form',
  },
  lineage: {
    material: 'carved marks, inherited patina, and hand-worn symbolic surfaces',
    composition: 'generational bands and repeated ancestry rhythm',
  },
  lion: {
    subject: 'sovereign mass and rain-command authority',
    mood: 'royal danger and public weather power',
  },
  liturgy: {
    composition: 'repeated rite intervals and solemn reading order',
    mood: 'salt-bone devotion and severe sacred cadence',
  },
  logic: {
    composition: 'rule-path clarity and deliberate connective structure',
    mood: 'cold reasoning inside mythic consequence',
  },
  longnight: {
    color: 'longnight blue, iron black, and low ember gray',
    light: 'thin northern rim light and compressed darkness',
    mood: 'endurance across endless dark',
  },
  lunar: {
    color: 'lunar blue, salt white, and black mineral shadow',
    light: 'cold moon sheen and reflective divination glow',
  },
  mask: {
    subject: 'covered identity, profile flattening, and ceremonial face-plane logic',
    material: 'lacquer, obsidian, paint, rubbed edges, and theatrical shadow',
  },
  medusa: {
    subject: 'warning-gaze tension and petrifying contour pressure',
    material: 'stone, dark green mineral, and relic polish',
  },
  memorial: {
    composition: 'memorial spacing and solemn return rhythm',
    mood: 'tribute, aftermath, and public grief',
  },
  memory: {
    composition: 'mnemonic rings, echo repeats, and archived spacing',
    mood: 'remembered obligation and preserved witness',
  },
  meridian: {
    composition: 'meridian cuts, axis decisions, and state-secret alignment',
    light: 'knife-thin horizon light and severe vertical breaks',
  },
  midnight: {
    color: 'midnight black, candle amber, and sealed crimson',
    light: 'small flame compression and hard noir falloff',
  },
  mirror: {
    light: 'refraction glints and mirrored edge ghosts',
    material: 'silvered glass, tarnish, and broken reflection',
  },
  moon: {
    color: 'moon white, ink blue, and cool gray-black',
    light: 'cold moon rim and soft reflected glow',
  },
  moonsteel: {
    color: 'moonsteel blue, black silver, and pale edge glints',
    material: 'cold steel, polished relic metal, and smooth lunar patina',
  },
  navigation: {
    composition: 'route arcs, instrument-like spacing, and direction marks',
    mood: 'guided uncertainty and strategic reading',
  },
  nebula: {
    color: 'nebula violet, bruise magenta, and star-salt white',
    light: 'diffuse cosmic glow and veiled gas-like luminosity',
  },
  neon: {
    aesthetic: 'damaged electric sanctity under noir ritual pressure',
    subject: 'tube-like edge accents and contaminated glow around the prompt form',
    color: 'broken neon magenta, cyan contamination, and old black',
    light: 'damaged neon flicker under sacred shadow',
    material: 'cracked tubes, wet reflections, and chipped enamel',
    composition: 'flicker rhythm, broken sign geometry, and off-axis glow emphasis',
    mood: 'profane luminosity and urban sacrament decay',
    finish: 'controlled neon bloom without overexposure or cyberpunk drift',
  },
  night: {
    color: 'state-secret black, cold violet, and muted gold',
    mood: 'political secrecy and nocturnal control',
  },
  noir: {
    aesthetic: 'noir fatalism and high-contrast moral pressure',
    light: 'low-key shadow geometry and narrow rim light',
  },
  oath: {
    aesthetic: 'sworn obligation made visible as dark symbolic order',
    subject: 'oath-bound contour and promise-weighted silhouette pressure',
    color: 'sealing-wax red, black vow shadow, and pale witness marks',
    light: 'narrow witness glints and solemn rim separation',
    material: 'wax, cord, old paper, rubbed metal, and pressure marks',
    composition: 'oath-line diagonals and binding intervals',
    mood: 'sworn obligation and irreversible consequence',
    finish: 'clean vow-sign readability with severe dark editorial polish',
  },
  oathforged: {
    material: 'hammered oath-metal, root fiber, and sealed cracks',
    mood: 'forged obligation and ancestral prophecy',
  },
  obsidian: {
    color: 'obsidian black, sharp reflected gray, and mineral red accents',
    light: 'knife-edge reflections across black glass',
    material: 'polished obsidian, chipped volcanic glass, and dark mineral dust',
  },
  olive: {
    color: 'olive green, marble ivory, bronze, and muted sky blue',
    material: 'olive wood, laurel leaf wax, and civic stone',
  },
  omen: {
    composition: 'omen placement, warning intervals, and charged empty space',
    mood: 'prophetic unease and disciplined anticipation',
  },
  oracle: {
    light: 'oracular glow, smoke-veiled highlights, and hidden source illumination',
    material: 'ash, smoke, polished bowl surfaces, and old paper',
    mood: 'prophecy, secrecy, and official ambiguity',
  },
  orchid: {
    color: 'night orchid violet, wax black, and cold green accents',
    material: 'petal wax, wet velvet, and shadowed botanical sheen',
  },
  orbital: {
    aesthetic: 'cosmic orbit law and gravitational ritual order',
    subject: 'forms organized by orbital pull, mass hierarchy, and circular pressure',
    material: 'black celestial dust, polished instrument rings, and abraded orbit marks',
    composition: 'orbital circles, spiral collapse, and gravitational hierarchy',
    light: 'planetary rim light and motion-like glow trails',
  },
  orisha: {
    aesthetic: 'orisha authority and thunder-charged verdict energy',
    light: 'storm flashes and sacred metal glints',
    mood: 'divine judgment with civic force',
  },
  pact: {
    composition: 'contract-like pairing and tensioned boundary lines',
    mood: 'binding agreement and dangerous reciprocity',
  },
  palm: {
    color: 'palm black, star gold, and warm green undertones',
    material: 'palm fiber, carved wood, and dry leaf edge',
  },
  pantheon: {
    composition: 'ranked divine order and trial-like grouping logic',
    mood: 'sovereign multiplicity and sacred politics',
  },
  paper: {
    material: 'washi fiber, folded edge, soot stain, and translucent paper glow',
    light: 'paper-filtered lantern bloom',
  },
  passage: {
    composition: 'crossing lines and toll-like threshold order',
    mood: 'liminal payment and irreversible transit',
  },
  path: {
    composition: 'path-like diagonals and chosen-route emphasis',
    mood: 'obligation moving through uncertainty',
  },
  petrified: {
    color: 'stone gray, dusty ivory, and fossil-dark accents',
    material: 'petrified grain, calcified edges, and stone-dry surfaces',
    mood: 'frozen manners and halted appetite',
  },
  pilgrim: {
    subject: 'devotional forward motion translated into form',
    mood: 'austere ascent and private cosmic burden',
  },
  planetary: {
    composition: 'planet-scale rings and alarm-like spatial hierarchy',
    light: 'planetary glow and black-sky contrast',
  },
  precedent: {
    composition: 'case-file bands and repeated legal markers',
    mood: 'old decisions returning with cosmic force',
  },
  processional: {
    composition: 'slow processional rhythm, repeated intervals, and ceremonial forward weight',
    mood: 'formal inevitability and collective hush',
  },
  processing: {
    material: 'salt sorting marks, residue fields, and procedural texture',
    composition: 'methodical sequence and measured occult labor',
  },
  prophecy: {
    light: 'veiled prophetic glow and root-shadow contrast',
    mood: 'future pressure and oath-bound inevitability',
  },
  protocol: {
    composition: 'stepwise ritual order and controlled procedural spacing',
    mood: 'formal supernatural method',
  },
  psalm: {
    composition: 'devotional rhythm and marker-like vertical beats',
    mood: 'sacred repetition and stone-quiet song',
  },
  purification: {
    light: 'dawn-clean light and soft washing gradients',
    mood: 'cleansing silence and restrained renewal',
  },
  rain: {
    color: 'rain-dark indigo, wet black, and reflective silver',
    light: 'wet highlights and soft storm diffusion',
    material: 'rain gloss, bead droplets, and dark slick surfaces',
  },
  rainmaker: {
    light: 'storm-charged flashes and wet communal glow',
    mood: 'public dependence, weather hunger, and engineered myth',
  },
  raven: {
    color: 'raven black, oil blue, and pale signal marks',
    composition: 'watchful signal placement and sharp angular rhythm',
  },
  reading: {
    composition: 'interpreted marks, echo rings, and careful scanning order',
    mood: 'quiet diagnosis and charged uncertainty',
  },
  red: {
    color: 'ritual red, black shadow, and pale thread highlights',
  },
  refraction: {
    light: 'split highlights and prismatic ghost edges',
    material: 'mirror glass, lens scratches, and fractured shine',
  },
  relic: {
    aesthetic: 'relic sanctity and preserved decay',
    material: 'tarnished metal, velvet dust, chipped enamel, and devotional wear',
    mood: 'fragile reverence and dangerous inheritance',
  },
  reliquary: {
    material: 'gold leaf, velvet lining, dark glass, and preserved bone-like ivory',
    composition: 'small sacred containment and frontal icon pressure',
    mood: 'protected relic gravity and forbidden tenderness',
  },
  renewal: {
    mood: 'regrowth under constraint and cyclical return',
    composition: 'looped knot logic and repaired symbol rhythm',
  },
  residue: {
    material: 'ash residue, rubbed pigment, wax smear, and forensic dust',
    mood: 'authority proven by traces rather than spectacle',
  },
  return: {
    composition: 'return-path rhythm and memorial distance',
    mood: 'aftermath recognition and controlled grief',
  },
  river: {
    color: 'river black, silver ripple, and silt brown',
    material: 'wet stone, silt, current sheen, and toll-worn metal',
  },
  rose: {
    color: 'funeral rose, bruised red, ivory, and black-green shadow',
    material: 'wilted petal velvet, thorn scratches, and waxy bloom',
  },
  rune: {
    composition: 'runic cuts, carved axes, and inscription-like spacing without readable text',
    material: 'carved wood, blackened stone, and ash-filled grooves',
  },
  ragnarok: {
    color: 'ash red, iron black, and final ember orange',
    mood: 'end-world pressure and stoic collapse',
  },
  salt: {
    color: 'salt white, black mineral shadow, and muted lunar blue',
    material: 'salt crust, crystalline dust, porous bone, and dry scrape marks',
  },
  saint: {
    aesthetic: 'fallen sanctity, martyr-icon pressure, and corrupted devotion',
    subject: 'halo-adjacent silhouette grammar without forcing a holy portrait',
    color: 'old gold, bruised crimson, smoke black, and pale relic ivory',
    light: 'thin devotional glow interrupted by noir shadow',
    material: 'varnish cracks, tarnished gold, soot, and handled enamel',
    composition: 'frontal reverence interrupted by broken off-axis tension',
    mood: 'reverence, guilt, and sacrilegious elegance',
    finish: 'sacred-image clarity with damaged-surface detail and restrained glow',
  },
  savannah: {
    color: 'dry grass gold, rain-dark green, and eclipse black',
    light: 'wide storm light and low solar darkness',
  },
  scale: {
    material: 'scale gleam, feather barbs, and judgment-weighted texture',
    composition: 'weighing symmetry and moral balance',
  },
  seal: {
    composition: 'seal placement, stamped authority, and bordered order',
    material: 'wax, cord, paper fiber, and impressed edges',
  },
  seals: {
    composition: 'seal placement, stamped authority, and bordered order',
    material: 'wax, cord, paper fiber, and impressed edges',
  },
  secrecy: {
    mood: 'withheld knowledge and veiled intent',
    light: 'occluded glow and guarded shadow',
  },
  serpent: {
    subject: 'coiling line logic and renewal-through-danger contour',
    material: 'scale sheen, black mineral, and sinuous edge highlights',
    composition: 'looping curves and oath-path movement',
  },
  shelter: {
    composition: 'protective enclosure translated into value grouping',
    mood: 'precarious safety and debt-heavy quiet',
  },
  shrine: {
    composition: 'offering-threshold order and seal-like negative space',
    light: 'soft ritual glow and snow-filtered hush',
  },
  signal: {
    composition: 'coded signal hierarchy and directional emphasis',
    light: 'beacon glints and attention-guiding pulses',
  },
  sigil: {
    composition: 'sigil geometry, ritual loops, and concentrated symbol weight',
    material: 'salt, bone dust, wax, and carved grooves',
  },
  silence: {
    mood: 'charged quiet and purified restraint',
    composition: 'spare spacing and breath-like pauses',
  },
  silent: {
    mood: 'unsounded alarm and suppressed revelation',
    light: 'bare glints with muted echo-like falloff',
  },
  sky: {
    color: 'night sky black, calabash ochre, and star white',
    composition: 'knowledge arcs and high vault spacing',
  },
  snow: {
    color: 'snow white, ink black, vermilion, and cypress green',
    light: 'diffused cold glow and quiet reflected whiteness',
    material: 'powder snow, paper seals, and cold lacquer',
  },
  solar: {
    color: 'solar gold, blood red, obsidian black, and limestone gray',
    light: 'hard solar cut and corona-like edge glow',
    composition: 'sun-axis order and cyclical recurrence',
  },
  soul: {
    mood: 'departure, weighing, and final transfer',
    light: 'pale upward glow and cold edge separation',
  },
  sovereignty: {
    mood: 'rank, weather command, and civic power',
    composition: 'dominant authority axis and ritualized public spacing',
  },
  spear: {
    subject: 'long thrust-line silhouette and martial oath emphasis',
    material: 'bronze point, leather wrap, and dust-bright edge',
  },
  spirit: {
    mood: 'ancestral presence and visible obligation',
    light: 'soft fire glow and half-seen edge light',
  },
  spiral: {
    aesthetic: 'collapsing recurrence and hypnotic inward motion',
    subject: 'forms drawn through spiral contour, inward pull, and rotational stress',
    light: 'rotating highlight bands and tightening shadow arcs',
    material: 'abraded circular marks, dark residue, and pressure-polished edges',
    composition: 'collapsing spiral, orbit decay, and inward pull',
    mood: 'fatal acceleration and hypnotic inevitability',
  },
  star: {
    aesthetic: 'astral witness logic and high-contrast memory points',
    subject: 'constellation-like emphasis and small decisive contour marks',
    color: 'star white, deep blue-black, and gold pinpricks',
    light: 'small star glints and distant high-contrast sparks',
    material: 'pinpoint mineral shine, night dust, and polished dark grain',
    composition: 'constellation spacing and navigational points',
    mood: 'remote witness, orientation, and remembered consequence',
    finish: 'pinpoint light control with clean dark-field readability',
  },
  starfall: {
    light: 'falling white sparks and impact glow',
    material: 'meteor dust, scorched paper, and basin ash',
  },
  state: {
    mood: 'state secrecy and bureaucratic dread',
    composition: 'classified order and official visual restraint',
  },
  stewardship: {
    mood: 'custodial duty and responsible power',
    composition: 'protective spacing and resource-order hierarchy',
  },
  stone: {
    color: 'stone gray, ivory dust, and mineral black',
    material: 'carved stone, weathered chips, and powder-filled cuts',
  },
  storm: {
    color: 'storm blue, dark iron, and sudden white flash',
    light: 'lightning cuts and rolling cloud shadow',
    mood: 'commanding volatility and weather law',
  },
  styx: {
    color: 'black river, coin gold, and cold gray-green',
    material: 'wet toll metal, silt, and shadowed current',
    mood: 'unavoidable passage and debt',
  },
  sun: {
    color: 'sun gold, cinder orange, and hard black contrast',
    light: 'solar rim, harsh flare control, and ritual warmth',
  },
  suns: {
    composition: 'repeated solar discs and falling-cycle intervals',
    mood: 'cosmic repetition and exhausted light',
  },
  tempered: {
    material: 'tempered metal, cooled glass, and stress-marked surfaces',
    mood: 'discipline after heat',
  },
  thing: {
    composition: 'assembly-like public deliberation order',
    mood: 'communal law under winter pressure',
  },
  thorn: {
    subject: 'thorn-like contour accents and defensive elegance',
    material: 'glass thorns, dark sap, and scratched translucent edges',
  },
  thorned: {
    subject: 'thorn pressure and sanctified pain translated into edge logic',
    material: 'thorn scratches, solar relic gold, and dry black stems',
  },
  threshold: {
    aesthetic: 'liminal authority and permission-tested boundary magic',
    subject: 'boundary-crossing contour and guarded transition behavior',
    light: 'edge glows that reveal passage pressure without opening the whole image',
    material: 'worn threshold edges, seal residue, and rubbed boundary marks',
    composition: 'threshold division, guarded negative space, and transition lines',
    mood: 'entry denied, permission tested, and liminal tension',
    finish: 'clean boundary readability with quiet denoised shadow',
  },
  thunder: {
    light: 'thunder flash, charged cloud glow, and sacred metal sparks',
    mood: 'verdict energy and sudden authority',
  },
  tidal: {
    aesthetic: 'tidal duality and moon-pulled reversal logic',
    subject: 'wave-pull contour and paired force moving through the prompt form',
    color: 'tidal green, moon white, and black-blue depth',
    light: 'moonlit wet rims and dark reflective underglow',
    material: 'water skin, salt residue, polished shell, and moon-wet edges',
    composition: 'opposing wave curves and mirrored flow',
    mood: 'dual pull and cyclical reversal',
    finish: 'clean wet-value control with readable paired motion',
  },
  toll: {
    composition: 'payment interval and passage checkpoint rhythm',
    mood: 'debt before crossing',
  },
  totem: {
    subject: 'totemic vertical mass and memory-bearing silhouette',
    material: 'dark carved wood, river stain, and hand-rubbed texture',
  },
  transit: {
    composition: 'movement arc, solar route, and timed passage',
    mood: 'inevitable motion through authority',
  },
  trial: {
    composition: 'trial order, witness spacing, and verdict hierarchy',
    mood: 'public testing and sacred pressure',
  },
  tribunal: {
    composition: 'judicial order, three-part balance, and formal accusation spacing',
    mood: 'cold procedural judgment',
  },
  trireme: {
    composition: 'oar rhythm, maritime strategy lines, and tactical forward pull',
    material: 'salted wood, bronze hardware, and sailcloth tension',
  },
  twin: {
    aesthetic: 'paired authority, mirrored fate, and divided sacred logic',
    subject: 'paired-form tension and two-sided silhouette pressure',
    color: 'split ivory, tidal green, and mirrored black values',
    light: 'paired rim lights with unequal moral weight',
    material: 'mirrored metal, wet stone, and twin-surface contrast',
    composition: 'paired forms, mirrored values, and divided authority',
    mood: 'dual sovereignty and unstable harmony',
    finish: 'clear dual-form hierarchy with no symmetrical blandness',
  },
  underworld: {
    color: 'underworld black, lantern amber, and river-green shadow',
    light: 'low underlight and guide-flame glow',
    mood: 'chthonic passage and careful dread',
  },
  valkyrie: {
    subject: 'winglike upward force and severe weighing silhouette',
    light: 'cold white lift and battlefield-absent afterglow',
  },
  veil: {
    material: 'thin veil fiber, erased ink, and smoke-soft translucency',
    light: 'occluded light and soft blocked highlights',
  },
  veiled: {
    material: 'dark veiling, rubbed leather, and hidden ink',
    mood: 'secrecy under formal restraint',
  },
  velvet: {
    color: 'deep velvet black, bruised red, and tarnished gold',
    light: 'soft pile absorption with small relic glints',
    material: 'velvet pile, dust, and crushed-fiber darkness',
  },
  verdict: {
    composition: 'verdict hierarchy, weighing lines, and finality marks',
    mood: 'lawful finality and charged silence',
  },
  vow: {
    composition: 'binding diagonals and repeated oath marks',
    mood: 'promised consequence and tense restraint',
  },
  ward: {
    subject: 'protective geometry and boundary-bearing contour',
    mood: 'guarded pressure',
  },
  warden: {
    subject: 'warding silhouette pressure and protective botanical structure',
    mood: 'custodial severity and thorned duty',
  },
  water: {
    color: 'dark water blue, black green, and silver ripple',
    light: 'wet highlights and reflected occult glow',
    material: 'water film, ripple distortion, and slick mineral edges',
  },
  weather: {
    light: 'weather-command flashes and pressure-front shadow',
    mood: 'atmospheric authority',
  },
  weave: {
    composition: 'woven fate lines and cross-thread causality',
    material: 'thread fiber, shadow knots, and tactile crossing points',
  },
  weighing: {
    composition: 'scale balance, suspended verdict, and cold symmetry',
    mood: 'final measurement and solemn consequence',
  },
  whispering: {
    aesthetic: 'intimate omen speech and hidden supernatural pressure',
    subject: 'softened contour edges that imply secrecy without muting identity',
    composition: 'close negative-space pauses and overheard visual rhythm',
    mood: 'low-voiced threat and intimate supernatural secrecy',
    light: 'small edge glows that feel overheard rather than displayed',
    finish: 'quiet edge clarity with denoised shadow and no whisper-as-text artifact',
  },
  willow: {
    composition: 'drooping line rhythm and flexible arbitration arcs',
    material: 'wet bark, thin leaves, and rain-soft edges',
  },
  wind: {
    composition: 'invisible force lines and fluttering document rhythm',
    light: 'thin moving highlights through smoke or dust',
  },
  witness: {
    mood: 'observed secrecy and testimony under pressure',
    composition: 'witness-line placement and guarded reveal',
  },
  wolf: {
    subject: 'pack-motion contour and oath momentum without fixed animal casting',
    mood: 'feral loyalty and forward danger',
  },
  worldroot: {
    subject: 'rooted mass, branching cause, and ancestral structural logic',
    material: 'dark root fiber, iron-bound cracks, and soil-dry texture',
  },
  worldtree: {
    composition: 'world-axis verticality and ash-branch division',
    material: 'charred bark, rune cuts, and frost dust',
  },
  yew: {
    color: 'yew green, ash black, and bone pale accents',
    material: 'dark yew wood, carved path marks, and old resin',
  },
  zodiac: {
    composition: 'zodiac wheel intervals and tempered destiny segments',
    light: 'small astral points and controlled circular glow',
  },
};

const GENERIC_PATTERNS = [
  /\bvisual language with a clear stylistic thesis\b/i,
  /\bUse a controlled palette that supports\b/i,
  /\bShape light and shadow for\b/i,
  /\bRender surfaces with\b.*\bmaterial logic\b/i,
  /\bCompose with\b.*\bstaging logic\b/i,
  /\bCreate a style-card that translates\b/i,
  /\bPreserve the preset identity through style mechanics\b/i,
  /\bDefine .+ through line, mass, contour\b/i,
  /\bUse lighting that makes .+ recognizable\b/i,
  /\bUse materials and textures that reinforce\b/i,
  /\bUse spatial behavior that fits\b/i,
  /\bSet a mood that belongs to\b/i,
  /\bPrioritize .+ key features\b/i,
];

const unsafeReplacements: Array<[RegExp, string]> = [
  [/\bforeground\b/gi, 'near-plane'],
  [/\bbackground\b/gi, 'distant-plane'],
  [/\bbehind\b/gi, 'layered around'],
  [/\bcentered\b/gi, 'balanced'],
  [/\bthumbnail\b/gi, 'sample image'],
  [/\bstyle-card\b/gi, 'style sample'],
  [/\bchapel\b/gi, 'sacred-architecture pressure'],
  [/\bcastle\b/gi, 'fortified authority'],
  [/\brampart\b/gi, 'raised defense rhythm'],
  [/\bruin\b/gi, 'eroded-remnant texture'],
  [/\bshrine\b/gi, 'offering-threshold order'],
  [/\bdungeon\b/gi, 'subterranean pressure'],
  [/\bcourt\b/gi, 'judicial order'],
  [/\balley\b/gi, 'narrow-passage geometry'],
  [/\bstreet\b/gi, 'public-passage rhythm'],
  [/\btemple\b/gi, 'ritual architecture'],
  [/\bcity\b/gi, 'urban-system pressure'],
  [/\bbattlefield\b/gi, 'conflict-field tension'],
  [/\bschool\b/gi, 'institutional order'],
  [/\bship\b/gi, 'vessel logic'],
  [/\barena\b/gi, 'contest-circle order'],
  [/\broom\b/gi, 'interior-system pressure'],
  [/\bforest\b/gi, 'wooded-pattern density'],
  [/\bdesert\b/gi, 'arid-field pressure'],
  [/\bkitchen\b/gi, 'service-space logic'],
  [/\blaboratory\b/gi, 'analysis-space logic'],
  [/\bbeach\b/gi, 'shoreline geometry'],
  [/\bskyline\b/gi, 'horizon profile'],
  [/\bcathedral\b/gi, 'sacred verticality'],
  [/\bmarket\b/gi, 'commerce-system rhythm'],
  [/\bvillage\b/gi, 'settlement rhythm'],
  [/\bstation\b/gi, 'transit-node order'],
  [/\bhero(es)?\b/gi, 'champion forms'],
  [/\bfigure\b/gi, 'form'],
  [/\bvisible\b/gi, 'clearly expressed'],
  [/\bwearing\b/gi, 'styled with'],
  [/\bstanding\b/gi, 'upright'],
  [/\bsitting\b/gi, 'resting'],
];

function argValue(name: string) {
  return process.argv
    .find((arg) => arg.startsWith(`--${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sentence(value: string) {
  return value.endsWith('.') ? value : `${value}.`;
}

function visualValue(manifest: StylePresetManifest, key: string) {
  const value = manifest.visualDna[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : '';
}

function isGeneric(value: string) {
  return GENERIC_PATTERNS.some((pattern) => pattern.test(value));
}

function isAlreadyEnriched(manifest: StylePresetManifest) {
  return visualValue(manifest, 'aesthetic').includes('transferable mythic-noir router');
}

function routerSafe(value: string) {
  return unsafeReplacements
    .reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value)
    .replace(/\s+/g, ' ')
    .trim();
}

function categoryId(manifest: StylePresetManifest) {
  const taxonomyCategoryId = manifest.taxonomy?.categoryId;
  if (typeof taxonomyCategoryId === 'string' && taxonomyCategoryId in categoryLanguage) {
    return taxonomyCategoryId;
  }

  const normalized = manifest.category
    .replace(/^\d+\.\s*/, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized in categoryLanguage ? normalized : 'mythic-symbolism';
}

function nameTokens(name: string) {
  return normalizeText(name)
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => token.length > 1);
}

function fallbackCue(token: string, field: keyof TokenCue) {
  const readable = token.replace(/-/g, ' ');
  switch (field) {
    case 'aesthetic':
      return `${readable} translated into dark symbolic behavior`;
    case 'subject':
      return `${readable} shaping silhouette rhythm, contour pressure, and symbolic edge control`;
    case 'color':
      return `${readable}-weighted accent roles over disciplined dark values`;
    case 'light':
      return `${readable}-weighted rim behavior, occult glow, and charged shadow`;
    case 'material':
      return `${readable}-inflected patina, residue, grain, and tactile edge behavior`;
    case 'composition':
      return `${readable} converted into repeatable spatial rhythm and symbolic hierarchy`;
    case 'mood':
      return `${readable} pressure, consequence, and symbolic tension`;
    case 'finish':
      return `${readable} recognition with denoised dark editorial polish and controlled material truth`;
    default:
      return `${readable} cue`;
  }
}

function uniquePhrases(values: string[]) {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values.map(routerSafe).filter(Boolean)) {
    const key = normalizeText(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(value);
  }

  return output;
}

function cueList(tokens: string[], field: keyof TokenCue, limit = 3) {
  const direct = tokens.flatMap((token) => {
    const value = tokenCues[token]?.[field];
    return value ? [{ token, value }] : [];
  });
  const directTokens = new Set(direct.map((entry) => entry.token));
  const directValues = direct.map((entry) => entry.value);
  const directUnique = uniquePhrases(directValues);
  if (directUnique.length >= 2) {
    return directUnique.slice(0, limit);
  }

  const fallbacks = tokens
    .filter((token) => !directTokens.has(token))
    .slice(0, 3)
    .map((token) => fallbackCue(token, field));

  return uniquePhrases([...directUnique, ...fallbacks]).slice(0, limit);
}

function joinCues(cues: string[], fallback: string) {
  const useful = uniquePhrases(cues).filter((cue) => !isGeneric(cue));
  if (useful.length === 0) return routerSafe(fallback);
  if (useful.length === 1) return useful[0];
  if (useful.length === 2) return `${useful[0]} plus ${useful[1]}`;

  return `${useful.slice(0, -1).join(', ')} plus ${useful[useful.length - 1]}`;
}

function buildCueSet(manifest: StylePresetManifest, language: CategoryMythicLanguage) {
  const tokens = nameTokens(manifest.name);
  const sourceIdentity = joinCues(cueList(tokens, 'aesthetic', 3), `${manifest.name} mythic cues`);
  const subject = joinCues(cueList(tokens, 'subject', 3), language.subjectSystem);
  const color = joinCues(cueList(tokens, 'color', 3), language.paletteLogic);
  const light = joinCues(cueList(tokens, 'light', 3), language.lightLogic);
  const material = joinCues(cueList(tokens, 'material', 3), language.materialLogic);
  const composition = joinCues(cueList(tokens, 'composition', 3), language.compositionLogic);
  const mood = joinCues(cueList(tokens, 'mood', 3), language.moodLogic);
  const finish = joinCues(cueList(tokens, 'finish', 2), language.finishLogic);

  return {
    sourceIdentity,
    subject,
    color,
    light,
    material,
    composition,
    mood,
    finish,
  };
}

function buildMythicDna(manifest: StylePresetManifest) {
  const language = categoryLanguage[categoryId(manifest)];
  const cue = buildCueSet(manifest, language);
  const featureParts = uniquePhrases([
    cue.sourceIdentity,
    cue.subject,
    cue.material,
    cue.light,
    cue.composition,
  ]).slice(0, 5);
  const briefCues = joinCues(
    [cue.sourceIdentity, cue.subject, cue.color, cue.light, cue.material, cue.composition],
    language.routerRole,
  );

  return {
    aesthetic: sentence(
      `${manifest.name} acts as a transferable mythic-noir router: ${cue.sourceIdentity} fused with ${language.routerRole}; it carries symbol, omen, ritual authority, and mature editorial restraint without locking prompt content to its sample image`,
    ),
    subject_treatment: sentence(
      `Keep the user's prompt subject, action, and context intact while reshaping identity through ${cue.subject}; forms should inherit silhouette pressure, emblem logic, ritual posture, edge weight, and motif placement instead of a mandatory actor or prop set`,
    ),
    color_and_tone: sentence(
      `Map color through ${cue.color} together with ${language.paletteLogic}; values stay separated, accents feel intentional, and the dark palette supports the requested content rather than swallowing it`,
    ),
    lighting_and_shadow: sentence(
      `Use ${cue.light} with ${language.lightLogic}; shadows must carry omen weight, rims should clarify form, and glow should behave as ritual evidence rather than decorative haze`,
    ),
    texture_and_material: sentence(
      `Render ${cue.material} alongside ${language.materialLogic}; surface scale, patina, residue, gloss, grain, and carved or sealed edges must remain coherent across characters, objects, scenes, and abstractions`,
    ),
    camera_and_composition: sentence(
      `Frame with ${cue.composition} plus ${language.compositionLogic}; the style should support portraits, objects, architecture, creatures, symbols, and full scenes through reusable spatial grammar instead of one fixed layout`,
    ),
    atmosphere_and_mood: sentence(
      `Carry mood through ${cue.mood} and ${language.moodLogic}; the image can become severe, sensual, sacred, violent, quiet, or strange when prompt X asks for it, while the preset supplies mythic consequence`,
    ),
    rendering_and_quality: sentence(
      `Finish with ${cue.finish} and ${language.finishLogic}; prioritize clean denoise, readable dark values, strong silhouette hierarchy, tactile material truth, and no watermark, fake text, logos, accidental UI, or muddy black crush`,
    ),
    key_features: featureParts.join('; '),
    creative_brief: sentence(
      `Apply ${manifest.name} after prompt X as a transferable mythic-noir layer: prompt X supplies subject, action, setting, and intensity, while this preset supplies ${briefCues}, finish discipline, and negative controls without requiring a fixed deity, ritual, prop bundle, location, or sample composition`,
    ),
  };
}

function uniqueRules(rules: string[]) {
  const normalized = new Set<string>();
  const output: string[] = [];

  for (const rule of rules) {
    const clean = routerSafe(rule.trim());
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (normalized.has(key)) continue;
    normalized.add(key);
    output.push(clean);
  }

  return output;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const force = process.argv.includes('--force');
  const presetFilter = argValue('preset');
  const fileNames = (await readdir(presetDir))
    .filter((fileName) => fileName.endsWith('.yaml'))
    .sort((first, second) => first.localeCompare(second));
  let changed = 0;

  for (const fileName of fileNames) {
    const filePath = path.join(presetDir, fileName);
    const manifest = yaml.load(await readFile(filePath, 'utf8')) as StylePresetManifest;
    if (presetFilter && manifest.id !== presetFilter) continue;
    if (!force && isAlreadyEnriched(manifest)) continue;

    const language = categoryLanguage[categoryId(manifest)];
    manifest.visualDna = {
      ...manifest.visualDna,
      ...buildMythicDna(manifest),
    };
    manifest.avoidRules = uniqueRules([
      ...(manifest.avoidRules ?? []),
      ...language.defaultAvoid,
      'fixed deity portrait',
      'required ritual scene',
      'literal sample composition',
      'generic dark fantasy',
      'muddy black crush',
      'random occult symbols',
      'watermark',
      'readable text',
      'logo',
    ]);
    manifest.attributes = {
      ...manifest.attributes,
      negativePrompt: manifest.avoidRules.join(', '),
    };

    changed += 1;

    if (dryRun) {
      console.log(`[pack14:dna] would update ${manifest.id} ${manifest.name}`);
      continue;
    }

    await writeFile(
      filePath,
      yaml.dump(manifest, {
        lineWidth: 100,
        noRefs: true,
        sortKeys: false,
      }),
      'utf8',
    );
  }

  console.log(`[pack14:dna] ${dryRun ? 'dry-run' : 'updated'} presets=${changed}`);
}

await main();
