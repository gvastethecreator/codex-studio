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
        'Neon-outlined knight. No text or logo.',
        'Neon-outlined crown. No text or logo.',
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
        'Foil-stamped knight on navy. No text or logo.',
        'Foil-stamped moth on black. No text or logo.',
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
        'Letterpress dragon. No text or logo.',
        'Letterpress knight. No text or logo.',
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
        'Night photograph of a knight on horseback outlined in thin glowing cyan EL wire. No text or logo.',
        'EL wire dragon. No text or logo.',
        'EL wire dancer. No text or logo.',
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
        'Laser knight. No text or logo.',
        'Laser castle gate. No text or logo.',
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
        'Photograph of a skeleton knight with fluorescent painted bones glowing under UV blacklight. No text or logo.',
        'UV dragon. No text or logo.',
        'UV mushroom forest. No text or logo.',
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
        'Photograph of a throne traced by RGB LED strips in a dark hall. No text or logo.',
        'LED-strip dragon sculpture. No text or logo.',
        'LED-strip castle model. No text or logo.',
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
        'Photograph of a cathedral facade projection-mapped with a glowing dragon coiling across its stones. No text or logo.',
        'Projection-mapped statue. No text or logo.',
        'Projection-mapped castle. No text or logo.',
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
        'Photograph of a cloak embedded with fiber-optic starlight on a dark figure. No text or logo.',
        'Fiber optic dragon. No text or logo.',
        'Fiber optic tree. No text or logo.',
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
        'Photograph of a skeleton key and skull glowing phosphor green in a dark crypt. No text or logo.',
        'Glow-in-dark dragon. No text or logo.',
        'Glow-in-dark moon. No text or logo.',
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
        'Close photograph of a white card with a blind-embossed dragon in raised relief under raking light. No text or logo.',
        'Blind-embossed knight crest. No text or logo.',
        'Blind-embossed rose. No text or logo.',
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
        'Close photograph of a thick black board with a debossed castle impression. No text or logo.',
        'Debossed dragon. No text or logo.',
        'Debossed sword. No text or logo.',
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
        'Close photograph of a matte black card where a dragon appears only in glossy spot UV varnish under raking light. No text or logo.',
        'Spot UV knight. No text or logo.',
        'Spot UV moon. No text or logo.',
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
        'Photograph of a layered die-cut paper scene of a castle and dragon with depth shadows. No text or logo.',
        'Die-cut forest knight. No text or logo.',
        'Die-cut sea serpent. No text or logo.',
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
        'Close photograph of a screen-printed poster of a knight with the armor in metallic silver ink. No text or logo.',
        'Metallic screenprint dragon. No text or logo.',
        'Metallic screenprint owl. No text or logo.',
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
        'Thermography dragon. No text or logo.',
        'Thermography castle. No text or logo.',
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
        'Close photograph of an intaglio print of a stag and knight with raised ink lines and a plate mark. No text or logo.',
        'Intaglio dragon. No text or logo.',
        'Intaglio castle. No text or logo.',
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
        'Close photograph of a crimson wax seal stamped with a dragon on folded parchment. No text or logo.',
        'Wax seal knight. No text or logo.',
        'Wax seal moth. No text or logo.',
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
        'Close photograph of an old book with a fore-edge painting of a dragon over a castle, gilt edges. No text or logo.',
        'Fore-edge painting of a knight. No text or logo.',
        'Fore-edge painting of a ship. No text or logo.',
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
        'Close photograph of a card printed with a unicorn in shimmering pearlescent ink. No text or logo.',
        'Pearlescent dragon. No text or logo.',
        'Pearlescent jellyfish. No text or logo.',
      ],
    },
  ] satisfies Create[],
};

export default spec;
