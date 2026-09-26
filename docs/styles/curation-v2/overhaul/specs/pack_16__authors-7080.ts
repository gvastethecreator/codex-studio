import type { Spec } from '../tools/apply';
import { au } from './_authors';

// 70s and 80s retro anime, author pass: each preset names its creator, designer or series and the
// concrete look of that era's hand-painted cels. SP16-001 is an intentional-v1 neutral cel study
// and stays author-free. Works that repeat elsewhere are split by adaptation.
const cel80 =
  'Hand-painted analog cel on painted poster-color backgrounds, visible cel edges, dust and gentle film grain.';

const spec: Spec = {
  pack: 'pack_16',
  category: '1. 70s & 80s Retro Anime',
  updates: Object.fromEntries([
    au('SP05-001', 'Osamu Tezuka - Retro Pioneer Hero', {
      look: 'Osamu Tezuka and Mushi Production 1960s television animation: rubbery round cartoon figures with huge simple eyes, bulbous noses and limited animation, heroic space-age adventure on flat painted skies.',
      subject:
        'draw people with Tezuka roundness, big shiny eyes, rubber-hose limbs, simple hands and expressive cartoon faces.',
      color:
        'Early color television palette: primary red, sky blue, warm yellow and cream, slightly faded.',
      light: 'Flat even light with simple single-tone cel shadows and occasional speed-line glows.',
      texture:
        'Thick soft ink outlines, flat cel paint, grainy 16mm film softness and slight color bleed.',
      camera:
        'Simple staged compositions, heroic poses against sky, pans over static painted backgrounds.',
      mood: 'optimistic pioneering adventure',
      render: 'Charming early television cel frame with limited-animation economy and warmth.',
      key: 'Osamu Tezuka roundness; big simple eyes; limited animation; flat painted skies; early TV color',
    }),
    au('SP05-311', 'Future Boy Conan - Rusted Eco Hope', {
      look: 'Hayao Miyazaki television animation as in Future Boy Conan (1978): simple bouncy character designs, rusted post-apocalyptic machines, sunlit islands and sea, and elastic action.',
      subject:
        'draw people with early Miyazaki designs, round faces, dot eyes, sturdy bodies and exaggerated elastic running and leaping.',
      color: 'Sea blue, island green, rust orange and warm sunlit cream.',
      light: 'Bright outdoor daylight with simple cel shadows and sparkling sea.',
      texture: cel80,
      camera: 'Wide seaside vistas, dynamic chases across machines and cliffs.',
      mood: 'hopeful rugged adventure',
      render: 'Lively 1978 hand-drawn television frame with energetic acting.',
      key: 'Early Miyazaki TV; rusted machines; island sea; elastic action; round faces',
    }),
    au('SP05-003', 'Lupin III - Jazzy Rogue Heist Rhythm', {
      look: 'Monkey Punch and Yasuo Otsuka era Lupin III television animation (1971-1980): lanky long-legged caricature figures, loose sketchy lines, jazzy caper staging and vintage cars in European cities.',
      subject:
        'draw people as lanky caricatures with long thin legs, narrow waists, angular faces, sly grins and slim suits.',
      color: 'Muted seventies palette, mustard, teal, burgundy and warm night browns.',
      light: 'Simple cel light with moody night streetlamps and spotlight searchlights.',
      texture: cel80,
      camera: 'Playful caper staging, rooftop chases, cars skidding through narrow streets.',
      mood: 'cool jazzy mischief',
      render: 'Loose stylish 1970s television frame with caricature swagger.',
      key: 'Monkey Punch lanky caricature; jazz caper; vintage cars; sketchy seventies cel',
      avoid: [
        'a thief in a red or green jacket with a narrow tie',
        'a bearded gunman in a fedora',
        'existing franchise characters',
      ],
    }),
    au('SP05-004', 'Rintaro - Melancholy Astral Opera', {
      look: 'Rintaro late-seventies and eighties feature direction: operatic space melancholy, backlit glowing cel effects, long elegant figures, starfields and grand tragic staging.',
      subject:
        'draw people with slender elegant figures, long hair and coats, sad luminous eyes and graceful poses.',
      color: 'Deep violet space, nebula magenta, gold glow and cold blue shadow.',
      light: 'Backlit cel glow effects, starlight halos and dramatic rim light.',
      texture: cel80,
      camera: 'Grand theatrical wides, silhouettes against nebulae, slow dramatic push-ins.',
      mood: 'operatic cosmic melancholy',
      render: 'Lush 1980s theatrical cel frame with glowing backlit effects.',
      key: 'Rintaro opera; backlit glow; nebula violet; elegant sad figures; theatrical staging',
    }),
    au('SP05-008', 'Mamoru Oshii - Neon Procedural Irony', {
      look: 'Mamoru Oshii late-eighties direction: deadpan procedural scenes in bureaucratic spaces, long static shots, basset hounds and fish in unexpected places, neon cities reflected in water.',
      subject:
        'draw people with realistic understated designs, tired faces, uniforms and suits, standing still in long pauses.',
      color: 'Neon cyan and magenta over drab office greys and deep water blues.',
      light: 'Fluorescent office light, neon reflections and dim canal glow.',
      texture: cel80,
      camera: 'Long static wide shots, symmetrical corridors, reflections and repeated desks.',
      mood: 'dry philosophical irony',
      render: 'Measured late-1980s cel frame with deliberate stillness and detail.',
      key: 'Mamoru Oshii stillness; bureaucratic spaces; neon reflections; deadpan irony',
    }),
    au('SP05-009', 'Koji Morimoto - Hyper-Dense Cyber-Retro Infrastructure', {
      look: 'Koji Morimoto and Studio 4°C late-eighties OVA look: hyper-dense hand-drawn machinery, tangled pipes, cables and signs, rough energetic lines and retro-future cities.',
      subject:
        'draw people with loose energetic Morimoto designs, wiry figures, scruffy hair and industrial clothes dwarfed by machinery.',
      color: 'Rust, sodium orange, grimy teal and deep shadow blue.',
      light: 'Smoky industrial light, sodium lamps and exhaust-lit haze.',
      texture: 'Hand-drawn dense line detail, painted cel grime, smoke and cable tangles.',
      camera: 'Vertical canyon compositions, speeding bikes through machinery, fisheye moments.',
      mood: 'restless industrial energy',
      render: 'Obsessively detailed hand-drawn OVA frame with rough energetic lines.',
      key: 'Koji Morimoto density; pipes and cables; retro-future city; rough lines; smoky haze',
    }),
    au('SP05-010', 'Akira Toriyama - Round Adventure Slapstick', {
      look: 'Akira Toriyama early Dragon Ball manga and 1986 anime look: round clean shapes, cute chunky characters, rounded vehicles and capsule machines, desert adventures and slapstick martial arts.',
      subject:
        'draw people with Toriyama round chunky designs, big feet, simple clean lines, spiky or bowl hair and cheerful slapstick expressions.',
      color: 'Bright primaries, desert tan, sky blue and orange accents.',
      light: 'Sunny clean daylight with simple one-tone cel shadows under figures.',
      texture: 'Clean crisp lines, flat cel color, rounded mechanical design details.',
      camera: 'Playful dynamic action framing, wide deserts and cartoon chase shots.',
      mood: 'playful goofy adventure',
      render: 'Crisp 1980s television frame with Toriyama clean design clarity.',
      key: 'Akira Toriyama roundness; chunky machines; slapstick martial arts; clean lines',
      avoid: [
        'a spiky-haired boy with a monkey tail and power pole',
        'a flying orange cloud',
        'dragon balls with stars',
        'existing franchise characters',
      ],
    }),
    au('SP05-301', 'Space Battleship Yamato - Analog Space Opera Command', {
      look: 'Leiji Matsumoto designed Space Battleship Yamato (1974): massive naval battleships in space drawn with dense mechanical detail, stern commanders on dim bridges, and heroic sacrifice.',
      subject:
        'draw people with Leiji designs, long faces, narrow eyes, stern expressions and military uniforms with high collars.',
      color: 'Deep space black-blue, battleship rust red, steel grey and orange beam light.',
      light: 'Dim bridge instrument glow, beam flashes and explosions lighting hulls.',
      texture: cel80,
      camera:
        'Low angles of colossal ships, bridge silhouettes against viewports, fleet formations.',
      mood: 'solemn heroic resolve',
      render: 'Classic 1970s space opera television frame with detailed mechanical painting.',
      key: 'Leiji Matsumoto battleships; stern commanders; bridge glow; space naval opera',
      avoid: [
        'a red-hulled battleship with a wave motion gun',
        'existing franchise characters',
        'series logo or title lettering',
      ],
    }),
    au('SP05-302', 'Captain Harlock - Melancholic Space Corsair', {
      look: 'Leiji Matsumoto Captain Harlock look (1978): gothic space pirate galleons, skull motifs, long capes in star wind, gaunt romantic faces and melancholy heroism.',
      subject:
        'draw people with gaunt elongated Leiji faces, long hair, sorrowful eyes and flowing capes and boots.',
      color: 'Deep space indigo, bone white, blood red and green instrument glow.',
      light: 'Dim cabin glow, starfield backlight and dramatic silhouettes against the void.',
      texture: cel80,
      camera: 'Heroic silhouettes at ship prows, sweeping capes, galleons against stars.',
      mood: 'romantic melancholy defiance',
      render: 'Moody 1978 hand-painted television frame with gothic romance.',
      key: 'Leiji gothic corsairs; flowing capes; gaunt faces; skull motifs; starfield',
      avoid: [
        'a scarred eyepatched captain',
        'a skull-and-crossbones pirate flag with the series crest',
        'existing franchise characters',
      ],
    }),
    au('SP05-303', 'Galaxy Express 999 - Celestial Journey Melancholy', {
      look: 'Leiji Matsumoto Galaxy Express 999 look as in the Rintaro film: steam trains crossing starry space, retro-future stations, tall elegant women, stubby comic men and melancholy journeys.',
      subject:
        'draw people with Leiji contrast, tall elegant long-lashed figures beside short stubby round-faced men, in coats and hats.',
      color: 'Star-black, warm cabin amber, pale blue starlight and rich velvet red.',
      light: 'Warm lamp-lit carriages glowing against the glittering starry darkness outside.',
      texture: cel80,
      camera: 'Train crossing starfields in silhouette, window framing, lonely stations.',
      mood: 'wistful cosmic melancholy',
      render: 'Rich 1979 theatrical cel frame with glowing starlight.',
      key: 'Leiji contrast designs; space steam train; lamp-lit carriages; starry melancholy',
      avoid: ['a tall blonde woman in a black fur hat and coat', 'existing franchise characters'],
    }),
    au('SP05-304', 'Rose of Versailles - Baroque Insurgent Melodrama', {
      look: 'Osamu Dezaki and Shingo Araki anime of Rose of Versailles (1979): baroque shojo melodrama, sparkling long-lashed eyes, flowing golden hair, roses and pastel freeze-frame postcard shots.',
      subject:
        'draw people with Araki and Himeno designs, long lashes, sparkling eyes, flowing hair, military uniforms and gowns.',
      color: 'Rose pink, gold, royal blue, cream and deep crimson.',
      light: 'Soft glowing highlights, sparkle flares and dramatic backlight.',
      texture: 'Hand-painted cels, pastel chalk-like postcard freeze frames and petal effects.',
      camera: 'Split screens, triple-take zooms, freeze frames as painted postcards.',
      mood: 'passionate tragic romance',
      render: 'Lush 1979 Dezaki television frame with painterly freeze frames.',
      key: 'Dezaki postcard freeze; Araki sparkle eyes; roses; baroque uniforms; melodrama',
    }),
    au('SP05-305', 'Urusei Yatsura - Neon Sci-Fi Slapstick Rom-Com', {
      look: 'Rumiko Takahashi Urusei Yatsura anime (1981): bouncy eighties rom-com cel, pastel suburban Tokyo, aliens and folklore spirits, big comic expressions and slapstick chases.',
      subject:
        'draw people with Takahashi rounded faces, large simple eyes, springy hair and exaggerated comic reactions.',
      color: 'Pastel candy colors, sky blue, lime green and electric yellow.',
      light: 'Bright suburban daylight and electric sparkling comedy flashes.',
      texture: cel80,
      camera: 'Energetic chase framing, comedic crowd shots, sudden close-up reactions.',
      mood: 'chaotic lovesick comedy',
      render: 'Cheerful 1980s television cel frame with springy comic timing.',
      key: 'Rumiko Takahashi rom-com; pastel suburb; aliens and spirits; slapstick chases',
      avoid: [
        'a green-haired oni girl in a tiger-striped bikini with horns',
        'existing franchise characters',
      ],
    }),
    au('SP05-306', 'Maison Ikkoku - Adult Domestic Warmth', {
      look: 'Rumiko Takahashi Maison Ikkoku anime (1986): gentle adult romance in an old wooden boarding house, soft Akemi Takada designs, sunset town streets and everyday domestic detail.',
      subject:
        'draw adults with soft Takada designs, gentle eyes, natural hair and everyday eighties clothes and aprons.',
      color: 'Warm sunset orange, faded wood browns, soft greens and cream.',
      light: 'Sunset light through windows, warm kitchen lamps and evening shadows.',
      texture: cel80,
      camera: 'Domestic interiors, porch conversations and quiet townscape wides at dusk.',
      mood: 'tender adult warmth',
      render: 'Gentle 1980s television cel frame with lived-in detail.',
      key: 'Maison Ikkoku warmth; Takada designs; boarding house; sunset town; everyday detail',
    }),
    au('SP05-307', 'Mitsuru Adachi - Summer Sports Melodrama', {
      look: 'Mitsuru Adachi manga and anime look as in Touch: clean minimal lines, similar gentle faces, quiet summer towns, baseball diamonds and understatement where silence carries emotion.',
      subject:
        'draw people with Adachi designs, simple clean faces, small dot eyes, gentle smiles and sports uniforms.',
      color: 'Summer blue, field green, dusty brown diamond and cream.',
      light: 'Bright summer sun with soft cel shadows and heat haze.',
      texture: 'Clean minimal lines, sparse detail, empty skies and cicada-heavy stillness.',
      camera: 'Empty sky cutaways, quiet framing of objects, wide fields with small figures.',
      mood: 'understated summer melancholy',
      render: 'Understated 1980s cel frame with calm minimal line work.',
      key: 'Mitsuru Adachi minimalism; empty skies; summer baseball; gentle faces; silence',
    }),
    au('SP05-308', 'City Hunter - Eighties Neon Precision Noir', {
      look: 'Tsukasa Hojo City Hunter anime (1987): realistic tall handsome designs, eighties Shinjuku neon, city pop glamour, sharp gunplay and slapstick breaks.',
      subject:
        'draw people with Hojo realism, tall athletic bodies, sharp handsome faces, big eighties hair and suits.',
      color: 'Neon pink and cyan, night navy, chrome and warm skin tones.',
      light: 'Neon night light, car headlights and reflections on glass towers.',
      texture: cel80,
      camera: 'Low angles under skyscrapers, car-side shots, gun-draw close-ups.',
      mood: 'cool urban swagger',
      render: 'Stylish 1980s city-pop television frame with neon glamour.',
      key: 'Tsukasa Hojo realism; eighties Shinjuku neon; city pop glamour; sharp designs',
      avoid: ['a red hatchback with a partner in a mallet gag', 'existing franchise characters'],
    }),
    au('SP05-309', 'Dirty Pair - Explosive Space Glam Action', {
      look: 'Dirty Pair eighties anime look with Tsuneo Tominaga designs: glamorous space agents, big hair, shiny costumes, neon sci-fi cities and cartoonish explosions.',
      subject:
        'draw people with glamorous eighties designs, big voluminous hair, long legs, bright costumes and confident poses.',
      color: 'Hot pink, cyan, gold and deep space navy.',
      light: 'Explosion flares, neon glow and glossy highlights on costumes.',
      texture: cel80,
      camera: 'Action poses with explosions behind, dynamic chases, low heroic angles.',
      mood: 'glamorous chaotic action',
      render: 'Glossy eighties sci-fi television frame with bold highlights.',
      key: 'Eighties space glamour; big hair; neon sci-fi; cartoon explosions; shiny costumes',
    }),
    au('SP05-310', 'Crusher Joe - Competent Space Pulp', {
      look: 'Yoshikazu Yasuhiko designs as in Crusher Joe (1983): expressive realistic pencil-like drawing, loose soft line quality, grounded space pulp crews and lived-in ships.',
      subject:
        'draw people with Yasuhiko warmth, expressive faces, soft lines, freckles, practical flight suits and rolled sleeves.',
      color: 'Orange flight suits, space navy, olive and warm ship interiors.',
      light: 'Warm cockpit glow, cold starlight and bright engine flares on hulls.',
      texture: 'Soft pencil-like lines on cel, painted ship interiors and grime.',
      camera: 'Crew shots in cramped cockpits, ship fly-bys, dynamic action.',
      mood: 'capable pulpy camaraderie',
      render: 'Warm 1983 theatrical cel frame with Yasuhiko expressiveness.',
      key: 'Yoshikazu Yasuhiko expressiveness; space pulp crew; lived-in ships; soft lines',
    }),
    au('SP05-312', "Cat's Eye - Elegant Eighties Heist Glam", {
      look: "Tsukasa Hojo Cat's Eye anime (1983): elegant eighties heist glamour, graceful leotard acrobatics, art galleries at night and romantic pastel city pop.",
      subject:
        'draw people with Hojo elegance, long legs, big eighties hair, graceful acrobatic poses and sleek outfits.',
      color: 'Night navy, moonlight cyan, pastel pink and gold.',
      light: 'Moonlight through skylights, laser beams and gallery spotlights.',
      texture: cel80,
      camera: 'Acrobatic silhouettes against moons, gallery interiors, rooftop leaps.',
      mood: 'elegant romantic intrigue',
      render: 'Glamorous 1980s city-pop television frame with graceful motion.',
      key: 'Tsukasa Hojo elegance; night gallery heists; moonlight; city pop glamour',
      avoid: [
        'three sisters in matching leotards',
        'a cat-eye calling card',
        'existing franchise characters',
      ],
    }),
    au('SP05-313', 'Saint Seiya - Zodiac Cosmic Heroism', {
      look: 'Shingo Araki and Michi Himeno designs as in the Saint Seiya anime (1986): sparkling sharp-eyed heroes, shining metal armor with gold highlights, cosmic aura backgrounds and dramatic Araki close-ups.',
      subject:
        'draw people with Araki designs, sharp angular faces, fine flowing hair, glossy armor and dramatic heroic poses.',
      color: 'Gold, bronze, deep cosmic blue and aura violet.',
      light: 'Cosmic aura glows, star sparkles and gleaming armor highlights.',
      texture: cel80,
      camera: 'Dramatic close-ups, power poses with constellations behind, clashes.',
      mood: 'fervent cosmic heroism',
      render: 'Dramatic 1980s television frame with Araki shine and sparkle.',
      key: 'Shingo Araki faces; gleaming armor; cosmic aura; dramatic close-ups',
      avoid: ['bronze constellation cloth armor of named saints', 'existing franchise characters'],
    }),
    au('SP05-317', 'Hiroyuki Kitakubo - Arcade Techno-Rebellion', {
      look: 'Hiroyuki Kitakubo late-eighties and early-nineties OVA look as in Roujin Z and Black Magic M-66: rubbery expressive character acting, dense hand-drawn machinery and anarchic hacker techno energy.',
      subject:
        'draw people with Kitakubo designs, rubbery expressive faces, wiry energetic bodies and scruffy casual clothes around dense machines.',
      color: 'Arcade neon, electric purple, cyan and hot red on night black.',
      light: 'CRT screen glow, neon signage and streaking headlights on wet streets.',
      texture: cel80,
      camera:
        'Detailed mechanical close-ups, wild chases and crowded arcade and hospital interiors.',
      mood: 'rebellious techno mischief',
      render: 'Energetic hand-drawn OVA frame with dense mechanical invention and rubbery acting.',
      key: 'Hiroyuki Kitakubo acting; dense machinery; hacker mischief; arcade neon',
    }),
    au('SP05-320', 'Space Adventure Cobra - Charismatic Space Rogue Pulp', {
      look: 'Buichi Terasawa designs directed by Osamu Dezaki in Space Adventure Cobra (1982): sexy pulp space opera, heavy shading, glossy bodies, psychedelic space backdrops and Dezaki freeze frames.',
      subject:
        'draw people with Terasawa designs, muscular heroic bodies, glossy shading, smirks and pulp costumes.',
      color: 'Neon space purple, gold, red and glossy chrome.',
      light: 'Harsh highlights, psychedelic backlight and glowing space nebulae.',
      texture: 'Hand-painted cels with glossy highlights and Dezaki pastel freeze frames.',
      camera: 'Split screens, triple-take zooms and freeze-frame pastel postcards at key moments.',
      mood: 'swaggering pulp adventure',
      render: 'Stylish 1982 hand-painted frame with Dezaki postcard effects.',
      key: 'Buichi Terasawa designs; Dezaki freeze frames; psychedelic space; pulp glamour',
      avoid: ['a red-suited hero with a psychogun arm', 'existing franchise characters'],
    }),
    au('SP05-315', 'Zeta Gundam - Angular Institutional Tragedy', {
      look: 'Yoshikazu Yasuhiko designed Zeta Gundam (1985): angular mobile suits, colony interiors and military institutions, realistic soldiers in tragedy, sharp mid-eighties cel.',
      subject:
        'draw people with Yasuhiko designs, realistic proportions, expressive soft lines, flight suits and military uniforms.',
      color: 'Military blue, white, colony green and warning red.',
      light: 'Artificial colony light, cockpit monitors and beam flashes.',
      texture: cel80,
      camera: 'Huge colony cylinder vistas, institutional courtyards and tight cockpit close-ups.',
      mood: 'tragic institutional pressure',
      render: 'Serious mid-1980s television frame with detailed real-robot mechanical design.',
      key: 'Yasuhiko designs; colony interiors; real robots; military tragedy',
      avoid: ['white mobile suits with V-fin antennas', 'existing franchise characters'],
    }),
    au('SP05-002', 'Go Nagai - Vintage Mechanical Grandeur', {
      look: 'Go Nagai and Toei 1970s super robot animation as in Mazinger Z: colossal heroic robots with bold simple shapes, thick outlines, primary colors and fierce hot-blooded pilots.',
      subject:
        'draw people with Nagai designs, angular fierce faces, thick eyebrows, big determined eyes and seventies pilot suits.',
      color: 'Primary red, blue, yellow and steel grey against dramatic skies.',
      light: 'Flat seventies cel light with glowing beam attacks.',
      texture: cel80,
      camera: 'Low heroic angles of giant robots, poses against sunsets.',
      mood: 'bombastic heroic grandeur',
      render: 'Bold 1970s television frame with thick outlines and simple shapes.',
      key: 'Go Nagai super robots; thick outlines; primary colors; hot-blooded poses',
      avoid: [
        'a black-and-red super robot with a flying pilder cockpit',
        'existing franchise characters',
      ],
    }),
    au('SP05-005', 'Mobile Suit Gundam 0079 - Grounded Tactical Machinery', {
      look: 'Yoshikazu Yasuhiko and Kunio Okawara look of Mobile Suit Gundam (1979): real-robot military machines, soldiers with expressive faces, muddy battlefields and colonies.',
      subject:
        'draw people with Yasuhiko designs, expressive soft faces, realistic uniforms, and machines as industrial military hardware.',
      color: 'Olive drab, military grey, mud brown and hazard red.',
      light: 'Cold dawn light, beam rifle flashes and green cockpit monitor glow.',
      texture: cel80,
      camera: 'Squad shots in forests, cockpit views, machines crouching in mud.',
      mood: 'grounded war weariness',
      render: 'Classic 1979 real-robot television frame with military grit.',
      key: 'Yasuhiko and Okawara real robots; soldiers; mud; military hardware',
      avoid: [
        'white and blue mobile suits with V-fin antennas',
        'a mono-eyed green enemy mobile suit',
        'existing franchise characters',
      ],
    }),
    au('SP05-006', 'Macross - Pop Transformable Aerial Spectacle', {
      look: 'Haruhiko Mikimoto designs and Ichiro Itano missile circus as in Super Dimension Fortress Macross (1982): transforming jet fighters, idol singers, swirling missile trails and eighties pop.',
      subject:
        'draw people with Mikimoto designs, glossy big eyes with many highlights, feathered eighties hair and flight suits or idol outfits.',
      color: 'Sky blue, white contrails, pop pink and jet grey.',
      light: 'Bright sky light, missile exhaust glow and stage spotlights.',
      texture: cel80,
      camera: 'Spiraling missile circus shots, cockpit views, transformation mid-dive.',
      mood: 'soaring pop spectacle',
      render: 'Dynamic 1980s television frame with Itano circus motion.',
      key: 'Mikimoto eyes; Itano missile circus; transforming jets; idol pop',
      avoid: ['VF-1 fighter markings', 'existing franchise characters'],
    }),
    au('SP05-314', 'Gunbuster Finale - Monumental Formation Sacrifice', {
      look: 'Hideaki Anno Gunbuster finale look (1988): black-and-white widescreen space opera, huge fleets in formation, stark silhouettes and tearful close-ups under enormous stakes.',
      subject:
        'draw people with Mikimoto-derived designs, big glossy eyes, determined faces and flight suits, shown in monochrome.',
      color: 'Black and white only, with grey tones and bright white glare.',
      light: 'Stark high-contrast white glare against pure black space.',
      texture: 'Monochrome cel, film grain and letterboxed widescreen composition.',
      camera: 'Letterboxed widescreen formations, tiny figures on bridges, monumental silhouettes.',
      mood: 'monumental tearful sacrifice',
      render: 'Stark monochrome 1988 OVA frame in widescreen letterbox.',
      key: 'Anno monochrome finale; widescreen fleets; stark silhouettes; tearful sacrifice',
    }),
    au('SP05-316', 'Aura Battler Dunbine - Biomorphic Mist Ritual', {
      look: 'Yoshiyuki Tomino Aura Battler Dunbine look (1983): insect-like organic mecha, misty medieval fantasy world, fairy creatures and eighties Sunrise cel.',
      subject:
        'draw people with eighties Sunrise designs, soft faces, medieval armor and cloaks, beside insectoid machines.',
      color: 'Mist green, violet, earth brown and pearl white.',
      light: 'Misty diffused light, glowing aura and dusky fantasy skies.',
      texture: cel80,
      camera: 'Wide misty landscapes, insect mecha silhouettes, rituals by lakes.',
      mood: 'strange mystic fantasy',
      render: 'Eerie 1983 television frame with organic mecha detail.',
      key: 'Dunbine insect mecha; misty fantasy realm; fairies; eighties Sunrise cel',
    }),
    au('SP05-318', 'Devilman 1972 - Psychedelic Demonic Horror', {
      look: 'Go Nagai Devilman Toei television look (1972): thick crude outlines, grotesque demons, psychedelic color flashes and seventies horror pulp.',
      subject:
        'draw people with Nagai seventies designs, thick eyebrows, angular faces and monstrous transformations.',
      color: 'Psychedelic magenta, acid green, blood red and black.',
      light: 'Lurid colored flashes cutting through deep black shadow masses.',
      texture: cel80,
      camera: 'Low angles on demons, shocking zooms, warped horror framing.',
      mood: 'lurid demonic horror',
      render: 'Raw 1970s television frame with psychedelic horror color.',
      key: 'Go Nagai demons; thick crude outlines; psychedelic flashes; seventies horror',
      avoid: ['a winged devil hero with a black and white body', 'existing franchise characters'],
    }),
    au('SP05-007', 'Fist of the North Star - Wasteland Impact Legend', {
      look: 'Tetsuo Hara Fist of the North Star look (1984): hyper-muscular heroes, detailed hatched anatomy, post-apocalyptic wastelands, punk raiders and exploding impact.',
      subject:
        'draw people with Hara designs, massive muscles, hatched anatomy, square jaws and torn clothing.',
      color: 'Desert ochre, blood orange sky, leather black and steel grey.',
      light: 'Harsh wasteland sun and dramatic backlight with impact flashes.',
      texture: 'Hatched anatomy lines, painted cels, dust clouds and impact radiance.',
      camera: 'Low angles on massive figures, impact freeze frames, wasteland wides.',
      mood: 'stoic brutal legend',
      render: 'Powerful 1984 television frame with Hara muscular detail.',
      key: 'Tetsuo Hara muscles; hatched anatomy; wasteland punks; impact flashes',
      avoid: ['a hero with seven scars on his chest', 'existing franchise characters'],
    }),
    au('SP05-319', 'Legend of the Galactic Heroes - Strategic Pop Duality', {
      look: 'Legend of the Galactic Heroes OVA look (1988): classical-music space opera, rival commanders in black and white uniforms, fleets as geometric formations and theatrical political drama.',
      subject:
        'draw people with elegant eighties OVA designs, refined faces, long hair and crisp military uniforms and capes.',
      color: 'Imperial black and silver, alliance green, gold and deep space navy.',
      light: 'Grand hall light, bridge glow and fleet beam flashes.',
      texture: cel80,
      camera: 'Formal compositions of commanders, grand fleets, chessboard-like battle maps.',
      mood: 'grand strategic drama',
      render: 'Refined 1980s OVA frame with classical grandeur and formal symmetry.',
      key: 'Galactic Heroes grandeur; rival commanders; fleet formations; classical space opera',
    }),
  ]),
};

export default spec;
