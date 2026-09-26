import type { Spec } from '../tools/apply';
import { au } from './_authors';

// Mecha and cyberpunk, author pass: each preset names its series, studio or designer and the
// concrete marks of that look. Template briefs are replaced with original scenes that suit it.
const spec: Spec = {
  pack: 'pack_05',
  category: '2. Mecha & Cyberpunk',
  updates: Object.fromEntries([
    au('SP05-056', 'Rebuild of Evangelion - Geometric Ignition Urgency', {
      look: 'Khara Rebuild of Evangelion look: crisp digital cel with neon orange warning geometry, hexagonal barrier patterns, colossal hazard-striped operations and cold command-room urgency.',
      subject:
        'draw people with Sadamoto-derived designs, tense faces, plugsuit-like or uniform clothing, dwarfed by vast geometric machinery and emergency displays.',
      color:
        'Warning orange, hazard black, command-room teal and blood-red emergency light across everything.',
      light:
        'Emergency strobe light, hexagonal barrier glows and harsh sunset silhouettes against machinery.',
      texture:
        'Crisp digital cel, CG geometric structures, hazard stripes and clean graphic overlays.',
      camera:
        'Monumental low angles, symmetrical operations centers and tiny figures before colossal geometry.',
      mood: 'urgent apocalyptic tension',
      render: 'Precise Khara theatrical frame with neon geometry and colossal emergency scale.',
      key: 'Rebuild geometry; warning orange; hexagonal barriers; colossal operations',
      avoid: ['a purple and green horned biomech', 'existing franchise characters'],
      briefs: [
        'Running across a flooded dam in a spiked welding mask, a demolition foreman races the orange hexagonal warning lights that ripple across the concrete wall behind her as the spillway gates groan open. No readable text or logo.',
        'Hundreds of rescue workers line up in perfect geometric rows on a highway overpass, their hazard vests glowing orange as an enormous shadow crosses the sunset. No readable text or logo.',
        'In a silent command room, a single mug of coffee sits on a console as every screen around it turns warning orange at once. No readable text or logo.',
      ],
    }),
    au('SP05-222', 'Patlabor Headgear - Municipal Machine Procedure', {
      look: 'Headgear Patlabor look with Yutaka Izubuchi mechanical design: realistic civic police robots, municipal paperwork mood, eighties-nineties Tokyo bayside warehouses and grounded procedure.',
      subject:
        'draw people with grounded Akemi Takada-era designs, tired officers in work uniforms and caps, and labor robots treated as municipal vehicles.',
      color: 'Police white and black, teal-and-amber labor machines, overcast bay grey and rust.',
      light: 'Flat overcast bayside daylight, fluorescent hangar light and orange warning beacons.',
      texture: 'Hand-painted cel over detailed painted industrial backgrounds, grease and wear.',
      camera:
        'Procedural hangar shots, crane-like wides of bay warehouses and slow tactical moves.',
      mood: 'wry municipal realism',
      render: 'Grounded late-eighties real-robot frame with civic procedural detail.',
      key: 'Patlabor civic robots; bayside warehouses; municipal procedure; Izubuchi mechanics',
      avoid: ['a white police labor robot with a siren crest', 'existing franchise characters'],
      briefs: [
        'Carefully guiding a teal-and-amber labor mech through a narrow market street, a middle-aged city operator waves apologetically at every fruit seller as the machine tiptoes past their stalls. No readable text or logo.',
        'Two municipal robot pilots fill out damage forms on the hood of a truck while their machines sit sheepishly beside a toppled billboard frame. No readable text or logo.',
        'At dawn in a quiet bayside hangar, a labor robot stands under a tarp with a coffee thermos balanced on its knee. No readable text or logo.',
      ],
    }),
    au('SP05-224', 'Appleseed Aramaki - Sterile Arcology Severity', {
      look: 'Shinji Aramaki Appleseed film look (2004): cel-shaded 3D characters, sterile white utopian arcologies, glossy tactical landmates and clinical motion-capture action.',
      subject:
        'draw people as cel-shaded CG figures with smooth faces, tactical armor and glossy mechanical exosuits.',
      color: 'Sterile white, pale aqua, chrome silver and tactical olive accents.',
      light: 'Clean bright arcology light, reflective glass and cold rim light.',
      texture: 'Cel-shaded 3D surfaces, smooth gradients and glossy mechanical panels.',
      camera:
        'Motion-capture action choreography and sweeping flyovers across white utopian towers.',
      mood: 'clinical sterile severity',
      render: 'Glossy cel-shaded CG frame with sterile utopian architecture.',
      key: 'Aramaki cel-shaded CG; sterile arcology; glossy landmates; clinical action',
      briefs: [
        'Walking through a spotless white arcology garden where every tree is trimmed into a perfect sphere, a geneticist in a hooded lab coat notices one wild dandelion growing through the pavement. No readable text or logo.',
        'A tactical exosuit kneels in a sterile corridor, its visor reflecting a wall of perfectly identical sleeping citizens in glass pods. No readable text or logo.',
        'On a white rooftop above the utopian city, a single potted cactus sits beside a chrome railing in the wind. No readable text or logo.',
      ],
    }),
    au('SP05-228', 'Casshern Sins Madhouse - White Machine Elegy', {
      look: 'Madhouse Casshern Sins look (2008): tall slender robots and androids in a decaying world, Yoshihiko Umakoshi designs, washed pastel skies and elegiac painterly ruins.',
      subject:
        'draw figures as tall slender androids with elegant limbs and weathered faces, moving through rust and ruin.',
      color: 'Washed pastel skies, bone white metal, rust orange and faded teal.',
      light: 'Soft melancholic daylight through haze and dusty god rays.',
      texture: 'Painterly ruins, rusted metal flakes and elegant clean cel lines.',
      camera: 'Lonely wide ruins with single figures and slow elegiac framing.',
      mood: 'elegiac machine sorrow',
      render: 'Melancholy Madhouse television frame with painterly decay and lonely machines.',
      key: 'Casshern Sins elegy; slender androids; ruin; washed pastel skies',
      avoid: ['a white-armored android hero with a helmet crest', 'existing franchise characters'],
      briefs: [
        'Kneeling in a field of rusted robot bodies, a tall slender android caretaker waters a single flower growing from an old robot’s open chest plate. No readable text or logo.',
        'An elderly android sits alone on a bench at a ruined station, polishing a pocket watch that stopped a century ago. No readable text or logo.',
        'Under a washed pastel sky, a single android hand rests on a dune, sand slowly covering its fingers. No readable text or logo.',
      ],
    }),
    au('SP05-236', 'VOTOMS Sunrise - Compact Attrition Hardware', {
      look: 'Sunrise Armored Trooper VOTOMS look (1983): squat disposable four-meter armored walkers, grimy battlefields, gritty cel with Norio Shioyama designs and grim expendable soldiers.',
      subject:
        'draw people with Shioyama designs, stoic faces, drab flight suits and helmets beside squat mass-produced walkers.',
      color: 'Olive drab, mud brown, steel grey and dim cockpit green.',
      light: 'Harsh battlefield light, smoke haze and green scope glow.',
      texture: 'Gritty hand-painted cel, mud, oil and dented armor.',
      camera: 'Ground-level walker charges, cockpit scope views and grim trench shots.',
      mood: 'grim expendable attrition',
      render: 'Gritty 1983 real-robot television frame with dented disposable hardware and grime.',
      key: 'VOTOMS squat walkers; mud and oil; stoic soldiers; attrition',
      avoid: ['a squat walker with a triple-lens scope head', 'existing franchise characters'],
      briefs: [
        'Skidding through a muddy trench on roller-dash feet, a squat four-meter armored walker with a dented hatch sprays grime across a line of broken twin machines. No readable text or logo.',
        'A stoic pilot eats canned beans on the shoulder of her battered walker while rain drips off its scope lenses. No readable text or logo.',
        'In a muddy scrapyard at dusk, hundreds of identical disposable armored walkers lie stacked like empty tin cans while one crow picks at a loose scope lens. No readable text or logo.',
      ],
    }),
    au('SP05-238', 'SSSS.Gridman Trigger - Tokusatsu Digital Grid Scale', {
      look: 'Studio Trigger SSSS.Gridman look (2018): tokusatsu-homage giants and kaiju in quiet suburbs, silent pastel towns, power lines, and CG giants with rubber-suit charm.',
      subject:
        'draw people with Trigger designs, quiet pastel school or casual clothes, and giants with tokusatsu rubber-suit proportions.',
      color: 'Pastel sky blue, power-line grey, kaiju navy and hero red.',
      light: 'Quiet pastel suburban daylight broken by glowing hero beams and kaiju flashes.',
      texture: 'Clean cel with CG giant models and painted suburbs.',
      camera: 'Low suburban angles with giants towering between power lines.',
      mood: 'uncanny quiet spectacle',
      render: 'Stylish Trigger frame mixing quiet suburbs and tokusatsu spectacle.',
      key: 'Gridman tokusatsu giants; pastel suburbs; power lines; kaiju',
      briefs: [
        'Rising slowly between power lines in a silent pastel suburb, a colossal navy-and-silver sea serpent in rubber-suit proportions blinks down at a woman hanging laundry on her balcony. No readable text or logo.',
        'A giant hero in a chunky helmet sits on a hill at sunset, carefully not crushing the tiny shrine beside him. No readable text or logo.',
        'In a quiet suburb, every power line is humming in the same pitch while the sky slowly turns grid-shaped. No readable text or logo.',
      ],
    }),
    au('SP05-240', 'Kill la Kill Trigger - Tri-Fire Riot Geometry', {
      look: 'Studio Trigger Kill la Kill look (2013): Hiroyuki Imaishi flat angular graphics, huge dramatic poses, red-black-white color blocks, thick outlines and explosive over-the-top battles.',
      subject:
        'draw people with Sushio designs, angular faces, huge exaggerated poses and bold uniforms with sharp shapes.',
      color: 'Red, black and white color blocks with explosive yellow flashes.',
      light: 'Flat graphic lighting with dramatic silhouettes and flashes.',
      texture: 'Thick outlines, flat colors, bold shapes and speed lines.',
      camera: 'Extreme dramatic poses, low angles and explosive framing.',
      mood: 'explosive riotous bravado',
      render: 'Bold hyper-energetic Trigger television frame with graphic color blocking.',
      key: 'Kill la Kill color blocks; Imaishi angles; huge poses; thick outlines',
      avoid: [
        'a sailor uniform with an eye on the shoulder',
        'a scissor blade weapon',
        'existing franchise characters',
      ],
      briefs: [
        'Mid-kick in a school gym turned into a riot, a middle-aged cafeteria cook in a flaming red apron strikes an impossible heroic pose as the walls explode into red, black and white shapes. No readable text or logo.',
        'Three rival street vendors clash with enormous exaggerated poses over one parking space, lightning bolts of color crossing the frame. No readable text or logo.',
        'A single red school uniform hangs on a hook in an empty room, its shadow pulsing like a heartbeat. No readable text or logo.',
      ],
    }),
    au('SP05-051', 'Cyberpunk Edgerunners Trigger - Neon Kinetic Alloy Sprint', {
      look: 'Studio Trigger Cyberpunk: Edgerunners look (2022): hyper-saturated neon, chrome implants, Yoh Yoshinari kinetic animation, flat color blocks and tragic punk energy.',
      subject:
        'draw people with Edgerunners designs, lanky bodies, chrome implants, neon-dyed hair and punk jackets.',
      color: 'Hyper-saturated neon yellow, magenta, cyan and deep black.',
      light: 'Neon signage, holographic glare and chrome implant reflections in a night megacity.',
      texture: 'Flat bold color, thick outlines and chrome gleam.',
      camera: 'Kinetic sprints, fisheye cityscapes and dramatic silhouettes against neon skylines.',
      mood: 'tragic neon adrenaline',
      render: 'Explosive Trigger frame with saturated neon and chrome.',
      key: 'Edgerunners neon; chrome implants; Trigger kinetics; punk tragedy',
      avoid: ['a moon-shaped yellow jacket', 'existing franchise characters'],
      briefs: [
        'Sprinting across a neon rooftop with polished chrome legs, a cyborg courier leaps a gap between towers as a cloud of pink holographic ads bursts around her. No readable text or logo.',
        'A retired street doctor fits a new chrome hand onto a grumpy old fisherman in a cramped neon-lit clinic. No readable text or logo.',
        'On a wet street at night, a single discarded chrome finger glows under a flickering yellow sign. No readable text or logo.',
      ],
    }),
    au('SP05-052', 'Psycho-Pass Production I.G - Surveillance Verdict Grid', {
      look: 'Production I.G Psycho-Pass look (2012): sleek surveillance Tokyo, holographic overlays, cold blue city grids, detective noir and cyberpunk judgment.',
      subject:
        'draw people with Akira Amano-derived designs, sharp faces, dark suits and trench coats in cold detective staging.',
      color: 'Cold cyan, surveillance blue, black and warning red.',
      light: 'Cold holographic light and rain-slick neon reflections on dark city streets.',
      texture: 'Clean digital cel with holographic interface-like overlays without text.',
      camera:
        'Surveillance-grid framing from above and tense noir detective close-ups at street level.',
      mood: 'cold surveillance dread',
      render: 'Sleek Production I.G television frame with cold cyberpunk surveillance atmosphere.',
      key: 'Psycho-Pass surveillance; holographic grids; cold blue; detective noir',
      avoid: ['a transforming revolver-like enforcement gun', 'existing franchise characters'],
      briefs: [
        'Lowering herself from a skylight into a museum vault, a cloaked thief freezes as a cold blue grid of scanning light slowly sweeps across her boots. No readable text or logo.',
        'A detective in a dark trench coat stands in the rain while holographic outlines of every passerby glow blue around him. No readable text or logo.',
        'In an empty office at midnight, a potted plant is outlined by a pulsing red surveillance grid. No readable text or logo.',
      ],
    }),
    au('SP05-054', 'Aldnoah.Zero - Luminous Beam Opera', {
      look: 'A-1 Pictures and TROYCA Aldnoah.Zero look (2014): orbital knights in ornate gold-and-ivory mechs, dramatic Hiroyuki Sawano-style operatic scale, and grounded soldiers beneath.',
      subject:
        'draw people with sleek modern designs, aristocratic knights in capes and grounded soldiers in plain uniforms.',
      color: 'Ivory, gold, royal crimson and cold orbital blue.',
      light: 'Bright beam flashes, harsh orbital sunlight and glowing crests on armor.',
      texture: 'Clean cel characters with CG mechs and painted skies.',
      camera: 'Heroic wides of towering mechs and ground-level soldiers.',
      mood: 'operatic orbital grandeur',
      render: 'Polished operatic mecha frame with ornate gold detail.',
      key: 'Aldnoah orbital knights; gold ivory mechs; beam opera; soldiers below',
      briefs: [
        'Rising off a burning coastline, an ivory-and-gold flagship mech spreads glowing beam fins as a lone foot soldier on the beach below shields his eyes. No readable text or logo.',
        'Two orbital knights share tea on a palace balcony above the clouds while fleets slowly gather in the sky behind them. No readable text or logo.',
        'Half buried in desert sand at dusk, a cracked golden knight crest still glows faintly as a lone scavenger kneels to brush the dust away. No readable text or logo.',
      ],
    }),
    au('SP05-055', 'Mamoru Nagano - Gothic Tech Existential Dread', {
      look: 'Mamoru Nagano look as in The Five Star Stories and Gothicmade: ornate gothic mecha with elegant armor plates, fashion-illustration elegance, and melancholy knights.',
      subject:
        'draw people with Nagano fashion elegance, slender bodies, flowing hair and ornate gothic armor and robes.',
      color: 'Ivory, black lacquer, gold filigree and deep gothic reds.',
      light: 'Soft gothic cathedral light and elegant rim light.',
      texture: 'Fine ornamental line, fashion rendering and lacquered armor.',
      camera: 'Elegant tall vertical compositions and ornate close-ups of lacquered armor plates.',
      mood: 'melancholy ornate dread',
      render: 'Ornate fashion-illustration frame with gothic mecha and melancholy knights.',
      key: 'Mamoru Nagano gothic mecha; fashion elegance; ornate armor; melancholy',
      briefs: [
        'Abandoned in a cathedral-sized hangar, a hunched many-jointed crane walker with gothic armor plates kneels as if praying while dust falls through stained-glass light. No readable text or logo.',
        'A knight in ornate lacquered armor stands in a rose garden, her enormous gothic mecha quietly waiting behind the hedge. No readable text or logo.',
        'An empty ornate cockpit glows softly in the dark, a single glove left on the seat. No readable text or logo.',
      ],
    }),
    au('SP05-057', 'Darling in the Franxx - Sleek Collapse Romance', {
      look: 'Trigger and A-1 Pictures Darling in the Franxx look (2018): sleek feminine-silhouette mechs, pastel pink and teal, glass-dome plantations, and tragic young romance.',
      subject:
        'draw people with Masayoshi Tanaka designs, clean faces, sleek pilot suits and expressive eyes.',
      color: 'Pastel pink, teal, white and deep sunset red.',
      light: 'Soft dome light, sunset glow and mech eye glows.',
      texture: 'Clean digital cel characters with sleek CG mechs and soft glow effects.',
      camera: 'Romantic two-shots of pilots and sweeping mech battles over collapsing cities.',
      mood: 'tragic sleek romance',
      render: 'Polished Trigger and A-1 frame with sleek mech silhouettes.',
      key: 'Franxx sleek mechs; pastel pink and teal; domes; romance',
      avoid: ['a pink-haired girl with red horns', 'existing franchise characters'],
      briefs: [
        'Standing on the shoulder of a sleek white mech above a collapsing glass dome, an adult pilot in a white flight suit reaches for her partner’s hand as pink petals swirl through the broken panes. No readable text or logo.',
        'Two aging pilots sit on a hangar floor sharing a thermos, their sleek mechs kneeling behind them like tired dancers. No readable text or logo.',
        'Inside a quiet glass dome at sunset, a single pink flower grows through a cracked mech palm. No readable text or logo.',
      ],
    }),
    au('SP05-058', 'Stand Alone Complex - Remote Command Grief', {
      look: 'Production I.G Ghost in the Shell: Stand Alone Complex look (2002): grounded cybernetic police drama, spider-legged think tanks, Hong Kong-like future cities and quiet grief over machine minds.',
      subject:
        'draw people with SAC realism, grounded adult faces, tactical gear and suits, and spider-legged machines with personality.',
      color: 'Teal city tones, olive tactical gear and warm cockpit amber.',
      light: 'Diffuse city light, cockpit screens and rainy reflections.',
      texture: 'Clean realistic cel with CG machines and painted cities.',
      camera: 'Tactical command-room framing with quiet emotional close-ups on tired operators.',
      mood: 'quiet machine grief',
      render: 'Grounded Production I.G television frame with realistic cyber detail.',
      key: 'SAC realism; spider-legged machines; command rooms; machine grief',
      avoid: [
        'a blue spider tank with a pod head and big round eyes',
        'a purple-haired cyborg major',
        'existing franchise characters',
      ],
      briefs: [
        'Sitting on the floor of a dim command room, a drone operator in her fifties holds the scuffed controller of a spider-legged machine that did not come back, its empty charging bay glowing beside her. No readable text or logo.',
        'Three small spider-legged robots argue silently over a crate of oil cans in a rainy alley, legs tapping impatiently. No readable text or logo.',
        'An empty charging dock blinks green in a quiet hangar, a child’s drawing of a spider robot taped above it. No readable text or logo.',
      ],
    }),
    au('SP05-059', 'Dennou Coil - Tactical Network Cognition', {
      look: 'Madhouse Dennou Coil look (2007) by Mitsuo Iso: augmented-reality glasses revealing glitching digital creatures in ordinary towns, hand-drawn realism and fluid acting.',
      subject:
        'draw people with simple grounded designs, glasses, ordinary town clothes and precise natural acting.',
      color: 'Summer town greens, sky blue and glitch pink and cyan.',
      light: 'Ordinary summer daylight with glowing augmented-reality effects floating in the air.',
      texture: 'Clean hand-drawn cel with pixel glitch overlays and translucent digital creatures.',
      camera: 'Ordinary small-town framing suddenly interrupted by glitching digital phenomena.',
      mood: 'curious digital uncanniness',
      render:
        'Precise Madhouse television frame with augmented-reality glitch effects and natural acting.',
      key: 'Dennou Coil AR glasses; digital glitches; ordinary towns; Iso realism',
      briefs: [
        'Half dissolved by pixel noise, an adult agent in augmented-reality glasses walks through a sleepy summer town where digital fish swim through the air above the rice fields. No readable text or logo.',
        'An old man in thick glasses feeds a glitching digital dog on his porch while his real cat stares at it suspiciously. No readable text or logo.',
        'A street corner flickers as a patch of pixel noise slowly eats the corner of a mailbox. No readable text or logo.',
      ],
    }),
    au('SP05-060', 'Gundam Wing - Orbital Rivalry Symmetry', {
      look: 'Sunrise Mobile Suit Gundam Wing look (1995): elegant bishonen pilots, sleek winged mobile suits, orbital colonies and symmetrical rival duels with nineties cel shine.',
      subject:
        'draw people with nineties bishonen designs, sharp eyes, flowing hair and pilot suits or military uniforms.',
      color: 'Deep space blue, royal violet, crimson and brilliant white with gold trim.',
      light: 'Orbital sunlight, beam saber glows and nineties cel highlights.',
      texture: 'Late analog cel with glossy airbrushed mech shading and soft film grain.',
      camera: 'Symmetrical rival compositions in orbit and cockpit close-ups.',
      mood: 'elegant orbital rivalry',
      render:
        'Polished mid-nineties Sunrise television frame with bishonen elegance and orbital scale.',
      key: 'Gundam Wing bishonen; winged mechs; orbital rivals; symmetry',
      avoid: [
        'white mobile suits with V-fin antennas and angel wings',
        'existing franchise characters',
      ],
      briefs: [
        'Facing each other in perfect symmetry above a blue planet, two slender rival mechs, one violet and one crimson, hold glowing blades crossed while their pilots’ reflections meet in the visors. No readable text or logo.',
        'On a colony balcony above a slowly turning blue planet, two retired rival pilots play a very serious game of chess with mech-shaped pieces. No readable text or logo.',
        'Drifting silently through orbit, a single white feather-like armor panel tumbles past a space station window, glinting in the harsh unfiltered sunlight. No readable text or logo.',
      ],
    }),
    au('SP05-221', 'Macross Frontier - Pop-Signal Engineered Romance', {
      look: 'Satelight Macross Frontier look (2008): CG transforming valkyries in dazzling missile circuses, idol concerts in space colonies and bright glossy pop romance.',
      subject:
        'draw people with glossy late-2000s designs, big bright eyes, idol costumes and flight suits.',
      color: 'Idol pink, sky cyan, white contrails and gold.',
      light: 'Stage spotlights, missile flare trails and bright colony skies.',
      texture: 'Glossy digital cel with CG fighters and particle effects.',
      camera: 'Missile circus spirals around fighters and wide shots of glittering concert stages.',
      mood: 'dazzling pop romance',
      render: 'Glossy Satelight television frame with CG missile circus and idol sparkle.',
      key: 'Macross Frontier idols; CG valkyries; missile circus; pop romance',
      avoid: ['VF-25 fighter markings', 'existing franchise characters'],
      briefs: [
        'Looping between missile trails above a floating concert stage, a sleek white swept-wing fighter flies so close to the singer that her sequined cape ripples in its wake. No readable text or logo.',
        'An aging idol practices dance steps alone in a hangar while mechanics pretend not to watch from the fighter wings. No readable text or logo.',
        'An empty stage in a space colony glows at midnight, one microphone still on its stand. No readable text or logo.',
      ],
    }),
    au('SP05-223', 'Bubblegum Crisis AIC - Armored Chrome Noir Elegance', {
      look: 'AIC Bubblegum Crisis OVA look (1987) with Kenichi Sonoda designs: sleek chrome hardsuits, eighties megacity neon, rock music noir and glossy android menace.',
      subject:
        'draw people with Sonoda designs, big eighties hair, sleek chrome hardsuits and glossy android bodies.',
      color: 'Chrome silver, neon magenta, night blue and hot pink.',
      light: 'Neon megacity night light and hard chrome reflections on hardsuits.',
      texture: 'Glossy hand-painted cel with airbrushed chrome highlights and soft grain.',
      camera: 'Low noir angles in rainy streets and dynamic hardsuit action sequences.',
      mood: 'sleek chrome noir',
      render: 'Glossy 1987 OVA frame with chrome and neon.',
      key: 'Bubblegum Crisis hardsuits; chrome noir; eighties neon; Sonoda designs',
      briefs: [
        'Playing a smoky saxophone solo on a rooftop in the rain, a chrome-plated android jazz musician reflects every neon sign of the megacity across her polished shoulders. No readable text or logo.',
        'Four hardsuit-clad women drink coffee at an all-night neon diner, their chrome helmets lined up on the counter like trophies after a long night. No readable text or logo.',
        'On a wet megacity street under flickering pink neon, a single chrome hardsuit glove lies in a puddle, still twitching its fingers. No readable text or logo.',
      ],
    }),
    au('SP05-225', 'Yukito Kishiro - Scrap Velocity Resilience', {
      look: 'Yukito Kishiro Battle Angel manga look: dense mechanical cyborg detail, scrapyard cities beneath a floating sky city, motorball speed and fierce hatched action.',
      subject:
        'draw people with Kishiro designs, big soulful eyes, detailed cyborg bodies, visible joints and ragged clothes.',
      color: 'Black ink with dense tone, rust and steel tints in color pages.',
      light: 'Industrial haze under the floating city and harsh sparks from grinding metal.',
      texture: 'Dense mechanical hatching, exposed cyborg joints and cable detail.',
      camera: 'High-speed track racing action and sweeping scrapyard city panoramas.',
      mood: 'fierce scrappy resilience',
      render: 'Detailed cyberpunk manga illustration with extraordinary mechanical density.',
      key: 'Yukito Kishiro cyborg detail; scrapyards; motorball speed; hatching',
      avoid: [
        'a cyborg girl with a bob haircut and berserker body',
        'existing franchise characters',
      ],
      briefs: [
        'Skidding around a scrapyard racetrack on sparking wheeled feet, a patchwork junk mech built from washing machines and car doors overtakes a sleek rival as the crowd of scavengers roars. No readable text or logo.',
        'A cyborg mechanic in her sixties tightens a bolt on her own knee while fixing a customer’s arm. No readable text or logo.',
        'In a rusty scrap pile beneath the floating city, a single detailed cyborg hand still clutches a small wildflower someone left there. No readable text or logo.',
      ],
    }),
    au('SP05-226', 'Ergo Proxy Manglobe - Cyber-Goth Mausoleum Dread', {
      look: 'Manglobe Ergo Proxy look (2006): dark cyber-goth domed cities, grey-blue monochrome palettes, gothic architecture, AutoReiv androids and existential dread.',
      subject:
        'draw people with gothic designs, pale faces, dark eye makeup, long coats and elegant android companions.',
      color: 'Near-monochrome grey-blue and black with pale skin tones and faint teal glows.',
      light: 'Dim cold light, stark shadows and glowing android eyes.',
      texture: 'Moody digital cel with gothic architecture and fog.',
      camera: 'Gothic architectural wide shots and eerie close-ups on pale faces.',
      mood: 'cold existential dread',
      render: 'Moody near-monochrome Manglobe television frame with gothic fog.',
      key: 'Ergo Proxy cyber-goth; monochrome grey-blue; domed city; androids',
      avoid: [
        'a pale woman with dark eye makeup and a short bob in a fur collar',
        'existing franchise characters',
      ],
      briefs: [
        'Walking through a mausoleum of stacked server coffins under a dome city, an archivist in a hooded cyber-goth coat stops as one coffin begins to hum a lullaby. No readable text or logo.',
        'Every evening in a grey-blue apartment under the dome, an elegant android butler serves hot tea to an empty chair and waits patiently. No readable text or logo.',
        'Fog drifts through a gothic plaza under the dome, where one streetlamp flickers in a steady rhythm. No readable text or logo.',
      ],
    }),
    au('SP05-229', 'Cyber City Oedo 808 - Punitive Neon Vice Texture', {
      look: 'Yoshiaki Kawajiri Cyber City Oedo 808 OVA look (1990): punk convict cops with explosive collars, neon vice cities, hard shadows and gritty cyberpunk violence.',
      subject:
        'draw people with Kawajiri realism, tough punk convicts, sharp faces and street clothes with tech.',
      color: 'Neon purple, acid green, black and sodium orange.',
      light: 'Neon vice light from signs and hard black shadows in alleys.',
      texture: 'Gritty hand-painted cel with neon grime, rain and grain.',
      camera: 'Low noir angles, rooftop chases and gritty close-range action.',
      mood: 'punitive neon grit',
      render: 'Gritty 1990 Madhouse OVA frame with neon vice and punk menace.',
      key: 'Oedo 808 convict cops; neon vice; hard shadows; punk',
      briefs: [
        'Hunting through a neon market with a blinking collar around his neck, a bounty hunter with a cybernetic eye grins as the timer on his collar counts down. No readable text or logo.',
        'Three convict cops share cheap noodles on a neon rooftop in the rain, the explosive collars around their necks blinking in perfect unison. No readable text or logo.',
        'Above an empty alley in a neon vice district, a cracked sign hisses and sparks in the rain, painting the puddles purple and green. No readable text or logo.',
      ],
    }),
    au('SP05-230', 'Tsutomu Nihei - Terminal Megastructure Silence', {
      look: 'Tsutomu Nihei BLAME! manga look: endless megastructures, vast silent industrial voids, sketchy scratchy line, tiny lone wanderers and cold biomechanical horror.',
      subject:
        'draw people with Nihei designs, gaunt lone figures in long coats, and biomechanical beings.',
      color: 'Black ink with grey tone and cold empty whites.',
      light: 'Faint cold light from distant fixtures swallowed by vast darkness.',
      texture: 'Scratchy architectural pen line, heavy black voids and industrial texture.',
      camera: 'Tiny lone figures lost inside colossal megastructures that vanish into darkness.',
      mood: 'vast silent desolation',
      render: 'Scratchy cyberpunk manga illustration with immense silent architectural scale.',
      key: 'Tsutomu Nihei megastructures; silence; scratchy line; vast scale',
      avoid: [
        'a gaunt wanderer with a gravitational beam emitter pistol',
        'existing franchise characters',
      ],
      briefs: [
        'Crossing a bridge spanning a chasm miles deep inside an endless concrete megastructure, a lone wanderer in a ragged coat looks up at structures that vanish into darkness. No readable text or logo.',
        'An old maintenance robot sweeps an endless corridor that no one has walked in a thousand years. No readable text or logo.',
        'A single light glows at the bottom of an immense shaft, too far away to reach. No readable text or logo.',
      ],
    }),
    au('SP05-231', 'RahXephon BONES - Coral Resonance Liturgy', {
      look: 'BONES RahXephon look (2002) with Akihiro Yamada designs: art nouveau-flavored elegant figures, singing ceramic-like mechs, Tokyo under a dome and musical mysticism.',
      subject:
        'draw people with Akihiro Yamada designs, refined faces, flowing hair and elegant uniforms.',
      color: 'Coral pink, ceramic white, sea blue and gold.',
      light: 'Soft resonant glow from ceramic mechs and luminous coral-tinted skies.',
      texture: 'Clean cel with painterly art nouveau ornament and ceramic surfaces.',
      camera: 'Elegant balanced compositions and slow resonant reveals of singing mechs.',
      mood: 'mystical musical resonance',
      render: 'Refined BONES television frame with art nouveau elegance and musical mysticism.',
      key: 'RahXephon art nouveau; singing mechs; coral colors; resonance',
      briefs: [
        'Kneeling before a giant ceramic mech that hums like a church organ, a priestess-engineer in heavy robes tunes its chest with a silver tuning fork as coral light fills the chamber. No readable text or logo.',
        'An old violinist plays on a beach at dusk and a coral-colored giant rises from the sea to listen. No readable text or logo.',
        'Washed up on a coral-pink beach at dusk, a cracked ceramic mask lies in the foam, faintly singing a note that makes the shells tremble. No readable text or logo.',
      ],
    }),
    au('SP05-232', '86 A-1 Pictures - Dustfront Drone Lament', {
      look: 'A-1 Pictures 86 look (2021): dusty spider-legged drones on battlefields, clean interior command rooms contrasted with brutal front lines, and quiet lament.',
      subject: 'draw people with clean modern designs, uniforms, and drones with spider legs.',
      color: 'Dust tan, olive, blood red and cold command-room blue.',
      light: 'Dusty battlefield sunlight contrasted with the cold glow of clean command rooms.',
      texture: 'Clean digital cel with CG drones and dust.',
      camera: 'Split contrasts between sterile command rooms and dusty ruined battlefields.',
      mood: 'quiet mournful lament',
      render: 'Polished A-1 Pictures television frame with dusty battle scenes and restraint.',
      key: '86 spider drones; dustfront; command contrast; lament',
      briefs: [
        'Limping across a dusty battlefield at sunset, an old four-rotor cargo drone carries a single canteen toward a trench where nobody is waiting anymore. No readable text or logo.',
        'A commander in a clean uniform listens to static in a cold room, her tea going cold. No readable text or logo.',
        'In a meadow that used to be a battlefield, rusted spider-legged drones stand frozen among wildflowers, vines curling up their legs. No readable text or logo.',
      ],
    }),
    au('SP05-233', 'Knights of Sidonia Polygon - Vacuum-Fortress Survival Discipline', {
      look: 'Polygon Pictures Knights of Sidonia look (2014): cel-shaded 3D, a colony ship-fortress, gaunt Nihei-derived designs, organic alien horrors and strict survival discipline.',
      subject: 'draw people as cel-shaded 3D figures with gaunt faces, pilot suits and helmets.',
      color: 'Cold greys, white suits, dark space and organic flesh pinks.',
      light: 'Cold industrial hangar light and harsh vacuum glare on white suits.',
      texture: 'Cel-shaded CG surfaces with clean outlines and simple flat shadows.',
      camera: 'Hangar wides, cockpit views and vast alien shapes.',
      mood: 'disciplined survival dread',
      render: 'Cel-shaded Polygon Pictures frame with vacuum survival scale.',
      key: 'Sidonia cel-shaded CG; colony fortress; alien horrors; discipline',
      briefs: [
        'Floating outside a colony-ship hull in a bulky white suit, an engineer patches a crack while a vast organic shape drifts past in the distance, blocking out the stars. No readable text or logo.',
        'Pilots eat rations in perfect silent rows in a cold mess hall, helmets under their arms. No readable text or logo.',
        'Floating alone in the black void, a small blinking rescue beacon marks the exact spot where a colony ship used to be. No readable text or logo.',
      ],
    }),
    au('SP05-234', 'Muv-Luv Alternative - Extinction Interface Command', {
      look: 'Muv-Luv Alternative look: tactical surface fighters against endless alien swarms, grim military command, sleek mechs and extinction-scale battle maps.',
      subject:
        'draw people with sleek visual-novel-derived designs, pilot suits and military uniforms.',
      color: 'Military blue, alien flesh red, cold command teal.',
      light: 'Cold command-room glow and orange battlefield flare light across swarms.',
      texture: 'Clean digital cel with CG mechs and swarms.',
      camera: 'Command-room wides and massive swarm battles covering entire landscapes.',
      mood: 'grim extinction pressure',
      render: 'Grim military mecha frame with extinction-scale alien swarms.',
      key: 'Muv-Luv surface fighters; alien swarms; grim command; extinction scale',
      briefs: [
        'A continent-sized tide of alien swarm creatures rolls over a mountain range on a command table display while an exhausted general in a rumpled uniform quietly moves one small marker. No readable text or logo.',
        'A lone mech pilot sits on her machine’s shoulder at dawn, watching the horizon for the next swarm. No readable text or logo.',
        'In a deserted command bunker, an empty commander’s chair faces a wall of dark screens, a cold cup of coffee still on the armrest. No readable text or logo.',
      ],
    }),
    au('SP05-235', 'Megazone 23 - Pop-Cyber Simulation Gloss', {
      look: 'AIC Megazone 23 OVA look (1985) with Haruhiko Mikimoto and Toshihiro Hirano: eighties Tokyo as a simulation, idol singers, motorcycles and glossy pop cyberpunk.',
      subject:
        'draw people with Mikimoto designs, glossy eyes, feathered eighties hair, biker jackets and idol costumes.',
      color: 'Neon pink, electric blue, chrome and night purple.',
      light: 'Neon night city light with glossy eighties highlights on eyes and bikes.',
      texture: 'Glossy hand-painted eighties cel with neon glows and soft grain.',
      camera: 'Night highway motorcycle rides and glittering idol stage shots.',
      mood: 'glossy simulated romance',
      render: 'Glossy 1985 AIC OVA frame with pop cyberpunk and simulated city.',
      key: 'Megazone 23 pop; Mikimoto eyes; simulated Tokyo; neon highways',
      briefs: [
        'Dancing on a translucent stage above a neon highway, an avatar singer flickers as the city behind her briefly reveals its wireframe skeleton. No readable text or logo.',
        'Riding a motorcycle through a neon tunnel at night, a biker notices the lights stretching around her like lines of glowing code. No readable text or logo.',
        'In a silent simulated city at midnight, an empty idol stage glows pink while a single spotlight sways as if someone just left. No readable text or logo.',
      ],
    }),
    au('SP05-237', 'Gunbuster Gainax - Monumental Ignition Sacrifice', {
      look: 'Gainax Gunbuster OVA look (1988) by Hideaki Anno: hot-blooded training spirit, colossal combining super robots, space fleets and dramatic heroic poses in color.',
      subject:
        'draw people with Mikimoto-derived designs, big glossy eyes, athletic training suits and headbands.',
      color: 'Hot heroic red, deep space blue, clean white and gleaming gold accents.',
      light: 'Heroic backlight and dramatic space explosions blooming behind giant robots.',
      texture: 'Hand-painted cel with detailed airbrushed mech painting and grain.',
      camera: 'Monumental heroic robot poses and huge space battle wides with fleets.',
      mood: 'hot-blooded heroic sacrifice',
      render: 'Heroic 1988 Gainax OVA frame with hot-blooded energy.',
      key: 'Gunbuster heroics; colossal robots; training spirit; space fleets',
      avoid: ['a giant robot with a headband crossing its arms', 'existing franchise characters'],
      briefs: [
        'Kneeling in a vast space hangar, a battered colossus mech lowers its head as a tiny pilot in a training suit salutes it before the final launch. No readable text or logo.',
        'Two retired pilots in faded training suits jog laps at dawn around the enormous feet of a giant robot parked in a field. No readable text or logo.',
        'Near a round porthole full of stars, a single faded red training headband floats slowly in zero gravity inside an empty cabin. No readable text or logo.',
      ],
    }),
    au('SP05-239', 'Diebuster Gainax - Bubblegum Cosmic Overdrive', {
      look: 'Gainax Diebuster look (2004) by Kazuya Tsurumaki: bubblegum pop sci-fi, giant pink cosmic mechs, cute designs and absurdly huge cosmic scale.',
      subject:
        'draw people with cute bubbly designs, big eyes, colorful space suits and playful poses.',
      color: 'Bubblegum pink, star yellow, cosmic blue and white.',
      light: 'Bright cosmic glow, sparkling stars and pink energy trails.',
      texture: 'Glossy digital cel with bubbly pop effects and star sparkles.',
      camera: 'Absurd cosmic scale shots with planets as props and playful action.',
      mood: 'bubbly cosmic overdrive',
      render: 'Bright bubblegum pop Gainax frame with absurd cosmic scale.',
      key: 'Diebuster pop; pink cosmic mechs; absurd scale; cute designs',
      briefs: [
        'Towing a whole planet behind it on a glowing ribbon, a round pink starfighter with cat-ear fins zooms past a startled fleet of grey battleships. No readable text or logo.',
        'A cheerful pilot in a bubblegum suit waves at a black hole as if it were a neighbor. No readable text or logo.',
        'Sitting on the glittering rings of a gas giant, a tiny bubblegum-pink mech swings its legs like a bored child waiting for dinner. No readable text or logo.',
      ],
    }),
    au('SP05-227', 'Texhnolyze Madhouse - Rust-Wire Descent', {
      look: 'Madhouse Texhnolyze look (2003) with Yoshitoshi ABe concepts: bleak underground city, rusted prosthetics, muted sepia palettes, long silences and fatalistic violence.',
      subject:
        'draw people with gaunt realistic designs, rusted mechanical limbs and worn clothing.',
      color: 'Muted sepia, rust brown, grey and faint green.',
      light: 'Dim underground light, flickering lamps and faint shafts from far above.',
      texture: 'Gritty cel with rust, grime and peeling paint textures.',
      camera: 'Long silent shots and descending vertical compositions through shafts.',
      mood: 'bleak fatalistic descent',
      render: 'Bleak Madhouse television frame with rust, silence and fatalism.',
      key: 'Texhnolyze rust; underground city; prosthetics; silence',
      briefs: [
        'Rappelling down the rusted inner wall of an underground city shaft, a cable diver with a mechanical arm stops to watch a single ray of daylight far above. No readable text or logo.',
        'An old man with a rusted prosthetic leg sits by a flickering lamp, sharpening a knife slowly. No readable text or logo.',
        'In an empty underground plaza lit by one failing lamp, rust flakes drift down from the ceiling like slow brown snow. No readable text or logo.',
      ],
    }),
    au('SP05-053', 'Naoyuki Kato - Hydraulic Attrition Mass', {
      look: 'Naoyuki Kato mecha illustration look: painterly box-art and novel-cover paintings of heavy industrial war machines, weathered metal, hydraulic pistons and atmospheric battlefields.',
      subject:
        'draw figures small beside huge weathered war machines with hydraulic pistons and heavy armor.',
      color: 'Rust, olive drab, smoke grey and sunset orange.',
      light: 'Atmospheric orange sunset and smoky battlefield light through dust.',
      texture: 'Painterly box-art brushwork, chipped weathered metal and drifting dust.',
      camera: 'Heroic box-art compositions with dramatic low angles and tiny figures.',
      mood: 'heavy industrial attrition',
      render: 'Painterly mecha box-art illustration with weathered industrial weight.',
      key: 'Naoyuki Kato box art; heavy machines; hydraulic pistons; weathered metal',
      briefs: [
        'Crossing a smoking battlefield at sunset, a twin-piston siege walker as tall as a church hisses steam from every joint while tiny engineers ride on its back. No readable text or logo.',
        'A mechanic sits in the shade of a giant hydraulic leg, drinking tea during a lull in battle. No readable text or logo.',
        'In a golden wheat field years after the war, a rusted hydraulic piston sticks out of the ground, overgrown with red poppies. No readable text or logo.',
      ],
    }),
  ]),
};

export default spec;
