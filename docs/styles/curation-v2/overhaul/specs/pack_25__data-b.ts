import type { Spec } from '../tools/apply';
import { design } from './_design';

// Information & technical graphics (part B): R-DAT-11, 12, 14, 15, 16 styles, R-DAT-17/18 profiles, and three new
// styles replacing R-DAT-13 (overlaps pack_10 Transit Map Diagram) and the R-DAT-19/20 verification recipes
// (see QA-PROTOCOLS.md).
const D = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
  kind: 'style' | 'profile' = 'style',
) => design(name, domain, tag, 'infographic', fields, avoid, briefs, { text: true, source, kind });

const DATA = 'invented values, links or measurements';

const spec: Spec = {
  pack: 'pack_25',
  category: '12. Information & Technical Graphics',
  updates: {},
  creates: [
    D(
      'R-DAT-11',
      'Cutaway Instruction Plates',
      'partial cutaway explainer plate',
      'cutaway-instruction',
      {
        aesthetic:
          'Cutaway Instruction Plates: one bounded part of the exterior removed to show only the documented inside, with context and wall thickness kept.',
        subject_treatment:
          "Remove one bounded part of the prompt's object to show only its documented inner parts, keeping the outside recognizable and every callout exact.",
        color_and_tone:
          'Neutral exterior, a distinct cut plane and a few interior codes tied to the legend.',
        lighting_and_shadow:
          'Coherent descriptive shading, with cut lines and callouts kept independent of it.',
        texture_and_material: 'Consistent section hatching, unknown hidden surfaces left plain.',
        camera_and_composition:
          'Main view with a clear cut boundary and details only for real meetings.',
        atmosphere_and_mood:
          'Contained technical curiosity, one opening revealing one relationship.',
        rendering_and_quality:
          'Crisp plate where the section matches the model and nothing floats.',
        key_features: 'bounded cutaway; documented interior; section hatching; kept exterior',
      },
      ['imagined gears', 'incompatible thickness', 'unmarked cuts through parts', DATA],
      [
        'A cutaway plate of a lighthouse lamp room with one quarter of the wall removed, showing the lens, the lamp and the stair labeled exactly, the rest of the tower intact.',
        'A cutaway of a very ordinary rubber duck revealing that it is, in fact, just hollow, callout "AIR" and a disappointed note "THAT\'S ALL".',
        'A cutaway of a hollow container, one quarter of the body removed, base, wall and lid labeled, "DEMONSTRATION MODEL".',
      ],
    ),
    D(
      'R-DAT-12',
      'Ink-and-Color Notation',
      'ink line with coded color notes',
      'ink-color-notation',
      {
        aesthetic:
          'Ink-and-Color Notation: sober ink lines and small coded patches of color separate observation, action and grouping like a working notebook.',
        subject_treatment:
          "Draw the prompt's explanation in sober ink with small color patches coding function, the same function keeping one color and symbol; keep labels exact.",
        color_and_tone: 'Dark ink on a warm ground with two accents of declared meaning.',
        lighting_and_shadow: 'Flat page where white reserves separate information clearly.',
        texture_and_material:
          'A slightly human stroke with exact anchors and no stray marks on data.',
        camera_and_composition:
          'Figure, steps and notes in aligned groups, accents only at action points.',
        atmosphere_and_mood: 'The clarity of a working notebook, intentional and close.',
        rendering_and_quality: 'Crisp notation with legible lines and uniform numerals.',
        key_features: 'ink lines; coded color patches; working notebook; exact anchors',
      },
      [
        'scribbles that look like data',
        'deformed dimensions',
        'color outside its legend meaning',
        DATA,
      ],
      [
        'An ink notebook page explaining how to tame a griffin in three steps, "APPROACH", "OFFER" and "RUN", small yellow patches marking the moments of danger.',
        'Three ink steps explaining how to fold a fitted sheet, "GRAB", "FOLD" and "GIVE UP", with small red patches marking each failure point.',
        'Three ink folding steps for a panel, fold lines dashed and one small yellow patch for the pressure zone, order 1, 2, 3.',
      ],
    ),
    D(
      'R-DAT-14',
      'Chronological Strip Graphics',
      'time-proportional event strip',
      'chronological-strip',
      {
        aesthetic:
          'Chronological Strip Graphics: events laid on bands along one explicit time scale, durations as lengths and instants as distinct marks.',
        subject_treatment:
          "Place the prompt's events on one explicit time scale, durations as proportional lengths and instants as distinct marks, every time and label exact.",
        color_and_tone: 'Colors by event type backed by text, time shown by position alone.',
        lighting_and_shadow: 'Flat bands with no shadow that could read as an interval.',
        texture_and_material:
          'Continuous bands, even tick marks and true gaps where nothing happens.',
        camera_and_composition: 'One shared time axis, named lanes and marked breaks.',
        atmosphere_and_mood: 'A faithful cadence of appearance, persistence and pause.',
        rendering_and_quality: 'Crisp strip with exact interval ends and centered instant marks.',
        key_features: 'proportional time; duration bands; instant marks; shared axis',
      },
      [
        'evenly spaced unequal times',
        'invented durations',
        'silences compressed without notice',
        DATA,
      ],
      [
        'A time strip of the last 45 minutes aboard a sinking ship, events at 22:00, 22:20 and 22:45 placed proportionally, lanes "DECK", "RADIO" and "LIFEBOATS".',
        'A time strip of a cat\'s day, "SLEEP" from 0 to 20 hours and "CHAOS" from 20 to 20:05, the proportions painfully honest.',
        'A 12-second session with segments A 0-4, B 4-8 and C 8-12 on one axis with ticks at 0, 4, 8 and 12.',
      ],
    ),
    D(
      'R-DAT-15',
      'Nested System Explainers',
      'nested container system diagram',
      'nested-system',
      {
        aesthetic:
          'Nested System Explainers: nested containers matching the real levels of a system, with named gates wherever links cross a boundary.',
        subject_treatment:
          "Nest the prompt's system levels as containers that match its real hierarchy, links crossing only through named gates; keep every name exact.",
        color_and_tone: 'Palette by depth in moderate contrast with one color for the selection.',
        lighting_and_shadow: 'Flat levels separated by lines, margins and header bands.',
        texture_and_material: 'Flat surfaces and borders growing thinner toward the detail.',
        camera_and_composition:
          'A header on every container, even inner margins and declared ports.',
        atmosphere_and_mood: 'Progressive discovery from whole to detail with clear limits.',
        rendering_and_quality: 'Crisp diagram with exact nesting and each node shown once.',
        key_features: 'nested containers; named gates; header per level; exact hierarchy',
      },
      ['invented membership', 'empty ornamental containers', 'duplicated elements', DATA],
      [
        'A nested explainer of a dragon\'s hoard system: "MOUNTAIN" contains "CAVE", which contains "GOLD" and "EGGS", one gate labeled "THE ONLY WAY OUT".',
        'A nested diagram of a messy handbag: "BAG" contains "POCKET", which contains "ANOTHER POCKET", which contains "THE KEYS, FINALLY".',
        'A project containing "Track A" and "Track B", with Track A containing "Clip 1" and "Clip 2", one external link through a named port.',
      ],
    ),
    D(
      'R-DAT-16',
      'Dot-Unit Comparison',
      'one-dot-per-unit comparison',
      'dot-unit',
      {
        aesthetic:
          'Dot-Unit Comparison: one identical mark stands for one unit, grouped in rows so every count can be checked by eye.',
        subject_treatment:
          "Show the prompt's quantities with one identical mark per unit in rows of a declared size, totals printed beside each group and every number exact.",
        color_and_tone: 'Category colors backed by spacing or shape, every mark worth the same.',
        lighting_and_shadow: 'Flat marks with no depth, all read as equal discrete units.',
        texture_and_material: 'Simple circles or marks of constant area with crisp edges.',
        camera_and_composition:
          'Rows of declared capacity with visible gaps and exact totals beside each.',
        atmosphere_and_mood: 'Orderly repetition with differences you can count in a moment.',
        rendering_and_quality: 'Crisp chart with complete units and counts matching the totals.',
        key_features: 'one mark per unit; rows of fixed size; printed totals; countable',
      },
      ['approximate counts', 'unequal mark sizes', 'decorative dots outside the system', DATA],
      [
        'A dot chart of the survivors of three shipwrecked crews, 12, 8 and 4, one dot per sailor in rows of four, totals beside each group, legend "1 dot = 1 sailor".',
        'A dot chart of socks lost per family member this year, 12, 9 and 1, rows of three, the one with 1 looking smug.',
        'Three calm groups of 5, 10 and 15 marks in rows of five, equal size, totals printed beside each.',
      ],
    ),
    D(
      'R-DAT-13-NEW',
      'Sketchnote Visual Notes',
      'hand-drawn sketchnote explainer',
      'sketchnote',
      {
        aesthetic:
          'Sketchnote Visual Notes: hand-drawn visual notes mixing quick doodles, hand lettering, arrows and containers into one lively explanation.',
        subject_treatment:
          "Explain the prompt's topic as hand-drawn visual notes, quick doodles, boxed hand-lettered headings and arrows, every requested word spelled exactly.",
        color_and_tone: 'Black fineliner with one or two marker accent colors and grey shadows.',
        lighting_and_shadow: 'Flat paper with simple grey marker shadows under boxes and doodles.',
        texture_and_material: 'Fineliner ink, marker strokes and a clean notebook page.',
        camera_and_composition:
          'A central title with ideas radiating or flowing in a clear reading path.',
        atmosphere_and_mood:
          'Friendly, energetic and approachable, like a great teacher at a whiteboard.',
        rendering_and_quality: 'Crisp hand-drawn notes with confident lines and legible lettering.',
        key_features:
          'doodles and hand lettering; marker accents; clear reading path; boxed headings',
      },
      ['illegible handwriting', 'clutter with no reading order', 'misspelled headings', DATA],
      [
        'Sketchnotes explaining "HOW A VOLCANO WAKES UP", doodled magma, a grumpy mountain face and arrows through "PRESSURE", "CRACK" and "BOOM", red marker accents.',
        'Sketchnotes summarizing a meeting that could have been an email, boxes "AGENDA", "SNACKS" and "NOTHING DECIDED", with a doodled clock melting.',
        'Calm sketchnotes titled "HOW BREAD RISES", three doodled steps and one yellow accent, clear reading order.',
      ],
    ),
    D(
      'R-DAT-19-NEW',
      'Slope-Chart Editorials',
      'editorial slope chart',
      'slope-chart',
      {
        aesthetic:
          'Slope-Chart Editorials: two columns of values joined by straight lines, the slopes telling the story of who rose and who fell.',
        subject_treatment:
          "Show the prompt's supplied before and after values as a slope chart, two labeled columns joined by lines, one highlighted line and every value exact.",
        color_and_tone:
          'Grey lines for context and one or two bold highlight colors for the story.',
        lighting_and_shadow: 'Flat editorial chart with no shading or depth.',
        texture_and_material: 'Clean lines, round end dots and crisp editorial type.',
        camera_and_composition:
          'Two aligned value columns with labels at both ends and a headline above.',
        atmosphere_and_mood:
          'Editorial and pointed, a story told by a single rising or falling line.',
        rendering_and_quality: 'Crisp chart where line ends sit exactly on their stated values.',
        key_features: 'two value columns; joining slopes; highlighted line; headline',
      },
      ['lines not matching values', 'unlabeled ends', 'invented extra points', DATA],
      [
        'A slope chart of five kingdoms\' dragon populations from "YEAR 1" to "YEAR 100", only one line rising steeply in red, headline "THE NORTH REMEMBERS".',
        'A slope chart of household snack levels from "MONDAY" to "FRIDAY", every line collapsing except "BROCCOLI", headline "NOBODY TOUCHED IT".',
        'A calm slope chart of three values from "BEFORE" to "AFTER", one line highlighted in blue, labels at both ends.',
      ],
    ),
    D(
      'R-DAT-20-NEW',
      'Periodic Grid Systems',
      'periodic table style grid',
      'periodic-grid',
      {
        aesthetic:
          'Periodic Grid Systems: any set of things organized into a periodic-table-like grid of tiles, each with a symbol, a number and a category color.',
        subject_treatment:
          "Organize the prompt's items into a periodic-table-style grid of tiles, each with a short symbol, number and name, grouped by category color; keep all text exact.",
        color_and_tone: 'Category colors in a limited palette on a light ground with dark type.',
        lighting_and_shadow: 'Flat tiles with no shading, crisp like a classroom poster.',
        texture_and_material: 'Clean rounded tiles, bold symbols and small secondary text.',
        camera_and_composition:
          'A structured grid with groups in blocks and a legend of categories.',
        atmosphere_and_mood: 'Playful and systematic, a whole world ordered into neat elements.',
        rendering_and_quality: 'Crisp grid with every tile legible and consistent in layout.',
        key_features: 'element tiles; symbol and number; category colors; structured grid',
      },
      ['illegible tiles', 'inconsistent tile layout', 'real chemical data presented as this', DATA],
      [
        'A periodic table of mythical creatures, tiles "Dr" Dragon, "Ph" Phoenix, "Kr" Kraken and "Gr" Griffin, grouped as "SKY", "SEA" and "FIRE", classroom-poster style.',
        'A periodic table of excuses for being late, tiles "Tr" Traffic, "Al" Alarm, "Ca" Cat and "Ex" Existential Dread, grouped by believability.',
        'A calm periodic grid of bread types, tiles "Sd" Sourdough, "Ry" Rye and "Br" Brioche, grouped by crust, soft colors.',
      ],
    ),
    D(
      'R-DAT-17',
      'Synchronized Telemetry Layout',
      'synced multi-panel telemetry profile',
      'synced-telemetry',
      {
        aesthetic:
          'Synchronized Telemetry Layout: several signal panels and images sharing one time axis, one cursor and one set of ids.',
        subject_treatment:
          "Lay out the prompt's signals in panels sharing one time axis and one cursor, the detail repeating the exact values at that instant.",
        color_and_tone: 'One color per signal in every panel, alerts only for supplied states.',
        lighting_and_shadow: 'Flat screen with crisp separation between grid, data and cursor.',
        texture_and_material: 'Light grids and one stroke per signal on a clean reading area.',
        camera_and_composition:
          'One time axis, a coordinated cursor, a persistent legend and a detail box.',
        atmosphere_and_mood: 'Coordinated attention, every panel clearly from the same moment.',
        rendering_and_quality:
          'Crisp layout with exact timestamps, aligned cursors and a static mockup label.',
        key_features: 'shared time axis; one cursor; synced detail; persistent legend',
      },
      [
        'fake synchronization',
        'mismatched numbers between panels',
        'signals with no data source',
        DATA,
      ],
      [
        'The flight recorder layout of a starship that lost contact, three signals "HULL", "POWER" and "SIGNAL" on one axis with the cursor at "T+8 s" and the exact values beside it.',
        'Telemetry of a toddler\'s birthday party, panels "SUGAR", "NOISE" and "TEARS", the cursor at the moment the cake arrived.',
        'A static mockup of two signals on 0, 4, 8 and 12 s, cursor at 8 s and the detail repeating those values.',
      ],
      'profile',
    ),
    D(
      'R-DAT-18',
      'Overview-and-Detail Map',
      'overview with enlargement profile',
      'overview-detail',
      {
        aesthetic:
          'Overview-and-Detail Map: one overview keeps every coordinate while an inset enlarges one exact region, linked by clear corners.',
        subject_treatment:
          "Show the prompt's overview with its coordinates intact and an inset enlarging one exact region, linked by corner lines; keep every label exact.",
        color_and_tone:
          'The same codes in overview and detail, with a unique color for the selection frame.',
        lighting_and_shadow: 'Flat schematic rendering that keeps the source projection.',
        texture_and_material:
          'Crisp outlines, controlled symbols and a declared scale for each view.',
        camera_and_composition:
          'Dominant overview, a linked inset and labels naming region and scale.',
        atmosphere_and_mood: 'An oriented change of scale that never loses the reference point.',
        rendering_and_quality: 'Crisp map where inset elements match the overview exactly.',
        key_features: 'overview map; exact inset; corner links; declared scale',
      },
      [
        'invented enlargements',
        'rotation without notice',
        'measurements from a non-metric schema',
        DATA,
      ],
      [
        'An overview of an invented pirate archipelago with an inset enlarging "SKULL BAY", the same three coves and one wreck in both views, corner lines linking them.',
        'An overview of a messy desk with an inset enlarging "THE DRAWER OF DOOM", every object in the same place in both views.',
        'An abstract plan of nodes A, B and C with an inset containing B and C unmoved, labeled "test coordinates".',
      ],
      'profile',
    ),
  ],
};

export default spec;
