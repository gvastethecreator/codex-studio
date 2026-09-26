import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Trading-card epic digital painting: scale comes from paint handling, light and atmosphere, not
// from a required heroic scene. Eight originals get card briefs; twelve new digital studies add
// backlight, aerial depth, textured brushes, spell glow, vistas, dual light, polished metal, haze,
// lightning, limited palettes, gold highlights and ember air.
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
  tags: [tag, 'portable-style-study'],
  dna: dna(fields),
  avoid: [...avoid, ...STYLE_AVOID],
  briefs,
});

const keep = 'Preserve the requested identity, proportions, pose and action';

const spec: Spec = {
  pack: 'pack_22',
  category: '2. Epic Digital Painting',
  updates: {
    'SP22-109': { briefs: [
      'A scarlet hornbill dives through a rain-bent canopy carrying a glowing ember-fruit, feathers carved in broad directional strokes that follow each plane. No readable text or logo.',
      'A stone troll heaves a boulder over a ravine bridge, its muscles built from chunky carved-looking marks. No readable text or logo.',
      'A war rhino in plated barding charges through a dust storm, every armor plate a single decisive stroke. No readable text or logo.',
    ] },
    'SP22-110': { briefs: [
      'A deep-sea repair diver braces beside a cracked blue beacon while a school of silver fish circles her, every surface modeled in dense velvety transitions. No readable text or logo.',
      'A vampire countess lifts a crystal goblet in a candlelit gallery, her satin gown rendered in smooth continuous tones. No readable text or logo.',
      'A sleeping snow leopard curls on a temple ledge, fur modeled so softly it seems warm to the touch. No readable text or logo.',
    ] },
    'SP22-111': { briefs: [
      'A colossal glacier shelf shears above a grove of rust-red trees, the ice reduced to a few broad structural planes around one glowing fracture. No readable text or logo.',
      'A giant stone colossus wades across a sea strait, its body built from clean faceted planes catching sunset light. No readable text or logo.',
      'A mountain fortress rises from clouds in bold planar shapes, sharp where rock meets sky and soft where mist swallows it. No readable text or logo.',
    ] },
    'SP22-112': { briefs: [
      'A lacquered kingfisher automaton bursts from a collapsed shrine, one enamel wing catching a narrow turquoise reflection. No readable text or logo.',
      'A samurai beetle in glossy red armor stands on a lily pad, its shell reflecting the whole pond in clean colored bands. No readable text or logo.',
      'A jade dragon coils around a lantern, each scale showing base color, reflected color and a crisp highlight. No readable text or logo.',
    ] },
    'SP22-113': { briefs: [
      'A red-sailed kite skiff banks between two storm towers while a rope-runner cuts a snagged line, captured in fast expressive value masses. No readable text or logo.',
      'A cavalry charge crashes into a shield wall, riders and dust compressed into a few long gestural strokes. No readable text or logo.',
      'A wizard duel lights a canyon at night, spells and figures blocked in with loose confident marks. No readable text or logo.',
    ] },
    'SP22-114': { briefs: [
      'A pale cave salamander slips through a basalt fissure carrying a blue mineral egg, the rock grain following each real surface. No readable text or logo.',
      'A dwarven miner lifts a geode that splits open into purple crystal, every mineral surface painted with restrained granular detail. No readable text or logo.',
      'A bronze golem kneels in a quarry, oxidized patches and chisel marks painted true to the metal. No readable text or logo.',
    ] },
    'SP22-115': { briefs: [
      'A masked bell-mender catches a falling bronze clapper on a suspended footbridge, her cloak dissolving into mist while the clapper stays sharp. No readable text or logo.',
      'A grieving knight kneels at a grave in fog, his armor edges lost into the grey air except for one gleaming gauntlet. No readable text or logo.',
      'A ghostly deer steps out of a snowstorm, only its eye and antler tips found against soft lost edges. No readable text or logo.',
    ] },
    'SP22-116': { briefs: [
      'A green-cloaked reed courier steers a parcel raft through a breached irrigation gate in matte opaque digital gouache. No readable text or logo.',
      'A band of halfling adventurers crosses a rope bridge over a jungle gorge, all compact simplified volumes in matte color. No readable text or logo.',
      "A balloon merchant floats over a patchwork of farm fields with a basket full of kites, all painted in soft low-contrast opaque planes. No readable text or logo.",
    ] },
  },
  creates: [
    study('Backlit Halo Hero', 'strong backlight silhouette painting', 'backlit-halo', {
      aesthetic: 'Backlit halo hero: digital painting where a powerful light behind the subject carves a glowing halo around its silhouette while the front sits in rich shadow.',
      subject_treatment: `${keep}; keep the subject readable as a strong silhouette with a glowing rim and softly lit front details.`,
      color_and_tone: 'Warm or cold blazing backlight against deep shadowed midtones on the subject.',
      lighting_and_shadow: 'Intense rim light and light bloom around edges, gentle bounce light in the shadowed front.',
      texture_and_material: 'Glowing hair and fabric edges, atmospheric haze catching light and soft painted shadows.',
      camera_and_composition: 'Preserve the requested framing with the light source behind the focal subject.',
      atmosphere_and_mood: 'Keep the requested mood, lifted by radiant drama.',
      rendering_and_quality: 'Clean painterly rendering with controlled bloom and crisp rim edges.',
      key_features: 'blazing backlight; glowing rim halo; shadowed front; light bloom',
    }, ['flat front lighting'], [
      'A paladin stands before a rising sun on a battlefield, her armor edges burning white while her face stays calm in shadow. No readable text or logo.',
      'A tiny fox sits on a hill in front of a full moon, every hair of its outline glowing silver. No readable text or logo.',
      'A dragon lands in front of an erupting volcano, its wing membranes glowing orange from the fire behind. No readable text or logo.',
    ]),
    study('Aerial Perspective Layers', 'atmospheric depth value layering', 'aerial-layers', {
      aesthetic: 'Aerial perspective layers: epic depth built from stacked value layers, each farther plane lighter and bluer until distant mountains melt into sky.',
      subject_treatment: `${keep}; place the subject in the crisp foreground layer and let space recede behind it in fading planes.`,
      color_and_tone: 'Saturated dark foreground fading through cooler mid-planes to pale blue distance.',
      lighting_and_shadow: 'Sunlit haze between planes, contrast decreasing with distance.',
      texture_and_material: 'Detailed foreground texture fading to smooth simplified far planes.',
      camera_and_composition: 'Preserve the requested framing with clear foreground, middle and far layers.',
      atmosphere_and_mood: 'Keep the requested mood with vast breathing space.',
      rendering_and_quality: 'Controlled value layering and clean edges between planes.',
      key_features: 'stacked value planes; blue distance; fading contrast; vast depth',
    }, ['flat depthless background'], [
      'A lone ranger looks out from a pine ridge over seven mountain ranges, each paler and bluer than the last. No readable text or logo.',
      'A caravan of elephants crosses a valley as distant cliffs dissolve into pale haze behind them. No readable text or logo.',
      "A sky city floats above layered cloud banks at dawn, each bank paler and bluer until the farthest fade into a pale morning horizon. No readable text or logo.",
    ]),
    study('Textured Brush Concept', 'textured digital brush concept art', 'textured-brush', {
      aesthetic: 'Textured brush concept: digital painting built with gritty textured brushes, leaving visible rough marks that suggest detail without rendering everything.',
      subject_treatment: `${keep}; describe the subject with textured brush marks that suggest material and form economically.`,
      color_and_tone: 'Earthy or moody concept palettes with a few saturated accent colors.',
      lighting_and_shadow: 'Clear key light shapes with textured shadow masses.',
      texture_and_material: 'Gritty chalky brush marks, speckled edges and broken dry strokes.',
      camera_and_composition: 'Preserve the requested framing with focal detail and loose edges.',
      atmosphere_and_mood: 'Keep the requested mood with a raw, exploratory energy.',
      rendering_and_quality: 'Selective finish, detail concentrated at the focal point.',
      key_features: 'gritty textured brushes; suggested detail; loose edges; focal finish',
    }, ['uniform airbrush smoothness'], [
      'A war golem stomps through a burning village, its stone body roughed in with gritty speckled brush marks. No readable text or logo.',
      'A bounty hunter leans on a crashed airship, the wreck suggested by loose chalky strokes around a sharply finished face. No readable text or logo.',
      "A swamp witch's hut on huge chicken legs wades through thick fog, textured gritty brushes suggesting every shingle, lantern and hanging charm. No readable text or logo.",
    ]),
    study('Spell-Glow Particle Paint', 'glowing magic particle painting', 'spell-glow', {
      aesthetic: 'Spell-glow particle paint: digital painting where glowing magic, sparks and floating particles become the main light source, lighting faces and surfaces with colored glow.',
      subject_treatment: `${keep}; let glowing energy or particles near the subject light it from within the scene.`,
      color_and_tone: 'Dark surroundings with vivid glowing cyan, violet, gold or green magic light.',
      lighting_and_shadow: 'Colored glow falling onto nearby surfaces, soft falloff into darkness.',
      texture_and_material: 'Floating sparks, luminous trails, glowing runes without letters and lit dust.',
      camera_and_composition: 'Preserve the requested framing with the glow source near the focal point.',
      atmosphere_and_mood: 'Keep the requested mood with mysterious magical radiance.',
      rendering_and_quality: 'Controlled glow with crisp sparks, never blown-out overexposure.',
      key_features: 'magic as light source; floating sparks; colored glow falloff; dark surroundings',
    }, ['overexposed white glow', 'readable runes'], [
      'A young necromancer cups a swirl of green sparks that light her face and the skulls stacked behind her. No readable text or logo.',
      'A druid raises a staff and a spiral of golden fireflies lights the whole midnight forest around him. No readable text or logo.',
      "A thief opens a treasure chest in a dark crypt and violet particles pour out like a waterfall, lighting her startled grin and the gold coins. No readable text or logo.",
    ]),
    study('Wide Cinematic Vista', 'panoramic epic environment painting', 'cinematic-vista', {
      aesthetic: 'Wide cinematic vista: sweeping environment painting where the landscape is the hero and figures are tiny, with dramatic skies and epic scale.',
      subject_treatment: `${keep}; show the subject within a vast environment so scale and place dominate.`,
      color_and_tone: 'Cinematic color grading with warm key light and cool atmospheric shadows.',
      lighting_and_shadow: 'Dramatic sky light, god rays and large cast shadows across the land.',
      texture_and_material: 'Detailed terrain, clouds, water and architecture painted at many scales.',
      camera_and_composition: 'Preserve the requested framing, favoring wide shots with low horizons.',
      atmosphere_and_mood: 'Keep the requested mood with awe-inspiring scale and space.',
      rendering_and_quality: 'Polished environment painting with coherent perspective and light.',
      key_features: 'vast landscape; tiny figures; dramatic sky; cinematic grading',
    }, ['cropped close-up'], [
      'A single traveler stands at the edge of a canyon where an ancient city is carved into both walls for miles. No readable text or logo.',
      'A fleet of airships crosses a sunset over an endless sea of waterfalls pouring off floating islands. No readable text or logo.',
      'A tiny lantern procession climbs a mountain stair toward a temple lit by a colossal moon. No readable text or logo.',
    ]),
    study('Warm-Cold Dual Light', 'two-temperature lighting painting', 'dual-light', {
      aesthetic: 'Warm-cold dual light: every form lit by two opposing light temperatures, warm orange from one side and cold blue from the other, meeting on the subject.',
      subject_treatment: `${keep}; light the subject from two sides in warm and cold light so its form reads clearly.`,
      color_and_tone: 'Warm orange and cool cyan-blue lights with neutral transitions where they meet.',
      lighting_and_shadow: 'Two clear light sources, split temperature shadows and colored rim edges.',
      texture_and_material: 'Surfaces showing both warm and cool highlights, especially metal and skin.',
      camera_and_composition: 'Preserve the requested framing with light sources implied on either side.',
      atmosphere_and_mood: 'Keep the requested mood with dramatic tension between the lights.',
      rendering_and_quality: 'Clean temperature-driven modeling of form, never muddy mixed color.',
      key_features: 'warm key light; cold opposing light; split temperatures; colored rims',
    }, ['single flat light'], [
      'A mercenary sits between a campfire and a moonlit window, her face split between orange warmth and blue cold. No readable text or logo.',
      'A dragon guards its hoard, gold glinting warm below while cold cave light falls from above. No readable text or logo.',
      'Two rival mages face off, one lit by fire and one by ice, the light meeting on the blade between them. No readable text or logo.',
    ]),
    study('Polished Armor Gleam', 'reflective metal painting', 'armor-gleam', {
      aesthetic: 'Polished armor gleam: digital painting focused on mirror-polished metal, where armor, weapons and machines reflect their surroundings in crisp distorted highlights.',
      subject_treatment: `${keep}; render metal surfaces with accurate reflections of the environment while keeping forms clear.`,
      color_and_tone: 'Steel, gold or bronze reflecting sky blues and environment colors with sharp white speculars.',
      lighting_and_shadow: 'Hard specular highlights, reflected environment bands and deep contrast.',
      texture_and_material: 'Mirror metal, engraved details, scratches and small reflections of the scene.',
      camera_and_composition: 'Preserve the requested framing with the metal surface prominent.',
      atmosphere_and_mood: 'Keep the requested mood with gleaming heroic grandeur throughout.',
      rendering_and_quality: 'Precise reflective rendering with believable curved distortion everywhere.',
      key_features: 'mirror metal; environment reflections; sharp speculars; engraved detail',
    }, ['matte plastic armor'], [
      'A knight in mirror armor stands in a sunflower field, the whole field reflected curved across her breastplate. No readable text or logo.',
      "A golden mechanical dragon folds its wings on a mountain peak, each polished plate reflecting the purple storm clouds gathering above it. No readable text or logo.",
      'A silver war helm lies on a battlefield, reflecting the tiny figures of victorious soldiers walking away. No readable text or logo.',
    ]),
    study('Ethereal Glow Haze', 'soft luminous haze painting', 'glow-haze', {
      aesthetic: 'Ethereal glow haze: soft luminous digital painting where light blooms through haze, edges soften and the whole image seems to glow from within.',
      subject_treatment: `${keep}; wrap the subject in soft glowing haze while keeping its silhouette and key features readable.`,
      color_and_tone: 'Pale luminous pastels, soft golds and silvery blues with gentle contrast.',
      lighting_and_shadow: 'Diffused glowing light, bloom around bright areas and very soft shadows.',
      texture_and_material: 'Hazy air, soft edges, glowing particles and delicate translucent surfaces.',
      camera_and_composition: 'Preserve the requested framing with a bright glowing center.',
      atmosphere_and_mood: 'Keep the requested mood with a dreamy sacred quality.',
      rendering_and_quality: 'Soft controlled glow, never washed out or blurry.',
      key_features: 'luminous haze; bloom around lights; soft edges; inner glow',
    }, ['harsh contrast', 'muddy blur'], [
      "An angel descends slowly into a misty cathedral nave, her enormous wings dissolving into golden haze that fills every arch above the pews. No readable text or logo.",
      'A unicorn drinks from a moonlit pool that glows as if the water were made of light. No readable text or logo.',
      'A spirit of spring walks through a blossoming orchard where every petal glows in the morning haze. No readable text or logo.',
    ]),
    study('Lightning-Lit Drama', 'storm lightning illumination painting', 'lightning-lit', {
      aesthetic: 'Lightning-lit drama: scenes lit by a single blinding lightning flash, freezing rain and figures in stark blue-white light against a black storm.',
      subject_treatment: `${keep}; light the subject by a lightning flash so it stands out in hard blue-white relief.`,
      color_and_tone: 'Black storm, electric blue-white light and small warm accents from fire or lamps.',
      lighting_and_shadow: 'Instant hard flash lighting, long shadows and bright rain streaks.',
      texture_and_material: 'Frozen raindrops, wet surfaces, whipping cloth and branching lightning.',
      camera_and_composition: 'Preserve the requested framing with lightning in or implied by the frame.',
      atmosphere_and_mood: 'Keep the requested mood with explosive storm tension.',
      rendering_and_quality: 'Crisp stark lighting and frozen motion, never soft ambient light.',
      key_features: 'lightning flash lighting; frozen rain; black storm; stark relief',
    }, ['sunny calm weather'], [
      'A warlock on a clifftop raises his arms as lightning strikes behind him, every raindrop frozen in the flash. No readable text or logo.',
      'A sea serpent rises beside a sinking ship, revealed for one instant by a blinding bolt. No readable text or logo.',
      'A horseman gallops across a moor, horse and rider frozen mid-stride in a single blue flash. No readable text or logo.',
    ]),
    study('Limited Triad Palette', 'three-color limited palette painting', 'triad-palette', {
      aesthetic: 'Limited triad palette: digital painting restricted to three chosen hues and their mixes, giving strong unified color harmony and bold graphic clarity.',
      subject_treatment: `${keep}; paint the subject using only three hues and their mixtures while keeping it recognizable.`,
      color_and_tone: 'Three chosen hues such as teal, coral and ochre, mixed into a cohesive palette.',
      lighting_and_shadow: 'Light and shadow expressed by shifting between the three hues.',
      texture_and_material: 'Clean painterly strokes, subtle brush texture and unified color throughout.',
      camera_and_composition: 'Preserve the requested framing with color blocking guiding the eye.',
      atmosphere_and_mood: 'Keep the requested mood with harmonious designed color.',
      rendering_and_quality: 'Disciplined color with clear values, never random extra hues.',
      key_features: 'three-hue palette; unified harmony; color-driven values; clean strokes',
    }, ['full rainbow palette'], [
      'A tiger stalks through a jungle painted only in teal, coral and ochre, its stripes the darkest mix. No readable text or logo.',
      "A lighthouse battles a storm painted only in violet, cream and rust, the waves the darkest mix and the beam the palest one. No readable text or logo.",
      "A samurai frog meditates on a lily pad in a quiet pond painted only in green, pink and gold, his sword resting across his knees. No readable text or logo.",
    ]),
    study('Gold-Leaf Highlight Paint', 'painting with gold highlight accents', 'gold-highlights', {
      aesthetic: 'Gold-leaf highlight paint: rich painting where highlights, edges and ornaments are picked out in metallic gold, giving a luxurious illuminated card look.',
      subject_treatment: `${keep}; paint the subject normally and pick out its brightest edges and ornaments in gold.`,
      color_and_tone: 'Deep jewel colors such as emerald, sapphire and burgundy with shining gold accents.',
      lighting_and_shadow: 'Rich painted modeling with gold catching and reflecting the light.',
      texture_and_material: 'Metallic gold edges, ornamental filigree, subtle leaf texture and glossy paint.',
      camera_and_composition: 'Preserve the requested framing with gold leading the eye to the focal point.',
      atmosphere_and_mood: 'Keep the requested mood with opulent ceremonial richness.',
      rendering_and_quality: 'Controlled gold accents on a polished painting, never gold everywhere.',
      key_features: 'gold highlight edges; jewel-tone base; filigree accents; luxurious finish',
    }, ['gold covering everything', 'readable text'], [
      'A peacock sorceress spreads her train, every feather eye outlined in gold over deep emerald and sapphire. No readable text or logo.',
      "A sleeping dragon curls around a pile of goblets, its burgundy scales painted with gold catching the edge of each one like a crown. No readable text or logo.",
      'A cathedral knight kneels, the rim of her shield and her halo picked out in shining gold. No readable text or logo.',
    ]),
    study('Dust-and-Ember Air', 'particulate atmosphere painting', 'ember-air', {
      aesthetic: 'Dust-and-ember air: scenes thick with floating dust, ash, sparks and embers that catch the light and fill the air with depth and heat.',
      subject_treatment: `${keep}; surround the subject with floating particles that catch light without hiding it.`,
      color_and_tone: 'Warm amber and ash grey with glowing orange embers and dim smoky shadows.',
      lighting_and_shadow: 'Light shafts full of particles, glowing embers as tiny light sources.',
      texture_and_material: 'Floating dust motes, drifting ash, sparks, smoke and gritty surfaces.',
      camera_and_composition: 'Preserve the requested framing with particles at several depths.',
      atmosphere_and_mood: 'Keep the requested mood with heat, aftermath and gritty drama.',
      rendering_and_quality: 'Layered particles with depth of field, never flat noise overlay.',
      key_features: 'floating embers; dust in light shafts; drifting ash; layered depth',
    }, ['clean clear air', 'noise overlay'], [
      'A blacksmith giant hammers a sword while embers swirl up through shafts of forge light around him. No readable text or logo.',
      'A survivor walks out of a burned city as ash drifts down like snow and embers glow on the ground. No readable text or logo.',
      'A cavalry charge thunders across a dry plain, dust exploding into golden shafts of evening light. No readable text or logo.',
    ]),
  ],
};

export default spec;
