import type { Spec } from '../tools/apply';
import { au } from './_authors';

// Modern shonen and action (part A), author pass: each preset names its mangaka or studio and the
// concrete marks of that hand. Template briefs are replaced with original scenes that suit the look.
const spec: Spec = {
  pack: 'pack_05',
  category: '1. Modern Shonen & Action',
  updates: Object.fromEntries([
    au('SP05-034', 'Kohei Horikoshi - Crosshatched Primary Hero Cel', {
      look: 'Kohei Horikoshi manga and anime look as in My Hero Academia: American-comic crosshatching on faces and muscles, chunky heroic costumes, big expressive eyes and bold primary color on bright cel.',
      subject:
        'draw people with Horikoshi designs, stocky heroic bodies, messy hair, crosshatched cheeks and elbows, and practical hero-suit costumes with bulky boots.',
      color:
        'Bold primary red, cobalt blue and sunny yellow with clean white highlights and warm skin tones.',
      light:
        'Bright daylight with crisp cel shadows plus heavy crosshatched shading on dramatic close-ups.',
      texture:
        'Visible pen crosshatching over clean digital cel paint, speed lines and dust bursts around impacts.',
      camera:
        'Heroic low angles, fists thrust at the lens and comic-panel close-ups on determined faces.',
      mood: 'earnest heroic determination',
      render:
        'Energetic shonen television frame mixing American comic hatching with bright anime cel.',
      key: 'Horikoshi crosshatching; chunky hero costumes; primary colors; heroic low angles',
      avoid: [
        'a green-haired boy in a green jumpsuit hero costume',
        'existing franchise characters',
      ],
      briefs: [
        'Holding up a collapsing bakery ceiling with both arms, a volunteer firefighter in a dented homemade hero suit grins through the flour storm while customers crawl out between her boots. No readable text or logo.',
        'Grinning at a traffic jam, a retired hero in a faded cape directs cars with exaggerated flying-punch gestures while the real traffic officer takes notes on his technique. No readable text or logo.',
        'At dawn on an empty training rooftop, a single pair of battered red boots stands beside a thermos, the sunrise crosshatched across the concrete. No readable text or logo.',
      ],
    }),
    au('SP05-133', 'Hajime Komoto - Deadpan Filigree Brick Comedy', {
      look: 'Hajime Komoto Mashle look: ornate fairy-tale magic academy filigree drawn with fine line, while a blank-faced muscular protagonist solves everything with deadpan brute strength.',
      subject:
        'draw people with Komoto designs, blank dot-eyed deadpan faces, impossibly muscular bodies in elegant academy robes, and fussy ornate magicians around them.',
      color: 'Academy navy, cream, gold filigree and cream-puff pastel accents on clean white.',
      light:
        'Even storybook light with sparkly magic glows that the deadpan hero completely ignores.',
      texture: 'Fine ornamental line work, filigree borders, clean screentone and brick textures.',
      camera:
        'Symmetrical academy compositions, deadpan frontal stares and absurd strength reveals.',
      mood: 'deadpan absurd comedy',
      render:
        'Crisp comic manga-style frame contrasting ornate fantasy detail with blank deadpan faces.',
      key: 'Hajime Komoto deadpan; filigree academy; muscle comedy; ornate magic ignored',
      avoid: [
        'a black-haired muscular student eating cream puffs',
        'existing franchise characters',
      ],
      briefs: [
        'Ignoring a swirling spell circle cast by three furious archmages, a blank-faced librarian in a formal robe simply lifts the entire enchanted tower and moves it two meters to the left. No readable text or logo.',
        'At an elegant tea ceremony, a deadpan gardener cracks a walnut between two fingers and the explosion of shell knocks every ornate teacup off the table. No readable text or logo.',
        'On an ornate marble balcony, a single dumbbell rests on a velvet cushion where the ceremonial magic wand should be. No readable text or logo.',
      ],
    }),
    au('SP05-134', 'Yuto Suzuki - Fluorescent Everyday Snap Action', {
      look: 'Yuto Suzuki Sakamoto Days look: clean confident linework, everyday convenience-store settings turned into hyper-creative action, sharp choreography with ordinary objects as weapons.',
      subject:
        'draw people with Suzuki designs, clean sharp faces, casual work aprons and suits, and bodies in precise acrobatic action poses.',
      color:
        'Fluorescent store white, snack-aisle primaries, cool teal shadows and hot pink accents.',
      light:
        'Flat fluorescent convenience-store light with crisp shadows and neon night glow outside.',
      texture: 'Clean crisp line, flat screentone, motion arcs and flying everyday objects.',
      camera:
        'Choreographed sequence framing, objects frozen mid-flight and dynamic diagonal action.',
      mood: 'snappy inventive action',
      render: 'Crisp inventive action manga frame with precise choreography of everyday objects.',
      key: 'Yuto Suzuki choreography; everyday weapons; convenience store; clean lines',
      avoid: [
        'a heavyset retired hitman in a store apron with glasses',
        'existing franchise characters',
      ],
      briefs: [
        'Blocking three knife-throwing robbers with a rolling snack shelf, a calm night-shift cashier catches every blade in a dangling bag of rice crackers without spilling her coffee. No readable text or logo.',
        'Bouncing between hanging laundry lines, a delivery courier flicks a spinning bottle cap that ricochets off four walls and switches off the ringleader’s flashlight. No readable text or logo.',
        'Under a flickering fluorescent tube, a stack of shopping baskets stands perfectly balanced on one sharpened chopstick. No readable text or logo.',
      ],
    }),
    au('SP05-032', 'Gege Akutami - Gritty Urban Curses', {
      look: 'Gege Akutami Jujutsu Kaisen manga look: rough energetic ink, grotesque cursed spirits with too many eyes and mouths, urban Tokyo settings and stylish sorcerers in dark uniforms.',
      subject:
        'draw people with Akutami designs, sharp angular faces, stylish dark uniforms and grotesque spirits with warped anatomy.',
      color:
        'Black ink with grey tone, and in color: bruised purple, cursed teal and blood orange.',
      light: 'Gloomy urban light with black shadows and eerie glows around cursed energy.',
      texture: 'Rough scratchy ink, dense black fills, gritty tone and splatter.',
      camera: 'Explosive fight panels, grotesque close-ups and tilted urban backgrounds.',
      mood: 'gritty cursed menace',
      render: 'Raw energetic dark shonen manga illustration with grotesque creature design.',
      key: 'Gege Akutami rough ink; grotesque cursed spirits; dark uniforms; urban horror',
      avoid: [
        'a white-haired blindfolded sorcerer',
        'a pink-haired student with a second face under the eye',
        'existing franchise characters',
      ],
      briefs: [
        'Standing in a flooded subway station, an exorcist in a dark raincoat faces a many-mouthed spirit made of forgotten umbrellas, each mouth whispering a different missed train. No readable text or logo.',
        'A night-shift nurse wheels a cart down an empty ward while a spirit with twelve teeth-lined eyes clings to the ceiling above her, trying very hard to be scary. No readable text or logo.',
        'In a deserted parking garage, a lone vending machine hums, and every drink behind its glass has a tiny staring eye. No readable text or logo.',
      ],
    }),
    au('SP05-035', 'Attack on Titan WIT - Gritty Wallbound Survival', {
      look: 'WIT Studio Attack on Titan anime look (2013): thick heavy outlines around faces, gritty desaturated palettes, 3D maneuver gear swinging and giants looming over medieval walled towns.',
      subject:
        'draw people with thick-outlined AoT anime designs, intense brows, heavy line shading on faces and practical leather strap harnesses.',
      color: 'Desaturated earth brown, stone grey, pale sky and harsh blood-red accents.',
      light: 'Harsh daylight with thick black shadow lines and dusty god rays.',
      texture:
        'Very thick outer contours, hatched shading lines on faces and gritty painted stone.',
      camera: 'Vertigo swings between rooftops, giant faces peering over walls and dizzying drops.',
      mood: 'desperate survival terror',
      render: 'Intense 2013 WIT Studio television frame with heavy thick outlines.',
      key: 'WIT thick outlines; walled towns; swinging harness gear; looming giants',
      avoid: ['wings of freedom emblem on a green cloak', 'existing franchise characters'],
      briefs: [
        'Swinging on steel cables between cathedral spires, a lamplighter escapes a colossal stone gargoyle that has pulled itself off the roof and is chasing her across the town. No readable text or logo.',
        'A bell-ringer hauls the great rope with his whole body as a giant hand slowly closes around the tower, the bell swinging wildly beside his face. No readable text or logo.',
        'At the foot of an enormous wall at dusk, a shepherd sits with his flock, and on the other side something taller than the wall is breathing. No readable text or logo.',
      ],
    }),
    au('SP05-036', 'Violet Evergarden - Colossal War Drama', {
      look: 'Kyoto Animation Violet Evergarden look (2018): extraordinarily detailed eyes with jewel-like irises, postwar European towns, letters and typewriters, lush painted light and grief after war.',
      subject:
        'draw people with Akiko Takase designs, jewel-detailed eyes, meticulous hair, Edwardian clothes, gloves and restrained grieving expressions.',
      color: 'Deep emerald, prussian blue, antique gold and warm candle amber.',
      light: 'Rich painted window light, candle glow and sparkling dust in sunbeams.',
      texture: 'Immaculate detailed cel with painterly backgrounds and glittering light particles.',
      camera: 'Composed cinematic shots, hands on letters, gloves, wide painted European vistas.',
      mood: 'tender postwar grief',
      render: 'Luxurious Kyoto Animation frame with extraordinary detail in eyes and light.',
      key: 'Violet Evergarden eyes; postwar Europe; letters; painted light',
      avoid: [
        'a blonde woman with metal prosthetic hands and a blue coat',
        'existing franchise characters',
      ],
      briefs: [
        'At the edge of a burned wheat field, a widow in a grey shawl reads a letter her husband dictated before the battle, while the smoke behind her slowly clears into a golden evening. No readable text or logo.',
        'A cavalry scout leads a limping mule through a ruined orchard, stopping to lift a fallen bird’s nest back into a shattered tree. No readable text or logo.',
        'In a quiet village post office, a stack of undelivered letters glows in the late afternoon light, one envelope sealed with a dried flower. No readable text or logo.',
      ],
    }),
    au('SP05-039', 'Hunter x Hunter 2011 - Tactical Adventure Shonen', {
      look: 'Madhouse Hunter x Hunter anime look (2011): clean bright designs with sharp shonen eyes, vast adventure landscapes, strategic battles and sudden dark tension.',
      subject:
        'draw people with Togashi-derived Madhouse designs, spiky hair, clean sharp eyes, adventurer clothes and calm tactical expressions.',
      color: 'Bright adventure greens, sky blue and warm tan, turning into dark tension purples.',
      light: 'Clear adventure daylight, then eerie aura glows in tense standoffs.',
      texture: 'Clean digital cel with crisp outlines and painted wilderness backgrounds.',
      camera: 'Strategic standoff framing, vast landscapes and sudden close-ups on eyes.',
      mood: 'playful tactical tension',
      render: 'Crisp 2011 Madhouse shonen frame with strategic intensity.',
      key: 'Hunter x Hunter adventure; tactical standoffs; clean designs; aura tension',
      avoid: [
        'a spiky black-haired boy with a fishing rod',
        'a white-haired boy with claws',
        'existing franchise characters',
      ],
      briefs: [
        'Balancing on a single stone pillar above a canyon of fog, a ranger calmly calculates the wind while three rival treasure hunters on nearby pillars try to stare her down. No readable text or logo.',
        'Two chess rivals face each other across a board carved into a cliff edge, and every captured piece falls hundreds of meters into the river below. No readable text or logo.',
        'A beekeeper lifts a honeycomb frame at sunset, and the bees arrange themselves into a perfect warning pattern around her hands. No readable text or logo.',
      ],
    }),
    au('SP05-121', 'Demon Slayer ufotable - Printed-Wave Effect Trail Cel', {
      look: 'ufotable Demon Slayer look (2019): crisp cel characters over lush 3D-composited forests, sword techniques drawn as ukiyo-e water waves, flames and flower trails, glowing night compositing.',
      subject:
        'draw people with Gotouge-derived ufotable designs, sharp eyes, patterned haori and hakama, and dynamic sword stances.',
      color: 'Deep night navy, ukiyo-e wave blue, flame orange and patterned haori colors.',
      light: 'Rich compositing glow, moonlight on forests and luminous effect trails.',
      texture: 'Crisp cel characters with ukiyo-e styled effect layers and painted foliage.',
      camera: 'Spinning technique shots, sweeping forest pans and dramatic slow-motion clashes.',
      mood: 'fierce graceful determination',
      render: 'High-end ufotable frame with lavish compositing and effect animation.',
      key: 'ufotable compositing; ukiyo-e wave trails; patterned haori; night forests',
      avoid: [
        'a checkered green and black haori',
        'a bamboo muzzle on a girl',
        'existing franchise characters',
      ],
      briefs: [
        'Spinning through a snowy pine forest at night, a lantern-bearer swings her lamp in a full circle and its light unrolls behind her as a curling woodblock-print wave. No readable text or logo.',
        'A grey heron lifts off a frozen mountain pond, each wingbeat leaving painted ukiyo-e ripples hanging in the frosty air. No readable text or logo.',
        'A tea master pours boiling water from an iron kettle, and the steam curls into stylized printed clouds above the cup. No readable text or logo.',
      ],
    }),
    au('SP05-124', 'Yusuke Nomura - Ultramarine Glare Foreshortening', {
      look: 'Yusuke Nomura Blue Lock manga look: sharp dynamic ink, extreme foreshortening of legs and feet toward the reader, predatory glaring eyes and ego metaphors drawn as beasts and chains.',
      subject:
        'draw people with Nomura designs, lean athletic strikers, sharp glaring eyes with glowing irises and taut muscles in extreme perspective.',
      color: 'Black ink with ultramarine accents and electric glare in color pages.',
      light: 'Hard backlight, glaring eye glints and dramatic spotlight on the decisive moment.',
      texture: 'Sharp ink lines, speed lines, screentone and metaphor overlays.',
      camera: 'Extreme foreshortening with feet and hands thrust at the lens and tilted panels.',
      mood: 'predatory ego intensity',
      render: 'Aggressive sports manga illustration with extreme perspective and predatory energy.',
      key: 'Yusuke Nomura foreshortening; glaring eyes; ego metaphors; ultramarine accents',
      briefs: [
        'Drawing a longbow on a torchlit tournament field, an archer glares down the arrow as her rivals behind her melt into circling wolves made of shadow. No readable text or logo.',
        'Exploding off the starting blocks, a sprinter’s spiked shoe fills half the frame as a giant hungry eye opens in the stadium lights behind her. No readable text or logo.',
        'Alone in a quiet workshop, a watchmaker peers through a loupe, his magnified eye glaring like a predator at the tiny gears. No readable text or logo.',
      ],
    }),
    au('SP05-128', 'Bleach TYBW - Inverted Negative Ink Opera', {
      look: 'Studio Pierrot Bleach: Thousand-Year Blood War look (2022): stark black-and-white inversions, negative-image impact frames, Tite Kubo elegant fashion silhouettes and operatic spiritual battles.',
      subject:
        'draw people with Kubo-derived designs, tall elegant silhouettes, sharp fashionable uniforms and dramatic calm faces.',
      color: 'Stark black, white and red with sudden negative inversions of the palette.',
      light: 'Negative-inverted impact frames, spiritual pressure glows and hard silhouettes.',
      texture: 'Crisp cel with ink-like black splits and flat negative-image effects.',
      camera: 'Operatic stillness, sudden inversion cuts and elegant silhouette framing.',
      mood: 'operatic cold grandeur',
      render: 'Striking modern Pierrot frame with black-and-white negative effects.',
      key: 'Negative inversion; stark black-white-red; elegant silhouettes; operatic battle',
      avoid: ['black shihakusho robes with a giant cleaver sword', 'existing franchise characters'],
      briefs: [
        'Rising from a bone-white throne in a vaulted hall, a pale sovereign flicks one finger and half of the chamber snaps into a black-and-white photographic negative. No readable text or logo.',
        'A priestess releases a flock of crows from a cathedral balcony, and the birds turn white against a suddenly black sky as they cross the moon. No readable text or logo.',
        'A cellist tunes her instrument alone on a dark stage, and every note inverts the spotlight into a black circle around her feet. No readable text or logo.',
      ],
    }),
    au('SP05-131', 'Wind Breaker 2024 - Sky-Blue Low-Angle Brawler Cel', {
      look: 'CloverWorks Wind Breaker look (2024): delinquent protector gangs in a bright town, sky-blue airy palettes, low heroic angles under wide skies and stylish fighting stances.',
      subject:
        'draw people with Satoru Nii-derived designs, sharp stylish faces, loose jackets and headbands, and confident brawler stances.',
      color: 'Airy sky blue, fresh green, crisp white and warm evening orange.',
      light: 'Bright open sky light, soft cel shadows and golden evening rim light.',
      texture: 'Clean modern digital cel with soft gradients and painted townscapes.',
      camera: 'Low angles against huge skies, group line-ups on walls and rooftops.',
      mood: 'protective youthful swagger',
      render: 'Fresh bright CloverWorks frame with airy sky compositions.',
      key: 'Sky-blue airiness; low heroic angles; protective brawlers; townscapes',
      briefs: [
        'Standing on a harbor seawall under an enormous sky, three fishermen in rolled sleeves square up against an incoming storm as if it were a rival gang. No readable text or logo.',
        'A pigeon keeper throws open her rooftop coop and a burst of birds swirls around her like a protective escort over the town. No readable text or logo.',
        'On a quiet roof ridge at sunset, a roofer eats a rice ball, his hammer resting beside him like a guardian’s sword. No readable text or logo.',
      ],
    }),
    au('SP05-135', 'Yoshifumi Tozuka - Broken-Rule Halftone Shatter', {
      look: 'Yoshifumi Tozuka Undead Unluck manga look: chaotic rule-breaking energy, halftone dot explosions, panels that shatter like glass and wild comedic-action body language.',
      subject:
        'draw people with Tozuka designs, wild expressive faces, messy hair, stylish casual clothes and gravity-defying poses.',
      color: 'Black ink with halftone dots, plus hot yellow and cyan in color pages.',
      light: 'Explosive flashes, shattering glints and halftone glow bursts.',
      texture: 'Halftone dot fields, shattered panel shards and scratchy ink.',
      camera: 'Panels shattering outward, extreme poses and chaotic diagonal layouts.',
      mood: 'chaotic rule-breaking thrill',
      render: 'Frenetic shonen manga illustration with shattering halftone effects.',
      key: 'Tozuka chaos; halftone explosions; shattering panels; wild poses',
      briefs: [
        'Flipping a gold coin in a torchlit tavern, a gambler watches the coin land on its edge, and the whole room cracks apart into floating halftone shards. No readable text or logo.',
        'A stuntwoman falls backward off a clock tower, and every tick of the clock shatters the sky behind her into a new panel. No readable text or logo.',
        'A florist trims one stem at her workbench, and the snip splits the room into two mismatched halves of dotted halftone. No readable text or logo.',
      ],
    }),
    au('SP05-136', 'Yuki Tabata - Etched Branch-Lightning Cel', {
      look: 'Yuki Tabata Black Clover manga look: extremely dense energetic linework, spiky shading, grimoire magic effects, branching black lightning and crowded magic knight squads.',
      subject:
        'draw people with Tabata designs, spiky hair, fierce grins, heavy robes and squad cloaks, rendered with dense hatching.',
      color: 'Black ink with jagged tone, and in color: black lightning, gold and crimson.',
      light: 'Crackling black lightning flashes and dramatic magic glows lighting the faces.',
      texture: 'Dense jagged hatching, splintered lightning lines and heavy ink.',
      camera: 'Explosive clash compositions with lightning branching across panels.',
      mood: 'relentless fiery grit',
      render: 'Dense high-energy shonen manga illustration with crackling magic.',
      key: 'Yuki Tabata density; branching black lightning; grimoire magic; squad cloaks',
      avoid: ['a five-leaf black grimoire', 'existing franchise characters'],
      briefs: [
        'Slamming her staff into a circle of standing stones at midnight, a hedge-witch unleashes jagged black lightning that splits into branches across the stormy sky. No readable text or logo.',
        'A kneeling knight in dented armor grits her teeth as crackling lightning splits the ground around her into glowing cracks. No readable text or logo.',
        'A bookbinder tools gold ornament into a leather cover, and tiny black sparks crawl along every line she presses. No readable text or logo.',
      ],
    }),
    au('SP05-138', 'Takeru Hokazono - Sumi-Black Neon Edge Stillness', {
      look: 'Takeru Hokazono Kagurabachi manga look: severe stillness broken by sudden blade flashes, heavy black fills, sharp clean lines and cool contemporary Tokyo with neon glints.',
      subject:
        'draw people with Hokazono designs, grim quiet faces, dark haori over modern clothes and sharp ready stances.',
      color: 'Heavy sumi black, cold grey and thin neon teal and red edge glints.',
      light: 'Mostly dark frames with razor-thin neon rim light and blade flashes.',
      texture: 'Clean sharp lines, heavy black fills and dry-brush accents.',
      camera: 'Long silent panels, then sudden cuts to single strikes.',
      mood: 'cold vengeful stillness',
      render: 'Severe modern action manga illustration with heavy black design.',
      key: 'Hokazono stillness; heavy blacks; neon edges; sudden strikes',
      briefs: [
        'Kneeling before a burned-out forge at night, a mourner in a dark coat grips the handle of an unfinished blade as a thin neon sign flickers red across its edge. No readable text or logo.',
        'A black stallion stands motionless in a flooded rice field at night, only the rim of its mane lit by a distant teal sign. No readable text or logo.',
        'A cook ladles broth at a late-night street stall, steam and silence heavy around him, one knife gleaming on the board. No readable text or logo.',
      ],
    }),
    au('SP05-139', 'Hajime Isayama - Crosshatched Giant-Scale Panic', {
      look: 'Hajime Isayama Attack on Titan manga look: rough scratchy crosshatching, awkward raw anatomy, grotesque giant faces with unsettling grins and panic-filled crowded panels.',
      subject:
        'draw people with Isayama rawness, scratchy faces, wide terrified eyes, awkward bodies and plain period clothes.',
      color: 'Black ink with rough crosshatching and no screentone polish.',
      light: 'Flat light made menacing by dense scratchy hatching.',
      texture: 'Rough scratchy pen crosshatching, uneven lines and raw texture.',
      camera: 'Enormous faces filling panels, tiny fleeing people and vertigo angles.',
      mood: 'raw giant-scale panic',
      render: 'Raw scratchy manga illustration with grotesque giant scale.',
      key: 'Isayama scratch; grotesque giant faces; raw anatomy; panic crowds',
      avoid: ['a skinless colossal titan face over a wall', 'existing franchise characters'],
      briefs: [
        'Villagers flee across a stone bridge as the grinning face of a colossal moss-covered statue rises from the river, its eyes blinking slowly. No readable text or logo.',
        'A fisherman in a small rowboat looks up at a lighthouse, and a giant hand with too many knuckles is gripping the top of it. No readable text or logo.',
        'A cobbler repairs a boot at his workbench, unaware that the enormous eye in the window behind him has been watching for an hour. No readable text or logo.',
      ],
    }),
    au('SP05-140', 'Frieren Madhouse - Pale Calm Spell Geometry', {
      look: 'Madhouse Frieren look (2023) combat scenes: pale calm palettes, soft thin lines, elegant geometric magic circles and beams, and serene elves unmoved by overwhelming power.',
      subject:
        'draw people with Reiko Nagasawa designs, calm understated faces, long pale hair, simple traveling robes and relaxed casting poses.',
      color: 'Pale mint, soft ivory, cool blue and gentle gold.',
      light: 'Soft high-key light with luminous geometric magic beams.',
      texture: 'Thin clean lines, soft digital paint and crisp geometric effect layers.',
      camera: 'Calm wide shots and elegant spell geometry framing.',
      mood: 'serene effortless power',
      render: 'Refined 2023 Madhouse frame with calm elegant magic.',
      key: 'Frieren calm; pale palette; geometric magic; serene power',
      avoid: [
        'a white-haired elf with twin tails in a white and gold robe',
        'existing franchise characters',
      ],
      briefs: [
        'Holding back an avalanche with one raised hand, a hermit mage in a pale robe barely looks up from her book as thin geometric rings hold the snow in midair. No readable text or logo.',
        'In a ruined stone observatory at dawn, thin geometric rings of light rotate slowly around a sleeping old wizard. No readable text or logo.',
        'A gardener waters a row of lavender while a faint geometric circle glows under the watering can. No readable text or logo.',
      ],
    }),
    au('SP05-037', 'Hirohiko Araki - Impact Frame Comedy Hero', {
      look: "Hirohiko Araki JoJo's Bizarre Adventure look: flamboyant fashion-model poses, muscular angular bodies, lipstick-like shading, bold unexpected colors and menacing sound-effect atmosphere without letters.",
      subject:
        'draw people with Araki designs, angular muscular bodies, strong jaws, stylish outlandish outfits and twisted fashion-magazine poses.',
      color: 'Wild unexpected color swaps, magenta skies, lime shadows and gold highlights.',
      light: 'Dramatic stylized lighting with bold shadow shapes and color inversions.',
      texture: 'Heavy inked contours, hatching, bold flat color and dramatic shadow shapes.',
      camera: 'Twisted dramatic poses, dutch angles and menacing close-ups.',
      mood: 'flamboyant bizarre bravado',
      render: 'Flamboyant manga illustration with fashion-pose drama and bizarre menace.',
      key: 'Araki poses; bizarre fashion; wild colors; menacing atmosphere',
      avoid: ['sound-effect katakana letters', 'existing franchise characters', 'readable text'],
      briefs: [
        'Stubbing his toe on a castle stair, an armored knight strikes a twisted fashion-model pose of pure agony while the sky behind him turns magenta. No readable text or logo.',
        'A farmer yanks a giant turnip out of the ground with a dramatic flamboyant pose, both arms twisted like a runway model. No readable text or logo.',
        'A librarian stamps a single book with menacing intensity, shadows crawling up the shelves behind her. No readable text or logo.',
      ],
    }),
    au('SP05-129', 'One-Punch Man Madhouse - Dual-Detail Deadpan Satire', {
      look: 'Madhouse One-Punch Man look (2015): hyper-detailed muscular monsters and heroes contrasted with a plain round-lined deadpan hero drawn with dot eyes, and spectacular sakuga destruction.',
      subject:
        'draw the calm deadpan figure with plain round lines and dot eyes, and everyone else with hyper-detailed muscles and dramatic faces.',
      color: 'Bright comic primaries, city grey and explosive yellow impact bursts.',
      light: 'Explosive impact flashes and dramatic rim light on the detailed fighters.',
      texture: 'Contrast of plain simple line and dense detailed rendering, debris clouds.',
      camera: 'Epic destruction wide shots cut against calm deadpan close-ups of the plain hero.',
      mood: 'deadpan heroic satire',
      render:
        'Spectacular sakuga television frame with deadpan contrast between plain and detailed figures.',
      key: 'One-Punch contrast; plain dot-eyed hero; detailed monsters; destruction',
      avoid: [
        'a bald hero in a yellow suit with a white cape and red gloves',
        'existing franchise characters',
      ],
      briefs: [
        'Yawning as a mountain-sized dragon collapses behind him, a dragon-hunter drawn with plain round lines and dot eyes holds his grocery list while rubble rains down. No readable text or logo.',
        'A dot-eyed tourist eats an ice cream while a hyper-detailed battle rages behind her, and she only notices when a drip lands on her shoe. No readable text or logo.',
        'An elderly pensioner reads a blank newspaper on a bench, his face plain and calm, while the city behind him is spectacularly on fire. No readable text or logo.',
      ],
    }),
    au('SP05-132', 'DUBU Solo Leveling - Full-Color Manhwa Shadow Glow', {
      look: 'DUBU (Redice Studio) Solo Leveling webtoon look: full-color digital manhwa painting, glowing blue and purple eyes, smoky shadow soldiers and dark dungeon raids.',
      subject:
        'draw people with manhwa designs, sharp handsome faces, dark coats and glowing eyes, and shadow creatures made of smoke.',
      color: 'Deep black-blue, glowing violet, electric blue and dungeon gold.',
      light: 'Glowing eyes and smoky auras in dark dungeon light.',
      texture: 'Full-color digital painting, smoke effects and glossy highlights.',
      camera:
        'Tall vertical webtoon-like compositions, dramatic low angles and looming shadow armies.',
      mood: 'dark ascending power',
      render: 'Glossy full-color webtoon illustration with smoky glows and cinematic darkness.',
      key: 'DUBU manhwa color; glowing eyes; shadow soldiers; dungeons',
      avoid: [
        'a dark-haired hunter with purple glowing eyes and a black coat',
        'existing franchise characters',
      ],
      briefs: [
        'Standing knee-deep in a flooded crypt, a necromancer queen raises one hand as smoky shadow knights rise from the water, their eyes glowing violet. No readable text or logo.',
        'A raid healer climbs a vertical shaft by the glow of her own spell, huge shadowy shapes watching from the darkness below. No readable text or logo.',
        'A night guard reads by a single desk lamp, his own shadow on the wall slowly turning to look at him with glowing eyes. No readable text or logo.',
      ],
    }),
    au('SP05-040', 'Fate UBW ufotable - Blade Field Urban Fantasy', {
      look: 'ufotable Fate/stay night: Unlimited Blade Works look (2014): Takashi Takeuchi designs, lavish digital compositing, glowing magic circuits, fields of swords under burning skies and dark urban nights.',
      subject:
        'draw people with Takeuchi-derived designs, sharp clean faces, modern and armored costumes and elegant magic poses.',
      color: 'Burning orange skies, steel grey, magic cyan and deep night blue.',
      light: 'Lavish compositing glow, magic circuit lights and sunset fire.',
      texture: 'Crisp cel characters with lavish 3D compositing and particle effects.',
      camera: 'Sweeping camera moves through sword fields and dramatic urban night shots.',
      mood: 'elegant fated battle',
      render: 'Lavish ufotable frame with rich compositing and effects.',
      key: 'ufotable compositing; sword fields; magic circuits; urban night',
      avoid: [
        'a blonde knight woman in blue and silver armor',
        'a red-coated archer with twin swords',
        'existing franchise characters',
      ],
      briefs: [
        'In a cathedral crypt, an alchemist watches a ring of cold blue embers rise into hundreds of floating glass daggers pointing toward the vaulted ceiling. No readable text or logo.',
        'A white stag crosses a snowy temple courtyard as swords made of light slowly sprout from its hoofprints. No readable text or logo.',
        'A violin maker varnishes a violin in her workshop, and faint magic circuit lines glow along the wood grain. No readable text or logo.',
      ],
    }),
  ]),
};

export default spec;
