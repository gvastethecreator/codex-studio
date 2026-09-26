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
        "Kneeling in a white grass meadow above the sea, a gem-bodied gardener with translucent emerald hair carefully glues a chipped fingertip back on while the sun throws rainbow flecks across the ground around her. No readable text or logo.",
        "Two crystal-bodied scholars in black uniforms argue about the tides on a cliff, their faceted faces scattering blue light onto each other every time they turn their heads. No readable text or logo.",
        "On a silent seaside beach, a single cracked shard of pale amber crystal lies half buried in the sand, glowing softly as the waves pull back. No readable text or logo.",
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
        "Standing on a burned hillside at dusk, a weary mercenary captain in dented armor watches the sun slowly turn black while her band kneels silently in the mud around her banner. No readable text or logo.",
        "Around a campfire in a ruined abbey, a grizzled sellsword teaches a young squire to mend chainmail as rain drums on the broken roof above them. No readable text or logo.",
        "A cracked iron helmet rests on a fence post beside an empty battlefield, crows lined up along the rail in the grey evening light. No readable text or logo.",
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
        "At the end of a long hospital corridor at night, a tired surgeon in a white coat stops as a pair of polished shoes appears in the doorway of the room she just left empty. No readable text or logo.",
        "In a small European bakery at dawn, a retired detective buys bread while watching a stranger in the window reflection who never seems to blink. No readable text or logo.",
        "An empty park bench in a snowy European square holds a folded newspaper and a single leather glove that nobody has come back for. No readable text or logo.",
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
        "Waking up in an empty Tokyo apartment wearing a glossy black suit she never bought, an office worker in her forties stares at a row of strangers who all look just as confused as she is. No readable text or logo.",
        "Two salarymen in glossy black suits hide behind a vending machine on a real-looking Tokyo street, watching a giant stone statue slowly turn its head. No readable text or logo.",
        "In a silent apartment at midnight, a single glossy black glove lies on the tatami mat, its circular node blinking faint blue. No readable text or logo.",
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
        "Washed up on a pastel seaside beach at dawn, a horned woman in a torn hospital gown sits hugging her knees as gold mosaic patterns shimmer across the waves like a painted dream. No readable text or logo.",
        "Behind thick glass in a white laboratory, a calm horned patient watches the researchers nervously, the gold pattern on the wall glowing brighter as they step back. No readable text or logo.",
        "On a quiet seaside veranda, a single seashell rests on a white hospital bracelet in the warm evening light. No readable text or logo.",
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
        "Riding a black horse across a moonlit wasteland toward a baroque castle, a pale bounty hunter in a sweeping rose-black cape passes a field of wilted roses that slowly bloom again behind her. No readable text or logo.",
        "In a candlelit baroque ballroom, an aristocratic vampire couple dance alone among hundreds of empty chairs draped in black lace. No readable text or logo.",
        "A single black rose rests on a moonlit stone balcony, its petals frosted with pale silver dew. No readable text or logo.",
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
        "Running down a concrete stairwell with a police siren echoing below, a fugitive nurse glances back as a tall phantom made of drifting black ash silently mirrors her every step. No readable text or logo.",
        "A tired fugitive eats instant noodles in a laundromat while his black particle phantom sits awkwardly on the next machine. No readable text or logo.",
        "In an empty underpass, a thin stream of black ash particles drifts upward from a single abandoned shoe. No readable text or logo.",
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
        "Crossing a snowy Edo bridge in a patched kimono, a scruffy ronin with a strange forked blade stops to buy chestnuts from a vendor while three bounty hunters wait at the far end. No readable text or logo.",
        "By candlelight in a cluttered Edo workshop, an old weaponsmith sketches designs for impossible forked and hooked blades on sheets of rough paper pinned to the wall. No readable text or logo.",
        "A broken sword hilt lies in fresh snow outside an empty teahouse at dawn, pencil-grey mist around it. No readable text or logo.",
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
        "Sweating over a single playing card at a neon-lit underground table, a broke delivery driver with an impossibly pointed chin feels the whole room swirl around him as his opponent slowly smiles. No readable text or logo.",
        "Twelve anxious men balance on a narrow steel beam between skyscrapers at night, each one sweating enormous drops. No readable text or logo.",
        "A single cheap ticket lies crumpled on a neon floor, swirling black patterns closing in around it. No readable text or logo.",
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
        "In a smoke-filled postwar mahjong parlor, a calm old woman with a sharp pointed face places a single tile as three gangsters around the table freeze, sweat running down their temples. No readable text or logo.",
        "A cigarette burns down to ash in an ashtray while two players stare each other down in silence. No readable text or logo.",
        "Under a single lamp swinging from a smoky ceiling, an empty mahjong table glows green in the dark, one tile left standing on its edge. No readable text or logo.",
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
        "Sharing a burnt rice cake on the steps of a ruined Sengoku shrine, a wandering swordsman with carved wooden hands and a sharp-tongued old thief watch a demon shadow slide across the valley below. No readable text or logo.",
        "A village healer carves a new wooden foot for a farmer by lamplight while the rain drums outside. No readable text or logo.",
        "In a flooded rice paddy at dusk, an abandoned carved wooden hand lies palm up among the reeds while a heron watches it from the bank. No readable text or logo.",
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
        "Walking along a sun-bleached highway overgrown with wildflowers, two middle-aged travelers with heavy backpacks stop as something enormous shifts inside a moss-covered shopping mall ahead. No readable text or logo.",
        "A traveler naps inside an abandoned train car while vines creep through the broken windows around her. No readable text or logo.",
        "In a sunny meadow where a town used to be, a rusted vending machine stands among tall grass with a bird building a nest on top. No readable text or logo.",
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
        "Standing in the rain outside a flower shop, a robot detective in a trench coat quietly buys a bouquet for a colleague whose memory chip was recovered that morning. No readable text or logo.",
        "An old robot gardener waters roses in a quiet European courtyard while a detective watches from the window. No readable text or logo.",
        "An empty trench coat hangs on a hook in a dim office, rain streaking the window. No readable text or logo.",
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
        "Burying a small glowing creature at the edge of a misty mountain spring, a quiet rural healer kneels as tiny translucent lights rise from the moss around her hands and drift into the night. No readable text or logo.",
        "A fisherman watches a river of faint glowing lights flow beneath the water under his boat. No readable text or logo.",
        "At dusk along a silent forest path, tiny glowing spores drift over the moss like slow snow while an old wooden signpost leans into the ferns. No readable text or logo.",
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
        "Waking up twenty years in the past on a snowy morning, a middle-aged manga artist stares out of his mother’s kitchen window at a neighbor he knows will disappear by the end of winter. No readable text or logo.",
        "Two adults sit in a parked car in a snowy lot, watching a house with its lights off. No readable text or logo.",
        "On a snowy fence at the edge of a frozen park, a single red scarf flutters in the wind beside a row of footprints that suddenly stop. No readable text or logo.",
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
        "In a sun-bleached Edo courtyard at noon, two samurai with hyper-detailed tense muscles hold a practice stance for so long that the shadows on the stones slowly move across their feet. No readable text or logo.",
        "An aged sword master pours water over his head in a stone courtyard, every muscle carved in harsh light. No readable text or logo.",
        "In a sun-bleached stone courtyard at noon, a single wooden practice sword lies alone, its short shadow the only dark shape in the whole space. No readable text or logo.",
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
        "Walking home under a rust-colored sky full of flickering neon, an office worker notices that every streetlight dims as she passes, while a column of pale light hangs silently over the city. No readable text or logo.",
        "Behind a convenience store at midnight, a night-shift clerk hears a thin whistled tune from the empty alley, the sepia light around her slowly vignetting to black. No readable text or logo.",
        "In a vignetted rust-colored playground at dusk, a single rusted swing moves back and forth by itself while every window around it stays dark. No readable text or logo.",
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
        "Standing in a rain-soaked alley of an alternate postwar city, a squad of heavily armored police troopers turns as one, their red glowing optics reflecting in the puddles around a frightened courier. No readable text or logo.",
        "In a harshly lit locker room, an armored trooper removes his heavy helmet with red optics, revealing a tired, ordinary middle-aged face with a small bandage. No readable text or logo.",
        "Deep in a dark concrete sewer tunnel, a pair of red optic lenses glows steadily above the black water, reflected in long trembling streaks. No readable text or logo.",
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
        "Drifting down a crimson river under an eternal twilight sky, a silent ferryman in a straw hat poles a small boat past banks of red spider lilies while a guilty businessman clutches his briefcase. No readable text or logo.",
        "Along a dark river under a crimson twilight sky, a lone paper lantern floats slowly downstream while red spider lilies glow along both banks. No readable text or logo.",
        "On the gate of a twilight shrine, a single red thread is tied tightly around a small straw doll that sways gently in the warm wind. No readable text or logo.",
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
        "Across a crowded Tokyo crosswalk, dozens of ordinary commuters all glance nervously at the same empty manhole cover, each one sure they heard something rolling beneath it. No readable text or logo.",
        "In a cramped apartment, a tired detective interviews a grandmother who swears her television whispered her name, while the screen behind them shows only static. No readable text or logo.",
        "At night on an empty apartment staircase lit by one flickering bulb, a single golden roller skate sits on a step as if someone just left it. No readable text or logo.",
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
        "Sitting calmly at a family dinner table, a polite father’s face slowly unfolds into a strange flower of smooth grey petals while his wife keeps serving rice without looking up. No readable text or logo.",
        "A school counselor with a calm deadpan face listens while her shadow on the wall moves independently. No readable text or logo.",
        "An empty dinner table set for four has one chair pushed back, a bowl still steaming. No readable text or logo.",
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
        "Holding a torch at the mouth of a damp cave, a methodical middle-aged adventurer in cheap dented armor checks a hand-drawn map for the third time while her tired party waits in the mud. No readable text or logo.",
        "In a village stable by torchlight, a grim adventurer sharpens a short sword with slow careful strokes while the horses watch nervously from their stalls. No readable text or logo.",
        "Outside a rough guild hall at grey dawn, a dented steel helmet rests on an overturned barrel beside a half-eaten loaf of bread. No readable text or logo.",
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
        "Standing alone on a scaffold in a crowded baroque square under a storm, a condemned executioner in a black coat looks up as the entire sky is carved into dense crosshatched clouds pressing down on the city. No readable text or logo.",
        "A climber hangs from a frozen cliff face as the mountain above is rendered in crushing crosshatch. No readable text or logo.",
        "An empty baroque theater stage is lit by a single candle, the darkness dense around it. No readable text or logo.",
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
        "Sitting alone in a coffee shop at closing time, a pale barista in a black apron stares at her own reflection as one of her eyes slowly bleeds crimson watercolor into the glass. No readable text or logo.",
        "A masked stranger stands on a rooftop at night, crimson ink dripping from the edge of the mask. No readable text or logo.",
        "A single coffee cup sits on an empty counter, a crimson watercolor bloom spreading beneath it. No readable text or logo.",
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
        "Standing at the head of a gothic manor staircase in a crimson greatcoat, an elderly aristocratic commander lights a cigar as moonlight and huge black shadows spill down the steps below her. No readable text or logo.",
        "In a gothic kitchen at midnight, an elderly butler with a manic grin polishes a long row of silver candlesticks while thunder shakes the windows. No readable text or logo.",
        "On the moonlit marble floor of an empty manor hall, a single crimson glove lies beside a toppled chess piece and a broken candle. No readable text or logo.",
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
        "Plowing a stony field on a wind-scoured northern farm, a former warrior with a scarred face pauses to watch a flock of geese fly over the fjord, his hands finally steady on the plow. No readable text or logo.",
        "Two farmhands share bread on a stone wall as a storm rolls in over the sea. No readable text or logo.",
        "On a peaceful northern farm at sunrise, a broken sword has been hammered into the ground as a fence post, a sheep grazing right beside it. No readable text or logo.",
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
        "At the gate of a fog-bound medieval village, a pale silver-eyed woman in a grey cloak waits silently while the villagers peer from their shutters, unsure whether to fear her or the thing in the forest. No readable text or logo.",
        "A pale warrior eats plain bread alone at the edge of a tavern, everyone else keeping their distance. No readable text or logo.",
        "At dawn in an empty country inn, a pale silver cloak hangs on a wooden hook while its owner’s untouched breakfast cools on the table. No readable text or logo.",
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
        "Descending a rope into a vast lush chasm filled with glowing forests on floating islands, a round-faced grandmother explorer with a huge backpack gasps at a creature gliding past like a living cathedral. No readable text or logo.",
        "Two adult explorers camp on a ledge in the abyss, cooking strange mushrooms over a tiny stove. No readable text or logo.",
        "Above an endless green drop inside the abyss, a single explorer’s whistle hangs from a twisted root, swinging slowly in the rising warm wind. No readable text or logo.",
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
        "Eating dumplings in a grimy industrial alley, a stocky sorcerer in a cracked porcelain rabbit mask argues with a plumber over who ruined the neighborhood’s pipes with a curse. No readable text or logo.",
        "In a smoky cramped kitchen, a couple in cracked animal masks dance slowly to a scratchy radio while a pot of stew bubbles over onto the stove. No readable text or logo.",
        "In a grimy alley between rusted pipes, a cracked porcelain mask hangs from a nail, dripping rainwater from its empty eye holes. No readable text or logo.",
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
        "Sprinting through a neon-lit club crowd with tears streaming down his face, a sensitive track runner feels his body stretch and change as the lights strobe magenta and blue around him. No readable text or logo.",
        "A group of rappers perform on a rooftop while a demonic shape looms in the neon smoke behind them. No readable text or logo.",
        "Outside a neon club at three in the morning, a single running shoe lies in a magenta puddle while the bass still thumps through the wall. No readable text or logo.",
      ],
    },
  },
};

export const aliases = { 'SP05-070': 'Devilman Crybaby – Neon Tragic Metamorphosis' };

export default spec;
