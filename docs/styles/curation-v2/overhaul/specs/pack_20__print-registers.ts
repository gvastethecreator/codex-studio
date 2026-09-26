import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Print Registers vault: portable print studies with explicit plate, transfer and exposure
// mechanics. The ten originals keep their DNA and get creative briefs; ten new studies add print
// processes the catalog does not cover yet (photogravure, gum layers, anthotype, plank grain,
// stele rubbing, solvent transfer, diazo, rainbow roll, carbon trace, gel plate).
const print = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  avoid: string[],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'print', 'portable-study'],
  dna: dna(fields),
  avoid: [...avoid, ...STYLE_AVOID],
  briefs,
});

const spec: Spec = {
  pack: 'pack_20',
  category: '1. Print Registers',
  updates: {
    'SP20-001': {
      briefs: [
        'A yellow tram rounds a city corner while a pedestrian waits at the crossing, every color plate slipped a hair out of register so the tram seems to shiver. No readable text or logo.',
        'A jazz trio plays in a cramped basement club, the red and blue plates drifting apart around the trumpet so the notes look like they vibrate. No readable text or logo.',
        'A lonely lighthouse on a rock at dusk shows a thin ghost of its yellow plate floating just beside the tower. No readable text or logo.',
      ],
    },
    'SP20-002': {
      briefs: [
        'A cyclist crosses a broad footbridge at midday in two flat stencil inks, the overlap of orange and blue making a third color exactly where her shadow falls. No readable text or logo.',
        'A wrestler lifts an opponent over his head in two stenciled inks, the bridges between the stencil cuts leaving thin gaps through the bodies. No readable text or logo.',
        'A fox sits in the snow beneath a single streetlamp, printed in a black stencil and one rust layer that overlap only on its tail. No readable text or logo.',
      ],
    },
    'SP20-003': {
      briefs: [
        'A radio tower rises above low rooftops, clipped into compact black toner blocks with the mid-grey sky broken into gritty specks. No readable text or logo.',
        'A punk band screams on a tiny stage, faces reduced to harsh black copier blocks and white highlights with speckled toner in the smoke. No readable text or logo.',
        'A missing cat stares out from a fence post, photocopied so many times that its fur has become a few dark blocks and speckled noise. No readable text or logo.',
      ],
    },
    'SP20-004': {
      briefs: [
        'A large spiral seashell lies on a shore beside a small wave, its ridges and cast shadow built from ordered families of fine incised lines. No readable text or logo.',
        'A bank vault door the size of a house stands half open, every rivet and curve described by parallel engraved lines that swell into shadow. No readable text or logo.',
        'An owl on a fence post stares out at night, its feathers carved in orderly engraved line families curving around its face. No readable text or logo.',
      ],
    },
    'SP20-005': {
      briefs: [
        'A brown bear reaches into a river for a salmon, drawn in greasy crayon on stone so every stroke carries the grain of the printing surface. No readable text or logo.',
        'A circus strongwoman lifts a barbell in a smoky tent, her muscles drawn in soft crayon tones and the smoke laid in with washy tusche. No readable text or logo.',
        'A street accordionist plays under a tree in the rain, printed from a crayon-drawn plate with speckled grain in every grey. No readable text or logo.',
      ],
    },
    'SP20-006': {
      briefs: [
        'A late train arrives at a rain-dark platform where two figures wait, the whole plate a velvet black scraped open only where the lamps and wet rails catch light. No readable text or logo.',
        'A pearl diver surfaces at night holding one glowing pearl, burnished out of a field of deep velvety black. No readable text or logo.',
        'A cellist plays alone in a dark hall, only her hands, the bow and the varnish of the cello scraped back into light. No readable text or logo.',
      ],
    },
    'SP20-007': {
      briefs: [
        'A person in a yellow raincoat walks a black dog down broad wet stone steps, the whole image wiped out of one inked plate and pressed once. No readable text or logo.',
        'A storm rolls over a wheat field, the clouds wiped with a rag and the lightning drawn through the ink with the handle of a brush. No readable text or logo.',
        'A dancer spins in a dark studio, her skirt a single sweep wiped through the ink with a thumb, never repeatable. No readable text or logo.',
      ],
    },
    'SP20-008': {
      briefs: [
        'An octopus moves through sparse seagrass in deep Prussian blue, every suckered arm a pale reserve where a real stem once lay on the sensitized paper. No readable text or logo.',
        'A bridal veil is laid across a sheet in the sun, its lace pattern printed as a ghost of white on deep blue. No readable text or logo.',
        'A skeleton of a small fish and a sprig of fern float in a blue field, their pale shapes blurred where they lifted slightly during exposure. No readable text or logo.',
      ],
    },
    'SP20-009': {
      briefs: [
        'A tall orange crane wades through marsh grass under a pale sky, the grass printed from glued string and sand on a built-up plate. No readable text or logo.',
        'A lighthouse keeper rows through fog, her boat printed from a piece of corrugated card and the water from crumpled foil pressed into the plate. No readable text or logo.',
        'A barn owl glides over a field, its feathers printed from real feathers glued onto the plate and the moon from a coin. No readable text or logo.',
      ],
    },
    'SP20-010': {
      briefs: [
        'A small red glider crosses a green valley with the pilot visible in the open cockpit, every tone encoded in dots that grow fat in the shadows. No readable text or logo.',
        'A sumo bout frozen at the moment of impact is printed in coarse dots, the wrestlers built from swelling black spots on newsprint. No readable text or logo.',
        'A carnival carousel glows at night, its bulbs pure paper and its darkness a dense field of large round dots. No readable text or logo.',
      ],
    },
  },
  creates: [
    print(
      'Photogravure Tone',
      'etched photographic plate print',
      'photogravure',
      {
        aesthetic:
          'Photogravure tone: a photographic image etched into a copper plate and printed in intaglio ink, with deep velvety shadows and soft continuous grain.',
        subject_treatment:
          "Render the prompt's subject as an etched photographic print, keeping its forms and likeness while the plate adds rich ink depth and soft grain.",
        color_and_tone:
          'Warm black or sepia ink on soft cream paper, deep rich shadows and gentle luminous highlights.',
        lighting_and_shadow:
          'Natural photographic light held in continuous tone, with shadows pooling into dense velvety ink.',
        texture_and_material:
          'Fine aquatint-like grain in mid-tones, a visible plate mark and slightly raised ink in the darks.',
        camera_and_composition:
          'Classic photographic framing with a wide paper margin and plate mark around the image.',
        atmosphere_and_mood: 'Timeless, quiet and precious, like an early art photograph.',
        rendering_and_quality:
          'Continuous-tone intaglio print with fine grain and embossed plate edge, never a digital photo.',
        key_features: 'velvet etched shadows; fine plate grain; plate mark; warm ink on cream paper',
      },
      ['digital photo sharpness', 'harsh modern color', 'flat inkjet black'],
      [
        'A steam liner leaves a fog-bound harbor at dawn, printed from an etched plate so its smoke and the sea melt into velvety warm black. No readable text or logo.',
        'A beekeeper lifts a frame heavy with honey, her veiled face and the swarm printed in soft grainy sepia inside a crisp plate mark. No readable text or logo.',
        'An empty ballroom with dust sheets over the chairs is printed in deep warm ink, only the tall windows glowing. No readable text or logo.',
      ],
    ),
    print(
      'Gum Bichromate Layers',
      'pigmented gum photographic layers',
      'gum-bichromate',
      {
        aesthetic:
          'Gum bichromate layers: a photographic print built from several brushed layers of pigmented gum, each exposed and washed, giving soft painterly color separations.',
        subject_treatment:
          "Show the prompt's subject as a layered pigment photograph, keeping its forms while each color layer sits slightly apart with brushy edges.",
        color_and_tone:
          'Muted pigment layers such as terracotta, slate blue and olive, overlapping into soft secondary colors.',
        lighting_and_shadow:
          'Photographic light softened into broad tonal masses, highlights washed clean and shadows built from stacked pigment.',
        texture_and_material:
          'Brushed gum streaks, pigment granulation, soft washed-out edges and slightly misaligned color layers on watercolor paper.',
        camera_and_composition:
          'Pictorial framing with soft focus falloff and a painterly border where the brushed coating stops.',
        atmosphere_and_mood: 'Dreamy, handmade and nostalgic, part photograph and part painting.',
        rendering_and_quality:
          'Authentic layered pigment print with brush marks and soft registration, never crisp digital color.',
        key_features: 'stacked pigment layers; brushed coating edges; soft misregistration; watercolor paper',
      },
      ['crisp digital color photo', 'clean vector shapes', 'glossy print surface'],
      [
        'A fishing village at sunset is printed in three brushed pigment layers of rust, slate and olive that do not quite line up around the boats. No readable text or logo.',
        'A woman in a wide hat stands in a poppy field, the red layer brushed a little beyond the flowers so the whole meadow seems to glow. No readable text or logo.',
        'A cathedral facade emerges from soft blue and umber pigment layers, the brushed coating fading out before the spires. No readable text or logo.',
      ],
    ),
    print(
      'Anthotype Fade',
      'plant juice sun print',
      'anthotype',
      {
        aesthetic:
          'Anthotype fade: a sun print made on paper coated with crushed plant juice, where light slowly bleaches the color and leaves the image in pale, fragile tints.',
        subject_treatment:
          "Render the prompt's subject as a faded plant-pigment sun print, keeping its silhouette and major shapes while fine detail dissolves into soft bleached tones.",
        color_and_tone:
          'Faded berry violet, turmeric yellow or spinach green tints bleaching toward pale cream.',
        lighting_and_shadow:
          'Exposed areas bleached pale, protected areas holding stronger plant color, with soft blurred boundaries.',
        texture_and_material:
          'Uneven brushed plant juice coating, streaks, speckles of pulp and soft paper fibers.',
        camera_and_composition:
          'Contact-print framing with objects or silhouettes laid flat and a ragged coated border.',
        atmosphere_and_mood: 'Fragile, botanical and ephemeral, an image already disappearing.',
        rendering_and_quality:
          'Soft organic sun print with uneven coating and bleached tints, never sharp or saturated.',
        key_features: 'plant juice coating; sun-bleached tints; soft edges; ragged coated border',
      },
      ['saturated digital color', 'sharp photographic detail', 'clean white border'],
      [
        'A bicycle wheel and a bunch of wild grasses were laid on berry-coated paper, leaving their pale ghosts in fading violet. No readable text or logo.',
        'A sleeping fox curled in the sun left its own shape bleached into a sheet of turmeric paper, fur edges soft as smoke. No readable text or logo.',
        'A lace glove and three keys are printed in fading spinach green, the image already paler at one corner than the other. No readable text or logo.',
      ],
    ),
    print(
      'Plank-Grain Relief',
      'wood grain relief print',
      'plank-grain',
      {
        aesthetic:
          'Plank-grain relief: a relief print cut from soft plank wood, where the natural grain prints as rippling lines inside every flat color area.',
        subject_treatment:
          "Carve the prompt's subject into simple flat shapes whose wood grain shows through the ink, keeping its silhouette and pose readable.",
        color_and_tone:
          'Two to four flat ink colors such as indigo, rust and ochre, each carrying visible grain striations.',
        lighting_and_shadow:
          'No modeled light; value comes from flat color shapes and carved white gaps.',
        texture_and_material:
          'Flowing wood grain lines, knot rings and cut-edge chatter printed inside every color block.',
        camera_and_composition:
          'Bold simplified composition with large color shapes and grain running in one direction.',
        atmosphere_and_mood: 'Rustic, warm and handmade, with the living tree still visible.',
        rendering_and_quality:
          'Authentic relief print with grain inside flats and carved edges, never smooth vector fills.',
        key_features: 'wood grain in flats; knot rings; carved chatter; bold simple shapes',
      },
      ['smooth vector fills', 'photographic shading', 'fine engraved hatching'],
      [
        'A whale breaches in indigo ink, the ocean grain running in long ripples across its body as if the sea were made of wood. No readable text or logo.',
        'A farmer and her ox plow a rust-colored field, a knot in the wood printing as a small sun above them. No readable text or logo.',
        'A black cat sits on a rooftop under an ochre moon, the grain of the plank curving through the sky like wind. No readable text or logo.',
      ],
    ),
    print(
      'Stele Ink Rubbing',
      'rubbed impression of carved stone',
      'stele-rubbing',
      {
        aesthetic:
          'Stele ink rubbing: damp paper pressed over a carved stone relief and dabbed with an ink pad, so raised surfaces print black and carved recesses stay pale.',
        subject_treatment:
          "Show the prompt's subject as if carved in shallow stone relief and captured by rubbing, keeping its outline and main forms clear.",
        color_and_tone:
          'Black or charcoal ink dabbed onto thin paper, with pale recessed lines and gradations from pad pressure.',
        lighting_and_shadow:
          'No light source; raised areas print dark, carved lines stay white and edges soften with pad texture.',
        texture_and_material:
          'Dabbed pad mottling, thin crinkled paper, stone pits and cracks printing as white specks.',
        camera_and_composition:
          'Flat frontal impression with the relief filling the sheet and a soft ragged edge.',
        atmosphere_and_mood: 'Ancient, archival and ceremonial, a trace taken from stone.',
        rendering_and_quality:
          'Authentic rubbing with pad mottling and stone damage, never a clean drawing.',
        key_features: 'raised areas dark; carved lines pale; pad mottling; stone cracks',
      },
      ['clean ink drawing', 'photographic stone', 'colored paint'],
      [
        'A procession of horses and riders crosses the sheet as if lifted from a temple wall, their carved outlines pale inside mottled black. No readable text or logo.',
        'A dragon coiling around a pearl is taken from weathered stone, a crack through the relief printing as a white lightning line. No readable text or logo.',
        'A modern commuter train is carved and rubbed like an ancient relief, pad mottling across every window. No readable text or logo.',
      ],
    ),
    print(
      'Solvent Transfer Ghost',
      'solvent photocopy transfer',
      'solvent-transfer',
      {
        aesthetic:
          'Solvent transfer ghost: a toner photocopy burnished face-down onto paper with solvent, leaving a reversed, patchy and streaked ghost of the image.',
        subject_treatment:
          "Transfer the prompt's subject as a mirrored ghost of a photocopy, keeping its shape recognizable while patches fail to transfer.",
        color_and_tone:
          'Faded black or brown toner on off-white paper, with occasional pale color from a color copy.',
        lighting_and_shadow:
          'Photographic light survives in broken form, shadows transferred heavier than highlights.',
        texture_and_material:
          'Burnishing streaks in one direction, missing patches, solvent haze and paper fiber showing through.',
        camera_and_composition:
          'Collage-like placement with rough transfer edges and possibly overlapping transfers.',
        atmosphere_and_mood: 'Fragile, nostalgic and uncanny, like a faded memory rubbed off.',
        rendering_and_quality:
          'Authentic patchy transfer with directional streaks, never a clean print.',
        key_features: 'burnishing streaks; missing patches; faded toner; rough edges',
      },
      ['clean print', 'saturated color', 'crisp complete image'],
      [
        'A couple dances at a wedding in a ghostly transferred image, half of the bride missing where the burnishing never reached. No readable text or logo.',
        'A herd of zebras runs across a sheet in patchy toner, their stripes streaked sideways by the burnishing spoon. No readable text or logo.',
        'An astronaut floats in faded brown toner, the stars behind her pulled into short streaks by solvent. No readable text or logo.',
      ],
    ),
    print(
      'Diazo Line Print',
      'ammonia whiteprint copy',
      'diazo',
      {
        aesthetic:
          'Diazo line print: an old ammonia whiteprint copy of a drawing, with blue-violet or sepia lines on pale paper and uneven developing haze.',
        subject_treatment:
          "Show the prompt's subject as a copied line drawing, keeping its outline and structure clear while the process tints and softens the lines.",
        color_and_tone:
          'Blue-violet or brown lines on off-white paper with a faint tinted haze in large areas.',
        lighting_and_shadow:
          'No modeled light; hatched or filled areas from the original drawing print as tinted tone.',
        texture_and_material:
          'Slightly fuzzy lines, streaky ammonia development, faded edges and folded copy creases.',
        camera_and_composition:
          'Technical or illustrative layout on a large sheet, with wide margins and fold lines.',
        atmosphere_and_mood: 'Archival, practical and faded, like plans found in an old office.',
        rendering_and_quality:
          'Authentic copied line work with process haze and creases, never crisp digital lines.',
        key_features: 'blue-violet lines; ammonia haze; fold creases; fuzzy copy edges',
      },
      ['crisp digital linework', 'white lines on blue', 'full color painting'],
      [
        'A plan for a flying house with propellers on every chimney is copied in fuzzy violet lines, fold creases crossing the living room. No readable text or logo.',
        'A giant squid is drawn like a submarine schematic in faded brown lines, ammonia haze darkening one side of the sheet. No readable text or logo.',
        'A carousel of mechanical horses is laid out in plan and elevation in blue-violet lines, one corner torn and taped. No readable text or logo.',
      ],
    ),
    print(
      'Rainbow-Roll Relief',
      'blended roller relief print',
      'rainbow-roll',
      {
        aesthetic:
          'Rainbow-roll relief: a relief block inked with a roller carrying several colors side by side, so every printed shape blends smoothly from one hue to the next.',
        subject_treatment:
          "Carve the prompt's subject into bold relief shapes and print it with a blended multi-color roll, keeping its silhouette and pose readable.",
        color_and_tone:
          'Smooth horizontal or vertical blends such as magenta to orange or teal to violet across every shape.',
        lighting_and_shadow:
          'No modeled light; the color blend suggests sky or depth while carved gaps stay paper white.',
        texture_and_material:
          'Soft roller blend, slight ink speckle, carved edges and faint roller streaks across the paper.',
        camera_and_composition:
          'Bold graphic shapes with the blend direction reinforcing the composition.',
        atmosphere_and_mood: 'Joyful, warm and energetic, like a sunset trapped in a block print.',
        rendering_and_quality:
          'Authentic relief print with seamless roller blend and carved whites, never airbrushed.',
        key_features: 'multi-color roller blend; carved white gaps; bold shapes; roller streaks',
      },
      ['airbrushed gradient', 'photographic shading', 'single flat color'],
      [
        'A flock of flamingos takes off from a lagoon, every bird printed in one blend from hot pink at the wings to orange at the feet. No readable text or logo.',
        'A city skyline at dusk is printed from one block with a roll fading from violet at the rooftops to gold at the streets. No readable text or logo.',
        'A surfer rides a giant carved wave that blends from teal to deep blue as it curls over her. No readable text or logo.',
      ],
    ),
    print(
      'Carbon Paper Trace',
      'carbon copy tracing',
      'carbon-trace',
      {
        aesthetic:
          'Carbon paper trace: a drawing transferred by pressing through carbon paper, leaving smudgy blue-black lines, pressure blots and stray hand smears.',
        subject_treatment:
          "Trace the prompt's subject as carbon-transferred lines, keeping its outline and main details while pressure changes darken or break the line.",
        color_and_tone:
          'Blue-black or purple carbon lines on thin white or yellow copy paper.',
        lighting_and_shadow:
          'No modeled light; shading appears only as rubbed carbon patches where the hand pressed.',
        texture_and_material:
          'Grainy carbon lines, fingerprint smudges, pressure blots at stops and faint accidental marks.',
        camera_and_composition:
          'Simple illustrative layout on a single sheet, sometimes with a faint double from shifting paper.',
        atmosphere_and_mood: 'Bureaucratic, intimate and slightly messy, a copy made by hand.',
        rendering_and_quality:
          'Authentic carbon transfer texture with smudges and blots, never clean pen lines.',
        key_features: 'blue-black carbon lines; pressure blots; fingerprint smudges; thin copy paper',
      },
      ['clean pen line', 'full color painting', 'digital vector line'],
      [
        'A tax inspector traces a dragon for a permit form in smudgy blue-black carbon, his fingerprints all over its wings. No readable text or logo.',
        'A love letter doodle of two swans is copied through carbon paper, the second swan doubled where the sheet slipped. No readable text or logo.',
        'A courtroom sketch of a parrot on the witness stand survives only as a carbon copy, grainy and purple. No readable text or logo.',
      ],
    ),
    print(
      'Gel Plate Layers',
      'gelatin plate monoprint layers',
      'gel-plate',
      {
        aesthetic:
          'Gel plate layers: monoprints pulled from a soft gelatin plate, stacking translucent paint layers with leaf, lace and stencil impressions.',
        subject_treatment:
          "Build the prompt's subject from stencil and object impressions pulled from a soft plate, keeping its silhouette clear among layered textures.",
        color_and_tone:
          'Translucent layered acrylic colors, often teal, coral and mustard, overlapping into new tones.',
        lighting_and_shadow:
          'No modeled light; depth comes from stacked translucent layers and ghost prints.',
        texture_and_material:
          'Brayer marks, leaf vein impressions, lace patterns, ghost prints and soft blotchy edges.',
        camera_and_composition:
          'Collage-like layered composition with the subject as a crisp stencil shape over textures.',
        atmosphere_and_mood: 'Playful, botanical and experimental, a studio full of happy accidents.',
        rendering_and_quality:
          'Authentic layered monoprint textures with real impressions, never digital overlays.',
        key_features: 'translucent paint layers; leaf and lace impressions; brayer marks; stencil subject',
      },
      ['digital texture overlay', 'photographic realism', 'single flat layer'],
      [
        'A fox silhouette stands out of layers of teal and coral pulled over real fern leaves, their veins printing through its fur. No readable text or logo.',
        'A dancer in a lace skirt spins across stacked mustard and plum layers, the lace pressed straight into the plate. No readable text or logo.',
        'A hot-air balloon rises over layered ghost prints of grass, feathers and bubble wrap in soft pinks and blues. No readable text or logo.',
      ],
    ),
  ],
};

export default spec;
