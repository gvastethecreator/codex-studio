import type {
  StyleRuntimePack,
  StyleRuntimePreset,
} from '../../components/recipes/styles/runtimeTypes';
import { legacyBriefPacks02to06 } from './legacy-card-briefs-packs02-06';
import { legacyBriefPacks07to11 } from './legacy-card-briefs-packs07-11';
import { legacyBriefPacks12to17 } from './legacy-card-briefs-packs12-17';

type BriefPreset = Pick<StyleRuntimePreset, 'id' | 'name' | 'category'>;
type BriefPack = Pick<StyleRuntimePack, 'id'>;

// Subjects are examples for preview images only. Reusable style DNA remains the source of truth.
const BRIEFS = {
  portrait: [
    'A head-and-shoulders portrait of an adult violin maker in a plain dark shirt, direct gaze, hands outside the crop and a simple background',
    'A close portrait of an adult botanist with short curly hair, neutral clothing and an uncluttered background',
    'A three-quarter portrait of an older adult tailor in a light jacket, natural expression and a plain backdrop',
    'A waist-up portrait of an adult ceramic artist in work clothes, relaxed pose and quiet background',
    'A close portrait of an adult swimmer with damp hair and a plain pale background',
    'A portrait of an adult architect wearing glasses and a simple charcoal sweater, face clearly visible',
    'A half-body portrait of an adult gardener in an unbranded olive shirt against a clean background',
    'A three-quarter portrait of an older adult musician in a blue coat, face and fabric detail clear',
    'A head-and-shoulders portrait of an adult cyclist in everyday clothing, warm expression and neutral field',
    'A close portrait of an adult baker in a plain linen apron, natural skin detail and open background',
    'A portrait of an adult dancer in a simple black top, slight turn and clear facial expression',
    'A half-body portrait of an adult bookbinder in a brown vest, ordinary posture and uncluttered backdrop',
  ],
  scene: [
    'A blue tram crossing a rain-wet street at dusk, buildings and reflections clearly layered',
    'A red rowboat at a quiet lake shore under low morning light, water and distant trees readable',
    'An adult walking a bicycle past a brick wall in overcast daylight, full figure and wheels visible',
    'A small greenhouse at the edge of a garden after rain, glass, foliage and path distinct',
    'A lone hiker crossing an open grassy ridge under moving clouds, full silhouette and depth clear',
    'A yellow bus turning through a city square in late-afternoon light, architecture and road legible',
    'A fishing boat moving across a calm harbor, hull, wake and distant shore separated',
    'An adult reading on a park bench beneath a broad tree, body, bench and leaves clearly layered',
    'A narrow footbridge spanning a stream between green banks in midday light',
    'A night market closing after rain, one adult vendor, empty stalls and reflected light',
    'A windmill beside a low field wall at dawn, blades, roof and landscape readable',
    'An adult carrying a folded umbrella across a plaza in soft gray daylight',
    'A small mountain train crossing a stone viaduct under a pale winter sky',
    'A cyclist following a coastal road above dark-blue water, complete figure and road curve visible',
    'A quiet kitchen with one adult preparing bread beside a window, hands and room geometry clear',
    'A fox moving through tall grass beside a woodland path in autumn light',
  ],
  product: [
    'A pair of unbranded over-ear headphones on a plain surface, ear cushions and headband visible',
    'A red running shoe on a clean studio floor, laces, sole and material distinct',
    'A folded canvas backpack on a pale surface, straps and seams clearly arranged',
    'A stainless-steel wristwatch on a plain surface, face and bracelet readable without logos',
    'A blue bicycle helmet on a neutral field, vents and curved shell visible',
    'A compact unbranded camera on a clean surface, lens and body clearly separated',
    'A loaf of sourdough bread cut once on a simple board, crust and crumb readable',
    'A pair of leather walking boots on a plain floor, shape and stitching visible',
    'A small table lamp on a clean surface, shade, stem and cast shadow distinct',
    'A pair of folded eyeglasses beside their plain case, frames and lenses visible',
    'A single red lipstick with its cap beside it on a neutral surface, no branding',
    'A silver laptop partly open on a simple desk, screen blank and keyboard readable',
  ],
  nature: [
    'A red fox crossing a grassy ridge at dawn, full silhouette and habitat visible',
    'A kingfisher perched above a narrow river, plumage and water clearly separated',
    'A sea turtle swimming above a reef, shell, flippers and water depth readable',
    'A mountain valley after rain, near trees and distant peaks clearly layered',
    'A moth resting on a broad green leaf, wing shape and leaf veins visible',
    'A dog running across a meadow, full body and grass movement readable',
    'A rocky shoreline under a cloudy sky, surf and cliff edges distinct',
    'A dragonfly on a reed beside a pond, wings and surrounding plants visible',
    'A snowy forest path at dawn, foreground branches and distant clearing distinct',
    'A small owl perched on a bare branch, feathers and winter sky separated',
    'A whale surfacing in a calm sea, body, spray and horizon readable',
    'A waterfall descending through a green gorge, rocks and flowing water distinct',
  ],
  technical: [
    'An overhead security-camera view of a small empty transit platform, platform edges and exits legible',
    'A dashboard view of a city road at dusk, lanes, cars and signals readable',
    'A thermal-camera view of one person crossing an open walkway, heat zones and silhouette clear',
    'A microscope image of one pollen grain against a dark field, surface structure visible',
    'A telescope view of a spiral galaxy in a sparse star field, luminous arms readable',
    'A single blue chair on a wide pale field, clear silhouette and generous negative space',
    'A waterfall captured with long exposure, silky water against crisp dark rocks',
    'A cyclist on a street photographed with a shallow focus plane and broad soft bokeh',
    'A quiet city intersection seen from above, buildings and vehicles at miniature scale',
    'A gloved hand documenting a broken lock on a plain door, evidence detail legible',
    'A clinical close view of a hand holding an unbranded medical instrument, anatomy clear',
    'An abstract arrangement of light reflections on wet glass, coherent shapes and tonal rhythm',
  ],
  architecture: [
    'A compact public library interior with stairs, shelving and daylight through tall windows',
    'A brick courtyard with an open arcade, one tree and clear passage through the space',
    'A coastal house viewed from the garden, roofline, windows and materials readable',
    'A small train station hall with timber beams, benches and daylight',
    'A narrow urban street with varied facades and a clear walking route',
    'A quiet bedroom with a low bed, one window, textiles and visible floor plan',
    'A greenhouse with curved glazing, planting beds and a readable entry',
    'A neighborhood cafe interior with tables, wall openings and warm natural light',
    'A pedestrian bridge crossing a shallow river with supports and approaches visible',
    'A museum foyer with a stair, seating and diffused overhead light',
    'A simple hillside cabin with a porch, timber siding and surrounding trees',
    'An enclosed garden passage with stone walls, arches and soft side light',
  ],
  fashion: [
    'An adult model wearing a long blue coat, full-body standing pose against a plain field',
    'An adult model in a structured cream jacket and dark trousers, full silhouette in soft studio light',
    'An adult model walking in a loose olive outfit, fabric movement and footwear visible',
    'An adult model in a pleated coral dress, three-quarter stance and garment construction clear',
    'An adult model wearing a dark layered rain outfit, head-to-toe view in overcast light',
    'An adult model in a tailored brown suit, full-body pose and neutral background',
    'An adult model wearing a light cape over simple clothes, hem and fastening visible',
    'An adult model in a patterned blue knit outfit, full figure and textile detail readable',
    'An adult model wearing a red workwear jacket and plain trousers, full silhouette',
    'An adult model in a silver-gray layered outfit, side pose and material contrast visible',
    'An adult model wearing a long green skirt and simple top, full figure under window light',
    'An adult model in a black coat with broad collar, head-to-toe view on a clean background',
  ],
  material: [
    'A weathered wooden door with iron hinges in its wall, grain and wear visible in context',
    'A folded linen canopy catching side light, seams, fibers and shadows legible',
    'A rain-wet stone stair with moss in its joints, tactile surface and depth clear',
    'A copper roof panel with folded seams and restrained patina under grazing light',
    'A close section of rough tree bark with one green leaf as a scale cue',
    'An old leather walking boot on a plain floor, stitching and creases readable',
    'A ceramic roof tile beside neighboring tiles, glaze and edge thickness visible',
    'A woven wicker chair in a simple room, structure and individual strands legible',
    'A frosted glass window with wooden muntins and soft daylight beyond',
    'A steel bicycle frame with welds and paint wear, functional geometry intact',
    'A folded wool blanket draped across a bench, fiber and weight visible',
    'A seashell resting on damp sand at the waterline, ridges and wet surfaces clear',
  ],
  abstract: [
    'A vertical composition of three interlocking curved color fields with precise negative space',
    'A cluster of folded planar shapes casting controlled shadows across a plain field',
    'A flowing ribbon-like form crossing two translucent color layers',
    'A rhythmic arrangement of short parallel marks around one clear focal gap',
    'An irregular tessellation of rounded cells with a restrained color hierarchy',
    'A single optical spiral built from stepped arcs and open center space',
    'An arrangement of suspended rectangular planes with readable depth and overlap',
    'A branching organic form built from connected broad and fine shapes',
    'A wave of granular marks that resolves into one coherent larger form',
    'A compact geometric knot with distinct foreground and background layers',
    'A large diagonal fracture through layered color and texture fields',
    'A repeated leaf-like motif changing scale across a clear vertical rhythm',
  ],
  illustration: [
    'A blue bicycle leaning against a pale wall, complete frame and wheels visible',
    'A black cat stretching across a wooden chair in window light',
    'A sea turtle swimming above long kelp, shell and flippers intact',
    'A red fox stepping across an open meadow, full silhouette readable',
    'An adult repairing a bicycle in a simple workshop, hands and tools legible',
    'A hummingbird resting on a branch, clear side profile and open sky',
    'A small fishing boat crossing a quiet harbor, hull and wake distinct',
    'A yellow umbrella resting open beside a wet park bench',
    'An adult runner moving past a low wall, complete body and stride clear',
    'A green beetle crossing a gray stone, anatomy and surface visible',
    'A train moving through a valley under a pale cloudy sky',
    'A dog standing beside a shallow stream, pose and reflection readable',
    'A red alarm clock on a plain shelf, hands, bells and shadows legible',
    'A maple leaf drifting across a narrow creek in soft daylight',
    'An adult baker kneading dough at a plain counter, hands and action readable',
    'A blue kite flying over low grass, diamond shape and tail intact',
  ],
  character: [
    'An original adult courier walking into wind with a plain coat and shoulder bag, full figure',
    'An original adult mechanic inspecting a small machine, hands and face visible',
    'An original adult traveler pausing on a footbridge, full figure and natural pose',
    'An original adult botanist holding a field notebook with no readable writing, three-quarter view',
    'An original adult cyclist standing beside a bicycle, full silhouette and clear expression',
    'An original adult cook lifting a tray in a simple kitchen, action and hands readable',
    'An original adult gardener carrying a watering can through a plain garden, full figure',
    'An original adult musician tuning a cello in an uncluttered room, body and instrument clear',
    'An original adult navigator studying a blank map at a table, three-quarter figure',
    'An original adult carpenter measuring a timber beam, hands and tool function clear',
    'An original adult climber standing on a broad trail, complete figure and readable equipment',
    'An original adult dancer turning in a simple studio, full-body gesture clear',
  ],
} as const;

type BriefFamily = keyof typeof BRIEFS;

function familyFor(pack: BriefPack, preset: BriefPreset): BriefFamily {
  const category = (preset.category ?? '').toLowerCase();
  const name = preset.name.toLowerCase();
  if (pack.id === 'pack_01') {
    if (/portrait and studio/.test(category))
      return /fashion|editorial/.test(name) ? 'fashion' : 'portrait';
    if (/commercial and product/.test(category)) {
      return /architecture|interior|real estate/.test(name) ? 'architecture' : 'product';
    }
    if (/nature and wildlife/.test(category)) return 'nature';
    if (/technical and specialist/.test(category)) return 'technical';
    if (/rembrandt lighting|split lighting|butterfly lighting|ring light/.test(name))
      return 'portrait';
    return 'scene';
  }
  if (/portrait|headshot|character|poses|costume|fashion|wardrobe/.test(category)) {
    return pack.id === 'pack_08' ? 'fashion' : 'character';
  }
  if (/architecture|interior|building|structure/.test(category)) return 'architecture';
  if (/material|texture|fabric|surface|weathering/.test(category)) return 'material';
  if (/abstract|geometric|pattern|glitch|noise/.test(category)) return 'abstract';
  if (/landscape|environment|world|scene|film|cinema|broadcast|lighting|camera/.test(category)) {
    return 'scene';
  }
  switch (pack.id) {
    case 'pack_02':
      return 'scene';
    case 'pack_03':
      return 'illustration';
    case 'pack_05':
    case 'pack_13':
    case 'pack_16':
      return 'character';
    case 'pack_07':
      return 'architecture';
    case 'pack_08':
      return 'fashion';
    case 'pack_09':
      return 'material';
    case 'pack_10':
      return 'abstract';
    case 'pack_12':
    case 'pack_14':
    case 'pack_15':
      return 'scene';
    default:
      return 'illustration';
  }
}

function stableIndex(id: string, category: string, count: number): number {
  let hash = 2166136261;
  for (const char of `${id}|${category}`) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  }
  return (hash >>> 0) % count;
}

function photographicSubject(preset: BriefPreset): string | null {
  const name = preset.name.toLowerCase();
  const subjects: Array<[RegExp, string]> = [
    [
      /cctv security/,
      'An overhead security-camera view of a small empty transit platform, platform edges and exits legible',
    ],
    [/dashcam/, 'A dashboard view of a city road at dusk, lanes, cars and signals readable'],
    [
      /thermal camera/,
      'A thermal-camera view of one person crossing an open walkway, heat zones and silhouette clear',
    ],
    [
      /microscope/,
      'A microscope image of one pollen grain against a dark field, surface structure visible',
    ],
    [
      /telescope/,
      'A telescope view of a spiral galaxy in a sparse star field, luminous arms readable',
    ],
    [
      /minimalist photo/,
      'A single blue chair on a wide pale field, clear silhouette and generous negative space',
    ],
    [
      /abstract photo/,
      'An abstract arrangement of light reflections on wet glass, coherent shapes and tonal rhythm',
    ],
    [
      /tilt-shift/,
      'A quiet city intersection seen from above, buildings and vehicles at miniature scale',
    ],
    [
      /long exposure/,
      'A waterfall captured with long exposure, silky water against crisp dark rocks',
    ],
    [
      /bokeh panorama/,
      'An adult cyclist on a street with a shallow focus plane and broad soft bokeh',
    ],
    [
      /forensic photography/,
      'A gloved hand documenting a broken lock on a plain door, evidence detail legible',
    ],
    [
      /medical photography/,
      'A clinical close view of a hand holding an unbranded medical instrument, anatomy clear',
    ],
    [
      /drone aerial/,
      'An aerial view straight down over a river bending through forest, banks and tree canopy clearly legible',
    ],
    [
      /bioluminescence/,
      'A night shoreline with a blue bioluminescent wave curling against dark sand, natural light source clear',
    ],
    [
      /food photography/,
      'A fresh loaf of sourdough bread cut once on a simple board, crust and crumb readable',
    ],
    [
      /tech hardware hero/,
      'A silver laptop partly open on a simple desk, screen blank and keyboard readable',
    ],
    [
      /product photography|seamless packshot|e-commerce white sweep/,
      'A pair of unbranded over-ear headphones on a clean studio surface, cushions and headband fully visible',
    ],
    [
      /documentary \(war\)/,
      'An aid worker carrying supplies through a damaged rail station in daylight, person and setting readable without graphic violence',
    ],
    [
      /gopro wide/,
      'A wide first-person view from a bicycle crossing a forest trail, handlebars and winding path visible',
    ],
    [
      /street photography/,
      'An adult walking a bicycle across a rain-wet city street, figure and surrounding buildings visible',
    ],
    [
      /paparazzi style/,
      'A candid street photograph of an adult public performer leaving a theater, crowd edge and bright flash visible',
    ],
    [
      /real estate/,
      'A bright unfurnished apartment living room with windows, doorway and floor plan legible',
    ],
    [
      /wedding/,
      'Two adults exchanging wedding rings beneath a tree, both faces and hands visible in the setting',
    ],
    [
      /newborn/,
      'A sleeping newborn wrapped in a plain blanket in a caregiver’s arms, face and hands visible',
    ],
    [
      /boudoir/,
      'An adult in a simple silk robe seated beside a window, dignified pose and soft room light',
    ],
    [
      /school portrait/,
      'A school-age child in ordinary clothes standing against a plain backdrop, natural expression',
    ],
    [
      /mugshot/,
      'An adult facing the camera against a plain height-marked wall, frontal even lighting and no readable numbers',
    ],
    [
      /passport photo/,
      'An adult facing the camera against a uniform pale background, shoulders square and neutral expression',
    ],
    [
      /sports action/,
      'An adult sprinter clearing a hurdle on an outdoor track, entire stride and hurdle visible',
    ],
    [
      /concert photography/,
      'A singer performing on a small stage, microphone, crowd edge and stage light visible',
    ],
    [
      /travel photography/,
      'A traveler walking through a coastal town street, buildings, sea and full figure visible',
    ],
    [
      /urbex/,
      'An abandoned rail depot interior with broken windows, floor and roof structure visible',
    ],
    [
      /wildlife photography/,
      'A red fox crossing a grassy ridge at dawn, full silhouette and habitat visible',
    ],
    [/landscape/, 'A mountain valley after rain, near trees and distant peaks clearly layered'],
    [/pet photography/, 'A dog running across a meadow, full body and grass movement readable'],
    [
      /astrophotography/,
      'A spiral galaxy in a sparse star field, luminous arms and dark sky readable',
    ],
    [/underwater/, 'A sea turtle swimming above a reef, shell, flippers and water depth readable'],
    [
      /macro photography/,
      'A dragonfly resting on a reed beside a pond, wings and surface detail visible',
    ],
    [
      /automotive photography/,
      'A blue compact car parked on a wet city street, full body and reflections legible',
    ],
    [
      /corporate stock/,
      'Three adults collaborating around a plain table in a bright office, hands and expressions natural',
    ],
    [
      /cosmetic gloss/,
      'A single unbranded red lipstick with its cap beside it on a clean surface, controlled reflections',
    ],
    [
      /cold condensation/,
      'A chilled unbranded metal water bottle on a plain surface, droplets and silhouette clear',
    ],
    [
      /flat lay/,
      'A folded canvas backpack, sunglasses and blank notebook arranged on a plain surface from directly above',
    ],
    [
      /luxury macro/,
      'A stainless-steel wristwatch in close view, face and bracelet details readable without logos',
    ],
  ];
  return subjects.find(([pattern]) => pattern.test(name))?.[1] ?? null;
}

export function legacyCardBrief(pack: BriefPack, preset: BriefPreset): string {
  const family = familyFor(pack, preset);
  const pool = BRIEFS[family];
  const example =
    (pack.id === 'pack_01' ? photographicSubject(preset) : null) ??
    legacyBriefPacks02to06(pack, preset) ??
    legacyBriefPacks07to11(pack, preset) ??
    legacyBriefPacks12to17(pack, preset) ??
    pool[stableIndex(preset.id, preset.category ?? '', pool.length)];
  return `${example.replace(/\.+$/, '')}. Keep this one subject or scene recognizable in a portrait 3:4 composition with a clear visual hierarchy. This example belongs only to the preview card; it must not become a required subject, setting or prop in the reusable style. No card frame, labels, logos or readable text.`;
}
