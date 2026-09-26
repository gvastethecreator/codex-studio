import type { Spec } from '../tools/apply';
import { design } from './_design';

// Motion styleframes & broadcast (part B): R-MOT-11..16 styles, R-MOT-17/18 layout profiles, R-MOT-19 keyframe
// continuity sheet profile, and Cutout Stop-Motion Frames, a new style replacing the R-MOT-20 reduced-motion
// check (see QA-PROTOCOLS.md).
const M = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
  kind: 'style' | 'profile' = 'style',
) => design(name, domain, tag, 'motion', fields, avoid, briefs, { text: true, source, kind });

const VIDEO = 'claims of finished rendered video';

const spec: Spec = {
  pack: 'pack_25',
  category: '16. Motion Styleframes & Broadcast',
  updates: {},
  creates: [
    M(
      'R-MOT-11',
      'Contour-to-Volume Transitions',
      'outline to volume styleframes',
      'contour-volume',
      {
        aesthetic:
          'Contour-to-Volume Transitions: styleframes where an outline becomes flat planes and then a solid volume, key points kept at every stage.',
        subject_treatment:
          "Show the prompt's shape in keyframes going from outline to flat planes to volume, keeping its key points and any words exact.",
        color_and_tone: 'Color by face or function with the original outline contrast kept.',
        lighting_and_shadow:
          'Light arriving coherently as volume appears, direction stable throughout.',
        texture_and_material: 'Line becoming surface with controlled thickness and one material.',
        camera_and_composition: 'A constant camera and axis during the conversion.',
        atmosphere_and_mood:
          'Progressive construction with a pause on the flat stage and a solid settle.',
        rendering_and_quality: 'Crisp keyframes where the final state is clearly the same shape.',
        key_features: 'outline to planes to volume; kept key points; fixed camera; three stages',
      },
      ['different objects per frame', 'camera hiding discontinuity', VIDEO],
      [
        'A starship emblem for a sci-fi channel growing from a thin outline to flat plates to a gleaming solid badge, four key points marked, deep space behind it, shown across three keyframes.',
        'A hand-drawn doodle of a chair becoming a flat cutout and then a real 3D chair that someone immediately sits on, shown across three keyframes.',
        'Outline, plane and shallow solid: a simple geometric window for an architecture podcast grows into volume while its center hole stays exactly the same.',
      ],
    ),
    M(
      'R-MOT-12',
      'Soft Collision Graphics',
      'soft contact bump styleframes',
      'soft-collision',
      {
        aesthetic:
          'Soft Collision Graphics: styleframes of shapes bumping into each other with soft local squash and a coordinated recovery.',
        subject_treatment:
          "Show the prompt's shapes in keyframes of approach, soft contact and settle, deformation only near the contact and every word left untouched.",
        color_and_tone: 'A stable palette per object with no new categories at contact.',
        lighting_and_shadow: 'Coherent light and discreet contact shadows without sparks.',
        texture_and_material: 'Softly squashing surfaces that keep their apparent volume.',
        camera_and_composition: 'Readable paths with text kept outside the collision zone.',
        atmosphere_and_mood: 'Approach, bump and cushioned recovery, with mass differences shown.',
        rendering_and_quality: 'Crisp keyframes with no overlaps and a clean final rest.',
        key_features: 'soft bump; local squash; mass difference; clean rest',
      },
      ['validated physics claims', 'objects merging', VIDEO],
      [
        'Two giant planets gently bumping in space and settling side by side to frame the title "TWIN WORLDS", soft squash at the contact, shown across three keyframes.',
        'A very large jelly block bumping a tiny marble and wobbling far more than necessary, the word "OOPS" calmly nearby, shown across three keyframes.',
        "Two soft blocks labeled A and B bump gently and settle on either side of a word for a children's museum, labels kept in every frame.",
      ],
    ),
    M(
      'R-MOT-13',
      'Archive Scan Sequences',
      'scanning window reading styleframes',
      'archive-scan',
      {
        aesthetic:
          'Archive Scan Sequences: styleframes of a reading window moving across supplied content, pausing and zooming on a detail.',
        subject_treatment:
          "Show a reading window moving across the prompt's content in keyframes, pausing on a region and repeating its exact text in a detail.",
        color_and_tone: 'A sober archive palette with one accent for the selection.',
        lighting_and_shadow: 'Contained optical light with the main text kept in contrast.',
        texture_and_material: 'A discreet support texture with crisp records and nothing invented.',
        camera_and_composition:
          'A stable overview, a moving window and a detail tied to the selection.',
        atmosphere_and_mood: 'Exploration, stop and reading, paced by the content itself.',
        rendering_and_quality: 'Crisp keyframes with exact texts and a recognizable selection.',
        key_features: 'moving reading window; pause and detail; exact text; archive palette',
      },
      ['fake surveillance data', 'invented documents', VIDEO],
      [
        'A scanning lens moving across an ancient star chart in a planetarium intro, stopping on the constellation labeled "THE LOST SHIP" and enlarging it, shown across three keyframes.',
        'A scanning window moving over a very long grocery list and stopping in disbelief on "CHOCOLATE (X12)", shown across three keyframes.',
        "A reading window glides from index card A to card B in a quiet archive and repeats that card's exact title in an enlarged detail.",
      ],
    ),
    M(
      'R-MOT-14',
      'Interlocking Panel Choreography',
      'sliding interlocking panel styleframes',
      'panel-choreography',
      {
        aesthetic:
          "Interlocking Panel Choreography: styleframes where panels give way and slide into each other's space without ever covering text.",
        subject_treatment:
          "Show the prompt's panels in keyframes where one yields space and another slides into it, edges and contents kept and every word exact.",
        color_and_tone: 'Constant color per panel or function across the move.',
        lighting_and_shadow: 'Flat or shallow common depth with no shadow over text.',
        texture_and_material: 'Clean edges, shared radii and panels carried as locked layers.',
        camera_and_composition:
          'Declared entry and exit zones and a stable reading area at arrival.',
        atmosphere_and_mood: 'A choreography of giving and taking space, polite and precise.',
        rendering_and_quality: 'Crisp keyframes with complete text and one focus at a time.',
        key_features: 'yielding panels; interlocking slides; locked contents; one focus',
      },
      ['collage of windows with no relation', 'cut-off text', VIDEO],
      [
        'A news intro for a fictional kingdom where the map panel slides aside and the panel "ROYAL DECREE" locks into its space, gold and navy, shown across three keyframes.',
        'Keyframes where the panel "WORK" slides away to make room for "NAP", which clearly takes up more space than it should.',
        'In a library catalog screen, one panel politely yields a third of its width so a detail panel can slide into the space, text never covered.',
      ],
    ),
    M(
      'R-MOT-15',
      'Material Memory Transitions',
      'afterimage material change styleframes',
      'material-memory',
      {
        aesthetic:
          'Material Memory Transitions: styleframes where a shape changes material while a faint imprint of its previous state lingers and fades.',
        subject_treatment:
          "Show the prompt's shape changing material in keyframes, a faint imprint of its previous state lingering briefly and fading, words kept exact.",
        color_and_tone:
          'A related palette between imprint and current form, the imprint lower in contrast.',
        lighting_and_shadow: 'Light matching the current state, the imprint left unlit.',
        texture_and_material: 'Changing materials with a trace that follows the previous outline.',
        camera_and_composition:
          'Focus on the persistent shape with the trace aligned to its last position.',
        atmosphere_and_mood: 'Transformation, brief memory and a clean fade, almost poetic.',
        rendering_and_quality: 'Crisp keyframes with a matching trace and no leftover ghosts.',
        key_features: 'material change; fading imprint; aligned trace; clean end',
      },
      ['generic smear', 'multiple ghost objects', VIDEO],
      [
        'An ice crown melting into a crown of flowing water, a faint frosty outline of the ice crown lingering and fading, title "THE THAW", shown across three keyframes.',
        'A sandcastle turning into a real castle, leaving a faint sandy ghost that looks slightly jealous, shown across three keyframes.',
        'An ink-drawn frame turns translucent for a stationery shop ident, leaving one faint imprint of its ink state that fades before the last frame.',
      ],
    ),
    M(
      'R-MOT-16',
      'Type-Driven Camera Motion',
      'typography-guided camera styleframes',
      'type-camera',
      {
        aesthetic:
          'Type-Driven Camera Motion: styleframes where the apparent camera travels along baselines, columns and counters of the text without losing orientation.',
        subject_treatment:
          "Show a camera move along the prompt's text in keyframes, following baselines or counters with anchors kept and every word exact.",
        color_and_tone: 'A constant content and background palette across framings.',
        lighting_and_shadow: 'Flat editorial space or simple type space with stable light.',
        texture_and_material: 'Sharp text at every scale with no invented detail up close.',
        camera_and_composition:
          'Typographic anchor points and moderate paths ending in full context.',
        atmosphere_and_mood: 'A journey guided by reading, with a brief acceleration and a pause.',
        rendering_and_quality: 'Crisp keyframes with exact copy and persistent anchors.',
        key_features: 'camera along type; baseline paths; kept anchors; readable arrival',
      },
      ['erratic camera', 'letters used as unreadable tunnels', VIDEO],
      [
        'A camera gliding along the baseline of the huge word "HORIZON" for a travel documentary opener, like flying over a desert ridge, arriving on the full word, shown across three keyframes.',
        'A camera diving into the counter of the letter O in "BOREDOM" and finding nothing inside, then pulling back out, shown across three keyframes.',
        'Following the baseline of the words "OPEN ARCHIVE", the camera drifts into the gap between them and back out to the full title, calm and steady.',
      ],
    ),
    M(
      'R-MOT-20-NEW',
      'Cutout Stop-Motion Frames',
      'paper cutout stop-motion styleframes',
      'cutout-stopmotion',
      {
        aesthetic:
          'Cutout Stop-Motion Frames: styleframes built from real paper cutouts on a table, moved frame by frame with visible handmade charm.',
        subject_treatment:
          "Show the prompt's subject and words as paper cutouts on a tabletop in keyframes, each piece moved slightly per frame, every word exact.",
        color_and_tone: 'Colored craft paper, cardboard browns and a soft painted backdrop.',
        lighting_and_shadow: 'Soft top light with small real shadows under each lifted cutout.',
        texture_and_material:
          'Paper fibre, cut edges, a little glue shine and hand-cut imperfections.',
        camera_and_composition:
          'Locked overhead or frontal camera with pieces moving across frames.',
        atmosphere_and_mood: 'Handmade, playful and warm, a craft studio at night.',
        rendering_and_quality:
          'Crisp photographic frames with tactile paper detail and real cut edges.',
        key_features: 'paper cutouts; frame-by-frame moves; small shadows; locked camera',
      },
      ['digital-looking flat vectors', 'misspelled cut letters', VIDEO],
      [
        'Three stop-motion frames of a paper whale swimming across a cardboard sea toward the cut-paper title "THE DEEP", tiny shadows under every wave.',
        'Stop-motion frames of paper letters spelling "MONDAY" slowly falling over one by one on a desk, cut edges and glue shine.',
        'Three calm stop-motion frames of a paper sun rising slowly behind the cut-out word "MORNING" on a kitchen table, soft shadows under every piece.',
      ],
    ),
    M(
      'R-MOT-17',
      'Broadcast Safe-Area Layout',
      'broadcast title layout profile',
      'safe-area',
      {
        aesthetic:
          'Broadcast Safe-Area Layout: a broadcast frame with title, brand and data kept inside declared safe regions, shown with and without guides.',
        subject_treatment:
          "Lay out the prompt's broadcast graphic with title, brand and data inside declared safe regions, shown with guides and clean, every word exact.",
        color_and_tone: 'Constant identity colors, the guides clearly separate from the graphic.',
        lighting_and_shadow: "The piece's own treatment with no imposed lighting.",
        texture_and_material: 'Content and guide layers kept apart with crisp text.',
        camera_and_composition: 'Parameterized margins with essential content inside its region.',
        atmosphere_and_mood: 'Stable, calm reading of title and data during every key state.',
        rendering_and_quality: 'Clean frame with complete text and non-normative guides labeled.',
        key_features: 'safe regions; with and without guides; title and data; exact text',
      },
      ['percentages shown as a universal norm', 'guides printed by accident', VIDEO],
      [
        'A broadcast title card for the fictional show "DRAGON WEATHER TONIGHT" with the title, channel mark and data inside safe regions, one version with guides and one clean.',
        'A lower third reading "EXPERT IN EVERYTHING" for a very confident guest, safe regions respected, guides shown separately.',
        'A calm 1920 by 1080 test plate with the title "WORKSHOP", index 01 and data A, B and C inside the guides.',
      ],
      'profile',
    ),
    M(
      'R-MOT-18',
      'Multi-Screen Rhythm Layout',
      'multi-screen display layout profile',
      'multi-screen',
      {
        aesthetic:
          'Multi-Screen Rhythm Layout: one composition spread across several screens of declared sizes, each with a complete message.',
        subject_treatment:
          "Spread the prompt's composition across screens of declared sizes and gaps, the essential text complete on at least one screen and exact.",
        color_and_tone: 'A shared palette with contrast adapted to each screen.',
        lighting_and_shadow: 'Each screen with its own flat render and no fake calibration.',
        texture_and_material: 'Sharp digital content with bezels and gaps shown as dead space.',
        camera_and_composition: 'Global and local coordinates declared and dead zones excluded.',
        atmosphere_and_mood: 'A coordinated rhythm across surfaces with shared pauses.',
        rendering_and_quality: 'Clean overall view plus separate crops per screen.',
        key_features: 'several screens; declared gaps; complete message; global view',
      },
      ['promised hardware sync', 'invented screens', VIDEO],
      [
        'The launch display for a fictional space elevator across three giant screens, the title "ASCEND" complete on the center screen and the elevator rising across all three.',
        'A three-screen layout for a hot dog stand where the hot dog is simply too long for one screen and continues across all three, "FOOTLONG" complete on the middle one.',
        'A calm three-screen composition with the title "FORMS" whole on the center screen and modules on the sides.',
      ],
      'profile',
    ),
    M(
      'R-MOT-19',
      'Three-Keyframe Continuity Test',
      'three keyframe continuity sheet profile',
      'three-keyframe',
      {
        aesthetic:
          'Three-Keyframe Continuity Test: a sheet of start, peak and arrival keyframes of the same set, with piece ids and correspondences marked.',
        subject_treatment:
          "Show the prompt's animation as start, peak and arrival keyframes with the same pieces, geometry and exact words, correspondences labeled outside the art.",
        color_and_tone: 'Fixed palette and roles, any change noted as an explicit transition.',
        lighting_and_shadow: 'Locked light and camera unless a move is declared.',
        texture_and_material: 'Consistent material and detail with no new pieces.',
        camera_and_composition: 'Three frames in a row sharing scale references and anchors.',
        atmosphere_and_mood: 'A continuity test focused on what changes and what stays.',
        rendering_and_quality:
          'Clean comparison sheet with a complete correspondence table beside it.',
        key_features: 'start, peak, arrival; piece ids; locked camera; correspondence notes',
      },
      ['three unrelated images', 'claimed finished video', VIDEO],
      [
        'A keyframe sheet for a phoenix emblem rising: folded wings, full flame and settled crest, the same four pieces labeled in every frame.',
        'A keyframe sheet of a folder icon opening, lid and body as separate pieces, and a very surprised paperclip that must be in every frame.',
        'A calm keyframe sheet of two masses and one counter moving from start to arrival, ids A and B marked.',
      ],
      'profile',
    ),
  ],
};

export default spec;
