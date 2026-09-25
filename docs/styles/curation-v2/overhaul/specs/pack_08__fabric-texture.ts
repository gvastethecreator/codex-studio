import type { Dna, Spec } from '../tools/apply';

// Fabric & Texture Focus mixes local textile treatments with whole-figure material replacements.
// Textile presets change only the garments; body presets say so explicitly and keep identity.
const AVOID = [
  'brand logo',
  'readable label text',
  'real person likeness',
  'material applied to the background instead of the target',
  'muddy material noise',
];

const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
const pad = (t: string, min: number, tail: string) =>
  words(t) < min ? `${t.replace(/\.$/, '')}, ${tail}` : t;

function fabric(
  kind: 'textile' | 'body',
  aesthetic: string,
  target: string,
  color: string,
  light: string,
  texture: string,
  mood: string,
  key: string,
): Dna {
  return {
    aesthetic,
    subject_treatment:
      kind === 'textile'
        ? `Make the prompt's garments out of this material while keeping the wearer, their skin, face, pose, action and setting unchanged: ${target}`
        : `Apply this material to the whole figure as a deliberate transformation while keeping identity, face structure, pose and setting readable: ${target}`,
    color_and_tone: pad(
      color,
      9,
      'on the target material while the rest of the scene keeps its natural color.',
    ),
    lighting_and_shadow: pad(
      light,
      9,
      'chosen to reveal how this material reflects, absorbs or transmits light.',
    ),
    texture_and_material: pad(
      texture,
      9,
      'with correct scale, weight and surface behavior at every fold and edge.',
    ),
    camera_and_composition: `Frame the full figure or the garment area large enough that the material reads at card size; the material effect stays on the ${kind === 'textile' ? 'clothing' : 'figure'}.`,
    atmosphere_and_mood: pad(mood, 8, 'carried by how the material moves and catches light.'),
    rendering_and_quality:
      'Photorealistic material rendering with believable physics, clean edges and no smeared or noisy surfaces.',
    key_features: key,
  };
}

const spec: Spec = {
  pack: 'pack_08',
  category: '5. Fabric & Texture Focus',
  updates: {
    'SP08-051': {
      dna: fabric(
        'textile',
        'High-gloss polymer couture: garments of mirror-glossy latex or PVC with liquid highlights and tight reflections.',
        'glossy latex or PVC with sharp specular streaks along every curve.',
        'Deep black, cherry red or chrome silver with white specular streaks.',
        'Hard strip lights that draw long highlights along each curve.',
        'Stretched latex, vinyl and patent polymer with mirror reflections.',
        'Sleek, bold, provocative and futuristic.',
        'mirror-gloss latex or PVC; long specular streaks; tight reflections; liquid highlights',
      ),
      avoid: [...AVOID, 'explicit fetish content'],
      briefs: [
        'Photograph of an adult woman knight whose surcoat and cloak are made of cherry-red high-gloss latex, strip lights drawing long highlights, in a stone armory. No text or logo.',
        'Photograph of an elderly adult man in a black high-gloss PVC trench coat feeding swans in the rain. No text or logo.',
        'Photograph of an adult monk in chrome-silver glossy polymer robes meditating in a white temple. No text or logo.',
      ],
    },
    'SP08-052': {
      dna: fabric(
        'textile',
        'Denim on denim: head-to-toe denim in mixed washes, with visible selvedge, contrast topstitching and fading.',
        'every garment in denim of different washes — raw indigo, stonewashed and bleached — with rivets and contrast stitching.',
        'Raw indigo, mid-blue stonewash and bleached pale blue with copper rivets.',
        'Natural daylight that shows the weave and fading.',
        'Twill denim with slub texture, whiskering, selvedge edges and copper rivets.',
        'Rugged, casual, confident and Americana.',
        'mixed denim washes; contrast topstitching; copper rivets; whiskered fading',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult woman blacksmith in head-to-toe mixed-wash denim — raw indigo apron, stonewashed shirt, bleached trousers — at a glowing forge. No text or logo.',
        'Photograph of an adult knight whose tabard and cloak are made of faded denim with copper rivets, riding through a cornfield. No text or logo.',
        'Photograph of an elderly adult woman in a denim-on-denim dress and jacket playing cards on a porch. No text or logo.',
      ],
    },
    'SP08-053': {
      dna: fabric(
        'textile',
        'Faux fur couture: voluminous long-pile coats and trims with dense, touchable fibers.',
        'voluminous faux-fur coats, stoles or trims with long, dense pile.',
        'Snow white, silver fox grey, caramel or dyed jewel tones.',
        'Soft backlight that halos every hair of the pile.',
        'Long-pile faux fur with visible fiber direction and soft volume.',
        'Opulent, warm, dramatic and wintry.',
        'voluminous long-pile faux fur; backlit halo; dense fibers; winter opulence',
      ),
      avoid: [...AVOID, 'real animal pelts with heads'],
      briefs: [
        'Photograph of an adult woman sorceress in a huge snow-white faux-fur coat backlit on a frozen lake at dusk. No text or logo.',
        'Photograph of an elderly adult man in a caramel long-pile faux-fur coat driving a dog sled. No text or logo.',
        'Photograph of an adult knight wearing an emerald-dyed faux-fur cloak over armor in a snowy courtyard. No text or logo.',
      ],
    },
    'SP08-054': {
      dna: fabric(
        'textile',
        'Chainmail garments: clothing built from interlocking metal rings that drape heavy and shimmer.',
        'garments made of fine interlocking steel, bronze or silver rings — mail dresses, hoods or shirts — that drape with weight.',
        'Steel grey, bronze and silver with warm reflections.',
        'Warm directional light that sparkles on each ring.',
        'Riveted interlocking rings with weight, drape and ring pattern visible.',
        'Protective, ancient, elegant and heavy.',
        'interlocking metal rings; heavy drape; ring-by-ring sparkle; steel and bronze',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult woman in an elegant floor-length silver chainmail gown with a mail hood standing in a candlelit chapel. No text or logo.',
        'Photograph of an elderly adult man wearing a bronze chainmail cardigan over a shirt, reading in a garden. No text or logo.',
        'Photograph of an adult dancer in a fine steel-ring mail dress mid-spin, rings flaring. No text or logo.',
      ],
    },
    'SP08-055': {
      dna: fabric(
        'textile',
        'Chunky knitted wool: garments of thick hand knits — cables, bobbles and ribbing — with cozy volume.',
        'chunky hand-knitted wool garments with cable, bobble and rib patterns and slightly irregular handmade stitches.',
        'Oatmeal, forest green, rust and cream heathered wool.',
        'Soft warm window or firelight.',
        'Chunky wool yarn with visible stitches, fuzz and cable relief.',
        'Cozy, handmade, warm and comforting.',
        'chunky cables and bobbles; visible stitches; wool fuzz; cozy volume',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult knight whose entire armor is replaced by chunky cable-knit oatmeal wool, helm included, standing in a snowy field. No text or logo.',
        'Photograph of an elderly adult woman in a rust chunky-knit poncho feeding a fire in a stone cottage. No text or logo.',
        'Photograph of an adult man in a forest-green bobble-knit cloak rowing on a misty loch. No text or logo.',
      ],
    },
    'SP08-056': {
      dna: fabric(
        'textile',
        'Liquid satin drape: silk-satin garments that pour like liquid, with bias-cut flow and mirror-soft highlights.',
        'bias-cut liquid silk satin that pours over the body in soft folds with luminous highlights.',
        'Champagne, emerald, midnight blue or oxblood satin.',
        'Soft single source that makes highlights slide along the folds.',
        'Heavy silk satin with fluid folds and smooth sheen.',
        'Sensual, elegant, calm and luxurious.',
        'liquid bias-cut satin; sliding highlights; pouring folds; luminous sheen',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult woman in a liquid emerald satin gown pouring down marble steps into a flooded crypt. No text or logo.',
        'Photograph of an adult man in an oxblood satin robe standing on a windy clifftop, the fabric streaming. No text or logo.',
        'Photograph of an elderly adult woman in champagne satin seated at a piano. No text or logo.',
      ],
    },
    'SP08-057': {
      dna: fabric(
        'textile',
        'Tweed tailoring: suits and coats of rough woven wool tweed with flecked color and heritage structure.',
        'tailored garments in textured tweed with herringbone or check weaves and visible colored flecks.',
        'Heather brown, moss, mustard fleck and charcoal herringbone.',
        'Soft overcast countryside light.',
        'Rough wool tweed with herringbone, houndstooth and flecks.',
        'Scholarly, rural, dignified and warm.',
        'flecked wool tweed; herringbone and check; heritage tailoring; overcast light',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult woman dragon-hunter in a heather-brown tweed shooting suit and cap on a misty moor. No text or logo.',
        'Photograph of an adult wizard in a charcoal herringbone tweed robe and waistcoat in a cluttered study. No text or logo.',
        'Photograph of an elderly adult man in a mustard-flecked tweed three-piece suit riding a penny-farthing. No text or logo.',
      ],
    },
    'SP08-058': {
      dna: fabric(
        'textile',
        'Sequin couture: garments covered in overlapping sequins or paillettes that scatter points of light.',
        'garments covered edge to edge in overlapping sequins or paillettes that shift color and sparkle with movement.',
        'Gold, silver, midnight blue or ruby with scattered sparkle.',
        'Hard points of light and spotlights creating glitter.',
        'Overlapping sequins and paillettes with individual reflections.',
        'Glamorous, festive, dazzling and theatrical.',
        'overlapping sequins; scattered sparkle; spotlight glitter; shifting color',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult knight whose full armor is replaced by a suit of ruby sequins, glittering under torchlight in a ruined hall. No text or logo.',
        'Photograph of an elderly adult woman in a midnight-blue paillette coat walking a greyhound at night. No text or logo.',
        'Photograph of an adult man in a gold sequin jumpsuit fishing from a rowboat at sunset. No text or logo.',
      ],
    },
    'SP08-059': {
      dna: fabric(
        'textile',
        'Transparent plastic fashion: clothes of clear or tinted PVC and vinyl that show layers and catch reflections.',
        'garments of clear or tinted transparent plastic — raincoats, skirts, bags — with visible seams and reflections over normal clothes beneath.',
        'Clear, frosted, or tinted pink, yellow and blue plastic.',
        'Bright light producing edge highlights and caustics.',
        'Clear PVC with welded seams, droplets and reflections.',
        'Playful, modern, fresh and experimental.',
        'clear PVC garments; welded seams; edge highlights; visible layers beneath',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult woman knight in a clear PVC tabard and cloak over her armor standing in pouring rain. No text or logo.',
        'Photograph of an elderly adult man in a yellow-tinted transparent raincoat walking through a flooded market. No text or logo.',
        'Photograph of an adult dancer in a frosted pink plastic skirt on a wet rooftop. No text or logo.',
      ],
    },
    'SP08-060': {
      dna: fabric(
        'textile',
        'Velvet garments: plush pile fabric that turns dark in shadow and glows where light grazes it.',
        'garments in plush velvet whose pile shifts from deep shadow to bright sheen along folds.',
        'Deep jewel velvet — burgundy, sapphire, emerald or black.',
        'Low raking light to show the directional pile.',
        'Silk or cotton velvet with directional pile and soft crush.',
        'Rich, sensual, regal and intimate.',
        'plush directional pile; dark-to-sheen folds; jewel tones; raking light',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult woman in a sapphire velvet gown and cape standing on a moonlit battlement. No text or logo.',
        'Photograph of an adult man in a burgundy crushed-velvet suit playing cello in a dark room. No text or logo.',
        'Photograph of an elderly adult woman in emerald velvet feeding peacocks. No text or logo.',
      ],
    },
    'SP08-061': {
      dna: fabric(
        'textile',
        'Lace garments: openwork lace with floral motifs that reveals layers and skin through delicate patterns.',
        'garments made of fine openwork lace — Chantilly, guipure or crochet — with visible floral motifs and scalloped edges.',
        'Ivory, black or dusty rose lace over contrasting layers.',
        'Backlight that shows the openwork pattern.',
        'Fine lace with floral motifs, mesh ground and scalloped edges.',
        'Delicate, romantic, heirloom and intricate.',
        'openwork lace; floral motifs; scalloped edges; backlit pattern',
      ),
      avoid: [...AVOID, 'nudity'],
      briefs: [
        'Photograph of an adult knight whose surcoat is ivory guipure lace over dark chainmail, backlit in a chapel doorway. No text or logo.',
        'Photograph of an elderly adult woman in a black Chantilly lace mantilla and dress at a candlelit window. No text or logo.',
        'Photograph of an adult man in a dusty-rose crochet lace shirt in a sunlit garden. No text or logo.',
      ],
    },
    'SP08-062': {
      dna: fabric(
        'textile',
        'Leather armor garments: hardened, molded and tooled leather plates, straps and buckles made as wearable protection.',
        'garments of hardened, molded leather plates with tooled patterns, rivets, straps and buckles.',
        'Oxblood, tan, dark brown and black leather with brass.',
        'Warm side light to reveal tooling and patina.',
        'Boiled and tooled leather with stitching, rivets and wear.',
        'Rugged, stealthy, practical and adventurous.',
        'molded leather plates; tooled patterns; rivets and buckles; worn patina',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult woman ranger in molded oxblood leather armor with tooled vines crouching on a mossy branch. No text or logo.',
        'Photograph of an elderly adult man in tooled tan leather armor over a sweater gardening. No text or logo.',
        'Photograph of an adult dancer in black leather armor straps mid-leap in a warehouse. No text or logo.',
      ],
    },
    'SP08-063': {
      dna: fabric(
        'textile',
        'Feather couture: garments built from layered feathers — ostrich, peacock, crow or swan — with soft, moving edges.',
        'garments made of layered feathers arranged like plumage, with soft moving edges and iridescence.',
        'Raven black, swan white, peacock teal or dyed jewel feathers.',
        'Soft backlight to reveal feather edges and sheen.',
        'Layered feathers with visible barbs, shafts and iridescence.',
        'Extravagant, avian, graceful and wild.',
        'layered feather plumage; soft moving edges; iridescent sheen; backlit barbs',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult woman in a raven-black feather gown with a high feather collar standing among gravestones at dawn. No text or logo.',
        'Photograph of an adult man in a swan-white feathered coat on a frozen lake. No text or logo.',
        'Photograph of an elderly adult woman in a peacock-feather cape in a greenhouse. No text or logo.',
      ],
    },
    'SP08-064': {
      dna: fabric(
        'textile',
        'Burlap and rags: garments of coarse sackcloth and torn patched rags, tied and knotted together.',
        'garments of coarse burlap and torn rag strips, patched and knotted with rope.',
        'Sack brown, dust grey, faded ochre and earth.',
        'Dim, dusty, natural light.',
        'Coarse burlap weave, frayed edges, rope ties and dirt.',
        'Humble, desperate, eerie and earthy.',
        'coarse burlap; torn patched rags; rope ties; frayed edges',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult scarecrow-like wanderer in burlap and rag strips walking a moonlit cornfield. No text or logo.',
        'Photograph of an adult queen whose gown is made of patched burlap sacks, seated on a throne. No text or logo.',
        'Photograph of an elderly adult man in rag layers ringing a bell in a ruined abbey. No text or logo.',
      ],
    },
    'SP08-066': {
      dna: fabric(
        'textile',
        'Origami paper couture: garments folded from crisp paper — pleats, facets and cranes — with sharp creases.',
        'garments folded from washi or crisp paper with sharp creases, pleated panels and folded motifs.',
        'Ivory washi, kraft brown, or single bold paper colors.',
        'Clean side light that shows every crease and facet.',
        'Folded paper with sharp creases, faceted planes and fibers.',
        'Delicate, precise, inventive and fragile.',
        'folded paper facets; sharp creases; pleated panels; washi fibers',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult woman in a gown folded entirely from ivory washi with origami crane sleeves in a bamboo grove. No text or logo.',
        'Photograph of an adult knight whose armor is folded from kraft paper facets standing in light rain. No text or logo.',
        'Photograph of an elderly adult man in a red paper-folded coat reading on a bench. No text or logo.',
      ],
    },
    'SP08-067': {
      dna: fabric(
        'textile',
        'Bubble wrap fashion: garments made of clear bubble wrap, with rows of air cells catching light.',
        'garments made of clear or tinted bubble wrap sheets with visible air cells, taped seams and puffy volume.',
        'Clear, silver-white or tinted bubble wrap with bright highlights.',
        'Bright light making each bubble glint.',
        'Bubble wrap with rows of air cells, creases and tape.',
        'Playful, absurd, pop and inventive.',
        'bubble wrap cells; glinting highlights; taped seams; puffy volume',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult knight wearing full armor made of bubble wrap standing stiffly in a castle courtyard. No text or logo.',
        'Photograph of an adult woman in a puffy bubble-wrap gown dancing in a white studio. No text or logo.',
        'Photograph of an elderly adult man in a bubble-wrap overcoat waiting at a bus stop. No text or logo.',
      ],
    },
    'SP08-068': {
      dna: fabric(
        'textile',
        'Smoke dress: garments whose lower parts dissolve into drifting smoke while the bodice stays defined.',
        'garments with a defined upper part whose hems and trains dissolve into curling smoke.',
        'Charcoal, ash grey, and white smoke against dark backgrounds.',
        'Backlight and side light to reveal smoke volumes.',
        'Soft volumetric smoke with curling wisps blending from fabric.',
        'Ghostly, mysterious, fleeting and poetic.',
        'hems dissolving into smoke; defined bodice; curling wisps; backlit volumes',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult woman in a gown whose skirt dissolves into curling grey smoke walking through a burned forest. No text or logo.',
        'Photograph of an adult man whose cloak trails into white smoke on a windy bridge. No text or logo.',
        'Photograph of an elderly adult woman whose shawl drifts into smoke at a candlelit table. No text or logo.',
      ],
    },
    'SP08-069': {
      dna: fabric(
        'textile',
        'Water dress: garments formed of flowing clear water with splashes, droplets and caustic light.',
        'garments made of flowing, transparent water with splash edges, droplets and refracted caustics.',
        'Clear aqua and silver with light caustics.',
        'Bright light producing refraction and caustic patterns.',
        'Liquid water with splashes, droplets and refraction.',
        'Fluid, elemental, fresh and surreal.',
        'flowing water garment; splash edges; droplets; refraction caustics',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult woman in a gown of flowing water splashing around her ankles in a desert. No text or logo.',
        'Photograph of an adult knight whose cloak is a cascade of water on a stone bridge. No text or logo.',
        'Photograph of an elderly adult man in a water-made coat sitting in an armchair. No text or logo.',
      ],
    },
    'SP08-070': {
      dna: fabric(
        'textile',
        'Fire dress: garments formed of controlled flame and embers, with a glowing core and flickering edges.',
        'garments made of controlled flame with a glowing core, flickering edges and falling embers, never burning the wearer.',
        'Orange, gold and red flame with white-hot core.',
        'Self-illuminating flame lighting the wearer and surroundings.',
        'Flame tongues, embers and heat shimmer.',
        'Fierce, ceremonial, dangerous and magnificent.',
        'flame-made garment; glowing core; falling embers; self-illumination',
      ),
      avoid: [...AVOID, 'burning skin'],
      briefs: [
        'Photograph of an adult woman in a gown of controlled flame walking through a snowy forest at night. No text or logo.',
        'Photograph of an adult man in a coat of fire standing in a dark library. No text or logo.',
        'Photograph of an elderly adult woman in a flame shawl by a frozen lake. No text or logo.',
      ],
    },
    'SP08-071': {
      dna: fabric(
        'body',
        'Porcelain doll transformation: the figure rendered as glazed bisque porcelain with painted features, fine cracks and ball-joint seams.',
        'glazed porcelain skin with painted cheeks and lashes, hairline cracks and visible joint seams at neck, elbows and knees.',
        'Porcelain white, blush pink and painted accents.',
        'Soft studio light with glaze highlights.',
        'Glazed and bisque porcelain with crackle and painted detail.',
        'Uncanny, fragile, eerie and beautiful.',
        'glazed porcelain skin; painted features; hairline cracks; ball-joint seams',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult woman transformed into a porcelain doll with a hairline crack across her cheek, seated in an abandoned nursery. No text or logo.',
        'Photograph of an adult knight rendered as glazed porcelain with joint seams, standing in a garden. No text or logo.',
        'Photograph of an elderly adult man as a porcelain figure reading by a window. No text or logo.',
      ],
    },
    'SP08-072': {
      dna: fabric(
        'body',
        "Tattoo skin mapping: the figure's visible skin covered in graphic tattoo work that follows anatomy, ornamental and ceremonial.",
        'graphic tattoo designs mapped across visible skin, flowing with anatomy, in a consistent style chosen per prompt.',
        'Black ink with optional red, indigo and ochre color work.',
        'Soft side light to show skin and ink.',
        'Skin with healed ink, linework and shading.',
        'Ceremonial, bold, personal and striking.',
        'anatomy-following tattoo work; black ink with color; ornamental mapping',
      ),
      avoid: [...AVOID, 'readable tattoo text', 'nudity'],
      briefs: [
        'Photograph of an adult woman warrior whose arms, neck and face are covered in flowing black-and-red dragon tattoo work, standing in a temple. No text or logo.',
        'Photograph of an elderly adult man with ornamental indigo tattoos across his bald head and hands fishing at dawn. No text or logo.',
        'Photograph of an adult man with ceremonial ochre tattoo mapping playing a drum by a fire. No text or logo.',
      ],
    },
    'SP08-073': {
      dna: fabric(
        'body',
        "Body paint: trompe-l'oeil paint on the figure that imitates clothing, patterns or landscapes.",
        'paint applied to the figure that imitates clothing, patterns or scenery, with visible brush edges on close view.',
        'Saturated painted color with clean edges.',
        'Even studio light to reveal paint detail.',
        'Matte and satin paint on skin with brush texture.',
        'Artful, playful, surprising and bold.',
        "trompe-l'oeil body paint; painted clothing illusion; brush edges",
      ),
      avoid: [...AVOID, 'nudity'],
      briefs: [
        "Photograph of an adult man whose shirt, tie and waistcoat are entirely trompe-l'oeil body paint, standing in a tailor shop. No text or logo.",
        'Photograph of an adult woman painted to blend into a starry night backdrop, only her face readable. No text or logo.',
        "Photograph of an elderly adult man painted with a knight's armor illusion holding a real sword. No text or logo.",
      ],
    },
    'SP08-074': {
      dna: fabric(
        'textile',
        'Bandage and mummy wraps: garments made of aged linen strips wound around the body, frayed and layered.',
        'garments made of wound, frayed aged linen bandages layered over the body.',
        'Yellowed linen, sand and dust brown.',
        'Low warm tomb light or harsh sun.',
        'Aged linen strips with fraying, stains and layering.',
        'Ancient, eerie, still and mysterious.',
        'wound linen strips; frayed ends; aged stains; layered wraps',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult woman in an elegant gown made of wound aged linen strips standing in a desert tomb doorway. No text or logo.',
        'Photograph of an adult man in bandage-wrapped clothing with frayed ends riding a camel. No text or logo.',
        'Photograph of an elderly adult woman in linen-strip wraps knitting in a museum. No text or logo.',
      ],
    },
    'SP08-075': {
      dna: fabric(
        'body',
        'Gold leaf gilding: the figure or its garments covered in applied gold leaf with crackle and burnish.',
        'gold leaf applied over the figure or garments, with visible leaf edges, crackle and burnished highlights.',
        'Warm gold, rose gold and dark bole underneath.',
        'Warm raking light to show leaf edges and burnish.',
        'Gold leaf with crackle, edges and burnished sheen.',
        'Sacred, precious, divine and still.',
        'gold leaf edges; crackle; burnished sheen; warm raking light',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult woman whose face, hands and gown are covered in cracked gold leaf standing in a dark chapel. No text or logo.',
        'Photograph of an adult man gilded head to toe sitting in a fish market. No text or logo.',
        'Photograph of an elderly adult man with a gold-leafed coat feeding pigeons. No text or logo.',
      ],
    },
    'SP08-076': {
      dna: fabric(
        'textile',
        'Viscous gel couture: garments of thick glossy gel that drips, stretches and holds bubbles.',
        'garments made of thick translucent gel that sags, drips and traps bubbles.',
        'Translucent lime, magenta, amber or clear gel.',
        'Backlight and rim light for translucency.',
        'Thick glossy gel with drips, bubbles and stretched strands.',
        'Strange, sensual, playful and alien.',
        'translucent gel garments; drips and strands; trapped bubbles; backlit glow',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult woman in a dripping lime gel gown in a sterile white corridor. No text or logo.',
        'Photograph of an adult knight whose tabard is amber gel dripping onto the flagstones. No text or logo.',
        'Photograph of an elderly adult man in a magenta gel coat at a bus stop. No text or logo.',
      ],
    },
    'SP08-077': {
      dna: fabric(
        'body',
        'Stone statue transformation: the figure turned into carved stone with weathering, moss and chisel marks.',
        'carved stone surface over the whole figure, with weathering, lichen, chips and chisel marks, clothing carved as stone folds.',
        'Limestone grey, marble white or sandstone with moss green.',
        'Soft overcast or raking sun on stone.',
        'Carved stone with weathering, lichen and chisel texture.',
        'Timeless, solemn, eerie and still.',
        'carved stone skin and clothing; lichen and weathering; chisel marks; still pose',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult woman turned into a weathered limestone statue with lichen, standing in a living marketplace. No text or logo.',
        'Photograph of an adult knight as a moss-covered sandstone statue in a forest. No text or logo.',
        'Photograph of an elderly adult man as a marble statue sitting on a park bench. No text or logo.',
      ],
    },
  },
};

export default spec;
