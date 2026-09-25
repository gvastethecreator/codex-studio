import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'photographic still-life object',
  'photoreal scene',
  'repeated hooded dark-haired swordsman',
  'franchise character likeness',
  'readable text',
];

// Styles: the subject is redrawn in the ink treatment. Category validation: a gentle prompt stays
// gentle in content; only marks, values and palette darken.
const seinen =
  "Redraw the prompt's subject, action, count and setting in this seinen ink treatment; a gentle or everyday prompt stays gentle in content while only marks, values and palette change.";
const personFree =
  "Redraw the prompt's nonhuman subject or object and its setting in this treatment; the image stays free of people, and a gentle prompt stays gentle in content.";

function ink(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? seinen, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_05',
  category: '4. Dark Fantasy & Seinen',
  updates: {
    'SP05-278': {
      dna: ink({
        aesthetic:
          'Seinen ink illustration whose contours branch like hairline fissures in slate, splitting every form into a few large unequal planes of flat chalky tone.',
        color_and_tone:
          'Chalk white, cool slate and deep graphite carry most values; one small mica-silver glint marks the focal plane and prompt hues survive at half saturation.',
        lighting_and_shadow:
          'Pale edge light runs along the fissure lines with quiet flat shadow inside each plane; light reads as reflected off stone, never glowing.',
        texture_and_material:
          'Dry pumice-like grain inside the planes, crisp fracture strokes of even width, and bare paper left open between the largest tonal shards.',
        camera_and_composition:
          'Keep the requested camera; wide margins of empty chalk-tone space make the subject sit small and isolated inside the requested framing.',
        atmosphere_and_mood:
          'Quiet, cold loneliness carried by sparse marks and long empty intervals, never outright tragedy.',
        rendering_and_quality:
          'Crisp planar ink drawing with fissure contours and flat chalk fills, no soft gradients; always illustrated, never a photographed crystal or stone.',
        key_features:
          'branching fissure contours; few unequal flat planes; chalk, slate and graphite values; single mica-silver glint; wide empty margins',
      }),
      avoid: AVOID,
      briefs: [
        'Seinen ink illustration of a lone adult shepherdess resting against a boulder on a high scree slope, her flock tiny far below, every form split by branching fissure contours into flat chalk and slate planes, one mica-silver glint on her crook, wide empty margins. No text or logo.',
        'Seinen ink illustration of an abandoned stone well at the bottom of an empty quarry seen from the rim, fissure contours dividing the quarry walls into unequal graphite planes, the well small and isolated in chalk-white space. No text or logo.',
        'Seinen ink illustration of an adult cellist practicing alone in a bare slate-walled room, a gentle quiet evening, her instrument and shoulders broken into a few flat chalky planes by hairline fissures, pale edge light, cold and calm. No text or logo.',
      ],
    },
    'SP05-261': {
      dna: ink({
        aesthetic:
          'Brush-ink anime illustration of wide crescent value sweeps: each form sits half-swallowed in a curved black mass, and a thin scar of bare midtone runs along its lit edge.',
        color_and_tone:
          'Ink-black masses, bone-gray planes and one muted violet accent; the prompt colors appear mainly inside the narrow scar of exposed midtone.',
        lighting_and_shadow:
          "A narrow crescent rim light against broad soft occlusion at roughly 1:8, always from the prompt's own light direction.",
        texture_and_material:
          'Smooth pooled ink washes with dry-brush breaks where a crescent sweep turns, and paper grain showing through the midtone scar.',
        camera_and_composition:
          'Keep the requested framing; curved value arcs steer the eye around the subject like a partial eclipse, without adding a moon or sun.',
        atmosphere_and_mood:
          'Heavy, patient and withheld; the weight comes from how much of each form stays hidden.',
        rendering_and_quality:
          'Large confident brush sweeps, one crisp scar line per form, and deep values kept legible as violet-black rather than dead flat black.',
        key_features:
          'crescent black value sweeps; thin midtone scar on lit edges; bone gray with muted violet; 1:8 rim-to-occlusion; dry-brush breaks',
      }),
      avoid: AVOID,
      briefs: [
        'Brush-ink anime illustration of an aged adult queen seated on a low stone throne, half her figure swallowed by a curved black crescent sweep, a thin bone-gray scar of midtone tracing her crown and cheek, one muted violet accent in her sleeve. No text or logo.',
        'Brush-ink anime illustration of a raven perched on a thick bell rope, seen close from below, wide crescent value sweeps curling around it and a thin midtone scar along its wing edge, dry-brush breaks in the black. No text or logo.',
        'Brush-ink anime illustration of an adult baker lifting a round loaf from a stone oven at dawn, a warm and gentle moment, the oven mouth a crescent of pooled ink and a narrow scar of bone-gray light along her forearms. No text or logo.',
      ],
    },
    'SP05-262': {
      dna: ink({
        aesthetic:
          "Grounded seinen realism in slightly unsteady hand-inked contours and short observational hatching, like a court sketch artist's anime; edges misregister a hair around the focal face or object.",
        color_and_tone:
          'Subdued slate, tobacco brown and paper-cream neutrals with saturation kept below a third; stronger hue only where the prompt asks for an accent.',
        lighting_and_shadow:
          'Plausible soft-edged daylight or room light with a few precise highlight cuts on eyes, knuckles or metal; no theatrical beams.',
        texture_and_material:
          'Dry pencil grain under thin opaque ink, hatching that follows each plane, and a faint doubled line at the focal edge.',
        camera_and_composition:
          'Keep the requested camera; observational eye-level feel with slightly sharper edges on the focal subject than on its surroundings.',
        atmosphere_and_mood:
          'Doubt and scrutiny: calm on the surface, with watchful unease living in the hesitant lines.',
        rendering_and_quality:
          'Realistic proportions, restrained anime simplification of faces, crisp focal edges and softer peripheral hatching; drawn, never photographic.',
        key_features:
          'unsteady observational ink contours; short plane-following hatches; slate, tobacco and paper palette; slight focal misregistration; realistic proportions',
      }),
      avoid: AVOID,
      briefs: [
        'Grounded seinen ink drawing of two adult village elders whispering across a tavern table while a third watches over the rim of his cup, unsteady hand-inked contours, short observational hatching, slate and tobacco neutrals, a doubled line around the watcher. No text or logo.',
        'Grounded seinen ink drawing of an adult apothecary weighing powder on brass scales, eyes lifted toward the door, precise highlight cuts on the brass and her knuckles, pencil grain under thin ink, paper-cream palette. No text or logo.',
        'Grounded seinen ink drawing of an adult grandmother pouring tea for her grown nephew at a kitchen table, a warm ordinary visit, drawn in hesitant observational lines and short hatches, subdued slate and cream, a faint misregistered edge on the teapot. No text or logo.',
      ],
    },
    'SP05-263': {
      dna: ink({
        aesthetic:
          'Graphic anime ink whose contours break into dashes at uneven intervals, like a lost transmission, separated by large clean pockets of near-black negative space.',
        color_and_tone:
          'A black-and-ash value range with one narrow cold cyan or acid-green accent on a single edge; prompt colors survive as small muted patches.',
        lighting_and_shadow:
          'Isolated sharp pulses of reflected color on a few edges against broad flat shadow; no visible screen or light fixture is added.',
        texture_and_material:
          'Dry graphic edges, sparse dot noise that thins as it nears the subject, and flat matte black fields without grain.',
        camera_and_composition:
          'Keep the requested framing; near-black negative pockets fill about half the frame so the dashed subject floats inside them.',
        atmosphere_and_mood: 'Visual silence and numb detachment; nothing in the picture is loud.',
        rendering_and_quality:
          'Crisp dashed contours of even weight, clean black fills and one accent color; illustrated, never a photographed object on black.',
        key_features:
          'broken dash contours; large near-black negative pockets; one cyan or acid-green edge accent; thinning dot noise; flat matte blacks',
      }),
      avoid: AVOID,
      briefs: [
        'Graphic anime ink of an adult bell-ringer standing alone in a dark belfry, the great bell and his figure drawn in broken dash contours floating in near-black negative space, a single acid-green pulse on the bell rim. No text or logo.',
        'Graphic anime ink of an unfinished chess game on a stone window ledge at night, pieces outlined in uneven dashes, sparse dot noise thinning toward them, one cold cyan edge on a fallen king. No text or logo.',
        'Graphic anime ink of an adult night watchwoman on a city wall looking out over black fields, seen from behind at a distance, dashed contours and huge flat black pockets around her, one thin cyan edge on her shoulder. No text or logo.',
      ],
    },
    'SP05-264': {
      dna: ink({
        aesthetic:
          'Hairline anime linework on broad porcelain-pale planes, drawn with medical-plate precision, where one single contour deliberately breaks, doubles or wobbles.',
        color_and_tone:
          'Porcelain white, cool gray and pale blue-gray fields with one tiny coral or vermilion note placed at the point of rupture.',
        lighting_and_shadow:
          'Clear diffuse near-shadowless light like a white room, plus one small hard highlight exactly where the line breaks.',
        texture_and_material:
          'Smooth matte fields over extremely fine paper grain; technical-pen hairlines of constant width and no stains anywhere.',
        camera_and_composition:
          'Keep the requested camera; the subject sits with generous even margins so the precision feels clinical and calm.',
        atmosphere_and_mood: 'Fragile calm with one small wrong note, innocence kept under glass.',
        rendering_and_quality:
          'Pristine hairline contours, flat pale fills and one controlled irregularity; no grime and no gradients beyond a soft gray shadow.',
        key_features:
          'technical hairline contours; broad porcelain-pale planes; one broken or doubled contour; tiny coral accent; near-shadowless diffuse light',
      }),
      avoid: AVOID,
      briefs: [
        'Hairline anime illustration of an adult infirmary nun folding white linen on a long table, porcelain-pale planes and constant-width technical lines, one contour of her sleeve breaking and doubling, a tiny vermilion thread at the break, shadowless light. No text or logo.',
        'Hairline anime illustration of a white porcelain hare figurine on a bare windowsill, clinical even margins, flat pale blue-gray fields, the line of one ear wobbling on purpose with a small hard highlight and a coral dot. No text or logo.',
        "Hairline anime illustration of an adult alchemist's apprentice pouring milk into a clear glass flask, a calm and gentle task, porcelain-white planes and precise hairlines, a single doubled contour on the flask's lip marked with a coral note. No text or logo.",
      ],
    },
    'SP05-265': {
      dna: ink({
        aesthetic:
          "Ornate seinen ink with tapered looping strokes that echo the subject's own curves like engraved baroque flourishes, laid over lacquer-smooth dark color.",
        color_and_tone:
          'A rich black-plum base with dusty rose and burgundy accents and a few tarnished-gold specks; prompt hues drift toward wine tones.',
        lighting_and_shadow:
          'Small warm specular cuts on lacquered surfaces against velvety black shadow, contrast around 1:10.',
        texture_and_material:
          'Fine etched hairlines over smooth lacquer color, velvet-soft shadow gradients, and ornament only along contours that already exist.',
        camera_and_composition:
          'Keep the requested framing; curling strokes follow the contours while quiet dark space surrounds the silhouette.',
        atmosphere_and_mood:
          'Elegant, overripe and faintly uneasy, like a ballroom after midnight.',
        rendering_and_quality:
          'Controlled etched detail on the focal silhouette, softer lacquer fields elsewhere; ornament always subordinate to the silhouette.',
        key_features:
          'tapered looping flourish strokes; black-plum with dusty rose; lacquer-smooth fills; warm specular cuts; etched hairline detail',
      }),
      avoid: AVOID,
      briefs: [
        'Ornate seinen ink illustration of an adult countess descending a spiral stair in a plum ball gown, tapered looping strokes echoing the curves of her train and the banister, lacquer-smooth black-plum color, warm specular cuts on her jewelry. No text or logo.',
        'Ornate seinen ink illustration of a long banquet table after the feast, toppled goblets and wilting roses, baroque flourish strokes tracing the goblet curves, dusty rose and burgundy on velvety black, tarnished-gold specks. No text or logo.',
        'Ornate seinen ink illustration of an adult violinist playing in a candlelit conservatory among potted palms, a tender private recital, etched hairlines along the violin scroll and her sleeves, black-plum shadow and small warm highlights. No text or logo.',
      ],
    },
    'SP05-266': {
      dna: ink({
        aesthetic:
          "Kinetic anime ink in which the subject's trailing edges disintegrate into small separated black flecks and broken contourlets, as if its own movement were blowing the drawing apart.",
        color_and_tone:
          'Charcoal and ash values with a few cool pale-blue flecks; the prompt colors stay on the solid core of the subject.',
        lighting_and_shadow:
          'Tiny edge glints only where the prompt light strikes; the flecks stay dark and never glow.',
        texture_and_material:
          'Sparse matte pigment granulation, flecks ranging from pinpoint to rice-grain size and thinning with distance from the silhouette.',
        camera_and_composition:
          'Keep the requested camera; flecks stream off the trailing side of the motion or wind, leaving the leading edge crisp.',
        atmosphere_and_mood: 'Restless and transient, a figure half escaping the page.',
        rendering_and_quality:
          'Solid crisp core with a disintegrating trailing edge; fleck scatter stays controlled and never becomes an all-over noise layer.',
        key_features:
          'trailing edges dissolving into black flecks; crisp leading edge; charcoal and ash with pale-blue flecks; granulated matte pigment; fleck size gradient',
      }),
      avoid: AVOID,
      briefs: [
        'Kinetic anime ink of an adult woman thief leaping between tiled rooftops against a pale sky, her cloak and trailing leg disintegrating into separated black flecks and broken contourlets, crisp leading hand, charcoal and ash with pale-blue flecks. No text or logo.',
        'Kinetic anime ink of a flock of crows lifting off a frozen field, the rear edge of each wing dissolving into rice-grain black flecks that thin into the white ground, charcoal palette with a few cool specks. No text or logo.',
        'Kinetic anime ink of an adult laundress shaking out a white sheet in a sunny courtyard, a gentle chore, the sheet edge flaking into small dark flecks on the wind while her hands stay crisp, granulated matte pigment. No text or logo.',
      ],
    },
    'SP05-267': {
      dna: ink({
        aesthetic:
          'Black sumi-ink seinen illustration cut through by one or two decisive carmine brushstrokes that split, taper and feather along an existing edge, like a seal-red slash across the page rather than blood.',
        color_and_tone:
          'Monochrome black ink on warm rice paper, with carmine or oxblood reserved for one or two strokes only.',
        lighting_and_shadow:
          'Flat paper light; a slim raking highlight separates the red stroke from the black ground beneath it.',
        texture_and_material:
          'Dense black ink with capillary feathering into rice paper and a dry-brush tail at the end of every red stroke.',
        camera_and_composition:
          'Keep the requested framing; the red stroke crosses the focal path diagonally and splits the composition into two unequal parts.',
        atmosphere_and_mood:
          'Abrupt and decisive, a clean break in continuity without any implied violence.',
        rendering_and_quality:
          'Confident calligraphic brushwork with readable forms; the red stroke is a graphic accent, never a wound or splatter.',
        key_features:
          'one or two carmine brush slashes; black sumi ink on rice paper; capillary feathering; diagonal split of the composition; non-gory red',
      }),
      avoid: AVOID,
      briefs: [
        'Sumi-ink seinen illustration of an adult calligrapher-monk kneeling before a blank scroll in an empty hall, black ink feathering into rice paper, one decisive carmine brushstroke slicing diagonally across the whole composition behind him. No text or logo.',
        'Sumi-ink seinen illustration of a white heron taking off from a black marsh, reeds in dense feathered ink, a single tapered carmine stroke following the line of its outstretched wing and splitting the page. No text or logo.',
        'Sumi-ink seinen illustration of a rope bridge over a misty gorge with one strand hanging loose, gorge walls in wet black ink, two carmine dry-brush strokes echoing the broken strand, unequal diagonal split. No text or logo.',
      ],
    },
    'SP05-268': {
      dna: ink({
        aesthetic:
          'Seinen anime ink with selective chromatic edge doubling: magenta and cyan outlines slip two or three pixels off an otherwise stable black contour, like misregistered two-color print.',
        color_and_tone:
          'Deep neutral grays and navy fills, with saturated pink and blue-cyan kept as separate thin bands along the edges.',
        lighting_and_shadow:
          'Colored reflected light is suggested only by the offset edges; no signs, lamps or night setting are added.',
        texture_and_material:
          'Clean flat fills with slight pigment bloom confined to the colored edge bands.',
        camera_and_composition:
          'Keep the requested framing and a steady silhouette; the offset color, not the camera, carries all the energy.',
        atmosphere_and_mood: 'Pressured, over-bright and quietly desperate under a calm surface.',
        rendering_and_quality:
          'A stable black keyline with two offset color ghosts and flat fills; no all-over glow haze.',
        key_features:
          'magenta and cyan edge offsets; stable black keyline; misregistered print feel; navy-gray fills; localized pigment bloom',
      }),
      avoid: AVOID,
      briefs: [
        'Seinen anime ink of an adult court jester sitting alone on the edge of an empty stage after the show, stable black keylines with magenta and cyan outlines slipping off them, navy-gray flat fills, pigment bloom only at the colored edges. No text or logo.',
        'Seinen anime ink of an adult florist wrapping a bouquet of peonies at her counter, a gentle everyday moment, petals and hands doubled by thin misregistered pink and cyan edges, flat deep-gray fills. No text or logo.',
        'Seinen anime ink of an adult tavern dancer caught mid-spin in a low-ceilinged hall, her skirt edge doubled in offset magenta and blue-cyan bands, stable keyline and quiet navy shadows. No text or logo.',
      ],
    },
    'SP05-269': {
      dna: ink({
        aesthetic:
          'Layered gray ink-wash illustration where translucent washes stack like smoke over everything except a few crisp negative-space windows that keep chosen contours razor-exact.',
        color_and_tone:
          'Cool graphite, smoke gray and silver; the local prompt hues show only inside the clear windows.',
        lighting_and_shadow:
          'Broad soft transitions under the washes, with a few sharply bounded highlight islands on surfaces already catching light.',
        texture_and_material:
          'Three to five stacked transparent wash layers with pooled edges and fine graphite dust, never literal smoke.',
        camera_and_composition:
          'Keep the requested camera; the clear windows sit on the focal area while the periphery hides behind more wash layers.',
        atmosphere_and_mood:
          'Withheld, calculating stillness; the viewer sees only what the artist chooses.',
        rendering_and_quality:
          'Selective clarity: razor contours inside the windows, veiled forms elsewhere, values still readable throughout.',
        key_features:
          'stacked translucent gray washes; crisp negative-space windows; graphite and silver; pooled wash edges; selective clarity',
      }),
      avoid: AVOID,
      briefs: [
        'Layered gray ink-wash illustration of two adult strategists leaning over a war-table model of a walled city, stacked translucent washes veiling the room, one crisp negative-space window revealing their hands and the tiny towers in razor-exact line. No text or logo.',
        'Layered gray ink-wash illustration of an adult spymaster holding a sealed letter by a tall window, contents unseen, graphite and silver washes pooling around him, a clear window of sharp contour on the wax seal and his eyes. No text or logo.',
        'Layered gray ink-wash illustration of a tabby cat asleep on a stack of leather ledgers in a quiet counting house, soft and gentle, smoke-gray wash layers over the shelves, a sharply bounded highlight island on the sleeping cat. No text or logo.',
      ],
    },
    'SP05-270': {
      dna: ink({
        aesthetic:
          'Dual-stroke anime ink in which contours begin as angular knife-cut lines at the edges of the image and melt into round soft watercolor strokes as they approach the focal form.',
        color_and_tone:
          'Quiet ink neutrals with a warm ochre, blush or coral wash blooming only around the focal form.',
        lighting_and_shadow:
          'Defined edge highlights on the angular outer lines turn into soft reflected wash near the center of attention.',
        texture_and_material:
          'Dry crisp line ends at the periphery and wet watercolor blooms with cauliflower edges near the focal form.',
        camera_and_composition:
          'Keep the requested framing; hardness radiates from the frame edges and softness gathers at the focus.',
        atmosphere_and_mood:
          'Harshness softening into compassion; a cold world with one warm center.',
        rendering_and_quality:
          'Two clearly legible stroke families in a gradient from angular to round, with the warm bloom contained.',
        key_features:
          'angular cuts melting into round strokes; warm bloom at the focal form; dry periphery and wet center; ink neutrals with coral; hard-to-soft gradient',
      }),
      avoid: AVOID,
      briefs: [
        "Dual-stroke anime ink of an adult exorcist kneeling to bandage a fox's paw in a burned forest, charred trunks in angular knife-cut lines that soften into round watercolor strokes around the fox, a warm coral bloom at their hands. No text or logo.",
        'Dual-stroke anime ink of an adult grandfather showing a young woman how to plant rice seedlings in a flooded paddy, angular dry lines at the frame edges melting into soft blush watercolor near their hands. No text or logo.',
        'Dual-stroke anime ink of an adult knight in scorched armor handing a loaf of bread to a refugee woman at a roadside, harsh angular strokes on the armor edges, round wet ochre blooms where the bread passes between them. No text or logo.',
      ],
    },
    'SP05-271': {
      dna: ink({
        aesthetic:
          'Post-abandonment seinen illustration in eroded straight ink contours and fine powdery grain, every broad plane bleached and dusted like concrete left for years in the sun.',
        color_and_tone:
          'Warm concrete gray, dust beige and muted ochre highlights, with greens and prompt colors lowered to half saturation.',
        lighting_and_shadow:
          'Existing highlights spread into soft bleached falloff; shadows are pale, warm and low in contrast.',
        texture_and_material:
          'Dry mineral speckle, gently abraded line edges and powdery stipple inside flat planes.',
        camera_and_composition:
          'Keep the requested camera; the picture organizes into broad quiet planes and a few exact straight edges.',
        atmosphere_and_mood: 'Hushed, sunlit mystery of a place that time has quietly taken back.',
        rendering_and_quality:
          'Faded, low-contrast illustrated finish with straight edges eroded yet still legible; never photographic.',
        key_features:
          'eroded straight contours; powdery bleached planes; concrete gray and dust ochre; soft washed-out highlights; mineral speckle',
      }),
      avoid: AVOID,
      briefs: [
        'Post-abandonment seinen illustration of a sun-bleached ruined aqueduct overgrown with vines, an adult goat-herder dozing in the shade of one arch, eroded straight ink contours, powdery concrete-gray planes and muted ochre highlights. No text or logo.',
        'Post-abandonment seinen illustration of an adult lute player practicing on the cracked steps of a collapsed stone amphitheater, broad bleached planes with mineral speckle, pale warm shadows, low contrast. No text or logo.',
        'Post-abandonment seinen illustration of an overgrown spiral stair climbing the inside of a roofless watchtower, wild poppies on every step at half saturation, abraded straight edges and dusty stipple. No text or logo.',
      ],
    },
    'SP05-272': {
      dna: ink({
        aesthetic:
          'Cool noir anime ink where every reflective surface is drawn as short broken reflection bars and thin interference lines, like light sliding over wet steel.',
        color_and_tone:
          'Steel blue, charcoal and muted silver, with a faint oil-slick violet-green on glossy edges.',
        lighting_and_shadow:
          'The original light source is kept; its reflections break into narrow discontinuous bands and dark detail stays visible.',
        texture_and_material:
          'Enamel-like sheen on glossy materials and quiet graphite grain on matte ones.',
        camera_and_composition:
          'Keep the requested framing; repeated reflection lengths pace the image in a steady horizontal rhythm.',
        atmosphere_and_mood: 'Cool, grieving restraint in which mourning shows as stillness.',
        rendering_and_quality:
          'Clean ink forms with crisp, regular reflection bars; no machinery or gadgets are added.',
        key_features:
          'broken reflection bars; thin interference lines; steel blue and silver; oil-slick edge tint; enamel sheen against graphite matte',
      }),
      avoid: AVOID,
      briefs: [
        'Cool noir anime ink of a rusted clockwork knight kneeling in the rain before a small cairn of gears, its helmet and pauldrons drawn as short broken reflection bars, steel-blue and charcoal, oil-slick tint on the wet edges. No text or logo.',
        'Cool noir anime ink of an adult widow in black polishing an old brass diving helmet at a window, reflection bars sliding across the brass in a steady rhythm, graphite-grain matte dress, muted silver light. No text or logo.',
        'Cool noir anime ink of a still millpond reflecting a silent water mill at dusk, the water surface built from thin interference lines and broken horizontal bars, steel-blue values and a faint violet-green sheen. No text or logo.',
      ],
    },
    'SP05-273': {
      dna: ink({
        aesthetic:
          'Nocturnal nature anime painting with fine silver vein-like linework traced through leaves, bark, antler, water and skin, as if living structure glowed faintly from inside.',
        color_and_tone:
          'Deep blue-teal night values with silver-blue highlights and pale mint light inside the veins.',
        lighting_and_shadow:
          'Gentle lunar falloff from above, cool reflected edges, and veins lit from within at very low intensity.',
        texture_and_material:
          'Translucent haze on organic surfaces over soft gouache-like fills, while stone and metal stay matte.',
        camera_and_composition:
          'Keep the requested framing; organic forms carry the fine detail while other areas stay calm and open.',
        atmosphere_and_mood: 'Hushed nocturnal calm, the whole world breathing slowly.',
        rendering_and_quality:
          'Soft painterly fills with fine crisp vein lines and no heavy blacks anywhere.',
        key_features:
          'silver vein linework through organic forms; blue-teal night palette; faint inner glow; lunar falloff; translucent haze',
      }),
      avoid: AVOID,
      briefs: [
        'Nocturnal nature anime painting of a stag drinking at a moonlit pool, fine silver vein linework glowing faintly through its antlers and the reeds, deep blue-teal values, pale mint light in the veins, lunar falloff. No text or logo.',
        'Nocturnal nature anime painting of an adult herbalist asleep in a hammock beneath a willow, peaceful and gentle, silver veins traced through every hanging leaf and along her open palm, soft gouache fills. No text or logo.',
        'Nocturnal nature anime painting of a mossy fallen giant tree sprouting pale mushrooms, vein-like silver lines running through bark and caps, translucent haze, stone around it left matte. No text or logo.',
      ],
    },
    'SP05-274': {
      dna: ink({
        aesthetic:
          'Cold seinen pen drawing of brittle short hatches and tiny edge grains that cluster where contours turn, like frost forming only at the corners of things, as a drawing texture rather than snow.',
        color_and_tone:
          'Slate, cold blue-gray and pale silver, with one restrained warm pivot color when the prompt provides one.',
        lighting_and_shadow:
          'Cool compact highlights against readable shadow planes under a flat overcast feel.',
        texture_and_material:
          'Dry crystalline micrograin as drawing texture, hatches two to four millimeters long and irregularly spaced.',
        camera_and_composition:
          'Keep the requested framing; hatching gathers denser behind the subject, as if something were watching from there.',
        atmosphere_and_mood: 'Guarded, guilty quiet, a breath held in the cold.',
        rendering_and_quality:
          'Brittle but controlled pen hatching, with clean white paper in the highlights.',
        key_features:
          'brittle short hatches at contour turns; slate and cold blue-gray; one warm pivot color; crystalline micrograin; uneven hatch density',
      }),
      avoid: AVOID,
      briefs: [
        'Cold seinen pen drawing of an adult woman in a heavy coat burying a small wooden box beneath a pine at dusk, brittle short hatches clustering at every contour turn, slate and blue-gray, her red mitten the one warm pivot. No text or logo.',
        "Cold seinen pen drawing of an adult innkeeper wiping a mug behind the bar while a stranger's wet boots stand by the door, crystalline micrograin at the edges of the counter, hatching thickening in the dark behind her. No text or logo.",
        'Cold seinen pen drawing of an empty sleigh left on a frozen lake under an overcast sky, tiny edge grains gathered on the runners, pale silver ice left as clean paper, uneven hatch density. No text or logo.',
      ],
    },
    'SP05-276': {
      dna: ink({
        aesthetic:
          'Dry-brush anime illustration built from repeated parallel strokes of measured length laid like drill marks, interrupted by a single clean black anchor stroke at the focal edge.',
        color_and_tone:
          'Warm faded paper, bleached ochre and softened charcoal; the prompt colors fade as if long exposed to sun.',
        lighting_and_shadow:
          'Compressed highlight contrast and a high flat sun feel with short brown shadows and no cast drama.',
        texture_and_material:
          'Matte paper tooth and disciplined abrasion; each parallel stroke varies slightly so it never becomes a mechanical fill.',
        camera_and_composition:
          'Keep the requested framing and subject count; stroke direction reinforces existing verticals and horizontals without forming ranks.',
        atmosphere_and_mood: 'Severe, rhythmic and sun-dried; discipline as a visual cadence.',
        rendering_and_quality:
          'Even-length dry-brush rhythm with one crisp dark anchor and clearly legible forms.',
        key_features:
          'measured parallel dry-brush strokes; single black anchor stroke; bleached ochre paper; compressed highlights; rhythmic cadence',
      }),
      avoid: [...AVOID, 'rows of uniformed figures'],
      briefs: [
        'Dry-brush anime illustration of an adult salt-mine overseer standing alone on a white salt terrace at noon, the terraces built from measured parallel strokes like drill marks, one clean black anchor stroke down the edge of his coat, bleached ochre paper. No text or logo.',
        'Dry-brush anime illustration of an adult stonemason squaring a limestone block with a chisel, parallel strokes following the block faces, compressed highlights and short brown shadows, a single black anchor on the chisel edge. No text or logo.',
        'Dry-brush anime illustration of an adult weaver working at a loom in a sunlit courtyard, calm and gentle, the warp threads and walls drawn in even-length dry strokes, faded ochre and soft charcoal. No text or logo.',
      ],
    },
    'SP05-277': {
      dna: ink({
        aesthetic:
          'Scratchy seinen anime drawing of scraped, slightly offset strokes that alternate rust-red oxidized marks with thin cool neon edge slips, like a poster scraped off a metal shutter.',
        color_and_tone:
          'Oxidized orange-red and rust brown over stable midtones, with contained violet or cyan slips on the edges.',
        lighting_and_shadow:
          'Colored rim accents sit only on edges that could catch them; ambient light stays low and even.',
        texture_and_material:
          'Dry scraped pigment, tiny oxidized specks and palette-knife scrapes in the backgrounds.',
        camera_and_composition:
          'Keep the requested framing; broken stroke intervals add unease inside the existing negative space.',
        atmosphere_and_mood: 'Restless young-adult dread or tenderness, raw and nervous.',
        rendering_and_quality:
          'Scraped marks stay controlled while faces and key forms remain clean and readable.',
        key_features:
          'scraped offset strokes; rust red with neon violet or cyan slips; oxidized specks; palette-knife scrapes; nervous stroke rhythm',
      }),
      avoid: AVOID,
      briefs: [
        'Scratchy seinen anime drawing of two young adults sitting on the corrugated roof of a derelict forge at dusk, rust-red scraped strokes and thin violet neon slips along their shoulders, palette-knife scrapes in the sky. No text or logo.',
        'Scratchy seinen anime drawing of a young adult stable hand calming a nervous horse in a rust-roofed barn, oxidized specks on the beams, offset scraped contours, a cool cyan slip along the horse mane. No text or logo.',
        'Scratchy seinen anime drawing of a peeling carousel horse on a stopped fairground ride at twilight, scraped rust-orange marks, broken stroke intervals in the empty space around it, one neon violet edge. No text or logo.',
      ],
    },
    'SP05-279': {
      dna: ink({
        aesthetic:
          'Graphite noir anime rendering with a narrow selective-focus band that sharpens a few contours to razor precision while the rest softens, punctuated by pinpoint red speculars.',
        color_and_tone:
          'Graphite and cool neutral grays; red appears only as two or three pinpoint speculars.',
        lighting_and_shadow:
          'Low-key directional light with precise red reflections where real surfaces in the scene would catch it.',
        texture_and_material:
          'Subdued matte planes, smooth graphite blending and occasional clean glints; no scanlines.',
        camera_and_composition:
          'Keep the requested framing; a horizontal band of sharp focus crosses the focal area like a tilted lens plane.',
        atmosphere_and_mood: 'Watchful, cold attention in which everything feels observed.',
        rendering_and_quality:
          'A crisp band against soft falloff, with no scan effects, screens or interface graphics.',
        key_features:
          'selective-focus sharp band; pinpoint red speculars; graphite grays; low-key directional light; soft falloff outside the band',
      }),
      avoid: AVOID,
      briefs: [
        'Graphite noir anime rendering of an adult castle gatekeeper watching the road from a dark arrow-slit, a narrow band of razor focus across his eyes and the stone sill, everything else softening, one pinpoint red specular on his helmet rivet. No text or logo.',
        'Graphite noir anime rendering of an owl perched on a rooftop gargoyle above a sleeping town, the band of sharp focus on its feathers and talons, soft graphite rooftops below, two red pinpoints in its eyes. No text or logo.',
        'Graphite noir anime rendering of an adult clockmaker adjusting a pocket watch at a dark workbench, a quiet gentle craft, sharp focus band across the open movement, a red jewel bearing catching a pinpoint specular. No text or logo.',
      ],
    },
    'SP05-280': {
      dna: ink({
        aesthetic:
          'Ceremonial anime ink with measured concentric rings of warm-to-dark value falloff spreading from the brightest area, and evenly spaced brush marks like ritual steps.',
        color_and_tone:
          'Amber, cream and charcoal; prompt colors warm toward amber near the center and cool toward charcoal at the rim.',
        lighting_and_shadow:
          'A small warm bloom from an existing bright area, falling off in four to six visible value steps with readable shadows.',
        texture_and_material:
          'Smooth luminous washes bounded by crisp ink rings, clean rather than smoky or glittering.',
        camera_and_composition:
          'Keep the requested framing; the radial value rhythm centers on the brightest point already in the scene.',
        atmosphere_and_mood: 'Solemn ritual cadence, the stillness before a judgment.',
        rendering_and_quality:
          'Stepped radial value bands, crisp ink boundaries and a controlled bloom that never washes out form.',
        key_features:
          'concentric stepped value rings; amber, cream and charcoal; warm bloom from existing light; evenly spaced brush marks; ritual cadence',
      }),
      avoid: AVOID,
      briefs: [
        'Ceremonial anime ink of an adult priestess lighting a ring of votive candles on a crypt floor, concentric stepped rings of amber-to-charcoal value spreading from the flames, evenly spaced brush marks on the flagstones. No text or logo.',
        'Ceremonial anime ink of four adult siblings sharing soup around a farmhouse hearth on a winter night, warm and gentle, the fire the center of measured value rings fading from cream to charcoal across their faces. No text or logo.',
        'Ceremonial anime ink of an adult smith silhouetted before the glowing mouth of a forge, rings of warm falloff stepping outward across the smithy walls in five clean bands, crisp ink ring boundaries. No text or logo.',
      ],
    },
    'SP05-275': {
      dna: ink({
        aesthetic:
          'Manga screentone illustration where contours print twice, slightly offset, and halftone density shifts across a single form, so the image looks like a rumor retold: the same thing, not quite matching.',
        color_and_tone: 'Charcoal, pale gray and white screentone with one small red accent.',
        lighting_and_shadow:
          "Soft overlaps in the offset zones and a few crisp edges under the prompt's existing light.",
        texture_and_material:
          'Fine screentone dots alternating with clean unprinted gaps; no text, signs or captions.',
        camera_and_composition:
          'Keep the requested framing and count; density shifts move emphasis between elements without adding people.',
        atmosphere_and_mood: 'Uneasy uncertainty, a whisper living inside the halftone.',
        rendering_and_quality:
          'Print-like offset keylines, clean dot gradients and a single red accent.',
        key_features:
          'doubled offset contours; shifting halftone density; charcoal and pale gray screentone; one red accent; unprinted gaps',
      }),
      avoid: AVOID,
      briefs: [
        'Manga screentone illustration of three adult washerwomen whispering at a river stone while scrubbing linen, contours printed twice slightly offset, halftone density shifting across their backs, one red kerchief the only accent. No text or logo.',
        'Manga screentone illustration of an adult noble stepping down from a carriage while shutters crack open along a narrow street, doubled keylines on the carriage, dense dots in the windows and clean unprinted gaps. No text or logo.',
        'Manga screentone illustration of two magpies chattering on a crooked chimney above a village, offset contour echoes around their tails, pale gray screentone sky, a tiny red berry in one beak. No text or logo.',
      ],
    },
    'SP05-066': {
      dna: ink({
        aesthetic:
          'Clinical thriller ink that maps fine branching seam lines and pale faceted planes across the surface of objects and architecture, like a dissection diagram drawn on porcelain, without revealing any interior.',
        subject_treatment: personFree,
        color_and_tone:
          'Bone, ceramic gray and pale celadon, with a very limited crimson stress accent at one seam junction.',
        lighting_and_shadow:
          'Precise pale edge glints against soft shadow under even cabinet light, with no spotlight.',
        texture_and_material:
          'Matte porcelain fields, hairline seams of constant width and tiny dry crazing cracks.',
        camera_and_composition:
          "Keep the requested framing; seam lines follow the form's own contours and panel breaks, nothing is opened or cut.",
        atmosphere_and_mood: 'Cold, intrusive curiosity about a form studied too closely.',
        rendering_and_quality:
          'Precise diagrammatic seams on faceted planes, clean and illustrated rather than a photographed object.',
        key_features:
          'branching seam lines on surfaces; pale faceted planes; bone and ceramic gray; single crimson junction; porcelain crazing',
      }),
      avoid: AVOID,
      briefs: [
        'Clinical thriller ink of a porcelain tea set laid on a lace tablecloth, a gentle afternoon setting, fine branching seam lines mapping each cup into pale faceted planes, bone and celadon values, one crimson dot at a seam junction on the teapot. No people, text or logo.',
        'Clinical thriller ink of a bronze church bell hanging in a timber frame, seen from below, seam lines branching across its surface like a diagram, tiny crazing cracks, precise pale edge glints. No people, text or logo.',
        'Clinical thriller ink of a wilting lily in a tall glass vase on a bare shelf, the petals divided into faceted porcelain planes by hairline seams, ceramic-gray shadow, a single crimson stress mark where two seams meet. No people, text or logo.',
      ],
    },
    'SP05-069': {
      dna: ink({
        aesthetic:
          'Grounded low-fantasy anime ink with scuffed matte planes, chipped contour edges and narrow slices of light that show how everyday things are made and worn.',
        color_and_tone:
          'Worn stone gray, dull iron, undyed linen and subdued earth accents with no saturated color.',
        lighting_and_shadow:
          'Restrained practical-looking contrast with narrow slices of light laid across a few planes.',
        texture_and_material:
          'Sparse abrasion, rubbed pigment and chipped edges on wood, iron and leather; every material keeps its identity.',
        camera_and_composition:
          'Keep the requested camera, subject count and arrangement; this treatment never adds an adventurer.',
        atmosphere_and_mood: 'Tactile, practical, lived-in grit without forced danger.',
        rendering_and_quality:
          'Chipped contour edges, matte planes and clear construction logic in every object.',
        key_features:
          'chipped contour edges; scuffed matte planes; stone gray, iron and linen; narrow light slices; rubbed pigment',
      }),
      avoid: AVOID,
      briefs: [
        'Low-fantasy anime ink of an adult tanner scraping a stretched hide in a riverside yard, scuffed matte planes and chipped contour edges on the frame and tools, stone gray and undyed linen, a narrow slice of light across the hide. No text or logo.',
        'Low-fantasy anime ink of an adult wheelwright repairing a broken cart wheel beside a village granary, rubbed pigment on the spokes, chipped iron rim, worn earth palette. No text or logo.',
        'Low-fantasy anime ink of an adult cook stirring a cauldron of stew in a cramped inn kitchen, a warm ordinary evening, scuffed pots and chipped wooden ladles, narrow slices of light from a high window. No text or logo.',
      ],
    },
    'SP05-061': {
      dna: ink({
        aesthetic:
          'Dense pen crosshatch seinen manga that builds shadow in three to five layered hatch directions and stops cleanly at large open paper areas, so forms feel carved and heavy.',
        color_and_tone:
          'Charcoal black and bone white with a narrow muted red-brown accent; mostly monochrome.',
        lighting_and_shadow:
          'A hard single source; broad shadow masses cover most of the frame against a few exposed edges.',
        texture_and_material:
          'Fine nib lines whose direction and spacing change with every plane; no photoreal grime.',
        camera_and_composition:
          'Keep the requested framing; empty paper areas act as counterweight to the dense hatching.',
        atmosphere_and_mood: 'Oppressive weight and grim endurance, even in a quiet scene.',
        rendering_and_quality:
          'Meticulous nib crosshatching with clean white gaps and legible detail inside the darks.',
        key_features:
          'layered three-to-five direction crosshatch; clean open paper gaps; charcoal and bone; dominant shadow mass; hard single source',
      }),
      avoid: AVOID,
      briefs: [
        'Dense crosshatch seinen manga of an adult gravedigger resting on his spade in a hilltop cemetery under a storm sky, shadow built from layered nib hatching in four directions, clean white gaps in the clouds, bone and charcoal. No text or logo.',
        'Dense crosshatch seinen manga of a colossal abandoned siege tower on an empty plain, low sun behind it, carved heavy shadow in crossed hatch layers, a narrow red-brown accent on its rusted chains. No text or logo.',
        'Dense crosshatch seinen manga of an adult potter centering clay on a wheel in a stone workshop, a calm and gentle task, heavy crosshatched shadow around her and one hard window light on her hands. No text or logo.',
      ],
    },
    'SP05-062': {
      dna: ink({
        aesthetic:
          'Lacquer anime illustration in which a nonhuman subject or object seems to shed its surface: split translucent lacquer plates, membrane-thin overlaps and fine crimson seams in clean ink.',
        subject_treatment: personFree,
        color_and_tone:
          "Black, bone and the subject's own colors, with deep red limited to the seams.",
        lighting_and_shadow:
          'Thin transmitted light glows through the membranes, with localized red bounce beside each seam.',
        texture_and_material:
          'Polished lacquer plates set against soft translucent film, never turned into a mask or specimen.',
        camera_and_composition:
          'Keep the requested framing, subject count and pose; the image stays entirely free of people.',
        atmosphere_and_mood: 'Quiet metamorphic tension, a change happening in silence.',
        rendering_and_quality:
          'Clean lacquer highlights and crisp seam lines with readable underlying form.',
        key_features:
          'split translucent lacquer plates; membrane-thin overlaps; crimson seams; transmitted edge light; no person required',
      }),
      avoid: [...AVOID, 'mask', 'face'],
      briefs: [
        'Lacquer anime illustration of a moth emerging from its cocoon on a thorn branch, the cocoon splitting into translucent lacquer plates with fine crimson seams, thin light passing through the membrane wings. No people, text or logo.',
        'Lacquer anime illustration of a ripe pomegranate splitting open on a black plate, its skin lifting in polished lacquer plates, membrane-thin overlaps and deep red seams, bone-white ground. No people, text or logo.',
        'Lacquer anime illustration of a crab shedding its old shell on a tidal rock at low tide, the empty shell a split lacquer casing, soft translucent new carapace beneath, crimson seam lines. No people, text or logo.',
      ],
    },
    'SP05-063': {
      dna: ink({
        aesthetic:
          'Gothic seinen poster ink with hard black and crimson color blocks edged by fine tapered hairlines that decorate only existing contours; flat and heraldic.',
        color_and_tone: 'Crimson, ink black and pale ivory in a strict three-value hierarchy.',
        lighting_and_shadow:
          'Crisp controlled highlights and clean hard shadow edges, without glowing symbols or shafts of light.',
        texture_and_material:
          'Flat opaque gouache-like pigment with sparse etched detail on the edges only.',
        camera_and_composition:
          'Keep the requested framing; large color-block proportions carry authority rather than forced symmetry.',
        atmosphere_and_mood: 'Composed, theatrical command held with cold, upright dignity.',
        rendering_and_quality: 'Hard-edged blocks, hairline edge ornament and no gradients at all.',
        key_features:
          'flat crimson and black blocks; tapered hairline edge ornament; ivory highlights; three-value hierarchy; hard shadow edges',
      }),
      avoid: AVOID,
      briefs: [
        'Gothic seinen poster ink of an adult regent standing at a tall window above a snowbound city, his coat a single hard crimson block against ink black, tapered hairline ornament along the window tracery, ivory highlights. No text or logo.',
        'Gothic seinen poster ink of an adult matriarch in a high-backed chair with a black hound lying at her feet, flat black and crimson blocks, fine hairline edges on the chair carving, strict three-value hierarchy. No text or logo.',
        'Gothic seinen poster ink of a red-sailed galley gliding into a black harbor at dusk, the sails as hard crimson blocks, ivory wake, hairline ornament only along the hull contours. No text or logo.',
      ],
    },
    'SP05-064': {
      dna: ink({
        aesthetic:
          'Weathered travel-epic anime ink in long dry directional brushstrokes that skim the silhouettes and taper into sparse mineral abrasion, like wind-scored rock.',
        color_and_tone:
          'Muted earth, faded blue-gray and chalk highlights; no saturated color survives the weathering.',
        lighting_and_shadow:
          'Broad open midtones under overcast plains light, with a few thin edge highlights.',
        texture_and_material:
          'Dry-brush drag, soft pigment loss and abraded stroke tails; smooth or delicate materials stay intact.',
        camera_and_composition:
          'Keep the requested camera; stroke direction follows the forms already there rather than adding wind.',
        atmosphere_and_mood: 'Worn endurance with a faint hope, redemption as a quiet reading.',
        rendering_and_quality:
          'A steady rhythm of long strokes and a readable silhouette; no ink splatter.',
        key_features:
          'long dry directional strokes; tapering abrasion tails; earth and faded blue-gray; chalk highlights; broad open midtones',
      }),
      avoid: AVOID,
      briefs: [
        'Weathered travel-epic anime ink of an adult pilgrim woman climbing a rocky mountain pass with a walking staff, long dry directional brushstrokes skimming her shawl and the rocks, faded blue-gray and chalk highlights. No text or logo.',
        'Weathered travel-epic anime ink of a lone wind-bent tree on an open steppe, its trunk and the grass drawn in long dry strokes tapering into mineral abrasion, muted earth palette, broad open midtones. No text or logo.',
        'Weathered travel-epic anime ink of an adult nomad leading a laden pack mule across a dusty plateau, abraded stroke tails on the packs, chalk edge highlights, faded blue-gray sky. No text or logo.',
      ],
    },
    'SP05-065': {
      dna: ink({
        aesthetic:
          'Pale seinen horror line art of open white planes, thin silver-gray edge gaps and deliberately withheld contour segments, so forms dissolve into the paper at their edges.',
        color_and_tone:
          'Ash white, cool silver and very pale local colors; darks are rare and small.',
        lighting_and_shadow:
          'Quiet diffuse high-key light with very few fine highlights and almost no cast shadow.',
        texture_and_material:
          'Clean matte washes with a faint paper grain and no fog overlay unless the prompt asks for it.',
        camera_and_composition:
          'Keep the requested framing; generous negative space and contour gaps create a threshold feeling.',
        atmosphere_and_mood: 'Subtle wrongness and a quiet, bright, high-key unease.',
        rendering_and_quality:
          'Sparse, pale, withheld lines that stay legible; no jump-scare darkness.',
        key_features:
          'high-key pale planes; withheld contour segments; silver-gray edge gaps; ash-white palette; rare small darks',
      }),
      avoid: AVOID,
      briefs: [
        'Pale seinen horror line art of an adult bride in white standing at the edge of a birch wood at noon, her veil and the birch trunks dissolving into the paper through withheld contour segments, silver-gray edge gaps, ash-white palette. No text or logo.',
        'Pale seinen horror line art of an empty rocking chair on a pale farmhouse porch, contour gaps along the rockers, high-key diffuse light, one small dark in the open doorway. No text or logo.',
        'Pale seinen horror line art of an adult fisherman mending a white net on a bleached pier, quiet and ordinary, net and planks fading into open white planes, thin silver edge gaps. No text or logo.',
      ],
    },
    'SP05-067': {
      dna: ink({
        aesthetic:
          'Deep-water anime painting in layered teal values with translucent edge glazes and low-contrast pore marks, as if the subject were seen through fathoms of water.',
        color_and_tone: 'Blue-green shadows and deep teal with restrained pale cyan accents.',
        lighting_and_shadow:
          'Dim color seemingly held inside surfaces, falling off in layered steps with depth; no added glow source.',
        texture_and_material:
          'Damp patina, fine mineral grain and pore stipple only on surfaces that can carry them.',
        camera_and_composition:
          'Keep the requested framing and number of forms; layered value falloff separates depth.',
        atmosphere_and_mood: 'Solemn, lush pressure, beautiful and costly at once.',
        rendering_and_quality:
          'Glazed layers with soft distant edges and crisp near edges, values readable to the back.',
        key_features:
          'layered teal value falloff; translucent edge glazes; pore stipple; pale cyan accents; damp patina',
      }),
      avoid: AVOID,
      briefs: [
        'Deep-water anime painting of a sunken galleon figurehead overgrown with kelp, layered teal values stepping back into darkness, translucent glazes on its carved edges, pale cyan accents on the kelp. No text or logo.',
        'Deep-water anime painting of an adult pearl diver drifting down beside a coral wall, calm and graceful, damp patina and pore stipple on the coral, her figure glazed in blue-green layers. No text or logo.',
        'Deep-water anime painting of a flooded chapel with small fish drifting between the pews, layered teal falloff from the near pews to the far altar, mineral grain on the stone. No text or logo.',
      ],
    },
    'SP05-068': {
      dna: ink({
        aesthetic:
          'Grimy dark-fantasy anime ink where scuffed black masses collide with chipped color edges and contour joins break abruptly, as if two drawings were forced together.',
        color_and_tone:
          'Soot-dark neutrals with one or two sharply bounded accents such as acid yellow or bruise violet.',
        lighting_and_shadow:
          'Small directional highlights; value collisions do the work instead of glowing magic effects.',
        texture_and_material:
          'Dry soot grain, chipped pigment and short stain-like strokes that never become sigils.',
        camera_and_composition:
          'Keep the requested framing and count; mark density concentrates where forms meet.',
        atmosphere_and_mood: 'Cramped, volatile grime energy, a room that might ignite.',
        rendering_and_quality: 'Controlled collision marks with every form still readable.',
        key_features:
          'scuffed ink masses; chipped color edges; broken contour joins; soot neutrals with bounded accent; stain-like strokes',
      }),
      avoid: AVOID,
      briefs: [
        'Grimy dark-fantasy anime ink of an adult hedge witch knocking a smoking acid-yellow potion into a spilled inkpot on her cluttered workbench, scuffed black masses colliding with chipped color edges, broken contour joins where the liquids meet. No text or logo.',
        'Grimy dark-fantasy anime ink of a cramped apothecary shelf where toppled jars spill bruise-violet and soot-black powders together, stain-like strokes and dry soot grain, dense marks at the collision. No text or logo.',
        'Grimy dark-fantasy anime ink of an adult tinker repairing a clockwork crow in a soot-black workshop, chipped pigment on the brass, one acid-yellow accent in its eye, abrupt contour breaks. No text or logo.',
      ],
    },
    'SP05-070': {
      name: 'Neon Tragic Metamorphosis',
      dna: ink({
        aesthetic:
          'Elastic neon anime drawing where contours stretch like rubber into short magenta-cyan color smears and snap back, built from loose flat shapes held by thick black anchor lines.',
        color_and_tone:
          'Acid pink, cyan and black pressing against each other in selective bands, with local colors retained underneath.',
        lighting_and_shadow:
          'Blacklight-like color response drawn only as an edge treatment, without smoke, fixtures or a night setting.',
        texture_and_material:
          'Translucent color drag anchored by opaque ink, so materials stay recognizable under the smears.',
        camera_and_composition:
          'Keep the requested camera, count and silhouette; color elasticity, not new choreography, carries the style.',
        atmosphere_and_mood: 'Feverish emotional overload with tenderness underneath the noise.',
        rendering_and_quality:
          'Loose flat shapes, clean-edged smears and thick anchors; no anatomy horror.',
        key_features:
          'elastic stretched contours; magenta-cyan smears; thick black anchor lines; blacklight edge color; loose flat shapes',
      }),
      avoid: AVOID,
      briefs: [
        'Elastic neon anime drawing of an adult trapeze acrobat letting go of the bar in an empty circus tent, her contours stretching into short magenta-cyan smears and snapping back, thick black anchor lines, acid pink and black bands. No text or logo.',
        'Elastic neon anime drawing of a young adult street musician playing a saxophone on a stoop at dusk, the horn bell stretching into cyan smears, loose flat shapes, blacklight pink on the edges. No text or logo.',
        'Elastic neon anime drawing of an adult woman laughing and crying while eating birthday cake alone at a kitchen table, tender and gentle, her outline smearing into magenta and cyan, thick black anchors holding her face readable. No text or logo.',
      ],
    },
  },
};

export const aliases = { 'SP05-070': 'Devilman Crybaby – Neon Tragic Metamorphosis' };

export default spec;
