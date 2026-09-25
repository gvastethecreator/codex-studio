import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'generic stock-photo face',
  'celebrity likeness',
  'light that does not match the named technique',
  'changing the requested setting',
];

// Lighting presets are modifiers: the light changes, the subject, setting and camera stay as requested.
const keep =
  'Keep the prompt subject, action, setting and framing; change only how light falls on them so the named lighting technique is the unmistakable first read.';

function light(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, ...rest } = parts;
  return { aesthetic, subject_treatment: keep, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_01',
  category: '2. Lighting Techniques',
  updates: {
    'SP01-031': {
      dna: light({
        aesthetic:
          'Golden-hour photographic light: the sun within ten degrees of the horizon, long warm raking beams, and air that glows amber.',
        color_and_tone:
          'Honey, amber and apricot highlights against cool lavender shadows; warm white balance kept, skin glowing.',
        lighting_and_shadow:
          'Low, directional sun from behind or the side; long stretched shadows, rim light on hair and edges, gentle flare when the sun is in frame.',
        texture_and_material:
          'Dust, pollen, spray or mist catching the light; surfaces turned gold where the beam lands.',
        camera_and_composition:
          'Respect the requested framing; place the light source or its beams so the direction reads immediately.',
        atmosphere_and_mood:
          'Nostalgic and warm, with long shadows stretching the moment before it fades.',
        rendering_and_quality:
          'Natural photographic exposure protecting highlight rolloff, soft haze, no oversaturated orange cast.',
        key_features:
          'sun near horizon; long raking shadows; amber rim light; cool lavender shadows; glowing particles',
      }),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult shepherd leading a flock of long-horned sheep down a rocky mountain track at golden hour, low sun behind them turning the dust and fleece into glowing amber rims, long shadows stretching toward the lens. No text or logo.',
        'Photograph of an adult vintner lifting a wicker basket of dark grapes between vineyard rows at golden hour, the low sun behind her turning grape skins, vine leaves and loose hair translucent amber, lavender shadows between the rows. No text or logo.',
        'Photograph of an old adult ropemaker walking backward along a harbor quay twisting long hemp strands, the sun almost touching the sea behind him, every loose fiber rimmed in gold and his shadow stretching down the stones. No text or logo.',
      ],
    },
    'SP01-032': {
      dna: light({
        aesthetic:
          'Blue-hour light: the sun below the horizon, a luminous cobalt sky acting as a giant soft source, with warm artificial lights just switching on.',
        color_and_tone:
          'Deep cobalt and violet ambient tones with small warm tungsten or fire accents for contrast.',
        lighting_and_shadow:
          'Shadowless, even sky light; practical lamps, windows or fires create the only directional pools.',
        texture_and_material:
          'Surfaces reflect the blue sky; wet or glossy materials mirror both sky and warm lights.',
        camera_and_composition:
          'Keep the requested framing; include enough sky or reflection to show the blue source.',
        atmosphere_and_mood:
          'Calm and suspended: cool stillness broken only by small warm pools of light.',
        rendering_and_quality:
          'Clean low-light exposure with smooth sky gradients and little noise.',
        key_features:
          'cobalt sky ambient; shadowless soft light; warm practical accents; blue reflections; quiet twilight',
      }),
      avoid: AVOID,
      briefs: [
        'Photograph of a small stone castle on a sea stack at blue hour, lanterns just lit in its windows, cobalt sky and calm violet sea reflecting both. No text or logo.',
        'Photograph of an adult night-watchman lighting the first street lamp of a cobbled medieval lane at blue hour, deep blue sky above the rooftops, warm flame on his face. No text or logo.',
        'Photograph of an adult ice fisher sitting beside a small fire on a frozen lake at blue hour, the snow and ice glowing cobalt, the fire the only warm light. No text or logo.',
      ],
    },
    'SP01-033': {
      dna: light({
        aesthetic:
          'Direct on-camera hard flash: a harsh frontal burst that flattens faces, blows highlights, and throws a crisp black shadow onto whatever is behind.',
        color_and_tone:
          'Saturated, contrasty color near the flash, dark underexposed background falloff.',
        lighting_and_shadow:
          'Point source on the lens axis; hard drop shadow offset behind the subject, specular hotspots on skin, glass and metal, rapid falloff into darkness.',
        texture_and_material:
          'Shiny surfaces flare, skin gets oily highlights, dust and rain caught as bright specks.',
        camera_and_composition:
          'Keep the requested framing; subject near the camera so the flash falloff and background shadow read.',
        atmosphere_and_mood:
          'Raw and confrontational, the subject caught exposed against sudden blackness.',
        rendering_and_quality:
          'Snapshot realism with crisp edges and deliberately unflattering flash character.',
        key_features:
          'on-axis flash; hard drop shadow behind; blown speculars; dark falloff background; snapshot rawness',
      }),
      avoid: [...AVOID, 'daylight scene without flash'],
      briefs: [
        'Hard on-camera flash photograph at night of an adult grave robber caught climbing out of an open grave with a lantern and shovel, face blown white, crisp black shadow on the tombstone behind, darkness beyond. No text or logo.',
        'Hard flash snapshot of two adult festival-goers in horned masks laughing in a crowded tent, sweat and glitter flaring, hard shadow on the canvas behind them. No text or logo.',
        'Hard direct flash photograph of an adult cook at 3am holding up a live lobster in a steel kitchen, specular hotspots on the steel, black shadow on the tiled wall. No text or logo.',
      ],
    },
    'SP01-034': {
      dna: light({
        aesthetic:
          'Neon noir light: two saturated colored practical sources — typically magenta and teal — cutting through dark, wet, smoky air.',
        color_and_tone:
          'Magenta, cyan, teal and electric violet against near-black; skin split between the two hues.',
        lighting_and_shadow:
          'Colored key from one side, contrasting colored rim from the other, deep black fill, reflections doubling the light on wet surfaces.',
        texture_and_material: 'Rain, puddles, steam and glossy fabrics reflecting colored light.',
        camera_and_composition:
          'Keep requested framing; show at least one source or its colored spill.',
        atmosphere_and_mood:
          'Moody and dangerous, two hues pulling the face apart in color tension.',
        rendering_and_quality: 'Clean saturated color without muddy mixing; deep blacks preserved.',
        key_features:
          'two-color practical light; magenta and teal split; wet reflections; smoke; deep black fill',
      }),
      avoid: AVOID,
      briefs: [
        'Neon noir photograph of an adult sword-for-hire in a long waxed coat sheltering in a rain-soaked alley, magenta light from one side and teal from the other splitting her face, katana handle catching both. Wet reflections, steam. No readable signs or logo.',
        'Neon noir photograph of an adult fortune-teller in a tiny booth, crystal ball glowing teal, magenta curtain light behind her, cigarette smoke curling. No readable text or logo.',
        'Neon noir photograph of a vintage motorcycle and its adult rider waiting under an overpass in heavy rain, teal and magenta spill on the chrome and puddles. No readable signs or logo.',
      ],
    },
    'SP01-035': {
      dna: light({
        aesthetic:
          'Rembrandt lighting: a single warm key high and to the side, leaving a small inverted triangle of light on the shadow cheek, with painterly chiaroscuro.',
        color_and_tone:
          'Warm ochre highlights, deep umber shadows, muted palette like an old-master canvas.',
        lighting_and_shadow:
          'Key about 45 degrees to the side and above; the shadow side keeps a lit triangle under the eye; minimal fill; dark background.',
        texture_and_material:
          'Skin, fabric folds and metal modeled with strong but soft-edged falloff.',
        camera_and_composition:
          'Keep requested framing; the lit triangle and the key direction must be visible on any face.',
        atmosphere_and_mood:
          'Contemplative and dignified, quiet weight held in one warm pool of light.',
        rendering_and_quality: 'Rich midtone modeling, soft shadow edges, no flat fill.',
        key_features:
          'cheek light triangle; 45-degree high key; umber shadows; minimal fill; old-master chiaroscuro',
      }),
      avoid: AVOID,
      briefs: [
        'Photograph with Rembrandt lighting of an old adult cartographer studying a large blank vellum map with a magnifying lens, warm key high from the left leaving a triangle of light on his shadow cheek, dark study behind. No readable text or logo.',
        'Rembrandt-lit photograph of an adult Moorish swordsmith examining the edge of a curved blade, warm high side light, triangle on the far cheek, umber shadows. No text or logo.',
        'Rembrandt-lit portrait photograph of an adult nun in a black habit holding an iron key, single warm window key, lit triangle on the shadow side of her face. No text or logo.',
      ],
    },
    'SP01-036': {
      dna: light({
        aesthetic:
          'Split lighting: a hard source at 90 degrees dividing the subject exactly in half — one side lit, one side in darkness.',
        color_and_tone: 'High contrast, restrained color, the dark half near black.',
        lighting_and_shadow:
          'Side key perpendicular to the camera axis, no fill, a clean vertical shadow line down the nose or object center.',
        texture_and_material: 'Texture exaggerated on the lit half by grazing light.',
        camera_and_composition:
          'Keep requested framing; face or object frontal enough that the half-and-half division is obvious.',
        atmosphere_and_mood:
          'Divided and tense, a hard center line setting light against darkness.',
        rendering_and_quality: 'Crisp division line with detailed highlights and clean blacks.',
        key_features:
          '90-degree side key; half lit half dark; vertical shadow line; no fill; grazing texture',
      }),
      avoid: AVOID,
      briefs: [
        'Split-lit photograph of an adult masked duelist, half of her face and half of her porcelain mask lit by a hard side light, the other half lost in darkness. No text or logo.',
        'Split-lit photograph of an ancient bronze helmet on a stand, hard 90-degree light revealing half its dents and engraving, the other half black. No text or logo.',
        'Split-lit portrait photograph of an adult mercenary with a ritual-scarred shaved scalp and one gold earring, one side lit by a hard lamp, the other in total shadow, a clean line down the nose. No text or logo.',
      ],
    },
    'SP01-037': {
      dna: light({
        aesthetic:
          'Backlit silhouette lighting: the light source behind the subject, exposure set for the bright background so the subject falls to a black shape.',
        color_and_tone:
          'Luminous background color — sky, fire, fog or window — with a black subject.',
        lighting_and_shadow:
          'Strong backlight only; thin halo where light wraps edges; no front fill at all.',
        texture_and_material:
          'Detail lives in the glowing background: haze, clouds, sparks or dust.',
        camera_and_composition:
          'Keep requested framing; separate the subject outline from other dark shapes against the brightest area.',
        atmosphere_and_mood:
          'Iconic and mysterious, meaning carried by outline, gesture and negative space.',
        rendering_and_quality:
          'Pure black shape without muddy detail; smooth bright background gradient.',
        key_features:
          'light behind subject; black shape; edge halo; bright background exposure; clean outline',
      }),
      avoid: [...AVOID, 'front-lit subject'],
      briefs: [
        'Backlit silhouette photograph of an adult swordsman standing in the doorway of a burning barn, the fire behind him blazing orange, his outline and blade pure black with a thin glowing edge. No text or logo.',
        'Backlit silhouette photograph of a herd of wild horses cresting a dune against a white-hot desert sun, dust glowing around their black shapes. No text or logo.',
        'Backlit silhouette photograph of an adult diver climbing a ladder out of the sea at sunrise, every drop on her silhouette catching light. No text or logo.',
      ],
    },
    'SP01-038': {
      dna: light({
        aesthetic:
          'Butterfly lighting: a high frontal key centered above the lens that casts a small symmetrical shadow under the nose and sculpts cheekbones.',
        color_and_tone: 'Clean, flattering skin tones, bright face, darker surroundings.',
        lighting_and_shadow:
          'Key directly in front and above, small butterfly-shaped nose shadow, soft shadow under the chin, optional reflector fill from below.',
        texture_and_material: 'Luminous skin, defined cheekbones, glossy hair and jewelry.',
        camera_and_composition:
          'Keep requested framing; the face should be frontal enough to show the symmetrical shadow.',
        atmosphere_and_mood:
          'Poised and glamorous, symmetrical calm with the face held in clean light.',
        rendering_and_quality:
          'Polished beauty rendering that keeps real skin texture and clean symmetrical shadow edges.',
        key_features:
          'high centered key; butterfly nose shadow; sculpted cheekbones; chin shadow; glamorous polish',
      }),
      avoid: AVOID,
      briefs: [
        'Butterfly-lit photograph of an adult queen character in a tall silver crown and high lace collar, key light centered above the lens, small symmetrical shadow under the nose, dark throne room behind. No text or logo.',
        'Butterfly-lit portrait photograph of an adult court harpist with a pearl-studded hairnet and a high brocade collar, the harp neck curving beside her face, high frontal key, sculpted cheekbones. No text or logo.',
        'Butterfly-lit photograph of an adult male fencer with slicked-back hair in a high white fencing collar, foil held upright between his eyes, centered high key, clean symmetrical shadows, black background. No text or logo.',
      ],
    },
    'SP01-039': {
      dna: light({
        aesthetic:
          "Candlelight: small warm flames as the only source, falling off within an arm's length into velvety darkness.",
        color_and_tone:
          'Deep orange and amber near the flame, rapid fall to brown-black; very low color temperature.',
        lighting_and_shadow:
          'Low point sources close to the subject, strong inverse-square falloff, flickering soft shadows, bright specks in eyes.',
        texture_and_material: 'Wax, glass, skin and fabric glowing warmly; smoke threads visible.',
        camera_and_composition:
          'Keep requested framing; place at least one flame visible or clearly motivating the light.',
        atmosphere_and_mood:
          'Intimate and hushed, darkness pressing close around a small warm circle.',
        rendering_and_quality: 'Clean low-light exposure with rich blacks, no gray noise.',
        key_features: 'flame-only light; steep falloff; amber glow; velvety black; visible candle',
      }),
      avoid: [...AVOID, 'electric light'],
      briefs: [
        'Candlelit photograph of an adult monk illuminating a manuscript page with a tiny brush by the light of three tallow candles, his face and hands glowing amber, the scriptorium dissolving into black. No readable text or logo.',
        'Candlelit photograph of four adult conspirators leaning over a table in a cellar around a single candle, faces lit from below, one holding a sealed letter. No readable text or logo.',
        'Candlelit photograph of an adult woman walking down a stone spiral stair holding a candlestick, the flame lighting only her face, hand and a few steps. No text or logo.',
      ],
    },
    'SP01-040': {
      dna: light({
        aesthetic:
          'Volumetric god rays: hard beams of light made visible by haze, dust or fog, crossing the scene in defined shafts.',
        color_and_tone:
          'Bright warm or cool shafts against darker hazy surroundings; atmosphere lifts the shadows slightly.',
        lighting_and_shadow:
          'Strong source behind an occluder (trees, windows, clouds) producing parallel or radiating shafts; subjects partially cut by beams.',
        texture_and_material: 'Dust motes, smoke, spray or mist in the beams.',
        camera_and_composition:
          'Keep requested framing; angle the beams across the frame toward or past the subject.',
        atmosphere_and_mood:
          'Reverent and awed, silent space cut by slow diagonal shafts of light.',
        rendering_and_quality: 'Clean beam edges and smooth haze without banding.',
        key_features:
          'visible light shafts; haze; occluder pattern; dust motes; subject crossed by beams',
      }),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult pilgrim kneeling on the floor of a ruined cathedral as shafts of morning sun pour through broken stained-glass windows into incense smoke, beams crossing her shoulders. No text or logo.',
        'Photograph of an adult woodcutter stopping in a foggy pine forest as sun beams slant between the trunks, his breath and the sawdust glowing in the shafts. No text or logo.',
        'Photograph of an adult weaver at a huge upright loom in a dim timber barn, hard beams from gaps in the planks cutting through floating lint and across the taut warp threads. No text or logo.',
      ],
    },
    'SP01-041': {
      dna: light({
        aesthetic:
          "Bioluminescent light: living organisms glowing cyan, green or blue as the scene's only illumination in darkness.",
        color_and_tone: 'Electric cyan, aqua and green glows against deep navy and black.',
        lighting_and_shadow:
          'Many small cold sources — plankton, fungi, insects, algae — lighting nearby surfaces softly from below or around.',
        texture_and_material: 'Wet surfaces, water, skin and leaves catching speckled glow.',
        camera_and_composition:
          'Keep requested framing; make the glowing organisms the visible light sources.',
        atmosphere_and_mood:
          'Eerie and magical, cold living sparks floating in a vast quiet darkness.',
        rendering_and_quality:
          'Clean long-exposure darkness without noise, the glowing specks crisp and individually visible.',
        key_features:
          'living light sources; cyan-green glow; dark surroundings; speckled illumination; wet reflections',
      }),
      avoid: AVOID,
      briefs: [
        'Photograph at night of an adult swimmer floating on her back in a black lagoon, bioluminescent plankton glowing cyan around every movement of her arms. No text or logo.',
        'Photograph of an adult forager kneeling in a dark forest among glowing green bioluminescent mushrooms, the fungi lighting his hands and face from below. No text or logo.',
        'Photograph of an old wooden rowboat drifting through a cave where glowworms cover the ceiling like stars, their blue light reflected in the still water. No text or logo.',
      ],
    },
    'SP01-042': {
      dna: light({
        aesthetic:
          'Strobe freeze: an extremely short burst of light that freezes fast motion — splashes, debris, hair, fabric — in crisp suspended detail.',
        color_and_tone: 'Cool white burst, crisp neutral color, dark background.',
        lighting_and_shadow:
          'One or two hard strobes from the side, sharp shadows, no motion blur.',
        texture_and_material:
          'Droplets, shards, dust and fibers frozen mid-air with individual detail.',
        camera_and_composition:
          'Keep requested framing; show an action at its peak with debris around it.',
        atmosphere_and_mood:
          'Kinetic and explosive, violent motion held perfectly still for one instant.',
        rendering_and_quality:
          'Ultra-sharp frozen droplets and debris against a clean dark background, with no motion blur.',
        key_features:
          'motion frozen mid-air; hard strobe; crisp droplets and debris; dark background; peak action',
      }),
      avoid: AVOID,
      briefs: [
        'Strobe-frozen photograph of an adult warrior smashing a clay jar with a war hammer, shards and dust suspended mid-air around the hammer head, dark background, hard side strobe. No text or logo.',
        'Strobe-frozen photograph of a raven bursting off a wet branch, every drop of water flung from its wings frozen, black background. No text or logo.',
        'Strobe-frozen photograph of an adult war drummer striking a drum skin flooded with water, a crown of droplets leaping off the skin around the mallet, every drop sharp against black. No text or logo.',
      ],
    },
    'SP01-043': {
      dna: light({
        aesthetic:
          'Continuous ring light: a soft circular LED around the lens giving shadowless frontal light and a ring-shaped catchlight in the eyes.',
        color_and_tone: 'Even bright skin, slightly cool LED white, backgrounds softly lit.',
        lighting_and_shadow:
          'Frontal on-axis soft light, almost no facial shadow, subtle halo shadow on a close background.',
        texture_and_material: 'Smooth skin, glossy lips and eyes with clear ring reflections.',
        camera_and_composition:
          'Keep requested framing; face close enough to show the ring catchlight.',
        atmosphere_and_mood:
          'Direct and intimate, an even frontal gaze with nothing hidden in shadow.',
        rendering_and_quality:
          'Clean, even frontal exposure with round ring catchlights clearly visible in both eyes.',
        key_features: 'ring catchlight; shadowless frontal light; cool LED white; soft halo shadow',
      }),
      avoid: AVOID,
      briefs: [
        'Ring-light photograph of an adult makeup artist painting intricate silver scale patterns on her own face for a mermaid costume, ring reflection clear in her eyes, shadowless light. No text or logo.',
        "Ring-light close-up photograph of an adult tattoo artist examining a fresh dragon tattoo on a client's forearm, even frontal light, ring catchlight. No text or logo.",
        'Ring-light photograph of an adult watchmaker with a loupe in one eye, the ring light reflected in both lens and eye, tiny gears on the bench. No text or logo.',
      ],
    },
    'SP01-044': {
      dna: light({
        aesthetic:
          'Projector light: an image or pattern projected onto the subject and surroundings, wrapping across faces, bodies and walls.',
        color_and_tone: 'Colors and shapes taken from the projected image, dark ambient otherwise.',
        lighting_and_shadow:
          'Single projector beam; pattern distorts over contours; the subject casts a shadow into the projection behind.',
        texture_and_material:
          'Pattern bends across skin, fabric and objects, revealing their shape.',
        camera_and_composition:
          'Keep requested framing; the projection must visibly wrap the subject.',
        atmosphere_and_mood:
          'Dreamlike and theatrical, the projected image and the body merging into one surface.',
        rendering_and_quality: 'Sharp projection detail where in focus, dark clean surroundings.',
        key_features:
          'projected pattern wrapping contours; subject shadow in projection; single beam; dark ambient',
      }),
      avoid: [...AVOID, 'readable projected text'],
      briefs: [
        'Photograph of an adult dancer in a white dress with a projected stained-glass rose window wrapping across her body and the wall behind, her shadow cutting a hole in the pattern. No readable text or logo.',
        'Photograph of an adult astronomer in a plain hooded wool robe lit only by a projected star map that bends over his hood, face and raised hands, dark round tower room. No text or logo.',
        'Photograph of an old adult man sitting in an armchair while projected ocean waves ripple across his face, sweater and the wallpaper behind him. No text or logo.',
      ],
    },
    'SP01-045': {
      dna: light({
        aesthetic:
          'Light painting: long-exposure photography where moving lights draw glowing trails, arcs and shapes around a still subject in darkness.',
        color_and_tone:
          'Vivid colored light trails against black; subject lit briefly or by the trails.',
        lighting_and_shadow:
          'Moving handheld sources during a long exposure; ambient darkness; trails wrap around or behind the subject.',
        texture_and_material: 'Smooth glowing ribbons, sparks from steel wool, ghosted movement.',
        camera_and_composition:
          'Keep requested framing; tripod-steady background with the trails as graphic lines.',
        atmosphere_and_mood:
          'Playful and energetic, stillness wrapped in fast, looping ribbons of light.',
        rendering_and_quality:
          'Clean black background and continuous, unbroken light trails with smooth glowing edges.',
        key_features:
          'long-exposure light trails; steel-wool sparks; glowing ribbons; dark background; still subject',
      }),
      avoid: AVOID,
      briefs: [
        'Long-exposure light-painting photograph of an adult wizard-costumed figure standing still in a ruined stone circle at night while a spiral of golden light trails swirls around him and up into the sky. No text or logo.',
        'Light-painting photograph of a steel-wool spark storm spinning inside an abandoned mill, sparks bouncing off the stone floor around an adult figure in a long coat. No text or logo.',
        'Long-exposure photograph of an old wooden windmill in a dark field while a ribbon of blue and red light is drawn around its still sails like a flowing banner. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Dappled Leaf Light',
      domain: 'dappled canopy light',
      tags: ['dappled-light', 'natural-light', 'lighting'],
      dna: light({
        aesthetic:
          'Dappled canopy light: sun filtered through leaves scattering bright coin-shaped patches across the subject and ground.',
        color_and_tone: 'Warm sunlit patches with cool green-tinted shade between them.',
        lighting_and_shadow:
          'Hard sun broken by foliage into many small soft-edged spots; the subject moves between light and shade.',
        texture_and_material:
          'Leaf shadows patterning skin, fabric and stone; glowing translucent leaves overhead.',
        camera_and_composition:
          'Keep requested framing; the dapple pattern must fall across the main subject.',
        atmosphere_and_mood: 'Peaceful and summery, a slow flicker of warm light and cool shade.',
        rendering_and_quality: 'Natural contrast with bright spots held, not clipped.',
        key_features:
          'leaf-filtered sun spots; green shade; dapple on subject; translucent leaves; summer calm',
      }),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult elf-costumed archer resting against a mossy oak, sun filtered through the canopy scattering bright dapples across her face, bow and cloak. No text or logo.',
        'Photograph of an old adult beekeeper walking between hives under an orchard canopy, coin-shaped patches of sunlight moving over his veil and hands. No text or logo.',
        'Photograph of a sleeping adult knight lying in tall grass under a birch tree, dappled light across his armor and face. No text or logo.',
      ],
    },
    {
      name: 'Horror Underlight',
      domain: 'uplighting from below',
      tags: ['underlighting', 'horror-light', 'lighting'],
      dna: light({
        aesthetic:
          'Horror underlighting: a single source from below the face or subject, inverting natural shadows so features look wrong and menacing.',
        color_and_tone:
          'Cold green, sickly yellow or fire-orange from below; everything above falls into darkness.',
        lighting_and_shadow:
          'Low source pointing upward: shadows climb above brows and nose, bright chin and nostrils, dark eye sockets.',
        texture_and_material: 'Skin, teeth, cobwebs and wet surfaces catching upward light.',
        camera_and_composition: 'Keep requested framing; the light must visibly come from below.',
        atmosphere_and_mood:
          'Uncanny and menacing, familiar features turned wrong by light from below.',
        rendering_and_quality:
          'Clean darkness above the source and crisp, brightly lit planes on every underside.',
        key_features:
          'light from below; inverted shadows; dark eye sockets; cold or fire tint; menacing',
      }),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult storyteller holding a lantern under his chin to tell a ghost story around a campfire, shadows climbing over his brows, a circle of adult listeners dark around him. No text or logo.',
        'Photograph of an adult witch leaning over a bubbling cauldron, sickly green light from the brew lighting her face from below. No text or logo.',
        'Photograph of an adult museum night guard kneeling beside a fallen oil lamp at the foot of a suit of armor, the lamp lighting his face and the empty helmet above him from below. No text or logo.',
      ],
    },
    {
      name: 'Theatrical Spotlight',
      domain: 'stage follow spot',
      tags: ['spotlight', 'stage-light', 'lighting'],
      dna: light({
        aesthetic:
          'Theatrical follow spot: a hard circular beam from above isolating the subject on a dark stage, with a visible pool of light at their feet.',
        color_and_tone:
          'Neutral or warm white beam, black surroundings, optional colored gel wash behind.',
        lighting_and_shadow:
          'Hard high spot with a crisp circular edge on the floor, short dark shadow under the subject, faint beam visible in haze.',
        texture_and_material: 'Stage dust in the beam; costume fabrics and props sharply lit.',
        camera_and_composition: 'Keep requested framing; include the pool or edge of the spot.',
        atmosphere_and_mood:
          'Lonely and theatrical, a single figure held in a circle of attention.',
        rendering_and_quality:
          'Crisp circular beam edge, deep clean blacks outside it, and controlled highlights inside.',
        key_features: 'circular follow spot; light pool on floor; dark stage; visible beam in haze',
      }),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult actor in a paper crown kneeling alone on a dark stage inside a hard circular spotlight, holding a skull, beam visible in the haze above. No text or logo.',
        'Photograph of an adult juggler of flaming torches standing in a single white follow spot in a circus tent, darkness all around, sparks falling. No text or logo.',
        'Photograph of an adult ballerina in a torn black tutu frozen in an arabesque inside a narrow white spotlight, the edge of the pool cutting across her pointe shoe. No text or logo.',
      ],
    },
    {
      name: 'Moonlight Night',
      domain: 'moonlit night light',
      tags: ['moonlight', 'night-light', 'lighting'],
      dna: light({
        aesthetic:
          'Moonlight: a single cold, soft-edged high source washing the scene in silver-blue with deep black shadows.',
        color_and_tone: 'Silver, slate blue and blue-green; very low saturation; black shadows.',
        lighting_and_shadow:
          'Soft directional light from high in the sky, long pale shadows on snow, water or stone; no warm sources unless requested.',
        texture_and_material: 'Frost, dew, water and metal catching silver highlights.',
        camera_and_composition:
          'Keep requested framing; show the moon or its reflection when the sky is visible.',
        atmosphere_and_mood: 'Silent and cold, romantic mystery in a wide pale-blue hush.',
        rendering_and_quality: 'Clean low-light exposure without noise or orange cast.',
        key_features:
          'silver-blue high source; black shadows; low saturation; frost and water highlights',
      }),
      avoid: AVOID,
      briefs: [
        'Moonlit photograph of an adult wolf-hunter crouching in deep snow at the edge of a birch forest, silver-blue moonlight on the snow and his fur cloak, long pale shadows. No text or logo.',
        'Moonlit photograph of a white barn owl gliding low over a frozen river, the full moon behind it, silver light on its spread wings and the cracked ice. No text or logo.',
        'Moonlit photograph of an adult herbalist cutting roots with a small sickle in a walled garden, silver moonlight on the blade and dew-laden leaves, her shadow long and pale on the gravel. No text or logo.',
      ],
    },
    {
      name: 'Lightning Flash',
      domain: 'lightning strike illumination',
      tags: ['lightning', 'storm-light', 'lighting'],
      dna: light({
        aesthetic:
          'Lightning flash: an instant of blinding blue-white light from a strike, revealing the scene in stark relief against a dark storm.',
        color_and_tone:
          'Violet-white flash, cold blue shadows, dark storm clouds, rain streaks lit white.',
        lighting_and_shadow:
          'Single overwhelming source from the sky, hard shadows thrown all at once, sharp rim light on wet edges.',
        texture_and_material: 'Rain drops, wet stone, soaked cloth and metal flashing bright.',
        camera_and_composition:
          'Keep requested framing; show the bolt or its reflection when the sky is in frame.',
        atmosphere_and_mood: 'Violent and ominous, a frozen instant of shock inside the storm.',
        rendering_and_quality: 'Crisp frozen rain, clean highlights, deep storm darkness.',
        key_features:
          'blue-white strike light; frozen rain; hard instant shadows; storm darkness; visible bolt',
      }),
      avoid: AVOID,
      briefs: [
        'Photograph of an adult ship captain gripping the wheel in a storm at sea as a lightning bolt strikes behind the mast, blue-white light freezing the rain and spray around him. No text or logo.',
        'Photograph of an adult bell-ringer hauling on a rope in an open stone belfry as lightning splits the valley behind, the flash freezing rain and the swinging bronze bell. No text or logo.',
        'Photograph of a lone dead oak on a moor lit for an instant by a lightning strike, its bare branches and the sheets of rain around it flashing white. No text or logo.',
      ],
    },
  ],
};

export default spec;
