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
        "Sprinting straight at the viewer down a narrow medieval street, a courier with a satchel of urgent letters kicks up blocky chunks of cobblestone as market stalls explode into flying crates behind her. No readable text or logo.",
        "Hurrying a steaming pot of soup through a crowded kitchen, a cook skids around a corner as square shards of broken plates burst into the air behind him. No readable text or logo.",
        "Dashing across a rain-soaked rooftop, a messenger leaps toward the lens as tiles shatter into chunky flying blocks under her boots. No readable text or logo.",
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
        "Looking steeply down from the clouds, a roofer walks the ridge beam of a cathedral in loose flowing strokes, the town far below twisting around her as a sudden gust tilts the whole world. No readable text or logo.",
        "Leaning over the rail of a spiral stair in a lighthouse, a keeper watches his dropped lantern tumble down the well, the stairs curling dizzyingly below. No readable text or logo.",
        "Clinging to the mast of a tall ship in a storm, a sailor looks down at the tiny deck as the sea swings beneath her. No readable text or logo.",
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
        "Spinning two long silk ribbons in a dark theater, a ribbon dancer leaves trails of sharp angular neon light that crack into triangular sparks at every turn of her wrists. No readable text or logo.",
        "Releasing a hawk from her gloved fist, a falconer twists in a sharp Kanada-style pose as the bird bursts away trailing geometric flashes of light. No readable text or logo.",
        "At a night fair, a fire-breather exhales a burst of flame drawn as sharp flat triangles of yellow and magenta. No readable text or logo.",
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
        "Bringing his hammer down on a glowing horseshoe, a burly blacksmith sends a monumental burst of sparks and shockwave across the forge that rattles every tool on the wall. No readable text or logo.",
        "Splitting a massive log on a frozen morning, a woodcutter’s axe lands so hard that frost bursts off the surrounding trees. No readable text or logo.",
        "A dockworker drops a crate onto a pier and the planks jump, sending a ring of water spraying outward. No readable text or logo.",
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
        "Climbing a hanging rope up the face of a storm-lashed cliff, a monk surges upward in rough energetic strokes as lightning cracks across the sky behind him. No readable text or logo.",
        "Hauling on a bell rope with her whole body, a bell-ringer is lifted off the floor as the bell swings and crackling sound waves burst upward. No readable text or logo.",
        "A kite flier is yanked into the air by a sudden gust, her kite crackling with static in the thundercloud above. No readable text or logo.",
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
        "Slinging a ball of dough onto a floured table, a baker’s arm dissolves into a long painterly smear of motion as flour explodes into swirling teal and orange arcs. No readable text or logo.",
        "Striking a great barrel drum at a festival, a drummer’s arms smear into bold brush arcs of color around the drumhead. No readable text or logo.",
        "Swinging a scythe through a golden wheat field, a farmer leaves a sweeping painterly arc of gold behind the blade. No readable text or logo.",
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
        "At the instant a stone-carver’s mallet strikes a chisel into a marble block, the whole workshop flips into a black-and-white negative as brushy shards burst from the stone. No readable text or logo.",
        "A draft horse’s hoof lands on a cobblestone and the street flashes into an inverted negative image around the spark. No readable text or logo.",
        "A blacksmith quenches a blade in water and the burst of steam turns the frame into a glowing negative. No readable text or logo.",
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
        "Casting a round net over a river at dawn, a fisherman is frozen mid-throw as the net spreads like a perfect circle and every droplet from its edges hangs in the air around him. No readable text or logo.",
        "A miller drops a sack of flour and the whole cloud of flour freezes mid-burst around her startled face. No readable text or logo.",
        "On a busy market square, a street juggler freezes mid-performance with five oranges suspended in a perfect arc above her hands while a pigeon hangs mid-flap beside them. No readable text or logo.",
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
        "Galloping a grey horse along a coastal road at sunset, a messenger stays crisp and sharp while the cliffs and sea behind her streak into long golden horizontal lines. No readable text or logo.",
        "Running along a wooden pier to catch a departing ferry, a woman stays sharp as the boats behind her blur into streaks of color. No readable text or logo.",
        "A cyclist races down a mountain road as the pine forest behind her smears into green horizontal streaks. No readable text or logo.",
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
        "Seen from directly below, a thief leaps the gap between two rooftops against a full moon, her body drawn in raw wild scribbles that seem to vibrate with the jump. No readable text or logo.",
        "A salmon leaps up a waterfall directly overhead, its body a rough scribbled silhouette against the bright spray. No readable text or logo.",
        "A dancer jumps over the camera at a street festival, her skirts a messy explosion of rough lines against the lanterns. No readable text or logo.",
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
        "On the deck of a heeling ship in a storm, a sailor hauls a heavy line with her whole body as the entire canted frame slants with the rolling sea. No readable text or logo.",
        "Pushing a loaded handcart up a steep village lane, a woman leans hard into the slope as the tilted frame emphasizes every step. No readable text or logo.",
        "A tug-of-war team strains against the rope at a harvest festival, the frame tilted with the pull. No readable text or logo.",
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
        "Across three panels, a shepherd vaults a dry-stone wall with his crook: crouching to push off, flying over the stones, and landing among his sheep who barely look up. No readable text or logo.",
        "In three beats, a red fox crouches, arcs high and plunges headfirst into deep snow after a mouse. No readable text or logo.",
        "Three panels show an old woman stepping off a train: reaching for the rail, stepping down and smiling at her grandson. No readable text or logo.",
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
        "Inside a stone belfry, a raven sweeps right past the lens so close that one wing fills half the frame, while the bell-ringer behind it looks up in surprise. No readable text or logo.",
        "Hurrying through a busy market, a flower seller brushes past the camera, a bouquet of sunflowers filling the foreground. No readable text or logo.",
        "A cat leaps from a windowsill right past the lens, its tail sweeping across the frame. No readable text or logo.",
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
        "Seen from directly above, a flock of white doves spirals low over a cloister fountain, their flight paths curling into a perfect swirling pattern around the water. No readable text or logo.",
        "Scattering grain in wide spirals, a farmer is circled by a whirling flock of hens seen from overhead. No readable text or logo.",
        "Seen from high above a frozen village pond, a dozen skaters spiral outward, their curved blade tracks forming one perfect swirling whirlpool in the ice. No readable text or logo.",
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
        "Tossing a ripe pear straight at the viewer, an orchard keeper’s hand swells enormous in an ultra-wide fisheye frame while the trees curve around her. No readable text or logo.",
        "Leaning over a crowded tavern bar, a barmaid lunges to catch a falling beer mug, her outstretched hand looming enormous toward the fisheye lens. No readable text or logo.",
        "A child-sized robot vendor thrusts an ice cream cone at the camera, the cone massive in the foreground. No readable text or logo.",
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
        "Turning sharply on a windy castle battlement, a noblewoman stops still while her long cloak and hair keep sweeping around her in graceful trailing arcs. No readable text or logo.",
        "Leaping down from a wagon, a herald lands while his long scarf and plumed hat keep trailing behind him. No readable text or logo.",
        "Finishing a fast spin on a village stage, a folk dancer freezes in place while her long embroidered skirt keeps swirling in wide arcs around her legs. No readable text or logo.",
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
        "Rowing a tiny skiff across a vast glassy fjord, a small sailor traces a long curving wake beneath towering mountains as a pod of whales surfaces nearby. No readable text or logo.",
        "Sliding down a huge snowy slope on a tray, a tiny figure carves a giant arc across the white mountainside. No readable text or logo.",
        "A tiny biplane loops over a huge canyon, its trail drawing a grand arc against the sky. No readable text or logo.",
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
        "Crouched on a rock ledge at the far left of the frame, a cliff diver coils every muscle as the empty sea and sky stretch out before her, waiting for the jump. No readable text or logo.",
        "A jester crouches before a leap in a crowded hall, all the empty space ahead of him waiting. No readable text or logo.",
        "A cat crouches at the edge of a table, tail twitching, staring at a butterfly across the room. No readable text or logo.",
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
        "Skimming just above the ground, the camera races alongside a hare sprinting through a golden barley field as stalks whip past and seeds scatter into the sunlight. No readable text or logo.",
        "A team of huskies pulls a sled across fresh snow, the camera skimming the surface as powder sprays. No readable text or logo.",
        "Racing down a steep cobbled lane, a runaway wine barrel bounces over the stones while the camera skims right behind it at ankle height. No readable text or logo.",
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
        "In an extreme close-up, a hand catches a falling wine glass by its stem an inch above the stone floor as a single drop of wine leaps from the rim in a sparkling arc. No readable text or logo.",
        "A green frog pushes off from a lily pad, its toes and a spray of water frozen in extreme close-up. No readable text or logo.",
        "A match strikes against the box in extreme close-up, sparks bursting at the point of contact. No readable text or logo.",
      ],
    },
  ],
};

export default spec;
