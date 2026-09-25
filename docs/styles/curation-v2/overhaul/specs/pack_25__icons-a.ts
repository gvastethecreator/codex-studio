import type { Spec } from '../tools/apply';
import { design } from './_design';

// Interface icon systems (part A): R-ICO-01..10. Icon families keep one construction rule across members.
const I = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
) => design(name, domain, tag, 'icon', fields, avoid, briefs, { text: false, source });

const spec: Spec = {
  pack: 'pack_25',
  category: '2. Interface Icon Systems',
  newCategory: { id: 'interface-icon-systems' },
  updates: {},
  creates: [
    I(
      'R-ICO-01',
      'Open-Joint Monoline',
      'open-joint line icon family',
      'open-joint-monoline',
      {
        aesthetic:
          'Open-Joint Monoline: uniform line icons that leave small deliberate gaps at every joint, separating parts while the silhouette still reads as one.',
        subject_treatment:
          "Draw the prompt's subject or requested actions as monoline icons whose stroke joints open with small optical gaps, keeping each metaphor distinct.",
        color_and_tone:
          'One ink for the body, with any secondary accent repeating what the shape already says.',
        lighting_and_shadow:
          'Pure flat line work, crisp and even, with every stroke standing on its own.',
        texture_and_material:
          'Uniform stroke width with clean terminals and equal apparent weight on diagonals.',
        camera_and_composition:
          'Icons aligned by optical weight on equal boxes, extra air around important gaps.',
        atmosphere_and_mood: 'Light precision and openness, calm and legible rather than fragile.',
        rendering_and_quality:
          'Gaps survive at the smallest size and no crossing produces a darker spot.',
        key_features: 'open stroke joints; uniform monoline; equal boxes; light precision',
      },
      ['invisible gaps', 'accidental terminals', 'opened joints that change meaning'],
      [
        'Four monoline icons for a ghost-hunting toolkit app: summon, trap, release and banish, each joint left slightly open like a door ajar, one pale ink on midnight blue, equal boxes. No readable text or logo.',
        'A row of icons for a smart fridge that has opinions: judge, sigh, lock snacks and forgive, drawn in open-joint monoline with polite gaps, black on white. No readable text or logo.',
        "Icons for a lighthouse keeper's night log app: lamp on, fog, ship sighted and sleep, thin open-joint lines, warm grey ink, spaced calmly in one row. No readable text or logo.",
      ],
    ),
    I(
      'R-ICO-02',
      'Inset Stencil Solids',
      'bridged solid icon family',
      'inset-stencil',
      {
        aesthetic:
          'Inset Stencil Solids: solid icon masses cut with wide inner voids and deliberate bridges that keep every symbol in one piece.',
        subject_treatment:
          "Build the prompt's subject or requested actions as solid masses with wide bridges and inner cutouts that explain body and action.",
        color_and_tone:
          'Binary contrast, the cutouts belonging to the real background of each icon.',
        lighting_and_shadow: 'Flat solid shapes, with every bridge present in the geometry itself.',
        texture_and_material: 'Smooth surfaces and frank clean cuts, crisp and freshly machined.',
        camera_and_composition:
          'Main mass centered, voids protected near narrow edges, equal boxes.',
        atmosphere_and_mood:
          'Solid and decisive, with a few big cutouts instead of decorative detail.',
        rendering_and_quality:
          'Every inner island is intentionally bridged or intentionally separate.',
        key_features: 'solid masses; wide bridges; inner cutouts; binary contrast',
      },
      [
        'accidental islands',
        'hair-thin bridges',
        'every action turned into an industrial warning sign',
      ],
      [
        'Solid stencil icons for the control deck of a monster-containment vault: seal, flood, release and emergency, heavy black masses with wide bridges, grave and unmistakable. No readable text or logo.',
        "Icons for a pet hamster's smart home: wheel, snack, nap and escape attempt, chunky solid shapes with big cutouts, one bold ink, very serious for a hamster. No readable text or logo.",
        'Icons for a winter mountain hut: stove, blanket, radio and door, solid masses with generous voids, deep red ink on snow white, quiet and sturdy. No readable text or logo.',
      ],
    ),
    I(
      'R-ICO-03',
      'Chamfered Grid Glyphs',
      'chamfered orthogonal icon family',
      'chamfered-grid',
      {
        aesthetic:
          'Chamfered Grid Glyphs: icons built from orthogonal lines and measured chamfers that replace every curve while keeping optical proportion.',
        subject_treatment:
          "Rebuild the prompt's subject or requested actions with straight lines and measured corner chamfers, tuning each diagonal to keep metaphor and weight.",
        color_and_tone: 'One ink with wide voids, the chamfers reading clearly in a single color.',
        lighting_and_shadow: 'Flat technical drawing with crisp geometric edges and even weight.',
        texture_and_material: 'Geometric cut corners, uniform surfaces and clean joins throughout.',
        camera_and_composition:
          'One shared grid, with documented optical exceptions on short diagonals.',
        atmosphere_and_mood: 'Technical clarity and firmness, still friendly at small sizes.',
        rendering_and_quality:
          'One chamfer angle system, used consistently wherever it carries meaning.',
        key_features: 'measured chamfers; orthogonal grid; no curves; technical clarity',
      },
      [
        'chamfers as an ornamental filter',
        'random corners',
        'pictograms that get confused with each other',
      ],
      [
        'Chamfered icons for the cockpit of a deep-space mining ship: drill, tether, cargo and abort, sharp cut corners on a strict grid, amber ink on black. No readable text or logo.',
        "Icons for a robot butler's task menu: iron, pour, bow and fake politeness, all curves replaced by chamfered corners, one steel-grey ink, stiffly formal. No readable text or logo.",
        'Icons for a weather station on a remote island: pressure, wind, rain and record, chamfered orthogonal lines, deep blue ink, four even boxes. No readable text or logo.',
      ],
    ),
    I(
      'R-ICO-04',
      'Soft-Square Primitives',
      'squircle primitive icon family',
      'soft-square',
      {
        aesthetic:
          'Soft-Square Primitives: icon bodies assembled from softened squares with tense, consistent transitions between straight edges and curves.',
        subject_treatment:
          "Assemble the prompt's subject or requested actions from softened square primitives with tense straight-to-curve transitions, avoiding reflex circles.",
        color_and_tone: 'One ink or two functional values, flat and clean.',
        lighting_and_shadow: 'Flat forms whose friendliness comes entirely from the geometry.',
        texture_and_material:
          'Smooth contours and related radii with openings large enough to read.',
        camera_and_composition:
          'Each box tuned by optical fill, all icons sharing one visual floor.',
        atmosphere_and_mood: 'Contained warmth that still keeps serious actions looking serious.',
        rendering_and_quality: 'Inner and outer radii stay related without thickening the joins.',
        key_features: 'softened squares; tense transitions; related radii; shared floor',
      },
      ['indiscriminate rounding', 'bloated symbols', 'irregular box fill'],
      [
        'Soft-square icons for a dragon egg incubator: warm, turn, listen and hatch, gentle squircle bodies, one deep teal ink, equal boxes, oddly tender for dragons. No readable text or logo.',
        'Icons for a very anxious to-do app: add task, postpone, postpone again and panic, soft rounded squares with tense corners, navy ink, perfectly aligned. No readable text or logo.',
        "Icons for a grandmother's recipe box app: jar, spoon, oven and share, soft-square primitives, warm brown ink, calm spacing on cream. No readable text or logo.",
      ],
    ),
    I(
      'R-ICO-05',
      'Single-Bend Actions',
      'one-gesture action icon family',
      'single-bend',
      {
        aesthetic:
          'Single-Bend Actions: each action icon is one dominant path with a single expressive change of direction, plus a small anchor when needed.',
        subject_treatment:
          'Reduce each requested action to one dominant path with one expressive bend, keeping a small anchor where the meaning needs it.',
        color_and_tone:
          'High-contrast main stroke, with the anchor lighter in mass yet always present.',
        lighting_and_shadow: 'Flat line work so the path stays unmistakable at every size.',
        texture_and_material:
          'Continuous stroke with terminals that distinguish origin from destination.',
        camera_and_composition: 'The main bend placed at the functional center of each icon.',
        atmosphere_and_mood: 'Direct gesture and economy, clear, calm and unhurried.',
        rendering_and_quality: 'Every necessary part kept, even when the one-bend rule is tight.',
        key_features: 'one dominant path; single bend; small anchor; clear terminals',
      },
      [
        'amputated metaphors',
        'the same arrow for everything',
        'paths that look like accidental letters',
      ],
      [
        'Action icons for a starship helm: jump, drift, evade and return home, each one sweeping path with a single hard bend, white on deep black, bold and cinematic. No readable text or logo.',
        'Icons for a cat-herding app: gather, distract, bribe and give up, each a single path with one dramatic bend, one orange ink, equal boxes. No readable text or logo.',
        'Icons for a reading app used by night-shift nurses: next page, back, bookmark and dim, one gentle bend each, soft grey ink, quiet and legible. No readable text or logo.',
      ],
    ),
    I(
      'R-ICO-06',
      'Nested Cutout Symbols',
      'two-level cutout icon family',
      'nested-cutout',
      {
        aesthetic:
          'Nested Cutout Symbols: one main void inside each icon holds a second cutout large enough to clarify the function.',
        subject_treatment:
          "Give the prompt's subject or requested states a main void with one secondary cutout inside it only where it clarifies function, limiting nesting to two levels.",
        color_and_tone: 'Figure and ground clearly separated, each void a true opening.',
        lighting_and_shadow: 'Flat graphic shapes, with cavities read purely through outline.',
        texture_and_material:
          'Continuous masses, clean inner edges and enough space between the two cutouts.',
        camera_and_composition:
          'The largest opening reserved for the primary meaning, detail placed off-center.',
        atmosphere_and_mood: 'Functional discovery in two steps, clear and satisfying.',
        rendering_and_quality:
          'The secondary cutout stays open when reduced and never changes the silhouette.',
        key_features: 'main void; nested second cutout; two levels; clear function',
      },
      ['closed-up voids', 'decorative nesting', 'detail that overpowers the action'],
      [
        'A vault of cursed artifacts gets its own icon set: sealed, leaking, stolen and returned, each crate body holding one nested cutout that shows its state, black ink, ominous. No readable text or logo.',
        'A small icon family built for a lunchbox-sharing app for office workers: my lunch, your lunch, stolen lunch and revenge, box shapes with a nested cutout inside, one ink, petty. No readable text or logo.',
        'Inside the menu of a birdhouse builder: empty, nesting, eggs and flown, each house body with one inner cutout, soft green ink, simple and kind. No readable text or logo.',
      ],
    ),
    I(
      'R-ICO-07',
      'Offset Backbone Icons',
      'off-axis spine icon family',
      'offset-backbone',
      {
        aesthetic:
          'Offset Backbone Icons: an off-center spine inside each icon organizes asymmetric parts, balanced by internal counterweights.',
        subject_treatment:
          "Organize the prompt's subject or requested actions around a lateral offset spine, building internal counterweights instead of shifting the whole icon.",
        color_and_tone: 'One ink with hierarchy by mass and accents that respect the spine.',
        lighting_and_shadow: 'Flat shapes balanced through geometry and spacing alone.',
        texture_and_material: 'Clean strokes and masses with defined joins along the spine.',
        camera_and_composition:
          'The optical center of each box kept, even with an asymmetric internal build.',
        atmosphere_and_mood: 'Disciplined asymmetry with visible support and organized details.',
        rendering_and_quality:
          'Aligned neatly beside symmetric families without moving their boxes.',
        key_features: 'offset spine; internal counterweights; asymmetric parts; stable box',
      },
      ['icon merely shifted sideways', 'arbitrary spine', 'hanging details with no counterweight'],
      [
        "Picture the toolbar of a wizard's spellbook app. Index, curse, counter-curse and forbidden chapter, each built on an offset book spine, deep violet ink, balanced and arcane. No readable text or logo.",
        'A toolbox app for very clumsy plumbers gets its own icon set: wrench, plunger, bucket and flood, each on an offset handle spine, one ink, hopeful. No readable text or logo.',
        'A small icon family built for an allotment garden: rake, spade, shears and watering can, offset internal spines balancing each tool, earthy brown ink, one calm row. No readable text or logo.',
      ],
    ),
    I(
      'R-ICO-08',
      'Folded-Plane Pictograms',
      'two-plane shallow volume icon',
      'folded-plane',
      {
        aesthetic:
          'Folded-Plane Pictograms: two simplified planes describe volume with a shallow projection and no continuous shading.',
        subject_treatment:
          "Show the prompt's subject or requested objects with two broad planes meeting at one fold, in the same shallow projection for the whole set.",
        color_and_tone:
          'Two functional values split by an edge, with a one-ink version that still reads.',
        lighting_and_shadow: 'Light summarized as one fixed light plane and one dark plane.',
        texture_and_material: 'Flat planes, smooth and matte, with crisp folds.',
        camera_and_composition:
          'Shallow consistent projection across the set, with comparable widths.',
        atmosphere_and_mood: 'Sober tactility, enough volume to orient without showing off.',
        rendering_and_quality: 'The action stays legible when the secondary value is removed.',
        key_features: 'two planes; one fold; shallow projection; toolbar-ready volume',
      },
      ['mixed perspectives', 'heavy shading', 'product miniatures in a toolbar'],
      [
        'Folded-plane icons for an interdimensional moving company: box, portal, fragile and lost in another universe, two planes each, charcoal and grey, crisp. No readable text or logo.',
        'Inside the menu of a pizza delivery app with trust issues: box, open box, missing slice and suspicious crust, two-plane folds, one warm red and cream. No readable text or logo.',
        'Picture the toolbar of a paper archive in a flooded city. Sheet, folder, sealed box and dry shelf, simple two-plane forms, grey and white, calm. No readable text or logo.',
      ],
    ),
    I(
      'R-ICO-09',
      'Broad-Stroke Silhouettes',
      'heavy-weight icon family',
      'broad-stroke',
      {
        aesthetic:
          'Broad-Stroke Silhouettes: very heavy strokes resolved as designed masses, with inner corners opened to compensate for ink build-up.',
        subject_treatment:
          "Draw the prompt's subject or requested actions as bold heavy masses, hollowing inner corners by hand so the weight never clogs.",
        color_and_tone: 'One solid ink with wide interiors and maximum contrast between parts.',
        lighting_and_shadow: 'Flat solid shapes with crisp outer edges and nothing around them.',
        texture_and_material:
          'Soft or straight edges chosen by function, each corner shaped individually.',
        camera_and_composition:
          'Interior spaces proportional to the mass, dense symbols kept apart.',
        atmosphere_and_mood: 'Calm forcefulness, read instantly from across a room.',
        rendering_and_quality:
          'Build-up zones corrected one by one rather than thinning the whole stroke.',
        key_features: 'heavy masses; hollowed corners; wide interiors; instant read',
      },
      ['automatic bold', 'collapsed counters', 'masses of uneven weight'],
      [
        'Heavy icons for a gladiator arena scoreboard: fight, yield, crowd roar and mercy, massive black strokes with carved inner corners, brutal and readable. No readable text or logo.',
        'Bold icons for a remote control built for grandpa: on, louder, even louder and find remote, huge chunky shapes, one ink, completely unmissable. No readable text or logo.',
        "A stage manager's tablet gets its own icon set: spotlight, curtain, speaker and silence, broad solid silhouettes, deep navy ink, calm and certain. No readable text or logo.",
      ],
    ),
    I(
      'R-ICO-10',
      'Segmented Instrument Glyphs',
      'segment-display icon family',
      'segmented-glyph',
      {
        aesthetic:
          'Segmented Instrument Glyphs: icons built from a limited vocabulary of straight shared segments with constant joints, like discrete instrument displays.',
        subject_treatment:
          "Construct the prompt's subject or requested actions from a small set of straight segments with steady joints, building true metaphors rather than numbers.",
        color_and_tone:
          'One solid ink on a continuous ground, with unlit segments shown only when states are asked for.',
        lighting_and_shadow: 'Flat segments whose segmented character lives entirely in the form.',
        texture_and_material: 'Consistent segment ends and visible joints even at small sizes.',
        camera_and_composition:
          'Segments assigned by function rather than forced into one fixed matrix.',
        atmosphere_and_mood:
          'Discrete technical rhythm with regular pauses that never block meaning.',
        rendering_and_quality: 'Each segment maps to a real part of the symbol.',
        key_features: 'shared straight segments; steady joints; display vocabulary; true metaphors',
      },
      ['icons that look like digits', 'arbitrary segments', 'joints erased by glow'],
      [
        'Segmented icons for the dashboard of an old nuclear submarine: dive, surface, sonar and silent running, straight segments with visible joints, amber on black. No readable text or logo.',
        'Segmented icons for a microwave that thinks it is a spaceship: defrost, warp, popcorn and self-destruct, one orange ink, stiff and technical. No readable text or logo.',
        'A small icon family built for a metronome app for a small church choir: pulse, accent, bar and rest, short segments with steady joints, dark red ink on white. No readable text or logo.',
      ],
    ),
  ],
};

export default spec;
