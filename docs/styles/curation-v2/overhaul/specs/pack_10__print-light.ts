import type { Create, Dna, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';

// Print & light finishes: emissive modifiers (light added to the target) are separate from
// physical print processes (pressure, foil, ink on a printed support). Each preset says which.
const AVOID = [...STYLE_AVOID, 'readable printed text'];

const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
const pad = (t: string, min: number, tail: string) =>
  words(t) < min ? `${t.replace(/\.$/, '')}, ${tail}` : t;

function emissive(
  aesthetic: string,
  behavior: string,
  color: string,
  texture: string,
  mood: string,
  key: string,
): Dna {
  return {
    aesthetic,
    subject_treatment: `Emissive modifier: keep the prompt's subject and setting, and add this light to the subject's contours or surfaces: ${behavior}`,
    color_and_tone: pad(color, 9, 'glowing against a darker surrounding so the light reads.'),
    lighting_and_shadow:
      'The emissive element is the key light source, casting colored light on nearby surfaces.',
    texture_and_material: pad(texture, 9, 'with a physically plausible light source.'),
    camera_and_composition:
      'Keep the prompt framing; the glowing lines or surfaces follow the subject so its shape reads at card size.',
    atmosphere_and_mood: pad(mood, 8, 'coming from the light.'),
    rendering_and_quality:
      'Clean glow with controlled bloom, no blown-out haze over the whole frame.',
    key_features: `${key}; emissive modifier`,
  };
}

function print(
  aesthetic: string,
  process: string,
  color: string,
  texture: string,
  mood: string,
  key: string,
): Dna {
  return {
    aesthetic,
    subject_treatment: `Physical print finish: present the prompt's subject as artwork on a printed support (card, paper, cover) finished with this process, keeping the subject recognizable: ${process}`,
    color_and_tone: pad(color, 9, 'as produced by the printing process on the stock.'),
    lighting_and_shadow: 'Raking light across the printed support to reveal relief, gloss or foil.',
    texture_and_material: pad(texture, 9, 'on quality paper or board stock.'),
    camera_and_composition:
      'Close angled view of the printed piece so the finish and the subject both read at card size.',
    atmosphere_and_mood: pad(mood, 8, 'carried by the tactile finish.'),
    rendering_and_quality:
      'Crisp product-photography finish with accurate paper and ink detail; no readable text.',
    key_features: `${key}; physical print process`,
  };
}

const spec: Spec = {
  pack: 'pack_10',
  category: '9. Print And Light Finishes',
  updates: {
    'SP10-078': {
      dna: emissive(
        "Neon light lines: bent glass neon tubes tracing the subject's contours.",
        'neon tubes trace the contours of the subject with glow.',
        'Hot pink, cyan and red neon.',
        'Bent glass tubes with gas glow and mounts.',
        'Nocturnal, electric, bold and retro.',
        'neon tube contours; gas glow',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a dragon outlined in bent pink and cyan neon tubes on a dark stone wall. No text or logo.',
        'Neon light lines tracing a saxophone player mid-solo on a dark brick wall, bent pink and blue glass tubes following his arms and the curve of the horn, small gaps where the tubes end and halos on the bricks. No text or logo.',
        'Neon light lines outlining a crown and a pair of dice hanging in a rainy shop window at night, bent gold and red glass tubes reflected in the wet glass and puddles below. No text or logo.',
      ],
    },
    'SP10-079': {
      dna: print(
        'Foil stamping: metallic foil pressed into paper with slight impression.',
        "the artwork's key lines and shapes are foil-stamped in metallic gold or silver on dark stock.",
        'Gold or silver foil on navy, black or deep green stock.',
        'Metallic foil with crisp edges and slight deboss.',
        'Luxurious, elegant, precious and formal.',
        'metallic foil; crisp impression',
      ),
      avoid: AVOID,
      briefs: [
        'Close photograph of a dark green card with a dragon foil-stamped in gold, raking light on the metallic foil. No text or logo.',
        'Foil-stamped illustration of a sailing ship pressed in bright gold foil into thick navy paper, the metallic lines slightly debossed and catching a raking desk lamp. No text or logo.',
        'Foil-stamped illustration of a luna moth pressed in pale silver foil into black card, fine wing veins shimmering and a soft impression around every edge. No text or logo.',
      ],
    },
    'SP10-080': {
      dna: print(
        'Letterpress: ink pressed deeply into soft cotton paper, leaving crisp debossed impressions.',
        'the artwork is letterpress-printed in one or two inks with a deep bite into cotton paper.',
        'One or two inks on cream cotton paper.',
        'Deep deboss, ink squeeze and paper fibers.',
        'Crafted, tactile, warm and classic.',
        'deep letterpress bite; cotton paper',
      ),
      avoid: AVOID,
      briefs: [
        'Close photograph of a letterpress-printed card of a castle in deep red ink bitten into cream cotton paper. No text or logo.',
        'Letterpress print of a crowing rooster pressed deeply into soft cotton paper in red ink, crisp debossed edges and a slight halo of ink squeeze at the lines. No text or logo.',
        'Letterpress print of a mountain range and pine trees pressed into thick cream cotton paper in dark green ink, deep debossed impressions showing in side light. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'EL Wire Outline',
      domain: 'electroluminescent wire',
      tags: ['el-wire', 'emissive', 'light'],
      dna: emissive(
        'EL wire: thin flexible electroluminescent wire outlining the subject in soft even glow.',
        'thin EL wire outlines the subject in soft even glowing lines.',
        'Soft cyan, green, pink.',
        'Flexible wire with even glow.',
        'Playful, nocturnal, futuristic and soft.',
        'thin EL wire outlines',
      ),
      avoid: AVOID,
      briefs: [
        'Night photograph of a horse and rider in a field outlined in thin glowing cyan EL wire, the soft even glow tracing mane, legs and rider against complete darkness. No text or logo.',
        'Night photograph of a dancer spinning on a rooftop outlined in thin magenta EL wire, the soft even glow tracing her arms and skirt with slight motion blur. No text or logo.',
        'Night photograph of a bicycle and its rider on a dark country road outlined in green EL wire, the glowing wheels and frame hovering in darkness. No text or logo.',
      ],
    },
    {
      name: 'Laser Beam Show',
      domain: 'laser beams in haze',
      tags: ['laser', 'emissive', 'light'],
      dna: emissive(
        'Laser show: sharp colored beams fanning through haze around the subject.',
        'sharp laser beams fan from behind the subject through haze.',
        'Green, red and blue beams.',
        'Beams visible in haze.',
        'Energetic, clubby, dramatic and electric.',
        'laser fans; haze beams',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a dragon skull on a stage with green laser beams fanning through haze behind it. No text or logo.',
        'Laser show at a night concert where sharp green and violet beams fan through thick haze around a lone violinist standing on stage, the beams slicing the smoke. No text or logo.',
        'Laser show projected through haze over a harbor at night, sharp red and blue beams fanning above the boats and reflecting in the black water. No text or logo.',
      ],
    },
    {
      name: 'UV Blacklight Glow',
      domain: 'ultraviolet fluorescence',
      tags: ['uv', 'blacklight', 'light'],
      dna: emissive(
        'UV blacklight: fluorescent paint on the subject glowing under ultraviolet light.',
        'fluorescent patterns on the subject glow under UV while everything else goes dark violet.',
        'Neon fluorescent colors under violet UV.',
        'Fluorescent paint glow.',
        'Psychedelic, nocturnal, eerie and vivid.',
        'UV fluorescent glow',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a skeleton in a costume shop with fluorescent painted bones glowing green and pink under UV blacklight, the rest of the room deep violet. No text or logo.',
        'Photograph of a bowling alley at night under UV blacklight, fluorescent painted pins and lanes glowing orange and cyan, a bowler mid-throw. No text or logo.',
        'Photograph of a mushroom forest diorama painted with fluorescent paints glowing under UV blacklight, caps in neon pink and stems in lime. No text or logo.',
      ],
    },
    {
      name: 'LED Strip Contour',
      domain: 'LED strip contour light',
      tags: ['led-strip', 'emissive', 'light'],
      dna: emissive(
        'LED strip: dotted LED strips tracing edges with visible diodes.',
        "LED strips trace the subject's edges with visible dotted diodes.",
        'Cool white or RGB.',
        'LED strips with visible dots.',
        'Modern, architectural, clean and electric.',
        'dotted LED strips',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an empty ornate throne-like armchair traced by RGB LED strips in a dark hall, visible diodes dotting every edge and colored reflections on the floor. No text or logo.',
        'Photograph of a whale skeleton sculpture traced by dotted LED strips in a dark museum, visible diodes along each rib glowing blue. No text or logo.',
        'Photograph of a small wooden house model traced by white LED strips on a table, visible diodes along the roof and windows. No text or logo.',
      ],
    },
    {
      name: 'Projection Mapping Glow',
      domain: 'projection mapping',
      tags: ['projection-mapping', 'emissive', 'light'],
      dna: emissive(
        "Projection mapping: animated patterns projected precisely onto the subject's surfaces.",
        "projected light patterns map precisely onto the subject's surfaces.",
        'Vivid projected patterns.',
        'Projected light following surfaces.',
        'Spectacular, magical, nocturnal and vivid.',
        'surface-mapped projection',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an old cathedral facade projection-mapped with glowing vines and flowers growing across its stones, the patterns fitted precisely to every arch and statue. No text or logo.',
        'Photograph of a marble statue of a dancer projection-mapped with shifting ocean waves across her dress, the image hugging every fold. No text or logo.',
        'Photograph of a lighthouse projection-mapped with swirling stars and a spiraling beam, the patterns wrapping its round tower at night. No text or logo.',
      ],
    },
    {
      name: 'Fiber Optic Sparkle',
      domain: 'fiber optic points',
      tags: ['fiber-optic', 'emissive', 'light'],
      dna: emissive(
        'Fiber optics: tiny glowing fiber tips scattered across the subject like stars.',
        'tiny fiber-optic points sparkle over the subject.',
        'Color-shifting pinpoints.',
        'Fiber tips with pinpoint glow.',
        'Magical, starry, soft and delicate.',
        'fiber-optic pinpoints',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a long cloak embedded with fiber-optic starlight worn by a dark figure in a garden, tiny glowing fiber tips scattered across the cloth like constellations. No text or logo.',
        "Photograph of a ceiling in a child's bedroom sparkling with fiber-optic stars, tiny glowing tips forming constellations above a sleeping child. No text or logo.",
        'Photograph of a fiber-optic tree glowing in a dark garden, tiny light points at the tip of every branch shifting from blue to pink. No text or logo.',
      ],
    },
    {
      name: 'Glow-in-the-Dark Phosphor',
      domain: 'phosphorescent glow',
      tags: ['phosphor', 'glow-in-dark', 'light'],
      dna: emissive(
        'Glow-in-the-dark: phosphorescent green glow on the subject in darkness.',
        'phosphorescent surfaces glow soft green in darkness.',
        'Pale green phosphor glow.',
        'Phosphorescent paint.',
        'Eerie, playful, nocturnal and soft.',
        'phosphor green glow',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a skeleton key and a skull glowing phosphorescent green in a dark crypt, soft glow fading at the edges, faint outlines of stone around them. No text or logo.',
        "Photograph of a child's bedroom ceiling covered in glow-in-the-dark stars and planets glowing green in the dark, a sleeping child below. No text or logo.",
        'Photograph of a pair of running shoes with glow-in-the-dark soles glowing green on a dark path, a faint footprint trail. No text or logo.',
      ],
    },
    {
      name: 'Blind Embossing',
      domain: 'blind embossed paper',
      tags: ['blind-emboss', 'print', 'finish'],
      dna: print(
        'Blind embossing: raised relief pressed into paper without ink.',
        'the artwork is a raised uninked relief on white or cream paper.',
        'White on white or cream.',
        'Raised paper relief.',
        'Subtle, elegant, tactile and quiet.',
        'uninked raised relief',
      ),
      avoid: AVOID,
      briefs: [
        'Close photograph of a white card with a blind-embossed seahorse in raised relief under raking light, no ink, soft shadows defining every curl of its tail. No text or logo.',
        'Close photograph of a thick cream invitation with a blind-embossed family crest of oak leaves and acorns, raised relief shadowed by a side lamp. No text or logo.',
        'Close photograph of a blind-embossed rose on white cotton paper, petals raised in soft relief and shadows from a low window light. No text or logo.',
      ],
    },
    {
      name: 'Debossing',
      domain: 'debossed paper',
      tags: ['deboss', 'print', 'finish'],
      dna: print(
        'Debossing: artwork pressed down into thick board.',
        'the artwork is pressed into thick board as a recessed impression.',
        'Tonal board color.',
        'Recessed impression in thick board.',
        'Solid, tactile, minimal and premium.',
        'recessed impression',
      ),
      avoid: AVOID,
      briefs: [
        'Close photograph of a thick black board with a debossed lighthouse impression pressed deep into the surface, soft shadows in the recessed lines. No text or logo.',
        'Close photograph of a grey board debossed with a mountain landscape, recessed ridgelines catching raking light. No text or logo.',
        'Close photograph of a kraft board debossed with a crossed pair of oars, the recessed shapes shadowed under a desk lamp. No text or logo.',
      ],
    },
    {
      name: 'Spot UV Gloss',
      domain: 'spot UV varnish',
      tags: ['spot-uv', 'print', 'finish'],
      dna: print(
        'Spot UV: glossy varnish on selected areas over matte stock.',
        'selected parts of the artwork are coated in glossy varnish over matte paper.',
        'Tonal black-on-black or color with gloss.',
        'Gloss vs matte contrast.',
        'Sleek, premium, subtle and modern.',
        'gloss on matte',
      ),
      avoid: AVOID,
      briefs: [
        'Close photograph of a matte black card where a koi fish appears only in glossy spot UV varnish, the gloss catching raking light while the rest stays matte. No text or logo.',
        'Close photograph of a matte navy card with a spot UV pattern of rain falling over an umbrella, glossy streaks revealed by the light. No text or logo.',
        'Close photograph of a matte grey card with a glossy spot UV moon and stars, the varnish glinting at an angle. No text or logo.',
      ],
    },
    {
      name: 'Die-Cut Layers',
      domain: 'layered die-cut paper',
      tags: ['die-cut', 'paper', 'finish'],
      dna: print(
        'Die-cut layers: stacked laser-cut paper layers creating depth.',
        'the artwork is built from stacked die-cut paper layers with shadows.',
        'Tonal paper layers.',
        'Cut paper edges and layered shadows.',
        'Delicate, deep, crafted and magical.',
        'stacked die-cut layers',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a layered die-cut paper scene of a mountain village and a winding river, stacked laser-cut layers casting depth shadows from front to back. No text or logo.',
        'Photograph of a die-cut paper forest with deer between stacked layers, laser-cut trees casting soft depth shadows. No text or logo.',
        'Photograph of a die-cut paper sea with a serpent rising from stacked wave layers, each layer a shade of blue with shadows between. No text or logo.',
      ],
    },
    {
      name: 'Metallic Screenprint Ink',
      domain: 'metallic screen print',
      tags: ['screenprint', 'metallic', 'finish'],
      dna: print(
        'Metallic screenprint: flat layers with metallic ink catching light.',
        'the artwork is screen-printed in flat layers with one metallic ink.',
        'Flat colors plus metallic ink.',
        'Screenprint ink layers.',
        'Bold, crafted, poster-like and shiny.',
        'flat layers; metallic ink',
      ),
      avoid: AVOID,
      briefs: [
        'Close photograph of a screen-printed poster of a vintage race car with its body in metallic silver ink, flat color layers and the metallic catching light. No text or logo.',
        'Close photograph of a screen-printed print of a peacock with metallic copper ink on the feathers, flat layers on cream paper. No text or logo.',
        'Close photograph of a screen-printed owl with metallic gold ink eyes on a dark flat background, the gold catching light. No text or logo.',
      ],
    },
    {
      name: 'Thermography Raised Ink',
      domain: 'thermographic raised print',
      tags: ['thermography', 'raised-ink', 'finish'],
      dna: print(
        'Thermography: glossy raised ink puffed by heat.',
        'the artwork is printed in glossy raised thermographic ink.',
        'Glossy black or colored raised ink.',
        'Puffy glossy raised ink.',
        'Tactile, formal, glossy and crisp.',
        'glossy raised ink',
      ),
      avoid: AVOID,
      briefs: [
        'Close photograph of a card with a crest of a lion and sword in glossy raised black thermography. No text or logo.',
        'Close photograph of a small card with thermographed raised ink forming a coiled octopus, glossy puffed black lines catching light, the matte stock around it slightly textured. No text or logo.',
        'Close photograph of a card with thermographed raised navy ink forming a mountain skyline and a crescent moon, glossy puffed lines throwing tiny shadows on matte white stock. No text or logo.',
      ],
    },
    {
      name: 'Intaglio Engraved Print',
      domain: 'engraved intaglio print',
      tags: ['intaglio', 'engraved', 'finish'],
      dna: print(
        'Intaglio: engraved plate print with raised ink lines and plate mark.',
        'the artwork is an engraved intaglio print with raised ink lines and plate mark.',
        'Black or sepia ink on cream.',
        'Raised ink lines and plate impression.',
        'Classical, precise, precious and formal.',
        'raised engraved lines; plate mark',
      ),
      avoid: AVOID,
      briefs: [
        'Close photograph of an intaglio print of a stag and a hunter in a forest with raised ink lines and a deep plate mark around the image. No text or logo.',
        'Close photograph of an intaglio print of a sea turtle gliding over seagrass, the engraved lines standing up as ridges of black ink you could feel, a sharp rectangular plate mark pressed into thick cream paper. No text or logo.',
        'Close photograph of an intaglio print of a lighthouse lashed by storm waves, burin-cut crosshatching in the sky, ink slightly raised along the deepest cuts and wiped plate tone softening the margins. No text or logo.',
      ],
    },
    {
      name: 'Wax Seal Impression',
      domain: 'wax seal',
      tags: ['wax-seal', 'impression', 'finish'],
      dna: print(
        'Wax seal: artwork stamped into a pool of colored sealing wax.',
        'the artwork is stamped into a pool of sealing wax on paper.',
        'Red, black, gold or green wax.',
        'Glossy wax with crisp relief.',
        'Antique, secret, formal and romantic.',
        'stamped wax relief',
      ),
      avoid: AVOID,
      briefs: [
        'Close photograph of a crimson wax seal stamped with a coiled serpent on folded parchment, drips of wax around the edge. No text or logo.',
        'Close photograph of a green wax seal stamped with an oak tree on a rolled scroll tied with twine, the wax pooled unevenly at the edge, a leaf impression sharp in the center. No text or logo.',
        'Close photograph of a glossy black wax seal stamped with a moth on a cream envelope, the wax spread in an irregular pool with a thin crack, candlelight glinting on the wings. No text or logo.',
      ],
    },
    {
      name: 'Gilded Page Edges',
      domain: 'gilded book edges',
      tags: ['gilded-edges', 'book', 'finish'],
      dna: print(
        'Gilded edges: artwork painted on the fore-edge of a book with gold gilding.',
        "the artwork appears on a book's fanned fore-edge with gilded top edges.",
        'Gold gilding with painted scene.',
        'Gilt and painted paper edges.',
        'Secret, precious, antique and delightful.',
        'fore-edge painting; gilt edges',
      ),
      avoid: AVOID,
      briefs: [
        'Close photograph of an old book with a fore-edge painting of a harbor town revealed when the pages fan, gilt edges when closed. No text or logo.',
        'Close photograph of a thick leather-bound book fanned open to reveal a fore-edge painting of riders and hounds in an autumn forest, the gilt edge glinting where the pages meet. No text or logo.',
        'Close photograph of the fanned fore-edge of an old atlas revealing a painted sailing ship on a green sea, the gold gilding visible on the unfanned top edge. No text or logo.',
      ],
    },
    {
      name: 'Pearlescent Ink',
      domain: 'pearlescent printing ink',
      tags: ['pearlescent', 'ink', 'finish'],
      dna: print(
        'Pearlescent ink: printed artwork with shimmering mother-of-pearl ink.',
        'the artwork is printed in pearlescent ink that shifts color with angle.',
        'Pearl white, pale pink and blue shimmer.',
        'Pearlescent ink sheen.',
        'Delicate, dreamy, luxurious and soft.',
        'pearlescent shimmer ink',
      ),
      avoid: AVOID,
      briefs: [
        'Close photograph of a card printed with a unicorn in shimmering pearlescent ink, colors shifting from pink to green as the card tilts. No text or logo.',
        'Close photograph of a dark blue card printed with a swan on a lake in pearlescent ink, the mother-of-pearl sheen shifting from silver to rose as the card tilts under a lamp. No text or logo.',
        'Close photograph of a black card printed with a drifting jellyfish in pearlescent ink, iridescent violet and green shimmer along its tentacles and a soft halo of light. No text or logo.',
      ],
    },
  ] satisfies Create[],
};

export default spec;
