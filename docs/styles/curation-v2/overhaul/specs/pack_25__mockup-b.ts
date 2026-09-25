import type { Spec } from '../tools/apply';
import { design } from './_design';

// Mockups & product presentation (part B): R-MCK-11/13/17/18 presentation profiles, R-MCK-15/16/20 recipes as
// application profiles, and four new presentation styles that replace R-MCK-03, 09 and 14 (overlaps with
// pack_01 Seamless Packshot, Lifestyle In-Hand Product and Ghost Mannequin Apparel) and the R-MCK-19 check.
const M = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
  kind: 'style' | 'modifier' | 'profile' = 'profile',
) => design(name, domain, tag, 'mockup', fields, avoid, briefs, { text: true, source, kind });

const KEEP = 'redrawn or altered brand artwork';

const spec: Spec = {
  pack: 'pack_25',
  category: '8. Mockups & Product Presentation',
  updates: {},
  creates: [
    M(
      'R-MCK-11',
      'Floating Assembly Presentation',
      'suspended component presentation profile',
      'floating-assembly',
      {
        aesthetic:
          'Floating Assembly Presentation: the real components of a product or package suspended apart on clear axes, with a small assembled view for control.',
        subject_treatment:
          "Suspend the prompt's existing components apart on clear axes in an orderly presentation, keeping their number, relationships and the exact brand artwork.",
        color_and_tone: 'Constant source materials and colors on a quiet neutral background.',
        lighting_and_shadow: 'One common soft light with gentle shadows on every floating part.',
        texture_and_material: 'Original thickness and detail kept, with no new internal parts.',
        camera_and_composition: 'Ordered suspended layout with a small assembled control view.',
        atmosphere_and_mood: 'Clarity of parts and a light exhibition feel, calm and clean.',
        rendering_and_quality: 'Every component could return to its place without changing shape.',
        key_features: 'suspended parts; clear axes; assembled control; exact part count',
      },
      ['invented parts', 'changed geometry', 'purely ornamental explosion', KEEP],
      [
        'The three parts of a "STARFALL" meteorite-collector box, base, glass dome and velvet cradle, floating apart above a dark void with the assembled box small in the corner.',
        'A takeout box for "FLYING NOODLES" floating apart into lid, box and chopsticks, the noodles hanging in midair, very proud of the pun.',
        'A three-piece package, box, tray and sleeve reading "FOLIO", suspended on calm axes with soft light.',
      ],
    ),
    M(
      'R-MCK-13',
      'Neutral Apparel Hanging',
      'hanging garment presentation profile',
      'apparel-hanging',
      {
        aesthetic:
          'Neutral Apparel Hanging: a garment hanging with a gentle natural drape on a discreet support, its cut and print placement kept exact.',
        subject_treatment:
          "Hang the prompt's garment with a moderate drape on a discreet support, keeping its cut, print placement and exact text.",
        color_and_tone: 'Locked garment and print colors on a neutral contrasting background.',
        lighting_and_shadow: 'Broad front-side light with folds kept clear of the design.',
        texture_and_material:
          'Moderate fabric texture and defined seams, the garment in new condition.',
        camera_and_composition:
          'Full garment or a declared crop on a steady axis with the print readable.',
        atmosphere_and_mood:
          'Sober product presentation, focused, uncluttered and quietly confident.',
        rendering_and_quality: 'Sleeves, collar and torso proportions match the garment pattern.',
        key_features: 'gentle drape; discreet hanger; readable print; kept cut',
      },
      ['changed cut', 'duplicated print', 'hanger as the hero', KEEP],
      [
        'A black band tee for "THE DROWNED KINGS" hanging on a simple rail, the sea-serpent crown print across the chest exact, soft light on a grey wall.',
        'A hoodie for "OFFICIAL NAP TEAM" hanging so limply it looks exhausted, the print still perfectly placed and readable.',
        'A canvas apron printed "GOOD BREAD" hanging on a wooden peg, gentle drape and pale background.',
      ],
    ),
    M(
      'R-MCK-15',
      'Screen-in-Device Preservation',
      'screen placed in device profile',
      'screen-device',
      {
        aesthetic:
          'Screen-in-Device Preservation: an existing screen design placed inside a generic device frame with every control and word exactly preserved.',
        subject_treatment:
          "Place the prompt's screen design inside a generic unbranded device as a locked layer, keeping its aspect ratio, controls and every word exact.",
        color_and_tone: 'Screen colors untouched with enough brightness and limited reflections.',
        lighting_and_shadow:
          'Ambient light kept off the controls, reflections only outside key reading.',
        texture_and_material: 'Sober generic device and a sharp screen with every pixel crisp.',
        camera_and_composition:
          'Moderate perspective, kept aspect ratio and a frame that never crops content.',
        atmosphere_and_mood: 'A believable context of use, clean and modern.',
        rendering_and_quality: 'Text, icons, order and states match the source screen.',
        key_features: 'locked screen layer; generic device; kept aspect ratio; exact UI text',
      },
      ['rewritten UI', 'altered aspect ratio', 'invented controls', 'device maker logos', KEEP],
      [
        'The home screen of "ORBIT", a space-station booking app, placed on a generic tablet floating in a dark observation deck, every label on screen exact.',
        'A phone showing the app "WHERE ARE MY KEYS", its giant single button intact, lying on a sofa among suspiciously many keys.',
        'A laptop on a calm desk showing the dashboard "STUDIO 01" exactly as designed, moderate three-quarter view.',
      ],
    ),
    M(
      'R-MCK-16',
      'Multi-Support Identity Set',
      'identity across objects set profile',
      'identity-set',
      {
        aesthetic:
          'Multi-Support Identity Set: one locked identity applied across several different objects at believable scales, symbol and wordmark identical everywhere.',
        subject_treatment:
          "Apply the prompt's locked identity to several different objects, symbol, wordmark and colors identical on each, with believable relative scales.",
        color_and_tone: 'Identity colors constant, backgrounds compatible and never recolored.',
        lighting_and_shadow: 'One common light across the set that favors no single object.',
        texture_and_material: 'Sober materials per object, the print kept apart from the design.',
        camera_and_composition:
          'A family composition with believable scales and the mark visible on each.',
        atmosphere_and_mood: 'Identity cohesion and variety of use, a brand coming to life.',
        rendering_and_quality: 'Symbol, wordmark and proportions correspond on every object.',
        key_features: 'one identity; many objects; believable scales; identical marks',
      },
      ['logos similar but different', 'variable proportions', 'invented back artwork', KEEP],
      [
        'The identity of "IRONHOLD", a fictional mountain-rescue guild, applied to a helmet, a rope bag, a flare and a flag, all laid out on a snowy rock, marks identical.',
        'The identity of "SIR WAFFLES", a restaurant run by a dog, on a menu, an apron, a paper cup and a very small crown, all exact.',
        'The mark "HALDEN" on a business card, a paper bag and a mug, same symbol and wordmark, quiet neutral table.',
      ],
    ),
    M(
      'R-MCK-17',
      'Weathered Public Display',
      'aged public poster mockup profile',
      'weathered-display',
      {
        aesthetic:
          'Weathered Public Display: a preserved graphic placed on an aged public support, with wear limited to the frame and surroundings.',
        subject_treatment:
          "Place the prompt's poster or graphic on a weathered public panel or wall, wear kept on the support while the artwork and text stay exact.",
        color_and_tone: 'Artwork colors legible, the environment in a subordinate palette.',
        lighting_and_shadow: 'Coherent ambient light with no shadow over the main message.',
        texture_and_material: 'Controlled wear on the frame and support, clean ink and brand.',
        camera_and_composition: 'Dominant reading plane with enough context for scale.',
        atmosphere_and_mood: 'Believable street presence and the marks of accumulated public use.',
        rendering_and_quality: 'Aging never alters letters or suggests another campaign.',
        key_features: 'weathered support; clean artwork; street context; readable scale',
      },
      ['rewritten poster', 'dirt over text', 'setting implying a real endorsement', KEEP],
      [
        'A poster for "THE LAST CIRCUS ON EARTH" pasted on a rusted panel in a rain-soaked alley, the frame peeling while the artwork stays pristine.',
        'A lost-cat poster reading "HAVE YOU SEEN KEVIN" in a weathered bus shelter, Kevin himself sitting on the bench under it, unimpressed.',
        'A clean poster for "SUMMER READING" in a worn shop window frame, soft daylight, text fully legible.',
      ],
    ),
    M(
      'R-MCK-18',
      'Gallery Plinth Presentation',
      'museum plinth product presentation',
      'gallery-plinth',
      {
        aesthetic:
          'Gallery Plinth Presentation: a minimal plinth and quiet space present the object like an exhibit, with a consistent believable scale.',
        subject_treatment:
          "Present the prompt's product on a minimal plinth in a quiet gallery space, keeping its identity, size and exact brand text.",
        color_and_tone: 'Neutral surroundings and source colors on the object.',
        lighting_and_shadow: 'Soft exhibition light and a plausible contact shadow.',
        texture_and_material: "A plain matte plinth and the object's material left intact.",
        camera_and_composition: 'Dominant object, proportional plinth and measured negative space.',
        atmosphere_and_mood:
          'Contemplative presentation and formal clarity, quiet and slightly reverent.',
        rendering_and_quality: 'The plinth never hides functional zones or distorts the size.',
        key_features: 'minimal plinth; gallery space; exhibit light; kept scale',
      },
      ['plinth as the hero', 'misleading scale', 'object turned into sculpture', KEEP],
      [
        'A single bottle of "ANCIENT OCEAN" salt on a low plinth in a vast dim gallery, like a relic recovered from a sunken civilization, label exact.',
        'A rubber duck branded "DUCK 1.0" displayed on a museum plinth with enormous seriousness under a single spotlight.',
        'A small ceramic jar labeled "CLAY & CO" on a narrow pale plinth, soft side light and grey walls.',
      ],
    ),
    M(
      'R-MCK-20',
      'Lighting-Angle Contact Sheet',
      'product lighting test contact sheet',
      'lighting-contact',
      {
        aesthetic:
          'Lighting-Angle Contact Sheet: the same object and artwork shown in a grid of equal cells, changing one light or camera condition per cell.',
        subject_treatment:
          "Show the prompt's product in a grid of equal cells, each changing only one declared light or camera condition, the artwork kept exact.",
        color_and_tone: 'Source color and reference exposure constant across cells.',
        lighting_and_shadow:
          'A declared set of frontal, side and raking lights at comparable intensity.',
        texture_and_material:
          'The original material and finish stay unchanged in every single cell.',
        camera_and_composition:
          'A contact sheet of equal cells with notes kept outside the artwork.',
        atmosphere_and_mood: "Disciplined comparison, like a careful photographer's test roll.",
        rendering_and_quality: 'Every difference traces back to the one condition that changed.',
        key_features: 'equal-cell grid; one change per cell; fixed object; test roll',
      },
      ['several variables changed', 'a different object', 'test labels inside the brand', KEEP],
      [
        'A contact sheet of a perfume bottle called "VAMPIRE ROSE" under six lights, frontal, side, raking, backlit, candle and moonlight, same bottle and camera in every cell.',
        'Six test shots of a box of "INVISIBLE INK PENS" under different angles, the box looking equally unremarkable in all of them.',
        'Three calm test frames of a tin labeled "OLD HARBOR", frontal, side and raking light, fixed camera.',
      ],
    ),
    M(
      'R-MCK-03-NEW',
      'Brand-Shape Set Build',
      'set built from brand shapes style',
      'brand-shape-set',
      {
        aesthetic:
          'Brand-Shape Set Build: the product presented inside a studio set built from oversized versions of its own brand shapes and colors.',
        subject_treatment:
          "Present the prompt's product inside a studio set made from giant physical versions of its own brand shapes and colors, the product and brand text kept exact.",
        color_and_tone:
          'The brand palette turned into bold physical set blocks with one neutral floor.',
        lighting_and_shadow: 'Clean studio light with crisp shadows cast by the giant shapes.',
        texture_and_material:
          'Matte painted set pieces, smooth and handmade-looking, beside the real product.',
        camera_and_composition:
          'Product at the center of a graphic set, shapes framing but never covering it.',
        atmosphere_and_mood: 'Playful, bold and art-directed, a brand you can walk into.',
        rendering_and_quality:
          'Crisp editorial set photography with the product and label razor sharp.',
        key_features: 'giant brand shapes; painted set; bold palette; product at center',
      },
      ['set covering the product', 'shapes unrelated to the brand', KEEP],
      [
        'A bottle of "CRESCENT" moon-water standing inside a set built from giant pale-blue crescent moons and stars, crisp studio shadows, the label exact.',
        'A can of "TRIANGLE COLA" surrounded by enormous painted triangles that look slightly threatening, bright red and yellow set, the can completely calm.',
        'A soap bar branded "ROUND" resting in a set of large soft circles in pastel green and cream, gentle studio light.',
      ],
      'style',
    ),
    M(
      'R-MCK-09-NEW',
      'Giant Product Miniature World',
      'giant product in miniature scene style',
      'giant-miniature',
      {
        aesthetic:
          'Giant Product Miniature World: the product shown towering over a detailed miniature world, with tiny figures reacting to it like a landmark.',
        subject_treatment:
          "Place the prompt's product at giant scale in a detailed miniature world of tiny people, vehicles and buildings, keeping the product and brand text exact.",
        color_and_tone: 'Bright miniature colors around the product, with its own palette kept.',
        lighting_and_shadow:
          'Soft sunlight with a long product shadow falling across the tiny world.',
        texture_and_material:
          "Model-railway miniatures, tiny figures and the product's real material.",
        camera_and_composition: 'Low tilt-shift view with the product rising like a monument.',
        atmosphere_and_mood: 'Wonder and humor, a small world gathering around something enormous.',
        rendering_and_quality:
          'Crisp miniature photography with selective focus and a sharp label.',
        key_features: 'giant product; miniature world; tiny figures; tilt-shift focus',
      },
      ['product label distorted', 'figures covering the brand', KEEP],
      [
        'A giant bottle of "ETERNAL SPRING" water rising out of a miniature mountain village, tiny pilgrims climbing toward it with lanterns, label exact.',
        'A huge jar of "EMERGENCY PICKLES" in the middle of a tiny city square, miniature firefighters trying to open the lid with ladders.',
        'A tall tea tin labeled "SLOW HILLS" standing in a miniature countryside at sunset, a tiny farmer resting in its shadow.',
      ],
      'style',
    ),
    M(
      'R-MCK-14-NEW',
      'Landscape Billboard Mockup',
      'giant billboard in landscape style',
      'landscape-billboard',
      {
        aesthetic:
          'Landscape Billboard Mockup: a campaign poster shown on a huge freestanding billboard placed in a wide, dramatic open landscape.',
        subject_treatment:
          "Place the prompt's poster or ad on a giant freestanding billboard in a wide open landscape, the artwork and every word kept exact and readable.",
        color_and_tone: 'Landscape tones as a subordinate backdrop to the billboard artwork.',
        lighting_and_shadow:
          'Natural light matched between the billboard face and the land around it.',
        texture_and_material: 'A clean billboard face, steel structure and real terrain around it.',
        camera_and_composition:
          'Wide shot with the billboard dominant and the landscape giving scale.',
        atmosphere_and_mood: 'Epic, lonely and cinematic, a message standing alone in the world.',
        rendering_and_quality:
          'Photographic landscape realism with the billboard art crisp and square to view.',
        key_features: 'giant billboard; wide landscape; matched light; readable artwork',
      },
      ['warped billboard art', 'real location or brand', KEEP],
      [
        'A billboard reading "YOU ARE NOT LOST" standing alone in an endless salt flat at dusk, its light the only thing for miles, artwork exact.',
        'A giant billboard for "ALIEN PARKING ONLY" in the middle of a desert, with a very small flying saucer parked neatly beneath it.',
        'A billboard for "OPEN FIELDS" in a quiet green valley under drifting clouds, soft daylight and readable type.',
      ],
      'style',
    ),
    M(
      'R-MCK-19-NEW',
      'Shop-Window Display Set',
      'shop window display mockup style',
      'shop-window',
      {
        aesthetic:
          'Shop-Window Display Set: the product presented as the hero of a designed shop-window display, seen from the street through the glass.',
        subject_treatment:
          "Stage the prompt's product as the hero of a designed shop window seen from the street, with props that support it and the brand text kept exact.",
        color_and_tone:
          'A window palette built around the product, with warm interior light against the street.',
        lighting_and_shadow:
          'Warm window spotlights inside and soft street light outside the glass.',
        texture_and_material:
          'Clean glass with faint reflections, painted props and the real product.',
        camera_and_composition:
          'Street-level frontal view through the window, the product centered.',
        atmosphere_and_mood: 'Inviting and theatrical, a small stage you want to walk into.',
        rendering_and_quality:
          'Crisp photographic window display with light reflections that never cover the label.',
        key_features: 'shop window stage; street view; warm spotlights; hero product',
      },
      ['reflections over the brand', 'real shop names', KEEP],
      [
        'A winter shop window for "FROST QUEEN" perfume, the bottle on an ice throne surrounded by paper snowflakes, seen from a snowy street at night.',
        'A shop window for "SENSIBLE SHOES" styled as an extreme adventure display, one pair of beige loafers climbing a painted mountain.',
        'A bakery window for "MORNING LOAF" with one golden bread on a wooden stand and soft morning light from the street.',
      ],
      'style',
    ),
  ],
};

export default spec;
