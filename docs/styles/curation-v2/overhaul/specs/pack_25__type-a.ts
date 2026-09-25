import type { Spec } from '../tools/apply';
import { design } from './_design';

// Typography & lettering (part A): R-TYP-01..10. Every requested character, accent and sign stays exact.
const T = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
) => design(name, domain, tag, 'lettering', fields, avoid, briefs, { text: true, source });

const COPY = 'copying a commercial typeface';

const spec: Spec = {
  pack: 'pack_25',
  category: '10. Typography & Lettering',
  newCategory: { id: 'typography-and-lettering' },
  updates: {},
  creates: [
    T(
      'R-TYP-01',
      'Plotter-Facet Lettering',
      'faceted segment lettering',
      'plotter-facet',
      {
        aesthetic:
          'Plotter-Facet Lettering: curves approximated by straight segments of related length, like letters traced by a pen plotter, anatomy kept intact.',
        subject_treatment:
          "Letter the requested words with curves built from straight segments of related length and joins, keeping every character's anatomy and every sign exact.",
        color_and_tone: 'One high-contrast ink with the facets left crisp and ungraded.',
        lighting_and_shadow:
          'Flat graphic rendering with the segments drawn as pure line and shape.',
        texture_and_material: 'Clean contours and controlled joins so every segment reads.',
        camera_and_composition:
          'Word rhythm built from widths and spaces rather than identical letter boxes.',
        atmosphere_and_mood:
          'Tool-made precision and angular tension, distinctly engineered and exact.',
        rendering_and_quality:
          'Crisp lettering where segments follow one logic through curves and signs.',
        key_features: 'segmented curves; plotter logic; angular joins; exact characters',
      },
      ['filter-pixelated curves', 'deformed characters', 'random segments', COPY],
      [
        'The words "ORBIT OPEN" as the title of a lost space probe\'s final transmission, every curve built from taut straight segments, white on deep black, two lines.',
        'Faceted lettering for the ridiculous title "ROBOT TRIES POETRY", each round letter clearly struggling to be a circle out of straight lines, ink blue on pale grey.',
        'A quiet question lettered in plotter facets, "WHERE DOES THE CURVE BEGIN?", one dominant word and a readable second line, black on cream.',
      ],
    ),
    T(
      'R-TYP-02',
      'Counterform Breathing',
      'breathing counter lettering',
      'counterform-breathing',
      {
        aesthetic:
          'Counterform Breathing: the inner spaces of the letters widen and narrow in a coordinated rhythm while weight and reading stay steady.',
        subject_treatment:
          'Letter the requested words with counters that open and close in a coordinated rhythm, the skeleton, weight and every character left intact.',
        color_and_tone: 'One ink to judge the counters, with any second color kept for notes.',
        lighting_and_shadow: 'Flat lettering where every counter is a true open space.',
        texture_and_material: 'Continuous contours and clean-edged counters on a plain ground.',
        camera_and_composition:
          'Inner width varying across the word while outer spacing stays even.',
        atmosphere_and_mood: 'A sense of breathing and tension, alive but never wobbly.',
        rendering_and_quality: 'Crisp lettering where counters change without closing any letter.',
        key_features: 'breathing counters; steady weight; even outer spacing; open letters',
      },
      ['closed counters', 'inconsistent weight', 'letters lost to expansion', COPY],
      [
        'The word "BREATHE" for a free-diving expedition film, its counters swelling toward the middle like lungs and tightening again at the ends, black on sea white.',
        'The title "BIG MOUTH" lettered with enormous greedy counters that look like they are about to swallow the margins, dark blue on cream.',
        'A pair of studies of "808 / BOB" with two different counter widths, same weight and order, one ink on a calm sheet.',
      ],
    ),
    T(
      'R-TYP-03',
      'Interlocking Baseline Type',
      'interlocking foot lettering',
      'interlocking-baseline',
      {
        aesthetic:
          'Interlocking Baseline Type: letters share feet and fittings along one recognizable baseline, locking together without merging.',
        subject_treatment:
          'Letter the requested words so selected letters share feet and fittings along one baseline, keeping word spaces and every character readable.',
        color_and_tone: 'One ink with clear gaps between letters, the fit never relying on color.',
        lighting_and_shadow: 'Flat rendering with letters standing directly on the page.',
        texture_and_material: 'Firm stems and feet with optically compensated joins.',
        camera_and_composition:
          'A continuous baseline created by relationships rather than an added bar.',
        atmosphere_and_mood:
          'Stability and connection, with small pauses keeping the word legible.',
        rendering_and_quality:
          'Crisp lettering where each letter still works when pulled out alone.',
        key_features: 'shared feet; interlocking fits; true baseline; kept word spaces',
      },
      ['decorative underline bar', 'merged letters', 'uneven base with no intent', COPY],
      [
        'The title "COMMON GROUND" for a peace treaty between two rival mountain clans, the letters of each word locking their feet together on one baseline, black and cream.',
        'Lettering for "STACK OF PANCAKES" where every letter leans on its neighbour for support like a precarious breakfast, one blue ink.',
        'The words "ANCHOR 24" with letters and numbers sharing one logic of support and a pause before the number, flat black with wide margins.',
      ],
    ),
    T(
      'R-TYP-04',
      'Ribbon-Terminal Lettering',
      'ribbon terminal lettering',
      'ribbon-terminal',
      {
        aesthetic:
          'Ribbon-Terminal Lettering: a few letter terminals extend into flat bands with one or two folds, sharing one common tension.',
        subject_treatment:
          'Letter the requested words and extend two or three terminals into flat folding ribbons, keeping every letter body complete and readable.',
        color_and_tone: 'Two optional values for band orientation, the word legible in one ink.',
        lighting_and_shadow: 'Minimal graphic shade inside each fold with a flat finish.',
        texture_and_material: 'Smooth bands of related thickness with visible ends at every fold.',
        camera_and_composition: 'Extensions gathered on a few letters, clear of critical spaces.',
        atmosphere_and_mood: 'Contained flow and an opening gesture, elegant and restrained.',
        rendering_and_quality: 'Crisp lettering that still reads fully with the ribbons removed.',
        key_features: 'ribbon terminals; one or two folds; kept letter bodies; visible ends',
      },
      ['ribbons replacing letters', 'impossible folds', 'a terminal on every character', COPY],
      [
        'The title "UNFURL" for a flag raised over a newly discovered island, two terminals stretching into long flat ribbons that seem to catch the wind, black and coral.',
        'A birthday banner reading "FINALLY FORTY" with one ribbon terminal that keeps going far too long across the whole wall, one ink.',
        'The words "OPEN LOOP", a band leaving the L and another ending at the P, both with clear ends and lots of air.',
      ],
    ),
    T(
      'R-TYP-05',
      'Offset Inline Stems',
      'offset inner channel lettering',
      'offset-inline',
      {
        aesthetic:
          'Offset Inline Stems: inner channels shifted to one side of each stem create contrast without doubling the whole outline.',
        subject_treatment:
          'Letter the requested words with inner channels offset inside the stems by one rule per stroke direction, keeping every character unmistakable.',
        color_and_tone: 'Main mass and background channel clearly separated in one reference ink.',
        lighting_and_shadow: 'Flat geometry where the channel is drawn rather than lit.',
        texture_and_material: 'Stable outer contours and clean inner channels of consistent width.',
        camera_and_composition:
          'Offsets following one rule by stem direction with local optical fixes.',
        atmosphere_and_mood: 'Inner tension and precision, sharp and slightly mechanical.',
        rendering_and_quality:
          'Crisp lettering whose channels never close counters or vanish when small.',
        key_features: 'offset inner channels; one rule; stable outlines; sharp contrast',
      },
      ['ornamental inline', 'channels too thin', 'look of misregistered shadow', COPY],
      [
        'The title "OUT OF PHASE" for a sci-fi film about a man slipping between dimensions, inner channels shifted to one side of every stem, black on pale cream.',
        'Lettering for "DOUBLE ESPRESSO" where every letter looks slightly jittery thanks to its offset inner line, deep brown on cream.',
        'A study "A/B — 2040" with one channel rule applied to letters and numbers, exact dash, one ink on a plain sheet.',
      ],
    ),
    T(
      'R-TYP-06',
      'Carved Wedge Capitals',
      'wedge-cut capital lettering',
      'carved-wedge',
      {
        aesthetic:
          'Carved Wedge Capitals: wide wedges and cuts shape stems and serifs into weighty capitals with clear masses and counters.',
        subject_treatment:
          'Letter the requested words in capitals built from broad wedges and cuts that keep masses and counters clear, every character and accent exact.',
        color_and_tone: 'One solid ink with strong, clean contrast between figure and ground.',
        lighting_and_shadow: 'Flat graphic capitals, their depth implied only by the cut shapes.',
        texture_and_material: 'Clean carved-looking edges and serifs of controlled scale.',
        camera_and_composition:
          'Capitals of related widths with spacing rhythm and balanced diagonals.',
        atmosphere_and_mood: 'Gravity and cutting precision, solemn in weight yet clearly modern.',
        rendering_and_quality: 'Crisp lettering where every wedge adds direction and structure.',
        key_features: 'wedge serifs; broad cuts; weighty capitals; clear counters',
      },
      ['random serifs', 'copied Roman inscription', 'cracks across letters', COPY],
      [
        'The words "THE LAST KING" carved in broad wedge capitals for a tomb door in a fantasy epic, black on bone, heavy and solemn.',
        'Wedge capitals spelling "EXTREMELY SERIOUS CAT", every serif absolutely determined, one dark blue ink with wide margins.',
        'The title "SOLID GROUND" in wide-cut capitals across two lines, flat black on bone, calm and sober.',
      ],
    ),
    T(
      'R-TYP-07',
      'Soft-Block Ligatures',
      'soft compact ligature lettering',
      'soft-block',
      {
        aesthetic:
          'Soft-Block Ligatures: soft compact letterforms joined in a few friendly ligatures, with the rest of the word kept separate.',
        subject_treatment:
          'Letter the requested words in soft compact forms joining only a few compatible pairs, with open counters and every character in order.',
        color_and_tone: 'One ink with wide counters and an optional accent kept outside the word.',
        lighting_and_shadow: 'Flat soft shapes with a matte, even finish.',
        texture_and_material: 'Tense soft contours, smooth even joins and clean open counters.',
        camera_and_composition:
          'Ligatures grouped with pauses between pairs, the word never squeezed.',
        atmosphere_and_mood:
          'Closeness and playful compactness, without ever losing its precision.',
        rendering_and_quality:
          'Crisp lettering where every ligature keeps the count and order of letters.',
        key_features: 'soft blocks; few ligatures; open counters; friendly rhythm',
      },
      ['melted letters', 'every character joined', 'closed counters', COPY],
      [
        'The word "SHELTER" for a refuge for stray dogs, soft compact letters with two gentle ligatures like dogs leaning against each other, one plum ink.',
        'Lettering for "MARSHMALLOW EMERGENCY" in soft squishy blocks that clearly cannot handle an emergency, black on cream.',
        'The words "GOOD MEETING" in soft blocks with two small joins and clear word spaces, flat coral.',
      ],
    ),
    T(
      'R-TYP-08',
      'Mechanical Joint Alphabet',
      'assembled-piece lettering',
      'mechanical-joint',
      {
        aesthetic:
          'Mechanical Joint Alphabet: letters assembled from a few bars and arcs with visible joints, like a precise modular kit.',
        subject_treatment:
          'Letter the requested words from a few bars and arcs joined at visible, consistent joints, keeping proportions and every character exact.',
        color_and_tone: 'Color may separate parts in study, the word working in one ink.',
        lighting_and_shadow: 'Flat rendering where joints are drawn as structural gaps.',
        texture_and_material: 'Clean planes and joints of consistent size across the alphabet.',
        camera_and_composition: 'Steady word rhythm with joints placed by construction.',
        atmosphere_and_mood:
          'Modular precision and legibility, engineered but still warm and friendly.',
        rendering_and_quality:
          'Crisp lettering where each letter breaks into pieces shared by the others.',
        key_features: 'bars and arcs; visible joints; modular kit; consistent pieces',
      },
      ['random pieces', 'incomplete letters', 'decorative connectors', COPY],
      [
        'The title "ASSEMBLY" for a documentary about the robots that built a lunar city, letters made of short bars and arcs with visible joints, black and cream.',
        'The words "SOME ASSEMBLY REQUIRED" lettered from pieces that look slightly wrong, as if assembled by someone without instructions, one blue ink.',
        'A calm composition "PIECE BY PIECE" in two lines using one joint system, flat black with clear pauses.',
      ],
    ),
    T(
      'R-TYP-09',
      'Compressed Aperture Sans',
      'narrow wide-aperture lettering',
      'compressed-aperture',
      {
        aesthetic:
          'Compressed Aperture Sans: narrow compact letters paired with wide open apertures and expressive cuts, drawn rather than squashed.',
        subject_treatment:
          'Letter the requested words in narrow compact forms with wide apertures and expressive cuts, redrawn letter by letter with every sign exact.',
        color_and_tone: 'One ink of firm contrast on a clean ground.',
        lighting_and_shadow: 'Flat lettering where the apertures open through drawing alone.',
        texture_and_material:
          'Defined terminals, consistent walls and optically widened apertures.',
        camera_and_composition: 'Tight rhythm with enough spacing, widths adapted to each letter.',
        atmosphere_and_mood:
          'Concentration and energy, tall and confident without feeling crushed.',
        rendering_and_quality: 'Crisp lettering where C, G and S apertures stay open when small.',
        key_features: 'narrow widths; wide apertures; expressive cuts; drawn letters',
      },
      ['automatic condensing', 'closed apertures', 'uneven letter weights', COPY],
      [
        'The title "LIMITED OXYGEN" for a submarine thriller, tall compressed letters with wide gasping apertures, black on cream, two tense lines.',
        'Narrow lettering for "SKINNY JEANS STORE", every letter slim and slightly out of breath, deep blue.',
        'The time "03:45 — KEEP GOING" with compact numbers, clear signs and expressive cuts, one ink and a wide margin.',
      ],
    ),
    T(
      'R-TYP-10',
      'Interwoven Stroke Display',
      'woven stroke display lettering',
      'interwoven-stroke',
      {
        aesthetic:
          'Interwoven Stroke Display: letter strokes cross over and under each other at a few clear points, the word still reading in order.',
        subject_treatment:
          'Letter a short requested title with strokes that cross over and under at a few well-spaced points, keeping every letter recognizable and in order.',
        color_and_tone: 'One ink or two values per path, readable in monochrome.',
        lighting_and_shadow:
          'Flat bands where over and under are shown by the lower stroke stopping.',
        texture_and_material: 'Bands of related weight, clean gaps and only a few crossings.',
        camera_and_composition:
          'Spaced crossings and separate words, no central knot blocking the reading.',
        atmosphere_and_mood: 'Continuity and cooperation between strokes, woven and lively.',
        rendering_and_quality: 'Crisp display lettering where each path can be traced by finger.',
        key_features: 'over-under strokes; few crossings; traceable paths; short title',
      },
      ['impossible knot', 'illegible letters', 'rope decoration added', COPY],
      [
        'The title "CROSSED FATES" for a romance between two rival sea captains, two lines of letters weaving over and under each other at three points, blue and coral.',
        'The words "TANGLED EARPHONES" with strokes woven together in a hopeless but still readable mess, one ink.',
        'The title "LIVING WEAVE" in bands of steady width and large voids, one ink, every crossing clean.',
      ],
    ),
  ],
};

export default spec;
