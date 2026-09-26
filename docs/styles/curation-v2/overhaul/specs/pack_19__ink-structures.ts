import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Ink Structures vault: portable ink studies whose rendering mechanics are explicit. The ten
// originals keep their DNA and get creative briefs; ten new studies cover ink mechanics the
// catalog does not have yet (flex nib, flung ink, wet bloom, cross-contour, ruling pen, reserved
// white, single stroke, pulled string, stepped dilution, blotted line).
const ink = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  avoid: string[],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'ink', 'portable-study'],
  dna: dna(fields),
  avoid: [...avoid, ...STYLE_AVOID],
  briefs,
});

const spec: Spec = {
  pack: 'pack_19',
  category: '1. Ink Structures',
  updates: {
    'SP19-001': {
      briefs: [
        'A red bicycle leans against a low stone bridge while a pike the size of a canoe watches it from the river, every shape carved into solid ink masses and bright gouged gaps. No readable text or logo.',
        'A rooster crows so hard on a farmhouse roof that the shingles fly off behind it, feathers and tiles cut as jagged white channels through black ink. No readable text or logo.',
        'A lighthouse keeper rows alone toward a rock at night, the beam above her carved as one long white wedge through a solid black sky. No readable text or logo.',
      ],
    },
    'SP19-002': {
      briefs: [
        'A dancer turns with a scarf so long it wraps the whole page twice, drawn in single brush contours that swell at every push and thin at every release. No readable text or logo.',
        'A giraffe bends down to drink from a birdbath in a suburban garden, its neck one long elastic line that swells at the knees and tapers at the lips. No readable text or logo.',
        'A tightrope walker crosses between two chimneys at dusk, the rope and her body drawn in tense, springing contours on nearly empty paper. No readable text or logo.'
      ],
    },
    'SP19-003': {
      briefs: [
        'A wind-bent pine clings to one rock above a storm, its needles flicked out in dry, split bristle strokes that leave the paper breathing between them. No readable text or logo.',
        'A shaggy yak shakes off snow on a mountain pass, its whole coat built from rapid dry-brush flicks with bare paper glinting through. No readable text or logo.',
        'A broom-maker sits among bundles of straw, her brooms and her own wild hair drawn with the same scratchy bristle rhythm. No readable text or logo.',
      ],
    },
    'SP19-004': {
      briefs: [
        'A folded orange umbrella leans on a dark bench as the rain around it gathers into broad translucent pools of ink, one small white glint left untouched on the handle. No readable text or logo.',
        'A whale surfaces beside a tiny rowboat, its back a single broad pool of grey ink with a darker deposit settling along the waterline. No readable text or logo.',
        'A cat sleeps in a sunny window, the shadow of the frame falling across it in soft pooled ink while the sunlit patches stay bare paper. No readable text or logo.',
      ],
    },
    'SP19-005': {
      briefs: [
        'A curled sea horse drifts among three kelp fronds, its whole body built from dots that crowd into darkness at the belly and scatter into light at the crest. No readable text or logo.',
        'An old astronaut sits on a porch step under a streetlamp, the moths around the lamp and the wrinkles of her face all built from weighted ink dots. No readable text or logo.',
        'A sand dune at night rolls under a sky of stars, the dune drawn in dense dots and the sky in sparse ones until they almost meet at the horizon. No readable text or logo.',
      ],
    },
    'SP19-006': {
      briefs: [
        'A small black fishing boat crosses a dark inlet under a storm cloud, a pale moon lifted out of the wet ink with a single press of blotting paper. No readable text or logo.',
        'A fox runs across a snowy field at dusk, its breath and footprints lifted as soft pale shapes from still-wet blue-black ink. No readable text or logo.',
        'A single candle burns in a dark chapel, its halo blotted out of a heavy wash so the light looks soft and absorbent. No readable text or logo.',
      ],
    },
    'SP19-007': {
      briefs: [
        'A cyclist leans into a hairpin on a steep coastal road, wheels, limbs and road all built from broad flat-nib passes with squared shoulders. No readable text or logo.',
        'A crane lifts a whole house off its foundation during a flood, its cables and beams drawn in clipped chisel-nib strokes. No readable text or logo.',
        'A heron stands on one leg in a reed bed, every reed and feather a flat squared nib stroke turning sharply at the tip. No readable text or logo.',
      ],
    },
    'SP19-008': {
      briefs: [
        'A tiger leaps over a narrow stream toward a low branch, its muscles and tail carried by long loaded brush sweeps that thin as the ink runs out. No readable text or logo.',
        'A flamenco dancer spins with her skirt flung wide, the ruffles drawn as heavy opaque sweeps curling around her like breaking waves. No readable text or logo.',
        'A waterfall pours off a cliff into mist, drawn in three enormous pressure-shaped sweeps of black ink. No readable text or logo.',
      ],
    },
    'SP19-009': {
      briefs: [
        'A tortoise crosses three stepping stones, its shell a near-black mass with parallel channels pulled through the wet ink by a comb. No readable text or logo.',
        'A field of wheat bends under wind at night, each row a pulled channel raked through thick black ink across the page. No readable text or logo.',
        'An old man with a long beard sits on a bench, the beard combed through wet ink into fine parallel pale lines. No readable text or logo.',
      ],
    },
    'SP19-010': {
      briefs: [
        'A large dark moth hovers above one pale trumpet flower, both crisp silhouettes floating in a soft sprayed fog of ink that thickens toward the corners. No readable text or logo.',
        'A tram glides through a foggy city at night, its lit windows sharp paper cut-outs against a sprayed ink haze. No readable text or logo.',
        'A diver descends into deep water, the sea around her misted from pale grey near the surface to near-black in the depths. No readable text or logo.',
      ],
    },
  },
  creates: [
    ink(
      'Split-Nib Swell',
      'flexible nib swelling line',
      'split-nib',
      {
        aesthetic:
          'Split-nib swell: pointed dip-pen drawing where one flexible nib swings from hairline to bold in a single stroke, so every contour breathes with pressure.',
        subject_treatment:
          "Draw the prompt's subject with pressure-swelled nib lines, thick on the shadow side of each curve and hairline where light hits, keeping its form and pose.",
        color_and_tone:
          'Black or sepia iron-gall ink on warm cream paper, with value made only by line weight and spacing.',
        lighting_and_shadow:
          'Light is implied by thinning lines on lit edges and swelling, doubled strokes on the shadow side.',
        texture_and_material:
          'Glossy ink ridges on smooth paper, tiny spatters where the nib caught and fine tapered stroke ends.',
        camera_and_composition:
          "The prompt's framing with generous open paper, the main contour flowing unbroken across the page.",
        atmosphere_and_mood:
          'Elegant, alert and alive, like a confident sketch made in one sitting.',
        rendering_and_quality:
          'Crisp continuous nib lines with visible swell and taper, no hatching fill and no wash.',
        key_features:
          'hairline-to-bold swell; pressure on shadow side; tapered ends; bare cream paper',
      },
      ['uniform line weight', 'digital vector outline', 'grey wash fill'],
      [
        'A peacock fans its tail on a palace lawn, every feather eye drawn in one breath of a flexible nib swelling from hairline to heavy black. No readable text or logo.',
        'A pickpocket lifts a watch from a gentleman in a crowded station, both figures rendered in swelling nib lines that thicken only where the shadows fall. No readable text or logo.',
        'A single wave curls over a sleeping sea turtle, the crest drawn in a long hairline that swells into a heavy dark belly beneath it. No readable text or logo.',
      ],
    ),
    ink(
      'Flung-Ink Splash',
      'splashed ink landscape',
      'flung-ink',
      {
        aesthetic:
          'Flung-ink splash: ink thrown and splashed onto paper in bold bursts, then given just enough brush marks to become mountains, trees or creatures.',
        subject_treatment:
          "Build the prompt's subject from splashed and flung ink bursts, then clarify it with a few precise brush touches so it stays recognizable.",
        color_and_tone:
          'Black ink in every dilution from dense to watery grey on white paper, with at most one small color accent.',
        lighting_and_shadow:
          'Light comes from the white paper left between splashes; darkness comes from where the ink landed heaviest.',
        texture_and_material:
          'Radiating spatter, droplet trails, pooled splash centers and a few sharp brush accents on absorbent paper.',
        camera_and_composition:
          'Asymmetric composition with splash energy flowing diagonally and large areas of empty paper.',
        atmosphere_and_mood: 'Explosive, spontaneous and poetic, a landscape born from an accident.',
        rendering_and_quality:
          'Bold uncontrolled splash forms tamed by few careful strokes, never a neat illustration.',
        key_features:
          'thrown ink bursts; droplet trails; few clarifying strokes; empty paper',
      },
      ['neat outlined drawing', 'uniform flat fill', 'digital splatter brush pattern'],
      [
        'A mountain range explodes out of one thrown bucket of ink, and three tiny travelers crossing a bridge are the only careful strokes on the page. No readable text or logo.',
        'An octopus lunges out of a splash of flung ink, its tentacles the droplet trails, a single calm eye added with the tip of a brush. No readable text or logo.',
        'A cherry tree in a storm is made from splashed dark ink, its blossoms a few red dots the wind seems to be tearing away. No readable text or logo.',
      ],
    ),
    ink(
      'Feathered Wet Bloom',
      'ink dropped into wet paper',
      'wet-bloom',
      {
        aesthetic:
          'Feathered wet bloom: ink touched into soaked paper so it spreads in soft feathered halos, with forms emerging from the blooms rather than drawn outlines.',
        subject_treatment:
          "Suggest the prompt's subject through ink blooms spreading into wet paper, adding a few drier accents later so its shape and identity stay readable.",
        color_and_tone:
          'Indigo, sepia or black ink blooming into pale tints, soft gradients from each drop point outward.',
        lighting_and_shadow:
          'Light lives in the pale feathered edges of each bloom; shadow gathers where drops overlapped and darkened.',
        texture_and_material:
          'Feathered halo edges, branching capillary tendrils and cauliflower backruns on heavy soaked paper.',
        camera_and_composition:
          'Soft-edged masses floating in the frame, the subject centered in the densest bloom.',
        atmosphere_and_mood: 'Dreamy, damp and quiet, like a memory seeping into paper.',
        rendering_and_quality:
          'Organic spreading blooms with a few crisp dry accents, never hard outlines everywhere.',
        key_features: 'feathered halos; capillary tendrils; backruns; few dry accents',
      },
      ['hard outlines everywhere', 'flat digital gradient', 'dry opaque paint'],
      [
        'A jellyfish drifts through a dark harbor, its bell a single indigo drop blooming into wet paper and its tentacles the tendrils creeping outward. No readable text or logo.',
        'A ghostly procession of lantern bearers crosses a flooded rice field, each lantern a warm bloom feathering into the grey night. No readable text or logo.',
        'An old woman peers out of a rainy window, her face half dissolving into a sepia bloom while her spectacles stay sharp and dry. No readable text or logo.',
      ],
    ),
    ink(
      'Cross-Contour Belts',
      'form-wrapping contour lines',
      'cross-contour',
      {
        aesthetic:
          'Cross-contour belts: every form described by parallel ink lines that wrap around its surface like belts or topographic rings, showing volume without shading.',
        subject_treatment:
          "Wrap the prompt's subject in evenly spaced lines that follow its surface across and around, so its volume and pose read from the line flow alone.",
        color_and_tone:
          'Black fineliner on white paper, occasionally one colored line set for a single important form.',
        lighting_and_shadow:
          'Tone comes from line spacing: belts crowd together on turning edges and open up on broad lit planes.',
        texture_and_material:
          'Clean even fineliner lines, slight tremor, and precise bends where belts cross ridges and hollows.',
        camera_and_composition:
          "The prompt's framing with the subject large, belts flowing across it like a body scan.",
        atmosphere_and_mood: 'Analytical, calm and hypnotic, like watching a shape being measured.',
        rendering_and_quality:
          'Continuous parallel belts with no hatching, no fill and no outline-only shortcuts.',
        key_features: 'surface-wrapping lines; spacing as tone; no shading fill; body-scan feel',
      },
      ['flat outline without interior lines', 'crosshatch shading', 'grey wash'],
      [
        'A sleeping whale floats in open sea, its whole body wrapped in belt-like lines that bend over its back and pinch around the fins. No readable text or logo.',
        'A bodybuilder flexes on a beach, every muscle mapped by lines wrapping around it like a relief map of a mountain range. No readable text or logo.',
        "Over an enormous crumpled bedsheet a snail makes its slow journey, both drawn in wrapping lines so the sheet looks like rolling hills. No readable text or logo.",
      ],
    ),
    ink(
      'Ruled Line Scaffold',
      'ruling pen structure drawing',
      'ruled-line',
      {
        aesthetic:
          'Ruled line scaffold: ink drawing built from ruler-straight pen lines and construction guides, with only a few freehand strokes where life breaks through.',
        subject_treatment:
          "Construct the prompt's subject from ruled straight segments and perspective guides, allowing freehand ink only on organic details so it stays recognizable.",
        color_and_tone:
          'Black ink with faint blue construction lines on bright white drafting paper.',
        lighting_and_shadow:
          'Shadow planes are filled with evenly ruled parallel lines rather than tone or wash.',
        texture_and_material:
          'Crisp ruling-pen lines with slightly bulbed ends, faint pencil guides and a few blots at line starts.',
        camera_and_composition:
          'Strong perspective with visible vanishing guides, the subject placed on the scaffold grid.',
        atmosphere_and_mood: 'Rational, precise and slightly tense, order holding back chaos.',
        rendering_and_quality:
          'Exact ruled geometry with deliberate freehand contrast, no sketchy messiness in the ruled parts.',
        key_features: 'ruled straight lines; visible construction guides; ruled shadow fills; few freehand accents',
      },
      ['sketchy loose lines everywhere', 'photographic shading', 'curved brush strokes'],
      [
        'A cathedral of ruled scaffolding rises to the clouds while a single freehand ivy vine climbs it, the only curved line on the page. No readable text or logo.',
        'A tired architect sleeps at her drafting table while the ruled perspective lines of her drawing escape the paper and stretch across the room. No readable text or logo.',
        'A tram crosses a bridge drawn entirely in ruled lines, except for a flock of pigeons scribbled freehand over the top. No readable text or logo.',
      ],
    ),
    ink(
      'Reserved White Shapes',
      'negative space ink reserve',
      'reserved-white',
      {
        aesthetic:
          'Reserved white shapes: the subject is never drawn; instead the dark ink surroundings are painted around it, leaving it as clean bare paper.',
        subject_treatment:
          "Leave the prompt's subject as untouched white paper and paint everything around it in ink, so its silhouette and key interior gaps define it.",
        color_and_tone:
          'Dense black or deep indigo ink fields surrounding pure white reserved shapes, with a few mid-grey transitions.',
        lighting_and_shadow:
          'The reserved subject reads as brightly lit; all shadow and atmosphere live in the painted surroundings.',
        texture_and_material:
          'Brushy ink edges hugging the reserve, dry-brush breaks and crisp paper borders around the subject.',
        camera_and_composition:
          'Strong silhouettes with clear readable outlines, the subject centered in a dark field.',
        atmosphere_and_mood: 'Mysterious and luminous, the subject glowing because of its absence.',
        rendering_and_quality:
          'Precise reserve edges and confident ink fields, no outline drawn inside the white shapes.',
        key_features: 'subject left as bare paper; ink painted around it; crisp reserve edges; dark field',
      },
      ['outlined subject', 'subject painted dark', 'grey filled subject'],
      [
        'A white stag stands in a black forest, its whole body only the paper left bare while the ink trees crowd in around it. No readable text or logo.',
        'A ghostly bride walks down a dark staircase, her gown and veil pure reserved paper against the heavy ink of the house. No readable text or logo.',
        'A flock of white birds bursts from a black thundercloud, every bird a clean reserved shape the storm was painted around. No readable text or logo.',
      ],
    ),
    ink(
      'Single-Stroke Figures',
      'one-stroke brush figures',
      'single-stroke',
      {
        aesthetic:
          'Single-stroke figures: each form painted in one uninterrupted brush stroke whose loading, twist and lift create body, limbs and shading at once.',
        subject_treatment:
          "Paint the prompt's subject with the fewest possible single brush strokes, each stroke forming a whole part of it while keeping pose and identity readable.",
        color_and_tone:
          'Black ink or one earthy color, the brush loaded dark at the tip and pale at the heel for built-in gradation.',
        lighting_and_shadow:
          'Each stroke carries its own light-to-dark shift from how the brush was loaded, with no added shading.',
        texture_and_material:
          'Wet stroke bodies, dry-brush tails where the ink runs out and soft paper absorption.',
        camera_and_composition:
          'Sparse composition with lots of empty paper, strokes arranged like a quick confident gesture.',
        atmosphere_and_mood: 'Fast, playful and masterful, the joy of getting it right in one go.',
        rendering_and_quality:
          'Few decisive strokes, no corrections, no outlines and no filled areas beyond the strokes.',
        key_features: 'one stroke per form; loaded gradation; dry tails; empty paper',
      },
      ['overworked corrections', 'outline and fill', 'many small strokes'],
      [
        'A charging bull made of only four brush strokes thunders across the page, one stroke for the body, two for the horns and one for the dust. No readable text or logo.',
        'A family of five ducks waddles in a line, each duck a single twisting stroke, the last one tripping over its own tail. No readable text or logo.',
        'A lone fisherman in a wide hat sits on a rock at dusk, the man, the rock and the rod each made from one uninterrupted stroke. No readable text or logo.',
      ],
    ),
    ink(
      'Pulled-String Ink',
      'ink-soaked string pulled between paper',
      'pulled-string',
      {
        aesthetic:
          'Pulled-string ink: an ink-soaked string laid between folded paper and pulled out, leaving mirrored feathery trails that are then read as the subject.',
        subject_treatment:
          "Shape the prompt's subject from symmetrical string-pull trails, adding only minimal brush details so it becomes recognizable.",
        color_and_tone:
          'One or two ink colors, often black and one bright accent, with mirrored density on both sides of the fold.',
        lighting_and_shadow:
          'No modeled light; density of the dragged trails creates dark and pale zones.',
        texture_and_material:
          'Fine feathered strand marks, looping drag trails, a faint center fold crease and soft blotted edges.',
        camera_and_composition:
          'Mirror-symmetric composition around a central fold, the subject rising from the crease.',
        atmosphere_and_mood: 'Uncanny, elegant and organic, like something grown rather than drawn.',
        rendering_and_quality:
          'Authentic dragged strand marks with minimal added strokes, never a clean digital mirror.',
        key_features: 'mirrored strand trails; center fold crease; feathered drags; minimal added detail',
      },
      ['clean digital mirror copy', 'solid outlines', 'blot splat instead of strands'],
      [
        'A moth-winged queen rises from the fold of the paper, her wings feathery black string trails and her crown three dots of gold. No readable text or logo.',
        'A pair of koi spiral out of the center crease in orange and black string trails, looking as if they swim in mirrored water. No readable text or logo.',
        'A towering tree grows from the fold line, its branches and roots perfect mirrored string drags meeting in the middle. No readable text or logo.',
      ],
    ),
    ink(
      'Stepped Dilution Wash',
      'graded ink value ladder',
      'stepped-dilution',
      {
        aesthetic:
          'Stepped dilution wash: ink applied in four or five separate dilutions with clean dried edges, so values sit in distinct steps like a tonal ladder.',
        subject_treatment:
          "Divide the prompt's subject into a few flat value zones, each painted with one ink dilution and let dry, keeping its structure and identity clear.",
        color_and_tone:
          'Black ink in stepped dilutions from pale grey to dense black on white paper, no smooth gradients.',
        lighting_and_shadow:
          'Light and shadow read as clean stacked value shapes, each step darker than the one before.',
        texture_and_material:
          'Flat translucent wash layers with crisp dried edges and faint granulation inside each layer.',
        camera_and_composition:
          'Layered depth with pale distant planes and darker near planes stepping toward the viewer.',
        atmosphere_and_mood: 'Calm, orderly and atmospheric, like mist separating hills into layers.',
        rendering_and_quality:
          'Precise stepped value shapes, clean dried edges and no blended gradients.',
        key_features: 'four or five value steps; crisp dried edges; layered depth; no blending',
      },
      ['smooth airbrushed gradient', 'line drawing only', 'full black silhouette only'],
      [
        'Five mountain ridges fade into mist in five exact grey steps, a single black crow on the nearest branch as the darkest value. No readable text or logo.',
        'A spiral staircase descends into a well, each turn one step darker until the bottom is solid black. No readable text or logo.',
        'A city skyline at dawn stacks its towers in pale-to-dark layers while a lone early tram glides through the palest one. No readable text or logo.',
      ],
    ),
    ink(
      'Blotted Line Transfer',
      'blotted ink line transfer drawing',
      'blotted-line',
      {
        aesthetic:
          'Blotted line transfer: lines drawn in wet ink on non-absorbent paper and pressed onto a second sheet, leaving broken, beaded and slightly doubled contours.',
        subject_treatment:
          "Render the prompt's subject as transferred ink lines that break into beads and gaps, then add flat color shapes so it stays recognizable.",
        color_and_tone:
          'Black blotted lines with optional flat hand-applied color areas in slightly offset positions.',
        lighting_and_shadow:
          'No modeled light; the broken line and flat color shapes carry the whole image.',
        texture_and_material:
          'Beaded dotted contours, uneven ink pickup, faint doubled ghost lines and flat color fills off register.',
        camera_and_composition:
          'Clear graphic placement of the subject on a pale ground, often centered and illustrative.',
        atmosphere_and_mood: 'Playful, stylish and slightly nostalgic, like a mid-century illustration.',
        rendering_and_quality:
          'Authentic broken transfer lines, never clean continuous vector strokes.',
        key_features: 'beaded broken lines; ghost doubles; offset flat color; pale ground',
      },
      ['clean continuous vector line', 'photographic shading', 'heavy brush strokes'],
      [
        'A pair of oversized shoes walks down an empty boulevard by itself, drawn in beaded broken lines with pink color shapes that slipped off register. No readable text or logo.',
        'A sleeping cat curls on a fancy cake stand, its whiskers a string of ink beads and its fur a flat butter-yellow patch shifted to one side. No readable text or logo.',
        'A glamorous angel poses on a tower of stacked hatboxes, her halo a dotted ring of blotted ink and her gold wings flat color shapes floating slightly beside her shoulders. No readable text or logo.',
      ],
    ),
  ],
};

export default spec;
