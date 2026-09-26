import type { Spec } from '../tools/apply';
import { dna } from './_strict';
import { au } from './_authors';

// Core anime, author pass: each preset names the creator, studio or series whose style it follows
// and describes the concrete marks of that style. Briefs stay original and avoid signature heroes,
// weapons, creatures or vehicles.
const tv =
  'Contemporary digital television cel with clean outlines, crisp highlights and composited painted backgrounds.';

const spec: Spec = {
  pack: 'pack_13',
  category: '1. Core Anime',
  updates: {
    'SP13-052': {
      name: 'Kentaro Miura - Cursed Blade Dark Fantasy',
      dna: dna({
        aesthetic:
          'Kentaro Miura manga style: obsessive engraving-like crosshatching, monumental dark fantasy compositions, heavily worn plate armor and grotesque demonic anatomy drawn with baroque detail under apocalyptic storm skies.',
        subject_treatment:
          'Preserve the requested identity, count, pose, action and any requested clothing; give figures weighty muscular anatomy, scarred faces, battered armor and cloth rendered stroke by stroke, never a lone black-armored swordsman with a slab-like greatsword. Wardrobe details apply only when the prompt leaves clothing open.',
        color_and_tone:
          'Near-monochrome ink blacks and bone greys with sparing dried-blood red and cold storm blue.',
        lighting_and_shadow:
          'Harsh storm light cutting out silhouettes, dense hatched shadows swallowing half of every form.',
        texture_and_material:
          'Dense pen crosshatching, stippled grime, scratched metal, torn leather, rain streaks drawn as fine lines.',
        camera_and_composition:
          'Low monumental angles and sweeping double-page panoramas where tiny figures face colossal horrors.',
        atmosphere_and_mood:
          'Keep the requested mood with grim defiant endurance against overwhelming darkness.',
        rendering_and_quality:
          'Meticulous hand-inked manga illustration with painterly-level detail density, no digital smoothness.',
        key_features:
          'Kentaro Miura crosshatching; monumental dark fantasy; grotesque demons; battered armor; storm skies',
      }),
      avoid: [
        'a lone black-armored swordsman with an oversized slab greatsword',
        'iron prosthetic arm with a built-in cannon',
        'existing franchise characters',
      ],
      briefs: [
        'Kneeling in a flooded cathedral, a scarred female knight in fluted plate raises a lantern as hundreds of eyes open in the flesh-covered walls around her. No readable text or logo.',
        'Refusing to be sheathed, a haunted halberd drags its exhausted wielder through a tavern door in search of another fight. No readable text or logo.',
        'At the gate of a plague castle, a hooded pilgrim in patched mail waits as the cracks in her gauntlet glow red with each heartbeat. No readable text or logo.',
      ],
    },
    ...Object.fromEntries([
      au('SP13-001', 'Moribito Production I.G - Cel Heroic Dawn', {
        look: 'Production I.G Moribito: Guardian of the Spirit look (2007) by Kenji Kamiyama: grounded realistic fantasy, weathered spear-wielding heroes, lush painted Asian-inspired landscapes and precise martial choreography.',
        subject:
          'draw people with realistic grounded designs, weathered adult faces, practical traveling clothes and accurate martial stances.',
        color:
          'Earthy greens, dawn gold, weathered brown and soft sky blue across wide painted landscapes.',
        light:
          'Natural dawn light spilling over ridges, soft realistic shadows and warm rim light on figures.',
        texture: tv,
        camera:
          'Wide cinematic landscape shots with small heroic figures, then grounded martial close-ups.',
        mood: 'quiet grounded heroism',
        render: 'Grounded cinematic Production I.G television frame with realistic fantasy detail.',
        key: 'Moribito realism; painted landscapes; weathered heroes; martial choreography',
        avoid: [
          'a spear-wielding bodyguard woman in a blue traveling cloak',
          'existing franchise characters',
        ],
      }),
      au('SP13-002', 'Akudama Drive Pierrot - Neon City Vigil', {
        look: 'Studio Pierrot Akudama Drive look (2020) with Rui Komatsuzaki designs: hyper-stylized neon cyberpunk Kansai, bold graphic outlines, candy neon signage and flamboyant criminal archetypes.',
        subject:
          'draw people with Komatsuzaki designs, bold graphic silhouettes, striking hair colors and flamboyant streetwear with tech details.',
        color:
          'Candy neon pink, electric cyan, acid yellow and deep night black across the whole city.',
        light: 'Saturated neon signage light, holographic glow and hard graphic shadows at night.',
        texture:
          'Bold graphic outlines, flat saturated color blocks and sharp neon glow effects on every surface.',
        camera:
          'Graphic dramatic angles through neon alleys, with stylized poses framed by signage.',
        mood: 'stylish neon tension',
        render:
          'Hyper-stylized neon cyberpunk television frame with bold graphic design and saturation.',
        key: 'Akudama Drive neon; Komatsuzaki designs; graphic outlines; cyberpunk Kansai',
      }),
      au('SP13-004', 'Gundam Unicorn Sunrise - Mecha Hangar Ignition', {
        look: 'Sunrise Mobile Suit Gundam Unicorn OVA look (2010): meticulously detailed hand-drawn mobile suits, cathedral-like hangars, glowing frame light and cinematic mecha grandeur.',
        subject:
          'draw people with Yasuhiko-derived designs, serious faces, pilot suits and crew uniforms dwarfed by detailed machines.',
        color: 'Hangar steel grey, white armor plates, teal frame glow and warning yellow stripes.',
        light:
          'Dramatic hangar floodlights cutting through steam haze and teal glowing frame light.',
        texture:
          'Meticulously hand-drawn mechanical detail with glossy panel highlights and soft grain.',
        camera: 'Low monumental angles of giant robots in hangars and slow cinematic reveals.',
        mood: 'awe-struck mechanical grandeur',
        render:
          'Lavish 2010 OVA frame with meticulous hand-drawn mecha detail and cinematic lighting.',
        key: 'Unicorn mecha detail; cathedral hangars; glowing frame light; cinematic grandeur',
        avoid: [
          'a white mobile suit with a single horn that splits into a V-fin',
          'existing franchise characters',
        ],
      }),
      au('SP13-006', 'Isao Takahata Kaguya - Spirit Shrine Twilight', {
        look: 'Isao Takahata The Tale of the Princess Kaguya look (2013): charcoal-sketch lines and delicate watercolor washes, empty paper space, and figures that dissolve into loose strokes when emotion peaks.',
        subject:
          'draw people with loose charcoal contours, simple gentle faces and watercolor-washed clothing, leaving much of each figure unfinished.',
        color: 'Pale watercolor washes of moss green, dusk rose and ink grey on warm white paper.',
        light:
          'Soft twilight suggested only by pale washes and the glow of untouched paper around figures.',
        texture: 'Charcoal and brush sketch lines, watercolor bleed and visible warm paper grain.',
        camera: 'Airy compositions with wide empty paper space around figures and spirits.',
        mood: 'fragile tender reverence',
        render:
          'Delicate hand-drawn feature frame that looks sketched and washed directly on paper.',
        key: 'Takahata charcoal line; watercolor wash; empty paper; dissolving strokes',
      }),
      au('SP13-007', 'Yoichi Takahashi - Sports Climax Arena', {
        look: 'Yoichi Takahashi Captain Tsubasa look: impossibly long football fields, dramatic extreme-perspective kicks and dives, flying sweat and eighties shonen sports melodrama.',
        subject:
          'draw people with Takahashi designs, lean athletic bodies, large determined eyes, flowing hair and classic football kits.',
        color:
          'Grass green, sky blue, crisp kit white and bright sunset orange across the stadium.',
        light:
          'Strong stadium sunlight and dramatic backlight burning behind players at the climax moment.',
        texture: 'Clean manga-derived line with speed lines, flying sweat droplets and torn grass.',
        camera:
          'Extreme perspective with the ball filling the frame and endless curving fields behind.',
        mood: 'soaring match-point drama',
        render:
          'Dramatic sports manga-style frame with exaggerated perspective and eighties melodrama.',
        key: 'Captain Tsubasa perspective; flying sweat; endless fields; climax kicks',
        avoid: ['a number ten football captain in a white kit', 'existing franchise characters'],
      }),
      au('SP13-008', 'Matsuri Hino - Gothic Vampire Manor', {
        look: 'Matsuri Hino Vampire Knight look: gothic shojo romance, pale elegant vampires with long lashes, crimson eyes, roses, lace and moonlit academy architecture.',
        subject:
          'draw people with Hino designs, pale elegant faces, long lashes, crimson eyes and gothic formal clothing trimmed with lace.',
        color: 'Moonlit black, blood crimson, rose red and pale ivory with silver highlights.',
        light: 'Cold moonlight, flickering candle glow and small crimson gleams in the eyes.',
        texture: 'Delicate shojo line, intricate lace detail and rose ornament around figures.',
        camera: 'Romantic gothic compositions on moonlit balconies and grand staircases.',
        mood: 'dark gothic romance',
        render: 'Elegant gothic shojo illustration with moonlit drama and delicate ornament.',
        key: 'Matsuri Hino gothic shojo; pale vampires; roses and lace; crimson eyes',
      }),
      au('SP13-009', 'Precure Toei - Magical Girl Prism Burst', {
        look: 'Toei Pretty Cure look: bright action-heavy magical transformations, sparkling ribbon costumes, rainbow prism bursts and punchy martial-arts magic battles.',
        subject:
          'draw people with Precure designs, big sparkling eyes, voluminous colorful hair and ribboned transformation outfits.',
        color: 'Rainbow prism colors with bright pink, cyan, gold and white sparkle everywhere.',
        light:
          'Prism flares, rainbow glows and sparkle bursts radiating from the transforming figure.',
        texture: tv,
        camera:
          'Spinning transformation sequences and dynamic martial-arts battle poses in the sky.',
        mood: 'bright heroic sparkle',
        render:
          'Bright Toei magical girl frame with rainbow transformation effects and punchy action.',
        key: 'Precure transformations; ribbon costumes; rainbow prisms; magical battles',
        briefs: [
          'Spinning on a rooftop in a thunderstorm, a grown-up witch in her thirties transforms as ribbons of light wrap into armored skirts, and the prism flare from her wand splits the storm clouds into rainbow shards. No readable text or logo.',
          'Two retired magical heroines in sparkling transformed costumes argue over a parking space outside the supermarket, rainbow sparkles flying with every gesture. No readable text or logo.',
          'On a quiet windowsill at dawn, a small crystal brooch catches the sunrise and throws a tiny rainbow across a sleeping cat. No readable text or logo.',
        ],
      }),
      au('SP13-010', 'Yako Gureishi - Isekai Forest Caravan', {
        look: 'Yako Gureishi Somali and the Forest Spirit look: gentle watercolor fantasy travel, soft monsters and golems, quiet caravans through mushroom forests and tender companionship.',
        subject:
          'draw people with gentle soft designs, round faces and travel cloaks, and monsters with kindly rounded shapes.',
        color:
          'Soft watercolor greens, glowing mushroom cyan and warm lantern amber in the forest.',
        light: 'Soft dappled forest light and gentle mushroom glow along the caravan path.',
        texture: 'Watercolor-like painted backgrounds with soft line work and gentle grain.',
        camera: 'Quiet travel compositions with caravans on winding forest paths.',
        mood: 'gentle wandering wonder',
        render: 'Soft watercolor fantasy illustration with tender unhurried pacing.',
        key: 'Somali gentleness; watercolor forests; kindly monsters; caravans',
      }),
      au('SP13-011', 'Delicious in Dungeon Trigger - Meikyuu Dungeon Glow', {
        look: 'Studio Trigger Delicious in Dungeon anime look (2024): crisp warm designs, glowing layered dungeon architecture, detailed monster ecology and cozy adventuring party dynamics.',
        subject:
          'draw people with Trigger designs, expressive faces, practical adventurer gear, and monsters with believable anatomy.',
        color: 'Dungeon teal glow, warm torch amber and cool stone grey through deep halls.',
        light: 'Teal magic circles glowing far below and warm torchlight in deep stone halls.',
        texture: tv,
        camera: 'Spiral descents, glowing labyrinth wide shots and cozy party close-ups.',
        mood: 'curious glowing descent',
        render: 'Warm polished Trigger frame with detailed dungeon glow and ecology.',
        key: 'Dungeon Meshi Trigger; glowing labyrinths; monster ecology; cozy party',
        avoid: [
          'a short-haired elf mage with a staff',
          'a bearded dwarf cook',
          'existing franchise characters',
        ],
      }),
      au('SP13-012', 'Gundam 0083 Sunrise - Retro Mecha VHS Grain', {
        look: 'Sunrise Mobile Suit Gundam 0083 Stardust Memory OVA look (1991): hand-painted highlight streaks on mechs, densely detailed machines, VHS-era grain and dramatic space battles.',
        subject:
          'draw people with early-nineties OVA designs, pilot suits and uniforms, beside heavily detailed mechs.',
        color: 'Olive drab, steel grey, beam pink and deep space blue with soft VHS color bleed.',
        light: 'Beam flashes and hand-painted highlight streaks sliding along curved armor plates.',
        texture: 'Analog cel with hand-painted highlights, soft VHS grain and scanline softness.',
        camera: 'Dramatic space battle framing and tight mech close-ups against burning colonies.',
        mood: 'retro mechanical drama',
        render: 'Grainy 1991 OVA frame with hand-painted mecha highlights and space drama.',
        key: 'Gundam 0083 highlights; detailed mechs; VHS grain; space battles',
        avoid: [
          'a crimson mobile suit with a mono-eye',
          'white mobile suits with V-fin antennas',
          'existing franchise characters',
        ],
        briefs: [
          'Drawing a glowing beam sword over a burning space colony, an olive-green mecha with hand-painted highlight streaks sliding down its armor turns toward a squadron of rivals as VHS grain softens the flames. No readable text or logo.',
          'In a quiet hangar during a lull in the battle, a mechanic in grease-stained overalls repaints a dent on a mech’s shoulder while a radio crackles beside her. No readable text or logo.',
          'In orbit above a blue planet, a single drifting mech helmet catches the sunlight, its cracked visor softened by grainy analog color. No readable text or logo.',
        ],
      }),
      au('SP13-014', 'Ryoichi Ikegami - Ronin Alley Duel', {
        look: 'Ryoichi Ikegami gekiga look as in Crying Freeman and Sanctuary: hyper-realistic handsome faces, precise anatomy, cinematic noir lighting and cool deadly stillness.',
        subject:
          'draw people with Ikegami realism, sculpted handsome faces, precise anatomy and elegant clothing.',
        color: 'Black ink with fine grey tone and hard noir contrast, no bright color at all.',
        light: 'Cinematic noir light from a single swinging lantern in the rain.',
        texture: 'Precise realistic pen line and fine hatching on faces and fabric.',
        camera: 'Cinematic standoff compositions in narrow rainy alleys at night.',
        mood: 'cool deadly stillness',
        render:
          'Hyper-realistic gekiga illustration with cinematic noir restraint and sculpted faces.',
        key: 'Ryoichi Ikegami realism; noir light; handsome faces; deadly stillness',
      }),
      au('SP13-016', 'Sorcerous Stabber Orphen - Battle Mage Stormcast', {
        look: 'J.C.Staff Sorcerous Stabber Orphen look (1998): late-nineties fantasy sorcerers with long coats, glowing layered spell circles, lightning magic and dusty fortress towns.',
        subject:
          'draw people with late-nineties fantasy designs, long coats, pendants, spiky hair and confident casting poses.',
        color: 'Storm blue, lightning white, dusty tan stone and crimson coat accents.',
        light: 'Crackling lightning bolts and stacked glowing spell circles lighting the scene.',
        texture: 'Late analog cel with glowing effect layers and soft grain.',
        camera: 'Heroic casting poses on fortress walls and dramatic storm wide shots.',
        mood: 'defiant stormy sorcery',
        render: 'Late-1990s fantasy television frame with glowing lightning magic.',
        key: 'Orphen sorcery; layered spell circles; lightning; nineties fantasy',
      }),
      au('SP13-017', 'Natsume Ono - Ink Noir Detective', {
        look: 'Natsume Ono manga look as in ACCA and House of Five Leaves: thin wobbly ink lines, sleepy half-lidded eyes, elegant understated noir, cigarettes and quiet conspiracies.',
        subject:
          'draw people with Ono designs, long faces, sleepy half-lidded eyes, thin lips and elegant suits.',
        color: 'Muted sepia, ink black and soft grey tones with little saturation.',
        light: 'Soft noir light through window blinds and warm desk-lamp glow.',
        texture: 'Thin wobbly ink line and flat muted tone fills.',
        camera: 'Understated noir framing and quiet conversations across desks.',
        mood: 'quiet understated intrigue',
        render: 'Elegant minimal noir manga illustration with understated charm.',
        key: 'Natsume Ono thin line; sleepy eyes; understated noir; elegance',
      }),
      au('SP13-019', 'Studio Ponoc - Forest Spirit Courier', {
        look: 'Studio Ponoc look as in Mary and the Witch’s Flower: Ghibli-lineage hand-drawn warmth, lush painted countryside, flying brooms and bicycles, and cheerful magical errands.',
        subject:
          'draw people with soft round Ponoc designs, rosy cheeks, simple clothes and lively bouncy motion.',
        color: 'Lush green hills, sky blue, warm cream and magical flower violet.',
        light: 'Bright countryside daylight with soft cel shadows and glinting sea.',
        texture:
          'Hand-drawn cel characters over lush painted countryside and seaside village backgrounds.',
        camera: 'Hillside descents and village wide shots by the sea.',
        mood: 'cheerful magical errand',
        render: 'Warm hand-drawn feature frame with Ghibli-lineage countryside charm and bounce.',
        key: 'Studio Ponoc warmth; painted countryside; magical errands; round designs',
      }),
      au('SP13-020', 'Your Lie in April A-1 - Final Episode Closure', {
        look: 'A-1 Pictures Your Lie in April look (2014): sparkling pastel light, colorful emotional music scenes, flowers and petals, and bittersweet finales bursting with color.',
        subject:
          'draw people with soft modern designs, expressive eyes and simple clothes, surrounded by bursts of color.',
        color: 'Pastel pinks, sky blue, golden light and bursting wildflower colors.',
        light: 'Sparkling bokeh, warm sunset glow and highlights on drifting petals.',
        texture: tv,
        camera: 'Emotional wide shots and color-burst transitions between moments.',
        mood: 'bittersweet colorful farewell',
        render: 'Sparkling A-1 Pictures frame with emotional color bursts.',
        key: 'Your Lie in April color; petals; sparkling light; bittersweet finale',
      }),
      au('SP13-051', 'Last Exile Gonzo - Sky Pirate Airship Anime', {
        look: 'Gonzo Last Exile look (2003) with Range Murata designs: steampunk vanships and battleships in the sky, Edwardian uniforms, sepia skies and a blend of 2D and early CG.',
        subject:
          'draw people with Range Murata designs, goggles, Edwardian flight uniforms and elegant long coats.',
        color: 'Sepia sky, polished brass, deep navy and cloud cream.',
        light: 'Warm sepia sunlight breaking through towering clouds and glinting on brass hulls.',
        texture: 'Early 2000s cel mixed with CG airships and painted clouds.',
        camera: 'Aerial chases between vanships and battleships across vast layered cloudscapes.',
        mood: 'soaring steampunk adventure',
        render: 'Distinctive 2003 Gonzo frame with steampunk skies and airships.',
        key: 'Range Murata designs; vanships; sepia skies; steampunk',
      }),
      au('SP13-053', 'Ken Sugimori - Monster Tamer Adventure Anime', {
        look: 'Ken Sugimori creature and character design look: clean watercolor-like illustrations, simple rounded creature shapes, bright friendly adventure and partnership between tamers and monsters.',
        subject:
          'draw people with Sugimori simplicity, clean faces, caps and backpacks, alongside entirely original creatures.',
        color: 'Bright watercolor greens, reds and blues on light airy backgrounds.',
        light: 'Bright clean daylight with soft watercolor shading on creatures.',
        texture: 'Clean line with light watercolor-like washes and soft edges.',
        camera:
          'Clear readable adventure compositions pairing each tamer with their creature partner.',
        mood: 'bright companionable adventure',
        render:
          'Clean watercolor-style creature illustration with friendly clarity and bright color.',
        key: 'Ken Sugimori clean creatures; watercolor washes; tamer partnership',
        avoid: [
          'existing pocket monster species',
          'red and white capture balls',
          'yellow electric mouse',
          'existing franchise characters',
        ],
        briefs: [
          'In a sunlit forest clearing, a grown-up tamer in a worn cap sends her moss-covered armadillo rolling like a boulder at a lumbering clay golem while fireflies scatter around them. No readable text or logo.',
          'On a sunny farmhouse porch, a retired tamer naps in a rocking chair while his giant tortoise creature carries a tiny vegetable garden on its shell. No readable text or logo.',
          'At dusk at the end of a quiet pier, a small creature made of paper lanterns waits patiently for its tamer to come home from the sea. No readable text or logo.',
        ],
      }),
      au('SP13-054', 'Bahamut MAPPA - Mythic Beast-Rider Anime', {
        look: 'MAPPA Rage of Bahamut: Genesis look (2014): lavish high fantasy with dragons and demons, detailed CG-assisted beasts, painterly skies and swashbuckling riders.',
        subject:
          'draw people with high fantasy designs, flowing cloaks, armor and confident rider poses.',
        color: 'Storm grey, silver scales, burning orange and deep sky blue.',
        light: 'Storm lightning, burning fire glow and dramatic painterly skies.',
        texture: tv,
        camera: 'Diving dragon flights and sweeping aerial battle wide shots.',
        mood: 'swashbuckling mythic fury',
        render: 'Lavish MAPPA fantasy frame with dragon spectacle and painterly skies.',
        key: 'Bahamut dragons; high fantasy riders; lavish skies; spectacle',
      }),
      au('SP13-055', 'Shuichi Shigeno - Midnight Mountain Racing Anime', {
        look: 'Shuichi Shigeno manga look as in Initial D: detailed photo-real car drawings contrasted with simple character faces, mountain passes at night and speed-line drifting.',
        subject:
          'draw people with Shigeno simplicity, narrow eyes, plain faces and casual clothes, with cars drawn in precise detail.',
        color: 'Black ink with grey tone and bright headlight whites cutting the dark.',
        light: 'Headlight beams in fog and dark mountain nights.',
        texture: 'Precise mechanical car linework and dense speed lines.',
        camera: 'Drift compositions sweeping through mountain hairpins with dense speed lines.',
        mood: 'tense midnight speed',
        render: 'Detailed racing manga illustration with photo-precise cars and simple faces.',
        key: 'Shigeno car detail; simple faces; mountain hairpins; speed lines',
        avoid: [
          'a white and black hatchback with a tofu shop door logo',
          'existing franchise characters',
        ],
        briefs: [
          'Drifting through a hairpin on a misty mountain road at 2 a.m., a battered old station wagon full of rice sacks cuts its headlights through the fog as a sleek rival sports car struggles to keep up. No readable text or logo.',
          'A retired racer delivering vegetables in a tiny kei truck overtakes a pack of sports cars downhill, carrots bouncing in the back. No readable text or logo.',
          'On a deserted mountain pass at night a single red taillight glows in the fog where no car has been seen for years. No readable text or logo.',
        ],
      }),
    ]),
  },
};

export default spec;
