import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'changing the geometry',
  'adding a new environment',
  'adding fog the preset does not own',
  'readable text',
  'logo',
];

// CGI light modifiers replace only the lighting setup; geometry, setting and camera stay.
const keep =
  'Keep the prompt subject, geometry, setting and camera unchanged; replace only the CGI lighting setup and its render behavior, without adding a new environment.';

function light(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? keep, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_03',
  category: '3. Lighting And Atmosphere',
  updates: {
    'SP03-031': {
      dna: light({
        aesthetic:
          'Global illumination lighting: light bouncing between surfaces so shadows fill softly and colors bleed from one surface to the next.',
        color_and_tone:
          'Natural gradients, warm or cool bounce tinting nearby surfaces, gentle contrast.',
        lighting_and_shadow:
          'One main source plus multiple indirect bounces; open soft shadows, darkening only in tight corners.',
        texture_and_material:
          'Materials read clearly in both lit and bounced areas; no crushed blacks.',
        camera_and_composition:
          'Keep the requested framing; interiors and enclosed spaces show the bounce best.',
        atmosphere_and_mood: 'Calm and natural, a space breathing with soft reflected light.',
        rendering_and_quality:
          'Fully converged multi-bounce render, never a flat constant ambient fill.',
        key_features:
          'multi-bounce indirect light; color bleeding; soft open shadows; darker tight corners; natural gradients',
      }),
      avoid: AVOID,
      briefs: [
        "CGI global illumination render of a narrow stone alchemist's cell lit by a single sunbeam through a slit window, the beam bouncing off a copper cauldron and tinting the walls warm orange, soft open shadows. No text or logo.",
        'CGI global illumination render of a white spiral staircase inside a lighthouse tower, sunlight bouncing down floor after floor. No text or logo.',
        'CGI global illumination render of a red-lacquered tea room, the crimson walls bleeding color onto the white paper lanterns and floor mats. No text or logo.',
      ],
    },
    'SP03-032': {
      dna: light({
        aesthetic:
          'Volumetric fog lighting: participating media fills the scene, so every light becomes a visible cone and depth fades into haze.',
        subject_treatment:
          'Keep the prompt subject, geometry, setting and camera; add a controlled volume of fog in which the existing lights become visible, without inventing new scenery.',
        color_and_tone:
          'Desaturated hazy distance, glowing light cones, darker foreground silhouettes.',
        lighting_and_shadow:
          'Spot and point lights carving visible cones; objects casting shadow beams through the fog.',
        texture_and_material: 'Density variation, drifting wisps and noise in the volume.',
        camera_and_composition: 'Keep the requested framing; layers of depth fading into the fog.',
        atmosphere_and_mood: 'Mysterious and deep, space measured by fading haze.',
        rendering_and_quality:
          'Clean volumetric scattering with smooth density, free of banding or blotches.',
        key_features:
          'visible light cones; atmospheric depth fade; shadow beams through fog; drifting wisps; silhouetted foreground',
      }),
      avoid: AVOID,
      briefs: [
        'CGI volumetric fog render of a ruined throne room where three torches become glowing cones in the haze, the empty throne casting a long shadow beam, depth fading to grey. No text or logo.',
        'CGI volumetric fog render of a forest path lit by a single lantern hanging from a branch, the light cone full of drifting wisps. No text or logo.',
        'CGI volumetric fog render of a shipyard at night, floodlights carving cones through the mist around a half-built hull. No text or logo.',
      ],
    },
    'SP03-034': {
      dna: light({
        aesthetic:
          'Three-point CGI lighting rig: a key, a fill and a back light placed around the subject for clean shape, separation and balanced exposure.',
        color_and_tone: 'Neutral balanced color, clean whites and a controlled, moderate contrast.',
        lighting_and_shadow:
          'Soft key 45 degrees to the side, dimmer fill opposite, bright back light outlining the edge.',
        texture_and_material:
          'Material detail clearly readable on the key side, separated from the background.',
        camera_and_composition:
          'Keep the requested framing; subject clearly separated from a darker backdrop.',
        atmosphere_and_mood: 'Clear and professional, the subject presented at its best.',
        rendering_and_quality: 'Clean studio lighting with no clutter in the light setup.',
        key_features:
          'key, fill and back light; 45-degree key; edge separation; balanced exposure; dark backdrop',
      }),
      avoid: [...AVOID, 'marble bust'],
      briefs: [
        'CGI render of a clockwork owl lit with a classic three-point rig: soft key from the left, dim fill from the right, a bright back light outlining its brass feathers against a dark backdrop. No text or logo.',
        "CGI three-point lit render of a leather-bound adventurer's satchel with buckles, clean separation from the background. No text or logo.",
        'CGI three-point lit render of a carved wooden chess rook, back light tracing its crenellations. No text or logo.',
      ],
    },
    'SP03-035': {
      dna: light({
        aesthetic:
          'HDRI environment lighting: a captured 360-degree environment lights the subject and appears in every reflection, so light and reflections match a real place.',
        subject_treatment:
          "Keep the prompt subject, geometry, setting and camera; light it with an environment map that fits the prompt's setting, visible mainly in reflections, not as a new backdrop.",
        color_and_tone:
          'Color and warmth taken from the environment — sunset gold, overcast grey or interior tungsten.',
        lighting_and_shadow:
          'Soft sky light plus a sun or window hotspot; shadows matching the environment.',
        texture_and_material:
          'Reflective surfaces mirroring the environment with recognizable windows or sky.',
        camera_and_composition:
          'Keep the requested framing; glossy surfaces placed to catch the reflections.',
        atmosphere_and_mood: 'Grounded and believable, the object truly belonging somewhere.',
        rendering_and_quality:
          'Image-based lighting with correct reflections; no mismatched studio look.',
        key_features:
          'image-based lighting; environment in reflections; matched sun hotspot; environment-derived color; grounded shadows',
      }),
      avoid: AVOID,
      briefs: [
        'CGI render of a polished steel war helmet lit by a sunset HDRI, the golden sky and a row of trees mirrored across its curved surface, matching warm shadow on the ground. No text or logo.',
        'CGI render of a glass-and-brass orrery lit by an overcast courtyard HDRI, soft grey light and window reflections. No text or logo.',
        'CGI render of a lacquered music box lit by a tungsten interior HDRI, lamp hotspots in its black lacquer. No text or logo.',
      ],
    },
    'SP03-037': {
      dna: light({
        aesthetic:
          'Ambient occlusion pass: a render where only contact darkness shows — corners, creases and touching surfaces darken while everything else stays near white.',
        color_and_tone: 'White and light grey with soft charcoal gradients in crevices; no color.',
        lighting_and_shadow:
          'Uniform sky with no direction; darkening where surfaces are close to each other.',
        texture_and_material:
          'All materials reduced to matte white; geometric detail read only through occlusion.',
        camera_and_composition:
          'Keep the requested framing; complex geometry shows the effect best.',
        atmosphere_and_mood: 'Quiet and sculptural, form revealed by where things touch.',
        rendering_and_quality: 'Clean AO pass without directional shadows or color.',
        key_features:
          'contact darkness only; white matte surfaces; soft crevice gradients; no light direction; geometry-driven shading',
      }),
      avoid: [...AVOID, 'directional shadows', 'color'],
      briefs: [
        'Ambient occlusion pass render of a tangled heap of chains, gears and a padlock, everything near white with soft charcoal darkness where the links touch. No text or logo.',
        'Ambient occlusion pass of a gothic stone tracery window, darkness pooling in every carved recess. No text or logo.',
        'Ambient occlusion pass of a bowl of stacked seashells, occlusion gathering inside each spiral. No text or logo.',
      ],
    },
    'SP03-038': {
      name: 'Rendered Rim Light Rig',
      dna: light({
        aesthetic:
          'Rendered rim light rig: CGI back lights placed behind the subject so a thin bright edge traces its silhouette against a dark background.',
        color_and_tone: 'Dark subject and background, bright white, gold or cyan edge line.',
        lighting_and_shadow:
          'Two strong back lights with barely any front fill; fresnel-bright edges.',
        texture_and_material:
          'Edges of fur, cloth, metal and hair catching the rim; front surfaces dim.',
        camera_and_composition:
          'Keep the requested framing; the silhouette against the darkest area.',
        atmosphere_and_mood: 'Dramatic and sleek, form drawn with a single line of light.',
        rendering_and_quality:
          'Clean CG rim with controlled bloom; the cinematic rim light lives in pack_02.',
        key_features:
          'thin bright silhouette edge; dark subject; twin back lights; fresnel edges; controlled bloom',
      }),
      avoid: AVOID,
      briefs: [
        'CGI rim-light render of a black cat with arched back on a dark plinth, twin back lights tracing a gold line along its fur and tail, front nearly black. No text or logo.',
        'CGI rim-light render of a crow with spread wings, cyan edge light on every feather tip. No text or logo.',
        'CGI rim-light render of a twisted iron candelabra, white rim lines along its curls against black. No text or logo.',
      ],
    },
    'SP03-041': {
      name: 'Rendered Volumetric Shafts',
      dna: light({
        aesthetic:
          'Rendered volumetric shafts: a strong light behind an occluder rendered through a participating medium, producing crisp beams with dust particles.',
        subject_treatment:
          'Keep the prompt subject, geometry, setting and camera; add only a light source behind an existing occluder and a thin medium so its beams become visible.',
        color_and_tone:
          'Warm or cool beams against darker surroundings, lifted haze in the shafts.',
        lighting_and_shadow:
          'Parallel or radiating shafts with sharp edges, subject cut by light and shadow bands.',
        texture_and_material: 'Dust particles, sparkling motes, slight noise in the medium.',
        camera_and_composition:
          'Keep the requested framing; beams crossing diagonally toward the subject.',
        atmosphere_and_mood: 'Sacred and dramatic, light made solid in the air.',
        rendering_and_quality:
          'Clean rendered volumes; the photographic and cinematic shafts live in pack_01 and pack_02.',
        key_features:
          'crisp rendered beams; occluder pattern; dust particles; diagonal shafts; lifted haze',
      }),
      avoid: AVOID,
      briefs: [
        'CGI render of a stone obelisk in a dim temple hall, crisp beams radiating from a high round opening behind it, dust particles sparkling in the shafts. No text or logo.',
        'CGI render of a treasure vault seen through a cracked door, a blade of light crossing piles of coins. No text or logo.',
        'CGI render of a sunken ship interior underwater, beams through broken hull planks. No text or logo.',
      ],
    },
    'SP03-042': {
      dna: light({
        aesthetic:
          'Diorama lighting: small warm lights and a soft key scaled to a miniature, with shallow macro depth of field that makes any scene read as a handmade model.',
        color_and_tone: 'Cozy saturated palette, warm practical dots, soft cool fill.',
        lighting_and_shadow:
          'Tiny point lights in windows and lamps, a soft overhead key, short soft shadows.',
        texture_and_material:
          'Surfaces read as painted model materials: flocked grass, resin water, plaster rock.',
        camera_and_composition: 'Keep the requested framing; macro focus falloff at the edges.',
        atmosphere_and_mood: 'Cozy and toy-like, a world you could hold in your hands.',
        rendering_and_quality:
          'Miniature lighting and macro depth; geometry itself stays as requested.',
        key_features:
          'miniature-scaled lights; macro depth falloff; cozy saturated palette; model-kit materials; tiny window glows',
      }),
      avoid: AVOID,
      briefs: [
        'CGI diorama-lit render of a harbor village at dusk, tiny warm lights in every window, resin-like water, macro depth of field blurring the edges. No text or logo.',
        'CGI diorama-lit render of a mountain monastery on a crag with flocked moss, a soft overhead key and warm lantern dots. No text or logo.',
        'CGI diorama-lit render of a snowy crossroads inn with a tiny glowing sign shape without letters and footprints in plaster snow. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Emissive Neon Geometry',
      domain: 'emissive-only CGI lighting',
      tags: ['emissive', 'neon', 'cgi-lighting'],
      dna: light({
        aesthetic:
          'Emissive-only lighting: the scene lit solely by glowing emissive shapes — tubes, panels and trims — with no other lights at all.',
        color_and_tone:
          'Saturated emissive colors on dark surfaces, colored reflections and bounce.',
        lighting_and_shadow:
          'Soft shadows from long light shapes, glossy floors reflecting each emitter.',
        texture_and_material:
          'Glossy and metallic surfaces picking up colored streaks from the emitters.',
        camera_and_composition: 'Keep the requested framing; emissive shapes visible in frame.',
        atmosphere_and_mood: 'Moody and electric, darkness drawn with glowing lines.',
        rendering_and_quality: 'Clean emissive GI with bloom; no readable signage.',
        key_features:
          'emissive shapes as only light; colored glossy reflections; soft long shadows; dark surfaces; bloom',
      }),
      avoid: AVOID,
      briefs: [
        'CGI render of a stone crypt lit only by violet and cyan emissive runes carved into the walls, colored reflections on the wet floor, soft shadows around a sarcophagus. No readable runes or logo.',
        'CGI render of a sleek motorcycle in a dark garage lit only by a ring of orange emissive tubes. No text or logo.',
        'CGI render of a crystal forest cave lit only by glowing pink crystals. No text or logo.',
      ],
    },
    {
      name: 'IES Profile Wall Wash',
      domain: 'photometric architectural lighting',
      tags: ['ies-profile', 'architectural-lighting', 'cgi-lighting'],
      dna: light({
        aesthetic:
          'IES profile wall wash: photometric light fixtures casting their characteristic scalloped and cone patterns onto walls, as in architectural visualization.',
        color_and_tone:
          'Warm 2700–3000 K fixture light on neutral walls, dark gaps between the pools.',
        lighting_and_shadow:
          'Repeating scalloped light shapes from downlights and uplights, crisp pool edges.',
        texture_and_material: 'Wall textures and stone revealed by grazing fixture light.',
        camera_and_composition:
          'Keep the requested framing; walls or columns receiving the light patterns.',
        atmosphere_and_mood: 'Elegant and calm, rhythm made of light.',
        rendering_and_quality:
          'Accurate photometric light distributions, with no readable labels on any fixture.',
        key_features:
          'scalloped light pools; repeating fixture rhythm; warm color temperature; grazing wall texture; crisp pool edges',
      }),
      avoid: AVOID,
      briefs: [
        'CGI render of a long castle gallery with a row of downlights casting identical scalloped light patterns on the stone wall between tapestries without figures, dark gaps between each pool. No text or logo.',
        'CGI render of a modern crypt corridor with uplights grazing rough stone columns. No text or logo.',
        'CGI render of a wine cellar vault with warm cone pools falling on the barrel ends. No text or logo.',
      ],
    },
    {
      name: 'Physical Sky Scattering',
      domain: 'physical atmosphere sky model',
      tags: ['physical-sky', 'atmospheric-scattering', 'cgi-lighting'],
      dna: light({
        aesthetic:
          'Physical sky scattering: a simulated atmosphere where sun angle sets the sky color through Rayleigh and Mie scattering, from deep blue noon to red dusk.',
        color_and_tone:
          'Sky gradients driven by sun height: blue overhead, orange-pink at the horizon, aerial perspective haze.',
        lighting_and_shadow:
          'Directional sun plus sky dome light; long colored shadows at low sun.',
        texture_and_material: 'Distant objects fading into blue haze; sun disk with a soft glow.',
        camera_and_composition:
          'Keep the requested framing; some sky or distance to show the scattering.',
        atmosphere_and_mood: 'Vast and airy, the whole atmosphere doing the lighting.',
        rendering_and_quality:
          'Physically based sky gradients rendered smoothly, without HDR banding or halos.',
        key_features:
          'sun-angle sky gradients; aerial perspective haze; directional sun with sky dome; colored long shadows; soft sun disk',
      }),
      avoid: AVOID,
      briefs: [
        'CGI render of a floating stone citadel lit by a physical sky at low sun, the sky grading from deep blue to orange at the horizon, distant islands fading into blue haze. No text or logo.',
        'CGI render of a desert obelisk at noon under a physical sky, deep blue overhead and pale near the horizon. No text or logo.',
        'CGI render of a windmill on a plain just after sunset, pink scattering band above the horizon. No text or logo.',
      ],
    },
    {
      name: 'Volumetric Cloud Silver Lining',
      domain: 'volumetric cloud lighting',
      tags: ['volumetric-clouds', 'silver-lining', 'cgi-lighting'],
      dna: light({
        aesthetic:
          'Volumetric cloud lighting: rendered clouds with dense cores and backlit edges glowing silver, casting moving shadows across the land.',
        subject_treatment:
          'Keep the prompt subject, geometry and camera; the sky above the existing setting becomes rendered volumetric clouds that shape the light.',
        color_and_tone: 'Dark blue-grey cloud cores, silver and gold edges, patchy sunlit ground.',
        lighting_and_shadow:
          'Sun behind clouds; bright silver linings, crepuscular gaps, cloud shadows on the ground.',
        texture_and_material: 'Billowing cumulus detail, wispy edges, sun breaking through holes.',
        camera_and_composition:
          'Keep the requested framing; a slice of sky and the shadowed ground.',
        atmosphere_and_mood: 'Dramatic and changing, weather deciding what is lit.',
        rendering_and_quality: 'High-detail volumetric clouds with fine wisps and no blocky noise.',
        key_features:
          'silver-lined cloud edges; dark cores; cloud shadows on the ground; sun through gaps; billowing detail',
      }),
      avoid: AVOID,
      briefs: [
        'CGI render of a hilltop stone circle under towering volumetric clouds, their edges glowing silver as the sun breaks through, cloud shadows racing across the moor. No text or logo.',
        'CGI render of a sailing ship on open sea beneath dark cloud cores with a single gap spilling light onto the waves. No text or logo.',
        'CGI render of a walled city on a plain with patchy sunlight from gaps in billowing cumulus. No text or logo.',
      ],
    },
    {
      name: 'Gobo Pattern Shadows',
      domain: 'gobo cookie lighting',
      tags: ['gobo', 'cookie', 'cgi-lighting'],
      dna: light({
        aesthetic:
          'Gobo pattern lighting: a spotlight through a cut-out cookie projecting shaped shadows — leaves, window bars, lattice — across the subject and set.',
        color_and_tone: 'Warm or cool spot color on a darker ambient, patterned light and shadow.',
        lighting_and_shadow:
          'Hard or softened pattern edges depending on focus, shapes wrapping over forms.',
        texture_and_material:
          'The projected pattern bends across every surface, revealing its curvature.',
        camera_and_composition:
          'Keep the requested framing; the pattern falling across the main subject.',
        atmosphere_and_mood:
          'Theatrical and intimate, the light telling a story of an unseen window.',
        rendering_and_quality:
          'Clean projected pattern without image content; distinct from projector imagery.',
        key_features:
          'cut-out pattern shadows; spotlight cookie; pattern wrapping forms; theatrical dark ambient; focusable edges',
      }),
      avoid: AVOID,
      briefs: [
        'CGI render of a sleeping dragon on a stone floor with a spotlight through a gothic window cookie projecting pointed-arch light shapes across its scales. No text or logo.',
        'CGI render of an armchair and side table with leaf-pattern light falling over them from an unseen tree. No text or logo.',
        'CGI render of a bronze bust with prison-bar stripes of light across its face. No text or logo.',
      ],
    },
    {
      name: 'RGB Colored Shadows',
      domain: 'additive colored light rig',
      tags: ['rgb-light', 'colored-shadows', 'cgi-lighting'],
      dna: light({
        aesthetic:
          'RGB colored shadows: three lights in red, green and blue from different directions, so white surfaces glow neutral while each shadow turns a vivid color.',
        color_and_tone:
          'White-lit areas neutral, shadows in cyan, magenta and yellow where one light is blocked.',
        lighting_and_shadow:
          'Three hard point lights; overlapping colored shadows fanning out behind objects.',
        texture_and_material: 'Matte white or pale surfaces show the colored shadows best.',
        camera_and_composition: 'Keep the requested framing; shadows falling on a floor or wall.',
        atmosphere_and_mood: 'Playful and scientific, color born from light itself.',
        rendering_and_quality: 'Accurate additive color mixing; not colored gels on a dark scene.',
        key_features:
          'red, green and blue lights; cyan-magenta-yellow shadows; white neutral lit areas; fanned shadows; additive mixing',
      }),
      avoid: AVOID,
      briefs: [
        'CGI render of a white porcelain chess set lit by red, green and blue point lights, each piece casting a fan of cyan, magenta and yellow shadows across the white board. No text or logo.',
        'CGI render of a white ballerina figurine on a stage floor with three colored shadows spreading behind her. No text or logo.',
        'CGI render of a white paper crane with rainbow-colored shadows overlapping on a wall. No text or logo.',
      ],
    },
    {
      name: 'Two-Tone Ramp Lighting',
      domain: 'banded ramp lighting',
      tags: ['ramp-lighting', 'npr', 'cgi-lighting'],
      dna: light({
        aesthetic:
          'Two-tone ramp lighting: realistic 3D forms lit through a stepped ramp, so light and shadow snap into two or three clean bands with a colored terminator.',
        color_and_tone: 'Lit band, shadow band and a thin saturated terminator line between them.',
        lighting_and_shadow: 'One key light; hard banded transitions instead of smooth gradients.',
        texture_and_material: 'Materials keep their color but lose soft shading.',
        camera_and_composition: 'Keep the requested framing; forms turned to show the band edges.',
        atmosphere_and_mood: 'Graphic and stylish, reality simplified into shapes of light.',
        rendering_and_quality: 'Crisp banded lighting on 3D forms; no outlines unless requested.',
        key_features:
          'two or three light bands; saturated terminator line; hard transitions; single key; graphic 3D forms',
      }),
      avoid: AVOID,
      briefs: [
        "CGI render of a knight's helmet lit through a two-tone ramp, light and shadow snapping into clean bands with a thin red terminator line between them. No text or logo.",
        'CGI render of a stack of books and an apple with banded light and a warm orange terminator. No readable titles or logo.',
        'CGI render of a sleeping fox with three flat light bands across its fur. No text or logo.',
      ],
    },
    {
      name: 'Overcast Dome Light',
      domain: 'overcast sky dome lighting',
      tags: ['overcast', 'dome-light', 'cgi-lighting'],
      dna: light({
        aesthetic:
          'Overcast dome lighting: a uniform white sky dome lighting everything from above with no sun, like a grey cloudy day.',
        color_and_tone: 'Soft neutral grey-white light, gentle saturation, low contrast.',
        lighting_and_shadow:
          'No directional shadows; soft darkening under objects and in recesses.',
        texture_and_material: 'Matte and glossy surfaces reflect a bright featureless sky.',
        camera_and_composition: 'Keep the requested framing; even detail across the whole frame.',
        atmosphere_and_mood: 'Quiet and melancholic, a calm grey day with nothing hidden.',
        rendering_and_quality: 'Even dome lighting; not the ambient occlusion pass look.',
        key_features:
          'uniform white sky dome; no directional shadows; soft contact darkening; low contrast; even detail',
      }),
      avoid: AVOID,
      briefs: [
        'CGI render of a rain-darkened stone bridge over a canal under overcast dome lighting, no shadows, soft darkening under the arches, a bright featureless sky mirrored in the water. No text or logo.',
        'CGI render of a wooden fishing boat pulled up on a pebble beach under a flat grey sky. No text or logo.',
        'CGI render of a moss-covered statue in a quiet garden, evenly lit with no sun. No text or logo.',
      ],
    },
    {
      name: 'Hard Noon Sun',
      domain: 'overhead noon sunlight',
      tags: ['noon-sun', 'hard-light', 'cgi-lighting'],
      dna: light({
        aesthetic:
          'Hard noon sun: a single tiny sun directly overhead, casting short black shadows straight down and bleaching the tops of every surface.',
        color_and_tone:
          'Bright bleached tops, deep blue sky, saturated but harsh colors, black undersides.',
        lighting_and_shadow:
          'Very short hard shadows pooled under objects; eye sockets and overhangs black.',
        texture_and_material:
          'Top surfaces blown bright, side textures crisp, heat shimmer in the distance.',
        camera_and_composition:
          'Keep the requested framing; the pooled shadows visible under objects.',
        atmosphere_and_mood: 'Harsh and still, heat pressing down from above.',
        rendering_and_quality:
          'Crisp single-source lighting with no fill light softening the shadows.',
        key_features:
          'sun directly overhead; short black pooled shadows; bleached tops; deep blue sky; no fill',
      }),
      avoid: AVOID,
      briefs: [
        'CGI render of a sun-bleached desert shrine under a hard noon sun, short black shadows pooled beneath its columns, deep blue sky, heat shimmer on the dunes. No text or logo.',
        'CGI render of a stone well in a village square at noon, a black disc of shadow under its roof. No text or logo.',
        'CGI render of a lone camel standing still at midday with its shadow pooled under its belly. No text or logo.',
      ],
    },
    {
      name: 'Stadium Floodlight Multi-Shadow',
      domain: 'multi-source floodlighting',
      tags: ['floodlights', 'multi-shadow', 'cgi-lighting'],
      dna: light({
        aesthetic:
          'Stadium floodlight lighting: four or more powerful lights from high corners, giving every object several crossed shadows radiating in different directions.',
        color_and_tone: 'Cool white light, deep night sky, slightly green-tinted grass or ground.',
        lighting_and_shadow:
          'Multiple hard shadows forming a star under each object, bright even ground.',
        texture_and_material: 'Sharp detail everywhere, faint glare halos around the lamps.',
        camera_and_composition:
          'Keep the requested framing; the star-shaped shadows visible on the ground.',
        atmosphere_and_mood: 'Charged and exposed, everything on display under the lights.',
        rendering_and_quality:
          'Crisp overlapping multi-source shadows with a slight glare around each lamp.',
        key_features:
          'several crossed shadows per object; high corner lights; cool white glare; bright even ground; night sky',
      }),
      avoid: AVOID,
      briefs: [
        'CGI render of an arena floor at night where a lone armored gladiator casts four crossed shadows in a star pattern under high floodlights, cool white glare halos in the dark sky. No text or logo.',
        'CGI render of a chess board laid on a floodlit field, each giant piece with radiating shadows. No text or logo.',
        'CGI render of a single oak tree in a floodlit courtyard, its shadow split into five. No text or logo.',
      ],
    },
    {
      name: 'Aurora Sky Light',
      domain: 'auroral ambient lighting',
      tags: ['aurora', 'night-light', 'cgi-lighting'],
      dna: light({
        aesthetic:
          'Aurora sky lighting: the night lit by curtains of green, violet and pink aurora, casting a soft shifting colored glow onto snow, water and faces.',
        color_and_tone:
          'Green and violet ambient light on snow, deep navy sky, pink fringes on the curtains.',
        lighting_and_shadow:
          'Very soft diffuse colored light from above, almost shadowless, reflections on water and ice.',
        texture_and_material:
          'Snow and ice picking up green sheen; stars visible between the curtains.',
        camera_and_composition:
          'Keep the requested framing; enough sky for the curtains when possible.',
        atmosphere_and_mood: 'Silent and otherworldly, the sky breathing colored light.',
        rendering_and_quality:
          'Clean, noise-free night render with smooth auroral gradients across the sky.',
        key_features:
          'green and violet aurora curtains; colored ambient on snow; nearly shadowless; stars; reflections on ice',
      }),
      avoid: AVOID,
      briefs: [
        'CGI render of a turf-roofed longhouse in deep snow lit by green and violet aurora curtains, the snow glowing green, stars between the ribbons, the frozen fjord reflecting the colors. No text or logo.',
        'CGI render of a frozen waterfall under a pink-fringed aurora, soft colored light on the ice. No text or logo.',
        'CGI render of a sled and dog team resting on a snowfield under a green sky. No text or logo.',
      ],
    },
    {
      name: 'Eclipse Corona Light',
      domain: 'total eclipse lighting',
      tags: ['eclipse', 'corona', 'cgi-lighting'],
      dna: light({
        aesthetic:
          'Total eclipse lighting: the sun hidden behind the moon, a white corona ring in a dark sky, and a strange dim 360-degree sunset glow along the horizon.',
        color_and_tone:
          'Deep indigo sky, white corona, orange-pink glow all around the horizon, desaturated land.',
        lighting_and_shadow: 'Very dim flat light, faint shadows, warm rim from the horizon glow.',
        texture_and_material: 'Surfaces muted and cool, highlights only toward the horizon.',
        camera_and_composition:
          'Keep the requested framing; include the corona or horizon glow when the sky is visible.',
        atmosphere_and_mood: 'Eerie and awe-struck, day turned wrong for a few minutes.',
        rendering_and_quality:
          'Clean low-light eclipse render with smooth gradients and no visible noise.',
        key_features:
          'black sun with white corona; indigo daytime sky; 360-degree horizon glow; dim flat light; eerie mood',
      }),
      avoid: AVOID,
      briefs: [
        'CGI render of a ring of standing stones during a total eclipse, a white corona burning around the black sun, orange-pink glow along the whole horizon, the stones dim and cool. No text or logo.',
        'CGI render of a watchtower on a hill during an eclipse, crows frozen in the indigo sky. No text or logo.',
        'CGI render of a harbor full of still boats under an eclipse, the horizon glowing like sunset in every direction. No text or logo.',
      ],
    },
  ],
};

export default spec;
