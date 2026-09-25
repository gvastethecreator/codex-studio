import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'exact studio character copy',
  'franchise likeness',
  'mascot likeness',
  'celebrity likeness',
  'readable fake text',
  'adding a studio-like cast the prompt did not ask for',
];

// Animation presets are media: the subject is redrawn in the medium, never replaced by a studio cast.
const medium =
  'Keep the prompt subject, action and setting and redraw them in this animation medium; a non-character subject keeps its identity and no studio-like cast or mascot is added.';

function anim(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? medium, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_02',
  category: '3. Animation Styles',
  updates: {
    'SP02-031': {
      name: 'Golden Age Multiplane Cel Feature',
      dna: anim({
        aesthetic:
          'Golden-age cel feature animation: hand-inked characters on clear cels over lush watercolor and gouache backgrounds, shot through a multiplane camera for layered depth.',
        color_and_tone:
          'Rich storybook palette: deep forest greens, dusk violets, warm lantern golds; cels flat and luminous against softer painted backgrounds.',
        lighting_and_shadow:
          'Painted light in the backgrounds, soft airbrushed shadow tones on the cels, glowing highlights on lanterns and eyes.',
        texture_and_material:
          'Clean ink contours with thin-thick variation, gouache and watercolor granulation in backgrounds.',
        camera_and_composition:
          'Multiplane depth: blurred foreground foliage, crisp midground action, hazy painted distance.',
        atmosphere_and_mood: 'Enchanted and tender, a fairy tale unfolding in painted layers.',
        rendering_and_quality:
          'Hand-made 35 mm cel feature finish; original designs only, no studio characters.',
        key_features:
          'inked cels over painted backgrounds; multiplane depth; storybook palette; airbrushed cel shadow; luminous highlights',
      }),
      avoid: [...AVOID, '3d', 'digital vector'],
      briefs: [
        'Golden-age cel animation frame of an adult woodcutter carrying a lantern into a deep painted forest, blurred foreground trees on the nearest multiplane layer, watercolor mist behind, hand-inked contours. No text or logo.',
        'Golden-age cel frame of a stone castle on a crag at dusk painted in gouache, inked cel ravens circling its towers against a violet sky. No text or logo.',
        'Golden-age cel frame of an adult witch stirring a copper cauldron in a cozy cottage, airbrushed shadow on her face, painted firelight on the walls. No text or logo.',
      ],
    },
    'SP02-032': {
      name: 'Painterly Nature Anime Feature',
      dna: anim({
        aesthetic:
          'Painterly nature anime feature: simple cel characters set inside richly hand-painted, breathing landscapes of grass, cloud and forest.',
        color_and_tone:
          'Fresh greens, high summer blues, warm dappled golds; cels in soft flat color over dense watercolor-gouache backgrounds.',
        lighting_and_shadow:
          'Dappled sunlight through leaves, towering bright cumulus, soft two-tone cel shadow.',
        texture_and_material:
          'Visible brush texture in grass, bark and cloud; delicate pencil lines on characters.',
        camera_and_composition:
          'Wide landscape with small figures, wind visible in grass and hair, quiet pauses in the frame.',
        atmosphere_and_mood: 'Gentle and wondrous, everyday magic breathing in the wind.',
        rendering_and_quality:
          'Hand-painted feature finish; original characters, no studio designs.',
        key_features:
          'hand-painted landscapes; small cel figures; wind in grass; dappled light; towering cumulus',
      }),
      avoid: [...AVOID, 'harsh digital gloss'],
      briefs: [
        'Painterly nature anime frame of an adult traveler resting under a giant camphor tree while wind ripples the tall grass, towering summer cumulus behind, dappled light on her face. No text or logo.',
        'Painterly nature anime frame of a moss-covered stone shrine deep in a cedar forest, a small floating spirit of light hovering in a sunbeam. No text or logo.',
        'Painterly nature anime frame of an old wooden bathhouse on stilts over a misty lake at dawn, reeds and lily pads painted in thick gouache. No text or logo.',
      ],
    },
    'SP02-033': {
      name: 'Family Feature CG Animation',
      dna: anim({
        aesthetic:
          'Family feature CG animation: stylized 3D characters with appealing rounded shapes, expressive faces and warm cinematic lighting.',
        color_and_tone:
          'Vibrant but harmonious color, warm bounce light, saturated accents, soft blue fill.',
        lighting_and_shadow:
          'Soft key with warm bounce and subsurface glow in skin, gentle rim light separating silhouettes.',
        texture_and_material:
          'Rounded bevels, slightly soft fabrics, subtle surface imperfections that make materials tactile.',
        camera_and_composition:
          'Cinematic framing at character eye level, clear silhouettes, shallow depth of field.',
        atmosphere_and_mood: 'Warm and funny, emotional storytelling with lovable imperfection.',
        rendering_and_quality:
          'Polished feature-film CG; original characters only, no studio designs.',
        key_features:
          'rounded appealing CG shapes; warm bounce light; subsurface skin glow; expressive faces; shallow cinematic depth',
      }),
      avoid: [...AVOID, '2d', 'photoreal'],
      briefs: [
        'Family feature CG frame of an adult grumpy dwarf blacksmith and a clumsy dragon hatchling in a warm forge, the hatchling sneezing sparks onto his beard, subsurface glow and rounded shapes. No text or logo.',
        'Family feature CG frame of an adult elderly witch knitting a long striped scarf for a gargoyle on her rooftop at dusk, warm bounce light, soft blue fill. No text or logo.',
        'Family feature CG frame of a wooden toy knight and a felt toy dragon facing off on a messy desk at night, lit by a desk lamp, shallow depth of field. No text or logo.',
      ],
    },
    'SP02-034': {
      name: 'Moody Miniature Stop-Motion',
      dna: anim({
        aesthetic:
          'Moody miniature stop-motion: handcrafted puppets with replacement faces animated frame by frame in dark, detailed miniature sets.',
        color_and_tone: 'Muted teal, plum and ochre with warm practical lights; deep shadows.',
        lighting_and_shadow:
          'Tiny practical lamps and hard studio spots at miniature scale, crisp shadows, pools of warm light.',
        texture_and_material:
          'Fingerprints in clay, knitted and felted costumes, carved wood, visible seams on faces.',
        camera_and_composition:
          'Shallow macro depth of field that reveals the miniature scale, low angles among the sets.',
        atmosphere_and_mood: 'Eerie and tender, handmade dread with a beating heart.',
        rendering_and_quality: 'Physical stop-motion look with slight frame jitter; not smooth CG.',
        key_features:
          'handcrafted puppets; replacement-face seams; miniature practical lights; macro shallow focus; tactile fabrics',
      }),
      avoid: [...AVOID, 'smooth 3d'],
      briefs: [
        'Stop-motion frame of an adult puppet toymaker bent over a workbench in a cramped attic lit by one bulb, felt coat and carved wooden hands, the seam of a replacement face visible, macro depth of field. No text or logo.',
        'Stop-motion frame of a puppet raven perched on a crooked iron gate under a paper moon, fingerprints in its clay beak, fog made of cotton wool. No text or logo.',
        'Stop-motion frame of a tiny adult ghost in a knitted white sweater floating through a dollhouse corridor, warm lamp pools and deep shadow. No text or logo.',
      ],
    },
    'SP02-035': {
      name: 'Golden Age Slapstick Cartoon',
      dna: anim({
        aesthetic:
          'Golden-age slapstick cartoon: elastic cel characters with extreme squash-and-stretch and smear frames against stylized painted backgrounds.',
        color_and_tone:
          'Bright saturated character colors against softer painted desert, sky or interior backgrounds.',
        lighting_and_shadow: 'Flat cel color with minimal shadow; backgrounds carry painted light.',
        texture_and_material:
          'Crisp ink outlines, smear and multiple-limb frames, dust clouds and impact stars.',
        camera_and_composition:
          'Strong horizontal chase staging, poses held at the peak of a take, graphic backgrounds with abstract shapes.',
        atmosphere_and_mood: 'Frantic and comic, timing sharpened into a single perfect gag.',
        rendering_and_quality:
          'Classic theatrical cartoon finish; original characters only, no studio mascots.',
        key_features:
          'squash-and-stretch; smear frames; painted stylized backgrounds; held take poses; dust-cloud impacts',
      }),
      avoid: [...AVOID, 'realistic'],
      briefs: [
        'Golden-age slapstick cartoon frame of a scrawny adult knight fleeing a bouncing cartoon dragon across a painted desert, his legs a smear of motion, dust clouds behind. No text or logo.',
        'Golden-age slapstick cartoon frame of a goblin sawing through the tree branch he is sitting on, a held take of dawning horror just before it snaps. No text or logo.',
        'Golden-age slapstick cartoon frame of a short, round-bellied human court wizard with a huge white beard and a tall crooked hat after his spell backfires: face soot-black, beard frizzled straight up, hat smoking, one eye blinking; original design, clearly human, not an animal character. No text or logo.',
      ],
    },
    'SP02-036': {
      name: '1930s Rubber Hose Cartoon',
      dna: anim({
        aesthetic:
          '1930s rubber-hose cartoon: black-and-white animation with boneless bouncing limbs, pie-cut eyes and everything alive and dancing to the beat.',
        color_and_tone: 'Black, white and grey on aged cream, high contrast, slight film flicker.',
        lighting_and_shadow: 'No rendered light; flat fills and occasional grey tone.',
        texture_and_material:
          'Thick uniform ink lines, white gloves, film grain, scratches and gate weave.',
        camera_and_composition:
          'Characters bouncing in rhythm, objects with faces joining the dance, simple stage-like settings.',
        atmosphere_and_mood: 'Bouncy and surreal, a cheerful world with a strange undertone.',
        rendering_and_quality:
          'Vintage 1930s print texture; original characters, no mouse or cat mascots.',
        key_features:
          'boneless rubber-hose limbs; pie-cut eyes; black and white; objects with faces dancing; film flicker',
      }),
      avoid: [...AVOID, 'color', 'modern'],
      briefs: [
        'Rubber-hose cartoon frame in black and white of a band of bouncing skeletons playing banjo, tuba and drum on tombstones in a graveyard, pie-cut eyes, film flicker. No text or logo.',
        'Rubber-hose cartoon frame of a teapot and a kettle with white-gloved hands dancing a jig on a kitchen stove, everything in the kitchen bobbing to the beat. No text or logo.',
        'Rubber-hose cartoon frame of a steam train with a grinning face puffing its cheeks to climb a curly hill, rubber wheels squashing. No text or logo.',
      ],
    },
    'SP02-037': {
      dna: anim({
        aesthetic:
          '90s TV anime: hand-painted cel animation with pastel-and-neon color, sparkle overlays and the soft grain of a broadcast tape.',
        color_and_tone:
          'Pastel pinks, lilacs and sky blues with neon accents, soft airbrushed gradients.',
        lighting_and_shadow:
          'Two-tone cel shading with airbrushed highlights, backlit rim glows, sunset skies.',
        texture_and_material: 'Cel paint texture, sparkle and speed-line overlays, VHS softness.',
        camera_and_composition:
          'Dramatic diagonal poses, hair and ribbons flowing, painted skies behind.',
        atmosphere_and_mood: 'Nostalgic and romantic, sparkle and melancholy in one frame.',
        rendering_and_quality:
          'Broadcast cel look with slight grain; original characters, no franchise designs.',
        key_features:
          'pastel-neon cel palette; airbrushed highlights; sparkle overlays; flowing hair; VHS softness',
      }),
      avoid: [...AVOID, 'modern digital anime'],
      briefs: [
        '90s anime cel frame of an adult swordswoman with long flowing hair standing on a tiled rooftop at sunset, sparkles drifting, pastel sky, VHS softness. No text or logo.',
        '90s anime cel frame of an adult courier on a motorcycle speeding along a coastal cliff road at dusk, speed lines and a neon-pink sky. No text or logo.',
        '90s anime cel frame of an adult shrine priestess feeding koi in a lantern-lit pond, airbrushed reflections and lilac twilight. No text or logo.',
      ],
    },
    'SP02-038': {
      name: 'Comic Offset 3D Animation',
      dna: anim({
        aesthetic:
          'Comic offset 3D animation: 3D characters and cities finished like a printed comic page, with halftone dots, ink lines and off-register color.',
        color_and_tone:
          'Saturated CMYK color, magenta and cyan misregistration fringes, bold black shadows.',
        lighting_and_shadow:
          'Shadows built from hatching and halftone dots instead of smooth gradients.',
        texture_and_material:
          'Ben-Day dots, printed ink lines drawn over 3D forms, paper grain and slight print shift.',
        camera_and_composition:
          'Dynamic low angles and extreme perspective, stepped low-frame-rate motion, action-panel framing.',
        atmosphere_and_mood: 'Kinetic and graphic, a comic page coming alive.',
        rendering_and_quality:
          'Hybrid 3D and print finish; original characters, no superhero franchise designs.',
        key_features:
          'halftone dot shading; off-register color fringes; ink lines over 3D; stepped frame rate; extreme perspective',
      }),
      avoid: [...AVOID, 'smooth 3d gradients'],
      briefs: [
        'Comic offset 3D frame of an adult rooftop thief leaping between gothic spires at night, halftone dots in the shadows, magenta and cyan misregistration on the edges, extreme low angle. No text or logo.',
        'Comic offset 3D frame of an adult street drummer pounding a drum kit on a fire escape, shock-wave shapes radiating without any lettering, Ben-Day dots. No text or logo.',
        'Comic offset 3D frame of a mechanical brass dragon swooping between skyscrapers, inked contours over 3D forms, stepped motion blur. No text or logo.',
      ],
    },
    'SP02-039': {
      name: 'Mid-Century Modernist Animation',
      dna: anim({
        aesthetic:
          'Mid-century modernist animation: 1950s design-led cartoons with flat geometric shapes, angular silhouettes and limited movement.',
        color_and_tone:
          'Limited palette of mustard, teal, coral and black on off-white, flat fills.',
        lighting_and_shadow: 'No modeled light; shadows as flat geometric shapes.',
        texture_and_material: 'Dry brush textures, printed-paper grain, thin expressive lines.',
        camera_and_composition:
          'Flat staging with lots of negative space, characters as angular silhouettes, abstract background shapes.',
        atmosphere_and_mood: 'Witty and cool, jazz-age rhythm in a few elegant shapes.',
        rendering_and_quality: 'Mid-century graphic design finish; not realistic or 3D.',
        key_features:
          'flat geometric reduction; angular silhouettes; limited mustard-teal palette; negative space; dry brush texture',
      }),
      avoid: [...AVOID, 'realistic', '3d'],
      briefs: [
        'Mid-century modernist animation frame of an adult astronomer peering through a telescope on an angular rooftop, stars as small flat circles, mustard and teal geometric sky. No text or logo.',
        'Mid-century modernist frame of a stylized fox fleeing a pack of long thin hounds across a landscape of flat triangles and circles. No text or logo.',
        'Mid-century modernist frame of an adult king sitting on a trapezoid throne in a flat palace of floating rectangles, coral and black accents. No text or logo.',
      ],
    },
    'SP02-040': {
      name: 'Construction Paper Cutout Cartoon',
      dna: anim({
        aesthetic:
          'Construction-paper cutout cartoon: flat pieces of colored paper cut with scissors and moved frame by frame, casting small drop shadows.',
        color_and_tone:
          'Flat construction-paper colors — primary red, blue, green, brown — slightly faded.',
        lighting_and_shadow:
          'Flat overhead light with small soft drop shadows under each paper layer.',
        texture_and_material:
          'Visible paper fibers, uneven scissor-cut edges and slightly curled corners.',
        camera_and_composition:
          'Flat frontal staging, characters in profile or facing forward, simple layered backgrounds.',
        atmosphere_and_mood: 'Crude and cheeky, homemade simplicity with comic timing.',
        rendering_and_quality:
          "Tactile paper-cutout finish; original figure designs, not any existing show's characters.",
        key_features:
          'flat construction-paper pieces; scissor edges; small drop shadows; frontal staging; paper fibers',
      }),
      avoid: [...AVOID, 'drawn line art', '3d'],
      briefs: [
        'Construction-paper cutout frame of a green paper dragon asleep on a heap of yellow paper coins in a brown paper cave, scissor-cut edges and small drop shadows. No text or logo.',
        'Construction-paper cutout frame of an adult paper jester juggling three red paper balls in front of a blue paper castle. No text or logo.',
        'Construction-paper cutout frame of adult paper villagers gathered around a paper bonfire of orange triangles at night, curled corners. No text or logo.',
      ],
    },
    'SP02-041': {
      dna: anim({
        aesthetic:
          'Rotoscoped animation: live-action footage traced frame by frame into posterized flat shapes with trembling outlines.',
        color_and_tone: 'Posterized color blocks with slightly unnatural hues, few gradients.',
        lighting_and_shadow: 'Real footage lighting reduced to two or three flat shadow bands.',
        texture_and_material:
          'Line boil, wobbling contours and shifting fills from frame to frame.',
        camera_and_composition:
          'Live-action camera framing and realistic movement, traced into drawing.',
        atmosphere_and_mood: 'Uncanny and dreamy, as if reality itself were slightly unstable.',
        rendering_and_quality:
          'Traced-over realism with flat shapes; not smooth 3D or clean vector.',
        key_features:
          'traced live-action motion; posterized color blocks; line boil; flat shadow bands; uncanny realism',
      }),
      avoid: [...AVOID, 'smooth 3d', 'bicycle'],
      briefs: [
        'Rotoscoped animation frame of an adult woman in a long coat walking through fog past iron railings, her outline trembling, posterized grey-green shapes. No text or logo.',
        'Rotoscoped frame of an adult sword dancer spinning with two curved blades, realistic motion traced into flat color bands, line boil on the blades. No text or logo.',
        'Rotoscoped frame of an adult man lighting a candle in a diner booth at night, wobbling contours and posterized warm light. No text or logo.',
      ],
    },
    'SP02-042': {
      dna: anim({
        aesthetic:
          'Papercraft animation: folded and cut paper models animated in stop motion, with creases, thickness and soft paper shadows.',
        color_and_tone: 'Soft matte paper colors, pastel and earthy tones, white paper highlights.',
        lighting_and_shadow:
          'Soft directional light revealing folds, crease shadows and paper translucency.',
        texture_and_material: 'Folds, creases, visible paper thickness and slight fiber texture.',
        camera_and_composition: 'Miniature diorama framing with shallow depth of field.',
        atmosphere_and_mood: 'Delicate and whimsical, a world folded by hand.',
        rendering_and_quality: 'Tactile papercraft finish; not flat drawing and not smooth CG.',
        key_features:
          'folded paper models; crease shadows; visible paper thickness; soft directional light; diorama depth',
      }),
      avoid: [...AVOID, 'drawn line art', 'smooth 3d'],
      briefs: [
        'Papercraft animation frame of a folded-paper dragon unfurling its pleated wings over a paper mountain range, soft light revealing every crease. No text or logo.',
        'Papercraft animation frame of a snowy paper village at night with glowing translucent paper windows, shallow depth of field. No text or logo.',
        'Papercraft animation frame of folded-paper koi swimming in a pond of layered blue paper, paper lily pads casting soft shadows. No text or logo.',
      ],
    },
    'SP02-043': {
      dna: anim({
        aesthetic:
          '2000s Flash web animation: vector characters built from reusable symbols, tweened motion, radial gradients and crisp anti-aliased edges.',
        color_and_tone: 'Bright web colors, glossy radial gradients, flat backgrounds.',
        lighting_and_shadow:
          'Gradient-filled highlights and simple flat shadow shapes under each symbol.',
        texture_and_material: 'Clean vector edges, visible symbol reuse, tween motion trails.',
        camera_and_composition:
          'Simple side-on staging, bold silhouettes, exaggerated tweened poses.',
        atmosphere_and_mood: 'Scrappy and irreverent, full of early internet energy and jokes.',
        rendering_and_quality: 'Vector web-animation look; no textures, no painterly softness.',
        key_features:
          'vector symbols; tweened motion trails; radial gradients; crisp anti-aliased edges; side-on staging',
      }),
      avoid: [...AVOID, 'textured', 'soft painterly'],
      briefs: [
        'Flash-era vector animation frame of a stick-limbed goblin swinging a club at a blocky green slime, tween motion trails, glossy radial gradients. No text or logo.',
        'Flash-era vector frame of a glossy potion shop where a bobbing shopkeeper hands over a gradient-filled bottle, reused symbol bottles on the shelves. No text or logo.',
        'Flash-era vector frame of a tweened dragon flapping identical symbol wings over a flat blue sky. No text or logo.',
      ],
    },
    'SP02-044': {
      dna: anim({
        aesthetic:
          'Oil-paint animation: every frame painted in thick oils on canvas, so brushstrokes move and swirl from frame to frame.',
        color_and_tone:
          'Rich oil color, strong complementary contrasts, blended impasto highlights.',
        lighting_and_shadow: 'Painted light and shadow with directional strokes following form.',
        texture_and_material:
          'Visible canvas weave, thick impasto ridges, strokes shifting between frames.',
        camera_and_composition: 'Film framing painted over, with brush direction following motion.',
        atmosphere_and_mood: 'Vivid and devoted, a painting that breathes.',
        rendering_and_quality:
          'Hand-painted frame look; not a digital oil filter; no famous paintings copied.',
        key_features:
          'painted frame by frame; swirling brush direction; impasto ridges; canvas weave; complementary color',
      }),
      avoid: [...AVOID, 'digital filter', 'copied famous painting'],
      briefs: [
        'Oil-paint animation frame of a stormy harbor with ships rolling on swirling impasto waves, brushstrokes streaming in the wind direction, canvas weave visible. No text or logo.',
        'Oil-paint animation frame of an adult violinist on a moonlit stone bridge, the moonlight laid on in thick blue and yellow strokes. No text or logo.',
        'Oil-paint animation frame of a candlelit tavern where the smoke curls in swirling brushstrokes around adult drinkers. No text or logo.',
      ],
    },
    'SP02-045': {
      dna: anim({
        aesthetic:
          'Pixel-art animation: 16-bit sprites and tiles with a limited indexed palette, animated in a few hand-placed frames.',
        color_and_tone:
          'Indexed palette of 16–32 colors, stepped shading ramps, crisp dark outlines.',
        lighting_and_shadow:
          'Light built from stepped color ramps and dithering; flickering light as palette cycling.',
        texture_and_material: 'Pixel-perfect edges on a strict grid, dithering for gradients.',
        camera_and_composition:
          'Side-view or three-quarter game scene, sprite centered, tiled background.',
        atmosphere_and_mood: 'Nostalgic and playful, a game world alive in few pixels.',
        rendering_and_quality: 'Clean pixel grid with no anti-aliasing or blur.',
        key_features:
          'indexed palette; pixel grid; stepped shading ramps; dithering; sprite animation frames',
      }),
      avoid: [...AVOID, 'vector', 'smooth gradients'],
      briefs: [
        'Pixel-art animation frame of a hooded thief sneaking past a sleeping guard in a torchlit dungeon, the torch flicker done with palette cycling, dithered shadows. No text or logo.',
        'Pixel-art animation frame of a witch on a broom flying over a sleeping pixel village at night, stepped moonlight ramps. No text or logo.',
        'Pixel-art animation frame of a blacksmith hammering at an anvil with a burst of pixel sparks, tiled stone forge behind. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Shadow-Puppet Silhouette Animation',
      domain: 'silhouette cutout animation',
      tags: ['silhouette', 'cutout-animation', 'shadow-puppet'],
      dna: anim({
        aesthetic:
          'Silhouette cutout animation: jointed black paper figures cut with fine lace-like detail, animated on a backlit glass table against glowing color.',
        color_and_tone:
          'Pure black silhouettes over glowing gradients of orange, rose, teal or violet.',
        lighting_and_shadow:
          'Backlight only; figures are solid black with no interior detail except cut-outs.',
        texture_and_material:
          'Intricate scissor-cut lace, hinged joints, delicate filigree trees and ornaments.',
        camera_and_composition:
          'Strict side profile, figures on a ground line, layered silhouette scenery.',
        atmosphere_and_mood: 'Fairy-tale and graceful, drama told through outline alone.',
        rendering_and_quality:
          'Crisp cut-paper edges on a luminous ground; not a photographic silhouette.',
        key_features:
          'jointed black paper figures; backlit color gradient; lace-cut detail; strict profiles; layered silhouette scenery',
      }),
      avoid: [...AVOID, 'interior detail on figures', 'photographic backlight'],
      briefs: [
        'Silhouette cutout animation frame of a jointed black-paper knight facing a coiling filigree dragon against a glowing orange-to-violet backdrop, lace-cut trees framing them. No text or logo.',
        'Silhouette cutout frame of an adult princess in a lace-cut gown riding a paper stag through a silhouette forest under a teal glow. No text or logo.',
        'Silhouette cutout frame of a paper ship with intricate rigging sailing over cut-paper waves beneath a rose-colored sky. No text or logo.',
      ],
    },
    {
      name: 'Pinscreen Animation',
      domain: 'pinscreen shadow animation',
      tags: ['pinscreen', 'experimental-animation', 'monochrome'],
      dna: anim({
        aesthetic:
          'Pinscreen animation: an image formed by thousands of pins pushed to different depths and lit from the side, so their shadows create soft grey tones.',
        color_and_tone:
          'Monochrome silver greys from white to deep black, velvety and engraving-like.',
        lighting_and_shadow:
          'Oblique light casting pin shadows; darkness where pins stand out, light where they sink.',
        texture_and_material: 'Fine stippled grain of pin tips, soft transitions like mezzotint.',
        camera_and_composition:
          'Frontal framing of the screen, forms emerging and dissolving into darkness.',
        atmosphere_and_mood: 'Haunting and dreamlike, memories surfacing out of shadow.',
        rendering_and_quality:
          'Pinscreen tonality with no hard outlines; not a photograph or drawing.',
        key_features:
          'pin-shadow tones; velvety grey stipple; forms emerging from darkness; no outlines; oblique light',
      }),
      avoid: [...AVOID, 'hard outlines', 'color'],
      briefs: [
        "Pinscreen animation frame of an adult old woman's face emerging from darkness, soft silver pin-shadow tones like an engraving, her eyes the brightest point. No text or logo.",
        'Pinscreen animation frame of a horse galloping between snowy birch trees, the forms dissolving into velvety grey stipple. No text or logo.',
        'Pinscreen animation frame of a ghostly sailing ship drifting in fog, its sails barely surfacing from the dark pin field. No text or logo.',
      ],
    },
    {
      name: 'Charcoal Erasure Animation',
      domain: 'charcoal erase-and-redraw animation',
      tags: ['charcoal', 'erasure', 'experimental-animation'],
      dna: anim({
        aesthetic:
          'Charcoal erasure animation: a single charcoal drawing altered, erased and redrawn under the camera, leaving ghost traces of every earlier frame.',
        color_and_tone:
          'Charcoal black and smudged greys on off-white paper, occasional pale blue pastel accent.',
        lighting_and_shadow: 'Drawn tone only; light made by erasing into the charcoal.',
        texture_and_material: 'Smudges, eraser streaks, ghosted previous positions, paper tooth.',
        camera_and_composition:
          'Fixed paper under the camera, moving elements trailing their own erased ghosts.',
        atmosphere_and_mood: 'Melancholic and restless, memory that never quite disappears.',
        rendering_and_quality: 'Real charcoal on paper look; not a clean pencil sketch.',
        key_features:
          'ghost traces of earlier frames; eraser streaks; smudged charcoal; paper tooth; fixed drawing under camera',
      }),
      avoid: [...AVOID, 'clean line art', 'color fills'],
      briefs: [
        'Charcoal erasure animation frame of an adult man in a long coat walking through a city that is being erased and redrawn around him, ghost traces of earlier buildings smudged across the paper. No text or logo.',
        'Charcoal erasure frame of a flock of crows lifting off a wire, each bird trailing smeared ghosts of its earlier positions. No text or logo.',
        'Charcoal erasure frame of the tide rising under an old pier, earlier water lines left as faint erased streaks, one pale blue pastel accent. No text or logo.',
      ],
    },
    {
      name: '70s Limited TV Animation',
      domain: 'limited television animation',
      tags: ['limited-animation', 'saturday-morning', 'cel'],
      dna: anim({
        aesthetic:
          '70s limited TV animation: budget television cartoons with held cels, only mouths and eyes moving, thick outlines and painted backgrounds that repeat in pans.',
        color_and_tone:
          'Flat saturated cel colors, muted painted backgrounds in greens, browns and dusk blues.',
        lighting_and_shadow: 'No cel shading; night shown by blue-tinted backgrounds.',
        texture_and_material:
          'Thick uniform outlines, visible cel dust, slightly different color on moving parts.',
        camera_and_composition:
          'Characters in a row facing camera or in profile, a repeating painted background behind a chase.',
        atmosphere_and_mood: 'Goofy and cozy, Saturday-morning adventure on a tight budget.',
        rendering_and_quality:
          'Broadcast cel look with slight dust; original characters, no existing show designs.',
        key_features:
          'held cels with moving mouths; thick outlines; repeating painted background; flat saturated color; cel dust',
      }),
      avoid: [...AVOID, 'fluid full animation', '3d'],
      briefs: [
        '70s limited TV animation frame of two adult ghost hunters tiptoeing through a painted haunted castle hall, only their eyes and mouths animated, thick outlines, a repeating background of suits of armor. No text or logo.',
        '70s limited TV animation frame of a cartoon dragon and an adult wizard in a stiff conversation on a hilltop, bodies held still, blue-tinted night background. No text or logo.',
        '70s limited TV animation frame of a desert chase where a cartoon rider passes the same painted cactus and rock again and again. No text or logo.',
      ],
    },
    {
      name: 'Direct-on-Film Scratch Animation',
      domain: 'cameraless film animation',
      tags: ['direct-animation', 'scratch-film', 'experimental-animation'],
      dna: anim({
        aesthetic:
          'Direct-on-film animation: images scratched, painted and inked straight onto celluloid without a camera, so every frame vibrates with hand-made marks.',
        color_and_tone:
          'White scratches on black emulsion, or translucent dyes in saturated red, yellow and blue.',
        lighting_and_shadow:
          'Projector light through the film; bright lines glowing out of the dark.',
        texture_and_material: 'Jittering scratched lines, dye blotches, dust and emulsion flakes.',
        camera_and_composition:
          'Simple bold figures centered on the strip, energetic abstract marks around them.',
        atmosphere_and_mood: 'Raw and musical, marks dancing to an unheard rhythm.',
        rendering_and_quality:
          'Handmade celluloid texture; no sprocket holes drawn and no digital vector.',
        key_features:
          'scratched white lines on black; translucent dyes; jittering hand marks; projector glow; bold simple figures',
      }),
      avoid: [...AVOID, 'sprocket holes', 'digital vector'],
      briefs: [
        'Direct-on-film scratch animation frame of an adult dancer drawn as vibrating white scratches in black emulsion, her motion echoed by jittering lines. No text or logo.',
        'Direct-on-film frame of a bird in flight made of hand-painted red and yellow dye blotches with scratched white wing lines. No text or logo.',
        'Direct-on-film frame of a scratched white skeleton dancing across black emulsion among bursts of hand-painted blue dye, flaking emulsion and jittering sprocket-edge marks, each bone line vibrating as if redrawn every frame. No text or logo.',
      ],
    },
  ],
};

export default spec;
