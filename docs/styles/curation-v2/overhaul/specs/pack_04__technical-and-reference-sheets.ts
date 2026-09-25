import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'placeholder gibberish text',
  'invented numbers presented as data',
  'readable labels',
  'brand logo',
  'franchise likeness',
  'free painterly composition instead of a sheet',
];

// Profile category: every preset owns a reference-sheet layout. Review rule: a reference sheet stays a sheet,
// and no placeholder gibberish is presented as valid technical data, so callouts are blank tags, arrows and symbols.
const sheet = (what: string) =>
  `Keep the prompt subject as the thing documented; this reference profile owns ${what}, stays a sheet, and shows callouts as blank tags, arrows and symbols instead of invented text or numbers.`;

function ref(what: string, parts: Omit<Dna, 'subject_treatment'>): Dna {
  const { aesthetic, ...rest } = parts;
  return { aesthetic, subject_treatment: sheet(what), ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_04',
  category: '6. Technical And Reference Sheets',
  updates: {
    'SP04-057': {
      dna: ref(
        'a drafting sheet of plan, elevation and section views with dimension lines and an empty title block',
        {
          aesthetic:
            'Engineering blueprint sheet: white drafted lines on Prussian blue diazo paper, the subject shown in plan, side elevation and section.',
          color_and_tone:
            'Deep Prussian blue ground, crisp white line work, a faint lighter blue grid, no other colors.',
          lighting_and_shadow:
            'No light or shading at all; sections use white diagonal hatching to mark cut material.',
          texture_and_material:
            'Hard uniform technical-pen lines in several weights, slight paper fold marks and a faint grid.',
          camera_and_composition:
            'Orthographic views aligned on projection lines, dimension lines with blank value gaps, an empty title block in the corner.',
          atmosphere_and_mood: 'Exact and engineered, a thing ready to be built.',
          rendering_and_quality:
            'Flat drafted line drawing with no perspective, no 3D shading and no fake measurement text.',
          key_features:
            'white lines on Prussian blue; plan, elevation and section; hatched cut material; blank dimension gaps; empty title block',
        },
      ),
      avoid: [...AVOID, 'perspective render', 'glowing hologram'],
      briefs: [
        'Blueprint schematic of a counterweight trebuchet in plan, side elevation and section, white drafted lines on Prussian blue, hatched timber in the section, dimension lines with blank value gaps and an empty title block. No readable text or logo.',
        'Blueprint schematic of a drawbridge gatehouse mechanism with its chain drums and counterweights, projection lines linking the views. No readable text or logo.',
        'Blueprint schematic of a clockwork diving bell with its hatch, ballast racks and air valves shown in section. No readable text or logo.',
      ],
    },
    'SP04-059': {
      dna: ref('a first-person screen view with a heads-up display overlaid on the subject', {
        aesthetic:
          'Heads-up display design: thin luminous vector reticles, arcs and gauges floating over a first-person view of the subject.',
        color_and_tone:
          'One or two HUD colors such as cyan and amber at partial opacity over a darkened, slightly desaturated scene.',
        lighting_and_shadow:
          'HUD elements emit a soft glow and cast no shadow; the scene behind keeps its own light, dimmed for contrast.',
        texture_and_material:
          'Hairline vector strokes, segmented arcs, faint scanline and bloom on the brightest marks.',
        camera_and_composition:
          'First-person frame with a central reticle, a horizon ladder, corner gauges and a radar arc framing the subject.',
        atmosphere_and_mood: 'Tense and focused, information wrapped around what you see.',
        rendering_and_quality:
          'Crisp vector interface layered over the view, using symbols and bars instead of readable numbers or words.',
        key_features:
          'central reticle; horizon ladder; segmented gauges; radar arc; cyan and amber glow',
      }),
      avoid: [...AVOID, 'character portrait with decorative HUD shapes', 'readable numbers'],
      dropAvoid: ['UI overlay', 'organic'],
      briefs: [
        "Heads-up display view from a dragon rider's saddle between the dragon's horns, diving through storm clouds, thin cyan reticle and horizon ladder, amber altitude arcs in the corners. No readable numbers, text or logo.",
        'Heads-up display view from a deep-sea exosuit helmet looking into a kelp trench, a radar arc pinging a shadowy shape. No readable numbers, text or logo.',
        'Heads-up display view from a mining drone scanning an asteroid ore vein, segmented gauges and a target bracket around the glittering seam. No readable numbers, text or logo.',
      ],
    },
    'SP04-086': {
      dna: ref(
        'a product-manual sheet with one hatched hero view and circular magnified callouts',
        {
          aesthetic:
            'Technical callout sheet: the subject drawn in hatched line and grey tone, with circular magnified detail views linked by leader lines.',
          color_and_tone:
            'Black line and neutral grey tone on white, with one blue accent for callout circles and leader lines.',
          lighting_and_shadow:
            'Conventional upper-left light rendered as line hatching and flat grey steps, no cast environment shadows.',
          texture_and_material:
            'Clean technical line, diagrammatic hatching for curves, material shown by hatch pattern inside each callout.',
          camera_and_composition:
            'Large three-quarter hero view, three or four circular callouts around it, leader lines ending in blank tags.',
          atmosphere_and_mood: 'Clear and instructive, every detail pointed out.',
          rendering_and_quality:
            'Manual-illustration finish with blank tags instead of words; no painted scene behind the object.',
          key_features:
            'hatched hero view; circular magnified callouts; blue leader lines; blank tags; white ground',
        },
      ),
      avoid: [...AVOID, 'readable part names'],
      briefs: [
        'Callout detail sheet of a medieval plate gauntlet, hatched line hero view with four circular magnified callouts on the knuckle lames, rivets and leather lining, blue leader lines ending in blank tags. No readable text or logo.',
        'Callout detail sheet of a hand-cranked hurdy-gurdy, callouts on the wheel, key box and tuning pegs. No readable text or logo.',
        "Callout detail sheet of a ship's brass sextant, magnified views of the index mirror, vernier and filter shades. No readable text or logo.",
      ],
    },
    'SP04-094': {
      dna: ref('a classical anatomy plate with skin, muscle and skeleton layers side by side', {
        aesthetic:
          'Anatomy reference plate: the subject shown as layered écorché studies, surface, muscle and skeleton, like a hand-colored medical engraving.',
        color_and_tone:
          'Sepia line on aged cream paper, muscles in muted madder red, tendons ivory, bone warm white.',
        lighting_and_shadow:
          'Soft consistent top-left light modeling each layer with fine hatching.',
        texture_and_material:
          'Engraved fiber-direction lines in muscle, stippled bone, crisp tendon edges and paper foxing.',
        camera_and_composition:
          'Two or three matching views side by side at one scale, with small sectional insets and blank leader lines.',
        atmosphere_and_mood: 'Scholarly and exact, the body opened for study.',
        rendering_and_quality:
          'Accurate layered anatomy with consistent proportion across layers; no gore beyond the dissection.',
        key_features:
          'surface, muscle and skeleton layers; madder red muscle; sepia engraving line; sectional insets; blank leader lines',
      }),
      avoid: [...AVOID, 'gore', 'loose sketch'],
      dropAvoid: ['fantasy proportion', 'stylized'],
      briefs: [
        'Anatomy reference plate of a griffin shown in three layers side by side, feathered surface, madder-red wing and haunch muscles and warm white skeleton, sepia engraving line on cream paper with blank leader lines. No readable text or logo.',
        "Anatomy reference plate of a draft horse's hind leg, surface, muscle and bone views with a sectional inset of the hock. No readable text or logo.",
        "Anatomy reference plate of a bat's wing, membrane, muscle and elongated finger bones at one scale. No readable text or logo.",
      ],
    },
    'SP04-099': {
      dna: ref(
        'a set of low-fidelity grey-box interface wireframes for a screen built around the subject',
        {
          aesthetic:
            'UI wireframe: low-fidelity grey boxes, crossed image placeholders and bar-shaped text stand-ins mapping a game or app screen.',
          color_and_tone:
            'White and light grey panels, mid-grey placeholders, one blue annotation color for arrows and highlights.',
          lighting_and_shadow:
            'Flat, with no light or shading beyond a thin drop line under active panels.',
          texture_and_material:
            'Thin uniform strokes, dashed boundaries, crossed rectangles and rounded grey bars instead of words.',
          camera_and_composition:
            'Two or three screen alternatives side by side, radial versus linear layout options, blue arrows marking flow.',
          atmosphere_and_mood:
            'Functional and provisional, structure decided long before any style.',
          rendering_and_quality:
            'Clean wireframe without final art, color theme or readable words.',
          key_features:
            'grey-box panels; crossed image placeholders; grey bars instead of text; blue flow arrows; layout alternatives',
        },
      ),
      avoid: [...AVOID, 'finished game art', 'poster illustration'],
      dropAvoid: ['UI overlay'],
      briefs: [
        "UI wireframe of an alchemist's potion-crafting screen, grey-box ingredient slots, a crossed placeholder for the cauldron, grey bars instead of recipe text and blue flow arrows, two layout alternatives side by side. No readable text or logo.",
        'UI wireframe of a spellbook interface drawn as a two-page spread of slot grids, radial and linear menu options compared. No readable text or logo.',
        "UI wireframe of a sailing ship's navigation console, a crossed chart placeholder and dashed wind and heading dials. No readable text or logo.",
      ],
    },
    'SP04-100': {
      dna: ref('a size-comparison lineup of silhouettes on a height grid with a human benchmark', {
        aesthetic:
          'Size comparison chart: variants of the subject lined up smallest to largest as flat silhouettes on a height grid, a human figure for scale.',
        color_and_tone:
          'Warm off-white ground, charcoal silhouettes with slight value steps, one accent color for the featured form.',
        lighting_and_shadow:
          'No modeling; silhouettes read flat, with small ground-contact shadows only.',
        texture_and_material:
          'Clean filled silhouettes, thin grid lines, faint paper texture and tick marks on the height axis.',
        camera_and_composition:
          'Strict side view on one ground line, subjects ordered by height, human silhouette at the small end, tick marks without numbers.',
        atmosphere_and_mood: 'Awe through scale, the largest shape dwarfing the rest.',
        rendering_and_quality:
          'Clear comparative chart with consistent scale and no unit numbers or names.',
        key_features:
          'smallest-to-largest lineup; human scale silhouette; height grid; shared ground line; unnumbered tick marks',
      }),
      avoid: [...AVOID, 'perspective scene', 'monsters fighting'],
      dropAvoid: ['human-centric', 'tiny'],
      briefs: [
        'Size comparison chart of six sea serpent species in charcoal silhouettes from eel-sized to leviathan, a rowing boat and an adult human silhouette at the small end, height grid with unnumbered ticks. No readable text or logo.',
        'Size comparison chart of ancestral giant wolves beside a modern wolf and a mounted rider silhouette. No readable text or logo.',
        'Size comparison chart of golems from pebble-sized to a mountain golem, the largest in a rust accent color. No readable text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Patent Figure Plate',
      domain: 'patent line drawing',
      tags: ['patent-drawing', 'line-art', 'reference-sheet'],
      dna: ref(
        'a patent-style plate of several black-line figures with leader lines ending at blank points',
        {
          aesthetic:
            'Patent drawing plate: the subject in precise black ink line on white, shown as several figures with surface-shading lines and leader lines.',
          color_and_tone: 'Pure black ink on bright white paper, no grey fill or color.',
          lighting_and_shadow:
            'Conventional light from upper left expressed by thicker shade lines on the lower right edges and parallel surface lines on curves.',
          texture_and_material:
            'Uniform technical-pen lines, parallel shading strokes on cylinders, stippled section faces, dashed hidden lines.',
          camera_and_composition:
            'Three or four figures on one sheet: perspective view, side view, section and exploded detail, leader lines ending at blank points.',
          atmosphere_and_mood: 'Ingenious and formal, an invention laid open for examination.',
          rendering_and_quality:
            'Crisp reproduction-ready line art with no reference numerals, captions or signatures.',
          key_features:
            'black line on white; thick shade lines; parallel surface shading; several figures on one sheet; blank leader lines',
        },
      ),
      avoid: [...AVOID, 'reference numerals', 'grey wash', 'color'],
      briefs: [
        'Patent figure plate of a clockwork bird-scarer with flapping iron arms, perspective view, side view and section on one white sheet, thick shade lines on the lower edges, leader lines ending at blank points. No readable numerals, text or logo.',
        "Patent figure plate of a folding traveller's writing desk shown closed, opened and in exploded detail, stippled section faces. No readable numerals, text or logo.",
        "Patent figure plate of a clockwork music box with a rotating pinned cylinder and a tuned steel comb, shown in exploded view with dashed hidden lines, leader lines and parallel shading on the cylinders. No readable numerals, text or logo.",
      ],
    },
    {
      name: 'Botanical Dissection Plate',
      domain: 'scientific plant plate',
      tags: ['botanical-plate', 'dissection', 'watercolor'],
      dna: ref(
        'a botanical plate with the whole plant plus dissected flower, fruit and section studies',
        {
          aesthetic:
            'Botanical dissection plate: the whole plant in watercolor and fine line, surrounded by dissected flower parts, fruit sections and magnified details.',
          color_and_tone:
            'True botanical color in transparent watercolor on white, greens and petal hues accurate and unsaturated.',
          lighting_and_shadow:
            'Soft even light from upper left, shadows only as form modeling, no cast shadows on the paper.',
          texture_and_material:
            'Fine sepia outline, layered watercolor glazes, visible leaf venation and hairs on stems.',
          camera_and_composition:
            'Main plant specimen tall at the center, small numbered-style details arranged around it without any numbers.',
          atmosphere_and_mood: 'Calm, precise and scholarly, a plant taken apart with care.',
          rendering_and_quality:
            'Scientific accuracy in every part, clean white paper, no decorative border or captions.',
          key_features:
            'whole specimen plus dissections; flower and fruit sections; magnified details; watercolor over fine line; white ground',
        },
      ),
      avoid: [...AVOID, 'decorative floral border', 'vase arrangement'],
      briefs: [
        'Botanical dissection plate of a mandrake plant, the forked root, leaf rosette and purple flower at center, a dissected flower, a berry section and a magnified seed around it, watercolor glazes over fine sepia line on white. No readable text or logo.',
        'Botanical dissection plate of a deadly nightshade branch with its bell flowers opened and a glossy black berry cut in half. No readable text or logo.',
        'Botanical dissection plate of a giant cave mushroom, gill section, spore print and magnified spores beside the full fruiting body. No readable text or logo.',
      ],
    },
    {
      name: 'Field Guide Species Plate',
      domain: 'naturalist identification plate',
      tags: ['field-guide', 'species-plate', 'gouache'],
      dna: ref(
        'a field-guide plate showing sexes, life stages, a flight or gait silhouette and a track of one species',
        {
          aesthetic:
            'Field guide plate: one species painted in gouache as male, female and juvenile, with a flight or gait silhouette, egg or cocoon and a track.',
          color_and_tone:
            'Accurate naturalist color on a pale cream ground, plumage or coat variants side by side for comparison.',
          lighting_and_shadow:
            'Soft even light with tiny contact shadows, identical on every figure so markings compare fairly.',
          texture_and_material:
            'Opaque gouache feathers, fur and scales, clean edges, small black silhouettes and footprint marks.',
          camera_and_composition:
            'Figures in strict profile arranged in two rows at one scale, silhouettes and track below.',
          atmosphere_and_mood: 'Observant and patient, a species learned at a glance.',
          rendering_and_quality:
            'Identification-grade clarity with no habitat scene and no species names.',
          key_features:
            'male, female and juvenile; profile figures at one scale; flight or gait silhouette; track and egg; cream ground',
        },
      ),
      avoid: [...AVOID, 'habitat scene', 'species names'],
      briefs: [
        'Field guide species plate of a marsh wyvern, adult male, female and hatchling in gouache profile, a black flight silhouette from below, a speckled egg and a three-toed track on a pale cream ground. No readable text or logo.',
        'Field guide species plate of a spotted forest lynx in winter and summer coat, a kitten, its skull and a pawprint. No readable text or logo.',
        'Field guide species plate of a luna moth, upperside and underside, caterpillar and cocoon at matching scale. No readable text or logo.',
      ],
    },
    {
      name: 'Pose Library Sheet',
      domain: 'figure pose reference',
      tags: ['pose-reference', 'figure-sheet', 'grey-render'],
      dna: ref(
        'a library of eight to twelve poses of the same figure on a floor grid under identical light',
        {
          aesthetic:
            'Pose library sheet: the same figure repeated in eight to twelve poses, rendered in neutral grey tone like a clay study.',
          color_and_tone:
            'Neutral grey figures on a light grey ground, a single mid-grey floor grid, no costume colors.',
          lighting_and_shadow:
            'One identical top-left key and soft fill on every pose, with a small contact shadow each.',
          texture_and_material:
            'Smooth matte grey surfaces with clear planes; costume simplified to readable folds and silhouettes.',
          camera_and_composition:
            'Poses in two or three rows at one scale and one camera height, each on its own floor-grid square.',
          atmosphere_and_mood: 'Practical and neutral, movement catalogued for animators.',
          rendering_and_quality:
            'Consistent proportions and scale across poses; no action effects and no background.',
          key_features:
            'eight to twelve poses; neutral grey clay tone; identical lighting; floor grid squares; one camera height',
        },
      ),
      avoid: [...AVOID, 'motion blur effects', 'scenic background'],
      briefs: [
        'Pose library sheet of an adult swordswoman in ten poses, guard, lunge, parry, spin, kneel and fall, rendered in neutral grey clay tone on floor-grid squares under one identical top-left light. No readable text or logo.',
        'Pose library sheet of a goblin thief sneaking, climbing, hiding and pickpocketing, twelve grey poses at one scale. No readable text or logo.',
        'Pose library sheet of an adult archer drawing, loosing, kneeling and nocking, eight poses from one camera height. No readable text or logo.',
      ],
    },
    {
      name: 'Expression Model Sheet',
      domain: 'facial expression reference',
      tags: ['model-sheet', 'expressions', 'line-art'],
      dna: ref(
        'a grid of nine to twelve heads of the same character, each with a different expression',
        {
          aesthetic:
            'Expression model sheet: one character head drawn nine to twelve times in clean line with a single grey tone, each with a different expression.',
          color_and_tone:
            'Black line with one flat grey shadow tone on white, an optional pale skin flat on the first head only.',
          lighting_and_shadow:
            'Simple cel shadow from one consistent direction so the only change between heads is the expression.',
          texture_and_material:
            'Clean confident animation line, construction center lines faintly visible under a few heads.',
          camera_and_composition:
            'Heads in an even grid, mostly front and three-quarter, identical size and head proportion.',
          atmosphere_and_mood: 'Lively and consistent, one personality in many moods.',
          rendering_and_quality:
            'On-model consistency across every head; no captions for the emotions.',
          key_features:
            'nine to twelve heads; one character; clean line plus one grey tone; even grid; faint construction lines',
        },
      ),
      avoid: [...AVOID, 'different characters per head', 'emotion captions'],
      briefs: [
        'Expression model sheet of an adult hedge witch with a crooked nose and a wart, twelve heads in an even grid, cackling, scheming, startled, weeping, clean black line with one grey tone. No readable text or logo.',
        'Expression model sheet of a stone gargoyle, nine heads from sleepy to snarling, faint construction lines under three of them. No readable text or logo.',
        'Expression model sheet of an adult ogre cook with a bulldog face, ten heads from tasting to rage. No readable text or logo.',
      ],
    },
    {
      name: 'Garment Pattern Layout',
      domain: 'sewing pattern sheet',
      tags: ['sewing-pattern', 'garment', 'tissue-paper'],
      dna: ref(
        'a flat sewing-pattern layout of the garment pieces with a small croquis of the finished piece',
        {
          aesthetic:
            'Garment pattern layout: the costume of the subject flattened into sewing pattern pieces printed on pale tissue paper, with a small croquis of the finished garment.',
          color_and_tone:
            'Translucent pale tan tissue, black printed outlines, one or two line colors for different sizes.',
          lighting_and_shadow:
            'Flat soft light with faint shadows where the tissue wrinkles or overlaps.',
          texture_and_material:
            'Thin tissue with creases and slight transparency, dashed seam allowances, grainline arrows, notch triangles and fold marks.',
          camera_and_composition:
            'Top-down layout of nested pattern pieces filling the sheet, the croquis small in one corner.',
          atmosphere_and_mood: 'Methodical and crafty, a costume waiting to be cut.',
          rendering_and_quality:
            'Accurate pattern-piece shapes with no piece names, sizes or instructions written.',
          key_features:
            'flat pattern pieces; grainline arrows; notches and dashed seam lines; creased tissue paper; small croquis',
        },
      ),
      avoid: [...AVOID, 'model wearing the garment as main image', 'size numbers'],
      briefs: [
        "Garment pattern layout of an adult knight's quilted arming doublet, sleeves, fronts, back and collar nested on creased tan tissue, grainline arrows, notches and dashed seam lines, a small croquis in the corner. No readable text or logo.",
        "Garment pattern layout of a plague doctor's long waxed coat and hood, overlapping tissue sheets with faint shadows. No readable text or logo.",
        "Garment pattern layout of a bishop's embroidered cope, a huge half-circle piece with the orphrey band and hood shield beside it. No readable text or logo.",
      ],
    },
    {
      name: 'Wordless Assembly Steps',
      domain: 'assembly instruction sheet',
      tags: ['assembly-instructions', 'isometric-line', 'step-panels'],
      dna: ref('a wordless sequence of step panels showing how the subject is assembled', {
        aesthetic:
          'Wordless assembly instructions: clean isometric line drawings in six step panels, parts sliding into place along arrows.',
        color_and_tone:
          'Black line on white with light grey for already-assembled parts, one accent color for the part being added.',
        lighting_and_shadow: 'No shading beyond flat grey fills; depth from isometric line only.',
        texture_and_material:
          'Uniform thin lines, dashed motion paths, curved rotation arrows, simple hand icons and blank circles for step markers.',
        camera_and_composition:
          'Isometric views in a grid of six panels, the same angle throughout, the finished object in the last panel.',
        atmosphere_and_mood: 'Friendly and clear, building without reading a single word.',
        rendering_and_quality: 'Diagrammatic clarity, no step numbers, words or part codes.',
        key_features:
          'six step panels; isometric line drawings; dashed motion arrows; accent color on the new part; blank step circles',
      }),
      avoid: [...AVOID, 'step numbers', 'part codes'],
      briefs: [
        'Wordless assembly steps for a flat-pack siege ballista, six isometric line panels, the arms, frame and winch sliding into place along dashed arrows, the new part in orange each time. No readable numbers, text or logo.',
        'Wordless assembly steps for a round campaign tent, poles, canvas and guy ropes shown with hand icons and rotation arrows. No readable numbers, text or logo.',
        'Wordless assembly steps for a birdhouse shaped like a castle keep, crenellations clicking on in the last panel. No readable numbers, text or logo.',
      ],
    },
    {
      name: 'Poché Section Drawing',
      domain: 'architectural section',
      tags: ['section-drawing', 'poche', 'architecture'],
      dna: ref(
        'a vertical architectural section through the subject with cut walls filled solid black',
        {
          aesthetic:
            'Poché section drawing: the subject sliced vertically, cut walls and floors filled solid black, everything beyond drawn in thin elevation line.',
          color_and_tone:
            'Solid black poché, fine black line, hatched earth and one pale wash for sky or water.',
          lighting_and_shadow:
            'No light modeling; the contrast between black cut mass and thin lines creates all depth.',
          texture_and_material:
            'Ruled hairlines, earth hatching below grade, tiny scale figures and furniture in outline.',
          camera_and_composition:
            'Orthographic vertical section across the full width of the sheet, a clear ground line and small human figures for scale.',
          atmosphere_and_mood: 'Revealing and architectural, the inside of a building laid bare.',
          rendering_and_quality:
            'Crisp drafted line with confident black fill, no perspective and no room labels.',
          key_features:
            'solid black cut walls; thin beyond-elevation line; hatched earth; tiny scale figures; orthographic section',
        },
      ),
      avoid: [...AVOID, 'perspective cutaway', 'room labels'],
      briefs: [
        'Poché section drawing of a dwarven hall carved into a mountain, stairwells, forges and a vaulted throne room cut in solid black, thin lines for the rooms beyond, hatched rock and tiny figures for scale. No readable text or logo.',
        'Poché section drawing of a medieval bell foundry with its sunken casting pit and furnace chimney. No readable text or logo.',
        'Poché section drawing of a haunted manor revealing a secret passage behind the fireplace, winding down to a crypt. No readable text or logo.',
      ],
    },
    {
      name: 'Heraldry Tincture Sheet',
      domain: 'heraldic design study',
      tags: ['heraldry', 'tinctures', 'gouache'],
      dna: ref(
        'a grid of one shield design repeated in different tinctures and divisions, with charge studies',
        {
          aesthetic:
            'Heraldry design sheet: one coat of arms repeated in a grid of tincture and division variants, painted in gouache and shell gold on vellum.',
          color_and_tone:
            'Heraldic tinctures only: gules, azure, vert, sable, purpure, with gold and silver metals.',
          lighting_and_shadow:
            'Flat heraldic color with a thin black outline and a little burnished gold shine.',
          texture_and_material:
            'Opaque gouache fills, crisp black outlines, raised shell gold and vellum grain.',
          camera_and_composition:
            'Nine to twelve identical shield shapes in an even grid, a larger study of the main charge beside them.',
          atmosphere_and_mood: 'Proud and ceremonial, a lineage chosen color by color.',
          rendering_and_quality:
            'Clean heraldic drawing with consistent charge and no mottos or names.',
          key_features:
            'one shield in many tinctures; division variants; gouache and shell gold; charge study; even grid',
        },
      ),
      avoid: [...AVOID, 'motto scroll text', 'real national arms'],
      briefs: [
        'Heraldry tincture sheet of a shield bearing a rampant boar, twelve variants in gules, azure, vert and sable with per-pale and chevron divisions, gouache and shell gold on vellum, a large charge study beside the grid. No readable text or logo.',
        'Heraldry tincture sheet of a tower and key charge, nine variants with quartered and per-bend divisions. No readable text or logo.',
        'Heraldry tincture sheet of a two-headed eagle displayed, sable on gold and argent on purpure versions. No readable text or logo.',
      ],
    },
    {
      name: 'Celestial Atlas Plate',
      domain: 'constellation chart',
      tags: ['star-chart', 'constellation', 'engraving'],
      dna: ref(
        'a star-atlas plate where the subject becomes a constellation figure over plotted stars and a coordinate grid',
        {
          aesthetic:
            'Celestial atlas plate: the subject drawn as a hand-colored engraved constellation figure over a star field of graded dots and a coordinate grid.',
          color_and_tone:
            'Deep midnight blue ground, pale gold stars, figure in thin cream line with soft wash tints.',
          lighting_and_shadow:
            'No lighting; stars sized by magnitude as bright dots with tiny rays.',
          texture_and_material:
            'Engraved hairlines, stippled Milky Way band, faint curved coordinate lines and aged paper edges.',
          camera_and_composition:
            'The constellation figure filling a circular or rectangular chart, coordinate arcs curving across it.',
          atmosphere_and_mood: 'Mythic and quiet, a story written in the stars.',
          rendering_and_quality:
            'Precise engraved chart with no star names, degree numbers or captions.',
          key_features:
            'constellation figure; magnitude-sized star dots; curved coordinate grid; midnight blue and gold; engraved hairlines',
        },
      ),
      avoid: [...AVOID, 'photographic night sky', 'degree numbers'],
      briefs: [
        'Celestial atlas plate of a kraken constellation spreading its arms across a curved coordinate grid, pale gold magnitude-sized stars on midnight blue, the figure in thin engraved cream line. No readable text or logo.',
        'Celestial atlas plate of a sleeping giant constellation lying along the stippled Milky Way band. No readable text or logo.',
        'Celestial atlas plate of a ship with torn sails, its mast marked by three bright stars inside a circular chart. No readable text or logo.',
      ],
    },
    {
      name: 'Three-View Recognition Chart',
      domain: 'silhouette identification chart',
      tags: ['recognition-chart', 'three-view', 'silhouettes'],
      dna: ref(
        'a recognition chart of related types, each shown as black silhouettes in top, front and side views',
        {
          aesthetic:
            'Recognition chart: several related variants of the subject shown as solid black silhouettes in top, front and side view, like a spotter card.',
          color_and_tone:
            'Solid black silhouettes on off-white card, thin grey ruled rows, no other color.',
          lighting_and_shadow:
            'No light or interior detail; identification rests on silhouette alone.',
          texture_and_material:
            'Crisp filled shapes, faint grey rules, slightly worn printed card stock.',
          camera_and_composition:
            'Rows of types, each row with its top, front and side view aligned at one scale.',
          atmosphere_and_mood: 'Alert and methodical, knowing a shape before it arrives.',
          rendering_and_quality: 'Exact silhouettes without type names, codes or numbers.',
          key_features:
            'black silhouettes; top, front and side per type; ruled rows; one scale; worn card stock',
        },
      ),
      avoid: [...AVOID, 'type names', 'rendered detail'],
      briefs: [
        'Three-view recognition chart of six classes of war airship, each row showing black silhouettes from top, front and side on worn off-white card with thin grey rules. No readable text or logo.',
        'Three-view recognition chart of war galleys, cogs and longships, oars and sails reading clearly in silhouette. No readable text or logo.',
        'Three-view recognition chart of five dragon species in flight, wingspans compared from above, head-on and in profile. No readable text or logo.',
      ],
    },
    {
      name: 'Perspective Construction Drawing',
      domain: 'perspective drawing study',
      tags: ['perspective', 'construction-lines', 'industrial-drawing'],
      dna: ref(
        'a perspective construction drawing with vanishing lines, boxes and ellipses left visible under the final line',
        {
          aesthetic:
            'Perspective construction drawing: the subject built over a two- or three-point perspective grid, with boxes, ellipses and cross-contours left visible under the final line.',
          color_and_tone:
            'Blue col-erase construction lines under confident black final line on white, light grey marker shadow.',
          lighting_and_shadow:
            'One grey marker shadow plane on the underside and a cast shadow projected with visible construction.',
          texture_and_material:
            'Ruled vanishing lines, sketched ellipses with minor axes marked, cross-contour lines wrapping curved forms.',
          camera_and_composition:
            'Subject large on the sheet, vanishing points marked on or near the edges, horizon line drawn across.',
          atmosphere_and_mood: 'Analytical and confident, form understood from the inside out.',
          rendering_and_quality:
            'Construction left visible as the point of the image, no painted finish and no labels.',
          key_features:
            'visible vanishing lines; construction boxes and ellipses; cross-contours; blue under black line; projected cast shadow',
        },
      ),
      avoid: [...AVOID, 'finished rendering without construction', 'painted background'],
      briefs: [
        'Perspective construction drawing of a gothic reliquary chest with a pitched lid, blue construction boxes and ellipses under black final line, three vanishing points marked and a projected cast shadow in grey marker. No readable text or logo.',
        'Perspective construction drawing of a jousting saddle, cross-contour lines wrapping the high cantle and pommel. No readable text or logo.',
        'Perspective construction drawing of a spiral staircase tower seen from below, stacked ellipses and a vertical axis line. No readable text or logo.',
      ],
    },
    {
      name: 'Motion Cycle Linkage Study',
      domain: 'mechanism motion diagram',
      tags: ['mechanism', 'motion-study', 'diagram'],
      dna: ref(
        'a motion study where the subject mechanism is shown in ghosted successive positions through its cycle',
        {
          aesthetic:
            'Linkage motion study: a mechanism drawn in successive ghosted positions through one full cycle, pivots circled and trace paths plotted.',
          color_and_tone:
            'Black line for the key position, progressively paler grey ghosts, one red trace path on cream paper.',
          lighting_and_shadow: 'No shading; overlap and fading line weight show time.',
          texture_and_material:
            'Ruled links, compass-drawn pivot circles, dotted trace curves and small curved arrows.',
          camera_and_composition:
            'Side-view orthographic of the mechanism, positions overlapping in one frame, the traced path looping through it.',
          atmosphere_and_mood: 'Rhythmic and ingenious, movement frozen into a diagram.',
          rendering_and_quality:
            'Clean diagram with consistent link lengths across positions and no angle numbers.',
          key_features:
            'ghosted successive positions; circled pivots; red trace path; curved motion arrows; side-view diagram',
        },
      ),
      avoid: [...AVOID, 'motion blur', 'angle numbers'],
      briefs: [
        'Motion cycle linkage study of a clockwork dragon wing folding and unfolding, eight ghosted positions fading to pale grey, circled pivots and a red trace path looping from the wingtip. No readable text or logo.',
        "Motion cycle linkage study of an automaton blacksmith's hammering arm, the hammer head's red trace arc crossing the anvil line. No readable text or logo.",
        'Motion cycle linkage study of the walking leg of a wooden war machine, foot path plotted as a flattened red loop. No readable text or logo.',
      ],
    },
    {
      name: 'Archaeological Find Drawing',
      domain: 'artifact recording drawing',
      tags: ['archaeology', 'artifact-drawing', 'stipple'],
      dna: ref(
        'an archaeological record sheet with profile sections, stippled surfaces and reconstructed outlines of the subject as a find',
        {
          aesthetic:
            'Archaeological find drawing: the subject recorded as an excavated artifact, pottery-style half profiles with black section fill, stippled surfaces and dashed reconstructions.',
          color_and_tone:
            'Black ink on white drafting film, solid black section profiles, grey only where a rubbing is shown.',
          lighting_and_shadow:
            'Conventional top-left light in stipple density; section faces solid black with no light.',
          texture_and_material:
            'Stippled corrosion and wear, ruled center lines, dashed missing parts, a graphite rubbing of a decorated surface.',
          camera_and_composition:
            'Front view split down a center line into exterior and section, detail views and a bar scale without numbers.',
          atmosphere_and_mood: 'Patient and evidential, a past recovered piece by piece.',
          rendering_and_quality:
            'Recording-grade accuracy, no find numbers, site codes or captions.',
          key_features:
            'half profile and section; solid black section fill; stippled surface; dashed reconstruction; unnumbered bar scale',
        },
      ),
      avoid: [...AVOID, 'find numbers', 'excavation photograph'],
      briefs: [
        'Archaeological find drawing of shards of a burial urn glazed with dragon-scale relief, a half profile with solid black section, stippled scales, dashed lines reconstructing the missing rim and an unnumbered bar scale. No readable text or logo.',
        'Archaeological find drawing of a corroded bronze helmet with cheek guards, stippled corrosion and a section through the crest. No readable text or logo.',
        'Archaeological find drawing of a carved bone gaming set, pieces in front and side view with a graphite rubbing of the board. No readable text or logo.',
      ],
    },
  ],
};

export default spec;
