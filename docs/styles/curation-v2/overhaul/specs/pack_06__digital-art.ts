import type { Dna, Spec } from '../tools/apply';

// Mixed category. Review rule: a digital painting preset must not force a concept board or a 3D object render.
// Painting and 2D mark systems redraw the prompt as one finished picture.
const paint =
  "Redraw the prompt's subject, pose, setting and framing with this digital mark system as one finished picture; it never becomes a concept board, turnaround sheet or 3D object render.";
// Construction presets (low poly, voxel) own the geometry, not the subject.
const build =
  "Rebuild the prompt's subject and setting in this digital construction; the preset owns the geometry, while subject identity, action and palette intent stay as requested.";

function g(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? paint, ...rest } as Dna;
}

const AVOID = [
  'changing the requested subject',
  'concept board layout',
  'turnaround sheet',
  'game UI or HUD',
  'readable interface text',
];

// Guard for new presets, matching the inherited digital negatives of the category.
const DIGITAL_BASE = [
  'photo',
  'photorealistic',
  'generic AI gloss',
  'random AI smear',
  'muddy overpaint',
  'generic concept slop',
  ...AVOID,
];

const spec: Spec = {
  pack: 'pack_06',
  category: '4. Digital Art',
  updates: {
    'SP06-046': {
      dna: g({
        aesthetic:
          'Polished digital painting: a painted illustration built on layers with hard round and textured brushes, finished with a sharp focal area and softer, economical surroundings.',
        color_and_tone:
          'Rich RGB color organized in a clear value plan, warm key against cool shadow, saturated accents kept to the focal area.',
        lighting_and_shadow:
          'Motivated key light with painted bounce light and rim light; shadows grouped into large simple shapes, glow layers used sparingly.',
        texture_and_material:
          'Visible brush strokes and subtle canvas-texture brushes in the background, tighter blended rendering on faces and hero materials.',
        camera_and_composition:
          'Keep the requested framing; edges sharpen toward the focal point and soften or lose detail at the borders.',
        atmosphere_and_mood: 'Cinematic, vivid and clear, a finished story illustration.',
        rendering_and_quality:
          'Hard-to-soft edge hierarchy, controlled detail density and clean value grouping; no photo textures pasted in and no 3D render gloss.',
        key_features:
          'layered hard and textured digital brushwork; focal-area sharpening; warm key and cool shadow; painted rim and bounce light; economical surroundings',
      }),
      avoid: [...AVOID, '3D render look', 'photo texture overlay', 'airbrushed plastic skin'],
      briefs: [
        'Polished digital painting of an adult sorceress summoning a spiral of blue fire in a ruined throne room, warm torchlight against cool fire, crisp brushwork on her face and hands, loose textured strokes dissolving the broken pillars. No text or logo.',
        'Polished digital painting of a colossal moss-covered stone golem kneeling in a flooded forest, painted rim light on its shoulders, soft economical trees behind, clear value plan. No text or logo.',
        'Polished digital painting of a red-cloaked adult ranger crouched on a cliff above a burning village at night, warm glow on the cloak, cool blue shadow shapes, edges softening toward the corners. No text or logo.',
      ],
    },
    'SP06-047': {
      name: 'Block-In Speedpaint',
      dna: g({
        aesthetic:
          'Digital speedpaint: a scene blocked in within minutes using big flat brushes and lasso-filled shapes, left rough with only the focal area slightly refined.',
        color_and_tone:
          'Bold, simplified color zones with strong value contrast; three to five main values, one saturated accent.',
        lighting_and_shadow:
          'Dramatic single light, shapes of light and shadow blocked as flat masses, glow added with one soft brush pass.',
        texture_and_material:
          'Large visible flat strokes, hard lasso edges, a few textured brush dabs, overlapping scrubbed shapes.',
        camera_and_composition:
          'Keep the requested framing; silhouettes and value shapes read at thumbnail size, borders left unfinished.',
        atmosphere_and_mood: 'Raw, energetic and cinematic, a fast glimpse of an idea.',
        rendering_and_quality:
          'Rough shape-first finish with hard lasso cuts and broad strokes; no fine detail, no polish and no line art.',
        key_features:
          'big flat brush and lasso shapes; three to five values; unfinished borders; strong silhouette read; one saturated accent',
      }),
      avoid: [...AVOID, 'fine detail', 'polished rendering', 'clean line art'],
      briefs: [
        'Block-in speedpaint of a caravan of adult travelers crossing a white salt flat under a bruised purple sky, flat lasso-cut silhouettes, three big values, one hot orange lantern accent, unfinished edges. No text or logo.',
        'Block-in speedpaint of a moss-covered ancient library hall with shafts of light falling between towering shelves, broad flat strokes, a single soft glow pass. No text or logo.',
        'Block-in speedpaint of an armored adult knight on horseback against a burning sunset, bold silhouette, scrubbed flat shapes, rough borders. No text or logo.',
      ],
    },
    'SP06-048': {
      dna: g({
        subject_treatment:
          "Keep the prompt's subject and setting, and open the view into a wide establishing shot of vast scale; this preset owns that scale and depth, not a new subject.",
        aesthetic:
          'Digital matte painting: a painted and photo-integrated environment extension that makes a scene read as vast and real, as for a film establishing shot.',
        color_and_tone:
          'Naturalistic filmic color with strong aerial perspective: saturated near planes, hazy desaturated blue-grey far planes.',
        lighting_and_shadow:
          'One consistent sun or sky direction across every plane, matching shadow angles, volumetric haze between layers.',
        texture_and_material:
          'Photographic surface detail in the foreground blended seamlessly with painted mid and far planes, no visible seams.',
        camera_and_composition:
          'Wide establishing view with tiny figures or structures to prove scale; foreground, midground and background layers clearly stacked.',
        atmosphere_and_mood: 'Epic, awe-inspiring and still, a world that feels enormous.',
        rendering_and_quality:
          'Seamless blend of painted and photographic detail, consistent perspective and light; no collage seams and no cartoon shapes.',
        key_features:
          'wide establishing shot; tiny scale figures; seamless photo and paint blend; aerial perspective haze; stacked depth planes',
      }),
      avoid: [...AVOID, 'visible collage seams', 'close-up framing', 'mismatched light directions'],
      briefs: [
        'Digital matte painting of a vast cliff city carved into a canyon wall with waterfalls pouring between its terraces, tiny adult figures crossing a rope bridge, blue haze in the far canyon, one consistent afternoon sun. No text or logo.',
        'Digital matte painting of a colossal fallen statue half-buried in desert dunes, a line of tiny travelers at its hand, seamless painted and photographic sand. No text or logo.',
        'Digital matte painting of a frozen harbor with ice-locked warships beneath a green aurora, stacked depth planes fading into haze. No text or logo.',
      ],
    },
    'SP06-049': {
      dna: g({
        aesthetic:
          'Flat vector illustration: clean Bezier shapes filled with solid colors, built from simple geometric primitives with perfectly smooth curves.',
        color_and_tone:
          'Limited flat palette of five to eight colors, harmonious and saturated, with shadow shapes as darker flat tints.',
        lighting_and_shadow:
          'Flat shading only: one hard-edged shadow shape and one highlight shape per form, no gradients.',
        texture_and_material:
          'No texture at all; pure flat fills, crisp mathematically smooth edges, consistent corner radii.',
        camera_and_composition:
          'Keep the requested framing; forms simplified into bold geometric silhouettes with generous negative space.',
        atmosphere_and_mood: 'Clean, friendly and orderly, a modern editorial clarity.',
        rendering_and_quality:
          'Razor-sharp vector edges, flat fills, no brush marks and no noise; no logos or brand marks.',
        key_features:
          'smooth Bezier shapes; flat solid fills; limited five-to-eight color palette; one flat shadow per form; geometric simplification',
      }),
      avoid: [...AVOID, 'gradients', 'brush texture', 'grain'],
      briefs: [
        "Flat vector illustration of a wizard's tower on a floating rock among geometric clouds, smooth Bezier curves, six flat colors, one hard shadow shape on each side of the tower. No text or logo.",
        'Flat vector illustration of a bear sleeping in a den under snowy tree roots, flat navy and cream fills, consistent rounded corners, generous negative space. No text or logo.',
        'Flat vector illustration of a steaming bowl of noodles with chopsticks seen from above, geometric simplification, crisp flat shadows. No text or logo.',
      ],
    },
    'SP06-050': {
      dna: g({
        aesthetic:
          '16-bit pixel art: a scene drawn pixel by pixel on a low-resolution grid with a limited palette, hand-placed anti-aliasing and dithered transitions.',
        color_and_tone:
          'Restricted palette of about 32 to 64 colors, hue-shifted ramps from cool shadows to warm highlights, no gradients beyond ramps and dither.',
        lighting_and_shadow:
          'Clear top-left light with two or three shading steps per material; checkerboard dither for soft transitions.',
        texture_and_material:
          'Crisp square pixels on a visible grid, clean one-pixel outlines, no blurred scaling, no sub-pixel smoothing.',
        camera_and_composition:
          'Keep the requested framing as a single scene or side-view game screen, but with no interface, health bars, menus or icons.',
        atmosphere_and_mood: 'Nostalgic, crafted and adventurous, a console-era world.',
        rendering_and_quality:
          'Every edge snapped to the pixel grid, deliberate clusters without orphan pixels, hue-shifted ramps; no UI and no readable text.',
        key_features:
          'hand-placed pixels on a grid; 32 to 64 color palette; hue-shifted shading ramps; checkerboard dither; no interface elements',
      }),
      avoid: [...AVOID, 'icons or inventory grids', 'blurry upscaling', 'smooth gradients'],
      briefs: [
        '16-bit pixel art scene of a hooded adult rogue creeping along castle battlements at night, side view, hue-shifted blue ramps on the stone, checkerboard dither in the moonlit clouds, no interface elements. No text or logo.',
        '16-bit pixel art scene of a haunted swamp with glowing will-o-wisps above twisted roots, limited palette, crisp one-pixel outlines, no UI. No text or logo.',
        '16-bit pixel art scene of a busy blacksmith forge interior with sparks flying from the anvil, warm hue-shifted ramps, hand-placed anti-aliasing, no UI. No text or logo.',
      ],
    },
    'SP06-051': {
      name: 'Flat-Shaded Low Poly',
      dna: g({
        subject_treatment: build,
        aesthetic:
          'Flat-shaded low poly: subjects and scenes built from a small number of large triangles, each facet one flat color, rendered like a simple real-time game scene.',
        color_and_tone:
          'Soft pastel or bright saturated palettes with each facet a single tone; value shifts only from facet orientation to the light.',
        lighting_and_shadow:
          'One directional sun with flat per-facet shading, simple soft ambient occlusion, crisp faceted shadow shapes.',
        texture_and_material:
          'No textures; clean hard polygon edges, visible triangle structure, matte surfaces.',
        camera_and_composition:
          'Keep the requested framing; forms simplified to a few hundred faces with clear silhouettes.',
        atmosphere_and_mood: 'Calm, toy-like and tidy, a minimal game world.',
        rendering_and_quality:
          'Uniform flat facets with hard edges and simple lighting; no smooth shading, no high-poly detail, no photo textures.',
        key_features:
          'large flat-shaded triangles; one color per facet; hard polygon edges; single directional sun; minimal geometry',
      }),
      avoid: [...AVOID, 'smooth shading', 'high-poly detail', 'photo textures'],
      briefs: [
        'Flat-shaded low poly scene of a humpback whale breaching out of a triangulated teal sea, each facet one flat tone, spray as a few white triangles, single low sun. No text or logo.',
        'Flat-shaded low poly scene of a camp of tents around a glowing campfire under faceted pine trees at dusk, orange facets on the tents, crisp faceted shadows. No text or logo.',
        'Flat-shaded low poly scene of a longship with a striped sail gliding up a fjord, matte facets, cliffs made of a few large triangles. No text or logo.',
      ],
    },
    'SP06-052': {
      name: 'Voxel Cube Build',
      dna: g({
        subject_treatment: build,
        aesthetic:
          'Voxel construction: every subject and surface built from equal-sized cubes on a 3D grid, like a hand-placed digital diorama.',
        color_and_tone:
          'Saturated cheerful palette with one flat color per cube, small color variations cube to cube for texture.',
        lighting_and_shadow:
          'Soft global light with ambient occlusion in the corners between cubes, crisp cube-edge shadows.',
        texture_and_material:
          'Clean matte cube faces, stepped edges on every curve, visible grid rhythm, no smoothing.',
        camera_and_composition:
          'Keep the requested framing; subjects often sit on a cut-out diorama base floating in space.',
        atmosphere_and_mood: 'Playful, cozy and crafted, a tiny buildable world.',
        rendering_and_quality:
          'Consistent cube size everywhere, stepped silhouettes, soft occlusion; no smooth meshes and no branded block-game look.',
        key_features:
          'equal-sized cubes on a 3D grid; stepped silhouettes; one color per cube with variation; ambient occlusion between cubes; diorama base',
      }),
      avoid: [...AVOID, 'smooth meshes', 'branded block-game textures', 'mixed cube sizes'],
      briefs: [
        'Voxel cube build of a floating island with a windmill and a waterfall pouring off its edge, equal-sized cubes everywhere, stepped water, soft ambient occlusion, cut-out diorama base. No text or logo.',
        'Voxel cube build of a cozy bakery interior with cube loaves on shelves and an adult baker at a stone oven, warm occluded corners. No text or logo.',
        'Voxel cube build of a sea serpent coiling out of a cube-stepped ocean, green and turquoise cubes with small color variations. No text or logo.',
      ],
    },
    'SP06-053': {
      dna: g({
        aesthetic:
          'Concept art keyframe: one painted production illustration that sells the mood and design of a world moment, with clear focal hierarchy and painted-over photo textures.',
        color_and_tone:
          'Mood-driven limited palette, one dominant temperature with a contrasting accent at the focal point; values grouped for instant read.',
        lighting_and_shadow:
          'Strong dramatic lighting design such as god rays, backlight or firelight guiding the eye to the focal point.',
        texture_and_material:
          'Loose painted surfaces with photobashed texture detail painted over, crisp design detail only where it matters.',
        camera_and_composition:
          'Keep the requested subject in a single cinematic keyframe with clear foreground, midground and background; never a sheet of multiple views.',
        atmosphere_and_mood: 'Moody and evocative, the story of a whole world in one frame.',
        rendering_and_quality:
          'Detail concentrated at the focal point, loose elsewhere, paint over photo texture; no multi-panel board, no callouts, no text.',
        key_features:
          'single cinematic keyframe; focal hierarchy; painted-over photo texture; dramatic lighting design; mood-driven limited palette',
      }),
      avoid: [
        ...AVOID,
        'multiple views on one sheet',
        'callout annotations',
        'orthographic turnaround',
      ],
      briefs: [
        'Concept art keyframe of an adult warrior queen walking into a ruined colossal cathedral, god rays falling on her through the broken roof, focal detail on her armor, loose painted-over ruins. No text or logo.',
        'Concept art keyframe of a titanic tree-city lit by thousands of lanterns at dusk, warm accent against cool blue mist, clear depth layers. No text or logo.',
        'Concept art keyframe of an adult explorer facing a huge beast in a glowing crystal cave, backlit silhouette, detail only at the meeting point. No text or logo.',
      ],
    },
    'SP06-054': {
      dna: g({
        subject_treatment:
          "Keep the prompt's subject and setting but show them in true isometric projection; this preset owns the camera angle and the tidy diorama cut-out, not the content.",
        aesthetic:
          'Isometric digital illustration: scenes drawn in parallel projection with 30-degree axes and no vanishing point, like a detailed miniature diorama.',
        color_and_tone:
          'Bright clean palette with three consistent face tones per object: top light, left mid, right dark.',
        lighting_and_shadow:
          'Fixed light from the upper left, consistent face shading on every block, short soft cast shadows.',
        texture_and_material:
          'Smooth clean surfaces with small crisp details such as windows, crates and plants, no heavy texture.',
        camera_and_composition:
          'True isometric parallel projection, all verticals vertical, the scene cut out as a square or hexagonal block on a plain background.',
        atmosphere_and_mood: 'Orderly, charming and toy-like, a whole world you could hold.',
        rendering_and_quality:
          'Strict parallel lines, consistent 30-degree angles, three-tone face shading; no perspective convergence, no UI.',
        key_features:
          'parallel 30-degree projection; no vanishing point; three-tone face shading; diorama cut-out block; small crisp details',
      }),
      avoid: [...AVOID, 'perspective convergence', 'fisheye', 'map labels'],
      briefs: [
        "Isometric illustration of an alchemist's tower cut away to show stacked rooms of bubbling flasks, bookshelves and a rooftop telescope, strict 30-degree parallel lines, three-tone face shading, square diorama base. No text or logo.",
        'Isometric illustration of a tiny island tavern with wooden docks and moored rowboats, consistent upper-left light, crisp small details. No text or logo.',
        'Isometric illustration of a dwarven mine cut into a hillside with carts on tracks and glowing crystal veins, hexagonal diorama cut-out. No text or logo.',
      ],
    },
    'SP06-055': {
      dna: g({
        aesthetic:
          'Glitch art: an image corrupted digitally, with RGB channels split apart, rows of pixels displaced sideways and blocks of compression artifacts breaking the picture.',
        color_and_tone:
          'Original image colors with red, green and blue channel offsets, electric cyan and magenta fringes, occasional flat digital color bars.',
        lighting_and_shadow:
          'The underlying light stays, but is sliced by horizontal tears and blocky smears.',
        texture_and_material:
          'Horizontal line displacement, 8x8 compression blocks, pixel sorting streaks, scanline dropouts, datamosh smears.',
        camera_and_composition:
          'Keep the requested framing; the subject stays recognizable under the corruption.',
        atmosphere_and_mood: 'Unstable, electric and uneasy, a signal about to fail.',
        rendering_and_quality:
          'Crisp digital artifacts with deliberate placement, subject readable through them; no analog film grain and no painterly brushwork.',
        key_features:
          'RGB channel split; horizontal pixel displacement; compression block artifacts; pixel sorting streaks; recognizable subject under corruption',
      }),
      avoid: [...AVOID, 'analog film grain', 'painterly brushwork', 'unrecognizable abstraction'],
      dropAvoid: ['noise'],
      briefs: [
        'Glitch art image of a galloping horse torn into horizontal slices shifted sideways, red and cyan channels split along its mane, 8x8 compression blocks in the dust, the horse still readable. No text or logo.',
        'Glitch art image of a burning candelabra in a dark stone hall, the flames smeared into datamosh trails, pixel sorting streaks running down. No text or logo.',
        'Glitch art image of an adult dancer mid-leap, her trailing arm dissolving into blocky pixel smears and magenta fringes. No text or logo.',
      ],
    },
    'SP06-056': {
      dna: g({
        aesthetic:
          'Synthwave digital art: an eighties retro-future look with glowing neon outlines, a striped setting sun and a perspective grid receding to the horizon.',
        color_and_tone:
          'Deep purple and indigo night fading to hot pink and orange at the horizon, cyan and magenta neon lines, chrome highlights.',
        lighting_and_shadow:
          'Backlit silhouettes against the sunset, neon edge glow and bloom, deep dark foregrounds.',
        texture_and_material:
          'Glowing laser lines, faint CRT scanlines, chrome gradients, soft star field.',
        camera_and_composition:
          'Keep the requested subject, set against a low horizon with a one-point perspective grid when the setting allows.',
        atmosphere_and_mood: 'Nostalgic, nocturnal and cool, a dream of a neon future.',
        rendering_and_quality:
          'Clean glowing vector-like neon, smooth gradients, crisp silhouettes; no cars, roads or sunsets unless the prompt asks.',
        key_features:
          'purple-to-pink retro gradient; neon cyan and magenta lines; striped sun; perspective grid horizon; chrome highlights',
      }),
      avoid: [...AVOID, 'daylight', 'muted earth palette', 'realistic textures'],
      briefs: [
        "Synthwave digital art of a knight's sword planted in a glowing magenta perspective grid under a huge striped sun, chrome blade reflecting pink and cyan neon, faint scanlines. No text or logo.",
        'Synthwave digital art of a pyramid rising out of a purple wireframe desert, cyan neon edges and a star field above. No text or logo.',
        'Synthwave digital art of an adult saxophonist silhouetted on a rooftop against a striped orange sun, neon rim glow. No text or logo.',
      ],
    },
    'SP06-057': {
      name: 'Silhouette Double Exposure',
      dna: g({
        subject_treatment:
          "Keep the prompt's main subject as the outer silhouette and fill it with a second image drawn from the prompt's setting or theme; this preset owns that nested layout.",
        aesthetic:
          'Silhouette double exposure: a clean subject silhouette used as a mask, filled with a second scene that blends softly into a pale background.',
        color_and_tone:
          'Mostly muted or monochrome with one tinted inner scene; a light, near-white background around the silhouette.',
        lighting_and_shadow:
          'The inner scene keeps its own light; the silhouette edge fades softly into white where the two images meet.',
        texture_and_material:
          'Smooth photographic blending, soft feathered mask edges, fine details of the inner scene following the silhouette contour.',
        camera_and_composition:
          'Centered silhouette, often in profile, the inner scene arranged so its horizon or key shape lines up with features of the outline.',
        atmosphere_and_mood: 'Poetic, reflective and dreamlike, two worlds inside one form.',
        rendering_and_quality:
          'Clean mask edge with soft internal fades; no hard collage cut lines and no cluttered background.',
        key_features:
          'subject silhouette as a mask; second scene inside; soft feathered fade to white; aligned inner horizon; muted tinted palette',
      }),
      avoid: [
        ...AVOID,
        'hard collage edges',
        'busy background',
        'two unrelated scenes side by side',
      ],
      briefs: [
        "Silhouette double exposure of a wolf's head in profile filled with a snowy pine forest under a full moon, the treeline aligned with its jaw, feathered fade into white. No text or logo.",
        "Silhouette double exposure of an adult woman's profile filled with a murmuration of starlings over rooftops at dusk, muted blue palette, soft fade at the edges. No text or logo.",
        'Silhouette double exposure of a stag filled with autumn mountains and a winding river, the river flowing along its neck, pale background. No text or logo.',
      ],
    },
    'SP06-058': {
      dna: g({
        aesthetic:
          '2D polygon art: a flat image divided into a mesh of triangles, each filled with the average color of that area, like a faceted mosaic.',
        color_and_tone:
          'Rich natural colors sampled into triangles, with small gradients or flat fills per facet; denser triangles at the focal area.',
        lighting_and_shadow:
          'Light and shadow come only from the colors of neighbouring triangles, creating a crystalline shimmer.',
        texture_and_material:
          'Sharp triangle edges, faint lighter seams between facets, flat 2D surface with no 3D depth.',
        camera_and_composition:
          'Keep the requested framing; triangle size shrinks at eyes and edges and grows in empty background.',
        atmosphere_and_mood: 'Crystalline, modern and graphic, a gem-cut picture.',
        rendering_and_quality:
          'Clean triangulation with adaptive density, subject recognizable through the facets; no 3D render and no noise.',
        key_features:
          '2D triangle mesh; averaged color per facet; adaptive triangle density; faint facet seams; crystalline shimmer',
      }),
      avoid: [...AVOID, '3D mesh render', 'uniform triangle size', 'smooth shading'],
      briefs: [
        "2D polygon art of a lion's head facing forward, tiny triangles around the eyes and mane edges, large facets in the background, averaged gold and umber colors, crystalline shimmer. No text or logo.",
        '2D polygon art of a koi fish turning in dark water, orange and white facets with faint seams, adaptive density along the fins. No text or logo.',
        '2D polygon art of a charging rhinoceros in dust, grey and ochre triangles, large flat facets in the sky. No text or logo.',
      ],
    },
    'SP06-059': {
      dna: g({
        aesthetic:
          'Digital layered paper cutout: scenes built from stacked flat paper shapes with soft drop shadows between layers, as if cut and arranged in a shallow box.',
        color_and_tone:
          'Solid flat paper colors in harmonious families, often light to dark from front to back or the reverse.',
        lighting_and_shadow:
          'Soft drop shadows cast by each layer onto the one behind, suggesting a few millimeters of depth.',
        texture_and_material:
          'Fine paper fiber grain on every shape, slightly irregular cut edges, no gradients inside shapes.',
        camera_and_composition:
          'Keep the requested framing; scene organized into five to eight overlapping depth layers.',
        atmosphere_and_mood: 'Gentle, crafted and storybook-like, a tidy paper theater.',
        rendering_and_quality:
          'Flat shapes with subtle paper texture and soft layer shadows; no glossy 3D, no outlines.',
        key_features:
          'stacked flat paper layers; soft layer drop shadows; paper fiber grain; five to eight depth planes; clean cut edges',
      }),
      avoid: [...AVOID, 'glossy 3D surfaces', 'outlines', 'gradients inside shapes'],
      briefs: [
        'Digital layered paper cutout of an underwater coral reef with shoals of paper fish, seven stacked depth layers from pale aqua to deep navy, soft drop shadows between them, paper fiber grain. No text or logo.',
        'Digital layered paper cutout of a haunted forest of bare paper trees around a small cottage with a lit window, dark layers in front, pale moon behind. No text or logo.',
        'Digital layered paper cutout of a striped circus tent at night under layered paper stars, clean cut edges, soft shadows. No text or logo.',
      ],
    },
    'SP06-060': {
      name: 'Terminal Glyph Art',
      dna: g({
        aesthetic:
          'Terminal glyph art: an image made entirely of monospaced characters on a fixed grid, with denser glyphs for dark or bright areas depending on the screen.',
        color_and_tone:
          'Phosphor green or amber glyphs on black, a few brightness levels only; optional single-color variant.',
        lighting_and_shadow:
          'Values come from glyph density and weight; the brightest areas use heavy characters, the darkest are empty cells.',
        texture_and_material:
          'Strict character grid, soft phosphor glow around glyphs, faint scanlines, no individual pixels outside characters.',
        camera_and_composition:
          'Keep the requested framing at low resolution; the subject silhouette must stay readable from a distance.',
        atmosphere_and_mood: 'Retro, hacker-like and mysterious, an image hidden in code.',
        rendering_and_quality:
          'Every mark a glyph cell on a regular grid, no readable words or sentences; shape emerges from density.',
        key_features:
          'monospaced glyph grid; density-based values; phosphor green or amber on black; soft glow and scanlines; no readable words',
      }),
      avoid: [...AVOID, 'readable words', 'pixel art', 'smooth photographic shading'],
      briefs: [
        'Terminal glyph art of a hooded figure face in shadow, built from dense green monospaced characters on black, the eyes as two bright heavy glyph clusters, soft phosphor glow and scanlines. No readable words or logo.',
        'Terminal glyph art of a spiral galaxy, glyph density swirling into a bright core, amber on black. No readable words or logo.',
        'Terminal glyph art of a steaming coffee cup, the steam in light sparse characters, the cup in dense ones, green phosphor glow. No readable words or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Flow-Field Generative Lines',
      domain: 'algorithmic flow-field line drawing',
      tags: ['generative', 'flow-field', 'algorithmic'],
      dna: g({
        aesthetic:
          'Generative flow-field art: thousands of thin lines traced by code through an invisible vector field, their density and direction revealing the subject.',
        color_and_tone:
          'One to three line colors on a plain ground, such as ink black on cream or neon gradients on black; tone from line density.',
        lighting_and_shadow:
          'Values created by line crowding; bright areas left open, dark areas packed with lines.',
        texture_and_material:
          'Hair-thin smooth curving lines that never cross, flowing like combed hair, crisp digital or plotted ink look.',
        camera_and_composition:
          'Keep the requested framing; lines follow the contours and gestures of the subject.',
        atmosphere_and_mood: 'Hypnotic, calm and mathematical, motion frozen in lines.',
        rendering_and_quality:
          'Clean anti-aliased curves with consistent width, density modulation only; no brush strokes, no fills.',
        key_features:
          'thousands of flowing non-crossing lines; density-based tone; subject revealed by field direction; plain ground; consistent thin width',
      }),
      avoid: [...DIGITAL_BASE, 'brush strokes', 'solid fills', 'random scribbles'],
      briefs: [
        "Generative flow-field art of an adult woman's face drawn by thousands of curving black lines on cream, the lines crowding into her hair and eye sockets, open space on her cheekbones. No text or logo.",
        'Generative flow-field art of wind streaming over a mountain ridge, lines combing over the peak and curling in eddies behind it, neon blue on black. No text or logo.',
        'Generative flow-field art of a raven in flight, its wings formed where the field lines crowd and turn, two ink colors. No text or logo.',
      ],
    },
    {
      name: 'Pen-Plotter Hatch Drawing',
      domain: 'machine-drawn vector hatching',
      tags: ['pen-plotter', 'hatching', 'algorithmic'],
      dna: g({
        aesthetic:
          'Pen-plotter drawing: vector paths drawn on paper by a machine holding a real pen, with tone from perfectly regular computed hatch and contour-line fills.',
        color_and_tone:
          'One or two fineliner colors on white or colored paper, tone from hatch spacing and angle.',
        lighting_and_shadow:
          'Shading as layered straight or contour-following hatches, spacing tightening into shadow.',
        texture_and_material:
          'Real ink line on paper with tiny pen-start blobs, perfectly parallel machine lines, slight paper bleed.',
        camera_and_composition:
          'Keep the requested framing; the subject drawn in outline with computed hatch regions.',
        atmosphere_and_mood: 'Precise, meditative and technical, a machine with a steady hand.',
        rendering_and_quality:
          'Mechanically regular line spacing with real ink behavior; no hand wobble, no filled solids, no gradients.',
        key_features:
          'machine-regular hatching; contour-line fills; real fineliner ink on paper; pen-start dots; one or two pen colors',
      }),
      avoid: [...DIGITAL_BASE, 'hand-drawn wobble', 'solid black fills', 'gradients'],
      briefs: [
        'Pen-plotter drawing of a chess knight piece, its curves filled with perfectly parallel machine hatching at two angles, tiny pen-start dots, black fineliner on white paper. No text or logo.',
        'Pen-plotter drawing of a mountain island described by concentric contour lines, tighter spacing on the steep slopes, blue pen on cream. No text or logo.',
        'Pen-plotter drawing of a spiral staircase seen from above, each step hatched at a rotating angle, red and black pens. No text or logo.',
      ],
    },
    {
      name: 'Layered Gradient Silhouette',
      domain: 'minimal layered gradient landscape',
      tags: ['gradient', 'silhouette', 'minimal'],
      dna: g({
        aesthetic:
          'Layered gradient silhouette illustration: a scene reduced to overlapping flat silhouette bands, each filled with a smooth vertical gradient that lightens with distance.',
        color_and_tone:
          'Analogous palettes such as peach to violet or teal to navy, near layers darkest, far layers palest, a glowing sky gradient.',
        lighting_and_shadow:
          'Backlight from the sky; atmospheric haze between layers creates depth, no modeled forms.',
        texture_and_material:
          'Smooth digital gradients, crisp silhouette edges, optional faint grain, no interior detail.',
        camera_and_composition:
          'Keep the requested subject as a silhouette on one of five to seven receding layers.',
        atmosphere_and_mood: 'Serene, spacious and quiet, a calm moment of distance.',
        rendering_and_quality:
          'Clean flat silhouettes with smooth gradient fills and haze between; no textures, no outlines.',
        key_features:
          'receding silhouette layers; smooth vertical gradients; darker near and paler far; analogous palette; no interior detail',
      }),
      avoid: [...DIGITAL_BASE, 'interior detail', 'outlines', 'busy textures'],
      briefs: [
        'Layered gradient silhouette of a misty mountain range at dawn with a lone eagle circling, six receding bands from deep plum to pale peach, smooth gradients, haze between the ridges. No text or logo.',
        'Layered gradient silhouette of a jungle canopy at dusk with a stepped temple rising above it, teal to navy bands. No text or logo.',
        'Layered gradient silhouette of desert dunes under two moons, analogous orange and violet gradients, crisp dune edges. No text or logo.',
      ],
    },
    {
      name: 'Mirror-Tool Kaleidoscope',
      domain: 'radial symmetry digital drawing',
      tags: ['kaleidoscope', 'symmetry', 'mandala'],
      dna: g({
        aesthetic:
          'Kaleidoscope symmetry art: the subject drawn once in one wedge and mirrored six or eight times around a center, forming a radial mandala.',
        color_and_tone:
          'Jewel colors, emerald, sapphire, ruby and gold, on dark or light ground; repeating color rhythm around the circle.',
        lighting_and_shadow: 'Simple even lighting per wedge, a luminous glow toward the center.',
        texture_and_material:
          'Crisp mirrored seams, fine repeating ornament, smooth digital brush fills.',
        camera_and_composition:
          'The prompt subject repeated radially around a central point, filling a circle or the full square.',
        atmosphere_and_mood: 'Hypnotic, ornate and meditative, a spinning jewel.',
        rendering_and_quality:
          'Perfect mirror seams and radial repetition with the subject still recognizable in each wedge; no random asymmetry.',
        key_features:
          'radial mirror symmetry; six or eight repeating wedges; jewel color rhythm; central glow; recognizable repeated subject',
      }),
      avoid: [...DIGITAL_BASE, 'asymmetry', 'misaligned seams', 'single unrepeated subject'],
      briefs: [
        'Kaleidoscope symmetry art of a dragonfly mirrored eight times into a glowing mandala, emerald and sapphire wings meeting at a golden center, crisp mirror seams, dark ground. No text or logo.',
        'Kaleidoscope symmetry art of an adult masked dancer mirrored six times, her arms forming petal shapes around the center, ruby and gold. No text or logo.',
        'Kaleidoscope symmetry art of climbing roses and thorns repeated into a radial wreath, jewel colors on cream. No text or logo.',
      ],
    },
    {
      name: 'Grain-Shaded Flat Illustration',
      domain: 'flat vector with grain shading',
      tags: ['grain-shading', 'flat', 'editorial'],
      dna: g({
        aesthetic:
          'Grain-shaded flat illustration: simple rounded vector shapes shaded not by gradients but by speckled noise grain brushed along one side of each form.',
        color_and_tone:
          'Warm muted palette, terracotta, mustard, sage and dusty blue, with shadow grain in a darker shade of the same hue.',
        lighting_and_shadow:
          'One light direction; each form gets a band of stippled grain on its shadow side fading into flat color.',
        texture_and_material:
          'Fine sandy noise grain, crisp vector edges, flat fills elsewhere, no outlines.',
        camera_and_composition:
          'Keep the requested framing; forms simplified with slightly exaggerated proportions and generous space.',
        atmosphere_and_mood: 'Warm, cozy and calm, a contemporary editorial feel.',
        rendering_and_quality:
          'Crisp shapes with directional grain shading only; no smooth gradients, no line art, no 3D.',
        key_features:
          'rounded flat vector shapes; directional noise-grain shading; warm muted palette; no outlines; generous space',
      }),
      avoid: [...DIGITAL_BASE, 'smooth gradients', 'outlines', '3D rendering'],
      briefs: [
        'Grain-shaded flat illustration of a cat asleep on a windowsill among potted plants, terracotta and sage shapes, sandy grain on the shadow side of each pot, crisp vector edges. No text or logo.',
        'Grain-shaded flat illustration of an adult astronaut floating while watering a houseplant, dusty blue suit with directional grain shading, generous space. No text or logo.',
        'Grain-shaded flat illustration of a small mountain cabin at dusk with a curl of chimney smoke, glowing mustard windows and a lone deer at the edge of the pines, stippled grain along the roof and snow shadows, muted teal and plum palette. No text or logo.',
      ],
    },
  ],
};

export const aliases = {
  'SP06-047': 'Speedpaint',
  'SP06-051': 'Low Poly',
  'SP06-052': 'Voxel Art',
  'SP06-057': 'Double Exposure',
  'SP06-060': 'ASCII Art',
};

export default spec;
