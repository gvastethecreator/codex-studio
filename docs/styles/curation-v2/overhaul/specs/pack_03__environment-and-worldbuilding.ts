import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'franchise likeness',
  'recognizable game or film world',
  'readable text',
  'readable signage',
  'logo',
  'HUD or UI overlay',
];

// Theme category with two contracts. Environment directions are retained on purpose and say so:
// they supply the world, and the prompt's subject, action and camera are placed inside it.
// Portable environment renders keep the user's location and change only how it is built and rendered.
const direction = (world: string) =>
  `Environment direction (retained on purpose): this preset supplies ${world}; the prompt's subject, action and camera stay and are placed inside that world instead of being replaced by a stock scene.`;
const portable =
  "Portable environment render: keep the prompt's subject, action, location and camera; only how that environment is built, simulated and rendered changes, never where it is.";

function env(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? portable, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_03',
  category: '7. Environment And Worldbuilding',
  updates: {
    'SP03-033': {
      dna: env({
        subject_treatment: direction(
          'a vertical neon megacity at night: stacked residential blocks, sky bridges and glowing sign panels',
        ),
        aesthetic:
          'Neon megacity environment render: towering stacked blocks lit by hundreds of emissive sign panels, sky bridges and haze layers receding into a lit night fog.',
        color_and_tone:
          'Magenta, cyan and violet emissives against blue-black shadow; warm sodium accents at street level; highlights bloom, darks stay deep.',
        lighting_and_shadow:
          'Emissive sign panels are the only key lights, each spilling a colored pool; no sun or moon, and shadows fill with the neighbouring color.',
        texture_and_material:
          'Rain-slick metal and glass catching stretched neon reflections, grimy concrete, cable bundles and steam vents; sign panels show abstract glyph shapes, never letters.',
        camera_and_composition:
          'Keep the requested camera; depth is built from three or more haze layers so the far blocks fade into glowing fog.',
        atmosphere_and_mood: 'Crowded, humid and lonely at once, a city too tall to see the sky.',
        rendering_and_quality:
          'Real-time volumetric fog with bloom and screen-space reflections; emissive panels read as light sources, not flat stickers.',
        key_features:
          'emissive sign panels as key lights; stacked haze layers; stretched neon reflections; no sun; glyph shapes without letters',
      }),
      avoid: [...AVOID, 'wet night market', 'umbrella crowd', 'readable neon words'],
      briefs: [
        'Neon megacity environment render: an adult courier in a hooded rain shell crossing a narrow sky bridge between two towering blocks, seen from far below, magenta and cyan sign panels spilling colored pools across the wet metal deck, three haze layers fading into glowing fog. No readable signs or logo.',
        'Neon megacity environment render of a weathered stone gargoyle on a surviving cathedral ledge, now wedged between stacked apartment blocks, violet emissive panels glowing behind it through volumetric haze. No text or logo.',
        'Neon megacity environment render of a rooftop bronze bell shrine in the rain, cyan reflections stretched across wet copper tiles, the city dropping away into fog below. No text or logo.',
      ],
    },
    'SP03-039': {
      dna: env({
        subject_treatment: direction(
          'a nocturnal forest of self-lit flora: glowing fungi, luminous moss and drifting spores',
        ),
        aesthetic:
          'Bioluminescent forest environment render: a night forest lit only by its own glowing fungi, moss veins and drifting spores, with emissive networks tracing roots and branches.',
        color_and_tone:
          'Deep indigo night, cyan and teal glow with small violet and lime accents; glow sits in organic dots and veins, never a uniform wash.',
        lighting_and_shadow:
          'Emissive plants light their surroundings in soft falloff pools; unlit trunks read as dark silhouettes, and spores catch light as tiny halos.',
        texture_and_material:
          'Translucent fungal caps with subsurface glow, damp bark, beaded moss and spore particles suspended in thin ground mist.',
        camera_and_composition:
          'Keep the requested camera; foreground glowing plants frame darker middle ground so the subject reads against lit pockets.',
        atmosphere_and_mood: 'Hushed and reverent, a living forest breathing light in the dark.',
        rendering_and_quality:
          'Emissive shaders driving real bounce light, soft volumetric mist and small bloom; original flora, no film-world creatures.',
        key_features:
          'plants as the only light; cyan glow veins; spore halos; translucent fungal caps; ground mist pockets',
      }),
      avoid: [
        ...AVOID,
        'blue-skinned humanoids',
        'film alien world likeness',
        'lone hiker with backpack',
      ],
      briefs: [
        'Bioluminescent forest environment render: a ruined chapel bell tower swallowed by glowing root networks and cyan fungal shelves, the stone lit only from below by the plants, spores drifting as tiny halos through mist, low worm-eye view. No text or logo.',
        'Bioluminescent forest environment render of a grey heron wading through a stream of glowing teal algae, each step spreading rings of light. No text or logo.',
        'Bioluminescent forest environment render of a brown bear asleep in a hollow of luminous ferns, violet spore halos above its back. No text or logo.',
      ],
    },
    'SP03-055': {
      dna: env({
        aesthetic:
          'Room-scale VR environment render: the scene built as an optimized real-time level seen from standing eye height, with baked lighting and everything sharp for stereo viewing.',
        color_and_tone:
          'Bright, clean, slightly saturated colors with lifted shadows so nothing collapses to black inside a headset.',
        lighting_and_shadow:
          'Baked lightmaps with soft precomputed shadows and light probes; no dynamic flicker, no heavy volumetrics.',
        texture_and_material:
          'Simplified geometry with clean bevels, crisp mid-resolution textures, large readable surfaces and props sized for a hand to grab.',
        camera_and_composition:
          'Keep the requested location seen at about 1.6 m eye height with a wide 100–110° field of view; near-field objects within arm reach create presence.',
        atmosphere_and_mood:
          'Embodied and inviting, a space you feel you could step into and touch.',
        rendering_and_quality:
          'No depth of field, no motion blur and no film grain; stable, evenly sharp real-time render ready for stereo.',
        key_features:
          'standing eye height; wide field of view; baked lightmaps; props within arm reach; no depth of field',
      }),
      avoid: [...AVOID, 'VR controllers', 'headset visible', 'teleport arc', 'depth of field blur'],
      briefs: [
        'Room-scale VR environment render of a medieval apothecary shop seen from standing eye height, jars, mortar and drying herbs within arm reach on the counter, wide field of view, baked soft lighting, everything evenly sharp with no depth of field. No readable labels or logo.',
        'Room-scale VR environment render at the start of a rope bridge across a deep canyon, the first planks and rope rails right at hand height, baked afternoon light. No text or logo.',
        'Room-scale VR environment render inside an observatory dome, a brass telescope eyepiece within reach, crisp baked lightmaps on the curved walls. No text or logo.',
      ],
    },
    'SP03-056': {
      dna: env({
        subject_treatment:
          "Portable environment render: keep the prompt's subject and location; they become the geometry of a scientific data visualization with the measured field drawn around them.",
        aesthetic:
          'Scientific simulation visualization: the scene shown as grey context geometry with a measured field drawn over it as streamlines, isosurfaces and arrow glyphs.',
        color_and_tone:
          'Neutral light-grey geometry, one perceptual colormap (viridis or blue-to-red diverging) carrying the data, dark or white clean background.',
        lighting_and_shadow:
          'Soft even studio light with ambient occlusion so shapes read; the data layers are self-lit and never shaded dark.',
        texture_and_material:
          'Matte untextured context surfaces, thin tube streamlines, semi-transparent isosurface shells and small cone glyphs pointing along flow.',
        camera_and_composition:
          'Keep the requested view, pulled back just enough that the whole field and its source read at once.',
        atmosphere_and_mood: 'Calm, exact and explanatory, beauty coming from measured order.',
        rendering_and_quality:
          'Clean anti-aliased render with no photographic texture; the colormap is continuous and never rainbow-banded.',
        key_features:
          'streamline tubes; translucent isosurfaces; cone arrow glyphs; single perceptual colormap; grey matte context geometry',
      }),
      avoid: [...AVOID, 'legend text', 'axis numbers', 'rainbow jet colormap'],
      dropAvoid: ['fantasy', 'magic'],
      briefs: [
        'Scientific simulation visualization of airflow around a dragon with outspread wings: the dragon as matte grey geometry, thin streamline tubes curling off its wingtips into vortices, colored by speed in a viridis colormap on a dark background. No legend, text or logo.',
        'Scientific visualization of smoke dispersing from a charcoal kiln across a wooded valley, translucent concentration isosurfaces over grey terrain, blue-to-red diverging colormap. No text or logo.',
        'Scientific visualization of tidal currents around a rocky island, cone arrow glyphs laid on the water plane, colored by current speed. No text or logo.',
      ],
    },
    'SP03-060': {
      dna: env({
        aesthetic:
          'Environment concept render: the location staged as a designed game or film space with foreground, middle and background planes, a landmark and a readable path through it.',
        color_and_tone:
          'Warm, saturated foreground cooling to desaturated blue in the distance through atmospheric perspective; the landmark holds the brightest value.',
        lighting_and_shadow:
          'One directional sun with global illumination; light pools mark the path, shadowed foreground frames the view.',
        texture_and_material:
          'Tileable rock, wood and plaster materials with trim-sheet edges and scattered set dressing that tells how the place is used.',
        camera_and_composition:
          'Keep the requested location and camera; organize it into three depth planes with the path leading the eye to one landmark.',
        atmosphere_and_mood:
          'Inviting and explorable, a place that makes you want to walk to the landmark.',
        rendering_and_quality:
          'Production previs finish with height fog and GI; clear value grouping per depth plane, no empty vista.',
        key_features:
          'three depth planes; landmark with brightest value; guiding path; atmospheric blue falloff; storytelling set dressing',
      }),
      avoid: [...AVOID, 'city skyline at sunset', 'generic park lake'],
      briefs: [
        'Environment concept render of a mountain monastery reached by a switchback stone stair, dark pines framing the foreground, the stair lit in warm light pools, the bell tower landmark bright on the ridge and blue ranges fading behind. No text or logo.',
        'Environment concept render of a swamp village of stilt houses linked by plank walkways, lanterns marking the path to a moss-roofed longhouse. No text or logo.',
        'Environment concept render of an open-pit salt quarry with a wooden cargo crane as landmark, a ramp path spiraling down the white terraces. No text or logo.',
      ],
    },
    'SP03-063': {
      dna: env({
        subject_treatment:
          "Profile: keep the prompt's location and its landmarks; this preset owns the elevated isometric relief-map view and tabletop scale, and nothing else about the request changes.",
        aesthetic:
          'Isometric 3D relief map: the location sculpted as a tabletop terrain block with stepped contour terraces, a flat water plane and miniature landmarks.',
        color_and_tone:
          'Hypsometric tints from sea teal through meadow green and tan to white peaks; landmarks in warm clean accent colors.',
        lighting_and_shadow:
          'One low sun from the upper left casting long terrain shadows that make elevation readable; soft ambient occlusion in valleys.',
        texture_and_material:
          'Smooth matte terrain with visible contour steps, simplified clumped trees and small toy-like buildings; cut edges show layered strata.',
        camera_and_composition:
          'Fixed isometric or 30° elevated orthographic view of a square or round map block floating on a plain background.',
        atmosphere_and_mood: 'Curious and inviting, a whole place small enough to hold.',
        rendering_and_quality:
          'Clean stylized render with crisp contour edges and no fog, every region readable at a glance.',
        key_features:
          'tabletop terrain block; stepped contour terraces; hypsometric tints; low sun relief shadows; cut strata edges',
      }),
      avoid: [...AVOID, 'map labels', 'compass text', 'paper map texture'],
      briefs: [
        'Isometric 3D relief map of a walled city at the fork of two rivers, sculpted as a square tabletop terrain block with stepped contour terraces, a castle landmark on the hill, long shadows from a low sun, cut edges showing layered strata. No labels, text or logo.',
        'Isometric 3D relief map of a volcanic archipelago on a flat teal water plane, hypsometric tints from green shores to ash-white cones. No text or logo.',
        'Isometric 3D relief map of a mountain pass with a fortress gate and a winding road climbing through contour steps. No text or logo.',
      ],
    },
    'SP03-066': {
      dna: env({
        subject_treatment: direction(
          'a non-figurative procedural space of glossy curved forms and gradient depth',
        ),
        aesthetic:
          'Procedural abstract environment: sweeping glossy ribbons, extruded curves and soft volumes arranged in deep space, with no recognizable objects of their own.',
        color_and_tone:
          'Two or three hues in smooth gradients, one dark anchor tone and one bright accent; reflections carry the color changes.',
        lighting_and_shadow:
          'Large soft area lights producing long gradient highlights along the curves and gentle contact shadows where forms overlap.',
        texture_and_material:
          'Lacquer, frosted glass or satin metal surfaces, perfectly smooth, with thin edge bevels catching light.',
        camera_and_composition:
          'Keep the requested framing; forms sweep diagonally through three depth layers and leave calm space where a subject may sit.',
        atmosphere_and_mood: 'Calm, luxurious and weightless, rhythm without a story.',
        rendering_and_quality:
          'Noise-free path-traced finish with soft depth of field on the farthest layer.',
        key_features:
          'sweeping glossy ribbons; two-hue gradients; long area-light highlights; diagonal depth layers; calm subject space',
      }),
      avoid: [...AVOID, 'random floating spheres', 'fantasy city in the background'],
      dropAvoid: ['subject', 'object'],
      briefs: [
        'Procedural abstract environment of interlocking glossy obsidian and bronze ribbons sweeping diagonally through a deep crimson void, long area-light highlights running along each curve, farthest layer softly out of focus. No text or logo.',
        'Procedural abstract environment of frosted glass slabs and satin teal curves in three depth layers, gentle contact shadows where they overlap. No text or logo.',
        'Procedural abstract environment behind a white porcelain teapot on a small plinth, lacquered plum and gold ribbons curving around it and leaving calm space. No text or logo.',
      ],
    },
    'SP03-068': {
      dna: env({
        aesthetic:
          'Photogrammetry scan render: the scene rebuilt from hundreds of photographs as a dense triangulated mesh with photo-projected texture and the flaws of a real capture.',
        color_and_tone:
          'Natural, slightly flat photo albedo with the capture-day light baked in; true-to-life stains, lichen and dirt color.',
        lighting_and_shadow:
          'Soft neutral render light over delit textures, so baked-in shadows and new shading coexist faintly.',
        texture_and_material:
          'Micro-detailed real surface texture, smeared or stretched texels in occluded undersides, small mesh holes and blobby thin parts.',
        camera_and_composition:
          'Keep the requested location and view; scan edges fade to ragged mesh borders where coverage ends.',
        atmosphere_and_mood: 'Grounded and documentary, a real place frozen as data.',
        rendering_and_quality:
          'Scan-library realism with honest artifacts; never a clean hand-modeled asset.',
        key_features:
          'photo-projected texture; stretched texels in occlusion; ragged mesh border; blobby thin parts; baked capture light',
      }),
      avoid: [...AVOID, 'clean modeled edges', 'library brand'],
      briefs: [
        'Photogrammetry scan render of a weathered stone abbess effigy on a crypt tomb, every chisel mark and lichen spot in photo texture, stretched smeared texels under the chin and folded hands, ragged mesh border where the scan ends on the floor. No text or logo.',
        'Photogrammetry scan render of a moss-covered tree stump with shelf fungi, thin fungus edges gone blobby, capture light baked in. No text or logo.',
        'Photogrammetry scan render of a cast-iron wood stove in a farmhouse corner, rust flakes in micro detail, small holes behind the stovepipe. No text or logo.',
      ],
    },
    'SP03-069': {
      dna: env({
        aesthetic:
          'Pyro volume simulation: fire and smoke rendered as a physically simulated volume, with rolling pyroclastic billows, turbulent vortices and incandescent cores.',
        color_and_tone:
          'Blackbody fire from white-yellow core through orange to deep red edges, feeding into charcoal and brown smoke.',
        lighting_and_shadow:
          'The fire is the key light, lighting its own smoke from inside and throwing flickering orange onto nearby surfaces.',
        texture_and_material:
          'Dense cauliflower billows, thin wispy tendrils at the edges, embers and sparks advected by the flow.',
        camera_and_composition:
          'Keep the requested location and camera; the plume shows a clear direction of rise and expansion.',
        atmosphere_and_mood: 'Dangerous and immense, heat you can read in the motion.',
        rendering_and_quality:
          'High-resolution volumetric render with self-shadowed smoke and temperature-driven emission; no painted or cartoon flames.',
        key_features:
          'pyroclastic billows; blackbody color ramp; self-lit smoke; advected embers; clear rise direction',
      }),
      avoid: [...AVOID, 'cartoon flames', 'burning greenhouse'],
      briefs: [
        'Pyro volume simulation of a dragon-breath fireball rolling up a timber palisade wall, white-yellow core blooming into orange and deep red, charcoal pyroclastic billows lit from inside, embers streaming past the sharpened stakes. No text or logo.',
        'Pyro volume simulation of a burning pitch-ball flying from a siege catapult, a turbulent smoke trail curling behind it against a grey dawn. No text or logo.',
        'Pyro volume simulation of a stricken airship envelope engulfed in fire, smoke tendrils peeling off its ribs as it sags. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Hydraulic Erosion Heightfield',
      domain: 'procedural terrain simulation',
      tags: ['procedural-terrain', 'erosion-simulation', 'heightfield'],
      dna: env({
        subject_treatment:
          "Portable environment render: keep the prompt's subject, location and camera; the ground and landforms are rebuilt as a simulated eroded heightfield.",
        aesthetic:
          'Procedural terrain render: land built from a heightfield run through hydraulic and thermal erosion, with branching gullies, talus slopes and sediment fans.',
        color_and_tone:
          'Rock, sediment and vegetation colored by slope and flow masks: ochre bare cliffs, pale sediment in channels, green only on flat ground.',
        lighting_and_shadow:
          'Low raking sun that carves the fine erosion channels in sharp relief, with sky-blue fill in the shadowed gullies.',
        texture_and_material:
          'Dendritic drainage patterns, layered strata ridges, scree at slope feet and smooth deposition fans where water slowed.',
        camera_and_composition:
          'Keep the requested view; the erosion network runs downhill toward the subject or along the leading lines.',
        atmosphere_and_mood: 'Vast and ancient, land shaped by a million simulated years of rain.',
        rendering_and_quality:
          'Dense displaced terrain with mask-driven materials and light haze; no tiling rock texture repeats.',
        key_features:
          'dendritic erosion gullies; sediment fans; slope-masked colors; raking relief light; strata ridges',
      }),
      avoid: [...AVOID, 'smooth noise hills', 'tiling texture repeat'],
      briefs: [
        'Procedural hydraulic erosion terrain render of a red canyon wall with a ruined dwarf fortress gate carved into it, branching gullies draining toward the gate, pale sediment fans at the base, low raking sun carving every channel. No text or logo.',
        'Procedural erosion terrain render of a glacial valley floor, braided meltwater channels spreading grey sediment fans between moraine ridges. No text or logo.',
        'Procedural erosion terrain render of badlands at dusk, a single stone watchtower on a strata ridge above dendritic drainage patterns. No text or logo.',
      ],
    },
    {
      name: 'Modular Dungeon Kit Render',
      domain: 'game level environment art',
      tags: ['dungeon-environment', 'modular-kit', 'level-art'],
      dna: env({
        subject_treatment: direction(
          'a dark medieval dungeon assembled from snap-grid stone kit pieces, arches and torch sconces',
        ),
        aesthetic:
          'Modular dungeon environment render: corridors and halls assembled from repeating stone wall, arch, pillar and floor kit pieces on a snap grid.',
        color_and_tone:
          'Cold grey-green stone in deep shadow, warm amber torch pools, rare accents of rusted iron and faded red cloth.',
        lighting_and_shadow:
          'Wall-mounted torches every few modules each throw a warm pool with hard falloff; darkness between them is near black.',
        texture_and_material:
          'Trim-sheet stone blocks with beveled edges, damp moss in seams, iron grates, rope and dripping water decals.',
        camera_and_composition:
          'Keep the requested camera; kit repetition creates a rhythm of arches receding into darkness.',
        atmosphere_and_mood: 'Oppressive and cold, every archway promising something waiting.',
        rendering_and_quality:
          'Game-engine level art with baked GI, light dust in torch beams and visible but tasteful module repetition.',
        key_features:
          'snap-grid stone kit pieces; repeating arches; torch pools with hard falloff; trim-sheet bevels; moss in seams',
      }),
      avoid: [...AVOID, 'bright cheerful dungeon', 'monster crowd'],
      briefs: [
        'Modular dungeon kit render of a crypt corridor lined with sarcophagus alcoves, identical stone arch modules receding into darkness, a warm torch pool every third arch, moss in the block seams, dust hanging in the beams. No text or logo.',
        'Modular dungeon kit render of an empty throne hall of black stone pillars, a single iron chandelier lighting a rusted throne on a dais. No text or logo.',
        'Modular dungeon kit render of a flooded cistern with repeating vaulted bays, torchlight rippling on black water. No text or logo.',
      ],
    },
    {
      name: 'Rigid-Body Destruction Simulation',
      domain: 'VFX destruction simulation',
      tags: ['destruction-vfx', 'rigid-body', 'fracture-simulation'],
      dna: env({
        aesthetic:
          'Rigid-body destruction simulation: the named structure fracturing into Voronoi chunks mid-collapse, with debris arcs, dust bursts and secondary splinters frozen in one frame.',
        color_and_tone:
          'Material colors of the structure plus pale dust and darker fresh fracture faces; grading stays natural.',
        lighting_and_shadow:
          'Directional key revealing each chunk as a separate solid, dust volumes catching light and shadowing debris behind them.',
        texture_and_material:
          'Clean interior fracture surfaces contrasting weathered exteriors, bent rebar or splintered beams, fine particle dust and gravel.',
        camera_and_composition:
          'Keep the requested location and camera; the collapse moves along one clear direction with a falling debris arc.',
        atmosphere_and_mood: 'Violent and suspended, the loud instant a structure gives up.',
        rendering_and_quality:
          'Simulation-accurate chunk sizes grading from large to small, with slight motion blur on the fastest pieces.',
        key_features:
          'Voronoi fracture chunks; fresh interior fracture faces; debris arc; dust volume bursts; large-to-small chunk grading',
      }),
      avoid: [...AVOID, 'explosion fireball', 'casualties'],
      briefs: [
        'Rigid-body destruction simulation of an old stone bridge breaking mid-span over a gorge, Voronoi chunks with pale fresh fracture faces tumbling in a long debris arc, dust bursting from the break, side view. No text or logo.',
        'Rigid-body destruction simulation of a wooden siege tower toppling into a moat, beams splintering into secondary shards. No text or logo.',
        'Rigid-body destruction simulation of a concrete water tower on stilts folding at one leg, chunks and bent rebar mid-fall. No text or logo.',
      ],
    },
    {
      name: 'Simulated Open Ocean Swell',
      domain: 'ocean surface simulation',
      tags: ['ocean-simulation', 'water-vfx', 'seascape-render'],
      dna: env({
        subject_treatment: direction(
          'an open sea built from a simulated ocean surface with swell, whitecaps and spray',
        ),
        aesthetic:
          'Simulated open ocean render: a spectral wave surface with long swells, choppy secondary waves, whitecap foam masks and wind-blown spray.',
        color_and_tone:
          'Deep blue-black troughs, turquoise light through thin wave crests, bright white foam and cold grey sky reflections.',
        lighting_and_shadow:
          'Overcast or low sun reflected in broken glints; subsurface glow where light passes through crests.',
        texture_and_material:
          'Foam streaks lined up with the wind, spray mist off crests, trailing wake foam around any object in the water.',
        camera_and_composition:
          'Keep the requested camera; the horizon tilts with the swell and the nearest wave dominates the frame.',
        atmosphere_and_mood: 'Cold, heaving and indifferent, the sea larger than anything on it.',
        rendering_and_quality:
          'Physically based water with correct fresnel reflection, crest translucency and particle spray; no glassy flat water.',
        key_features:
          'long swells with choppy detail; wind-aligned foam streaks; translucent turquoise crests; spray mist; fresnel reflections',
      }),
      avoid: [...AVOID, 'flat calm water', 'lighthouse'],
      briefs: [
        "Simulated open ocean render of a sea serpent's ridged back breaking a heaving grey swell, turquoise light glowing through the thin crest beside it, wind-aligned foam streaks and spray mist, horizon tilted. No text or logo.",
        'Simulated open ocean render of a capsized wooden whaling boat riding a long swell, wake foam trailing from its keel. No text or logo.',
        'Simulated open ocean render of a basalt sea stack with a wave exploding into spray at its base under a low sun. No text or logo.',
      ],
    },
    {
      name: 'Floating Sky Island Archipelago',
      domain: 'fantasy world environment',
      tags: ['sky-islands', 'fantasy-environment', 'aerial-world'],
      dna: env({
        subject_treatment: direction(
          'an archipelago of floating rock islands above a sea of clouds, linked by bridges and falling water',
        ),
        aesthetic:
          'Sky island environment render: inverted-cone rock islands hanging above a cloud sea, root-bound undersides, waterfalls pouring off their edges into mist.',
        color_and_tone:
          'Warm sunlit tops in grass green and sandstone, cool violet-blue undersides, white-gold cloud sea.',
        lighting_and_shadow:
          'High sun lighting island tops while undersides fall into blue shade; islands cast soft shadows onto the cloud layer.',
        texture_and_material:
          'Exposed strata and dangling roots under each island, rope and chain bridges, mist trails from the waterfalls.',
        camera_and_composition:
          'Keep the requested camera; islands stack at different heights and sizes to sell great depth and scale.',
        atmosphere_and_mood: 'Dizzy, bright and wondrous, a world with no ground.',
        rendering_and_quality:
          'Volumetric cloud sea with aerial perspective between islands; clear scale cues from bridges and trees.',
        key_features:
          'inverted rock islands; dangling roots; waterfalls falling into mist; cloud sea below; stacked depth scale',
      }),
      avoid: [...AVOID, 'airship fleet', 'game-world likeness'],
      briefs: [
        'Sky island environment render of a cliffside monastery on a floating rock island, waterfalls pouring off its edges into a white-gold cloud sea, dangling roots under the violet-shadowed underside, smaller islands stacked behind. No text or logo.',
        'Sky island environment render of an adult goat herder leading goats across a sagging chain bridge between two floating islands. No text or logo.',
        'Sky island environment render of a tiny apple orchard on a floating rock, its shadow cast onto the clouds below. No text or logo.',
      ],
    },
    {
      name: 'Instanced Foliage Overgrowth',
      domain: 'procedural vegetation scatter',
      tags: ['foliage-scatter', 'overgrowth', 'procedural-vegetation'],
      dna: env({
        subject_treatment:
          "Portable environment render: keep the prompt's subject, location and camera; only surfaces gain scattered vegetation, and every object keeps its shape and era.",
        aesthetic:
          'Instanced foliage overgrowth: moss, ivy, grass and saplings scattered across the scene by slope, occlusion and age masks, as if decades of growth had been simulated.',
        color_and_tone:
          'Fresh greens and yellow-greens over the original materials, darker damp green in crevices, original colors showing through gaps.',
        lighting_and_shadow:
          'Soft sky light filtering through leaf canopies, dappled light on surfaces, dense ambient occlusion under growth.',
        texture_and_material:
          'Thousands of individual leaf and grass instances, ivy following edges and cracks, moss on upward faces, roots lifting joints.',
        camera_and_composition:
          'Keep the requested view; growth thickens toward the ground and in sheltered corners so shapes stay readable.',
        atmosphere_and_mood: 'Quiet and patient, nature slowly taking things back.',
        rendering_and_quality:
          'Dense instanced vegetation with individual leaves resolved; no flat green texture paint-over.',
        key_features:
          'mask-driven scatter by slope and occlusion; ivy along edges; moss on upward faces; leaf instances; roots lifting joints',
      }),
      avoid: [...AVOID, 'changing the object into a ruin', 'flat green paint-over'],
      briefs: [
        'Instanced foliage overgrowth render of an abandoned cathedral nave, ivy climbing every column along its edges, moss thick on upward stone faces, saplings rising between the lifted floor slabs, dappled light through a collapsed roof. No text or logo.',
        'Instanced foliage overgrowth render of a modern red farm tractor parked in a meadow, still clearly a modern tractor, grass and vines scattered over its tires and hood. No text or logo.',
        'Instanced foliage overgrowth render of a wooden trebuchet left on a hillside, grass instances swallowing its wheels and ivy up its arm. No text or logo.',
      ],
    },
    {
      name: 'Geode Cavern Environment',
      domain: 'underground crystal environment',
      tags: ['crystal-cavern', 'underground-environment', 'geode'],
      dna: env({
        subject_treatment: direction(
          'a vast underground geode cavern lined with giant crystal columns and still water',
        ),
        aesthetic:
          'Geode cavern environment render: a huge underground chamber lined with giant faceted crystal columns, lit by a few small sources and their refracted light.',
        color_and_tone:
          'Milky white and pale amethyst crystal against dark wet rock; warm lantern light turned into cold refracted glints.',
        lighting_and_shadow:
          'One or two small warm sources refracted and reflected through the crystals, producing caustic flecks and glowing edges; the cave depths stay black.',
        texture_and_material:
          'Faceted translucent crystal with internal fractures, wet dark rock, dust motes and mirror-still water reflecting the columns.',
        camera_and_composition:
          'Keep the requested camera; crystal columns cross the frame at angles and dwarf anything human-sized.',
        atmosphere_and_mood: 'Silent and awestruck, a cathedral nobody built.',
        rendering_and_quality:
          'Path-traced refraction and caustics with light volumetric dust; crystals refract light, never self-glow.',
        key_features:
          'giant faceted crystal columns; refracted caustic flecks; small warm sources only; still reflecting water; huge scale',
      }),
      avoid: [...AVOID, 'glowing neon crystals', 'bioluminescent plants'],
      briefs: [
        'Geode cavern environment render of a lone rowboat with a lantern on an underground lake, giant milky crystal columns slanting overhead, the lantern light refracted into cold caustic flecks, still water mirroring everything. No text or logo.',
        "Geode cavern environment render of an old mine cart track running between crystal columns thick as towers, a miner's lamp throwing glints. No text or logo.",
        'Geode cavern environment render of a carved stone altar at the heart of an amethyst chamber, a single candle refracted into hundreds of points. No text or logo.',
      ],
    },
    {
      name: 'Particle Blizzard Simulation',
      domain: 'weather particle simulation',
      tags: ['weather-vfx', 'particle-simulation', 'blizzard'],
      dna: env({
        subject_treatment:
          "Portable environment render: keep the prompt's subject, location and camera; only a simulated blizzard of wind-driven snow particles is added over them.",
        aesthetic:
          'Particle blizzard simulation: millions of wind-driven snow particles streaming across the scene in layered sheets, with gust eddies and drifts building against obstacles.',
        color_and_tone:
          'Blue-white snow, cold grey-blue shadows, near-white visibility falloff in the distance; any warm light becomes a haloed point.',
        lighting_and_shadow:
          'Flat diffuse storm light with backlit snow sheets; point lights bloom into soft glowing halos in the particle volume.',
        texture_and_material:
          'Motion-blurred streaks near camera, fine particles in the midground, snow crusting on windward faces and drifting in lee corners.',
        camera_and_composition:
          'Keep the requested camera; visibility drops sharply with distance so the subject reads as a silhouette in white.',
        atmosphere_and_mood: 'Harsh and isolating, the wind louder than anything.',
        rendering_and_quality:
          'Layered particle volume with depth-based density and motion blur; no painted snow overlay.',
        key_features:
          'wind-driven particle sheets; motion-blurred near streaks; drifts on windward faces; haloed point lights; steep visibility falloff',
      }),
      avoid: [...AVOID, 'gentle snowfall', 'christmas decoration'],
      briefs: [
        'Particle blizzard simulation over a stone waystation hut on a mountain pass, wind-driven snow sheets streaming diagonally across the frame, motion-blurred near streaks, its single lit window blooming into a halo, drifts piling on the windward wall. No text or logo.',
        'Particle blizzard simulation of a wolf pack crossing a frozen river in single file, silhouettes fading into white within a few lengths. No text or logo.',
        'Particle blizzard simulation around a modern polar research container station, still clearly modern, its floodlights haloed in the particle volume. No text or logo.',
      ],
    },
    {
      name: 'Exoplanet Surface Environment',
      domain: 'alien planet environment',
      tags: ['exoplanet', 'alien-landscape', 'space-environment'],
      dna: env({
        subject_treatment: direction(
          'the surface of an alien planet with a giant neighbouring world or twin suns in the sky',
        ),
        aesthetic:
          'Exoplanet surface environment render: alien terrain under a strange sky, a giant ringed planet or twin suns hanging above, thin atmosphere scattering odd colors.',
        color_and_tone:
          'Non-terrestrial palette such as rust sand under a teal sky or violet rock under an amber sky; one complementary accent from the sky body.',
        lighting_and_shadow:
          "Twin suns throwing two shadows of different color, or planetshine filling shadows with the giant planet's hue.",
        texture_and_material:
          'Wind-sculpted rock, fine regolith dust, frost or mineral crusts, with scale cues from boulders and footprints.',
        camera_and_composition:
          'Keep the requested camera; the sky body occupies a large part of the frame to set the world instantly.',
        atmosphere_and_mood: 'Lonely and awe-struck, the quiet of a place no one was meant to see.',
        rendering_and_quality:
          'Physically based atmospheric scattering with haze layers and crisp near-field regolith detail.',
        key_features:
          'giant sky planet or twin suns; double colored shadows; non-Earth palette; regolith dust; atmospheric haze layers',
      }),
      avoid: [...AVOID, 'film spacecraft likeness', 'earth-like blue sky'],
      briefs: [
        'Exoplanet surface environment render of an adult knight in dented plate armor standing on rust-colored dunes under a teal sky, a vast ringed planet filling the upper frame, twin suns casting two differently colored shadows behind him. No text or logo.',
        'Exoplanet surface environment render of a derelict landing craft half-buried in violet regolith, amber sky and haze layers beyond. No text or logo.',
        'Exoplanet surface environment render of tall wind-carved rock spires beside a still methane lake reflecting a huge pale moon. No text or logo.',
      ],
    },
    {
      name: 'Level Blockout Greybox',
      domain: 'game level blockout',
      tags: ['level-blockout', 'greybox', 'layout-render'],
      dna: env({
        aesthetic:
          'Level blockout greybox: the location rebuilt from untextured boxes, ramps and cylinders with prototype grid materials, the stage before any art pass.',
        color_and_tone:
          'Neutral mid-grey primitives, orange and dark-grey prototype grid tiles on walkable floors, one flat blue sky.',
        lighting_and_shadow:
          'Single default directional light with simple sharp shadows and flat ambient; no mood lighting.',
        texture_and_material:
          'Faceless primitive volumes, grid tiles showing one-meter measurements, no detail beyond the block silhouettes.',
        camera_and_composition:
          'Keep the requested location and camera; landmarks become tall simple blocks, paths become ramps and steps.',
        atmosphere_and_mood: 'Honest and structural, a place stripped to space and scale.',
        rendering_and_quality:
          'Editor-viewport render with crisp edges, no fog, no post effects and no textures besides the grid.',
        key_features:
          'grey primitive volumes; orange prototype grid floors; one-meter measure tiles; default directional light; no detail',
      }),
      avoid: [...AVOID, 'finished textures', 'decorative props', 'editor gizmos'],
      briefs: [
        'Level blockout greybox of a castle gatehouse and inner courtyard, walls and towers as plain grey boxes and cylinders, orange prototype grid tiles on the ramps and walkways showing one-meter measurements, a single default sun with sharp shadows. No text or logo.',
        'Level blockout greybox of a harbor with stepped docks and a warehouse block, grid floors across every pier. No text or logo.',
        'Level blockout greybox looking up a spiral staircase inside a round tower, grey steps as stacked boxes. No text or logo.',
      ],
    },
    {
      name: 'Hand-Painted Texture Environment',
      domain: 'stylized game environment',
      tags: ['hand-painted-textures', 'stylized-environment', 'game-art'],
      dna: env({
        aesthetic:
          'Hand-painted texture environment: chunky stylized 3D geometry wrapped in painted diffuse textures where light, shadow and wear are painted into the color itself.',
        color_and_tone:
          'Saturated warm palette with painted gradients from warm tops to cool bottoms and bright painted edge highlights.',
        lighting_and_shadow:
          'Mostly unlit shading: painted light and ambient occlusion in the textures, only soft real shadows added.',
        texture_and_material:
          'Visible brush strokes in stone, wood and roof tiles; exaggerated chipped edges; oversized planks and cartoon-proportioned bevels.',
        camera_and_composition:
          'Keep the requested location and camera; chunky silhouettes lean and taper for a hand-built feel.',
        atmosphere_and_mood: 'Cozy, warm and welcoming, a place built for adventure.',
        rendering_and_quality:
          'Low specular, no photographic texture and no physically based sheen; strokes stay readable at distance.',
        key_features:
          'painted diffuse textures; brush strokes in stone and wood; painted edge highlights; chunky leaning silhouettes; low specular',
      }),
      avoid: [...AVOID, 'photographic texture', 'PBR metal sheen', 'game-world likeness'],
      briefs: [
        'Hand-painted texture environment render of a crooked village tavern interior, oversized planks and leaning beams with visible brush strokes, warm painted highlights on every chipped edge, a painted hearth glow on the floor. No readable signs or logo.',
        'Hand-painted texture environment render of a watermill over a stream, chunky tapered stone walls and a painted wooden wheel. No text or logo.',
        'Hand-painted texture environment render of a mushroom-cap village square seen from a hilltop path, cartoon-proportioned roofs painted warm-to-cool. No text or logo.',
      ],
    },
  ],
};

export default spec;
