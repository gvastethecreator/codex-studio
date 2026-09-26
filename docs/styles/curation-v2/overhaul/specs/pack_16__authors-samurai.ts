import type { Spec } from '../tools/apply';
import { au } from './_authors';

// Samurai and medieval, author pass: these presets had no source work, so each one takes the
// creator whose hand best fits its theme and states the concrete marks of that hand.
const spec: Spec = {
  pack: 'pack_16',
  category: '6. Samurai & Medieval',
  updates: Object.fromEntries([
    au('SP13-026', 'Goseki Kojima - Pre-Strike Stillness', {
      look: 'Goseki Kojima gekiga as in Lone Wolf and Cub: bold wet brush ink, vast empty white space, weathered samurai faces and the frozen breath before a single deadly strike.',
      subject:
        'draw people with gekiga realism, lean hard bodies, weathered faces, simple kimono and hakama, and total stillness before motion.',
      color: 'Black sumi brush ink on white paper with grey wash and no other color.',
      light:
        'Light made by the untouched paper, shadows as heavy wet brush masses and dry-brush edges.',
      texture: 'Wet and dry brush strokes, splattered ink, grey wash tones and rough paper grain.',
      camera:
        'Wide empty compositions with tiny opposed figures, then abrupt extreme close-ups of eyes and hands.',
      mood: 'deadly suspended stillness',
      render: 'Masterful gekiga brush illustration with cinematic silence and restraint.',
      key: 'Goseki Kojima brush ink; empty white space; gekiga realism; pre-strike stillness',
    }),
    au('SP13-027', 'Kouta Hirano - Crimson Formation Charge', {
      look: 'Kouta Hirano manga look as in Drifters: savage black ink masses, manic grinning warriors, crowded battle charges, spiky speed lines and blood-red accents on grey tone.',
      subject:
        'draw people with Hirano designs, lean ferocious warriors, wide manic grins, wild eyes, flowing hair and heavy period armor.',
      color: 'Black ink and grey tone with a single savage crimson accent across the charge.',
      light:
        'Harsh contrast where huge black shadow shapes swallow faces and armor edges glint white.',
      texture: 'Heavy ink fills, scratchy speed lines, screentone gradients and ink splatter.',
      camera:
        'Charging masses rushing toward the lens, extreme low angles and wide battlefield spreads.',
      mood: 'savage exhilarated fury',
      render: 'Bold aggressive manga illustration with dense black masses and kinetic energy.',
      key: 'Kouta Hirano black masses; manic grins; massed charges; crimson accents',
    }),
    au('SP13-028', 'Kaoru Mori - Heraldic Oath', {
      look: "Kaoru Mori manga look as in A Bride's Story: obsessively detailed costumes, embroidery, carved wood and textile ornament, gentle realistic faces and devoted quiet ceremony.",
      subject:
        'draw people with Mori realism, gentle faces, detailed hair and layered costumes where every embroidered pattern is drawn.',
      color: 'Black ink with fine grey tone, or soft muted watercolor for color pages.',
      light: 'Soft natural light rendered by careful hatching and tone, gentle glow on ornament.',
      texture: 'Meticulous pen line, embroidery patterns, carved ornament and fine hatching.',
      camera: 'Calm symmetrical ceremonial compositions and loving close-ups of ornamented detail.',
      mood: 'devoted quiet solemnity',
      render: 'Meticulous ornamental manga illustration with extraordinary costume detail.',
      key: 'Kaoru Mori ornament; embroidery detail; gentle realism; ceremonial calm',
    }),
    au('SP13-029', 'Tetsuo Hara Keiji - Siege Breach Ember', {
      look: 'Tetsuo Hara samurai manga look as in Keiji: towering warlords, hatched muscular anatomy, flamboyant armor and banners, and grand explosive siege scenes with flying embers.',
      subject:
        'draw people with Hara anatomy, massive muscles, heroic jaws, flamboyant kabuki-like armor and wild hair.',
      color: 'Ink black with fire orange, ember red and smoke grey accents.',
      light: 'Firelight from burning gates, embers and dramatic rim light on muscles.',
      texture: 'Dense hatching, bold ink contour, smoke brush and ember flecks.',
      camera: 'Heroic low angles, gate-breach wides and warlords towering over armies.',
      mood: 'thunderous heroic fury',
      render: 'Powerful hatched samurai manga illustration with grand siege scale.',
      key: 'Tetsuo Hara warlords; hatched anatomy; burning gates; embers',
    }),
    au('SP13-030', 'Kazuo Kamimura - Moonlit Ascetic Training', {
      look: 'Kazuo Kamimura lyrical gekiga as in Lady Snowblood: elegant sinuous brush line, snow and moonlight, beautiful solemn faces and poetic seasonal stillness.',
      subject:
        'draw people with Kamimura elegance, slender bodies, long necks, solemn beautiful faces and flowing robes.',
      color: 'Black brush ink on white with pale grey wash and moon-white space.',
      light:
        'Moonlight on snow expressed by white paper, soft wash shadows and sharp black accents.',
      texture: 'Sinuous brush line, soft washes, snow flecks and paper grain.',
      camera: 'Poetic seasonal compositions, figures framed by snow, moon and branches.',
      mood: 'lyrical solitary discipline',
      render: 'Elegant lyrical gekiga illustration with poetic negative space.',
      key: 'Kazuo Kamimura line; snow and moon; solemn elegance; poetic stillness',
    }),
    au('SP13-071', 'Takashi Okazaki - Ink-Splatter Swordplay', {
      look: 'Takashi Okazaki look as in Afro Samurai: stark black and white graphics with blood-red accents, hip-hop samurai cool, huge ink splatters and slashing silhouettes.',
      subject:
        'draw people with Okazaki designs, lanky cool figures, sharp silhouettes, stylish mixed period and street clothing.',
      color: 'Pure black, stark white and a single red accent color.',
      light: 'Graphic high contrast with silhouettes and white slash lines of light.',
      texture: 'Ink splatter, dry brush, gritty grain and graphic slash marks.',
      camera: 'Dramatic silhouette poses, slashing diagonals and wide stark landscapes.',
      mood: 'stoic stylish violence',
      render: 'Stark graphic ink illustration with hip-hop samurai cool.',
      key: 'Takashi Okazaki black-white-red; ink splatter; silhouettes; slashing diagonals',
    }),
    au('SP13-072', 'Mononoke 2007 - Woodblock Palette Period', {
      look: 'Toei Mononoke television look (2007) by Kenji Nakamura: washi paper texture over every frame, ukiyo-e flat colors, sliding screen panels and psychedelic Edo patterns.',
      subject:
        'draw people with flat ukiyo-e inspired designs, painted face markings, patterned kimono and stylized poses.',
      color: 'Faded woodblock palette of vermilion, indigo, ochre, teal and gold on beige paper.',
      light: 'Flat woodblock light with no gradients, only pattern and paper texture.',
      texture: 'Washi paper grain over all surfaces, flat woodblock color and pattern fills.',
      camera: 'Sliding screen framing, flat theatrical staging and abrupt pattern cuts.',
      mood: 'eerie ornate mystery',
      render: 'Striking flat-textured Toei frame that looks printed on washi.',
      key: 'Mononoke washi texture; ukiyo-e color; sliding screens; Edo patterns',
    }),
    au('SP13-073', 'Sword of the Stranger - Rain Duel Slow-Motion', {
      look: 'BONES Sword of the Stranger feature look (2007): exceptional hand-drawn sword choreography, realistic period designs, rain, dust and weighty slow-motion clashes.',
      subject:
        'draw people with realistic lean designs, weathered faces, practical period clothes and accurate sword stances.',
      color: 'Muted rain grey, earth brown, pine green and pale sky.',
      light: 'Overcast rain light, sparks from clashing blades and wet reflections.',
      texture: 'Precise hand-drawn cel, rain streaks, flying droplets and dust.',
      camera: 'Choreographed duel angles, slow-motion freezes and ground-level tracking.',
      mood: 'tense weighty combat',
      render: 'Masterful 2007 BONES feature frame with precise choreography.',
      key: 'Sword of the Stranger choreography; rain duels; realism; slow motion',
    }),
    au('SP13-074', 'Samurai 7 - Snowfield Last Stand', {
      look: 'Gonzo Samurai 7 television look (2004): the classic seven defenders story reimagined with sci-fi elements, painterly backgrounds, flowing coats and CG mechanical bandits.',
      subject:
        'draw people with lean samurai designs, long flowing coats and hair, weathered faces and distinctive silhouettes.',
      color: 'Snow white, steel grey, rice-field green and bold crimson accents.',
      light: 'Cold overcast light on snow, silhouettes and bright steel glints.',
      texture: 'Digital cel over painterly backgrounds, CG machines and snowfall.',
      camera: 'Line-up compositions of defenders, ridge silhouettes and vast odds.',
      mood: 'resolute doomed courage',
      render: 'Painterly 2004 Gonzo frame with heroic line-up staging.',
      key: 'Samurai 7 defenders; flowing coats; snowfield ridges; heroic line-ups',
    }),
    au('SP13-075', 'Yasuhisa Hara - Grand Siege Panorama', {
      look: 'Yasuhisa Hara Kingdom manga look: epic Warring States battles, oceans of soldiers, towering generals, dense crowd drawing and dramatic sweeping panoramas.',
      subject:
        'draw people with Hara designs, burly generals, fierce faces, flowing capes and ancient Chinese armor.',
      color: 'Black ink with grey tone, dust brown and sunset red in color pages.',
      light: 'Sunset backlight over armies, dust haze and dramatic rim light on generals.',
      texture: 'Dense crowd hatching, speed lines and dust clouds.',
      camera: 'Sweeping panoramas of vast armies and heroic low angles on generals.',
      mood: 'vast epic ambition',
      render: 'Grand historical manga illustration with immense crowd scale.',
      key: 'Yasuhisa Hara armies; epic panoramas; towering generals; dust',
    }),
    au('SP13-076', 'The Apothecary Diaries - Court Intrigue Lacquer', {
      look: 'OLM and TOHO The Apothecary Diaries television look (2023): lavish imperial rear palace, lacquer red and gold, silk robes, hairpins and intimate intrigue lit by lanterns.',
      subject:
        'draw people with elegant modern designs, refined faces, ornate hanfu-style robes and elaborate hair ornaments.',
      color: 'Lacquer red, imperial gold, jade green and night indigo.',
      light: 'Warm lantern light, screen-filtered glow and soft palace shadows.',
      texture: 'Clean digital cel, detailed silk patterns and painted palace architecture.',
      camera: 'Framing through screens and doorways, intimate two-shots and palace wides.',
      mood: 'hushed courtly intrigue',
      render: 'Lavish contemporary palace drama frame with rich ornament.',
      key: 'Apothecary Diaries palace; lacquer red and gold; silk robes; lanterns',
    }),
    au('SP13-077', 'Hiroshi Hirata - Wandering Ronin Western', {
      look: 'Hiroshi Hirata gekiga: heavy dramatic brushwork, grim sweaty samurai, dense calligraphic energy and raw historical violence.',
      subject:
        'draw people with Hirata realism, gaunt hard faces, stubble, sweat, worn kimono and straw hats.',
      color: 'Black ink with grey wash and dusty sepia in color plates.',
      light: 'Harsh noon light with black brush shadows and dust glare.',
      texture: 'Heavy expressive brushwork, calligraphic strokes and dry-brush grit.',
      camera: 'Low wide western-like standoffs in empty streets and gritty sweating close-ups.',
      mood: 'grim dusty tension',
      render: 'Raw powerful gekiga brush illustration with calligraphic force.',
      key: 'Hiroshi Hirata brushwork; grim samurai; dusty standoffs; gekiga',
    }),
    au('SP13-078', 'Moto Hagio - Arthurian Tapestry', {
      look: 'Moto Hagio shojo manga look as in The Poe Clan: romantic European legend, delicate lines, flowers and lace, luminous eyes and melancholy beauty.',
      subject:
        'draw people with Hagio designs, delicate faces, large luminous eyes, flowing hair and romantic period costumes.',
      color: 'Soft pastel watercolor, rose, sage and cream, or black line with tone.',
      light: 'Dreamy diffuse glow, floral light halos and soft shadows.',
      texture: 'Delicate fine lines, floral ornament, lace and screentone.',
      camera: 'Romantic framed compositions wreathed with flowers, vines and decorative borders.',
      mood: 'melancholy romantic legend',
      render: 'Delicate classic 1970s shojo manga illustration with melancholy grace.',
      key: 'Moto Hagio delicacy; European legend; flowers and lace; luminous eyes',
    }),
    au('SP13-079', 'Arslan 1991 - Crusade Desert Glare', {
      look: 'The Heroic Legend of Arslan OVA look (1991) after Yoshitaka Amano concepts: Persian-inspired desert kingdoms, ornate armor, elegant long-haired heroes and glaring desert light.',
      subject:
        'draw people with early-nineties elegant designs, long hair, slender heroes and ornate Persian-inspired armor.',
      color: 'Desert white glare, gold, turquoise and deep sky blue.',
      light: 'Blinding noon glare, heat shimmer and sharp desert shadows.',
      texture: 'Hand-painted cel over detailed painted desert and palace backgrounds, soft grain.',
      camera: 'Marching columns across dunes and heroic silhouettes against the sun.',
      mood: 'weary epic pilgrimage',
      render: 'Elegant early-1990s OVA frame with sweeping desert grandeur and ornate armor.',
      key: 'Arslan OVA; Persian armor; desert glare; elegant heroes',
    }),
    au('SP13-080', 'Makoto Yukimura - Northern Saga Longship', {
      look: 'Makoto Yukimura manga look as in Vinland Saga: realistic Viking-age detail, gritty hatching, raw brutal fights, longships in grey seas and weathered faces.',
      subject:
        'draw people with Yukimura realism, weathered faces, beards, scars and historically accurate Norse clothing.',
      color: 'Grey sea, cold slate and black ink with steel highlights.',
      light: 'Cold overcast northern light with spray and wind.',
      texture: 'Detailed pen hatching, rough seas and wood grain on ships.',
      camera: 'Longship prows in waves, fjord cliffs and gritty close-ups.',
      mood: 'harsh northern epic',
      render: 'Realistic historical manga illustration with rugged weathered detail and cold seas.',
      key: 'Makoto Yukimura realism; longships; grey seas; gritty hatching',
    }),
    au('SP13-081', 'Uoto - Plague Year Chronicle', {
      look: 'Uoto manga look as in Orb: On the Movements of the Earth: clean fine lines, fifteenth-century European towns, inquisitors and scholars, and stark moral dread.',
      subject:
        'draw people with Uoto designs, clean simple faces, sharp eyes, period robes and scholarly tools.',
      color: 'Black ink with fine tone and muted parchment tints.',
      light: 'Candlelight and grey dawn light with stark clear shadows.',
      texture: 'Clean fine pen line, tone and parchment texture.',
      camera: 'Quiet dialogue framings, empty towns and dramatic reveals.',
      mood: 'stark moral dread',
      render: 'Clean fine-line historical manga illustration with quiet unsettling tension.',
      key: 'Uoto clean line; medieval Europe; candlelight; moral dread',
    }),
    au('SP13-082', 'Juu Ayakura - Tournament Pageantry', {
      look: 'Juu Ayakura illustration look as in Spice and Wolf: warm medieval European fairs, merchant towns, soft painterly light and charming detailed characters.',
      subject:
        'draw people with Ayakura designs, warm expressive faces, big soft eyes, travel cloaks and period clothes.',
      color: 'Warm autumn gold, festival reds, cream and sky blue.',
      light: 'Soft warm festival daylight, bright striped awnings and evening lantern glow.',
      texture: 'Painterly soft digital color with clean line art.',
      camera: 'Festive crowd scenes, pavilions and charming character framing.',
      mood: 'warm festive pageantry',
      render: 'Warm painterly light novel illustration look with charming character detail.',
      key: 'Juu Ayakura warmth; medieval fairs; pavilions; festival light',
    }),
    au('SP13-083', 'Basilisk - Shadow Stealth Night', {
      look: 'Gonzo Basilisk television look (2005): dark ninja clan war, moody night palettes, supernatural ninja arts, rooftops, moons and tragic romance.',
      subject:
        'draw people with lean ninja designs, sharp eyes, dark clan outfits and supernatural features.',
      color: 'Midnight blue, black, pale moonlight and blood red.',
      light: 'Thin crescent moonlight, silver rims and deep shadow.',
      texture: 'Moody digital cel over painted night backgrounds of forests, castles and rooftops.',
      camera: 'Rooftop silhouettes, sudden ambush angles and moon framing.',
      mood: 'silent deadly tension',
      render: 'Dark moody 2005 Gonzo frame with night atmosphere.',
      key: 'Basilisk ninja; moonlit rooftops; supernatural arts; dark palette',
    }),
    au('SP13-084', 'Reiko Okano - Onmyoji Talisman Court', {
      look: 'Reiko Okano manga look as in Onmyoji: refined Heian court elegance, flowing robes, delicate line, mystical symbols and dreamlike mystical scenes.',
      subject:
        'draw people with Okano elegance, slender refined figures, serene faces, layered Heian robes and tall caps.',
      color: 'Plum, ink black, gold and pale mist blue.',
      light: 'Soft moonlight, glowing talismans and misty garden light.',
      texture: 'Delicate fine line, flowing robe patterns and mystical diagrams.',
      camera:
        'Elegant garden veranda compositions and circular mystical diagram layouts around figures.',
      mood: 'serene mystical elegance',
      render: 'Refined elegant manga illustration with mystical detail and flowing court grace.',
      key: 'Reiko Okano elegance; Heian court; talismans; flowing robes',
    }),
    au('SP13-085', 'Katanagatari - Swordsmith Forge Craft', {
      look: 'White Fox Katanagatari television look (2010) with take designs: flat graphic shapes, bold color blocks, stylized swords, simple geometric figures and pattern-heavy costumes.',
      subject:
        'draw people with take designs, simple flat faces, geometric bodies and bold patterned costumes.',
      color: 'Flat bold color blocks: vermilion, teal, white and black.',
      light: 'Flat graphic lighting with little or no gradient.',
      texture: 'Flat color shapes, clean lines and pattern fills.',
      camera:
        'Stylized flat compositions, frontal poses and graphic displays of distinctive swords.',
      mood: 'graphic crafted poise',
      render: 'Flat graphic 2010 White Fox frame with bold pattern-driven design clarity.',
      key: 'Katanagatari flat graphics; take designs; patterned costumes; stylized swords',
    }),
  ]),
};

export default spec;
