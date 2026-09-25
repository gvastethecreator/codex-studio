import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'added opponent',
  'added sports gear',
  'invented danger or explosion',
  'extra props',
  'readable text',
  'franchise character likeness',
];

// Staging profiles: each owns a stated camera, layout or motion-drawing device and nothing else.
// Category validation: the requested action is staged better without inventing opponents, sports gear,
// extra props or danger.
const profile = (what: string) =>
  `Keep the prompt subject, count, action, props and setting; this preset owns ${what}, and adds no opponent, sports gear, extra prop or danger.`;

function stage(what: string, parts: Omit<Dna, 'subject_treatment'>): Dna {
  const { aesthetic, ...rest } = parts;
  return { aesthetic, subject_treatment: profile(what), ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_05',
  category: '5. Action Motion Setpieces',
  updates: {
    'SP13-021': {
      dna: stage('the forward-rush staging, foreshortening and converging depth lines', {
        aesthetic:
          'Anime action frame staged as a forward rush: the subject lunges toward the lens along converging diagonals, its nearest limb foreshortened to about twice its size, depth squeezed like a narrow passage.',
        color_and_tone:
          'Keep the prompt palette; cooler dark-blue values in the background push the warmer, lighter subject forward.',
        lighting_and_shadow:
          'Hard cel edge highlights on the leading side of the subject, aligned with its travel; no flashes or sparks.',
        texture_and_material:
          'Crisp cel contours with three to six tapered motion streaks attached only to trailing edges.',
        camera_and_composition:
          "A 24 mm-equivalent low front three-quarter view, the leading hand or foot almost touching the lens, the vanishing point tucked behind the subject's shoulder.",
        atmosphere_and_mood:
          'Forward pressure and urgency that live in the framing, not in added danger.',
        rendering_and_quality:
          'Sharp 2D cel rendering with stable anatomy through the foreshortening and clean foreground-to-background separation.',
        key_features:
          'lunge toward the lens; leading limb foreshortened to double size; converging diagonals; compressed depth; tapered trailing streaks',
      }),
      avoid: AVOID,
      briefs: [
        'Anime forward-rush frame of an adult courier sprinting down a narrow medieval street toward the lens with a sealed leather satchel, her leading hand foreshortened to twice its size, converging timber-frame diagonals, tapered streaks off her trailing heel. No text or logo.',
        'Anime forward-rush frame of a wolfhound bounding down a castle staircase straight at the viewer, front paws huge in the foreground, compressed stair depth, cool blue stone behind its warm coat. No text or logo.',
        'Anime forward-rush frame of an adult cook hurrying a steaming pie across a crowded inn kitchen toward the lens, the pie dish foreshortened and near, converging beam lines, hard cel highlight on her leading arm. No text or logo.',
      ],
    },
    'SP13-022': {
      dna: stage(
        'the steep high oblique viewpoint and the X-crossing of travel line and edge line',
        {
          aesthetic:
            "Anime vertigo frame from a steep high oblique looking down past the subject into deep space, where the subject's line of travel crosses a strong architectural or terrain edge in a clean X.",
          color_and_tone:
            'Keep the prompt palette; the far depth drops in value so the two crossing paths separate by contrast.',
          lighting_and_shadow:
            "Crisp highlights on the crossing edges only, following the prompt's light; no sparks or energy effects.",
          texture_and_material:
            'Fine directional marks attached to the moving subject; surfaces below simplify into flat value bands with distance.',
          camera_and_composition:
            'A 70 to 80 degree down-angle through a wide lens, horizon out of frame, with the crossing point placed on a third and generous air around it.',
          atmosphere_and_mood:
            'Vertigo and suspended breath created by height and direction, never by a collision.',
          rendering_and_quality:
            'Firm 2D contours, stable structure under steep perspective and both crossing paths readable at a glance.',
          key_features:
            'steep 70-80 degree down-angle; X-crossing of travel line and edge line; wide lens; far depth dropping in value; horizon out of frame',
        },
      ),
      avoid: AVOID,
      dropAvoid: ['calm-composition'],
      briefs: [
        'Anime vertigo frame looking steeply down past an adult roofer walking the ridge beam of a cathedral roof, her path crossing the long diagonal of the nave edge in a clean X, the town far below dropping into flat pale value bands. No text or logo.',
        'Anime vertigo frame from high above an adult acrobat swinging on a rope between two stone towers, the rope arc crossing the tower edge line on a third, wide lens, horizon out of frame. No text or logo.',
        'Anime vertigo frame looking down the well of a spiral stair as a heron glides across it, its flight line crossing the spiral rail diagonal, the stair bottom deep and dark far below. No text or logo.',
      ],
    },
    'SP13-023': {
      dna: stage('the vector path-tracing device that draws the action as clean geometric arcs', {
        aesthetic:
          'Precise anime action frame in which the exact path of the requested movement is traced as clean vector arcs, like motion-capture curves, thin and geometric behind the moving parts.',
        color_and_tone:
          'Keep the prompt palette; the path arcs take a restrained violet-blue that sits on existing colors without recoloring them.',
        lighting_and_shadow:
          'Precise directional light with narrow edge highlights on the moving parts; the arcs themselves do not glow.',
        texture_and_material:
          'Clean flat cel finish; arcs are one to two pixels thick, evenly spaced, and fade out after one full movement cycle.',
        camera_and_composition:
          'A controlled three-quarter side view that shows the whole path, with arcs never crossing the face or focal hands.',
        atmosphere_and_mood:
          'Technical, analytical momentum; the movement feels measured and exact rather than violent.',
        rendering_and_quality:
          'Sharp technical contours and crisp vector arcs kept secondary to the subject; no sci-fi interface graphics.',
        key_features:
          'movement path traced as vector arcs; thin evenly spaced curves; violet-blue path color; three-quarter side view; clean flat cel finish',
      }),
      avoid: AVOID,
      briefs: [
        'Precise anime action frame of an adult ribbon dancer spinning two long silk ribbons in a stone courtyard, the exact path of each ribbon end traced behind her as thin violet-blue vector arcs, three-quarter side view, clean flat cel finish. No text or logo.',
        'Precise anime action frame of an adult juggler keeping five brass balls in the air at a village fair, every ball path drawn as an evenly spaced geometric arc, arcs clear of his face. No text or logo.',
        "Precise anime action frame of an adult falconer releasing a hawk from her gloved fist, the hawk's rising flight path traced as a single clean vector curve, narrow edge highlights on the wings. No text or logo.",
      ],
    },
    'SP13-024': {
      dna: stage(
        'the peak-moment framing with radiating structure lines and a huge-scale foreground element',
        {
          aesthetic:
            'Anime key frame of the peak instant of the requested action, placed at the hub of radiating structural lines, with one element of the scene enlarged in the foreground for extreme scale contrast.',
          color_and_tone:
            'Keep the prompt palette; strongest value contrast sits at the hub, with restrained crimson or gold accents only if already present.',
          lighting_and_shadow:
            'Contrast concentrated at the point of action using the existing light; no flashes, explosions or sparks.',
          texture_and_material:
            'Decisive hard-edged forms; existing debris or droplets only when the prompt already has them.',
          camera_and_composition:
            'Low wide angle with the foreground element filling a third of the frame and scene lines radiating from the action point.',
          atmosphere_and_mood:
            'Monumental emphasis on one instant, weighty without triumph or aggression.',
          rendering_and_quality:
            'Hard controlled strokes, stable structure and a single unmistakable focal hub.',
          key_features:
            'peak instant at the hub; radiating structural lines; huge-scale foreground element; low wide angle; hub-centered contrast',
        },
      ),
      avoid: AVOID,
      briefs: [
        'Anime key frame of an adult blacksmith bringing his hammer down on a glowing horseshoe, the anvil huge in the low foreground, forge beams and floor planks radiating from the point of contact, strongest contrast at the hub. No text or logo.',
        'Anime key frame of a humpback whale breaching beside a small fishing skiff at dawn, the tail fluke enormous in the foreground, wave crests radiating from the peak of the leap. No text or logo.',
        'Anime key frame of an adult woodcutter splitting a log on a chopping block, the block and log halves huge near the lens, fence rails and tree trunks radiating from the instant of the split. No text or logo.',
      ],
    },
    'SP13-025': {
      dna: stage('the tall vertical layering and rising side-view staging', {
        aesthetic:
          'Anime action frame staged vertically: the subject rises through stacked horizontal layers of the scene seen from beside, with open space kept above it to pull the eye upward.',
        color_and_tone:
          'Keep the prompt palette; values lighten layer by layer toward the top, with restrained white-blue accents at the highest edges.',
        lighting_and_shadow:
          'Directional highlights on upward-facing edges; no lightning, flashes or new light sources.',
        texture_and_material:
          'Fine vertical motion marks under the rising subject only; surfaces stay clean and layered.',
        camera_and_composition:
          'A tall portrait frame from a side-on or slight low angle, the subject in the lower half and at least a third of the frame left open above it.',
        atmosphere_and_mood:
          'Lift and ascent carried by spacing and line direction, not by heroics.',
        rendering_and_quality:
          'Powerful but controlled contours with clear vertical separation between layers.',
        key_features:
          'stacked horizontal layers; subject rising from lower half; open space above; values lightening upward; side-on tall framing',
      }),
      avoid: AVOID,
      dropAvoid: ['calm-scene'],
      briefs: [
        'Anime vertical action frame of an adult monk climbing a hanging rope up the face of a cliff monastery, stacked terraces and cloud layers seen from beside, open pale sky above him, values lightening toward the top. No text or logo.',
        'Anime vertical action frame of a young dragon spiraling up out of a castle chimney, layered rooftops below, a third of the tall frame left open above, white-blue accents on its highest wingtip. No text or logo.',
        'Anime vertical action frame of an adult bell-ringer hauling himself up a bell rope inside a tall tower, wooden floors stacked below him, fine vertical motion marks, open shaft above. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Smear-Frame Arc Staging',
      domain: 'anime action staging',
      tags: ['smear-frame', 'motion-drawing'],
      dna: stage('the smear-frame drawing of the fastest moving part', {
        aesthetic:
          'Anime in-between smear frame: the fastest moving part of the subject is drawn as one stretched, distorted ribbon shape along its arc, while the rest of the body stays sharp and on model.',
        color_and_tone:
          'Keep the prompt palette; the smear carries the moving part colors in flat bands, slightly lighter than the solid form.',
        lighting_and_shadow:
          'Normal cel light on the solid body; the smear itself is flat with no shading.',
        texture_and_material:
          'One flat smear shape with a crisp outer edge and a feathered tail, no speed lines around it.',
        camera_and_composition:
          'A clean mid-shot that shows the full arc of the smeared part from start pose to end pose.',
        atmosphere_and_mood: 'Snappy, elastic and fast, the energy of a single animation frame.',
        rendering_and_quality:
          'Stable on-model anatomy outside the smear, with the smear clearly an intentional animation device.',
        key_features:
          'one stretched smear shape along the arc; rest of body sharp; flat smear color bands; no speed lines; full arc visible',
      }),
      avoid: [...AVOID, 'speed lines', 'motion blur'],
      briefs: [
        'Anime smear frame of an adult baker slinging a ball of dough onto a floured table, her throwing arm drawn as one stretched flat ribbon along its arc while her face and body stay sharp and on model, warm kitchen palette. No text or logo.',
        'Anime smear frame of a cat swatting a hanging tassel on a windowsill, its paw stretched into a single distorted smear shape with a feathered tail, the rest of the cat crisp. No text or logo.',
        'Anime smear frame of an adult drummer striking a great barrel drum in a festival pavilion, both drumstick arms smeared into flat curved ribbons, full arc from raised to struck visible. No text or logo.',
      ],
    },
    {
      name: 'Negative Impact Frame Staging',
      domain: 'anime action staging',
      tags: ['impact-frame', 'value-inversion'],
      dna: stage('the single inverted-value impact frame at the moment of contact', {
        aesthetic:
          'Anime impact frame at the exact instant of contact: the whole picture flips to inverted values, white shapes on black with a few raw rough outlines, as if one frame of the film were printed in negative.',
        color_and_tone:
          'Pure black and white with at most one accent color from the prompt kept in its original hue at the contact point.',
        lighting_and_shadow:
          'No modeled light; all shading collapses into flat inverted masses with a ring of white around the contact point.',
        texture_and_material:
          'Rough, shaky brush outlines and dry-brush edges, as if drawn in a hurry on a single animation cel.',
        camera_and_composition:
          'Tight framing on the contact point, slightly tilted, with the subject cut by the frame edge.',
        atmosphere_and_mood: 'A jolt, one heartbeat of pure force frozen in time.',
        rendering_and_quality:
          'High-contrast inverted graphic frame in which the action and subject remain clearly readable.',
        key_features:
          'inverted black and white values; single accent at contact; rough shaky outlines; tight tilted framing; white ring around contact',
      }),
      avoid: [...AVOID, 'full-color render', 'gore'],
      briefs: [
        "Anime inverted impact frame of an adult stone-carver's mallet striking a chisel into a marble block, white shapes on black, rough shaky outlines, a single orange spark of the original color at the contact point, tight tilted framing. No text or logo.",
        'Anime inverted impact frame of an adult knight slamming a heavy oak door shut with his shoulder, the whole picture in negative values, dry-brush edges, a white ring around the latch. No text or logo.',
        'Anime inverted impact frame of a draft horse hoof landing on a frozen puddle, the ice crack drawn as white lines on black, frame cutting through the leg, rough single-cel outlines. No text or logo.',
      ],
    },
    {
      name: 'Bullet-Time Orbit Freeze',
      domain: 'anime action staging',
      tags: ['bullet-time', 'frozen-moment'],
      dna: stage('the frozen instant seen from a camera orbiting the subject', {
        aesthetic:
          'Anime frozen-instant staging: time stops at the height of the action and the camera has swung around to an unexpected side, showing airborne elements of the scene hanging perfectly still.',
        color_and_tone:
          'Keep the prompt palette with a slight cool desaturation of the background to signal stopped time.',
        lighting_and_shadow:
          'Crisp rim light on every suspended element so each one reads separately, from the existing light direction.',
        texture_and_material:
          'Only elements already in the scene hang in the air, such as hair, water drops, cloth or flour, each sharply defined.',
        camera_and_composition:
          'A three-quarter rear or low side angle that the prompt did not imply, the subject centered with suspended elements in a loose ring.',
        atmosphere_and_mood: 'Hushed suspended stillness inside a fast movement.',
        rendering_and_quality:
          'Everything sharp, no motion blur, clean separation between the subject and each suspended element.',
        key_features:
          'time frozen at the action peak; camera swung to an unexpected side; suspended scene elements; no motion blur; cool desaturated background',
      }),
      avoid: [...AVOID, 'motion blur'],
      briefs: [
        'Anime frozen-instant frame of an adult fisherman casting a round net over a river, seen from a low rear three-quarter angle, the net fully spread and water drops from its weights hanging perfectly still in a loose ring, crisp rim light on each drop. No text or logo.',
        'Anime frozen-instant frame of an adult sorceress flicking water from a silver bowl across a garden, time stopped and the camera swung behind her, every droplet sharp in the air, cool desaturated hedges. No text or logo.',
        'Anime frozen-instant frame of an adult miller dropping a sack of flour that bursts open on a mill floor, camera swung low to the side, the flour cloud frozen in sharp clumps around him, no motion blur. No text or logo.',
      ],
    },
    {
      name: 'Panning Background Streak Frame',
      domain: 'anime action staging',
      tags: ['panning', 'tracking-shot'],
      dna: stage('the side-tracking pan with a streaked background and a sharp subject', {
        aesthetic:
          'Anime tracking pan: the camera moves alongside the subject at its speed, so the subject is drawn sharp while the background smears into long horizontal color streaks.',
        color_and_tone:
          'Keep the prompt palette; background colors stretch into bands that keep their hue but lose all detail.',
        lighting_and_shadow:
          'Steady side light on the subject; the streaked background keeps only its broad value pattern.',
        texture_and_material:
          'Smooth horizontal streak bands behind a crisp cel subject, with a few longer streaks at ground level.',
        camera_and_composition:
          'Strict side-on profile view at subject height, the subject a little behind center with lead room in the direction of travel.',
        atmosphere_and_mood: 'Sustained speed and a steady, flowing momentum.',
        rendering_and_quality:
          'Crisp subject, uniformly directional background streaks, no radial speed lines.',
        key_features:
          'sharp subject on streaked background; horizontal color bands; side-on profile view; lead room ahead; no radial speed lines',
      }),
      avoid: [...AVOID, 'radial speed lines'],
      briefs: [
        'Anime tracking pan of an adult messenger galloping a gray horse along a coastal road, horse and rider crisp in strict side profile, the cliffs and sea behind smeared into long horizontal blue and ochre streaks, lead room ahead. No text or logo.',
        'Anime tracking pan of a greyhound racing across a purple heath, the dog sharp at subject height, heather and sky stretched into smooth horizontal color bands. No text or logo.',
        'Anime tracking pan of an adult woman running along a wooden pier toward a departing ship, crisp cel figure in profile, pier posts and water streaked into horizontal bands behind her. No text or logo.',
      ],
    },
    {
      name: "Worm's-Eye Leap Silhouette",
      domain: 'anime action staging',
      tags: ['worms-eye-view', 'silhouette'],
      dna: stage('the straight-up worm’s-eye view with a backlit silhouette', {
        aesthetic:
          "Anime worm's-eye staging: the camera lies directly beneath the moving subject and looks straight up, so the subject passes overhead as a crisp dark silhouette against a bright flat sky.",
        color_and_tone:
          'Dark near-black silhouette against a bright pale sky; the prompt colors show only in a thin rim along the silhouette.',
        lighting_and_shadow:
          'Strong backlight from above, a thin bright rim around the silhouette and no fill from below.',
        texture_and_material:
          'Flat silhouette fill with a few interior details picked out by the rim; the sky smooth and clean.',
        camera_and_composition:
          'Straight-up view with a very wide lens; nearby walls, trees or edges converge toward the frame center and the subject crosses diagonally.',
        atmosphere_and_mood: 'Soaring, weightless and breath-held for a single instant.',
        rendering_and_quality:
          'Clean graphic silhouette with readable pose and a sharp rim; no clutter in the sky.',
        key_features:
          'camera straight beneath looking up; backlit dark silhouette; thin bright rim; converging edges to center; diagonal crossing',
      }),
      avoid: AVOID,
      briefs: [
        "Anime worm's-eye frame of an adult thief leaping the gap between two rooftops directly over the viewer, a crisp dark silhouette against a bright white sky, thin gold rim along her cloak, the eaves converging toward the frame center. No text or logo.",
        "Anime worm's-eye frame of a stag jumping over a fallen log right above the camera, its body a clean backlit silhouette, forest trunks converging to the center, thin bright rim on the antlers. No text or logo.",
        "Anime worm's-eye frame of a salmon leaping up a waterfall directly above the camera, seen straight from below through the spray, silhouette crossing the frame diagonally against a pale flat sky. No text or logo.",
      ],
    },
    {
      name: 'Dutch Tilt Momentum Frame',
      domain: 'anime action staging',
      tags: ['dutch-angle', 'canted-frame'],
      dna: stage('the strong camera roll that tilts the horizon with the direction of effort', {
        aesthetic:
          'Anime canted-frame staging: the camera rolls 20 to 35 degrees so the horizon and verticals tilt in the direction of the effort, making ordinary action feel off balance and urgent.',
        color_and_tone:
          'Keep the prompt palette with a slightly increased value contrast between subject and ground.',
        lighting_and_shadow:
          'Existing light kept, with cast shadows rotating with the tilt so they read as diagonals.',
        texture_and_material:
          'Clean cel surfaces; architectural lines stay straight but tilted, never warped.',
        camera_and_composition:
          'Eye-level or slightly low, rolled 20 to 35 degrees, with the subject pushing uphill against the tilt.',
        atmosphere_and_mood: 'Unsteady urgency and strain without any added threat.',
        rendering_and_quality:
          'Straight, confident perspective lines on the tilted grid and a stable readable subject.',
        key_features:
          'camera rolled 20-35 degrees; tilted horizon and verticals; subject pushing against the tilt; diagonal shadows; straight not warped lines',
      }),
      avoid: [...AVOID, 'fisheye distortion'],
      briefs: [
        'Anime canted frame of an adult sailor hauling a heavy line on the deck of a heeling cog, the whole picture rolled thirty degrees, horizon tilted steeply, mast and rigging straight but diagonal, her body pushing uphill against the tilt. No text or logo.',
        'Anime canted frame of an adult innkeeper sliding a full tankard down a long bar, camera rolled twenty-five degrees, the counter a steep diagonal, shadows rotating with the tilt. No text or logo.',
        'Anime canted frame of an adult woman pushing a loaded handcart up a muddy lane, horizon tilted against her effort, straight tilted fence posts, higher contrast between her and the ground. No text or logo.',
      ],
    },
    {
      name: 'Three-Beat Action Triptych',
      domain: 'anime action layout',
      tags: ['triptych', 'action-sequence'],
      dna: stage('a three-panel layout of anticipation, action and follow-through', {
        aesthetic:
          'Anime storyboard triptych: one requested action split into three side-by-side panels showing anticipation, the peak of action and the follow-through, with the same subject in each.',
        color_and_tone:
          'Keep the prompt palette identical across all three panels; only the middle panel gets the strongest value contrast.',
        lighting_and_shadow:
          'The same light direction in all panels so the three read as one continuous moment.',
        texture_and_material:
          'Clean cel rendering in every panel, thin dark gutters between them and no drawn text or panel numbers.',
        camera_and_composition:
          'Three equal vertical panels, the camera shifting slightly closer in the middle panel and pulling back for the follow-through.',
        atmosphere_and_mood:
          'Clear, satisfying cause and effect, like a well-timed animation key sequence.',
        rendering_and_quality:
          'Consistent model and costume across the panels, with each pose readable on its own.',
        key_features:
          'three equal panels; anticipation, peak, follow-through; same subject and light in each; thin textless gutters; closer middle panel',
      }),
      avoid: [...AVOID, 'speech balloons', 'panel numbers', 'different characters per panel'],
      briefs: [
        'Anime three-panel triptych of an adult shepherd vaulting a dry-stone wall with his crook: first panel crouched with the crook planted, middle panel airborne over the wall in close-up, last panel landing in the heather, thin dark gutters, same light in all three. No text or logo.',
        'Anime three-panel triptych of an adult glassblower swinging a gather of molten glass on a pipe: wind-up, full swing with the glowing gather stretched long, and the settled follow-through. No text or logo.',
        'Anime three-panel triptych of a red fox pouncing into deep snow: tensed and listening, arched high in the air, and buried nose-first with only its tail showing. No text or logo.',
      ],
    },
    {
      name: 'Near-Lens Pass-By Frame',
      domain: 'anime action staging',
      tags: ['near-lens', 'pass-by'],
      dna: stage('the pass-by framing where part of the subject sweeps across the lens', {
        aesthetic:
          'Anime pass-by staging: the moving subject sweeps past extremely close to the lens, a large part of it cropped and softly blurred in the near foreground, while the setting behind stays sharp.',
        color_and_tone:
          'Keep the prompt palette; the near-lens part reads as a large dark or saturated mass against a lighter background.',
        lighting_and_shadow:
          'Existing light on the background; the passing part is mostly in its own shadow with a bright edge.',
        texture_and_material:
          'Soft defocus on the near-lens part only, with crisp cel detail on everything beyond it.',
        camera_and_composition:
          'Static eye-level camera; the passing subject fills one side of the frame, cut by two frame edges, while the background occupies the rest.',
        atmosphere_and_mood: 'A sudden whoosh, the viewer almost brushed by the movement.',
        rendering_and_quality:
          'Controlled focus split between the soft near mass and the sharp background, with the subject still identifiable.',
        key_features:
          'subject sweeping past the lens; cropped by two frame edges; soft near-lens defocus; sharp background; bright edge on passing mass',
      }),
      avoid: AVOID,
      briefs: [
        'Anime pass-by frame inside a stone belfry as a raven sweeps right past the lens, one wing huge, cropped and softly defocused along the left edge, the bells and beams behind in crisp cel detail. No text or logo.',
        'Anime pass-by frame of an adult page running past the camera with a platter of roast fowl, his shoulder and the platter rim filling the right side in soft focus, the busy great hall sharp behind him. No text or logo.',
        'Anime pass-by frame of an adult flower seller hurrying past the lens with a swinging basket of sunflowers, the basket a big blurred yellow mass cut by two frame edges, the village green crisp beyond. No text or logo.',
      ],
    },
    {
      name: 'Top-Down Spiral Path Staging',
      domain: 'anime action staging',
      tags: ['top-down', 'spiral-composition'],
      dna: stage('the straight-down overhead view with a spiral path composition', {
        aesthetic:
          'Anime overhead staging: the camera looks straight down and the requested movement is arranged along a spiral or circular path, so the ground pattern and the action form one curling shape.',
        color_and_tone:
          'Keep the prompt palette; the ground is a calm mid value so the moving subject and its path stand out.',
        lighting_and_shadow:
          'Light from one side so cast shadows lie long and flat on the ground and reveal the pose.',
        texture_and_material:
          "Clear ground patterns like flagstones, boards, grass or water that help trace the spiral; faint path marks only where the subject's movement would leave them.",
        camera_and_composition:
          'Exact 90 degree top-down view with the spiral centered or slightly off center and the subject at its leading end.',
        atmosphere_and_mood: 'Hypnotic, choreographed flow seen calmly from directly above.',
        rendering_and_quality:
          'Clean flat perspective without distortion and readable shadow shapes that explain the pose.',
        key_features:
          'straight-down 90 degree view; spiral or circular path; subject at the leading end; long flat side-lit shadows; readable ground pattern',
      }),
      avoid: [...AVOID, 'perspective tilt'],
      briefs: [
        'Anime top-down frame of a flock of white doves circling low over a cloister fountain, seen from straight above, their flight forming a curling spiral around the basin, long flat shadows on the flagstones. No text or logo.',
        'Anime top-down frame of an adult woman running down a spiral tower staircase, the steps forming a tight spiral from directly overhead, her figure at its leading end, side light casting long shadows on the treads. No text or logo.',
        'Anime top-down frame of an adult farmer scattering grain in a wide circle while hens chase it, the arc of seed and birds forming a spiral on the packed-earth yard, calm mid-value ground. No text or logo.',
      ],
    },
    {
      name: 'Fisheye Foreshortened Reach',
      domain: 'anime action staging',
      tags: ['fisheye', 'foreshortening'],
      dna: stage('the ultra-wide close camera and extreme reach foreshortening', {
        aesthetic:
          'Anime fisheye staging: the subject reaches or throws straight toward an ultra-wide lens, the hand swelling to the size of the head while the body shrinks behind it and the edges of the scene curve.',
        color_and_tone:
          'Keep the prompt palette; the near hand is the brightest, most saturated area of the frame.',
        lighting_and_shadow:
          'Front light on the reaching hand, with the body behind falling half a stop darker.',
        texture_and_material:
          'Clean cel surfaces; detail concentrated on the near hand, simplified toward the curved edges.',
        camera_and_composition:
          'Ultra-wide lens under half a meter from the hand, barrel curvature on straight lines, the face small but readable behind the hand.',
        atmosphere_and_mood:
          'Direct, confrontational energy aimed at the viewer without hostility.',
        rendering_and_quality:
          'Controlled barrel distortion and believable anatomy through the extreme foreshortening.',
        key_features:
          'hand reaching into an ultra-wide lens; hand as large as the head; barrel-curved edges; bright near hand; small readable face behind',
      }),
      avoid: [...AVOID, 'broken anatomy'],
      briefs: [
        'Anime fisheye frame of an adult orchard keeper tossing a ripe pear straight at an ultra-wide lens, her open hand as large as her head, the rows of trees bending into a curve behind her, her small smiling face readable beyond the fingers. No text or logo.',
        'Anime fisheye frame of an adult wizard thrusting his open palm toward the viewer to cast a soft light charm, the palm swelling in the foreground, tower walls curving at the frame edges. No text or logo.',
        'Anime fisheye frame of an adult barmaid reaching out to catch a tossed coin just in front of the lens, fingers huge and bright, the tavern room bowed around her. No text or logo.',
      ],
    },
    {
      name: 'Cloth-and-Hair Follow-Through Trails',
      domain: 'anime action staging',
      tags: ['follow-through', 'secondary-motion'],
      dna: stage('the secondary-motion emphasis on cloth, hair and loose parts', {
        aesthetic:
          'Anime secondary-motion staging: the body has just stopped or turned, and everything loose on it, including hair, cloak, sleeves and straps, keeps flowing in long lagging S-curves that show where the movement came from.',
        color_and_tone:
          'Keep the prompt palette; cloth and hair take slightly lighter underside tones so their curves read clearly.',
        lighting_and_shadow:
          'Soft key light that runs along each fabric fold and hair lock, giving every curve a light and a dark side.',
        texture_and_material:
          'Flowing cel-shaded fabric and hair with clean tapering tips; no streaks or blur.',
        camera_and_composition:
          'Medium-full shot with space on the side the loose parts trail toward, the body near a third line.',
        atmosphere_and_mood: 'Graceful, lingering momentum after a decisive move.',
        rendering_and_quality: 'Clear S-curves of consistent lag and still, sharp faces and hands.',
        key_features:
          'lagging S-curves in hair and cloth; body already stopped or turned; tapering tips; light along each fold; trailing space',
      }),
      avoid: [...AVOID, 'motion blur'],
      briefs: [
        'Anime follow-through frame of an adult noblewoman turning sharply on a windy castle battlement, her body already still while her long cloak and braided hair keep sweeping in lagging S-curves behind her, light running along every fold. No text or logo.',
        'Anime follow-through frame of an adult ferrywoman landing on a dock after leaping from her boat, feet planted while her shawl, skirt and loose hair keep flowing forward in long curves, tapering tips. No text or logo.',
        'Anime follow-through frame of an adult herald leaping down from his saddle, feet just landed, the tabard, sleeves and hat feather still flaring upward in clean S-curves. No text or logo.',
      ],
    },
    {
      name: 'Tiny-Figure Grand Arc Wide',
      domain: 'anime action staging',
      tags: ['extreme-wide', 'scale-contrast'],
      dna: stage(
        'the extreme wide shot where a tiny subject draws one grand arc through vast space',
        {
          aesthetic:
            'Anime extreme-wide staging: the subject is tiny, under a twentieth of the frame height, while the path of its movement sweeps one grand clean arc across a vast landscape or interior.',
          color_and_tone:
            'Keep the prompt palette; the landscape stays in soft layered values while the subject and its arc carry the only sharp contrast.',
          lighting_and_shadow:
            'Broad atmospheric light with aerial perspective; a small bright highlight marks the subject.',
          texture_and_material:
            'Painted background layers with atmospheric haze; the arc is formed by existing material such as dust, wake, spray or footprints.',
          camera_and_composition:
            'Very wide establishing view from a high distant vantage, the arc spanning at least two thirds of the frame width.',
          atmosphere_and_mood:
            'Epic scale and solitude, one small life moving through a huge world.',
          rendering_and_quality:
            'Clean readable arc, a tiny but unmistakable subject, and painterly depth layers.',
          key_features:
            'tiny subject under one twentieth of frame height; one grand movement arc; vast layered space; high distant vantage; arc from existing material',
        },
      ),
      avoid: AVOID,
      briefs: [
        'Anime extreme-wide frame of a tiny adult sailor rowing a skiff across a vast glassy fjord, the wake behind the boat drawing one grand curving arc across two thirds of the frame, pale layered mountains on the horizon. No text or logo.',
        'Anime extreme-wide frame of a single swallow tracing a huge arc through a red sandstone canyon, the bird a bright speck, the arc marked by its reflection in the river far below. No text or logo.',
        'Anime extreme-wide frame of a tiny adult figure sliding down an enormous snow dune on a wooden shield, the track carving one clean arc down the slope, hazy peaks in layered blue values. No text or logo.',
      ],
    },
    {
      name: 'Coiled Anticipation Lead-Space Frame',
      domain: 'anime action staging',
      tags: ['anticipation', 'negative-space'],
      dna: stage('the pre-motion coiled pose and the large empty lead space', {
        aesthetic:
          'Anime anticipation staging: the instant before the requested action, the subject compressed into a tight coiled pose at one edge of the frame, facing a large empty lead space it is about to cross.',
        color_and_tone:
          'Keep the prompt palette; the empty lead space is a calm flat value while the subject holds the strongest contrast.',
        lighting_and_shadow:
          'Low side light that carves the tension in the coiled pose with hard short shadows.',
        texture_and_material:
          'Still surfaces, no motion marks at all; small tension details like gripping toes or taut fabric.',
        camera_and_composition:
          'The subject in the outer fifth of the frame, the rest left as open lead space in the direction of the coming move.',
        atmosphere_and_mood: 'Held breath and loaded stillness, energy about to release.',
        rendering_and_quality:
          'Precise pose drawing with visible weight shift, calm backgrounds and zero motion effects.',
        key_features:
          'coiled pre-motion pose; subject in outer fifth of frame; large empty lead space; no motion marks; low side light on the tension',
      }),
      avoid: [...AVOID, 'speed lines', 'motion blur'],
      briefs: [
        'Anime anticipation frame of an adult cliff diver crouched on a rock ledge at the far left edge, toes gripping and arms drawn back, a huge open lead space of calm lake and sky ahead, low side light, no motion marks. No text or logo.',
        'Anime anticipation frame of a young mountain goat coiled on a boulder, eyes on a higher ledge across a gap, the goat in the lower right corner and the rest of the frame open rock face and air. No text or logo.',
        'Anime anticipation frame of an adult jester crouched before a backflip on a bare wooden stage, body squeezed tight at the frame edge, open dark curtain space ahead of him. No text or logo.',
      ],
    },
    {
      name: 'Ground-Skim Low Tracking Shot',
      domain: 'anime action staging',
      tags: ['low-angle', 'tracking-shot'],
      dna: stage('the ankle-height camera racing along the ground ahead of the subject', {
        aesthetic:
          'Anime ground-skim staging: the camera races just above the ground ahead of the subject, so the near ground rushes in stretched detail at the bottom of the frame and the subject looms toward the lens from a low angle.',
        color_and_tone:
          'Keep the prompt palette; the rushing ground is the most saturated band and the sky stays light.',
        lighting_and_shadow:
          'Backlight or high side light that throws the subject shadow toward the camera across the ground.',
        texture_and_material:
          'Ground detail such as grass, stones or planks stretched into short streaks near the lens and sharp further back.',
        camera_and_composition:
          'Lens at ankle height, horizon in the lower third, subject approaching head-on or at a slight angle.',
        atmosphere_and_mood: 'Low, fast and immersive, as if running alongside.',
        rendering_and_quality:
          'Controlled ground streaking only in the near band and a crisp, stable subject.',
        key_features:
          'ankle-height camera ahead of subject; near ground stretched into streaks; horizon in lower third; shadow toward camera; looming low angle',
      }),
      avoid: AVOID,
      briefs: [
        'Anime ground-skim frame of a hare racing through a golden barley field toward the camera, lens at ankle height, near stalks stretched into short streaks along the bottom, the hare looming from a low angle, horizon in the lower third. No text or logo.',
        'Anime ground-skim frame of an adult maid running barefoot across a sunlit cloister lawn, camera racing just above the grass ahead of her, her shadow reaching toward the lens. No text or logo.',
        'Anime ground-skim frame of a team of husky dogs pulling an empty sled across a snowfield, lens skimming the snow ahead, near snow crust streaked, the lead dog huge and low against a pale sky. No text or logo.',
      ],
    },
    {
      name: 'Contact-Point Extreme Close-Up',
      domain: 'anime action staging',
      tags: ['extreme-close-up', 'contact-point'],
      dna: stage('the extreme close-up on the exact point of contact of the action', {
        aesthetic:
          'Anime insert shot: an extreme close-up of the exact point where the requested action makes contact, such as a hand, foot or hoof meeting a surface, with the rest of the subject cropped away.',
        color_and_tone:
          'Keep the prompt palette; the contact point is the brightest and sharpest area, the surroundings darker.',
        lighting_and_shadow:
          'Tight hard key light raking across the contact surface to show pressure and texture.',
        texture_and_material:
          'Magnified surface detail at the contact, like skin creases, wood grain or ice crystals, with small displaced particles only if the materials would shed them.',
        camera_and_composition:
          'Macro framing where the contact fills the center third, very shallow depth and nothing else of the subject visible.',
        atmosphere_and_mood: 'Tactile and precise, the whole action compressed into one touch.',
        rendering_and_quality:
          'Detailed but clean cel rendering at macro scale, with the kind of contact instantly readable.',
        key_features:
          'extreme close-up of the contact point; subject cropped away; raking hard key light; magnified surface detail; very shallow depth',
      }),
      avoid: AVOID,
      briefs: [
        'Anime insert shot of an adult hand catching a falling wine glass by its stem an inch above a flagstone floor, extreme close-up with the fingers closing around the stem, raking light, the rest of the person cropped away. No text or logo.',
        "Anime insert shot of an adult rider's boot finding the stirrup iron, macro framing on the sole meeting the metal, leather creases and a scuff of dust, very shallow depth. No text or logo.",
        'Anime insert shot of a green frog pushing off from a lily pad, extreme close-up of the long toes leaving the wet leaf surface, droplets lifting, dark pond beyond. No text or logo.',
      ],
    },
  ],
};

export default spec;
