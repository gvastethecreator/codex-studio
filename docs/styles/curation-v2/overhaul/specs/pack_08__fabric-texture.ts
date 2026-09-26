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
    camera_and_composition: `Frame the full figure or the garment area large enough that the material reads at a glance; the material effect stays on the ${kind === 'textile' ? 'clothing' : 'figure'}.`,
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
        "In a stone armory strip lights draw long liquid highlights down a knight's surcoat and cloak of cherry-red high-gloss latex. No readable text or logo.",
        "An elderly man in a black mirror-gloss PVC trench coat feeds swans in the rain, the whole grey lake reflected in his sleeves. No readable text or logo.",
        "A monk in flowing chrome-silver polymer robes meditates on the floor of a white stone temple, his robes mirroring every pillar. No readable text or logo.",
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
        "At a glowing forge a blacksmith works in head-to-toe mixed-wash denim, a raw indigo apron over a stonewashed shirt and bleached trousers. No readable text or logo.",
        "Riding through a cornfield, a knight wears a tabard and cloak of faded denim with copper rivets and contrast topstitching. No readable text or logo.",
        "An elderly woman in a denim dress and matching denim jacket, each a different wash, wins at cards on her porch. No readable text or logo.",
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
        "Backlit on a frozen lake at dusk, a sorceress disappears into a huge snow-white faux-fur coat, only her eyes showing. No readable text or logo.",
        "An elderly man in a caramel long-pile faux-fur coat drives a dog sled, the dogs matching his coat exactly. No readable text or logo.",
        "Snow collects on an emerald-dyed faux-fur cloak thrown over a knight's armor in a quiet courtyard. No readable text or logo.",
      ],
    },
    'SP08-054': {
      name: 'Chainmail Garments',
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
        "In a candlelit chapel a floor-length silver chainmail gown with a mail hood pools like liquid metal around its wearer. No readable text or logo.",
        "An elderly man reads in his garden wearing a bronze chainmail cardigan over a checked shirt, a teacup balanced on the rings. No readable text or logo.",
        "Mid-spin on a dark stage, a dancer's fine steel-ring dress flares out heavy and shimmering under a single warm spotlight. No readable text or logo.",
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
        "Standing in a snowy field, a knight's entire armor has been replaced by chunky oatmeal cable knit, helm and plume included. No readable text or logo.",
        "An elderly woman in a rust chunky-knit poncho feeds a fire in a stone cottage, a cat asleep in the folds of her wool. No readable text or logo.",
        "Rowing across a misty loch at dawn, a ferryman in a forest-green bobble-knit cloak and cable hood is beaded all over with fog. No readable text or logo.",
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
        "Pouring down marble steps into a flooded crypt, a liquid emerald satin gown becomes indistinguishable from the water. No readable text or logo.",
        "On a windy clifftop an oxblood satin robe streams out behind its wearer like a spilled glass of wine. No readable text or logo.",
        "An elderly pianist in a champagne bias-cut gown plays in a dim ballroom, the satin pouring over the bench and pooling on the parquet. No readable text or logo.",
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
        "On a misty moor a dragon hunter in a heather-brown tweed shooting suit and cap studies enormous footprints through a monocle. No readable text or logo.",
        "A wizard in a charcoal herringbone tweed robe and waistcoat hunts for his spectacles in a cluttered study, wearing them. No readable text or logo.",
        "Riding a penny-farthing along a country lane, an elderly man in a mustard-flecked three-piece tweed suit and flat cap tips his cap to a cow. No readable text or logo.",
      ],
    },
    'SP08-058': {
      name: 'Sequined Garments',
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
        "Under torchlight in a ruined hall, a knight's full armor has been replaced by a suit of ruby sequins scattering light across the stones. No readable text or logo.",
        "An elderly woman in a midnight-blue paillette coat walks a greyhound at night, glittering like a slow constellation. No readable text or logo.",
        "Fishing from a rowboat at sunset, a man in a gold sequin jumpsuit throws sparks of light across the whole lake. No readable text or logo.",
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
        "A cyclist in a clear rain cape and transparent trousers over bright clothes rides through a pouring city street, raindrops beading on every layer. No readable text or logo.",
        "An elderly man in a yellow-tinted transparent raincoat wades through a flooded market, his tweed suit perfectly visible and perfectly dry. No readable text or logo.",
        "Leaping on a wet rooftop at night, a dancer in a frosted pink plastic skirt and clear vinyl bodice carries the city lights in her reflections. No readable text or logo.",
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
        "On a moonlit battlement a sapphire velvet gown and cape turn almost black in shadow and glow where the moon grazes the pile. No readable text or logo.",
        "Only the ridges of a burgundy crushed-velvet suit catch the lamp as a cellist plays in a dark room. No readable text or logo.",
        "An elderly woman in an emerald velvet dress and cape feeds peacocks on a manor terrace, the pile glowing where low sun grazes it. No readable text or logo.",
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
        "Backlit in a chapel doorway, a bride's ivory guipure lace gown over a dark slip casts floral shadows across the stone floor. No readable text or logo.",
        "An elderly woman in a black Chantilly mantilla and dress waits at a candlelit window, the lace drawing patterns on her face. No readable text or logo.",
        "In a sunlit rose garden a man's dusty-rose crochet shirt dapples his skin with the same flowers growing around him. No readable text or logo.",
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
        "Crouched on a mossy branch, a ranger in molded oxblood leather armor with tooled vines is almost invisible among the real ones. No readable text or logo.",
        "Kneeling among vegetable beds with a trowel, an elderly gardener wears tooled tan leather armor strapped over a knitted sweater. No readable text or logo.",
        "A dancer in black molded leather plates and harness straps leaps across an empty warehouse, buckles flashing in a shaft of dusty light. No readable text or logo.",
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
        "Among gravestones at dawn, a raven-black feather gown with a towering feather collar ruffles as crows land on the headstones around it. No readable text or logo.",
        "A man in a swan-white feathered coat with a high ruff stands on a frozen lake at dawn, soft edges lifting in the wind as real swans approach. No readable text or logo.",
        "An elderly woman in a sweeping peacock-feather cape walks through a glass greenhouse, a hundred iridescent eyes catching the daylight. No readable text or logo.",
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
        "A wanderer in coarse burlap sacks and knotted rag strips walks through a moonlit cornfield with a lantern, mistaken by crows for a scarecrow. No readable text or logo.",
        "A queen sits on her throne in a gown of patched burlap sacks, wearing it with more dignity than any silk. No readable text or logo.",
        "An elderly bell ringer in torn rag layers tolls a cracked bell in a ruined abbey, frayed strips fluttering in the draft. No readable text or logo.",
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
        "In a bamboo grove a gown folded entirely from ivory washi rustles, its sleeves ending in flocks of origami cranes. No readable text or logo.",
        "A street performer in a coat and hat folded from kraft paper facets stands in light rain, the sharp creases softening at the hem. No readable text or logo.",
        "An elderly man in a crisp red folded-paper coat reads on a park bench as one of his pleats quietly unfolds into a crane. No readable text or logo.",
      ],
    },
    'SP08-067': {
      name: 'Bubble Wrap Fashion',
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
        "A deliveryman in a full suit tailored from bubble wrap stands stiffly on a doorstep holding a parcel that is wrapped in nothing. No readable text or logo.",
        "Dancing alone in a white studio, a woman in a puffy bubble-wrap ball gown leaves a trail of popped cells behind her. No readable text or logo.",
        "An elderly man in a long bubble-wrap overcoat and hat waits at a rainy bus stop, water beading on the air cells as commuters stare. No readable text or logo.",
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
        "Walking through a burned forest, a woman's gown keeps a crisp bodice while the skirt dissolves into curling grey smoke among the charred trunks. No readable text or logo.",
        "Crossing a windy stone bridge at dusk, a man's tailored cloak trails into white smoke that lingers long after he has passed. No readable text or logo.",
        "At a candlelit dinner an elderly woman's knitted shawl drifts off her shoulders as curling smoke, the candle flames bending toward it. No readable text or logo.",
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
        "In the middle of a desert a woman stands in a gown of flowing clear water, splashes circling her ankles while a camel stares in thirst. No readable text or logo.",
        "A violinist on a stone bridge at dawn wears a long coat of cascading water, splashes curling from her sleeves with each bow stroke. No readable text or logo.",
        "An elderly man sits in his armchair in a coat of flowing water, caustic light rippling across the living room wallpaper. No readable text or logo.",
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
        "Walking through a snowy forest at night, a woman in a gown of controlled flame melts a path behind her. No readable text or logo.",
        "In a dark library a man stands in a long coat of controlled flame, its glowing core at his chest and nervous librarians holding buckets. No readable text or logo.",
        "Wrapped in a shawl of fire and embers, an elderly woman sits by a frozen lake at night, her orange reflection glowing on the ice. No readable text or logo.",
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
        "Seated in an abandoned nursery, a woman transformed into glazed porcelain has a single hairline crack running across her painted cheek. No readable text or logo.",
        "Standing on pointe in a garden gazebo, a ballerina rendered in glazed bisque shows ball-joint seams at her knees and elbows. No readable text or logo.",
        "An elderly man turned into a porcelain figure reads by a rainy window, painted eyebrows raised, fine cracks along his knuckles. No readable text or logo.",
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
        "Standing in a temple, a warrior's arms, neck and face are covered in flowing black-and-red dragon tattoo work that follows every muscle. No readable text or logo.",
        "An elderly fisherman with ornamental indigo tattoos across his bald head and hands casts his net at dawn. No readable text or logo.",
        "Beside a fire, a drummer with ceremonial ochre tattoo mapping plays as the patterns seem to move with the beat. No readable text or logo.",
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
        "Standing in a tailor shop, a man's shirt, tie and waistcoat are entirely trompe-l'oeil body paint, the tailor measuring him in confusion. No readable text or logo.",
        "A woman painted to blend into a starry night backdrop vanishes completely except for her face and one raised hand. No readable text or logo.",
        "An elderly man in an ordinary chair wears a painted suit and tie illusion head to toe, holding a real teacup. No readable text or logo.",
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
        "In a desert tomb doorway a woman wears an elegant gown wound from aged linen strips, frayed ends lifting in the hot wind. No readable text or logo.",
        "Riding a camel across the dunes at sunset, a man in bandage-wrapped clothing trails long frayed linen strips behind him. No readable text or logo.",
        "An elderly woman in aged linen wraps sits knitting in a quiet museum gallery beside a sarcophagus, as if waiting for a friend. No readable text or logo.",
      ],
    },
    'SP08-075': {
      name: 'Gilded Body And Garments',
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
        "In a dark chapel a woman's face, hands and gown are covered in cracked gold leaf, burnished where the candlelight lands. No readable text or logo.",
        "Working his stall in a busy fish market, a fishmonger covered head to toe in cracked gold leaf shines brighter than the silver fish on the ice. No readable text or logo.",
        "Flakes of gilding lift from the cuffs of an old man's gold-leaf coat as he feeds pigeons in a grey city square. No readable text or logo.",
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
        "In a sterile white corridor a woman's lime gel gown drips steadily onto the floor, trapping bubbles as it sags. No readable text or logo.",
        "A chef whose apron and jacket are thick amber gel works in a restaurant kitchen as long strands stretch from his sleeves to the pots. No readable text or logo.",
        "Waiting at a bus stop, a retired postman in a magenta gel coat slowly sags onto the pavement, bubbles held inside the glossy material. No readable text or logo.",
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
        "In a bustling marketplace a woman has turned into a weathered limestone statue with lichen, and the vendors have started hanging baskets on her arms. No readable text or logo.",
        "Kneeling among vegetable beds, a gardener turned to moss-covered sandstone has ferns sprouting from the chisel marks on his coat. No readable text or logo.",
        "A pigeon perches on the shoulder of a grandfather turned to weathered marble, who sits on a park bench holding a stone book. No readable text or logo.",
      ],
    },
  },
};

export default spec;
