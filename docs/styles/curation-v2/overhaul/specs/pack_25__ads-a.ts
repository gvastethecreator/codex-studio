import type { Spec } from '../tools/apply';
import { design } from './_design';

// Advertising & campaign design (part A): R-ADV-01..10. Copy stays exact; no invented claims, statistics or awards.
const V = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
) => design(name, domain, tag, 'advertising', fields, avoid, briefs, { text: true, source });

const CLAIMS = 'invented product claims, statistics or awards';

const spec: Spec = {
  pack: 'pack_25',
  category: '9. Advertising & Campaign Design',
  newCategory: { id: 'advertising-and-campaign-design' },
  updates: {},
  creates: [
    V(
      'R-ADV-01',
      'Causal Visual Metaphors',
      'cause-and-effect ad metaphor',
      'causal-metaphor',
      {
        aesthetic:
          'Causal Visual Metaphors: one clear cause-and-effect transformation communicates the idea of the campaign at a single glance.',
        subject_treatment:
          "Express the prompt's message through one visible cause-and-effect transformation of its subject, with the requested copy set exact and no invented benefit.",
        color_and_tone:
          'Palette serving the main relationship, with the strongest contrast at the moment of transformation.',
        lighting_and_shadow:
          'Coherent light across cause and result so the relationship stays readable.',
        texture_and_material:
          'Consistent materials and a legible transition between the two states.',
        camera_and_composition:
          'One dominant subject, one clear action and a calm zone for the copy.',
        atmosphere_and_mood: 'Direct wit and a surprise you can check with your own eyes.',
        rendering_and_quality:
          'Polished campaign image where the metaphor reads without extra explanation.',
        key_features: 'one transformation; visible cause and effect; calm copy zone; single idea',
      },
      [
        'invented commercial promise',
        'gratuitous transformation',
        'too many metaphors at once',
        CLAIMS,
      ],
      [
        'One match flame grows into a lighthouse beam that parts a black storm at sea, the poster of a lighthouse-keepers\' union, copy "ONE LIGHT IS ENOUGH" set exact.',
        '"PATIENCE" is a very slow snail-mail service, and its ad shows a letter dropped into a mailbox coming out the other side as an old man with a long white beard, copy "WORTH THE WAIT".',
        'A poster for a repair café where two broken halves of a teacup float together and become whole again, copy "BRING IT BACK", charcoal and coral.',
      ],
    ),
    V(
      'R-ADV-02',
      'Typographic Pressure Fields',
      'compressed and released type ad',
      'type-pressure',
      {
        aesthetic:
          'Typographic Pressure Fields: type and space squeeze tightly around one focal point and then release into open air, reading intact.',
        subject_treatment:
          "Compress and release space around the prompt's focal subject through typographic relationships, every requested word and character exact and legible.",
        color_and_tone:
          'Strong text contrast on a sober ground with one accent at the pressure point.',
        lighting_and_shadow: 'Light only on existing imagery, the type kept flat, crisp and sharp.',
        texture_and_material: 'Clean letter edges with no texture hiding the compression.',
        camera_and_composition: 'One dense area against one open region, lines deformed unevenly.',
        atmosphere_and_mood: 'Spatial tension and release, energetic but never chaotic.',
        rendering_and_quality: 'Crisp typographic poster where the exact copy stays readable.',
        key_features: 'squeezed type; open release zone; one pressure point; exact copy',
      },
      ['crushed text', 'illegible tracking', 'deformation unrelated to the message', CLAIMS],
      [
        'A poster for a deep-sea exploration museum: the words "THE PRESSURE DOWN HERE" crushed together at the bottom by an invisible ocean and released into empty blue above.',
        'Too many things, not enough room: a storage company called "ROOM" shows the copy "MAKE SPACE" squeezed by a pile of boxes on one side and gasping free on the other.',
        'A banner for a meditation app with "LESS NOISE. MORE AIR." packed tight on the left and slowly loosening to the right, flat and calm.',
      ],
    ),
    V(
      'R-ADV-03',
      'Overscale Object Fragments',
      'giant cropped object ad',
      'overscale-fragment',
      {
        aesthetic:
          'Overscale Object Fragments: a huge crop of one recognizable part of the subject becomes the whole structure of the ad.',
        subject_treatment:
          "Use one enlarged, still recognizable fragment of the prompt's subject as the composition, keeping its identity and proportions, with the copy set exact.",
        color_and_tone: 'The subject palette kept, the copy set against a quiet zone.',
        lighting_and_shadow: 'Light that reveals the fragment and keeps its details readable.',
        texture_and_material: 'Relevant material detail shown at a believable, readable scale.',
        camera_and_composition:
          'A bold but identifiable crop with a clear relationship to the copy.',
        atmosphere_and_mood: 'Presence and curiosity created by the sheer scale of the crop.',
        rendering_and_quality:
          'Crisp campaign photography where the fragment identifies the subject.',
        key_features: 'giant crop; recognizable fragment; quiet copy zone; bold scale',
      },
      ['unrecognizable object', 'invented macro', 'text over noise', CLAIMS],
      [
        'One enormous scaled eye fills the whole poster of a dragon sanctuary, a tiny reflection of a person in its pupil, copy "THEY SEE YOU TOO".',
        'An ad for a pillow brand showing only a giant crop of a face deeply sunk into a pillow, copy "FIVE MORE MINUTES", soft and hilarious.',
        'A poster for a bookbinder where the meeting of spine and first page becomes one huge diagonal, copy "IT STARTS HERE", cream and charcoal.',
      ],
    ),
    V(
      'R-ADV-04',
      'Material-to-Mark Campaigns',
      'material-derived graphic system',
      'material-to-mark',
      {
        aesthetic:
          'Material-to-Mark Campaigns: one visible property of the object is abstracted into repeatable graphic marks that run through a whole campaign.',
        subject_treatment:
          "Translate one visible property of the prompt's subject into a graphic grammar that organizes copy across pieces, the requested words set exact.",
        color_and_tone: 'Colors derived from the subject rather than borrowed from any campaign.',
        lighting_and_shadow: 'Light kept coherent between object and graphics when they meet.',
        texture_and_material:
          'The material abstracted into clear marks rather than pasted as texture.',
        camera_and_composition:
          'Object or fragment in one zone, derived marks organizing text and flow.',
        atmosphere_and_mood:
          'Coherent conceptual transformation and instant recognition across the whole family.',
        rendering_and_quality:
          'Clean graphic campaign where every mark traces back to the subject.',
        key_features:
          'property to mark; repeatable grammar; subject-derived color; campaign family',
      },
      ['generic texture', 'unrelated material', 'three disconnected campaigns', CLAIMS],
      [
        'Cracks of cooling lava become the graphic lines that frame every headline for a volcano observatory, copy "THE EARTH IS TALKING", black and ember orange.',
        'Ads for a bubble-wrap company where the round bubbles become the dots of every letter in "POP RESPONSIBLY", ridiculously satisfying.',
        'A notebook campaign where the rhythm of its folded spine becomes bars that order the copy "THINK IN LAYERS", black and cream.',
      ],
    ),
    V(
      'R-ADV-05',
      'Single-Gesture Posters',
      'one-gesture poster',
      'single-gesture',
      {
        aesthetic:
          'Single-Gesture Posters: one dominant graphic gesture organizes image and type, every secondary element reduced to the essentials.',
        subject_treatment:
          "Organize the prompt's poster around one dominant graphic gesture that carries the subject and message, with only the requested copy as support.",
        color_and_tone: 'One strong ink and an optional accent with large resting areas.',
        lighting_and_shadow: 'Flat graphics or one simple light on the object.',
        texture_and_material:
          'Deliberate edges and a clean finish, texture only if it serves the gesture.',
        camera_and_composition:
          'The main gesture crosses or shapes the format with a clear entry point.',
        atmosphere_and_mood: 'Concentrated energy and decisiveness, bold, direct and unhesitating.',
        rendering_and_quality: 'Clean poster where removing the gesture would change everything.',
        key_features: 'one gesture; minimal secondaries; large resting space; clear entry',
      },
      ['competing gestures', 'arbitrary ornament', 'headline with no hierarchy', CLAIMS],
      [
        'A poster for a samurai film festival: one enormous brushed sword stroke slashes the page from corner to corner and carries the words "ONE CUT", black on rice white.',
        'A poster for a toddler gymnastics class, a single wild crayon scribble looping across the page and somehow holding up "TUMBLE TIME".',
        'A poster for a drawing meetup where one thick folding line holds the copy "FOLLOW THE LINE", black on cream with plenty of air.',
      ],
    ),
    V(
      'R-ADV-06',
      'Editorial Cut-and-Connect',
      'photo fragment and editorial block layout',
      'cut-and-connect',
      {
        aesthetic:
          'Editorial Cut-and-Connect: photo fragments and editorial blocks connected by alignments, scale shifts and purposeful links.',
        subject_treatment:
          "Relate photo fragments of the prompt's subject and editorial text blocks through alignments and functional links, keeping every word exact.",
        color_and_tone: 'Unified palette and a limited editorial accent, subjects left uncolored.',
        lighting_and_shadow: 'Compatible light across fragments or a deliberate designed contrast.',
        texture_and_material: 'Clean cuts and coherent texture between photos and graphics.',
        camera_and_composition:
          'One main fragment, subordinate pieces and connections that explain them.',
        atmosphere_and_mood: 'Editorial curiosity and intentional montage, clever and composed.',
        rendering_and_quality: 'Clean editorial layout where each fragment adds something new.',
        key_features: 'photo fragments; editorial blocks; functional links; one main piece',
      },
      ['disconnected collage', 'invented images as evidence', 'decorative links', CLAIMS],
      [
        'A campaign for an expedition searching for a lost Arctic ship: fragments of a frozen compass, a map corner and a sled joined by thin index lines, copy "WE ARE STILL LOOKING".',
        'Clipped photos of laundry, a washing machine and one lonely sock linked like crime evidence for a detective agency that finds lost socks, copy "CASE OPEN".',
        'A bookbinding workshop poster linking fragments of paper, thread and cover to the line "WHAT HOLDS A PAGE", sober palette.',
      ],
    ),
    V(
      'R-ADV-07',
      'Split-Reality Product Stories',
      'two-register split ad',
      'split-reality',
      {
        aesthetic:
          'Split-Reality Product Stories: one subject shown in two contrasting visual registers side by side, with matching points that prove it is the same thing.',
        subject_treatment:
          "Show the prompt's subject in two contrasting registers split across the image, keeping identity, proportion and three matching points, with the copy exact.",
        color_and_tone: 'Different but compatible palettes with one shared anchor zone.',
        lighting_and_shadow: 'Each register lit coherently without redesigning the object.',
        texture_and_material:
          'Contrasting finishes on each side, sharing geometry you can check point by point.',
        camera_and_composition:
          'A clean split or controlled transition with copy clear of both halves.',
        atmosphere_and_mood: 'Surprise from a change of representation, the subject unchanged.',
        rendering_and_quality: 'Polished split image where features line up across the divide.',
        key_features: 'two registers; one subject; matching points; clean split',
      },
      ['two different subjects', 'distorted photographic half', 'transition hiding errors', CLAIMS],
      [
        'Half glowing blueprint, half storm-battered real hull: one ship on the poster of an old sea shanty festival, copy "FROM PLAN TO SEA".',
        'An ad for a gym where the same man is half gym poster hero and half actual man eating cereal on the sofa, copy "WE BELIEVE IN YOU (MOSTLY)".',
        'A lamp shown half as line drawing and half as matte render with three features aligned, copy "FROM LINE TO LIGHT".',
      ],
    ),
    V(
      'R-ADV-08',
      'Counterspace Campaigns',
      'meaningful empty space ad',
      'counterspace-campaign',
      {
        aesthetic:
          'Counterspace Campaigns: empty space becomes part of the message, shaping silhouette, headline and call to action together.',
        subject_treatment:
          "Use one meaningful empty space formed by the prompt's subject as an active part of the message, the copy exact and the void left clear.",
        color_and_tone:
          'Strong contrast at the edges defining the void, with a minimal functional accent.',
        lighting_and_shadow: 'Simple light on any object with the reserved space kept clean.',
        texture_and_material: 'Sober surfaces and clean cuts with a plain ground.',
        camera_and_composition:
          'One dominant void in a recognizable shape that organizes the reading.',
        atmosphere_and_mood: 'Pause, expectation and precision, quiet yet surprisingly powerful.',
        rendering_and_quality: 'Clean campaign where the void relates to the message itself.',
        key_features: 'meaningful void; shaped silhouette; clear copy; one accent',
      },
      ['dead space', 'scattered text', 'silhouette unrelated to the copy', CLAIMS],
      [
        'A crowd of dark silhouettes with one person-shaped gap in the middle, the campaign image of a missing-persons charity, copy "SOMEONE IS MISSING HERE", grave and quiet.',
        'An ad for a donut shop where the only thing on the poster is a huge perfect hole, copy "WE SOLD THE REST", shameless.',
        'A poster for a library reading room: two dark masses leaving a wide calm gap shaped like a desk, copy "A PLACE TO THINK".',
      ],
    ),
    V(
      'R-ADV-09',
      'Modular Type Windows',
      'image inside letters ad',
      'type-window',
      {
        aesthetic:
          'Modular Type Windows: bold letters act as windows that crop the image inside them, creating rhythm across a campaign.',
        subject_treatment:
          "Let the requested word act as windows onto the prompt's subject image, keeping every letter's skeleton and order intact and readable.",
        color_and_tone:
          'Enough contrast between text and background, the inner image controlled in density.',
        lighting_and_shadow: 'Coherent image light and crisp flat letter edges.',
        texture_and_material: 'Clean cropping with limited visual texture inside the letters.',
        camera_and_composition: 'Large windows and short words so the whole word reads at once.',
        atmosphere_and_mood: 'Graphic rhythm and the discovery of an image inside language.',
        rendering_and_quality: 'Clean poster where the word reads as silhouette before the image.',
        key_features: 'image in letters; bold short word; readable skeleton; campaign rhythm',
      },
      ['illegible letters', 'repeated image with no relation', 'windows too small', CLAIMS],
      [
        'A campaign for a rainforest protection fund: the word "WILD" in huge letters, each one a window onto the same jaguar staring out of the jungle.',
        'The word "LUNCH" with a single gigantic sandwich visible through all five letters, a very sincere ad for a sandwich shop.',
        'A poster reading "SEA" where calm waves show through three wide letters, pale background and one line only.',
      ],
    ),
    V(
      'R-ADV-10',
      'Graphic Scale Collisions',
      'contrasting scale collision ad',
      'scale-collision',
      {
        aesthetic:
          'Graphic Scale Collisions: a huge element meets a tiny one, the tension between scales creating one unmistakable reading point.',
        subject_treatment:
          "Set a huge and a tiny element of the prompt's subject against each other so the scale contrast creates one clear reading point, the copy exact.",
        color_and_tone: 'Short palette with the focus of contrast where the two scales meet.',
        lighting_and_shadow:
          'Coherent light when objects share a scene, shadows matching the scale.',
        texture_and_material:
          'Sober materials and proportional detail, secondary elements kept simple.',
        camera_and_composition:
          'One large and one small element linked by alignment, contact or a meaningful gap.',
        atmosphere_and_mood: 'A surprise of scale and a clear message, never arbitrary gigantism.',
        rendering_and_quality:
          'Clean campaign image where the scale contrast reinforces the message.',
        key_features: 'huge meets tiny; one reading point; linked scales; short palette',
      },
      ['misleading product scale', 'unrelated objects', 'many focal points', CLAIMS],
      [
        'On a vast snowy mountain face, one tiny orange figure hangs on a rope in the mountain rescue team\'s poster, copy "WE CLIMB FOR YOU".',
        'Pest control, but make it honest: an enormous elephant terrified of one tiny mouse, copy "SIZE ISN\'T EVERYTHING".',
        'A writing workshop poster where a huge blank page meets one small comma, copy "START SMALL", black and coral.',
      ],
    ),
  ],
};

export default spec;
