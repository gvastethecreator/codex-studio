import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'readable annotations',
  'readable text',
  'brand logo',
  'franchise likeness',
  'lone cloaked figure on a cliff edge',
];

// Mixed category. Paint methods repaint the request and keep its framing; deliverables (sheets, boards,
// grids, strips, maps) own their layout. Review rule: the selected deliverable controls layout, a paint method does not.
const method =
  'Keep the prompt subject, action, setting and camera, and repaint them with this concept-art method; the method sets marks, values and finish but never adds a sheet, grid or panel layout.';
const sheet = (what: string) =>
  `Keep the prompt subject and its identity as the thing being designed; this deliverable owns ${what}, and that layout replaces the requested framing.`;

function ca(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? method, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_04',
  category: '4. Concept Art',
  updates: {
    'SP04-046': {
      name: 'Value-Block Speedpaint',
      dna: ca({
        aesthetic:
          'Digital speedpaint finished in under an hour: big flat value blocks laid with a hard round and a textured chalk brush, detail placed only at the focal point.',
        color_and_tone:
          'Three or four value groups in one dominant hue family, with a single complementary accent reserved for the focal point and unmixed edges between hue areas.',
        lighting_and_shadow:
          'One light direction decided in the first minutes; shadow shapes merged into single dark masses and highlights struck in with a few opaque strokes.',
        texture_and_material:
          'Visible hard-edged brush strokes, dry chalk-brush drag, lasso-cut edges and unblended strokes left raw toward the periphery.',
        camera_and_composition:
          'Keep the requested framing; the focal area is sharpened while the canvas edges dissolve into loose strokes and untouched block-in.',
        atmosphere_and_mood:
          'Urgent and decisive, the energy of fast choices left visible on the canvas.',
        rendering_and_quality:
          'Deliberately unfinished: detail density drops sharply outside the focal point, with no smoothing pass and no rendered texture maps.',
        key_features:
          'three or four value groups; hard round and chalk brush strokes; detail only at the focal point; canvas edges left as block-in; one complementary accent',
      }),
      avoid: [
        ...AVOID,
        'smooth airbrush blending',
        'uniform detail everywhere',
        'photoreal render',
      ],
      briefs: [
        'Value-block speedpaint of a plague-doctor procession crossing a frozen river at dusk, their torches the one warm accent against blue-grey ice, hard chalk-brush strokes and the canvas edges left as loose block-in. No text or logo.',
        'Value-block speedpaint of a siege tower burning against a black storm front, seen from the muddy trench below, three value groups and heavy dry-brush drag in the smoke. No text or logo.',
        'Value-block speedpaint of a torchlit cellar where a dice game has turned into a knife fight, detail only on the overturned dice table, everything else merged into two dark masses. No text or logo.',
      ],
    },
    'SP04-047': {
      dna: ca({
        aesthetic:
          'Film matte painting: a photoreal digital painting made to extend a live-action plate, with invisible seams between painted architecture, photo texture and sky.',
        color_and_tone:
          'Filmic grade with strong atmospheric perspective: distant planes lifted toward the sky color and desaturated, the foreground holding the deepest blacks.',
        lighting_and_shadow:
          'One sun or moon direction shared by every element, soft haze scatter, and cast shadows matched in hardness and temperature across all layers.',
        texture_and_material:
          'Photographic-scale surface detail near camera, simplified painted detail with distance, crisp rooflines and ridge silhouettes, fine aerial haze.',
        camera_and_composition:
          'Keep the requested view; build it from five or more receding depth planes with a clear horizon and a believable lens.',
        atmosphere_and_mood:
          'Vast, still and believable, a place that seems to have always existed.',
        rendering_and_quality:
          'Seamless photoreal finish with no visible brushwork in the near field; depth is carried by haze and value, never by blur.',
        key_features:
          'invisible plate seams; five or more haze planes; one shared light direction; photographic near detail; photoreal finish',
      }),
      avoid: [
        ...AVOID,
        'visible brushstrokes',
        'sketchy finish',
        'mismatched shadow directions',
        'tilt-shift blur',
      ],
      briefs: [
        'Matte painting of a cathedral-sized dam carved into a gorge, tiny torchlit watchmen along its crest, five receding haze planes and one low sun lighting every layer the same way. No text or logo.',
        'Matte painting of a sunken royal city exposed on a drained lake bed, spires crusted with dried weed, pale noon haze swallowing the far shore. No text or logo.',
        'Matte painting of an endless salt-flat graveyard of beached galleons under a bruised moonlit sky, seen from the height of a crow on a mast. No text or logo.',
      ],
    },
    'SP04-048': {
      dna: ca({
        aesthetic:
          'Production character turnaround: clean line with flat color and a single occlusion pass, one design shown in front, three-quarter, side and back views.',
        subject_treatment: sheet(
          'a turnaround layout of front, three-quarter, side and back views at one height, plus a row of expression heads',
        ),
        color_and_tone:
          'Flat local colors with one soft occlusion pass on a neutral mid-grey ground, plus a strip of unlabeled palette chips.',
        lighting_and_shadow:
          'Neutral frontal studio light with only ambient occlusion in the recesses, so colors read identically in every view.',
        texture_and_material:
          'Crisp consistent linework; fabric, leather and metal described with minimal shorthand so every seam, strap and fastening stays legible.',
        camera_and_composition:
          'Orthographic views aligned on shared guide lines for head, waist and feet, evenly spaced, with small expression heads in a row below.',
        atmosphere_and_mood: 'Neutral and exact, a calm handoff to modelers and animators.',
        rendering_and_quality:
          'Identical proportions in every view with no perspective drift; callout lines point to details without any words.',
        key_features:
          'front, three-quarter, side and back views; shared height guide lines; flat color plus occlusion; expression head row; unlabeled palette chips',
      }),
      avoid: [
        ...AVOID,
        'dynamic action pose',
        'perspective drift between views',
        'scenic background',
      ],
      briefs: [
        "Character turnaround of a stout middle-aged woman chimney sweep of a black citadel with cropped grey hair, a crooked top hat, soot-stained brass goggles pushed up, a long patched tailcoat and a bundle of round chimney brushes strapped to her back like a quiver; front, three-quarter, side and back views on grey with height guide lines and four expression heads below. Original design, no tactical gear or braid. No text or logo.",
        'Character turnaround of an adult river-toll keeper in a lamellar coat of overlapping fish-scale plates, a hooked pole strapped across the back, flat color with occlusion. No text or logo.',
        'Character turnaround of a clockwork scarecrow sentinel with a pumpkin-lantern head and stitched sackcloth limbs over brass joints, four aligned views and a strip of palette chips. No text or logo.',
      ],
    },
    'SP04-049': {
      dna: ca({
        aesthetic:
          'Environment design painting: a place designed for production in semi-finished digital paint, with clear paths, a landmark and a tiny figure for scale.',
        subject_treatment: sheet(
          'a wide establishing view in which the subject becomes a navigable place with a route, a landmark and a tiny scale figure',
        ),
        color_and_tone:
          'Palette organized by depth: warm saturated foreground, desaturated cool middle ground, pale background, with the landmark carrying the key accent.',
        lighting_and_shadow:
          'Directional light used to guide travel: a lit path leading to the landmark, shadowed flanks framing it on both sides.',
        texture_and_material:
          'Textured-brush shorthand for stone, timber, water and foliage, enough to read each material and no more.',
        camera_and_composition:
          'Wide eye-level or slightly raised view with a readable ground plane, a visible route through the space, and a human figure under a twentieth of frame height.',
        atmosphere_and_mood: 'Inviting to explore, every path hinting where to go next.',
        rendering_and_quality:
          'Semi-finished production painting, architecture resolved at the landmark and loosening toward the frame edges.',
        key_features:
          'readable route through the space; lit landmark; tiny scale figure; warm-to-cool depth palette; semi-finished paint',
      }),
      avoid: [...AVOID, 'character close-up', 'subject filling the frame'],
      briefs: [
        'Environment concept of a monastery built inside the ribcage of a fossilized leviathan, stairs winding between the ribs toward a lit bell tower, a tiny monk for scale, warm lit path and cool shadowed flanks. No text or logo.',
        'Environment concept of a flooded mining town where plank walkways link the rooftops above black water, lanterns tracing the route to a pithead wheel. No text or logo.',
        'Environment concept of a desert caravanserai carved into a red sandstone arch, a camel train entering its gate as the scale cue under a hard afternoon sun. No text or logo.',
      ],
    },
    'SP04-050': {
      dna: ca({
        aesthetic:
          'Industrial vehicle design sketch: alcohol marker and colored pencil on grey toned paper, with confident ellipses, construction lines and white gouache highlights.',
        subject_treatment: sheet(
          'a vehicle design sheet with a low three-quarter hero view and a smaller side elevation on one ground line',
        ),
        color_and_tone:
          'Grey paper ground, cool grey marker ramps, one bold body color, black tires and glazing, white pencil and gouache highlights.',
        lighting_and_shadow:
          'Studio sketch convention: body sides fade from lit top to dark lower edge, and the glazing carries one crisp horizon reflection line.',
        texture_and_material:
          'Streaky overlapping marker passes, visible construction ellipses, pastel-dust gradients on large panels, crisp ink in panel gaps.',
        camera_and_composition:
          'Low three-quarter hero view with an exaggerated wide stance, a smaller side elevation below, wheels or tracks sitting on a shared ground line.',
        atmosphere_and_mood:
          'Fast, confident and aspirational, a machine that already wants to move.',
        rendering_and_quality:
          'Design-studio sketch finish: construction lines left visible, a quick marker drop shadow, no photographic environment.',
        key_features:
          'alcohol marker on grey paper; white gouache highlights; construction ellipses; hero three-quarter plus side elevation; one bold body color',
      }),
      avoid: [
        ...AVOID,
        'photoreal CGI car render',
        'brand badges',
        'known film vehicles',
        'city background',
      ],
      dropAvoid: ['organic'],
      briefs: [
        'Vehicle design marker rendering of an armored steam hearse for a plague city, black lacquered body, brass chimney stacks and iron-shod wheels, low three-quarter hero view on grey paper with a side elevation below and white gouache highlights. No text or logo.',
        'Vehicle design sketch of a tracked snow ambulance for polar rescue, safety-orange body and dark glazing, construction ellipses left around the track wheels. No text or logo.',
        'Vehicle design sketch of a single-seat mudflat racing hovercraft, a low wedge body between two big fan housings, streaky cool grey marker and one acid-yellow body color. No text or logo.',
      ],
    },
    'SP04-051': {
      dna: ca({
        aesthetic:
          'Creature design study: one painted creature in a readable hero pose, surrounded by anatomical inset studies of skull, limb mechanics and skin.',
        subject_treatment: sheet(
          'a creature study sheet: one painted hero pose with graphite anatomy insets and a small human silhouette for scale',
        ),
        color_and_tone:
          'Natural biological palette with camouflage logic, warning colors only where they would evolve, on a warm parchment-grey sheet.',
        lighting_and_shadow:
          'Soft overhead key with a thin rim light that separates the silhouette from the sheet ground.',
        texture_and_material:
          'Painted skin, scales, keratin and wet membranes at believable scale; inset studies in graphite line with light washes.',
        camera_and_composition:
          'Hero creature in three-quarter view filling two thirds of the sheet, insets arranged in the remaining third, a small human silhouette for scale.',
        atmosphere_and_mood:
          'Plausible and unsettling, an animal that could have evolved somewhere.',
        rendering_and_quality:
          'Hero painted near finish, insets deliberately looser, callout lines that carry no words.',
        key_features:
          'one painted hero pose; graphite anatomy insets; skull and limb studies; human scale silhouette; evolved camouflage palette',
      }),
      avoid: [...AVOID, 'several unrelated creatures', 'cartoon mascot proportions'],
      dropAvoid: ['human'],
      briefs: [
        'Creature design study of a cave bat-heron that fishes blind in underground rivers, translucent wing membranes and pale skin, a skull inset with sonar ridges and graphite wing-mechanics insets, human silhouette for scale. No text or logo.',
        'Creature design study of a moss-backed siege tortoise bred to carry battering rams, scarred hide and chipped keratin plates, a cutaway inset of its load-bearing spine. No text or logo.',
        'Creature design study of a salt-marsh ambush predator that mimics driftwood, bark-textured hide, a hinged-jaw inset and a study of its splayed wading foot. No text or logo.',
      ],
    },
    'SP04-052': {
      dna: ca({
        aesthetic:
          'Hand-painted 2D isometric game art: the scene assembled from modular diamond tiles with painted top faces and darker side faces, like a builder game map.',
        subject_treatment: sheet(
          'a 2:1 dimetric tile view in which the subject sits on an exposed chunk of ground tiles',
        ),
        color_and_tone:
          'Saturated game palette where each terrain type owns one hue family and every side face steps darker by a fixed value.',
        lighting_and_shadow:
          'Fixed top-left light on every asset, with soft painted ambient occlusion where tiles and buildings meet.',
        texture_and_material:
          'Soft painted brush texture inside crisp tile edges, repeating modular pieces with small hand-painted variations.',
        camera_and_composition:
          'Parallel 2:1 dimetric projection without perspective, the scene resting on a floating chunk of tiles with visible soil sides.',
        atmosphere_and_mood: 'Cozy, orderly and systemic, a small world you want to manage.',
        rendering_and_quality:
          'Crisp tile silhouettes and painted surfaces, no 3D render sheen, no interface elements.',
        key_features:
          '2:1 diamond tile grid; painted top faces with darker sides; fixed top-left light; floating ground chunk; modular repeated assets',
      }),
      avoid: [...AVOID, '3d render sheen', 'HUD icons', 'interface panels', 'known game assets'],
      dropAvoid: ['flat'],
      briefs: [
        'Isometric game art of a walled leper colony on a river island, modular timber huts, a watermill and a small graveyard on a floating chunk of 2:1 diamond tiles with painted soil sides, fixed top-left light. No text or UI.',
        'Isometric game art of a frozen fishing camp on ice-floe tiles, round ice holes, drying racks and smoking tents, pale blue side faces stepping darker. No text or UI.',
        'Isometric game art of a volcanic forge district, lava channel tiles glowing between blackened workshops and slag heaps. No text or UI.',
      ],
    },
    'SP04-053': {
      dna: ca({
        aesthetic:
          'Film storyboard page: rough pencil and grey-marker panels drawn for shot communication, with camera arrows and motion arrows.',
        subject_treatment: sheet(
          'a storyboard page of four to six panels in reading order that break the action into shots',
        ),
        color_and_tone:
          'Greyscale graphite and two or three cool grey marker tones, with one red pencil reserved for movement and camera arrows.',
        lighting_and_shadow:
          'Just enough value to separate foreground, subject and background in each panel, with bold shadow shapes for drama.',
        texture_and_material:
          'Fast pencil contours, quick marker fills, loose hatching, and panels ruled with a slightly wobbly marker border.',
        camera_and_composition:
          'Four to six framed panels with varied shot sizes (wide, medium, insert close-up) and arrows for pans, pushes and subject motion.',
        atmosphere_and_mood: 'Kinetic and clear, a sequence you can already hear.',
        rendering_and_quality:
          'Quick and legible drawing with simplified figures, no rendered finish, blank margins instead of written shot notes.',
        key_features:
          'four to six ruled panels; varied shot sizes; red pencil motion arrows; grey marker values; blank note margins',
      }),
      avoid: [...AVOID, 'readable shot notes', 'speech balloons', 'finished rendering'],
      dropAvoid: ['color'],
      briefs: [
        'Storyboard page of a drawbridge chain snapping during an escape: a wide establishing panel, a medium of the gatekeeper hacking at the chain, an insert of the link splitting, red pencil motion arrows and grey marker values. No readable notes or logo.',
        'Storyboard page of a runaway ore cart plunging down a mine shaft, five panels from a high wide to a tight insert on the sparking wheels. No readable notes or logo.',
        'Storyboard page of a hawk snatching a ring from a wedding feast table, six panels with a push-in arrow and the escape traced across the hall. No readable notes or logo.',
      ],
    },
    'SP04-054': {
      dna: ca({
        aesthetic:
          'Prop design presentation: one object painted to production detail in a three-quarter hero view, with smaller orthographic views and detail zooms.',
        subject_treatment: sheet(
          'a prop sheet with one isolated object in a hero view, front and side views and round detail zooms',
        ),
        color_and_tone:
          'True material colors on a neutral light-grey ground, with wear and patina described through small color shifts.',
        lighting_and_shadow:
          'Soft upper-left key and neutral fill, with a distinct specular response per material so metal, leather and wood separate.',
        texture_and_material:
          'Legible material breakdown: grain direction, edge wear, stitching, rivets and scratches placed where hands would touch.',
        camera_and_composition:
          'Hero three-quarter view on the left, front and side orthographic views on the right, two circular detail zooms; no environment.',
        atmosphere_and_mood: 'Tactile and storied, an object that has clearly been used.',
        rendering_and_quality:
          'Clean production finish with unlabeled callout lines, each material readable at thumbnail size.',
        key_features:
          'isolated hero three-quarter view; front and side orthographics; circular detail zooms; wear placed by use; neutral grey ground',
      }),
      avoid: [...AVOID, 'environment background', 'several unrelated props'],
      briefs: [
        "Prop design sheet of a reliquary lantern holding a saint's finger bone, blackened silver cage, cracked green glass and soot on the chimney, hero three-quarter view with front and side views and detail zooms of the hinge and wax drips. No text or logo.",
        "Prop design sheet of a travelling barber-surgeon's folding kit case, worn oxblood leather, rows of steel instruments and a bloodstained strop. No text or logo.",
        "Prop design sheet of an astronomer's brass orrery with one planet missing from its arm, verdigris in the gear teeth. No text or logo.",
      ],
    },
    'SP04-055': {
      dna: ca({
        aesthetic:
          'Narrative keyframe: a polished cinematic painting of one turning-point moment, composed and lit like a single film frame.',
        subject_treatment: sheet(
          'a widescreen letterboxed film frame that stages the subject at its decisive story moment',
        ),
        color_and_tone:
          'Graded palette with one clear color story, such as teal shadows against a single warm story accent, contrast peaking at the emotional focus.',
        lighting_and_shadow:
          'Motivated dramatic light such as fire, lightning or a shaft through a breach, pointing at the story beat while deep shadows stay simple.',
        texture_and_material:
          'Painterly but resolved surfaces, with embers, dust or rain particles adding depth between planes.',
        camera_and_composition:
          'Widescreen cinematic framing with letterbox proportions, foreground occluders and the focal figure placed on a third.',
        atmosphere_and_mood: 'Charged and decisive, the instant before everything changes.',
        rendering_and_quality:
          'Near-final painting quality at the focal point, softened background, film-like depth and grade.',
        key_features:
          'widescreen letterbox frame; one turning-point moment; motivated dramatic light; foreground occluders; graded color story',
      }),
      avoid: [...AVOID, 'static posed portrait', 'flat even lighting'],
      briefs: [
        'Keyframe of an adult queen lowering her crown into a flooded throne room as black water rises around the dais, lightning through a shattered rose window lighting her from behind, widescreen letterbox framing with dying braziers in the foreground. No text or logo.',
        'Keyframe of a hunting party finding a giant eye frozen inside a glacier wall, their torches reflected in its iris, teal ice against warm flame. No text or logo.',
        "Keyframe of a ferryman's boat stopping dead as a pale hand rises from the black river, low angle over the prow, a single lantern the only warm light. No text or logo.",
      ],
    },
    'SP04-056': {
      dna: ca({
        aesthetic:
          'Photobash concept: the subject assembled from cut photographic fragments of rock, metal, foliage and architecture, warped into perspective and unified with painted light.',
        color_and_tone:
          'One unifying color grade over mismatched photo sources, slight saturation differences still visible under a cohesive overall temperature.',
        lighting_and_shadow:
          'Painted overlay light passes pull the sources to one direction, while a few photo shadows still disagree subtly.',
        texture_and_material:
          'Photographic micro-detail at real scale, visible cut edges, repeated cloned textures and perspective-warped fragments.',
        camera_and_composition:
          'Keep the requested view; strong perspective hides seams and detail density gathers at the focal areas.',
        atmosphere_and_mood: 'Gritty and tangible, realism assembled at speed for a pitch.',
        rendering_and_quality:
          'Photoreal-feeling surfaces with visible seams and paint glue in places, never a clean CG render.',
        key_features:
          'cut photo fragments; perspective warping; one unifying grade; visible seams and clone repeats; painted light glue',
      }),
      avoid: [...AVOID, 'clean CG render', 'fully hand-painted look'],
      dropAvoid: ['painted'],
      briefs: [
        'Photobash concept of a war-mill assembled from ship hulls and cathedral buttresses on a muddy riverbank, rusted steel and stone photo fragments warped into perspective, one amber grade unifying the seams. No text or logo.',
        'Photobash concept of a salvage fortress on a dune sea built from tanker plates and crane arms, cloned rivet textures and a hard white desert sun. No text or logo.',
        'Photobash concept of a swamp shrine grown from fused mangrove roots and cast bell metal, photographic moss and water fragments under a green-grey grade. No text or logo.',
      ],
    },
    'SP04-058': {
      dna: ca({
        aesthetic:
          'Low-poly blockout concept: the scene modeled as coarse proxy geometry of a few hundred flat-shaded facets, then painted over with quick light, fog and color notes.',
        color_and_tone:
          'Muted clay-grey or single-tint geometry with loose painted color zones laid over it and one saturated light color.',
        lighting_and_shadow:
          'Real-time sun and flat facet shading from the blockout, plus hand-painted glows, fog gradients and light shafts on top.',
        texture_and_material:
          'Untextured facets with visible polygon edges, and brush strokes crossing facet boundaries wherever the paintover sits.',
        camera_and_composition:
          'Keep the requested view; a slightly wide game-camera perspective keeps the massing readable.',
        atmosphere_and_mood:
          'Early and promising, a space that already feels playable in grey boxes.',
        rendering_and_quality:
          'Hybrid finish, crisp facet geometry underneath and loose paint marks on top; not a polished low-poly art render.',
        key_features:
          'coarse flat-shaded proxy geometry; clay-grey facets; painted glow and fog over the mesh; strokes crossing facet edges; game-camera view',
      }),
      avoid: [...AVOID, 'polished low-poly art render', 'voxel cubes', 'papercraft'],
      briefs: [
        'Low-poly blockout concept of a ring of standing stones around a sacrificial pit, clay-grey faceted monoliths with a painted sickly green glow rising from the pit and loose fog strokes crossing the facets. No text or logo.',
        'Low-poly blockout concept of a sunken gladiator arena, faceted stone tiers descending to a sand floor, painted pools of torchlight over the grey mesh. No text or logo.',
        'Low-poly blockout concept of a spiral tomb staircase descending into a dry well, a painted shaft of daylight falling through the proxy geometry. No text or logo.',
      ],
    },
    'SP04-060': {
      dna: ca({
        aesthetic:
          'Weapon design orthographic: one weapon drawn in strict side elevation at full length, painted in greyscale over clean line, with cross-section slices.',
        subject_treatment: sheet(
          'a strict side-elevation weapon sheet with cross-section slices and a hand silhouette for scale',
        ),
        color_and_tone:
          'Mostly neutral steel greys and dark grip materials with one material accent such as brass, bone or enamel, on a mid-grey ground.',
        lighting_and_shadow:
          'Flat studio light raking slightly from above to reveal bevels, fullers and the edge grind.',
        texture_and_material:
          'Forge marks, grind lines, leather or cord wrapped at the grip and pinned rivets, each material clearly separated.',
        camera_and_composition:
          'Exact side view spanning the frame horizontally, small section slices beneath it and a hand silhouette for scale.',
        atmosphere_and_mood: 'Functional and heavy, a form dictated by how it strikes.',
        rendering_and_quality:
          'Precise production finish with clean edges, no motion effects and no background scene.',
        key_features:
          'strict side elevation; full length across the frame; cross-section slices; hand silhouette for scale; one accent material',
      }),
      avoid: [...AVOID, 'action pose', 'glowing magic effects', 'perspective view'],
      briefs: [
        "Weapon design orthographic of an executioner's two-handed sword with a squared tip and a plain fuller, full side elevation on mid-grey, three blade cross-sections below and a hand silhouette for scale. No text or logo.",
        "Weapon design orthographic of a whaler's harpoon-halberd with a barbed head, a rope-bound ash haft and a brass butt cap, section slices of the head. No text or logo.",
        'Weapon design orthographic of a war flail whose head is a caged iron censer on a short chain, bone grip plates pinned with rivets. No text or logo.',
      ],
    },
    'SP04-081': {
      dna: ca({
        aesthetic:
          'Pose silhouette thumbnails: the subject drawn as a scatter of small solid brush-pen silhouettes in different poses and actions, testing gesture readability.',
        subject_treatment: sheet(
          'a sketchbook spread of ten to fifteen pose silhouettes of the same subject, each in a different action',
        ),
        color_and_tone:
          'Black brush-pen fills on warm toned sketchbook paper, with one grey marker for ground shadows and overlaps.',
        lighting_and_shadow:
          'No modeled light; readability comes only from outline and the negative space between limbs.',
        texture_and_material:
          'Brush-pen edges with dry-brush breaks, varied thumbnail sizes, faint pencil construction under some of the ink.',
        camera_and_composition:
          'Ten to fifteen thumbnails scattered across a sketchbook spread, each standing on a small shadow ellipse, varied in scale and energy.',
        atmosphere_and_mood: 'Quick and searching, hunting for the one pose that reads.',
        rendering_and_quality:
          'Rough ink thumbnails only, no internal detail, no rendering, no finished figure.',
        key_features:
          'scattered pose silhouettes; black brush-pen fills; toned sketchbook paper; grey ground-shadow ellipses; gesture readability test',
      }),
      avoid: [...AVOID, 'rigid grid of identical poses', 'internal detail'],
      briefs: [
        'Pose silhouette thumbnails of an adult rope dancer balancing on a gallows beam, fourteen black brush-pen silhouettes scattered across a toned sketchbook spread, leaping, teetering and bowing, each on a grey marker shadow ellipse. No text or logo.',
        'Pose silhouette thumbnails of an armored war hound lunging, guarding, leaping and howling, dry-brush breaks at the edges of the ink. No text or logo.',
        'Pose silhouette thumbnails of two adult brawlers in a tavern fight, twelve paired silhouettes testing grapples and throws for clear negative space. No text or logo.',
      ],
    },
    'SP04-082': {
      dna: ca({
        aesthetic:
          'Paintover demonstration: the same frame shown as a raw photobash collage and then as a painted-over concept, side by side.',
        subject_treatment: sheet(
          'a split frame, the raw photo collage on one side and the resolved paintover of the identical composition on the other',
        ),
        color_and_tone:
          'Raw half with mismatched photo color and exposure; painted half pulled into one grade and simplified value groups.',
        lighting_and_shadow:
          'The raw collage shows conflicting light directions; the paintover resolves them into one dominant key and clean shadows.',
        texture_and_material:
          'Hard cut edges and visible stock seams on the raw side; painted strokes knitting fragments together and removing noise on the other.',
        camera_and_composition:
          'Identical composition repeated in two halves or three stages across, same horizon and perspective, so the progress reads instantly.',
        atmosphere_and_mood: 'Instructive and satisfying, chaos resolved into intent.',
        rendering_and_quality:
          'Process-demonstration finish, the paintover side at concept-final level and the raw side left deliberately crude.',
        key_features:
          'split before-and-after frame; raw photo collage with seams; resolved paintover; identical composition; one unifying grade',
      }),
      avoid: [...AVOID, 'two different compositions', 'single untouched image'],
      dropAvoid: ['finished', 'final', 'clean', 'smooth'],
      briefs: [
        'Paintover split of a gatehouse built into a waterfall: the left half a raw photo collage with mismatched exposures and hard cut edges, the right half the identical frame painted over into one moonlit blue grade. No text or logo.',
        'Paintover demonstration in three stages across of a quarry temple wrapped in timber scaffolding, from pasted stone photos to a unified dusty ochre painting. No text or logo.',
        'Paintover split of an aqueduct overgrown with giant shelf fungus, raw collage seams on top and the resolved misty paintover below. No text or logo.',
      ],
    },
    'SP04-083': {
      dna: ca({
        aesthetic:
          'Gesture energy sketch: fast charcoal pencil and brush-pen lines chasing the action, with repeated search lines, a line of action and motion trails.',
        color_and_tone:
          'Monochrome graphite or charcoal on cream paper, with one red or blue col-erase pencil for the line of action.',
        lighting_and_shadow:
          'Minimal value: a few dark accents at weight-bearing points and folds, no modeled light.',
        texture_and_material:
          'Layered search lines, smudged charcoal, broken contours and whip-fast tapering strokes.',
        camera_and_composition:
          'Keep the requested view; the figure sits large on the page with motion arcs carrying past the edges.',
        atmosphere_and_mood: 'Explosive, loose and alive, movement caught mid-breath.',
        rendering_and_quality:
          'Unfinished drawing, energy placed before anatomy, no clean-up pass or rendering.',
        key_features:
          'layered search lines; colored line of action; charcoal smudges; motion arcs off the page; no clean-up',
      }),
      avoid: [...AVOID, 'clean vector line', 'rendered shading'],
      briefs: [
        'Gesture energy sketch of an adult sword-dancer mid-spin with a curved blade, layered charcoal search lines, a red col-erase line of action and motion trails arcing off the page. No text or logo.',
        'Gesture energy sketch of a stampeding aurochs lowering its horns, smudged charcoal dust behind the hooves and broken whip-fast contours. No text or logo.',
        'Gesture energy sketch of an adult woman blacksmith swinging a sledge onto an anvil, blue col-erase arc of the swing, dark accents only at the planted feet. No text or logo.',
      ],
    },
    'SP04-084': {
      dna: ca({
        aesthetic:
          'Material exploration board: a design sketch of the subject beside a grid of candidate swatches and material spheres, each testing a different surface.',
        subject_treatment: sheet(
          'a material board with a central subject study flanked by a swatch matrix and zoom callouts',
        ),
        color_and_tone:
          'Material-true hues grouped by role (primary, secondary, trim) on a neutral grey board.',
        lighting_and_shadow:
          'Identical studio lighting on every swatch and sphere so gloss, roughness and translucency compare fairly.',
        texture_and_material:
          'Each swatch a distinct surface such as hammered copper, crazed enamel, oiled leather, frosted glass or lichen-crusted stone.',
        camera_and_composition:
          'Subject study at center or left, swatch squares and spheres in a tidy grid, circular zoom callouts on the subject.',
        atmosphere_and_mood: 'Analytical and tactile, searching for the right skin.',
        rendering_and_quality:
          'Swatches physically rendered, the subject sketch semi-finished with materials applied in zones.',
        key_features:
          'swatch grid; material spheres; central semi-finished subject study; identical swatch lighting; circular zoom callouts',
      }),
      avoid: [...AVOID, 'known film robot likeness', 'one flat material everywhere'],
      briefs: [
        "Material exploration board for a necromancer's bone throne, a semi-finished central sketch flanked by swatch squares and spheres of yellowed bone, black iron, cracked obsidian, moth-eaten velvet and candle wax, zoom callouts on the armrests. No text or logo.",
        'Material exploration board for a hot-air balloon gondola, swatches of wicker, riveted copper, waxed canvas and scorched rope under identical light. No text or logo.',
        'Material exploration board for a carnival carousel horse, chipped gesso, gold leaf, mirror glass and lacquered red enamel spheres beside the sketch. No text or logo.',
      ],
    },
    'SP04-085': {
      dna: ca({
        aesthetic:
          'Color script: a sequence of eight to twelve small, loosely painted frames tracing how color and light change through a story.',
        subject_treatment: sheet(
          'a strip of small frames in story order through which the subject travels',
        ),
        color_and_tone:
          'Each frame dominated by one or two flat hues, the palette shifting beat by beat from calm cool to tense warm to climax red to pale aftermath.',
        lighting_and_shadow:
          'Light reduced to one key shape per frame, with color temperature doing the storytelling.',
        texture_and_material:
          'Flat opaque gouache-like digital shapes with visible brush edges and no surface detail.',
        camera_and_composition:
          'Frames of equal size in two or three rows with thin dark gutters, same aspect ratio, story reading left to right.',
        atmosphere_and_mood: 'An emotional arc readable at a single glance.',
        rendering_and_quality:
          'Tiny simplified frames, figures reduced to specks and shapes, no linework.',
        key_features:
          'eight to twelve small frames; one or two hues per frame; beat-by-beat palette shift; dark gutters; gouache-like flat shapes',
      }),
      avoid: [...AVOID, 'single large painting', 'detailed figures'],
      briefs: [
        'Color script of a pilgrimage to a burning abbey, twelve small frames moving from a pale blue dawn march through an amber forest to a red fire climax and a grey ash aftermath, flat gouache-like shapes between dark gutters. No text or logo.',
        "Color script of a whaling voyage, ten frames from a green harbour dawn through a violet storm and a blood-orange catch to the ship's black sinking. No text or logo.",
        "Color script of a vampire's single night, eight frames from a dusk-purple awakening through gold candlelit feasting to a white dawn flight. No text or logo.",
      ],
    },
    'SP04-087': {
      dna: ca({
        aesthetic:
          'Silhouette iteration sheet: design variants of the subject as pure black fills on white, same pose and scale, only the outline changing.',
        subject_treatment: sheet(
          'a rigid grid of twelve to sixteen outline variants of the subject at identical scale and pose',
        ),
        color_and_tone:
          'Binary black on white, with at most one grey fill marking the selected variant.',
        lighting_and_shadow:
          'No light or interior value at all; every decision lives in the outline.',
        texture_and_material:
          'Crisp vector-clean or lasso-cut edges, shape language varied between round, square, triangular and spiked.',
        camera_and_composition:
          'Four-by-four or three-by-four grid with equal cells, a shared baseline in each cell, identical camera angle throughout.',
        atmosphere_and_mood: 'Decisive and comparative, shape language on trial.',
        rendering_and_quality:
          'Solid flat silhouettes with zero internal detail, no texture and no rendering.',
        key_features:
          'pure black silhouettes; rigid equal grid; same pose and scale; varied shape language; outline-only design',
      }),
      avoid: [...AVOID, 'scattered loose layout', 'gradients'],
      briefs: [
        'Silhouette iteration sheet of a castle keep, sixteen pure black tower profiles in a four-by-four grid on white, same base width, round, square and spiked shape languages. No text or logo.',
        'Silhouette iteration sheet of a ghost ship, twelve hull and torn-sail profiles in black on white, one variant filled grey as the pick. No text or logo.',
        'Silhouette iteration sheet of a mounted knight on a warhorse, twelve outline variants of helm crest, lance and barding at identical scale. No text or logo.',
      ],
    },
    'SP04-088': {
      dna: ca({
        aesthetic:
          'Rough environment pass: the location blocked in with three to five flat lasso-cut value planes stacked in depth, one focal light and almost no texture.',
        color_and_tone:
          'Near-monochrome planes stepping from dark foreground to pale background, one tint per plane and a single bright focal light.',
        lighting_and_shadow:
          'One large light source such as a sky gap, sun shaft or glow defines the focal point, planes silhouetted against it.',
        texture_and_material:
          'Hard lasso edges and gradient fills, a touch of textured brush at plane edges, no surface detail.',
        camera_and_composition:
          'Keep the requested view; big-shape hierarchy with a dark foreground framing mass and strong recession.',
        atmosphere_and_mood: 'Monumental and quiet, scale decided before detail.',
        rendering_and_quality:
          'Early blockout finish, shapes readable at thumbnail size and nothing resolved; distinct from brush-led speedpainting.',
        key_features:
          'three to five flat value planes; lasso-cut edges; gradient fills; single focal light; no surface detail',
      }),
      avoid: [...AVOID, 'visible brush strokes everywhere', 'fine surface texture'],
      briefs: [
        "Rough environment pass of a colossal statue's head half sunk in a salt marsh, four flat lasso-cut value planes from black reeds to pale fog, one sun shaft striking the stone brow. No text or logo.",
        'Rough environment pass of a vast underground cistern, rows of columns stepping into darkness as flat grey planes, a single shaft of light from a grate above. No text or logo.',
        'Rough environment pass of a forest of petrified giant trees with a road winding in, gradient-filled planes and a cold blue glow deep between the trunks. No text or logo.',
      ],
    },
    'SP04-089': {
      dna: ca({
        aesthetic:
          'Creature iteration page: six to nine quick graphite and grey-marker variants of one creature concept, each testing a different adaptation.',
        subject_treatment: sheet(
          'a page of six to nine variants of the subject as a creature, one circled as the pick',
        ),
        color_and_tone:
          'Graphite grey and cool grey markers on off-white bond paper, one flat color wash only on the selected variant.',
        lighting_and_shadow:
          'Simple top-light shading on each variant, with shadows laid as single marker tones.',
        texture_and_material:
          'Loose searching graphite lines, marker bleed, eraser corrections and overlapping construction.',
        camera_and_composition:
          'Variants in a loose grid at matching scale and the same three-quarter angle, the favorite ringed with a pen circle.',
        atmosphere_and_mood: 'Curious and generative, a creature evolving on the page.',
        rendering_and_quality:
          'Rough exploratory drawings, none finished, the chosen one slightly more developed than the rest.',
        key_features:
          'six to nine creature variants; graphite and grey marker; one color-washed pick; pen circle; matching angle and scale',
      }),
      avoid: [...AVOID, 'single finished creature', 'painted hero render'],
      dropAvoid: ['human', 'normal', 'domestic', 'ordinary', 'recognizable'],
      briefs: [
        'Creature iteration page of a carrion vulture-wolf for a cursed battlefield, eight graphite and grey marker variants of skull, wing and mane, the chosen one washed dusty violet and ringed with a pen circle. No text or logo.',
        'Creature iteration page of a lantern-bellied deep-sea angler that walks on its fins, six variants of lure, jaw and fin-legs with marker bleed. No text or logo.',
        'Creature iteration page of a thorn-covered forest stag spirit, nine antler and hoof variants at the same three-quarter angle. No text or logo.',
      ],
    },
    'SP04-090': {
      dna: ca({
        aesthetic:
          'Prop variant sheet: one prop type redesigned five to seven times side by side, each version changing function, culture or material on a shared base proportion.',
        subject_treatment: sheet(
          'a lineup of five to seven variants of the subject on one baseline at identical scale',
        ),
        color_and_tone:
          'Neutral ground with a restrained material-coded palette per variant and one accent hue that marks faction or function.',
        lighting_and_shadow:
          'Uniform soft top-left light on every variant, each with the same small contact shadow so they compare fairly.',
        texture_and_material:
          'Painted material shorthand, crisp silhouettes, and modular parts visibly swapped between versions.',
        camera_and_composition:
          'Straight front or side orthographic view, variants lined up on a baseline at identical scale with a small hand silhouette.',
        atmosphere_and_mood: 'Systematic and inventive, choices laid out for a decision.',
        rendering_and_quality:
          'Medium finish with every variant at equal detail, numbered only by simple dots instead of labels.',
        key_features:
          'five to seven variants in a row; shared base proportion; identical scale and light; faction accent hue; swapped modular parts',
      }),
      avoid: [...AVOID, 'single design', 'variants at different scales'],
      briefs: [
        'Prop variant sheet of seven drinking horns for seven rival clans, bone, pewter, black glass, birch bark and gilded ram horn on one baseline, front orthographic view, a clan accent color on each rim. No text or logo.',
        'Prop variant sheet of six plague masks for different city wards, beak length, lens tint and leather stitching changing from mask to mask. No text or logo.',
        'Prop variant sheet of five portable backpack shrines for wandering priests, carved doors, bells and candle niches swapped between versions. No text or logo.',
      ],
    },
    'SP04-091': {
      dna: ca({
        aesthetic:
          'Architectural massing model: the subject rebuilt as a handmade study model of white foam board, chipboard and basswood blocks on a flat base.',
        subject_treatment:
          'Keep the prompt subject, its layout and the requested view, and rebuild every volume as a simplified study model block without facades, furniture or interiors.',
        color_and_tone:
          'Foam white, chipboard grey-brown and basswood tan, with one colored acrylic block marking the focal volume.',
        lighting_and_shadow:
          'Soft window daylight or a single desk lamp raking across the model, crisp small shadows revealing the volumes.',
        texture_and_material:
          'Visible cut foam edges, glue seams, pin heads, blade-scored window lines and tiny unpainted scale figures.',
        camera_and_composition:
          'Keep the requested view, framed as a photograph of the model on its base with shallow depth of field.',
        atmosphere_and_mood: 'Thoughtful and tactile, ideas tested in cardboard.',
        rendering_and_quality:
          'Real physical model look with no finished facades, no rendered materials and no dollhouse interior.',
        key_features:
          'white foam and chipboard volumes; basswood blocks; glue seams and pin heads; one colored focal block; photographed on a base',
      }),
      avoid: [...AVOID, 'dollhouse cutaway', 'finished interior', 'painted facades'],
      dropAvoid: ['photo', 'realistic'],
      briefs: [
        'Architecture massing model of a walled hill-town of stacked granaries and towers, white foam board and chipboard blocks on a base with pin heads and glue seams, one red acrylic block for the keep, raking desk-lamp light. No text or logo.',
        'Architecture massing model of a floating market of barge-houses moored along a canal, basswood hulls and foam roofs with tiny unpainted figures. No text or logo.',
        'Architecture massing model of a necropolis of stepped tombs climbing a slope, blade-scored doorways and soft window daylight. No text or logo.',
      ],
    },
    'SP04-092': {
      dna: ca({
        aesthetic:
          'Costume design board: one figure in a hero costume drawing with alternate colorways and fabric swatches pinned around it.',
        subject_treatment: sheet(
          'a costume plate with a full-length hero figure, a row of colorway mini-figures and pinned swatches',
        ),
        color_and_tone:
          'Three or four colorway alternatives shown as small repeat figures, and true fabric colors in the swatches.',
        lighting_and_shadow:
          'Even studio light on the figure; swatches lie flat with slight pin shadows.',
        texture_and_material:
          'Pencil and watercolor figure with real fabric scraps pinned beside it: wool, brocade, leather, chainmail and trim.',
        camera_and_composition:
          'Hero figure full length at center, colorway mini-figures in a row, swatches clustered along one side.',
        atmosphere_and_mood: 'Tactile and theatrical, a costume about to be cut and sewn.',
        rendering_and_quality:
          'Watercolor costume illustration with photo-real swatches; distinct from an orthographic turnaround.',
        key_features:
          'full-length costume plate; colorway mini-figures; pinned fabric swatches; pencil and watercolor; theatrical silhouette',
      }),
      avoid: [...AVOID, 'orthographic turnaround layout', 'modern streetwear'],
      briefs: [
        'Costume design board for an adult winter court jester in a dark medieval court, slashed black velvet and tarnished bells, a watercolor hero figure with four colorway mini-figures and pinned swatches of velvet, fur and brass. No text or logo.',
        'Costume design board for an adult ceremonial beekeeper-priestess, veil, wax-dipped linen and honeycomb embroidery, swatches of raw silk and beeswax cloth. No text or logo.',
        'Costume design board for an adult river-pirate captain, a patched brocade greatcoat over chainmail, three colorways and scraps of salt-stained leather. No text or logo.',
      ],
    },
    'SP04-093': {
      dna: ca({
        aesthetic:
          'Lighting scenario pass: the same fixed view painted four times under different light, like a lighting artist testing times of day and weather.',
        subject_treatment: sheet(
          'a two-by-two grid of the identical composition in which only light and weather change',
        ),
        color_and_tone:
          'Each panel a different temperature story: cool dawn mist, harsh neutral noon, red dusk, torchlit or moonlit night.',
        lighting_and_shadow:
          'Shadow direction, length and hardness change consistently per panel while the geometry stays identical.',
        texture_and_material:
          'Loose painterly surfaces kept the same in every panel so only the light response differs.',
        camera_and_composition:
          'Two-by-two grid of identical framing, same horizon and camera, with thin gutters between panels.',
        atmosphere_and_mood: 'Comparative and atmospheric, one place with four moods.',
        rendering_and_quality:
          'Medium-finish paintings of equal detail; the contrast between panels is the whole point.',
        key_features:
          'two-by-two grid; identical composition; four times of day or weather; consistent shadow logic; equal finish',
      }),
      avoid: [...AVOID, 'changing camera between panels', 'single image'],
      briefs: [
        'Lighting scenario pass of a sunken stepwell temple, the identical view in a two-by-two grid: cool dawn mist, harsh noon glare, blood-red dusk and torchlit night. No text or logo.',
        'Lighting scenario pass of a windmill on an open moor under lightning storm, full moonlight, overcast snowfall and low sunrise. No text or logo.',
        'Lighting scenario pass of an abandoned throne hall with one hole in the roof, four panels as the beam of light moves across the floor from morning to midnight moonlight. No text or logo.',
      ],
    },
    'SP04-095': {
      dna: ca({
        aesthetic:
          'Foliage design kit: a library sheet of isolated plant assets, from trees to groundcover, designed as one family sharing a shape language.',
        subject_treatment: sheet(
          'an asset-library sheet of isolated vegetation arranged in rows by size, themed after the subject or biome',
        ),
        color_and_tone:
          'Species palette with seasonal or blight variants side by side on a neutral light ground.',
        lighting_and_shadow:
          'Consistent top-left daylight on every plant with flat, small contact shadows.',
        texture_and_material:
          'Painted leaf clusters grouped into readable masses, bark and stem detail only at close scale.',
        camera_and_composition:
          'Assets in rows from tall trees to small groundcover, all at one scale with a human silhouette, no scene around them.',
        atmosphere_and_mood: 'Lush and organized, a biome sorted for building.',
        rendering_and_quality:
          'Game-art painted finish, crisp silhouettes, each asset ready to cut out.',
        key_features:
          'isolated plant assets in rows; one shared shape language; seasonal variants; human scale silhouette; neutral ground',
      }),
      avoid: [...AVOID, 'full landscape scene', 'overlapping plants'],
      dropAvoid: ['bare', 'dead', 'desert', 'urban', 'concrete', 'interior', 'sterile', 'empty'],
      briefs: [
        'Foliage design kit for a cursed blight forest, blackened thorn trees, fungal shrubs, bleeding moss and bone-white saplings isolated in rows from tall to small on a neutral ground, human silhouette for scale. No text or logo.',
        'Foliage design kit for an alpine meadow, pines, juniper, gentians and cushion plants with summer and autumn variants side by side. No text or logo.',
        'Foliage design kit for a carnivorous swamp, pitcher plants, sundews, mangrove clumps and floating bladderwort. No text or logo.',
      ],
    },
    'SP04-096': {
      dna: ca({
        aesthetic:
          'Upgrade progression sheet: the same weapon or item shown in four or five tiers side by side, growing from crude utility to ornate masterwork.',
        subject_treatment: sheet(
          'a row of four or five upgrade tiers of the subject on one baseline, crude on the left and masterwork on the right',
        ),
        color_and_tone:
          'Tier-coded palette: raw iron and wood first, then steel, then gilt and enamel, the final tier with one controlled glowing accent.',
        lighting_and_shadow:
          'Identical soft light on every tier, the final tier adding its own restrained inner glow.',
        texture_and_material:
          'Materials upgrade step by step: rust and splinters, polished steel, engraved gold and set gems.',
        camera_and_composition:
          'Tiers lined up at the same scale and angle with even spacing on a shared baseline.',
        atmosphere_and_mood: 'Rewarding and aspirational, progress readable at a glance.',
        rendering_and_quality:
          'Game-asset paint finish with a consistent proportion baseline, so each upgrade reads as evolution.',
        key_features:
          'four or five tiers; crude to masterwork progression; tier-coded materials; shared baseline; one glowing final accent',
      }),
      avoid: [...AVOID, 'unrelated items per tier', 'glow on every tier'],
      briefs: [
        "Weapon tier progression of a shepherd's crook becoming a warlock's staff in five tiers, from splintered ash wood to bone inlay to a caged ember crown, same scale on a shared baseline. No text or logo.",
        'Weapon tier progression of a round shield in four tiers, from barrel-lid planks to studded iron to enameled scale plates with one faint glowing boss. No text or logo.',
        "Weapon tier progression of a smith's hammer in five tiers, from a rusted mallet to a rune-forged maul with an engraved gold head. No text or logo.",
      ],
    },
    'SP04-097': {
      dna: ca({
        aesthetic:
          'Composition thumbnail grid: the same scene explored in twelve small pencil-framed rectangles, each testing a different camera and shot size.',
        subject_treatment: sheet('a grid of twelve framing studies of the one subject and scene'),
        color_and_tone: 'Three grey values per thumbnail, graphite on white bond paper, no color.',
        lighting_and_shadow:
          'Light simplified to one lit shape against dark masses in each thumbnail to test focal pull.',
        texture_and_material:
          'Soft graphite blocking, marker-grey fills, ruled rectangle frames drawn freehand.',
        camera_and_composition:
          'Twelve equal rectangles in a three-by-four grid: worm’s-eye, overhead, dutch angle, extreme wide, over-the-shoulder and tight close framings of one scene.',
        atmosphere_and_mood: 'Analytical and suspenseful, searching for the strongest shot.',
        rendering_and_quality: 'Stamp-size value studies only, no detail, no finished frame.',
        key_features:
          'three-by-four thumbnail grid; one scene in twelve framings; three grey values; freehand frames; varied camera heights',
      }),
      avoid: [...AVOID, 'twelve different scenes', 'rendered frames'],
      briefs: [
        'Composition thumbnail grid of a gibbet at a lonely crossroads, twelve pencil-framed rectangles in three grey values: worm’s-eye, overhead, dutch angle, extreme wide and a tight close on the creaking chain. No text or logo.',
        'Composition thumbnail grid of a wolf pack circling a sleigh at night, twelve framings from the driver’s shoulder, from the treeline and from high above. No text or logo.',
        'Composition thumbnail grid of a bell tower collapsing into a market square, twelve camera heights and shot sizes in soft graphite. No text or logo.',
      ],
    },
    'SP04-098': {
      dna: ca({
        aesthetic:
          'Fantasy world map concept: a hand-drawn ink and watercolor map on aged paper with pictorial mountains, forests and hatched coastlines.',
        subject_treatment: sheet(
          'a top-down hand-drawn map of the region or realm the subject implies',
        ),
        color_and_tone:
          'Sepia ink and muted watercolor washes on tea-stained paper: sage lowlands, ochre highlands, grey-blue sea.',
        lighting_and_shadow:
          'No cast light; relief shown with side-lit pictorial mountain symbols and hachures.',
        texture_and_material:
          'Dip-pen lines, hachures, stippled coastlines, paper creases and foxing spots.',
        camera_and_composition:
          'Top-down map with a compass rose and an empty decorative cartouche, landmasses filling the sheet.',
        atmosphere_and_mood: 'Inviting to adventure, a realm waiting to be explored.',
        rendering_and_quality:
          'Hand-crafted finish; place names replaced by blank space or illegible scribble.',
        key_features:
          'dip-pen and watercolor; pictorial mountains and forests; hatched coastlines; compass rose; blank cartouche',
      }),
      avoid: [...AVOID, 'readable place names', 'satellite imagery'],
      briefs: [
        'World map concept of a drowned archipelago kingdom whose islands form a broken crown, dip-pen hatched coastlines, sea serpents drawn in the margins, a blank cartouche and sepia washes on tea-stained paper. No readable text or logo.',
        'World map concept of a single valley realm ringed by volcanoes, pictorial smoking peaks and a river delta in sage and ochre watercolor. No readable text or logo.',
        'World map concept of an underground cave realm, tunnels and lakes drawn as a pale-ink plan on dark-stained paper with a compass rose. No readable text or logo.',
      ],
    },
  },
};

export const aliases = { 'SP04-046': 'Speedpaint' };

export default spec;
