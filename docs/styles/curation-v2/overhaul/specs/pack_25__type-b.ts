import type { Spec } from '../tools/apply';
import { design } from './_design';

// Typography & lettering (part B): R-TYP-11..16 styles, R-TYP-17/18 specimen profiles, R-TYP-20 rhythm sequence
// profile, and Signwriter Brush Lettering, a new style replacing the R-TYP-19 exact-copy proof (see QA-PROTOCOLS.md).
const T = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
  kind: 'style' | 'profile' = 'style',
) => design(name, domain, tag, 'lettering', fields, avoid, briefs, { text: true, source, kind });

const COPY = 'copying a commercial typeface';

const spec: Spec = {
  pack: 'pack_25',
  category: '10. Typography & Lettering',
  updates: {},
  creates: [
    T(
      'R-TYP-11',
      'Stepped Pixel Lettering',
      'quantized pixel lettering',
      'stepped-pixel-type',
      {
        aesthetic:
          'Stepped Pixel Lettering: letters built from whole pixel clusters on a fixed logical height, with a stepped rhythm of their own.',
        subject_treatment:
          'Build the requested words from whole pixel clusters at one fixed logical letter height, drawing every accent and sign deliberately.',
        color_and_tone: 'A closed palette of two or three exact values with hard edges.',
        lighting_and_shadow: 'Optional shading in discrete stepped bands, crisp and flat.',
        texture_and_material:
          'Whole pixels in clean deliberate groups, every one placed on purpose.',
        camera_and_composition: 'Quantized baseline and spacing with fixes made by whole clusters.',
        atmosphere_and_mood: 'Digital energy and handmade precision, crafted rather than filtered.',
        rendering_and_quality:
          'Readable at logical size and kept identical at whole-number enlargements.',
        key_features: 'whole pixel clusters; fixed letter height; exact palette; stepped rhythm',
      },
      ['pixelation filter', 'letters at mixed resolutions', 'dropped signs', COPY],
      [
        'A 16-pixel-tall title "GAME OVER, HERO" for a retro dungeon crawler, stepped clusters in two colors, shown at native size and at a clean enlargement.',
        'Pixel lettering at 20 pixels high for "WHAT\'S NEXT?", apostrophe and question mark drawn with care, three values, very dramatic about a toaster game.',
        'A quiet 12-pixel title "NIGHT ROUTE" with one accent color, flat art and a whole-number enlargement.',
      ],
    ),
    T(
      'R-TYP-12',
      'Interrupted Ink Letters',
      'structurally cut ink lettering',
      'interrupted-ink',
      {
        aesthetic:
          'Interrupted Ink Letters: heavy ink letters broken by deliberate structural cuts that still leave every letter unmistakable.',
        subject_treatment:
          'Letter the requested words as heavy ink masses with structural cuts placed by anatomy, every distinctive trait and accent kept.',
        color_and_tone: 'One solid ink with the ground showing through the cuts.',
        lighting_and_shadow: 'Flat lettering where the cuts are drawn into the letters.',
        texture_and_material: 'Controlled ink edges, minimal irregularity and wide openings.',
        camera_and_composition: 'Cuts distributed by function rather than one identical stripe.',
        atmosphere_and_mood: 'Printed force and internal pauses, bold and punchy.',
        rendering_and_quality: 'Crisp lettering that still reads when reduced and without texture.',
        key_features: 'heavy ink; structural cuts; anatomy-led breaks; punchy weight',
      },
      ['generic grunge', 'damaged letters', 'cuts that change a character', COPY],
      [
        'The words "SIGNAL LOST" for a horror film about an abandoned radio tower, heavy black letters broken by deliberate cuts, bone ground, two lines.',
        'Lettering for "OUT OF OFFICE (FOREVER)" with ink letters cut into dramatic pieces as if the letters themselves quit their jobs, one blue ink.',
        'The words "PAUSE / PULSE" with different cuts per word, flat black, the slash exact and generous space.',
      ],
    ),
    T(
      'R-TYP-13',
      'Angular Loop Script',
      'angular connected script lettering',
      'angular-script',
      {
        aesthetic:
          'Angular Loop Script: a connected handwritten gesture where soft curves are replaced by tense angular turns and clear joins.',
        subject_treatment:
          'Write the requested words as a connected script whose curves turn into tense angles, keeping upper and lower case and every letter exact.',
        color_and_tone: 'One ink with related stroke weight across the whole word.',
        lighting_and_shadow:
          'Flat lettering where gesture shows through direction and drawn pressure.',
        texture_and_material: 'Clean contours with contained modulation and crisp terminals.',
        camera_and_composition: 'Fluid word rhythm with pauses between joins and a clear baseline.',
        atmosphere_and_mood: 'Agility and written tension, quick, sharp and confident on the page.',
        rendering_and_quality: 'Crisp script where every angular loop stays open and readable.',
        key_features: 'angular loops; connected gesture; tense turns; clear baseline',
      },
      ['illegible script', 'random breaks', 'texture pretending to be gesture', COPY],
      [
        'The words "Into the Storm" in angular script for the logbook cover of a storm-chasing pilot, sharp tense loops, one plum ink over two lines.',
        'Angular script spelling "Sorry I ate your lunch" on a very apologetic office sticky note, black on cream, every loop sharp with guilt.',
        'The words "Almost in silence" in a gestural angular script, ink blue, calm terminals and a wide margin.',
      ],
    ),
    T(
      'R-TYP-14',
      'Rotated Counter Display',
      'tilted counter display lettering',
      'rotated-counter',
      {
        aesthetic:
          'Rotated Counter Display: counters tilted inside upright stems, a quiet internal twist against a stable outline.',
        subject_treatment:
          'Letter the requested words with upright stems and counters tilted in one shared direction, keeping outlines, order and every accent exact.',
        color_and_tone: 'One solid ink to judge inner against outer shape.',
        lighting_and_shadow: 'Flat lettering, the tilt living only in the inner cut.',
        texture_and_material: 'Clean inner edges and walls thick enough around every counter.',
        camera_and_composition: 'Steady stems with counters sharing one controlled direction.',
        atmosphere_and_mood: 'Internal tension and contained movement, a word turning quietly.',
        rendering_and_quality: 'Crisp lettering where no letter changes identity from the tilt.',
        key_features: 'tilted counters; upright stems; one direction; stable outline',
      },
      ['global italic', 'collapsed walls', 'random rotation', COPY],
      [
        'The title "INNER STORM" for a ballet about a hurricane, upright letters whose counters tilt like wind inside them, black on cream.',
        'The words "DIZZY DONUTS" with every round counter tilted as if the letters just got off a carnival ride, one warm brown ink.',
        'A composition "808 — DOUBLE" with tilted counters in the numbers and letters, flat black and an exact dash.',
      ],
    ),
    T(
      'R-TYP-15',
      'Layer-Edge Typography',
      'shallow layered edge lettering',
      'layer-edge',
      {
        aesthetic:
          'Layer-Edge Typography: letters built from shallow stacked layers with visible edges, a low tactile depth that keeps the word clear.',
        subject_treatment:
          'Build the requested words from two or three shallow stacked layers with clear edges, keeping silhouette, counters and every character exact.',
        color_and_tone: 'Two or three values separating the layers, readable in one ink too.',
        lighting_and_shadow:
          'Soft light from one direction with short shadows clear of the counters.',
        texture_and_material: 'Smooth matte layers of related thickness, clean and precise.',
        camera_and_composition:
          'Frontal or near-frontal view, depth always subordinate to reading.',
        atmosphere_and_mood: 'Editorial tactility and a layered construction, crafted and calm.',
        rendering_and_quality: 'Crisp lettering where every layer belongs to the same letter.',
        key_features: 'stacked layers; visible edges; shallow depth; frontal view',
      },
      ['misregistered layers', 'deformed letters', 'material as the only difference', COPY],
      [
        'The word "STRATA" for a geology museum, letters built from three shallow stone-colored layers like cut rock, soft side light, frontal view.',
        'The words "LASAGNA MONDAY" in layered letters that look suspiciously like pasta sheets, cream, red and bone, soft light.',
        'The title "PAPER AND AIR" in two shallow layers with generous counters, black, bone and coral.',
      ],
    ),
    T(
      'R-TYP-16',
      'Tension-Bridge Wordforms',
      'bridged letter wordform',
      'tension-bridge',
      {
        aesthetic:
          'Tension-Bridge Wordforms: a few thin taut bridges join compatible letters while the rest of the word keeps clear separations.',
        subject_treatment:
          'Letter the requested words and join two or three compatible letters with thin taut bridges, leaving every other space open and every character exact.',
        color_and_tone: 'One ink with bridges lighter in weight than the main stems.',
        lighting_and_shadow: 'Flat lettering where tension comes from contour and counterform.',
        texture_and_material:
          'Clean contours, precise meetings and smooth bridges of even thickness.',
        camera_and_composition: 'Bridges placed on compatible pairs, wide pauses elsewhere.',
        atmosphere_and_mood: 'Connection and tension, taut like a held string.',
        rendering_and_quality:
          'Crisp wordform that keeps complete letters when bridges are removed.',
        key_features: 'taut bridges; few joins; open spaces; exact word',
      },
      ['decorative bridges', 'merged letters', 'too many connections', COPY],
      [
        'The word "BOND" for a spy film about two agents who can never meet, a single thin bridge stretched between the O and the N like a tripwire, black on cream.',
        'The words "HOLD ON" with thin bridges keeping the letters from falling off a cliff edge at the right margin, coral, dramatic.',
        'The word "SUSTAIN" with three taut bridges of different lengths and equal weight, flat and airy.',
      ],
    ),
    T(
      'R-TYP-19-NEW',
      'Signwriter Brush Lettering',
      'hand-painted sign lettering',
      'signwriter-brush',
      {
        aesthetic:
          'Signwriter Brush Lettering: bold hand-painted sign letters made with a flat brush, with crisp edges, drop shades and a steady professional hand.',
        subject_treatment:
          'Paint the requested words as a signwriter would, flat-brush strokes with crisp edges and an optional drop shade, every letter and sign exact.',
        color_and_tone: 'Enamel sign colors, cream, red, black and gold, with one shade color.',
        lighting_and_shadow: 'Flat daylight on a painted surface with a crisp painted drop shade.',
        texture_and_material:
          'Glossy enamel paint on wood, glass or metal with subtle brush marks.',
        camera_and_composition:
          'Straight-on sign view, lines centered or arched with even spacing.',
        atmosphere_and_mood: 'Proud and handmade, the confident hand of a skilled trade.',
        rendering_and_quality: 'Crisp painted lettering with sharp edges and gentle brush texture.',
        key_features: 'flat-brush strokes; drop shade; enamel colors; skilled hand',
      },
      ['wobbly amateur lettering', 'vinyl-cut look', 'misspelled sign text', COPY],
      [
        'Hand-painted gold letters reading "DRAGON REPAIRS" on the glass door of a blacksmith\'s shop, black drop shade and a proud arched top line.',
        'A signwriter\'s board reading "FRESH BAIT & WEDDING CAKES" outside a very confusing seaside shop, red and cream enamel, perfectly spaced.',
        'The words "OPEN DAILY" painted in cream enamel on a dark green wooden sign, crisp brush edges and a soft shade.',
      ],
    ),
    T(
      'R-TYP-17',
      'Width-Axis Exploration',
      'width variation specimen profile',
      'width-axis',
      {
        aesthetic:
          'Width-Axis Exploration: one word shown in compact, regular and wide versions at the same height and weight, redrawn for each width.',
        subject_treatment:
          'Show the requested word in three related widths at the same height and apparent weight, redrawing counters and spacing for each.',
        color_and_tone: 'One common ink for comparing form, with notes outside the art.',
        lighting_and_shadow: 'Flat specimen with no light favoring any width.',
        texture_and_material: 'Clean contours and a constant apparent weight across versions.',
        camera_and_composition: 'Same word and reference height with declared widths aligned.',
        atmosphere_and_mood: 'One coherent family with different rhythms, clearly related.',
        rendering_and_quality: 'Letters keep anatomy and weight as the width changes.',
        key_features: 'three widths; same height; redrawn counters; aligned specimen',
      },
      ['mechanical scaling', 'undeclared weight change', 'changed characters', COPY],
      [
        'A width specimen of the word "HORIZON" for a desert expedition identity, compact, regular and wide, redrawn counters at the same height, black on white.',
        'The word "STRETCH" in compact, regular and very wide versions, the wide one clearly enjoying a yoga class, one ink.',
        'A specimen of "2040 / ARCHIVE" in three related proportions, numbers and letters in one system.',
      ],
      'profile',
    ),
    T(
      'R-TYP-18',
      'Optical Size Specimen',
      'optical size comparison profile',
      'optical-size',
      {
        aesthetic:
          'Optical Size Specimen: a display version and a small-size version of the same lettering compared, with the adjustments made visible.',
        subject_treatment:
          'Compare a display version and a small-size version of the requested words, adjusting apertures, contrast and detail and keeping every character exact.',
        color_and_tone: 'One ink on opposing test grounds with nothing hiding problems.',
        lighting_and_shadow: 'Flat specimen that measures only letters and reading.',
        texture_and_material: 'Clean edges, detail reduced only where it helps the small size.',
        camera_and_composition: 'The same text at native sizes and in separate enlargements.',
        atmosphere_and_mood: 'Perceptual consistency across scales rather than identical outlines.',
        rendering_and_quality: 'The small version stays legible after authorized simplifications.',
        key_features: 'display and small versions; visible adjustments; native sizes; enlargements',
      },
      ['sharpening as correction', 'different text', 'detail removed without a note', COPY],
      [
        'An optical size specimen of "MARGIN" for a poetry magazine, the title version with fine contrast beside a sturdier small version, native size and enlargement.',
        'A comparison of "B8 O0 I1" at two sizes to catch letters pretending to be numbers, one ink, controls side by side, slightly paranoid.',
        'A specimen of "Index 07 — Review" as a heading and as a small label, accents, numbers and dash kept exact.',
      ],
      'profile',
    ),
    T(
      'R-TYP-20',
      'Variable Rhythm Sequence',
      'lettering change keyframe sequence',
      'variable-rhythm',
      {
        aesthetic:
          'Variable Rhythm Sequence: the same lettering shown in three frames as its width, weight or counters change, every letter traceable.',
        subject_treatment:
          'Show the requested words in three frames as width, weight or counters change within declared limits, every letter kept and traceable.',
        color_and_tone: 'A stable palette, with color never replacing geometric continuity.',
        lighting_and_shadow: 'Flat or constant low-relief light with no flashes hiding jumps.',
        texture_and_material: 'Coherent contours between frames with a stable finish.',
        camera_and_composition: 'Same text, baseline and anchors across comparable frames.',
        atmosphere_and_mood:
          'A readable typographic rhythm and a calm, controlled transformation over time.',
        rendering_and_quality: 'Every letter can be followed from the first frame to the last.',
        key_features: 'three frames; controlled change; fixed baseline; traceable letters',
      },
      [
        'new letters',
        'uncontrolled simultaneous changes',
        'sequence shown as a working variable font',
        COPY,
      ],
      [
        'Three frames of the word "AWAKEN" for a fantasy game title, the letters widening and gaining weight as if a sleeping giant were rising, fixed baseline.',
        'The word "INHALE" in three frames puffing up like it is holding its breath, then the same word exhaling in a fourth panel, one ink, comic.',
        'Three calm frames of the words "MAKE ROOM" for a small library reading room, the counters growing while the outer width barely changes, on a neutral ground.',
      ],
      'profile',
    ),
  ],
};

export default spec;
