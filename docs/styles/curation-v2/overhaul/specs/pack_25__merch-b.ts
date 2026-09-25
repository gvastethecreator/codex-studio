import type { Spec } from '../tools/apply';
import { design } from './_design';

// Apparel & merchandise graphics (part B): R-MER-11..15 styles, R-MER-16/17 finish modifiers, R-MER-18 placement
// profile, and the size-range and flat-art pair recipes as sheet profiles.
const G = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
  kind: 'style' | 'modifier' | 'profile' = 'style',
) => design(name, domain, tag, 'apparel', fields, avoid, briefs, { text: true, source, kind });

const CUT = 'changed garment cut or seams';

const spec: Spec = {
  pack: 'pack_25',
  category: '14. Apparel & Merchandise Graphics',
  updates: {},
  creates: [
    G(
      'R-MER-11',
      'Deconstructed Uniform Lines',
      'open uniform-line graphic print',
      'deconstructed-uniform',
      {
        aesthetic:
          "Deconstructed Uniform Lines: organizing lines borrowed from uniforms, shifted, opened and recombined around the garment's existing features.",
        subject_treatment:
          "Print open organizing lines that shift around the prompt's garment features like pockets, shoulders and hem, never becoming new seams or real insignia.",
        color_and_tone:
          'Neutral base and one localized accent, with no rank or safety color codes.',
        lighting_and_shadow: 'Flat or evenly lit, shadows never faking pockets or flaps.',
        texture_and_material:
          'Line graphics and small blocks clearly distinct from the garment build.',
        camera_and_composition:
          'Aligned with existing shoulders, pocket and hem, with deliberate breaks.',
        atmosphere_and_mood:
          'A deliberately incomplete order that feels sober, calm and functional.',
        rendering_and_quality: 'Clean print with legible lines and the cut left intact.',
        key_features: 'shifted uniform lines; deliberate breaks; existing features; sober accent',
      },
      ['real ranks', 'invented pockets', 'look of certified protective gear', CUT],
      [
        'A workshirt for the mechanics of an airship fleet, printed lines framing the chest pocket slightly off-center and breaking at the collar, one small marker "A", dark ink.',
        'A tee where printed pocket outlines appear everywhere except where a pocket would be useful, sober and quietly ridiculous.',
        'A canvas tote for a community workshop with shifted inventory lines that respond to its handles and side seams, silhouette and material left completely unchanged.',
      ],
    ),
    G(
      'R-MER-12',
      'Pocket-Frame Compositions',
      'pocket-anchored print composition',
      'pocket-frame',
      {
        aesthetic:
          'Pocket-Frame Compositions: existing pockets and openings used as anchors and frames for the print, never covered.',
        subject_treatment:
          "Anchor the prompt's print on the garment's real pocket or opening, using it as a partial frame while its opening stays free; keep any text exact.",
        color_and_tone: 'Main color contrasting with the fabric, the pocket keeping its own tone.',
        lighting_and_shadow: 'Mockup light that shows the real pocket depth.',
        texture_and_material: 'Flat art and support edge clearly separated at the pocket.',
        camera_and_composition:
          'Motif anchored at real pocket corners with margin left at the opening.',
        atmosphere_and_mood:
          'A clever but contained composition that lets the garment finish the idea.',
        rendering_and_quality: 'Clean print with registered anchors and a free opening.',
        key_features: 'pocket as frame; free opening; corner anchors; clever composition',
      },
      ['new pocket', 'covered opening', 'motif rescaled to hide a bad fit', CUT],
      [
        'A shirt where a printed dragon curls around the chest pocket as if guarding a treasure inside it, the pocket opening left completely free.',
        'A hoodie where a printed kangaroo looks very proudly at its own front pocket, which now reads as its pouch.',
        'A tote with a small "01" and one line growing from the lower corner of its pocket, margin kept.',
      ],
    ),
    G(
      'R-MER-13',
      'Hand-Drawn Metric Patterns',
      'hand-drawn count mark pattern',
      'hand-metric',
      {
        aesthetic:
          'Hand-Drawn Metric Patterns: slightly imperfect hand-drawn units that still keep an exact count and a declared code.',
        subject_treatment:
          "Draw the prompt's supplied quantities as hand-made marks, one per unit in declared groups, each mark worth the same and every number exact.",
        color_and_tone: 'Colors by class backed by symbols, ink variation never changing weight.',
        lighting_and_shadow: 'Flat art, the irregularity coming from the hand gesture alone.',
        texture_and_material: 'Hand strokes with limited variation and a comparable area per mark.',
        camera_and_composition: 'Groups by sequence or category with room left for the key.',
        atmosphere_and_mood: 'A human, repeatable rhythm with small local deviations.',
        rendering_and_quality: 'Clean print with countable complete marks and consistent values.',
        key_features: 'hand-drawn units; exact counts; grouped marks; human rhythm',
      },
      ['decorative quantities', 'partial units with no rule', 'invented biographical metrics', CUT],
      [
        'A prisoner-of-the-tower tee: 365 hand-scratched tally marks in groups of five climbing the whole back, the last one drawn with a tiny triumphant flourish.',
        'A tote counting "DAYS WITHOUT LOSING KEYS" in hand-drawn marks, exactly three, followed by a long empty space.',
        'A calm tee with 12 hand-drawn strokes grouped in fours and the key "1 stroke = 1 unit".',
      ],
    ),
    G(
      'R-MER-14',
      'Modular Merch Families',
      'modular merch system',
      'modular-merch',
      {
        aesthetic:
          'Modular Merch Families: one vocabulary of shared pieces adapted to tees, totes and small objects with common weights and hierarchy.',
        subject_treatment:
          "Build the prompt's merch range from one small set of shared pieces, rearranged per product with the same proportions, and every word exact.",
        color_and_tone: 'A common palette with stable roles across every product.',
        lighting_and_shadow: 'Comparable, even presentation light on every product in the range.',
        texture_and_material:
          'Base art independent of material with finishes noted as application.',
        camera_and_composition:
          'Main and secondary pieces rearranged per product without stretching.',
        atmosphere_and_mood: 'A recognizable yet flexible family, varied by arrangement.',
        rendering_and_quality: 'Clean set with constant proportions and traceable pieces.',
        key_features: 'shared pieces; rearranged per product; common palette; exact words',
      },
      ['each product counted as a new style', 'redrawn symbols', 'logos distorted to fit', CUT],
      [
        'A merch range for a fictional band "THE DROWNED BELLS": an arch, a bell and a wave piece rearranged across a tee, a tote and a pin, every piece identical in shape.',
        'Merch for a cafe run by cats, "PURRCOLATOR", one paw, one cup and one tail piece rearranged on an apron, a mug and a sticker.',
        'A calm range for a publication "FORMS" using open frames and indexes on a cover, a tote and a tee.',
      ],
    ),
    G(
      'R-MER-15',
      'Contour-Wrap Lettering',
      'surface-following merch lettering',
      'contour-wrap',
      {
        aesthetic:
          'Contour-Wrap Lettering: exact lettering distributed along a real contour of the product, letters and spaces adjusted rather than stretched.',
        subject_treatment:
          "Run the requested words along an authorized curve of the prompt's product, adjusting spacing instead of stretching letters, every character and accent exact.",
        color_and_tone: 'Constant contrast between letters and base along the whole path.',
        lighting_and_shadow: 'Flat lettering art kept separate from the lit mockup.',
        texture_and_material: 'Crisp letter edges and an even finish, the source art unchanged.',
        camera_and_composition: 'A declared start, direction and end, with no key letter hidden.',
        atmosphere_and_mood: 'A wrapping reading with pauses at each change of plane.',
        rendering_and_quality:
          'Clean lettering with the whole word intact in flat and applied views.',
        key_features: 'curve-following word; adjusted spacing; flat art; exact characters',
      },
      ['inverted text', 'stretched letters', 'final art taken from a distorted photo', CUT],
      [
        'The words "THE LAST VOYAGE" arching across the back of a sailor\'s jacket like the curve of a hull, flat art beside the applied view.',
        'A mug where the word "MONDAYYYYY" wraps all the way around, the Ys running out of room right at the handle.',
        'The words "OPEN ARCHIVE" following an arch on the back of a tee, rhythm by spacing, flat template shown too.',
      ],
    ),
    G(
      'R-MER-16',
      'Faded Ink Finish',
      'worn print finish modifier',
      'faded-ink',
      {
        aesthetic:
          'Faded Ink Finish: a modifier that reduces ink coverage in a controlled way, like a well-loved print, while silhouette and message stay intact.',
        subject_treatment:
          "Reduce the ink coverage of the prompt's existing print in controlled areas, protecting its outline, letters and key counters exactly.",
        color_and_tone: 'Original colors kept, wear only thinning coverage on the same fabric.',
        lighting_and_shadow: 'The same presentation light for original and finished print.',
        texture_and_material:
          'Controlled ink loss tied to coverage, never holes that change characters.',
        camera_and_composition: 'Geometry and placement locked, small letters in protected zones.',
        atmosphere_and_mood: 'Sober, believable wear with a warm vintage feeling.',
        rendering_and_quality: 'Clean finish with a separate wear mask and recoverable outlines.',
        key_features: 'controlled ink loss; protected letters; locked placement; vintage wear',
      },
      ['durability claims', 'stains outside the ink', 'holes in the fabric', CUT],
      [
        'The print "WORLD TOUR 1987" of a fictional glam-rock band given a faded ink finish on a black tee, every letter still readable after thirty imaginary years.',
        'A proud print reading "WORLD\'S OKAYEST DAD" faded as if it has been washed a thousand times, the word "OKAYEST" perfectly preserved.',
        'A small wordmark reading "SERIES 01" on a grey sweatshirt, given light wear inside its widest masses while the zero and the one stay perfectly protected.',
      ],
      'modifier',
    ),
    G(
      'R-MER-17',
      'Embroidery Relief Finish',
      'embroidery relief finish modifier',
      'embroidery-relief',
      {
        aesthetic:
          'Embroidery Relief Finish: a modifier that turns existing flat artwork into raised apparent embroidery, geometry and letters unchanged.',
        subject_treatment:
          "Give the prompt's existing artwork a raised embroidery look with thread following its masses and stems, keeping its outline and exact letters.",
        color_and_tone: 'Artwork colors kept as thread colors, shading only changing local value.',
        lighting_and_shadow: 'Soft consistent side light with moderate sheen on the thread.',
        texture_and_material: 'Contained relief, coherent stitch direction and clean edges.',
        camera_and_composition: 'Position, scale and crop locked, thread kept out of reserves.',
        atmosphere_and_mood: 'Clear, contained tactility that never competes with the meaning.',
        rendering_and_quality: 'Clean finish with the silhouette preserved and letters exact.',
        key_features: 'raised thread; stitch direction; locked outline; exact letters',
      },
      [
        'guaranteed production stitches',
        'altered lettering',
        'plastic shine hiding thread direction',
        CUT,
      ],
      [
        'The crest of a fictional mountain guild, a snow peak and a lantern, given a raised embroidery finish on a wool cap, outline and letters "HIGH PASS" unchanged.',
        'A tiny embroidered patch reading "WORLD\'S BEST NAPPER" with thread flowing along each letter, dignity fully intact.',
        'Three flat icons, folder, bell and magnifier, given a calm embroidery finish at the same scale.',
      ],
      'modifier',
    ),
    G(
      'R-MER-18',
      'Front-Back Placement Layout',
      'front and back placement profile',
      'front-back',
      {
        aesthetic:
          'Front-Back Placement Layout: related artwork placed on the front and back of one garment with measured anchors and verifiable scales.',
        subject_treatment:
          "Place the prompt's front and back artwork on the same garment by measured anchors from collar, center and hem, each piece and orientation exact.",
        color_and_tone: 'An inherited palette shared by both the front and the back.',
        lighting_and_shadow: 'Both views shown in comparable, even light and at the same scale.',
        texture_and_material: 'Art and placement guides kept apart, the fabric unchanged.',
        camera_and_composition: 'Front and back flats side by side with anchor distances.',
        atmosphere_and_mood: 'A clear relationship between two sides with different weights.',
        rendering_and_quality: 'Clean layout with one base silhouette and exact texts.',
        key_features: 'front and back; measured anchors; same silhouette; exact art',
      },
      ['front copied to the back without permission', 'generic sizes shown as real', CUT],
      [
        'A band tee for "THE MIDNIGHT FERRY": a small ferry symbol on the chest and a huge ferry crossing a black river across the back, flats side by side with anchors.',
        'A tee with "I\'M FINE" small on the front and "I AM NOT FINE" huge on the back, same silhouette, very honest.',
        'A canvas tote for a neighborhood bakery with one artwork on the front and a different one on the back, same scale, same handle orientation, flats side by side.',
      ],
      'profile',
    ),
    G(
      'R-MER-19',
      'Size-Range Placement Trial',
      'print across size range profile',
      'size-range',
      {
        aesthetic:
          'Size-Range Placement Trial: one graphic placed on three garment sizes side by side to compare fixed and proportional scaling.',
        subject_treatment:
          "Place the prompt's graphic on three garment sizes side by side, showing whether it keeps a fixed or proportional width, the art itself unchanged.",
        color_and_tone: 'Colors and material kept constant across all three of the sizes.',
        lighting_and_shadow: 'Flat views at one reference scale with no disguising shadows.',
        texture_and_material: 'One source artwork with separate garment masks per size.',
        camera_and_composition: 'Three flats in a row with anchors and excluded zones marked.',
        atmosphere_and_mood: 'A precise comparison that shows the compromises honestly.',
        rendering_and_quality: 'Clean sheet with identical contours and intact art.',
        key_features: 'three sizes; fixed or proportional; one artwork; marked zones',
      },
      ['invented real sizes', 'bodies altered to fit', CUT],
      [
        'The crest of a fictional wizard school placed on a child, adult and giant-sized robe side by side, the crest at a fixed width looking tinier and tinier.',
        'A tee print "BIG ENERGY" tried on three sizes, the smallest shirt barely able to contain it.',
        'The words "OPEN ARCHIVE" tried on three back panels of different sizes, the distance to the collar and the occupied width noted beside each one.',
      ],
      'profile',
    ),
    G(
      'R-MER-20',
      'Flat-Art and Mockup Pair',
      'flat art and applied mockup pair profile',
      'flat-mockup-pair',
      {
        aesthetic:
          'Flat-Art and Mockup Pair: the isolated master artwork shown beside the same artwork applied to the product, clearly labeled as a pair.',
        subject_treatment:
          "Show the prompt's isolated artwork beside the same instance applied to the product, every letter and proportion identical in both panels.",
        color_and_tone:
          'Declared source colors, with light and material changes only in the mockup.',
        lighting_and_shadow: 'Unlit flat art and a descriptively lit mockup side by side.',
        texture_and_material: 'Clean transparent master art and an independent product surface.',
        camera_and_composition:
          "Two separate panels with the mockup referencing the art's anchors.",
        atmosphere_and_mood: 'A transparent presentation of what was designed and how it looks.',
        rendering_and_quality: 'Clean pair where the applied art matches the flat master exactly.',
        key_features: 'flat master; applied mockup; identical art; two panels',
      },
      [
        'art rebuilt from the mockup',
        'opaque background on the flat art',
        'lettering changed between panels',
        CUT,
      ],
      [
        'The flat artwork of a fictional sea-monster tour company, a kraken hugging a lighthouse, beside the same art printed on a hoodie, both identical.',
        'A flat design reading "PLEASE CLAP" beside the same design on a tote carried by a nervous magician.',
        'A flat arc-and-dot print for a small plant shop shown beside the very same print applied to a canvas tote, clearly labeled as one pair.',
      ],
      'profile',
    ),
  ],
};

export default spec;
