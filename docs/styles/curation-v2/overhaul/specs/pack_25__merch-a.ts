import type { Spec } from '../tools/apply';
import { design } from './_design';

// Apparel & merchandise graphics (part A): R-MER-01..10. Garment cut stays intact; requested words stay exact.
const G = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
) => design(name, domain, tag, 'apparel', fields, avoid, briefs, { text: true, source });

const CUT = 'changed garment cut or seams';

const spec: Spec = {
  pack: 'pack_25',
  category: '14. Apparel & Merchandise Graphics',
  newCategory: { id: 'apparel-and-merchandise-graphics' },
  updates: {},
  creates: [
    G(
      'R-MER-01',
      'Seam-Aware Topography',
      'seam-following band print',
      'seam-topography',
      {
        aesthetic:
          'Seam-Aware Topography: graphic bands that follow the seams and panel changes of a garment, splitting and rejoining at planned points.',
        subject_treatment:
          "Print the prompt's garment with graphic bands that use its real seams as guides, splitting and rejoining at planned points without changing the cut.",
        color_and_tone:
          'Enough contrast with the base fabric, colored by path rather than by fake height.',
        lighting_and_shadow:
          'Flat art as the source, with mockup light following the garment only.',
        texture_and_material: 'Controlled ink edges with the fabric weave kept independent.',
        camera_and_composition:
          'Anchors at shoulder, side and hem, bands pausing at every opening.',
        atmosphere_and_mood: 'A wrapping asymmetric flow that moves with the body.',
        rendering_and_quality: 'Clean print with front and back matching and measured margins.',
        key_features: 'seam-following bands; planned splits; front and back match; flat art',
      },
      ['invented seams', 'deformed garment', CUT],
      [
        'A jacket for a desert rally team where sand-colored bands sweep from the right shoulder over the back and split around the side seam like wind across dunes, front and back views.',
        'A hoodie where printed bands politely walk around the pocket instead of crossing it, like tiny traffic avoiding a roundabout, two inks.',
        'A tote with three bands using the handle joins as anchors, pausing and resuming at clear points, soft cream and navy.',
      ],
    ),
    G(
      'R-MER-02',
      'Data-Encoded Textile Marks',
      'data-count garment print',
      'data-textile',
      {
        aesthetic:
          'Data-Encoded Textile Marks: hand-drawn marks that encode a supplied dataset, spread over the garment with a readable key.',
        subject_treatment:
          "Encode the prompt's supplied numbers as one drawn mark per unit, grouped by shape and placed in printable zones, with the exact title and a small key.",
        color_and_tone: 'Color by category backed by shape, with no size or brightness scaling.',
        lighting_and_shadow: 'Flat graphic source with mockup light leaving the count untouched.',
        texture_and_material: 'Original strokes with contained hand variation and comparable area.',
        camera_and_composition: 'Main code in a readable zone and the key in a secondary spot.',
        atmosphere_and_mood: 'A personal, narrative rhythm grounded in explicit data.',
        rendering_and_quality: 'Clean print with countable marks and no unit cut by a seam.',
        key_features: 'one mark per unit; shape by group; readable key; exact title',
      },
      ['approximate counts', 'invented personal stories', 'missing key', CUT],
      [
        'A marathon finisher tee titled "42 KM" where 42 small drawn footprints climb from hem to collar in groups of five, the key "1 print = 1 km" at the back.',
        'A shirt titled "COFFEES THIS WEEK" with 34 tiny cup marks in groups, the last seven drawn with increasingly shaky lines.',
        'A tote with the title "LOG 01" and marks for A=12, B=8 and C=4, one shape per group, key printed small.',
      ],
    ),
    G(
      'R-MER-03',
      'Overscale Placement Graphics',
      'oversized placement print',
      'overscale-placement',
      {
        aesthetic:
          'Overscale Placement Graphics: one huge motif placed in relation to the torso, sleeve or back, deliberately larger than a normal print area.',
        subject_treatment:
          "Place one oversized motif from the prompt's subject against the real edges of torso, sleeve or back, deciding what may crop off and keeping the essential part.",
        color_and_tone:
          'A short palette with one broad contrast focus, the base color used as a reserve.',
        lighting_and_shadow: 'Neutral presentation light and a flat main artwork.',
        texture_and_material: 'Broad graphic edges with detail kept in one protected zone.',
        camera_and_composition:
          'An intentionally off-center motif with its crop decided in advance.',
        atmosphere_and_mood: 'A single bold idea with large pauses, confident and loud.',
        rendering_and_quality: 'Clean print where the focus reads flat and applied.',
        key_features: 'oversized motif; planned crop; body-edge placement; one idea',
      },
      ['motif simply enlarged with no relation to the garment', 'letters cut by accident', CUT],
      [
        'A black tee with a gigantic kraken tentacle wrapping from the back over one shoulder and down the front, cropped by the collar exactly where planned, bone ink.',
        'A shirt with one enormous cartoon eyeball on the back that stares at whoever walks behind you, cropped at the sides on purpose.',
        'A tote with a large fan shape opening from one handle toward the far edge, one focus and big reserves.',
      ],
    ),
    G(
      'R-MER-04',
      'Patch-Cluster Systems',
      'modular patch set',
      'patch-cluster',
      {
        aesthetic:
          'Patch-Cluster Systems: independent patches sharing proportions, edge treatment and spacing rules, assembled into one modular set.',
        subject_treatment:
          "Design the prompt's patches as a modular family with shared proportions and edges, clustered by hierarchy on the garment, every word exact.",
        color_and_tone: 'Two main colors and one accent by function across all patches.',
        lighting_and_shadow: 'Flat art for the layout with optional raised patch relief.',
        texture_and_material:
          'Wide borders and simplified original symbols with subordinate stitching.',
        camera_and_composition:
          'Clear hierarchy of main, secondary and index patch within placement zones.',
        atmosphere_and_mood:
          'A coherent collection, deliberately gathered and worn like small trophies.',
        rendering_and_quality: 'Clean patch set with legible contours and constant margins.',
        key_features: 'patch family; shared borders; clustered hierarchy; exact words',
      },
      ['institutional insignia as filler', 'other brands', 'cloned shields', CUT],
      [
        'A patch set for a fictional deep-sea diving club, "ABYSS CREW", "DEPTH 01" and an anglerfish symbol, shared beveled borders, clustered on a denim jacket.',
        'Patches for a club of people who have never finished a book: "CHAPTER ONE", "BOOKMARK" and a tiny sleeping moon, clustered proudly on a backpack.',
        'Three calm patches for a workshop, arch, bridge and window symbols, grouped on a tee with one left as a single piece.',
      ],
    ),
    G(
      'R-MER-05',
      'Stitch-Direction Lettering',
      'embroidered lettering by stitch flow',
      'stitch-lettering',
      {
        aesthetic:
          'Stitch-Direction Lettering: apparent stitch direction follows every stem and curve of the exact word, changing flow at joins and keeping counters open.',
        subject_treatment:
          'Render the requested word as apparent embroidery whose stitch direction follows each stem and curve, counters open and every character exact.',
        color_and_tone: 'One or two thread tones on a background that keeps the counters readable.',
        lighting_and_shadow: 'Soft raking light showing relief without closing thin stems.',
        texture_and_material: 'Visual stitches aligned to each stem with contained edges.',
        camera_and_composition: 'The full word with optical spacing and a safe area around it.',
        atmosphere_and_mood: 'Disciplined tactility, the thread following the letter faithfully.',
        rendering_and_quality: 'Clean lettering with open counters and smooth stitch transitions.',
        key_features: 'stitch-flow lettering; open counters; raised thread; exact word',
      },
      ['swapped text', 'random crossing stitches', 'claims of a machine-ready file', CUT],
      [
        'The word "VALKYRIE" embroidered across the back of a leather flight jacket, stitches flowing along every stem like wind over wings, gold thread on black.',
        'The word "NAP" embroidered huge on a tiny pillow, stitches changing direction dramatically for such a small word, one sleepy blue thread.',
        'The word "WORKSHOP" on a plain canvas panel, two stitch directions alternating by stem, one thread color.',
      ],
    ),
    G(
      'R-MER-06',
      'Split-Panel Team Graphics',
      'panel-based team kit graphic',
      'split-panel-team',
      {
        aesthetic:
          "Split-Panel Team Graphics: the garment's panels and seams organize bands, names and numbers into one team identity.",
        subject_treatment:
          "Organize the prompt's team kit with bands, name and number placed by its real panels and seams, every numeral exact and no sponsors invented.",
        color_and_tone: 'Fictional team colors with a stable base, accent and number hierarchy.',
        lighting_and_shadow: 'Even studio light that never hides a numeral.',
        texture_and_material: 'Crisp flat art on a technical fabric support.',
        camera_and_composition:
          'Number and name in defined zones, front and back related across seams.',
        atmosphere_and_mood:
          'Collective team energy built through alignments, bands and bold numbers.',
        rendering_and_quality: 'Clean kit with exact numerals and panel continuity.',
        key_features: 'panel-led bands; name and number; front and back; no sponsors',
      },
      ['uninvited fake sponsors', 'copied real teams', CUT],
      [
        'The kit of a fictional dragon-racing league team "EMBER WINGS", number 07, flame bands splitting at the side seams and rejoining on the back.',
        'A kit for "THE CHAIRS", the worst amateur football team in the world, number 00, bands that start bravely and give up halfway down the shirt.',
        'A calm workshop uniform with the identifier "A-03", one accent band and panel lines, pocket and collar kept.',
      ],
    ),
    G(
      'R-MER-07',
      'Negative-Space Garment Prints',
      'unprinted-fabric figure print',
      'negative-garment',
      {
        aesthetic:
          'Negative-Space Garment Prints: unprinted fabric becomes part of the motif, forming a second figure against the ink.',
        subject_treatment:
          "Print the prompt's garment so the unprinted fabric forms a second figure between ink masses, the reserves showing the true fabric color.",
        color_and_tone: 'Strong ink-to-fabric contrast, the reserve exactly the garment color.',
        lighting_and_shadow:
          'Flat art first, with even mockup light so shadows never read as gaps.',
        texture_and_material: 'Solid controlled ink and clean voids showing the real weave.',
        camera_and_composition: 'Off-center motif with openings protected from seams and folds.',
        atmosphere_and_mood: 'Print economy and a clear, satisfying double reading of the motif.',
        rendering_and_quality: 'Clean print with an explicit ink mask and true transparency.',
        key_features: 'fabric as figure; ink masses; double reading; true reserves',
      },
      ['painted background faking a reserve', 'gaps closed when applied', CUT],
      [
        'A graphite tee where two ivory ink masses leave the dark fabric in the shape of a wolf howling, the wolf made entirely of unprinted shirt.',
        'A white tote where a big black ink blob leaves the shape of a very surprised cat, the cat simply the bag itself.',
        'The word "PAUSE" built partly from the gaps between wide ink masses on a neutral tee, counters wide.',
      ],
    ),
    G(
      'R-MER-08',
      'Serial Label Street Graphics',
      'serial label typographic print',
      'serial-label',
      {
        aesthetic:
          'Serial Label Street Graphics: typographic blocks, indexes and rules arranged like a series label, with a clear reading hierarchy.',
        subject_treatment:
          "Arrange the prompt's exact words, series numbers and rules into a label-like typographic print, with no invented legal, barcode or authenticity text.",
        color_and_tone: 'A restricted print palette with one accent marking the series.',
        lighting_and_shadow: 'Flat typography with a sober mockup keeping the text exact.',
        texture_and_material:
          'Flat ink, clear printed rules and numerals that are easy to tell apart.',
        camera_and_composition: 'Dominant title, a vertical index and legible secondary lines.',
        atmosphere_and_mood:
          'A contemporary documentary character with calm pauses between the blocks.',
        rendering_and_quality: 'Clean typographic print with aligned blocks and checked copy.',
        key_features: 'label layout; series index; ruled blocks; exact copy',
      },
      ['invented legal labels', 'fake security codes', 'illegible decorative micro text', CUT],
      [
        'A tee for a fictional expedition to the bottom of the ocean with the exact label "DEEP SERIES / 01 / NO RETURN", a vertical index and one red rule.',
        'A shirt reading "PROPERTY OF NOBODY / EDITION 01 / DO NOT RETURN", deadpan and very official-looking without any fake codes.',
        'A tote with "RECORD A / IMAGE — SOUND — TEXT", three blocks and the number 03, dashes exact.',
      ],
    ),
    G(
      'R-MER-09',
      'Sleeve-to-Body Continuity',
      'sleeve to torso continuous print',
      'sleeve-body',
      {
        aesthetic:
          'Sleeve-to-Body Continuity: one graphic path crossing from sleeve to body through explicit matching points at the seam.',
        subject_treatment:
          "Run one graphic path from the prompt's sleeve onto the body through matching anchor pairs at the seam, keeping direction and width on both sides.",
        color_and_tone: 'One main color that makes continuity easy to check.',
        lighting_and_shadow: 'Flat panel art and even mockup light with the crossing visible.',
        texture_and_material: 'Clean graphic edges with the seam area left clean and clear.',
        camera_and_composition: 'Marked matching points on sleeve and torso in a neutral pose.',
        atmosphere_and_mood: 'A wrapping motion around the body with one dominant direction.',
        rendering_and_quality: 'Clean print documented per panel with the crossing matched.',
        key_features: 'sleeve-to-body path; matching anchors; kept width; neutral pose',
      },
      ['shifted seam', 'stretched sleeve', 'continuity faked by hiding the join', CUT],
      [
        'A jacket for a lightning-chasing club: one jagged bolt starts on the right cuff, climbs the sleeve and strikes across the back, matched exactly at the shoulder seam.',
        'A sweater with a long printed dachshund whose body starts on one sleeve and whose very long back continues across the chest.',
        'A calm tee with one wide line running from the right sleeve onto the back, anchors A and B matched.',
      ],
    ),
    G(
      'R-MER-10',
      'Woven Badge Silhouettes',
      'woven badge emblem design',
      'woven-badge',
      {
        aesthetic:
          'Woven Badge Silhouettes: compact original emblems with broad containing borders and an apparent woven texture.',
        subject_treatment:
          "Design the prompt's emblem as a compact silhouette with a wide border and few planes, shown as a woven badge, any requested text exact.",
        color_and_tone: 'Two or three thread colors with clear value separation.',
        lighting_and_shadow: 'Moderate side light across the weave with a readable front.',
        texture_and_material:
          'Woven texture in a coherent direction with the contour set by the shape.',
        camera_and_composition: 'Dominant figure, inner reserve and a stable border shape.',
        atmosphere_and_mood: 'Robust presence that still reads clearly at a small badge size.',
        rendering_and_quality: 'Clean badge with intact borders and open gaps.',
        key_features: 'woven badge; compact silhouette; wide border; few planes',
      },
      [
        'generic badge with new material',
        'borrowed insignia',
        'claims of production-ready weaving',
        CUT,
      ],
      [
        'A woven badge for a fictional order of mountain rescuers: a rope bridge between two peaks inside an asymmetric open border, cream, blue and rust thread.',
        'A woven badge reading "SURVIVED MONDAY" with a tiny battered coffee cup at the center, two thread colors.',
        'A calm woven badge reading "A-01" for a small library volunteer group, a geometric window inside an incomplete frame, cream and blue thread on a neutral ground.',
      ],
    ),
  ],
};

export default spec;
