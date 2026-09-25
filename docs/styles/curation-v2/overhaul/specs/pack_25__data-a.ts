import type { Spec } from '../tools/apply';
import { design } from './_design';

// Information & technical graphics (part A): R-DAT-01..10. Supplied values, labels and links stay exact;
// nothing is invented to complete a chart.
const D = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
) => design(name, domain, tag, 'infographic', fields, avoid, briefs, { text: true, source });

const DATA = 'invented values, links or measurements';

const spec: Spec = {
  pack: 'pack_25',
  category: '12. Information & Technical Graphics',
  newCategory: { id: 'information-and-technical-graphics' },
  updates: {},
  creates: [
    D(
      'R-DAT-01',
      'Specimen Annotation Graphics',
      'annotated specimen plate',
      'specimen-annotation',
      {
        aesthetic:
          'Specimen Annotation Graphics: one whole figure receives numbered callouts and linked enlargements with unmistakable anchors.',
        subject_treatment:
          "Show the prompt's subject whole, then add numbered callouts and a few enlargements tied exactly to real parts, every label kept exact.",
        color_and_tone:
          'Light ground, figure in a mid value and one accent reserved for the annotated part.',
        lighting_and_shadow:
          'No scene light, with descriptive shading kept apart from lines and numbers.',
        texture_and_material:
          'Continuous technical line and sober fills, hatching only on declared sections.',
        camera_and_composition:
          'Callouts outside the silhouette, no crossings and even spacing to each detail.',
        atmosphere_and_mood:
          'Patient attention, from the whole figure to one part and back to the whole.',
        rendering_and_quality:
          'Crisp plate with precise leader ends, each landing on a real component.',
        key_features: 'whole figure; numbered callouts; linked enlargements; exact labels',
      },
      [
        'invented parts',
        'leader lines ending in the air',
        'measurements added to look technical',
        DATA,
      ],
      [
        'A specimen plate of a newly discovered deep-sea anglerfish, the whole fish drawn in grey with callouts "LURE", "JAW" and "EYE" and two enlargements, ivory ground and blue leaders.',
        'A deadly serious specimen plate of "THE COMMON OFFICE STAPLER" with callouts "JAW", "SPRING" and "REGRET", enlargements of the jammed staple.',
        'A plate of a three-part case, base, body and lid, with three details tied to its real joins and no dimensions.',
      ],
    ),
    D(
      'R-DAT-02',
      'Woven Data Notation',
      'interwoven relationship notation',
      'woven-notation',
      {
        aesthetic:
          'Woven Data Notation: relationships drawn as paths that pass over and under each other, with open gaps wherever there is no connection.',
        subject_treatment:
          "Draw the prompt's supplied relationships as woven paths that cross over and under with clear gaps at non-connections, every node label exact.",
        color_and_tone: 'Colors per entity or class, each path still traceable without color.',
        lighting_and_shadow: 'Flat notation where crossings are resolved by gaps or small bridges.',
        texture_and_material:
          'Constant-width strokes, width changing only for an explicit numeric variable.',
        camera_and_composition:
          'Inputs, crossing zone and destinations kept apart with parallel paths spaced.',
        atmosphere_and_mood:
          'A rhythm of going and returning, calm long runs and focused crossings.',
        rendering_and_quality:
          'Crisp diagram with clean crossings, tangent curves and a complete legend.',
        key_features: 'woven paths; open non-connections; complete legend; traceable links',
      },
      ['links implied at crossings', 'arbitrary widths', 'categories with no legend', DATA],
      [
        'The web of alliances between five rival dragon clans, "EMBER", "FROST", "STORM", "ASH" and "TIDE", drawn as woven ribbons with open gaps where no alliance exists, one legend.',
        'A woven chart of who borrowed whose charger in a shared flat, four names and six guilty paths, crossings clearly marked "NOT CONNECTED".',
        'A calm woven graph of A to B, A to C and B to D, the crossing left open and labeled "crossing, no link".',
      ],
    ),
    D(
      'R-DAT-03',
      'Ledger Diagram Systems',
      'ledger table with state connectors',
      'ledger-diagram',
      {
        aesthetic:
          'Ledger Diagram Systems: register rows stay recognizable while side connectors link each row to its states and steps.',
        subject_treatment:
          "Keep the prompt's records as clear rows with an outer lane of connectors to their states, every number, name and state exact.",
        color_and_tone: 'Neutral rows with category accents for declared states only.',
        lighting_and_shadow: 'Flat page where separation comes from rules, white space and bands.',
        texture_and_material: 'Clean page, fine rules and tabular numerals with no archive stains.',
        camera_and_composition:
          'Fixed id column, data aligned by unit and an outer lane for transitions.',
        atmosphere_and_mood: 'Steady administrative reading with clear episodes of change.',
        rendering_and_quality:
          'Crisp table with decimal alignment and connectors meeting the center of each row.',
        key_features: 'register rows; state connectors; fixed id column; decimal alignment',
      },
      ['truncated cells', 'merged rows', 'connections with no record', DATA],
      [
        'The ledger of a haunted inn: rooms "7", "13" and "22" with nights stayed 2, 5 and 1, each row connected to its state "SLEPT", "FLED" or "STILL THERE".',
        'A household chore ledger with tasks "DISHES", "TRASH" and "CAT", days overdue 3, 9 and 0, connected to states "DONE", "DENIED" and "CAT DID IT".',
        'A calm review ledger of three pieces moving from "Draft" to "Review" to "Ready", ids fixed on the left.',
      ],
    ),
    D(
      'R-DAT-04',
      'Layered Evidence Maps',
      'observation context interpretation map',
      'evidence-map',
      {
        aesthetic:
          'Layered Evidence Maps: three layers keep observed evidence, supplied context and proposed interpretation visibly apart.',
        subject_treatment:
          "Separate the prompt's observed points, context and proposed interpretation into three layers with different line styles and one legend, every label exact.",
        color_and_tone:
          'Palette by kind of knowledge, observation solid, context faint and interpretation marked.',
        lighting_and_shadow: 'Flat planes and checkable opacities with no dramatic light.',
        texture_and_material:
          'Solid marks for facts, dashed lines for hypotheses and open areas for context.',
        camera_and_composition:
          'Persistent legend, separable layers and anchored labels over the original marks.',
        atmosphere_and_mood: 'Reflective reading that shows gaps and uncertainty honestly.',
        rendering_and_quality:
          'Crisp map where the layer styles stay distinct at small size and in grey.',
        key_features: 'three knowledge layers; dashed hypotheses; persistent legend; visible gaps',
      },
      [
        'hypotheses drawn as measurements',
        'heatmaps with no data',
        'filled areas hiding missing evidence',
        DATA,
      ],
      [
        'An evidence map of a search for a lost expedition in the ice: three camps "A", "B" and "C" observed, two glaciers as context and one dashed "PROPOSED ROUTE", legend "observed / context / proposal".',
        'An evidence map of where the cookies went: crumbs "A" and "B" observed, the kitchen as context and a dashed line leading straight to the dog.',
        'A study plate with three documented samples, two areas with no observation and one proposed finish, titled "FICTIONAL STUDY".',
      ],
    ),
    D(
      'R-DAT-05',
      'Contour-Band Explanations',
      'banded interval explanation graphic',
      'contour-band',
      {
        aesthetic:
          'Contour-Band Explanations: discrete bands built from declared intervals show variation with a visible scale and labeled limits.',
        subject_treatment:
          "Build the prompt's values into discrete bands from declared intervals, each level continuous and ordered, with the scale and limits labeled exactly.",
        color_and_tone:
          'A monotonic value ramp with perceptible steps, diverging only around a real center.',
        lighting_and_shadow: 'Flat bands with no lit relief that would invent terrain.',
        texture_and_material: 'Flat surfaces bounded by clean contours, any interpolation stated.',
        camera_and_composition:
          'Visible numeric scale, labeled limits and a legend set apart from the bands.',
        atmosphere_and_mood: 'Gradual variation with clear thresholds, honest and calm.',
        rendering_and_quality:
          'Crisp graphic whose borders come from the data and equal intervals share equal steps.',
        key_features: 'declared intervals; discrete bands; visible scale; labeled limits',
      },
      ['arbitrary curves', 'undeclared unequal intervals', 'fake height on non-spatial data', DATA],
      [
        "A banded chart of how loud a dragon's roar feels at distances 0 to 40 meters, four bands 0-10, 10-20, 20-30 and 30-40, legend at the side, no mountains.",
        'A banded chart of "SPICINESS OF GRANDMA\'S CHILI" from 0 to 30 in three equal bands, the top band labeled "DO NOT".',
        'A square banded plate from a 0 to 40 grid with black contours and one accent at the threshold 20.',
      ],
    ),
    D(
      'R-DAT-06',
      'Mechanical Flow Plates',
      'chamber-and-duct process plate',
      'mechanical-flow',
      {
        aesthetic:
          'Mechanical Flow Plates: process stages drawn as chambers and ducts with unmistakable inputs, outputs and branches.',
        subject_treatment:
          "Translate the prompt's real process stages into chambers and ducts with clear inputs, outputs and a separate return lane, every stage name exact.",
        color_and_tone: 'One color for the active flow and neutral values for alternative routes.',
        lighting_and_shadow: 'Flat technical plate with a slight layer offset only at crossings.',
        texture_and_material:
          'Circuit-like lines, functional nodes and clean fields with valves only for real steps.',
        camera_and_composition:
          'Main flow from left to right, a separate return lane and a nearby symbol legend.',
        atmosphere_and_mood: 'A precise sequence of intake, transformation and output.',
        rendering_and_quality: 'Crisp plate with one arrow grammar and nodes named exactly.',
        key_features: 'chambers and ducts; left-to-right flow; return lane; exact stage names',
      },
      ['decorative pipes', 'false branches', 'valves with no function', DATA],
      [
        'The flow plate of a potion brewery: "GATHER", "BREW" and "BOTTLE", with a return duct from "BREW" to "GATHER" labeled "EXPLODED", teal flow on dark lines.',
        'The flow of a morning routine: "WAKE", "COFFEE" and "FUNCTION", with a very busy return duct from "WAKE" back to "SLEEP".',
        'A calm plate for "Input → Review → Save", with "Yes" and "No" exits and an outer return duct.',
      ],
    ),
    D(
      'R-DAT-07',
      'Small-Multiple Field Notes',
      'small multiples comparison sheet',
      'small-multiples',
      {
        aesthetic:
          'Small-Multiple Field Notes: equal panels repeat framing, scale and variables, each with one short note on what changed.',
        subject_treatment:
          "Repeat the prompt's subject in equal panels with the same framing, scale and axes, adding one short note per panel; keep every value exact.",
        color_and_tone:
          'One shared palette with accents reserved for the same phenomenon in every panel.',
        lighting_and_shadow: 'Identical light for compared objects and flat charts left unshaded.',
        texture_and_material: 'The same edge and texture treatment on every sample.',
        camera_and_composition:
          'A regular grid with aligned titles, one visible common scale and one legend.',
        atmosphere_and_mood:
          'Calm comparative cadence, repetition making the changes easy to spot.',
        rendering_and_quality: 'Crisp sheet with aligned axes and no panel enlarged for emphasis.',
        key_features: 'equal panels; common scale; one note per panel; single legend',
      },
      ['independent autoscaling', 'uneven crops', 'notes claiming undocumented causes', DATA],
      [
        'Field notes on a volcano waking up: six equal panels of the same crater from day 1 to day 6, one short note under each, same scale and framing.',
        'Small multiples of the same houseplant photographed daily for a week while its owner forgot to water it, one note per panel, getting sadder.',
        'Three equal chart panels of series A=[2,4,6], B=[2,3,4] and C=[6,4,2] on one 0 to 6 axis, titled "DEMO SERIES".',
      ],
    ),
    D(
      'R-DAT-08',
      'Isometric Process Blocks',
      'isometric stage block diagram',
      'isometric-process',
      {
        aesthetic:
          'Isometric Process Blocks: process stages as blocks of equal depth in one isometric projection, linked through visible ports.',
        subject_treatment:
          "Build the prompt's stages as equal-depth isometric blocks joined through visible ports, block size never implying quantity; keep labels exact.",
        color_and_tone:
          'Color separating function or phase, with side faces darkened by one common step.',
        lighting_and_shadow: 'One conventional light that describes orientation across all blocks.',
        texture_and_material: 'Clean planes, shared edges and connectors resting on clear ports.',
        camera_and_composition:
          'One projection, a clear path and horizontal labels over no needed link.',
        atmosphere_and_mood: 'Modular and explanatory, with working space between stages.',
        rendering_and_quality:
          'Crisp diagram with identical axis angles and readable undistorted text.',
        key_features:
          'equal isometric blocks; visible ports; one projection; stages not quantities',
      },
      [
        'invented proportional volume',
        'mixed projections',
        'blocks added to balance the scene',
        DATA,
      ],
      [
        'The three stages of forging a legendary sword, "SMELT", "HAMMER" and "QUENCH", as equal isometric blocks with glowing ports, labeled "stages, not quantities".',
        'The four stages of assembling flat-pack furniture, "OPEN", "READ", "CRY" and "DONE", as equal isometric blocks linked by clean connectors.',
        'A calm flow of "Capture", "Edit" and "Export" as equal blocks in one oblique projection with horizontal labels.',
      ],
    ),
    D(
      'R-DAT-09',
      'Typographic Data Fields',
      'typographic number layout',
      'typographic-data',
      {
        aesthetic:
          'Typographic Data Fields: numbers, units and labels arranged as aligned typographic blocks with a strict, meaningful hierarchy.',
        subject_treatment:
          "Arrange the prompt's numbers, units and labels as aligned typographic blocks ranked by relevance, every figure, sign and unit exact.",
        color_and_tone: 'High contrast for the main reading, secondary tones for context.',
        lighting_and_shadow: 'Flat typography where prominence comes from size, weight and space.',
        texture_and_material: 'Sober type with distinct numerals and clean separators.',
        camera_and_composition: 'Alignment by decimal or unit with room for long values and signs.',
        atmosphere_and_mood: 'An editorial reading rhythm that stays fully verifiable.',
        rendering_and_quality: 'Crisp numbers with units never split from their values.',
        key_features: 'aligned numbers; units beside values; strict hierarchy; verifiable figures',
      },
      [
        'added percentages',
        'numbers turned into patterns',
        'sizes implying undeclared proportions',
        DATA,
      ],
      [
        'A typographic plate for a moon landing countdown, "T-00:10", "T-00:05" and "T-00:00" set huge, each with its stage label beside it, black on white.',
        'A bold typographic poster of "HOURS OF SLEEP THIS WEEK": 7, 5, 4, 3 and 2, the numbers shrinking in desperation, units kept beside each.',
        'Three durations 00:12, 00:24 and 00:36 under the title "THREE FRAGMENTS", each with its id A, B or C.',
      ],
    ),
    D(
      'R-DAT-10',
      'Radial Relationship Graphics',
      'radial relationship diagram',
      'radial-relationship',
      {
        aesthetic:
          'Radial Relationship Graphics: one named center, rings and arcs sort relationships outward, angle marking identity rather than amount.',
        subject_treatment:
          "Arrange the prompt's entities around one named center in rings by relationship type, each link drawn once and angle carrying no quantity; keep labels exact.",
        color_and_tone: 'Color by ring or class backed by node shape.',
        lighting_and_shadow: 'Flat layers separated by distance on one plane.',
        texture_and_material:
          'Clean arcs, consistent node sizes and exterior labels without tangles.',
        camera_and_composition:
          'A clearly named center, rings with distinct jobs and a legend outside the circle.',
        atmosphere_and_mood: 'An orderly expansion from one central idea outward.',
        rendering_and_quality: 'Crisp radial diagram with clean tangents and horizontal labels.',
        key_features: 'named center; relationship rings; single links; outside legend',
      },
      [
        'decorative rings',
        'fake proportional areas',
        'categories duplicated to fill the circle',
        DATA,
      ],
      [
        'A radial diagram of a sorcerer\'s school with "THE ARCHMAGE" at the center, rings for "TEACHERS" and "APPRENTICES", each bond drawn once, angles meaning nothing.',
        'A radial chart of a family group chat with "MOM" at the center and rings for "RESPONDS", "READS" and "IGNORES", painfully accurate.',
        'A calm radial chart of an archive at the center linked to "SOUND", "IMAGE" and "TEXT", legend outside the circle.',
      ],
    ),
  ],
};

export default spec;
