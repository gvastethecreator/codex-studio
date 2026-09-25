import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'furniture catalog staging',
  'olive branch in a vase as default decor',
  'panoramic window view as default backdrop',
  'real designer furniture replicas',
  'replacing the requested room with a living room',
];

// Template negatives that blocked the room function a prompt asks for (a kitchen, a corridor, a lamp,
// a person) or were garbled ("mandatory interior interior zones"). The category contract keeps the room.
const INTERIOR_DROP = [
  'sofa',
  'lamp',
  'curtain',
  'plant prop',
  'kitchen appliance',
  'corridor',
  'dining table',
  'person',
  'weapon',
  'day',
  'basement',
  'western',
  'modern',
  'hallway view',
  'linen cabinet',
  'kitchen sink/appliance scene',
  'fireplace scene',
  'fireplace-only tableau',
  'fireplace tableau',
  'mandatory interior interior zones',
  'showroom living interior zones',
  'cozy living-interior zones setup',
  'staged living interior zones formula',
  'staged living interior zones',
  'required temple interior zones',
  'literal temple interior zones',
  'required mansion interior zones',
  'literal mansion interior zones',
  'cluttered interior zones',
  'clutter-only interior zones',
  'fixed period interior zones',
  '1980s living interior zones',
];

// Interior systems are themes: they restyle the room the prompt names, never swap it for a sample room.
const room =
  'Keep the requested room function, occupants, action and constraints; rebuild its shell, surfaces, joinery, furniture vocabulary and light in this interior system, adding only the pieces that room needs rather than a sample furniture set.';

function interior(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? room, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_07',
  category: '1. Interior Design Systems',
  updates: {
    'SP07-001': {
      dna: interior({
        aesthetic:
          'Modern minimalist interior built from flush planes: handle-less push-latch joinery, shadow-gap skirting, recessed doors and one pale oak element against microcement and limewash.',
        color_and_tone:
          'Warm mineral white, bone and pale stone greige with one pale oak or travertine accent; no pure white and no saturated color, value steps kept small.',
        lighting_and_shadow:
          'Large soft daylight from a slot skylight or recessed window, concealed linear LED in coves, long gentle shadows that reveal the three-millimetre shadow gaps.',
        texture_and_material:
          'Seamless trowelled microcement floor, fine limewash walls with soft cloud movement, rift-sawn pale oak with tight grain, honed stone, no visible fixings.',
        camera_and_composition:
          'Keep the requested view; favour one-point frontal framing with large empty wall fields, horizon lines aligned to joints and the few objects set off-centre.',
        atmosphere_and_mood:
          'Quiet, restrained and exact, where emptiness feels deliberate and calm.',
        rendering_and_quality:
          'Architectural photograph clarity: straight verticals, crisp shadow gaps, even plaster tone without banding, no staged clutter.',
        key_features:
          'flush handle-less joinery; shadow-gap skirting; warm mineral white limewash; seamless microcement floor; single pale oak accent',
      }),
      avoid: [...AVOID, 'visible hardware', 'decorative clutter', 'pure clinical white'],
      dropAvoid: INTERIOR_DROP,
      briefs: [
        'Modern minimalist interior of a monastery scriptorium: one long pale oak writing desk cantilevered from a warm limewash wall, a single blank vellum sheet under a slot skylight, seamless microcement floor, shadow-gap joints and nothing else in the room. Frontal one-point view. No text or logo.',
        'Modern minimalist armoury: six longswords resting in recessed wall niches cut flush into warm mineral white plaster, concealed cove light grazing each blade, handle-less oak cabinets below, long soft shadows on the microcement floor. No text or logo.',
        "Modern minimalist watchmaker's workshop at dusk: a single pale oak bench flush with a limewash wall, a brass movement disassembled on a honed stone tray, concealed linear light, a calm empty wall field filling two thirds of the frame. No text or logo.",
      ],
    },
    'SP07-002': {
      dna: interior({
        aesthetic:
          'Industrial loft conversion: a former warehouse shell with riveted steel trusses, cast-iron columns, raw brick and steel-framed factory glazing left exposed, furnished sparingly inside it.',
        color_and_tone:
          'Brick red-brown, graphite steel, concrete grey and oiled-wood amber; one oxidised copper or rust accent; contrast medium-high between dark steel and window light.',
        lighting_and_shadow:
          'Hard daylight through tall multi-pane steel windows casting gridded shadow across the floor, bare-bulb or enamel pendants as secondary practicals.',
        texture_and_material:
          'Rough lime-mortared brick with soot, riveted and bolted steel, scarred wide-plank floors or power-floated concrete, exposed ducts and conduit runs.',
        camera_and_composition:
          'Keep the requested view; show ceiling height with the truss rhythm receding, window grid repeating along one wall, human-scale furniture small in a big volume.',
        atmosphere_and_mood: 'Raw, spacious and working, a factory shell re-inhabited.',
        rendering_and_quality:
          'Documentary interior photograph: honest wear, readable rivets and mortar joints, no shabby-chic distressing painted on new surfaces.',
        key_features:
          'riveted steel trusses; raw soot-marked brick; steel-framed factory glazing; gridded window shadow; exposed ducts and conduit',
      }),
      avoid: [...AVOID, 'carpet', 'wallpaper', 'low ceiling', 'faux-distressed new surfaces'],
      dropAvoid: INTERIOR_DROP,
      briefs: [
        "Industrial loft alchemist's laboratory: copper alembics and glass retorts bubbling on a long steel workbench beneath riveted trusses, hard afternoon light through a tall steel-framed window throwing a grid of shadow across scarred plank floor and raw brick. No text or logo.",
        'Industrial loft boxing gym seen from high on a steel mezzanine: two adult fighters sparring in a roped ring far below, heavy bags hanging from the truss line, soot-dark brick and exposed ducts, window grid light slanting across the canvas. No text or logo.',
        'Industrial loft greenhouse of carnivorous plants: pitcher plants and sundews on galvanised racks under a sawtooth factory roof of steel glazing, oxidised copper watering pipes, brick walls sweating in the humid light. No text or logo.',
      ],
    },
    'SP07-003': {
      dna: interior({
        aesthetic:
          'Mid-century modern interior: low horizontal lines, walnut and teak casework on tapered splayed legs, molded plywood curves, open plan with a floating room divider.',
        color_and_tone:
          'Walnut brown, teak amber, warm off-white, with mustard, olive, burnt orange or teal accents in tweed and enamel; medium contrast, warm overall.',
        lighting_and_shadow:
          'Low-sun daylight through clerestory or floor-to-ceiling glazing, cone and globe pendants, warm pools of light across low furniture.',
        texture_and_material:
          'Book-matched walnut veneer, oiled teak, nubby wool tweed, terrazzo or cork floors, slatted wood screens and ribbed glass.',
        camera_and_composition:
          'Keep the requested view; eye level held low to stress horizontals, long credenzas and rooflines running parallel to the frame edge.',
        atmosphere_and_mood: 'Optimistic, warm and relaxed, a confident post-war modernity.',
        rendering_and_quality:
          'Period magazine interior clarity: clean grain, soft warm contrast, restrained staging, no replica of a named designer chair.',
        key_features:
          'tapered splayed legs; book-matched walnut veneer; low horizontal proportion; mustard and teal tweed accents; slatted wood divider',
      }),
      avoid: [...AVOID, 'victorian ornament', 'industrial rust', 'glossy contemporary lacquer'],
      dropAvoid: INTERIOR_DROP,
      briefs: [
        "Mid-century modern fortune teller's parlor: a glass sphere on a walnut credenza with tapered legs, an adult seer in a mustard tweed suit shuffling cards at a low teak table, cone pendant pooling warm light, slatted screen behind. No readable cards, text or logo.",
        'Mid-century modern ski-lodge bar at dusk: long low teak counter, cork floor, a sunken hearth ringed by orange tweed benches, clerestory glazing showing snow-blue twilight, horizontals parallel to the frame. No text or logo.',
        "Mid-century modern ship captain's cabin: built-in walnut bunk and desk with brass-tipped splayed legs, a porthole throwing a warm circle across terrazzo, teal wool blanket, a sextant on the book-matched veneer. No text or logo.",
      ],
    },
    'SP07-004': {
      dna: interior({
        aesthetic:
          'Scandinavian hygge interior: pale scrubbed pine and birch, rounded low furniture, layered wool and linen, and many small warm light sources against long northern dusk.',
        color_and_tone:
          'Cream, oat, pale birch and soft grey with honey-warm light; one muted accent such as lingonberry red or moss green; low contrast.',
        lighting_and_shadow:
          'Several low warm points — candles, a small woodstove, shaded table lamps — against cool blue window light; soft enveloping shadow, no overhead glare.',
        texture_and_material:
          'Soap-scrubbed pine floorboards, sheepskin, chunky knit and felted wool, washed linen, matte glazed stoneware, whitewashed panelling.',
        camera_and_composition:
          'Keep the requested view; slightly close framing that feels enclosed, soft textiles in the foreground, warm and cool light zones side by side.',
        atmosphere_and_mood: 'Snug, gentle and sheltered against the cold outside.',
        rendering_and_quality:
          'Soft natural-light photograph: tactile fibres readable, warm highlights gentle, no glossy surfaces or hard metal dominating.',
        key_features:
          'scrubbed pale pine; layered wool and sheepskin; many small warm light points; cool blue window dusk; rounded low furniture',
      }),
      avoid: [...AVOID, 'cold industrial mood', 'glossy plastic', 'harsh overhead light'],
      dropAvoid: INTERIOR_DROP,
      briefs: [
        "Scandinavian hygge herbalist's drying room: bundles of yarrow and mint hanging from whitewashed rafters, an adult herbalist in a felted wool apron tying twine at a scrubbed pine table, three candles and a small cast-iron stove glowing against blue northern dusk. No text or logo.",
        'Scandinavian hygge mudroom of a dog-sled musher: sheepskin-lined bench, wool mittens drying over a small woodstove, two huskies curled on a rag rug, snow-blue light through a deep-set window against warm lantern glow. No text or logo.',
        'Scandinavian hygge bakehouse at five in the morning: cardamom buns cooling on linen over a birch table, an adult baker with flour on her forearms opening a small wood-fired oven, warm orange light meeting cold dark window. No text or logo.',
      ],
    },
    'SP07-005': {
      dna: interior({
        aesthetic:
          'Bohemian eclectic interior: collected layers of kilims, woven rattan and macramé, carved wood, pottery and hanging plants, gathered over years rather than bought as a set.',
        color_and_tone:
          'Terracotta, ochre and rust grounded by indigo, turquoise and deep plum; many patterns kept in one warm family so the mix holds together.',
        lighting_and_shadow:
          'Warm low afternoon light filtered through patterned textiles, pierced-metal lanterns throwing dappled shadow, lots of mid-tone warmth.',
        texture_and_material:
          'Hand-knotted and flat-woven rugs stacked on each other, rattan and cane, block-printed cotton, glazed terracotta, trailing leaves, brass trays.',
        camera_and_composition:
          'Keep the requested view; layered foreground-to-background depth with a textile or plant edge cropping the frame, asymmetric groupings.',
        atmosphere_and_mood: 'Free, lived-in and warm, a traveller who never unpacked.',
        rendering_and_quality:
          'Warm editorial photograph: patterns legible but not flattened, depth kept readable, no junk-pile chaos.',
        key_features:
          'stacked flat-woven rugs; rattan and macramé; terracotta with indigo and turquoise; pierced-lantern dappled light; collected asymmetric layers',
      }),
      avoid: [...AVOID, 'sterile minimalism', 'junk pile chaos', 'matching furniture set'],
      dropAvoid: INTERIOR_DROP,
      briefs: [
        'Bohemian eclectic workshop of a travelling puppeteer: carved wooden marionettes hanging from a rafter, an adult puppeteer restringing one on a stack of kilims, pierced brass lantern throwing star-shaped dapples over terracotta walls and indigo cushions. No text or logo.',
        'Bohemian eclectic attic bedroom of an adult astrologer: a brass orrery on a rattan side table, macramé hanging over a low mattress heaped with block-printed quilts, trailing pothos under a round skylight, turquoise and rust patterns. No text or logo.',
        'Bohemian eclectic caravan interior seen through its open back door: a tiny wood stove, stacked rugs on a curved built-in bench, strings of dried chillies, low evening light filtering through a patterned curtain. No text or logo.',
      ],
    },
    'SP07-008': {
      dna: interior({
        aesthetic:
          'Japanese Zen interior built on the tatami module: sliding shoji and fusuma panels, an alcove for one object, exposed post-and-beam in unpainted hinoki or cedar.',
        color_and_tone:
          'Straw-green tatami, pale unfinished wood, warm paper white, earth-brown clay walls, charcoal accents; very little saturated color.',
        lighting_and_shadow:
          'Daylight diffused through washi paper shoji, low and even, deep soft shadow under the eaves and in the alcove; low seated eye level.',
        texture_and_material:
          'Woven rush tatami with cloth-bound edges, planed hinoki grain, clay-plastered walls with straw fibre, washi paper lattice, black iron kettle.',
        camera_and_composition:
          'Keep the requested view; low seated camera height, frontal view of sliding panels and the tatami grid, one object carrying the whole room.',
        atmosphere_and_mood: 'Still, attentive and spare, with space left for silence.',
        rendering_and_quality:
          'Soft photograph with very gentle contrast; straight lattice lines, readable rush weave and wood grain, no clutter or plastic.',
        key_features:
          'tatami module floor; washi paper shoji light; unpainted hinoki post and beam; clay-plaster walls; single-object alcove',
      }),
      avoid: [...AVOID, 'clutter', 'plastic', 'lanterns everywhere', 'dragon decor'],
      dropAvoid: INTERIOR_DROP,
      briefs: [
        "Japanese Zen sword-polisher's workroom: an adult polisher kneeling on tatami at a low hinoki stand, drawing a long blade across a whetstone, washi shoji light grazing the steel, a single iris in the clay-walled alcove. Low seated camera. No text or logo.",
        'Japanese Zen bath room: a square hinoki soaking tub steaming beside an open shoji that frames a snowy pine, clay walls, slatted cedar floor, soft even paper light. No text or logo.',
        'Japanese Zen moon-viewing room at night: fusuma panels slid open onto a veranda, a full moon behind thin cloud, one low lacquer tray with rice cakes on the tatami, charcoal shadows in the room. No text or logo.',
      ],
    },
    'SP07-011': {
      dna: interior({
        aesthetic:
          'Luxury penthouse interior: book-matched marble slabs, satin brass inlays, full-height glazing and custom millwork, everything built in and seamlessly joined.',
        color_and_tone:
          'Warm ivory, Calacatta white with gold-grey veining, smoked bronze and taupe; satin brass as the single metallic; muted, rich, medium contrast.',
        lighting_and_shadow:
          'Layered hospitality lighting: dimmed cove light, pin spots on stone and art, warm under-cabinet strips, night sky or dusk through glass kept dark.',
        texture_and_material:
          'Mirror-matched marble with continuous veining, satin brushed brass, smoked glass, silk-wool rugs, lacquered or fluted walnut panels.',
        camera_and_composition:
          'Keep the requested view; wide lens held level, veining and brass lines symmetrical where possible, reflections controlled.',
        atmosphere_and_mood: 'Hushed, expensive and composed, with calm at great height.',
        rendering_and_quality:
          'High-end architectural photograph: clean reflections, continuous vein matching, no gaudy gold overload or skyline postcard.',
        key_features:
          'book-matched marble veining; satin brass inlay; layered cove and pin-spot light; smoked glass; built-in custom millwork',
      }),
      avoid: [...AVOID, 'gaudy gold overload', 'skyline postcard', 'cheap veneer'],
      dropAvoid: INTERIOR_DROP,
      briefs: [
        'Luxury penthouse treasure vault of a dragon: a sleek green dragon coiled on a mound of gold coins inside a room of book-matched Calacatta marble, satin brass inlay lines, pin spots on the hoard, smoked glass wall showing a dark night. No text or logo.',
        'Luxury penthouse wine cellar: bottles racked in backlit smoked-glass walls, a single slab of book-matched black marble as the tasting table, fluted walnut doors, an adult sommelier decanting under one brass pin spot, level symmetrical wide view. No readable labels, text or logo.',
        'Luxury penthouse chess room at midnight: two adult players in evening dress facing each other over a marble-inlaid board, brass pin spot overhead, smoked bronze glass reflecting the scene. No text or logo.',
      ],
    },
    'SP07-012': {
      dna: interior({
        aesthetic:
          'Rustic cabin interior: saddle-notched round logs or hand-hewn beams with adze marks, a fieldstone hearth, and plank furniture made on site.',
        color_and_tone:
          'Honey and smoke-darkened timber, grey-brown fieldstone, charcoal iron, wool reds and forest greens; firelight amber against cool blue window light.',
        lighting_and_shadow:
          'Firelight and oil lamps as key light, warm and low, deep shadow in the roof; small windows admit cool daylight.',
        texture_and_material:
          'Chinked log walls, adze-scarred beams, dry-laid or mortared river stone, forged iron hooks and hinges, wool blankets, wide rough floorboards.',
        camera_and_composition:
          'Keep the requested view; show log coursing or beam rhythm, a lived-in foreground, the hearth or window as the light anchor.',
        atmosphere_and_mood: 'Rough, warm and self-reliant, a shelter far from everything.',
        rendering_and_quality:
          'Low-light photograph with visible timber grain and stone joints, soft firelit falloff, no synthetic finish or taxidermy props.',
        key_features:
          'saddle-notched chinked logs; adze-marked beams; fieldstone hearth; forged iron hardware; firelight against cool window light',
      }),
      avoid: [
        ...AVOID,
        'synthetic materials',
        'taxidermy',
        'plaid blanket pile as the only subject',
      ],
      dropAvoid: INTERIOR_DROP,
      briefs: [
        "Rustic cabin potion-brewer's kitchen: a black iron cauldron hanging in a fieldstone hearth, jars of dried roots on adze-marked shelves, an adult brewer in a wool shawl stirring, firelight the only warm source against a blue-grey window. No text or logo.",
        'Rustic cabin mountain rescue hut in a blizzard: a row of wooden bunks along chinked log walls, snow-crusted rope coils hanging from forged hooks, an oil lamp on a plank table, a frost-rimmed small window. No text or logo.',
        "Rustic cabin boat-builder's shed: a half-planked wooden canoe on trestles, curled cedar shavings on rough floorboards, hand tools on iron pegs, cool light from the open doorway meeting the glow of a stove. No text or logo.",
      ],
    },
    'SP07-013': {
      dna: interior({
        aesthetic:
          'Mediterranean villa interior: thick lime-rendered masonry walls, rounded arches and deep window reveals, terracotta floors and handmade glazed tile, wrought iron.',
        color_and_tone:
          'Sun-warm lime white, terracotta, ochre and olive, with cobalt or majolica tile accents; bright but softened by bounce off the walls.',
        lighting_and_shadow:
          'Strong sun through small deep openings and louvered shutters, slatted light bars on the floor, cool shaded interiors with warm reflected bounce.',
        texture_and_material:
          'Hand-applied lime plaster with soft undulation, worn terracotta tiles, glazed hand-painted tile, chestnut beams and cane ceilings, matte wrought iron.',
        camera_and_composition:
          'Keep the requested view; frame through an arch or deep reveal, bright opening against cool shade, thick wall depth visible.',
        atmosphere_and_mood: 'Unhurried, sunlit and cool within, a thick-walled refuge from heat.',
        rendering_and_quality:
          'Natural-light photograph with softly rounded plaster edges and honest wear, no postcard resort styling.',
        key_features:
          'thick lime-rendered walls; rounded arches and deep reveals; worn terracotta floor; majolica tile accent; slatted shutter light',
      }),
      avoid: [
        ...AVOID,
        'overcast gloom',
        'cold industrial grey',
        'pool resort scene',
        'postcard villa view',
      ],
      dropAvoid: INTERIOR_DROP,
      briefs: [
        "Mediterranean villa perfumer's distillery: a copper still venting over rows of bitter orange blossom on cane trays, an adult perfumer sniffing a glass vial in a lime-white arched room, shutter light bars across terracotta. No text or logo.",
        'Mediterranean villa monastery refectory: a long chestnut table under a cane ceiling, adult monks in undyed habits eating in silence, one deep window reveal pouring hard sun across majolica-tiled wall, cool shade everywhere else. No text or logo.',
        'Mediterranean villa olive-press room viewed through a rounded arch: a stone millwheel and stacked woven press mats, glossy oil in terracotta jars, thick lime walls glowing with warm reflected light. No text or logo.',
      ],
    },
    'SP07-014': {
      dna: interior({
        aesthetic:
          'Cyberpunk apartment: a cramped high-rise unit retrofitted by its tenant, with salvaged panels, surface-run cable bundles, stacked hardware and colored light from signs outside.',
        color_and_tone:
          'Near-black and gunmetal base with magenta and cyan neon spill from outside, amber CRT or LED pockets inside; saturated color only in light, not surfaces.',
        lighting_and_shadow:
          'Night; neon from the window as the strongest source, tinted rim light on edges, small warm practicals, deep crushed corners.',
        texture_and_material:
          'Scratched powder-coated metal, zip-tied cable looms, water-stained ceiling tiles, reclaimed plastic panels, condensation on glass.',
        camera_and_composition:
          'Keep the requested view; tight wide-angle framing that makes the room feel small, layers of cable and hardware framing the subject.',
        atmosphere_and_mood: 'Cramped, electric and lonely under a city that never sleeps.',
        rendering_and_quality:
          'Cinematic low-light photograph: coloured light kept clean, grime specific, no readable screens or signs.',
        key_features:
          'surface-run cable bundles; salvaged metal panels; magenta and cyan neon spill; amber small practicals; cramped wide-angle frame',
      }),
      avoid: [...AVOID, 'clean organized room', 'gamer desk', 'monitor wall', 'readable screens'],
      dropAvoid: INTERIOR_DROP,
      briefs: [
        "Cyberpunk apartment back-room clinic: an adult street surgeon fitting a chrome forearm onto a patient on a dentist's chair, cable bundles zip-tied along the ceiling, magenta neon from the window, an amber lamp over the tray of tools. No readable screens, text or logo.",
        'Cyberpunk apartment noodle kitchen in a capsule unit: a steaming pot on a single induction ring, salvaged panel walls, cyan sign light slicing through condensation on the window, an adult cook in a hoodie eating standing up. No readable signs, text or logo.',
        "Cyberpunk apartment tattoo booth: an adult tattooist inking glowing circuitry lines onto a client's shoulder blade, cable looms sagging from the ceiling, a rain-streaked window glowing magenta and cyan, one amber lamp on the needle. No readable signs, text or logo.",
      ],
    },
    'SP07-015': {
      dna: interior({
        aesthetic:
          'Victorian mansion interior: heavy carved mahogany and walnut, dado and picture rails, patterned wallpaper, brocade and velvet layered at high density.',
        color_and_tone:
          'Oxblood, bottle green, plum and deep gold with dark wood; low-key overall, gaslight amber highlights, little clear white.',
        lighting_and_shadow:
          'Gaslight and oil lamps with etched glass shades, heavy curtains holding back daylight, warm pools and deep corners.',
        texture_and_material:
          'Carved hardwood with French polish, flocked or damask wallpaper, velvet and brocade with fringes, encaustic floor tile, aged brass fittings.',
        camera_and_composition:
          'Keep the requested view; dense layered framing from doorway or rail, pattern on every plane, one lamp or window as the light anchor.',
        atmosphere_and_mood: 'Stifling, opulent and secretive behind drawn drapery.',
        rendering_and_quality:
          'Warm low-light photograph with legible pattern and carving, controlled shadow, no ghost-story props unless requested.',
        key_features:
          'carved mahogany with French polish; damask wallpaper; velvet and brocade layers; gaslight amber pools; encaustic tile floor',
      }),
      avoid: [...AVOID, 'bright open plan', 'minimal decor', 'ghost story props'],
      dropAvoid: INTERIOR_DROP,
      briefs: [
        'Victorian mansion séance parlor: six adults in dark silk seated around a round mahogany table holding hands, a single gas lamp turned low, damask walls and a velvet-draped bay window swallowing the light. No text or logo.',
        "Victorian mansion naturalist's cabinet: glass-fronted mahogany cases of pinned beetles and mineral specimens, an adult naturalist with a brass magnifier at a green baize desk, gaslight warm, patterned wallpaper rising into darkness. No text or logo.",
        'Victorian mansion music room: a gilded concert harp beside a fringed velvet chaise, an encaustic tile floor, heavy brocade curtains parted a hand width to let one blade of daylight across the strings. No text or logo.',
      ],
    },
    'SP07-016': {
      dna: interior({
        aesthetic:
          'Bauhaus interior: functional workshop modernism with chrome tubular steel, flat white walls, glass, and furniture reduced to structure, circles and rectangles.',
        color_and_tone:
          'White, grey and black planes with small primary accents in red, yellow or blue, applied to one wall, cushion or door only.',
        lighting_and_shadow:
          'Even daylight through large steel windows, industrial glass or opal globe lamps, crisp shadows of tubular frames on white floors.',
        texture_and_material:
          'Chrome-plated tubular steel, stretched canvas or woven cane seats, linoleum floors, painted steel window frames, plate glass, hand-woven wall hangings.',
        camera_and_composition:
          'Keep the requested view; orthogonal framing, planes read as flat colored rectangles, clear negative space between objects.',
        atmosphere_and_mood: 'Rational, bright and purposeful, a room designed like a tool.',
        rendering_and_quality:
          'Crisp period-inspired photograph: clean edges, strong geometry, no ornament and no replica of a named designer chair.',
        key_features:
          'chrome tubular steel; white planes with one primary accent; linoleum floor; steel window grid; orthogonal composition',
      }),
      avoid: [...AVOID, 'ornament', 'clutter', 'classroom poster'],
      dropAvoid: INTERIOR_DROP,
      briefs: [
        'Bauhaus interior weaving workshop: three wooden looms in a white room with a steel window wall, an adult weaver working a geometric red and blue wall hanging, tubular steel stools, crisp shadows on grey linoleum. No text or logo.',
        'Bauhaus interior barbershop: a single chrome tubular barber chair on black linoleum, round mirror, one yellow wall, an adult barber shaving a customer with a straight razor under opal globe lights. No text or logo.',
        'Bauhaus interior ballet rehearsal studio seen from above: an adult dancer in black leotard mid-leap across a white floor, a red circle painted on the far wall, steel barres, window light casting rectangles. No text or logo.',
      ],
    },
    'SP07-017': {
      dna: interior({
        aesthetic:
          'Maximalist decor: more is more, with pattern on pattern, gallery-hung frames floor to ceiling, jewel-tone velvet, gilded trim and collected objects on every surface.',
        color_and_tone:
          'Saturated jewel tones — emerald, sapphire, ruby, saffron — on dark lacquered walls, with gold as the binding accent; high saturation, medium-low key.',
        lighting_and_shadow:
          'Many warm lamps with fabric shades, picture lights over frames, glints on gilt and lacquer; no single dominant source.',
        texture_and_material:
          'Cut velvet, chinoiserie or botanical wallpaper, high-gloss lacquered walls, animal-print and ikat textiles, gilded frames, glazed ceramics.',
        camera_and_composition:
          'Keep the requested view; dense frontal framing with a gallery wall behind, pattern layers from foreground to back.',
        atmosphere_and_mood: 'Theatrical, indulgent and joyful, a room that performs.',
        rendering_and_quality:
          'Rich editorial photograph: every pattern crisp, colors saturated but controlled, no messy clutter pile.',
        key_features:
          'pattern on pattern; floor-to-ceiling gallery wall; jewel-tone velvet; high-gloss lacquered walls; gilded trim',
      }),
      avoid: [...AVOID, 'empty white walls', 'minimalism', 'messy junk pile'],
      dropAvoid: INTERIOR_DROP,
      briefs: [
        "Maximalist decor jeweller's salon: an adult jeweller in a saffron waistcoat laying rubies on black velvet, emerald lacquered walls hung frame-to-frame with botanical prints, gilded mirrors, leopard velvet chairs, picture lights glinting. No text or logo.",
        'Maximalist decor dressing room of a vampire countess: an adult woman in a ruby gown before a gilded triple mirror that shows no reflection, sapphire velvet walls, ikat cushions, perfume bottles crowding every shelf. No text or logo.',
        'Maximalist decor aviary room: parrots and macaws perched on gilded frames of a floor-to-ceiling gallery wall, chinoiserie wallpaper of painted birds behind them, a jungle of potted palms on a patterned rug. No text or logo.',
      ],
    },
    'SP07-018': {
      dna: interior({
        aesthetic:
          'Farmhouse chic interior: painted shiplap and board-and-batten walls, reclaimed barn beams, sliding barn doors on black strap rails, and practical country furniture freshened with white.',
        color_and_tone:
          'Warm white and cream walls, weathered grey-brown barn wood, black iron, galvanized steel, sage and soft blue accents; bright and airy.',
        lighting_and_shadow:
          'Bright soft daylight from multi-pane windows, black iron pendants, clean shadows along horizontal shiplap lines.',
        texture_and_material:
          'Tongue-and-groove shiplap, reclaimed beams with nail holes, galvanized buckets and tubs, black strap hinges, washed linen, butcher-block tops.',
        camera_and_composition:
          'Keep the requested view; horizontal shiplap lines leading the eye, one exposed beam across the top of the frame.',
        atmosphere_and_mood: 'Fresh, practical and welcoming, country work made pretty.',
        rendering_and_quality:
          'Bright lifestyle photograph with honest wood grain and iron texture, no TV-show farmhouse sign clichés.',
        key_features:
          'painted shiplap walls; reclaimed barn beams; sliding barn door on black rail; galvanized steel; washed linen',
      }),
      avoid: [
        ...AVOID,
        'chrome',
        'glossy lacquer',
        'farmhouse word signs',
        'flower bucket centerpiece',
      ],
      dropAvoid: INTERIOR_DROP,
      briefs: [
        'Farmhouse chic cheese-making room: rounds of cheese ripening on pine shelves along a white shiplap wall, an adult cheesemaker in a linen apron cutting curd in a galvanized vat, a sliding barn door open to morning light. No text or logo.',
        'Farmhouse chic cider-press room in autumn: a wooden rack-and-cloth press dripping into a galvanized tub, crates of red apples, reclaimed beams overhead, soft window light across board-and-batten walls. No text or logo.',
        'Farmhouse chic sewing room: a treadle sewing machine at a white-painted window, bolts of washed linen and gingham on open shelves, an adult quilter pinning a half-finished quilt on the butcher-block table. No text or logo.',
      ],
    },
    'SP07-019': {
      dna: interior({
        aesthetic:
          'Art Nouveau interior: whiplash curves grow through structure and ornament alike, with carved wood, bent wrought iron, stained and opalescent glass, and mosaic.',
        color_and_tone:
          'Olive, sage, amber, peacock teal and violet, with gold-bronze metal; soft stained-glass colour washing across cream plaster.',
        lighting_and_shadow:
          'Daylight through stained or opalescent glass casting coloured patches, tulip and lily-shaped glass lamps, soft curving shadows.',
        texture_and_material:
          'Carved pear or walnut with flowing organic mouldings, wrought iron vine balustrades, iridescent art glass, glass-tile mosaic, patinated bronze.',
        camera_and_composition:
          'Keep the requested view; let a curve lead the eye — a stair rail, arch or window mullion — and avoid rigid rectilinear framing.',
        atmosphere_and_mood: 'Sensuous, organic and elegant, a room that seems to grow.',
        rendering_and_quality:
          'Warm natural-light photograph with coloured glass light clean, curves continuous, ornament crisp but soft.',
        key_features:
          'whiplash curve ornament; wrought iron vine balustrade; iridescent stained glass; carved organic mouldings; glass mosaic',
      }),
      avoid: [...AVOID, 'rigid rectilinear grid', 'required flower bouquet', 'poster lettering'],
      dropAvoid: INTERIOR_DROP,
      briefs: [
        'Art Nouveau absinthe bar at night: a curving carved-wood counter with a pale green glass fountain dripping water over sugar, tulip lamps glowing amber, peacock-teal mosaic behind, an adult bartender reflected in a whiplash-framed mirror. No text or logo.',
        "Art Nouveau butterfly collector's study: specimen cases in carved pear-wood frames shaped like wings, an adult collector at a desk whose legs curl like vines, a stained-glass window casting violet and amber patches on the floor. No text or logo.",
        "Art Nouveau chocolatier's shop: curved glass vitrines on carved pear-wood bases holding rows of pralines, wrought iron vine brackets, an opalescent glass skylight washing amber and teal over an adult chocolatier tempering chocolate on marble. No text or logo.",
      ],
    },
    'SP07-020': {
      dna: interior({
        aesthetic:
          'Memphis design interior: playful anti-functional postmodern furniture built from clashing geometric volumes, laminate, terrazzo and bold squiggle patterns.',
        color_and_tone:
          'Pastel pink, mint, butter yellow and lilac clashing with primary red, cobalt and black-and-white graphic patterns; flat, high-key color.',
        lighting_and_shadow:
          'Bright even studio-like light with hard small shadows under blocky furniture, no moody falloff.',
        texture_and_material:
          'Glossy plastic laminate, speckled terrazzo, squiggle and confetti-printed surfaces, lacquered MDF volumes, chrome ball feet.',
        camera_and_composition:
          'Keep the requested view; frontal flat framing like a stage set, objects stacked as colored blocks, asymmetrical balance.',
        atmosphere_and_mood: 'Cheeky, loud and irreverent, good taste deliberately broken.',
        rendering_and_quality:
          'Clean bright photograph with saturated flat color and crisp pattern edges, no grime or beige.',
        key_features:
          'clashing geometric furniture volumes; squiggle and confetti patterns; plastic laminate; speckled terrazzo; pastel versus primary color clash',
      }),
      avoid: [...AVOID, 'beige neutrals', 'wood grain dominance', 'moody low light'],
      dropAvoid: INTERIOR_DROP,
      briefs: [
        "Memphis design dentist's office: a mint dental chair beside a cobalt cylinder-and-cone equipment tower, black-and-white squiggle floor, pink terrazzo counter, an adult dentist in a yellow coat holding a mirror. Frontal stage-set view. No text or logo.",
        'Memphis design laundromat: rows of washing machines clad in pink and mint laminate, a black-and-white confetti floor, a red zigzag bench, an adult reading on a cobalt cube while clothes spin. No readable text or logo.',
        'Memphis design gelato parlor: a yellow counter shaped like stacked triangles and a cylinder, pastel tubs of gelato, speckled terrazzo floor, chrome ball-footed stools, an adult server scooping lilac sorbet. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Shaker Peg-Rail Interior',
      domain: 'Shaker plain-style interior',
      tags: ['shaker', 'plain-style', 'joinery'],
      dna: interior({
        aesthetic:
          'Shaker plain-style interior: whitewashed plaster, a continuous wooden peg rail at head height, built-in drawer walls and ladder-back furniture hung up out of the way.',
        color_and_tone:
          'Plaster white and scrubbed pine with milk-paint accents in barn red, mustard, blue-green or deep teal; muted, clear, calm.',
        lighting_and_shadow:
          'Plain daylight from evenly spaced double-hung windows, soft side shadow, chairs hanging from the rail casting clean silhouettes.',
        texture_and_material:
          'Turned maple pegs, flat-panel cherry or pine casework with small turned knobs, woven tape chair seats, oval bentwood boxes with swallowtail laps.',
        camera_and_composition:
          'Keep the requested view; frontal and symmetrical, the peg rail running across the frame as a horizon line, floor kept clear.',
        atmosphere_and_mood: 'Orderly, honest and serene, every object earning its place.',
        rendering_and_quality:
          'Quiet daylight photograph, crisp joinery, matte milk-paint finish, no decorative clutter or ornament.',
        key_features:
          'continuous peg rail with hung chairs; built-in drawer walls; milk-paint accent colors; oval bentwood boxes; ladder-back chairs with woven tape',
      }),
      avoid: [...AVOID, 'ornament', 'carved decoration', 'clutter', 'glossy varnish'],
      briefs: [
        "Shaker peg-rail interior of a broom-maker's workshop: finished brooms and ladder-back chairs hanging from a continuous peg rail, an adult broom-maker stitching broomcorn at a pine bench, plain window light, floor swept bare. No text or logo.",
        'Shaker peg-rail infirmary: four narrow beds with white linen in a whitewashed room, a wall of built-in cherry drawers, a stack of oval bentwood boxes, an adult nurse in a plain cap measuring herbs, symmetrical frontal view. No text or logo.',
        'Shaker peg-rail meeting-room dining hall: long plain trestle tables and backless benches set in precise rows, blue-green milk-painted woodwork, adult diners in plain dress eating in silence under evenly spaced windows. No text or logo.',
      ],
    },
    {
      name: 'Wabi-Sabi Earthen Interior',
      domain: 'wabi-sabi imperfection interior',
      tags: ['wabi-sabi', 'earthen', 'imperfection'],
      dna: interior({
        aesthetic:
          'Wabi-sabi interior: rough earthen plaster, patched and repaired surfaces, weathered timber and unmatched handmade ceramics, beauty found in wear and asymmetry.',
        color_and_tone:
          'Mud brown, ash grey, rust, lichen green and undyed flax; low saturation, soft dark values, nothing bright or new.',
        lighting_and_shadow:
          'Single low side light from a small opening, deep soft darkness, surfaces read by raking light across their unevenness.',
        texture_and_material:
          'Hand-smeared clay plaster with straw and cracks, charred or silver-weathered wood, gold-seamed repaired pottery, rough hemp and linen, stone worn smooth.',
        camera_and_composition:
          'Keep the requested view; off-centre composition, one imperfect object close in the raking light, large dark areas left empty.',
        atmosphere_and_mood: 'Humble, melancholic and tender, time visible on every surface.',
        rendering_and_quality:
          'Soft photograph in low light with fine texture detail and gentle grain, no gloss, polish or symmetry.',
        key_features:
          'cracked clay plaster with straw; gold-seamed repaired ceramics; silver-weathered timber; single raking side light; off-centre asymmetry',
      }),
      avoid: [
        ...AVOID,
        'glossy new finishes',
        'perfect symmetry',
        'bright saturated color',
        'tatami module layout',
      ],
      briefs: [
        'Wabi-sabi earthen interior of a repair workshop: an adult craftsman seaming a broken tea bowl with gold lacquer at a scarred wooden bench, a single raking light from a small window across cracked clay walls, shards laid out on hemp cloth. No text or logo.',
        "Wabi-sabi earthen hermit's retreat in the mountains: a straw mat, a dented iron pot on a clay hearth, one withered branch in a lopsided vase, rain visible through a gap in weathered boards, most of the room in soft darkness. No text or logo.",
        "Wabi-sabi earthen charcoal-burner's hut: soot-silvered timber walls, sacks of charcoal against cracked mud plaster, an adult charcoal burner resting with a cup of tea, grey light seeping through a patched paper window. No text or logo.",
      ],
    },
    {
      name: 'Arts and Crafts Inglenook',
      domain: 'Arts and Crafts domestic interior',
      tags: ['arts-and-crafts', 'handcraft', 'oak'],
      dna: interior({
        aesthetic:
          'Arts and Crafts interior: quarter-sawn oak panelling and exposed joinery with pegged tenons, a built-in inglenook hearth, hammered copper and stylised plant-pattern textiles.',
        color_and_tone:
          'Fumed oak brown, sage green, madder red, ochre and hammered copper orange; warm, earthy and medium-dark.',
        lighting_and_shadow:
          'Leaded casement windows with small panes, firelight in the inglenook, mica or art-glass lamps, warm pools with soft falloff.',
        texture_and_material:
          'Ray-flecked quarter-sawn oak, through-tenons and wooden pegs, hand-hammered copper, block-printed wallpaper of vines and birds, handmade tiles around the hearth.',
        camera_and_composition:
          'Keep the requested view; low beamed ceilings, built-in settles and nooks framing the subject, joinery visible at eye level.',
        atmosphere_and_mood: "Honest, sheltering and handmade, a craftsman's pride in every joint.",
        rendering_and_quality:
          'Warm low-light photograph with oak ray flecks and hammer marks legible, no mass-produced gloss or Victorian clutter.',
        key_features:
          'quarter-sawn oak with ray fleck; exposed pegged through-tenons; built-in inglenook settle; hand-hammered copper; stylised vine-pattern textiles',
      }),
      avoid: [...AVOID, 'machine-made gloss', 'Victorian clutter', 'chrome'],
      briefs: [
        'Arts and Crafts inglenook where an adult knight in a travel-stained surcoat warms his hands at a hearth of handmade green tiles, built-in oak settles with pegged tenons on both sides, hammered copper hood glowing with firelight. No text or logo.',
        "Arts and Crafts bookbinder's bindery: an adult binder tooling a leather cover at an oak bench with through-tenons, finished blank volumes on oak shelves, leaded casement light, vine-pattern wallpaper. No readable titles, text or logo.",
        'Arts and Crafts bedchamber under low oak beams: a built-in box bed with carved pierced hearts, a block-printed bird-pattern coverlet in madder and sage, a mica lamp glowing, snow visible through small leaded panes. No text or logo.',
      ],
    },
    {
      name: 'Space-Age Fiberglass Interior',
      domain: 'space-age 1960s interior',
      tags: ['space-age', 'fiberglass', 'retro-futurist'],
      dna: interior({
        aesthetic:
          'Space-age interior of the late 1960s: molded white fiberglass shells, curved walls with rounded porthole openings, sunken conversation pits and wall-to-wall shag.',
        color_and_tone:
          'Glossy white shells with tangerine, hot orange, lime or purple upholstery and chrome; high-key, saturated accents on a white base.',
        lighting_and_shadow:
          'Glowing ceiling domes and recessed rings, globe lamps, soft wraparound shadow on curved surfaces, reflections sliding across gloss.',
        texture_and_material:
          'Seamless glossy fiberglass and ABS, deep shag carpet, stretch jersey upholstery, chrome and smoked acrylic, rounded vinyl padding.',
        camera_and_composition:
          'Keep the requested view; wide lens emphasising curvature, rounded openings framing depth, a sunken level in the foreground.',
        atmosphere_and_mood: 'Swinging, optimistic and futuristic, the future as imagined then.',
        rendering_and_quality:
          'Glossy period colour photograph with clean highlights on curved plastic, no pixel-age screens or modern hardware.',
        key_features:
          'molded white fiberglass shells; sunken conversation pit; tangerine shag carpet; porthole openings; glowing ceiling domes',
      }),
      avoid: [...AVOID, 'wood grain dominance', 'rectilinear boxes', 'modern flat screens'],
      briefs: [
        'Space-age fiberglass cocktail lounge: a sunken white conversation pit upholstered in tangerine jersey, adult guests in metallic evening wear holding coupes, a glowing ceiling dome, porthole windows framing a night sky. No text or logo.',
        'Space-age fiberglass observatory lounge on a mountain summit: curved white shell seats facing a round window onto the stars, lime shag carpet, a chrome telescope on a pedestal, globe lamps dimmed low. No text or logo.',
        'Space-age fiberglass hair salon: a row of egg-shaped white dryer hoods over purple vinyl seats, an adult stylist teasing a towering bouffant, rounded walls, chrome and smoked acrylic reflecting everything. No text or logo.',
      ],
    },
  ],
};

export default spec;
