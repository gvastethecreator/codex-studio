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
        'Court intrigue anime frame seen through a half-open sliding screen: a young advisor whispering to a seated regent while a maid pours tea, black lacquer and gold leaf, candlelight glowing through paper panels. No readable text or logo.',
        'Court intrigue anime frame of a masked envoy kneeling before a curtained dais, only the silhouette of the ruler visible behind silk, candle flames reflected in the lacquer floor. No readable text or logo.',
        'Court intrigue anime frame of two consorts playing a board game in a garden pavilion, one smiling behind a fan, a folded letter hidden under the board. No readable text or logo.',
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
        'Western-style period anime frame of a ronin in a torn straw hat walking into a dusty post town at noon, villagers peering from doorways, heat haze over the empty road and a tumbleweed of dry grass rolling past. No readable text or logo.',
        'Extreme close-up anime frame of a drifter squinting under a hat brim, sweat on the brow, the reflection of three waiting figures in her eyes. No readable text or logo.',
        'Wide anime frame of a lone wanderer on a dry hill watching a merchant caravan pass along the road below, dust rising from the wheels, a vulture circling in the white sky. No readable text or logo.',
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
        'Tapestry-style anime frame of a young knight and a lady walking with a white hart through a millefleur meadow, flat stylized trees framing both sides, madder red and woad blue wool colors, visible weave texture. No readable text or logo.',
        'Tapestry-style anime frame of a round feast table set in a forest clearing, stylized trees on both sides, hounds sleeping in a millefleur meadow and musicians playing, faded wool reds and greens with visible weave. No readable text or logo.',
        'Tapestry-style anime frame of a sorceress standing on a lake barge surrounded by white swans, the water drawn as woven ripples, tall stylized birches framing the scene and small flowers scattered across the shore. No readable text or logo.',
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
        'Desert glare anime frame of an exhausted column of armored pilgrims crossing white dunes at noon, blinding sun, heat shimmer bending the horizon, one squire offering a waterskin to an old soldier. No readable text or logo.',
        'Desert glare anime close-up of a sunburnt warrior pouring the last of a waterskin over her head, droplets flashing white in the blinding light, armor too hot to touch and sand in her hair. No readable text or logo.',
        'Desert glare anime frame of a walled desert city shimmering on the horizon like a mirage, a thirsty caravan halted on the dune ridge, camels kneeling and heat haze bending the towers. No readable text or logo.',
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
        'Northern saga anime frame of a longship crashing through grey waves beneath towering fjord cliffs, rowers hauling in the spray, a boy at the prow gripping the carved serpent head, cold sun breaking through cloud. No readable text or logo.',
        'Northern saga anime frame of an old shipwright tarring the hull of an unfinished longship on a black pebble beach in cold drizzle, children carrying planks, smoke from a fire pit and grey fjord water behind. No readable text or logo.',
        'Northern saga anime frame of a winter feast in a smoky longhouse, a long central fire, firelight on fur cloaks and weathered faces, a skald standing on a bench to tell a story. No readable text or logo.',
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
        'Plague-year anime frame of a masked doctor in a wax-cloth coat walking an empty market street at dawn, shuttered stalls, a child watching from a high window, muted ash and mud colors with one candle burning in a doorway. No readable text or logo.',
        'Plague-year anime frame of two nuns leaving baskets of bread at the chained gate of a quarantined village, villagers waiting at a distance on the far side, muted mud colors and a grey sky. No readable text or logo.',
        'Plague-year anime frame of a candle vigil on church steps at night, townsfolk standing far apart with small flames, a bell rope hanging still and fog creeping along the square. No readable text or logo.',
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
        'Tournament pageantry anime frame of an archery contest at a summer fair, striped pavilions and banners snapping in the wind, a cheering crowd in the stands and a young archer drawing her bow under a bright blue sky. No readable text or logo.',
        'Tournament pageantry anime frame of two riders thundering down the lists toward each other, lances lowered, the crowd on its feet and pennants streaming, polished armor flashing in the midday sun. No readable text or logo.',
        'Tournament pageantry anime frame of a jester juggling torches for children between colorful tents, banners and bunting overhead, a squire polishing a helmet in the background. No readable text or logo.',
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
        'Stealth night anime frame of a figure crouched on a tiled castle rooftop under a thin crescent moon, only a silver rim of light on the hood and shoulders, a guard lantern moving in the courtyard far below. No readable text or logo.',
        'Stealth night anime close-up of a pair of eyes watching from a dark storehouse doorway, a thin slice of moonlight across them, a guard lantern reflected as a tiny point in each pupil. No readable text or logo.',
        'Stealth night anime frame of a thief sliding a paper screen open an inch in a sleeping mansion, warm lantern light spilling through the gap onto dark floorboards, a cat watching from the rafters. No readable text or logo.',
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
        'Heian court fantasy anime frame of a young diviner in layered plum robes raising a glowing paper talisman on a garden veranda at night, a pale fox spirit coiling in the mist, star diagram lines faint on the ground. No readable text or logo.',
        'Heian court anime frame of court ladies playing zither and flute behind bamboo blinds at night while small lantern spirits drift above the lotus pond, layered robes spilling out beneath the blinds. No readable text or logo.',
        'Heian court anime frame of an old diviner reading cracked tortoise shells by lamp light as rain falls on the palace garden, a nervous young courtier waiting for the answer on the veranda. No readable text or logo.',
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
        'Craft anime frame of a swordsmith and apprentice hammering a glowing blade on an anvil in a dark forge, sparks streaking outward, the orange light on their sweat-streaked faces and a bucket of water waiting. No readable text or logo.',
        "Craft anime close-up of a glowing blade plunged into a quench trough, a white cloud of steam bursting up around the smith's scarred hands and the water boiling at the surface. No readable text or logo.",
        'Craft anime frame of an armorer riveting plates of a breastplate at a workbench by morning window light, tools laid out in neat rows, a finished gauntlet hanging on the wall and dust floating in the beam. No readable text or logo.',
      ],
    },
  ] satisfies Create[],
};

export default spec;
