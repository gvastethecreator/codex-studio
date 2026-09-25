import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'franchise likeness',
  'studio character likeness',
  'celebrity likeness',
  'readable text',
  'software logo',
  'replacing the subject with a renderer demo scene',
];

// Render presets describe observable light transport and material behavior, not brand identity.
const render =
  "Keep the prompt subject, action and setting and render them as 3D CGI through this renderer's light transport, sampling and material response, without swapping in a renderer demo subject.";

function cg(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? render, ...rest } as Dna;
}

const BASE = ['2d illustration', 'hand-drawn', 'photograph without CGI cues', ...AVOID];

const spec: Spec = {
  pack: 'pack_03',
  category: '1. Render Engines',
  updates: {
    'SP03-001': {
      dna: cg({
        aesthetic:
          'Spectral GPU path tracing: an unbiased GPU render with spectral light, so glass and gems split light into rainbow caustics, finished with glare and bloom.',
        color_and_tone:
          'Vivid saturated color, deep glossy blacks, rainbow dispersion edges, hot bloomed highlights.',
        lighting_and_shadow:
          'HDRI plus area lights; sharp caustic patterns under glass, soft contact shadows, glare streaks on speculars.',
        texture_and_material:
          'Hyper-glossy clearcoats, faceted glass, thin-film iridescence, micro-scratches in highlights.',
        camera_and_composition:
          'Three-quarter hero view, shallow depth of field with smooth round bokeh.',
        atmosphere_and_mood: 'Dazzling and showy, every surface competing to sparkle.',
        rendering_and_quality:
          'Fully converged path trace with dispersion and post glare; no noise and no flat plastic shading.',
        key_features:
          'spectral dispersion rainbows; caustics under glass; glare and bloom; glossy clearcoat; round bokeh',
      }),
      avoid: BASE,
      briefs: [
        'Spectral path-traced CGI render of a faceted crystal dragon egg on a black velvet cushion, rainbow dispersion splitting through its facets, sharp caustics on the velvet, glare streaks on the highlights. No text or logo.',
        'Spectral path-traced render of a rack of glass potion bottles glowing violet and amber, colored caustics pooling on the shelf below, round bokeh behind. No text or logo.',
        'Spectral path-traced render of a chrome and iridescent beetle standing on a mirror, thin-film rainbow on its wing cases, bloom on the brightest glints. No text or logo.',
      ],
    },
    'SP03-002': {
      dna: cg({
        aesthetic:
          'Unreal Engine 5 real-time render: dynamic global illumination, film-quality micro-detail geometry and volumetric fog running at game frame rates.',
        color_and_tone:
          'Naturalistic filmic tonemapping, warm sun against cool sky fill, gentle bloom.',
        lighting_and_shadow:
          'Real-time bounce light filling caves and interiors, virtual shadow maps with crisp contact detail, god rays in fog.',
        texture_and_material:
          'Scanned rock and bark with dense micro-geometry, slight temporal anti-aliasing softness on fine detail.',
        camera_and_composition:
          'Cinematic game camera, wide vistas or third-person framing with depth.',
        atmosphere_and_mood: 'Grand and immersive, a playable world at cinematic fidelity.',
        rendering_and_quality: 'Real-time next-gen look with subtle TAA softness; no UI or HUD.',
        key_features:
          'real-time bounce GI; micro-detail scanned geometry; volumetric fog shafts; filmic tonemap; TAA softness',
      }),
      avoid: [...BASE, 'game HUD'],
      briefs: [
        'Real-time Unreal Engine 5 style render of a ruined elven temple in a misty valley at sunrise, scanned stone with dense micro-detail, bounce light filling the broken halls, volumetric shafts through the fog. No HUD, text or logo.',
        'Real-time render of an adult knight in dented plate walking through a narrow rock canyon, sun bouncing warm light off the canyon walls, crisp contact shadows. No HUD, text or logo.',
        'Real-time render of a torchlit dungeon corridor filled with volumetric fog, flickering bounce light on wet stones, slight TAA softness. No HUD, text or logo.',
      ],
    },
    'SP03-003': {
      dna: cg({
        aesthetic:
          'Biased GPU production render: fast, clean motion-graphics lighting with crisp speculars, smooth gradients and controlled global illumination.',
        color_and_tone:
          'Clean saturated brand-like colors, smooth gradient backgrounds, bright whites.',
        lighting_and_shadow:
          'Large area lights and gradient domes, soft shadows, crisp specular strips on edges.',
        texture_and_material:
          'Satin plastics, brushed metal, frosted glass, perfectly clean surfaces.',
        camera_and_composition:
          'Centered floating objects, orthographic or long-lens feel, generous negative space.',
        atmosphere_and_mood: 'Polished and upbeat, motion design frozen at its best frame.',
        rendering_and_quality: 'Noise-free biased GI with crisp edges; no gritty realism.',
        key_features:
          'clean motion-graphics lighting; crisp specular strips; gradient backgrounds; floating objects; satin plastics',
      }),
      avoid: [...BASE, 'gritty realism'],
      briefs: [
        'Biased GPU production render of floating candy-colored spheres, toruses and a twisted ribbon orbiting a glowing orb, crisp specular strips, smooth pink-to-violet gradient background. No text or logo.',
        'Biased GPU render of a black-and-gold perfume bottle levitating above a frosted glass plinth, soft shadow, satin reflections. No text or logo.',
        'Biased GPU render of a jellyfish made of nested frosted-glass rings drifting in a clean blue void, crisp rim highlights. No text or logo.',
      ],
    },
    'SP03-004': {
      dna: cg({
        aesthetic:
          'Feature-film VFX path tracing: an unbiased CPU render tuned for photoreal creatures, skin, volumes and plate-matched lighting in a color-managed pipeline.',
        color_and_tone:
          'Natural filmic color with ACES-like rolloff, restrained saturation, deep but detailed shadows.',
        lighting_and_shadow:
          'Physically accurate area and HDRI lighting, multiple scattering in smoke and fog, soft realistic shadows.',
        texture_and_material:
          'Layered skin with subsurface scattering, pores and sweat, micro-displacement on scales and fabric.',
        camera_and_composition:
          'Cinematic lens with real depth of field, creature or character at dramatic scale.',
        atmosphere_and_mood: 'Grounded and believable, the impossible rendered as real.',
        rendering_and_quality:
          'Photoreal VFX finish with film grain matching; no plastic CG sheen.',
        key_features:
          'photoreal subsurface skin; volumetric multiple scattering; micro-displacement; filmic color management; plate-matched realism',
      }),
      avoid: [...BASE, 'plastic CG sheen'],
      briefs: [
        'Feature-film VFX render of an adult troll in extreme close-up, subsurface scattering glowing through his ears, pores, warts and sweat in micro-detail, filmic color. No text or logo.',
        'Feature-film VFX render of a dragon exhaling a column of smoke that scatters golden light in thick volumes, scales with micro-displacement. No text or logo.',
        'Feature-film VFX render of an adult sorceress in rain-soaked chainmail, water beading on each ring, skin with realistic scattering. No text or logo.',
      ],
    },
    'SP03-005': {
      dna: cg({
        aesthetic:
          'Open path tracer look: a node-shaded, physically based render with principled materials, a filmic view transform and clean denoised output.',
        color_and_tone:
          'Soft filmic contrast, gently desaturated highlights, warm practical light against cool fill.',
        lighting_and_shadow:
          'HDRI world light with practical point lights, soft bounce and denoised shadows.',
        texture_and_material:
          'Procedural wood, stone and moss from noise textures, principled glass and metal, slightly soft micro-detail.',
        camera_and_composition: 'Cozy medium shots or small dioramas with shallow depth of field.',
        atmosphere_and_mood: 'Warm and handcrafted, a hobbyist world rendered with love.',
        rendering_and_quality:
          'Denoised clean path trace with slight denoiser smoothness in dark areas.',
        key_features:
          'principled materials; procedural textures; filmic view transform; denoised soft shadows; cozy diorama framing',
      }),
      avoid: BASE,
      briefs: [
        "Open path-traced render of a cozy wizard's desk with melting candles, a brass astrolabe and leather books without titles, procedural wood grain, warm candlelight against cool window fill. No text or logo.",
        'Open path-traced render of a small stone golem covered in procedural moss standing in a forest clearing, soft denoised shadows. No text or logo.',
        'Open path-traced render of a ship in a glass bottle on a windowsill, principled glass refraction and filmic highlights. No text or logo.',
      ],
    },
    'SP03-006': {
      dna: cg({
        aesthetic:
          'Architectural visualization raytrace: interiors and buildings rendered with sun-and-sky daylight, clean glass and a warm neutral exposure for presentations.',
        color_and_tone:
          'Warm neutral whites, honey wood, soft blue sky, compressed highlights in windows.',
        lighting_and_shadow:
          'Physical sun and sky through large windows, soft bounce filling rooms, crisp window shadows on floors.',
        texture_and_material:
          'Oak, concrete, linen, clear and frosted glass, polished stone with blurred reflections.',
        camera_and_composition:
          'Two-point perspective with straight verticals, wide lens at eye height.',
        atmosphere_and_mood: 'Serene and aspirational, a space waiting to be lived in.',
        rendering_and_quality:
          'Clean archviz render with no clutter and no oversaturated HDR look.',
        key_features:
          'sun and sky through big windows; straight verticals; warm neutral exposure; polished stone reflections; clean glass',
      }),
      avoid: [...BASE, 'converging verticals'],
      briefs: [
        'Architectural visualization render of a stone chapel converted into a bright modern home, sun pouring through tall lancet windows onto oak floors, straight verticals, warm neutral exposure. No text or logo.',
        'Architectural visualization render of a glass villa cantilevered over a sea cliff at sunset, soft sky bounce inside, blurred reflections in polished stone. No text or logo.',
        'Architectural visualization render of a vaulted monastery library with long oak tables and window shafts, calm and uncluttered. No readable book spines or logo.',
      ],
    },
    'SP03-007': {
      dna: cg({
        aesthetic:
          'Product studio render: a single object rendered with studio HDRI reflections on a gradient backdrop, showing exact material swatches and finishes.',
        color_and_tone:
          'Neutral grey or black gradient backdrop, accurate material color, clean highlights.',
        lighting_and_shadow:
          'Studio HDRI with long softbox reflections, soft ground shadow and a subtle reflection floor.',
        texture_and_material:
          'Mold-texture plastics, anodized metal, stitched leather, cut gems with precise highlights.',
        camera_and_composition: 'Centered three-quarter product view, object filling the frame.',
        atmosphere_and_mood: 'Precise and desirable, a design object at its launch.',
        rendering_and_quality:
          'Crisp product visualization with no clutter and no photographic imperfections.',
        key_features:
          'studio HDRI softbox reflections; gradient backdrop; accurate material swatches; ground shadow; centered product',
      }),
      avoid: BASE,
      briefs: [
        'Product studio render of a brass pocket lantern with a faceted glass window, long softbox reflections along its curves, soft ground shadow on a dark gradient backdrop. No text or logo.',
        'Product studio render of a jeweled dagger hilt with a wrapped leather grip, cut garnets catching precise highlights, grey gradient background. No text or logo.',
        'Product studio render of an ornate brass spellbook clasp and hinge, anodized and polished finishes side by side. No text or logo.',
      ],
    },
    'SP03-008': {
      name: 'Feature Animation Path Tracer',
      dna: cg({
        aesthetic:
          'Feature-animation path tracing: stylized characters and sets rendered with rich subsurface skin, luminous bounce light and storybook saturation.',
        color_and_tone: 'Saturated warm-cool color script, glowing skin, luminous colored shadows.',
        lighting_and_shadow:
          'Cinematic key with warm bounce, colored rim lights, soft shadows that stay full of color.',
        texture_and_material:
          'Rounded stylized forms, soft fabrics with fuzz, translucent ears and fingers, painterly textures.',
        camera_and_composition: 'Cinematic character framing with shallow depth of field.',
        atmosphere_and_mood: 'Heartfelt and whimsical, emotion carried by warm light.',
        rendering_and_quality:
          'Feature-film animation finish; original designs only, no studio characters.',
        key_features:
          'stylized rounded forms; rich subsurface skin; colorful luminous shadows; warm bounce; cinematic depth of field',
      }),
      avoid: [...BASE, 'studio mascot'],
      briefs: [
        'Feature-animation path-traced render of an adult grumpy troll chef in a cozy stone kitchen, flour on his tusks, warm bounce light and glowing translucent ears, colored shadows. No text or logo.',
        'Feature-animation render of a tiny dragon curled around a steaming teapot on a windowsill, soft fuzz on its wings, rim light. No text or logo.',
        'Feature-animation render of a nervous living lantern character hopping through a dark forest, its own glow lighting the ferns. No text or logo.',
      ],
    },
    'SP03-009': {
      dna: cg({
        aesthetic:
          'Digital clay sculpt: a raw viewport render of a sculpted model under a matcap material, with brush strokes and clay texture still visible.',
        color_and_tone:
          'Single matcap tone — red wax, grey clay or brown clay — with a baked highlight and dark cavities.',
        lighting_and_shadow:
          'Matcap shading only: a fixed studio highlight, no cast shadows, no global illumination.',
        texture_and_material:
          'Brush strokes, pinched edges, clay buildup, polygon-free smoothness.',
        camera_and_composition: 'Bust or full figure centered on a dark viewport background.',
        atmosphere_and_mood: "Raw and artistic, form discovered under the sculptor's hand.",
        rendering_and_quality: 'Viewport sculpt look; no textures, no scene lighting, no UI.',
        key_features:
          'matcap red wax or grey clay; visible brush strokes; no cast shadows; dark viewport background; centered bust',
      }),
      avoid: [...BASE, 'viewport UI', 'textured color'],
      briefs: [
        'Digital clay sculpt of a snarling gargoyle bust in red wax matcap, deep brush strokes around the brow and wings, no cast shadows, dark viewport background. No UI or text.',
        'Digital clay sculpt of a horned dragon head in grey clay matcap, pinched scales and clay buildup on the horns. No UI or text.',
        'Digital clay sculpt of a coiling many-headed hydra in brown clay matcap, brush marks visible along the necks. No UI or text.',
      ],
    },
    'SP03-010': {
      dna: cg({
        aesthetic:
          'High-end game pipeline render: a real-time engine frame with heavy post-processing — bloom, lens flares, color grading and screen-space effects.',
        color_and_tone:
          'Punchy graded color, strong bloom on emissives, filmic tonemap with lifted blacks.',
        lighting_and_shadow:
          'Baked and real-time mix, reflection probes, screen-space reflections with slight edge artifacts.',
        texture_and_material:
          'PBR materials, particle effects, decals, slightly repeating tiling textures.',
        camera_and_composition:
          'Third-person or cinematic game camera, lens flare from bright sources.',
        atmosphere_and_mood: 'Epic and game-like, a moment made for a trailer.',
        rendering_and_quality:
          'Real-time game look with post effects; no HUD, no trams or city clichés.',
        key_features:
          'heavy bloom and lens flares; screen-space reflections; particle effects; PBR materials; graded filmic tonemap',
      }),
      avoid: [...BASE, 'game HUD', 'tram'],
      briefs: [
        'High-end game pipeline render of a floating sky island with waterfalls pouring off its edges, bloom on the sun, lens flares, graded warm color. No HUD, text or logo.',
        'Game pipeline render of an adult battle mage casting a spiral of particle fire, bloom on the emissive runes, screen-space reflections on wet stone. No HUD, text or logo.',
        'Game pipeline render of a night swamp full of fireflies, reflection probes on the black water, particle glow. No HUD, text or logo.',
      ],
    },
  },
  creates: [
    {
      name: '90s Scanline Phong Render',
      domain: 'early scanline CGI',
      tags: ['scanline', 'phong', 'retro-cgi'],
      dna: cg({
        aesthetic:
          '90s scanline render: early computer graphics with Phong and Gouraud shading, hard plastic highlights, no global illumination and few or no shadows.',
        color_and_tone:
          'Saturated flat colors, plastic white highlights, black or gradient sky backgrounds.',
        lighting_and_shadow:
          'One or two point lights, hard specular blobs, shadow maps or no shadows at all.',
        texture_and_material:
          'Low-resolution textures, faceted polygon edges, checkerboard floors, plastic sheen.',
        camera_and_composition: 'Centered objects, simple sets, wide field of view.',
        atmosphere_and_mood: 'Nostalgic and naive, the first steps of digital worlds.',
        rendering_and_quality: 'Early CG look with visible polygon facets; no modern path tracing.',
        key_features:
          'Phong plastic highlights; no global illumination; faceted polygons; checkerboard floor; low-res textures',
      }),
      avoid: [...BASE, 'global illumination', 'photoreal'],
      briefs: [
        '90s scanline CGI render of a chrome-and-red knight helmet on a checkerboard floor, hard plastic Phong highlights, no shadows, black background. No text or logo.',
        '90s scanline render of a low-polygon dragon with Gouraud-smoothed faces and a blurry low-res scale texture. No text or logo.',
        '90s scanline render of a castle on a green hill under a gradient sky, faceted towers, a single hard point light. No text or logo.',
      ],
    },
    {
      name: 'Classic Raytracer Mirror Demo',
      domain: 'classic recursive raytracing',
      tags: ['raytracing', 'mirror', 'retro-cgi'],
      dna: cg({
        aesthetic:
          'Classic recursive raytracing: perfect mirrors and clear glass reflecting and refracting each other endlessly over an infinite floor, with razor-hard shadows.',
        color_and_tone: 'Saturated primaries, pure mirror chrome, clean blue sky gradient.',
        lighting_and_shadow: 'Point lights with perfectly hard shadows; no soft light, no bounce.',
        texture_and_material:
          'Flawless mirror and glass, checkerboard or tiled floor stretching to the horizon.',
        camera_and_composition:
          'Low camera over the endless floor, objects arranged like a demo scene.',
        atmosphere_and_mood: 'Crystalline and uncanny, a perfect world with no dust.',
        rendering_and_quality:
          'Aliased-free but unmistakably early raytraced look; no noise, no GI.',
        key_features:
          'perfect mirrors and glass; hard point-light shadows; infinite checkerboard; recursive reflections; no bounce light',
      }),
      avoid: [...BASE, 'soft shadows'],
      briefs: [
        'Classic raytraced render of mirror spheres and a clear glass goblet on an infinite checkerboard floor, each reflecting the others endlessly, razor-hard shadows, blue gradient sky. No text or logo.',
        'Classic raytraced render of a chrome chess set mid-game, every piece reflecting the board and each other. No text or logo.',
        'Classic raytraced render of a floating glass crown above an infinite checkerboard, the squares bending and flipping inside its refracting jewels, a chrome sphere beside it mirroring both, razor-hard shadows and a blue gradient sky. No text or logo.',
      ],
    },
    {
      name: 'Radiosity Color Bleed',
      domain: 'radiosity global illumination',
      tags: ['radiosity', 'global-illumination', 'retro-cgi'],
      dna: cg({
        aesthetic:
          'Radiosity render: early global illumination where colored surfaces tint their neighbors with soft, slightly blotchy bounced light.',
        color_and_tone:
          'Strong color bleeding from walls and floors onto nearby surfaces, soft pastel gradients.',
        lighting_and_shadow:
          'Diffuse bounce only, no speculars, soft corners darkened, slightly patchy light maps.',
        texture_and_material:
          'Matte untextured or lightly textured surfaces, gentle blotches in the illumination.',
        camera_and_composition: 'Interior views where colored walls sit close to other surfaces.',
        atmosphere_and_mood: 'Soft and quiet, light gently filling a simple room.',
        rendering_and_quality:
          'Diffuse-only early global illumination look with no glossy reflections anywhere.',
        key_features:
          'strong color bleeding; diffuse bounce only; matte surfaces; soft darkened corners; blotchy light maps',
      }),
      avoid: [...BASE, 'glossy reflections'],
      briefs: [
        'Radiosity render of a small throne room with a bright red carpet tinting the white walls and throne pink with bounced light, matte surfaces, soft corners. No text or logo.',
        'Radiosity render of a chapel where light through one yellow window floods the white vault with a warm glow, patchy light maps. No text or logo.',
        'Radiosity render of the inside of an orange tent glowing, the canvas color bleeding onto a sleeping bag and lantern. No text or logo.',
      ],
    },
    {
      name: 'Grey Clay Lighting Test',
      domain: 'global-illumination clay render',
      tags: ['clay-render', 'lighting-test', 'lookdev'],
      dna: cg({
        aesthetic:
          'Grey clay lighting test: a whole scene rendered with every material set to matte grey so only form, light and shadow remain.',
        color_and_tone:
          'Uniform mid-grey materials, neutral or slightly warm light, sky tint in shadows.',
        lighting_and_shadow:
          'Full global illumination with HDRI or sun; soft shadows and ambient occlusion in crevices.',
        texture_and_material:
          'No textures at all; geometry detail and silhouette carry everything.',
        camera_and_composition: 'Final shot framing, exactly as the finished scene would be seen.',
        atmosphere_and_mood: 'Calm and sculptural, the scene stripped back to pure form.',
        rendering_and_quality:
          'Clean GI clay render; distinct from a sculpting-app matcap viewport.',
        key_features:
          'all-grey matte materials; full global illumination; ambient occlusion in crevices; no textures; final shot framing',
      }),
      avoid: [...BASE, 'textures', 'color materials'],
      briefs: [
        'Grey clay lighting-test render of an adult warrior statue on a plinth in a courtyard, every surface matte grey, soft sun shadows and occlusion in the armor folds. No text or logo.',
        'Grey clay render of an entire medieval village on a hill under an overcast HDRI, rooftops and chimneys all in uniform grey. No text or logo.',
        'Grey clay render of a dragon perched on a crag at sunset, only form, light and long shadow. No text or logo.',
      ],
    },
    {
      name: 'Progressive Preview Noise Render',
      domain: 'unconverged path trace',
      tags: ['path-tracing', 'noise', 'preview'],
      dna: cg({
        aesthetic:
          'Progressive preview render: a path-traced image stopped early, still full of grain and bright fireflies before it converges.',
        color_and_tone: 'Correct colors under heavy speckle; shadows grainy and slightly colored.',
        lighting_and_shadow:
          'Realistic light with noisy soft shadows; caustics and small lights sparkling as fireflies.',
        texture_and_material:
          'Dense per-pixel noise, especially in dark areas and glossy reflections.',
        camera_and_composition: 'Final framing, the noise strongest in shadows and interiors.',
        atmosphere_and_mood: 'Anticipating and raw, an image caught in the middle of being born.',
        rendering_and_quality:
          'Unconverged path-trace grain; not film grain and not a denoised image.',
        key_features:
          'heavy sample noise; bright fireflies; grainy shadows; unconverged glossy reflections; correct underlying light',
      }),
      avoid: [...BASE, 'denoised smoothness', 'film grain'],
      briefs: [
        'Progressive preview path-trace of a dark cathedral interior still converging, heavy grain in the shadows, fireflies sparkling around the stained-glass light. No text or logo.',
        'Progressive preview render of a candle-lit crypt, noise crawling in the dark corners and on the stone coffins. No text or logo.',
        'Progressive preview render of a crystal chandelier, its caustics scattered as bright fireflies across the ceiling. No text or logo.',
      ],
    },
    {
      name: 'Gaussian Splat Capture',
      domain: '3D gaussian splatting',
      tags: ['gaussian-splat', 'capture', 'neural-rendering'],
      dna: cg({
        aesthetic:
          'Gaussian splat capture: a real place reconstructed from photos as millions of soft colored ellipsoids, photoreal from the capture angle and fuzzy at the edges.',
        color_and_tone:
          'Photographic color baked in from the capture, including captured highlights.',
        lighting_and_shadow: 'Lighting frozen from the original photos; no relighting.',
        texture_and_material:
          'Soft ellipsoid blobs at silhouettes, floaters hanging in the air, stretched splats where the capture was thin.',
        camera_and_composition:
          'Slightly off the original camera path, so edges and backgrounds reveal splat artifacts.',
        atmosphere_and_mood: 'Dreamlike and uncanny, reality dissolving into colored mist.',
        rendering_and_quality:
          'Real-time splat look with floaters; not a mesh and not a photograph.',
        key_features:
          'soft ellipsoid splats; floaters in the air; photoreal core; fuzzy silhouettes; baked captured lighting',
      }),
      avoid: [...BASE, 'clean polygon mesh'],
      briefs: [
        'Gaussian splat capture of an ancient oak in a meadow, photoreal bark at the center, the outer leaves dissolving into soft colored ellipsoids, floaters hanging in the sky. No text or logo.',
        'Gaussian splat capture of a moss-covered stone statue in a garden, stretched splats on the far side where the capture was thin. No text or logo.',
        "Gaussian splat capture of a cluttered alchemist's workshop, bottles photoreal up close and melting into fuzzy blobs in the corners. No text or logo.",
      ],
    },
    {
      name: 'Baked Lightmap Mobile Render',
      domain: 'mobile game baked lighting',
      tags: ['lightmap', 'mobile-game', 'low-poly'],
      dna: cg({
        aesthetic:
          'Baked lightmap mobile render: a low-poly game scene whose light and shadow are painted into textures in advance, with vertex colors and unlit fake glows.',
        color_and_tone:
          'Warm saturated vertex colors, soft baked shadows, glow cards around lamps.',
        lighting_and_shadow:
          'Static baked soft shadows and ambient occlusion; nothing moves with the light.',
        texture_and_material:
          'Low-poly shapes, low-res textures, blurry lightmap seams, simple alpha foliage cards.',
        camera_and_composition: 'Isometric or three-quarter game camera over a compact scene.',
        atmosphere_and_mood: 'Cozy and toy-like, a pocket world that runs anywhere.',
        rendering_and_quality: 'Mobile game render look; no real-time GI and no HUD.',
        key_features:
          'baked soft shadows; low-poly shapes; vertex color warmth; glow cards; lightmap seams',
      }),
      avoid: [...BASE, 'game HUD', 'real-time GI'],
      briefs: [
        'Baked-lightmap mobile game render of a low-poly fantasy tavern interior from an isometric camera, soft baked shadows under tables, glow cards around the hanging lamps, warm vertex colors. No HUD, text or logo.',
        'Baked-lightmap render of a low-poly castle courtyard with a well and banners without symbols, blurry lightmap seams on the walls. No HUD or text.',
        'Baked-lightmap render of a treasure room of low-poly gold piles and chests with a fake glow over the coins. No HUD or text.',
      ],
    },
    {
      name: 'Lookdev Reference Plate',
      domain: 'look development presentation',
      tags: ['lookdev', 'reference', 'vfx'],
      dna: cg({
        aesthetic:
          'Lookdev reference plate: a CG asset presented beside a chrome ball, a grey ball and a color chart, lit by a studio HDRI for material approval.',
        color_and_tone:
          'Neutral grey backdrop, accurate asset color, chart patches in calibrated colors.',
        lighting_and_shadow:
          'Neutral studio HDRI visible in the chrome ball, soft shadow on the grey ball.',
        texture_and_material:
          "The asset's materials shown in full detail next to the reference spheres.",
        camera_and_composition:
          'Asset centered, chrome and grey balls and a small color chart placed to one side.',
        atmosphere_and_mood: 'Technical and precise, an asset under careful review.',
        rendering_and_quality: 'VFX lookdev presentation; the color chart has no readable labels.',
        key_features:
          'chrome ball and grey ball; color chart; neutral studio HDRI; centered asset; material approval framing',
      }),
      avoid: [...BASE, 'readable chart labels'],
      briefs: [
        'Lookdev reference plate of a CG dragon-scale pauldron on a turntable, a chrome ball reflecting the studio HDRI, a grey ball and a small color chart beside it, neutral grey backdrop. No labels, text or logo.',
        'Lookdev reference plate of a CG goblin head with wet eyes and warty skin next to chrome and grey reference balls. No labels, text or logo.',
        'Lookdev reference plate of a CG runed longsword with pitted steel and a leather grip, color chart and reference spheres. No readable runes, labels or logo.',
      ],
    },
    {
      name: 'Live-Action Plate Integration',
      domain: 'CG composited into live action',
      tags: ['vfx-integration', 'compositing', 'plate'],
      dna: cg({
        aesthetic:
          'Live-action plate integration: a CG element composited into real photographed footage, matched in light direction, grain, lens blur and color.',
        color_and_tone:
          "The plate's real color grade applied to the CG element; matched black levels.",
        lighting_and_shadow:
          "CG lit from the plate's HDRI, casting contact shadows and bounce onto real ground.",
        texture_and_material:
          'Matched film grain, lens distortion and slight motion blur on the CG element.',
        camera_and_composition:
          'Handheld or tripod live-action framing, CG element interacting with real surfaces.',
        atmosphere_and_mood: 'Believable and startling, the impossible standing in a real place.',
        rendering_and_quality: 'Seamless VFX composite; no floating, unshadowed cutout look.',
        key_features:
          'CG in a real photographed plate; matched grain and lens; contact shadows on real ground; plate HDRI lighting; interaction',
      }),
      avoid: [...BASE, 'unshadowed cutout'],
      briefs: [
        'Live-action VFX frame of a CG dragon perched on a real tiled rooftop in a photographed town plate, its claws casting contact shadows on the tiles, matched grain and overcast light. No text or logo.',
        'Live-action VFX frame of a CG stone giant wading through a real misty forest plate, fog wrapping around its legs, handheld framing. No text or logo.',
        'Live-action VFX frame of a CG golem climbing out of a real quarry, dust kicked up onto the real rocks, matched lens blur. No text or logo.',
      ],
    },
    {
      name: 'Film-Emulated CG Beauty Render',
      domain: 'CG with film emulation',
      tags: ['film-emulation', 'beauty-pass', 'cgi'],
      dna: cg({
        aesthetic:
          'Film-emulated CG: a fully computer-generated shot graded to look photographed on 35 mm film, with grain, halation, gate weave and lens imperfections.',
        color_and_tone:
          'Film print color with soft rolloff, warm halation around highlights, slightly lifted blacks.',
        lighting_and_shadow: 'Naturalistic CG lighting softened by film response and bloom.',
        texture_and_material:
          'Fine organic grain over everything, slight chromatic aberration and vignette.',
        camera_and_composition:
          'Anamorphic or spherical cinema framing with realistic depth of field.',
        atmosphere_and_mood: 'Nostalgic and cinematic, digital worlds dressed as old celluloid.',
        rendering_and_quality: 'CG with film emulation baked in; no clean digital sharpness.',
        key_features:
          'CG graded as 35 mm film; organic grain; highlight halation; gate weave; lens vignette',
      }),
      avoid: [...BASE, 'clean digital sharpness'],
      briefs: [
        'Film-emulated CG render of an adult knight on horseback crossing a misty moor at dawn, grain and warm halation around the sun, slight gate weave. No text or logo.',
        'Film-emulated CG render of a wooden airship drifting over snowy mountains, anamorphic framing, lifted blacks and soft grain. No text or logo.',
        "Film-emulated CG render of a witch's cottage glowing at dusk in a birch wood, chromatic fringing on the windows, film vignette. No text or logo.",
      ],
    },
  ],
};

export default spec;
