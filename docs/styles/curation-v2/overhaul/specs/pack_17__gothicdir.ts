import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Gothic and dungeon art directions: complete painted art directions for dark games and worlds.
// The six originals keep their reference titles (guarded) and get fully original card briefs;
// fourteen new directions are descriptor-named: frostbitten crypts, drowned cathedrals, cracked-doll
// manors, rust-and-bone wastes, stained-glass boss halls, fungal underdark, infirmary sepia,
// clockwork tombs, ashen witch forests, marble necropolises, velvet opera vampires, salt-mine
// abysses, lantern-lit fog villages and obsidian sun temples.
const study = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  avoid: string[],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'gothic-art-direction', 'portable-style-study'],
  dna: dna(fields),
  avoid: [...avoid, 'gore', 'interface or HUD', 'existing game characters, logos or locations', ...STYLE_AVOID],
  briefs,
});

const keep = 'Preserve the requested identity, count, pose and action with original characters';

const spec: Spec = {
  pack: 'pack_17',
  category: '9. Gothic & Dungeon Art Directions',
  updates: {
    'SP17-084': { briefs: [
      'Twisting across a cavern of near-black stone, an original sorceress hurls an orb of blue ice through a crescent of horned demons, its shards carving crisp light planes from the dark. No readable text or logo.',
      'Standing in a torchlit crypt with carved compact armor, a grim warrior discovers the fearsome guardian of the tomb is a very small, very old skeleton dog. No readable text or logo.',
      'Deep in a mineral cave, a single amber lava fissure lights an altar where an unlit lantern waits. No readable text or logo.',
    ] },
    'SP17-085': { briefs: [
      'Kneeling in a rain-soaked chapel ruin under an old-master sky, an original wanderer in heavy furs faces a horned mother of demons rising from a pool of black water. No readable text or logo.',
      'In a grounded painted tavern, a weary monster hunter tries to enjoy a quiet drink while every patron keeps staring at the enormous curled trophy horn she has leaned against the bar. No readable text or logo.',
      'Along a muddy road under grey clouds, a line of leaning wooden posts has been hung with lanterns, and one lantern at the end is still lit. No readable text or logo.',
    ] },
    'SP17-086': { briefs: [
      'Stalking through a vertical city of spires under a pale moon, an original hunter in a long tailored coat faces a gaunt beast climbing down a clock tower toward her. No readable text or logo.',
      'On a gaslit street of severe architecture, a tall hunter in a tricorn hat is politely asked by an old lady to help her cat down from a very tall gargoyle. No readable text or logo.',
      'Down a narrow gaslit alley of dark stone, every window is shuttered except one high above, where a pale hand holds a small lamp. No readable text or logo.',
    ] },
    'SP17-087': { briefs: [
      'Dragging a massive iron shell of armor across a damp mineral cave, an original gaunt warrior faces a hulking figure made of rust and bone rising from a stagnant pool. No readable text or logo.',
      'Burdened by armor so heavy it has sunk into the mud, a tarnished warrior waits patiently for a tiny crab to finish crossing his boot. No readable text or logo.',
      'In a flooded crypt of dark stone, an empty suit of iron armor sits on a stone bench, its helmet turned toward the water. No readable text or logo.',
    ] },
    'SP17-088': { briefs: [
      'Rising over a ruined town, an original saintly colossus of accumulated votive armor, halos and thorns reaches down toward a lone lantern-bearer on the bridge. No readable text or logo.',
      'Covered in devotional ornaments added by generations of pilgrims, a stone knight has so many offerings on his helmet that a bird has nested among them. No readable text or logo.',
      'In a dim cathedral, a column of stacked votive candles has formed a silhouette that looks like a kneeling figure. No readable text or logo.',
    ] },
    'SP17-089': { briefs: [
      'Clutching a failing oil lamp in a vast cellar of heavy masonry, an original scholar backs away as the darkness beyond the light seems to lean toward her. No readable text or logo.',
      'In a candlelit manor hallway, a nervous explorer finally works up the courage to open a creaking door, and finds a very surprised mouse. No readable text or logo.',
      'Deep in a cold stone corridor, a single candle burns on the floor, and the dark beyond it is too perfectly black to be natural. No readable text or logo.',
    ] },
  },
  creates: [
    study('Frostbitten Crypt Direction', 'frozen tomb game art direction', 'frost-crypt', {
      aesthetic: 'Frostbitten crypt direction: painted game art direction of frozen tombs, ice-rimed stone, blue-white breath, pale ghost light and heavy fur-clad figures.',
      subject_treatment: `${keep}; place the subject in frozen tombs with ice-rimed surfaces and visible breath.`,
      color_and_tone: 'Ice blue, bone white and deep slate with pale ghost light.',
      lighting_and_shadow: "Cold diffuse glow and blue shadows, kept consistent across the whole image.",
      texture_and_material: "Frost crystals, frozen stone, fur and iron, kept consistent across the whole image.",
      camera_and_composition: "Low third-person view through icy halls, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with frozen ancient silence.',
      rendering_and_quality: "Painterly cold detail with clear silhouettes, kept consistent across the whole image.",
      key_features: 'frozen crypt; ice rime; ghost light; fur-clad figures',
    }, [], [
      'Breaking through a frozen tomb door, a fur-clad warrior finds a jarl of pale ice sitting on a throne of frozen shields, frost spreading from his fingertips across the floor. No readable text or logo.',
      'In an ice-rimed crypt, a brave explorer tries to look heroic while his beard has frozen solid to his breastplate. No readable text or logo.',
      'In a frozen hall, a line of ice-covered coffins stands in a row, and one of them has frost melting in the shape of a handprint. No readable text or logo.',
    ]),
    study('Drowned Cathedral Direction', 'flooded cathedral art direction', 'drowned-cathedral', {
      aesthetic: 'Drowned cathedral direction: painted art direction of cathedrals half sunk in green water, light rays through broken glass, drifting candles and barnacled saints.',
      subject_treatment: `${keep}; set the subject inside a half-flooded cathedral with light rays through the water.`,
      color_and_tone: 'Deep green water, stained-glass color shafts and pale stone.',
      lighting_and_shadow: "Underwater light rays and caustic patterns, kept consistent across the whole image.",
      texture_and_material: "Barnacles, algae, wet stone and floating wax, kept consistent across the whole image.",
      camera_and_composition: "Split view above and below the waterline, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with drowned sacred melancholy.',
      rendering_and_quality: "Painterly light and water detail, kept consistent across the whole image.",
      key_features: 'flooded cathedral; light rays; barnacled saints; waterline',
    }, [], [
      'Swimming down the flooded nave of a sunken cathedral, a diver in brass armor passes barnacled saints as a whale-sized shadow glides between the columns. No readable text or logo.',
      'In a half-flooded cathedral, a priest insists on delivering his sermon while standing on the only dry pew, to an audience of fish. No readable text or logo.',
      "Floating along the aisle beneath green water in a sunken cathedral, a line of candles is somehow still lit, their flames steady in the current. No readable text or logo.",
    ]),
    study('Cracked-Doll Manor Direction', 'haunted doll house art direction', 'doll-manor', {
      aesthetic: 'Cracked-doll manor direction: painted art direction of a decaying manor full of porcelain dolls with cracked faces, faded wallpaper and dusty nursery light.',
      subject_treatment: `${keep}; set the subject in a decaying manor surrounded by cracked porcelain dolls.`,
      color_and_tone: 'Faded rose, dusty cream and porcelain white with deep shadow.',
      lighting_and_shadow: "Dusty window light and deep corners, kept consistent across the whole image.",
      texture_and_material: "Cracked porcelain, peeling wallpaper, lace and dust, kept consistent across the whole image.",
      camera_and_composition: "Slightly low view down a manor room, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with eerie faded nostalgia.',
      rendering_and_quality: "Painterly detail with clean focal point, kept consistent across the whole image.",
      key_features: 'cracked dolls; faded wallpaper; dusty light; manor',
    }, [], [
      'Rising from a heap of cracked porcelain dolls, a giant doll-queen with a shattered cheek turns her glass eyes toward an intruder holding a candle in the nursery doorway. No readable text or logo.',
      "In a dusty manor, a housekeeper carefully dusts a shelf of cracked dolls, and one doll is trying not to sneeze. No readable text or logo.",
      "Sitting in a faded nursery, a cracked porcelain doll holds a teacup that is still steaming, although the room has been sealed for fifty years. No readable text or logo.",
    ]),
    study('Rust-and-Bone Waste Direction', 'wasteland of rust and bones', 'rust-bone', {
      aesthetic: 'Rust-and-bone waste direction: painted art direction of red deserts strewn with giant bones and rusted war machines, dust storms and scavenger silhouettes.',
      subject_treatment: `${keep}; place the subject in a red waste of giant bones and rusted machines.`,
      color_and_tone: "Rust red, bone white and dusty ochre, kept consistent across the whole image.",
      lighting_and_shadow: "Harsh sun through dust storms, kept consistent across the whole image.",
      texture_and_material: "Rust flakes, bleached bone and wind-blown sand, kept consistent across the whole image.",
      camera_and_composition: "Wide desert vista with huge remains, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with desolate scavenger grit.',
      rendering_and_quality: "Painterly scale and dust, kept consistent across the whole image.",
      key_features: 'giant bones; rusted machines; red desert; dust storm',
    }, [], [
      'Crossing a red waste beneath the ribcage of a fallen titan, a caravan of scavengers drags a rusted war engine toward a dust storm shaped like a charging army. No readable text or logo.',
      'In a desert of rust and bones, a scavenger has built a comfortable home inside a giant skull and has hung curtains in the eye sockets. No readable text or logo.',
      'In a red waste at dusk, a rusted machine the size of a tower stands still, and a fresh set of footprints leads away from its open hatch. No readable text or logo.',
    ]),
    study('Stained-Glass Boss Hall Direction', 'boss chamber lit by stained glass', 'glass-boss-hall', {
      aesthetic: 'Stained-glass boss hall direction: vast boss chambers lit by colossal stained-glass windows, colored light pooling on the floor around a towering foe.',
      subject_treatment: `${keep}; stage the subject in a vast hall of stained-glass light and colored pools.`,
      color_and_tone: 'Ruby, cobalt and amber light pools on dark stone.',
      lighting_and_shadow: "Colored shafts through huge windows, kept consistent across the whole image.",
      texture_and_material: "Polished stone, glass, dust in the air, kept consistent across the whole image.",
      camera_and_composition: 'Low wide view with the foe under the window.',
      atmosphere_and_mood: 'Keep the requested mood with sacred grand confrontation.',
      rendering_and_quality: "Painterly light with clear scale, kept consistent across the whole image.",
      key_features: 'stained-glass light; colored pools; vast hall; towering foe',
    }, [], [
      'Standing in a pool of ruby light beneath a colossal stained-glass window, a winged fallen saint unfolds her six arms as a lone knight steps into the cobalt beam. No readable text or logo.',
      'In a vast glass-lit chamber, a towering boss waits dramatically in the colored light and is slowly getting a sunburn in the red panes. No readable text or logo.',
      "Pouring down through stained glass, a shaft of colored light falls on the floor, and dust drifts upward inside it instead of down. No readable text or logo.",
    ]),
    study('Fungal Underdark Direction', 'glowing mushroom cave art direction', 'fungal-underdark', {
      aesthetic: 'Fungal underdark direction: painted art direction of vast underground caverns lit by giant bioluminescent mushrooms, spore clouds and pale cave-dwellers.',
      subject_treatment: `${keep}; place the subject in a vast cavern lit by glowing giant fungi.`,
      color_and_tone: 'Deep violet dark with cyan and magenta fungal glow.',
      lighting_and_shadow: "Bioluminescent glow and drifting spores, kept consistent across the whole image.",
      texture_and_material: "Mushroom gills, damp rock and spore haze, kept consistent across the whole image.",
      camera_and_composition: "Wide cavern with towering fungi, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with alien subterranean wonder.',
      rendering_and_quality: "Painterly glow with clear forms, kept consistent across the whole image.",
      key_features: 'giant glowing fungi; spore haze; underground cavern; pale dwellers',
    }, [], [
      'Deep in a cavern of towering glowing mushrooms, a party of pale cave-dwellers rides giant beetles across a bridge of fungus as spores drift like snow. No readable text or logo.',
      'In a glowing mushroom cavern, an explorer sneezes once and releases a cloud of spores that makes every mushroom bow. No readable text or logo.',
      'In a dark cave lit by blue fungi, a single mushroom has stopped glowing, and the dark around it is spreading. No readable text or logo.',
    ]),
    study('Infirmary Sepia Direction', 'old hospital ward art direction', 'infirmary-sepia', {
      aesthetic: 'Infirmary sepia direction: painted art direction of candlelit medieval hospital wards, rows of cots, linen screens, medicine tables and sepia-toned calm dread.',
      subject_treatment: `${keep}; set the subject in a candlelit sepia hospital ward with linen screens.`,
      color_and_tone: "Sepia, yellowed linen and candle amber, kept consistent across the whole image.",
      lighting_and_shadow: "Soft candlelight and screen silhouettes, kept consistent across the whole image.",
      texture_and_material: "Linen, glass bottles, worn wood and plaster, kept consistent across the whole image.",
      camera_and_composition: "Long ward perspective with rows of cots, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with quiet clinical dread.',
      rendering_and_quality: "Painterly muted detail, no gore, kept consistent across the whole image.",
      key_features: 'sepia ward; rows of cots; linen screens; candlelight',
    }, ['gore'], [
      'Walking between rows of cots in a candlelit ward, a nun-physician carries a lantern past linen screens where the silhouettes of patients are all turned toward her. No readable text or logo.',
      'In a sepia hospital ward, a patient with a very minor splinter is receiving the full attention of five serious doctors. No readable text or logo.',
      "Pinned to the linen screen of a candlelit ward, a doctor's chart has been drawn over with small, careful handprints in chalk dust. No readable text or logo.",
    ]),
    study('Clockwork Tomb Direction', 'mechanical tomb art direction', 'clockwork-tomb', {
      aesthetic: 'Clockwork tomb direction: painted art direction of tombs built as vast machines, brass gears turning behind stone walls, pendulum blades and ticking sarcophagi.',
      subject_treatment: `${keep}; place the subject in a tomb that is also a vast ticking machine.`,
      color_and_tone: "Brass, dark stone and verdigris green, kept consistent across the whole image.",
      lighting_and_shadow: "Warm lantern light glinting on gears, kept consistent across the whole image.",
      texture_and_material: "Gears, chains, brass fittings and carved stone, kept consistent across the whole image.",
      camera_and_composition: "Interior view with moving machinery visible, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with ticking mechanical menace.',
      rendering_and_quality: "Precise mechanical detail, kept consistent across the whole image.",
      key_features: 'tomb machine; brass gears; pendulums; ticking sarcophagus',
    }, [], [
      'Deep in a tomb that is also a vast machine, a thief times her step between swinging pendulum blades as a brass sarcophagus in the center begins to unfold. No readable text or logo.',
      'In a ticking tomb of gears, an ancient mechanical pharaoh wakes up and immediately checks whether it is on time. No readable text or logo.',
      "Ticking in the dark of a clockwork tomb, a brass sarcophagus has begun to count down, each gear turning a little faster than the last. No readable text or logo.",
    ]),
    study('Ashen Forest Witch Direction', 'burnt forest witch art direction', 'ashen-witch', {
      aesthetic: 'Ashen forest witch direction: painted art direction of forests burned to grey ash and charcoal trunks, where witches in bone charms walk under an orange ember sky.',
      subject_treatment: `${keep}; set the subject in a burnt grey forest under an ember-lit sky.`,
      color_and_tone: "Ash grey, charcoal black and ember orange, kept consistent across the whole image.",
      lighting_and_shadow: "Ember glow from below and hazy sky, kept consistent across the whole image.",
      texture_and_material: "Ash, charred bark, bone charms and cloth, kept consistent across the whole image.",
      camera_and_composition: "Figure among tall charred trunks, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with smoldering folk menace.',
      rendering_and_quality: "Painterly haze with clean silhouettes, kept consistent across the whole image.",
      key_features: 'ashen forest; charred trunks; ember sky; bone charms',
    }, [], [
      'Walking through a forest burned to charcoal, a witch in bone charms leads a procession of ash-grey deer under an ember sky, each hoof leaving a glowing print. No readable text or logo.',
      'In a burnt grey forest, a witch tries to find a single green leaf for her potion and holds it up in triumph. No readable text or logo.',
      'Among charred tree trunks, one tree is still perfectly green and alive, and nothing grows within a circle around it. No readable text or logo.',
    ]),
    study('Marble Angel Necropolis', 'white marble city of tombs', 'marble-necropolis', {
      aesthetic: 'Marble angel necropolis: painted art direction of vast white marble cities of the dead, weeping angel statues, cypress trees and pale sunlight.',
      subject_treatment: `${keep}; place the subject among white marble tombs and angel statues.`,
      color_and_tone: 'White marble, cypress green and pale gold sun.',
      lighting_and_shadow: "Soft sunlight with cool marble shadows, kept consistent across the whole image.",
      texture_and_material: "Weathered marble, moss and carved drapery, kept consistent across the whole image.",
      camera_and_composition: "Long avenues of tombs and statues, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with serene eerie grief.',
      rendering_and_quality: "Painterly light with crisp marble, kept consistent across the whole image.",
      key_features: 'marble tombs; weeping angels; cypress; pale sunlight',
    }, [], [
      'Rising above a white marble city of tombs, a colossal weeping angel lifts her head from her hands as a mourner at her feet drops his flowers. No readable text or logo.',
      "Worried about the cold, a kindly caretaker has placed a small knitted hat on the head of a solemn weeping angel in a city of white tombs. No readable text or logo.",
      "Standing along an avenue of marble angels, a single statue has moss growing only on its back, as if it has spent centuries facing the wrong way. No readable text or logo.",
    ]),
    study('Velvet Opera Vampire Direction', 'vampire opera house art direction', 'opera-vampire', {
      aesthetic: 'Velvet opera vampire direction: painted art direction of crimson velvet opera houses, gilded boxes, chandeliers and aristocratic vampire audiences in shadow.',
      subject_treatment: `${keep}; set the subject in a crimson velvet opera house with gilded boxes.`,
      color_and_tone: "Crimson velvet, gold leaf and shadowed black, kept consistent across the whole image.",
      lighting_and_shadow: "Stage light and chandelier glow in darkness, kept consistent across the whole image.",
      texture_and_material: "Velvet, gilded plaster, crystal and silk, kept consistent across the whole image.",
      camera_and_composition: 'View from the stage or a box toward the audience.',
      atmosphere_and_mood: 'Keep the requested mood with decadent nocturnal glamour.',
      rendering_and_quality: "Rich painterly finish, no gore, kept consistent across the whole image.",
      key_features: 'velvet opera house; gilded boxes; chandelier; vampire audience',
    }, ['gore'], [
      'Singing on a crimson stage under a vast chandelier, a pale diva faces an audience of vampires whose eyes glow in the dark gilded boxes. No readable text or logo.',
      "Visibly bored by the performance, a vampire count has fallen asleep hanging upside down from the rail of his gilded crimson box. No readable text or logo.",
      'In an empty velvet opera house, one gilded box has its curtain drawn, and a single gloved hand rests on the rail. No readable text or logo.',
    ]),
    study('Salt-Mine Abyss Direction', 'deep salt mine art direction', 'salt-abyss', {
      aesthetic: 'Salt-mine abyss direction: painted art direction of vast white salt mines descending into the dark, carved salt chapels, crystal walls and miners with lamps.',
      subject_treatment: `${keep}; set the subject in a vast descending salt mine of carved crystal walls.`,
      color_and_tone: 'Pale salt white, crystal pink and deep black depths.',
      lighting_and_shadow: "Lamp glow through translucent salt, kept consistent across the whole image.",
      texture_and_material: "Carved salt crystal, rope, wood scaffolds, kept consistent across the whole image.",
      camera_and_composition: "Deep vertical descent with small figures, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with vertiginous sacred depth.',
      rendering_and_quality: "Painterly translucency and scale, kept consistent across the whole image.",
      key_features: 'salt mine; carved crystal chapel; lamps; abyss',
    }, [], [
      'Descending on ropes into a vast salt mine, miners pass a chapel carved entirely of pink crystal where a salt saint holds a lamp over the abyss. No readable text or logo.',
      'In a glittering salt mine, a thirsty miner stares hopelessly at the endless walls of salt while holding an empty water flask. No readable text or logo.',
      'Deep in a salt mine, a lamp shines through the crystal wall and reveals the shape of a person standing inside it. No readable text or logo.',
    ]),
    study('Lantern-Lit Fog Village Direction', 'foggy village night art direction', 'fog-village', {
      aesthetic: 'Lantern-lit fog village direction: painted art direction of isolated villages drowned in fog, crooked houses, hanging lanterns and shapes moving between the lights.',
      subject_treatment: `${keep}; set the subject in a foggy village of crooked houses and hanging lanterns.`,
      color_and_tone: "Grey fog, lantern gold and dark timber, kept consistent across the whole image.",
      lighting_and_shadow: "Lantern halos in thick fog, kept consistent across the whole image.",
      texture_and_material: "Wet timber, fog, cobbles and iron lamps, kept consistent across the whole image.",
      camera_and_composition: "Street view fading into fog, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with isolated uneasy hush.',
      rendering_and_quality: "Painterly atmosphere with clear lights, kept consistent across the whole image.",
      key_features: 'thick fog; hanging lanterns; crooked houses; shapes between lights',
    }, [], [
      'Walking through a fog-drowned village street, a traveler passes crooked houses while a figure on stilts twice her height strides silently between the lanterns ahead. No readable text or logo.',
      'In a foggy village, the night watchman lights every lantern with great care, then realizes he cannot find his way home in the fog. No readable text or logo.',
      'In a thick fog, a row of lanterns lights the street, and each one goes out as something passes beneath it. No readable text or logo.',
    ]),
    study('Obsidian Sun Temple Direction', 'black stone sun temple art direction', 'obsidian-temple', {
      aesthetic: 'Obsidian sun temple direction: painted art direction of black obsidian step temples under a blazing eclipsed sun, gold inlay and ritual processions.',
      subject_treatment: `${keep}; set the subject on a black obsidian step temple under an eclipsed sun.`,
      color_and_tone: 'Glossy black, gold inlay and eclipse corona white.',
      lighting_and_shadow: "Corona glow and sharp gold reflections, kept consistent across the whole image.",
      texture_and_material: "Polished obsidian, gold leaf and dust, kept consistent across the whole image.",
      camera_and_composition: "Low view up the temple steps, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with solemn cosmic ritual.',
      rendering_and_quality: "Painterly gloss and grand scale, kept consistent across the whole image.",
      key_features: 'obsidian step temple; eclipse sun; gold inlay; procession',
    }, [], [
      'Climbing the steps of a black glass temple under an eclipsed sun, a procession of masked priests carries a golden serpent toward the altar at the summit. No readable text or logo.',
      'At the top of a gleaming black temple, a priest prepares a grand ritual and realizes he has forgotten the ceremonial torch. No readable text or logo.',
      'Under a dark eclipse, a black temple\'s polished steps reflect a figure standing at the top who is not actually there. No readable text or logo.',
    ]),
  ],
};

export default spec;
