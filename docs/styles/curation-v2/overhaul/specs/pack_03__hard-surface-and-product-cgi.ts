import type { Dna, Spec } from '../tools/apply';

const AVOID = [
  'multi-view asset sheet',
  'fake labels',
  'brand logo',
  'readable text',
  'franchise likeness',
];

// Hard-surface media rebuild the subject's construction and keep the view; profiles own a stated
// delivery format. Review rule: a hero image never becomes a multi-view asset sheet unless asked.
const rebuild =
  "Keep the prompt subject, action, setting and camera view; rebuild the subject's construction in this hard-surface method as one hero image, never a multi-view asset sheet unless the prompt asks for one.";
const profile = (what: string) =>
  `Keep the prompt subject and its identity; this preset owns ${what}. It stays one hero image and never becomes a multi-view asset sheet unless the prompt asks for one.`;
const change = (what: string) =>
  `Keep the prompt subject recognizable with its pose, setting and camera view; ${what} (a declared construction change), delivered as one hero image, never a multi-view sheet.`;

function hs(parts: Omit<Dna, 'subject_treatment'> & { subject_treatment?: string }): Dna {
  const { aesthetic, subject_treatment, ...rest } = parts;
  return { aesthetic, subject_treatment: subject_treatment ?? rebuild, ...rest } as Dna;
}

const spec: Spec = {
  pack: 'pack_03',
  category: '5. Hard Surface And Product CGI',
  updates: {
    'SP03-025': {
      dna: hs({
        aesthetic:
          'Kitbash construction: the subject assembled from recognizable borrowed machine parts — engine blocks, pipe runs, hydraulic rams, vent grilles and hatch plates — packed along its silhouette.',
        color_and_tone:
          'Mostly neutral greys and gunmetal, broken by one or two painted part colors such as hazard orange or faded military green.',
        lighting_and_shadow:
          'Hard key raking across the surface so every greeble casts a small shadow, with ambient occlusion darkening the gaps between parts.',
        texture_and_material:
          'Detail graded from large structural blocks to mid-size pipes to tiny bolts and vents, with smooth rest panels between the clusters.',
        camera_and_composition:
          'Keep the requested view; a low angle or long lens exaggerates the mass, and one quiet area gives the eye somewhere to rest.',
        atmosphere_and_mood:
          'Heavy, industrial and endlessly explorable, a machine built from a scrapyard of other machines.',
        rendering_and_quality:
          'Crisp edges and clean occlusion; parts follow the form lines of the subject instead of scattering randomly across it.',
        key_features:
          'borrowed machine parts; large-medium-small detail hierarchy; raking hard key; occlusion in part gaps; quiet rest panels',
      }),
      avoid: [...AVOID, 'smooth featureless hull'],
      briefs: [
        'Kitbash CGI render of a colossal siege tortoise whose shell is assembled from engine blocks, pipe runs, vent grilles and hatch plates, seen from a low angle on a scorched plain, hard raking light making every greeble cast a small shadow, gunmetal grey broken by hazard-orange plates. No text or logo.',
        'Kitbash CGI render of a cathedral pipe organ rebuilt from hydraulic rams, exhaust stacks and pressure valves, filling a dark stone nave, a clear large-medium-small detail hierarchy with smooth rest panels, ambient occlusion deep in the part gaps. No text or logo.',
        'Kitbash CGI render of a hovering mining barge seen from directly below, its underside a dense grid of borrowed machine parts around a few quiet flat panels, one sodium work light raking across it against a dusk sky. No text or logo.',
      ],
    },
    'SP03-046': {
      dna: hs({
        aesthetic:
          'Real-time game asset presentation: a single prop built to a polygon budget, its fine detail baked into normal maps and textured with metal-roughness PBR maps.',
        subject_treatment: profile(
          'the single-asset presentation on a neutral grey backdrop with a soft ground shadow, one object in one three-quarter view',
        ),
        color_and_tone:
          'Albedo colors kept flat and mid-value with no baked lighting; metals dark in albedo and bright only in their reflections.',
        lighting_and_shadow:
          'Neutral studio HDRI with a soft key and a cool rim, the even viewer lighting that shows roughness variation honestly.',
        texture_and_material:
          'Baked normal-map bevels on straight low-poly edges, trim-sheet panel strips, roughness breakups and edge wear painted into texture only.',
        camera_and_composition:
          'Asset centered in a three-quarter view with generous margin; large curves show a faint polygon straightness in silhouette.',
        atmosphere_and_mood: 'Functional and proud, a finished piece ready to drop into a level.',
        rendering_and_quality:
          'Real-time shading look with sharp texel-level detail, no path-traced caustics, no motion blur and no scene clutter.',
        key_features:
          'polygon-budget silhouette; baked normal-map bevels; metal-roughness PBR; trim-sheet strips; neutral viewer lighting',
      }),
      avoid: [...AVOID, 'texture map swatches', 'material ball row', 'scene clutter'],
      briefs: [
        'Game-ready PBR asset render of a dwarven war hammer with a plain iron head and a wrapped leather haft, baked normal-map bevels on straight low-poly edges, trim-sheet steel bands, centered in one three-quarter view on a neutral grey backdrop with a soft ground shadow. No text or logo.',
        'Game-ready PBR asset render of an iron-bound treasure chest with its lid ajar, roughness variation across the worn oak planks, edge wear painted into the texture only, even viewer lighting with a cool rim. No text or logo.',
        "Game-ready PBR asset render of a plague doctor's beaked leather mask with brass-rimmed goggles, dark metal albedo shining only in reflection, stitched seams in the normal map, one object on a neutral grey stage. No text or logo.",
      ],
    },
    'SP03-047': {
      dna: hs({
        aesthetic:
          'Design-competition exterior render: a building shown in its landscape at human eye height, clean CGI architecture blended with planted foreground and a graded sky.',
        subject_treatment: profile(
          'the eye-level exterior hero framing with corrected verticals, planted foreground and ghosted entourage, while the requested building keeps its design',
        ),
        color_and_tone:
          'Warm late-afternoon sun on facades against a blue-to-cream graded sky, slightly desaturated greens and glass reflecting the sky.',
        lighting_and_shadow:
          'Low sun raking the facade at a steep angle, long soft-edged shadows across paving and interiors glowing faintly through the glass.',
        texture_and_material:
          'Crisp mullions, board-formed concrete, timber cladding and stone paving, with soft-focus grasses and trees in the foreground.',
        camera_and_composition:
          'Two-point perspective at standing eye height with corrected verticals, building in the middle third and planting framing the edges.',
        atmosphere_and_mood:
          'Optimistic and persuasive, a building shown the way its designers hope it will feel.',
        rendering_and_quality:
          'Clean exterior visualization with ghosted, motion-blurred adult entourage and light haze; no site plans, arrows or labels.',
        key_features:
          'eye-level two-point exterior; corrected verticals; planted soft foreground; ghosted entourage; graded sky with raking sun',
      }),
      avoid: [...AVOID, 'converging verticals', 'site plan overlay', 'aerial masterplan view'],
      briefs: [
        'Design-competition exterior render of a timber-and-glass mountain monastery stepping down a pine slope, eye-level two-point perspective with corrected verticals, low sun raking the cladding, ghosted adult pilgrims motion-blurred on the stone path, soft-focus grasses framing the edges. No text or logo.',
        'Design-competition exterior render of a board-formed concrete ferry terminal on a fjord shore, blue-to-cream graded sky, glass reflecting the cliffs, long soft-edged shadows across the quay, reeds in soft focus in the foreground. No text or logo.',
        'Design-competition exterior render of a rammed-earth desert library half sunk into a dune, interiors glowing faintly through slot windows at golden hour, ghosted figures on the ramp, building held in the middle third. No text or logo.',
      ],
    },
    'SP03-048': {
      dna: hs({
        aesthetic:
          'Launch-reveal product render: one object emerging from darkness, its silhouette traced by sweeping edge light, floating a hair above a black mirror floor.',
        subject_treatment: profile(
          'the dark launch-stage presentation with edge-light sweep and mirror floor, while the object keeps its exact shape, finish and proportions',
        ),
        color_and_tone:
          "Near-black stage where the product's own finish is the only color, echoed by a faint gradient glow matched to it.",
        lighting_and_shadow:
          'Long thin strip lights behind and above draw bright continuous lines along every edge while the front faces fall into shadow.',
        texture_and_material:
          'Bead-blasted aluminum, soft-touch polymer and glass with precise microtexture wherever the edge light grazes them.',
        camera_and_composition:
          'Low three-quarter or straight-on hero view with a long lens, the object small in a large dark frame above its reflection.',
        atmosphere_and_mood:
          'Hushed and expectant, the second before the curtain lifts on a new object.',
        rendering_and_quality:
          'Immaculate CGI with no dust, fingerprints or backdrop seam; highlights never clip into flat white.',
        key_features:
          'emerging from darkness; strip-light edge tracing; black mirror floor; long-lens hero view; single matched color glow',
      }),
      avoid: [...AVOID, 'bright white backdrop', 'lifestyle props'],
      briefs: [
        'Launch-reveal product render of a sealed obsidian reliquary box with bead-blasted silver hinges, emerging from darkness, thin strip lights tracing every edge, floating a hair above a black mirror floor, a faint violet glow matched to its finish. No text or logo.',
        'Launch-reveal product render of a fluted brass spyglass lying on a long diagonal, long lens, only its barrel rings caught by the sweeping edge light, its reflection fading into the black floor. No text or logo.',
        'Launch-reveal product render of wireless earbuds in a pebble-shaped charging case with the lid half open, soft-touch polymer grazed by a single strip light, small in a vast dark frame. No text or logo.',
      ],
    },
    'SP03-052': {
      dna: hs({
        aesthetic:
          'Automotive CGI studio render: a vehicle under a vast overhead light canopy, its paint showing one clean horizon reflection flowing unbroken from nose to tail.',
        subject_treatment: profile(
          'the low front three-quarter studio view under an overhead light canopy, while the vehicle keeps its exact design; a non-vehicle subject gets the same paint-and-reflection studio',
        ),
        color_and_tone:
          'Deep metallic paint with visible color flop, a black studio floor, cool white highlights and small warm glints.',
        lighting_and_shadow:
          'Giant overhead softbox plus two side strips, laying a crisp horizon line across the flanks and a hot highlight on the shoulder.',
        texture_and_material:
          'Flake metallic clear coat, tinted glass, rubber sidewalls, machined wheel faces and trim with exact reflection breaks.',
        camera_and_composition:
          'Low front three-quarter view at wheel-hub height with a 50 to 85 mm lens, front wheels turned slightly toward camera.',
        atmosphere_and_mood:
          'Powerful and poised, motion implied while the machine stands completely still.',
        rendering_and_quality:
          'Reflection lines continuous across panel gaps, floor reflection softly faded, and no dirt, dents or motion blur.',
        key_features:
          'overhead light canopy; unbroken horizon reflection; low front three-quarter; color-flop metallic paint; turned front wheels',
      }),
      avoid: [...AVOID, 'rolling shot motion blur', 'license plate'],
      briefs: [
        'Automotive CGI studio render of a black armored war chariot with bronze-trimmed spoked wheels, low front three-quarter at hub height, an overhead light canopy laying one unbroken horizon reflection along its lacquered flank, black studio floor with a soft faded reflection. No text or logo.',
        'Automotive CGI studio render of a teardrop electric racing motorcycle in candy teal flopping to violet, front wheel turned toward the camera, a hot highlight on the tank shoulder and two side strips outlining the fairing. No text or logo.',
        'Automotive CGI studio render of an ornate royal coach without horses, deep burgundy lacquer and gilt trim with exact reflection breaks at every panel gap, the horizon reflection running from lamp to rear axle. No text or logo.',
      ],
    },
    'SP03-053': {
      dna: hs({
        aesthetic:
          'High-jewelry macro render: precious metal and cut stones filling the frame, with fire, scintillation and polished metal reflections as the whole subject.',
        subject_treatment: profile(
          'the macro jewelry framing on dark velvet or mirror stone; any other subject is rendered as a small piece of fine jewelry in precious metal and cut stones',
        ),
        color_and_tone:
          'Rich yellow or rose gold and cold platinum, gem colors saturated in the table and nearly black at the pavilion edges.',
        lighting_and_shadow:
          'Many small point lights create sparkling scintillation and spectral fire, while black cards give the facets deep contrast.',
        texture_and_material:
          'Mirror-polished metal, crisp prong settings, pavé micro-stones and faceted brilliant and step cuts with sharp girdle edges.',
        camera_and_composition:
          'Macro lens with shallow depth, the hero stone razor sharp while the band dissolves into soft bokeh.',
        atmosphere_and_mood:
          "Opulent and intimate, a treasure seen from a jeweler's loupe distance.",
        rendering_and_quality:
          'Spectral dispersion in every stone, clean metal without smudges, and a contact reflection on the display surface.',
        key_features:
          'macro loupe distance; spectral fire and scintillation; black-card facet contrast; mirror-polished metal; pavé settings',
      }),
      avoid: [...AVOID, 'hallmark stamps', 'model wearing the jewel'],
      briefs: [
        'High-jewelry macro render of a serpent ring in rose gold coiled around a blood-red cushion-cut ruby, pavé diamond scales, black cards giving the facets deep contrast, spectral fire in the stone, dark velvet dissolving into bokeh. No text or logo.',
        'High-jewelry macro render of a platinum brooch shaped like a thorned briar branch set with emerald step cuts, lying on polished black mirror stone with a crisp contact reflection. No text or logo.',
        'High-jewelry macro render of a moth pendant with pale sapphire wings in cold platinum prongs, resting on grey slate, scintillation from dozens of tiny point lights, macro shallow depth. No text or logo.',
      ],
    },
    'SP03-061': {
      dna: hs({
        aesthetic:
          'Hard-surface modeling: the subject rebuilt as engineered panels with chamfered edges, boolean cuts and support-looped bevels that each catch a thin line of light.',
        color_and_tone:
          'Two-tone painted panels in gunmetal and one secondary color, with bare metal exposed only at edges and fasteners.',
        lighting_and_shadow:
          'Rim and top light placed to run a bright bevel line along every panel edge while the flat faces stay mid-grey.',
        texture_and_material:
          'Panel seams, recessed bolts, vent slots, boolean-cut ports and light edge scuffs, with the flat faces kept clean.',
        camera_and_composition:
          'Keep the requested view; a three-quarter silhouette shows how the plates stack and which way the panels flow.',
        atmosphere_and_mood: 'Tactical and exact, every plate designed to move, fasten or protect.',
        rendering_and_quality:
          'Bevel highlights consistent in width, with no pinching or smoothing artifacts on the flat faces.',
        key_features:
          'chamfered bevel highlight lines; boolean-cut ports; panel seams and recessed bolts; two-tone paint; stacked plates',
      }),
      avoid: [...AVOID, 'soft sculpted forms'],
      briefs: [
        "Hard-surface CGI render of a knight's great helm rebuilt as engineered armor plates with chamfered edges, boolean-cut breathing ports and recessed bolts, a thin bright bevel line along every panel, gunmetal and oxblood two-tone paint. No text or logo.",
        'Hard-surface CGI render of a mechanical warhorse head and neck seen in three-quarter view, stacked plates flowing along the neck muscles, rim light drawing every bevel, bare metal showing only at the fasteners. No text or logo.',
        'Hard-surface CGI render of a heavy round vault door set into a rough stone wall, panel seams, vent slots and a ring of recessed bolts, the flat faces clean mid-grey under a top light. No text or logo.',
      ],
    },
    'SP03-064': {
      dna: hs({
        aesthetic:
          'Exploded-view render: the subject taken apart along its assembly axis, every component floating in order with even gaps that show how it fits together.',
        subject_treatment: profile(
          'the exploded assembly layout along one axis in a single view, keeping every part of the requested subject and adding nothing extra',
        ),
        color_and_tone:
          'Each part in its true material and color against a pale neutral ground, with faint thin guide lines where parts align.',
        lighting_and_shadow:
          'Soft even studio light from above and in front, each part lit the same so none dominates, with faint occlusion on inner faces.',
        texture_and_material:
          'Clean machined, molded and woven parts, their internal faces, threads, springs and seals visible between the gaps.',
        camera_and_composition:
          'Three-quarter view with the explosion running on a diagonal, parts spaced in assembly order along shared axes.',
        atmosphere_and_mood: 'Clear and satisfying, the hidden logic of an object laid open.',
        rendering_and_quality:
          'Precise CGI with parts neither overlapping nor randomly scattered, and no callouts, numbers or labels.',
        key_features:
          'parts floating along one assembly axis; even gaps; assembly order; thin alignment guides; no labels',
      }),
      avoid: [...AVOID, 'callout numbers', 'randomly scattered parts'],
      briefs: [
        'Exploded-view CGI render of a steel plate gauntlet separated into finger lames, knuckle plates, cuff and leather lining, floating along a diagonal assembly axis with even gaps and thin alignment guides, soft even studio light on a pale ground. No labels, text or logo.',
        'Exploded-view CGI render of a mechanical music box pulled apart into lid, steel comb, pinned brass cylinder, spring barrel and walnut base, each part in assembly order along a vertical axis. No labels, text or logo.',
        'Exploded-view CGI render of a modern camera lens separated into its glass elements, aperture blades, focus helicoid and mount, laid out along one horizontal axis. No labels, text or logo.',
      ],
    },
    'SP03-067': {
      name: 'Flush-Seam Cyber Implant',
      dna: hs({
        aesthetic:
          'Cyber implant integration: machined chrome and white ceramic modules set flush into skin, with the seam between flesh and metal as the focal detail.',
        subject_treatment:
          'Keep the prompt subject, pose, setting and camera; add implant modules into the body along natural anatomical lines as a declared design change, never replacing the whole body with a robot.',
        color_and_tone:
          'Warm natural skin tones against cool chrome and white ceramic, with one small cyan or amber status light.',
        lighting_and_shadow:
          'Soft key on the skin with subsurface warmth, plus a hard rim that picks out the metal edges and the seam line.',
        texture_and_material:
          'Pores and fine hair running right up to precise machined gaps, a faint flush at the seam, brushed and polished metal.',
        camera_and_composition:
          'Keep the requested view; the implant sits where the camera naturally lands, such as temple, jaw, forearm or spine.',
        atmosphere_and_mood: 'Quietly uncanny, the body upgraded with calm surgical precision.',
        rendering_and_quality:
          'Photoreal skin and metal rendered together, the join clean and believable rather than gory or bolted on.',
        key_features:
          'flush implant modules; skin-to-metal seam; chrome and white ceramic; small status light; subsurface skin with hard metal rim',
      }),
      avoid: [...AVOID, 'gore', 'open wounds', 'full robot body'],
      briefs: [
        'Cyber implant render of an adult elven archer in profile, a white ceramic module set flush along her jaw and ear with a precise machined seam, pores and fine hair running right up to the metal, soft key on the skin and a hard rim on the chrome, one tiny amber status light. No text or logo.',
        "Cyber implant render of a middle-aged blacksmith's forearm gripping tongs over an anvil, chrome tendon plates set flush into the skin along the muscles, forge glow warming the skin and glinting on the seams. No text or logo.",
        'Cyber implant render of an adult monk seen from behind, a line of chrome vertebra modules set flush down the bare spine above a rough wool robe, candlelight and one cyan status light. No text or logo.',
      ],
    },
    'SP03-071': {
      dna: hs({
        aesthetic:
          'Glassmorphism interface render: layered frosted-glass panels floating over blurred color blobs, each pane with a thin bright edge and a soft inner glow.',
        subject_treatment: profile(
          'a layered frosted-glass interface composition with blank textless controls, where the prompt subject appears as the blurred color field behind the glass',
        ),
        color_and_tone:
          'Vivid gradient blobs behind the glass softened to pastel through the frost, with white pane edges at low opacity.',
        lighting_and_shadow:
          'Soft diffuse light; each pane carries a thin specular edge along the top and a faint drop shadow below.',
        texture_and_material:
          'Frosted blur of varying strength, a fine noise grain in the frost, rounded rectangles with hairline borders.',
        camera_and_composition:
          'Frontal or gently tilted view with three to five panes stacked in depth and generous negative space.',
        atmosphere_and_mood: 'Light, calm and airy, an interface made of mist and glass.',
        rendering_and_quality:
          'Every control left blank, pill shapes and circles in place of words, numbers or text icons; distinct from matte extruded clay UI.',
        key_features:
          'stacked frosted panes; blurred gradient blobs behind; hairline bright edges; blank pill controls; soft drop shadows',
      }),
      avoid: [...AVOID, 'numbers', 'icon glyphs with letters', 'opaque panels'],
      briefs: [
        'Glassmorphism interface render: five frosted-glass panes stacked in depth over blurred molten-orange and violet color blobs rising like embers, thin bright edges, blank pill-shaped controls, soft drop shadows, generous negative space. No text, numbers or logo.',
        'Glassmorphism render of a single frosted weather-card pane gently tilted over a blurred green and teal aurora, one blank round dial inside, a fine noise grain in the frost. No text, numbers or logo.',
        'Glassmorphism render of frosted music-player panes floating over the blurred shape of a crimson phoenix, hairline borders and blank circular buttons, a specular edge on each pane. No text, numbers or logo.',
      ],
    },
    'SP03-074': {
      dna: hs({
        aesthetic:
          'Neon sign construction: the subject redrawn as one continuous line of bent glass tubing glowing with gas, mounted on a dark backing with visible hardware.',
        color_and_tone:
          'One to three pure gas colors — ruby red, argon blue, phosphor pink — each tube with a hot white core.',
        lighting_and_shadow:
          'The tubes are the only light: a colored halo on the backing wall, soft spill on nearby surfaces and black-painted blockout sections left dark.',
        texture_and_material:
          'Glass tube bends with slight thickness change, electrode ends, standoff clips, cable runs and a small transformer box.',
        camera_and_composition:
          'Keep the requested view; the tube drawing reads as a clean continuous outline of the subject.',
        atmosphere_and_mood: 'Electric and nocturnal, a hum of light in a dark room.',
        rendering_and_quality:
          'Physical glass tubes casting real glow and reflections, not a flat 2D neon stroke; lettering only when the prompt supplies it.',
        key_features:
          'continuous bent glass tube line; hot white core; colored halo on backing; blacked-out tube sections; standoffs and transformer',
      }),
      avoid: [...AVOID, 'flat 2D neon stroke', 'invented lettering'],
      briefs: [
        'Neon sign CGI render of a coiled wyvern drawn in one continuous line of ruby-red and argon-blue bent glass tubing on a soot-black brick wall, hot white cores, a colored halo across the bricks, standoff clips and a small transformer box. No text or logo.',
        'Neon sign CGI render of a tilted chalice under a crescent moon in phosphor-pink tube above a dark tavern table, its glow reflected in a spill of wine on the wood. No text or logo.',
        'Neon sign CGI render of a skeletal hand holding a large key in argon-blue tube, black-painted blockout sections dark between the bones, cable runs down the plaster wall. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Half-Section Engineering Cutaway',
      domain: 'half-section engineering cutaway',
      tags: ['cutaway', 'engineering', 'section'],
      dna: hs({
        aesthetic:
          'Engineering half-section: the subject sliced exactly in half on one clean plane, the cut faces capped in flat color so walls, cavities and mechanisms read at once.',
        subject_treatment: profile(
          'one clean section plane through the requested subject; the uncut half stays fully modeled and nothing appears inside that the subject would not contain',
        ),
        color_and_tone:
          'Cut faces capped in one flat signal color such as vermilion or safety yellow, exterior surfaces in their true neutral materials.',
        lighting_and_shadow:
          'Soft key from the cut side so internal cavities show depth and occlusion, while the exterior half is lit normally.',
        texture_and_material:
          'Wall thickness, ribs, threads, cavities and bearings exposed at the cut; the caps perfectly flat and untextured.',
        camera_and_composition:
          'Three-quarter view looking into the section plane, the cut face turned about forty-five degrees toward the camera.',
        atmosphere_and_mood: 'Analytical and revealing, the inside of a thing shown plainly.',
        rendering_and_quality:
          'Precise boolean section with crisp cap edges and no hatching, dimension lines or labels.',
        key_features:
          'single section plane; flat colored cut caps; exposed wall thickness; cavities with occlusion; untouched exterior half',
      }),
      avoid: [...AVOID, 'exploded parts', 'dimension lines', 'hatching'],
      briefs: [
        'Half-section engineering cutaway render of a bronze church bell sliced cleanly in half, vermilion cut caps showing the tapering wall thickness, the iron clapper and its hanger inside, cut face turned toward the camera, soft key into the cavity. No text or logo.',
        "Half-section engineering cutaway render of an alchemist's copper still cut on its center plane, safety-yellow caps revealing coiled pipes, chambers and valve seats, the exterior half polished and intact. No text or logo.",
        'Half-section engineering cutaway render of a modern stovetop pressure cooker sliced in half, flat colored caps on the thick base and lid, gasket and valve visible, three-quarter view into the cut. No text or logo.',
      ],
    },
    {
      name: 'Curvature Wear Hero Prop',
      domain: 'weathered hero prop surfacing',
      tags: ['edge-wear', 'hero-prop', 'weathering'],
      dna: hs({
        aesthetic:
          'Hero-prop wear: a painted metal object whose damage follows its geometry — paint chipped on convex edges, grime packed into concave corners, polish where hands grip.',
        color_and_tone:
          'Faded base paint over primer and bare steel, three layers exposed at each chip, grime in warm brown-grey.',
        lighting_and_shadow:
          'Directional key with warm bounce, raking enough to show chip depth and the dull-versus-polished contrast.',
        texture_and_material:
          'Curvature-driven chips, cavity dirt, streaked runoff under bolts and bright rub-polish on handles and triggers.',
        camera_and_composition:
          'Keep the requested view; the wear pattern should explain how the object has been handled for years.',
        atmosphere_and_mood: 'Lived-with and storied, a tool that has outlasted its owners.',
        rendering_and_quality:
          'Wear placed by edges, cavities and touch, never an even overlay of scratches or noise.',
        key_features:
          'chips on convex edges; grime in cavities; paint-primer-steel layers; rub-polished grip points; runoff streaks',
      }),
      avoid: [...AVOID, 'uniform grunge overlay', 'pristine factory finish'],
      briefs: [
        "Hero-prop wear render of a mercenary's steel breastplate painted a faded red, paint chipped through grey primer to bare steel on every convex edge, grime packed into the rivet corners, rub-polish where the strap buckles sit, raking warm key. No text or logo.",
        "Hero-prop wear render of a ship captain's brass-and-iron flintlock pistol on a scarred oak table, the trigger and grip rubbed bright, dark grime deep in the lock mechanism, runoff streaks under the barrel bands. No text or logo.",
        'Hero-prop wear render of a yellow jackhammer leaning against a broken curb, paint worn to bare steel along both handles, rust runoff under every bolt, primer showing at the chipped edges. No text or logo.',
      ],
    },
    {
      name: 'Horology Macro Render',
      domain: 'watch movement macro',
      tags: ['horology', 'macro', 'mechanism'],
      dna: hs({
        aesthetic:
          'Fine watchmaking macro: the subject built from a miniature mechanical movement of polished bridges, toothed wheels, ruby jewel bearings and blued screws.',
        subject_treatment: change(
          'rebuild it as a miniature mechanical watch movement of bridges, wheels and jewel bearings that follows its silhouette',
        ),
        color_and_tone:
          'Rhodium silver and warm gold bridges, deep red jewels and heat-blued steel screws against a dark ground.',
        lighting_and_shadow:
          'Small ring and strip lights create crisp highlights on the bevels and sweeping bands across the decorated plates.',
        texture_and_material:
          'Striped and circular-grained plate finishing, mirror-polished beveled edges, fine gear teeth and hairspring coils.',
        camera_and_composition:
          'Macro lens at close focus with shallow depth, one wheel or the balance held in sharp focus.',
        atmosphere_and_mood: 'Meticulous and hushed, the heartbeat of a tiny machine.',
        rendering_and_quality:
          'Microscopic finishing detail rendered cleanly, with no dial numerals, engraved words or maker marks.',
        key_features:
          'polished bridges and gears; ruby jewel bearings; blued screws; striped and grained plate finishing; macro shallow depth',
      }),
      avoid: [...AVOID, 'dial numerals', 'engraved words'],
      briefs: [
        'Fine watchmaking macro render of a small scarab beetle built from a mechanical movement, its wing cases polished gold bridges with striped finishing, ruby jewel eyes, blued-steel screw legs and a balance wheel beating in its back, macro shallow depth. No text or logo.',
        'Fine watchmaking macro render of a crowned owl perched on a large gear, its breast plates circular-grained, hairspring coils forming the feathers, ring light catching every polished bevel. No text or logo.',
        'Fine watchmaking macro render of a tiny galleon whose hull is a skeletonized movement and whose sails are mirror-polished bridges, deep red jewels as portholes, one wheel sharp in focus. No text or logo.',
      ],
    },
    {
      name: 'Milled Design Clay Buck',
      domain: 'industrial design clay model',
      tags: ['design-clay', 'industrial-design', 'prototype'],
      dna: hs({
        aesthetic:
          'Industrial design clay buck: the subject milled full size in tan styling clay, with one half wrapped in silver foil film to judge the highlights.',
        color_and_tone:
          'Warm tan-ochre clay, one side foil-wrapped in dull silver, thin black tape lines marking the key design curves.',
        lighting_and_shadow:
          'Large overhead design-studio light panels throwing long highlight lines across the forms to judge surface quality.',
        texture_and_material:
          'Fine rake marks from clay slicks, crisp milled edges, wrinkles in the foil film, tape lines and a foam core base.',
        camera_and_composition:
          'Keep the requested view; the split between the clay half and the foil half runs down the center line.',
        atmosphere_and_mood: 'Workshop-serious and exploratory, a design still being decided.',
        rendering_and_quality:
          'Physical styling clay with tool marks, never smooth grey CGI clay, and no hands or tools cluttering the frame.',
        key_features:
          'tan styling clay; silver foil half; black tape design lines; rake and slick marks; overhead light panels',
      }),
      avoid: [...AVOID, 'grey viewport clay', 'plasticine fingerprints'],
      briefs: [
        'Industrial design clay buck of a full-size low sports car body on a milling plate, left half wrapped in dull silver foil film to judge highlights, black tape lines tracing the shoulder and roof curves, fine rake marks on the tan clay, overhead light panels. No text or logo.',
        'Industrial design clay buck of a sailing yacht hull at quarter scale on a foam base, tape lines tracing the sheer line, long highlight bands sliding over the foil half. No text or logo.',
        'Industrial design clay buck of a high-backed throne chair, slick marks on the armrests, crisp milled edges on the tall back, foil half gleaming beside the matte clay. No text or logo.',
      ],
    },
    {
      name: 'Clear-Shell Electronics Render',
      domain: 'transparent electronics housing',
      tags: ['transparent', 'electronics', 'product-design'],
      dna: hs({
        aesthetic:
          "Clear-shell electronics: the subject's housing molded in transparent tinted plastic, so circuit boards, wiring, screws and mechanisms inside are fully visible.",
        subject_treatment: change(
          'mold its outer shell in translucent tinted plastic and fill it with plausible circuit boards, wiring and mechanisms',
        ),
        color_and_tone:
          'Smoke grey, ice blue or translucent grape and lime shells over green circuit boards, copper traces and colored wires.',
        lighting_and_shadow:
          'Soft backlight glowing through the shell edges, crisp front highlights on the plastic and inner parts slightly darkened by the tint.',
        texture_and_material:
          'Glossy clear plastic with molded screw bosses, ribs and parting lines; boards with chips, capacitors and ribbon cables.',
        camera_and_composition:
          'Keep the requested view; the inside is arranged so the eye reads layers of shell, frame and electronics.',
        atmosphere_and_mood: 'Nerdy and delightful, the joy of seeing how something works.',
        rendering_and_quality:
          'Accurate plastic refraction and internal detail; chips are unmarked and boards carry no readable print.',
        key_features:
          'transparent tinted housing; visible circuit boards; molded screw bosses and ribs; colored wires; backlit shell edges',
      }),
      avoid: [...AVOID, 'opaque housing', 'readable chip markings'],
      briefs: [
        'Clear-shell electronics render of a mechanical dragon hatchling toy, its body molded in translucent grape plastic revealing a green circuit board spine, small servo motors in the wings and colored wires, backlight glowing through the shell edges. No text or logo.',
        'Clear-shell electronics render of a rotary telephone in smoke-grey transparent plastic, the bells, dial mechanism and copper coils visible inside, crisp highlights on the handset. No readable numbers, text or logo.',
        'Clear-shell electronics render of a carry lantern in ice-blue clear plastic with an LED board and battery pack where the candle would be, molded ribs and screw bosses catching light. No text or logo.',
      ],
    },
    {
      name: 'Riveted Sheet-Metal Build',
      domain: 'riveted sheet-metal construction',
      tags: ['sheet-metal', 'rivets', 'fabrication'],
      dna: hs({
        aesthetic:
          'Riveted sheet-metal construction: the subject built from bent and folded metal sheet, joined by rows of rivets with visible bend radii and overlapping seams.',
        color_and_tone:
          'Bare galvanized grey, oxidized aluminum or sheet painted in faded utility colors, with crystalline zinc spangle patterns.',
        lighting_and_shadow:
          'Hard sun or a single work lamp raking across the seams so each rivet head casts a tiny shadow.',
        texture_and_material:
          'Bend radii on folds, overlapping lap seams, domed rivet rows, shallow oil-can dents and zinc spangle crystals.',
        camera_and_composition:
          "Keep the requested view; the panel layout follows the forms like a tailor's seams.",
        atmosphere_and_mood: 'Hand-built and sturdy, a thing hammered into shape in a hangar.',
        rendering_and_quality:
          'Thin-sheet construction with real fold thickness, never solid cast or machined parts.',
        key_features:
          'folded sheet with bend radii; rows of domed rivets; lap seams; oil-can dents; galvanized spangle',
      }),
      avoid: [...AVOID, 'solid cast metal', 'welded smooth seams'],
      briefs: [
        'Riveted sheet-metal CGI render of a life-size war elephant built from bent galvanized panels, rows of domed rivets tracing its trunk and ears, overlapping lap seams, shallow oil-can dents on its flank, hard low sun raking every rivet. No text or logo.',
        'Riveted sheet-metal CGI render of a gothic chapel steeple clad in riveted aluminum panels, bend radii along every gable fold, a single work lamp raking the seams at dusk. No text or logo.',
        'Riveted sheet-metal CGI render of a heron standing in shallow water, its feathers folded sheet painted faded blue, zinc spangle showing where paint has flaked. No text or logo.',
      ],
    },
    {
      name: 'CNC Billet-Machined Render',
      domain: 'CNC billet machining',
      tags: ['cnc', 'machined-aluminum', 'anodized'],
      dna: hs({
        aesthetic:
          'CNC billet machining: the subject carved from a solid block of aluminum, with scalloped toolpath marks, pocketed recesses and crisp chamfers left by the mill.',
        color_and_tone:
          'Bright bare aluminum with selective anodized accents in deep red, cobalt blue or satin black.',
        lighting_and_shadow:
          'Studio key with a strip light so the concentric and parallel toolpath scallops shimmer as anisotropic highlights.',
        texture_and_material:
          'Ball-end mill scallops on curves, flat facing marks, pocket fillets, drilled holes and deburred chamfers.',
        camera_and_composition:
          'Keep the requested view; the angle shows both a toolpath-textured curve and a crisp pocket.',
        atmosphere_and_mood: 'Precise and luxurious, weight and accuracy you can almost feel.',
        rendering_and_quality:
          'Machining evidence on every surface, never smooth cast metal or molded plastic.',
        key_features:
          'solid billet aluminum; toolpath scallops; pocketed recesses; deburred chamfers; anodized accents',
      }),
      avoid: [...AVOID, 'cast metal finish', 'plastic look'],
      briefs: [
        'CNC billet-machined render of a stag head trophy carved from a single aluminum block, ball-end scallops shimmering along the antlers, pocketed recesses behind the ears, deburred chamfers, deep red anodized eyes, strip-light highlights. No text or logo.',
        'CNC billet-machined render of a longsword hilt and pommel machined from billet, concentric toolpath rings on the pommel, a satin black anodized grip, crisp pocketed guard. No text or logo.',
        'CNC billet-machined render of a quadcopter drone frame with pocketed arms and cobalt-blue anodized motor mounts, flat facing marks on the top plate. No text or logo.',
      ],
    },
    {
      name: 'Streamline Enamel Appliance',
      domain: 'mid-century streamline appliance design',
      tags: ['streamline', 'enamel', 'retro-appliance'],
      dna: hs({
        aesthetic:
          'Streamline appliance design: the subject reshaped as a mid-century household machine with teardrop curves, baked enamel shell and chrome speed-line trim.',
        subject_treatment: change(
          'restyle its casing into rounded streamline forms in baked enamel with chrome trim',
        ),
        color_and_tone:
          'Pastel mint, butter yellow, cream or cherry-red enamel with bright chrome bands and black phenolic knobs.',
        lighting_and_shadow:
          'Soft broad key and a clean white bounce, long curving highlights running along the rounded shell.',
        texture_and_material:
          'Thick glossy enamel with slight orange peel, triple parallel chrome strips, phenolic handles and rubber feet.',
        camera_and_composition:
          'Keep the requested view; a slight low angle gives the object a proud, monumental stance.',
        atmosphere_and_mood:
          'Optimistic and cheerful, the future as a showroom imagined it long ago.',
        rendering_and_quality:
          'Smooth rounded surfacing with clean chrome reflections and no badges, numbered dials or brand names.',
        key_features:
          'teardrop rounded casing; baked pastel enamel; triple chrome speed lines; phenolic knobs; long curved highlights',
      }),
      avoid: [...AVOID, 'numbered dials', 'badges'],
      briefs: [
        'Streamline appliance render of a potion-brewing cauldron reshaped as a mint-green enamel countertop machine with teardrop curves, triple chrome speed lines and black phenolic knobs, long curved highlights, slight low angle. No text or logo.',
        'Streamline appliance render of a robot dog in butter-yellow baked enamel with chrome ear fins and rubber feet, sitting on a checkered kitchen floor. No text or logo.',
        'Streamline appliance render of an inkwell and quill stand reshaped as a cherry-red enamel desk machine with a chrome nose cone, orange-peel gloss catching a soft key. No text or logo.',
      ],
    },
    {
      name: 'Generative-Design Lattice Part',
      domain: 'topology-optimized printed part',
      tags: ['generative-design', 'lattice', 'metal-print'],
      dna: hs({
        aesthetic:
          'Topology-optimized generative design: the subject reduced to bone-like load paths and organic lattice struts, as if grown by an algorithm and printed in metal.',
        subject_treatment: change(
          'hollow its solid mass into optimized struts and lattices that follow its load paths',
        ),
        color_and_tone:
          'Matte sintered titanium grey or powder-white nylon, with machined contact faces in brighter bare metal.',
        lighting_and_shadow:
          'Soft studio key with deep occlusion inside the lattice and a rim light separating the branching struts.',
        texture_and_material:
          'Fine layer lines and sintered grain on the struts, gyroid infill in thick regions, smooth machined mounting faces.',
        camera_and_composition:
          'Keep the requested view; the angle looks through the lattice to show its depth.',
        atmosphere_and_mood: 'Alien and efficient, engineering that looks as if it grew.',
        rendering_and_quality:
          'Printed-metal behavior with smooth branching joints; not a random fractal, a wireframe or a plant.',
        key_features:
          'bone-like load-path struts; gyroid infill; sintered titanium finish; layer lines; machined contact faces',
      }),
      avoid: [...AVOID, 'solid block', 'random fractal branching'],
      briefs: [
        'Generative-design lattice render of a winged gargoyle perched on a machined steel base, its body hollowed into bone-like titanium load-path struts and gyroid lattice, sintered grey grain, rim light threading through the branches. No text or logo.',
        'Generative-design lattice render of a prosthetic lower leg for an adult sprinter, powder-white nylon lattice following the load paths, bright machined socket and foot plate. No text or logo.',
        'Generative-design lattice render of a footbridge spanning a narrow mossy gorge, printed in steel as branching struts that thicken toward the abutments, seen from below. No text or logo.',
      ],
    },
  ],
};

export const aliases = { 'SP03-067': 'Cybernetic Implant' };

export default spec;
