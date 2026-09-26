import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'named mecha or franchise robot likeness',
  'fixed canon pilot character',
  'turning a non-mechanical subject into a robot',
  'adding a hangar, cockpit or battle the prompt did not ask for',
  'readable HUD or interface text',
];

// Category rule (review validation): a requested plant stays a plant. Every preset redraws the prompt
// in its own mechanical-anime rendering mechanism; mecha vocabulary never replaces the subject.
const redraw =
  'Redraw the prompt subject, action, setting and camera in this mechanical anime rendering; a plant, animal, object or person keeps its identity and is never turned into a robot, hangar or battle scene.';

function mech(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? redraw, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_05',
  category: '2. Mecha & Cyberpunk',
  updates: {
    'SP05-056': {
      dna: mech({
        aesthetic:
          'Hyper-angular limited-animation cel: thick tapered brush-pen outlines, flat fills with no gradients, and triangular highlight and shadow shapes cut at sharp angles.',
        color_and_tone:
          'Hot coral, apricot and lemon yellow as flat fills against clean cyan and lavender shadow triangles; no blending, every hue separated by an ink line.',
        lighting_and_shadow:
          'One hard warm key rendered as jagged triangular shadow wedges and star-shaped glints on edges; shadows are flat lavender shapes, never soft gradients.',
        texture_and_material:
          'Smooth untextured cel paint with a few dry-brush speed flecks along outlines; surfaces read through shadow shape rather than surface detail.',
        camera_and_composition:
          'Keep the requested view but push its perspective: foreshortened near forms, converging diagonals, and solid color speed wedges behind the main silhouette.',
        atmosphere_and_mood:
          'Brash, urgent and optimistic, like a shout drawn in straight lines and sharp corners.',
        rendering_and_quality:
          'Flat two-tone cel with brush-pen line weight swelling at corners, crisp triangle glints, and no airbrush or 3D shading.',
        key_features:
          'thick tapered brush-pen outlines; triangular shadow and highlight wedges; flat coral, yellow and cyan fills; star-shaped glints; forced foreshortening with speed wedges',
      }),
      avoid: [...AVOID, 'soft gradient shading', 'literal flames', 'drill-faced super robot copy'],
      dropAvoid: ['Gurren-like drill face'],
      briefs: [
        "Running across a flooded dam in a spiked welding mask, a demolition foreman races the orange hexagonal warning lights that ripple across the concrete wall behind her as the spillway gates groan open. No readable text or logo.",
        "Hundreds of rescue workers line up in perfect geometric rows on a highway overpass, their hazard vests glowing orange as an enormous shadow crosses the sunset. No readable text or logo.",
        "In a silent command room, a single mug of coffee sits on a console as every screen around it turns warning orange at once. No readable text or logo.",
      ],
    },
    'SP05-222': {
      dna: mech({
        aesthetic:
          'Late-1980s police-procedural OVA cel: precise pencil-traced line, two-tone hand-painted cel shading, and poster-color painted backgrounds of ordinary city daylight.',
        color_and_tone:
          'Utility teal, signal amber, concrete gray and off-white in economical flat blocks, the whole palette slightly faded like an aged cel print.',
        lighting_and_shadow:
          'Overcast daylight with a single soft-edged shadow tone per surface and thin white highlight slivers on metal edges; no dramatic contrast.',
        texture_and_material:
          'Poster-color brush texture in backgrounds, clean flat cel paint on figures and machines, and small painted scuffs on machine panels.',
        camera_and_composition:
          'Keep the requested view; favor level eye-height framing with measured documentary spacing and ordinary street detail kept uncluttered.',
        atmosphere_and_mood:
          'Procedural, dry and quietly funny, workday calm where a machine is just another piece of equipment.',
        rendering_and_quality:
          'Hand-painted cel finish with slight registration shift, faint film grain and precise mechanical line; no digital glow or bloom.',
        key_features:
          'pencil-precise 1980s OVA line; two-tone cel shading; poster-color daylight backgrounds; teal and amber utility palette; faint film grain',
      }),
      avoid: [...AVOID, 'robot battle', 'neon night', 'tram', 'readable police markings'],
      briefs: [
        "Carefully guiding a teal-and-amber labor mech through a narrow market street, a middle-aged city operator waves apologetically at every fruit seller as the machine tiptoes past their stalls. No readable text or logo.",
        "Two municipal robot pilots fill out damage forms on the hood of a truck while their machines sit sheepishly beside a toppled billboard frame. No readable text or logo.",
        "At dawn in a quiet bayside hangar, a labor robot stands under a tarp with a coffee thermos balanced on its knee. No readable text or logo.",
      ],
    },
    'SP05-224': {
      dna: mech({
        aesthetic:
          'Clean digital architectural anime: ruler-straight hairline contours traced from a 3D layout, near-white fills, and overexposed bloom on every bright plane.',
        color_and_tone:
          'White, cool gray and pale steel dominate, with one deep ultramarine shadow tone and a single tiny red or cyan signal accent.',
        lighting_and_shadow:
          'Flat shadowless daylight blown toward white with bloom spilling over edges; one crisp ultramarine shadow band where planes turn away.',
        texture_and_material:
          'Seamless glossy surfaces with hairline panel seams and almost no grain; reflections drawn as flat pale-blue strips.',
        camera_and_composition:
          'Keep the requested view; enforce perfectly vertical lines, parallel spacing and large empty white negative space around the subject.',
        atmosphere_and_mood:
          'Severe, antiseptic and silent, order so complete that it becomes uneasy.',
        rendering_and_quality:
          'Hairline vector precision, bloom-softened whites, one flat shadow band per form, and no hand-drawn wobble anywhere.',
        key_features:
          'ruler-straight hairline contours; overexposed white bloom; single ultramarine shadow band; hairline panel seams; vast white negative space',
      }),
      avoid: [...AVOID, 'dirty grunge', 'warm cozy palette', 'crowded city'],
      briefs: [
        "Walking through a spotless white arcology garden where every tree is trimmed into a perfect sphere, a geneticist in a hooded lab coat notices one wild dandelion growing through the pavement. No readable text or logo.",
        "A tactical exosuit kneels in a sterile corridor, its visor reflecting a wall of perfectly identical sleeping citizens in glass pods. No readable text or logo.",
        "On a white rooftop above the utopian city, a single potted cactus sits beside a chrome railing in the wind. No readable text or logo.",
      ],
    },
    'SP05-228': {
      dna: mech({
        aesthetic:
          'Bleached pastel anime illustration: soft sepia-gray colored-pencil line instead of ink, chalk-pale cel fills, and visible paper grain multiplied over everything.',
        color_and_tone:
          'Bone, chalk white, faded silver and pale blue-gray; the darkest value is a warm mid-gray, so the image stays high-key.',
        lighting_and_shadow:
          'Diffuse overcast glow with soft single-step pale blue shadows and no visible light source; edges dissolve into white.',
        texture_and_material:
          'Cold-press paper tooth, colored-pencil grain inside shadows, and small flaked enamel chips drawn as tiny gray flecks.',
        camera_and_composition:
          'Keep the requested framing; leave generous white margins and let contours fade out toward the edges of the frame.',
        atmosphere_and_mood:
          'Elegiac, hushed and tender, like a memory of a machine slowly fading out.',
        rendering_and_quality:
          'Low-contrast pencil line, pale single-step shadows, paper grain overlay and vignette-to-white edges; no ink blacks.',
        key_features:
          'sepia-gray colored-pencil line; bleached pastel fills; paper grain overlay; flaked enamel chips; fade-to-white edges',
      }),
      avoid: [...AVOID, 'deep black shadows', 'saturated neon', 'heavy ink outlines'],
      briefs: [
        "Kneeling in a field of rusted robot bodies, a tall slender android caretaker waters a single flower growing from an old robot’s open chest plate. No readable text or logo.",
        "An elderly android sits alone on a bench at a ruined station, polishing a pocket watch that stopped a century ago. No readable text or logo.",
        "Under a washed pastel sky, a single android hand rests on a dune, sand slowly covering its fingers. No readable text or logo.",
      ],
    },
    'SP05-236': {
      dna: mech({
        aesthetic:
          'Early-1980s real-robot TV cel: thick uniform ink line, flat military paint colors, one hard black shadow fill, and dirt dabbed onto the cel with a sponge.',
        color_and_tone:
          'Dark olive, iron gray, earth brown and oxidized orange at low saturation, with every shadow filled solid near-black.',
        lighting_and_shadow:
          'Single hard overhead key; shadows are solid black shapes with no midtone, plus one thin pale highlight line on top edges.',
        texture_and_material:
          'Sponge-dabbed mud and rust speckle over flat cel color, scratched paint chips, and grainy 16 mm film transfer.',
        camera_and_composition:
          'Keep the requested view; crop tight and compact so the subject fills the frame with squat, heavy mass.',
        atmosphere_and_mood:
          'Grim, practical and stubborn, machines as disposable tools of a long campaign.',
        rendering_and_quality:
          'Uniform-weight ink line, flat paint with black shadow fills, sponge grime and soft film grain; no gloss or bloom.',
        key_features:
          'uniform thick ink line; solid black shadow fills; sponge-dabbed mud and rust; olive and iron palette; 16 mm film grain',
      }),
      avoid: [...AVOID, 'glossy chrome', 'neon bloom', 'clean showroom paint'],
      briefs: [
        "Skidding through a muddy trench on roller-dash feet, a squat four-meter armored walker with a dented hatch sprays grime across a line of broken twin machines. No readable text or logo.",
        "A stoic pilot eats canned beans on the shoulder of her battered walker while rain drips off its scope lenses. No readable text or logo.",
        "In a muddy scrapyard at dusk, hundreds of identical disposable armored walkers lie stacked like empty tin cans while one crow picks at a loose scope lens. No readable text or logo.",
      ],
    },
    'SP05-238': {
      dna: mech({
        aesthetic:
          'Digital tokusatsu-homage anime: clean cel shading in bold saturated primaries, low telephoto giant-scale framing, and fine glowing grid lines tracing major contours.',
        subject_treatment:
          'Keep the prompt subject, action and setting redrawn in this mechanical anime rendering; this preset owns a low telephoto giant-scale camera, and a plant stays a plant, never a robot or kaiju.',
        color_and_tone:
          'Steel white, navy and signal red or cyan in hard blocks, against bright summer-sky blue and towering white cumulus.',
        lighting_and_shadow:
          'Crisp midday sun with hard two-tone cel shadows and thin glowing cyan grid lines along the major edges.',
        texture_and_material:
          'Smooth digital cel paint with tiny miniature-set detail at ground level so the subject reads colossal.',
        camera_and_composition:
          "Owns a worm's-eye telephoto view: horizon low, depth compressed, the subject towering above tiny rooftops, poles or trees.",
        atmosphere_and_mood:
          'Bright heroic summer-afternoon spectacle with a hint of toy-model wonder.',
        rendering_and_quality:
          'Clean vector cel lines, two shadow values, glowing grid-line accents and crisp cumulus; no painterly mush.',
        key_features:
          "worm's-eye telephoto giant scale; bold primary color blocks; glowing cyan grid-line contours; towering summer cumulus; miniature ground detail",
      }),
      avoid: [
        ...AVOID,
        'white-blue-red hero robot copy',
        'V-fin horned faceplate copy',
        'suited hero copy',
      ],
      briefs: [
        "Rising slowly between power lines in a silent pastel suburb, a colossal navy-and-silver sea serpent in rubber-suit proportions blinks down at a woman hanging laundry on her balcony. No readable text or logo.",
        "A giant hero in a chunky helmet sits on a hill at sunset, carefully not crushing the tiny shrine beside him. No readable text or logo.",
        "In a quiet suburb, every power line is humming in the same pitch while the sky slowly turns grid-shaped. No readable text or logo.",
      ],
    },
    'SP05-240': {
      dna: mech({
        aesthetic:
          'Lineless triangular color-facet animation: forms built from flat translucent triangles, with shadows cut as complementary-colored shards instead of darker values.',
        color_and_tone:
          'Ember orange, hot yellow and electric cyan over charcoal; overlapping shards produce magenta and lime where they cross.',
        lighting_and_shadow:
          'No modeled light: each plane gets a flat warm or cool triangle, highlights are pale yellow shards and shadows are cyan shards.',
        texture_and_material:
          'Perfectly flat translucent fills with visible overlaps between shards and no outlines, grain or brush marks.',
        camera_and_composition:
          'Keep the requested view; break the background into giant diagonal triangles that counter-slant against the subject.',
        atmosphere_and_mood:
          'Rebellious, loud and joyful, a riot of shards moving to a three-beat rhythm.',
        rendering_and_quality:
          'Lineless vector facets with clean overlaps, bounded color fields and no soft glow or gradients.',
        key_features:
          'lineless triangular facets; complementary-colored shadow shards; ember orange, yellow and cyan triad; translucent shard overlaps; counter-slanting background triangles',
      }),
      avoid: [...AVOID, 'black outlines', 'soft airbrush gradients', 'literal fire'],
      briefs: [
        "Mid-kick in a school gym turned into a riot, a middle-aged cafeteria cook in a flaming red apron strikes an impossible heroic pose as the walls explode into red, black and white shapes. No readable text or logo.",
        "Three rival street vendors clash with enormous exaggerated poses over one parking space, lightning bolts of color crossing the frame. No readable text or logo.",
        "A single red school uniform hangs on a hook in an empty room, its shadow pulsing like a heartbeat. No readable text or logo.",
      ],
    },
    'SP05-051': {
      dna: mech({
        aesthetic:
          'High-speed digital anime compositing: horizontal background pan blur, RGB-split chromatic edges, and tapered afterimage smears trailing the moving forms.',
        color_and_tone:
          'Cyan and fuchsia split fringes over graphite and pearl, with one warning-red accent on the leading edge.',
        lighting_and_shadow:
          'Crisp two-tone cel shadows on the subject, background lights stretched into horizontal streaks by the pan, and hot glints on leading edges.',
        texture_and_material:
          'Polished alloy suggested by painted highlight bands, with the background dissolved into long streaked lines.',
        camera_and_composition:
          'Keep the requested view; the subject stays sharp while everything behind it smears sideways in a tracking pan.',
        atmosphere_and_mood: 'Breathless velocity, cool metal and nerve at the edge of control.',
        rendering_and_quality:
          'Sharp subject contours, chromatic RGB offset on edges, motion-smear afterimages and a streaked background; never a static still life.',
        key_features:
          'horizontal tracking pan blur; RGB-split chromatic edges; tapered afterimage smears; cyan-fuchsia fringes; warning-red leading edge',
      }),
      avoid: [...AVOID, 'static pose', 'mechanical limbs added to people'],
      briefs: [
        "Sprinting across a neon rooftop with polished chrome legs, a cyborg courier leaps a gap between towers as a cloud of pink holographic ads bursts around her. No readable text or logo.",
        "A retired street doctor fits a new chrome hand onto a grumpy old fisherman in a cramped neon-lit clinic. No readable text or logo.",
        "On a wet street at night, a single discarded chrome finger glows under a flickering yellow sign. No readable text or logo.",
      ],
    },
    'SP05-052': {
      dna: mech({
        aesthetic:
          'Surveillance-feed anime rendering: cold cyan duotone, fine horizontal scanlines at a fixed pitch, and thin ruled bracket marks framing forms without any characters.',
        color_and_tone:
          'Icy cyan and deep slate duotone with one saturated red signal; every other hue collapses into the two-tone ramp.',
        lighting_and_shadow:
          'Flat cold top light like a low-lux sensor exposure; shadows crushed to slate and highlights clipped to pale cyan.',
        texture_and_material:
          'Uniform two-pixel scanline texture over everything, slight interlace doubling on moving edges, and faint sensor noise in darks.',
        camera_and_composition:
          'Keep the requested view; add thin corner bracket marks and a small crosshair tick around the focal form, never readable data.',
        atmosphere_and_mood: 'Clinical, watchful and judgemental, the feeling of being assessed.',
        rendering_and_quality:
          'Clean anime line under a scanline overlay, two-value duotone, crisp bracket marks, and no letters or numerals.',
        key_features:
          'cyan-slate duotone; fixed-pitch scanlines; corner bracket marks without text; interlace doubling; single red signal',
      }),
      avoid: [
        ...AVOID,
        'readable timestamp',
        'numerals',
        'enforcement pistol copy',
        'photoreal office',
      ],
      dropAvoid: ['Psycho-Pass-specific weapon/device', 'muddy noisy darks'],
      briefs: [
        "Lowering herself from a skylight into a museum vault, a cloaked thief freezes as a cold blue grid of scanning light slowly sweeps across her boots. No readable text or logo.",
        "A detective in a dark trench coat stands in the rain while holographic outlines of every passerby glow blue around him. No readable text or logo.",
        "In an empty office at midnight, a potted plant is outlined by a pulsing red surveillance grid. No readable text or logo.",
      ],
    },
    'SP05-054': {
      dna: mech({
        aesthetic:
          '1980s space-opera cel photography: backlit-cel light effects where pure light shines through cut lines in black, over airbrushed cobalt gradients and inked mechanical forms.',
        color_and_tone:
          'Deep cobalt, ink black and ivory with warm gold, plus one saturated backlit accent that burns almost white at its core.',
        lighting_and_shadow:
          'Backlit glow lines with halation bleeding into the surrounding cel, hard ink shadows, and airbrushed rim highlights sweeping on the diagonal.',
        texture_and_material:
          'Airbrushed starfield speckle, smooth cel paint, and faint dust and grain from optical camera photography.',
        camera_and_composition:
          'Keep the requested view; arrange glow lines and highlights along strong diagonals that sweep through the subject.',
        atmosphere_and_mood: 'Operatic grandeur and melancholy, light blazing inside a vast dark.',
        rendering_and_quality:
          'Halation around backlit lines, airbrushed gradients, crisp inked mechanics and light film grain; no modern digital bloom.',
        key_features:
          'backlit-cel glow lines with halation; airbrushed cobalt gradients; ivory and gold accents; diagonal light sweeps; optical film grain',
      }),
      avoid: [...AVOID, 'flat digital glow', 'V-fin horned faceplate copy'],
      dropAvoid: ['Gundam-like faceplate'],
      briefs: [
        "Rising off a burning coastline, an ivory-and-gold flagship mech spreads glowing beam fins as a lone foot soldier on the beach below shields his eyes. No readable text or logo.",
        "Two orbital knights share tea on a palace balcony above the clouds while fleets slowly gather in the sky behind them. No readable text or logo.",
        "Half buried in desert sand at dusk, a cracked golden knight crest still glows faintly as a lone scavenger kneels to brush the dust away. No readable text or logo.",
      ],
    },
    'SP05-055': {
      dna: mech({
        aesthetic:
          'Stark psychological anime framing: flat unshaded silhouettes against one saturated color field, sparse thin line, and pen-hatched interiors held like a still frame.',
        color_and_tone:
          'Black, bone and one flooding field of violet, sickly green or vermilion; everything else stays near-monochrome.',
        lighting_and_shadow:
          'Mostly shapeless light: silhouettes cut against the lit color field, a thin bone-white rim line, and hatched gloom inside forms.',
        texture_and_material:
          'Fine G-pen crosshatching inside dark shapes, flat untextured color fields, and faint cel dust.',
        camera_and_composition:
          'Keep the requested view; push the subject off-center against a large empty field and hold the frame static and tense.',
        atmosphere_and_mood:
          'Existential unease, quiet dread and isolation, a held breath that lasts too long.',
        rendering_and_quality:
          'Flat color fields, silhouette clarity, pen-hatched interiors and a thin bone rim; no ornament and no glow.',
        key_features:
          'flat saturated color field; black silhouettes; G-pen crosshatched interiors; off-center composition with a huge void; thin bone rim line',
      }),
      avoid: [...AVOID, 'purple horned giant copy', 'ornamental filigree'],
      dropAvoid: ['Eva-like giant'],
      briefs: [
        "Abandoned in a cathedral-sized hangar, a hunched many-jointed crane walker with gothic armor plates kneels as if praying while dust falls through stained-glass light. No readable text or logo.",
        "A knight in ornate lacquered armor stands in a rose garden, her enormous gothic mecha quietly waiting behind the hedge. No readable text or logo.",
        "An empty ornate cockpit glows softly in the dark, a single glove left on the seat. No readable text or logo.",
      ],
    },
    'SP05-057': {
      dna: mech({
        aesthetic:
          'Soft-focus romantic digital anime: diffusion-filter bloom around every highlight, hexagonal lens-flare ghosts, and cel shading with gradient blush tones at shadow edges.',
        color_and_tone:
          'Muted rose, apricot, pale gold and dusty blue-gray; shadows tinted lilac rather than dark, with lifted, gentle contrast.',
        lighting_and_shadow:
          'Low golden backlight with wide diffusion halos, flare ghosts crossing the frame, and soft-edged cel shadows fading through a warm blush band.',
        texture_and_material:
          'Smooth digital paint with fine sparkle dust in the air and a light glow haze over the whole image.',
        camera_and_composition:
          'Keep the requested view; let flare ghosts and bloom drift diagonally across the frame toward the subject.',
        atmosphere_and_mood:
          'Wistful, tender and bittersweet, beauty glimpsed while things fall apart.',
        rendering_and_quality:
          'Clean silhouettes softened by diffusion bloom, blush-gradient shadow edges, sparkle dust and flare ghosts; never glossy or harsh.',
        key_features:
          'diffusion-filter bloom; hexagonal lens-flare ghosts; blush-gradient shadow edges; rose-apricot and blue-gray palette; floating sparkle dust',
      }),
      avoid: [...AVOID, 'hard black shadows', 'piloting couple pose copy'],
      dropAvoid: ['Darling-like couple pose'],
      briefs: [
        "Standing on the shoulder of a sleek white mech above a collapsing glass dome, an adult pilot in a white flight suit reaches for her partner’s hand as pink petals swirl through the broken panes. No readable text or logo.",
        "Two aging pilots sit on a hangar floor sharing a thermos, their sleek mechs kneeling behind them like tired dancers. No readable text or logo.",
        "Inside a quiet glass dome at sunset, a single pink flower grows through a cracked mech palm. No readable text or logo.",
      ],
    },
    'SP05-058': {
      dna: mech({
        aesthetic:
          'Muted cinematic digital anime: thin brown line art, simulated shallow depth of field with round bokeh, and a cold blue-gray grade with lifted blacks.',
        color_and_tone:
          'Desaturated steel blue, fog gray and muted navy with lifted milky blacks and one cold-white highlight on the focal edge.',
        lighting_and_shadow:
          'Soft overcast or distant window light, broad low-contrast shadows, and bokeh discs where small lights fall out of focus.',
        texture_and_material:
          'Fine digital film grain, soft focus falloff, and thin sepia-brown line that dissolves where forms go out of focus.',
        camera_and_composition:
          'Keep the requested view; set a shallow focal plane on the subject and let foreground and background melt into bokeh.',
        atmosphere_and_mood:
          'Quiet grief and detachment, a distance that the lens itself enforces.',
        rendering_and_quality:
          'Thin line, soft cel shading, lens blur and bokeh, lifted-black grade and faint grain; nothing saturated.',
        key_features:
          'shallow depth of field with round bokeh; thin brown line art; lifted-black blue-gray grade; fine film grain; single cold-white highlight',
      }),
      avoid: [...AVOID, 'saturated neon', 'crushed pure blacks', 'photoreal control room'],
      briefs: [
        "Sitting on the floor of a dim command room, a drone operator in her fifties holds the scuffed controller of a spider-legged machine that did not come back, its empty charging bay glowing beside her. No readable text or logo.",
        "Three small spider-legged robots argue silently over a crate of oil cans in a rainy alley, legs tapping impatiently. No readable text or logo.",
        "An empty charging dock blinks green in a quiet hangar, a child’s drawing of a spider robot taped above it. No readable text or logo.",
      ],
    },
    'SP05-059': {
      dna: mech({
        aesthetic:
          'Layered-transparency cyber anime: semi-transparent cel planes stacked in screen blend, refraction ripples where layers overlap, and thin teal line contours.',
        color_and_tone:
          'Teal, glass green, slate and silver-white; overlaps brighten toward pale aqua and never form readable content.',
        lighting_and_shadow:
          'Even cool technical light with thin refracted highlights on edges and soft cel shadows seen through translucent layers.',
        texture_and_material:
          'Glassy translucent planes, faint refraction warping at overlaps, and an optical-camouflage shimmer outlining partly invisible forms.',
        camera_and_composition:
          'Keep the requested view; offset two or three translucent echoes of the subject slightly in depth behind it.',
        atmosphere_and_mood: 'Calm analytical focus, a mind reading the world in layers.',
        rendering_and_quality:
          'Crisp teal line, clean translucent fills, refraction ripples and sparse abstract hexagon marks; no legible text.',
        key_features:
          'stacked translucent cel planes; refraction ripples at overlaps; optical-camouflage shimmer; teal and glass-green palette; offset depth echoes',
      }),
      avoid: [...AVOID, 'readable code', 'opaque heavy paint', 'photoreal office'],
      briefs: [
        "Half dissolved by pixel noise, an adult agent in augmented-reality glasses walks through a sleepy summer town where digital fish swim through the air above the rice fields. No readable text or logo.",
        "An old man in thick glasses feeds a glitching digital dog on his porch while his real cat stares at it suspiciously. No readable text or logo.",
        "A street corner flickers as a patch of pixel noise slowly eats the corner of a mailbox. No readable text or logo.",
      ],
    },
    'SP05-060': {
      dna: mech({
        aesthetic:
          'Crystalline facet-highlight anime: specular highlights cut as sharp polygon shards, fine seam lines, and long thin orbital arc strokes balancing the frame.',
        color_and_tone:
          'Deep blue and violet against glacial white, with a tiny warm gold signal; each facet is a separate clean tone.',
        lighting_and_shadow:
          'Hard cold key producing polygonal white specular shards on edges and hard violet cel shadows, with one gold glint as counterweight.',
        texture_and_material:
          'Polished mirror surfaces broken into crystal facets, with smooth gradients inside each facet.',
        camera_and_composition:
          'Keep the requested view; counterbalance the subject with opposing diagonal arcs so the frame feels mirrored without duplicating the subject.',
        atmosphere_and_mood:
          'Cold strategic tension, poised and elegant, like a move not yet played.',
        rendering_and_quality:
          'Sharp polygon specular shards, fine seams, clean facet color blocks and thin arcs, with restrained glow.',
        key_features:
          'polygon-shard specular highlights; blue-violet and glacial white palette; opposing orbital arcs; fine seam lines; single gold counterweight glint',
      }),
      avoid: [...AVOID, 'busy clutter'],
      briefs: [
        "Facing each other in perfect symmetry above a blue planet, two slender rival mechs, one violet and one crimson, hold glowing blades crossed while their pilots’ reflections meet in the visors. No readable text or logo.",
        "On a colony balcony above a slowly turning blue planet, two retired rival pilots play a very serious game of chess with mech-shaped pieces. No readable text or logo.",
        "Drifting silently through orbit, a single white feather-like armor panel tumbles past a space station window, glinting in the harsh unfiltered sunlight. No readable text or logo.",
      ],
    },
    'SP05-221': {
      dna: mech({
        aesthetic:
          '1980s idol-era mecha cel: airbrushed cyan-pink gradient skies, star-shaped sparkle glints, and looping white vapor-trail ribbons curving around clean inked forms.',
        color_and_tone:
          'Cyan and bubble pink with warm gold edge highlights over clear neutral cel colors; skies are smooth airbrushed gradients.',
        lighting_and_shadow:
          'Clean two-tone cel shadows, a gentle gold rim, and four-point star glints on the brightest edges.',
        texture_and_material:
          'Airbrushed gradient backgrounds, flat cel paint, faint film grain and the slight color bleed of an old cel.',
        camera_and_composition:
          'Keep the requested view; loop white trail ribbons in wide arcs around the subject to lead the eye inward.',
        atmosphere_and_mood:
          'Buoyant, affectionate and hopeful, a love song played at full volume.',
        rendering_and_quality:
          'Crisp ink line, airbrushed gradients, star glints and ribbon loops with soft film grain; no modern bloom.',
        key_features:
          'airbrushed cyan-pink gradient sky; looping white vapor-trail ribbons; four-point star glints; gold rim light; 1980s cel film grain',
      }),
      avoid: [...AVOID, 'transforming jet copy'],
      briefs: [
        "Looping between missile trails above a floating concert stage, a sleek white swept-wing fighter flies so close to the singer that her sequined cape ripples in its wake. No readable text or logo.",
        "An aging idol practices dance steps alone in a hangar while mechanics pretend not to watch from the fighter wings. No readable text or logo.",
        "An empty stage in a space colony glows at midnight, one microphone still on its stand. No readable text or logo.",
      ],
    },
    'SP05-223': {
      dna: mech({
        aesthetic:
          'Airbrushed chrome noir illustration: mirror surfaces rendered as hard black-and-white bands with a reflected horizon line, deep black masses, and pinpoint star glints.',
        color_and_tone:
          'Black, pewter, silver and smoke, with tiny magenta or cyan reflections caught in the chrome.',
        lighting_and_shadow:
          'Hard single key from above and behind; chrome reads through sharp reflected bands, a horizon line across curved surfaces, and starburst glints.',
        texture_and_material:
          'Seamless airbrushed gradients and mirror polish with minimal scuffing, against a background that falls into velvet black.',
        camera_and_composition:
          'Keep the requested view; isolate the subject against black with generous negative space and one elegant reflective contour.',
        atmosphere_and_mood:
          'Poised, cool and seductive noir elegance, stillness with a knife edge.',
        rendering_and_quality:
          'Masked-airbrush smoothness, crisp hard-edged reflection bands and starburst glints; no plastic 3D CG look.',
        key_features:
          'airbrushed chrome banding; reflected horizon line; velvet black background; pinpoint starburst glints; tiny magenta and cyan reflections',
      }),
      avoid: [...AVOID, 'rain-soaked neon street'],
      briefs: [
        "Playing a smoky saxophone solo on a rooftop in the rain, a chrome-plated android jazz musician reflects every neon sign of the megacity across her polished shoulders. No readable text or logo.",
        "Four hardsuit-clad women drink coffee at an all-night neon diner, their chrome helmets lined up on the counter like trophies after a long night. No readable text or logo.",
        "On a wet megacity street under flickering pink neon, a single chrome hardsuit glove lies in a puddle, still twitching its fingers. No readable text or logo.",
      ],
    },
    'SP05-225': {
      dna: mech({
        aesthetic:
          'Rough-key action animation drawing: blue construction pencil left under black cleanup line, smear-frame distortions, and painted spark dots on impact.',
        color_and_tone:
          'Iron, dusty ochre, rust and charcoal cel fills with blue pencil showing through and bright amber spark dots.',
        lighting_and_shadow:
          'Firm cel shadows and short warm glints; impact flashes drawn as flat amber shapes with black outlines.',
        texture_and_material:
          'Visible pencil tooth, loose blue construction lines, scribbled hatching and dented-edge contour breaks.',
        camera_and_composition:
          'Keep the requested view; stretch the moving part of the subject into a smear frame along its arc of motion.',
        atmosphere_and_mood: 'Scrappy, determined and kinetic, a thing held together by will.',
        rendering_and_quality:
          'Keyframe rough energy with blue under-pencil, confident black line, smear distortion and spark dots; not a polished final cel.',
        key_features:
          'blue construction pencil under black line; smear-frame distortion; amber spark dots; iron and rust cel fills; scribbled hatching',
      }),
      avoid: [...AVOID, 'polished final render'],
      briefs: [
        "Skidding around a scrapyard racetrack on sparking wheeled feet, a patchwork junk mech built from washing machines and car doors overtakes a sleek rival as the crowd of scavengers roars. No readable text or logo.",
        "A cyborg mechanic in her sixties tightens a bolt on her own knee while fixing a customer’s arm. No readable text or logo.",
        "In a rusty scrap pile beneath the floating city, a single detailed cyborg hand still clutches a small wildflower someone left there. No readable text or logo.",
      ],
    },
    'SP05-226': {
      dna: mech({
        aesthetic:
          'Copperplate-engraving cyber-gothic rendering: dense parallel burin hatching, pointed ornamental filigree traced along existing edges, and a single crimson spot color.',
        color_and_tone:
          'Blue-black ink on cold bone paper with one narrow crimson signal; midtones are built only from hatch density.',
        lighting_and_shadow:
          'Hard directional light carved by line density: tight crosshatch in shadow, open paper for highlights, crimson for emissive points.',
        texture_and_material:
          'Engraved swelling lines, fine stipple on curved surfaces, and pointed-arch filigree edging on existing contours.',
        camera_and_composition:
          'Keep the requested view; frame with tall vertical rhythms of hatching and deep black masses at the edges.',
        atmosphere_and_mood: 'Solemn funereal dread, elegance carved into cold metal.',
        rendering_and_quality:
          'Engraving line with swelling and tapering strokes, a controlled hatch value scale and sparse crimson; no painterly color.',
        key_features:
          'parallel burin hatching; pointed filigree edging; blue-black ink on bone; single crimson spot color; stipple on curves',
      }),
      avoid: [...AVOID, 'full color painting', 'soft airbrush'],
      briefs: [
        "Walking through a mausoleum of stacked server coffins under a dome city, an archivist in a hooded cyber-goth coat stops as one coffin begins to hum a lullaby. No readable text or logo.",
        "Every evening in a grey-blue apartment under the dome, an elegant android butler serves hot tea to an empty chair and waits patiently. No readable text or logo.",
        "Fog drifts through a gothic plaza under the dome, where one streetlamp flickers in a steady rhythm. No readable text or logo.",
      ],
    },
    'SP05-229': {
      dna: mech({
        aesthetic:
          'Risograph cyberpunk manga print: coarse photocopied screentone and black toner, overprinted with two saturated neon spot colors slightly off register.',
        color_and_tone:
          'Toxic fluorescent green and hot red spot inks over black toner and paper white; overlaps turn brown only in thin misregistered slivers.',
        lighting_and_shadow:
          'Values made by screentone dot size and toner black; neon spot color marks the lit edges, with no gradients.',
        texture_and_material:
          'Coarse halftone dots, toner speckle, scratched photocopy streaks and the uneven ink coverage of a stencil drum.',
        camera_and_composition:
          'Keep the requested view; crop hard and let angled detail clusters and black masses bleed off the edges.',
        atmosphere_and_mood: 'Abrasive, sleazy and tense, a city that punishes while it glows.',
        rendering_and_quality:
          'Two-spot-color risograph finish with misregistration, coarse dots and toner grit around a clean silhouette.',
        key_features:
          'two neon spot inks off register; coarse screentone dots; black toner grit; photocopy streaks; hard crop with bleed',
      }),
      avoid: [...AVOID, 'smooth digital gradients', 'wet night market'],
      dropAvoid: ['muddy noisy darks'],
      briefs: [
        "Hunting through a neon market with a blinking collar around his neck, a bounty hunter with a cybernetic eye grins as the timer on his collar counts down. No readable text or logo.",
        "Three convict cops share cheap noodles on a neon rooftop in the rain, the explosive collars around their necks blinking in perfect unison. No readable text or logo.",
        "Above an empty alley in a neon vice district, a cracked sign hisses and sparks in the rain, painting the puddles purple and green. No readable text or logo.",
      ],
    },
    'SP05-230': {
      dna: mech({
        aesthetic:
          'Ink-wash megastructure manga plate: ruler-drawn pen lines, vast flat fields of diluted gray wash, dry-brush edges, and highlights scratched out in white.',
        color_and_tone:
          'Charcoal, slate and blue-black wash values with sparse cold white scratch highlights and at most a hint of cyan.',
        lighting_and_shadow:
          'Faint cold light from one distant source; most of the plate falls into layered gray wash with hard ruled shadow edges.',
        texture_and_material:
          'Granulating ink wash pooling at edges, dry-brush drag on large planes, and fine ruled hatching in the far distance.',
        camera_and_composition:
          'Keep the requested view and scale; leave huge empty wash areas and long converging ruled lines around the subject.',
        atmosphere_and_mood: 'Immense silence and scale, a stillness older than anyone inside it.',
        rendering_and_quality:
          'Sparse ruled pen line, layered wash values and white scratch highlights, with restrained detail and no glow.',
        key_features:
          'ruler-drawn pen lines; vast gray ink-wash fields; dry-brush drag; scratched-out white highlights; long converging ruled lines',
      }),
      avoid: [...AVOID, 'saturated color', 'busy neon detail'],
      briefs: [
        "Crossing a bridge spanning a chasm miles deep inside an endless concrete megastructure, a lone wanderer in a ragged coat looks up at structures that vanish into darkness. No readable text or logo.",
        "An old maintenance robot sweeps an endless corridor that no one has walked in a thousand years. No readable text or logo.",
        "A single light glows at the bottom of an immense shaft, too far away to reach. No readable text or logo.",
      ],
    },
    'SP05-231': {
      dna: mech({
        aesthetic:
          'Bioluminescent fluorescent-paint anime: a dark abyssal base with luminous teal and coral lines painted like glowing ink, radiating stipple dots and concentric halos.',
        color_and_tone:
          'Abyssal navy and teal with glowing coral pink, pale aqua and pearl; glow colors appear only on lines and dots.',
        lighting_and_shadow:
          'No external light: forms are lit from within by their glowing lines, with soft bloom and concentric ring highlights.',
        texture_and_material:
          'Fine radiating stipple, branching vein-like lines, and a soft translucent glow haze over dark cel shadow.',
        camera_and_composition:
          'Keep the requested view; repeat concentric rings and branching lines outward from the focal form.',
        atmosphere_and_mood: 'Reverent, resonant and hushed, a slow pulse of light in deep dark.',
        rendering_and_quality:
          'Crisp glowing linework over dark cel masses, controlled bloom and radiating dot patterns; never daylight.',
        key_features:
          'self-luminous teal and coral lines; branching vein patterns; radiating stipple dots; concentric halo rings; abyssal navy base',
      }),
      avoid: [...AVOID, 'daylight', 'flat even lighting'],
      briefs: [
        "Kneeling before a giant ceramic mech that hums like a church organ, a priestess-engineer in heavy robes tunes its chest with a silver tuning fork as coral light fills the chamber. No readable text or logo.",
        "An old violinist plays on a beach at dusk and a coral-colored giant rises from the sea to listen. No readable text or logo.",
        "Washed up on a coral-pink beach at dusk, a cracked ceramic mask lies in the foam, faintly singing a note that makes the shells tremble. No readable text or logo.",
      ],
    },
    'SP05-232': {
      dna: mech({
        aesthetic:
          'Hazy frontier anime: stacked translucent sand-colored haze cels, soft cel figures dissolving with distance, crisp line only on the focal detail, and 16 mm film grain.',
        color_and_tone:
          'Sand, smoke gray, faded olive and dusty blue with one small amber signal light; contrast falls off in each haze layer.',
        lighting_and_shadow:
          'Low diffuse sun filtered through dust, broad soft shadows, pale edge light, and haze glowing faintly where the sun sits.',
        texture_and_material:
          'Floating particulate specks, soft film grain, rubbed edges and faded cel paint.',
        camera_and_composition:
          'Keep the requested view; stack three or four haze layers between foreground and horizon to build distance.',
        atmosphere_and_mood: 'Lamenting, weary and quiet, a long war seen through settling dust.',
        rendering_and_quality:
          'Layered atmospheric haze, soft focus beyond the focal plane, crisp focal line and fine grain; never crisp photoreal.',
        key_features:
          'stacked translucent haze cels; dissolving distance; crisp line only at focus; sand and dusty blue palette; small amber signal; 16 mm grain',
      }),
      avoid: [...AVOID, 'photoreal military drone', 'desert war photo'],
      briefs: [
        "Limping across a dusty battlefield at sunset, an old four-rotor cargo drone carries a single canteen toward a trench where nobody is waiting anymore. No readable text or logo.",
        "A commander in a clean uniform listens to static in a cold room, her tea going cold. No readable text or logo.",
        "In a meadow that used to be a battlefield, rusted spider-legged drones stand frozen among wildflowers, vines curling up their legs. No readable text or logo.",
      ],
    },
    'SP05-233': {
      dna: mech({
        aesthetic:
          'Hard-vacuum anime lighting: one unfiltered point-source key, pitch-black shadows with zero fill, razor terminator lines, and thick clean outlines.',
        color_and_tone:
          'Cold white, steel and charcoal with pure black shadows and a small amber caution accent.',
        lighting_and_shadow:
          'Single harsh sun with no atmosphere: lit planes blaze white, turned planes drop straight to black, and nothing bounces.',
        texture_and_material:
          'Tight seam marks, micro-scuffs and grit on lit faces only; shadows carry no detail at all.',
        camera_and_composition:
          'Keep the requested view; let large black shadow shapes cut the frame into sharp lit and unlit zones.',
        atmosphere_and_mood:
          'Disciplined endurance, silent and exacting, where one mistake is final.',
        rendering_and_quality:
          'Thick stable outlines, binary lit-or-black shading, razor terminator edges and minimal glow.',
        key_features:
          'single unfiltered point-source key; zero-fill pitch-black shadows; razor terminator line; cold white and steel palette; amber caution accent',
      }),
      avoid: [...AVOID, 'soft ambient fill', 'atmospheric haze'],
      briefs: [
        "Floating outside a colony-ship hull in a bulky white suit, an engineer patches a crack while a vast organic shape drifts past in the distance, blocking out the stars. No readable text or logo.",
        "Pilots eat rations in perfect silent rows in a cold mess hall, helmets under their arms. No readable text or logo.",
        "Floating alone in the black void, a small blinking rescue beacon marks the exact spot where a colony ship used to be. No readable text or logo.",
      ],
    },
    'SP05-234': {
      dna: mech({
        aesthetic:
          'Vector-display anime: subjects drawn as glowing single-weight wireframe lines with hidden lines removed, on a black field with modular grid divisions.',
        color_and_tone:
          'Black ground with cyan vector lines, a deep blue grid and small red target accents; no filled color anywhere.',
        lighting_and_shadow:
          'Lines are self-luminous with a thin phosphor glow; there is no shading, and depth is shown by line density and brightness falloff.',
        texture_and_material:
          'Phosphor bloom along lines, faint persistence trails, and a soft curved-screen vignette at the corners.',
        camera_and_composition:
          'Keep the requested view; lay a fine modular grid behind the subject and bracket its key points with small red target ticks.',
        atmosphere_and_mood: 'Cold command tension, the calm of watching disaster as geometry.',
        rendering_and_quality:
          'Clean single-weight vector wireframe, phosphor glow and sparse red ticks; no letters, numerals or filled surfaces.',
        key_features:
          'glowing single-weight wireframe; hidden-line removal; phosphor glow on black; modular blue grid; red target ticks without text',
      }),
      avoid: [...AVOID, 'filled painted surfaces', 'numerals', 'readable map labels'],
      briefs: [
        "A continent-sized tide of alien swarm creatures rolls over a mountain range on a command table display while an exhausted general in a rumpled uniform quietly moves one small marker. No readable text or logo.",
        "A lone mech pilot sits on her machine’s shoulder at dawn, watching the horizon for the next swarm. No readable text or logo.",
        "In a deserted command bunker, an empty commander’s chair faces a wall of dark screens, a cold cup of coffee still on the armrest. No readable text or logo.",
      ],
    },
    'SP05-235': {
      dna: mech({
        aesthetic:
          'Y2K pop-cyber gloss: candy-jelly highlights, bubble gradients, chrome-pink rims, and edges dissolving into ordered pixel dither.',
        color_and_tone:
          'Vivid pink, cyan, violet and a small lime accent on white or deep indigo, with glossy bright gradients.',
        lighting_and_shadow:
          'Big soft jelly specular blobs and a white window-shaped highlight on curved surfaces, with cel shadows in clean violet.',
        texture_and_material:
          'Translucent gel-plastic surfaces, bubble gradients, and ordered four-by-four pixel dither on edges and falloffs.',
        camera_and_composition:
          'Keep the requested view; float small glossy bubble shapes and dither patches around the subject.',
        atmosphere_and_mood: 'Playful, synthetic and giddy, a toy-bright simulation of summer.',
        rendering_and_quality:
          'Vector-clean outlines, glossy gel highlights and ordered dither transitions; no grime and no photorealism.',
        key_features:
          'candy-jelly gel highlights; bubble gradients; chrome-pink rims; ordered pixel dither; pink, cyan and lime palette',
      }),
      avoid: [...AVOID, 'photoreal car render', 'showroom 3D product shot'],
      briefs: [
        "Dancing on a translucent stage above a neon highway, an avatar singer flickers as the city behind her briefly reveals its wireframe skeleton. No readable text or logo.",
        "Riding a motorcycle through a neon tunnel at night, a biker notices the lights stretching around her like lines of glowing code. No readable text or logo.",
        "In a silent simulated city at midnight, an empty idol stage glows pink while a single spotlight sways as if someone just left. No readable text or logo.",
      ],
    },
    'SP05-237': {
      dna: mech({
        aesthetic:
          'Painted anime key art: broad beveled planes laid in with a flat digital brush, silhouettes backlit by an ember-red rim, and deep empty blacks.',
        color_and_tone:
          'Ember red, gold and pale cream against ink black and charcoal, with the hottest values reserved for the rim.',
        lighting_and_shadow:
          'Strong backlight or underlight rim of ember and gold; the front of forms sits in near-black with bevel-edge highlights.',
        texture_and_material:
          'Flat-brush painted planes with visible stroke edges, sparse scuffs, and soft drifting ember specks.',
        camera_and_composition:
          'Keep the requested view; place the horizon low so the silhouette stands monumental against a glowing sky or void.',
        atmosphere_and_mood: 'Solemn resolve and sacrifice, heroic stillness before the end.',
        rendering_and_quality:
          'Painterly flat-brush key art with a crisp silhouette, rim glow and restrained bloom; not cel line art.',
        key_features:
          'backlit ember rim; broad flat-brush beveled planes; near-black silhouettes; drifting ember specks; low monumental horizon',
      }),
      avoid: [...AVOID, 'thin cel outlines', 'bright even daylight'],
      briefs: [
        "Kneeling in a vast space hangar, a battered colossus mech lowers its head as a tiny pilot in a training suit salutes it before the final launch. No readable text or logo.",
        "Two retired pilots in faded training suits jog laps at dawn around the enormous feet of a giant robot parked in a field. No readable text or logo.",
        "Near a round porthole full of stars, a single faded red training headband floats slowly in zero gravity inside an empty cabin. No readable text or logo.",
      ],
    },
    'SP05-239': {
      dna: mech({
        aesthetic:
          '1990s magical space cel: thick rounded ink lines, rainbow airbrushed gradients, holographic sparkle overlays, and bursting star-shaped twinkles.',
        color_and_tone:
          'Bubblegum pink, cyan, lemon yellow and violet against deep indigo space, with gradients running in rainbow bands.',
        lighting_and_shadow:
          'Soft glowing gradients with clean cel shadows, and four- and eight-point twinkles on every bright edge.',
        texture_and_material:
          'Holographic foil sparkle overlay, smooth airbrush, flat cel paint and faint 1990s cel grain.',
        camera_and_composition:
          'Keep the requested view; scatter twinkles and curving rainbow ribbons around the subject.',
        atmosphere_and_mood: 'Buoyant, sincere and wildly optimistic, joy at escape velocity.',
        rendering_and_quality:
          'Thick rounded outlines, rainbow gradients, holographic sparkle and crisp twinkles around a bright but readable silhouette.',
        key_features:
          'thick rounded ink lines; rainbow airbrush gradients; holographic foil sparkle; eight-point twinkles; indigo space backdrop',
      }),
      avoid: [...AVOID, 'muted gray palette'],
      briefs: [
        "Towing a whole planet behind it on a glowing ribbon, a round pink starfighter with cat-ear fins zooms past a startled fleet of grey battleships. No readable text or logo.",
        "A cheerful pilot in a bubblegum suit waves at a black hole as if it were a neighbor. No readable text or logo.",
        "Sitting on the glittering rings of a gas giant, a tiny bubblegum-pink mech swings its legs like a bored child waiting for dinner. No readable text or logo.",
      ],
    },
    'SP05-227': {
      dna: mech({
        aesthetic:
          'Technical-pen tangle drawing: dense 0.1 mm fine-liner cable lines layered over rust-stained watercolor blooms, with small cold cyan glints.',
        color_and_tone:
          'Oxidized orange and brown watercolor blooms over slate and black ink, with isolated cold cyan glints.',
        lighting_and_shadow:
          'Shadow built from tangled line density; watercolor blooms carry warm reflected light and cyan glints mark wet edges.',
        texture_and_material:
          'Hairline pen tangles, cauliflower watercolor blooms and backruns, dry scratches and rust speckle.',
        camera_and_composition:
          'Keep the requested view; run line tangles in slanting downward rhythms that thicken toward the bottom of the frame.',
        atmosphere_and_mood: 'Brittle, tense and worn, the quiet of something slowly giving way.',
        rendering_and_quality:
          'Hairline fine-liner precision against loose rust watercolor, with selective cyan glints and a readable silhouette.',
        key_features:
          'dense 0.1 mm fine-liner tangles; rust watercolor blooms and backruns; slate and black ink; cold cyan glints; downward slanting line rhythm',
      }),
      avoid: [...AVOID, 'clean flat vector color'],
      briefs: [
        "Rappelling down the rusted inner wall of an underground city shaft, a cable diver with a mechanical arm stops to watch a single ray of daylight far above. No readable text or logo.",
        "An old man with a rusted prosthetic leg sits by a flickering lamp, sharpening a knife slowly. No readable text or logo.",
        "In an empty underground plaza lit by one failing lamp, rust flakes drift down from the ceiling like slow brown snow. No readable text or logo.",
      ],
    },
    'SP05-053': {
      dna: mech({
        aesthetic:
          'Model-kit box-art painting: opaque gouache blocks, chipped-paint highlights, oil-stain washes and pin-washed panel lines on heavy load-bearing forms.',
        color_and_tone:
          'Iron gray, dirty olive, muted clay and rust, with pale chipped-metal highlights and dark oil-brown washes.',
        lighting_and_shadow:
          'Strong raking daylight from one side, deep shadows under overlaps, and dry-brushed highlights on every exposed edge.',
        texture_and_material:
          'Gouache brush marks, sponge chipping, streaked oil and grime washes, and dark pin-wash in seams.',
        camera_and_composition:
          'Keep the requested view; weight the mass toward the bottom of the frame with a strong three-quarter presence.',
        atmosphere_and_mood:
          'Weighty endurance and strain, the grandeur of heavy machinery doing hard work.',
        rendering_and_quality:
          'Painted illustration finish with opaque gouache, dry-brush edges, pin-wash and chipping; no cel line and no 3D gloss.',
        key_features:
          'opaque gouache box-art painting; sponge chipping; oil-stain streak washes; dark pin-washed seams; raking side light',
      }),
      avoid: [...AVOID, 'clean cel outlines', 'plastic toy gloss'],
      briefs: [
        "Crossing a smoking battlefield at sunset, a twin-piston siege walker as tall as a church hisses steam from every joint while tiny engineers ride on its back. No readable text or logo.",
        "A mechanic sits in the shade of a giant hydraulic leg, drinking tea during a lull in battle. No readable text or logo.",
        "In a golden wheat field years after the war, a rusted hydraulic piston sticks out of the ground, overgrown with red poppies. No readable text or logo.",
      ],
    },
  },
};

export default spec;
