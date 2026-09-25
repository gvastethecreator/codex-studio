import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'fake brand logo',
  'readable labels',
  'generic stock-photo face',
  'celebrity likeness',
  'changing the supplied object design',
];

// Commercial presets keep the supplied object exactly and only change how it is sold to the eye.
const hero =
  "Keep the prompt's object or subject exactly — shape, proportions, color, materials and any supplied design — and present it as the hero of a commercial photograph.";
// Profiles also own the camera or backdrop; say so explicitly so it is never implied by other presets.
const profile = (what: string) =>
  `Keep the prompt's object exactly — shape, proportions, color and supplied design; this preset owns ${what}.`;

function ad(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? hero, ...rest } as Dna;
}

const PHOTO = [
  'illustration',
  'painting',
  'drawing',
  '3d render',
  'cartoon',
  'anime',
  'synthetic CGI',
  'plastic render',
  ...AVOID,
];

const spec: Spec = {
  pack: 'pack_01',
  category: '5. Commercial And Product',
  updates: {
    'SP01-049': {
      dna: ad({
        aesthetic:
          'Bright food photography: food styled for appetite and lit from one soft window side, shot at 45 degrees or straight down, as in a cookbook.',
        subject_treatment:
          'Keep the prompt subject; if it is food, style it fresh and at its best; if not, borrow food-styling light, surfaces and props around it without turning it into food.',
        color_and_tone:
          'Warm, fresh, saturated color; creamy whites, golden crusts, glossy greens; shadows soft and slightly warm.',
        lighting_and_shadow:
          'Large diffused side window, white bounce card opposite, gentle backlight for steam and gloss.',
        texture_and_material:
          'Crumb, crust, glaze, droplets and steam rendered crisp; linen, wood and stoneware props with real wear.',
        camera_and_composition:
          '45-degree or overhead angle, 50–100 mm, shallow focus falling off behind the hero bite, a few crumbs or herbs as scatter.',
        atmosphere_and_mood: 'Warm and inviting, the plate just set down and still steaming.',
        rendering_and_quality:
          'Cookbook polish with real texture; no plastic-looking food or oversaturated grade.',
        key_features:
          'soft side window with bounce; 45-degree or overhead angle; steam and glaze highlights; linen and stoneware props; shallow focus',
      }),
      avoid: [...AVOID, 'unappetizing', 'plastic food'],
      briefs: [
        'Bright cookbook food photograph at 45 degrees of a steaming venison pie with a braided golden crust on a pewter platter, one slice lifted to show the rich filling, soft window light from the left, linen and rosemary scatter. No text or logo.',
        'Bright food photograph of a slab of honeycomb dripping honey onto crumbly blue cheese on dark slate, backlight catching the dripping honey, shallow focus. No text or logo.',
        'Overhead cookbook photograph of a wooden bowl of blackberry porridge with a spiral of cream, scattered berries and a horn spoon on a rough linen cloth, soft even window light. No text or logo.',
      ],
    },
    'SP01-050': {
      dna: ad({
        aesthetic:
          'Studio product photography: one object isolated on a light grey sweep, lit with large softboxes to show its form, material and edges precisely.',
        color_and_tone:
          'Accurate neutral color, clean light grey background, true material colors.',
        lighting_and_shadow:
          'Large overhead softbox plus two strip lights for edge definition; soft contact shadow under the object.',
        texture_and_material:
          'Surface finish shown truthfully — brushed, polished, grained or stitched — without dust or scratches.',
        camera_and_composition:
          '90–120 mm, slight three-quarter angle, object centered with generous space, full depth of field.',
        atmosphere_and_mood:
          'Precise and desirable, an object presented with calm, clinical respect.',
        rendering_and_quality:
          'Commercial retouching with crisp edges and clean gradients; no CGI plastic look.',
        key_features:
          'grey sweep isolation; overhead softbox and strip-light edges; soft contact shadow; three-quarter angle; truthful finish',
      }),
      avoid: [...AVOID, 'dust', 'scratches', 'lifestyle clutter'],
      briefs: [
        'Studio product photograph of a single polished steel gauntlet on a light grey sweep, strip lights tracing every articulated finger plate, soft contact shadow, three-quarter angle. No text or logo.',
        'Studio product photograph of a brass hourglass filled with black sand, softbox reflections curving along the glass bulbs, clean grey sweep. No text or logo.',
        'Studio product photograph of a leather-bound brass compass with its lid open, the stitched leather and engraved rim crisp under softbox light, grey background. No readable markings or logo.',
      ],
    },
    'SP01-056': {
      dna: ad({
        aesthetic:
          'Modern architectural photography: buildings of concrete, glass and steel photographed with corrected verticals and hard sun sculpting planes.',
        subject_treatment:
          'Keep the prompt subject and setting; show built form as clean volumes and planes, with people only as small scale markers.',
        color_and_tone:
          'Cool neutral concrete, deep sky blue, black glass reflections, crisp whites.',
        lighting_and_shadow:
          'Hard direct sun raking across facades, shadow edges as graphic lines, reflections on glass.',
        texture_and_material:
          'Board-formed concrete grain, steel joints and glass reflections resolved precisely.',
        camera_and_composition:
          'Shift-lens perspective correction, perfectly vertical lines, symmetrical or strong diagonal composition, lots of sky or negative space.',
        atmosphere_and_mood: 'Imposing and calm, geometry and shadow doing all of the talking.',
        rendering_and_quality:
          'Architectural-magazine clarity; distinct from cosy cabins and from HDR listing photos.',
        key_features:
          'corrected verticals; hard sun on concrete planes; glass reflections; symmetrical geometry; tiny human scale',
      }),
      avoid: [...AVOID, 'converging verticals', 'rustic cabin', 'HDR halos'],
      briefs: [
        'Modern architectural photograph of a brutalist concrete monastery cantilevered from a sea cliff, hard sun cutting sharp shadow bands across its board-formed walls, corrected verticals, one tiny adult figure on a terrace. No text or logo.',
        'Modern architectural photograph of a glass-and-steel pavilion built inside the roofless nave of a ruined medieval abbey, the old stone arches reflected in its glass, symmetrical frame. No text or logo.',
        'Architectural photograph looking up a spiral concrete stair tower toward a round skylight, the helix of steps in hard light and shadow, perfect symmetry. No text or logo.',
      ],
    },
    'SP01-057': {
      dna: ad({
        aesthetic:
          'Interior design editorial: a room styled and photographed for a design magazine, balanced window and lamp light, every material chosen and placed.',
        subject_treatment:
          'Keep the prompt subject and setting; present the space as a styled interior with considered furniture, materials and objects, uncluttered.',
        color_and_tone:
          'Harmonious palette of two or three materials and one accent color; natural white balance.',
        lighting_and_shadow:
          'Daylight from windows balanced with warm practical lamps; soft shadows, no flash look.',
        texture_and_material:
          'Wood grain, linen, velvet, stone and brass rendered tactile and clean.',
        camera_and_composition:
          '24–35 mm at chest height, straight verticals, one-point or two-point view, a foreground object for depth.',
        atmosphere_and_mood: 'Welcoming and composed, a room that feels expensive yet lived in.',
        rendering_and_quality: 'Magazine-grade exposure blending; no fisheye stretch or HDR glow.',
        key_features:
          'styled editorial room; window plus lamp balance; tactile materials; straight verticals; foreground depth object',
      }),
      avoid: [...AVOID, 'clutter', 'fisheye stretch'],
      briefs: [
        "Interior design editorial photograph of a wizard's library styled for a design magazine: walnut shelves, a deep green velvet reading chair, a brass orrery on a side table, afternoon window light balanced with one warm lamp. No readable book spines or logo.",
        'Interior design photograph of a minimalist stone bathhouse with a sunken hammered-copper tub, a single window pouring soft light across honed limestone, eucalyptus in a clay vase. No text or logo.',
        'Interior design photograph of a medieval great hall restyled for a magazine: a long oak table set with pewter, iron chandeliers with lit candles, woven tapestry without figures, window light from one side. No text or logo.',
      ],
    },
    'SP01-062': {
      dna: ad({
        aesthetic:
          'Corporate stock photography: bright, safe, generic imagery with smiling people collaborating in clean spaces — the look, deliberately, of the stock library.',
        subject_treatment:
          'Keep the prompt subject and setting; stage people in friendly collaborative poses with broad smiles and tidy clothing, as stock photos do.',
        color_and_tone:
          'Bright high-key exposure, cool blue-white tint, clean whites, low contrast.',
        lighting_and_shadow:
          'Even soft institutional light from big windows or panels; almost no shadow.',
        texture_and_material:
          'Clean glass walls, white desks and potted plants; skin smoothed and clothes wrinkle-free.',
        camera_and_composition:
          'Eye level, 35–50 mm, a group arranged around one object they all look at, shallow background blur.',
        atmosphere_and_mood:
          'Relentlessly positive and bland, optimism that is a little too perfect to believe.',
        rendering_and_quality:
          'Glossy generic stock finish; no screens with readable UI and no real brands.',
        key_features:
          'bright blue-white high key; group around one object; broad smiles; glass office blur; sanitized sameness',
      }),
      avoid: [...AVOID, 'sad', 'dark', 'readable screen UI'],
      briefs: [
        'Corporate stock photograph of a guild of adult wizards in a bright glass meeting room, high-fiving over a glowing crystal ball on a white table, blue-white tint, broad smiles, potted plants blurred behind. No text or logo.',
        'Corporate stock photograph of two adult knights in polished armor shaking hands in a sunny glass lobby, a third adult knight nodding approvingly, soft even light. No text or logo.',
        'Corporate stock photograph of a smiling team of adult necromancers in tidy black robes leaning over an unrolled blank scroll on a white desk, pointing enthusiastically, high-key light. No text or logo.',
      ],
    },
    'SP01-063': {
      dna: ad({
        aesthetic:
          'Real estate HDR listing photography: an ultra-wide room shot with bracketed exposures blended until every corner and the view outside are equally bright.',
        subject_treatment:
          'Keep the prompt subject and setting; present the space empty or tidied for sale, as large and bright as possible.',
        color_and_tone:
          'Saturated even color, very bright whites, blue sky pulled into the windows, slight HDR haloing at window edges.',
        lighting_and_shadow:
          'Virtually no shadows; windows and interiors balanced to the same brightness, ceiling lights all on.',
        texture_and_material:
          'Crisp over-sharpened surfaces, mirror-glossy floors and flattened local contrast everywhere.',
        camera_and_composition:
          '14–18 mm ultra-wide from a corner at chest height, vertical lines corrected, room exaggerated in size.',
        atmosphere_and_mood:
          'Bright and hard-selling, cheerful emptiness that feels slightly unreal.',
        rendering_and_quality:
          'Listing-photo HDR look with its typical flat tonality; not architectural-magazine restraint.',
        key_features:
          'ultra-wide corner view; shadowless HDR blend; bright windows with blue sky; saturated even color; over-sharpened',
      }),
      avoid: [...AVOID, 'dark corners', 'moody shadows'],
      briefs: [
        'Real estate HDR listing photograph of the grand foyer of a gothic manor, double staircase, suits of armor and a chandelier, every dark corner blasted bright, ultra-wide from the corner, blue sky pulled into the tall windows. No text or logo.',
        'Real estate HDR listing photograph of a round castle tower bedroom with a canopy bed, arrow-slit windows glowing with blue sky, shadowless even light, glossy stone floor. No text or logo.',
        'Real estate HDR listing photograph of a vaulted dungeon converted into a wine cellar with a tasting table, all lights on, no shadows, stone vaults sharpened and saturated. No text or logo.',
      ],
    },
    'SP01-066': {
      dna: ad({
        aesthetic:
          'Automotive advertising photography: a vehicle sculpted by long strip reflections along its bodywork, or shown in a rolling shot with blurred wheels and background.',
        color_and_tone:
          'Deep glossy paint color, dark or dusk surroundings, clean specular whites.',
        lighting_and_shadow:
          'Huge overhead scrim or light-painted strips creating continuous reflections along every panel; rim light on the silhouette.',
        texture_and_material:
          'Mirror-like paint, chrome, glass and leather; reflections shaped deliberately.',
        camera_and_composition:
          'Low three-quarter front angle, 35–85 mm; for motion, a panned rolling shot with streaked background and spinning wheels.',
        atmosphere_and_mood: 'Powerful and sleek, weight and speed held in one glossy form.',
        rendering_and_quality:
          'High-end automotive retouch with controlled reflections; no badges, plates or readable text.',
        key_features:
          'strip reflections along bodywork; low three-quarter angle; rolling shot with blurred wheels; mirror paint; rim-lit silhouette',
      }),
      avoid: [...AVOID, 'license plate', 'badge', 'dull paint'],
      briefs: [
        'Automotive-style advertising photograph of a black lacquered royal carriage with gilded trim in a dark studio, long overhead strip lights reflecting in unbroken lines along its curved panels, low three-quarter angle, rim light on the wheels. No crest, text or logo.',
        'Automotive rolling-shot photograph of a matte black vintage roadster without badges crossing a salt flat at dusk, wheels blurred, background streaked, crisp body. No plates, text or logo.',
        'Automotive-style rolling shot of a two-horse racing chariot at full speed, the bronze chariot body pin-sharp with strip-light reflections, spoked wheels and the dusty track streaked by the pan. No text or logo.',
      ],
    },
    'SP01-071': {
      dna: ad({
        aesthetic:
          'Flat lay: objects arranged on a surface and photographed straight down at exactly 90 degrees with measured spacing.',
        subject_treatment: profile('the straight-down camera and the arranged layout'),
        color_and_tone: 'Coordinated palette of three or four colors, matte surface background.',
        lighting_and_shadow:
          'Soft overhead or window light with small, consistent soft shadows to one side.',
        texture_and_material:
          'Background surface (linen, slate, wood, paper) visible and even; objects crisp.',
        camera_and_composition:
          'Exactly top-down, no perspective, objects in a grid or radial arrangement with equal gaps and negative space.',
        atmosphere_and_mood: 'Orderly and satisfying, everything placed with patient intent.',
        rendering_and_quality: 'Crisp editorial flat lay; no tilted camera and no clutter pile.',
        key_features:
          'exact 90-degree overhead; measured spacing; coordinated palette; soft consistent shadows; negative space',
      }),
      avoid: [...AVOID, 'perspective', 'messy pile'],
      briefs: [
        "Flat lay photograph straight down of an adventurer's kit on undyed linen: a sheathed dagger, a folded blank map, a coin purse, flint and steel, a coil of rope and a small lantern, arranged in a neat grid with equal gaps. No text or logo.",
        "Flat lay photograph of an herbalist's ingredients on dark slate: dried roots, three kinds of mushrooms, a stone mortar and pestle and scattered violet petals, arranged radially, soft window light. No text or logo.",
        "Flat lay photograph of a scribe's kit on dark wool: goose quills, a stoppered ink pot, red wax seals, a penknife and a blank folded letter, measured spacing, top-down. No readable writing or logo.",
      ],
    },
    'SP01-082': {
      dna: ad({
        aesthetic:
          'Seamless catalog packshot: the object alone on a pure white or light grey infinity cove, lit for truth rather than drama.',
        subject_treatment: profile('the seamless backdrop and neutral catalog framing'),
        color_and_tone: 'Neutral whites, controlled light greys, accurate object color.',
        lighting_and_shadow:
          'Shadowless softbox sweep from above and both sides, with only a faint contact shadow.',
        texture_and_material: 'Clean, true surface detail; no dust and no styling props.',
        camera_and_composition:
          'Straight-on or slight three-quarter, object centered, corrected perspective.',
        atmosphere_and_mood:
          'Objective and frictionless, the object shown with nothing to distract from it.',
        rendering_and_quality:
          'Retail catalog precision with clean edges on a seamless background.',
        key_features:
          'infinity cove background; shadowless softbox sweep; faint contact shadow; centered object; corrected perspective',
      }),
      avoid: [...AVOID, 'dramatic shadow', 'lifestyle scene', 'props'],
      briefs: [
        'Seamless catalog packshot of a teardrop glass potion bottle of violet liquid with a wax-sealed cork on a white infinity cove, shadowless softbox light, faint contact shadow, straight-on. No label text or logo.',
        'Seamless catalog packshot of a hand-carved wooden chess king on a light grey cove, centered, crisp grain detail, even soft light. No text or logo.',
        'Seamless catalog packshot of a tall beeswax candle in a hand-forged iron holder on a white cove, faint contact shadow, neutral color. No text or logo.',
      ],
    },
    'SP01-083': {
      dna: ad({
        aesthetic:
          'Luxury macro gleam: extreme close-up jewelry-campaign photography where razor strip lights draw bright lines along polished edges against black.',
        color_and_tone:
          'Deep black ground, champagne and silver highlights, saturated jewel accents.',
        lighting_and_shadow:
          'Narrow strip softboxes and small spot kickers placed to create controlled sparkle and specular edge lines.',
        texture_and_material:
          'Polished metal, cut stones with internal fire, engraving and enamel resolved at macro scale.',
        camera_and_composition:
          '100 mm macro, very shallow focus on one facet or edge, sculptural crop that lets the object fill the frame.',
        atmosphere_and_mood: 'Precious and hushed, rarity shown in silence against the dark.',
        rendering_and_quality:
          'High-end jewelry retouch; clean blacks, no dust, no plastic sparkle overlay.',
        key_features:
          'black ground; razor strip-light edge lines; macro facet focus; jewel fire; controlled sparkle',
      }),
      avoid: [...AVOID, 'flat light', 'cheap plastic', 'overexposed'],
      briefs: [
        'Luxury macro photograph of a gold signet ring set with a deep ruby, razor strip lights drawing bright lines along the band, the ruby glowing with internal fire against pure black, shallow focus. No engraving text or logo.',
        'Luxury macro photograph of the enamelled lid of a pocket watch shaped like dragon scales, champagne highlights on each scale edge, black background. No numerals, text or logo.',
        'Luxury macro photograph of the jewelled point of a silver crown, sapphires and pearls in razor-sharp focus, strip-light reflections on the silver, the rest of the crown dissolving into black. No text or logo.',
      ],
    },
    'SP01-084': {
      dna: ad({
        aesthetic:
          'Cosmetic gloss still life: beauty-product advertising built on liquid highlights, creamy textures and translucent color.',
        color_and_tone:
          'Cream, blush, pearl and one translucent accent color; soft luminous whites.',
        lighting_and_shadow:
          'Very large soft source for creamy gradients, glossy kicker cards making ribbon highlights on curved surfaces.',
        texture_and_material:
          'Smears, swirls and drops of product with gel sheen, pearlescent shimmer or cream peaks; glassy packaging.',
        camera_and_composition:
          'Gentle macro, product plus a texture swatch or drop, clean surface with a soft reflection.',
        atmosphere_and_mood:
          'Sensorial and smooth, texture you want to touch presented with calm luxury.',
        rendering_and_quality:
          'Premium beauty campaign polish; no grit, harsh contrast or clutter.',
        key_features:
          'ribbon gloss highlights; product swirls and drops; pearl and blush palette; creamy gradients; soft reflection',
      }),
      avoid: [...AVOID, 'harsh contrast', 'gritty texture'],
      briefs: [
        'Cosmetic gloss still life of a moonstone jar of pearlescent night cream with a perfect swirl lifted by a silver spatula, a smear of the shimmering cream on pale glass, ribbon highlights on the jar. No label text or logo.',
        'Cosmetic gloss still life of a crystal vial of blood-red serum, one glossy drop falling from the dropper onto a mirror surface, blush background, creamy light. No text or logo.',
        'Cosmetic gloss still life of an obsidian compact of shimmering golden highlighter with a crushed corner of powder spilling onto cream satin. No text or logo.',
      ],
    },
    'SP01-085': {
      dna: ad({
        aesthetic:
          "Tech hardware hero: a launch-keynote product image with a dark graphite sweep and precise rim lights tracing the object's outline.",
        color_and_tone:
          'Graphite and black, cool white edge highlights, one small electric accent.',
        lighting_and_shadow:
          'Dark ambient with two or three thin rim lights and a faint top light; edges glow, faces stay dark.',
        texture_and_material:
          'Anodized, bead-blasted or machined surfaces, clean bevels and precise joints.',
        camera_and_composition:
          'Long lens compression, object floating or resting low in frame with deep dark negative space.',
        atmosphere_and_mood: 'Minimal and engineered, quiet confidence in precise machined form.',
        rendering_and_quality: 'Keynote-grade retouch; no cables, dust or warm clutter.',
        key_features:
          'dark graphite sweep; precise rim-light outline; machined surfaces; long-lens compression; deep negative space',
      }),
      avoid: [...AVOID, 'messy cables', 'dust', 'warm clutter', 'readable screen UI'],
      briefs: [
        'Tech-launch hero photograph of a black-steel repeating crossbow mechanism on a dark graphite sweep, thin cool rim lights tracing its limbs and gears, deep negative space above. No text or logo.',
        'Tech-launch hero photograph of a brass and blackened-steel mechanical prosthetic hand resting palm up, rim lights along each finger joint, a faint blue accent in its core. No text or logo.',
        'Tech-launch hero photograph of a precise bronze astronomical instrument with nested rings, long-lens compression, a single rim light outlining its circles against black. No markings, text or logo.',
      ],
    },
    'SP01-086': {
      dna: ad({
        aesthetic:
          'Cold condensation commercial: refreshment advertising where frost, beads of water and backlit cold haze make a vessel look ice-cold.',
        color_and_tone:
          'Cold cyan and clean white, with one saturated accent color in the drink or object.',
        lighting_and_shadow:
          'Strong backlight through the vessel for glow, hard rim sparkle on droplets, cool fill.',
        texture_and_material:
          'Condensation beads and running drops, frost bloom, crushed ice, cold vapor.',
        camera_and_composition:
          'Slight heroic low angle, 85–100 mm, vessel centered and tall in frame.',
        atmosphere_and_mood: 'Fresh and energetic, cold you can almost feel on your hand.',
        rendering_and_quality: 'Beverage-ad clarity with sharp droplets; no warm or dry surfaces.',
        key_features:
          'condensation beads; frost bloom; backlit cold glow; rim-lit droplets; heroic low angle',
      }),
      avoid: [...AVOID, 'warm palette', 'dry surface'],
      briefs: [
        'Cold commercial photograph of a frosted pewter tankard of pale ale, condensation beads running down its sides, backlit cold haze, crushed ice at the base, heroic low angle. No text or logo.',
        'Cold commercial photograph of a glass flask of glowing blue elixir furred with frost, droplets sparkling under hard rim light, icy vapor curling from the neck. No label text or logo.',
        'Cold commercial photograph of a goblet carved from a block of clear ice, filled with red berries and cold juice, beads of melt running down, cyan backlight. No text or logo.',
      ],
    },
    'SP01-087': {
      dna: ad({
        aesthetic:
          'E-commerce white sweep: a marketplace listing photo with the object on pure white, evenly lit, readable from edge to edge.',
        subject_treatment: profile('the pure white background and straight listing view'),
        color_and_tone:
          'Pure white background, neutral grey contact shadow, accurate object color.',
        lighting_and_shadow:
          'Even high-key light box from all sides; only a small soft shadow under the object.',
        texture_and_material: 'Accurate material, no styling props, no reflections of the studio.',
        camera_and_composition:
          'Straight-on or catalog three-quarter view, object filling about 80 percent of the frame, centered.',
        atmosphere_and_mood: 'Functional and trustworthy, exactly what arrives in the box.',
        rendering_and_quality:
          'Clean online-retail image; no lifestyle scene, dramatic light or colored backdrop.',
        key_features:
          'pure white background; even light box; small soft contact shadow; object fills frame; straight listing view',
      }),
      avoid: [...AVOID, 'lifestyle scene', 'dramatic lighting', 'colored backdrop'],
      briefs: [
        'E-commerce white-sweep listing photograph of a steel great helm with brass breathing holes, straight-on, filling most of the frame, even light, small soft shadow on pure white. No text or logo.',
        'E-commerce white-sweep listing photograph of a tooled leather satchel with brass buckles, three-quarter view, accurate color, pure white background. No text or logo.',
        'E-commerce white-sweep listing photograph of a pierced-tin hanging lantern, centered, every hole crisp, even high-key light. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Dark Chiaroscuro Food',
      domain: 'dark moody food photography',
      tags: ['food', 'chiaroscuro', 'still-life'],
      dna: ad({
        aesthetic:
          'Dark chiaroscuro food photography: food on dark wood and pewter lit by one small window, falling off into deep shadow like an old-master still life.',
        subject_treatment:
          'Keep the prompt subject; if it is food, style it rich and slightly rustic; if not, place it in the same dark tabletop light without turning it into food.',
        color_and_tone:
          'Deep umber and charcoal shadows, warm ochre highlights, jewel-toned fruit and wine accents.',
        lighting_and_shadow:
          'Single small side window or flagged softbox, no fill, quick falloff so the back of the table is black.',
        texture_and_material:
          'Crackled crusts, glossy skins, pewter, dark oak and rumpled linen with strong texture in the highlights.',
        camera_and_composition:
          '45 degrees or eye level, low-key frame with the food in the one lit area, props receding into darkness.',
        atmosphere_and_mood: 'Rich and brooding, a feast glimpsed in a candle-dark hall.',
        rendering_and_quality:
          'Low-key exposure with clean blacks and detailed highlights; not a bright cookbook look.',
        key_features:
          'single side window; black falloff; pewter and dark oak; old-master still-life mood; jewel accents',
      }),
      avoid: [...PHOTO, 'bright high-key', 'fill light'],
      briefs: [
        'Dark chiaroscuro food photograph of a roast pheasant with black grapes on a pewter charger on dark oak, a single small window lighting it from the left, the rest of the table falling into black. No text or logo.',
        'Dark chiaroscuro food photograph of a split pomegranate beside a silver goblet of red wine, seeds glowing ruby in the one beam of light, deep umber shadows. No text or logo.',
        'Dark chiaroscuro food photograph of black rye bread, smoked eel and pickled onions on a rough board, crust crackling in warm side light, charcoal darkness behind. No text or logo.',
      ],
    },
    {
      name: 'Architectural Twilight Exterior',
      domain: 'twilight architectural exterior',
      tags: ['architecture', 'twilight', 'long-exposure'],
      dna: ad({
        aesthetic:
          'Twilight architectural exterior: a building photographed at blue hour with every window lit, balancing warm interiors against a deep blue sky.',
        subject_treatment:
          'Keep the prompt subject and setting; show the building whole, with its interior lights on and no added crowds.',
        color_and_tone: 'Deep cobalt sky, warm amber windows, slate and stone in cool mid-tones.',
        lighting_and_shadow:
          'Ambient sky as a huge soft source, interior and facade lights as warm points; tripod long exposure.',
        texture_and_material: 'Glassy windows, smooth long-exposure water and sky, crisp masonry.',
        camera_and_composition:
          'Tripod, corrected verticals, building centered or on a third, reflection in water or wet stone when present.',
        atmosphere_and_mood: 'Inviting and serene, warmth glowing inside against the cooling dusk.',
        rendering_and_quality: 'Clean long exposure with no noise; not an HDR listing look.',
        key_features:
          'blue-hour sky; every window lit amber; tripod long exposure; corrected verticals; smooth water reflections',
      }),
      avoid: [...PHOTO, 'daylight', 'HDR halos'],
      briefs: [
        'Twilight architectural photograph of a cliffside monastery with every window glowing amber under a deep cobalt sky, long exposure smoothing the sea below into mist, corrected verticals. No text or logo.',
        'Twilight architectural photograph of a modern glass chapel in a snowy birch forest, its warm interior glowing through the walls, blue snow and sky around it. No text or logo.',
        'Twilight architectural photograph of an old stone bridge-house spanning a river, its windows lit, the long exposure turning the water into a smooth mirror of warm and blue light. No text or logo.',
      ],
    },
    {
      name: 'Hard-Light Glass Still Life',
      domain: 'glass caustics still life',
      tags: ['glass', 'caustics', 'still-life'],
      dna: ad({
        aesthetic:
          'Hard-light glass still life: a small hard spotlight shining through glass or liquid so the object throws bright caustic patterns and colored shadows onto a pale surface.',
        color_and_tone:
          'Pale paper or stone ground; caustics in amber, green or ruby from the glass color.',
        lighting_and_shadow:
          'One hard low spot from behind or the side, long shadow and a bright focused caustic pool inside it.',
        texture_and_material:
          'Cut glass facets, liquid meniscus, bubbles and refraction lines crisp.',
        camera_and_composition:
          'Low angle so the object and its cast caustic shadow share the frame, generous empty surface.',
        atmosphere_and_mood: 'Quiet and luminous, light itself becoming the ornament.',
        rendering_and_quality: 'Real photographic caustics; not a CGI material render.',
        key_features:
          'hard spot through glass; caustic light pool; colored cast shadow; pale ground; low angle',
      }),
      avoid: [...PHOTO, 'soft flat light'],
      briefs: [
        'Hard-light still-life photograph of a cut-crystal decanter of amber spirit on white paper, a low spotlight behind it casting a long shadow filled with glowing amber caustic patterns. No text or logo.',
        'Hard-light still-life photograph of a glass alembic half full of green liquid on pale limestone, bright green caustic ripples and bubbles projected across the stone. No text or logo.',
        'Hard-light still-life photograph of a solid glass apple on a pale plaster table, a focused spotlight turning it into a burst of white and ruby caustics in its shadow. No text or logo.',
      ],
    },
    {
      name: 'Lifestyle In-Hand Product',
      domain: 'lifestyle product in use',
      tags: ['lifestyle', 'product', 'in-use'],
      dna: ad({
        aesthetic:
          'Lifestyle in-hand product photography: the object shown in use, held by adult hands in a real environment under natural light.',
        color_and_tone: 'Natural warm color, product color accurate, background muted.',
        lighting_and_shadow:
          'Soft daylight or window light, gentle shadows, a bit of backlight for glow.',
        texture_and_material:
          "Real skin, worn surfaces and the product's material crisp where the hands touch it.",
        camera_and_composition:
          '50–85 mm, close crop on hands and product, face cropped out or out of focus, environment soft behind.',
        atmosphere_and_mood:
          "Authentic and tactile, the object already part of someone's ordinary day.",
        rendering_and_quality: 'Natural lifestyle realism; product sharp, no studio sweep.',
        key_features:
          'adult hands using the product; real environment; soft daylight; shallow background; tactile contact',
      }),
      avoid: [...PHOTO, 'studio sweep', 'posed stock smile'],
      briefs: [
        'Lifestyle photograph of adult hands in fingerless gloves holding an open brass pocket compass on a windy mountain trail, the needle crisp, the valley soft behind. No markings, text or logo.',
        'Lifestyle photograph of adult hands pouring steaming tea from a black cast-iron pot into a clay cup in a stone cottage kitchen, window light, steam backlit. No text or logo.',
        'Lifestyle photograph of adult hands lacing a pair of new tan leather boots on a worn wooden step, morning light, the doorway blurred behind. No text or logo.',
      ],
    },
    {
      name: 'Color-Block Set Still Life',
      domain: 'color paper set still life',
      tags: ['color-block', 'set-design', 'still-life'],
      dna: ad({
        aesthetic:
          'Color-block set still life: an object placed on a built set of flat colored paper planes and blocks, lit with hard light for crisp graphic shadows.',
        color_and_tone:
          'Two or three bold flat colors (mustard, teal, coral, cobalt, pink) that contrast with the object.',
        lighting_and_shadow:
          'Single hard light at a steep angle creating long, clean-edged shadows across the planes.',
        texture_and_material:
          "Matte paper and painted board planes; the object's material crisp against them.",
        camera_and_composition:
          'Straight-on or slight elevation, geometric steps, arches or cylinders as plinths, strong negative space.',
        atmosphere_and_mood:
          'Playful and graphic, a small object turned into a bold sculpture by color and shadow.',
        rendering_and_quality: 'Clean set photography; not CGI, no gradient backdrops.',
        key_features:
          'flat colored paper planes; hard steep light; long clean shadows; geometric plinths; bold contrast',
      }),
      avoid: [...PHOTO, 'gradient backdrop', 'soft light'],
      briefs: [
        'Color-block set photograph of a pewter goblet standing on a mustard paper step against a teal wall, a hard steep light casting its long clean shadow diagonally across both planes. No text or logo.',
        "Color-block set photograph of a jester's belled cap draped over a coral cylinder on a cobalt floor, hard light and crisp shadows. No text or logo.",
        'Color-block set photograph of three stacked green pears balanced on pink and red paper arches, a hard spot throwing their silhouettes across the arches. No text or logo.',
      ],
    },
    {
      name: 'Ghost Mannequin Apparel',
      domain: 'invisible mannequin apparel photography',
      tags: ['apparel', 'ghost-mannequin', 'e-commerce'],
      dna: ad({
        aesthetic:
          'Ghost mannequin apparel photography: a garment shown as if worn by an invisible body, keeping its three-dimensional shape with the interior of the collar visible.',
        subject_treatment: profile(
          'the invisible-body presentation of garments; non-garment subjects keep their own form',
        ),
        color_and_tone: 'Neutral white or light grey background, accurate fabric color.',
        lighting_and_shadow:
          'Even soft light from both sides and above, gentle shading showing fabric volume.',
        texture_and_material:
          'Weave, quilting, stitches, buttons and lining crisp; hollow neck and cuffs.',
        camera_and_composition:
          'Straight-on front view, garment centered and symmetrical, hollow opening at the neck.',
        atmosphere_and_mood: 'Clean and informative, the garment seen exactly as it would be worn.',
        rendering_and_quality: 'Seamless composite look with no mannequin, hanger or body visible.',
        key_features:
          'invisible body volume; hollow collar interior; straight-on symmetry; even soft light; neutral background',
      }),
      avoid: [...PHOTO, 'visible mannequin', 'hanger', 'visible body'],
      briefs: [
        'Ghost mannequin photograph of a quilted linen gambeson shown as if worn by an invisible body, the hollow collar showing its lining, straight-on on a white background, even soft light. No text or logo.',
        'Ghost mannequin photograph of a hooded crimson velvet cloak with a silver clasp, the hood and shoulders holding their shape around an empty space, light grey background. No text or logo.',
        'Ghost mannequin photograph of a riveted chainmail shirt standing in the shape of an invisible torso, every ring crisp, empty neck opening, white background. No text or logo.',
      ],
    },
  ],
};

export default spec;
