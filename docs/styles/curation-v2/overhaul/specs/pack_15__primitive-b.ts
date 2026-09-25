import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Primitive, stone and salvage punks (part B): wicker, chariot, felt tent, canoe, bark, shell, amber, mammoth, feather.
// Cultures are invented, not copies of a specific living people's sacred dress or ritual.
const AVOID = [
  ...STYLE_AVOID,
  'gore',
  'sacred regalia of a specific living culture',
  'real brand or company logo',
];

const punk = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'punk', 'primitive'],
  dna: dna(fields),
  avoid: AVOID,
  briefs,
});

const spec: Spec = {
  pack: 'pack_15',
  category: '10. Primitive, Stone & Salvage Punks',
  updates: {},
  creates: [
    punk(
      'Wickerpunk',
      'woven basketry engineering punk',
      'wickerpunk',
      {
        aesthetic:
          'Wickerpunk: engineers who weave everything from willow and rattan, with basket balloons, woven bridges, wicker carriages and huge lattice structures.',
        subject_treatment:
          "Keep the prompt's subject and setting; weave its vehicles, furniture and buildings from willow and rattan basketry.",
        color_and_tone:
          'Honey willow, pale rattan and warm straw tones with sky blue and meadow green.',
        lighting_and_shadow:
          'Sunlight filtering through woven lattice and casting patterned shadows.',
        texture_and_material: 'Woven willow, rattan, split cane, twine lashings and straw.',
        camera_and_composition: 'Woven structures with patterned light and small figures inside.',
        atmosphere_and_mood: 'Light, clever and cheerful, strength made from bending branches.',
        rendering_and_quality:
          'Detailed illustration with intricate weave patterns and dappled shadow.',
        key_features: 'basket balloons; woven bridges; wicker carriages; lattice shadows',
      },
      [
        'A fleet of giant woven basket balloons rises over a green valley at sunrise, each one carrying a whole family and their goats, the willow lattice glowing gold as the sun pours through it. No readable text or logo.',
        'A basket weaver builds a wicker car and it works perfectly, until a very determined goat starts eating the front bumper. No readable text or logo.',
        'An old weaver sits in a wicker chair in a sunny doorway, a half-finished basket on her knees and a cat asleep inside it. No readable text or logo.',
      ],
    ),
    punk(
      'Chariotpunk',
      'chariot racing culture punk',
      'chariotpunk',
      {
        aesthetic:
          'Chariotpunk: a culture obsessed with chariot racing, with light spoked chariots, horse teams in bright colors, dusty hippodromes and roaring crowds.',
        subject_treatment:
          "Keep the prompt's subject and setting; turn it into a thundering chariot race with horse teams, dust and cheering stands.",
        color_and_tone:
          'Dusty ochre and sand with bright team colors of red, blue, green and white.',
        lighting_and_shadow: 'Harsh midday sun through clouds of kicked-up dust.',
        texture_and_material:
          'Spoked wooden wheels, leather reins, bronze fittings, dust and sweat.',
        camera_and_composition: 'Low fast angles with horses and wheels racing through the frame.',
        atmosphere_and_mood:
          'Thunderous, reckless and glorious, a city that treats speed as religion.',
        rendering_and_quality: 'Dynamic illustration with motion, dust clouds and powerful horses.',
        key_features: 'spoked chariots; horse teams; dusty arenas; roaring crowds',
      },
      [
        'Four chariot teams thunder around the final turn of a vast dusty arena as a wheel shatters, the champion leaping from one chariot to another at full speed while a hundred thousand spectators rise screaming. No readable text or logo.',
        'A chariot racer loses control and his horses calmly trot out of the arena and into a nearby bakery. No readable text or logo.',
        'Before dawn in an empty arena, a young charioteer strokes the neck of her horse, both breathing slowly in the cold air. No readable text or logo.',
      ],
    ),
    punk(
      'Yurtpunk',
      'felt tent steppe punk',
      'yurtpunk',
      {
        aesthetic:
          'Yurtpunk: steppe nomads living in round felt tents that pack onto carts, with lattice walls, painted roof rings, horse herds and endless grass seas.',
        subject_treatment:
          "Keep the prompt's subject and setting; set it among round felt tents, lattice walls and horse herds on open steppe.",
        color_and_tone:
          'Cream felt and grass greens with painted orange, red and blue accents and wide sky.',
        lighting_and_shadow: 'Open sky light and warm stove glow inside round tents.',
        texture_and_material:
          'Thick felt, lattice timber, painted wood, woven rope, wool and grass.',
        camera_and_composition: 'Wide steppe horizons with round tents and moving herds.',
        atmosphere_and_mood: 'Free, windswept and hospitable, home wherever the herd goes.',
        rendering_and_quality: 'Clear open illustration with felt texture and vast sky depth.',
        key_features: 'round felt tents; lattice walls; horse herds; endless grass',
      },
      [
        'An entire nomad city of felt tents is packed onto carts in an hour as a storm rolls across the steppe, ten thousand horses galloping ahead of the caravan under a purple sky. No readable text or logo.',
        'A nomad family packs up their tent to move and realizes the goat has been sitting on the only map. No readable text or logo.',
        'A herder sits in the doorway of a felt tent at night, the stove glowing behind him under a huge sky of stars. No readable text or logo.',
      ],
    ),
    punk(
      'Canoepunk',
      'dugout canoe river punk',
      'canoepunk',
      {
        aesthetic:
          'Canoepunk: river and lake cultures centered on carved dugout canoes, with paddle crews, river markets on boats, carved prows and forest waterways.',
        subject_treatment:
          "Keep the prompt's subject and setting; set it on forest rivers among carved dugout canoes, paddlers and floating markets.",
        color_and_tone:
          'Dark river water, forest greens and warm carved wood with painted prow accents.',
        lighting_and_shadow: 'Soft morning mist and sunlight glinting on moving water.',
        texture_and_material:
          'Carved logs, wet paddles, ropes, woven baskets, river stones and mist.',
        camera_and_composition: 'Long canoes gliding through the frame with paddles in rhythm.',
        atmosphere_and_mood: 'Rhythmic, communal and flowing, the river as a road.',
        rendering_and_quality:
          'Atmospheric illustration with water reflections and carved wood detail.',
        key_features: 'carved dugout canoes; paddle crews; river markets; carved prows',
      },
      [
        'A great war canoe carved from a single giant tree races down a flooded river through the rainforest, forty paddlers striking in rhythm as a waterfall roars ahead in the mist. No readable text or logo.',
        "A canoe market gets hopelessly jammed when one vendor's canoe full of melons tips over and melons float everywhere. No readable text or logo.",
        'An old paddler drifts alone in a canoe on a mirror-still lake at dawn, mist curling around the carved prow. No readable text or logo.',
      ],
    ),
    punk(
      'Barkpunk',
      'tree bark craft punk',
      'barkpunk',
      {
        aesthetic:
          'Barkpunk: forest peoples crafting from bark, with birchbark boats, bark-cloth garments, bark-shingle houses and peeled patterns across everything.',
        subject_treatment:
          "Keep the prompt's subject and setting; rebuild its clothing, vessels and shelters from peeled bark, bark cloth and birch sheets.",
        color_and_tone: 'Birch white and black flecks, cedar red-brown and deep forest green.',
        lighting_and_shadow: 'Cool forest light through white birch trunks and warm firelight.',
        texture_and_material:
          'Peeled birchbark, beaten bark cloth, cedar strips, spruce root lashings.',
        camera_and_composition:
          'Forest scenes where bark objects blend into the trees around them.',
        atmosphere_and_mood: 'Quiet, careful and woodland, living lightly on the forest.',
        rendering_and_quality:
          'Delicate textured illustration with fine bark patterns and forest light.',
        key_features: 'birchbark boats; bark cloth; bark-shingle houses; peeled patterns',
      },
      [
        'A flotilla of white birchbark boats slips down a dark forest river under a full moon, lanterns glowing through the thin bark hulls like floating paper moons. No readable text or logo.',
        'A man proudly wears his new bark-cloth suit to a wedding and it slowly curls up in the rain during the ceremony. No readable text or logo.',
        'A child sleeps in a small birchbark cradle hung from a tree branch, rocking gently in the forest breeze. No readable text or logo.',
      ],
    ),
    punk(
      'Shellpunk',
      'seashell craft coast punk',
      'shellpunk',
      {
        aesthetic:
          'Shellpunk: coastal cultures building with seashells, with shell armor, conch horns, mother-of-pearl mosaics, cowrie trade and shell-paved beaches.',
        subject_treatment:
          "Keep the prompt's subject and setting; rebuild its armor, jewelry and buildings from seashells and mother-of-pearl.",
        color_and_tone:
          'Pearly white, iridescent nacre, coral pink and sandy beige with turquoise sea.',
        lighting_and_shadow:
          'Bright coastal light shimmering in rainbows on mother-of-pearl surfaces.',
        texture_and_material: 'Spiral shells, cowries, nacre, sand, driftwood and dried seaweed.',
        camera_and_composition: 'Beach and coastal scenes with shell-covered forms glinting.',
        atmosphere_and_mood: 'Bright, salty and treasured, riches washed up by the tide.',
        rendering_and_quality:
          'Iridescent detailed illustration with shimmering nacre and shell forms.',
        key_features: 'shell armor; conch horns; nacre mosaics; cowrie trade',
      },
      [
        'A coastal army in shimmering mother-of-pearl shell armor blows giant conch horns on a stormy beach as a sea monster rises from the waves, every plate flashing rainbow in the lightning. No readable text or logo.',
        'A beach merchant tries to pay for dinner with a single enormous seashell and the cook is clearly considering it. No readable text or logo.',
        'A girl holds a spiral shell to her ear on an empty evening beach and hears, very faintly, someone calling her name. No readable text or logo.',
      ],
    ),
    punk(
      'Amberpunk',
      'fossil amber punk',
      'amberpunk',
      {
        aesthetic:
          'Amberpunk: a culture that treasures amber, with glowing amber windows, trapped ancient insects, resin-sealed relics and golden light through tree sap.',
        subject_treatment:
          "Keep the prompt's subject and setting; seal it in or light it through glowing golden amber and hardened resin.",
        color_and_tone: 'Glowing honey gold, deep orange and brown amber with dark forest shadows.',
        lighting_and_shadow: 'Warm light passing through amber, glowing from inside.',
        texture_and_material:
          'Translucent amber, trapped bubbles, fossil insects, pine resin and bark.',
        camera_and_composition: 'Close views of things suspended in amber and amber-lit rooms.',
        atmosphere_and_mood: 'Timeless and golden, moments frozen for millions of years.',
        rendering_and_quality:
          'Luminous illustration with translucent amber glow and fine inclusions.',
        key_features: 'glowing amber; trapped insects; resin-sealed relics; golden inner light',
      },
      [
        'Explorers discover an entire ancient forest village preserved inside a colossal block of amber, lit gold from within, its villagers frozen mid-dance for a million years. No readable text or logo.',
        'An amber collector buys an expensive piece containing a rare ancient insect, and the insect very clearly winks at him. No readable text or logo.',
        'A golden drop of resin slowly runs down a pine trunk at sunset, about to capture a tiny sleeping ant. No readable text or logo.',
      ],
    ),
    punk(
      'Mammothpunk',
      'ice age mammoth culture punk',
      'mammothpunk',
      {
        aesthetic:
          'Mammothpunk: ice age hunters and herders living with woolly mammoths, with mammoth-bone houses, tusk arches, fur-clad riders and frozen steppe camps.',
        subject_treatment:
          "Keep the prompt's subject and setting; set it in an ice age world with woolly mammoths, bone houses and fur-clad people.",
        color_and_tone: 'Frosty whites and grey-blues with warm brown fur and ivory tusk tones.',
        lighting_and_shadow: 'Low cold sun on snow and warm fire glow inside bone shelters.',
        texture_and_material: 'Shaggy fur, ivory tusks, bone frames, hide covers, snow and ice.',
        camera_and_composition: 'Huge mammoths towering over small humans on open frozen plains.',
        atmosphere_and_mood:
          'Epic, cold and survivalist, small people living beside gentle giants.',
        rendering_and_quality: 'Epic textured illustration with shaggy fur and frosty depth.',
        key_features: 'woolly mammoths; bone houses; tusk arches; frozen steppe',
      },
      [
        'Riders on woolly mammoths charge across a frozen plain to drive back a pack of giant cave lions, snow exploding under enormous feet as the ice age sun sets red behind them. No readable text or logo.',
        'A mammoth herder tries to give his mammoth a haircut before a festival and is now buried under a mountain of shaggy fur. No readable text or logo.',
        'A child falls asleep curled against the warm side of a sleeping mammoth calf inside a bone house at night. No readable text or logo.',
      ],
    ),
    punk(
      'Featherpunk',
      'feather craft sky punk',
      'featherpunk',
      {
        aesthetic:
          'Featherpunk: an invented sky-loving culture of feather craft, with feather cloaks, fletched gliders, bird-rider scouts and towers crowned with plumes.',
        subject_treatment:
          "Keep the prompt's subject and setting; dress and equip it with invented feather cloaks, fletched gliders and plumed structures.",
        color_and_tone:
          'Vivid feather reds, blues, greens and yellows with white clouds and bright sky.',
        lighting_and_shadow:
          'Bright sunlight glinting on iridescent feathers and soft cloud light.',
        texture_and_material:
          'Layered feathers, fletching, light cane frames, woven cord and down.',
        camera_and_composition:
          'High sky views with gliders and figures silhouetted against clouds.',
        atmosphere_and_mood: 'Light, proud and soaring, a people who envy the birds.',
        rendering_and_quality:
          'Vivid detailed illustration with layered feather textures and bright sky.',
        key_features: 'feather cloaks; fletched gliders; bird riders; plumed towers',
      },
      [
        'A squadron of scouts on huge feather-winged gliders launches from cliff towers crowned with plumes, diving through a thunderstorm to warn the valley of an approaching fleet. No readable text or logo.',
        "A man tests his homemade feather glider by jumping off his roof and lands gently in his neighbor's chicken coop, covered in even more feathers. No readable text or logo.",
        'A single bright red feather drifts down onto the palm of a quiet child standing alone on a windy hill. No readable text or logo.',
      ],
    ),
  ] satisfies Create[],
};

export default spec;
