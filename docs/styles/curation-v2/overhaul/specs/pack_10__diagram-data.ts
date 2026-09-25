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
        'Circuit-board illustration of a dragon whose body is formed by copper traces and chip pads on green solder mask, unreadable silkscreen marks. No text or logo.',
        'Circuit-board illustration of a galloping horse and rider laid out as green solder mask, copper traces flowing along the mane, round pads for joints and tiny resistor components forming the saddle. No readable text or logo.',
        'Circuit-board illustration of a hummingbird at a flower, copper traces fanning into its wings, gold pads for the eye and a microchip hidden in the blossom on a dark blue board. No readable text or logo.',
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
        'Topographic map illustration where a sleeping giant forms a mountain range in nested contour lines, green lowland tints rising to brown and white peaks along his shoulders and nose. No readable text or logo.',
        'Topographic map of a volcanic island shaped like a curled cat, tight contour lines around the ears, blue depth tints in the surrounding sea and a hachured crater at its eye. No readable text or logo.',
        'Topographic map of a human hand pressed into a landscape, knuckles as ridges and palm lines as valleys, contour intervals and pale elevation tints from green to ochre. No readable text or logo.',
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
        'Decorative non-scannable QR-style module grid forming the silhouette of a lighthouse, black square modules dense at the tower and sparse in the sky, three finder squares as windows. No text or logo.',
        'Decorative non-scannable QR-style module grid forming a running fox, orange and black square modules with finder squares placed as its eye and paws on white. No text or logo.',
        'Decorative non-scannable QR-style module grid forming a sailboat on waves, navy modules packed into the hull and scattered for the spray on a cream ground. No text or logo.',
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
        'Blueprint of a siege dragon-catapult with white orthographic lines and dimension arrows on blue, unreadable marks. No text or logo.',
        'Blueprint of a medieval trebuchet in white technical lines on Prussian blue paper, side and front elevations, dimension arrows and a section through the counterweight box. No readable text or logo.',
        'Blueprint of a lighthouse lantern room in white lines on blue paper, plan and elevation views, dimension lines around the lens and a detail circle on the stair. No readable text or logo.',
      ],
    },
    'SP10-077': {
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
        'Chalkboard drawing of a frog anatomy lesson with arrows, circles and unreadable scribbled notes, smudged white and yellow chalk and eraser ghosts of an earlier diagram. No text or logo.',
        'Chalkboard drawing of a bicycle explained with arrows, gear circles and scribbles, colored chalk on the chain and spokes, smudges where a hand wiped. No readable text or logo.',
        'Chalkboard drawing of a football play diagram with circles, crosses and curving arrows over a hand-drawn pitch, dusty chalk and eraser streaks. No readable text or logo.',
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
        'Transit-map diagram of an invented kingdom where colored routes run at 45 and 90 degrees between towns, forests and a mountain lair, station dots and white interchange rings. No readable text or logo.',
        'Transit-map diagram whose colored lines together form the silhouette of a running deer, station dots along the legs and interchange rings at the joints. No readable text or logo.',
        'Transit-map diagram of a cathedral floor plan where colored lines trace the aisles, nave and chapels, station dots at each altar. No readable text or logo.',
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
        'Isotype chart comparing a village population as rows of repeated flat pictograms of farmers, cows and sheep in muted red, black and ochre on cream. No readable text or logo.',
        'Isotype chart of ships in a harbor as rows of repeated flat pictograms, sailboats, steamers and rowboats in clean navy and orange silhouettes. No readable text or logo.',
        'Isotype chart of sheep and wolves on two hills as rows of flat repeated pictograms, the wolf row short and dark, the sheep rows long and white. No readable text or logo.',
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
        "Flowchart illustration of a traveler's journey with boxes, decision diamonds and arrows, a tiny picture of a crossroads, a river and a mountain inside each node. No readable text or logo.",
        'Flowchart illustration of a potion recipe with boxes and diamonds, small pictures of herbs, a cauldron and a bubbling flask, arrows looping back on failure. No readable text or logo.',
        "Flowchart illustration of a cat's morning routine with boxes for sleep, food and window, decision diamonds and curving arrows between tiny doodles. No readable text or logo.",
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
        'Star chart with a winged serpent constellation drawn over a gold coordinate grid on deep blue, star dots sized by brightness and thin constellation lines. No readable text or logo.',
        'Star chart with an archer constellation over a curved coordinate grid, fine gold lines linking stars and a faint Milky Way band. No readable text or logo.',
        'Star chart of a crown constellation circled by faint star fields, gold dots and thin lines on midnight blue with a coordinate ring. No readable text or logo.',
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
        'Weather isobar map where a deep storm system spirals over the sea, tightly packed isobars, cold and warm front symbols and high-pressure cells over the land. No readable text or logo.',
        'Weather isobar map of a heat wave over a continent, widely spaced isobars, a large high cell and occluded front symbols along the coast. No readable text or logo.',
        'Weather isobar map of a winter blizzard with dense isobars and a line of triangular cold-front symbols sweeping across mountains. No readable text or logo.',
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
        'Sankey-style diagram where flowing bands of varying width form a river delta, one wide band splitting into narrower channels that merge again before the sea. No readable text or logo.',
        'Sankey-style diagram of a harvest where bands of grain, fruit and milk flow from farms into a market, widths showing quantity in warm colors. No readable text or logo.',
        'Sankey-style diagram whose splitting and merging bands form the branches of a tree, thick at the trunk and thin at the twigs in green and gold. No readable text or logo.',
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
        'Genealogy tree of a seafaring family with small painted portrait medallions on parchment, branches spreading from a founding couple, ribbons and tiny ship icons. No readable text or logo.',
        'Genealogy tree of a family of bakers with portrait medallions and tiny bread icons, branching lineage on cream paper with ink vines. No readable text or logo.',
        'Genealogy tree of a witch coven with painted medallions of women and their familiars, branching in dark ink on aged parchment. No readable text or logo.',
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
        'Nautical chart of an island shaped like a sleeping sea serpent, compass roses and rhumb lines. No readable text or logo.',
        'Nautical chart of a rocky archipelago with depth soundings as dots, compass roses, rhumb lines and a wreck symbol near the reef, pale blue shallows. No readable text or logo.',
        'Nautical chart of a bay where a kraken is drawn rising among the depth soundings, compass rose and rhumb lines crossing its tentacles. No readable text or logo.',
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
        'Mind map with a sleeping cat at the center and radiating branches of doodled ideas, a fish, a sunbeam, a yarn ball and a window, colored pencil lines. No readable text or logo.',
        "Mind map of a wizard's plans with a hat at the center and branches of doodled potions, stars, books and a broom, colored ink on grid paper. No readable text or logo.",
        'Mind map for a summer trip with a suitcase at the center and branches to a beach, mountains, a train and ice cream doodles. No readable text or logo.',
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
        'Orbital diagram where moons circle a crowned sun in precise concentric ellipses, dotted trajectory arcs and small comets crossing on inclined orbits. No readable text or logo.',
        'Orbital diagram of an atom drawn like a solar system, electrons on tilted ellipses around a glowing nucleus, fine arcs and dots. No readable text or logo.',
        'Orbital diagram of a space station with docking ships on transfer arcs around a blue planet, ellipses and trajectory lines. No readable text or logo.',
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
        'Treasure map on stained parchment with a dotted path to a skull-shaped mountain and a sea serpent. No readable text or logo.',
        'Treasure map of a jungle island on stained parchment with a dotted path through ruins, an X under a waterfall and a sea serpent in the margin. No readable text or logo.',
        'Treasure map of a desert canyon with dotted paths, a skull rock landmark, a buried X and compass rose in faded ink. No readable text or logo.',
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
        'Wiring schematic illustration of a clockwork bird with resistor, switch and capacitor symbols connected by right-angle wires tracing its wings and body. No readable text or logo.',
        "Wiring schematic of a lighthouse lamp with right-angle wires, switch symbols and nodes arranged into the tower's silhouette. No readable text or logo.",
        'Wiring schematic of a music box with right-angle lines, resistor zigzags and a coil shaped like its winding key. No readable text or logo.',
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
        'Heatmap grid where hot red and orange cells form a volcano erupting against cool blue cells, a clean square grid with sharp cell edges. No readable text or logo.',
        'Heatmap grid where warm cells trace a running figure across a cold field, gradient from blue to yellow to red. No readable text or logo.',
        'Heatmap grid of a city map where hot cells glow at the market and harbor, cool blue at the parks. No readable text or logo.',
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
        'Sunburst chart forming a rose window, concentric rings of segments in jewel colors radiating from a small central emblem, thin white gaps between segments. No readable text or logo.',
        'Sunburst chart shaped like the iris of an eye, segments of amber and green radiating from a black center with fine white separators. No readable text or logo.',
        'Sunburst chart of a sunflower head, rings of yellow and brown segments radiating outward, outer petals as the last ring. No readable text or logo.',
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
        'Isometric cutaway diagram of a mountain monastery revealing its cellars, kitchens, library and bell tower, callout lines pointing to tiny monks at work. No readable text or logo.',
        'Isometric cutaway diagram of a whale showing its skeleton, stomach and lungs with callout lines on a pale blue ground. No readable text or logo.',
        'Isometric cutaway of a windmill showing gears, millstones and flour sacks on each floor, callout lines and a tiny miller. No readable text or logo.',
      ],
    },
  ] satisfies Create[],
};

export default spec;
