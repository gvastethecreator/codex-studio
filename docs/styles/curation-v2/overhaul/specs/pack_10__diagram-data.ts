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
        'Circuit-board knight on horseback. No readable text or logo.',
        'Circuit-board castle. No readable text or logo.',
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
        'Topographic map illustration where a sleeping dragon forms a mountain range in nested contour lines. No readable text or logo.',
        'Topographic map of a crowned skull island. No readable text or logo.',
        "Topographic map of a knight's helmet as terrain. No readable text or logo.",
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
        "Decorative non-scannable QR-style module grid forming a knight's helmet silhouette. No text or logo.",
        'QR-style module dragon. No text or logo.',
        'QR-style module castle. No text or logo.',
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
        'Blueprint knight armor. No readable text or logo.',
        'Blueprint castle gate. No readable text or logo.',
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
        'Chalkboard drawing of a dragon anatomy lesson with arrows and circles, unreadable scribbles. No text or logo.',
        'Chalkboard knight. No readable text or logo.',
        'Chalkboard castle siege plan. No readable text or logo.',
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
        'Transit-map diagram of a kingdom where colored routes connect castles, forests and a dragon lair, station dots and rings. No readable text or logo.',
        'Transit map dragon silhouette. No readable text or logo.',
        'Transit map of a cathedral. No readable text or logo.',
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
        'Isotype chart of knights, horses and dragons as rows of repeated flat pictograms. No readable text or logo.',
        'Isotype castle chart. No readable text or logo.',
        'Isotype sheep and wolves. No readable text or logo.',
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
        "Flowchart illustration of a knight's quest with boxes, decision diamonds and arrows, small pictures in each node. No readable text or logo.",
        'Flowchart of a potion recipe. No readable text or logo.',
        "Flowchart of a dragon's day. No readable text or logo.",
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
        'Star chart with a dragon constellation over a gold coordinate grid on deep blue. No readable text or logo.',
        'Star chart knight constellation. No readable text or logo.',
        'Star chart crown. No readable text or logo.',
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
        'Weather isobar map where a storm system forms a dragon spiral with front symbols. No readable text or logo.',
        'Isobar knight. No readable text or logo.',
        'Isobar castle. No readable text or logo.',
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
        "Sankey-style diagram where flowing bands form a dragon's tail splitting into rivers. No readable text or logo.",
        'Sankey knight. No readable text or logo.',
        'Sankey tree. No readable text or logo.',
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
        'Genealogy tree of a royal dragon dynasty with small painted portrait medallions on parchment. No readable text or logo.',
        'Knight family tree. No readable text or logo.',
        'Witch coven lineage. No readable text or logo.',
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
        'Nautical chart knight. No readable text or logo.',
        'Nautical chart kraken. No readable text or logo.',
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
        'Mind map with a dragon at the center and radiating branches of doodled treasures, knights and caves. No readable text or logo.',
        'Wizard mind map. No readable text or logo.',
        'Castle mind map. No readable text or logo.',
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
        'Orbital diagram where moons and dragons circle a crowned sun in precise ellipses. No readable text or logo.',
        'Orbital knight helmet. No readable text or logo.',
        'Orbital castle. No readable text or logo.',
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
        'Treasure map of a castle. No readable text or logo.',
        'Treasure map dragon lair. No readable text or logo.',
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
        'Wiring schematic illustration of a clockwork dragon with symbols and right-angle wires. No readable text or logo.',
        'Schematic knight. No readable text or logo.',
        'Schematic castle. No readable text or logo.',
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
        'Heatmap grid where hot red cells form a dragon breathing fire. No readable text or logo.',
        'Heatmap knight. No readable text or logo.',
        'Heatmap castle. No readable text or logo.',
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
        'Sunburst chart forming a rose window with a knight at its center. No readable text or logo.',
        'Sunburst dragon eye. No readable text or logo.',
        'Sunburst crown. No readable text or logo.',
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
        'Isometric cutaway diagram of a castle revealing its dungeons, kitchens and dragon stable with callout lines. No readable text or logo.',
        'Cutaway dragon anatomy. No readable text or logo.',
        'Cutaway windmill. No readable text or logo.',
      ],
    },
  ] satisfies Create[],
};

export default spec;
