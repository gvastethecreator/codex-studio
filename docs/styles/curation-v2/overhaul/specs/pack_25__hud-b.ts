import type { Spec } from '../tools/apply';
import { design } from './_design';

// Game UI, HUDs & screen graphics (part B): R-HUD-11..16 styles, R-HUD-17..19 layout profiles, and
// Contour-Line Gauges, a new style replacing the R-HUD-20 consistency trial (see QA-PROTOCOLS.md).
const H = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
  kind: 'style' | 'modifier' | 'profile' = 'style',
) => design(name, domain, tag, 'hud', fields, avoid, briefs, { text: true, source, kind });

const spec: Spec = {
  pack: 'pack_25',
  category: '5. Game UI, HUDs & Screen Graphics',
  updates: {},
  creates: [
    H(
      'R-HUD-11',
      'Vector Sweep Instruments',
      'vector sweep instrument HUD',
      'vector-sweep',
      {
        aesthetic:
          'Vector Sweep Instruments: sweeps and vectors show orientation or measurement inside constant declared scales and reading limits.',
        subject_treatment:
          "Show the prompt's direction or measurement as clean vectors and a sweep inside declared limits and scales; keep every value and label exact.",
        color_and_tone:
          'Bright main stroke, faint secondary grid and one accent for the selected value.',
        lighting_and_shadow: 'Contained luminance that keeps scales thin and extremes visible.',
        texture_and_material: 'Clean vector lines with functional changes of weight.',
        camera_and_composition:
          'Fixed center and reading limits, labels clear of crossings and vectors traceable.',
        atmosphere_and_mood: 'Directional precision and technical tension, crisp and alert.',
        rendering_and_quality: 'Every vector has a declared origin, destination or meaning.',
        key_features: 'vector sweep; declared scale; fixed center; traceable vectors',
      },
      ['decorative vectors', 'scales with no unit', 'mandatory radar'],
      [
        'The heading instrument of a sky-whale hunter\'s airship: one vector at 42 degrees labeled "042°" inside a 000 to 090 sweep, a faint secondary grid, dark screen, tense.',
        'A wind vector HUD for a paper-airplane championship, one bold arrow east with the magnitude "12 u" and a nervous judge icon, clean lines.',
        'A spatial editor HUD with a single vector from A(20,30) to B(60,30), origin and destination visible, light ground and one coral selection.',
      ],
    ),
    H(
      'R-HUD-12',
      'Layered Route Displays',
      'layered route map HUD',
      'layered-route',
      {
        aesthetic:
          'Layered Route Displays: routes placed on separate graphic planes so crossings never confuse, while node positions stay fixed.',
        subject_treatment:
          "Separate the prompt's routes onto distinct planes while keeping every node position and connection exactly as supplied; keep labels exact.",
        color_and_tone: 'Color or value per layer, backed by line style or label.',
        lighting_and_shadow: 'Minimal graphic depth, each shadow clearly separate from any route.',
        texture_and_material: 'Clean planes and uniform strokes with explicit occlusions.',
        camera_and_composition: 'One shared projection, any layer isolatable without moving nodes.',
        atmosphere_and_mood: 'Navigable complexity and stable context, clear to follow.',
        rendering_and_quality:
          'Crossings between separate layers never read as links or new nodes.',
        key_features: 'layered routes; fixed nodes; shared projection; explicit occlusion',
      },
      ['invented routes', 'moved nodes', 'perspective that hides connectivity'],
      [
        'The escape map of a heist game inside a flooding museum: route A-B-C on one layer, A-D-C on another, B selected, nodes locked in place, cold teal layers.',
        'A route HUD for a pizza delivery rider in a city of one-way streets, "FAST" and "LEGAL" routes on separate layers, neither of them good.',
        'A shelter plan HUD with "SERVICE" and "VISITOR" routes on the same fixed plan, active layer bright and the other faint.',
      ],
    ),
    H(
      'R-HUD-13',
      'Membrane Switch HUD',
      'tensioned membrane control HUD',
      'membrane-switch',
      {
        aesthetic:
          'Membrane Switch HUD: apparent flexible surfaces stretched around controls and status regions, supported at clear points.',
        subject_treatment:
          "Place the prompt's controls and status regions on apparent flexible membranes held by coherent supports, with flat zones for reading; keep labels exact.",
        color_and_tone:
          'Neutral base, clear reading and one localized accent on the active control.',
        lighting_and_shadow: 'Broad light revealing surface tension, labels sitting on flat areas.',
        texture_and_material: 'Smooth membrane, support edges and minimal stretch around controls.',
        camera_and_composition:
          'Grouped by task with flat reading zones between gently raised controls.',
        atmosphere_and_mood:
          'Contained organic tactility with an apparent response under the finger.',
        rendering_and_quality:
          'Stretch never changes the position, label or usable size of a control.',
        key_features: 'stretched membrane; clear supports; flat reading zones; one active accent',
      },
      ['melted UI', 'curved text', 'membrane with no supports'],
      [
        'The control skin of a living alien vehicle: "LIGHT", "AUDIO" and "MAP" on a stretched membrane between clear supports, MAP active, graphite with an amber accent.',
        'A membrane HUD on a jellyfish-shaped kids\' submarine: "BUBBLES", "SNACK" and "HONK", all very squishy, labels perfectly flat and readable.',
        'An archive console with "SEARCH", "READ" and "SAVE" regions on a pale membrane, READ selected, minimal supports and one coral accent.',
      ],
    ),
    H(
      'R-HUD-14',
      'Eroded Enamel Console',
      'worn enamel plate HUD',
      'eroded-enamel',
      {
        aesthetic:
          'Eroded Enamel Console: solid enamel plates worn at their edges, with clean protected reading zones and a clear hierarchy.',
        subject_treatment:
          "Build the prompt's readouts on solid enamel plates with wear only at edges and contact points, keeping every reading zone clean and every value exact.",
        color_and_tone: 'Sober enamel base color, discreet exposed metal and high-contrast text.',
        lighting_and_shadow: 'Soft side light revealing the material while data stays glare-free.',
        texture_and_material: 'Wear limited to plausible edges and contact points, centers clean.',
        camera_and_composition:
          'Aligned functional plates with clear labels and fixings only where needed.',
        atmosphere_and_mood: 'Accumulated use and robustness, a trusted and well-kept tool.',
        rendering_and_quality:
          'With the wear removed, the layout still works as a complete system.',
        key_features: 'enamel plates; edge wear; clean reading zones; high-contrast text',
      },
      ['grime over data', 'random screws', 'material as the only identity'],
      [
        'The console of a polar research station that survived fifty winters: "POWER 68%", "CHANNEL B" and "STABLE" on dark green enamel plates worn only at the corners.',
        'A worn enamel HUD for a grandfather\'s ancient tractor in a farming game: "FUEL 12%", "GRUMPINESS HIGH" and "NAP DUE", edges chipped, data spotless.',
        'A navigation panel with heading 042° and route C on compact dark blue enamel plates, crisp data and minimal edge wear.',
      ],
    ),
    H(
      'R-HUD-15',
      'Negative-Space Meters',
      'void-fill capacity meter HUD',
      'negative-space-meter',
      {
        aesthetic:
          'Negative-Space Meters: openings inside stable shapes encode availability or load, the void growing with the value.',
        subject_treatment:
          "Encode the prompt's quantities as openings inside stable shapes, the void matching each value by a declared convention; keep every value and label exact.",
        color_and_tone: 'High figure-ground contrast, the void meaning the same in every meter.',
        lighting_and_shadow: 'Flat geometry where quantity is shown by shape alone.',
        texture_and_material: 'Smooth masses with wide openings and crisp fill limits.',
        camera_and_composition:
          'One meter per variable with a visible reference and room for a label.',
        atmosphere_and_mood: 'Graphic economy and a clear reading of what is still available.',
        rendering_and_quality: 'The opening changes steadily and in one direction with the value.',
        key_features: 'void as quantity; stable shapes; declared convention; one meter per value',
      },
      ['decorative void', 'inverted scale', 'quantity that depends on perspective'],
      [
        'The oxygen meters of a moon-walk game: three identical shapes with openings at 25%, 50% and 75% labeled exactly, black and bone, the convention declared below.',
        'An inventory HUD for a very greedy dragon, capacity 8 and used 4, the empty space labeled "free" and a tiny sad label "NEEDS MORE GOLD".',
        'A reserve meter at 68% available, the void rising inside one solid mass, with small 0 and 100 references beside it, one ink.',
      ],
    ),
    H(
      'R-HUD-16',
      'Segmented Light Channels',
      'counted light segment HUD',
      'segmented-light',
      {
        aesthetic:
          'Segmented Light Channels: discrete lit segments grouped in clear channels show state, each gap between them kept visible.',
        subject_treatment:
          "Split the prompt's values into counted lit segments grouped by variable, the number of lit segments matching the data exactly; keep labels exact.",
        color_and_tone: 'Contained active color, idle segments told apart by shape and value.',
        lighting_and_shadow: 'Moderate emission per segment with every separation left crisp.',
        texture_and_material: 'Clean channels, a sober diffuser and a consistent segment scale.',
        camera_and_composition:
          'Grouped by function with aligned readings and every channel going somewhere.',
        atmosphere_and_mood: 'A contained technical pulse and clear status, focused and exact.',
        rendering_and_quality: 'The count of lit segments matches the supplied value exactly.',
        key_features: 'counted segments; visible gaps; grouped channels; exact count',
      },
      ['invented segments', 'glow that fuses bars', 'color as the only code'],
      [
        'The shield HUD of a lone knight in a mech suit: ten segments with seven lit and the label "7/10", status "READY", amber on charcoal, crisp gaps.',
        'A cat\'s patience meter on a pet-sitting game HUD, eight segments with one lit and the label "1/8", flashing a small "RUN" warning.',
        'A five-stage process display with two stages complete, one current and two pending, labels 01 to 05 exact.',
      ],
    ),
    H(
      'R-HUD-20-NEW',
      'Contour-Line Gauges',
      'topographic contour fill gauge HUD',
      'contour-gauge',
      {
        aesthetic:
          'Contour-Line Gauges: meters filled with stacked contour lines like a topographic map, the number of rings rising with each value.',
        subject_treatment:
          "Draw the prompt's values as shapes filled with nested contour lines, one ring per declared step, so the level reads like elevation; keep labels exact.",
        color_and_tone: 'Earthy or monochrome ramps with one highlight on the current level line.',
        lighting_and_shadow:
          'Flat cartographic rendering with depth suggested only by line density.',
        texture_and_material: 'Fine even contour lines, crisp step labels and a paper-map calm.',
        camera_and_composition:
          'Frontal gauges with a clear step legend and the current line emphasized.',
        atmosphere_and_mood:
          'Exploratory and grounded, like reading terrain rather than a machine.',
        rendering_and_quality:
          'The count of contour steps matches each value, with no invented rings.',
        key_features: 'nested contour rings; step legend; highlighted level; map calm',
      },
      ['decorative contours', 'uncounted rings', 'real geographic data'],
      [
        'The HUD of an expedition climbing a mountain that keeps growing: altitude, stamina and supplies drawn as contour-filled gauges, "STAMINA 6/10" highlighted, earthy tones.',
        'A contour-line gauge for a mole\'s underground tunneling game, "DEPTH 7 RINGS", "SNACKS 2 RINGS", drawn like a very serious survey map.',
        'A quiet hiking-app gauge: five contour rings with three filled and the label "3/5", soft green lines on cream.',
      ],
    ),
    H(
      'R-HUD-17',
      'Diegetic Cockpit Layout',
      'in-world cockpit HUD profile',
      'diegetic-cockpit',
      {
        aesthetic:
          "Diegetic Cockpit Layout: readouts placed on the zones of a physical in-world panel according to priority and the pilot's field of view.",
        subject_treatment:
          "Place the prompt's readouts on zones of an in-world control panel by priority, main readings in the frontal field; keep every value exact.",
        color_and_tone: 'Data contrast independent of the panel material, alerts backed by shape.',
        lighting_and_shadow:
          'Sober cockpit lighting that keeps every priority instrument clear of reflections.',
        texture_and_material:
          'Consistent panel material and plausible fixings with purposeful detail.',
        camera_and_composition:
          'Main readings inside the frontal field, secondary ones in reachable periphery.',
        atmosphere_and_mood: 'In-world presence and orientation, grounded in a believable seat.',
        rendering_and_quality:
          'The camera never hides required information or changes its hierarchy.',
        key_features: 'in-world panel; priority zones; frontal field; seated camera',
      },
      ['impossible panel', 'data out of view', 'too many fictional instruments'],
      [
        'The cockpit of a rover crossing a storm on an alien moon, seen from the driver\'s seat: "POWER 68%", "HEADING 042°" and "LINK STABLE" in the frontal field.',
        'The driver\'s seat of an ice-cream truck in a zombie game, "FREEZER 40%", "MUSIC ON" and "SPEED 30" placed on the dashboard by priority.',
        "An observation post seen from the operator's chair: reserve, route and archive readouts in three zones, dim light and no reflections.",
      ],
      'profile',
    ),
    H(
      'R-HUD-18',
      'Peripheral Combat Overlay',
      'edge-placed gameplay overlay profile',
      'peripheral-overlay',
      {
        aesthetic:
          'Peripheral Combat Overlay: gameplay information pushed to the screen edges so the center of action stays free, with clear priorities.',
        subject_treatment:
          "Place the prompt's gameplay information at the screen periphery by priority, keeping the central action zone clear; keep every value and slot count exact.",
        color_and_tone:
          'Critical data in high contrast, secondary data sober, states backed by shape.',
        lighting_and_shadow: 'A graphic overlay that keeps the scene fully readable beneath it.',
        texture_and_material:
          'Sharp edges and lightly opaque panels where the background needs context.',
        camera_and_composition:
          'Clear center, resources in one stable zone and short events in another.',
        atmosphere_and_mood: 'Peripheral awareness and control, focused on the action.',
        rendering_and_quality: 'The target silhouette and the main action stay completely free.',
        key_features: 'clear center; peripheral resources; event zone; exact slot count',
      },
      ['invaded center', 'fake persistent alerts', 'values changed to balance the composition'],
      [
        'A boss-fight overlay framing a giant sea serpent in the center: "HEALTH 68/100", "FOCUS 42/100" and four empty skill slots at the edges, center completely clear.',
        'An overlay for a goose-chasing game with "HONKS 3", "BREAD 7" and a notification "GOOSE ESCAPED" in the event corner, the goose free in the center.',
        'An exploration overlay with a protected center, "RESERVE 55%" and "ROUTE B" in opposite corners and one "Saved" notice.',
      ],
      'profile',
    ),
    H(
      'R-HUD-19',
      'Tactical Map Stack',
      'layered tactical map screen profile',
      'tactical-map-stack',
      {
        aesthetic:
          'Tactical Map Stack: a map, switchable route layers and linked info cards kept in sync by stable ids and coordinates.',
        subject_treatment:
          "Show the prompt's map with switchable route layers and a card for the selected item, every node, id and coordinate kept exact.",
        color_and_tone:
          'One bright active layer, faint secondary context and selection backed by outline.',
        lighting_and_shadow: 'Flat top-down rendering that keeps the topology undistorted.',
        texture_and_material: 'Clean route lines, readable nodes and crisp text panels.',
        camera_and_composition:
          'Dominant map, compact layer controls and an inspector tied to selection.',
        atmosphere_and_mood: 'Tactical reading and stable context, calm and in control.',
        rendering_and_quality: 'Switching layers never moves nodes or changes the selected card.',
        key_features: 'map with layers; linked card; stable ids; flat topology',
      },
      ['shifted coordinates', 'decorative layers', 'disconnected cards'],
      [
        'The war-table map of a castle under siege: nodes A, B and C, route A-B-C active, the card for gate B open, layers toggled at the side, charcoal and parchment tones.',
        'A tactical map for a squirrel planning a heist on a bird feeder, three markers, two approach routes and the card "FEEDER C: HEAVILY GUARDED".',
        'An exploration map with three markers and two approved routes, the layer stack and marker C card open, scale unchanged.',
      ],
      'profile',
    ),
  ],
};

export default spec;
