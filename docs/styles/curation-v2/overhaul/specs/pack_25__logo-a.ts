import type { Spec } from '../tools/apply';
import { design } from './_design';

// Logo & symbol systems (part A): R-LOG-01..10. Each style is one construction rule for a mark.
const L = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
) => design(name, domain, tag, 'logo', fields, avoid, briefs, { text: true, source });

const spec: Spec = {
  pack: 'pack_25',
  category: '1. Logo & Symbol Systems',
  newCategory: { id: 'logo-and-symbol-systems' },
  updates: {},
  creates: [
    L(
      'R-LOG-01',
      'Chisel Counterforms',
      'negative-space logo construction',
      'chisel-counterforms',
      {
        aesthetic:
          'Chisel Counterforms: a few compact masses opened by one carved void that gives the mark an essential second reading.',
        subject_treatment:
          "Design the prompt's subject as a mark of two solid masses and one continuous void that carries its own meaning; set any requested name exactly.",
        color_and_tone:
          'Binary one-ink contrast, with the background flowing into the figure as the second image.',
        lighting_and_shadow:
          'Completely flat graphic rendering, where the cut void alone creates depth and reading.',
        texture_and_material:
          'Crisp cut edges and uniform solid surfaces, like shapes chiselled from one block.',
        camera_and_composition:
          'Heavy mass balanced by an opposite opening, with neck, joins and optical center protected.',
        atmosphere_and_mood:
          'Tension between a stable block and an unexpected opening that is discovered a moment later.',
        rendering_and_quality:
          'Vector-clean mark that survives filled, inverted and reduced while both readings remain clear.',
        key_features: 'carved meaningful void; two-mass figure; one-ink contrast; second reading',
      },
      [
        'ornamental void',
        'figure built from too many pieces',
        'second reading that depends on a shadow',
      ],
      [
        "Symbol for a lighthouse keepers' guild: a solid black whale whose open mouth is the exact shape of a lighthouse beam cutting into the dark. One ink, vertical, heavy base, symbol only.",
        'Mark for a very dramatic cheese shop called "GROTTO": a round wheel of cheese whose carved holes secretly form a grinning skull, one ink, the wordmark set small and exact underneath.',
        'Emblem for a night-time grief counselling line: a closed hand whose empty palm is shaped like a small sleeping bird, charcoal ink on bone white, quiet and centered.',
      ],
    ),
    L(
      'R-LOG-02',
      'Hinged Monograms',
      'articulated monogram construction',
      'hinged-monograms',
      {
        aesthetic:
          'Hinged Monograms: two initials share one geometric articulation, joining like a hinge while each letter keeps its own strokes.',
        subject_treatment:
          'Build the requested initials into one monogram joined at a single compatible stroke that works as a shared hinge; keep every letter readable and exact.',
        color_and_tone:
          'Monochrome final mark, studied with one distinct value per letter before merging into one ink.',
        lighting_and_shadow:
          'Even flat graphic light, with the articulation drawn in the contour itself.',
        texture_and_material:
          'Related stroke weights with clean joins and clearly separated terminals on both letters.',
        camera_and_composition:
          'The hinge axis organizes the mark freely, with room for asymmetry beyond a square box.',
        atmosphere_and_mood:
          'Contained motion, as if the letters could swing open without ever coming apart.',
        rendering_and_quality:
          'Optically corrected join, with the more complex letter tuned so it never dominates by density.',
        key_features: 'shared hinge stroke; readable initials; contained motion; one-ink monogram',
      },
      [
        'fused initials',
        'hinge added as a separate prop',
        'rotation that turns one letter into another',
      ],
      [
        'Monogram "VK" for a clandestine clockmaker who repairs time for royalty: the V\'s right arm swings down to become the K\'s spine like a hinge, black on brass-colored ground, tall and severe.',
        'Monogram "OP" for a dog-walking company that walks thirty dogs at once: the P\'s bowl hinges off the O like a leash clip, one cheerful red ink, slightly lopsided on purpose.',
        'Monogram "EM" engraved on a single wedding ring for a couple who met in a hospital waiting room: the middle stroke is shared like a closed door, one fine ink on white.',
      ],
    ),
    L(
      'R-LOG-03',
      'Split-Contour Marks',
      'complementary open-outline logo',
      'split-contour',
      {
        aesthetic:
          'Split-Contour Marks: two open outlines complete each other without touching, together forming one recognizable silhouette.',
        subject_treatment:
          "Split the prompt's subject silhouette between two open paths, each insufficient alone and complete only with its partner; set requested text exactly.",
        color_and_tone:
          'One ink as the final test, with a second value allowed only while studying the two halves.',
        lighting_and_shadow:
          'Depthless graphic surface where the gap between strokes is a real separation.',
        texture_and_material:
          'Continuous contours with deliberate terminals and a single clean line per edge.',
        camera_and_composition:
          'Breaks placed in different zones so the two paths never face each other directly.',
        atmosphere_and_mood:
          'Dialogue and approach without contact, a central pause that keeps the tension alive.',
        rendering_and_quality:
          'The eye closes the shape through perceptual continuity, with no added bridges between the paths.',
        key_features: 'two open outlines; perceptual closure; alternating breaks; untouched gap',
      },
      ['two redundant outlines', 'silhouette accidentally closed', 'breaks too small to perceive'],
      [
        'Symbol for a rescue team that searches for climbers lost in blizzards: two open strokes complete a mountain and a reaching hand at the same time, deep blue-black ink, wind-cut breaks.',
        'Mark for a divorce lawyer who insists on staying friends with everyone: two open outlines form one heart that never quite touches in the middle, one ink, weirdly optimistic.',
        'Emblem for a lonely radio station broadcasting from a fire lookout tower: two separate curves complete a listening ear, dark green ink, the station name "LOOKOUT 9" set small and exact.',
      ],
    ),
    L(
      'R-LOG-04',
      'Woven Junction Symbols',
      'over-under interlace logo',
      'woven-junction',
      {
        aesthetic:
          'Woven Junction Symbols: simple paths alternate over and under at each crossing, turning plain lines into a continuous woven sign.',
        subject_treatment:
          "Construct the prompt's subject from a few traceable bands under one strict over-under crossing rule, each overpass resolved with a clean cut; set requested text exactly.",
        color_and_tone:
          'Value shifts may clarify crossings, while the cut gaps alone carry the continuity.',
        lighting_and_shadow:
          'Flat bands, with overlap explained by the lower band stopping cleanly at each cross.',
        texture_and_material:
          'Uniform smooth bands kept graphic, never turning into literal rope or fibre.',
        camera_and_composition:
          'Few well-spaced crossings with one dominant path, spread across the mark.',
        atmosphere_and_mood:
          'Ordered interdependence, with a woven cadence that stays modern and unornamented.',
        rendering_and_quality:
          'Identical crossing gaps and consistent band width everywhere in the interlace.',
        key_features: 'over-under crossings; traceable bands; clean cut gaps; woven cadence',
      },
      ['impossible interlace', 'decorative knots added', 'imposed resemblance to cultural symbols'],
      [
        'Symbol for an alliance of seven rival pirate crews who swore a truce: seven bands weave over and under around one empty circle, each path still traceable end to end, one blood-red ink.',
        'Mark for a knitting club for retired bodybuilders called "IRON YARN": two thick bands interlace like crossed arms, flat black, the name set exact and heavy beside it.',
        'Emblem for a family that has carried the same letters between two villages for three centuries: two thin paths weave once and part, pale grey ink, quiet and small.',
      ],
    ),
    L(
      'R-LOG-05',
      'Asymmetric Module Families',
      'asymmetric module identity family',
      'asymmetric-module',
      {
        aesthetic:
          'Asymmetric Module Families: one deliberately lopsided module assembles into several related signs with visible family resemblance.',
        subject_treatment:
          "Build the prompt's subject or each requested sign from one irregular primitive, changing how it assembles rather than only rotating it; set requested names exactly.",
        color_and_tone:
          'One main color identifies the system, and each variant stands apart first by structure.',
        lighting_and_shadow:
          'Flat graphic planes, with plane relationships designed into the module itself.',
        texture_and_material:
          'Flat geometry with one signature corner, slope or concavity always recognizable.',
        camera_and_composition:
          'Each assembly balanced by its optical center, in an even comparison row.',
        atmosphere_and_mood:
          'Obvious kinship with distinct results, the asymmetry keeping repetition alive.',
        rendering_and_quality:
          'Clean assemblies with the module trait intact and every accidental gap removed.',
        key_features: 'lopsided module; varied assembly; family resemblance; optical balance',
      },
      [
        'module turned into a texture',
        'variants that only rotate',
        'optical correction that erases the shared trait',
      ],
      [
        'Three signs for a deep-sea research station: pressure, darkness and life, all assembled from one curved lopsided wedge, cold cyan ink on black, presented as a row of three separate marks.',
        'Four signs for a monster-hunting agency that is mostly paperwork: filing, hunting, lunch and complaints, each built from one truncated asymmetric block, one ink, very serious.',
        "Three quiet signs for a village library's rooms: reading, sleeping and waiting, each from one soft irregular module, warm brown ink, spaced evenly in a single row.",
      ],
    ),
    L(
      'R-LOG-06',
      'Elastic Loop Wordmarks',
      'looped connected wordmark',
      'elastic-loop',
      {
        aesthetic:
          'Elastic Loop Wordmarks: letters of the exact requested word connected by one or two controlled loops that keep rhythm and counters open.',
        subject_treatment:
          'Set the requested word exactly and connect a few letters with one or two loops that grow out of compatible strokes, keeping the full letter skeletons.',
        color_and_tone:
          'One dominant ink with generous open counters and clear separation inside each loop.',
        lighting_and_shadow:
          'Flat reading, with elasticity expressed through curve tension and stroke changes.',
        texture_and_material:
          'Clean curves, contained terminals and continuous weight, with local optical tuning.',
        camera_and_composition:
          'Linked zones alternate with resting spaces, keeping word spaces clearly open.',
        atmosphere_and_mood:
          'Elastic and friendly, with one expansive gesture that never floods the whole word.',
        rendering_and_quality:
          'The word reads first, and the path of the loop is discovered a moment later.',
        key_features: 'controlled loops; exact word; open counters; one expansive gesture',
      },
      [
        'letters replaced by loops',
        'ligatures that change the reading',
        'uniformly cramped spacing',
      ],
      [
        'Wordmark "HOWL" for a werewolf-owned late-night diner: one long loop leaps from the H and curls back under the L like a tail, deep crimson ink, low and wide.',
        'Wordmark "yoyo" for a company that sells yo-yos to very stressed executives: the two y descenders loop into each other once, bright orange, bouncy but perfectly legible.',
        'Wordmark "tide & ash" for a small crematorium by the sea: one soft loop joins the t and i, the rest breathes freely, grey ink on white, calm and dignified.',
      ],
    ),
    L(
      'R-LOG-07',
      'Compressed Ligature Blocks',
      'compact ligature wordmark',
      'compressed-ligature',
      {
        aesthetic:
          'Compressed Ligature Blocks: selected letter pairs of the exact word fuse through shared strokes into a dense block that still reads in order.',
        subject_treatment:
          'Set the requested word exactly and compress only compatible pairs through shared strokes, leaving unjoined letters as reading pauses.',
        color_and_tone: 'One-ink masses with counters open enough to separate every letter group.',
        lighting_and_shadow:
          'Neutral flat rendering, with separations drawn in the letterforms themselves.',
        texture_and_material:
          'Firm terminals, smooth joins and solid ink surfaces across the whole block.',
        camera_and_composition:
          'Pairs or trios grouped along one continuous reading axis, with free overall shape.',
        atmosphere_and_mood:
          'Deliberate density with small rhythmic releases, compact and confident.',
        rendering_and_quality:
          'Localized compression that clearly beats an unligated version for width and reading.',
        key_features: 'shared-stroke pairs; dense block; reading pauses; one ink',
      },
      ['global horizontal squash', 'closed counters', 'illegible letters rescued only by context'],
      [
        'Wordmark "TITAN FORGE" for a foundry that casts bells for mountain monasteries: TI and AN share heavy strokes into one iron block, black ink, massive and grave.',
        'Wordmark "SNACK ATTACK" for a vending machine that is clearly haunted: CK pairs fuse in both words, acid green ink, the letters crowded like they are fighting for the door.',
        'Wordmark "HUSH" for a tiny sound-proof reading booth in a train station: HU and SH share strokes, the gap between them left calm and wide, one navy ink.',
      ],
    ),
    L(
      'R-LOG-08',
      'Cut-End Ribbon Signs',
      'folded flat ribbon mark',
      'cut-end-ribbon',
      {
        aesthetic:
          'Cut-End Ribbon Signs: a flat band of consistent width folds a few times, both cut ends clearly visible, to form the mark.',
        subject_treatment:
          "Draw the prompt's subject as one flat ribbon of related width with both ends shown and folds resolved as clear breaks; set requested text exactly.",
        color_and_tone:
          'Two optional values for the ribbon faces, with a silhouette that holds in one ink.',
        lighting_and_shadow:
          'Faces separated graphically by folds and occlusion, with shading kept optional.',
        texture_and_material: 'Smooth matte band, graphic and flat, its folds doing all the work.',
        camera_and_composition:
          'One traceable path, with at most two planes crossing at any point.',
        atmosphere_and_mood: 'Continuity in motion with a clear beginning and an unmistakable end.',
        rendering_and_quality:
          'Every face change corresponds to a real fold, drawn with clean vector geometry.',
        key_features: 'flat folding band; visible cut ends; clear fold breaks; traceable path',
      },
      ['infinite ribbon by default', 'hidden ends', 'physically incoherent folds'],
      [
        'Mark for a courier service that delivers across a war-torn border at night: one ribbon folds twice into a road and a flame, burnt orange ink, both cut ends sharp and visible.',
        'Symbol for a ballroom dance school run by two retired sumo wrestlers: one wide ribbon twirls into a single graceful fold, two blues, surprisingly elegant.',
        'Mark for a letter-writing club in a remote prison: a short band folds once like an envelope opening, one ink, the club name "INK & HOURS" set small and exact.',
      ],
    ),
    L(
      'R-LOG-09',
      'Staggered Aperture Marks',
      'offset-cut rhythm mark',
      'staggered-aperture',
      {
        aesthetic:
          'Staggered Aperture Marks: offset openings cut through neighboring masses so the voids create rhythm and direction.',
        subject_treatment:
          "Build the prompt's subject from a few masses with staggered cuts that form a perceptual path, never aligning every opening; set requested text exactly.",
        color_and_tone:
          'One-ink contrast, each opening belonging to the background as a true void.',
        lighting_and_shadow:
          'Flat graphic rendering, with direction emerging only from the sequence of voids.',
        texture_and_material: 'Smooth solid masses and clean open cuts with crisp vector edges.',
        camera_and_composition:
          'Offsets graduated in two or three steps within one unified silhouette.',
        atmosphere_and_mood:
          'Pulse and forward movement expressed purely through rhythm, calm and precise.',
        rendering_and_quality:
          'Small cuts optically widened before reduction so the rhythm survives at small sizes.',
        key_features: 'staggered cuts; void rhythm; unified silhouette; implied direction',
      },
      [
        'random decorative cuts',
        'hidden arrow forced into every mark',
        'pattern that becomes too dense',
      ],
      [
        'Mark for an avalanche warning service: three stacked masses with staggered openings read as snow sliding downhill, stark white on deep blue, urgent and clear.',
        'Symbol for an escalator repair company that is always late: three blocks with offset cuts climb upward in uneven steps, one violet ink, slightly out of breath.',
        'Mark for a meditation retreat inside an abandoned subway tunnel: two long masses with offset openings like distant platform lights, one ink, name "UNDERSTILL" set exact.',
      ],
    ),
    L(
      'R-LOG-10',
      'Stacked Silhouette Emblems',
      'nested silhouette emblem',
      'stacked-silhouette',
      {
        aesthetic:
          'Stacked Silhouette Emblems: two or three silhouettes stack and nest through complementary edges with generous breathing space.',
        subject_treatment:
          "Stack the prompt's subject with one or two related silhouettes whose edges complete each other, one reading dominant; set requested text exactly.",
        color_and_tone:
          'Levels separated by value only when needed, with recognition checked in one ink.',
        lighting_and_shadow:
          'Flat planes where every contact between pieces is resolved in the drawing.',
        texture_and_material:
          'Solid graphic surfaces with shared complementary edges and no secondary ornament.',
        camera_and_composition:
          'Stacked by the hierarchy of the idea, with weight growing toward the base.',
        atmosphere_and_mood: 'Support and cooperation, the pieces holding each other up.',
        rendering_and_quality:
          'Shared edges keep both readings intact even when the pieces are pulled apart.',
        key_features: 'nested silhouettes; complementary edges; weighted base; breathing gaps',
      },
      [
        'shield shape forced on every emblem',
        'decorative filler pieces',
        'fits that change what a figure is',
      ],
      [
        'Emblem for the last dragon sanctuary: a sleeping dragon, a mountain and a small hut stack by shared edges, heaviest at the base, charcoal ink, grave and protective.',
        'Emblem for a stacking-chair factory that takes itself far too seriously: three chairs nest into one heroic silhouette, one ink, the name "STACKWELL" set exact beneath.',
        "Emblem for a night nurse's union: a crescent moon rests on two cupped hands that fit together like a cradle, deep teal ink, small and tender.",
      ],
    ),
  ],
};

export default spec;
