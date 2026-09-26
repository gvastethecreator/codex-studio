import type { Spec } from '../tools/apply';
import { au } from './_authors';

// Modern shonen and action (part B), author pass: each preset names its mangaka or studio and the
// concrete marks of that hand. Template briefs are replaced with original scenes that suit the look.
const spec: Spec = {
  pack: 'pack_05',
  category: '1. Modern Shonen & Action',
  updates: Object.fromEntries([
    au('SP05-123', 'Fire Force David Production - White-Core Flame Halo Cel', {
      look: 'David Production Fire Force look (2019): white-hot core flames with orange halos, fire brigades in heavy soot-stained uniforms, gothic cathedral architecture and fluid flame effects animation.',
      subject:
        'draw people with Ohkubo-derived designs, sharp toothy grins, heavy firefighter uniforms with reflective stripes and nimble flame-propelled poses.',
      color: 'White-hot flame cores, orange halos, soot black and brass reflective stripes.',
      light: 'Blazing fire as the main light source, white cores glowing and deep soot shadows.',
      texture: 'Clean cel characters with fluid hand-drawn flame effects and ember particles.',
      camera: 'Flame-propelled dives, cathedral interiors and dramatic smoke-filled wide shots.',
      mood: 'blazing zealous heroism',
      render: 'Vivid David Production frame with fluid white-core flame animation.',
      key: 'White-core flames; soot-stained brigades; gothic cathedrals; fluid fire effects',
      avoid: [
        'a fire soldier with flaming feet and a shark-tooth grin',
        'existing franchise characters',
      ],
      briefs: [
        'Walking out of a burning timber chapel untouched, a fire-priest in a soot-black cassock spreads her arms as the flames around her burn white at the center and orange at the edges. No readable text or logo.',
        'A foundry worker pours molten bronze into a bell mold, the stream glowing white-hot inside a halo of orange sparks. No readable text or logo.',
        'A shrine keeper lights a row of oil lamps at dusk, and each small flame burns with a bright white heart. No readable text or logo.',
      ],
    }),
    au('SP05-125', 'Kaiju No. 8 Production I.G - Hazard-Orange Monster Response Cel', {
      look: 'Production I.G Kaiju No. 8 look (2024): civic monster cleanup crews, hazard-orange uniforms, colossal CG-textured kaiju carcasses in cities and bright procedural action.',
      subject:
        'draw people with clean modern designs, tired adult workers in hazard gear, helmets and utility belts, beside enormous creature bodies.',
      color: 'Hazard orange, city concrete grey, kaiju green and steel blue.',
      light: 'Bright overcast daylight with floodlights on monster carcasses at night.',
      texture: 'Clean digital cel with textured monster hides and industrial equipment.',
      camera: 'Tiny crews beside colossal carcasses, low angles and procedural wide shots.',
      mood: 'gritty civic resilience',
      render: 'Polished Production I.G frame with enormous monster scale.',
      key: 'Hazard orange crews; colossal kaiju carcasses; civic cleanup; city scale',
      briefs: [
        'Operating a crane from a scuffed orange cab, a middle-aged cleanup worker lifts a colossal monster tooth off a flattened shopping street while her crew hoses down the pavement. No readable text or logo.',
        'A harbor pilot steers an orange tugboat past the floating ribcage of a sea monster bigger than the harbor itself. No readable text or logo.',
        'A road-crew worker repaints a lane line around a single giant footprint pressed into the asphalt. No readable text or logo.',
      ],
    }),
    au('SP05-126', 'Dandadan Science SARU - Acid Occult Color-Burst Smear', {
      look: 'Science SARU Dandadan look (2024): acid neon color bursts, psychedelic occult battles, rubbery smear animation, grotesque yokai and aliens, and romantic comedy energy.',
      subject:
        'draw people with Dandadan designs, expressive faces, school or casual clothes, and occult creatures with grotesque glowing features.',
      color: 'Acid green, hot magenta, electric blue and black backgrounds.',
      light:
        'Psychedelic color-burst light, glowing occult auras and neon flashes cutting through darkness.',
      texture: 'Rubbery smear frames, flat neon color and energetic lines.',
      camera: 'Wild spinning action, extreme perspective and comedic close-ups.',
      mood: 'frantic occult romance',
      render: 'Explosive Science SARU frame with neon smear animation.',
      key: 'Acid neon bursts; smear animation; occult creatures; frantic comedy',
      avoid: [
        'a boy with glasses possessed by a ball-shaped spirit',
        'existing franchise characters',
      ],
      briefs: [
        'Tumbling down a haunted manor staircase, a ghost-hunter couple in their forties grab each other as their flashlights smear into acid-green and magenta streaks around a laughing spirit. No readable text or logo.',
        'An ice skater spins on a frozen lake at night as neon occult lights smear into rings around her blades. No readable text or logo.',
        'A man repots a cactus on his balcony while a tiny glowing alien watches from the flowerpot, both perfectly calm. No readable text or logo.',
      ],
    }),
    au('SP05-127', 'Yuji Kaku - Toxic Flower Etched Ink', {
      look: "Yuji Kaku Hell's Paradise manga look: finely etched ink with lush toxic flora, uncanny flower-bodied creatures, a paradise island of beauty and dread.",
      subject:
        'draw people with Kaku designs, lean ninja and executioner figures, calm faces and period clothing amid strange blooming creatures.',
      color: 'Black ink with fine tone, and in color: toxic magenta, jade green and pale gold.',
      light: 'Soft eerie jungle light filtered through giant petals.',
      texture: 'Fine etched pen line, delicate floral detail and organic hatching.',
      camera: 'Lush jungle compositions with small figures surrounded by uncanny flowers.',
      mood: 'beautiful toxic dread',
      render: 'Delicate etched manga illustration with lush uncanny flora.',
      key: 'Yuji Kaku etched ink; toxic flowers; paradise dread; flower-bodied creatures',
      briefs: [
        'Wading waist-deep through a jungle of giant poison orchids, a plague doctor in waxed linen notices that every blossom has quietly turned to face him. No readable text or logo.',
        'A moss-covered skeleton in rusted armor sits against a tree, flowers with tiny human faces blooming from its ribs. No readable text or logo.',
        'A greenhouse keeper pots seedlings at dawn, and one sprout has grown a single perfect eyelash. No readable text or logo.',
      ],
    }),
    au('SP05-038', 'ONE - Psychedelic Psychic Minimalism', {
      look: 'ONE original manga look as in Mob Psycho 100: crude wobbly amateur linework, minimal blank faces, empty white spaces and sudden psychic energy scribbles.',
      subject:
        'draw people with ONE crude simplicity, bowl haircuts, blank dot eyes, simple bodies and ordinary clothes.',
      color: 'Black ink and white paper with rough scribbled tone.',
      light: 'No modeled light, only scribbled energy lines and blank white glare.',
      texture: 'Wobbly amateurish pen lines, rough scribbles and blank space.',
      camera: 'Flat simple panels that erupt into chaotic energy scribbles.',
      mood: 'deadpan psychic weirdness',
      render: 'Crude charming manga illustration with explosive scribble energy.',
      key: 'ONE crude line; blank faces; empty space; psychic scribbles',
      avoid: ['a bowl-cut boy in a black school uniform', 'existing franchise characters'],
      briefs: [
        'In an empty white room, a fortune-teller with a blank face sets down her teacup as the whole table floats upward in a scribbled storm of psychic energy. No readable text or logo.',
        'A kite flier on a bare hill stares blankly as the horizon wobbles and ripples like a badly drawn line. No readable text or logo.',
        'A commuter waits alone at an empty crossing, and the traffic light quietly bends toward her. No readable text or logo.',
      ],
    }),
    au('SP05-130', 'Mob Psycho 100 BONES - Paint-on-Glass Surge Burst', {
      look: 'BONES Mob Psycho 100 look (2016): simple rounded ONE designs animated with explosive sakuga, paint-on-glass psychic bursts in pink and cyan, and rich hand-painted surges.',
      subject:
        'draw people with simple rounded designs, bowl-like hair and dot eyes, erupting into rich painted psychic energy.',
      color: 'Pastel pink, cyan, lemon and deep violet surges on muted city tones.',
      light: 'Glowing psychic surges painting the whole frame with color.',
      texture: 'Paint-on-glass animation textures, smeared brushstrokes and simple outlines.',
      camera:
        'Explosive compositions that burst outward from the center, alternating with quiet deadpan framing.',
      mood: 'overflowing emotional surge',
      render: 'Rich BONES television frame with hand-painted paint-on-glass psychic animation.',
      key: 'Paint-on-glass bursts; simple rounded designs; pink and cyan surge; sakuga',
      avoid: ['a bowl-cut boy in a black school uniform', 'existing franchise characters'],
      briefs: [
        'Screaming on a cliff edge, a wandering oracle unleashes a surge of painted pink and cyan brushstrokes that swirls up and repaints the entire stormy sky. No readable text or logo.',
        'Breaching far out at sea, a humpback whale bursts through water that suddenly turns into thick swirling paint-on-glass color, pink and cyan streaks flying off its fins. No readable text or logo.',
        'An office worker stares at a cup of coffee until the surface swirls into tiny painted galaxies. No readable text or logo.',
      ],
    }),
    au('SP05-137', 'Boichi - Chalk-Schematic Inventor Cel', {
      look: 'Boichi manga art as in Dr. Stone: hyper-detailed realistic rendering, handsome dramatic faces, dense hatching, scientific diagrams and inventions drawn with engineering precision.',
      subject:
        'draw people with Boichi realism, sharp handsome faces, detailed hair strands, muscular builds and makeshift inventor gear.',
      color: 'Black ink with dense tone, and in color: chalkboard green, parchment and bright sky.',
      light: 'Dramatic sunlight and triumphant glowing highlights on inventions.',
      texture: 'Dense detailed hatching, schematic chalk lines and diagram overlays.',
      camera: 'Triumphant low angles with schematic overlays and invention close-ups.',
      mood: 'triumphant scientific ingenuity',
      render:
        'Hyper-detailed manga illustration with scientific diagram overlays and heroic polish.',
      key: 'Boichi detail; schematic overlays; inventions; triumphant poses',
      avoid: [
        'a spiky green-tipped scientist with stone crack lines on the face',
        'existing franchise characters',
      ],
      briefs: [
        'Launching a hand-built wooden glider off a castle wall, an inventor in patched overalls grins as chalk schematics of lift and drag appear in the air around the wings. No readable text or logo.',
        'A timber watermill turns in a mountain stream, chalk diagrams of gears and flow sketched over its wheel. No readable text or logo.',
        'In a cluttered village shop, an apothecary grinds herbs with a heavy mortar while glowing molecular chalk diagrams float above the bowl like curious fireflies. No readable text or logo.',
      ],
    }),
    au('SP05-031', 'Mo Dao Zu Shi - Painterly Blade Fantasy', {
      look: 'B.CMAY PICTURES Mo Dao Zu Shi donghua look: painterly xianxia fantasy, flowing silk robes and sleeves, ink-wash mountains, jade and white palettes and graceful sword flight.',
      subject:
        'draw people with elegant cultivator designs, long flowing hair, layered silk robes and graceful floating poses.',
      color: 'Jade green, snow white, ink grey and plum-blossom pink.',
      light: 'Soft misty mountain light and glowing spiritual effects.',
      texture: 'Painterly digital backgrounds like ink-wash scrolls, flowing silk and petals.',
      camera: 'Graceful sweeping shots over misty peaks and flowing sleeve arcs.',
      mood: 'graceful wistful fantasy',
      render: 'Elegant painterly donghua frame with ink-wash scroll backgrounds and flowing silk.',
      key: 'Xianxia silk robes; ink-wash mountains; jade and white; graceful flight',
      briefs: [
        'Whirling through falling plum blossoms on a misty mountain terrace, a dancer’s long silk sleeves slice the petals into a spiral while her sword stays sheathed at her hip. No readable text or logo.',
        'A tiger leaps across a mountain stream, its stripes dissolving into flowing ink-wash brushstrokes as it lands. No readable text or logo.',
        'A weaver works a wooden loom in a quiet pavilion, the silk rolling out painted with drifting clouds. No readable text or logo.',
      ],
    }),
    au('SP05-033', 'Tatsuki Fujimoto - Chaotic Splatter Action', {
      look: 'Tatsuki Fujimoto manga look as in Chainsaw Man and Fire Punch: loose chaotic ink, cinematic paneling, deadpan absurdity, splattered black and sudden brutal action.',
      subject:
        'draw people with Fujimoto designs, scruffy plain faces, loose sketchy lines, casual clothes and absurd deadpan expressions.',
      color: 'Black ink and splatter, grey tone and stark white space.',
      light: 'Flat cinematic light with blown-out whites and heavy black splatter.',
      texture: 'Loose scratchy ink, heavy black splatter, rough tone and blown-out white paper.',
      camera: 'Cinematic film-like panels, deadpan wides and chaotic action.',
      mood: 'deadpan chaotic brutality',
      render: 'Loose cinematic manga illustration with chaotic energy and deadpan timing.',
      key: 'Fujimoto loose ink; cinematic panels; deadpan absurdity; splatter',
      avoid: ['a chainsaw-headed devil hunter', 'existing franchise characters'],
      briefs: [
        'Sprinting through a monastery wine cellar with a sack of squirming rats over his shoulder, a rat-catcher crashes through barrels as dark wine splatters across the frame like ink. No readable text or logo.',
        'A punk drummer mid-fill smashes through her kit, sticks and cymbals flying in loose chaotic ink strokes. No readable text or logo.',
        'A barber trims a customer’s hair with deadpan calm while the shop behind them is slowly collapsing. No readable text or logo.',
      ],
    }),
    au('SP05-122', 'Chainsaw Man MAPPA - Muted Cinematic Grime Frenzy', {
      look: 'MAPPA Chainsaw Man look (2022): muted cinematic color grading, film-like camera work, grimy realistic Tokyo backgrounds and sudden frenzied action.',
      subject:
        'draw people with grounded designs, tired faces, messy hair, suits or casual clothes, in realistic proportions.',
      color: 'Muted desaturated greys, dull greens and cold blues with red accents.',
      light: 'Naturalistic cinematic light, overcast grime and harsh streetlights.',
      texture: 'Realistic painted backgrounds, restrained cel and film grain.',
      camera:
        'Live-action-like lens choices, shallow focus and handheld-feeling frames in real streets.',
      mood: 'grimy frenzied realism',
      render: 'Cinematic MAPPA television frame with muted film grading and grounded realism.',
      key: 'MAPPA cinematic grading; muted palette; grimy Tokyo; film camera',
      avoid: ['a chainsaw-headed devil hunter', 'existing franchise characters'],
      briefs: [
        'Swinging his lantern in a rain-soaked cemetery at night, a gravedigger backs away from a freshly opened grave while the lamplight wobbles across muted grey headstones. No readable text or logo.',
        'A dog-catcher lunges for a runaway hound in a grimy alley, both of them sliding through a puddle. No readable text or logo.',
        'A mechanic eats instant noodles under a flickering garage light, too tired to notice the rain. No readable text or logo.',
      ],
    }),
    au('SP05-025', 'Takeshi Obata - Shadow Notebook Thriller', {
      look: 'Takeshi Obata manga art as in Death Note: elegant realistic line, gothic shadows, refined fashionable characters, and tense intellectual thriller staging.',
      subject:
        'draw people with Obata elegance, slender refined figures, sharp intelligent eyes, detailed hair and fashionable clothes.',
      color: 'Black ink with elegant tone, and in color: deep red, black and gothic purple.',
      light: 'Dramatic chiaroscuro with long gothic shadows falling across calm faces.',
      texture: 'Refined precise pen line, careful hair strands and detailed rendering of clothes.',
      camera: 'Tense intellectual framing, dramatic close-ups and symbolic compositions.',
      mood: 'cold intellectual tension',
      render: 'Elegant precise manga illustration with gothic thriller mood.',
      key: 'Obata elegance; gothic shadows; intellectual tension; refined line',
      avoid: [
        'a black notebook with a title',
        'a winged shinigami with a wide grin',
        'existing franchise characters',
      ],
      briefs: [
        'Seated at the end of a long candlelit table, an inquisitor stares at a single sealed envelope while her shadow on the wall seems to be reading it already. No readable text or logo.',
        'A detective on a spiral staircase looks down at the suspect below, both of them smiling the same small smile. No readable text or logo.',
        'A night-shift pharmacist peels an orange in perfect spiral, her eyes never leaving the security monitor. No readable text or logo.',
      ],
    }),
    au('SP05-148', 'Baccano! Brains Base - Amber Jazz-Age Ensemble Cel', {
      look: 'Brains Base Baccano! look (2007): 1930s Prohibition America, amber sepia-tinted palettes, stylish ensemble cast, trains, speakeasies and jazzy chaotic crosscutting.',
      subject:
        'draw people with Baccano designs, sharp stylish faces, 1930s suits, fedoras, flapper dresses and lively ensemble poses.',
      color: 'Amber sepia, jazz-age gold, deep burgundy and night blue.',
      light: 'Warm speakeasy light, train carriage glow and moonlit rooftops.',
      texture: 'Clean digital cel with sepia grading and film-like softness.',
      camera:
        'Crowded ensemble compositions and crosscut chaotic scenes on trains and in ballrooms.',
      mood: 'rollicking jazz-age chaos',
      render: 'Stylish 2007 Brains Base frame with amber period glow.',
      key: 'Baccano jazz age; amber sepia; 1930s ensemble; trains and speakeasies',
      briefs: [
        'Pickpockets, dancers and a stowaway trumpeter collide in a grand hotel ballroom as the chandelier swings and a bootlegger hides champagne under the cake. No readable text or logo.',
        'A trumpeter plays on a fire escape at dusk, amber light pouring through laundry lines around him. No readable text or logo.',
        'A diner waitress pours coffee for three suspicious men in fedoras, each hiding something under the table. No readable text or logo.',
      ],
    }),
    au('SP05-021', 'Naruto Shippuden Pierrot - Teal-Orange Sakuga Smear', {
      look: 'Studio Pierrot Naruto Shippuden sakuga look: Shingo Yamashita style effects, loose painterly smear frames, teal and orange palettes, and flying ninja across trees and rooftops.',
      subject:
        'draw people with Kishimoto-derived designs, spiky hair, headbands, sandals and ninja gear in loose sakuga motion.',
      color: 'Teal shadows, orange highlights and warm evening skies.',
      light: 'Warm sunset light, glowing chakra effects and teal shadows.',
      texture: 'Loose smear frames, painterly effect animation and speed lines.',
      camera: 'Fast tracking through trees, dynamic leaps and smear-frame action.',
      mood: 'restless determined energy',
      render: 'Energetic Pierrot sakuga frame with loose teal-orange painterly effects.',
      key: 'Pierrot sakuga smears; teal and orange; ninja leaps; loose painterly effects',
      avoid: [
        'an orange jumpsuit ninja with whisker marks',
        'a leaf headband emblem',
        'existing franchise characters',
      ],
      briefs: [
        'Leaping between pine treetops after her falcon, a falconer stretches into a long painterly smear of teal and orange as the bird dives ahead of her. No readable text or logo.',
        'A red fox chases a spiral of leaves across a harvested field, its body smearing into streaks of warm color. No readable text or logo.',
        'A potter trims a bowl on a kick wheel, the spinning clay smearing into teal and orange rings. No readable text or logo.',
      ],
    }),
    au('SP05-022', 'Tite Kubo - Urban Spirit Blade', {
      look: 'Tite Kubo Bleach manga look: elegant elongated fashion figures, vast blank white space, dramatic cold poses, clean confident lines and stylish sword silhouettes.',
      subject:
        'draw people with Kubo elegance, tall slender bodies, sharp faces, fashionable robes and coats and cool detached poses.',
      color: 'Mostly white space and black ink, with minimal tone.',
      light: 'Bright blank white light and sharp black shadows.',
      texture: 'Clean confident line, sparse detail and flat black fills.',
      camera: 'Minimal compositions with figures floating in white space.',
      mood: 'cool elegant detachment',
      render: 'Elegant minimal manga illustration with fashion poise and vast empty whites.',
      key: 'Tite Kubo white space; elongated elegance; cool poses; clean line',
      avoid: ['black shihakusho robes with a giant cleaver sword', 'existing franchise characters'],
      briefs: [
        'Drifting down a blank ivory staircase in an elongated black gown, a ghost-bride holds a long sword as if it were a bouquet, her veil trailing into empty white space. No readable text or logo.',
        'A black cat walks a thin ledge across a blank white page, only its shadow keeping it company. No readable text or logo.',
        'A pianist stretches her long fingers before a concert, standing alone in a vast white space. No readable text or logo.',
      ],
    }),
    au('SP05-023', 'Eiichiro Oda - Elastic Big-Grin Adventure Cel', {
      look: 'Eiichiro Oda One Piece look: rubbery exaggerated anatomy, huge toothy grins, wildly varied character silhouettes, bright ocean adventure and dense joyful detail.',
      subject:
        'draw people with Oda exaggeration, huge grins, long rubbery limbs, wild proportions and bold unique outfits.',
      color: 'Ocean blue, sunny yellow, bright red and tropical green.',
      light: 'Bright tropical sun with bold simple shadows and sparkling ocean reflections.',
      texture: 'Bold confident lines, dense background detail and flat bright color.',
      camera: 'Wide adventure compositions, big-grin close-ups and crowded ensemble panels.',
      mood: 'joyful boundless adventure',
      render:
        'Exuberant adventure manga illustration with rubbery exaggeration and dense joyful detail.',
      key: 'Eiichiro Oda exaggeration; big grins; rubbery limbs; ocean adventure',
      avoid: [
        'a straw hat on a boy with a scar under the eye',
        'a skull flag with a straw hat',
        'existing franchise characters',
      ],
      briefs: [
        'Riding a giant sea turtle across bright blue waves, an island postwoman with an enormous grin stretches her arm impossibly far to deliver a parcel to a passing ship. No readable text or logo.',
        'A strongman hauls a festival float uphill single-handed, grinning so wide his face nearly splits in half. No readable text or logo.',
        'A plump old fisherman with a huge curling mustache naps on his boat while seagulls carry away his lunch. No readable text or logo.',
      ],
    }),
    au('SP05-028', 'Michiko and Hatchin - Lo-Fi Sword Roadtrip', {
      look: 'Manglobe Michiko and Hatchin look (2008) by Sayo Yamamoto: sun-bleached South American roadtrips, lanky designs, lo-fi grainy textures, dusty towns and outlaw freedom.',
      subject:
        'draw people with lanky loose designs, expressive faces, messy curls, tank tops and road-worn clothes.',
      color: 'Sun-bleached ochre, dusty turquoise, faded pink and hot sky blue.',
      light: 'Harsh bright sun, heat haze and warm dusty dusk.',
      texture: 'Lo-fi grain, soft cel and painted dusty towns.',
      camera: 'Roadtrip wides, scooter chases and loose candid framing.',
      mood: 'free wandering grit',
      render: 'Lo-fi grainy roadtrip frame with sunny outlaw energy.',
      key: 'Sayo Yamamoto lo-fi; sun-bleached towns; roadtrip freedom; lanky designs',
      briefs: [
        'Crossing a dry salt flat at noon, a wandering minstrel with a lute on his back hitches a ride on a donkey cart driven by a grinning grandmother. No readable text or logo.',
        'A drifter sits beside a broken-down bus on an empty desert road, a mangy dog sharing her last orange. No readable text or logo.',
        'An orchard picker eats a peach on a wooden porch at sunset, the road stretching away behind her. No readable text or logo.',
      ],
    }),
    au('SP05-029', 'FLCL - Chaotic Indie Adolescence', {
      look: 'Gainax FLCL look (2000) with Yoshiyuki Sadamoto designs: chaotic punk energy, manga-panel cutaways, suburban towns, giant robots bursting out and rock-driven editing.',
      subject:
        'draw people with Sadamoto designs, big expressive eyes, spiky loose hair, casual clothes and exaggerated reactions.',
      color: 'Punk pink, lime green, sky blue and suburban beige.',
      light: 'Bright suburban light with sudden flashes and explosions.',
      texture: 'Loose energetic cel, manga panel inserts and rough smears.',
      camera: 'Frantic cuts, manga panel layouts and wild angles.',
      mood: 'chaotic adolescent rush',
      render: 'Frenetic 2000 Gainax frame with punk rock energy and manga panel cuts.',
      key: 'FLCL chaos; Sadamoto designs; manga panels; suburban robots',
      avoid: [
        'a pink-haired woman on a yellow scooter with a bass guitar',
        'existing franchise characters',
      ],
      briefs: [
        'Jumping a river levee on a battered scooter, a forty-year-old accountant screams with joy as the frame splits into manga panels around her. No readable text or logo.',
        'A small dragon hatches from an egg on a cluttered desk, knocking over pens and snack wrappers in a chaotic burst. No readable text or logo.',
        'A woman brushes her teeth at a cracked mirror as a giant robot quietly walks past her window. No readable text or logo.',
      ],
    }),
    au('SP05-142', 'Rei Hiroe - Humid Tropic Grit Cel', {
      look: 'Rei Hiroe Black Lagoon look: sweaty tropical crime, tank tops and tattoos, gunboats in mangrove swamps, heavy detailed guns and gritty Southeast Asian port towns.',
      subject:
        'draw people with Hiroe designs, tough sweaty faces, tattoos, tank tops and cargo pants, with detailed firearms.',
      color: 'Humid green, sweaty tan, rust brown and turquoise water.',
      light: 'Harsh tropical sun, humid haze and sweat glistening under tin roofs.',
      texture: 'Detailed ink line with gritty tone and sweat.',
      camera: 'Speedboat chase compositions through mangroves and gritty close-ups in port towns.',
      mood: 'humid outlaw grit',
      render: 'Gritty detailed crime manga illustration with sweaty tropical atmosphere.',
      key: 'Rei Hiroe grit; tropical crime; gunboats; tattoos',
      avoid: ['a woman with twin pistols and a tribal arm tattoo', 'existing franchise characters'],
      briefs: [
        'Steering a rust-streaked launch through a mangrove swamp at noon, a smuggler captain in a sweat-soaked tank top eyes a patrol boat through the humid haze. No readable text or logo.',
        'A dock boss on a sun-bleached pier argues with a fisherman over a crate that is definitely not full of fish. No readable text or logo.',
        'Under a rusty tin awning in a port market, a fruit seller slices a mango with a machete, calmly ignoring the loud gunrunner argument next door. No readable text or logo.',
      ],
    }),
    au('SP05-143', 'Darker than Black BONES - Cold Starfield Night Noir', {
      look: 'BONES Darker than Black look (2007): cold noir Tokyo nights under a false starfield, contract killers, blue electric abilities and restrained urban melancholy.',
      subject:
        'draw people with Yuji Iwahara-derived designs, calm faces, long coats and masked figures in the city night.',
      color: 'Cold starfield blue, black, electric cyan and sodium orange.',
      light:
        'Cold false starlight, blue electric flashes and orange streetlight pools on wet roads.',
      texture: 'Clean digital cel over painted night cityscapes with cold reflective surfaces.',
      camera: 'Rooftop noir wides and close-ups under the false stars.',
      mood: 'cold melancholy noir',
      render: 'Moody 2007 BONES frame with cold noir palette.',
      key: 'False starfield; cold noir; electric abilities; Tokyo nights',
      briefs: [
        'Standing on a water tower above a blacked-out city, a watchman looks up as one star in the false sky suddenly falls, and a building across town lights up blue. No readable text or logo.',
        'A courier in a long coat crosses an empty square at night, her shadow flickering with electric sparks. No readable text or logo.',
        'Mopping a glass lobby at three in the morning, a tired night janitor notices reflections of strange unfamiliar stars glimmering in every puddle. No readable text or logo.',
      ],
    }),
    au('SP05-144', 'Samurai Champloo - Record-Scratch Stutter Swagger', {
      look: 'Manglobe Samurai Champloo look (2004) by Shinichiro Watanabe: Edo period mixed with hip-hop swagger, record-scratch stutter editing, graffiti touches and Kazuto Nakazawa designs.',
      subject:
        'draw people with Nakazawa designs, lanky cool figures, messy hair, period clothes mixed with streetwear attitude.',
      color: 'Warm Edo earth tones with hip-hop graffiti accents.',
      light: 'Warm Edo sun on dusty streets and lantern glow in teahouses at night.',
      texture: 'Loose cel with graffiti touches and stuttered freeze-frames.',
      camera: 'Record-scratch freeze frames, stuttered cuts and low breakdance camera angles.',
      mood: 'cool rhythmic swagger',
      render: 'Stylish 2004 Manglobe television frame with hip-hop editing rhythm.',
      key: 'Champloo hip-hop; record-scratch edits; Edo swagger; Nakazawa designs',
      avoid: ['a spiky-haired swordsman in a red kimono', 'existing franchise characters'],
      briefs: [
        'Spinning on one hand in a feudal rice-paddy village, a street dancer freezes mid-move as the whole scene stutters like a scratched record around him. No readable text or logo.',
        'Strutting along a crumbling temple wall at noon, a proud rooster moves in stuttering freeze-frame beats as if the whole scene were being scratched on a turntable. No readable text or logo.',
        'A teahouse owner fans herself on her porch, the heat shimmer pulsing like a slow beat. No readable text or logo.',
      ],
    }),
  ]),
};

export default spec;
