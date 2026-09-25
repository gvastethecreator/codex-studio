import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'golden-hour garden postcard formula',
  'corten steel edging as default',
  'real city skyline or landmark',
  'adding a garden to an interior or object prompt',
];

// Template negatives that blocked occupants, activities or furniture a prompt may ask for, or were garbled.
const GARDEN_DROP = [
  'people',
  'person',
  'people scene',
  'bikes',
  'golfers',
  'players',
  'flag',
  'pole',
  'cup marker',
  'sofa',
  'chair',
  'bed',
  'lounge chair',
  'blanket',
  'cushion',
  'benches',
  'cold',
  'wet',
  'concrete',
  'ground-level patio',
  'ground patio',
  'mandatory interior interior zones',
  'zen interior zones',
  'hotel interior zones',
  'tourist greenhouse interior zones',
];

// Garden systems are themes over the ground plane; they never add a landscape the prompt did not ask for.
const ground =
  'Keep the requested site, subject, action and camera; reorganise ground plane, planting, edging and paths in this garden system only where the prompt has outdoor ground, and add no garden to an interior, object or portrait prompt.';

function garden(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? ground, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_07',
  category: '4. Landscape And Garden Systems',
  updates: {
    'SP07-041': {
      dna: garden({
        aesthetic:
          'Formal topiary axis: a French-style garden laid out on one central axis, with mirrored parterres of clipped box, yew cones and obelisks, raked gravel walks and stone edging.',
        color_and_tone:
          'Deep box and yew greens, pale raked gravel, limestone white, and restrained seasonal colour inside the parterre compartments; crisp value pattern.',
        lighting_and_shadow:
          'Low raking light that throws long shadows from every clipped cone and hedge, turning the plan into a pattern of light and dark stripes.',
        texture_and_material:
          'Tightly clipped box and yew with dense small-leaf surface, raked gravel, cut limestone kerbs and steps, still rectangular water basins.',
        camera_and_composition:
          'Keep the requested view; favour a centred axis or a high viewpoint that reads the mirrored plan, with the vanishing point on a focal building or basin.',
        atmosphere_and_mood: 'Ceremonial, controlled and grand, nature forced into geometry.',
        rendering_and_quality:
          'Sharp photograph with exact symmetry and crisp hedge edges, no palace postcard staging.',
        key_features:
          'single central axis; mirrored clipped box parterres; yew cones and obelisks; raked gravel walks; long raking shadows',
      }),
      avoid: [...AVOID, 'wild meadow', 'asymmetric planting', 'palace postcard'],
      dropAvoid: GARDEN_DROP,
      briefs: [
        "Formal topiary axis at a necromancer's palace at dusk: two rows of black-green yew obelisks marching down a raked gravel axis to a dark mausoleum, mirrored box parterres on either side, long shadows from every cone. Centred axis view. No text or logo.",
        'Formal topiary axis seen from high above in hoarfrost: mirrored box parterres traced in white, raked gravel walks, a frozen rectangular basin at the centre, a single adult gardener with a rake tiny in the pattern. No text or logo.',
        'Formal topiary axis as the ground for a duel at dawn: two adult duellists with rapiers facing each other on the central gravel walk between clipped yew cones, seconds waiting by a stone basin, low sun raking the hedges. No text or logo.',
      ],
    },
    'SP07-042': {
      dna: garden({
        aesthetic:
          'Cottage bloom layering: a small garden crammed with self-seeding flowers, herbs and vegetables in tiers of height, spilling over narrow brick or stone paths and low walls.',
        color_and_tone:
          'Pastel pinks, lavender blues, cream and white with deep purple and apricot accents, fresh greens, weathered brick red; soft, mixed and cheerful.',
        lighting_and_shadow:
          'Soft morning or overcast light, dappled shade from a fruit tree, flower heads backlit by low sun.',
        texture_and_material:
          'Foxgloves, hollyhocks, delphiniums, roses on old walls, lavender and catmint edging, mossy brick paths, drystone walls, a wooden gate.',
        camera_and_composition:
          'Keep the requested view; eye-level through layered flowers, tall spires in the back, low plants overhanging the path in front.',
        atmosphere_and_mood: 'Abundant, informal and homely, a garden that grew itself.',
        rendering_and_quality:
          'Natural-light photograph with individual plant species legible, no plastic flowers or show-garden gloss.',
        key_features:
          'tiered self-seeding flowers; foxglove and hollyhock spires; plants spilling over mossy brick paths; roses on old walls; lavender edging',
      }),
      avoid: [...AVOID, 'formal parterre', 'clipped hedges', 'show-garden gloss'],
      dropAvoid: GARDEN_DROP,
      briefs: [
        "Cottage bloom layering around a witch's cottage: foxgloves, monkshood, belladonna and henbane in dense tiers along a mossy brick path, an adult witch in a grey shawl cutting stems at dusk, a black goat by the gate. No text or logo.",
        "Cottage bloom layering at a beekeeper's cottage: straw skeps on a drystone wall among hollyhocks and lavender, an adult beekeeper lifting a comb, bees backlit by low morning sun. No text or logo.",
        "Cottage bloom layering in front of a village smithy: roses scrambling over the forge's stone wall, delphiniums and catmint spilling onto the path, sparks and smoke drifting from the open door behind. No text or logo.",
      ],
    },
    'SP07-043': {
      dna: garden({
        aesthetic:
          'Karesansui dry garden: a walled rectangle of raked white gravel standing for water, with a few carefully placed stones and moss islands, made to be viewed from a veranda.',
        color_and_tone:
          'White-grey gravel, dark weathered granite, velvet moss green, clay-plaster wall ochre and grey tile coping; very restrained.',
        lighting_and_shadow:
          'Low raking light across the gravel so every raked furrow casts a fine shadow line, stones throwing long shadows.',
        texture_and_material:
          'Crushed granite gravel raked in straight lines and concentric rings around stones, lichen on stone, moss islands, a tile-capped earthen wall.',
        camera_and_composition:
          'Keep the requested view; seated viewpoint from the veranda edge or an overhead plan; stones placed asymmetrically in odd-number groups.',
        atmosphere_and_mood: 'Still, meditative and abstract, a sea made of stone.',
        rendering_and_quality:
          'Crisp photograph with continuous furrow lines, no spa decor, lanterns or bamboo fountains.',
        key_features:
          'raked white gravel furrows; concentric rings around stones; odd-number stone groups; moss islands; tile-capped earthen wall',
      }),
      avoid: [...AVOID, 'pond or running water', 'lush planting', 'spa decor', 'lantern prop'],
      dropAvoid: GARDEN_DROP,
      briefs: [
        'Karesansui dry garden during the first snowfall: raked gravel furrows half filled with snow, three dark stones capped white, the tile-capped earthen wall behind, an adult in a dark wool kimono sitting on the veranda edge watching. Seated viewpoint. No text or logo.',
        'Karesansui dry garden seen straight down from above: concentric raked rings spreading around a black meteorite fallen into the gravel, straight furrows bending around it, fine furrow shadows in low light. No text or logo.',
        'Karesansui dry garden behind a requested modern concrete house: a narrow walled strip of raked gravel and two granite stones seen through a floor-to-ceiling window, the house left unchanged. No text or logo.',
      ],
    },
    'SP07-044': {
      dna: garden({
        aesthetic:
          'Postindustrial ecological promenade: an abandoned industrial site turned public landscape, keeping rails, concrete and steel ruins while pioneer planting and walkways thread through them.',
        color_and_tone:
          'Rust orange, concrete grey, blackened steel, the straw and silver of grasses, birch white and fresh greens; muted with seasonal colour in the planting.',
        lighting_and_shadow:
          'Overcast or low sidelight across rough surfaces, structures silhouetted, soft light through grasses.',
        texture_and_material:
          'Weathered concrete, riveted steel frames, old rails and sleepers, gravel ballast, birch saplings, switchgrass and asters, raised boardwalks and grated steel paths.',
        camera_and_composition:
          'Keep the requested view; show the industrial relic and the planting layered together, a walkway leading through, no postcard hero shot.',
        atmosphere_and_mood: 'Resilient, quiet and hopeful, industry giving way to growth.',
        rendering_and_quality:
          'Documentary landscape photograph with specific rust, seedheads and ballast, no generic plaza paving.',
        key_features:
          'industrial relics kept in place; pioneer birch and grasses; raised steel and timber walkways; rails and ballast; rust and concrete palette',
      }),
      avoid: [...AVOID, 'retail promenade', 'manicured lawn', 'heroic walkway postcard'],
      dropAvoid: GARDEN_DROP,
      briefs: [
        'Postindustrial ecological promenade through a former steelworks at dusk: birch trees growing out of the ore bunkers, a raised steel walkway threading between rusted blast furnaces, switchgrass glowing in low sidelight. No text or logo.',
        'Postindustrial ecological promenade inside the empty iron frame of a gasholder: a circular meadow of asters and grasses, an adult painter at an easel on the old concrete ring, overcast silver light. No text or logo.',
        'Postindustrial ecological promenade on an abandoned harbour quay: two rusted cranes standing over drifts of sea kale and grasses, a boardwalk laid over old rails and ballast, gulls on the jibs. No text or logo.',
      ],
    },
    'SP07-045': {
      dna: garden({
        aesthetic:
          'Xeriscape climate grammar: a dry-climate garden that needs no irrigation, arranged as sculptural succulents and drought grasses over gravel mulch with dry creek beds for rare rain.',
        color_and_tone:
          'Blue-grey agave, silver sage, straw grasses, ochre and rose stone, decomposed granite tan; bright dry palette with hard shadows.',
        lighting_and_shadow:
          'Hard high sun casting sharp rosette shadows, or low desert light turning grasses gold; very little shade.',
        texture_and_material:
          'Agave and yucca rosettes, barrel cactus, desert spoon, bunch grasses, decomposed granite paths, river-rock dry creek beds, boulders, dry-laid stone walls.',
        camera_and_composition:
          'Keep the requested view; spaced sculptural plants with bare gravel between them, a dry creek line leading the eye.',
        atmosphere_and_mood: 'Sparse, sun-hardened and resourceful, beauty in drought.',
        rendering_and_quality:
          'Sharp daylight photograph with crisp spines and rosette edges, no lawn, no cartoon cacti.',
        key_features:
          'spaced agave and yucca rosettes; decomposed granite paths; river-rock dry creek bed; silver drought grasses; hard sun shadows',
      }),
      avoid: [...AVOID, 'lawn', 'lush irrigated planting', 'cartoon cactus'],
      dropAvoid: GARDEN_DROP,
      briefs: [
        'Xeriscape climate grammar in the forecourt of a desert caravanserai: agave rosettes and barrel cacti spaced over decomposed granite, a river-rock dry creek winding to the gate, hard noon shadows. No text or logo.',
        'Xeriscape climate grammar during a rare downpour: the dry creek bed suddenly running with brown water between boulders, agaves beaded with rain, a coyote pausing on the gravel path. No text or logo.',
        'Xeriscape climate grammar as a firebreak garden around a mountain cabin: gravel mulch, silver sage and yucca in wide spaced clumps, a burned slope in the background, low evening light. No text or logo.',
      ],
    },
    'SP07-046': {
      dna: garden({
        aesthetic:
          'Water-horizon hospitality landscape: warm stone terraces and pools whose edges vanish into a view, with tropical planting framing still turquoise water.',
        color_and_tone:
          'Turquoise and deep teal water, warm sand-coloured stone, teak brown, glossy tropical greens; bright, warm, relaxed.',
        lighting_and_shadow:
          'Strong sun with crisp palm-leaf shadows on stone, water reflecting sky; at night, pools lit from below.',
        texture_and_material:
          'Honed limestone or sandstone coping, vanishing-edge overflows, teak decking, frangipani, palms and elephant-ear leaves, wet stone darkened at the waterline.',
        camera_and_composition:
          'Keep the requested view; low along the water surface so the pool edge merges with the horizon or view beyond.',
        atmosphere_and_mood: 'Languid, sunlit and luxurious, time slowed at the water edge.',
        rendering_and_quality:
          'Clean photograph with glassy water, crisp leaf shadows, no brand resort staging or pool party.',
        key_features:
          'vanishing-edge pool meeting the horizon; warm honed stone coping; teak decking; tropical leaf shadows; turquoise water',
      }),
      avoid: [...AVOID, 'pool party', 'brand resort styling', 'beach postcard'],
      dropAvoid: GARDEN_DROP,
      briefs: [
        "Water-horizon hospitality pool on a sea cliff at dusk: the vanishing edge merging with a violet sea where a great sea serpent arches through the swell, warm limestone coping still holding the day's heat, frangipani shadows on the stone. Low waterline view. No text or logo.",
        'Water-horizon hospitality courtyard of a desert hotel at night: a long reflecting pool lit from below, palms in stone planters, teak decking, an adult swimmer floating alone under stars. No text or logo.',
        'Water-horizon hospitality hot-spring terraces in snowy mountains: steaming stone-edged pools stepping down a slope, their edges vanishing into a valley of pines, adult bathers wrapped in towels. No text or logo.',
      ],
    },
    'SP07-047': {
      dna: garden({
        aesthetic:
          'Topiary wayfinding trap: a hedge maze of tall clipped walls, gravel paths, dead ends and a hidden centre, planned so sightlines are always broken.',
        color_and_tone:
          'Dense dark yew or hornbeam green, pale gravel, a small bright accent at the centre; high contrast between hedge mass and path.',
        lighting_and_shadow:
          'Low light cutting across hedge tops leaving paths in deep shade, fog or dusk hiding what is around the corner.',
        texture_and_material:
          'Clipped yew or hornbeam walls well above head height, crisp corners, raked gravel paths, a gravel clearing or pavilion at the centre.',
        camera_and_composition:
          'Keep the requested view; either a high overhead view revealing the puzzle or a ground view trapped between two walls with a turn ahead.',
        atmosphere_and_mood: 'Uncertain, playful and faintly menacing, the way always turning.',
        rendering_and_quality:
          'Crisp photograph with continuous hedge walls and exact corners, no readable maps or signs.',
        key_features:
          'head-high clipped hedge walls; dead-end turns; broken sightlines; gravel paths; hidden central clearing',
      }),
      avoid: [...AVOID, 'open field', 'readable maze map', 'fantasy gate arch'],
      dropAvoid: GARDEN_DROP,
      briefs: [
        'Topiary wayfinding trap seen from high above at dusk: an adult courier in a travel cloak lost three turns from the centre of a yew maze, a single lantern glowing in the hidden central clearing. No text or logo.',
        'Topiary wayfinding trap at ground level in thick fog: two walls of clipped hornbeam, a gravel path turning out of sight, the silhouette of a great hound just visible around the corner. No text or logo.',
        'Topiary wayfinding trap in deep winter: snow-capped yew walls, an adult woman in a red cloak at a dead end, her footprints looping back through the gravel paths behind her. No text or logo.',
      ],
    },
    'SP07-048': {
      dna: garden({
        aesthetic:
          'Elevated biophilic terrace: planted terraces and balconies on a building, with modular deep planters, horizontal timber decks and layered grasses and small trees in the air.',
        color_and_tone:
          'Warm timber decking, soft grasses and silvery perennials, dark planter edges, mineral gravel; green layers against sky or facade.',
        lighting_and_shadow:
          'Open sky light with wind-moved grass highlights; at night low integrated step and planter lighting.',
        texture_and_material:
          'Hardwood or thermo-treated decking, deep modular planters, ornamental grasses, multi-stem trees, gravel drainage strips, glass or steel balustrades.',
        camera_and_composition:
          'Keep the requested view; show height through the balustrade edge and what lies below, planting layered in front of the deck.',
        atmosphere_and_mood: 'Airy, calm and green, a garden lifted off the ground.',
        rendering_and_quality:
          'Natural-light photograph with real planting variety, no recognisable real skyline or landmark.',
        key_features:
          'modular deep planters; horizontal timber decks; layered grasses and multi-stem trees; integrated low lighting; height at the balustrade',
      }),
      avoid: [...AVOID, 'skyline postcard', 'lounge furniture catalogue'],
      dropAvoid: GARDEN_DROP,
      briefs: [
        'Elevated biophilic terrace on the top of a medieval stone city tower: timber decks and deep planters of grasses and dwarf pines wrapped around the battlements, the red roofs of an invented walled town far below. No text or logo.',
        'Elevated biophilic terrace outside a hospital ward: stepped planters of lavender and birch on a concrete balcony, an adult patient in a wheelchair with a nurse among the grasses, soft afternoon light. No text or logo.',
        'Elevated biophilic terrace on a cliff monastery at night: tiers of timber deck and planted grasses lit by low step lights, the dark valley and a river of cloud below the balustrade. No text or logo.',
      ],
    },
    'SP07-049': {
      dna: garden({
        aesthetic:
          'Tournament turf: precision-maintained sports turf read as landscape design, with striped mowing bands, rolling contoured greens, sharp-edged bunkers and still water edges.',
        color_and_tone:
          'Alternating light and dark greens from mowing direction, pale sand, dark water, wind-bleached rough; clean and graphic.',
        lighting_and_shadow:
          'Low morning or evening light that exaggerates stripe contrast and ground contour, dew sparkle on short grass.',
        texture_and_material:
          'Close-mown fine grass in stripes, soft rolling contours, crisp revetted or sand bunker lips, longer fescue rough, stone or timber water edges.',
        camera_and_composition:
          'Keep the requested view; high or low angle that makes stripes converge and contours read, open space as the subject.',
        atmosphere_and_mood: 'Calm, exact and expectant, space prepared for a contest.',
        rendering_and_quality:
          'Sharp landscape photograph with even stripe pattern and dew detail, no stadium branding or readable signs.',
        key_features:
          'striped mowing bands; rolling contoured greens; sharp bunker lips; dew on short grass; still water edge',
      }),
      avoid: [...AVOID, 'unmanaged meadow', 'stadium branding', 'readable signs'],
      dropAvoid: GARDEN_DROP,
      briefs: [
        'Tournament turf as the lists for a jousting tournament: two adult knights charging along a tilt barrier over perfectly striped mowing bands, pavilions at the edge, dew spraying under the hooves in low morning light. No text or logo.',
        'Tournament turf links among coastal dunes at sunrise: rolling contoured fairways with light and dark stripes, sharp revetted bunkers, wind-bleached fescue rough, a lone adult golfer silhouetted on the green. No text or logo.',
        'Tournament turf croquet lawn beside a manor house: adult players in white on stripes of dewy grass, hoops casting long shadows, a still moat edge in the foreground. No text or logo.',
      ],
    },
    'SP07-050': {
      dna: garden({
        aesthetic:
          'Botanical iron glasshouse: a Victorian curvilinear palm house of wrought-iron ribs and small curved panes, planted as a display with specimen palms, tiered beds and a spiral stair to a gallery.',
        color_and_tone:
          'White-painted or dark green ironwork, pale glass, deep glossy greens, terracotta pots and tiles; bright and light with jewel accents of flowers.',
        lighting_and_shadow:
          'Daylight through curved glass casting a fine net of rib shadows over leaves and paths; glowing from inside at dusk.',
        texture_and_material:
          'Curved wrought-iron ribs, overlapping curved glass panes, cast-iron spiral stairs and galleries, encaustic tile paths, raised beds and giant water-lily tanks.',
        camera_and_composition:
          'Keep the requested view; show the curvature of the vault overhead or the whole glass silhouette from outside, planting layered below.',
        atmosphere_and_mood: "Wondrous, collected and bright, the world's plants under one roof.",
        rendering_and_quality:
          'Crisp photograph with continuous iron curves and a legible rib-shadow net; humidity haze belongs to Conservatory Bioclimate, not here.',
        key_features:
          'curvilinear wrought-iron glass vault; net of rib shadows; specimen palms; cast-iron spiral stair and gallery; giant water-lily tank',
      }),
      avoid: [...AVOID, 'dense fog haze', 'plant shop display', 'flat greenhouse roof'],
      dropAvoid: GARDEN_DROP,
      briefs: [
        'Botanical iron glasshouse water-lily house: a giant round tank of huge lily pads under a curved iron vault, an adult botanist on a plank measuring one pad, rib shadows netting the water. No text or logo.',
        'Botanical iron glasshouse seen from outside on a snowy night: the whole curvilinear palm house glowing warm from inside, silhouettes of palms pressing against the panes, snow on every rib. No text or logo.',
        'Botanical iron glasshouse from the top of a cast-iron spiral stair: looking down into the crowns of specimen palms and tree ferns, the gallery rail curving away, sunlight falling in a net of rib shadows. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Picturesque Landscape Park',
      domain: 'English landscape park',
      tags: ['landscape-park', 'picturesque', 'pastoral'],
      dna: garden({
        aesthetic:
          'Picturesque landscape park: an idealised pastoral scene built at estate scale, with a serpentine lake, rolling grazed grass, clumps of trees and an eye-catcher temple or ruin, fenced by a hidden ha-ha.',
        color_and_tone:
          'Soft grass greens, blue-grey water, dark tree clumps, pale stone of the eye-catcher, hazy distance; painterly, low contrast.',
        lighting_and_shadow:
          'Soft hazy light with mist over water, long shadows of tree clumps on the turf, the eye-catcher lit against darker woods.',
        texture_and_material:
          'Grazed turf running to the water, oak and beech clumps, cedar specimens, a sunken ha-ha wall, a classical temple or sham ruin, reeds at the lake edge.',
        camera_and_composition:
          'Keep the requested view; long view across water to an eye-catcher, tree clumps framing the sides like stage wings.',
        atmosphere_and_mood: 'Serene, idyllic and composed, a painting made of land.',
        rendering_and_quality:
          'Painterly landscape photograph with hazy recession, no flower beds or formal hedges.',
        key_features:
          'serpentine lake; grazed turf to the water; tree clumps as stage wings; eye-catcher temple or ruin; hidden ha-ha',
      }),
      avoid: [...AVOID, 'flower beds', 'clipped topiary', 'straight axes'],
      briefs: [
        'Picturesque landscape park at dawn: a serpentine lake in mist, sheep grazing down to the water, a ruined abbey eye-catcher glowing pale on the far slope between dark beech clumps. Long view across water. No text or logo.',
        'Picturesque landscape park at the ha-ha: a red stag standing at the edge of the hidden sunken wall, the lawn of a great house behind it and rolling park beyond, soft autumn haze. No text or logo.',
        'Picturesque landscape park in a thunderstorm: a small round classical temple on a wooded knoll struck by a shaft of light, the lake whipped grey, cedar trees bending, an adult rider galloping for shelter. No text or logo.',
      ],
    },
    {
      name: 'Chahar Bagh Water Garden',
      domain: 'Persian fourfold garden',
      tags: ['chahar-bagh', 'water-channels', 'persian-garden'],
      dna: garden({
        aesthetic:
          'Chahar bagh: the Persian fourfold garden, walled and divided into four quarters by raised walkways and narrow stone water channels that meet at a central pool or pavilion.',
        color_and_tone:
          'Pale stone and brick, sky reflected in turquoise-tiled channels, deep cypress green, fruit-tree blossom and roses, dusty ochre walls; bright and clear.',
        lighting_and_shadow:
          'Strong dry sunlight with deep shade under plane trees and in the pavilion iwan, glittering light on moving water.',
        texture_and_material:
          'Cut-stone channels and carved chadar water chutes, fountain jets, tiled pool basins, raised brick walkways, sunken planting beds of fruit trees and roses, cypress rows.',
        camera_and_composition:
          'Keep the requested view; strict axial view along a channel to the pavilion, or overhead showing the four quarters.',
        atmosphere_and_mood: 'Cool, ordered and paradisal, water as the gift of the desert.',
        rendering_and_quality:
          'Clear photograph with exact axial symmetry and sparkling water, no invented calligraphy or readable inscriptions.',
        key_features:
          'four quarters divided by water channels; raised walkways over sunken beds; carved chadar water chute; central pool pavilion; cypress rows',
      }),
      avoid: [
        ...AVOID,
        'readable inscriptions',
        'lawn-only quarters',
        'irregular naturalistic pond',
      ],
      briefs: [
        'Chahar bagh water garden at dusk: adult musicians playing in a tiled pavilion where four narrow stone channels meet, fountain jets catching the last light, cypress rows and blossoming pomegranates reflected along the axis. Axial view. No text or logo.',
        'Chahar bagh water garden seen from the top of its enclosing wall: the four quarters of sunken orchards divided by raised walkways and turquoise-tiled channels, a central pool, desert mountains beyond. No text or logo.',
        'Chahar bagh water garden close to a carved chadar: water sheeting down a scalloped stone chute into a channel, an adult gardener clearing fallen petals with a wooden rake, deep plane-tree shade. No text or logo.',
      ],
    },
    {
      name: 'Moss Stroll Garden',
      domain: 'Japanese moss stroll garden',
      tags: ['moss-garden', 'stroll-garden', 'shade'],
      dna: garden({
        aesthetic:
          'Moss stroll garden: a shaded Japanese garden where many species of moss carpet the ground under maples and cedars, crossed by stepping stones around an irregular pond.',
        color_and_tone:
          'Dozens of greens from yellow to blue-green in the moss, dark cedar trunks, grey stepping stones, autumn maple red or spring lime; soft, damp and saturated.',
        lighting_and_shadow:
          'Diffuse shade under a high canopy, soft dappled spots on the moss, mist or light rain; no hard sun.',
        texture_and_material:
          'Velvet cushion mosses and feathery carpets, lichened stepping stones set in the moss, irregular pond edges, stone bridges, cedar and maple trunks.',
        camera_and_composition:
          'Keep the requested view; low camera near the moss surface, stepping-stone path winding into depth.',
        atmosphere_and_mood: 'Hushed, damp and ancient, green silence under trees.',
        rendering_and_quality:
          'Soft photograph with rich moss textures and gentle haze, no raked gravel or dry stones.',
        key_features:
          'many-species moss carpet; stepping stones set in moss; irregular pond edge; high maple and cedar canopy; diffuse damp shade',
      }),
      avoid: [...AVOID, 'raked gravel', 'bright hard sunlight', 'lawn grass'],
      briefs: [
        'Moss stroll garden in autumn rain: a curved stone bridge over a dark irregular pond, red maple leaves scattered on a carpet of many greens, cedar trunks in mist. Low camera near the moss. No text or logo.',
        'Moss stroll garden with an adult gardener crouched on the stepping stones, picking fallen needles off the moss with long bamboo tweezers, soft dappled shade all around. No text or logo.',
        'Moss stroll garden at dawn with a grey heron fishing at the pond edge beside lichened stones, mist lifting off the moss carpet, spring maple leaves glowing lime overhead. No text or logo.',
      ],
    },
    {
      name: 'Terraced Water-Stair Garden',
      domain: 'Italian Renaissance terraced garden',
      tags: ['terraced-garden', 'water-stair', 'renaissance'],
      dna: garden({
        aesthetic:
          'Terraced water-stair garden: an Italian Renaissance villa garden cut into a hillside in axial terraces, linked by balustraded stairs, with a water staircase, grottoes and fountains driven by gravity.',
        color_and_tone:
          'Warm travertine and peperino stone, dark ilex and cypress, clipped box green, silver water and moss-darkened basins; warm, noble, mid-contrast.',
        lighting_and_shadow:
          'Warm afternoon side light on stone, deep shade in grottoes and under ilex groves, sparkle on falling water.',
        texture_and_material:
          "Balustraded ramps and double stairs, a stepped catena d'acqua channel, rusticated grotto niches with dripping moss, stone basins, clipped box, stone pines.",
        camera_and_composition:
          'Keep the requested view; look up or down the hillside axis so terraces stack, the water stair as the spine of the composition.',
        atmosphere_and_mood: 'Theatrical, cool and humanist, a hillside choreographed with water.',
        rendering_and_quality:
          'Rich photograph with moss and stone detail, clean falling water, no flat parterre plain.',
        key_features:
          'stacked hillside terraces; balustraded double stairs; stepped water staircase; mossy grotto niches; ilex and cypress groves',
      }),
      avoid: [...AVOID, 'flat parterre plain', 'modern paving', 'naturalistic meadow'],
      briefs: [
        'Terraced water-stair garden seen from the bottom of the hill: a stepped water channel cascading down the central axis through five balustraded terraces, an adult woman in a long gown descending the double stair beside it, ilex groves on both sides. No text or logo.',
        'Terraced water-stair garden grotto: a rusticated niche dripping with moss where a stone sea god pours water into a shell basin, ferns in the cracks, cool green shade. No text or logo.',
        'Terraced water-stair garden from above at evening: stacked terraces of clipped box and stone basins falling toward a lake, cypress spires casting long shadows, the water stair glinting. No text or logo.',
      ],
    },
    {
      name: 'Scholar Garden Rockery',
      domain: 'Chinese scholar garden',
      tags: ['scholar-garden', 'rockery', 'framed-views'],
      dna: garden({
        aesthetic:
          'Chinese scholar garden: a walled garden of framed views, with pierced limestone rockeries, a pond with zigzag bridges, pavilions with upswept eaves and whitewashed walls opened by moon gates and lattice windows.',
        color_and_tone:
          'White plaster walls, dark grey tile, rosewood-brown timber, grey eroded rock, jade water and bamboo green, with one accent of plum blossom or maple.',
        lighting_and_shadow:
          'Soft light casting bamboo and lattice shadows onto white walls like ink painting, reflections in still water.',
        texture_and_material:
          'Pitted and perforated lake rock stacked into rockeries, white lime walls with dark tile coping, carved timber lattice windows, stone zigzag bridges, bamboo and banana plants.',
        camera_and_composition:
          'Keep the requested view; frame a composed scene through a moon gate or lattice window, layering wall, water and rock in depth.',
        atmosphere_and_mood:
          'Contemplative, poetic and intimate, a painted landscape in miniature.',
        rendering_and_quality:
          'Soft photograph with legible lattice and eroded rock, no readable calligraphy or souvenir red lanterns.',
        key_features:
          'moon gate framed views; perforated limestone rockery; zigzag stone bridge; upswept pavilion eaves; bamboo shadows on white walls',
      }),
      avoid: [...AVOID, 'readable calligraphy', 'souvenir lanterns', 'lawn'],
      briefs: [
        'Scholar garden rockery through a moon gate in spring rain: a banana plant and a perforated limestone rock framed by the circular opening, bamboo shadows on the white wall, rain rings on the pond. No text or logo.',
        'Scholar garden rockery zigzag bridge: an adult scholar in a grey robe leaning on the stone rail to feed koi, a pavilion with upswept eaves behind, plum blossom reflected in jade water. No text or logo.',
        'Scholar garden rockery in snowfall: a towering eroded lake rock capped with snow beside a dark tiled wall, a lattice window glowing warm, one red maple leaf left on a branch. No text or logo.',
      ],
    },
    {
      name: 'Naturalistic Perennial Drift',
      domain: 'naturalistic perennial planting',
      tags: ['perennial-planting', 'grasses', 'seedheads'],
      dna: garden({
        aesthetic:
          'Naturalistic perennial drift: large sweeps of grasses interwoven with repeated perennials, planted as a self-sustaining matrix and left standing through winter for structure and seedheads.',
        color_and_tone:
          'Straw, bronze and silver grasses with drifts of purple, rust and white flowers; in winter, browns and blacks rimed with frost; soft, textured, harmonious.',
        lighting_and_shadow:
          'Low backlight through grass plumes and seedheads, frost glitter in winter, soft shadows in the matrix.',
        texture_and_material:
          'Moor grass and switchgrass, coneflowers, sea holly, burnet, ironweed, dried umbels and seed spheres, mown paths cutting through.',
        camera_and_composition:
          'Keep the requested view; low among the plants with drifts overlapping in depth, a mown path or single subject in the middle distance.',
        atmosphere_and_mood: 'Wild yet composed, a meadow designed to age beautifully.',
        rendering_and_quality:
          'Natural-light photograph with specific seedhead structure and backlit plumes, no bedding annuals or bare mulch.',
        key_features:
          'grass matrix with repeated perennial drifts; seedheads left for winter; backlit plumes; mown path through; bronze and purple palette',
      }),
      avoid: [...AVOID, 'bedding annuals', 'bare mulch', 'clipped hedges'],
      briefs: [
        'Naturalistic perennial drift in deep winter: black coneflower heads and bronze grasses rimed with hoarfrost, a low sun backlighting every seed sphere, a mown path curving into mist. No text or logo.',
        'Naturalistic perennial drift at dawn with a red fox hunting through sweeps of switchgrass and purple ironweed, dew on the plumes, backlit gold. Low camera among the plants. No text or logo.',
        'Naturalistic perennial drift around a requested abandoned stone farmhouse: drifts of grasses and sea holly flowing to its walls, the house left as it is, late summer light. No text or logo.',
      ],
    },
    {
      name: 'Crevice Rock Garden',
      domain: 'alpine crevice garden',
      tags: ['crevice-garden', 'alpine', 'stone'],
      dna: garden({
        aesthetic:
          'Crevice rock garden: thin slabs of stone set on edge in parallel rows like tilted strata, with alpine cushion plants rooted deep in the narrow gaps and gravel mulch over all.',
        color_and_tone:
          'Grey, buff or slate-blue stone, silver and grey-green cushions, tiny saturated flowers in magenta, yellow and white, pale gravel; crisp and bright.',
        lighting_and_shadow:
          'Clear mountain light with hard shadows between the slabs, cushions glowing when backlit.',
        texture_and_material:
          'Split slate or sandstone slabs on edge, tight silver cushions of saxifrage and dianthus, trailing gentians, grit and gravel mulch, lichen on stone.',
        camera_and_composition:
          'Keep the requested view; low and close so the slab ridges run diagonally across the frame, plants in the gaps as jewels.',
        atmosphere_and_mood: 'Rugged, precise and delicate, mountains in miniature.',
        rendering_and_quality:
          'Sharp photograph with slab edges and tiny flowers in focus, no lawn or soft beds.',
        key_features:
          'parallel stone slabs set on edge; alpine cushions in narrow crevices; gravel mulch; tiny saturated flowers; hard crevice shadows',
      }),
      avoid: [...AVOID, 'lawn', 'mulched beds', 'boulder heap rockery'],
      briefs: [
        'Crevice rock garden on the ruined curtain wall of a mountain castle: slabs of slate set on edge along the wall walk, silver saxifrage cushions and magenta dianthus in every crack, clouds below. Diagonal slab ridges. No text or logo.',
        "Crevice rock garden beside a drystone shepherd's shelter: tilted sandstone slabs in parallel rows, trailing blue gentians, an adult shepherd resting with a tin cup, hard midday shadows. No text or logo.",
        'Crevice rock garden with a mountain ibex stepping delicately along the stone ridges, cushions of white and yellow flowers between its hooves, gravel mulch bright in the sun. No text or logo.',
      ],
    },
    {
      name: 'Cloister Herb Garth',
      domain: 'medieval monastic herb garden',
      tags: ['cloister-garden', 'herbs', 'medieval'],
      dna: garden({
        aesthetic:
          'Cloister herb garth: a medieval monastic garden enclosed by an arcaded walk, laid out in quartered raised beds edged with woven wattle or timber boards around a central well.',
        color_and_tone:
          'Sage and silver herb greens, lavender and marigold accents, honey stone arcades, wattle brown, well-stone grey; gentle, muted, warm.',
        lighting_and_shadow:
          'Soft light filling the square garth, arcade columns casting a rhythm of shadows on the walk, a bright centre.',
        texture_and_material:
          'Woven hazel wattle bed edges, beaten earth paths, rue, sage, hyssop, feverfew, lavender and marigold, a stone well head, carved capitals of the cloister arcade.',
        camera_and_composition:
          'Keep the requested view; from the arcade looking into the square garth, beds in a grid around the well.',
        atmosphere_and_mood: 'Peaceful, useful and contemplative, healing grown in order.',
        rendering_and_quality:
          'Soft daylight photograph with individual herbs legible, no readable plant labels.',
        key_features:
          'square garth inside an arcaded walk; quartered raised beds; woven wattle edging; central stone well; medicinal herbs',
      }),
      avoid: [...AVOID, 'readable plant labels', 'ornamental bedding plants', 'lawn centre'],
      briefs: [
        'Cloister herb garth at midday: an adult infirmarian in a grey habit gathering sage into a basket from a wattle-edged bed, rue and hyssop in neat squares, arcade shadows striping the walk behind her. No text or logo.',
        'Cloister herb garth at night under a full moon: silver lavender and feverfew in quartered beds around a stone well, the arcade dark, a single candle moving along the walk. No text or logo.',
        'Cloister herb garth seen from the bell tower above: a perfect square of four wattle-edged quarters around the well, marigolds as points of orange, the roofs of the arcade framing it. No text or logo.',
      ],
    },
    {
      name: 'Walled Espalier Potager',
      domain: 'walled kitchen garden',
      tags: ['kitchen-garden', 'espalier', 'walled-garden'],
      dna: garden({
        aesthetic:
          'Walled espalier potager: a brick-walled kitchen garden where fruit trees are trained flat against the warm walls in fans and tiers, and vegetables grow in box-edged geometric beds.',
        color_and_tone:
          'Warm old red brick, fresh vegetable greens and purples, blossom white or fruit red on the walls, gravel paths, glass of cold frames; warm and productive.',
        lighting_and_shadow:
          'Sun absorbed and radiated by the south wall, shadows of trained branches drawn on brick, soft light over beds.',
        texture_and_material:
          'Fan- and cordon-trained pears and apples tied to wires on brick, box edging, rows of cabbages, leeks and artichokes, terracotta forcing pots, glass cold frames, a lean-to glasshouse.',
        camera_and_composition:
          'Keep the requested view; show a trained tree flat against the wall as a pattern, beds in a grid leading to it.',
        atmosphere_and_mood: 'Orderly, bountiful and patient, a garden that feeds a house.',
        rendering_and_quality:
          'Natural-light photograph with branch-training pattern crisp on the brick, no plastic tunnels.',
        key_features:
          'fan-trained fruit trees flat on brick walls; box-edged vegetable beds; terracotta forcing pots; glass cold frames; gravel grid paths',
      }),
      avoid: [...AVOID, 'plastic polytunnels', 'freestanding orchard', 'ornamental lawn'],
      briefs: [
        'Walled espalier potager in blossom: a fan-trained pear spread flat across an old red brick wall like white lace, an adult gardener on a wooden ladder tying a branch to the wires, box-edged beds of young lettuce below. No text or logo.',
        'Walled espalier potager at the autumn harvest: cordon apples heavy with red fruit along the wall, artichokes and purple cabbages in geometric beds, a wheelbarrow of squash on the gravel path. No text or logo.',
        'Walled espalier potager on a frosty winter morning: bare trained branches drawing a candelabra pattern on the brick, terracotta forcing pots over rhubarb, glass cold frames misted inside. No text or logo.',
      ],
    },
    {
      name: 'Stepped Paddy Terraces',
      domain: 'rice terrace landscape',
      tags: ['rice-terraces', 'contour', 'agricultural-landscape'],
      dna: garden({
        aesthetic:
          'Stepped paddy terraces: hillsides carved into narrow flooded fields that follow the contours, held by earthen or stone bunds and fed by channels from the forest above.',
        color_and_tone:
          'Mirror-silver flooded pools reflecting sky, fresh seedling green, ripening gold, dark mud and earth bunds; colour changing with the season.',
        lighting_and_shadow:
          'Low sun or mist catching water in each terrace as bright curving slivers, soft shadows along the bund edges.',
        texture_and_material:
          'Curving mud or drystone retaining bunds, shallow water with seedling rows, bamboo irrigation spouts and channels, forest above the top terraces.',
        camera_and_composition:
          'Keep the requested view; contour lines stacking into layered curves across the frame, from a high viewpoint or a low bund edge.',
        atmosphere_and_mood:
          'Patient, communal and vast, a mountain shaped by generations of hands.',
        rendering_and_quality:
          'Landscape photograph with precise contour curves and water reflections, no costumed tourist staging.',
        key_features:
          'contour-following flooded terraces; earthen and stone bunds; sky reflected in each pool; irrigation channels from the forest; seasonal green-to-gold colour',
      }),
      avoid: [
        ...AVOID,
        'straight rectangular fields',
        'tourist costume staging',
        'invented cultural symbols',
      ],
      briefs: [
        'Stepped paddy terraces at dawn in the flooding season: dozens of mirror-silver pools stacked in contour curves down a mountain, mist lying in the valley, the forest dark above the top terrace. High viewpoint. No text or logo.',
        'Stepped paddy terraces at transplanting time: a line of adult farmers bent over in knee-deep water setting seedling rows, bamboo spouts pouring from the terrace above, low sun on the bund edges. No text or logo.',
        'Stepped paddy terraces at harvest seen from a stone bund: ripe gold rice curving away in layers, an adult farmer carrying a bundle of sheaves along the narrow earthen edge, storm clouds gathering. No text or logo.',
      ],
    },
  ],
};

export default spec;
