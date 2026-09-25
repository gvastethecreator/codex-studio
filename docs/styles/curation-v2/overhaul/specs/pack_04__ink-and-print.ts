import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'readable text',
  'brand logo',
  'franchise likeness',
  'printmaker holding a plate or print',
  'digital smooth gradient',
];

// Every preset redraws the subject with its own physical mark (gouge, bitten line, scraped line, dot, stamp, nib).
// Review rule: one neutral subject must look different in linocut, etching and scratchboard, so each mark is named precisely.
const printed =
  "Keep the prompt subject, action, setting and camera, and redraw them entirely with this process's own physical mark, so the same subject would read differently in any neighbouring ink or print technique.";

function ip(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? printed, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_04',
  category: '5. Ink And Print',
  updates: {
    'SP04-023': {
      dna: ip({
        aesthetic:
          'Scratchboard: white lines scraped with a knife and fiberglass brush out of a black ink layer on white clay board, light built entirely by removal.',
        color_and_tone:
          'Pure black field with bright clay-white lines; at most one tint washed into scratched areas only.',
        lighting_and_shadow:
          'Light exists only where the board is scraped: dense parallel scratches for highlights, sparse ones for halftone, untouched black for shadow.',
        texture_and_material:
          'Crisp knife-cut white hairlines, stippled scrapes from a fiberglass brush, contour-following parallel strokes and chalky white clay.',
        camera_and_composition:
          'Keep the requested view; the subject emerges from black while the background stays unscratched.',
        atmosphere_and_mood: 'Nocturnal, crisp and revelatory, light pulled out of darkness.',
        rendering_and_quality:
          'Razor-clean white lines of even hardness, no grey wash and no pen-drawn black lines.',
        key_features:
          'subtractive white lines on black; knife and fiberglass scratch marks; contour-following hatching; untouched black shadows; chalky clay white',
      }),
      avoid: [...AVOID, 'black lines drawn on white', 'grey wash'],
      briefs: [
        'Scratchboard of a barn owl gliding low over a moonlit churchyard, every feather scraped as contour-following white hairlines out of the black clay board, gravestones barely scratched from the darkness. No text or logo.',
        'Scratchboard of a coiled adder on a gnarled tree root, scales picked out with short knife flicks, fiberglass-brush stipple on the bark. No text or logo.',
        "Scratchboard of a heavy iron door knocker shaped like a lion's head, seen close and frontal, highlights built from dense parallel scratches. No text or logo.",
      ],
    },
    'SP04-061': {
      dna: ip({
        aesthetic:
          'Linocut relief print: the image carved into linoleum with V and U gouges, uncarved areas printed as flat solid ink and carved areas left paper white.',
        color_and_tone:
          'One or two flat ink colors, usually black plus one warm color, on cream paper with no gradients.',
        lighting_and_shadow:
          'Light expressed by how much is carved away: bold white gouge strokes in highlights, solid black in shadow.',
        texture_and_material:
          'Directional gouge strokes following the forms, chattering chisel edges, speckled uneven ink roll with paper showing through the solids.',
        camera_and_composition:
          'Keep the requested view; forms simplified into bold shapes and strong black-white pattern areas.',
        atmosphere_and_mood: 'Bold, handmade and earthy, carved with a strong hand.',
        rendering_and_quality:
          'Chunky relief print with slight ink squash at the edges; no fine hairlines and no halftone.',
        key_features:
          'V and U gouge strokes; flat solid ink areas; speckled ink roll; one or two colors; directional carving rhythm',
      }),
      avoid: [...AVOID, 'fine hairline hatching', 'halftone dots'],
      briefs: [
        'Linocut print of a wild boar charging through a winter beech wood, gouge strokes following its bristles and the tree bark, black and rust-red ink on cream with speckled solids. No text or logo.',
        'Linocut print of an adult potter hunched at a kick wheel, wet clay spiralling under her hands, carved white rings echoing the spin. No text or logo.',
        'Linocut print of a stack of firewood beside an axe buried in a chopping block, chattering chisel edges on every log end. No text or logo.',
      ],
    },
    'SP04-062': {
      dna: ip({
        aesthetic:
          'Hard-ground line etching: lines needled through wax on a copper plate and bitten in acid, printed in black intaglio ink with fine crosshatching.',
        color_and_tone:
          'Warm black or sepia ink on off-white rag paper, with a faint plate tone wiped across the sheet.',
        lighting_and_shadow:
          'Value built by line density and repeated bites: single fine lines in the light, deep-bitten crosshatch in the shadows.',
        texture_and_material:
          'Slightly wavering, round-ended needle lines, layered crosshatch and an embossed plate mark around the image.',
        camera_and_composition:
          'Keep the requested view inside a platemark rectangle with an open paper margin.',
        atmosphere_and_mood: 'Scholarly, precise and old, like a plate from a forgotten book.',
        rendering_and_quality:
          'Fine intaglio line detail with plate tone, never smooth tonal shading or carved relief shapes.',
        key_features:
          'needled and acid-bitten lines; layered crosshatch; embossed platemark; plate tone; sepia or warm black ink',
      }),
      avoid: [...AVOID, 'carved relief shapes', 'smooth airbrushed tone'],
      briefs: [
        "Etching of an alchemist's cluttered workbench with glass retorts, a brass astrolabe and a guttering candle, crosshatched needle lines in sepia and an embossed platemark around the image. No text or logo.",
        'Etching of a ruined abbey choir with birches growing through the broken floor, deep-bitten crosshatch under the arches. No text or logo.',
        'Etching of a stag beetle in strict profile like a natural-history plate, fine wavering lines on the jaws and wing cases. No text or logo.',
      ],
    },
    'SP04-063': {
      name: 'Floating World Woodblock',
      dna: ip({
        aesthetic:
          'Japanese ukiyo-e color woodblock print: key-block outlines in sumi ink, flat colors from separate blocks and bokashi gradients wiped onto the block.',
        color_and_tone:
          'Prussian blue, indigo, soft vermilion, ochre and pale pink on mellow cream paper, with bokashi gradients in skies and water.',
        lighting_and_shadow:
          'No cast shadows; form carried by outline and flat color, time of day told by the gradient sky.',
        texture_and_material:
          'Visible wood grain in flat areas, crisp carved key lines, slight registration shifts and baren-rubbed pigment mottling.',
        camera_and_composition:
          'Keep the requested view with flattened layered depth, a high horizon or a bold cropped foreground.',
        atmosphere_and_mood: 'Calm, rhythmic and seasonal, a moment of passing weather.',
        rendering_and_quality:
          'Flat printed color and carved line with no Western shading; any cartouche or seal area left blank.',
        key_features:
          'sumi key-block outline; flat block colors; bokashi gradients; visible wood grain; Prussian blue and indigo',
      }),
      avoid: [...AVOID, 'copy of a famous wave print', 'readable kanji', 'seal text', '3d shading'],
      briefs: [
        'Floating world woodblock of pilgrims in straw capes crossing a snow-laden mountain pass on a wooden bridge, sumi key lines, a grey bokashi sky and indigo shadows in the drifts, wood grain in the flat snow. No text or logo.',
        'Floating world woodblock of a giant carp leaping a waterfall, Prussian blue water in carved rhythmic bands and vermilion fins. No text or logo.',
        'Floating world woodblock of a fox wedding procession of paper lanterns along rice-paddy dikes at dusk, pink-to-indigo bokashi sky. No text or logo.',
      ],
    },
    'SP04-064': {
      dna: ip({
        aesthetic:
          'Stipple dotwork: tone built only from thousands of technical-pen dots, dense clusters for shadow and sparse scatter for light.',
        color_and_tone:
          'Black ink dots on bright white paper, with no line, no wash and no grey fill.',
        lighting_and_shadow:
          'Directional light rendered through dot-density gradients, highlights left as open paper.',
        texture_and_material:
          'Uniform round dots from a fine technical pen, no contour lines, edges defined only by changes in density.',
        camera_and_composition:
          'Keep the requested view, often isolated on white like a scientific plate.',
        atmosphere_and_mood: 'Patient, meditative and precise, tone grown one dot at a time.',
        rendering_and_quality:
          'Clean dot-only rendering with scientific-illustration clarity; no hatching or outline.',
        key_features:
          'dots only; density gradients for tone; no contour line; open-paper highlights; scientific plate clarity',
      }),
      avoid: [...AVOID, 'hatching lines', 'outline contour'],
      briefs: [
        'Stipple dotwork of a nautilus shell cut in half to show its pearly chambers, isolated on white, dense dot clusters in the spiral and open paper on the highlights. No text or logo.',
        "Stipple dotwork of a hooded falcon perched on an adult's leather gauntlet, feathers built purely from density gradients. No text or logo.",
        'Stipple dotwork of a crumbling gargoyle on a cathedral gutter, lichen and cracks emerging from scattered dots. No text or logo.',
      ],
    },
    'SP04-065': {
      dna: ip({
        aesthetic:
          'Stone lithograph: drawn with greasy crayon and tusche on grained limestone, printed so every mark keeps the fine tooth of the stone.',
        color_and_tone:
          'Warm black or sepia, optionally with one or two tint stones, on soft cream paper.',
        lighting_and_shadow:
          'Soft tonal modeling from crayon pressure, velvety blacks from tusche washes and gentle transitions.',
        texture_and_material:
          'Granular crayon marks broken by the stone grain, reticulated tusche puddles and scraped-back highlights.',
        camera_and_composition:
          'Keep the requested view, edges vignetting where the drawing fades into the paper.',
        atmosphere_and_mood: 'Soft, atmospheric and intimate, like a drawing breathing on stone.',
        rendering_and_quality:
          'Grainy crayon tone with drawing looseness; no engraved lines and no halftone dots.',
        key_features:
          'greasy crayon on stone grain; reticulated tusche washes; scraped highlights; vignetted edges; one or two tint stones',
      }),
      avoid: [...AVOID, 'engraved hairlines', 'halftone dots'],
      briefs: [
        'Stone lithograph of a travelling circus wagon halted at dusk on a muddy lane, greasy crayon strokes broken by the stone grain, a tusche-black sky puddling over the canvas roof. No text or logo.',
        'Stone lithograph of a rook colony in bare elms, reticulated tusche nests and a pale ochre tint stone for the winter sky. No text or logo.',
        'Stone lithograph of a gaslit cabaret stage with an empty chair and a dropped glove, soft vignette fading into the cream paper. No text or logo.',
      ],
    },
    'SP04-066': {
      dna: ip({
        aesthetic:
          'Screen print: flat opaque ink layers pushed through stencils, with slight misregistration, hard shape edges and occasional coarse halftone.',
        color_and_tone:
          'Three to six flat spot colors in bold complementary pairs, overprints creating a third color where layers meet.',
        lighting_and_shadow:
          'Light expressed as flat stepped color shapes, with coarse halftone as the only gradient.',
        texture_and_material:
          'Thick flat ink with faint squeegee streaks, pinholes and misregistered edges showing slivers of paper.',
        camera_and_composition:
          'Keep the requested view with poster-like graphic simplification of every form.',
        atmosphere_and_mood: 'Punchy, bright and loud, confident flat color.',
        rendering_and_quality:
          'Clean stencil edges with deliberate misregistration, no brush texture and no photographic detail.',
        key_features:
          'flat spot-color layers; misregistration gaps; overprint mixing; coarse halftone; squeegee streaks',
      }),
      avoid: [...AVOID, 'soft painted gradients', 'brush texture'],
      briefs: [
        "Screen print of a knight's jousting helm crowned with tall plumes, four flat spot colors in orange, teal, magenta and black, misregistered edges and an overprinted violet where the plumes cross. No text or logo.",
        'Screen print of a swarm of bees around a hanging hive, coarse halftone in the honeycomb and squeegee streaks in the yellow. No text or logo.',
        'Screen print of an antique brass diving helmet on a wooden pier post, flat stepped shadows and pinholes in the navy ink. No text or logo.',
      ],
    },
    'SP04-067': {
      name: 'Trace Monotype',
      dna: ip({
        aesthetic:
          'Trace monotype: lines drawn with a stylus on paper laid over an inked glass plate, printing soft fuzzy dark lines with ghost smudges from the resting hand.',
        color_and_tone:
          'Black or dark umber ink on thin Japanese paper, with grey plate-tone smudges around the drawing.',
        lighting_and_shadow:
          'Value comes from where the hand pressed: smudged grey halos around dark areas, little modeled light.',
        texture_and_material:
          'Soft furry-edged lines, accidental pressure blotches, a faint plate edge and a one-off impression.',
        camera_and_composition:
          'Keep the requested view with a sparse, slightly off-balance arrangement on the sheet.',
        atmosphere_and_mood: 'Haunted, intimate and fragile, a drawing surfacing through fog.',
        rendering_and_quality:
          'Single impression with its accidents intact, no crisp lines and no edition-perfect cleanliness.',
        key_features:
          'fuzzy stylus-traced lines; hand-pressure ghost smudges; thin Japanese paper; faint plate edge; one-off impression',
      }),
      avoid: [...AVOID, 'crisp vector line', 'flat clean background'],
      briefs: [
        'Trace monotype of a drowned bell hanging in a flooded tower, fuzzy stylus lines on thin Japanese paper, a grey hand-pressure smudge drifting across the water like fog. No text or logo.',
        'Trace monotype of an adult masked mourner kneeling at a candlelit wake, furry-edged lines and accidental blotches on the veil. No text or logo.',
        'Trace monotype of a moth pressed against a dark windowpane, the faint plate edge visible around a sparse off-centre drawing. No text or logo.',
      ],
    },
    'SP04-068': {
      dna: ip({
        aesthetic:
          'Cyanotype sun print from a hand-inked acetate negative: white drawn lines and soft photogram shadows on deep Prussian blue.',
        color_and_tone:
          'Prussian blue to pale sky blue with paper-white lines, and no other hue anywhere.',
        lighting_and_shadow:
          'Values are reversed: whatever blocked the sun prints white, with soft halos where objects lifted off the paper.',
        texture_and_material:
          'Brushed-on chemistry edges, uneven coating streaks, watercolor-paper tooth and soft photogram outlines.',
        camera_and_composition:
          'Keep the requested view as a flat contact-print arrangement with brushed borders.',
        atmosphere_and_mood: 'Quiet, botanical and archival, a drawing developed by sunlight.',
        rendering_and_quality:
          'White line drawing and photogram silhouettes on blue; not a photograph toned blue.',
        key_features:
          'white lines on Prussian blue; photogram silhouettes; brushed chemistry edges; reversed values; paper tooth',
      }),
      avoid: [...AVOID, 'blue-toned photograph', 'warm colors'],
      briefs: [
        'Cyanotype blueprint of a sea-dragon skeleton drawn as white ink lines on deep Prussian blue, with pressed seaweed photograms curling around it and brushed chemistry edges. No text or logo.',
        'Cyanotype blueprint of a clockwork nightingale, its gears and wing linkages as white line work on blue, soft halos where a real feather lay on the paper. No text or logo.',
        'Cyanotype blueprint of a longsword laid among fern fronds, crisp white blade outline against soft-edged leaf photograms. No text or logo.',
      ],
    },
    'SP04-069': {
      name: 'Carved Eraser Stamp',
      dna: ip({
        aesthetic:
          'Hand-carved rubber stamp impressions: the subject cut into soft eraser blocks and stamped by hand from ink pads, built from repeated units.',
        color_and_tone:
          'One to three ink-pad colors such as vermilion, black and teal on kraft or cream paper, overlaps mixing darker.',
        lighting_and_shadow:
          'Flat with no modeling; value comes only from stamp coverage, pressure and overlaps.',
        texture_and_material:
          'Speckled uneven ink transfer, bold simplified carved shapes, faint block edges and slight rotation between repeats.',
        camera_and_composition:
          'Keep the requested view, assembled from a few repeated stamped units in rhythm.',
        atmosphere_and_mood: 'Crafty, playful and tactile, patterns pressed by hand.',
        rendering_and_quality:
          'Handmade impression quality with pale spots where the pressure failed; no bureaucratic office stamps.',
        key_features:
          'repeated stamped units; speckled ink-pad transfer; faint block edges; kraft paper; one to three pad colors',
      }),
      avoid: [...AVOID, 'office approval stamp', 'readable stamp words'],
      dropAvoid: ['perfect', 'clean'],
      briefs: [
        'Carved eraser stamp picture of a flock of crows over a wheat field, built from three repeated stamps in black and ochre on kraft paper, speckled coverage and slight rotation between each bird. No text or logo.',
        'Carved eraser stamp picture of a castle assembled from stamped brick, tower and banner units in vermilion and teal. No text or logo.',
        'Carved eraser stamp picture of a teapot and three mismatched cups on a patterned cloth, overlapping pad colors mixing darker. No text or logo.',
      ],
    },
    'SP04-070': {
      name: 'Rocked-Plate Mezzotint',
      dna: ip({
        aesthetic:
          'Mezzotint: a copper plate roughened all over with a rocker, then burnished smooth where light should be, giving velvety blacks and soft emerging highlights.',
        color_and_tone: 'Deep velvety black, warm greys and ivory highlights on cream paper.',
        lighting_and_shadow:
          'Chiaroscuro from darkness: forms burnished out of black under a single low light source.',
        texture_and_material:
          'Microscopic rocker grain in the darks, soft burnished gradients and no lines anywhere.',
        camera_and_composition:
          'Keep the requested view, the subject lit from one side against near-total black.',
        atmosphere_and_mood: 'Hushed, rich and mysterious, a candle in a closed room.',
        rendering_and_quality:
          'Continuous velvety tone with no hatching, no stipple and no line work.',
        key_features:
          'velvet black rocker ground; burnished highlights; single low light; no lines; ivory on black',
      }),
      avoid: [...AVOID, 'hatching', 'bright white background'],
      briefs: [
        'Rocked-plate mezzotint of a still life with an hourglass, a split pomegranate and a silver goblet on a velvet cloth, forms burnished out of velvet black under one candle. No text or logo.',
        'Rocked-plate mezzotint of a sleeping lion with its head on its paws, soft ivory highlights along the mane. No text or logo.',
        "Rocked-plate mezzotint of a beekeeper's veiled hat and brass smoker on a stool, lit from a low side window. No text or logo.",
      ],
    },
    'SP04-071': {
      name: 'Spit-Bite Aquatint',
      dna: ip({
        aesthetic:
          'Aquatint: rosin grain fused to a plate and bitten in stages, printing granular tonal washes, with brushed spit-bite acid giving soft pooled tones.',
        color_and_tone:
          'Sepia umber, smoke black or one blue-grey ink on cream, tonal rather than linear.',
        lighting_and_shadow:
          'Broad shadow masses in stepped bite tones and soft pooled gradients, only a few accents etched as line.',
        texture_and_material:
          'Fine sugary grain in every tone, soft-edged spit-bite pools and a few etched lines for accents.',
        camera_and_composition:
          'Keep the requested view with broad, landscape-like massing of tone.',
        atmosphere_and_mood: 'Misty, somber and melancholy, weather seen through grain.',
        rendering_and_quality:
          'Granular tone fields with pooled edges; never a smooth digital gradient.',
        key_features:
          'rosin grain tone; spit-bite pools; stepped bite values; few etched accents; sepia or blue-grey ink',
      }),
      avoid: AVOID,
      briefs: [
        'Spit-bite aquatint of a battlefield after rain with broken pikes and a riderless horse, broad sepia bite tones and soft pooled puddles under a grey granular sky. No text or logo.',
        "Spit-bite aquatint of a sea cave with a smugglers' boat drawn up on shingle, blue-grey grain darkening into the cave mouth. No text or logo.",
        'Spit-bite aquatint of a torchlit coal mine gallery with timber props, stepped tones from the lamp glow into black. No text or logo.',
      ],
    },
    'SP04-072': {
      dna: ip({
        aesthetic:
          'Ballpoint drawing: a cheap blue ballpoint pen building tone through obsessive layered crosshatching and pressure changes on notebook paper.',
        color_and_tone:
          'Ballpoint blue from pale grey-blue to near-navy, on off-white notebook stock with faint ruled lines.',
        lighting_and_shadow:
          'Value built by pressure and hatch layering; the darkest areas have a slight glossy ink sheen.',
        texture_and_material:
          'Continuous looping hatch strokes, ink blobs at stroke turns, embossed grooves in the paper and faint ruled lines.',
        camera_and_composition:
          'Keep the requested view, the drawing sitting on the notebook page with open margins.',
        atmosphere_and_mood: 'Obsessive and personal, hours of patient scribbling.',
        rendering_and_quality:
          'Dense realistic hatching in one blue ink; no color fills and no marker.',
        key_features:
          'blue ballpoint only; layered crosshatch; pressure-led values; ink blobs; ruled notebook paper',
      }),
      avoid: [...AVOID, 'black ink', 'marker fills', 'readable handwriting'],
      briefs: [
        'Ballpoint pen drawing of an old toad on a mossy stone, obsessive layered hatching in pale to near-navy blue, ink blobs at the stroke turns and faint ruled notebook lines. No text or logo.',
        'Ballpoint pen drawing of a worn leather riding boot with its laces undone, pressure-led shadows glossy with ink. No text or logo.',
        'Ballpoint pen drawing of a hot-air balloon drifting over a dark pine forest, looping hatch strokes filling the sky. No text or logo.',
      ],
    },
    'SP04-073': {
      dna: ip({
        aesthetic:
          'Fountain pen drawing: a flexible steel nib swelling and thinning with pressure, iron-gall ink browning as it dries, loose washes pulled with a wet finger.',
        color_and_tone:
          'Blue-black ink oxidizing to warm brown on cream laid paper, with pale grey ink washes.',
        lighting_and_shadow:
          'Shadows massed with thick swelling strokes and quick washes; light left as open paper.',
        texture_and_material:
          'Tapered entry and exit strokes, nib-spread lines, small ink spatters and feathering on laid paper.',
        camera_and_composition:
          'Keep the requested view with airy placement and plenty of open paper.',
        atmosphere_and_mood: 'Elegant and spontaneous, like a traveller’s sketchbook.',
        rendering_and_quality:
          'Line-led drawing with modulated width and a few washes; no pencil and no digital fill.',
        key_features:
          'flex-nib swelling line; iron-gall ink browning; finger washes; spatters; laid paper',
      }),
      avoid: [...AVOID, 'uniform-width line', 'pencil marks'],
      briefs: [
        'Fountain pen drawing of a wind-bent pine clinging to a sea rock, flex-nib strokes swelling along the trunk, iron-gall ink browning at the edges and a finger wash for the spray. No text or logo.',
        'Fountain pen drawing of an adult scribe asleep over manuscripts by candlelight, tapered strokes and a pale grey wash in the shadows. No text or logo.',
        'Fountain pen drawing of a tangle of rosehips and thorny briars, spatters and feathered lines on cream laid paper. No text or logo.',
      ],
    },
    'SP04-074': {
      dna: ip({
        aesthetic:
          'Permanent-marker drawing: bold felt-tip lines of near-fixed width, solid black fills and ink bleeding into the paper fibers at stroke ends.',
        color_and_tone:
          'Carbon black with one or two cool grey marker layers on bright copier paper.',
        lighting_and_shadow:
          'Shadows as flat solid black shapes and a single grey marker tone, no gradients.',
        texture_and_material:
          'Chisel and bullet-tip stroke edges, streaky fills, bleed halos and slight show-through of overlapping passes.',
        camera_and_composition:
          'Keep the requested view with strong silhouettes and big black shapes.',
        atmosphere_and_mood: 'Loud, immediate and graphic, drawn without hesitation.',
        rendering_and_quality:
          'Bold marker graphic with streaky fills; no fine hairlines and no painted rendering.',
        key_features:
          'fixed-width felt-tip line; solid black fills; bleed halos; one grey marker; streaky passes',
      }),
      avoid: [...AVOID, 'hairline detail', 'lone cloaked figure on a cliff edge'],
      briefs: [
        'Permanent-marker drawing of a zombie knight clawing out of a grave, fixed-width black felt-tip lines, solid black armor shadows, one cool grey marker tone and bleed halos at every stroke end. No text or logo.',
        'Permanent-marker drawing of a rooster crowing on a fence post, streaky chisel-tip fills in the tail feathers. No text or logo.',
        'Permanent-marker drawing of a haunted rocking chair in an empty attic, big flat black shadow shapes on copier paper. No text or logo.',
      ],
    },
    'SP04-075': {
      dna: ip({
        aesthetic:
          'Traditional tattoo flash: bold black outlines that will hold, flat opaque fills and emblem-like motifs painted on a flash sheet.',
        color_and_tone:
          'Classic flash palette of red, yellow, green and black with skin-tone negative space on aged cream paper.',
        lighting_and_shadow:
          'Black whip-shading on one side of each form, flat color otherwise, no realistic light.',
        texture_and_material:
          'Heavy even outlines, watercolor-flat fills, slight paper aging and pinholes in the corners.',
        camera_and_composition:
          'Keep the requested subject as a centered emblem with a compact silhouette, framed by simple ornament.',
        atmosphere_and_mood: 'Proud, sturdy and timeless, a motif meant to last a lifetime.',
        rendering_and_quality:
          'Clean flash painting with bold simplified shapes; banners left empty with no words.',
        key_features:
          'bold black outline; red yellow green black palette; whip shading; emblem silhouette; empty banners',
      }),
      avoid: [...AVOID, 'realistic shading', 'words on banners'],
      briefs: [
        'Traditional tattoo flash of a dagger piercing a heart wrapped by an empty banner, bold black outlines, flat red, yellow and green fills and black whip shading on aged cream paper. No text or logo.',
        'Traditional tattoo flash of a snarling panther head with bared fangs, compact emblem silhouette and pinholes in the paper corners. No text or logo.',
        'Traditional tattoo flash of a clipper ship under full sail inside a rope-framed oval, flat green sea and yellow sails. No text or logo.',
      ],
    },
    'SP04-076': {
      dna: ip({
        aesthetic:
          'Aerosol tag handstyle: the subject drawn in fast continuous spray-can strokes on a wall, with overspray halos, gravity drips and a consistent cap width.',
        subject_treatment:
          'Keep the prompt subject recognizable and draw it as a one-line spray-can handstyle on a wall surface; any letter-like flourishes stay illegible.',
        color_and_tone:
          'Matte black or chrome silver lines with at most one high-contrast accent color, on the wall’s own color.',
        lighting_and_shadow:
          'Flat daylight on the wall; the only value change is overspray halo around each stroke.',
        texture_and_material:
          'Soft-edged spray lines of even width, drips running down from slow points, rough concrete, brick or steel showing through.',
        camera_and_composition:
          'Keep the requested view as the wall surface seen flat, the drawing spanning it in one sweeping gesture.',
        atmosphere_and_mood: 'Fast, defiant and kinetic, drawn before anyone could stop it.',
        rendering_and_quality:
          'Raw single-color spray line on a real wall surface; not a 3D sculpture or a digital vector.',
        key_features:
          'one continuous spray line; overspray halos; gravity drips; even cap width; wall surface visible',
      }),
      avoid: [...AVOID, '3d sculpted creature', 'readable tag letters'],
      briefs: [
        'Aerosol tag handstyle of a leaping wolf drawn in one continuous matte black spray line across a rusted roll-down shutter, overspray halos and gravity drips below each slow turn. No readable letters or logo.',
        'Aerosol tag handstyle of a crown over crossed keys in chrome silver strokes on a dented shipping container, one red accent drip. No readable letters or logo.',
        'Aerosol tag handstyle of a winged skull sprayed on a railway bridge pillar, even cap width looping into illegible flourishes. No readable letters or logo.',
      ],
    },
    'SP04-077': {
      dna: ip({
        aesthetic:
          'Wildstyle graffiti piece: a full-color spray mural where the subject is built from interlocking arrows, bevels, 3D block drop shadows and nested outlines.',
        subject_treatment:
          'Keep the prompt subject recognizable and construct it from wildstyle piece elements on a long wall; the shapes echo letterforms but never spell readable words.',
        color_and_tone:
          'High-saturation spray fills with complementary fades, a white highlight line and a dark outer outline.',
        lighting_and_shadow:
          'Painted light only: gradient fades inside fills, white shine strokes and a hard 3D drop block.',
        texture_and_material:
          'Crisp cut-back edges, soft fades, spray speckle, and concrete texture visible at the margins.',
        camera_and_composition:
          'Keep the requested view, the piece filling a wide wall with background fill-ins of bubbles and stars.',
        atmosphere_and_mood: 'Loud, celebratory and virtuosic, a wall claimed in color.',
        rendering_and_quality:
          'Finished mural piece with clean cut-back edges and no readable letters.',
        key_features:
          'interlocking arrows and bevels; 3D drop block; nested outlines; complementary fades; white shine strokes',
      }),
      avoid: [...AVOID, 'readable words', 'rail vehicle'],
      briefs: [
        'Wildstyle graffiti piece of a fire-breathing dragon built from interlocking arrows, bevels and a violet 3D drop block along a long concrete retaining wall, orange-to-yellow fades and white shine strokes. No readable letters or logo.',
        'Wildstyle graffiti piece of a giant octopus wrapped around a rooftop water tank, nested outlines and teal-magenta complementary fades. No readable letters or logo.',
        'Wildstyle graffiti piece of two boxing hares on a warehouse wall, crisp cut-back edges and a background of bubbles and stars. No readable letters or logo.',
      ],
    },
    'SP04-079': {
      dna: ip({
        aesthetic:
          'Blackletter calligraphy: the subject drawn with a broad-edged nib in textura strokes, vertical columns, broken curves and diamond terminals, like a gothic illuminated initial.',
        subject_treatment:
          'Keep the prompt subject recognizable and build its form out of broad-nib blackletter strokes and flourishes; the strokes read as letter-like pattern, never as readable words.',
        color_and_tone:
          'Dense black ink on parchment beige with antique gold leaf and a touch of vermilion.',
        lighting_and_shadow:
          'No modeled light; contrast comes from thick-thin stroke weight and burnished gold catching light.',
        texture_and_material:
          'Crisp broad-nib strokes with sharp corners, hairline flourishes, vellum grain and slightly raised gilding.',
        camera_and_composition:
          'Keep the requested view with tight vertical rhythm and ornamental flourishes filling the space.',
        atmosphere_and_mood: 'Solemn, gothic and ceremonial, like a page from a chained book.',
        rendering_and_quality:
          'Precise pen-built strokes with consistent nib angle; no readable text.',
        key_features:
          'broad-nib textura strokes; diamond terminals; hairline flourishes; gold leaf; vellum grain',
      }),
      avoid: [...AVOID, 'readable words', 'rounded modern lettering'],
      briefs: [
        'Blackletter calligraphy of a rearing griffin drawn entirely in broad-nib textura strokes with diamond terminals, gold leaf hairline flourishes on vellum. No readable letters or logo.',
        'Blackletter calligraphy of gothic cathedral window tracery, vertical columns of broken-curve strokes and vermilion accents. No readable letters or logo.',
        'Blackletter calligraphy of a serpent coiled around a sword, thick-thin strokes and raised burnished gilding. No readable letters or logo.',
      ],
    },
    'SP04-080': {
      dna: ip({
        aesthetic:
          'Brush pen ink drawing: a flexible synthetic brush tip laying thick-to-thin single strokes, dry-brush breaks at speed and grey water-brush washes.',
        color_and_tone:
          'Carbon black and two diluted grey washes on white absorbent paper, generous negative space.',
        lighting_and_shadow:
          'Shadow as bold wet black strokes, midtones as grey washes, light as untouched paper.',
        texture_and_material:
          'One-breath tapering strokes, dry-brush fractures, soft wash blooms and fiber feathering at stroke ends.',
        camera_and_composition:
          'Keep the requested view with asymmetric placement and open white space around the subject.',
        atmosphere_and_mood: 'Quick, confident and alive, each stroke committed.',
        rendering_and_quality:
          'Economical gestural ink with visible stroke order; no pencil underdrawing and no digital fill.',
        key_features:
          'thick-to-thin brush strokes; dry-brush fractures; grey water washes; open negative space; one-breath gestures',
      }),
      avoid: [...AVOID, 'rigid uniform line'],
      briefs: [
        'Brush pen ink drawing of a black bull charging head-down, thick-to-thin single strokes, dry-brush fractures in the dust behind it and wide open white paper. No text or logo.',
        'Brush pen ink drawing of an adult monk sweeping snow from temple steps, grey water-brush washes for the falling snow. No text or logo.',
        'Brush pen ink drawing of two wild horses rearing against each other, one-breath strokes for the manes and wash blooms under the hooves. No text or logo.',
      ],
    },
  },
};

export const aliases = {
  'SP04-063': 'Hokusai Woodcut (Floating World)',
  'SP04-067': 'Monotype',
  'SP04-069': 'Rubber Stamp',
  'SP04-070': 'Mezzotint',
  'SP04-071': 'Aquatint',
};

export default spec;
