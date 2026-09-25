import type { Spec } from '../tools/apply';
import { design } from './_design';

// Packaging & label design (part B): R-PKG-11..15 styles, R-PKG-16/17 opening and insert profiles, and the
// peel-reveal, shelf-family and finish-separation recipes as sheet profiles.
const K = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
  kind: 'style' | 'profile' = 'style',
) => design(name, domain, tag, 'packaging', fields, avoid, briefs, { text: true, source, kind });

const NO_CLAIMS = 'invented ingredients, certifications or legal text';

const spec: Spec = {
  pack: 'pack_25',
  category: '7. Packaging & Label Design',
  updates: {},
  creates: [
    K(
      'R-PKG-11',
      'Transparent Layer Registers',
      'layered transparent sleeve packaging',
      'transparent-layer',
      {
        aesthetic:
          'Transparent Layer Registers: printed transparent layers line up over an inner box so the parts complete one image together.',
        subject_treatment:
          "Align printed elements on a transparent sleeve and an inner box so the prompt's package reads as one combined image, the name kept exact on one opaque layer.",
        color_and_tone:
          'Values and colors that separate layers and overlaps, with text kept fully legible.',
        lighting_and_shadow: 'Soft light with contained reflections on the transparent surfaces.',
        texture_and_material:
          'Thin clear layers with declared transparency and a checkable register.',
        camera_and_composition:
          'Layers shown together and apart, the main reading stable on one layer.',
        atmosphere_and_mood: 'Discovery through overlap and precision, clever and satisfying.',
        rendering_and_quality:
          'Each layer holds defined content and the overlap never invents letters.',
        key_features: 'transparent sleeve; inner box; combined image; exact name layer',
      },
      [
        'text illegible when overlapped',
        'impossible register',
        'transparency with no function',
        NO_CLAIMS,
      ],
      [
        'A box for "SKELETON KEY" chocolates: a clear sleeve printed with bones slides over a box printed with a ghost, and together they form a full skeleton, the name exact on the opaque box.',
        'A transparent sleeve for "INVISIBLE", a brand of socks, that shows only a pair of feet when it slides over the box, delightfully pointless.',
        'Packaging for "BETWEEN LINES" notebooks, a clear front layer with index A that completes a band motif on the inner box, minimal reflections.',
      ],
    ),
    K(
      'R-PKG-12',
      'Patchwork Information Panels',
      'modular info panel packaging',
      'patchwork-panels',
      {
        aesthetic:
          'Patchwork Information Panels: information blocks of different scales assembled under shared rules of margin, alignment and type.',
        subject_treatment:
          "Assemble the prompt's supplied information into blocks of different scales under constant margins, alignment and type; keep every word exact.",
        color_and_tone:
          'A few role-based color fields with enough contrast for text in every block.',
        lighting_and_shadow: 'Flat design and neutral presentation light with every panel crisp.',
        texture_and_material: 'Even ink, precise edges and texture-less reading areas.',
        camera_and_composition: 'One dominant panel with secondary blocks articulated around it.',
        atmosphere_and_mood: 'Organized editorial richness and a sense of one designed whole.',
        rendering_and_quality:
          'Every panel shares one margin logic and no information is repeated.',
        key_features: 'modular panels; shared margins; one dominant block; role colors',
      },
      ['ornamental patchwork', 'redundant blocks', 'low contrast in one panel', NO_CLAIMS],
      [
        'A seed box for "APOCALYPSE GARDEN", survival seeds for the end of the world: a big name panel and small panels "Grows anywhere" and "Series 02", charcoal, coral and cream.',
        'Packaging for "MODULAR SOUP" where each flavor panel is a different size depending on how much the family likes it, with "Tomato" winning by a mile.',
        'A study-card box named "LIVING ARCHIVE" with a title panel, index A and the line "Note, sort, review", one shared grid.',
      ],
    ),
    K(
      'R-PKG-13',
      'Cut-Paper Shelf Graphics',
      'flat cut-shape family packaging',
      'cut-paper-shelf',
      {
        aesthetic:
          'Cut-Paper Shelf Graphics: big flat cut-out silhouettes and color fields build a product family that reads from across the aisle.',
        subject_treatment:
          "Build the prompt's product family from large flat cut-out silhouettes and fields, one per variant, with the name kept exact and in the same place.",
        color_and_tone: 'Two or three well-separated colors, the main figure clear in greyscale.',
        lighting_and_shadow:
          'Flat graphic cut shapes on a neutral board, printed rather than collaged.',
        texture_and_material:
          'Deliberately simple edges, clean and flat like freshly printed paper.',
        camera_and_composition:
          'One big motif and a stable name, the cut shapes continuing onto the sides.',
        atmosphere_and_mood: 'Graphic energy and strong shelf presence, bold and friendly.',
        rendering_and_quality: 'The main silhouette reads even as a tiny shelf thumbnail.',
        key_features: 'big cut silhouettes; flat fields; shelf readability; stable name',
      },
      ['tiny cut-outs', 'collage with no hierarchy', 'color as the only difference', NO_CLAIMS],
      [
        'Three cereal boxes for "MOON BEAST", each with one giant cut-out creature, a bat, a wolf and an owl, flat bold colors that shout from across the aisle.',
        'A family of three toilet-paper packs named "CLOUD", "STORM" and "TORNADO", each with one huge cut cloud shape growing more worried.',
        'Notebook covers "DAWN", "SHADE" and "BREEZE", each one large abstract cut shape, coral, blue and cream, the name always in the same corner.',
      ],
    ),
    K(
      'R-PKG-14',
      'Serial Number Rhythm',
      'index number rhythm packaging',
      'serial-rhythm',
      {
        aesthetic:
          'Serial Number Rhythm: typographic sequences and indexes structure the identity like a numbered collection, never like real shipping labels.',
        subject_treatment:
          "Use the prompt's supplied numbers and indexes as a typographic rhythm across the range, the name small but legible and every number exact.",
        color_and_tone: 'One dominant ink with a sequence accent and a clear name hierarchy.',
        lighting_and_shadow: 'Neutral reading light on a calm, evenly lit board.',
        texture_and_material: 'Crisp ink on sober stock with typography as the only ornament.',
        camera_and_composition:
          'The sequence organizes the layout while the main information stays fixed.',
        atmosphere_and_mood: 'Collector rhythm and precision, the pleasure of a numbered set.',
        rendering_and_quality:
          'Every number matches the supplied data and never reads as a quantity or claim.',
        key_features: 'giant index numbers; numbered set; small name; one ink',
      },
      ['invented numbers', 'fake logistics code', 'serial turned into a claim', NO_CLAIMS],
      [
        'A numbered set of spell-ingredient jars for "GRIMOIRE PANTRY", huge numerals 01, 02 and 03 forming a rhythm across the shelf, black and coral.',
        'Boxes for "SOCK 1", "SOCK 2" and "SOCK 3", a brand that sells socks one at a time so you can never lose a pair, giant numbers, deadpan.',
        'Three archive sleeves for "RECORD" with indexes 7, 8 and 9 set large and asymmetric, one ink and exact titles.',
      ],
    ),
    K(
      'R-PKG-15',
      'Embossed Void Identity',
      'blind emboss and void packaging',
      'embossed-void',
      {
        aesthetic:
          'Embossed Void Identity: broad blind embossing and wide empty areas alternate with tiny areas of ink to rank the brand.',
        subject_treatment:
          "Build the prompt's package identity from broad blind embossing, open voids and small areas of ink, the exact name printed clear of the relief.",
        color_and_tone:
          'An even substrate value with high-contrast ink on the essential information.',
        lighting_and_shadow:
          'Soft raking light on the finish view and a clean frontal control view.',
        texture_and_material: 'Broad-edged conceptual relief with plain, smooth board around it.',
        camera_and_composition:
          'Dominant relief motif kept apart from critical text, with resting space.',
        atmosphere_and_mood: 'Tactile discretion and presence, quiet, rich and quietly confident.',
        rendering_and_quality:
          'Essential information stays readable even when the relief is not visible.',
        key_features: 'blind emboss; wide voids; tiny ink areas; raking light view',
      },
      [
        'relief over small text',
        'invisible finish as the only mark',
        'claimed manufacturing',
        NO_CLAIMS,
      ],
      [
        'A box for "SILENCE", headphones for monks, almost entirely blank with one huge blind-embossed closed eye and the tiny name in black ink.',
        'A gift box for "NOTHING", the perfect present for people who want nothing, a big embossed void and the small line "Contents: nothing".',
        'A notebook sleeve named "TRACE" with one simple relief beside the exact title, cream and blue ink under soft raking light.',
      ],
    ),
    K(
      'R-PKG-16',
      'Tear-Line Narratives',
      'tear-open reveal package profile',
      'tear-line',
      {
        aesthetic:
          'Tear-Line Narratives: one planned tear line splits the package into a before and an after, each with its own complete message.',
        subject_treatment:
          "Plan one tear line through the prompt's package so the outside message stays whole and an inside message appears on opening; keep both texts exact.",
        color_and_tone: 'Colors that separate outside from inside while one shared identity holds.',
        lighting_and_shadow: 'Neutral light and matching views to review the opening sequence.',
        texture_and_material:
          'A clear conceptual tear line, coherent board and plausible torn edges.',
        camera_and_composition: 'Closed and opened views, the reveal placed away from torn zones.',
        atmosphere_and_mood: 'Deliberate sequential discovery, a small moment of theatre.',
        rendering_and_quality: 'Opening never destroys text that still matters afterwards.',
        key_features: 'planned tear line; before and after; intact outer message; inside reveal',
      },
      ['impossible opening', 'essential text torn', 'invented inner message', NO_CLAIMS],
      [
        'A box that says "DO NOT OPEN" on the outside and, once torn along its line, "TOO LATE" inside, deep red and black, closed and opened views.',
        'A birthday-cake candle box reading "MAKE A WISH" that tears open to reveal "NO REFUNDS ON WISHES", cheerful and cruel.',
        'A notebook sleeve reading "FIRST PAGE" whose tear strip reveals "BEGIN" while the name stays on the kept part, two inks.',
      ],
      'profile',
    ),
    K(
      'R-PKG-17',
      'Collector Insert Architecture',
      'unboxing insert layout profile',
      'collector-insert',
      {
        aesthetic:
          'Collector Insert Architecture: trays, layers and small cards arranged as a sequence of discovery from lid to last piece.',
        subject_treatment:
          "Arrange the prompt's supplied pieces into trays, layers and cards as a discovery sequence from outside to inside, every piece counted and titled exactly.",
        color_and_tone: 'One shared palette with an accent on the current piece.',
        lighting_and_shadow: 'Soft even light between levels with every piece in plain view.',
        texture_and_material:
          'Sober materials, coherent thickness and gaps that explain each piece.',
        camera_and_composition:
          'Outside-to-inside sequence at a stable scale with visible finger grips.',
        atmosphere_and_mood: 'A contained ritual of discovery, careful and exciting.',
        rendering_and_quality: 'Every piece has a clear function and a place to return to.',
        key_features: 'layered trays; discovery sequence; counted pieces; finger grips',
      },
      ['invented contents', 'impossible trays', 'pieces that change size', NO_CLAIMS],
      [
        'The collector box for "THE LOST EXPEDITION", a board game: lid, map tray, three sealed envelopes "I", "II" and "III" and a final compass, all in one unboxing sequence.',
        'A luxury insert box for one single potato, three layers of trays and a card reading "YOUR POTATO", absurdly ceremonial.',
        'A paper kit named "LAYERS" with three study envelopes and one card reading "Begin", trays revealing each in turn.',
      ],
      'profile',
    ),
    K(
      'R-PKG-18',
      'Peel-Reveal Sequence',
      'peel-back reveal sequence profile',
      'peel-reveal',
      {
        aesthetic:
          'Peel-Reveal Sequence: three views of one label, whole, half peeled and removed, revealing a message underneath with the same artwork kept.',
        subject_treatment:
          "Show the prompt's label in three states, complete, corner peeled and removed to reveal the inner message, keeping artwork and text identical.",
        color_and_tone: 'Colors kept across states, the reveal adding contrast only underneath.',
        lighting_and_shadow: 'Constant light and minimal reflections to compare alignment.',
        texture_and_material: 'A label of coherent thickness and a believable conceptual peel.',
        camera_and_composition:
          'Three states with a shared camera and scale and one clear peel edge.',
        atmosphere_and_mood: 'Precise reveal and continuity, a small secret uncovered.',
        rendering_and_quality:
          'The peeled layer keeps its art and the inside is identical in every view.',
        key_features: 'three peel states; same camera; hidden message; kept artwork',
      },
      ['rewritten text', 'layer that vanishes', 'different inside in each view', NO_CLAIMS],
      [
        'A jar label for "MYSTERY PICKLES" shown whole, half peeled and removed, revealing the word "BEWARE" printed on the glass underneath.',
        'A banana sticker reading "PEEL ME" that peels back to say "NOT LIKE THAT", three states, same camera.',
        'A study card with a removable cover, "LAYER A" outside and "LAYER B" inside, three clear states and the same scale.',
      ],
      'profile',
    ),
    K(
      'R-PKG-19',
      'Shelf Family Comparison',
      'product family shelf comparison profile',
      'shelf-family',
      {
        aesthetic:
          'Shelf Family Comparison: a whole product family shown front-on at one scale, same hierarchy and light, to judge how well the variants stand apart.',
        subject_treatment:
          "Show the prompt's product variants side by side at one scale with one shared hierarchy, names and codes exact, plus a small shelf-distance view.",
        color_and_tone: 'Family palette with redundant names and codes per variant.',
        lighting_and_shadow: 'Identical light and exposure across the whole family.',
        texture_and_material: 'Same materials and finishes so only the graphics change.',
        camera_and_composition:
          'Fronts at equal scale and distance with one shelf-thumbnail control.',
        atmosphere_and_mood: 'Recognizable kinship and an easy choice between variants.',
        rendering_and_quality: 'Each variant keeps its own data and reads without the small text.',
        key_features: 'equal-scale fronts; shared hierarchy; shelf thumbnail; exact names',
      },
      ['identical variants', 'changed data', 'different scales between products', NO_CLAIMS],
      [
        'A shelf lineup of five potion bottles for "WITCH & SONS", "Love", "Luck", "Revenge", "Sleep" and "Oops", same label system, equal scale and one small shelf view.',
        'A lineup of three hot sauces for "MILD", "HOT" and "CALL A DOCTOR", identical hierarchy, the labels growing more alarmed.',
        'Three stationery boxes with short, medium and long names shown at the same scale, in color and in grey.',
      ],
      'profile',
    ),
    K(
      'R-PKG-20',
      'Finish Separation Preview',
      'print finish separation sheet profile',
      'finish-separation',
      {
        aesthetic:
          'Finish Separation Preview: one package artwork shown with its ink, embossing and special-finish areas separated into aligned preview layers.',
        subject_treatment:
          "Show the prompt's package artwork as a composite plus aligned separate layers for ink, relief and finish, every shape and word kept exact.",
        color_and_tone:
          'Technical flat colors for each layer, the composite keeping approved colors.',
        lighting_and_shadow:
          'A finish view under fitting light and a flat control view for geometry.',
        texture_and_material:
          'Finishes presented as a visual simulation, clearly separated by layer.',
        camera_and_composition:
          'Composite and separations aligned in a row with layer names outside.',
        atmosphere_and_mood:
          'Conceptual production clarity, orderly, calm and genuinely informative.',
        rendering_and_quality: 'Layers never overlap by accident or cover critical text.',
        key_features: 'separated finish layers; aligned composite; flat control view; exact shapes',
      },
      [
        'invented layers',
        'finish over critical letters',
        'simulation shown as print-ready file',
        NO_CLAIMS,
      ],
      [
        'A finish preview for a whisky box called "DRAGON RESERVE": composite, black ink layer, embossed dragon layer and gold foil flame layer, aligned in a row.',
        'Separations for a birthday card box reading "YOU ARE OLD", ink, glitter and embossing layers laid out as seriously as a bank note.',
        'Two finish options for the same notebook sleeve, ink and relief kept identical, shown under the same light with flat controls.',
      ],
      'profile',
    ),
  ],
};

export default spec;
