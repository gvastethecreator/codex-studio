import type { Spec } from '../tools/apply';
import { design } from './_design';

// Packaging & label design (part A): R-PKG-01..10. Requested brand names and copy stay exact; no invented
// legal, ingredient or certification text.
const K = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
) => design(name, domain, tag, 'packaging', fields, avoid, briefs, { text: true, source });

const NO_CLAIMS = 'invented ingredients, certifications or legal text';

const spec: Spec = {
  pack: 'pack_25',
  category: '7. Packaging & Label Design',
  newCategory: { id: 'packaging-and-label-design' },
  updates: {},
  creates: [
    K('R-PKG-01', 'Seam-Spanning Type', 'type wrapping across package faces', 'seam-spanning-type', {
      aesthetic: 'Seam-Spanning Type: the brand name crosses from one face of the package onto the next, staying readable across planned folds.',
      subject_treatment: "Run the prompt's requested name across authorized faces of the package with planned continuity, every character kept exact and the front still readable.",
      color_and_tone: 'Strong text-to-board contrast, each letter keeping one color as it turns a corner.',
      lighting_and_shadow: 'Flat artwork view plus soft light on the assembled box that shows every fold.',
      texture_and_material: 'Clean ink on a sober board with crisp, well-defined edges and folds.',
      camera_and_composition: 'Complete front hierarchy with a side continuation that adds rhythm.',
      atmosphere_and_mood: 'Editorial movement around the object, bold yet controlled.',
      rendering_and_quality: 'Text checked flat and assembled, especially at corners and flaps.',
      key_features: 'type across faces; planned folds; readable front; flat and assembled views',
    }, ['text cut with no intent', 'folds that alter letters', 'label added like a patch', NO_CLAIMS], [
      'A box for "KRAKEN", a hot sauce so dangerous it comes with a warning from the sea: the word wraps from front to side like a tentacle gripping the corner, black on bone with one red band.',
      'Packaging for "SLOW MONDAY", a coffee for people who have given up, the words sliding lazily across two faces of the bag and almost falling off the edge.',
      'A tall tube for "LONG WALK" hiking socks, the name running quietly around the curve and resting on the back, ink blue on cream.',
    ]),
    K('R-PKG-02', 'Taxonomic Label Systems', 'indexed variant label system', 'taxonomic-label', {
      aesthetic: 'Taxonomic Label Systems: indexes, codes and modular hierarchies organize a range of variants like a specimen collection, without literal illustration.',
      subject_treatment: "Organize the prompt's brand, variant names and supplied codes in one modular hierarchy, every name and code kept exact and nothing invented.",
      color_and_tone: 'Short family palette with one redundant code per variant.',
      lighting_and_shadow: 'Neutral even light for reading, clean and quietly precise.',
      texture_and_material: 'Sober stocks and crisp-edged ink with the information kept clear.',
      camera_and_composition: 'Aligned modules, codes under the name and room left for future data.',
      atmosphere_and_mood: 'Archive precision and calm differentiation across the range.',
      rendering_and_quality: 'Every code matches its variant, with no numbers invented to fill the grid.',
      key_features: 'specimen hierarchy; variant codes; modular grid; short palette',
    }, ['fake certifications', 'ornamental code', 'illegible secondary type', NO_CLAIMS], [
      'Specimen labels for "MONSTER JAM", a jam range made from fruits found in haunted orchards: variants "Ghost Plum", "Witch Berry" and "Bog Pear", codes M-01 to M-03, one ink.',
      'A label system for "EXCUSES", jars of pre-written excuses sorted like botanical samples: "Late", "Sick" and "Aliens", codes E-01 to E-03, very scientific.',
      'Labels for "INDEX" notebooks, "Plain", "Dot" and "Grid", codes N-01 to N-03, cream stock and dark ink.',
    ]),
    K('R-PKG-03', 'Window-Counterform Packaging', 'die-cut window motif package', 'window-counterform', {
      aesthetic: 'Window-Counterform Packaging: one die-cut window and the printed graphic around it build the main motif together.',
      subject_treatment: "Integrate one structural window into the prompt's package so the product seen through it and the printed graphic complete one figure-ground motif; keep the name exact.",
      color_and_tone: 'Contrast between visible contents, board and ink, the motif readable with any contents.',
      lighting_and_shadow: 'Soft light showing the opening and the board thickness around it.',
      texture_and_material: 'Sober board, a clean window edge and clear film only when specified.',
      camera_and_composition: 'Window placed by contents and structure, key information outside the cut.',
      atmosphere_and_mood: 'Discovery and a playful relationship between inside and outside.',
      rendering_and_quality: 'Window and graphic each supply a complementary part of the motif.',
      key_features: 'die-cut window; figure-ground motif; visible contents; exact name',
    }, ['decorative window', 'cut through text', 'contents invented to finish the image', NO_CLAIMS], [
      'Pasta packaging for "DRAGON TEETH" where a window cut in the shape of a jaw shows the sharp pasta inside as teeth, black and fiery orange, the name set exact.',
      'An egg box for "NERVOUS HENS" where each window is shaped like a peeking eye, the eggs inside becoming worried pupils.',
      'A box of colored pencils called "FURROW", a vertical window and two printed masses forming a rhythm of interrupted lines, cream and ink blue.',
    ]),
    K('R-PKG-04', 'Wraparound Story Bands', 'wraparound narrative band packaging', 'wraparound-band', {
      aesthetic: 'Wraparound Story Bands: graphic bands lead the eye around the package face by face through rhythm and continuity.',
      subject_treatment: "Lead reading around the prompt's package with bands that alternate image, pause and information, keeping the name and any supplied copy exact.",
      color_and_tone: 'Reduced palette with one dominant band and a resting ground.',
      lighting_and_shadow: 'Even light on review views that keeps every word clear of glare.',
      texture_and_material: 'Flat ink bands with clean edges on a sober stock.',
      camera_and_composition: 'One main path around the package with a recognizable front entry.',
      atmosphere_and_mood: 'Sequence and gradual discovery as the package turns in the hand.',
      rendering_and_quality: 'The reading order holds both on the flat dieline and when assembled.',
      key_features: 'wraparound bands; face-to-face sequence; front entry; resting ground',
    }, ['invented story', 'band covering information', 'repeating decoration with no sequence', NO_CLAIMS], [
      'A tea tin for "VOYAGE", whose band shows a tiny ship leaving port on the front, crossing a storm on the side and arriving home on the back, deep blue and gold.',
      'A cereal box for "LAST BITE", where the band follows a single flake\'s heroic escape from the bowl around all four faces, cartoonishly dramatic.',
      'A sleeve for a notebook named "PAUSE", the band moving from a dense field to empty space and back to the name, slate green, one ink.',
    ]),
    K('R-PKG-05', 'Overscale Microtype Contrast', 'giant type with small info packaging', 'overscale-microtype', {
      aesthetic: 'Overscale Microtype Contrast: one huge typographic gesture shares the face with small, well-ordered and genuinely legible information.',
      subject_treatment: "Set the prompt's name as one oversized typographic gesture and group the supplied secondary text in one small, orderly, legible block; keep all text exact.",
      color_and_tone: 'High-contrast title with secondaries dark enough to read and one small accent.',
      lighting_and_shadow: 'Neutral light that keeps the small type crisp and visible.',
      texture_and_material: 'Sharp ink, smooth stock and material detail kept subordinate.',
      camera_and_composition: 'The title rules one face, secondaries grouped in a stable block with its own margin.',
      atmosphere_and_mood: 'Strong editorial presence and precise detail, confident and graphic.',
      rendering_and_quality: 'Small text has a function and supplied content, never typographic noise.',
      key_features: 'oversized title; small ordered block; real legibility; bold crop',
    }, ['fake microtext', 'title hiding contents', 'hierarchy based only on extreme size', NO_CLAIMS], [
      'A matchbox for "BIG FIRE" with the word so huge it barely fits the tiny box and a neat line underneath, "Twelve matches. Use responsibly.", black on cream.',
      'Packaging for "HUGE", a brand that only sells very small things, the enormous word dwarfing a tiny block reading "One button. Standard size."',
      'A study paper pack named "LARGE" with small exact lines "Series 01" and "Study paper", one bold crop, ink on cream.',
    ]),
    K('R-PKG-06', 'Material-Edge Labels', 'label edge meets substrate packaging', 'material-edge', {
      aesthetic: 'Material-Edge Labels: the border where label meets substrate becomes part of the composition through deliberate margins and cut edges.',
      subject_treatment: "Use the edge between the prompt's label and its container material as part of the motif, with deliberate margins and cut edges; keep the name exact.",
      color_and_tone: 'Contrast between visible substrate and printed label, locked brand colors kept.',
      lighting_and_shadow: 'Soft light revealing the label edge and contact with a restrained shadow.',
      texture_and_material: 'A thin label on a moderately textured substrate, cleanly applied.',
      camera_and_composition: 'A strip of visible substrate that completes the composition.',
      atmosphere_and_mood: 'Contained tactility and a clear boundary, crafted and precise.',
      rendering_and_quality: 'The identity depends on the edge relationship, not on the material alone.',
      key_features: 'label edge as motif; visible substrate; cut margins; clean application',
    }, ['floating label', 'arbitrary edge', 'kraft paper as the only identity', NO_CLAIMS], [
      'A wine bottle for "BLACK TIDE", a wine aged in a shipwreck, where the short label stops exactly at a waterline and the dark glass below reads as deep sea.',
      'A jar of honey called "HALF", the label covering exactly half the jar with the honey itself forming the other half of the design.',
      'A sleeve for a card box named "EDGE", a side cut revealing the board to complete an open rectangle, black and cream.',
    ]),
    K('R-PKG-07', 'Interlocking Color Families', 'interlocking color field product family', 'interlocking-color', {
      aesthetic: 'Interlocking Color Families: color fields lock together by one constant rule while their relationships change between variants.',
      subject_treatment: "Lock the prompt's color fields together by one constant rule and vary their relationship to distinguish each variant, names kept exact and in one stable place.",
      color_and_tone: 'Family palette backed by redundant names or shapes.',
      lighting_and_shadow: 'Neutral light that compares tones with the same exposure for every variant.',
      texture_and_material: 'Flat ink, precise field edges and a uniform stock.',
      camera_and_composition: 'The interlock reads on front and sides, the name always in the same zone.',
      atmosphere_and_mood: 'Graphic energy and kinship across the range, lively and coherent.',
      rendering_and_quality: 'Variants keep one grammar and change one authorized relationship.',
      key_features: 'interlocking fields; constant rule; varied relationships; stable name zone',
    }, ['automatic recolor', 'fields with no rule', 'name moving between variants', NO_CLAIMS], [
      'A family of three rocket-fuel energy drinks, "LIFTOFF", "ORBIT" and "RE-ENTRY", color fields locking together with the same notch but in different proportions, bold and loud.',
      'Three toothpaste boxes for a family that argues about toothpaste, "MINT", "BUBBLEGUM" and "NO", interlocking fields that clearly do not get along.',
      'Stationery labels "LINE", "DOT" and "PLANE", told apart by the relationships of their interlocking fields and their titles, short palette.',
    ]),
    K('R-PKG-08', 'Quiet Diagram Packaging', 'simple use-diagram packaging', 'quiet-diagram', {
      aesthetic: 'Quiet Diagram Packaging: simple diagrams of the product or its use organize the faces with plenty of calm empty space.',
      subject_treatment: "Use one simple diagram of the prompt's product or its supplied use as the graphic structure, with minimal information and generous space; keep all text exact.",
      color_and_tone: 'One main ink and one functional accent, calm and instructive.',
      lighting_and_shadow: 'Flat diagram presentation printed on a calm, evenly lit board.',
      texture_and_material: 'Clean lines and a sober stock with quiet technical calm.',
      camera_and_composition: 'Diagram and text aligned, with a clear link between front and side.',
      atmosphere_and_mood: 'Instructive clarity and calm, like a friendly manual.',
      rendering_and_quality: 'The diagram shows only the supplied parts and steps.',
      key_features: 'simple use diagram; generous space; one ink; front-side link',
    }, ['invented diagrams', 'unsafe instructions', 'fake technical scales', NO_CLAIMS], [
      'A box for "UNFOLD", a pop-up tent for exploring volcanoes, with one calm three-step diagram of the tent springing open across the front, ink blue on cream.',
      'Packaging for "PLUNGER PRO", the most serious plunger ever sold, a very elegant diagram showing exactly one step: push.',
      'A box for "DOUBLE", a two-piece paper stand, one simple diagram fitting part A into part B, lots of air.',
    ]),
    K('R-PKG-09', 'Engraved Mass Labels', 'bold engraving label packaging', 'engraved-mass', {
      aesthetic: 'Engraved Mass Labels: engraving built from bold masses and wide voids gives the label character while the information area stays clean.',
      subject_treatment: "Illustrate the prompt's package with engraving made of bold masses and wide voids, reserving one clean area for the exact name and copy.",
      color_and_tone: 'One or two inks of firm contrast, mid tones only through coarse controlled hatching.',
      lighting_and_shadow: 'Graphic light built from ink masses in the engraving itself.',
      texture_and_material: 'Discreet carved edges, with print texture kept away from the main text.',
      camera_and_composition: 'One contained focal illustration and a stable information block.',
      atmosphere_and_mood: 'Printed character and visual weight, bold and handsome.',
      rendering_and_quality: 'The image reads from afar and the text stays free of engraving noise.',
      key_features: 'bold engraved masses; wide voids; clean info block; firm contrast',
    }, ['microscopic engraving', 'data over texture', 'fake provenance seals', NO_CLAIMS], [
      'A rum bottle for "LAST LIGHTHOUSE", a bold engraving of a lighthouse struck by lightning in heavy black masses, the name clean and exact below, black and bone.',
      'A soap bar called "GOAT OF DESTINY", an engraving of a very majestic goat staring into the future, one ink, the name set clean.',
      'A label for "ROOT" notebooks, a bold engraved root beside the clean name and "Series A", black and bone.',
    ]),
    K('R-PKG-10', 'Typographic Path Packaging', 'type following package volume', 'typographic-path', {
      aesthetic: 'Typographic Path Packaging: letters and lines share paths that respond to the real proportions and turns of the package.',
      subject_treatment: "Run the prompt's exact name and a supporting line along a path that follows a real curve, fold or proportion of the package, with a clear reading order.",
      color_and_tone: 'High-contrast text with subordinate lines and a short palette.',
      lighting_and_shadow: 'Neutral light on the stock that keeps the typographic path undistorted.',
      texture_and_material: 'Clean ink and precise edges with the board kept secondary.',
      camera_and_composition: 'The path answers a real curve or fold, never a gratuitous spiral.',
      atmosphere_and_mood: 'Contained typographic movement that adapts to the object.',
      rendering_and_quality: 'The word reads both flat and in the main view of use.',
      key_features: 'type on a path; follows volume; exact name; clear reading order',
    }, ['deformed text', 'lines that replace letters', 'path unrelated to the volume', NO_CLAIMS], [
      'A tall cylindrical tin for "SPIRAL STAIRS" cookies, the name climbing gently around the tin like a staircase in a tower, black and coral.',
      'A banana-shaped package for "BENDY" snacks where the name follows the curve perfectly and gets a little dizzy at the end.',
      'A sleeve for "OUTLINE", a desk object, the title tracking one long proportion while a thin line marks its edge, one ink.',
    ]),
  ],
};

export default spec;
