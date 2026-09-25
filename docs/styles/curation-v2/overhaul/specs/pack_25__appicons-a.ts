import type { Spec } from '../tools/apply';
import { design } from './_design';

// App & illustrative icons (part A): R-APP-01..10. One illustrative construction per app icon.
const A = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
) => design(name, domain, tag, 'app-icon', fields, avoid, briefs, { text: false, source });

const spec: Spec = {
  pack: 'pack_25',
  category: '3. App & Illustrative Icons',
  newCategory: { id: 'app-and-illustrative-icons' },
  updates: {},
  creates: [
    A(
      'R-APP-01',
      'Folded Silhouette Icons',
      'folded sheet app icon',
      'folded-silhouette',
      {
        aesthetic:
          'Folded Silhouette Icons: one apparent sheet folded once or twice into a compact silhouette that carries the whole app metaphor.',
        subject_treatment:
          "Build the prompt's subject as an app icon from one sheet with one or two decisive folds, every fold carrying meaning rather than decoration.",
        color_and_tone:
          'Three related values separating front, back and void, with strong silhouette contrast.',
        lighting_and_shadow:
          'Broad side light with a short contact shadow and soft, even fold shading.',
        texture_and_material:
          "Thin apparent thickness and a smooth matte surface with almost no visible grain.",
        camera_and_composition:
          'Compact silhouette with one main void and folds visible from the chosen view.',
        atmosphere_and_mood:
          'Built lightness and a quiet surprise, crisp rather than crumpled or fragile.',
        rendering_and_quality:
          'Still recognizable as a flat silhouette once material and shadow are removed.',
        key_features: 'one folded sheet; decisive folds; three values; compact silhouette',
      },
      ['generic papercraft', 'too many folds', 'fold hidden by the camera'],
      [
        'The home-screen icon of an app that sends letters to your future self: one deep blue sheet folds twice into a paper boat sailing toward a small open hole of light. No readable text or logo.',
        'A folded-sheet icon for an app that finds lost umbrellas across the whole city, one coral sheet folded into an umbrella shape that is clearly smug about being found. No readable text or logo.',
        'A single pale sheet folds once into a sleeping moth, the icon of a gentle night-time breathing app, soft grey and cream on a calm background. No readable text or logo.',
      ],
    ),
    A(
      'R-APP-02',
      'Nested Object Tokens',
      'two-object fitted app icon',
      'nested-token',
      {
        aesthetic:
          'Nested Object Tokens: two simplified objects fit into each other so their relationship, not a pile of accessories, tells what the app does.',
        subject_treatment:
          "Fit the prompt's subject together with one related object so the fit explains the function, each keeping its one essential trait.",
        color_and_tone:
          'Two color families for the two pieces, their values well apart in greyscale.',
        lighting_and_shadow: 'One soft shared light with visible contact where the pieces meet.',
        texture_and_material:
          'Discreet tactile surfaces with one consistent finish for both pieces.',
        camera_and_composition:
          'Primary piece holds most of the mass, the secondary filling a void without hiding it.',
        atmosphere_and_mood: 'Complicity and a satisfying fit, with nothing extra piled on top.',
        rendering_and_quality:
          'The relationship reads at small size and stays clear without an outer container.',
        key_features: 'two fitted objects; relationship metaphor; shared light; no clutter',
      },
      ['stacked unrelated objects', 'mandatory rounded box', 'microscopic details'],
      [
        'A dragon egg nestled perfectly inside a cast-iron frying pan: the icon of an app for exotic-pet cooks who have made a terrible mistake, orange and charcoal, soft light. No readable text or logo.',
        'App icon for a sock-matching service, where a single sock fits exactly into the empty space of a lonely shoe, cream and terracotta, satisfying and a little absurd. No readable text or logo.',
        'Inside a cupped seashell rests one small key, fitted perfectly, the icon of a private journal app, slate green and bone, quiet and intimate. No readable text or logo.',
      ],
    ),
    A(
      'R-APP-03',
      'Inlaid Plane Emblems',
      'inlaid color plane app icon',
      'inlaid-plane',
      {
        aesthetic:
          'Inlaid Plane Emblems: broad color planes set flush into one simple mass, their edges giving hierarchy and a minimal sense of depth.',
        subject_treatment:
          "Inlay the prompt's subject as two or three broad planes into one simple mass, the joins between color and edge creating minimal depth.",
        color_and_tone:
          'Two or three color planes on a neutral base, with one single focus of saturation.',
        lighting_and_shadow: 'Diffuse light revealing the inlay edges with small, soft highlights.',
        texture_and_material: 'Smooth base with shallow inlays, the base material interchangeable.',
        camera_and_composition: 'Off-center focal plane with secondary regions balancing the mass.',
        atmosphere_and_mood:
          'Tactile precision and calm, with a small surprise when seen up close.',
        rendering_and_quality:
          'The inlay still reads in greyscale without relying on any material texture.',
        key_features: 'flush inlaid planes; neutral base; one saturated focus; shallow depth',
      },
      ['material as the only identity', 'excessive mosaic', 'pieces floating above the base'],
      [
        'A crown inlaid into a dark stone mass with one blazing gold plane, the icon of a chess app where the pieces can be bribed, deep navy base, regal and sly. No readable text or logo.',
        'Weather-diary app icon in the shape of an irregular oval pebble, one bright plane and one dark plane inlaid into it like a tiny storm deciding its mood, calm and tactile. No readable text or logo.',
        'Two flush planes shaped like an open book lie set into a charcoal block, one warm page lit, the icon of an audiobook app for insomniacs. No readable text or logo.',
      ],
    ),
    A(
      'R-APP-04',
      'Suspended Core Icons',
      'suspended core app icon',
      'suspended-core',
      {
        aesthetic:
          'Suspended Core Icons: one recognizable core held by two or three visible bridges inside an open outer frame.',
        subject_treatment:
          "Suspend the prompt's subject as a core held by two or three visible bridges inside an open frame, the core recognizable even without the frame.",
        color_and_tone: 'Core in the dominant value, support in lower contrast, voids kept open.',
        lighting_and_shadow:
          'Broad side light with contact shadows at each bridge and clear support.',
        texture_and_material:
          'Solid matte materials with believable thickness and softly controlled edges.',
        camera_and_composition:
          'Core slightly offset, frame open on one side like an unfinished ring.',
        atmosphere_and_mood:
          'Balanced tension and protection, with air around the central element.',
        rendering_and_quality:
          'Bridges readable when reduced and the core recognizable on its own.',
        key_features: 'suspended core; visible bridges; open frame; balanced tension',
      },
      ['arbitrary floating', 'thin bridges', 'cage that hides the core'],
      [
        "A glowing ember suspended by three iron bridges inside an open ring: the icon of an app that keeps a family's last candle burning across the world, deep red and charcoal. No readable text or logo.",
        'A tiny rubber duck suspended by two bridges in an open frame, as if it were a priceless museum jewel, the icon of a bath-time app that takes itself far too seriously. No readable text or logo.',
        'A single seed held by three soft bridges inside an open arc, terracotta and bone, the icon of an app that reminds you to water one plant. No readable text or logo.',
      ],
    ),
    A(
      'R-APP-05',
      'Compressed Diorama Icons',
      'micro diorama app icon',
      'compressed-diorama',
      {
        aesthetic:
          'Compressed Diorama Icons: a tiny space of two or three planes condenses one action, seen through one consistent camera.',
        subject_treatment:
          "Condense the prompt's subject into a micro space of two or three planes that shows one action, dropping any scenery that does not explain it.",
        color_and_tone:
          'Short palette with the background lower in contrast than the functional figure.',
        lighting_and_shadow: 'One common light from a single direction, gentle and clear.',
        texture_and_material:
          'Clean surfaces and a uniform scale of detail across the small scene.',
        camera_and_composition:
          'Consistent camera and compressed depth, the space kept inside the icon outline.',
        atmosphere_and_mood: 'A small habitable scene that is still instantly legible.',
        rendering_and_quality: 'The action reads at small size and keeps one single focus.',
        key_features: 'two or three planes; one action; compressed depth; single focus',
      },
      ['sprawling diorama', 'tiny people', 'scenery more important than function'],
      [
        'A tiny corner of a castle dungeon where a single key slides under a cell door: the icon of an escape-room booking app, ink blue and cream, one oblique camera. No readable text or logo.',
        'Compressed into three planes, a small bedroom where the alarm clock is hiding under the bed, the icon of an app that helps heavy sleepers find their alarms. No readable text or logo.',
        'A small doorway, one step and a warm lit window in two soft planes, the icon of an app for sending a quiet good-night message, warm and cool contrast. No readable text or logo.',
      ],
    ),
    A(
      'R-APP-06',
      'Carved Relief Pictograms',
      'carved relief app icon',
      'carved-relief',
      {
        aesthetic:
          'Carved Relief Pictograms: broad reliefs and carved hollows with one or two levels of depth define the icon under a simple outer silhouette.',
        subject_treatment:
          "Carve the prompt's subject as a broad relief with one or two levels of hollowing, keeping a simple outer silhouette.",
        color_and_tone:
          'Clear value relationships between raised surface and hollow, one optional accent.',
        lighting_and_shadow: 'Soft raking light revealing the carving with gentle, readable shade.',
        texture_and_material: 'Matte finish of minimal grain, with stone or metal only as options.',
        camera_and_composition:
          'Relief concentrated in one region, with a smooth resting zone beside it.',
        atmosphere_and_mood:
          'Serene solidity, with information discovered slowly through carved depth.',
        rendering_and_quality: 'Planes and hollows stay distinct even with every texture removed.',
        key_features: 'broad relief; two carving levels; raking light; smooth rest zone',
      },
      ['microscopic relief', 'stone as the only novelty', 'engraving that needs zooming'],
      [
        'A carved relief of an ancient sea serpent coiling around a compass, the icon of a treasure-hunting app, warm grey with one deep channel, raking light like a temple wall. No readable text or logo.',
        'Carved into a rounded block, a relief of a very proud rooster wearing headphones: the icon of an alarm app that crows your favorite songs, terracotta and cream. No readable text or logo.',
        "A soft relief of a single sound wave hollowed into a rounded pebble, deep blue, the icon of an app for recording a grandmother's stories. No readable text or logo.",
      ],
    ),
    A(
      'R-APP-07',
      'Inflated Junction Icons',
      'soft inflated joint app icon',
      'inflated-junction',
      {
        aesthetic:
          'Inflated Junction Icons: soft tubes or masses join at tense necks with readable gaps, each junction adding meaning to the icon.',
        subject_treatment:
          "Join the prompt's subject from soft inflated masses through tense junctions that keep gaps open, every join contributing to the meaning.",
        color_and_tone: 'Two moderately saturated tones with clean shadow values.',
        lighting_and_shadow:
          'Broad light with soft highlights that describe tension without heavy gloss.',
        texture_and_material:
          'Smooth elastic surface, seams shown only where they explain construction.',
        camera_and_composition: 'Compact silhouette with one dominant junction and one open void.',
        atmosphere_and_mood: 'Friendly energy and contained pressure, bouncy but controlled.',
        rendering_and_quality:
          'Junction thickness changes coherently without melting parts together.',
        key_features: 'soft tubes; tense junctions; open gaps; friendly pressure',
      },
      ['balloon material with no structure', 'closed gaps', 'melted parts'],
      [
        'A soft inflated octopus squeezing one tentacle through a tense junction into a tiny submarine hatch: the icon of a deep-sea exploration app, coral and deep violet. No readable text or logo.',
        'An inflated rubber chicken joined to a whistle by one tense neck, the icon of an app for summoning your whole family to dinner, bright yellow and charcoal, very loud. No readable text or logo.',
        'Two soft masses held together by one curved junction, leaving a wide gap between them like two hands almost touching, the icon of a long-distance friendship app. No readable text or logo.',
      ],
    ),
    A(
      'R-APP-08',
      'Paper-Hinge Characters',
      'jointed flat-piece app character',
      'paper-hinge',
      {
        aesthetic:
          'Paper-Hinge Characters: characters or symbols articulated from flat pieces joined by visible simple hinges.',
        subject_treatment:
          "Articulate the prompt's subject from flat pieces joined by simple visible hinges, keeping its identity, proportions and correct number of parts.",
        color_and_tone: 'One color per piece with well-separated values and neutral joints.',
        lighting_and_shadow: 'Soft frontal light with a minimal shadow where pieces overlap.',
        texture_and_material:
          'Matte sheets of uniform thickness with clean edges and sober pivots.',
        camera_and_composition: 'Compact readable pose, with overlapping limbs separated clearly.',
        atmosphere_and_mood: 'Expressive with very few gestures, charming rather than childish.',
        rendering_and_quality: 'Every piece looks jointed and belongs clearly to the right figure.',
        key_features: 'flat jointed pieces; visible hinges; compact pose; per-piece color',
      },
      ['duplicated limbs', 'impossible hinges', 'a character unrelated to the brief'],
      [
        "A jointed flat-piece knight raising a hinged shield against a dragon's paper flame, the icon of a tabletop battle app, black, cream and coral, pivots clearly visible. No readable text or logo.",
        'A hinged paper cat mid-stretch with exactly four legs and one smug tail, the icon of an app that tells you when your cat is plotting something, slate and orange. No readable text or logo.',
        'A small hinged paper bird opening one wing, the icon of a letters app for people in hospital, soft ink and bone, gentle pose. No readable text or logo.',
      ],
    ),
    A(
      'R-APP-09',
      'Stepped Crystal Forms',
      'stepped faceted app icon',
      'stepped-crystal',
      {
        aesthetic:
          'Stepped Crystal Forms: volume built from broad stepped planes and a few counted facets under one dominant silhouette.',
        subject_treatment:
          "Build the prompt's subject from broad steps and a few counted facets, placing the dominant silhouette before any material.",
        color_and_tone: 'Three value bands across the planes, one main color and a limited accent.',
        lighting_and_shadow: 'Soft directional light revealing the steps, transparency optional.',
        texture_and_material: 'Smooth facets with consistent edge width and clean planes.',
        camera_and_composition: 'Compact volume with the focal plane facing the viewer.',
        atmosphere_and_mood: 'Sculptural precision and a measured ascent, calm and exact.',
        rendering_and_quality:
          'The structure stays recognizable when rendered opaque and monochrome.',
        key_features: 'stepped planes; counted facets; dominant silhouette; three value bands',
      },
      ['generic crystal', 'too many facets', 'reflections that erase the silhouette'],
      [
        'A stepped faceted mountain with one bright summit plane where a tiny flag waits, the icon of an app for climbers who talk to their fears, opaque blue and warm light. No readable text or logo.',
        'Three broad steps form a trophy that is clearly too big for its owner, the icon of an app that rewards you for doing the dishes, coral and cream. No readable text or logo.',
        'Stepped planes wrap around one pale off-center face like a quiet lantern, the icon of a reading-light app, slate grey and soft yellow. No readable text or logo.',
      ],
    ),
    A(
      'R-APP-10',
      'Layer-Window Icons',
      'reveal-window app icon',
      'layer-window',
      {
        aesthetic:
          'Layer-Window Icons: one controlled opening in the front layer reveals a second layer that completes the metaphor.',
        subject_treatment:
          "Cut one opening into the prompt's subject so it reveals a second essential shape behind it, using a single window only.",
        color_and_tone: 'Stable outer layer value with enough contrast for the revealed content.',
        lighting_and_shadow: 'Soft light marking the edge thickness and separating the two layers.',
        texture_and_material: 'Two smooth layers at a moderate distance with coherent contact.',
        camera_and_composition: 'One off-center window cut inside a compact, simple outer shape.',
        atmosphere_and_mood: 'Immediate curiosity followed by a small, contained second reading.',
        rendering_and_quality:
          'The metaphor reads with window and content together, no fine detail needed.',
        key_features: 'single window; revealed second layer; off-center opening; two layers',
      },
      ['a scene inside a box', 'ornamental window', 'excessive depth'],
      [
        'Through one keyhole-shaped window in a dark door, a single glowing eye looks back: the icon of a horror-story app, charcoal and pale gold, deeply unsettling. No readable text or logo.',
        'A bread loaf with one round window revealing a very surprised mouse inside, the icon of a bakery-inventory app, warm crust and cream, comic and clear. No readable text or logo.',
        'One narrow window in a pale envelope reveals a pressed flower inside, the icon of an app for keeping old letters, soft green and cream. No readable text or logo.',
      ],
    ),
  ],
};

export default spec;
