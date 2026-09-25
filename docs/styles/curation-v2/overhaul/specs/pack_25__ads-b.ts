import type { Spec } from '../tools/apply';
import { design } from './_design';

// Advertising & campaign design (part B): R-ADV-11..16 styles, R-ADV-17 responsive grid profile, and the
// three-act, lockup and material-transformation recipes as sequence and comparison profiles.
const V = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
  kind: 'style' | 'profile' = 'style',
) => design(name, domain, tag, 'advertising', fields, avoid, briefs, { text: true, source, kind });

const CLAIMS = 'invented product claims, statistics or awards';

const spec: Spec = {
  pack: 'pack_25',
  category: '9. Advertising & Campaign Design',
  updates: {},
  creates: [
    V(
      'R-ADV-11',
      'Analog Texture Continuity',
      'shared analog grain campaign',
      'analog-continuity',
      {
        aesthetic:
          'Analog Texture Continuity: shared grain, edges and light tie photography and graphics into one coherent printed campaign surface.',
        subject_treatment:
          "Coordinate grain, edges and light between the prompt's photography and graphics into one editorial surface, the copy crisp and exact.",
        color_and_tone:
          'One unified palette with enough contrast for the copy and locked brand colors.',
        lighting_and_shadow:
          'Compatible light across images, with graphics integrated and no fake shadows.',
        texture_and_material:
          'Fine shared grain and controlled cut edges, with text left clean and sharp.',
        camera_and_composition:
          'A clear hierarchy between photo, brand and text, texture never dominating.',
        atmosphere_and_mood: 'Tactile cohesion and an analog character, warm and deliberate.',
        rendering_and_quality:
          'Printed-looking campaign whose identity survives with less texture.',
        key_features: 'shared grain; matched light; clean type; one printed surface',
      },
      ['noise over letters', 'different filters per fragment', 'generic nostalgia', CLAIMS],
      [
        'A revived 1970s space program speaks through a grainy photo of a rocket on the pad, printed shapes and the copy "WE ARE GOING BACK", all sharing one warm film grain.',
        'An ad for a very old family pizzeria that refuses to modernize, grainy photos and hand-cut shapes with the copy "SAME OVEN SINCE 1962", cozy and stubborn.',
        'A poster for a listening club with a grainy photo of an old radio and the copy "LISTEN AGAIN", blue ink and cream.',
      ],
    ),
    V(
      'R-ADV-12',
      'Folded Message Planes',
      'folded plane message ad',
      'folded-message',
      {
        aesthetic:
          'Folded Message Planes: graphic planes fold in space to carry the message face by face in a clear reading order.',
        subject_treatment:
          "Distribute the prompt's exact copy across a few folded graphic planes with a clear sequence, every word kept on its own readable face.",
        color_and_tone: 'Two or three values per plane and high-contrast text on each face.',
        lighting_and_shadow: 'Short coherent fold shadows with a simple, even overall light.',
        texture_and_material: 'Smooth planes, defined edges and minimal graphic thickness.',
        camera_and_composition:
          'One main plane holds the message, the others guide without hiding.',
        atmosphere_and_mood: 'Editorial depth and a feeling of moving forward through the message.',
        rendering_and_quality: 'Clean poster where every word reads from the main view.',
        key_features: 'folded planes; face-by-face copy; clear sequence; short shadows',
      },
      ['hidden text', 'impossible planes', 'folds with no function', CLAIMS],
      [
        'A poster for a map-makers\' guild: three folded planes unfold like an old map, reading "LOOK", "FIND" and "GO" face by face, black, cream and coral.',
        'Origami for impatient people: one plane folded exactly once, with the copy "THAT\'S ENOUGH FOLDING", deadpan.',
        'A banner for a design workshop with "THINK IN FACES" spread across two planes and one dominant fold, blue ink and bone.',
      ],
    ),
    V(
      'R-ADV-13',
      'Object-as-Letter Campaigns',
      'object replacing one letter ad',
      'object-letter',
      {
        aesthetic:
          'Object-as-Letter Campaigns: one form of the subject takes the place of a compatible letter while the whole word still reads instantly.',
        subject_treatment:
          "Integrate one form of the prompt's subject into one compatible letter of the exact word, keeping the word readable and the object recognizable.",
        color_and_tone:
          'Consistent contrast between word and object, color kept subordinate to reading.',
        lighting_and_shadow: 'Simple light on the object and crisp type sharing one baseline.',
        texture_and_material: 'The subject material kept and the other letters in a sober finish.',
        camera_and_composition:
          'At most one substitution per word, with a clear rhythm and baseline.',
        atmosphere_and_mood: 'Legible typographic wit, clever and quick to get.',
        rendering_and_quality: 'Crisp campaign type where the word reads without explanation.',
        key_features: 'one object letter; readable word; shared baseline; clever wit',
      },
      ['letters replaced by ambiguous objects', 'deformed product', 'wrong word', CLAIMS],
      [
        'In the word "LIGHT" the I is a real lighthouse casting its beam across the other letters, the poster of a lighthouse museum on a deep blue night.',
        'The word "DONUT" where the O is, of course, an actual donut with one bite missing, bright pink and very pleased with itself.',
        'A poster reading "MEND" where a stitched seam forms the M, the other letters calm, one ink.',
      ],
    ),
    V(
      'R-ADV-14',
      'Monochrome Accent Signals',
      'monochrome with one accent ad',
      'mono-accent',
      {
        aesthetic:
          'Monochrome Accent Signals: a concentrated tonal base leaves one structural color accent to point at the action or focus.',
        subject_treatment:
          "Keep the prompt's image in one tonal base and reserve a single structural color accent for its focus or action, the copy exact.",
        color_and_tone: 'Functional monochrome with one limited accent area, brand colors kept.',
        lighting_and_shadow: 'Coherent light and controlled contrast across the tonal image.',
        texture_and_material: 'Sober finish, subordinate material detail and clean-edged text.',
        camera_and_composition:
          'The color focus tied to the message, strong hierarchy and calm regions.',
        atmosphere_and_mood:
          'Contained intensity and attention directed precisely to one single point.',
        rendering_and_quality: 'Clean campaign image where the accent points at something real.',
        key_features: 'tonal base; one accent; directed attention; exact copy',
      },
      ['decorative red', 'monochrome erasing the brand', 'color as the only call', CLAIMS],
      [
        'A blood-donation campaign in deep greys where only one small red drop is in color, falling toward an open hand, copy "ONE IS ENOUGH".',
        'An ad for a lost-and-found office, a grey mountain of forgotten umbrellas with one bright yellow one, copy "IT\'S STILL HERE".',
        'A creative tool poster in soft greys with one violet shape marking the opening gesture, copy "MAKE ROOM".',
      ],
    ),
    V(
      'R-ADV-15',
      'Layered Evidence Panels',
      'layered evidence explainer ad',
      'evidence-panels',
      {
        aesthetic:
          'Layered Evidence Panels: image, supplied data and anchored notes arranged in readable layers that separate what is seen from what is claimed.',
        subject_treatment:
          "Separate the prompt's image, the supplied data and anchored notes into readable layers, every number and word exact and nothing invented.",
        color_and_tone: 'Colors by evidence role, redundant cues and clear text contrast.',
        lighting_and_shadow: 'Image light preserved and flat graphic layers on top.',
        texture_and_material:
          'Clean edges, minimal tints and visible references only where they exist.',
        camera_and_composition:
          'Main image, data in its own block and notes anchored without crossings.',
        atmosphere_and_mood: 'Argumentative clarity and sobriety, calm, honest and trustworthy.',
        rendering_and_quality: 'Clean explainer where every figure links to supplied data.',
        key_features: 'layered evidence; anchored notes; data block; nothing invented',
      },
      ['invented statistics', 'fake testimonials', 'design mimicking certification', CLAIMS],
      [
        'A museum campaign for a newly found sea-monster skeleton: the bones photographed, three anchored notes "jaw", "fin" and "tail" and the line "WHAT WE KNOW SO FAR".',
        'An ad for a cat hotel presenting exhaustive evidence that the cat was happy, notes "ate", "slept" and "ignored staff", copy "PROOF OF HAPPINESS".',
        'A banner comparing three samples A, B and C with the line "COMPARE BEFORE YOU CHOOSE", demonstration labels only.',
      ],
    ),
    V(
      'R-ADV-16',
      'Quiet Product Tension',
      'subtle offset tension ad',
      'quiet-tension',
      {
        aesthetic:
          'Quiet Product Tension: one small offset, gap or unexpected alignment creates interest with very few elements.',
        subject_treatment:
          "Create interest around the prompt's subject with one small, understandable offset or alignment, very few elements and the copy exact.",
        color_and_tone: 'Sober palette with one optional accent and the product colors kept.',
        lighting_and_shadow: 'Broad light and coherent contact shadows, calm and even.',
        texture_and_material: 'Clean materials with moderate detail and a quiet finish.',
        camera_and_composition: 'One subject and one clear spatial tension, copy in a calm zone.',
        atmosphere_and_mood: 'Contained expectation and precision, like holding a breath.',
        rendering_and_quality: 'Polished minimal image where the tension lives in the geometry.',
        key_features: 'one small offset; few elements; calm copy zone; held breath',
      },
      ['random offset', 'unstable object with no intent', 'empty composition with no idea', CLAIMS],
      [
        'A campaign for a tightrope-walking school: one shoe placed a single centimeter off a perfectly straight line, copy "ALMOST", a huge silent drop implied below.',
        'An ad for a picture-framing shop, one frame hanging very slightly crooked in an otherwise perfect gallery wall, copy "THIS IS KILLING YOU, ISN\'T IT".',
        'Two desk pieces almost touching along complementary edges, copy "ONE STEP FROM FITTING", charcoal and cream.',
      ],
    ),
    V(
      'R-ADV-17',
      'Responsive Campaign Grid',
      'multi-format campaign adaptation profile',
      'responsive-campaign',
      {
        aesthetic:
          'Responsive Campaign Grid: one campaign adapted to wide, square and tall formats, keeping hierarchy and anchors by reorganizing rather than cropping.',
        subject_treatment:
          "Adapt the prompt's campaign to wide, square and tall formats side by side, reorganizing title, image and action with every word exact.",
        color_and_tone: 'The same color roles and exact text in every format.',
        lighting_and_shadow:
          'Consistent image and lighting conditions across all three of the formats.',
        texture_and_material: 'Source artwork and materials kept, with no new images to fill gaps.',
        camera_and_composition:
          'Title, image and action zones that reflow within declared margins.',
        atmosphere_and_mood: 'Campaign continuity and instant reading across every format.',
        rendering_and_quality: 'No format loses copy, brand or the required action.',
        key_features: 'three formats; reflowed zones; same hierarchy; exact copy',
      },
      ['cropped text', 'distorted logo', 'changed hierarchy with no reason', CLAIMS],
      [
        'The campaign "THE DRAGONS ARE BACK" for a fantasy film festival adapted to a wide banner, a square post and a tall poster, the dragon, title and "Get tickets" reorganized in each.',
        'The campaign "NOBODY LIKES MONDAYS" for a coffee brand in three formats, the same sleepy mug and copy rearranged each time, every word intact.',
        'A show campaign "OPEN FORMS" with the action "See the collection" in wide, square and tall formats, same spacing rule.',
      ],
      'profile',
    ),
    V(
      'R-ADV-18',
      'Three-Act Launch Sequence',
      'teaser reveal detail sequence profile',
      'three-act-launch',
      {
        aesthetic:
          'Three-Act Launch Sequence: a teaser, a reveal and a detail piece shown side by side, the same subject and system across all three.',
        subject_treatment:
          "Show the prompt's campaign as three pieces, teaser, reveal and detail, the same subject and geometry throughout and each act's copy exact.",
        color_and_tone: 'A coherent palette whose contrast grows from act to act.',
        lighting_and_shadow: 'Common light or one declared change that keeps the subject identity.',
        texture_and_material: 'Constant materials and geometry across the three pieces.',
        camera_and_composition:
          'Three pieces in a row, each act with a clear role linked to the next.',
        atmosphere_and_mood:
          'Progression and discovery, with suspense slowly turning into delight.',
        rendering_and_quality:
          'The revealed subject matches the teaser and the detail belongs to it.',
        key_features: 'teaser, reveal, detail; same subject; growing contrast; three acts',
      },
      ['different product per act', 'misleading teaser', 'claims added at the reveal', CLAIMS],
      [
        'A launch for a giant mechanical whale ride: teaser shows only one riveted eye "SOMETHING IS WAKING", reveal shows the whole whale "IT\'S HERE", detail shows the saddle "COME ABOARD".',
        'A three-act launch for a new chair: teaser "IT\'S COMING", reveal "IT\'S A CHAIR", detail "IT\'S STILL A CHAIR", the same modest chair every time.',
        'A notebook launch: teaser of the spine "ONE IDEA", full notebook "TAKES SHAPE", page detail "BEGIN", same palette.',
      ],
      'profile',
    ),
    V(
      'R-ADV-19',
      'Image-Copy Lockup Study',
      'image and copy lockup comparison profile',
      'lockup-study',
      {
        aesthetic:
          'Image-Copy Lockup Study: three layouts of the same image and exact copy compared side by side, only the relationship between them changing.',
        subject_treatment:
          "Compare three lockups of the prompt's image and exact copy, title above, beside and in the open space, with image and words unchanged.",
        color_and_tone: 'The same color roles and comparable contrast in each lockup.',
        lighting_and_shadow: 'Constant image light across the three, with flat, sharp typography.',
        texture_and_material: 'Locked artwork and consistent type, only the composition varying.',
        camera_and_composition:
          'Three lockups with different anchors, clear margins and equal hierarchy.',
        atmosphere_and_mood:
          'A controlled editorial exploration that stays calm, careful and comparative.',
        rendering_and_quality: 'Every version keeps all words, punctuation and brand elements.',
        key_features: 'three lockups; same image and copy; different anchors; equal hierarchy',
      },
      ['shortened copy', 'changed image', 'difference based only on size', CLAIMS],
      [
        'Three lockups of a lone astronaut on a red dune with the exact copy "THE FIRST FOOTPRINT", title above, beside and set into the empty sky.',
        'Three lockups of a very dramatic photo of a potato with the copy "MEET YOUR NEW HERO", each more serious than the last.',
        'Three lockups of a three-part object with the copy "SEE HOW IT FITS", same scale and light.',
      ],
      'profile',
    ),
    V(
      'R-ADV-20',
      'Material Transformation Sequence',
      'material change keyframe sequence profile',
      'material-transformation',
      {
        aesthetic:
          'Material Transformation Sequence: the same form shown in three stages as it turns from one material into another, shape and copy intact.',
        subject_treatment:
          "Show the prompt's subject in three stages of one material transformation, with the same framing, matching points and exact copy.",
        color_and_tone: 'Palette evolving with the material while brand colors stay protected.',
        lighting_and_shadow: 'Coherent light between stages with explicit optical changes only.',
        texture_and_material: 'Defined start, middle and end materials, one clean transformation.',
        camera_and_composition:
          'The same framing across three stages with persistent matching points.',
        atmosphere_and_mood: 'A clear transformation and a material surprise, almost magical.',
        rendering_and_quality:
          'Geometry and copy survive every stage unless a change is authorized.',
        key_features: 'three stages; one material change; same framing; matching points',
      },
      [
        'morph that replaces the subject',
        'unrelated materials',
        'sequence shown as finished video',
        CLAIMS,
      ],
      [
        'A campaign for an alchemy-themed chocolate: the same small crown shown as lead, then cracking, then solid gold, copy "EVERYTHING CAN CHANGE".',
        'A paper boat shown as paper, soggy paper and then steel battleship in three frames, copy "UPGRADE", ridiculous and proud.',
        'A paper form turning into ceramic in three calm stages with the same opening kept, copy "ONE FORM, NEW MATTER".',
      ],
      'profile',
    ),
  ],
};

export default spec;
