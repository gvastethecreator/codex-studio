import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'readable readouts',
  'fake UI text',
  'diagnostic label',
  'invented medical claim',
  'normal color photo',
  'celebrity likeness',
];

// Sensor profiles replace visible-light appearance with what the instrument records; the subject stays the prompt's.
const sensor =
  'Keep the prompt subject, action and setting as the thing being imaged; this preset replaces visible-light appearance with what the sensor records, and adds no readable readout, label or diagnosis.';

function sig(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? sensor, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_02',
  category: '7. Sensor And Technical Imaging',
  updates: {
    'SP02-058': {
      dna: sig({
        aesthetic:
          'X-ray radiograph: dense material blocks the beam and shows bright, thin material lets it through and stays dark, revealing the inside of the subject as a glowing negative.',
        color_and_tone:
          'Blue-black film base with bone-white and pale cyan densities; no other color.',
        lighting_and_shadow:
          'No surface light at all; brightness equals material density along the beam.',
        texture_and_material:
          'Translucent overlapping layers, crisp edges on metal and bone, faint film grain and scatter haze.',
        camera_and_composition:
          'Flat projection straight through the subject, centered on a dark film sheet.',
        atmosphere_and_mood: 'Clinical and eerie, the hidden inside of familiar things laid bare.',
        rendering_and_quality:
          'Credible radiograph film look; a shader version lives in pack_03 and a playful one in pack_11.',
        key_features:
          'density shown as brightness; blue-black film; bone-white metal and bone; overlapping translucency; interior structure',
      }),
      avoid: [...AVOID, 'surface detail'],
      briefs: [
        "X-ray radiograph of an adult knight's gauntleted hand, the finger bones glowing white inside the overlapping steel plates, rivets as bright dots, blue-black film. No labels or text.",
        'X-ray radiograph of an antique pocket watch revealing every gear, spring and jewel inside the case as layered translucent shapes. No labels or text.',
        'X-ray radiograph of a violin showing the bass bar, sound post and hidden repair pins inside the translucent wooden body. No labels or text.',
      ],
    },
    'SP02-059': {
      dna: sig({
        aesthetic:
          'White-hot thermal feed: a surveillance-grade infrared camera shown in greyscale, where heat is white and cold is black, with a slightly soft, noisy sensor image.',
        color_and_tone:
          'Greyscale only: warm bodies bright white, cool ground mid grey, sky and water black.',
        lighting_and_shadow:
          'No visible-light shading; heat bleeds softly into its surroundings as a glow.',
        texture_and_material:
          'Low resolution, faint sensor grid, residual heat trails where subjects have been.',
        camera_and_composition: 'Wide surveillance or tracking view, subjects small and glowing.',
        atmosphere_and_mood: 'Cold and watchful, living warmth tracked across the dark.',
        rendering_and_quality:
          'White-hot greyscale thermal; the color ironbow palette belongs to pack_01.',
        key_features:
          'white-hot greyscale; black cold background; soft heat bloom; residual heat trails; low-resolution sensor',
      }),
      avoid: [...AVOID, 'ironbow color palette', 'visible light'],
      briefs: [
        'White-hot thermal image of a wolf pack moving single file through a black winter forest, each wolf a bright glowing shape, faint heat trails in the snow behind them. No readouts or text.',
        'White-hot thermal image of adult villagers gathered around a bonfire, the fire a blinding white bloom and the faces bright grey, the night black. No readouts or text.',
        'White-hot thermal image of a horse-drawn carriage on a dark road, the horses glowing white, the wooden wheels cold grey. No readouts or text.',
      ],
    },
    'SP02-060': {
      dna: sig({
        aesthetic:
          'Night-vision intensifier: starlight amplified by an image tube and shown in phosphor green inside a round eyepiece view.',
        color_and_tone: 'Monochrome phosphor green, bright green highlights, black-green shadows.',
        lighting_and_shadow:
          'Amplified faint light; any real light source blooms into a halo; eyes of animals shine brightly.',
        texture_and_material: 'Scintillation noise, grainy gain, slight blur at the tube edges.',
        camera_and_composition: 'Circular eyepiece vignette, subject within the bright center.',
        atmosphere_and_mood: 'Hidden and tense, the dark seen through someone watching it.',
        rendering_and_quality:
          'Intensifier-tube look with noise and bloom; no crosshair text or numbers.',
        key_features:
          'phosphor green monochrome; round eyepiece vignette; scintillation noise; bloom halos; eyeshine',
      }),
      avoid: [...AVOID, 'full color'],
      briefs: [
        'Night-vision image in phosphor green of an adult ranger crouching behind a ruined stone wall, the round eyepiece vignette framing her, a distant lantern blooming into a halo. No readouts or text.',
        'Night-vision image of an owl on a bare branch staring at the lens, its eyes shining bright green, scintillation noise in the sky. No readouts or text.',
        'Night-vision image of red deer grazing in a forest clearing, their eyes glowing, grainy gain and soft tube edges. No readouts or text.',
      ],
    },
  },
  creates: [
    {
      name: 'Medical Ultrasound Scan',
      domain: 'ultrasound imaging',
      tags: ['ultrasound', 'medical-imaging', 'sensor'],
      dna: sig({
        aesthetic:
          'Medical ultrasound: sound echoes drawn as a grainy greyscale fan-shaped image, with bright reflective boundaries and dark fluid spaces.',
        color_and_tone:
          'Black background, speckled greys, bright white echo boundaries, occasional warm sepia tint.',
        lighting_and_shadow:
          'No light; brightness is echo strength, with dark acoustic shadows behind dense objects.',
        texture_and_material: 'Heavy speckle noise, soft blurred edges, reverberation bands.',
        camera_and_composition:
          'Fan- or sector-shaped image narrowing to the top, subject in cross-section.',
        atmosphere_and_mood: 'Intimate and mysterious, a shape half glimpsed through sound.',
        rendering_and_quality:
          'Credible ultrasound speckle; no measurement text or medical labels.',
        key_features:
          'fan-shaped sector; speckle noise; bright echo boundaries; dark fluid spaces; acoustic shadows',
      }),
      avoid: [...AVOID],
      briefs: [
        'Medical ultrasound image in a fan-shaped sector showing a dragon hatchling curled inside its egg, bright speckled outline of the shell and wing buds, dark fluid around it. No labels or text.',
        "Medical ultrasound image of a heart's four chambers in cross-section, bright valve lines, dark blood spaces and grainy speckle. No labels or text.",
        'Ultrasound-style sector image of a whale calf swimming beside its mother, both grainy grey echoes in the black sea. No labels or text.',
      ],
    },
    {
      name: 'MRI Slice',
      domain: 'magnetic resonance imaging',
      tags: ['mri', 'medical-imaging', 'sensor'],
      dna: sig({
        aesthetic:
          'MRI slice: a thin cross-section through the subject where soft tissues separate into smooth grey tones, water bright or dark depending on the weighting.',
        color_and_tone: 'Smooth greyscale with bright fat or fluid, dark air and bone, no color.',
        lighting_and_shadow: 'No surface light; contrast comes from tissue signal.',
        texture_and_material:
          'Soft internal structures, clean edges, faint ringing or motion artifacts at borders.',
        camera_and_composition:
          'Straight sagittal, axial or coronal slice, subject centered on black.',
        atmosphere_and_mood: 'Calm and revealing, a quiet map of an inside.',
        rendering_and_quality: 'Clinical MRI look with no text, markers or diagnosis.',
        key_features:
          'thin cross-section slice; smooth greyscale soft tissue; black background; sagittal or axial view; faint ringing',
      }),
      avoid: [...AVOID],
      briefs: [
        'Sagittal MRI slice of an adult human head showing the folds of the brain, the spinal cord and sinuses in smooth greyscale on black. No labels or text.',
        'MRI slice through a pomegranate, hundreds of seed chambers bright against the dark rind structure. No labels or text.',
        'Axial MRI slice through an adult knee, cartilage and ligaments in soft grey tones, bone dark. No labels or text.',
      ],
    },
    {
      name: 'CT Volume Rendering',
      domain: 'computed tomography volume',
      tags: ['ct-scan', 'volume-rendering', 'sensor'],
      dna: sig({
        aesthetic:
          'CT volume rendering: a stack of X-ray slices reconstructed into a 3D view where dense materials appear as ivory solids and softer layers as translucent shells.',
        color_and_tone:
          'Ivory and bone white for dense parts, translucent amber or blue for softer layers, black ground.',
        lighting_and_shadow:
          'Soft virtual lighting on reconstructed surfaces, subtle ambient occlusion.',
        texture_and_material:
          'Slightly stepped surfaces from slice reconstruction, porous bone and corrosion detail.',
        camera_and_composition:
          'Three-quarter view of the object with the outer layer cut away to reveal the inside.',
        atmosphere_and_mood:
          'Archaeological and uncanny, secrets revealed without opening anything.',
        rendering_and_quality:
          'Scientific volume render with no labels, scale bars or measurements.',
        key_features:
          'ivory reconstructed solids; translucent outer shell; cut-away reveal; slice stepping; black background',
      }),
      avoid: [...AVOID],
      briefs: [
        'CT volume rendering of a mummified cat, its ivory skeleton visible inside a translucent amber shell of wrappings, three-quarter view on black. No labels or text.',
        'CT volume rendering of an ancient bronze helmet, corrosion layers peeled away in translucent blue to show the thin metal beneath. No labels or text.',
        'CT volume rendering of a sealed clay jar revealing a hoard of coins stacked inside as ivory discs. No labels or text.',
      ],
    },
    {
      name: 'Side-Scan Sonar',
      domain: 'side-scan sonar imaging',
      tags: ['sonar', 'seafloor', 'sensor'],
      dna: sig({
        aesthetic:
          'Side-scan sonar: acoustic strips of the seafloor recorded from a towed fish, turning shapes into amber reliefs with long black acoustic shadows.',
        color_and_tone:
          'Amber, copper and brown tones, dark water column stripe down the center, black shadows.',
        lighting_and_shadow:
          'Pseudo-light from one side: objects bright where facing the sonar and cast long black shadows away.',
        texture_and_material:
          'Sediment ripples, speckle, streaky scan lines, soft blur along the track.',
        camera_and_composition:
          'Top-down swath with a dark vertical nadir band and objects to its sides.',
        atmosphere_and_mood: 'Deep and ghostly, lost things found in the dark.',
        rendering_and_quality: 'Credible sonar mosaic; no coordinates or grid text.',
        key_features:
          'amber acoustic relief; long black shadows; central nadir stripe; scan-line texture; top-down swath',
      }),
      avoid: [...AVOID],
      briefs: [
        'Side-scan sonar image of a sunken galleon resting on the seabed, masts snapped, its hull an amber relief casting a long black acoustic shadow, sediment ripples around it. No coordinates or text.',
        'Side-scan sonar image of the long coiled shadow of a sea serpent stretched along the seafloor, streaky scan lines. No text.',
        'Side-scan sonar image of a drowned village street, rows of roofless stone houses as amber blocks with black shadows. No text.',
      ],
    },
    {
      name: 'Radar PPI Scope',
      domain: 'plan position indicator radar',
      tags: ['radar', 'phosphor-display', 'sensor'],
      dna: sig({
        aesthetic:
          'Radar plan-position scope: a round phosphor display where a rotating sweep paints echoes of ships, land and weather that slowly fade.',
        color_and_tone:
          'Green or amber phosphor on black glass, brighter fresh echoes, dimmer fading trails.',
        lighting_and_shadow: 'Screen glow only; the sweep line brightest, old returns decaying.',
        texture_and_material:
          'Phosphor bloom, curved glass reflections, faint range rings without numbers.',
        camera_and_composition:
          'Circular scope centered, subject translated into echo blips and land shapes.',
        atmosphere_and_mood: 'Tense and watchful, something approaching in the sweep.',
        rendering_and_quality: 'Analog radar display look; no readable numbers or bearings.',
        key_features:
          'rotating sweep line; fading phosphor echoes; round scope; range rings; green glow on black',
      }),
      avoid: [...AVOID],
      briefs: [
        'Radar PPI scope showing a fleet of ships approaching a harbor as bright green blips behind the rotating sweep, coastline echoes and fading trails, round phosphor display. No numbers or text.',
        'Radar scope showing a storm front as a speckled band and a flock of birds as a faint moving smudge, amber phosphor. No numbers or text.',
        'Radar scope showing a single huge unknown echo circling an island, its fading trail spiraling across the glass. No numbers or text.',
      ],
    },
    {
      name: 'Multispectral Satellite False Color',
      domain: 'multispectral remote sensing',
      tags: ['satellite', 'false-color', 'remote-sensing'],
      dna: sig({
        aesthetic:
          'Multispectral satellite false color: near-infrared mapped to red so healthy vegetation blazes red, water turns black-blue and cities cyan-grey.',
        color_and_tone:
          'Bright red vegetation, dark blue-black water, cyan and grey built areas, tan bare soil.',
        lighting_and_shadow: 'High sun from orbit, minimal shadows, cloud shadows as dark patches.',
        texture_and_material: 'Field patterns, river meanders and terrain at orbital scale.',
        camera_and_composition:
          'Straight down from orbit, the subject seen as landscape-scale pattern.',
        atmosphere_and_mood: 'Detached and revealing, the planet seen in invisible light.',
        rendering_and_quality: 'Remote-sensing false-color composite; no map labels or borders.',
        key_features:
          'red vegetation; black-blue water; cyan cities; orbital top-down; near-infrared false color',
      }),
      avoid: [...AVOID, 'map labels'],
      briefs: [
        'Multispectral satellite false-color image of a river delta fanning into the sea, the wetlands blazing red, channels black-blue, a small town cyan-grey. No labels or text.',
        'Multispectral false-color image of a volcanic island with dark lava flows cutting through red forest. No labels or text.',
        'Multispectral false-color image of circular irrigated fields in a desert, red discs on tan ground. No labels or text.',
      ],
    },
    {
      name: 'Synthetic Aperture Radar',
      domain: 'SAR satellite imaging',
      tags: ['sar', 'radar', 'remote-sensing'],
      dna: sig({
        aesthetic:
          'Synthetic aperture radar: a satellite radar image in grainy greyscale where rough and metal surfaces return bright and smooth water stays black.',
        color_and_tone:
          'Salt-and-pepper greyscale, black calm water, bright white metal and cliffs.',
        lighting_and_shadow:
          'Side-looking radar illumination: slopes facing the satellite bright, back slopes in radar shadow.',
        texture_and_material:
          'Heavy speckle, geometric layover distortion on mountains, bright corner reflectors.',
        camera_and_composition:
          'Orbital view, subject as landscape-scale texture and bright points.',
        atmosphere_and_mood: 'Cold and technical, the world seen through storm and night alike.',
        rendering_and_quality: 'Credible SAR speckle look; no labels or scale bars.',
        key_features:
          'speckled greyscale; black smooth water; bright metal returns; radar shadow on slopes; layover distortion',
      }),
      avoid: [...AVOID],
      briefs: [
        'Synthetic aperture radar image of a jagged mountain range, slopes facing the satellite bright, back slopes in black radar shadow, heavy speckle. No labels or text.',
        'Synthetic aperture radar image of a harbor with ships as bright white points on black water. No labels or text.',
        'Synthetic aperture radar image of an ice sheet torn by crevasses, grey speckled texture with bright fracture lines. No labels or text.',
      ],
    },
    {
      name: 'Starlight Low-Light Camera',
      domain: 'starlight EMCCD camera',
      tags: ['low-light', 'starlight-camera', 'sensor'],
      dna: sig({
        aesthetic:
          'Starlight low-light camera: an ultra-sensitive sensor that turns a moonless night into a grainy, washed grey daylight.',
        color_and_tone:
          'Desaturated grey-blue near-monochrome, black sky full of stars, faint color noise.',
        lighting_and_shadow:
          'Flat amplified starlight with almost no shadows; any lamp blows out completely.',
        texture_and_material: 'Heavy fine grain, smeared motion on moving subjects, soft detail.',
        camera_and_composition: 'Wide surveillance or wildlife view, stars visible in the sky.',
        atmosphere_and_mood: 'Uncanny and hushed, night that looks wrongly like day.',
        rendering_and_quality:
          'Low-light sensor look without green tint; distinct from tube night vision.',
        key_features:
          'moonless night made grey daylight; heavy grain; stars visible; blown lamps; no green tint',
      }),
      avoid: [...AVOID, 'green phosphor tint'],
      briefs: [
        'Starlight low-light camera image of an adult shepherd guarding sheep on a moonless hillside, the scene washed grey like dim daylight, stars filling the black sky, heavy grain. No text.',
        'Starlight camera image of a castle courtyard at night with a patrolling guard, a single torch blown out to white. No text.',
        'Starlight camera image of a fox trotting across a snowy field, its motion smeared, grey-blue grain. No text.',
      ],
    },
    {
      name: 'Nuclear Scintigraphy',
      domain: 'gamma camera imaging',
      tags: ['scintigraphy', 'medical-imaging', 'sensor'],
      dna: sig({
        aesthetic:
          'Nuclear scintigraphy: a gamma camera image of where a tracer gathers, shown as soft blurry dots and hot spots on black or white.',
        color_and_tone:
          'Inverted greyscale or a black-to-red-yellow heat scale for tracer intensity.',
        lighting_and_shadow:
          'No conventional light at all; brightness shows only how much tracer gathered.',
        texture_and_material:
          'Coarse counting noise, blurry low-resolution outlines, glowing hot spots.',
        camera_and_composition: 'Frontal and back whole-body or organ views side by side.',
        atmosphere_and_mood: 'Quiet and diagnostic, the body mapped as faint light.',
        rendering_and_quality: 'Gamma-camera noise and blur; no labels, arrows or diagnoses.',
        key_features:
          'tracer hot spots; coarse counting noise; blurry outline; paired front and back views; heat-scale color',
      }),
      avoid: [...AVOID],
      briefs: [
        'Nuclear scintigraphy whole-body bone scan of an adult skeleton, front and back views side by side, joints glowing as dark hot spots in inverted greyscale, coarse counting noise. No labels or text.',
        'Scintigraphy image of a pair of hands showing tracer glowing in the knuckles, blurry low-resolution outline. No labels or text.',
        'Scintigraphy heart image as a glowing red-yellow ring on black, grainy and soft. No labels or text.',
      ],
    },
    {
      name: 'Hyperspectral Data Cube',
      domain: 'hyperspectral imaging',
      tags: ['hyperspectral', 'data-cube', 'remote-sensing'],
      dna: sig({
        aesthetic:
          'Hyperspectral data cube: an image shown as the top face of a 3D block whose sides display hundreds of spectral bands as rainbow streaks.',
        color_and_tone:
          'Natural or false-color top face, rainbow band gradients on the cube sides, dark background.',
        lighting_and_shadow:
          'Flat scientific presentation with slight shading to show the cube form.',
        texture_and_material: 'Fine band striations on the cube edges, pixelated spectral detail.',
        camera_and_composition: 'Isometric cube view, the subject on the top face.',
        atmosphere_and_mood: 'Analytical and beautiful, a scene opened up into its light.',
        rendering_and_quality:
          'Clean scientific visualization without any axes, numbers, legends or captions.',
        key_features:
          'isometric data cube; subject on the top face; rainbow spectral sides; band striations; dark background',
      }),
      avoid: [...AVOID, 'axis labels'],
      briefs: [
        'Hyperspectral data cube of a forest canopy seen from above, the canopy image on the top face and rainbow spectral band streaks running down the cube sides, isometric view. No axes or text.',
        'Hyperspectral data cube of a coral reef, the reef on the top face and the sides glowing in band gradients. No axes or text.',
        'Hyperspectral data cube of a hillside vineyard in rows, spectral striations along the edges. No axes or text.',
      ],
    },
    {
      name: 'Seismic Reflection Section',
      domain: 'seismic reflection imaging',
      tags: ['seismic', 'geophysics', 'sensor'],
      dna: sig({
        aesthetic:
          'Seismic reflection section: a vertical slice of the ground built from echo traces, showing rock layers as stacked wiggly bands.',
        color_and_tone: 'Black-and-white wiggle traces or a red-white-blue polarity scale.',
        lighting_and_shadow:
          'No conventional light; band strength shows only how strongly each layer reflects.',
        texture_and_material:
          'Dense horizontal striping, faults as offsets, domes and channels bending the layers.',
        camera_and_composition:
          'Wide horizontal cross-section of the ground with depth increasing downward.',
        atmosphere_and_mood: 'Deep and geological, hidden history pressed into layers.',
        rendering_and_quality: 'Credible seismic profile with no depth numbers or annotations.',
        key_features:
          'stacked reflection bands; wiggle traces; fault offsets; red-white-blue polarity; wide cross-section',
      }),
      avoid: [...AVOID],
      briefs: [
        'Seismic reflection section of folded rock layers pushed up by a buried salt dome, red-white-blue polarity bands, a fault offsetting the strata. No numbers or text.',
        'Seismic reflection section revealing a buried river channel as a lens-shaped cut in black-and-white wiggle traces. No numbers or text.',
        'Seismic reflection section of an ancient impact crater buried under flat layers, the bowl bending the bands. No numbers or text.',
      ],
    },
    {
      name: 'Ground-Penetrating Radar',
      domain: 'ground-penetrating radar',
      tags: ['gpr', 'archaeology', 'sensor'],
      dna: sig({
        aesthetic:
          'Ground-penetrating radar profile: a grey radargram where buried objects appear as bright hyperbola arcs and buried surfaces as bands.',
        color_and_tone:
          'Grey banded background with black-and-white hyperbolas; sometimes a copper tint.',
        lighting_and_shadow:
          'No conventional light; brightness shows only how strongly the buried material reflects.',
        texture_and_material:
          'Horizontal ringing bands, crisp arcs over pipes, stones and cavities.',
        camera_and_composition: 'Long horizontal profile, surface along the top, depth downward.',
        atmosphere_and_mood: 'Curious and archaeological, secrets just beneath the feet.',
        rendering_and_quality:
          'Credible field radargram look without any depth scales, grids or text.',
        key_features:
          'hyperbola arcs over buried objects; banded background; horizontal profile; void reflections; grey radargram',
      }),
      avoid: [...AVOID],
      briefs: [
        'Ground-penetrating radar profile over a buried stone road, a row of bright hyperbola arcs marking its paving stones beneath grey banding. No scales or text.',
        'Ground-penetrating radar profile across a church floor revealing a hidden crypt as a dark void with bright ringing arcs. No scales or text.',
        'Ground-penetrating radar profile over a buried chest, one strong hyperbola among faint arcs of stones. No scales or text.',
      ],
    },
    {
      name: 'Cloud Chamber Particle Tracks',
      domain: 'cloud chamber detection',
      tags: ['cloud-chamber', 'particle-physics', 'detector'],
      dna: sig({
        aesthetic:
          'Cloud chamber: supersaturated vapor inside a dark chamber where passing particles leave thin white condensation trails.',
        subject_treatment:
          'Keep the prompt subject as the source or theme of the event; render the image as particle tracks in a cloud chamber, never adding readable labels.',
        color_and_tone: 'Black background with white and silvery-blue vapor trails.',
        lighting_and_shadow: 'Side light raking through the chamber so the trails glow.',
        texture_and_material:
          'Thin wispy tracks, short fat alpha streaks, long straight muon lines, curling electrons.',
        camera_and_composition:
          'Looking down into the chamber, tracks radiating or crossing the frame.',
        atmosphere_and_mood: 'Awe-struck and quiet, invisible rain made visible.',
        rendering_and_quality: 'Real cloud-chamber photograph look; not a digital particle effect.',
        key_features:
          'white vapor trails on black; raking side light; straight and curling tracks; fat alpha streaks; top-down chamber view',
      }),
      avoid: [...AVOID, 'digital particle effect'],
      briefs: [
        'Cloud chamber photograph of short fat alpha tracks radiating from a small mineral fragment at the center, white vapor trails on black, raking side light. No labels or text.',
        'Cloud chamber photograph of a single long straight muon track slicing across a field of faint wisps. No labels or text.',
        'Cloud chamber photograph of an electron spiraling in a magnetic field, its white trail curling inward. No labels or text.',
      ],
    },
    {
      name: 'Bubble Chamber Photograph',
      domain: 'bubble chamber detection',
      tags: ['bubble-chamber', 'particle-physics', 'detector'],
      dna: sig({
        aesthetic:
          'Bubble chamber photograph: a mid-century particle-physics record of tiny bubble tracks in liquid, curving and spiraling in a magnetic field.',
        subject_treatment:
          'Keep the prompt subject as the theme of the event; render the image as bubble-chamber tracks, never adding readable labels or fiducial numbers.',
        color_and_tone:
          'Black-and-white or cyan-tinted film, thin dark or bright tracks, grey liquid background.',
        lighting_and_shadow: 'Flash-lit bubbles along each track; even background illumination.',
        texture_and_material:
          'Dotted bubble lines, tight spirals, V-shaped decays and fiducial crosses.',
        camera_and_composition:
          'Wide film frame with tracks entering from one side and exploding outward.',
        atmosphere_and_mood: 'Elegant and explosive, a hidden collision drawn in lines.',
        rendering_and_quality: 'Archival film look; no numbers or text on the frame.',
        key_features:
          'dotted bubble tracks; tight spirals; V-shaped decays; fiducial crosses; archival film frame',
      }),
      avoid: [...AVOID],
      briefs: [
        'Bubble chamber photograph of a particle collision, beam tracks entering from the left and bursting into curving and spiraling dotted lines, fiducial crosses on the grey liquid. No numbers or text.',
        'Bubble chamber photograph of a V-shaped decay appearing out of nowhere beside a tight spiral, cyan-tinted archival film. No numbers or text.',
        'Bubble chamber photograph of a spray of tracks fanning out from a high-energy event. No numbers or text.',
      ],
    },
    {
      name: 'Retinal Fundus Image',
      domain: 'ophthalmic fundus photography',
      tags: ['fundus', 'medical-imaging', 'sensor'],
      dna: sig({
        aesthetic:
          'Retinal fundus photograph: the inside back of an eye seen through the pupil, a glowing orange-red disc with branching vessels and a bright optic disc.',
        color_and_tone:
          'Orange, red and amber field, pale yellow optic disc, dark red vessels, black circular surround.',
        lighting_and_shadow:
          'Flash through the pupil lighting the retina evenly with a bright center.',
        texture_and_material:
          'Branching vessel trees, fine choroidal texture, subtle reflex sheen.',
        camera_and_composition:
          'Circular image on black, optic disc off to one side, vessels arching across.',
        atmosphere_and_mood: 'Intimate and cosmic, a planet hidden inside an eye.',
        rendering_and_quality:
          'Clinical fundus photograph look without any markings, arrows or diagnosis.',
        key_features:
          'orange-red retinal disc; branching vessels; pale optic disc; black circular surround; flash center',
      }),
      avoid: [...AVOID],
      briefs: [
        'Retinal fundus photograph of an adult eye, the orange-red retina glowing inside a black circle, dark red vessels branching from a pale yellow optic disc. No labels or text.',
        'Retinal fundus photograph centered on the optic disc, vessels radiating like rivers, soft reflex sheen. No labels or text.',
        "Retinal fundus photograph of a cat's eye, its reflective layer shimmering green-gold above the red lower retina. No labels or text.",
      ],
    },
    {
      name: 'Confocal Fluorescence Microscopy',
      domain: 'fluorescence microscopy',
      tags: ['confocal', 'microscopy', 'fluorescence'],
      dna: sig({
        aesthetic:
          'Confocal fluorescence microscopy: stained structures glowing in separate colored channels against black, sharp in thin optical sections.',
        color_and_tone:
          'Glowing green, magenta, cyan and red channels on pure black, overlaps turning white or yellow.',
        lighting_and_shadow:
          'Laser-excited emission from the stains themselves, with no conventional light or shadow.',
        texture_and_material:
          'Fine filaments, nuclei, membranes and branching cells with crisp edges.',
        camera_and_composition: 'Microscope field of view, cells filling the frame, no ground.',
        atmosphere_and_mood: 'Luminous and alive, a hidden neon forest inside living things.',
        rendering_and_quality: 'Scientific micrograph look; no scale bars or labels.',
        key_features:
          'glowing colored channels; black background; thin optical section; filament and nucleus detail; channel overlap',
      }),
      avoid: [...AVOID, 'scale bar'],
      briefs: [
        'Confocal fluorescence micrograph of neurons with green branching dendrites and magenta cell bodies glowing on black, overlapping channels turning white. No scale bar or text.',
        'Confocal fluorescence micrograph of a moss leaf, rows of cells with red glowing chloroplasts and cyan walls. No scale bar or text.',
        'Confocal fluorescence micrograph of a tiny transparent fish embryo, its spine and eyes glowing in green and red channels. No scale bar or text.',
      ],
    },
    {
      name: 'Satellite Night Lights',
      domain: 'night-time orbital imaging',
      tags: ['satellite', 'night-lights', 'remote-sensing'],
      dna: sig({
        aesthetic:
          'Satellite night lights: the dark side of the Earth seen from orbit, with settlements as gold and white light clusters threaded by roads.',
        color_and_tone:
          'Black land and sea, amber and white city lights, faint blue airglow at the limb.',
        lighting_and_shadow:
          'Only artificial lights on the ground and a few faint moonlit clouds above them.',
        texture_and_material: 'Glowing dots and webs of roads, dark gaps of mountains and forests.',
        camera_and_composition: 'Orbital view, the subject expressed as a pattern of light.',
        atmosphere_and_mood: 'Quiet and vast, human life drawn in scattered light.',
        rendering_and_quality: 'Orbital night imagery with no borders, labels or map lines.',
        key_features:
          'gold city lights on black; road webs; dark mountain gaps; blue limb airglow; orbital view',
      }),
      avoid: [...AVOID, 'map borders'],
      briefs: [
        'Satellite night-lights image of a coastline from orbit, cities glowing as gold clusters linked by threads of road, the sea black, blue airglow along the planet edge. No labels or text.',
        'Satellite night-lights image of a winding river valley traced by a chain of glowing towns. No labels or text.',
        "Satellite night-lights image of a mountain-ringed kingdom's cities glowing along a single trade road, dark peaks all around. No labels or text.",
      ],
    },
  ],
};

export default spec;
