import type { Dna, Spec } from '../tools/apply';

const AVOID = ['invented slogans', 'fake lettering', 'empty title plate', 'real musician likeness'];
const TREATMENT_AVOID = [...AVOID, 'poster border', 'added frame', 'poster title zone'];

// Category rule: an image treatment does not invent slogans, frames or a poster layout.
// Treatments change only the print or drawing technique; poster profiles own composition but still stay textless.
const treatment =
  'Keep the prompt subject, action, setting and framing; apply only this print or drawing technique, without adding slogans, borders, frames or a poster layout.';
const poster = (what: string) =>
  `Keep the prompt subject and action; this preset owns ${what}, and it never adds slogans, lettering or empty title plates.`;

function ed(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? treatment, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_04',
  category: '3. Editorial And Poster',
  updates: {
    'SP04-015': {
      dna: ed({
        aesthetic:
          'Risograph print: the image separated into two or three soy-ink drums, fluorescent pink, teal or yellow, overprinting on uncoated paper.',
        color_and_tone:
          'Two or three spot inks only, new colors appearing where they overlap, grainy tints instead of smooth tones.',
        lighting_and_shadow:
          'Light shown by leaving paper bare; shadows are denser grain or an overprinted second ink.',
        texture_and_material:
          'Coarse stochastic grain, roller streaks, slight ink set-off and uncoated recycled paper fiber.',
        camera_and_composition:
          'Keeps the requested framing; each color layer drifts a few millimeters out of register.',
        atmosphere_and_mood: 'Handmade, bright and indie, printed in a small studio.',
        rendering_and_quality:
          'Visible misregistration and grain are the finish; no smooth gradients or process color.',
        key_features:
          'two to three fluorescent spot inks; overprint mixing; coarse riso grain; misregistration; uncoated paper',
      }),
      avoid: [...TREATMENT_AVOID, 'full process color'],
      briefs: [
        'Risograph print of a gray heron standing motionless among tall reeds, fluorescent pink and teal inks overprinting into deep violet, coarse grain and slight misregistration on uncoated paper. No text or logo.',
        'Risograph print of a crowded windowsill of potted houseplants in morning sun, yellow and teal drums, bare paper for highlights, roller streaks. No text or logo.',
        'Risograph print of an adult diver in a vintage brass helmet walking the sea floor, two-ink grain and pink set-off. No text or logo.',
      ],
    },
    'SP04-031': {
      dna: ed({
        aesthetic:
          'Art Deco poster: streamlined geometric forms, radiating sunbursts and speed lines, smooth airbrushed gradients and gold-on-black glamour.',
        subject_treatment: poster(
          'the symmetrical Deco poster composition with sunburst and stepped geometry',
        ),
        color_and_tone:
          'Black, deep teal, ivory and metallic-looking gold, gradients banded in smooth airbrush steps.',
        lighting_and_shadow:
          'Radial sunburst light behind the subject, stylized gradient bands, crisp rim highlights on curves.',
        texture_and_material:
          'Smooth lithographic ink, airbrushed transitions, polished chrome and lacquer suggested graphically.',
        camera_and_composition:
          'Strong symmetry, low monumental angle, elongated streamlined silhouettes and stepped ziggurat shapes.',
        atmosphere_and_mood:
          'Luxurious, confident and machine-age optimistic, a gilded evening in motion.',
        rendering_and_quality:
          'Precise geometric shapes and polished gradients; never loose, organic or distressed.',
        key_features:
          'radiating sunburst; streamlined elongation; black teal and gold; airbrushed gradient bands; stepped symmetry',
      }),
      avoid: AVOID,
      briefs: [
        'Art Deco poster of a streamlined silver airship gliding over a stepped ziggurat skyline, radiating gold sunburst behind, black, teal and ivory airbrushed bands, strong symmetry. No text or logo.',
        'Art Deco poster of an adult sword-dancer in gold lamé mid-spin, elongated streamlined silhouette against a teal sunburst, low monumental angle. No text or logo.',
        'Art Deco poster of a leaping bronze gazelle over stylized fountains, polished rim highlights and speed lines. No text or logo.',
      ],
    },
    'SP04-032': {
      name: 'Art Nouveau Halo Lithograph',
      dna: ed({
        aesthetic:
          'Art Nouveau decorative lithograph: a figure framed by a circular halo, flowing whiplash contours and botanical arabesques that merge into an ornamental border.',
        subject_treatment: poster(
          'the halo-and-arabesque decorative panel with its integrated floral border',
        ),
        color_and_tone:
          'Peach, sage, ivory and muted gold, soft flat tints with dark brown contour.',
        lighting_and_shadow:
          'Flat luminous light, halo glowing behind the head, minimal soft modeling on faces and hands.',
        texture_and_material:
          'Stone-lithograph grain, flat ink tints, mosaic-like patterning in the halo and garments.',
        camera_and_composition:
          'Tall vertical panel, figure centered before a circular nimbus, hair and plants curling into the frame.',
        atmosphere_and_mood: 'Romantic, reverent and ornamental, a quiet devotion to nature.',
        rendering_and_quality:
          'Confident brown contour of varied weight, pattern-rich but orderly; no straight modernist geometry.',
        key_features:
          'circular halo behind the figure; whiplash curves; botanical arabesque border; peach sage and gold; lithograph grain',
      }),
      avoid: AVOID,
      briefs: [
        'Art Nouveau halo lithograph of an adult beekeeper holding a honeycomb frame, a circular halo patterned like hexagonal wax behind her, bees and clover curling into the border, peach, sage and gold tints. No text or logo.',
        'Art Nouveau halo lithograph of an adult male falconer with a hooded falcon on his glove, feathers flowing into whiplash arabesques around a golden nimbus. No text or logo.',
        'Art Nouveau halo lithograph of a white stag standing among lilies, antlers entwined with vines inside a mosaic halo. No text or logo.',
      ],
    },
    'SP04-033': {
      dna: ed({
        aesthetic:
          'Constructivist propaganda poster: heroic figures reduced to hard silhouettes, thrust along steep diagonals against radiating red rays.',
        subject_treatment: poster(
          'the diagonal constructivist poster composition with radiating rays',
        ),
        color_and_tone: 'Red, black and cream only, flat and uncompromising, one hue per shape.',
        lighting_and_shadow:
          'Stark low-angle light, faces split into flat light and black planes, beams as geometric wedges.',
        texture_and_material:
          'Flat screenprint and letterpress ink, slightly rough edges, aged cream paper.',
        camera_and_composition:
          'Extreme worm-eye view, steep diagonals, repeated marching figures and huge scale contrast.',
        atmosphere_and_mood: 'Commanding, urgent and collective, mass energy in motion.',
        rendering_and_quality:
          'Bold emblematic reduction with hard edges; no slogans, no real leaders, no national emblems.',
        key_features:
          'red black and cream; steep diagonal thrust; worm-eye view; radiating ray wedges; hard silhouette reduction',
      }),
      avoid: [...AVOID, 'real political leaders', 'national emblems'],
      briefs: [
        'Constructivist poster of an adult steelworker swinging a hammer onto a colossal gear, extreme worm-eye view, red rays radiating behind, flat red, black and cream silhouettes on a steep diagonal. No text or logo.',
        'Constructivist poster of a formation of biplanes diving over a monumental dam, geometric beam wedges and huge scale contrast. No text or logo.',
        'Constructivist poster of an adult harvester woman lifting a sheaf of wheat against a red sky, repeated reapers marching behind her on a diagonal. No text or logo.',
      ],
    },
    'SP04-034': {
      dna: ed({
        aesthetic:
          '1960s psychedelic concert poster: every form melting into liquid swirls, vibrating complementary colors and dense wave patterns filling the sheet.',
        subject_treatment: poster(
          'the all-over swirling poster composition, with no lettering or band members',
        ),
        color_and_tone:
          'Clashing complementaries of equal value, orange on blue, magenta on green, so edges optically vibrate.',
        lighting_and_shadow:
          'No natural light; flat color planes pulse through concentric contour bands.',
        texture_and_material:
          'Screenprint ink with slight overlap halos, contour lines echoing outward like ripples.',
        camera_and_composition:
          'Central melting subject with radiating waves, no empty space left anywhere on the sheet.',
        atmosphere_and_mood: 'Ecstatic, dizzy and sensory, a sound made visible.',
        rendering_and_quality:
          'Dense decorative overload with fluid forms; no readable letterforms and no musicians unless asked.',
        key_features:
          'melting liquid swirls; vibrating equal-value complementaries; ripple contour bands; all-over density; screenprint halos',
      }),
      avoid: [...AVOID, 'rock band on stage'],
      briefs: [
        'Psychedelic poster of an adult mushroom forager whose hair melts into liquid swirls of orange and electric blue, ripple contour bands radiating to the edges, vibrating complementary colors. No text or logo.',
        'Psychedelic poster of a giant snail whose rainbow shell spirals outward into concentric waves, magenta against green. No text or logo.',
        "Psychedelic poster of a lion's face with a mane dissolving into pulsing wave patterns, dense all-over screenprint color. No text or logo.",
      ],
    },
    'SP04-035': {
      dna: ed({
        aesthetic:
          'Minimalist flat vector in the corporate-flat manner: rounded shapes, no outlines, figures with oversized limbs and tiny heads in cheerful colors.',
        color_and_tone:
          'Flat bright palette of coral, periwinkle, mint and mustard on an off-white ground, no gradients.',
        lighting_and_shadow:
          'Shadowless; depth only from overlapping flat shapes and one darker tint.',
        texture_and_material: 'Clean digital vector surfaces, no grain, simple geometric props.',
        camera_and_composition:
          'Keeps the requested framing, with generous empty space around a simple readable arrangement.',
        atmosphere_and_mood: 'Friendly, approachable and upbeat, calm and uncluttered.',
        rendering_and_quality:
          'Smooth vector shapes with consistent curves; no texture, no outlines and no poster border.',
        key_features:
          'flat vector shapes; no outlines; oversized limbs and tiny heads; coral periwinkle mint palette; generous empty space',
      }),
      avoid: TREATMENT_AVOID,
      briefs: [
        'Minimalist flat vector image of an adult gardener with long rubbery arms watering a giant potted monstera, coral, periwinkle and mint shapes, no outlines, off-white empty space. No text or logo.',
        'Minimalist flat vector image of two adults carrying an enormous puzzle piece up a gentle slope, oversized limbs and tiny heads. No text or logo.',
        'Minimalist flat vector image of a cat stretching into a long mustard blob across a sofa, shadowless overlapping shapes. No text or logo.',
      ],
    },
    'SP04-036': {
      dna: ed({
        aesthetic:
          'Dada photomontage: found photographs and engravings cut with scissors and glued into absurd hybrids, seams and scale jumps left visible.',
        color_and_tone:
          'Sepia and gray halftone photographs with one or two accent papers in red or ochre.',
        lighting_and_shadow:
          'Deliberately inconsistent light between fragments, each piece keeping its original photo lighting.',
        texture_and_material:
          'Halftone dots, paper edges, glue wrinkles, yellowed newsprint and cut engraving lines.',
        camera_and_composition:
          'Keeps the requested subject readable while replacing parts of it with mismatched fragments at odd scales.',
        atmosphere_and_mood: 'Absurd, provocative and irreverent, logic cut apart.',
        rendering_and_quality:
          'Visible scissor edges and seams; never a seamless digital composite or painted surface.',
        key_features:
          'cut found photographs; visible seams and paper edges; halftone fragments; absurd scale jumps; red accent paper',
      }),
      avoid: [...TREATMENT_AVOID, 'seamless digital composite', 'readable newspaper text'],
      briefs: [
        'Dada photomontage of an adult bureaucrat in a suit whose head is replaced by a gramophone horn, cut halftone photographs glued with visible seams, a red accent paper circle, yellowed newsprint. No readable text or logo.',
        'Dada photomontage of a horse whose body is a pocket-watch engraving, galloping across a cut-out mountain photo at the wrong scale. No text or logo.',
        'Dada photomontage of a giant fish swimming through a cut-out ballroom crowd, glue wrinkles and scissor edges. No text or logo.',
      ],
    },
    'SP04-037': {
      dna: ed({
        aesthetic:
          'Bauhaus poster: the subject rebuilt from circles, squares, triangles and thick bars on an asymmetric grid.',
        subject_treatment: poster('the asymmetric geometric grid composition'),
        color_and_tone:
          'Primary red, yellow and blue with black and off-white; each shape one flat color.',
        lighting_and_shadow: 'No shading at all; values are the flat colors of the shapes.',
        texture_and_material:
          'Matte lithographic ink on slightly warm paper, crisp compass and ruler edges.',
        camera_and_composition:
          'Asymmetric balance on a modular grid, strong diagonals and one dominant circle.',
        atmosphere_and_mood: 'Rational, constructive and playful, function made beautiful.',
        rendering_and_quality:
          'Exact geometric primitives only; no decoration, no ornament and no typography.',
        key_features:
          'circles squares triangles and bars; primary triad with black; asymmetric grid; dominant circle; flat matte ink',
      }),
      avoid: [...AVOID, 'typography blocks'],
      briefs: [
        'Bauhaus poster of a cello rebuilt from a red circle, yellow triangles and black bars on an asymmetric grid, flat primary colors, a dominant blue circle behind. No text or logo.',
        'Bauhaus poster of an adult acrobat balancing on one hand, body built from primary geometric shapes along a strong diagonal. No text or logo.',
        'Bauhaus poster of an angled desk lamp constructed from bars and a semicircle, casting a yellow triangle of light. No text or logo.',
      ],
    },
    'SP04-038': {
      dna: ed({
        aesthetic:
          '1930s park poster screenprint: landscapes simplified into a few flat silhouette layers of separated earth-toned inks.',
        subject_treatment: poster(
          'the layered scenic poster composition of stacked landscape planes',
        ),
        color_and_tone:
          'Six to eight flat inks, rust, ochre, forest green, slate blue and cream, sky in stepped color bands.',
        lighting_and_shadow:
          'Time of day shown by color banding in the sky and a few flat shadow shapes on the mountains.',
        texture_and_material:
          'Flat screen-mesh ink with slight edge spread, uncoated poster stock.',
        camera_and_composition:
          'Horizontal strata from foreground silhouette to far peaks, one landmark centered and monumental.',
        atmosphere_and_mood: 'Majestic, nostalgic and civic, nature presented with pride.',
        rendering_and_quality:
          'Clear flat shape separation with no photographic detail; no title band.',
        key_features:
          'flat separated earth inks; stacked silhouette strata; banded sky; monumental landmark; screen-mesh texture',
      }),
      avoid: AVOID,
      briefs: [
        'Park poster screenprint of a glacier-carved canyon with a condor soaring over it, flat rust, slate blue and cream silhouette strata, sky in stepped color bands. No text or logo.',
        'Park poster screenprint of elk grazing in a redwood grove at dawn, towering trunks as flat ochre shapes, banded pink sky. No text or logo.',
        'Park poster screenprint of a sandstone arch at sunset framing a distant mesa, flat shadow shapes and screen-mesh ink. No text or logo.',
      ],
    },
    'SP04-039': {
      dna: ed({
        aesthetic:
          'Painted movie one-sheet: an airbrushed and oil-painted montage with a giant central head or symbol towering over smaller action vignettes.',
        subject_treatment: poster(
          'the painted montage one-sheet composition with scaled vignettes',
        ),
        color_and_tone:
          'Theatrical amber against cyan, deep painted shadows and glowing highlights.',
        lighting_and_shadow:
          'Strong rim and backlight on every figure, glow accents and dramatic split key light.',
        texture_and_material:
          'Soft airbrush mist, visible oil brushwork in the focal faces, matte poster print.',
        camera_and_composition:
          'Pyramid montage: huge background element, hero figures in the middle, small action scene at the base.',
        atmosphere_and_mood: 'Grand, cinematic and anticipatory, a whole story in one sheet.',
        rendering_and_quality:
          'Hand-painted polish with airbrush blending; no photo collage, no credits block and no title.',
        key_features:
          'painted montage pyramid; giant background head or symbol; amber and cyan; airbrush mist; rim-lit heroes',
      }),
      avoid: [...AVOID, 'credits block', 'eclipse motif'],
      briefs: [
        'Painted movie one-sheet of an adult dragon-slayer with a notched sword, a giant reptilian eye filling the sky behind her, a tiny burning village at the base, amber and cyan airbrush montage. No text or logo.',
        'Painted movie one-sheet of an adult pirate queen towering over a sea battle of galleons, rim light on her tricorn, oil brushwork in her face. No text or logo.',
        'Painted movie one-sheet of a colossal kraken rising behind a lone galleon under storm clouds, pyramid montage composition. No text or logo.',
      ],
    },
    'SP04-040': {
      dna: ed({
        aesthetic:
          'Editorial infographic illustration: the subject explained as an illustrated diagram of layers, cycles or flows, drawn in clean flat vector.',
        subject_treatment: poster(
          'the diagram layout of layers, loops or flows around the subject, with no numbers or labels',
        ),
        color_and_tone:
          'Consistent categorical palette of five muted hues on warm white, one accent for the key element.',
        lighting_and_shadow: 'Flat informational rendering with no decorative shadows or glows.',
        texture_and_material:
          'Clean vector lines, thin connector arrows and small illustrated vignettes.',
        camera_and_composition:
          'Cross-sections, circular life-cycle loops or vertical strata, clear reading order.',
        atmosphere_and_mood:
          'Analytical, trustworthy and clear, a curious question calmly answered.',
        rendering_and_quality:
          'Precise vector illustration; no charts with numbers, no dashboards and no readable labels.',
        key_features:
          'illustrated cross-section or cycle; connector arrows; categorical muted palette; clean vector; no labels',
      }),
      avoid: [...AVOID, 'dashboard UI', 'numbers', 'readable labels'],
      dropAvoid: ['art'],
      briefs: [
        'Editorial infographic illustration of the ocean from sunlit surface to deep trench in vertical strata, animals of each zone in small flat vignettes, categorical muted palette, no labels. No text or logo.',
        'Editorial infographic illustration of the life cycle of a frog as a circular loop from spawn to adult, thin connector arrows. No text or logo.',
        "Editorial infographic illustration of a castle's water supply in cutaway, cistern, pipes and well linked by flow arrows. No text or logo.",
      ],
    },
    'SP04-041': {
      dna: ed({
        aesthetic:
          'Fashion illustration: a quick runway sketch in graphite and brush ink with loose watercolor splashes on the garment.',
        subject_treatment:
          'Keep the prompt subject and outfit; this preset explicitly elongates figures to about nine heads tall and adds no poster frame, slogan or layout.',
        color_and_tone:
          'Mostly bare white paper, black ink and one or two bold watercolor accents in the garment.',
        lighting_and_shadow:
          'No simulated light; a few fast strokes and the white of the paper suggest volume.',
        texture_and_material:
          'Graphite underdrawing, brush-ink contours, wet watercolor blooms, dry-brush fabric sweeps.',
        camera_and_composition:
          'Full-length figure mid-stride, lots of editorial white space, garments given the most detail.',
        atmosphere_and_mood: 'Chic, fast and confident, the energy of an atelier before a show.',
        rendering_and_quality:
          'Loose gestural sketch with precise fabric rhythm; never realistic proportions or full backgrounds.',
        key_features:
          'nine-heads-tall elongation; brush ink over graphite; watercolor garment splash; white space; mid-stride pose',
      }),
      avoid: [...AVOID, 'full background scene'],
      briefs: [
        'Fashion illustration of an adult model mid-stride in a sculptural cape of layered black feathers, nine-heads-tall figure, brush ink over graphite, one crimson watercolor bloom, white editorial space. No text or logo.',
        'Fashion illustration of an adult man in an oversized camel overcoat with sweeping lapels, dry-brush fabric strokes and loose ochre wash. No text or logo.',
        'Fashion illustration of an adult model in a gown of silver chainmail, fast graphite lines and a cool gray watercolor splash. No text or logo.',
      ],
    },
    'SP04-042': {
      dna: ed({
        aesthetic:
          'Surreal album cover: one impossible central image in a square frame, photographic calm and dream logic combined.',
        subject_treatment: poster('the square cover format with one central surreal metaphor'),
        color_and_tone: 'Muted dusk palette with one prismatic or uncanny accent color.',
        lighting_and_shadow:
          'Clean natural light with an impossible source or a shadow that falls the wrong way.',
        texture_and_material:
          'Fine analog photo grain, matte print, subtle vinyl-sleeve wear at the edges.',
        camera_and_composition:
          'Square format, centered subject, wide empty space and a flat horizon.',
        atmosphere_and_mood:
          'Mysterious, contemplative and hypnotic, a dream held perfectly still.',
        rendering_and_quality:
          'Seamless believable surrealism with one strong metaphor; no band names or track lists.',
        key_features:
          'square format; one central impossible image; muted dusk palette; analog grain; wide empty space',
      }),
      avoid: AVOID,
      dropAvoid: ['photo'],
      briefs: [
        'Surreal album cover of a staircase descending into a floating glass of water above a salt flat, square format, muted dusk palette, fine analog grain and wide empty space. No text or logo.',
        'Surreal album cover of a grand piano half-sunk in a desert dune, its shadow falling toward the sun, centered and square. No text or logo.',
        'Surreal album cover of an adult angler in a rowboat reeling a small glowing moon out of a still lake. No text or logo.',
      ],
    },
    'SP04-043': {
      dna: ed({
        aesthetic:
          'Pulp magazine cover painting: lurid oil-painted adventure at its most sensational moment, thick painterly gesture and hard spotlighting.',
        subject_treatment: poster(
          'the vertical pulp cover composition with the peak action moment in the foreground',
        ),
        color_and_tone: 'Acid yellow, blood orange and saturated red against near-black shadow.',
        lighting_and_shadow:
          'Hard spotlight, half-lit faces, dramatic shadow wedges and a hot backlight.',
        texture_and_material:
          'Loose oil brushwork, cheap coated paper, faint halftone and print wear.',
        camera_and_composition:
          'Action thrust toward the viewer, near-field exaggeration, peril looming above the hero.',
        atmosphere_and_mood: 'Sensational, tense and lurid, danger at full volume.',
        rendering_and_quality:
          'Vigorous painted finish; no masthead, no blurbs and no damsel-in-distress cliché.',
        key_features:
          'lurid oil painting; acid yellow and red; hard spotlight; peak-action foreground; looming peril',
      }),
      avoid: [...AVOID, 'masthead', 'blurb text'],
      briefs: [
        'Pulp magazine cover painting of an adult archaeologist sprinting from a collapsing temple as a giant serpent strikes from above, acid yellow and blood orange, hard spotlight, loose oil brushwork. No text or logo.',
        'Pulp magazine cover painting of an adult test pilot in a leather jacket facing a giant ant over a crashed rocket plane, near-field exaggeration. No text or logo.',
        'Pulp magazine cover painting of a haunted paddle-wheel riverboat drifting through fog with ghostly lanterns, hot backlight and shadow wedges. No text or logo.',
      ],
    },
    'SP04-044': {
      dna: ed({
        aesthetic:
          'Vintage lithographic travel poster: a destination simplified into sunlit flat color blocks with a clean horizon and idealized weather.',
        subject_treatment: poster(
          'the idealized destination composition, filled to the edges without a title lockup or blank band',
        ),
        color_and_tone:
          'Warm sunlit flats, turquoise sea, terracotta, lemon and sky blue, restrained and bright.',
        lighting_and_shadow: 'Even midday light, simple flat shadow shapes, luminous sky gradient.',
        texture_and_material: 'Lithographic grain, slight ink spread and lightly faded paper.',
        camera_and_composition:
          'High viewpoint over the destination, simplified depth planes, a framing tree or balcony in the foreground.',
        atmosphere_and_mood: 'Inviting, relaxed and escapist, the holiday before it happens.',
        rendering_and_quality:
          'Clean simplified shapes filled edge to edge; no empty title band and no letters.',
        key_features:
          'sunlit flat color blocks; high viewpoint; foreground framing element; lithographic grain; no title band',
      }),
      avoid: [...AVOID, 'blank lower band'],
      briefs: [
        'Vintage travel poster of a coastal hill town with terraced vineyards seen from a high balcony framed by pine branches, turquoise sea and terracotta roofs in sunlit flat blocks, lithographic grain. No text or logo.',
        'Vintage travel poster of a desert oasis with camels resting under palms at dusk, luminous sky gradient. No text or logo.',
        'Vintage travel poster of a paddle steamer on a deep green fjord beneath waterfalls, simplified depth planes. No text or logo.',
      ],
    },
    'SP04-045': {
      dna: ed({
        aesthetic:
          'Hand-pulled gig poster screenprint: bold illustrated image in three spot inks with halftone shading, overprints and squeegee imperfections.',
        subject_treatment: poster(
          'the bold single-image gig print composition, with no lettering band',
        ),
        color_and_tone:
          'Three spot inks, for example cream, teal and blood red, plus black; overprints make extra colors.',
        lighting_and_shadow:
          'Tone made from coarse halftone dots, flat print lighting with punchy contrast.',
        texture_and_material:
          'Fibrous poster stock, squeegee drag, ink density variation and slight misregistration.',
        camera_and_composition:
          'Large central emblem-like subject, strong silhouette, decorative elements radiating from it.',
        atmosphere_and_mood: 'Loud, raw and energetic, printed the night before the show.',
        rendering_and_quality:
          'Visible print-shop process with thick ink contours; no digital gradients and no band names.',
        key_features:
          'three spot inks plus black; coarse halftone; overprint colors; squeegee drag; central emblem subject',
      }),
      avoid: [...AVOID, 'concert crowd', 'band on stage'],
      briefs: [
        'Gig poster screenprint of a grinning skeleton playing a double bass wrapped in roses, cream, teal and blood red spot inks with black, coarse halftone shading, squeegee drag on fibrous stock. No text or logo.',
        'Gig poster screenprint of a two-headed wolf howling under a huge halftone sun, overprint colors and slight misregistration. No text or logo.',
        'Gig poster screenprint of an electric guitar sprouting thorny vines and burning at the neck, central emblem composition. No text or logo.',
      ],
    },
    'SP04-078': {
      dna: ed({
        aesthetic:
          'Street stencil art: the subject cut into a one- or two-layer stencil with bridges and sprayed onto a wall.',
        color_and_tone:
          'Black spray with at most one accent color, usually red, on a gray concrete or brick wall.',
        lighting_and_shadow:
          'Light reduced to two or three posterized levels; shadows are solid black islands.',
        texture_and_material:
          'Overspray halos, drips, bridge gaps in the shapes, rough wall texture showing through.',
        camera_and_composition:
          'Keeps the requested framing and subject, placed on a wall surface without placards, slogans or frames.',
        atmosphere_and_mood: 'Rebellious, quick and direct, an image left overnight.',
        rendering_and_quality:
          'Hard-edged posterized silhouettes with stencil bridges; never freehand shading or protest signs.',
        key_features:
          'cut stencil bridges; black spray plus one red; overspray halos and drips; posterized levels; wall texture',
      }),
      avoid: [...TREATMENT_AVOID, 'protest placards', 'blank signs'],
      briefs: [
        'Street stencil art of an adult man releasing a dove from cupped hands, black spray with a red accent on the dove, overspray halos and drips on a rough brick wall, visible stencil bridges. No text or logo.',
        'Street stencil art of a crow carrying an old iron key in its beak, posterized two-level black on gray concrete. No text or logo.',
        'Street stencil art of an adult woman shouting into a megaphone that bursts with red flowers, hard-edged silhouette. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Painterly Metaphor Poster',
      domain: 'painted conceptual poster',
      tags: ['visual-metaphor', 'painterly', 'conceptual-poster'],
      dna: ed({
        aesthetic:
          'Painterly metaphor poster: one surreal visual pun painted with loose gouache and brush, the idea carried entirely by the image.',
        subject_treatment: poster(
          'the single central visual-metaphor composition on a flat painted ground',
        ),
        color_and_tone:
          'Two or three dominant muted colors on a flat painted ground, one saturated accent for the twist.',
        lighting_and_shadow:
          'Simple soft side light and flat shadow; drama comes from the idea, not the light.',
        texture_and_material:
          'Visible brush strokes, dry scumbles, paper or canvas texture, imperfect hand-cut edges.',
        camera_and_composition:
          'One central object isolated on a flat ground, large and frontal, with generous margins.',
        atmosphere_and_mood: 'Witty, melancholy and thoughtful, a quiet shock.',
        rendering_and_quality:
          'Loose expressive painting with a clear single metaphor; no collage and no lettering.',
        key_features:
          'single visual pun; loose gouache brushwork; flat painted ground; one saturated accent; central frontal object',
      }),
      avoid: [...AVOID, 'photographic collage'],
      briefs: [
        'Painterly metaphor poster of a violin whose f-holes are weeping eyes, isolated on a flat ochre painted ground, loose gouache brushwork, one saturated blue accent in the tears. No text or logo.',
        'Painterly metaphor poster of an adult head in profile opening like a birdcage with a small bird leaving, dry scumbled gray ground. No text or logo.',
        'Painterly metaphor poster of a red apple with a brass keyhole in its side, soft side light and flat shadow. No text or logo.',
      ],
    },
    {
      name: 'Op-Ed Conceptual Spot Illustration',
      domain: 'editorial newspaper illustration',
      tags: ['editorial', 'conceptual', 'spot-illustration'],
      dna: ed({
        aesthetic:
          'Newspaper op-ed spot illustration: a small conceptual scene of tiny figures and oversized symbols, drawn in flat shapes with fine grain.',
        color_and_tone:
          'Limited palette of three or four colors, typically navy, coral, cream and mustard, with dry grain texture.',
        lighting_and_shadow:
          'Flat shapes with a single cast-shadow shape per object at a consistent angle.',
        texture_and_material:
          'Dry digital grain and pencil-like speckle inside flat shapes, crisp silhouette edges.',
        camera_and_composition:
          'Keeps the requested subject but stages it as a metaphor with dramatic scale contrast, tiny people and huge objects.',
        atmosphere_and_mood: 'Thoughtful, wry and a little anxious, an idea about the times.',
        rendering_and_quality:
          'Economical shape design with textured flats; no headlines, no borders and no speech bubbles.',
        key_features:
          'conceptual metaphor staging; tiny figures and huge symbols; three to four color palette; dry grain texture; single cast shadows',
      }),
      avoid: [...TREATMENT_AVOID, 'headline', 'speech bubbles'],
      briefs: [
        'Op-ed conceptual spot illustration of an adult office worker trapped inside a giant hourglass, sand pouring over his shoulders, navy, coral and cream flat shapes with dry grain, single cast shadows. No text or logo.',
        'Op-ed conceptual spot illustration of tiny adult climbers roped together scaling a towering stack of coins, dramatic scale contrast. No text or logo.',
        'Op-ed conceptual spot illustration of a lone oak whose roots are tangled power cables plugged into the ground, mustard and navy palette. No text or logo.',
      ],
    },
    {
      name: 'Swiss Grid Photo Poster',
      domain: 'modernist photographic poster',
      tags: ['swiss-style', 'photo-crop', 'grid'],
      dna: ed({
        aesthetic:
          'Swiss modernist photo poster: a tightly cropped black-and-white photograph placed on a strict grid with one or two flat color geometric shapes.',
        subject_treatment: poster(
          'the grid composition of a bold photo crop and flat geometric shapes, with no typography',
        ),
        color_and_tone:
          'High-contrast black-and-white photography with one flat signal red or blue shape, lots of white.',
        lighting_and_shadow:
          'Hard studio or sunlight in the photograph, deep blacks, crisp shadow shapes that echo the grid.',
        texture_and_material:
          'Fine gravure grain in the photo, flat offset ink in the shapes, smooth white stock.',
        camera_and_composition:
          'Extreme crop, off-center subject aligned to grid columns, strong diagonals and bleed off the edge.',
        atmosphere_and_mood: 'Objective, precise and dynamic, calm energy held in tension.',
        rendering_and_quality:
          'Rigorous alignment and clean hierarchy; no text blocks, no ornament and no gradients.',
        key_features:
          'extreme black-and-white photo crop; strict grid; one flat red or blue shape; white space; bleed off the edge',
      }),
      avoid: [...AVOID, 'typography columns', 'decorative ornament'],
      briefs: [
        'Swiss grid photo poster of an adult swimmer diving, cropped at the shoulders and bleeding off the top edge, high-contrast black-and-white photograph aligned to a strict grid with one flat red circle, lots of white. No text or logo.',
        'Swiss grid photo poster of a spiral staircase seen from directly above in a tight crop, a blue square placed on the grid beside it. No text or logo.',
        'Swiss grid photo poster of an adult sprinter crouched in the starting blocks, strong diagonal and off-center crop, hard sunlight. No text or logo.',
      ],
    },
  ],
};

export const aliases = {
  'SP04-032': 'Mucha Art Nouveau Poster',
};

export default spec;
