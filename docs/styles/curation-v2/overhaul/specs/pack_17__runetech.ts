import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Rune-tech and apocalyptic warfronts: medieval faith fused with impossible machinery. Fourteen
// originals get card briefs; six new studies add relic airship armadas, plasma rune forges, solar
// monastery engines, clockwork paladins, rune-circuit engraving and neon sigil sieges.
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
  tags: [tag, 'rune-tech', 'portable-style-study'],
  dna: dna(fields),
  avoid: [...avoid, 'gore', 'readable runes or text', 'existing franchise armor or emblems', ...STYLE_AVOID],
  briefs,
});

const keep = 'Preserve the requested identity, count, pose and action with original characters';

const spec: Spec = {
  pack: 'pack_17',
  category: '4. Rune-Tech & Apocalyptic Warfronts',
  updates: {
    'SP17-019': { briefs: [
      'Towering over a frozen plain, a castle of brutalist black metal rises on four walking legs, its battlements glowing with rune light as it steps over a burning village. No readable text or logo.',
      'Standing guard at a gate humming with sacred machinery, a sentry monk tries to open it with an old iron key while the citadel scans him with a beam of blue light. No readable text or logo.',
      'Deep inside a silent metal keep, a single rune on the wall flickers on and off like a slow heartbeat. No readable text or logo.',
    ] },
    'SP17-020': { briefs: [
      'Marching through a storm of ash, a crusader in modular plate with glowing sigils on every joint lifts a hammer whose head is a spinning reactor core. No readable text or logo.',
      'Getting dressed for battle, a crusader realizes the lit sigils on his modular armor are all installed upside down and flashing in panic. No readable text or logo.',
      'Kneeling in a dark chapel, an empty suit of futuristic plate still has its sigils glowing faintly, as if waiting for its knight. No readable text or logo.',
    ] },
    'SP17-021': { briefs: [
      'Floating above a violet sea, a castle of glass towers hums with analog synth light as a prophet on the highest balcony reads the future in the glowing horizon. No readable text or logo.',
      'On a hill glowing with retro-future light, a wizard tries to tune a giant crystal organ that only plays one extremely long note. No readable text or logo.',
      'Seen through prophecy glow, a castle window shows a scene that has not happened yet, and a woman is watching herself arrive. No readable text or logo.',
    ] },
    'SP17-022': { briefs: [
      'Stomping across a battlefield, a mecha knight carries a glowing sacred core in its open chest like a walking shrine, pilgrims running beneath its armored feet. No readable text or logo.',
      'Resting between battles, a towering walking shrine sits down on a hillside while tiny monks polish its toes. No readable text or logo.',
      "Standing silent in a collapsed foundry, a giant armored shrine has its chest hatch open, and its glowing core is missing. No readable text or logo.",
    ] },
    'SP17-023': { briefs: [
      'Growing through a buried catacomb, roots and bone machinery pulse with rune conduits as a vast organic engine slowly wakes beneath the city. No readable text or logo.',
      'Deep below ground, a bone-and-root machine designed for the end of the world is being used by a family of moles as a very comfortable home. No readable text or logo.',
      'Along a catacomb wall of bone and roots, the glowing conduits have started to form the shape of a sleeping face. No readable text or logo.',
    ] },
    'SP17-024': { briefs: [
      'Hammering a newborn star on an anvil of black lead lines, a celestial smith sends radiant shards of cosmic glass flying across a cathedral of space. No readable text or logo.',
      "Assembled from glowing starforged panes, a young angel apprentice has broken a star and is trying to glue it back together. No readable text or logo.",
      'In a dark window of cosmic panes, one pane shows a star going out, and the lead lines around it have started to crack. No readable text or logo.',
    ] },
    'SP17-025': { briefs: [
      'Wading through a mud-choked trench beside a sunken cathedral, a crusader in reliquary armor carries a martyr banner through black powder smoke toward a wall of iron angels. No readable text or logo.',
      'Stuck in the mud of a trench, a heavily armored crusader waits patiently while his squire tries to dig him out with a spoon. No readable text or logo.',
      'In a trench after the fighting, a single martyr banner stands in the mud, and the smoke drifts around it without touching it. No readable text or logo.',
    ] },
    'SP17-026': { briefs: [
      'Rising over a painted tabletop battlefield, a siege titan crowned with a cathedral advances as armies of tiny skull-banner soldiers charge beneath its feet. No readable text or logo.',
      "Posed on a gaming table like a painted model, a mighty war priest has been painted beautifully except for one hand the painter gave up on. No readable text or logo.",
      "Painted on a warfront table, a skull-helmed miniature has left tiny muddy footprints across the map overnight, leading toward the players' chairs. No readable text or logo.",
    ] },
    'SP17-027': { briefs: [
      'Cornered by torchlight in a collapsing corridor, a party of angular heroes shouts in panic as a giant spider fills the darkness behind them with exaggerated black shadows. No readable text or logo.',
      'Drawn in harsh ink, a nervous adventurer checks every stone in a dungeon for traps and completely misses the huge trapdoor he is standing on. No readable text or logo.',
      'In heavy black ink, a torch-bearer holds up a flame in an empty corridor, and his shadow on the wall is standing a step ahead of him. No readable text or logo.',
    ] },
    'SP17-028': { briefs: [
      'Carved in old-world linework, a warband of undead knights in funeral armor rides out of a sepulcher under a banner heavy with heraldic skulls. No readable text or logo.',
      "Engraved with solemn funeral detail, a skeleton warlord tries to lead a charge but his horse is more interested in grazing. No readable text or logo.",
      'In a carved engraving of a burial vault, one sealed tomb has its heavy lid slid slightly open, and a gauntlet rests on the edge. No readable text or logo.',
    ] },
    'SP17-029': { briefs: [
      "Grinding across a scorched wasteland, a fortress-sized iron reliquary on tank treads drags chained bells and fire censers toward a burning horizon. No readable text or logo.",
      'Covered in riveted holy iron, a war machine designed for the apocalypse is being used by a village priest to deliver bread. No readable text or logo.',
      'In a field of scorched metal, a riveted iron reliquary box sits closed, warm, and faintly ticking. No readable text or logo.',
    ] },
    'SP17-030': { briefs: [
      'Kneeling before a thorn chapel in a black forest, a witch-knight swears an oath in candlelit armor while bone charms swing from the branches above her. No readable text or logo.',
      'Deep in the black woods, a young witch-knight tries to look menacing while a small rabbit refuses to be frightened and follows her everywhere. No readable text or logo.',
      'In a dark forest clearing, a ring of bone charms hangs from the trees, and one charm is turning slowly although there is no wind. No readable text or logo.',
    ] },
    'SP17-031': { briefs: [
      'Defending a barricaded cloister, armored scribes load ritual engines that fire glowing pages at an army climbing the monastery walls. No readable text or logo.',
      'Behind the monastery barricades, an old armored scribe refuses to stop copying his manuscript even as the siege rages around his desk. No readable text or logo.',
      'On a monastery wall carved with bone patterns, one of the carved skulls has a fresh crack running through its eye. No readable text or logo.',
    ] },
    'SP17-032': { briefs: [
      'Standing on a celestial battlefield in star-lit armor, an exorcist astronomer seals a demon inside a spinning ring of constellations. No readable text or logo.',
      'Peering through a huge brass telescope, a monastery astronomer realizes the demon she is tracking is actually a very large moth on the lens. No readable text or logo.',
      'In a calm star-lit observatory, the demon-sealing circle on the floor is complete except for one small missing line. No readable text or logo.',
    ] },
  },
  creates: [
    study('Relic Airship Armada', 'holy war airship fleet', 'relic-airship', {
      aesthetic: 'Relic airship armada: fleets of cathedral-shaped airships with stained sails, bell towers and censers, crossing smoky skies in medieval formation.',
      subject_treatment: `${keep}; set the subject among or aboard ornate cathedral airships in a smoky sky.`,
      color_and_tone: 'Brass, soot black and stained-glass reds and blues against dusky skies.',
      lighting_and_shadow: 'Backlit smoke, glowing windows and golden sunset rims.',
      texture_and_material: 'Riveted brass hulls, weathered canvas, carved stone and bells.',
      camera_and_composition: 'Wide sky vista with ships in layered formation.',
      atmosphere_and_mood: 'Keep the requested mood with solemn airborne crusade.',
      rendering_and_quality: "Detailed painterly finish with clear ship silhouettes, kept consistent across the whole image.",
      key_features: 'cathedral airships; stained sails; smoky sky; formation',
    }, [], [
      'Crossing a sky of black smoke, a fleet of cathedral airships rings its bells as it sails toward a floating fortress, stained-glass sails glowing in the sunset. No readable text or logo.',
      'Leaning over the rail of a flying cathedral, a monk loses his hat to the wind and watches it fall toward the fields far below. No readable text or logo.',
      'Drifting silently through fog, a single cathedral airship passes by with every window lit and no crew visible on deck. No readable text or logo.',
    ]),
    study('Plasma Rune Forge', 'forge of glowing rune metal', 'rune-forge', {
      aesthetic: 'Plasma rune forge: dark forges where metal is shaped with glowing plasma and runes that burn into the steel, sparks and white-hot light in a black workshop.',
      subject_treatment: `${keep}; bathe the subject in white-hot forge light and burning rune glow.`,
      color_and_tone: 'Black and iron grey with white-hot plasma, cyan runes and orange sparks.',
      lighting_and_shadow: 'Intense glow from the forge with deep surrounding shadow.',
      texture_and_material: "Molten metal, soot, sparks and scorched stone, kept consistent across the whole image.",
      camera_and_composition: "Close dramatic workshop view around the anvil, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with fierce creative power.',
      rendering_and_quality: "Vivid glow with readable metal forms, kept consistent across the whole image.",
      key_features: 'plasma glow; burning runes; sparks; black forge',
    }, [], [
      'Hammering a sword that burns with cyan runes, a dwarf smith with a plasma torch for a hand forges a blade while the whole forge trembles under the blows. No readable text or logo.',
      'Proudly showing off his newest creation, a forge master has made a glowing rune spoon, and he is completely serious about its power. No readable text or logo.',
      'In a cold dark forge, a single blade on the anvil is still glowing with runes long after the fire has died. No readable text or logo.',
    ]),
    study('Solar Monastery Engine', 'sun-powered monastery machine', 'solar-engine', {
      aesthetic: 'Solar monastery engine: mountain monasteries built around vast golden mirror machines that gather sunlight, monks tending lenses, gears and prayer wheels.',
      subject_treatment: `${keep}; place the subject among golden sun-gathering mirrors and monastery machinery.`,
      color_and_tone: 'Blazing gold, white stone and deep sky blue.',
      lighting_and_shadow: "Concentrated sunbeams and brilliant reflections, kept consistent across the whole image.",
      texture_and_material: 'Polished brass mirrors, whitewashed stone and prayer flags.',
      camera_and_composition: 'High mountain view with beams converging on a point.',
      atmosphere_and_mood: 'Keep the requested mood with radiant ascetic devotion.',
      rendering_and_quality: "Clean luminous painting with strong beam geometry, kept consistent across the whole image.",
      key_features: 'mirror machines; converging sunbeams; mountain monastery; brass',
    }, [], [
      'Converging a hundred golden mirrors onto one point, monks on a mountain monastery focus the sun into a beam that holds back an approaching storm of shadow. No readable text or logo.',
      'Tending a huge sun-gathering mirror, a young monk has accidentally focused the beam on the abbot\'s breakfast, which is now very well cooked. No readable text or logo.',
      'At dusk on a mountain, every mirror of the sun engine has turned away from the setting sun and toward the dark valley. No readable text or logo.',
    ]),
    study('Clockwork Paladin Automaton', 'holy clockwork knight machine', 'clockwork-paladin', {
      aesthetic: 'Clockwork paladin automaton: mechanical holy knights of brass and enamel with visible gears in their chests, wound by a key, marching with ceremonial precision.',
      subject_treatment: `${keep}; render the subject as or beside a brass clockwork paladin with visible gearwork.`,
      color_and_tone: 'Polished brass, white enamel and deep red accents.',
      lighting_and_shadow: "Warm cathedral light glinting on metal, kept consistent across the whole image.",
      texture_and_material: "Gears, springs, engraved brass and enamel panels, kept consistent across the whole image.",
      camera_and_composition: "Heroic full-figure view with gear detail, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with uncanny mechanical faith.',
      rendering_and_quality: "Precise mechanical detail with clean finish, kept consistent across the whole image.",
      key_features: 'brass automaton; visible gears; winding key; holy knight',
    }, [], [
      'Marching through a burning city gate, a brass clockwork paladin with a winding key in its back shields a line of refugees with an enamel tower shield. No readable text or logo.',
      'Winding down in the middle of a heroic speech, a clockwork paladin freezes mid-gesture while a small goblin mechanic climbs up its back to turn the key. No readable text or logo.',
      'In a silent workshop, a half-built clockwork paladin sits on a bench, and its brass fingers are slowly curling on their own. No readable text or logo.',
    ]),
    study('Rune-Circuit Engraving', 'runes etched like circuit boards', 'rune-circuit', {
      aesthetic: 'Rune-circuit engraving: stone and metal surfaces carved with glowing rune tracks laid out like circuit boards, ancient magic wired like electronics.',
      subject_treatment: `${keep}; cover the subject or its surfaces with glowing circuit-like rune tracks.`,
      color_and_tone: 'Dark stone and bronze with glowing green or gold traces.',
      lighting_and_shadow: "Glow following the carved traces in darkness, kept consistent across the whole image.",
      texture_and_material: "Carved channels, metal inlay and glowing lines, kept consistent across the whole image.",
      camera_and_composition: "Close or medium view showing trace patterns, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with ancient technological mystery.',
      rendering_and_quality: "Crisp trace geometry with clean glow, kept consistent across the whole image.",
      key_features: 'circuit-like runes; glowing traces; carved stone; inlay',
    }, ['readable runes'], [
      'Waking in a dark vault, a stone golem lights up along glowing circuit-like rune tracks carved across its whole body, one line at a time. No readable text or logo.',
      "Wiring a stone door with glowing carved traces, a wizard realizes he has set it to open only when someone sneezes. No readable text or logo.",
      'Carved into a tomb floor, glowing rune tracks lead from every direction to a single point where the light has just gone out. No readable text or logo.',
    ]),
    study('Neon Sigil Siege Night', 'night siege lit by neon sigils', 'neon-sigil', {
      aesthetic: 'Neon sigil siege night: medieval sieges at night lit by floating neon sigils, glowing banners and electric wards over dark stone walls.',
      subject_treatment: `${keep}; set the subject in a night siege lit by floating neon sigils and wards.`,
      color_and_tone: 'Deep night blue and black with magenta and cyan sigil glow.',
      lighting_and_shadow: 'Neon glow across stone and armor, deep shadows.',
      texture_and_material: 'Wet stone, dark armor and glowing air symbols.',
      camera_and_composition: 'Wide night battle with glowing points of light.',
      atmosphere_and_mood: 'Keep the requested mood with electric nocturnal tension.',
      rendering_and_quality: "Clean glow with readable silhouettes, kept consistent across the whole image.",
      key_features: 'floating neon sigils; night siege; glowing wards; wet stone',
    }, ['readable symbols'], [
      'Hovering over a besieged fortress at night, a wall of magenta neon sigils absorbs a barrage of flaming stones as defenders cheer from the dark battlements. No readable text or logo.',
      'In the middle of a neon-lit night siege, one soldier tries to use a floating glowing sigil as a reading lamp. No readable text or logo.',
      "Hovering over a fortress at dawn, the neon wards have faded to ghosts of light, and the crows on the battlements are all sitting inside the shapes they left. No readable text or logo.",
    ]),
  ],
};

export default spec;
