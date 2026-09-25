import type { Spec } from '../tools/apply';
import { design } from './_design';

// UI & app design (part A): R-UI-01..10. Each style is one interface organization rule; requested labels stay exact.
const U = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
) => design(name, domain, tag, 'ui', fields, avoid, briefs, { text: true, source });

const spec: Spec = {
  pack: 'pack_25',
  category: '4. UI & App Design',
  newCategory: { id: 'ui-and-app-design' },
  updates: {},
  creates: [
    U(
      'R-UI-01',
      'Editorial Index Interface',
      'editorial index app layout',
      'editorial-index',
      {
        aesthetic:
          'Editorial Index Interface: typography, side indexes and light dividers organize app content with the calm rhythm of a well-set publication.',
        subject_treatment:
          "Lay out the prompt's app or screen through type hierarchy and a side index, using light dividers instead of repeated cards; keep every requested label exact.",
        color_and_tone:
          'Neutral base with one accent reserved for selection and the main action only.',
        lighting_and_shadow:
          'Flat screen rendering where contrast and surface hierarchy replace any volumetric shadow.',
        texture_and_material:
          'Clean flat surfaces and fine rules, leaving the type to do the talking.',
        camera_and_composition:
          'Narrow index column, dominant reading column and secondary detail with its own margin.',
        atmosphere_and_mood:
          'Serene editorial rhythm with generous pauses, still clearly a working app.',
        rendering_and_quality:
          'Aligned baselines, clear heading spacing and stable reading with long titles.',
        key_features: 'side index; type hierarchy; light dividers; one accent',
      },
      ['illegible ornamental type', 'indexes with no function', 'cards added by reflex'],
      [
        'The archive screen of an app that catalogs every dream you have ever had: a year index on the left, dream titles with duration in the center, "Dreams", "Nightmares" and "Search" as exact labels, calm ivory background.',
        'A royal court gossip app laid out like a quiet literary index, rumors sorted by scandal level in a side column, the selected rumor open in a wide reading pane, labels "Whispers" and "Verify" exact.',
        'A reading app for lighthouse keepers\' logbooks, a side index of years, one long entry open in a generous column, exact labels "Logbook" and "Open", soft grey rules.',
      ],
    ),
    U(
      'R-UI-02',
      'Instrument Rail Interface',
      'control-to-reading rail layout',
      'instrument-rail',
      {
        aesthetic:
          'Instrument Rail Interface: controls sit on continuous rails that link each one directly to the parameter or result it changes.',
        subject_treatment:
          "Build the prompt's screen as parallel rails where every control lines up with its own reading, keeping requested labels and values exact.",
        color_and_tone: 'Color by functional role and neutral values for secondary information.',
        lighting_and_shadow:
          'Very restrained depth, with active indicators glowing only where they carry function.',
        texture_and_material:
          'Sober rails, defined controls and smooth surfaces with no fake brushed metal.',
        camera_and_composition:
          'Input, control and result grouped on one axis, rails separated by space rather than frames.',
        atmosphere_and_mood:
          'Operational precision with an instrumental feel, without recreating a whole device.',
        rendering_and_quality:
          'Every reading is clearly attributed to its control, with no crossing lines.',
        key_features:
          'continuous rails; aligned control and reading; role colors; restrained depth',
      },
      ['decorative controls', 'crossed control-to-value links', 'scales with no units'],
      [
        'The control screen of a machine that mixes weather for a small kingdom: four rails for "Rain", "Wind", "Thunder" and "Sun", each slider aligned to its reading, charcoal with a violet accent.',
        'A potion-brewing app on four instrument rails, "Bubbles", "Glow", "Stink" and "Regret", every slider linked to a tiny reading, deep green panel, very precise about something ridiculous.',
        'A photo-editing panel with three quiet rails, "Exposure", "Contrast" and "Warmth", each aligned to its value and a preview on the right, pale background and one coral accent.',
      ],
    ),
    U(
      'R-UI-03',
      'Soft Containment Interface',
      'soft container app layout',
      'soft-containment',
      {
        aesthetic:
          'Soft Containment Interface: expressive soft-edged containers group tasks by hierarchy with consistent inner spacing.',
        subject_treatment:
          "Group the prompt's screen into soft-edged containers shaped by hierarchy, one large primary container and compact secondary groups; keep requested labels exact.",
        color_and_tone:
          'One neutral main surface and at most two color roles for activity and attention.',
        lighting_and_shadow:
          'Soft shadows only between functional levels, with every other surface flat.',
        texture_and_material: 'Matte surfaces and soft edges with related radii throughout.',
        camera_and_composition:
          'Large primary container, compact secondary groups and consistent inner spacing.',
        atmosphere_and_mood:
          'Closeness and breathing room, expressive in shape but still a serious tool.',
        rendering_and_quality:
          'Container shapes reinforce grouping and keep every control aligned.',
        key_features: 'soft containers; hierarchy by size; consistent padding; two color roles',
      },
      ['random bubbles', 'misaligned controls', 'too many incompatible radii'],
      [
        'The planner of a band of retired superheroes: the current mission in one large soft container, "Team" and "Snacks" as compact groups beside it, cream and plum, labels exact.',
        'A pet-rock care app that takes its job extremely seriously, a big soft container for "Today\'s Mood", two small groups for "Polish" and "Talk", warm pastel surfaces.',
        'A night journal app with one large soft container for writing, a small "Save" group and a gentle error state, dark neutral background and one warm accent.',
      ],
    ),
    U(
      'R-UI-04',
      'Ledger-and-Tab Interface',
      'ledger rows and index tab layout',
      'ledger-tab',
      {
        aesthetic:
          'Ledger-and-Tab Interface: clear rows and index tabs create a register you read like a well-kept ledger, crisp and textureless.',
        subject_treatment:
          "Build the prompt's records as clear rows under stable headers with index tabs tied to the content; keep every column name and value exact.",
        color_and_tone:
          'Neutral background, a very discreet row alternation and one accent for selection.',
        lighting_and_shadow: 'Flat reading with value hierarchy, crisp and even across the table.',
        texture_and_material: 'Fine register lines, clean type and index tabs with defined edges.',
        camera_and_composition:
          'Columns aligned by data type, headers visible even in dense layouts.',
        atmosphere_and_mood: 'Archive order with contained warmth, neat and trustworthy.',
        rendering_and_quality:
          'Numbers, long labels and empty cells keep their alignment and meaning.',
        key_features: 'ledger rows; index tabs; stable headers; one selection accent',
      },
      ['mandatory notebook texture', 'misaligned columns', 'tabs with no destination'],
      [
        'The inventory ledger of a dragon\'s hoard, columns "Treasure", "Stolen From" and "Status", six rows and tabs for each cave, bone background with fine rules and one gold selection.',
        'A shared-flat chores ledger where every row is a passive-aggressive dispute, columns "Task", "Blame" and "Done", tabs per roommate, crisp and petty.',
        'A small library loans screen with rows marked "Available", "Borrowed" and "In Repair", tabs per shelf and a compact search box, charcoal and cream.',
      ],
    ),
    U(
      'R-UI-05',
      'Open-Frame Utility',
      'partial-border workspace layout',
      'open-frame-utility',
      {
        aesthetic:
          'Open-Frame Utility: partial borders, shared guide lines and sober grounds define regions without boxing everything into cards.',
        subject_treatment:
          "Divide the prompt's workspace with partial borders and shared guides, leaving open the sides that add no grouping; keep requested labels exact.",
        color_and_tone: 'Close neutral values for surfaces and high contrast for text and focus.',
        lighting_and_shadow: 'Separation carried by space, line and contrast on flat surfaces.',
        texture_and_material: 'Sober planes and lines of consistent weight on plain grounds.',
        camera_and_composition:
          'Guides align content across open regions so no block needs its own frame.',
        atmosphere_and_mood:
          'Technical lightness and one continuous workspace, finished and deliberate.',
        rendering_and_quality: 'Partial borders end with intent and keep interactive limits clear.',
        key_features: 'partial borders; shared guides; open regions; high-contrast focus',
      },
      ['unfinished wireframe', 'ambiguous limits', 'lines running through content'],
      [
        'The workspace of a castle siege planner: tool library left, battle map center, inspector right with "Position", "Troops" and "Catapult" exact, charcoal with a coral accent and open borders.',
        'A comedy writers\' room app with jokes listed left, the joke being argued about in the center and a "Laugh Meter" inspector on the right, open guides and no boxes.',
        'A research notes app with questions on the left, one long note in the center and references in the margin, pale background, lines that never cross the text.',
      ],
    ),
    U(
      'R-UI-06',
      'Layered Paper Controls',
      'stacked sheet control layout',
      'layered-paper',
      {
        aesthetic:
          'Layered Paper Controls: a few overlapping flat sheets with discreet edges show grouping and editing state like tidy index cards.',
        subject_treatment:
          "Stack the prompt's screen as a few overlapping planes with minimal edges that show groups and edit state; keep requested labels exact.",
        color_and_tone: 'Close values with one selection accent and well-contrasted text.',
        lighting_and_shadow: 'A short even shadow only on planes that truly overlap.',
        texture_and_material:
          'Smooth graphic paper-like surfaces with crisp edges and no visible fibre.',
        camera_and_composition: 'Few stack levels, visible tabs and content aligned across layers.',
        atmosphere_and_mood: 'Editorial tactility and order, like handled cards on a clean desk.',
        rendering_and_quality:
          'At most one depth level per function, text always sharp and frontal.',
        key_features: 'overlapping sheets; visible tabs; short shadows; sharp text',
      },
      ['collage of papers', 'excessive shadows', 'active state shown only by elevation'],
      [
        'A detective\'s case-file app: the suspect sheet on top, "Evidence" and "Alibi" tabs peeking from layers below, cream and ink blue, one red selection mark.',
        'A screenplay app where scenes, dialogue and the director\'s increasingly desperate notes sit on three stacked sheets, labels "Scene 12" and "Cut" exact, coral accent.',
        'A music session planner with the active song sheet on top and a set list layer beneath, dark neutral background, grey layers and clear light text.',
      ],
    ),
    U(
      'R-UI-07',
      'Dense Precision Console',
      'dense operational console layout',
      'dense-console',
      {
        aesthetic:
          'Dense Precision Console: a short type scale, compact rows and sober states pack a lot of operational information while staying legible.',
        subject_treatment:
          "Set the prompt's screen with a short type scale, compact rows and functional groups, keeping every label, value and unit exact and readable.",
        color_and_tone:
          'Controlled contrast, clear primary reading, discreet helpers and states backed by shape.',
        lighting_and_shadow: 'Flat screen with signal lights only for authorized active states.',
        texture_and_material:
          'Neutral surfaces, precise separators and controls of coherent density.',
        camera_and_composition:
          'Aligned columns and rows with stable action areas and room for focus.',
        atmosphere_and_mood:
          'Professional concentration, dense with information yet calm and readable.',
        rendering_and_quality:
          'Full labels at real size, values, units and actions clearly distinct.',
        key_features: 'compact rows; short type scale; state shapes; aligned columns',
      },
      ['microscopic text', 'invented charts', 'controls compressed until confused'],
      [
        'The mission console of an asteroid mining rig: columns "Drill", "Depth", "Status" and a "Stop" action, rows for three drills, near-black surface with a violet accent, dense but clear.',
        'A console for managing a hotel run entirely by ghosts, rows for "Room", "Haunting" and "Complaints", compact and serious, one amber accent.',
        'An audio editor track list with exact "Mute" and "Solo" controls aligned on every row, dense yet legible, charcoal background and one selected track.',
      ],
    ),
    U(
      'R-UI-08',
      'Chromatic Function Blocks',
      'color-coded role block layout',
      'chromatic-blocks',
      {
        aesthetic:
          'Chromatic Function Blocks: bold color blocks consistently mark roles and actions, always backed by shape, icon or fixed position.',
        subject_treatment:
          "Assign the prompt's screen areas to a few recurring color blocks by role, each backed by shape or position; keep requested labels exact.",
        color_and_tone:
          'Short palette of strong colors on neutral surfaces, meaning never carried by color alone.',
        lighting_and_shadow: 'Flat rendering with hierarchy from mass and contrast.',
        texture_and_material: 'Smooth blocks, precise edges and minimal interior detail.',
        camera_and_composition:
          'Each role keeps its place and relative size, with calm reading zones between.',
        atmosphere_and_mood: 'Graphic energy and instant orientation, with room to rest the eye.',
        rendering_and_quality: 'Roles verified in greyscale and with complete labels.',
        key_features: 'role color blocks; shape backup; fixed positions; neutral surfaces',
      },
      ['fake functional rainbow', 'decorative blocks', 'priority changed by saturation'],
      [
        'A spaceship crew roster app in three bold color blocks, "Bridge", "Engine" and "Escape Pods", each block always in the same place, light grey surface, urgent and clear.',
        'A kitchen app for a chaotic family dinner with color blocks for "Cooking", "Burning" and "Ordering Pizza", strong colors backed by icons, cheerful panic.',
        'A file organizer with calm color blocks for "Review", "Keep" and "Move", each with its own icon and place, soft neutral surface.',
      ],
    ),
    U(
      'R-UI-09',
      'Tactile Recessed Controls',
      'recessed physical-feel control panel',
      'tactile-recessed',
      {
        aesthetic:
          'Tactile Recessed Controls: recessed sliders, grip edges and small status lights make every action feel physical and clear.',
        subject_treatment:
          "Express the prompt's controls as recessed sliders, grip-edged buttons and small status lights, grouped by action; keep requested labels exact.",
        color_and_tone:
          'Neutral dark or light surface with localized accent lights and legible labels.',
        lighting_and_shadow:
          'Broad ambient light with moderate cavity shade and small contained LEDs.',
        texture_and_material: 'Sober semi-matte material with low relief and no mandatory chrome.',
        camera_and_composition:
          'Controls grouped by action and spaced so every recess reads clearly.',
        atmosphere_and_mood: 'Sober tactility and precision, satisfying to imagine pressing.',
        rendering_and_quality:
          'Button, slider and reading stay distinct without photographic realism.',
        key_features: 'recessed sliders; grip edges; small status LEDs; grouped controls',
      },
      ['skeuomorphism that hides function', 'too many lights', 'text over deep shadows'],
      [
        'The control panel of a time machine built in a garage: recessed sliders for "Year" and "Stability", a grip-edged "Go" button and one blinking status light, dark graphite.',
        'A remote for a very dramatic smart toaster with recessed "Toast", "Burn" and "Regret" controls and tiny LEDs, soft grey surface, oddly premium.',
        'A sound-effects panel with recessed "Rain" and "Fire" sliders, two toggles with soft LEDs, charcoal and violet, calm and precise.',
      ],
    ),
    U(
      'R-UI-10',
      'Sparse Research Canvas',
      'open canvas research layout',
      'sparse-canvas',
      {
        aesthetic:
          'Sparse Research Canvas: content pieces and annotations float on a wide calm canvas, joined only by the connections that truly exist.',
        subject_treatment:
          "Lay the prompt's content out on an open canvas with peripheral notes and only the requested connections, a small inspector appearing on selection; keep labels exact.",
        color_and_tone:
          'Calm base, one selection accent and connections lower in contrast than the pieces.',
        lighting_and_shadow: 'Flat canvas with the faintest functional overlap between items.',
        texture_and_material: 'Clean surfaces, subtly edged notes and clear connection lines.',
        camera_and_composition:
          'Wide canvas with room to grow and an inspector only when something is selected.',
        atmosphere_and_mood:
          'Open exploration and clarity, spacious, thoughtful and easy to follow.',
        rendering_and_quality: 'Content stays legible as items multiply and when one is selected.',
        key_features: 'open canvas; true connections only; margin notes; contextual inspector',
      },
      ['dominant panels', 'invented connections', 'notes with no hierarchy'],
      [
        'An investigation canvas for a lost-city expedition: three map fragments, two photos and three notes joined only by the links the team found, one selected note, calm dark surface.',
        'A canvas where a cat owner tracks the cat\'s crimes: "Vase", "Curtain" and "Sock" pieces linked by suspicious lines, one inspector open, light and airy.',
        'A quiet research canvas with four pinned references and two notes, one link between them and a compact inspector, pale background and a plum accent.',
      ],
    ),
  ],
};

export default spec;
