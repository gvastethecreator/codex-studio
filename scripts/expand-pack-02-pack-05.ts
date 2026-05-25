import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import type { StylePack, StylePresetDef } from '../components/recipes/styles/types';

type PresetSeed = {
  name: string;
  aesthetic: string;
  atmosphere: string;
  keyFeatures?: string;
  colorPalette?: string;
  lightingSetup?: string;
  materialTexture?: string;
  renderQuality?: string;
  spatialDistortion?: string;
  formAndLine?: string;
  negativePrompt?: string;
};

type TemplateOverrides = {
  formAndLine?: string;
  colorPalette?: string;
  lightingSetup?: string;
  materialTexture?: string;
  renderQuality?: string;
  spatialDistortion?: string;
};

const packsDir = path.join(process.cwd(), 'components', 'recipes', 'styles', 'packs');

const sharedAnimeNegativePrompt =
  'realistic, 3d render, photo, live action, western comic, ugly, bad anatomy, low quality, jpeg artifacts, watermark, text, signature';

const caricatureSeeds: PresetSeed[] = [
  {
    name: 'Ren & Stimpy - Veiny Close-Up Grossout',
    aesthetic:
      'Hyper-detailed gross close-up reaction frame, stretched gums, trembling lips, oversized pores, saliva-string disgust, painterly grossout timing, John Kricfalusi close-up cruelty, feverish cartoon texture, freeze-frame revulsion played for comedy',
    atmosphere: 'Disgusted, frantic, hilarious, deeply unflattering',
    keyFeatures:
      'Extreme close-up face distortion, swollen gums, pore-level texture, trembling lip folds, cartoon spit strings',
    colorPalette:
      'Inflamed flesh pinks, nicotine yellow, clammy teal shadows, rash-red irritation, greasy beige skin',
    lightingSetup:
      'Harsh proximity lighting, bright skin sheen on noses and gums, overexposed forehead glare, ugly reaction-frame illumination',
    materialTexture:
      'Pore-heavy skin, lip-crack detail, greasy cheek shine, dried-saliva gloss, wobbling paint texture',
    renderQuality:
      'Close-up grossout cartoon perfection, painful facial detail, freeze-frame reaction absurdity, ugly on purpose',
    spatialDistortion:
      'Face crushing into lens space, gums bulging beyond teeth, nose swelling forward, eyes drifting on different axes',
    formAndLine:
      'Wobbling brush contours, vibrating line weight, swollen micro-detail lines, irregular fleshy edging',
    negativePrompt:
      'subtle, flattering, glamorous, cute, realistic anatomy, smooth skin, elegant, restrained, pretty',
  },
  {
    name: 'Smiling Friends - Flat Weird Dayjob Chaos',
    aesthetic:
      'Slack-off office cartoon with flat digital color, awkward little guys, anti-climactic absurdity, smiling-through-existential-panic energy, low-stakes apocalypse humor, deadpan workplace nonsense, casually cursed side characters, adult-swim anti-spectacle simplicity',
    atmosphere: 'Awkward, deadpan, bizarre, mildly cursed',
    keyFeatures:
      'Simple oddball silhouettes, blank stares, mundane office props, anti-climactic gag framing, uncomfortable pauses made visual',
    colorPalette:
      'Flat sour pastels, nicotine yellow, dusty salmon, office beige, washed-out green, cheap digital cyan',
    lightingSetup:
      'Flat no-drama lighting, fluorescent office wash, occasional dingy hallway glow, unheroic ambient fill',
    materialTexture:
      'Simple digital fills, lightly dirty edges, cheap office carpet texture, flat wall paint, low-fuss line art',
    renderQuality:
      'Lo-fi weird-comedy cartoon, clean enough to read, ugly enough to feel wrong, internet-age anti-polish',
    spatialDistortion:
      'Stubby limb proportions, tiny torsos, off-model expressions, abrupt perspective jumps for punchlines',
    formAndLine:
      'Thin simple contour lines, deliberately plain shape language, occasional scribbly panic accents',
    negativePrompt:
      'epic, slick, cinematic, beautiful, painterly, photorealistic, cute mascot polish, superhero rendering',
  },
  {
    name: 'Aaahh!!! Real Monsters - Sewer Kid Grotesque',
    aesthetic:
      'Nickelodeon monster-school grossness, eyeballs on weird stalks, toenail grime, urban sewer slime, childlike monster rebellion, junkyard textures, lumpy asymmetry, playful ugly-cute body horror for kids',
    atmosphere: 'Rowdy, gross, mischievous, lovable',
    keyFeatures:
      'Asymmetric monster anatomy, sewer grime, rubbery claws, weird eye placement, urban sludge detail',
    colorPalette:
      'Slime green, bruise purple, rust orange, toxic pink, sewer-water teal, moldy yellow',
    lightingSetup:
      'Sewer-grate shafts, dank green underlight, junkyard reflected glare, moist tunnel shadows',
    materialTexture:
      'Sludge, pitted skin, peeling grime, sneaker-scuff dirt, wet brick, trash-bag shine',
    renderQuality:
      '90s gross-kids-cartoon texture, tactile ugliness, lumpy creature-school charm, sewer-funk fidelity',
    spatialDistortion:
      'Limbs of mismatched length, eyes stacked in impossible ways, torso shapes collapsing into blobs',
    formAndLine:
      'Chunky lopsided outlines, uneven monster curves, jittery slime accents, crude expressive contour',
  },
  {
    name: 'Rugrats - Toddler Crayon Panic',
    aesthetic:
      'Toddlers seeing the world as wobbly adventure, chunky baby heads, domestic danger made epic, scribbly suburban interiors, nervous hand-drawn innocence, diaper-age imagination logic, toy-scale heroism',
    atmosphere: 'Curious, rambunctious, innocent, chaotic',
    keyFeatures:
      'Toddler-scale perspective, chunky outlines, toy clutter everywhere, domestic spaces made huge, crayon-ish uncertainty',
  },
  {
    name: 'Ed, Edd n Eddy - Jawbreaker Scam Cartoon',
    aesthetic:
      'Suburban cul-de-sac scam energy, boiling outlines, stretched faces, loud adolescent nonsense, sticky summer heat, impossible jawbreaker obsession, scam-blueprint slapstick, Canadian tween chaos',
    atmosphere: 'Hyper, sweaty, scammy, loud',
    keyFeatures:
      'Boiling line art, stretched jaw shapes, sticky suburban props, scam gadgets, exaggerated reaction takes',
    colorPalette:
      'Summer-heat yellows, candy red, pool chlorine blue, peach skin, dirty pavement grey',
    formAndLine:
      'Wobbly vibrating outlines, stretched smear frames, erratic contour boil, high-energy cartoon scribble',
  },
  {
    name: 'Rocko\'s Modern Life - Beige Suburban Anxiety',
    aesthetic:
      'Neurotic suburban absurdism, anxious little wallaby energy, weird consumerist interiors, gentle gross-out details, 90s TV satire, pastel wallpaper discomfort, surreal errands becoming nightmares',
    atmosphere: 'Neurotic, suburban, goofy, overstimulated',
    keyFeatures:
      'Domestic clutter, weird brand-like props, noodle-limbed panic poses, surreal suburban backdrops, satirical mundanity',
  },
  {
    name: 'Courage the Cowardly Dog - Rural Nightmare Pastel',
    aesthetic:
      'Lonely farmhouse horror cartoon, pink dog panic, grotesque villains in empty landscapes, Midwestern doom silence, haunted domesticity, uncanny CGI inserts, fear made cute and shrill',
    atmosphere: 'Terrified, lonely, surreal, absurd',
    keyFeatures:
      'Isolated farmhouse staging, screaming reaction poses, uncanny intruders, pastel panic, dead-field emptiness',
    lightingSetup:
      'Moonlit rural isolation, dusty lamp glow, sudden horror spotlights, red-alert interior panic lighting',
  },
  {
    name: 'Cow and Chicken - Loud Primary Derangement',
    aesthetic:
      'Shouting primary-color lunacy, absurd sibling slapstick, huge feet and tiny torsos, anti-subtle cartoon vulgarity, hallway chaos, exaggerated rubbery ugliness, jagged gross comedy',
    atmosphere: 'Loud, shameless, unruly, ridiculous',
    keyFeatures:
      'Primary-color saturation, giant feet, screaming mouths, surreal hallway staging, chaotic sibling energy',
  },
  {
    name: 'CatDog - Shared-Body Elastic Nonsense',
    aesthetic:
      'Single-body two-headed creature absurdity, opposite temperaments locked in one sausage body, suburban hijinks, long-body contortions, impossible shared anatomy, simple but deeply strange sitcom creature design',
    atmosphere: 'Goofy, elastic, odd-couple, playful',
    keyFeatures:
      'Shared-body anatomy, impossible body bends, head-to-tail personality contrast, suburban prop gags, elastic long-form silhouettes',
    spatialDistortion:
      'Sausage-body contortions, impossible shared spine bends, mirrored emotional poses at both ends, accordion-body compression',
  },
  {
    name: 'SpongeBob Gross-Up Freeze Frame',
    aesthetic:
      'Cheerful cartoony setup smashed by hyper-detailed disgusting close-up, nautical nonsense colliding with fleshy realism, sea-salt weirdness, deranged reaction insert, undersea slapstick whiplash',
    atmosphere: 'Cheery, revolting, whiplash-funny, manic',
    keyFeatures:
      'Normal-to-gross style contrast, close-up flesh detail, cartoon sponge absurdity, reaction-frame jump scare, goofy undersea props',
  },
  {
    name: 'Beavis and Butt-Head - Dumb Couch Slouch',
    aesthetic:
      'Mouth-breathing teen delinquent caricature, couch-slouch nihilism, ugly suburban interiors, cheap music-video culture, stupid-laugh deadbrain energy, acne-age contempt, pencil-neck stupidity',
    atmosphere: 'Idiotic, lazy, mean, vacant',
    keyFeatures:
      'Overbites, slouched posture, deadbeat living room clutter, ugly teen profile shapes, cheap-TV ambience',
  },
  {
    name: 'Mike Judge Office Boredom Sketch',
    aesthetic:
      'Dry anti-charisma office cartoon, dead-eyed cubicles, regional mediocrity, bad polo shirts, paperwork emptiness, satirical nobody energy, American beige despair made funny',
    atmosphere: 'Bored, dry, defeated, observant',
    keyFeatures:
      'Cubicle geometry, blank stares, underwhelming body language, office clutter, anti-glamour caricature',
  },
  {
    name: 'The Oblongs - Toxic Suburb Family',
    aesthetic:
      'Mutant suburbia satire, malformed family silhouettes, environmental rot, class divide cartoon cruelty, trailer-park grotesquerie, deformity normalized into domestic routine, poisoned world whimsy',
    atmosphere: 'Bleak, satirical, mutated, weirdly cozy',
    keyFeatures:
      'Malformed suburban family, toxic backdrop details, trashy domesticity, odd body asymmetries, resigned humor',
  },
  {
    name: 'Dr. Katz - Squigglevision Therapy Doodle',
    aesthetic:
      'Loose vibrating linework, therapist-office stand-up confessional, conversational minimalism, squigglevision jitter, low-key absurd adult animation, every contour trembling with mild neurosis',
    atmosphere: 'Talky, neurotic, understated, wry',
    keyFeatures:
      'Constant line jitter, simple office staging, conversational framing, minimal backgrounds, anxious contour vibration',
    formAndLine:
      'Persistent squigglevision contour drift, shaky loose lines, conversation-first staging, gentle hand-tremor energy',
  },
  {
    name: 'Home Movies - Marker-Edge Improvised Sitcom',
    aesthetic:
      'Improvised-kid-filmmaker cartoon, dry marker linework, suburban awkwardness, anti-slick timing, homemade creativity, youth theater cringe, hand-drawn TV softness',
    atmosphere: 'Awkward, homemade, earnest, low-key funny',
    keyFeatures:
      'Marker-like linework, simple suburban rooms, improvised poses, school-project props, handmade TV charm',
  },
  {
    name: 'Doug Notebook Anxiety Cartoon',
    aesthetic:
      'Notebook-color suburbia, adolescent embarrassment, gentle daydream logic, simple flat backgrounds, internal monologue cartooning, childhood worry in soft marker color',
    atmosphere: 'Nervous, sweet, relatable, wistful',
    keyFeatures:
      'Notebook-like color fields, awkward kid posture, diary-energy framing, suburban school props, daydream insert logic',
  },
  {
    name: 'Angela Anaconda Photo-Cutout Menace',
    aesthetic:
      'Photocollage black-and-white cutout nightmare, flat heads pasted onto crude bodies, anti-beauty schoolyard sarcasm, collage ugliness weaponized, handmade digital freakout',
    atmosphere: 'Snarky, janky, hostile, unforgettable',
    keyFeatures:
      'Photo-cutout faces, mismatched body collage, xerox textures, anti-pretty black-and-white contrast, hostile schoolyard energy',
    materialTexture:
      'Photocopy grain, paper-cut edges, glue-collage layering, black-and-white halftone abuse, rough scan artifacts',
  },
  {
    name: 'Crash Zoom Garbage Pail Caricature',
    aesthetic:
      'Trash-kid trading-card grossness, swelling zits, goo drips, prank-card exaggeration, gleeful disgustingness, playground disgust collectible energy, ugly gags rendered for maximum recoil',
    atmosphere: 'Gross, gleeful, juvenile, loud',
    keyFeatures:
      'Exploding goo details, prank-card composition, gross kid caricature, crash-zoom reaction framing, sticky body horror',
  },
  {
    name: 'Public Pool Mucus Monster Doodle',
    aesthetic:
      'Badly drawn gross summer monster from a public-pool nightmare, chlorine-green slime, sticky heat, flip-flop trash vibes, grotesque but childish camp-disgust humor',
    atmosphere: 'Sticky, goofy, gross, summer-feral',
    keyFeatures:
      'Slime drips, cheap pool props, off-model monster anatomy, gross summer palette, kid-gag nastiness',
  },
  {
    name: 'Toxic Marker Classroom Freakout',
    aesthetic:
      'Middle-school-desk doodle pushed into a full freakout scene, permanent-marker chaos, rude iconography, sketchbook rebellion, bored-student aggression, malformed characters born from notebook margins',
    atmosphere: 'Rebellious, messy, hyperactive, juvenile',
    keyFeatures:
      'Permanent-marker texture, desk-doodle iconography, notebook margin monsters, vandal-energy linework, adolescent chaos',
  },
];

const animeSeeds: Record<string, PresetSeed[]> = {
  '1. Modern Shonen & Action': [
    { name: 'Demon Slayer - Lantern Bloodline Sword Ballet', aesthetic: 'Taisho-era demon hunting, patterned haori silhouettes, lantern-lit sword arcs, breathing-technique slash trails, family-memory tenderness meeting high-contrast violence, wood-and-snow atmosphere', atmosphere: 'Heroic, tragic, elegant, intense', keyFeatures: 'Katana arc readability, patterned costumes, lantern-and-mist staging, emotional combat pauses, ceremonial blade poses' },
    { name: 'Chainsaw Man - Filthy Devil-Hunter Frenzy', aesthetic: 'Urban grime, devil-contract desperation, splattered apartment-block carnage, greasy youth burnout, industrial gore comedy, ridiculous violence played with deadpan panic, civic-collapse devil hunting', atmosphere: 'Chaotic, filthy, feral, desperate', keyFeatures: 'Industrial splatter, jagged power silhouettes, exhausted youth body language, grim city clutter, violent comic timing' },
    { name: 'Fire Force - Cathedral Inferno Brigade', aesthetic: 'Religious-firefighter action, glowing ember halos, rescue teams in black coats, infernal combustion, cathedral-industrial interiors, liturgical symbolism mixed with speed-line heroics', atmosphere: 'Blazing, heroic, sacred, kinetic', keyFeatures: 'Flame trails, brigade uniforms, ember particles, cathedral scale, ignition-focused action posing' },
    { name: 'Blue Lock - Predator-Ego Sports Assault', aesthetic: 'Hyper-competitive striker psychology, neon pitch intensity, feral ego close-ups, goalbox warfare, cutthroat sports animation, ballistic shot framing, tactical hunger made visual', atmosphere: 'Predatory, focused, manic, competitive', keyFeatures: 'Soccer-ball velocity, eye-line intensity, predator metaphors, field-line perspective, lock-on shot framing' },
    { name: 'Kaiju No. 8 - Civic Monster Response Unit', aesthetic: 'Municipal anti-kaiju action, armored cleanup crews, giant-monster tissue aftermath, urban defense operations, public-infrastructure heroics, monster-sized perspective shifts', atmosphere: 'Explosive, civic, resilient, colossal', keyFeatures: 'Scale contrast with city blocks, defense-suit silhouettes, kaiju debris, team-response formations, oversized impact framing' },
    { name: 'Dandadan - Paranormal Turbo Romance Brawl', aesthetic: 'Occult comedy collision, ghost-speed punch-ups, alien weirdness, teen-romance bickering, turbo-charged nonsense, supernatural street fights with irreverent energy', atmosphere: 'Wild, funny, romantic, unhinged', keyFeatures: 'Occult iconography, speed-burst framing, weird-creature silhouettes, high-energy reaction shots, teen-banter body language' },
    { name: 'Hell\'s Paradise - Poison Garden Executioner', aesthetic: 'Executioner blades in hallucinogenic paradise, floral horror, island monstrosities, sacred violence, Edo-period criminal fatalism colliding with impossible botanical terror', atmosphere: 'Lethal, lush, mystical, brutal', keyFeatures: 'Flower-and-blood contrast, executioner sword poses, poisonous color pops, creature-body horror, dense island backdrops' },
    { name: 'Bleach: Thousand-Year Blood War - Royal Black Blade Opera', aesthetic: 'Severe black uniforms, palace-scale combat, spiritual warfare, white-black contrast, calligraphic attack names, aristocratic villain drama, divine war-pageantry', atmosphere: 'Regal, severe, explosive, mythic', keyFeatures: 'Black robe silhouettes, palace verticality, spiritual attack effects, dramatic cloak movement, sword-name theatrics' },
    { name: 'One-Punch Man - Prestige Hero Impact Satire', aesthetic: 'Prestige-action animation colliding with bored overpowered comedy, monster-of-the-week destruction, caped simplicity, city-smashing impact clarity, sincerity and satire sharing the same frame', atmosphere: 'Deadpan, explosive, absurd, triumphant', keyFeatures: 'Huge impact craters, cape silhouette, serious-monster design, anticlimactic hero expression, blockbuster destruction staging' },
    { name: 'Mob Psycho 100 - Psychic Paint-Surge Meltdown', aesthetic: 'Middle-school psychic awkwardness exploding into paint-like energy storms, emotional overload meter, sketchy sincerity, abstract telekinetic outbursts, humility versus apocalypse', atmosphere: 'Earnest, explosive, weird, cathartic', keyFeatures: 'Paint-surge psychic effects, simple sincere faces, emotion-meter tension, abstract motion bursts, telekinetic debris halos' },
    { name: 'Wind Breaker - Delinquent Street Protector Rush', aesthetic: 'Modern school-delinquent action, alleyway wind shear, gang jackets, city-protector swagger, bruised knuckles and neon convenience stores, rooftop loyalty clashes', atmosphere: 'Rowdy, loyal, kinetic, swaggering', keyFeatures: 'Jacket silhouettes, urban rooftop staging, knuckle-first action, streetlight color pops, team loyalty poses' },
    { name: 'Solo Leveling - Shadow Monarch Raid Ascension', aesthetic: 'Dungeon-raid power fantasy, violet-black shadow summons, rank-up intensity, Korean portal action polish, monarch aura spectacle, solitary ascent into overwhelming force', atmosphere: 'Dominant, sleek, ominous, ascendant', keyFeatures: 'Shadow-army silhouettes, violet aura bloom, dungeon architecture, rank-up visual cues, overpowered hero framing' },
    { name: 'Mashle - Brickwall Comedy Spell-School Brawl', aesthetic: 'Magic-school world broken by deadlift absurdity, muscular deadpan, wand-logic punctured by physical-force jokes, elite academy duels with comedy undercut', atmosphere: 'Dumb, forceful, confident, hilarious', keyFeatures: 'Spell-school props, deadpan hero stance, physical gag payoffs, absurd power contrast, academy-combat framing' },
    { name: 'Sakamoto Days - Convenience-Store Assassin Sprint', aesthetic: 'Everyday storefront life colliding with impossibly clean assassin choreography, suburban product aisles turned combat lanes, calm professionalism amid absurd action', atmosphere: 'Cool, funny, efficient, surprising', keyFeatures: 'Retail-space combat staging, impossible stunt clarity, dead-calm expressions, product-clutter motion lines, hitman pose economy' },
    { name: 'Undead Unluck - Rule-Breaker Curse Impact', aesthetic: 'Conceptual powers with slapstick brutality, unlucky chain reactions, immortal body damage, poppy modern action comic energy, romance hidden inside kinetic chaos', atmosphere: 'Chaotic, playful, brutal, offbeat', keyFeatures: 'Rule-based action motifs, body-damage exaggeration, bright effect symbols, momentum-heavy posing, comic impact beats' },
    { name: 'Black Clover - Grimoire Thunder Squad', aesthetic: 'Anti-magic underdog drive, squad-based spell warfare, medieval-black-bull energy, book-based spellcasting, ragged ambition versus noble polish', atmosphere: 'Determined, loud, magical, scrappy', keyFeatures: 'Grimoire staging, team squad silhouettes, anti-magic aura contrast, loud rivalry poses, magical battleground debris' },
    { name: 'Dr. Stone - Science Kingdom Action Blueprint', aesthetic: 'Primal wilderness civilization-building fused with competitive action energy, bright invention montages, chemistry-as-power spectacle, survival optimism and tactical intelligence', atmosphere: 'Inventive, bold, optimistic, strategic', keyFeatures: 'Blueprint overlays, primitive-to-modern tool contrast, science symbols, bright expression acting, invention triumph moments' },
    { name: 'Kagurabachi - Sword Oath Under Neon Rain', aesthetic: 'Brooding urban sword-revenge thriller, enchanted blades, cold rain, yakuza underworld severity, stylish restraint before sudden violence, sleek modern occult drama', atmosphere: 'Brooding, precise, cool, vengeful', keyFeatures: 'Rainlit katana poses, occult blade effects, underworld interiors, severe facial acting, neon-rain contrast' },
    { name: 'Attack on Titan - Wall Rupture Desperation', aesthetic: 'Wall-top military survival, giant flesh threat, vertical maneuver gear, humanity under siege, dust-cloud dread, desperate tactical sacrifice, city-scale terror', atmosphere: 'Desperate, colossal, militarized, tragic', keyFeatures: 'Extreme scale contrast, maneuver-gear lines, breached-wall debris, regiment silhouettes, panic-charged perspective' },
    { name: 'Frieren Combat Flashback - Ancient Calm Spell Impact', aesthetic: 'Measured spellcasting from a long-lived mage, soft post-journey melancholy interrupted by precise magical violence, understated action framed by emotional memory and sky-rich stillness', atmosphere: 'Calm, precise, wistful, powerful', keyFeatures: 'Controlled spell geometry, quiet face acting, sky-heavy backgrounds, measured combat spacing, memory-laden stillness' },
  ],
  '2. 2000s Classics': [
    { name: 'Soul Eater - Halloween Soul Resonance Punk', aesthetic: 'Halloween-town architecture, moon-face grins, striped fashion silhouettes, weapon-partner action, Tim-Burton-meets-shonen rhythm, exaggerated soul-wave cool', atmosphere: 'Spooky, stylish, energetic, mischievous', keyFeatures: 'Moon-face iconography, striped accessories, weapon forms, playful gothic backdrops, rhythm-heavy action poses' },
    { name: 'Black Lagoon - South Seas Gun-Runner Grit', aesthetic: 'Tropical criminal port cities, cigarettes and speedboats, hard-bitten mercenary action, gunmetal humidity, profanity-laced underworld cool, lawless modern noir', atmosphere: 'Gruff, hot, dangerous, worldly', keyFeatures: 'Gun-action framing, tropical industrial docks, criminal fashion silhouettes, speedboat spray, hardboiled expressions' },
    { name: 'Darker than Black - Contract Killer Night Rain', aesthetic: 'Urban electrical espionage, masked contractors, cold neon rain, conspiratorial apartment blocks, emotion-suppressed assassin cool, after-midnight tech noir', atmosphere: 'Cold, secretive, sleek, lonely', keyFeatures: 'Electric effect threads, masked silhouettes, rainlit city alleys, covert-operatives framing, controlled facial acting' },
    { name: 'Samurai Champloo - Lo-Fi Edo Swagger', aesthetic: 'Edo roadtrip remixed with hip-hop attitude, loose sword swagger, vinyl-scratch pacing, dusty sunlight, anachronistic cool threaded through wandering samurai adventure', atmosphere: 'Loose, stylish, sunbaked, rebellious', keyFeatures: 'Streetwise sword poses, lo-fi travel scenery, rhythm-first action timing, relaxed body language, dusty road compositions' },
    { name: 'Eureka Seven - Sky-Surf Youth Mecha Romance', aesthetic: 'Aerial surf mecha, teenage longing, counterculture energy, sunset cloud seas, board-riding robots, bright emotional rebellion, sky-soaked romance and motion', atmosphere: 'Airy, romantic, youthful, free', keyFeatures: 'Sky-surf silhouettes, cloud-ocean backdrops, youthful pilot fashion, board-riding motion lines, glowing horizon staging' },
    { name: 'Black Butler - Velvet Servant Gothic', aesthetic: 'Victorian mansion elegance, demonic contract refinement, silverware precision, black-tailcoat poise, aristocratic morbidity, candlelit service turned occult theater', atmosphere: 'Elegant, sinister, poised, decadent', keyFeatures: 'Tailcoat silhouettes, gothic mansion interiors, silver serving props, contract symbolism, candlelit dramatic poses' },
    { name: 'Toradora! - Winter Romance Tsundere Collision', aesthetic: 'Compact school romance with emotional blunt-force trauma, winter streets, domestic apartment warmth, tiny tiger hostility, youth awkwardness sharpened into comedy and heartbreak', atmosphere: 'Combative, sweet, wintery, sincere', keyFeatures: 'School-uniform warmth, winter streetlights, apartment clutter intimacy, sharp reaction acting, emotional proximity framing' },
    { name: 'Baccano! - Jazz Railcrime Ensemble', aesthetic: 'Prohibition-era train violence, immortal gangsters, jazz-age ensemble chaos, amber barrooms, nonlinear pulp cool, smiling criminals and bloody miracles', atmosphere: 'Riotous, jazzy, dangerous, charismatic', keyFeatures: 'Train-car action, 1930s fashion, ensemble staging, amber bar lighting, pulp-crime body language' },
    { name: 'Hitman Reborn! - Mafia Tutor Comedy Escalation', aesthetic: 'School-comedy absurdity maturing into ring-battle mafia spectacle, baby-suited tutor menace, bright comedy turned clan action, family crest iconography, hyper-youthful underworld energy', atmosphere: 'Rowdy, comic, fiery, loyal', keyFeatures: 'Family emblems, ring-battle effects, school-to-mafia contrast, eccentric mentor framing, bright clan poses' },
    { name: 'Shakugan no Shana - Crimson Schoolyard Embers', aesthetic: 'School life folding into ember-eyed battle fantasy, tiny-tsundere severity, floating flame fragments, hidden-world combat, early-digital supernatural romance tension', atmosphere: 'Fiery, severe, romantic, hidden', keyFeatures: 'Ember particles, school-uniform contrast, sword-and-flame poses, hidden-world overlays, compact but intense framing' },
    { name: 'The Melancholy of Haruhi Suzumiya - SOS Club Reality Bending', aesthetic: 'Cheerful school-club energy with cosmological instability humming underneath, bright clubroom compositions, eccentric youth charisma, sudden genre fracture between slice-of-life and godlike anomaly', atmosphere: 'Playful, uncanny, bright, meta', keyFeatures: 'Clubroom clutter, eccentric leader posing, school-lifestyle brightness, reality-bend hints, ensemble body language' },
    { name: 'Gintama - Feudal Sci-Fi Deadpan Mayhem', aesthetic: 'Samurai-comedy nonsense in a sci-fi Edo city, deadpan punchlines, absurd parodies, wooden swords and vending machines sharing one street, lazy hero swagger, chaos with heart', atmosphere: 'Irreverent, chaotic, lovable, stupid-smart', keyFeatures: 'Anachronistic prop mashups, comedic reaction faces, lazy hero postures, sci-fi Edo streets, parody-ready staging' },
    { name: 'D.Gray-man - Exorcist Cathedral Machinery', aesthetic: 'Exorcist uniforms, cursed machinery, gothic Europe, innocence weaponry, melancholy stained-glass combat, youthful burden carried through dark sacred spaces', atmosphere: 'Somber, holy, cursed, determined', keyFeatures: 'Exorcist coat silhouettes, sacred-tech weapons, cathedral depth, mourning-eyed expressions, curse-mark motifs' },
    { name: 'Blood+ - Military Vampire Transit', aesthetic: 'Military logistics crossing with melancholy vampiric violence, night trains, schoolgirl burden, sharp blades against modern corridors, secret-war seriousness', atmosphere: 'Bleak, disciplined, nocturnal, tragic', keyFeatures: 'Sword-bearing schoolgirl contrast, military convoy spaces, vampiric motion blur, sterile interiors, night-travel framing' },
    { name: 'The Familiar of Zero - Tsundere Magic Academy', aesthetic: '2000s magic-academy comedy, aristocratic fantasy schools, pink-haired tantrum energy, summoned-familiar romance, wand-duel pageantry, playful noblesse fantasy', atmosphere: 'Comic, magical, bratty, romantic', keyFeatures: 'Magic-school uniforms, aristocratic interiors, wand-duel staging, summoned-companion motifs, tsundere expression acting' },
    { name: 'Higurashi - Cicada Village Breakdown', aesthetic: 'Cute rural summer shattered by paranoia, cicada noise, festival masks, friendship turning knife-edge, hot village afternoons that hide catastrophic loops and dread', atmosphere: 'Pastoral, paranoid, feverish, terrifying', keyFeatures: 'Village festival imagery, cute-to-horror contrast, cicada-summer palette, breakdown expressions, shrine-and-home staging' },
    { name: 'Air Gear - Neon Street-Skate Battle', aesthetic: 'Motorized inline-skate gangs, rooftop freedom, wind-carved city movement, youth bravado, punk-tech speed culture, kinetic parkour and impossible airtime', atmosphere: 'Fast, rebellious, flashy, weightless', keyFeatures: 'Skate silhouettes, rooftop city motion, street-gang fashion, wind effects, airborne action poses' },
    { name: 'Mushi-Shi - Whispering Forest Healing', aesthetic: 'Quiet wandering folkloric medicine, pale supernatural ecology, mossy villages, soft light over invisible lifeforms, contemplative 2000s fantasy naturalism', atmosphere: 'Quiet, mystical, healing, solitary', keyFeatures: 'Forest hush, pale spirit traces, herbal-traveler framing, misty villages, contemplative body language' },
    { name: 'Nana - Black-Lipstick Apartment Punk', aesthetic: 'Tokyo apartment rock drama, black-lipstick cool, fashion-band melancholy, cigarettes and vulnerability, youth cohabitation, emotional abrasion in late-night city interiors', atmosphere: 'Stylish, aching, adult, intimate', keyFeatures: 'Band-fashion silhouettes, apartment clutter romance, train-and-city motifs, black-lipstick contrast, emotionally loaded close-ups' },
    { name: 'Ouran High School Host Club - Rose-Backdrop Elite Comedy', aesthetic: 'Elite academy parody, rose-petal excess, sparkling host-club nonsense, rich-kid interiors, theatrical self-awareness, comedic reverse-harem flamboyance', atmosphere: 'Playful, polished, satirical, extravagant', keyFeatures: 'Rose-backdrop comedy, princely school uniforms, ornate academy rooms, ensemble pose symmetry, theatrical sparkle' },
  ],
  '3. 90s Golden Era': [
    { name: 'Dragon Ball Z - Planet-Shattering Aura Duel', aesthetic: 'Muscle-defined cel-era combat, mountain-breaking impact, screaming aura power-ups, iconic stare-downs, cratered landscapes, hard-shadow spectacle and emotional yelling', atmosphere: 'Explosive, iconic, relentless, mythic', keyFeatures: 'Aura flares, craters, battle-torn rocks, screaming profile shots, planet-scale action stakes' },
    { name: 'Sailor Moon - Moonlit Ribbon Justice', aesthetic: 'Urban night magic, schoolgirl heroism, crescent emblems, transformation ribbons, heartfelt friendship and elegant monster-of-the-week glamour, moonlit romantic action', atmosphere: 'Radiant, romantic, heroic, graceful', keyFeatures: 'Transformation ribbons, crescent motifs, moonlit city backgrounds, team silhouette posing, jewel-tone magic effects' },
    { name: 'Cowboy Bebop - Cigarette Smoke Space Cool', aesthetic: 'Jazz-noir bounty hunting, smoke-hazed interiors, used-future ships, emotional cool, melancholy drift between stylish gunfights and empty late-night meals', atmosphere: 'Cool, lonely, jazzy, bittersweet', keyFeatures: 'Smoke haze, space-western interiors, sharp suit silhouettes, jazzy body language, bounty-hunter framing' },
    { name: 'Ghost in the Shell - Wet-City Tactical Consciousness', aesthetic: 'Rain-heavy cybernetic statecraft, surveillance corridors, philosophical gunplay, thermoptic stealth, reflective city glass, identity anxiety inside hard tactical polish', atmosphere: 'Clinical, philosophical, tactical, nocturnal', keyFeatures: 'Wet urban reflections, tactical firearm posing, cybernetic body detail, surveillance imagery, cold-thoughtful close-ups' },
    { name: 'Yu Yu Hakusho - Spirit Tournament Heat', aesthetic: 'Tournament-arena rivalry, spirit-gun bursts, delinquent confidence, sharp 90s facial acting, underworld martial drama, honor and swagger sharing the same frame', atmosphere: 'Fiery, competitive, cool, earnest', keyFeatures: 'Arena staging, energy-burst fists, delinquent posture, underworld iconography, rival stare-downs' },
    { name: 'Rurouni Kenshin - Meiji Blade Redemption', aesthetic: 'Meiji-era wandering swordsman drama, sakura and guilt, reverse-blade restraint, dojo warmth punctured by lethal memory, historical romance and steel discipline', atmosphere: 'Reflective, noble, restrained, fierce', keyFeatures: 'Kimono-and-sword silhouettes, Meiji streets, reverse-blade stances, sakura accents, inner-conflict close-ups' },
    { name: 'Outlaw Star - Engine-Trail Treasure Chase', aesthetic: 'Treasure-hunter space adventure, grappler-arm ship duels, outlaw swagger, dusty ports and star corridors, pulpy cosmic optimism with rough-edged bravado', atmosphere: 'Adventurous, cocky, starry, scrappy', keyFeatures: 'Starship silhouettes, engine trails, outlaw coats, cosmic route maps, treasure-chase action framing' },
    { name: 'Neon Genesis Evangelion - Red Alert Psychological Collapse', aesthetic: 'Biomechanical mecha dread, cross-shaped explosions, red alert command rooms, teenage isolation, apocalyptic ocean skies, intimate trauma framed by military procedure', atmosphere: 'Apocalyptic, interior, anxious, sacred', keyFeatures: 'Red alert overlays, cockpit claustrophobia, cross-shaped blasts, command-room grids, lonely child pilot framing' },
    { name: 'Serial Experiments Lain - Wired Bedroom Dissolution', aesthetic: 'Bedroom terminals, humming cables, thin reality, disconnected suburbia, static-lit silence, identity blur between schoolgirl life and network consciousness', atmosphere: 'Isolated, wired, whispery, uncanny', keyFeatures: 'Cable clusters, CRT glow, empty suburban streets, detached gaze, static-rich digital overlays' },
    { name: 'Cardcaptor Sakura - Storybook Seal Magic', aesthetic: 'Soft magical-girl wonder, ornate key designs, airy costume changes, schoolyard gentleness, toy-like magical seals, comforting city evenings with elegant charm', atmosphere: 'Sweet, magical, bright, comforting', keyFeatures: 'Seal-circle motifs, ornate magical props, costume-detail focus, school-and-home softness, flying-card whimsy' },
    { name: 'Slayers - Arcane Chaos Roadtrip', aesthetic: 'Sorcerous comedy-adventure, greedy treasure energy, explosive spell circles, fantasy road dust, mischievous confidence, loud 90s spellcasting charm', atmosphere: 'Comic, adventurous, fiery, rambunctious', keyFeatures: 'Spell-circle bursts, roadtrip fantasy props, comic reaction faces, treasure-hunter posing, fireball spectacle' },
    { name: 'The Vision of Escaflowne - Tarot Mecha Fantasy', aesthetic: 'Tarot prophecy, cape-swept knights, dragon-armored mecha, windswept fantasy romance, jewel-toned sky drama, fate-heavy 90s grandeur', atmosphere: 'Romantic, fated, windswept, grand', keyFeatures: 'Tarot symbolism, capes and armor, fantasy mecha silhouettes, sky-heavy compositions, prophecy-charged gazes' },
    { name: 'Trigun - Desert Gun-Saint Melancholy', aesthetic: 'Sun-bleached desert towns, ridiculous outlaw silhouette, hidden grief behind slapstick, revolver iconography, church-and-saloon westward sci-fi sorrow', atmosphere: 'Goofy, lonely, dusty, compassionate', keyFeatures: 'Desert-town staging, revolver poses, red-coat silhouette, comic-to-serious tonal contrast, giant sky backdrops' },
    { name: 'Berserk 1997 - Iron Guts Medieval Ruin', aesthetic: 'Mercenary brutality, iron weight, ruined castles, black trauma and mud, doomed brotherhood, heavy sword arcs under ash-dark skies', atmosphere: 'Brutal, mournful, doomed, relentless', keyFeatures: 'Oversized sword silhouette, ruined masonry, battlefield mud, scarred facial acting, oppressive medieval scale' },
    { name: 'Revolutionary Girl Utena - Rose Duel Symbolism', aesthetic: 'Rose-crested duels, theatrical academia, impossible symbolism, prince-aspiration elegance, staircase ritual drama, emotional allegory made architectural', atmosphere: 'Theatrical, symbolic, elegant, unsettling', keyFeatures: 'Rose motifs, dueling platform staging, academy pageantry, allegorical poses, stylized ritual space' },
    { name: 'Magic Knight Rayearth - Jewel Armor Quest', aesthetic: 'Shoujo fantasy rescue with armored heroines, rune-light, giant mythic summons, candy-bright quest energy, magical friendship in a richly colored fantasy world', atmosphere: 'Heroic, bright, jewel-like, adventurous', keyFeatures: 'Armor-and-skirt silhouettes, giant summon motifs, jewel magic effects, fantasy vehicle scale, team-quest compositions' },
    { name: 'Martian Successor Nadesico - Cheerful Bridge-Deck Mecha', aesthetic: 'Cheerful ensemble spaceship banter, bridge-deck chaos, retro-futurist mecha action, anime-inside-anime meta flavor, bright war-comedy balance', atmosphere: 'Bouncy, tactical, colorful, meta', keyFeatures: 'Bridge-deck ensemble staging, mecha sortie framing, retro UI accents, playful command-room energy, bright team body language' },
    { name: 'Blue Seed - Mythic Tokyo Purge', aesthetic: 'Mythic plant-horror action in modern Tokyo, shrine lineage duty, monster invasions, spiritual bureaucracy, 90s occult action with emergency-team momentum', atmosphere: 'Urgent, mythic, urban, supernatural', keyFeatures: 'Shrine symbols, monster-vine invasions, city emergency framing, lineage heroine posture, occult-tech contrast' },
    { name: 'Slam Dunk - Hardwood Rivalry Portrait', aesthetic: '90s sports confidence, sweaty gym drama, delinquent swagger redirected into team growth, hardwood bounce and underdog sincerity, emotionally readable game intensity', atmosphere: 'Competitive, sweaty, hopeful, charismatic', keyFeatures: 'Gymnasium lighting, basketball motion arcs, rivalry face-offs, team-bond body language, court-perspective dynamism' },
    { name: 'Gunsmith Cats - Chicago Garage Firefight', aesthetic: 'Car chases, handguns and muscle cars, Chicago garage cool, sharp female leads, firearm fetish detail, sleek 90s crime-action confidence with urban grease', atmosphere: 'Sharp, hot-rodded, confident, dangerous', keyFeatures: 'Garage-and-car props, gun-detail focus, urban pursuit framing, leather-jacket silhouettes, procedural-action cool' },
  ],
  '4. Classic & Modern Shojo': [
    { name: 'Fruits Basket - Zodiac Warmth and Grief', aesthetic: 'Soft domestic healing, animal-zodiac tenderness, school-day comfort shading into family trauma, kind eyes, gentle kitchens, emotional weather made delicate and bright', atmosphere: 'Tender, healing, sorrowful, warm', keyFeatures: 'Domestic interiors, kind close-ups, zodiac motifs, school-day softness, emotionally loaded embraces' },
    { name: 'Nana - Black-Lace Apartment Heartbreak', aesthetic: 'Fashion-forward adult shojo, cigarette smoke over cramped Tokyo apartments, black lace and stage lights, romantic damage, friendship and ambition grinding together', atmosphere: 'Stylish, aching, intimate, adult', keyFeatures: 'Fashion silhouettes, apartment intimacy, concert lighting accents, emotional confrontation framing, black-lace detail' },
    { name: 'Kimi ni Todoke - Shy Hallway Bloom', aesthetic: 'Ultra-gentle school romance, nervous hallway glances, clean daylight, social fear thawing into warmth, sincerity as spectacle, fragile closeness and kindness', atmosphere: 'Shy, bright, hopeful, soft', keyFeatures: 'Hallway proximity, blush-heavy face acting, classroom sunlight, friendship-circle warmth, delicate confession framing' },
    { name: 'Ouran High School Host Club - Rose-Cloud Flirt Theater', aesthetic: 'Elite-school parody romance, princely posturing, rose-cloud backdrops, theatrical flirting, comedy elegance, emotional sincerity hiding under polished nonsense', atmosphere: 'Playful, elegant, satirical, affectionate', keyFeatures: 'Rose effects, princely poses, ornate academy props, ensemble comedy staging, polished costume detail' },
    { name: 'Paradise Kiss - Runway Heartbreak Chic', aesthetic: 'Fashion-school rebellion, runway fabrics, adult yearning, punk glamour, cigarettes and sewing rooms, glossy color and emotional mess sharing the same pose', atmosphere: 'Chic, restless, romantic, self-inventing', keyFeatures: 'Runway silhouettes, sewing-room textures, fashion detail, angular romantic posing, city-night glamour' },
    { name: 'Lovely Complex - Height-Gap Comedy Romance', aesthetic: 'Osaka school romance with comedy timing, exaggerated embarrassment, height-contrast staging, playful face acting, colorful youthful banter with full-hearted payoff', atmosphere: 'Funny, sweet, loud, sincere', keyFeatures: 'Height-contrast compositions, comic reaction faces, school-date props, banter body language, bright urban youth color' },
    { name: 'Skip Beat! - Revenge Idol Stardom Spark', aesthetic: 'Show-business transformation, spite-fueled determination, flamboyant acting rehearsal, revenge turning into self-discovery, theatrical wardrobe energy, emotion rendered in starbursts and masks', atmosphere: 'Driven, theatrical, glittering, intense', keyFeatures: 'Showbiz costumes, rehearsal spaces, mask symbolism, expressive revenge faces, starburst comedic effects' },
    { name: 'Boys Over Flowers - Elite Campus Melodrama', aesthetic: 'Luxury-school social cruelty, staircase confrontations, expensive uniforms, humiliations blooming into romance, glossy teen melodrama with sharp class contrast', atmosphere: 'Tumultuous, glamorous, bruising, addictive', keyFeatures: 'Elite school props, social hierarchy staging, staircase confrontations, polished uniform detail, rain-soaked dramatic beats' },
    { name: 'Orange - Sunset Regret Letter Drama', aesthetic: 'Time-bending school romance, sunset sports fields, letters from the future, emotional caution and missed chances, warm orange light carrying quiet grief', atmosphere: 'Regretful, warm, hopeful, bittersweet', keyFeatures: 'Letter motifs, sunset field backdrops, teen ensemble tenderness, time-memory framing, restrained confession scenes' },
    { name: 'Ao Haru Ride - Clean Uniform Reunion Ache', aesthetic: 'Polished school romance, former-crush reunion tension, clean uniforms, hallway silences, emotionally guarded adolescence, cool beauty hiding confusion', atmosphere: 'Pensive, attractive, hesitant, tender', keyFeatures: 'Clean school styling, reunion glances, cool-guy silhouette contrast, airy campus spaces, heart-stopping close-ups' },
    { name: 'Say I Love You - Night-Walk Intimacy', aesthetic: 'More grounded shojo romance, late-night streets, shy trust-building, protective closeness, simple fashion and emotionally readable modern tenderness', atmosphere: 'Intimate, cautious, warm, vulnerable', keyFeatures: 'Night-walk lighting, modern casual outfits, protective gesture language, realistic school-date spaces, trust-building eye contact' },
    { name: 'Maid Sama! - Secret Uniform Double Life', aesthetic: 'Student-council severity clashing with maid-cafe blush comedy, hidden identity sparkle, strict posture dissolving into embarrassment, high-energy romantic power-play', atmosphere: 'Combative, cute, sparkling, energetic', keyFeatures: 'Maid-cafe props, strict-to-flustered acting, secret-identity staging, school-authority costume contrast, playful dominance framing' },
    { name: 'Snow White with the Red Hair - Herbal Courtship Fantasy', aesthetic: 'Gentle herbalist heroine, medieval court warmth, red-hair glow, palace gardens, respectful romance, competence and tenderness rendered in luminous fantasy elegance', atmosphere: 'Graceful, capable, warm, romantic', keyFeatures: 'Herbal props, palace-garden backdrops, red-hair focal contrast, respectful body language, fantasy court costume detail' },
    { name: 'Rose of Versailles - Court Portrait Revolution', aesthetic: 'Baroque court melodrama, powdered elegance, sword-bearing nobility, revolution on the horizon, lace and tragedy rendered with operatic grandeur', atmosphere: 'Regal, tragic, historic, operatic', keyFeatures: 'Baroque interiors, lace uniforms, court portrait poses, revolutionary tension, tear-bright dramatic gazes' },
    { name: 'Neighborhood Story - Harajuku Handmade Romance', aesthetic: '90s fashion-school youthfulness, handmade accessories, Harajuku color pops, neighborhood love drama, cute clutter and ambitious creative dreams', atmosphere: 'Cute, stylish, youthful, crafty', keyFeatures: 'Handmade accessories, Harajuku color, art-school props, street-fashion silhouettes, neighborhood romance staging' },
    { name: 'Honey and Clover - Art-School Spring Ache', aesthetic: 'Art-student shojo-seinen blend, spring light, campus studios, unspoken longing, youth drifting toward adulthood through creativity and fragile friendship', atmosphere: 'Soft, wistful, intelligent, aching', keyFeatures: 'Art-studio props, spring campus light, quiet ensemble spacing, unspoken affection acting, sketchbook textures' },
    { name: 'Kamisama Kiss - Shrine Romance and Fox Familiar', aesthetic: 'Modern shrine romance, fox-familiar charm, godhood responsibilities, soft comedy and spiritual tenderness, moonlit shrine stairs and magical domesticity', atmosphere: 'Playful, spiritual, romantic, luminous', keyFeatures: 'Shrine props, fox motifs, moonlit stair scenes, divine-contract details, playful supernatural intimacy' },
    { name: 'Princess Jellyfish - Jelly-Color Otaku Makeover', aesthetic: 'Otaku apartment eccentricity, fashion makeovers, jellyfish softness, outsider-sisterhood warmth, frills and insecurity rendered with bright empathy', atmosphere: 'Eccentric, sweet, transformative, cozy', keyFeatures: 'Jellyfish motifs, frilly fabric detail, apartment-clan clutter, makeover contrasts, sisterhood group energy' },
    { name: 'Yona of the Dawn - Crimson Princess Resolve', aesthetic: 'Desert and palace journeys, red-hair heroine resolve, loyal guardians, folk-fantasy romance, travel hardship softened by devotion and destiny', atmosphere: 'Resolute, romantic, sweeping, brave', keyFeatures: 'Travel-cloak silhouettes, red-hair focal points, palace-to-wilderness contrast, guardian ensemble staging, heroic profile poses' },
    { name: 'Sukitte Ii na yo - Rainy Umbrella Confession', aesthetic: 'Contemporary shojo realism, umbrellas, rain-soaked school romance, tentative self-worth, modern intimacy and apology under sodium streetlights', atmosphere: 'Rainy, vulnerable, sincere, modern', keyFeatures: 'Umbrella framing, rain reflections, urban school-route scenery, hesitant touch language, confession-heavy close-ups' },
  ],
  '5. Slice of Life & Moe': [
    { name: 'Hyouka - Tea-Light Mystery Classroom', aesthetic: 'Quiet school mysteries, careful eye animation, old clubrooms, books and tea, low-drama deduction made beautiful through light and stillness, curiosity carrying the frame', atmosphere: 'Curious, refined, calm, observant', keyFeatures: 'Clubroom detail, tea-and-book props, attentive facial acting, sunlit dust motes, restrained mystery framing' },
    { name: 'Tamako Market - Mochi Street Warmth', aesthetic: 'Shopping-street community coziness, mochi-shop sweetness, cheerful signage, festival intimacy, Kyoto warmth, low-stakes affection and local routine charm', atmosphere: 'Cheerful, neighborhood-soft, tasty, warm', keyFeatures: 'Shopping-street props, food-stall detail, community ensemble staging, festival banners, cozy storefront lighting' },
    { name: 'A Place Further Than the Universe - Youth Expedition Glow', aesthetic: 'Teen friendship turned expedition dream, bright skies, travel prep, school uniforms becoming adventure gear, emotional propulsion through ordinary sincerity', atmosphere: 'Hopeful, brave, bright, uplifting', keyFeatures: 'Travel gear, sky-heavy framing, friendship ensemble, determination close-ups, journey-prep montages' },
    { name: 'Aria - Canal Breeze Healing Reverie', aesthetic: 'Neo-Venezia gondola calm, watercolor water reflections, healing-company warmth, slow conversational days, beautiful emptiness and kindness drifting through every frame', atmosphere: 'Healing, airy, serene, luminous', keyFeatures: 'Canal reflections, gondola silhouettes, white uniforms, water-breeze softness, peaceful city panoramas' },
    { name: 'Barakamon - Island Calligraphy Summer', aesthetic: 'Remote-island humor, calligraphy ink, lively kids, ocean wind and self-reinvention, fish-market energy, broad comedy softened by natural summer beauty', atmosphere: 'Refreshing, funny, breezy, heartfelt', keyFeatures: 'Calligraphy tools, seaside village backdrops, energetic kids, summer sky expanses, fish-and-field props' },
    { name: 'Usagi Drop - Single-Parent Everyday Tenderness', aesthetic: 'Gentle domestic routine, childcare sincerity, small apartments, school lunches, emotional growth through quiet responsibility and ordinary care', atmosphere: 'Tender, domestic, patient, soft', keyFeatures: 'Household routine props, lunchbox detail, caregiving gestures, neighborhood paths, parent-child framing' },
    { name: 'Shirobako - Anime Studio Workday Cheer', aesthetic: 'Production-desk realism, scooters and keyframes, team stress turned camaraderie, office coffee and deadline boards, professional slice-of-life with hopeful momentum', atmosphere: 'Busy, collaborative, stressed, upbeat', keyFeatures: 'Desk clutter, storyboards, production checklists, team ensemble acting, studio fluorescent warmth' },
    { name: 'Do It Yourself!! - Handmade Craft Club Glow', aesthetic: 'DIY school-club softness, tactile wood and cloth, earnest beginner craftsmanship, warm afternoons, friendship built one handmade object at a time', atmosphere: 'Crafty, sweet, tactile, optimistic', keyFeatures: 'Tools and craft materials, workshop sunlight, beginner-made textures, friend-group posing, handmade object focus' },
    { name: 'Is the Order a Rabbit? - Cafe Sugar Cotton', aesthetic: 'Dessert-cafe moe softness, tiny uniforms, foam art and lace trims, decorative interiors, sugar-sweet pacing, plush friendliness and cozy customer-service charm', atmosphere: 'Sugary, tiny, cute, soothing', keyFeatures: 'Cafe counters, lace uniform detail, desserts and teacups, plush texture cues, decorative interior symmetry' },
    { name: 'Hidamari Sketch - Art Dorm Sunshine Scribble', aesthetic: 'Art-student dorm life, warm sketchbook textures, soft geometric rooms, little daily rituals, low-pressure humor, cozy abstraction in everyday school life', atmosphere: 'Sunny, crafty, relaxed, cute', keyFeatures: 'Sketchbook props, dorm-room geometry, art-supplies clutter, soft comedic staging, warm pastel room light' },
    { name: 'Super Cub - Mechanical Quietude Road', aesthetic: 'Minimal school life transformed by a small motorbike, practical details, roadside sunlight, emotional expansion through ordinary movement and solitude', atmosphere: 'Minimal, freeing, quiet, clean', keyFeatures: 'Motorbike detail, roadside composition, practical school clothing, open-air framing, subtle emotional acting' },
    { name: 'Komi Can\'t Communicate - Chalkboard Social Jitters', aesthetic: 'School social-anxiety comedy with immaculate classrooms, chalkboard confession atmosphere, idealized modern student beauty filtered through nervous silence and cute exaggeration', atmosphere: 'Shy, polished, funny, affectionate', keyFeatures: 'Classroom orderliness, chalkboard motifs, awkward body language, social-jitter reaction beats, beauty-and-comedy contrast' },
    { name: 'Working!! - Family Restaurant Shift Comedy', aesthetic: 'Restaurant shift banter, aprons and order pads, ensemble workplace chemistry, low-stakes service chaos, after-school job warmth with punchy interactions', atmosphere: 'Cheery, busy, ensemble-driven, comfy', keyFeatures: 'Restaurant props, work-uniform silhouettes, coworker chemistry staging, service-counter compositions, comedic order-taking beats' },
    { name: 'Tanaka-kun Is Always Listless - Breeze-Drift Lethargy', aesthetic: 'High-school lethargy rendered as ambient art, soft wind, benches, low-energy friendship, sleepy body language and beautiful nothingness', atmosphere: 'Sleepy, gentle, airy, easygoing', keyFeatures: 'Reclined poses, breeze effects, bench-and-classroom staging, minimal exertion comedy, soft ambient light' },
    { name: 'Slow Loop - Riverside Fishing Sisters', aesthetic: 'Fishing-by-the-river domestic healing, inherited hobbies, pastel water surfaces, practical tackle detail, soft family reconstruction through outdoor routine', atmosphere: 'Pastoral, healing, quiet, tender', keyFeatures: 'Fishing gear, riverside backdrops, sibling closeness, reflective water light, practical outdoor textures' },
    { name: 'Laid-Back Camp - Winter Camp Stove Glow', aesthetic: 'Cold-weather camping coziness, puffy jackets, enamel mugs, practical gear, quiet friendship through warm food and starry nights, tactile outdoor comfort', atmosphere: 'Cozy, crisp, friendly, restorative', keyFeatures: 'Camp gear realism, stove warmth, starry-night campsites, bundled silhouettes, food-and-flame intimacy' },
    { name: 'Keep Your Hands Off Eizouken! - Sketch Imagination Sprint', aesthetic: 'Student creativity exploding into rough production fantasies, sketchbook engines, hand-built worlds, clubroom zeal, imagination visualized with practical design obsession', atmosphere: 'Inventive, spirited, nerdy, kinetic', keyFeatures: 'Sketch overlays, invention poses, clubroom clutter, production imagination sequences, rough-draft visual energy' },
    { name: 'Yama no Susume - Summit Day Friendship', aesthetic: 'Mountain-hiking schoolgirls, crisp air, trail snacks, gradual confidence building, summit panoramas, outdoor hobby warmth rendered with encouraging sincerity', atmosphere: 'Fresh, supportive, scenic, uplifting', keyFeatures: 'Hiking gear, trail compositions, summit vistas, friendship encouragement gestures, bright mountain skies' },
    { name: 'Daily Lives of High School Boys - Hallway Idiot Theater', aesthetic: 'Ordinary boys turning hallways and riverbanks into dead-serious nonsense stages, sketch-comedy timing, school-blazer awkwardness, underplayed absurdity', atmosphere: 'Goofy, deadpan, schoolyard, loose', keyFeatures: 'Blazer silhouettes, hallway conversation staging, low-budget absurdist posing, riverbank comedy scenes, ensemble rhythm' },
    { name: 'Sketchbook Full Colors - Stray Cat Afternoon', aesthetic: 'Quiet art-club slice of life, drifting cat encounters, little town details, watercolor-soft afternoons, nearly plotless observation turned deeply comforting', atmosphere: 'Drifting, soft, observant, comforting', keyFeatures: 'Sketchbook props, stray-cat motifs, little-town backdrops, warm afternoon light, observational stillness' },
  ],
  '6. Mecha & Cyberpunk': [
    { name: 'Macross - Idol Signal Dogfight', aesthetic: 'Missile-swarm dogfights and stage-light pop music, transformable jets, idol broadcast emotion, galactic war refracted through performance and longing', atmosphere: 'Aerial, poppy, heroic, romantic', keyFeatures: 'Transforming craft silhouettes, concert-stage lighting, missile-trail swarms, cockpit drama, idol-performance iconography' },
    { name: 'Patlabor - Municipal Mecha Procedure', aesthetic: 'Construction mechs, police procedure, Tokyo infrastructure realism, everyday bureaucracy around giant robots, practical engineering detail and low-key civic humor', atmosphere: 'Procedural, grounded, urban, practical', keyFeatures: 'Construction-mech detail, police command vehicles, urban infrastructure backdrops, practical control panels, civic-response staging' },
    { name: 'Bubblegum Crisis - Neon Power-Suit Hunt', aesthetic: 'Night-city women in armored suits, synth neon, biker cool, corporate conspiracies, 80s cyber-noir glamour with hard-chrome aggression', atmosphere: 'Glossy, dangerous, neon, rebellious', keyFeatures: 'Power-suit silhouettes, neon skyline reflections, biker fashion accents, corporate high-rise staging, chase-scene motion' },
    { name: 'Appleseed - Tactical Arcology Assault', aesthetic: 'Paramilitary city-state futurism, armored exosuits, clean arcologies, bio-political tactical drama, machine precision meeting postwar human fragility', atmosphere: 'Tactical, polished, civic, severe', keyFeatures: 'Arcology scale, exosuit detail, tactical squad formations, clean future architecture, hard-surface action framing' },
    { name: 'Battle Angel Alita - Scrap-Yard Velocity', aesthetic: 'Scrap-yard cyber-body resilience, motorball speed, junk and steel humanity, kinetic close-quarters violence, eyes full of ferocity and loss in a stacked metal city', atmosphere: 'Raw, fast, scrapyard, determined', keyFeatures: 'Cyber-limb detail, scrapyard verticality, speed-race framing, intimate combat poses, junk-metal textures' },
    { name: 'Ergo Proxy - Mausoleum City Dread', aesthetic: 'Domed-city despair, android personhood crisis, black fashion silhouettes, abandoned modernism, philosophical cyber-goth severity under rain and concrete', atmosphere: 'Bleak, cerebral, cool, funereal', keyFeatures: 'Black fashion silhouettes, brutalist city spaces, android detail, rain-darkened concrete, philosophical stillness' },
    { name: 'Texhnolyze - Rust Wire Descent', aesthetic: 'Underground cybernetic nihilism, rusted corridors, amputated bodies rebuilt with dead purpose, subterranean violence and social decay pressed into hard shadow', atmosphere: 'Nihilistic, rusted, oppressive, cold', keyFeatures: 'Subterranean urban decay, prosthetic-limb emphasis, rust-streak textures, brutalist tunnel depth, exhausted body language' },
    { name: 'Casshern Sins - White Wasteland Robot Elegy', aesthetic: 'Post-collapse robot mortality, pale ruin vistas, lonely black-and-white heroism, existential combat against entropy, dust and silence as atmosphere', atmosphere: 'Elegiac, pale, lonely, mythic', keyFeatures: 'Pale wasteland backdrops, elegant robot forms, collapse-era ruins, lonely hero framing, entropy motifs' },
    { name: 'Cyber City Oedo 808 - Prison Hacker Neon Vice', aesthetic: 'Criminal enforcers in a filthy cyber city, 80s neon vice, illegal tech, wet asphalt violence, hard-edged police-thriller futurism with dangerous swagger', atmosphere: 'Vice-soaked, neon, lawless, hardboiled', keyFeatures: 'Wet city alleys, criminal-tech props, prison-mercenary silhouettes, hard neon rim light, vice-district staging' },
    { name: 'BLAME! - Megastructure Terminal Silence', aesthetic: 'Endless concrete megastructure, tiny humans against impossible architecture, terminal-gun severity, industrial silence, machine civilization outliving meaning', atmosphere: 'Monumental, empty, lethal, alienated', keyFeatures: 'Megastructure scale, terminal-gun silhouettes, tiny-human framing, concrete abysses, machine-hall emptiness' },
    { name: 'RahXephon - Coral Mecha Liturgy', aesthetic: 'Musical metaphysics, blue-blood alien war, coral mecha forms, city-barrier mystery, operatic mecha emotion sung through strange sacred visuals', atmosphere: 'Operatic, mysterious, blue-lit, mournful', keyFeatures: 'Coral mecha shapes, musical-symbol motifs, sacred city scale, strange blue blood accents, lyrical combat framing' },
    { name: '86 - Dustfront Drone Lament', aesthetic: 'Warzone youth in spider-like machines, ethnic oppression, radio chatter over dust plains, tactical precision colliding with grief and dehumanization', atmosphere: 'Somber, tactical, windswept, tragic', keyFeatures: 'Spider-mech motion, dustfront horizon lines, military comms mood, squad-loss emotion, battlefield debris' },
    { name: 'Knights of Sidonia - Vacuum Fortress Survival', aesthetic: 'Starfortress life, austere uniforms, biomechanical space combat, humanity surviving in a giant drifting ship, stark cosmic isolation and disciplined action', atmosphere: 'Austere, cosmic, disciplined, lonely', keyFeatures: 'Fortress interior scale, biomechanical suits, starfield void contrast, military formation staging, sparse cosmic lighting' },
    { name: 'Muv-Luv Alternative - Tactical Suit Extinction War', aesthetic: 'Humanity-on-the-brink mecha warfare, alien mass threat, tactical suits in ruined cities, command-screen panic and military sacrifice at desperate scale', atmosphere: 'Dire, militarized, relentless, sacrificial', keyFeatures: 'Tactical suit silhouettes, command-screen overlays, alien swarm contrast, ruined city scale, emergency sortie framing' },
    { name: 'Megazone 23 - Highway Pop-Cyber Revelation', aesthetic: 'Motorcycle freedom, idol video lies, hidden-simulation city, glossy 80s cyber-youth rebellion, highways and holograms under manufactured skies', atmosphere: 'Sleek, rebellious, glossy, revelatory', keyFeatures: 'Motorcycle silhouettes, hologram-idol motifs, highway city night, hidden-system hints, glossy retro-future fashion' },
    { name: 'VOTOMS - Scopedog Trench Attrition', aesthetic: 'Utilitarian armored troopers, mud and rust, industrial war fatigue, scoped visor focus, practical mecha treated like military hardware rather than legend', atmosphere: 'Gruff, tactical, muddy, exhausted', keyFeatures: 'Scoped visor iconography, utilitarian mecha detail, trench-scale staging, rust-and-mud surfaces, hard-war realism' },
    { name: 'Gunbuster - Training Hangar to Galaxy Sacrifice', aesthetic: 'Sports-like mecha training escalating to impossible cosmic war, determination and scale, hot-blooded sacrifice, old-school mechanical heroism under starfield awe', atmosphere: 'Triumphant, emotional, colossal, earnest', keyFeatures: 'Training-hangar backdrops, giant-mecha launch energy, cosmic scale transitions, heroic shouting poses, sacrifice iconography' },
    { name: 'SSSS.Gridman - Tokusatsu Neon City Grid', aesthetic: 'Digital kaiju fights in suburban city blocks, tokusatsu legacy reframed through modern clean lines, neon grid overlays, giant-hero silhouette clarity and youth melancholy', atmosphere: 'Neon, heroic, melancholic, clean', keyFeatures: 'Grid overlays, giant-hero silhouettes, suburban city destruction, clean digital mecha lines, tokusatsu posing' },
    { name: 'Diebuster - Bubblegum Cosmic Overdrive', aesthetic: 'Wild scale shifts, pop-color mecha exuberance, expressive cosmic nonsense, energetic school-age pilots, giant impossible machines with playful confidence and heartbreak', atmosphere: 'Exuberant, strange, huge, heartfelt', keyFeatures: 'Scale-warp cosmic framing, pop-color mecha, playful pilot expressions, giant action silhouettes, impossible spectacle design' },
    { name: 'Promare - Tri-Color Fire Mecha Riot', aesthetic: 'Graphic neon geometry, fire rescue mecha, angular city infernos, theatrical hero rivalry, poster-bright color blocking and anti-naturalistic heat', atmosphere: 'Blazing, graphic, rebellious, maximal', keyFeatures: 'Tri-color flame blocks, angular mecha silhouettes, rescue iconography, graphic city infernos, poster-like action poses' },
  ],
  '7. Isekai & High Fantasy': [
    { name: 'Log Horizon - Strategy Guild City', aesthetic: 'MMO civilization after the log-in, guild politics, plaza meetings, tactical worldbuilding, glass-and-stone fantasy city life organized around systems and cooperation', atmosphere: 'Strategic, communal, thoughtful, adventurous', keyFeatures: 'Guild emblems, city-plaza staging, party-role clarity, system-overlay hints, collaborative ensemble framing' },
    { name: 'Grimgar - Smoke and Mud Underdog Party', aesthetic: 'Low-level adventurers in a damp fantasy world, debt and fear, smoky campfires, hesitant teamwork, grounded monster hunting and fragile grief', atmosphere: 'Humble, smoky, vulnerable, earnest', keyFeatures: 'Campfire staging, patched equipment, fearful party spacing, muddy paths, low-level survival details' },
    { name: 'Record of Lodoss War - OVA Quest Tapestry', aesthetic: 'Classic OVA fantasy grandeur, shining armor, party-lined adventure posters, elves and dragons under painterly skies, pure tabletop fantasy sincerity', atmosphere: 'Noble, mythic, classic, adventurous', keyFeatures: 'Party-quest formations, painterly fantasy skies, shining armor, dragon-scale worldbuilding, OVA-era grandeur' },
    { name: 'The Twelve Kingdoms - Imperial Destiny Chronicle', aesthetic: 'East Asian court-fantasy worldbuilding, beast envoys, throne-room mandate, wandering exile becoming sovereign, dense political mythology and spiritual weight', atmosphere: 'Regal, mythic, searching, fated', keyFeatures: 'Imperial robes, beast envoy motifs, throne-room scale, wandering-road contrast, mythology-rich props' },
    { name: 'The Vision of Escaflowne - Windblown Tarot Fantasy', aesthetic: 'Prophetic romance, knight armor, giant dragon mechs, red skies and courtly longing, 90s fantasy-shojo hybridity with wind-swept pageantry', atmosphere: 'Windswept, romantic, mystical, heroic', keyFeatures: 'Tarot symbolism, wind-swept capes, knight-mecha contrast, red-sky horizons, courtly emotional poses' },
    { name: 'Magi - Labyrinth Jewel Caravan', aesthetic: 'Arabian Nights adventure with bright jewel magic, bustling bazaars, dungeon towers, friendship and empire intrigue rendered through warm fantasy color', atmosphere: 'Colorful, adventurous, magical, expansive', keyFeatures: 'Bazaar detail, jewel magic, dungeon towers, caravan silhouettes, empire-versus-friendship staging' },
    { name: 'The Ancient Magus\' Bride - Thorn Cottage Enchantment', aesthetic: 'English-cottage occult romance, horned mage mystery, fairy folklore, moss and bone, tea and terror coexisting in lush magical domesticity', atmosphere: 'Enchanted, lonely, mossy, intimate', keyFeatures: 'Cottage interiors, fairy-folk props, horned mage silhouette, moss textures, magical domestic ritual' },
    { name: 'Delicious in Dungeon - Stove-Top Monster Cuisine', aesthetic: 'Dungeon delving as culinary craft, cast-iron pans over campfire, monster ingredients, practical fantasy ecology, hungry camaraderie and dangerous kitchens in stone ruins', atmosphere: 'Hearty, curious, practical, fun', keyFeatures: 'Cooking tools, dungeon stones, monster-ingredient motifs, hungry party expressions, practical ecology detail' },
    { name: 'Ascendance of a Bookworm - Printing Press Devotion', aesthetic: 'Frailty and obsession in a medieval city, books as holy technology, artisan workshops, ink-stained determination, domestic fantasy transformed by literacy and craft', atmosphere: 'Studious, tender, artisanal, determined', keyFeatures: 'Paper-and-ink props, workshop interiors, small protagonist contrast, guild-craft details, devotion to books made visual' },
    { name: 'The Faraway Paladin - Quiet Temple Quest', aesthetic: 'Solemn undead guardians, quiet vows, old temples, righteous adventure without irony, dawn-lit armor and spiritual apprenticeship in a lonely fantasy world', atmosphere: 'Solemn, devout, hopeful, old-world', keyFeatures: 'Temple stonework, guardian silhouettes, dawn-lit armor, vow-centered posing, pilgrimage-road compositions' },
    { name: 'Saga of Tanya the Evil - Aerial War Mage Doctrine', aesthetic: 'Military bureaucracy and high-altitude spell warfare, trench maps and gemstone computation, ruthless child officer commanding impossible destruction in a pseudo-European war', atmosphere: 'Severe, tactical, aerial, merciless', keyFeatures: 'Aerial magic circles, military map props, child-officer contrast, war-cloud skies, tactical command poses' },
    { name: 'Campfire Cooking in Another World - Merchant Road Stew', aesthetic: 'Traveling fantasy comfort food, merchant roads, giant familiar appetite, practical camp cookware, low-stakes abundance and wandering culinary coziness', atmosphere: 'Relaxed, tasty, itinerant, warm', keyFeatures: 'Cookpot focus, road-camp compositions, familiar-animal scale contrast, merchant packs, food-steam detail' },
    { name: 'The Saint\'s Magic Power Is Omnipotent - Herbarium Court Glow', aesthetic: 'Adult heroine competence, herbal labs, court politeness, soothing green magic, restrained romance and workplace fantasy healing rendered with poised elegance', atmosphere: 'Calm, capable, luminous, graceful', keyFeatures: 'Herbal-lab props, court costume detail, gentle magic bloom, composed heroine posture, workplace-fantasy warmth' },
    { name: 'Fushigi Yuugi - Celestial Maiden Portal Epic', aesthetic: 'Book-portal romance fantasy, celestial symbols, guardian warriors, earnest devotion, soft 90s magical drama and travel-heavy emotional stakes', atmosphere: 'Fated, romantic, bright, dramatic', keyFeatures: 'Celestial motifs, guardian ensemble, portal iconography, travel-costume detail, soft dramatic glances' },
    { name: 'Magic Knight Rayearth - Gem-Engine Rescue Quest', aesthetic: 'Rescue fantasy with armor, giant summons, rune-powered machinery, candy-bright courage and mystical quest framing for a heroic team of girls', atmosphere: 'Brave, bright, enchanted, team-driven', keyFeatures: 'Rune magic, armor accents, giant summon silhouettes, quest-team posing, jewel-bright backgrounds' },
    { name: 'Inuyasha - Shrine-Well Sengoku Pursuit', aesthetic: 'Schoolgirl through the bone-eater\'s well, beads and claws, demon-laden forests, sacred arrows, romance and bickering on a feudal road beneath red skies', atmosphere: 'Adventurous, combative, nostalgic, mythic', keyFeatures: 'Shrine-well iconography, demon forest backdrops, sacred-arrow poses, clawed silhouette, traveling-party dynamics' },
    { name: 'Tsukimichi - Moonlit Merchant Wanderer', aesthetic: 'Offbeat overpowered merchant fantasy, moonlit roads, demi-human communities, deadpan social detachment, practical trade and absurd strength sharing the same calm frame', atmosphere: 'Detached, moonlit, practical, powerful', keyFeatures: 'Merchant-road props, moonlit travel staging, overpowered calm posing, demi-human ensemble, trade-driven worldbuilding' },
    { name: 'Handyman Saitou in Another World - Toolbox Party Quest', aesthetic: 'Mundane practical skills becoming precious in fantasy, rope and lockpick utility, modest party bonds, dungeon logistics with empathy and comic warmth', atmosphere: 'Practical, warm, modest, dependable', keyFeatures: 'Toolbox motifs, support-role staging, dungeon logistics, practical problem-solving poses, everyday-competence charm' },
    { name: 'Ranking of Kings - Storybook Crown Courage', aesthetic: 'Child-king underdog fantasy, soft storybook lines, giant emotional sincerity, fairy-tale castles and bodily vulnerability transformed into heroic grace', atmosphere: 'Innocent, moving, brave, storybook', keyFeatures: 'Storybook castle forms, tiny-hero scale contrast, crown motifs, emotional gesture clarity, fairy-tale silhouettes' },
    { name: 'Princess Connect! Re:Dive - Banquet Quest Pastel', aesthetic: 'Bright fantasy party with desserts, polished town squares, cute teamwork, soft comedy, banquet abundance and colorful adventure rendered with candy-clean appeal', atmosphere: 'Cheerful, tasty, friendly, polished', keyFeatures: 'Banquet spreads, polished town plazas, cute party staging, candy-fantasy color, soft comedic expressions' },
  ],
  '8. Dark Fantasy & Seinen': [
    { name: 'Berserk - Black Swordsman Eclipse Scar', aesthetic: 'Trauma-forged wanderer, sacrificial horror memories, black plate and colossal steel, bleak medieval landscapes, violence as burden and destiny under eclipse-dark skies', atmosphere: 'Savage, doomed, furious, haunted', keyFeatures: 'Massive sword scale, eclipse imagery, scar-heavy faces, black armor silhouette, medieval ruin backdrops' },
    { name: 'Monster - Hospital Corridor Suspicion', aesthetic: 'European hospital realism, moral dread, quiet pursuit of a smiling void, small details loaded with danger, adult faces and sterile rooms carrying unbearable tension', atmosphere: 'Paranoid, humane, cold, intelligent', keyFeatures: 'Hospital corridors, realistic adult expressions, quiet pursuit framing, European interiors, suspicion in stillness' },
    { name: 'Gantz - Black-Sphere Execution Room', aesthetic: 'Late-night urban death game, latex-black suits, green target lasers, nihilistic violence, apartment grit and afterlife machinery rendered with cynical precision', atmosphere: 'Cruel, flashy, nihilistic, electric', keyFeatures: 'Black-suit silhouettes, target-laser accents, death-room geometry, urban-night grime, ruthless body-language' },
    { name: 'Elfen Lied - Pink-Haired Laboratory Rupture', aesthetic: 'Laboratory escape horror, innocence colliding with telekinetic dismemberment, rain-slick trauma, songlike sadness under clinical violence and broken memory', atmosphere: 'Sad, violent, clinical, exposed', keyFeatures: 'Laboratory corridors, blood-on-white contrast, horned profile silhouette, rain-sad close-ups, invisible-attack framing' },
    { name: 'Vampire Hunter D: Bloodlust - Baroque Wasteland Chase', aesthetic: 'Baroque vampire castles, post-apocalyptic moonlight, impossibly elegant hunter silhouette, gothic machinery, rose-black romance and predatory splendor in motion', atmosphere: 'Elegant, predatory, moonlit, decadent', keyFeatures: 'Hunter silhouette, gothic carriage and castle props, moonlit wasteland, aristocratic monster design, baroque frame detail' },
    { name: 'Ajin - Black-Particle Pursuit', aesthetic: 'Modern fugitive thriller with immortal black entities, clinical modern spaces, matte-black supernatural forms, tactical government chase and identity terror', atmosphere: 'Hunted, modern, sharp, remorseless', keyFeatures: 'Black-particle beings, fugitive staging, modern architecture, tactical pursuit framing, clinical dread' },
    { name: 'Blade of the Immortal - Ink-Slashed Revenge', aesthetic: 'Wounded immortal samurai, blood-ink brush ferocity, revenge road under harsh weather, period grime and severe blade choreography rendered with punishing detail', atmosphere: 'Vengeful, weathered, severe, bloody', keyFeatures: 'Ink-heavy slash marks, period grime, scarred body detail, sword-road compositions, revenge-focused stares' },
    { name: 'Kaiji - Neon Despair Gambling Pit', aesthetic: 'Underground gambling hell, fluorescent sweat, jagged noses, impossible tension over money and survival, adult ruin made graphic and ugly', atmosphere: 'Desperate, electric, ugly, suspenseful', keyFeatures: 'Gambling props, sweat-heavy close-ups, underground fluorescent rooms, sharp anxious silhouettes, brink-of-collapse facial acting' },
    { name: 'Akagi - Smoke-Filled Mahjong Predator', aesthetic: 'Night-long mahjong duels as psychological warfare, cigarette smoke, heavy shadows, old men unraveling around a supernatural prodigy, menace in still hands and eyes', atmosphere: 'Predatory, smoky, cerebral, merciless', keyFeatures: 'Mahjong-table compositions, smoke haze, old-man tension faces, hard shadow light, still-hand suspense' },
    { name: 'Dororo - Demon Road Severance', aesthetic: 'Body-part quest under cursed skies, muddy villages, war-torn feudal roads, child thief companionship, brutal folk-horror with emotional tenderness at its center', atmosphere: 'Bleak, raw, compassionate, cursed', keyFeatures: 'Prosthetic-limb motifs, demon silhouettes, war-torn village backdrops, child-and-warrior contrast, cursed-road framing' },
    { name: 'Heavenly Delusion - Concrete Wilderness Mystery', aesthetic: 'Abandoned institutions reclaimed by light and weeds, youth crossing a broken modern world, strange creatures, low-key banter hiding existential dislocation', atmosphere: 'Mysterious, sun-bleached, uneasy, searching', keyFeatures: 'Ruined modern campuses, weed-overgrown concrete, youth duo framing, creature-threat hints, road-mystery compositions' },
    { name: 'Pluto - Robot Mourning Detective Noir', aesthetic: 'Robot rights and murder investigation rendered with mature gravity, rain-dark cities, grieving machines, quiet luxury interiors and forensic dread', atmosphere: 'Somber, investigative, humane, futuristic', keyFeatures: 'Detective framing, rainlit urban luxury, adult-robot expressions, mourning atmosphere, forensic scene composition' },
    { name: 'Mushishi - Night Mushi Burial Calm', aesthetic: 'Ethereal countryside folklore for adults, pale glowing lifeforms, grief softened by natural cycles, dark forest quiet and contemplative medicine under moon haze', atmosphere: 'Quiet, eerie, compassionate, nocturnal', keyFeatures: 'Pale mushi traces, forest night atmosphere, healer-traveler pose language, natural-cycle motifs, moon-haze calm' },
    { name: 'Erased - Winter Apartment Suspicion', aesthetic: 'Snowy town melancholy, narrow apartment halls, child-endangerment dread, ordinary domestic spaces haunted by time and guilt, subdued thriller pacing', atmosphere: 'Wintry, tense, protective, melancholic', keyFeatures: 'Snow-town streets, apartment corridors, child-perspective contrast, subdued body language, guilt-heavy close-ups' },
    { name: 'Paranoia Agent - Bat-Wielding Civic Breakdown', aesthetic: 'Urban rumor panic, distorted ordinary citizens, media anxiety, dream-logic intrusion into modern neighborhoods, social collapse rendered through expression and pressure', atmosphere: 'Claustrophobic, surreal, civic, unstable', keyFeatures: 'Urban-anxiety iconography, distorted civilians, media clutter, rumor-driven framing, dream-crack visual cues' },
    { name: 'Shigurui - Sun-Bleached Sword Cruelty', aesthetic: 'Merciless feudal duel realism, heat and blood, rank hierarchy, mutilated bodies, severe silence before violence, beauty stripped down to cruelty and discipline', atmosphere: 'Brutal, austere, scorching, merciless', keyFeatures: 'Sun-bleached harshness, duel posture rigor, body-wound detail, class-hierarchy props, unbearable stillness' },
    { name: 'Boogiepop Phantom - Rusted Neon Adolescent Dread', aesthetic: 'Urban legend melancholy, industrial corridors, broken youth interiority, violet night, fractured chronology, faint supernatural presence threading through damaged city life', atmosphere: 'Melancholic, fragmented, nocturnal, ghostly', keyFeatures: 'Industrial school-city spaces, violet night tones, urban legend hints, fragmented framing, interior dread expressions' },
    { name: 'Land of the Lustrous - Mineral-Loneliness Combat', aesthetic: 'Gem-bodied fragility, open coasts, moonlit attackers, philosophical isolation, sharp beauty and bodily fracture in a stripped-down otherworldly ecosystem', atmosphere: 'Crystalline, lonely, austere, luminous', keyFeatures: 'Gem-body refractions, coastal emptiness, moonlit threat silhouettes, clean open compositions, fracture motifs' },
    { name: 'Jin-Roh - Red-Eyed Armor and Smoke', aesthetic: 'Alternate-history paramilitary noir, wolf-brigade armor, smoke-filled ruins, political dread and buried tenderness inside oppressive urban security machinery', atmosphere: 'Oppressive, political, smoky, tragic', keyFeatures: 'Red goggle glow, armored silhouettes, riot-ruin backdrops, political-security staging, smoke-dense composition' },
    { name: 'Hell Girl - Lantern Ferry Retribution', aesthetic: 'Supernatural vengeance in midnight villages and city edges, spider lilies, dark kimono serenity, hell correspondence rendered with calm cruelty and candlelight ritual', atmosphere: 'Cold, ritualistic, nocturnal, fatal', keyFeatures: 'Lantern light, spider lily motifs, dark kimono silhouette, ritual-ferry imagery, calm retribution close-ups' },
  ],
  '9. Studio Masterpieces': [
    { name: 'Millennium Actress - Cinema-Memory Snowfall', aesthetic: 'Life story retold through film fragments, period costumes flowing into each other, snow and studio lights, longing carried across eras with luminous cinematic tenderness', atmosphere: 'Nostalgic, romantic, layered, wistful', keyFeatures: 'Era-shifting costumes, snow and light interplay, memory-cinema transitions, poised heroine silhouettes, temporal montage feeling' },
    { name: 'Tokyo Godfathers - Christmas Alley Grace', aesthetic: 'Homeless trio comedy-drama, winter city alleys, neon nativity warmth, imperfect kindness in cramped urban spaces, humane chaos under holiday lights', atmosphere: 'Messy, humane, festive, redemptive', keyFeatures: 'Christmas neon, alleyway city depth, trio ensemble staging, urban clutter tenderness, improvised family body language' },
    { name: 'The Boy and the Heron - Marsh-Gate Mourning Dream', aesthetic: 'War-era estate mourning, uncanny bird guide, dream-architecture beyond grief, painterly reeds and tower spaces, Miyazaki late-style metaphysical tenderness', atmosphere: 'Mourning, uncanny, painterly, searching', keyFeatures: 'Heron guide silhouette, tower-and-marsh imagery, war-era domestic detail, dream-gate framing, grief-soaked stillness' },
    { name: 'Castle in the Sky - Floating Island Brass Adventure', aesthetic: 'Brass robots, cloud-sea wonder, floating island myth, children against militarized greed, steampunk adventure carried by open skies and hand-painted warmth', atmosphere: 'Adventurous, skybound, wondrous, brave', keyFeatures: 'Floating-island vistas, brass robot motifs, cloud-sea backdrops, child-duo silhouettes, sky-adventure motion' },
    { name: 'Nausicaa - Toxic Jungle Wind Prophecy', aesthetic: 'Post-apocalyptic ecology myth, glider silhouette over toxic forests, giant insects, compassion amid planetary ruin, wind and pollen carrying epic spiritual urgency', atmosphere: 'Prophetic, ecological, windswept, compassionate', keyFeatures: 'Glider profile, toxic-jungle color, giant-insect scale, wind-swept cloak movement, ecological epic framing' },
    { name: 'Wolf Children - Rainy Countryside Motherhood', aesthetic: 'Single-parent devotion across changing seasons, wolf-child wildness, mountain houses, weather-rich realism and fairy-tale softness in one maternal frame', atmosphere: 'Tender, rural, weathered, loving', keyFeatures: 'Seasonal countryside, parent-child motion, rain-swept fields, mountain-house intimacy, transformation softness' },
    { name: 'Belle - Virtual Cathedral Pop Opera', aesthetic: 'Digital fantasy stagecraft, whale-shaped servers, pop-idol catharsis, online identity and emotional spectacle rendered with ornate luminous scale', atmosphere: 'Grand, digital, heartfelt, operatic', keyFeatures: 'Virtual-cathedral geometry, pop-performance lighting, avatar elegance, online interface motifs, song-climax framing' },
    { name: 'The Girl Who Leapt Through Time - Summer Rooftop Rewind', aesthetic: 'Blue-sky school summer, leaping motion through ordinary neighborhoods, young regret and comedic consequence, warm clouds and temporal tenderness', atmosphere: 'Youthful, breezy, wistful, playful', keyFeatures: 'Rooftop and cloud framing, leaping-body motion, suburban summer light, time-jump iconography, youthful ensemble warmth' },
    { name: 'Angel\'s Egg - Cathedral Water Ruin Silence', aesthetic: 'Monumental gothic emptiness, impossible vessels, sacred ruin, dream-like Christian symbolism and oceanic stillness inside a nearly wordless apocalyptic reverie', atmosphere: 'Sacred, silent, dreamlike, mournful', keyFeatures: 'Cathedral ruin scale, water-black emptiness, egg imagery, elongated silhouettes, sacred-symbolic composition' },
    { name: 'Jin-Roh - Riot Smoke Tragedy Frame', aesthetic: 'Heavy riot armor, political sorrow, urban smoke and red optics, impossible tenderness trapped inside oppressive security structures and alternate-history unrest', atmosphere: 'Oppressive, tragic, political, smoky', keyFeatures: 'Riot-armor silhouettes, red optics, smoke-loaded streets, political unrest framing, tragic close-up tension' },
    { name: 'A Silent Voice - Riverside Apology Light', aesthetic: 'Modern-school emotional realism, bridges and rivers, apology and disability awareness, soft city sunlight, longing and accountability rendered with humane patience', atmosphere: 'Tender, remorseful, airy, human', keyFeatures: 'Riverside paths, modern school detail, hand-focused emotional framing, apology body language, soft city light' },
    { name: 'Inu-Oh - Heike Punk Stage Vision', aesthetic: 'Historical biwa performance exploding into glam-rock spectacle, distorted limbs turned into stage identity, medieval Japan colliding with ecstatic music-theater motion', atmosphere: 'Ecstatic, theatrical, historical, rebellious', keyFeatures: 'Stage-performance poses, historical costume-glam fusion, biwa instrumentation, audience-energy framing, body-transformation iconography' },
    { name: 'Tekkonkinkreet - Alleyway Child Myth', aesthetic: 'Urban kid mythology, crowded roofs and alleys, rough sacred city energy, innocence and violence stacked vertically in a dense modern labyrinth', atmosphere: 'Rough, spiritual, crowded, feral', keyFeatures: 'Dense city alleys, child silhouette contrast, rooftop motion, rough sacred iconography, urban myth staging' },
    { name: 'Mind Game - Psychedelic Escape Sprint', aesthetic: 'Explosive mixed-style self-reinvention, hot-blooded panic, abstract transitions, impossible comedic near-death and liberation surging through every visual decision', atmosphere: 'Liberating, insane, bright, kinetic', keyFeatures: 'Mixed-media bursts, escape-motion framing, psychedelic transitions, comic panic acting, freedom iconography' },
    { name: 'Liz and the Blue Bird - Oboe Hallway Distance', aesthetic: 'Delicate school music drama, pale interior light, oboe and flute emotional spacing, friendship rendered through tiny movements and corridor air', atmosphere: 'Fragile, musical, restrained, aching', keyFeatures: 'Instrument detail, hallway spacing, delicate body language, pale interior lighting, sound-as-distance imagery' },
    { name: 'Metropolis - Deco Skyline Android Wonder', aesthetic: 'Retro-futurist city towers, art-deco industrial grandeur, boy-and-android innocence, class conflict and monumental machinery in warm old-cinema wonder', atmosphere: 'Grand, nostalgic, metallic, human', keyFeatures: 'Deco skyline forms, android character contrast, monumental machinery, crowd-class scale, retro-future city framing' },
    { name: 'The Garden of Words - Rain Pavilion Solitude', aesthetic: 'Hyper-detailed rain, shoes and leaves, quiet age-gap longing, garden pavilion intimacy, wet surfaces carrying impossible emotional precision', atmosphere: 'Rainy, intimate, lonely, exquisite', keyFeatures: 'Rain-surface detail, pavilion framing, shoe-and-step motifs, wet foliage reflections, emotionally charged stillness' },
    { name: 'Night Is Short, Walk on Girl - Drunken Kyoto Whirl', aesthetic: 'Nightlife romance rendered as a whimsical city odyssey, pub interiors, surreal side quests, warm chaos and literary flirtation rushing through one magical evening', atmosphere: 'Tipsy, whimsical, urban, affectionate', keyFeatures: 'Night-street glow, pub clutter, festival-night momentum, literary props, whimsical encounter staging' },
    { name: 'Paprika - Parade Dream-Collapse Carnival', aesthetic: 'Psychoanalytic dream parades, appliance-icon chaos, identity slippage, theater curtains and impossible transitions, carnival-density surrealism with polished motion logic', atmosphere: 'Surreal, carnivalesque, invasive, dazzling', keyFeatures: 'Dream-parade motifs, appliance iconography, stage-curtain transitions, identity-split framing, polished dream density' },
    { name: 'Promare - Chromatic Firestorm Hero Theater', aesthetic: 'Poster-bright rescue spectacle, triangular flames, anti-naturalistic mecha firefighting, operatic rivals, maximal color-block motion and modern theatrical bravado', atmosphere: 'Blazing, theatrical, graphic, triumphant', keyFeatures: 'Triangular fire shapes, rescue-mecha silhouettes, poster-color blocking, rival hero staging, maximal graphic motion' },
  ],
  '10. 70s & 80s Retro Anime': [
    { name: 'Space Battleship Yamato - Bridge of Last Hope', aesthetic: 'Heroic bridge-deck drama, blue space oceans, giant battleship gravitas, analog control panels, humanity-faces-extinction sincerity and noble formation flying', atmosphere: 'Noble, urgent, cosmic, patriotic', keyFeatures: 'Battleship silhouettes, bridge-console layouts, star-ocean backdrops, formation-fleet compositions, noble crew acting' },
    { name: 'Captain Harlock - Cape in the Star Wind', aesthetic: 'Romantic outlaw in deep space, skull insignia, lonely heroic piracy, cape whipping against starfields, melancholic rebellion at operatic scale', atmosphere: 'Romantic, lonely, rebellious, cosmic', keyFeatures: 'Cape silhouette, skull insignia, starfield loneliness, bridge-deck poses, outlaw idealism framing' },
    { name: 'Galaxy Express 999 - Celestial Rail Melancholy', aesthetic: 'Railway slicing through the cosmos, immortal sorrow, station-platform nostalgia, child traveler wonder mixed with elegiac infinite travel', atmosphere: 'Melancholic, wondrous, star-bound, poetic', keyFeatures: 'Cosmic train imagery, station platforms, traveler duo staging, star-snow ambience, long-journey symbolism' },
    { name: 'Rose of Versailles - Baroque Uniform Revolt', aesthetic: 'Baroque court portraiture, officer uniforms, revolutionary romance, powdered elegance cracking under history, roses and tears moving through palace light', atmosphere: 'Regal, tragic, historical, dramatic', keyFeatures: 'Baroque interiors, uniform detail, rose symbolism, court portrait poses, revolutionary tension' },
    { name: 'Urusei Yatsura - Neon Oni Rom-Com', aesthetic: '80s TV color punch, alien-schoolgirl chaos, domestic slapstick, fluorescent city nights, sci-fi flirtation and loud romantic nonsense', atmosphere: 'Hyper, flirty, neon, mischievous', keyFeatures: 'Oni-horn silhouette, neon-night streets, domestic-comedy staging, alien-tech gags, loud expression acting' },
    { name: 'Maison Ikkoku - Boarding House Sunset', aesthetic: 'Adult rom-com tenderness, boarding-house clutter, sunset laundry, long-term yearning and everyday comedy rendered with mature retro softness', atmosphere: 'Warm, wistful, domestic, patient', keyFeatures: 'Boarding-house props, sunset balconies, mature-romance close-ups, everyday clutter, retro domestic calm' },
    { name: 'Touch - Baseball Summer Nostalgia', aesthetic: 'Summer baseball and adolescent longing, school uniforms and batting cages, warm retro youth melancholy, sports and romance sharing one humid frame', atmosphere: 'Nostalgic, warm, athletic, wistful', keyFeatures: 'Baseball gear, sunset field staging, summer uniforms, emotional sports framing, youth-love distance' },
    { name: 'City Hunter - Glass-Tower Neon Gunplay', aesthetic: '80s action-comedy private-eye swagger, skyscraper nights, shoulder pads and handguns, comic pervert bravado punctured by crisp urban action cool', atmosphere: 'Suave, neon, funny, dangerous', keyFeatures: 'Skyscraper-night backdrops, detective handgun poses, 80s fashion detail, urban chase framing, slick-comedy contrast' },
    { name: 'Dirty Pair - Trouble Consultant Laser Glam', aesthetic: 'Bright sci-fi fashion, disaster-prone heroines, white corridors and pink explosions, glamorous chaos in one of the most colorful 80s space-action registers', atmosphere: 'Flashy, mischievous, poppy, explosive', keyFeatures: 'Sci-fi fashion silhouettes, white-corridor staging, laser effects, duo dynamic posing, glam-chaos color balance' },
    { name: 'Crusher Joe - Orange Suit Space Pulp', aesthetic: 'Working-space-adventurer bravado, orange pilot suits, ship hangars, pulpy rescue jobs, professional competence and 80s optimism under hard cel color', atmosphere: 'Pulp, adventurous, capable, bright', keyFeatures: 'Pilot-suit color pop, hangar interiors, rescue-job framing, working-spacecrew staging, 80s cel boldness' },
    { name: 'Future Boy Conan - Rust Island Sky Hope', aesthetic: 'Post-collapse island adventure, boyish athleticism, rusted relics and blue oceans, early-Miyazaki environmental hope and motion-rich sincerity', atmosphere: 'Hopeful, athletic, breezy, adventurous', keyFeatures: 'Island-and-ocean vistas, rust relics, boy-hero movement, environmental adventure cues, sky-bright optimism' },
    { name: 'Cat\'s Eye - Gallery Heist Red Leotard', aesthetic: 'Art-thief sisters, red leotards, museum-night spotlights, cat burglar poise, romance and heist glamour rendered with 80s urban polish', atmosphere: 'Sly, elegant, nocturnal, glamorous', keyFeatures: 'Museum heist props, red-leotard silhouettes, spotlight cones, trio-sister staging, cat-burglar grace' },
    { name: 'Saint Seiya - Constellation Armor Clash', aesthetic: 'Mythic armor, zodiac temples, heroic friendship, constellation power flares, divine punches and young blood screaming beneath marble skies', atmosphere: 'Mythic, earnest, celestial, fierce', keyFeatures: 'Armor silhouettes, constellation effects, temple staircases, team-friendship posing, marble-sky epic scale' },
    { name: 'Gunbuster - Tears Before Warp Launch', aesthetic: 'Training montage emotion, giant launch gantries, hot-blooded schoolgirls and cosmic stakes, tears and determination rendered in thick retro spectacle', atmosphere: 'Earnest, grand, tearful, heroic', keyFeatures: 'Launch-gantry scale, mecha training posture, crying determination close-ups, retro-cosmic effects, school-to-war contrast' },
    { name: 'Zeta Gundam - Colony Flashpoint Tragedy', aesthetic: 'Sharper-edged war mecha, colony politics, cockpit grief, military uniforms under harsher 80s sci-fi lighting, youth crushed by factional conflict', atmosphere: 'Tense, militarized, tragic, angular', keyFeatures: 'Cockpit and colony imagery, war-uniform silhouettes, sharper mecha forms, political tension framing, pilot trauma close-ups' },
    { name: 'Aura Battler Dunbine - Insect Mecha Mistrealm', aesthetic: 'Fantasy-mecha hybrid with insect armor, misty otherworld terrain, sword-bearing machines, 80s dreamlike war fantasy suspended in glowing fog', atmosphere: 'Strange, misty, heroic, otherworldly', keyFeatures: 'Insect-mecha silhouettes, mist realms, sword poses, fantasy-war backdrops, luminous fog atmosphere' },
    { name: 'Megazone 23 - Arcade Highway Revelation', aesthetic: 'Bike speed, arcade neon, hidden-city truth, youth rebellion under simulated skies, glossy urban 80s tech mythmaking', atmosphere: 'Sleek, rebellious, nocturnal, revelatory', keyFeatures: 'Arcade glow, motorcycle motion, hidden-system hints, urban highways, youth-rebellion silhouettes' },
    { name: 'Devilman 1972 - Psychedelic Devil Cry', aesthetic: 'Raw 70s demonic transformation, wild color flashes, anguished screaming, biblical panic and old-TV violence rendered with unhinged retro intensity', atmosphere: 'Panic-struck, psychedelic, tragic, primal', keyFeatures: 'Demonic transformation poses, old-TV color harshness, screaming faces, biblical-horror iconography, raw retro violence' },
    { name: 'Super Dimension Fortress Macross - Carrier Deck Pop Destiny', aesthetic: 'Carrier-deck mecha operations mixed with pop-idol fate, city-inside-ship scale, missiles and melodies sharing one dramatic retro-future frame', atmosphere: 'Romantic, strategic, pop-infused, starry', keyFeatures: 'Carrier-deck staging, idol symbolism, city-inside-ship backdrops, missile salvos, retro-future military glam' },
    { name: 'Space Adventure Cobra - Red Jacket Laser Rogue', aesthetic: 'Easygoing cosmic rogue swagger, laser arm, nightclub planets, flirtation and danger with a perpetual grin, pulp-space cool rendered in cel-era shine', atmosphere: 'Cocky, cosmic, playful, dangerous', keyFeatures: 'Red-jacket silhouette, laser-arm iconography, nightclub planet backdrops, rogue body language, pulp-space framing' },
  ],
  '11. Anime Style Spectrum': [
    { name: 'Yoshitaka Amano - Ether-Wisp Gothic Fantasy', aesthetic: 'Ethereal Amano-like fantasy, elongated bodies dissolving into decorative ink wisps, celestial melancholy, gilded voids, feather-light detail with dream-goth elegance', atmosphere: 'Ethereal, baroque, sorrowful, celestial', keyFeatures: 'Elongated figures, decorative ink wisps, gilded accents, void-rich composition, feathered costume detail', colorPalette: 'Ivory, antique gold, moon-silver, dried rose, abyssal indigo, pale orchid haze', lightingSetup: 'Moonlit haze, diffuse heavenly glow, soft metallic gleam, spectral backlighting', materialTexture: 'Airbrush mist, metallic leaf suggestion, silk translucency, ink feathering, velvety emptiness', spatialDistortion: 'Weightless elongation, draped limbs, gravity-light hair flow, cathedral-thin silhouettes', formAndLine: 'Hair-thin ornamental contour, calligraphic tapering, decorative filigree line drift' },
    { name: 'CLAMP - Celestial Limb Elongation', aesthetic: 'Elegant CLAMP-inspired supernatural poise, impossibly long limbs, ornate costume geometry, moonlit glamour, emotional restraint inside luminous fantasy fashion', atmosphere: 'Elegant, lunar, poised, dramatic', keyFeatures: 'Extremely long limbs, ornate costume geometry, moonlit framing, jewel accessories, poised emotional distance', colorPalette: 'Pearl white, amethyst, midnight blue, rose quartz, icy silver, celestial lavender', lightingSetup: 'Soft moon-rim illumination, jewel-like specular accents, staged dramatic glow', materialTexture: 'Silk sheen, gem sparkle, lace filigree, polished hair ribbons, glossy eye highlights', spatialDistortion: 'Fashion-figure proportions, cathedral-tall silhouettes, elegant hand and neck extension', formAndLine: 'Refined tapered contour, ornamental costume linework, graceful eyelash intricacy' },
    { name: 'Naoko Takeuchi - Moon-Prism Glamour Frame', aesthetic: 'Shimmering magical-girl glamour with fashion-magazine grace, moon-prism romance, jeweled poses, diary-heart tenderness and celestial femininity', atmosphere: 'Romantic, sparkling, feminine, dreamy', keyFeatures: 'Moon motifs, gem brooches, fashion poses, ribbon motion, starry romance framing', colorPalette: 'Blush pink, moon white, navy velvet, gold sparkle, peach pearl, lavender gleam', lightingSetup: 'Soft star-filter bloom, moonlit key light, cosmetic glow with sparkle flares', materialTexture: 'Glossy lips, satin ribbons, enamel brooch detail, pearl-shine skin highlights', spatialDistortion: 'Waist-length hair arcs, elongated eyes, floating ribbons, graceful transformation posture', formAndLine: 'Clean beauty-line contours, glossy eyelash emphasis, accessory-forward inking' },
    { name: 'Rumiko Takahashi - Elastic Rom-Com Combat', aesthetic: 'Cheerful romantic-comedy combat with instantly readable silhouettes, slapstick martial chaos, lovable chaos of affection and argument rendered with buoyant cartoon clarity', atmosphere: 'Playful, combative, charming, lively', keyFeatures: 'Comic motion smears, expressive yelling faces, slapstick object hits, readable silhouette humor, flirt-fight energy', colorPalette: 'Candy red, sky blue, warm peach, clean black, sunny yellow, pond green', lightingSetup: 'Bright TV-animation key, simple cel highlights, cheerful no-fuss lighting', materialTexture: 'Flat cel paint feel, clean paper grain, hair-shine pops, simple clothing folds', spatialDistortion: 'Elastic slapstick body movement, giant reaction heads, instant pose readability', formAndLine: 'Clean efficient contour, lively expression marks, simple comedic exaggeration' },
    { name: 'Taiyo Matsumoto - Scratchy Urban Drift', aesthetic: 'Rough urban adolescence, scratchy linework, concrete poetry, drifting bikes and rooftops, holy and ugly city textures fused into emotional sketch energy', atmosphere: 'Restless, rough, spiritual, urban', keyFeatures: 'Scratchy concrete textures, rooftop silhouettes, adolescent motion, rough city iconography, sacred-urban weirdness', colorPalette: 'Cement grey, faded blue, rust orange, dirty cream, bruised purple, asphalt black', lightingSetup: 'Hazy urban daylight, sodium-vapor night bleed, flat overcast concrete gloom', materialTexture: 'Dry-brush grit, photocopy grain, rough wall scrape, cracked paint, pencil scuff', spatialDistortion: 'Loose body proportions, tilted urban perspective, sketched motion drift, uneven head-to-limb relationships', formAndLine: 'Scratchy uneven contour, dry-ink scribble, architectural scrawl' },
    { name: 'Masaaki Yuasa - Rubber Reality Sprint', aesthetic: 'Morphing anatomy and ecstatic motion, dance-like action, color bursts, reality bending under pure expressive velocity, anti-stiff animation freedom made visual', atmosphere: 'Elastic, ecstatic, surreal, alive', keyFeatures: 'Morphing anatomy, dance-motion arcs, wild color bursts, anti-model dynamism, velocity-first staging', colorPalette: 'Acid cyan, burnt orange, grape purple, hot pink, black ink, fever yellow', lightingSetup: 'Graphic color-flash lighting, abrupt stage-like shifts, expression-over-realism illumination', materialTexture: 'Paint-smear energy, rough digital brush, poster-flat color blocks, animation-boil traces', spatialDistortion: 'Constant anatomical morphing, melting perspective, dance-curve poses, explosive timing shapes', formAndLine: 'Elastic contour, rough brush taper, unstable shape language, rhythm-led line motion' },
    { name: 'Osamu Dezaki - Postcard Memory Freeze', aesthetic: 'Dramatic freeze-frame postcard shot, glowing highlights, emotional overstatement, roses and stars suspended in time, classic melodrama distilled into one burning still', atmosphere: 'Melodramatic, nostalgic, luminous, intense', keyFeatures: 'Postcard freeze frame, dramatic highlight lines, symbolic floral overlays, emotional stare-downs, retro melodrama staging', colorPalette: 'Sepia gold, crimson rose, cream white, royal blue, amber light, filmic mauve', lightingSetup: 'Spotlit emotional key, highlight flares, freeze-frame glare, theatrical backlight', materialTexture: 'Filmic grain, cel highlight bloom, airbrushed glow, paper postcard softness', spatialDistortion: 'Heroic freeze poses, diagonally framed bodies, symbolic overlay space, concentrated emotional composition', formAndLine: 'Crisp classic contour, glamour-highlight accents, melodrama-weighted inking' },
    { name: 'Leiji Matsumoto - Endless Star-Track Melancholy', aesthetic: 'Long-nosed space-romantic melancholy, star trains and capes, distant ideals, cosmic loneliness conveyed through elegant retro-futurist silhouettes and infinite distance', atmosphere: 'Lonely, romantic, cosmic, noble', keyFeatures: 'Star-track imagery, caped silhouettes, endless-horizon framing, retro-future control rooms, mournful distance', colorPalette: 'Deep navy, brass gold, wine red, vacuum black, starlight white, engine blue', lightingSetup: 'Starfield backlight, brass console glow, melancholy bridge lighting, cosmic silhouette framing', materialTexture: 'Painted starfields, brass panel wear, velvet cape drape, cel-era cosmic softness', spatialDistortion: 'Tall melancholy figures, long horizon lines, deep star-distance perspective, theatrical cape flow', formAndLine: 'Elegant retro contour, long facial proportions, fine cape and machine linework' },
    { name: 'Kazuo Umezz - Spiral Screaming Horror', aesthetic: 'Classic manga-horror panic, striped shock, screaming children, spiraling dread, black-white psychic sickness rendered with high-contrast theatrical terror', atmosphere: 'Hysterical, uncanny, retro, terrifying', keyFeatures: 'Screaming faces, spiral motifs, striped fear patterns, child-horror contrast, high-contrast black-white logic', colorPalette: 'Bone white, pitch black, dried blood red, sickly mint, corpse blue, bruise violet', lightingSetup: 'Harsh spotlight horror, deep negative shadows, overexposed panic faces', materialTexture: 'Ink-rich blacks, scratchy screentone feel, paper tooth, rough horror shading', spatialDistortion: 'Wide screaming mouths, bulging eyes, warped hallway depth, panic-twisted posture', formAndLine: 'Jagged horror contour, heavy black fills, shrill stress-line density' },
    { name: 'Shigeru Mizuki - Yokai Night Parade Ink', aesthetic: 'Folkloric yokai procession with documentary oddness, soft rural night, grotesque spirits treated with deadpan familiarity, brush-ink humor and ghostly taxonomy', atmosphere: 'Folkloric, eerie, amused, nocturnal', keyFeatures: 'Yokai parade silhouettes, rural-night backdrops, brush-ink humor, lantern glow, documentary-spirit staging', colorPalette: 'Sumi black, lantern orange, moss green, moon grey, mud brown, ghostly cyan', lightingSetup: 'Lantern-and-moon dual lighting, ink-dark negative space, rural-night haze', materialTexture: 'Brush-ink bleeds, washi paper tooth, damp earth texture, mossy wood grain', spatialDistortion: 'Odd spirit anatomy, procession depth, deadpan human-scale contrast, uncanny silhouette spacing', formAndLine: 'Brushy folklore contour, blunt creature detailing, ink-wash edge diffusion' },
    { name: 'Yusuke Murata - Chrome Impact Hero Frame', aesthetic: 'Hyper-finished modern hero illustration, chrome musculature, destructive perspective, city-cleaving punch clarity, lavish draftsmanship aimed at maximum spectacle', atmosphere: 'Polished, explosive, metallic, triumphant', keyFeatures: 'Chrome-like anatomy finish, giant impact craters, city-shatter perspective, lavish detail density, poster-hero posing', colorPalette: 'Steel grey, explosion orange, hero red, electric cyan, soot black, flash white', lightingSetup: 'HDR impact lighting, specular hero sheen, explosion backlight, debris-lit action', materialTexture: 'Polished metal and skin finish, debris granularity, smoke plumes, high-detail rubble', spatialDistortion: 'Extreme foreshortening, fist-to-camera compression, spectacle-first city scale, perfect action readability', formAndLine: 'Precision contour, anatomy-rich detailing, ultra-clean action line control' },
    { name: 'Kunihiko Ikuhara - Rose-Altar Allegory', aesthetic: 'Theatrical symbolic staging, roses, trains, ritual arenas, emotional conflict expressed through icon systems rather than realism, operatic adolescent psyche rendered as ceremony', atmosphere: 'Symbolic, theatrical, intoxicating, unstable', keyFeatures: 'Rose altars, train symbolism, ritual arenas, icon-heavy staging, emotionally coded props', colorPalette: 'Rose crimson, cathedral violet, candle gold, ivory, shadow navy, ceremonial black', lightingSetup: 'Stage spotlighting, ritual backlight, stained-symbol glow, theatrical curtain darkness', materialTexture: 'Velvet drape, rose-petal softness, marble stage sheen, candle smoke haze', spatialDistortion: 'Ceremonial symmetry, impossible stage transitions, allegorical scale changes, posed ritual spacing', formAndLine: 'Elegant symbolic contour, ceremonial costume precision, flourish-heavy ornament lines' },
    { name: 'Hiroyuki Okiura - Quiet Human Naturalism', aesthetic: 'Subtle body language, lived-in domestic motion, gentle realism within animation, believable weight, quiet humanity and observational tenderness over spectacle', atmosphere: 'Human, modest, grounded, intimate', keyFeatures: 'Observed body language, lived-in apartments, natural posture weight, realistic gesture timing, domestic emotional subtlety', colorPalette: 'Soft beige, denim blue, skin-warm peach, kitchen white, rainy grey, muted green', lightingSetup: 'Natural window light, restrained interior bounce, overcast softness, human-scale practical lamps', materialTexture: 'Cotton shirts, kitchen surfaces, floor scuffs, skin warmth, rainy-window diffusion', spatialDistortion: 'Believable anatomy, restrained perspective, human-scale room depth, natural gait and gesture', formAndLine: 'Subtle natural contour, minimal stylization, motion-observation line clarity' },
    { name: 'Hideaki Anno - Storyboard Emergency Sketch', aesthetic: 'Raw production-board intensity, monochrome urgency, missiles and tears, technical notes hiding beneath emotional catastrophe, anxious linework driving apocalyptic planning', atmosphere: 'Urgent, anxious, skeletal, apocalyptic', keyFeatures: 'Storyboard panels, emergency arrows, technical notations, monochrome anxiety, explosive conceptual framing', colorPalette: 'Pencil grey, warning red, photocopy black, paper white, rust sepia, alarm orange', lightingSetup: 'Harsh conceptual spotlighting, emergency-red accent bursts, no-finish production glare', materialTexture: 'Pencil smudge, copier grain, paper crease, marker annotation bleed, erased construction lines', spatialDistortion: 'Storyboard panel shifts, missile-angle perspective, rough dramatic framing, note-margin compression', formAndLine: 'Raw pencil contour, notation-heavy marks, urgent hatch emphasis, production-sketch looseness' },
    { name: 'Haruko Ichikawa - Mineral Void Serenity', aesthetic: 'Luminous gem-like bodies suspended in open emptiness, sparse worldbuilding, fragile identity in crystalline stillness, minimalist melancholy and reflective translucency', atmosphere: 'Sparse, crystalline, introspective, luminous', keyFeatures: 'Gem-body translucency, open void composition, sparse landscape, fragile posture language, reflective surfaces', colorPalette: 'Opal white, seafoam cyan, pale gold, quartz pink, void black, glacial blue', lightingSetup: 'Clean refractive light, edge glow, vast ambient openness, crystalline sparkle without clutter', materialTexture: 'Polished mineral translucency, sea-wind smoothness, glasslike skin, sparse matte ground', spatialDistortion: 'Slim fragile anatomy, open-space isolation, clean silhouette spacing, low-clutter monumental emptiness', formAndLine: 'Minimal precise contour, gem-edge line clarity, low-density expressive marks' },
    { name: 'Takeshi Koike - Razorline Velocity Poster', aesthetic: 'Poster-hot speed, brutal shadows, graphic car or fist momentum, razor-sliced anatomy, neon pulp adrenaline, every frame built like a racing poster explosion', atmosphere: 'Aggressive, sleek, adrenalized, loud', keyFeatures: 'Razorline anatomy, heavy shadow wedges, poster-speed motion, neon pulp attitude, impossible velocity cues', colorPalette: 'Racing red, black ink, chrome white, toxic yellow, electric blue, asphalt violet', lightingSetup: 'Poster-contrast spotlighting, hard rim edges, race-night neon glare, shadow blocks', materialTexture: 'Gloss paint, tire-rubber hints, screenprint boldness, polished poster surfaces', spatialDistortion: 'Velocity-smeared perspective, lunging anatomy, poster-compressed depth, impact-first framing', formAndLine: 'Razor contour, thick-thin poster ink, aggressive silhouette carving' },
    { name: 'Yoh Yoshinari - Firework Fantasy Draftsmanship', aesthetic: 'Playful fantasy machines and explosive magic rendered with impossibly confident draftsmanship, joyous motion, arcane hardware, bright celebration of animation skill itself', atmosphere: 'Joyful, intricate, explosive, playful', keyFeatures: 'Complex fantasy machinery, fireworks-like magic, joyous motion arcs, confident draftsmanship, celebratory action design', colorPalette: 'Festival orange, cobalt blue, emerald, parchment cream, ruby red, twilight purple', lightingSetup: 'Festival-night bursts, magical spark showers, crisp directional highlights, celebratory rim light', materialTexture: 'Metal fittings, parchment and leather, spark particles, polished animation-finish surfaces', spatialDistortion: 'Whip-fast action curves, machine-layer depth, playful figure exaggeration, fireworks-burst composition', formAndLine: 'Exceptionally confident contour, machinery-rich detailing, energetic arc-based line motion' },
    { name: 'Atsushi Ohkubo - Triangle-Grin Fire Geometry', aesthetic: 'Angular grin-heavy character design, triangle-driven flames, graphic teeth and attitude, gothic streetwear and combustion making a clean aggressive icon system', atmosphere: 'Cool, angular, incendiary, mischievous', keyFeatures: 'Triangle motifs, grin-focused faces, fire geometry, graphic streetwear, clean aggressive silhouettes', colorPalette: 'Carbon black, fire orange, bone white, acid lime, charcoal grey, ember red', lightingSetup: 'High-contrast firelight, geometric flame underglow, sharp silhouette rim accents', materialTexture: 'Clean cel surfaces, soot edges, stylized flame gradients, matte-black fabric', spatialDistortion: 'Angular anatomy, sharp perspective cuts, grin-led facial geometry, icon-heavy pose language', formAndLine: 'Clean hard contour, graphic angle emphasis, grin-and-flame shape discipline' },
    { name: 'Naoki Urasawa - Adult Suspense Close-Up', aesthetic: 'Grounded mature faces, urban suspense, tiny emotional shifts under huge moral pressure, procedural detail and old fears quietly filling the frame', atmosphere: 'Tense, grounded, adult, humane', keyFeatures: 'Adult facial subtlety, urban procedural backdrops, moral-pressure close-ups, grounded body language, suspense in stillness', colorPalette: 'Muted khaki, asphalt grey, skin-warm taupe, office white, rainy blue, burgundy accent', lightingSetup: 'Fluorescent office realism, rainy-day window light, interrogation-level practical shadows', materialTexture: 'Suit fabric, office paper, cigarette smoke haze, rain-specked glass, lived-in walls', spatialDistortion: 'Natural adult proportions, camera-close tension framing, realistic perspective, stillness-driven composition', formAndLine: 'Measured contour, realistic feature detail, restrained expression marks' },
    { name: 'Akio Sugino - Velvet Lash Elegance', aesthetic: 'Classic beauty-anime portraiture, velvet eyelashes, painterly glamour, aristocratic poise, mature romantic intensity and old-school sophistication in every pose', atmosphere: 'Velvety, elegant, mature, dramatic', keyFeatures: 'Lash-heavy portraits, aristocratic pose language, glamour close-ups, old-school beauty rendering, velvet mood', colorPalette: 'Burgundy, ivory, smoky mauve, navy silk, gold trim, warm peach', lightingSetup: 'Beauty-portrait spotlighting, soft velvet shadow, glamour rim light, painterly cheek glow', materialTexture: 'Velvet drape, glossy hair sheen, satin costume detail, old-cel portrait softness', spatialDistortion: 'Beauty-first portrait proportions, swan-neck posing, luxuriant hair framing, noble silhouette emphasis', formAndLine: 'Lash-rich contour, elegant facial precision, glamour-focused line softness' },
    { name: 'Hiromu Arakawa - Mechanical Warmth Ensemble', aesthetic: 'Expressive ensemble action with engineering literacy, practical machinery, dirt and family, humor and grief interlocked through generous draftsmanship and industrial empathy', atmosphere: 'Warm, strong, practical, emotional', keyFeatures: 'Mechanical detail, ensemble chemistry, family-coded gestures, practical costumes, humor-to-grief tonal flexibility', colorPalette: 'Steel blue, workwear brown, ember orange, cream, engine red, soot grey', lightingSetup: 'Workshop practicals, sunset action glow, warm-and-cool industrial contrast, emotionally readable highlights', materialTexture: 'Machine grease, cloth uniforms, workshop wood, dusted metal, scuffed leather', spatialDistortion: 'Strong readable anatomy, ensemble-balanced composition, practical action depth, robust physical posing', formAndLine: 'Confident clean contour, machine-and-face detail balance, expressive practical linework' },
    { name: 'Satoshi Kon - Mirror Hallway Reality Slip', aesthetic: 'Modern realism destabilized by performance and memory, mirrors and media screens leaking into one another, polished adult surfaces hiding identity fractures', atmosphere: 'Unsettling, polished, psychological, cinematic', keyFeatures: 'Mirrors, media screens, adult urban spaces, reality-slip transitions, polished suspense framing', colorPalette: 'Cool steel, skin peach, screen blue, lipstick crimson, hallway beige, shadow plum', lightingSetup: 'Reflective practical lighting, TV-screen spill, dressing-room spotlights, polished suspense shadows', materialTexture: 'Glass reflections, makeup sheen, hallway varnish, media-screen scan glow, urban polish', spatialDistortion: 'Reality-slip match cuts, reflection-depth confusion, poised adult anatomy, cinematic frame logic with subtle breakage', formAndLine: 'Refined realistic contour, performance-ready facial detail, subtle disorientation in framing lines' },
  ],
};

const sportsCompetitionAndPerformanceSeeds: PresetSeed[] = [
  { name: 'Haikyuu!! - Orange-Court Jump Fever', aesthetic: 'Volleyball momentum, spring-loaded jumps, gymnasium light, underdog team chemistry, orange court heat, libero dives and setter precision rendered with ecstatic motion clarity', atmosphere: 'Electric, uplifting, kinetic, team-driven', keyFeatures: 'Jump-serve silhouettes, net-line depth, team-call gestures, sneaker-squeak court energy, airborne spike framing' },
  { name: 'Blue Lock - Ego Cage Striker Breakout', aesthetic: 'High-pressure striker obsession, goalbox tunnel vision, neon field psychology, ruthless individual ambition inside a locked athletic laboratory, football treated like predator ritual', atmosphere: 'Predatory, intense, focused, manic', keyFeatures: 'Goal-net perspective, striker body torque, glaring eye-line intensity, stadium-rush framing, ego-crisis close-ups' },
  { name: 'Slam Dunk - Hardwood Delinquent Rivalry', aesthetic: '90s gym sweat and basketball swagger, delinquent charisma redirected into team play, underdog confidence, squeaking hardwood and emotional rebounds in a brightly lit school arena', atmosphere: 'Sweaty, charismatic, competitive, hopeful', keyFeatures: 'Basketball arc shots, gymnasium light pools, rivalry stare-downs, rebound body mechanics, court-side bench reactions' },
  { name: 'Kuroko\'s Basketball - Phantom Pass Flashcourt', aesthetic: 'High-school basketball rendered as illusion-speed spectacle, ghost-like passing lanes, aces with impossible momentum, dramatic indoor arenas, rivalry elevated into tactical myth', atmosphere: 'Flashy, strategic, high-speed, competitive', keyFeatures: 'Pass-trail cues, indoor-arena depth, player duels, impossible court angles, team-vs-star contrast' },
  { name: 'Yowamushi Pedal - Uphill Breakaway Scream', aesthetic: 'Cycling-road obsession, mountain switchbacks, sweat and willpower, colorful jerseys, road-race camaraderie and insanity rendered through exaggerated climb intensity', atmosphere: 'Exhausted, triumphant, obsessive, fast', keyFeatures: 'Bike lean angles, hill-climb perspective, peloton spacing, jersey color separation, screaming uphill face acting' },
  { name: 'Ace of Diamond - Mound Duel Summer Heat', aesthetic: 'Baseball-pitch precision, catcher signals, summer tournament pressure, dirt and dust, battery chemistry and bullpen urgency framed through shonen sports resolve', atmosphere: 'Focused, heated, disciplined, youthful', keyFeatures: 'Pitching-form anatomy, catcher mitt focal point, diamond geometry, dugout tension, summer-stadium glare' },
  { name: 'Major - Generational Baseball Resolve', aesthetic: 'Long-arc baseball life story, little-league dreams scaling to pro pressure, family legacy and mound determination, stadium lights and dirt rendered with emotional athletic realism', atmosphere: 'Resolute, nostalgic, driven, heartfelt', keyFeatures: 'Glove-and-ball iconography, mound posture, stadium-light depth, childhood-to-pro echoes, family-sport emotional cues' },
  { name: 'Free! - Chlorine Splash Relay Glow', aesthetic: 'Aquatic team camaraderie, blue-tiled pool brilliance, water-surface light caustics, relay urgency, youth friendship and polished bodies rendered through warm sports-drama spectacle', atmosphere: 'Refreshing, bright, emotional, competitive', keyFeatures: 'Splash arcs, lane-line geometry, wet-hair highlights, relay handoff tension, poolside team silhouettes' },
  { name: 'Run with the Wind - Night Campus Marathon Drift', aesthetic: 'Distance-running discipline, night roads, campus lamps, thin winter breath, team growth through long miles and quiet suffering rendered with human-scale sports lyricism', atmosphere: 'Determined, cool, introspective, communal', keyFeatures: 'Running-form silhouettes, streetlamp rhythm, breath-in-cold-air cues, pack spacing, night-road momentum' },
  { name: 'Sk8 the Infinity - Neon Ramp Brotherhood', aesthetic: 'Street-skate rivalry under tropical neon, colorful ramps, underground race bravado, friendship and adrenaline sharing one electric frame, wheels and attitude in bright motion', atmosphere: 'Rebellious, fun, fast, vibrant', keyFeatures: 'Board tricks midair, ramp curvature, neon-night venue cues, streetwear silhouettes, wheel-motion streaks' },
  { name: 'Initial D - Mountain Drift Headlight Tension', aesthetic: 'Touge night racing, hairpin drift choreography, headlight fog, driver concentration and machine balance rendered with asphalt obsession and midnight speed', atmosphere: 'Nocturnal, tense, technical, exhilarating', keyFeatures: 'Drift-angle framing, headlight beams, guardrail curves, dashboard focus, tire-smoke mountain roads' },
  { name: 'MF Ghost - Smartcar Neon Apex', aesthetic: 'Modern street-racing futurism, telemetry-thinking drivers, high-end road machines, coastal circuits and digital-age grip rendered with sleek athletic motor focus', atmosphere: 'Sleek, exacting, modern, competitive', keyFeatures: 'Car-apex cornering, telemetry-like cues, coastal-road speed, precision driving posture, sleek neon reflections' },
  { name: 'Uma Musume - Turf Sprint Idol Derby', aesthetic: 'Horse-girl racing pageantry, stadium cheers, ribboned athletic costumes, track dust and idol energy fused into one hyper-bright sports-performance spectacle', atmosphere: 'Sparkling, speedy, cheerful, dramatic', keyFeatures: 'Track-lane depth, cheering stadium read, costume-motion ribbons, finish-line rush, sports-meets-idol contrast' },
  { name: 'Prince of Tennis - Baseline Special-Move Showdown', aesthetic: 'Tennis as superhuman duel theater, baseline standoffs, spinning serves, character-specific swagger and national-tournament pressure rendered like arena combat', atmosphere: 'Stylized, intense, youthful, dramatic', keyFeatures: 'Racket-swing arcs, baseline geometry, serve-impact trails, rivalry face-offs, indoor-court tournament framing' },
  { name: 'Ping Pong the Animation - Table Spin Distortion', aesthetic: 'Table tennis pressure seen through psychological deformation, speed and identity colliding across a tiny table, rough athletic tension and emotional asymmetry made visual', atmosphere: 'Psychological, fast, raw, strange', keyFeatures: 'Table-edge perspective, paddle-snap motion, facial distortion under pressure, gym-shadow intimacy, spin trajectory cues' },
  { name: 'Hajime no Ippo - Corner Stool Comeback Grit', aesthetic: 'Boxing gym sweat, taped fists, underdog muscle effort, ropes and bruises, comeback spirit and technical grit rendered with old-school sports-drama sincerity', atmosphere: 'Grueling, inspiring, rough, determined', keyFeatures: 'Boxing-ring ropes, glove-impact pose, corner-stool exhaustion, taped-hand detail, coach-fighter framing' },
  { name: 'Yuri!!! on Ice - Rink Edge Performance Ache', aesthetic: 'Figure-skating performance under arena spotlights, emotional choreography, blade-trace elegance, coach-athlete tension and public vulnerability rendered with icy grace', atmosphere: 'Elegant, exposed, emotional, competitive', keyFeatures: 'Ice-rink reflections, spin posture, spotlight cones, costume shimmer, blade-trace curves' },
  { name: 'Chihayafuru - Tatami Card Strike Focus', aesthetic: 'Karuta competition as athletic poetry, tatami rooms, kimono sleeves, explosive card-strike speed, cultural refinement transformed into fierce competitive intensity', atmosphere: 'Focused, elegant, disciplined, urgent', keyFeatures: 'Tatami geometry, hand-strike blur, kimono sleeve motion, low-room tension, concentration close-ups' },
  { name: 'Baby Steps - Notebook Tennis Calculation', aesthetic: 'Methodical tennis growth, notebooks and strategy, practice repetition, court fundamentals and self-built improvement rendered with grounded technical optimism', atmosphere: 'Studious, practical, steady, determined', keyFeatures: 'Practice-court realism, note-taking cues, swing mechanics, gradual-improvement body language, technical footwork framing' },
  { name: 'Birdie Wing - Rainbow Fairway Duel', aesthetic: 'High-stakes golf rivalry with flamboyant color, long fairway compositions, fashion-forward competitors, absurd skill confidence and underground-to-elite course drama', atmosphere: 'Flashy, precise, playful, fierce', keyFeatures: 'Fairway depth lines, golf-swing silhouettes, luxury-course read, color-coded rivals, shot-trace arcs' },
  { name: 'Backflip!! - Boys Rhythmic Flight Team', aesthetic: 'Rhythmic gymnastics team jumps, mat spring, synchronized airborne silhouettes, school-club encouragement and body-control beauty rendered with buoyant athletic optimism', atmosphere: 'Light, synchronized, hopeful, energetic', keyFeatures: 'Midair sync poses, gym-mat staging, team timing cues, body-extension elegance, school-club warmth' },
  { name: 'Dance Dance Danseur - Ballet Obsession Rehearsal', aesthetic: 'Studio mirrors, sweating rehearsal focus, male ballet intensity, footwork perfectionism and emotional exposure rendered through elegant motion and discipline', atmosphere: 'Passionate, disciplined, elegant, vulnerable', keyFeatures: 'Dance-studio mirrors, turned-out leg lines, rehearsal posture, sweat-and-light realism, emotional body extension' },
  { name: 'Welcome to the Ballroom - Competition Floor Blaze', aesthetic: 'Ballroom dance under hot competition lights, flowing gowns, polished shoes, partner tension, spin momentum and public judgment turned into dramatic movement theater', atmosphere: 'Dazzling, pressured, romantic, intense', keyFeatures: 'Dance-floor reflections, gown motion, pair silhouettes, competition-judge ambiance, spin blur' },
  { name: 'Kono Oto Tomare! - Koto Ensemble Resonance', aesthetic: 'School performance drama around traditional strings, lacquered instruments, stage light, group harmony and personal healing rendered through poised hands and emotional ensemble spacing', atmosphere: 'Earnest, resonant, delicate, uplifting', keyFeatures: 'Koto string detail, seated ensemble staging, lacquer gleam, hand-position focus, recital-hall warmth' },
  { name: 'Sound! Euphonium - Brass Section Sunset Practice', aesthetic: 'Concert-band adolescence, brass reflections, after-school rehearsal rooms, competition anxiety and friendship rendered with polished KyoAni-style emotional specificity', atmosphere: 'Tender, aspirational, polished, musical', keyFeatures: 'Brass-instrument reflections, rehearsal-room depth, embouchure hand detail, uniform subtlety, ensemble proximity' },
  { name: 'Blue Giant - Midnight Jazz Sax Ascension', aesthetic: 'Urban jazz obsession, smoky club stages, saxophone glow, relentless practice and stage eruption rendered through adult performance intensity and blue-hour city mood', atmosphere: 'Driven, nocturnal, soulful, explosive', keyFeatures: 'Saxophone shine, club-stage spotlights, smoke haze, soloist silhouette, city-night music vibe' },
  { name: 'Beck: Mongolian Chop Squad - Garage Amp Youth', aesthetic: 'Band-practice sweat, garage amps, youth aspiration, guitar cables and stage nerves, scrappy music growth rendered with grounded punk sincerity', atmosphere: 'Raw, youthful, scrappy, heartfelt', keyFeatures: 'Amp stacks, guitar posture, garage clutter, band-lineup spacing, practice-room sweat energy' },
  { name: 'Given - Stage Confession Indie Glow', aesthetic: 'Indie-band romance under small-venue lights, emotional songwriting, guitar-and-vocal intimacy, stage confession energy and soft heartbreak in modern performance framing', atmosphere: 'Intimate, aching, warm, musical', keyFeatures: 'Mic-stand framing, guitar close-up, small-venue spotlights, duo emotional spacing, song-performance body language' },
  { name: 'Nodame Cantabile - Orchestra Rehearsal Whirl', aesthetic: 'Classical music comedy and brilliance, rehearsal halls, conductor authority, eccentric pianist chaos, sheet-music energy transformed into lively ensemble character drama', atmosphere: 'Lively, cultured, eccentric, inspiring', keyFeatures: 'Orchestra seating depth, conductor gestures, piano focus, rehearsal-hall scale, comedic musical body language' },
  { name: 'Revue Starlight - Stage Duel Spotlights', aesthetic: 'Theater girls crossing into symbolic stage combat, spotlight duels, staircase sets, costume drama and performance-as-rivalry rendered through lavish allegorical staging', atmosphere: 'Theatrical, competitive, symbolic, luminous', keyFeatures: 'Stage spotlight beams, duel-choreography poses, staircase set pieces, costume-pageantry detail, allegorical theater space' },
];

const sportsCompetitionTemplateOverrides: TemplateOverrides = {
  formAndLine:
    'Energetic sports-and-performance anime linework, clean anatomy, dynamic motion arcs, precise gesture readability, and expressive pose control',
  colorPalette:
    'Vivid team colors, arena neons, polished skin highlights, bright accent uniforms, stage gels, and crisp event-driven contrast',
  lightingSetup:
    'Venue-ready spotlighting, stadium or gym bounce, dramatic event backlight, polished floor reflections, and live-performance contrast',
  materialTexture:
    'Court varnish, turf grain, chalk dust, polished wood, instrument lacquer, rink sheen, jersey fabric, and stage-floor texture',
  renderQuality:
    'Premium sports-performance anime frame, motion-readable polish, live-event atmosphere, expressive anatomy, and crisp action finish',
  spatialDistortion:
    'Competition-ready foreshortening, venue-depth perspective, motion-path readability, dynamic athlete silhouette design, and crowd-to-stage scale cues',
};

function clonePreset(preset: StylePresetDef): StylePresetDef {
  return {
    ...preset,
    style: { ...preset.style },
  };
}

function categoryTemplate(pack: StylePack, category: string) {
  const preset = pack.presets.find((entry) => entry.category === category);
  if (!preset) throw new Error(`Missing template preset for ${pack.id} category ${category}`);
  return preset;
}

function makePreset(
  id: string,
  category: string,
  template: StylePresetDef,
  seed: PresetSeed,
  templateOverrides?: TemplateOverrides,
): StylePresetDef {
  const next = clonePreset(template);
  next.id = id;
  next.name = seed.name;
  next.category = category;
  next.negativePrompt = seed.negativePrompt || template.negativePrompt || sharedAnimeNegativePrompt;
  next.style = {
    ...next.style,
    aesthetic: seed.aesthetic,
    atmosphere: seed.atmosphere,
    key_features: seed.keyFeatures || next.style.key_features,
    color_palette:
      seed.colorPalette || templateOverrides?.colorPalette || next.style.color_palette,
    lighting_setup:
      seed.lightingSetup || templateOverrides?.lightingSetup || next.style.lighting_setup,
    material_texture:
      seed.materialTexture ||
      templateOverrides?.materialTexture ||
      next.style.material_texture,
    render_quality:
      seed.renderQuality || templateOverrides?.renderQuality || next.style.render_quality,
    spatial_distortion:
      seed.spatialDistortion ||
      templateOverrides?.spatialDistortion ||
      next.style.spatial_distortion,
    form_and_line: seed.formAndLine || templateOverrides?.formAndLine || next.style.form_and_line,
  };
  return next;
}

function nextPackId(pack: StylePack) {
  return (
    Math.max(
      ...pack.presets.map((preset) => Number.parseInt(preset.id.split('-')[1] || '0', 10)),
    ) + 1
  );
}

function padPackId(pack: StylePack, value: number) {
  const suffix = value.toString().padStart(3, '0');
  return `${pack.id.replace('pack_', 'SP')}-${suffix}`;
}

async function loadPack(fileName: string) {
  const fullPath = path.join(packsDir, fileName);
  const parsed = yaml.load(await readFile(fullPath, 'utf8')) as StylePack[];
  return { fullPath, packs: parsed };
}

function addSeeds(
  pack: StylePack,
  category: string,
  seeds: PresetSeed[],
  templateCategory?: string,
  templateOverrides?: TemplateOverrides,
) {
  const template = categoryTemplate(pack, templateCategory || category);
  const existingNames = new Set(pack.presets.map((preset) => preset.name));
  let currentId = nextPackId(pack);
  const additions: StylePresetDef[] = [];

  for (const seed of seeds) {
    if (existingNames.has(seed.name)) continue;
    additions.push(
      makePreset(padPackId(pack, currentId), category, template, seed, templateOverrides),
    );
    currentId += 1;
  }

  pack.presets.push(...additions);
  return additions.length;
}

async function main() {
  const pack02File = 'pack_02_cinematic_media.yaml';
  const pack05File = 'pack_05_anime_manga_universes.yaml';
  const pack02Doc = await loadPack(pack02File);
  const pack05Doc = await loadPack(pack05File);

  const pack02 = pack02Doc.packs[0];
  const pack05 = pack05Doc.packs[0];
  pack05.description =
    'A large curated collection of original anime and manga presets spanning retro cel language, modern action, romance, sports, performance, mecha, slice-of-life, fantasy, and creator-driven stylistic experiments.';

  const added02 = addSeeds(pack02, '6. Caricature & Cartoon Styles', caricatureSeeds);
  let added05 = 0;
  for (const [category, seeds] of Object.entries(animeSeeds)) {
    added05 += addSeeds(pack05, category, seeds);
  }
  added05 += addSeeds(
    pack05,
    '6. Sports, Competition & Performance',
    sportsCompetitionAndPerformanceSeeds,
    '5. Slice of Life & Moe',
    sportsCompetitionTemplateOverrides,
  );

  await writeFile(
    pack02Doc.fullPath,
    yaml.dump(pack02Doc.packs, { noRefs: true, lineWidth: -1, sortKeys: false }),
    'utf8',
  );
  await writeFile(
    pack05Doc.fullPath,
    yaml.dump(pack05Doc.packs, { noRefs: true, lineWidth: -1, sortKeys: false }),
    'utf8',
  );

  console.log(`pack_02 additions: ${added02}`);
  console.log(`pack_05 additions: ${added05}`);
}

await main();
