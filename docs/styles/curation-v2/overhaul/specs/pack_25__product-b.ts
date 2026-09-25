import type { Spec } from '../tools/apply';
import { design } from './_design';

// Industrial & product design (part B): R-PRD-11..16 styles, R-PRD-17 finish modifier, R-PRD-18 design board
// profile (a layout board, distinct from the pack_03 Exploded View render), R-PRD-20 repair-access sequence
// profile, and Stacked Ring Forms, a new style replacing the R-PRD-19 three-view check (see QA-PROTOCOLS.md).
const P = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
  kind: 'style' | 'modifier' | 'profile' = 'style',
) => design(name, domain, tag, 'product', fields, avoid, briefs, { text: false, source, kind });

const spec: Spec = {
  pack: 'pack_25',
  category: '6. Industrial & Product Design',
  updates: {},
  creates: [
    P(
      'R-PRD-11',
      'Open-Core Appliances',
      'open housing revealing core product',
      'open-core',
      {
        aesthetic:
          'Open-Core Appliances: one structural opening in the housing reveals how the functional core sits inside the outer shell.',
        subject_treatment:
          "Open the prompt's product housing at one structural zone that reveals the relationship between its working core and its shell, with visible supports.",
        color_and_tone:
          'Controlled contrast between core and housing, with every connection kept visible.',
        lighting_and_shadow:
          'One common light that shows depth inside without turning it into a stage.',
        texture_and_material: 'Sober finishes on housing and core, with clear edges and supports.',
        camera_and_composition:
          'The opening aimed at understanding the function, not at showing every part.',
        atmosphere_and_mood:
          'Constructive transparency and contained curiosity, honest about how it works.',
        rendering_and_quality:
          'Clean concept render where the opening never cuts a support or floats the core.',
        key_features: 'structural opening; visible core; clear supports; honest construction',
      },
      ['decorative interior', 'floating core', 'opening that blocks the function'],
      [
        'A heater for an ice-fishing hut on a frozen lake: an open side reveals a glowing core held by two visible supports inside a graphite shell, snow light outside. No readable text or logo.',
        'A popcorn machine with a huge open core so the whole family can watch every kernel explode, cream housing and a glowing center, dramatic and joyful. No readable text or logo.',
        'A desk light whose wide opening shows the diffuser and its inner support, terracotta matte, soft glow and a stable base. No readable text or logo.',
      ],
    ),
    P(
      'R-PRD-12',
      'Continuous Handle Objects',
      'one-path handle and body product',
      'continuous-handle',
      {
        aesthetic:
          'Continuous Handle Objects: handle and body grow from one continuous path of material, with readable transitions of thickness.',
        subject_treatment:
          "Grow the prompt's product handle and body from one continuous material path with a readable change of thickness and a generous grip gap.",
        color_and_tone: 'One main color with an optional contrasting interaction zone.',
        lighting_and_shadow:
          'Broad light running along the continuity and revealing the handle gap.',
        texture_and_material:
          'Sober material, seamless where continuity is proposed and jointed where it ends.',
        camera_and_composition: 'A wide grip gap, a balanced body and an obvious direction of use.',
        atmosphere_and_mood: 'Resilient fluidity and economy of parts, one confident gesture.',
        rendering_and_quality:
          'Clean concept render where continuity holds from side and back views.',
        key_features: 'continuous handle path; readable transition; wide grip gap; one material',
      },
      ['stuck-on handle', 'grip gap too small', 'impossible continuity'],
      [
        'A lantern for night ferries crossing a black river: handle and base form one continuous loop around the glowing diffuser, graphite matte, warm light. No readable text or logo.',
        'A watering can for a gardener with a very long reach problem, handle and spout growing out of one wildly continuous path, slate blue and slightly ridiculous. No readable text or logo.',
        'A small water jug whose handle rises out of the body in one continuous line, warm grey ceramic, three-quarter view. No readable text or logo.',
      ],
    ),
    P(
      'R-PRD-13',
      'Counterweighted Desk Tools',
      'visible counterweight product',
      'counterweight',
      {
        aesthetic:
          'Counterweighted Desk Tools: one visible heavy mass balances a light working element and shows the direction of use.',
        subject_treatment:
          "Balance the prompt's light working element with one visible support mass that expresses direction and use, the load path making sense.",
        color_and_tone: 'Sober base mass and a moderately contrasting active element.',
        lighting_and_shadow: 'Soft side light with a clear contact shadow under the base.',
        texture_and_material:
          'Materials of visibly different apparent density, heavy base and light arm.',
        camera_and_composition:
          'A stable visual center of support with the light arm aimed at the task.',
        atmosphere_and_mood: 'Balanced tension and calm, an asymmetry you understand at once.',
        rendering_and_quality: 'Clean concept render where the support matches the load direction.',
        key_features: 'visible counterweight; light arm; clear load path; contact shadow',
      },
      [
        'object that seems to be falling',
        'ornamental counterweight',
        'stability claimed without calculation',
      ],
      [
        'A reading lamp for a lighthouse library balanced by a heavy stone base, the light arm reaching over a huge old logbook, charcoal and bone. No readable text or logo.',
        'A phone stand that uses a very heavy iron duck as its counterweight, the duck clearly unimpressed, graphite and one orange detail. No readable text or logo.',
        'A small tape dispenser with an asymmetric base balancing a light visible axle, ceramic-like and matte metal, three-quarter view. No readable text or logo.',
      ],
    ),
    P(
      'R-PRD-14',
      'Color-Coded Function Modules',
      'color and shape coded modular product',
      'color-modules',
      {
        aesthetic:
          'Color-Coded Function Modules: modules told apart by shape and color make their function and swap-ability visible at a glance.',
        subject_treatment:
          "Split the prompt's product into modules by function, each recognizable by shape, joint and color together.",
        color_and_tone: 'A palette by role backed by structural contrast.',
        lighting_and_shadow: 'One neutral common light shared by every module.',
        texture_and_material: 'Coherent materials across pieces and connectors of visible scale.',
        camera_and_composition: 'Accessible modules, clear connections and one dominant main mass.',
        atmosphere_and_mood: 'System clarity and understandable modularity, grown-up and friendly.',
        rendering_and_quality: 'Clean concept render where every module still reads in monochrome.',
        key_features: 'function modules; shape and color coding; visible connectors; one main mass',
      },
      ['color as the only function', 'swappable modules with no connection', 'extra pieces'],
      [
        'A modular field kit for volcanologists: input, sampling and shelter modules, each a different shape and color, clipped onto one frame, charcoal, coral and cream. No readable text or logo.',
        'A modular toaster for a family that cannot agree on anything, four color-coded slots that detach and argue with each other on the counter. No readable text or logo.',
        'A sample organizer with archive, lookup and carry modules that lock together in one direction, slate, bone and orange, elevated view. No readable text or logo.',
      ],
    ),
    P(
      'R-PRD-15',
      'Inflated Surface Hardpoints',
      'soft volume with rigid anchors',
      'inflated-hardpoint',
      {
        aesthetic:
          'Inflated Surface Hardpoints: apparently soft volumes fixed to clearly rigid points, a constructive contrast between plush and precise.',
        subject_treatment:
          "Fix the prompt's soft volumes to a few clear rigid anchors, keeping tension and the function of each contact point.",
        color_and_tone: 'A sober soft body color with anchors in limited contrast.',
        lighting_and_shadow: 'Broad light revealing curvature and compression around each anchor.',
        texture_and_material: 'Smooth elastic surface and rigid anchors with defined edges.',
        camera_and_composition:
          'Few visible anchors, a compact silhouette and a clear zone of use.',
        atmosphere_and_mood: 'Contrast between softness and precision, cushioned yet exact.',
        rendering_and_quality:
          'Clean concept render where every major deformation comes from an anchor.',
        key_features: 'soft volume; rigid anchors; visible compression; plush and precise',
      },
      ['random softness', 'floating anchors', 'function erased by volume'],
      [
        'A neck pillow for astronauts sleeping upright on a long voyage, one soft ring clipped to two rigid helmet anchors, graphite and coral. No readable text or logo.',
        'An inflatable armchair for a nervous gamer, puffy cushions locked to four rigid points so it never tips over during boss fights, bright and anxious. No readable text or logo.',
        'A soft membrane tray held by three rigid supports forming a gentle hollow, terracotta and charcoal, a quiet formal study. No readable text or logo.',
      ],
    ),
    P(
      'R-PRD-16',
      'Perforation-Gradient Objects',
      'graded perforation surface product',
      'perforation-gradient',
      {
        aesthetic:
          'Perforation-Gradient Objects: openings that grow or shrink by zone to express declared airflow, sound or visibility across the product.',
        subject_treatment:
          "Vary the size or density of perforations across the prompt's product by functional zone, with coherent margins and solid ligaments.",
        color_and_tone: 'Continuous material color, contrast coming from the voids themselves.',
        lighting_and_shadow: 'Soft light showing hole depth with clean, quiet shading.',
        texture_and_material:
          'Matte surface, clean-edged perforations and uniform apparent thickness.',
        camera_and_composition:
          'The gradient aimed at one functional zone, smooth areas left for grip and controls.',
        atmosphere_and_mood: 'A gradual technical rhythm, like the object is quietly breathing.',
        rendering_and_quality:
          'Clean concept render where the variation follows a functional idea.',
        key_features: 'perforation gradient; functional zones; solid margins; breathing rhythm',
      },
      ['holes with no function', 'walls too thin', 'invented thermal performance'],
      [
        'A speaker for a cathedral bell tower: perforations swell toward the sound zone and vanish at the controls, graphite matte, dusty light through the tower window. No readable text or logo.',
        'A cheese dome for a very smelly cheese, perforations dense near the top so the smell can escape gracefully, bone matte, dignified. No readable text or logo.',
        'A diffuse lamp with perforations grouped in one emission band, base and grip left smooth, bone matte and a soft glow. No readable text or logo.',
      ],
    ),
    P(
      'R-PRD-19-NEW',
      'Stacked Ring Forms',
      'stacked ring product construction',
      'stacked-ring',
      {
        aesthetic:
          'Stacked Ring Forms: products built from a column of stacked rings and discs, each ring a separate part with its own material and role.',
        subject_treatment:
          "Build the prompt's product as a stack of rings and discs, each ring one part with its own role, so function reads from bottom to top.",
        color_and_tone: 'Alternating ring materials in a tight palette with one accent ring.',
        lighting_and_shadow:
          'Soft side light catching every ring edge and the small gaps between them.',
        texture_and_material: 'Machined, turned and cast rings in matte and satin finishes.',
        camera_and_composition:
          'Upright stack seen at eye level, the rhythm of rings reading clearly.',
        atmosphere_and_mood:
          'Sculptural and totemic, precise and satisfying like a finished lathe part.',
        rendering_and_quality:
          'Clean concept render with crisp ring edges and consistent diameters.',
        key_features: 'stacked rings; one role per ring; accent ring; turned edges',
      },
      ['random stack', 'rings with no function', 'impossible floating rings'],
      [
        'An oil lantern for a desert caravan built from stacked brass, clay and glass rings, the glass ring glowing in the middle, dusk sand behind it. No readable text or logo.',
        'A salt and pepper grinder so over-designed it has eleven stacked rings, each one doing something slightly different, and a single proud red ring on top. No readable text or logo.',
        'A small bedside speaker made of four stacked rings, cork, felt, aluminum and a soft light ring, calm studio light. No readable text or logo.',
      ],
    ),
    P(
      'R-PRD-17',
      'Monolithic Material Finish',
      'monolithic material finish modifier',
      'monolithic-finish',
      {
        aesthetic:
          'Monolithic Material Finish: a modifier that wraps an existing product in one continuous finish while every joint, control and opening stays in place.',
        subject_treatment:
          "Apply one continuous finish to the prompt's existing product geometry, keeping its seams, controls and openings exactly where they are.",
        color_and_tone: 'One main color with enough value variation to separate planes and parts.',
        lighting_and_shadow: 'Broad light and contained reflections that keep every seam visible.',
        texture_and_material: 'Semi-matte monolithic surface with fine grain and even coverage.',
        camera_and_composition:
          'Camera, silhouette and part placement of the source kept unchanged.',
        atmosphere_and_mood: 'Material calm and reduced distraction, with every sign of use kept.',
        rendering_and_quality: 'Seams and controls stay recognizable after the finish is unified.',
        key_features: 'one continuous finish; kept seams; unchanged geometry; fine grain',
      },
      ['erased seams', 'merged controls', 'shape changed by the finish'],
      [
        'A monolithic graphite finish applied to an old, battered robot companion, every dent, seam and button still in place, now looking strangely noble. No readable text or logo.',
        'A cluttered kitchen mixer covered in one calm warm-grey finish, all its knobs still there, looking like it finally found inner peace. No readable text or logo.',
        'A two-part container unified in slate-blue matte, lid and body still clearly distinct, same camera as the original. No readable text or logo.',
      ],
      'modifier',
    ),
    P(
      'R-PRD-18',
      'Exploded Assembly Board',
      'product assembly design board profile',
      'assembly-board',
      {
        aesthetic:
          "Exploded Assembly Board: a design board that lays the product's real parts apart along assembly axes, beside a small assembled view for control.",
        subject_treatment:
          "Lay the prompt's product parts apart along assembly axes on a clean board, keeping shape, orientation and correspondence, with a small assembled view.",
        color_and_tone: 'Colors per part or source material, with discreet thin axis lines.',
        lighting_and_shadow: 'One soft common light for every part, grounded on the board.',
        texture_and_material:
          'Original materials and thickness kept, with only the supplied parts shown.',
        camera_and_composition:
          'Compact ordered layout with readable axes and an assembled control view.',
        atmosphere_and_mood:
          "Constructive understanding and sequence, calm like a designer's pin-up board.",
        rendering_and_quality:
          'Part count and joining points match between assembled and exploded views.',
        key_features:
          'design board layout; assembly axes; assembled control view; exact part count',
      },
      ['invented parts', 'changed orientation', 'exploded view that could not be reassembled'],
      [
        'A design board for a dragon-egg incubator: base, heating shell, glass dome and egg cradle laid out on one vertical axis with the assembled unit small in the corner. No readable text or logo.',
        'An assembly board for a flat-pack cat castle, every panel laid out on clean axes beside the finished tower and one confused cat for scale. No readable text or logo.',
        'A calm board for a three-part desk lamp, base, arm and diffuser on discreet axes with the assembled lamp beside them. No readable text or logo.',
      ],
      'profile',
    ),
    P(
      'R-PRD-20',
      'Repair-Access Concept',
      'repair access sequence profile',
      'repair-access',
      {
        aesthetic:
          'Repair-Access Concept: a three-step visual sequence showing the product closed, opened and with one part removed, the same parts and camera throughout.',
        subject_treatment:
          "Show the prompt's product in three steps, closed, cover removed and one part taken out, keeping geometry and part order identical.",
        color_and_tone: 'The serviced part marked by shape or accent, the rest kept stable.',
        lighting_and_shadow: 'Clear even light that keeps every access point in view.',
        texture_and_material: 'Sober materials with fixings shown only where they are defined.',
        camera_and_composition: 'Three comparable views in a row: closed, opened and part removed.',
        atmosphere_and_mood: 'Maintenance clarity and reversibility, calm, patient and reassuring.',
        rendering_and_quality:
          'The sequence could run backwards without any part passing through another.',
        key_features: 'three-step sequence; same camera; serviced part accent; reversible',
      },
      ['guaranteed repair claims', 'parts appearing from nowhere', 'impossible access'],
      [
        'A three-step repair sequence for a starship coffee machine: closed, side panel off, brewing core lifted out, same camera, graphite and amber. No readable text or logo.',
        'Repair steps for a robot dog that keeps losing its tail: closed, tail cover off, tail module out, the dog looking relieved in every frame. No readable text or logo.',
        'A calm lamp repair sequence: complete lamp, diffuser unclipped, diffuser set beside it, same view and soft light. No readable text or logo.',
      ],
      'profile',
    ),
  ],
};

export default spec;
