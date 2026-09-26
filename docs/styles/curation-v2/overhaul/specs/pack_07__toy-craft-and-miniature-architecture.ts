import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'brand logo on parts',
  'readable text',
  'turning a requested object into a house or building',
  'full-scale real construction',
  'playroom or party scene',
];

// Craft media rebuild the subject as a handmade miniature; presentation profiles below own a stated framing.
const craft =
  'Keep the requested subject, its identity, pose and camera, and rebuild it as a handmade tabletop miniature in this material; a requested object stays that object and never turns into a house or building.';
const owns = (what: string) =>
  `Keep the requested subject, its identity and pose; this preset owns ${what}, and a requested object stays that object instead of becoming a building.`;

function mini(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? craft, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_07',
  category: '6. Toy Craft And Miniature Architecture',
  updates: {
    'SP07-065': {
      dna: mini({
        aesthetic:
          'Papercraft construction: the subject scored, folded and glued from cardstock, with visible glue tabs, layered pop-up planes and tracing-paper windows at tabletop scale.',
        color_and_tone:
          'Kraft brown, off-white card and muted matte printed colors, with milky tracing-paper whites where light passes through.',
        lighting_and_shadow:
          'Warm desk lamp from one side, thin crisp shadows under every fold, backlight glowing through the tracing-paper panes.',
        texture_and_material:
          'Paper fibre, crisp score lines, cut edges showing one-millimetre card thickness, glue tabs and slight warping of large panels.',
        camera_and_composition:
          'Keep the requested view as a tabletop macro with shallow depth of field so folds and tabs read at scale.',
        atmosphere_and_mood:
          'Patient, precise and quietly delightful, a world made with a craft knife.',
        rendering_and_quality:
          'Tabletop macro photograph of a real paper model; flat printed faces, no gloss and no CG smoothness.',
        key_features:
          'scored and folded cardstock; visible glue tabs; layered pop-up planes; tracing-paper windows; tabletop macro depth of field',
      }),
      avoid: [...AVOID, 'city miniature postcard', 'low-poly render'],
      dropAvoid: ['photoreal material finish'],
      briefs: [
        'Papercraft construction of a dragon coiled around a hoard of folded paper coins, every scale a scored cardstock tab, tracing-paper wings glowing in the warm desk-lamp backlight, tabletop macro. No text or logo.',
        'Papercraft construction of a volcanic island erupting in layered pop-up planes of red and orange card, kraft-brown cliffs with visible glue tabs, crisp fold shadows, shallow depth of field. No text or logo.',
        'Papercraft construction of an espresso machine that stays an espresso machine: portafilter, steam wand and cups folded from off-white and grey card, score lines and glue tabs visible on every panel. No readable text or logo.',
      ],
    },
    'SP07-066': {
      dna: mini({
        aesthetic:
          'Microscale brick build: the subject assembled from tiny studded plastic bricks, plates and tiles so the studs become surface texture and curves turn into steps.',
        color_and_tone:
          'Flat injection-molded primaries, greys and tans with no gradient inside a single brick; glossy but solid color.',
        lighting_and_shadow:
          'Soft studio key with small specular glints on every stud and hard little shadows in the stepped seams.',
        texture_and_material:
          'Round studs, crisp part seams, offset plates, smooth tiles on finished faces; plain studs with no lettering.',
        camera_and_composition:
          'Keep the requested view as a macro on a neutral base; the stepped silhouette must read at thumbnail size.',
        atmosphere_and_mood: 'Clever and tactile, a builder solving every curve with small parts.',
        rendering_and_quality:
          'Macro photograph of a real brick model, generic parts only, no minifigures and no brand marks.',
        key_features:
          'studs as surface texture; stepped brick curves; offset plate seams; flat molded primaries; macro on a neutral base',
      }),
      avoid: [...AVOID, 'minifigure', 'brand name on studs', 'smooth sculpted plastic'],
      briefs: [
        'Microscale brick build of a siege tower rolling toward a grey castle wall, every plank a brown plate, studs catching small glints, stepped battlements, macro on a neutral base with soft studio key. No text or logo.',
        'Microscale brick build of a green kraken rising out of a stepped blue-plate sea, tentacles made of curved slopes and offset plates, hard little shadows in the seams, low macro view. No text or logo.',
        'Microscale brick build of a rotary telephone that stays a telephone: cream and red bricks, dial ring stepped from round plates, coiled cord of tiny clips, studs as texture. No readable numbers or logo.',
      ],
    },
    'SP07-067': {
      dna: mini({
        aesthetic:
          'Wet-sand sculpture: the subject packed from bucket-molded sand and carved with palette knives and straws, finished with drip-castle spires and crumbling edges.',
        color_and_tone:
          'Tan and ochre wet sand darkening toward the damp base, pale dry crust on exposed edges, small white shell accents.',
        lighting_and_shadow:
          'Low raking beach sun that picks out every carved line; soft blue sky fill in the shadows.',
        texture_and_material:
          'Granular crust, drip ridges, knife-carved planes, shell and pebble inclusions, edges already slumping as they dry.',
        camera_and_composition:
          'Keep the requested view at low ground level, with a hint of beach and tide line to set the fleeting scale.',
        atmosphere_and_mood: 'Fleeting and sunny, a monument that the next wave will take.',
        rendering_and_quality:
          'Outdoor photograph of real sand with visible grain; never hard stone, never plastic.',
        key_features:
          'bucket-molded and knife-carved sand; drip-castle spires; dry crust on wet sand; shell inclusions; low raking beach sun',
      }),
      avoid: [...AVOID, 'sandcastle bucket default', 'beach crowd'],
      briefs: [
        'Wet-sand sculpture of a colossal sea turtle carrying a small drip-castle town on its shell, low raking sun picking out knife-carved scales, the tide line creeping toward its flippers. No text or logo.',
        'Wet-sand sculpture of a crouching griffin half dissolved by a wave, one wing crisply carved and the other slumped into wet sand, shell inclusions, seen from ground level at dusk. No text or logo.',
        'Wet-sand sculpture of an upright piano that stays a piano: lid, keys and pedals carved from packed tan sand, dry pale crust on the edges, drip ridges down its sides on an empty beach. No text or logo.',
      ],
    },
    'SP07-068': {
      dna: mini({
        aesthetic:
          'Improvised cardboard construction: reused shipping boxes cut with a craft knife, folded flaps, packing-tape joints and black marker linework drawn directly on the card.',
        color_and_tone:
          'Kraft brown with darker corrugation edges, shiny clear and brown tape, black marker, one or two poster-paint accents.',
        lighting_and_shadow:
          'Soft window daylight from one side, gentle shadows, glare streaks only on the packing tape.',
        texture_and_material:
          'Exposed corrugated flutes at every cut edge, crushed corners, wrinkled tape, uneven hand-cut openings.',
        camera_and_composition:
          'Keep the requested view on a plain floor or table; the improvised joins stay visible and honest.',
        atmosphere_and_mood:
          'Resourceful and cheeky, ambition built from whatever boxes were at hand.',
        rendering_and_quality:
          'Natural-light photograph of a real cardboard build; imperfect cuts are part of the charm.',
        key_features:
          'reused box cardboard; exposed corrugated flutes; packing-tape joints; marker linework on card; hand-cut openings',
      }),
      avoid: [...AVOID, 'solid wall', 'toy clutter'],
      briefs: [
        'Improvised cardboard construction of an empty suit of plate armor on a stand, each plate cut from shipping boxes with exposed corrugated edges, packing-tape rivets and marker-drawn engraving, soft window light. No text or logo.',
        'Improvised cardboard construction of a trebuchet caught mid-launch, its arm made of taped box strips, a crumpled-card ball in the air, poster-paint red on the counterweight, low side view. No text or logo.',
        'Improvised cardboard construction of a grandfather clock that stays a clock: hand-cut pendulum window, marker-drawn wood grain, a blank card dial, tape wrinkles catching light. No numerals, text or logo.',
      ],
    },
    'SP07-069': {
      dna: mini({
        aesthetic:
          'Heat-welded inflatable construction: every form made of rounded PVC pressure tubes and pillowy panels held up by air, with blower hose and valves visible.',
        color_and_tone:
          'Saturated safety red, yellow, blue and green with white panels; glossy and very clean.',
        lighting_and_shadow:
          'Bright outdoor sun with long specular streaks along each tube and soft shadows under the bulges.',
        texture_and_material:
          'Welded seams, pinched corners, creases where panels meet, taut shine; no twisted-balloon knots.',
        camera_and_composition:
          'Keep the requested view; show the subject tethered to the ground so its air-filled weightlessness reads.',
        atmosphere_and_mood: 'Buoyant, loud and slightly absurd, anything can be blown up.',
        rendering_and_quality:
          'Photographic PVC material with crisp highlights; distinct from twisted balloon art and from bounce castles.',
        key_features:
          'rounded PVC pressure tubes; heat-welded seams; visible blower hose and valves; safety-primary colors; long specular streaks',
      }),
      avoid: [...AVOID, 'twisted balloon animal'],
      briefs: [
        "Heat-welded inflatable construction of a knight's barded warhorse the size of a barn, tethered in a windy field, red and yellow pressure tubes, blower hose snaking across the grass, specular streaks in bright sun. No text or logo.",
        'Heat-welded inflatable construction of a blue whale arching out of a calm lake, pillowy white belly panels, welded seams and a valve on its flank, reflection in the water. No text or logo.',
        'Heat-welded inflatable construction of a motor scooter that stays a scooter: round tube handlebars, pillowy seat, puffed wheels, tethered at the kerb with its blower hose running. No text or logo.',
      ],
    },
    'SP07-070': {
      dna: mini({
        aesthetic:
          'Tabletop gingerbread construction: baked cookie panels cut to shape and glued with piped royal icing, candy inlays and sugar-glass windows at model scale.',
        color_and_tone:
          'Toasted ginger brown, bright white icing, peppermint red and gumdrop colors, amber sugar glass; warm and festive.',
        lighting_and_shadow:
          'Warm tabletop lamp glow, candle light passing through sugar-glass panes, soft shadows on a floured board.',
        texture_and_material:
          'Cookie crumb and baked blistering, piped icing beads and drips, crushed-candy panes, sugar sparkle.',
        camera_and_composition:
          'Keep the requested view as a tabletop macro so the baked seams and icing joints stay in focus.',
        atmosphere_and_mood: 'Warm, handmade and a little mischievous, baking as construction.',
        rendering_and_quality:
          'Food macro of a real baked build; the model scale is obvious, unlike full-size candy architecture.',
        key_features:
          'baked cookie panels; piped royal icing seams; candy inlays; sugar-glass panes; tabletop macro scale',
      }),
      avoid: [...AVOID, 'full-size candy architecture'],
      briefs: [
        'Tabletop gingerbread construction of a paddle steamer on a river of blue sugar glass, cookie hull with piped icing railings, peppermint smokestacks, amber candle glow through the cabin windows. No text or logo.',
        'Tabletop gingerbread construction of a great horned owl perched on a candy-cane branch, feathers in piped icing beads, baked blistering on its wings, soft lamp light on a floured board. No text or logo.',
        'Tabletop gingerbread construction of a sewing machine that stays a sewing machine: cookie body, icing-piped decoration, a gumdrop spool and sugar-glass bobbin cover. No text or logo.',
      ],
    },
    'SP07-071': {
      dna: mini({
        aesthetic:
          'Fungal miniature construction: the subject grown and assembled from mushroom caps, gills and bracket fungi, with moss and lichen as the finish.',
        color_and_tone:
          'Cream, tan and rust caps with pale speckles, damp moss green and a violet or orange accent fungus; humid mid tones.',
        lighting_and_shadow:
          'Low misty forest light, soft glow under the caps, spore dust catching a narrow shaft of sun.',
        texture_and_material:
          'Matte fungal skin, fine gill fans on undersides, speckling, damp moss, spore dust in the air.',
        camera_and_composition:
          'Keep the requested view as a forest-floor macro with shallow depth of field and a mossy base.',
        atmosphere_and_mood: 'Damp, secret and gently eerie, something grown overnight.',
        rendering_and_quality:
          'Macro nature photograph of real fungal material; no fairy-cottage cliché and no creatures.',
        key_features:
          'mushroom caps and gills as structure; bracket fungus ledges; cream speckling; spore dust in a light shaft; forest-floor macro',
      }),
      avoid: [...AVOID, 'fairy cottage cliché'],
      briefs: [
        'Fungal miniature construction of a watermill on a mossy stream, a bracket-fungus wheel turning in the water, gilled cap roof with cream speckles, spore dust drifting in a narrow shaft of sun, forest-floor macro. No text or logo.',
        'Climbing a fallen log at misty dusk, a fortress of stacked bracket fungi raises orange-capped towers, soft light glowing under every ledge as a tiny beetle patrols the gate. No text or logo.',
        'Standing in the moss exactly as an armchair should, a seat grown from plump caps has a gill-fan backrest, moss upholstery and one violet fungus sprouting from its arm, shallow depth of field. No text or logo.',
      ],
    },
    'SP07-072': {
      dna: mini({
        aesthetic:
          'Bottle curio miniature: the subject built at tiny scale inside a corked glass bottle, as if assembled through the neck with tweezers and fine rigging.',
        subject_treatment: owns('the corked-bottle presentation that encloses it'),
        color_and_tone:
          'Pale aqua glass tint over the scene, cork brown, warm wood base; the bottle shifts colors toward green at its thickest.',
        lighting_and_shadow:
          'Soft side light with long bright reflections down the curved glass and a caustic glow on the tabletop.',
        texture_and_material:
          'Curved glass refraction bending the miniature at the edges, bubbles in the glass, cork grain, thread-fine rigging.',
        camera_and_composition:
          'The whole bottle is visible and lying or standing on a surface; the subject sits within it and never outside.',
        atmosphere_and_mood:
          'Curious and patient, a collector cabinet piece full of impossible care.',
        rendering_and_quality:
          'Still-life photograph with accurate glass refraction; the scene stays contained, never an open seascape.',
        key_features:
          'subject enclosed in a corked bottle; aqua glass tint; refraction bending the miniature; fine rigging; caustic glow on the table',
      }),
      avoid: [...AVOID, 'subject spilling outside the bottle'],
      briefs: [
        'Bottle curio miniature: a storm-tossed three-masted galleon on carved waves sealed inside a corked green bottle lying on a desk, thread-fine rigging, glass refraction bending the bow, caustic glow on the wood. No text or logo.',
        'Standing on a windowsill inside a square pale-aqua bottle, a tiny autumn orchard keeps a working cider press and fallen apples, soft side light catching the bubbles in the glass. No text or logo.',
        'Assembled inside a small corked medicine bottle, a brass apothecary scale stays a real scale, its pans and chains thread-fine, long reflections sliding down the curved glass. No readable label or logo.',
      ],
    },
    'SP07-073': {
      dna: mini({
        aesthetic:
          'Sculpted earth cross-section: a handmade cutaway model sliced through soil, showing capillary root branching, layered strata and rounded cavities with amber gel pockets.',
        subject_treatment: owns('the vertical cross-section through the ground that reveals it'),
        color_and_tone:
          'Layered umber, ochre, grey clay and black loam bands, pale root lines, warm glowing amber gel pockets.',
        lighting_and_shadow:
          'Even front light across the cut face with warm glow from the amber pockets; a thin strip of daylight above ground.',
        texture_and_material:
          'Crumbly soil, pebble layers, fibrous roots branching like capillaries, glossy translucent gel.',
        camera_and_composition:
          'Straight-on cutaway with a thin band of surface on top and most of the frame given to the section below.',
        atmosphere_and_mood: 'Hidden and busy, the secret underground half of an ordinary place.',
        rendering_and_quality:
          'Model-like cross-section with clean cut edges; no insects, larvae or creatures in the cavities.',
        key_features:
          'vertical earth cross-section; capillary root branching; layered soil strata; rounded cavities; amber gel pockets',
      }),
      avoid: [...AVOID, 'ant farm', 'insects', 'creature focus'],
      briefs: [
        'Sculpted earth cross-section of a buried treasure chamber beneath a hill, capillary roots from a lone oak threading down through ochre and black strata, amber gel pockets glowing around the hoard, straight-on cutaway. No text or logo.',
        'Sculpted earth cross-section of a riverbank at night, a network of rounded cavities and tunnels beneath the roots, water visible at one side, warm amber pockets the only light below a dark surface strip. No text or logo.',
        'Sculpted earth cross-section of a potted houseplant that stays a potted plant: terracotta pot cut in half, layered soil and pebbles, fine capillary roots and small amber moisture pockets. No text or logo.',
      ],
    },
    'SP07-074': {
      dna: mini({
        aesthetic:
          'Toy-scale sectional cutaway: the subject built in painted toy wood with its front face removed, revealing stacked compartments and every internal part in miniature.',
        subject_treatment: owns('the open-front sectional cutaway that shows its interior'),
        color_and_tone:
          'Pastel wall fields, painted toy-wood primaries and natural beech edges; bright, soft and even.',
        lighting_and_shadow:
          'Each compartment lit by its own small warm source, soft front fill, gentle shadows inside the cut edges.',
        texture_and_material:
          'Painted wood with softened corners, tiny textile and paper details, visible cut section edges in raw wood.',
        camera_and_composition:
          'Straight-on elevation of the open section so every compartment reads at once, like a toy display.',
        atmosphere_and_mood: 'Curious and cozy, the pleasure of seeing how everything fits inside.',
        rendering_and_quality:
          'Clean toy photography with legible compartments; no figures and no product-packaging look.',
        key_features:
          'front face removed; stacked miniature compartments; painted toy wood; raw-wood section edges; straight-on elevation',
      }),
      avoid: [...AVOID, 'closed facade', 'dollhouse figure'],
      briefs: [
        'Toy-scale sectional cutaway of a castle keep in painted toy wood, front removed to show armory, great hall, kitchen and dungeon stacked in pastel compartments, each lit by a tiny warm lamp, straight-on elevation. No text or logo.',
        'Toy-scale sectional cutaway of a zeppelin sliced lengthwise, tiny cabins, galley, map room and engine bay in painted beech, gas cells as quilted fabric above, soft front fill. No text or logo.',
        'Toy-scale sectional cutaway of a fire engine that stays a vehicle: hose reels, water tank, pump and ladder mechanism revealed in painted toy wood with raw-wood cut edges. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Matchstick Glue-Up Model',
      domain: 'glued matchstick construction',
      tags: ['matchstick', 'model-making', 'handmade'],
      dna: mini({
        aesthetic:
          'Matchstick construction: the subject built from thousands of glued wooden matchsticks laid in courses, with the dark heads used as a deliberate pattern.',
        color_and_tone:
          'Pale pine yellow sticks, red and near-black match heads, amber glue fillets; warm, limited palette.',
        lighting_and_shadow:
          'Warm workbench lamp raking across the stick courses so each stick casts a tiny line shadow.',
        texture_and_material:
          'Square-section sticks, glossy glue beads at joints, rounded heads, sanded curves where sticks are trimmed.',
        camera_and_composition:
          'Keep the requested view as a workbench macro so the individual sticks remain countable.',
        atmosphere_and_mood: 'Obsessive and proud, years of evenings visible in every course.',
        rendering_and_quality:
          'Macro photograph of a real matchstick model with countable sticks; no smooth carved wood.',
        key_features:
          'glued matchstick courses; match heads as pattern; glue fillets at joints; warm raking lamp; countable sticks',
      }),
      avoid: [...AVOID, 'fire', 'smooth carved wood', 'popsicle sticks'],
      briefs: [
        'Rising from a workbench under a warm raking lamp, a gothic cathedral with flying buttresses is built entirely from matches, black heads patterning the roof ridges and glue beads glinting at every joint, macro view. No text or logo.',
        'Leaping out of deep shadow, a stag with branching antlers is built from pale pine sticks that follow its muscles, red match heads forming its eyes and hooves. No text or logo.',
        'Curved from trimmed sticks yet still a playable violin, an instrument with match-head pegs and strings of thread rests on its case, amber glue fillets along every seam. No text or logo.',
      ],
    },
    {
      name: 'Layer-Line 3D-Print Model',
      domain: 'FDM printed plastic model',
      tags: ['3d-print', 'layer-lines', 'filament'],
      dna: mini({
        aesthetic:
          'Desktop 3D-print model: the subject printed in plastic filament with fine horizontal layer lines, support scars and a slight elephant-foot flare at the base.',
        color_and_tone:
          'Single-color filament per part: matte grey, bone white, silk gold or translucent green; flat color with subtle sheen.',
        lighting_and_shadow:
          'Cool desk light grazing the layers so every line shows as a fine ridge; soft shadow on the build plate.',
        texture_and_material:
          'Stacked 0.2 mm layer lines, stringing wisps, rough support-contact scars, seam line zipping up one side.',
        camera_and_composition:
          'Keep the requested view as a macro on a textured build plate or desk, close enough to show the layers.',
        atmosphere_and_mood: 'Freshly made and nerdy, the object still warm off the printer.',
        rendering_and_quality:
          'Macro photograph of a real print with honest defects; never a smooth resin cast or CG render.',
        key_features:
          'visible horizontal layer lines; support scars; stringing wisps; single-color filament; macro on a build plate',
      }),
      avoid: [...AVOID, 'smooth resin cast', 'painted miniature finish'],
      briefs: [
        'Desktop 3D-print model of a chess set mid-game, bone-white and matte-grey filament knights and rooks, layer lines catching cool grazing light, stringing wisps between two pieces, macro on a textured build plate. No text or logo.',
        'Desktop 3D-print model of a ruined abbey terrain tile in grey filament, rough support scars under the broken arches, seam line up one tower, low grazing light. No text or logo.',
        'Desktop 3D-print model of a desk lamp that stays a lamp: articulated arm in silk-gold filament, translucent green shade glowing, layer lines along every curve. No text or logo.',
      ],
    },
    {
      name: 'Sprue-Frame Model Kit',
      domain: 'unassembled plastic model kit',
      tags: ['model-kit', 'sprue', 'unassembled'],
      dna: mini({
        aesthetic:
          'Unassembled model kit: the subject broken into injection-molded parts still attached to rectangular sprue frames by thin gates, ready to be clipped.',
        subject_treatment: owns('the flat unassembled sprue-frame layout of its parts'),
        color_and_tone:
          'One plastic color per frame, such as light grey, olive, sand or clear, on a neutral cutting mat; flat and even.',
        lighting_and_shadow:
          'Soft overhead light with small crisp shadows under each frame and gloss on the clear parts.',
        texture_and_material:
          'Smooth molded plastic, thin gates, ejector-pin circles, a few parts already clipped with white stress marks.',
        camera_and_composition:
          'Top-down or low-angle view of two to four frames laid on a mat; the subject is recognisable from its parts.',
        atmosphere_and_mood: 'Anticipation and order, the whole subject waiting to be built.',
        rendering_and_quality:
          'Clean photograph of real plastic frames; part numbers left as blank tabs, never readable.',
        key_features:
          'parts on rectangular sprue frames; thin gates and ejector-pin marks; one color per frame; clipped parts; overhead view on a cutting mat',
      }),
      avoid: [...AVOID, 'box art', 'readable part numbers', 'fully assembled model only'],
      briefs: [
        'Unassembled model kit of a flying-boat biplane: wings, floats, struts and propeller still on light-grey sprue frames on a green cutting mat, clear canopy parts glossy on their own frame, top-down soft light. No numbers, text or logo.',
        'Unassembled model kit of a wyvern skeleton: ribs, vertebrae, wing bones and skull laid out on three bone-colored sprue frames, one wing already clipped and half built beside them. No numbers, text or logo.',
        'Unassembled model kit of a kitchen stand mixer that stays a mixer: bowl, beater and motor housing halves on cream sprue frames, a few parts clipped with white stress marks. No numbers, text or logo.',
      ],
    },
    {
      name: 'Quilled Paper Coil Relief',
      domain: 'paper quilling relief',
      tags: ['quilling', 'paper-coils', 'relief'],
      dna: mini({
        aesthetic:
          'Paper quilling: the subject formed from narrow paper strips rolled into tight coils, teardrops and scrolls, glued edge-up onto a backing board as a shallow relief.',
        color_and_tone:
          'Bright graded strip colors against a plain white or black backing; gradients built strip by strip.',
        lighting_and_shadow:
          'Low side light so every coil casts a thin crescent shadow and the relief reads in depth.',
        texture_and_material:
          'Paper strip edges only, tight and loose coils, pinched teardrop and eye shapes, tiny glue gaps.',
        camera_and_composition:
          'Keep the requested view flattened into a frontal relief on the board, slightly angled to show the strip height.',
        atmosphere_and_mood: 'Delicate, joyful and meticulous, drawing made with rolled paper.',
        rendering_and_quality:
          'Macro photograph of a real quilled relief; strip edges crisp, no printed paper surfaces.',
        key_features:
          'rolled paper-strip coils; teardrop and scroll shapes; edge-up relief on a board; strip-by-strip gradients; low side light',
      }),
      avoid: [...AVOID, 'flat printed paper', 'folded origami'],
      briefs: [
        'Paper quilling relief of a phoenix rising, wings made of hundreds of red, orange and gold coils and teardrops edge-up on a black board, low side light casting crescent shadows. No text or logo.',
        'Paper quilling relief of an autumn forest inside a round frame, trees of loose ochre and rust coils, a winding path in scrolled strips, slightly angled view showing the strip height. No text or logo.',
        'Paper quilling relief of a hot-air balloon that stays a balloon: striped envelope of graded blue coils, basket in tight tan scrolls, ropes as single strips on a white board. No text or logo.',
      ],
    },
    {
      name: 'Papier-Mache Strip Sculpture',
      domain: 'papier-mache craft sculpture',
      tags: ['papier-mache', 'poster-paint', 'handmade'],
      dna: mini({
        aesthetic:
          'Papier-mache sculpture: the subject built up from pasted strips of torn paper over a wire and balloon armature, then painted in thick poster paint.',
        color_and_tone:
          'Bold chalky poster-paint colors with thin patches where grey torn newsprint shows through; matte.',
        lighting_and_shadow:
          'Soft studio daylight with gentle shadows; lumpy surfaces create small uneven highlights.',
        texture_and_material:
          'Lumpy layered strip edges, paste wrinkles, brush streaks, faint grey newsprint that never becomes readable.',
        camera_and_composition:
          'Keep the requested view with the object standing on a plain surface; its hollow lightness should read.',
        atmosphere_and_mood: 'Cheerful, handmade and a little grotesque, carnival craft energy.',
        rendering_and_quality:
          'Photograph of a real papier-mache piece; lumpiness kept, newsprint stays blurred and unreadable.',
        key_features:
          'pasted torn-paper strips; lumpy uneven surface; chalky poster paint; grey newsprint showing through; hollow lightweight form',
      }),
      avoid: [...AVOID, 'readable newsprint', 'smooth ceramic', 'polished sculpture'],
      briefs: [
        'Hung on a studio wall in soft daylight, a giant carnival mask of a horned demon shows lumpy strip-built cheeks, chalky red and gold poster paint and grey newsprint peeking through at the horn tips. No readable text or logo.',
        'Dangling on a wire above a small painted paper village, a crescent moon shows pasted strip edges across its face and pale yellow paint streaks against a dark backdrop. No text or logo.',
        'Standing on bare boards and still a proper rocking horse, a lumpy strip-built toy with sturdy rockers wears blue and white poster paint with visible brush streaks. No readable text or logo.',
      ],
    },
    {
      name: 'Snow-Globe Dome Miniature',
      domain: 'snow globe presentation',
      tags: ['snow-globe', 'dome', 'miniature'],
      dna: mini({
        aesthetic:
          'Snow globe: the subject as a tiny painted resin miniature sealed in a water-filled glass dome on a turned base, flakes drifting around it.',
        subject_treatment: owns('the water-filled glass dome and base that enclose it'),
        color_and_tone:
          'Painted resin colors softened by water, white flakes, dark lacquered wood or black base; a cold blue cast inside.',
        lighting_and_shadow:
          'Soft window light with a bright curved highlight across the dome and a glow where light pools in the water.',
        texture_and_material:
          'Spherical glass refraction magnifying the center, suspended glitter-flakes, tiny air bubble at the top, glossy painted resin.',
        camera_and_composition:
          'The whole dome and base visible and centered on a surface; the subject is contained within the sphere.',
        atmosphere_and_mood: 'Hushed, wintry and nostalgic, a small world shaken and settling.',
        rendering_and_quality:
          'Still-life photograph with accurate spherical refraction; distinct from a corked bottle, no water spilling.',
        key_features:
          'water-filled glass dome; drifting flakes; spherical magnification; turned wooden base; cold blue inner cast',
      }),
      avoid: [...AVOID, 'corked bottle', 'subject outside the dome'],
      briefs: [
        'Trapped inside a glass dome on a windowsill, a tiny gothic bell tower on a jagged crag rings through a whirling blizzard, the curved glass magnifying it above a dark lacquered base, cold blue inner cast. No text or logo.',
        'Crossing a frozen pine forest inside a glass dome, a lantern-lit covered wagon leaves tiny tracks as flakes settle, a bright curved highlight sweeping across the glass, seen from slightly above. No text or logo.',
        'Sitting on a desk inside a glass dome, a vintage typewriter stays a typewriter, black resin with silver keys, glitter flakes drifting slowly around it above a black base. No readable letters or logo.',
      ],
    },
    {
      name: 'Static-Grass Scenic Layout',
      domain: 'hobby scenic baseboard diorama',
      tags: ['scenic-layout', 'static-grass', 'diorama'],
      dna: mini({
        aesthetic:
          'Hobby scenic layout: the subject set on a baseboard landscape of static-grass flock, lichen and clump-foliage trees, plaster rock castings and a painted sky backdrop.',
        subject_treatment: owns('the scenic baseboard setting with its cut edge and backdrop'),
        color_and_tone:
          'Slightly too-uniform flock greens, dry-brushed grey rock, ochre paths and a soft painted blue backdrop.',
        lighting_and_shadow:
          'Even overhead layout lighting with soft shadows; faint seam where the backdrop meets the scenery.',
        texture_and_material:
          'Upright static-grass fibres, sponge-like foliage clumps, dry-brushed plaster rock, gloss resin water.',
        camera_and_composition:
          'Eye-level at model scale, with the cut edge of the baseboard visible at one side to reveal the model.',
        atmosphere_and_mood:
          'Quiet, loving and orderly, a landscape built on evenings and weekends.',
        rendering_and_quality:
          'Photograph of a real hobby layout; the flock and foliage read as model materials, not real grass.',
        key_features:
          'static-grass flock; clump-foliage trees; dry-brushed plaster rock; painted sky backdrop; visible baseboard edge',
      }),
      avoid: [...AVOID, 'train on the layout', 'real-scale landscape photo'],
      briefs: [
        'Hobby scenic layout of a mountain pass with a stone viaduct over a resin-gloss river, clump-foliage pines on dry-brushed plaster cliffs, painted sky backdrop, the cut baseboard edge at the right. No text or logo.',
        'Hobby scenic layout of a windswept moor with a ring of standing stones and a burial mound, uniform static-grass flock, low eye-level at model scale, faint backdrop seam. No text or logo.',
        'Hobby scenic layout with a farm tractor that stays a tractor, parked in a flocked field beside a lichen hedge, ochre track ruts, even overhead layout lighting. No text or logo.',
      ],
    },
    {
      name: 'Chenille Pipe-Cleaner Craft',
      domain: 'pipe-cleaner and pom-pom craft',
      tags: ['pipe-cleaner', 'pom-pom', 'fuzzy-craft'],
      dna: mini({
        aesthetic:
          'Pipe-cleaner craft: the subject bent and twisted from fuzzy chenille stems, with pom-poms for round masses and plain black bead eyes.',
        color_and_tone:
          'Candy-bright chenille colors, some tinsel metallic stems, pom-pom pastels; saturated against a plain backdrop.',
        lighting_and_shadow:
          'Soft diffused daylight catching the fuzz as a glowing halo along each stem.',
        texture_and_material:
          'Fuzzy fibre halos, visible twisted wire cores at the ends, fluffy pom-poms, tight wraps at joints.',
        camera_and_composition:
          'Keep the requested view as a close macro against a plain seamless backdrop so the silhouettes stay clear.',
        atmosphere_and_mood: 'Playful, tactile and a little silly, whimsy bent by hand.',
        rendering_and_quality:
          'Macro photograph of a real chenille build with fuzz resolved; no smooth wire or plastic.',
        key_features:
          'twisted fuzzy chenille stems; pom-pom masses; glowing fibre halos; exposed wire ends; plain seamless backdrop',
      }),
      avoid: [...AVOID, 'googly eyes', 'kids craft table'],
      briefs: [
        'Pipe-cleaner craft of a scorpion with a tinsel-silver stinger raised, legs of twisted black chenille stems, pom-pom body, fuzz glowing in soft daylight against a plain orange backdrop. No text or logo.',
        'Pipe-cleaner craft of a small forest of fuzzy spiral trees in greens and teal, pom-pom bushes at their feet, exposed wire ends at the tips, low macro view. No text or logo.',
        'Pipe-cleaner craft of a chandelier that stays a chandelier: arms of twisted gold tinsel stems, pom-pom candle flames, hanging against a plain dark backdrop. No text or logo.',
      ],
    },
    {
      name: 'Tin-Can Scrap Assemblage',
      domain: 'found-object scrap miniature',
      tags: ['scrap', 'tin-can', 'assemblage'],
      dna: mini({
        aesthetic:
          'Scrap assemblage: the subject assembled from cut tin cans, bottle caps, washers, springs and spoons, bolted and soldered together.',
        color_and_tone:
          'Tinplate silver, rust orange, faded paint scraps from old cans and bottle-cap colors; oily grey shadows.',
        lighting_and_shadow:
          'Hard workshop lamp with bright metallic glints on edges and dark gaps between the parts.',
        texture_and_material:
          'Crimped can rims, ridged bottle caps, solder blobs, rust bloom, visible bolts and rivets.',
        camera_and_composition:
          'Keep the requested view on a workbench; each found part stays identifiable inside the new form.',
        atmosphere_and_mood: 'Scrappy, inventive and defiant, junk turned into character.',
        rendering_and_quality:
          'Photograph of a real metal assemblage; printed can graphics stay faded and unreadable.',
        key_features:
          'cut tin cans and bottle caps; soldered and bolted joints; spoons and springs as parts; rust bloom; hard metallic glints',
      }),
      avoid: [...AVOID, 'readable can labels', 'clean machined metal'],
      briefs: [
        'Scrap assemblage of an armored rhinoceros, plates cut from rusted tin cans, bottle caps as its knees, a bent spoon for its horn, hard workshop lamp glinting on crimped edges. No readable text or logo.',
        'Scrap assemblage of a lobster with spring antennae and washer-jointed legs, claws cut from ridged can sides, solder blobs visible, on a dark oily workbench. No readable text or logo.',
        'Scrap assemblage of a desk fan that stays a fan: blades cut from can lids, bottle-cap hub, spring-mounted guard, rust bloom along the base. No readable text or logo.',
      ],
    },
    {
      name: 'Carved Soap-Bar Miniature',
      domain: 'soap carving',
      tags: ['soap-carving', 'knife-carved', 'translucent'],
      dna: mini({
        aesthetic:
          'Soap carving: the subject knife-carved from a single rectangular bar of soap, with the flat bar faces still visible on the back and base.',
        color_and_tone:
          'Pastel lavender, cream, mint or rose soap with slight translucency at thin edges; soft low contrast.',
        lighting_and_shadow:
          'Soft window light passing through thin edges, gentle shadows in the knife scallops.',
        texture_and_material:
          'Waxy scalloped knife cuts, smooth thumb-polished areas, curled soap shavings around the base.',
        camera_and_composition:
          'Keep the requested view as a small still life with shavings and the carving knife tip out of focus.',
        atmosphere_and_mood: 'Gentle, clean and meditative, a small patient act.',
        rendering_and_quality:
          'Macro photograph of real soap with subsurface softness; not marble, not porcelain.',
        key_features:
          'carved from a single soap bar; waxy knife scallops; translucent thin edges; curled shavings; pastel soap color',
      }),
      avoid: [...AVOID, 'marble sculpture', 'porcelain glaze', 'soap bubbles'],
      briefs: [
        'Soap carving of a sleeping fox curled nose to tail, knife-carved from a single lavender bar, waxy scallops in its fur, thin ear edges glowing in window light, curled shavings around it. No text or logo.',
        'Soap carving of a walled hill town in low relief on a mint bar, tiny towers and lanes cut in scallops, the flat bar face still visible at the edges, soft side light. No text or logo.',
        'Soap carving of a teapot that stays a teapot, carved from a cream bar with a curled spout and lid knob, knife tip and shavings blurred in the foreground. No text or logo.',
      ],
    },
  ],
};

export default spec;
