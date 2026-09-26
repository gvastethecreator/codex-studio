import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Trading-card crafted materials and miniatures: the subject rebuilt as a handmade object and
// photographed like a tabletop scene. Eight originals get card briefs; twelve new crafts add
// needle felt, matchbox dioramas, knitted landscapes, salt dough, bent wire, peg people,
// terrariums, seed beads, acorn-and-twig figures, egg-carton creatures, paper mache and walnut worlds.
const study = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  avoid: string[],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'craft', 'portable-style-study'],
  dna: dna(fields),
  avoid: [...avoid, 'real toy brand', ...STYLE_AVOID],
  briefs,
});

const keep = 'Preserve the requested identity, count, pose and action while rebuilding it as a handmade craft object';

const spec: Spec = {
  pack: 'pack_22',
  category: '12. Crafted Materials & Miniatures',
  updates: {
    'SP22-189': { briefs: [
      "Napping between rows of miniature pumpkins, a sculpted tortoise in a straw hat snores in a tiny vegetable garden, fingerprints visible on every gourd and on the watering can beside him. No readable text or logo.",
      "Tending a garden of faintly glowing mushrooms, a modeled witch bends over her plants, her crooked hat and broom still showing the sculptor's thumb press in the soft material. No readable text or logo.",
      "Racing across a clay cabbage patch, a family of clay snails is winning against a clay tortoise, while a clay scarecrow with button eyes waves the checkered flag. No readable text or logo.",
    ] },
    'SP22-190': { briefs: [
      "Stirring a yarn pot of soup with four arms at once, an octopus chef made of looped stitches tastes from a ladle, every loop of yarn visible in extreme macro detail on its tentacles. No readable text or logo.",
      "Drifting past a stitched moon with yarn craters, an astronaut made of tight hooked loops waves a mitten, the stitch rows of the helmet catching soft studio light. No readable text or logo.",
      "Landing gently on a crocheted daisy, a fuzzy bee made of yellow and black yarn loops sips from the flower center while the fibers glow warm and haloed in the backlight. No readable text or logo.",
    ] },
    'SP22-191': { briefs: [
      "Glowing inside a backlit box, a forest of layered cut trees hides a paper wolf between the trunks, while a small deer with paper antlers walks toward it unaware. No readable text or logo.",
      "Shining out of a layered sea of cut sheets, a lighthouse sends its beam clean through five stacked layers, lit from behind as a tiny ship turns toward home. No readable text or logo.",
      "At night inside a shadow box, a whole skyline glows with every window a tiny cut hole, and one apartment lit brighter than the rest where someone is having a party. No readable text or logo.",
    ] },
    'SP22-192': { briefs: [
      "Diving through stacked layers of paper waves in five shades of blue, a cut-paper whale discovers a sunken paper city at the bottom, each layer casting a soft shadow on the next. No readable text or logo.",
      "Leaping over layered paper hills at sunset, a cut-paper fox is chasing the paper sun itself, which has come unstuck and is rolling away down the far slope. No readable text or logo.",
      "Rising through layered clouds cut from tissue and card, a striped hot-air balloon carries two tiny passengers above a patchwork of paper fields, farms and winding paper rivers. No readable text or logo.",
    ] },
    'SP22-193': { briefs: [
      "Guarding a pile of stitched coins in a cave, a grumpy badger king sits on his hoard, blanket-stitched edges around every coin, crown point and whisker. No readable text or logo.",
      "Resting on a soft stitched rock, a mermaid combs her hair with a fork, sequin scales sewn onto her tail and a button crab sleeping at her side. No readable text or logo.",
      "Under a stitched felt moon, a sleepy village glows at night with button windows, blanket-stitched chimneys and one tiny felt cat walking the ridge of a crooked roof. No readable text or logo.",
    ] },
    'SP22-194': { briefs: [
      "Standing on a sculpted base of rocks and moss, a tabletop knight no taller than a thumb holds his ground, every buckle and dent picked out with a fine brush. No readable text or logo.",
      "Rearing over a little ruined tower, a tabletop manticore spreads leathery wings, its fur and tail spikes highlighted with delicate drybrushing and a glossy wet-look sting. No readable text or logo.",
      "Casting a spell on a base of painted cobblestones, a tabletop wizard no taller than a thumb raises his staff, a tiny glowing effect painted in layered highlights at its tip. No readable text or logo.",
    ] },
    'SP22-195': { briefs: [
      "Rising in relief from a corrugated sheet, a fortress with exposed flutes for towers opens its gate to a cut-out knight on a tape-hinged horse. No readable text or logo.",
      "Swimming over waves built in stacked relief layers, a boxboard whale spouts a curl of packing paper, flutes showing at every cut edge. No readable text or logo.",
      "Waving from a rocket built in layered relief with brown tape at the seams, a robot made from shipping boxes prepares for launch from a kitchen table. No readable text or logo.",
    ] },
    'SP22-196': { briefs: [
      "Flying over a mountain range of crisp creases, an army of origami cranes crosses the sky in tight formation, every fold catching the low side light. No readable text or logo.",
      "Wrapped around a mountain peak, an origami sea serpent guards a sleeping paper village, every scale, fin and rooftop a precise crisp fold that catches the low morning light. No readable text or logo.",
      "Sailing across a real rain puddle, an origami boat carries a single ant captain while creased paper frogs watch from the edge. No readable text or logo.",
    ] },
  },
  creates: [
    study('Needle-Felt Figurine Scene', 'needle-felted wool figures', 'needle-felt', {
      aesthetic: 'Needle-felt figurine scene: small figures sculpted from fuzzy needle-felted wool, soft rounded shapes with stray fibers, arranged on a tabletop miniature set.',
      subject_treatment: `${keep}; sculpt the subject from fuzzy felted wool with simplified rounded forms.`,
      color_and_tone: 'Soft natural wool colors with gentle pastel and earthy accents.',
      lighting_and_shadow: 'Soft window light with gentle shadows and glowing fuzzy edges.',
      texture_and_material: 'Dense felted wool, stray fibers, tiny bead eyes and soft seams.',
      camera_and_composition: 'Close macro tabletop view with shallow depth of field.',
      atmosphere_and_mood: 'Keep the requested mood with cozy, tender, handmade warmth.',
      rendering_and_quality: 'Believable felted texture with crisp macro detail on the fibers.',
      key_features: 'needle-felted wool; stray fibers; bead eyes; tabletop macro',
    }, ['plastic shine'], [
      "By a small campfire of orange wool, a badger in a knitted scarf reads a tiny book, stray fibers of his needle-sculpted fur glowing in the warm window light. No readable text or logo.",
      'A felted wool dragon sleeps curled in a teacup, its fuzzy wings twitching as a felted mouse tiptoes past. No readable text or logo.',
      "On a real twig in falling felted snow, a family of felted owls huddles together except for one, which is wearing a tiny felted scarf and looks extremely smug. No readable text or logo.",
    ]),
    study('Matchbox Diorama World', 'tiny world inside a matchbox', 'matchbox-diorama', {
      aesthetic: 'Matchbox diorama world: a complete tiny scene built inside an open matchbox tray, with microscopic furniture, figures and lights crammed into the little box.',
      subject_treatment: `${keep}; build the subject as a tiny scene fitted inside an open matchbox.`,
      color_and_tone: 'Warm miniature colors inside plain cardboard box tones.',
      lighting_and_shadow: 'Tiny internal lights glowing, soft shadows inside the box walls.',
      texture_and_material: 'Cardboard box texture, miniature props, paint dots and fine wire details.',
      camera_and_composition: 'Close macro view looking into the open matchbox on a table.',
      atmosphere_and_mood: 'Keep the requested mood with secret, delightful smallness.',
      rendering_and_quality: 'Crisp miniature detail with believable scale and depth.',
      key_features: 'scene inside matchbox; microscopic props; tiny lights; macro view',
    }, ['readable matchbox labels'], [
      'An entire tiny tavern with a fireplace, three drinkers and a sleeping dog is crammed inside an open matchbox glowing on a wooden desk. No readable text or logo.',
      "Tucked into a matchbox tray, a stormy sea is shipwrecking a tiny sailing ship while a real matchstick lies across it like a fallen mast, the waves carved from wax. No readable text or logo.",
      "Filling the drawer of an old matchbox, a tiny bedroom holds a sleeping mouse under a stamp-sized quilt, a thimble lamp and a bottle-cap rug laid across the wooden floor. No readable text or logo.",
    ]),
    study('Knitted Landscape Miniature', 'landscape knitted from yarn', 'knitted-landscape', {
      aesthetic: 'Knitted landscape miniature: whole landscapes knitted from yarn, rolling stockinette hills, bobble trees and ribbed rivers with tiny knitted figures.',
      subject_treatment: `${keep}; knit the subject and its setting from visible yarn stitches.`,
      color_and_tone: 'Soft wool greens, sky blues, cream and warm yarn accents.',
      lighting_and_shadow: 'Soft daylight revealing every stitch and fuzzy edge.',
      texture_and_material: 'Stockinette stitch, bobbles, cables, ribbing and yarn fuzz.',
      camera_and_composition: 'Wide tabletop miniature view with gentle tilt-shift depth.',
      atmosphere_and_mood: 'Keep the requested mood with cozy woolly charm.',
      rendering_and_quality: "Believable knitted textures with clear stitch detail, kept consistent across the whole image.",
      key_features: 'knitted hills; bobble trees; ribbed rivers; yarn fuzz',
    }, ['plastic look'], [
      "Rolling into the distance with bobble trees and a ribbed river, a wool countryside carries a tiny train chugging over a cable-stitch bridge toward a purl-stitch hill. No readable text or logo.",
      "Rising from a stockinette ocean of blue wool, a knitted sea monster with pompom eyes tangles its yarn tentacles around a tiny knitted lighthouse whose keeper waves a needle. No readable text or logo.",
      "Under a snowfall of white yarn, a small wool village sleeps, fluffy smoke curling from stockinette chimneys and one lit window glowing in the dusk. No readable text or logo.",
    ]),
    study('Salt-Dough Ornaments', 'baked salt-dough figures', 'salt-dough', {
      aesthetic: 'Salt-dough ornaments: figures shaped from baked salt dough, puffy lumpy forms, toasted edges and bright hand-painted details with a glossy varnish.',
      subject_treatment: `${keep}; shape the subject as a puffy baked salt-dough ornament with painted details.`,
      color_and_tone: 'Toasted beige dough with bright painted reds, greens and blues and glossy varnish.',
      lighting_and_shadow: 'Soft warm light with gentle shadows under the puffy shapes.',
      texture_and_material: 'Lumpy dough, fork marks, toasted edges, brush strokes and varnish shine.',
      camera_and_composition: 'Flat-lay or hanging ornament framing with a simple background.',
      atmosphere_and_mood: 'Keep the requested mood with homemade holiday charm.',
      rendering_and_quality: 'Believable baked dough texture with cheerful hand painting.',
      key_features: 'puffy baked dough; toasted edges; hand-painted details; glossy varnish',
    }, ['smooth plastic'], [
      "Hanging from a red ribbon on a pine branch, a puffy baked ornament shaped like a smiling hedgehog is painted bright green, toasted brown at the edges and slightly lopsided. No readable text or logo.",
      "Lying on a baking tray fresh from the oven, a baked-dough knight and his horse wait for paint, toasted at the edges with fork-pricked armor and a cracked lance. No readable text or logo.",
      "Hanging from a pine branch by red twine, a salt-dough cottage with fork-textured roof tiles, painted windows and a thumbprint chimney glows beside a tiny salt-dough snowman. No readable text or logo.",
    ]),
    study('Bent-Wire Figures', 'figures bent from wire', 'bent-wire', {
      aesthetic: 'Bent-wire figures: subjects formed from continuous bent wire lines in the air, like three-dimensional drawings casting delicate shadows on a wall.',
      subject_treatment: `${keep}; bend the subject from continuous wire lines that capture its outline and gesture.`,
      color_and_tone: 'Silver, copper or black wire against pale walls with crisp shadows.',
      lighting_and_shadow: 'Side light casting sharp shadow drawings behind the wire forms.',
      texture_and_material: 'Twisted wire joints, coiled details, smooth bends and metallic glints.',
      camera_and_composition: 'Wire figure against a plain wall with its shadow as a second drawing.',
      atmosphere_and_mood: 'Keep the requested mood with light, airy, playful elegance.',
      rendering_and_quality: 'Clean continuous wire lines with believable metal bends.',
      key_features: 'continuous wire lines; shadow drawings; twisted joints; airy form',
    }, ['solid filled shapes'], [
      'A copper-wire cyclist rides along a white wall, its shadow drawing a second cyclist chasing behind it. No readable text or logo.',
      'A wire dragon made of one continuous line coils around a candlestick, casting a huge shadow dragon on the wall. No readable text or logo.',
      "On a real branch, a family of wire birds sits in a row, but their shadows on the plaster behind them are cats waiting patiently. No readable text or logo.",
    ]),
    study('Clothespin Peg People', 'wooden peg doll figures', 'peg-people', {
      aesthetic: 'Clothespin peg people: characters made from old wooden clothespins and peg dolls, painted faces, scrap fabric clothes and yarn hair.',
      subject_treatment: `${keep}; turn the characters into painted wooden peg dolls with scrap costumes.`,
      color_and_tone: 'Natural wood tones with bright painted clothes and rosy painted cheeks.',
      lighting_and_shadow: 'Warm soft light with small shadows at the peg bases.',
      texture_and_material: 'Wood grain, painted details, fabric scraps, yarn hair and glue.',
      camera_and_composition: 'Tabletop scene with the peg people standing in a row or group.',
      atmosphere_and_mood: 'Keep the requested mood with humble homemade charm.',
      rendering_and_quality: 'Believable handmade peg craft with clear painted faces.',
      key_features: 'wooden peg bodies; painted faces; scrap fabric clothes; yarn hair',
    }, ['plastic toys'], [
      'A whole royal court of clothespin peg people with scrap velvet cloaks and yarn hair bows to a peg queen on a thimble throne. No readable text or logo.',
      "Sailing across a bowl of water on a walnut-shell boat, a wooden peg-doll pirate crew with painted beards raises a paper sail and fires a single dried pea from a straw cannon. No readable text or logo.",
      "On a matchbox stage under a thimble spotlight, a peg-doll band of four plays tiny toothpick drums, a bottle-cap banjo and a paper trumpet for an audience of buttons. No readable text or logo.",
    ]),
    study('Terrarium Tiny World', 'miniature world inside glass terrarium', 'terrarium-world', {
      aesthetic: 'Terrarium tiny world: a miniature landscape growing inside a glass jar or terrarium, real moss and pebbles with tiny figures and buildings.',
      subject_treatment: `${keep}; place the subject as a tiny scene inside a glass terrarium.`,
      color_and_tone: 'Lush moss greens, earthy browns and glass reflections.',
      lighting_and_shadow: 'Soft light through glass with reflections and condensation.',
      texture_and_material: 'Real moss, pebbles, soil layers, glass curvature and tiny props.',
      camera_and_composition: 'Close view through curved glass with the tiny world centered.',
      atmosphere_and_mood: 'Keep the requested mood with enclosed secret-garden wonder.',
      rendering_and_quality: "Believable miniature scale with crisp glass reflections, kept consistent across the whole image.",
      key_features: 'glass terrarium; real moss; tiny figures; glass reflections',
    }, ['no glass enclosure'], [
      'A tiny knight explores a mossy forest inside a glass jar, condensation dripping from the glass sky above him. No readable text or logo.',
      "On a windowsill, a miniature cottage with a smoking chimney sits among ferns under glass while a real, enormous snail presses its face against the curved wall. No readable text or logo.",
      "Inside a round glass globe of moss and pebbles, a tiny lizard in a knitted scarf sleeps on a pebble mountain beside a waterfall made of a single glistening drop of dew. No readable text or logo.",
    ]),
    study('Seed-Bead Figures', 'figures woven from tiny beads', 'seed-bead', {
      aesthetic: 'Seed-bead figures: creatures and objects woven from thousands of tiny glass seed beads, glittering colors and beaded wire armatures.',
      subject_treatment: `${keep}; weave the subject from tiny colored glass beads on wire.`,
      color_and_tone: "Glittering jewel-colored beads with iridescent highlights, kept consistent across the whole image.",
      lighting_and_shadow: 'Sparkling light on bead surfaces with soft shadows.',
      texture_and_material: 'Rows of seed beads, wire threads, glass shine and faceted beads.',
      camera_and_composition: 'Macro view of the beaded object on a plain surface.',
      atmosphere_and_mood: 'Keep the requested mood with jewel-like handmade sparkle.',
      rendering_and_quality: "Precise bead detail with believable glass reflections, kept consistent across the whole image.",
      key_features: 'woven seed beads; glass sparkle; wire armature; jewel colors',
    }, ['smooth solid surfaces'], [
      "Hovering over a beaded flower, a beaded hummingbird has dropped a single bead that a beaded ant is now carrying home like a treasure, all glittering under a desk lamp. No readable text or logo.",
      "Sunbathing on a real stone, a beaded lizard patterned in orange and turquoise has shed its old skin, which lies beside it as a perfect empty string of beads. No readable text or logo.",
      "Resting on a velvet cushion, a beaded crown sparkles with every point strung from glittering seed beads, while a tiny beaded beetle climbs up one side to claim the throne. No readable text or logo.",
    ]),
    study('Acorn-and-Twig Figures', 'nature craft figures', 'acorn-twig', {
      aesthetic: 'Acorn-and-twig figures: tiny characters built from acorns, twigs, leaves, pinecones and seed pods, glued together into woodland creatures and scenes.',
      subject_treatment: `${keep}; assemble the subject from acorns, twigs, leaves and seeds.`,
      color_and_tone: "Warm browns, mossy greens and autumn oranges, kept consistent across the whole image.",
      lighting_and_shadow: "Soft forest light with dappled shadows, kept consistent across the whole image.",
      texture_and_material: 'Acorn caps, rough twigs, dried leaves, pinecone scales and glue dots.',
      camera_and_composition: 'Low macro view on moss or bark with a forest background.',
      atmosphere_and_mood: 'Keep the requested mood with whimsical autumn wonder.',
      rendering_and_quality: "Believable natural materials with clear assembled forms, kept consistent across the whole image.",
      key_features: 'acorn heads; twig limbs; leaf clothing; forest floor setting',
    }, ['plastic materials'], [
      "Dueling on a mossy log, a knight with a nut head, twig arms and a leaf shield faces a pinecone boar, both armies of seed-pod soldiers cheering from the moss. No readable text or logo.",
      "Under a spotted mushroom umbrella, a family of acorn people with twig arms and cap hats hosts a picnic using seed-pod teacups, a leaf tablecloth and one very serious snail waiter. No readable text or logo.",
      "Guarding a garden of tiny berries on a mossy tree stump, a twig-and-leaf scarecrow with a pinecone head frightens away a single confused sparrow twice his size. No readable text or logo.",
    ]),
    study('Egg-Carton Creatures', 'creatures from egg cartons', 'egg-carton', {
      aesthetic: 'Egg-carton creatures: monsters and animals made from cut and painted cardboard egg cartons, lumpy pulp textures and bright paint with googly-eye charm.',
      subject_treatment: `${keep}; build the subject from cut egg-carton cups and pulp shapes painted brightly.`,
      color_and_tone: "Bright poster-paint colors over grey molded pulp, kept consistent across the whole image.",
      lighting_and_shadow: 'Soft table light with shadows inside the carton cups.',
      texture_and_material: 'Molded paper pulp, cut edges, paint drips, glue and googly eyes.',
      camera_and_composition: 'Tabletop craft view with the creature in the center.',
      atmosphere_and_mood: 'Keep the requested mood with silly handmade fun.',
      rendering_and_quality: 'Believable pulp texture with cheerful paint and glue details.',
      key_features: 'egg-carton cups; molded pulp; bright paint; googly eyes',
    }, ['realistic creature'], [
      'A long egg-carton caterpillar dragon with twelve painted cups and huge googly eyes crawls across a kitchen table. No readable text or logo.',
      "Snapping its bumpy jaws over a painted cardboard river, an egg-carton crocodile chases a panicked egg-carton fish with googly eyes and tinfoil fins across a classroom table. No readable text or logo.",
      "Hanging upside down from a string across a classroom window, a flock of egg-carton bats with pipe-cleaner wings and painted fangs sways gently in a draft at dusk. No readable text or logo.",
    ]),
    study('Paper-Mache Figures', 'painted paper mache figures', 'paper-mache', {
      aesthetic: 'Paper-mache figures: bold rounded figures built from layered paper strips and paste, painted in bright festival colors with a slightly bumpy handmade surface.',
      subject_treatment: `${keep}; build the subject as a painted paper mache figure with bold rounded forms.`,
      color_and_tone: 'Bright festival colors of magenta, yellow, turquoise and orange.',
      lighting_and_shadow: 'Warm daylight with soft shadows under the rounded forms.',
      texture_and_material: 'Bumpy paper strip layers, paste texture, bold paint and patterns.',
      camera_and_composition: 'Full figure view, possibly on a festival table or shelf.',
      atmosphere_and_mood: 'Keep the requested mood with joyful festival energy.',
      rendering_and_quality: "Believable handmade surface with bold painted decoration, kept consistent across the whole image.",
      key_features: 'layered paper strips; bumpy surface; bright festival paint; bold forms',
    }, ['smooth plastic'], [
      "Swimming above a festival crowd on bamboo sticks, a huge pulp-and-paste fish with painted stripes and polka dots opens its mouth to swallow the evening moon. No readable text or logo.",
      "Posed on a sunny wooden shelf, a paper-mache jaguar spirit with bright magenta spots, turquoise claws and a curling tail stares out with painted golden eyes and a toothy smile. No readable text or logo.",
      "Hanging on wires over a village fair, a paper-mache moon with a sleepy painted face and flaking gold paint yawns above the lanterns while children dance below. No readable text or logo.",
    ]),
    study('Walnut-Shell Worlds', 'tiny scenes inside walnut shells', 'walnut-shell', {
      aesthetic: 'Walnut-shell worlds: tiny detailed scenes built inside open walnut shell halves, like secret rooms or landscapes hidden in a nut.',
      subject_treatment: `${keep}; place the subject as a tiny scene inside an open walnut shell.`,
      color_and_tone: 'Warm walnut browns with small bright miniature color accents.',
      lighting_and_shadow: 'Soft light with tiny glowing lamps inside the shell.',
      texture_and_material: 'Ridged walnut shell, miniature furniture, moss and fine paint.',
      camera_and_composition: 'Macro view of the open shell on a wooden surface.',
      atmosphere_and_mood: 'Keep the requested mood with secret, magical smallness.',
      rendering_and_quality: "Crisp miniature detail with believable shell texture, kept consistent across the whole image.",
      key_features: 'open walnut shell; tiny scene inside; miniature lamps; macro view',
    }, ['large scale'], [
      'A mouse sleeps in a tiny bed with a patchwork quilt inside half a walnut shell, a candle the size of a grain glowing beside it. No readable text or logo.',
      "Tucked inside half a walnut shell, a miniature waterfall spills into a pond where one tiny frog sits on a lily pad made from a single cut leaf, beside a moss bank. No readable text or logo.",
      "Hidden inside a walnut on a desk, a tiny wizard's study with a globe and bookshelf has a crack in the shell where a real eye is peering in. No readable text or logo.",
    ]),
  ],
};

export default spec;
