import type { Spec } from '../tools/apply';
import { au } from './_authors';

// Action motion setpieces, author pass: each staging technique names the sakuga key animator best
// known for it and describes the concrete marks of that animator's drawing and timing.
const cel =
  'Hand-drawn key animation on clean digital cel, with visible drawing energy in lines, effects and debris.';
const render =
  'Showpiece sakuga key frame where the drawing itself carries the motion, never a generic still pose.';

const spec: Spec = {
  pack: 'pack_05',
  category: '5. Action Motion Setpieces',
  updates: Object.fromEntries([
    au('SP13-021', 'Yutaka Nakamura - Action Burst Alley Rush', {
      look: 'Yutaka Nakamura sakuga as in his BONES action scenes: bodies launched forward with extreme perspective, square chunky debris flying in blocky shapes, dust clouds and sharp shadow flashes.',
      subject:
        'draw figures with compact muscular action poses, clothes snapping with speed and limbs thrust toward the viewer in extreme perspective.',
      color:
        'Neutral street palette with sharp white impact flashes and warm dust tones across the whole frame.',
      light:
        'Flat daylight broken by sudden hard shadow flashes that snap across figures at the moment of impact.',
      texture: cel,
      camera:
        'Forward rush straight at the lens, with blocky debris and dust bursting outward around the figure.',
      mood: 'explosive forward momentum',
      render,
      key: 'Yutaka Nakamura blocky debris; extreme perspective rush; shadow flashes; dust bursts',
      briefs: [
        'Sprinting straight at the viewer down a narrow medieval street, a courier with a satchel of urgent letters kicks up blocky chunks of cobblestone as market stalls explode into flying crates behind her. No readable text or logo.',
        'Hurrying a steaming pot of soup through a crowded kitchen, a cook skids around a corner as square shards of broken plates burst into the air behind him. No readable text or logo.',
        'Dashing across a rain-soaked rooftop, a messenger leaps toward the lens as tiles shatter into chunky flying blocks under her boots. No readable text or logo.',
      ],
    }),
    au('SP13-022', 'Norio Matsumoto - Vertigo Energy Cross Style', {
      look: 'Norio Matsumoto sakuga as in his fight scenes: loose rough flowing lines, bodies drawn with elastic weight, swooping camera turns and scenes that feel painted in motion rather than posed.',
      subject:
        'draw figures with loose expressive lines that stretch and bend with motion, hair and clothes streaming in fluid rough strokes.',
      color:
        'Muted naturalistic palette with sudden bright accents where motion peaks, kept loose and painterly.',
      light:
        'Soft natural light that shifts as the camera swoops, with rough painted shadow shapes.',
      texture:
        'Loose rough pencil-like lines, painterly smears and minimal cleanup that keeps the drawing alive.',
      camera:
        'Steep vertigo angles, swooping camera rotations and figures seen from dizzying heights.',
      mood: 'dizzying fluid motion',
      render,
      key: 'Norio Matsumoto loose line; swooping camera; elastic bodies; vertigo',
      briefs: [
        'Looking steeply down from the clouds, a roofer walks the ridge beam of a cathedral in loose flowing strokes, the town far below twisting around her as a sudden gust tilts the whole world. No readable text or logo.',
        'Leaning over the rail of a spiral stair in a lighthouse, a keeper watches his dropped lantern tumble down the well, the stairs curling dizzyingly below. No readable text or logo.',
        'Clinging to the mast of a tall ship in a storm, a sailor looks down at the tiny deck as the sea swings beneath her. No readable text or logo.',
      ],
    }),
    au('SP13-023', 'Yoshinori Kanada - Neon Vector Discharge Style', {
      look: 'Yoshinori Kanada sakuga style: angular geometric light effects, sharp triangular flames and sparks, stylized Kanada poses with bent limbs and bold graphic explosions in flat color.',
      subject:
        'draw figures in angular dynamic Kanada poses, sharp bent limbs and flat stylized silhouettes caught mid-action.',
      color: 'Bold flat neon yellow, magenta and cyan effects against dark flat backgrounds.',
      light:
        'Graphic flat light where glowing angular shapes of energy replace realistic light sources.',
      texture: 'Flat color effect shapes, sharp triangular sparks and crisp geometric outlines.',
      camera: 'Stylized dramatic angles with angular effect shapes framing the action.',
      mood: 'sharp electric dynamism',
      render,
      key: 'Kanada angular effects; triangular sparks; stylized poses; flat neon',
      briefs: [
        'Spinning two long silk ribbons in a dark theater, a ribbon dancer leaves trails of sharp angular neon light that crack into triangular sparks at every turn of her wrists. No readable text or logo.',
        'Releasing a hawk from her gloved fist, a falconer twists in a sharp Kanada-style pose as the bird bursts away trailing geometric flashes of light. No readable text or logo.',
        'At a night fair, a fire-breather exhales a burst of flame drawn as sharp flat triangles of yellow and magenta. No readable text or logo.',
      ],
    }),
    au('SP13-024', 'Tatsuyuki Tanaka - Monumental Impact Burst Style', {
      look: 'Tatsuyuki Tanaka sakuga and illustration as in his Akira-era key animation: meticulous mechanical weight, precise detailed impact, heavy believable mass and dense controlled effects.',
      subject:
        'draw figures with precise weighty anatomy and heavy believable tools, every impact showing real mass.',
      color: 'Warm forge oranges, iron greys and precise bright highlights on metal.',
      light: 'Hot glowing impact light and hard realistic shadows around heavy objects.',
      texture: cel,
      camera: 'Heavy low angles on the moment of impact with detailed sparks and debris.',
      mood: 'monumental weighty impact',
      render,
      key: 'Tatsuyuki Tanaka weight; precise impact; heavy mass; detailed sparks',
      briefs: [
        'Bringing his hammer down on a glowing horseshoe, a burly blacksmith sends a monumental burst of sparks and shockwave across the forge that rattles every tool on the wall. No readable text or logo.',
        'Splitting a massive log on a frozen morning, a woodcutter’s axe lands so hard that frost bursts off the surrounding trees. No readable text or logo.',
        'A dockworker drops a crate onto a pier and the planks jump, sending a ring of water spraying outward. No readable text or logo.',
      ],
    }),
    au('SP13-025', 'Ryotaro Makihara - Upward Thunder Momentum Style', {
      look: 'Ryotaro Makihara sakuga as in his Mob Psycho and Fate action: rough energetic lines, big vertical motion, crackling lightning-like effects and bold stylized smears.',
      subject:
        'draw figures with rough energetic lines, stretched limbs climbing or rising, and clothes whipping upward.',
      color: 'Deep storm blues with bright electric yellow and white effect accents.',
      light: 'Crackling lightning-like effect light and storm backlight on climbing figures.',
      texture: 'Rough energetic lines, crackle effects and stylized smears.',
      camera: 'Vertical upward compositions with figures rising toward the top of the frame.',
      mood: 'surging upward momentum',
      render,
      key: 'Ryotaro Makihara rough energy; vertical motion; crackling effects',
      briefs: [
        'Climbing a hanging rope up the face of a storm-lashed cliff, a monk surges upward in rough energetic strokes as lightning cracks across the sky behind him. No readable text or logo.',
        'Hauling on a bell rope with her whole body, a bell-ringer is lifted off the floor as the bell swings and crackling sound waves burst upward. No readable text or logo.',
        'A kite flier is yanked into the air by a sudden gust, her kite crackling with static in the thundercloud above. No readable text or logo.',
      ],
    }),
    au('SP13-036', 'Shingo Yamashita - Smear-Frame Arc Staging', {
      look: 'Shingo Yamashita sakuga as in his Naruto Shippuden and Mob episodes: painterly smear frames, bold colored effect arcs, digital brush textures and high-speed swirling motion.',
      subject:
        'draw figures dissolving into painterly smears along the arc of their motion, with limbs stretched into brush strokes.',
      color: 'Teal and orange smears, warm flour white and bold colored arcs.',
      light: 'Painterly light that streaks along the smear arcs.',
      texture: 'Digital brush smears, painterly effect arcs and loose textured strokes.',
      camera: 'Arc-shaped motion staging that sweeps across the frame.',
      mood: 'swirling painterly speed',
      render,
      key: 'Shingo Yamashita smears; painterly arcs; digital brush; speed',
      briefs: [
        'Slinging a ball of dough onto a floured table, a baker’s arm dissolves into a long painterly smear of motion as flour explodes into swirling teal and orange arcs. No readable text or logo.',
        'Striking a great barrel drum at a festival, a drummer’s arms smear into bold brush arcs of color around the drumhead. No readable text or logo.',
        'Swinging a scythe through a golden wheat field, a farmer leaves a sweeping painterly arc of gold behind the blade. No readable text or logo.',
      ],
    }),
    au('SP13-037', 'Yoshimichi Kameda - Negative Impact Frame Staging', {
      look: 'Yoshimichi Kameda sakuga as in his Fullmetal Alchemist and Mob Psycho impacts: brushy bold lines, inverted negative impact frames, ink-like shapes and powerful graphic hits.',
      subject:
        'draw figures with brushy bold outlines and a single inverted negative frame at the moment of contact.',
      color: 'Inverted black and white impact frames with one hot accent color.',
      light: 'Negative-image flash at impact, turning shadows white and lights black.',
      texture: 'Brushy ink-like lines and bold graphic impact shapes.',
      camera: 'Tight impact framing at the exact instant of contact.',
      mood: 'shocking graphic impact',
      render,
      key: 'Yoshimichi Kameda brush lines; negative impact frames; graphic hits',
      briefs: [
        'At the instant a stone-carver’s mallet strikes a chisel into a marble block, the whole workshop flips into a black-and-white negative as brushy shards burst from the stone. No readable text or logo.',
        'A draft horse’s hoof lands on a cobblestone and the street flashes into an inverted negative image around the spark. No readable text or logo.',
        'A blacksmith quenches a blade in water and the burst of steam turns the frame into a glowing negative. No readable text or logo.',
      ],
    }),
    au('SP13-038', 'Takeshi Honda - Bullet-Time Orbit Freeze', {
      look: 'Takeshi Honda precise key animation as in his Evangelion and Ghibli work: exact realistic anatomy, careful detail frozen in a single instant, and elegant controlled motion.',
      subject:
        'draw figures with precise realistic anatomy frozen mid-action, every fold and droplet exact.',
      color: 'Natural river blues and greens with clear bright highlights on water droplets.',
      light: 'Crisp natural light catching each frozen droplet and thread.',
      texture: 'Precise clean lines and exact detailed rendering of frozen particles.',
      camera: 'Orbiting frozen-instant camera view circling the figure caught exactly mid-action.',
      mood: 'suspended precise instant',
      render,
      key: 'Takeshi Honda precision; frozen instant; exact anatomy; orbit view',
      briefs: [
        'Casting a round net over a river at dawn, a fisherman is frozen mid-throw as the net spreads like a perfect circle and every droplet from its edges hangs in the air around him. No readable text or logo.',
        'A miller drops a sack of flour and the whole cloud of flour freezes mid-burst around her startled face. No readable text or logo.',
        'On a busy market square, a street juggler freezes mid-performance with five oranges suspended in a perfect arc above her hands while a pigeon hangs mid-flap beside them. No readable text or logo.',
      ],
    }),
    au('SP13-039', 'Akira Amemiya - Panning Background Streak Frame', {
      look: 'Akira Amemiya Trigger action look: fast tracking pans with streaked backgrounds, bold graphic speed, flat stylized characters and punchy kinetic energy.',
      subject:
        'draw figures crisp and bold while the background streaks into horizontal lines of speed behind them.',
      color: 'Bold flat colors and streaked background blues and golds.',
      light: 'Flat graphic light with bright speed highlights running along the moving figure.',
      texture: 'Clean flat cel characters over horizontally streaked painted backgrounds.',
      camera: 'Side-tracking pans that streak the background while the figure stays sharp.',
      mood: 'punchy kinetic speed',
      render,
      key: 'Akira Amemiya pans; streaked backgrounds; bold graphic speed',
      briefs: [
        'Galloping a grey horse along a coastal road at sunset, a messenger stays crisp and sharp while the cliffs and sea behind her streak into long golden horizontal lines. No readable text or logo.',
        'Running along a wooden pier to catch a departing ferry, a woman stays sharp as the boats behind her blur into streaks of color. No readable text or logo.',
        'A cyclist races down a mountain road as the pine forest behind her smears into green horizontal streaks. No readable text or logo.',
      ],
    }),
    au('SP13-040', 'Shinya Ohira - Worm’s-Eye Leap Silhouette', {
      look: 'Shinya Ohira sakuga style: extremely rough wild expressive lines, raw sketchy bodies, messy energy and unconventional distorted drawing that feels alive.',
      subject:
        'draw figures with raw rough sketchy lines, distorted wild anatomy and messy expressive energy.',
      color: 'Muted night palette with stark silhouettes against a bright sky.',
      light: 'Strong backlight turning the leaping figure into a rough silhouette.',
      texture: 'Very rough sketchy lines, scribbles and uncleaned drawing marks.',
      camera: 'Worm’s-eye view looking straight up at the figure leaping overhead.',
      mood: 'raw wild energy',
      render,
      key: 'Shinya Ohira rough lines; worm’s-eye leap; raw energy; silhouettes',
      briefs: [
        'Seen from directly below, a thief leaps the gap between two rooftops against a full moon, her body drawn in raw wild scribbles that seem to vibrate with the jump. No readable text or logo.',
        'A salmon leaps up a waterfall directly overhead, its body a rough scribbled silhouette against the bright spray. No readable text or logo.',
        'A dancer jumps over the camera at a street festival, her skirts a messy explosion of rough lines against the lanterns. No readable text or logo.',
      ],
    }),
    au('SP13-041', 'Kenichi Kutsuna - Dutch Tilt Momentum Frame', {
      look: 'Kenichi Kutsuna sakuga as in his action episodes: dynamic canted compositions, strong diagonal momentum, detailed physical effort and weighty cloth and rope.',
      subject:
        'draw figures straining with visible physical effort, leaning hard against diagonal forces.',
      color: 'Sea greys, rope browns and stormy blue light.',
      light: 'Stormy directional light that emphasizes the tilted diagonals.',
      texture: cel,
      camera: 'Strong Dutch tilt with the horizon slanted and all motion running diagonally.',
      mood: 'straining diagonal momentum',
      render,
      key: 'Kenichi Kutsuna diagonals; Dutch tilt; physical effort; weighty rope',
      briefs: [
        'On the deck of a heeling ship in a storm, a sailor hauls a heavy line with her whole body as the entire canted frame slants with the rolling sea. No readable text or logo.',
        'Pushing a loaded handcart up a steep village lane, a woman leans hard into the slope as the tilted frame emphasizes every step. No readable text or logo.',
        'A tug-of-war team strains against the rope at a harvest festival, the frame tilted with the pull. No readable text or logo.',
      ],
    }),
    au('SP13-042', 'Satoru Utsunomiya - Three-Beat Action Triptych', {
      look: 'Satoru Utsunomiya realist sakuga: naturalistic observed motion, round soft forms, accurate weight shifts and the beauty of ordinary movement broken into clear beats.',
      subject:
        'draw figures with naturalistic rounded forms and accurate weight shifts through each beat of the action.',
      color: 'Soft countryside greens, stone greys and warm sky light.',
      light: 'Soft natural daylight consistent across all three panels.',
      texture: cel,
      camera: 'Three side-by-side panels showing the start, peak and landing of one motion.',
      mood: 'observed natural grace',
      render,
      key: 'Satoru Utsunomiya realism; triptych beats; natural weight; soft forms',
      briefs: [
        'Across three panels, a shepherd vaults a dry-stone wall with his crook: crouching to push off, flying over the stones, and landing among his sheep who barely look up. No readable text or logo.',
        'In three beats, a red fox crouches, arcs high and plunges headfirst into deep snow after a mouse. No readable text or logo.',
        'Three panels show an old woman stepping off a train: reaching for the rail, stepping down and smiling at her grandson. No readable text or logo.',
      ],
    }),
    au('SP13-043', 'Toshiyuki Inoue - Near-Lens Pass-By Frame', {
      look: 'Toshiyuki Inoue realist key animation: meticulously observed natural movement, precise perspective, grounded detail and objects passing close to the camera with real depth.',
      subject:
        'draw figures and animals with precise realistic proportions and natural motion, one passing extremely close to the lens.',
      color: 'Natural stone greys, feather blacks and warm interior light.',
      light: 'Naturalistic light with slight motion blur on the near object.',
      texture: cel,
      camera: 'Near-lens pass-by with one element sweeping huge across the foreground.',
      mood: 'intimate startling immediacy',
      render,
      key: 'Toshiyuki Inoue realism; near-lens pass-by; precise perspective',
      briefs: [
        'Inside a stone belfry, a raven sweeps right past the lens so close that one wing fills half the frame, while the bell-ringer behind it looks up in surprise. No readable text or logo.',
        'Hurrying through a busy market, a flower seller brushes past the camera, a bouquet of sunflowers filling the foreground. No readable text or logo.',
        'A cat leaps from a windowsill right past the lens, its tail sweeping across the frame. No readable text or logo.',
      ],
    }),
    au('SP13-044', 'Ichiro Itano - Top-Down Spiral Path Staging', {
      look: 'Ichiro Itano circus style: swirling spiral trajectories, dozens of trails curving around each other, dizzying camera paths and dense choreographed motion.',
      subject:
        'draw figures or animals as small elements following swirling spiral paths seen from above.',
      color: 'White trails, stone cloister grey and bright sky reflections.',
      light: 'Bright overhead light glinting along the curving trails.',
      texture: cel,
      camera: 'Top-down view looking straight down at spiraling paths.',
      mood: 'dizzying choreographed flight',
      render,
      key: 'Itano circus spirals; swirling trails; top-down; choreographed motion',
      briefs: [
        'Seen from directly above, a flock of white doves spirals low over a cloister fountain, their flight paths curling into a perfect swirling pattern around the water. No readable text or logo.',
        'Scattering grain in wide spirals, a farmer is circled by a whirling flock of hens seen from overhead. No readable text or logo.',
        'Seen from high above a frozen village pond, a dozen skaters spiral outward, their curved blade tracks forming one perfect swirling whirlpool in the ice. No readable text or logo.',
      ],
    }),
    au('SP13-045', 'Sushio - Fisheye Foreshortened Reach', {
      look: 'Sushio sakuga as in Kill la Kill and Promare: extreme fisheye foreshortening, hands and objects thrust huge toward the lens, bold flat color and punchy graphic energy.',
      subject:
        'draw figures with extreme foreshortening, a reaching hand or thrown object enormous in the foreground.',
      color: 'Bold flat orchard greens, bright fruit colors and clean highlights.',
      light: 'Flat bright light with bold graphic shading shapes and thick outlines.',
      texture: 'Clean flat color with thick outlines and graphic shapes.',
      camera: 'Ultra-wide fisheye with extreme foreshortening toward the lens.',
      mood: 'punchy playful reach',
      render,
      key: 'Sushio foreshortening; fisheye; thrust hands; bold flat color',
      briefs: [
        'Tossing a ripe pear straight at the viewer, an orchard keeper’s hand swells enormous in an ultra-wide fisheye frame while the trees curve around her. No readable text or logo.',
        'Leaning over a crowded tavern bar, a barmaid lunges to catch a falling beer mug, her outstretched hand looming enormous toward the fisheye lens. No readable text or logo.',
        'A child-sized robot vendor thrusts an ice cream cone at the camera, the cone massive in the foreground. No readable text or logo.',
      ],
    }),
    au('SP13-046', 'Mitsuo Iso - Cloth-and-Hair Follow-Through Trails', {
      look: 'Mitsuo Iso full-limited animation: realistic follow-through of cloth and hair, precise timing, natural overlapping motion and meticulous secondary action.',
      subject:
        'draw figures with natural overlapping motion where cloth and hair follow through after the body stops.',
      color: 'Windy castle greys, rich fabric colors and sky blue.',
      light: 'Bright windy daylight catching every fold of fluttering fabric and loose hair.',
      texture: cel,
      camera: 'Medium shots that emphasize trailing cloth and hair as the body comes to rest.',
      mood: 'graceful windswept motion',
      render,
      key: 'Mitsuo Iso follow-through; cloth and hair; secondary motion',
      briefs: [
        'Turning sharply on a windy castle battlement, a noblewoman stops still while her long cloak and hair keep sweeping around her in graceful trailing arcs. No readable text or logo.',
        'Leaping down from a wagon, a herald lands while his long scarf and plumed hat keep trailing behind him. No readable text or logo.',
        'Finishing a fast spin on a village stage, a folk dancer freezes in place while her long embroidered skirt keeps swirling in wide arcs around her legs. No readable text or logo.',
      ],
    }),
    au('SP13-047', 'Yasuo Otsuka - Tiny-Figure Grand Arc Wide', {
      look: 'Yasuo Otsuka classic animation: charming lively motion, tiny figures moving with big clear arcs across grand landscapes, and joyful mechanical detail.',
      subject:
        'draw tiny figures with clear readable silhouettes moving in big arcs across vast landscapes.',
      color: 'Glassy fjord blues, mountain greens and clean sky tones.',
      light: 'Clear bright daylight over vast painted landscapes and open skies.',
      texture: 'Classic clean hand-drawn cel with lush painted landscape backgrounds.',
      camera: 'Extreme wide shots with tiny figures tracing big arcs.',
      mood: 'joyful vast adventure',
      render,
      key: 'Yasuo Otsuka charm; tiny figures; grand arcs; vast landscapes',
      briefs: [
        'Rowing a tiny skiff across a vast glassy fjord, a small sailor traces a long curving wake beneath towering mountains as a pod of whales surfaces nearby. No readable text or logo.',
        'Sliding down a huge snowy slope on a tray, a tiny figure carves a giant arc across the white mountainside. No readable text or logo.',
        'A tiny biplane loops over a huge canyon, its trail drawing a grand arc against the sky. No readable text or logo.',
      ],
    }),
    au('SP13-048', 'Hironori Tanaka - Coiled Anticipation Lead-Space Frame', {
      look: 'Hironori Tanaka action sakuga: strong anticipation poses, coiled compressed bodies ready to spring, clear lead space and snappy timing.',
      subject:
        'draw figures coiled in deep anticipation, body compressed and weight loaded before explosive release.',
      color: 'Sea blue, rock grey and bright summer highlights.',
      light: 'Bright summer light with crisp short shadows and glittering sea.',
      texture: cel,
      camera: 'Figure placed at one edge with wide lead space in the direction of the coming leap.',
      mood: 'tense coiled anticipation',
      render,
      key: 'Hironori Tanaka anticipation; coiled poses; lead space; snappy timing',
      briefs: [
        'Crouched on a rock ledge at the far left of the frame, a cliff diver coils every muscle as the empty sea and sky stretch out before her, waiting for the jump. No readable text or logo.',
        'A jester crouches before a leap in a crowded hall, all the empty space ahead of him waiting. No readable text or logo.',
        'A cat crouches at the edge of a table, tail twitching, staring at a butterfly across the room. No readable text or logo.',
      ],
    }),
    au('SP13-049', 'Masahiro Ando - Ground-Skim Low Tracking Shot', {
      look: 'Masahiro Ando action direction as in Sword of the Stranger: grounded fast motion, low tracking camera skimming terrain and precise dynamic choreography.',
      subject:
        'draw figures and animals racing close to the ground, with realistic motion and kicked-up debris.',
      color: 'Golden barley, earth browns, dusty gold light and clear sky blue.',
      light: 'Warm low sunlight skimming the ground and lighting the flying debris.',
      texture: cel,
      camera: 'Low tracking shot skimming the ground toward or alongside the subject.',
      mood: 'rushing grounded speed',
      render,
      key: 'Masahiro Ando low tracking; ground skim; grounded speed',
      briefs: [
        'Skimming just above the ground, the camera races alongside a hare sprinting through a golden barley field as stalks whip past and seeds scatter into the sunlight. No readable text or logo.',
        'A team of huskies pulls a sled across fresh snow, the camera skimming the surface as powder sprays. No readable text or logo.',
        'Racing down a steep cobbled lane, a runaway wine barrel bounces over the stones while the camera skims right behind it at ankle height. No readable text or logo.',
      ],
    }),
    au('SP13-050', 'Takafumi Hori - Contact-Point Extreme Close-Up', {
      look: 'Takafumi Hori sakuga as in his effects-heavy action: explosive contact points, detailed close-up effects, crisp bright highlights and satisfying moments of impact.',
      subject: 'draw hands and objects in extreme close-up at the exact point of contact.',
      color: 'Deep background tones with sharp bright highlights at the contact point.',
      light: 'Crisp highlights and sparkles at the moment of contact.',
      texture: cel,
      camera: 'Extreme close-up insert shot framed tightly on the exact contact point.',
      mood: 'crisp satisfying contact',
      render,
      key: 'Takafumi Hori effects; contact close-ups; crisp highlights',
      briefs: [
        'In an extreme close-up, a hand catches a falling wine glass by its stem an inch above the stone floor as a single drop of wine leaps from the rim in a sparkling arc. No readable text or logo.',
        'A green frog pushes off from a lily pad, its toes and a spray of water frozen in extreme close-up. No readable text or logo.',
        'A match strikes against the box in extreme close-up, sparks bursting at the point of contact. No readable text or logo.',
      ],
    }),
  ]),
};

export default spec;
