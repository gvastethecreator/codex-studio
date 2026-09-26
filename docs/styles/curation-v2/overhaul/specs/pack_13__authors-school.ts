import type { Spec } from '../tools/apply';
import { au } from './_authors';

// Slice of life, school and music, author pass: these presets had no source work, so each one takes
// the creator or series whose hand best fits its theme. Existing briefs stay; they are original.
const tv =
  'Contemporary digital television cel with clean outlines, soft gradient highlights and detailed painted backgrounds.';
const cel90 =
  'Late analog hand-painted cel over painted backgrounds, with soft film grain and gentle cel edge softness.';

const spec: Spec = {
  pack: 'pack_13',
  category: '2. Slice Of Life, School And Music',
  updates: Object.fromEntries([
    au('SP13-003', 'Arina Tanemura - Soft Shojo Spring', {
      look: 'Arina Tanemura shojo manga look: enormous sparkling eyes with many highlights, flowing ribbon-like hair, floral frames, lace and dreamy pastel romance.',
      subject:
        'draw people with Tanemura designs, huge sparkling eyes, long flowing hair, delicate hands and frilly romantic clothing.',
      color:
        'Pastel cherry pink, lavender, mint and cream with sparkling white highlights everywhere.',
      light: 'Dreamy diffuse glow with sparkles, petals and soft halos around the figures.',
      texture:
        'Delicate fine shojo line, floral borders, lace, sparkle tones and screentone petals.',
      camera: 'Romantic framed close-ups surrounded by flowers, petals and decorative borders.',
      mood: 'sweet blossoming romance',
      render: 'Ornate sparkling shojo manga illustration with dreamy pastel romance.',
      key: 'Arina Tanemura sparkle eyes; flowing hair; floral frames; pastel romance',
    }),
    au('SP13-005', 'Hanasaku Iroha P.A. Works - Rainy Slice of Life', {
      look: 'P.A. Works Hanasaku Iroha look (2011): traditional hot-spring inn life, lush detailed painted interiors, soft rain and warm working-life drama.',
      subject:
        'draw people with P.A. Works designs, soft expressive faces, inn kimono or work aprons and natural gestures.',
      color: 'Rain grey, warm wood amber, tatami gold and soft green garden tones.',
      light: 'Soft rainy window light and warm lamps glowing inside the wooden inn.',
      texture: tv,
      camera: 'Quiet interior compositions through sliding doors and rainy garden views.',
      mood: 'warm rainy diligence',
      render: 'Detailed P.A. Works television frame with lush painted interiors.',
      key: 'Hanasaku Iroha inn; painted interiors; rain; warm working life',
    }),
    au('SP13-013', 'Oshi no Ko Doga Kobo - Backstage Nerves Anime', {
      look: 'Doga Kobo Oshi no Ko look (2023): glittering idol showbusiness, star-shaped highlights in eyes, dazzling stage lights and dark backstage ambition.',
      subject:
        'draw people with glossy idol designs, big eyes with star-shaped highlights, stage costumes and nervous or ambitious expressions.',
      color: 'Stage pink, gold glitter, deep backstage shadow and mirror-bulb white.',
      light: 'Bulb-ringed mirror light, dazzling stage spotlights and dim backstage shadow.',
      texture: tv,
      camera: 'Mirror compositions in cramped dressing rooms and dazzling wide shots of the stage.',
      mood: 'glittering anxious ambition',
      render: 'Glossy Doga Kobo frame with idol sparkle and backstage darkness.',
      key: 'Oshi no Ko star eyes; idol stages; mirror bulbs; dark ambition',
      avoid: ['a purple-haired idol with star pupils', 'existing franchise characters'],
    }),
    au('SP13-015', 'Restaurant to Another World - Dessert Cafe Comedy', {
      look: 'Silver Link Restaurant to Another World look (2017): cozy Western-style restaurant, glistening food close-ups and fantasy patrons blissfully tasting modern dishes.',
      subject:
        'draw people with soft fantasy designs, knights, elves and dragons as patrons, with blissful tasting expressions.',
      color: 'Warm wood brown, cream, strawberry red and glossy food highlights.',
      light: 'Warm restaurant lamplight with glossy highlights on desserts.',
      texture: tv,
      camera: 'Food close-ups and blissful reaction shots at restaurant tables.',
      mood: 'cozy blissful comedy',
      render: 'Warm cozy fantasy television frame with glistening food.',
      key: 'Restaurant to Another World; glistening desserts; fantasy patrons; bliss',
    }),
    au('SP13-018', 'The Eccentric Family P.A. Works - Festival Lantern Summer', {
      look: 'P.A. Works The Eccentric Family look (2013): vivid Kyoto nights, tanuki and tengu shapeshifters, festival lanterns, flying tea houses and stylized painted cityscapes.',
      subject:
        'draw people with stylized simple designs, kimono and yukata, and shapeshifting animals with expressive faces.',
      color: 'Lantern red, festival gold, Kyoto night indigo and vivid greens.',
      light: 'Warm paper lantern light on summer nights and glowing festival stalls.',
      texture: 'Clean flat cel with stylized photo-derived Kyoto backgrounds and bold color.',
      camera: 'Festival street wides and whimsical flying scenes over Kyoto rooftops.',
      mood: 'whimsical summer festivity',
      render: 'Vivid P.A. Works frame with stylized Kyoto festival nights.',
      key: 'Eccentric Family Kyoto; tanuki and tengu; lanterns; flying tea houses',
    }),
    au('SP13-056', 'Carole and Tuesday BONES - Concert Spotlight Anime', {
      look: 'BONES Carole and Tuesday look (2019): future Mars music scene, soft realistic designs, detailed instruments, warm concert lights and heartfelt performances.',
      subject:
        'draw people with soft realistic designs, expressive faces, stage clothes and precisely drawn instruments.',
      color: 'Warm stage amber, Mars dusk orange, spotlight white and soft blue.',
      light: 'Blazing spotlights, lens flares and warm crowd glow.',
      texture: tv,
      camera: 'Concert stage wide shots and emotional close-ups of performers mid-song.',
      mood: 'heartfelt musical triumph',
      render: 'Polished BONES television frame with detailed musical performance animation.',
      key: 'Carole and Tuesday concerts; detailed instruments; spotlights; heartfelt',
    }),
    au('SP13-057', 'Tsukigakirei feel. - Afterschool Golden Hour Anime', {
      look: 'feel. Tsukigakirei look (2017): understated realistic school romance, golden hour light through classrooms, soft grain and gentle rotoscope-like acting.',
      subject:
        'draw people with understated realistic designs, simple faces, uniforms and shy natural gestures.',
      color: 'Golden hour orange, soft classroom beige and dusty blue shadows.',
      light: 'Long golden afternoon light through windows and floating dust motes.',
      texture: 'Soft grainy digital cel with realistic painted classrooms.',
      camera: 'Quiet classroom framing and long unhurried afternoon shots in empty halls.',
      mood: 'shy golden tenderness',
      render: 'Understated realistic school frame with golden hour glow.',
      key: 'Tsukigakirei golden hour; understated realism; dust motes; shyness',
    }),
    au('SP13-058', 'Makoto Shinkai 5cm - Winter Breath Quiet Anime', {
      look: 'Makoto Shinkai 5 Centimeters per Second look (2007): heavy snowfall, lonely train stations, visible breath, glowing streetlights and melancholy distance.',
      subject:
        'draw people with early Shinkai designs, simple faces, winter coats and scarves, small in wide scenes.',
      color: 'Snow white, night blue, streetlight amber and train-window glow.',
      light: 'Glowing streetlights in heavy snow and warm windows at night.',
      texture: 'Painterly digital backgrounds with dense detailed snowfall and glowing windows.',
      camera: 'Lonely wide shots of tiny rural stations and endless snowfields at night.',
      mood: 'quiet melancholy distance',
      render: 'Painterly early Makoto Shinkai frame with snowy lonely melancholy.',
      key: 'Shinkai 5cm snow; lonely stations; visible breath; distance',
    }),
    au('SP13-059', 'Kamome Shirahama - Night Study Lamp Anime', {
      look: 'Kamome Shirahama Witch Hat Atelier look: exquisite fine-line illustration, magic drawn with ink, ornate art nouveau details, cozy witch studios and wonder.',
      subject:
        'draw people with Shirahama designs, delicate faces, flowing hair, pointed hats and ornate robes drawn in fine ink.',
      color: 'Warm lamp amber, ink black, soft teal and parchment tones.',
      light: 'Warm brass lamp glow and glowing magical ink sigils.',
      texture: 'Exquisite fine pen lines, hatching and art nouveau ornament.',
      camera: 'Cozy studio compositions filled with detailed tools and books.',
      mood: 'cozy studious wonder',
      render: 'Exquisite fine-line fantasy illustration with art nouveau ornament.',
      key: 'Kamome Shirahama fine line; ink magic; art nouveau; cozy studios',
      avoid: ['glowing written runes', 'existing franchise characters'],
    }),
    au('SP13-060', 'Marmalade Boy Toei - Nineties School Cel Nostalgia', {
      look: 'Toei Marmalade Boy look (1994): nineties shojo romance cel, big glossy eyes, pastel skies, seaside towns and warm nostalgic color.',
      subject:
        'draw people with Akemi Yoshizumi-derived nineties designs, big glossy eyes, flowing hair and casual nineties clothes.',
      color: 'Pastel sky, sunset peach, sea blue and warm nostalgic tones.',
      light: 'Warm nostalgic sunset light with soft cel shadows.',
      texture: cel90,
      camera: 'Romantic seaside walks at sunset and nostalgic views over small towns.',
      mood: 'warm nostalgic romance',
      render: 'Nostalgic mid-1990s shojo television frame with glossy romantic eyes.',
      key: 'Marmalade Boy nineties cel; glossy eyes; seaside towns; nostalgia',
    }),
    au('SP13-061', 'Girls Band Cry Toei - Garage Band Grit Anime', {
      look: 'Toei Girls Band Cry look (2024): expressive cel-shaded 3D with hand-drawn feel, raw rock band grit, cramped rehearsal spaces and messy emotional honesty.',
      subject:
        'draw people as cel-shaded 3D figures with expressive faces, band tees and worn instruments.',
      color: 'Grimy garage browns, amp black, neon pink and fluorescent white.',
      light: 'Bare bulb garage light and harsh stage spots.',
      texture: 'Cel-shaded 3D figures with hand-drawn line accents and expressive faces.',
      camera: 'Cramped rehearsal-room framing and sweaty live stage shots in tiny venues.',
      mood: 'raw emotional grit',
      render: 'Expressive cel-shaded rock band frame with raw emotional energy.',
      key: 'Girls Band Cry grit; cel-shaded 3D; rehearsal rooms; raw emotion',
    }),
    au('SP13-062', 'Makoto Isshiki - Classical Recital Hush Anime', {
      look: 'Makoto Isshiki Forest of Piano look: piano prodigies, forests of music, elegant concert halls and hushed intense performances.',
      subject:
        'draw people with Isshiki designs, elegant pianists with long fingers, concert clothes and focused faces.',
      color: 'Concert black, piano gloss, forest green and warm stage gold.',
      light: 'Single soft spotlight and reflections on glossy piano.',
      texture: tv,
      camera: 'Hushed concert hall wides and close-ups on hands.',
      mood: 'hushed intense focus',
      render: 'Elegant classical music television frame with hushed tension and focus.',
      key: 'Forest of Piano; concert halls; hands on keys; hush',
    }),
    au('SP13-063', 'Nagi-Asu P.A. Works - Seaside Summer Haze Anime', {
      look: 'P.A. Works Nagi-Asu: A Lull in the Sea look (2013): shimmering seaside towns, underwater villages, summer haze and luminous blue water light.',
      subject:
        'draw people with soft P.A. Works designs, big clear eyes, summer clothes and sea-dweller features.',
      color: 'Luminous sea blue, cumulus white, sandy beige and coral.',
      light: 'Shimmering summer haze above the harbor and caustic underwater light below.',
      texture: tv,
      camera: 'Harbor walls, big cumulus skies and underwater views.',
      mood: 'shimmering summer longing',
      render: 'Luminous P.A. Works seaside frame with glowing water and summer skies.',
      key: 'Nagi-Asu sea light; summer haze; seaside towns; underwater villages',
    }),
    au('SP13-064', 'Vagabond - Dawn Practice Mist Anime', {
      look: 'Takehiko Inoue Vagabond look: masterful brush ink and wash, misty landscapes, realistic sweating swordsmen and meditative discipline.',
      subject:
        'draw people with Inoue realism, lean bodies, sweat, wild hair and simple period clothes painted with brush.',
      color: 'Ink black and grey wash with pale mist white.',
      light: 'Pale dawn mist light rendered entirely by soft ink wash gradients.',
      texture: 'Masterful brush strokes, dry brush and ink wash.',
      camera: 'Misty wide landscapes and close brush-painted faces full of sweat and focus.',
      mood: 'meditative disciplined focus',
      render: 'Masterful brush-ink manga illustration with meditative realism and misty depth.',
      key: 'Vagabond brush ink; mist; realistic swordsmen; meditation',
      avoid: ['a wild-haired swordsman with two swords', 'existing franchise characters'],
    }),
    au('SP13-065', 'Studio Colorido - Rooftop Wind Anime', {
      look: 'Studio Colorido look as in Penguin Highway and A Whisker Away: bright airy summer towns, strong wind, fluffy clouds, cheerful designs and whimsical motion.',
      subject:
        'draw people with soft cheerful designs, rounded faces, fluttering clothes and windswept hair.',
      color: 'Bright sky blue, cloud white, fresh green and warm sun.',
      light: 'Bright airy summer light with wind-tossed shadows and glowing clouds.',
      texture: tv,
      camera: 'Rooftop and hillside wide shots with hats, papers and kites flying in the wind.',
      mood: 'breezy whimsical freedom',
      render: 'Bright airy Studio Colorido frame with playful windswept motion.',
      key: 'Studio Colorido wind; airy summer; fluffy clouds; whimsy',
    }),
    au('SP13-066', 'Gisaburo Sugii - Late Train Window Anime', {
      look: 'Gisaburo Sugii Night on the Galactic Railroad look (1985): melancholy trains through starry night, quiet contemplative pacing, soft cel and dreamlike reflections.',
      subject:
        'draw people with gentle simple designs, quiet faces and period clothing, seen through train windows.',
      color: 'Deep starry navy, window amber and soft grey-blue.',
      light: 'Warm carriage lamp light mixed with starlight reflections on the glass.',
      texture: 'Soft analog cel with deep painted night skies full of stars.',
      camera: 'Train-window framing with layered reflections of faces and passing lights.',
      mood: 'quiet melancholy reverie',
      render: 'Contemplative 1985 feature frame with dreamlike melancholy pacing.',
      key: 'Galactic Railroad melancholy; train windows; starlight; reflections',
    }),
    au('SP13-067', 'Josee BONES - Soft Focus Letter Anime', {
      look: 'BONES Josee, the Tiger and the Fish look (2020): soft focus romance, dreamy bokeh, shimmering light, art and the sea, and tender emotional realism.',
      subject: 'draw people with soft realistic designs, gentle faces and simple clothing.',
      color: 'Soft summer window light, pastel sea blue and warm skin tones.',
      light: 'Glowing summer bokeh and shimmering soft light around faces and hands.',
      texture: tv,
      camera: 'Shallow focus close-ups on hands and letters with glowing blurred backgrounds.',
      mood: 'tender dreamy romance',
      render: 'Soft glowing BONES romance frame with tender emotional realism.',
      key: 'Josee soft focus; bokeh; tender realism; summer light',
    }),
    au('SP13-068', 'Genshiken Palm Studio - Club Room Clutter Comedy', {
      look: 'Palm Studio Genshiken look (2004): cluttered otaku club rooms, realistic nerdy adults, stacks of manga and models, and warm observational comedy.',
      subject:
        'draw people with grounded otaku designs, glasses, casual clothes and expressive comic reactions.',
      color: 'Cluttered warm browns, fluorescent white and poster color accents.',
      light: 'Fluorescent club-room light mixed with warm afternoon light from the window.',
      texture: tv,
      camera: 'Crowded club-room compositions stuffed with books, models, posters and snacks.',
      mood: 'warm nerdy comedy',
      render: 'Observational mid-2000s comedy television frame with warm nerdy detail.',
      key: 'Genshiken clutter; otaku club room; grounded nerds; comedy',
    }),
    au('SP13-069', 'Yoshifumi Kondo - Library Sunbeam Quiet Anime', {
      look: 'Yoshifumi Kondo Whisper of the Heart look (1995): Ghibli realism of everyday life, libraries and hillside towns, golden sunbeams and quiet creative longing.',
      subject:
        'draw people with Kondo realism, natural faces, simple clothes and quiet studious gestures.',
      color: 'Warm library wood, sunbeam gold and hillside green.',
      light: 'Golden sunbeams through tall library windows lighting drifting dust.',
      texture: 'Classic hand-drawn cel with detailed painted hillside towns and interiors.',
      camera: 'Quiet library interiors among shelves and sweeping hillside town views.',
      mood: 'quiet creative longing',
      render: 'Warm classic hand-drawn Ghibli feature frame with everyday realism.',
      key: 'Whisper of the Heart realism; libraries; sunbeams; hillside towns',
    }),
    au('SP13-070', 'Tari Tari P.A. Works - Choir Harmony Light Anime', {
      look: 'P.A. Works Tari Tari look (2012): choir club harmony, seaside Kamakura towns, luminous skies and heartfelt group performances.',
      subject:
        'draw people with P.A. Works designs, clear eyes, simple clothes and singing expressions.',
      color: 'Luminous sky blue, warm gold and soft seaside tones.',
      light: 'Luminous warm light filling chapels, halls and seaside classrooms.',
      texture: tv,
      camera: 'Group choir compositions with open singing faces and seaside town wide shots.',
      mood: 'heartfelt harmonious joy',
      render: 'Luminous P.A. Works television frame with choir warmth and harmony.',
      key: 'Tari Tari choir; Kamakura seaside; luminous light; harmony',
    }),
  ]),
};

export default spec;
