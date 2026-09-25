import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Occult, myth and gothic punks (part A): each punk turns one occult practice or gothic institution into a culture.
const AVOID = [
  ...STYLE_AVOID,
  'gore',
  'graphic wounds',
  'real religious leader likeness',
  'readable runes or scripture',
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
  tags: [tag, 'punk', 'occult'],
  dna: dna(fields),
  avoid: AVOID,
  briefs,
});

const spec: Spec = {
  pack: 'pack_15',
  category: '8. Occult, Myth & Gothic Punks',
  updates: {
    'SP15-111': {
      briefs: [
        'A coven of witches in patched leather rides stolen motorcycles through a thunderstorm, their jackets stitched with hand-cut arcane marks and colored thread, a wax-sealed jar of lightning strapped to the lead bike. No readable text or logo.',
        'A punk witch runs a laundromat where every machine brews a different potion, and a regular customer has just accidentally turned his socks into small anxious frogs. No readable text or logo.',
        'At midnight in a tiny apartment kitchen, a young witch knots colored thread around a candle stub, whispering to a moth that lands on her wrist. No readable text or logo.',
      ],
    },
    'SP15-112': {
      briefs: [
        "A goth wedding procession in layered black lace and silver hardware walks through a flooded cathedral at night, the bride's veil trailing across the water and a thousand black candles floating around them. No readable text or logo.",
        'A goth teenager in full black lace and silver spikes is forced to attend a sunny beach picnic and sits under a black parasol, glaring at a cheerful seagull. No readable text or logo.',
        'A goth in a long black coat sits alone on a cemetery bench at dawn, feeding crows from an oxblood velvet pouch. No readable text or logo.',
      ],
    },
    'SP15-113': {
      briefs: [
        'A war chariot built from articulated ivory plates and carved bone struts, bound with tendon cords, charges across a salt desert pulled by two enormous armored beetles under a white noon sun. No readable text or logo.',
        'A bone engineer proudly shows off a new chair made from carved ivory struts, and it collapses the moment the village chief sits on it. No readable text or logo.',
        'A small bone flute with hide bindings rests on a stone ledge in a cave, a single thread of wind making it hum softly. No readable text or logo.',
      ],
    },
    'SP15-114': {
      briefs: [
        'An undertaker guild operates a vast funerary engine inside a mountain, relic-like brass mechanisms humming as a procession of lanterns carries the ashes of a king into its glowing central chamber. No readable text or logo.',
        'A grumpy funerary mechanic tries to repair a very old ghost-powered hearse that keeps wandering off by itself toward the nearest cemetery, dragging her toolbox behind it through the fog. No readable text or logo.',
        'In a dim chapel, a single relic mechanism ticks softly on an altar, its small glowing window showing that someone is still remembered. No readable text or logo.',
      ],
    },
    'SP15-115': {
      briefs: [
        'A remade minotaur in a patched leather jacket and hand-cut armor stands guard at the center of a labyrinth built from scrap metal fences, graffiti-bright shapes glowing on the walls behind him. No readable text or logo.',
        'Medusa runs a punk hair salon and her snakes all insist on different haircuts, one sulking because it got a mohawk it did not ask for. No readable text or logo.',
        'A small hand-made paper Icarus hangs from a thread in a quiet workshop window, its wings melting slightly in the afternoon sun. No readable text or logo.',
      ],
    },
    'SP15-116': {
      briefs: [
        'A village of masked dancers in straw effigy costumes circles a towering wicker giant at the edge of a dark forest, knotted bindings creaking as torches are lifted toward it at midsummer dusk. No readable text or logo.',
        'A tourist accidentally joins a folk horror village festival and is now wearing a straw crown and being cheered, with no idea what is about to happen. No readable text or logo.',
        'In a foggy field at dawn, a single small straw figure bound with red thread stands in the middle of a harvested crop, facing the farmhouse. No readable text or logo.',
      ],
    },
  },
  creates: [
    punk(
      'Alchemypunk',
      'alchemical laboratory punk',
      'alchemypunk',
      {
        aesthetic:
          'Alchemypunk: renegade alchemists in cluttered laboratories, with bubbling alembics, glowing transmutation circles, gold dust, sulfur smoke and brass instruments.',
        subject_treatment:
          "Keep the prompt's subject and setting; fill it with glass alembics, glowing circles, powders and brass tools of an alchemy lab.",
        color_and_tone:
          'Molten gold, sulfur yellow and mercury silver against dark wood and smoky umber.',
        lighting_and_shadow: 'Glowing liquids and furnace fire lighting smoky laboratory darkness.',
        texture_and_material:
          'Glass alembics, copper stills, parchment, gold dust, smoke and old wood.',
        camera_and_composition: 'Cluttered workbench scenes with a glowing reaction at the center.',
        atmosphere_and_mood: 'Obsessive and electric, the dream of turning anything into gold.',
        rendering_and_quality: 'Rich glowing illustration with detailed glassware and smoky light.',
        key_features: 'bubbling alembics; glowing circles; gold dust; sulfur smoke',
      },
      [
        'An alchemist finally succeeds in turning lead into gold, and the transmutation will not stop, spreading across her laboratory floor, up the walls and out into the city as molten gold light swallows the night. No readable text or logo.',
        "An alchemist's apprentice accidentally turns his master's beard into solid gold, and the old man now has to hold his chin up with both hands to speak. No readable text or logo.",
        'In a quiet laboratory at dawn, a single glass flask glows softly on the bench, holding a tiny swirling galaxy. No readable text or logo.',
      ],
    ),
    punk(
      'Grimoirepunk',
      'living spellbook punk',
      'grimoirepunk',
      {
        aesthetic:
          'Grimoirepunk: living spellbooks that breathe, bite and fly, with chained libraries, glowing illuminated diagrams, leather covers with eyes and pages turning in the wind.',
        subject_treatment:
          "Keep the prompt's subject and setting; surround it with living spellbooks, chained shelves and glowing unreadable diagrams.",
        color_and_tone:
          'Aged parchment, oxblood leather and iron black with glowing violet and gold diagrams.',
        lighting_and_shadow: 'Light rising from glowing open pages into dark library spaces.',
        texture_and_material:
          'Cracked leather, iron chains, brittle parchment, wax seals and dust.',
        camera_and_composition:
          'Towering chained shelves and books in flight across library halls.',
        atmosphere_and_mood: 'Forbidden and alive, knowledge that wants to escape.',
        rendering_and_quality:
          'Detailed atmospheric illustration with glowing page light and aged textures.',
        key_features: 'living books; chained shelves; glowing diagrams; flying pages',
      },
      [
        'A forbidden library breaks its chains at midnight and ten thousand living spellbooks fly out through the shattered dome like a flock of leather bats, glowing pages flapping across the moon. No readable text or logo.',
        'A librarian tries to shelve a very grumpy spellbook that keeps biting her fingers and sneezing clouds of glowing dust. No readable text or logo.',
        'An old grimoire lies open on a stone table in an empty tower, its glowing diagram slowly rotating by itself in the dark. No readable text or logo.',
      ],
    ),
    punk(
      'Cathedralpunk',
      'gothic cathedral builder punk',
      'cathedralpunk',
      {
        aesthetic:
          'Cathedralpunk: rebel builders raising impossible gothic cathedrals from scrap, with flying buttresses of girders, stained glass from bottles and gargantuan spires.',
        subject_treatment:
          "Keep the prompt's subject and setting; set it inside or beside towering scrap-built gothic cathedrals with colored glass and ribbed vaults.",
        color_and_tone:
          'Deep stone greys and rust with jewel-colored stained glass light in red, blue and gold.',
        lighting_and_shadow:
          'Colored light pouring through stained glass into dusty soaring interiors.',
        texture_and_material: 'Stone, riveted girders, bottle glass, scaffolding, ropes and dust.',
        camera_and_composition: 'Soaring vertical views up spires and down enormous naves.',
        atmosphere_and_mood:
          'Awe-struck and defiant, beauty built from the ruins of the old world.',
        rendering_and_quality:
          'Luminous detailed illustration with colored light shafts and deep scale.',
        key_features:
          'scrap buttresses; bottle-glass windows; soaring spires; colored light shafts',
      },
      [
        'A cathedral of rusted girders and a million colored bottles rises from the ruins of a dead city, its spire piercing a storm cloud as the builders on the scaffolding cheer through the rain. No readable text or logo.',
        'A cathedral builder has spent forty years on one spire and now realizes it is slightly crooked, while the entire town pretends not to notice. No readable text or logo.',
        'In an empty scrap cathedral at sunset, a child sits alone in a pool of red and blue light from a window made of broken bottles. No readable text or logo.',
      ],
    ),
    punk(
      'Seancepunk',
      'victorian seance punk',
      'seancepunk',
      {
        aesthetic:
          'Seancepunk: underground seance parlors with spirit cabinets, floating ectoplasm, candlelit round tables, trembling hands and ghost-photography glow.',
        subject_treatment:
          "Keep the prompt's subject and setting; turn it into a candlelit seance with a round table, joined hands and pale spirits appearing.",
        color_and_tone:
          'Deep velvet burgundy and black with pale ghostly blue-white and candle gold.',
        lighting_and_shadow: 'Candlelight from below and cold glowing spirits casting no shadows.',
        texture_and_material:
          'Velvet drapes, lace tablecloths, candle wax, brass and wisps of ectoplasm.',
        camera_and_composition: 'Circular table compositions with a spirit rising at the center.',
        atmosphere_and_mood: 'Hushed, thrilling and uncanny, the dead invited to dinner.',
        rendering_and_quality:
          'Atmospheric low-key illustration with glowing translucent spirits and velvet shadow.',
        key_features: 'round seance tables; ectoplasm; candlelight; joined hands',
      },
      [
        "At a seance in a sinking ocean liner, twelve guests in evening dress hold hands around a round table as the ghost of the ship's captain rises from the candle, water slowly creeping across the floor. No readable text or logo.",
        "A seance goes wrong when the summoned spirit turns out to be the host's very judgmental great-aunt, who immediately complains about the furniture. No readable text or logo.",
        'A single candle flickers on an empty seance table long after everyone has left, and one of the chairs is slowly pulled back. No readable text or logo.',
      ],
    ),
    punk(
      'Plaguepunk',
      'plague doctor culture punk',
      'plaguepunk',
      {
        aesthetic:
          'Plaguepunk: beaked plague doctors turned into a secret order, with leather masks, herb-filled beaks, waxed coats, lanterns and foggy quarantined streets.',
        subject_treatment:
          "Keep the prompt's subject and setting; bring in beaked masked doctors, waxed coats, lanterns and foggy quarantine streets, without disease gore.",
        color_and_tone:
          'Black waxed leather and fog grey with sickly green lantern light and dried herb browns.',
        lighting_and_shadow: 'Lantern pools in thick fog, beaked silhouettes against dim light.',
        texture_and_material:
          'Waxed leather, glass eye lenses, dried herbs, wooden canes and wet cobbles.',
        camera_and_composition:
          'Foggy narrow streets with lone masked figures or silent processions.',
        atmosphere_and_mood: 'Eerie, solemn and protective, strangers who walk toward the danger.',
        rendering_and_quality:
          'Moody fog-layered illustration with lantern glow and leather sheen.',
        key_features: 'beaked masks; waxed coats; lanterns in fog; herb-filled beaks',
      },
      [
        'A silent procession of a hundred beaked plague doctors walks through a fog-drowned city at midnight carrying green lanterns, and every shuttered window opens a crack as they pass. No readable text or logo.',
        'A plague doctor tries to eat soup through his long beaked mask at a village dinner and fails spectacularly while everyone politely looks away. No readable text or logo.',
        'A lone plague doctor sits on a church step at dawn, mask resting on his knee, looking at the first sunlight after a long night. No readable text or logo.',
      ],
    ),
    punk(
      'Relicpunk',
      'holy relic reliquary punk',
      'relicpunk',
      {
        aesthetic:
          'Relicpunk: relic hunters and reliquary makers, with jeweled glass caskets, gilded containers, pilgrim badges, tiny holy objects and crowds of devoted pilgrims.',
        subject_treatment:
          "Keep the prompt's subject and setting; enshrine it in jeweled reliquaries, gilded caskets and pilgrim offerings.",
        color_and_tone:
          'Gilded gold, deep enamel reds and blues with candle amber and dark chapel stone.',
        lighting_and_shadow: 'Candlelight glinting on gold and gems in dark chapel spaces.',
        texture_and_material: 'Gilded metal, cabochon gems, crystal glass, enamel and worn velvet.',
        camera_and_composition: 'Close views of precious reliquaries and crowded pilgrim scenes.',
        atmosphere_and_mood: 'Devout and slightly absurd, faith poured into tiny precious boxes.',
        rendering_and_quality:
          'Rich jeweled illustration with precise metalwork and candle glints.',
        key_features: 'jeweled reliquaries; gilded caskets; pilgrim crowds; candle glints',
      },
      [
        'Relic hunters dive into a flooded underground crypt by torchlight and find a gigantic jeweled reliquary glowing on an altar, the size of a ship, guarded by ranks of stone knights. No readable text or logo.',
        'A monastery proudly displays its most sacred relic in a golden crystal casket, and it is very clearly just an ordinary old sock. No readable text or logo.',
        'A pilgrim woman kneels alone in a dark chapel before a tiny golden reliquary, her candle the only light in the stone room. No readable text or logo.',
      ],
    ),
    punk(
      'Candlepunk',
      'candle-lit world punk',
      'candlepunk',
      {
        aesthetic:
          'Candlepunk: a world lit only by candles, with dripping wax cities, chandelier forests, candle-maker guilds and faces glowing in warm flickering pools.',
        subject_treatment:
          "Keep the prompt's subject and setting; light it only by candles, with dripping wax and flickering warm pools of light.",
        color_and_tone: 'Warm candle gold and honey amber against deep brown-black shadow.',
        lighting_and_shadow:
          'Many small flickering flames creating warm pools and deep soft shadows.',
        texture_and_material: 'Dripping wax, tallow, wicks, iron candelabras, soot and smoke.',
        camera_and_composition:
          'Intimate close groupings and vast halls glittering with countless flames.',
        atmosphere_and_mood:
          'Warm, fragile and hushed, a world that could go dark with one breath.',
        rendering_and_quality: 'Low-key warm illustration with soft flame glow and wax detail.',
        key_features: 'candle-only light; dripping wax; chandelier halls; flickering pools',
      },
      [
        "A candle-makers' city built entirely of centuries of dripped wax glows on a mountainside at night, ten million flames burning on every rooftop as a storm wind approaches across the valley. No readable text or logo.",
        'A man tries to sneeze quietly at a candlelit dinner for two hundred guests and blows out every single candle in the hall. No readable text or logo.',
        'A small girl shields a single candle flame with her hand as she walks down a long dark stone corridor. No readable text or logo.',
      ],
    ),
  ] satisfies Create[],
};

export default spec;
