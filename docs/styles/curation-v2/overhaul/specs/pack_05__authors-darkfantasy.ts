import type { Spec } from '../tools/apply';
import { au } from './_authors';

// Dark fantasy and seinen, author pass: each preset names its series, mangaka or studio and the
// concrete marks of that look. Briefs stay adult and never restage the source work.
const spec: Spec = {
  pack: 'pack_05',
  category: '4. Dark Fantasy & Seinen',
  updates: Object.fromEntries([
    au('SP05-278', 'Land of the Lustrous Orange - Mineral Loneliness Fracture Style', {
      look: 'Studio Orange Land of the Lustrous look (2017): cel-shaded 3D gem people with translucent crystal hair and bodies, refracted rainbow light, cracks and chips, and lonely seaside meadows.',
      subject:
        'draw figures as translucent gem-bodied people with crystal hair, faceted refractive skin and hairline cracks that glint with light.',
      color:
        'Mineral mint, peridot green, sapphire blue, pale gold and refracted rainbow edges on white grass.',
      light:
        'Bright seaside daylight refracting through crystal bodies into scattered rainbow caustics on the grass.',
      texture:
        'Cel-shaded 3D surfaces with gemstone facets, translucent refraction, cracks and powdery chips.',
      camera:
        'Sweeping cel-shaded CG camera moves across meadows and slow tragic close-ups of cracking crystal.',
      mood: 'luminous mineral loneliness',
      render: 'Polished cel-shaded 3D television frame with gemstone translucency and refraction.',
      key: 'Translucent gem bodies; refracted rainbow light; cracks and chips; lonely meadows',
      avoid: ['mint-green gem person with a short bob', 'existing franchise characters'],
      briefs: [
        'Kneeling in a white grass meadow above the sea, a gem-bodied gardener with translucent emerald hair carefully glues a chipped fingertip back on while the sun throws rainbow flecks across the ground around her. No readable text or logo.',
        'Two crystal-bodied scholars in black uniforms argue about the tides on a cliff, their faceted faces scattering blue light onto each other every time they turn their heads. No readable text or logo.',
        'On a silent seaside beach, a single cracked shard of pale amber crystal lies half buried in the sand, glowing softly as the waves pull back. No readable text or logo.',
      ],
    }),
    au('SP05-261', 'Berserk 1997 OLM - Eclipse Scar Weight Style', {
      look: 'OLM Berserk television look (1997): muted medieval war palettes, painted freeze-frame stills in dramatic moments, stoic mercenaries, grim castles and a heavy tragic fate.',
      subject:
        'draw people with nineties realistic designs, heavy medieval armor and cloaks, stoic scarred faces and restrained gestures.',
      color:
        'Muted mud brown, iron grey, dried blood red and cold dusk blue across the whole frame.',
      light:
        'Overcast battlefield light, torch-lit castle halls and an ominous eclipse glow at climaxes.',
      texture:
        'Late-nineties cel animation with limited movement and painted freeze-frame stills at key moments.',
      camera:
        'Somber medieval compositions with painted still frames used for the most dramatic beats.',
      mood: 'heavy tragic fatalism',
      render: 'Somber late-1990s television frame with painted dramatic freeze frames.',
      key: 'Berserk 1997 muted palette; painted freeze frames; grim medieval war; eclipse omen',
      avoid: [
        'a black-armored swordsman with an oversized slab greatsword',
        'a white-haired knight in a winged helmet',
        'existing franchise characters',
      ],
      briefs: [
        'Standing on a burned hillside at dusk, a weary mercenary captain in dented armor watches the sun slowly turn black while her band kneels silently in the mud around her banner. No readable text or logo.',
        'Around a campfire in a ruined abbey, a grizzled sellsword teaches a young squire to mend chainmail as rain drums on the broken roof above them. No readable text or logo.',
        'A cracked iron helmet rests on a fence post beside an empty battlefield, crows lined up along the rail in the grey evening light. No readable text or logo.',
      ],
    }),
    au('SP05-262', 'Monster Madhouse - Moral Suspicion Realism Style', {
      look: 'Madhouse Monster television look (2004): faithful Naoki Urasawa realism in animation, muted European cities, hospitals and small towns, quiet suspense and ordinary adult faces.',
      subject:
        'draw people with Urasawa-derived realistic designs, individualized adult faces, heavy coats and restrained anxious expressions.',
      color: 'Muted German winter tones, grey-green, beige, pale blue and dim hospital white.',
      light:
        'Cold diffuse European daylight, dim hospital corridors and warm but uneasy lamplight at night.',
      texture:
        'Realistic restrained digital cel with painted European architecture and subdued detail.',
      camera:
        'Quiet observation shots, long corridors and slow push-ins on faces realizing something.',
      mood: 'creeping moral suspicion',
      render: 'Faithful realist Madhouse television frame with slow-burning suspense.',
      key: 'Monster anime realism; European cities; hospitals; quiet suspense',
      avoid: [
        'a blond young man with a calm smile in a dark coat',
        'existing franchise characters',
      ],
      briefs: [
        'At the end of a long hospital corridor at night, a tired surgeon in a white coat stops as a pair of polished shoes appears in the doorway of the room she just left empty. No readable text or logo.',
        'In a small European bakery at dawn, a retired detective buys bread while watching a stranger in the window reflection who never seems to blink. No readable text or logo.',
        'An empty park bench in a snowy European square holds a folded newspaper and a single leather glove that nobody has come back for. No readable text or logo.',
      ],
    }),
    au('SP05-263', 'Hiroya Oku - Black Signal Nihilism Style', {
      look: 'Hiroya Oku Gantz manga look: photo-traced hyperrealistic Tokyo backgrounds, 3D-modeled figures with glossy black suits, cold nihilistic tension and alien absurdity.',
      subject:
        'draw people with Oku realism, photographic ordinary faces, glossy black tight suits with circular nodes and ordinary Tokyo clothes.',
      color: 'Glossy black, cold white, Tokyo night grey and electric blue node glows.',
      light: 'Harsh flat apartment light and cold streetlights with glossy suit reflections.',
      texture: 'Photo-traced backgrounds, digitally modeled figures and screentone gradients.',
      camera: 'Cinematic photographic framing, wide Tokyo streets and sudden absurd alien reveals.',
      mood: 'cold nihilistic absurdity',
      render: 'Hyperreal digital manga illustration with photographic Tokyo detail.',
      key: 'Hiroya Oku photorealism; glossy black suits; Tokyo streets; alien absurdity',
      avoid: ['a large black sphere in an apartment room', 'existing franchise characters'],
      briefs: [
        'Waking up in an empty Tokyo apartment wearing a glossy black suit she never bought, an office worker in her forties stares at a row of strangers who all look just as confused as she is. No readable text or logo.',
        'Two salarymen in glossy black suits hide behind a vending machine on a real-looking Tokyo street, watching a giant stone statue slowly turn its head. No readable text or logo.',
        'In a silent apartment at midnight, a single glossy black glove lies on the tatami mat, its circular node blinking faint blue. No readable text or logo.',
      ],
    }),
    au('SP05-264', 'Elfen Lied Arms - Clinical Innocence Rupture Style', {
      look: 'Arms Elfen Lied look (2004): soft pastel seaside designs set against clinical laboratory horror, Klimt-inspired gold mosaic ornament, pink hair and sudden violent ruptures.',
      subject:
        'draw only adults with soft pastel designs, pink or pale hair, horns or unusual features, and hospital or casual clothes.',
      color:
        'Soft seaside pastels contrasted with cold clinical white, steel and gold Klimt-like mosaic accents.',
      light: 'Gentle seaside sunlight versus harsh sterile laboratory light.',
      texture: 'Soft digital cel with Klimt-inspired gold mosaic patterns in certain frames.',
      camera: 'Calm seaside wides abruptly cut against cold clinical corridors.',
      mood: 'fragile clinical dread',
      render: 'Contrasting television frame of pastel innocence and clinical dread.',
      key: 'Pastel versus clinical; Klimt gold mosaics; horned figures; sudden rupture',
      avoid: ['a pink-haired girl with small horns', 'existing franchise characters', 'minors'],
      briefs: [
        'Washed up on a pastel seaside beach at dawn, a horned woman in a torn hospital gown sits hugging her knees as gold mosaic patterns shimmer across the waves like a painted dream. No readable text or logo.',
        'Behind thick glass in a white laboratory, a calm horned patient watches the researchers nervously, the gold pattern on the wall glowing brighter as they step back. No readable text or logo.',
        'On a quiet seaside veranda, a single seashell rests on a white hospital bracelet in the warm evening light. No readable text or logo.',
      ],
    }),
    au('SP05-265', 'Vampire Hunter D Bloodlust - Rose-Black Baroque Decadence Style', {
      look: 'Madhouse Vampire Hunter D: Bloodlust film look (2000) after Yoshitaka Amano designs: baroque gothic castles, rose-black decadence, elegant pale hunters and painterly desolate wastelands.',
      subject:
        'draw people with Amano-derived elegance, tall pale figures, wide-brimmed hats, flowing capes and aristocratic vampires.',
      color: 'Rose black, crimson, bone white and moonlit blue.',
      light: 'Moonlit castle light, candlelit baroque halls and dramatic gothic silhouettes.',
      texture:
        'Lavish hand-drawn cel with painterly baroque backgrounds and fine ornamental detail.',
      camera:
        'Grand gothic castle compositions and elegant slow-motion confrontations under the moon.',
      mood: 'decadent gothic elegance',
      render: 'Lavish 2000 Madhouse feature frame with baroque decadence.',
      key: 'Amano gothic elegance; baroque castles; rose-black palette; moonlit hunters',
      avoid: [
        'a pale hunter in a wide-brimmed hat with a talking left hand',
        'existing franchise characters',
      ],
      briefs: [
        'Riding a black horse across a moonlit wasteland toward a baroque castle, a pale bounty hunter in a sweeping rose-black cape passes a field of wilted roses that slowly bloom again behind her. No readable text or logo.',
        'In a candlelit baroque ballroom, an aristocratic vampire couple dance alone among hundreds of empty chairs draped in black lace. No readable text or logo.',
        'A single black rose rests on a moonlit stone balcony, its petals frosted with pale silver dew. No readable text or logo.',
      ],
    }),
    au('SP05-266', 'Ajin Polygon - Black Particle Fugitive Style', {
      look: 'Polygon Pictures Ajin look (2016): cel-shaded 3D fugitive thriller, black particle phantoms made of smoky ash, cold urban Japan and tense chase scenes.',
      subject:
        'draw people as cel-shaded CG figures in casual clothes, with smoky black particle phantoms standing behind them.',
      color: 'Cold urban grey, black particles, pale skin and muted blue.',
      light: 'Cold overcast light with black particle smoke absorbing it.',
      texture: 'Cel-shaded CG surfaces with swirling black particle effects.',
      camera: 'Chase compositions in stairwells and alleys, phantoms looming behind.',
      mood: 'tense fugitive dread',
      render: 'Cold cel-shaded Polygon Pictures frame with particle phantoms.',
      key: 'Cel-shaded CG; black particle phantoms; fugitive chase; cold city',
      briefs: [
        'Running down a concrete stairwell with a police siren echoing below, a fugitive nurse glances back as a tall phantom made of drifting black ash silently mirrors her every step. No readable text or logo.',
        'A tired fugitive eats instant noodles in a laundromat while his black particle phantom sits awkwardly on the next machine. No readable text or logo.',
        'In an empty underpass, a thin stream of black ash particles drifts upward from a single abandoned shoe. No readable text or logo.',
      ],
    }),
    au('SP05-267', 'Hiroaki Samura - Blood-Ink Severance Style', {
      look: 'Hiroaki Samura Blade of the Immortal manga look: raw pencil and ink drawing, loose sketchy energy, elaborate exotic weapons, ronin and historical Edo grit.',
      subject:
        'draw people with Samura designs, scruffy scarred faces, loose sketchy hair and elaborate period clothing with strange weapons.',
      color: 'Pencil grey, black ink wash and dried ink sepia with no bright color.',
      light: 'Natural light suggested by sketchy pencil shading and ink wash.',
      texture: 'Loose raw pencil lines, ink wash, visible sketch construction and dry brush.',
      camera:
        'Dynamic sketchy sword duels alternating with quiet Edo-period street and teahouse moments.',
      mood: 'raw ronin grit',
      render: 'Raw pencil-and-ink historical manga illustration with sketchy energy.',
      key: 'Hiroaki Samura pencil; raw sketch; exotic weapons; Edo grit',
      avoid: [
        'a one-eyed immortal ronin with a scarred face and many swords',
        'existing franchise characters',
      ],
      briefs: [
        'Crossing a snowy Edo bridge in a patched kimono, a scruffy ronin with a strange forked blade stops to buy chestnuts from a vendor while three bounty hunters wait at the far end. No readable text or logo.',
        'By candlelight in a cluttered Edo workshop, an old weaponsmith sketches designs for impossible forked and hooked blades on sheets of rough paper pinned to the wall. No readable text or logo.',
        'A broken sword hilt lies in fresh snow outside an empty teahouse at dawn, pencil-grey mist around it. No readable text or logo.',
      ],
    }),
    au('SP05-268', 'Nobuyuki Fukumoto - Neon Despair Pressure Style', {
      look: 'Nobuyuki Fukumoto Kaiji manga look: sharp pointed chins and noses, crude bold lines, sweating anxious faces, desperate gambling tension and oppressive swirling background patterns.',
      subject:
        'draw people with Fukumoto designs, extremely pointed chins and noses, big sweating faces and cheap clothes.',
      color: 'Black ink with heavy tone, neon purple and sickly yellow in color.',
      light:
        'Harsh gambling-den light from bare bulbs and swirling psychological darkness closing in.',
      texture: 'Crude bold lines, heavy sweat drops and oppressive swirl patterns.',
      camera:
        'Extreme anxious close-ups on sweating faces and crowded underground gambling tables.',
      mood: 'desperate crushing pressure',
      render: 'Crude intense psychological gambling manga illustration with oppressive tension.',
      key: 'Fukumoto pointed chins; sweat; gambling despair; swirling backgrounds',
      briefs: [
        'Sweating over a single playing card at a neon-lit underground table, a broke delivery driver with an impossibly pointed chin feels the whole room swirl around him as his opponent slowly smiles. No readable text or logo.',
        'Twelve anxious men balance on a narrow steel beam between skyscrapers at night, each one sweating enormous drops. No readable text or logo.',
        'A single cheap ticket lies crumpled on a neon floor, swirling black patterns closing in around it. No readable text or logo.',
      ],
    }),
    au('SP05-269', 'Akagi Madhouse - Smoke-Filled Calculation Style', {
      look: 'Madhouse Akagi look (2005): smoky postwar mahjong parlors, Fukumoto sharp faces, cold calculation, cigarette smoke swirls and psychological tension.',
      subject:
        'draw people with Fukumoto-derived pointed faces, postwar suits, cigarettes and calm cold stares.',
      color: 'Smoky grey, dim amber, cold green felt and black.',
      light: 'Dim lamplight through cigarette smoke and cold stares.',
      texture: 'Digital cel with smoke swirls and dark shading.',
      camera: 'Tense overhead table compositions and cold close-ups on calm calculating eyes.',
      mood: 'cold calculating tension',
      render: 'Smoky psychological Madhouse television frame with postwar gloom.',
      key: 'Akagi smoke; mahjong tension; pointed faces; cold calculation',
      briefs: [
        'In a smoke-filled postwar mahjong parlor, a calm old woman with a sharp pointed face places a single tile as three gangsters around the table freeze, sweat running down their temples. No readable text or logo.',
        'A cigarette burns down to ash in an ashtray while two players stare each other down in silence. No readable text or logo.',
        'Under a single lamp swinging from a smoky ceiling, an empty mahjong table glows green in the dark, one tile left standing on its edge. No readable text or logo.',
      ],
    }),
    au('SP05-270', 'Dororo MAPPA - Cursed Severance Compassion Style', {
      look: 'MAPPA and Tezuka Productions Dororo look (2019): Sengoku-era dark fantasy, demons, a sparse muted palette, prosthetic bodies and bleak compassionate storytelling.',
      subject:
        'draw people with modern Tezuka-derived designs, ragged period clothing, prosthetic limbs and stoic or fierce faces.',
      color: 'Muted earth, ash grey, faded red and dark forest green.',
      light: 'Overcast Sengoku daylight over ruined villages and eerie demon glows at night.',
      texture: 'Clean digital cel with muted painted Sengoku landscapes and ash.',
      camera: 'Bleak landscape wide shots and intimate emotional moments between travelers.',
      mood: 'bleak compassionate endurance',
      render: 'Somber MAPPA television frame with muted Sengoku atmosphere and compassion.',
      key: 'Dororo Sengoku; muted palette; prosthetics; demons',
      avoid: ['a swordsman with blades in prosthetic arms', 'existing franchise characters'],
      briefs: [
        'Sharing a burnt rice cake on the steps of a ruined Sengoku shrine, a wandering swordsman with carved wooden hands and a sharp-tongued old thief watch a demon shadow slide across the valley below. No readable text or logo.',
        'A village healer carves a new wooden foot for a farmer by lamplight while the rain drums outside. No readable text or logo.',
        'In a flooded rice paddy at dusk, an abandoned carved wooden hand lies palm up among the reeds while a heron watches it from the bank. No readable text or logo.',
      ],
    }),
    au('SP05-271', 'Heavenly Delusion Production I.G - Sun-Reclaimed Concrete Mystery Style', {
      look: 'Production I.G Heavenly Delusion look (2023): post-collapse Japan reclaimed by nature, sunlit overgrown concrete, eerie monsters and mystery-laced road trips.',
      subject:
        'draw people with modern designs, travel gear, backpacks and practical clothes in overgrown ruins.',
      color: 'Sun-bleached concrete, lush green, sky blue and rust.',
      light: 'Bright warm sunlight pouring through overgrown ruins and broken ceilings.',
      texture: 'Clean digital cel with lushly painted overgrown concrete architecture.',
      camera: 'Road-trip wides through ruins and eerie mystery reveals.',
      mood: 'sunlit uneasy mystery',
      render: 'Bright Production I.G television frame with nature-reclaimed ruins.',
      key: 'Overgrown concrete; post-collapse Japan; sunlit mystery; road trip',
      briefs: [
        'Walking along a sun-bleached highway overgrown with wildflowers, two middle-aged travelers with heavy backpacks stop as something enormous shifts inside a moss-covered shopping mall ahead. No readable text or logo.',
        'A traveler naps inside an abandoned train car while vines creep through the broken windows around her. No readable text or logo.',
        'In a sunny meadow where a town used to be, a rusted vending machine stands among tall grass with a bird building a nest on top. No readable text or logo.',
      ],
    }),
    au('SP05-272', 'Pluto Studio M2 - Machine Mourning Noir Style', {
      look: 'Studio M2 Pluto look (2023): faithful Naoki Urasawa realism in animation, humanlike robots, grieving detectives, noir European cities and quiet mournful science fiction.',
      subject:
        'draw people and robots with Urasawa-derived realism, individualized faces, trench coats and subtle mechanical seams.',
      color: 'Muted noir grey, cold blue, warm lamp amber and dim rain tones.',
      light: 'Noir rain light, warm interior lamps and cold reflections.',
      texture: 'Realistic digital cel with painted European noir cities.',
      camera:
        'Detective noir framing in rainy streets and quiet emotional close-ups on robot faces.',
      mood: 'mournful machine noir',
      render: 'Faithful realist animation frame with mournful noir and Urasawa restraint.',
      key: 'Pluto realism; humanlike robots; noir detective; grief',
      avoid: [
        'a robot detective in a trench coat with a bald head',
        'a boy robot with spiky hair',
        'existing franchise characters',
      ],
      briefs: [
        'Standing in the rain outside a flower shop, a robot detective in a trench coat quietly buys a bouquet for a colleague whose memory chip was recovered that morning. No readable text or logo.',
        'An old robot gardener waters roses in a quiet European courtyard while a detective watches from the window. No readable text or logo.',
        'An empty trench coat hangs on a hook in a dim office, rain streaking the window. No readable text or logo.',
      ],
    }),
    au('SP05-273', 'Mushishi Artland - Luminous Natural Cycle Calm Style', {
      look: 'Artland Mushishi look (2005): serene rural Japan painted in lush natural detail, glowing translucent life forms, quiet healers and slow meditative pacing.',
      subject:
        'draw people with Urushibara-derived simplicity, plain calm faces, rural clothes and translucent glowing organisms.',
      color: 'Lush natural greens, misty blue and soft glowing white.',
      light: 'Soft natural light and gentle luminous glows from life forms.',
      texture: 'Lush painted backgrounds and clean simple cel figures.',
      camera:
        'Quiet meditative landscapes of mountains and rivers with gentle patient observation.',
      mood: 'serene meditative calm',
      render: 'Serene painterly Artland television frame with lush natural detail.',
      key: 'Mushishi serenity; glowing life forms; lush rural Japan; meditation',
      avoid: [
        'a white-haired wanderer with one green eye and a wooden box',
        'existing franchise characters',
      ],
      briefs: [
        'Burying a small glowing creature at the edge of a misty mountain spring, a quiet rural healer kneels as tiny translucent lights rise from the moss around her hands and drift into the night. No readable text or logo.',
        'A fisherman watches a river of faint glowing lights flow beneath the water under his boat. No readable text or logo.',
        'At dusk along a silent forest path, tiny glowing spores drift over the moss like slow snow while an old wooden signpost leans into the ferns. No readable text or logo.',
      ],
    }),
    au('SP05-274', 'Erased A-1 - Winter Guilt Suspicion Style', {
      look: 'A-1 Pictures Erased look (2016): snowy Hokkaido winters, letterboxed flashback framing, warm homes and cold outside suspicion, and quiet time-slip suspense.',
      subject:
        'draw only adults with simple warm designs, heavy winter coats, scarves and uneasy expressions.',
      color: 'Snow white, winter blue, warm kitchen amber and red scarves.',
      light: 'Cold Hokkaido winter daylight outside and warm kitchen lamps inside homes.',
      texture: 'Clean digital cel with snowy painted small-town backgrounds.',
      camera: 'Letterboxed flashback frames and snowy wide shots of quiet streets.',
      mood: 'wintry guilty suspense',
      render: 'Quiet A-1 Pictures television frame with wintry time-slip suspense.',
      key: 'Erased snow; letterboxed flashbacks; warm homes; suspicion',
      briefs: [
        'Waking up twenty years in the past on a snowy morning, a middle-aged manga artist stares out of his mother’s kitchen window at a neighbor he knows will disappear by the end of winter. No readable text or logo.',
        'Two adults sit in a parked car in a snowy lot, watching a house with its lights off. No readable text or logo.',
        'On a snowy fence at the edge of a frozen park, a single red scarf flutters in the wind beside a row of footprints that suddenly stop. No readable text or logo.',
      ],
    }),
    au('SP05-276', 'Takayuki Yamaguchi - Sun-Bleached Cruel Discipline Style', {
      look: 'Takayuki Yamaguchi Shigurui manga look: hyper-detailed muscular anatomy, grotesque yet beautiful samurai, cruel discipline, sun-bleached Edo courtyards and ornate stylized detail.',
      subject:
        'draw people with Yamaguchi anatomy, tense sculpted muscles, severe beautiful faces and austere samurai clothing.',
      color: 'Sun-bleached white, deep ink black and pale sepia with no bright color.',
      light: 'Harsh sun-bleached noon light with sharp short shadows on stone.',
      texture: 'Hyper-detailed anatomical rendering of muscle and tendon in fine ink.',
      camera: 'Austere empty courtyard compositions and long tense frozen stances.',
      mood: 'cruel austere discipline',
      render: 'Hyper-detailed austere samurai manga illustration with cruel beauty.',
      key: 'Yamaguchi anatomy; sun-bleached courtyards; cruel discipline; samurai',
      avoid: ['existing franchise characters'],
      briefs: [
        'In a sun-bleached Edo courtyard at noon, two samurai with hyper-detailed tense muscles hold a practice stance for so long that the shadows on the stones slowly move across their feet. No readable text or logo.',
        'An aged sword master pours water over his head in a stone courtyard, every muscle carved in harsh light. No readable text or logo.',
        'In a sun-bleached stone courtyard at noon, a single wooden practice sword lies alone, its short shadow the only dark shape in the whole space. No readable text or logo.',
      ],
    }),
    au('SP05-277', 'Boogiepop Phantom Madhouse - Rusted Neon Adolescent Dread Style', {
      look: 'Madhouse Boogiepop Phantom look (2000): heavily vignetted sepia-rust color grading, grainy distortion, a haunted city and fragmented urban-legend dread.',
      subject:
        'draw only adults with pale quiet designs, school or work clothes and haunted expressions.',
      color: 'Rust sepia, sickly green and faded neon through heavy vignetting.',
      light: 'Dim filtered light with dark vignettes and flickering neon.',
      texture: 'Grainy distorted digital filters, rust tones and heavy dark vignetting.',
      camera: 'Fragmented disorienting compositions framed by heavy dark vignettes.',
      mood: 'fragmented urban dread',
      render: 'Grainy vignetted Madhouse television frame with haunted sepia tones.',
      key: 'Boogiepop sepia vignette; grain; urban legend; fragments',
      avoid: ['a figure in a tall black hat and cloak', 'existing franchise characters'],
      briefs: [
        'Walking home under a rust-colored sky full of flickering neon, an office worker notices that every streetlight dims as she passes, while a column of pale light hangs silently over the city. No readable text or logo.',
        'Behind a convenience store at midnight, a night-shift clerk hears a thin whistled tune from the empty alley, the sepia light around her slowly vignetting to black. No readable text or logo.',
        'In a vignetted rust-colored playground at dusk, a single rusted swing moves back and forth by itself while every window around it stays dark. No readable text or logo.',
      ],
    }),
    au('SP05-279', 'Kamui Fujiwara - Red-Optic Security Noir Style', {
      look: 'Kamui Fujiwara Kerberos manga art look: meticulous realistic armored police troops with glowing red optics, dense mechanical detail and grim alternate-postwar noir.',
      subject:
        'draw people with Fujiwara realism, heavy armored suits with red glowing optics, military coats and grim faces.',
      color: 'Black ink with dense grey tone and a single red optic glow.',
      light: 'Dim noir light cut by red optic glow.',
      texture: 'Meticulous pen detail with dense mechanical hatching on armor plates.',
      camera: 'Grim rainy noir alleys and looming low-angle armored figures.',
      mood: 'grim armored menace',
      render: 'Meticulous noir manga illustration with dense armored mechanical detail.',
      key: 'Kamui Fujiwara detail; red optics; armored troops; noir',
      avoid: ['protect-gear armor with red goggles and an MG42', 'existing franchise characters'],
      briefs: [
        'Standing in a rain-soaked alley of an alternate postwar city, a squad of heavily armored police troopers turns as one, their red glowing optics reflecting in the puddles around a frightened courier. No readable text or logo.',
        'In a harshly lit locker room, an armored trooper removes his heavy helmet with red optics, revealing a tired, ordinary middle-aged face with a small bandage. No readable text or logo.',
        'Deep in a dark concrete sewer tunnel, a pair of red optic lenses glows steadily above the black water, reflected in long trembling streaks. No readable text or logo.',
      ],
    }),
    au('SP05-280', 'Hell Girl Deen - Lantern Retribution Ritual Style', {
      look: 'Studio Deen Hell Girl look (2005): eerie twilight ferries on crimson rivers, spider lilies, lanterns, ritual retribution and quiet horror of ordinary grudges.',
      subject:
        'draw only adults with quiet designs, kimono or school uniforms, and eerie ritual companions.',
      color: 'Crimson twilight, spider lily red, black and lantern amber.',
      light: 'Eerie eternal twilight and warm lantern glow reflecting on dark water.',
      texture: 'Digital cel with painted crimson twilight skies and spider lily banks.',
      camera: 'Ritual ferry compositions on the river and quiet eerie close-ups.',
      mood: 'quiet ritual retribution',
      render: 'Eerie Studio Deen television frame with crimson twilight ritual.',
      key: 'Hell Girl ferry; spider lilies; crimson twilight; lanterns',
      avoid: [
        'a black-haired girl in a black sailor uniform with red eyes',
        'existing franchise characters',
      ],
      briefs: [
        'Drifting down a crimson river under an eternal twilight sky, a silent ferryman in a straw hat poles a small boat past banks of red spider lilies while a guilty businessman clutches his briefcase. No readable text or logo.',
        'Along a dark river under a crimson twilight sky, a lone paper lantern floats slowly downstream while red spider lilies glow along both banks. No readable text or logo.',
        'On the gate of a twilight shrine, a single red thread is tied tightly around a small straw doll that sways gently in the warm wind. No readable text or logo.',
      ],
    }),
    au('SP05-275', 'Paranoia Agent Madhouse - Civic Rumor Breakdown Style', {
      look: 'Satoshi Kon Paranoia Agent look (2004): grounded realistic Tokyo citizens, collective paranoia spreading through rumors, surreal intrusions and Madhouse realism.',
      subject:
        'draw people with Kon realism, ordinary Tokyo citizens of all ages, plain clothes and anxious faces.',
      color: 'Muted Tokyo greys, warm apartment tones and sudden surreal color intrusions.',
      light: 'Ordinary Tokyo city light interrupted by surreal glowing intrusions.',
      texture: 'Realistic Madhouse cel with detailed painted urban backgrounds.',
      camera: 'Ensemble city compositions of many citizens and surreal scene transitions.',
      mood: 'spreading civic paranoia',
      render: 'Grounded yet surreal Madhouse television frame with Kon realism.',
      key: 'Paranoia Agent realism; rumors; surreal intrusions; Tokyo citizens',
      avoid: [
        'a boy on golden inline skates with a bent bat',
        'a pink plush dog',
        'existing franchise characters',
      ],
      briefs: [
        'Across a crowded Tokyo crosswalk, dozens of ordinary commuters all glance nervously at the same empty manhole cover, each one sure they heard something rolling beneath it. No readable text or logo.',
        'In a cramped apartment, a tired detective interviews a grandmother who swears her television whispered her name, while the screen behind them shows only static. No readable text or logo.',
        'At night on an empty apartment staircase lit by one flickering bulb, a single golden roller skate sits on a step as if someone just left it. No readable text or logo.',
      ],
    }),
    au('SP05-066', 'Hitoshi Iwaaki - Invasive Anatomy Thriller Style', {
      look: 'Hitoshi Iwaaki Parasyte manga look: simple clean realistic line, deadpan faces, and shocking transformations of the head into bizarre bladed shapes.',
      subject:
        'draw people with Iwaaki simplicity, plain realistic faces, calm deadpan expressions and ordinary clothes.',
      color: 'Black ink with light tone and pale neutral colors.',
      light: 'Flat ordinary household light that feels calm yet deeply unsettling.',
      texture: 'Simple clean line, sparse tone and bizarre organic shapes.',
      camera: 'Calm everyday framing that suddenly breaks into bizarre bodily transformations.',
      mood: 'deadpan invasive dread',
      render: 'Clean unsettling manga illustration with bizarre organic forms.',
      key: 'Iwaaki clean line; deadpan faces; bizarre transformations; everyday',
      avoid: ['a talking hand with an eye on a palm', 'existing franchise characters'],
      briefs: [
        'Sitting calmly at a family dinner table, a polite father’s face slowly unfolds into a strange flower of smooth grey petals while his wife keeps serving rice without looking up. No readable text or logo.',
        'A school counselor with a calm deadpan face listens while her shadow on the wall moves independently. No readable text or logo.',
        'An empty dinner table set for four has one chair pushed back, a bowl still steaming. No readable text or logo.',
      ],
    }),
    au('SP05-069', 'Goblin Slayer White Fox - Procedural Low-Fantasy Grit Style', {
      look: 'White Fox Goblin Slayer look (2018): grim low-fantasy procedural raids, dirty caves, cheap battered armor, torchlight and methodical survival.',
      subject:
        'draw people with low-fantasy designs, dented cheap armor, dirty cloaks and methodical tired stances.',
      color: 'Torch amber, cave brown, mud grey and dim green.',
      light: 'Flickering torchlight in dark caves and a grim grey dawn outside.',
      texture: 'Gritty digital cel with dirt, grime and scratched cheap armor.',
      camera: 'Cave raid compositions by torchlight and methodical close-ups on preparations.',
      mood: 'grim methodical survival',
      render: 'Gritty White Fox television frame with low-fantasy grime.',
      key: 'Low-fantasy grit; caves; cheap armor; torchlight',
      avoid: [
        'an adventurer in a horned steel helmet with a visor slit',
        'existing franchise characters',
      ],
      briefs: [
        'Holding a torch at the mouth of a damp cave, a methodical middle-aged adventurer in cheap dented armor checks a hand-drawn map for the third time while her tired party waits in the mud. No readable text or logo.',
        'In a village stable by torchlight, a grim adventurer sharpens a short sword with slow careful strokes while the horses watch nervously from their stalls. No readable text or logo.',
        'Outside a rough guild hall at grey dawn, a dented steel helmet rests on an overturned barrel beside a half-eaten loaf of bread. No readable text or logo.',
      ],
    }),
    au('SP05-061', 'Shinichi Sakamoto - Crosshatched Doom Weight Style', {
      look: 'Shinichi Sakamoto manga look as in Innocent and The Climber: extraordinarily dense crosshatching, baroque theatrical compositions, gothic grandeur and the crushing weight of fate.',
      subject:
        'draw people with Sakamoto elegance, detailed faces, flowing hair and baroque costumes rendered with dense hatching.',
      color: 'Black ink with extremely dense crosshatching and baroque shadow.',
      light: 'Theatrical chiaroscuro carved entirely by dense layered crosshatching.',
      texture: 'Extraordinarily dense crosshatch lines and elaborate baroque ornament.',
      camera: 'Theatrical baroque compositions with crowds, stages and monumental scale.',
      mood: 'crushing baroque doom',
      render: 'Monumental crosshatched manga illustration with crushing baroque doom.',
      key: 'Shinichi Sakamoto crosshatching; baroque theater; doom; monumental',
      briefs: [
        'Standing alone on a scaffold in a crowded baroque square under a storm, a condemned executioner in a black coat looks up as the entire sky is carved into dense crosshatched clouds pressing down on the city. No readable text or logo.',
        'A climber hangs from a frozen cliff face as the mountain above is rendered in crushing crosshatch. No readable text or logo.',
        'An empty baroque theater stage is lit by a single candle, the darkness dense around it. No readable text or logo.',
      ],
    }),
    au('SP05-062', 'Sui Ishida - Crimson Hunger Metamorphosis Style', {
      look: 'Sui Ishida Tokyo Ghoul manga look: sketchy experimental ink, watercolor bleeds in crimson and black, masked figures and tragic urban metamorphosis.',
      subject:
        'draw people with Ishida designs, pale faces, masks, dark clothing and one crimson eye.',
      color: 'Black ink with crimson watercolor bleeds and grey washes.',
      light: 'Dim urban night light and glowing crimson eyes in shadowed faces.',
      texture: 'Sketchy experimental ink lines and bleeding crimson watercolor washes.',
      camera: 'Moody close-ups on masked faces and lonely urban rooftop compositions.',
      mood: 'tragic hungry metamorphosis',
      render: 'Experimental ink-and-watercolor manga illustration with a tragic hungry mood.',
      key: 'Sui Ishida sketchy ink; crimson watercolor; masks; metamorphosis',
      avoid: [
        'a white-haired figure with a leather eyepatch mask and zipper mouth',
        'existing franchise characters',
      ],
      briefs: [
        'Sitting alone in a coffee shop at closing time, a pale barista in a black apron stares at her own reflection as one of her eyes slowly bleeds crimson watercolor into the glass. No readable text or logo.',
        'A masked stranger stands on a rooftop at night, crimson ink dripping from the edge of the mask. No readable text or logo.',
        'A single coffee cup sits on an empty counter, a crimson watercolor bloom spreading beneath it. No readable text or logo.',
      ],
    }),
    au('SP05-063', 'Hellsing Ultimate Madhouse - Crimson Gothic Authority Style', {
      look: 'Madhouse and Satelight Hellsing Ultimate OVA look (2006): Kouta Hirano designs, gothic Victorian authority, huge black shadows, crimson coats and operatic vampire menace.',
      subject:
        'draw people with Hirano designs, tall aristocratic figures, gothic uniforms, crimson greatcoats and manic grins.',
      color: 'Crimson coats, deep black, gothic gold trim and moonlit blue light.',
      light: 'Operatic full-moon light and huge deep black shadow shapes.',
      texture: 'Lavish OVA cel with heavy black shading and fine gothic detail.',
      camera: 'Operatic gothic manor compositions and looming low angles on commanders.',
      mood: 'operatic gothic authority',
      render: 'Lavish gothic OVA frame with operatic crimson menace.',
      key: 'Hellsing Ultimate gothic; crimson coats; operatic menace; black shadows',
      avoid: [
        'a vampire in a red greatcoat and round orange glasses',
        'existing franchise characters',
      ],
      briefs: [
        'Standing at the head of a gothic manor staircase in a crimson greatcoat, an elderly aristocratic commander lights a cigar as moonlight and huge black shadows spill down the steps below her. No readable text or logo.',
        'In a gothic kitchen at midnight, an elderly butler with a manic grin polishes a long row of silver candlesticks while thunder shakes the windows. No readable text or logo.',
        'On the moonlit marble floor of an empty manor hall, a single crimson glove lies beside a toppled chess piece and a broken candle. No readable text or logo.',
      ],
    }),
    au('SP05-064', 'Vinland Saga WIT - Wind-Scoured Redemption Style', {
      look: 'WIT Studio Vinland Saga anime look (2019): Viking-age realism, wind-scoured fjords and farms, detailed period clothing and a redemptive arc from war to peace.',
      subject:
        'draw people with realistic Viking-age designs, weathered faces, beards, tunics and practical farm clothes.',
      color: 'Grey sea, wind-scoured green, earth brown and pale sky.',
      light: 'Cold northern daylight over fjords and warm hearth light inside longhouses.',
      texture: 'Clean detailed digital cel with painted northern landscapes.',
      camera: 'Sweeping fjord wide shots and intimate everyday farm scenes.',
      mood: 'quiet wind-scoured redemption',
      render: 'Rich WIT Studio television frame with detailed northern realism.',
      key: 'Vinland Saga anime; fjords and farms; Viking realism; redemption',
      avoid: ['a blond young warrior with twin daggers', 'existing franchise characters'],
      briefs: [
        'Plowing a stony field on a wind-scoured northern farm, a former warrior with a scarred face pauses to watch a flock of geese fly over the fjord, his hands finally steady on the plow. No readable text or logo.',
        'Two farmhands share bread on a stone wall as a storm rolls in over the sea. No readable text or logo.',
        'On a peaceful northern farm at sunrise, a broken sword has been hammered into the ground as a fence post, a sheep grazing right beside it. No readable text or logo.',
      ],
    }),
    au('SP05-065', 'Norihiro Yagi - Pale Threshold Horror Style', {
      look: 'Norihiro Yagi Claymore manga look: pale silver-eyed warrior women, huge slim claymores, medieval towns haunted by monsters, and cold clean line with horror undertones.',
      subject:
        'draw only adults with Yagi designs, pale hair, silver eyes, slim armored bodies and cloaks.',
      color: 'Pale silver, grey, cold blue and bone white.',
      light: 'Cold pale overcast light and an eerie silver glow in the eyes.',
      texture: 'Clean cold pen line with smooth grey tone and pale highlights.',
      camera: 'Stoic lone warrior compositions and sudden monster reveals in villages.',
      mood: 'pale threshold horror',
      render: 'Cold clean dark fantasy manga illustration with pale horror.',
      key: 'Norihiro Yagi pale warriors; silver eyes; cold line; monsters',
      avoid: [
        'a silver-eyed warrior woman with a huge claymore and cape',
        'existing franchise characters',
      ],
      briefs: [
        'At the gate of a fog-bound medieval village, a pale silver-eyed woman in a grey cloak waits silently while the villagers peer from their shutters, unsure whether to fear her or the thing in the forest. No readable text or logo.',
        'A pale warrior eats plain bread alone at the edge of a tavern, everyone else keeping their distance. No readable text or logo.',
        'At dawn in an empty country inn, a pale silver cloak hangs on a wooden hook while its owner’s untouched breakfast cools on the table. No readable text or logo.',
      ],
    }),
    au('SP05-067', 'Akihito Tsukushi - Lush Abyssal Toll Style', {
      look: 'Akihito Tsukushi Made in Abyss manga look: cute round simple characters in astonishingly detailed lush vertical abyss landscapes, strange creatures and a heavy toll of wonder.',
      subject:
        'draw only adults with round simple designs, big eyes and explorer gear, dwarfed by detailed landscapes.',
      color: 'Lush greens, abyssal blues, warm earth and glowing mineral light.',
      light: 'Soft glowing abyss light and filtered sunlight from above.',
      texture: 'Astonishingly detailed pen landscapes paired with simple round character line.',
      camera: 'Vertical abyss panoramas with tiny explorers on ropes and ledges.',
      mood: 'lush perilous wonder',
      render: 'Detailed lush adventure manga illustration with perilous wonder.',
      key: 'Akihito Tsukushi abyss; round simple characters; detailed landscapes; wonder',
      avoid: [
        'a robot boy with extending arms',
        'a girl in a red whistle explorer outfit',
        'existing franchise characters',
        'minors',
      ],
      briefs: [
        'Descending a rope into a vast lush chasm filled with glowing forests on floating islands, a round-faced grandmother explorer with a huge backpack gasps at a creature gliding past like a living cathedral. No readable text or logo.',
        'Two adult explorers camp on a ledge in the abyss, cooking strange mushrooms over a tiny stove. No readable text or logo.',
        'Above an endless green drop inside the abyss, a single explorer’s whistle hangs from a twisted root, swinging slowly in the rising warm wind. No readable text or logo.',
      ],
    }),
    au('SP05-068', 'Q Hayashida - Grimy Sorcery Collision Style', {
      look: 'Q Hayashida Dorohedoro manga look: grimy dirty scratchy ink, sorcerers in bizarre masks, a filthy industrial city, dark humor and chaotic violence.',
      subject:
        'draw people with Hayashida designs, stocky bodies, grimy clothing and bizarre masks of animals or objects.',
      color: 'Grimy brown, smoky grey, sickly green and rusted industrial orange.',
      light: 'Smoky dim industrial light from bare bulbs and furnace glow.',
      texture: 'Dirty scratchy ink lines, smudges and grimy layered textures.',
      camera: 'Chaotic crowded alley compositions and odd deadpan humor.',
      mood: 'grimy chaotic humor',
      render: 'Grimy scratchy dark comedy manga illustration with bizarre masks.',
      key: 'Q Hayashida grime; bizarre masks; industrial city; dark humor',
      avoid: ['a lizard-headed man', 'a mushroom-cloud mask', 'existing franchise characters'],
      briefs: [
        'Eating dumplings in a grimy industrial alley, a stocky sorcerer in a cracked porcelain rabbit mask argues with a plumber over who ruined the neighborhood’s pipes with a curse. No readable text or logo.',
        'In a smoky cramped kitchen, a couple in cracked animal masks dance slowly to a scratchy radio while a pot of stew bubbles over onto the stove. No readable text or logo.',
        'In a grimy alley between rusted pipes, a cracked porcelain mask hangs from a nail, dripping rainwater from its empty eye holes. No readable text or logo.',
      ],
    }),
    au('SP05-070', 'Devilman Crybaby Science SARU - Neon Tragic Metamorphosis', {
      look: 'Science SARU Devilman Crybaby look (2018) by Masaaki Yuasa: rubbery simple designs, neon club lights, raw emotional sprints and tragic demonic metamorphosis.',
      subject:
        'draw only adults with Yuasa-style simple elastic designs, streetwear and neon-lit expressions.',
      color: 'Neon magenta, black, electric blue and hot red.',
      light: 'Pulsing neon club light, strobes and harsh white flashes.',
      texture: 'Flat color fills, loose sketchy lines and rubbery elastic motion.',
      camera: 'Raw sprints, neon club crowds and tragic close-ups.',
      mood: 'raw tragic neon',
      render: 'Raw neon Science SARU frame with elastic tragic energy.',
      key: 'Devilman Crybaby neon; Yuasa elasticity; tragic metamorphosis',
      avoid: [
        'a demon hero with bat wings and horns',
        'a blond man in a white coat',
        'existing franchise characters',
      ],
      briefs: [
        'Sprinting through a neon-lit club crowd with tears streaming down his face, a sensitive track runner feels his body stretch and change as the lights strobe magenta and blue around him. No readable text or logo.',
        'A group of rappers perform on a rooftop while a demonic shape looms in the neon smoke behind them. No readable text or logo.',
        'Outside a neon club at three in the morning, a single running shoe lies in a magenta puddle while the bass still thumps through the wall. No readable text or logo.',
      ],
    }),
  ]),
};

export default spec;
