import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Trading-card workshop painting: portable medium studies where the paint process builds the
// requested subject. The eight originals keep their DNA and get three card-worthy briefs; twelve
// new studies add workshop methods (underlayers, impasto, scumble, gouache, pencil, charcoal,
// verdaccio, broken color, scraping, body color, wipe-out).
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
  avoid: [...avoid, ...STYLE_AVOID],
  briefs,
});

const keep = "Preserve the requested identity, proportions, pose and action";

const spec: Spec = {
  pack: 'pack_22',
  category: '1. Workshop Painting',
  updates: {
    'SP22-101': { briefs: [
      'A giant glasswing moth settles on the cracked dome of a half-flooded observatory during an eclipse, its transparent wings built from glaze over glaze. No readable text or logo.',
      'A knight in tarnished armor kneels before a sleeping stone giant, candlelight glowing through layer after layer of amber and umber glaze. No readable text or logo.',
      'A fortune-teller turns a single card on a velvet table, her face emerging from deep translucent shadow into warm glazed light. No readable text or logo.',
    ] },
    'SP22-102': { briefs: [
      'Two geomancers strain to raise a broken stone causeway over a canal, bodies and slabs built from broad overlapping opaque strokes. No readable text or logo.',
      'A dragon hatchling bursts out of a lava egg in a cave, every scale a thick opaque dab of orange and violet paint. No readable text or logo.',
      'A market witch sells jars of weather at a crowded stall, the thunderstorms inside painted in solid overlapping acrylic colors. No readable text or logo.',
    ] },
    'SP22-103': { briefs: [
      'A cloud whale threads through a rain curtain toward a tiny cliffside harbor, its pale belly left as untouched white paper. No readable text or logo.',
      'A water spirit rises from a mountain spring in loose transparent blues, soft wet edges bleeding into a hard-edged waterfall. No readable text or logo.',
      'A lantern-lit river market at dusk glows in layered transparent washes, the lantern cores protected as bare paper. No readable text or logo.',
    ] },
    'SP22-104': { briefs: [
      'An immense brass tide clock is built into a sea cliff while one keeper raises a lantern, the pen contour carrying every gear and watercolor adding the sea. No readable text or logo.',
      'A goblin tinkerer rides a clockwork snail through a mushroom forest, drawn in wiry ink with a few pools of green and rust wash. No readable text or logo.',
      'A sky galleon moors at a floating dock, its rigging all precise pen line and its sails a single transparent wash of sunset gold. No readable text or logo.',
    ] },
    'SP22-105': { briefs: [
      'An ice rescuer swings from a cracking blue arch toward a stranded wind-sled, dragged dry-brush paint catching the frost on every edge. No readable text or logo.',
      'A werewolf stands on a windy moor, its fur a storm of directional dry-brush strokes with scraped lights along the spine. No readable text or logo.',
      'A desert nomad leads a camel through a sandstorm painted in dragged ochre strokes that let the dark ground peek through. No readable text or logo.',
    ] },
    'SP22-106': { briefs: [
      'A giant moss-green stag beetle carries a luminous seed through a salt cave of pale crystals, modeled in tiny disciplined crosshatched strokes. No readable text or logo.',
      'An angelic herald in gold armor blows a long trumpet, her robe folds built from patient short tempera hatchings. No readable text or logo.',
      'A monk illuminates a glowing orb in a scriptorium, his face and hands modeled in fine crosshatched egg tempera. No readable text or logo.',
    ] },
    'SP22-107': { briefs: [
      'A hand-built wind skiff cuts between rust-red mesas as a dust front folds over the ridge, the sky laid in soft grain-edged pastel masses. No readable text or logo.',
      'A unicorn grazes in a twilight meadow of soft violet pastel, its mane a few crisp drawn accents against blurred masses. No readable text or logo.',
      'A lighthouse keeper watches a storm roll in over a grey-green sea built from broad smudged pastel layers. No readable text or logo.',
    ] },
    'SP22-108': { briefs: [
      'A cracked glass seed capsule rests in a flooded greenhouse as one vermilion-veined sprout unfolds, drawn in graphite with the sprout the only color. No readable text or logo.',
      'A cloaked assassin crouches on a rooftop in graphite tones, her single crimson scarf the only color on the page. No readable text or logo.',
      'An old dragon sleeps coiled around a castle ruin in soft pencil, one glowing gold eye opening in color. No readable text or logo.',
    ] },
  },
  creates: [
    study('Grisaille Underlayer Build', 'monochrome underpainting glazed over', 'grisaille-underlayer', {
      aesthetic: 'Grisaille underlayer build: the image first modeled in cool greys, then warmed with thin color glazes so the grey underpainting still shapes every form.',
      subject_treatment: `${keep}; model the forms fully in grey values first and let color glazes sit on top without changing their structure.`,
      color_and_tone: 'Cool silvery grey foundation with thin warm glazes of the requested colors on top.',
      lighting_and_shadow: 'Strong sculpted value structure from the grey layer, glazes only tinting lights and shadows.',
      texture_and_material: 'Smooth oil film, visible grey showing through thin color, soft transitions at turning edges.',
      camera_and_composition: 'Preserve the requested framing, with a clear value hierarchy guiding the eye.',
      atmosphere_and_mood: 'Keep the requested mood; the method adds solidity and quiet depth.',
      rendering_and_quality: 'Sculptural grey modeling under restrained color, never flat or airbrushed.',
      key_features: 'grey underpainting; thin color glazes; sculpted values; silvery depth',
    }, ['flat saturated color', 'airbrush gradients'], [
      'A marble-skinned golem guards a temple door, its body modeled in cool grey and warmed only at the cheeks and knuckles with thin rose glaze. No readable text or logo.',
      'A sorceress holds a floating crystal, the grey underpainting still visible in her robes while the crystal glows in glazed violet. No readable text or logo.',
      'A silver wolf pack runs through a moonlit birch forest, painted in greys with a single blue glaze over the whole night. No readable text or logo.',
    ]),
    study('Loaded-Brush Impasto Oil', 'thick brush-loaded oil paint', 'loaded-impasto', {
      aesthetic: 'Loaded-brush impasto oil: thick oil paint laid with heavily loaded brushes, each stroke standing up from the surface and catching light.',
      subject_treatment: `${keep}; build the forms from thick directional brush strokes that follow their volume.`,
      color_and_tone: 'Rich saturated oil colors with thick mixed strokes and bright highlights at the ridges.',
      lighting_and_shadow: 'Requested light enhanced by real paint ridges catching highlights and casting tiny shadows.',
      texture_and_material: 'Heavy raised strokes, bristle grooves, buttery paint peaks and wet-on-wet mixing.',
      camera_and_composition: 'Preserve the requested framing, thickest paint on the focal point.',
      atmosphere_and_mood: 'Keep the requested mood, amplified by energetic physical paint.',
      rendering_and_quality: 'Confident bold brushwork with visible thickness, never smooth or digital.',
      key_features: 'thick raised strokes; bristle grooves; paint ridges catching light; bold color',
    }, ['smooth flat paint', 'digital brush texture'], [
      'A phoenix erupts from a burning tower in thick loaded strokes of orange and gold that stand up from the canvas like real flames. No readable text or logo.',
      'A dwarven blacksmith hammers a glowing axe, sparks painted as raised dabs of yellow paint catching the gallery light. No readable text or logo.',
      'A sunflower field under a stormy sky becomes a sea of thick swirling strokes around a lone scarecrow knight. No readable text or logo.',
    ]),
    study('Scumbled Veil Layers', 'broken opaque scumbles over dark', 'scumbled-veil', {
      aesthetic: 'Scumbled veil layers: thin broken layers of lighter opaque paint dragged over darker passages, creating hazy veils, mist and soft luminous air.',
      subject_treatment: `${keep}; keep the subject firm and apply scumbled veils around and over it to create atmosphere without hiding it.`,
      color_and_tone: 'Dark rich base colors softened by pale broken veils of blue-grey, rose or gold.',
      lighting_and_shadow: 'Soft diffused light suggested by pale scumbles glowing over dark grounds.',
      texture_and_material: 'Dry dragged paint films, broken edges, underlayer showing through each veil.',
      camera_and_composition: 'Preserve the requested framing, with atmosphere layered in depth.',
      atmosphere_and_mood: 'Keep the requested mood, adding mist, distance and quiet air.',
      rendering_and_quality: 'Soft luminous veils over solid forms, never blurry digital fog.',
      key_features: 'pale dragged veils; dark showing through; misty depth; firm focal form',
    }, ['digital fog filter', 'flat opaque fill'], [
      'A ghost ship emerges from sea mist, its sails scumbled in pale grey veils over a dark hull so it seems half there. No readable text or logo.',
      'A forest spirit stands in a clearing at dawn, pale rose scumbles drifting across the dark trees behind her. No readable text or logo.',
      'A mountain temple floats above clouds dragged in pale broken layers over a deep blue valley. No readable text or logo.',
    ]),
    study('Matte Gouache Blocking', 'flat opaque gouache shapes', 'matte-gouache', {
      aesthetic: 'Matte gouache blocking: the image built from flat opaque gouache shapes with velvety matte finish and crisp edges between color blocks.',
      subject_treatment: `${keep}; simplify forms into clear flat color blocks that still read as the requested subject.`,
      color_and_tone: 'Velvety matte colors in limited harmonious palettes with clean value steps.',
      lighting_and_shadow: 'Light and shadow as flat separate color shapes rather than gradients.',
      texture_and_material: 'Chalky matte paint, faint brush marks inside flats and crisp painted edges.',
      camera_and_composition: 'Preserve the requested framing with clear graphic shape arrangement.',
      atmosphere_and_mood: 'Keep the requested mood with a calm, designed clarity.',
      rendering_and_quality: 'Clean flat opaque shapes and deliberate edges, no glossy gradients.',
      key_features: 'flat opaque blocks; velvety matte finish; crisp shape edges; limited palette',
    }, ['glossy gradients', 'photographic detail'], [
      'A fox wizard reads a floating spellbook in a library of flat teal and mustard gouache shapes, every shadow a single matte block. No readable text or logo.',
      'A giant tortoise carries a village on its back across a pink desert painted in velvety flat colors. No readable text or logo.',
      'A knight and her griffin rest on a cliff at sunset, the sky three flat bands of matte gouache. No readable text or logo.',
    ]),
    study('Ink-Line Gouache Fill', 'bold ink outline with gouache', 'ink-gouache', {
      aesthetic: 'Ink-line gouache fill: bold confident ink contours filled with opaque gouache color, like a classic hand-painted card illustration.',
      subject_treatment: `${keep}; outline the subject in bold ink and fill it with flat to lightly modeled gouache.`,
      color_and_tone: 'Bright opaque gouache fills held by black ink lines, with gentle shading inside.',
      lighting_and_shadow: 'Simple shading painted inside the lines, highlights in opaque white.',
      texture_and_material: 'Varying brush-ink line weight, opaque paint fills and small white highlight dabs.',
      camera_and_composition: 'Preserve the requested framing with a strong readable silhouette.',
      atmosphere_and_mood: 'Keep the requested mood with bold, clear, classic clarity.',
      rendering_and_quality: 'Crisp confident inking and clean fills, never sketchy or muddy.',
      key_features: 'bold ink contours; opaque gouache fills; white highlight dabs; clear silhouette',
    }, ['sketchy lines', 'photographic rendering'], [
      'A goblin pirate swings from a mast holding a stolen crown, outlined in bold black ink and filled with bright gouache. No readable text or logo.',
      'A dragon-rider salutes from the saddle of a crimson beast, every scale inked and flooded with opaque red. No readable text or logo.',
      'A frog alchemist stirs a bubbling potion, green fills and white highlight dabs inside thick ink lines. No readable text or logo.',
    ]),
    study('Layered Colored Pencil Build', 'many-layer colored pencil', 'layered-pencil', {
      aesthetic: 'Layered colored pencil build: dozens of light colored pencil layers built up until colors glow, with visible stroke direction and paper tooth.',
      subject_treatment: `${keep}; build the forms slowly from many light directional pencil layers following their surfaces.`,
      color_and_tone: 'Rich layered hues mixed optically from many pencil colors, glowing but not glossy.',
      lighting_and_shadow: 'Soft modeled light from layered density, highlights left as lightly covered paper.',
      texture_and_material: 'Directional pencil strokes, paper tooth sparkle and waxy buildup in darks.',
      camera_and_composition: 'Preserve the requested framing with detailed focal areas.',
      atmosphere_and_mood: 'Keep the requested mood with warm, patient handmade detail.',
      rendering_and_quality: 'Careful layered strokes with visible direction, never smooth airbrush.',
      key_features: 'many pencil layers; directional strokes; paper tooth sparkle; optical color mix',
    }, ['smooth airbrush', 'flat digital fill'], [
      'A fairy queen sits on a mushroom throne, her iridescent wings built from dozens of layered pencil strokes in violet and green. No readable text or logo.',
      'A snowy owl sorcerer spreads its wings, every feather a bundle of directional white and blue pencil strokes. No readable text or logo.',
      'A treasure hoard glitters in a cave, each coin a patient buildup of yellow, orange and brown pencil. No readable text or logo.',
    ]),
    study('Charcoal Mass Sculpting', 'charcoal masses and erasing', 'charcoal-mass', {
      aesthetic: 'Charcoal mass sculpting: forms carved out of broad smudged charcoal masses by erasing lights and pressing in darks, dramatic and velvety.',
      subject_treatment: `${keep}; sculpt the forms from broad charcoal masses and eraser lifts rather than outlines.`,
      color_and_tone: 'Deep velvety blacks, smoky greys and bright erased whites on pale paper.',
      lighting_and_shadow: 'Dramatic chiaroscuro with erased highlights cutting out of dark masses.',
      texture_and_material: 'Smudged charcoal dust, eraser strokes, finger blending and crisp dark accents.',
      camera_and_composition: 'Preserve the requested framing with strong light-dark contrast.',
      atmosphere_and_mood: 'Keep the requested mood, intensified by dramatic dark masses.',
      rendering_and_quality: 'Bold sculptural value masses and crisp erased lights, never timid lines.',
      key_features: 'broad charcoal masses; erased highlights; smudged dust; dramatic contrast',
    }, ['thin outline drawing', 'color painting'], [
      'A shadow demon rises from a pit of smoke, sculpted in velvety charcoal with its eyes erased into blinding white. No readable text or logo.',
      'A lone warrior stands in a burning doorway, her silhouette cut from black charcoal as erased flames roar behind her. No readable text or logo.',
      'A kraken drags a ship under a storm, the waves smudged in grey masses with crests erased to white. No readable text or logo.',
    ]),
    study('Verdaccio Flesh Underlayer', 'green underpainting for skin', 'verdaccio', {
      aesthetic: 'Verdaccio flesh underlayer: figures first modeled in a muted green-grey underpainting, then warmed with thin pink and ochre flesh glazes so skin looks alive.',
      subject_treatment: `${keep}; model figures and forms in green-grey first, then glaze warm color over the lights.`,
      color_and_tone: 'Muted olive-green shadows under warm rosy and ochre skin glazes.',
      lighting_and_shadow: 'Cool green shadows and warm glowing lights from the layered method.',
      texture_and_material: 'Smooth tempera or oil film with green showing through in half tones.',
      camera_and_composition: 'Preserve the requested framing with figures as the focal point.',
      atmosphere_and_mood: 'Keep the requested mood with a warm, living, classical feel.',
      rendering_and_quality: 'Delicate layered modeling, never flat or plastic skin.',
      key_features: 'green-grey underlayer; warm flesh glazes; cool shadows; classical modeling',
    }, ['plastic skin', 'flat cel shading'], [
      'A saint-like healer holds a glowing wound closed on a soldier, their skin warm over cool green shadows. No readable text or logo.',
      'An elven archer draws her bow in a sunlit glade, green undertones cooling her cheek on the shadow side. No readable text or logo.',
      'Twin oracles sit back to back, their faces modeled in olive green and warmed only where the candle falls. No readable text or logo.',
    ]),
    study('Broken-Color Oil Strokes', 'broken color stroke painting', 'broken-color', {
      aesthetic: 'Broken-color oil strokes: side-by-side dabs of unblended color that mix in the eye, vibrating with light and movement.',
      subject_treatment: `${keep}; build the forms from separate unblended color dabs that still describe their shape.`,
      color_and_tone: 'Pure bright dabs placed side by side, complementary flecks in shadows.',
      lighting_and_shadow: 'Shimmering light from juxtaposed warm and cool dabs rather than blending.',
      texture_and_material: 'Short thick strokes, visible dabs, unblended edges and lively surface.',
      camera_and_composition: 'Preserve the requested framing with light-filled open space.',
      atmosphere_and_mood: 'Keep the requested mood with vibrating light and air.',
      rendering_and_quality: 'Lively broken strokes with clear forms, never muddy blending.',
      key_features: 'unblended color dabs; optical mixing; shimmering light; lively strokes',
    }, ['smooth blending', 'flat fills'], [
      'A dragon basks on a sunlit cliff, its scales a shimmer of separate turquoise, violet and gold dabs. No readable text or logo.',
      'A market of floating lanterns on a river at dusk vibrates in broken strokes of orange and blue. No readable text or logo.',
      'A knight rides through a poppy field at noon, the whole field a flicker of unblended red and green dabs. No readable text or logo.',
    ]),
    study('Scraped-Back Layers', 'scraped paint revealing layers', 'scraped-back', {
      aesthetic: 'Scraped-back layers: multiple dried paint layers scraped and sanded back with blades so bright under-colors emerge through worn upper surfaces.',
      subject_treatment: `${keep}; reveal the subject's lights and textures by scraping through top layers to earlier colors.`,
      color_and_tone: 'Dark top layers scraped to reveal bright red, gold or turquoise underlayers.',
      lighting_and_shadow: 'Lights emerge as scraped-through areas; darks remain untouched surface.',
      texture_and_material: 'Blade scrape marks, sanded edges, layered paint strata and worn surfaces.',
      camera_and_composition: 'Preserve the requested framing with scraped highlights guiding the eye.',
      atmosphere_and_mood: 'Keep the requested mood with an aged, excavated feel.',
      rendering_and_quality: 'Controlled scrape marks shaping form, never random distress overlay.',
      key_features: 'scraped-through underlayers; blade marks; layered strata; revealed highlights',
    }, ['uniform grunge overlay', 'digital distress texture'], [
      'An ancient guardian statue awakens as its dark stone is scraped back to reveal glowing gold underneath its cracks. No readable text or logo.',
      'A storm wizard\'s lightning is scraped through a black sky into a bright turquoise layer below. No readable text or logo.',
      'A fire elemental dances in a dark hall, its flames scraped out of the surface to red and orange strata. No readable text or logo.',
    ]),
    study('Body-Color Highlights', 'watercolor with opaque white', 'body-color', {
      aesthetic: 'Body-color highlights: transparent watercolor forms finished with opaque white and pale gouache highlights, crisp sparkles over soft washes.',
      subject_treatment: `${keep}; paint the forms in transparent washes and add opaque highlights only on their brightest edges.`,
      color_and_tone: 'Soft transparent washes on toned paper, crisp opaque white and pale cream accents.',
      lighting_and_shadow: 'Soft wash shadows with bright opaque highlights on edges and reflections.',
      texture_and_material: 'Transparent wash granulation, opaque dabs sitting on top and toned paper.',
      camera_and_composition: 'Preserve the requested framing with sparkling focal highlights.',
      atmosphere_and_mood: 'Keep the requested mood with fresh, sparkling light.',
      rendering_and_quality: 'Clean washes and deliberate opaque accents, never chalky overuse.',
      key_features: 'transparent washes; opaque white highlights; toned paper; sparkling edges',
    }, ['chalky overpainting', 'digital glow'], [
      'A mermaid rests on a wet rock at dusk, soft washes of teal and violet with sparkling opaque white on every droplet. No readable text or logo.',
      'A crystal golem stands in a cave, its facets painted in transparent blue and finished with crisp white body-color edges. No readable text or logo.',
      'A snow queen walks a frozen river, frost sparkles dabbed in opaque white over pale grey-blue washes. No readable text or logo.',
    ]),
    study('Raw Umber Wipe-Out', 'monochrome wipe-out underpainting', 'umber-wipeout', {
      aesthetic: 'Raw umber wipe-out: a single warm brown paint layer brushed on and wiped away with rags to pull out the lights, fast and moody.',
      subject_treatment: `${keep}; pull the subject's lights out of a warm brown layer with rags and brush ends.`,
      color_and_tone: 'Monochrome warm umber from deep brown shadows to pale wiped cream lights.',
      lighting_and_shadow: 'Strong wiped-out lights emerging from deep warm brown darkness.',
      texture_and_material: 'Rag wipe textures, brush-end scratches and soft thin paint films.',
      camera_and_composition: 'Preserve the requested framing with a strong light-dark design.',
      atmosphere_and_mood: 'Keep the requested mood with a warm, moody, sketch-like immediacy.',
      rendering_and_quality: 'Quick confident wipe-outs with clear forms, never muddy.',
      key_features: 'single umber layer; rag wipe-out lights; brush-end scratches; warm monochrome',
    }, ['full color', 'digital smoothness'], [
      'A vampire lord stands in a candlelit crypt, his pale face wiped out of warm umber darkness with a single rag stroke. No readable text or logo.',
      'A caravan crosses a desert at dusk, its lanterns pulled from brown paint with the tip of a brush. No readable text or logo.',
      "An old seer's eyes glow out of a warm brown shadow, wiped clean with a thumb while her hands and crystal ball stay lost in the umber dark. No readable text or logo.",
    ]),
  ],
};

export default spec;
