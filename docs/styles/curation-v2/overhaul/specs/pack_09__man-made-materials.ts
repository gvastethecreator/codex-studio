import type { Spec } from '../tools/apply';
import { MATERIAL_AVOID, material } from './_material';

// Man-made materials: the finish, not the source product (rubber, not a tire; brick bond, not a
// whole wall). Assembly-profile materials keep their construction pattern.
const AVOID = [...MATERIAL_AVOID, 'replacing the target with the source product'];

const spec: Spec = {
  pack: 'pack_09',
  category: '2. Man-Made Materials',
  updates: {
    'SP09-017': {
      dna: material(
        'Brushed aluminum: satin metal with fine parallel brush lines and soft anisotropic highlights.',
        'the target is made of brushed aluminum with fine directional grain and machined edges.',
        'Cool silver-grey with soft white highlights.',
        'Strip light producing stretched anisotropic highlights.',
        'Satin aluminum with fine parallel brush lines and chamfered edges.',
        'Precise, modern, cool and engineered.',
        'brushed satin aluminum; parallel brush lines; anisotropic highlight; machined edges',
      ),
      avoid: AVOID,
      briefs: [
        "Photograph of a knight's full armor made of brushed aluminum with machined chamfers standing in a stone hall. No text or logo.",
        'Photograph of a brushed-aluminum dragon skull on a dark plinth. No text or logo.',
        'Photograph of a brushed-aluminum rocking horse in a white room. No text or logo.',
      ],
    },
    'SP09-019': {
      dna: material(
        'Gold leaf: thin beaten gold applied over the target with visible leaf seams, crackle and burnish.',
        'the target is gilded with gold leaf showing leaf seams, crackle and burnished highlights.',
        'Warm yellow gold with red bole showing through cracks.',
        'Warm raking light for burnish and leaf edges.',
        'Gold leaf squares with seams, crackle and burnish.',
        'Sacred, precious, opulent and still.',
        'gold leaf seams; crackle over red bole; burnished highlights',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a gilded wolf skull covered in cracked gold leaf on black velvet. No text or logo.',
        'Photograph of a rowboat entirely covered in gold leaf on a dark lake. No text or logo.',
        'Photograph of a gold-leafed bicycle leaning on a church wall. No text or logo.',
      ],
    },
    'SP09-020': {
      dna: material(
        'Copper patina: aged copper with verdigris green bloom over bronze-brown metal.',
        'the target is made of copper with verdigris patina in recesses and bright copper on worn edges.',
        'Verdigris green, teal and warm copper orange.',
        'Soft overcast light.',
        'Copper sheet with oxidized verdigris crust and worn bright edges.',
        'Aged, weathered, noble and calm.',
        'verdigris patina; bright worn copper edges; teal and orange',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a copper-patina knight statue with verdigris streaks in the rain. No text or logo.',
        'Photograph of a verdigris-coated grand piano in a greenhouse. No text or logo.',
        'Photograph of a copper-patina owl on a rooftop. No text or logo.',
      ],
    },
    'SP09-021': {
      dna: material(
        'Forged carbon fiber: marbled chopped-fiber composite under a glossy clear coat.',
        'the target is molded from forged carbon with marbled black-grey fiber pattern under gloss.',
        'Black and graphite marbling with glossy highlights.',
        'Hard studio light for clear-coat reflections.',
        'Forged carbon composite with marbled chopped fibers and clear coat.',
        'High-tech, sleek, strong and aggressive.',
        'marbled forged carbon; glossy clear coat; graphite and black',
      ),
      avoid: AVOID,
      briefs: [
        "Photograph of a forged-carbon knight's helmet on a dark plinth. No text or logo.",
        'Photograph of a forged-carbon violin. No text or logo.',
        'Photograph of a forged-carbon throne in a concrete room. No text or logo.',
      ],
    },
    'SP09-022': {
      dna: material(
        'Raw concrete: board-formed or cast concrete with tie holes, air voids and grey mineral texture.',
        'the target is cast in raw concrete with formwork marks and air voids.',
        'Cool grey concrete with darker water stains.',
        'Flat overcast light that reads texture.',
        'Cast concrete with board marks, tie holes and pits.',
        'Brutal, heavy, austere and monumental.',
        'board-formed concrete; tie holes; air voids; cool grey',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a raw concrete dragon cast with board-form marks lying in a field. No text or logo.',
        'Photograph of a concrete cathedral organ in a brutalist hall. No text or logo.',
        'Photograph of a raw concrete armchair by a window. No text or logo.',
      ],
    },
    'SP09-023': {
      dna: material(
        'Aged brick: fired clay bricks in a running or Flemish bond, with worn edges and lime mortar.',
        'the target is built from aged brick in a visible bond pattern with lime mortar joints.',
        'Red, rust, brown and soot-darkened brick with pale mortar.',
        'Warm late sun on the brick face.',
        'Fired clay bricks with chipped edges, efflorescence and mortar.',
        'Industrial, sturdy, historic and warm.',
        'aged brick bond; lime mortar joints; chipped edges; efflorescence',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a giant brick-built horse with mortar joints standing in a factory yard. No text or logo.',
        'Photograph of a brick throne in a ruined hall. No text or logo.',
        'Photograph of a brick-built rowboat on a canal. No text or logo.',
      ],
    },
    'SP09-024': {
      dna: material(
        'Wet asphalt: dark aggregate surface slick with water and mirror reflections.',
        'the target is coated in dark asphalt aggregate made glossy and reflective by water.',
        'Near-black with grey aggregate and reflected lights.',
        'Night light with reflections of lamps.',
        'Asphalt aggregate with wet sheen and puddle reflections.',
        'Urban, moody, nocturnal and slick.',
        'wet asphalt aggregate; mirror reflections; night sheen',
      ),
      avoid: AVOID,
      briefs: [
        "Photograph of a knight's statue coated in wet asphalt reflecting street lamps at night. No text or logo.",
        'Photograph of a wet-asphalt grand staircase glistening in rain. No text or logo.',
        'Photograph of a wolf sculpture of wet asphalt on a dark street. No text or logo.',
      ],
    },
    'SP09-026': {
      dna: material(
        'Injection-molded plastic: smooth toy-like plastic with slight gloss, parting lines and rounded edges.',
        'the target is molded from colored plastic with parting lines, sprue marks and rounded edges.',
        'Saturated primary or pastel plastic colors.',
        'Bright soft studio light.',
        'Smooth molded plastic with parting lines and slight gloss.',
        'Playful, toy-like, clean and artificial.',
        'molded plastic; parting lines; rounded edges; saturated color',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a life-size knight in armor made of red injection-molded plastic with visible parting lines. No text or logo.',
        'Photograph of a dragon made of glossy yellow plastic on a lawn. No text or logo.',
        'Photograph of a plastic cathedral door in pastel blue. No text or logo.',
      ],
    },
    'SP09-027': {
      dna: material(
        'Vulcanized rubber: matte black rubber with molded tread-like ridges and slight wear.',
        'the target is made of matte black rubber with molded ridges and scuffs, without becoming a tire.',
        'Matte black and charcoal grey.',
        'Soft light showing matte texture.',
        'Vulcanized rubber with molded ridges, scuffs and mold lines.',
        'Industrial, tough, flexible and heavy.',
        'matte vulcanized rubber; molded ridges; scuffs',
      ),
      avoid: [...AVOID, 'tire object'],
      briefs: [
        "Photograph of a knight's helmet molded from matte black rubber with ridges on a steel table. No text or logo.",
        'Photograph of a rubber horse sculpture in a warehouse. No text or logo.',
        'Photograph of a black rubber throne in a concrete room. No text or logo.',
      ],
    },
    'SP09-028': {
      dna: material(
        'Shattered glass: glass surfaces crazed with radial cracks and missing shards, held in place.',
        'the target is made of glass that is cracked in radial spiderweb patterns, still holding its shape.',
        'Clear glass with green edges and white fracture lines.',
        'Backlight catching the cracks.',
        'Glass with radial fractures, spiderweb cracks and chipped edges.',
        'Fragile, tense, dramatic and dangerous.',
        'radial spiderweb cracks; chipped glass edges; backlit fractures',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a glass knight statue crazed with radial cracks in a dark hall. No text or logo.',
        'Photograph of a cracked glass crown on a cushion. No text or logo.',
        'Photograph of a shattered-glass swan on a lake. No text or logo.',
      ],
    },
    'SP09-031': {
      dna: material(
        'Shiny latex: stretched glossy rubber film with sharp specular streaks.',
        'the target is skinned in glossy stretched latex with tight specular streaks.',
        'Black, red or colored latex with white highlights.',
        'Strip lights drawing highlights along curves.',
        'Glossy latex skin with stretch and tight reflections.',
        'Sleek, provocative, strange and polished.',
        'glossy latex skin; specular streaks; stretched surface',
      ),
      avoid: [...AVOID, 'explicit fetish content'],
      briefs: [
        'Photograph of a glossy red latex-skinned dragon on a black floor. No text or logo.',
        'Photograph of a latex-covered armchair in a white room. No text or logo.',
        'Photograph of a black latex knight statue. No text or logo.',
      ],
    },
    'SP09-032': {
      dna: material(
        'Cardboard: corrugated brown cardboard with exposed flutes, tape and crushed edges.',
        'the target is built from corrugated cardboard with exposed flutes, tape joints and creases.',
        'Kraft brown, beige and grey tape.',
        'Soft daylight.',
        'Corrugated cardboard with flutes, creases and packing tape.',
        'Handmade, playful, humble and improvised.',
        'corrugated cardboard; exposed flutes; tape joints; creases',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a full-size cardboard knight in armor with taped joints on a battlefield. No text or logo.',
        'Photograph of a cardboard dragon in a living room. No text or logo.',
        'Photograph of a cardboard cathedral in a garage. No text or logo.',
      ],
    },
    'SP09-042': {
      dna: material(
        'Bubble wrap: clear plastic sheet with rows of air cells wrapped over the target.',
        'the target is wrapped in or made of clear bubble wrap with visible air cells.',
        'Clear with bright highlights on each bubble.',
        'Bright light making bubbles glint.',
        'Bubble wrap with air cells, creases and tape.',
        'Playful, protective, absurd and light.',
        'bubble wrap cells; glinting highlights; wrapped folds',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a bubble-wrapped dragon statue in a museum storeroom. No text or logo.',
        'Photograph of a bubble-wrap throne in a white room. No text or logo.',
        'Photograph of a knight wrapped in bubble wrap. No text or logo.',
      ],
    },
    'SP09-046': {
      dna: material(
        'Sequins: overlapping sequins or paillettes covering the target and scattering light.',
        'the target is covered edge to edge in overlapping sequins.',
        'Gold, silver, ruby or iridescent sequins.',
        'Point lights producing sparkle.',
        'Overlapping sequins with individual reflections.',
        'Glamorous, festive, dazzling and loud.',
        'overlapping sequins; scattered sparkle; point-light glitter',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a sequin-covered dragon on a stage. No text or logo.',
        'Photograph of a gold-sequined throne in a dark hall. No text or logo.',
        'Photograph of a silver-sequined horse in a field. No text or logo.',
      ],
    },
    'SP09-048': {
      dna: material(
        'Cork: granulated cork board with speckled texture and soft pinholes.',
        'the target is made of granulated cork with speckled texture.',
        'Warm tan, brown and dark speckles.',
        'Soft warm light.',
        'Granular cork with pinholes and compressed grains.',
        'Warm, light, natural and homely.',
        'granulated cork; speckled texture; pinholes',
      ),
      avoid: AVOID,
      briefs: [
        "Photograph of a cork knight's helmet on a desk. No text or logo.",
        'Photograph of a cork-carved owl on a branch. No text or logo.',
        'Photograph of a cork armchair. No text or logo.',
      ],
    },
    'SP09-049': {
      dna: material(
        'Hook-and-loop fastener: dense nylon hooks and loops covering the target in fuzzy and bristly zones.',
        'the target is covered in hook-and-loop fabric panels, bristly hooks and fuzzy loops.',
        'Black, grey or bright nylon colors.',
        'Soft raking light for micro-texture.',
        'Nylon hooks and loops with fuzzy and bristly zones.',
        'Tactile, odd, practical and playful.',
        'hook-and-loop panels; bristly hooks; fuzzy loops',
      ),
      avoid: AVOID,
      briefs: [
        "Photograph of a knight's armor covered in black hook-and-loop panels. No text or logo.",
        'Photograph of a hook-and-loop covered cat statue. No text or logo.',
        'Photograph of a hook-and-loop throne in a white room. No text or logo.',
      ],
    },
    'SP09-060': {
      dna: material(
        'Liquid mercury: mirror liquid metal that pools, beads and ripples over the target.',
        'the target is made of liquid mirror metal that holds its form while rippling and beading.',
        'Chrome silver reflecting surroundings.',
        'Environment reflections and hard highlights.',
        'Liquid metal with ripples, beads and mirror reflection.',
        'Uncanny, fluid, futuristic and cold.',
        'liquid mirror metal; ripples and beads; environment reflections',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a liquid-mercury knight rising from a pool in a stone hall. No text or logo.',
        'Photograph of a mercury horse galloping on a beach. No text or logo.',
        'Photograph of a liquid-metal crown on a velvet cushion. No text or logo.',
      ],
    },
    'SP09-070': {
      dna: material(
        'Polystyrene foam: white expanded foam with visible beads, carved edges and crumbs.',
        'the target is carved from white expanded polystyrene with bead texture and hot-wire cuts.',
        'Bright white with soft grey shadows.',
        'Soft even light.',
        'Expanded foam beads, hot-wire cut faces and crumbs.',
        'Light, cheap, clean and temporary.',
        'white expanded foam; bead texture; hot-wire cuts',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a white polystyrene dragon on a film-set floor. No text or logo.',
        'Photograph of a foam knight statue with hot-wire cuts. No text or logo.',
        'Photograph of a polystyrene cathedral model. No text or logo.',
      ],
    },
    'SP09-071': {
      dna: material(
        'Plywood: laminated veneer sheets with visible ply edges and wood grain faces.',
        'the target is built from plywood sheets with exposed layered edges.',
        'Birch cream, tan and darker glue lines.',
        'Soft daylight.',
        'Plywood with layered edges, grain faces and screws.',
        'Constructive, modern, honest and handmade.',
        'plywood layered edges; birch faces; screw joints',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a plywood dragon with exposed layered edges in a workshop. No text or logo.',
        "Photograph of a plywood knight's armor. No text or logo.",
        'Photograph of a plywood throne in a gallery. No text or logo.',
      ],
    },
    'SP09-072': {
      dna: material(
        'Oriented strand board: pressed wood flakes in a chaotic mosaic of strands.',
        'the target is made of OSB with visible pressed wood strands.',
        'Golden tan and brown flakes.',
        'Flat light for the strand pattern.',
        'Pressed wood strands with resin and rough edges.',
        'Raw, industrial, rough and practical.',
        'pressed wood strands; OSB mosaic; rough edges',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of an OSB-board horse in a barn. No text or logo.',
        'Photograph of a knight statue built from OSB. No text or logo.',
        'Photograph of an OSB cathedral door. No text or logo.',
      ],
    },
    'SP09-073': {
      dna: material(
        'Linoleum: smooth resilient sheet with marbled color flecks and slight sheen.',
        'the target is surfaced with marbled linoleum with seams.',
        'Marbled beige, mint, rust or grey.',
        'Flat institutional light.',
        'Smooth linoleum with marbled flecks and seams.',
        'Institutional, retro, clean and quiet.',
        'marbled linoleum; seams; soft sheen',
      ),
      avoid: AVOID,
      briefs: [
        "Photograph of a knight's armor surfaced with mint marbled linoleum. No text or logo.",
        'Photograph of a linoleum-clad dragon statue in a school hallway. No text or logo.',
        'Photograph of a linoleum throne. No text or logo.',
      ],
    },
    'SP09-076': {
      dna: material(
        "Chain link: woven steel wire diamond mesh forming the target's surfaces.",
        'the target is formed from galvanized chain-link diamond mesh, keeping the woven pattern.',
        'Galvanized silver-grey.',
        'Backlight making the mesh graphic.',
        'Woven galvanized wire in diamond mesh.',
        'Urban, restrictive, industrial and hard.',
        'chain-link diamond mesh; galvanized wire; backlit pattern',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a dragon sculpture formed from chain-link mesh backlit at sunset. No text or logo.',
        'Photograph of a chain-link knight standing in a field. No text or logo.',
        'Photograph of a chain-link wedding dress on a mannequin. No text or logo.',
      ],
    },
    'SP09-077': {
      dna: material(
        "Barbed wire: twisted wire with barbs wound into the target's shape.",
        'the target is formed from coiled twisted barbed wire.',
        'Rusty grey and brown steel.',
        'Low hard light with thin shadows.',
        'Twisted steel wire with barbs and rust.',
        'Harsh, threatening, painful and stark.',
        'twisted barbed wire; barbs; rust',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a crown made of coiled barbed wire on a stone. No text or logo.',
        'Photograph of a barbed-wire horse sculpture on a hill. No text or logo.',
        'Photograph of a barbed-wire angel statue at dusk. No text or logo.',
      ],
    },
    'SP09-078': {
      dna: material(
        'Solar panel: photovoltaic cells with blue-black grid lines and glass surface.',
        'the target is surfaced with solar cells in a grid under glass.',
        'Deep blue-black cells with silver busbars.',
        'Sunlight reflecting on the glass.',
        'Photovoltaic cells, busbars and glass.',
        'Technological, clean, efficient and modern.',
        'solar cell grid; silver busbars; blue-black glass',
      ),
      avoid: AVOID,
      briefs: [
        'Photograph of a dragon whose wings are made of solar panels basking in sun. No text or logo.',
        "Photograph of a knight's armor surfaced with solar cells. No text or logo.",
        'Photograph of a solar-panel-clad chapel roof. No text or logo.',
      ],
    },
  },
};

export default spec;
