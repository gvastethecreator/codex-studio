import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Paper & Pigment vault: portable studies where the support or the pigment mechanism is the
// signature. The ten originals keep their DNA and get creative briefs; ten new studies add
// support and pigment mechanisms the catalog does not cover (inclusion paper, tissue layers,
// singed burn-through, poured pulp, bleach drawing, folded tessellation, pinpricked light, dusted
// pigment, vellum overlays and synthetic-sheet watercolor).
const paper = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  avoid: string[],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'paper-pigment', 'portable-study'],
  dna: dna(fields),
  avoid: [...avoid, ...STYLE_AVOID],
  briefs,
});

const spec: Spec = {
  pack: 'pack_21',
  category: '1. Paper & Pigment',
  updates: {
    'SP21-001': {
      briefs: [
        'A dragonfly hovers above a reed at the edge of a pond, its wings cut from layered sheets that cast tiny real shadows on the paper beneath. No readable text or logo.',
        'A hot-air balloon festival rises in stacked cut-paper layers, each balloon a few flat shapes lifted off the page by foam pads. No readable text or logo.',
        'A deep forest at night is stacked from six layers of dark paper, one lantern cut clean through all of them to glow at the back. No readable text or logo.',
      ],
    },
    'SP21-002': {
      briefs: [
        'A sliced lemon and green leaves glow on a pale table, the seeds and leaf veins left as dry white marks that the transparent wash skipped around. No readable text or logo.',
        'A snowstorm engulfs a mountain cabin, every flake a dry resist mark interrupting the deep blue wash of the night. No readable text or logo.',
        'A spider web glitters across a garden gate at dawn, its threads kept white while pink and gold washes flood around them. No readable text or logo.',
      ],
    },
    'SP21-003': {
      briefs: [
        'A hiker in a bright coat crosses a bare ridge beneath a wide sky, the whole scene built from a few matte opaque planes with brush edges showing. No readable text or logo.',
        'A tugboat pulls a cruise ship out of a harbor, the hulls and water laid in flat opaque color planes like cut shapes of paint. No readable text or logo.',
        'A pair of red boots stands alone on a green doormat under a grey porch light, every surface one broad opaque plane. No readable text or logo.',
      ],
    },
    'SP21-004': {
      briefs: [
        'A single oak leaf and its twig rise from warm paper in shallow pressed relief, veins and serrated edges catching a low raking light. No readable text or logo.',
        'A shoal of fish swims across a cream sheet as barely raised shapes, readable only where the side light grazes their embossed scales. No readable text or logo.',
        'A tiny house with smoke curling from its chimney is pressed into thick paper, the smoke a gentle impressed spiral with no ink at all. No readable text or logo.',
      ],
    },
    'SP21-005': {
      briefs: [
        'A long-eared hare leaps across a low mossy stone, drawn on gray-brown paper with only black for its shadows and white chalk for the light on its back. No readable text or logo.',
        'A blacksmith at the anvil glows on mid-tone paper, white highlights for the sparks and dark marks for the heavy shadows, the paper doing all the rest. No readable text or logo.',
        'An old violinist sits on a stool, her face modeled on toned paper with a few white touches on the brow and cheek. No readable text or logo.',
      ],
    },
    'SP21-006': {
      briefs: [
        'An elderly woman releases a striped kite from a grassy hill, the dry pastel broken into specks by the paper tooth in the sky and the grass. No readable text or logo.',
        'A fox curls asleep in a pile of autumn leaves, soft pastel layered so thickly on toothed paper that the leaves glow like embers. No readable text or logo.',
        'A carousel spins at dusk, its lights smudged pastel halos breaking up across the rough paper surface. No readable text or logo.',
      ],
    },
    'SP21-007': {
      briefs: [
        'An orange koi turns under three broad lily leaves, its fins scratched through a dark upper layer to reveal bright gold beneath. No readable text or logo.',
        'A night sky full of constellations is scratched through black into a hidden rainbow underlayer, a lone astronomer standing below. No readable text or logo.',
        'A wolf howls on a ridge, its fur a few deliberate incisions through grey paint showing warm red underneath. No readable text or logo.',
      ],
    },
    'SP21-008': {
      briefs: [
        'A mountain goat balances on a broken rocky ledge above a pale valley, the mineral pigment settling into grains that make the rock look genuinely stony. No readable text or logo.',
        'A shipwreck lies on a sandy seabed, the granulating blue wash freckling the water with settled pigment like drifting sediment. No readable text or logo.',
        'A pair of elephants crosses a dusty plain, their skin built from brown pigment that separated into grains in the paper tooth. No readable text or logo.',
      ],
    },
    'SP21-009': {
      briefs: [
        'A green and orange parrot lands on a flowering branch, each feather deepened by thin transparent films laid one over another after drying. No readable text or logo.',
        'A stained-glass window seems to glow on paper, its colors built from overlapping transparent glazes that shift where they cross. No readable text or logo.',
        'A sunset over a harbor deepens in thin glazes, each boat shadow a violet film laid over the earlier golden layer. No readable text or logo.',
      ],
    },
    'SP21-010': {
      briefs: [
        'A red bicycle courier crosses a windy square with a basket of yellow flowers, the flowers thick palette-knife ridges standing off the page. No readable text or logo.',
        'A lighthouse is battered by a storm, the waves laid on in heavy knife-cut ridges that throw real shadows across the paper. No readable text or logo.',
        'A bowl of lemons sits on a blue cloth, each lemon one or two loaded knife strokes with a raised ridge catching the light. No readable text or logo.',
      ],
    },
  },
  creates: [
    paper(
      'Inclusion Paper Ground',
      'painting on handmade inclusion paper',
      'inclusion-paper',
      {
        aesthetic:
          'Inclusion paper ground: light painting on thick handmade paper full of pressed petals, grass fibers and seeds, with deckled edges framing the image.',
        subject_treatment:
          "Paint the prompt's subject lightly over the flecked handmade sheet, keeping its shape clear while petals and fibers show through the paint.",
        color_and_tone:
          'Soft washes of color over an off-white sheet flecked with pink, green and gold inclusions.',
        lighting_and_shadow:
          'Gentle diffuse light, with raking side light revealing the uneven fibrous paper surface.',
        texture_and_material:
          'Pressed petals, stray fibers, seed flecks, lumpy handmade surface and soft torn deckle edges.',
        camera_and_composition:
          'The whole sheet visible with its deckled border, the subject floating over the flecked ground.',
        atmosphere_and_mood: 'Gentle, botanical and handmade, like a keepsake from a garden.',
        rendering_and_quality:
          'Light translucent paint that lets the inclusions show, never covering the paper character.',
        key_features: 'pressed petals in paper; deckled edges; light washes; fibrous surface',
      },
      ['smooth printer paper', 'opaque paint covering the ground', 'digital texture overlay'],
      [
        'A hummingbird hovers over a thick handmade sheet, real pressed petals in the paper becoming the flowers it feeds on. No readable text or logo.',
        'A wedding couple walks through a garden painted lightly over paper flecked with rose petals and grass seeds, the deckle edge curling. No readable text or logo.',
        'A lone deer grazes in a pale meadow painted over a fibrous sheet whose stray stems look like tall grass around it. No readable text or logo.',
      ],
    ),
    paper(
      'Translucent Tissue Layers',
      'overlapping tissue paper collage',
      'tissue-layers',
      {
        aesthetic:
          'Translucent tissue layers: torn and cut tissue paper glued in overlapping sheets, colors multiplying where they cross and wrinkles catching the light.',
        subject_treatment:
          "Build the prompt's subject from overlapping translucent tissue shapes, keeping its silhouette readable through the layered color.",
        color_and_tone:
          'Bright translucent tissue colors such as magenta, lemon and cyan mixing into new tones where they overlap.',
        lighting_and_shadow:
          'Light seems to pass through the layers, with darker zones where many sheets stack.',
        texture_and_material:
          'Glue wrinkles, soft torn edges, visible overlaps, faint glue sheen and slight bleeding of dye.',
        camera_and_composition:
          'Simple layered composition with large overlapping shapes and clear subject silhouette.',
        atmosphere_and_mood: 'Cheerful, luminous and handmade, like a sunlit window collage.',
        rendering_and_quality:
          'Authentic tissue collage with wrinkles and overlap colors, never flat digital transparency.',
        key_features: 'overlapping translucent sheets; mixed overlap colors; glue wrinkles; torn edges',
      },
      ['flat digital transparency', 'opaque paper cutout', 'photographic realism'],
      [
        'A school of tropical fish swims through overlapping sheets of tissue, green water turning blue wherever a fish passes over it. No readable text or logo.',
        'A giant rooster crows at dawn, its tail feathers a fan of torn tissue in red, orange and gold that darken where they stack. No readable text or logo.',
        'A chapel window of tissue glows on a sunny wall, wrinkles in the glue catching light like old glass. No readable text or logo.',
      ],
    ),
    paper(
      'Singed Paper Burn-Through',
      'image made by scorching paper',
      'singed-paper',
      {
        aesthetic:
          'Singed paper burn-through: an image made by scorching and burning paper, with browned gradients, charred edges and holes burned clean through.',
        subject_treatment:
          "Form the prompt's subject from scorch tones and burned-through openings, keeping its silhouette and main forms clearly readable.",
        color_and_tone:
          'Cream paper browning through amber and umber to black char at the burned edges.',
        lighting_and_shadow:
          'Tone comes from scorch depth; holes let light or a dark backing show through.',
        texture_and_material:
          'Curled charred edges, delicate ash rims, heat-browned halos and crisp burned holes.',
        camera_and_composition:
          'The sheet shown flat or slightly curled, with burned openings shaping the subject.',
        atmosphere_and_mood: 'Dramatic, fragile and dangerous, an image made by fire.',
        rendering_and_quality:
          'Authentic scorch gradients and real char edges, never painted brown or clean cuts.',
        key_features: 'scorch gradients; charred hole edges; ash rims; curled paper',
      },
      ['painted brown color', 'clean cut holes', 'active flames covering the image'],
      [
        'A phoenix rises from a sheet of paper where its wings are burned clean through, the edges still glowing orange. No readable text or logo.',
        'A forest silhouette is scorched into cream paper, the trees brown and the moon a perfect burned hole letting the dark through. No readable text or logo.',
        'A lighthouse beam is burned through the page as a long open wedge, the sea around it browned by careful scorching. No readable text or logo.',
      ],
    ),
    paper(
      'Poured Pulp Painting',
      'colored paper pulp image',
      'pulp-painting',
      {
        aesthetic:
          'Poured pulp painting: an image made by pouring and placing wet colored paper pulp into a sheet, so shapes have soft fibrous edges and the color is inside the paper.',
        subject_treatment:
          "Shape the prompt's subject from pools of colored pulp set into the sheet, keeping its silhouette readable with soft fibrous edges.",
        color_and_tone:
          'Earthy and bright pulp colors such as indigo, terracotta and moss, matte and fully saturated in the fiber.',
        lighting_and_shadow:
          'Soft even light over a matte surface, with subtle relief where pulp was layered thicker.',
        texture_and_material:
          'Fibrous feathered edges, lumpy pulp thickness, deckled borders and matte felted surface.',
        camera_and_composition:
          'Simple bold shapes on a full handmade sheet with deckled edges.',
        atmosphere_and_mood: 'Earthy, calm and tactile, color grown into the paper itself.',
        rendering_and_quality:
          'Authentic fibrous pulp edges and matte color, never crisp paint strokes.',
        key_features: 'color inside the paper; feathered fiber edges; lumpy surface; deckled sheet',
      },
      ['crisp paint edges', 'glossy surface', 'digital flat shapes'],
      [
        'A blue whale swims across a deckled sheet, its body a pool of indigo pulp with fibers feathering into the pale sea. No readable text or logo.',
        'Three terracotta pots sit on a windowsill, each made of poured pulp with soft fibrous rims and moss-green plants. No readable text or logo.',
        'A sun sets over rolling hills made of layered pulp in orange and olive, the thicker hills standing slightly raised. No readable text or logo.',
      ],
    ),
    paper(
      'Bleach-Drawn Colored Paper',
      'bleach lines on dyed paper',
      'bleach-drawing',
      {
        aesthetic:
          'Bleach-drawn colored paper: lines and shapes drawn with bleach on dark dyed paper, lifting the dye into unexpected pale oranges, pinks and creams.',
        subject_treatment:
          "Draw the prompt's subject in bleached lines and lifted patches on dyed paper, keeping its outline and features clear.",
        color_and_tone:
          'Deep navy, black or purple paper with bleached marks turning rust orange, pink or pale cream.',
        lighting_and_shadow:
          'Light areas are lifted with more bleach; darks stay the original paper dye.',
        texture_and_material:
          'Soft bleach bleed edges, brush and nib marks, uneven lifting and slight paper cockling.',
        camera_and_composition:
          'Graphic composition with glowing pale lines standing out from the dark sheet.',
        atmosphere_and_mood: 'Mysterious, glowing and unexpected, light pulled from darkness.',
        rendering_and_quality:
          'Authentic bleach-lift colors and soft edges, never white paint on dark paper.',
        key_features: 'bleach lines on dark paper; rust and pink lifted tones; soft bleed; cockled sheet',
      },
      ['white paint on dark paper', 'neon digital lines', 'clean vector drawing'],
      [
        'A jellyfish drifts through a navy sheet, its tentacles drawn in bleach that turned a glowing rust orange. No readable text or logo.',
        'A tiger prowls through a purple jungle, its stripes left dark and its fur lifted into soft pinks and creams. No readable text or logo.',
        'A night city skyline is drawn in bleached lines on black paper, every lit window a small cream-orange spot. No readable text or logo.',
      ],
    ),
    paper(
      'Folded Tessellation Relief',
      'pleated paper tessellation',
      'folded-tessellation',
      {
        aesthetic:
          'Folded tessellation relief: a single sheet pleated and folded into a repeating geometric relief, with the subject emerging from light and shadow on the folds.',
        subject_treatment:
          "Suggest the prompt's subject through the pattern and light of a folded tessellation, keeping its silhouette readable across the pleats.",
        color_and_tone:
          'White or single-color paper, with value created entirely by light and shadow on the folds.',
        lighting_and_shadow:
          'Strong raking light across the pleats, bright faces and deep shadowed valleys forming the image.',
        texture_and_material:
          'Crisp folds, repeating pleat modules, slightly softened crease lines and paper grain.',
        camera_and_composition:
          'Frontal or slightly angled view of the whole folded sheet under side light.',
        atmosphere_and_mood: 'Precise, sculptural and meditative, geometry made from one sheet.',
        rendering_and_quality:
          'Accurate folded geometry with real shadows, never flat drawn patterns.',
        key_features: 'repeating pleat modules; raking light on folds; single sheet; value from shadow',
      },
      ['flat printed pattern', 'color painted on paper', 'loose crumpled paper'],
      [
        'A crescent moon appears in a folded white sheet where the pleats open wider, catching more light in its shape. No readable text or logo.',
        'A wave curls across a pleated tessellation, the folds tilting to follow its curve under low morning light. No readable text or logo.',
        'A single eye stares out of a folded sheet of repeating triangles, its iris made only from shadowed valleys. No readable text or logo.',
      ],
    ),
    paper(
      'Pinpricked Paper Light',
      'pierced paper backlit picture',
      'pinpricked',
      {
        aesthetic:
          'Pinpricked paper light: a picture made by piercing thousands of tiny holes through paper, seen glowing when held against light or as raised dots in side light.',
        subject_treatment:
          "Render the prompt's subject as patterns of tiny pierced holes, denser in bright areas, keeping its outline and form readable.",
        color_and_tone:
          'Cream or dark paper with glowing warm points of light where it is pierced.',
        lighting_and_shadow:
          'Backlight shining through the holes, or raking light catching raised burrs around them.',
        texture_and_material:
          'Tiny round holes of varied size, raised paper burrs and slightly yellowed old paper.',
        camera_and_composition:
          'The sheet held against a window or lamp, the subject glowing as dotted light.',
        atmosphere_and_mood: 'Delicate, magical and old-fashioned, like a candlelit keepsake.',
        rendering_and_quality:
          'Precise pierced dot patterns glowing through paper, never painted dots.',
        key_features: 'thousands of pierced holes; glowing backlight; raised burrs; old paper',
      },
      ['painted dots', 'solid drawn lines', 'digital glow effect'],
      [
        'A sailing ship glows through a sheet held to a candle, its sails and rigging made of thousands of tiny pierced points. No readable text or logo.',
        'A cathedral rose window is pricked into dark paper so the lamplight behind it shines through in a dotted circle of stars. No readable text or logo.',
        'A hare leaping under a full moon is pierced into cream paper, the moon a dense cluster of holes glowing brightest. No readable text or logo.',
      ],
    ),
    paper(
      'Dusted Pigment Stencil',
      'raw pigment dusted through stencils',
      'dusted-pigment',
      {
        aesthetic:
          'Dusted pigment stencil: loose powdered pigment dusted through stencils onto paper, leaving soft velvety color fields with feathered edges and loose grains.',
        subject_treatment:
          "Build the prompt's subject from stenciled fields of dusted powder, keeping its silhouette clear with soft powdery edges.",
        color_and_tone:
          'Rich raw pigments such as ultramarine, cadmium red and yellow ochre, intensely saturated and matte.',
        lighting_and_shadow:
          'No modeled light; density of dusted powder creates lighter and darker areas.',
        texture_and_material:
          'Velvety powder, stray grains, soft feathered stencil edges and faint fingerprints in the dust.',
        camera_and_composition:
          'Bold stencil shapes on white paper with generous space around them.',
        atmosphere_and_mood: 'Vivid, soft and fragile, color that could blow away.',
        rendering_and_quality:
          'Authentic dusted powder texture and matte saturation, never liquid paint.',
        key_features: 'dusted raw pigment; velvety matte fields; feathered stencil edges; loose grains',
      },
      ['liquid paint strokes', 'glossy surface', 'hard vector edges'],
      [
        'A blue hand print and a red bison are dusted onto white paper through stencils, stray grains of pigment scattered like a cave wall. No readable text or logo.',
        'A flock of ultramarine birds is dusted through cut stencils, each bird velvety and soft with grains drifting off its wings. No readable text or logo.',
        'A yellow sun and three ochre pyramids glow in raw dusted pigment, a fingerprint left in the powder at the edge. No readable text or logo.',
      ],
    ),
    paper(
      'Vellum Overlay Layers',
      'stacked drafting vellum overlays',
      'vellum-overlay',
      {
        aesthetic:
          'Vellum overlay layers: drawings on several translucent drafting sheets stacked on top of each other, earlier layers softening behind later ones.',
        subject_treatment:
          "Split the prompt's subject across stacked translucent sheets, keeping it readable while back layers fade into milky haze.",
        color_and_tone:
          'Graphite and ink lines with a few color accents, back layers dimmed by milky translucency.',
        lighting_and_shadow:
          'Soft diffuse light through the sheets, each layer adding a veil of haze.',
        texture_and_material:
          'Frosted translucent sheets, visible sheet edges, tape corners and slight curling.',
        camera_and_composition:
          'Stacked sheets slightly offset so their edges and layers are visible.',
        atmosphere_and_mood: 'Thoughtful, layered and dreamy, like design ideas piling up.',
        rendering_and_quality:
          'Believable translucent layering with clean lines on each sheet, never a single flat drawing.',
        key_features: 'stacked translucent sheets; hazy back layers; tape corners; offset edges',
      },
      ['single flat drawing', 'opaque paper', 'digital blur only'],
      [
        'A city grows across four stacked vellum sheets, old streets fading on the bottom layer and new towers crisp on top. No readable text or logo.',
        'A dancer is drawn in three poses on three stacked sheets, the earlier poses ghosting behind the final leap. No readable text or logo.',
        'A dragon is designed across layered overlays, its skeleton hazy at the back and its scales sharp on the top sheet. No readable text or logo.',
      ],
    ),
    paper(
      'Synthetic-Sheet Watercolor Swirl',
      'watercolor on non-absorbent synthetic paper',
      'synthetic-sheet',
      {
        aesthetic:
          'Synthetic-sheet watercolor swirl: watercolor on smooth non-absorbent plastic paper, where pigment floats, swirls and dries in sharp-edged pools and lifted trails.',
        subject_treatment:
          "Let the prompt's subject emerge from floating pigment pools and swirls, keeping its silhouette readable with some wiped-out lights.",
        color_and_tone:
          'Intense saturated watercolor that stays bright on the white sheet, mixing in marbled swirls.',
        lighting_and_shadow:
          'Lights wiped back to pure white; darks where pigment pooled and dried thick.',
        texture_and_material:
          'Hard drying rings, marbled swirls, wiped trails and a slightly glossy smooth surface.',
        camera_and_composition:
          'Fluid organic composition with swirling pools framing the subject.',
        atmosphere_and_mood: 'Vibrant, liquid and surprising, color with a mind of its own.',
        rendering_and_quality:
          'Authentic floating pigment behavior with sharp dried rings, never absorbed soft washes.',
        key_features: 'floating pigment pools; hard drying rings; wiped white lights; glossy sheet',
      },
      ['soft absorbed washes', 'paper grain texture', 'opaque paint'],
      [
        'A koi swims through a pool of swirling orange and teal pigment that dried with hard rings around its fins. No readable text or logo.',
        'A galaxy spins on a glossy white sheet, its arms marbled violet and blue where the paint floated and pooled. No readable text or logo.',
        'A lone heron stands in a marsh of drifting green pigment, its white body wiped cleanly out of the wet paint. No readable text or logo.',
      ],
    ),
  ],
};

export default spec;
