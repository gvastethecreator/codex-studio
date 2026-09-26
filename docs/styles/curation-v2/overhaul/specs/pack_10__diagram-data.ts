import type { Create, Dna, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';

// Diagram & data profiles: illustrative visual languages only. No real data, working codes,
// measurements or readable labels — marks stand in for text.
const AVOID = [
  ...STYLE_AVOID,
  'readable labels or numbers',
  'scannable or functional code',
  'claims of accurate measurement',
];

const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
const pad = (t: string, min: number, tail: string) =>
  words(t) < min ? `${t.replace(/\.$/, '')}, ${tail}` : t;

function diagram(
  aesthetic: string,
  construction: string,
  color: string,
  texture: string,
  mood: string,
  key: string,
): Dna {
  return {
    aesthetic,
    subject_treatment: `Present the prompt's subject as an illustrative diagram in this visual language, keeping it recognizable; labels are unreadable marks and nothing claims to be real data: ${construction}`,
    color_and_tone: pad(color, 9, 'following the conventions of this diagram language.'),
    lighting_and_shadow:
      'Flat diagrammatic presentation with no dramatic lighting, unless the medium implies a surface such as paper or chalk.',
    texture_and_material: pad(texture, 9, 'as the medium the diagram is drawn or printed on.'),
    camera_and_composition:
      'Diagram layout with clear hierarchy, legend-like zones and the subject as the central readable figure.',
    atmosphere_and_mood: pad(mood, 8, 'coming from the diagram language.'),
    rendering_and_quality:
      'Clean, precise diagram rendering with consistent line weights and no random marks.',
    key_features: `${key}; illustrative only`,
  };
}

const spec: Spec = {
  pack: 'pack_10',
  category: '7. Diagram And Data Systems',
  updates: {
    'SP10-067': {
      name: 'Circuit Board Layout',
      dna: diagram(
        'Circuit board: the subject laid out as copper traces, pads and components on a PCB.',
        "the subject's silhouette is formed by copper traces, vias and chip pads on green solder mask.",
        'Green solder mask, copper gold and white silkscreen marks.',
        'PCB substrate with traces and pads.',
        'Technical, intricate, electric and precise.',
        'copper traces; vias; component pads',
      ),
      avoid: AVOID,
      briefs: [
        "A coiled serpent is laid out across green solder mask, its body a bundle of copper traces and its eyes two tiny gold pads glinting under a lamp. No readable text or logo.",
        "A galloping horse and rider run across a green board, copper traces flowing along the mane and round pads marking every hoofbeat. No readable text or logo.",
        "A hummingbird drinks from a flower as copper traces fan out into its wings, a single black chip hidden where its heart should be. No readable text or logo.",
      ],
    },
    'SP10-068': {
      dna: diagram(
        'Topographic map: the subject described by contour lines and elevation tints.',
        'the subject is drawn as nested contour lines with hypsometric tints.',
        'Contour browns with elevation greens and tans.',
        'Paper map with contour lines.',
        'Exploratory, calm, precise and geographic.',
        'nested contours; elevation tints',
      ),
      avoid: AVOID,
      briefs: [
        "A sleeping giant forms an entire mountain range in nested contour lines, green lowland tints rising to brown peaks at his knees and nose. No readable text or logo.",
        "A volcanic island shaped like a curled cat is mapped in tight contour lines around its ears, blue depth tints circling the shore. No readable text or logo.",
        "A human hand pressed into the land becomes terrain, knuckles as ridges and palm creases as winding valleys between pale elevation tints. No readable text or logo.",
      ],
    },
    'SP10-069': {
      dna: diagram(
        'QR-style pattern: square module grid inspired by QR codes, decorative and non-scannable.',
        'the subject is built from black square modules with finder-like corner squares, deliberately non-functional.',
        'Black modules on white.',
        'Square pixel modules.',
        'Digital, graphic, cryptic and modern.',
        'square module grid; decorative finder squares',
      ),
      avoid: AVOID,
      briefs: [
        "A lighthouse silhouette is built from a decorative grid of square black modules, dense at the tower and sparse where the beam fades into the night. No readable text or logo.",
        "A running fox emerges from orange and black square modules, the three corner finder squares placed as its eye, paw and tail tip. No readable text or logo.",
        "A sailboat on waves is packed from navy square modules, dense in the hull and scattered loosely where the spray flies off. No readable text or logo.",
      ],
    },
    'SP10-076': {
      dna: diagram(
        'Blueprint: white technical line drawing on blue paper with dimension lines.',
        'the subject is drawn in white orthographic lines with dimension arrows on blue.',
        'Prussian blue with white lines.',
        'Blueprint paper with grid.',
        'Technical, engineered, precise and calm.',
        'white lines on blue; dimension arrows',
      ),
      avoid: AVOID,
      briefs: [
        "A siege engine shaped like a crouching beast is drawn in white orthographic lines on deep blue paper, dimension arrows measuring its jaws. No readable text or logo.",
        "A trebuchet appears in white technical lines on Prussian blue, side and front elevations aligned with dimension arrows and one section cut. No readable text or logo.",
        "A lighthouse lantern room is drawn in plan and elevation on blue paper, dimension lines circling the giant lens like orbits. No readable text or logo.",
      ],
    },
    'SP10-077': {
      name: 'Chalkboard Diagram',
      dna: diagram(
        'Chalkboard art: chalk drawing on a slate board with smudges and hand-drawn diagram marks.',
        'the subject is chalk-drawn with arrows, circles and underlines on slate.',
        'White and pastel chalk on dark slate.',
        'Chalk strokes and smudges.',
        'Educational, handmade, charming and nostalgic.',
        'chalk strokes; slate; smudges',
      ),
      avoid: AVOID,
      briefs: [
        "A frog anatomy lesson fills a dark slate board with arrows, circles and scribbled marks in smudged white and yellow chalk, eraser ghosts behind. No readable text or logo.",
        "A bicycle is explained on a school board with arrows, gear circles and colored chalk on the chain, smudged where a sleeve brushed past. No readable text or logo.",
        "A football play is sketched on a dusty board in circles, crosses and curving arrows over a hand-drawn pitch, the coach's handprint in the corner. No readable text or logo.",
      ],
    },
  },
  creates: [
    {
      name: 'Transit Map Diagram',
      domain: 'schematic transit map',
      tags: ['transit-map', 'schematic', 'diagram'],
      dna: diagram(
        'Transit map: colored lines at 45° and 90° with station dots and interchange rings.',
        'the subject is abstracted into colored routes with station dots.',
        'Bright route colors on white.',
        'Clean schematic lines.',
        'Orderly, modern, clear and urban.',
        '45-degree routes; station dots',
      ),
      avoid: AVOID,
      briefs: [
        "An invented kingdom is mapped as colored routes running at 45 and 90 degrees between towns, forests and a mountain lair, with interchange rings at every castle. No readable text or logo.",
        "Colored route lines bend together to form the silhouette of a running deer, station dots marching down its legs and an interchange ring for its eye. No readable text or logo.",
        "A cathedral floor plan is traced as a network map, colored lines running down the aisles and nave with a station dot at every altar. No readable text or logo.",
      ],
    },
    {
      name: 'Isotype Pictograms',
      domain: 'isotype pictogram charts',
      tags: ['isotype', 'pictogram', 'diagram'],
      dna: diagram(
        'Isotype: rows of repeated flat pictograms showing quantities.',
        'the subject is shown as repeated flat pictogram units in rows.',
        'Few flat colors.',
        'Flat printed pictograms.',
        'Clear, didactic, modernist and friendly.',
        'repeated pictograms; rows',
      ),
      avoid: AVOID,
      briefs: [
        "A village population is counted in rows of repeated flat pictograms of farmers, cows and sheep in muted red, black and ochre. No readable text or logo.",
        "Ships in a harbor line up as rows of flat pictograms, sailboats, steamers and rowboats in clean navy and orange silhouettes. No readable text or logo.",
        "Sheep and wolves on two hills are compared as rows of repeated figures, the wolf row short and dark and the sheep rows long and pale. No readable text or logo.",
      ],
    },
    {
      name: 'Flowchart Nodes',
      domain: 'flowchart diagram',
      tags: ['flowchart', 'nodes', 'diagram'],
      dna: diagram(
        'Flowchart: boxes, diamonds and arrows connecting steps.',
        "the subject's parts become connected nodes and decision diamonds.",
        'Pastel boxes with dark lines.',
        'Clean vector shapes.',
        'Logical, playful, clear and structured.',
        'boxes; diamonds; arrows',
      ),
      avoid: AVOID,
      briefs: [
        "A traveler's journey unfolds as boxes, decision diamonds and arrows, tiny pictures of a crossroads, a river and a dragon's cave along the way. No readable text or logo.",
        "A potion recipe runs through boxes and diamonds with little pictures of herbs, a cauldron and a bubbling flask, one arrow looping back in failure. No readable text or logo.",
        "A cat's entire morning routine flows through boxes for sleep, food and window, every decision diamond eventually leading back to sleep. No readable text or logo.",
      ],
    },
    {
      name: 'Star Chart',
      domain: 'celestial star chart',
      tags: ['star-chart', 'celestial', 'diagram'],
      dna: diagram(
        'Star chart: constellation lines, star dots and coordinate grid on dark blue.',
        'the subject is drawn as a constellation over a celestial grid.',
        'Dark blue with gold and white stars.',
        'Engraved celestial chart.',
        'Mystical, navigational, calm and cosmic.',
        'constellation lines; coordinate grid',
      ),
      avoid: AVOID,
      briefs: [
        "A winged serpent constellation coils over a gold coordinate grid on deep blue, star dots sized by brightness and linked by thin lines. No readable text or logo.",
        "An archer constellation draws its bow across a curved coordinate grid, fine gold lines linking the stars beside a faint band of galaxy. No readable text or logo.",
        "A crown of stars floats in faint star fields, gold dots joined by thin lines on midnight blue inside a ring of coordinates. No readable text or logo.",
      ],
    },
    {
      name: 'Weather Isobar Map',
      domain: 'weather isobar chart',
      tags: ['isobar', 'weather', 'diagram'],
      dna: diagram(
        'Weather map: isobars, front symbols and pressure cells.',
        "the subject's shape is formed by isobars and front lines.",
        'White lines, blue and red fronts.',
        'Map base with isobars.',
        'Scientific, dynamic, clear and calm.',
        'isobars; front symbols',
      ),
      avoid: AVOID,
      briefs: [
        "A deep storm spirals over the sea in tightly packed isobars, cold and warm front symbols marching toward a nervous coastline. No readable text or logo.",
        "A heat wave smothers a continent in widely spaced isobars around one enormous high-pressure cell, occluded fronts crawling along the coast. No readable text or logo.",
        "A winter blizzard crosses the mountains as dense isobars and a line of triangular cold-front symbols sweeping forward like teeth. No readable text or logo.",
      ],
    },
    {
      name: 'Sankey Flow Diagram',
      domain: 'sankey flow diagram',
      tags: ['sankey', 'flow', 'diagram'],
      dna: diagram(
        'Sankey: flowing bands of varying width splitting and merging.',
        'flowing bands split and merge to form the subject.',
        'Soft gradient band colors.',
        'Smooth vector bands.',
        'Elegant, informative, flowing and calm.',
        'flowing bands; splits and merges',
      ),
      avoid: AVOID,
      briefs: [
        "Flowing bands of varying width form a river delta, one wide band splitting into narrower channels that merge again before the sea. No readable text or logo.",
        "A harvest flows from farms into a market as bands of grain, fruit and milk whose widths show how much each field gave. No readable text or logo.",
        "Splitting and merging bands form the branches of a tree, thick at the trunk and thinning to hairlines at every twig. No readable text or logo.",
      ],
    },
    {
      name: 'Genealogy Tree',
      domain: 'family tree diagram',
      tags: ['genealogy', 'tree', 'diagram'],
      dna: diagram(
        'Genealogy tree: branching lineage with portrait medallions.',
        'the subject becomes a branching family tree of medallions.',
        'Parchment with sepia and gold.',
        'Engraved lines on parchment.',
        'Heritage, royal, orderly and nostalgic.',
        'branching lineage; medallions',
      ),
      avoid: AVOID,
      briefs: [
        "A seafaring family spreads across parchment in small painted portrait medallions, branches reaching from a founding couple to a line of ship captains. No readable text or logo.",
        "A dynasty of bakers branches across cream paper, each portrait medallion framed with a tiny loaf and vines of ink between them. No readable text or logo.",
        "A coven's lineage grows in dark ink on aged parchment, each medallion showing a woman and her familiar, the oldest branch withered. No readable text or logo.",
      ],
    },
    {
      name: 'Nautical Chart',
      domain: 'nautical navigation chart',
      tags: ['nautical', 'chart', 'diagram'],
      dna: diagram(
        'Nautical chart: coastlines, depth soundings as dots, compass roses and rhumb lines.',
        'the subject becomes a coastline with rhumb lines and compass roses.',
        'Pale blue sea, buff land, sepia lines.',
        'Engraved chart paper.',
        'Adventurous, navigational, antique and calm.',
        'compass roses; rhumb lines',
      ),
      avoid: AVOID,
      briefs: [
        "An island shaped like a sleeping sea serpent sits among compass roses and crossing rhumb lines, depth soundings dotted along its spine. No readable text or logo.",
        "A rocky archipelago is charted with depth soundings as dots, compass roses, rhumb lines and a small wreck symbol near the reef on pale blue. No readable text or logo.",
        "In a quiet bay a kraken rises among the depth soundings, compass rose and rhumb lines crossing straight through its tentacles. No readable text or logo.",
      ],
    },
    {
      name: 'Mind Map Web',
      domain: 'radial mind map',
      tags: ['mind-map', 'radial', 'diagram'],
      dna: diagram(
        'Mind map: a central node with radiating branches and doodle icons.',
        'the subject is at the center with radiating branches of related doodles.',
        'Colorful branches on white.',
        'Hand-drawn marker lines.',
        'Creative, energetic, playful and personal.',
        'central node; radiating branches',
      ),
      avoid: AVOID,
      briefs: [
        "A sleeping cat sits at the center of radiating branches of doodled ideas, a fish, a sunbeam, a ball of yarn and an open window, in colored ink. No readable text or logo.",
        "A wizard's plans radiate from a pointed hat into doodled potions, stars, books and a broom, colored ink scrawled over grid paper. No readable text or logo.",
        "A summer trip branches from a suitcase at the center toward doodles of a beach, mountains, a night train and a dripping ice cream. No readable text or logo.",
      ],
    },
    {
      name: 'Orbital Diagram',
      domain: 'orbital mechanics diagram',
      tags: ['orbital', 'celestial', 'diagram'],
      dna: diagram(
        'Orbital diagram: concentric ellipses, bodies and trajectory arcs.',
        'the subject sits at the center of concentric orbits with small bodies.',
        'Black lines on cream or white on navy.',
        'Precise ellipses.',
        'Scientific, cosmic, orderly and calm.',
        'concentric ellipses; trajectories',
      ),
      avoid: AVOID,
      briefs: [
        "Moons circle a crowned sun in precise concentric ellipses, dotted trajectory arcs and small comets crossing on slanted paths. No readable text or logo.",
        "An atom is drawn like a tiny solar system, electrons on tilted ellipses around a glowing nucleus traced in fine arcs and dots. No readable text or logo.",
        "A space station hangs above a blue planet as docking ships follow transfer arcs between nested ellipses. No readable text or logo.",
      ],
    },
    {
      name: 'Treasure Map',
      domain: 'hand-drawn treasure map',
      tags: ['treasure-map', 'hand-drawn', 'diagram'],
      dna: diagram(
        'Treasure map: hand-drawn parchment map with dotted paths, X marks and sea monsters.',
        'the subject is drawn as a landmark on a hand-drawn treasure map.',
        'Sepia ink on aged parchment.',
        'Stained parchment, ink.',
        'Adventurous, playful, antique and mysterious.',
        'dotted path; X mark; aged parchment',
      ),
      avoid: AVOID,
      briefs: [
        "On stained parchment a dotted path winds toward a skull-shaped mountain while a sea serpent guards the coast with one eye open. No readable text or logo.",
        "A jungle island unfolds on stained parchment, a dotted path through ruins leading to an X hidden behind a waterfall. No readable text or logo.",
        "A desert canyon is mapped in faded ink with dotted paths, a skull rock landmark, a compass rose and a buried X under a lone cactus. No readable text or logo.",
      ],
    },
    {
      name: 'Wiring Schematic',
      domain: 'electrical schematic',
      tags: ['schematic', 'wiring', 'diagram'],
      dna: diagram(
        'Wiring schematic: symbols for resistors, switches and nodes connected by right-angle lines.',
        'the subject is abstracted into schematic symbols and wires.',
        'Black lines on white.',
        'Clean vector schematic.',
        'Technical, precise, clever and clean.',
        'schematic symbols; right-angle wires',
      ),
      avoid: AVOID,
      briefs: [
        "A clockwork bird is traced by resistor, switch and capacitor symbols connected with right-angle wires that follow its outline. No readable text or logo.",
        "A lighthouse lamp is wired in right-angle lines, switch symbols and nodes arranged to form the tower's silhouette. No readable text or logo.",
        "A music box is diagrammed in right-angle lines and resistor zigzags, a coil symbol shaped exactly like its winding key. No readable text or logo.",
      ],
    },
    {
      name: 'Heatmap Grid',
      domain: 'heatmap grid',
      tags: ['heatmap', 'grid', 'diagram'],
      dna: diagram(
        'Heatmap: grid cells colored from cool to hot values.',
        'the subject emerges from a grid of cool-to-hot colored cells.',
        'Blue to yellow to red.',
        'Flat grid cells.',
        'Analytical, bold, vivid and clear.',
        'cool-to-hot grid cells',
      ),
      avoid: AVOID,
      briefs: [
        "Hot red and orange cells form a volcano erupting against cool blue cells, every square of the grid sharp-edged and flat. No readable text or logo.",
        "Warm cells trace a running figure across a cold field of blue, the gradient heating from yellow to red at her feet. No readable text or logo.",
        "A city map glows hot at the market and harbor and cools to blue over the parks, all in crisp square cells. No readable text or logo.",
      ],
    },
    {
      name: 'Radial Sunburst Chart',
      domain: 'sunburst chart',
      tags: ['sunburst', 'radial', 'diagram'],
      dna: diagram(
        'Sunburst chart: concentric rings of segments radiating from a center.',
        'the subject is abstracted into concentric segmented rings.',
        'Harmonious segment colors.',
        'Flat vector rings.',
        'Structured, radial, vivid and clean.',
        'concentric segment rings',
      ),
      avoid: AVOID,
      briefs: [
        "Concentric rings of jewel-colored segments radiate from a small center into a rose window, thin white gaps between every slice. No readable text or logo.",
        "Rings of amber and green segments radiate from a black center to become the iris of an enormous eye. No readable text or logo.",
        "Rings of yellow and brown segments radiate outward into a sunflower head, the outer petals forming the last ring. No readable text or logo.",
      ],
    },
    {
      name: 'Cutaway Isometric Diagram',
      domain: 'isometric cutaway diagram',
      tags: ['cutaway', 'isometric', 'diagram'],
      dna: diagram(
        'Isometric cutaway: the subject shown in isometric with sections removed to reveal inner parts and callout marks.',
        'the subject is shown isometric with cutaway sections and callout lines.',
        'Clean flat colors with white.',
        'Vector isometric shading.',
        'Explanatory, clever, detailed and clear.',
        'isometric cutaway; callout lines',
      ),
      avoid: AVOID,
      briefs: [
        "A mountain monastery is sliced open in isometric view, revealing cellars, kitchens, library and bell tower, with callout lines pointing to tiny monks. No readable text or logo.",
        "A whale is cut open in isometric view on pale blue, its skeleton, stomach and lungs labeled only by callout lines and dots. No readable text or logo.",
        "A windmill is sectioned floor by floor to show gears, millstones and flour sacks, a tiny miller asleep on the top landing. No readable text or logo.",
      ],
    },
  ] satisfies Create[],
};

export default spec;
