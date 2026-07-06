import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import * as yaml from 'js-yaml';

import type { StylePresetManifest } from '../../components/recipes/styles/manifestTypes';

const packId = 'pack_16';
const presetDir = path.join(
  process.cwd(),
  'components',
  'recipes',
  'styles',
  'manifests',
  'presets',
  packId,
);

interface CategoryAnimeLanguage {
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

const categoryLanguage: Record<string, CategoryAnimeLanguage> = {
  '70s-and-80s-retro-anime': {
    routerRole:
      'analog cel-era anime craft with bold contour economy, painted backgrounds, limited-animation rhythm, and theatrical genre clarity',
    subjectSystem:
      'large readable silhouettes, expressive cel-line contour, emblematic pose energy, and hand-painted simplification',
    paletteLogic:
      'warm cel paint, poster-like primaries, faded film blacks, airbrushed skies, mechanical grays, and controlled neon accents',
    lightLogic:
      'painted key light, hard cel shadows, rim highlights on inked edges, practical glow, and film-era exposure falloff',
    materialLogic:
      'acetate cel grain, dry-brush background texture, airbrush gradients, analog dust, painted metal, and hand-inked edges',
    compositionLogic:
      'bold television framing, heroic diagonals, theatrical inserts, readable action lanes, and graphic silhouette staging',
    moodLogic:
      'romantic pulp, operatic melancholy, mechanical grandeur, outlaw cool, slapstick timing, and analog adventure confidence',
    finishLogic:
      'clean retro-anime finish with visible cel craft, restrained grain, stable linework, and no modern 3D or photoreal drift',
    defaultAvoid: ['modern 3d anime render', 'photoreal cosplay', 'western comic inking'],
  },
  '90s-golden-era': {
    routerRole:
      '90s golden-era anime direction with sharp cel shadows, dramatic closeups, aura effects, urban melancholy, and high-contrast compositing',
    subjectSystem:
      'strong facial planes, sharp hair and clothing edges, readable combat or emotional posture, and expressive cel timing',
    paletteLogic:
      'deep night blues, saturated aura color, jewel accents, warm skin cel tones, smoke grays, and VHS-era contrast',
    lightLogic:
      'hard-edged rim light, aura bloom, neon spill, twilight gradients, speed-flash cuts, and moody cel shadow blocks',
    materialLogic:
      'painted cels, compositing grain, inked speed marks, smoke layers, leather or metal highlights, and analog scan softness',
    compositionLogic:
      'cinematic closeups, speed-line vectors, dramatic low angles, layered profile cuts, and compressed emotional space',
    moodLogic:
      'heightened rivalry, melancholy cool, occult romance, existential drift, heroic escalation, and serious adult tone',
    finishLogic:
      'premium 90s cel finish with crisp anatomy, readable effects, denoised grain, and no cheap anime-filter smear',
    defaultAvoid: ['flat modern moe', 'generic shonen screenshot', 'messy VHS noise'],
  },
  '2000s-classics': {
    routerRole:
      '2000s anime classic grammar with cel-digital hybrid polish, genre contrast, sharper compositing, and stylized emotional escalation',
    subjectSystem:
      'clean digital-cel contour, expressive acting, controlled deformation, graphic effects, and character-independent style pressure',
    paletteLogic:
      'clean digital flats, gothic reds, cool clinical blues, warm romance pastels, pop accents, and deliberate contrast keys',
    lightLogic:
      'digital cel rim, bloom accents, dramatic night cuts, clinical overheads, magical glows, and clean compositing separation',
    materialLogic:
      'digital ink edges, subtle gradient fills, polished cloth and hair shapes, screen-like glow, and controlled texture overlays',
    compositionLogic:
      'opening-sequence energy, split-second action framing, romcom reaction spacing, gothic symmetry, and readable effect geometry',
    moodLogic:
      'genre fluency: deadpan comedy, gothic danger, romance friction, rebellion, paranoia, elegance, and pop unreality',
    finishLogic:
      'clean 2000s cel-digital finish with strong design readability, controlled effects, and no muddy low-resolution artifacting',
    defaultAvoid: ['generic isekai gloss', 'plastic digital anime', 'overbusy effects clutter'],
  },
  'studio-masterpieces': {
    routerRole:
      'prestige anime film craft with auteur composition, painterly environments, subtle acting, cinematic atmosphere, and careful color script',
    subjectSystem:
      'observational gesture, naturalistic contour, delicate shape rhythm, expressive stillness, and story-rich environmental integration',
    paletteLogic:
      'painterly color scripts, luminous sky hues, rain-soft values, warm interiors, muted grief tones, and saturated dream accents',
    lightLogic:
      'cinematic natural light, rain reflections, sky glow, dream bloom, painterly bounce, and delicate rim separation',
    materialLogic:
      'gouache-like backgrounds, watercolor gradients, fine linework, film grain, hand-painted light, and soft atmospheric texture',
    compositionLogic:
      'feature-film blocking, environmental scale, poetic negative space, quiet inserts, dream logic, and controlled camera distance',
    moodLogic:
      'lyrical longing, ecological awe, intimacy, metaphysical grief, dream collapse, humanist warmth, and mature wonder',
    finishLogic:
      'prestige anime film finish with painterly clarity, careful denoise, expressive acting, and no stock fantasy shortcut',
    defaultAvoid: [
      'generic Ghibli knockoff',
      'stock fantasy matte',
      'overprocessed anime wallpaper',
    ],
  },
  'sports-competition-and-performance': {
    routerRole:
      'sports and performance anime direction with kinetic timing, competitive psychology, body mechanics, rhythm, and impact clarity',
    subjectSystem:
      'athletic line of action, sweat-readable effort, balanced exaggeration, focused gaze logic, and performance-safe body mechanics',
    paletteLogic:
      'team color blocks, gym-light neutrals, night-race blues, stage glow, brass warmth, sweat highlights, and impact accents',
    lightLogic:
      'arena-like cel light, spotlight cuts, reflective sweat, motion streaks, instrument gleam, and high-pressure rim highlights',
    materialLogic:
      'jersey fabric, skin highlight, rubber, polished floor, instrument brass, stage dust, road grit, and speed-line overlays',
    compositionLogic:
      'vertical rallies, diagonal breakaways, spin arcs, duel spacing, ensemble grouping, and precise impact timing',
    moodLogic:
      'rivalry, obsession, comeback grit, vulnerable performance, team trust, training method, and euphoric release',
    finishLogic:
      'high-energy anime finish with clear motion, believable anatomy, denoised effects, and no sports-photo realism',
    defaultAvoid: ['photoreal sports photo', 'generic mascot art', 'bad anatomy exaggeration'],
  },
  'samurai-and-medieval': {
    routerRole:
      'prestige martial anime with restrained violence, ritual stillness, heraldic form, textile discipline, and fatal composure',
    subjectSystem:
      'poised silhouettes, controlled fabric rhythm, disciplined weapon-like lines, and withheld-motion pressure',
    paletteLogic:
      'slate neutrals, lacquer crimson, moonlit indigo, cedar brown, ember orange, and sparse metallic glints',
    lightLogic:
      'raking lateral light, warm bounce, moonlit edges, ember glow, and selective metal highlights',
    materialLogic:
      'woven cloth, lacquer, cedar grain, stone moisture, ash, polished metal, and restrained ink texture',
    compositionLogic:
      'axial pressure, ritual asymmetry, pre-impact spacing, heraldic diagonals, and calm negative space',
    moodLogic:
      'discipline, pre-impact breath, fatal code, sacred vow, controlled pressure, and quiet aftermath',
    finishLogic:
      'high-fidelity martial anime finish with calm contour clarity, micro-contrast, and zero ornamental clutter',
    defaultAvoid: ['generic samurai cosplay', 'modern firearms', 'sci-fi neon'],
  },
  horror: {
    routerRole:
      'prestige anime horror with negative space, body unease, ritual geometry, liminal dread, and controlled visual silence',
    subjectSystem:
      'sparse linework, uncanny contour, suppressed detail, marionette tension, mask geometry, and void-led form hierarchy',
    paletteLogic:
      'peat black, cold indigo, mineral gray, crimson omen accents, sickly cyan reflections, and desaturated skin tones',
    lightLogic:
      'weak nocturnal top-light, spotlight isolation, occult rim, red omen glow, and deep occlusion around visual absences',
    materialLogic:
      'water-dark stone, frayed fiber, damp paper, mask lacquer, dust, mist, and minimal noise-controlled texture',
    compositionLogic:
      'void-first framing, institutional emptiness, spotlight traps, ritual geometry, and suppressed horizon cues',
    moodLogic:
      'listening-state tension, dread, shame, taboo ceremony, unseen presence, and quiet psychological collapse',
    finishLogic:
      'minimal high-control horror anime finish with shape economy, denoised darks, and no gore-as-shortcut dependency',
    defaultAvoid: ['cheap jump scare', 'splatter-only horror', 'photoreal monster render'],
  },
};

const tokenCues: Record<string, TokenCue> = {
  action: {
    aesthetic: 'precision action timing and clear impact grammar',
    subject: 'motion-ready contour and readable force transfer',
    light: 'impact flashes and clean rim separation',
    composition: 'attack vectors, recoil spacing, and sharp action lanes',
    mood: 'momentum, danger, and controlled spectacle',
  },
  adult: {
    aesthetic: 'mature domestic anime restraint',
    color: 'warm indoor neutrals and lived-in cel tones',
    mood: 'adult intimacy, fatigue, and gentle realism',
  },
  aerial: {
    subject: 'lifted silhouettes and airborne balance',
    composition: 'vertical swoops, open-sky spacing, and flight arcs',
    light: 'sky rim light and high-altitude glow',
  },
  alchemical: {
    aesthetic: 'alchemical diagram logic and moral transmutation',
    material:
      'etched circles, chalk grain, metal, paper, and formula-like marks without readable text',
    composition: 'geometric circles, equivalent exchange symmetry, and rule-bound framing',
  },
  analog: {
    aesthetic: 'analog cel and broadcast-era adventure texture',
    material: 'film dust, cel paint, airbrush gradients, and transfer softness',
    finish: 'visible analog craft with controlled grain',
  },
  aquatic: {
    color: 'pool blues, skin highlights, and chlorine-white accents',
    light: 'water-reflected highlights and wet rim glints',
    material: 'water sheen, rubber, skin gloss, and rippled cel reflection',
  },
  arcade: {
    color: 'arcade neon, black cabinets, and saturated button accents',
    light: 'screen glow and electric rim cuts',
    mood: 'techno rebellion and playful pressure',
  },
  ascension: {
    composition: 'upward arcs, lifted gaze, and rising musical pressure',
    mood: 'breakthrough release and ecstatic climb',
  },
  astral: {
    color: 'deep space blue, star white, and operatic violet accents',
    light: 'star glints and cosmic rim light',
    composition: 'celestial scale and lonely orbit spacing',
  },
  aura: {
    color: 'saturated aura color over deep cel shadow',
    light: 'glowing energy fields and hard rim halos',
    material: 'airbrushed aura layers and inked energy edges',
  },
  baroque: {
    aesthetic: 'ornate revolutionary melodrama',
    composition: 'decorative density, courtly diagonals, and theatrical rank spacing',
    mood: 'insurgency, romance, and tragic flourish',
  },
  biomorphic: {
    subject: 'organic contour mutation and soft anatomy-adjacent forms',
    material: 'mist, membrane, wet ink, and biological surface gradients',
  },
  brass: {
    color: 'brass gold, warm stage light, and deep rehearsal-room browns',
    light: 'instrument gleam and performance spotlight',
    material: 'polished brass, breath haze, and worn lacquer',
  },
  bravado: {
    mood: 'loud courage, escalation, and impossible confidence',
    composition: 'upward thrusts and oversized heroic rhythm without forcing a hero subject',
  },
  breakout: {
    composition: 'explosive escape diagonals and frame-breaking pressure',
    mood: 'ego release and competitive self-invention',
  },
  carnival: {
    color: 'surreal fairground saturation over dream-dark values',
    composition: 'rotating spectacle rhythm and invasive dream clustering',
    mood: 'delirium, intrusion, and theatrical instability',
  },
  celestial: {
    color: 'star whites, ink blues, and cosmic violet accents',
    light: 'distant astral glints and soft heavenly bloom',
    composition: 'constellation spacing and upward poetic scale',
  },
  chorus: {
    composition: 'group rhythm, repeated profile beats, and musical spacing',
    mood: 'collective sparkle and emotional uplift',
  },
  cinematic: {
    aesthetic: 'feature-film anime blocking and deliberate camera grammar',
    light: 'cinematic bounce, controlled bloom, and graded shadow',
    composition: 'wide inserts, close emotional cuts, and scene-to-scene rhythm',
  },
  clinical: {
    color: 'cool clinical blues, whites, and sterile shadow accents',
    light: 'overhead analysis light and precise rim separation',
    mood: 'tactical detachment and nocturnal unease',
  },
  clockwork: {
    material: 'brass gears, painted metal, soot, and warm workshop dust',
    composition: 'mechanical repetition and moving-house rhythm',
  },
  collapse: {
    subject: 'deforming silhouettes and controlled breakdown of form',
    composition: 'falling axes, broken perspective, and unstable visual gravity',
    mood: 'identity failure and dream pressure',
  },
  comedy: {
    subject: 'elastic expression shifts and readable reaction shapes',
    composition: 'setup-punchline spacing and quick-cut timing',
    mood: 'deadpan escalation and humane absurdity',
  },
  comeback: {
    composition: 'recovery arcs and pressure-to-release rhythm',
    mood: 'grit, exhaustion, and earned reversal',
  },
  competition: {
    composition: 'duel spacing, scoreboard-like pressure, and performance lanes',
    mood: 'rival focus and public stakes',
  },
  cosmic: {
    color: 'cosmic blues, luminous whites, and saturated violet drift',
    light: 'starlit rim, nebula bloom, and vast dark falloff',
    composition: 'large-scale negative space and orbital emotional distance',
  },
  covenant: {
    mood: 'forbidden loyalty and gothic vow pressure',
    material: 'velvet, wax, lace shadow, and dark polished surfaces',
  },
  crimson: {
    color: 'crimson accents over black, bone, and smoky violet',
    light: 'red omen glow and ember rim cuts',
  },
  cyber: {
    aesthetic: 'cybernetic urban anime pressure',
    color: 'cyan, magenta, wet black, and screen green accents',
    light: 'monitor glow, neon spill, and hard synthetic rim light',
    material: 'cables, glass, plastic, wet pavement sheen, and scanline softness',
  },
  deadpan: {
    subject: 'minimal expression shift and timing-led humor',
    mood: 'dry absurdity and anachronistic cool',
  },
  demonic: {
    aesthetic: 'occult anime menace and mask-like supernatural pressure',
    color: 'crimson black, sickly violet, and hot ritual orange',
    mood: 'taboo horror and ecstatic danger',
  },
  deep: {
    aesthetic: 'submerged depth, lowered detail, and pressure-dark anime silence',
    subject: 'forms simplified by depth pressure and heavy negative space',
    material: 'wet dark grain, mineral haze, and compressed shadow texture',
    finish: 'deep-value control with no noisy black crush',
  },
  digital: {
    aesthetic: 'early digital anime polish and clean compositing',
    light: 'digital bloom and crisp layer separation',
    material: 'flat digital color, glow passes, and soft gradient fills',
  },
  domestic: {
    material: 'soft cloth, lived-in interiors as texture logic, and warm cel paint',
    mood: 'domestic warmth, adult care, and quiet humor',
  },
  drama: {
    composition: 'long emotional holds, close profile cuts, and tension spacing',
    mood: 'melodrama carried by acting and color timing',
  },
  dream: {
    color: 'dream pastels, saturated unreality, and soft dark contrast',
    light: 'dream bloom and unstable glow',
    composition: 'surreal transitions and elastic visual logic',
  },
  drift: {
    composition: 'sideways momentum, sliding diagonals, and nocturnal road rhythm',
    mood: 'controlled danger and late-night focus',
  },
  dusty: {
    color: 'dust-warm ochres, faded reds, and sun-bleached blacks',
    material: 'film dust, desert-like haze as texture, and worn cloth grain',
  },
  ego: {
    subject: 'self-assertive silhouette and predatory focus',
    mood: 'competitive ego pressure and breakout arrogance',
  },
  eighties: {
    aesthetic: 'eighties cel glamour and graphic analog confidence',
    color: 'teal, magenta, chrome gray, and warm cel skin tones',
    finish: 'crisp eighties cel finish with restrained grain',
  },
  elastic: {
    subject: 'rubber-band gesture and exaggerated but controlled deformation',
    composition: 'stretch timing and squash-release rhythm',
  },
  ember: {
    color: 'ember orange, smoke black, and hot crimson accents',
    light: 'low fire glow and ash-soft rim light',
    material: 'soot, sparks, warm dust, and charred paint texture',
  },
  ensemble: {
    composition: 'multi-person rhythm translated into grouped visual beats',
    mood: 'collective focus and interlocking performance energy',
  },
  epic: {
    composition: 'large-scale blocking and mythic distance',
    mood: 'operatic consequence and world-scale stakes',
  },
  feedback: {
    material: 'speaker fuzz, cable clutter, and rough photocopy-like texture',
    mood: 'raw youth pressure and sonic abrasion',
  },
  festive: {
    color: 'festival brights, stage accents, and warm crowd glow',
    mood: 'idol energy and public sprint euphoria',
  },
  flow: {
    subject: 'fluid gesture paths and continuous motion readability',
    composition: 'curved movement lanes and trick-flow rhythm',
  },
  formation: {
    composition: 'group formation geometry and sacrificial symmetry',
    mood: 'collective resolve and ritualized teamwork',
  },
  geometry: {
    aesthetic: 'symbolic geometry and rule-bound visual pressure',
    composition: 'hard axes, repeated shapes, and measured ritual spacing',
    material: 'inked lines, paper texture, lacquer edges, and graphic cuts',
  },
  gothic: {
    aesthetic: 'gothic anime elegance and ornate shadow discipline',
    color: 'black, crimson, bone white, violet, and polished gold accents',
    light: 'candle-like glow, hard rim, and velvet shadow',
    material: 'lace, polished metal, dark cloth, stained glass color, and inked ornament',
  },
  grit: {
    material: 'sweat, scuffed floor, fabric strain, and rough cel shading',
    mood: 'earned fatigue and stubborn comeback force',
  },
  grotesque: {
    aesthetic: 'grotesque body unease with prestige anime restraint',
    subject: 'distorted contour, puppet tension, and controlled anatomical wrongness',
    material: 'waxy skin, frayed fabric, lacquer, and low-noise shadow texture',
    mood: 'abjection without splatter dependency',
  },
  heist: {
    aesthetic: 'caper timing and elegant outlaw anime cool',
    composition: 'sneak-path diagonals, object beats, and jazz-cut pacing',
    mood: 'witty danger and stylish improvisation',
  },
  heraldic: {
    subject: 'emblem-bearing silhouettes and banner-like contour logic',
    color: 'lacquer crimson, slate, gold, and heraldic dark neutrals',
    composition: 'crest-like symmetry and severe diagonal rank',
    mood: 'vow, lineage, and public symbolic weight',
  },
  hero: {
    subject: 'lead-form energy without requiring a fixed protagonist',
    mood: 'adventure confidence and aspirational resolve',
  },
  heroism: {
    subject: 'lead-form energy and cosmic bravery without fixed protagonist casting',
    mood: 'earnest courage and mythic escalation',
  },
  humanist: {
    aesthetic: 'humanist observation and gentle character empathy',
    subject: 'subtle acting, modest posture, and lived-in gesture',
    mood: 'warmth, patience, and moral attention',
  },
  hyperkinetic: {
    subject: 'extreme speed deformation and readable impact silhouettes',
    composition: 'rapid diagonals, motion smears, and kinetic compression',
  },
  identity: {
    subject: 'unstable self-image and mirrored expression logic',
    composition: 'reflection cuts, doubled profiles, and fractured self-framing',
    mood: 'dissociation and psychological suspense',
  },
  impact: {
    light: 'white impact flashes and hard shadow breaks',
    composition: 'impact bursts, recoil spacing, and force-centered cuts',
    mood: 'violent punctuation without gore dependency',
  },
  indie: {
    color: 'muted indie palette, warm lamps, and intimate low saturation',
    mood: 'private confession and unguarded performance',
  },
  institutional: {
    aesthetic: 'institutional dread and rule-bound visual order',
    composition: 'corridor-like repetition converted into abstract spacing',
    mood: 'authority, emptiness, and liminal anxiety',
  },
  intimate: {
    subject: 'close acting detail and vulnerable posture',
    composition: 'tight emotional distance and soft negative space',
    mood: 'confession, tenderness, and exposed quiet',
  },
  iron: {
    color: 'iron gray, smoke black, and rust-red accents',
    material: 'worn metal, soot, chipped paint, and heavy mechanical planes',
  },
  jazzy: {
    aesthetic: 'jazz-cut anime cool and syncopated caper rhythm',
    color: 'smoky blues, amber club warmth, black ink, and brass highlights',
    light: 'spotlight slashes, smoky bounce, and amber rim light',
    composition: 'syncopated cuts, off-beat diagonals, and stylish negative space',
    mood: 'cool improvisation and adult mischief',
  },
  lyrical: {
    composition: 'poetic spacing, fluid inserts, and breath-led rhythm',
    mood: 'lyrical wonder and open emotional drift',
  },
  liminal: {
    aesthetic: 'threshold unease and suspended transition',
    composition: 'in-between spacing, empty pauses, and transition lines',
    mood: 'not-yet-arrived tension and quiet dread',
  },
  machinery: {
    subject: 'mechanical mass simplified into readable anime silhouettes',
    color: 'olive gray, industrial blue, hazard accents, and cel-shadow blacks',
    material: 'painted metal, panel seams, oil, exhaust haze, and worn plating',
  },
  magical: {
    color: 'sparkling pink, moon blue, gold, and pearl highlights',
    light: 'magical glow, starbursts, and clean transformation rim light',
    material: 'sparkle overlays, smooth cel gradients, and decorative ink accents',
  },
  marionette: {
    subject: 'jointed unease and puppet-like contour tension',
    composition: 'string-like lines and spotlight isolation',
    mood: 'uncanny performance and body horror restraint',
  },
  mask: {
    subject: 'covered identity, flattened face planes, and ceremonial profile pressure',
    material: 'lacquer, fabric, rubbed paint, and hard shadow edges',
    composition: 'frontal mask geometry and trapped gaze spacing',
  },
  mechanical: {
    aesthetic: 'mechanical grandeur with hand-painted machine fetish detail',
    material: 'rivets, painted steel, oil haze, exhaust, and cel-highlighted panels',
    composition: 'machine-scale diagonals and cockpit-like density without fixed vehicles',
  },
  melancholy: {
    color: 'dusky blues, muted violets, and warm lonely accents',
    mood: 'romantic melancholy and reflective distance',
  },
  mirror: {
    composition: 'reflected profiles, doubled frames, and self-image fractures',
    light: 'glass glints and fractured rim highlights',
    material: 'mirror sheen, polished floors, and reflective cel layers',
  },
  moonlit: {
    color: 'moonlit indigo, slate gray, and small silver-white edge notes',
    light: 'cool moon rim and restrained nocturnal bounce',
    mood: 'ascetic quiet and night discipline',
  },
  noble: {
    subject: 'upright elegance and aristocratic contour restraint',
    color: 'royal blue, gold, pearl, and clean cel whites',
    mood: 'elegant comedy and high-status emotional restraint',
  },
  nocturnal: {
    color: 'night blue, black violet, sodium orange, and cold cyan',
    light: 'night rim, wet reflections, and sparse practical glow',
    mood: 'late-hour focus and hidden tension',
  },
  obsessive: {
    composition: 'repeated practice lines and fixation-heavy framing',
    mood: 'obsession, rehearsal, and tight internal pressure',
  },
  ocean: {
    color: 'deep ocean blue, bioluminescent cyan, and pearl-white highlights',
    light: 'underwater caustic glow and cosmic surface shimmer',
    material: 'water grain, foam, wet skin sheen, and luminous particulate',
  },
  omen: {
    color: 'crimson omen accents, cold black, and desaturated pale values',
    light: 'small warning glow and hard supernatural rim cuts',
    mood: 'prophetic dread and symbolic threat',
  },
  opera: {
    aesthetic: 'operatic scale and theatrical anime melodrama',
    composition: 'stage-like depth, grand profiles, and sweeping diagonals',
    mood: 'tragic grandeur and sung emotional scale',
  },
  otomo: {
    aesthetic: 'Otomo-style urban density, hard machinery, and kinetic collapse',
    material: 'concrete, cables, painted metal, dust, and hard cel highlights',
    composition: 'dense urban compression and explosive motion geometry',
  },
  performance: {
    subject: 'performer focus, hand detail, breath rhythm, and practiced posture',
    light: 'spotlight cuts and stage bounce',
    composition: 'stage spacing, ensemble timing, and audience-pressure framing',
  },
  phantom: {
    light: 'faint afterimages and spectral speed trails',
    composition: 'misdirection lanes and ghosted teamplay spacing',
  },
  philosophical: {
    mood: 'existential pressure and analytical melancholy',
    composition: 'recursive framing and vertigo-like intellectual distance',
  },
  physical: {
    subject: 'body-weight mechanics and tangible contact impact',
    material: 'sweat, fabric pull, scuffed skin highlights, and gym dust',
  },
  poetic: {
    composition: 'poetic stillness, reflex focus, and off-center detail cuts',
    mood: 'quiet concentration and sensory precision',
  },
  pop: {
    color: 'bright pop flats, candy accents, and high-key cel contrast',
    light: 'clean graphic highlights and playful glow',
    mood: 'buoyant unreality and fast visual confidence',
  },
  precision: {
    subject: 'precise anatomy, controlled deformation, and crisp effect edges',
    composition: 'clean timing windows and exact visual hierarchy',
    finish: 'sharp cel clarity with no smeared effects',
  },
  pre: {
    composition: 'withheld-motion setup and pre-impact pause',
    mood: 'breath control before release',
  },
  punk: {
    color: 'black, crimson, acidic accent color, and dirty highlights',
    material: 'scuffed leather, ink texture, metal pins, and rough fabric',
    mood: 'rebellion, alienation, and abrasive style pressure',
  },
  rally: {
    composition: 'vertical lift, team clustering, and call-and-response energy',
    mood: 'collective push and loud competitive hope',
  },
  rain: {
    color: 'wet blues, gray greens, and warm reflected lights',
    light: 'rain reflections, window glow, and soft rim breaks',
    material: 'wet pavement sheen, droplets, damp cloth, and softened linework',
  },
  rebellion: {
    composition: 'upward diagonals, opposing masses, and defiant spacing',
    mood: 'defiance, risk, and group resolve',
  },
  reflex: {
    subject: 'micro-gesture precision and focused eye-line logic',
    composition: 'anticipation spacing and reaction timing',
  },
  resonance: {
    light: 'vibration-like glow and tonal highlight pulses',
    mood: 'emotional vibration and music-led connection',
  },
  retro: {
    aesthetic: 'retro cel animation charm and old-broadcast graphic confidence',
    color: 'faded primaries, warm blacks, and printed-cel saturation',
    material: 'cel grain, dust, airbrush, and analog transfer softness',
  },
  ritual: {
    aesthetic: 'formal rite pressure and ceremonial anime severity',
    material: 'wax, cloth, ash, lacquer, paper, and restrained blood-red marks',
    composition: 'rite intervals, axial pauses, and symbolic repetition',
    mood: 'taboo formality and controlled spiritual pressure',
  },
  rivalry: {
    composition: 'opposed diagonals, stare-down spacing, and pressure lanes',
    mood: 'competitive intimacy and sharpened focus',
  },
  rogue: {
    subject: 'sleek outlaw silhouette and relaxed but dangerous gesture',
    mood: 'caper cool and mischievous confidence',
  },
  romance: {
    color: 'soft blush, winter blue, warm window light, and delicate pastels',
    light: 'diffuse romantic glow and subtle rim separation',
    mood: 'romantic hesitation, intimacy, and emotional friction',
  },
  romantic: {
    color: 'soft blush, open sky blue, and warm highlight accents',
    mood: 'romantic lift and earnest momentum',
  },
  round: {
    subject: 'rounded proportions and soft slapstick silhouette',
    composition: 'circular timing beats and friendly adventure spacing',
  },
  samurai: {
    subject: 'disciplined martial silhouette and controlled fabric rhythm',
    material: 'lacquer, cloth, steel, cedar, and inked edge detail',
  },
  sacred: {
    aesthetic: 'sacred emblem order and severe devotional anime composition',
    color: 'gold, crimson, slate, and quiet moonlit neutrals',
    mood: 'vow pressure and restrained reverence',
  },
  sea: {
    color: 'deep sea blue, pearl light, and cosmic cyan accents',
    light: 'caustic shimmer and distant oceanic glow',
    material: 'water film, foam, wet ink, and particulate glow',
  },
  space: {
    color: 'space black, star white, violet, and analog cockpit accents',
    light: 'starfield glints, monitor glow, and vacuum-like rim light',
    composition: 'lonely scale, cockpit density, and orbital emptiness',
  },
  speed: {
    subject: 'speed-line deformation and motion-readable silhouette',
    composition: 'fast diagonals, trailing smears, and compressed pursuit lanes',
  },
  spin: {
    composition: 'rotational arcs, circular blur, and balance-point tension',
    mood: 'obsessive focus and centrifugal pressure',
  },
  spotlight: {
    light: 'spotlight isolation and theatrical shadow falloff',
    composition: 'stage trap framing and confrontation focus',
  },
  stillness: {
    subject: 'poised contour, held breath, and minimal motion cues',
    composition: 'quiet axial spacing and pressure before movement',
    mood: 'disciplined restraint and suspended violence',
  },
  surrealism: {
    composition: 'dream logic, elastic perspective, and symbolic discontinuity',
    mood: 'unreality, disorientation, and poetic collapse',
  },
  synchronized: {
    composition: 'matched arcs, group timing, and ensemble symmetry',
    mood: 'trust, practiced precision, and shared air',
  },
  tactical: {
    subject: 'practical silhouettes and grounded mechanical readability',
    composition: 'mission-diagram spacing and controlled sightlines',
    mood: 'competence, pressure, and unsentimental planning',
  },
  team: {
    composition: 'group formation, call-and-response spacing, and shared motion',
    mood: 'team trust and collective effort',
  },
  teamplay: {
    composition: 'handoff vectors, misdirection lanes, and group-read clarity',
    mood: 'quiet cooperation and tactical generosity',
  },
  techno: {
    aesthetic: 'techno-noir anime signal pressure',
    color: 'cyan, black, violet, and screen green accents',
    light: 'monitor bloom, scanline glow, and synthetic rim light',
  },
  tender: {
    mood: 'tender restraint and careful emotional timing',
    light: 'soft warm highlights and small reflective glints',
  },
  threshold: {
    composition: 'liminal division, doorway-like value breaks converted into abstract spacing',
    mood: 'hesitation before emotional or supernatural transition',
  },
  tournament: {
    composition: 'versus spacing, power-up pauses, and ring-like pressure without fixed arena',
    mood: 'public challenge and escalating spirit pressure',
  },
  traditional: {
    material: 'traditional cloth, paper, wood, and acoustic instrument surfaces',
    composition: 'ceremonial ensemble spacing and formal rhythm',
  },
  training: {
    composition: 'incremental repetition, method diagrams, and progress pacing',
    mood: 'patience, discipline, and procedural growth',
  },
  velocity: {
    composition: 'speed compression, stretched perspective, and cosmic acceleration',
    light: 'motion streaks and high-energy rim trails',
  },
  vertical: {
    composition: 'vertical lift, stacked silhouettes, and upward pressure',
    subject: 'long upward pose rhythm and readable body extension',
  },
  vintage: {
    aesthetic: 'vintage anime grandeur with analog ink confidence',
    material: 'aged cel paint, airbrush, film grain, and hand-painted machinery',
  },
  void: {
    aesthetic: 'void-centered anime horror and central absence as style law',
    subject: 'silhouettes organized around absence and suppressed detail',
    color: 'void black, cold indigo, and minimal cyan reflection',
    light: 'weak peripheral glow and occluded center-weighted shadow',
    material: 'damp black stone, mist, frayed fiber, and soft occlusion grain',
    composition: 'central absence, negative space, and gravitational framing',
    mood: 'oppressive quiet and unseen presence',
    finish: 'minimal void-first finish with denoised dark value control',
  },
  warm: {
    color: 'warm cel skin tones, amber interiors, and soft golden bounce',
    light: 'warm bounce and gentle rim separation',
    mood: 'human warmth, memory, and calm emotional access',
  },
  western: {
    color: 'dust gold, faded red, and sun-baked shadow',
    composition: 'wide standoffs and absurdist horizon pressure without fixed cowboy casting',
  },
  whisper: {
    aesthetic: 'almost-heard menace and quiet psychological pressure',
    subject: 'softened edges, partial detail, and breath-close contour restraint',
    material: 'mist, paper fiber, damp air, and low-contrast ink grain',
    composition: 'near-silent spacing and attention pulled toward absence',
    mood: 'quiet dread and almost-heard presence',
    light: 'weak rim glow and soft darkness',
    finish: 'quiet horror finish with no text-as-whisper artifact',
  },
  winter: {
    color: 'winter blue, pale gray, and warm breath-like accents',
    light: 'cold diffuse light and small warm counterpoints',
    material: 'snow softness, wool texture, and chilled glass highlights',
  },
  youth: {
    subject: 'raw youthful posture and imperfect expressive energy',
    mood: 'volatile sincerity and feedback-heavy longing',
  },
  zodiac: {
    color: 'constellation blue, gold signs, and sharp cel shadow',
    composition: 'zodiac wheels, symbolic ranks, and starry diagonals',
  },
};

const genericPatterns = [
  /\bvisual language with a clear stylistic thesis\b/i,
  /\bCreate a style-card that translates\b/i,
  /\bPreserve the preset identity through style mechanics\b/i,
  /\bDefine .+ through line, mass, contour\b/i,
  /\bUse lighting that makes .+ recognizable\b/i,
  /\bUse materials and textures that reinforce\b/i,
  /\bUse spatial behavior that fits\b/i,
  /\bSet a mood that belongs to\b/i,
  /\bPrioritize .+ key features\b/i,
];

const stopWords = new Set(['a', 'an', 'and', 'of', 'the', 'style', 'with', 'to']);

const unsafeReplacements: Array<[RegExp, string]> = [
  [/\bforeground\b/gi, 'near-plane'],
  [/\bbackground\b/gi, 'distant-plane'],
  [/\bbehind\b/gi, 'layered around'],
  [/\bcentered\b/gi, 'balanced'],
  [/\bthumbnail\b/gi, 'sample image'],
  [/\bstyle-card\b/gi, 'style sample'],
  [/\bchapel\b/gi, 'sacred-architecture pressure'],
  [/\bshrine\b/gi, 'offering-threshold order'],
  [/\btemple\b/gi, 'ritual architecture'],
  [/\bcity\b/gi, 'urban-system pressure'],
  [/\bstreet\b/gi, 'public-passage rhythm'],
  [/\bschool\b/gi, 'institutional order'],
  [/\barena\b/gi, 'contest-circle order'],
  [/\broom\b/gi, 'interior-system pressure'],
  [/\bhero(es)?\b/gi, 'lead-form'],
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
  return genericPatterns.some((pattern) => pattern.test(value));
}

function isAlreadyEnriched(manifest: StylePresetManifest) {
  return visualValue(manifest, 'aesthetic').includes('transferable anime-prestige router');
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

  return normalized in categoryLanguage ? normalized : 'studio-masterpieces';
}

function nameTokens(name: string) {
  return normalizeText(name)
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

function fallbackCue(token: string, field: keyof TokenCue) {
  const readable = token.replace(/-/g, ' ');
  switch (field) {
    case 'aesthetic':
      return `a ${readable} anime direction shaped by era-aware line economy and genre tone`;
    case 'subject':
      return `contours paced by ${readable} tension, readable pose energy, and silhouette discipline`;
    case 'color':
      return `a ${readable} accent system held inside disciplined cel values`;
    case 'light':
      return `a ${readable} light logic using cel rim, glow behavior, and blocked shadow`;
    case 'material':
      return `cel paint and ink grain tuned to ${readable} material contrast`;
    case 'composition':
      return `${readable} converted into reusable framing rhythm and anime timing`;
    case 'mood':
      return `${readable} emotional pressure and genre-specific tone`;
    case 'finish':
      return `clean anime finishing that keeps ${readable} identity readable without noisy denoise`;
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
  const directUnique = uniquePhrases(direct.map((entry) => entry.value));
  if (directUnique.length >= 2) {
    return directUnique.slice(0, limit);
  }

  const fallbackLimit = directUnique.length > 0 ? 1 : Math.min(2, limit);
  const fallbacks = tokens
    .filter((token) => !directTokens.has(token))
    .slice(0, fallbackLimit)
    .map((token) => fallbackCue(token, field));

  return uniquePhrases([...directUnique, ...fallbacks]).slice(0, limit);
}

function joinCues(cues: string[], fallback: string) {
  const useful = uniquePhrases(cues).filter((cue) => !isGeneric(cue));
  if (useful.length === 0) return routerSafe(fallback);
  if (useful.length === 1) return useful[0];
  if (useful.length === 2) return `${useful[0]}, alongside ${useful[1]}`;

  return `${useful[0]}, alongside ${useful.slice(1, -1).join('; ')} and ${useful[useful.length - 1]}`;
}

function buildCueSet(manifest: StylePresetManifest, language: CategoryAnimeLanguage) {
  const tokens = nameTokens(manifest.name);

  return {
    sourceIdentity: joinCues(cueList(tokens, 'aesthetic', 3), `${manifest.name} anime cues`),
    subject: joinCues(cueList(tokens, 'subject', 3), language.subjectSystem),
    color: joinCues(cueList(tokens, 'color', 3), language.paletteLogic),
    light: joinCues(cueList(tokens, 'light', 3), language.lightLogic),
    material: joinCues(cueList(tokens, 'material', 3), language.materialLogic),
    composition: joinCues(cueList(tokens, 'composition', 3), language.compositionLogic),
    mood: joinCues(cueList(tokens, 'mood', 3), language.moodLogic),
    finish: joinCues(cueList(tokens, 'finish', 2), language.finishLogic),
  };
}

function buildAnimeDna(manifest: StylePresetManifest) {
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
      `${manifest.name} acts as a transferable anime-prestige router: ${cue.sourceIdentity}; fuse it with ${language.routerRole}; it routes era, genre, line economy, cel or digital finish, and performance tone without locking prompt content to the source title or sample image`,
    ),
    subject_treatment: sentence(
      `Preserve the prompt subject, action, and context while restyling forms through ${cue.subject}; identity should remain readable through anime contour, expression economy, pose energy, shape simplification, and effect hierarchy instead of a required canon character or title scene`,
    ),
    color_and_tone: sentence(
      `Map color through ${cue.color}; anchor it in ${language.paletteLogic}; keep value separation clean, cel flats intentional, accents purposeful, and palette behavior attached to the requested content`,
    ),
    lighting_and_shadow: sentence(
      `Use ${cue.light}; combine it with ${language.lightLogic}; shadows should read as anime light design, rims should clarify form, and glow or effects should support the prompt rather than replacing it`,
    ),
    texture_and_material: sentence(
      `Render ${cue.material}; anchor surfaces in ${language.materialLogic}; cel edges, painted surfaces, grain, cloth, metal, water, sweat, smoke, or atmosphere must stay coherent across people, objects, environments, action, and abstractions`,
    ),
    camera_and_composition: sentence(
      `Frame around ${cue.composition}, then extend it with ${language.compositionLogic}; the style should support portraits, props, machines, performances, landscapes, symbols, and full scenes through reusable anime staging grammar instead of one fixed card layout`,
    ),
    atmosphere_and_mood: sentence(
      `Carry mood through ${cue.mood}; braid it with ${language.moodLogic}; the preset can become funny, sensual, violent, quiet, tragic, romantic, or strange when prompt X asks for it while preserving the chosen anime lineage`,
    ),
    rendering_and_quality: sentence(
      `Finish with ${cue.finish}; enforce ${language.finishLogic}; prioritize clean denoise, stable anatomy or object structure, readable effects, controlled grain, no watermark, no fake text, no signature, and no photoreal or 3D-render drift`,
    ),
    key_features: featureParts.join('; '),
    creative_brief: sentence(
      `Apply ${manifest.name} after prompt X as a transferable anime-prestige layer: prompt X supplies subject, action, setting, tone, and intensity, while this preset supplies ${briefCues}, finish discipline, and negative controls without requiring a fixed canon cast, title scene, prop bundle, location, sport, instrument, weapon, or card composition`,
    ),
  };
}

function uniqueRules(rules: string[]) {
  const normalized = new Set<string>();
  const output: string[] = [];

  for (const rule of rules) {
    const clean = routerSafe(rule.trim());
    if (!clean) continue;
    const key = normalizeText(clean);
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
      ...buildAnimeDna(manifest),
    };
    manifest.avoidRules = uniqueRules([
      ...(manifest.avoidRules ?? []),
      ...language.defaultAvoid,
      'fixed canon character',
      'literal title scene',
      'required anime screenshot',
      'generic anime filter',
      'prompt-literal card',
      'muddy cel noise',
      'watermark',
      'readable text',
      'signature',
    ]);
    manifest.attributes = {
      ...manifest.attributes,
      negativePrompt: manifest.avoidRules.join(', '),
    };

    changed += 1;

    if (dryRun) {
      console.log(`[pack16:dna] would update ${manifest.id} ${manifest.name}`);
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

  console.log(`[pack16:dna] ${dryRun ? 'dry-run' : 'updated'} presets=${changed}`);
}

await main();
