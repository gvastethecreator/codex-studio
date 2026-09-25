import type { Spec } from '../tools/apply';
import { design } from './_design';

// Editorial & publication design (part B): R-EDT-11..16 styles, R-EDT-17/18 facing-page and foldout profiles,
// and the eight-page rhythm and book-object recipes as sequence profiles.
const E = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
  kind: 'style' | 'profile' = 'style',
) => design(name, domain, tag, 'editorial', fields, avoid, briefs, { text: true, source, kind });

const FAKE = 'invented quotes, authors or data';

const spec: Spec = {
  pack: 'pack_25',
  category: '11. Editorial & Publication Design',
  updates: {},
  creates: [
    E(
      'R-EDT-11',
      'Schematic Editorial Plates',
      'explanatory diagram plate layout',
      'schematic-plate',
      {
        aesthetic:
          'Schematic Editorial Plates: diagrams, images and notes combined into explanatory plates with clearly defined levels of information.',
        subject_treatment:
          "Combine the prompt's diagram, image and notes into one explanatory plate with ranked levels, every callout pointing to a supplied part.",
        color_and_tone: 'Color roles for figure, reference and note, backed by shape and position.',
        lighting_and_shadow: 'Flat layout with figures keeping their declared light or projection.',
        texture_and_material: 'Clean strokes, clear image edges and sharp text on a calm page.',
        camera_and_composition:
          'Dominant main figure, linked details and notes clear of crossings.',
        atmosphere_and_mood: 'Analytical clarity and depth of reading, patient and precise.',
        rendering_and_quality: 'Crisp plate where every callout matches the supplied content.',
        key_features: 'explanatory plate; ranked levels; linked details; clean callouts',
      },
      ['invented diagrams', 'callouts to non-existent parts', 'decorative excess data', FAKE],
      [
        'A plate from "ANATOMY OF A DRAGON\'S NEST", a fantasy field guide, the nest drawn in section with callouts "EGG", "EMBER BED" and "GUARD POST", black and cream.',
        'A plate explaining "HOW THE OFFICE COFFEE MACHINE THINKS", a cutaway of a very judgmental machine with callouts "BEANS", "RESENTMENT" and "STEAM".',
        'A calm plate of a three-part object, base, body and lid, with three exact callouts and one joint detail.',
      ],
    ),
    E(
      'R-EDT-12',
      'Fragmented Grid Essays',
      'controlled grid-break essay layout',
      'fragmented-grid',
      {
        aesthetic:
          'Fragmented Grid Essays: one grid broken in a single controlled place for emphasis, reading alignments kept everywhere else.',
        subject_treatment:
          "Break the prompt's page grid in one deliberate place for emphasis, keeping the reading alignments, body text and every title exact.",
        color_and_tone: 'Sober palette with one accent at the break, the blocks left plain.',
        lighting_and_shadow: 'Flat design where the break is purely a layout decision.',
        texture_and_material: 'Clean edges and steady text with texture subordinate to the rhythm.',
        camera_and_composition:
          'One dominant break per opening or section, the grid recognizable around it.',
        atmosphere_and_mood: 'Editorial tension and emphasis, bold in the moment yet controlled.',
        rendering_and_quality:
          'Crisp spread where the rule and its one exception both read clearly.',
        key_features: 'one grid break; kept alignments; accent at break; readable rule',
      },
      ['accidental misalignment', 'many breaks', 'fragmented unreadable text', FAKE],
      [
        'An essay spread "OUT OF LINE" about a prison break, a two-column grid shattered by a single tall photo of an open cell door, everything else in strict order.',
        'A magazine page "THE ONE WHO DIDN\'T FOLLOW THE RULES" where a single photo of a goose breaks the perfect grid of calm ducks, coral accent.',
        'A notebook page with a long title and three samples, one sample spilling past the column for a clear reason.',
      ],
    ),
    E(
      'R-EDT-13',
      'Pocket-Scale Intimacy',
      'small-format intimate publication',
      'pocket-scale',
      {
        aesthetic:
          'Pocket-Scale Intimacy: compact pages with short texts and detail images, a close reading rhythm made for the hand.',
        subject_treatment:
          "Compose the prompt's publication at pocket scale with short texts, one clear detail per page and generous margins, the title exact.",
        color_and_tone: 'High contrast and a reduced palette, with small text kept strong.',
        lighting_and_shadow: 'Flat layout with margins and gutter left clean.',
        texture_and_material: 'Clean type and a very discreet paper texture.',
        camera_and_composition:
          'Short columns, detail images and an intimate rhythm without micro text.',
        atmosphere_and_mood: 'Closeness and attention, like a notebook kept in a coat pocket.',
        rendering_and_quality:
          'Crisp small pages where all text stays legible at the declared size.',
        key_features: 'pocket format; short texts; one detail per page; intimate rhythm',
      },
      ['tiny text', 'thin margins', 'illegible detail', FAKE],
      [
        'A pocket booklet "FIELD NOTES FROM MARS" for a fictional colonist, one short entry and one small detail drawing per page, black on cream.',
        'A tiny booklet "SMALL COMPLAINTS" with one short grievance per page, "the kettle is slow", illustrated with one small sad detail.',
        'A pocket essay "AT THE EDGE" with one detail image and two short paragraphs, blue and bone.',
      ],
    ),
    E(
      'R-EDT-14',
      'Chromatic Section Coding',
      'color-coded section publication',
      'section-coding',
      {
        aesthetic:
          'Chromatic Section Coding: each section of the publication marked by one color and a redundant marker in a stable position.',
        subject_treatment:
          "Mark each section of the prompt's publication with one color plus a redundant shape marker and title in a stable place, every section name exact.",
        color_and_tone:
          'One color per section within a limited palette, titles carrying meaning without color.',
        lighting_and_shadow: 'Flat layout with constant source image light in every section.',
        texture_and_material: 'Clean ink and a sober support, the same finish for every section.',
        camera_and_composition: 'Markers in stable positions and section changes clearly flagged.',
        atmosphere_and_mood:
          'Orientation and continuity, varied sections that still share one identity.',
        rendering_and_quality: 'Crisp publication whose sections still read in greyscale.',
        key_features: 'section colors; redundant markers; stable positions; greyscale check',
      },
      ['color as the only signal', 'arbitrary palette', 'mixed section content', FAKE],
      [
        'A guidebook to a fictional haunted city with sections "CRYPTS", "TAVERNS" and "ESCAPE ROUTES", each with its own color and side marker, coral, blue and cream.',
        'A family recipe book coded by who is allowed to cook each dish, sections "ANYONE", "GRANDMA ONLY" and "NEVER AGAIN".',
        'A materials catalog with sections A, B and C, redundant codes and one shared page structure.',
      ],
    ),
    E(
      'R-EDT-15',
      'Bleed-and-Margin Counterpoint',
      'full-bleed and margin contrast layout',
      'bleed-margin',
      {
        aesthetic:
          'Bleed-and-Margin Counterpoint: full-bleed images set against tightly contained type areas, the contrast building hierarchy.',
        subject_treatment:
          "Set a full-bleed image of the prompt's subject against a contained type area, keeping points of interest off the trim and every title exact.",
        color_and_tone: 'Text on high-contrast areas, images keeping their source palette.',
        lighting_and_shadow: 'Original image light and a flat page with no added shadows.',
        texture_and_material: 'Clean full-bleed edges and a neutral support in reading areas.',
        camera_and_composition:
          'Image expansion alternating with contained text through clear anchors.',
        atmosphere_and_mood: 'Visual breadth and a reading pause, cinematic and calm.',
        rendering_and_quality: 'Crisp spread where no focal point falls into the trim or gutter.',
        key_features: 'full-bleed image; contained type; anchored caption; clear trim',
      },
      ['essential image cut', 'text over noise', 'bleed with no function', FAKE],
      [
        'A spread from "THE LAST GLACIER", a full-bleed photo of a collapsing ice wall on the left and a small contained text block on the right, one caption, black and cream.',
        'A travel magazine spread with a full-bleed photo of an endless airport queue and a tiny calm text block titled "PATIENCE, A GUIDE".',
        'A photography book spread titled "SURFACE", a full-bleed image of cracked desert earth on one page and a contained text column on the other, caption clear of the trim.',
      ],
    ),
    E(
      'R-EDT-16',
      'Modular Journal Entries',
      'flexible entry module layout',
      'modular-journal',
      {
        aesthetic:
          'Modular Journal Entries: repeatable entry modules that take short or long texts and optional images without losing their family look.',
        subject_treatment:
          "Build the prompt's journal from repeatable entry modules that stretch for short and long texts and optional images, every field and title exact.",
        color_and_tone: 'Common palette with one accent by status or section.',
        lighting_and_shadow: 'Flat layout with source image light preserved throughout.',
        texture_and_material: 'Clean surfaces, discreet dividers and consistent sharp type.',
        camera_and_composition:
          'Flexible-height modules with title, body and notes in stable places.',
        atmosphere_and_mood: 'A diary rhythm and continuity that never turns into identical cards.',
        rendering_and_quality: 'Crisp page where short and long entries keep all their fields.',
        key_features: 'entry modules; flexible height; stable fields; diary rhythm',
      },
      ['rigid heights', 'omitted content', 'uniform cards with no rhythm', FAKE],
      [
        'A page from "LOG OF THE NIGHT WATCH" on a ghost ship, three entries of very different length, one without any image, title exact, black on cream.',
        'A journal of a cat\'s demands kept by its owner, entries "BREAKFAST", "SECOND BREAKFAST" and "WHY IS THE DOOR CLOSED", flexible modules.',
        'A research journal "OPEN RECORD" with three entries, short, medium and long, and one blue accent.',
      ],
    ),
    E(
      'R-EDT-17',
      'Facing-Page Dialogue',
      'left-right page dialogue profile',
      'facing-dialogue',
      {
        aesthetic:
          'Facing-Page Dialogue: left and right pages given complementary jobs that talk to each other through anchors, scale or reference.',
        subject_treatment:
          "Give the prompt's left and right pages complementary jobs that answer each other through anchors or references, every word complete and exact.",
        color_and_tone:
          'One shared palette with weight differences marking the left and right roles.',
        lighting_and_shadow: 'Flat layout with both pages in the same even light.',
        texture_and_material: 'Coherent type and surfaces with source images unchanged.',
        camera_and_composition:
          'Left and right in dialogue by anchors or scale, symmetry optional.',
        atmosphere_and_mood:
          'Counterpoint and an editorial conversation, witty, balanced and clear.',
        rendering_and_quality: 'Crisp spread where each page adds different information.',
        key_features: 'facing pages; complementary roles; anchored dialogue; shared palette',
      },
      ['independent pages', 'decorative symmetry', 'repeated information', FAKE],
      [
        'A spread "THE HUNTER / THE HUNTED": a wolf photographed on the left page and a hare on the right, their eyes aligned across the gutter, one short text each.',
        'A spread "WHAT I ORDERED / WHAT ARRIVED", a perfect cake on the left and a collapsed mess on the right, captions exact.',
        'An opening with "LOOK" on the left and "MAKE" on the right, complete texts and one shared image by reference.',
      ],
      'profile',
    ),
    E(
      'R-EDT-18',
      'Foldout Atlas Structure',
      'foldout atlas layout profile',
      'foldout-atlas',
      {
        aesthetic:
          'Foldout Atlas Structure: a foldout that ties one overview to anchored detail panels and references in consistent positions.',
        subject_treatment:
          "Lay out the prompt's foldout with one wide overview and anchored detail panels, folds kept off the legend and every label exact.",
        color_and_tone: 'A common palette with redundant codes linking overview and details.',
        lighting_and_shadow: 'A flat main view plus a neutral folded presentation.',
        texture_and_material:
          'Conceptual stock with fold lines kept away from critical information.',
        camera_and_composition:
          'The overview on one wide panel with details anchored to exact regions.',
        atmosphere_and_mood: 'Informative expansion and discovery as the page opens.',
        rendering_and_quality: 'Crisp foldout where every detail matches one exact region.',
        key_features: 'wide overview; anchored details; folds off legend; exact labels',
      },
      ['invented details', 'zones with no correspondence', 'folds over the legend', FAKE],
      [
        'A foldout atlas of an invented underground kingdom, the overview in the center and two anchored enlargements of "THE CRYSTAL MINES" and "THE KING\'S VAULT".',
        'A foldout map of a toddler\'s bedroom drawn like a treasure atlas, details "BRICK MINEFIELD" and "SNACK CAVE" anchored to the overview, deadly serious.',
        'A three-panel foldout of an A-B-C system, general view in the center and two anchored details, legend clear of the folds.',
      ],
      'profile',
    ),
    E(
      'R-EDT-19',
      'Eight-Page Rhythm Trial',
      'eight-page publication sequence profile',
      'eight-page-trial',
      {
        aesthetic:
          'Eight-Page Rhythm Trial: one editorial system applied to eight page roles, cover, contents, opener, body, image, data, notes and back.',
        subject_treatment:
          "Lay out the prompt's publication as eight thumbnails, cover, contents, opener, body, image, data, notes and back, one system and the exact title.",
        color_and_tone: 'Constant color roles with legible contrast on dense and quiet pages.',
        lighting_and_shadow: 'Flat layout with source image light preserved in every image.',
        texture_and_material: 'Coherent type, edges and support across the whole sequence.',
        camera_and_composition:
          'Eight page thumbnails in two rows, each page role clearly different.',
        atmosphere_and_mood: 'A sustained publication rhythm rather than eight covers.',
        rendering_and_quality:
          'Crisp sequence where every page has a job and folios stay consistent.',
        key_features: 'eight page roles; one system; thumbnail rows; consistent folios',
      },
      ['missing page roles', 'invented content', 'inconsistent numbering', FAKE],
      [
        'Eight pages of a magazine called "SEA MONSTERS MONTHLY": cover, contents, opener, feature, full-page photo, data page, reader notes and back, in two rows.',
        'An eight-page zine "HOW TO LOSE AN ARGUMENT WITH A CAT", every page role present, the back page just a paw print.',
        'Eight pages of "FORMS IN RELATION", cover to back, one calm system in black and cream.',
      ],
      'profile',
    ),
    E(
      'R-EDT-20',
      'Book-Object Sequence',
      'book cover spine and interior profile',
      'book-object',
      {
        aesthetic:
          'Book-Object Sequence: the cover, spine and interior spreads of one book shown together with one consistent identity and geometry.',
        subject_treatment:
          "Show the prompt's book as cover, spine and two interior spreads with one identity and matching proportions, the title exact everywhere.",
        color_and_tone: 'A shared palette and type roles from outside to inside.',
        lighting_and_shadow: 'Flat artwork views and a soberly lit closed book.',
        texture_and_material: 'Coherent conceptual materials shown as a visual study.',
        camera_and_composition:
          'Cover, spine and pages with compatible proportions and protected text.',
        atmosphere_and_mood: 'Unity of object and reading, a book you want to open.',
        rendering_and_quality: 'Crisp set where title and structure match on every face.',
        key_features: 'cover, spine, spreads; one identity; matching proportions; exact title',
      },
      ['a different spine', 'invented pages', 'changed title', FAKE],
      [
        'The book "THE CARTOGRAPHER OF STORMS": cover with a spiral storm map, matching spine and two interior spreads of storm charts, one identity, closed book beside the flats.',
        'A book called "MY DOG WROTE THIS" shown as cover, chewed-looking spine and two spreads of increasingly chaotic dog wisdom, title exact.',
        'The book "OPEN RECORD": cover, spine and two openings sharing one index system, black and cream.',
      ],
      'profile',
    ),
  ],
};

export default spec;
