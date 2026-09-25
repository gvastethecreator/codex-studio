import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'forced T-pose',
  'object turned into an avatar',
  'franchise likeness',
  'readable text',
  'logo',
];

// Organic media rebuild surfaces and keep subject, pose and view; profiles own a stated format.
// Review rule: never force a person into a T-pose and never turn a requested object into an avatar.
const organic =
  'Keep the prompt subject, action, pose, setting and camera view and rebuild its surfaces in this organic CGI method; never force a T-pose and never turn a requested object into an avatar.';
const profile = (what: string) =>
  `Keep the prompt subject and its identity; this preset owns ${what}. It never forces a T-pose on a posed subject and never turns a requested object into an avatar.`;
const change = (what: string) =>
  `Keep the prompt subject recognizable with its pose, setting and camera view; ${what} (a declared change), without forcing a T-pose or turning an object into an avatar.`;

function og(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? organic, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_03',
  category: '6. Organic Character And Bio CGI',
  updates: {
    'SP03-049': {
      dna: og({
        aesthetic:
          'Character model presentation: a finished 3D character standing on flat grey, lit evenly so proportions, costume construction and materials read without drama.',
        subject_treatment:
          'Keep the prompt character and costume; use a relaxed A-pose or T-pose only when the prompt leaves the pose open, keep any requested pose or action, and show one front view unless a turnaround is requested. An object stays an object on the same grey stage.',
        color_and_tone:
          'Neutral mid-grey backdrop, accurate unstylized skin and fabric colors, no color grade or tinted light.',
        lighting_and_shadow:
          'Large soft key and near-equal fill with a faint rim, shadows short and low in contrast so no detail hides.',
        texture_and_material:
          'Clean fabric weaves, leather seams, buckles and subsurface skin, every material clearly separated from the next.',
        camera_and_composition:
          'Full figure centered with a long lens at chest height, feet visible on a soft contact shadow.',
        atmosphere_and_mood: 'Neutral and ready, a character waiting for its first animation.',
        rendering_and_quality:
          'Production-clean model with symmetric construction, no background props, no swatch panels and no text.',
        key_features:
          'neutral A-pose or T-pose only when unposed; flat grey backdrop; even soft lighting; full figure centered; material separation',
      }),
      avoid: [...AVOID, 'material swatch panels', 'extra views unless requested'],
      dropAvoid: ['action pose'],
      briefs: [
        'Character model presentation of an adult plague-ward nun in a layered grey wool habit, leather apron and brass herb censer on her belt, relaxed A-pose, full figure centered on flat mid-grey, even soft key and fill, feet on a soft contact shadow. No text or logo.',
        'Character model presentation of an adult orc ferryman in an oilskin coat and rope-wrapped boots, standing in a T-pose, every seam, buckle and patch clearly separated, long lens at chest height. No text or logo.',
        'Character model presentation of an adult fencing master caught in a deep lunge as requested, rapier extended, the pose kept while the flat grey stage and even lighting stay. No text or logo.',
      ],
    },
    'SP03-051': {
      dna: og({
        aesthetic:
          "Medical 3D illustration: the subject's body made partly translucent so organs, vessels, bones and muscles show in layered, color-coded depth.",
        subject_treatment: change(
          'reveal its internal anatomy through translucent outer layers or a clean cutaway window, plausible for that creature, person or object',
        ),
        color_and_tone:
          'Clinical palette of red arteries, blue veins, yellow nerves, ivory bone and soft pink and plum organs inside milky translucent skin.',
        lighting_and_shadow:
          'Soft shadowless wrap light with a gentle rim glow on the translucent skin edges and no dramatic cast shadows.',
        texture_and_material:
          'Smooth glassy outer skin, satin organ surfaces, finely branching vessels and fibrous muscle bands.',
        camera_and_composition:
          'Keep the requested view on a white or pale blue backdrop, with open margin left around the subject.',
        atmosphere_and_mood: 'Calm, clean and instructive, wonder without any gore.',
        rendering_and_quality:
          'Textbook-clean anatomy with no blood, wounds or labels, and structures plausible for the subject.',
        key_features:
          'translucent skin layer; color-coded arteries and veins; ivory bones; shadowless wrap light; pale backdrop',
      }),
      avoid: [...AVOID, 'labels', 'leader lines', 'wounds'],
      briefs: [
        'Medical 3D illustration of a griffin in side view, milky translucent skin revealing color-coded red arteries and blue veins, ivory hollow bones in the wings, a four-chambered heart and plum-colored lungs, shadowless wrap light on a pale blue backdrop. No labels, text or logo.',
        'Medical 3D illustration of an adult rower pulling an oar, translucent skin revealing the working muscle chains, the spine and the ivory shoulder blades, rim glow on the skin edges. No labels, text or logo.',
        'Medical 3D illustration of a giant river snail, its shell and body made translucent to show the coiled organs, the heart and the nerve ring, soft wrap light on white. No labels, text or logo.',
      ],
    },
    'SP03-054': {
      dna: og({
        aesthetic:
          'Food advertising CGI: the dish exploded into a frozen moment, ingredients levitating in an arc, sauces splashing and droplets suspended around the hero item.',
        subject_treatment: profile(
          'the frozen food-ad moment of levitating components, splash and steam around the requested food, and a non-food subject keeps its identity and only receives the glistening staging',
        ),
        color_and_tone:
          'Saturated fresh color of glossy reds, bright greens and golden crusts against a warm gradient or deep contrasting backdrop.',
        lighting_and_shadow:
          'Strong backlight making steam and droplets glow, a soft front fill and specular pings on every wet surface.',
        texture_and_material:
          'Micro droplets, condensation beads, crisp crumbs, glossy sauce ribbons and salt flakes caught in mid-air.',
        camera_and_composition:
          'Hero item centered low, components arcing around it on a diagonal, shallow depth with the nearest droplets sharp.',
        atmosphere_and_mood: 'Crave-inducing and energetic, appetite frozen at its peak.',
        rendering_and_quality:
          'Hyperreal simulation of splashes and particles, glossy but never plastic, with no packaging text or brand marks.',
        key_features:
          'levitating ingredient arc; frozen splashes and droplets; backlit steam; specular pings; diagonal hero composition',
      }),
      avoid: [...AVOID, 'packaging', 'plastic-looking food'],
      briefs: [
        'Food advertising CGI of a roasted game pie bursting open, crust shards, herbs, peppercorns and gravy ribbons levitating in an arc around it, backlit steam glowing, specular pings on the glossy gravy, warm dark gradient backdrop. No text or logo.',
        'Food advertising CGI of a stack of honey-soaked griddle cakes with blackberries and cream splashing upward mid-air, honey droplets frozen on a diagonal, shallow depth with the nearest drop sharp. No text or logo.',
        'Food advertising CGI of a dark chocolate tart split open, pomegranate seeds and chocolate shards frozen in a rising spiral, strong backlight through the seeds, deep burgundy backdrop. No text or logo.',
      ],
    },
    'SP03-057': {
      dna: og({
        aesthetic:
          'Collectible avatar render: a stylized bust centered on a flat color field, built from a few chunky trait pieces such as headwear, eyewear, clothing and one accessory in glossy toy materials.',
        subject_treatment: profile(
          'the centered bust framing on a flat color field with glossy trait accessories for a person or creature, while a requested object stays that object, centered on the same field and never given a face',
        ),
        color_and_tone:
          'One flat saturated background color, rich gold and neon accents, and soft pastel or gem-colored trait pieces.',
        lighting_and_shadow:
          'Clean front-left studio softbox with a bright rim light and glossy highlights on every accessory.',
        texture_and_material:
          'Smooth vinyl skin, glossy lacquered accessories, brushed gold chains and soft fabric hoods.',
        camera_and_composition:
          'Chest-up bust, perfectly centered in a slight three-quarter turn, with identical margins as if one of a series.',
        atmosphere_and_mood:
          'Confident and collectible, a character assembled from swappable traits.',
        rendering_and_quality:
          'Clean toy-like render with no background detail, no rarity text, no numbers and no brand marks.',
        key_features:
          'centered chest-up bust; flat color field; swappable trait accessories; glossy vinyl and gold; bright rim light',
      }),
      avoid: [...AVOID, 'numbers', 'rarity labels', 'ape character'],
      briefs: [
        'Collectible avatar render of an adult raven-headed alchemist bust, chest-up and centered on a flat teal field, chunky trait pieces of brass goggles, a hooded velvet cloak and a gold chain with a vial, glossy vinyl feathers, bright rim light. No text, numbers or logo.',
        'Collectible avatar render of an adult undead king bust with a crooked iron crown and a cracked jade monocle, centered on a flat burgundy field, lacquered gold collar gleaming under the softbox. No text, numbers or logo.',
        'Collectible avatar render of an enchanted hourglass kept as an object with no face, centered on a flat mustard field, glossy gold trim and gem-colored trait charms hung from its frame. No text, numbers or logo.',
      ],
    },
    'SP03-059': {
      dna: og({
        aesthetic:
          'Digital fashion: garments that exist only as cloth simulation, impossible fabrics draping, floating and folding with real weight on a body or on nothing at all.',
        subject_treatment: change(
          'restyle its clothing into simulated digital garments, a wardrobe change, and dress an object or empty space only when the prompt asks',
        ),
        color_and_tone:
          'Iridescent, liquid-metal or gradient-dyed fabrics against a neutral grey or deep charcoal studio background.',
        lighting_and_shadow:
          'Soft studio key with bright specular sheen tracing every fold and a subtle colored bounce from the fabric.',
        texture_and_material:
          'Simulated drape with gravity, compression folds, fluttering hems and impossible surfaces like liquid chrome or holographic knit.',
        camera_and_composition:
          'Keep the requested view; enough fabric in motion that the simulation itself becomes the subject.',
        atmosphere_and_mood: 'Futuristic and weightless, couture freed from the sewing room.',
        rendering_and_quality:
          'Physically plausible cloth with correct collision against the body, with no stiff shells or intersecting geometry.',
        key_features:
          'cloth simulation drape; impossible fabrics; fluttering hems; specular sheen on folds; correct body collision',
      }),
      avoid: [...AVOID, 'stiff cloth shell', 'cloth intersecting the body'],
      briefs: [
        'Digital fashion render of an adult sorceress wearing a floor-length gown of liquid-chrome cloth that pours off her shoulders and flutters into a spiral hem, specular sheen tracing every fold, deep charcoal studio. No text or logo.',
        'Digital fashion render of an empty hooded cloak of gradient-dyed silk floating upright with no wearer, its folds holding the shape of an absent body, soft key and violet bounce. No text or logo.',
        'Digital fashion render of an adult dancer mid-spin in a pleated holographic-knit coat, the pleats compressing and flaring with real weight, neutral grey studio. No text or logo.',
      ],
    },
    'SP03-062': {
      dna: og({
        aesthetic:
          'Organic digital sculpture presentation: the subject sculpted as flowing soft volumes whose planes follow muscle, growth and gravity, polypainted and shown on a turntable plinth.',
        color_and_tone:
          'Muted polypaint in naturalistic hues of moss green, flesh and bark brown, with darker cavity tint and lighter peaks.',
        lighting_and_shadow:
          'Soft three-point studio light with a warm key and cool rim, subsurface glow in thin parts like ears and fins.',
        texture_and_material:
          'Muscle flow, skin folds, pores, wrinkles and bark grain sculpted into the surface, with no hard edges or panel seams.',
        camera_and_composition:
          'Keep the requested view; the form placed on a simple round plinth against a dark gradient.',
        atmosphere_and_mood: 'Alive and tactile, a creature that seems to breathe under the light.',
        rendering_and_quality:
          'Polypainted sculpt with real subsurface and form flow, distinct from a bare matcap sculpt and from a finished film-textured asset.',
        key_features:
          'flowing muscle and growth planes; polypaint color; cavity tint; subsurface in thin parts; round turntable plinth',
      }),
      avoid: [...AVOID, 'matcap-only grey clay', 'panel seams'],
      briefs: [
        'Organic digital sculpture render of an ancient swamp troll crouched on a round plinth, flowing muscle planes, deep skin folds and pores, moss-green polypaint with dark cavity tint, warm key and cool rim, subsurface glow in its ears. No text or logo.',
        "Organic digital sculpture render of a gnarled treant's face emerging from a trunk, growth planes spiraling around the eyes, bark-brown polypaint with lighter peaks, dark gradient behind. No text or logo.",
        'Organic digital sculpture render of a deep-sea anglerfish on a plinth, its thin fins glowing with subsurface light, sculpted wrinkles along the jaw, cool rim on the teeth. No text or logo.',
      ],
    },
    'SP03-076': {
      name: 'Mylar Foil Balloon Render',
      dna: og({
        aesthetic:
          'Mylar foil balloon: the subject rebuilt as an inflated metallic-foil balloon, two flat sheets heat-sealed at the rim and puffed into soft pillowed forms.',
        color_and_tone:
          'Mirror silver, gold, rose gold or candy-tinted foil reflecting the surroundings in warped color.',
        lighting_and_shadow:
          'Bright studio or party lights producing broad warped reflections and hot specular spots along the curves.',
        texture_and_material:
          'Crimped heat-sealed edge seams, radial pinch wrinkles where forms narrow, a small valve tail and no hard volumes.',
        camera_and_composition:
          'Keep the requested view; the flat-sided pillowed profile reads clearly and floats slightly.',
        atmosphere_and_mood: 'Festive and slightly absurd, a celebration you could pop with a pin.',
        rendering_and_quality:
          'Thin inflated foil with seams and wrinkles, distinct from twisted latex balloon animals and from solid chrome.',
        key_features:
          'heat-sealed crimped rim seam; pillowed flat-sheet volumes; pinch wrinkles; warped mirror reflections; floating lightness',
      }),
      avoid: [
        ...AVOID,
        'twisted latex balloon animal',
        'solid chrome sculpture',
        'gallery artist likeness',
      ],
      briefs: [
        'Mylar foil balloon render of a rose-gold kraken floating above a banquet hall table, every tentacle a pillowed foil tube with crimped heat-sealed seams, pinch wrinkles at the tips, warped reflections of candlelight. No text or logo.',
        'Mylar foil balloon render of a silver swan bobbing on a ribbon above a castle moat, its neck a pinched foil tube, hot specular spots along the curves. No text or logo.',
        "Mylar foil balloon render of a gold ship's anchor sagging slightly as it loses air on a wooden deck, soft wrinkles gathering at the flukes. No text or logo.",
      ],
    },
  },
  creates: [
    {
      name: 'Photoreal Digital Human',
      domain: 'offline digital human rendering',
      tags: ['digital-human', 'skin-shading', 'photoreal'],
      dna: og({
        aesthetic:
          'Photoreal digital human: an adult face and body built from layered skin shading of epidermis, dermis and blood, with groomed strand hair and wet, refractive eyes.',
        subject_treatment:
          'Keep the prompt subject, pose, setting and camera; render people as original photoreal adult digital humans, and leave non-human subjects in their own form at the same skin-level fidelity.',
        color_and_tone:
          'Natural skin with red undertones in ears, nostrils and lips, uneven pigmentation, a slight flush and a true neutral grade.',
        lighting_and_shadow:
          'Soft key with a clear catchlight, light bleeding red through thin skin at the edges of shadows.',
        texture_and_material:
          'Pores, fine vellus hair, micro wrinkles, freckles and moles, strand-level brows and lashes and a wet meniscus on the eye.',
        camera_and_composition:
          'Keep the requested view; an 85 mm portrait feel with one eye tack sharp.',
        atmosphere_and_mood: 'Intimate and unsettlingly present, a person who was never there.',
        rendering_and_quality:
          'Path-traced skin and eye caustics with asymmetry kept, never waxy, airbrushed or doll-like.',
        key_features:
          'layered subsurface skin; strand hair and lashes; refractive wet eyes; pores and vellus hair; red light bleed in thin skin',
      }),
      avoid: [
        ...AVOID,
        'real person likeness',
        'celebrity likeness',
        'waxy skin',
        'airbrushed skin',
      ],
      briefs: [
        'Photoreal digital human render of an adult silver-haired falconer with weathered freckled skin, strand-level brows, one wet refractive eye with a sharp catchlight, red light bleeding through the rim of the ear, 85 mm portrait feel. No text or logo.',
        'Photoreal digital human render of an adult woman with vitiligo patches across her cheeks and nose, fine vellus hair on her jaw catching a rim light, uneven natural pigmentation under a soft key. No text or logo.',
        'Photoreal digital human render of an elderly adult stonemason in close three-quarter view, stone dust caught in his pores and lashes, deep crow’s-feet, subsurface warmth in the nose. No text or logo.',
      ],
    },
    {
      name: 'Hand-Painted Texture Character',
      domain: 'hand-painted texture game character',
      tags: ['hand-painted', 'stylized-3d', 'diffuse-only'],
      dna: og({
        aesthetic:
          'Hand-painted texture CGI: chunky stylized 3D forms whose lighting, highlights and occlusion are painted straight into the color texture and rendered almost unlit.',
        subject_treatment: change(
          'rebuild it with chunky stylized proportions of large hands, feet and shoulders',
        ),
        color_and_tone:
          'Warm saturated painted palette, highlights painted as pale warm strokes and shadows as cool purple washes in the texture.',
        lighting_and_shadow:
          'Mostly flat, unlit shading where the painted texture carries form, with only a soft ambient and a faint rim.',
        texture_and_material:
          'Visible brush strokes on armor, cloth and skin, painted edge highlights on every bevel, no specular or normal maps.',
        camera_and_composition:
          'Keep the requested view; a slightly high three-quarter angle suits the chunky silhouette.',
        atmosphere_and_mood:
          'Warm and adventurous, the friendly heft of an old online fantasy world.',
        rendering_and_quality:
          'Diffuse-only painted look on low-poly silhouettes, with no photoreal shading or glossy reflections.',
        key_features:
          'painted-in highlights and shadows; chunky proportions; visible brush strokes in textures; diffuse-only shading; bright edge highlights',
      }),
      avoid: [...AVOID, 'photoreal skin', 'glossy reflections'],
      briefs: [
        'Hand-painted texture CGI render of an adult dwarven innkeeper with oversized hands carrying three tankards, highlights painted as warm strokes on his leather apron, cool purple shadow washes, flat diffuse-only shading, slightly high three-quarter angle. No text or logo.',
        'Hand-painted texture CGI render of a hulking adult ogre shaman leaning on a bone staff, painted edge highlights on every bead and tusk, visible brush strokes on the hide cloak. No text or logo.',
        'Hand-painted texture CGI render of a mossy stone golem guarding a ruined gate, painted light on the top planes and purple washes under the ledges, chunky low-poly silhouette. No text or logo.',
      ],
    },
    {
      name: 'Écorché Muscle Study',
      domain: 'flayed anatomical sculpture',
      tags: ['ecorche', 'anatomy', 'muscle-study'],
      dna: og({
        aesthetic:
          'Écorché muscle study: the subject shown as a flayed anatomical sculpture, each muscle a distinct striated form wrapping the bone like a classical art-school figure.',
        subject_treatment: change(
          'show it without skin, with every muscle group, tendon and superficial vein sculpted as an anatomical study, never wounded or bloody',
        ),
        color_and_tone:
          'Muted terracotta and brick-red muscle, pearly ivory tendons and fascia, bone white at the joints.',
        lighting_and_shadow:
          'Single high sculpture key from the upper side carving each muscle belly with soft rounded shadow.',
        texture_and_material:
          'Fine directional striations along the fibers, glossy tendon sheaths and crisp origin and insertion points.',
        camera_and_composition:
          'Keep the requested view; the pose shows muscles in contraction and stretch.',
        atmosphere_and_mood:
          'Studious and powerful, the machinery of movement laid bare without horror.',
        rendering_and_quality:
          'Clean museum-model finish with no blood, gore, wounds or exposed organs.',
        key_features:
          'flayed muscle groups; fiber striations; ivory tendons; single high sculpture key; clean museum finish',
      }),
      avoid: [...AVOID, 'blood', 'gore', 'open wounds', 'exposed organs'],
      briefs: [
        'Écorché muscle study render of a rearing warhorse, every muscle a distinct terracotta striated form wrapping the bones, pearly ivory tendons in the legs, a single high sculpture key carving each muscle belly, clean museum finish. No blood, text or logo.',
        'Écorché muscle study render of a charging bull, flayed-anatomy style like a museum anatomical sculpture, neck and shoulder muscles bunched in full contraction, glossy tendon sheaths at the hocks, clean matte red-brown muscle and ivory tendon, soft rounded studio shadows on a grey sweep. No blood, gore, text or logo.',
        'Écorché muscle study render of a great horned owl with its wings spread, the flight muscles and the long wing tendons laid bare, bone-white joints. No blood, text or logo.',
      ],
    },
    {
      name: 'Articulated Skeleton Render',
      domain: 'natural-history skeleton mount',
      tags: ['skeleton', 'natural-history', 'museum-mount'],
      dna: og({
        aesthetic:
          'Natural-history skeleton mount: the subject reduced to its articulated bones, wired together in a lifelike pose on slender iron rods like a museum display.',
        subject_treatment: change(
          'show it as its own articulated skeleton mounted on a thin iron armature, anatomically plausible for the creature',
        ),
        color_and_tone:
          'Aged ivory to tea-brown bone with darker staining at the joints, a black iron armature and a neutral gallery backdrop.',
        lighting_and_shadow:
          'Museum gallery spots from above casting crisp rib shadows across the plinth and floor.',
        texture_and_material:
          'Bone porosity, suture lines on the skull, worn joint surfaces, wire loops and brass pins at the joints.',
        camera_and_composition:
          'Keep the requested view; the full skeleton reads as a silhouette of ribs and limb bones.',
        atmosphere_and_mood: 'Solemn and scholarly, a life reconstructed from what remains.',
        rendering_and_quality:
          'Plausible bone count and joints for the species or invented creature, with no flesh and no gore.',
        key_features:
          'articulated bones; iron armature rods; ivory to tea-brown bone; rib shadows from gallery spots; brass joint pins',
      }),
      avoid: [...AVOID, 'flesh', 'gore', 'cartoon skeleton'],
      briefs: [
        'Natural-history skeleton mount of a two-headed wyvern in a striking pose, aged ivory bones wired on slender iron rods, crisp rib shadows cast by gallery spots across a stone plinth, brass pins glinting at every joint. No text or logo.',
        'Natural-history skeleton mount of a mermaid resting on a rock, the human spine flowing into the vertebrae of a fish tail, tea-brown bone and black iron armature. No text or logo.',
        'Natural-history skeleton mount of a hare in mid-bound, the fine leg bones held on a single thin rod, suture lines visible on the skull. No text or logo.',
      ],
    },
    {
      name: 'Differential Growth Folds',
      domain: 'differential growth surface',
      tags: ['differential-growth', 'ruffles', 'generative-organic'],
      dna: og({
        aesthetic:
          "Differential growth: the subject's surfaces grown into dense crinkled ruffles like lettuce coral, kale or brain folds, where the edge outgrows the center.",
        subject_treatment: change(
          'rebuild its surfaces as densely ruffled differential-growth folds while its silhouette stays readable',
        ),
        color_and_tone:
          'One organic hue per form, such as coral pink, pale sea green or bone white, darker deep inside the folds.',
        lighting_and_shadow:
          'Soft top light with deep occlusion between the ruffles and subsurface glow on the thin fold edges.',
        texture_and_material:
          'Ever-smaller wavy frills, thin membrane edges of consistent thickness, no seams and no repeating tiles.',
        camera_and_composition:
          'Keep the requested view; the silhouette stays clear while the surface boils with folds.',
        atmosphere_and_mood: 'Hypnotic and alive, a form that kept growing after it was finished.',
        rendering_and_quality:
          'Simulation-grown surface with self-avoiding folds, not noise displacement or fractal copies.',
        key_features:
          'crinkled ruffled edges; edge-outgrows-center folds; deep fold occlusion; subsurface on thin edges; single organic hue',
      }),
      avoid: [...AVOID, 'noise displacement', 'repeating tiles'],
      briefs: [
        "Differential growth render of a crowned stag's head whose antlers and neck ruff are grown into dense coral-pink crinkled ruffles, deep occlusion between the folds, subsurface glow on the thin edges, soft top light. No text or logo.",
        "Differential growth render of a hooded monk's cowl grown into pale sea-green ruffles like lettuce coral, the face hidden in the deep folds of shadow. No text or logo.",
        'Differential growth render of a large egg-shaped seed pod lying on dark sand, its shell erupting into bone-white frills that get smaller toward the edges. No text or logo.',
      ],
    },
    {
      name: 'Space-Colonization Vine Overgrowth',
      domain: 'procedural vine growth',
      tags: ['procedural-growth', 'vines', 'overgrowth'],
      dna: og({
        aesthetic:
          'Procedural vine overgrowth: branching stems grown by a space-colonization algorithm, climbing and wrapping every surface of the subject toward the light.',
        subject_treatment: change(
          'grow procedural vines, roots and leaves over it along its surfaces without hiding its silhouette or changing what it is',
        ),
        color_and_tone:
          "Fresh leaf greens and dark stems with small pale blossoms, laid over the subject's own colors.",
        lighting_and_shadow:
          'Directional sunlight with dappled leaf shadows on the subject beneath and backlit translucent leaves.',
        texture_and_material:
          'Branch thickness tapering from root to tip, tendrils gripping edges and leaves turned toward the light.',
        camera_and_composition:
          'Keep the requested view; the growth direction of the vines leads the eye upward across the subject.',
        atmosphere_and_mood: 'Patient and reclaiming, nature quietly taking something back.',
        rendering_and_quality:
          'Branching with correct taper and attachment, with no floating leaves or random green noise.',
        key_features:
          'algorithmic branching vines; taper from root to tip; tendrils gripping edges; dappled leaf shadows; growth toward light',
      }),
      avoid: [...AVOID, 'floating leaves', 'random green noise'],
      briefs: [
        "Procedural vine overgrowth render of a fallen giant's iron helmet half-buried in a meadow, branching stems climbing from the ground and wrapping the visor, tapering tendrils gripping every edge, backlit translucent leaves, dappled shadows. No text or logo.",
        'Procedural vine overgrowth render of a grand piano in a ruined ballroom, vines growing up its legs and across the lid toward a broken skylight, small pale blossoms on the keys. No text or logo.',
        'Procedural vine overgrowth render of a modern satellite dish on a rooftop, the dish still modern and intact while vines spiral up its mast toward the sun. No text or logo.',
      ],
    },
    {
      name: 'Soft-Body Squash Simulation',
      domain: 'soft-body physics simulation',
      tags: ['soft-body', 'simulation', 'squash'],
      dna: og({
        aesthetic:
          'Soft-body simulation: the subject behaving like a volume-preserving jelly, squashed against surfaces, bulging between obstacles and wobbling mid-bounce.',
        subject_treatment:
          'Keep the prompt subject, its material, setting and camera; simulate it as a soft body that squashes, bulges and jiggles on contact while preserving its volume.',
        color_and_tone:
          "The subject's own colors, a little brighter where it is stretched thin and deeper where it compresses.",
        lighting_and_shadow:
          'Clean studio key with glossy highlights stretching and pinching along the deformed curves.',
        texture_and_material:
          'Smooth surfaces with compression bulges, stretch lines, flattened contact patches and ripples frozen mid-wobble.',
        camera_and_composition:
          'Keep the requested view; a contact point or obstacle stays in frame to show the squash.',
        atmosphere_and_mood: 'Playful and tactile, satisfying enough to want to poke.',
        rendering_and_quality:
          'Volume-preserving deformation with believable contact; not melting, not liquid and not broken.',
        key_features:
          'volume-preserving squash; bulges between obstacles; flattened contact patches; frozen wobble ripples; stretched highlights',
      }),
      avoid: [...AVOID, 'melting', 'liquid splash', 'shattering'],
      briefs: [
        'Soft-body simulation render of a plump adult bard squeezing through a narrow castle arrow-slit, his whole body bulging out on both sides of the stone, volume preserved, glossy highlights stretching along the deformed curves. No text or logo.',
        'Soft-body simulation render of a stone gargoyle dropped onto a cathedral floor, flattening on contact and rippling mid-wobble, its wings jiggling. No text or logo.',
        'Soft-body simulation render of a sleeping grey seal squashed between two boulders, its body bulging over the rocks, a flattened contact patch against the stone. No text or logo.',
      ],
    },
    {
      name: 'Animation Rig Overlay',
      domain: 'character rig preview',
      tags: ['rigging', 'animation', 'bones'],
      dna: og({
        aesthetic:
          'Animation rig preview: a shaded character with its joint chain drawn through the body as slim bones and colored control curves orbiting the limbs.',
        subject_treatment: profile(
          'the rig-preview presentation of joint bones and colored control curves around the subject in its requested pose',
        ),
        color_and_tone:
          'Neutral grey or lightly textured model, the bone chain in pale blue and control curves in saturated yellow, red and blue by side.',
        lighting_and_shadow:
          'Flat even studio light with soft occlusion, keeping bones and curves readable over the model.',
        texture_and_material:
          'Slim tapered bones from joint to joint, circle and arrow-shaped control curves and semi-transparent model skin.',
        camera_and_composition:
          'Keep the requested view; the full rig visible, controls clear of the silhouette so it stays readable.',
        atmosphere_and_mood: 'Technical and expectant, a puppet waiting for its animator.',
        rendering_and_quality:
          'Clean overlay of bones and curves with no interface panels, text, numbers or timeline.',
        key_features:
          'joint bone chain through the body; colored control curves by side; semi-transparent skin; even light; requested pose kept',
      }),
      avoid: [...AVOID, 'interface panels', 'timeline', 'numbers'],
      briefs: [
        'Animation rig preview of an adult four-armed temple guardian in a fighting stance, a pale-blue bone chain visible through its semi-transparent grey skin, saturated yellow and red control circles orbiting each wrist, flat even light. No UI, text or logo.',
        'Animation rig preview of a winged lion mid-leap, spine and wing bone chains glowing through the grey model, blue curves on the left side and red on the right. No UI, text or logo.',
        'Animation rig preview of a coiled sea serpent, a long spine chain with evenly spaced yellow control rings along its body. No UI, text or logo.',
      ],
    },
    {
      name: 'Garment Fit Strain Map',
      domain: 'cloth simulation strain visualization',
      tags: ['cloth-sim', 'heatmap', 'garment-fit'],
      dna: og({
        aesthetic:
          'Garment fit strain map: simulated clothing colored by a stress heatmap, cool blue where fabric hangs loose, green to red where it stretches tight.',
        subject_treatment: profile(
          'the fit-check presentation of fabric colored by strain, on the requested wearer in their pose or, when none is given, on a faceless grey fit form; a fabric object is mapped on its own cloth',
        ),
        color_and_tone:
          'Smooth blue-green-yellow-red gradient across the fabric, neutral grey skin and a dark neutral backdrop.',
        lighting_and_shadow:
          'Soft even light that keeps the heatmap colors true while the folds still read in shade.',
        texture_and_material:
          'Simulated folds, tension lines radiating from stress points at shoulders, elbows and seams, and visible seam lines.',
        camera_and_composition:
          'Keep the requested view; the full garment in frame with its stress points clearly visible.',
        atmosphere_and_mood: 'Clinical and revealing, the place where cloth fights the body.',
        rendering_and_quality:
          'Continuous heatmap across the cloth mesh with no legend, scale bar, numbers or interface.',
        key_features:
          'blue-to-red strain heatmap; tension lines from stress points; grey fit form or wearer; visible seams; no legend',
      }),
      avoid: [...AVOID, 'legend', 'scale bar', 'numbers'],
      briefs: [
        'Garment fit strain map render of a laced leather doublet on a faceless grey fit form, red-hot strain at the lacing and waist fading to cool blue at the hem, tension lines radiating from the shoulder seams, dark neutral backdrop. No legend, text or logo.',
        'Garment fit strain map render of an adult pikeman in a quilted gambeson caught mid-lunge, strain flaring red across the back and elbows, loose blue at the skirts. No legend, text or logo.',
        'Garment fit strain map render of a canvas war tent pulled taut by guy ropes, strain hot at the pegs and ridge, loose blue across the flaps. No legend, text or logo.',
      ],
    },
    {
      name: 'Chitin Exoskeleton Plating',
      domain: 'insect chitin surfacing',
      tags: ['chitin', 'exoskeleton', 'structural-color'],
      dna: og({
        aesthetic:
          "Chitin exoskeleton: the subject's outer shell rebuilt from overlapping lacquer-hard insect plates, joined by flexible membranes and edged with fine bristles.",
        subject_treatment: change(
          'rebuild its outer surface as segmented insect chitin plates with sutures and bristles, keeping its silhouette',
        ),
        color_and_tone:
          'Deep beetle black, bronze-green or oil-slick structural iridescence shifting to violet at grazing angles, with amber membranes.',
        lighting_and_shadow:
          'Macro studio key with sharp specular streaks on the curved plates and soft backlight through thin membranes.',
        texture_and_material:
          'Glossy plates with micro-pitting, suture lines, hinged segments and fine setae hairs along every edge.',
        camera_and_composition:
          'Keep the requested view; macro-like depth of field even at full-figure scale.',
        atmosphere_and_mood: 'Alien and armored, beautiful and faintly repellent.',
        rendering_and_quality:
          'Structural color and plate hinges rendered precisely, not metal armor painted to look like a bug.',
        key_features:
          'overlapping chitin plates; structural iridescence; flexible amber membranes; setae bristles; macro depth',
      }),
      avoid: [...AVOID, 'painted metal armor', 'extra insect legs'],
      briefs: [
        'Chitin exoskeleton render of an adult duelist standing guard, her armor replaced by overlapping bronze-green beetle plates with oil-slick iridescence, amber membranes at the joints, fine bristles on every edge, macro-like depth of field. No text or logo.',
        'Chitin exoskeleton render of a hunting hound crouched in ferns, a segmented black chitin back shifting to violet at grazing angles, soft backlight through the membranes. No text or logo.',
        'Chitin exoskeleton render of a sailing ship whose hull is plated in hinged chitin segments with sutures, specular streaks along the curved plates. No text or logo.',
      ],
    },
    {
      name: 'Motion-Capture Marker Suit',
      domain: 'motion-capture stage',
      tags: ['mocap', 'performance-capture', 'production'],
      dna: og({
        aesthetic:
          'Motion-capture stage: a performer in a tight black suit studded with small reflective marker balls, standing in a grey capture volume ringed by cameras.',
        subject_treatment: profile(
          'the capture-stage look, where the requested performer, creature or prop keeps its pose while wearing a black marker suit or carrying reflective markers',
        ),
        color_and_tone:
          'Matte black suit, bright white-grey markers glowing under the capture strobes, and a cool grey floor with a taped grid.',
        lighting_and_shadow:
          'Ring-light strobes around the volume make every marker flare, with soft top light over the stage.',
        texture_and_material:
          'Hook-and-loop patches, stretch fabric, a headband and face dots, and props wrapped in grey tape with markers.',
        camera_and_composition:
          "Keep the requested view; the performer's pose is the focus with capture cameras visible at the edges.",
        atmosphere_and_mood:
          'Behind-the-scenes and intense, an actor pretending hard in an empty room.',
        rendering_and_quality:
          'Photoreal production still with no screens, skeleton overlays, numbers or interface.',
        key_features:
          'black marker suit; reflective marker balls; grey capture volume; ring-light strobes; taped proxy props',
      }),
      avoid: [...AVOID, 'monitors', 'skeleton overlay', 'costume instead of marker suit'],
      briefs: [
        'Motion-capture stage render of an adult performer in a black marker suit rearing up as a dragon, arms spread wide as wings, reflective markers flaring under ring-light strobes, grey capture volume with cameras at the edges. No screens, text or logo.',
        'Motion-capture stage render of two adult stunt performers sword-fighting with grey taped proxy swords studded with markers, mid-parry, taped grid on the floor. No screens, text or logo.',
        'Motion-capture stage render of a trained border collie with tiny reflective markers on its legs and back, leaping over a taped proxy hurdle. No screens, text or logo.',
      ],
    },
    {
      name: 'Photoreal Creature Hide',
      domain: 'film creature skin surfacing',
      tags: ['creature', 'hide', 'vfx-surfacing'],
      dna: og({
        aesthetic:
          'Film creature hide: the subject covered in massive, wrinkled, scarred hide with layered displacement, wet sheen in the folds and dust caked on high points.',
        color_and_tone:
          'Grey-brown to slate hide with pale scar tissue, darker wet creases and dusty lighter ridges.',
        lighting_and_shadow:
          'Overcast soft key with a hard rim, glancing light revealing every wrinkle and scale edge.',
        texture_and_material:
          'Multi-scale displacement of big folds, medium wrinkles, fine cracks and pebbled scales, with scars, dried mud and moss.',
        camera_and_composition:
          'Keep the requested view; a long-lens close-up on a flank or face sells the scale.',
        atmosphere_and_mood: 'Heavy and ancient, an animal older than the landscape.',
        rendering_and_quality:
          'Feature-VFX surfacing where wetness, dust and scars follow the anatomy, with no rubber-suit sheen.',
        key_features:
          'multi-scale hide displacement; wet creases and dusty ridges; scar tissue; glancing light; long-lens scale',
      }),
      avoid: [...AVOID, 'rubber suit sheen', 'uniform scale tiling'],
      briefs: [
        "Film creature hide render of an ancient behemoth's eye and cheek in long-lens close-up, massive grey-brown folds, pale scar tissue across the brow, wet sheen in the creases, dust caked on the ridges, overcast key with a hard rim. No text or logo.",
        'Film creature hide render of a basilisk coiled over broken temple columns, pebbled scales, dried mud in the folds and moss on its back, glancing light along each scale edge. No text or logo.',
        'Film creature hide render of a war rhinoceros with a cracked horn wading through a river, wet creases darkening at the waterline, dusty ridges above. No text or logo.',
      ],
    },
    {
      name: 'Animated-Film Food Render',
      domain: 'stylized animated-film food',
      tags: ['stylized-food', 'feature-animation', 'food'],
      dna: og({
        aesthetic:
          'Animated-film food: dishes simplified into plump rounded shapes with exaggerated glossy sauces, jewel-bright colors and soft painterly subsurface, as cooked in a feature cartoon.',
        subject_treatment:
          'Keep the prompt subject, action, setting and camera; food is simplified into plump stylized shapes, and any other subject keeps its identity while taking the same warm, glossy finish.',
        color_and_tone:
          'Jewel-bright reds, butter yellows and herb greens with warm golden highlights and colored shadows, never grey.',
        lighting_and_shadow:
          'Warm key with a glowing rim, big soft specular blobs on sauces and a steam wisp lit from behind.',
        texture_and_material:
          'Simplified crumb and grill marks, thick glossy sauce ribbons, plump rounded volumes and painterly subsurface in fruit and cheese.',
        camera_and_composition:
          'Keep the requested view; a slightly low angle makes the dish look heroic and huge.',
        atmosphere_and_mood: 'Cozy and mouthwatering, comfort food in a storybook kitchen.',
        rendering_and_quality:
          'Stylized feature-animation finish, distinct from hyperreal food advertising and from clay or toy food.',
        key_features:
          'plump simplified food shapes; exaggerated glossy sauce; jewel-bright colors; colored shadows; backlit steam wisp',
      }),
      avoid: [...AVOID, 'photoreal food texture', 'studio character likeness'],
      briefs: [
        'Animated-film food render of a hearty tavern stew in a cast-iron pot, plump rounded carrots and dumplings, thick glossy gravy with big soft specular blobs, a backlit steam wisp, jewel-bright colors and warm colored shadows, slightly low heroic angle. No text or logo.',
        'Animated-film food render of a giant wheel of cheese being cut on a wooden board, painterly subsurface glow in the wedge, butter-yellow highlights and a warm rim. No text or logo.',
        'Animated-film food render of glossy baked apples and a lattice-top crumble pie cooling on a stone sill, simplified crumb, jewel-red juices bubbling at the edges. No text or logo.',
      ],
    },
  ],
};

export const aliases = { 'SP03-076': 'Balloon Art (Inflatable)' };

export default spec;
