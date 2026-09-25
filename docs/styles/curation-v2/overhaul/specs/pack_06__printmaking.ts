import type { Dna, Spec } from '../tools/apply';

// Review rule: a blind comparison must identify the process from its marks, without a particular scene.
const print =
  "Redraw the prompt's subject, pose, setting and framing as an impression of this print process; ink transfer, plate or block marks, registration and paper identify the process without requiring any particular scene.";

function pr(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? print, ...rest } as Dna;
}

const AVOID = [
  'changing the requested subject',
  'readable printed text',
  'digital vector cleanliness',
];

// Guard for new presets, matching the inherited print negatives of the category.
const PRINT_BASE = [
  'photo',
  'photorealistic',
  '3d render',
  'smooth digital gradient',
  'random distress overlay',
  'wrong print process',
  'fake poster text',
  'generic AI gloss',
  ...AVOID,
];

const spec: Spec = {
  pack: 'pack_06',
  category: '3. Printmaking',
  updates: {
    'SP06-031': {
      dna: pr({
        aesthetic:
          'Line etching: lines drawn with a needle through an acid-resistant ground on a copper plate, bitten in acid, inked into the grooves and printed under heavy pressure.',
        color_and_tone:
          'Warm brown-black ink on cream paper with a faint grey plate tone left by incomplete wiping; darker lines where the plate was bitten longer.',
        lighting_and_shadow:
          'Values made by line density and bite depth: open parallel lines in light, deep cross-hatched and re-bitten lines in shadow.',
        texture_and_material:
          'Free, slightly wavering needle lines with blunt ends, lines raised in relief on damp-pressed paper, a sunken plate-mark rectangle around the image.',
        camera_and_composition:
          'Keep the requested framing inside the embossed plate mark, with a clean margin of paper around it.',
        atmosphere_and_mood: 'Intimate and inquisitive, the look of an old printed book plate.',
        rendering_and_quality:
          'Line-only tone with bitten depth variation, plate tone and embossed plate mark; no solid flat blacks and no halftone dots.',
        key_features:
          'needle-drawn bitten lines; varied bite depth; grey plate tone; embossed plate mark; warm black on cream paper',
      }),
      avoid: [...AVOID, 'solid flat black areas', 'halftone dots', 'swelling brush lines'],
      briefs: [
        'Line etching of a crowded medieval harbor with round-bellied cogs and a wooden treadwheel crane, needle lines deepened by longer bites in the shadows, grey plate tone in the sky, embossed plate mark around the image. No text or logo.',
        'Line etching of a single stag beetle seen from above, its armor built from curved parallel lines, warm black on cream paper, clean margin inside the plate mark. No text or logo.',
        'Line etching of an adult alchemist leaning over a bubbling alembic in a cluttered vaulted study, deep cross-hatched corners, wavering needle lines on the glassware. No text or logo.',
      ],
    },
    'SP06-032': {
      dna: pr({
        aesthetic:
          'Woodcut relief print: a plank of side-grain wood cut away with knives and gouges, the uncut surface inked and pressed, so the image is black shapes with white cut marks.',
        color_and_tone:
          'Dense black ink on off-white paper, with an optional single flat color block; no greys except patterns of cut lines.',
        lighting_and_shadow:
          'Stark contrast: shadows are uncut black, light is carved away in bold directional gouge strokes.',
        texture_and_material:
          'Visible wood grain printing through the solid blacks, splintery cut edges, uneven ink squash at shape borders, slight paper show-through.',
        camera_and_composition:
          'Keep the requested framing; forms simplified into bold angular shapes that a knife can cut.',
        atmosphere_and_mood: 'Blunt, archaic and powerful, a folk broadside force.',
        rendering_and_quality:
          'Chunky angular cuts, wood grain in the blacks, irregular ink coverage; no fine hatching and no smooth curves.',
        key_features:
          'black shapes with white gouge marks; wood grain in solid blacks; splintery angular cuts; uneven ink squash; stark two-value contrast',
      }),
      avoid: [...AVOID, 'fine engraved lines', 'smooth vector curves', 'grey tones'],
      briefs: [
        'Woodcut relief print of Death as a skeleton rider on a pale horse trampling a wheat field, bold angular gouge strokes for the grain stalks, wood grain printing through the black sky, splintery edges. No text or logo.',
        'Woodcut relief print of a leviathan swallowing a sailing ship in towering waves, the waves cut as white curling gouge marks in solid black, uneven ink squash. No text or logo.',
        'Woodcut relief print of a village of steep roofs under a blazing comet, the comet tail carved in radiating white cuts, one flat ochre color block. No text or logo.',
      ],
    },
    'SP06-033': {
      dna: pr({
        aesthetic:
          'Linocut relief print: soft linoleum carved with V and U gouges into smooth flowing cuts, printed as clean flat ink areas with rhythmic white line patterns.',
        color_and_tone:
          'Flat black or one to three flat colors on white paper; each color a solid, evenly inked shape.',
        lighting_and_shadow:
          'Light carved out as rhythmic parallel cut lines that follow the form; shadow as solid ink.',
        texture_and_material:
          'Smooth curved cuts without wood grain, slight speckled ink texture where pressure was light, crisp edges on soft linoleum.',
        camera_and_composition:
          'Keep the requested framing; bold simplified shapes with decorative line rhythms in skies, water and ground.',
        atmosphere_and_mood: 'Bold, crafty and rhythmic, a handmade poster clarity.',
        rendering_and_quality:
          'Clean flowing cuts, flat even color, speckled light-pressure ink; no wood grain and no fine hatching.',
        key_features:
          'smooth flowing gouge lines; flat solid colors; rhythmic decorative cut patterns; speckled ink texture; no wood grain',
      }),
      avoid: [...AVOID, 'wood grain texture', 'gradients', 'fine etched hatching'],
      briefs: [
        'Linocut print of a hare leaping over moonlit rolling hills, the hills cut into flowing parallel white lines, flat black and one indigo color, speckled ink where the pressure was light. No text or logo.',
        'Linocut print of an adult potter shaping a tall jar at her wheel, rhythmic curved cut lines spinning around the clay, two flat colors. No text or logo.',
        'Linocut print of a boar hunt with adult spear-bearers and hounds in a winter forest, bold simplified shapes, decorative cut patterns in the snow. No text or logo.',
      ],
    },
    'SP06-034': {
      dna: pr({
        aesthetic:
          'Crayon lithography: the image drawn with greasy crayon and wash on a grained limestone, then printed so every grain of the stone appears in the tone.',
        color_and_tone:
          'Soft velvety blacks and warm greys, sometimes one or two flat color stones; a very wide tonal range from pale grain to rich solids.',
        lighting_and_shadow:
          'Painterly modeling with soft crayon gradients and wash puddles, bright lights scraped back to paper.',
        texture_and_material:
          'Fine even stone grain in every tone, crayon drag marks, reticulated wash patterns, scraped white lines.',
        camera_and_composition:
          'Keep the requested framing; loose drawing with a sketchy vignette fading into the paper.',
        atmosphere_and_mood: 'Soft, atmospheric and immediate, a drawing multiplied by stone.',
        rendering_and_quality:
          'Grainy crayon tones and liquid washes with no plate mark and no embossing; sits flat on the paper.',
        key_features:
          'limestone grain in every tone; greasy crayon drag; reticulated tusche washes; scraped highlights; no plate mark',
      }),
      avoid: [...AVOID, 'embossed plate mark', 'hard carved edges', 'halftone dots'],
      briefs: [
        'Crayon lithograph of an adult woman in a feathered hat sitting alone at a café table, velvety greasy crayon blacks, stone grain in her coat, the scene fading to bare paper at the edges. No text or logo.',
        'Crayon lithograph of a dancing bear and an adult juggler at a village fair, reticulated wash puddles in the crowd, scraped white highlights on the juggling balls. No text or logo.',
        'Crayon lithograph of a lone standing stone on a moor under a gathering storm, soft crayon gradients in the clouds, fine limestone grain throughout. No text or logo.',
      ],
    },
    'SP06-035': {
      dna: pr({
        aesthetic:
          'Screenprint: flat opaque ink squeegeed through stencilled silk mesh, one layer per color, stacked with slight misregistration.',
        color_and_tone:
          'Bold flat spot colors that overprint into new colors where they overlap, limited to four to six inks; no gradients.',
        lighting_and_shadow:
          'Light and shadow as separate flat color layers, with shadows often in a darker overprinted ink.',
        texture_and_material:
          'Thick opaque ink film, faint mesh texture at shape edges, slight registration gaps and overlaps, occasional ink starvation streaks.',
        camera_and_composition:
          'Keep the requested framing; bold posterized shapes with strong silhouettes.',
        atmosphere_and_mood: 'Punchy, graphic and handmade, loud poster energy.',
        rendering_and_quality:
          'Flat layers with crisp stencil edges, visible misregistration and overprints; no halftone gradients, no brush texture.',
        key_features:
          'flat stacked spot-color layers; overprint color mixing; misregistration gaps; mesh texture at edges; four to six inks',
      }),
      avoid: [...AVOID, 'smooth gradients', 'photographic tone', 'brush texture'],
      briefs: [
        'Screenprint of a roaring sabre-toothed cat in five flat spot colors, the orange and black layers slightly misregistered, a violet overprint forming the shadows, mesh texture at the edges. No text or logo.',
        'Screenprint of a volcano erupting over a black pine forest, a red layer overprinting yellow into orange lava, ink starvation streaks in the smoke. No text or logo.',
        'Screenprint of a heap of ripe lemons on a cobalt plate, four stacked flat inks, registration gaps showing white paper along the edges. No text or logo.',
      ],
    },
    'SP06-036': {
      name: 'Glass-Plate Monotype',
      dna: pr({
        aesthetic:
          'Monotype: ink rolled and brushed onto a smooth glass or metal plate, wiped back with rags and fingers, then pressed once onto paper so only one soft impression exists.',
        color_and_tone:
          'Muted ink tones, dark earth or blue-black with a few soft colors; wiped lights glow out of dark rolled areas.',
        lighting_and_shadow:
          'Subtractive light: highlights wiped out of the ink with rag and finger, giving soft glowing halos.',
        texture_and_material:
          'Squashed ink with fuzzy spread edges, roller marks, rag-wipe textures and fingerprint smears, brush marks flattened by the press.',
        camera_and_composition:
          'Keep the requested framing; loose painterly forms with a soft rectangular plate edge.',
        atmosphere_and_mood: 'Ghostly, spontaneous and dreamlike, a painting glimpsed once.',
        rendering_and_quality:
          'Soft squashed transfer texture, wiped lights and roller marks; no sharp lines, no repeatable plate detail.',
        key_features:
          'ink wiped from a glass plate; squashed soft transfer edges; rag and finger wipe marks; roller streaks; single ghostly impression',
      }),
      avoid: [...AVOID, 'crisp etched lines', 'flat screenprint color', 'sharp detail'],
      dropAvoid: ['blurry'],
      briefs: [
        'Glass-plate monotype of hooded monks carrying lanterns through thick fog, the lantern glows wiped out of dark blue-black ink with a fingertip, squashed soft edges, roller marks in the sky. No text or logo.',
        'Glass-plate monotype of an adult dancer mid-spin, her skirt a rag-wiped arc of light, brush marks flattened by the press. No text or logo.',
        'Glass-plate monotype of a vase of wilting peonies, petals in soft squashed rose ink, fingerprint smears in the dark background. No text or logo.',
      ],
    },
    'SP06-037': {
      name: 'Rosin-Grain Aquatint',
      dna: pr({
        aesthetic:
          'Aquatint: rosin dust fused to a copper plate so acid bites a fine grain around each particle, producing areas of even tone stepped by repeated stop-outs.',
        color_and_tone:
          'Sepia, bistre or grey-black tone in distinct flat value steps from pale to dark; often combined with a light etched outline.',
        lighting_and_shadow:
          'Tonal light and shadow in clearly stepped flat areas, like washes, with crisp borders between steps.',
        texture_and_material:
          'Fine speckled granular tone under a loupe, sharp-edged tone patches, embossed plate mark, soft cream paper.',
        camera_and_composition:
          'Keep the requested framing; broad tonal masses carry the image, with line only for key contours.',
        atmosphere_and_mood: 'Moody, atmospheric and hushed, like dusk seen through a veil.',
        rendering_and_quality:
          'Granular even tone areas in stepped values, crisp stop-out edges, plate mark; no hatching for tone, no brush texture.',
        key_features:
          'fine rosin grain tone; stepped flat value areas; crisp stop-out edges; sepia or grey-black ink; light etched outline',
      }),
      avoid: [...AVOID, 'hatching for tone', 'smooth gradient', 'bright color'],
      dropAvoid: ['noise'],
      briefs: [
        'Rosin-grain aquatint of a ruined gothic abbey at dusk with bats circling the broken rose window, the sky in three stepped flat sepia tones, fine speckled grain, light etched outline on the tracery. No text or logo.',
        'Rosin-grain aquatint of a waterfall plunging into a deep gorge, dark stepped tones on the cliffs, the falling water left as pale stop-out. No text or logo.',
        'Rosin-grain aquatint of an adult witch stirring a cauldron in a cave, grey-black granular tone, the fire glow as the palest step, embossed plate mark. No text or logo.',
      ],
    },
    'SP06-038': {
      name: 'Rocker-Ground Mezzotint',
      dna: pr({
        aesthetic:
          'Mezzotint: a copper plate roughened all over with a rocker so it prints solid velvet black, then scraped and burnished smooth to bring up the lights.',
        color_and_tone:
          'Deep velvety black dominating the image, forms rising through smooth soft greys to a few burnished whites.',
        lighting_and_shadow:
          'Dark-to-light working: a single candle or window light, forms emerging from total darkness with very soft transitions.',
        texture_and_material:
          'Rich velvet black with a faint crosshatch rocker texture visible in the mid-greys, smooth burnished highlights, plate mark.',
        camera_and_composition:
          'Keep the requested framing; the subject emerges from a large surrounding dark.',
        atmosphere_and_mood: 'Hushed, nocturnal and mysterious, light found in the dark.',
        rendering_and_quality:
          'Smooth soft tonal transitions, no lines at all, deep velvet blacks and burnished lights.',
        key_features:
          'velvet rocker-ground black; scraped and burnished lights; very soft tonal transitions; faint rocker texture in mid-greys; forms emerging from darkness',
      }),
      avoid: [...AVOID, 'line hatching', 'white background', 'flat bright lighting'],
      dropAvoid: ['noise'],
      briefs: [
        'Rocker-ground mezzotint of an adult noblewoman holding a feathered mask by the light of a single candle, her face burnished out of velvet black, faint rocker texture in the mid-greys. No text or logo.',
        'Rocker-ground mezzotint of a black cat sitting on a moonlit windowsill, only the rim of its fur and its eyes scraped to light, everything else velvet black. No text or logo.',
        "Rocker-ground mezzotint of a dragon's eye slowly opening in the dark of a cave, the glint burnished to pure white, soft tonal rings around it. No text or logo.",
      ],
    },
    'SP06-039': {
      dna: pr({
        aesthetic:
          'Risograph print: a stencil duplicator pushing soy inks through a drum, one spot color per pass, with grainy dither and loose registration.',
        color_and_tone:
          'Fluorescent pink, teal, sunflower yellow and blue riso inks overlapping into new transparent colors; blacks rarely pure.',
        lighting_and_shadow:
          'Tone made by grainy stochastic dither per color layer; shadows as denser dither or an overlapping second ink.',
        texture_and_material:
          'Soft uncoated paper with ink sitting slightly grainy, roller streaks, occasional ink set-off, colors shifted a few millimeters.',
        camera_and_composition:
          'Keep the requested framing; graphic shapes with generous paper white.',
        atmosphere_and_mood: 'Playful, indie and bright, a small-press zine energy.',
        rendering_and_quality:
          'Grainy transparent spot-color layers with loose registration; no digital gradients and no crisp CMYK dots.',
        key_features:
          'fluorescent spot-color layers; grainy dither tone; transparent overprints; loose registration shift; soft uncoated paper',
      }),
      avoid: [...AVOID, 'CMYK rosette dots', 'glossy paper', 'perfect registration'],
      dropAvoid: ['noise'],
      briefs: [
        'Risograph print of two adult masked wrestlers locked mid-throw, fluorescent pink and teal layers overlapping into violet, grainy dither in the shadows, colors shifted a few millimeters. No text or logo.',
        'Risograph print of an overgrown greenhouse jungle of monstera and palms, sunflower yellow and blue overprinting into green, roller streaks on soft paper. No text or logo.',
        'Risograph print of an octopus wrapped around an old brass diving helmet, fluorescent pink grain over deep blue, loose registration. No text or logo.',
      ],
    },
    'SP06-040': {
      dna: pr({
        aesthetic:
          'Cyanotype contact print: iron-salt coated paper exposed in sunlight under objects or a negative, then washed, so forms appear in white or pale blue on Prussian blue.',
        color_and_tone:
          'Deep Prussian blue grounds, white and pale cyan forms, soft mid-blues where objects were translucent.',
        lighting_and_shadow:
          'No modeled light; value depends on how much sunlight passed, so opaque parts are white and translucent parts glow pale blue.',
        texture_and_material:
          'Brush-coated edges of chemistry on watercolor paper, uneven blue streaks, soft photogram edges where objects lifted slightly.',
        camera_and_composition:
          'Keep the requested subject, laid flat or seen as a photogram or contact negative; brushed chemistry border around it.',
        atmosphere_and_mood: 'Cool, quiet and ethereal, a sun-drawn blueprint.',
        rendering_and_quality:
          'Monochrome Prussian blue with soft photogram edges and brushstroke chemistry borders; no other colors, no ink lines.',
        key_features:
          'Prussian blue ground; white and pale cyan forms; brushed chemistry edges; soft photogram halos; watercolor paper texture',
      }),
      avoid: [...AVOID, 'any color other than blue and white', 'ink outlines', 'full-color photo'],
      briefs: [
        "Cyanotype contact print of a knight's chainmail coif and a short sword laid flat, the rings printed as white lace on deep Prussian blue, brushed chemistry streaks around the edges. No text or logo.",
        'Cyanotype print of a jellyfish drifting, its translucent bell glowing pale cyan, tendrils as soft white photogram lines on deep blue. No text or logo.',
        'Cyanotype print of an adult swimmer floating on her back seen from above, rippled water in mid-blues, soft photogram halo around the body. No text or logo.',
      ],
    },
    'SP06-041': {
      name: 'Carved Rubber Stamp',
      dna: pr({
        aesthetic:
          'Hand-carved rubber stamp: simple motifs cut into a soft rubber block, inked from a pad and pressed by hand, often repeated across the sheet.',
        color_and_tone:
          'One or two stamp-pad inks, such as red, black, navy or green, with density varying from impression to impression.',
        lighting_and_shadow:
          'No modeling; forms shown by solid areas and carved lines only, occasional partial darkness where ink pooled.',
        texture_and_material:
          'Incomplete impressions with pale patches where pressure missed, halo of ink at the carved edges, slightly tilted repeats, paper fiber visible.',
        camera_and_composition:
          'Keep the requested subject; it may repeat several times in a loose hand-placed arrangement.',
        atmosphere_and_mood: 'Homemade, cheerful and a little clumsy, a craft-table charm.',
        rendering_and_quality:
          'Uneven hand-pressed ink coverage and slightly rotated repeats; no perfect alignment, no gradients, no readable text.',
        key_features:
          'hand-carved rubber motif; patchy incomplete impressions; ink halos at edges; tilted repeats; one or two pad inks',
      }),
      avoid: [...AVOID, 'readable stamp text', 'perfect uniform ink', 'fine detail'],
      briefs: [
        'Carved rubber stamp print of a row of crows perched along a fence, each crow the same hand-carved motif pressed slightly tilted, patchy black impressions, one crow stamped in red. No text or logo.',
        'Carved rubber stamp print of a hedgehog under a spotted mushroom, green and red pad inks, pale patches where the pressure missed. No text or logo.',
        'Carved rubber stamp print of a teapot with curling steam repeated three times across the page, navy ink density changing each time. No text or logo.',
      ],
    },
    'SP06-042': {
      dna: pr({
        aesthetic:
          'Newspaper halftone: a photograph screened into a coarse grid of black dots and printed at speed on cheap newsprint.',
        color_and_tone:
          'Black ink on greyish-yellow newsprint, compressed tonal range, muddy blacks and grey whites.',
        lighting_and_shadow:
          'Photographic light flattened by the screen: dots merge into solids in the shadows and vanish in the highlights.',
        texture_and_material:
          'Visible round dots at a coarse 65 to 85 line screen, ink spread and slur, show-through from the reverse side, yellowed fibrous paper.',
        camera_and_composition:
          'Keep the requested framing as a news photograph; no headline, column layout or readable caption.',
        atmosphere_and_mood:
          'Urgent, documentary and yesterday, a report from the morning edition.',
        rendering_and_quality:
          'Clearly visible dot grid, dot gain in the darks, slight blur from fast printing; no color and no clean digital sharpness.',
        key_features:
          'coarse visible halftone dots; dot gain in darks; yellowed newsprint; show-through from reverse; compressed tonal range',
      }),
      avoid: [...AVOID, 'readable headline', 'newspaper column layout', 'color'],
      briefs: [
        'Newspaper halftone photograph of an adult boxer landing a punch in a smoky ring, coarse black dots merging into solids in the shadows, dot gain on the gloves, yellowed newsprint with faint show-through. No text or logo.',
        'Newspaper halftone photograph of a flooded village street with adults waving from rooftops, the water a grey field of coarse dots. No text or logo.',
        'Newspaper halftone photograph of a giant sea turtle stranded on a beach with onlookers, compressed tonal range, slight blur from fast printing. No text or logo.',
      ],
    },
    'SP06-043': {
      dna: pr({
        aesthetic:
          'Security engraving: burin-cut steel line work of extreme density, swelling lines and dot-and-lozenge patterns, surrounded by machine-turned guilloche rosettes.',
        color_and_tone:
          'One intaglio ink, such as deep green, sepia, slate grey or maroon, on off-white cotton paper; tone purely from line density.',
        lighting_and_shadow:
          'Sculptural modeling through parallel lines that swell and thin to follow form, with fine dots between them in the half-tones.',
        texture_and_material:
          'Raised intaglio ink you could feel, hair-fine guilloche spirograph patterns, cotton-rag paper, micro-line backgrounds.',
        camera_and_composition:
          'Keep the requested subject, set as a vignette inside an oval or rosette of guilloche patterns.',
        atmosphere_and_mood: 'Official, precise and dignified, value engraved in steel.',
        rendering_and_quality:
          'Extremely fine swelling lines and interlaced guilloche, no free sketching; no numbers, denominations or readable text.',
        key_features:
          'burin-cut swelling line modeling; guilloche rosettes; dot-and-lozenge half-tones; single intaglio ink color; cotton-rag paper',
      }),
      avoid: [...AVOID, 'readable denomination', 'currency layout', 'loose sketch lines'],
      briefs: [
        'Security engraving of an adult allegorical figure of Justice holding scales, swelling burin lines modeling her robe, set in an oval of interlaced guilloche rosettes, deep green ink on cotton paper. No text, numbers or logo.',
        'Security engraving vignette of a bison standing in prairie grass, its fur in dense parallel swelling lines, micro-line guilloche sky, sepia ink. No text, numbers or logo.',
        'Security engraving of a lion head medallion framed by machine-turned spirograph patterns, dot-and-lozenge half-tones in the mane, slate grey ink. No text, numbers or logo.',
      ],
    },
    'SP06-044': {
      dna: pr({
        aesthetic:
          'Drypoint: lines scratched directly into a copper or plastic plate with a hard needle, throwing up a ridge of burr that holds extra ink.',
        color_and_tone:
          'Warm black ink on cream paper; lines have soft rich halos of ink, plate tone left in places.',
        lighting_and_shadow:
          'Shadows built by clustered scratched lines whose burr blooms into soft velvety darks.',
        texture_and_material:
          'Fuzzy, feathered line edges from the burr, sharp thin lines where the burr wore off, scratchy nervous marks, embossed plate mark.',
        camera_and_composition:
          'Keep the requested framing; sketchy economical line work with rich dark accents.',
        atmosphere_and_mood: 'Nervous, intimate and raw, a quick scratched thought.',
        rendering_and_quality:
          'Velvety burr halos around scratched lines, no acid-even line quality, no flat tone areas.',
        key_features:
          'burr-haloed scratched lines; velvety soft darks; nervous scratchy marks; plate tone; embossed plate mark',
      }),
      avoid: [...AVOID, 'crisp even etched lines', 'flat tone areas', 'color'],
      briefs: [
        'Drypoint print of a gnarled dead tree on a windy hill with a single lantern hanging from a branch, scratched lines with soft burr halos, velvety darks in the knots, warm plate tone. No text or logo.',
        'Drypoint print of an adult old woman knitting in a rocking chair, nervous scratchy lines, rich burr accents in the shawl folds. No text or logo.',
        'Drypoint print of a single thistle stem, the spines as sharp thin scratches, the flower head a fuzzy velvet dark. No text or logo.',
      ],
    },
    'SP06-045': {
      dna: pr({
        aesthetic:
          'Collagraph: a printing plate collaged from card, sand, fabric, glue and leaves, inked both into its recesses and on its surface and printed with deep embossing.',
        color_and_tone:
          'Earthy layered inks, rust, ochre, slate and moss, often two colors wiped differently into the same plate.',
        lighting_and_shadow:
          'Tone comes from how much ink each material holds: rough sand prints dark, smooth glue prints pale.',
        texture_and_material:
          'Deeply embossed paper, gritty sand textures, fabric weave imprints, crisp cut-card edges, varnish-smooth light areas.',
        camera_and_composition:
          'Keep the requested framing; forms simplified into collaged shapes with distinct material textures.',
        atmosphere_and_mood: 'Earthy, tactile and experimental, a print you want to touch.',
        rendering_and_quality:
          'Heavy material textures and embossing define each area; no fine line drawing and no recognizable pasted photos.',
        key_features:
          'collaged material plate; sand and fabric textures; deep embossing; earthy intaglio-and-relief inking; cut-card shape edges',
      }),
      avoid: [...AVOID, 'fine line drawing', 'pasted photographs', 'glossy digital finish'],
      briefs: [
        'Collagraph print of a rocky coastline with tide pools, the rocks printed from gritty sand in rust and slate ink, the water from smooth varnished card, deep embossing throughout. No text or logo.',
        "Collagraph print of a bird's nest holding three eggs, the twigs from glued string, fabric weave in the lining, ochre and moss inks. No text or logo.",
        'Collagraph print of a harvest moon over furrowed fields, the furrows from corrugated card, the moon a smooth pale disc, embossed edges. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'End-Grain Wood Engraving',
      domain: 'white-line boxwood engraving',
      tags: ['wood-engraving', 'white-line', 'relief'],
      dna: pr({
        aesthetic:
          'End-grain wood engraving: a polished block of boxwood cut with fine burins, so the image is built from delicate white lines engraved into black.',
        color_and_tone:
          'Rich black and white, greys made from white-line tints of varying width; crisp velvety blacks with no grain.',
        lighting_and_shadow:
          'Light engraved out as fine parallel white lines and stipple, dense tints for highlights, solid black for deep shadow.',
        texture_and_material:
          'Hair-fine white lines, no wood grain in the blacks, tiny stipple cuts, small block size with a crisp edge.',
        camera_and_composition:
          'Keep the requested framing in a small, dense vignette with jewel-like detail.',
        atmosphere_and_mood: 'Intimate, precise and nocturnal, a tiny world carved in light.',
        rendering_and_quality:
          'Very fine controlled white-line tints and stipple, crisp black; no coarse gouge marks and no wood grain.',
        key_features:
          'fine white lines cut into black; white-line tint greys; no wood grain; tiny stipple cuts; small jewel-like vignette',
      }),
      avoid: [...PRINT_BASE, 'coarse gouge marks', 'wood grain texture', 'black lines on white'],
      briefs: [
        'End-grain wood engraving of a kingfisher diving into a stream, every feather a hair-fine white line cut into black, the ripples as white-line tints, a small jewel-like vignette. No text or logo.',
        'End-grain wood engraving of a snow-covered village church at night with one lit window, the snow as dense white tints, the sky solid velvet black with tiny stipple stars. No text or logo.',
        'End-grain wood engraving of a team of oxen pulling a plough across a field at dawn, fine parallel white lines in the sky, no wood grain anywhere. No text or logo.',
      ],
    },
    {
      name: 'Reduction Linocut',
      domain: 'multi-color print from one progressively carved block',
      tags: ['reduction-print', 'linocut', 'multi-color'],
      dna: pr({
        aesthetic:
          'Reduction linocut: one linoleum block carved and printed again and again, each pass removing more and printing a darker color over the last.',
        color_and_tone:
          'Four to six flat colors stacked light to dark, such as cream, yellow, orange, red, deep blue; each color partly transparent over the previous.',
        lighting_and_shadow:
          'Light areas are the earliest carved-away colors, shadows the last dark pass; clear stepped value bands.',
        texture_and_material:
          'Slight halo of earlier colors peeking at the edges of later ones, speckled ink texture, smooth curved gouge lines.',
        camera_and_composition:
          'Keep the requested framing; shapes nest inside each other from light to dark.',
        atmosphere_and_mood: 'Warm, crafted and rich, color built patiently layer by layer.',
        rendering_and_quality:
          'Stacked flat color layers with visible edge halos and speckle; no gradients, no black key line drawn separately.',
        key_features:
          'one block printed in successive colors; light-to-dark stacked layers; edge halos of earlier colors; speckled ink; nested shapes',
      }),
      avoid: [...PRINT_BASE, 'gradients', 'separate black outline', 'photographic texture'],
      briefs: [
        'Reduction linocut of a red squirrel on a pine branch, five stacked colors from cream to deep blue, earlier orange peeking at the edges of the darker fur, speckled ink. No text or logo.',
        'Reduction linocut of a mountain lake at sunset, stepped bands of yellow, pink, violet and indigo nesting into the peaks and their reflection. No text or logo.',
        'Reduction linocut of a split pomegranate on a plate, seeds cut out of the last dark red pass, cream and pink halos around them. No text or logo.',
      ],
    },
    {
      name: 'Chine-Collé Etching',
      domain: 'etching printed onto a laid-in colored tissue',
      tags: ['chine-colle', 'etching', 'collage-print'],
      dna: pr({
        aesthetic:
          'Chine-collé etching: an etched plate printed onto a thin colored tissue that is glued to the heavier sheet in the same pass, so a tinted panel sits behind the lines.',
        color_and_tone:
          'Black or sepia etched line over one pale tinted tissue, such as gold, rose, celadon or grey, on white paper.',
        lighting_and_shadow:
          'The tissue shape acts as a light or accent zone, with lines providing modeling.',
        texture_and_material:
          'Delicate translucent tissue fibers, crisp or torn tissue edges, bitten etched lines, embossed plate mark over both papers.',
        camera_and_composition:
          'Keep the requested framing; the tissue panel covers part of the image, often behind the focal subject or the sky.',
        atmosphere_and_mood: 'Refined, quiet and precious, a print with a hidden glow.',
        rendering_and_quality:
          'Clean etched lines crossing from white paper onto the tinted tissue, visible tissue edge, plate mark; no painted color.',
        key_features:
          'tinted tissue laid under the etching; visible torn or cut tissue edge; black etched line; embossed plate mark; one accent color zone',
      }),
      avoid: [...PRINT_BASE, 'painted color washes', 'full-color print', 'missing tissue panel'],
      briefs: [
        'Chine-collé etching of a crescent moon over a sleeping harbor town, a pale gold tissue rectangle glued behind the sky, fine black etched lines crossing from white paper onto the tissue, plate mark around both. No text or logo.',
        'Chine-collé etching of an adult lute player seated on a stone bench, a torn rose tissue behind her figure, bitten line modeling. No text or logo.',
        'Chine-collé etching of a sprig of cherry blossom, a celadon tissue circle behind the branch, delicate translucent fibers visible. No text or logo.',
      ],
    },
    {
      name: 'Carborundum Print',
      domain: 'painterly grit-plate intaglio',
      tags: ['carborundum', 'intaglio', 'painterly'],
      dna: pr({
        aesthetic:
          'Carborundum print: silicon carbide grit mixed with glue and brushed onto a plate like paint, so the grit holds ink and prints deep, velvety, brushy darks.',
        color_and_tone:
          'Extremely deep velvet blacks or saturated single colors, brushy mid-tones where grit is thin, bright paper left where no grit was painted.',
        lighting_and_shadow:
          'Bold painterly light and dark masses; light is simply the unpainted plate.',
        texture_and_material:
          'Gritty granular ink surface with brush marks preserved, raised and embossed ink you could touch, soft furry edges.',
        camera_and_composition:
          'Keep the requested framing; forms made from broad brushed gestures.',
        atmosphere_and_mood: 'Heavy, dramatic and physical, darkness you can feel.',
        rendering_and_quality:
          'Brushy granular tone with deep embossed velvet darks; no fine line, no smooth wash.',
        key_features:
          'brushed grit plate; deep velvet embossed darks; brush marks in granular tone; soft furry edges; bold painterly masses',
      }),
      avoid: [...PRINT_BASE, 'fine line hatching', 'smooth flat color', 'crisp vector edges'],
      briefs: [
        'Carborundum print of a black bull charging head-down, its body a deep velvet brushed mass of granular ink, brush marks visible in the dust around its hooves, raised embossed black. No text or logo.',
        'Carborundum print of a crumbling tower against a dark sky, broad brushed grit strokes for the clouds, bright unpainted paper in a single window. No text or logo.',
        'Carborundum print of an adult diver plunging into dark water, the water a brushy deep blue granular mass, soft furry edges around the body. No text or logo.',
      ],
    },
    {
      name: 'Pochoir Hand Stencil',
      domain: 'hand-colored stencil print',
      tags: ['pochoir', 'stencil', 'hand-colored'],
      dna: pr({
        aesthetic:
          'Pochoir: a fine line image colored by hand through a series of cut stencils, gouache or watercolor dabbed with brushes so each color sits in a crisp stencil shape.',
        color_and_tone:
          'Brilliant saturated gouache colors, jade, coral, lemon, black and metallic gold, each in its own crisp stencil area on white paper.',
        lighting_and_shadow:
          'Stylized flat lighting with small stippled or dabbed gradients inside the stencil shapes.',
        texture_and_material:
          'Dabbed brush stipple within crisp stencil edges, slightly thicker pigment pooling along edges, metallic gold accents, fine printed key line.',
        camera_and_composition:
          'Keep the requested framing; elegant stylized shapes with generous white paper.',
        atmosphere_and_mood: 'Chic, luminous and elegant, a hand-colored fashion plate.',
        rendering_and_quality:
          'Crisp stencil boundaries filled with dabbed hand color; no screenprint ink film and no digital flat fills.',
        key_features:
          'crisp cut-stencil color shapes; dabbed brush stipple inside shapes; brilliant gouache palette; metallic gold accents; fine key line',
      }),
      avoid: [...PRINT_BASE, 'screenprint ink film', 'flat digital fill', 'muddy dull color'],
      briefs: [
        'Pochoir hand-stencil print of an adult woman in a beaded evening gown walking a greyhound, jade and coral dabbed through crisp stencils, metallic gold beads, generous white paper. No text or logo.',
        'Pochoir hand-stencil print of a flock of flamingos wading in a lagoon, coral stippled gradients inside each stencil shape, fine black key line. No text or logo.',
        'Pochoir hand-stencil print of a tiered garden fountain with parrots on the rim, lemon and jade pigment pooling along stencil edges. No text or logo.',
      ],
    },
  ],
};

export const aliases = {
  'SP06-036': 'Monotype',
  'SP06-037': 'Aquatint',
  'SP06-038': 'Mezzotint',
  'SP06-041': 'Rubber Stamp',
};

export default spec;
