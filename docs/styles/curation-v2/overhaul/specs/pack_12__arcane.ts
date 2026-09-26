import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Video game originals vault, arcane temples and mythic realms: in-game screenshot looks. The ten
// originals get original card briefs; ten new descriptor-named capture looks add floating sky
// temples, prism chapel puzzles, summoning cutscenes, jungle ziggurat platformers, spirit-world
// shifts, underwater temple dives, cloud monastery glides, crystal cave side-views, cosmic library
// portals and moon temple night trials.
const capture = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  avoid: string[],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'game-capture', 'portable-style-study'],
  dna: dna(fields),
  avoid: [...avoid, 'existing game characters, logos or levels', 'readable interface text', 'gore', ...STYLE_AVOID],
  briefs,
});

const keep = 'Preserve the requested identity, count, pose and action with original characters';

const spec: Spec = {
  pack: 'pack_12',
  category: '2. Arcane Temples & Mythic Realms',
  updates: {
    'SP12-006': { briefs: [
      'Leaping between towering bookshelves in a side-scrolling gothic library, an original shardbound heroine casts a spear of blue flame at a winged librarian demon whose robes are made of open pages. No readable text or logo.',
      'In an ornate side-view library, a fearsome book-golem boss is defeated and immediately starts reorganizing its own scattered pages alphabetically. No readable text or logo.',
      'Along a gothic library corridor, one bookshelf is slightly out of line with the others, and a thin red light glows from the gap behind it. No readable text or logo.',
    ] },
    'SP12-013': { briefs: [
      'Sliding down a monumental dune at sunset, a tiny cloaked pilgrim trails a glowing scarf as flying cloth creatures ripple through the golden air around a distant mountain beam. No readable text or logo.',
      'Across an endless golden desert, a small cloaked traveler has been walking for hours toward the mountain and has just realized it is painted on a wall. No readable text or logo.',
      'On a vast silent dune, two small cloaked figures meet for the first time and simply stand side by side watching the light. No readable text or logo.',
    ] },
    'SP12-015': { briefs: [
      'Blasting through a biomechanical ruin in retro side-view, an original scientist in a lab coat fires a glitch beam that warps a towering alien sentinel into scrambled pixels. No readable text or logo.',
      'In a retro alien temple, a lone explorer finds an ancient powerful weapon that turns out to be a very advanced drill for opening coconuts. No readable text or logo.',
      'Deep in a side-view alien ruin, a wall of machinery hums, and one pixel-glitched section is slowly spreading across the corridor. No readable text or logo.',
    ] },
    'SP12-020': { briefs: [
      'Steaming through a black starry void from a top-down view, an original locomotive with a lantern prow approaches a port built on the back of a sleeping celestial whale. No readable text or logo.',
      'Seen from above in the black void, a space-train captain proudly trades his entire cargo for a single very rare jar of honey. No readable text or logo.',
      'From above in the dark void, a space-train passes a lonely lighthouse station whose light is shining back toward the stars. No readable text or logo.',
    ] },
    'SP12-028': { briefs: [
      'Crossing blades on a temple rooftop in falling snow, an original shinobi deflects a giant spear-monk as sparks light up the curved tiles and the vast valley below. No readable text or logo.',
      'On a temple rooftop duel, a serious shinobi and his opponent both pause to politely let an old monk sweep the snow between them. No readable text or logo.',
      'On a snowy temple roof at dusk, a single set of footprints stops at the edge, and a grappling line hangs taut into the fog below. No readable text or logo.',
    ] },
    'SP12-044': { briefs: [
      'Sprinting across a theatrical palace ballroom in bold red and black, an original masked thief leaps over a giant chandelier as shadowy guards in porcelain masks fill the stairs. No readable text or logo.',
      'In a flashy palace heist, a stylish masked thief strikes a dramatic pose while the actual treasure is being carried off by a cat behind him. No readable text or logo.',
      'In a red and black palace hallway, every portrait wears the same porcelain mask, and one mask is missing from its frame. No readable text or logo.',
    ] },
    'SP12-053': { briefs: [
      'Wading through a misty bog at the edge of a wet village, an original monster hunter with twin silver blades confronts a coven of three witches who share one glowing eye. No readable text or logo.',
      'In a grim swamp village, a hardened monster hunter is hired for a terrifying contract that turns out to be finding a lost goat. No readable text or logo.',
      'Deep in a foggy swamp, a ring of hanging charms clinks in the wind, though the reeds all around are perfectly still. No readable text or logo.',
    ] },
    'SP12-055': { briefs: [
      'Standing in a saturated orchid garden in first person, an original solver traces a glowing line on a stone panel as the whole island\'s trees align to form the same shape. No readable text or logo.',
      'On a bright puzzle island, a solver spends an hour on one panel before realizing the answer was drawn by the shadows of the flowers all along. No readable text or logo.',
      'From a first-person view in a silent garden, the shadows of three statues form a line that points directly back at the player. No readable text or logo.',
    ] },
    'SP12-061': { briefs: [
      'Painting a stroke across the sky with a celestial brush, an original white wolf spirit makes the sun rise over a jade volcano shrine, ink-wash petals bursting from every step. No readable text or logo.',
      'In an ink-wash painted village, a divine wolf tries to restore a withered tree with a brush stroke and accidentally paints a moustache on the moon. No readable text or logo.',
      'In a sumi-e shrine at night, a single ink stroke on the ground slowly spreads, drawing a path that leads into the volcano. No readable text or logo.',
    ] },
    'SP12-070': { briefs: [
      'Drawing a bow in slow motion while leaping off a cliff shrine, an original ranger lines up a shot at a glowing guardian whose single eye is locking on in clean cel-shaded light. No readable text or logo.',
      'On a windy open plateau, a heroic adventurer finally solves an ancient shrine trial whose reward is a single roasted apple. No readable text or logo.',
      'On a quiet open plain at dusk, an ancient guardian machine lies overgrown with moss, and its eye flickers once as the player passes. No readable text or logo.',
    ] },
  },
  creates: [
    capture('Floating-Island Sky Temple Capture', 'sky island adventure screenshot', 'sky-temple', {
      aesthetic: 'Floating-island sky temple capture: an original third-person adventure screenshot of temples on floating islands, waterfalls pouring into clouds and gliding heroes.',
      subject_treatment: `${keep}; show the subject exploring or gliding between floating temple islands.`,
      color_and_tone: 'Sky blue, cloud white, mossy green and warm stone.',
      lighting_and_shadow: "Bright sun with soft cloud shadows, kept consistent across the whole image.",
      texture_and_material: "Ancient stone, moss, waterfalls and cloth gliders, kept consistent across the whole image.",
      camera_and_composition: "Wide third-person camera with vertical depth, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with airy wonder, kept consistent across the whole image.",
      rendering_and_quality: "Clean real-time capture with no HUD text, kept consistent across the whole image.",
      key_features: 'floating islands; sky temples; waterfalls into clouds; gliding',
    }, [], [
      'Gliding off the edge of a floating temple, an original adventurer drifts toward a colossal stone guardian that is slowly waking on the next island, waterfalls pouring into the clouds below. No readable text or logo.',
      'Standing proudly at the top of a sky temple after a long climb, a hero realizes the treasure chest is on the island next door. No readable text or logo.',
      "Drifting at sunset beside the others, one small island has no waterfall and no temple, only a single open door standing on its edge. No readable text or logo.",
    ]),
    capture('Prism Chapel Puzzle Capture', 'light-refraction puzzle screenshot', 'prism-puzzle', {
      aesthetic: 'Prism chapel puzzle capture: an original first-person puzzle screenshot in a chapel where beams of colored light are bent through prisms onto ancient symbols.',
      subject_treatment: `${keep}; place the subject among beams of colored light redirected through prisms.`,
      color_and_tone: 'Dim stone with pure red, green and blue light beams.',
      lighting_and_shadow: "Sharp colored beams and glowing targets, kept consistent across the whole image.",
      texture_and_material: 'Crystal prisms, polished stone and dust in the air.',
      camera_and_composition: "First-person view along the beam paths, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with quiet clever discovery.',
      rendering_and_quality: "Clean puzzle capture with no readable text, kept consistent across the whole image.",
      key_features: 'colored beams; prisms; symbol targets; chapel',
    }, ['readable runes'], [
      'Rotating a crystal prism in a dusty chapel, an original solver splits a beam into red, green and blue, and a sealed stone door begins to rise as the last symbol lights up. No readable text or logo.',
      'After solving a complex light puzzle in a chapel, a player is rewarded with a secret room containing another, even harder light puzzle. No readable text or logo.',
      "Split by a prism in a dim chapel, a beam of light casts a rainbow on the wall, and one color in it has never been seen before. No readable text or logo.",
    ]),
    capture('Summoning Circle Cutscene Capture', 'in-engine summoning cutscene', 'summon-cutscene', {
      aesthetic: 'Summoning circle cutscene capture: an original in-engine cutscene frame of a magical summoning, glowing circles, swirling particles and a huge creature emerging.',
      subject_treatment: `${keep}; frame the subject as a summoner or summoned creature in a dramatic cutscene.`,
      color_and_tone: "Dark surroundings with bright magical circle glow, kept consistent across the whole image.",
      lighting_and_shadow: 'Glow from the circle lighting faces from below.',
      texture_and_material: "Particle swirls, stone floors and flowing robes, kept consistent across the whole image.",
      camera_and_composition: "Cinematic low angle toward the emerging creature, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with awe-struck spectacle, kept consistent across the whole image.",
      rendering_and_quality: "Polished cutscene look with no subtitles, kept consistent across the whole image.",
      key_features: 'glowing summoning circle; emerging creature; particles; cutscene',
    }, ['subtitles or readable glyphs'], [
      'Rising from a glowing circle in a ruined cathedral, a colossal flame phoenix spreads its wings above an original summoner whose robes whip upward in the magical wind. No readable text or logo.',
      'In an epic summoning cutscene, a mighty sorcerer calls forth his legendary beast, and a small fluffy sheep appears in the glowing circle. No readable text or logo.',
      'In a dark chamber, a summoning circle glows on the floor with nothing inside it, yet the candles around it are bending inward. No readable text or logo.',
    ]),
    capture('Jungle Ziggurat Platformer Capture', 'jungle temple platform game screenshot', 'jungle-ziggurat', {
      aesthetic: 'Jungle ziggurat platformer capture: an original side-scrolling platformer screenshot of stepped jungle temples, vines, spike traps and rolling boulders.',
      subject_treatment: `${keep}; show the subject leaping through a side-scrolling jungle temple.`,
      color_and_tone: 'Lush greens, warm stone ochre and golden treasure.',
      lighting_and_shadow: "Dappled jungle light and dark temple interiors, kept consistent across the whole image.",
      texture_and_material: "Carved stone, vines, water and wooden traps, kept consistent across the whole image.",
      camera_and_composition: "Side-on platform layout with multiple levels, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with adventurous peril, kept consistent across the whole image.",
      rendering_and_quality: "Clean colorful game capture, kept consistent across the whole image.",
      key_features: 'stepped temple; vines; spike traps; side-scrolling',
    }, [], [
      'Swinging on a vine across a spiked pit in a stepped jungle temple, an original explorer grabs a golden idol as a boulder crashes through the wall behind her. No readable text or logo.',
      'In a side-scrolling jungle temple, the explorer carefully avoids every trap and then trips over a sleeping capybara. No readable text or logo.',
      'Deep inside a side-scrolling temple, the torches light a corridor of carved faces, and each face has its eyes turned toward the exit. No readable text or logo.',
    ]),
    capture('Spirit-World Shift Capture', 'dual-realm world shift screenshot', 'spirit-shift', {
      aesthetic: 'Spirit-world shift capture: an original screenshot where the image is split between the living world and a glowing spirit realm, the same place shown in both states.',
      subject_treatment: `${keep}; split the subject between a living realm and a glowing spirit realm.`,
      color_and_tone: 'Warm natural half and cold glowing violet-teal half.',
      lighting_and_shadow: "Normal daylight versus ethereal glow, kept consistent across the whole image.",
      texture_and_material: "Solid materials versus translucent ghostly versions, kept consistent across the whole image.",
      camera_and_composition: "Split or ripple transition across the frame, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with uncanny duality, kept consistent across the whole image.",
      rendering_and_quality: "Clean effect with clear dual reading, kept consistent across the whole image.",
      key_features: 'split realms; ghostly glow; same place twice; ripple transition',
    }, [], [
      'Stepping through a ripple in the air, an original warrior crosses from a sunny village into its spirit version, where the houses are ruins and giant ghost fish swim through the sky. No readable text or logo.',
      'Switching to the spirit realm, a hero discovers that the ghost version of his house is much cleaner than the real one. No readable text or logo.',
      'Split between two realms, a bridge exists only in the spirit world, and the player is standing halfway across it. No readable text or logo.',
    ]),
    capture('Underwater Temple Dive Capture', 'sunken temple exploration screenshot', 'underwater-temple', {
      aesthetic: 'Underwater temple dive capture: an original third-person diving screenshot through a sunken temple, god rays, schools of fish, coral-covered statues and air bubbles.',
      subject_treatment: `${keep}; show the subject diving through a sunken temple with bubbles and light rays.`,
      color_and_tone: "Deep teal, turquoise light and coral pinks, kept consistent across the whole image.",
      lighting_and_shadow: "Caustic god rays from the surface, kept consistent across the whole image.",
      texture_and_material: "Coral, weathered stone, bubbles and kelp, kept consistent across the whole image.",
      camera_and_composition: "Third-person behind the diver into depth, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with serene deep mystery.',
      rendering_and_quality: "Clean underwater capture with no HUD text, kept consistent across the whole image.",
      key_features: 'sunken temple; god rays; fish schools; bubbles',
    }, [], [
      'Swimming through the flooded gate of a coral temple, an original diver follows a school of silver fish toward a vast statue whose stone eyes are opening beneath the god rays. No readable text or logo.',
      'Exploring a sunken temple, a diver finally finds the legendary treasure chest and discovers an octopus has been living in it for years. No readable text or logo.',
      'Deep in a dark sunken temple, the diver\'s bubbles are rising straight up, but a second trail of bubbles is rising from behind the statue. No readable text or logo.',
    ]),
    capture('Cloud Monastery Glide Capture', 'mountain monastery gliding screenshot', 'cloud-glide', {
      aesthetic: 'Cloud monastery glide capture: an original third-person gliding screenshot over mountain monasteries in a sea of clouds, prayer flags, bells and wind currents.',
      subject_treatment: `${keep}; show the subject gliding on the wind above cloud-wrapped monasteries.`,
      color_and_tone: 'Soft whites, sky blue and saffron prayer flags.',
      lighting_and_shadow: "Golden morning light over the cloud sea, kept consistent across the whole image.",
      texture_and_material: "Cloth wings, stone temples and swirling mist, kept consistent across the whole image.",
      camera_and_composition: "Wide chase view over the cloud sea, kept consistent across the whole image.",
      atmosphere_and_mood: "Keep the requested mood with serene freedom, kept consistent across the whole image.",
      rendering_and_quality: "Clean airy real-time capture, kept consistent across the whole image.",
      key_features: 'gliding; sea of clouds; mountain monasteries; prayer flags',
    }, [], [
      'Riding a wind current over a sea of clouds, an original monk on cloth wings glides past bells ringing on mountain peaks as a giant sky whale surfaces from the mist. No readable text or logo.',
      'Gliding gracefully over mountain monasteries, a young monk lands perfectly on a rooftop and then realizes it is the wrong monastery. No readable text or logo.',
      'Above the sea of clouds, one monastery bell rings by itself, and the prayer flags all turn toward it at once. No readable text or logo.',
    ]),
    capture('Crystal Cave Side-View Capture', 'crystal cavern exploration screenshot', 'crystal-cave', {
      aesthetic: 'Crystal cave side-view capture: an original side-view exploration screenshot through glowing crystal caverns, reflective pools, hidden passages and tiny adventurers.',
      subject_treatment: `${keep}; show the subject small in a glowing side-view crystal cavern.`,
      color_and_tone: 'Deep indigo with glowing cyan, pink and violet crystals.',
      lighting_and_shadow: "Crystal glow reflecting on water, kept consistent across the whole image.",
      texture_and_material: "Faceted crystal, wet rock and still pools, kept consistent across the whole image.",
      camera_and_composition: "Side-view cross-section of cave chambers, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with lonely glowing wonder.',
      rendering_and_quality: "Clean side-view capture with no HUD, kept consistent across the whole image.",
      key_features: 'glowing crystals; cave cross-section; reflective pools; tiny explorer',
    }, [], [
      'Descending through a side-view cavern of glowing crystals, an original tiny explorer discovers a crystal dragon asleep in a reflective pool far below. No readable text or logo.',
      'In a glowing crystal cave, an explorer mines one small crystal and the whole cave dims in protest. No readable text or logo.',
      'In a side-view crystal cavern, the reflection in the pool shows a second explorer walking in the opposite direction. No readable text or logo.',
    ]),
    capture('Cosmic Library Portal Capture', 'magical library portal screenshot', 'cosmic-library', {
      aesthetic: 'Cosmic library portal capture: an original screenshot of an infinite magical library where bookshelves open into starfields, floating books and portal doorways.',
      subject_treatment: `${keep}; place the subject in an infinite library where shelves open into space.`,
      color_and_tone: 'Warm wood and gold against deep starfield blues.',
      lighting_and_shadow: "Candlelight mixed with cosmic glow, kept consistent across the whole image.",
      texture_and_material: "Old wood, leather books and swirling nebula, kept consistent across the whole image.",
      camera_and_composition: "Third-person view down endless shelves, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with scholarly cosmic awe.',
      rendering_and_quality: "Clean capture with no readable book titles, kept consistent across the whole image.",
      key_features: 'infinite shelves; floating books; starfield portals; candlelight',
    }, ['readable book titles'], [
      'Reaching for a floating book in an endless library, an original scholar opens it and a portal to a spinning galaxy unfolds across the shelves around her. No readable text or logo.',
      "Chasing an overdue book through the endless shelves, a librarian watches it escape through a portal into a swirling starfield. No readable text or logo.",
      'Down an endless aisle of shelves, one gap where a book is missing shows only darkness with a single star in it. No readable text or logo.',
    ]),
    capture('Moon Temple Night Trial Capture', 'moonlit temple challenge screenshot', 'moon-temple', {
      aesthetic: 'Moon temple night trial capture: an original third-person trial screenshot in a moonlit temple, silver light pools, moving moon mirrors and shadow platforms.',
      subject_treatment: `${keep}; show the subject in a moonlit temple trial with silver light and shifting shadows.`,
      color_and_tone: "Silver moonlight, deep blue and pale stone, kept consistent across the whole image.",
      lighting_and_shadow: "Moonbeams redirected by mirrors, sharp shadows, kept consistent across the whole image.",
      texture_and_material: "Pale stone, silver mirrors and water, kept consistent across the whole image.",
      camera_and_composition: "Third-person view across the trial chamber, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with hushed lunar ritual.',
      rendering_and_quality: "Clean capture with no HUD text, kept consistent across the whole image.",
      key_features: 'moonlit temple; silver mirrors; shadow platforms; trial chamber',
    }, [], [
      'Leaping across platforms that only exist in shadow, an original acolyte races through a moon temple as silver mirrors rotate the moonbeam onto a sleeping stone owl. No readable text or logo.',
      "Waiting patiently in a silver-lit trial chamber, a hero needs a cloud to move so the night light will reveal the next platform. No readable text or logo.",
      'In a silver-lit temple, the moonbeam falls on an empty altar, and a shadow of a kneeling figure appears where no one is kneeling. No readable text or logo.',
    ]),
  ],
};

export default spec;
