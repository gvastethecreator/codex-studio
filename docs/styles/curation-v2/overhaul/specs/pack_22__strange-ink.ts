import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Trading-card strange ink and paint: unsettling or unusual physical media that stay portable
// across subjects. Eight originals get card briefs; twelve new studies add bleeding veins, bitumen
// gloom, spidery nibs, bruise-tone washes, blot creatures, spatter storms, red-accent lacquer,
// tarnished metallic ink, flaking murals, verdigris washes, smeared wax and cracked varnish.
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
  tags: [tag, 'portable-style-study'],
  dna: dna(fields),
  avoid: [...avoid, 'gore', ...STYLE_AVOID],
  briefs,
});

const keep = 'Preserve the requested identity, proportions, pose and action';

const spec: Spec = {
  pack: 'pack_22',
  category: '3. Strange Ink & Paint',
  updates: {
    'SP22-117': { briefs: [
      'A blue-mantled herald drives a signal staff into the snow as an avalanche breaks over the far crest, drawn in dry angular crosshatching. No readable text or logo.',
      "Rising from a bramble thicket at midnight, a witch made of briars stretches her long arms, every thorn and twig a sharp broken pen stroke on pale paper. No readable text or logo.",
      'A plague rat king sits on a throne of bones, its fur a nest of jagged dry-pen scratches. No readable text or logo.',
    ] },
    'SP22-118': { briefs: [
      'A ferryman hauls a skiff past a half-sunk toll tower as its heavy bell swings loose, painted in diluted soot washes and clear reserves. No readable text or logo.',
      'A smoke wraith drifts out of a chimney over sleeping rooftops, its body built from transparent grey washes. No readable text or logo.',
      'A hermit\'s lantern glows in a black forest, the only light a patch of untouched paper. No readable text or logo.',
    ] },
    'SP22-119': { briefs: [
      'Two rival glass-dancers cross short sunblades above a salt basin in matte mineral pigments and broad flat planes. No readable text or logo.',
      'A saint rides a lion through a desert on a crumbling wall painting, compact color planes flaking at the edges. No readable text or logo.',
      'A winged bull guards a temple door in earthy fresco colors, its outline brushed broad and direct. No readable text or logo.',
    ] },
    'SP22-120': { briefs: [
      'An antelope-shield guardian braces against a charging sand leviathan, internal lines explaining every joint and overlap. No readable text or logo.',
      'A mechanical centaur rears up in a structured ink study, its muscles and gears mapped with selective interior lines. No readable text or logo.',
      'A giant crab knight lifts its claws in a strong silhouette, each shell segment explained by a few precise lines. No readable text or logo.',
    ] },
    'SP22-121': { briefs: [
      'A masked broker in a cobalt coat yanks a burning banner from a storm fort, built from a few large opaque gouache shapes. No readable text or logo.',
      'A giant raven perches on a gallows tree against a white moon, black gouache masses with crisp reserved edges. No readable text or logo.',
      'A lone lighthouse faces a black storm sea, three opaque shapes and one white reserve for the beam. No readable text or logo.',
    ] },
    'SP22-122': { briefs: [
      'A coal-fired stone titan catches the falling fragments of a shattered watchtower, dry broken scumbles lighting its shoulders. No readable text or logo.',
      "Drifting down the ruined aisle of a roofless abbey, a ghost bride trails a veil dragged in pale broken scumbles across the dark wet stone. No readable text or logo.",
      'A ghost wolf pack runs through a dark pine forest, their bodies emerging from dry light scumbles. No readable text or logo.',
    ] },
    'SP22-123': { briefs: [
      'Two acrobatic siblings swing across a tilting causeway to snare a drill-worm, painted in opaque tempera with uneven hand-made contours. No readable text or logo.',
      'A cat queen sits on a cushion throne with a lopsided crown, short matte tempera marks giving her a folk charm. No readable text or logo.',
      'A dragon slayer poses proudly beside a very small dragon, both painted with wobbly loving contours. No readable text or logo.',
    ] },
    'SP22-124': { briefs: [
      'A tide-prism artifact bends an incoming wave into a suspended arc around a lone keeper, carved in broad relief shapes and sharp cuts. No readable text or logo.',
      'A hooded cultist raises a lantern in a cave of carved black shapes and white gouged light. No readable text or logo.',
      "A moth-winged goddess spreads her wings over a sleeping village in bold cut relief, every vein and feathered antenna a direct gouge. No readable text or logo.",
    ] },
  },
  creates: [
    study('Bleeding Ink Veins', 'ink spreading like veins', 'ink-veins', {
      aesthetic: 'Bleeding ink veins: dark ink drawn onto damp paper so every line spreads into branching vein-like tendrils, as if the drawing were alive.',
      subject_treatment: `${keep}; draw the subject in lines that bleed outward into fine branching tendrils while its shape stays clear.`,
      color_and_tone: 'Black, oxblood or indigo ink on pale paper with soft tinted halos around lines.',
      lighting_and_shadow: 'No modeled light; density of branching tendrils creates shadow.',
      texture_and_material: 'Capillary ink branching, feathered line edges and damp paper cockling.',
      camera_and_composition: 'Preserve the requested framing with the subject emerging from branching lines.',
      atmosphere_and_mood: 'Keep the requested mood with an uneasy organic creep.',
      rendering_and_quality: 'Controlled bleeding lines with clear form, never a random stain.',
      key_features: 'lines bleeding into tendrils; feathered halos; damp paper; creeping growth',
    }, ['clean vector lines'], [
      'A root witch grows out of the forest floor, her hair and fingers bleeding into ink tendrils that spread across the page. No readable text or logo.',
      'A cracked stone heart pulses on an altar, dark veins of ink branching out from it into the paper. No readable text or logo.',
      'A family tree portrait of a haunted house spreads like veins from its foundation into the ground. No readable text or logo.',
    ]),
    study('Bitumen Glaze Gloom', 'dark bitumen glaze painting', 'bitumen-gloom', {
      aesthetic: 'Bitumen glaze gloom: oil painting sunk under warm brown-black bitumen glazes, with forms emerging like relics from a deep amber darkness.',
      subject_treatment: `${keep}; bury the subject in warm dark glazes and let only its key forms rise into amber light.`,
      color_and_tone: 'Deep warm brown-black, amber and dull gold with faint red glows.',
      lighting_and_shadow: 'One dim warm light pulling forms out of heavy brown shadow.',
      texture_and_material: 'Glossy dark glaze pools, faint cracking and thick varnish sheen.',
      camera_and_composition: 'Preserve the requested framing with most of the image in shadow.',
      atmosphere_and_mood: 'Keep the requested mood with ancient smoky gloom.',
      rendering_and_quality: 'Rich glazed depth with controlled focal light, never muddy grey.',
      key_features: 'brown-black glazes; amber focal light; glossy varnish; relic-like darkness',
    }, ['bright daylight', 'clean white'], [
      "An old alchemist bends over a glowing flask in a vaulted room drowned in amber-brown gloom, jars of strange specimens barely visible on the shelves. No readable text or logo.",
      'A mummified king sits on a throne in a tomb, only his gold mask catching the dim warm light. No readable text or logo.',
      'A tavern of smugglers counts coins by one candle, their faces half lost in brown-black glaze. No readable text or logo.',
    ]),
    study('Spidery Nib Scrawl', 'nervous fine nib drawing', 'spidery-nib', {
      aesthetic: 'Spidery nib scrawl: frantic thin dip-pen lines scribbled and looped over each other, nervous and spindly, building forms out of tangled webs of ink.',
      subject_treatment: `${keep}; build the subject from tangled nervous nib lines that still lock onto its silhouette.`,
      color_and_tone: 'Black or sepia ink on off-white paper, darkest where scribbles pile up.',
      lighting_and_shadow: 'Shadows from dense scribble tangles, light from open paper.',
      texture_and_material: 'Hairline scratchy lines, ink spatters from the nib and occasional blots.',
      camera_and_composition: 'Preserve the requested framing with a spindly, restless silhouette.',
      atmosphere_and_mood: 'Keep the requested mood with jittery nervous energy.',
      rendering_and_quality: 'Loose but intentional tangles of line, never random noise.',
      key_features: 'tangled hairline scribbles; nib spatters; spindly silhouettes; nervous energy',
    }, ['clean thick outlines'], [
      'A thin-legged tailor creature sews a cloak of shadows, its long fingers a nest of spidery pen scribbles. No readable text or logo.',
      "A crooked house leans over a crooked street at midnight, both drawn in shaky tangled nib lines with a single lit window scribbled yellow. No readable text or logo.",
      "A giant long-legged spider carries a tiny lantern-bearer on its back across a foggy marsh at night, its legs drawn in spindly trembling ink. No readable text or logo.",
    ]),
    study('Bruise-Tone Watercolor', 'sickly bruise palette washes', 'bruise-tone', {
      aesthetic: 'Bruise-tone watercolor: transparent washes in the sickly purples, yellows and greens of fading bruises, soft and unsettling.',
      subject_treatment: `${keep}; wash the subject in bruise colors that pool softly while its forms stay readable.`,
      color_and_tone: 'Violet, mustard yellow, olive green and faint blood red washes on white paper.',
      lighting_and_shadow: 'Soft wash transitions, darker violet pooling in shadows.',
      texture_and_material: 'Blooms, pooled edges, granulation and soft wet blending.',
      camera_and_composition: 'Preserve the requested framing with soft-edged color masses.',
      atmosphere_and_mood: 'Keep the requested mood with a quietly sickly unease.',
      rendering_and_quality: 'Delicate transparent layered washes, never gory or opaque.',
      key_features: 'bruise purples and yellows; soft pooling washes; granulation; sickly unease',
    }, ['bright cheerful palette'], [
      'A plague doctor walks through a village at dusk, the sky and houses washed in violet and mustard like an old bruise. No readable text or logo.',
      'A tired giant sits on a hill nursing a dent in his helmet, his skin painted in fading purple and green washes. No readable text or logo.',
      "A swamp hag stirs a bubbling cauldron in her hut as sickly yellow steam pools into violet shadows around her crooked shelves of jars. No readable text or logo.",
    ]),
    study('Blot-Grown Creatures', 'creatures developed from ink blots', 'blot-creatures', {
      aesthetic: 'Blot-grown creatures: random ink blots developed into creatures by adding a few eyes, teeth, legs and lines, so every monster keeps its accidental shape.',
      subject_treatment: `${keep}; let the subject grow from an ink blot shape with a few precise drawn additions.`,
      color_and_tone: 'Black or colored ink blots on white paper with small crisp line additions.',
      lighting_and_shadow: 'No modeled light; the blot mass is the dark form.',
      texture_and_material: 'Splotchy blot edges, splatter droplets and fine added pen details.',
      camera_and_composition: 'Preserve the requested framing with the blot as the central mass.',
      atmosphere_and_mood: 'Keep the requested mood with playful uncanny invention.',
      rendering_and_quality: 'Accidental blot shapes clarified by few deliberate lines.',
      key_features: 'ink blot bodies; few drawn details; splatter droplets; accidental shapes',
    }, ['fully rendered painting'], [
      "Scuttling across a white sheet, a seven-eyed ink creature with tiny scribbled legs chases a smaller one-eyed blot that is clearly faster and enjoying it. No readable text or logo.",
      'A spilled ink puddle becomes a sea monster when someone draws two fins and a grin on it. No readable text or logo.',
      'A splatter of ink grows antlers and becomes a forest spirit standing among drawn pencil trees. No readable text or logo.',
    ]),
    study('Spatter Storm Ink', 'flicked ink spatter storms', 'spatter-storm', {
      aesthetic: 'Spatter storm ink: ink flicked from brushes and toothbrushes in dense spray storms, forming the subject from clouds of droplets and a few firm strokes.',
      subject_treatment: `${keep}; form the subject from dense spatter clouds with a few strong strokes at its key edges.`,
      color_and_tone: 'Black ink with one accent color such as crimson or teal in the spatter.',
      lighting_and_shadow: 'Density of spatter creates value, open paper for light.',
      texture_and_material: 'Fine spray dots, larger droplets, drips and masked clean edges.',
      camera_and_composition: 'Preserve the requested framing with spray bursts directing motion.',
      atmosphere_and_mood: 'Keep the requested mood with explosive restless energy.',
      rendering_and_quality: 'Controlled spatter density with clear silhouettes, never random mess.',
      key_features: 'dense ink spray; droplet clouds; masked edges; one accent color',
    }, ['smooth gradients'], [
      'A storm giant bursts out of a cloud of flicked black and teal ink, his fists the only solid strokes. No readable text or logo.',
      "A charging bull explodes out of a spray of crimson ink droplets on a white page, its horns the only two firm black strokes. No readable text or logo.",
      'A swarm of bats pours from a belfry as a storm of spattered ink across the night sky. No readable text or logo.',
    ]),
    study('Red-Accent Black Lacquer', 'black and red lacquer painting', 'red-black-lacquer', {
      aesthetic: 'Red-accent black lacquer: glossy black painted surfaces with vivid red accents and fine gold lines, polished like old lacquer screens.',
      subject_treatment: `${keep}; paint the subject in glossy black with red and fine gold accents defining its forms.`,
      color_and_tone: 'Deep glossy black, vermilion red and thin gold lines.',
      lighting_and_shadow: 'Soft glossy reflections on black, red glowing against dark.',
      texture_and_material: 'Polished lacquer sheen, fine brushed gold lines and subtle surface reflections.',
      camera_and_composition: 'Preserve the requested framing with red leading the eye.',
      atmosphere_and_mood: 'Keep the requested mood with an elegant, quiet menace.',
      rendering_and_quality: 'Precise glossy finish with restrained accents, never busy.',
      key_features: 'glossy black; vermilion accents; fine gold lines; lacquer sheen',
    }, ['matte chalky finish'], [
      'A fox demon sits on a lacquer throne, black fur with vermilion eyes and fine gold whiskers. No readable text or logo.',
      'A warrior\'s helmet glows with red crests on a glossy black ground edged in thin gold lines. No readable text or logo.',
      'A crane flies over a black lake, its crown the only red and its feathers traced in gold. No readable text or logo.',
    ]),
    study('Tarnished Metallic Ink', 'metallic ink on dark paper', 'metallic-ink', {
      aesthetic: 'Tarnished metallic ink: silver, bronze and copper inks drawn on dark paper, their shine dulled and tarnished in places like old relics.',
      subject_treatment: `${keep}; draw the subject in metallic inks on dark paper, highlights shining and shadows tarnished.`,
      color_and_tone: 'Silver, bronze and copper inks on black or deep blue paper with tarnish tones.',
      lighting_and_shadow: 'Metallic sheen catching light on lines, dark paper as shadow.',
      texture_and_material: 'Metallic pigment glint, tarnish spots, uneven ink density and dark paper grain.',
      camera_and_composition: 'Preserve the requested framing with shining focal lines.',
      atmosphere_and_mood: 'Keep the requested mood with ancient precious mystery.',
      rendering_and_quality: 'Clean metallic line work with believable tarnish, never glitter.',
      key_features: 'metallic inks on dark paper; tarnish; glinting lines; relic feel',
    }, ['glitter', 'bright white paper'], [
      'A bronze knight rides a silver horse across black paper, patches of tarnish darkening the armor. No readable text or logo.',
      "A copper serpent coils around a silver moon drawn on deep blue paper, a few scales tarnished dark where the metallic ink dulled. No readable text or logo.",
      'An astronomer\'s star map glints in silver ink on black, a few stars tarnished to grey. No readable text or logo.',
    ]),
    study('Flaking Mural Paint', 'flaking wall painting', 'flaking-mural', {
      aesthetic: 'Flaking mural paint: an image painted on an old plaster wall, with paint lifting and flaking away to reveal plaster and older layers beneath.',
      subject_treatment: `${keep}; paint the subject as a wall image partially lost to flaking while its main forms stay readable.`,
      color_and_tone: 'Faded earth pigments, chalky blues and reds with patches of bare cream plaster.',
      lighting_and_shadow: 'Soft wall light with flaking edges casting tiny shadows.',
      texture_and_material: 'Curling paint flakes, bare plaster, cracks and older layers peeking through.',
      camera_and_composition: 'Preserve the requested framing on a visible wall surface.',
      atmosphere_and_mood: 'Keep the requested mood with a gentle melancholy decay.',
      rendering_and_quality: 'Believable flaking with readable image, never random grunge.',
      key_features: 'flaking paint; bare plaster; older layers; faded pigments',
    }, ['digital grunge overlay'], [
      'A mermaid painted on a harbor wall is flaking away, her tail half gone and an older painted ship showing underneath. No readable text or logo.',
      "A dragon mural in a ruined mountain monastery sheds curling paint flakes onto the stone floor, its tail already lost to bare plaster. No readable text or logo.",
      'A painted procession of kings flakes off a palace wall, the last king only bare plaster outline. No readable text or logo.',
    ]),
    study('Verdigris Wash', 'copper-green oxidized washes', 'verdigris-wash', {
      aesthetic: 'Verdigris wash: paintings washed in the blue-green of oxidized copper with streaked rust-brown accents, like weathered bronze turned into paint.',
      subject_treatment: `${keep}; wash the subject in verdigris greens with bronze-brown accents, keeping forms readable.`,
      color_and_tone: 'Blue-green verdigris, turquoise, bronze brown and dark patina tones.',
      lighting_and_shadow: 'Soft light with darker patina pooling in recesses.',
      texture_and_material: 'Streaked washes, mottled patina textures and dripping oxidation marks.',
      camera_and_composition: 'Preserve the requested framing with streaks following gravity.',
      atmosphere_and_mood: 'Keep the requested mood with weathered ancient calm.',
      rendering_and_quality: 'Controlled mottled layered washes, never flat green fill.',
      key_features: 'verdigris greens; bronze accents; streaked patina; weathered feel',
    }, ['bright neon colors'], [
      "A bronze angel statue weeps long verdigris streaks down its robes in a rainy cemetery, moss creeping up from its feet. No readable text or logo.",
      "A sunken ship's carved figurehead glows blue-green with oxidation beneath the waves, fish drifting through the patina on her hair. No readable text or logo.",
      "A giant copper beetle walks slowly through a misty forest, its shell mottled with turquoise patina and streaked with rust-brown drips. No readable text or logo.",
    ]),
    study('Smeared Wax Pigment', 'warm smeared wax color', 'smeared-wax', {
      aesthetic: 'Smeared wax pigment: color laid in melted wax and smeared with palette knives and fingers, glossy, layered and translucent in thin spots.',
      subject_treatment: `${keep}; build the subject from smeared wax strokes that still follow its forms.`,
      color_and_tone: 'Rich translucent wax colors with glowing layered depth.',
      lighting_and_shadow: 'Soft glowing light passing through the translucent wax layers.',
      texture_and_material: 'Smeared ridges, fingerprints, drips, glossy melted edges and layered depth.',
      camera_and_composition: 'Preserve the requested framing with smears following movement.',
      atmosphere_and_mood: 'Keep the requested mood with warm tactile intensity.',
      rendering_and_quality: 'Tactile layered wax surfaces, never flat digital paint.',
      key_features: 'smeared melted wax; translucent layers; fingerprints; glossy ridges',
    }, ['flat digital fill'], [
      'A fire spirit dances in smeared layers of orange and red wax, fingerprints visible in her flames. No readable text or logo.',
      "A honey bear sleeps curled inside a beehive painted in translucent smeared golden wax, bees drifting sleepily through the glowing layers. No readable text or logo.",
      "A stained-glass saint slowly melts into smeared colored wax in a chapel as dozens of candles burn and drip around her. No readable text or logo.",
    ]),
    study('Cracked Varnish Veil', 'old varnish craquelure painting', 'cracked-varnish', {
      aesthetic: 'Cracked varnish veil: an old painting seen through yellowed cracking varnish, with a fine craquelure web over every surface and warm aged tones.',
      subject_treatment: `${keep}; paint the subject classically and cover the image with a fine even craquelure varnish veil.`,
      color_and_tone: 'Warm yellowed tones, deep shadows and slightly muted colors under old varnish.',
      lighting_and_shadow: 'Classic painting light softened by the old amber varnish.',
      texture_and_material: 'Fine crack networks, varnish sheen, darkened grime in cracks.',
      camera_and_composition: 'Preserve the requested framing like an old gallery painting.',
      atmosphere_and_mood: 'Keep the requested mood with a hushed antique mystery.',
      rendering_and_quality: 'Consistent fine crack pattern over a coherent painting.',
      key_features: 'fine craquelure; yellowed varnish; aged tones; old master feel',
    }, ['clean modern finish'], [
      'A portrait of a cat duchess in pearls hides under a web of fine cracks and yellow varnish. No readable text or logo.',
      'A painted sea battle of monsters and galleons ages behind a veil of cracked amber varnish. No readable text or logo.',
      'An old family portrait of three ghosts hangs in a hallway, the craquelure running across their pale faces. No readable text or logo.',
    ]),
  ],
};

export default spec;
