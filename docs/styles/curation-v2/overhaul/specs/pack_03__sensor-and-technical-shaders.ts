import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'sensor noise',
  'camera lens optics',
  'readable text',
  'color legend or scale bar',
  'software UI or viewport gizmos',
  'franchise likeness',
];

// Profile category. Every preset is computed from 3D geometry by a shader or render pass, never
// captured by a sensor: the same geometry must stay comparable with pack_01::7 and pack_02::7
// capture looks. Passes replace the beauty render; overlay shaders add one effect to it.
const pass =
  "Keep the prompt subject's geometry, pose, setting and camera exactly; this preset replaces only the beauty render with the named shader or render-pass output computed from that 3D geometry, never a sensor capture.";
const overlay =
  'Keep the prompt subject, setting, camera and normal CGI beauty render; this shader adds only its one named effect on the stated geometry, computed in the renderer rather than photographed.';

function sh(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? pass, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_03',
  category: '8. Sensor And Technical Shaders',
  updates: {
    'SP03-043': {
      dna: sh({
        aesthetic:
          'Fresnel x-ray shader: every surface drawn as additive glowing shells whose brightness follows the facing ratio, bright at grazing silhouettes and nearly clear where faces look at the camera.',
        color_and_tone:
          'One cold hue, usually ice-blue or cyan, on pure black; overlapping shells add up toward white, with no density or bone logic.',
        lighting_and_shadow:
          'No lights and no shadows; brightness comes only from the view angle, so every modeled inner part shows through at its own edges.',
        texture_and_material:
          'Smooth untextured shells, crisp rim lines on every modeled layer, interior geometry visible as nested glowing contours.',
        camera_and_composition:
          'Keep the requested camera and perspective; the full 3D depth stays readable through the layered rims.',
        atmosphere_and_mood: 'Cool, weightless and analytical, an object seen as nested outlines.',
        rendering_and_quality:
          'Clean additive shader render with perfectly sharp rims and no film grain, scatter haze or radiograph plate look.',
        key_features:
          'facing-ratio fresnel rims; additive stacking toward white; modeled interior shown as nested contours; perspective 3D depth; no lights',
      }),
      avoid: [...AVOID, 'radiograph film base', 'bone density contrast', 'medical diagnosis look'],
      briefs: [
        'Fresnel x-ray shader render of an armored knight on a rearing warhorse, every plate, strap and horse muscle drawn as ice-blue additive shells bright at the grazing edges, the saddle, sword and bridle visible through as nested glowing contours, three-quarter low view on pure black. No text or logo.',
        'Fresnel x-ray shader render of a clockwork owl automaton, gears and springs inside its body glowing through the cyan rim shell of its feathers. No text or logo.',
        'Fresnel x-ray shader render of a sailing ship inside a glass bottle, bottle, hull and rigging stacking their rims toward white. No text or logo.',
      ],
    },
    'SP03-044': {
      name: 'Thermal Heatmap Shader',
      dna: sh({
        aesthetic:
          'Thermal heatmap shader: a simulated temperature attribute diffused through clean 3D geometry and shown through a smooth false-color ramp, crisp as a CG render, with no infrared camera behind it.',
        color_and_tone:
          'Jet-style ramp from deep blue through cyan, green and yellow to red on the model; the background a flat neutral dark grey.',
        lighting_and_shadow:
          'Faint diffuse shading kept under the ramp so forms still read; hot zones never bloom or bleed past the mesh edge.',
        texture_and_material:
          'Smooth interpolated gradients across polygons, sharp model silhouettes, hot spots centered on the named heat sources.',
        camera_and_composition:
          'Keep the requested camera; the ramp follows the geometry, so the same model could be swapped back to its beauty render.',
        atmosphere_and_mood: 'Diagnostic and vivid, energy mapped as color over a model.',
        rendering_and_quality:
          'Simulation-output finish: no sensor noise, no soft focus and no ironbow or white-hot camera palette.',
        key_features:
          'simulated temperature attribute; jet blue-to-red ramp; crisp mesh edges; faint diffuse shading; no sensor bloom',
      }),
      avoid: [
        ...AVOID,
        'ironbow palette',
        'white-hot greyscale',
        'heat bloom halo',
        'predator vision',
      ],
      briefs: [
        'Thermal heatmap shader render of a sleeping dragon coiled around its clutch of eggs, heat diffused from its glowing belly through the coils in a smooth blue-to-red ramp, the eggs yellow, crisp mesh silhouettes against flat dark grey. No text or logo.',
        'Thermal heatmap shader render of a blacksmith anvil beside a quenching trough, a fresh blade red-hot on the anvil and the water cooling to blue. No text or logo.',
        'Thermal heatmap shader render of a modern espresso machine, still clearly modern, its boiler red and portafilter handle cyan. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Lidar Point Cloud Render',
      domain: 'lidar point cloud visualization',
      tags: ['lidar', 'point-cloud', 'scan-visualization'],
      dna: sh({
        aesthetic:
          'Lidar point cloud render: the scene shown only as millions of tiny points sampled on surfaces, with no meshes, so gaps and scan shadows reveal how it was measured.',
        color_and_tone:
          'Points colored by height or return intensity (blue low to red high, or grey intensity) on a pure black void.',
        lighting_and_shadow:
          'No shading at all; density of points carries form, and occluded areas behind objects stay empty as scan shadows.',
        texture_and_material:
          'Concentric scan rings on the ground around scanner positions, denser points near the scanner, sparse speckle on far or dark surfaces.',
        camera_and_composition:
          'Keep the requested camera; far points thin out and the cloud ends in a ragged edge.',
        atmosphere_and_mood: 'Ghostly and precise, a place reduced to measured dust.',
        rendering_and_quality:
          'Screen-space point sprites of uniform size, no surface reconstruction and no soft splat blending.',
        key_features:
          'millions of tiny points; height or intensity coloring; scan shadows behind objects; concentric ground rings; black void',
      }),
      avoid: [...AVOID, 'solid surfaces', 'gaussian splat blobs'],
      briefs: [
        'Lidar point cloud render of a ruined abbey nave, columns and broken arches made only of tiny points colored blue at the floor to red at the roof line, empty scan shadows stretching behind each column, concentric scan rings on the ground, black void. No text or logo.',
        'Lidar point cloud render of a pine forest canopy over a winding river, trunks sparse, crowns dense, colored by height. No text or logo.',
        'Lidar point cloud render of terraced hillside vineyards seen from above, grey intensity points tracing every row. No text or logo.',
      ],
    },
    {
      name: 'Z-Depth Pass',
      domain: 'render depth buffer',
      tags: ['depth-pass', 'render-pass', 'z-buffer'],
      dna: sh({
        aesthetic:
          'Z-depth render pass: each pixel shows only its distance from the camera, near surfaces white fading smoothly to black at the far clip.',
        color_and_tone:
          'Pure greyscale: white foreground, mid grey middle distance, black background; no hue and no texture color.',
        lighting_and_shadow:
          'No lighting or shadows; value changes only with distance, so flat walls become smooth gradients.',
        texture_and_material:
          'Materials disappear; only silhouettes and depth steps remain, with hard value jumps where a near edge overlaps a far one.',
        camera_and_composition:
          'Keep the requested camera; compositions with strong recession show the gradient best.',
        atmosphere_and_mood: 'Quiet, foggy and abstract, space turned into a single gradient.',
        rendering_and_quality:
          'Clean anti-aliased depth buffer normalized between near and far, with no banding and no noise.',
        key_features:
          'distance as brightness; white near to black far; hard steps at overlapping edges; no texture; no lighting',
      }),
      avoid: [...AVOID, 'fog effect with color', 'lit shading'],
      briefs: [
        'Z-depth render pass of a column of hooded pilgrims walking along a stone causeway toward the camera, the nearest pilgrim pure white, the line fading through greys to a black horizon, hard value steps where each figure overlaps the next. No text or logo.',
        'Z-depth render pass of a long great hall hung with plain cloth banners, each banner a slightly darker grey step. No text or logo.',
        'Z-depth render pass of a pack of hounds running straight at the camera, the lead hound white and the rest greying away. No text or logo.',
      ],
    },
    {
      name: 'World-Space Normal Pass',
      domain: 'render normal buffer',
      tags: ['normal-pass', 'render-pass', 'surface-normals'],
      dna: sh({
        aesthetic:
          'World-space normal pass: each surface colored by the direction it faces, so the X, Y and Z axes map to red, green and blue.',
        color_and_tone:
          'Pastel lilac, mint, salmon and sky-blue fields; up-facing surfaces green-tinted, side faces red or blue; no texture color.',
        lighting_and_shadow:
          'No lights or shadows; the color itself encodes orientation, so curved forms become smooth rainbow sweeps.',
        texture_and_material:
          'Bump and carved detail read as tiny color shifts; flat planes are single flat colors with hard changes at creases.',
        camera_and_composition:
          'Keep the requested camera; the colors stay tied to world axes, so the same wall keeps its color from any view.',
        atmosphere_and_mood: 'Technical yet candy-sweet, geometry turned into color.',
        rendering_and_quality:
          'Clean anti-aliased buffer with no shading, no grain and smooth interpolation across curves.',
        key_features:
          'axis-to-RGB color mapping; pastel lilac and mint fields; hard color changes at creases; no lighting; carved detail as tiny shifts',
      }),
      avoid: [...AVOID, 'tangent-space blue normal map texture', 'lit shading'],
      briefs: [
        'World-space normal pass of a carved stone relief of a dragon coiling across a temple wall, every scale a small color shift between lilac, mint and salmon, the flat wall one even color, hard color changes at each carved edge. No text or logo.',
        'World-space normal pass of a fossil ammonite on a rock slab, its spiral ribs sweeping through the rainbow of orientations. No text or logo.',
        'World-space normal pass of a wicker basket of pinecones, each scale a distinct tiny pastel facet. No text or logo.',
      ],
    },
    {
      name: 'UV Checker Grid Shader',
      domain: 'texture mapping test',
      tags: ['uv-checker', 'texture-test', 'lookdev-shader'],
      dna: sh({
        aesthetic:
          'UV checker test shader: the model wrapped in a colored checker grid that exposes its texture mapping, with stretching, pinching and seams visible.',
        color_and_tone:
          'Alternating light and dark squares in a rainbow of cell colors, with small orientation arrows instead of any numbers or letters.',
        lighting_and_shadow:
          'Simple viewport key and fill light with soft shading, so the grid stays readable on every face.',
        texture_and_material:
          'Squares stay square on good areas, stretch into rectangles on strained areas and jump at UV seams.',
        camera_and_composition:
          'Keep the requested camera; curved and folded areas of the model face the viewer to show distortion.',
        atmosphere_and_mood: 'Playful and diagnostic, a test pattern wrapped around form.',
        rendering_and_quality:
          'Clean viewport-style render with a sharp grid and no other material; seams and stretches left visible.',
        key_features:
          'colored checker grid; stretched cells on strained areas; visible UV seams; orientation arrows only; simple viewport light',
      }),
      avoid: [...AVOID, 'numbered cells', 'letters in cells'],
      briefs: [
        'UV checker test shader render of a jousting helm, rainbow checker squares wrapping the dome cleanly then stretching into long rectangles around the eye slit, a hard seam jump down the crest, soft viewport light, no numbers or letters in the cells. No text or logo.',
        'UV checker test shader render of a coiled sea serpent, checker cells pinching at the tail tip and staying square on the body. No text or logo.',
        'UV checker test shader render of a patched hot-air balloon envelope, each gore panel a separate seam-broken grid. No text or logo.',
      ],
    },
    {
      name: 'Curvature Cavity Map',
      domain: 'baked curvature texture',
      tags: ['curvature-map', 'texture-baking', 'cavity-map'],
      dna: sh({
        aesthetic:
          'Curvature and cavity bake: the model shown as mid grey where flat, white on convex edges and dark in concave creases, the map texture artists use for wear.',
        color_and_tone:
          'Neutral 50% grey base, crisp white edge lines on ridges, dark charcoal in grooves; no hue.',
        lighting_and_shadow:
          'No light direction at all; values come only from local surface bending, unlike soft ambient occlusion.',
        texture_and_material:
          'Thin bright ridges on every bevel and chip, fine dark lines in engravings, broad flats evenly grey.',
        camera_and_composition:
          'Keep the requested camera; close views show hard-surface and carved detail best.',
        atmosphere_and_mood: 'Precise and tactile, every worn edge traced like a map.',
        rendering_and_quality:
          'Crisp baked-texture look with pixel-sharp edge lines, no ambient-occlusion blur and no cast shadows.',
        key_features:
          'mid-grey flats; white convex edge lines; dark concave grooves; no light direction; sharp engraved detail',
      }),
      avoid: [...AVOID, 'soft ambient occlusion gradients', 'directional shading'],
      briefs: [
        'Curvature cavity map of a carved wooden reliquary box, every bevel and chipped corner traced in a thin white line, the carved vines inked with dark charcoal grooves, broad panels flat mid grey, close three-quarter view. No text or logo.',
        'Curvature cavity map of a gnarled tree root clutching a boulder, bark ridges white, cracks dark. No text or logo.',
        'Curvature cavity map of a crocodile skull, tooth edges and sutures traced white and dark on flat grey. No text or logo.',
      ],
    },
    {
      name: 'Object ID Matte Pass',
      domain: 'compositing ID matte',
      tags: ['id-matte', 'render-pass', 'compositing'],
      dna: sh({
        aesthetic:
          'Object ID matte pass: every separate object filled with one flat random color, so the whole scene becomes a patchwork map of its parts.',
        color_and_tone:
          'Dozens of flat saturated and pastel ID colors, chosen at random so neighbours rarely match; black empty background.',
        lighting_and_shadow: 'No shading or shadows at all; each object is a single uniform fill.',
        texture_and_material:
          'Clean anti-aliased edges between color fills, small objects as tiny distinct patches, no texture inside any shape.',
        camera_and_composition:
          'Keep the requested camera; cluttered scenes with many parts make the patchwork strongest.',
        atmosphere_and_mood: 'Cheerfully clinical, a scene sorted into pieces.',
        rendering_and_quality:
          'Compositing-buffer finish with exact object boundaries and no gradients.',
        key_features:
          'one flat random color per object; no shading; crisp object edges; patchwork of many parts; black background',
      }),
      avoid: [...AVOID, 'shading gradients', 'cel shading outlines'],
      briefs: [
        'Object ID matte pass of an alchemist workbench crowded with flasks, scales, candles, skulls and scrolls, each object a single flat random color from teal to magenta, no shading, crisp edges, black background. No readable text or logo.',
        'Object ID matte pass of a banquet table after a feast, every goblet, bone and bread loaf its own flat color patch. No text or logo.',
        'Object ID matte pass of a flock of crows perched on a dead oak, each bird and branch a separate flat color. No text or logo.',
      ],
    },
    {
      name: 'Motion Vector Pass',
      domain: 'render velocity buffer',
      tags: ['motion-vectors', 'render-pass', 'velocity-buffer'],
      dna: sh({
        aesthetic:
          'Motion vector pass: each pixel colored by its screen-space velocity, red for horizontal and green for vertical movement, so moving parts glow and still parts go dark.',
        color_and_tone:
          'Dark olive-black for static areas, reds, greens and yellow mixes for moving limbs, brightest where motion is fastest.',
        lighting_and_shadow:
          'No lighting; brightness equals speed, so a spinning edge outshines its slow hub.',
        texture_and_material:
          'Smooth velocity gradients along swinging limbs, hard color changes where parts move in opposite directions.',
        camera_and_composition:
          'Keep the requested camera; the frozen action shows several directions of motion at once.',
        atmosphere_and_mood: 'Kinetic and strange, movement made visible without blur.',
        rendering_and_quality: 'Clean velocity buffer with no motion blur applied and no shading.',
        key_features:
          'red horizontal and green vertical velocity; dark static areas; brightest fastest parts; no blur; opposing motions split by color',
      }),
      avoid: [...AVOID, 'motion blur streaks', 'lit shading'],
      briefs: [
        'Motion vector pass of a charging warhorse at full gallop, the swinging legs glowing red and green by direction, the mane yellow-bright, the still field behind nearly black, no motion blur. No text or logo.',
        'Motion vector pass of a street juggler tossing five torches, each torch a different color by its arc direction. No text or logo.',
        'Motion vector pass of a gust whirling autumn leaves around an old stone well, the fastest leaves brightest. No text or logo.',
      ],
    },
    {
      name: 'Heat-Distortion Shimmer Shader',
      domain: 'refraction distortion shader',
      tags: ['heat-haze-shader', 'refraction', 'vfx-shader'],
      dna: sh({
        subject_treatment: overlay,
        aesthetic:
          'Heat-distortion shader: rising columns of screen-space refraction above hot sources, warping and rippling whatever lies behind them.',
        color_and_tone:
          'Scene colors unchanged, only displaced; a faint brightening where the refraction compresses light.',
        lighting_and_shadow:
          'Normal scene lighting; distorted zones bend highlights and edges into wavy ribbons.',
        texture_and_material:
          'Noise-driven ripples stretched upward, strongest near the source and fading with height, shown against straight lines that bend.',
        camera_and_composition:
          'Keep the requested camera; straight background lines pass through the haze column so the warp reads.',
        atmosphere_and_mood: 'Oppressive and airless, heat you can see.',
        rendering_and_quality:
          'Clean real-time refraction; no schlieren shadowgraph look, no smoke and no color tint.',
        key_features:
          'rising refraction columns; wavy warped background lines; strongest near source; no color tint; no smoke',
      }),
      avoid: [...AVOID, 'schlieren shadowgraph', 'smoke plume', 'colored glow'],
      briefs: [
        'Heat-distortion shader render above a bell foundry casting pit, a rising column of refraction bending the straight timber beams and ropes behind it into wavy ribbons, strongest just above the glowing mold, scene colors untouched. No text or logo.',
        'Heat-distortion shader render of a camel caravan road at noon, the far dunes and palms rippling in low shimmering bands. No text or logo.',
        'Heat-distortion shader render behind a parked jet airliner engine, the hangar door lines warping in its exhaust. No text or logo.',
      ],
    },
    {
      name: 'Voxel Cross-Section Cutaway',
      domain: 'clipping-plane section shader',
      tags: ['cutaway-shader', 'cross-section', 'voxel-section'],
      dna: sh({
        aesthetic:
          'Clipping-plane section shader: the model sliced cleanly by a flat plane, the cut face capped with a grid of solid voxels colored by the material inside.',
        color_and_tone:
          'Beauty-rendered outer half in its own colors; the cut face in flat saturated section colors per interior material.',
        lighting_and_shadow:
          'Normal three-point light on the model; the section cap lit flat so the voxel grid reads evenly.',
        texture_and_material:
          'Stepped voxel blocks along the cut, one color per inner material, straight clean plane edge where the model ends.',
        camera_and_composition:
          'Keep the requested camera; turn the cut plane toward the viewer so the section fills a large part of the frame.',
        atmosphere_and_mood: 'Curious and revealing, like opening a book of the object.',
        rendering_and_quality:
          'Crisp CG section with no torn or broken edges; the removed half is simply absent, never exploded.',
        key_features:
          'flat clipping plane; voxelized section cap; one color per interior material; beauty-lit outer half; no explosion',
      }),
      avoid: [...AVOID, 'exploded view parts', 'hand-drawn cutaway illustration', 'labels'],
      briefs: [
        'Clipping-plane voxel section of a castle keep sliced straight down the middle, the stone outer walls beauty-lit, the cut face a grid of voxels in flat colors for stone, timber floors, stairs and the cellar well, section turned toward the camera. No text or logo.',
        'Clipping-plane voxel section of a wild beehive in a hollow log, comb, honey and brood in flat section colors. No text or logo.',
        'Clipping-plane voxel section of a volcanic island, the magma chamber and vent stepped in orange voxels below grey rock. No text or logo.',
      ],
    },
    {
      name: 'Depth-Sliced Hologram Shader',
      domain: 'volumetric display shader',
      tags: ['hologram-shader', 'depth-slices', 'volumetric-display'],
      dna: sh({
        aesthetic:
          'Depth-sliced hologram shader: the subject rebuilt as dozens of parallel glowing contour slices stacked in depth, like a volumetric display, with dark gaps between layers.',
        color_and_tone:
          'Warm amber or soft green glowing lines on deep black, brighter where slices bunch at steep surfaces.',
        lighting_and_shadow:
          'Self-lit contour lines only; no shading, no projector beam and no scanline overlay.',
        texture_and_material:
          'Evenly spaced horizontal slice outlines, thin filled bands on each slice, the form read by how slice shapes change.',
        camera_and_composition:
          'Keep the requested camera; a three-quarter angle shows the stacked slice spacing best.',
        atmosphere_and_mood: 'Quiet and archival, a memory kept as layers of light.',
        rendering_and_quality:
          'Additive line render with crisp slice edges; distinct from translucent scanlined hologram material.',
        key_features:
          'stacked parallel contour slices; dark gaps between layers; amber or green self-lit lines; no scanlines; no projector beam',
      }),
      avoid: [...AVOID, 'cyan scanline hologram', 'projector beam', 'flicker glitch'],
      briefs: [
        'Depth-sliced hologram shader of a crowned lich skull floating in darkness, its bone rebuilt as dozens of stacked amber contour slices with black gaps between, slices bunching bright along the brow and jaw, three-quarter view. No text or logo.',
        'Depth-sliced hologram shader of a three-masted galleon, hull and sails as soft green stacked slices. No text or logo.',
        'Depth-sliced hologram shader of an anatomical heart, chambers traced by the changing slice outlines. No text or logo.',
      ],
    },
    {
      name: 'Unlit Albedo Pass',
      domain: 'base color render pass',
      tags: ['albedo-pass', 'render-pass', 'base-color'],
      dna: sh({
        aesthetic:
          'Unlit albedo pass: the scene shown only in its surface base colors and painted textures, with every trace of light, shadow and reflection removed.',
        color_and_tone:
          'Flat true material colors at even brightness; dark objects stay dark by pigment, never by shadow.',
        lighting_and_shadow:
          'None: no key, no ambient occlusion, no speculars; form reads only from color and texture changes.',
        texture_and_material:
          'Printed patterns, painted markings and wood grain fully visible, glossy surfaces as matte as paper.',
        camera_and_composition:
          'Keep the requested camera; overlapping forms of similar color merge into flat shapes.',
        atmosphere_and_mood: 'Flat, bright and uncanny, a world without light.',
        rendering_and_quality:
          'Clean diffuse-color buffer with crisp texture detail and no shading of any kind.',
        key_features:
          'base color only; no shadows or highlights; flat merged shapes; full texture detail; matte gloss',
      }),
      avoid: [...AVOID, 'shading', 'specular highlights', 'cast shadows'],
      briefs: [
        'Unlit albedo pass of a court jester costume on a wooden mannequin, harlequin diamonds, bells and ribbons in flat true colors with no shading at all, the folds readable only where patterns bend. No text or logo.',
        'Unlit albedo pass of a heap of dyed wool skeins in a market basket, each color flat and even. No text or logo.',
        'Unlit albedo pass of a painted wooden carousel horse, its gilded saddle and painted flowers shown with no light or shadow. No text or logo.',
      ],
    },
    {
      name: 'SDF Contour Band Shader',
      domain: 'signed distance field debug',
      tags: ['signed-distance-field', 'debug-shader', 'contour-bands'],
      dna: sh({
        aesthetic:
          'Signed distance field debug shader: a slicing plane through smoothly blended SDF shapes, painted with repeating distance rings, warm outside and cool inside.',
        color_and_tone:
          'Warm orange bands outside surfaces, cool blue bands inside, a thin white zero line on the exact surface, darker stripes every unit of distance.',
        lighting_and_shadow:
          'Unlit debug plane; the smooth-blended 3D shapes behind it lightly lit so their merged forms read.',
        texture_and_material:
          'Concentric contour stripes that round off at convex corners and pinch at concave blends, smooth-minimum joins between shapes.',
        camera_and_composition:
          'Keep the requested camera; the slice plane crosses the shapes at a clear readable angle.',
        atmosphere_and_mood: 'Mathematical and hypnotic, space measured in rings.',
        rendering_and_quality:
          'Raymarched finish with perfectly smooth blends and even stripe spacing; no polygons visible.',
        key_features:
          'repeating distance rings; orange outside and blue inside; white zero-surface line; smooth-minimum blends; raymarched forms',
      }),
      avoid: [...AVOID, 'polygon facets', 'topographic map terrain'],
      briefs: [
        'Signed distance field debug shader of a chess rook and bishop melting into each other through a smooth blend, a slicing plane through them painted with orange distance rings outside and blue rings inside, a thin white zero line hugging both silhouettes. No text or logo.',
        'SDF debug shader of three merged soap-smooth blobs orbiting a ring, the contour bands pinching where they join. No text or logo.',
        'SDF debug shader slicing a gothic tracery rose window, rings rounding every lobe and pinching at each cusp. No text or logo.',
      ],
    },
    {
      name: 'Overdraw Accumulation View',
      domain: 'render cost debug view',
      tags: ['overdraw-view', 'debug-render', 'transparency-layers'],
      dna: sh({
        aesthetic:
          'Overdraw debug view: every rendered layer adds a little brightness, so transparent and stacked surfaces glow in proportion to how many times each pixel was drawn.',
        color_and_tone:
          'Deep navy for one layer, through violet and hot orange, to white where dozens of layers stack.',
        lighting_and_shadow:
          'No lighting; brightness equals layer count, revealing hidden back faces and particle stacks.',
        texture_and_material:
          'All surfaces translucent and additive; particle clouds and foliage cards bloom brightest.',
        camera_and_composition:
          'Keep the requested camera; dense transparent effects in the frame produce the hot zones.',
        atmosphere_and_mood: 'Eerie and revealing, the hidden cost of a scene made visible.',
        rendering_and_quality:
          'Additive accumulation buffer with no shading, clean edges and smooth count gradients.',
        key_features:
          'additive layer counting; navy to orange to white ramp; hidden back faces visible; hot particle stacks; no lighting',
      }),
      avoid: [...AVOID, 'thermal camera look', 'lit shading'],
      briefs: [
        'Overdraw debug view of a procession of translucent ghosts drifting through a cloister, each overlapping ghost adding brightness from deep navy through violet to white-hot where a dozen bodies stack, pillars faint navy behind. No text or logo.',
        'Overdraw debug view of a particle waterfall pouring into a gorge, the spray cloud burning white at the base. No text or logo.',
        'Overdraw debug view of an apothecary wall of glass bottles, stacked glass layers glowing orange where they overlap. No text or logo.',
      ],
    },
    {
      name: 'Hex Force-Field Shield Shader',
      domain: 'game VFX shield shader',
      tags: ['force-field', 'vfx-shader', 'fresnel-shield'],
      dna: sh({
        subject_treatment: overlay,
        aesthetic:
          'Hexagonal force-field shader: a transparent energy dome or shell around the named subject, fresnel-bright at its rim, tiled with faint hexagon cells that flare at impact points.',
        color_and_tone:
          'One energy hue (teal, gold or violet) over the unchanged scene, bright white-hot rings at impacts.',
        lighting_and_shadow:
          'The shield adds soft light on nearby surfaces; impacts throw brief bright pulses, the scene light otherwise unchanged.',
        texture_and_material:
          'Hex cell grid visible mostly near the rim and around impacts, expanding ripple rings, scrolling noise inside cells.',
        camera_and_composition:
          'Keep the requested camera; the dome edge crosses the frame so the fresnel rim reads.',
        atmosphere_and_mood: 'Tense and protective, a barrier holding under strain.',
        rendering_and_quality:
          'Real-time VFX shader finish with clean additive glow; the subject stays sharp behind the shell.',
        key_features:
          'fresnel-bright dome rim; hexagon cell tiling; impact ripple rings; single energy hue; subject clear behind the shell',
      }),
      avoid: [...AVOID, 'game franchise shield likeness', 'solid glass dome'],
      briefs: [
        'Hexagonal force-field shader around a wizard tower on a crag, a teal energy dome with a fresnel-bright rim, hexagon cells flaring white where a catapult stone strikes it, ripple rings spreading, the stone tower sharp beneath. No text or logo.',
        'Hexagonal force-field shader shell wrapping a caravan wagon camp at dusk, gold hex cells shimmering along the rim. No text or logo.',
        'Hexagonal force-field shader around a modern research rover on a frozen plain, violet ripples where hail strikes. No text or logo.',
      ],
    },
    {
      name: 'Noise Dissolve Edge Shader',
      domain: 'game VFX dissolve shader',
      tags: ['dissolve-shader', 'vfx-shader', 'burn-edge'],
      dna: sh({
        subject_treatment: overlay,
        aesthetic:
          'Noise dissolve shader: the named subject disappearing along a threshold driven by procedural noise, leaving ragged holes with a thin glowing burn edge.',
        color_and_tone:
          'Subject in its own colors, a hot orange-to-white or cold cyan edge band, the background showing through the holes.',
        lighting_and_shadow:
          'Normal scene light; the glowing edge casts faint light onto nearby surfaces.',
        texture_and_material:
          'Cloudy noise-shaped holes, a crisp emissive rim of fixed width, small ember or ash particles drifting off the edge.',
        camera_and_composition:
          'Keep the requested camera; the dissolve front sweeps across the subject in one direction.',
        atmosphere_and_mood: 'Eerie and final, something being erased from the world.',
        rendering_and_quality:
          'Clean alpha-clip shader with a sharp emissive edge; no paper burn texture and no painted smoke.',
        key_features:
          'noise-driven holes; thin emissive edge band; ember particles off the edge; one-direction dissolve front; background through holes',
      }),
      avoid: [...AVOID, 'real burning paper', 'gore'],
      briefs: [
        'Noise dissolve shader on a weeping stone angel statue in a moonlit graveyard, the stone body vanishing from the feet upward in cloudy ragged holes, a thin orange-white burning edge band, embers drifting off, gravestones visible through the gaps. No text or logo.',
        'Noise dissolve shader on a red rose, petals erasing through cold cyan edge bands. No text or logo.',
        'Noise dissolve shader on a rowing boat at the waterline, the hull vanishing bow first into drifting ash. No text or logo.',
      ],
    },
    {
      name: 'Radial Scanner Pulse Shader',
      domain: 'game VFX scan shader',
      tags: ['scan-pulse', 'vfx-shader', 'edge-reveal'],
      dna: sh({
        subject_treatment: overlay,
        aesthetic:
          'Radial scanner pulse shader: an expanding ring of light sweeping across the scene from one point, briefly outlining every edge it crosses in glowing lines.',
        color_and_tone:
          'Dim, desaturated beauty render; a bright cyan or amber ring and edge highlights inside the pulse band.',
        lighting_and_shadow:
          'Scene stays dark and low-key; the pulse band is emissive and fades behind the ring.',
        texture_and_material:
          'Thin glowing edge lines on geometry within the band, faint grid projected on floors, sharp leading edge and soft trailing fade.',
        camera_and_composition:
          'Keep the requested camera; the ring expands from the foreground or center so its curvature reads.',
        atmosphere_and_mood: 'Searching and suspenseful, the dark revealed one ring at a time.',
        rendering_and_quality:
          'Screen-space depth-based pulse with crisp edges; no lidar points and no UI markers.',
        key_features:
          'expanding ring of light; edge lines lit inside the band; dim desaturated scene; sharp leading edge; soft trailing fade',
      }),
      avoid: [...AVOID, 'HUD markers', 'point cloud dots'],
      briefs: [
        'Radial scanner pulse shader sweeping through a catacomb ossuary, a bright amber ring expanding from the foreground, stacked skulls and bone walls outlined in glowing edge lines inside the band, the rest of the dim tunnel desaturated and dark. No text or logo.',
        'Radial scanner pulse shader rippling across a foggy moor with a circle of standing stones, each stone edge flaring cyan. No text or logo.',
        'Radial scanner pulse shader sweeping a derelict warehouse, crates and girders outlined as the ring passes. No text or logo.',
      ],
    },
    {
      name: 'Edge Detection Line Pass',
      domain: 'post-process line pass',
      tags: ['edge-detection', 'line-pass', 'post-process'],
      dna: sh({
        aesthetic:
          'Edge detection line pass: a post-process that draws black lines wherever depth or surface direction jumps, on plain white, with no shading and no triangle wires.',
        color_and_tone:
          'Black lines on white only; line weight heavier at silhouettes and lighter at inner creases.',
        lighting_and_shadow:
          'No lighting at all; lines come from depth and normal discontinuities, never from shadows.',
        texture_and_material:
          'Uniform computed strokes without taper, occasional doubled or broken lines at thin geometry, no hatching.',
        camera_and_composition:
          'Keep the requested camera and perspective; dense mechanical detail yields the richest line work.',
        atmosphere_and_mood: 'Clean and schematic, a scene reduced to its edges.',
        rendering_and_quality:
          'Screen-space Sobel filter look with pixel-even lines; no hand-drawn wobble, no mesh wireframe.',
        key_features:
          'lines from depth and normal jumps; heavier silhouette lines; white fill; no shading; no mesh triangles',
      }),
      avoid: [...AVOID, 'mesh wireframe triangles', 'hand-drawn wobble', 'cel shading'],
      briefs: [
        'Edge detection line pass of a siege workshop yard full of trebuchet parts, winches and stacked beams, heavy black silhouette lines and thin crease lines on pure white, no shading, low three-quarter perspective. No text or logo.',
        'Edge detection line pass of a nautilus shell cut open, chamber walls as fine even lines. No text or logo.',
        'Edge detection line pass of a grand piano with its lid raised, strings and hammers a dense web of lines. No text or logo.',
      ],
    },
    {
      name: 'Tonal Art Map Hatching Shader',
      domain: 'real-time hatching shader',
      tags: ['hatching-shader', 'npr-render', 'tonal-art-map'],
      dna: sh({
        aesthetic:
          'Real-time hatching shader: lit 3D geometry shaded with stacked hatch textures, one layer of strokes per tone, so darker areas gain cross-hatching automatically.',
        color_and_tone:
          'Dark ink strokes on warm paper white, or one ink color; tone comes only from stroke density.',
        lighting_and_shadow:
          'A single directional light; each shading step swaps in a denser hatch layer, shadows fully cross-hatched.',
        texture_and_material:
          'Strokes mapped onto the surface in UV space, following the geometry, at constant screen density with slight texture swimming.',
        camera_and_composition:
          'Keep the requested camera; strong single-light modeling shows all hatch levels.',
        atmosphere_and_mood: 'Bookish and moody, an engraving that turns in 3D.',
        rendering_and_quality:
          'Non-photorealistic render with even stroke density and clean silhouettes; distinct from hand-drawn ink and from cel shading.',
        key_features:
          'stacked hatch texture layers; tone by stroke density; strokes follow surface UVs; one directional light; clean silhouettes',
      }),
      avoid: [...AVOID, 'toon cel bands', 'hand-drawn sketch wobble'],
      briefs: [
        'Real-time hatching shader render of an adult plague doctor in a long beaked mask standing in a narrow stone alley, a single side light, lit side sparse parallel strokes, shadow side dense cross-hatching, strokes following the folds of the coat. No text or logo.',
        'Real-time hatching shader render of a raven perched on a tilted gravestone, feathers shaded by hatch density. No text or logo.',
        'Real-time hatching shader render of a copper kettle steaming on a hearth hook, curved hatch lines wrapping its belly. No text or logo.',
      ],
    },
  ],
};

export const aliases = { 'SP03-044': 'Thermal Vision' };

export default spec;
