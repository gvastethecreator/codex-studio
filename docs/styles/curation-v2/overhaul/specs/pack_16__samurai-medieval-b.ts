import type { Create, Spec } from '../tools/apply';
import { ANIME_AVOID as AVOID } from './_anime';
import { dna } from './_strict';

// Samurai and medieval prestige anime (part B): ten more period looks, Japanese and European,
// each defined by line, color, light and staging rather than by a fixed scene.
const spec: Spec = {
  pack: 'pack_16',
  category: '6. Samurai & Medieval',
  updates: {},
  creates: [
    {
      name: 'Court Intrigue Lacquer Anime',
      domain: 'palace politics anime',
      tags: ['court', 'intrigue', 'anime'],
      dna: dna({
        aesthetic:
          'Palace intrigue anime of whispers and screens: lacquered rooms, folding panels, candlelight and faces half hidden behind fans or sleeves.',
        subject_treatment:
          "Keep the prompt's subject and setting; frame it through screens, doorways or partitions so something is always half hidden.",
        color_and_tone:
          'Black lacquer, deep vermilion and gold leaf with ivory skin tones and pools of dark shadow.',
        lighting_and_shadow:
          'Low candle and lantern light through paper screens, soft glows and deep shadow behind every partition.',
        texture_and_material:
          'Glossy lacquer, silk brocade, gold leaf and paper screens rendered with fine line and soft cel gradients.',
        camera_and_composition:
          'Layered framing through panels and sliding doors, subjects placed off-center and partly occluded.',
        atmosphere_and_mood:
          'Secretive and elegant, every polite gesture hiding a dangerous intention underneath.',
        rendering_and_quality:
          'Luxurious prestige anime with ornate detail, careful gradients and restrained expression.',
        key_features: 'paper screens; lacquer and gold; half-hidden faces; candlelight',
      }),
      avoid: AVOID,
      briefs: [
        "Through a half-open screen a young advisor whispers to a seated regent, while the cup at his elbow reflects the face of the maid who poisoned it. No readable text or logo.",
        "Hiding behind the same folding screen to eavesdrop, three nobles tangle their fans into a comic knot. No readable text or logo.",
        "In a lacquered hall at midnight a regent plays a board game against an empty cushion, and the pieces keep moving on their own. No readable text or logo.",
      ],
    },
    {
      name: 'Wandering Ronin Western Anime',
      domain: 'drifter period anime',
      tags: ['ronin', 'western', 'anime'],
      dna: dna({
        aesthetic:
          'Period anime staged like a dusty western: lone drifters, wide empty roads, squinting close-ups and heat haze.',
        subject_treatment:
          "Keep the prompt's subject and setting; turn it into a drifter's standoff or arrival, alone against open land.",
        color_and_tone: 'Sun-bleached ochre, dusty tan and faded indigo with harsh white sky.',
        lighting_and_shadow:
          'Harsh midday sun with short black shadows and heat shimmer on the horizon.',
        texture_and_material:
          'Dust clouds, worn straw hats, frayed cloth and cracked earth in simplified cel.',
        camera_and_composition:
          'Extreme wide shots of empty roads alternating with extreme close-ups of eyes and hands.',
        atmosphere_and_mood:
          'Lonely and sun-scorched, a quiet stranger arriving in a town that is holding its breath.',
        rendering_and_quality:
          'Stylized prestige anime with bold framing contrasts and clean dusty effects.',
        key_features: 'empty road; heat haze; eye close-ups; drifting dust',
      }),
      avoid: AVOID,
      briefs: [
        "A ronin in a torn straw hat walks into a dusty post town at noon, and every villager slams their shutters at the same instant. No readable text or logo.",
        "Two ronin face off in the main street, both distracted by a bundle of straw that refuses to finish rolling between them. No readable text or logo.",
        "A lone swordsman slurps noodles in a silent roadside inn while twelve bandits wait patiently outside for him to finish. No readable text or logo.",
      ],
    },
    {
      name: 'Arthurian Tapestry Anime',
      domain: 'medieval romance anime',
      tags: ['arthurian', 'tapestry', 'anime'],
      dna: dna({
        aesthetic:
          'Medieval romance anime with backgrounds woven like tapestries: flat millefleur meadows, stylized trees and jewel-toned figures.',
        subject_treatment:
          "Keep the prompt's subject and setting; set it against flattened, woven-looking backgrounds while figures keep anime line and feeling.",
        color_and_tone:
          'Madder red, woad blue, weld yellow and deep green on a dark ground, faded like old wool.',
        lighting_and_shadow: 'Soft even light with little cast shadow, as in a woven wall hanging.',
        texture_and_material:
          'Visible weave texture in backgrounds, embroidered detail on clothing and small scattered flowers.',
        camera_and_composition:
          'Frontal, layered compositions with tall trees framing the sides like a tapestry border.',
        atmosphere_and_mood:
          'Courtly and wistful, a legend being told softly beside a winter fire.',
        rendering_and_quality:
          'Decorative prestige anime blending clean cel figures with woven background textures.',
        key_features: 'millefleur meadow; woven texture; jewel wool colors; framing trees',
      }),
      avoid: AVOID,
      briefs: [
        "A lady walks with a white hart through a millefleur meadow as the hart's antlers slowly grow into a flowering tree. No readable text or logo.",
        "A lady rides a unicorn straight out of a tapestry into the real banquet hall, spilling woven flowers across the table. No readable text or logo.",
        "At the edge of a woven lake a hand rises from the water to offer a kneeling knight a warm loaf of bread instead of a sword. No readable text or logo.",
      ],
    },
    {
      name: 'Crusade Desert Glare Anime',
      domain: 'desert war anime',
      tags: ['desert', 'glare', 'anime'],
      dna: dna({
        aesthetic:
          'Desert war anime bleached by glare: blinding sun, burning sand, heavy armor and thirst.',
        subject_treatment:
          "Keep the prompt's subject and setting; expose it to overwhelming sun, heat and glare that flatten colors.",
        color_and_tone: 'Blinding white and sand gold with dark blue shadows and sunburnt skin.',
        lighting_and_shadow:
          'Overhead desert sun with bleached highlights, short hard shadows and heat shimmer.',
        texture_and_material:
          'Hot metal, wind-blown sand, sweat and faded linen drawn with bold cel.',
        camera_and_composition:
          'Wide desert horizons with small figures, or close faces squinting against light.',
        atmosphere_and_mood:
          'Exhausted and scorched, faith and thirst wearing down people who are far from home.',
        rendering_and_quality:
          'Harsh high-key anime with strong glare effects and clean silhouettes.',
        key_features: 'blinding glare; heat shimmer; sand gold; short shadows',
      }),
      avoid: AVOID,
      briefs: [
        "An exhausted column of armored pilgrims crosses white dunes at noon while the heat shimmer turns the horizon into a false lake full of their reflections. No readable text or logo.",
        "The only shade in the whole desert is the shadow of his own horse, and a knight in full plate shares it with a lizard. No readable text or logo.",
        "At midday a lone rider finds that the oasis is real, but a caravan of merchants has already built a toll gate across it. No readable text or logo.",
      ],
    },
    {
      name: 'Northern Saga Longship Anime',
      domain: 'viking saga anime',
      tags: ['viking', 'saga', 'anime'],
      dna: dna({
        aesthetic:
          'Gritty northern saga anime of cold seas, longships, fur, iron and weather-beaten faces.',
        subject_treatment:
          "Keep the prompt's subject and setting; make it cold, wet and weathered, with sea spray and wind shaping everything.",
        color_and_tone: 'Slate sea grey, cold green, iron and bone white with rust red accents.',
        lighting_and_shadow:
          'Low overcast light, breaks of cold sun on the water and heavy dark cloud shadows.',
        texture_and_material:
          'Tarred wood, wet fur, rope, iron and salt spray drawn with gritty line.',
        camera_and_composition:
          'Low angles on heaving decks and wide shots of ships dwarfed by waves and fjords.',
        atmosphere_and_mood:
          'Harsh and restless, a hard life lived between storms and long journeys.',
        rendering_and_quality:
          'Gritty seinen anime with heavy line weight and textured painted skies.',
        key_features: 'longships; cold spray; fur and iron; fjord scale',
      }),
      avoid: AVOID,
      briefs: [
        "A longship crashes through grey waves beneath towering fjord cliffs as a sea serpent's spine breaks the water beside the oars. No readable text or logo.",
        "Hulking raiders row their longship through a gale while one of them calmly knits a sweater at the stern. No readable text or logo.",
        "An old shieldmaiden stands alone on a black beach at dusk, watching a burning funeral ship drift out to sea. No readable text or logo.",
      ],
    },
    {
      name: 'Plague Year Chronicle Anime',
      domain: 'dark medieval chronicle anime',
      tags: ['plague', 'chronicle', 'anime'],
      dna: dna({
        aesthetic:
          'Somber medieval chronicle anime of a plague year: muted streets, masked doctors, empty markets and candle vigils.',
        subject_treatment:
          "Keep the prompt's subject and setting; place it in a time of sickness and fear, with distance between people.",
        color_and_tone:
          'Muted ash, mud brown and bone with sickly green and small candle-gold accents.',
        lighting_and_shadow:
          'Dim overcast light and candlelight, heavy shadows in narrow streets and doorways.',
        texture_and_material:
          'Rough wool, wax cloth, rotting timber and muddy cobbles drawn with thin nervous line.',
        camera_and_composition:
          'Narrow alleys and doorways, figures isolated, empty space between them.',
        atmosphere_and_mood:
          'Grim and hushed, fear and kindness sharing the same narrow, silent streets.',
        rendering_and_quality:
          'Restrained prestige anime with muted painting and fine, careful detail.',
        key_features: 'masked doctors; empty streets; candle vigils; muted palette',
      }),
      avoid: [...AVOID, 'gore'],
      briefs: [
        "A masked doctor in a wax-cloth coat walks an empty market at dawn, a single candle burning on the sill of every shuttered stall. No readable text or logo.",
        "During a rainy candlelight vigil, an off-duty plague doctor quietly shares his bread with a stray goose. No readable text or logo.",
        "A lone bell ringer tolls in a silent plague town while crows gather on the rooftops in perfect rows to listen. No readable text or logo.",
      ],
    },
    {
      name: 'Tournament Pageantry Anime',
      domain: 'medieval tournament anime',
      tags: ['tournament', 'pageantry', 'anime'],
      dna: dna({
        aesthetic:
          'Bright medieval tournament anime full of pageantry: striped pavilions, banners, crowds and polished color under open sky.',
        subject_treatment:
          "Keep the prompt's subject and setting; surround it with festival color, banners and an excited watching crowd.",
        color_and_tone:
          'Saturated heraldic stripes of red, gold, blue and green against clear summer sky blue.',
        lighting_and_shadow:
          'Bright midday sun with crisp short shadows and glints on polished metal.',
        texture_and_material:
          'Silk banners, striped canvas, polished armor and trampled grass in clean cel.',
        camera_and_composition:
          'Wide festive frames with pavilions and stands, or dynamic close shots at the lists.',
        atmosphere_and_mood:
          'Festive and competitive, a whole town cheering for its champions on a sunny day.',
        rendering_and_quality:
          'Colorful prestige anime with crisp detail and lively crowd animation.',
        key_features: 'striped pavilions; banners; cheering crowd; bright sun',
      }),
      avoid: AVOID,
      briefs: [
        "At a summer tournament a champion archer splits her rival's arrow while the striped pavilions ripple like sails behind her. No readable text or logo.",
        "A joust is halted by a flock of runaway geese crossing the lists, both armored riders reining in with lances raised. No readable text or logo.",
        "At dusk after the tournament a tired squire folds banners alone in the empty field as fireworks burst over the pavilions. No readable text or logo.",
      ],
    },
    {
      name: 'Shadow Stealth Night Anime',
      domain: 'ninja stealth anime',
      tags: ['stealth', 'night', 'anime'],
      dna: dna({
        aesthetic:
          'Stealth anime of night infiltration: deep blue darkness, silhouettes on rooftops and thin blades of moonlight.',
        subject_treatment:
          "Keep the prompt's subject and setting; hide it in darkness so only edges, eyes and small highlights remain visible.",
        color_and_tone:
          'Deep indigo and black with pale moon silver and a tiny warm lantern accent.',
        lighting_and_shadow:
          'Moonlight rim on silhouettes, pools of shadow and occasional lantern glow in windows.',
        texture_and_material:
          'Tiled rooftops, dark cloth and wet stone reduced to silhouette and rim line.',
        camera_and_composition:
          'High rooftop angles and tight framing on eyes, with most of the frame dark.',
        atmosphere_and_mood: 'Silent and watchful, a held breath while guards pass by just below.',
        rendering_and_quality:
          'Low-key prestige anime with clean silhouettes and precise rim lighting.',
        key_features: 'blue darkness; moonlit rims; rooftop silhouettes; lantern windows',
      }),
      avoid: AVOID,
      briefs: [
        "A figure crouches on a tiled rooftop under a thin crescent moon, only a silver rim of light betraying her, while the guard directly below yawns into the dark. No readable text or logo.",
        "A spy blends so perfectly into the shadows that a passing patrol hangs their lantern on her outstretched arm. No readable text or logo.",
        "An assassin slips through a silent moonlit garden where every stepping stone turns out to be a sleeping frog. No readable text or logo.",
      ],
    },
    {
      name: 'Onmyoji Talisman Court Anime',
      domain: 'Heian spirit exorcism anime',
      tags: ['onmyoji', 'talisman', 'anime'],
      dna: dna({
        aesthetic:
          'Refined Heian-court fantasy anime where diviners seal spirits with glowing paper talismans and star diagrams in silk-robed elegance.',
        subject_treatment:
          "Keep the prompt's subject and setting; add the presence of spirits and glowing sealing marks only where the prompt allows supernatural elements.",
        color_and_tone:
          'Layered Heian robe colors of plum, pale green and white with soft spirit-light blue.',
        lighting_and_shadow:
          'Soft night garden light and glowing talisman light casting cool highlights on silk.',
        texture_and_material:
          'Layered silk robes, paper talismans, lacquered caps and misty gardens in fine line.',
        camera_and_composition:
          'Elegant horizontal compositions across verandas and gardens with drifting spirit shapes.',
        atmosphere_and_mood:
          'Mysterious and graceful, polite court life brushing against a hidden spirit world.',
        rendering_and_quality:
          'Elegant prestige anime with fine line, soft glows and gentle painted gardens.',
        key_features: 'layered silk robes; glowing talismans; night garden; spirit mist',
      }),
      avoid: AVOID,
      briefs: [
        "A diviner in layered plum robes raises a glowing talisman on a garden veranda as a hundred paper birds burst up out of the pond. No readable text or logo.",
        "A court diviner seals a mischievous fox spirit inside a teapot, and the teapot keeps trying to waddle away. No readable text or logo.",
        "Beneath a star diagram traced in silver across the night sky, a diviner and a demon share sake on a moonlit veranda. No readable text or logo.",
      ],
    },
    {
      name: 'Swordsmith Forge Craft Anime',
      domain: 'craft process anime',
      tags: ['forge', 'craft', 'anime'],
      dna: dna({
        aesthetic:
          'Craft-process anime of forges and workshops: glowing metal, precise hand work, sparks and the patience of making.',
        subject_treatment:
          "Keep the prompt's subject and setting; show it being made, repaired or tended, with hands and tools central.",
        color_and_tone:
          'Forge orange and yellow-white heat against charcoal black and dim workshop brown.',
        lighting_and_shadow:
          'Hot forge glow from below, sparks as bright streaks and deep workshop shadow.',
        texture_and_material:
          'Glowing steel, scale, charcoal, water steam and worn leather aprons in detailed cel.',
        camera_and_composition:
          'Close shots on hands, tools and glowing metal with occasional wide workshop frames.',
        atmosphere_and_mood:
          'Focused and reverent, the quiet pride of skilled hands doing difficult work.',
        rendering_and_quality:
          'Detailed prestige anime with careful process animation and glowing effects.',
        key_features: 'forge glow; sparks; hands and tools; quench steam',
      }),
      avoid: AVOID,
      briefs: [
        "Sparks from the anvil hang in the air in the shape of a galloping horse as a smith and her apprentice hammer a glowing blade. No readable text or logo.",
        "Quenched in the sea at dawn, a new blade sends up a column of steam so tall it becomes a cloud over the fishing village. No readable text or logo.",
        "Using his finest blade to slice tofu for dinner, an elderly smith ignores the horrified stare of his apprentice. No readable text or logo.",
      ],
    },
  ] satisfies Create[],
};

export default spec;
