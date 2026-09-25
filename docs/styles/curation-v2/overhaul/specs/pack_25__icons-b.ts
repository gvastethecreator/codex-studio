import type { Spec } from '../tools/apply';
import { design } from './_design';

// Interface icon systems (part B): R-ICO-11..17 styles, R-ICO-18 state profile, R-ICO-20 modifier-badge
// profile, and Isometric Wire Icons, a new style that replaces the R-ICO-19 verification recipe
// (see docs/styles/curation-v2/applied-design/QA-PROTOCOLS.md).
const I = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
  kind: 'style' | 'profile' = 'style',
) => design(name, domain, tag, 'icon', fields, avoid, briefs, { text: false, source, kind });

const spec: Spec = {
  pack: 'pack_25',
  category: '2. Interface Icon Systems',
  updates: {},
  creates: [
    I(
      'R-ICO-11',
      'Directional Notch Icons',
      'notch-coded relation icon family',
      'directional-notch',
      {
        aesthetic:
          'Directional Notch Icons: consistent notches cut into a stable silhouette encode relation, input or output instead of large arrows.',
        subject_treatment:
          "Give the prompt's subject or requested actions one stable body per object and one functional notch per relation, placed by a declared convention.",
        color_and_tone: 'One ink for body and notch, with any state color repeating the shape.',
        lighting_and_shadow: 'Flat shapes where every notch is a real geometric cut.',
        texture_and_material:
          'Defined edges and notches wide enough to read as intentional design.',
        camera_and_composition:
          'Input and output positioned by one convention applied to every member.',
        atmosphere_and_mood:
          'Contained direction and relational precision, quietly logical and calm.',
        rendering_and_quality: 'A notch never switches sides just to balance the symbol visually.',
        key_features: 'functional notches; stable bodies; declared convention; no big arrows',
      },
      ['inconsistent notches', 'cuts that look like damage', 'left and right reversed'],
      [
        'Notched icons for a dimensional customs office: arrive, depart, quarantine and deport to another reality, one document body with notches on declared sides, stern black ink. No readable text or logo.',
        'Inside the menu of a kitchen where every drawer argues: open, close, jammed and slammed, one drawer body with notches marking direction, one ink, slightly exasperated. No readable text or logo.',
        'Picture the toolbar of a small village library. Receive, lend and keep, one tray body with carefully placed notches, deep green ink, patient and tidy. No readable text or logo.',
      ],
    ),
    I(
      'R-ICO-12',
      'Balanced Two-Plane Icons',
      'two-region role icon family',
      'two-plane-role',
      {
        aesthetic:
          'Balanced Two-Plane Icons: every icon splits into a stable object plane and a smaller action plane, separated by shape and by a fixed tone role.',
        subject_treatment:
          "Split the prompt's subject or requested actions into one stable object region and one smaller action region, the same roles in every icon.",
        color_and_tone:
          'Two contrasting tones with fixed roles, plus a monochrome version separated by gaps.',
        lighting_and_shadow: 'Flat regions whose values encode function across the whole set.',
        texture_and_material: 'Smooth flat planes with a clear border and stable openings.',
        camera_and_composition:
          'The action plane smaller than the object and clear of its main trait.',
        atmosphere_and_mood: 'Functional order and layered reading, calm and systematic.',
        rendering_and_quality: 'Every icon assigns the two tones to exactly the same roles.',
        key_features: 'object plane; action plane; fixed tone roles; monochrome check',
      },
      ['recolor with no structure', 'swapped tone roles', 'action hidden behind the object'],
      [
        "Two-plane icons for a necromancer's spell manager: raise, bind, release and lay to rest, dark bone body with a paler action plane, eerie and orderly. No readable text or logo.",
        'A laundry app for people who lose socks gets its own icon set: wash, dry, fold and mourn missing sock, object and action planes in navy and sky blue. No readable text or logo.',
        'A small icon family built for a greenhouse panel: water, shade, warm and record, plant body in deep green with a lighter action plane, calm and consistent. No readable text or logo.',
      ],
    ),
    I(
      'R-ICO-13',
      'Ribbon-Corner Symbols',
      'folding band icon family',
      'ribbon-corner',
      {
        aesthetic:
          'Ribbon-Corner Symbols: one flat ribbon path per icon changes direction through large deliberate corners and stable voids.',
        subject_treatment:
          "Fold the prompt's subject or requested relations into one wide ribbon path per icon with readable corners, few crossings and visible ends.",
        color_and_tone: 'One ink or two orientation values, flat and matte.',
        lighting_and_shadow: 'Graphic folds explained by clean occlusion alone, with flat faces.',
        texture_and_material: 'Flat ribbon of consistent thickness with clear terminals.',
        camera_and_composition: 'Compact paths that never fill the whole box or force a loop.',
        atmosphere_and_mood: 'Agile continuity carried by one precise angular gesture per icon.',
        rendering_and_quality: 'Every corner keeps its apparent width when reduced.',
        key_features: 'folded ribbon paths; big corners; visible ends; compact routes',
      },
      ['tiny folds', 'decorative ribbon unrelated to the action', 'hidden terminals'],
      [
        'Ribbon icons for a heist-planning app: enter, detour, crack vault and escape, each one flat band folding through bold corners, black ink, tense and precise. No readable text or logo.',
        'Inside the menu of a conga-line organizing app: start, join, turn and chaos, one ribbon each with dramatic corners, bright magenta ink, gleeful. No readable text or logo.',
        'Picture the toolbar of a bookbinding studio. Fold, separate, bind and unfold, compact ribbon paths in two soft greys, quiet and exact. No readable text or logo.',
      ],
    ),
    I(
      'R-ICO-14',
      'Carved Pixel Glyphs',
      'quantized pixel icon family',
      'carved-pixel',
      {
        aesthetic:
          'Carved Pixel Glyphs: icons built from whole pixel clusters and quantized voids on a fixed logical grid, with stepped rhythm and clean silhouettes.',
        subject_treatment:
          "Build the prompt's subject or requested actions from whole pixel clusters on a fixed logical grid such as 16, 20 or 24 pixels, with quantized gaps.",
        color_and_tone: 'Two or three exact palette values with hard edges between them.',
        lighting_and_shadow: 'Hard pixels only, with optional volume shown as discrete bands.',
        texture_and_material:
          'Whole pixels in deliberate clusters, every one of them placed on purpose.',
        camera_and_composition: 'Aligned to the logical grid, silhouettes balanced by clusters.',
        atmosphere_and_mood: 'Digital economy with a stepped rhythm, crisp and modern.',
        rendering_and_quality:
          'Shown at native size and at a whole-number enlargement with sharp edges.',
        key_features: 'whole pixel clusters; fixed logical grid; exact palette; stepped rhythm',
      },
      ['pixelated version of a smooth icon', 'orphan pixels', 'non-integer scaling'],
      [
        'Pixel glyphs at 16 by 16 for a dungeon crawler inventory: cursed key, torch, potion and trapdoor, three exact colors, crisp clusters shown native and enlarged. No readable text or logo.',
        'Pixel icons at 24 by 24 for a toaster operating system: toast, burn, eject and existential crisis, two values, carefully carved, oddly heroic. No readable text or logo.',
        'Pixel icons at 20 by 20 for a lighthouse logbook: lamp, fog, boat and sleep, two soft values, clean silhouettes on a quiet grid. No readable text or logo.',
      ],
    ),
    I(
      'R-ICO-15',
      'Sparse Topology Icons',
      'node-and-link relation icon',
      'sparse-topology',
      {
        aesthetic:
          'Sparse Topology Icons: a minimal set of nodes and links shows real relations with consistent linking patterns.',
        subject_treatment:
          "Show the prompt's subject or requested relations only with the nodes and links that truly exist, each node type holding one clear role.",
        color_and_tone: 'One ink, with node roles told apart by shape or size.',
        lighting_and_shadow:
          'Flat crisp connections joined to compact solid nodes of equal weight.',
        texture_and_material: 'Clean lines, compact nodes and joins with deliberate spacing.',
        camera_and_composition: 'Topology and traceable routes placed before decorative symmetry.',
        atmosphere_and_mood:
          'Connection clarity with small, deliberate tensions of distance between nodes.',
        rendering_and_quality:
          'The exact number of nodes and links kept, with no ambiguous crossings.',
        key_features: 'minimal nodes; true links; role shapes; traceable routes',
      },
      ['decorative network', 'invented edges', 'crossings that read as nodes'],
      [
        'Topology icons for a spy network app: handler, courier, double agent and burned asset, each a tiny exact graph of nodes and links, black ink, cold and precise. No readable text or logo.',
        'A family group chat manager gets its own icon set: parents, siblings, the cousin nobody invited and mute everyone, sparse node graphs, one ink, painfully accurate. No readable text or logo.',
        'A small icon family built for a mycelium research lab: single root, shared root, split and reconnect, sparse nodes and links, earthy brown ink on cream. No readable text or logo.',
      ],
    ),
    I(
      'R-ICO-16',
      'Contour-and-Anchor Icons',
      'outline with solid anchor icon',
      'contour-anchor',
      {
        aesthetic:
          'Contour-and-Anchor Icons: a light outline carries each object while one small solid mass marks the decisive functional part.',
        subject_treatment:
          "Describe the prompt's subject or requested actions with a light contour and reserve one solid anchor mass for the part being acted on.",
        color_and_tone: 'One shared ink, contrast between line and mass coming from coverage.',
        lighting_and_shadow: 'Flat graphic rendering, the anchor distinguished only by solid fill.',
        texture_and_material: 'Continuous even line with a crisp-edged solid anchor.',
        camera_and_composition:
          'The anchor sits at the functional point, the contour balancing the box.',
        atmosphere_and_mood: 'Directed attention with lightness around the point of decision.',
        rendering_and_quality:
          'The anchor stays small but visible and keeps the same role in every icon.',
        key_features: 'light contour; solid anchor; functional point; directed attention',
      },
      ['ornamental anchor', 'mass that hides the object', 'solid dots in arbitrary places'],
      [
        'Contour icons for a bomb-disposal training app: cut wire, freeze timer, lift lid and walk away slowly, one solid anchor on the decisive part, black ink, very tense. No readable text or logo.',
        'Inside the menu of a karaoke app: grab mic, hit high note, forget lyrics and bow, light outlines with one solid anchor each, one pink ink, dramatic. No readable text or logo.',
        'Picture the toolbar of a photo darkroom app. Focus, crop corner, pin reference and dry, thin outlines with one small solid anchor, warm grey ink. No readable text or logo.',
      ],
    ),
    I(
      'R-ICO-17',
      'Square-Counter Pictograms',
      'square counter round shell icon',
      'square-counter',
      {
        aesthetic:
          'Square-Counter Pictograms: curved outer shells hold square inner counters, creating an internal contrast between soft outside and precise inside.',
        subject_treatment:
          "Draw the prompt's subject or requested objects with curved exteriors and square counters where a hole already exists, balancing weight between the two vocabularies.",
        color_and_tone: 'One solid ink with counters open to the background.',
        lighting_and_shadow: 'Flat shapes, the contrast living between curves and right angles.',
        texture_and_material: 'Tense outer curves and clean inner corners that stay sharp.',
        camera_and_composition:
          'Counters centered by optical reading, applied only where a hole exists.',
        atmosphere_and_mood: 'Friendly outside with precise inside, one coherent voice.',
        rendering_and_quality:
          'Square counters keep their corners when reduced without thinning the walls.',
        key_features: 'curved shells; square counters; soft-precise contrast; one ink',
      },
      ['forced holes', 'walls too thin', 'squares that change the metaphor'],
      [
        'Pictograms for a time-travel agency: clock, portal, suitcase and paradox, rounded shells with square inner counters, deep indigo ink, curious and exact. No readable text or logo.',
        'A bakery that only sells square donuts gets its own icon set: donut, box, oven and complaint, round outsides with square holes, one warm brown ink, proudly strange. No readable text or logo.',
        'A small icon family built for a basement recording studio: booth, headphones, tape and quiet room, curved exteriors with square counters, charcoal ink, calm spacing. No readable text or logo.',
      ],
    ),
    I(
      'R-ICO-19-NEW',
      'Isometric Wire Icons',
      'isometric line icon family',
      'isometric-wire',
      {
        aesthetic:
          'Isometric Wire Icons: thin line icons drawn in one strict isometric projection, so every object reads as a small precise volume made of wire.',
        subject_treatment:
          "Draw the prompt's subject or requested objects as thin line icons in one shared isometric projection, all edges on the same three axes.",
        color_and_tone:
          'One ink line on a plain ground, with an optional single accent on the active face.',
        lighting_and_shadow: 'Line-only volumes, depth coming from the projection alone.',
        texture_and_material: 'Uniform thin wire lines with neat corners where three edges meet.',
        camera_and_composition:
          'Same isometric angle and scale for every icon, aligned on a shared grid.',
        atmosphere_and_mood: 'Technical, tidy and quietly dimensional, like a tiny blueprint.',
        rendering_and_quality:
          'Clean vector wireframes with no hidden-line mistakes or broken axes.',
        key_features: 'strict isometric axes; thin wire lines; shared grid; tiny volumes',
      },
      ['mixed projections', 'hidden lines drawn through solids', 'perspective distortion'],
      [
        'Isometric wire icons for a fortress-building strategy game: wall, tower, gate and siege engine, thin lines on one strict projection, pale cyan on black. No readable text or logo.',
        'Isometric wire icons for a furniture store where everything is slightly haunted: chair, wardrobe, mirror and rocking cradle, one ink, suspiciously tidy. No readable text or logo.',
        'Isometric wire icons for a small post office: parcel, letter, scale and stamp drawer, thin even lines, warm grey ink, aligned on one grid. No readable text or logo.',
      ],
    ),
    I(
      'R-ICO-18',
      'State-Pair Icon Grammar',
      'icon state sheet profile',
      'state-pair',
      {
        aesthetic:
          'State-Pair Icon Grammar: one icon shown in its normal, active and disabled states, with controlled structural changes between them.',
        subject_treatment:
          "Show the prompt's subject icon in normal, active and disabled states, changing only the documented structure while the rest stays identical.",
        color_and_tone: 'State colors always repeated by shape, fill or an explicit indicator.',
        lighting_and_shadow: 'Flat presentation where selection comes from structure alone.',
        texture_and_material: 'Identical edges across states apart from the one documented change.',
        camera_and_composition: 'States in comparable rows with stable anchors and equal fill.',
        atmosphere_and_mood: 'Continuity and predictability, each change recognized at once.',
        rendering_and_quality: 'All states keep the same meaning, and disabled stays legible.',
        key_features: 'three states; structural change; stable anchors; comparable rows',
      },
      [
        'three different icons for three states',
        'illegible disabled state',
        'active shown only by color',
      ],
      [
        'A state sheet for the "summon" button of a monster-taming game: idle outline, active filled with a spark notch and disabled with a broken seal, three rows, one ink. No readable text or logo.',
        'A state sheet for the "snooze" icon of an alarm clock that has given up: normal bell, active bell with closed eyes and disabled bell lying down, one ink, weary. No readable text or logo.',
        'A state sheet for a garden watering icon: ready can, pouring can and disabled can with a dry mark, three comparable rows, soft green ink. No readable text or logo.',
      ],
      'profile',
    ),
    I(
      'R-ICO-20',
      'Semantic Modifier Set',
      'icon badge modifier sheet',
      'semantic-modifier',
      {
        aesthetic:
          'Semantic Modifier Set: small status indicators added to base icons with one fixed position and meaning across the whole family.',
        subject_treatment:
          "Add requested status indicators to the prompt's base icons at one fixed position, each indicator distinct by shape while the base metaphor stays clear.",
        color_and_tone: 'States distinguished by shape first, with color as a repeat.',
        lighting_and_shadow: 'Flat indicators that stay secondary to the object.',
        texture_and_material:
          'The same edge grammar for icon and indicator, with a clear cut between them.',
        camera_and_composition:
          'A matrix of bases by indicators, badge position fixed in every cell.',
        atmosphere_and_mood: 'Discreet extra information with priority on the original object.',
        rendering_and_quality:
          'Each indicator keeps its meaning on bases with very different silhouettes.',
        key_features: 'fixed badge position; shape-coded states; base matrix; secondary indicators',
      },
      ['giant badges', 'invented states', 'random badge positions'],
      [
        "A modifier matrix for a haunted castle's room icons: bedroom, library and dungeon, each marked haunted, cleansed or unknown by a small corner badge, three by three, black ink. No readable text or logo.",
        'A modifier matrix for a shared office fridge: yogurt, sandwich and cake, each marked mine, yours or stolen with fixed corner badges, one ink, passive-aggressive. No readable text or logo.',
        'A modifier matrix for a seed library: packet, jar and pot, each marked new, sown or saved with one small badge in the same corner, soft green ink. No readable text or logo.',
      ],
      'profile',
    ),
  ],
};

export default spec;
