import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Trading-card vintage collectible illustration: printed ephemera formats as card art, always
// without readable text. Eight originals get card briefs; twelve new formats add tea cards,
// cabinet cards, hand-colored postcards, seed packets, stereoviews, magic lantern slides, die-cut
// scraps, gum cards, stamp miniatures, enamel tin signs, tin lids and matchbook covers.
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
  tags: [tag, 'vintage', 'portable-style-study'],
  dna: dna(fields),
  avoid: [...avoid, 'readable lettering or numbers', 'real brand', ...STYLE_AVOID],
  briefs,
});

const keep = 'Preserve the requested identity, proportions, pose and action';

const spec: Spec = {
  pack: 'pack_22',
  category: '13. Vintage Collectible Illustration',
  updates: {
    'SP22-197': { briefs: [
      'A circus strongwoman lifts a baby elephant over her head, printed in rich layered lithograph colors with soft stone grain in every shadow. No readable text or logo.',
      "Drifting over a patchwork countryside, a hot-air balloon race has one competitor cheating with a pair of enormous flapping bird wings, all in layered lithograph rose, sage and gold. No readable text or logo.",
      "Under stage lights, a magician pulls a startled rabbit from a top hat, and the rabbit pulls an even more startled magician from its own tiny hat, colors stacked in soft litho layers. No readable text or logo.",
    ] },
    'SP22-198': { briefs: [
      'A chrome space racer zooms past a ringed planet in smooth glossy airbrush gradients, every reflection soft and seamless like a vintage poster painting. No readable text or logo.',
      'A glamorous mermaid lounges on a rock at sunset painted in silky airbrushed pinks and oranges. No readable text or logo.',
      "On a lunar beach under a giant ringed planet, a retro chrome robot in a Hawaiian shirt serves glowing cocktails to lounging aliens, all in smooth dreamy airbrush gradients. No readable text or logo.",
    ] },
    'SP22-199': { briefs: [
      "Galloping through a canyon, a wild horse outruns a dust storm shaped like a second, much larger horse, both drawn in directional wax pencil strokes that follow every muscle and gust. No readable text or logo.",
      "Landing on a snowy fence post at dusk, a barn owl carries a lost mitten in its talons back toward a lit farmhouse window, its feathers built from layered waxy strokes. No readable text or logo.",
      "Crossing a stone viaduct over a misty valley, a steam locomotive trails billowing smoke, every curl of steam hatched in warm wax pencil strokes that follow its drifting direction. No readable text or logo.",
    ] },
    'SP22-200': { briefs: [
      'A tiny jeweled beetle sits on a rose petal in a small-format painting so detailed that each facet of its shell is a single fine brush touch. No readable text or logo.',
      "On a small oval panel, a mouse aristocrat in a lace collar poses for his portrait while holding a crumb of cheese like a priceless jewel, painted with the finest possible brush. No readable text or logo.",
      "In a painting no bigger than a palm, a little sailing ship crosses a stormy sea where each wave is secretly a tiny sleeping sea horse, all in fine brushed detail. No readable text or logo.",
    ] },
    'SP22-201': { briefs: [
      "Dozing in a hammock strung between two cannons, a retired pirate captain is unaware that his parrot is steering the ship, captured in a resolved ink sketch with a few decisive shadows. No readable text or logo.",
      "Tiptoeing along a ledge twenty floors up, a cat burglar is being followed by an actual cat who is much better at it, drawn in finished pen lines with light hatching. No readable text or logo.",
      "Playing a hurdy-gurdy in the rain, a street musician has drawn an audience of drenched stray dogs sitting in a perfect row, sketched in loose but complete ink. No readable text or logo.",
    ] },
    'SP22-202': { briefs: [
      'A vintage photo of a lady in a hat has a cut-out whale floating where her head should be, pasted over a faded seaside postcard in analog collage. No readable text or logo.',
      "In an old family portrait of stiff relatives in their best clothes, every face is covered by a butterfly cut from a naturalist's book, the scissor edges and paper grain plainly visible. No readable text or logo.",
      'A mountain landscape photo has a giant pasted teacup sitting on the peak like a hat. No readable text or logo.',
    ] },
    'SP22-203': { briefs: [
      "At dusk, a circus tent village glows while its tents slowly walk away on elephant legs to the next town, in flat opaque gouache softened by old printing. No readable text or logo.",
      "Deep in a jungle, an explorer realizes the mossy hill he has been camping on is a giant tortoise now turning its head to look at him, reproduced on slightly yellowed paper. No readable text or logo.",
      "Deep inside a cozy burrow, a family of foxes shares a breakfast of berries and toast by a root-lined window, painted in soft matte reproduced gouache with warm earthy tones. No readable text or logo.",
    ] },
    'SP22-204': { briefs: [
      "Strutting through autumn leaves, a pheasant wears a tiny monocle and inspects a mushroom as a serious scientist, every feather pattern clearly described in naturalist color. No readable text or logo.",
      "Cut away like a cake, a busy beehive shows its combs, larvae, worker bees and a large queen on her throne of wax, all painted in careful naturalistic descriptive color. No readable text or logo.",
      "Rattling down a cobbled village lane, a vintage motorcar carries a family of ducks in goggles past a bakery and a church, rendered in precise descriptive color illustration. No readable text or logo.",
    ] },
  },
  creates: [
    study('Tea-Card Nature Plate', 'collectible tea card nature illustration', 'tea-card', {
      aesthetic: 'Tea-card nature plate: small collectible nature cards from old tea packets, a single bird, butterfly or flower painted precisely on a plain ground with a soft printed finish.',
      subject_treatment: `${keep}; present the subject as a single precise natural-history vignette on a plain ground.`,
      color_and_tone: 'Soft printed naturalistic colors on cream or pale blue backgrounds.',
      lighting_and_shadow: "Gentle even light with small soft shadows, kept consistent across the whole image.",
      texture_and_material: 'Fine printed detail, slight halftone softness and aged card stock.',
      camera_and_composition: 'Single centered subject with generous plain space around it.',
      atmosphere_and_mood: 'Keep the requested mood with calm, collectible nostalgia.',
      rendering_and_quality: 'Precise delicate illustration with a soft vintage print finish.',
      key_features: 'single natural vignette; plain ground; soft print finish; aged card stock',
    }, [], [
      "On a pale blue collectible card, a kingfisher perches on a reed holding a tiny fishing rod of its own, painted with the precise care of an old tea-tin nature series. No readable text or logo.",
      'A dragon hatchling perches on a twig in the same careful natural-history style as a songbird card. No readable text or logo.',
      "Resting on a cream ground like a pressed specimen, a pale green luna moth spreads its long-tailed wings, every wing scale and feathery antenna softly printed in muted naturalist inks. No readable text or logo.",
    ]),
    study('Cabinet Card Portrait', 'victorian studio portrait card', 'cabinet-card', {
      aesthetic: 'Cabinet card portrait: sepia studio portraits mounted on thick card with gilt edges, stiff formal poses, painted backdrops and faded silver tones.',
      subject_treatment: `${keep}; pose the subject formally in front of a painted studio backdrop.`,
      color_and_tone: 'Warm sepia and faded silver-brown tones with gilt card edges.',
      lighting_and_shadow: "Soft north-window studio light with gentle falloff, kept consistent across the whole image.",
      texture_and_material: 'Faded photographic surface, painted backdrops, velvet chairs and gilt mount.',
      camera_and_composition: 'Formal centered full or half-length portrait on a mounted card.',
      atmosphere_and_mood: 'Keep the requested mood with solemn Victorian formality.',
      rendering_and_quality: 'Believable antique photo tone with a mounted card border.',
      key_features: 'sepia studio portrait; painted backdrop; gilt card mount; formal pose',
    }, [], [
      'A very serious werewolf gentleman poses in a sepia studio portrait with a velvet chair and a painted garden backdrop, mounted on a gilt-edged card. No readable text or logo.',
      "Standing stiffly before a painted garden backdrop, three solemn frog siblings in their Sunday best hold a pocket watch, a bible and a fly on a string, printed in faded silver tones. No readable text or logo.",
      "Seated in a carved chair for her wedding portrait, a ghost bride stays slightly transparent against the painted backdrop, her bouquet sharp while her veil fades into sepia fog. No readable text or logo.",
    ]),
    study('Hand-Colored Postcard', 'hand-tinted photographic postcard', 'hand-colored-postcard', {
      aesthetic: 'Hand-colored postcard: black-and-white photographs tinted by hand with transparent dyes, soft pastel skies and slightly outside-the-lines color.',
      subject_treatment: `${keep}; show the subject as a tinted photo with soft hand-applied color.`,
      color_and_tone: 'Soft pastel tints of sky blue, rose and green over grey photographic tones.',
      lighting_and_shadow: "Photographic light with tints softening highlights, kept consistent across the whole image.",
      texture_and_material: 'Photo grain, uneven tint edges, linen or card texture and worn corners.',
      camera_and_composition: 'Scenic postcard framing of places, promenades or landmarks.',
      atmosphere_and_mood: 'Keep the requested mood with gentle holiday nostalgia.',
      rendering_and_quality: "Believable tinted photo with delicate imperfect coloring, kept consistent across the whole image.",
      key_features: 'hand-applied tints; pastel skies; photo grain; worn postcard',
    }, ['readable postcard captions'], [
      'A seaside promenade with a sea serpent politely surfacing beside the pier is tinted in soft pastel dyes on an old postcard. No readable text or logo.',
      'A mountain resort with a dragon sunbathing on the hotel roof is hand-colored in pale greens and roses. No readable text or logo.',
      "Above a calm alpine lake, a whole castle floats among clouds, hand-tinted in sky blue and rose that spill slightly outside the lines onto the old black and white photograph. No readable text or logo.",
    ]),
    study('Seed Packet Illustration', 'vintage seed packet art', 'seed-packet', {
      aesthetic: 'Seed packet illustration: lush vintage seed-packet paintings of vegetables and flowers, oversized perfect produce in bright chromolithograph color.',
      subject_treatment: `${keep}; paint the subject as an idealized abundant specimen like seed-packet art.`,
      color_and_tone: 'Bright ripe reds, greens, purples and golden yellows on light grounds.',
      lighting_and_shadow: 'Soft modeled light making produce glossy and plump.',
      texture_and_material: 'Glossy skins, dewdrops, leaves and vintage print grain.',
      camera_and_composition: 'Close idealized arrangement filling the frame with abundance.',
      atmosphere_and_mood: 'Keep the requested mood with cheerful abundant optimism.',
      rendering_and_quality: "Lush detailed painting with vintage print texture, kept consistent across the whole image.",
      key_features: 'idealized produce; lush color; dewdrops; vintage print grain',
    }, ['readable packet text'], [
      'A giant glossy pumpkin with a tiny fairy house built into its side sits among curling vines like the art on an old seed packet. No readable text or logo.',
      "Arranged like prize-show vegetables, a bouquet of enormous dewy radishes and carrots has one carrot with small roots stretched out like legs, quietly escaping the bunch. No readable text or logo.",
      "Towering over the farmhouse behind it, a sunflower taller than the barn turns its huge face toward a surprised farmer on a ladder, glowing in bright vintage seed-packet color. No readable text or logo.",
    ]),
    study('Stereoview Card Pair', 'side-by-side stereoscopic card', 'stereoview', {
      aesthetic: 'Stereoview card pair: two nearly identical sepia photographs side by side on a curved card, made for a stereoscope viewer, with rounded tops.',
      subject_treatment: `${keep}; show the subject twice side by side with a tiny viewpoint shift.`,
      color_and_tone: 'Sepia or silver tones on buff card with faded edges.',
      lighting_and_shadow: "Natural photographic light consistent across both images, kept consistent across the whole image.",
      texture_and_material: 'Curved card mount, rounded-top windows, photo grain and wear.',
      camera_and_composition: 'Two matching images side by side on a horizontal card.',
      atmosphere_and_mood: 'Keep the requested mood with curious antique wonder.',
      rendering_and_quality: "Believable antique stereo pair with subtle parallax, kept consistent across the whole image.",
      key_features: 'twin side-by-side photos; rounded tops; curved card; sepia tone',
    }, ['readable card captions'], [
      'A giant sea monster rising beside a steamship is shown twice side by side on a curved sepia stereoview card with rounded-top windows. No readable text or logo.',
      "Posing proudly beside a friendly long-necked dinosaur, a mustached explorer in a pith helmet appears in two nearly identical antique photographs mounted side by side on a curved card. No readable text or logo.",
      'A crowd gathers around a crashed moon rocket in a Victorian park, doubled on a buff card. No readable text or logo.',
    ]),
    study('Magic Lantern Slide', 'glass painted lantern slide', 'magic-lantern', {
      aesthetic: 'Magic lantern slide: hand-painted glass slides for antique projectors, glowing transparent colors inside a round black mask on glass.',
      subject_treatment: `${keep}; paint the subject as a glowing transparent scene inside a round mask.`,
      color_and_tone: 'Luminous transparent reds, blues and yellows glowing against black.',
      lighting_and_shadow: 'Light shining through the painted glass from behind.',
      texture_and_material: 'Painted glass, brush strokes in transparent paint, round black mask and slide frame.',
      camera_and_composition: 'Circular scene centered in a rectangular glass slide.',
      atmosphere_and_mood: 'Keep the requested mood with magical theatrical wonder.',
      rendering_and_quality: "Glowing transparent painting with delicate hand-made imperfections, kept consistent across the whole image.",
      key_features: 'painted glass slide; round black mask; backlit glow; transparent color',
    }, [], [
      'A comet with a smiling face streaks past a ringed planet, glowing in transparent paint inside the round mask of a hand-painted glass slide. No readable text or logo.',
      "Rising slowly from a moonlit graveyard, a sheet-draped ghost glows in luminous transparent blue on an antique glass lantern slide, with painted gravestones and a surprised owl. No readable text or logo.",
      "Balancing on a striped ball in a circus ring, an elephant in a jeweled headdress glows red and gold through hand-painted glass, projected onto a dark velvet curtain. No readable text or logo.",
    ]),
    study('Victorian Die-Cut Scrap', 'embossed die-cut paper scraps', 'die-cut-scrap', {
      aesthetic: 'Victorian die-cut scrap: glossy embossed paper cutouts of angels, animals and flowers, printed in rich colors and trimmed with shaped edges.',
      subject_treatment: `${keep}; present the subject as a glossy embossed paper cutout with a shaped outline.`,
      color_and_tone: 'Rich saturated reds, pinks, greens and gold with glossy sheen.',
      lighting_and_shadow: "Soft light raking across embossed relief, kept consistent across the whole image.",
      texture_and_material: 'Embossed paper relief, glossy varnish, die-cut edges and paper backing.',
      camera_and_composition: 'Cutout figures arranged or overlapping on a plain ground.',
      atmosphere_and_mood: 'Keep the requested mood with sweet sentimental charm.',
      rendering_and_quality: 'Crisp printed detail with believable embossing and cut edges.',
      key_features: 'embossed paper cutout; glossy print; die-cut edges; sentimental motifs',
    }, [], [
      'A cherub-cheeked bulldog in a sailor suit is printed as a glossy embossed die-cut scrap, its shaped edges casting a small shadow on the album page. No readable text or logo.',
      'A bouquet of roses with a tiny dragon hidden among the petals is trimmed as an embossed paper scrap. No readable text or logo.',
      "Among shiny embossed scraps pasted in an old album, a pair of kittens in a basket have noticed that one of the other scraps is a very hungry-looking fox. No readable text or logo.",
    ]),
    study('Retro Gum-Card Monsters', 'bubblegum trading card monsters', 'gum-card', {
      aesthetic: 'Retro gum-card monsters: wacky painted monster cards like old bubblegum trading cards, garish colors, gross-out humor without gore and bold painted borders.',
      subject_treatment: `${keep}; paint the subject as a garish comic monster portrait inside a bold border.`,
      color_and_tone: 'Garish lime, purple, orange and hot pink with bold primaries.',
      lighting_and_shadow: "Dramatic comic lighting with glossy highlights, kept consistent across the whole image.",
      texture_and_material: 'Painted slime, warts, bulging eyes and printed card grain.',
      camera_and_composition: 'Close portrait with a thick colored border around the image.',
      atmosphere_and_mood: 'Keep the requested mood with silly gross-out fun.',
      rendering_and_quality: 'Vivid painted card art without gore, crisp and funny.',
      key_features: 'wacky monster portrait; garish colors; bold border; gross-out humor',
    }, ['gore', 'readable card text'], [
      'A slimy green swamp monster grins while wearing a party hat, painted like an old bubblegum trading card with a thick purple border. No readable text or logo.',
      "Rising from a steaming plate, a monster made of spaghetti waves its noodle arms while its meatball eyes bulge and a single parmesan tooth drips sauce onto the tablecloth. No readable text or logo.",
      "Standing at a cracked bathroom mirror, a warty troll brushes his one enormous tooth with a toilet brush, foam dripping down his chin while a terrified rubber duck watches. No readable text or logo.",
    ]),
    study('Postage Stamp Miniature', 'engraved stamp-sized illustration', 'stamp-miniature', {
      aesthetic: 'Postage stamp miniature: tiny engraved and color-printed stamp-sized images with perforated edges, crisp detail and a small framed border without lettering.',
      subject_treatment: `${keep}; render the subject as a tiny engraved stamp image with perforated edges.`,
      color_and_tone: 'Limited printed colors such as carmine, ultramarine and olive.',
      lighting_and_shadow: "Fine engraved shading with crisp small highlights, kept consistent across the whole image.",
      texture_and_material: 'Perforated edges, fine engraving, gum paper and slight cancellation smudges.',
      camera_and_composition: 'Small vertical or horizontal stamp format with a framed border.',
      atmosphere_and_mood: "Keep the requested mood with collectible precision, kept consistent across the whole image.",
      rendering_and_quality: "Crisp miniature engraving with authentic perforations, kept consistent across the whole image.",
      key_features: 'perforated edges; engraved miniature; framed border; limited colors',
    }, ['readable denomination or country'], [
      'A proud goose in a crown poses on a tiny engraved stamp with carmine borders and perforated edges, a faint cancellation smudge across one corner. No readable text or logo.',
      "Engraved in deep ultramarine on a stamp-sized card with perforated edges, a lighthouse clings to a jagged cliff as a storm wave curls higher than its lamp. No readable text or logo.",
      "Coiled around a snowy mountain on a tiny olive-green stamp, a long sea serpent rests its head on the summit, engraved in fine lines inside a perforated border. No readable text or logo.",
    ]),
    study('Enamel Tin Sign Art', 'vintage enamel metal sign illustration', 'enamel-sign', {
      aesthetic: 'Enamel tin sign art: bold simple illustrations fired on enamel metal signs, glossy flat colors, chipped edges and rust spots without any lettering.',
      subject_treatment: `${keep}; illustrate the subject in bold flat enamel colors on a metal sign.`,
      color_and_tone: 'Glossy cobalt, red, cream and yellow enamel with rust brown chips.',
      lighting_and_shadow: 'Glossy reflections on enamel with flat illustrated shading.',
      texture_and_material: 'Chipped enamel, rust spots, rivet holes and bent metal edges.',
      camera_and_composition: "Centered emblem-like illustration on a rectangular sign, kept consistent across the whole image.",
      atmosphere_and_mood: 'Keep the requested mood with nostalgic roadside charm.',
      rendering_and_quality: "Clean bold enamel illustration with believable wear, kept consistent across the whole image.",
      key_features: 'glossy enamel colors; chipped edges; rust spots; rivet holes',
    }, ['readable advertising text'], [
      'A smiling moon holding a mug of cocoa beams from a chipped cobalt enamel sign with rust spots at every rivet hole. No readable text or logo.',
      "On a battered red and cream enamel sign, a galloping horse carries a mail sack so overstuffed that letters stream behind it like a comet tail, rust eating one corner. No readable text or logo.",
      "Shining on a glossy yellow enamel panel with chipped corners and rusty screw holes, a friendly bee in overalls holds up a dripping honey pot and tips an imaginary hat. No readable text or logo.",
    ]),
    study('Lithographed Tin Lid', 'decorated tin box lid', 'tin-lid', {
      aesthetic: 'Lithographed tin lid: decorative scenes printed on old biscuit or candy tin lids, rich colors wrapping over rounded edges with ornamental borders and slight scratches.',
      subject_treatment: `${keep}; print the subject as a decorative scene on a round or square tin lid.`,
      color_and_tone: 'Rich printed reds, greens, golds and creams with metallic sheen.',
      lighting_and_shadow: "Metallic reflections on the curved lid edge, kept consistent across the whole image.",
      texture_and_material: 'Printed tin surface, rolled edges, scratches and ornamental borders.',
      camera_and_composition: 'Top-down view of the lid with the scene inside a border.',
      atmosphere_and_mood: 'Keep the requested mood with cozy holiday nostalgia.',
      rendering_and_quality: 'Crisp printed detail with believable tin sheen and wear.',
      key_features: 'printed tin lid; rolled edge; ornamental border; metallic sheen',
    }, ['readable brand text'], [
      'A snowy village with a giant sleeping bear curled around the church is printed on a round biscuit tin lid with a gold ornamental border. No readable text or logo.',
      "Sailing a teacup ship across a square candy tin, a pair of pirate cats in bandanas point a spyglass toward a sugar-cube island, printed in bright lithographed colors on metal. No readable text or logo.",
      "Marching around the rim of a scratched red tin lid, a circus parade of elephants, clowns and a unicyclist bear circles a painted ringmaster standing in the center. No readable text or logo.",
    ]),
    study('Matchbook Cover Miniature', 'tiny vintage matchbook art', 'matchbook-cover', {
      aesthetic: 'Matchbook cover miniature: tiny bold graphic illustrations from old matchbooks, simple flat colors, strong silhouettes and a slightly worn cardboard fold.',
      subject_treatment: `${keep}; draw the subject as a tiny bold graphic on a matchbook cover.`,
      color_and_tone: 'Two or three flat bold colors such as red, black and cream.',
      lighting_and_shadow: "Flat graphic shapes with simple shadow blocks, kept consistent across the whole image.",
      texture_and_material: 'Cardboard grain, printed flat color, fold crease and worn corners.',
      camera_and_composition: 'Small vertical format with a centered bold emblem.',
      atmosphere_and_mood: 'Keep the requested mood with retro nightlife charm.',
      rendering_and_quality: "Crisp simplified graphic with authentic printed wear, kept consistent across the whole image.",
      key_features: 'tiny bold graphic; flat colors; cardboard fold; worn corners',
    }, ['readable text'], [
      'A dancing flamingo in a top hat struts across a tiny red and black matchbook cover, the cardboard worn soft at the fold. No readable text or logo.',
      "On a cream and teal matchbook cover, a cocktail glass holds a tiny sea monster lounging on the olive like a pool float, one tentacle raised for another round. No readable text or logo.",
      "Grinning from a scuffed and bent matchbook cover, a crescent moon wearing sunglasses lounges in a hammock strung between two stars, a cocktail balanced on its tip. No readable text or logo.",
    ]),
  ],
};

export default spec;
