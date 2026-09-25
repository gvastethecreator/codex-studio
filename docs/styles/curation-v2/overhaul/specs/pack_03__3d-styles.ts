import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'brand logo',
  'franchise likeness',
  'readable text',
  'readable letters',
  'changing the requested camera view',
];

// 3D media rebuild the subject in the medium and keep the view; profiles below own their view or layout.
const medium =
  'Keep the prompt subject, action, setting and camera view; rebuild them in this 3D medium without changing the requested view.';
const profile = (what: string) =>
  `Keep the prompt subject and action; this preset owns ${what}, and nothing else about the request changes.`;

function s3(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? medium, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_03',
  category: '4. 3D Styles',
  updates: {
    'SP03-015': {
      dna: s3({
        aesthetic:
          'Claymation stop-motion: the subject sculpted in plasticine and posed on a miniature set, with fingerprints, tool marks and slight frame-to-frame boil.',
        color_and_tone:
          'Saturated but slightly chalky plasticine colors, warm miniature set lighting.',
        lighting_and_shadow:
          'Small hard studio lamps with soft fill, crisp little shadows on the set.',
        texture_and_material:
          'Fingerprints, smoothing marks, tiny cracks and wire armature bulges in soft clay.',
        camera_and_composition:
          'Keep the requested view; macro depth of field reveals the miniature scale.',
        atmosphere_and_mood: 'Handmade and charming, a world pressed together by patient fingers.',
        rendering_and_quality:
          'Physical plasticine look with visible handling marks, never smooth plastic CG.',
        key_features:
          'plasticine with fingerprints; miniature set; small hard lamps; macro depth; handmade imperfection',
      }),
      avoid: [...AVOID, 'tram'],
      briefs: [
        'Claymation frame of an adult clay goblin blacksmith hammering a tiny glowing sword at a miniature forge, fingerprints in his green plasticine skin, warm lamp light, macro depth of field. No text or logo.',
        'Claymation frame of a clay snail postman delivering a parcel to a mushroom house, smoothing marks on the shell. No text or logo.',
        'Claymation frame of a clay witch on a broom flying over plasticine rooftops, wire-supported, crisp little shadows. No text or logo.',
      ],
    },
    'SP03-021': {
      dna: s3({
        aesthetic:
          'Low-poly 3D: forms reduced to a few hundred flat triangular facets, each facet a single shaded tone.',
        color_and_tone: 'Vivid stylized colors, facet-to-facet value steps, gradient skies.',
        lighting_and_shadow: 'Single sun with flat per-facet shading; crisp shadow triangles.',
        texture_and_material: 'No textures; the geometry of the facets is the texture.',
        camera_and_composition:
          'Keep the requested view; silhouettes stay readable despite the reduction.',
        atmosphere_and_mood: 'Clean and playful, the world simplified into crystal shards.',
        rendering_and_quality: 'Crisp flat-shaded facets without smoothing or texture maps.',
        key_features:
          'visible triangular facets; flat per-facet shading; no textures; vivid palette; readable silhouettes',
      }),
      avoid: AVOID,
      briefs: [
        'Low-poly 3D render of a griffin perched on a faceted cliff above a valley, every feather a flat triangular facet, gradient sunset sky. No text or logo.',
        'Low-poly 3D render of a longship with a striped sail riding faceted waves, crisp triangle shadows. No text or logo.',
        'Low-poly 3D render of a camel caravan crossing a faceted desert canyon at noon. No text or logo.',
      ],
    },
    'SP03-022': {
      dna: s3({
        aesthetic:
          'Voxel art: the subject built from small uniform cubes on a strict grid, like 3D pixels, with soft global illumination.',
        color_and_tone: 'Limited palette per material, stepped color shading between voxels.',
        lighting_and_shadow: 'Soft sky light and ambient occlusion in the cube corners.',
        texture_and_material: 'Uniform cube faces, visible grid, no smooth curves.',
        camera_and_composition:
          'Keep the requested view; the voxel scale fine enough to read details.',
        atmosphere_and_mood: 'Cheerful and constructive, a world you could build block by block.',
        rendering_and_quality:
          'Clean voxel render with soft occlusion; no mining-game textures or characters.',
        key_features:
          'uniform cube voxels; strict grid; stepped palette shading; soft ambient occlusion; no curves',
      }),
      avoid: [...AVOID, 'mining game textures'],
      briefs: [
        'Voxel art render of a crooked wizard tower on a small floating island, every stone, window and vine built from tiny cubes, soft occlusion in the corners. No text or logo.',
        'Voxel art render of a blue whale diving through a sea of translucent blue cubes. No text or logo.',
        'Voxel art render of a horned owl on a branch built from stepped brown and gold voxels. No text or logo.',
      ],
    },
    'SP03-023': {
      dna: s3({
        aesthetic:
          'Isometric 3D: the scene seen through a parallel orthographic camera at the classic isometric angle, usually as a neat cutaway block.',
        subject_treatment: profile(
          'the isometric orthographic camera and cutaway block framing, the explicit exception to keeping the requested view',
        ),
        color_and_tone: 'Clean pastel or saturated palette, soft gradients, gentle shadows.',
        lighting_and_shadow: 'Soft top-left key with ambient fill; small crisp contact shadows.',
        texture_and_material:
          'Tidy simplified materials with clear separation between every object.',
        camera_and_composition:
          'Parallel projection with no perspective, 30-degree axes, the scene cut into a square block.',
        atmosphere_and_mood: 'Orderly and inviting, a tiny world you can take in at a glance.',
        rendering_and_quality:
          'Clean isometric render with parallel lines and no perspective distortion at all.',
        key_features:
          'isometric orthographic camera; cutaway square block; no perspective; soft top-left key; tidy detail',
      }),
      avoid: [
        ...AVOID.filter((rule) => rule !== 'changing the requested camera view'),
        'perspective distortion',
      ],
      briefs: [
        'Isometric 3D cutaway of a dwarven mine block with ore carts on rails, lantern-lit tunnels and a tiny waterfall, parallel projection, soft top-left light. No text or logo.',
        "Isometric 3D cutaway of an alchemist's laboratory room with bubbling flasks, shelves and a cat asleep on a stool. No readable labels or logo.",
        'Isometric 3D cutaway of a pirate ship deck and hold, cannons, barrels and a hammock in section. No text or logo.',
      ],
    },
    'SP03-024': {
      dna: s3({
        aesthetic:
          'Wireframe render: only the mesh edges drawn as glowing lines, revealing the topology of the subject against a dark field.',
        color_and_tone:
          'Neon cyan, magenta or white lines on black; brighter where lines converge.',
        lighting_and_shadow: 'No surface shading; line density creates perceived form.',
        texture_and_material: 'Quad and triangle topology, edge loops following the forms.',
        camera_and_composition: 'Keep the requested view; hidden lines removed for clarity.',
        atmosphere_and_mood: 'Technical and ghostly, the hidden structure laid completely bare.',
        rendering_and_quality: 'Clean anti-aliased lines with a subtle glow and no noise.',
        key_features:
          'mesh edges only; neon lines on black; visible edge loops; no surface shading; subtle glow',
      }),
      avoid: [...AVOID, 'elevator'],
      briefs: [
        'Wireframe render of a whale skeleton suspended in darkness, every bone drawn as glowing cyan mesh edges with clean edge loops. No text or logo.',
        'Wireframe render of a gothic cathedral, its vaults and buttresses traced in white topology lines on black. No text or logo.',
        'Wireframe render of a jellyfish with trailing tentacles in magenta edge lines. No text or logo.',
      ],
    },
    'SP03-026': {
      dna: s3({
        aesthetic:
          'Knolling: every part of the subject disassembled and laid out flat at right angles in a tidy grid, seen from straight above.',
        subject_treatment: profile('the disassembled overhead grid layout'),
        color_and_tone: 'Clean neutral ground, parts in their true colors, strong contrast.',
        lighting_and_shadow: 'Soft overhead light with small, even shadows under every part.',
        texture_and_material: 'Each part crisp and clean, grouped by type and size.',
        camera_and_composition: 'Exactly top-down, parts aligned to a grid with equal spacing.',
        atmosphere_and_mood: 'Satisfying and analytical, an object understood by its pieces.',
        rendering_and_quality: 'Crisp CGI knolling; not a photographic flat lay of whole objects.',
        key_features:
          'disassembled parts; right-angle grid; top-down view; grouped by size; even spacing',
      }),
      avoid: AVOID.filter((rule) => rule !== 'changing the requested camera view'),
      briefs: [
        'CGI knolling of a disassembled crossbow: limbs, string, trigger pieces, bolts and screws laid out in a perfect right-angle grid on a slate ground, top-down. No text or logo.',
        'CGI knolling of a clockwork beetle taken apart: shell plates, gears, springs and legs grouped by size. No text or logo.',
        'CGI knolling of an iron lantern disassembled into glass panes, frame, handle and candle cup. No text or logo.',
      ],
    },
    'SP03-027': {
      dna: s3({
        aesthetic:
          'Metaballs: the subject built from implicit blobby spheres that merge smoothly where they touch, like liquid clay.',
        color_and_tone: 'Glossy soft colors or iridescent candy tones, smooth gradients.',
        lighting_and_shadow: 'Soft studio light with broad glossy highlights on the rounded blobs.',
        texture_and_material: 'Perfectly smooth merged surfaces, no seams, bulging joints.',
        camera_and_composition:
          'Keep the requested view; the blob construction visible at the joints.',
        atmosphere_and_mood: 'Playful and organic, forms that seem ready to flow apart.',
        rendering_and_quality:
          'Clean implicit-surface render without any visible polygon edges or seams.',
        key_features:
          'merging blob spheres; seamless joints; glossy smooth surface; soft studio light; liquid forms',
      }),
      avoid: AVOID,
      briefs: [
        'Metaball render of an octopus built from glossy merging blobs, its arms made of spheres melting into each other, soft studio highlights. No text or logo.',
        'Metaball render of a flock of blobby sheep grazing on a smooth green hill. No text or logo.',
        'Metaball render of a candle whose wax drips are merging spheres. No text or logo.',
      ],
    },
    'SP03-028': {
      dna: s3({
        aesthetic:
          'NURBS class-A surfacing: the subject modeled from perfectly smooth mathematical curves, with continuous reflections revealing flawless curvature.',
        color_and_tone: 'Glossy neutral or single paint color, clean white reflections.',
        lighting_and_shadow:
          'Striped studio lights producing zebra-like reflection lines that flow without breaks.',
        texture_and_material:
          'Mirror-smooth surfaces, sharp controlled creases, no polygon facets.',
        camera_and_composition:
          'Keep the requested view; surfaces turned to show the reflection flow.',
        atmosphere_and_mood: 'Precise and elegant, with the calm of perfect industrial design.',
        rendering_and_quality:
          'Continuous-curvature surfaces whose reflection lines never break or kink.',
        key_features:
          'mathematically smooth surfaces; zebra reflection stripes; continuous curvature; crisp creases; glossy finish',
      }),
      avoid: AVOID,
      briefs: [
        'NURBS class-A render of a sleek racing boat hull, striped studio lights flowing as unbroken zebra reflections over its curves, glossy white finish. No text or logo.',
        'NURBS render of a flowing chaise lounge with a single sharp crease line and perfect reflections. No text or logo.',
        'NURBS render of a spiraling hunting horn with continuous chrome curvature. No text or logo.',
      ],
    },
    'SP03-029': {
      dna: s3({
        aesthetic:
          'Fractal 3D: the subject grown from self-similar mathematical recursion, every part repeating smaller versions of itself into infinity.',
        color_and_tone: 'Iridescent or psychedelic gradients by recursion depth, glowing crevices.',
        lighting_and_shadow:
          'Ambient occlusion deep inside the recursion, glowing rims on outer edges.',
        texture_and_material: 'Endless nested detail, bulbous or angular fractal surfaces.',
        camera_and_composition: 'Keep the requested view; recursion visible at several scales.',
        atmosphere_and_mood: 'Hypnotic and infinite, detail that never ends.',
        rendering_and_quality: 'Clean ray-marched fractal with fine detail and no noise.',
        key_features:
          'self-similar recursion; nested detail at every scale; deep occlusion; iridescent gradients; ray-marched surfaces',
      }),
      avoid: AVOID,
      briefs: [
        'Fractal 3D render of a tree whose branches split into smaller trees again and again into infinity, iridescent gradient by depth, glowing tips. No text or logo.',
        'Fractal 3D render of a fortress whose towers carry smaller fortresses on their battlements, recursing endlessly. No text or logo.',
        'Fractal 3D render of a coral reef grown from recursive spirals and bulbs. No text or logo.',
      ],
    },
    'SP03-030': {
      dna: s3({
        aesthetic:
          'Glitch 3D: the subject as a corrupted mesh — stretched vertices, sliced and offset chunks and wrong RGB shader channels.',
        color_and_tone:
          'Base colors split into red, green and blue offsets, magenta error patches.',
        lighting_and_shadow:
          'Normal lighting interrupted by flipped normals and black missing faces.',
        texture_and_material:
          'Spiked vertices, displaced slices, texture stretching, z-fighting stripes.',
        camera_and_composition:
          'Keep the requested view; corruption concentrated on part of the subject.',
        atmosphere_and_mood: 'Unstable and eerie, reality breaking at the seams.',
        rendering_and_quality: 'Deliberate 3D data corruption, not a 2D glitch filter.',
        key_features:
          'spiked stretched vertices; sliced offset chunks; RGB channel split; flipped normals; z-fighting',
      }),
      avoid: AVOID,
      briefs: [
        'Glitch 3D render of a marble horse statue whose hind legs explode into spiked stretched vertices and offset slices, red-green-blue channel splits along the mane. No text or logo.',
        'Glitch 3D render of a castle where whole floors slide sideways as corrupted chunks, magenta missing-texture patches. No text or logo.',
        'Glitch 3D render of an adult fencer mid-lunge, the blade arm stretched into polygon spikes and z-fighting stripes. No text or logo.',
      ],
    },
    'SP03-040': {
      dna: s3({
        aesthetic:
          'Toon shader: 3D forms rendered with flat cel bands and inked outlines so they read like hand-drawn animation.',
        color_and_tone: 'Flat saturated fills with one darker shadow band and a small highlight.',
        lighting_and_shadow:
          'Hard stepped shading ramp from one key light, with crisp shadow shapes.',
        texture_and_material: 'Clean flat color, black or colored outline of variable width.',
        camera_and_composition: 'Keep the requested view; outlines clarifying every silhouette.',
        atmosphere_and_mood: 'Lively and graphic, animation in three dimensions.',
        rendering_and_quality:
          'Clean cel-shaded 3D; original designs only, no franchise characters.',
        key_features:
          'flat cel shadow bands; inked outlines; hard shading steps; saturated fills; 3D form',
      }),
      avoid: [...AVOID, 'anime franchise character'],
      briefs: [
        'Toon-shaded 3D render of a patched wooden airship drifting over clouds, flat cel shadow bands and bold ink outlines. No text or logo.',
        'Toon-shaded 3D render of an adult swordswoman in a flowing coat mid-leap, one shadow band and variable-width outline. No text or logo.',
        'Toon-shaded 3D render of a mushroom village at dusk with glowing windows. No text or logo.',
      ],
    },
    'SP03-045': {
      dna: s3({
        aesthetic:
          'Wireframe on shaded: a grey-shaded 3D model with its mesh edges drawn over the surface, as in a modeling viewport presentation.',
        color_and_tone: 'Neutral grey shading, dark or colored wire lines, clean background.',
        lighting_and_shadow: 'Soft studio light with ambient occlusion on the grey model.',
        texture_and_material: 'Quad topology and edge loops visible over the shaded form.',
        camera_and_composition: 'Keep the requested view; model centered for presentation.',
        atmosphere_and_mood: 'Technical and proud, craft shown in its structure.',
        rendering_and_quality: 'Clean topology presentation render with no viewport UI or gizmos.',
        key_features:
          'grey shaded model; mesh edges overlaid; clean edge loops; ambient occlusion; presentation framing',
      }),
      avoid: [...AVOID, 'viewport UI'],
      briefs: [
        'Wireframe-on-shaded render of a hulking troll model in neutral grey with clean quad edge loops drawn over the surface, soft studio light. No UI, text or logo.',
        'Wireframe-on-shaded render of a winged helmet showing its topology around the feathers. No UI, text or logo.',
        'Wireframe-on-shaded render of a carved rocking horse with edge loops following its curves. No UI, text or logo.',
      ],
    },
    'SP03-050': {
      dna: s3({
        aesthetic:
          'Motion graphics 3D: clean procedural shapes arranged in rhythmic, keyframe-like compositions with bright gradients and satisfying motion implied.',
        color_and_tone: 'Bright brand-like gradients, candy colors and clean whites throughout.',
        lighting_and_shadow: 'Soft area lights with crisp glossy highlights, colored bounce.',
        texture_and_material: 'Satin plastics, frosted glass, matte clay, perfectly clean.',
        camera_and_composition:
          'Keep the requested view; elements orbiting, stacking or flowing in rhythm.',
        atmosphere_and_mood: 'Upbeat and hypnotic, motion frozen at a satisfying moment.',
        rendering_and_quality: 'Clean motion-design render with no text or logos.',
        key_features:
          'procedural shapes in rhythm; bright gradients; satin and frosted materials; orbits and flows; clean composition',
      }),
      avoid: AVOID,
      briefs: [
        'Motion-graphics 3D render of satin rings and spheres orbiting a glowing central orb in a rhythmic spiral, bright gradient background. No text or logo.',
        'Motion-graphics 3D render of a cascade of candy-colored cubes flipping down a staircase, frozen mid-motion. No text or logo.',
        'Motion-graphics 3D render of frosted ribbons weaving themselves into a knot. No text or logo.',
      ],
    },
    'SP03-058': {
      dna: s3({
        aesthetic:
          '3D typography: sculptural letter-like glyphs built from real materials and objects, lit as physical objects.',
        subject_treatment:
          'Keep the prompt subject and setting; express it through a sculpted glyph shape, using invented ornamental glyphs rather than readable letters unless the prompt supplies the exact text.',
        color_and_tone: 'Bold material colors against a clean or atmospheric backdrop.',
        lighting_and_shadow:
          'Studio lighting that reveals depth and bevels, soft shadow on the ground.',
        texture_and_material: 'Glyphs made of vines, candles, stone, metal or stacked objects.',
        camera_and_composition:
          'Glyph centered as a freestanding sculpture in a three-quarter view.',
        atmosphere_and_mood: 'Expressive and crafted, a symbol as an object.',
        rendering_and_quality:
          'Physical-looking glyph sculpture; no readable words invented by the preset.',
        key_features:
          'sculpted glyph object; material-built letterform; studio depth lighting; centered sculpture; invented ornamental shape',
      }),
      avoid: AVOID.filter((rule) => rule !== 'changing the requested camera view'),
      briefs: [
        '3D typographic sculpture of an invented ornamental glyph grown from twisting ivy and thorns, small roses at its terminals, studio light and soft shadow. No readable letters or logo.',
        '3D typographic sculpture of an invented glyph built from melting candles, wax dripping down its curves. No readable letters or logo.',
        '3D typographic sculpture of an invented glyph forged from riveted iron with brass inlay. No readable letters or logo.',
      ],
    },
    'SP03-065': {
      dna: s3({
        aesthetic:
          '3D app icon: the subject simplified into a glossy rounded object inside a soft squircle tile, readable at tiny size.',
        subject_treatment: profile('the front-facing squircle icon framing'),
        color_and_tone:
          'Vibrant gradients on soft pastel backgrounds with clean glossy highlights.',
        lighting_and_shadow:
          'Soft top light, subtle inner glow and a small drop shadow under the tile.',
        texture_and_material: 'Smooth plastic, glass and soft matte clay; no fine noise.',
        camera_and_composition:
          'Front-facing centered squircle with the simplified subject inside.',
        atmosphere_and_mood: 'Friendly and polished, instantly recognizable at a glance.',
        rendering_and_quality: 'UI-grade icon render with no text or brand marks.',
        key_features:
          'squircle tile; simplified glossy subject; soft top light; vibrant gradient; small drop shadow',
      }),
      avoid: AVOID.filter((rule) => rule !== 'changing the requested camera view'),
      briefs: [
        '3D app icon of a treasure chest bursting with gold inside a soft purple squircle tile, glossy rounded forms, soft top light and small drop shadow. No text or logo.',
        '3D app icon of a round potion flask with glowing green liquid in a teal squircle. No text or logo.',
        '3D app icon of a castle gate with a portcullis in a warm orange squircle. No text or logo.',
      ],
    },
    'SP03-070': {
      dna: s3({
        aesthetic:
          '90s pre-rendered CD-ROM scene: lonely surreal places rendered offline for early multimedia games, with soft fog, dithered color and eerie stillness.',
        color_and_tone:
          'Muted teal, rust and ochre, dithered gradients, slightly posterized skies.',
        lighting_and_shadow:
          'Soft early raytraced shadows, volumetric fog as flat haze, glowing windows.',
        texture_and_material:
          'Low-resolution stretched textures, clean primitive geometry, occasional dither pattern.',
        camera_and_composition:
          'Keep the requested view; empty spaces with a single mysterious structure.',
        atmosphere_and_mood: 'Lonely and puzzling, a place waiting for someone to click.',
        rendering_and_quality:
          'Pre-rendered 640x480-era look; distinct from the 90s scanline and raytracer renderer presets.',
        key_features:
          'pre-rendered surreal emptiness; dithered color; flat fog haze; stretched low-res textures; mysterious lone structure',
      }),
      avoid: AVOID,
      briefs: [
        '90s pre-rendered CD-ROM scene of a lonely clock tower on a small island at dusk, flat fog haze over the water, dithered teal sky, low-res brick textures. No text or logo.',
        '90s pre-rendered scene of an empty library hall with impossible arched shelves and a single glowing lectern, posterized light. No readable text or logo.',
        '90s pre-rendered scene of a sunken temple with a glowing orb on an altar, stretched stone textures. No text or logo.',
      ],
    },
    'SP03-072': {
      dna: s3({
        aesthetic:
          'Clay UI: interface elements rendered as soft extruded matte clay — rounded panels, pill buttons and knobs — with friendly depth.',
        subject_treatment: profile(
          'the extruded soft-clay interface layout, with every control blank and textless',
        ),
        color_and_tone: 'Soft pastel palette, cream backgrounds, one accent color.',
        lighting_and_shadow:
          'Large soft light, gentle contact shadows, inner shadows on pressed buttons.',
        texture_and_material: 'Matte clay with tiny surface grain, rounded bevels.',
        camera_and_composition: 'Front-facing or slightly tilted panel filling the frame.',
        atmosphere_and_mood: 'Friendly and tactile, controls you want to squeeze.',
        rendering_and_quality: 'Clean soft-clay render; no readable labels or numbers.',
        key_features:
          'extruded matte clay UI; pastel palette; pill buttons and knobs; soft contact shadows; textless controls',
      }),
      avoid: AVOID.filter((rule) => rule !== 'changing the requested camera view'),
      briefs: [
        'Clay UI render of a spell-selection wheel with six rounded pastel buttons carrying simple clay icons of fire, water, leaf, wind, star and moon, soft contact shadows. No text or logo.',
        'Clay UI render of a potion-mixing control panel with three knobs and a pressed pill button. No text or logo.',
        'Clay UI render of a music box control panel with blank sliders and a round play knob. No text or logo.',
      ],
    },
    'SP03-073': {
      dna: s3({
        aesthetic:
          'Papercraft 3D: the subject built from cut and layered cardstock, with visible paper thickness, folds and glue tabs.',
        color_and_tone: 'Matte craft-paper colors, soft pastels and earth tones, white cut edges.',
        lighting_and_shadow: 'Soft directional light revealing layers and fold shadows.',
        texture_and_material: 'Paper grain, cut edges, layered depth, slightly curled pieces.',
        camera_and_composition: 'Keep the requested view; shallow depth shows the craft scale.',
        atmosphere_and_mood: 'Handmade and gentle, a world cut from paper.',
        rendering_and_quality:
          'Tactile papercraft render with cuts and glue, distinct from folded-only origami.',
        key_features:
          'layered cardstock; visible paper thickness; cut edges; fold shadows; paper grain',
      }),
      avoid: AVOID,
      briefs: [
        'Papercraft 3D render of a castle on a hill built from layered cardstock, white cut edges, glue tabs visible on the towers, soft directional light. No text or logo.',
        'Papercraft 3D render of a fox in a paper forest, layered grass and trees casting soft shadows. No text or logo.',
        'Papercraft 3D render of a striped hot-air balloon with a paper basket drifting over paper clouds. No text or logo.',
      ],
    },
    'SP03-077': {
      name: 'Toy Brick-Built 3D',
      dna: s3({
        aesthetic:
          'Toy brick-built 3D: the subject constructed from interlocking plastic building bricks with studs on top, in bright primary colors.',
        color_and_tone:
          'Bright red, blue, yellow, green, black and white plastic, glossy highlights.',
        lighting_and_shadow:
          'Soft studio light or daylight with crisp little shadows around each stud.',
        texture_and_material:
          'Glossy ABS plastic, studs, seams between bricks, slight fingerprints.',
        camera_and_composition: 'Keep the requested view; the brick scale visible in the details.',
        atmosphere_and_mood: 'Playful and inventive, built piece by piece.',
        rendering_and_quality: 'Clean toy-brick render with no brand name on the studs.',
        key_features:
          'interlocking studded bricks; primary plastic colors; glossy ABS; brick seams; stud shadows',
      }),
      avoid: [...AVOID, 'brand name on studs'],
      briefs: [
        "Toy-brick-built render of a crooked wizard's tower with a spiral staircase and a purple roof, every brick studded and glossy, crisp stud shadows. No brand name or logo.",
        'Toy-brick-built render of a pirate galleon with black sails and tiny cannons. No brand name or logo.',
        'Toy-brick-built render of a kraken wrapping its brick tentacles around a lighthouse-free rocky island. No brand name or logo.',
      ],
    },
    'SP03-078': {
      dna: s3({
        aesthetic:
          'Origami 3D: the subject folded from single uncut sheets of paper, with crisp creases and geometric planes.',
        color_and_tone:
          'Natural paper tones or single bold colored sheets, subtle patterned papers.',
        lighting_and_shadow:
          'Directional light catching every crease, soft shadows between planes.',
        texture_and_material: 'Crisp folds, paper grain, slight translucency at edges.',
        camera_and_composition: 'Keep the requested view; folded planes turned to the light.',
        atmosphere_and_mood: 'Elegant and precise, form made only from folds.',
        rendering_and_quality:
          'Pure fold geometry, no cuts or glue; distinct from layered papercraft.',
        key_features: 'single-sheet folds; crisp creases; geometric planes; paper grain; no cuts',
      }),
      avoid: [...AVOID, 'elevator'],
      briefs: [
        'Origami 3D render of a flock of paper cranes in several colors rising from a folded paper pond, crisp creases catching directional light. No text or logo.',
        'Origami 3D render of a coiled dragon folded from a single red sheet. No text or logo.',
        'Origami 3D render of a stag with branching folded antlers in cream paper. No text or logo.',
      ],
    },
  },
};

export const aliases = { 'SP03-077': 'Lego Brick-Built 3D' };

export default spec;
