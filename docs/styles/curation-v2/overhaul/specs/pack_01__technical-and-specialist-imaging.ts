import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'fake UI text',
  'readable timestamp',
  'random sci-fi overlay',
  'cinematic beauty lighting',
  'generic stock-photo face',
  'celebrity likeness',
];

// Technical presets apply a capture technique; they change the image signal, not the subject.
const capture =
  'Keep the prompt subject, action and setting; change only the capture technique described here, so the subject reads clearly through it.';
const profile = (what: string) =>
  `Keep the prompt subject and action; this preset owns ${what}, and the setting stays the prompt's.`;

function tech(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? capture, ...rest } as Dna;
}

const PHOTO = [
  'illustration',
  'painting',
  'drawing',
  'cartoon',
  'anime',
  'plastic render',
  ...AVOID,
];

const spec: Spec = {
  pack: 'pack_01',
  category: '7. Technical And Specialist Imaging',
  updates: {
    'SP01-025': {
      dna: tech({
        aesthetic:
          'CCTV security capture: a fixed camera high in a corner recording low-resolution, compressed surveillance frames, often in infrared monochrome at night.',
        subject_treatment: profile('the high fixed corner viewpoint and the surveillance signal'),
        color_and_tone:
          'Washed grey-green or infrared monochrome at night, desaturated cool color by day, crushed blacks, blown lamps.',
        lighting_and_shadow:
          "Existing ceiling lights or the camera's own infrared illuminator; hot center, dark corners, glowing eyes under IR.",
        texture_and_material:
          'Blocky compression artifacts, soft low resolution, interlaced motion smear on moving figures, slight lens dirt.',
        camera_and_composition:
          'Ceiling-corner angle looking down, wide lens with barrel distortion, subject small and off-center, no framing intent.',
        atmosphere_and_mood:
          'Cold and voyeuristic, an indifferent machine watching without caring.',
        rendering_and_quality:
          'Evidence-grade surveillance frame; any on-screen overlay stays abstract and unreadable, never text.',
        key_features:
          'high corner viewpoint; IR monochrome; compression blocks; wide barrel distortion; smeared motion',
      }),
      avoid: [...AVOID, 'hd', 'clean', 'artistic blur'],
      briefs: [
        'CCTV security frame from a high corner camera of a hooded adult thief lifting a jeweled chalice from a museum plinth at night, infrared monochrome, glowing eyes, fisheye distortion, blocky compression. No readable timestamp, text or logo.',
        'CCTV frame from a ceiling camera of an adult figure in a long cloak walking down a torchlit castle corridor, low resolution, torches blown white, motion smear on the cloak. No readable text or logo.',
        'CCTV frame in infrared of a grey wolf trotting through a deserted vaulted stone hall at three in the morning, washed grey-green image, soft and compressed. No readable text or logo.',
      ],
    },
    'SP01-027': {
      dna: tech({
        aesthetic:
          'Dashcam capture: a small wide-angle camera behind a vehicle windshield recording the road ahead, bright and utilitarian.',
        subject_treatment: profile('the behind-the-windshield driver viewpoint'),
        color_and_tone:
          'Flat digital color, slightly oversharpened, headlight pools at night, clipped sky by day.',
        lighting_and_shadow:
          'Headlights and road light at night, harsh daylight otherwise; reflections of the dashboard on the glass.',
        texture_and_material:
          'Windshield dust, faint reflections, wiper streaks, compression softness in fast motion.',
        camera_and_composition:
          'Centered road perspective, hood edge or dashboard at the bottom, wide lens bowing the horizon.',
        atmosphere_and_mood:
          'Sudden and matter-of-fact, the unexpected appearing ahead without warning.',
        rendering_and_quality: 'Consumer dashcam realism; no readable speed or time overlay.',
        key_features:
          'behind-windshield view; hood or dash at bottom; headlight pools; glass reflections; wide bowed horizon',
      }),
      avoid: [...AVOID, 'portrait', 'studio', 'wet road reflections cliché'],
      briefs: [
        'Dashcam frame at night on a forest road as a giant stag with branching antlers leaps across the headlight beams, the hood edge at the bottom, dust on the windshield. No readable overlay, text or logo.',
        'Dashcam frame on a mountain pass as a white avalanche dust cloud pours across the road ahead in harsh daylight, dashboard reflection faint on the glass. No readable overlay, text or logo.',
        'Dashcam frame on a foggy country road at dusk, an adult figure in a white hooded cloak standing motionless at the roadside in the headlights. No readable overlay, text or logo.',
      ],
    },
    'SP01-028': {
      name: 'Ironbow Thermal Imaging',
      dna: tech({
        aesthetic:
          'Ironbow thermal imaging: a longwave infrared camera mapping temperature to a black-purple-red-orange-yellow-white palette, so heat, not light, defines the image.',
        color_and_tone:
          'Ironbow palette: cold areas deep indigo and purple, warm bodies orange, hottest points yellow-white.',
        lighting_and_shadow:
          'No visible light logic; shapes read by temperature, with heat bleeding softly into cold surroundings.',
        texture_and_material:
          'Surface detail replaced by smooth thermal gradients; breath, hot spots and cooling trails visible.',
        camera_and_composition:
          'Keep the requested framing; the thermal palette is the transferable part.',
        atmosphere_and_mood: 'Revealing and clinical, hidden heat made suddenly visible.',
        rendering_and_quality:
          'Radiometric camera look with soft low-resolution gradients; no UI crosshairs or readable scale.',
        key_features:
          'ironbow palette; heat as brightness; smooth thermal gradients; hot white peaks; no visible-light shading',
      }),
      avoid: [...AVOID, 'realistic colors', 'readable temperature scale'],
      briefs: [
        'Ironbow thermal image of an adult blacksmith hammering a blade on an anvil, the blade white-yellow hot, the smith glowing orange, the cold anvil and walls deep purple. No readable scale, text or logo.',
        "Ironbow thermal image of an adult rider dismounting after a hard gallop, heat pouring off the horse's flanks in orange and yellow plumes against a violet night field. No text or logo.",
        'Ironbow thermal image of a colony of bats roosting on a cave ceiling, each body a warm orange dot against purple stone, one flying bat trailing heat. No text or logo.',
      ],
    },
    'SP01-029': {
      dna: tech({
        aesthetic:
          'Scanning electron micrograph: a tiny specimen coated and scanned by an electron beam, rendered in greyscale with extreme depth and edge glow.',
        color_and_tone: 'Pure greyscale, bright rims on edges and ridges, dark hollows, no color.',
        lighting_and_shadow:
          'Detector-direction shading: edges facing the detector glow, recesses fall dark, a characteristic halo along every ridge.',
        texture_and_material:
          'Microscopic surface structure — pores, hairs, scales, crystals — sharp at enormous magnification.',
        camera_and_composition:
          'Specimen centered on a black or dark grey ground, deep depth of field, no lens bokeh.',
        atmosphere_and_mood: 'Alien and precise, familiar things revealed as strange landscapes.',
        rendering_and_quality:
          'SEM image quality with fine noise; no color tint unless the prompt asks for false color.',
        key_features:
          'greyscale electron image; glowing edge rims; enormous magnification; deep focus; dark ground',
      }),
      avoid: [...AVOID, 'color', 'optical macro bokeh'],
      briefs: [
        'Scanning electron micrograph of the head of an ant with open mandibles and compound eyes, glowing edge rims on every hair, greyscale, dark background. No scale bar text or logo.',
        'Scanning electron micrograph of the interlocking barbs of an owl feather, hooked barbules like a greyscale forest of combs, deep focus. No text or logo.',
        'Scanning electron micrograph of a diatom shell, its perforated glass lattice glowing at the edges in greyscale against black. No text or logo.',
      ],
    },
    'SP01-030': {
      dna: tech({
        aesthetic:
          'Space-telescope false-color imaging: narrowband exposures of gas mapped to gold, teal and blue channels, with sharp multi-spike stars.',
        color_and_tone:
          'Mapped palette: sulfur and hydrogen as gold and amber, oxygen as teal and blue; deep black space.',
        lighting_and_shadow:
          'Emission glow from within the gas; dark dust silhouetted against bright regions.',
        texture_and_material:
          'Sculpted gas walls, pillars and filaments at huge scale, stars with six- or eight-point diffraction spikes.',
        camera_and_composition: 'Scientific framing of the object, no horizon, no ground.',
        atmosphere_and_mood: 'Monumental and awe-struck, cosmic structures shown as sculpture.',
        rendering_and_quality:
          'Processed space-telescope image with mapped color; distinct from natural-color amateur astrophotography.',
        key_features:
          'gold-teal narrowband mapping; multi-point diffraction spikes; sculpted gas pillars; black space; scientific framing',
      }),
      avoid: [...AVOID, 'earth', 'ground', 'natural-color galaxy'],
      briefs: [
        'Space-telescope false-color image of towering gas pillars in a star-forming region, gold and amber walls edged in teal, newborn stars with eight-point diffraction spikes. No text or logo.',
        'Space-telescope false-color image of a planetary nebula shaped like a huge eye, teal inner shell and gold outer rings around a tiny white star. No text or logo.',
        'Space-telescope false-color image of two colliding galaxies pulling long tidal tails of blue stars and gold dust across black space. No text or logo.',
      ],
    },
    'SP01-058': {
      dna: tech({
        aesthetic:
          'Minimalist photography: one subject isolated in a large field of plain tone, with two or three colors and nothing else competing.',
        color_and_tone: 'Two or three flat tones, pale or dark ground, one contrasting accent.',
        lighting_and_shadow: 'Soft even light or a single clean shadow; no busy texture.',
        texture_and_material:
          'Surfaces simplified to flat planes; detail kept only on the subject.',
        camera_and_composition:
          'Subject small and placed on a third or at an edge, with at least two thirds negative space.',
        atmosphere_and_mood: 'Calm and spare, silence given as much weight as the subject.',
        rendering_and_quality: 'Clean photographic minimalism; no clutter, no heavy grading.',
        key_features:
          'single isolated subject; vast negative space; two or three tones; one accent color; clean edges',
      }),
      avoid: [...AVOID, 'busy', 'detailed background'],
      briefs: [
        'Minimalist photograph of a single red wooden door set in a vast whitewashed wall, the door small in the lower third, the white filling the rest of the frame. No text or logo.',
        'Minimalist photograph of a black crow perched on one bare branch entering from the frame edge, pale white sky filling everything else. No text or logo.',
        'Minimalist photograph of one dark sheep standing on the crest of a snow-covered hill, pale grey sky, the sheep a tiny mark near the bottom. No text or logo.',
      ],
    },
    'SP01-059': {
      dna: tech({
        aesthetic:
          'Abstract photography: intentional camera movement, extreme crops and reflections that dissolve a real subject into color, line and texture.',
        subject_treatment:
          'Start from the prompt subject and setting, then abstract them on purpose through motion, crop or reflection until form becomes secondary to color and line.',
        color_and_tone: 'Bold, saturated or strongly contrasting color taken from the subject.',
        lighting_and_shadow: 'Light used as streaks, glints and reflections rather than modeling.',
        texture_and_material:
          'Motion streaks, rippled reflections, macro surface detail filling the frame.',
        camera_and_composition:
          'No clear horizon or scale, full-frame pattern, a single dominant direction of movement.',
        atmosphere_and_mood: 'Experimental and vivid, feeling carried by color alone.',
        rendering_and_quality: 'In-camera abstraction; not a digital filter or generated fractal.',
        key_features:
          'intentional camera movement; extreme crop; rippled reflections; color over form; no scale',
      }),
      avoid: [...AVOID, 'digital fractal', 'clearly posed subject'],
      briefs: [
        'Abstract photograph of a birch forest made with a vertical intentional camera movement, the white trunks and gold leaves streaked into soft vertical ribbons of color. No text or logo.',
        'Abstract photograph in extreme close-up of an oil film on dark water, swirling rainbow bands of magenta, gold and cyan filling the frame. No text or logo.',
        'Abstract photograph of stained-glass colors reflected in rippling water under a chapel window, broken into trembling shards of red, blue and gold. No text or logo.',
      ],
    },
    'SP01-072': {
      dna: tech({
        aesthetic:
          'Tilt-shift miniature: a tilted lens plane from a high vantage point so only a thin band is sharp, making real scenes look like toy models.',
        color_and_tone: 'Slightly boosted saturation and contrast that make surfaces look painted.',
        lighting_and_shadow: 'Bright daylight with clear small shadows, like a lit model table.',
        texture_and_material: 'Sharp band of detail across the middle; heavy blur above and below.',
        camera_and_composition:
          'High downward angle, thin horizontal or diagonal focus band on the subject, strong blur fading to top and bottom.',
        atmosphere_and_mood: 'Playful and toy-like, a busy world shrunk to a tabletop.',
        rendering_and_quality:
          'Optical tilt blur with a clean gradient; not a straight top-down drone view.',
        key_features:
          'thin tilted focus band; high vantage; blur top and bottom; boosted toy-like color; small crisp shadows',
      }),
      avoid: [...AVOID, 'sharp everywhere', 'eye-level view'],
      briefs: [
        'Tilt-shift miniature photograph from a castle tower of a medieval tournament below, jousting knights, tents and crowds in a thin sharp band, everything above and below blurred, toy-like color. No text or logo.',
        'Tilt-shift photograph of a fishing harbor from a cliff, painted boats and stacked crates in the sharp band, the sea and houses melting into blur. No text or logo.',
        'Tilt-shift photograph of a village harvest with haystacks, carts and tiny adult workers in a golden field, a thin diagonal focus band, bright daylight. No text or logo.',
      ],
    },
    'SP01-073': {
      dna: tech({
        aesthetic:
          'Long-exposure water modifier: a slow shutter of one to thirty seconds that turns any moving water in the scene into silk, mist or glass.',
        color_and_tone: 'Cool blues and greys, soft pastel highlights, natural color elsewhere.',
        lighting_and_shadow: 'Overcast or low light allowing long exposure; no hard sun glare.',
        texture_and_material:
          'Moving water smoothed to veils and mist; still stone, wood and metal kept sharp and textured.',
        camera_and_composition:
          'Keep the requested framing; the camera is tripod-still, so only moving water changes.',
        atmosphere_and_mood: 'Calm and timeless, motion softened into quiet flow.',
        rendering_and_quality:
          'Clean long-exposure look; applies to fountains, mills and rivers, not only seascapes.',
        key_features:
          'silky moving water; sharp still surroundings; tripod stillness; cool overcast tones; misted flow',
      }),
      avoid: [...AVOID, 'frozen droplets', 'jagged flow'],
      briefs: [
        'Long-exposure photograph of a tiered stone fountain in a castle courtyard, the falling water turned to smooth white silk, moss on the basin sharp. No text or logo.',
        'Long-exposure photograph of a timber mill wheel in a stream, the water pouring off its paddles as soft white veils, the wheel and stone race crisp. No text or logo.',
        'Long-exposure photograph of a stepped river weir below an old stone bridge, the water flowing over each step as misted glass under an overcast sky. No text or logo.',
      ],
    },
    'SP01-074': {
      dna: tech({
        aesthetic:
          'Brenizer bokeh panorama: dozens of frames at f/1.4 stitched together, giving a wide field of view with the shallow depth of a telephoto portrait.',
        subject_treatment: profile('the stitched wide field of view and shallow depth'),
        color_and_tone:
          'Natural vibrant color, warm subject, creamy color washes in the background.',
        lighting_and_shadow: 'Soft natural light, often golden hour or open shade.',
        texture_and_material:
          'Sharp subject, very large smooth bokeh behind, gentle swirl toward the edges.',
        camera_and_composition:
          'Environmental wide frame with the subject small to medium in the middle, background melted despite the wide view.',
        atmosphere_and_mood:
          'Dreamy and intimate, a quiet figure inside a softly dissolving world.',
        rendering_and_quality:
          'Stitched medium-format feel with no wide-angle distortion on the subject.',
        key_features:
          'wide view with f/1.4 depth; melted background; swirl at the edges; subject centered; no wide distortion',
      }),
      avoid: [...AVOID, 'deep focus', 'wide-angle distortion'],
      briefs: [
        'Brenizer bokeh panorama of an adult archer standing in a golden birch forest, the wide frame showing the whole grove yet every trunk behind her melted into soft gold and white bokeh. No text or logo.',
        'Brenizer panorama of an adult violinist playing on an old stone bridge at dusk, the river and town behind dissolved into creamy blue and amber bokeh. No text or logo.',
        'Brenizer panorama of an adult knight kneeling in a small chapel, candles and stained glass spread across the wide frame as swirling soft bokeh. No text or logo.',
      ],
    },
    'SP01-076': {
      dna: tech({
        aesthetic:
          'Forensic evidence photography: a flat, objective record of an object or trace with a scale reference and even flash, meant for measurement, not emotion.',
        subject_treatment: profile('the documentary evidence framing with scale reference'),
        color_and_tone: 'Neutral accurate color, white balance for a grey card, no grading.',
        lighting_and_shadow:
          'Even on-axis or ring flash, or a low oblique light to reveal impressions.',
        texture_and_material: 'Surface detail, cracks, prints and fibers recorded sharply.',
        camera_and_composition:
          'Camera square to the surface, black-and-white scale bar beside the object, plain markers without numbers.',
        atmosphere_and_mood:
          'Detached and procedural, calm clarity about something that went wrong.',
        rendering_and_quality:
          'Documentation-grade sharpness; no gore, drama or readable case numbers.',
        key_features:
          'scale bar beside the object; even flash; camera square to the surface; neutral color; plain evidence markers',
      }),
      avoid: [...AVOID, 'artistic', 'gore', 'readable case numbers'],
      briefs: [
        'Forensic evidence photograph of a broken dagger lying on old flagstones, a black-and-white scale bar beside it, two plain yellow tent markers without numbers, even flash, camera square to the floor. No text or logo.',
        'Forensic photograph of a muddy boot print in soft earth lit by a low oblique light that reveals every tread ridge, a scale bar along one side. No text or logo.',
        'Forensic photograph of a shattered stained-glass window with fragments scattered on a stone sill, plain markers beside each shard, neutral flat flash. No text or logo.',
      ],
    },
    'SP01-077': {
      dna: tech({
        aesthetic:
          'Clinical medical photography: standardized documentation under bright even light against a sterile blue or neutral background.',
        subject_treatment: profile('the standardized clinical documentation framing'),
        color_and_tone:
          'Accurate neutral color, sterile blue drapes, clean whites, no mood grading.',
        lighting_and_shadow: 'Bright twin flashes or surgical light, shadowless and even.',
        texture_and_material:
          'Stainless steel, gauze, skin and plaster recorded accurately without beautification.',
        camera_and_composition:
          'Straight-on standardized view, subject centered on a plain drape, optional plain scale ruler without numbers.',
        atmosphere_and_mood: 'Sterile and factual, careful attention without any emotion.',
        rendering_and_quality: 'Clinical accuracy; no gore, no moody shadows, no readable labels.',
        key_features:
          'sterile blue drape; shadowless twin flash; standardized straight-on view; accurate color; plain scale',
      }),
      avoid: [...AVOID, 'gore', 'moody shadow', 'artistic'],
      briefs: [
        'Clinical documentation photograph of an antique set of bone saws, probes and forceps laid in a row on a sterile blue drape, shadowless even light, straight-on view. No text or logo.',
        'Clinical photograph of a plaster dental impression cast on a neutral grey background, twin flash, a plain ruler without numbers beside it. No text or logo.',
        "Clinical documentation photograph of an adult patient's knee wearing a hinged leather-and-steel brace against a blue background, bright even light, standardized framing. No text or logo.",
      ],
    },
  },
  creates: [
    {
      name: 'Schlieren Photography',
      domain: 'schlieren flow imaging',
      tags: ['schlieren', 'scientific', 'optics'],
      dna: tech({
        aesthetic:
          'Schlieren photography: a knife-edge optical setup that makes invisible air flow, heat and shock waves visible as sharp gradients of light and dark.',
        color_and_tone:
          'Monochrome silver grey, or color schlieren with a rainbow filter turning density gradients into blues, magentas and golds.',
        lighting_and_shadow:
          'Collimated light through the scene against a dark or grey field; refraction becomes light and shadow.',
        texture_and_material:
          'Plumes, ripples, vortex curls and shock fronts rendered crisp; solid objects in silhouette.',
        camera_and_composition:
          'Object in profile inside a round mirror field, air flow rising or streaming across the frame.',
        atmosphere_and_mood: 'Revelatory and precise, invisible forces suddenly made visible.',
        rendering_and_quality: 'Real optical schlieren look; not smoke, not a painted glow.',
        key_features:
          'visible air and heat flow; knife-edge gradients; round mirror field; silhouetted object; rainbow or silver tones',
      }),
      avoid: [...PHOTO, 'smoke', 'painted aura'],
      briefs: [
        'Schlieren photograph of the hot air rising from a single candle flame, turbulent plumes and curls visible in silver grey inside a round mirror field, the candle in silhouette. No text or logo.',
        'Color schlieren photograph of an adult singer holding a long note, the plume of warm breath flowing from her mouth in blue, magenta and gold gradients. No text or logo.',
        'Schlieren photograph of heat shimmering off a red-hot horseshoe held in tongs, the rising air rippling like liquid glass above it. No text or logo.',
      ],
    },
    {
      name: 'Photoelastic Stress Imaging',
      domain: 'photoelastic stress analysis',
      tags: ['photoelasticity', 'polarized-light', 'scientific'],
      dna: tech({
        aesthetic:
          'Photoelastic stress imaging: transparent plastic objects between crossed polarizers, where internal stress appears as bands of rainbow interference color.',
        subject_treatment:
          'Keep the prompt subject and setting, rendering the subject as clear photoelastic material where needed so stress fringes reveal its structure.',
        color_and_tone:
          'Saturated interference fringes — magenta, cyan, yellow, green — on a black background.',
        lighting_and_shadow: 'Backlit polarized light box; only strained material transmits color.',
        texture_and_material:
          'Clear plastic with concentric fringe bands densest at points of pressure.',
        camera_and_composition:
          'Object centered flat against the light, black surround, fringes as the main pattern.',
        atmosphere_and_mood: 'Scientific and psychedelic, hidden tension turned into color.',
        rendering_and_quality: 'Crisp fringe bands; not a rainbow gradient overlay.',
        key_features:
          'rainbow stress fringes; crossed polarizers; clear plastic object; black background; dense bands at pressure points',
      }),
      avoid: [...PHOTO, 'rainbow gradient overlay', 'opaque materials'],
      briefs: [
        'Photoelastic stress photograph of a clear plastic model of a gothic arch under load, rainbow fringes crowding around the keystone and springing points against a black background. No text or logo.',
        'Photoelastic photograph of a pair of transparent plastic gears meshing, bright concentric fringes blooming where the teeth press together. No text or logo.',
        'Photoelastic photograph of a clear plastic key turning in a clear lock, magenta and cyan stress bands radiating from the bit. No text or logo.',
      ],
    },
    {
      name: 'Slit-Scan Photo Finish',
      domain: 'slit-scan finish-line camera',
      tags: ['slit-scan', 'photo-finish', 'scientific'],
      dna: tech({
        aesthetic:
          'Slit-scan photo finish: a camera recording one thin vertical line over time, so moving subjects appear whole while the static background becomes vertical stripes.',
        color_and_tone:
          'Natural color on subjects; background reduced to repeated streaks of one color column.',
        lighting_and_shadow:
          'Daylight or stadium light; lighting on the subject stays fixed as it passes the line.',
        texture_and_material:
          'Stretched or compressed bodies depending on speed, stationary parts smeared into long horizontal bands.',
        camera_and_composition:
          'Side view, subjects moving in one direction across the frame, horizontal axis representing time.',
        atmosphere_and_mood: 'Strange and kinetic, time laid out flat across space.',
        rendering_and_quality: 'True slit-scan distortion; not a motion blur filter.',
        key_features:
          'vertical-stripe background; time along the horizontal axis; stretched moving bodies; side view; smeared static parts',
      }),
      avoid: [...PHOTO, 'ordinary motion blur', 'readable timing numbers'],
      briefs: [
        'Slit-scan photo-finish image of a horse race at the line, the horses rendered whole but oddly stretched, the background turned into thin vertical stripes of green and white. No readable numbers, text or logo.',
        'Slit-scan photo-finish image of adult runners in tunics crossing a dirt finish line, one leaning ahead, legs smeared into long bands where they paused, striped background. No text or logo.',
        'Slit-scan image of a stagecoach passing a fixed camera, the coach stretched long and sharp, its wheels drawn as elongated ellipses, the road reduced to horizontal streaks. No text or logo.',
      ],
    },
    {
      name: 'Chronophotography Sequence',
      domain: 'multiple-exposure motion study',
      tags: ['chronophotography', 'motion-study', 'scientific'],
      dna: tech({
        aesthetic:
          'Chronophotography: a single plate exposed many times at fixed intervals, showing one movement as a row of overlapping phases.',
        color_and_tone: 'Monochrome or muted sepia-grey, subject bright against a black backdrop.',
        lighting_and_shadow:
          'Strong light on the subject, dark background so each phase stays readable.',
        texture_and_material:
          'Semi-transparent overlapping figures, each phase crisp at its instant.',
        camera_and_composition:
          'Fixed side view, the movement progressing across the frame left to right in eight to twelve phases.',
        atmosphere_and_mood: 'Analytical and graceful, motion taken apart like a mechanism.',
        rendering_and_quality:
          'Real multiple exposure with overlapping transparency; not a digital clone stamp.',
        key_features:
          'many overlapping phases; black backdrop; fixed side view; left-to-right progression; translucent overlaps',
      }),
      avoid: [...PHOTO, 'single frozen instant', 'cloned identical copies'],
      briefs: [
        'Chronophotograph of an adult fencer lunging, shown in ten overlapping phases across one plate against a black backdrop, the foil drawing an arc of positions. No text or logo.',
        'Chronophotograph of a raven taking off from a post, its wings rising and folding through twelve translucent phases left to right. No text or logo.',
        'Chronophotograph of an adult acrobat performing a backward somersault, each phase overlapping as a ghostly wheel of bodies against black. No text or logo.',
      ],
    },
    {
      name: 'Tiny Planet Stereographic',
      domain: 'stereographic panorama projection',
      tags: ['tiny-planet', '360-panorama', 'projection'],
      dna: tech({
        aesthetic:
          'Tiny planet projection: a full 360-degree panorama bent into a stereographic circle, so the ground becomes a small globe and the sky wraps around it.',
        subject_treatment: profile('the stereographic tiny-planet projection'),
        color_and_tone:
          'Natural color with sky filling the outer ring, ground concentrated at the center.',
        lighting_and_shadow: 'Daylight or dusk light; shadows radiate outward from the globe.',
        texture_and_material: 'Buildings, trees and people bending outward from the round horizon.',
        camera_and_composition:
          'Circular planet at center, vertical objects pointing outward like spikes, subject standing on the curve.',
        atmosphere_and_mood: 'Playful and dizzy, a whole place held like a toy globe.',
        rendering_and_quality:
          'Seamless stitched panorama with no visible seams, ghosting or broken lines.',
        key_features:
          'round tiny-planet ground; sky wrapping the edges; objects radiating outward; 360-degree stitch; centered globe',
      }),
      avoid: [...PHOTO, 'visible stitch seams', 'ordinary rectilinear view'],
      briefs: [
        'Tiny-planet stereographic panorama of a castle courtyard, the walls and towers radiating outward from a small round cobbled globe, blue sky wrapping around, one adult herald standing at the center. No text or logo.',
        'Tiny-planet panorama of a snowy mountain summit with a stone cairn at the center, peaks and clouds bending around the white globe. No text or logo.',
        'Tiny-planet panorama of a village square on a festival day, timber houses curling outward like petals, a maypole at the center. No text or logo.',
      ],
    },
    {
      name: 'UV Fluorescence Photography',
      domain: 'ultraviolet-induced fluorescence',
      tags: ['ultraviolet', 'fluorescence', 'scientific'],
      dna: tech({
        aesthetic:
          'UV fluorescence photography: the scene lit only by ultraviolet lamps so certain materials glow in their own vivid colors while everything else stays dark.',
        color_and_tone:
          'Black-violet darkness with glowing neon greens, reds, oranges and cyan from fluorescing materials.',
        lighting_and_shadow:
          'Invisible UV source; light seems to come from within the fluorescent materials.',
        texture_and_material:
          'Minerals, varnish, inks, shells and insects revealing hidden glowing patterns.',
        camera_and_composition:
          'Keep the requested framing; the glowing materials become the focal points.',
        atmosphere_and_mood: 'Secret and eerie, hidden layers glowing out of the dark.',
        rendering_and_quality:
          'Real fluorescence with violet cast in shadows; not neon signs or painted glow.',
        key_features:
          'UV-only lighting; materials glowing in their own colors; black-violet shadows; hidden patterns revealed',
      }),
      avoid: [...PHOTO, 'neon signs', 'ordinary daylight'],
      briefs: [
        'UV fluorescence photograph of a cave wall of minerals glowing neon green, red and orange under an ultraviolet lamp, the unlit rock black-violet. No text or logo.',
        'UV fluorescence photograph of a scorpion on dark sand glowing bright cyan under ultraviolet light, the desert night around it black. No text or logo.',
        'UV fluorescence photograph of an old carved and painted wooden mask, hidden repairs and varnish layers glowing in patches of green and orange. No text or logo.',
      ],
    },
    {
      name: 'Kirlian Corona Photography',
      domain: 'corona discharge contact photography',
      tags: ['kirlian', 'corona-discharge', 'contact-print'],
      dna: tech({
        aesthetic:
          'Kirlian photography: an object pressed onto film on a high-voltage plate, so a corona discharge draws a glowing halo of sparks around its outline.',
        color_and_tone:
          'Violet, blue and white electric corona on black; object interior dark or faintly lit.',
        lighting_and_shadow: 'No external light: only the discharge around edges and veins.',
        texture_and_material:
          'Fine radiating spark filaments, beaded streamers and veins traced in light.',
        camera_and_composition:
          'Contact-print view, object flat and centered, corona radiating outward.',
        atmosphere_and_mood: 'Uncanny and electric, the object seeming to give off its own aura.',
        rendering_and_quality: 'Contact-print discharge look; not a painted aura or glow filter.',
        key_features:
          'electric corona halo; radiating spark filaments; violet-white on black; flat contact view; glowing edges',
      }),
      avoid: [...PHOTO, 'soft glow filter', 'lens perspective'],
      briefs: [
        'Kirlian photograph of an oak leaf pressed flat, a violet-white corona of fine sparks radiating from its edge and every vein traced in light on black. No text or logo.',
        'Kirlian photograph of an old silver coin, a ring of blue discharge streamers around its rim and faint sparks inside the worn relief. No text or logo.',
        "Kirlian photograph of an adult's five fingertips pressed onto the plate, each surrounded by a crown of violet sparks. No text or logo.",
      ],
    },
    {
      name: 'Borescope Inspection',
      domain: 'industrial borescope camera',
      tags: ['borescope', 'inspection', 'technical'],
      dna: tech({
        aesthetic:
          'Borescope inspection: a tiny camera on a flexible probe pushed into a cavity, with its own ring of LEDs lighting a round, tunnel-like view.',
        subject_treatment: profile('the probe-camera view from inside a narrow cavity'),
        color_and_tone:
          'Cool LED white near the lens, rapid falloff to black, slight green or blue sensor cast.',
        lighting_and_shadow:
          'Ring LEDs around the lens: bright glare on near wet surfaces, darkness beyond.',
        texture_and_material:
          'Dust, corrosion, cobwebs and condensation magnified; low resolution softness.',
        camera_and_composition:
          'Circular vignette, extreme wide angle, tunnel perspective into the cavity.',
        atmosphere_and_mood:
          'Claustrophobic and curious, peering into places never meant to be seen.',
        rendering_and_quality:
          'Honest inspection-camera realism with no readable overlay, grid or measurements.',
        key_features:
          'circular vignette; ring-LED glare; tunnel perspective; rapid falloff to black; low-resolution softness',
      }),
      avoid: [...PHOTO, 'readable measurement overlay', 'studio lighting'],
      briefs: [
        'Borescope inspection image through a drilled hole into a sealed stone sarcophagus, the ring LED lighting cobwebs and a corroded bronze sword hilt, circular vignette falling to black. No text or logo.',
        'Borescope image inside the chest cavity of an old clockwork automaton, brass gears and dusty springs glaring under the ring light, tunnel perspective. No text or logo.',
        'Borescope image pushed into a hollow oak trunk, a sleeping dormouse curled among dry leaves at the end of the wooden tunnel. No text or logo.',
      ],
    },
  ],
};

export default spec;
