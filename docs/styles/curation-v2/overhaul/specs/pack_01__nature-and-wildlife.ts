import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'zoo snapshot',
  'oversaturated postcard',
  'plastic foliage',
  'substituting a landscape or animal the prompt did not ask for',
];

// Nature presets apply a way of photographing nature; they never swap the requested subject.
const field =
  'Keep the prompt subject and setting; apply this nature-photography approach to them without substituting a landscape, animal or plant the prompt did not ask for.';
const viewpoint =
  'Keep the prompt subject and setting; this preset owns the camera placement and lens described below, nothing else.';

function nat(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? field, ...rest } as Dna;
}

const PHOTO = [
  'illustration',
  'painting',
  'drawing',
  '3d render',
  'cartoon',
  'anime',
  'synthetic CGI',
  ...AVOID,
];

const spec: Spec = {
  pack: 'pack_01',
  category: '6. Nature And Wildlife',
  updates: {
    'SP01-047': {
      dna: nat({
        aesthetic:
          'Zone System black-and-white landscape: a large-format view camera at f/64, exposure placed and development controlled so the print runs from pure white to deep black with every zone in between.',
        color_and_tone:
          'Monochrome with a full ten-zone scale: textured whites in snow and cloud, luminous mid-greys, deep but detailed blacks; skies darkened as if through a red filter.',
        lighting_and_shadow:
          'Dramatic natural light — storm breaks, raking sun, cloud shadow patterns — chosen to separate planes.',
        texture_and_material:
          'Tonal microdetail in rock, bark, water, fur and snow, sharp from front to back.',
        camera_and_composition:
          'Tripod view camera, near-far depth with everything in focus, strong foreground anchor and grand background.',
        atmosphere_and_mood: 'Grand and timeless, stillness and scale held in silver tones.',
        rendering_and_quality:
          'Fine-art silver print with deep blacks and no clipped highlights; an animal or object stays the subject, rendered with the same tonal range.',
        key_features:
          'ten-zone black and white; f/64 front-to-back sharpness; red-filter dark skies; raking dramatic light; silver print',
      }),
      avoid: [...AVOID, 'color', 'flat grey tones'],
      briefs: [
        'Zone System black-and-white photograph of a granite spire rising above a frozen lake under towering storm clouds, snow paper-white with texture, the lake black, sky darkened by a red filter, f/64 sharpness from the foreground boulders to the peak. No text or logo.',
        'Zone System black-and-white photograph of a lone twisted juniper clinging to a cliff edge above a canyon, sunlight raking its bark, full tonal scale from bright cloud to deep shadow. No text or logo.',
        'Zone System black-and-white photograph of a bull moose standing in a river at dawn, water droplets falling from its antlers in silver highlights, mist in middle greys, dark pines behind. No text or logo.',
      ],
    },
    'SP01-048': {
      dna: nat({
        aesthetic:
          'Field macro photography: a 100 mm macro lens at 1:1 in nature, with a paper-thin plane of focus and a soft diffused flash revealing a tiny world.',
        color_and_tone:
          'Vivid true color on the subject, background dissolved into soft color washes.',
        lighting_and_shadow:
          'Diffused flash or ring light close to the subject, balanced with ambient light for the background.',
        texture_and_material:
          'Compound eyes, hairs, scales, dew drops and pollen resolved at life size or larger.',
        camera_and_composition:
          'Very shallow depth of field on the eyes or one key detail, subject filling the frame, eye-level with the creature.',
        atmosphere_and_mood: 'Intimate and strange, a small alien world seen at its own scale.',
        rendering_and_quality:
          'Crisp focal plane with creamy falloff; no wide-angle view and no blurry subject.',
        key_features:
          '1:1 magnification; paper-thin focus on the eyes; diffused macro flash; dew and scale detail; creamy background',
      }),
      avoid: [...AVOID, 'wide angle', 'blurry subject'],
      briefs: [
        'Macro photograph of a jumping spider on a mossy stone staring straight into the lens with its four large front eyes, diffused flash catch-lights in each eye, paper-thin focus, soft green background. No text or logo.',
        'Macro photograph of a small snail climbing the dew-beaded rim of a red toadstool, focus on its eye stalks, the forest dissolved into amber blur. No text or logo.',
        'Macro photograph of the iridescent wing scales of a moth, overlapping like tiles of copper and violet, one row sharp and the rest melting into soft color. No text or logo.',
      ],
    },
    'SP01-053': {
      dna: nat({
        aesthetic:
          'Wildlife field photography: a 500–600 mm lens from a hide or low position, patient observation of a wild animal behaving naturally in its habitat.',
        color_and_tone: 'Natural muted habitat color, warm low-sun highlights, creamy background.',
        lighting_and_shadow:
          'Early or late low sun, backlight or side light for rim on fur and feathers, breath visible in cold air.',
        texture_and_material:
          'Individual hairs, feathers, wet fur, snow and water spray crisp on the animal.',
        camera_and_composition:
          'Eye-level with the animal, telephoto compression, blurred foreground grass or snow, animal looking or moving into space.',
        atmosphere_and_mood:
          'Patient and respectful, an unguarded wild moment witnessed from a distance.',
        rendering_and_quality:
          'Field-magazine sharpness with natural color; no zoo bars, collars or tame poses.',
        key_features:
          '600 mm telephoto; eye-level with the animal; low-sun rim light; blurred foreground; natural behavior',
      }),
      avoid: [...AVOID, 'zoo', 'cage', 'collar'],
      briefs: [
        'Wildlife photograph of a grey wolf pausing in deep snow at the edge of a pine forest, breath steaming in low sun, snow crystals on its muzzle, 600 mm, blurred snowy foreground. No text or logo.',
        'Wildlife photograph of a brown bear at the lip of a waterfall catching a leaping salmon in its jaws, spray backlit gold, telephoto compression. No text or logo.',
        'Wildlife photograph of a pair of cranes dancing with wings raised in a misty marsh at sunrise, eye-level from a hide, reeds blurred in the foreground. No text or logo.',
      ],
    },
    'SP01-054': {
      dna: nat({
        aesthetic:
          'Deep-sky astrophotography: a tracked telescope and hours of stacked exposures revealing nebulae, galaxies, comets and planets against black space.',
        color_and_tone:
          'Hydrogen reds and magentas, oxygen teals, blue reflection nebula, pure black background with pinpoint stars of varied color.',
        lighting_and_shadow:
          'Only emitted and reflected starlight; faint structures stretched from the dark background.',
        texture_and_material:
          'Wispy gas filaments, dark dust lanes and pillars, round sharp stars with faint diffraction spikes.',
        camera_and_composition:
          'Telescope framing with the object centered or on a diagonal, no ground or horizon.',
        atmosphere_and_mood: 'Cosmic and silent, vast distance rendered as quiet structure.',
        rendering_and_quality:
          'Clean stacked-image look: low noise, no star trails, no painted glow; a ground subject belongs to Milky Way Nightscape instead.',
        key_features:
          'telescope deep-sky view; emission reds and oxygen teals; dust pillars; pinpoint stars; black background',
      }),
      avoid: [...AVOID, 'daylight', 'star trails', 'landscape horizon'],
      briefs: [
        'Deep-sky astrophotograph of a glowing emission nebula with a tall dark dust pillar at its center, hydrogen red and oxygen teal gas, pinpoint stars with fine diffraction spikes on black. No text or logo.',
        'Deep-sky astrophotograph of a bright comet with a long straight blue ion tail and a curved golden dust tail crossing a field of faint stars. No text or logo.',
        'High-resolution telescope photograph of the Moon at its terminator, long shadows filling craters along the line between day and night, grey highlands sharp against black. No text or logo.',
      ],
    },
    'SP01-055': {
      dna: nat({
        aesthetic:
          'Underwater photography: a wide-angle lens in a dome housing in clear water, with sun rays, caustics and blue-green depth shaping everything.',
        color_and_tone:
          'Cyan and deep blue water, color falling off with distance, warm reds only close to the lens or strobe.',
        lighting_and_shadow:
          'Sunbeams from the surface, rippling caustics on subjects and sand, optional strobe fill in the foreground.',
        texture_and_material:
          'Suspended particles, bubbles, drifting hair and fabric, coral and weed moving slowly.',
        camera_and_composition:
          "Upward or level angles toward the surface, subject weightless, snell's window or sun burst when looking up.",
        atmosphere_and_mood: 'Silent and weightless, slow drifting calm in blue space.',
        rendering_and_quality: 'Real underwater optics with distance haze; no dry studio light.',
        key_features:
          'sun rays from the surface; caustic ripples; blue distance falloff; weightless subject; dome wide angle',
      }),
      avoid: [...AVOID, 'dry studio light', 'harsh land lighting'],
      briefs: [
        'Underwater photograph of a giant manta ray gliding over a sunken stone temple overgrown with coral, sun rays slanting through blue water, caustics rippling on the carved steps. No text or logo.',
        'Underwater photograph of an adult freediver descending head-first along a towering kelp forest, sunbeams through the fronds, her silhouette against the bright surface. No text or logo.',
        "Underwater photograph of a wrecked ship's carved figurehead covered in coral and anemones, a school of silver fish swirling past, blue haze behind. No text or logo.",
      ],
    },
    'SP01-065': {
      dna: nat({
        aesthetic:
          'Pet photography: companion animals photographed at their own eye level, with a fast lens and patient timing that capture personality.',
        color_and_tone:
          'Warm, bright, friendly color; soft background tones that flatter the coat.',
        lighting_and_shadow:
          'Soft window or open shade light, catch-lights in the eyes, gentle backlight on fur.',
        texture_and_material: 'Fur, whiskers, wet noses and feathers crisp; home textures soft.',
        camera_and_composition:
          "Camera down at the animal's eye level, 35–85 mm, focus on the nearest eye, expressive head tilt or motion.",
        atmosphere_and_mood: 'Playful and affectionate, full of character and warmth.',
        rendering_and_quality:
          'Warm portrait finish with sharp eyes; never menacing unless the prompt asks.',
        key_features:
          'animal eye level; sharp nearest eye; soft window light; personality moment; warm friendly color',
      }),
      avoid: [...AVOID, 'menacing', 'fake wildlife pose'],
      briefs: [
        "Pet photograph at eye level of a shaggy grey wolfhound resting its long head on the armored knee of an adult knight sitting by a hearth, soft firelight catch-lights in the dog's eyes, warm tones. No text or logo.",
        "Pet photograph of a black kitten pouncing on a falling leaf in a walled castle garden, frozen mid-leap at the kitten's eye level, soft afternoon light. No text or logo.",
        'Pet photograph of an old grey-muzzled hound asleep on a sheepskin by a cottage window, one eye half open toward the lens, soft window light. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Bird-in-Flight Telephoto',
      domain: 'bird in flight photography',
      tags: ['birds', 'telephoto', 'wildlife'],
      dna: nat({
        aesthetic:
          'Bird-in-flight photography: a 600 mm lens tracking a flying bird at 1/4000 s, wings frozen at full extension.',
        color_and_tone:
          'Clean sky or blurred habitat background, natural plumage color with low-sun warmth.',
        lighting_and_shadow:
          'Low sun lighting the underwing or backlighting translucent flight feathers.',
        texture_and_material:
          'Every primary feather separated, water drops or snow frozen as they fall.',
        camera_and_composition:
          'Bird filling a third of the frame with space ahead of it, eye sharp, clean uncluttered background.',
        atmosphere_and_mood: 'Soaring and powerful, motion stopped at its most elegant instant.',
        rendering_and_quality:
          'Tack-sharp eye and feathers against smooth background; no motion blur on the bird.',
        key_features:
          'wings fully spread; 1/4000 s freeze; space ahead of the bird; backlit flight feathers; clean background',
      }),
      avoid: [...PHOTO, 'perched bird', 'motion-blurred bird'],
      briefs: [
        'Bird-in-flight photograph of a golden eagle braking above a snowy ridge with talons out and wings fully spread, every primary feather separated, snow blowing off the ridge below. No text or logo.',
        'Bird-in-flight photograph of a great blue heron lifting off a misty pond, a string of water drops frozen falling from its feet, low sun through its wing feathers. No text or logo.',
        'Bird-in-flight photograph of a snowy owl gliding low over a winter field at dusk, wings at full span, yellow eyes sharp, the field a smooth grey-blue blur. No text or logo.',
      ],
    },
    {
      name: 'Camera-Trap Night Flash',
      domain: 'remote camera trap',
      tags: ['camera-trap', 'wildlife', 'flash'],
      dna: nat({
        aesthetic:
          'Camera-trap photography: a remote wide-angle camera low to the ground, fired by an animal crossing its beam at night with a flash close by.',
        subject_treatment: viewpoint,
        color_and_tone:
          'Flash-bright subject, surroundings falling to black, slightly cool flash color.',
        lighting_and_shadow:
          'Off-camera flash from one side a meter away, hard shadow behind the animal, quick falloff into night.',
        texture_and_material:
          'Fur and eyes vivid, eye-shine from the flash, dew and leaf litter crisp in the foreground.',
        camera_and_composition:
          'Camera at ground level with a wide lens, animal close and unaware, sometimes slightly cut off at the edge.',
        atmosphere_and_mood:
          'Secret and wild, a glimpse of a nocturnal life no one was there to see.',
        rendering_and_quality:
          'Real remote-camera look with some noise; no studio polish or posed animal.',
        key_features:
          'ground-level wide angle; close off-camera night flash; eye-shine; black background; unaware animal',
      }),
      avoid: [...PHOTO, 'daylight', 'posed animal'],
      briefs: [
        'Camera-trap photograph of a lynx stepping over a mossy log at night, caught by a side flash at ground level, eye-shine glowing, the forest behind falling to black. No text, timestamp or logo.',
        'Camera-trap photograph of a badger family emerging from a sett between tree roots, wide angle from the ground, flash-lit fur, dark wood beyond. No text, timestamp or logo.',
        'Camera-trap photograph of a wild boar sniffing curiously at the lens in the doorway of a ruined chapel at night, tusks flash-lit, arches dark behind. No text, timestamp or logo.',
      ],
    },
    {
      name: 'Long-Exposure Seascape',
      domain: 'long-exposure coastal photography',
      tags: ['seascape', 'long-exposure', 'nature'],
      dna: nat({
        aesthetic:
          'Long-exposure seascape: a tripod and dense ND filter stretching the exposure to thirty seconds or more, turning moving sea into mist and silk around still rocks.',
        color_and_tone: 'Soft pastel dusk or cool grey-blue, smooth gradients, dark wet rocks.',
        lighting_and_shadow: 'Low light at dawn or dusk; soft sky light, no hard shadows.',
        texture_and_material:
          'Water smoothed to mist, clouds streaked, rocks and structures sharp and textured.',
        camera_and_composition:
          'Low tripod near the waterline, a strong foreground rock or structure, leading lines into the smooth sea.',
        atmosphere_and_mood: 'Meditative and calm, time made visible as silence.',
        rendering_and_quality: 'Clean long exposure without noise; no frozen splashing waves.',
        key_features:
          'silky misted water; streaked clouds; sharp still rocks; low tripod foreground; pastel dusk',
      }),
      avoid: [...PHOTO, 'frozen splash', 'harsh noon sun'],
      briefs: [
        'Long-exposure seascape photograph of three sea stacks at dusk, the sea smoothed to white mist around their bases, clouds streaking across a pastel sky, sharp barnacled rocks in the foreground. No text or logo.',
        'Long-exposure photograph of a broken stone jetty leading out into a misty grey sea, water around the stones turned to silk, a lone mooring post at the end. No text or logo.',
        'Long-exposure photograph of the toppled stone head of a giant statue on a black sand beach, waves washing around it as soft white veils, blue dawn light. No text or logo.',
      ],
    },
    {
      name: 'Milky Way Nightscape',
      domain: 'wide-field night landscape',
      tags: ['nightscape', 'milky-way', 'nature'],
      dna: nat({
        aesthetic:
          'Milky Way nightscape: a wide fast lens on a tripod capturing the galactic core arching over a landscape subject, stars as points, not trails.',
        color_and_tone:
          'Deep blue-black sky, warm dusty core of the Milky Way, faint green airglow, landscape in cool dim tones.',
        lighting_and_shadow:
          'Starlight and faint airglow; foreground softly lit by a low-level light or a glowing tent or window.',
        texture_and_material: 'Dense star fields, dark dust lanes, silhouetted terrain edges.',
        camera_and_composition:
          '14–24 mm, landscape subject in the lower third, the arch or band of the Milky Way rising above it.',
        atmosphere_and_mood: 'Awestruck and quiet, a small earth under an enormous sky.',
        rendering_and_quality: 'Clean high-ISO exposure, pinpoint stars, no painted galaxies.',
        key_features:
          'Milky Way arch over land; pinpoint stars; landscape in lower third; faint airglow; wide fast lens',
      }),
      avoid: [...PHOTO, 'star trails', 'painted galaxy'],
      briefs: [
        'Milky Way nightscape photograph of the galactic arch rising over a roofless ruined keep on a hill, the keep faintly lit by low warm light, stars as sharp points, green airglow at the horizon. No text or logo.',
        'Milky Way nightscape photograph of a stone dolmen on a moor with the dusty core of the Milky Way standing vertically behind it, cool starlit heather in the foreground. No text or logo.',
        'Milky Way nightscape photograph of a still mountain tarn reflecting the Milky Way, a small tent glowing orange on the shore where an adult camper sits. No text or logo.',
      ],
    },
    {
      name: 'Supercell Storm Landscape',
      domain: 'severe weather photography',
      tags: ['storm', 'weather', 'nature'],
      dna: nat({
        aesthetic:
          'Storm photography: a wide lens capturing the structure of a severe storm — rotating supercells, shelf clouds and walls of rain or dust — towering over the land.',
        color_and_tone:
          'Bruised teal, slate and green-grey clouds, a band of warm light under the storm, dark wet ground.',
        lighting_and_shadow:
          'Low sun slipping under the cloud base, lighting the land while the sky is dark; lightning optional in the distance.',
        texture_and_material: 'Striated cloud layers, rain shafts, blowing dust and bending crops.',
        camera_and_composition:
          '16–24 mm, low horizon, storm filling two thirds of the frame, a small structure or figure for scale.',
        atmosphere_and_mood: 'Ominous and awe-struck, a wall of weather advancing slowly.',
        rendering_and_quality: 'Natural contrast with detailed cloud structure; no HDR halos.',
        key_features:
          'rotating supercell or shelf cloud; low horizon; light under the cloud base; small scale marker; rain or dust walls',
      }),
      avoid: [...PHOTO, 'clear blue sky', 'HDR halos'],
      briefs: [
        'Storm photograph of a rotating supercell with striated flanks towering over golden wheat fields, a band of low sun lighting a lone farmhouse under the dark cloud base, 16 mm. No text or logo.',
        'Storm photograph of a shelf cloud rolling in from the sea over a coastal fortress, the fortress lit by the last sun while the sky above turns slate teal, rain shafts behind. No text or logo.',
        'Storm photograph of a towering wall of dust approaching a desert caravanserai, the courtyard still in sunlight, camels tiny against the brown-red wall. No text or logo.',
      ],
    },
    {
      name: 'Intimate Forest Landscape',
      domain: 'intimate woodland photography',
      tags: ['forest', 'intimate-landscape', 'nature'],
      dna: nat({
        aesthetic:
          'Intimate forest landscape: a medium telephoto picking a small, quiet composition out of woodland under soft overcast light, with no sky in the frame.',
        color_and_tone:
          'Saturated but subtle moss greens, bark greys and autumn reds; glare removed by a polarizer.',
        lighting_and_shadow:
          'Even overcast or fog light, no hard shadows, gentle luminosity in wet leaves.',
        texture_and_material:
          'Moss, bark, ferns, wet stone and fallen leaves resolved with rich texture.',
        camera_and_composition:
          '70–200 mm, no sky, a pattern of trunks or roots with one subtle focal point, compressed layers.',
        atmosphere_and_mood: 'Contemplative and hushed, the quiet interior of the woods.',
        rendering_and_quality:
          'Polarized, glare-free overcast color; no grand vistas or sunbursts.',
        key_features:
          'no sky; overcast polarized color; trunk and root patterns; one quiet focal point; moss and wet texture',
      }),
      avoid: [...PHOTO, 'sky', 'sunburst', 'grand vista'],
      briefs: [
        'Intimate forest photograph of moss-covered beech roots twisting over dark wet stones after rain, no sky, polarized overcast color, one bright yellow leaf as the focal point. No text or logo.',
        'Intimate forest photograph of a cluster of white birch trunks rising out of deep red autumn undergrowth, compressed with a telephoto, fog softening the rows behind. No text or logo.',
        'Intimate forest photograph of a hidden spring welling up among ferns and mossy boulders, the water dark and clear, overcast even light. No text or logo.',
      ],
    },
    {
      name: 'Backlit Botanical',
      domain: 'backlit plant photography',
      tags: ['botanical', 'backlight', 'nature'],
      dna: nat({
        aesthetic:
          'Backlit botanical photography: petals, leaves and seeds shot against the sun or a bright source so their veins and translucency glow.',
        color_and_tone:
          'Glowing translucent greens, reds and golds against a dark or softly bright background.',
        lighting_and_shadow:
          'Strong backlight through the plant, a rim of light on hairs and edges, dark negative space.',
        texture_and_material:
          'Veins, cell patterns, fine hairs and seeds rendered luminous and precise.',
        camera_and_composition:
          'Macro or close-up, the plant against a darker background, shallow depth with glowing bokeh.',
        atmosphere_and_mood: 'Delicate and radiant, fragile living structures lit from within.',
        rendering_and_quality: 'Clean highlights without clipping in the glowing tissue.',
        key_features:
          'light through leaves and petals; glowing veins; rim-lit hairs; dark background; shallow bokeh',
      }),
      avoid: [...PHOTO, 'front flash', 'flat lighting'],
      briefs: [
        'Backlit botanical photograph of a dandelion seed head against the low sun, every seed and filament glowing white, the background a dark bokeh of golden spots. No text or logo.',
        'Backlit botanical photograph of a single red maple leaf held up to the sun, the vein network glowing like stained glass against a dark forest. No text or logo.',
        'Backlit botanical photograph of translucent poppy petals catching the sun from behind, crumpled silk texture glowing orange, dark stem shadows. No text or logo.',
      ],
    },
    {
      name: 'High-Key Snow Wildlife',
      domain: 'high-key white wildlife',
      tags: ['high-key', 'snow', 'wildlife'],
      dna: nat({
        aesthetic:
          'High-key snow wildlife: an animal in snow or fog exposed two stops bright so the world goes almost pure white and only eyes, nose or dark feathers remain.',
        color_and_tone:
          'Near-white field with barely visible texture, small dark accents, very low contrast elsewhere.',
        lighting_and_shadow:
          'Flat overcast snow light from the whole sky, leaving almost no shadow anywhere.',
        texture_and_material: 'Faint fur and snow texture, falling flakes as soft grey dots.',
        camera_and_composition:
          'Telephoto, animal small or partly hidden in a vast white field, lots of negative space.',
        atmosphere_and_mood: 'Minimal and serene, quiet life almost erased by winter.',
        rendering_and_quality: 'Bright exposure without grey mud or blue cast in the whites.',
        key_features:
          'overexposed white field; dark eyes and nose as accents; huge negative space; flat snow light; minimal',
      }),
      avoid: [...PHOTO, 'grey muddy snow', 'dark background'],
      briefs: [
        'High-key photograph of an arctic fox curled in a snowdrift, the whole frame almost pure white, only its dark eyes and nose and a faint outline of fur visible. No text or logo.',
        'High-key photograph of a white ermine peeking out of a snowbank with its black tail tip showing, snowflakes falling as soft grey dots. No text or logo.',
        'High-key photograph of a black raven walking across fresh snow, a stark dark mark in a vast bright white field, faint footprints behind it. No text or logo.',
      ],
    },
    {
      name: 'Low-Key Rim-Lit Wildlife',
      domain: 'low-key wildlife',
      tags: ['low-key', 'rim-light', 'wildlife'],
      dna: nat({
        aesthetic:
          'Low-key rim-lit wildlife: an animal emerging from deep shadow, exposed for a thin backlit rim so most of the frame stays black.',
        color_and_tone:
          'Black background, warm or silver rim highlights, a little color in the lit edge.',
        lighting_and_shadow:
          'Backlight or strong side light against a dark background; fur, whiskers and breath glowing.',
        texture_and_material: 'Rim-lit hairs, whiskers, breath vapor or dust as bright lines.',
        camera_and_composition:
          'Telephoto, animal partly hidden in darkness, eye or profile catching light.',
        atmosphere_and_mood: 'Dramatic and mysterious, a powerful creature half revealed.',
        rendering_and_quality:
          'Clean noiseless blacks with the thin rim highlights fully protected from clipping.',
        key_features:
          'black background; thin rim light on fur; breath or dust glowing; partial reveal; telephoto',
      }),
      avoid: [...PHOTO, 'bright background', 'flat light'],
      briefs: [
        'Low-key wildlife photograph of a lion lifting its head out of deep shadow, only the rim of its mane and whiskers lit gold by a low sun behind, the rest of the frame black. No text or logo.',
        'Low-key wildlife photograph of a red stag in a dark forest at dawn, its breath steaming and its antlers outlined in silver backlight against black. No text or logo.',
        'Low-key wildlife photograph of a silverback gorilla in dense shade, a single shaft of light catching the silver hair on its back and one watchful eye. No text or logo.',
      ],
    },
    {
      name: 'Focus-Stacked Specimen',
      domain: 'focus-stacked specimen photography',
      tags: ['focus-stacking', 'specimen', 'macro'],
      dna: nat({
        aesthetic:
          'Focus-stacked specimen photography: dozens of macro frames merged so a small specimen is sharp from front to back on a clean white or black background.',
        color_and_tone:
          'Accurate neutral color, clean white or black ground, subtle iridescence where present.',
        lighting_and_shadow:
          'Diffused dome lighting from all sides, minimal shadow, no hot spots on shiny shells.',
        texture_and_material:
          'Every hair, facet, pore and ridge resolved across the whole depth of the specimen.',
        camera_and_composition:
          'Specimen centered, straight lateral or dorsal view, generous clean margin.',
        atmosphere_and_mood: 'Precise and scientific, wonder through exhaustive clarity.',
        rendering_and_quality: 'Museum-plate clarity with no blurred planes and no stacking halos.',
        key_features:
          'front-to-back sharpness; clean white or black ground; diffused dome light; centered specimen; scientific view',
      }),
      avoid: [...PHOTO, 'shallow depth of field', 'habitat background'],
      briefs: [
        'Focus-stacked specimen photograph of a stag beetle on pure white, sharp from its antler-like jaws to the tip of its wing cases, every tarsal hair resolved, diffused dome light. No labels, text or logo.',
        'Focus-stacked specimen photograph of the head of a praying mantis on black, compound eyes and mouthparts sharp across their full depth, green iridescence. No text or logo.',
        'Focus-stacked specimen photograph of a sectioned chambered nautilus shell on white, the spiral chambers sharp from edge to center, soft even light. No text or logo.',
      ],
    },
    {
      name: 'Nature Abstract Pattern',
      domain: 'abstract nature detail',
      tags: ['abstract', 'pattern', 'nature'],
      dna: nat({
        aesthetic:
          'Nature abstract photography: a tight crop on a natural surface — ice, sand, bark, rock, water — until it reads as pure pattern and color.',
        color_and_tone:
          'Limited palette from the material itself; contrast pushed just enough to make the pattern sing.',
        lighting_and_shadow:
          'Raking light or overcast diffusion, chosen to reveal relief or translucency.',
        texture_and_material:
          'Repetition, fractures, ripples and layers rendered with full detail.',
        camera_and_composition:
          'Flat-on or tight telephoto, no horizon and no recognizable scale, pattern filling the frame edge to edge.',
        atmosphere_and_mood: 'Meditative and mysterious, the world made into its own abstraction.',
        rendering_and_quality: 'Sharp real texture; not a digital generated pattern.',
        key_features:
          'edge-to-edge natural pattern; no horizon or scale; raking light on relief; limited material palette; tight crop',
      }),
      avoid: [...PHOTO, 'horizon', 'wide scenic view'],
      briefs: [
        'Nature abstract photograph of white air bubbles frozen in stacked layers inside black lake ice, the pattern filling the frame edge to edge, no scale cues. No text or logo.',
        'Nature abstract photograph of wind-rippled sand streaked with black iron grains, raking low light carving the ripples into rhythmic bands. No text or logo.',
        'Nature abstract photograph of peeling paperbark tree bark in curling layers of cream, rust and pink, tight telephoto crop. No text or logo.',
      ],
    },
    {
      name: 'Animal-in-Habitat Wide Angle',
      domain: 'wide-angle wildlife',
      tags: ['wide-angle', 'habitat', 'wildlife'],
      dna: nat({
        aesthetic:
          'Wide-angle wildlife: a remote-triggered or very close wide lens placing the animal large in the foreground with its whole habitat stretching behind.',
        subject_treatment: viewpoint,
        color_and_tone: 'Natural daylight color with a bright sky and a well-exposed animal.',
        lighting_and_shadow:
          'Soft daylight or low sun with fill so the animal and landscape are both detailed.',
        texture_and_material: 'Fur or feathers crisp up close; landscape receding in deep focus.',
        camera_and_composition:
          '16–24 mm very close to the animal, low angle, deep depth of field showing sky and horizon.',
        atmosphere_and_mood: 'Intimate yet expansive, the animal inside its whole world.',
        rendering_and_quality:
          'Natural wide-angle perspective with mild edge stretch; not telephoto compression.',
        key_features:
          'animal large and close; habitat stretching behind; low wide angle; deep focus; visible sky',
      }),
      avoid: [...PHOTO, 'telephoto compression', 'blurred background'],
      briefs: [
        'Wide-angle wildlife photograph of a puffin standing a hand-width from the lens on a clifftop, a beak full of silver fish, the sea and seabird cliffs stretching behind under a bright sky. No text or logo.',
        'Wide-angle wildlife photograph of a shaggy musk ox close to the lens on a tundra ridge, its herd and a vast snowy valley behind in deep focus. No text or logo.',
        'Wide-angle wildlife photograph of a brown hare sitting up in a meadow close to the lens, a ruined castle on the hill behind it, low evening sun. No text or logo.',
      ],
    },
    {
      name: 'Minimalist Fog Landscape',
      domain: 'minimal fog landscape',
      tags: ['minimalist', 'fog', 'landscape'],
      dna: nat({
        aesthetic:
          'Minimalist fog landscape: a single simple element isolated in thick fog, with most of the frame left as empty pale space.',
        color_and_tone:
          'Soft grey, cream or pale blue, very low contrast, one dark shape as the anchor.',
        lighting_and_shadow: 'Diffused fog light, no shadows, gradual fading of distant objects.',
        texture_and_material:
          'Fog gradients, faint distant forms, crisp detail only on the nearest element.',
        camera_and_composition:
          'Small subject placed off-center in large negative space, horizon dissolved or absent.',
        atmosphere_and_mood: 'Quiet and solitary, the world reduced to one line.',
        rendering_and_quality:
          'Smooth fog gradients without banding, and no busy detail competing with the anchor.',
        key_features:
          'one element in fog; vast negative space; low-contrast pale palette; dissolving distance; off-center anchor',
      }),
      avoid: [...PHOTO, 'busy detail', 'clear sky'],
      briefs: [
        'Minimalist fog photograph of a single leafless oak standing in a pale field, the fog erasing the horizon, the tree a small dark shape off-center in soft grey space. No text or logo.',
        'Minimalist fog photograph of a row of old fence posts receding into thick fog, each fainter than the last until they vanish. No text or logo.',
        'Minimalist fog photograph of a lone wooden rowboat moored on a white fog-covered lake, the water and sky indistinguishable. No text or logo.',
      ],
    },
    {
      name: 'Blackwater Night Dive',
      domain: 'blackwater night diving',
      tags: ['blackwater', 'underwater', 'macro'],
      dna: nat({
        aesthetic:
          'Blackwater photography: open ocean at night, with tiny drifting larvae and gelatinous creatures lit by a narrow strobe against total black.',
        color_and_tone:
          'Pure black background, translucent bodies with iridescent blue, orange and violet accents.',
        lighting_and_shadow:
          'Snooted strobe from the side, lighting only the creature; no ambient light.',
        texture_and_material:
          'Transparent tissue, glowing organs, fine cilia and fins resolved crisply.',
        camera_and_composition:
          'Macro lens, creature centered and floating, no seabed or surface visible.',
        atmosphere_and_mood: 'Alien and fragile, strange life drifting through the void.',
        rendering_and_quality:
          'Clean black water with no backscatter; not the sunlit blue of daytime underwater.',
        key_features:
          'total black water; snooted strobe; translucent larvae; iridescent accents; floating macro subject',
      }),
      avoid: [...PHOTO, 'sunlit blue water', 'backscatter'],
      briefs: [
        'Blackwater night-dive photograph of a translucent larval squid drifting in total black water, its tiny chromatophores glowing orange and violet under a snooted strobe. No text or logo.',
        'Blackwater photograph of a larval flatfish with a long ribbon-like fin floating in the dark, its transparent body revealing a silver gut, crisp strobe light. No text or logo.',
        'Blackwater photograph of a comb jelly with rainbow bands of cilia shimmering along its body against pure black. No text or logo.',
      ],
    },
  ],
};

export default spec;
