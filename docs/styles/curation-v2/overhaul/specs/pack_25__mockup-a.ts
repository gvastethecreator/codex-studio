import type { Spec } from '../tools/apply';
import { design } from './_design';

// Mockups & product presentation (part A): R-MCK-01 and 04 light modifiers, R-MCK-02 and 10 presentation
// profiles, and the fold, seam, decal, UV and open-closed recipes as application profiles. The applied
// artwork and requested brand stay exact; the preset changes only how it is presented.
const M = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
  kind: 'style' | 'modifier' | 'profile' = 'profile',
) => design(name, domain, tag, 'mockup', fields, avoid, briefs, { text: true, source, kind });

const KEEP = 'redrawn or altered brand artwork';

const spec: Spec = {
  pack: 'pack_25',
  category: '8. Mockups & Product Presentation',
  newCategory: { id: 'mockups-and-product-presentation' },
  updates: {},
  creates: [
    M('R-MCK-01', 'Raking-Light Relief Study', 'raking light relief mockup modifier', 'raking-relief', {
      aesthetic: 'Raking-Light Relief Study: a light modifier that sweeps low light across a printed object so embossing, edges and contact become visible.',
      subject_treatment: "Change only the light on the prompt's object to a low raking angle that reveals its existing relief and edges, keeping artwork, camera and geometry unchanged.",
      color_and_tone: 'Approved colors kept, with enough exposure in every printed area.',
      lighting_and_shadow: 'Broad low raking light with short contained relief shadows and no burnt highlights.',
      texture_and_material: 'Source material kept, showing only the response of relief that already exists.',
      camera_and_composition: 'The input composition kept, with an optional separate close-up.',
      atmosphere_and_mood: 'Precise tactility and a clear reading of the surface.',
      rendering_and_quality: 'Visible relief matches defined geometry, with no invented detail.',
      key_features: 'low raking light; revealed relief; unchanged artwork; frontal control',
    }, ['invented relief', 'text hidden by shadow', 'recolor through lighting', KEEP], [
      'Raking light sweeps across the embossed lid of "OBSIDIAN CROWN", a box for a king\'s chess set, the relief crown rising out of black board while the name stays sharp.',
      'Low light across a very pretentious embossed business card reading "GARY, VISIONARY", every tiny ridge dramatic, the name perfectly readable.',
      'A letterpress wedding invitation reading "ANA & TEO" under a soft sweep of raking light, the pressed letters casting tiny shadows on cotton paper.',
    ], 'modifier'),
    M('R-MCK-04', 'Hard-Sun Graphic Shadows', 'hard sunlight graphic shadow modifier', 'hard-sun-shadow', {
      aesthetic: 'Hard-Sun Graphic Shadows: a light modifier using one hard sun so crisp object shadows become part of the composition, clear of the brand.',
      subject_treatment: "Light the prompt's product with one hard declared sun so its crisp shadow balances the composition, never falling across the brand or text.",
      color_and_tone: 'Artwork colors kept, with no color cast that changes the identity.',
      lighting_and_shadow: 'One hard source producing coherent sharp shadows in direction and scale.',
      texture_and_material: 'Original materials intact, the shadow adding shape and no texture.',
      camera_and_composition: 'The shadow works as a counterweight outside the main reading area.',
      atmosphere_and_mood: 'Graphic precision and solar energy, bright and confident.',
      rendering_and_quality: 'The shadow matches the real geometry of the object.',
      key_features: 'one hard sun; crisp shadow shapes; shadow as counterweight; clear brand',
    }, ['impossible shadow', 'covered text', 'props that build an unrelated scene', KEEP], [
      'A bottle of "LAST OASIS" water standing alone on bright sand under a brutal noon sun, its long crisp shadow stretching like a road to the horizon, label untouched.',
      'A can of "COLD FEET" iced tea whose hard shadow on the wall is clearly shaped like a nervous man, the can itself perfectly normal.',
      'A cream box labeled "ATELIER 9" with a short diagonal hard shadow on a pale surface, the name fully in light.',
    ], 'modifier'),
    M('R-MCK-02', 'Soft Tabletop Presentation', 'neutral tabletop product presentation', 'soft-tabletop', {
      aesthetic: 'Soft Tabletop Presentation: the object on a neutral surface with a consistent camera and scale, so the applied design can be judged calmly.',
      subject_treatment: "Place the prompt's product on a neutral tabletop with a moderate camera and soft light, keeping its artwork, shape and exact brand text intact.",
      color_and_tone: 'Background value separated from the product and no change to the design palette.',
      lighting_and_shadow: 'Broad soft light with one clean contact shadow.',
      texture_and_material: 'Product material intact on a sober, quiet support surface.',
      camera_and_composition: 'Dominant product, generous margin and a moderate perspective.',
      atmosphere_and_mood: 'Calm material presentation, focused entirely on the product.',
      rendering_and_quality: 'The support never alters proportions or hides important information.',
      key_features: 'neutral tabletop; soft light; clean contact shadow; dominant product',
    }, ['mandatory plinth', 'deformed product', 'decoration competing with the brand', KEEP], [
      'A jar of "DRAGON EMBER" chili oil on a warm grey table, one soft light, a faint heat haze above the lid the only hint of how dangerous it is, label exact.',
      'A single box of "EXTREMELY NORMAL CEREAL" on a plain tabletop, lit with the seriousness of a museum treasure.',
      'A cylindrical tea tin labeled "QUIET HOURS" on matte charcoal, frontal slightly raised view and plenty of negative space.',
    ]),
    M('R-MCK-10', 'Material Macro Pair', 'overview and macro detail pair profile', 'material-macro', {
      aesthetic: 'Material Macro Pair: one overall view and one close-up of the same spot show how the design sits on the material.',
      subject_treatment: "Show the prompt's product in one overall view and a macro of one exact region of it, the artwork, text and material identical in both.",
      color_and_tone: 'Same colors and comparable exposure in both views.',
      lighting_and_shadow: 'Shared light, or one declared camera change, across the pair.',
      texture_and_material: 'Detail only where the source material allows it.',
      camera_and_composition: 'Overall view with a discreet locator and a macro of that exact region.',
      atmosphere_and_mood: 'Material discovery with continuity between the two views.',
      rendering_and_quality: 'The detail matches a recognizable region of the overall view.',
      key_features: 'overview plus macro; exact region; same exposure; discreet locator',
    }, ['invented macro', 'new texture', 'region that cannot be located', KEEP], [
      'A bottle of "SEA WITCH" gin shown whole and in a macro of its wax seal, the tiny kraken stamp and the word "SEA" crisp in both views.',
      'A macro pair of a sneaker box labeled "RUN AWAY", the overview on the left and a close-up of the stitched-on tag reading "RUN" on the right, very dramatic about shoes.',
      'A notebook labeled "FIELD 04" shown complete and in a macro of its printed spine edge, same ink, same paper.',
    ]),
    M('R-MCK-05', 'Fold-Following Artwork', 'artwork over folds application profile', 'fold-following', {
      aesthetic: 'Fold-Following Artwork: existing artwork applied across folds of a package or sleeve, continuous at every corner, with a flat view for control.',
      subject_treatment: "Apply the prompt's artwork across the folds of its support as a locked layer, continuous at every corner, with the flat artwork shown beside it.",
      color_and_tone: 'Source colors kept, value changes coming only from light and surface angle.',
      lighting_and_shadow: 'Soft light that reads both sides of each fold.',
      texture_and_material: 'Coherent board and thickness with only the planned folds.',
      camera_and_composition: 'The fold and enough front artwork in view, flat artwork separate.',
      atmosphere_and_mood: 'Tactility and continuity, the design turning corners gracefully.',
      rendering_and_quality: 'Letters and marks cross folds at matching points and are never rewritten.',
      key_features: 'artwork over folds; corner continuity; flat control; locked layer',
    }, ['redrawn logo', 'invented letters', 'folds added to hide errors', KEEP], [
      'The artwork of "MIDNIGHT CIRCUS" wrapping a folded ticket box, a tiger leaping across the corner without breaking, flat artwork beside the folded box.',
      'A folded pizza box for "FOLD CITY" where the pizza slice illustration bends perfectly across the lid hinge, flat and folded views side by side.',
      'A sleeve for "MARGIN" notebooks folded around a cover, the color band and name continuing over both edges, calm and exact.',
    ]),
    M('R-MCK-06', 'Seam-Registered Textile', 'print across garment seams profile', 'seam-registered', {
      aesthetic: 'Seam-Registered Textile: a print registered across the seams of a garment or bag so the pattern continues from panel to panel.',
      subject_treatment: "Register the prompt's print across the seams and panels of its garment or bag, continuous at each join, with a close view of one seam.",
      color_and_tone: 'Source palette intact, fabric shading kept apart from the ink.',
      lighting_and_shadow: 'Broad even light that keeps every seam and join readable.',
      texture_and_material: 'Moderate fabric weave, fixed seam positions and a restrained drape.',
      camera_and_composition: 'A front view and a seam close-up tied together by scale.',
      atmosphere_and_mood: 'Believable application and precision, calm, clean and well made.',
      rendering_and_quality: 'The pattern keeps its correspondence across panels without restarting.',
      key_features: 'print across seams; panel continuity; seam close-up; fixed cut',
    }, ['invented seams', 'restarted pattern', 'changed garment cut', KEEP], [
      'A jacket for a secret society of astronomers, a star map printed across torso and sleeve continuing perfectly over the shoulder seam, with a close-up of the join.',
      'A tote bag for "SNAKE CLUB" where one long printed snake crosses both panels and the bottom seam without losing a single scale.',
      'A plain cotton cushion with one continuous stripe crossing its side seam, front view and seam detail, soft light.',
    ]),
    M('R-MCK-07', 'Decal-on-Object Study', 'decal placement on object profile', 'decal-object', {
      aesthetic: 'Decal-on-Object Study: a mark applied as a separate decal layer with a declared position, scale and orientation on one object face.',
      subject_treatment: "Place the prompt's mark as a decal on one declared face of the object, keeping its proportions, colors and exact text, with a frontal control view.",
      color_and_tone: 'Locked decal colors and full opacity, matched to the scene only by light.',
      lighting_and_shadow: 'Object lighting coherent with the decal edge fully visible.',
      texture_and_material: 'Support intact and a visually thin decal layer.',
      camera_and_composition: 'Decal anchored to the surface with a frontal control view.',
      atmosphere_and_mood: 'Clear application and a separation between design and presentation.',
      rendering_and_quality: 'The decal keeps its proportions and never wraps by accident.',
      key_features: 'decal layer; declared position; kept proportions; frontal control',
    }, ['distorted artwork', 'changed scale', 'logo rebuilt by the model', KEEP], [
      'The skull decal of "NIGHTSHIFT RACING" applied to the flank of a matte black hover-bike at exactly the declared size, proportions and red outline kept.',
      'A decal reading "NO PARKING, ALSO NO MONDAYS" placed dead center on a battered office mini-fridge door, full opacity, perfectly straight.',
      'A small monogram "TH" decal on a matte rectangular plate with an even margin, frontal camera and soft light.',
    ]),
    M('R-MCK-08', 'Full-Surface UV Preview', 'wraparound surface map preview profile', 'uv-preview', {
      aesthetic: 'Full-Surface UV Preview: a flat surface layout shown beside the object it wraps, every face and seam of the map in its correct place.',
      subject_treatment: "Show the prompt's flat surface layout and the object it wraps side by side, each face and seam where declared, the name appearing only once.",
      color_and_tone: 'Source colors and register marks intact across both views.',
      lighting_and_shadow: 'Neutral light that shows continuity and keeps seams visible.',
      texture_and_material: 'Sober material with the applied texture at a defined scale.',
      camera_and_composition: 'Flat layout, main view and seam detail with clear correspondence.',
      atmosphere_and_mood: 'Mapping precision and a clear reading of volume.',
      rendering_and_quality: 'Every mark from the layout appears once on the right face.',
      key_features: 'flat layout beside object; seam in view; face correspondence; single name',
    }, ['invented layouts', 'mirrored art', 'unauthorized repeats', KEEP], [
      'The flat wrap of a race-car livery for "COMET 7" beside the finished car, the flame stripe crossing the hood seam exactly once, grid marks visible.',
      'A cereal box net for "UPSIDE DOWN FLAKES" shown flat beside the box, printed upside down on purpose, every face in the right place.',
      'A cylinder label for "WINTER TEA" shown flat and wrapped, the back seam visible and the name appearing once.',
    ]),
    M('R-MCK-12', 'Open-Closed Packaging Pair', 'closed and opened package pair profile', 'open-closed', {
      aesthetic: 'Open-Closed Packaging Pair: the same package shown closed and opened, with continuous graphics, parts and scale.',
      subject_treatment: "Show the prompt's package closed and opened with the same parts, artwork and scale, the inside holding only the declared contents.",
      color_and_tone: 'Identical print and palette in both the closed and opened states.',
      lighting_and_shadow: 'The same light and exposure for easy comparison.',
      texture_and_material: 'Coherent materials, thickness, folds and hinges in both states.',
      camera_and_composition: 'Two related views with one clear region of correspondence.',
      atmosphere_and_mood: 'An honest reveal of the inside, simple and satisfying.',
      rendering_and_quality: 'The inside shows only declared parts and the outside keeps its graphics.',
      key_features: 'closed and opened; same scale; declared contents; continuous graphics',
    }, ['a different box', 'invented interior', 'flaps that disappear', KEEP], [
      'The box of "PANDORA\'S PANTRY" shown closed and then opened, revealing a single glowing jar of honey inside, same box, same scale, deeply suspicious.',
      'A box labeled "DEFINITELY NOT A SNAKE" shown closed and open, and inside there is, of course, a toy snake.',
      'A slim stationery box labeled "FRAME" closed and with its sleeve removed, the same two pieces inside.',
    ]),
  ],
};

export default spec;
