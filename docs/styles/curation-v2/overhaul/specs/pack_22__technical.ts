import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Trading-card technical illustration: rendering methods that explain how things are built and
// work, without labels. Eight originals get card briefs; twelve new studies add transparent
// shells, grey-clay studies, motion paths, weapon profiles, scale lineups, flat vector, material
// panels, stress maps, magnified insets, catalog heroes, retro two-tone manuals and tinted plates.
const study = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  avoid: string[],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'technical', 'portable-style-study'],
  dna: dna(fields),
  avoid: [...avoid, 'readable labels or numbers', ...STYLE_AVOID],
  briefs,
});

const keep = 'Preserve the requested object, identity, proportions and pose';

const spec: Spec = {
  pack: 'pack_22',
  category: '8. Technical Illustration',
  updates: {
    'SP22-157': { briefs: [
      'A steam-powered war walker stands in a hangar, every plate separated by solid color planes and small contact shadows. No readable text or logo.',
      'A clockwork owl sits on a perch, its gears and feathers rendered as clean distinct cel shapes. No readable text or logo.',
      "Inside a pirate airship's engine room, pistons, boilers and a sweating engineer are rendered in crisp mechanical cel color with small contact shadows. No readable text or logo.",
    ] },
    'SP22-158': { briefs: [
      'A chrome rocket motorcycle glows on a showroom plinth, smooth airbrushed gradients meeting crisp panel edges. No readable text or logo.',
      'A diving suit of brass and glass stands in a workshop, airbrushed metal shining where each plate turns. No readable text or logo.',
      'A robotic heron stands in a pond, its steel neck rendered in soft airbrush with sharp seams. No readable text or logo.',
    ] },
    'SP22-159': { briefs: [
      "A beetle tank crawls over the rubble of a ruined city, its shell built from compact opaque enamel facets catching the sunset. No readable text or logo.",
      "A knight's gauntlet rests on an anvil in a dark forge, every plate a firm enamel facet catching the orange light of the coals. No readable text or logo.",
      "A crystal-powered lantern sits on a wizard's desk, its glass and brass frame painted in faceted enamel color glowing blue. No readable text or logo.",
    ] },
    'SP22-160': { briefs: [
      'A model-kit sky cruiser sits half assembled on a workbench, precise construction with broad gouache marks. No readable text or logo.',
      "A walking lighthouse robot strides across wave-battered rocks at night, clean values and confident opaque gouache strokes on its beam and legs. No readable text or logo.",
      "A submarine drone breaches the surface beside a fishing boat, water pouring off it in crisp precise gouache illustration. No readable text or logo.",
    ] },
    'SP22-161': { briefs: [
      "A boar-shaped siege engine is drawn in a clear line hierarchy, a heavy outer contour and fine interior mechanism lines. No readable text or logo.",
      "An alchemist's distillery machine of copper coils and glass bulbs is inked with a bold outer contour and lighter secondary lines inside. No readable text or logo.",
      "A giant music box sits open in a ballroom, its drum, comb and dancing figures shown through clean structured ink lines. No readable text or logo.",
    ] },
    'SP22-162': { briefs: [
      "Crosshatched along every curve and plate of its armored tail, a biomechanical scorpion guardian rises over the entrance of a buried vault. No readable text or logo.",
      "A cyborg falcon spreads its wings over a canyon, directional hatching following each feather, cable and riveted joint of its body. No readable text or logo.",
      'A living engine of bone and brass throbs in a dark chamber, crosshatched in dense curved lines. No readable text or logo.',
    ] },
    'SP22-163': { briefs: [
      "A starship hull glides past a nebula that is reflected in clean geometric highlight bands across every polished plate. No readable text or logo.",
      "A power-armor helmet rests on a workbench, crisp spectral reflections of the workshop sliding across its visor and angular panels. No readable text or logo.",
      "A hover racer hangs over a white salt flat at noon, geometric reflections of sky and ground sliding across its polished shell. No readable text or logo.",
    ] },
    'SP22-164': { briefs: [
      'A toy robot army marches across a carpet, simplified volumes and subtle surface differences like plastic figures. No readable text or logo.',
      "A chunky toy airship floats over a bedroom city of wooden blocks, its rounded balloon and gondola in stylized dimensional render. No readable text or logo.",
      "A toy dragon with rounded plastic joints guards a treasure chest made of wooden blocks on a nursery rug. No readable text or logo.",
    ] },
  },
  creates: [
    study('Transparent Shell Rendering', 'ghosted see-through exterior', 'transparent-shell', {
      aesthetic: 'Transparent shell rendering: technical illustration where the outer shell of an object is ghosted to glass so every inner mechanism shows through clearly.',
      subject_treatment: `${keep}; render the outer shell as faint transparent glass and show its internal parts fully.`,
      color_and_tone: 'Pale ghosted shell tints over saturated interior parts in brass, steel and color accents.',
      lighting_and_shadow: 'Soft studio light with subtle reflections on the glassy shell.',
      texture_and_material: 'Faint shell outlines, polished gears, wires, pipes and inner structure.',
      camera_and_composition: 'Three-quarter view with the object centered on a clean background.',
      atmosphere_and_mood: 'Curious, explanatory and precise, showing how everything fits inside.',
      rendering_and_quality: "Crisp detailed internals with clean consistent transparency, kept consistent across the whole image.",
      key_features: 'ghosted glass shell; visible internals; three-quarter view; clean background',
    }, ['opaque solid exterior'], [
      'A dragon is shown with its scaly hide ghosted to glass, revealing the fire bellows and furnace inside its chest. No readable text or logo.',
      'A pocket watch the size of a house is ghosted open to show tiny workers riding its gears. No readable text or logo.',
      'A whale submarine glides with its hull transparent, showing cabins, crew bunks and a tiny kitchen. No readable text or logo.',
    ]),
    study('Grey-Clay Form Study', 'untextured grey model painting', 'grey-clay', {
      aesthetic: 'Grey-clay form study: the subject painted as if sculpted in plain grey clay, with no color or texture, so only form, light and shadow remain.',
      subject_treatment: `${keep}; render the subject entirely in plain matte grey to study its form.`,
      color_and_tone: 'Neutral matte greys from soft white to charcoal, no color at all.',
      lighting_and_shadow: 'Clear key light and soft ambient occlusion revealing every form change.',
      texture_and_material: 'Smooth untextured clay surface with subtle sculpted tool marks.',
      camera_and_composition: 'Clean studio framing on a neutral grey backdrop.',
      atmosphere_and_mood: 'Calm, analytical and sculptural, form above all else.',
      rendering_and_quality: "Precise believable shading of volume without distractions, kept consistent across the whole image.",
      key_features: 'matte grey clay; no color; form-revealing light; neutral backdrop',
    }, ['colorful textures'], [
      'A heroic warrior on a rearing horse is shown in plain grey clay, every muscle clear in the studio light. No readable text or logo.',
      'A goblin market stall is sculpted in grey clay, down to the tiny grey fish on the counter. No readable text or logo.',
      "A giant octopus wrapped around a lighthouse is sculpted in matte grey clay only, every sucker and brick revealed by the studio key light. No readable text or logo.",
    ]),
    study('Motion-Path Mechanics', 'movement arcs mechanical diagram', 'motion-path', {
      aesthetic: 'Motion-path mechanics: technical illustrations showing how parts move, with ghosted repeated positions and clean dotted arcs tracing each movement.',
      subject_treatment: `${keep}; show the moving parts of the subject in several ghosted positions along clean arcs.`,
      color_and_tone: 'Clean neutral base colors with one bright accent color for motion arcs.',
      lighting_and_shadow: 'Even technical lighting so every ghost position reads clearly.',
      texture_and_material: 'Ghosted translucent copies, dotted motion arcs and crisp outlines.',
      camera_and_composition: 'Side or three-quarter view with motion arcs sweeping across the frame.',
      atmosphere_and_mood: 'Precise and explanatory, the beauty of movement understood.',
      rendering_and_quality: "Clean technical rendering with clear sequential ghosts, kept consistent across the whole image.",
      key_features: 'ghosted repeated positions; dotted arcs; accent color; sequential motion',
    }, ['motion blur smear', 'readable numbers'], [
      "A mechanical eagle's wing is shown in five ghosted positions along a sweeping dotted arc, its gears visible at every joint. No readable text or logo.",
      'A catapult arm swings through ghosted stages from loaded to release, the stone following a dotted path. No readable text or logo.',
      "A robot dancer spins on one foot, each leg position ghosted along curving dotted arcs like a choreography diagram in teal. No readable text or logo.",
    ]),
    study('Weapon Profile Rendering', 'side-profile weapon design render', 'weapon-profile', {
      aesthetic: 'Weapon profile rendering: swords, staffs and tools shown in clean flat side profile, precisely rendered like a collector\'s display on a neutral ground.',
      subject_treatment: `${keep}; show the object in clean side profile with every material rendered precisely.`,
      color_and_tone: 'Neutral dark or light ground with rich steel, leather, gold and gem colors.',
      lighting_and_shadow: 'Even top light with crisp highlights along blades and edges.',
      texture_and_material: 'Polished steel, wrapped leather grips, engraved guards and gem inlays.',
      camera_and_composition: 'Orthographic side view, object centered and fully visible.',
      atmosphere_and_mood: "Precious and precise, a museum-quality display piece, kept consistent across the whole image.",
      rendering_and_quality: "Highly detailed material rendering with clean edges, kept consistent across the whole image.",
      key_features: 'flat side profile; precise materials; neutral ground; display piece',
    }, ['perspective distortion', 'readable engraving'], [
      "A whale-bone greatsword with a leather-wrapped hilt lies in perfect side profile on dark velvet, every chip on its edge catching light. No readable text or logo.",
      "A wizard's staff of twisted oak crowned with a blue crystal is displayed full-length on grey stone, bark and gem rendered precisely. No readable text or logo.",
      "A chef's legendary cleaver with a pearl handle and rippled steel is shown in crisp side view on a slate board. No readable text or logo.",
    ]),
    study('Scale-Comparison Lineup', 'size comparison against figures', 'scale-lineup', {
      aesthetic: 'Scale-comparison lineup: subjects shown side by side with a small human silhouette or familiar objects so their size reads instantly, like a field guide chart.',
      subject_treatment: `${keep}; place the subject beside a simple human silhouette or familiar object for scale.`,
      color_and_tone: 'Clean light ground with naturalistic subject colors and grey silhouettes.',
      lighting_and_shadow: "Even lighting with small consistent ground shadows, kept consistent across the whole image.",
      texture_and_material: 'Clean rendering of the subject with flat grey reference silhouettes.',
      camera_and_composition: 'Side-on lineup on a common ground line from small to large.',
      atmosphere_and_mood: 'Informative and slightly awe-inspiring when the scale surprises.',
      rendering_and_quality: 'Consistent scale and clean presentation across the lineup.',
      key_features: 'common ground line; human silhouette for scale; side-on lineup; field-guide feel',
    }, ['readable measurements'], [
      'A dragon towers over a tiny grey human silhouette and a house, all standing on one ground line. No readable text or logo.',
      "Five sea monsters line up from shrimp-sized to ship-sized on one ground line beside a single swimming human outline for scale. No readable text or logo.",
      "A giant snail stands next to a bicycle and a human silhouette on one ground line, both of them comically small beside its shell. No readable text or logo.",
    ]),
    study('Flat Vector Technical', 'clean flat vector machine art', 'flat-vector-tech', {
      aesthetic: 'Flat vector technical: machines and objects drawn in clean flat vector shapes with simple gradients, geometric precision and a limited modern palette.',
      subject_treatment: `${keep}; simplify the subject into precise flat vector shapes while keeping its structure.`,
      color_and_tone: 'Limited modern palette of teal, coral, navy and cream with simple gradients.',
      lighting_and_shadow: "Flat shadow shapes and simple two-step highlights, kept consistent across the whole image.",
      texture_and_material: 'Crisp geometric shapes, clean edges and subtle gradient fills.',
      camera_and_composition: 'Isometric or side views with generous negative space.',
      atmosphere_and_mood: "Clean, friendly and modern, technology made simple, kept consistent across the whole image.",
      rendering_and_quality: 'Precise vector clarity with consistent line and shape logic.',
      key_features: 'flat vector shapes; limited palette; geometric precision; simple gradients',
    }, ['painterly texture'], [
      "A flying submarine glides through fluffy clouds in clean teal and coral flat vector shapes, a tiny captain waving from the hatch. No readable text or logo.",
      "A robot barista brews coffee in a flat vector cafe, simple gradient steam rising from three cups on the counter. No readable text or logo.",
      "A castle-shaped power plant hums on a green hill, drawn in precise geometric flat shapes with glowing windows. No readable text or logo.",
    ]),
    study('Material Breakdown Panels', 'object with material swatch panels', 'material-panels', {
      aesthetic: 'Material breakdown panels: the subject shown whole with small framed panels beside it presenting close-ups of its materials, stone, metal, cloth or scale.',
      subject_treatment: `${keep}; show the subject whole with a few small close-up panels of its surface materials.`,
      color_and_tone: 'Neutral ground with rich material colors repeated in the close-up panels.',
      lighting_and_shadow: 'Consistent studio lighting across main view and close-ups.',
      texture_and_material: 'Detailed material close-ups of metal, leather, fabric, scales or stone.',
      camera_and_composition: 'Main view dominant with three or four small square panels beside it.',
      atmosphere_and_mood: 'Precise and tactile, design understood through its materials.',
      rendering_and_quality: "Clean presentation with detailed material rendering, kept consistent across the whole image.",
      key_features: 'main view plus material panels; close-up swatches; consistent lighting; neutral ground',
    }, ['readable labels'], [
      'A dragon rider\'s saddle is shown whole beside close-up panels of its leather, brass buckles and scale padding. No readable text or logo.',
      "A witch's broom stands beside small square panels showing close-ups of its twig bristles, carved handle and tarnished silver bands. No readable text or logo.",
      'A knight\'s shield is displayed with close-ups of its painted wood, iron rim and battle scratches. No readable text or logo.',
    ]),
    study('Stress-Analysis Color Map', 'engineering stress color overlay', 'stress-map', {
      aesthetic: 'Stress-analysis color map: objects rendered with a rainbow engineering overlay showing stress, from cool blue calm zones to hot red strain points.',
      subject_treatment: `${keep}; render the subject with a smooth stress color map flowing over its form.`,
      color_and_tone: 'Rainbow gradient from deep blue through green and yellow to hot red.',
      lighting_and_shadow: 'Soft shading under the color map to keep form readable.',
      texture_and_material: 'Smooth simulation gradients, faint mesh lines and clean surfaces.',
      camera_and_composition: "Three-quarter view on a dark neutral ground, kept consistent across the whole image.",
      atmosphere_and_mood: 'Technical and tense, showing where things are about to break.',
      rendering_and_quality: 'Clean smooth gradient mapping that follows the form.',
      key_features: 'rainbow stress gradient; hot red strain points; faint mesh; dark ground',
    }, ['readable numbers'], [
      'A bridge held up by a single sleeping giant glows red at his shoulders in a stress color map. No readable text or logo.',
      "A knight's sword glows hot red with strain along its edge where it has struck a troll's stone hide, the rest of the blade calm blue. No readable text or logo.",
      "A wooden chair with a very large cat sitting on it glows hot red at every leg in a rainbow stress color map. No readable text or logo.",
    ]),
    study('Magnified Detail Insets', 'main view with magnified circles', 'magnified-insets', {
      aesthetic: 'Magnified detail insets: a full illustration of the subject with circular magnified insets connected by thin lines, revealing tiny hidden details.',
      subject_treatment: `${keep}; show the subject whole with two or three circular close-up insets of its details.`,
      color_and_tone: 'Consistent illustration colors with clean white or dark inset borders.',
      lighting_and_shadow: "Matching lighting in main view and insets, kept consistent across the whole image.",
      texture_and_material: 'Fine details revealed in insets, thin connector lines and crisp circles.',
      camera_and_composition: 'Main subject centered with insets around it linked by lines.',
      atmosphere_and_mood: "Curious and delightful, discovering the small secrets, kept consistent across the whole image.",
      rendering_and_quality: 'Clear consistent detail in both main view and magnified circles.',
      key_features: 'circular magnified insets; connector lines; hidden details; main view',
    }, ['readable labels'], [
      'A giant tree is shown whole while magnified circles reveal a tiny door, a sleeping mouse and a hidden key in its bark. No readable text or logo.',
      'A dragon rests on its hoard as insets zoom in on a single cursed ring and a trapped fly on its scales. No readable text or logo.',
      'A castle wall appears with insets showing a spy in a window and a cat on a gargoyle. No readable text or logo.',
    ]),
    study('Catalog Hero Illustration', 'product catalog hero image', 'catalog-hero', {
      aesthetic: 'Catalog hero illustration: objects painted as glossy hero products for an old mail-order catalog, perfect lighting, soft drop shadow and cheerful presentation.',
      subject_treatment: `${keep}; present the subject as an idealized product on a clean ground.`,
      color_and_tone: 'Clean bright colors on a soft pastel or white ground.',
      lighting_and_shadow: 'Flattering studio light with a soft drop shadow beneath.',
      texture_and_material: 'Glossy idealized surfaces, clean edges and gentle reflections.',
      camera_and_composition: 'Three-quarter hero angle, object centered with space around it.',
      atmosphere_and_mood: "Optimistic, appealing and slightly retro commercial charm, kept consistent across the whole image.",
      rendering_and_quality: "Polished painted product rendering, never photographic, kept consistent across the whole image.",
      key_features: 'idealized product; soft drop shadow; clean ground; retro catalog charm',
    }, ['readable prices or text', 'real brand'], [
      'A pet dragon egg incubator sits on a pastel ground, glowing warmly like the best gift of the year. No readable text or logo.',
      "A self-rowing boat for one is presented shining and new on a pastel ground, its little oars mid-stroke and a soft shadow beneath. No readable text or logo.",
      "A deluxe wizard hat with a built-in candle holder and star lining is displayed at a perfect hero angle with a soft drop shadow. No readable text or logo.",
    ]),
    study('Retro Manual Two-Tone', 'vintage instruction manual illustration', 'retro-manual', {
      aesthetic: 'Retro manual two-tone: vintage instruction manual illustration printed in black and one flat color, with clean line drawing and simple hatching.',
      subject_treatment: `${keep}; draw the subject as a clear manual illustration in black line and one flat accent color.`,
      color_and_tone: 'Black ink with one flat accent such as orange, teal or red on off-white paper.',
      lighting_and_shadow: 'Simple hatching and flat color blocks for shadow.',
      texture_and_material: 'Clean line art, light hatching, flat color overprint and paper grain.',
      camera_and_composition: 'Clear explanatory views with hands or tools demonstrating use.',
      atmosphere_and_mood: 'Helpful, earnest and nostalgic, like an old how-to booklet.',
      rendering_and_quality: "Precise clean manual drawing with limited color, kept consistent across the whole image.",
      key_features: 'black line; one flat color; simple hatching; how-to feel',
    }, ['full color painting', 'readable instructions'], [
      'A pair of hands demonstrates how to saddle a griffin, drawn in black line with flat orange accents. No readable text or logo.',
      "A cutaway shows the correct way to refill a fox-shaped lantern with fire, hands and tongs drawn in black line with flat teal accents. No readable text or logo.",
      'A knight demonstrates the correct way to fold a cape, in two tones like an old manual. No readable text or logo.',
    ]),
    study('Hand-Tinted Mechanical Plate', 'antique encyclopedia machine plate', 'tinted-mechanical', {
      aesthetic: 'Hand-tinted mechanical plate: antique encyclopedia engravings of machines and inventions, finely hatched and lightly colored by hand.',
      subject_treatment: `${keep}; render the subject as a finely engraved mechanical plate with light hand tints.`,
      color_and_tone: 'Black engraved line with pale hand tints of ochre, blue and rose on aged paper.',
      lighting_and_shadow: 'Fine hatched shading with pale tints softening light areas.',
      texture_and_material: 'Engraved line, crosshatching, aged paper and uneven tint edges.',
      camera_and_composition: 'Clear diagram-like views with several parts arranged on the plate.',
      atmosphere_and_mood: 'Scholarly, antique and inventive, the age of wonders.',
      rendering_and_quality: "Precise engraving with delicate imperfect tinting, kept consistent across the whole image.",
      key_features: 'engraved mechanical plate; hand tints; aged paper; several views',
    }, ['modern digital look', 'readable captions'], [
      'A flying machine with feathered wings is engraved in several views and tinted in faded ochre. No readable text or logo.',
      'A mechanical elephant for carrying royalty is shown in engraved side and top views with blue tints. No readable text or logo.',
      "A diving bell for exploring sea caves is engraved in section with its tiny crew inside and tinted pale green and ochre by hand. No readable text or logo.",
    ]),
  ],
};

export default spec;
