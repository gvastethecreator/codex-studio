import type { Spec } from '../tools/apply';
import { design } from './_design';

// Motion styleframes & broadcast (part A): R-MOT-01..10. Styleframes are still keyframes, not rendered video;
// requested words stay exact in every frame.
const M = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
) => design(name, domain, tag, 'motion', fields, avoid, briefs, { text: true, source });

const VIDEO = 'claims of finished rendered video';

const spec: Spec = {
  pack: 'pack_25',
  category: '16. Motion Styleframes & Broadcast',
  newCategory: { id: 'motion-styleframes-and-broadcast' },
  updates: {},
  creates: [
    M(
      'R-MOT-01',
      'Elastic Assembly Motion',
      'elastic separate-and-rejoin styleframes',
      'elastic-assembly',
      {
        aesthetic:
          'Elastic Assembly Motion: styleframes where pieces pull apart and snap back together with one shared elastic overshoot, always staying the same pieces.',
        subject_treatment:
          "Show the prompt's subject as keyframes of pieces separating and snapping back with shared elastic tension, the same piece count and exact words throughout.",
        color_and_tone: 'A stable palette per piece with no new colors faking transformation.',
        lighting_and_shadow: 'Consistent light or shading across every keyframe of the sequence.',
        texture_and_material:
          'Material secondary to the stretch, with volume recovered on settling.',
        camera_and_composition:
          'A stable main center of mass with room for expansion and protected text.',
        atmosphere_and_mood:
          'A short impulse, coordinated expansion and a damped, satisfying settle.',
        rendering_and_quality:
          'Crisp start and end frames with countable pieces and clear correspondences.',
        key_features: 'elastic overshoot; same pieces; damped settle; keyframe strip',
      },
      ['independent bounces', 'morph erasing identity', VIDEO],
      [
        'Three styleframes of a dragon crest for a fantasy streaming channel exploding into five pieces and snapping back into a roaring emblem, piece count identical, deep red and gold.',
        'Keyframes of a sandwich logo for a food channel flying apart into bread, cheese and tomato and snapping back slightly wrong, then right, with the word "LUNCH" exact.',
        'A quiet publication ident for a small design magazine called "FORMS", open frames stretching out and settling back around the title across three frames.',
      ],
    ),
    M(
      'R-MOT-02',
      'Phase-Offset Typography',
      'staggered letter animation styleframes',
      'phase-offset',
      {
        aesthetic:
          'Phase-Offset Typography: styleframes where one transformation ripples through the letters with steady delays, the word keeping its order and reading.',
        subject_treatment:
          'Show the requested words in keyframes where one transformation travels letter by letter with a steady delay, every character exact in every frame.',
        color_and_tone: 'Constant colors by function with reading contrast kept at each stage.',
        lighting_and_shadow: 'Flat typography, any volume lit the same in every frame.',
        texture_and_material: 'Clean edges and persistent letters with motion carrying the effect.',
        camera_and_composition: 'Aligned start and end frames with propagation in reading order.',
        atmosphere_and_mood:
          'An activation wave with regular delays and a long enough final pause.',
        rendering_and_quality: 'Crisp keyframes where the word never turns into different letters.',
        key_features: 'letter-by-letter wave; steady delay; exact word; final pause',
      },
      ['dropped letters', 'random phases', VIDEO],
      [
        'Keyframes of the title "THE STORM IS COMING" for a weather channel, each letter lifting in turn like a wave rolling across the sea, same word every frame.',
        'Keyframes of the word "HICCUP" where each letter jumps up one after another with a comic delay, one letter clearly late.',
        'The single word "PAUSE" for a meditation app, its letters rising and settling back on the baseline one after another with a constant, gentle delay.',
      ],
    ),
    M(
      'R-MOT-03',
      'Inertial Ribbon Transitions',
      'ribbon-carried transition styleframes',
      'inertial-ribbon',
      {
        aesthetic:
          'Inertial Ribbon Transitions: styleframes where one connected ribbon drags the first scene away and brings in the next with believable inertia.',
        subject_treatment:
          "Show the prompt's transition as keyframes of one flat ribbon carrying the first content out and the next in, ends traceable and words exact.",
        color_and_tone: 'Ribbon color tied to the identity on compatible backgrounds.',
        lighting_and_shadow: 'Consistent light across the ribbon folds with every edge visible.',
        texture_and_material: 'A ribbon of controlled width with limited twist.',
        camera_and_composition:
          'Declared entry, turn and exit, content revealed by the ribbon itself.',
        atmosphere_and_mood:
          'Drag, delay and inertia with one dominant direction and reading pauses.',
        rendering_and_quality:
          'Crisp keyframes with a continuous ribbon outline and traceable ends.',
        key_features: 'carrying ribbon; inertia; traceable ends; one direction',
      },
      ['decorative ribbon with no role', 'text hidden too long', VIDEO],
      [
        'A transition from "DAY" to "NIGHT" for a travel channel, a golden ribbon sweeping the sun away and pulling a starry sky in behind it, three keyframes.',
        'Keyframes where a long red ribbon drags a very reluctant "MONDAY" off screen and pulls "FRIDAY" in triumphantly.',
        'A flat band carrying the word "IMAGE" out of frame and bringing "SOUND" in for a small radio station, its ends A and B clearly marked.',
      ],
    ),
    M(
      'R-MOT-04',
      'Pressure-Release Letterforms',
      'squeeze and release type styleframes',
      'pressure-release',
      {
        aesthetic:
          'Pressure-Release Letterforms: styleframes where letters squeeze under pressure and spring back, stems and counters changing together.',
        subject_treatment:
          'Show the requested word in keyframes of rest, controlled squeeze and release, counters protected and every character exact.',
        color_and_tone: 'Stable type palette on a contrasting ground with one optional accent.',
        lighting_and_shadow: 'Flat treatment where pressure reads through shape and space.',
        texture_and_material:
          'Continuous contours with the minimum stem thickness always preserved.',
        camera_and_composition: 'A declared pressure zone with recovery margins around the word.',
        atmosphere_and_mood: 'Building tension, a brief hold and a damped, readable release.',
        rendering_and_quality: 'Crisp keyframes with recognizable letters and accents anchored.',
        key_features: 'squeeze and release; protected counters; three states; exact word',
      },
      ['promised working variable font', 'swapped letters', VIDEO],
      [
        'Keyframes of the word "TITAN" crushed from both sides by stone walls in a fantasy trailer and bursting back to full width, black on bone.',
        'Keyframes of the word "SQUEEZE" pressed by a giant cartoon hand like toothpaste, then springing back proudly.',
        'For a yoga studio ident, the word "BREATHE" gathers tension in its letter spacing, holds for a beat and releases into a calm final reading frame.',
      ],
    ),
    M(
      'R-MOT-05',
      'Optical Register Drift',
      'misregistered layer drift styleframes',
      'register-drift',
      {
        aesthetic:
          'Optical Register Drift: styleframes where ink layers slip slightly out of register and drift back into perfect alignment.',
        subject_treatment:
          "Show the prompt's artwork as keyframes where its color layers slip slightly apart and realign, the words always readable on one layer.",
        color_and_tone: 'Two or three inks related to the artwork.',
        lighting_and_shadow: 'Flat optical rendering with no flashes or flicker.',
        texture_and_material: 'Controlled print edges and small offsets relative to letter size.',
        camera_and_composition: 'A stable reading focus with smaller offsets on secondary areas.',
        atmosphere_and_mood: 'A slow drift, a short tension and a crisp realignment.',
        rendering_and_quality: 'Crisp keyframes ending perfectly registered with the copy intact.',
        key_features: 'slipping ink layers; slow drift; crisp realign; readable copy',
      },
      ['generic chromatic aberration', 'intense flashes', VIDEO],
      [
        'Keyframes of a ghost-story podcast ident "WHISPERS" whose ink layers drift apart like a haunting and snap back into place, pale green and black.',
        'Keyframes of a hangover-cure ad reading "BETTER SOON", layers drifting wildly out of register and slowly finding each other.',
        'Two ink layers of the word "FORMS" drift gently apart and slowly realign for a print studio ident, ending in perfect registration.',
      ],
    ),
    M(
      'R-MOT-06',
      'Mechanical Index Motion',
      'discrete mechanical switch styleframes',
      'mechanical-motion',
      {
        aesthetic:
          'Mechanical Index Motion: styleframes of states changing in discrete steps with a short shared settle, like a mechanical flip or dial.',
        subject_treatment:
          "Show the prompt's state change as keyframes of discrete steps with a brief settle, identifiers and order kept and every value exact.",
        color_and_tone: 'Color per supplied state backed by position or label.',
        lighting_and_shadow: 'Constant display light with the moment of change visible.',
        texture_and_material: 'Clean segments or flip panels with crisp, well-defined edges.',
        camera_and_composition: 'Explicit rest positions for each state and one fixed reference.',
        atmosphere_and_mood: 'Step, stop and a small settle with a shared mechanical cadence.',
        rendering_and_quality:
          'Crisp keyframes with clear end states and no fake intermediate values.',
        key_features: 'discrete steps; brief settle; exact states; fixed reference',
      },
      ['invented numbers mid-flip', 'unneeded fake mechanisms', VIDEO],
      [
        'A split-flap departure board in a sky-port for airships flipping from "DELAYED" to "BOARDING" in three keyframes, the rest of the board still.',
        'A flip counter in a waiting room ticking from "NOW SERVING 1" to "NOW SERVING 2" after an eternity, the crowd visibly aging.',
        'A selector stepping from A to B to C with a visible rest position for each state.',
      ],
    ),
    M(
      'R-MOT-07',
      'Tensioned Surface Morphs',
      'anchored membrane morph styleframes',
      'tension-morph',
      {
        aesthetic:
          'Tensioned Surface Morphs: styleframes of a surface pulled between persistent anchor points, changing shape while keeping its edges.',
        subject_treatment:
          "Show the prompt's surface as keyframes pulled between persistent anchors, reshaping by tension while the words stay on a stable area.",
        color_and_tone: 'A constant surface color with accents only at the anchors.',
        lighting_and_shadow: 'Coherent light describing curvature with soft visible edges.',
        texture_and_material: 'A conceptual membrane of steady thickness with justified wrinkles.',
        camera_and_composition: 'Anchors in frame with room for the maximum stretch.',
        atmosphere_and_mood: 'Building tension, controlled movement and a clear resting state.',
        rendering_and_quality: 'Crisp keyframes with persistent edges and countable anchors.',
        key_features: 'membrane between anchors; persistent edges; tension stages; stable text',
      },
      ['surface turning into another object', 'new anchors', VIDEO],
      [
        'Keyframes of a black silk sheet held at four corners stretching over a hidden shape until the title "THE UNVEILING" appears beside it, candlelit gallery tones.',
        'Keyframes of a trampoline surface stretching under an invisible weight and bouncing back, the word "BOING" waiting calmly nearby.',
        'One corner of a pale flat membrane lifts while three anchors stay fixed, the soft bend shown over three frames for a gallery opening ident.',
      ],
    ),
    M(
      'R-MOT-08',
      'Mass-Swap Match Cuts',
      'shape-matched cut styleframes',
      'match-cut',
      {
        aesthetic:
          'Mass-Swap Match Cuts: two very different scenes joined by a cut where the main mass keeps its exact position, size and direction.',
        subject_treatment:
          "Show the prompt's two scenes as a before and after pair joined by one dominant shape in the same position and size, the cut declared and words exact.",
        color_and_tone:
          'Palettes changing per scene while the main mass keeps comparable contrast.',
        lighting_and_shadow: 'Coherent light in each scene, the match coming from composition.',
        texture_and_material: 'Different materials allowed, one silhouette or axis always shared.',
        camera_and_composition: 'The mass anchor and bounding box explicit in both frames.',
        atmosphere_and_mood: 'Setup, match and reveal, energy concentrated in one satisfying swap.',
        rendering_and_quality: 'Crisp pair of frames with a checkable match across the cut.',
        key_features: 'matched mass; same position; declared cut; two scenes',
      },
      ['two unrelated images', 'flash as the only link', VIDEO],
      [
        'A match cut from a full moon over a werewolf forest to a round cup of coffee on a kitchen table at dawn, same circle, same place, title "MORNING AFTER".',
        "A match cut from a spinning planet to a spinning pizza dough in a chef's hands, perfectly aligned and absurdly majestic.",
        'A calm match cut from a large letter O to the round face of a dial, center and hole aligned.',
      ],
    ),
    M(
      'R-MOT-09',
      'Counterform Reveal Motion',
      'counterform opening reveal styleframes',
      'counterform-reveal',
      {
        aesthetic:
          'Counterform Reveal Motion: styleframes where the inner spaces of a symbol or word open up to reveal the message behind them.',
        subject_treatment:
          "Show the prompt's symbol or word opening its own counters in keyframes to reveal related content, with no foreign mask and every word exact.",
        color_and_tone:
          'High figure-ground contrast with an optional accent on the revealed layer.',
        lighting_and_shadow: 'Flat or contained volume, the counter change doing the work.',
        texture_and_material: 'Continuous edges and wide openings that stay open throughout.',
        camera_and_composition: 'The opening holds focus and the final frame reads completely.',
        atmosphere_and_mood: 'A brief expectation followed by reveal and a readable pause.',
        rendering_and_quality:
          'Crisp keyframes with clean counters and complete letters at the end.',
        key_features: 'counters opening; reveal from within; no foreign mask; readable end',
      },
      ['arbitrary wipe', 'text hidden most of the time', VIDEO],
      [
        'A keyhole-shaped emblem for a mystery series whose opening widens until the title "THE LOCKED ROOM" appears inside it, black and brass, shown across three keyframes.',
        'The letter O in "DONUT" opening wider and wider until a real donut is revealed inside, very satisfied, shown across three keyframes.',
        'Inside the word "OPEN" the counters slowly widen until the word "READ" appears within them, both words readable in turn, for a small library.',
      ],
    ),
    M(
      'R-MOT-10',
      'Quantized Pixel Unfolding',
      'pixel cluster unfold styleframes',
      'pixel-unfold',
      {
        aesthetic:
          'Quantized Pixel Unfolding: styleframes where whole pixel clusters rearrange step by step on one fixed logical grid.',
        subject_treatment:
          "Show the prompt's subject unfolding in keyframes of whole pixel clusters on one fixed grid, same palette and piece count and exact words.",
        color_and_tone: 'A limited constant palette with hard pixel edges.',
        lighting_and_shadow: 'Shading in whole-pixel value bands with crisp steps.',
        texture_and_material: 'Square pixels with quantized edges, each cluster a unit of motion.',
        camera_and_composition: 'A fixed logical grid and stable frame with room to unfold.',
        atmosphere_and_mood:
          'A discrete cadence of opening, moving and fitting, like a small puzzle.',
        rendering_and_quality: 'Crisp keyframes aligned to the pixel grid with clusters kept.',
        key_features: 'pixel clusters; fixed grid; step-by-step unfold; limited palette',
      },
      ['pixelated blurry morph', 'changing pixel sizes', VIDEO],
      [
        'A pixel treasure chest in a retro game channel ident unfolding cluster by cluster to reveal the title "LOOT", six colors on a fixed grid, shown across three keyframes.',
        'A pixel cat unfolding from a tiny cube into a full stretch, then refolding into a cube and falling asleep, shown across three keyframes.',
        'A pixel word "PAUSE" for a retro music player unfolds from three persistent blocks on a fixed grid, one step at a time.',
      ],
    ),
  ],
};

export default spec;
