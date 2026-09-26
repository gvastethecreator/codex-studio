import type { Spec } from '../tools/apply';
import { au } from './_authors';

// Isekai and high fantasy, author pass: each preset names its series, studio or artist and the
// concrete marks of that look. Template briefs are replaced with original scenes that suit it.
const tv =
  'Contemporary digital television cel with clean outlines, soft gradient highlights and painted fantasy backgrounds.';

const spec: Spec = {
  pack: 'pack_05',
  category: '3. Isekai & High Fantasy',
  updates: Object.fromEntries([
    au('SP05-095', 'Tsukasa Abe - Faded-Line Pale Wash Cel', {
      look: 'Tsukasa Abe Frieren manga art: delicate thin pen lines, gentle understated faces, quiet pastoral fantasy landscapes and a wistful sense of time passing long after the adventure ended.',
      subject:
        'draw people with Abe designs, calm understated faces, long pale hair, simple traveling cloaks and small restrained gestures.',
      color:
        'Pale watercolor washes in faded mint, ivory, soft sky blue and dusty gold on white paper.',
      light:
        'Soft pale daylight rendered with minimal tone, leaving lots of white paper to breathe.',
      texture: 'Thin delicate pen lines, light screentone and faded watercolor wash color pages.',
      camera:
        'Quiet wide landscapes with small travelers, and gentle close-ups on remembering faces.',
      mood: 'wistful quiet remembrance',
      render:
        'Delicate understated fantasy manga illustration with faded pale washes and calm pacing.',
      key: 'Tsukasa Abe thin line; pale washes; wistful travel; understated faces',
      avoid: [
        'a white-haired elf with twin tails in a white and gold robe',
        'existing franchise characters',
      ],
      briefs: [
        'Visiting the grave of a dwarf friend who died two centuries ago, an ageless elf mage in a faded cloak brushes moss off the stone and sets down the same cheap sweet they shared on their first quest. No readable text or logo.',
        'An old dwarf blacksmith and a young priest argue gently about the best way to fold a map while their elf companion quietly watches clouds drift over a pale meadow. No readable text or logo.',
        'On a quiet hilltop at dawn, a small bronze statue of a long-forgotten party of heroes stands half hidden by tall grass and wildflowers. No readable text or logo.',
      ],
    }),
    au('SP05-099', 'Shield Hero Kinema Citrus - Worn Bronze Concentric-Line Cel', {
      look: 'Kinema Citrus Rising of the Shield Hero look (2019): underdog fantasy with worn bronze and leather gear, heavy emotional close-ups, medieval villages and wave-of-monsters battles.',
      subject:
        'draw people with modern light-novel designs, battered leather armor, bronze shields, tired eyes and grim determination.',
      color: 'Worn bronze, leather brown, forest green and dusk red with muted overcast skies.',
      light: 'Overcast fantasy daylight, campfire glow and ominous red monster-wave skies.',
      texture: tv,
      camera:
        'Defensive stances with concentric impact rings, village wides and emotional close-ups.',
      mood: 'stubborn underdog resolve',
      render: 'Solid fantasy television frame with worn gear and defensive heroics.',
      key: 'Worn bronze shields; underdog defense; leather gear; monster waves',
      avoid: [
        'a green gem-set small shield on the forearm',
        'a raccoon-eared girl with a sword',
        'existing franchise characters',
      ],
      briefs: [
        'Bracing a dented bronze pot lid against a stampede of armored boars, a stubborn village cook in a leather apron holds the line while rings of impact ripple out across the muddy square behind her. No readable text or logo.',
        'Falsely accused and covered in flour, a baker sits outside the town gate sharpening a bread knife while a stray dog loyally shares his blanket. No readable text or logo.',
        'A battered bronze shield leans against a tavern wall at night, dents catching the warm lamplight like scars on a face. No readable text or logo.',
      ],
    }),
    au('SP05-248', 'Ryoko Kui - Naturalist Sketchbook Anime Cel', {
      look: 'Ryoko Kui Delicious in Dungeon manga look: meticulous naturalist monster anatomy, cooking diagrams, cozy dungeon camps and detailed yet warm fantasy observation.',
      subject:
        'draw people with Kui designs, expressive distinct faces, practical adventurer gear, and monsters drawn with field-guide anatomical care.',
      color: 'Warm campfire amber, dungeon stone grey, herb green and cooked-food browns.',
      light: 'Cozy campfire glow in dark dungeon halls and soft lantern light on stew pots.',
      texture: 'Clean detailed pen line, field-guide cross sections and warm muted color.',
      camera: 'Cooking scenes around pots, anatomical diagram inserts and dungeon-camp wides.',
      mood: 'curious cozy adventure',
      render: 'Warm meticulous fantasy manga illustration with naturalist monster detail.',
      key: 'Ryoko Kui naturalism; monster anatomy; dungeon cooking; cozy camps',
      avoid: [
        'a bearded dwarf cook with a cauldron',
        'a short-haired elf mage with a staff',
        'existing franchise characters',
      ],
      briefs: [
        'Crouched beside a dungeon campfire, a scholarly adventurer sketches the anatomy of a giant walking mushroom in her notebook while her companion quietly slices its cap into a bubbling stew pot. No readable text or logo.',
        'Four tired adventurers argue over whether a slime can be dried like fruit, the specimen wobbling indignantly on a drying rack between them. No readable text or logo.',
        'In a quiet dungeon corridor, a neatly labeled row of monster spices hangs drying beside a sleeping iron golem. No readable text or logo.',
      ],
    }),
    au('SP05-252', 'Campfire Cooking in Another World - Amber Dusk Rounded Cel', {
      look: 'MAPPA Campfire Cooking in Another World look (2023): rounded friendly designs, amber dusk campfires, cute familiar beasts and mouth-watering food animation.',
      subject:
        'draw people with soft rounded designs, friendly faces, casual traveler clothes and giant fluffy familiar animals.',
      color: 'Amber dusk orange, stew browns, cozy greens and warm cream.',
      light: 'Warm campfire and dusk light with glossy highlights on food.',
      texture: tv,
      camera: 'Food close-ups, campsite wides and cute beast reactions.',
      mood: 'cozy hungry contentment',
      render: 'Warm cozy fantasy television frame with glossy appetizing food.',
      key: 'Amber campfires; glossy food; rounded designs; fluffy familiars',
      avoid: ['a giant white wolf with a tiny slime', 'existing franchise characters'],
      briefs: [
        'Stirring a sizzling pan of garlic mushrooms over a campfire at dusk, a middle-aged office worker in a borrowed cloak laughs as an enormous fluffy lynx politely waits for the first bite. No readable text or logo.',
        'A dragon the size of a barn sulks at the edge of a campsite until someone hands it a tiny skewer of grilled onions. No readable text or logo.',
        'On a flat rock beside a dying campfire, a single glossy rice ball sits on a leaf under the first evening stars. No readable text or logo.',
      ],
    }),
    au('SP05-257', 'Tsukimichi C2C - Slate Twilight Single-Violet Cel', {
      look: 'C2C Tsukimichi Moonlit Fantasy look (2021): slate twilight palettes with single violet accents, comedic merchant adventure, odd monsters and moonlit wastelands.',
      subject:
        'draw people with light-novel designs, plain mild faces, merchant clothes and strange monster companions.',
      color: 'Slate grey twilight, deep indigo and one glowing violet accent per frame.',
      light: 'Moonlit twilight with a single violet glow source.',
      texture: tv,
      camera: 'Moonlit wasteland wide shots and small comedic merchant scenes around caravans.',
      mood: 'dry moonlit comedy',
      render: 'Moody comedic fantasy television frame with slate twilight.',
      key: 'Slate twilight; single violet accent; merchant comedy; moonlit wastes',
      briefs: [
        'Crossing a slate-grey wasteland under a huge moon, an unassuming traveling merchant leads a caravan of polite giant spiders carrying sacks of flour, one violet lantern swinging at the front. No readable text or logo.',
        'A plain-faced shopkeeper haggles calmly with a nervous dragon over the price of a single violet potion bottle. No readable text or logo.',
        'Under a slate twilight sky, a lone violet flower grows from a crack in an abandoned market stall. No readable text or logo.',
      ],
    }),
    au('SP05-258', 'Handyman Saitou in Another World - Fine-Line Brass Glint Cel', {
      look: 'C2C Handyman Saitou in Another World look (2023): fine clean lines, brass tool glints, gentle party camaraderie and practical craftsman heroics in a fantasy world.',
      subject:
        'draw people with fine-lined designs, a quiet handyman in work clothes with a tool belt, and fantasy adventurers.',
      color: 'Brass gold, workshop brown, forest green and soft blue.',
      light: 'Warm workshop light and small brass glints on tools.',
      texture: tv,
      camera: 'Close-ups of hands fixing things and warm party group shots.',
      mood: 'humble helpful warmth',
      render: 'Gentle fine-line fantasy television frame with brass tool glints.',
      key: 'Handyman craft; brass tools; fine lines; party warmth',
      briefs: [
        'Kneeling beside a cracked magic door in a dungeon corridor, a quiet handyman with a brass toolbox fixes the hinge while an impatient knight, a mage and a thief watch in stunned silence. No readable text or logo.',
        'Squinting through thick glasses in a candlelit workshop, a retired carpenter repairs a knight’s dented helmet with a tiny brass hammer while the knight nervously waits in his underclothes. No readable text or logo.',
        'On a workshop bench at night, a set of brass tools lies neatly arranged beside a half-repaired magic staff. No readable text or logo.',
      ],
    }),
    au('SP05-259', 'Ranking of Kings Wit - Picture-Book Crayon Line Anime', {
      look: 'Wit Studio Ranking of Kings look (2021): picture-book simple designs with thick soft crayon-like lines, pastel storybook castles and emotionally powerful fairy-tale drama.',
      subject:
        'draw people with round simple picture-book designs, thick soft outlines, small bodies and expressive faces.',
      color: 'Soft storybook pastels, sky blue, cream, gentle green and warm red.',
      light: 'Soft storybook daylight with gentle simple shadows and warm pastel skies.',
      texture: 'Thick crayon-like soft outlines and flat pastel color.',
      camera: 'Picture-book storybook compositions and heartfelt close-ups on small brave faces.',
      mood: 'tender storybook courage',
      render:
        'Charming Wit Studio television frame with picture-book softness and emotional weight.',
      key: 'Picture-book designs; crayon lines; pastel castles; tender courage',
      avoid: [
        'a tiny deaf prince with a crown and a shadow companion',
        'existing franchise characters',
      ],
      briefs: [
        'Marching up the stairs of a towering pastel castle, a tiny round-faced baker with a crooked paper crown carries a cake twice his size to the grumpy giant queen at the top. No readable text or logo.',
        'A small shadow creature and a retired court jester share an apple on the castle wall, laughing silently at the sunset. No readable text or logo.',
        'In a soft crayon-drawn storybook meadow, a small paper crown lies forgotten in the grass beside a sleeping lamb and a bouquet of wildflowers. No readable text or logo.',
      ],
    }),
    au('SP05-260', 'Princess Connect CygamesPictures - Candy Pastel Bloom Cel', {
      look: 'CygamesPictures Princess Connect! Re:Dive look (2020): candy pastel fantasy, bloom-heavy glowing highlights, cheerful food-loving parties and bouncy comedy.',
      subject:
        'draw people with cute bright designs, big sparkly eyes, pastel fantasy outfits and hungry cheerful expressions.',
      color: 'Candy pink, mint, lemon, sky blue and glowing white bloom.',
      light: 'Bright bloom-heavy daylight with sparkling highlights on eyes, food and armor.',
      texture: tv,
      camera: 'Bouncy group comedy framing and crowded glowing feast scenes at long tables.',
      mood: 'cheerful hungry adventure',
      render: 'Glowing pastel fantasy television frame with heavy bloom.',
      key: 'Candy pastel; bloom glow; feasts; bouncy comedy',
      briefs: [
        'At a fantasy guild banquet glowing with pastel light, a grandmother adventurer in a lemon-yellow robe stacks her plate with glowing fruit tarts while three younger warriors watch in awe. No readable text or logo.',
        'A hungry knight fights a giant floating pudding monster and keeps taking bites between sword strikes. No readable text or logo.',
        'An empty banquet table glows in the sunset, one untouched strawberry tart sparkling at the center. No readable text or logo.',
      ],
    }),
    au('SP05-091', 'Sword Art Online A-1 - Cyan Crystal-Facet Glow Cel', {
      look: 'A-1 Pictures Sword Art Online look (2012): virtual-reality fantasy with glowing cyan crystal effects, floating castle levels, sleek swordplay and shattering polygon particles.',
      subject:
        'draw people with abec-derived designs, sleek long coats, clean faces and glowing swords.',
      color: 'Cyan crystal glow, night black, white and gold.',
      light: 'Glowing cyan crystal light and bright sword skill trails in dark virtual spaces.',
      texture: tv,
      camera: 'Dynamic sword duels, floating castle wides and shattering particles.',
      mood: 'luminous virtual adventure',
      render: 'Glossy A-1 Pictures frame with crystal VR effects.',
      key: 'VR crystal glow; floating castle; sword skills; polygon shatter',
      avoid: ['a black-coated dual-wielding swordsman', 'existing franchise characters'],
      briefs: [
        'Logging into a floating castle of cyan crystal for the first time, a retired schoolteacher in a clumsy beginner’s tunic swings a practice sword and watches a training dummy shatter into glittering polygons. No readable text or logo.',
        'Two guildmates in their fifties fish from the edge of a floating virtual island, their lines glowing cyan in the void. No readable text or logo.',
        'A single crystal sword stands in a virtual meadow at dusk, slowly dissolving into floating light cubes. No readable text or logo.',
      ],
    }),
    au('SP05-092', 'Re:Zero White Fox - Violet Echo-Line Gothic Cel', {
      look: 'White Fox Re:Zero look (2016): gothic mansion fantasy, violet shadows, time-loop dread, beautiful designs contrasted with horror, and echo-lines of repeated moments.',
      subject:
        'draw people with Shinichirou Otsuka-derived designs, gothic maid and noble outfits, big expressive eyes and anguished moments.',
      color: 'Violet shadows, gothic black, silver and blood crimson.',
      light: 'Moody mansion light, violet glows and eerie night.',
      texture: tv,
      camera: 'Faint echo-lines of repeated moments and claustrophobic shots of mansion corridors.',
      mood: 'gothic looping dread',
      render: 'Moody White Fox frame with gothic violet horror.',
      key: 'Time-loop dread; violet gothic; mansion; echo lines',
      avoid: [
        'twin maids with blue and pink hair',
        'a silver-haired half-elf in white',
        'existing franchise characters',
      ],
      briefs: [
        'Waking once again in the same gothic mansion bedroom, a tired middle-aged clerk sees faint violet echo-lines of himself repeating the same morning around the room. No readable text or logo.',
        'A butler serves tea at a long table as violet ghost images of dozens of earlier dinners flicker at every seat. No readable text or logo.',
        'A pocket watch lies open on a gothic nightstand, its hands spinning backward under violet moonlight. No readable text or logo.',
      ],
    }),
    au('SP05-093', 'Mushoku Tensei Studio Bind - Sepia Moss Dry-Brush Cel', {
      look: 'Studio Bind Mushoku Tensei look (2021): richly painted grounded fantasy, sepia and moss tones, detailed life across seasons and meticulous everyday animation.',
      subject:
        'draw people with grounded fantasy designs, practical traveling clothes, detailed hair and natural gestures.',
      color: 'Sepia, moss green, earth brown and soft sky blue.',
      light: 'Natural seasonal light across fields and warm hearth glow inside cottages.',
      texture: 'Painterly dry-brush backgrounds with detailed cel animation of everyday gestures.',
      camera: 'Long journeys through sweeping landscapes and intimate everyday moments indoors.',
      mood: 'grounded coming-of-age journey',
      render: 'Rich Studio Bind frame with painterly grounded fantasy.',
      key: 'Studio Bind painterly; sepia and moss; grounded fantasy; seasons',
      briefs: [
        'Teaching her first magic lesson in a mossy village schoolhouse, a gray-haired wandering mage patiently guides a farmer’s hands as a tiny stream of water rises from a wooden bucket. No readable text or logo.',
        'Three travelers share a thin blanket in a rainy barn, the painted fields outside glowing sepia in the storm light. No readable text or logo.',
        'A worn traveling staff leans against a mossy milestone on an empty country road at dawn. No readable text or logo.',
      ],
    }),
    au('SP05-094', 'Konosuba Deen - Springy Comic-Timing Cel', {
      look: 'Studio Deen Konosuba look (2016): deliberately wobbly off-model comedy, springy slapstick timing, useless heroes and bright cheap fantasy villages.',
      subject:
        'draw people with light comedic designs, exaggerated goofy faces, off-model reactions and fantasy adventurer costumes.',
      color: 'Bright cheap fantasy greens, sky blue and sunny yellow.',
      light: 'Simple bright village daylight and big cartoon explosion flashes with smoke.',
      texture: tv,
      camera: 'Comedic timing shots, reaction close-ups and explosion wides.',
      mood: 'chaotic useless comedy',
      render: 'Loose springy comedy television frame with off-model energy.',
      key: 'Springy slapstick; off-model faces; useless heroes; explosions',
      avoid: [
        'a blue-haired water goddess',
        'an explosion mage with an eyepatch and red hat',
        'existing franchise characters',
      ],
      briefs: [
        'Proudly announcing her ultimate spell to a crowd of villagers, a retired court wizard accidentally blows up her own house and collapses face-first into a haystack, still smiling. No readable text or logo.',
        'A party of adventurers flees across a cabbage field from a swarm of flying cabbages, one knight happily volunteering to be hit. No readable text or logo.',
        'On a sticky tavern table in a cheap fantasy village, a pile of unpaid guild bills surrounds one half-eaten frog leg and a spilled mug. No readable text or logo.',
      ],
    }),
    au('SP05-098', 'Slime Isekai 8bit - Rounded Sky-Blue Friendly Cel', {
      look: 'Eight Bit That Time I Got Reincarnated as a Slime look (2018): friendly rounded monster nation fantasy, sky-blue brightness, diverse monster citizens and cheerful town building.',
      subject:
        'draw people and monsters with friendly rounded designs, bright costumes and cheerful expressions.',
      color: 'Sky blue, grass green, sunny yellow and warm wood tones.',
      light: 'Bright friendly daylight with gentle magical glows around monster citizens.',
      texture: tv,
      camera: 'Town-building wide shots with scaffolding and friendly crowded group shots.',
      mood: 'friendly building optimism',
      render: 'Bright friendly fantasy television frame with cheerful monster crowds.',
      key: 'Monster nation; sky blue; friendly rounded designs; town building',
      avoid: ['a round blue slime with a smiling face', 'existing franchise characters'],
      briefs: [
        'Building a new town square together under a bright sky-blue morning, goblin carpenters, lizard masons and a retired human engineer cheer as the last beam of a clock tower slides into place. No readable text or logo.',
        'A giant friendly ogre chef serves soup to a line of tiny forest spirits in a busy monster-town market. No readable text or logo.',
        'A small wooden signpost stands at the edge of a new monster town, a flower crown hanging from its top. No readable text or logo.',
      ],
    }),
    au('SP05-100', 'DanMachi J.C.Staff - Vertical Mineral Amber Cel', {
      look: 'J.C.Staff DanMachi look (2015): a vertical labyrinth dungeon under a bustling city, amber lantern light, mineral crystals, adventurer familia and rising-hero energy.',
      subject:
        'draw people with Suzuhito Yasuda-derived designs, light armor, white hair or bright hair, and determined adventurer faces.',
      color: 'Amber lantern light, mineral teal, deep stone and gold.',
      light: 'Lantern light in deep dungeon shafts and crystal glows.',
      texture: tv,
      camera: 'Tall vertical dungeon shafts, tiny climbing figures and heroic upward ascents.',
      mood: 'aspiring vertical adventure',
      render: 'Warm J.C.Staff television frame with vertical dungeon scale and lantern glow.',
      key: 'Vertical dungeon; amber lanterns; mineral crystals; rising heroes',
      avoid: [
        'a small goddess with a blue ribbon under her arms',
        'a white-haired rookie with red eyes',
        'existing franchise characters',
      ],
      briefs: [
        'Climbing a vertical dungeon shaft lit by amber lanterns, a middle-aged adventurer hauls a sack of glowing mineral crystals toward the tiny circle of daylight far above. No readable text or logo.',
        'A goddess of a small bakery familia bandages an adventurer’s arm while her bread burns in the oven. No readable text or logo.',
        'Deep in a silent crystal dungeon, a single amber lantern hangs from a glowing mineral outcrop above a rope that disappears into darkness. No readable text or logo.',
      ],
    }),
    au('SP05-241', 'Log Horizon Satelight - Systemic Cooperation Grid Style', {
      look: 'Satelight Log Horizon look (2013): strategic MMO fantasy with guild politics, overgrown ruined Tokyo, cooperative planning scenes and tactical overlays without text.',
      subject:
        'draw people with Kazuhiro Hara-derived designs, glasses-wearing strategists, guild adventurers and townspeople.',
      color: 'Overgrown green, ruined concrete grey, guild gold and sky blue.',
      light: 'Soft daylight through ruins and warm guild-hall light.',
      texture: tv,
      camera: 'Round-table strategy meeting compositions and overgrown ruined-city wide shots.',
      mood: 'thoughtful cooperative strategy',
      render: 'Clear Satelight television frame with strategic group compositions and ruins.',
      key: 'Guild strategy; overgrown Tokyo; cooperation; tactical planning',
      briefs: [
        'Around a huge round table in an overgrown ruined office tower, a bespectacled strategist in a long coat moves carved wooden pieces representing every guild while vines creep through the broken windows. No readable text or logo.',
        'A guild of cooks and tailors plans a festival on a rooftop garden above a moss-covered city. No readable text or logo.',
        'Above an empty overgrown avenue, a ruined highway sign is completely wrapped in flowering vines, with a family of birds nesting in its frame. No readable text or logo.',
      ],
    }),
    au('SP05-242', 'Grimgar A-1 - Smoke-Mud Vulnerability Style', {
      look: 'A-1 Pictures Grimgar look (2016): watercolor-like painted backgrounds, muddy low-level adventurers, vulnerability and grief, and soft pastel mornings after brutal fights.',
      subject:
        'draw people with soft realistic designs, muddy cheap gear, exhausted faces and fragile gestures.',
      color: 'Watercolor pastels, mud brown, smoky grey and soft morning pink.',
      light: 'Soft watercolor dawn light and smoky dusk after exhausting fights.',
      texture: 'Watercolor-textured painted backgrounds with soft cel characters and mud.',
      camera: 'Quiet montage moments of daily life and clumsy desperate fights.',
      mood: 'fragile muddy vulnerability',
      render: 'Soft watercolor A-1 Pictures frame with fragile emotional realism.',
      key: 'Grimgar watercolor; muddy adventurers; vulnerability; soft dawn',
      briefs: [
        'After a clumsy fight with a single goblin, a muddy band of beginner adventurers in cheap patched gear sits by a smoky campfire at dawn, silently passing around one bruised apple. No readable text or logo.',
        'A novice priest washes her only shirt in a stream, soft watercolor light around her tired shoulders. No readable text or logo.',
        'In a muddy field under a pale pastel morning sky, a broken wooden practice sword lies beside a worn boot and a trampled flower. No readable text or logo.',
      ],
    }),
    au('SP05-243', 'Record of Lodoss War OVA - Classic OVA Quest Tapestry Style', {
      look: 'Madhouse Record of Lodoss War OVA look (1990) with Nobuteru Yuki designs: classic tabletop high fantasy, detailed armor, elves and dwarves, painterly castles and tapestry-like grandeur.',
      subject:
        'draw people with Nobuteru Yuki designs, elegant elves, sturdy dwarves, detailed plate armor and flowing cloaks.',
      color: 'Forest green, royal blue, gold, steel and warm tapestry reds.',
      light: 'Soft painterly fantasy light over forests and dramatic dusk on castles.',
      texture: 'Hand-painted cel with painterly castle and forest backgrounds.',
      camera: 'Classic heroic party compositions and grand painted fantasy vistas.',
      mood: 'classic heroic quest',
      render: 'Rich 1990 Madhouse OVA frame with tapestry-like fantasy grandeur.',
      key: 'Lodoss classic fantasy; Nobuteru Yuki elves; detailed armor; tapestry',
      avoid: ['a blonde elf in a green tunic with a circlet', 'existing franchise characters'],
      briefs: [
        'Crossing a stone bridge toward a painted mountain fortress, a weathered dwarf, a dignified elf archer and an aging knight in detailed plate armor pause to watch a dragon circle the peaks. No readable text or logo.',
        'An elf and a dwarf argue over the correct way to light a campfire in a rainy forest. No readable text or logo.',
        'In an empty stone throne hall, a tattered royal banner hangs crookedly while dusk light falls through tall windows across the thick dust. No readable text or logo.',
      ],
    }),
    au('SP05-244', 'Akihiro Yamada - Tall Textile-Rhythm Formal Cel', {
      look: 'Akihiro Yamada Twelve Kingdoms illustration look: tall elegant East Asian fantasy figures, rhythmic flowing textiles, formal court compositions and refined painterly color.',
      subject:
        'draw people with Yamada designs, tall slender figures, long flowing robes with rhythmic folds and serene faces.',
      color: 'Deep teal, vermilion, gold and jade with muted ink tones.',
      light: 'Soft formal court light and misty mountain glow.',
      texture: 'Refined fine line with painterly textile patterns and rhythmic robe folds.',
      camera: 'Formal court compositions and tall vertical figure framing.',
      mood: 'dignified solemn destiny',
      render: 'Refined painterly fantasy illustration look with courtly elegance.',
      key: 'Akihiro Yamada textiles; tall figures; court formality; jade and vermilion',
      briefs: [
        'Standing in a vast jade throne hall, a newly chosen queen who was once a farmer lets her long vermilion robes spill down the steps as rows of ministers bow in perfect rhythmic lines. No readable text or logo.',
        'A tall mythical unicorn in human form waits under a misty pine for a ruler who has not arrived yet. No readable text or logo.',
        'On a silk cushion in a silent jade court at dawn, an empty imperial seal waits beside a folded robe and a single burning incense stick. No readable text or logo.',
      ],
    }),
    au('SP05-245', 'Nobuteru Yuki Escaflowne - Carmine Angular Windswept Cel', {
      look: 'Sunrise The Vision of Escaflowne look (1996) with Nobuteru Yuki designs: windswept medieval sky fantasy, carmine accents, angular elegant faces with long noses and armored guymelefs.',
      subject:
        'draw people with Yuki designs, long pointed noses, slender angular faces, windswept hair and medieval-fantasy clothes.',
      color: 'Carmine red, sky blue, earth tones and armor silver.',
      light: 'Bright windswept sky light, fast clouds and dramatic sunsets over cliffs.',
      texture: 'Late analog cel with painted sky fantasy backgrounds.',
      camera: 'Windswept cliff-edge compositions and soaring shots of airships and fortresses.',
      mood: 'windswept destined romance',
      render: 'Classic 1996 Sunrise television frame with windswept sky fantasy.',
      key: 'Nobuteru Yuki designs; windswept fantasy; carmine accents; long noses',
      briefs: [
        'Standing on a windswept cliff above a floating fortress, a fortune-teller in a carmine scarf holds a spread of hand-painted cards as her hair and cloak whip in the gale. No readable text or logo.',
        'An armored knight and a farm girl share bread on a hill while a huge airship drifts past the moons. No readable text or logo.',
        'Spinning high in the wind above a green valley at sunset, a single carmine feather drifts past the silhouette of a distant airship. No readable text or logo.',
      ],
    }),
    au('SP05-246', 'Shinobu Ohtaka - Jewel Arabesque Curve Cel', {
      look: 'Shinobu Ohtaka Magi look: Arabian Nights fantasy, jeweled palaces, flowing arabesque curves, desert markets, djinn magic and bright adventurous designs.',
      subject:
        'draw people with Ohtaka designs, big lively eyes, braided hair, flowing desert robes and jewelry.',
      color: 'Jewel turquoise, gold, desert sand and royal purple.',
      light: 'Bright desert sun on domes and glowing turquoise djinn magic.',
      texture: tv,
      camera: 'Palace and bazaar wide shots framed by ornate arabesque arches.',
      mood: 'jeweled desert adventure',
      render: 'Bright Arabian Nights fantasy frame with jeweled arabesque curves.',
      key: 'Magi arabesques; jewel palaces; desert markets; djinn magic',
      avoid: ['a braided boy with a flute and a blue djinn', 'existing franchise characters'],
      briefs: [
        'Riding a flying carpet over a turquoise-domed desert city, an elderly spice merchant in jeweled robes throws handfuls of saffron that swirl into glowing arabesque patterns above the market. No readable text or logo.',
        'In a crowded bazaar full of hanging lanterns, a giant friendly blue djinn helps a tired water seller balance a tower of clay jars on her head. No readable text or logo.',
        'In a moonlit palace courtyard lined with arabesque arches, an empty golden lamp rests on a silk cushion beside a quiet fountain. No readable text or logo.',
      ],
    }),
    au('SP05-249', 'Ascendance of a Bookworm Ajia-do - Indigo Block-Print Cel', {
      look: 'Ajia-do Ascendance of a Bookworm look (2019): gentle medieval town life, indigo block-print patterns, handmade paper and books, warm homely fantasy.',
      subject:
        'draw people with soft gentle designs, simple medieval townsfolk clothes and warm expressions.',
      color: 'Indigo dye, parchment cream, warm wood brown and soft sage green.',
      light: 'Warm homely window light and soft candlelight in small workshops.',
      texture: 'Soft cel with woodblock print patterns and paper textures.',
      camera: 'Cozy workshop compositions at workbenches and busy medieval town streets.',
      mood: 'devoted homely craft',
      render: 'Gentle homely fantasy television frame with indigo block-print texture.',
      key: 'Indigo block prints; handmade books; medieval town; warmth',
      briefs: [
        'Pressing her first hand-carved wooden block onto rough homemade paper, a determined elderly seamstress in a medieval workshop gasps as an indigo flower pattern appears perfectly on the sheet. No readable text or logo.',
        'A merchant and a priest argue over the price of a single handmade picture book in a candlelit shop. No readable text or logo.',
        'Across a quiet attic lit by one candle, a long string of freshly printed indigo pages dries slowly above a cluttered wooden press. No readable text or logo.',
      ],
    }),
    au('SP05-250', 'The Faraway Paladin - Grounded Matte Geometry Cel', {
      look: 'Children’s Playground Entertainment The Faraway Paladin look (2021): grounded matte fantasy, undead mentors, ruined temples, calm devotion and solid geometric compositions.',
      subject:
        'draw people with grounded fantasy designs, simple armor, calm devout faces and undead with gentle personalities.',
      color: 'Matte stone grey, earth brown, pale gold and forest green.',
      light: 'Matte soft light in ruins and warm temple glow.',
      texture: tv,
      camera: 'Solid geometric temple compositions and quiet training scenes.',
      mood: 'quiet devout growth',
      render: 'Grounded matte fantasy television frame with solid calm composition.',
      key: 'Matte grounded fantasy; undead mentors; ruined temples; devotion',
      briefs: [
        'In a ruined stone temple, a gentle skeleton knight and a ghostly old priest teach a grown apprentice how to hold a sword with the same care as a prayer book. No readable text or logo.',
        'By the crackling fire of a ruined temple, a gentle mummy grandmother knits a long woolen scarf while her grown apprentice sleeps under a borrowed cloak. No readable text or logo.',
        'On a cracked stone altar inside a moss-covered ruined temple, a single fresh loaf of bread sits in a beam of morning light. No readable text or logo.',
      ],
    }),
    au('SP05-253', 'Saint’s Magic Power Diomedea - Glass-Green High-Key Herbarium Cel', {
      look: 'Diomedea The Saint’s Magic Power Is Omnipotent look (2021): high-key glass-green herb gardens, gentle court romance, potion workshops and soft sparkling light.',
      subject:
        'draw people with gentle romance designs, long dark hair, researcher robes and knightly uniforms.',
      color: 'Glass green, herb mint, white and soft gold.',
      light: 'High-key bright greenhouse light through glass and gentle sparkles on leaves.',
      texture: tv,
      camera: 'Greenhouse and potion workshop compositions with gentle romantic two-shots.',
      mood: 'gentle herbal romance',
      render: 'Bright high-key fantasy television frame with herbarium sparkle and glass.',
      key: 'Glass-green greenhouse; herb potions; gentle romance; high key',
      briefs: [
        'Surrounded by glass shelves of glowing herbs in a sunlit royal greenhouse, a tired office worker turned healer brews a mint potion that sparkles so brightly the knights outside the window squint. No readable text or logo.',
        'In a sunlit palace corridor, a shy royal librarian tries to thank a potion maker with a bouquet of herbs she grew herself, blushing to the ears. No readable text or logo.',
        'On a sunny greenhouse windowsill crowded with drying herbs, a single glass vial of green potion glows softly as a bee circles it curiously. No readable text or logo.',
      ],
    }),
    au('SP05-254', 'Yuu Watase - Lavender Halo-Arc Shoujo Cel', {
      look: 'Yuu Watase Fushigi Yuugi look: nineties shojo fantasy, ancient Chinese-inspired kingdoms, celestial warriors, sparkling eyes, flowing hair and lavender halos.',
      subject:
        'draw people with Watase designs, big sparkling eyes, long flowing hair and ancient robes.',
      color: 'Lavender, rose pink, celestial gold and deep crimson robes.',
      light: 'Soft halo glows around heads and celestial light from constellations.',
      texture: 'Nineties shojo cel with sparkles, halos and floating petals.',
      camera: 'Romantic sparkling close-ups and celestial wide shots of ancient palaces.',
      mood: 'dreamy celestial devotion',
      render: 'Classic nineties shojo fantasy television frame with dreamy glow.',
      key: 'Yuu Watase shojo; celestial warriors; lavender halos; sparkles',
      briefs: [
        'Falling through the pages of an ancient book into a lavender sky, a librarian in her forties is caught by seven celestial warriors whose constellations glow around their halos. No readable text or logo.',
        'A shrine warrior and a scholar share a quiet moonlit walk in an ancient palace garden. No readable text or logo.',
        'An old red-bound book lies open on a library floor, lavender light rising from its pages. No readable text or logo.',
      ],
    }),
    au('SP05-255', 'Magic Knight Rayearth TMS - Gem-Facet Rising-Line Cel', {
      look: 'TMS Magic Knight Rayearth anime look (1994): CLAMP designs in bright nineties cel, gem-faceted magic armor, fantasy world of floating islands and rising speed lines.',
      subject:
        'draw people with CLAMP nineties designs, long legs, big eyes, flowing hair and gem-studded armor.',
      color: 'Ruby red, sapphire blue, emerald green and gold.',
      light: 'Gem sparkle light on armor and a bright fantasy sky with floating islands.',
      texture: 'Nineties cel with faceted gem highlights and bright clean shading.',
      camera: 'Rising speed-line action poses and floating island wide shots.',
      mood: 'bright heroic wonder',
      render: 'Bright 1994 TMS television frame with gem sparkle and heroic energy.',
      key: 'Rayearth gem armor; CLAMP nineties; floating islands; speed lines',
      avoid: [
        'three schoolgirls in red, blue and green magic armor',
        'existing franchise characters',
      ],
      briefs: [
        'Leaping between floating islands in armor studded with ruby facets, a retired firefighter summoned to a fantasy world raises a glowing sword as rising speed lines blaze behind her. No readable text or logo.',
        'On a tiny floating island above the clouds, a gem-armored postwoman shares a picnic lunch with a fluffy round floating creature that keeps stealing her grapes. No readable text or logo.',
        'At the bottom of a clear fantasy spring surrounded by ferns, a single emerald gem glows while tiny silver fish circle it slowly. No readable text or logo.',
      ],
    }),
    au('SP05-096', 'No Game No Life Madhouse - Hyper-Saturated Impossible Perspective Cel', {
      look: 'Madhouse No Game No Life look (2014): hyper-saturated neon-pastel fantasy, impossible perspective worlds, giant chess pieces and gamer siblings with glowing edges.',
      subject:
        'draw people with Yuu Kamiya-derived designs, glowing edges, vivid hair colors and casual gamer outfits.',
      color: 'Hyper-saturated magenta, cyan, gold and violet with neon pastel skies.',
      light: 'Glowing neon rim light outlining every figure and object against vivid skies.',
      texture: tv,
      camera: 'Impossible perspective wide shots with floating chess boards and tilted worlds.',
      mood: 'giddy strategic wonder',
      render: 'Hyper-saturated Madhouse television frame with impossible fantasy worlds.',
      key: 'Hyper-saturation; impossible perspective; giant chess; glowing edges',
      avoid: [
        'a hoodie-wearing gamer brother with a long-haired little sister',
        'existing franchise characters',
      ],
      briefs: [
        'Standing on a floating chessboard above a hyper-saturated sky of magenta and cyan, two retired accountants challenge a god to a game of cards as whole continents rotate impossibly below. No readable text or logo.',
        'On a giant glowing chessboard floating in a neon sky, an enormous chess knight bows respectfully to the tiny grandmother who has just beaten it. No readable text or logo.',
        'Above an impossible staircase that twists back on itself at sunset, a single glowing die floats and slowly turns to show a new number. No readable text or logo.',
      ],
    }),
    au('SP05-251', 'Saga of Tanya the Evil NUT - Khaki Compressed-Diagonal Cel', {
      look: 'NUT Saga of Tanya the Evil look (2017): alternate WWI war fantasy, khaki palettes, aerial war mages, compressed diagonal battle compositions and sinister smiles.',
      subject:
        'draw people with Shinobu Shinotsuki-derived designs, military uniforms, flight goggles and cold calculating faces.',
      color: 'Khaki uniforms, olive fields, grey war skies and orange explosions.',
      light: 'Grey overcast war light broken by orange explosive flashes and tracer glow.',
      texture: tv,
      camera: 'Compressed diagonal aerial battle compositions and muddy trench wide shots.',
      mood: 'cold militaristic menace',
      render: 'Khaki alternate-war fantasy frame with aerial mage battles.',
      key: 'Alternate WWI; khaki; aerial war mages; compressed diagonals',
      avoid: ['a small blonde officer with a sinister smile', 'existing franchise characters'],
      briefs: [
        'Flying in a tight diagonal formation over muddy trenches, a squadron of aerial war mages in khaki greatcoats casts glowing shields as artillery bursts orange behind them. No readable text or logo.',
        'An exhausted staff officer eats rations in a bunker while maps of the front shake on the wall. No readable text or logo.',
        'A pair of flight goggles hangs from a barbed wire fence in the grey morning fog. No readable text or logo.',
      ],
    }),
    au('SP05-097', 'Overlord Madhouse - Ivory-Charcoal Baroque Symmetry Cel', {
      look: 'Madhouse Overlord look (2015): ivory-and-charcoal baroque throne rooms, symmetrical dark lord compositions, loyal monstrous guardians and ornate villainous grandeur.',
      subject:
        'draw people and monsters with ornate designs, skeletal lords in rich robes and elegant monstrous servants.',
      color: 'Ivory marble, charcoal shadows, deep royal purple and ornate gold.',
      light: 'Dramatic throne-room light from high windows and eerie magical glows.',
      texture: tv,
      camera:
        'Perfectly symmetrical throne compositions and grand baroque halls lined with servants.',
      mood: 'ornate villainous grandeur',
      render: 'Grand baroque dark fantasy television frame with villainous ornament.',
      key: 'Baroque throne rooms; symmetry; skeletal lords; loyal guardians',
      avoid: [
        'a skeletal overlord in black robes with a golden staff',
        'existing franchise characters',
      ],
      briefs: [
        'Seated on an ivory throne in perfect symmetry, a skeletal accountant-lord in ornate robes reviews the kingdom’s taxes while monstrous servants wait in two flawless rows. No readable text or logo.',
        'In a grand baroque kitchen, a towering insect warrior in ornate armor carefully polishes a single porcelain teacup for its master’s evening tea. No readable text or logo.',
        'In an enormous empty throne hall of ivory and charcoal, a black throne glows under a single beam of cold moonlight. No readable text or logo.',
      ],
    }),
    au('SP05-247', 'Kore Yamazaki - Lilac Thorn-Line Chiaroscuro Cel', {
      look: 'Kore Yamazaki The Ancient Magus’ Bride look: British-folklore fantasy, gentle thorn-line ornament, fae creatures, lilac and moss palettes and tender chiaroscuro.',
      subject:
        'draw people with Yamazaki designs, gentle faces, red or dark hair, cottage clothes and uncanny fae beings.',
      color: 'Lilac, moss green, bone white and soft crimson.',
      light: 'Soft chiaroscuro inside cozy cottages and in misty forest glades.',
      texture: 'Fine thorn-line ornament framing figures and soft painterly color.',
      camera: 'Cottage garden and forest compositions filled with small fae creatures.',
      mood: 'tender uncanny enchantment',
      render:
        'Tender British-folklore fantasy illustration with uncanny gentleness and thorny ornament.',
      key: 'Kore Yamazaki folklore; thorn lines; fae beings; lilac and moss',
      avoid: [
        'a tall figure with an animal skull head',
        'a red-haired girl in a cloak',
        'existing franchise characters',
      ],
      briefs: [
        'In a thorn-wrapped English cottage garden, a retired schoolteacher bargains politely with a fae creature made of brambles and moth wings for the return of her lost reading glasses. No readable text or logo.',
        'Beside a misty pond at dawn, a small mossy bog spirit shares a pot of tea with an old herbalist wrapped in a knitted shawl. No readable text or logo.',
        'At dusk in an empty English cottage, a thorny wild rose has grown through the broken window and blooms above the dusty kitchen table. No readable text or logo.',
      ],
    }),
    au('SP05-256', 'Rumiko Takahashi Inuyasha - Vermilion Indigo Tapered-Ink Cel', {
      look: 'Rumiko Takahashi Inuyasha look: Sengoku-era feudal Japan, tapered ink lines, vermilion and indigo palettes, demons, shrines and time-slip adventure.',
      subject:
        'draw people with Takahashi designs, round faces, big simple eyes, kimono, armor and demon features.',
      color: 'Vermilion robes, indigo night, forest green and earthy brown.',
      light: 'Natural feudal forest light through trees and eerie demonic glows.',
      texture: 'Tapered brush-like ink lines and clean flat cel color.',
      camera: 'Feudal forest adventure framing and quiet shrine compositions.',
      mood: 'feudal adventurous romance',
      render: 'Classic feudal fantasy television frame with tapered ink lines.',
      key: 'Rumiko Takahashi feudal; vermilion and indigo; demons; shrines',
      avoid: ['a silver-haired dog-eared half demon in red robes', 'existing franchise characters'],
      briefs: [
        'Climbing out of an old shrine well into a feudal forest, a modern pharmacist with her bag of medicine meets a vermilion-robed fox demon who is suspiciously interested in her aspirin. No readable text or logo.',
        'Beside a burned-out feudal village, a traveling monk and a stern demon slayer argue loudly over who gets the last rice ball in the lunch box. No readable text or logo.',
        'An old shrine well sits under a sacred tree, a faint glow coming from its depths. No readable text or logo.',
      ],
    }),
  ]),
};

export default spec;
