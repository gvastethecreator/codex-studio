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
      'Keep the prompt framing; the glowing lines or surfaces follow the subject so its shape reads at a glance.',
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
      'Close angled view of the printed piece so the finish and the subject both read at a glance.',
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
        "On a dark stone wall a coiled dragon is outlined in bent pink and cyan glass tubes, humming softly in the rain. No readable text or logo.",
        "A saxophone player mid-solo is traced on a dark brick wall in bent pink and blue tubes that follow his arms into the bell. No readable text or logo.",
        "In a rainy shop window at night a crown and a pair of dice hang in bent gold and red glowing tubes. No readable text or logo.",
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
        "On a dark green card a coiled dragon is pressed in gold that flashes under raking light, the paper dented around every line. No readable text or logo.",
        "A sailing ship is pressed in bright gold into thick navy paper, the metallic lines slightly sunk into the fibers. No readable text or logo.",
        "A luna moth is pressed in pale silver into black card, fine wing veins shimmering with a soft impression around them. No readable text or logo.",
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
        "On a cream cotton card a hilltop fortress is bitten deep in red ink, crisp debossed edges catching window light. No readable text or logo.",
        "A crowing rooster is pressed deeply into soft cotton paper in red ink, a slight halo of squeeze around each line. No readable text or logo.",
        "A mountain range and pine trees sink into thick cream paper in dark green ink, the impression deep enough to feel. No readable text or logo.",
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
        "At night in a field a horse and rider are outlined in thin glowing cyan wire, the soft even glow tracing mane, legs and reins. No readable text or logo.",
        "On a dark rooftop a dancer spins outlined in thin magenta wire, her arms leaving glowing arcs in the air. No readable text or logo.",
        "On a dark country road a cyclist and bicycle glow in green wire outlines, the wheels hovering like two rings in the night. No readable text or logo.",
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
        "On a smoky stage a beast's skull sits under green beams fanning through haze like a crown of light. No readable text or logo.",
        "At a night concert sharp green and violet beams fan through thick haze around a lone violinist on a rock. No readable text or logo.",
        "Over a harbor at night sharp red and blue beams fan through the fog above the boats and ripple on the water. No readable text or logo.",
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
        "In a costume shop a skeleton's fluorescent painted bones glow green and pink under ultraviolet light while everything else vanishes. No readable text or logo.",
        "At a bowling alley at night fluorescent pins and lanes glow orange and cyan under ultraviolet light as a ball rolls toward them. No readable text or logo.",
        "A mushroom forest diorama painted in fluorescent colors glows neon pink and green under ultraviolet light. No readable text or logo.",
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
        "In a dark hall an ornate empty armchair is traced by RGB diode strips, every edge dotted with small bright points. No readable text or logo.",
        "In a dark museum a whale skeleton sculpture is traced along each rib by dotted strips of glowing diodes. No readable text or logo.",
        "On a table a small wooden house model is outlined in white diode strips along its roof and windows. No readable text or logo.",
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
        "An old cathedral facade comes alive at night as projected vines and flowers grow across its stones, hugging every carving. No readable text or logo.",
        "A marble dancer statue wears shifting ocean waves projected across her dress, the image hugging every fold. No readable text or logo.",
        "A lighthouse wears projected swirling stars and a spiraling beam that wrap around its round tower. No readable text or logo.",
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
        "In a night garden a dark figure wears a long cloak embedded with tiny glowing points scattered like a starfield. No readable text or logo.",
        "A bedroom ceiling sparkles with tiny glowing fiber tips forming constellations above a sleeping adult reader. No readable text or logo.",
        "In a dark garden a tree of glowing fibers shifts at every branch tip from blue to violet like breathing stars. No readable text or logo.",
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
        "In a dark crypt a skeleton key and a skull glow phosphorescent green, the light fading softly at their edges. No readable text or logo.",
        "A ceiling covered in stick-on stars and planets glows green in the dark above a woman who cannot sleep. No readable text or logo.",
        "A pair of running shoes with luminous soles glows green on a dark path, leaving a faint trail of footprints. No readable text or logo.",
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
        "Under raking light a white card shows a seahorse in raised relief, no ink at all, only soft shadows defining its curls. No readable text or logo.",
        "A thick cream invitation carries a family crest of oak leaves and acorns in pure raised relief. No readable text or logo.",
        "On white cotton paper a rose rises in soft relief, petals shadowed by a low window light. No readable text or logo.",
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
        "A thick black board holds a lighthouse pressed deep into its surface, soft shadows pooling in the recess. No readable text or logo.",
        "A heavy grey board on an architect's desk is pressed with a whole mountain landscape, recessed ridgelines and valleys catching low raking light. No readable text or logo.",
        "A kraft board is pressed with a crossed pair of oars, the recessed shapes shadowed under a desk lamp. No readable text or logo.",
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
        "On a matte black card a koi appears only as a glossy varnish that flashes into view when the card tilts. No readable text or logo.",
        "On a matte navy card glossy streaks of rain fall over an umbrella, visible only in the reflected light. No readable text or logo.",
        "On a matte grey card a glossy moon and stars glint at an angle and disappear head-on. No readable text or logo.",
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
        "A mountain village and winding river rise from stacked laser-cut paper layers, each casting a soft shadow onto the next. No readable text or logo.",
        "Deer wander between stacked paper layers of a winter forest, each laser-cut row of trees casting a soft grey depth shadow onto the next. No readable text or logo.",
        "A serpent rises from stacked paper waves, each layer a shade of blue with shadows between them. No readable text or logo.",
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
        "A vintage race car roars across a flat-color print, its body in metallic silver ink that catches the gallery light. No readable text or logo.",
        "A peacock spreads its tail across a flat-color print on cream paper, every feather eye inked in metallic copper that glints under gallery lights. No readable text or logo.",
        "An owl stares out of a dark flat background with metallic gold eyes that catch the light. No readable text or logo.",
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
        "A crest of a lion and sword stands up from a card in glossy raised black ink puffed by heat. No readable text or logo.",
        "A coiled octopus is formed of glossy puffed black lines raised on a small white card. No readable text or logo.",
        "A jagged mountain skyline and a thin crescent moon rise from a stiff white card in glossy puffed navy ink that catches the lamp. No readable text or logo.",
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
        "A stag and a hunter meet in a forest of engraved lines that stand up as ridges of ink, a deep plate mark around them. No readable text or logo.",
        "A sea turtle glides over seagrass, the engraved lines rising as ridges of black ink on damp paper. No readable text or logo.",
        "A lighthouse is lashed by storm waves under burin-cut crosshatching, ink slightly raised across the whole sky. No readable text or logo.",
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
        "On folded parchment a crimson blob of sealing wax holds a coiled serpent, drips spreading around its edge. No readable text or logo.",
        "On a rolled scroll tied with twine a green wax disc bears an oak tree, pooled unevenly at one side. No readable text or logo.",
        "On a cream envelope a glossy black wax pool carries the impression of a moth, spread in an irregular shape. No readable text or logo.",
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
        "An old book's pages fan open to reveal a painted harbor town on the fore-edge, the gilding hiding it when closed. No readable text or logo.",
        "A thick leather-bound book fans open to reveal riders and hounds painted along its edge in an autumn forest. No readable text or logo.",
        "The fanned edge of an old atlas reveals a painted sailing ship on a green sea, the gold visible at each end. No readable text or logo.",
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
        "A unicorn printed on a card shimmers from pink to green as the card tilts in the hand. No readable text or logo.",
        "On a dark blue card a swan on a lake shimmers with mother-of-pearl sheen that shifts from silver to lilac. No readable text or logo.",
        "On black card a drifting jellyfish glows in violet and green iridescent ink along its tentacles. No readable text or logo.",
      ],
    },
  ] satisfies Create[],
};

export default spec;
