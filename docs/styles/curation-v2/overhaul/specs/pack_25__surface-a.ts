import type { Spec } from '../tools/apply';
import { design } from './_design';

// Surface & textile design (part A): R-PAT-01..10. Each style is one repeat-building rule for a surface pattern.
const S = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
) => design(name, domain, tag, 'surface', fields, avoid, briefs, { text: false, source });

const HIST = 'copied historical or cultural ornament';

const spec: Spec = {
  pack: 'pack_25',
  category: '13. Surface & Textile Design',
  newCategory: { id: 'surface-and-textile-design' },
  updates: {},
  creates: [
    S(
      'R-PAT-01',
      'Eccentric Repeat Canopies',
      'hidden-repeat branching canopy pattern',
      'eccentric-canopy',
      {
        aesthetic:
          'Eccentric Repeat Canopies: branching motifs at three scales hide the repeat through asymmetric links and irregular open spaces.',
        subject_treatment:
          "Build a repeating surface from the prompt's subject as branching motifs at three scales, linked asymmetrically across the tile edges so the repeat disappears.",
        color_and_tone:
          'Two value families for structure and secondary motifs, with sparse, scattered accents.',
        lighting_and_shadow: 'Flat printed artwork with every motif sitting on one plane.',
        texture_and_material:
          'Controlled organic contours and clean reserves with a quiet, even edge.',
        camera_and_composition:
          'Off-center focal points, branch entries matching exits on the opposite edge.',
        atmosphere_and_mood: 'Continuous expansion with irregular pauses, lush but never crowded.',
        rendering_and_quality: 'Clean repeat shown as tile and wide mosaic with complete motifs.',
        key_features: 'three-scale branches; hidden repeat; asymmetric links; irregular pauses',
      },
      ['cut-off branches', 'random variation with no links', HIST],
      [
        'A wallpaper for the throne room of a forest king: oak branches, acorns and sleeping owls at three scales hiding the repeat, deep green on bone, tile and wide mosaic. No readable text or logo.',
        'A pajama fabric of tangled spaghetti branches with tiny meatball fruit, three scales that somehow never repeat obviously, tomato red on cream. No readable text or logo.',
        'A quiet canopy of seed pods and thin stems for a bedroom curtain, two soft greys and one copper accent, large calm gaps. No readable text or logo.',
      ],
    ),
    S(
      'R-PAT-02',
      'Density Counterpoint Patterns',
      'dense and sparse rhythm pattern',
      'density-counterpoint',
      {
        aesthetic:
          'Density Counterpoint Patterns: dense clusters and open fields alternate in rhythm while the motifs keep one size and the repeat stays seamless.',
        subject_treatment:
          "Build a repeating surface from the prompt's subject where clusters and open fields alternate by spacing alone, every motif keeping its size.",
        color_and_tone: 'A short palette where density reads through count and closeness alone.',
        lighting_and_shadow: 'Flat surface with no focal light faking extra density.',
        texture_and_material: 'Crisp motifs with inspectable intervals and a uniform support.',
        camera_and_composition:
          'Three rhythm zones per tile, dense, transition and open, linked across edges.',
        atmosphere_and_mood: 'A counterpoint of breathing and gathering, calm and musical.',
        rendering_and_quality: 'Clean repeat with no collisions and smooth changes of spacing.',
        key_features: 'clusters and open fields; spacing rhythm; constant motif size; seamless',
      },
      ['gradients faking density', 'illegible pile-ups', 'accidental stripes in the mosaic', HIST],
      [
        'A fabric for a starship crew uniform where tiny star shapes cluster into dense galaxies and thin out into empty space, charcoal on sand, the repeat invisible. No readable text or logo.',
        'Wrapping paper of rubber ducks that gather in noisy crowds and then leave one duck completely alone in a huge empty space, yellow on blue. No readable text or logo.',
        'A calm pattern of curved breath-like strokes gathering and pausing, one line weight, black on white. No readable text or logo.',
      ],
    ),
    S(
      'R-PAT-03',
      'Interleaved Scale Ornament',
      'two-scale interleaved ornament',
      'interleaved-scale',
      {
        aesthetic:
          'Interleaved Scale Ornament: a large motif holds open spaces where a second smaller family nests, the two sharing meeting points.',
        subject_treatment:
          "Build a repeating surface where a large motif from the prompt's subject leaves spaces filled by a second smaller family, the two meeting at shared points.",
        color_and_tone:
          'Contrast between the two scales by value, with no third ornamental family.',
        lighting_and_shadow: 'Flat surface where crossings are resolved by clean reserves.',
        texture_and_material:
          'Clean edges and detail reduced by scale, the small family still legible.',
        camera_and_composition:
          'Off-center large motifs with small ones in specific gaps and repeatable meetings.',
        atmosphere_and_mood: 'A dialogue between far and near reading, rich and orderly.',
        rendering_and_quality: 'Clean repeat shown at two reading distances with no collisions.',
        key_features:
          'large and small families; nested gaps; shared meeting points; two reading distances',
      },
      ['the same motif just scaled', 'dirty overlaps', 'micro patterns that turn to noise', HIST],
      [
        "A silk for a sea captain's coat lining: large whales swimming with tiny ships nested in the spaces between them, ivory, graphite and rust, seen near and far. No readable text or logo.",
        'A kitchen curtain of huge teapots with tiny biscuits hiding in every gap between them, two tones, very cozy. No readable text or logo.',
        'Broad arcs with small angled brackets completing their meetings, two inks, clear both small and enlarged. No readable text or logo.',
      ],
    ),
    S(
      'R-PAT-04',
      'Warp-Weft Image Systems',
      'woven-structure image pattern',
      'warp-weft',
      {
        aesthetic:
          'Warp-Weft Image Systems: images and values emerge from which thread direction dominates at each crossing of an apparent weave.',
        subject_treatment:
          "Build the prompt's subject into an apparent woven surface where the image appears only through which thread direction dominates at each crossing.",
        color_and_tone: 'Values from warp or weft dominance, in a short palette per thread system.',
        lighting_and_shadow:
          'Minimal shade at crossings to explain order, the woven image staying flat.',
        texture_and_material: 'Threads of consistent visual weight and steady spacing.',
        camera_and_composition: 'A continuous base grid with dominance changing in blocks.',
        atmosphere_and_mood: 'A regular pulse of warp and weft with a larger figure appearing.',
        rendering_and_quality:
          'Clean weave with consistent crossings and a figure readable from afar.',
        key_features:
          'warp and weft dominance; image from crossings; steady grid; two thread systems',
      },
      ['photo with a weave overlay', 'impossible crossings', 'claims of a loom-ready draft', HIST],
      [
        "A tapestry-like woven surface where a huge wolf's face emerges only from the crossings of dark and pale threads, visible from across a great hall. No readable text or logo.",
        'A woven blanket where the image of a very unimpressed cat appears from the thread crossings, charcoal and cream. No readable text or logo.',
        'Small square windows alternating warp and weft dominance, night blue and sand, one close view and one far view. No readable text or logo.',
      ],
    ),
    S(
      'R-PAT-05',
      'Broken-Lattice Florals',
      'interrupted lattice motif pattern',
      'broken-lattice',
      {
        aesthetic:
          'Broken-Lattice Florals: a supporting lattice breaks at controlled points where stylized motifs carry its lines onward.',
        subject_treatment:
          "Build a repeating lattice that breaks at controlled points where stylized motifs from the prompt's subject continue its directions.",
        color_and_tone: 'A quieter support lattice and dominant motifs, the gaps kept active.',
        lighting_and_shadow:
          'Flat surface where every separated lattice segment stays visibly separate.',
        texture_and_material:
          'Constant lattice strokes and simplified motif masses with clean breaks.',
        camera_and_composition:
          'Offset lattice, alternating breaks and continuity at opposite edges.',
        atmosphere_and_mood: 'Order opening up and re-forming again, structured yet free.',
        rendering_and_quality: 'Clean repeat with aligned segments and deliberate open nodes.',
        key_features: 'broken lattice; motifs at breaks; offset grid; open nodes',
      },
      ['randomly broken lattice', 'mandatory flowers', 'ornament unrelated to the lattice', HIST],
      [
        'A wallpaper for a greenhouse on a frozen planet: a diagonal lattice broken wherever a strange crystal flower pushes through, deep teal and ice white. No readable text or logo.',
        'A tile pattern where small garden gnomes sit in every missing knot of a broken fence lattice, two tones, suspiciously tidy. No readable text or logo.',
        'An irregular open hexagonal net with stylized shells at chosen meetings, some knots left empty, two inks. No readable text or logo.',
      ],
    ),
    S(
      'R-PAT-06',
      'Nested Border Rhythms',
      'engineered nested border design',
      'nested-border',
      {
        aesthetic:
          'Nested Border Rhythms: border bands of different scales coordinated with an inner field and specially designed corners.',
        subject_treatment:
          "Design a bordered surface from the prompt's subject with nested bands of different scales, dedicated corner pieces and a calm inner field.",
        color_and_tone: 'Clear hierarchy between outer border, transition and inner field.',
        lighting_and_shadow: 'Flat print surface with bands lying on one plane.',
        texture_and_material:
          'Crisp contours, modules per run and corners with continuous thickness.',
        camera_and_composition:
          'Side, corner and center treated as distinct functions within set margins.',
        atmosphere_and_mood:
          'Progressive framing, a bold outer rhythm answered by a fine inner one.',
        rendering_and_quality: 'Clean design with resolved corners and no stretched runs.',
        key_features: 'nested bands; designed corners; calm center; framing rhythm',
      },
      ['universal seamless texture', 'cut corners', 'borders scaled differently per side', HIST],
      [
        'A silk scarf for a desert caravan queen: an outer border of marching camels, an inner band of tiny stars and an open sand-colored center, corners each with its own oasis. No readable text or logo.',
        'A tablecloth border of ants carrying crumbs in a perfect procession around the edge, with a small picnic at each corner, two inks. No readable text or logo.',
        'A calm rectangular frame of wide arcs, a fine notched band and an empty center, four designed corners. No readable text or logo.',
      ],
    ),
    S(
      'R-PAT-07',
      'Counterform Branch Networks',
      'positive-negative branch network',
      'counterform-network',
      {
        aesthetic:
          'Counterform Branch Networks: branches and masses placed so the spaces between them form a second continuous network.',
        subject_treatment:
          "Build a repeating surface from the prompt's subject where the spaces between the masses form a second continuous network of steady width.",
        color_and_tone: 'Two balanced values letting figure and ground swap readings.',
        lighting_and_shadow: 'Flat surface with figure and ground equally sharp.',
        texture_and_material:
          'Continuous edges and wide openings with no detail breaking the negative network.',
        camera_and_composition: 'Both networks linked across tile edges with no dead ends.',
        atmosphere_and_mood: 'Controlled ambiguity between full and empty, quietly hypnotic.',
        rendering_and_quality: 'Clean repeat with stable negative widths in both polarities.',
        key_features: 'positive and negative networks; steady gaps; linked edges; two values',
      },
      ['isolated ornamental counters', 'microscopic gaps', HIST],
      [
        'A dark forest wallpaper where black tree branches leave pale gaps shaped like a winding river path, both networks unbroken across the repeat. No readable text or logo.',
        'A pattern of fat sausages whose gaps form a second network of perfect little paths for an ant, two tones. No readable text or logo.',
        'Linked capsules whose spaces build angled channels of constant width, two inks, shown positive and negative. No readable text or logo.',
      ],
    ),
    S(
      'R-PAT-08',
      'Staggered Medallion Fields',
      'offset medallion field pattern',
      'staggered-medallion',
      {
        aesthetic:
          'Staggered Medallion Fields: compact units offset between rows and joined by short connectors, their orientation changing by one rule.',
        subject_treatment:
          "Build a field of compact units from the prompt's subject, offset between rows with short connectors and a declared cycle of orientations.",
        color_and_tone: 'Main value for units and a secondary one for links.',
        lighting_and_shadow: 'Flat silhouettes of equal weight across the field.',
        texture_and_material:
          'Defined edges and minimal interior detail in an original vocabulary.',
        camera_and_composition:
          'Alternating offset and orientation with a declared period and no accidental columns.',
        atmosphere_and_mood: 'A field of small related presences with pauses and meetings.',
        rendering_and_quality:
          'Clean repeat with intact contours and connectors at equivalent points.',
        key_features: 'offset rows; short connectors; orientation cycle; original units',
      },
      ['mandatory circles', 'copied historical emblems', 'random orientation', HIST],
      [
        'A velvet for a secret society of astronomers: small telescope-shaped medallions in offset rows, each turned a little more toward an invisible star, linked by thin chains. No readable text or logo.',
        'A field of tiny toasters in offset rows, each one rotated a quarter turn from the last, joined by little cords, toast popping out in rhythm. No readable text or logo.',
        'A calm field of trapezoid medallions with one inner window each, rows offset by half a unit and turning by one quiet rule, dark blue on cream. No readable text or logo.',
      ],
    ),
    S(
      'R-PAT-09',
      'Topographic Thread Bands',
      'sinuous banded thread pattern',
      'topographic-thread',
      {
        aesthetic:
          'Topographic Thread Bands: sinuous bands that keep their spacing like layers of flat cord, compressing and relaxing across the surface.',
        subject_treatment:
          "Build a repeating surface of sinuous flat bands inspired by the prompt's subject, keeping spacing steady and entries matching exits at the edges.",
        color_and_tone: 'A short sequential palette that separates each band from its neighbors.',
        lighting_and_shadow: 'Optional soft side light, the path working just as well flat.',
        texture_and_material: 'Longitudinal texture following each band and never crossing it.',
        camera_and_composition:
          'Wide curves across the tile with minimum radii and matching edges.',
        atmosphere_and_mood: 'Slow sustained flow with calm compression and open expansions.',
        rendering_and_quality: 'Clean repeat where bands never collide and keep a stable width.',
        key_features: 'sinuous flat bands; steady spacing; matching edges; slow flow',
      },
      [
        'invented topographic map',
        'lines crossing with no rule',
        'thread texture against the direction',
        HIST,
      ],
      [
        "A fabric for a river spirit's robe: six sinuous cord-like bands flowing around hidden stones, compressing into rapids at one corner and opening into a calm pool. No readable text or logo.",
        'A carpet of ribbon-like bands that swerve around a sleeping cat-shaped gap exactly as if they were trying not to wake it. No readable text or logo.',
        'A calm surface of parallel bands in a 1-1-2 sequence curving around wide reserves, warm tones. No readable text or logo.',
      ],
    ),
    S(
      'R-PAT-10',
      'Interrupted Stripe Weaves',
      'interrupted and bridged stripe pattern',
      'interrupted-stripe',
      {
        aesthetic:
          'Interrupted Stripe Weaves: stripes cut in alternating zones and reconnected by bridges that explain their continuity.',
        subject_treatment:
          'Build a repeating stripe surface where stripes break in alternating zones and reconnect through bridges, with the break points offset between neighbors.',
        color_and_tone: 'Two stripe colors and a stable ground showing through the gaps.',
        lighting_and_shadow: 'Flat artwork where over and under are shown by cuts and continuity.',
        texture_and_material:
          'Constant-width stripes with crisp interruptions and a few wide crossings.',
        camera_and_composition:
          'Offset cut sequence between neighboring stripes, phase kept at the edges.',
        atmosphere_and_mood: 'A graphic syncopation of repetition, interruption and return.',
        rendering_and_quality: 'Clean repeat with aligned ends and no tiny leftover segments.',
        key_features: 'interrupted stripes; bridging crossings; offset cuts; syncopated rhythm',
      },
      ['recolored stripes with no new structure', 'random cuts', 'glitch effects', HIST],
      [
        'A deck-chair canvas for an ocean liner that crossed the Arctic: broad navy stripes interrupted by diagonal ice-white bridges, the break shifting every second stripe. No readable text or logo.',
        'A shirt fabric of stripes that keep tripping over each other and reconnecting, blue and ochre, clearly having a bad day. No readable text or logo.',
        'A linen for a quiet seaside cafe with horizontal stripes of two widths, stepped pauses and small bridges joining only neighbouring stripes, sand and blue. No readable text or logo.',
      ],
    ),
  ],
};

export default spec;
