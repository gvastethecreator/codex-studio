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
        'Photograph of an adult monk in flowing chrome-silver high-gloss polymer robes meditating on the floor of a white stone temple, strip lights drawing long liquid highlights down the folds and mirrored reflections of the columns. No text or logo.',
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
        'Photograph of an adult dancer in a fine steel-ring chainmail dress mid-spin on a dark stage, the heavy rings flaring out and shimmering under a single warm spotlight, a mail hood slipping back from her hair. No text or logo.',
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
        'Photograph of an adult ferryman in a forest-green chunky bobble-knit cloak and cable-knit hood rowing across a misty loch at dawn, wool fibers beaded with fog and oars dripping. No text or logo.',
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
        'Photograph of an elderly adult woman in a champagne liquid-satin gown seated at a grand piano in a dim ballroom, the bias-cut fabric pouring over the bench and pooling on the floor with mirror-soft highlights. No text or logo.',
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
        'Photograph of an elderly adult man in a mustard-flecked tweed three-piece suit and flat cap riding a penny-farthing along a country lane, rough woven texture visible on the lapels in soft overcast light. No text or logo.',
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
        'Photograph of an adult cyclist in a clear PVC rain cape and transparent trousers over bright clothes riding through a pouring city street, raindrops beading and streaking down the vinyl layers. No text or logo.',
        'Photograph of an elderly adult man in a yellow-tinted transparent raincoat walking through a flooded market. No text or logo.',
        'Photograph of an adult dancer in a frosted pink transparent plastic skirt and clear vinyl bodice leaping on a wet rooftop at night, city lights reflected in the PVC layers and rain streaking past. No text or logo.',
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
        'Photograph of an elderly adult woman in an emerald velvet dress and cape feeding peacocks on the terrace of an old manor, the plush pile glowing where low sun grazes it and turning black in the folds. No text or logo.',
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
        'Photograph of an adult bride in an ivory guipure lace gown over a dark slip standing backlit in a chapel doorway, light pouring through the floral openwork onto the stone floor. No text or logo.',
        'Photograph of an elderly adult woman in a black Chantilly lace mantilla and dress at a candlelit window. No text or logo.',
        'Photograph of an adult man in a dusty-rose crochet lace shirt with open floral motifs standing in a sunlit rose garden, light passing through the lace and dappling his skin and the gravel path. No text or logo.',
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
        'Photograph of an elderly adult gardener in tooled tan leather armor strapped over a knitted sweater, kneeling among vegetable beds with a trowel, buckles and molded shoulder plates scuffed from years of work. No text or logo.',
        'Photograph of an adult dancer in black molded leather armor plates and harness straps mid-leap across an empty warehouse, dust in a shaft of window light, buckles flashing. No text or logo.',
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
        'Photograph of an adult man in a swan-white feathered coat with a high ruff standing on a frozen lake at dawn, soft feather edges lifting in the wind and breath visible in the cold air. No text or logo.',
        'Photograph of an elderly adult woman in a sweeping peacock-feather cape walking through a Victorian glass greenhouse, the iridescent eyes of the feathers catching dappled light among palms. No text or logo.',
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
        'Photograph of an adult wanderer dressed in coarse burlap sacks and knotted rag strips walking through a moonlit cornfield, a lantern in hand, torn patches and loose threads fluttering, scarecrows watching from their poles. No text or logo.',
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
        'Photograph of an adult street performer whose coat and hat are folded from kraft paper facets standing in light rain, sharp creases softening at the hem where the paper has started to darken. No text or logo.',
        'Photograph of an elderly adult man in a red coat folded entirely from crisp paper, sharp pleats and faceted shoulders, reading on a park bench as a paper crane unfolds from his pocket. No text or logo.',
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
        'Photograph of an adult deliveryman wearing a full suit tailored from bubble wrap standing stiffly on a doorstep with a parcel, rows of air cells catching the porch light. No text or logo.',
        'Photograph of an adult woman in a puffy bubble-wrap ball gown dancing alone in a white studio, rows of air cells catching the softbox light and a few popped bubbles on the floor. No text or logo.',
        'Photograph of an elderly adult man in a long bubble-wrap overcoat and hat waiting at a rainy bus stop, water beading on the air cells, commuters in ordinary coats beside him. No text or logo.',
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
        'Photograph of an adult man in a tailored cloak whose hem dissolves into trailing white smoke crossing a windy stone bridge at dusk, the jacket crisp and defined above the drifting haze. No text or logo.',
        'Photograph of an elderly adult woman at a candlelit dinner table whose knitted shawl drifts off her shoulders into curling grey smoke, candle flames bending in the draft. No text or logo.',
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
        'Photograph of an adult violinist whose long coat is a cascade of flowing water on a stone bridge at dawn, splashes curling from the sleeves as she plays and caustic light rippling on the stones. No text or logo.',
        'Photograph of an elderly adult man in an armchair wearing a coat made of flowing clear water, splashes curling at the cuffs and caustic light rippling across the living room wallpaper. No text or logo.',
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
        'Photograph of an adult man in a long coat formed of controlled flame standing in a dark library, the glowing core at his chest, flickering edges lighting the spines of old books without burning them. No text or logo.',
        'Photograph of an elderly adult woman wrapped in a shawl of fire and embers sitting by a frozen lake at night, her reflection glowing orange on the ice. No text or logo.',
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
        'Photograph of an adult ballerina rendered as glazed porcelain with ball-joint seams at her knees and elbows, standing on pointe in a garden gazebo, a hairline crack across one arm. No text or logo.',
        'Photograph of an elderly adult man transformed into a glazed bisque porcelain figure reading by a rainy window, painted eyebrows, fine hairline cracks and ball-joint seams at the wrists and knees. No text or logo.',
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
        "Photograph of an elderly adult man in an ordinary chair painted head to toe with a trompe-l'oeil suit and tie illusion, holding a real teacup, the painted fabric folds perfectly convincing. No text or logo.",
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
        'Photograph of an adult man in bandage-wrapped clothing with frayed linen ends fluttering, riding a camel across dunes at sunset, layered aged strips over his shoulders and head. No text or logo.',
        'Photograph of an elderly adult woman in aged linen-strip wraps sitting in a quiet museum gallery knitting beside a sarcophagus display, frayed ends trailing onto the floor. No text or logo.',
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
        'Photograph of an adult fishmonger gilded head to toe in cracked gold leaf working at a stall in a busy fish market, ice and silver fish around him, burnished highlights on his arms. No text or logo.',
        'Photograph of an elderly adult man in a coat covered in gold leaf feeding pigeons in a grey city square, flakes of gilding lifting at the cuffs and catching overcast light. No text or logo.',
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
        'Photograph of an adult chef whose apron and jacket are thick glossy amber gel dripping onto a restaurant kitchen floor, bubbles trapped inside and long strands stretching from the hem. No text or logo.',
        'Photograph of an elderly adult man in a magenta gel coat waiting at a bus stop, the glossy material slowly sagging and dripping onto the pavement, bubbles held inside. No text or logo.',
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
        'Photograph of an adult gardener turned into a moss-covered sandstone statue kneeling among vegetable beds, chisel marks on the coat, lichen on the shoulders and ferns growing at the knees. No text or logo.',
        'Photograph of an elderly adult man turned into a weathered marble statue sitting on a park bench, a folded stone book in his hands, rain streaks and a pigeon on his head. No text or logo.',
      ],
    },
  },
};

export default spec;
