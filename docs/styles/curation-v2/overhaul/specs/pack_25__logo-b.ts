import type { Spec } from '../tools/apply';
import { design } from './_design';

// Logo & symbol systems (part B): R-LOG-11..17 styles, R-LOG-18 profile, R-LOG-19/20 recipes as sheet profiles.
const L = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
  kind: 'style' | 'profile' = 'style',
) => design(name, domain, tag, 'logo', fields, avoid, briefs, { text: true, source, kind });

const spec: Spec = {
  pack: 'pack_25',
  category: '1. Logo & Symbol Systems',
  updates: {},
  creates: [
    L(
      'R-LOG-11',
      'Gesture-to-Geometry Marks',
      'reduced gesture logo',
      'gesture-geometry',
      {
        aesthetic:
          'Gesture-to-Geometry Marks: one continuous gesture reduced to two taut curves and a single controlled break with a rhythmic signature.',
        subject_treatment:
          "Reduce the prompt's subject to one movement of two tense curves and one characteristic break that keeps the original direction; set requested text exactly.",
        color_and_tone: 'One ink at a steady weight, with expression carried by the path itself.',
        lighting_and_shadow:
          'Flat graphic rendering, where apparent speed comes from the path and its terminals.',
        texture_and_material:
          'Clean edges and minimal stroke swell, crisp enough to cut from vinyl.',
        camera_and_composition:
          'Off-center inflection point balanced by a wide empty region beside the gesture.',
        atmosphere_and_mood:
          'Held energy in a rhythmic signature, disciplined rather than spontaneous.',
        rendering_and_quality:
          'The small version keeps the same number of inflections and the same direction.',
        key_features: 'two taut curves; single break; off-center inflection; held energy',
      },
      ['scribble without a rule', 'too many inflection points', 'texture as the only identity'],
      [
        'Mark for a samurai-sword sharpening dojo: one stroke rises, tightens and snaps back once like a blade flick, black ink on rice-paper white, diagonal and fierce.',
        'Mark for a competitive napping league: one lazy curve stretches out and flops back with a single break like a yawn, sleepy lilac ink, the name "DOZE CUP" set exact.',
        'Symbol for a hospice choir: one gentle curve lifts and turns once before fading, dark blue ink with an enormous empty space beneath it.',
      ],
    ),
    L(
      'R-LOG-12',
      'Interlocked Counters',
      'coordinated counterform wordmark',
      'interlocked-counters',
      {
        aesthetic:
          'Interlocked Counters: the inner spaces of letters or signs are coordinated like shared modules while outer shapes stay individual.',
        subject_treatment:
          "Set the requested word or initials exactly and align their counters so the inner spaces talk to each other, keeping each letter's outer strokes its own.",
        color_and_tone:
          'One ink, with the background forming the coordinated pieces between characters.',
        lighting_and_shadow: 'Flat rendering, with every counter a true open space in the drawing.',
        texture_and_material:
          'Continuous surfaces and clean inner edges, outer contours tuned for reading.',
        camera_and_composition:
          'Counters matched in size and alignment while letter widths stay natural.',
        atmosphere_and_mood:
          'Cohesive inner rhythm beneath a deliberately varied outer silhouette.',
        rendering_and_quality:
          'Clear borders between characters, with counters checked in an inverted version.',
        key_features: 'coordinated counters; varied outer shapes; inner rhythm; exact letters',
      },
      [
        'merged letters',
        'cloned counters that deform characters',
        'pattern that replaces the word',
      ],
      [
        'Wordmark "OBOE DOOM" for a doom-metal band that only plays woodwinds: the counters of every O, B and D align like a row of dark portholes, one black ink, heavy and wide.',
        'Wordmark "BAGEL BOB" for a bagel shop run by a man named Bob who is very proud: every round counter is the same bagel hole, warm brown ink, cheerful spacing.',
        'Monogram "QO" for a quiet observatory on an island: the two counters share one exact proportion like twin telescope lenses, midnight blue ink, the Q tail left long.',
      ],
    ),
    L(
      'R-LOG-13',
      'Interrupted Radial Seals',
      'broken radial seal mark',
      'interrupted-radial',
      {
        aesthetic:
          'Interrupted Radial Seals: units arranged around a center with one dominant interruption and smaller pauses, breaking ornamental symmetry.',
        subject_treatment:
          "Arrange the prompt's subject as radial units around a center with one main open sector and a few secondary pauses, with any outline shape allowed; set requested text exactly.",
        color_and_tone:
          'Contrast between units and void, with one optional accent on the main interruption.',
        lighting_and_shadow:
          'Flat graphic rendering, with hierarchy built from the missing sector itself.',
        texture_and_material: 'Units of related size with defined edges and solid ink surfaces.',
        camera_and_composition:
          'Optical center slightly shifted when useful, one open sector ruling the others.',
        atmosphere_and_mood: 'Order with a deliberate deviation, confident rather than solemn.',
        rendering_and_quality:
          'The mark reads with few units, and the missing sector stays obvious when small.',
        key_features: 'radial units; dominant open sector; asymmetric pauses; shifted center',
      },
      ['bureaucratic stock seal', 'invented laurels or dates', 'uniform symmetry with no focus'],
      [
        'Seal for a secret order of astronomers who predicted an eclipse that never came: radial rays with one large sector missing where the sun should be, gold on black, grave.',
        'Seal for a pizza place that always forgets one slice: eight radial wedges with one gap, tomato red ink, the name "ALMOST WHOLE" set exact around the lower edge.',
        'Mark for a village that rings its bell only when someone comes home: short radial strokes with one quiet opening at the top, one soft grey ink.',
      ],
    ),
    L(
      'R-LOG-14',
      'Fold-Edge Insignia',
      'folded-plane insignia',
      'fold-edge',
      {
        aesthetic:
          'Fold-Edge Insignia: changes of direction read as the edges of one folded sheet, the plane and its crease defining the sign.',
        subject_treatment:
          "Form the prompt's subject from one broad sheet with a few changes of plane, letting folded edges rather than a band define the sign; set requested text exactly.",
        color_and_tone:
          'Two complementary plane values plus a silhouette that holds in solid black.',
        lighting_and_shadow:
          'Very limited optional shading, the fold edge always present in the flat construction.',
        texture_and_material:
          'Clean sheet with minimal visual thickness and deliberate crisp corners.',
        camera_and_composition:
          'Main plane facing the viewer, the second plane working as a counterweight.',
        atmosphere_and_mood:
          'Stability with a surprise at the edge, like a figure about to unfold.',
        rendering_and_quality:
          'Every drawn edge corresponds to a plane, with purposeful facets only.',
        key_features: 'folded sheet; crease edges; two-plane contrast; counterweight plane',
      },
      [
        'ribbon instead of a sheet',
        'triangulation without function',
        'shadows that invent thickness',
      ],
      [
        'Insignia for a mountain rescue squadron: one folded plane forms a peak and a sheltering wing at once, red and white planes, a single crisp crease down the center.',
        'Insignia for an origami club that has been banned from three libraries: one sheet folds into a smug crane shape, two blues, the name "PAPER CRIMES" set exact below.',
        'Insignia for a traveling bookbinder: a single sheet folds open at one corner like a door ajar, muted red ink, small and quiet.',
      ],
    ),
    L(
      'R-LOG-15',
      'Open-Frame Wordmarks',
      'open-contour wordmark',
      'open-frame',
      {
        aesthetic:
          'Open-Frame Wordmarks: chosen parts of the letter outlines stay open while rhythm and proportion keep the exact word readable.',
        subject_treatment:
          'Set the requested word exactly and open selected terminals or joins, keeping enough distinctive strokes that every character stays itself.',
        color_and_tone:
          'One ink on a continuous ground, each letter complete through structure alone.',
        lighting_and_shadow:
          'Flat rendering, with the openings left clean and the contours implied by rhythm.',
        texture_and_material: 'Clean graphic strokes with consistent opening size tuned per scale.',
        camera_and_composition:
          'Steady baseline and word rhythm, openings spread so they never form a stripe.',
        atmosphere_and_mood:
          'Deliberate lightness and continuity by suggestion, never fragile to read.',
        rendering_and_quality:
          'The word stays recognizable when reduced, and no opening creates a different letter.',
        key_features: 'open letter outlines; exact word; spread openings; light rhythm',
      },
      ['ambiguous characters', 'identical cuts everywhere', 'openings that close up when reduced'],
      [
        'Wordmark "HALO BREACH" for a thriller about an escape from an orbital prison: the tops of the letters are cut open like a hull breach, black ink, wide and tense.',
        'Wordmark "OPEN LATE" for a bakery run by a nocturnal family of owls: every letter has one open corner like a door left ajar, warm brown ink, sleepy spacing.',
        'Wordmark "between" for a letters archive of unsent love notes: alternate letters stay open and closed, deep green ink, lowercase and hushed.',
      ],
    ),
    L(
      'R-LOG-16',
      'Dual-Scale Symbols',
      'two-scale detail symbol',
      'dual-scale',
      {
        aesthetic:
          'Dual-Scale Symbols: a bold primary silhouette holds a second inner structure that appears only at large sizes and never harms reduction.',
        subject_treatment:
          "Design the prompt's subject as a self-sufficient primary silhouette plus a secondary inner structure that adds meaning when enlarged; set requested text exactly.",
        color_and_tone:
          'Robust main contrast, with lower contrast reserved for the large-scale inner detail.',
        lighting_and_shadow:
          'Flat graphic rendering, with both scales living in the drawing itself.',
        texture_and_material:
          'Simple main edges, with detail grouped in one zone rather than spread as texture.',
        camera_and_composition:
          'Global and inner scales kept separate, detail away from critical contour zones.',
        atmosphere_and_mood:
          'Instant recognition followed by slow discovery, like a secret in plain sight.',
        rendering_and_quality:
          'A small version may drop the inner layer without changing the main meaning.',
        key_features: 'bold outer silhouette; hidden inner layer; scale discovery; clean reduction',
      },
      ['illegible miniature', 'ornamental micro-detail', 'second scale that contradicts the first'],
      [
        'An anchor silhouette for a sunken-city archaeology team, simple enough for a buoy, whose shank hides a tiny drowned street of doorways visible only up close; one navy ink, shown large and small.',
        'A plain teacup silhouette for a very secretive cat cafe, whose curling steam reveals a sleeping cat only at large size; one ink, with the name "STEAM & PURR" set exact beneath.',
        'Under the ice of a polar seed vault, its emblem: a simple seed shape holding a faint inner spiral of rooms when enlarged, black ink, a small reduced version beside it.',
      ],
    ),
    L(
      'R-LOG-17',
      'Pictorial Stroke Economy',
      'minimal-stroke pictogram mark',
      'stroke-economy',
      {
        aesthetic:
          'Pictorial Stroke Economy: figurative marks built from very few strokes that share segments between parts of the figure.',
        subject_treatment:
          "Draw the prompt's subject with the fewest strokes possible, sharing segments between compatible parts while keeping its essential traits; set requested text exactly.",
        color_and_tone:
          'One high-contrast ink with solid strokes carrying every trait of the figure.',
        lighting_and_shadow: 'Even graphic rendering, with every limb and part drawn by a stroke.',
        texture_and_material:
          'Firm contours with little weight variation and clean open interiors.',
        camera_and_composition:
          'One main figure with dominant free space and its distinctive orientation kept.',
        atmosphere_and_mood:
          'Clarity with a surprisingly economical gesture that keeps full identity.',
        rendering_and_quality:
          'The subject reads without a caption and shared strokes never create impossible anatomy.',
        key_features: 'few shared strokes; figurative clarity; open space; economical gesture',
      },
      ['generic pictogram', 'fused limbs', 'details that only make sense with a caption'],
      [
        'Three strokes draw a howling wolf for a wolf-pack conservation trust, the raised throat also forming the crescent moon above it; black ink, diagonal and wild.',
        'An angry goose mid-honk drawn in two strokes for a very dramatic goose-herding company, the neck shared by the wing; one ink, the name "HONK LTD" set exact.',
        "A lighthouse widow's tea shop gets its mark from a single stroke: a cup whose handle becomes the lighthouse beam, one pale grey ink, delicate and small.",
      ],
    ),
    L(
      'R-LOG-18',
      'Family-of-Marks Grid',
      'logo family system sheet',
      'family-of-marks',
      {
        aesthetic:
          'Family-of-Marks Grid: one grid and a small set of primitives generate a family of related signs for a single organization, shown as a system sheet.',
        subject_treatment:
          "Present the prompt's subject or requested sections as a family of signs built from the same primitives, anchors and optical tolerances; set every requested name exactly.",
        color_and_tone: 'One shared palette, with every member also checked in a single ink.',
        lighting_and_shadow:
          'Flat graphic presentation with identical treatment across every member.',
        texture_and_material:
          'Flat editable geometry built from a very small repertoire of pieces.',
        camera_and_composition:
          'Comparison sheet of equal boxes, marks balanced by optical weight, with a faint grid.',
        atmosphere_and_mood:
          'Cohesion without sameness, every sign sharing rules yet holding one unmistakable trait.',
        rendering_and_quality:
          'Module, anchors and exceptions recorded clearly, annotations kept outside the artwork.',
        key_features: 'shared primitives; equal comparison boxes; optical balance; faint grid',
      },
      ['family of clones', 'grid used only as decoration', 'variants that differ only by color'],
      [
        'Five zone signs for a haunted amusement park, carousel, mirror maze, ghost train, ferris wheel and exit, all built from a quarter arc and a broken bar, one ink on a faint grid.',
        'Cursed, cracked, homesick and possessed: four ward signs for a hospital for enchanted objects, each built from the same two lopsided modules, equal boxes in a row.',
        'Dawn, fire and return are the three bells of a mountain village, and each gets a sign built from one arc and one notch, charcoal ink, calm and evenly weighted.',
      ],
      'profile',
    ),
    L(
      'R-LOG-19',
      'Responsive Mark Set',
      'responsive logo size sheet',
      'responsive-mark',
      {
        aesthetic:
          'Responsive Mark Set: one identity shown as a primary, a reduced and a minimal version side by side, with the same proportions and core traits.',
        subject_treatment:
          "Present the prompt's subject mark in three sizes, primary, reduced and minimal, removing only detail that the small sizes cannot hold; keep requested text exact.",
        color_and_tone: 'Source colors kept in every version, with a monochrome test row beneath.',
        lighting_and_shadow: 'Flat presentation of the artwork, identical in every size.',
        texture_and_material:
          'Source edges and proportions kept, with only authorized apertures widened for reduction.',
        camera_and_composition:
          'Rows of primary, reduced and minimal marks at declared scales with optical alignment.',
        atmosphere_and_mood: 'Continuity of identity across scales, confident and systematic.',
        rendering_and_quality: 'Each simplification visibly improves reading at its own size.',
        key_features: 'three size tiers; monochrome test row; aligned scales; kept identity',
      },
      [
        'silent redesign',
        'minimal version that becomes another mark',
        'automatic scaling shown as optical correction',
      ],
      [
        'The mark of a dragon-riding postal service at three sizes: a detailed winged envelope at full size, a simpler wing at medium and a single flame-shaped fold as the favicon, all aligned in rows.',
        '"PANCAKE EMPIRE", a breakfast chain with imperial ambitions, needs its mark at every size: full crowned stack, reduced crown and a tiny round minimal mark, the word exact at the two larger sizes.',
        'Rows of a lighthouse museum mark shrinking step by step: full lighthouse with beam, reduced tower, then a single beam stroke at the smallest size, one ink, quiet and aligned.',
      ],
      'profile',
    ),
    L(
      'R-LOG-20',
      'Optical Ambigram Study',
      'ambigram lettering study',
      'ambigram',
      {
        aesthetic:
          'Optical Ambigram Study: requested words drawn so they read again after a declared rotation or reflection, shown in both orientations.',
        subject_treatment:
          'Letter the requested word so it reads after a 180-degree turn or mirror, choosing the transformation that keeps both readings exact, and show both orientations.',
        color_and_tone: 'One ink on a neutral ground so every reading problem stays visible.',
        lighting_and_shadow:
          'Flat rendering with no perspective or shading that favors one orientation.',
        texture_and_material:
          'Deliberately drawn contours with every stroke shared by both readings.',
        camera_and_composition:
          'Original and transformed views placed side by side at comparable positions.',
        atmosphere_and_mood:
          'Optical surprise that stays subordinate to legibility, clever and contained.',
        rendering_and_quality:
          'Both readings checked separately, with the requested text kept exact.',
        key_features: 'double reading; declared rotation; side-by-side orientations; exact word',
      },
      [
        'only one valid reading',
        'transformation different from the declared one',
        'swapped characters that fake success',
      ],
      [
        'An ambigram of the word "SWIMS" for a sea-monster tour boat, reading the same after a half turn, shown upright and rotated side by side in deep sea green ink.',
        'An ambigram of "NOON" for a café that only opens for one hour at midday, drawn with one stroke system and shown in both orientations, one sunny yellow ink.',
        'A mirror ambigram of "OTTO" for a retired magician\'s farewell show, reflected horizontally beside the original, black ink, elegant and exact.',
      ],
      'profile',
    ),
  ],
};

export default spec;
