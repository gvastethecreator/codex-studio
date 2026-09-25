import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'changing the surroundings',
  'changing the camera',
  'converting every object in the scene',
  'readable text',
  'logo',
];

// Material modifiers change only the target's material; shape, pose, setting, light setup and camera stay.
const mat =
  "Change only the material of the prompt's main subject (or the object the prompt names) into this material; its shape, pose, surroundings, lighting setup and camera stay as requested.";

function m(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? mat, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_03',
  category: '2. Materials',
  updates: {
    'SP03-011': {
      dna: m({
        aesthetic:
          'Glass and crystal material: flawless transparent solids that bend the background through refraction and split bright light into thin rainbow edges.',
        color_and_tone:
          'Clear or faintly tinted body, bright white edge highlights, small spectral fringes.',
        lighting_and_shadow:
          'Refraction flips and bends what lies behind; caustic light pools and colored fringes in the cast shadow.',
        texture_and_material:
          'Polished facets or smooth curves, internal reflections, tiny bubbles or inclusions.',
        camera_and_composition:
          'Keep the requested framing; a textured background behind the target to show refraction.',
        atmosphere_and_mood: 'Pure and fragile, light caught and bent inside a clear form.',
        rendering_and_quality:
          'Physically based refraction with dispersion; not a flat transparent overlay.',
        key_features:
          'refraction bending the background; rainbow edge dispersion; caustic shadow pools; internal reflections; flawless clarity',
      }),
      avoid: AVOID,
      briefs: [
        'CGI material study: a dragon skull made entirely of clear crystal resting on dark slate, the background bending through its eye sockets, thin rainbow fringes on the teeth, caustic light pooling in its shadow. No text or logo.',
        'CGI material study of a full-bloom rose made of clear glass on a windowsill, the garden outside refracted upside down in each petal. No text or logo.',
        'CGI material study of a pocket watch whose case and gears are cut crystal, internal reflections multiplying the movement. No text or logo.',
      ],
    },
    'SP03-012': {
      dna: m({
        aesthetic:
          'Liquid simulation material: the target formed from moving fluid — splashing, sheeting and breaking into droplets while keeping its silhouette.',
        color_and_tone:
          'Clear water, colored juice or ink as the prompt suggests; bright specular droplets.',
        lighting_and_shadow:
          'Backlight through the liquid for glow, sharp specular points on every drop.',
        texture_and_material:
          'Surface tension skins, crown splashes, thin sheets tearing into droplets, foam.',
        camera_and_composition:
          'Keep the requested framing; the frozen instant shows the flow direction.',
        atmosphere_and_mood: 'Kinetic and refreshing, a form held together for one instant.',
        rendering_and_quality: 'High-resolution fluid sim frozen in time; no stiff plastic water.',
        key_features:
          'fluid-formed silhouette; crown splashes; droplets tearing off; surface tension; backlit glow',
      }),
      avoid: AVOID,
      briefs: [
        'CGI liquid simulation of a leaping stag made entirely of splashing water, antlers breaking into droplets, backlight glowing through the flowing body, frozen in mid-air. No text or logo.',
        'CGI liquid simulation of a crown of red wine rising as a splash in the shape of a royal crown above a goblet. No text or logo.',
        'CGI liquid simulation of a coiling serpent of black ink sheeting and tearing into droplets over a white basin. No text or logo.',
      ],
    },
    'SP03-013': {
      dna: m({
        aesthetic:
          'Subsurface scattering material: light enters the surface, travels inside and glows back out, so thin areas shine warm like wax, jade or backlit skin.',
        color_and_tone:
          'Warm inner glow in reds, ambers or greens; soft saturated transmission at thin edges.',
        lighting_and_shadow:
          'Backlight or side light producing glowing edges and soft terminator lines.',
        texture_and_material:
          'Soft waxy surface, blurred inner detail, faint veins or clouds inside.',
        camera_and_composition:
          'Keep the requested framing; a light behind or beside the target to reveal the glow.',
        atmosphere_and_mood: 'Warm and alive, the material holding light like a heartbeat.',
        rendering_and_quality: 'Physically based scattering; not a flat emissive glow.',
        key_features:
          'light glowing through thin areas; soft terminator; waxy inner clouds; backlit translucency; warm transmission',
      }),
      avoid: AVOID,
      briefs: [
        'CGI subsurface-scattering study of a carved owl made of pale green jade, backlit so its thin ear tufts and wing edges glow, soft cloudy veins inside. No text or logo.',
        'CGI subsurface study of a hand-dipped beeswax dragon candle, side light glowing warm through its wings. No text or logo.',
        'CGI subsurface study of a heap of translucent pink sea grapes on a rock, light scattering through each bead. No text or logo.',
      ],
    },
    'SP03-014': {
      dna: m({
        aesthetic:
          'Chrome and polished metal: mirror-grade reflective surfaces showing the whole environment, with sharp or anisotropic streaked highlights.',
        color_and_tone:
          'Silver chrome, warm gold or rose copper, deep black reflections of dark surroundings.',
        lighting_and_shadow:
          'Reflections of lights and windows as bright shapes; brushed areas stretching highlights into streaks.',
        texture_and_material:
          'Mirror polish, fine anisotropic brushing, subtle fingerprints or dust only if asked.',
        camera_and_composition: 'Keep the requested framing; interesting surroundings to reflect.',
        atmosphere_and_mood: 'Sleek and precise, a form made of reflections.',
        rendering_and_quality:
          'Accurate mirror reflections with correct distortion; no grey plastic.',
        key_features:
          'mirror reflections of surroundings; anisotropic streaks; gold or copper tints; black reflected darks; precise highlights',
      }),
      avoid: AVOID,
      briefs: [
        'CGI material study of a sleeping cat made of mirror chrome curled on a library armchair, the whole room and its bookshelves reflected and bent across its fur. No readable spines or logo.',
        'CGI material study of a rose-gold snail on a mossy stone, brushed anisotropic highlights streaking around its shell. No text or logo.',
        'CGI material study of a knight chess piece in polished gold standing on a board, the other pieces reflected in its mane. No text or logo.',
      ],
    },
    'SP03-016': {
      dna: m({
        aesthetic:
          'Groomed fur and hair: the target covered in simulated strands with clumping, flyaways and soft light passing through the tips.',
        color_and_tone: 'Natural or dyed fur color, lighter translucent tips, darker dense roots.',
        lighting_and_shadow:
          'Rim light glowing through strand tips, soft self-shadowing inside the coat.',
        texture_and_material:
          'Clumped strands, visible parting lines, stray flyaways and a clear wind-combed direction.',
        camera_and_composition:
          'Keep the requested framing; a silhouette against light shows the fuzz.',
        atmosphere_and_mood: 'Soft and huggable, warmth you can almost feel.',
        rendering_and_quality: 'Individual strand rendering with depth; not a painted fur texture.',
        key_features:
          'simulated strands with clumping; glowing rim through tips; flyaways; self-shadowing; wind direction',
      }),
      avoid: AVOID,
      briefs: [
        'CGI groomed-fur study of a teapot covered in long silver fur, strands clumping around the spout, rim light glowing through the tips. No text or logo.',
        'CGI groomed-fur study of a tall snow-white owl with wind combing its feathers into flowing strands. No text or logo.',
        'CGI groomed-fur study of an armchair covered in long shaggy orange fur in an empty study, clumps parting where someone sat, flyaways catching warm window light and a rim glow along the back. No text or logo.',
      ],
    },
    'SP03-017': {
      dna: m({
        aesthetic:
          'Slime and goo: the target made of thick glossy viscous fluid that sags, drips and stretches into sticky strings.',
        color_and_tone:
          'Saturated translucent color — acid green, hot pink, cobalt — with bright glossy highlights.',
        lighting_and_shadow: 'Backlight glowing through thick goo, sharp wet specular streaks.',
        texture_and_material:
          'Sagging mass, stretched strings, trapped bubbles, drips pooling at the base.',
        camera_and_composition:
          'Keep the requested framing; show drips and strings leaving the form.',
        atmosphere_and_mood: 'Gross and playful, satisfying and a little disgusting.',
        rendering_and_quality: 'Viscous fluid look with translucency; not hard glossy plastic.',
        key_features:
          'sagging viscous form; stretched sticky strings; trapped bubbles; glossy wet highlights; pooling drips',
      }),
      avoid: AVOID,
      briefs: [
        'CGI slime material study of a small castle made of cobalt goo slowly sagging on a table, towers drooping, sticky strings stretching between the walls, trapped bubbles glowing. No text or logo.',
        'CGI slime study of a hot pink rubber duck melting into glossy goo on the rim of a bathtub. No text or logo.',
        'CGI slime study of a lantern made of acid-green goo dripping onto a stone floor, its own light glowing through it. No text or logo.',
      ],
    },
    'SP03-018': {
      dna: m({
        aesthetic:
          'Carbon fiber composite: a woven twill of black fibers under a deep glossy clear coat, the weave shimmering as the angle changes.',
        color_and_tone:
          'Black and charcoal weave with silver-grey anisotropic sheen, deep lacquer reflections.',
        lighting_and_shadow:
          'Strip highlights revealing the checker weave, clear coat mirror reflections on top.',
        texture_and_material:
          'Two-by-two twill pattern following the curves, depth under the lacquer.',
        camera_and_composition:
          'Keep the requested framing; curved surfaces to show the weave bending.',
        atmosphere_and_mood: 'Technical and fast, the feeling of engineered, weightless strength.',
        rendering_and_quality: 'Anisotropic weave with a clear coat; not a flat printed pattern.',
        key_features:
          'twill weave pattern; anisotropic shimmer; deep glossy clear coat; strip highlights; weave following curves',
      }),
      avoid: AVOID,
      briefs: [
        "CGI carbon-fiber study of a knight's great helm made of glossy carbon twill, strip lights revealing the weave bending around its curves, deep lacquer reflections. No text or logo.",
        'CGI carbon-fiber study of a violin with its body in woven carbon fiber, shimmering as the weave turns. No text or logo.',
        'CGI carbon-fiber study of a pair of angel wings in carbon twill mounted on a wall, clear coat catching the light. No text or logo.',
      ],
    },
    'SP03-019': {
      dna: m({
        aesthetic:
          'Hologram material: the target rebuilt from projected light — translucent, scanlined and flickering — standing on its projector beam.',
        color_and_tone:
          'Cyan and blue light with magenta interference fringes, darker transparent interior.',
        lighting_and_shadow:
          'The hologram emits light but casts no shadow; faint beam from a base below.',
        texture_and_material:
          'Horizontal scanlines, glitch offsets, see-through edges brighter than the core.',
        camera_and_composition:
          'Keep the requested framing; the surroundings visible through the target.',
        atmosphere_and_mood: 'Futuristic and ghostly, present and absent at once.',
        rendering_and_quality:
          'Additive light projection with scanlines; no readable interface text.',
        key_features:
          'translucent projected light; scanlines; flicker glitch offsets; bright fresnel edges; no cast shadow',
      }),
      avoid: [...AVOID, 'readable interface'],
      briefs: [
        'CGI hologram study of a full-size warhorse projected above a stone table in a dark war room, cyan scanlines, glitch offsets in its mane, the tapestries visible through its body. No readable interface or logo.',
        'CGI hologram study of a potted bonsai tree made of flickering blue light on a desk. No readable interface or logo.',
        'CGI hologram study of a projected old map-table castle model, towers bright at the edges and hollow in the middle. No readable interface or logo.',
      ],
    },
    'SP03-020': {
      dna: m({
        aesthetic:
          'Glazed porcelain: fine white ceramic with a glassy glaze, milky translucency at thin edges and tiny crackle lines.',
        color_and_tone:
          'Milky white or celadon, optional cobalt blue painted accents, soft pooled glaze color.',
        lighting_and_shadow: 'Soft broad highlights on the glaze, light glowing through thin rims.',
        texture_and_material:
          'Smooth glaze, fine crackle network, pooled glaze in hollows, crisp rims.',
        camera_and_composition: 'Keep the requested framing; soft studio or window light.',
        atmosphere_and_mood: 'Delicate and precious, beauty that could break at a touch.',
        rendering_and_quality: 'Glazed ceramic with subtle translucency; not matte plaster.',
        key_features:
          'glassy white glaze; translucent thin rims; fine crackle; cobalt painted accents; pooled glaze',
      }),
      avoid: AVOID,
      briefs: [
        'CGI porcelain study of a fox curled asleep, made of white glazed porcelain with cobalt blue painted flowers along its tail, light glowing through its thin ears, fine crackle in the glaze. No text or logo.',
        "CGI porcelain study of a knight's gauntlet in celadon glaze, glaze pooled darker between the finger plates. No text or logo.",
        'CGI porcelain study of a small tree with porcelain leaves on a table, thin leaves translucent in window light. No text or logo.',
      ],
    },
    'SP03-036': {
      dna: m({
        aesthetic:
          'Caustic light material response: a clear or liquid target that focuses light into bright dancing networks and bands on the surfaces around it.',
        subject_treatment:
          'Keep the prompt subject and setting; make the target (or the water or glass the prompt names) focus light into caustic patterns on nearby surfaces, without changing anything else.',
        color_and_tone:
          'Bright white-gold caustic networks, slight spectral fringes, darker surrounding surfaces.',
        lighting_and_shadow:
          'Hard light through the refracting target, caustic nets rippling across floors and walls.',
        texture_and_material: 'Bright web-like light lines, focused hot spots, soft rainbow edges.',
        camera_and_composition:
          'Keep the requested framing; the caustic pattern visible beside the target.',
        atmosphere_and_mood: 'Shimmering and serene, light turned into moving lace.',
        rendering_and_quality:
          'Photon-accurate caustics; distinct from the photographic glass still life in pack_01.',
        key_features:
          'caustic light networks; focused hot spots; rippling bands on nearby surfaces; spectral fringes; refracting target',
      }),
      avoid: AVOID,
      briefs: [
        'CGI caustics study of a crystal goblet of water on a stone table, the sun through it throwing a rippling web of gold light across the table and the wall behind. No text or logo.',
        'CGI caustics study of a sunken bell at the bottom of a clear lagoon, caustic nets crawling over its bronze. No text or logo.',
        'CGI caustics study of a glass orb resting on sand, a focused hot spot and rainbow-edged bands spreading from its base. No text or logo.',
      ],
    },
    'SP03-075': {
      dna: m({
        aesthetic:
          'Carved ice: the target sculpted from clear block ice, with frosted chisel marks, trapped bubbles and edges beginning to melt.',
        color_and_tone:
          'Clear icy blue-white, cyan in thick areas, frosted white on carved surfaces.',
        lighting_and_shadow:
          'Backlight glowing through the ice, cool refraction, drips catching highlights.',
        texture_and_material:
          'Chisel grooves, frost bloom, trapped air columns, meltwater drops at the base.',
        camera_and_composition:
          'Keep the requested framing; a dark or colored background to show the clarity.',
        atmosphere_and_mood: 'Cold and fleeting, a careful carving that is already melting away.',
        rendering_and_quality: 'Refractive ice with frosted carving marks; not glass.',
        key_features:
          'clear block ice; frosted chisel marks; trapped bubbles; melting drips; backlit cyan glow',
      }),
      avoid: AVOID,
      briefs: [
        'CGI ice-sculpture study of a roaring bear carved from clear block ice, frosted chisel grooves in its fur, trapped bubble columns, meltwater drops at its paws, backlit cyan glow. No text or logo.',
        'CGI ice study of a harp carved from ice with strings of thin icicles, frost blooming on the frame. No text or logo.',
        'CGI ice study of a throne carved from a single block of ice, its armrests already beginning to melt. No text or logo.',
      ],
    },
    'SP03-079': {
      dna: m({
        aesthetic:
          'Cast bronze: the target as a bronze casting with polished high points, dark recesses and green-blue verdigris patina in the crevices.',
        color_and_tone:
          'Warm brown-gold bronze, bright polished wear spots, verdigris green and turquoise in recesses.',
        lighting_and_shadow:
          'Directional light raking the cast forms, warm specular on rubbed areas.',
        texture_and_material:
          'Casting texture, chased details, patina streaks, polished wear where hands touch.',
        camera_and_composition:
          'Keep the requested framing; a plinth only if the prompt includes one.',
        atmosphere_and_mood: 'Monumental and weathered, a form that has stood for centuries.',
        rendering_and_quality: 'Real metal with layered patina and wear, never painted plastic.',
        key_features:
          'cast bronze sheen; verdigris in crevices; polished wear spots; raking light; casting texture',
      }),
      avoid: AVOID,
      briefs: [
        'CGI bronze study of a hare sitting upright, cast in bronze with verdigris pooled in its fur grooves and its ears polished bright where visitors touched them. No text or logo.',
        'CGI bronze study of a monk statue carrying a lantern on a cloister plinth, green-blue patina streaks running down his robe from the rain, polished bright toes where pilgrims touch them. No text or logo.',
        'CGI bronze study of an octopus wrapped around an anchor, warm bronze highlights on the suckers. No text or logo.',
      ],
    },
    'SP03-080': {
      dna: m({
        aesthetic:
          'Carved marble: the target as polished white or grey marble with flowing veins, soft translucency and crisp chisel-sharp edges.',
        color_and_tone:
          'Carrara white with grey or gold veins, faint warm translucency in thin parts.',
        lighting_and_shadow: 'Soft directional light with gentle subsurface glow in thin areas.',
        texture_and_material:
          'Polished surfaces, rasp-textured areas, veins following the stone not the form.',
        camera_and_composition: 'Keep the requested framing; the target alone becomes stone.',
        atmosphere_and_mood: 'Serene and timeless, softness carved out of stone.',
        rendering_and_quality: 'Veined marble with subtle scattering; not grey concrete.',
        key_features:
          'white marble with flowing veins; polished and rasped areas; soft translucency; crisp carved edges',
      }),
      avoid: AVOID,
      briefs: [
        'CGI marble study of a heavy draped cloak carved in white Carrara marble, soft folds glowing faintly translucent, grey veins running across the drapery. No text or logo.',
        'CGI marble study of a sleeping lion carved from grey-veined marble, polished mane and rasped paws. No text or logo.',
        'CGI marble study of a heavy knotted ship rope carved in gold-veined white marble lying coiled on a stone dock, chisel-crisp fiber twists and a faint translucency at the thin ends. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Thin-Film Iridescent Coating',
      domain: 'thin-film interference material',
      tags: ['iridescence', 'thin-film', 'material'],
      dna: m({
        aesthetic:
          'Thin-film iridescent coating: a microscopically thin layer over the target that shifts hue with viewing angle, like oil on water or a beetle shell.',
        color_and_tone:
          'Angle-dependent bands of teal, magenta, gold and violet over a dark or metallic base.',
        lighting_and_shadow:
          'Hue changes across curvature; highlights shift color at grazing angles.',
        texture_and_material: 'Smooth glossy coat with rainbow gradients flowing along the form.',
        camera_and_composition:
          'Keep the requested framing; curved surfaces to show the color flop.',
        atmosphere_and_mood: 'Magical and shimmering, color that refuses to stay still.',
        rendering_and_quality: 'Physically based thin-film interference; not a rainbow texture.',
        key_features:
          'angle-dependent hue shift; oil-slick rainbow bands; dark base; glossy coat; grazing-angle color flop',
      }),
      avoid: AVOID,
      briefs: [
        "CGI thin-film iridescent study of a knight's helmet whose steel carries an oil-slick coating shifting from teal to magenta to gold across its curves. No text or logo.",
        'CGI thin-film study of a ceramic vase coated like a beetle shell, green and violet flopping as the surface turns. No text or logo.',
        'CGI thin-film study of a dagger laid on black velvet, a rainbow temper coating flowing along its edge from straw gold through purple to deep blue as the blade curves toward the tip. No text or logo.',
      ],
    },
    {
      name: 'Molten Glowing Metal',
      domain: 'incandescent molten metal',
      tags: ['molten-metal', 'emissive', 'material'],
      dna: m({
        aesthetic:
          'Molten glowing metal: the target made of incandescent liquid metal, glowing by its own heat from deep red to white-yellow, with a darker cooling skin.',
        color_and_tone:
          'Blackbody gradient from dull red through orange to white-yellow, dark crusted skin.',
        lighting_and_shadow:
          'The target emits light onto its surroundings; heat haze distorting the air above.',
        texture_and_material: 'Flowing liquid surface, cracked cooling crust, drips and sparks.',
        camera_and_composition:
          'Keep the requested framing; darker surroundings to show the emission.',
        atmosphere_and_mood: 'Dangerous and primal, form pulled straight out of the forge.',
        rendering_and_quality:
          'Emissive blackbody material with heat distortion; not orange paint.',
        key_features:
          'blackbody glow gradient; cracked cooling crust; heat haze; drips and sparks; light cast on surroundings',
      }),
      avoid: AVOID,
      briefs: [
        'CGI molten-metal study of a crown made of glowing liquid gold on an anvil, white-yellow at its points and cooling to a dark red crust at the base, sparks and heat haze. No text or logo.',
        'CGI molten-metal study of a rose poured from glowing iron on a blacksmith anvil, white-hot petal tips cracking as they cool into a dark red crust, sparks and heat shimmer above. No text or logo.',
        'CGI molten-metal study of a chess king dripping incandescent metal onto a stone board, lighting the board orange. No text or logo.',
      ],
    },
    {
      name: 'Precious Opal Material',
      domain: 'play-of-color opal',
      tags: ['opal', 'gemstone', 'material'],
      dna: m({
        aesthetic:
          'Precious opal: the target made of milky or black opal with flashes of spectral color that shift as the light moves.',
        color_and_tone:
          'Milky white or dark body with patches of fiery red, green, blue and violet play-of-color.',
        lighting_and_shadow:
          'Soft glossy highlights; color flashes appearing and vanishing across the form.',
        texture_and_material:
          'Polished cabochon surface, harlequin patches, faint internal cloudiness.',
        camera_and_composition: 'Keep the requested framing; moving light to show the flashes.',
        atmosphere_and_mood: 'Dreamlike and precious, a galaxy trapped in stone.',
        rendering_and_quality:
          'Diffraction play-of-color inside the stone, never a painted rainbow texture.',
        key_features:
          'play-of-color flashes; milky or black opal body; polished cabochon surface; harlequin patches; glossy highlights',
      }),
      avoid: AVOID,
      briefs: [
        'CGI opal study of a small dragon made of black opal curled on a velvet cloth, patches of fiery red, green and violet flashing across its scales. No text or logo.',
        'CGI opal study of a spiral seashell carved from milky white opal resting on dark sand, harlequin patches of red, green and blue flashing across the whorls as a lamp moves overhead. No text or logo.',
        'CGI opal study of an owl figurine in polished opal glowing with blue and green flashes. No text or logo.',
      ],
    },
    {
      name: 'Gummy Candy Material',
      domain: 'translucent gummy candy',
      tags: ['gummy', 'candy', 'material'],
      dna: m({
        aesthetic:
          'Gummy candy: the target made of soft translucent gelatin candy, slightly sugar-dusted, glowing with saturated color when backlit.',
        color_and_tone:
          'Saturated cherry red, lime, orange and grape, deeper color in thick parts.',
        lighting_and_shadow:
          'Backlight glowing through the candy, soft rounded highlights, colored shadows.',
        texture_and_material:
          'Soft rounded edges, sugar crystals, slight squish, tiny trapped bubbles.',
        camera_and_composition: 'Keep the requested framing; macro feel to read the texture.',
        atmosphere_and_mood: 'Playful and sweet, a treat you want to bite.',
        rendering_and_quality:
          'Soft translucent gelatin with light scattering inside, never hard glass.',
        key_features:
          'translucent gelatin; sugar dusting; saturated candy colors; colored shadows; soft squishy edges',
      }),
      avoid: AVOID,
      briefs: [
        'CGI gummy-candy study of a knight on horseback made of translucent cherry and lime gummy, sugar crystals on the helmet, backlight glowing through the horse, colored shadows on the table. No text or logo.',
        'CGI gummy-candy study of a grinning skull made of translucent grape gummy on a white plate, tiny trapped bubbles, a sugar dusting on the crown and purple light glowing through onto the table. No text or logo.',
        'CGI gummy-candy study of a castle tower in orange gummy slightly squished and bulging at its base, a gummy dragon wrapped around the top, backlight making both glow like stained glass. No text or logo.',
      ],
    },
    {
      name: 'Pearlescent Flake Paint',
      domain: 'metallic flake automotive paint',
      tags: ['car-paint', 'pearlescent', 'material'],
      dna: m({
        aesthetic:
          'Pearlescent flake paint: the target finished in custom automotive paint with metallic flakes under a deep clear coat and a color flop at the edges.',
        color_and_tone:
          'Candy base color flopping to a second hue at grazing angles, sparkling flakes.',
        lighting_and_shadow:
          'Long mirror-like clear coat reflections, glittering flakes under point lights.',
        texture_and_material:
          'Deep glossy lacquer, fine metal flake sparkle, smooth orange-peel-free finish.',
        camera_and_composition:
          'Keep the requested framing; studio or street lights to excite the flakes.',
        atmosphere_and_mood: 'Flashy and custom, a hot-rod finish on anything.',
        rendering_and_quality:
          'Layered base, flake and clear-coat shading, never flat glossy plastic.',
        key_features:
          'candy color flop; metallic flake sparkle; deep clear coat reflections; glittering under point lights; custom finish',
      }),
      avoid: AVOID,
      briefs: [
        'CGI pearlescent flake paint study of a suit of armor finished in candy violet paint flopping to teal at its edges, metal flakes glittering under point lights, deep clear coat reflections. No text or logo.',
        'CGI flake-paint study of a grand piano finished in deep red candy paint packed with gold flakes, the lid open, showroom point lights glittering under a thick mirror-like clear coat. No text or logo.',
        'CGI flake-paint study of an antique rocking horse painted pearl white flopping to pink along its curves, fine metallic flakes glittering in the mane and a glossy clear coat reflecting a nursery window. No text or logo.',
      ],
    },
    {
      name: 'Aerogel Material',
      domain: 'silica aerogel',
      tags: ['aerogel', 'translucent', 'material'],
      dna: m({
        aesthetic:
          'Aerogel: the target made of ultra-light silica aerogel, a nearly weightless solid that looks like frozen blue smoke.',
        color_and_tone:
          'Hazy pale blue against dark backgrounds, faint amber where light passes through.',
        lighting_and_shadow:
          'Scattering makes it glow blue from the side and orange in transmitted light; blurred edges.',
        texture_and_material:
          'Soft undefined edges, no surface gloss at all and a ghostly hazy volume.',
        camera_and_composition: 'Keep the requested framing; dark background to reveal the haze.',
        atmosphere_and_mood: 'Ghostly and scientific, a solid barely there.',
        rendering_and_quality: 'Volumetric Rayleigh scattering solid; not glass and not smoke.',
        key_features:
          'frozen blue-smoke solid; blurred edges; Rayleigh scattering blue; faint amber transmission; no gloss',
      }),
      avoid: AVOID,
      briefs: [
        'CGI aerogel study of a stag head made of silica aerogel mounted on a dark wall, a ghostly pale blue haze with blurred edges, faint amber where the lamp shines through. No text or logo.',
        'CGI aerogel study of a brick of aerogel shaped like a book resting on a flower without bending it. No text or logo.',
        'CGI aerogel study of a hand-sized dragon egg made of silica aerogel resting on a black cloth in a dark room, a ghostly pale blue haze with no hard edges, a candle behind it glowing amber through the middle. No text or logo.',
      ],
    },
    {
      name: 'Amber Resin Inclusion',
      domain: 'amber with inclusions',
      tags: ['amber', 'resin', 'material'],
      dna: m({
        aesthetic:
          'Amber resin inclusion: the target made of golden fossil amber or clear resin, with small objects, bubbles and debris suspended inside.',
        color_and_tone:
          'Honey gold to deep cognac, darker orange in thick parts, warm glow when backlit.',
        lighting_and_shadow:
          'Backlight glowing through the amber, internal inclusions casting soft shadows inside.',
        texture_and_material:
          'Polished surface, flow lines, trapped insects, seeds or leaves, tiny bubbles.',
        camera_and_composition:
          'Keep the requested framing; light behind to reveal the inclusions.',
        atmosphere_and_mood: 'Ancient and treasured, a moment preserved forever.',
        rendering_and_quality: 'Translucent resin with depth and inclusions; not orange glass.',
        key_features:
          'golden amber glow; suspended inclusions; flow lines; tiny bubbles; backlit warm transmission',
      }),
      avoid: AVOID,
      briefs: [
        'CGI amber study of a large beetle-shaped brooch made of golden amber, with a tiny fern, seeds and a trapped mosquito suspended inside, backlit warm glow. No text or logo.',
        'CGI amber study of a chess queen made of cognac-colored resin with a dried rose inside. No text or logo.',
        'CGI amber study of a hand mirror frame in honey amber with small bubbles and flow lines. No text or logo.',
      ],
    },
  ],
};

export default spec;
