import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Primitive, stone and salvage punks (part A): each punk builds a future from one ancient material or craft.
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
  updates: {
    'SP15-121': {
      briefs: [
        'A basalt war engine with interlocking stone wheels and flint-bladed arms grinds across a volcanic plain, pulled by a hundred warriors on ropes as a rival stone fortress looms on the ridge ahead. No readable text or logo.',
        'A stone-age inventor proudly unveils the first stone smartphone, a heavy carved basalt slab, and the entire tribe pretends to be impressed. No readable text or logo.',
        'An old stonecutter sits in a quiet quarry at dusk, running her thumb along a single perfect channel she spent all day carving. No readable text or logo.',
      ],
    },
    'SP15-122': {
      briefs: [
        'A village powers its whole hillside with a giant wooden water wheel, rope tension lines and clay pipes, the entire mechanism visibly turning as a festival of lanterns rises from the terraced houses at night. No readable text or logo.',
        'An engineer builds an elaborate rope-and-pulley machine across his house just to pour a single cup of tea, and his family watches the ten-minute process in silence. No readable text or logo.',
        'A woman sits by a small clay oven at dawn, a hand-built bellows breathing softly as the fire wakes up. No readable text or logo.',
      ],
    },
  },
  creates: [
    punk(
      'Bronzepunk',
      'bronze age engineering punk',
      'bronzepunk',
      {
        aesthetic:
          'Bronzepunk: a bronze age that never ended, with cast bronze automatons, gleaming chariots, sun-disc mirrors and foundries pouring glowing metal into clay molds.',
        subject_treatment:
          "Keep the prompt's subject and setting; rebuild its machines, armor and tools in cast and hammered bronze with green patina.",
        color_and_tone:
          'Burnished bronze gold and copper with green verdigris patina and warm sunlit stone.',
        lighting_and_shadow:
          'Bright Mediterranean sun glinting on polished bronze, foundry fire at night.',
        texture_and_material:
          'Cast bronze, hammered sheet, verdigris, clay molds, linen and limestone.',
        camera_and_composition: 'Heroic frontal compositions of gleaming machines and figures.',
        atmosphere_and_mood: 'Proud, radiant and ancient, an empire of shining metal.',
        rendering_and_quality: 'Gleaming detailed illustration with polished metal and patina.',
        key_features: 'bronze automatons; sun-disc mirrors; verdigris patina; glowing foundries',
      },
      [
        'A colossal bronze automaton guardian wades out of the harbor to meet an invading fleet, sunlight blazing off its hammered chest as the defenders on the city walls raise giant sun-disc mirrors to blind the ships. No readable text or logo.',
        'A bronze-age inventor presents his new bronze robot servant to the king, and it immediately falls over and rolls down the palace steps. No readable text or logo.',
        'A smith pours a small stream of glowing bronze into a clay mold at night, her face lit gold by the molten light. No readable text or logo.',
      ],
    ),
    punk(
      'Ironagepunk',
      'iron age forge punk',
      'ironagepunk',
      {
        aesthetic:
          'Ironagepunk: iron age hill forts turned into forge cities, with bloomery furnaces, iron wheels, horned helmets of invention and smoke over timber walls.',
        subject_treatment:
          "Keep the prompt's subject and setting; rebuild it with dark forged iron, bloomery furnaces and timber hill-fort architecture.",
        color_and_tone:
          'Dark iron grey and soot black with glowing orange forge light and muddy greens.',
        lighting_and_shadow: 'Forge glow and overcast daylight through smoke and mist.',
        texture_and_material:
          'Hammer-scarred iron, charcoal, timber palisades, wool, leather and mud.',
        camera_and_composition: 'Smoky forge interiors and hill forts seen across misty valleys.',
        atmosphere_and_mood: 'Tough, smoky and inventive, strength hammered out of rock.',
        rendering_and_quality: 'Gritty textured illustration with forge glow and smoky depth.',
        key_features: 'bloomery furnaces; forged iron; timber hill forts; smoke and mist',
      },
      [
        'An iron age hill fort ignites a ring of giant bloomery furnaces along its walls to forge iron gates overnight as a vast horde gathers in the misty valley below, sparks pouring into the dark sky. No readable text or logo.',
        'A blacksmith proudly forges the first iron frying pan and his wife immediately uses it to win an argument. No readable text or logo.',
        'An old smith sleeps beside a cooling forge, a newly finished iron key resting in his open hand. No readable text or logo.',
      ],
    ),
    punk(
      'Woodpunk',
      'carved timber engineering punk',
      'woodpunk',
      {
        aesthetic:
          'Woodpunk: a civilization built entirely of carved and joined wood, with wooden clockwork, timber airships, oak gears, pegged joints and carved everything.',
        subject_treatment:
          "Keep the prompt's subject and setting; rebuild its machines, vehicles and buildings from carved and pegged wood with visible grain.",
        color_and_tone: 'Warm honey oak, walnut brown and pale ash with deep forest greens.',
        lighting_and_shadow: 'Warm sunlight through trees and lamplight on polished grain.',
        texture_and_material:
          'Wood grain, carved gears, pegged joints, shavings, bark and oil finish.',
        camera_and_composition: 'Detailed mechanical views and wooden machines in forest settings.',
        atmosphere_and_mood:
          'Warm, clever and patient, a world grown and carved rather than mined.',
        rendering_and_quality: 'Richly detailed illustration with fine grain and carved joinery.',
        key_features: 'wooden clockwork; carved gears; pegged joints; timber airships',
      },
      [
        'A timber airship with carved oak gears and linen sails lifts out of an ancient forest at dawn, its wooden propellers creaking as the whole woodland city waves from branch bridges below. No readable text or logo.',
        'A woodworker builds a perfectly working wooden car and is stopped by a very confused police officer who has no idea how to write the ticket. No readable text or logo.',
        'A small carved wooden bird with tiny gears sits on a windowsill at dusk, its wings slowly opening as the clockwork unwinds. No readable text or logo.',
      ],
    ),
    punk(
      'Potterypunk',
      'ceramic technology punk',
      'potterypunk',
      {
        aesthetic:
          'Potterypunk: a world where everything is fired clay, with ceramic machines, glazed armor, kiln cities, terracotta pipes and crackle-glaze surfaces.',
        subject_treatment:
          "Keep the prompt's subject and setting; rebuild it in fired clay, with glazed ceramic surfaces, terracotta and kiln marks.",
        color_and_tone: 'Terracotta orange, celadon green, cobalt blue glaze and cream crackle.',
        lighting_and_shadow: 'Soft daylight on glossy glaze and warm kiln glow at night.',
        texture_and_material:
          'Terracotta, glossy glaze, crackle patterns, throwing rings and kiln ash.',
        camera_and_composition: 'Workshop and city views crowded with ceramic forms.',
        atmosphere_and_mood: 'Earthy, delicate and ingenious, a civilization that could shatter.',
        rendering_and_quality:
          'Tactile illustration with glossy glaze highlights and clay texture.',
        key_features: 'ceramic machines; glazed armor; kiln cities; crackle glaze',
      },
      [
        'An army in glazed ceramic armor marches across a valley at dawn, celadon and cobalt plates shining, while giant kiln towers on the hills behind them glow like volcanoes. No readable text or logo.',
        'A potter carefully builds a ceramic bicycle and the entire village holds its breath as the mayor attempts the first ride. No readable text or logo.',
        'An old potter sits at her wheel in a dim workshop, a small bowl rising between her wet hands. No readable text or logo.',
      ],
    ),
    punk(
      'Reedpunk',
      'woven reed marsh punk',
      'reedpunk',
      {
        aesthetic:
          'Reedpunk: floating marsh cultures building from bundled reeds, with reed boats, woven island towns, reed arches and golden stalks against wide water.',
        subject_treatment:
          "Keep the prompt's subject and setting; build it from bundled and woven reeds on a wide calm marsh.",
        color_and_tone: 'Golden straw and pale green reeds with blue water and warm dusk skies.',
        lighting_and_shadow: 'Low golden sun glowing through reed walls and on still water.',
        texture_and_material:
          'Bundled reeds, woven mats, rope lashings, mud and calm water reflections.',
        camera_and_composition: 'Wide flat marsh views with woven island towns reflected in water.',
        atmosphere_and_mood: 'Calm, golden and resourceful, a home that floats.',
        rendering_and_quality:
          'Warm detailed illustration with woven fiber texture and reflections.',
        key_features: 'bundled reed boats; woven islands; reed arches; still water',
      },
      [
        'A floating island town woven from golden reeds drifts across a flooded plain as a storm approaches, the whole community lashing their homes together into one huge raft with ropes and songs. No readable text or logo.',
        'A reed-boat builder launches his new vessel and it floats perfectly, then slowly unravels beneath him in the middle of the lake. No readable text or logo.',
        'A child sits in the doorway of a reed house at sunset, dangling her feet in the warm still water. No readable text or logo.',
      ],
    ),
    punk(
      'Leatherpunk',
      'tanned hide craft punk',
      'leatherpunk',
      {
        aesthetic:
          'Leatherpunk: a nomadic culture of tanners and hide-workers, with stitched leather armor, hide tents, tooled saddles, drum skins and oiled straps.',
        subject_treatment:
          "Keep the prompt's subject and setting; rebuild its clothing, gear and shelters from stitched, tooled and oiled leather.",
        color_and_tone:
          'Saddle brown, tan, oxblood and black leather with bone white and brass buckles.',
        lighting_and_shadow: 'Warm firelight and sun catching oiled leather sheen.',
        texture_and_material:
          'Tooled leather, heavy stitching, rawhide lacing, brass buckles and fur trim.',
        camera_and_composition: 'Close craft views and nomad camps with leather gear everywhere.',
        atmosphere_and_mood: 'Rugged, proud and weathered, gear that lasts a lifetime.',
        rendering_and_quality:
          'Richly textured illustration with stitched and tooled leather detail.',
        key_features: 'stitched leather armor; tooled saddles; hide tents; drum skins',
      },
      [
        'A nomad war band in stitched leather armor rides across a windswept steppe at dusk, hide drums thundering, the leather banners snapping in the wind as a storm breaks over the hills. No readable text or logo.',
        'A leatherworker makes a pair of boots so stiff that the customer walks out of the shop like a wooden soldier. No readable text or logo.',
        'An old saddle maker sits by the fire stitching a tiny leather collar for a puppy asleep in her lap. No readable text or logo.',
      ],
    ),
    punk(
      'Obsidianpunk',
      'volcanic glass blade punk',
      'obsidianpunk',
      {
        aesthetic:
          'Obsidianpunk: a civilization of volcanic glass, with razor obsidian blades, black mirror shields, knapped glass architecture and sun-temples reflecting fire.',
        subject_treatment:
          "Keep the prompt's subject and setting; rebuild its weapons, tools and architecture from glossy black knapped obsidian.",
        color_and_tone:
          'Glossy black obsidian with red-gold sun reflections, jade green and stone beige.',
        lighting_and_shadow: 'Hard sun and fire reflections sliding across black glass.',
        texture_and_material:
          'Conchoidal knapped glass, polished obsidian mirrors, stone and feathers.',
        camera_and_composition:
          'Dramatic reflections in black glass and imposing stepped structures.',
        atmosphere_and_mood: 'Sharp, dangerous and majestic, beauty with a cutting edge.',
        rendering_and_quality:
          'Glossy precise illustration with sharp reflections and knapped facets.',
        key_features:
          'knapped obsidian blades; black mirror shields; glass temples; fire reflections',
      },
      [
        'Warriors raise huge black obsidian mirror shields toward the sun and focus a burning beam at an approaching war fleet, the glossy volcanic glass flashing red and gold across the whole bay. No readable text or logo.',
        'A king orders a throne made entirely of obsidian and discovers too late that it is extremely sharp and very cold. No readable text or logo.',
        'A young woman looks into a polished obsidian mirror in a dark temple and sees only a faint golden candle behind her. No readable text or logo.',
      ],
    ),
    punk(
      'Megalithpunk',
      'megalith builder punk',
      'megalithpunk',
      {
        aesthetic:
          'Megalithpunk: builders of giant standing stones and dolmens, with log rollers, rope teams, lever frames and stone circles aligned with the sun.',
        subject_treatment:
          "Keep the prompt's subject and setting; bring in giant standing stones, rope-pulling crowds and wooden lever frames.",
        color_and_tone:
          'Grey granite and lichen with green hills, stormy skies and golden solstice light.',
        lighting_and_shadow: 'Low solstice sun cutting through stone gaps and long shadows.',
        texture_and_material: 'Rough granite, lichen, wooden rollers, rope, mud and grass.',
        camera_and_composition: 'Huge stones with crowds pulling ropes, circles on open hills.',
        atmosphere_and_mood:
          'Monumental, collective and mysterious, a whole people moving a mountain.',
        rendering_and_quality: 'Epic textured illustration with huge scale and dramatic light.',
        key_features: 'standing stones; rope teams; log rollers; solstice alignment',
      },
      [
        'A thousand people haul a colossal standing stone up a hill on log rollers at solstice dawn, and as it lifts into place the first ray of sunlight shoots through the circle straight into the crowd. No readable text or logo.',
        'A megalith builder realizes after thirty years that the stone circle is slightly off and the whole village refuses to move it again. No readable text or logo.',
        'An old shepherd leans against a lone standing stone on a misty hill, sharing his bread with his dog. No readable text or logo.',
      ],
    ),
    punk(
      'Antlerpunk',
      'antler and horn craft punk',
      'antlerpunk',
      {
        aesthetic:
          'Antlerpunk: a forest culture crafting everything from shed antlers and horn, with antler crowns, horn instruments, carved bone combs and deer-rider hunters.',
        subject_treatment:
          "Keep the prompt's subject and setting; rebuild its tools, crowns and furniture from shed antlers and carved horn.",
        color_and_tone:
          'Pale antler cream and horn amber with deep forest greens and mossy browns.',
        lighting_and_shadow: 'Misty forest light filtering through trees onto branching antlers.',
        texture_and_material: 'Branching antler, polished horn, carved bone, moss, fur and bark.',
        camera_and_composition:
          'Figures wearing and wielding branching antler forms in misty woods.',
        atmosphere_and_mood: 'Wild, quiet and ancient, people who borrow the crowns of deer.',
        rendering_and_quality:
          'Detailed atmospheric illustration with carved antler and horn detail.',
        key_features: 'antler crowns; horn instruments; carved bone; misty forests',
      },
      [
        'A forest queen wearing a towering crown of shed antlers rides a giant white stag through a misty ancient forest, horn trumpets echoing as a hundred deer riders follow behind her. No readable text or logo.',
        'A man tries to walk through a narrow doorway while wearing his enormous new antler crown and gets stuck in front of the whole village. No readable text or logo.',
        'A child carves a small comb from a shed antler by a forest stream, a curious fawn watching from the ferns. No readable text or logo.',
      ],
    ),
  ] satisfies Create[],
};

export default spec;
