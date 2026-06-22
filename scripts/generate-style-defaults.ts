import { Database } from 'bun:sqlite';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Asset, Job, Project } from '../packages/shared/src';
import { resolveLibraryPathFromRoot } from '../apps/local-server/src/library';
import type {
  StyleRuntimePack,
  StyleRuntimePreset,
} from '../components/recipes/styles/runtimeTypes';
import {
  createStyleDefaultFailureEntry,
  createStyleDefaultJobRequest,
  createStyleDefaultManifestEntry,
  createStyleDefaultTargets,
  type StyleDefaultManifestEntry,
} from '../lib/styleDefaultAssetPipeline';
import {
  RECIPE_ASSET_EXTENSION,
  IMAGEGEN_DENOISE_SUFFIX,
  appendImagegenDenoiseDirective,
  defaultCodexHome,
  defaultStudioLibraryDir,
  defaultsDir,
  loadPacks,
  repoRelative,
  rootDir,
  request,
  sanitizeStylePromptName,
  sanitizeCategory,
  styleCategoryImageKey,
  valueOf,
  writeRepoWebpAsset,
} from './style-default-utils';
import { Effect } from 'effect';
import { pollWithScriptTimeout, sleepWithEffect } from './runtimePolicy';

interface PendingPreset {
  pack: StyleRuntimePack;
  preset: StyleRuntimePreset;
  category: string;
  destination: string;
  variantSlot?: number;
}

const IMAGEGEN_MODEL = process.env.CODEX_IMAGEGEN_MODEL || 'gpt-5.4-mini';
const IMAGEGEN_REASONING_EFFORT = process.env.CODEX_IMAGEGEN_REASONING_EFFORT || 'low';
const libraryDir = process.env.STUDIO_LIBRARY_DIR || defaultStudioLibraryDir;
const studioDbPath = resolveLibraryPathFromRoot(libraryDir, 'studio.sqlite');
const IMAGE_RETRY_ATTEMPTS = Math.max(1, Number(process.env.CODEX_IMAGEGEN_RETRY_ATTEMPTS || 2));
const WAIT_POLL_MS = 800;
const WAIT_TIMEOUT_MS_RAW = Number(process.env.CODEX_IMAGEGEN_WAIT_TIMEOUT_MS || 0);
const WAIT_TIMEOUT_MS = Number.isFinite(WAIT_TIMEOUT_MS_RAW) ? Math.max(0, WAIT_TIMEOUT_MS_RAW) : 0;
const RETRY_RETRY_DELAY_MS = 600;

const CATEGORY_BASE_PROMPTS: Record<string, string> = {
  pack_01__portrait_styles:
    'A realistic half-body adult portrait with a clear face, visible eyes, natural posture, restrained wardrobe, skin detail, hair detail, and a simple background with enough depth for lens, lighting, grain, and facial rendering differences.',
  pack_01__film_stocks:
    'A documentary travel photograph of one adult subject on a rainy city street with practical lights, wet pavement, foliage, fabric, glass, signage-free architecture, skin tones, bright color accents, deep shadows, and sky detail for film stock behavior.',
  pack_01__camera_types:
    'A controlled vertical scene with one human-scale subject, a room or street plane, foreground tabletop objects, distant background geometry, reflective surfaces, fine details, straight lines, and scale cues that expose lens, camera, surveillance, aerial, macro, or thermal traits.',
  pack_01__lighting:
    'A simple interior or narrow street set with one adult figure, textured wall, fabric, wood, glass, haze, reflective floor, and visible practical or natural light sources so shadows, highlights, bounce, and atmosphere are readable.',
  pack_01__genres:
    'A genre-ready cinematic portrait scene with one protagonist, readable location, wardrobe, props, atmosphere, and narrative tension. Adapt the subject, era, and setting to the named genre while avoiding franchise-specific identities.',

  pack_02__film_genres:
    'A cinematic style-card study with one simple original subject or abstract motif, controlled light, color separation, surface behavior, and no repeated stock props. Adapt the named genre through rendering, mood, framing, palette, and texture rather than literal locations.',
  pack_02__tv_and_broadcast:
    'A vertical broadcast-look style-card with signal texture, chroma-like color fields, scan behavior, clean overlay geometry, monitor glow as abstract light, and no physical cameras, studio furniture, lamps, cables, or readable text.',
  pack_02__animation_styles:
    'A vertical animation style-card specimen with one original silhouette, abstract shape cluster, or simple nonliteral icon on a controlled graphic field. Let line behavior, color, texture, and shape language dominate instead of workshop, stage, room, or prop staging.',
  pack_02__photography_eras:
    'A period-neutral street or portrait photograph with one subject, architecture, clothing texture, sky, skin, shadows, highlights, and tonal range designed to reveal photographic process, emulsion, age, grain, and color reproduction.',
  pack_02__lighting_and_atmosphere:
    'A cinematic atmosphere study using abstract light falloff, reflection, haze, shadow shapes, tonal planes, and restrained material response. Avoid literal rooms, windows, lamps, curtains, chairs, fabric props, or staged studio setups unless the preset explicitly requires them.',
  pack_02__cinematic_lighting_and_lenses:
    'A grounded cinematic lighting and lens study with one simple subject, abstract material arrangement, or optical field, clean background geometry, readable surface behavior, haze only when needed, strong shadow shapes, and no visible photography equipment, lamps, studio props, or repeated room staging.',
  pack_02__caricature_and_cartoon_styles:
    'A clean cartoon style-card specimen with one original character, abstract shape, or simple object as a flat sticker/poster icon on a full-bleed graphic color/texture field, readable silhouette, expressive line behavior, and no literal parody target, room, wall, floor, cast shadow, corner, horizon line, lamp, fabric, prop set, or political identity.',

  pack_03__render_engines:
    'A hero 3D creature or sculptural product on a pedestal in a clean studio gallery, surrounded by material swatches, reflective floor, glass, metal, skin-like material, fine geometry, and controlled lighting to reveal render-engine traits.',
  pack_03__lookdev_and_render_pipelines:
    'A representative 3D lookdev/render-pipeline style-card with one original subject, character bust, creature fragment, sculptural object, material specimen, or purposeful environment chosen to fit the preset, plus shader swatches, light probes, reflection planes, caustic hints, volumetric depth, and geometry-density samples. Do not default to repeated stock rooms, literal software UI, camera/lens props, showroom staging, readable text, logos, or generic abstract-only cards.',
  pack_03__materials:
    'A studio still life of simple geometric objects and a small figurine, with the central object dominated by the named material, plus secondary metal, glass, fabric, stone, and organic details for material contrast.',
  pack_03__3d_styles:
    'A clean 3D object study with one central constructed form, support primitives, visible silhouette, neutral background, modeling cues, surface detail, and lighting that makes topology and style language legible.',
  pack_03__lighting_and_atmosphere:
    'A minimal 3D interior display room with one central bust or object, reflective floor, volumetric fog, practical light panels, hard and soft shadow areas, and layered depth.',
  pack_03__applications:
    'A purpose-specific 3D presentation scene adapted to the preset: product render, game asset, architectural visualization, scientific model, motion graphics frame, or VFX element, with a single clear focal subject and no text.',

  pack_04__comic_book_styles:
    'A vertical comic hero panel with one original protagonist, dynamic pose, urban or dramatic environment, action framing, props, depth layers, and clear space for ink, panel energy, halftone, line weight, and color treatment.',
  pack_04__children_s_illustration:
    'A whimsical storybook scene with one child or small original character, friendly environment, simple props, expressive gesture, warm narrative moment, and enough background detail for illustration texture and shape language.',
  pack_04__editorial_and_poster:
    'A vertical editorial poster-style composition with one bold symbolic subject, strong silhouette, graphic background shapes, visual hierarchy, and no lettering or logo.',
  pack_04__concept_art:
    'A vertical concept-art key image with one original character, creature, vehicle, or environment focal point, cinematic depth, design callouts expressed visually, believable scale, and mood-driven lighting.',
  pack_04__ink_and_print:
    'A printmaking-focused composition showing one strong subject and a few supporting objects as if prepared for a finished print, with visible paper, ink, plate, block, or press-like texture cues and no text.',
  pack_04__fantasy_and_concept_illustration:
    'A vertical illustration or poster specimen with one original graphic anchor, flat or shallow graphic field, strong silhouette, medium-specific treatment, and no literal room, market, library, fantasy hallway, glowing portal or orb, or prop-led staging.',
  pack_04__childrens_and_educational:
    'A clean educational illustration specimen with one readable subject, specimen, diagram, or storybook clarity, paper, ink, or wash evidence, and no classroom, library, reading room, shelves, desks, labels, or tiny text.',
  pack_04__editorial_illustration:
    'A vertical editorial graphic card with one symbolic subject or modular visual system, clear hierarchy, poster-safe negative space, and no UI or dashboard screenshot, readable text, room scene, or prop clutter.',

  pack_05__70s_and_80s_retro_anime:
    'A retro anime keyframe with one original adventurer, mechanical or city backdrop, dramatic pose, painted background, expressive face, and practical props suited to vintage cel-era treatment.',
  pack_05__90s_golden_era:
    'A dramatic 1990s anime-inspired keyframe with one original hero, moody urban or fantasy background, strong silhouette, cinematic cel lighting, and emotional close-to-mid shot staging.',
  pack_05__2000s_classics:
    'An early-2000s anime adventure scene with one original character, layered environment, energetic pose, clean background details, and enough color variety for era-specific digital-cel styling.',
  pack_05__modern_shonen_and_action:
    'A modern action anime battle moment with one original fighter, motion arcs, impact energy, dramatic camera angle, debris, layered background, and readable costume details without referencing any franchise.',
  pack_05__action:
    'A character-led anime action keyframe with one original protagonist, readable pose, motion arcs, impact energy, clean cel silhouette, and a simple support environment chosen for the preset. Keep action legible without weapon-first framing, franchise likeness, corridor defaults, market/library aisles, cameras, or noisy debris overload.',
  pack_05__shojo_magical_girl_and_visionary_classics:
    'An emotional anime portrait or character duet with expressive eyes, elegant costuming, symbolic props, soft or celestial background motifs, and a romantic, magical, or visionary dramatic atmosphere.',
  pack_05__mecha_and_cyberpunk:
    'A vertical scene with an original pilot, android, or mecha detail in a neon industrial environment, visible machinery, reflective armor, cockpit or alley context, and hard-edged sci-fi design.',
  pack_05__dark_fantasy_and_seinen:
    'A dark fantasy or mature anime scene with one original character, ruined architecture, ominous atmosphere, textured costume, dramatic shadows, and grounded narrative weight.',
  pack_05__studio_masterpieces:
    'A poetic anime film still with one original traveler in a richly painted natural or urban environment, wind, sky, warm human detail, layered depth, and quiet cinematic emotion.',
  pack_05__slice_of_life_and_moe:
    'A cozy everyday anime scene with one original character in a room, cafe, school-adjacent, or street setting, expressive pose, small props, warm light, and gentle background detail.',
  pack_05__sports_competition_and_performance:
    'A dynamic anime sports or performance scene with one original competitor or performer, strong body language, venue context, discipline-specific gear or stage cues, audience or ensemble depth, and clean motion readability.',
  pack_05__isekai_and_high_fantasy:
    'A vertical fantasy anime scene with one original traveler, magical city, forest, dungeon, or floating landscape, costume detail, glowing artifact, atmospheric depth, and adventure mood.',
  pack_05__anime_style_spectrum:
    'An auteur anime style-study scene with one original subject, expressive line discipline, distinctive silhouette logic, creative rendering texture, and a clear authorial identity rather than franchise imitation.',
  pack_13__core_anime:
    'A character-led anime keyframe with one original protagonist, readable acting pose, clean cel silhouette, preset-specific costume or body-language cue, and a simple support environment that reinforces the style without becoming a generic corridor, market, library, camera, or prop room.',
  pack_13__slice_of_life_school_music:
    'A gentle character-led anime lifestyle keyframe with one original student, musician, friend, or everyday protagonist, soft acting, warm small-scene context, and restrained props chosen for the preset without forcing classroom, hallway, cafe, or music-room repetition.',
  pack_13__shojo_magical_girl_and_visionary_classics:
    'An emotional shojo or visionary anime keyframe with one original character, expressive eyes, elegant pose language, symbolic light motifs, soft costume detail, and clean romantic or magical atmosphere without franchise costume echoes.',
  pack_13__slice_of_life_and_moe:
    'A cozy anime character moment with one original protagonist, gentle gesture, readable outfit silhouette, soft everyday context, and warm color identity; keep it character-first without generic bedroom, cafe, school, lamp, curtain, or prop formula.',
  pack_13__anime_style_spectrum:
    'An anime style-spectrum card with one original character or clear character-adjacent focal subject, distinctive line discipline, era or auteur-specific rendering texture, and strong silhouette identity rather than a generic anime face or abstract material field.',

  pack_06__traditional_painting:
    'A finished traditional-painting style-card with one original figure, object, landscape fragment, architectural detail, botanical form, or symbolic material subject in a purposeful setting. Let brushwork, pigment body, edge softness, palette, and painted light carry the medium; do not default to studio walls, chairs, curtains, lamps, easels, artist rooms, or generic prop arrangements.',
  pack_06__drawing_and_sketching:
    'A drawing study of one subject with clear silhouette, anatomy or object structure, simple props, paper-like surface, tonal planes, and visible opportunities for line, graphite, charcoal, or ink handling.',
  pack_06__printmaking:
    'A printmaking motif with one bold subject, simplified shapes, paper texture, carved or etched mark opportunities, high contrast, and a finished handmade-print feeling.',
  pack_06__digital_art:
    'A polished digital illustration or concept scene with one original character, object, or environment focal point, clean composition, layered lighting, material detail, and space for digital rendering choices.',
  pack_06__mixed_media:
    'A layered mixed-media composition with one central subject, collage fragments, paint, paper, texture, transparent overlays, found-material cues, and controlled visual hierarchy without text.',
  pack_06__retro_game_visual_systems:
    'A game-native image built around one unmistakable retro visual constraint, such as palette limits, tile logic, CRT scan behavior, sprite layering, or old-computer display quirks, with clear read and era-authentic materials.',
  pack_06__game_art_directions_and_ui:
    'A polished game-art key image, interface sheet, or worldbuilding asset with one strong playable focal concept, production-grade readability, and enough structured detail to feel useful inside a modern game pipeline.',

  pack_07__interior_design:
    'A vertical interior room scene with furniture, decor, natural and practical light, textiles, wall materials, floor detail, human scale cues, and a clear design focal point.',
  pack_07__interior_design_systems:
    'A vertical interior style-card with one readable built/material anchor, natural and practical light, textiles or hard finishes when useful, human scale cues, foreground/midground/background depth, and no repeated showroom-room formula.',
  pack_07__architectural_styles:
    'An architectural portfolio image of one building or interior volume with structural lines, facade or spatial rhythm, material detail, scale cues, sky or landscape context, and clean vertical framing.',
  pack_07__architectural_movements_and_vernaculars:
    'A vertical architectural style-card with one readable facade, threshold, structural detail, or interior volume; show movement-specific rhythm, material logic, scale cues, and clean vertical framing without postcard, lobby, corridor, or room-set defaults.',
  pack_07__environment:
    'A cinematic built environment with architecture, streetscape or interior-exterior transition, atmospheric light, readable scale, layered depth, materials, and a single compositional focal point.',
  pack_07__civic_infrastructure_and_specialty_spaces:
    'A vertical infrastructure style-card with one readable civic, transit, archive, data, hospital, or specialty-space anchor, atmospheric pressure, scale cues, layered depth, durable materials, and no long corridor or signage dependency.',
  pack_07__landscape_architecture:
    'A designed outdoor landscape with paths, planting, water or stone, seating or human-scale cues, architectural edge, layered vegetation, and controlled natural light.',
  pack_07__landscape_and_garden_systems:
    'A vertical landscape-system style-card with one readable path, planting, water, stone, earthwork, garden surface, or outdoor spatial anchor, controlled natural light, scale cues, and no generic park/postcard formula.',
  pack_07__fantasy_architecture:
    'A fantasy architectural scene with one impossible building or interior, stairs, arches, towers or chambers, magical light, scale cues, atmospheric depth, and original worldbuilding.',
  pack_07__fantasy_and_mythic_architecture:
    'A vertical fantasy-architecture style-card with one original impossible building, chamber, threshold, tower, material fragment, or spatial paradox, atmospheric depth, scale cues, and no generic fantasy hallway or castle postcard.',
  pack_07__toy_craft_and_miniature_architecture:
    'A vertical miniature/craft architecture style-card with one readable toy-scale built anchor, handmade material logic, playful scale cues, tactile construction, and no tabletop craft mess, product shot, or empty cute object.',
  pack_07__megastructure_and_impossible_space:
    'A vertical impossible-space style-card with one readable megastructure, recursive surface, monolith, optical loop, or dimensional anchor, strong scale pressure, clean depth logic, and no corridor tunnel, control-room, or black-empty abstraction.',

  pack_08__contemporary_fashion:
    'A full-body vertical fashion editorial with one adult model, runway or studio setting, visible garment silhouette, fabric motion, accessories, lighting, and uncluttered background.',
  pack_08__subcultures:
    'A vertical subculture fashion portrait in a bedroom, street, club, or studio-like space with one adult model, wardrobe details, accessories, props, and environment cues tied to the style.',
  pack_08__historical_and_fantasy:
    'A historical or fantasy costume portrait with one adult model, full garment silhouette, period or fantasy setting, textiles, accessories, hair detail, and dramatic but readable lighting.',
  pack_08__fantasy_sci_fi_costume:
    'A vertical costume design portrait of one original character wearing fantasy or sci-fi attire, armor or fabric systems, props, material contrast, and environment cues.',
  pack_08__fabric_and_texture_focus:
    'A garment material study with one wearable item on a model or mannequin, fabric folds, stitching, surface texture, trim, highlights, and close enough framing to reveal textile behavior.',

  pack_09__natural_materials:
    'A close-up material-world study of one natural surface as the hero subject, with secondary scale cues, tactile relief, color variation, grazing light, and macro detail; avoid gallery plinth, product render, and centered specimen trophy unless the preset specifically needs it.',
  pack_09__man_made_materials:
    'A close-up material-world study of one manufactured surface or object, with clean edges, fabrication marks, reflections, wear, and controlled lighting; avoid gallery plinth, product render, showroom pedestal, and centered trophy-object staging.',
  pack_09__weathering_and_decay:
    'A close-up scene of aged material with corrosion, peeling, cracks, stains, residue, dust, and layered history under directional light; prefer environmental material fragments over clean product display.',
  pack_09__tactile_surfaces:
    'A tactile macro surface composition with folds, fibers, grains, pores, bumps, and touchable relief, framed vertically with strong texture hierarchy.',
  pack_09__elemental_and_fx:
    'A close-up elemental or visual-effects material scene with one dominant phenomenon, particles, glow, fluid, smoke, sparks, or frost interacting with a simple surface.',

  pack_10__geometric_abstraction:
    'A vertical abstract composition based on deliberate geometric logic, central structure, negative space, dimensional layering, controlled color, and clean edge relationships.',
  pack_10__fluid_and_organic:
    'A vertical abstract composition of flowing organic forms, liquid motion, soft boundaries, layered translucency, color gradients in material rather than UI, and tactile depth.',
  pack_10__digital_glitch_and_noise:
    'A vertical digital abstraction with one coherent focal structure, signal distortion, scan artifacts, pixel noise, data-like fragmentation, and no readable text.',
  pack_10__surrealism_and_dream:
    'A surreal vertical scene with one impossible focal subject, dreamlike spatial logic, symbolic props, atmospheric depth, and strange but coherent lighting.',
  pack_10__pattern_and_texture:
    'A vertical pattern and texture composition with a clear repeat or motif logic, tactile material detail, layered rhythm, and one dominant visual system.',

  pack_11__toys_and_crafts:
    'A centered vertical toy or craft object scene with one handmade or collectible focal subject, table surface, tools or materials, scale cues, and playful but clean lighting.',
  pack_11__artistic_mediums:
    'A single subject rendered as a finished artwork in the named medium, with visible material behavior, surface texture, studio context, and no text.',
  pack_11__aesthetics:
    'A stylized vertical scene with one clear subject, props, environment cues, color story, texture, and composition tailored to the named aesthetic.',
  pack_11__food_and_drink:
    'A vertical food or drink hero shot with one plated dish or beverage, utensils, fabric, tabletop, controlled highlights, appetizing texture, and background depth.',
  pack_11__micro_macro:
    'A close-up or miniature-scale vertical scene with one tiny or magnified subject, strong scale cues, macro detail, shallow depth, texture, and readable environment context.',

  pack_12__neon_urban_and_night_ops:
    'An in-engine gameplay screencap from a neon urban game: one playable moment, third-person or tactical camera, navigable lanes, interactable objective read, wet neon surfaces, and no promo/key-art staging.',
  pack_12__arcane_temples_and_mythic_realms:
    'An in-engine gameplay screencap from an arcane fantasy game: one playable exploration, boss, puzzle, or traversal beat inside a mythic space, with readable route and no concept-art poster framing.',
  pack_12__sci_fi_frontiers_and_mech_zones:
    'An in-engine gameplay screencap from a sci-fi frontier game: playable camera, mechanical scale, traversal/combat objective, functional infrastructure, readable cover or route, and no asset-render presentation.',
  pack_12__sieges_warfronts_and_last_stands:
    'An in-engine gameplay screencap from a siege or defense game: playable battlefield camera, fortified objective, readable front line, cover lanes, pressure state, and no cinematic poster/key-art lineup.',
  pack_12__speed_sport_and_competitive_arenas:
    'An in-engine gameplay screencap from a competitive speed or arena game: readable track, lane, duel, rhythm, or match state, action timing, camera feedback, and no promotional sports poster.',
  pack_12__wilderness_hunts_and_harsh_frontiers:
    'An in-engine gameplay screencap from a wilderness survival or hunt game: playable terrain, pursuit route, creature/weather threat, resource or weak-point read, and no creature concept sheet.',
  pack_12__heists_horror_and_underworld_runs:
    'An in-engine gameplay screencap from a heist, horror, or underworld run: stealth route, escape lane, threat state, interactable objective, stylized danger when needed, and no horror poster/key-art pose.',
  pack_12__puzzle_chambers_and_adventure_setpieces:
    'An in-engine gameplay screencap from an adventure or puzzle game: playable chamber, hub, landmark, or finale state with spatial mechanic, progression route, and no UI/menu or concept-art layout.',

  pack_15__classic_industrial_punks:
    'A vertical x-punk digital-painting style card built around classic industrial retrofuture life: one distinctive protagonist inhabiting a rail platform, civic machine district, airship dock, print city, or boiler commons. Machinery shapes set the world behind and around the character; they are not the pose objective. Use stylized illustration, clean digital painting, graphic-novel card shapes, warm metal palettes, broad industrial silhouettes, simplified drawn faces/hands, shallow poster depth, and a low-to-moderate detail budget instead of photoreal grit, generic concept art, cinematic lensing, realistic material rendering, tiny rivet noise, or dense scaffold/cable grids.',
  pack_15__neon_net_and_signal_punks:
    'A vertical x-punk digital-painting style card built around network, signal, and neon street life: one memorable protagonist moving through, waiting inside, performing in, or being shaped by a signal-heavy city fragment. Signal hardware, rain color, and cable architecture live in the background/world; do not make the character operate a gadget. Use stylized digital illustration, clean digital painting, graphic neon color, clear silhouettes, broad matte color slabs, simplified rain/reflection shapes, and a few large signal motifs without camera props, readable UI, photoreal rain, mirror-wet realism, dense cable lattice, panel-grid overload, or generic market/library/corridor staging.',
  pack_15__eco_repair_and_climate_punks:
    'A vertical x-punk digital-painting style card built around climate repair and ecological infrastructure as lived culture: one memorable protagonist in an orchard, roof, floodwall, seed archive, mangrove route, or climate district. Ecological machinery is background pressure and architecture, not a handheld task. Keep solarpunk as one possible note, not the whole category; use designed green-tech shapes and controlled painted texture, not generic glass utopia or realistic eco concept art.',
  pack_15__bio_myco_and_body_punks:
    'A vertical x-punk digital-painting style card built around biotech, mycelium, prosthetic craft, or body-interface identity: one standout protagonist whose silhouette, clothing, posture, and surrounding bio-architecture reveal the world. Organism-machines support the environment; avoid object-only specimen cards and clinic-task repetition. Use stylized organic shape painting, simplified anatomy, controlled biological texture, and no explicit gore, photoreal anatomy, or high-frequency membrane detail.',
  pack_15__ocean_ice_and_terrain_punks:
    'A vertical x-punk digital-painting style card built around extreme terrain systems: one standout sea-rig, ice, desert, cliff, swamp, cave, or mountain protagonist visibly shaped by the environment. Landforms, vessels, stations, and utility shapes build the background; avoid empty landscape, machine-only cards, and maintenance-task repetition. Use bold landform silhouettes, weather color blocks, and designed utility shapes without fantasy hallway, landscape postcard drift, or realistic survival-game key art.',
  pack_15__street_riot_and_diy_punks:
    'A vertical x-punk digital-painting style card built around street rebellion and DIY culture: one standout patched fashion figure, basement performer, courier, rider, organizer, or street presence in a lived-in scene. Objects and vehicles support the character; avoid object-only protest posters, crowd propaganda, and workshop-task repetition. Use graphic poster energy, hand-painted marks, simplified character design, and controlled clutter without repeating studio walls, chairs, lamps, or generic realistic alley formulas.',
  pack_15__media_vapor_and_glitch_punks:
    'A vertical x-punk digital-painting style card built around media ghosts, vapor systems, analog signal, and glitch culture: one standout protagonist living inside a broadcast ruin, arcade weather, tape observatory, mall signal zone, or corrupted mascot scene. Signal motifs support the world mood as architecture, weather, glow, costume trim, or background signage shape; avoid object-only glitch posters and operator-at-console repetition. Use stylized graphic signal effects and clean poster geometry, not UI screenshots, text, logos, camera equipment, or noisy abstract glitch.',
  pack_15__occult_myth_and_gothic_punks:
    'A vertical x-punk digital-painting style card built around occult, mythic, and gothic punk worlds: one standout masked, black-lace, shrine-street, storm, mythic, or necrotech protagonist inside a symbolic environment. Ritual systems are background pressure and costume/world detail; avoid shrine-machine-only, relic-only, and repair-bench repetition. Use dark graphic silhouettes, symbolic materials, open midtones, and controlled atmosphere without generic fantasy corridor, realistic horror set, or overpacked micro-ornament.',
  pack_15__space_atomic_and_ray_punks:
    'A vertical x-punk digital-painting style card built around space-age, atomic, raypunk, lunar, and cassette-future culture: one distinctive protagonist with varied age, body type, crop, and pose inside a station, diner, orchard, outpost, reactor promenade, transit commons, or salvage yard. Vehicles/stations support the world; avoid ship-only, machine-only, 1950s American ad pin-up, beauty portrait, handheld radio hero, and worker-crew repetition. Use clean graphic futurism, stylized color blocks, simplified sci-fi shapes, and international editorial poster restraint, not photoreal hard-surface render or AAA concept-art polish.',
  pack_15__primitive_stone_and_salvage_punks:
    'A vertical x-punk digital-painting style card built around primitive, stone, bone, salvage, and low-tech survival invention with curated editorial sensibility: one memorable protagonist whose posture, garment shape, settlement background, weather, and handmade world reveal the subtype. Avoid American fantasy RPG hero cards, full-body adventurer poses, leather-pouch costumes, generic cloaks, young rugged protagonist sameness, object-only artifact cards, and worker-crew repetition. Use folk-modernist poster structure, handmade material poetry, chunky tactile shapes, controlled roughness, and varied crops/compositions rather than generic fantasy cave, documentary prehistoric realism, or noisy survival concept art.',

  pack_17__dark_fantasy_realms:
    'A portrait medieval dark-fantasy RPG illustration card with one original knight, relic, monster, cursed shrine, fortress fragment, or ruin silhouette as the clear focal anchor. Use graphic digital painting, defined linework, broad midtone color planes, simple edge lighting, visible detail, ash, iron, stone, sacred decay, and solemn fantasy weight without photorealistic rendering, micro-detail armor, mostly-black palettes, franchise likeness, explicit gore, or heroic-clean polish.',
  pack_17__hunter_gothic_and_plague_courts:
    'A portrait gothic medieval-horror graphic illustration card with one original hunter, plague court figure, reliquary, cathedral object, beast silhouette, or moonlit alley fragment as the focal anchor. Use defined ink-like contours, broad color planes, simple readable light, baroque trim, clean fog shapes, wax, leather, surgical relic detail, crimson moon accents, and ornate dread without photorealistic rendering, dense costume micro-detail, mostly-black palettes, copied game identities, or graphic gore.',
  pack_17__acid_dungeon_zine:
    'A portrait underground dungeon-zine style-card with one chunky original medieval monster, hooded cult figure, skull-armored knight, occult relic, castle, or bestiary icon as the focal anchor. Use heavy clean black xerox ink, acid risograph colors, controlled paper texture, boxed-card energy, thick borders, tidy halftone, and symbol-like marks that are not readable text. Keep dark areas as solid readable black shapes, not noisy artifact fields.',
  pack_17__futuristic_medieval_and_rune_tech:
    'A portrait futuristic-medieval graphic illustration card with one original rune-tech knight, starforge relic, cyber-castle fragment, mech reliquary, bio-arcane catacomb specimen, or stained-glass sci-fantasy emblem as the focal anchor. Fuse clean digital painting, bold armor shapes, simple luminous edge lighting, flat cathedral geometry, limited circuitry, glyph-like non-readable motifs, and ancient-future material contrast without dense mesh patterns or photoreal material simulation.',
  pack_17__apocalyptic_wargame_and_inked_dungeon:
    'A portrait apocalyptic medieval wargame and inked dungeon RPG illustration card with one original trench crusader, gothic warband relic, stress-ink dungeon hero, sepulcher banner, black-powder shrine, witch-knight, or bone-script monastery fragment as the clear focal anchor. Use digital painting plus etched ink lines, simple candlelight, readable midtones, heraldic armor, tactical silhouettes, and dramatic design shapes without copied tabletop franchise designs, readable text, photorealism, dense miniature texture, or excessive dirty noise.',
  pack_17__monochrome_tarot_and_bestiary_plates:
    'A portrait medieval tarot, monochrome fantasy plate, or bestiary-card illustration with one original omen figure, penitent icon, survival-dungeon relic, heraldic beast, illuminated manuscript creature, stained-glass monster, tapestry beast, or field-guide specimen as the focal anchor. Use clean black ink, warm paper, open white space, broad value groups, crisp contours, sparse controlled wash, and optional single muted accent. Avoid photorealism, crushed black, dirty gray grain, dense cross-hatching carpets, chainmail mesh, readable text, copied game identity, or overpacked occult symbols.',
};

const PACK06_IMAGEGEN_DENOISE_SUFFIX =
  'SP06 MEDIUM OVERRIDE: preserve the exact named medium or old visual system as the finishing surface. Do not convert painting, drawing, printmaking, collage, mixed-media, voxel, pixel, vector, or retro-game presets into generic digital painting, generic anime concept art, semi-real fantasy illustration, or smooth modern game art. Digital cleanup is allowed only as clean reproduction of that medium: large readable marks, authentic material behavior, controlled texture, and medium-specific palette first. ' +
  IMAGEGEN_DENOISE_SUFFIX;

const PACK06_NON_ANIME_MEDIUM_LOCK =
  'SP06 NON-ANIME MEDIUM LOCK: this exact preset is not one of the SP06 anime-allowed presets. Make the first read the named medium or old visual system, not an anime character-card finish. Game-art, JRPG, fighting-game, chibi, sprite, or Japanese-computer cues do not automatically permit generic anime faces, glossy cel hair, visual-novel busts, shonen poses, or gacha framing; use those influences only as medium/system evidence when the preset explicitly needs them. If a figure appears, treat it as a medium-led painted, drawn, printed, collaged, vector, sprite, voxel, or game-art figure with restrained non-anime anatomy.';

const PACK10_PATTERN_TEXTURE_DENOISE_SUFFIX =
  'SP10 PATTERN/TEXTURE OVERRIDE: preserve the named surface, pattern, textile, or material as the entire card signal. Do not convert it into anime, manga, character art, fashion editorial, room staging, product-render staging, photoreal macro realism, or concept art. Use broad readable material behavior, large clean shapes, controlled denoised texture, smooth tonal transitions, and low-to-moderate detail only. Avoid pose language, faces, bodies, mannequins, walls, lamps, furniture, market aisles, library aisles, fantasy hallways, crunchy micro-contrast, and ultra-fine noise.';

const PACK10_PATTERN_TEXTURE_KEYS = new Set([
  'pack_10__pattern_and_texture',
  'pack_10__textile_and_ornamental_patterns',
  'pack_10__material_surface_textures',
  'pack_10__diagram_print_and_light_systems',
]);

function isPack10PatternTextureKey(key: string) {
  return PACK10_PATTERN_TEXTURE_KEYS.has(key);
}

const CATEGORY_SCENE_ANCHORS: Record<string, string[]> = {
  pack_01__lighting: [
    'Place the subject on a quiet rooftop walkway after recent rain, with distant skyline bokeh, puddle reflections, a waist-high concrete ledge, and one practical lamp in frame.',
    'Set the scene in a dim service corridor with one open doorway, reflective tile, a maintenance cart, and a strip of late light falling across the floor.',
    'Use a narrow apartment balcony with wet metal railing, soft curtain spill from indoors, and a distant horizon line beyond the building edge.',
  ],
  pack_02__lighting_and_atmosphere: [
    'Use broad light falloff over one simple subject, room fragment, or material form; avoid reusing the same lamp/wall/furniture formula as filler.',
    'Build the atmosphere from shadow bands, haze gradients, reflective color patches, and one readable focal cue instead of empty abstraction.',
    'Use controlled negative space, soft bloom, and large readable tonal masses; motel, diner, backstage, or studio cues are fine only when preset-specific.',
  ],
  pack_02__cinematic_lighting_and_lenses: [
    'Use cinematic planes, material gradients, and one readable subject or scene fragment; avoid generic wall/floor/lamp/chair/studio setup repetition.',
    'Translate lens behavior into bloom, vignette, flare restraint, depth falloff, and shadow geometry without adding camera gear or symbolic props.',
    'Stage a simple optical/material arrangement or grounded location fragment with controlled negative space and no repeated stock object.',
  ],
  pack_02__caricature_and_cartoon_styles: [
    'Use a paper-like graphic card with broad negative space and one readable cartoon silhouette, allowing floor/contact/shadow when it helps the preset read.',
    'Use one simple original graphic anchor supported by color blocks and loose texture marks; room, wall, furniture, lamp, or fabric cues are allowed when intentional.',
    'Build a graphic card specimen with a clear non-famous subject, controlled texture, and optional simple location/object cue when it is not repeated filler.',
  ],
  pack_03__lookdev_and_render_pipelines: [
    'Use one original 3D subject with shader swatches, reflection strips, caustic glints, and material wedges around it in a clean setting. A room, wall, lamp, showroom cue, or prop is fine if it is intentional and preset-specific; do not make it the repeated default.',
    'Build a compact render-pipeline card around a readable hero form, character bust, or sculptural material specimen, with geometry-density tiles, light probes, bloom/dispersion cues, and surface response as supporting evidence.',
    'Use a representative lookdev composition with spectral highlights, GI bounce patches, ray-shadow bands, and shader swatches around a clear original focal subject; location is allowed when it clarifies the preset, but generic abstract-only fields and repeated location formulas are not.',
  ],
  pack_03__3d_styles: [
    'Build the scene as a clean display diorama on a white plinth with modular blocks, stepped platforms, and a sculptural silhouette that reads immediately as a designed 3D object.',
    'Stage the subject inside a minimal showroom turntable bay with neutral walls, seam lines, and a sharply lit presentation platform.',
    'Use a compact materials lab vignette with sample panels, a suspended light bar, and a hero object isolated against soft gradients.',
  ],
  pack_06__digital_art: [
    'Set one authored digital-art subject inside a purposeful world fragment with layered light, graphic shape language, and no workstation or studio staging.',
    'Use a clean non-anime illustration scene with one medium-led figure, creature, vehicle, artifact, or environment slice whose lighting and brush economy prove the digital-art preset.',
    'Build a finished card around one dynamic subject plus atmospheric support planes; avoid process imagery, screens, tablets, pinned references, desks, and tool props.',
  ],
};

const GENERIC_SCENE_ANCHORS = [
  'Use a simple card setup with broad color masses, one focal silhouette, readable depth cue, and no repeated stock room/corridor/market/library formula.',
  'Build the image around material planes, large shadow shapes, and one clean focal subject; recognizable interiors are fine when intentional.',
  'Use restrained spatial hints, soft atmosphere, and large readable forms; furniture, walls, shelves, tools, plants, lamps, or cloth props must earn their place.',
  'Stage the card as a style specimen: one original focal form, controlled negative space, broad texture fields, and no literal location unless the category requires architecture or environment.',
  'Use a neutral optical/material arrangement with clean silhouettes and strong color identity; avoid camera gear, market/library aisles, fantasy halls, corridors, or desk clutter as repeated defaults.',
];

const PACK_SCENE_ANCHORS: Record<string, string[]> = {
  pack_06__traditional_painting: [
    'Use a painted world-fragment: weathered arch, coastal stone, fabric-wrapped relic, botanical altar, or partial figure embedded in atmospheric light; no studio still-life setup.',
    'Stage the medium as a finished painting moment with subject plus context, broad pigment masses, unusual palette, and one clear foreground/background relationship.',
    'Build a painterly card around material poetry and color drama: not a vase, goblet, portrait bust, saint icon, curtain, chair, lamp, or classroom sample.',
  ],
  pack_06__drawing_and_sketching: [
    'Use a drawing-specific subject with structure and context: vehicle shell, mineral mask, shoe, plant, garment fragment, architectural detail, or kinetic silhouette; no repeated bust or fashion torso.',
    'Stage paper and shadow as the environment, but let the subject feel chosen from a world, not a classroom anatomy exercise or tool demo.',
    'Build line rhythm around one non-default silhouette with cast shadow, support plane, or cropped context edge so the drawing reads as a card, not a study sheet.',
  ],
  pack_06__printmaking: [
    'Use a bold handmade-print scenelet: figure, vessel, plant, machine, architectural cut, or invented creature integrated with ink fields and registration logic.',
    'Stage printmaking as poster-force composition with limited specific inks, strong shape economy, and a memorable subject, not product stationery or a centered decorative object.',
    'Build relief/etched/mesh identity through carved planes, paper pressure, grain, and off-register accents around one alive subject or compact world fragment.',
  ],
  pack_06__mixed_media: [
    'Use a material-world focal form: mask, garment fragment, vessel, botanical/mechanical construction, torso fragment, or architectural paper relic with layered context.',
    'Stage collage, paint, paper, fabric, and seams as an authored world around the subject, not a craft table, pinboard, animal-head shortcut, or beige scrapbook sample.',
    'Build mixed-media hierarchy from foreground scraps, midground subject, and background color field, with one surprising palette decision and no cluttered filler.',
  ],
  pack_06__retro_game_visual_systems: [
    'Use a HUD-free game-native frame where limited palette logic, chunky silhouettes, scanlines, tile grammar, vector glow, or polygon instability dominates the read.',
    'Stage the subject inside playable screen-space with era-specific texture, ground/space logic, and one clear focal cue, without showing hardware or UI.',
    'Build the frame around the visual constraints of the old system itself: pixels, vectors, dithering, scanlines, sprite layers, or low-poly wobble as the world language.',
  ],
  pack_06__game_art_directions_and_ui: [
    'Use a card-ready game-world image with one playable subject, item, landmark, vehicle, relic, or scenelet; show game design language without literal UI frames.',
    'Stage the image as a polished HUD-free gameplay or asset-in-world moment with clear loop identity, strong silhouette, and no presentation-board layout.',
    'Build the composition around one game-useful focal idea with environment or material context, avoiding concept-sheet grids, icon clusters, readable UI, and marketing layout.',
  ],
  pack_10__pattern_and_texture: [
    'Use a cropped material/pattern field with one dominant repeat scale, tactile edge, fold, grain, or surface rhythm; no focal silhouette, room, prop setup, or lifestyle scene.',
    'Build the card as a clean texture specimen: one readable surface crop, broad material planes, controlled negative space, and no product still-life or character staging.',
    'Let the named pattern fill the card through scale, surface relief, color separation, and material behavior; avoid room depth, furniture, mannequins, props, or mascot objects.',
  ],
  pack_12__neon_urban_and_night_ops: [
    'Use third-person stealth gameplay in a rain-slick district, transit deck, or rooftop lane with objective contrast and readable patrol/sightline logic.',
    'Use a playable night-op route with wet pavement, hard neon color separation, layered infrastructure, and a clear chase, stealth, or breach state.',
    'Build the frame as a gameplay choke point with cables, reflections, route depth, and one hero-versus-system objective, not promo framing.',
  ],
  pack_12__arcane_temples_and_mythic_realms: [
    'Use playable exploration in a shrine court, ritual hall, bridge, or palace space with route depth, readable relic interaction, and mythic threat state.',
    'Stage an in-game ceremonial encounter with carved stone, ritual light, a clear dodge/traversal/puzzle lane, and no static concept-art altar.',
    'Build the frame around a playable discovery, duel, or traversal decision rooted in old-world myth, with camera distance matching gameplay.',
  ],
  pack_12__sci_fi_frontiers_and_mech_zones: [
    'Use a playable orbital platform, mech convoy lane, research habitat, or breach route with machine scale, warning light, and a central systems event.',
    'Stage a frontier-tech gameplay beat with armored surfaces, exposed conduits, cover/traversal logic, and one interactable hardware objective.',
    'Build future industry or colony infrastructure as a playable route with readable function, not a clean hard-surface asset render.',
  ],
  pack_12__sieges_warfronts_and_last_stands: [
    'Use gameplay camera on a fortress edge, bridge hold, defense rail, or bastion breach with clear frontlines and one defend/breakthrough objective.',
    'Stage a playable pressure moment where a wall, bridge, or convoy line is about to break, with readable opposing-force geometry.',
    'Build a fortified battlefield as an active game state where cover, attrition, and last-stand pressure are visible at a glance.',
  ],
  pack_12__speed_sport_and_competitive_arenas: [
    'Use gameplay camera on a racetrack, duel hall, rhythm stage, or arena lane with obvious rule-space, velocity paths, and timing feedback.',
    'Stage an active match state with lane markers, spacing, rivalry pressure, and camera motion that reads like play, not sports key art.',
    'Build high-spectacle competition as a playable moment with momentum arcs, turn/rhythm/finish timing, and no promotional lineup.',
  ],
  pack_12__wilderness_hunts_and_harsh_frontiers: [
    'Use gameplay camera in a hostile biome, mine route, frozen outpost, or thunder plain with route readability and one hunt/survival objective.',
    'Stage frontier terrain where weather, beasts, or unstable geography create a playable threat state, not a creature showcase.',
    'Build a rugged traversal or hunting beat with layered landscape scale, weak-point/resource read, and one immediate danger cue.',
  ],
  pack_12__heists_horror_and_underworld_runs: [
    'Use gameplay camera on a cursed transit line, black-market route, shadow court, or criminal path with hiding places and one panic objective.',
    'Stage a low-trust playable environment where stealth, dread, violence, or escape pressure dominates before open combat.',
    'Build an underworld operation or horror breach with exits, patrol/threat silhouettes, interactable objective, and sharp danger gradient.',
  ],
  pack_12__puzzle_chambers_and_adventure_setpieces: [
    'Use gameplay camera in a puzzle chamber, quest hub, finale room, or landmark with one central progression mechanic made spatially clear.',
    'Stage a handcrafted adventure gameplay state with navigable props, layered clue logic, and a strong next-action focal beat.',
    'Build the frame around a game-world landmark designed for puzzle solving, traversal, narrative payoff, or chapter-ending play state.',
  ],
  pack_15__classic_industrial_punks: [
    'Use a compact illustrated civic machine commons, rail platform, print district, radio street, or airship dock with one character shaped by the industrial world and broad brass/steel silhouettes behind them.',
    'Stage the card around industrial atmosphere and social role: arriving, waiting, crossing, bargaining, performing, surveying, resting, or holding posture under machine scale.',
    'Build industrial identity through chunky machine masses, smokestack shapes, signal lights, wardrobe silhouette, and warm metal color planes rather than object operation, gear/valve handling, tiny rivets, photoreal soot, or realistic station drama.',
  ],
  pack_15__neon_net_and_signal_punks: [
    'Use a network street corner, relay rooftop, pirate radio district, mesh kiosk, wet transit deck, or data-commons fragment with one clear protagonist in the scene.',
    'Stage neon identity through cable arcs, glowing node clusters, rain-color planes, reflective signage shapes without readable text, and one original protagonist silhouette affected by the signal weather.',
    'Build the frame as a graphic painted signal system under pressure, not a realistic cyberpunk alley, camera rig, UI screenshot, or market/library corridor.',
  ],
  pack_15__eco_repair_and_climate_punks: [
    'Use a greenhouse, wind-rig village, floodwall, algae deck, solar canopy, seed archive, or climate station with one human-scale presence that proves how people live there.',
    'Stage eco-punk as practical care through posture, clothing, shelter, public infrastructure, seed containers, water filters, solar cloth, and plant-machine joints without making the pose a repair demo.',
    'Build the image from green-tech silhouettes, climate infrastructure, and stylized color blocks; avoid glass-utopia sameness, generic garden postcard, or all-solarpunk flattening.',
  ],
  pack_15__bio_myco_and_body_punks: [
    'Use a mycelium workshop, prosthetic bench, bio-reactor shrine, spore suit bay, clinic alley, or organism-machine interface with one readable subject.',
    'Stage biotech as designed craft: fungal cables, translucent tanks, handmade implants, soft armor plates, grafted tools, or symbiotic creature silhouettes.',
    'Build biological tension with stylized organic masses, simplified drawn anatomy, and safe controlled detail; avoid explicit gore, photoreal anatomy, and noisy membrane microtexture.',
  ],
  pack_15__ocean_ice_and_terrain_punks: [
    'Use a sea rig, ice caravan, desert engine, cliff outpost, storm buoy, cave pump, or mountain cable station with one strong terrain silhouette.',
    'Stage terrain punk through weather clothing, patched vessels, survival machines, rope systems, ice/rock/water shapes, and a visible lived-world posture.',
    'Build the card from bold environmental planes and engineered survival craft, not realistic survival-game key art, fantasy hallway depth, landscape postcard beauty, or empty texture.',
  ],
  pack_15__street_riot_and_diy_punks: [
    'Use a zine wall, barricade street, patched jacket figure, sound-system cart, basement show, skatepark edge, or handmade protest environment with graphic poster force.',
    'Stage DIY identity through attitude, clothing, tape, paint, patches, cables, flyers as unreadable shapes, handbuilt machines, and one expressive figure, not a task demo.',
    'Build rebellion through silhouette, material reuse, and color rhythm; avoid realistic alley portrait, studio wall, chair, lamp, curtain, or repeated room setup.',
  ],
  pack_15__media_vapor_and_glitch_punks: [
    'Use a CRT-lit corner, tape observatory, vapor arcade, broadcast ruin, corrupted mascot-machine zone, or hologram-paper environment around one readable protagonist.',
    'Stage media punk through scanline color, analog artifacts, cassette geometry, glass glow, folded paper screens, and non-readable signal marks.',
    'Build glitch/vapor identity as clean stylized graphic effects around one figure in their environment, not UI, logos, readable text, camera equipment, foreground communication device, or abstract noise only.',
  ],
  pack_15__occult_myth_and_gothic_punks: [
    'Use a ritual street, masked figure, storm chapel exterior, black-lace salon, shrine relay district, or mythic relic environment with one readable symbolic presence.',
    'Stage occult punk through candles only when useful, iron halos, sigil-like non-readable geometry, velvet darks, bone/metal contrast, and controlled gothic silhouette.',
    'Build mystery through graphic darkness, open midtones, and stylized symbols; avoid fantasy corridor, overpacked ornament, literal horror-room setup, or empty black abstraction.',
  ],
  pack_15__space_atomic_and_ray_punks: [
    'Use a rocket garage, moon station, atomic plaza, ray vehicle stop, orbital diner, reactor promenade, or retro space creature scene with one bold sci-fi silhouette.',
    'Stage space-age punk through fins, helmets, chrome arcs, colored radiation shapes, lunar dust, repair rigs, and clean retro-future color blocking.',
    'Build raypunk identity as illustration-first graphic futurism, not photoreal hard-surface render, spaceship corridor, or generic high-detail concept-art poster.',
  ],
  pack_15__primitive_stone_and_salvage_punks: [
    'Use a cave settlement, stone engine court, bone-and-copper district, kiln yard, salvage shore, or handmade machine camp with one designed focal figure in the world, not a heroic adventurer pinup.',
    'Stage low-tech punk through character silhouette, carved stone, rope, hide, copper scraps, ceramic engines, ember glow, and broad handbuilt environment shapes with poster-like negative space.',
    'Build primitive salvage as designed invention, symbolic material culture, and community craft; avoid American fantasy RPG posing, generic fantasy cave, prehistoric documentary realism, noisy fur detail, or empty rock texture.',
  ],
  pack_17__dark_fantasy_realms: [
    'Use a ruined bastion, chapel threshold, ash field, broken bridge, or throne-stone fragment with one burdened medieval focal shape and deep negative space.',
    'Stage the card around weathered armor, sacred stone, funeral ash, tarnished metal, and a single oppressive vertical silhouette.',
    'Build the frame from decayed medieval architecture, low firelight, cold sky, and one readable curse-bearing subject or relic.',
  ],
  pack_17__hunter_gothic_and_plague_courts: [
    'Use a foggy cathedral lane, plague court antechamber, candlelit reliquary, moonlit roofline, or wrought-iron gate with one clear hunter-gothic focal anchor.',
    'Stage the card with baroque fabric, leather, wax, mask forms, surgical-metal trim, and one restrained crimson or moonlit accent.',
    'Build dread through ornate silhouettes, misty negative space, and old-city gothic detail rather than shock imagery or copied costume design.',
  ],
  pack_17__acid_dungeon_zine: [
    'Use a flat poster-card monster or cult figure on neon paper, with heavy clean black ink, thick border logic, controlled stipple, and one acid accent field.',
    'Stage the image like an underground bestiary card: front-facing creature, skull armor, occult emblem shapes, or tiny castle fragment with no readable text.',
    'Build the composition from cleaned xerox texture, misregistered color fills, punk dungeon icons, boxed-panel pressure, and a single thumbnail-readable silhouette.',
  ],
  pack_17__futuristic_medieval_and_rune_tech: [
    'Use a cyber-citadel gate, starforged chapel relic, rune-lit armor bust, mech reliquary, or cathedral machine fragment with medieval geometry and luminous tech.',
    'Stage the card around plate armor, stained glass color, circuit filigree, ancient stone, chrome seams, and one clear future-knight focal subject.',
    'Build ancient-future contrast through hard armor silhouettes, glowing non-readable glyph planes, cathedral depth, and restrained sci-fantasy light.',
  ],
  pack_17__apocalyptic_wargame_and_inked_dungeon: [
    'Use a mud-choked battlefield chapel, miniature-warfront plinth, torchlit dungeon doorway, trench reliquary, or black-powder monastery wall with one readable medieval-apocalypse focal silhouette.',
    'Stage the card with etched black linework, candle-cut shadows, tactical armor shapes, stained cloth, mud, bone, brass, and one strong accent color kept clean by denoise.',
    'Build the frame around one original warband, relic, banner, torch-bearing dungeon figure, or siege icon; avoid copied franchise armor, unreadable grime, and noisy dark artifacts.',
  ],
  pack_17__monochrome_tarot_and_bestiary_plates: [
    'Use a clean tarot-like icon, medieval bestiary plate, illuminated manuscript creature, penitent shrine, or survival-dungeon relic on warm paper with broad white space.',
    'Stage the card as a readable black-ink illustration: one large omen figure or beast, 2-3 simple support symbols, smooth wash, and no readable labels, numerals, runes, or captions.',
    'Build the frame from crisp contours, open ivory paper, broad black shapes, sparse accent color, and controlled plate margins rather than dark realism, noisy hatch carpets, or texture-heavy horror.',
  ],
  pack_05__modern_shonen_and_action: [
    'Use one original anime-style character or costume fragment with clean motion arcs, bold cel shading, and readable shonen momentum; avoid franchise likeness, headband-copy design, named-series cues, dominant weapons, or combat injury.',
    'Stage one original action-study pose on a simplified graphic backdrop with speed lines, cloth motion, and expressive silhouette; no schoolyard/street/stair lock, no recognizable hero design, no sword-first composition.',
    'Build the frame around optimistic movement energy, color accents, and exaggerated expression physics while keeping props secondary and non-iconic; no gang fight, battle aftermath, arena duel, or IP-like emblem.',
  ],
  pack_05__action: [
    'Use one original anime protagonist in a clean action beat, with broad cel shapes, readable motion arcs, and no weapon-first framing.',
    'Stage a character-led impact moment on a simplified support backdrop; avoid corridor, market, library, camera, and noisy rubble formulas.',
    'Build the frame around pose, speed field, expression, and color identity so the style reads as action without becoming abstract-only.',
  ],
  pack_05__2000s_classics: [
    'Use a late-night platform, apartment corridor, or city overpass with reflective surfaces, practical lights, and a quiet narrative beat.',
    'Stage the image in a familiar urban setting with a grounded protagonist, modest props, and slightly heightened anime drama.',
    'Build the composition around transitional spaces like bus stops, balconies, or school gates with strong emotional timing.',
  ],
  pack_05__90s_golden_era: [
    'Use a VHS-era city block, desert road, or neon lounge with analog atmosphere and a distinctly 90s anime silhouette.',
    'Stage the subject in a cinematic urban-fantasy edge with old-school cel drama, layered shadows, and a bold central figure.',
    'Build the frame around late-20th-century anime energy: analog texture, dramatic framing, and a strong heroic posture.',
  ],
  pack_05__shojo_magical_girl_and_visionary_classics: [
    'Use a rose-lined hallway, classroom window, or fashion-forward interior with soft props and elegant negative space.',
    'Stage the subject in a romantic or introspective setting with hair flow, costume detail, and a gentle emotional cue.',
    'Build the scene around delicate interiors, flowers, mirrors, celestial props, ribbons, or stage lights with a clean emotional-classics read.',
  ],
  pack_05__slice_of_life_and_moe: [
    'Use a club room, shared apartment, cafe booth, campsite, or street corner with small props and warm breathing room.',
    'Stage the scene in a quiet everyday interior with one open window, a small desk, warm fabric, and gently layered background life.',
    'Build the composition around a calm domestic or campus corner with mugs, notebooks, cushions, and a friendly afternoon read.',
  ],
  pack_05__sports_competition_and_performance: [
    'Use a stadium lane, gym court, rehearsal stage, rink, pool, or concert space with a clear competition line or performance axis.',
    'Stage the subject at the exact moment before a decisive move, note, jump, or final beat.',
    'Anchor the scene with sport-specific or stage-specific equipment, audience depth, and unmistakable motion intent.',
  ],
  pack_05__mecha_and_cyberpunk: [
    'Use a neon hangar, rain-dark alley, cockpit bay, or industrial catwalk with hard machine geometry and reflective armor.',
    'Stage the subject beside a mech silhouette, glowing console, or city grid with aggressive sci-fi scale and sharp metal contrast.',
    'Build the frame around cables, vents, panels, and a single luminous tech axis that reads instantly as mecha/cyberpunk.',
  ],
  pack_05__isekai_and_high_fantasy: [
    'Use a fantasy roadside inn, magical town gate, dungeon threshold, or floating ruin with one clear quest lane and readable magical depth.',
    'Stage the subject in a caravan stop, castle approach, or enchanted market where the world itself feels exploratory.',
    'Build the scene around portals, spell-light, travel gear, and adventure road energy rather than generic medieval clutter.',
  ],
  pack_05__dark_fantasy_and_seinen: [
    'Use a ruined courtyard, grim alley, or shadowed church-like interior with ominous stillness and grounded menace.',
    'Stage the subject in a brutal but readable landscape with worn armor, cracked masonry, and an adult dramatic tone.',
    'Build the frame around despair, moral weight, and textured darkness without collapsing into generic horror props.',
  ],
  pack_05__studio_masterpieces: [
    'Use a richly painted coastline, hillside, or city edge with wind, sky, and quiet cinematic emotion.',
    'Stage the subject in a lyrical travel scene with hand-painted depth, atmospheric distance, and a contemplative human presence.',
    'Build the image around a beautiful environment first, then a small but emotionally clear protagonist read.',
  ],
  pack_05__70s_and_80s_retro_anime: [
    'Use a vintage starship bridge, desert highway, or retro robot hangar with older cel-era design cues and warm analogue texture.',
    'Stage the subject with classic broadcast-era proportions, painted background charm, and a strong heroic stance.',
    'Build the frame around 70s/80s anime iconography: bold silhouettes, mechanical drama, and nostalgic broadcast lighting.',
  ],
  pack_05__anime_style_spectrum: [
    'Use a stripped artist studio with pinned references, sketch sheets, and a single bold compositional tool or prop.',
    'Stage the scene around an original-design lab corner with marked silhouettes, swatches, and a strong line-first visual read.',
    'Build the composition around white paper, charcoal dust, film grain, or print texture cues that make the style identity feel authored.',
  ],
  pack_13__anime: [
    'Use a rooftop at blue hour with wind, power lines, a distant city edge, and one original character silhouette on a clean ledge.',
    'Stage the subject on a train platform or station walkway with hard perspective lines, signage-free depth, and a strong late-night travel mood.',
    'Set the scene in a shrine path, alley, or hillside overlook with lantern glow, layered distance, and a clean hero lane through the frame.',
  ],
  pack_13__action: [
    'Use a battle-stopped moment in a stairwell, bridge span, or broken street with flying debris, sharp perspective, and a decisive motion cue.',
    'Stage the subject against a cracked arena edge, industrial catwalk, or rooftop fight space with a single hard impact read and no clutter.',
    'Build the frame around a chase or clash beat with directional motion, visible tension lines, and one unmistakable focal strike point.',
  ],
  pack_13__samurai_medieval: [
    'Use a moonlit gate, dojo threshold, or castle corridor with wood grain, armor silhouettes, and a single ceremonial or combat-ready focal lane.',
    'Stage the subject in a wind-cut courtyard with banner cloth, stone steps, and a strong sword-line or spear-line composition.',
    'Set the scene on a temple approach or battlefield edge with mist, lantern glow, and a disciplined vertical read.',
  ],
  pack_13__horror: [
    'Use a narrow corridor, abandoned room, or shrine ruin with crawling shadow, fractured wallpaper, and one unsettling negative-space opening.',
    'Stage the subject in a rain-dark alley or hospital-like passage with flicker light, damp surfaces, and a single eerie focal spill.',
    'Build the frame around a sealed doorway, torn curtain, or broken threshold with oppressive depth and a clear dread cue.',
  ],
  pack_13__core_anime: [
    'Stage one original anime character in a compact, readable environment chosen for the preset; keep the face, pose, costume silhouette, and emotion as the first read.',
    'Use a character-led vertical keyframe with clean cel shapes, one preset-specific support detail, and enough background to clarify mood without corridor or room formula.',
    'Build the card around one original protagonist plus a single readable world cue: arena light, shrine glow, machine scale, gothic trim, travel gear, or magical motif.',
  ],
  pack_13__slice_of_life_school_music: [
    'Use one original everyday anime protagonist in a quiet lifestyle beat with soft light, simple props, and character acting as the first read.',
    'Stage a warm slice-of-life keyframe with restrained school, music, street, or home cues only when they clarify the preset, not as repeated hallway or room filler.',
    'Build the image around a small emotional gesture, outfit read, and color mood; keep instruments, chairs, desks, posters, or windows secondary.',
  ],
  pack_13__shojo_magical_girl_and_visionary_classics: [
    'Use one original expressive character with elegant pose language, symbolic light, flowing costume shape, and no copied magical-girl franchise silhouette.',
    'Stage a romantic or visionary anime card around face/gesture/emblem hierarchy, with background glow supporting the character rather than replacing them.',
    'Build the frame around soft costume motion, luminous motif, and emotional close-to-mid shot clarity.',
  ],
  pack_13__slice_of_life_and_moe: [
    'Use one cozy original character with warm expression, soft outfit silhouette, and one small everyday support detail that feels preset-specific.',
    'Stage a gentle character moment in a simple lived-in context without repeating bedroom, cafe, classroom, lamp, curtain, or window formula.',
    'Build the card around gesture, mood, and color warmth first; props stay small and useful.',
  ],
  pack_13__anime_style_spectrum: [
    'Use a character-led anime style study where line discipline, pose shape, color design, and rendering texture show the preset identity.',
    'Stage one original subject against a minimal authored backdrop; avoid generic anime portrait sameness and avoid empty abstract-only texture fields.',
    'Build the card around a distinctive silhouette and one era/auteur rendering cue, with no franchise likeness.',
  ],
};

const PRESET_MOTIFS = [
  'Include one original visual token tied to the preset name, never a compass, map symbol, notebook, generic plant, or other stock prop.',
  'Include a distinct costume trim, mask mark, crest fragment, or tech detail that only fits this preset.',
  'Include one sharp prop silhouette that is specific to this preset and not a generic desk object.',
  'Include a preset-specific accent element with a non-repeating shape language.',
  'Include one custom motif shape, charm, patch, shard, or accessory that reinforces the preset identity without becoming a logo.',
  'Include one memorable object with a clear material story and no generic compass-like read.',
  'Include a single focal detail that would survive thumbnail reduction and still feel preset-specific.',
  'Include one unusual shape cue from the preset DNA instead of a stock decorative object.',
];

const PACK_01_TRANSFERABLE_PRESET_IDS = new Set([
  'SP01-044',
  'SP01-050',
  'SP01-061',
  'SP01-063',
  'SP01-066',
  'SP01-067',
  'SP01-068',
  'SP01-079',
]);

const PACK_01_TRANSFERABLE_SCENE_ANCHORS = [
  'Use neutral material planes with matte blocks, glass, fabric, and one clean background surface.',
  'Use plain wall geometry with a sculptural object or material arrangement, restrained texture, and controlled light.',
  'Use broad negative space around one simple object or material arrangement, with no portrait-session furniture or staged studio setup.',
];

const COMPOSITION_VARIANTS = [
  'Compose the subject slightly off-center with clear negative space.',
  'Use a diagonal composition with the subject layered across foreground and middle-ground.',
  'Set the subject in a deep foreground-to-background setup with one clear depth lane.',
  'Anchor the composition on a central subject with offset secondary elements.',
  'Use a clean three-plane composition to preserve vertical card readability.',
];

const LIGHT_VARIANTS = [
  'Keep lighting directional with a dramatic edge and controlled ambient fill.',
  'Use cinematic side light with soft practical spill and subtle contrast.',
  'Use cool rim light and warm bounce fill for a more dynamic tone.',
  'Use soft frontal fill with one pronounced practical back light source.',
  'Use high-contrast lighting to increase material legibility while preserving mood.',
];

const MATERIAL_VARIANTS = [
  'Prioritize readable skin, fabric, and structure texture differences.',
  'Include contrasting surface materials across subject, props, and background.',
  'Use clear edge and surface definition between object planes.',
  'Let material finish (metal/cloth/stone/paint) carry part of the style signal.',
  'Add a tactile foreground detail that reinforces the style treatment.',
];

const DETAIL_VARIANTS = [
  'Include one broad, thumbnail-readable detail linked to the preset tone.',
  'Keep one small secondary prop that supports the main story element.',
  'Use one distinct pose nuance that is not repeated in the base scene.',
  'Add a subtle asymmetry in object placement to avoid template repetition.',
  'Shift one secondary action detail (tilt, fold, ripple, or movement edge).',
];

const FEELING_VARIANTS = [
  'Keep the emotion anchored by the style’s strongest expression cue.',
  'Add a specific mood beat that changes the character dynamics.',
  'Let one facial or posture detail carry the scene’s emotional weight.',
  'Use subtle movement to suggest the scene’s implied beat.',
  'Keep the composition clean and readable from a quick card glance.',
];

const HERO_VARIANTS: Record<string, string[]> = {
  anime_dark_fantasy: [
    'An original lone fighter with weathered gear, sharp silhouette, and visible emotional strain.',
    'An original antihero framed as a survivor, with tense posture and one striking costume detail.',
    'An original hunter or wanderer with scarred equipment, grounded anatomy, and controlled menace.',
  ],
  anime_masterpieces: [
    'An original traveler or dreamer with an expressive silhouette and quiet human presence.',
    'An original figure caught between wonder and melancholy, with subtle costume storytelling.',
    'An original young adult protagonist whose posture carries most of the scene’s emotion.',
  ],
  anime_slice: [
    'An original everyday character with a warm, readable silhouette and soft comedic charm.',
    'An original school-age or young-adult figure with expressive posture and cozy visual rhythm.',
    'An original slice-of-life lead whose face, clothing, and gesture feel instantly personable.',
  ],
  anime_sports: [
    'An original competitor or performer caught in a readable peak moment, with strong anatomy, clear discipline-specific gear, and decisive body language.',
    'An original sports or stage lead whose silhouette instantly communicates motion, confidence, and event type at card size.',
    'An original athlete, musician, or performer with venue-aware costume logic, expressive posture, and a strong hero read.',
  ],
  gameplay_competition: [
    'One playable vehicle, avatar, creature, team marker, or match-state focal subject caught inside a readable game rule-space, not a character poster.',
    'One in-engine competition moment where lane, track, timing window, rival spacing, or rhythm hazard is the first read.',
    'One gameplay-scale subject with clear control feedback, navigable geometry, and active contest pressure instead of anime athlete glamour.',
  ],
  anime_action: [
    'An original anime protagonist caught mid-action with clear acting, strong silhouette, and preset-specific costume logic.',
    'An original action lead whose pose and motion arcs explain the style without relying on weapons or franchise cues.',
    'An original character or creature in a readable kinetic beat, with broad cel shapes and controlled impact detail.',
  ],
  anime_fantasy: [
    'An original fantasy adventurer with layered costume logic, one magical prop, and a clear quest vibe.',
    'An original mage or traveler with readable gear, elegant silhouette, and story-driven pose.',
    'An original high-fantasy lead with cloak, artifact, and a clean heroic read from card distance.',
  ],
  anime_style_spectrum: [
    'An original anime figure whose silhouette, line discipline, and pose logic make this preset feel authored, not generic.',
    'An original character or creature-study subject with a distinctive face, gesture, and costume rhythm tied to the preset name.',
    'An original protagonist framed as a style specimen: clear acting, unique contour language, and one preset-specific visual token.',
  ],
  illustration_print: [
    'One strong symbolic subject with a silhouette that survives heavy reduction and bold shape simplification.',
    'One iconic print-friendly subject with immediate contrast, readable edges, and poster-like economy.',
    'One original emblematic figure or object designed to carry the whole composition at a glance.',
  ],
  fashion_texture: [
    'One adult model or mannequin where the garment behavior is the real protagonist.',
    'One fashion subject posed to reveal seam logic, drape, weight, and trim detail.',
    'One wardrobe-focused figure with strong silhouette and textile-first visual emphasis.',
  ],
  punk_illustration: [
    'One original visible x-punk protagonist paired with a vehicle, creature, device, relic, or machine-settlement background, designed as stylized 2D illustration, not a photo model or realistic game render.',
    'One readable punk subtype subject with strong silhouette, practical craft logic, clean drawn edges, and a clear role in the scene.',
    'One compact representative illustrated scene where a protagonist plus supporting machine, vehicle, relic, or creature sells the preset identity at thumbnail size.',
  ],
  default: [
    'One original focal subject with a strong silhouette and clear role in the frame.',
    'One original protagonist or hero object with readable shape hierarchy and visual priority.',
    'One original main figure or centerpiece designed to read instantly in a portrait card.',
  ],
};

const ENVIRONMENT_VARIANTS: Record<string, string[]> = {
  anime_dark_fantasy: [
    'Surround the subject with ruined structure, damp surfaces, and oppressive depth layers.',
    'Use an environment with decayed architecture, sharp occlusion, and uneasy negative space.',
    'Build the setting around hostile texture: stone, metal, haze, and fractured background rhythm.',
  ],
  anime_masterpieces: [
    'Give the environment lyrical depth, wind movement, and painterly background transitions.',
    'Use a setting with emotionally charged atmosphere, layered sky or architecture, and soft distance.',
    'Build a space where environment and character feel inseparable, with quiet cinematic depth.',
  ],
  anime_slice: [
    'Make the setting intimate and lived-in, with small everyday props and gentle light falloff.',
    'Use a cozy room, cafe, street corner, or courtyard that feels specific without clutter.',
    'Build a warm daily-life environment with small asymmetries and friendly material cues.',
  ],
  anime_sports: [
    'Use a venue with immediate competitive or performance read: court, field, pool, track, rink, stage, gym, rehearsal hall, or arena depth.',
    'Build the environment around motion lanes, audience or teammate cues, and a clear support structure that reinforces the discipline.',
    'Give the scene enough event context to feel live and kinetic, while keeping the focal hierarchy clean and card-readable.',
  ],
  gameplay_competition: [
    'Use playable arena geometry: track edge, lane markers, hazard spacing, timing gates, rival positions, and camera feedback with no HUD.',
    'Build the scene as a screencap-like match state with route readability, control affordances, and rule-space depth.',
    'Keep the environment functional and game-readable: apex line, checkpoint rhythm, arena boundary, or stage lane instead of sports poster staging.',
  ],
  anime_action: [
    'Use a compact action space with one clear depth lane, not a corridor, market aisle, library aisle, or generic rubble field.',
    'Keep the support environment simple and preset-specific so the character pose remains readable.',
    'Use background motion planes, impact haze, or graphic speed fields as support, not as the whole card.',
  ],
  anime_fantasy: [
    'Place the subject in a magical environment with clear worldbuilding layers and one glowing focal cue.',
    'Use a fantasy setting with path, ruins, city edge, or forest depth that suggests a larger world.',
    'Build an adventure-ready backdrop with scale cues, atmosphere, and one memorable landmark element.',
  ],
  anime_style_spectrum: [
    'Use a compact backdrop that exposes linework, color system, and composition logic without turning into an artist studio.',
    'Keep environment cues minimal but specific: one graphic plane, prop, texture field, or scene fragment that clarifies the style.',
    'Avoid shared anime-stage formulas; make the background rhythm, palette, and spatial logic unique to this preset.',
  ],
  illustration_print: [
    'Reduce the environment to bold supporting shapes, negative space, and print-friendly texture masses.',
    'Keep the background graphic and intentional, with only the minimum shapes needed to reinforce the subject.',
    'Use a simplified support environment that strengthens rhythm, contrast, and silhouette rather than realism.',
  ],
  fashion_texture: [
    'Keep the environment secondary and tactile, designed to support fabric readability rather than story clutter.',
    'Use a restrained fashion set with enough props to contrast textile finish, weight, and sheen.',
    'Build a quiet editorial environment where backdrop surfaces help the garment stand out cleanly.',
  ],
  punk_illustration: [
    'Use a compact invented illustrated world fragment with practical materials, visible craft, and one preset-specific activity instead of generic studio staging.',
    'Build a readable scene around one protagonist interacting with improvised technology, weather, signal, ritual, repair, or salvage logic tied to the category.',
    'Keep setting cues broad and graphic: strong planes, designed silhouettes, controlled color fields, and one useful object cluster rather than clutter or micro-detail.',
  ],
  default: [
    'Use an environment with layered depth, controlled clutter, and strong foreground/background separation.',
    'Give the scene enough spatial context to feel specific, but keep the focal hierarchy clean.',
    'Build a setting with clear planes, visible materials, and one memorable support detail.',
  ],
};

const CAMERA_FOCUS_VARIANTS = [
  'Prioritize a clean read of the subject’s silhouette before secondary details.',
  'Let the camera emphasize one hero material transition near the focal area.',
  'Use framing that makes one strong foreground-to-midground relationship memorable.',
  'Make the image read first through pose and shape, then through surface detail.',
  'Bias the framing toward one striking gesture, prop, or facial angle.',
];

const ACTION_VARIANTS = [
  'Imply a paused action rather than a static pose.',
  'Use a subtle in-between gesture that suggests the moment just before movement.',
  'Let a small physical action give the frame its narrative beat.',
  'Build the pose around one restrained but specific directional motion.',
  'Keep the subject grounded, but make one edge of the scene feel alive.',
];

const PACK15_SUBJECT_VARIANTS = [
  'an older municipal route keeper with a broad square stance and calm authority',
  'a middle-aged organizer or traveler with weather-shaped clothing and grounded posture',
  'a short stocky resident whose compact body shape changes the whole card silhouette',
  'a tall narrow witness partly obscured by architecture, hanging cloth, weather, or shadow',
  'a masked or helmeted resident whose face is secondary to silhouette and world role',
  'a seated or leaning caretaker integrated into public infrastructure',
  'a small full-body passerby seen inside a large environment, not a portrait hero',
  'a musician, rider, courier, pilgrim, cook, repair elder, or vendor chosen as a social type for this preset',
  'an elder or heavy-set artisan with blocky handmade clothing and no heroic stance',
  'a side-view or three-quarter turned resident whose identity comes from posture, clothing block, and setting',
];

const PACK15_CROP_VARIANTS = [
  'wide environmental card: character occupies about one third of the height and the world dominates',
  'medium-long walking or waiting crop with full body readable and no close fashion portrait',
  'seated or leaning three-quarter crop with environment wrapping around the figure',
  'looking-back or side-view crop where silhouette and setting carry the identity without becoming another full back-view traveler',
  'low or high poster angle with the protagonist off-center and architectural planes doing the work',
  'close crop only if face is partly obscured and the costume silhouette is not a stylish jacket bust',
  'side-view threshold crop with empty hands and a clear world fragment behind the shoulder',
  'public-life vignette: protagonist embedded among small background silhouettes, signage shapes, or transit/ritual space',
];

const PACK15_RENDER_VARIANTS = [
  'European editorial poster painting with broad gouache planes, restrained contour, and muted graphic economy',
  'Latin American mural/poster digital painting with earthy value blocks, bold social silhouette, and handmade color rhythm',
  'Eastern European animation-background restraint with odd proportions, dry texture, and asymmetric negative space',
  'Japanese environment-art color discipline with simplified character acting, but not glossy anime character-card rendering',
  'ligne-claire graphic-novel clarity with flat shapes, readable ink edges, and low micro-detail',
  'folk-modernist printmaking logic with simplified faces, blocky garments, and symbolic material pattern',
  'risograph/zine poster structure with limited spot colors, controlled grain, and rough human presence',
  'painterly artbook plate with large matte brush planes and environment-first composition',
];

const PACK15_ATTIRE_VARIANTS = [
  'square apron, utility skirt, broad overshirt, or layered work cloth that avoids the sleek jacket silhouette',
  'rounded padded work coat, thick gloves, short apron, or quilted garment mass with no cape, poncho, or high collar fashion read',
  'plain tunic blocks, patched textile panels, handmade shoes, and one unusual trim shape',
  'helmet, head wrap, visor, or face covering treated as practical worldwear, not a hooded cloak or mysterious coolness',
  'wide beltless garment shapes, sleeve volume, or protective over-layer instead of leather pouches, boots, travel cloak, or blanket cape',
  'asymmetric shoulder cloth, fabric sash, rope trim, or layered civilian textile detail, not body harness or tactical gear',
  'bright or pale local garment block that breaks the dark coat default',
  'worker-adjacent clothing only when quiet and civilian: no uniform poster, no officer, no crew lineup',
];

const PACK15_POSE_VARIANTS = [
  'standing side-on at a threshold with empty relaxed hands',
  'walking across the frame or looking back with side profile readable while the environment carries the drama',
  'sitting low on a platform, step, curb, pier, bench, or stone edge with no held object',
  'leaning under weather or shelter, hands folded, hidden, or bracing against cloth',
  'crossing a public space as a small figure, surrounded by larger world shapes',
  'resting, listening, waiting, performing, riding, or guarding a threshold without touching equipment',
  'seen from side view or three-quarter rear so the silhouette and setting replace the fashion portrait without repeating a full back-view traveler',
  'partially hidden by foreground architecture, hanging cloth, steam, plants, rock, or signage shape',
];

const PACK15_PALETTE_VARIANTS = [
  'dusty ochre, oxidized green, slate blue, and one muted red accent',
  'pale mint, smoked lavender, charcoal gray, and warm cream light',
  'muted teal, rust, bone white, and desaturated coral',
  'weathered yellow, bottle green, blue-black shadow, and clay pink',
  'cold gray, copper orange, algae green, and soft off-white',
  'dried violet, dark olive, tarnished brass, and fog blue',
  'ashen rose, ink-wash gray, dull cyan, and handmade paper tan',
  'deep graphite, faded turquoise, ember orange, and dusty mauve',
];

const PACK15_ENVIRONMENT_SCALE_VARIANTS = [
  'environment-first composition: public architecture and weather occupy most of the card',
  'human-scale vignette: the protagonist is clear, but background culture wraps closely around them',
  'threshold scene: doorway, platform edge, floodwall, transit stop, shrine lip, bay mouth, or cave entrance frames the figure',
  'large negative-space poster: one bold world plane behind the character, not dense machinery wallpaper',
  'street/public-life slice: distant silhouettes or marks can appear, but one protagonist remains primary',
  'low-angle or high-angle graphic scene where planes and silhouette matter more than face detail',
  'quiet environmental tableau with one character dwarfed by infrastructure, terrain, or ritual space',
  'compressed shallow scene with foreground occlusion and simplified depth, not cinematic perspective',
];

const PACK15_CATEGORY_INDEX: Record<string, number> = {
  pack_15__classic_industrial_punks: 0,
  pack_15__neon_net_and_signal_punks: 1,
  pack_15__eco_repair_and_climate_punks: 2,
  pack_15__bio_myco_and_body_punks: 3,
  pack_15__ocean_ice_and_terrain_punks: 4,
  pack_15__street_riot_and_diy_punks: 5,
  pack_15__media_vapor_and_glitch_punks: 6,
  pack_15__occult_myth_and_gothic_punks: 7,
  pack_15__space_atomic_and_ray_punks: 8,
  pack_15__primitive_stone_and_salvage_punks: 9,
};

function pack15DiversityGuide(category: string, preset: StyleRuntimePreset, seed: string) {
  const numericId = Number(preset.id.match(/^SP15-(\d+)$/)?.[1] || 1) - 1;
  const categoryKey = styleCategoryImageKey('pack_15', category);
  const categoryIndex = PACK15_CATEGORY_INDEX[categoryKey] ?? hashString(categoryKey) % 10;
  const seedHash = hashString(`${seed}:${categoryKey}:${preset.id}:${preset.name}`);
  const seedOffset = seedHash % 3;
  const subject =
    PACK15_SUBJECT_VARIANTS[
      (numericId + categoryIndex * 2 + seedOffset) % PACK15_SUBJECT_VARIANTS.length
    ];
  const crop =
    PACK15_CROP_VARIANTS[
      (numericId * 2 + categoryIndex * 3 + seedOffset) % PACK15_CROP_VARIANTS.length
    ];
  const render =
    PACK15_RENDER_VARIANTS[
      (numericId * 3 + categoryIndex * 5 + seedOffset) % PACK15_RENDER_VARIANTS.length
    ];
  const attire =
    PACK15_ATTIRE_VARIANTS[
      (numericId * 5 + categoryIndex * 7 + seedOffset) % PACK15_ATTIRE_VARIANTS.length
    ];
  const pose =
    PACK15_POSE_VARIANTS[
      (numericId * 7 + categoryIndex * 11 + seedOffset) % PACK15_POSE_VARIANTS.length
    ];
  const palette =
    PACK15_PALETTE_VARIANTS[
      (numericId * 11 + categoryIndex * 13 + seedOffset) % PACK15_PALETTE_VARIANTS.length
    ];
  const environmentScale =
    PACK15_ENVIRONMENT_SCALE_VARIANTS[
      (numericId * 13 + categoryIndex * 17 + seedOffset) % PACK15_ENVIRONMENT_SCALE_VARIANTS.length
    ];
  const categoryCue: Record<string, string> = {
    pack_15__classic_industrial_punks:
      'Use industrial scale through civic architecture, transit, smoke, and metal color planes, not repeated brass-jacket portraits.',
    pack_15__neon_net_and_signal_punks:
      'Use signal culture through rain, streets, windows, clothing marks, rooflines, and light weather, not the same hooded cyberpunk profile.',
    pack_15__eco_repair_and_climate_punks:
      'Use climate culture through gardens, flood barriers, roofs, public shade, water movement, and community distance, not solarpunk hero portraits. Hard avoid category repetition: same short stocky apron caretaker, same back-view walkway, same beige solar neighborhood, same polite garden district.',
    pack_15__bio_myco_and_body_punks:
      'Use body/bio culture through organism architecture, garment silhouette, spore color, prosthetic outline, and social setting, not clinic fashion closeups.',
    pack_15__ocean_ice_and_terrain_punks:
      'Use terrain pressure through scale, water/ice/desert/cliff planes, weather, and utility clothing, not a repeated cool protagonist bust.',
    pack_15__street_riot_and_diy_punks:
      'Use DIY culture through posture, performance, patched surfaces, street scale, and graphic noise, not alley fashion portrait repetition.',
    pack_15__media_vapor_and_glitch_punks:
      'Use media culture through architecture, signal weather, paper/glow fields, and public space, not foreground receivers, tower portraits, reels, dishes, or screen-equipment as the dominant subject.',
    pack_15__occult_myth_and_gothic_punks:
      'Use occult/gothic pressure through ceremony, textiles, masks, thresholds, and symbolic space, not repeated hooded relic portraits.',
    pack_15__space_atomic_and_ray_punks:
      'Use space-age culture through plazas, vehicles, public interiors, moon scale, and retro geometry, not pinup astronauts, back-view robed moon pilgrims, satellite-dish hero shots, or device holders.',
    pack_15__primitive_stone_and_salvage_punks:
      'Use salvage culture through settlement shape, stone/rope/cloth planes, weather, and communal scale, not fantasy artisan-with-machine poses, crouched mechanic demos, or water-clock object portraits.',
  };
  const presetCue: Record<string, string> = {
    'SP15-011':
      'QA correction for Pirate Mesh Relay: avoid lone back-view hooded cyberpunk figure, dark rainy alley sameness, and tower/antenna hero framing. Show a side-view mesh resident, rooftop vendor, courier, or signal-community organizer with readable garment color and body shape; relay motifs remain background weather or architecture.',
    'SP15-014':
      'QA correction for Signal Shrine Substation: avoid another lone standing figure in a dark rainy street. Use a warm interior threshold, amber/coral signal panels, seated or leaning shrine attendant, elder, or visitor, and a clearer human silhouette; substation geometry is architectural backdrop, not a device portrait.',
    'SP15-017':
      'QA correction for Solar Orchard Commons: avoid the short apron caretaker template. Use a tall orchard resident, teenager, or slim canopy walker in side profile under solar shade; make orchard geometry and bright air distinct from the rest of the eco set.',
    'SP15-018':
      'QA correction for Sunstack Civic Atrium: avoid back-view walkway and beige eco block repetition. Use a vertical civic atrium, high sun cloth, angular orange-yellow planes, and a seated or leaning commuter/attendant with a different body shape and garment block.',
    'SP15-019':
      'QA correction for Riverbend Repair Union: avoid another bulky apron worker. Use a river organizer, bridge resident, or ferry-side elder with side-facing posture and civic water infrastructure as background, not a repair-task demo.',
    'SP15-020':
      'QA correction for Windcatcher Tenement Roofs: avoid the same balcony/back-view eco figure. Use a narrow rooftop silhouette, high or low poster angle, wind cloth and vertical roof machinery framing the figure from a distance.',
    'SP15-022':
      'QA correction for Desert Bloom Condensers: avoid small back-view beige settlement sameness. Use a dry ochre condenser district with a side-view resident in sun hood, broad overshirt, or utility skirt; desert equipment stays architectural.',
    'SP15-024':
      'QA correction for Mangrove Lift Cooperative: avoid crouched repair posture or dark object-demo scene. Show an upright resident on an elevated mangrove walkway or lift platform, with wet green verticals and community scale around them.',
    'SP15-033':
      'QA correction for Coral Circuit Marina: avoid review-prone maintenance, harness, injury, underwater, or exposed-body reads. Show a clothed harbor resident, vendor, elder, or musician in a stylized marina walkway; coral/circuit motifs are architecture and color rhythm only.',
    'SP15-056':
      'QA correction for Static Tape Observatory: avoid making the tower, reel, antenna, dish, or receiver the hero. Make the protagonist clearly readable first, with media architecture reduced to backdrop and weather/light shape.',
    'SP15-071':
      'QA correction for Lunar Orchard Relay: avoid the same back-view robed traveler, poncho silhouette, and satellite-dish hero composition. Use a side-view or seated orchard caretaker, diner worker, helmeted gardener, or civic resident in a moon greenhouse/plaza, with the person reading before the equipment.',
    'SP15-075':
      'QA correction for Obsidian Water Clock: avoid crouched mechanic-at-machine staging. Show a resident, elder, or seated watcher integrated with stone-water architecture; the water clock is environment, not the main object portrait.',
  };

  return [
    `DIVERSITY LOCK: This preset must not resemble neighboring SP15 cards as a cast sheet. Use ${subject}.`,
    `Crop/composition: ${crop}.`,
    `Render lineage: ${render}.`,
    `Wardrobe/body block: ${attire}.`,
    `Pose/action read: ${pose}.`,
    `Palette/lighting decision: ${palette}; keep darks as charcoal/slate/blue-black, never flat black.`,
    `Environment scale: ${environmentScale}.`,
    categoryCue[categoryKey] ||
      'Make this preset visually distinct through role, crop, palette, and environment weight.',
    presetCue[preset.id] || '',
    `Preset identity cue for ${sanitizeStylePromptName(
      preset.name,
    )}: express it through clothing block, posture, background architecture, weather, color accent, or social role, not through a held object.`,
    'At thumbnail size, the first difference from neighboring cards must be silhouette, crop distance, environment scale, and color field, not only hair color, facial style, or a different gadget.',
    'Hard avoid for pack 15 repetition: same young slim stylish protagonist, undercut or white-spike hair default, high-collar black jacket, pale poncho traveler, rear-view cloaked pilgrim, fashion-model bust, repeated three-quarter profile, repeated hands-in-pockets pose, repeated moonlit rooftop, repeated dark cloak, same anime face, same tall skinny silhouette, same close portrait scale, giant antenna/dish/gear/water-clock as hero, and same centered person-with-machine layout.',
  ]
    .filter(Boolean)
    .join(' ');
}

const COLOR_SEPARATION_VARIANTS = [
  'Push one accent color family that is uncommon for neighboring presets in the same category.',
  'Separate the preset with a distinct dominant-vs-accent palette relationship.',
  'Use one memorable color accent on the focal plane that changes the image identity immediately.',
  'Let the palette split warm and cool zones in a way that feels unique to this preset.',
  'Use a strong local color decision that makes the card identifiable from thumbnail size.',
];

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

interface Pack15WorldRoute {
  world: string;
  art: string;
  avoid: string;
  actors: string[];
}

interface Pack15CardRoute {
  name: string;
  character: string;
  composition: string;
  palette: string;
}

const PACK15_WORLD_ROUTE_DEFAULT: Pack15WorldRoute = {
  world:
    'a specific local x-punk society expressed through public space, weather, clothing block, material culture, and background architecture',
  art: 'stylized digital painting with editorial-poster hierarchy, broad value groups, drawn contours, restrained texture, and clean denoise',
  avoid:
    'generic punk boss portraits, object demonstrations, centered device scenes, and repeated long-coat character cards',
  actors: [
    'a local commons sentinel',
    'a seated civic elder',
    'a young public-space rebel',
    'a threshold resident',
    'a place-dwarfed guardian',
    'a public ritual performer',
    'a transit-edge traveler',
    'a partly hidden witness',
  ],
};

const PACK15_WORLD_ROUTES: Record<string, Pack15WorldRoute> = {
  pack_15__classic_industrial_punks: {
    world:
      'railworks, foundries, clock towers, airship docks, civic workshops, soot weather, riveted public architecture, and coal-orange industrial light',
    art: 'constructivist industrial poster painting, matte soot planes, copper/coal color blocking, simplified machinery silhouettes, and human-scale civic pressure',
    avoid:
      'brass fashion portraits, repair-task demos, gear-in-hand poses, steampunk cosplay, and polished brown metal realism',
    actors: [
      'a brass-commons gate golem with enamel eyes and boiler-apron plates',
      'a coal-fog rail oracle with soot veil and red signal pupils',
      'a pressure-lace automata dancer with porcelain joints and gear-lace collar',
      'an iron-convoy storm pilot with boxy signal helmet and patched canvas sleeves',
      'a clocktower strike bell-ringer with long brass fingers and ash-gray face paint',
      'a pneumatic print compositor with ink-stained arms and blocky paper armor',
      'a smogline airship dock gargoyle with aviator cloth and rivet shell shoulders',
      'a rivet cathedral forge saint with square iron mask and glowing apron tiles',
    ],
  },
  pack_15__neon_net_and_signal_punks: {
    world:
      'rain glass streets, mesh roofs, firewall gardens, pirate relays, signal shrines, clinic alleys, and neon weather as architecture',
    art: 'night-rain digital painting with flattened neon fields, soft screen glow as atmosphere, wet color planes without photoreal reflections, and sparse signal marks',
    avoid:
      'cyberpunk trench coats, handheld screens, hacker portraits, blue-magenta alley clones, and equipment-as-hero staging',
    actors: [
      'a rain-glass mantis-like alleyglass courier with prism-shell head and exposed angular limbs',
      'a meshlight canopy sentinel with fiber-optic crest fins and prism cheek plates',
      'a pirate mesh relay auntie with antenna braids and laughing neon teeth',
      'a cooperative firewall garden scarecrow with translucent firewall petals',
      'a black-ice lane skater-phantom with obsidian visor and cyan joint lights',
      'a signal shrine night moth with amber panel wings folded like robes',
      'a drone-graffiti overpass imp with spray-paint halo and tiny rotor earrings',
      'a neon clinic backdoor nurse-automaton with soft coral glass face',
    ],
  },
  pack_15__eco_repair_and_climate_punks: {
    world:
      'solar atria, roof farms, river barriers, windcatcher housing, seed-vault parties, desert condensers, and mangrove lift platforms',
    art: 'climate-civic poster painting with pale sun blocks, plant geometry, water infrastructure, dry ochre or wet green planes, and open breathable midtones',
    avoid:
      'polite solarpunk brochure scenes, apron-worker repair poses, beige garden sameness, and smiling community stock illustration',
    actors: [
      'a solar orchard chlorophyll giant with leaf-panel shoulders',
      'a sunstack atrium glass-skin witness wrapped in yellow shade cloth',
      'a riverbend ferry frog-engineer with reed crown and blue work sash',
      'a windcatcher roof kite-person with sailcloth elbows and narrow grin',
      'a seed-vault block-party sprout monarch with clay beads and seed pod hair',
      'a desert condenser lizard nomad with ceramic dew goggles',
      'a rain choir waterworks singer with translucent throat fins and copper ribs',
      'a mangrove lift crab-legged walkway keeper with green rope harness',
    ],
  },
  pack_15__bio_myco_and_body_punks: {
    world:
      'grown transit spines, organism markets, nerve-looms, spore plazas, living bridges, apothecaries, and chloroplast housing stacks',
    art: 'biological urban painting with soft organic architecture, controlled membrane color, fungal or chlorophyll forms as setting, and elegant body-safe stylization',
    avoid:
      'clinic fashion closeups, gore, exposed anatomy, glossy body horror, and generic biotech lab portraits',
    actors: [
      'a mushroom-crowned transit spirit with commuter-cloth layers',
      'a symbiont market canopy queen with living shawl and many tiny eye-spots',
      'a nerve loom clinic moth-surgeon with ribbon nerves and calm mask',
      'a spore signal plaza herald with mushroom trumpets growing from shoulders',
      'a living bridge toll salamander with vine tattoos and shell satchel',
      'a gene hack apothecary chimera with herb jars embedded in coat plates',
      'a flesh circuit conservatory curator with petal ribs and glass tendons',
      'a chloroplast housing balcony guardian with green solar skin and tiled jaw',
    ],
  },
  pack_15__ocean_ice_and_terrain_punks: {
    world:
      'coral marinas, tideglass subways, kelp boardwalks, shell piers, icebreaker towns, glacier monasteries, salt flats, and stiltwork swamps',
    art: 'terrain-pressure artbook painting with wide water/ice/salt planes, muted mineral colors, weather edges, and a readable figure shaped by place',
    avoid:
      'wetsuit pinups, maintenance harness scenes, underwater glamour, cool-blue hero busts, and object-first lantern or dock portraits',
    actors: [
      'a coral circuit marina reef-sphinx with turquoise cable whiskers',
      'a tideglass subway platform siren with glass fins and transit cloak fragments',
      'a kelp arcade boardwalk monarch with eel-braid hair and arcade-shell crown',
      'a shell metro pier warden with barnacle armor and pearl eye patches',
      'an icebreaker lantern town walrus-like innkeeper with warm lamp beard',
      'a glacier server monastery snow monk with prism horns and blue data beads',
      'a salt-flats kite foundry ostrich-runner with paper wings and rust anklets',
      'a swamp signal stiltworks heron-witch with reed stilts and radio feathers',
    ],
  },
  pack_15__street_riot_and_diy_punks: {
    world:
      'zine walls, generator skateparks, basement synth barricades, scrapbike yards, sticker booths, warehouse clinics, patch tribunals, and mutual-aid food print rooms',
    art: 'risograph-zine digital painting with torn-paper planes, dirty reds, sour greens, off-register edges, and direct street composition without readable text',
    avoid:
      'American comic punk attitude, alley fashion shoots, rally crowds, band-poster clones, and black leather costume sameness',
    actors: [
      'a zine wall safehouse paper-mask phantom with stapled grin',
      'a skatepark generator yard scrap monarch with knee-pad crown',
      'a basement synth barricade noise-priest with speaker-rib torso',
      'a scrapbike courier yard hyena-mechanic with chrome jaw and bare arms',
      'a sticker-bomb signal booth lookout with sticker-scale skin and antenna hairpins',
      'a warehouse rave clinic bat-nurse with ultraviolet gloves and soft eyes',
      'a patch jacket tribunal scarecrow judge with fabric-square face',
      'a mutual-aid food printer dumpling spirit with apron armor and steam halo',
    ],
  },
  pack_15__media_vapor_and_glitch_punks: {
    world:
      'cathode pools, gradient arcades, cassette weather, pirate TV atria, CRT booths, glitch bazaars, mall uplinks, and static observatories',
    art: 'vapor-media painting with soft cathode color, pastel decay, analog signal weather, geometric glow, and graphic poster calm instead of gadget clutter',
    avoid:
      'foreground receivers, dish/tower/reel hero shots, screen operator poses, vaporwave stock nostalgia, and equipment still lifes',
    actors: [
      'a pool-tile amphibian lifeguard phantom with mosaic skin and buoyant posture',
      'a gradient arcade mirage jester with vapor-glass cheeks and pixel capelets',
      'a cassette weather station snail-prophet with tape-spool shell',
      'a pirate TV atrium balcony idol with cathode halo and paper fan sleeves',
      'a CRT prayer booth penitent with phosphor skull mask and soft hands',
      'a glitch bazaar kiosk oracle with broken mannequin face and rainbow shadow',
      'a mall fountain uplink mer-person with chrome pool robe and satellite earrings',
      'a static tape observatory owl-keeper with ribbon-tape feathers',
    ],
  },
  pack_15__occult_myth_and_gothic_punks: {
    world:
      'witch switchyards, tarot foundries, goth relay chapels, bone-lime cairns, shrine processions, necrophone shops, vampire data salons, and transformer folk rituals',
    art: 'gothic folk-modern digital painting with ritual thresholds, colored shadow, red glass or bone-lime accents, symbolic architecture, and calm ominous staging',
    avoid:
      'hooded relic portraits, fantasy cultists, flat black robes, skull-pile decoration, and generic dark-fantasy sourcebook art',
    actors: [
      'a neon witch switchyard fox-spirit with cable tails and violet hands',
      'a tarot circuit foundry iron-card reader with molten halo',
      'a goth relay chapel raven cantor with red glass throat',
      'a bone-lime signal cairn goat-mask witness with chalk horns',
      'a shrine engine procession puppet-dancer with lacquer joints',
      'a necrophone threshold beetle-keeper with bone receiver crown',
      'a vampire data salon porcelain aristocrat with crimson server-veins',
      'a folk horror transformer straw saint with transformer-coil antlers',
    ],
  },
  pack_15__space_atomic_and_ray_punks: {
    world:
      'isotope plazas, reactor promenades, orbit diner strips, rocket chapels, comet salvage yards, plasma rail commons, lunar orchards, and crater sanctuaries',
    art: 'atomic-age poster painting with moonlit civic geometry, diner color, reactor glow as flat value design, and retro-future silhouettes kept matte',
    avoid:
      'pinup astronauts, shiny space armor, satellite-dish hero shots, back-view moon pilgrims, and glossy sci-fi concept art',
    actors: [
      'a neon isotope plaza isotope imp with lead-glass smile',
      'a reactor promenade counter robot with beehive hair-shell and apron fins',
      'an orbit diner strip alien waitress with starry skin and roller shoes',
      'a rocket chapel outpost mantis nun with chrome fins and prayer visor',
      'a comet salvage yard rust cyclops with magnet boots and asteroid cloak scraps',
      'a plasma rail commons eel conductor with luminous spine and ticket-punch gloves',
      'a lunar orchard relay moon rabbit gardener with glass helmet and leaf ears',
      'a crater choir sanctuary crystal singer with crater-dust throat and silver robelets',
    ],
  },
  pack_15__primitive_stone_and_salvage_punks: {
    world:
      'basalt sanctuaries, flint markets, obsidian water architecture, bone signal masts, rope bridge generators, mud brick battery houses, salvage sail commons, and driftwood turbine camps',
    art: 'stone-salvage painting with rough handmade geometry, rope/cloth/ash planes, volcanic grays, clay color, and prehistoric engineering made graphic rather than fantasy',
    avoid:
      'crouched mechanic demos, fantasy artisan poses, giant clock/object portraits, barbarian costume reads, and muddy brown realism',
    actors: [
      'a basalt gear sanctuary stone-backed tortoise guardian',
      'a flint engine market hyena trader with spark teeth and clay tokens',
      'an obsidian water-clock amphibian timekeeper with wet stone crown',
      'a bone signal mast vulture watcher with chalk-painted wings',
      'a rope bridge generator spider-limbed crossing keeper',
      'a mud brick battery house kiln-runner with a geometric clay mask',
      'a salvage sail commons sea-urchin navigator with patched sail collar',
      'a driftwood turbine camp wind imp with bark mask and turbine earrings',
    ],
  },
};

const PACK15_CARD_ROUTES: Pack15CardRoute[] = [
  {
    name: 'monumental sentinel',
    character:
      'an imposing local guardian, masked humanoid, engineered creature-person, or sentient civic automaton with broad square stance, empty hands, visible forearms or block sleeves, and short layered clothing shaped by the local world; no long draped cloak, robe, cape, mantle, poncho, or overcoat',
    composition:
      'low-angle three-quarter figure, full or near-full body, background infrastructure towering behind, face/profile readable at card size',
    palette:
      'one dominant midtone field plus one hot local accent; keep darks as charcoal, slate, or blue-black',
  },
  {
    name: 'seated civic oracle',
    character:
      'a compact seated oracle, creature-person, masked judge, ceramic automaton, or fungal civic authority made powerful through still posture, strange proportions, folded cloth, and a memorable face or mask',
    composition:
      'seated public-space crop with steps, benches, thresholds, or architectural planes wrapping around the figure; no throne fantasy',
    palette:
      'pale midtones, colored shadow, and one sharp civic accent; avoid crushed blacks and tan sameness',
  },
  {
    name: 'graphic oddball rebel',
    character:
      'an oddball rebel, performer, courier, pool phantom, mascot-like humanoid, or street monarch with asymmetrical garment block, unusual head shape, mosaic skin, sculptural braids, oversized visor, or tile-like face; no hood, mask-only human, side-shaved hair, mohawk, undercut, or crest hair',
    composition:
      'front-facing poster crop against an environmental wall, plaza, doorway, or public surface; the background must be place, not wallpaper',
    palette: 'two loud flat color fields plus a dirty neutral; no glossy fashion lighting',
  },
  {
    name: 'threshold profile',
    character:
      'a tall narrow resident, creature-person, glass-faced courier, prism-headed wanderer, or weather-shaped humanoid in side view, bare or wrapped forearms visible, wind-braced posture, hands empty; no hooded traveler, mohawk, side-shaved hair, undercut, or punk crest',
    composition:
      'side-profile threshold crop with the world visible over the shoulder through a bay mouth, doorway, platform edge, roofline, pier, cave lip, or atrium gap',
    palette: 'cool-warm split lighting with open midtones and no black silhouette fill',
  },
  {
    name: 'environment-dwarfed guardian',
    character:
      'a heavy-set guardian, worker-poet, shelter keeper, or local resident whose body shape is clear but secondary to the scale of the place',
    composition:
      'high-angle or wide environmental portrait where the character remains primary through color contrast while infrastructure, weather, or terrain carries most of the frame',
    palette:
      'muted terrain or civic colors with one saturated garment accent; avoid blue-orange cinematic default',
  },
  {
    name: 'public ritual performer',
    character:
      'a masked performer, street oracle, weather caller, musician-like figure, or public speaker using body gesture only, no held instrument, device, tool, weapon, or relic',
    composition:
      'off-center stage, plaza, market-edge, chapel, roof, dock, or shelter composition with one bold color plane and one architectural mass',
    palette:
      'ritual accent color against gray-green, bone, coal, or faded pastel fields; preserve readable dark-gray shadows',
  },
  {
    name: 'diagonal transit crossing',
    character:
      'a helmeted resident, courier, attendant, or traveler crossing a local transit edge with empty hands and a diagonal body line',
    composition:
      'medium-long diagonal movement across rail, bridge, pier, ramp, rooftop, arcade, orchard aisle, crater path, or rope span; no vehicle operation',
    palette: 'moving accent streak plus stable background color block; avoid photoreal motion blur',
  },
  {
    name: 'partly hidden witness',
    character:
      'a still witness, watcher, matron, youth, or outsider with partly obscured face behind veil, steam, weather edge, glass color, shadow cloth, or architectural cutout',
    composition:
      'close-to-mid crop with face partly hidden but background unmistakable, using foreground occlusion as graphic shape rather than cinematic depth of field',
    palette:
      'soft near-monochrome field broken by one precise accent; no pure black masks or empty abstract card',
  },
];

function pack15RouteFor(categoryKey: string, preset: StyleRuntimePreset) {
  const numericId = Number(preset.id.match(/^SP15-(\d+)$/)?.[1] || 1) - 1;
  const categoryIndex = PACK15_CATEGORY_INDEX[categoryKey] ?? hashString(categoryKey) % 10;
  const presetSlot = ((numericId % 8) + 8) % 8;
  const routeIndex = (numericId + categoryIndex * 3) % PACK15_CARD_ROUTES.length;
  const worldRoute = PACK15_WORLD_ROUTES[categoryKey] || PACK15_WORLD_ROUTE_DEFAULT;

  return {
    routeNumber: routeIndex + 1,
    localActor: worldRoute.actors[presetSlot] || PACK15_WORLD_ROUTE_DEFAULT.actors[presetSlot],
    worldRoute,
    cardRoute: PACK15_CARD_ROUTES[routeIndex],
  };
}

const PACK15_CARD_PROMPTS: Record<string, string> = {
  'SP15-001':
    'Brass Gear Commons: an enamel-eyed brass gate golem stands broad and calm at the entrance of a civic machine commons. Its body is made of boiler-apron plates, pressure glyph tiles, soft cloth wraps, and warm brass panels; no human boss pose. Behind it, workers appear only as tiny silhouettes under huge civic gear shadows, steam color blocks, and amber machine teeth. Low-angle poster crop, copper and cream palette, matte soot planes, stylized digital painting.',
  'SP15-002':
    'Coal Fog Railworks: an iron crane-headed signal oracle stands on a diagonal rail platform, narrow beak visor lit by one red semaphore glow. The figure is built from charcoal canvas panels, enamel signal beads, and angular rail-worker wraps, with empty visible hands and no seated pose. Behind them: huge locomotive headlamp discs, semaphore gantries, rail silhouettes, small switch-crew marks, and coal fog as broad slate planes. Tall standing environmental crop, pale charcoal midtones, sodium amber fog, signal red accent, no black robe, no old authority portrait, no officer, no rail guard, no noir man.',
  'SP15-003':
    'Pressure Lace Automata: a pale porcelain automata dancer freezes mid-step on a small pressure-stage, one leg lifted, one articulated hand open, mask-face tilted like a clockwork bird. Its body is segmented porcelain, brass strut fans, blue glass joints, and sparse valve-lace arcs; no fabric drape, no seated pose, no dark clothing. Background: cream steam curtains, tall brass ribs, pale workshop salon balconies, pressure gauges as large abstract circles. Elegant asymmetrical vertical composition, ivory, tarnished gold, tea stain, pale blue glass, no black robe, no red-eyed oracle, no old woman portrait.',
  'SP15-004':
    'Iron Radio Convoy: a box-helmeted storm pilot stands beside a rain-dark convoy street, empty hands visible, patched canvas sleeves snapping in wind. The helmet has old signal slits and painted route marks, but no handheld device. Behind the figure, iron trucks, field signal boxes, wet pavement color planes, and distant convoy lamps form the world. Side-view threshold crop, olive gray, sodium amber, dirty red, matte painterly finish.',
  'SP15-005':
    'Clocktower Strike Assembly: a bell-ringer with long brass fingers and ash-gray face paint waits beneath a clocktower strike banner made only of abstract fabric shapes, no readable text. The character wears short blocky work cloth, not a coat, with one oversized bell-shoulder plate. Behind them: towering clock faces, public steps, tiny assembly silhouettes, steam, and copper morning light. Off-center poster composition, dusty blue-gray and warm brass.',
  'SP15-006':
    'Pneumatic Print Foundry: an ink-fingered compositor creature leans near a pneumatic press wall, square paper armor layered over broad shoulders, hands relaxed and not operating equipment. Ink stains climb its arms like tattoos, but the pose is still and iconic. Behind it: huge print rollers as abstract cylinders, paper stacks as large flat planes, red registration dots, and smoky foundry light. Graphic printmaking digital painting, cream paper, coal gray, ink red.',
  'SP15-007':
    'Smogline Airship Dock: a rivet-shell dock gargoyle watches from a platform edge, aviator cloth tied short around its shoulders, long ears or fins cutting the smog. Airships hang as distant matte silhouettes behind it, with rope bridges, gantry blocks, and amber fog planes. The character is creature-like and watchful, not a pilot pinup. High environmental portrait, green-gray smog, copper orange lights, no goggles-as-fashion portrait.',
  'SP15-008':
    'Rivet Cathedral Workshop: a square iron-mask forge saint stands under cathedral-height rivet arches, apron tiles glowing softly like embers. The figure is broad, quiet, and strange, with visible forearms and no robe or cloak. Background: workshop nave, giant rivet ribs, orange furnace windows, hanging chain silhouettes kept sparse and graphic. Front-facing iconic stance, charcoal, rust, cream heat, controlled digital paint.',
  'SP15-009':
    'Rain Kernel Alleyglass: a rain-glass mantis-like courier with prism-shell head and angular exposed limbs waits in side profile at a wet alley threshold. No hood, no mohawk, no human cyberpunk face. Behind it: layered neon rain, kernel glow panels without UI text, cable gutters, distant silhouettes, and glass reflections simplified into matte color blocks. Tall narrow crop, lime, magenta, teal-black shadow, stylized poster painting.',
  'SP15-010':
    'Meshlight Night Market: a tall glass-plated canopy sentinel stands still beneath suspended mesh lanterns, prism cheek plates catching sour green and coral light. The figure has a narrow insectile posture, fiber-optic crest fins, short utility wraps, and empty visible hands; no roof stunt, no chase, no gadget. Behind them, the night market reads as abstract awnings, rain-blue tarps, tiny warm crowd marks, and glowing mesh knots with no readable signs or food-stall realism. Imposing centered environmental portrait, sour green, coral, rain blue, warm lantern yellow, matte digital painting.',
  'SP15-011':
    'Pirate Mesh Relay: an antenna-braided relay auntie with neon teeth laughs from a rooftop doorway, one hand resting on her hip and the other empty. Relay dishes and pirate mesh masts stay behind her as architecture, never as the hero object. Background: patched roof tarps, signal weather, coral and teal light, distant community silhouettes. Medium portrait with strong personality, no device holding, no hacker operator.',
  'SP15-012':
    'Cooperative Firewall Bloom: a translucent firewall scarecrow grows from a community garden threshold, petal-like luminous panels unfolding behind its shoulders. The figure has a straw-thin humanoid posture, friendly but eerie, with empty hands and no screen. Background: firewall bloom arches, shared rooftop planters, matte data-light fields, soft rain haze. Bright civic composition, mint, yellow, rose, and blue-gray shadow.',
  'SP15-013':
    'Black Ice Courier Lane: a black-ice skater phantom glides through a narrow lane, obsidian visor, cyan joint lights, and frost-like scarf fragments kept short. It is not a cool young human; its limbs are elongated and reflective like frozen glass. Background: frozen wet street, signal lane strips, distant red lamps, angular rain panels. Low diagonal crop, cyan, black-glass gray, red accent, no trench coat.',
  'SP15-014':
    'Signal Shrine Substation: an amber moth attendant stands inside a warm substation shrine, folded panel-wings held close like ritual cloth. The head is soft insectile, with glowing coral eyes and no human hair. Background: transformer geometry as shrine walls, non-readable signal tiles, amber panels, small offering shapes. Quiet interior threshold crop, coral, amber, slate, no gadget, no operator pose.',
  'SP15-015':
    'Drone Graffiti Overpass: a small rotor-saint with spray-paint halo and angular streetwear perches under a graffiti overpass, empty hands visible. Tiny rotor earrings and painted cheek panels give character without making a machine the subject. Background: overpass beams, drone shadows as graphic marks, neon paint blocks, wet concrete. Wide poster crop, acid green, violet, gray, and dirty pink.',
  'SP15-016':
    'Neon Clinic Backdoor: a soft coral glass nurse-automaton waits in a backdoor clinic alley, rounded faceplate glowing gently, sleeves rolled, hands folded. It feels humane and odd, not a medical worker photo. Background: clinic curtains as color planes, wet alley light, non-readable care symbols, teal and coral panels. Close-to-mid crop, clean denoise, no lab coat, no surgeon, no handheld tool.',
  'SP15-017':
    'Solar Orchard Commons: a chlorophyll giant with leaf-panel shoulders stands between solar orchard rows, face broad and calm, hands open at sides. The figure is partly plant, partly civic worker, with ceramic white forearm wraps. Background: solar cloth canopies, fruit-light dots, pale public paths, tiny residents in shade. Low-angle warm daylight, sage, sun yellow, cream, green shadow.',
  'SP15-018':
    'Sunstack Civic Atrium: a glass-skin atrium witness leans beside a sunlit civic elevator, yellow shade cloth crossing the body in sharp panels. The face is translucent with faint internal light, not an old woman portrait. Background: tall sunstack balconies, ceramic tile, vertical garden ribbons, bright public air. Close crop with unmistakable atrium behind, white, sage, solar yellow, soft gray.',
  'SP15-019':
    'Riverbend Repair Union: a reed-crowned ferry frog-engineer stands on a river floodwall, blue work sash tied short, empty hands, powerful squat silhouette. No repair action, no tool demo. Background: ferry ropes, water barriers, bridge arches, orange river reflections, tiny community marks. Side-view environmental portrait, river blue, clay orange, algae green, and cream.',
  'SP15-020':
    'Windcatcher Tenement Roofs: a kite-person with sailcloth elbows and a narrow grin balances on a roof parapet, body stretched by wind. Clothing is angular rooftop fabric, not cloak. Background: windcatcher towers, laundry-like shade planes, roof gardens, vertical tenement blocks. High poster angle, pale blue, off-white, ochre, and sharp green accents.',
  'SP15-021':
    'Seed Vault Block Party: a sprout monarch with seed-pod hair and clay beads stands in a block party courtyard, smiling strangely under string lights made from seed pods. The character is festive and odd, not a generic host. Background: seed vault doors, dancing silhouettes as tiny shapes, plant crates, warm paper lantern color. Front-facing graphic crop, coral, green, cream, seed-brown.',
  'SP15-022':
    'Desert Bloom Condensers: a ceramic-goggled lizard nomad waits under a condenser canopy, dry skin painted with ochre bloom marks, hands relaxed. Background: desert condensers as tall shade structures, dust, clay pipes, cactus-like silhouettes, low sun. Wide environmental portrait, ochre, pale blue shade, clay pink, dull silver, no beige utopia.',
  'SP15-023':
    'Rain Choir Waterworks: a translucent-throat singer stands on a waterworks balcony, copper ribs visible under rain choir cloth, mouth open in silent song. Background: water tanks, falling rain curtains, circular basins, distant choir silhouettes, all as broad shapes. Vertical stage-like crop, teal, copper, slate, rain white, no microphone, no device.',
  'SP15-024':
    'Mangrove Lift Cooperative: a crab-legged mangrove keeper stands on an elevated lift walkway, green rope harness and shell-like hip plates, no repair pose. Background: mangrove roots, lift platforms, wet green verticals, orange community lights. Low-angle boardwalk portrait, moss green, water blue, rust, cream, strong silhouette.',
  'SP15-025':
    'Mycelial Transit Spine: a mushroom-crowned transit spirit sits on platform steps, commuter cloth layered over fungal shoulders, face pale and unreadable. Background: mycelial ribs, glowing route veins, cap awnings, distant transit silhouettes, humid gold light. Seated civic crop, mushroom ivory, moss, amber, clay, no old woman portrait.',
  'SP15-026':
    'Symbiont Market Canopy: a living-shawl canopy sovereign stands under a biological market roof, many tiny eye-spots in the shawl watching outward. The main face is calm and strange, hands empty. Background: canopy membranes, fruit pods, vendor silhouettes, soft green-gold glow. Medium portrait, amber sap, green shadow, warm clay, controlled organic texture.',
  'SP15-027':
    'Nerve Loom Clinic: a moth-surgeon with ribbon nerves and a calm ceramic mask waits in a clinic doorway, wing sleeves folded close. No surgery, no tools, no gore. Background: nerve loom strands as architecture, pale curtains, soft coral light, rounded clinic alcoves. Side threshold crop, ivory, nerve pink, muted teal, gray-green.',
  'SP15-028':
    'Spore Signal Plaza: a spore herald with trumpet-like mushroom growths on the shoulders stands in a public plaza, body covered in dusty orange spores and civic cloth strips. Background: signal pylons as fungal stems, plaza steps, drifting spores, tiny listeners. Front-facing poster crop, orange, violet gray, cream, moss green.',
  'SP15-029':
    'Living Bridge District: a vine-tattooed salamander toll keeper sits at a living bridge threshold, shell satchel closed, hands visible and idle. Background: ribbed bridge roots, river void, glowing fungi, distant crossing silhouettes. Seated side crop, wet green, river blue, amber, bark brown, no market aisle.',
  'SP15-030':
    'Gene Hack Apothecary: a chimera apothecary resident with herb jars embedded in coat plates stands in a tiny grown storefront, smiling with mismatched eyes. The jars are costume details, not held props. Background: apothecary shelves as abstract color blocks, vine lamps, bio-glass windows. Medium close crop, herb green, milky glass, clay red, yellow glow.',
  'SP15-031':
    'Flesh Circuit Conservatory: a petal-rib curator stands among living circuit trellises, glass tendons and floral ribs visible under translucent cloth. Body-safe, elegant, non-gore. Background: conservatory arches, soft circuit vines, rose light, distant greenhouse silhouettes. Off-center vertical crop, pale rose, chlorophyll green, ivory, blue-gray shadow.',
  'SP15-032':
    'Chloroplast Housing Stack: a green solar-skin balcony guardian with tiled jaw leans from a housing stack balcony, broad shoulders catching warm grow-light. Background: vertical chloroplast housing, leaf panels, laundry shade, small window silhouettes. High-angle civic portrait, leaf green, ceramic white, warm yellow, slate accents.',
  'SP15-033':
    'Coral Circuit Marina: a reef-sphinx harbor figure sits on a marina wall, turquoise cable whiskers and coral armor plates, fully clothed and dignified. Background: coral circuit arches, wet dock planes, small boats as silhouettes, pink-cyan water light. Seated harbor crop, coral, turquoise, pearl, deep blue-gray.',
  'SP15-034':
    'Tideglass Subway: a glass-fin platform singer waits beside a tideglass subway opening, translucent fins catching green-blue light, hands folded. Background: flooded transit steps, glass rails, distant train glow, ripple shadows, no readable map. Side profile crop, aqua, bottle green, cream, slate.',
  'SP15-035':
    'Kelp Arcade Boardwalk: an eel-braid boardwalk monarch stands under arcade lights, shell crown and kelp ribbons forming a playful silhouette. Background: kelp arcade awnings, boardwalk rail, small game lights as abstract squares, sea haze. Front poster crop, magenta, kelp green, aqua, cream, no human punk hair.',
  'SP15-036':
    'Shell Metro Pier: a barnacle-armored pier warden walks across a shell metro platform, pearl eye patches and shell shoulder plates, empty hands. Background: shell trains, pier pilings, gull-gray sky shapes, coral lamps. Diagonal transit crop, pearl white, rust orange, ocean teal, gray.',
  'SP15-037':
    'Icebreaker Lantern Town: a tusked lantern host with warm lamp beard stands outside an icebreaker inn, heavy short quilted layers, friendly but imposing. Background: icebreaker hulls, lantern town windows, snow planes, tiny residents. Warm-cold contrast, amber, ice blue, charcoal, cream, no survival game realism.',
  'SP15-038':
    'Glacier Server Monastery: a prism-horn snow monk sits inside a glacier server cloister, blue data beads strung across the chest, face smooth and mineral. Background: frozen server pillars, monastery arches, soft cyan light, white fog planes. Seated calm crop, pale cyan, glacier white, indigo gray, gold pinpoints.',
  'SP15-039':
    'Salt Flats Kite Foundry: a long-legged kite runner strides across salt flats with paper wings folded at the back, rust anklets and sun-shield face paint. Background: kite foundry frames, salt horizon, wind cloth, orange heat. Medium-long diagonal crop, chalk white, rust, sky blue, yellow ochre.',
  'SP15-040':
    'Swamp Radio Stiltworks: a reed-stilt witch watches from a swamp platform, feather-like antenna reeds around the head, hands empty and low. Background: stilt houses, swamp radio masts, green water, yellow signal lamps, mist shapes. Environmental portrait, olive, yellow, black-green, muddy rose, no device hero.',
  'SP15-041':
    'Zine Wall Safehouse: a stapled paper-mask phantom stands in front of torn zine walls, blocky paper body and one sharp red cheek mark. No readable text, no band poster clone. Background: paste buckets, distro crates, paper layers, safehouse doorway. Close-to-mid graphic crop, paper cream, photocopy gray, dirty red, tape yellow.',
  'SP15-042':
    'Skatepark Generator Crew: a generator-yard monarch with knee-pad crown stands on a concrete bowl edge, playful creature grin, elbow pads, and patched generator cloth. Background: skate ramps, generator blocks, cable arcs as broad shapes, tiny riders in distance. Low poster angle, cyan concrete, orange, black-gray, lime.',
  'SP15-043':
    'Basement Synth Barricade: a speaker-rib noise priest leans in a basement barricade, torso shaped like stacked speakers, face hidden by vibrating color planes. Background: synth wall, barricade boards, violet light, small dancer silhouettes. Off-center crop, violet, acid green, red, charcoal, no instrument product shot.',
  'SP15-044':
    'Scrapbike Courier Yard: a chrome-jaw yard mechanic creature stands between scrapbike frames, bare arms and patched shorts, no tool in hand. Background: bike silhouettes, metal sheets, orange yard lights, painted ground. Three-quarter full body crop, rust, chrome blue, black-gray, hot pink accent.',
  'SP15-045':
    'Sticker Bomb Signal Booth: a sticker-scale lookout with antenna hairpins peers from a signal booth doorway, body covered in non-readable sticker shapes. Background: booth glass, sticker fields, signal lights, street edge. Close crop with bold graphic wall, candy colors, gray shadow, no logos or letters.',
  'SP15-046':
    'Warehouse Rave Clinic: an ultraviolet bat-nurse with soft eyes stands in a warehouse clinic corner, gloves glowing, wings folded as short sleeves. Background: rave haze as flat violet blocks, clinic curtains, folding cots as abstract rectangles, no medical procedure. Medium portrait, UV violet, mint, coral, gray.',
  'SP15-047':
    'Patch Jacket Tribunal: a fabric-square scarecrow judge sits at a tribunal table made of patches, face stitched from mismatched cloth, hands visible and empty. Background: patch banners without symbols, jury silhouettes, warehouse wall planes. Seated crop, mustard, red, denim blue, paper gray.',
  'SP15-048':
    'Mutual Aid Food Printer: a steam-halo food printer host with dumpling-like round body and apron armor stands in a community kitchen doorway. The printer is background infrastructure, not foreground object. Background: warm food tiles, steam, serving silhouettes, no text. Friendly imposing crop, cream, tomato red, stainless gray, teal.',
  'SP15-049':
    'Cathode Pool Reverie: a pool-tile amphibian lifeguard phantom stands by a glowing indoor pool, mosaic skin, oversized visor, buoyant posture, and no human punk haircut. Background: CRT walls, pool tiles, vapor gradients, chrome rails, pastel water light. Front poster crop, aqua, magenta, cream, violet shadow.',
  'SP15-050':
    'Gradient Arcade Mirage: a vapor-glass jester with pixel capelets poses in a gradient arcade, cheeks translucent and eyes like soft arcade lights. Background: arcade cabinets as unreadable color slabs, palm silhouettes, pink-blue haze. Medium crop, bubblegum pink, teal, lavender, cream, no nostalgia stock photo.',
  'SP15-051':
    'Cassette Weather Station: a tape-spool shell prophet stands on a weather platform, cassette ribbons trailing like hair in the wind, hands empty. Background: weather towers, tape clouds, orange sunset bands, static rain marks. Side profile crop, rust orange, storm teal, cream, dark gray.',
  'SP15-052':
    'Pirate TV Atrium: a cathode-halo balcony idol leans over a pirate TV atrium, paper fan sleeves and glowing faceplate, no screen operation. Background: stacked balconies, TV light rectangles, pastel static, tiny spectators. High atrium crop, cyan, pink, warm gray, yellow glow.',
  'SP15-053':
    'CRT Prayer Booth: a phosphor skull penitent kneels inside a CRT booth, soft hands folded, face glowing green through bone-like screen glass. Background: booth curtains, cathode dots, dark mauve walls, candle-like LEDs. Tight ritual crop, phosphor green, violet gray, ivory, red pinpoints.',
  'SP15-054':
    'Glitch Bazaar Kiosk: a broken mannequin oracle stands in a bazaar kiosk, rainbow shadow offset from the body, face cracked into color bars. Background: kiosks as abstract blocks, glitch awnings, distant shoppers as tiny shapes, no readable signs. Off-center graphic crop, cyan, magenta, yellow, black-gray.',
  'SP15-055':
    'Mall Fountain Uplink: a chrome-pool mer-person sits at a mall fountain edge, satellite earrings and smooth reflective skin, hands on knees. Background: fountain uplink arcs, mall balconies, pastel tile, water glow. Seated crop, chrome, aqua, peach, purple gray, no device holding.',
  'SP15-056':
    'Static Tape Observatory: an owl-like tape observatory keeper stands under a static sky, ribbon-tape feathers layered over shoulders, round quiet eyes. Background: observatory tower as distant silhouette, tape reels as background moons, static weather bands. Environmental portrait, gray violet, tape brown, cyan, cream, no dish hero.',
  'SP15-057':
    'Neon Witch Switchyard: a fox-spirit with cable tails walks through a switchyard, violet hands glowing softly, no wand or held object. Background: electric frames, neon puddles, switchyard geometry, occult warning shapes without text. Side walking crop, violet, acid green, black-blue, coral.',
  'SP15-058':
    'Tarot Circuit Foundry: a copper-faced plate caster stands in side profile beside a massive tarot-circuit press, square black-iron apron cut short at the knees, furnace-yellow gloves hanging relaxed. The face is a flat copper mask with one pale enamel eye, not a priest mask, not a saint. Behind them: blank card plates as heavy rectangular doors, molten circuit lines in broad gold paths, compact foundry blocks, ember smoke, cream card geometry, and iron slabs. Industrial occult workshop crop from the side, burned gold, iron gray, ember red, card cream, no halo, no altar, no bishop, no black robe, no centered religious portrait.',
  'SP15-059':
    'Goth Relay Chapel: a black-cable relay harpy perches on an exterior radio-mast balcony, long cable-feather shoulders folded into sharp wing shapes, clawed feet gripping a metal rail. Red indicator beads run through antenna arches behind it, cold moon cuts slice the sky, and oxblood window blocks sit far below. The character is severe, birdlike, and communicative through silhouette only; hands are tucked, no console, no ritual gesture. Background: radio mast, cable-lace arches, tarnished silver wires, charcoal stone planes. Side-view exterior gothic relay crop, no chapel interior, no altar, no priest, no halo, no bishop, no black robe, no centered religious portrait.',
  'SP15-060':
    'Bone Lime Signal Cairn: a goat-mask witness stands by a bone-lime cairn, chalk horns and pale lime cloth blocks, hands low and empty. Background: cairn stones, signal lines as white scratches, cold sky, sparse grass. Medium-long environmental crop, bone white, lime, slate, rust accent.',
  'SP15-061':
    'Necrophone Repair Shop: a beetle-keeper with bone receiver crown waits inside a necrophone shop doorway, hard shell shoulders and pale antennae. No repair action, no tool use. Background: dead phone shapes as wall architecture, red bulbs, dusty shelves as broad planes. Close crop, black-purple, bone, red, brass.',
  'SP15-062':
    'Shrine Engine Procession: a lacquer-jointed puppet dancer leads a shrine engine procession, body segmented and painted, hands gesturing empty. Background: engine shrine carried far behind, lantern shapes, tiny procession silhouettes, dusk smoke. Diagonal ritual crop, lacquer red, cream, soot gray, gold.',
  'SP15-063':
    'Vampire Data Salon: a porcelain aristocrat with crimson server-veins sits in a data salon, pale face cracked like china, red glass collar, no old matron clone. Background: salon windows, velvet glow fields, server arches, moonlit panes. Side threshold crop, blood red, ivory, chrome gray, velvet blue.',
  'SP15-064':
    'Folk Horror Transformer: a straw saint with transformer-coil antlers stands in a field substation, body made of straw wraps and ceramic fuses. Background: transformer tower, harvest field, folk geometry, darkening sky. Off-center rural crop, straw gold, oxide red, blue-black shadow, green gray.',
  'SP15-065':
    'Neon Isotope Plaza: a lead-glass isotope imp grins in a civic plaza, small heavy body, glowing isotope freckles, and square protective jewelry. Background: isotope fountains, public columns, neon hazard colors as abstract panels, tiny walkers. Low plaza crop, neon green, lead gray, magenta, cream.',
  'SP15-066':
    'Reactor Promenade: a reactor-promenade robot with beehive hair-shell and apron fins stands at a curved counter rail, hands open. Background: reactor promenade arches, warm atomic glow, chrome rails, orange safety lights. Medium portrait, cream chrome, reactor orange, turquoise, graphite.',
  'SP15-067':
    'Orbit Diner Strip: an alien diner server with starry skin and roller shoes poses under orbit diner lights, playful and strange, not a pinup. Background: diner strip signs as unreadable color shapes, orbit cars as silhouettes, night sky. Full-body crop, cherry red, teal, moon white, dark violet.',
  'SP15-068':
    'Rocket Chapel Outpost: a mantis nun with chrome fins and prayer visor waits before a rocket chapel, folded forearms empty and calm. Background: chapel rocket towers, desert stars, silver fins, warm chapel windows. Symmetric vertical crop, silver, dusty rose, midnight blue, candle yellow.',
  'SP15-069':
    'Comet Salvage Yard: a rust cyclops with magnet boots stands in a comet salvage yard, asteroid cloak scraps cropped short, one glowing eye. Background: comet hull pieces, cranes as silhouettes, cosmic dust, orange work lamps. Environmental crop, rust, black-blue, white dust, green accent, no worker demo.',
  'SP15-070':
    'Plasma Rail Commons: an eel conductor with luminous spine and ticket-punch gloves strides across a plasma rail commons, not using equipment. Background: glowing rail arcs, public platforms, plasma blue fog, distant passengers. Diagonal transit crop, electric blue, cream, orange, charcoal.',
  'SP15-071':
    'Lunar Orchard Relay: a moon-rabbit gardener with glass helmet and leaf ears crosses a lunar orchard aisle, hands empty, body small against dome scale. Background: pale trees, relay dishes as distant architecture, black sky, grow lights. Medium-long crop, moon white, leaf green, silver, blue-black.',
  'SP15-072':
    'Crater Choir Sanctuary: a crystal singer with crater-dust throat stands in a sanctuary bowl, silver robelets cut short, mouth glowing. Background: crater choir arches, lunar dust, tiny choir silhouettes, pale acoustic panels. Stage crop, silver, violet, chalk white, soft gold.',
  'SP15-073':
    'Basalt Gear Sanctuary: a stone-backed tortoise guardian stands under basalt machine arcs, shell engraved with simple non-readable grooves, head calm and ancient. Background: basalt sanctuary, carved machine shadows, ember light, rope details. Low-angle crop, basalt gray, fire amber, chalk, moss.',
  'SP15-074':
    'Flint Engine Market: a spark-toothed hyena trader grins in a flint engine market, clay tokens sewn into a short vest, hands open and empty. Background: flint engines, shade cloth, market silhouettes, dust. Front crop, clay red, flint gray, blue shade, yellow sparks, no bazaar clutter.',
  'SP15-075':
    'Obsidian Water Clock: a wet-stone amphibian timekeeper stands beside obsidian water channels, crown made of dripping black stone, no crouching or machine operation. Background: carved slabs, water blue reflections, low firelight, drip bowls as architecture. Off-center ritual crop, obsidian gray, water blue, chalk, amber.',
  'SP15-076':
    'Bone Tool Signal Mast: a chalk-winged vulture watcher stands near a bone signal mast, wings folded as garment panels, face painted white. Background: bone mast high behind, rope lines, desert sky, small settlement marks. Tall environmental crop, bone white, sand, slate blue, rust.',
  'SP15-077':
    'Rope Bridge Generator: a spider-limbed crossing keeper grips no tools, standing at a rope bridge threshold with four visible leg-like supports and woven torso armor. Background: rope generator span, canyon gap, pulleys as distant shapes, wind. Diagonal bridge crop, rope tan, green-gray, copper, sky blue.',
  'SP15-078':
    'Mud Brick Battery House: a clay-mask kiln-runner stands before a mud brick battery house, geometric mask, short clay-tile apron layers, muscular forearms, and no cape. Background: mud-brick tower, ceramic batteries, copper jars, warm doorway light, courtyard dust. Low-angle full body, clay red, copper green, cream, shade blue.',
  'SP15-079':
    'Salvage Sail Commons: a sea-urchin navigator with patched sail collar stands on a wind-swept salvage deck, spiny silhouette softened by cloth bands. Background: sail triangles, patched hull curves, rope winches, sea-gray sky. Wide maritime poster crop, sea blue, rust, canvas tan, tar gray.',
  'SP15-080':
    'Driftwood Turbine Camp: a bark-mask wind sprite with turbine earrings waits beside a driftwood turbine camp, small fierce posture, short layered cloth, hands empty. Background: driftwood blades, patched tents, ember camp light, dusk sky. Environmental portrait, bark brown, dusk blue, ember orange, canvas cream.',
};

function broadPromptFamily(pack: StyleRuntimePack, category: string) {
  const key = styleCategoryImageKey(pack.id, category);
  if (key === 'pack_05__dark_fantasy_and_seinen') return 'anime_dark_fantasy';
  if (key === 'pack_05__studio_masterpieces') return 'anime_masterpieces';
  if (key === 'pack_05__slice_of_life_and_moe') return 'anime_slice';
  if (key === 'pack_05__sports_competition_and_performance') return 'anime_sports';
  if (key === 'pack_05__isekai_and_high_fantasy') return 'anime_fantasy';
  if (key === 'pack_05__anime_style_spectrum') return 'anime_style_spectrum';
  if (key === 'pack_05__action') return 'anime_action';
  if (key === 'pack_13__slice_of_life_school_music') return 'anime_slice';
  if (key === 'pack_12__speed_sport_and_competitive_arenas') return 'gameplay_competition';
  if (key === 'pack_04__ink_and_print') return 'illustration_print';
  if (key === 'pack_08__fabric_and_texture_focus') return 'fashion_texture';
  if (pack.id === 'pack_15') return 'punk_illustration';
  return 'default';
}

function categorySceneAnchor(
  pack: StyleRuntimePack,
  category: string,
  seed?: string,
  preset?: StyleRuntimePreset,
) {
  if (preset && PACK_01_TRANSFERABLE_PRESET_IDS.has(preset.id)) {
    return PACK_01_TRANSFERABLE_SCENE_ANCHORS[
      hashString(seed || `${preset.id}:transferable-anchor`) %
        PACK_01_TRANSFERABLE_SCENE_ANCHORS.length
    ];
  }
  if (preset && isPack02CartoonMediaPreset(pack, preset)) {
    const anchors = CATEGORY_SCENE_ANCHORS.pack_02__caricature_and_cartoon_styles;
    return anchors[hashString(seed || `${preset.id}:cartoon-anchor`) % anchors.length];
  }
  const key = styleCategoryImageKey(pack.id, category);
  const explicit = PACK_SCENE_ANCHORS[key] || CATEGORY_SCENE_ANCHORS[key];
  const source = explicit && explicit.length > 0 ? explicit : GENERIC_SCENE_ANCHORS;
  return source[hashString(seed || `${key}:anchor`) % source.length];
}

function presetMotif(preset: StyleRuntimePreset) {
  return PRESET_MOTIFS[hashString(`${preset.id}:${preset.name}`) % PRESET_MOTIFS.length];
}

function isPack02CartoonMediaPreset(pack: StyleRuntimePack, preset: StyleRuntimePreset) {
  const numericId = Number(preset.id.match(/^SP02-(\d+)$/)?.[1] || 0);
  return pack.id === 'pack_02' && numericId >= 81 && numericId <= 120;
}

function isPack02NonPortraitLightingPreset(pack: StyleRuntimePack, preset: StyleRuntimePreset) {
  return pack.id === 'pack_02' && ['SP02-079', 'SP02-080'].includes(preset.id);
}

function pack03LookdevSpecimenCue(preset: StyleRuntimePreset) {
  if (preset.id === 'SP03-002') {
    return 'UE5 real-time render card: one original Nanite-like hero form, creature fragment, environment fragment, or stylized character bust with Lumen bounce color, ray-shadow bands, volumetric blue-gold depth, and clustered microfacet panels; no lens, camera, aperture, device, showroom, software screenshot, UI, logo, readable text, or empty abstract-only tile field';
  }
  if (preset.id === 'SP03-003') {
    return 'Redshift biased GPU renderer card: one clean broadcast-ready 3D subject, stylized character/object, or motion-graphics hero form with caustic paths, photon-map precision, soft-shadow slabs, motion-blur ribbons, clean shader tiles, and out-of-core geometry bands; no interior, studio room, lamp, wall, curtain, camera, lens, device, showroom, UI, logo, readable text, or empty abstract-only card';
  }
  if (preset.id === 'SP03-004') {
    return 'Arnold feature-film path tracing card: one original cinematic 3D subject, creature fragment, character bust, or material hero form with ACES color, unclamped GI bounce, micro-displacement, layered materials, and volume scattering. Contact sheets, grids, UI, camera gear, showrooms, lamps, walls, or movie-set cues are only problems when they become repeated/default staging; keep the card representative, single-frame, readable, and not empty abstraction';
  }
  if (preset.id === 'SP03-005') {
    return 'Blender Cycles card: one creator-friendly 3D subject, character bust, creature/object fragment, or procedural material sculpture in a purposeful small scene, with Filmic highlight rolloff, Principled BSDF material variety, path-traced bounce, denoised GI, and node-like material cues translated as physical swatches rather than UI. A desk, wall, lamp, or room cue may appear if it supports creator-friendly Cycles craft; do not make a generic demo room or empty abstract tile';
  }
  if (preset.id === 'SP03-006') {
    return 'V-Ray ArchViz card: one habitable architectural fragment, interior corner, facade slice, or material-rich room moment with warm calibrated exposure, IES-like light behavior, adaptive dome softness, layered BRDF materials, straight-line clarity, and expensive catalog realism. Furniture, walls, windows, lamps, and architectural props are allowed when they serve the ArchViz read; do not repeat a generic showroom, hotel lobby, empty corridor, or lifestyle stock setup';
  }
  return undefined;
}

function pack02CartoonSpecimenCue(preset: StyleRuntimePreset) {
  if (preset.id === 'SP02-087') {
    return 'elastic black ink noodle loops, accordion bends, pie-cut graphic accents, smear arcs, and off-register cel paint shapes; no character body, face, limbs, feet, stage, or ground contact';
  }
  if (preset.id === 'SP02-088') {
    return 'jagged crayon triangles, uneven circles, waxy scribble pressure, construction-paper tooth, uncolored gaps, and raw mark energy; no monster body, teeth, eyes, limbs, floor, or shadow blob';
  }
  if (preset.id === 'SP02-089') {
    return 'abstract translucent wrapping, fiber-like cartoon linework, wet ink sheen, surgical fluorescent color bands, and interior-material pattern logic arranged as flat ribbons, blobs, and mesh cells only; no body, anatomy, organs, teeth, eyes, skin, gore, creature, puppet, animal, torso, legs, head, floor, or clinical room';
  }
  if (preset.id === 'SP02-090') {
    return 'spiky triangle fields, blade-like black contours, jagged hatch marks, toxic accent shards, and distressed zine-paper texture; no character, face, hair, speech bubble, skateboard, street, room, stage, or cast shadow';
  }
  if (preset.id === 'SP02-091') {
    return 'dry-erase marker loops, arrow fragments, ghost smears, colored marker strokes, glossy wipe marks, and diagram-like circles as abstract marks only; no whiteboard frame, office, meeting room, wall, fluorescent light, readable text, business diagram, stick figure, desk, or marker objects';
  }
  if (preset.id === 'SP02-092') {
    return 'crumpled-paper crease fields, ink pooling along fold valleys, torn-edge texture, stain-like abstract rings, graphite scuffs, and warped fiber marks only; no desk lamp, tabletop, coffee cup, notebook, trash scene, literal sketch subject, character, room, wall, floor, or cast shadow';
  }
  if (preset.id === 'SP02-093') {
    return 'ochre pigment strokes, charcoal scuffs, stencil-like negative shapes, mineral speckles, limestone-like grain translated into flat paper texture, and ancient mark rhythm only; no cave wall, cave room, torch, flame, stalactite, animal, hunter, handprint, spear, camera, lens, circular device, projector, machine, wall plane, floor, or narrative scene';
  }
  if (preset.id === 'SP02-094') {
    return 'kindergarten crayon geometry, wobbly separated circles, square-triangle fragments, lollipop-like dots, wax buildup, confident coloring mistakes, and simple symbolic marks only; no family members, people, house, sun corner, sky stripe, ground stripe, flowers, camera, projector, lens, robot face, device, room, wall, floor, or portrait scene';
  }
  if (preset.id === 'SP02-095') {
    return 'newsprint halftone fields, Ben-Day dot clusters, off-register CMYK edges, ink-smudge bands, simple ink outline fragments, and pulp-paper texture only; no large central circle, eye, lens, camera, projector, device, comic panels, panel grid, characters, model sheets, speech balloons, readable text, repeating background, breakfast table, room, or story scene';
  }
  if (preset.id === 'SP02-096') {
    return 'punk screenprint shards, slime-like abstract drips, thick black outline fragments, neon splatter bursts, overprint misregistration, gloss-like ink texture, and rebellious graphic energy only; no camera, projector, device silhouette, paired circles, rectangular body with cone, skateboard, deck shape, wheels, grip tape, maple board, skull, monster, bones, typography, street, parking lot, room, or product shot';
  }
  if (preset.id === 'SP02-097') {
    return 'uncanny corporate-vector shape language, too-smooth contour fragments, glossy plastic color blocks, symmetrical-but-wrong abstract forms, foam/fleece-like texture hints, and hollow brand-polish tension only; no mascot body, character, eyes, smile, thumbs-up, costume, person, logo, brand mark, product photo, room, studio, or approval pose';
  }
  if (preset.id === 'SP02-098') {
    return 'ballpoint-blue scratch marks, absorbent napkin-paper texture, fold lines, coffee-ring-like abstract stains, moisture warp, ink skips, rough arrow fragments, and loose improvised mark energy only; no radial schematic, circular blueprint, technical diagram, readable text, blueprint plan, invention, bar scene, cocktail, glass, table, napkin prop in a room, startup myth, device, or literal diagram';
  }
  if (preset.id === 'SP02-099') {
    return 'punk zine cut-and-paste abstract collage energy: torn xerox edges, tape-like flat strips, mismatched paper scraps, photocopy smears, ransom-note rhythm without letters, black-white-neon blocks only; no magazine on table, scissors, hands, desk, room, band poster, readable text, face, body, camera, device, wall, or literal zine object';
  }
  if (preset.id === 'SP02-100') {
    return 'flipbook rough-animation abstraction: onion-skin ghost offsets, repeated sketch contours, registration jitter, pencil test marks, page-edge rhythm, smeared timing arcs only; no book, hand flipping pages, desk, lamp, animator table, character, face, body, room, camera, projector, device, or literal animation studio';
  }
  if (preset.id === 'SP02-101') {
    return 'grossout cartoon material abstraction: swollen paint blobs, pore-like dots, wet ink sheen, wobbly folds, rash-red accents, greasy beige texture only; no face, mouth, teeth, gums, tongue, nose, eye, skin, body, creature, wound, gore, anatomy, room, lamp, camera, device, or literal close-up portrait';
  }
  if (preset.id === 'SP02-102') {
    return 'flat weird-comedy abstract shape language: separate sour pastel blocks, thin awkward contours, tiny panic scribbles, cheap digital fills, deadpan empty spacing only; no single head-like silhouette, profile, eye dot, mouth notch, nose shape, office, cubicle, hallway, desk, chair, lamp, wall-floor seam, worker, character, smiling face, prop, computer, phone, camera, or workplace scene';
  }
  if (preset.id === 'SP02-103') {
    return 'gross-kids slime-grime abstraction: lumpy asymmetrical blobs, sewer-water teal, slime green, pitted grime dots, rubbery curves, scuff dirt, grate-like stripe fragments only; no monster, child, creature, eyes, teeth, claws, body, sewer tunnel, junkyard, brick wall, trash bag, room, corridor, lamp, camera, or device';
  }
  if (preset.id === 'SP02-104') {
    return 'toddler-scale crayon panic abstraction: oversized soft pastel shapes, chunky uneven outlines, low-scale wobble marks, toy-box color blocks, nervous marker curves only; no toddler, child, diaper, toy, crib, nursery, home, carpeted room, furniture, lamp, wall-floor seam, prop, character, face, camera, or device';
  }
  if (preset.id === 'SP02-105') {
    return 'boiling-line scam-cartoon abstraction: vibrating contours, stretched smear shapes, sticky summer yellows, candy-red color as flat block only, frantic diagram energy without symbols, rough pencil boil only; no jawbreaker, candy, gadget, scheme board, map, money, character, face, body, suburban street, pavement scene, room, lamp, camera, or device';
  }
  if (preset.id === 'SP02-106') {
    return 'beige suburban anxiety abstraction: pastel discomfort, noodle panic marks, awkward consumer-like curves, wallpaper-cream flat fields, dusty teal and tired salmon blocks only; no suburb, house, living room, couch, appliance, furniture, brand label, readable text, character, face, body, room, wall-floor seam, lamp, camera, or device';
  }
  if (preset.id === 'SP02-107') {
    return 'rural nightmare pastel abstraction: dusty empty-space fields as flat color, tiny panic marks, moonlit blue blocks, alarm-red insert shapes, dry pastel grain only; no farmhouse, field, road, barn, pet, intruder, character, face, body, house silhouette, room, lamp, wall-floor seam, horizon, camera, or device';
  }
  if (preset.id === 'SP02-108') {
    return 'loud primary derangement abstraction: shouting red/yellow/blue blocks, thick crude contours, jagged comic bursts, rubbery scale mismatch, cheap poster-white gaps only; no cow, chicken, animal, sibling, mouth, teeth, tongue, limbs, body, character, hallway, room, furniture, prop, camera, or device';
  }
  if (preset.id === 'SP02-109') {
    return 'shared-form elastic abstraction: one long ribbon-like shape with two opposing color states, accordion compression, soft squash curves, muted 90s TV colors only; no cat, dog, animal, creature, head, face, eyes, mouth, limbs, body, anatomy, lawn, room, prop, camera, or device';
  }
  if (preset.id === 'SP02-110') {
    return 'gross-up freeze-frame texture abstraction: cheerful flat yellow-blue blocks interrupted by pore-like dots, wet gloss, sickly pink accents, greasy beige folds, macro texture patch only; no sponge, undersea prop, face, eyes, mouth, teeth, tongue, skin, body, creature, gore, room, camera, or device';
  }
  if (preset.id === 'SP02-111') {
    return 'dumb slouch geometry abstraction: sagging jagged contour blocks, cheap TV beige, nicotine yellow, washed denim blue, cathode-green accents, gravity-heavy diagonal shapes only; no couch, chair, teen, person, face, profile, overbite, neck, body, room, interior, clutter, fabric, lamp, camera, or device';
  }
  if (preset.id === 'SP02-112') {
    return 'office-boredom sketch abstraction: dry beige geometric blocks, copy-paper white fields, tiny awkward gesture marks, muted toner-black lines, boxy rhythm only; no office, cubicle, desk, paperwork, tie, face, person, body, chair, carpet, fluorescent fixture, room, wall-floor seam, logo, readable text, camera, or device';
  }
  if (preset.id === 'SP02-113') {
    return 'toxic suburb satire abstraction: lopsided polluted color fields, malformed contour fragments, grime speckles, cheap tan and landfill green blocks only; no family, person, body, face, suburb, house, trailer, yard, fence, street, trash pile, smokestack, room, wall, lamp, camera, or device';
  }
  if (preset.id === 'SP02-114') {
    return 'squigglevision therapy-doodle style language: one simple original wobbly doodle figure, nervous shape mascot, or trembling silhouette with separated line-boil contours, muted beige/teal/salmon fields, and anxious empty spacing; no therapist, patient, realistic person, portrait head, face-screen, TV set, monitor, phone, camera, microphone, stage, couch, chair, office, therapy room, desk, wall, lamp, window, readable text, or device';
  }
  if (preset.id === 'SP02-115') {
    return 'marker-edge improvised sitcom abstraction: dry felt-tip contour fragments, awkward pause spacing, school-paper beige fields, muted primary marker blocks only; no kid, person, face, pose, school project, suburban room, couch, chair, desk, wall, lamp, notebook, camera, phone, or device';
  }
  if (preset.id === 'SP02-116') {
    return 'notebook anxiety cartoon abstraction: soft marker fields, margin-like drift lines, diary-doodle contours, teal/purple/peach blocks only; no notebook object, page, school, neighborhood, kid, person, face, body, desk, pencil, prop, social scene, wall, lamp, camera, or device';
  }
  if (preset.id === 'SP02-117') {
    return 'photo-cutout menace abstraction: xerox black-white fragments, scissor-cut edges, mismatched paste-up seams, dirty grey toner shadows only; no face, head, body, person, schoolyard, yearbook, revenge scene, paper doll, puppet, room, wall, desk, camera, phone, or device';
  }
  if (preset.id === 'SP02-118') {
    return 'garbage-pail crash-zoom abstraction: sticker-card primaries as color fields, separated goo-like abstract drips, swollen defect marks, cheap halftone edges only; no kid, body, face, mouth, teeth, skin, bodily-function scene, trading-card border, readable text, sticker object, die-cut sticker outline, white product outline, single central product silhouette, room, camera, or device';
  }
  if (preset.id === 'SP02-119') {
    return 'public-pool mucus doodle abstraction: chlorine green slime marks, wet turquoise blobs, sticky yellow heat bands, crooked marker curves only; no pool, monster, creature, body, face, eyes, mouth, teeth, diving board, flip-flop object, summer prop, room, wall, camera, or device';
  }
  if (preset.id === 'SP02-120') {
    return 'toxic marker freakout abstraction: permanent-marker scratches, malformed margin contours, red correction slashes, highlighter yellow blocks only; no classroom, student, desk, page, notebook object, lesson, monster, body, face, readable rude text, symbol words, room, wall, lamp, camera, or device';
  }
  return 'one abstract style specimen made from flat shape fragments, line behavior, texture marks, and color fields; no literal title object, person, body, room, floor, or prop';
}

function softenPack02CartoonSpecimenCue(cue: string) {
  return cue
    .replace(/\babstraction\b/gi, 'style language')
    .replace(/\babstract\b/gi, 'graphic')
    .replace(
      /\s+only; no [^.]+$/i,
      '; avoid literal title scenes and repeated filler, but keep one readable original anchor',
    )
    .replace(
      /; no [^.]+$/i,
      '; avoid literal title scenes and repeated filler, but keep one readable original anchor',
    );
}

function pack02CartoonSafeStyleLabel(preset: StyleRuntimePreset) {
  if (preset.id === 'SP02-087') return 'RUBBER-HOSE ELASTIC MOTION';
  if (preset.id === 'SP02-088') return 'CRUDE CRAYON MARK-MAKING';
  if (preset.id === 'SP02-089') return 'GROTESQUE CARTOON MATERIAL TEXTURE';
  if (preset.id === 'SP02-090') return 'SPIKY ANGULAR CARTOON GRAPHICS';
  if (preset.id === 'SP02-091') return 'DRY-ERASE ABSTRACT MARKS';
  if (preset.id === 'SP02-092') return 'CRUMPLED PAPER ABSTRACT TEXTURE';
  if (preset.id === 'SP02-093') return 'OCHRE MINERAL ABSTRACT MARKS';
  if (preset.id === 'SP02-094') return 'KINDERGARTEN CRAYON GEOMETRY';
  if (preset.id === 'SP02-095') return 'NEWSPRINT HALFTONE ABSTRACT PRINT';
  if (preset.id === 'SP02-096') return 'PUNK SCREENPRINT ABSTRACT GRAPHICS';
  if (preset.id === 'SP02-097') return 'UNCANNY CORPORATE VECTOR ABSTRACT';
  if (preset.id === 'SP02-098') return 'NAPKIN BALLPOINT ABSTRACT MARKS';
  if (preset.id === 'SP02-099') return 'PUNK ZINE ABSTRACT COLLAGE';
  if (preset.id === 'SP02-100') return 'FLIPBOOK ROUGH MOTION MARKS';
  if (preset.id === 'SP02-101') return 'GROSSOUT MATERIAL ABSTRACT';
  if (preset.id === 'SP02-102') return 'FLAT WEIRD COMEDY ABSTRACT';
  if (preset.id === 'SP02-103') return 'SLIME-GRIME ABSTRACT CARTOON';
  if (preset.id === 'SP02-104') return 'TODDLER-SCALE CRAYON ABSTRACT';
  if (preset.id === 'SP02-105') return 'BOILING-LINE SCAM ABSTRACT';
  if (preset.id === 'SP02-106') return 'BEIGE ANXIETY ABSTRACT';
  if (preset.id === 'SP02-107') return 'RURAL NIGHTMARE PASTEL ABSTRACT';
  if (preset.id === 'SP02-108') return 'LOUD PRIMARY ABSTRACT DERANGEMENT';
  if (preset.id === 'SP02-109') return 'SHARED-FORM ELASTIC ABSTRACT';
  if (preset.id === 'SP02-110') return 'GROSS-UP TEXTURE ABSTRACT';
  if (preset.id === 'SP02-111') return 'SLOUCH GEOMETRY ABSTRACT';
  if (preset.id === 'SP02-112') return 'OFFICE-BOREDOM GEOMETRY ABSTRACT';
  if (preset.id === 'SP02-113') return 'TOXIC SUBURB COLOR ABSTRACTION';
  if (preset.id === 'SP02-114') return 'SQUIGGLEVISION LINE-BOIL ABSTRACT';
  if (preset.id === 'SP02-115') return 'MARKER-EDGE SITCOM ABSTRACT';
  if (preset.id === 'SP02-116') return 'NOTEBOOK ANXIETY MARKS ABSTRACT';
  if (preset.id === 'SP02-117') return 'PHOTO-CUTOUT XEROX ABSTRACT';
  if (preset.id === 'SP02-118') return 'GARBAGE-PAIL STICKER ABSTRACT';
  if (preset.id === 'SP02-119') return 'CHLORINE SLIME DOODLE ABSTRACT';
  if (preset.id === 'SP02-120') return 'TOXIC MARKER FREAKOUT ABSTRACT';
  return sanitizeStylePromptName(preset.name).toUpperCase();
}

function pack02CartoonCardStyleLabel(preset: StyleRuntimePreset) {
  return pack02CartoonSafeStyleLabel(preset)
    .replace(/\s+ABSTRACTION\b/g, '')
    .replace(/\s+ABSTRACT\b/g, '')
    .replace(/\s+ONLY\b/g, '')
    .trim();
}

function safeImagegenStyleLabel(preset: StyleRuntimePreset) {
  const labels: Record<string, string> = {
    'SP05-091': 'GLOWING VIRTUAL FANTASY ADVENTURE',
    'SP05-092': 'RESET LOOP ORNATE DARK FANTASY',
    'SP05-093': 'WANDERING MAGE CHRONICLE FANTASY',
    'SP05-094': 'PARTY QUEST COMEDY FANTASY',
    'SP05-095': 'AFTERQUEST MELANCHOLY FANTASY',
    'SP05-096': 'HYPER SATURATED STRATEGY FANTASY',
    'SP05-097': 'DARK DOMINION BAROQUE FANTASY',
    'SP05-098': 'OPTIMISTIC CIVIC MONSTER FANTASY',
    'SP05-099': 'DEFENSIVE UNDERDOG FANTASY',
    'SP05-100': 'LUMINOUS ASCENT FANTASY',
    'SP05-121': 'LANTERN ELEMENTAL MOTION ANIME',
    'SP05-122': 'GRIMY CONTRACT PANIC ACTION',
    'SP05-123': 'CEREMONIAL INFERNO ACTION',
    'SP05-124': 'PREDATOR EGO SPORTS INTENSITY',
    'SP05-125': 'CIVIC COLOSSAL RESPONSE ACTION',
    'SP05-126': 'PARANORMAL TURBO COMEDY ACTION',
    'SP05-127': 'POISON GARDEN CEREMONIAL HORROR',
    'SP05-128': 'BLACK INK MARBLE SPIRITUAL OPERA',
    'SP05-129': 'DEADPAN PRESTIGE IMPACT SATIRE',
    'SP05-130': 'PSYCHIC PAINT SURGE EMOTION',
    'SP05-131': 'NEON STREETWIND PROTECTOR RUSH',
    'SP05-132': 'VIOLET SHADOW ASCENSION RAID',
    'SP05-133': 'DEADPAN MAGIC FORCE COMEDY',
    'SP05-134': 'MUNDANE ACTION VELOCITY GRID',
    'SP05-135': 'RULE LOGIC CHAOTIC IMPACT',
    'SP05-136': 'GRIMOIRE THUNDER UNDERDOG FORCE',
    'SP05-137': 'SCIENCE BLUEPRINT OPTIMISM',
    'SP05-138': 'NEON RAIN OATH RESTRAINT',
    'SP05-139': 'COLOSSAL RUPTURE SCALE DREAD',
    'SP05-140': 'ANCIENT CALM SPELL IMPACT',
    'SP05-142': 'HUMID TROPICAL NOIR GRIT',
    'SP05-143': 'ELECTRIC NIGHT RAIN NOIR',
    'SP05-144': 'LO FI SUNBAKED RHYTHM',
    'SP05-148': 'JAZZ PULP MOTION ENSEMBLE',
    'SP05-221': 'POP SIGNAL ENGINEERED MOTION',
    'SP05-222': 'CIVIC MACHINE PROCEDURE',
    'SP05-223': 'CHROME NOIR ARMOR ELEGANCE',
    'SP05-224': 'CERAMIC ARCOLOGY CONTROL GEOMETRY',
    'SP05-225': 'SCRAP VELOCITY RESILIENCE',
    'SP05-226': 'CYBER GOTH CONCRETE DREAD',
    'SP05-227': 'RUST WIRE DESCENT PRESSURE',
    'SP05-229': 'PUNITIVE NEON VICE TEXTURE',
    'SP05-230': 'TERMINAL MEGASTRUCTURE SILENCE',
    'SP05-228': 'PALE MACHINE ELEGY',
    'SP05-231': 'CORAL RESONANCE LITURGY',
    'SP05-232': 'DUSTFRONT DRONE LAMENT',
    'SP05-233': 'VACUUM FORTRESS SURVIVAL DISCIPLINE',
    'SP05-234': 'EXTINCTION COMMAND PRESSURE',
    'SP05-235': 'POP CYBER SIMULATION GLOSS',
    'SP05-236': 'COMPACT ATTRITION HARDWARE',
    'SP05-237': 'MONUMENTAL IGNITION SACRIFICE',
    'SP05-238': 'TOKUSATSU DIGITAL GRID SCALE',
    'SP05-240': 'TRI FIRE RIOT GEOMETRY',
    'SP05-241': 'SYSTEMIC COOPERATION GRID FANTASY',
    'SP05-242': 'SMOKE MUD VULNERABILITY FANTASY',
    'SP05-239': 'BUBBLEGUM COSMIC SCALE',
    'SP05-243': 'CLASSIC OVA QUEST TAPESTRY FANTASY',
    'SP05-244': 'JADE CINNABAR RITUAL AUTHORITY FANTASY',
    'SP05-245': 'WINDBLOWN PROPHECY ROMANCE FANTASY',
    'SP05-246': 'AMBER TURQUOISE ARABESQUE ADVENTURE',
    'SP05-247': 'THORN COTTAGE OCCULT ENCHANTMENT',
    'SP05-248': 'FUNCTIONAL FANTASY CUISINE',
    'SP05-249': 'PRINTING PRESS DEVOTION CRAFT',
    'SP05-250': 'QUIET VOW SACRED STONE FANTASY',
    'SP05-251': 'AERIAL WAR MAGE DOCTRINE',
    'SP05-255': 'GEM ENGINE COOPERATIVE MAGIC FANTASY',
    'SP05-256': 'FOLKLORE THRESHOLD ROMANCE',
    'SP05-252': 'MERCHANT ROAD COMFORT FANTASY',
    'SP05-253': 'HERBARIUM COURT HEALING FANTASY',
    'SP05-254': 'CELESTIAL ROMANCE OMEN FANTASY',
    'SP05-257': 'MOONLIT PRACTICAL DIPLOMACY FANTASY',
    'SP05-258': 'UTILITY CRAFT PARTY QUEST FANTASY',
    'SP05-259': 'STORYBOOK COURAGE CROWN FANTASY',
    'SP05-260': 'PASTEL COMPANION QUEST FANTASY',
    'SP05-261': 'ECLIPSE SCAR WEIGHT',
    'SP05-262': 'QUIET MORAL SUSPENSE REALISM',
    'SP05-263': 'BLACK SIGNAL NIHILISM',
    'SP05-264': 'CLINICAL INNOCENCE RUPTURE',
    'SP05-265': 'ROSE BLACK LACQUER GOTHIC ROMANCE',
    'SP05-266': 'BLACK PARTICLE FUGITIVE TENSION',
    'SP05-267': 'BLOOD INK SEVERANCE RHYTHM',
    'SP05-268': 'NEON DESPAIR PRESSURE',
    'SP05-269': 'SMOKE FILLED CALCULATION',
    'SP05-270': 'CURSED SEVERANCE COMPASSION',
    'SP05-271': 'SUN BLEACHED CONCRETE MYSTERY',
    'SP05-272': 'RAIN POLISHED MACHINE MOURNING',
    'SP05-273': 'MOONLIT ECOLOGICAL CALM',
    'SP05-274': 'WINTER GUILT SUSPICION',
    'SP05-275': 'CIVIC RUMOR BREAKDOWN',
    'SP05-276': 'SUN BLEACHED CRUEL DISCIPLINE',
    'SP05-277': 'RUSTED NEON ADOLESCENT DREAD',
    'SP05-278': 'CRYSTALLINE LONELINESS MINERAL VOID',
    'SP05-279': 'RED OPTIC SECURITY NOIR',
    'SP05-280': 'LANTERN RETRIBUTION RITUAL',
    'SP13-021': 'ACTION BURST RUSH FORCE',
    'SP13-022': 'VERTIGO ENERGY CROSS FORCE',
    'SP13-023': 'NEON VECTOR DISCHARGE',
    'SP13-024': 'MONUMENTAL IMPACT BURST',
    'SP13-025': 'UPWARD THUNDER MOMENTUM',
  };
  return labels[preset.id] ?? sanitizeStylePromptName(preset.name).toUpperCase();
}

function safeImagegenStyleDna(preset: StyleRuntimePreset) {
  const dna: Record<
    string,
    {
      aesthetic: string;
      subject: string;
      color: string;
      light: string;
      texture: string;
      camera: string;
      mood: string;
      render: string;
      features: string;
    }
  > = {
    'SP05-091': {
      aesthetic:
        'Glowing virtual fantasy with crystalline atmosphere, polished adventure scale, soft romance, and tactile digital light',
      subject:
        'Clean fantasy contours, translucent luminous arcs, modular edge highlights, and readable original silhouettes or relics',
      color: 'Sky sapphire, cyan, warm amber, emerald glow, white bloom, and deep virtual blue',
      light:
        'Atmospheric depth haze, soft rim auras, crystalline light planes, and luminous edge bloom',
      texture:
        'Glassy overlays, polished cel surfaces, fine particles, synthetic fabric sheen, and smooth light gradients',
      camera:
        'Layered depth, suspended luminous planes, and horizon expansion that feels software-shaped',
      mood: 'Adventurous, virtual, epic, romantic',
      render: 'Expansive digital-fantasy anime polish with high clarity and clean compositing',
      features: 'Virtual glow, clean adventure polish, synthetic depth, emotional immersion',
    },
    'SP05-092': {
      aesthetic:
        'Ornate reset-loop dark fantasy with beautiful repetition, cold glow, and emotional pressure',
      subject:
        'Elegant fantasy contours, spiral repeats, stress-fracture accents, and tightening visual rhythms',
      color:
        'Icy violet, pale silver, bruised blue, candle amber, deep burgundy, and shadowed ivory',
      light:
        'Beautiful surface glow with dread beneath it, cold rim halos, and looping highlight echoes',
      texture:
        'Fine fabric grain, carved ornament, paper-thin magic particles, damp shadow glaze, and polished despair',
      camera: 'Spiral compression, deja-vu repetition, and ornamental depth closing inward',
      mood: 'Anxious, tragic, harrowing, relentless',
      render:
        'High-polish fantasy anime with psychological tension and controlled emotional breakdown',
      features: 'Recursive fate, spiral dread, fragile hope, ornate emotional pressure',
    },
    'SP05-093': {
      aesthetic:
        'Wandering mage chronicle with patient world texture, learned magic, natural wonder, and mature travel curiosity',
      subject:
        'Soft fantasy linework, practical ornament, maplike flow lines, layered detail zones, and calm exploratory rhythm',
      color:
        'Weathered sky blue, warm ochre, moss green, parchment cream, mineral violet, and soft mana glow',
      light:
        'Long-horizon daylight, warm ambient bounce, gentle spell glows, and atmospheric depth',
      texture:
        'Parchment grain, woven cloth, weathered leather, mineral dust, soft particles, and painted terrain color',
      camera:
        'Maplike expansion, slow parallax depth, and open composition that rewards looking around',
      mood: 'Curious, expansive, wondrous, immersive',
      render: 'Expansive but intimate fantasy anime polish with rich cultural texture',
      features: 'Learned magic, lived-in texture, soft horizon depth, world curiosity',
    },
    'SP05-094': {
      aesthetic:
        'Bright party-quest comedy with parody fantasy, theatrical mishap timing, and joyful failure',
      subject:
        'Bouncy contours, exaggerated reaction shapes, clean fantasy trims, and elastic timing accents',
      color:
        'Aqua blue, sunny gold, rosy blush, carnival green, comic violet, and warm amber notes',
      light:
        'Cheerful high-key glow, sudden gag flashes, soft magical bloom, and clean readable contrast',
      texture:
        'Polished cel surfaces, fluffy effect puffs, glossy magical sparks, and bright comedic overlays',
      camera: 'Small perspective exaggerations, reaction zooms, and anticlimax framing',
      mood: 'Comedic, chaotic, irreverent, satirical',
      render: 'Clean comedy-fantasy anime finish with expressive timing and controlled chaos',
      features: 'Parody brightness, elastic failure, gag-timed magic, cheerful disorder',
    },
    'SP05-095': {
      aesthetic:
        'Afterquest melancholy fantasy with quiet post-heroic light, long memory, restrained spellcraft, and time-softened grief',
      subject:
        'Gentle contours, delicate trim, small gesture emphasis, wide breathing spaces, and low-conflict silhouettes',
      color:
        'Pale sky blue, sage green, soft wheat gold, faded violet, pearl white, and warm memory amber',
      light:
        'Diffuse morning light, slow rim glow, transparent magical motes, and subtle shifts that make time visible',
      texture:
        'Soft cloth grain, weathered parchment, grasslike brush texture, translucent particles, and watercolor cel softness',
      camera: 'Open breathing room, postcard stillness, and time-depth layering through light',
      mood: 'Reflective, serene, melancholic, timeless',
      render: 'Serene fantasy anime finish with high restraint and lyrical clarity',
      features: 'Post-heroic quiet, memory light, soft horizon, gentle spellcraft',
    },
    'SP05-096': {
      aesthetic:
        'Hyper-saturated strategy fantasy with candy-neon logic, theatrical confidence, impossible geometry, and rule-like space',
      subject:
        'Crisp decorative contours, grid-aware diagonals, playful scale shifts, geometric overlays, and theatrical rhythm',
      color:
        'Electric magenta, cyan candy, saturated violet, acid yellow, luminous peach, and impossible sky blue',
      light:
        'Overbright neon wash, prismatic rim bands, luminous grid bounce, and deliberate bloom',
      texture:
        'Glossy cel polish, glassy surfaces, holographic gradients, candy plastic sheen, and sharp geometric overlays',
      camera:
        'Boardlike planes, impossible perspective folds, floating rule geometry, and controlled elasticity',
      mood: 'Strategic, dazzling, hyper, confident',
      render:
        'Ultra-clean anime finish with maximal saturation, strategic clarity, and surreal confidence',
      features:
        'Candy-neon grids, rule-logic spectacle, overconfident saturation, geometric theater',
    },
    'SP05-121': {
      aesthetic:
        'Lantern elemental motion with patterned tenderness, breathlike luminous arcs, and elegant tragedy',
      subject:
        'Razor-clean contours, ribboned motion trails, patterned shape blocks, ceremonial pauses, and flow lines',
      color:
        'Lantern amber, winter blue, deep crimson accents, charcoal black, snow white, and vivid elemental tones',
      light:
        'Warm lantern glow against cold mist, precise rim cuts, soft memory bloom, and arc highlights',
      texture:
        'Woven pattern grain, ink-wash mist, polished cel edges, snowlike particles, and luminous trails',
      camera:
        'Curved motion space, expanded depth, and choreographic foreshortening that frames motion as dance',
      mood: 'Heroic, tragic, elegant, intense',
      render: 'Premium modern anime action polish with ornamental clarity and emotional pauses',
      features:
        'Breathlike arcs, patterned emotion, lantern warmth, winter contrast, choreographic motion',
    },
    'SP05-122': {
      aesthetic:
        'Grimy contract-panic action with industrial fatigue, deadpan panic, and jagged absurdity',
      subject:
        'Jagged contours, broken impact strokes, exhausted rhythm, industrial diagonals, and unstable comic timing',
      color:
        'Grease black, muted red, sickly yellow, concrete gray, rust orange, and harsh fluorescent green',
      light:
        'Hard fluorescent glare, dirty rim light, overcast industrial bounce, and bleak shadow compression',
      texture:
        'Grease, concrete dust, rust, torn paper, hard cel edges, and worn industrial surfaces',
      camera: 'Unstable diagonals, compressed street-scale depth, and abrupt cropped motion',
      mood: 'Desperate, absurd, grimy, exhausted',
      render: 'Modern gritty anime polish with rough texture and readable chaos',
      features: 'Industrial grime, burnout, deadpan panic, jagged motion',
    },
  };
  return dna[preset.id];
}

function pack02CartoonSafeStyleDna(preset: StyleRuntimePreset) {
  if (preset.id === 'SP02-089') {
    return {
      aesthetic:
        'Non-graphic grotesque cartoon material texture, translucent wrapping, wet ink sheen, fiber-like abstract lines, surgical fluorescent palette, and no anatomy or creature subject',
      subject:
        'Abstract mark cluster and flat material pattern only, with no body-like silhouette, face, head, limbs, torso, legs, organs, teeth, eyes, skin, puppet, animal, person, creature, or room',
      color:
        'Raw red, surgical pink, vein-blue, jaundice yellow, pus-green, bruise purple used as abstract ink and color bands, not literal flesh',
      light:
        'Flat graphic fluorescence and wet-ink highlights only, no clinical room, lamp, overhead fixture, floor, or cast shadow',
      texture:
        'Cartoon fiber marks, translucent overlay shapes, glossy ink strokes, paper tooth, and broad texture fields; non-graphic, no gore',
      camera:
        'Flat poster composition with floating ribbons, blobs, and mesh cells; no perspective, no environment, no body framing, no creature silhouette',
      mood: 'Uncomfortable and weird through material treatment only, not through anatomy, injury, or character horror',
      render:
        'Graphic cartoon texture card with readable abstract forms and restrained denoised detail',
      features:
        'Translucent wrapping shapes, fiber-like linework, wet sheen, surgical color, mesh cells, stretch marks as abstract design motifs only',
    };
  }
  if (preset.id === 'SP02-090') {
    return {
      aesthetic:
        'Aggressively angular cartoon graphics, spiky triangle fields, heavy black outlines, toxic accent colors, distressed zine texture',
      subject:
        'Abstract shards and jagged silhouettes only, no character, face, hair, body, speech bubble, skateboard, street, room, or prop',
      color:
        'Black-heavy palette with blood red, acid green, toxic yellow, and bruised purple accents',
      light:
        'Flat graphic contrast and ink weight only, no realistic under-lighting, floor shadow, lamp, or stage',
      texture: 'Scratchy ink, marker bleed, photocopy grain, distressed cheap-paper surface',
      camera:
        'Poster-flat composition of floating angular marks with no perspective or scene depth',
      mood: 'Rebellious tension carried by jagged rhythm and color clash, not by a teen character or location',
      render: 'Underground zine-style abstract graphic card, bold and readable at thumbnail size',
      features:
        'Blade contours, triangular bursts, jagged hatching, toxic accents, black graphic massing',
    };
  }
  if (preset.id === 'SP02-091') {
    return {
      aesthetic:
        'Dry-erase abstract mark language: squeaky marker strokes, wipe ghosts, colored arrows, diagram circles, glossy smears, no office or board fixture',
      subject:
        'Abstract marker marks and ghost trails only, no whiteboard frame, office, meeting room, wall, business diagram, stick figure, desk, text, or marker object',
      color: 'Expo blue, red, green, black, faded pink, and smudge grey as broad abstract strokes',
      light:
        'Flat glossy surface sheen only, no fluorescent overhead, lamp, fixture, wall reflection, or room lighting',
      texture:
        'Wipe smears, dry marker residue, glossy streaks, eraser ghost trails, and abstract marker grain',
      camera:
        'Flat poster composition of floating marks on a full-bleed glossy white field, no perspective or room context',
      mood: 'Improvised and absurd through mark rhythm only, not through office satire, people, or location',
      render: 'Abstract dry-erase style-card with no readable text and no literal diagram content',
      features:
        'Marker loops, arrow fragments, ghost trails, circles, colored dry-erase strokes, glossy residue',
    };
  }
  if (preset.id === 'SP02-092') {
    return {
      aesthetic:
        'Crumpled-paper abstract texture, crease faults, ink pooling, torn edges, stains, warped fibers, recovered sketch surface without still-life props',
      subject:
        'Abstract paper damage and mark texture only, no desk lamp, tabletop, coffee cup, notebook, trash, character, object scene, room, wall, or floor',
      color:
        'Stained beige, sepia, ballpoint blue, graphite grey, highlighter yellow, and tea-brown as texture fields',
      light:
        'Flat scan-like paper visibility only, no desk-lamp warmth, side-light, cast shadow, tabletop, or room lighting',
      texture:
        'Deep crease lines, fold valleys, ink bleed, torn fiber edges, stain rings, paper tooth, warped surface',
      camera:
        'Full-bleed paper surface, no perspective, no tabletop, no object arrangement, no literal sketch subject',
      mood: 'Melancholy imperfection carried by surface damage, not by narrative rejection, desk scene, or props',
      render:
        'Abstract crumpled-paper style-card with broad readable folds and restrained denoised detail',
      features:
        'Crease lines, ink pooling, torn edges, stains, warped fibers, interrupted abstract contour marks',
    };
  }
  if (preset.id === 'SP02-093') {
    return {
      aesthetic:
        'Ochre mineral abstract mark language: crude pigment strokes, charcoal roughness, stencil-like negative shapes, mineral speckles, no literal cave scene',
      subject:
        'Abstract pigment marks and mineral texture only, no cave wall, cave room, torch, flame, stalactite, animal, hunter, handprint, spear, camera, lens, circular device, projector, wall plane, floor, or story scene',
      color:
        'Ochre red, charcoal black, bone ash white, clay brown, iron oxide rust as flat abstract pigment fields',
      light:
        'Flat graphic pigment contrast only, no torchlight, flame glow, cave shadow, wall illumination, or environment lighting',
      texture:
        'Rough mineral grain translated as paper/print texture, pigment dust, charcoal scuffs, stencil edges, broad denoised marks',
      camera:
        'Full-bleed flat graphic surface, no perspective, no cave depth, no wall/floor orientation, no framed artifact, no camera/lens-like circular center',
      mood: 'Ancient and primal through mineral mark treatment, not through cave narrative, animals, hunters, or ritual scene',
      render:
        'Abstract mineral-pigment style-card with readable large marks and no literal location',
      features:
        'Ochre strokes, charcoal roughness, irregular stencil-like shapes, mineral speckles, crude pre-perspective rhythm, asymmetrical non-device layout',
    };
  }
  if (preset.id === 'SP02-094') {
    return {
      aesthetic:
        'Kindergarten crayon geometry: wobbly symbolic shapes, wax buildup, heavy pressure, simple color-box palette, no family portrait subject',
      subject:
        'Abstract childlike crayon marks and geometry only, no people, family members, house, sun corner, sky stripe, ground stripe, flowers, camera, projector, lens, robot face, device, room, wall, floor, or portrait scene',
      color:
        'Sun yellow, sky blue, grass green, peach, pink, brown, and bright crayon-box colors used as abstract blocks and marks',
      light:
        'No lighting logic, flat crayon fill only, no shadows, no sun symbol, no room light, no horizon',
      texture:
        'Construction-paper tooth, crayon wax clumps, pressure dents, coloring outside lines, mixed-brand crayon texture',
      camera:
        'Full-bleed flat paper composition with floating naive geometry, no scene layout, no sky/ground bands, no paired eye-like circles, no camera/projector silhouette',
      mood: 'Proudly naive and sincere through mark-making only, not through literal family, house, child, or refrigerator scene',
      render:
        'Abstract kindergarten crayon style-card, broad readable symbols, restrained denoised texture',
      features:
        'Separated wobbly circles, square-triangle fragments, lollipop dots, heavy crayon pressure, confident mistakes, asymmetrical non-device layout',
    };
  }
  if (preset.id === 'SP02-095') {
    return {
      aesthetic:
        'Newsprint halftone abstract print language: Ben-Day dots, off-register CMYK, ink bleed, pulp-paper tooth, no comic strip scene',
      subject:
        'Abstract print marks and halftone fields only, no large central circle, eye, lens, camera, projector, device, comic panels, panel grid, characters, model sheets, speech balloons, readable text, repeating background, breakfast table, room, or narrative scene',
      color:
        'Limited CMYK dot palette, newsprint off-white, ink-smudge grey, registration-error cyan and magenta as abstract print fields',
      light:
        'Flat print surface only, no lighting, no shadow blobs, no panel depth, no room context',
      texture:
        'Newsprint tooth, halftone dots, ink bleed, off-registration edges, pulp-paper grain, broad denoised print texture',
      camera:
        'Full-bleed flat print composition, no panel boxes, no comic gutters, no character framing, no scene layout, no lens-like focal circle',
      mood: 'Familiar and disposable through print texture and dot rhythm, not through gag narrative or recurring characters',
      render:
        'Abstract Sunday-funnies-inspired print card without text, panels, characters, or story beats',
      features:
        'Ben-Day dots, CMYK misregistration, broken ink fragments, smudge bands, newsprint tone, pulp texture, asymmetric non-device layout',
    };
  }
  if (preset.id === 'SP02-096') {
    return {
      aesthetic:
        'Punk screenprint abstract graphics: neon slime-like drips, thick black fragments, splatter bursts, distressed overprint, no literal skateboard deck',
      subject:
        'Abstract screenprint marks only, no camera, projector, device silhouette, paired circles, rectangular body with cone, skateboard, deck shape, wheels, grip tape, maple board, skull, monster, bones, typography, street, parking lot, room, or product shot',
      color:
        'Neon green, blood red, toxic yellow, black void, radioactive purple, bone white, overprint cyan as abstract color blocks',
      light:
        'Flat graphic ink contrast only, no gloss-varnish product reflection, no studio light, no atmospheric depth',
      texture:
        'Screenprint ink, distressed stencil edges, splatter, overprint grain, rough paper/print texture, no board material',
      camera:
        'Full-bleed poster-flat graphic composition, no deck silhouette, no product angle, no wall-mounted object, no camera/projector-like composition',
      mood: 'Rebellious through color clash, drips, and black-outline aggression, not through skateboard object or street scene',
      render:
        'Abstract punk screenprint card with bold readable shapes and restrained denoised texture',
      features:
        'Slime-like abstract drips, thick black broken outlines, neon shards, splatter bursts, overprint texture, stencil edges, asymmetric non-device layout',
    };
  }
  if (preset.id === 'SP02-097') {
    return {
      aesthetic:
        'Uncanny corporate-vector abstract polish: too-smooth contours, glossy plastic color blocks, symmetrical tension, costume-material hints without a mascot',
      subject:
        'Abstract vector forms only, no mascot body, character, eyes, smile, thumbs-up, costume, person, logo, brand mark, product photo, room, studio, or approval pose',
      color:
        'Corporate primary blue and red, bright yellow, sterile white, peach, glossy green as abstract vector blocks',
      light:
        'Flat vector gloss and plastic-like highlights only, no product-photography studio, no shadowless room, no atmospheric setup',
      texture:
        'Glossy vector surface, subtle foam/fleece hints, sterile plastic polish, no actual costume or body material',
      camera:
        'Full-bleed flat graphic composition, no mascot framing, no character pose, no studio product angle',
      mood: 'Wrong corporate cheer through inappropriate polish and symmetry, not through eyes, smile, mascot body, or brand parody',
      render:
        'Abstract rejected-mascot-inspired card without brands, people, logos, text, or character subject',
      features:
        'Too-smooth contours, glossy blocks, seam-like abstract lines, sterile primary colors, uncanny symmetry fragments',
    };
  }
  if (preset.id === 'SP02-098') {
    return {
      aesthetic:
        'Napkin ballpoint abstract marks: absorbent paper bleed, coffee-ring stains, fold lines, moisture warp, urgent schematic energy without a real blueprint',
      subject:
        'Abstract ballpoint marks and napkin texture only, no radial schematic, circular blueprint, technical diagram, readable text, blueprint plan, invention, bar, cocktail, glass, table, device, napkin prop in a room, or literal diagram',
      color:
        'Ballpoint blue, napkin tan, sepia stains, moisture-darkened halos, faint neon tint as abstract surface color',
      light:
        'Flat scan-like paper visibility only, no overhead bulb, bar light, side light, cast shadow, table, or room lighting',
      texture:
        'Soft-ply napkin fibers, ink bleed, coffee rings, moisture warp, crinkle folds, scratchy pen skips',
      camera:
        'Full-bleed paper surface, no tabletop, no prop arrangement, no room perspective, no blueprint document layout, no circular central diagram',
      mood: 'Urgent and improvised through line pressure and surface damage, not through startup narrative, bar scene, or invention prop',
      render:
        'Abstract napkin-scribble style-card, no readable text, no CAD plan, no circular schematic, no literal object diagram',
      features:
        'Ballpoint skips, fold lines, ink pools, coffee-ring stains, rough arrow fragments, absorbent paper bleed, loose non-technical asymmetry',
    };
  }
  if (preset.id === 'SP02-099') {
    return {
      aesthetic:
        'Punk zine abstract collage: torn xerox scraps, tape-like flat strips, photocopy smears, high-contrast cut edges, neon overprint, no literal publication scene',
      subject:
        'Abstract collage fragments only, no magazine, booklet, page spread, table, desk, scissors, glue stick, hands, face, body, band poster, room, wall, camera, phone, device, readable text, or ransom letters',
      color:
        'Photocopy black, paper white, dirty grey, hot pink, safety orange, acid green, and cyan as flat pasted blocks',
      light:
        'Flat scan-like graphic contrast only, no desk lamp, overhead light, wall shadow, tabletop shadow, or room lighting',
      texture:
        'Xerox grain, torn paper fiber, tape-strip translucency as flat shapes, misregistered print, ink smears, rough cut edges',
      camera:
        'Full-bleed poster-flat collage field, no perspective, no tabletop, no pinned wall, no booklet layout, no object arrangement',
      mood: 'DIY aggression through cut rhythm and print damage, not through literal punk props, music scene, people, or text',
      render:
        'Abstract zine-collage style-card without readable text, objects, room, wall, desk, or human subject',
      features:
        'Torn xerox blocks, mismatched paper scraps, tape-like strips, photocopy smears, neon overprint, jagged collage edges',
    };
  }
  if (preset.id === 'SP02-100') {
    return {
      aesthetic:
        'Flipbook rough-animation motion: pencil-test jitter, onion-skin ghosts, registration offsets, page-edge rhythm, smeared timing arcs, no literal book or studio',
      subject:
        'One simple original rough-animation character or object silhouette with moving contour echoes; no flipbook, hand, fingers, desk, lamp, animator table, famous character, camera, projector, device, room, wall, floor, or page prop',
      color:
        'Graphite grey, animation-paper cream, pale blue layout marks, red pencil accents, faded yellowed paper as abstract fields',
      light:
        'Flat scan-like paper visibility only, no light table glow, desk lamp, cast shadow, room light, or studio setup',
      texture:
        'Pencil scuff, erased ghosts, onion-skin translucency, rough page tooth, registration punch marks as abstract edge rhythm only',
      camera:
        'Full-bleed flat paper-motion field around one readable moving silhouette, no perspective, no stacked pages, no book object, no hand interaction',
      mood: 'Restless handmade motion through repeated offset lines, rough character gesture, and erased marks',
      render:
        'Flipbook-animation style-card with one readable moving anchor, broad motion marks, and restrained denoised texture',
      features:
        'Offset contour echoes, ghosted arcs, registration jitter, red pencil timing ticks, erased smears, page-edge rhythm',
    };
  }
  if (preset.id === 'SP02-101') {
    return {
      aesthetic:
        'Grossout cartoon material: swollen paint masses, pore-like dots, wet ink sheen, wobbly folds, greasy texture, feverish color, no realistic anatomy',
      subject:
        'One simple original grossout blob, face, or material creature with cartoon features; no realistic portrait, teeth, gums, tongue, skin, wound, gore, medical scene, lamp, camera, phone, device, or franchise character',
      color:
        'Inflamed pink, nicotine yellow, clammy teal, rash red, greasy beige, bruise purple used as abstract paint and texture fields, not flesh',
      light:
        'Flat cartoon wet-sheen highlights only, no proximity lamp, clinical light, room lighting, cast shadow, or close-up portrait setup',
      texture:
        'Pore-like dots as graphic texture, wobbling paint folds, greasy gloss streaks, wet ink strings, cracked abstract blobs, broad denoised detail',
      camera:
        'Poster-readable grossout blob or face anchor, no lens-crushing portrait, no anatomical close-up, no room perspective',
      mood: 'Uncomfortable comedy through excessive texture, ugly color, and stylized expression, not through body horror or injury',
      render:
        'Grossout-material style-card, non-graphic, no realistic anatomy, no gore, readable at thumbnail size',
      features:
        'Swollen paint blobs, pore-like dot fields, wet sheen, wobbly folds, rash-red accents, greasy beige scuffs',
    };
  }
  if (preset.id === 'SP02-102') {
    return {
      aesthetic:
        'Flat weird-comedy language: sour pastel blocks, thin awkward contours, cheap digital fills, tiny panic scribbles, deadpan empty spacing',
      subject:
        'One simple original awkward cartoon figure, face, object, or oddball silhouette; no office, workplace, cubicle, hallway, desk, chair, lamp, wall-floor seam, computer, phone, worker, camera, device, readable prop, franchise character, or polished mascot',
      color:
        'Sour pastel yellow, dusty salmon, office-beige as color only, washed green, cheap cyan, dull lavender, dirty edge grey',
      light:
        'Flat no-drama color visibility only, no fluorescent fixture, lamp, hallway glow, wall shadow, room lighting, or scene depth',
      texture:
        'Simple digital fills, lightly dirty edges, low-fuss line art, small scribbly panic accents, no furniture or workplace material',
      camera:
        'Full-bleed flat graphic field around one awkward readable anchor, no perspective jumps into a room, no stage, no office layout, no prop arrangement',
      mood: 'Awkward deadpan humor through empty spacing, plain shape rhythm, and odd original character/object design',
      render:
        'Weird-comedy style-card with one simple readable anchor and restrained denoised texture',
      features:
        'Separated sour flat blocks, thin odd contours, tiny scribble bursts, cheap fill edges, uncomfortable empty gaps',
    };
  }
  if (preset.id === 'SP02-103') {
    return {
      aesthetic:
        'Gross-kids slime-grime cartoon: lumpy asymmetry, rubbery curves, sewer-water color, pitted grime, playful ugliness',
      subject:
        'One simple original slime blob, creature, face, or object silhouette with cartoon features; no child, realistic anatomy, realistic teeth, claws, gore, sewer tunnel, junkyard, brick wall, trash bag, room, corridor, lamp, camera, phone, device, or franchise character',
      color:
        'Slime green, bruise purple, rust orange, toxic pink, sewer-water teal, moldy yellow as abstract color masses',
      light:
        'Flat cartoon contrast with small grate-like stripe fragments only, no actual grate, underlit tunnel, lamp, room lighting, wall shadow, or floor shadow',
      texture:
        'Pitted grime dots, sludge-like paint, scuff dirt, rubbery wet edges, peeling abstract marks, broad denoised texture',
      camera:
        'Poster-readable slime/grime anchor, no sewer perspective, no corridor depth, no body crop, no location layout',
      mood: 'Rowdy gross charm through texture, color, lumpy rhythm, and stylized original expression, not through kids or sewer scene',
      render:
        'Slime-grime style-card, non-graphic, no realistic anatomy, no gore, readable at thumbnail size',
      features:
        'Lumpy blobs, rubbery curves, pitted grime, slime-green bands, moldy yellow dots, crude scuff marks, asymmetrical layout',
    };
  }
  if (preset.id === 'SP02-104') {
    return {
      aesthetic:
        'Toddler-scale crayon style: oversized soft pastel blocks, chunky uneven outlines, nervous marker wobble, toy-box colors without real children or toy props',
      subject:
        'One simple original oversized crayon character, face, or shape mascot on plain paper or flat color blocks; no toddler, child, baby, diaper, toy, crib, nursery, home, carpet, furniture, lamp, spotlight, light cone, stage, wall-floor seam, room, camera, film reel, projector, circular-hole device, phone, device, or franchise character',
      color:
        'Soft 90s TV pastels, warm beige as flat field color, toy-box primaries, nursery blue as abstract blocks, faded marker tones',
      light:
        'Flat crayon-paper visibility only, no room light, lamp, spotlight, light cone, stage lighting, low-angle interior, cast shadow, floor contact, or domestic lighting',
      texture:
        'Dry marker edge, crayon uncertainty, paper-like fill, softened scan texture, chunky outline wobble',
      camera:
        'Full-bleed flat graphic field with one oversized readable crayon anchor, no room perspective, no low-angle floor scene, no object obstacle setup',
      mood: 'Harmless huge-scale panic through proportion, original anchor design, and wobbly mark-making, not through children, homes, toys, or props',
      render:
        'Toddler-scale crayon style-card with broad readable anchor forms and restrained denoised texture',
      features:
        'Oversized pastel blocks, chunky outlines, nervous curves, soft scan texture, crayon-ish wobble, no film-reel hole pattern',
    };
  }
  if (preset.id === 'SP02-105') {
    return {
      aesthetic:
        'Boiling-line scam-cartoon style: vibrating contours, stretched smear shapes, sticky summer palette, frantic diagram energy without actual plan symbols',
      subject:
        'One simple original frantic cartoon figure, object, or stretched silhouette with vibrating contours; no jawbreaker, candy, candy sphere, gadget, scheme board, map, money, suburban street, pavement scene, room, lamp, camera, phone, device, readable prop, or franchise character',
      color:
        'Summer-heat yellow, candy red as flat color only, pool-chlorine blue, peach, dirty pavement grey, sticky orange',
      light:
        'Flat hot cartoon daylight as color pressure only, no sun, street scene, cast shadow, lamp, room light, or physical location',
      texture:
        'Rough pencil boil, analog TV softness, cel paint wobble, sticky haze edges, erratic contour vibration',
      camera:
        'Poster-readable frantic anchor with vibrating contours, no diagram board, no scheme layout, no street depth, no room perspective',
      mood: 'Frantic plan-collapse energy through line vibration, original character/object design, and stretched forms, not through literal scam props',
      render:
        'Boiling-line cartoon style-card with one readable anchor, smear shapes, and restrained denoised texture',
      features:
        'Vibrating outlines, stretched abstract forms, sticky heat colors, rough pencil boil, frantic non-symbolic marks',
    };
  }
  if (preset.id === 'SP02-106') {
    return {
      aesthetic:
        'Beige suburban-anxiety cartoon style: pastel discomfort, noodle panic marks, awkward consumer-like curves, wallpaper-cream fields, soft 90s TV texture without literal room',
      subject:
        'One simple original anxious cartoon figure, face, object, or noodle silhouette; no suburb, house, living room, couch, appliance, furniture, wallpapered room, brand label, readable text, consumer product, room, wall-floor seam, lamp, camera, phone, device, or franchise character',
      color:
        'Beige pastel, dusty teal, tired salmon, consumer-label red as abstract accent, wallpaper cream, fluorescent green',
      light:
        'Flat sitcom-like visibility translated to color only, no fluorescent fixture, room light, hallway glow, cast shadow, or domestic setup',
      texture:
        'Pastel TV cel texture, wallpaper-like pattern as flat field noise, plastic-like sheen translated into abstract marks, mild grime',
      camera:
        'Full-bleed flat graphic field around one anxious readable anchor, no interior perspective, no suburban exterior, no appliance/product arrangement',
      mood: 'Goofy dread through color discomfort, original anxious anchor, and noodle bends, not through suburban setting or consumer props',
      render:
        'Beige-anxiety cartoon style-card with one simple readable anchor and restrained denoised texture',
      features:
        'Noodle panic lines, awkward pastel blocks, soft grime, wallpaper-cream fields, weird consumer-like curves without products',
    };
  }
  if (preset.id === 'SP02-107') {
    return {
      aesthetic:
        'Rural nightmare pastel cartoon style: dusty empty-space pressure, moonlit blue blocks, alarm-red insert shapes, dry pastel grain, uncanny contrast without literal location',
      subject:
        'One simple original frightened cartoon figure, face, object, or symbolic silhouette inside dusty negative space; symbolic moon, house, field, or hill shapes may appear as flat motifs. No detailed farmhouse scene, road, barn, pet, intruder, monster, realistic body, room, lamp, wall-floor seam, camera, phone, device, or franchise character',
      color:
        'Dusty pink, bruise purple, dead-field beige as flat field color, moonlit blue, alarm red, faded pastel yellow',
      light:
        'Moonlit isolation translated to flat color contrast and optional symbolic crescent only, no lamp glow, spotlight fixture, farmhouse light, cast shadow, or detailed landscape scene',
      texture:
        'Grainy TV cel, dusty surface, dry pastel texture, sudden smooth insert edges as abstract shape contrast',
      camera:
        'Full-bleed flat graphic field with negative-space pressure around one readable anchor, no rural perspective, no horizon, no room',
      mood: 'Lonely dread through empty spacing, pastel pressure, and one original uneasy anchor, not through houses, fields, pets, or intruders',
      render:
        'Rural-nightmare pastel style-card with one readable anchor and restrained denoised texture',
      features:
        'Dusty void fields, tiny panic marks, alarm-red inserts, moonlit blue blocks, dry pastel grain, empty-space tension',
    };
  }
  if (preset.id === 'SP02-108') {
    return {
      aesthetic:
        'Loud primary derangement cartoon style: saturated red/yellow/blue impact, thick crude contours, jagged comic bursts, rubbery scale mismatch, anti-subtle poster energy',
      subject:
        'One simple original loud primary-color cartoon figure, face, object, or symbolic silhouette; no cow, chicken, animal, sibling, realistic mouth, teeth, tongue, hallway, room, furniture, prop, camera, phone, device, or franchise character',
      color:
        'Shouting red, chicken-yellow as color only, electric blue, toxic green, black outline, cheap poster white',
      light:
        'Flat poster exposure only, no atmosphere, no room light, no stage, no cast shadow, no physical setting',
      texture:
        'Poster-paint cel fill, cheap TV scan softness, sticky marker edge, rubbery graphic surface',
      camera:
        'Full-bleed flat graphic composition around one readable primary-color anchor, no hallway perspective, no room, no prop arrangement',
      mood: 'Ridiculous aggressive energy through scale mismatch, original anchor design, and jagged bursts, not through animals or siblings',
      render:
        'Loud-primary cartoon style-card with one bold readable anchor and restrained denoised texture',
      features:
        'Primary-color blocks, thick crude outlines, jagged bursts, rubbery contours, scale-mismatched abstract masses',
    };
  }
  if (preset.id === 'SP02-109') {
    return {
      aesthetic:
        'Shared-form elastic cartoon style: one long ribbon-like form with two opposing color states, accordion compression, soft squash curves, simple 90s sitcom construction without realistic anatomy',
      subject:
        'One simple original elastic ribbon creature, face, object, or joined silhouette with two opposing color states; no cat, dog, recognizable animal, realistic anatomy, lawn, room, prop, camera, phone, device, or franchise character',
      color:
        'Muted 90s TV color, mustard tan, muted blue, warm orange, faded green, heavy black accents as abstract color states',
      light:
        'Flat sitcom-like visibility translated to clean color only, no room light, shadow blob floor contact, stage, or physical setting',
      texture:
        'Smooth cel fill, analog TV softness, light scan grain, simple painted surface, no fur, skin, or body texture',
      camera:
        'Full-bleed flat graphic field around one readable elastic anchor, no room perspective, no prop arrangement',
      mood: 'Playful contradiction through long-form bending, original elastic anchor design, and opposing color states, not through recognizable animals',
      render:
        'Shared-form elastic style-card with readable long silhouette and restrained denoised texture',
      features:
        'Long elastic ribbon, two opposing color states, accordion bends, soft squash curves, simple sitcom-like outlines',
    };
  }
  if (preset.id === 'SP02-110') {
    return {
      aesthetic:
        'Gross-up freeze-frame texture cartoon style: cheerful flat cartoon blocks interrupted by invasive macro texture patch, pore-like dots, wet gloss, sickly pink accents',
      subject:
        'One simple original cartoon face, object, blob, or material anchor interrupted by a gross macro texture patch; no sponge, undersea prop, recognizable sea creature, realistic portrait, teeth, tongue, skin, gore, room, wall, floor, camera, phone, device, or franchise character',
      color:
        'Cheerful yellow-blue base, sickly pink accents, pore red, greasy beige, seafoam green as abstract blocks and texture fields',
      light:
        'Flat cartoon contrast plus macro glare as surface highlight only, no lamp, flash, room light, underwater scene, or physical setup',
      texture:
        'Pore-like dots as graphic texture, wrinkle-like abstract folds, wet gloss, painterly gross surface, non-graphic and no anatomy',
      camera:
        'Full-bleed flat graphic field with one readable anchor and macro-texture insert patch, no realistic face crop, no body crop, no room or undersea perspective',
      mood: 'Whiplash humor through sudden texture contrast and original cartoon anchor, not through realistic body close-up',
      render:
        'Gross-up texture style-card, non-graphic, no realistic anatomy, readable at thumbnail size',
      features:
        'Flat yellow-blue blocks, sickly pink macro patch, pore-like dots, wet gloss highlights, greasy beige abstract folds',
    };
  }
  if (preset.id === 'SP02-111') {
    return {
      aesthetic:
        'Dumb slouch geometry cartoon style: sagging jagged contour blocks, cheap TV beige, nicotine yellow, washed denim blue, gravity-heavy diagonals without literal room',
      subject:
        'One simple original slouched cartoon figure, face, object, or sagging geometric silhouette; no couch, chair, teen, realistic person, overbite caricature, room, interior, clutter, fabric, lamp, camera, phone, device, or franchise character',
      color:
        'Cheap TV beige, nicotine yellow, washed denim blue, dull brown, cathode green, stale red as abstract color fields',
      light:
        'Flat cathode-like glow translated to color only, no TV screen, lamp, room ambience, cast shadow, or interior setup',
      texture:
        'Analog TV grain, rough ink edge, low-rent color noise as abstract surface, no stained fabric or wall material',
      camera:
        'Full-bleed flat graphic field around one slouched readable anchor, no couch framing, no interior perspective, no prop arrangement',
      mood: 'Heavy boredom through sagging geometry, original anchor design, and ugly color, not through furniture or room scene',
      render:
        'Slouch-geometry style-card with one readable sagging anchor and restrained denoised texture',
      features:
        'Sagging diagonals, jagged slack contours, cheap-TV beige fields, cathode green accents, gravity-heavy shape rhythm',
    };
  }
  if (preset.id === 'SP02-112') {
    return {
      aesthetic:
        'Office-boredom geometry cartoon style: dry beige blocks, copy-paper white fields, muted toner-black lines, underwhelming boxy rhythm, tiny awkward marks without literal office scene',
      subject:
        'One simple original bored geometric figure, face, object, or boxy silhouette; no office, cubicle, desk, paperwork, tie, chair, carpet, fluorescent fixture, room, wall-floor seam, logo, readable text, camera, phone, device, or franchise character',
      color:
        'Office beige as flat color only, copy-paper white, washed-out polo green, stale blue, grey-carpet tone, muted toner black',
      light:
        'Fluorescent flatness translated to shadowless color fields only, no ceiling fixture, office wash, room light, or interior setup',
      texture:
        'Copy-paper grain, cheap toner edge, dry marker-like fill, subtle fabric-like noise as flat texture only',
      camera:
        'Full-bleed flat graphic field around one bored readable anchor, no cubicle perspective, no desk layout, no document prop',
      mood: 'Dry defeated comedy through underwhelming geometry, original anchor design, and beige emptiness, not through workplace props',
      render:
        'Office-boredom style-card with one simple readable anchor and restrained denoised texture',
      features:
        'Beige blocks, copy-paper fields, tiny awkward marks, toner-black dry lines, boxy anti-dynamic rhythm',
    };
  }
  if (preset.id === 'SP02-113') {
    return {
      aesthetic:
        'Toxic suburb satire cartoon style: lopsided polluted color fields, malformed contour fragments, class-coded grime translated into TV-cel marks, no literal suburb or family scene',
      subject:
        'One simple original malformed cartoon figure, face, object, or poisoned-color silhouette; no family, realistic person, suburb, house, trailer, yard, fence, street, trash pile, smokestack, room, wall, wall-floor seam, furniture, lamp, camera, phone, device, or franchise character',
      color:
        'Toxic yellow, smoke grey, bruised mauve, landfill green, cheap tan, muted domestic pink as abstract color fields',
      light:
        'Flat polluted ambience translated to sour color only, no daylight exterior, lamp, window, room light, cast shadow, or environmental scene',
      texture:
        'Grime speckles, dusty TV cel texture, dented-plastic-like scuffs as flat marks only, no fabric, trash objects, wall material, or prop surface',
      camera:
        'Full-bleed flat graphic field around one malformed readable anchor, no domestic framing, no suburban perspective, no street layout, no family portrait composition, no prop arrangement',
      mood: 'Bleak satirical warmth through poisoned palette, original anchor design, and lopsided geometry, not through houses, class props, or location',
      render:
        'Toxic-suburb style-card with readable malformed contours and restrained denoised texture',
      features:
        'Lopsided silhouettes as abstract fragments, toxic color blocks, grime dots, cheap tan fields, landfill green accents, poisoned cozy asymmetry',
    };
  }
  if (preset.id === 'SP02-114') {
    return {
      aesthetic:
        'Squigglevision line-boil style-card: loose vibrating contours, conversational minimalism translated into anxious empty spacing, muted adult-animation palette, no therapy scene',
      subject:
        'One simple original squiggly doodle figure, wobbly silhouette, or nervous shape mascot with visible line boil; no therapist, patient, realistic person, portrait head, face-screen, TV set, monitor, phone, camera, microphone, stage, couch, chair, office, therapy room, desk, wall, wall-floor seam, lamp, window, readable text, or device',
      color:
        'Therapy beige as flat color only, dusty teal, pencil grey, soft salmon, washed blue, off-white as calm abstract fields',
      light:
        'Flat low-key broadcast softness translated to color balance only, no TV object, office lamp, room light, window light, cast shadow, or interior ambience',
      texture:
        'Low-fi cel softness, vibrating edge artifact, pencil jitter, simple fill texture, broad denoised paper/cel surface',
      camera:
        'Poster-readable one-anchor composition with generous negative space and no TV/monitor body, couch framing, talk-show setup, office perspective, or character conversation staging',
      mood: 'Talky neurotic understatement through line jitter, awkward posture, and empty spacing, not through furniture, therapy props, TV objects, or room scene',
      render:
        'Representative squigglevision style-card with one readable original wobbly anchor and restrained denoised texture',
      features:
        'Constant line jitter, small contour drift, muted beige/teal/salmon fields, anxious separated squiggle clusters, minimal low-action spacing, no TV set or monitor silhouette',
    };
  }
  if (preset.id === 'SP02-115') {
    return {
      aesthetic:
        'Marker-edge improvised sitcom abstraction: dry felt-tip outlines, awkward anti-slick timing, handmade TV softness, pause spacing without people or room',
      subject:
        'Abstract marker fragments only, no kid, child, person, face, head, body, pose, school project, suburban room, couch, chair, desk, wall, wall-floor seam, lamp, notebook, paper prop, camera, phone, or device',
      color:
        'Felt-tip muted primaries, school-paper beige as flat field color, faded blue, dry red, washed green, marker black',
      light:
        'Flat TV visibility translated to color only, no room light, lamp, window light, cast shadow, or interior setup',
      texture:
        'Dry marker bleed, paper softness, VHS-era TV blur, low-budget cel texture, broad denoised surface',
      camera:
        'Full-bleed flat graphic field, no character blocking, no staged poses, no room perspective, no prop arrangement',
      mood: 'Awkward homemade comedy through spacing and marker wobble only, not through kids, people, school, rooms, or show premises',
      render:
        'Abstract marker-edge sitcom style-card with readable dry contours and restrained denoised texture',
      features:
        'Dry marker outlines, awkward gaps, muted primary blocks, school-paper beige fields, handmade TV softness, improvised contour drift',
    };
  }
  if (preset.id === 'SP02-116') {
    return {
      aesthetic:
        'Notebook anxiety marks abstraction: soft marker color fields, diary-doodle contours, margin-like drift, daydream insert rhythm without notebook object or school scene',
      subject:
        'Abstract diary-like marks only, no notebook object, page, ruled paper, school, neighborhood, kid, adolescent, person, face, head, body, desk, pencil, prop, social scene, wall, wall-floor seam, lamp, camera, phone, or device',
      color:
        'Notebook-cover teal as flat color only, soft marker purple, peach anxiety, pale yellow, faded red, school-paper cream',
      light:
        'Flat friendly TV light translated to soft color balance only, no daydream glow object, lamp, window, room light, or cast shadow',
      texture:
        'Notebook-paper tooth as abstract surface, marker softness, light scan grain, softened cel fill, broad denoised marks',
      camera:
        'Full-bleed flat graphic field, no diary page framing, no margin note layout, no room or school perspective, no character framing',
      mood: 'Wistful nervousness through soft color and awkward negative space only, not through school props, kids, people, or social scenes',
      render:
        'Abstract notebook-anxiety style-card with readable soft marker fields and restrained denoised texture',
      features:
        'Teal/purple/peach blocks, diary-doodle contours, margin-like drift lines, soft marker edges, daydream-like overlay rhythm without literal page',
    };
  }
  if (preset.id === 'SP02-117') {
    return {
      aesthetic:
        'Photo-cutout xerox abstraction: mismatched photocopy fragments, scissor-cut edges, dirty toner shadows, hostile paste-up alignment without faces or bodies',
      subject:
        'Abstract xerox fragments only, no face, head, eyes, mouth, body, person, character, schoolyard, yearbook, revenge scene, paper doll, puppet, room, wall, desk, camera, phone, or device',
      color:
        'Photocopy black, harsh white, dirty grey, scanned beige, toner shadow, faded marker accent as abstract fields',
      light:
        'Flat scanner contrast only, no room light, lamp, shadow-cast object setup, photo studio, or scene depth',
      texture:
        'Photocopy grain, torn paper-cut edges, glue-collage layering as flat texture, black-and-white halftone damage, rough scan artifacts',
      camera:
        'Full-bleed flat collage field, no portrait crop, no body assembly, no paper-doll layout, no room perspective, no prop arrangement',
      mood: 'Snarky janky menace through cut edges and bad alignment only, not through people, faces, school stories, or revenge narrative',
      render:
        'Abstract photo-cutout style-card with readable xerox fragments and restrained denoised texture',
      features:
        'Scissor-cut edges, mismatched paste-up seams, xerox grain, toner shadows, harsh black-white fragments, hostile asymmetry',
    };
  }
  if (preset.id === 'SP02-118') {
    return {
      aesthetic:
        'Garbage-pail sticker abstraction: loud collectible-card color, goo-like abstract drips, swollen defect shapes, cheap sticker ink, gross comedy without body subject',
      subject:
        'Abstract separated marks only, no kid, child, body, face, head, eyes, mouth, teeth, skin, bodily-function scene, gore, trading-card border, readable text, sticker object, die-cut sticker outline, white product outline, single central product silhouette, product shot, room, camera, phone, or device',
      color:
        'Sticker-card primaries, vomit green as flat color only, zit red, bubblegum pink, cheap cyan, thick black',
      light:
        'Flat collectible-card visibility translated to graphic color only, no product highlight, room light, cast shadow, or physical sticker setup',
      texture:
        'Wax-card print texture, sticky gloss as abstract highlight, halftone edge, cheap sticker ink, goo-like paint without anatomy',
      camera:
        'Full-bleed flat graphic field with separated abstract marks, no card border, no sticker/product framing, no central die-cut silhouette, no crash-zoom face crop, no body close-up, no prop arrangement',
      mood: 'Juvenile recoil comedy through ugly color and goo rhythm only, not through kids, faces, bodies, bodily functions, or trading-card object',
      render:
        'Abstract garbage-pail-inspired style-card with loud readable shapes and restrained denoised texture',
      features:
        'Separated goo-like drips, swollen abstract defect marks, sticker primaries as color only, halftone edge fragments, cheap cyan/pink/green blocks, thick black broken marks',
    };
  }
  if (preset.id === 'SP02-119') {
    return {
      aesthetic:
        'Chlorine slime doodle abstraction: badly drawn summer-gross marker energy, sticky heat palette, slick slime marks, crooked childish curves without pool or monster subject',
      subject:
        'Abstract slime and marker marks only, no pool, water scene, monster, creature, body, face, head, eyes, mouth, teeth, limbs, diving board, flip-flop object, summer prop, room, wall, camera, phone, or device',
      color:
        'Chlorine green, wet turquoise, sunburn red, cheap flip-flop blue as flat color only, sticky yellow, marker black',
      light:
        'Flat hot-summer exposure translated to saturated color only, no sun, pool glare scene, room light, lamp, cast shadow, or physical setup',
      texture:
        'Marker bleed, slick slime gloss as abstract highlight, wet paper, sweaty grain, cheap plastic-like color as flat texture',
      camera:
        'Full-bleed flat graphic field, no pool perspective, no creature framing, no body crop, no prop arrangement',
      mood: 'Sticky goofy grossness through color and slime rhythm only, not through monsters, pools, bodies, or summer objects',
      render:
        'Abstract chlorine-slime doodle style-card with readable crooked marks and restrained denoised texture',
      features:
        'Slime drips, chlorine-green fields, crooked marker curves, sticky yellow bands, wet turquoise blobs, bad-doodle wobble',
    };
  }
  if (preset.id === 'SP02-120') {
    return {
      aesthetic:
        'Toxic marker freakout abstraction: permanent-marker aggression, malformed margin contours, vandal-energy hatching, hyperactive juvenile composition without classroom scene',
      subject:
        'Abstract marker marks only, no classroom, student, person, face, body, desk, page, notebook object, lesson, monster, creature, readable rude text, letters, symbol words, room, wall, lamp, camera, phone, or device',
      color:
        'Toxic marker green, black ink, red correction pen as slash color only, highlighter yellow, notebook blue as flat color, cheap purple',
      light:
        'Flat marker-first readability only, no desk light, classroom glare, lamp, room light, cast shadow, or tabletop setup',
      texture:
        'Permanent-marker bleed, scratchy ink feathering, smudged graphite-like grain, paper tooth as abstract surface only, no desk material',
      camera:
        'Full-bleed flat graphic field, no page border, no desk perspective, no classroom layout, no object arrangement, no readable icon sheet',
      mood: 'Messy rebellious energy through line pressure and edge crowding only, not through students, classrooms, props, monsters, or readable text',
      render:
        'Abstract toxic-marker style-card with broad readable scratches and restrained denoised texture',
      features:
        'Permanent-marker scratches, malformed margin contours, toxic green blocks, red correction slashes, highlighter bands, vandal-energy hatching',
    };
  }
  return undefined;
}

function presetMotifForPrompt(
  pack: StyleRuntimePack,
  category: string,
  preset: StyleRuntimePreset,
) {
  const key = styleCategoryImageKey(pack.id, category);
  if (pack.id === 'pack_17') {
    return `Use one preset-specific medieval-fantasy anchor tied to "${sanitizeStylePromptName(
      preset.name,
    )}": armor silhouette, reliquary, monster face, castle fragment, occult mark cluster, plague mask, rune-tech seam, zine panel, or stained-glass shape. Keep it original, card-readable, non-franchise, and not a generic sword, map, book, corridor, or library scene.`;
  }
  if (pack.id === 'pack_15') {
    return `Use one preset-specific world cue tied to "${normalizePack15PromptText(
      sanitizeStylePromptName(preset.name).toLowerCase(),
    )}": posture, garment silhouette, hair/hood/helmet shape, weather pressure, architectural contour, background infrastructure, color accent, or social role. Keep the protagonist primary and keep technical/mystic motifs as world context, not handheld anchors or foreground focal points.`;
  }
  if (pack.id === 'pack_16') {
    return 'Use one lineage-specific acting pose, silhouette proportion, color-script split, era texture, and shot grammar unique to this preset; do not reuse a generic anime face, generic aura, rubble field, corridor, market/library aisle, camera prop, lamp setup, or object-only card.';
  }
  if (pack.id === 'pack_09') {
    return `Differentiate this card through the exact material behavior of "${sanitizeStylePromptName(
      preset.name,
    )}": particle size, density, flow direction, edge softness, translucency, fracture rhythm, surface response, and palette. Do not add a symbolic emblem, glyph, badge, logo-like mark, fantasy relic, mask, weapon, or decorative hero object to create uniqueness.`;
  }
  if (isPack10PatternTextureKey(key)) {
    return `Differentiate this card through the exact pattern/material behavior of "${sanitizeStylePromptName(
      preset.name,
    )}": repeat scale, surface crop, fold rhythm, edge relief, material sheen, color separation, and tactile spacing. Do not add costumes, masks, props, objects, faces, bodies, rooms, logos, readable codes, or decorative hero items to create uniqueness.`;
  }
  if (PACK_01_TRANSFERABLE_PRESET_IDS.has(preset.id)) {
    return 'Use one transferable photographic cue in lighting, color, surface response, framing, texture, or background geometry; do not literalize the preset title as the subject, scene, or person.';
  }
  if (preset.id === 'SP05-178') {
    return 'Use one occult hazard geometry, invasive shadow contour, or empty-handed defensive pose as the identity cue; do not add a handheld prop, sword, staff, wand, blade, weapon, camera, or generic desk object.';
  }
  if (
    [
      'SP05-184',
      'SP05-185',
      'SP05-186',
      'SP05-187',
      'SP05-188',
      'SP05-189',
      'SP05-190',
      'SP05-191',
      'SP05-192',
      'SP05-193',
      'SP05-194',
      'SP05-195',
      'SP05-196',
      'SP05-197',
      'SP05-198',
      'SP05-199',
      'SP05-200',
      'SP05-201',
      'SP05-202',
      'SP05-203',
      'SP05-204',
      'SP05-205',
      'SP05-206',
      'SP05-207',
      'SP05-208',
      'SP05-209',
      'SP05-210',
      'SP05-211',
      'SP05-212',
      'SP05-213',
      'SP05-214',
      'SP05-215',
      'SP05-216',
      'SP05-217',
      'SP05-218',
      'SP05-219',
      'SP05-220',
      'SP05-321',
      'SP05-322',
      'SP05-323',
      'SP05-324',
      'SP05-325',
      'SP05-326',
      'SP05-327',
      'SP05-328',
      'SP05-329',
      'SP05-330',
      'SP05-331',
      'SP05-332',
      'SP05-333',
      'SP05-334',
      'SP05-335',
      'SP05-336',
      'SP05-337',
      'SP05-338',
      'SP05-339',
      'SP05-340',
      'SP05-341',
      'SP05-342',
      'SP05-001',
      'SP05-002',
      'SP05-003',
      'SP05-004',
      'SP05-005',
      'SP05-006',
    ].includes(preset.id)
  ) {
    return 'Use one preset-specific body-language cue, costume trim, light shape, reaction silhouette, or graphic framing device; do not add a handheld prop, camera, desk object, readable sign, weapon, or generic decorative object.';
  }
  if (isPack02CartoonMediaPreset(pack, preset)) {
    return 'Use one preset-specific cartoon media cue in line shape, proportion, paper texture, color fill, collage edge, or animation surface, plus one simple original graphic anchor when useful; do not force an adult model, realistic body, camera prop, or literal title scene.';
  }
  if (isPack02NonPortraitLightingPreset(pack, preset)) {
    return 'Use one preset-specific optical cue on architectural planes, glass, fabric, metal, water, haze, or shadow geometry; do not use a human model, portrait, chair, curtain, or studio-session setup.';
  }
  if (preset.id === 'SP04-001') {
    return 'Use one Golden Age comic card with a readable original emblem/object anchor, thick ink, Ben-Day dots, cheap newsprint, primary color blocks, and pulp optimism; no cape, crest, superhero body, speech balloon, readable text, city rescue, franchise cue, camera prop, or modern digital polish.';
  }
  if (preset.id === 'SP04-002') {
    return 'Use one Silver Age cosmic comic card with an original energy-charged object or silhouette, atom-age burst halos, crackle dots, foreshortened contour rhythm, and bright primary pop; no capes, planets, rockets, battles, cosmic hero body, readable text, UI, or empty energy-only abstraction.';
  }
  if (preset.id === 'SP04-003') {
    return 'Use one modern superhero digital-comic card built around a polished costume-material fragment, symbolic hero object, or emblem-free armor detail with widescreen rim light and glossy FX; no face, full body, cape, weapon, fight scene, city rooftop, readable text, franchise cue, or generic action poster.';
  }
  if (preset.id === 'SP04-004') {
    return 'Use one shonen manga action card with a non-franchise creature/object fragment caught in speed-line impact, screentone fields, hard black masses, and burst geometry; no anime face, fighter body, tournament arena, weapon, named-series cue, readable text, or color.';
  }
  if (preset.id === 'SP04-005') {
    return 'Use one shojo manga emotional card with a delicate ornamental object or cropped non-human silhouette, fine linework, airy screentones, soft glow, and lyrical negative space; no face-first portrait, couple, classroom, school romance, rose overload, readable text, or generic cute human.';
  }
  if (preset.id === 'SP04-006') {
    return 'Use one webtoon-style vertical-scroll card made of 3-4 tall stacked illustrated beat panels around the same simple non-human object, with clean digital contours, saturated cel color, soft gradient emphasis, and generous mobile-scroll spacing; no person, face, full body, fantasy relic, corridor, phone UI, app screen, dialogue bubbles, readable text, romance panel, or screenshot layout.';
  }
  if (preset.id === 'SP04-007') {
    return 'Use one Franco-Belgian ligne-claire card with a clear-line original object, clean architectural corner, or small environment slice, uniform monoline, flat color, readable props, and tidy spatial logic; no person, boy adventurer, dog, bicycle, car/plane hero prop, wall lamp, travel poster, shelves/library filler, readable text, or hatching.';
  }
  if (preset.id === 'SP04-008') {
    return 'Use one binary noir comic card with a symbolic object or abstract silhouette cut from brutal black/white shapes, hard white carve-outs, dry ink grain, and zero-gray contrast; no person, detective, hat, trenchcoat, cards, gun, knife, alley, rain street, blood, readable text, or color accent.';
  }
  if (preset.id === 'SP04-009') {
    return 'Use one underground comix card with a non-human mascot/object specimen, nervous wobble contour, dense crosshatching, raw print-paper grit, and grotesque proportion energy; no real person, face-led caricature, crowd, cramped room, body-first satire, readable text, or polished mainstream finish.';
  }
  if (preset.id === 'SP04-010') {
    return 'Use one painted graphic-novel card with a solemn mythic object, costume-material fragment, statue fragment, or symbolic prop rendered in gouache-like brushwork, nuanced value modeling, and soft spotlight gravitas; no person, face, body, cape, rooftop/city tableau, group pose, Americana tableau, celebrity likeness, readable text, or generic superhero.';
  }
  if (preset.id === 'SP04-011') {
    return 'Use one horror-manga pattern card with spiral/cavity motifs invading an object or material specimen, obsessive black-white line texture, and uncanny pressure; no gore, wounds, realistic body, creepy face, village/room horror, readable text, camera prop, or shock image.';
  }
  if (preset.id === 'SP04-012') {
    return 'Use one airy European sci-fi comic card with a vehicleless organic-futurist structure, biomech arch, or alien material object, pastel space, clean line, stipple texture, and surreal scale; no face, humanoid, traveler, body, hand, spaceship, desert vista, portal, fantasy hall, readable text, or Moebius copy.';
  }
  if (preset.id === 'SP04-013') {
    return 'Use one chibi-style card with an original mascot/object in compact cute proportions, oversized simple shapes, sticker-clean silhouette, and soft color pop; no human child, celebrity/anime face, UI sticker sheet, readable text, franchise cue, or toy-store scene.';
  }
  if (preset.id === 'SP04-014') {
    return 'Use one pixel-comic card with a single object or tiny non-human creature icon in chunky pixel panels, cluster/dither proof, limited palette, and sprite-like contour energy; no person, face, rooftop, city skyline, game UI, health bars, screen capture, weapon pose, platform combat, readable text, or tiny noisy detail.';
  }
  if (preset.id === 'SP04-015') {
    return 'Use one riso-print card with a single graphic anchor, overprint misregistration, grainy spot colors, flat stencil shapes, and paper texture; no readable type, zine/flyer layout, print-shop tools, table scene, poster title, or brand mark.';
  }
  if (preset.id === 'SP04-016') {
    return 'Use one cyberpunk comic card with tech-noir reflective planes around a symbolic object, material shard, or city-light abstract plane, neon ink edges, rainlike texture, and saturated shadow color; no person, humanoid, hand-held device, screen, camera, phone, card prop, alley, skyline, car, detective, readable text, or body-led scene.';
  }
  if (preset.id === 'SP04-017') {
    return 'Use one watercolor storybook card with a gentle object or creature fragment, loose wash edges, soft pigment blooms, warm paper, and childlike narrative calm; no cottage, garden path, child, crowded pastoral vignette, animal-story cliche, readable text, or hard digital line.';
  }
  if (preset.id === 'SP04-018') {
    return 'Use one tactile paper-cut illustration card with a clear cut-paper object, animal, or landscape fragment, torn edges, stacked shadows, colored paper fibers, and simple depth; no person, child, body, face, hands, scissors, glue, desk, classroom, labels, craft-table scene, or flat collage sheet.';
  }
  if (preset.id === 'SP04-019') {
    return 'Use one crayon illustration card with an original object or non-human creature anchor, waxy strokes, uneven pressure, bright naive color, and paper tooth; no person, child, body, face, costume, fantasy hero, school page, child hand, house-sun cliche, stick figure, classroom, readable scribbles, or polished digital finish.';
  }
  if (preset.id === 'SP04-020') {
    return 'Use one flat vector educational-comic metaphor card with a static ecology cutaway, modular seed system, or simple energy-cycle object, clean geometric shapes, friendly palette, and simple explanatory hierarchy; no person, child, vehicle, rocket, drone, flying machine, planets, birds, charts, labels, dashboard UI, readable text, app screen, or Kurzgesagt copy.';
  }
  if (preset.id === 'SP04-021') {
    return 'Use one mid-century gouache illustration card with a playful geometric animal, plant, or learning-object scene, opaque chalky paint, dry-brush edges, matte color blocks, and warm atomic-age optimism; no classroom, family, poster, interior room, product diagram, readable text, lamp, chair, curtain, or studio setup.';
  }
  if (preset.id === 'SP04-022') {
    return 'Use one colored-pencil fantasy/concept card with a calm invented creature, talisman object, or landscape fragment, layered pigment, visible paper tooth, directional hatching, and soft value transitions; no sketchbook page, domestic still life, portrait, face-led character, table prop, readable scribbles, ink, or paint.';
  }
  if (preset.id === 'SP04-023') {
    return 'Use one scratchboard card with a luminous object, nocturnal animal silhouette, or botanical specimen carved from black ground, white incised strokes, burr chatter, and hatch-density modeling; no portrait, theater prop, full moon cliche, readable text, white background, gore, weapon, or crowded night scene.';
  }
  if (preset.id === 'SP04-024') {
    return 'Use one claymation-style card with a tactile non-humanoid clay creature, object, or chunky landscape fragment, visible fingerprints, seam traces, matte plasticine color, and handmade stop-motion charm; no person, humanoid, face-led hero, sword, weapon, fantasy path, studio set, camera, lamp, curtain, chair, human actor, comedy skit, text, or 2D drawn look.';
  }
  if (preset.id === 'SP04-025') {
    return 'Use one felt-tip marker card with a bold non-human creature, object, or concept-art material prop, broad marker strokes, edge bleed, overlap gradients, feathered paper artifacts, and fast saturated color; no person, portrait, face-led character, fashion pose, cloak, armor, sketchbook page, product drawing, desk scene, readable notes, photoreal paint, or smooth airbrush blend.';
  }
  if (preset.id === 'SP04-026') {
    return 'Use one pop-up paper-engineering card with a foldable creature, object, or tiny landscape mechanism, die-cut contours, tabs, slots, crease shadows, layered cardstock depth, and cut-edge fuzz; no open book page, child, theater stage, classroom, hands, scissors, glue, readable text, or flat page.';
  }
  if (preset.id === 'SP04-027') {
    return 'Use one whimsical ink storybook card with a lively object, odd little creature, or playful plant, scratchy fast nib lines, broken contours, watercolor splash accents, ink flicks, and loose humor; no child, classroom, heavy dark scene, joke caption, readable text, face-led portrait, brand mascot, or polished clean vector.';
  }
  if (preset.id === 'SP04-028') {
    return 'Use one chalk pastel card with a soft creature, object, or dreamy landscape fragment, powdery transitions, smudged tooth catch, dust halos, matte bloom, and reduced hard edges; no bedroom, bedtime room, portrait, seasonal postcard, sharp pen line, readable text, lamp, curtain, or studio prop.';
  }
  if (preset.id === 'SP04-029') {
    return 'Use one sticker-art card with a single die-cut non-humanoid creature, object, or emblem-like subject, thick white cutline, saturated vector color, compact vinyl gloss, and thumbnail-readable silhouette; no person, humanoid, armor hero, face mask, lantern, weapon, vehicle, sticker sheet, slogans, readable text, peel-off hand, UI icon set, brand mark, or busy background.';
  }
  if (preset.id === 'SP04-030') {
    return 'Use one vintage scientific botanical card with a clear plant specimen, seed pod, leaf cross-section, or naturalist study, fine ink contour, transparent tint, warm archival paper, orthographic layout, and non-readable callout marks; no readable labels, Latin text, cartoon, messy sketch, human hand, desk, book page, or classroom chart.';
  }
  if (preset.id === 'SP04-031') {
    return 'Use one Art Deco poster card with a streamlined animal, vessel, architectural object, or emblematic landscape form, stepped geometry, sunburst rhythm, teal/gold/black palette, elegant frame discipline, and smooth poster polish; no readable title, city skyline, travel ad, skyscraper wall, product ad, person portrait, car, or messy organic detail.';
  }
  if (preset.id === 'SP04-032') {
    return 'Use one Art Nouveau lithograph card with an elegant creature, botanical object, or ornamental artifact inside flowing halo/border systems, sinuous contour, muted gold, peach/sage/ivory palette, and lithograph grain; no woman portrait, hair-as-subject, poster title, readable text, bouquet cliche, room, lamp, or straight-line minimal layout.';
  }
  if (preset.id === 'SP04-033') {
    return 'Use one constructivist propaganda-poster card with a bold object, machine part, animal silhouette, or abstract emblem at heroic low angle, red-black-cream contrast, rays, screenprint flatness, and command diagonals; no workers, flags, crowds, slogans, politics, readable text, weapon, fist, or uniformed person.';
  }
  if (preset.id === 'SP04-034') {
    return 'Use one 60s psychedelic poster card with a clear central creature, object, or flower-like emblem warped by liquid contours, vibrating complementary colors, radial waves, dense screenprint rhythm, and optical overload; no band name, concert poster, readable typography, face portrait, event layout, drug paraphernalia, or pure unreadable abstraction.';
  }
  if (preset.id === 'SP04-035') {
    return 'Use one minimalist vector card with friendly simplified figures, creature/object modules, or abstract human-like shapes, flat bright palette, soft blobby geometry, shadowless surfaces, and clean editorial hierarchy; no office scene, dashboard UI, chart, app screen, product demo, laptop, text, or detailed texture.';
  }
  if (preset.id === 'SP04-036') {
    return 'Use one Dada collage card with a strange hybrid object, animal-paper fragment, or impossible still-life, hard scissor seams, torn edges, halftone wear, source-light mismatch, and abrupt scale discontinuity; no human body parts, camera, lens, optical device, newspaper text, manifestos, politics, readable headlines, desk scene, or seamless painted look.';
  }
  if (preset.id === 'SP04-037') {
    return 'Use one readable Bauhaus anchor built from circles, squares, triangles, bars, and primary blocks; no readable letters, title area, furniture, room, fantasy character, weapon, or pure abstract-only layout.';
  }
  if (preset.id === 'SP04-038') {
    return 'Use one scenic shape-band anchor with WPA screenprint strata and earth-tone ink blocks; no readable travel title, signage, specific landmark label, tourist scene, UI, or photo-real landscape.';
  }
  if (preset.id === 'SP04-039') {
    return 'Use one original symbolic montage anchor with painted one-sheet drama; no cast lineup, weapon hero prop, readable title zone, franchise cue, celebrity likeness, or literal film poster text.';
  }
  if (preset.id === 'SP04-040') {
    return 'Use infographic-like hierarchy as abstract chart primitives, icons, modular blocks, and flow shapes around one simple natural system or material cycle; no readable labels, numbers, product, backpack, gear, dashboard UI, app screen, arrows with text, or explainer page screenshot.';
  }
  if (preset.id === 'SP04-041') {
    return 'Use one fashion-illustration card with an elegant elongated runway figure or garment-focused pose, loose gestural ink, watercolor splash accents, editorial whitespace, fabric line speed, and chic atelier energy; no realistic photo model, lingerie, sexualized pose, readable text, logo, camera, backstage studio, chair, curtain, or product catalog layout.';
  }
  if (preset.id === 'SP04-042') {
    return 'Use one surreal album-cover card with a memorable central object paradox, impossible room, or symbolic creature silhouette, square-cover tension, impossible lighting, prismatic accents, matte analog grain, and iconic mystery; no fashion model, runway pose, portrait, band name, record disc, instrument, readable title, celebrity likeness, plain landscape, UI, or canonical album-copy motif.';
  }
  if (preset.id === 'SP04-043') {
    return 'Use one pulp magazine cover card with a dramatic explorer, creature, vehicle, or strange object in lurid adventure staging, hard spotlight contrast, cheap paper wear, sensational diagonals, and masthead-safe composition; no detective, playing card, readable card symbol, readable headlines, guns, knives, explicit peril, gore, sexist damsel trope, modern clean finish, city noir skyline, or logo.';
  }
  if (preset.id === 'SP04-044') {
    return 'Use one vintage travel poster card with a bright destination-like scene, landmark silhouette, traveler-scale figure or transit-era object if useful, flattened scenic planes, optimistic ink bands, archival litho grain, and clean poster framing; no readable destination title, real city label, photo look, airline logo, generic beach ad, or cluttered street market.';
  }
  if (preset.id === 'SP04-045') {
    return 'Use one screenprint gig-poster card with a loud central creature, musician silhouette, object, or emblem, limited spot colors, thick ink contours, overprint drift, distressed border, squeegee drag, and live-event energy; no readable band name, venue text, instrument brand, UI, pure typography, or digital gradient.';
  }
  if (preset.id === 'SP04-046') {
    return 'Use one speedpaint concept card with a rough character, creature, vehicle, or environment beat, large value block-ins, gestural brush economy, opacity passes, mood-first lighting, and selective detail suppression; no polished final render, tiny microdetail, photoreal finish, UI, readable text, or empty abstract smears.';
  }
  if (preset.id === 'SP04-047') {
    return 'Use one cinematic matte-painting card with a vast background plate, atmospheric depth, horizon layering, god-ray haze, photobash realism, and a small scale cue or foreground silhouette if helpful; no cartoon style, sketch look, close-up character focus, UI, readable text, castle cliche, or fantasy corridor.';
  }
  if (preset.id === 'SP04-048') {
    return 'Use one character-sheet card with a clear creature or humanoid design in neutral turnaround/reference presentation, orthographic consistency, clean contour hierarchy, flat color/material blocks, scale cues, and annotation-ready edges; no action pose, dramatic background, readable labels, UI sheet screenshot, weapon showcase, or crowded expression grid.';
  }
  if (preset.id === 'SP04-049') {
    return 'Use one environment-concept card with a navigable place, path-guided composition, atmospheric depth, readable silhouette layering, mood-led worldbuilding, and tiny scale figure only if useful; no character focus, market aisle, library aisle, fantasy corridor, repeated lamp/studio wall, readable signage, or pure landscape postcard.';
  }
  if (preset.id === 'SP04-050') {
    return 'Use one vehicle-design card with a plausible futuristic vehicle or mobility prototype, aerodynamic silhouette, panel segmentation, studio/product highlight, material separation, and engineering-forward form language; no camera prop, weaponized tank, cockpit close-up, readable callouts, brand logo, organic creature, or generic car ad.';
  }
  if (preset.id === 'SP04-051') {
    return 'Use one creature-design card with a clear original creature in design-presentation pose, adaptive anatomy, ecological feature logic, readable predator/guardian silhouette, scales/fur/skin material cues, and rim-light reveal; no human, cute mascot, generic dragon, horror gore, weapon, rider, battle scene, readable text, or fantasy corridor.';
  }
  if (preset.id === 'SP04-052') {
    return 'Use one isometric game-art card with a small modular scene, creature, building chunk, or gameplay object, fixed-angle orthographic logic, tile-grid coherence, bright zone colors, toy-scale abstraction, and consistent isometric shadows; no perspective camera, UI overlay, readable labels, huge map, market aisle, library aisle, or flat front view.';
  }
  if (preset.id === 'SP04-053') {
    return 'Use one storyboard-sketch card with 3-4 rough cinematic panels around one simple beat, greyscale value blocking, frame boxes, camera arrows, motion marks, and red accent shorthand; no readable captions, finished comic page, polished color render, gore, weapon glamor, UI, or overly detailed illustration.';
  }
  if (preset.id === 'SP04-054') {
    return 'Use one prop-design card with an isolated non-weapon artifact, tool, relic, or game-ready object, orthographic clarity, material wear, silhouette-first readability, neutral pedestal lighting, and callout-friendly edges; no sword, gun, blade, weapon, character holding it, inventory UI, readable labels, fantasy hero, or busy background.';
  }
  if (preset.id === 'SP04-055') {
    return 'Use one keyframe-art card with a cinematic story beat, clear environment and one small character or object focal point, motivated light, color-graded mood, widescreen composition, and emotional turning-point weight; no generic fantasy hero posing, weapon focus, battle scene, cliff-only postcard, readable text, UI, or pure landscape without story.';
  }
  if (preset.id === 'SP04-056') {
    return 'Use one photobash concept card with a believable speculative object, vehicle, set piece, or environment fragment, multi-source texture assembly, perspective harmonization, seam-disguise compositing, unified grading, and realistic art-direction cohesion; no fantasy character focus, sword, castle corridor, obvious stock-photo collage, readable text, or cartoon paint.';
  }
  if (preset.id === 'SP04-057') {
    return 'Use blueprint schematic grammar as white technical linework, orthographic fragments, grid, and exploded-view shapes around one simple object or structure; no readable labels, numbers, title blocks, fantasy character, weapon hero, or shaded 3D render.';
  }
  if (preset.id === 'SP04-058') {
    return 'Use low-poly constraint through faceted geometry, vertex-color ramps, hard silhouettes, affine texture cues, and fixed-function shading on one simple object, creature, vehicle, or environment module; no epic fantasy hero, weapon pose, smooth high-res realism, cinematic landscape, photoreal creature, or modern game screenshot.';
  }
  if (preset.id === 'SP04-059') {
    return 'Use HUD grammar as translucent reticles, modular frames, icon-like widgets, cyan-orange vector hierarchy, and screen-space data layers around one abstract vehicle/system silhouette; no readable UI text, numbers, map labels, helmet, gun sight, sword, character hero, mission screen, dashboard screenshot, or FPS combat view.';
  }
  if (preset.id === 'SP04-060') {
    return 'Use weapon-design concept language as mechanical component hierarchy, side-profile silhouettes, ergonomic arcs, scratched-metal material wear, and exploded non-lethal sci-fi tool or industrial device fragments on a neutral concept-sheet background; no literal gun, blade, sword, missile, combat scene, armory wall, corridor, market alley, fantasy hero, character holding object, readable labels, or toy softness.';
  }
  if (preset.id === 'SP04-061') {
    return 'Use linocut relief-print grammar with chunky carved marks, heavy black masses, gouge channels, and a bold folk-tale action vignette: one small traveler, creature, or working animal crossing a graphic landscape shape; no readable text, poster title, workshop scene, portrait bust, mascot cuteness, fantasy armor hero, or fine-detail hatching.';
  }
  if (preset.id === 'SP04-062') {
    return 'Use etching grammar with dense crosshatch, burin-like incision, archival paper, and a compact non-studio subject: weathered astrolabe fragment, fossil shell, ruined arch detail, or mechanical relic in open negative space; no printing press, print studio, paper sheet as subject, banknote, seal, map label, readable document text, portrait bust, fantasy hero, library aisle, market corridor, or smooth shaded render.';
  }
  if (preset.id === 'SP04-063') {
    return 'Use ukiyo-e woodblock grammar through carved contour rhythm, bokashi gradients, flat perspective, and indigo restraint on an original seasonal scene with one small human or animal silhouette integrated into landscape motion; no named masterwork imitation, seal signature, readable calligraphy, actor portrait, wave-only cliche, fantasy temple hallway, or 3D realism.';
  }
  if (preset.id === 'SP04-064') {
    return 'Use stipple dotwork through dot-density value, point clusters, and stroke-less monochrome form on a readable organic subject: moth, skull-like seedpod, mask fragment, or quiet creature study with strong silhouette; no tattoo skin, human portrait, generic animal head trophy, fantasy hero, continuous line drawing, or solid filled shapes.';
  }
  if (preset.id === 'SP04-065') {
    return 'Use lithograph grammar through grease-crayon grain, stone-soft tonal fields, waxy pressure marks, and a quiet illustrative scene with one figure, animal, or vehicle caught in atmospheric tonal haze; no print studio, artist figure, portrait bust, poster layout, readable text, lamp/chair/curtain studio setup, or sharp vector linework.';
  }
  if (preset.id === 'SP04-066') {
    return 'Use screenprint grammar with flat color separations, mesh texture, halftone rosettes, and offset layers on a punchy character, creature, vehicle, or protest-poster-like scene without words; no celebrity likeness, product/can, readable poster title, repeat-grid sheet, fantasy hero with weapon, logo, or painterly gradients.';
  }
  if (preset.id === 'SP04-067') {
    return 'Use monotype grammar with one-pass ink transfer, ghost edges, smudged plate pressure, and non-repeatable ink movement on an expressive non-urban subject: fish, bird, mask, wind-bent tree, or storm-tossed boat silhouette; no human portrait close-up, alley/corridor/street canyon, print studio, artist portrait, table/hand stamping, clean repeat pattern, readable text, lamp/chair setup, or polished fantasy scene.';
  }
  if (preset.id === 'SP04-068') {
    return 'Use cyanotype grammar through Prussian-blue wash, UV-contact silhouettes, soft exposure falloff, and coated-paper grain on a non-human contact-print composition: layered moth wings, folded garment fragments, shells, rope, driftwood, or architectural cutout silhouettes with clear overlap; no person, humanoid, warrior, cape, sword, blade, weapon, mountain hero, botanicals-only cliche, science props, Victorian room scene, portrait, readable notes, red, yellow, or empty abstract wash.';
  }
  if (preset.id === 'SP04-069') {
    return 'Use rubber-stamp grammar through broken thick contours, frame pressure gaps, ink starvation, and red-black stamp-pad economy on a bold non-humanoid emblem: creature silhouette, expedition vehicle, moon-anchor badge, or crate icon scene with no words; no fantasy hero, cape figure, castle, weapon, readable document, official seal text, office desk, paperwork, bureaucracy scene, passport, signature, logo, or perfect vector stamp.';
  }
  if (preset.id === 'SP04-070') {
    return 'Use mezzotint grammar through velvet black matrix, burnished highlight recovery, rocker-tooth softness, and smooth chiaroscuro on a dramatic vessel, raven-like creature fragment, shell, or ceremonial mask emerging from darkness with clear readable form; no human holding object, knife, blade, cross, religious icon, museum wall, portrait bust, gothic room, candlelit scene, night landscape, fantasy hallway, or line-art dominance.';
  }
  if (preset.id === 'SP04-071') {
    return 'Use aquatint grammar through rosin-grain gradients, acid-bitten porous tone, soft shadow pools, and wash-like plate atmosphere on a moody but readable non-gothic subject: fogbound boat, strange animal, weathered gate fragment, or suspended vessel shape in tonal mist; no ruins, gothic arch, castle, fantasy traveler, staff, weapon, haunted hallway, market/library corridor, portrait close-up, empty abstract wash, or sharp etched-line dominance.';
  }
  if (preset.id === 'SP04-072') {
    return 'Use ballpoint pen grammar through blue pressure lines, cumulative hatching, ink clots, paper indent drag, and margin rhythm on a lively sketch subject: creature, small vehicle, toy-like robot, or exploration vignette; no notebook page as main subject, study desk, classroom, readable notes, ballpoint pen prop, hand holding pen, camera, or ultra-dense microdetail noise.';
  }
  if (preset.id === 'SP04-073') {
    return 'Use fountain-pen grammar through hairline-to-broad flex strokes, tapered entry marks, wet-ink pooling, and vellum warmth on an elegant non-human subject: sailing vessel, bird, creature silhouette, mask, or architectural ornament with clear silhouette; no human fantasy hero, sword, blade, weapon, readable writing, manuscript page, signature, letter, desk, fountain pen prop, hand writing, or empty flourish-only abstraction.';
  }
  if (preset.id === 'SP04-074') {
    return 'Use permanent-marker grammar through chisel-tip masses, blunt contour turns, fiber soak, back-bleed ghosts, and black-paper contrast on a bold emblematic creature, character bust, vehicle, or mask-like subject; no readable poster, graffiti tag, signage, marker pen prop, hand drawing, studio wall, or ultra-fine detail.';
  }
  if (preset.id === 'SP04-075') {
    return 'Use traditional tattoo-flash grammar through bold-will-hold contour, flat primaries, pepper shading, and compact emblem logic on one original friendly creature, charm object, ship, bird, or tiny heroic mascot; no skull/rose/dagger cliche, skin, tattoo shop, flash sheet grid, readable banner text, adult body framing, or weapon dominance.';
  }
  if (preset.id === 'SP04-076') {
    return 'Use graffiti tag grammar as abstract aerosol gesture, overspray halos, drip rhythm, chrome-black contrast, and motion curves wrapping a dynamic non-text subject: creature head, racing vehicle, mask, or dancer silhouette; no readable word, name, signature, wall mural, brick alley, vandal scene, spray-can prop, or font sample.';
  }
  if (preset.id === 'SP04-077') {
    return 'Use wildstyle graffiti-piece construction as interlocking flat aerosol letterform architecture on a clean poster-paper background around one non-text creature, vehicle, sneaker-like object, or mask silhouette with saturated spray depth; no readable word, mural wall, brick/block wall, stone wall, building, window, train, street scene, artist tag, spray-can prop, weapon, axe, blade, staff, armored fantasy hero, market/library corridor, or messy tag sample.';
  }
  if (preset.id === 'SP04-078') {
    return 'Use protest-stencil grammar through bridged cutouts, one-ink silhouettes, registration slips, and overspray halos on a strong symbolic creature, raised hand silhouette, bird, broken chain, or small lone figure; no readable slogan, protest crowd, real political figure, wall poster, named artist imitation, literal street scene, or weapon.';
  }
  if (preset.id === 'SP04-079') {
    return 'Use blackletter calligraphic architecture as ornamental broad-nib strokes, diamond joins, and vertical compression shaping one non-text dragon, raven, mask, armor crest, or ornamental beast silhouette; no readable word, manuscript page, scroll, religious document, illuminated capital letter, calligrapher hand, or empty typography sheet.';
  }
  if (preset.id === 'SP04-080') {
    return 'Use brush-pen ink grammar through one-breath gesture arcs, dry-brush fractures, wet pooling, rice-paper bloom, and strong negative space on a decisive standalone animal, creature, mask, boat, or wind-bent tree; no person, portrait, hands, workshop, table, print block, brayer, ink tray, calligraphy text, bamboo cliche, mountain landscape, scroll, brush prop, or hand painting.';
  }
  if (preset.id === 'SP04-081') {
    return 'Use value-thumbnail silhouette exploration as 3-value shape-read study around one readable non-hero subject family: creatures, vehicles, masks, boats, or tool silhouettes in several bold variants; no cliff pose, lone hero, cape figure, staff, weapon, famous artist imitation, readable labels, rigid character-sheet grid, UI board, polished render, color, tiny details, or final concept art.';
  }
  if (preset.id === 'SP04-082') {
    return 'Use photobash-paintover iteration through visible cut seams, lasso shapes, photo-texture patches, paint correction strokes, and grade cohesion on one readable non-human concept: creature fragment, vehicle chunk, field kit, crashed pod, or material-heavy environment slice; no fantasy gate, stone portal, corridor, full character portrait, heroic pose, weapon, before-after layout, robot kitbash default, software UI, text labels, clean final render, or tutorial board.';
  }
  if (preset.id === 'SP04-083') {
    return 'Use loose gesture energy through sweeping action arcs, search lines, smudge trails, and graphite/charcoal force marks on one moving creature, dancer-like figure, animal, or kinetic vehicle silhouette; no named animator imitation, animation frame sheet, anatomy classroom pose, static model sheet, readable notes, or polished character render.';
  }
  if (preset.id === 'SP04-084') {
    return 'Use material texture exploration as visual swatches, surface edge tests, wear patches, macro insets, and material contrast around one tangible subject: creature armor, travel pack, boot, mask, or small vehicle panel; no readable labels, arrows with text, product board, UI grid, workshop table, person, or literal sample catalog.';
  }
  if (preset.id === 'SP04-085') {
    return 'Use mood color-script language through broad color keys, atmosphere bands, value blocks, and time-of-day palette progression around one readable environment beat: harbor, forest clearing, canyon gate, floating market silhouette, or storm-lit road; no character close-up, hero figure, panel grid, storyboard frames, readable notes, finished render, corridor, fantasy castle, or literal film scene.';
  }
  if (preset.id === 'SP04-086') {
    return 'Use callout-detail sheet grammar as orthographic fragments, exploded cutaways, magnified inserts, tick marks, and graphic leader lines around one non-body detail: mask parts, boot sole, saddle buckle, pack clasp, shell housing, or small non-weapon tool; no full character, armor suit, heroic pose, readable labels, dimensions, weapons, vehicle blueprint default, UI board, product manual page, or text annotations.';
  }
  if (preset.id === 'SP04-087') {
    return 'Use silhouette iteration as black-white shape families, proportion variants, negative-space tests, and thumbnail-read forms around one non-humanoid creature, vehicle, mask, or prop archetype; no single hero pose, humanoid lineup, sword silhouette, weapon, colored render, UI grid, readable labels, or polished concept art.';
  }
  if (preset.id === 'SP04-088') {
    return 'Use rough environment-pass rendering through broad macro shapes, atmospheric recession, value blocking, and large painterly strokes on one readable place: canyon gate, industrial dock, forest shrine silhouette, alien plain, or coastal ruins seen wide; no named artist imitation, character close-up, hero figure, weapon pose, finished landscape painting, tiny details, market/library aisle, or corridor/hallway default.';
  }
  if (preset.id === 'SP04-089') {
    return 'Use creature-design iteration as biomorphic anatomy studies, skeletal ghost overlays, locomotion variants, material biology swatches, and silhouette mutations around one original non-human creature family; no named artist imitation, human figure, cute pet, recognizable animal, final render, text labels, medical diagram, or single hero monster.';
  }
  if (preset.id === 'SP04-090') {
    return 'Use prop-variant design as object-shape families, side-view variants, material swaps, exploded mini parts, and graphic callout marks around one useful non-weapon object system: lantern, field pack, mask, climbing tool, musical device, or courier container; no readable labels, weapon set, inventory UI, single hero prop, text annotations, product catalog, or floating contextless object.';
  }
  if (preset.id === 'SP04-091') {
    return 'Use architecture massing model style as foam-core/chipboard block volumes, rough-cut planes, glue seams, shadow massing, and scale cues around one readable spatial concept: pavilion, bridge, tower cluster, stepped shelter, or creature-scale habitat; no finished building render, interior, furniture, workshop table, human hand, realistic photo, city block, or tiny text.';
  }
  if (preset.id === 'SP04-092') {
    return 'Use costume exploration board as textile swatches, cropped garment fragments, sleeves, cuffs, collars, trims, belts, colorway strips, accessory rhythm, and material contrast for one readable role costume; no full posed model, face, body, weapon, sword, staff, figure lineup, fashion catalog, readable labels, body-first portrait, lingerie read, single outfit final, or runway scene.';
  }
  if (preset.id === 'SP04-093') {
    return 'Use lighting scenario pass as same-form relighting studies, rim/bounce variants, shadow temperature shifts, exposure bands, and atmospheric value planning around one readable non-human subject: mask, small shrine, vehicle shell, creature statue, or object silhouette; no character focus, hero pose, panel text, story frames, UI grid, or single finished scene.';
  }
  if (preset.id === 'SP04-094') {
    return 'Use anatomy reference sheet grammar as layered skeletal-like scaffolds, tendon/muscle-flow analogues, cutaways, transparent overlays, and inset structural details around one non-human creature/object system; no named artist imitation, human medical plate, gore, readable labels, classroom page, or realistic cadaver anatomy.';
  }
  if (preset.id === 'SP04-095') {
    return 'Use foliage design kit grammar as leaf-shape families, branching rhythms, canopy clusters, texture swatches, seasonal color strips, bark/fern/moss variants, and growth-pattern studies arranged as a production kit; no humanoid plant creature, forest character, literal forest scene, garden path, house, market plant display, readable labels, or single finished landscape.';
  }
  if (preset.id === 'SP04-096') {
    return 'Use equipment-tier progression as non-weapon object evolution, modular silhouette escalation, material rarity changes, ornament deltas, and comparison rows around lanterns, field packs, masks, boots, or courier containers; no literal gun, blade, axe, sword, spear, combat weapon, inventory UI, readable labels, violent pose, held weapon, or single final artifact.';
  }
  if (preset.id === 'SP04-097') {
    return 'Use composition thumbnail grid grammar as rough grayscale value thumbnails, crop tests, focal hierarchy, lens-like framing, and shot-size alternatives around one readable object or environment idea: vehicle wreck, harbor gate, creature nest, shrine, or road bend; no named director imitation, readable notes, full storyboard sequence, character acting scene, UI, labels, or polished render.';
  }
  if (preset.id === 'SP04-098') {
    return 'Use world-map concept as abstract cartographic plate: parchment, contour coastlines, island masses, rhumb-line geometry, terrain icons, route marks, cartouche shapes, and aged ink; no readable labels, compass hero prop, fantasy novel map cliche, political borders, modern map UI, city names, or text.';
  }
  if (preset.id === 'SP04-099') {
    return 'Use UI/HUD wireframe concept as abstract interface architecture: safe-zone frames, modular panels, reticle placeholders, stat-block boxes, scanline grids, icon blanks, and hierarchy guides around a neutral geometric object silhouette; no face, mask, character, readable UI text, numbers, screenshot, game scene, weapon targeting, dashboard app, logo, or polished final UI.';
  }
  if (preset.id === 'SP04-100') {
    return 'Use monster size comparison chart as clean baseline-aligned silhouette scale study with several abstract creature forms, tick-like marks, and proportional hierarchy; no readable labels, numbers, human benchmark figure, city skyline, single creature, realistic monster portrait, or infographic text.';
  }
  if (preset.id === 'SP05-021') {
    return 'Use an original youth-adventure anime style-card: one energetic but non-famous character silhouette or costume fragment with teal-orange cloth motion, training-scroll geometry, optimistic speed arcs, and clean cel shading; no recognizable ninja franchise, forehead metal plate, spiral emblem, kunai, shuriken, village wall, named-series headband, copied hairstyle, or weapon-first pose.';
  }
  if (preset.id === 'SP05-022') {
    return 'Use an original urban-supernatural anime style-card: monochrome fashion silhouette, spectral ribbon aura, black-white-violet pressure geometry, and severe cel shadows around one non-famous character/object fragment; no katana, soul reaper uniform, bleach-like robe, named-series weapon, crosswalk fight, school uniform copy, or recognizable franchise face.';
  }
  if (preset.id === 'SP05-023') {
    return 'Use an original elastic-adventure anime style-card: bright open-sky palette, nautical cloth rhythm, exaggerated expression geometry, rope-like motion arcs, and carnival-scale freedom around one non-famous adventurer/object emblem; no pirate skull flag, straw-hat likeness, copied crew outfit, ship mast scene lock, treasure-map cliche, or franchise insignia.';
  }
  if (preset.id === 'SP05-025') {
    return 'Use an original cerebral thriller anime style-card: austere black-paper-red composition, symbolic choice marks, chesslike shadow geometry, notebook-like texture as abstract surface only, and tense stillness; no schoolboy detective likeness, readable notebook, death-note cue, police chase, gore, battle scene, weapon, or copied franchise face.';
  }
  if (preset.id === 'SP05-028') {
    return 'Use an original lo-fi rhythm-action anime style-card: beat-synced cloth motion, ink-brush speed arcs, warm sepia-cyan groove, and streetwise cool around one non-famous character/object fragment; no katana-first pose, samurai-copy outfit, named-series roadtrip trio, hip-hop stereotype, dead bodies, or school-stair fight.';
  }
  if (preset.id === 'SP05-029') {
    return 'Use an original chaotic indie-adolescence anime style-card: collage panels, abrupt color blocks, expressive rough line, surreal pop stickers without readable text, and teenage emotional motion around one invented character/shape anchor; no franchise likeness, school fight, weapon, readable poster, logo, camera, or ultra-detailed battle scene.';
  }
  if (preset.id === 'SP05-031') {
    return 'Use an original ornamental fantasy-action anime style-card with a full readable non-famous protagonist, calligraphic elemental arcs, patterned ceremonial cloth, luminous petals, and choreographed breathing-motion energy. Keep clean cel shapes, broad color blocks, and controlled detail density; no visible blade, sword-first pose, named demon-hunter likeness, checker haori copy, mouth gag, blood, combat kill, dense forest, ruin corridor, or noisy debris field.';
  }
  if (preset.id === 'SP05-032') {
    return 'Use an original urban-occult anime style-card with one charismatic non-famous sorcerer-like protagonist, streetwear silhouette, abstract curse geometry, pressure-field ribbons, black-cyan-violet contrast, and confident hand-acting. Keep graphic shadow blocks and clean aura shapes over tiny particle noise; no school uniform copy, finger/talisman fetish prop, monster gore, named sorcerer likeness, alley fight pileup, readable sigils, dense forest, ruin corridor, or generic shonen rubble.';
  }
  if (preset.id === 'SP05-033') {
    return 'Use an original chaotic punk-action anime style-card with one messy antihero protagonist, jagged grin energy, rough jacket silhouette, red ink splatter as graphic paint, halftone ruptures, absurd creature shapes, and comedic shock timing. Keep punchy poster shapes and readable face/pose, not micro-noisy gore texture; no chainsaw head, gore, severed limbs, blood realism, named character likeness, weapon-first composition, horror torture, dense forest, or ruin corridor.';
  }
  if (preset.id === 'SP05-034') {
    return 'Use an original bright hero-academy anime style-card with one optimistic trainee protagonist, bold expressive pose, emblem-like but unreadable costume shapes, upbeat motion arcs, civic color blocks, and aspirational cel polish. Favor clean broadcast anime, simple readable background, and low-noise highlights; no school uniform copy, superhero franchise likeness, green-haired hero, numbered hero suit, cape-logo copy, classroom scene, readable badges, dense forest, or rubble field.';
  }
  if (preset.id === 'SP05-035') {
    return 'Use an original vertical-survival anime style-card with one tense scout protagonist, harness/tether geometry, wind shear, wall-scale vertical depth, and disciplined fear-forward body language. Keep strong silhouette and large value shapes instead of gritty microtexture; no giant humanoid, titan likeness, blood, eaten-body implication, military insignia, named corps outfit, rooftop gore, despair portrait, dense forest, or generic ruin corridor.';
  }
  if (preset.id === 'SP05-036') {
    return 'Use an original colossal-war-drama anime style-card with one small human protagonist or commander silhouette dwarfed by mechanized scale, smoke planes, torn banners, institutional geometry, and mournful pressure. Keep the composition broad, cinematic, and readable with restrained texture; no real-world uniforms, fascist insignia, giant humanoids, battlefield gore, guns foreground, named franchise likeness, propaganda poster text, dense forest, or same ruined corridor formula.';
  }
  if (preset.id === 'SP05-037') {
    return 'Use an original impact-frame comedy anime style-card with one deadpan gag protagonist, absurdly calm posture, blank reaction geometry, dust-cloud rings, shattered graphic debris, and satirical overpowered energy. Keep crisp cel comedy timing and simple readable shapes; no bald caped hero likeness, yellow suit, red gloves, punch contact, gore, destroyed city panorama, franchise face, dense forest, or noisy rubble storm.';
  }
  if (preset.id === 'SP05-038') {
    return 'Use an original psychedelic psychic minimalism anime style-card with one anxious plainclothes protagonist, rough sketch aura, pastel emotional rupture, simple silhouette acting, warped pop shapes, and deliberately sparse psychic distortion. Preserve minimalism and air; no bowl-cut psychic boy likeness, school uniform copy, city-destruction scene, readable symbols, gore, franchise face, dense background, or over-rendered particle field.';
  }
  if (preset.id === 'SP05-039') {
    return 'Use an original tactical-adventure shonen style-card with one clever young adventurer protagonist, diagrammatic motion vectors, ability-network motifs, discovery-map energy as abstract shapes, and playful strategic confidence. Keep clean cel readability and distinct costume color logic; no hunter-license copy, card-game UI, readable labels, fishing-rod hero prop, green outfit copy, franchise team likeness, dense forest, or generic ruin corridor.';
  }
  if (preset.id === 'SP05-040') {
    return 'Use an original mythic urban-fantasy anime style-card with one composed protagonist, ceremonial opposition, repeated luminous emblems, reality-fold ribbons, and symbolic field geometry. Keep the scene graphic, ritual, and character-led with controlled glow, not noisy blade spectacle; no sword field, blade rain, red-cloaked archer likeness, servant duel, holy-grail iconography, weapon-first composition, franchise face, dense forest, or ruin corridor.';
  }
  if (preset.id === 'SP05-051') {
    return 'Use an original neon kinetic alloy sprint style-card with reflective prosthetic-like geometry, speed ribbons, alloy panels, and engineered motion around cropped limbs/mech fragments; no named cyborg heroine likeness, roller-blade weapon feet, gore, police logo, readable UI, or full body fan-art pose.';
  }
  if (preset.id === 'SP05-052') {
    return 'Use an original surveillance verdict grid style-card with cold institutional scanning planes, anonymous silhouettes, forensic blue panels, barcode-like non-text marks, and judgment geometry; no readable UI text, police badge, real-world law enforcement, gun, crime scene gore, celebrity likeness, or Psycho-Pass-specific weapon/device.';
  }
  if (preset.id === 'SP05-053') {
    return 'Use an original hydraulic attrition mass style-card with scarred armor plates, piston clusters, mud-heavy mechanical joints, load-bearing silhouettes, and worn industrial grime; no tank, firearm, battlefield, soldier, real military insignia, franchise mech likeness, gore, or weapon-first composition.';
  }
  if (preset.id === 'SP05-054') {
    return 'Use an original luminous beam opera style-card with radiant diagonal energy, sleek space-opera machinery, colored light hierarchy, and melodramatic scale; no beam saber, Gundam-like faceplate, cockpit hero portrait, named mecha likeness, laser weapon focus, readable UI, or war gore.';
  }
  if (preset.id === 'SP05-055') {
    return 'Use an original gothic tech dread style-card with sacred industrial verticality, black-metal shell forms, bio-synthetic unease, restrained menace, and cathedral-like machine rhythm; no Eva-like giant, crucifix pose, exposed organs, gore, hospital tube body, franchise robot silhouette, or religious icon copy.';
  }
  if (preset.id === 'SP05-056') {
    return 'Use an original geometric ignition urgency style-card with flat flame vectors, angular rescue-machine fragments, pastel-neon heat, and optimistic motion geometry; no Gurren-like drill face, firefighting disaster scene, real emergency logo, burning people, gore, weapon, readable text, or franchise robot.';
  }
  if (preset.id === 'SP05-057') {
    return 'Use an original sleek collapse romance style-card with polished suit fragments, sunset ruins, floral-tech melancholy, soft alarms, and engineered tenderness; no Darling-like couple pose, sexualized bodysuit, exposed skin focus, cockpit romance scene, franchise plugsuit, readable UI, or ruined city cliche.';
  }
  if (preset.id === 'SP05-058') {
    return 'Use an original remote command grief style-card with distant control geometry, drone-like machine silhouettes, muted tactical panels, youth burden shown through posture, and cold blue-gray systems; no child soldier exploitation, gun, cockpit UI text, real military insignia, drone strike gore, readable maps, or franchise uniform.';
  }
  if (preset.id === 'SP05-059') {
    return 'Use an original tactical network cognition style-card with translucent data layers, modular overlay geometry, anonymous agent silhouette fragments, optical glass planes, and calm investigative tension; no readable UI text, brand logo, celebrity spy likeness, real institution badge, gun, camera prop, surveillance screen wall, or franchise cyber-police device.';
  }
  if (preset.id === 'SP05-060') {
    return 'Use an original orbital rivalry symmetry style-card with crystalline seams, high-altitude arcs, suspended mecha fragments, paired abstract silhouettes, and elegant strategic tension; no named orbital mecha likeness, beam weapon, cockpit portrait, real national flags, space battle gore, readable insignia, or weapon-first duel.';
  }
  if (preset.id === 'SP05-061') {
    return 'Use an original crosshatched doom-weight style-card with scar-dense ink hatching, eclipse-black negative space, cursed emblem geometry, and oppressive scale around armor/stone/object fragments; no gore, severed bodies, sexual violence, famous dark-fantasy swordsman likeness, giant sword, torture scene, or readable occult text.';
  }
  if (preset.id === 'SP05-062') {
    return 'Use an original crimson metamorphosis style-card as a split mask/emblem specimen: fractured lacquer mask halves, membrane translucency, restrained crimson pressure, and alienated identity without any humanoid body. No person, face, full figure, robe, sword, red blade, weapon ribbon, gothic ruin, cathedral, gore, organs, cannibalism, realistic blood, famous ghoul mask likeness, body horror closeup, teeth-mouth focus, or violent attack scene.';
  }
  if (preset.id === 'SP05-063') {
    return 'Use an original crimson gothic authority style-card with aristocratic black-crimson geometry, ceremonial voids, severe silhouette hierarchy, and predatory elegance as abstraction; no vampire franchise likeness, Nazi/fascist insignia, guns, gore, bite scene, religious icon copy, readable crest, or blade-first pose.';
  }
  if (preset.id === 'SP05-064') {
    return 'Use an original wind-scoured redemption style-card with weathered restraint, sparse horizon pressure, dry abrasion, muted earths, and moral weight around a cloaked silhouette/object fragment; no named samurai likeness, duel pose, katana foreground, blood, revenge-kill scene, historical flag, or battlefield gore.';
  }
  if (preset.id === 'SP05-065') {
    return 'Use an original pale threshold horror style-card with porcelain-pale threshold planes, ash-matte surfaces, silver edge tension, and quiet dread as shape language; no hunter/prey body, chase, weapon, blood, gore, monster, corridor, or confrontation scene.';
  }
  if (preset.id === 'SP05-066') {
    return 'Use an original invasive thriller style-card as ceramic-botanical corruption: clean pale planes split by organic seam geometry and clinical crimson stress; no body, anatomy, flesh, organs, gore, face, hands, surgery, creature, or body-horror closeup.';
  }
  if (preset.id === 'SP05-067') {
    return 'Use an original lush abyssal toll style-card with bioluminescent mineral bloom, damp relic patina, vertical depth pressure, and beautiful unsafe wonder; no explorer, cave tunnel, fantasy corridor, monster, map, lantern, or expedition gear.';
  }
  if (preset.id === 'SP05-068') {
    return 'Use an original grimy sorcery collision style-card with soot, broken enamel, portal-like crop interruptions, illegible occult-industrial stains, and absurd menace as texture; no readable sigils, protagonist mask portrait, weapon, alley corridor, franchise wizard, or text.';
  }
  if (preset.id === 'SP05-069') {
    return 'Use an original procedural low-fantasy grit style-card with worn stone slabs, scuffed dirty metal, narrow practical light as abstract slices, and problem-solving severity; no corridor, dungeon hallway, adventurer, torch/lamp prop, weapon, enemy, blood, or game UI.';
  }
  if (preset.id === 'SP05-070') {
    return 'Use an original neon tragic metamorphosis style-card with blacklight glass, smoke, elastic color smear, acid magenta/cyan collapse, and emotional overload as abstract silhouette pressure; no franchise likeness, demon body, nude body, gore, anatomy, club scene, crowd, or horror attack.';
  }
  if (preset.id === 'SP05-091') {
    return 'Use an original glowing virtual-fantasy style-card with crystalline portal depth, cyan atmosphere, soft romantic scale, and tactile digital light; no named VR franchise likeness, readable HUD, UI panels, icons, swords, game menu, logo, or character costume copy.';
  }
  if (preset.id === 'SP05-092') {
    return 'Use an original reset-loop dark fantasy style-card with violet-silver spiral pressure, fragile relic ribbons, repeated light echoes, and ornate dread; no named character, mansion/market location, death scene, gore, maid/cat-ear costume cue, or franchise color pairing.';
  }
  if (preset.id === 'SP05-093') {
    return 'Use an original wandering mage chronicle style-card with weathered travel relic, mana contour lines, parchment grain, and open sky curiosity; no readable map labels, staff-wielding protagonist, school uniform, harem cue, road party, or text.';
  }
  if (preset.id === 'SP05-094') {
    return 'Use an original party-quest comedy style-card with bright anticlimax magic burst, elastic prop fragments, cheerful fantasy color, and comic timing; no fixed group, tavern, readable sign, lewd gag, canon costume, or franchise party likeness.';
  }
  if (preset.id === 'SP05-095') {
    return 'Use an original afterquest melancholy fantasy style-card with relic meadow memory motes, soft horizon light, quiet spell traces, and time-softened grief; no named elf mage likeness, party lineup, road scene, ritual circle, or franchise costume copy.';
  }
  if (preset.id === 'SP05-096') {
    return 'Use an original hyper-saturated strategy fantasy style-card with candy-neon arena geometry, floating rule planes, impossible perspective, and confident color logic; no cards, chess pieces, dice, numbers, readable symbols, game UI, or sibling character likeness.';
  }
  if (preset.id === 'SP05-097') {
    return 'Use an original dark dominion style-card with bone-ivory monolith, baroque symmetry, cold magical dust, and oppressive authority; no skeletal ruler, literal throne, army, skull pile, cathedral copy, Nazi/fascist insignia, or franchise likeness.';
  }
  if (preset.id === 'SP05-098') {
    return 'Use an original optimistic civic fantasy style-card with rounded growth motifs, gel-like blue accents, clean timber/stone harmony, and cooperative brightness; no literal slime creature, banners with symbols, kingdom crowd, named ruler likeness, or franchise species cue.';
  }
  if (preset.id === 'SP05-099') {
    return 'Use an original defensive underdog fantasy style-card with concentric barrier geometry, scarred bronze/stone relic, forward resilience, and hard-earned glow; no literal shield, hero portrait, weapon, slave/collar cue, revenge scene, or franchise likeness.';
  }
  if (preset.id === 'SP05-100') {
    return 'Use an original luminous ascent fantasy style-card with warm crystal well, vertical mineral depth, hopeful glow, and mythic smallness; no dungeon corridor, lantern-as-only-prop, generic corridor adventurer, goddess/canon costume, monster, weapon, or hallway perspective.';
  }
  if (preset.id === 'SP05-121') {
    return 'Use an original lantern-elemental motion style-card with patterned warmth, breathlike luminous arcs, winter-blue/amber contrast, and ceremonial tenderness; keep it non-graphic, non-derivative, no famous costume copy, no blade-forward pose, no readable text.';
  }
  if (preset.id === 'SP05-122') {
    return 'Use an original grimy contract-panic action style-card with industrial grime, fluorescent fatigue, jagged impact rhythm, and deadpan absurdity; keep it non-graphic, non-derivative, no tool-headed character, no famous uniform copy, no blade-forward pose, no readable text.';
  }
  if (preset.id === 'SP05-123') {
    return 'Use an original ceremonial inferno action style-card with ember halos, sacred heat geometry, black silhouette cuts, and emergency brightness; no famous uniform copy, no literal chapel interior, no icon copy, no injury scene, no readable insignia.';
  }
  if (preset.id === 'SP05-124') {
    return 'Use an original predator-ego sports intensity style-card with electric-blue field-line abstractions, pressure zones, target-lock geometry, and competitive focus; no named soccer character, team logo, readable numbers, stadium crowd, ball closeup, or violent assault.';
  }
  if (preset.id === 'SP05-125') {
    return 'Use an original civic colossal-response action style-card with municipal hazard color, infrastructure scale markers, response-grid clarity, and resilient order; no famous creature copy, no monster face closeup, no armed squad, no readable signage, no destruction aftermath.';
  }
  if (preset.id === 'SP05-126') {
    return 'Use an original paranormal turbo comedy style-card with ghostly teal/hot pink collision, elastic reaction marks, alien-lime absurdity, and warm romantic recoil; no famous duo copy, no readable glyphs, no school corridor, no creature attack, no crude joke.';
  }
  if (preset.id === 'SP05-129') {
    return 'Use an original deadpan prestige impact satire style-card with blockbuster polish, flat reaction space, absurd scale contrast, and clean impact geometry; no named franchise likeness, bald hero copy, fist foreground, city destruction gore, weapon, or readable text.';
  }
  if (preset.id === 'SP05-130') {
    return 'Use an original psychic paint-surge style-card with sincere simple silhouette, acid paint aura, rough sketch energy, and emotional overload; no named franchise likeness, school uniform copy, city fight, weapon, readable symbols, or angry monster face.';
  }
  if (preset.id === 'SP05-133') {
    return 'Use an original deadpan magic-force comedy style-card with ornate spell curls interrupted by blunt blocky impact, straight-faced timing, and clean academy color; no named franchise likeness, fist-first brawl, weapon, school hallway, readable crest, or magic-circle text.';
  }
  if (preset.id === 'SP05-134') {
    return 'Use an original mundane-action velocity style-card with one calm empty-handed protagonist, retail-light color blocks, snapped motion lanes, and dead-calm timing; no supermarket aisle, weapon, product labels, crowd, storefront, or franchise likeness.';
  }
  if (preset.id === 'SP05-137') {
    return 'Use an original science-blueprint optimism style-card with handmade invention glow, chalk schematic shapes as non-readable marks, mineral sunlight, and practical discovery; no named franchise likeness, readable formulas, lab classroom, weapon, or tool pile.';
  }
  if (preset.id === 'SP05-140') {
    return 'Use an original ancient-calm spell-impact style-card with pale sky memory, precise arcane geometry, soft cloth, and understated authority; no named franchise likeness, battle blast, staff hero pose, weapon, readable magic circle, or party lineup.';
  }
  if (preset.id === 'SP05-221') {
    return 'Use an original pop-signal engineered-motion style-card with one human-scale signal silhouette, cyan-pink contrail calligraphy, alloy panel rhythm, and hopeful gold edge light; no idol portrait, cockpit closeup, concert stage, missile barrage, readable UI, crowd, or robot face closeup.';
  }
  if (preset.id === 'SP05-143') {
    return 'Use an original electric night-rain noir style-card with wet glass, cyan thread arcs, masked negative space, and lonely secrecy; no named franchise likeness, gun, knife, assassin pose, surveillance UI, readable signs, or alley corridor lock.';
  }
  if (preset.id === 'SP05-144') {
    return 'Use an original lo-fi sunbaked rhythm style-card with dusty gold, vinyl-scratch overlays, relaxed motion attitude, and offbeat crop; no named franchise likeness, sword foreground, duel pose, dojo corridor, readable graffiti, or samurai costume copy.';
  }
  if (preset.id === 'SP05-148') {
    return 'Use an original jazz-pulp motion style-card with brass warmth, amber chaos, syncopated silhouettes, and rail-era rhythm as atmosphere; no named franchise likeness, gun foreground, blood, train-car corridor lock, readable signage, or gang lineup.';
  }
  if (preset.id === 'SP05-222') {
    return 'Use an original civic machine procedure style-card with maintenance grids, utility color, practical engineering, wet asphalt reflections, and procedural humor; no named franchise likeness, cockpit UI, drone weapon, robot battle, readable paperwork, or garage corridor lock.';
  }
  if (preset.id === 'SP05-225') {
    return 'Use an original scrap-velocity resilience style-card with dented alloy, spark trails, compact fast motion, and rough human-made machine grit; no named franchise likeness, robot duel, weapon arm, cockpit UI, scrapyard corridor, readable decals, or gore.';
  }
  if (preset.id === 'SP05-228') {
    return 'Use an original pale machine elegy style-card with worn enamel, dust silence, lonely synthetic grace, and white mechanical fragments; no named franchise likeness, humanoid robot copy, hangar corridor, weapon, readable serial marks, or cockpit UI.';
  }
  if (preset.id === 'SP05-231') {
    return 'Use an original coral resonance liturgy style-card with abyssal blue, coral biomechanical geometry, sonic halo symmetry, and sacred machine scale; no named franchise likeness, cockpit UI, weapon, angel/robot copy, cathedral corridor, readable glyphs, or body-horror gore.';
  }
  if (preset.id === 'SP05-236') {
    return 'Use an original compact attrition hardware style-card with low utility chassis logic, mud-rust texture, compressed machine mass, and pragmatic survival materiality; no named franchise likeness, gun foreground, tank copy, soldier portrait, battlefield gore, readable markings, or garage corridor lock.';
  }
  if (preset.id === 'SP05-239') {
    return 'Use an original bubblegum cosmic scale style-card with elastic pop geometry, huge joyful color, cosmic flare, and sincere chaos; no named franchise likeness, cockpit, weapon, mecha battle, readable UI, or toy-logo composition.';
  }
  if (preset.id === 'SP05-243') {
    return 'Use an original classic OVA quest tapestry style-card with noble color blocks, painted epic light, and aged cel-fantasy depth; no named franchise likeness, fixed ensemble lineup, weapon foreground, readable banner, or castle hallway lock.';
  }
  if (preset.id === 'SP05-244') {
    return 'Use an original jade-cinnabar ritual authority style-card with solemn vertical protocol, court textile geometry, and ceremonial calm; no named franchise likeness, imperial costume copy, throne-room lock, weapon, or readable insignia.';
  }
  if (preset.id === 'SP05-245') {
    return 'Use an original windblown prophecy romance style-card with carmine sky, angular destiny shapes, and emotional forward motion; no named franchise likeness, tarot card, mecha copy, weapon-first pose, or readable symbol.';
  }
  if (preset.id === 'SP05-246') {
    return 'Use an original amber-turquoise arabesque adventure style-card with jewel ornament, warm desert rhythm, and curved route energy; no named franchise likeness, market aisle, caravan clutter, labyrinth corridor, readable sign, or map.';
  }
  if (preset.id === 'SP05-248') {
    return 'Use an original functional fantasy cuisine style-card with warm craft process, ecological fantasy ingredients, communal utility, and cooking glow; no named franchise likeness, market stall, monster corpse, gore, banquet spread lock, readable recipe, or kitchen clutter.';
  }
  if (preset.id === 'SP05-250') {
    return 'Use an original quiet vow sacred-stone fantasy style-card with ethical calm, soft vow light, and grounded holy geometry; no named franchise likeness, paladin armor copy, weapon, temple hallway, readable scripture, or throne pose.';
  }
  if (preset.id === 'SP05-255') {
    return 'Use an original gem-engine cooperative magic style-card with bright upward energy, chromatic teamwork, and rune-mechanical glow; no named franchise likeness, magic-knight costume copy, group lineup, weapon foreground, readable glyphs, or logo.';
  }
  if (preset.id === 'SP05-256') {
    return 'Use an original folklore-threshold romance style-card with talisman color, temporal nostalgia, purifying aura, and mythic dusk motion; no named franchise likeness, red-robed character copy, shrine hallway, sword, demon attack, readable talisman text, or well prop lock.';
  }
  if (preset.id === 'SP05-252') {
    return 'Use an original warm travel-comfort fantasy style-card with steam glow, generous road-camp calm, rounded hospitality shapes, and food warmth as atmosphere; no named franchise likeness, market corridor, tavern clutter, readable sign, or banquet table lock.';
  }
  if (preset.id === 'SP05-253') {
    return 'Use an original botanical healing fantasy style-card with glass-green softness, herbarium glow, formal calm, and clean prepared surfaces; no named franchise likeness, laboratory room lock, bookshelf, readable label, or crowded table.';
  }
  if (preset.id === 'SP05-254') {
    return 'Use an original celestial romance omen style-card with astral halos, constellar ornament, clean melodrama, and one symbolic portal glow; no named franchise likeness, couple copy, school uniform, readable sigil, shrine hallway, or tarot/card prop.';
  }
  if (preset.id === 'SP05-257') {
    return 'Use an original moonlit practical diplomacy fantasy style-card with restrained violet aura, trade-road poise, dry calm, and one sharp negotiation token; no named franchise likeness, market aisle, merchant stall clutter, readable sign, or map.';
  }
  if (preset.id === 'SP05-258') {
    return 'Use an original utility craft party-quest style-card with competent hands, small functional craft, warm tool-metal accents, and humble support energy; no named franchise likeness, toolbox pile, workshop table lock, weapon, or readable label.';
  }
  if (preset.id === 'SP05-259') {
    return 'Use an original storybook courage fantasy style-card with soft scale, simple crown motif, moral warmth, vulnerable bravery, and clear fable shapes; no named franchise likeness, child-copy design, castle hallway, royal portrait, or readable emblem.';
  }
  if (preset.id === 'SP05-260') {
    return 'Use an original pastel companion quest style-card with candy-clean light, shared joy, soft abundance, and camaraderie color; no named franchise likeness, banquet-table lock, food spread as only subject, idol group pose, or readable sign.';
  }
  if (preset.id === 'SP05-262') {
    return 'Use an original quiet moral suspense style-card with ordinary matte danger, restrained realism, subdued color, and one readable human-scale anchor; no named franchise likeness, school corridor, courtroom, weapon, blood, readable text, or cinematic IP pose.';
  }
  if (preset.id === 'SP05-265') {
    return 'Use an original rose-black lacquer gothic romance style-card with decadent ornament, moonlit restraint, velvet shadow, and one elegant symbolic figure or object; no named franchise likeness, coffin, blood, weapon, cathedral hallway, or readable crest.';
  }
  if (preset.id === 'SP05-271') {
    return 'Use an original sun-bleached concrete mystery style-card with plant-softened architecture, quiet anomaly, warm dust, and one simple figure or object; no named franchise likeness, institutional corridor, classroom, hospital, readable sign, or empty landscape.';
  }
  if (preset.id === 'SP05-272') {
    return 'Use an original rain-polished machine mourning style-card with forensic stillness, wet metal, noir blues, and one softened mechanical or human-scale anchor; no named franchise likeness, interior investigation room, gun, gore, readable UI, or police signage.';
  }
  if (preset.id === 'SP05-273') {
    return 'Use an original moonlit ecological calm style-card with pale living haze, quiet biosphere glow, and one readable organic anchor; no named franchise likeness, empty abstract mist, forest corridor, lab specimen table, monster attack, or readable label.';
  }
  if (preset.id === 'SP05-278') {
    return 'Use an original crystalline loneliness style-card with mineral fractures, clean pale void, emotional isolation, and one readable crystal/figure silhouette; no named franchise likeness, empty abstract-only field, ice palace corridor, weapon, gore, or readable symbol.';
  }
  if (preset.id === 'SP08-002') {
    return 'Use an original streetwear hype style-card with oversized garment mass, sneaker-scale detail, reflective hits, and outdoor drop-culture energy; no bedroom, studio room, chair, curtain, clothing rack, readable branding, logo, or storefront ad.';
  }
  if (preset.id === 'SP08-026') {
    return 'Use an original road-worn leather utility style-card with chrome hardware, grease-black leather, denim texture, and open-road material grit; no indoor room, studio backdrop, curtain, bed, chair, intimidation pose, gang insignia, readable patch, or motorcycle-club scene.';
  }
  if (preset.id === 'SP08-027') {
    return 'Use an original skate-zine casual style-card with hoodie mass, grip-tape grit, suede scuffs, concrete ledge energy, and relaxed motion; no bedroom, studio room, chair, curtain, fisheye camera, logo, skatepark lock, or parking-lot lock.';
  }
  if (preset.id === 'SP08-035') {
    return 'Use an original ceremonial lacquer armor style-card with silk lacing, crest geometry, layered shoulder panels, and disciplined red-black-gold craft; no weapon, combat pose, castle interior, bamboo forest, named warrior, or human face closeup.';
  }
  if (preset.id === 'SP08-037') {
    return 'Use an original frontier workwear style-card as garment-first adult fashion figure: face-minimized but complete head/torso/limbs, duster sweep, oilskin leather, denim, saddle-tan dust, bandana folds, brass hardware, and boot-leather rhythm; no headless crop, mannequin, cowboy portrait, gunslinger, holster focus, pistol, rope foreground, spurs, horse, saloon, western street standoff, desert hero pose, studio room, chair, curtain, lamp, market aisle, library aisle, or camera prop.';
  }
  if (preset.id === 'SP08-038') {
    return 'Use an original 1970s disco style-card with wide lapels, flare geometry, platform-sole rhythm, polyester sheen, gold accents, mirror-ball sparkle, and one lively fashion anchor; no literal club corridor, stage performance, named venue, band, microphone, crowd scene, studio room, chair, curtain, lamp, readable logo, or camera prop.';
  }
  if (preset.id === 'SP08-040') {
    return 'Use an original retro EVA suit style-card as suit-engineering portrait crop: blank beta-cloth torso, bubble-helmet edge, gold visor reflection, gasket rings, hose rhythm, glove bulk, aluminum connectors, and vacuum-like light; no readable agency logo, flag patch, national emblem, mission patch, astronaut hero pose, lunar reenactment, spaceship corridor, control room, museum exhibit, helmet-only closeup, studio room, chair, curtain, lamp, or camera prop.';
  }
  if (preset.id === 'SP08-065') {
    return 'Use an original neon light suit style-card as tech-fashion adult figure crop: complete head/torso/limbs, matte black panels, cyan circuit tracery, modular seams, emitter-plate glow, and luminous piping on fabric; no mannequin, torso-only crop, face-forward glamour, superhero pose, bodysuit pinup, franchise icon, helmet visor silhouette, held disc, weapon, floor-grid arena, neon vehicle, cyberpunk alley, studio room, chair, curtain, lamp, market aisle, library aisle, or camera prop.';
  }
  if (preset.id === 'SP07-003') {
    return 'Use an original mid-century modern style-card with one readable built/furniture-detail anchor, low horizontal proportion, walnut/teak warmth, tapered-leg geometry, molded plywood curves, tweed texture, and atomic-era optimism; no staged living room formula, sofa-and-lamp scene, dominant chair, curtain wall, showroom corner, readable poster, market aisle, library aisle, camera prop, or empty abstract tile.';
  }
  if (preset.id === 'SP07-015') {
    return 'Use an original Victorian mansion style-card with one readable ornate architectural/material anchor, dark carved wood, brocade density, aged brass, floral pattern layering, velvet weight, and low ritual glow; no literal mansion room, curtain-dominant composition, chair-and-lamp setup, fireplace tableau, corridor, library aisle, market aisle, readable portrait, ghost story scene, or empty abstract tile.';
  }
  if (preset.id === 'SP07-032') {
    return 'Use an original metropolitan transit patina style-card with one readable infrastructure anchor, chipped ceramic tile, worn safety band, oxidized steel, anti-slip floor texture, abstract non-readable wayfinding stripes, and damp fluorescent pressure; no readable text, map, logo, ad, subway-car hero, long empty corridor, market aisle, library aisle, fantasy hall, camera prop, or featureless abstraction.';
  }
  if (preset.id === 'SP07-035') {
    return 'Use an original bibliographic classicism style-card with one readable archival material/built-detail anchor, leather-paper-brass hierarchy, vertical catalog rhythm, green-amber warmth, worn gilding, oak patina, and solemn preservation logic; no literal library aisle, bookstore corridor, reading table, desk lamp, open book prop, hand holding book, readable text, market aisle, fantasy hall, or empty abstract tile.';
  }
  if (preset.id === 'SP07-038') {
    return 'Use an original ossuary-subterranean style-card with chalky calcic mineral modules, low compressed arches, dusty mortar, calcium bands, damp buried stone, and reverent archaeological pressure around one readable built fragment; no human remains, skulls, bones, gore, horror display, catacomb corridor, dungeon hall, fantasy tunnel, ritual scene, camera prop, or empty abstract tile.';
  }
  if (preset.id === 'SP07-054') {
    return 'Use an original techno-brutalist compression style-card with one readable megastructure section anchor, stacked concrete modules, exposed service conduits, cable diagonals, rust-black panels, low neon utility glow, and constrained vertical pressure; no hallway/corridor, surveillance camera, fantasy hall, cyberpunk alley, market aisle, library aisle, room-with-chair setup, readable signage, or empty abstract tile.';
  }
  if (preset.id === 'SP07-039') {
    return 'Use an original data-center grid style-card with one readable machine-infrastructure anchor, modular containment panels, perforated steel, cable-routing logic, blue/amber status LEDs, thermal-lane compression, and powder-coated surfaces; no server-room aisle lock, long corridor, surveillance camera, monitor wall, readable labels, UI, office room, chair, market aisle, library aisle, or empty abstract tile.';
  }
  if (preset.id === 'SP07-043') {
    return 'Use an original karesansui dry-abstraction style-card with one readable raked mineral landscape anchor, disciplined gravel waves, two or three granite stones, moss pinpoints, low-angle furrow shadows, and austere containment; no spa decor, pond, lush garden, blank texture field, zen room, chair, lantern prop, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-047') {
    return 'Use an original topiary wayfinding style-card with one readable clipped-hedge spatial anchor, living-wall mass, partial route pressure, gravel node, controlled sightline break, and playful disorientation; no literal maze map, fantasy garden gate, statue centerpiece, open field, market aisle, library aisle, corridor tunnel, camera prop, readable signage, or empty abstract tile.';
  }
  if (preset.id === 'SP07-052') {
    return 'Use an original dwarven megalithic forge style-card with one readable load-bearing stone/metal anchor, chiseled granite, rune-like non-readable bands, hammered gold, thermal channels, mineral heat glow, and blunt structural gravity; no dwarf character, hero forge scene, weapon, hammer prop, fantasy hall corridor, castle throne room, readable runes/text, market aisle, camera prop, or empty abstract tile.';
  }
  if (preset.id === 'SP07-055') {
    return 'Use an original confectionery surrealism style-card with one readable candy-architecture material anchor, icing seams, gumdrop nodes, marshmallow mass, candy-cane structural rhythm, sugar-glass highlights, and playful edible construction; no photoreal food macro, dessert table, kid party, candy mascot, fairy-tale street, castle, market aisle, library aisle, camera prop, or empty abstract tile.';
  }
  if (preset.id === 'SP07-060') {
    return 'Use an original haunted-toon deformation style-card with one readable warped architectural/object anchor, elastic crooked silhouette, inked contours, moonlit violet, toxic-lime accents, cel-shade blocks, and playful spooky graphic rhythm; no realistic horror, haunted mansion literal, Halloween set, corridor, fantasy hall, monster, gore, chair, curtain, lamp, camera prop, or empty abstract tile.';
  }
  if (preset.id === 'SP07-073') {
    return 'Use an original subterranean bio-cutaway style-card with one readable sectional architecture/soil anchor, capillary branching, layered earth strata, nodal cavities, translucent amber gel pockets, and functional internal circulation as a designed cross-section; no ants, insects, insect colony, ant farm, larvae/eggs, camera equipment, display case, creature focus, gore, body anatomy, flat exterior view, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-075') {
    return 'Use an original impossible-circulation optical-paradox style-card with one readable impossible architectural loop, contradictory gravity planes, invertible arches, lithographic paper grain, precise ink linework, and connected floor-wall-ceiling transitions; no generic staircase-only scene, fantasy castle, library aisle, market aisle, corridor tunnel, readable text, camera prop, or empty abstract tile.';
  }
  if (preset.id === 'SP07-078') {
    return 'Use an original cybernetic hive infrastructure style-card with one readable modular machine-architecture anchor, cube-shell alcoves, dense conduit bundles, graphite panels, phosphor-green glow, recursive service grids, and oppressive collective utility; no named faction, creature, spaceship corridor, cockpit/control room, vehicle, surveillance camera, market aisle, library aisle, or empty abstract tile.';
  }
  if (preset.id === 'SP07-079') {
    return 'Use an original absolute-black monolith style-card with one readable severe vertical architectural anchor, matte black absorbent planes, faint silver edge light, austere scale cue, crisp shadow geometry, and symbolic restraint; no recognizable cinematic monolith proportions, sci-fi portal, space scene, featureless black rectangle only, corridor, room set, readable text, camera prop, or empty abstract tile.';
  }
  if (preset.id === 'SP07-080') {
    return 'Use an original dimensional retrotech surface style-card with one readable recursive wall-surface anchor, circular modules, copper-brass panels, coral-like ribs, hex nodes, tactile glass glow, braided cabling, and impossible depth; no named franchise interior, iconic control room, central console, single central prop, spaceship cabin, corridor, market aisle, library aisle, camera prop, or empty abstract tile.';
  }
  if (preset.id === 'SP07-001') {
    return 'Use an original modern-minimalist style-card with one readable architectural detail anchor, flush planes, hidden joints, warm mineral white, soft daylight, microcement, pale oak accent, and active negative space; no showroom living room, chair focus, sofa, lamp, curtain, plant prop, kitchen appliance, corridor, market aisle, library aisle, or empty abstract tile.';
  }
  if (preset.id === 'SP07-002') {
    return 'Use an original industrial-loft style-card with one readable tectonic infrastructure anchor, exposed truss rhythm, raw concrete, rough brick, oxidized steel, aged copper, reclaimed wood, and controlled utilitarian patina; no cozy living-room setup, chair/sofa focus, pendant-lamp hero, curtain, carpet, wallpaper, market aisle, library aisle, corridor, camera prop, or empty abstract tile.';
  }
  if (preset.id === 'SP07-004') {
    return 'Use an original Scandinavian hygge style-card with one readable low architectural/material anchor, pale wood, wool/linen softness, warm cream palette, rounded low volumes, gentle diffuse light, and calm tactile refuge; no staged living room, chair/sofa focus, blanket pile as only subject, lamp hero, curtain wall, fireplace scene, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-005') {
    return 'Use an original bohemian-eclectic style-card with one readable crafted interior/material anchor, woven fiber layers, terracotta warmth, indigo/turquoise accents, carved wood, asymmetric pattern rhythm, and curated tactile density; no chaotic junk pile, plant-only scene, chair/sofa focus, curtain-dominant setup, lamp hero, market aisle, library aisle, corridor, camera prop, or empty abstract tile.';
  }
  if (preset.id === 'SP07-006') {
    return 'Use an original brutalist-architecture style-card with one readable raw concrete mass anchor, board-formed texture, heavy cantilever, deep shadow voids, mineral gray palette, and institutional tectonic gravity; no glass curtain wall dominance, warm wood room, chair/sofa setup, corridor tunnel, market aisle, library aisle, camera prop, readable signage, or empty abstract tile.';
  }
  if (preset.id === 'SP07-007') {
    return 'Use an original art-deco architecture style-card with one readable geometric ornament/built anchor, stepped profiles, chevron/sunburst hierarchy, black-gold contrast, emerald accents, polished brass, marble, and axial glamour; no hotel lobby formula, chair/sofa focus, chandelier/lamp hero, nightclub stage, readable signage, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-008') {
    return 'Use an original Japanese-zen style-card with one readable modular material/spatial anchor, low grid, translucent paper filter, raw wood, matte clay, tatami-green accent, asymmetric void, and contemplative quiet; no literal temple room, tea set prop, lantern hero, chair, curtain, dry-garden duplicate, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-009') {
    return 'Use an original gothic-revival style-card with one readable pointed-arch/stone-tracery anchor, carved limestone, ribbed verticals, muted stained-glass color projection, cold iron, and solemn upward pull; no horror ruin, cathedral nave corridor, candle/lamp hero, pew rows, readable religious icon/text, market aisle, library aisle, camera prop, or empty abstract tile.';
  }
  if (preset.id === 'SP07-010') {
    return 'Use an original futuristic-pod style-card with one readable continuous shell/interior module anchor, cornerless white polymer, embedded soft cyan light, seamless joints, ergonomic curved threshold, and smart matte-gloss surfaces; no spaceship cockpit, control room, central console, chair focus, bed pod scene, corridor tunnel, market aisle, library aisle, camera prop, or empty abstract tile.';
  }
  if (preset.id === 'SP07-011') {
    return 'Use an original luxury-penthouse style-card with one readable premium architectural/material anchor, bookmatched marble, satin brass, warm ivory planes, smoked grey accents, hidden joints, indirect light, and controlled editorial spacing; no skyline/view dependency, sofa/chair focus, lamp hero, curtain wall, hotel lobby, staged living room, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-012') {
    return 'Use an original rustic-cabin style-card with one readable heavy natural-material anchor, hand-hewn timber, porous stone, forged metal, wool texture, ember-warm glow, and protective compact mass; no literal cabin exterior, fireplace-only tableau, chair/sofa focus, plaid blanket pile as only subject, lamp hero, taxidermy, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-013') {
    return 'Use an original Mediterranean-villa style-card with one readable lime-plaster/terracotta architectural anchor, soft arched threshold, white mineral walls, handmade tile, matte wrought iron, warm sun bounce, and airy shadow transition; no postcard villa view, pool resort scene, dining table, chair focus, curtain, lamp hero, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-014') {
    return 'Use an original cyberpunk-apartment style-card with one readable improvised tech-infrastructure anchor, dense cable layers, scratched metal, reclaimed panels, neon spill, CRT amber pockets, and functional nocturnal clutter; no gamer desk, monitor wall, readable UI/text, weapon, person, chair/bed focus, alley/street scene, market aisle, library aisle, corridor tunnel, or empty abstract tile.';
  }
  if (preset.id === 'SP07-016') {
    return 'Use an original Bauhaus-interior style-card with one readable functional geometry/material anchor, circle-square intersection, tubular steel, primary color accent, white/black structure, clear glass, bent wood, and rational proportional order; no chair focus, classroom poster, readable text, lamp hero, cluttered room, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-017') {
    return 'Use an original maximalist-decor style-card with one readable curated display/material anchor, jewel-tone layers, patterned textile rhythm, velvet, gilded trim, gallery-density surfaces, and clear hierarchy through excess; no bookshelf wall, lamp hero, clutter-only room, chair/sofa focus, curtain-dominant scene, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-018') {
    return 'Use an original farmhouse-chic style-card as close material/built-detail composition: warm white shiplap junction, reclaimed barn-wood brace, galvanized metal panel, black iron strap hinge, washed linen edge, beadboard rhythm, and refined rural utility; no hallway view, linen cabinet, kitchen sink/appliance scene, dining table, chair focus, pendant-lamp hero, flower bucket centerpiece, TV farmhouse cliche, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-019') {
    return 'Use an original art-nouveau interior style-card with one readable organic architectural/material anchor, whiplash curves, floral structural lines, iridescent art glass, patinated bronze, carved wood, peacock/sage accents, and integrated vegetal continuity; no fixed period room, lamp hero, chair focus, literal flower bouquet, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-020') {
    return 'Use an original Memphis-design style-card with one readable postmodern object/spatial anchor, squiggles, terrazzo, Formica shine, asymmetric pastel blocks, black-white graphic pattern, bubblegum pink, teal, yellow, and playful totem geometry; no 1980s living room, studio set, chair/sofa focus, lamp hero, readable text, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-021') {
    return 'Use an original deconstructivist architecture style-card with one readable folded-metal/faceted built anchor, fractured intersections, shifted axes, brushed titanium skin, angular shadow cuts, and controlled spatial instability; no named landmark, museum postcard, generic corridor, city street, glass box, symmetrical facade, market aisle, library aisle, camera prop, or empty abstract tile.';
  }
  if (preset.id === 'SP07-022') {
    return 'Use an original neoclassical style-card with one readable civic stone-detail anchor, column rhythm, pediment geometry, stepped plinth, white marble, pale limestone, bronze accent, and strict axial authority; no capitol/courthouse copy, tourist facade postcard, statue hero, flag, readable inscription, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-023') {
    return 'Use an original parametric-architecture style-card with one readable morphogenetic surface anchor, continuous white technical skin, algorithmic ribs, fluid ribbon transitions, soft embedded light, seamless joints, and computational precision; no generic airport hall, shopping mall, chair/sofa focus, corridor tunnel, market aisle, library aisle, camera prop, or empty abstract tile.';
  }
  if (preset.id === 'SP07-024') {
    return 'Use an original Victorian-painted-lady style-card with one readable painted carpenter-detail anchor, gingerbread trim, fish-scale shingles, pastel layered color, spindle rhythm, cream moldings, and narrow vertical craft; no preserved street postcard, full house exterior default, porch-chair scene, readable sign, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-025') {
    return 'Use an original Bauhaus-architecture style-card with one readable rational building-detail anchor, clean cubic mass, horizontal bands, flat roof edge, white/black/grey planes, small primary-color signal, and functional asymmetry; no generic office block, chair/sofa focus, decoration, roof tiles, market aisle, library aisle, corridor, readable text, or empty abstract tile.';
  }
  if (preset.id === 'SP07-026') {
    return 'Use an original Googie-architecture style-card with one readable atomic-age canopy/signage-form anchor, boomerang vectors, starburst geometry, chrome, turquoise/red accents, angled glass, and optimistic motion; no diner/roadside postcard, readable sign text, car hero, gas station scene, chair/sofa focus, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-027') {
    return 'Use an original Tudor-revival style-card with one readable half-timber architectural-detail anchor, dark wood over lime plaster, steep gable rhythm, leaded diamond glass, handmade brick, mossy earth tones, and protective historic warmth; no cottage postcard, village street, fireplace-only interior, chair/sofa focus, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-028') {
    return 'Use an original sustainable green architecture style-card with one readable building-envelope or material-detail anchor, layered vegetation integrated into structure, bioclimatic shading, reclaimed texture, daylight, rainwater or soil cues, and calm ecological optimism; no greenwashing corporate facade, generic plant wall, park landscape, rendered office lobby, market aisle, library aisle, corridor, camera prop, or empty abstract tile.';
  }
  if (preset.id === 'SP07-029') {
    return 'Use an original adobe and pueblo style-card with one readable earth-material architectural-detail anchor, thick limewashed earthen walls, deep window reveal, rounded plaster edge, timber/viga rhythm, warm clay pigments, and handmade shade; no tourist pueblo postcard, pottery/table prop focus, desert scenic overlook, market aisle, library aisle, corridor, camera prop, or empty abstract tile.';
  }
  if (preset.id === 'SP07-030') {
    return 'Use an original Soviet constructivist style-card with one readable machine-civic architectural or graphic-structure anchor, raw concrete, aggressive diagonals, prisms or cylinders, restrained red accent, black/cream massing, and industrial momentum; no propaganda poster, readable text, flags, named monument, consumer signage, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-031') {
    return 'Use an original orbital utility habitat style-card with one readable compact spacecraft-module detail anchor, circular hatch geometry, retention straps, hook-and-loop blue, equipment beige, technical panel seams, clipped utility lighting, and zero-gravity storage logic; no cockpit/control-room hero, astronaut/person, readable labels, logos, UI screens, camera prop, or empty abstract tile.';
  }
  if (preset.id === 'SP07-033') {
    return 'Use an original conservatory bioclimate style-card with one readable greenhouse structural-detail anchor, glass ribs, condensation, humid light, layered botanical silhouettes, water catchment or thermal mass cues, and living climate control; no plant store, market aisle, library aisle, dry dark interior, chair/table focus, camera prop, or empty abstract tile.';
  }
  if (preset.id === 'SP07-034') {
    return 'Use an original institutional ruin patina style-card as a close architectural material study, with one readable decayed administrative-wall or service-counter detail anchor, delaminated paint, water stains, oxidized fixtures, broken service grid, sealed notice shapes without readable text, and sober civic abandonment; no people, guard, inspector, character, hospital/asylum horror, long corridor, gore, creature, readable signage, furniture focus, or empty abstract tile.';
  }
  if (preset.id === 'SP07-036') {
    return 'Use an original casino sensory grid style-card as a tight empty architectural detail, with one readable carpet-ceiling-mirror junction or luminous wall pattern anchor, red/gold/neon rhythm, reflected geometry, polished brass trims, saturated carpet geometry, and attention-trap overload at thumbnail scale; no people, staff, hands, slot machine, kiosk, console, terminal, display screen, playing cards, chips, gambling table, casino floor crowd, readable signage, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-037') {
    return 'Use an original immersive aquarium optics style-card as a close material-light study, with one readable thick acrylic panel edge or water-window detail anchor, blue attenuation, caustic refraction, suspended particles, soft distant marine silhouettes, and submerged viewing physics; no people, diver, visitor, camera prop, shark/fish hero, aquarium tunnel corridor, dry-air interior, market aisle, library aisle, or empty abstract tile.';
  }
  if (preset.id === 'SP07-040') {
    return 'Use an original arboreal craft shelter style-card with one readable elevated hand-built joinery anchor, weathered timber, rope lashings, bark contact, light galvanized hardware, dappled canopy light, and plausible suspended structure; no children treehouse postcard, adventure scene, person, ground-level hut, fantasy forest, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-041') {
    return 'Use an original formal topiary axis style-card with one readable clipped-hedge or parterre-detail anchor, mirrored green bands, raked gravel, limestone edging, controlled turf, ceremonial depth, and strict landscape precision; no wild meadow, messy garden, palace postcard, fountain hero, people, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-042') {
    return 'Use an original cottage bloom layering style-card with one readable overflowing planting-border anchor, layered flower heights, curved path fragments, mossy brick or rough stone, pastel seasonal blooms, and intimate domestic abundance; no formal parterre, concrete patio, porch furniture, market aisle, library aisle, corridor, person, camera prop, or empty abstract tile.';
  }
  if (preset.id === 'SP07-044') {
    return 'Use an original postindustrial ecological promenade style-card with one readable reclaimed-edge material anchor, weathered concrete, corten steel, gravel, resilient grasses, modular retention bands, and civic ecological reuse; no wild forest, heroic walkway scene, people, bikes, retail promenade, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-045') {
    return 'Use an original xeriscape climate grammar style-card with one readable water-wise planting-detail anchor, agave rosettes, dry creek gravel routing, decomposed granite, oxidized metal edging, ochre stone, and hard sun; no lawn, wet lush garden, desert postcard, cactus character, people, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-046') {
    return 'Use an original water-horizon hospitality style-card as a tight material-light study, with one readable infinity-edge waterline or shallow-water terrace edge anchor, turquoise reflection, warm wet stone, teak trim, tropical leaf shadow, and slow luxury atmosphere; no cabana, sofa, lounge chair, bed, furniture focus, hotel room, pool party, people, brand resort, beach postcard, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-048') {
    return 'Use an original elevated biophilic terrace style-card as a cropped planter-infrastructure detail, with one readable raised planter edge or railing-light anchor, modular planting bands, warm horizontal deck planes, integrated low lighting, mineral gravel, and airy suspended comfort; no blanket, cushion, sofa, chair, lounge furniture, literal rooftop lounge, skyline-view terrace, ground patio, people, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-049') {
    return 'Use an original tournament turf strategy style-card as a cropped surface-design study, with one readable precision-turf and raked-sand edge anchor, striped mowing bands, dew on short grass, contained water edge, target geometry implied by ground contour, and competitive surface control; no flag, pole, cup marker, golfers, players, stadium, generic park lawn, weeds, people, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-050') {
    return 'Use an original botanical iron glasshouse style-card with one readable iron-and-glass conservatory detail anchor, ribbed glazed vaults, cast-iron lattice, condensation prisms, humid light, terracotta or wet glass, and layered tropical leaves; no exterior garden, tourist greenhouse room, people, benches, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-051') {
    return 'Use an original verdant elven sanctuary style-card with one readable biocentric architectural-detail anchor, branch-derived filigree arches, carved pale stone, living wood, silver inlay, water-layer glow, moss green, and lyrical sacred calm; no licensed fantasy location, elf/person, weapon, throne room, long corridor, market aisle, library aisle, industrial block, or empty abstract tile.';
  }
  if (preset.id === 'SP07-053') {
    return 'Use an original suspended fortress sublime style-card with one readable floating-mass undercut or sky-structure detail anchor, airborne stone strata, void cuts, cloud mist, crystalline edges, high sun rim light, and coherent impossible gravity; no literal castle, ground-level building, waterfall postcard, dragon, person, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-056') {
    return 'Use an original abyssal deco pressure style-card with one readable underwater deco-engineering detail anchor, pressure glass, wet brass, blue aquatic filter, copper-green patina, coral encrustation, bioluminescent wayfinding glow, and leak signatures; no cheerful open sky, dry luxury lobby, diver/person, submarine cockpit, readable signage, corridor, market aisle, library aisle, or empty abstract tile.';
  }
  if (preset.id === 'SP07-057') {
    return 'Use an original neo-victorian steamwork style-card with one readable brass-pipe or boiler-wall detail anchor, riveted copper, brick soot, gaslight amber, pressure gauges without readable text, venting steam, gear nodes, and plausible mechanical hierarchy; no vehicle/train hero, weapon, person, control room, market aisle, library aisle, corridor, clean energy lab, or empty abstract tile.';
  }
  if (preset.id === 'SP07-058') {
    return 'Use an original prismatic mineral megastructure style-card with one readable crystalline architectural-mass detail anchor, faceted stacking, hexagonal crystal bundles, sapphire-amethyst-white refraction, internal glow, iridescent edges, and monumental mineral logic; no temple postcard, single spire hero, ordinary brick, wood cabin, people, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-059') {
    return 'Use an original bermed round-door pastoral style-card with one readable round-threshold or sod-roof material detail anchor, lime-clay plaster, weathered hand wood, mossy turf roof, worn stone, warm brass, and intimate low domestic scale; no licensed hobbit-hole copy, village postcard, people, table/chair focus, tall square house, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-061') {
    return 'Use an original cryomorphic palace geometry style-card with one readable glacial architectural-detail anchor, faceted ice buttress, frozen column rhythm, subsurface cyan transmission, aurora mint edge light, polished ice planes, and sovereign winter monumentality; no literal palace hall, throne room, warm fireplace, orange heat glow, person, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-062') {
    return 'Use an original canopy rope vernacular style-card with one readable elevated rope-and-wood joinery anchor, catenary lashings, radial platform fragments, bark support contact, woven panels, dappled canopy light, and communal suspended craft logic; no tribe/person, jungle village postcard, polished metal dominance, ground hut, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-063') {
    return 'Use an original sepulchral civic monumentalism style-card with one readable severe stone-threshold or sealed-chamber detail anchor, black basalt, bone marble, oxidized bronze, low spectral glow, lapidary grids, and solemn ritual civic scale; no cemetery scene, skull/gore, monster, person, cozy living room, lush garden, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-064') {
    return 'Use an original aerostatic cloud retrofuture style-card with one readable floating-platform or satin-alloy ring detail anchor, pearl ivory superstructure, champagne metallic seams, soft perimeter beacons, sunset cloud haze, and elegant suspended balance; no airport terminal, flat ground city, terrestrial baseplate, people, aircraft cockpit, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-065') {
    return 'Use an original papercraft diorama construction style-card with one readable folded paper architecture-detail anchor, visible tabs, score lines, layered pop-up planes, kraft board, tracing paper translucency, fiber texture, and soft model shadows; no photoreal full-scale scene, museum vitrine, city miniature postcard, people, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-066') {
    return 'Use an original studded ABS brick system style-card with one readable toy-brick modular detail anchor, visible studs, interlocking seams, stepped block massing, injected-plastic highlights, primary color blocking, and baseplate logic; no brand logo, minifigure/person, photoreal masonry, full-scale construction site, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-067') {
    return 'Use an original wet-sand ephemeral modeling style-card with one readable damp-sand sculptural detail anchor, bucket-mold cylinders, drip ridges, granular wet crust, shell inclusions, softened erosion edges, and fragile tide-worn form; no hard carved stone, permanent masonry, beach crowd, person, toy plastic, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-068') {
    return 'Use an original corrugated cardboard improvisation style-card with one readable exposed-corrugation construction detail anchor, kraft fiber, folded flaps, shiny packing tape, hand-cut openings, marker linework, and patched low-tech load paths; no playroom scene, child/person, toy clutter, solid wall, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-069') {
    return 'Use an original pressurized vinyl playform style-card with one readable inflatable vinyl material-detail anchor, rounded pressure tubes, heat-welded seams, glossy PVC highlights, safety-pop color blocking, blower valve hardware, and temporary soft-volume geometry; no bounce castle, amusement park scene, children/person, hard edges, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-070') {
    return 'Use an original confectionery structural ornament style-card with one readable edible-construction detail anchor, piped icing seams, cookie-grain mass, candy-column modules, sugar sparkle, peppermint accents, and warm handmade storybook structure; no literal holiday gingerbread house only, bakery product photo, dessert table, spoiled food, person, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-071') {
    return 'Use an original fungal vernacular miniature style-card with one readable cap-and-stem architectural detail anchor, matte fungal skin, cream speckling, gilled underside texture, mossy humid base, spore dust, and small ecological scale; no fairy cottage cliche, forest floor postcard, creature/person, square house, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-072') {
    return 'Use an original bottle-glass curio miniature style-card with one readable glass-encapsulated miniature detail anchor, cylindrical bottle refraction, restrictive neck compression, micro rigging or fine craft mesh, cork texture, pale aqua glass tint, and museum-curio precision; no open ocean, seascape, full maritime landscape, person, readable label, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-074') {
    return 'Use an original toy-scale sectional cutaway style-card with one readable open-section compartment detail anchor, removed front face, stacked miniature rooms, painted toy wood, pastel wall fields, tiny textile texture, and even display lighting; no closed facade, sealed wall, dollhouse product photo, person, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-076') {
    return 'Use an original stellar shell megastructure style-card with one readable radial collector-panel or interior-horizon detail anchor, near-black structural ribs, solar gold emission, hex-panel tiling, corona rim light, graphite heat fins, and civilization-scale energy capture; no ordinary planet surface, ground landscape, spaceship cockpit, astronaut/person, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP07-077') {
    return 'Use an original orbital ribbon habitat style-card with one readable curved habitat-band or edge-wall detail anchor, upward horizon wrap, linear biosphere strip, atmospheric blue haze, ocean-cyan bands, structural charcoal containment, and macro-civilization planning; no globe view, ordinary planet surface, spacecraft cockpit, astronaut/person, market aisle, library aisle, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP03-003') {
    return 'Use an original biased GPU render style-card as a close non-character CG material-light study, with one readable caustic glass, polished metal, or shader-surface anchor, photon-mapped caustics, soft shadow pools, fast blur, noise-free production detail, and broadcast-ready cinematic polish; no bust, head, face, body, creature, mannequin, material-sphere board, UI screen, render settings panel, camera prop, product-table setup, corridor, market aisle, library aisle, or empty abstract tile.';
  }
  if (preset.id === 'SP03-004') {
    return 'Use an original feature-film path-traced style-card as a close non-character CG material-light study, with one readable displaced stone, wet metal, glass, or volume-scattering surface anchor, unclamped global illumination, ACES filmic color, micro-displacement, and grounded cinematic bounce light; no bust, head, face, body, creature, robot, mannequin, material-sphere board, VFX shot with actors, UI screen, camera prop, corridor, market aisle, library aisle, or empty abstract tile.';
  }
  if (preset.id === 'SP03-005') {
    return 'Use an original open path-tracer lookdev style-card as a close non-character procedural material study, with one readable layered shader surface, bevelled test geometry, clean mesh edge, principled BSDF variation, Filmic highlight rolloff, and denoised bounce light; no bust, head, face, body, creature, benchmark monkey, material-sphere board, software UI, product turntable, gallery room, person, corridor, market aisle, library aisle, or empty abstract tile.';
  }
  if (preset.id === 'SP03-006') {
    return 'Use an original architectural raytracer style-card as a tight architectural material-light detail, with one readable stone, glass, metal, or wall-edge anchor, layered BRDF surfaces, IES light falloff, adaptive dome softness, straight-line precision, and warm expensive ArchViz exposure; no material-sphere board, collage grid, swatch panel, furniture showroom, lifestyle room, window-wall catalog scene, person, corridor, market aisle, library aisle, or empty abstract tile.';
  }
  if (preset.id === 'SP03-007') {
    return 'Use an original product-studio renderer style-card with one readable accurate plastic-or-metal material anchor, controlled HDRI reflections, clean silhouette edge, polymer texture fidelity, premium commercial isolation, and exact color discipline; no brand logo, packaging text, floating product ad, empty studio void, person, corridor, market aisle, library aisle, or empty abstract tile.';
  }
  if (preset.id === 'SP03-008') {
    return 'Use an original feature-animation renderer style-card as a non-character soft-form material study, with one readable rounded prop-free abstract CG shape, translucent surface, soft bevel, subsurface edge glow, elastic squash-stretch geometry, vibrant cinematic light, and warm stylized-real material response; no character, face, body, creature, cute mascot, story pose, material-sphere board, named studio imitation, anime, UI, corridor, market aisle, library aisle, or empty abstract tile.';
  }
  if (preset.id === 'SP03-009') {
    return 'Use an original digital-clay sculpt style-card as a non-character sculptural surface study, with one readable abstract carved form, folded clay plane, dynamesh topology cue, stylus stroke ridge, wax or grey matcap material, and rim-lit high-poly surface detail; no bust, head, face, body, creature, anatomy study, material board, software UI, textured final render, person, corridor, market aisle, library aisle, or empty abstract tile.';
  }
  if (preset.id === 'SP03-010') {
    return 'Use an original high-end game-engine pipeline style-card as a non-character real-time environment-material detail, with one readable modular wall, floor, machinery, or terrain-surface anchor, volumetric fog, filmic tonemap, restrained HDR bloom, substance-like PBR tiling, real-time GI, and cutscene-grade interactive energy; no bust, head, face, body, creature, robot, player character, HUD/UI, loading screen, weapon, corridor, market aisle, library aisle, or empty abstract tile.';
  }
  if (preset.id === 'SP03-011') {
    return 'Use an original glass and crystal style-card as a close refractive material study, with one readable thick-edged crystal or glass-surface anchor, caustic light paths, prismatic dispersion, optical bending, transparent layered depth, and clean gallery-grade highlights; no bottle, jewelry display, product ad, face, body, person, UI, readable text, material-board grid, corridor, market aisle, library aisle, or empty abstract tile.';
  }
  if (preset.id === 'SP03-012') {
    return 'Use an original liquid simulation style-card as a close fluid-motion material study, with one readable splash crown, suspended droplet sheet, surface-tension strand, foam edge, wet specular pool, and frozen high-speed motion; no ocean scene, seascape, body, person, glass cup, bucket, lab accident, UI, readable text, corridor, market aisle, library aisle, or empty abstract tile.';
  }
  if (preset.id === 'SP03-013') {
    return 'Use an original subsurface scattering style-card as a close translucent material study, with one readable abstract wax, jade, alabaster, or organic polymer slab, folded shell, or carved non-figurative form, internal warm glow, backlit rim, soft color bleed, and milky depth; no head, face, ear, portrait, bust, mannequin, anatomy, body, creature, food, candle product, person, UI, material-board grid, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP03-014') {
    return 'Use an original chrome and metal style-card as a close reflective surface study, with one readable mirror-grade curved panel or abstract mechanical surface, HDRI ribbon reflections, anisotropic highlights, polished metal depth, and gold-chrome tonal shifts; no car, vehicle, helmet, robot, bust, product pedestal, showroom, person, UI, readable text, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP03-015') {
    return 'Use an original claymation stop-motion style-card as an extreme close plasticine material-form study, with one readable handmade folded clay slab, clay curl, or non-figurative clay sculpture filling the frame, thumbprints, dust specks, matte clay colors, folded seams, miniature stop-motion lighting, and tactile imperfection; no diorama, room set, background props, wall, lamp, mirror, hand shape, character, head, face, eyes, body, named studio imitation, person, UI, readable text, or empty abstract tile.';
  }
  if (preset.id === 'SP03-016') {
    return 'Use an original fur and hair style-card as a close groom-material study, with one readable fuzzy surface anchor, dense strands, clump variation, rim-lit fuzz, wind-frozen filaments, soft underlayer shadow, and high-quality strand definition; no animal, creature, body, face, portrait, pelt rug, person, UI, readable text, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP03-017') {
    return 'Use an original slime and goo style-card as a close viscous material study, with one readable neon goo sheet, stretch strings, dripping folds, surface-tension bridges, glossy pools, and playful wet specular color; no creature, body, prank bucket, lab accident, person, food, gore, UI, readable text, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP03-018') {
    return 'Use an original carbon fiber style-card as a close woven-composite material study, with one readable curved engineering panel, black-grey twill weave, clearcoat depth, anisotropic glints, and motorsport-grade tension without literal vehicle context; no car, vehicle, bike, helmet, weapon, product hero, person, UI, readable text, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP03-019') {
    return 'Use an original hologram style-card as a close volumetric projection-material study, with one readable translucent object fragment, scanline interference, RGB edge split, flickering depth planes, light-field shimmer, and dark clean negative space; no face, bust, body, person, screen UI, dashboard, readable text, camera prop, corridor, market aisle, library aisle, or empty abstract tile.';
  }
  if (preset.id === 'SP03-020') {
    return 'Use an original porcelain style-card as a close ceramic material study, with one readable glazed porcelain shell, vessel fragment, or non-figurative sculpted shard, blue-white glaze depth, hairline crackle, kiln specks, and soft reflective highlights; no doll, face, bust, body, figurine, teacup product ad, table setting, person, UI, readable text, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP03-021') {
    return 'Use an original low-poly 3D style-card with one readable faceted prop, terrain fragment, or animal-free geometric sculpture, broad planar faces, crisp silhouette, simple color blocks, stylized ambient occlusion, and game-art clarity; no franchise game scene, character, face, body, weapon, HUD/UI, text, corridor, market aisle, library aisle, or empty abstract tile.';
  }
  if (preset.id === 'SP03-022') {
    return 'Use an original voxel art style-card with one readable voxel-built object, micro-landform, or modular structure fragment, chunky cubic silhouettes, grid-snapped steps, block shadows, playful palette, and thumbnail-scale readability; no head, face, bust, statue, character, body, game screenshot, franchise terrain, weapon, HUD/UI, readable text, corridor, market aisle, library aisle, or empty abstract tile.';
  }
  if (preset.id === 'SP03-023') {
    return 'Use an original isometric 3D style-card with one readable isometric miniature platform fragment, stepped architectural cutaway, or abstract geometric monument only, 30-degree camera logic, crisp bevels, tidy depth layers, and compact toy-scale readability; no head, face, bust, statue, hand, body, person, figurative relief, drone, camera, lens, city map, fantasy market, library aisle, corridor, HUD/UI, labels, readable text, or empty abstract tile.';
  }
  if (preset.id === 'SP03-024') {
    return 'Use an original wireframe render style-card with one readable object or architectural fragment shown as luminous mesh over solid dark form, clean topology lines, vertex glow, controlled transparency, and technical CG elegance; no software screenshot, viewport UI, node graph, readable text, face, bust, body, camera prop, corridor, or empty abstract tile.';
  }
  if (preset.id === 'SP03-025') {
    return 'Use an original kitbash style-card with one readable hard-surface machinery fragment, modular armor panel, or sci-fi greeble cluster, layered plates, bolts, vents, asymmetric assemblies, and cinematic industrial scale; no camera, lens, weapon, robot face, vehicle cockpit, corridor, market aisle, library aisle, UI, readable text, or empty abstract tile.';
  }
  if (preset.id === 'SP03-026') {
    return 'Use an original knolling flat-lay style-card with one readable ordered layout of low-tech abstract CG parts, material tiles, simple clay blocks, flat panels, rods, rings, and geometry modules only, strict orthographic spacing, clean shadows, color-coded organization, and graphic clarity; no central device, circular lens core, sci-fi module, camera gear, head, face, bust, mannequin, figurine, body, sculpture, phones, laptops, brand objects, readable text, market products, person, UI screenshot, or empty abstract tile.';
  }
  if (preset.id === 'SP03-027') {
    return 'Use an original metaballs style-card with one readable blobby merged-form object or soft cellular material cluster, smooth implicit-surface bridges, glossy rounded contact seams, liquid-solid tension, and clean volumetric depth; no empty blob wallpaper, face, head, bust, body, creature, toy pile, UI, readable text, corridor, market aisle, library aisle, or empty abstract tile.';
  }
  if (preset.id === 'SP03-028') {
    return 'Use one freeform class-A CAD test surface or flowing curvature sculpture with zebra reflection bands and G2 continuity; no chair, seat, furniture, vehicle, showroom, lab room, circular wall light, studio setup, product pedestal, or interior scene.';
  }
  if (preset.id === 'SP03-029') {
    return 'Use one readable Mandelbulb/fractal creature bust or sculptural hero form with self-similar ridges at broad thumbnail scale; no cave, cathedral, corridor, fantasy hall, landscape fly-through, UI grid, or empty abstract-only field.';
  }
  if (preset.id === 'SP03-030') {
    return 'Use one corrupted non-figurative 3D mesh hero form or abstract object fragment with vertex explosion, UV tearing, chromatic data-mosh seams, broken polygons, and glitch-material shimmer; no head, face, bust, body, hand, character, creature, camera, phone, monitor, screen, console, UI, text, or device silhouette.';
  }
  if (preset.id === 'SP03-031') {
    return 'Use one simple non-figurative organic or material hero object showing soft bounced color, ambient occlusion, contact shadows, indirect fill, and gentle global illumination gradients; no head, face, bust, body, creature, lamp, studio light, showroom, staged room, chair, curtain, plant, vase, pool, spa interior, window-wall formula, or direct-flash setup.';
  }
  if (preset.id === 'SP03-032') {
    return 'Use one single abstract hero object or material form in a neutral volumetric lookdev test space with sculpted light shafts, layered air density, and readable fog falloff; no head, face, bust, body, creature, cathedral, forest, cave, cavern, corridor, fantasy hall, shrine, orb prop, alien warrior, fantasy landscape, battlefield, sun-disk sky, secondary creature, window-beam formula, lamp, smoke machine, or empty fog-only landscape.';
  }
  if (preset.id === 'SP03-033') {
    return 'Use one original cyberpunk material hero object, wet neon panel, or abstract hard-surface fragment with magenta/cyan emissive haze, rain-slick shader evidence, and glossy reflected color; no head, face, bust, body, person, literal street, alley, city corridor, readable sign, kanji, storefront, billboard, crowd, vehicle, camera, device, or UI.';
  }
  if (preset.id === 'SP03-034') {
    return 'Use one clean original non-figurative hero object or material specimen where key/fill/rim separation is visible through light behavior only; no head, face, bust, statue, body, product ad, visible softbox, lamp, stand, camera, studio room, cyclorama, backdrop roll, chair, stool, curtain, portrait-session setup, readable text, engraving, decal, logo, label, or brand-like marking.';
  }
  if (preset.id === 'SP03-035') {
    return 'Use one reflective material hero object, abstract CG form, or curved surface integrated into a neutral HDRI light-dome/probe field with matched reflections, contact shadows, ambient color wrap, and readable environment-light evidence; no head, face, bust, body, creature, studio background, sunset, sun disk, canyon, mountaintop, cliffs, desert, beach, city square, street, literal room, travel landscape, vehicle, camera, or generic prop scene.';
  }
  if (preset.id === 'SP03-036') {
    return 'Use one original refractive hero form, glass-like material shell, or abstract surface covered by caustic photon webs and prismatic light pools; no head, face, bust, body, creature, underwater scene, swimming pool, aquarium, glassware prop, lens/camera, compass-like object, literal crystal product shot, floor-wall room, or empty light pattern.';
  }
  if (preset.id === 'SP03-037') {
    return 'Use one clay-white matte geometric hero form or abstract sculptural object in a pure ambient-occlusion review pass with grey contact shadows and crevice gradients only; no head, face, bust, body, creature, colored light, rim light, bloom, swatches, props, room, turntable UI, direct light, or decorative scene.';
  }
  if (preset.id === 'SP03-038') {
    return 'Use one dark readable non-figurative hero object, material shard, or hard-surface form defined by crisp edge rim glow and halo separation; no head, face, bust, body, creature, visible light fixture, lamp, studio setup, corridor, weapon prop, readable text, camera, UI, front-lit portrait, contact sheet, swatch strip, reference grid, bottom tile row, or multi-frame panel layout.';
  }
  if (preset.id === 'SP03-039') {
    return 'Use one bioluminescent organic object fragment, fungal material form, or abstract cellular surface with branching cyan-violet glow, spore halos, and internal phosphorescent networks; no head, face, bust, body, creature, literal forest, Pandora landscape, floating mountains, tree canopy, path, corridor, shrine, human explorer, or franchise creature.';
  }
  if (preset.id === 'SP03-040') {
    return 'Use one original cel-shaded 3D hero object, rounded prop-free geometric form, or toy-like abstract sculpture with bold black outlines, flat color bands, and hard shadow edges; no blade, sword, weapon, sharp spear shape, head, face, bust, body, character, recognizable game/anime franchise, UI, speech bubble, readable text, logo, screen capture, or realistic gradient rendering.';
  }
  if (preset.id === 'SP03-041') {
    return 'Use one clean material hero object or abstract sculptural form pierced by visible volumetric light shafts in a controlled lookdev space; no head, face, bust, body, simple CG figure, creature, cathedral, temple, ruins, fantasy hall, magic ring, glowing portal, robed mystic figure, floating platform, shrine, forest canopy, corridor, window-beam cliche, UI, text, camera, or device prop.';
  }
  if (preset.id === 'SP03-042') {
    return 'Use one miniature maquette style-card with a close handcrafted scale-model object, terrain slice, or architectural fragment, tactile model materials, visible tiny bevels, and readable physical miniature lighting; no tabletop room scene, lantern, diorama clutter, toy character, person, face, bust, body, camera, studio wall, curtain, market aisle, library aisle, corridor, UI, readable text, or empty abstract tile.';
  }
  if (preset.id === 'SP03-043') {
    return 'Use one x-ray shader style-card with a translucent technical object, mechanical shell, or abstract material form revealing internal structure, layered ghosted surfaces, glowing core lines, and clinical blue-white depth; no anatomical torso, skeleton, organs, body, head, face, bust, person, medical UI, screen, camera, device ad, readable text, or empty abstract tile.';
  }
  if (preset.id === 'SP03-044') {
    return 'Use one thermal vision style-card with an alien material object, abstract heat-map form, or mechanical part showing false-color temperature gradients, hot core, cool edges, and infrared sensor palette; no face, portrait, body, person, animal, surveillance camera view, UI overlay, readable numbers, weapon, or empty abstract tile.';
  }
  if (preset.id === 'SP03-045') {
    return 'Use one wireframe-on-shaded style-card with a shaded object or architectural fragment overlaid by clean topology lines, visible edge loops, surface normals, and CG model structure; no head, face, bust, body, creature, viewport UI, software screenshot, camera, readable text, studio portrait, or empty abstract tile.';
  }
  if (preset.id === 'SP03-046') {
    return 'Use one game-ready PBR asset such as an original sci-fi crate, stylized tool, modular door panel, shield-like prop, creature armor plate, or environment module with albedo/roughness/metalness/normal-map evidence as physical swatches; no human bust, mannequin, portrait head, showroom, UI, screenshot, text, logo, camera, weapon-first read, or generic product render.';
  }
  if (preset.id === 'SP03-047') {
    return 'Use one architectural visualization style-card as a tight daylight model slice, facade-material detail, or interior edge fragment with realistic GI, glass/stone/wood material fidelity, and scale-readable spatial craft; no corridor, library aisle, market aisle, fantasy hall, real-estate room filler, couch showroom, person, camera, readable signage, or empty abstract tile.';
  }
  if (preset.id === 'SP03-048') {
    return 'Use one premium product-render style-card with an abstract product-like material form, polished packaging-free object, or precise industrial surface on controlled commercial lighting, with clean reflections and material swatches; no phone, laptop, camera, lens, device ad, logo, readable text, brand-like mark, white studio void, person, or empty abstract tile.';
  }
  if (preset.id === 'SP03-049') {
    return 'Use one original rig-ready non-human stylized robot, creature, or armored mascot in neutral A-pose or T-pose against a plain grey production backdrop, with front-facing silhouette, modest production armor, simple material swatches, and clean turnaround-sheet clarity; no human face, realistic person, sexualized body-first design, exposed lingerie-like armor, action pose, diagonal motion, fighting stance, weapon, narrative background, arch, courtyard, ruin, fountain, statue, plant, fantasy environment, multi-character lineup, contact sheet grid, UI, text, or labels.';
  }
  if (preset.id === 'SP03-050') {
    return 'Use one kinetic abstract 3D hero form made of glossy spheres, ribbons, splines, or elastic geometry with visible motion trails and gradient energy; no logo reveal, readable text, brand mark, UI, costume trim, character bust, office/corporate scene, camera, or static product display.';
  }
  if (preset.id === 'SP03-051') {
    return 'Use one clean non-gory diagnostic cutaway of an original mechanical-biological, botanical, or creature-specimen system with translucent layers and red/blue/white coding; no readable labels, text, UI, blood, gore, human torso, realistic human anatomy, surgery, hospital room, full body, or horror mood.';
  }
  if (preset.id === 'SP03-052') {
    return 'Use one aerodynamic automotive-material study: isolated wheel-arch slice, paint-body contour sculpture, grille-material tile, or lighting-reflection panel with long reflection sweeps and color-shift paint; no full vehicle, car front, headlight face, generic car ad, brand/logo, showroom, dealership, road scene, camera, readable text, driver, or lifestyle setup.';
  }
  if (preset.id === 'SP03-053') {
    return 'Use one original high-jewelry material specimen, faceted sculptural object, gemstone cluster, or precious-metal micro-architecture with macro caustics, dispersion, polished metal, and carat-level clarity; no ring/proposal/wedding box/hand/model/neck display/product pedestal/bridal scene, logo, text, camera, or generic jewelry ad.';
  }
  if (preset.id === 'SP03-054') {
    return 'Use one appetizing CGI food hero form, fruit/gel/sauce/material specimen, or stylized edible construction with droplets, steam, glossy highlights, crumb texture, and subsurface glow; no burger/fries default, character, bust, face, body, restaurant scene, table/plate clutter, brand packaging, logo, readable text, or rotten/gross read.';
  }
  if (preset.id === 'SP03-055') {
    return 'Use one grounded VR-ready environment module or interactive-scale scene fragment with wide-FOV depth, parallax layers, player-scale cues, optimized surfaces, and clear interaction distance; no headset, goggles, person, VR gear, UI, controller, screenshot, portal, corridor, hallway, aisle, fantasy hall, floating islands, fantasy landscape, full generic room, readable text, or camera prop.';
  }
  if (preset.id === 'SP03-056') {
    return 'Use one scientific data hero form such as protein fold, particle cloud, molecule cluster, galaxy simulation, or volumetric measurement field with false-color data and scale cues; no UI, charts, lab screen, readable labels, lab room, magic/fantasy glow, character, camera, logo, or text.';
  }
  if (preset.id === 'SP03-057') {
    return 'Use one original collectible 3D mask, toy-emblem, creature-token object, or profile-picture-ready avatar artifact with glossy rarity traits, neon/gold accents, and materialized accessories; no human face, human body, bust, ape copy, franchise/IP cue, NFT marketplace UI, crypto logo, readable text, screenshot, camera, or generic portrait studio.';
  }
  if (preset.id === 'SP03-058') {
    return 'Use one bold invented glyph sculpture, abstract letterform mass, or typographic-object construction with extruded bevels, material-built strokes, readable silhouette rhythm, and brand-color energy; no readable word, real alphabet sample, slogan, logo, UI, poster layout, flat text, or signage.';
  }
  if (preset.id === 'SP03-059') {
    return 'Use one digital fashion hero garment, simulated textile form, or faceless featureless mannequin fragment wearing impossible iridescent fabric with real drape, weave, seams, folds, and cloth dynamics; no human face/body, curtain, generic fabric backdrop, showroom, retail store, runway crowd, logo, readable text, camera, or stiff cloth.';
  }
  if (preset.id === 'SP03-060') {
    return 'Use one clear environment-design production card: a small playable terrain corner with path, modular props, foliage/rock/water set pieces, and lighting blockout cues, like a game level concept maquette; no abstract material board, aisles, library aisle, market aisle, corridor, hallway, archway, ruin, temple, fantasy palace, shop shelves, drone, orb, device prop, tarp, fabric sheet, UI, logo, readable text, or camera prop.';
  }
  if (preset.id === 'SP03-061') {
    return 'Use one original hard-surface engineering hero form, industrial module, or machined armor panel with bevel hierarchy, panel lines, service seams, scratched metal, and functional component density; no weapon, gun, missile, battlefield, soldier, full humanoid body, military insignia, cockpit UI, camera prop, readable text, or generic vehicle ad.';
  }
  if (preset.id === 'SP03-062') {
    return 'Use one isolated organic sculpt hero form, botanical anatomy specimen, creature-material shell, or growth-like material object with flowing topology, dynamesh mass, subsurface warmth, bark/skin texture maps, and natural rhythm on a simple lookdev ground; no human face, full body, bust portrait, gore, horror monster, forest scene, roots environment, hard robot edges, lab specimen jar, readable text, logo, or camera prop.';
  }
  if (preset.id === 'SP03-063') {
    return 'Use one isometric 3D cartographic terrain miniature, stacked contour island, elevation-coded scene fragment, or toy-like exploration map with topographic layers, terrain shadows, and clear height readability; no flat 2D paper map, parchment, atlas page, UI minimap, readable labels, compass rose, market/library aisle, logo, or text.';
  }
  if (preset.id === 'SP03-064') {
    return 'Use one original exploded-view assembly of an object, module, or abstract organism-material form with separated layers, invisible axes, precise spacing, cross-section surfaces, and subsystem color coding; no human/face/body, readable labels, arrows with text, instruction manual page, UI, contact sheet, weapon assembly, camera prop, logo, or flat diagram.';
  }
  if (preset.id === 'SP03-065') {
    return 'Use one original 3D app-icon-like hero object, squircle glass/plastic emblem, or friendly platform-icon sculpt with rounded corners, gradient polish, soft shadow, and front-facing legibility; no real app logo, brand mark, readable letter, UI screen, phone mockup, app store layout, flat 2D icon, camera prop, or text.';
  }
  if (preset.id === 'SP03-066') {
    return 'Use one wallpaper-ready abstract 3D background only: full-frame layered gel waves, broad gradients, soft depth, translucent ribbons crossing edge-to-edge, calm ambient lighting, clean large-shape rhythm, no single isolated subject; no central trophy object, shell/object/specimen, letterform, number, character, product, room, wall/floor seam, curtain, lamp, shelf, corridor, text, logo, UI, material swatch board, or noisy microdetail clutter.';
  }
  if (preset.id === 'SP03-067') {
    return 'Use one clean cybernetic implant product study: isolated prosthetic module, neural connector object, chrome bio-interface plate, or off-body integration part on neutral lookdev ground with seamless seams and LED status glows; no skin, anatomy, face, body, torso, shoulder, hand, wearable fashion pose, gore, exposed wound, surgery, horror mood, weapon, UI, readable text, camera prop, logo, or fetishized body framing.';
  }
  if (preset.id === 'SP03-068') {
    return 'Use one grounded photogrammetry scan asset, photo-textured material chunk, scanned architectural fragment, or natural surface specimen on neutral plinth-like ground with baked de-lit color, mesh imperfections, scan noise, and real-world scale cues; no capture setup, camera rig, tripod, generic rock pile, tree stump, ruined wall default, outdoor trail, market/library aisle, UI, labels, logo, text, or camera prop.';
  }
  if (preset.id === 'SP03-069') {
    return 'Use one controlled Houdini-style pyro simulation hero volume, contained smoke plume, heat vortex, or fire/smoke material specimen in black void or lookdev stage with turbulent density curls, self-illumination, layered black smoke, and visible fluid dynamics; no explosion disaster scene, weapon blast, burning building, person, battlefield, skull/monster, readable text, logo, UI, or camera prop.';
  }
  if (preset.id === 'SP03-070') {
    return 'Use one original retro-90s CGI hero object, non-human polygon creature-object, checkerboard material study, or awkward low-poly scene fragment with Phong shading, primary colors, and nostalgic early-render charm; no face-forward mascot, Toy Story/Reboot/franchise likeness, toy room, readable text, logo, UI, modern PBR realism, camera prop, or crowded room.';
  }
  if (preset.id === 'SP03-071') {
    return 'Use one tactile glassmorphism interface sculpture, not usable app UI, with frosted translucent cards, white border layers, blurred color fields, depth stacking, and diffuse transmission; no readable UI text, app screenshot, icons, brand logo, phone mockup, web page layout, dashboard chart, camera prop, or flat opaque panel.';
  }
  if (preset.id === 'SP03-072') {
    return 'Use one friendly clay interface material sculpture with soft rounded cards, pill buttons, molded cards, pastel matte surfaces, and warm soft shadows; no character, face, mascot, toy body, readable UI text, app screenshot, icons, brand logo, phone mockup, web page layout, dashboard chart, camera prop, pottery studio scene, or flat sharp panel.';
  }
  if (preset.id === 'SP03-073') {
    return 'Use one original papercraft 3D hero form, layered cardstock creature/object, folded architectural fragment, or cut-paper material sculpture filling the card with visible fold lines, paper grain, cut edges, warm craft shadows, and clean layered depth; no craft table, scissors, glue, hands, instruction sheet, contact sheet, material-strip bottom, origami crane default, readable text, logo, UI, or camera prop.';
  }
  if (preset.id === 'SP03-074') {
    return 'Use one abstract bent neon-tube creature/object silhouette or non-letter emissive glass sculpture with gas glow, transformer fittings, colored bloom, and wall-reflection ambience; no readable word, letters, logo, bar sign, brick wall default, nightclub scene, brand mark, UI, camera prop, or flat print.';
  }
  if (preset.id === 'SP03-075') {
    return 'Use one original ice sculpture hero form, carved translucent creature/object, frozen material specimen, or chiseled architectural fragment with blue-tinted refraction, frosty dispersion, melt-edge detail, and cold caustics; no gala/event table, swan default, cocktail sculpture, warm lighting, puddle melt, readable text, logo, UI, or camera prop.';
  }
  if (preset.id === 'SP03-076') {
    return 'Use one original inflatable Mylar pop-sculpture, abstract foil organism, alien seed pod, floating material form, or reflective non-animal object with visible seams, wrinkles, distorted reflections, buoyant tension, and metallic shimmer; no Jeff Koons copy, bunny/rabbit, dog, balloon-animal default, flower bouquet, gallery plinth default, party balloons cluster, birthday scene, readable text, logo, UI, camera prop, or hard heavy object.';
  }
  if (preset.id === 'SP03-077') {
    return 'Use one original toy-brick 3D construction, studded creature/object, modular brick material sculpture, or stepped architectural fragment with visible studs, clutch seams, ABS plastic gloss, fingerprints, and primary-color brick rhythm; no LEGO logo, minifigure, franchise/IP likeness, brick city default, toy box, readable text, logo, UI, camera prop, or smooth melted plastic.';
  }
  if (preset.id === 'SP03-078') {
    return 'Use one original origami 3D folded creature/object, faceted material form, or single-sheet sculptural fragment with crisp crease geometry, natural-fiber paper grain, sharp folds, and zen precision; no crane, lotus, paper boat default, craft table, scissors, hands, readable text, logo, UI, camera prop, cuts, glue, curved smooth surfaces, or paper crane cliche.';
  }
  if (preset.id === 'SP03-079') {
    return 'Use one original bronze sculpture hero form, cast-metal creature/object, abstract monument fragment, or patinated material specimen with warm bronze luster, verdigris in crevices, mold texture, heavy shadows, and cast detail; no famous statue, museum/gallery default, human bust default, pedestal/plinth focus, readable plaque/text, logo, UI, camera prop, or fleshy skin read.';
  }
  if (preset.id === 'SP03-080') {
    return 'Use one original marble sculpture hero form, carved stone creature/object, abstract Carrara material specimen, or chiseled architectural fragment with grey veining, semi-translucent stone depth, polished surface, and optional chisel marks; no famous statue, museum/gallery default, human bust default, Michelangelo/classical copy, pedestal/plinth focus, readable plaque/text, logo, UI, camera prop, or fleshy warm skin read.';
  }
  if (key !== 'pack_02__cinematic_lighting_and_lenses') return presetMotif(preset);
  return 'Use one preset-specific optical cue in light falloff, color separation, vignette, haze, reflection, bloom, shadow shape, or surface wetness; do not add a physical prop to symbolize the preset.';
}

function pack02CartoonRepresentativeSubject(preset: StyleRuntimePreset) {
  return `One simple original non-famous graphic anchor for ${pack02CartoonCardStyleLabel(preset)}: a cartoon figure, expressive silhouette, creature/object fragment, mascot-like form, or symbolic shape cluster. Keep it stylized and thumbnail-readable. Avoid real person, celebrity likeness, franchise character, realistic body, camera prop, readable text, logo, or repeated stock prop cluster; rooms, lamps, chairs, curtains, walls, aisles, or halls are allowed when they are intentional and preset-specific.`;
}

function pack02CartoonRepresentativeHeroCue(preset: StyleRuntimePreset) {
  return [
    pack02CartoonRepresentativeSubject(preset),
    `Media-specific supporting marks: ${softenPack02CartoonSpecimenCue(
      pack02CartoonSpecimenCue(preset),
    )}.`,
    'If a supporting mark note says no character or no body, interpret that as no realistic, famous, narrative, or scene-bound character; a simplified original graphic anchor is still required.',
  ].join(' ');
}

function pack02CartoonRepresentativeCamera() {
  return 'Poster-readable composition with one simple graphic anchor and supporting marks; perspective room, floor contact, cast shadow, scene depth, or prop staging may appear when they make the preset clearer, not as repeated filler.';
}

function representativeAnchorRule(
  pack: StyleRuntimePack,
  category: string,
  preset: StyleRuntimePreset,
) {
  const key = styleCategoryImageKey(pack.id, category);
  if (isPack02CartoonMediaPreset(pack, preset)) {
    return 'Do not output an empty abstract card. Include one simple original graphic anchor, character, figure, object, scene fragment, or motif, then let marks, texture, line, color, and shape prove the preset. Keep it original, non-famous, and not tied to a repeated stock scene.';
  }
  if (key === 'pack_03__lookdev_and_render_pipelines') {
    return 'Do not output an empty abstract field. Include one original 3D subject, character bust, creature/object fragment, or material hero form, with lookdev evidence around it.';
  }
  if (key.startsWith('pack_10__')) {
    return 'Use a clear central motif or readable abstract subject; avoid empty texture-only cards and avoid literal rooms, props, or scenes.';
  }
  if (pack.id === 'pack_14') {
    return 'Use one preset-specific mythic-noir anchor: figure, partial figure, object, material specimen, or scene fragment chosen for this exact preset. Avoid empty abstraction, object-only drift when a figure would clarify identity, and repeated hooded saint / circular halo / altar-table formulas across neighboring cards.';
  }
  return 'Prefer a representative style-card with one clear subject, figure, object, material specimen, character, or symbolic focal form when the category allows; avoid empty abstract-only cards and avoid literal stock scenes.';
}

function constraintSemantics() {
  return 'Interpret avoid/no lists as anti-repetition guidance, not absolute bans. Concrete elements such as walls, lamps, furniture, curtains, corridors, props, cameras, people, or environments may appear when they are intentional, preset-specific, and not the repeated default staging. Do not overcorrect into empty abstraction.';
}

function visualResetRule() {
  return 'If any earlier phrase sounds like abstract-only, no-scene, or no-object, reinterpret it as anti-cliche guidance. The final card still needs one readable representative subject: character, figure, object, room fragment, scene fragment, material form, or environment motif. Abstract marks support that subject; they are not the whole image.';
}

function presetAllowsAnimeGrammar(
  pack: StyleRuntimePack,
  category: string,
  preset: StyleRuntimePreset,
) {
  if (pack.id === 'pack_05' || pack.id === 'pack_13' || pack.id === 'pack_16') return true;
  if (pack.id === 'pack_06') return pack06AllowsAnimePreset(preset);
  const explicitText = [
    pack.name,
    category,
    preset.name,
    valueOf(preset.style, 'aesthetic', 'rendering_and_quality', 'render_quality', 'key_features'),
  ].join(' ');
  return /\b(anime|manga|visual[- ]novel|gacha|shonen|shounen|shojo|shoujo|seinen|josei|moe|isekai)\b/i.test(
    explicitText,
  );
}

function nonAnimeStyleLockLine(
  pack: StyleRuntimePack,
  category: string,
  preset: StyleRuntimePreset,
) {
  if (presetAllowsAnimeGrammar(pack, category, preset)) return '';
  return [
    'NON-ANIME STYLE LOCK:',
    'This preset is not an anime preset. This lock overrides broad prompt families, safe-imagegen labels, generic illustrated-card wording, and any accidental model bias toward anime.',
    'Keep the native preset language: illustration, painting, graphic novel, cartoon, game-art, fashion, material, architecture, photographic, print, poster, or abstract media when that is the manifest intent.',
    'Anime-related words in this prompt are negative constraints only. Do not resolve the card as manga, anime, cel-character, gacha, visual-novel, same-face character-card, or glossy anime concept-art grammar.',
    'If a person or humanoid appears, use a non-anime stylized figure with simple believable anatomy, no big-eye face, no glossy cel hair, no shonen pose, no visual-novel bust crop, no same-face anime cast, and no collectible card framing.',
  ].join(' ');
}

function nonAnimeRepresentativeHeroCue(preset: StyleRuntimePreset) {
  return `Use one readable non-anime representative anchor for ${sanitizeStylePromptName(
    preset.name,
  ).toLowerCase()}: material specimen, symbolic object, environment fragment, craft/process form, or a stylized figure only if a figure genuinely clarifies the preset.`;
}

const POSITIVE_ANIME_SCOPE_PATTERNS: Array<[RegExp, string]> = [
  [/SP06 ANIME-ALLOWED SCOPE/i, 'sp06 anime-allowed scope'],
  [/Pack 06 anime-allowed rule/i, 'sp06 anime-allowed rule'],
  [/Use one full readable original anime protagonist/i, 'anime protagonist directive'],
  [/Use one original anime (?:protagonist|character|figure|subject)/i, 'anime subject directive'],
  [/character-led anime keyframe/i, 'anime keyframe directive'],
  [/anime style-card with one original/i, 'anime style-card directive'],
];

function auditStyleScopeTargets(targets: PendingPreset[], activeSessionSuffix?: string) {
  const issues: string[] = [];

  for (const target of targets) {
    const { pack, preset, category, variantSlot } = target;
    const prompt = buildStylePrompt(pack, preset, 1, activeSessionSuffix, variantSlot);
    const allowsAnime = presetAllowsAnimeGrammar(pack, category, preset);
    const label = `${preset.id} ${pack.id} / ${category}`;

    if (allowsAnime) {
      if (prompt.includes('NON-ANIME STYLE LOCK')) {
        issues.push(`${label}: anime-allowed preset has NON-ANIME STYLE LOCK`);
      }
      continue;
    }

    if (!prompt.includes('NON-ANIME STYLE LOCK')) {
      issues.push(`${label}: missing NON-ANIME STYLE LOCK`);
    }

    if (pack.id === 'pack_06') {
      if (!prompt.includes('SP06 NON-ANIME SCOPE')) {
        issues.push(`${label}: missing SP06 NON-ANIME SCOPE`);
      }
      if (!prompt.includes('SP06 NON-ANIME MEDIUM LOCK')) {
        issues.push(`${label}: missing SP06 NON-ANIME MEDIUM LOCK`);
      }
    }

    for (const [pattern, reason] of POSITIVE_ANIME_SCOPE_PATTERNS) {
      if (pattern.test(prompt)) issues.push(`${label}: ${reason}`);
    }
  }

  return issues;
}

function normalizePack15PromptText(prompt: string) {
  return prompt
    .replace(/\bsemi-realistic game concept art,?\s*/gi, '')
    .replace(/\bsemi-realistic concept art,?\s*/gi, '')
    .replace(/\bsemi-real concept art,?\s*/gi, '')
    .replace(/\bsemi-real anime concept art,?\s*/gi, '')
    .replace(/\bsemi-real anime influence when useful,?\s*/gi, '')
    .replace(/\bsemi-real anime-adjacent card art,?\s*/gi, 'stylized non-anime card art')
    .replace(/\bflat graphic\b/gi, 'stylized graphic')
    .replace(/\bflat-to-painterly\b/gi, 'stylized painterly')
    .replace(/\bpainterly realism\b/gi, 'photoreal painterly realism')
    .replace(/\bmatte black\b/gi, 'matte charcoal')
    .replace(/\bblack water\b/gi, 'deep blue-gray water')
    .replace(/\bblack tide\b/gi, 'deep tide gray')
    .replace(/\btar black\b/gi, 'tar gray')
    .replace(/\bobsidian black\b/gi, 'obsidian gray-black')
    .replace(/\bblack night planes\b/gi, 'charcoal night planes')
    .replace(/\bblack sky plane\b/gi, 'blue-black sky plane')
    .replace(/\bblack tarp canopy\b/gi, 'charcoal tarp canopy')
    .replace(/\blarge gears\b/gi, 'large civic machine silhouettes')
    .replace(/\bsynchronized gears\b/gi, 'synchronized machine rhythms')
    .replace(/\bcarved gears\b/gi, 'carved stone machine arcs')
    .replace(/\bgear shadows\b/gi, 'machine shadows')
    .replace(/\bgear teeth\b/gi, 'machine-edge teeth')
    .replace(/\bgear masses\b/gi, 'machine masses')
    .replace(/\bbrass gear commons\b/gi, 'brass civic machine commons')
    .replace(/\bvalve shapes\b/gi, 'pressure-system shapes')
    .replace(/\bvalve glyphs\b/gi, 'pressure glyphs')
    .replace(/\bfield radios\b/gi, 'field signal boxes')
    .replace(/\bradio hardware\b/gi, 'signal infrastructure')
    .replace(/\bradio-map\b/gi, 'route-light')
    .replace(/\bradio convoy\b/gi, 'signal convoy')
    .replace(/\bradio street\b/gi, 'signal street')
    .replace(/\bpirate radio\b/gi, 'pirate signal')
    .replace(/\boperator-at-console repetition\b/gi, 'control-room repetition')
    .replace(/\boperator-at-background control glow repetition\b/gi, 'control-room repetition')
    .replace(/\bheadset operators\b/gi, 'signal citizens')
    .replace(/\boperators\b/gi, 'citizens')
    .replace(/\btechnicians\b/gi, 'protagonist silhouettes')
    .replace(/\bpublic repair crews\b/gi, 'public repair traces')
    .replace(/\bworker clusters\b/gi, 'tiny distant scale silhouettes')
    .replace(/\bsmall worker marks\b/gi, 'small distant scale marks')
    .replace(/\bcommuter silhouettes\b/gi, 'distant transit silhouettes')
    .replace(/\bsuited gardeners\b/gi, 'moon greenhouse silhouettes')
    .replace(/\bfigures\b/gi, 'distant scale silhouettes')
    .replace(/\bshared terminals\b/gi, 'shared luminous fields')
    .replace(/\bterminal\b/gi, 'background glow field')
    .replace(/\bterminals\b/gi, 'background glow fields')
    .replace(/\bconsole\b/gi, 'background control glow')
    .replace(/\bCRT scopes\b/gi, 'phosphor glow panels')
    .replace(/\bscreens\b/gi, 'glow panels')
    .replace(/\bdevice\b/gi, 'world motif')
    .replace(/\bdevices\b/gi, 'world motifs')
    .replace(/\bobject focus\b/gi, 'foreground prop fixation');
}

function pack13AnimeIdentityRule(pack: StyleRuntimePack, preset?: StyleRuntimePreset) {
  if (pack.id !== 'pack_13' || !preset?.id.startsWith('SP05-')) return '';
  return [
    'ANIME IDENTITY RULE: do not collapse this preset into generic glossy anime, same-face moe, default pastel portrait, object-only still life, or shared modern TV-anime rendering.',
    'When artist, studio, series, or movement names appear, use them as broad visual lineage only: line discipline, color script, composition grammar, acting style, texture, and animation-era cues. Do not copy named characters, costumes, logos, scenes, or exact franchise compositions.',
    'Give this preset one representative original character, silhouette, creature, mask, garment/body-language cue, or character-adjacent emblem unless the preset explicitly demands a material-only card.',
    'Make the card distinguishable from neighboring SP05 anime cards at thumbnail size through a unique palette, pose rhythm, material language, and scene logic.',
  ].join(' ');
}

const PACK16_LINEAGE_BY_ID: Record<string, string> = {
  'SP05-007':
    'Tetsuo Hara and Buronson wasteland martial melodrama, Hokuto no Ken-era Toei pressure, thick 1980s anatomy, brutal sun, and dry analog cel impact',
  'SP05-008':
    'Tsukasa Hojo procedural cool, City Hunter-era neon comedy-noir, polished 1980s TV detective timing, glass reflections, and dry clue-reading charisma',
  'SP05-009':
    'Katsuhiro Otomo cyber-retro city density, Akira-era infrastructure pressure, Rintaro industrial spectacle, layered traffic-light color, and mechanical social overload',
  'SP05-010':
    'Akira Toriyama round adventure comedy, Dr. Slump / early Dragon Ball-era elastic slapstick, simple sunny cel shapes, and friendly physical gag timing',
  'SP05-011':
    'Yoshihiro Togashi and 1990s shonen aura rivalries, Yu Yu Hakusho tournament pressure, Dragon Ball Z power-up staging, and heavy cel contrast',
  'SP05-012':
    'Naoko Takeuchi magical-girl glamour, Ikuko Itoh 1990s transformation polish, Toei chorus staging, ribbon spirals, pearl pastel light, and hopeful team rhythm',
  'SP05-014':
    'Shinichiro Watanabe jazz-noir cool, Cowboy Bebop space melancholy, Yoko Kanno-era lounge rhythm, and late-1990s Sunrise cel atmosphere',
  'SP05-015':
    'Mamoru Oshii cyber-operations vertigo, Ghost in the Shell philosophical police tension, Production I.G precision, rain glass, and cold network anxiety',
  'SP05-016':
    'Yoshihiro Togashi spirit-tournament pressure, Yu Yu Hakusho 1990s arena tension, sharp rival silhouettes, aura smoke, and emotional combat restraint',
  'SP05-017':
    'Nobuhiro Watsuki wandering atonement melodrama, Studio Gallop / Deen 1990s cel drama, wind-worn cloth, moral restraint, and sunset memory',
  'SP05-018':
    'Yasuhiro Nightow dusty space-western absurdity, Trigun / Madhouse outlaw melancholy, desert comedy timing, battered coats, and warm analog grit',
  'SP05-024':
    'Hiromu Arakawa alchemical moral geometry, Bones 2000s adventure drama, robust humanist anatomy, diagram-like energy, and practical metal warmth',
  'SP05-026':
    'Goro Taniguchi and CLAMP operatic rebellion strategy, Code Geass-era chesslike staging, Sunrise masked melodrama, and black-red-gold theatrical contrast',
  'SP05-027':
    'Hiroyuki Imaishi and Gainax spiral bravado, Gurren Lagann-era impossible scale, flame-orange confidence, and explosive graphic diagonals',
  'SP05-030':
    'Atsushi Ohkubo gothic soul-pop action, Bones-era clean black shapes, skull-pop rhythm, angular costume silhouettes, and musical combat timing',
  'SP05-071':
    'Hayao Miyazaki and Studio Ghibli warm liminal fantasy, Spirited Away-era handcrafted wonder, ethical discovery, soft creature warmth, and humid amber glow',
  'SP05-072':
    'Hayao Miyazaki ecological conflict epic, Princess Mononoke-era mythic nature pressure, painterly forest mass, moral ambiguity, and living material surfaces',
  'SP05-073':
    'Hayao Miyazaki clockwork hearth fantasy, Howl-era wandering domestic magic, brass machinery, warm rooms, floating wonder, and emotional craft',
  'SP05-074':
    'Ghibli sky-adventure longing, Castle in the Sky-era blue horizons, hand-painted clouds, small human courage, and luminous flight melancholy',
  'SP05-075':
    'Makoto Shinkai rainlight romance and Naoko Yamada threshold microacting, refracted glass, blue-white longing, and intimate weather memory',
  'SP05-076':
    'Satoshi Kon dream-collapse surrealism, Paprika-era montage logic, unstable perception, carnival color, and precise adult-anime editing rhythm',
  'SP05-077':
    'Satoshi Kon identity thriller, Perfect Blue-era mirror fracture, adult performance anxiety, clean psychological cuts, and controlled visual paranoia',
  'SP05-078':
    'Katsuhiro Otomo light-trail collapse, Akira-era urban catastrophe, red taillight smear, concrete scale, and dense but readable cel machinery',
  'SP05-079':
    'Takeshi Koike / Studio 4C hyperkinetic cosmic velocity, Redline-like chromatic speed, razor anatomy, and impossible motion compression',
  'SP05-080':
    'Daisuke Igarashi and Studio 4C oceanic cosmic lyricism, Children of the Sea water-light anatomy, blue bioluminescence, and flowing hand-drawn density',
};

const PACK16_LINEAGE_RULES: Array<[RegExp, string]> = [
  [
    /space|astral|cosmic|corsair|journey|opera|pulp/i,
    'Leiji Matsumoto romantic space opera, 1970s-1980s astral melancholy, long silhouettes, antique brass, star depth, and noble distance',
  ],
  [
    /cyber|wired|techno|noir|ops|infrastructure|telemetry|arcade/i,
    'Katsuhiro Otomo, Mamoru Oshii, Production I.G, and 1990s cyber-anime layout discipline: hard surfaces, rain reflections, signal glow, and system pressure',
  ],
  [
    /gothic|velvet|rose|baroque|covenant|ascetic|nocturne/i,
    'Kunihiko Ikuhara, CLAMP, and classic gothic shojo stage grammar: symbolic symmetry, vertical poise, velvet shadows, and ornamental emotional coding',
  ],
  [
    /sports|rivalry|team|relay|endurance|training|duel|spin|sprint|performance|partner|ensemble/i,
    'Takehiko Inoue sports anatomy, Production I.G competitive motion clarity, Kyoto Animation performance microacting, and clean body-language-first tension',
  ],
  [
    /romance|intimacy|domestic|warmth|reconciliation|confession|tender|humanist/i,
    'Naoko Yamada intimate microacting, Isao Takahata humanist observation, Kyoto Animation softness, and restrained everyday emotional realism',
  ],
  [
    /dream|surreal|memory|temporal|metaphysical|mourning|carnival/i,
    'Satoshi Kon psychological cinema, Mamoru Oshii metaphysical stillness, and art-anime montage grammar: fractured time, symbolic edits, and adult emotional tension',
  ],
  [
    /eco|rusted|biomorphic|mist|nature|whisper/i,
    'Hayao Miyazaki ecological myth, Isao Takahata naturalist patience, Studio Ghibli painted-world craft, and living landscape materiality',
  ],
  [
    /mecha|machine|formation|institutional|paramilitary|iron|command/i,
    'Ryousuke Takahashi real-robot restraint, Sunrise tactical cel staging, Mamoru Oshii institutional pressure, and worn machine readability',
  ],
  [
    /slapstick|rom-com|comedy|deadpan|mayhem|irony/i,
    'Rumiko Takahashi elastic rom-com timing, Akira Toriyama round gag shapes, Sunrise TV comedy staging, and expressive cel reaction rhythm',
  ],
  [
    /magical|sparkling|zodiac|heraldic|vow|ritual|omen|celestial/i,
    'Naoko Takeuchi magical-girl glamour, CLAMP decorative verticality, 1990s Toei transformation language, and jewel-light symbolic staging',
  ],
  [
    /horror|demonic|grotesque|void|marionette|dread/i,
    'Kazuo Umezz and Junji Ito manga dread, Mamoru Oshii void silence, 1990s OVA horror texture, and non-graphic psychological pressure',
  ],
  [
    /glam|punk|fashion|elegant|heist/i,
    'Ai Yazawa fashion-drama linework, Tsukasa Hojo elegant adult cool, 1980s-2000s magazine-anime glamour, and pose-led styling',
  ],
  [
    /velocity|speed|drift|flow|apex|breakaway|aerial/i,
    'Takeshi Koike speed-poster anatomy, Hiroyuki Imaishi kinetic diagonals, Studio 4C velocity color, and high-contrast motion compression',
  ],
];

function pack16AnimeReferenceLineage(preset: StyleRuntimePreset) {
  const exact = PACK16_LINEAGE_BY_ID[preset.id];
  if (exact) return exact;
  const search = `${preset.name} ${preset.category ?? ''}`;
  for (const [pattern, lineage] of PACK16_LINEAGE_RULES) {
    if (pattern.test(search)) return lineage;
  }
  if (preset.category?.includes('70s') || preset.category?.includes('80s')) {
    return 'Osamu Dezaki, Toei / Nippon Animation broadcast cel craft, 1970s-1980s analog registration softness, bold silhouettes, and era-authentic color limits';
  }
  if (preset.category?.includes('90s')) {
    return '1990s prestige TV-anime grammar: Sunrise, Madhouse, Production I.G, Gainax, and CLAMP-era cel staging, strong silhouettes, and analog cinematic contrast';
  }
  if (preset.category?.includes('2000s')) {
    return '2000s classics grammar: Bones, Kyoto Animation, Madhouse, Shaft, and Production I.G-era digital-cel clarity, strong character acting, and distinct color scripts';
  }
  if (preset.category?.includes('Studio Masterpieces')) {
    return 'anime film-masterpiece grammar: Studio Ghibli, Satoshi Kon, Mamoru Oshii, Masaaki Yuasa, and Studio 4C lineage cues in composition, acting, palette, and texture';
  }
  return 'anime classics and prestige lineage through era-specific line discipline, color script, character acting, studio lighting grammar, and animation texture';
}

function pack16AnimeBasePromptOverride(pack: StyleRuntimePack, preset?: StyleRuntimePreset) {
  if (pack.id !== 'pack_16' || !preset) return undefined;
  const lineage = pack16AnimeReferenceLineage(preset);
  const brief =
    typeof preset.style.creative_brief === 'string' && preset.style.creative_brief.trim()
      ? ` Creative brief: ${preset.style.creative_brief.trim()}`
      : '';
  return `A character-led anime classics/prestige style-card with one original hybrid anime protagonist or character-world focal subject chosen specifically for ${preset.name}. Let anatomy, wardrobe silhouette, companion creature, symbolic mask, machine/ritual/weather trait, or background architecture fuse into the character identity instead of showing a plain literal role. Reference lineage: ${lineage}. Use those names as broad visual lineage only: line discipline, era texture, color script, composition grammar, acting style, and lighting behavior; do not copy named characters, costumes, logos, scenes, layouts, or franchise compositions.${brief} Must read as ${sanitizeStylePromptName(preset.name).toLowerCase()} through distinctive pose rhythm, silhouette logic, palette, shot grammar, and a scenario that actively exploits the style, not generic glossy anime, same-face portrait, object-only still life, basic role illustration, rubble field, aura wallpaper, corridor, market/library aisle, camera prop, lamp setup, or empty abstraction.`;
}

function pack16AnimeIdentityRule(pack: StyleRuntimePack, preset?: StyleRuntimePreset) {
  if (pack.id !== 'pack_16' || !preset) return '';
  return [
    'ANIME PRESTIGE IDENTITY RULE: every pack_16 card must be distinguishable from neighboring anime presets at thumbnail size.',
    'Use artist, studio, director, era, or movement names only as broad lineage cues for visual grammar, never as literal copying.',
    'Prefer an original visible hybrid character or character-adjacent subject; machinery, creatures, masks, emblems, weather, architecture, or ritual systems should fuse with the character/world design when they are preset-specific, not become a generic object escape.',
    'Scenario must do real style work: use setting, scale, atmosphere, costume logic, and environmental motifs to amplify the preset rather than placing a plain character in a basic literal backdrop.',
    'Allow stylized blood, bruising, threat, combat intensity, or weapon presence when the preset identity genuinely needs it; keep it non-gory, non-explicit, and silhouette/composition-led.',
    'Separate each card with unique hybrid silhouette, line weight, body-language cue, color-script split, lighting setup, texture density, and composition logic.',
  ].join(' ');
}

function pickVariant(list: string[], seed: string) {
  return list[Math.abs(hashString(seed)) % list.length];
}

function presetBasePromptOverride(preset?: StyleRuntimePreset) {
  if (!preset) return undefined;
  const overrides: Record<string, string> = {
    'SP10-025':
      'An ASCII-art style-card built from non-readable monospace glyph density forming one abstract rescue craft, compact vehicle, botanical terminal relic, or architectural landmark, not a person. Use a plain dark terminal-like field, character-cell shading, symbol-density value bands, and terminal-era spacing. No hooded hacker, human figure, face, readable words, code snippets, UI windows, screens, room, desk, weapon, captions, logo, or text panel.',
    'SP10-032':
      'A liminal-space style-card made from empty transitional architecture only: vacant pool edge, office threshold, mall service corner, carpeted waiting room, or fluorescent corridor fragment with no people or life. Use beige synthetic surfaces, flat artificial light, over-clean emptiness, awkward perspective, and purpose removed. No human figure, silhouette, statue, face, body, animal, plant, portrait, fashion pose, or character anchor.',
    'SP05-363':
      'A finished anime prestige sports style-card for Synchronized Aerial Team: four aerial ribbon performers crossing at different heights, one lead figure in clear midair extension, visible team geometry, blue-orange ribbons as broad arcs, arena light as clean cel shapes. Must read as synchronized aerial teamwork, not solo idol pose, generic gymnast portrait, circus poster, object-only ribbons, or same glossy anime dancer as neighboring presets. Use distinct classic anime linework, clean denoise, and no ultra-fine noise.',
    'SP05-365':
      'A finished anime prestige performance style-card for Formal Partner Motion: two partner dancers in a precise angular hold, feet and hands visible, formal motion diagram implied by non-readable light arcs, restrained stage floor, cream/black/red palette. Must read as disciplined partner motion, not romantic ballroom fantasy, wedding couple, chandelier glamour, idol romance poster, or single pretty protagonist. Use distinct anime film still linework, clean denoise, and no ultra-fine noise.',
    'SP05-366':
      'A finished anime prestige ensemble style-card for Traditional Ensemble Resonance: low stage view of three musicians in traditional dress with different instruments, one conductor hand cue, layered screen pattern as broad shapes, warm wood and ink-red accents. Must read as ensemble resonance, not solo koto beauty portrait, palace room, idol kimono pose, object-only instrument still life, or repeated pretty face. Use distinct hand-drawn anime staging, clean denoise, and no ultra-fine noise.',
    'SP05-367':
      'A finished anime prestige music style-card for Brass Section Tender Precision: close diagonal row of brass players, foreground trumpet valves and focused player expression, two blurred sectionmates, warm rehearsal hall light, blue-gold uniform shapes without logos. Must read as tender section precision, not solo idol trumpet portrait, orchestra wallpaper, ballroom performance, marching-band poster, or object-only instrument. Use distinct anime character acting, clean denoise, and no ultra-fine noise.',
    'SP05-371':
      'A finished anime prestige performance style-card for Virtuoso Ensemble Whirl: one hybrid conductor-dancer protagonist with ribbon-like music arcs and instrument motifs integrated into wardrobe silhouette, plus only two or three simplified supporting performer silhouettes in the background. Keep hands, shoulders, hips, and feet anatomically readable; avoid crowded full-body ensemble anatomy, tangled instruments, crossed hands, extra fingers, and many visible faces. Must read as ensemble virtuosity and whirl, not lone male dancer, generic stage spotlight, romantic ballroom, idol concert, orchestra wallpaper, or repeated solo performance portrait. Use distinct anime motion smear design, clean denoise, and no ultra-fine noise.',
    'SP05-372':
      'A finished anime prestige drama style-card for Allegorical Spotlight Confrontation: two rival performers face each other across a split spotlight circle, one in red shadow, one in cool white, stage geometry as symbolic confrontation, hands tense but no weapon. Must read as allegorical confrontation, not back-view dance pinup, generic stage pose, romance duet, idol glamour, or abstract spotlight only. Use distinct anime theatrical framing, clean denoise, and no ultra-fine noise.',
    'SP13-026':
      'A finished anime prestige samurai style-card for Pre-Impact Ritual Stillness: close crop before a draw, one hand on scabbard, one breath cloud, face mostly shadowed under rain eaves, moonlit courtyard as simple planes. Must read as pre-impact stillness, not full-body red cloak hero, generic warrior poster, battle action, ornate fashion portrait, or corridor doorway. Use restrained 90s samurai anime linework, clean denoise, and no ultra-fine noise.',
    'SP13-027':
      'A finished anime prestige samurai style-card for Crimson Formation Momentum: diagonal formation of three mounted or marching samurai silhouettes moving through wind-torn red banners, lead figure small but clear, dust and sea-gray sky. Must read as formation momentum, not lone red-cloak swordsman, fantasy general portrait, static cape pose, battlefield wallpaper, or weapon pinup. Use bold anime war-epic staging, clean denoise, and no ultra-fine noise.',
    'SP13-028':
      'A finished anime prestige medieval style-card for Sacred Heraldic Vow: one hybrid oath-bearer protagonist with heraldic armor-cloak silhouette, moonlit crest geometry behind the body, one readable hand over the chest or banner, and vow witnesses reduced to distant silhouettes. Keep anatomy clean and simple: no interlocked gauntlet close-up, no crossed forearms as focal point, no extra fingers, no fused wrists, no symmetrical hand stack. Must read as sacred vow and heraldic duty, not priestess portrait, royal fashion pose, logo/crest plate, cathedral corridor, hand-only poster, or generic fantasy ceremony. Use classic anime ceremonial linework, clean denoise, and no ultra-fine noise.',
    'SP14-081':
      'A finished mythic-noir style-card for Broken Comet Omen Archive: cracked dome sky seen through a broken brass comet lens, one archivist only as a small side silhouette, silver ash star-map shards, ember-gold fracture light, and obsidian vault curves. Must read as broken prophecy archive, not handsome astrologer portrait, telescope hero prop, library room, corridor, readable map, or generic starry vista. Use clean digital painting, broad cosmic shapes, denoised surfaces, and no ultra-fine noise.',
    'SP14-082':
      'A finished mythic-noir style-card for Eclipse Meridian Verdict: strict vertical black meridian obelisk splitting an eclipse halo, two tiny tribunal silhouettes below, blood-amber brazier edge light, basalt steps, and moon-ivory shadow geometry. Must read as cosmic judgment and legal inevitability, not robed public speaker, altar scene, court portrait, circular sigil plate, or temple hallway. Use clean digital painting, monumental geometry, denoised surfaces, and no ultra-fine noise.',
    'SP14-083':
      'A finished mythic-noir style-card for Zodiac Tempered Destiny: celestial forge core with rotating brass orbit rings and one smith-shadow from behind pulling a chain, cinder-orange heat, iron-blue stone, and constellation marks as non-readable dots. Must read as destiny being tempered, not mage portrait, zodiac wheel poster, object-only astrolabe, forge corridor, or fantasy workshop. Use clean digital painting, strong silhouette hierarchy, denoised surfaces, and no ultra-fine noise.',
    'SP14-089':
      'A finished mythic-noir style-card for Glass Astrolabe Navigation: sea-green tide table with a transparent glass astrolabe rising like a sail, a small navigator silhouette reflected in water with hands hidden by cloak/rail, amber omen beacons, salted timber arcs, and steel-blue night. Must read as tides and stars as one map, not harbor postcard, dock corridor, young sailor portrait, telescope prop, hand-detail study, or object-only instrument plate. Use clean digital painting, crisp glass shapes, denoised surfaces, and no ultra-fine noise.',
    'SP14-090':
      'A finished mythic-noir style-card for Auroral Omen Containment: aurora trapped inside a black-ice ring cage, two distant sentry shadows on opposite ledges, warning-amber seals as blank light blocks, polar cyan veils, and chained stone geometry. Must read as dangerous prophecy contained, not prison hallway, tower postcard, sci-fi containment tube, lone hero portrait, or abstract aurora wallpaper. Use clean digital painting, stark readable geometry, denoised surfaces, and no ultra-fine noise.',
    'SP14-094':
      'A finished mythic-noir style-card for Night Meridian State Secret: sealed meridian evidence cabinet with brass clockwork index rings and parchment folders shown as blank blocks, a gloved sleeve silhouette closing a black folio with fingers mostly hidden, faint celestial backlight, ink-black depth. Must read as classified cosmic anomaly, not library aisle, young scholar portrait, readable ledger, desk-lamp still life, hand-detail study, stacked corridor, or fantasy archive room. Use clean digital painting, controlled dense detail, denoised surfaces, and no ultra-fine noise.',
    'SP14-095':
      'A finished mythic-noir style-card for Thorned Solar Relic Icon: thorn-pierced solar relic suspended inside folded bone-white carrying cloth, partial sleeve silhouettes only, burnished gold rim, scarred enamel, soot haze, and sharp sacrificial edge light. Must read as dangerous sacred solar icon, not altar display, circular logo, weapon halo, saint portrait, trophy still life, visible hand study, or generic golden sun sigil. Use clean digital painting, high contrast, denoised surfaces, and no ultra-fine noise.',
    'SP14-098':
      'A finished mythic-noir style-card for Ash-Crown Residue Authority: collapsed ash crown hovering over an empty ceremonial coat, crown fragments drifting like soot, antique ivory beam, charred enamel, and muted silver dust. Must read as fallen authority and afterimage, not anime profile, ruler portrait, sword relic, serpent loop, symmetrical totem, or object-only crown poster. Use clean digital painting, solemn negative space, denoised surfaces, and no ultra-fine noise.',
    'SP14-099':
      'A finished mythic-noir style-card for Underworld Lantern Threshold: amber lantern glow at a black shoreline threshold, ferry-rope silhouettes and mourning veils as distant shapes, a veiled figure setting the lantern down with fingers hidden in shadow, oxblood darkness, and smoke falloff. Must read as crossing into underworld, not hooded corridor traveler, cave tunnel, red-cloak hero, stairway hallway, hand-detail study, or lantern product still life. Use clean digital painting, strong light falloff, denoised surfaces, and no ultra-fine noise.',
    'SP14-101':
      'A finished mythic-noir style-card for Blackwater Totem Memory: carved ancestor totem partly submerged in blackwater with an elder hand touching the wet wood, moonlit reflection bands, oxidized copper scars, river-teal glints, and no central symmetrical icon. Must read as memory and passage, not object-only pillar, decorative mask, temple totem wall, landscape postcard, or monster idol. Use clean digital painting, emblematic clarity, denoised surfaces, and no ultra-fine noise.',
    'SP14-102':
      'A finished mythic-noir style-card for Veil of Erased Names: suspended linen veil with scraped-away name traces as non-readable smudges, two partial witness hands behind cloth, muted violet edge light, wax residue, and ash-white folds. Must read as remembrance and erasure, not young profile portrait, readable names, memorial plaque, bedroom curtain, studio drape, or empty textile abstraction. Use clean digital painting, soft layered depth, denoised surfaces, and no ultra-fine noise.',
    'SP14-104':
      'A finished mythic-noir style-card for Eclipse Cipher Knowledge: overhead oblique view of brass eclipse rings opening over blank parchment slabs, a simple gloved pointer shadow aligning a moon disk with no visible fingers, midnight-blue enamel shadow, and secret-order geometry with no readable marks. Must read as hidden lunar knowledge and cipher structure, not scholar portrait, library desk, readable diagram, circular logo plate, altar table, hand-detail study, or generic astrology device. Use clean digital painting, precise medium-sized detail, denoised surfaces, and no ultra-fine noise.',
    'SP14-107':
      'A finished mythic-noir style-card for Midnight Candle Compression: close crop of a brass candle press and two gloved partial hands compressing black wax into one square flame block, with dark red cloth planes, tiny warm flame accents, and no visible face. Must read as condensed ritual pressure, not a robed priest portrait, candle shrine, chapel corridor, altar table, or generic gothic room. Use clean digital painting, strong silhouette, medium-sized details, denoised surfaces, and no ultra-fine noise.',
    'SP14-108':
      'A finished mythic-noir style-card for Blood Moon Processional Omen: wide vertical procession seen from behind as small masked silhouettes crossing shallow red water under a huge blood moon, with banner-like blank cloth shapes, lantern dots, and one foreground hand releasing red ash. Must read as communal omen and moon procession, not lone handsome robed profile, throne scene, temple hallway, weapon scene, or concept-art corridor. Use clean digital painting, broad value shapes, denoised surfaces, and no ultra-fine noise.',
    'SP14-109':
      'A finished mythic-noir style-card for Blackwater Confessional Reflection: cropped blackwater basin filling the lower card, one reflected older face broken by ripples, only partial shoulders and hands at the edge, cyan window glow as simple shape, and dark teal stone planes. Must read as confession through reflection and water memory, not a young robed figure in a chapel, mirror portrait, altar room, or generic gothic interior. Use clean digital painting, readable midtones, denoised surfaces, and no ultra-fine noise.',
    'SP14-110':
      'A finished mythic-noir style-card for Oath Knife Binding: close symbolic binding scene with two different hands tying red cord around a sheathed ceremonial knife on rough stone, oath seal wax and shadowed sleeves as supporting shapes, no weapon swing and no face-forward villain. Must read as oath and binding first, knife second, not violence glamour, torture, altar-table fantasy, hooded cultist, or robed young man. Use clean digital painting, medium-sized tactile detail, denoised surfaces, and no ultra-fine noise.',
    'SP14-111':
      'A finished mythic-noir style-card for Ash Choir Absence: empty stepped choir stalls after a ritual, ash silhouettes where singers should be, one small abandoned mask on a seat, pale dust beams, and a partial departing shadow at the frame edge. Must read as absence, choir, and ash memory, not a single cloaked character, cathedral corridor, candle shrine, ghost horror, or object-only still life. Use clean digital painting, quiet negative space, denoised surfaces, and no ultra-fine noise.',
    'SP14-112':
      'A finished mythic-noir style-card for Veiled Grimoire Secrecy: close layered gauze veils hiding a clasped forbidden book, one partial reader hand and one reflected eye only, ink-blue shelves as blurred shapes, burgundy fabric, and parchment-gold rim light. Must read as secrecy and veiled knowledge, not a readable book page, library aisle, wizard desk, lamp still life, or full robed scholar portrait. Use clean digital painting, soft occlusion, denoised surfaces, and no ultra-fine noise.',
    'SP14-113':
      'A finished mythic-noir style-card for Silent Bell Warning: monumental suspended bronze bell cropped from below, heavy chain silhouette, one tiny mourner shadow for scale, smoke-gray niche rhythm, and a focused patina edge highlight. Must read as silent warning and suspended mass, not a tunnel corridor, chapel room, bell tower postcard, robed protagonist, or generic mourning portrait. Use clean digital painting, broad stone shapes, denoised surfaces, and no ultra-fine noise.',
    'SP14-116':
      'A finished mythic-noir style-card for Night Orchid Witness: dark orchid blossoms framing a partial masked witness behind lacquer screens, plum-black garden terrace shapes, muted gold pin lights, and glossy petals as large controlled forms. Must read as botanical witness and ritual secrecy, not flower still life, house interior, curtain studio setup, romantic portrait, or orchid altar repetition. Use clean digital painting, elegant botanical detail, denoised surfaces, and no ultra-fine noise.',
    'SP14-117':
      'A finished mythic-noir style-card for River King Thunder Sovereignty: elder river sovereign as small powerful silhouette on wet basalt steps, flood channels cutting diagonally, bronze thunder pillars, rain-gray sky crack, and deep blue-green water reflections. Must read as lawful storm sovereignty, not throne-room king portrait, young robed speaker, palace hall, or empty waterfall landscape. Use clean digital painting, authoritative scale, denoised surfaces, and no ultra-fine noise.',
    'SP14-118':
      'A finished mythic-noir style-card for Cinder Sun Pantheon Trial: ash-covered trial circle with a furnace sun core, three distant deity-niche silhouettes, a kneeling witness reduced to shadow, ember-red smoke, and blackened ivory steps. Must read as ordeal and radiant severity, not generic sun altar, heroic fire mage, temple corridor, or cheerful solar fantasy. Use clean digital painting, strong iconographic clarity, denoised surfaces, and no ultra-fine noise.',
    'SP14-120':
      'A finished mythic-noir style-card for Twin Gods Tidal Duality: mirrored tidal gate split down the center with two opposing guardian silhouettes, sea-teal water on one side, storm-white foam on the other, copper fittings, and a central threshold glow. Must read as paired protection and rivalry, not two generic twins posing, harbor postcard, deity throne scene, or symmetrical logo plate. Use clean digital painting, clear dual structure, denoised surfaces, and no ultra-fine noise.',
    'SP14-121':
      'A finished mythic-noir style-card for Iron Harvest Stewardship: broad harvest field edge meeting iron reliquary tools, one older steward figure carrying wheat sheaves beside black forged arcs, late sun, dusty green distance, and sacred rural scale. Must read as stewardship and abundance, not modern farm, worker propaganda, scythe weapon hero, marketplace, or generic golden field. Use clean digital painting, rural material detail, denoised surfaces, and no ultra-fine noise.',
    'SP14-122':
      'A finished mythic-noir style-card for Serpent Oracle Lineage: side-view oracle heir with emerald-black veil and coiling serpent column behind, gold wire prophecy arcs, guarded court steps, and polished obsidian floor. Must read as lineage, prophecy, and coiling authority, not snake monster attack, static throne pose, generic green sorcerer, or object-only serpent emblem. Use clean digital painting, elegant court rhythm, denoised surfaces, and no ultra-fine noise.',
    'SP14-123':
      'A finished mythic-noir style-card for Ashen Hearth Guardian Warmth: warm hearth guardian figure half-hidden by smoke and firebrick, bronze hooks, ember-orange domestic flame, ash-gray timber, and sheltered kinship suggested by two small background silhouettes. Must read as sacred homecoming and protection, not tavern scene, kitchen still life, communal hall corridor, roaring fireplace postcard, or generic cozy fantasy. Use clean digital painting, intimate warm scale, denoised surfaces, and no ultra-fine noise.',
    'SP15-001':
      'A character-led 2D steampunk civic-machine card: one visible brass gear keeper protagonist in asymmetrical three-quarter crop, hand on a valve wheel or pressure lever, broad public engine square behind them, warm brass/umber/cream planes, chunky gear silhouettes, simplified drawn face and hands, clean poster depth, and low-to-moderate detail. Must read as useful civic machinery through protagonist plus background, not worker crew, labor propaganda, object-only gear plate, American stock poster, generic RPG hero, photoreal grit, cinematic key art, hyper-detail, or noisy rivet texture.',
    'SP15-002':
      'A character-led 2D dieselpunk rail signal card: one visible coal-fog signal runner protagonist in asymmetric patched civilian signal coat, scarf-hood or soft cap only if non-uniform, operating a semaphore pull or red signal lamp, locomotive mass and rail gantries behind them, amber-charcoal blocks, chunky ink contours, and sparse paper grain. Must read as civilian rail logistics through protagonist plus station machinery, not officer portrait, conductor uniform, peaked cap hero, worker crew, military rail scene, propaganda, lantern pin-up, object-only locomotive poster, noir stock American hero, realistic rail yard, cinematic key art, hyper-detail, or noisy soot texture.',
    'SP15-003':
      'A character-led 2D pressure-lace automata card: one visible porcelain automata protagonist with articulated hand gesture, mask-like face, brass pressure valves, broad struts, gauge arcs, pale blue glass accents, cream tea-stain planes, and elegant shallow poster depth. Must read as graceful clockwork life through automata plus workshop background, not doll still life, object-only mechanism plate, worker crew, generic fantasy android, photoreal porcelain, overpacked filigree, cinematic key art, hyper-detail, or noisy micro-ornament.',
    'SP15-004':
      'A character-led 2D civilian radio-convoy card: one visible pirate radio courier protagonist with headset and shoulder transmitter, mobile broadcast truck, oversized antenna mast, radio-wave bolts, abstract route panels with no readable labels, olive/rust/black palette, chunky ink contours, and sparse paper grain. Must read as signal coordination through protagonist plus hardware, not soldier, guard, faction coat, flag, military checkpoint, worker crew, lantern hero, object-only truck poster, realistic convoy scene, cinematic key art, hyper-detail, or noisy antenna clutter.',
    'SP15-005':
      'A character-led 2D clockpunk assembly card: one visible clocktower mechanic protagonist leaning into a giant escapement key, clock-face shadow and public stair geometry behind them, unreadable placard shapes only as background color blocks, aged ivory, blue-black ink, brass, and brick red. Must read as clever civic clockwork through protagonist plus tower mechanism, not labor rally, revolution poster, propaganda crowd, worker crew, readable slogan, object-only clock diagram, generic RPG hero, cinematic key art, hyper-detail, or noisy gear clutter.',
    'SP15-006':
      'A character-led 2D pneumatic print-foundry card: one visible punk print alchemist protagonist in cropped side-view, ink-splashed apron over unusual patched clothing, one hand guiding blank paper sheets while pneumatic air pipes sweep behind them, blocky press silhouette, ink blue/iron/rubber color fields, clean drawn hands, and broad matte poster planes. Must read as experimental print machinery through protagonist plus foundry background, not muscular factory worker, American stock labor poster, worker crew, propaganda print shop, readable type, logo, object-only press plate, photoreal factory, cinematic key art, hyper-detail, or noisy mechanical texture.',
    'SP15-007':
      'A character-led 2D smogline airship-dock card: one visible mooring pilot protagonist in cropped asymmetrical pose, gloved hand on a rope cleat or signal paddle, huge oval airship mass, blocky mooring tower, broad rope arcs, flat smog-sun block, ochre/gray/orange palette, soft matte paint, and large quiet sky/dock planes. Must read as dock logistics through protagonist plus airship background, not worker crew, object-only airship postcard, gas-mask labor hero, realistic dock scene, dense scaffold grid, rendered metal, volumetric fog, cinematic key art, hyper-detail, or noisy rivets.',
    'SP15-008':
      'A character-led 2D rivet-cathedral workshop card: one visible rivet cantor protagonist or ceremonial machinist holding a broad welding halo tool, monumental press ribs behind them, wax-gold accent, iron/rust shape blocks, simplified steam planes, clean graphic contours, and shallow poster depth. Must read as industrial ceremony through protagonist plus machine interior, not clergy, altar room, cathedral corridor, worker crew, object-only press icon, rendered metal realism, cinematic concept-art render, over-rendered machinery, hyper-detail, or rivet-carpet noise.',
    'SP15-009':
      'A character-led 2D rain-kernel alleyglass card: one visible cyber courier protagonist moving through compressed street-corner glass, acid-green kernel glow near the chest or hand, magenta rain slabs, thick cable gutter lines, matte black pavement shape, and non-readable signal-panel color blocks. Must read as neon data-weather through protagonist plus alleyglass background, not empty corridor, object-only crystal, hacker workstation, worker crew, handheld phone demo, readable UI/signage, dense window grid, mirror-wet realism, cinematic key art, hyper-detail, or cable-lattice noise.',
    'SP15-010':
      'A character-led 2D meshlight night-market card: one visible mesh broker protagonist under a black tarp canopy, wearable node dots on jacket and hands, hanging mesh-node lights, thick antenna arcs, teal/hot-pink/black palette, warm steam as broad painted shape, and compact cybernetic background. Must read as network barter through protagonist plus canopy/cables, not food-stall postcard, generic market aisle, worker crew, object-only node display, phone demo, foreground stock vendor portrait, realistic bazaar, rendered wet realism, dense cable lattice, cinematic key art, hyper-detail, or neon speckle noise.',
    'SP15-011':
      'A character-led 2D pirate mesh relay card: one visible rooftop relay rogue protagonist bracing against wind while tuning a taped repeater box, improvised antenna silhouettes, battery crates as chunky rectangles, hazard orange signal arcs, night-blue sky, bare-aluminum accents, and clean gouache spacing. Must read as DIY rooftop network through protagonist plus relay background, not corporate tech, worker crew, laptop hero, readable screens, surveillance camera, realistic rooftop scene, photoreal rain, cinematic key art, hyper-detail, or cable-spiderweb noise.',
    'SP15-012':
      'A character-led 2D cooperative firewall bloom card: one visible cyberdefense bloom keeper protagonist holding or shaping an orange shield-bloom ring, jade/blue civic light blocks, simple shared terminal silhouettes behind them with no readable UI, and clean graphic-novel contours. Must read as collective protection through protagonist plus civic signal background, not abstract code, worker crew, dashboard wall, corporate operations center, office cubicles, phone demo, realistic room render, dense cable braid, cinematic key art, hyper-detail, or UI noise.',
    'SP15-013':
      'A character-led 2D black-ice courier card: one visible courier protagonist in strong diagonal motion, simplified coat shape, cyan ice shards, red security beam slabs, matte blue-black data lane, chrome only as flat gray accent, and shallow poster depth. Must read as hostile data weather through protagonist speed plus lane background, not empty corridor, realistic chase scene, weapon pose, generic RPG runner, worker crew, readable markings, mirror-wet realism, cinematic key art, hyper-detail, or dense shard noise.',
    'SP15-014':
      'A character-led 2D signal shrine substation card: one visible substation keeper protagonist with ceramic insulator staff or cable loop, coil-halo shapes, oxidized copper arcs, warning-yellow tokens without text, concrete gray planes, and electric-blue glow kept graphic. Must read as communication power through protagonist plus substation background, not fantasy shrine, altar room, worker crew, service-lamp hero, fence-grid overload, realistic utility yard, rendered metal, cinematic key art, hyper-detail, or cable noise.',
    'SP15-015':
      'A character-led 2D drone graffiti overpass card: one visible street-tech painter protagonist commanding tiny paint drones as tools, concrete overpass block behind them, broad abstract spray-color shapes with no readable letters, hacked traffic-light dots, toxic green/red accents, black night planes, and clean motion arcs. Must read as playful illegal street-tech through protagonist plus overpass background, not surveillance poster, worker crew, readable graffiti tags, camera-drone hero, bird-like drones, photoreal underpass, corridor tunnel, weapon pose, dense mist, cinematic key art, hyper-detail, or spray-noise clutter.',
    'SP15-016':
      'A character-led 2D neon clinic backdoor card: one visible humane body-mod medic protagonist at a glowing clinic threshold, seated patient only as secondary shape, teal/white/red color blocks, compact tool tray as flat shape, non-readable monitor glow, vinyl curtain as broad plane, and clean graphic-novel contours. Must read as careful med-cyberpunk through protagonist plus clinic background, not shock surgery, worker crew, gore, blood, exposed organs, syringe hero, fetish vinyl pose, horror corridor, readable medical UI, photoreal wet skin, cinematic key art, hyper-detail, or medical clutter.',
    'SP15-017':
      'A character-led 2D solar orchard commons card: one visible solar-canopy gardener protagonist repairing a shade-panel hinge, ladder silhouette, fruit-tree rows as broad organic masses, clay water jars, seed crates without logos, warm solar-gold canopy, sky-blue blocks, and dirt path. Must read as practical food-growing commons through protagonist plus orchard background, not generic green branding, worker crew, leaf-logo emblem, eco badge, luxury eco resort, endless greenhouse, generic glass city, empty landscape postcard, photoreal garden render, market aisle, cinematic key art, hyper-detail, or tiny leaf noise.',
    'SP15-018':
      'A character-led 2D sunstack civic atrium card: one visible sunstack systems rider protagonist on a service platform, public elevator shaft, water-reuse pipe loops, terrace greenery as secondary blocks, white ceramic planes, recycled aluminum accents, and warm sun-yellow slabs. Must read as dense practical urban systems through protagonist plus vertical infrastructure, not garden branding, worker crew, leaf-logo emblem, eco badge, orchard rows, greenhouse fantasy, mall atrium, hotel lobby, photoreal archviz, luxury render, cinematic key art, hyper-detail, or pipe clutter.',
    'SP15-019':
      'A character-led 2D riverbend repair card: one visible riverside fixer protagonist carrying a patched turbine wheel or bike rim, open tarp workshop by river, patched boat silhouette, tool bench as broad shape, canvas tan/rust/river-blue palette, and one non-readable patch motif. Must read as local repair commons through protagonist plus riverside background, not worker union propaganda, worker crew, readable union text, logo badge, work-lamp hero, crowded object pile, market aisle, photoreal river reflection, shiny utopia, cinematic key art, hyper-detail, or tool clutter.',
    'SP15-020':
      'A character-led 2D windcatcher tenement roofs card: one visible rooftop wind keeper protagonist leaning into a kite-turbine control rope, brick rooftop blocks, windcatcher towers, kite-turbine silhouettes, a few laundry cloth planes as wind rhythm, rope-tan arcs, chalk-white vanes, and wind-blue sky slabs. Must read as domestic engineered windpunk through protagonist plus roof background, not worker crew, fantasy sky city, bird swarm, clothesline clutter, generic rooftop party, photoreal cityscape, dense rope web, cinematic key art, hyper-detail, or rope noise.',
    'SP15-021':
      'A flat-to-painterly seed vault block party poster card: neighborhood seed archive table, drawer cabinet silhouette, seed packets as blank color rectangles, planters, two gardeners exchanging seeds, marigold/pink/brown palette, and simple music/celebration shapes. Must read as living archive, not farmers-market aisle. No readable packet labels, no posters/text, no product packaging, no sterile lab, no market stall row, no huge crowd clutter, no paper lantern fixation, no cinematic key art, no hyper-detail.',
    'SP15-022':
      'A flat-to-painterly desert bloom condenser poster card: desert water condenser towers, shade cloth canopy, two repair workers, copper pipe arcs, sparse bloom beds, dust-filter blocks, sand/cactus/white palette, and harsh sun as flat shape. Must read as climate-repair water logic, not oasis fantasy. No palm oasis, no fantasy desert city, no foreground goggle portrait, no survivalist weapon pose, no water-bead microdetail, no photoreal dust haze, no market tent, no cinematic key art, no hyper-detail.',
    'SP15-023':
      'A flat-to-painterly rain choir waterworks poster card: civic rainwater instrument system with gutter-harp arcs, plain blue ceramic channels, cistern blocks, two umbrella crew figures tuning valves, slate/rain-blue palette, and rain rhythm as broad diagonal marks. Must read as public water music, not rainy alley. Keep all clothing, walls, channels, and objects plain with no emblems. No water-drop logo, no wave icon, no badge symbol, no empty alley, no lamp/window fixation, no photoreal rain reflections, no umbrella crowd clutter, no musical stage, no readable signs, no cinematic key art, no hyper-detail.',
    'SP15-024':
      'A flat-to-painterly mangrove lift cooperative poster card: amphibious lift platform among mangrove root silhouettes, boardwalk workshop, two maintenance workers, small boat shape, weathered teal/brown palette, and brackish water as flat color. Must read as place-specific climate adaptation. Keep awnings, clothes, boats, and signs plain with no symbols. No anchor logo, no leaf icon, no badge emblem, no readable signage, no generic green architecture, no jungle fantasy, no photoreal water reflection, no deck-lamp hero, no root spaghetti clutter, no tourist resort boardwalk, no cinematic key art, no hyper-detail.',
    'SP15-025':
      'A flat-to-painterly mycelial transit spine poster card: public transit stop grown from broad mycelial ribs, commuter silhouettes, amber route-vein glow as non-readable lines, cap awning shapes, and maintenance basket forms. Must read as fungal public infrastructure, not isolated mushrooms. No subway corridor, no readable transit map/text, no horror fungus infection, no body horror, no slimy membrane microdetail, no photoreal dampness, no empty platform, no cinematic key art, no hyper-detail.',
    'SP15-026':
      'A flat-to-painterly symbiont market canopy poster card: living canopy market with two vendors trading stylized symbiont tools, seed pods as simple shapes, wearable graft displays as non-anatomical crafted objects, orchid/green/amber palette, and social barter gesture. Must read as biotech trade, not gore. No exposed organs, no blood, no surgery table, no severed limbs, no fetish body display, no generic market aisle, no readable labels, no wet skin realism, no cinematic key art, no hyper-detail.',
    'SP15-027':
      'A flat graphic digital-illustration nerve loom clinic card, closer to cel poster plus comic editorial art than concept art: one simplified caregiver silhouette, one seated patient with plain clothing and no tattoo focus, a loom-like prosthetic-sensation device, 4-5 broad nerve-fiber arcs, prosthetic hand as a simple crafted object, teal/pink/graphite matte color blocks, and one flat non-readable monitor glow. Use thick clean contours, cel-shaded shape design, broad brush planes, low detail, denoised matte surfaces, and shallow poster depth. Must read as careful bodypunk care, not gore. No anime glamour portrait, no detailed tattoos, no surgery, no blood, no exposed tissue, no severed hand, no fetish medical pose, no thread-web clutter, no readable medical UI, no photoreal skin, no realistic render, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-028':
      'A flat graphic digital-illustration spore signal plaza card, closer to cel poster plus comic editorial art than concept art: three mushroom-signal tower silhouettes, one broad violet cloud shape with plain dotted fungal pattern only, two simplified masked operators as small readable figures, circular stone planters as simple rings, and night-green/stone/amber color blocks. Use thick clean contours, cel-shaded shape design, broad brush planes, low detail, denoised matte surfaces, and shallow poster depth. Must read as communal signal weather, not magic ritual. No letter-like glyphs, no readable marks, no bird flock, no lantern fixation, no corridor spectacle, no horror spores, no gas-mask soldier, no dense particle noise, no realistic render, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-029':
      'A flat graphic digital-illustration living bridge district card, closer to cel poster plus comic editorial art than concept art: one simple side-view civic bridge grown from 3-4 broad living rib arches and a few root-cable arcs, tiny simplified pedestrians crossing, two simple maintenance pod shapes, bone-ivory/root-brown/leaf-green matte palette, and dusk blue background planes. Use thick clean contours, cel-shaded shape design, broad brush planes, low detail, denoised matte surfaces, and shallow poster depth. Must read as civic bioarchitecture, not fantasy palace or realistic environment concept art. No deep cinematic vista, no palace bridge, no empty monumental architecture, no rib-cage horror, no wet organic gore, no photoreal bark texture, no dense root spaghetti, no realistic render, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-030':
      'A flat graphic digital-illustration gene-hack apothecary card, closer to cel poster plus comic editorial art than concept art: one simplified patched lab-coat figure at a small counter, coded plants as large patterned leaf shapes, hand-built incubator blocks, a few blank vial rectangles, acid green/amber/cream matte color blocks, and bench glow as one flat shape. Use thick clean contours, cel-shaded shape design, broad brush planes, low detail, denoised matte surfaces, and shallow poster depth. Must read as crafty botanical biopunk. No detailed shop interior, no readable labels, no text on vials, no sterile mega-lab, no random object still life, no syringe hero, no drug-store shelf, no work-lamp fixation, no photoreal glass clutter, no realistic render, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-031':
      'A flat graphic digital-illustration flesh circuit conservatory card, closer to cel poster plus comic editorial art than concept art: one greenhouse cross-section with broad glasshouse rib arcs, red organic circuit-vein panels as abstract patterned walls, two small careful worker figures, gold trace lines as simple circuit paths, ivory/black-green/crimson matte blocks, and lush plant silhouettes. Use thick clean contours, cel-shaded shape design, broad brush planes, low detail, denoised matte surfaces, and shallow poster depth. Must read as elegant unsettling biotech conservatory, not gore. No exposed organs, no bloody membrane, no fleshy body parts, no wet horror wall, no erotic body-horror pose, no realistic greenhouse render, no glasshouse archviz, no corridor, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-032':
      'A flat graphic digital-illustration chloroplast housing stack card, closer to cel poster plus comic editorial art than concept art: dense vertical apartment block with chunky chloroplast panel tiles, algae-window color blocks, simple balconies, two resident-maintenance silhouettes, a few pipe loops, laundry as plain color rectangles, algae green/concrete cream/sun yellow/shadow teal matte palette. Use thick clean contours, cel-shaded shape design, broad brush planes, low detail, denoised matte surfaces, and shallow poster depth. Must read as lived-in bio-urban housing, not solarpunk branding or luxury eco archviz. No leaf-logo emblem, no eco badge, no generic glass utopia, no greenhouse tower, no resort balcony render, no market aisle, no photoreal facade, no dense pipe spaghetti, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-033':
      'A flat graphic digital-illustration coral circuit marina card, closer to cel poster plus comic editorial art than concept art: compact working marina with coral-circuit pylons, two simplified diver/technician figures, neon buoys as simple dots, wet boardwalk as flat dark shape, circuit-reef arcs below waterline, coral pink/aqua/black water/pearl white matte palette. Use thick clean contours, cel-shaded shape design, broad brush planes, low detail, denoised matte surfaces, and shallow poster depth. Must read as functional seapunk marina, not mermaid fantasy. No mermaid, no tropical resort, no empty ocean postcard, no cyberpunk nightclub pier, no photoreal wet reflections, no readable buoy labels, no anchor/leaf/wave logos, no dense rope clutter, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-034':
      'A flat graphic digital-illustration tideglass subway card, closer to cel poster plus comic editorial art than concept art: cropped public transit platform with one thick curved tideglass water window, two commuter silhouettes, reef-lit track strip as flat aqua glow, safety-orange pressure door blocks, wet tile as broad sea-green planes, and train hint as simple dark shape. Use thick clean contours, cel-shaded shape design, broad brush planes, low detail, denoised matte surfaces, and shallow poster depth. Must read as aquatic public transit, not empty tunnel concept art. No long subway corridor, no vanishing tunnel, no empty platform, no horror aquarium, no underwater city vista, no photoreal glass/water caustics, no readable station signage, no UI map, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-035':
      'A flat graphic digital-illustration kelp arcade boardwalk card, closer to cel poster plus comic editorial art than concept art: short coastal boardwalk corner with two simplified players, three chunky arcade cabinet silhouettes, kelp cables as broad green arcs, neon fish shapes as abstract lights only, salt-white planks, arcade pink/ocean blue matte blocks, and wet boardwalk as one flat dark shape. Use thick clean contours, cel-shaded shape design, broad brush planes, low detail, denoised matte surfaces, and shallow poster depth. Must read as playful seapunk arcade, not cabinet still life. No readable screen UI, no game title text, no logos, no mascot poster, no object-only arcade cabinet, no long boardwalk corridor, no market pier, no photoreal wet reflections, no dense cable/kelp spaghetti, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-036':
      'A flat graphic digital-illustration shell metro pier card, closer to cel poster plus comic editorial art than concept art: civic ferry-pier entrance with shell-like canopy panels, simple ticket-gate blocks with no signs, small ferry crowd silhouettes, two tidal service machines, wet pier geometry as flat teal/black planes, shell ivory/rust orange matte palette. Use thick clean contours, cel-shaded shape design, broad brush planes, low detail, denoised matte surfaces, and shallow poster depth. Must read as seapunk public transport, not shell palace. No fantasy palace shells, no mall terminal, no cathedral station hall, no long pier corridor, no readable signage, no logo badges, no luxury resort dock, no photoreal wet concrete, no overcrowded crowd texture, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-037':
      'A flat graphic digital-illustration icebreaker lantern town card, closer to cel poster plus comic editorial art than concept art: compact frozen harbor town with one plain blocky icebreaker boat silhouette, lantern clusters as simple warm dots, two insulated crew figures in plain coats, one sled-machine shape, frozen dock slabs, ice blue/lantern amber/navy/rusted red matte palette. Use thick clean contours, cel-shaded shape design, broad brush planes, low detail, denoised matte surfaces, and shallow poster depth. Must read as working icepunk harbor community, not empty glacier postcard. No snowflake emblem, no heraldic badge, no faction symbol, no flag logo, no banner symbol, no readable marks, no empty glacier, no polar explorer portrait, no cozy cabin postcard, no lighthouse hero, no fantasy winter village, no aurora-photo spectacle, no lantern-only still life, no photoreal snow haze, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-038':
      'A flat graphic digital-illustration glacier server monastery card, closer to cel poster plus comic editorial art than concept art: cropped interior data-refuge alcove cut into ice, two broad visible plain server-rack faces as dark vented rectangles, frost vents as simple white arcs, one technician in plain robe/coat maintaining a rack, three black cable braids only, angular ice wall planes, cobalt/glacier white/silver matte palette, and one tiny amber human light. Use thick clean contours, cel-shaded shape design, broad brush planes, low detail, denoised matte surfaces, and shallow poster depth. Must read as cold server refuge maintained by people, not exterior bunker or religious cathedral. No exterior ice doorway, no cargo doors, no empty bunker entrance, no crane/oil platform, no snowflake emblem, no heraldic badge, no faction symbol, no server logo, no robe insignia, no readable marks, no literal altar, no cross or religious icon, no cathedral corridor, no hooded monk portrait, no blue server hallway, no UI panels, no readable screens, no cable spaghetti, no photoreal ice cave, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-039':
      'A flat graphic digital-illustration salt flats kite foundry card, closer to cel poster plus comic editorial art than concept art: bright salt-flat worksite with two kite-turbine triangles in the sky, one low mineral cart, two sun-armored worker silhouettes, mirrored salt pans as flat white/blue rectangles, rust frame blocks, long simple horizon line, and hard black kite shadows. Use thick clean contours, cel-shaded shape design, broad brush planes, low detail, denoised matte surfaces, and shallow poster depth. Must read as salt-and-wind terrain industry, not desert postcard. No desert oasis, no generic solar farm, no empty salt landscape, no foreground goggle portrait, no kite festival, no fantasy desert city, no windmill farm wallpaper, no photoreal glare/heat shimmer, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-040':
      'A flat graphic digital-illustration swamp radio stiltworks card, closer to cel poster plus comic editorial art than concept art: compact swamp stilt repair platform with one plain radio mast, two boat-repair operators, one half-repaired skiff, moss drape as broad green shapes, three lantern dots as support only, muddy water as flat brown/green plane, and radio-black wire arcs kept sparse. Use thick clean contours, cel-shaded shape design, broad brush planes, low detail, denoised matte surfaces, and shallow poster depth. Must read as local swamppunk signal survival, not fantasy swamp. No fantasy swamp corridor, no horror bayou monster, no lantern hero, no witch hut, no dense vine/moss curtain, no long dock corridor, no readable radio signage, no logo badges, no photoreal mud/water, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-041':
      'A flat graphic digital-illustration zine wall safehouse card, closer to cel poster plus comic editorial art than concept art: cropped safehouse work wall with handmade zine sheets shown as blank graphic blocks, two jacketed organizers, paste bucket shapes, distro crates, tape strips, red ink blocks, paper-cream/photocopy-black palette, and rough cut-paper texture. Use thick clean contours, cel-shaded shape design, broad brush planes, low detail, denoised matte surfaces, and shallow poster depth. Must read as DIY print culture and safehouse organizing, not readable poster collage. No readable text, no slogans, no letters, no newspaper clippings with words, no brand stickers, no blade/knife hero, no conspiracy board, no office desk, no library/market aisle, no wall-only empty collage, no photoreal paper clutter, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-042':
      'A flat graphic digital-illustration skatepark generator crew card, closer to cel poster plus comic editorial art than concept art: concrete skatepark corner with two skater crew silhouettes wiring a chunky generator rig, one ramp curve, three broad cable trails, battery green glow blocks, sticker clusters as blank color shapes only, sunset orange sky plane, and concrete gray matte fields. Use thick clean contours, cel-shaded shape design, broad brush planes, low detail, denoised matte surfaces, and shallow poster depth. Must read as skatepunk DIY power crew, not product shot. No readable stickers, no brand logos, no skateboard-only still life, no sterile generator render, no underpass corridor, no skate trick poster, no weapon pose, no photoreal dust/haze, no dense cable nest, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-043':
      'A flat graphic digital-illustration basement synth barricade card, closer to cel poster plus comic editorial art than concept art: cramped low-ceiling basement show with two performer silhouettes at blocky synth rigs, patched amp blocks, a small crowd silhouette band, plywood barricade furniture shapes, magenta/electric-blue light slabs, and only a few thick cable trails. Use thick clean contours, cel-shaded shape design, broad brush planes, low detail, denoised matte surfaces, and shallow poster depth. Must read as musical riot synthpunk, not waveform abstraction. No readable band posters, no stage signage, no logo stickers, no nightclub glamour, no empty instrument still life, no weapon barricade, no police riot scene, no long basement corridor, no dense cable nest, no photoreal smoke, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-044':
      'A flat graphic digital-illustration scrapbike courier yard card, closer to cel poster plus comic editorial art than concept art: practical courier repair yard with two scrapbike silhouettes, welded cargo racks, one mechanic/courier crew figure, a blank route-map board as abstract color planes, chain arcs, rust orange/tire black/courier yellow matte blocks, and one flat welding glow. Use thick clean contours, cel-shaded shape design, broad brush planes, low detail, denoised matte surfaces, and shallow poster depth. Must read as junkpunk city logistics, not trash sculpture. No readable maps, no text labels, no brand logos, no motorcycle pinup, no weapon biker gang, no random junk pile, no alley corridor, no photoreal welding sparks, no dense chain clutter, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-045':
      'A flat graphic digital-illustration sticker bomb signal booth card, closer to cel poster plus comic editorial art than concept art: tiny urban signal booth with blank sticker-color layers as plain rectangles/circles only, two teen operator silhouettes, simple switch-panel blocks with no marks, cyan screen glow as flat rectangle, black cable arcs kept sparse, hazard yellow/red/cyan matte palette, and plywood booth geometry. Use thick clean contours, cel-shaded shape design, broad brush planes, low detail, denoised matte surfaces, and shallow poster depth. Must read as street-media signal booth, not sticker wallpaper. No lightning bolt emblem, no warning icon, no logo-like sticker, no readable stickers, no letters, no tags, no brand logos, no surveillance camera hero, no phone prop focus, no screen UI, no corridor booth, no dense cable knots, no photoreal sticker gloss, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-046':
      'A flat graphic digital-illustration warehouse rave clinic card, closer to cel poster plus comic editorial art than concept art: warehouse mutual-care corner with one care table, two helper/dancer silhouettes in plain clothes, hydration rig blocks, foil blanket shape, soft clinic lamp circles, laser green/violet light bands, concrete column planes, and exit-red accent as blank block. Use thick clean contours, cel-shaded shape design, broad brush planes, low detail, denoised matte surfaces, and shallow poster depth. Must read as humane ravepunk care, not abstract neon haze. No skull patch, no cross emblem, no medical logo, no jacket symbol, no readable marks, no medical emergency gore, no syringe hero, no fetish clinic pose, no nightclub glamour crowd, no drug-use scene, no empty laser tunnel, no readable exit sign/text, no warehouse corridor, no photoreal smoke/laser haze, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-047':
      'A stylized 2D digital-illustration crustpunk council card, closer to clean graphic novel poster art and controlled digital painting than realism: cropped circular table with three simplified punk crew silhouettes, patched jackets as broad black/denim shapes, boot arcs, hand-gesture shapes, blank map-paper blocks, rust-red/bone-white accent patches, and rough cut-paper edges. Use thick clean contours, cel-poster shading, broad matte brush planes, low-to-moderate detail, denoised surfaces, and shallow poster depth. Must read as patched-jacket crew politics, not fashion catalog or realistic basement photo. No readable patch symbols, no logos, no text, no portrait close-up, no realistic faces/tattoos/hair detail, no dog focus, no skull/emblem hero, no weapon pose, no cluttered room, no lamp/chair/studio setup, no photoreal leather/denim, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-048':
      'A stylized 2D digital-illustration mutual-aid street kitchen card, closer to clean graphic novel poster art and controlled digital painting than realism: compact sidewalk food-print station with two volunteer silhouettes, one chunky hacked printer as simple block machine, tomato-red steam ribbons, cardboard crate rectangles, serving table slabs, warm queue shapes, and cracked pavement as broad graphic planes. Use thick clean contours, cel-poster shading, broad matte brush planes, low-to-moderate detail, denoised surfaces, and shallow poster depth. Must read as commons-punk feeding people, not market aisle, restaurant scene, or utopian icon. No flag, no banner, no protest placard, no fist symbol, no spoon symbol, no emblem, no badge, no readable labels, no logos, no grocery aisle, no cafeteria corridor, no realistic stainless-steel render, no detailed food close-up, no worker portrait, no camera prop, no photoreal steam, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-049':
      'A stylized 2D digital-illustration cathode pool reverie card, closer to clean vapor graphic novel poster art and controlled digital painting than realism: cropped tiled pool corner with two simplified loungers/swimmer silhouettes, CRT glow reflections as flat aqua/magenta rectangles, chrome rail arc, cream tile grid kept sparse, violet shadow pool shape, and soft signal haze as clean color bands. Use thick clean contours, cel-poster shading, broad matte brush planes, low-to-moderate detail, denoised surfaces, and shallow poster depth. Must read as vaporpunk pool and cathode glow, not realistic indoor pool photo or empty gradient abstraction. No hotel spa realism, no long tile corridor, no mall aisle, no readable screen UI, no screen text, no logo, no camera equipment, no realistic wet skin, no photoreal water caustics, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-050':
      'A stylized 2D digital-illustration gradient arcade mirage card, closer to clean vaporwave poster art and controlled digital painting than realism: cropped arcade corner with two simplified player silhouettes, three chunky cabinet shapes with blank glowing screens, checker-floor blocks kept broad, peach/cyan/violet sunset grid as abstract backdrop, cabinet glow slabs, and pastel bloom contained as flat color fields. Use thick clean contours, cel-poster shading, broad matte brush planes, low-to-moderate detail, denoised surfaces, and shallow poster depth. Must read as vaporwave arcade culture, not concept-art mall corridor or object-only cabinets. No readable game UI, no title screens, no logos, no mascot posters, no endless cabinet aisle, no market/mall corridor, no realistic glossy arcade plastic, no photoreal reflections, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-051':
      'A stylized 2D digital-illustration cassette weather station card, closer to clean graphic novel poster art and controlled digital painting than realism: compact analog weather console built from two chunky cassette-deck blocks, three broad dial circles, orange magnetic-tape wind ribbons, one field-operator silhouette in a simple coat, sky-blue pressure-map shapes as unreadable color planes, beige plastic slabs, and a small antenna arc. Use thick clean contours, cel-poster shading, broad matte brush planes, low-to-moderate detail, denoised surfaces, and shallow poster depth. Must read as cassette-futurist weather work, not product still life or office desk. No readable map text, no letters, no logo labels, no desk-lamp hero, no office/control-room wall, no realistic equipment render, no tiny dial carpets, no photoreal plastic, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-052':
      'A stylized 2D digital-illustration pirate TV atrium card, closer to clean broadcast-punk poster art and controlled digital painting than realism: public atrium corner with stacked blank CRT screens as glowing rectangles, two pirate-TV crew silhouettes tuning a broadcast cart, one compact cable coil, crowd silhouettes as broad blocks, red tally-light dots, broadcast-blue/concrete-gray planes, simple antenna arcs, and no readable screens. Use thick clean contours, cel-poster shading, broad matte brush planes, low-to-moderate detail, denoised surfaces, and shallow poster depth. Must read as pirate public broadcast through monitors and signal gear, not camera equipment. No visible camera, no tripod, no softbox, no light umbrella, no pirate flag, no skull, no crossbones, no banner, no emblem, no logo-like symbol, no smartphone, no readable UI/text, no news logo, no surveillance-camera hero, no mall corridor, no folding-chair clutter, no cable spaghetti, no photoreal TV glass, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-053':
      'A stylized 2D digital-illustration CRT prayer booth card, closer to clean analog-ritual graphic novel poster art and controlled digital painting than realism: tight booth fragment with one shadowed human silhouette, folded-hands gesture as simple shapes, CRT halo glow as phosphor-green rectangle/circle, two candle blocks as tiny warm accents, cable loops as sparse halo arcs, worn vinyl black planes, and static as broad white bands only. Use thick clean contours, cel-poster shading, broad matte brush planes, low-to-moderate detail, denoised surfaces, and shallow poster depth. Must read as media ritual, not church/fantasy shrine or horror room. No cross, no religious icon, no readable symbols, no sigils, no altar, no skull, no chapel corridor, no candle shrine fixation, no portrait realism, no photoreal wax/glass, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-054':
      'A stylized 2D digital-illustration glitch bazaar kiosk card, closer to clean glitch-punk poster art and controlled digital painting than realism: single compact street kiosk icon with two vendor silhouettes, three blank broken display panels only, warped product shapes as abstract color blocks, RGB split edge shadows, black tarp rectangle, wet-street reflection as one flat dark plane, and scanline ghosts as broad bands. Use thick clean contours, cel-poster shading, broad matte brush planes, low-to-moderate detail, denoised surfaces, and shallow poster depth. Must read as one glitched kiosk, not market aisle, screen wall, or abstract glitch texture. No screen-wall, no many monitors, no detailed UI panels, no readable product labels, no logos, no UI screens, no bazaar corridor, no endless stalls, no grocery/market aisle, no mascot poster, no camera prop, no photoreal wet street, no RGB noise storm, no painterly realism, no cinematic key art, no hyper-detail.',
    'SP15-055':
      'A flat graphic mallsoft illustration card, closer to gouache poster art, cel-poster shapes, and controlled digital painting than realism: compact mall fountain basin cropped short, two simplified teen crew silhouettes, cyan fiber cables arcing into the water, coin circles as simple dots, pastel storefront glow as blank color blocks, fountain-blue reflection plane, beige tile blocks, and a few plastic plant shapes only. Use thick clean contours, matte color slabs, broad brush planes, low detail, denoised surfaces, and shallow poster depth. Must read as nostalgic mall fountain network ritual, not semi-real anime concept art, mall corridor, or shopping aisle. No detailed streetwear patches, readable storefront signs, brand logos, long mall hallway, escalator/atrium depth hero, retail aisle, coin clutter carpet, realistic water caustics, luxury mall render, empty fountain postcard, painterly realism, cinematic key art, or hyper-detail.',
    'SP15-056':
      'A flat graphic static tape observatory illustration card, closer to analog sci-fi poster art, gouache-cel shapes, and controlled digital painting than realism: compact rooftop signal deck with two large tape reel circles, one simple dish silhouette, one small technician silhouette in wind, one blank CRT glow rectangle with no marks, moon-white rim shape, tape-brown wind ribbons, midnight-blue sky slab, and sparse red LED dots. Use thick clean contours, matte color slabs, broad brush planes, low detail, denoised surfaces, and shallow poster depth. Must read as analog cosmic listening, not realistic rooftop equipment render, semi-real anime concept art, or random screens. No screen text, fake interface lines, satellite-photoreal dish, telescope observatory dome, starfield wallpaper, control-room wall, UI screens, readable scope marks, tiny LED carpets, cable spaghetti, photoreal metal/glass, painterly realism, cinematic key art, or hyper-detail.',
    'SP15-057':
      'A flat graphic neon witch switchyard illustration card, closer to occult-punk poster art, gouache-cel shapes, and controlled digital painting than realism: one rubber-gloved witch-technician protagonist in medium crop commanding a compact electrical switchyard, chunky transformer blocks behind, thick copper cable arcs, one plain neon violet oval glow with no markings, hot-pink coil glow, and storm cloud slab. Use thick clean contours, matte color slabs, broad brush planes, low detail, denoised surfaces, and shallow poster depth. Must read as witchpunk infrastructure ritual through protagonist plus switchyard, not semi-real anime concept art, anonymous worker crew, object-only transformer poster, or fantasy witch corridor. No foreground cloaked figure, pendant, pouch, costume detail, broom, pointed hat cliche, pentagram, magic-circle glyphs, readable sigils, religious symbols, wizard pose, fantasy chapel, transformer realism, dense power-grid maze, painterly realism, cinematic key art, or hyper-detail.',
    'SP15-058':
      'A flat graphic tarot circuit foundry illustration card, closer to industrial-occult poster art, gouache-cel shapes, and controlled digital painting than realism: compact foundry press as the hero, two small plain worker silhouettes with no marks on clothing, three blank tarot-plate rectangles, molten gold circuit traces as broad non-readable lines, black iron press slabs, card-cream geometry, ember-red glow blocks, and copper plate edges. Use thick clean contours, matte color slabs, broad brush planes, low detail, denoised surfaces, and shallow poster depth. Must read as tarot-tech casting and machinery, not readable tarot deck, masked foreground portrait, or fantasy altar. No foreground masked hero, robe symbols, worker emblems, wall plaques with glyphs, readable card names, letters, zodiac signs, pentagram, cross, skull emblem, fortune-teller table, altar, cathedral/foundry corridor, photoreal molten metal, tiny circuit filigree, painterly realism, cinematic key art, or hyper-detail.',
    'SP15-059':
      'A flat graphic goth relay chapel illustration card, closer to gothic communications poster art, gouache-cel shapes, and controlled digital painting than realism: compact relay switchboard and radio mast as the hero, two small plain operator silhouettes, black cable arches like lace made from broad shapes, red indicator dots, cold white moon cuts, tarnished metal blocks, and oxblood shadow planes. Use thick clean contours, matte color slabs, broad brush planes, low detail, denoised surfaces, and shallow poster depth. Must read as gothpunk communications, not cathedral interior, religious shrine, or semi-real concept art. No cross, religious icon, skull emblem, altar, chapel corridor, stained-glass text, readable symbols, lace microdetail, black-on-black costume portrait, foreground goth pinup, photoreal stone, painterly realism, cinematic key art, or hyper-detail.',
    'SP15-060':
      'A flat graphic bone lime signal cairn illustration card, closer to austere field-signal poster art, gouache-cel shapes, and controlled digital painting than realism: bone-like resin horn array and cairn stack as the hero, two small field technician silhouettes with plain clothes, lime signal plates as blank color shapes, rawhide straps as broad bands, storm gray sky slab, and simple cold glow. Use thick clean contours, matte color slabs, broad brush planes, low detail, denoised surfaces, and shallow poster depth. Must read as bonepunk engineering without gore, not skull shrine, fantasy cairn, or landscape postcard. No flags, banners, crescent marks, circular emblems, clothing symbols, real bones, skulls, gore, teeth, animal carcass, readable glyphs, tribal emblem, religious altar, runic text, giant horn monster, fantasy cave, empty hill panorama, tiny lamp carpets, painterly realism, cinematic key art, or hyper-detail.',
    'SP15-061':
      'A curated 2D x-punk style-card for necrophone repair punk: one distinctive necrotech repairer protagonist at medium crop, listening into or tuning an oversized black bakelite receiver, with phosphor ghost-audio wave lines as broad non-readable curves, copper coils, ivory panels, warm wood blocks, and a compact repair-shop world fragment behind them. The character must carry the card through pose, face/hood silhouette, hand gesture, and audio-craft attitude; phone machinery supports them, never replaces them. Use matte slabs, thick clean contours, folk-modernist repair geometry, low detail, denoised surfaces, and shallow poster depth. Must read as necrotech repair craft and absent voices, not object-only phone poster, technician crew, horror monster shop, cluttered studio, or lamp-lit realism. No centered full-body adventurer, worker crew, propaganda pose, generic RPG hero, crescent marks, wall emblems, clothing symbols, religious shapes, skull, ghost face, monster, gore, seance table, readable phone labels, shop signs, wall of tiny tools, bench-lamp hero, cluttered repair desk, haunted room corridor, photoreal dust, painterly realism, cinematic key art, or hyper-detail.',
    'SP15-062':
      'A curated 2D x-punk style-card for shrine-engine mythpunk: one distinctive shrine-engine keeper or courier protagonist guiding a moving engine cart, with cable garlands as broad arcs, blank cloth color strips with no symbols, brass engine glow, saffron and turquoise street dusk planes, and sparse public silhouettes far behind only for scale. The character must feel ceremonial, mechanical, and street-level through stance, garment silhouette, hand on cable/handle, and calm authority; shrine engine supports them, never becomes the only subject. Use matte color slabs, thick clean contours, folk-modernist procession rhythm, low detail, denoised surfaces, and shallow poster depth. Must read as ceremonial mechanical commons, not object-only engine poster, worker parade, revolution poster, religious idol, temple parade, or fantasy street concept art. No centered full-body adventurer, mechanic crew, crowd rally, propaganda march, crescent marks, clothing symbols, flags, banners, cross, deity statue, altar, readable banner text, flag emblem, faction logo, holy icon, skull, crowded parade texture, market street, fantasy temple corridor, lantern carpet, photoreal brass, painterly realism, cinematic key art, or hyper-detail.',
    'SP15-063':
      'A curated 2D x-punk style-card for vampire data salon punk: one distinctive nocturnal data-salon protagonist in elegant punk silhouette, half-lit by red data-glass planes while operating an antique terminal table with blank screens, moonlit window cuts, chrome nail-like hardware shapes, and dark wood color slabs. The character must carry decadent gothic cyberstyle through posture, face shadow, hand gesture, and wardrobe shape; terminal furniture supports them, never replaces them. Use matte fields, thick clean contours, decadent gothic poster balance, low detail, denoised surfaces, and shallow poster depth. Must read as vampire cyberstyle data society, not object-only terminal poster, pale hacker group, bite scene, gothic bedroom, glamour pinup, or UI concept art. No foreground glamour portrait, centered full-body adventurer, blood, fangs, bite marks, wounds, gore, skull, coffin, bat swarm, readable screen UI, terminal text, logo, salon chair/lamp fixation, photoreal skin, painterly realism, cinematic key art, or hyper-detail.',
    'SP15-064':
      'A curated 2D x-punk style-card for folk-horror infrastructure punk: one distinctive rural signal-keeper protagonist standing near or beneath a transformer pole, with ceramic insulators, straw warning bundles as broad shapes, blank ribbon strips, dusk field silhouettes, orange hum glow, and tense farmland geometry. The character must carry folk-horror infrastructure through posture, coat/hood silhouette, guarded hand gesture, and uneasy relation to the transformer; pole and ribbons support them, never become an object-only omen poster. Use matte color fields, thick clean contours, rural poster unease, low detail, denoised surfaces, and shallow poster depth. Must read as folk horror through person plus infrastructure and place, not technician crew, scarecrow monster, ritual sacrifice, revolution poster, or forest hallway. No centered full-body adventurer, straw-mask portrait, scarecrow body, hanging figure, blood, gore, cult symbols, readable warning text, ribbon glyphs, religious icon, lantern carpet, birds as motif, fantasy forest, photoreal mud, painterly realism, cinematic key art, or hyper-detail.',
    'SP15-065':
      'A flat graphic neon isotope plaza illustration card, closer to international atompunk civic poster art, gouache-cel shapes, and controlled digital painting than realism: one older isotope-plaza gardener or fountain keeper in side-profile medium crop, hand hovering inside uranium-green fountain glow, face partly shadowed, with isotope orbits as blank geometric rings, chrome curves as broad shapes, terrazzo blocks, coral red accents, and cream sky planes. Use thick clean contours, matte color fields, broad brush planes, low detail, denoised surfaces, and shallow poster depth. Must read as atompunk public life through an unusual person plus plaza, not beauty portrait, handheld radio pose, object-only fountain poster, mall atrium, science diagram, worker propaganda, 1950s American ad model, or signage poster. No pin-up smile, fashion model stance, crowd as main subject, readable signs, radiation trefoil, hazard logo, flag emblem, brand logo, UI, numbers, text, luxury mall, photoreal chrome, glossy archviz, empty plaza postcard, painterly realism, cinematic key art, or hyper-detail.',
    'SP15-066':
      'A flat graphic reactor promenade illustration card, closer to eerie public atomic leisure poster art, gouache-cel shapes, and controlled digital painting than realism: one bulky reactor tourist or maintenance visitor seen from back three-quarter, wearing a simplified translucent poncho and heavy gloves, one hand on observation glass, face mostly hidden by coolant-blue reflection, with reactor window bands, enamel panel blocks, safety-yellow blank stripes, black rubber shapes, and polished concrete matte slabs. Use thick clean contours, matte color fields, broad brush planes, low detail, denoised surfaces, and shallow poster depth. Must read as uncanny reactor promenade through body language plus infrastructure, not slick operator portrait, object-only reactor poster, worker crowd, control-room UI, power plant diagram, 1950s American sci-fi pin-up, or 3D hard-surface render. No handheld device hero, beauty pose, crowd as main subject, readable warning text, radiation trefoil, hazard logo, control panels, cockpit UI, numbered labels, flag emblem, brand logo, gas-mask soldier, photoreal glass, PBR metal, glossy archviz, painterly realism, cinematic key art, or hyper-detail.',
    'SP15-067':
      'A flat graphic orbit diner strip illustration card, closer to ray-age roadside poster art, gouache-cel shapes, and controlled digital painting than realism: one tired roadside mechanic-courier seated in profile at a chrome counter curve, jacket block and gloved hands doing the acting, with compact space-age diner facade behind, one rocket-car silhouette outside, blank orbit sign shapes with no letters, star-blue dusk plane, cherry red accents, and asphalt matte slab. Use thick clean contours, matte color fields, broad brush planes, low detail, denoised surfaces, and shallow poster depth. Must read as ray-age roadside culture through a specific diner-world character, not waitress pin-up, object-only facade, car render, restaurant photo, mall food court, worker service poster, or 1950s American advertisement. No handheld radio pose, beauty portrait, crowd as main subject, readable signs, diner logo, brand logo, letters, numbers, menu boards, license plates, photoreal chrome, glossy car ad, empty car render, luxury mall, market aisle, painterly realism, cinematic key art, or hyper-detail.',
    'SP15-068':
      'A flat graphic rocket chapel outpost illustration card, closer to raypunk frontier poster art, gouache-cel shapes, and controlled digital painting than realism: one weathered outpost keeper in small three-quarter crop under oversized rocket fins, wrapped in a plain desert poncho with a signal cord gesture, small desert outpost behind, antenna masts as simple arcs with no cross shape, dust planes, teal shadows, desert red slabs, and sparse star dots. Use thick clean contours, matte color fields, broad brush planes, low detail, denoised surfaces, and shallow poster depth. Must read as lonely human-scale raypunk frontier through person plus outpost, not heroic pilot portrait, object-only rocket fins, religious chapel, spaceship concept art, worker settler poster, 1950s American pulp hero, or cockpit scene. No handheld radio hero, beauty pose, cross antenna, religious icon, altar, chapel interior, readable insignia, rocket logo, cockpit glow/UI, starfield wallpaper, heroic spaceship poster, raygun, weapon hero, photoreal rocket metal, dusty realism, painterly realism, cinematic key art, or hyper-detail.',
    'SP15-069':
      'A flat graphic comet salvage yard illustration card, closer to space salvage punk poster art, gouache-cel shapes, and controlled digital painting than realism: one tethered salvage captain shown as a cropped helmet/shoulder silhouette and large gloved hands fastening a cable to a comet ice chunk, old satellite panels behind, thick cable arcs, broad welding glow, dull aluminum slabs, hazard orange blocks with no symbols, and sparse cold star dots. Use thick clean contours, matte color fields, broad brush planes, low detail, denoised surfaces, and shallow poster depth. Must read as risky orbital salvage through figure-device pairing, not clean astronaut pin-up, worker crew, object-only debris poster, heroic ship poster, battle debris, or 3D space render. No face-forward space hero, handheld gun/tool glamour, spaceship hero, crew lineup, cockpit UI, weapon, explosion, readable satellite labels, NASA-like logo, hazard symbols, dense cable spaghetti, starfield wallpaper, photoreal metal, PBR panels, tiny debris field, painterly realism, cinematic key art, or hyper-detail.',
    'SP15-070':
      'A flat graphic plasma rail commons illustration card, closer to raypunk public transit poster art, gouache-cel shapes, and controlled digital painting than realism: one older transit guardian in side-view crop bracing against a plasma rail arc, coat and hand silhouette cutting across ray arches, station platform block shapes, plasma-blue glow bands, cream tile slabs, and orange motion lines. Use thick clean contours, matte color fields, broad brush planes, low detail, denoised surfaces, and shallow poster depth. Must read as public utility transit through a specific guardian plus infrastructure, not heroic commuter pin-up, object-only rail arc, subway corridor, commuter crowd poster, spaceship interior, or UI concept art. No handheld radio, beauty pose, long tunnel/corridor, readable station signs, route maps, UI panels, train logo, warning labels, numbers, cockpit, weapon, photoreal glass/steel, PBR metal, dense crowd texture, market aisle, painterly realism, cinematic key art, or hyper-detail.',
    'SP15-071':
      'A non-photographic stylized illustrated digital-painting character card, closer to clean lunarpunk editorial poster art, ligne-claire sci-fi comic, and gouache animation background than realism: one standout lunar orchard signal-keeper as the main character in a simplified suit, holding a broad glowing relay tool, with dome orchard, pale fruit trees, hydroponic slabs, relay dish arc, black sky plane, moon-white regolith blocks, leaf-green accents, and earthlight glow behind them. Use drawn contours, soft painted planes, matte color fields, broad brush shapes, low-to-moderate detail, denoised surfaces, and shallow poster depth. Secondary gardeners may be tiny background shapes only. Must read as lunar survival plus signal work, not workers-only scene, solarpunk garden city, greenhouse archviz, or spaceship render. No generic glass utopia, photoreal transparent glass, realistic reflection, realistic suit anatomy, realistic astronaut portrait, luxury eco garden, UI panels, readable labels, logo, crowded greenhouse, market aisle, starfield wallpaper, PBR metal, painterly realism, cinematic key art, hard-surface render, or hyper-detail.',
    'SP15-072':
      'A non-photographic stylized illustrated digital-painting character card, closer to clean lunar acoustic ceremony poster art, ligne-claire sci-fi comic, and gouache animation background than realism: close crop of an older crater choir conductor seen from side/back, gloved hands tuning two acoustic rig arcs, partial face reflected in helmet glass, crater dish array and earthrise glow behind, blank white fabric planes, signal-gold accents, and cobalt crater shadows. Use drawn contours, soft painted planes, matte color fields, broad brush shapes, low-to-moderate detail, denoised surfaces, and shallow poster depth. Must read as sparse lunar ceremony through gesture plus equipment, not workers-only scene, full-body conductor hero, temple, religious service, or abstract space wallpaper. No flags, cross, religious icon, altar, readable marks, mission logo, UI, starfield wallpaper, fantasy temple, choir robe portrait, photoreal suit glass, realistic dish metal, PBR dishes, painterly realism, cinematic key art, hard-surface render, or hyper-detail.',
    'SP15-073':
      'A non-photographic stylized illustrated digital-painting character card, closer to clean stonepunk mechanics poster art, ligne-claire invention comic, and gouache animation background than realism: low three-quarter crop of a broad basalt gearwright, face partly hidden by stone apron hood, both hands pulling a rope-pulley arc across the foreground, simplified carved basalt gear machine behind, chunky basalt blocks, torch-orange glow shapes, ash-gray planes, and blank chalk strokes. Use drawn contours, soft painted planes, matte color fields, broad brush shapes, low-to-moderate detail, denoised surfaces, and shallow poster depth. Must read as sacred stone mechanics through body/gesture plus machine, not workers-only scene, dungeon hero, fantasy dungeon corridor, ritual shrine, castle courtyard, cave vista, or heraldic workshop. No hanging cloth, tapestry, pendant, decorative foreground tile, shrine plaque, deep perspective, city ruins, shields, wall plaques, badges, emblems, cross shapes, heraldic symbols, long corridor, dungeon hallway, religious sanctuary, readable runes, glyph symbols, skulls, bones, gore, weapon, torch procession, photoreal stone, gritty cave realism, realistic carved rock, painterly realism, cinematic key art, 3D masonry render, or hyper-detail.',
    'SP15-074':
      'A non-photographic stylized illustrated digital-painting character card, closer to clean low-tech trade poster art, folk invention comic, and gouache animation background than realism: seated side-profile of a flint engine trader-inventor, older hands opening a compact engine case, expressive face partly cropped by blank cloth canopy, carved wheel blocks, leather tool rolls as broad shapes, smoke-black plume, ochre ground slab, and hide-brown material planes. Use drawn contours, soft painted planes, matte color fields, broad brush shapes, low-to-moderate detail, denoised surfaces, and shallow poster depth. Must read as trade around low-tech engines through one specific inventor, not workers-only scene, full-body fantasy merchant, generic bazaar aisle, crowded marketplace, city alley, or prehistoric documentary. No deep perspective, banner emblem, cloth symbols, shields, badges, jewelry-detail portrait, armored warrior, long market aisle, crowded bazaar corridor, readable price tags, signs, logos, skulls, real bones, gore, weapon stall, animal carcass, photoreal leather, dusty realism, realistic material render, painterly realism, cinematic key art, marketplace key art, or hyper-detail.',
    'SP15-075':
      'A curated 2D x-punk style-card for obsidian water-clock punk: one distinctive timekeeper protagonist in asymmetrical half-body crop, operating a large stepped obsidian water-clock device, mask-like black profile, broad timing bowl, blue water planes, chalk-white measurement strokes with no readable marks, amber fire blocks, and cut-stone geometry. Composition should feel like folk-modernist ritual engineering, Eastern European poster restraint, and handcrafted editorial design, not object-only device plate or heroic fantasy character card. Use matte planes, bold negative space, designed black shapes, low-to-moderate detail, denoised surfaces, and one unusual crop rather than centered full-body pose. Must read as ancient precision water timing through character plus device. No young rugged adventurer, cloak-and-pouch outfit, American RPG hero, altar hero, worker ritual crew, religious icon, skull, bones, gore, readable runes, wall glyphs, deep corridor, cave vista, crowded ritual, market/library aisle, photoreal obsidian, realistic wet stone, tiny carved marks everywhere, painterly realism, cinematic key art, or hyper-detail. Finish with strong denoise, no excessive noise, no ultra-fine detail.',
    'SP15-076':
      'A curated 2D x-punk style-card for bone-tool signal mast punk: close side-profile of a signal herald protagonist half-hidden by mast spars, one hand tying a rawhide sail rectangle, drum circle as broad geometry below, bone-like resin spars, rope lashings, storm-blue sky slab, charcoal ground shape, and two warm signal-fire accents. Composition should feel like field communication plus handmade editorial poster, not object-only mast diagram or fantasy adventurer cover art. Use matte color fields, crisp silhouette hierarchy, rough craft edges, and varied crop; keep figure and mast interlocked instead of centered full-body hero. Must read as low-tech communication engineering without gore. No young rugged adventurer, cloak-and-pouch outfit, American RPG hero, worker crew, real bones, skulls, teeth, carcass, gore, weapon hero, flag, emblem, readable glyphs, tribal marks, religious altar, animal mask portrait, feather headdress cliche, fantasy cave, photoreal hide, noisy fur detail, painterly realism, cinematic key art, or hyper-detail. Finish with strong denoise, no excessive noise, no ultra-fine detail.',
    'SP15-077':
      'A curated 2D x-punk style-card for rope-bridge generator punk: cropped diagonal view of a runner-engineer gripping a generator wheel handle, face only partially visible, one leg/shoulder showing motion, oversized wooden generator wheel, rope arcs as bold graphic diagonals, lantern-line color blocks, forest-green negative-space planes, tan spans, and dark wood silhouettes. Composition should feel like kinetic folk-engineering editorial card, not object-only bridge cutaway, heroic RPG character card, or jungle adventure cover. Use asymmetric machinery rhythm, broad matte shapes, controlled brush planes, denoised surfaces, and low-to-moderate detail. Must read as foot-powered kinetic bridge machinery through character plus mechanism. No centered full-body adventurer, young rugged protagonist, cloak-and-pouch outfit, American RPG hero, worker crew, long hallway perspective, endless bridge tunnel, fantasy temple, scenic jungle bridge, market/library aisle, hanging flag symbols, readable signs, weapon, photoreal rope fibers, realistic forest concept art, tiny pulley clutter, painterly realism, cinematic key art, or hyper-detail. Finish with strong denoise, no excessive noise, no ultra-fine detail.',
    'SP15-078':
      'A curated speculative poster/artbook plate for mud-brick battery-house punk: one quiet battery keeper shown in three-quarter crop beside an oversized copper-cell jar and stacked ceramic batteries, mud-brick courtyard planes, copper-green glow blocks, shade-blue doorway geometry, woven mat pattern as large simple shapes, and cream clay dust slabs. Composition should feel like earth-tech craft poster and warm handmade infrastructure, not desert fantasy hero art. Use grounded folk-modernist color blocking, tactile matte clay, simplified face/hands, low-to-moderate detail, denoised surfaces, and breathing room. Must read as primitive energy storage. No young rugged adventurer, cloak-and-pouch outfit, American RPG hero, generic village market, pottery shop still life, solarpunk glass utopia, readable jar labels, shop signs, wall signage, painted letters, number-like marks, geometric text panels, market aisle, library aisle, crowded bazaar, religious shrine, flags, symbols, logo-like battery icons, photoreal clay, dusty realism, tiny ceramic rows everywhere, painterly realism, cinematic key art, or hyper-detail. Finish with strong denoise, no excessive noise, no ultra-fine detail.',
    'SP15-079':
      'A curated speculative poster/artbook plate for coastal salvage sailpunk: sail geometry and patched hull curves dominate, with one older sailwright-captain as a graphic wind silhouette holding a rope line across the composition, patched sail triangles, rope winch blocks, sea-blue planes, rust accents, tar-black shadows, and salt-wood shapes. Composition should feel like maritime craft poster and weathered communal invention, not pirate/fantasy character art. Use flat sail planes, strong diagonal wind design, asymmetric crop, matte color, denoised surfaces, and low-to-moderate detail. Must read as wind-powered salvage commons. No young rugged adventurer, cloak-and-pouch outfit, American RPG hero, pirate costume portrait, flags, banners, skull emblem, pirate logo, readable sail marks, weapons, crowded dock, harbor market, market aisle, random junk collage, photoreal canvas, glossy ship render, tiny rope clutter, painterly realism, cinematic key art, or hyper-detail. Finish with strong denoise, no excessive noise, no ultra-fine detail.',
    'SP15-080':
      'A curated speculative poster/artbook plate for driftwood turbine camp punk: foreground close crop of one wind-tender elder with weathered face and hand on a compact turbine control box, oversized handmade turbine blades cutting behind the shoulder, patched tent color blocks, ember-orange campfire plane, dusk-blue sky slab, rope lashings, canvas tan shapes, and scrap blade silhouettes. Composition should feel like humane salvage-world poster and quiet infrastructure myth, not family-camp postcard or heroic fantasy portrait. Use unusual crop, broad warm/cool planes, simplified weathered face, matte texture, denoised surfaces, and low-to-moderate detail. Must read as handmade wind power and salvage life through elder plus turbine. No young rugged adventurer, cloak-and-pouch outfit, American RPG hero, generic sage portrait, family-camp postcard, generic refugee camp, eco-symbol abstraction, object-only turbine render, flags, faction marks, readable signs, logo-like leaf/wind icons, bird motif, crowded tents, market/library aisle, photoreal camping scene, dusty survival realism, tiny scrap clutter, painterly realism, cinematic key art, or hyper-detail. Finish with strong denoise, no excessive noise, no ultra-fine detail.',
    'SP13-011':
      'A character-led labyrinth-glow anime style-card with one original cautious adventurer, readable pose, clean cel silhouette, toxic-lime bio-glow, carved stone fragments, crystal nodes, mist pockets, and rune-like non-readable light cues as support. Keep survival tension and subterranean mood without a literal dungeon corridor, tunnel hallway, torch procession, explorer group, market, library, camera, weapon, monster attack, readable symbols, or empty abstract glow.',
    'SP05-008':
      'A neon procedural irony anime style-card with one original magnetic adult lead in a dry comic-noir pause: raised eyebrow, elegant 1980s cel contour, cobalt night, controlled pink neon, amber contradiction-light, wet glass color planes, and one absurd visual mismatch that reads as tactical humor. Reference lineage: Tsukasa Hojo adult cool, City Hunter-era neon comedy timing, and polished 1980s TV blocking, without copying any franchise, artist asset, costume, logo, or named character. Must read as procedural rhythm through acting, timing, and lighting, not literal detective cosplay. Avoid police badge, gun, trench coat, office case board, readable file/text, street chase, window-wall room, camera prop, library/market/corridor drift, object-only clue, or generic neon portrait.',
    'SP05-030':
      'A gothic soul-pop action anime style-card with one original angular youth performer-warrior in black/red rhythm shapes: skull-pop geometry as abstract pattern only, bone-white accents, crimson moon pulse, crisp early-digital cel edges, and musical combat timing in the pose. Reference lineage: Atsushi Ohkubo gothic soul-pop action, Bones-era clean black shapes, and angular youth-action design, without copying any franchise, artist asset, uniform, logo, weapon, or named character. Must read as gothic rhythm action through silhouette, not generic dark shonen. Avoid scythe, chains, school hallway, literal skull logo, mask hero, weapon duel, camera prop, market/library/corridor drift, object-only emblem, or noisy red particles.',
    'SP05-073':
      'A wandering clockwork hearth anime style-card with one original warm traveler and a friendly brass machine-creature sharing a small domestic-magic action: honey light, teal shadow, worn copper, floating cloth, hand-painted texture, and soft emotional craft. Reference lineage: Hayao Miyazaki clockwork hearth fantasy, Howl-era wandering domestic magic, and Ghibli handmade world warmth, without copying any franchise, artist asset, castle, logo, creature design, or named character. Must read as mobile hearth and clockwork comfort, not generic fantasy room. Avoid literal castle interior, stove/fireplace hero, market aisle, library aisle, corridor, lamp/chair/studio setup, camera prop, object-only gears, or over-detailed machinery.',
    'SP05-074':
      'A skyglow longing drama anime style-card with one original small courageous figure suspended against vast blue-gold horizon light: hand-painted cloud planes, wind-pulled clothing, soft aircraft-like silhouette far away as scale cue, and luminous melancholy. Reference lineage: Ghibli sky-adventure longing, Castle in the Sky-era blue horizons, and classic adventure-anime emotional distance, without copying any franchise, artist asset, ship design, logo, costume, or named character. Must read as longing flight drama through scale and sky color, not generic cloudscape. Avoid cockpit, castle ruin, literal airship hero, bird fixation, market/library/corridor drift, camera prop, empty landscape, readable text, or glossy modern anime face.',
    'SP05-075':
      'A rainlight threshold romance anime style-card with two original characters separated by a narrow weather-lit threshold: blue-white rain glow, warm skin reflection, translucent umbrella edge or glass plane, tiny hand hesitation, and restrained microacting. Reference lineage: Makoto Shinkai rainlight romance, Naoko Yamada threshold acting, and refracted weather memory, without copying any franchise, artist asset, costume, logo, location, or named character. Must read as intimate rain threshold through gesture and light, not generic couple portrait. Avoid school hallway, train platform cliche, window-wall room, umbrella product shot, library/market/corridor drift, camera prop, readable signs/text, excessive sparkles, or same pastel idol faces.',
    'SP05-076':
      'A cinematic dream-collapse surrealism anime style-card with one original adult dreamer running through a controlled montage of folding color panels: carnival red, acid cyan, warm yellow, violet shadow, impossible perspective cuts, and one readable human anchor. Reference lineage: Satoshi Kon Paprika-era dream-collapse editing, Madhouse adult-anime polish, and precise surreal montage rhythm, without copying any franchise, artist asset, costume, logo, scene, or named character. Must read as perception collapsing around a character, not random psychedelic wallpaper. Avoid parade crowd, toy clutter, market/library/corridor drift, camera prop, object-only masks, readable text, gore, or dense fine-noise confetti.',
    'SP05-077':
      'A mirror identity collapse thriller anime style-card with one original performer-like adult figure split between two offset reflections: cool grey-blue, magenta stress accent, clean anxious eyes, poster-glass fracture, mismatched expression continuity, one stylized blood-red or makeup-red smear if useful, and sober psychological framing. Reference lineage: Satoshi Kon Perfect Blue-era identity thriller, adult performance anxiety, and controlled mirror-cut editing, without copying any franchise, artist asset, idol costume, logo, scene, or named character. Must read as identity pressure through reflection behavior, not beauty mirror portrait. Avoid bathroom/vanity mirror, low-neck glamour, idol stage, camera prop, hallway/corridor scene lock, market/library drift, readable posters/text, explicit gore, injury detail, or chaotic abstract shards.',
    'SP05-046':
      'A luminous epistolary shojo drama style-card with one original period-romance character defined by hand gesture, sealed letter, paper-fiber tactility, amber window glow, restrained sepia-rose palette, lace/satin detail, and contemplative stillness. Reference lineage: Yumeji-era lyrical portrait mood, Mucha ornamental framing, and 1970s cinematic shojo close-up grammar, without copying any artist, franchise, or named character. Keep it sepia-amber and letter-led, not black-gothic or palace-fantasy. Avoid generic pastel idol face, modern cafe, classroom, library, desk clutter, readable writing, camera, corridor, market, crown, gothic crest, candle shrine, or empty abstract glow.',
    'SP05-047':
      'An airy first-love shojo style-card with one original character caught in a hesitant near-contact gesture, pale spring air, restrained blush, clean cream negative space, soft green-blue freshness, translucent fabric motion, and suspended emotional distance. Reference lineage: vintage lyrical shojo magazine softness, Macoto-style big-eye delicacy, and watercolor romance illustration cues, without copying any artist, franchise, or named character. Must feel daylight, light, open, and innocent. Avoid gothic academy, black dress, red roses, palace interiors, candles, crests, dark windows, generic magical-girl costume, idol sparkle overload, school-confession cliche, cherry-blossom default, classroom, library, camera, corridor, market, or same pink face as neighboring presets.',
    'SP05-048':
      'A crimson quest-romance anime style-card with one original wind-swept heroine or noble traveler, visible resolve, jewel-green and crimson palette split, brushed leather/metal trim, horizon light, adventure silhouette, and loyal warmth. Reference lineage: Dezaki/Araki-era theatrical adventure shojo, Pre-Raphaelite color romance, and noble quest poster composition, without copying any artist, franchise, or named character. Must read as outdoor adventure romance with wind and horizon, not indoor court shojo. Avoid generic pastel princess, static glamour portrait, sword-first fantasy hero, castle hallway, palace room, marketplace, library, camera, compass/map prop, gothic academy, or empty landscape.',
    'SP05-049':
      'A velvet gothic academy shojo style-card with one original nocturnal character, black velvet massing, moon-silver rim, wine-red accent, lace edgework, restrained melancholy gaze, and one sharp gothic accessory. Reference lineage: Aubrey Beardsley black-shape elegance, Gothic Revival ornament, and dark 1990s shojo romance framing, without copying any artist, franchise, or named character. Must be the only dark gothic entry in this wave. Avoid literal school corridor, bookshelf/library, chapel hallway, vampire cosplay, generic candle room, camera, market, readable text, pastel daylight romance, crimson quest horizon, or identical pastel romance face.',
    'SP05-050':
      'A cozy tactile sign-language romance style-card with one original character using clear hand-led communication, warm winter cream/blue palette, knit texture, close-range tender expression, soft practical warmth, and gesture readability as the focal style signal. Reference lineage: iyashikei warmth, classic romance manga hand-gesture acting, and quiet European winter illustration color, without copying any artist, franchise, or named character. Must prioritize readable hands and soft winter texture over face glamor. Avoid coffee-shop date cliche, scarf-only shortcut, city festival, classroom, library, camera, market corridor, unreadable hands, gothic/palace styling, crown/crest props, or generic pastel idol face.',
    'SP05-081':
      'A shared-warmth slice-of-life anime style-card with two or three original friends in a tiny social beat: one shoulder tilt, one hand gesture, one almost-laughing eye-line, cream/butter/mint palette, tea-toned comfort, polished lived-in fabrics, and soft afternoon bounce. Reference lineage: Kyoto Animation ensemble microacting, Naoko Yamada-style gesture empathy, and K-On! warmth as broad production grammar, without copying any studio asset, franchise, artist, or named character. Must read as ensemble microacting, not solo glamour. Avoid generic bedroom/cafe/school staging, instrument fan-service, idol portrait, gothic/palace mood, dramatic action pose, camera, library, market corridor, text, or empty pastel abstraction.',
    'SP05-082':
      'A deadpan-explosion comedy anime style-card with one original character frozen in calm blank-faced setup while an impossible elastic gag erupts nearby: sudden scale jump, simplified everyday object, clean pale background, saturated comic accent spike, readable reaction silhouette, and slapstick timing held in one frame. Reference lineage: Nichijou/Keiichi Arawi absurd timing, manga reaction economy, and elastic TV-anime gag posing, without copying any franchise, artist, or named character. Must read as comedy timing, not cozy moe portrait. Avoid generic cute smile, romantic pastel pose, school/classroom default, gothic/palace mood, weapon, camera, library, market corridor, readable sound effects, or cluttered gag sheet.',
    'SP05-083':
      'A low-stakes banter anime style-card with two or three original friends in a flat conversational rhythm: simple talk-circle geometry, tiny reaction differences, relaxed snack-warm palette, low-contrast indoor pastels, and expression-over-action pacing. Reference lineage: Lucky Star conversational timing, late-2000s otaku slice-of-life flatness, and clean episodic comedy framing, without copying any franchise, artist, or named character. Must read as casual banter, not ensemble warmth or slapstick explosion. Avoid solo glamour portrait, dramatic action, gothic/palace mood, cosmic anomaly, classroom default, cafe default, camera, library, market corridor, readable text, or prop clutter.',
    'SP05-084':
      'An ordinary-cosmic whimsy anime style-card with original everyday characters reacting to one impossible blue anomaly intruding into cozy routine: grounded warm room or street fragment, sudden non-euclidean glow, ribbon-like accent, playful meta-chaos, and ensemble reaction pressure. Reference lineage: Haruhi-era ordinary-to-cosmic anime pivot, late-2000s sci-fi school-life energy, and light novel cover anomaly composition, without copying any franchise, artist, or named character. Must read as reality pivot, not normal cozy moe or generic magic. Avoid classroom default, clubroom copy, starry fantasy hallway, idol pose, deadpan toaster gag, gothic/palace mood, camera, library, market corridor, readable text, or empty abstract portal.',
    'SP05-085':
      'An anxiety-glitch catharsis comedy anime style-card with one original awkward character at emotional overload: soft baseline pose ruptured by magenta glitch, halftone panic insert, photocopy smear, hard black-white burst, and one cathartic color release. Reference lineage: Bocchi the Rock! mixed-media panic grammar, Aki Hamaji anxiety-comedy rhythm, and experimental TV-anime mode-switching, without copying any franchise, artist, or named character. Must read as panic-to-release comedy, not cozy moe portrait. Avoid generic cute smile, normal clubroom, idol stage, music gear as required prop, gothic/palace mood, camera, library, market corridor, readable text, or empty glitch abstraction.',
    'SP05-086':
      'A cold-warm restorative comfort anime style-card with one or two original travelers in a practical warmth pocket: cool pine/mountain blue ambient, ember orange thermal key, wool layers, enamel cup or small cooking kit, vapor haze, rough natural grain, and slow companionship pacing. Reference lineage: Yuru Camp restorative outdoor rhythm, Afro-style practical coziness, and iyashikei landscape intimacy, without copying any franchise, artist, or named character. Must read as thermal comfort and calm utility, not generic indoor cozy anime. Avoid bedroom/cafe/school default, romance glamour, comic gag, gothic/palace mood, camera, library, market corridor, readable text, weapon, or crowded camping gear catalog.',
    'SP05-087':
      'A pastoral breathing-room stillness anime style-card with one original rural kid, sibling pair, or quiet traveler held small inside warm open space: summer grass, cicada-hour air, straw beige, soft sky blue, slow hand ritual, and large negative-space calm. Reference lineage: Non Non Biyori rural spacing, Atto-style gentle everyday timing, and World Masterpiece Theater countryside observation, without copying any franchise, artist, or named character. Must read as spacious pastoral pause, not generic cozy portrait. Avoid bedroom/cafe/classroom default, clubroom, lamp/curtain/studio setup, glamour face, city street, fantasy village, camera, library, market corridor, readable text, or empty landscape without a character beat.',
    'SP05-088':
      'A domestic-fantasy scale-chaos anime style-card with one original household character reacting warmly to a huge friendly magical creature fragment, tiny dragon-adjacent silhouette, or impossible oversized visitor squeezed into routine space: cream wood warmth, cyan magical spill, affectionate panic, round comfort shapes, and scale-comedy staging. Reference lineage: Miss Kobayashi-style domestic monster comedy, Coolkyousinnjya scale-gag rhythm, and Kyoto Animation creature-in-routine polish, without copying any franchise, artist, studio asset, or named character. Must read as mythic scale colliding with home routine, not normal cozy moe. Avoid generic bedroom/cafe/school default, empty portal, gothic palace, market/library corridor, camera, readable text, weapon, creature attack, or same cute solo portrait as neighboring presets.',
    'SP05-089':
      'A soft-surreal deadpan-drift anime style-card with one original calm character accepting a quiet impossible event: floating kettle, tiny cloud indoors, fish-shadow crossing daylight, soft bending perspective, pale mint/beige/blue palette, and almost no reaction. Reference lineage: Yokohama Kaidashi Kikou calm dream logic, Hitoshi Ashinano gentle stillness, and Tsukumizu-style deadpan quiet absurdity, without copying any franchise, artist, or named character. Must read as sweet mundane surrealism with deadpan timing, not cozy friendship scene. Avoid loud slapstick, anxiety glitch, magical portal spectacle, bedroom/cafe/classroom default, lamp/curtain/studio setup, market/library corridor, camera, readable text, object-only still life, or generic smiling anime portrait.',
    'SP05-090':
      'A memory-washed melodrama softness anime style-card with one original character in a bittersweet emotional close-to-mid shot: translucent tearline glow, faded amber/sky-blue haze, soft blossom pink, half-remembered rain glass or train-platform light, lowered gesture pressure, and sincere vulnerable stillness. Reference lineage: Makoto Shinkai memory-light, Naoko Yamada emotional microacting, and Key/Jun Maeda visual-novel melodrama softness, without copying any franchise, artist, studio asset, or named character. Must read as nostalgic emotional memory, not generic pastel romance. Avoid classroom/cafe confession cliche, gothic palace, idol glamour, comedy gag, fantasy portal, library/market corridor, camera, readable text, excessive sky-only landscape, or the same cute face as neighboring slice-of-life presets.',
    'SP05-101':
      'A fluid painterly anime style-card with one original character half-dissolving into watercolor and ink wash: wet rice-paper bloom, sumi-e gesture line, indigo/crimson pigment pools, disappearing contours, and readable silhouette held by one calm pose. Reference lineage: Studio 4C art-anime looseness, Masaaki Yuasa fluid morph grammar, and Tale of the Princess Kaguya wash economy, without copying any franchise, artist, studio asset, or named character. Must read as painterly anime experiment, not generic pretty portrait or empty abstract wash. Avoid hard cel outlines, glossy digital finish, cyber neon, gritty realism, deco geometry, classroom/cafe/studio wall, camera, market/library corridor, readable text, or pigment-only card with no subject.',
    'SP05-102':
      'A gritty realist seinen anime style-card with one original adult character in an unsentimental documentary frame: tired eyes, worn jacket, concrete gray, fluorescent green cast, scuffed material, practical posture, and hard overhead light. Reference lineage: Satoshi Kon adult-drama realism, Naoki Urasawa grounded faces, and Katsuhiro Otomo urban material weight, without copying any franchise, artist, studio asset, or named character. Must read as adult realist seinen, not cute/moe or cinematic hero glamor. Avoid school uniform, idol face, fantasy ruins, weapon, noir detective cliche, camera, market/library corridor, readable signs, gore, excessive wrinkles/noise, or abstract material-only card.',
    'SP05-103':
      'A neon hyperpop anime style-card with one original avatar-like character in a saturated music-video pose: RGB channel split, magenta/cyan/toxic green palette, holographic foil shimmer, glossy digital edge, glitch displacement, and clean candy-color silhouette. Reference lineage: Studio Trigger color impact, Redline-era speed saturation, and internet-native Vocaloid/music-video maximalism, without copying any franchise, artist, studio asset, or named character. Must read as terminally-online hyperpop anime, not cyberpunk noir or generic idol portrait. Avoid dark moody palette, readable UI/text, brand logos, phone/camera prop, nightclub crowd, market/library corridor, gritty realism, painterly wash, or noisy microdetail sparkle.',
    'SP05-104':
      'A minimalist indie quiet anime style-card with one tiny original figure or spare character silhouette held against vast off-white/sky-gradient negative space: very few ink lines, one accent color, lonely scale, soft overcast light, and intentional silence. Reference lineage: Kunio Kato sparse animation, arthouse short-film framing, and iyashikei quiet-space restraint, without copying any franchise, artist, studio asset, or named character. Must read as less-is-more indie anime, not unfinished prompt or empty abstraction. Avoid detailed background, dramatic lighting, large glamour face, cute moe pose, props-as-clutter, lamp/curtain/studio setup, camera, market/library corridor, readable text, or saturated hyperpop color.',
    'SP05-105':
      'A textured hand-drawn rough anime style-card with one original character in a raw genga-like keyframe: visible pencil underdrawing, construction lines, eraser ghosts, peg-bar registration hints, colored-pencil rough fill, graphite pressure, and warm human imperfection. Reference lineage: Yoshinori Kanada rough key-animation energy, pre-digital OVA pencil-test material, and Studio 4C production-sketch tactility, without copying any franchise, artist, studio asset, or named character. Must read as production-art roughness, not polished clean anime. Avoid fully rendered digital color, vector-clean lines, finished cel shade, desk/tool/studio scene, readable notes, camera, market/library corridor, generic pretty portrait, or noisy dirty scan overload.',
    'SP05-106':
      'A deco-inspired geometric anime style-card with one original elegant character or mask-like figure built from faceted planes: gold leaf, lapis blue, ruby accent, ruler-straight lines, fan geometry, enamel black, stained-glass color blocking, and theatrical symmetry. Reference lineage: Art Deco poster design, Erte ornamental geometry, Tamara de Lempicka faceted elegance, and classic shojo theatrical composition, without copying any franchise, artist, studio asset, or named character. Must read as geometric deco anime, not generic fantasy palace or soft organic shojo. Avoid round soft contours, messy pencil texture, painterly wash, gothic academy, palace corridor, readable crest/text, camera, market/library corridor, weapon, or bland centered face.',
    'SP05-107':
      'An unsettling non-graphic horror anime style-card with one original shadowed figure or creature-adjacent silhouette undergoing implied transformation: clinical off-white void, bruise-crimson accent, black organic spiral, porcelain/membrane surface, oppressive close crop, and dread through shape distortion rather than gore. Reference lineage: Junji Ito psychological dread, Satoshi Kon nightmare montage unease, and 1990s bio-horror OVA atmosphere, without copying any franchise, artist, studio asset, or named character. Must read as visceral horror mood while staying non-graphic. Avoid exposed organs, blood spray, dismemberment, injury detail, torture, medical gore, cute/moe face, monster attack scene, weapon, camera, market/library corridor, readable text, or generic dark portrait.',
    'SP05-108':
      'A fairy-tale storybook soft anime style-card with one original gentle character or small enchanted traveler inside an illuminated-manuscript frame: watercolor paper grain, buttercream/lavender/mint palette, floral ornament, gold-foil edge, lace-like border, and warm picture-book wonder. Reference lineage: Studio Ghibli storybook tenderness, Kinuko Craft fairytale ornament, and classic shojo picture-book softness, without copying any franchise, artist, studio asset, or named character. Must read as soft fairytale illustration, not generic pastel anime portrait. Avoid dark gothic, gritty realism, horror, adult glamor, palace corridor, literal princess-castle cliche, readable book/page text, camera, market/library corridor, or empty floral abstraction.',
    'SP05-109':
      'A kinetic impact-line choreography anime style-card with one original character in a clean non-weapon motion burst: diagonal body arc, speed-line forest, radial impact geometry, afterimage smear, electric-blue aura, yellow-white flash, and clear force direction. Reference lineage: Yoshinori Kanada impact-line grammar, Yutaka Nakamura cube/impact rhythm, and Imaishi/Gainax kinetic exaggeration, without copying any franchise, artist, studio asset, or named character. Must read as motion choreography, not generic shonen battle. Avoid weapon-first pose, punch-to-face impact, injury, rubble storm, dense forest/ruin, readable sound effects, camera, market/library corridor, or static glamour portrait.',
    'SP05-110':
      "A surreal dream-logic anime style-card with one original sleeper/traveler figure in impossible gentle space: floating door fragment, fish-moon shadow, inverted stair or water-sky plane, contradictory soft light, lavender/indigo/gold palette, and symbolic object morphing. Reference lineage: Satoshi Kon dream montage, Angel's Egg liminal symbolism, and Masaaki Yuasa morphing surreal animation, without copying any franchise, artist, studio asset, or named character. Must read as dream logic with a readable subject, not random fantasy hallway. Avoid literal bedroom dream scene, corridor/tunnel, readable text, camera, library/market aisle, horror gore, hyperpop neon, or empty floating-object collage without a character anchor.",
    'SP05-111':
      'An ukiyo-e woodblock anime style-card with one original character, spirit, or traveler composed through flat washi color planes: indigo/vermillion/ochre palette, bokashi gradient, carved sumi contour, wave/rain rhythm, paper grain, and flattened decorative depth. Reference lineage: Hokusai wave dynamism, Hiroshige rain atmosphere, Sharaku theatrical contour, and modern anime print-fusion, without copying any franchise, artist, studio asset, or named character. Must read as woodblock-anime fusion, not modern digital fantasy. Avoid smooth CGI shading, western perspective, readable kanji/text, literal famous wave copy, sword-first samurai, palace corridor, camera, market/library corridor, or generic kimono portrait.',
    'SP05-112':
      'A spray-drip wildstyle anime style-card with one original street-anime character or bold character silhouette fused into a mural-scale abstract shape: overspray halos, non-readable wildstyle curves, chrome/safety-orange/neon fill, concrete grain, buff-paint beige, stencil edges, and paint drips. Reference lineage: Lee Quinones subway mural energy, Lady Pink color rhythm, Basquiat street-mark intensity, and anime street-art fusion, without copying any artist, tag, logo, franchise, or named character. Must read as graffiti-surface anime, not gallery poster or readable tag. Avoid readable letters/words, real graffiti crew tags, white-wall gallery, spray-can/camera prop focus, market/library corridor, polished clean vector, vandalism scene with police, or empty paint-only abstraction.',
    'SP05-113':
      'A leaded jewel-light segmentation anime style-card with one original character, angelic mask, or solemn heroine silhouette built from stained-glass panes: thick black came lines, sapphire/ruby/emerald panes, rosette framing, translucent backlight, glass bubbles, gothic vertical rhythm, and sacred color glow. Reference lineage: medieval cathedral stained glass, Alphonse Mucha ornamental framing, Kunihiko Ikuhara theatrical symbolism, and Revolutionary Girl Utena jewel-window composition grammar, without copying any franchise, artist, studio asset, or named character. Must read as stained-glass anime segmentation, not generic chapel interior or empty window pattern. Avoid literal church aisle, palace corridor, readable religious text, crest/logo, camera, market/library corridor, smooth digital gradient, or subjectless glass pattern.',
    'SP05-114':
      'A threadbare textile patchwork anime style-card with one original character, mascot-like figure, or soft heroine silhouette built from visible fabric patches: boro indigo scraps, sashiko white stitching, frayed edges, embroidery contours, linen/ecru warmth, button accents, and soft stuffed-volume proportions. Reference lineage: Japanese boro textiles, sashiko craft geometry, quilted folk-art storytelling, Rankin/Bass tactile stop-motion softness, and handmade anime craft illustration, without copying any franchise, artist, studio asset, or named character. Must read as anime-through-fabric, not sewing-room still life. Avoid sewing tools, hands crafting, curtain/lamp/studio room, readable labels, fashion catalog, glossy digital finish, market/library corridor, or empty fabric swatch board.',
    'SP05-115':
      'An ice-crystal refractive anime style-card with one original figure, mask, or guardian silhouette refracted through sharp hexagonal crystal planes: ice-blue/cyan monochrome, prism rainbow edge, internal bubbles, frost-fern texture, caustic light, gem-cut body geometry, and clean frozen negative space. Reference lineage: Haruko Ichikawa mineral-body serenity, Houseki no Kuni refractive material grammar, arctic glass sculpture photography, and 1990s OVA icy elegance, without copying any franchise, artist, studio asset, or named character. Must read as refractive frozen anime, not generic ice princess or palace fantasy. Avoid throne/castle corridor, snow queen cliche, warm fire glow, soft organic curves, readable text, camera, market/library corridor, or empty crystal cluster.',
    'SP05-116':
      'A sumi-e impact brushstroke anime style-card with one original character silhouette or creature stroke formed from a single explosive ink gesture: pressure-variable black brush, dry-brush splinter, wet ink pool, rice-paper fiber, large negative space, and one restrained vermillion seal-like accent without readable text. Reference lineage: Hokusai ink force, Zen enso discipline, Yoshinori Kanada impact posing, and Masaaki Yuasa gesture-led animation energy, without copying any franchise, artist, studio asset, or named character. Must read as one-breath sumi-e anime impact, not colorful cel action. Avoid readable calligraphy, kanji, samurai sword cliche, weapon-first pose, detailed filled background, camera, market/library corridor, or noisy ink splatter clutter.',
    'SP05-117':
      'A phosphor sensor-vision grain anime style-card with one original nocturnal silhouette, small creature, or equipment-free figure seen through green intensifier vision: phosphor monochrome, reticle-like non-text alignment marks, lens-tube vignette, sensor bloom, scanline grain, and mediated vulnerability. Reference lineage: night-vision documentary texture, found-footage anime tension, Mamoru Oshii surveillance mood, and tactical sensor aesthetics as visual grammar, without copying any franchise, artist, studio asset, logo, or real unit identity. Must read as phosphor sensor vision, not cyberpunk neon or military gear poster. Avoid camera/device prop, readable HUD text/numbers, guns, soldiers, real military insignia, market/library corridor, bright daylight, colorful palette, or empty UI overlay.',
    'SP05-118':
      'A backlit contour longing anime style-card with one original character silhouette held against a huge sky color script: orange-magenta sunset core, gold rim hair edge, violet dusk gradient, flare haze, posture-only emotion, and minimal facial detail. Reference lineage: Makoto Shinkai sky-led color scripts, Naoko Yamada silhouette microacting, Osamu Dezaki postcard-memory stillness, and classic anime sunset longing compositions, without copying any franchise, artist, studio asset, or named character. Must read as silhouette longing and atmosphere, not generic pretty-face romance. Avoid visible detailed face, classroom/cafe confession, repeated train-platform staging, dark indoor scene, camera/lens prop, market/library corridor, readable text, or empty sky with no character anchor.',
    'SP05-119':
      'A chalk-dust slate sketch anime style-card with one original character bust, dancer silhouette, or creature mask drawn as powdery chalk on a dark slate ground: smeared white contour, erased ghost trails, classroom-board value bloom without classroom context, dusty edge halos, and one pale blue or peach accent. Reference lineage: chalk animation tests, early production layout roughs, William Kentridge charcoal-erasure motion logic, and anime genga construction economy, without copying any franchise, artist, studio asset, or named character. Must read as chalk-dust anime sketch, not school blackboard gag or polished cel portrait. Avoid equations, readable writing, chalk sticks, teacher/classroom scene, desk/lamp/curtain setup, camera, market/library corridor, or empty smudge field.',
    'SP05-120':
      'A thermal-heat-signature vision anime style-card with one original running figure, animal-like spirit, or hidden character silhouette rendered through infrared heat bands: black/cold blue background, yellow-orange-white heat core, false-color contour edges, low-detail face, sensor bloom, and body-heat storytelling. Reference lineage: FLIR thermal imaging, science-documentary false-color maps, Mamoru Oshii techno-surveillance mood, and anime stealth tension grammar, without copying any franchise, artist, studio asset, logo, or real unit identity. Must read as thermal vision anime, not neon cyberpunk or rainbow abstract map. Avoid readable UI numbers, weapons, soldiers, camera/device prop, market/library corridor, full daylight, detailed facial glamour, or empty heat-map texture.',
    'SP05-162':
      'A moonlit ribbon-justice magical-girl anime style-card with one original heroine in a compassionate heroic pose: crescent-moon halo logic, flowing ribbon arcs, jewel-pastel pink/cyan/lilac glow, crisp vintage cel contours, satin sparkle, and transformation-energy choreography. Reference lineage: Naoko Takeuchi magical-girl elegance, 1990s Toei transformation sequencing, Ikuko Itoh polished silhouette design, and classic shojo magazine romance sparkle, without copying any franchise, artist, studio asset, costume, logo, weapon, or named character. Must read as moonlit magical-radiance justice, not generic idol pastel or exact sailor-uniform cosplay. Avoid sailor collar copy, twin-bun hairstyle cue, wand prop, rooftop city scene, literal moon-title emblem, readable text, camera, market/library corridor, or object-only sparkle field.',
    'SP05-168':
      'A red-alert psychological biomecha anime style-card with one original isolated pilot-like figure or fragile silhouette trapped inside oppressive diagnostic geometry: crimson warning planes without readable UI, bruised violet/industrial green palette, cross-blast light, angular 90s cel mechanical contours, cathode bloom, and sacred-apocalypse scale pressure. Reference lineage: Hideaki Anno psychological montage discipline, Yoshiyuki Sadamoto restrained character tension, Gainax late-90s cel-mecha layouts, and mecha-interface claustrophobia, without copying any franchise, artist, studio asset, robot design, logo, or named character. Must read as red-alert interior collapse, not generic mecha poster. Avoid plug-suit copy, specific mecha silhouette, command-room screens with text, giant robot hero pose, religious icon copy, soldiers, weapons, market/library corridor, or empty red UI overlay.',
    'SP05-171':
      'An arcane-chaos roadtrip fantasy-comedy anime style-card with one original mischievous mage or mercenary traveler caught mid-gag: elastic reaction pose, oversized spell-circle burst without readable glyphs, fire-orange/sapphire-blue color punctuation, scorched parchment texture, and bright 90s fantasy sky reset. Reference lineage: Rui Araizumi sharp comic-fantasy illustration, 1990s TV fantasy-comedy timing, expressive cel reaction shots, and slapstick spell-impact staging, without copying any franchise, artist, studio asset, costume, logo, or named character. Must read as loud fantasy-comedy spell chaos, not serious RPG party art. Avoid tavern/market/corridor, fixed adventuring party lineup, readable magic symbols, lewd gag, weapon-first pose, dragon attack, camera, library aisle, or generic fireball-only abstraction.',
    'SP05-172':
      'A tarot-mecha fantasy anime style-card with one original windswept shojo protagonist before an ornate ceremonial machine silhouette or mecha-emblem fragment: jewel crimson/sapphire/violet sky, antique gold rim, tarot-card segmentation without readable symbols, elongated romantic pose language, enamel mechanical contour, and prophecy glow. Reference lineage: Shoji Kawamori ornate transformable machine myth, Nobuteru Yuki elegant 90s character drama, Kazuki Akane romantic fantasy staging, and late-90s cel fantasy skies, without copying any franchise, artist, studio asset, robot design, logo, or named character. Must read as fated shojo-mecha fantasy, not generic castle romance or cockpit scene. Avoid exact tarot card labels, cockpit interior, battlefield, castle corridor, angel wings, weapon-first mecha, readable text, market/library corridor, or object-only tarot collage.',
    'SP05-176':
      'A jewel-armor quest magical-knight anime style-card with one original heroine or compact trio silhouette implied through color partitions: gem-faceted armor plates, saturated red/blue/pink jewel primaries, gold rune arcs without readable symbols, sky-fantasy glow, heroic friendship warmth, and bright 90s cel-fantasy polish. Reference lineage: CLAMP ornate shojo geometry, Magic Knight-era jewel armor fantasy grammar, Mokona/CLAMP decorative silhouette logic, and 1990s TMS magical-fantasy color staging, without copying any franchise, artist, studio asset, costume, weapon, logo, or named character. Must read as jewel quest armor and team-color optimism, not generic magical-girl sparkle. Avoid exact school-uniform armor, sword-first pose, fixed party lineup, castle corridor, readable runes, giant gem mascot, market/library corridor, or object-only rune field.',
    'SP05-177':
      'A cheerful bridge-deck mecha comedy anime style-card with one original expressive pilot/operator or small ensemble beat around retro console glow: cyan/amber practical light, deep space navy, launch-vector diagonals, analog panel shapes without readable UI, bouncy reaction timing, and clean 90s cel mecha-comedy finish. Reference lineage: Kia Asamiya space-opera character energy, Xebec-era ensemble mecha comedy, 1990s TV anime command-room color rhythm, and playful genre-aware launch staging, without copying any franchise, artist, studio asset, ship design, logo, or named character. Must read as cheerful mecha bridge banter, not serious military cockpit. Avoid readable screen text, full bridge replica, weapon launch, battleship hero shot, uniform copy, market/library corridor, camera prop, or empty console-panel abstraction.',
    'SP05-178':
      'A mythic urban-purge occult anime style-card with one original empty-handed guardian silhouette under ritual warning light, composed like a shallow emergency-poster close-to-mid shot instead of a navigable street: siren red framing, toxic chlorophyll green invasive silhouettes, flat broken-facade panels, wet asphalt fragments only as texture, talisman-gold flashes, sharp 90s cel action contours, and occult hazard geometry without readable script. Reference lineage: Yuzo Takada occult-action manga energy, Blue Seed-era urban mythic emergency grammar, 1990s supernatural action cel staging, and tactical ritual contrast, without copying any franchise, artist, studio asset, monster design, logo, or named character. Must read as urban occult crisis and invasive myth through color/line/symbol pressure, not magical-knight battle fantasy or alley scene. The character must have visible empty hands, a defensive stance, no handheld object, no uniform copy, no cape-hero silhouette, no jewel sword silhouette, no prop centered in the composition, no deep vanishing-point lane, and no walkable road/hallway/corridor behind them. Avoid Tokyo Tower, recognizable city landmarks, street-corridor perspective, alley, road, sidewalk, hallway, shrine corridor, responder team, handheld staff, spear, blade, sword, wand, weapon, ritual rod, literal monster-vine attack, readable talismans, gore, market/library corridor, camera prop, or empty red-green texture.',
    'SP05-181':
      'A zodiac warmth-and-grief shojo style-card with one original tender character in a quiet healing gesture: cream/peach halation, tea-brown softness, spring-green haze, subtle zodiac constellation or origami motif, kind-eyed microacting, cotton-matte textures, and emotional safety. Reference lineage: Natsuki Takaya healing shojo tenderness, early-2000s soft romance anime restraint, gentle manga screentone emotion, and seasonal iyashikei warmth, without copying any franchise, artist, studio asset, zodiac character design, logo, or named character. Must read as healing warmth with grief under it, not generic pastel portrait. Avoid literal animal transformation, family embrace scene, zodiac wheel with readable labels, classroom/cafe/hallway default, market/library corridor, camera prop, or object-only constellation card.',
    'SP05-182':
      'A black-lace apartment-heartbreak josei anime style-card with one original adult fashion-forward singer or artist figure: slim angular pose, black lace/leather contrast, wine-red anchor, smoky mauve night light, silver jewelry accents without logos, low amber practical glow, and intimate performance-vs-heartbreak tension. Reference lineage: Ai Yazawa fashion-drama linework, josei manga glamor restraint, punk-lace editorial silhouette, and mature early-2000s anime nightlife mood, without copying any franchise, artist, studio asset, brand, logo, or named character. Must read as adult fashion heartbreak, not pastel shojo confession or generic idol stage. Avoid school uniform, brand marks, readable posters, microphone as required prop, cigarette glamor, bedroom/cafe default, market/library corridor, camera prop, or object-only lace still life.',
    'SP05-183':
      'A shy daylight-bloom romance anime style-card with one original soft-spoken character shown through posture and social distance, not glamour face: side profile or three-quarter small gesture, an off-frame friendly hand or second silhouette only as spacing cue, cream field, pale sky blue, blush pink accent, fine soft contour, cautious negative space, and sincere microexpression. Reference lineage: Karuho Shiina gentle romance manga, Production I.G clean sincerity, early-2010s soft shojo lighting, and friendship-circle emotional distance grammar, without copying any franchise, artist, studio asset, uniform, logo, or named character. Must read as social-anxiety thaw and daylight sincerity, not generic cute pastel face or solo beauty portrait. Avoid close glamour face, hallway/classroom requirement, school-uniform copy, paired confession staging, cherry-blossom default, readable letters, market/library corridor, camera prop, lamp/curtain filler, or empty blush-gradient card.',
    'SP05-184':
      'A theatrical host-club comedy shojo style-card with one original charismatic greeter and two soft reaction silhouettes as graphic halos: champagne cream, rose pink, black tuxedo accents, ornate sparkle timing, playful fourth-wall charm, and elegant gag rhythm. Reference lineage: Bisco Hatori comedic shojo timing, Bones mid-2000s polished ensemble energy, Takarazuka theatrical posture, and early-2000s shojo club-room exaggeration, without copying any franchise, artist, studio asset, uniform, logo, or named character. Must read as witty theatrical hospitality and ensemble comedy, not generic pretty anime romance. Avoid literal host club lineup, rose bouquet, ballroom, school hallway, cafe table, lamp/chandelier filler, camera prop, readable signage, or empty champagne sparkle card.',
    'SP05-185':
      'A punk-luxe backstage fashion-drama anime style-card with one original fashion-forward figure adjusting a structured garment: black plum, hot magenta, silver chain glints, runway-shadow diagonals, angular josei linework, and bittersweet glamour restraint. Reference lineage: Ai Yazawa fashion-drama line discipline, Madhouse mid-2000s music-fashion mood, Harajuku punk-luxe tailoring, and editorial runway silhouette language, without copying any franchise, artist, studio asset, brand, logo, or named character. Must read as music/fashion heartbreak with adult attitude, not catalog model, idol stage, or generic glamour portrait. Avoid white photo studio, mannequin, brand marks, microphone requirement, breakup literalism, camera prop, readable posters, lamp/curtain filler, or object-only clothing still life.',
    'SP05-186':
      'A height-contrast romcom banter anime style-card with two same-age original peers in casual everyday clothes, one tall lanky silhouette and one shorter sharp-tongued silhouette, locked in elastic reaction timing: warm apricot, teal accent, crisp TV-shojo cel lines, asymmetrical body-language scale, comic timing sparks, and Kansai-manzai energy. Reference lineage: Aya Nakahara romantic-comedy manga rhythm, Toei late-2000s TV-shojo bounce, early-2000s banter framing, and expressive proportion contrast, without copying any franchise, artist, studio asset, uniform, logo, or named character. Must read as lively peer-scale banter and awkward comedy, not idol duo, magical-girl pair, child/adult contrast, or pastel confession romance. Avoid idol outfit, giant ribbon/bow, frilly costume, magical-girl silhouette, classroom or hallway default, literal height-measuring gag, couple embrace, school-uniform copy, lamp/cafe filler, camera prop, readable signs, or solo pretty portrait.',
    'SP05-187':
      'A showbiz persona-theater shojo style-card with one original performer caught between public mask and private resolve: violet spotlight slice, gold stage dust, black ribbon tension, half-mask emblem, dynamic manga acting, and melodrama-with-comedy edge. Reference lineage: Yoshiki Nakamura showbiz shojo intensity, Hal Film Maker late-2000s performance drama, theatrical mask/persona grammar, and TV-anime rehearsal energy, without copying any franchise, artist, studio asset, costume, logo, or named character. Must read as performer identity transformation, not generic idol concert. Avoid front-facing idol stage, crowd/audience, audition room, microphone as required prop, readable marquee, camera prop, lamp filler, or empty spotlight abstraction.',
    'SP05-188':
      'A high-status rain-confrontation shojo style-card with two original figures arranged by vertical social pressure in a compressed close-to-mid crop: navy tailoring, ivory highlights, cold rain sheen on fabric, abstract glass-panel bars, 90s cel melodrama shadows, and status-line composition. Reference lineage: Yoko Kamio status shojo tension, Toei mid-1990s drama staging, J-drama/K-drama melodrama contrast, and elite-romance graphic hierarchy, without copying any franchise, artist, studio asset, uniform, logo, or named character. Must read as class-pressure romance conflict through posture, tailoring, rain, and hierarchy, not palace romance, gothic heir portrait, or campus luxury postcard. Avoid palace, castle, cathedral, balcony, gothic spires, wealthy school hallway, limo, ballroom, literal rose storm, rose brooch, chandelier/lamp filler, camera prop, readable signage, or generic pretty couple confession.',
    'SP05-189':
      'A dusk time-memory teen drama anime style-card with one original character holding a sealed unreadable letter away from the face: amber sunset, lilac shadow, soft film haze, restrained tear-bright eyes, delayed-message tension, and quiet temporal melancholy. Reference lineage: Ichigo Takano memory-drama manga, Telecom mid-2010s soft teen color, post-2010 shojo restraint, and letter-as-emotional-distance staging, without copying any franchise, artist, studio asset, uniform, logo, or named character. Must read as time-memory regret and hope, not generic sunset confession. Avoid readable letter text, letter-only closeup, classroom, station platform repeat, hallway, lamp/window filler, camera prop, cherry-blossom default, or solo glamour face.',
    'SP05-190':
      'A modern airy blue-sky shojo style-card with two original same-age figures almost crossing paths in clean negative space: pale cyan, white shirts as soft shape blocks, wind-lifted hair, restrained blush accent, minimal contour, and quiet unresolved distance. Reference lineage: Io Sakisaka modern shojo restraint, Production I.G clean teen-drama sincerity, mid-2010s airy color design, and near-miss body-language grammar, without copying any franchise, artist, studio asset, uniform, logo, or named character. Must read as emotional distance and second-chance hesitation, not generic pretty anime portrait. Avoid close glamour face, school hallway/classroom, copied uniform, confession pose, station platform repeat, lamp/window filler, camera prop, readable signage, or cherry-blossom default.',
    'SP05-191':
      'A grounded night-intimacy shojo style-card with two original figures in cautious proximity inside one warm amber pool of light: deep navy, soft rainless pavement sheen, muted casual coats, hesitant hand distance, sparse city bokeh, and quiet realism. Reference lineage: Kanae Hazuki contemporary shojo realism, Zexcs early-2010s grounded romance mood, streetlamp-intimacy cinema, and restrained microacting, without copying any franchise, artist, studio asset, uniform, logo, or named character. Must read as quiet trust forming at night, not rainy confession, umbrella romance, or glossy idol portrait. Avoid umbrella, heavy rain, alley/corridor, classroom, phone/camera prop, lamp-post as giant object, readable signs, crowd, or generic couple embrace.',
    'SP05-192':
      'A secret-identity romcom anime style-card with one original strict-and-flustered character in modest blazer-like everyday clothes, visually split between disciplined posture and hidden service-persona energy through abstract apron-shaped white graphic panels behind them, not worn as an outfit: crisp high-key lighting, coral blush, navy/white contrast, small comedic stress marks without readable text, and early-2010s TV-shojo polish. Reference lineage: Hiro Fujiwara secret-identity romcom rhythm, J.C.Staff 2010 high-key comedy finish, student-council vs service-persona contrast, and sharp fluster acting, without copying any franchise, artist, studio asset, maid outfit, uniform, logo, or named character. Must read as hidden-persona comedy through posture, blush, and graphic split, not maid-cafe illustration, changing-room scene, or generic cute server. Avoid wearing maid outfit, maid cafe, tray/cup focus, council desk, classroom/hallway, copied uniform, frilly costume, exposed-thigh fetish framing, dressing-room mirror, wall lamp, curtain, camera prop, readable menu/sign, lamp filler, or object-only costume card.',
    'SP05-193':
      'A botanical court-fantasy shojo style-card with one original herbalist traveler holding a small unlabeled glass vial near linen folds and leaf silhouettes: soft cream, medicinal green, copper hair accent, clean adventure-romance lines, and gentle apothecary competence. Reference lineage: Sorata Akizuki botanical fantasy manga, Bones mid-2010s court-fantasy clarity, herbalist-adventure color restraint, and soft noble-world staging, without copying any franchise, artist, studio asset, royal crest, logo, or named character. Must read as capable herbalist fantasy, not princess castle romance. Avoid castle, throne, palace hallway, royal gown, prince rescue, garden corridor, readable vial label, camera prop, lamp/chandelier filler, or object-only herb still life.',
    'SP05-194':
      'A 1970s operatic revolutionary shojo style-card with one original androgynous lace-and-uniform figure framed by abstract gold filigree and cold blue shadow: theatrical cel line, dramatic eyelashes, rose-gold tension used as graphic rhythm, formal military-lace silhouette, and tragic resolve. Reference lineage: Riyoko Ikeda operatic shojo composition, Osamu Dezaki postcard-memory staging, TMS late-1970s cel drama, and revolutionary melodrama contrast, without copying any franchise, artist, studio asset, uniform, logo, or named character. Must read as vintage operatic shojo revolution, not palace romance postcard. Avoid Versailles literal, throne room, palace corridor, duel, sword, crown, chandelier/lamp filler, readable crest, camera prop, or generic aristocrat portrait.',
    'SP05-195':
      'A handmade street-fashion shojo style-card with one original young designer figure in denim, candy-color trims, stitched accessories, and expressive handmade charm: lemon, denim blue, hot pink, loose marker-like fashion line, craft confidence, and 90s neighborhood creativity. Reference lineage: Ai Yazawa early street-fashion manga energy, Toei mid-1990s colorful shojo finish, handmade accessory culture, and neighborhood fashion-school optimism, without copying any franchise, artist, studio asset, brand, logo, or named character. Must read as DIY fashion identity, not fashion catalog or Harajuku tourist postcard. Avoid literal Harajuku street signs, store display, mannequin, brand marks, readable posters, craft desk clutter, camera prop, lamp/curtain filler, or object-only accessory still life.',
    'SP05-196':
      'A quiet art-school melancholy anime style-card with one original small-scale artist figure holding posture over loose paper planes and graphite marks: spring cream, soft mint, warm gray, watercolor bloom, sketch-line tenderness, and understated josei introspection. Reference lineage: Chica Umino watercolor emotional texture, J.C.Staff mid-2000s art-school warmth, analog sketchbook softness, and josei/seinen campus melancholy, without copying any franchise, artist, studio asset, logo, or named character. Must read as fragile creative interiority through figure, paper, and light, not generic studio still life. Avoid art-desk clutter, brush/pencil pile as hero, literal classroom/taller, studio lamp, camera prop, readable drawings/text, object-only sketch tools, or empty watercolor wash.',
    'SP05-197':
      'A yokai-romcom shrine-folklore anime style-card with one original figure in flowing sleeve motion and fox-gold supernatural hint: vermilion accent, moon rim, cream fabric, playful spirit glow, elegant shojo comedy posture, and folklore ornament. Reference lineage: Julietta Suzuki yokai-romcom manga rhythm, TMS early-2010s supernatural shojo finish, shrine-folklore color grammar, and contract-comedy body language, without copying any franchise, artist, studio asset, deity design, logo, or named character. Must read as romantic folklore comedy, not shrine postcard or mascot card. Avoid central torii, literal shrine corridor, fox mascot as full subject, couple contract pose, lantern rows, readable talismans, camera prop, market/library corridor, or object-only charm still life.',
    'SP05-198':
      'A jellyfish-fashion sisterhood anime style-card with one original outsider fashion figure framed by translucent jellyfish glow and controlled makeover clutter: lavender blue, pearl white, coral frill, soft comedic vulnerability, textile layers, and compassionate transformation energy. Reference lineage: Akiko Higashimura makeover comedy manga, Brain’s Base 2010 expressive josei comedy, otaku-sisterhood warmth, and jellyfish-fashion silhouette language, without copying any franchise, artist, studio asset, logo, or named character. Must read as awkward fashion transformation with character identity, not generic cute dress-up. Avoid saturated otaku bedroom, readable posters, before/after split screen, mannequin, object-only jellyfish lamp, camera prop, room clutter dominance, or empty translucent abstraction.',
    'SP05-199':
      'A folk-fantasy journey shojo style-card with one original crimson-profile traveler in wind, sandstone dusk, and minimal guardian silhouettes behind them: warm ochre, deep crimson, teal shadow, clean adventure linework, and traveling resolve. Reference lineage: Mizuho Kusanagi journey-fantasy shojo, Studio Pierrot mid-2010s folk-adventure color, guardian-ensemble drama, and wind-carried quest staging, without copying any franchise, artist, studio asset, royal crest, logo, or named character. Must read as traveling folk-fantasy heroine energy, not princess court or battle poster. Avoid throne, royal gown, party lineup, battlefield, sword foreground, wilderness postcard, camera prop, readable banners, castle corridor, or object-only cloth card.',
    'SP05-200':
      'A rainy contemporary confession anime style-card with two original figures in shared-canopy crop, wet asphalt reflections, sodium amber rain, and one hesitant hand gesture: deep blue, muted beige coats, intimate close framing, grounded microacting, and soft adult teen realism. Reference lineage: Kanae Hazuki contemporary shojo realism, Zexcs 2012 rainy romance mood, modern street-confession cinema, and restrained hand-distance staging, without copying any franchise, artist, studio asset, uniform, logo, or named character. Must read as rainy hesitant confession, distinct from dry night-walk intimacy. Avoid umbrella-only still life, classroom/hallway, station platform repeat, generic streetlamp hero object, readable signs, camera prop, couple embrace, over-glossy idol portrait, or empty rain texture.',
    'SP05-201':
      'A quiet observational mystery anime style-card with one original curious protagonist noticing a tiny clue under tea-amber side light: polished restraint, pale beige and moss green, precise eye-line acting, clean KyoAni-like spatial calm, and subtle deduction energy. Reference lineage: Hyouka-style quiet mystery mood, Kyoto Animation 2010s polish, Yasuhiro Takemoto-era observational pacing, and refined clue-light composition, without copying any franchise, artist, studio asset, uniform, logo, or named character. Must read as gentle intellectual curiosity through face, posture, and clue-light, not library/book still life. Avoid library shelves, book stacks, clubroom literal, desk lamp as hero, readable notes/text, magnifying glass, camera prop, object-only teacup, or generic pretty anime closeup.',
    'SP05-202':
      'A neighborhood-community warmth anime style-card with one original cheerful character in a small ritual of shared hospitality: mochi-cream softness, paper accents, warm storefront-like glow as abstract shapes, friendly neighbor silhouettes, and Naoko Yamada-style body-language tenderness. Reference lineage: Tamako Market community warmth, Kyoto Animation 2010s neighborhood slice, Naoko Yamada gentle gesture grammar, and soft festival-paper color rhythm, without copying any franchise, artist, studio asset, mascot, logo, or named character. Must read as local community kindness, not market aisle or food still life. Avoid market corridor, storefront signage, mascot bird, mochi prop as sole subject, pendant lantern rows, readable labels, camera prop, crowd clutter, or empty pastel decor.',
    'SP05-203':
      'A bright youth-expedition anime style-card with one original protagonist leaning forward into departure light: sky-heavy horizon, cold white and expedition orange, glove/strap hints, wind-pulled posture, and hopeful challenge energy. Reference lineage: A Place Further Than the Universe expedition-drama clarity, Madhouse 2018 youth adventure color, high-horizon departure staging, and friendship courage rhythm, without copying any franchise, artist, studio asset, uniform, logo, or named character. Must read as youth expedition resolve, not travel poster or gear pile. Avoid map, compass, station platform, airport/train corridor, uniform copy, backpack pile, empty sky postcard, camera prop, readable ticket/sign, or object-only travel gear.',
    'SP05-204':
      'A tranquil iyashikei water-light anime style-card with one original calm figure framed by oval reflective underlight and pearl haze: aqua teal, warm cream, soft blue shadow, floating stillness, slow healing posture, and canal-like flow expressed as abstract light bands. Reference lineage: Aria-style healing anime, Junichi Sato iyashikei pacing, Hal Film Maker softness, and gentle Aqua-world reflective color, without copying any franchise, artist, studio asset, uniform, logo, or named character. Must read as serene restorative drift with a figure, not literal gondola/canal postcard. Avoid gondola, canal city panorama, boat as hero, water-only reflection, lamppost rows, market/library corridor, camera prop, readable signs, or empty shimmer abstraction.',
    'SP05-205':
      'An island-summer creative restart anime style-card with one original character in a warm reset gesture surrounded by broad abstract ink-drag shapes woven into wind, clothing edges, and sunlit paper tooth, never as glyphs or writing: summer green, sea-blue edge, rough black non-letter brush rhythm, friendly comedy warmth, and handmade imperfection. Reference lineage: Barakamon-style island comedy, Kinema Citrus 2014 warm restart mood, calligraphy-brush slice-of-life texture, and rural summer air, without copying any franchise, artist, studio asset, logo, or named character. Must read as creative restart through figure, abstract ink rhythm, and summer warmth, not calligraphy display or brush-tool still life. Avoid readable kanji, fake letters, glyphs, symbols, calligraphy sheets, hanging scrolls, wall banners, brush as sole subject, classroom/tatami room literal, fish market, village postcard, kids crowd, camera prop, desk clutter, or object-only paper card.',
    'SP05-206':
      'An everyday-care gesture intimacy anime style-card with two original figures in close relational spacing, one careful hand gesture, cotton-cream daylight, lunchbox-red accent, mild navy, and patient practical tenderness. Reference lineage: Usagi Drop everyday-care warmth, Yumi Unita manga softness, Production I.G 2011 domestic restraint, Kanta Kamei direction, and Satoshi Yamaguchi character-design clarity, without copying any franchise, artist, studio asset, logo, or named character. Must read as responsible care through hands, posture, and small routine detail, not parent-child scene literalism or object still life. Avoid daycare/classroom, child-only portrait, lunchbox as sole subject, apartment room formula, school bag pile, readable notes, camera prop, lamp/couch staging, or generic cozy anime face.',
    'SP05-207':
      'A deadline-cheer workflow density anime style-card with one original coordinator under optimistic overtime pressure: quick reaction silhouette, unreadable storyboard panels as graphic shapes, sticky-note yellow accents, cool monitor blue, coffee-brown warmth, and controlled task-layer rhythm. Reference lineage: Shirobako production-workday energy, P.A. Works workplace clarity, Tsutomu Mizushima deadline-comedy timing, and Ponkan8 light character appeal, without copying any franchise, artist, studio asset, logo, or named character. Must read as collaborative production hustle through posture, layered panels, and upbeat stress, not office desk clutter. Avoid readable checklists/text, monitor UI, desk as hero, coffee cup still life, scooter, studio corridor, cubicle panorama, camera prop, paper-stack object-only card, or generic business anime.',
    'SP05-208':
      'A beginner-made DIY glow anime style-card with one original maker character mid-build, cheerful imperfect posture, sanded-wood beige, glue-white highlight, mint hardware accents, cloth scraps, tape-edge shapes, and warm process light. Reference lineage: Do It Yourself!! handmade club warmth, Pine Jam 2022 tactile optimism, Kazuhiro Yoneda direction, and Yusuke Matsuo rounded character-design charm, without copying any franchise, artist, studio asset, logo, or named character. Must read as earnest handmade construction through figure, material traces, and friendly process, not tool catalogue or workshop still life. Avoid saw/tool foreground, power tools, hardware store aisle, desk object pile, classroom/workshop corridor, readable labels, camera prop, wood-only material card, or generic craft-room anime.',
    'SP05-209':
      'A sugar-cotton hospitality miniature anime style-card with one original tiny-world host character, rounded service gesture, whipped-cream white, strawberry pink, mint accent, caramel shadow, lace-like trim, plush texture, and compact symmetrical warmth. Reference lineage: Is the Order a Rabbit? sugar-cotton moe hospitality, Koi manga decorative cuteness, White Fox and Kinema Citrus TV softness, and Hiroyuki Hashimoto gentle cafe-comedy direction, without copying any franchise, artist, studio asset, uniform, logo, or named character. Must read as plush welcoming hospitality through character scale, decorative symmetry, and soft dessertlike color, not cafe counter still life. Avoid teacup/dessert as sole subject, cafe aisle, menu/signage, maid uniform copy, rabbit mascot, market/library corridor, readable labels, camera prop, or generic pink moe portrait.',
    'SP05-210':
      'A sunshine-scribble soft-geometry anime style-card with one original relaxed creative character reduced into warm paper cutout geometry, soft coral and mint blocks, graphite line wobble, flat Shaft-like offset framing, doodle-edge texture, and low-pressure comedy. Reference lineage: Hidamari Sketch sketchbook warmth, Ume Aoki soft geometric character language, Shaft 2000s flat-composition play, and Akiyuki Shinbo cozy graphic timing, without copying any franchise, artist, studio asset, logo, or named character. Must read as warm sketchbook geometry through character silhouette, paper-light fields, and playful abstraction, not cozy room portrait or art-supply still life. Avoid literal sketchbook as hero, dorm-room formula, school desk, lamp, mug, plant, plush toy, shelf, furniture corner, pencil pile, readable doodles/text, camera prop, empty abstract geometry, or generic pastel anime face.',
    'SP05-211':
      'A utilitarian quiet-freedom minimalism anime style-card with one original self-possessed character beside a compact functional silhouette implied by matte metal/rubber planes, cold morning blue, dry asphalt beige, broad open negative space, and one restrained independence gesture. Reference lineage: Super Cub quiet-freedom minimalism, Tone Koken ordinary-road restraint, Studio Kai 2021 calm utility finish, and Toshiro Fujii direction, without copying any franchise, artist, studio asset, vehicle design, logo, or named character. Must read as practical freedom through spare framing, utility texture, and quiet posture, not bike advertisement or road postcard. Avoid motorcycle/bicycle as sole subject, brand-like vehicle, highway vista, school uniform copy, garage, parking lot, map/compass, readable signs, camera prop, desk clutter, or generic cozy anime face.',
    'SP05-212':
      'An immaculate social-jitter comedy anime style-card with one original polished character frozen in overpolite anxiety: pristine white/navy shapes, blush beat, chalk-dust specks as abstract pressure, huge polite negative space, and precise awkward body language. Reference lineage: Komi-style silent social comedy, Tomohito Oda pristine gag timing, OLM 2020s clean anime finish, and Kazuki Kawagoe social-pressure direction, without copying any franchise, artist, studio asset, uniform, logo, or named character. Must read as beautiful nervous silence and social-jitter comedy, not classroom/chalkboard literalism. Avoid readable chalk/text, blackboard as hero, classroom corridor, school desk rows, notebook/letter prop, speech bubbles, camera prop, generic pretty-anime closeup, or empty white abstraction.',
    'SP05-213':
      'A shift-comedy choreography warmth anime style-card with two original coworkers crossing a practical handoff arc: diner cream, menu red as abstract accent, black-white costume contrast, warm pass-through glow, comic reaction timing, and clear ensemble blocking. Reference lineage: Working!! workplace ensemble comedy, Karino Takatsu service-rhythm manga, A-1 Pictures 2010s warm sitcom finish, and Yoshimasa Hiraike timing, without copying any franchise, artist, studio asset, uniform, logo, or named character. Must read as coordinated shift banter through handoff motion and reaction rhythm, not restaurant still life. Avoid tray/plate as sole subject, menu readable text, cafe counter panorama, kitchen corridor, customer crowd, maid uniform copy, camera prop, lamp row, or generic workplace anime.',
    'SP05-214':
      'A breeze-drift beautiful inertia anime style-card with one original low-energy character suspended in airy pause: pale sky blue, soft gray, spring green, relaxed silhouette collapse, drifting contour lines, broad quiet negative space, and elegant near-motionless comedy. Reference lineage: Tanaka-kun sleepy inertia, Nozomi Uda gentle character comedy, Silver Link 2016 airy slice-of-life finish, and Shin ya Kawatsura pause-centric direction, without copying any franchise, artist, studio asset, uniform, logo, or named character. Must read as beautiful low-energy pause and ambient friendship, not nap scene stock image. Avoid sleeping pose as sole concept, classroom/bench literal, bed/couch, desk, cafe, lamp, pillow prop, camera prop, school corridor, or generic pastel closeup.',
    'SP05-215':
      'A looped-routine healing pastel anime style-card with one original character tying or tracing a simple cast-line loop near reflective water light: water pastel blue, grassy green, soft coral, cork/nylon tactile hints, curved line arcs, and inherited hobby calm. Reference lineage: Slow Loop restorative hobby warmth, Maiko Uchino manga tenderness, Connect 2022 pastoral anime softness, and Noriaki Akitaya patient direction, without copying any franchise, artist, studio asset, fishing gear design, logo, or named character. Must read as healing through repeated waterside routine, curved line paths, and practical tenderness, not garden craft or fishing-gear postcard. Avoid knitting, sewing, yarn basket, garden patio, potted plant cluster, fishing rod as hero, lure/fish object-only card, river panorama, dock/camp scene, sibling literalism, readable tackle labels, camera prop, market/library corridor, or generic outdoor anime portrait.',
    'SP05-216':
      'A bundled warmth-pocket anime style-card with one original bundled character holding shared orange heat inside a broad cold-blue field: quilted padding, fleece cream, pine green, star indigo, soft vapor edges, and circular comfort composition. Reference lineage: Laid-Back Camp cold-warm comfort, Afro manga outdoor gentleness, C-Station 2018 cozy travel finish, and Yoshiaki Kyogoku calm direction, without copying any franchise, artist, studio asset, campsite design, logo, or named character. Must read as deliberate warmth in cold space through body posture, textile texture, and heat glow, not camping equipment postcard. Avoid tent/stove/flame as hero, food closeup, campfire scene, mountain panorama, brand-like gear, lantern row, camera prop, readable labels, or generic cozy anime face.',
    'SP05-217':
      'A rough-ideation motion overlay anime style-card with one original inventor-dreamer character surrounded by unreadable cutaway boxes, graphite scratch lines, marker red/yellow sparks, cardboard mockup planes, and kinetic invention arrows. Reference lineage: Eizouken rough imagination energy, Sumito Owara sketch invention, Science SARU elastic animation language, and Masaaki Yuasa preproduction-motion play, without copying any franchise, artist, studio asset, machine design, logo, or named character. Must read as ideas being invented live through sketch overlays and cutaway motion, not desk sketchbook still life. Avoid readable annotations/text, storyboard pages as hero, classroom clubroom, desk pile, robot/mecha copy, camera prop, blueprint UI, or generic art-supply anime.',
    'SP05-218':
      'An incremental-ascent confidence anime style-card with one original character stepping upward through crisp air and supportive light: high-altitude blue, pine green, sunlit ochre, practical strap hints, rosy effort highlight, and route-like diagonal composition. Reference lineage: Yama no Susume small-progress outdoor warmth, Shiro manga sincerity, 8bit clean hobby-anime clarity, and Yusuke Yamamoto uplift direction, without copying any franchise, artist, studio asset, outfit design, logo, or named character. Must read as confidence gained in small steps through upward rhythm and bright reveal light, not mountain postcard. Avoid summit panorama, gear pile, map/compass, hiking pole as hero, schoolgirl uniform copy, trail sign text, camera prop, cliff danger, or generic outdoor anime portrait.',
    'SP05-219':
      'A mundane absurdist theater anime style-card with two original characters staging dead-serious nonsense in plain daylight: neutral gray, navy anchors, cheap plastic accent, awkward underplayed poses, reaction-pop geometry, and banal stage framing. Reference lineage: Daily Lives of High School Boys deadpan ensemble comedy, Yasunobu Yamauchi dry gag manga, Sunrise 2012 low-budget absurd timing, and Shinji Takamatsu underplayed direction, without copying any franchise, artist, studio asset, uniform, logo, or named character. Must read as dry everyday absurdism through body language and banal staging, not school hallway stock scene. Avoid hallway/classroom as default, riverbank postcard, blazer-copy uniforms, readable signs/text, prop-only gag object, camera prop, crowd clutter, or generic cute anime comedy.',
    'SP05-220':
      'An observational watercolor drift anime style-card with one original quiet observer noticing a tiny mundane detail in warm afternoon wash: watercolor cream, dusty pastel, muted foliage green, soft ink edges, paper grain, and nearly plotless curiosity. Reference lineage: Sketchbook Full Colors observational calm, Totan Kobako gentle noticing manga, Hal Film Maker soft anime wash, and Yoshimasa Hiraike relaxed direction, without copying any franchise, artist, studio asset, logo, or named character. Must read as tiny noticing and watercolor comfort through gaze, small detail, and paper texture, not art-club or cat postcard. Avoid sketchbook as hero, cats as sole subject, art supplies, classroom/clubroom, town-street panorama, readable notes/text, camera prop, plant shelf formula, or generic pastel closeup.',
    'SP05-001':
      'A retro pioneer hero anime style-card with one original optimistic retro-TV protagonist silhouette and a simple emblematic uplift pose: sun-warmed primaries, thick confident contours, rounded 70s/early-80s shape language, stepped cel shadows, mild acetate shimmer, and hand-painted matte backdrop. Reference lineage: early television anime optimism, Osamu Tezuka-era iconic simplification, Toei/Nippon Animation broadcast cel charm, and pre-digital registration softness, without copying any franchise, artist asset, logo, costume, robot, or named character. Must read as reusable retro-pioneer grammar through warm analog cel color, bold contour clarity, and earnest iconic staging, not generic modern anime hero. Avoid fixed boy-hero adventure scene, sidekick, robot as hero, cockpit, broadcast frame border, weapon, readable text, camera prop, corridor/market/library drift, or polished digital sakuga.',
    'SP05-002':
      'A vintage mechanical grandeur anime style-card with one original monumental machine-totem or armored silhouette in low-angle retro cel massing: saturated super-robot primaries, steel neutrals, hot warning red blocks, riveted panels, chrome edge highlights, chunky silhouette blocking, and launch-vector drama. Reference lineage: 1970s super robot broadcast grandeur, Go Nagai / Toei mechanical spectacle cues, Mazinger-era heroic massing, and analog cel compositing, without copying any franchise, artist asset, robot face, cockpit, logo, or named character. Must read as vintage mechanical grandeur through riveted scale and triumphant cel machinery, not modern mecha poster. Avoid literal launch bay, pilot portrait, cockpit UI, copied robot head, weapon-first pose, readable insignia/text, camera prop, corridor/market/library drift, photoreal metal, or noisy debris storm.',
    'SP05-003':
      'A jazzy rogue heist rhythm anime style-card with one original sly adult rogue in vintage cel timing: charcoal night, amber streetlight as abstract edge glow, muted turquoise, cream poster accents, wet reflection slashes, oblique framing, and a half-smile double-intention gesture. Reference lineage: Lupin-era jazzy caper anime, Monkey Punch graphic cool, 1970s-1980s telecine grain, and dry heist comedy timing, without copying any franchise, artist asset, costume, car, gun, logo, or named character. Must read as jazzy rogue rhythm through silhouette, swing, noir color, and trickster acting, not literal robbery scene. Avoid alley/corridor chase, safe/vault, gun, cigarette as hero, police badge, trenchcoat cliche, readable signs/text, camera prop, market/library drift, or generic handsome detective portrait.',
    'SP05-004':
      'A melancholy astral opera anime style-card with one original noble figure or relic silhouette in long-axis cosmic solitude: deep indigo, aged gold, wine red, desaturated star grey, broad cape-like drape or fabric plane, lateral cel key light, analog grain, and monumental empty scale. Reference lineage: Leiji Matsumoto romantic space opera, 1970s-1980s astral melodrama, noble twilight heroism, and premium retro cel lyricism, without copying any franchise, artist asset, ship, train, uniform, logo, or named character. Must read as astral opera through noble loneliness, drape, antique metal, and vast scale, not literal space captain fan art. Avoid pirate captain silhouette, starship bridge, cockpit/window wall, literal train corridor, gun/weapon, copied cape costume, readable insignia/text, camera prop, market/library drift, or hard sci-fi UI.',
    'SP05-005':
      'A grounded tactical machinery anime style-card with one original heavy functional machine silhouette or practical field figure shaped by logistics: muted olive, dusty earth, matte steel, tiny risk-red marks, scratched panels, canvas straps, dry hard light, and layered tactical mass. Reference lineage: Ryosuke Takahashi real-robot grounded machinery, VOTOMS-era utilitarian mecha weight, 1980s operational anime grit, and documentary hardware clarity, without copying any franchise, artist asset, cockpit, unit insignia, weapon, logo, or named character. Must read as grounded tactical machinery through function, wear, and logistics, not generic battlefield action. Avoid battlefield panorama, soldiers squad, gun as hero, tank, map UI, cockpit screen, real military insignia, gore, readable labels/text, camera prop, corridor/market/library drift, or sterile 3D render.',
    'SP05-006':
      'A pop transformable aerial spectacle anime style-card with one original pop-tech icon silhouette suspended in rising performance energy: magenta show light, electric cyan, pearl white, chrome accents, sequined textile hints, translucent panel rhythm, bright retro cel rim, and transformation-flight framing. Reference lineage: 1980s pop mecha/anime spectacle, Macross-era idol-tech hybrid energy, Studio Nue/Artland broadcast gloss, and emotional aerial climax staging, without copying any franchise, artist asset, idol costume, aircraft design, cockpit, logo, or named character. Must read as pop-transformable aerial spectacle through ascent, chrome showlight, and hybrid performance engineering, not concert/idol stock image. Avoid literal concert stage, microphone as hero, cockpit, aircraft as sole subject, dogfight, idol fan pose, readable signage/text, camera prop, corridor/market/library drift, or glitter micro-noise.',
    'SP05-007':
      'A wasteland-impact legend anime style-card with one original hardened survivor silhouette built from broad pressure shapes rather than recognizable martial-hero likeness: scorched ochre sky, black ink mass, rust-red accent cloth, cracked leather-like texture, dry sun glare, and monumental stillness before impact. Reference lineage: 1980s martial apocalypse manga, Tetsuo Hara-style muscular pressure, Buronson-era survival melodrama, and Toei analog cel heat, without copying any franchise, artist asset, costume, hair, face, logo, or named character. Must read as brutal wasteland body-language and material weight, not a famous post-apocalyptic hero portrait. Avoid spiky black hero hair, torn sleeveless gi, exact chest-scar/body pattern, leather-strap cosplay, shoulder-pad villain design, direct Hokuto/Kenshiro likeness, fist-forward attack pose, gore, named-symbol marks, readable text, camera prop, market/library corridor, or noisy rubble storm.',
    'SP05-011':
      'A generational aura-clash anime style-card with one original rival-protagonist silhouette in a broad power-pressure standoff: angular 90s cel line, asymmetrical costume color blocking, yellow-blue-red aura split as large clean planes, intense eye-line, and compressed confrontation framing. Reference lineage: Yoshihiro Togashi tournament tension, Dragon Ball-era power-up scale, 1990s shonen cel contrast, and rival-generation melodrama, without copying any franchise, artist asset, costume, hair, face, logo, spirit beast, or named character. Must read as 90s aura rivalry through pose, color pressure, and cel contrast, not a specific anime hero. Avoid spiky black-blue hair silhouette, forehead-point hair shape, school/tournament uniform copy, spirit monster head behind the hero, jewel brooch, cape-sash hero costume, hand-reaching poster cliche, copied Togashi/DBZ character face, rubble storm, weapon, readable text, camera prop, or generic aura wallpaper.',
    'SP05-012':
      'A sparkling magical-chorus anime style-card with one original magical ensemble lead in a clean choreographic transformation beat: pearl-pink and lilac color script, ribbon arcs as broad motion bands, star-flower geometry, satin cel highlights, graceful group-energy composition, and hopeful 90s shojo glow. Reference lineage: Naoko Takeuchi fashion-glamour illustration, Ikuko Itoh transformation polish, 1990s Toei magical-girl chorus staging, and classic shojo magazine sparkle, without copying any franchise, artist asset, costume, hairstyle, mascot, symbol, logo, or named character. Must read as radiant magical chorus and team hope, not a Sailor-style character card. Avoid crescent moons, sailor collar, twin buns, forehead tiara, exact wand/brooch copy, winged mascot, pearl belt overload, recognizable school uniform, palace platform, readable symbols/text, camera prop, market/library corridor, or dense glitter micro-noise.',
    'SP05-321':
      'An ether-wisp gothic ornament anime style-card with one original elongated spectral figure dissolving into calligraphic ink wisps, antique gold voids, moon-silver haze, dried rose accents, silk translucency, and feather-light melancholy. Reference lineage: Yoshitaka Amano ethereal fantasy illustration, Final Fantasy-era fine-art anime ornament, antique-gold airbrush mist, and celestial gothic void composition, without copying any franchise, artist asset, character, costume, wing design, logo, or named character. Must read as Amano-like spectral ornament through line, elongation, void, and gilded mist, not generic fantasy angel or dark cathedral scene. Avoid wings as hero, sword, armor, throne, cathedral corridor, readable sigil/text, angel copy, modern streetwear, camera prop, hard-background realism, or empty abstract mist.',
    'SP05-322':
      'A celestial vertical ornament anime style-card with two original poised figures woven into one cathedral-tall black-white-red composition: long elegant anatomy, lacquer-black hair ribbons, ivory cloak planes, sparse crimson flower geometry, thin gold frame arcs, asymmetric negative space, and emotional distance. Reference lineage: CLAMP supernatural vertical elegance, Mokona decorative fashion geometry, X/xxxHolic-era elongated manga poise, and high-contrast decorative character illustration, without copying any franchise, artist asset, costume, logo, or named character. Must read as CLAMP-like vertical ornament through silhouette, long hands, manga line, and graphic negative space, not pastel moon-jewel glamour. Avoid moon backdrop, crystal curtains, pearl bead overload, pink magical-girl palette, copied school uniform, card-captor staff, tarot/card symbols, readable sigils/text, casual modern outfit, thick comic inking, camera prop, palace/cathedral corridor, or empty jewel abstraction.',
    'SP05-323':
      'A prism-glamour transformation polish anime style-card with one original romantic magical-fashion heroine against a clean blush-to-midnight aura field: flowing pink hair, ivory couture bodice, navy velvet accents, rose-gold ribbon spiral, pearl cosmetic glow, heart-shaped light rhythm, and graceful transformation posture. Reference lineage: Naoko Takeuchi moon-prism glamour, 1990s shojo fashion illustration, polished magical-girl romance, and celestial diary-heart tenderness, without copying any franchise, artist asset, brooch design, uniform, logo, moon symbol, or named character. Must read as Takeuchi-like romantic prism glamour through fashion-beauty framing, soft face, ribbon rhythm, and disciplined sparkle, not CLAMP vertical ornament or generic idol portrait. Avoid giant moon backdrop, crystal curtain set, jewelry overload, sailor uniform copy, moon wand/brooch copy, pose callout, readable symbols/text, heavy armor, gritty realism, camera prop, stage spotlight, palace/cathedral corridor, dressing-table still life, or dense fine-noise glitter.',
    'SP05-324':
      'An elastic rom-com slapstick anime style-card with two original characters in a bright affection-argument beat: candy red, sky blue, clean cel paint, elastic reaction scale, simple comedic exaggeration, and instantly readable silhouettes. Reference lineage: Rumiko Takahashi rom-com elasticity, 1980s-1990s TV-animation bounce, lively expression marks, and affectionate chaos timing, without copying any franchise, artist asset, uniform, weapon, logo, or named character. Must read as classic elastic rom-com slapstick through pose, reaction, and cel clarity, not generic shonen fight. Avoid martial-arts weapon focus, object-hit violence, copied character designs, school hallway default, readable SFX/text, cinematic blur, gritty texture, camera prop, or static pretty portrait.',
    'SP05-325':
      'A scratchy concrete-poetry anime style-card with one original restless youth silhouette in tilted urban drift, dry-ink scribble, cement grey, faded blue, rust orange, cracked paint, photocopy grain, and sacred-ugly wall texture. Reference lineage: Taiyo Matsumoto concrete-poetry adolescence, Tekkonkinkreet-era urban roughness, uneven hand-drawn proportion, and tactile civic sketch energy, without copying any franchise, artist asset, city, logo, or named character. Must read as Matsumoto-like rough urban poetry through scratchy line, tilted scale, and concrete texture, not polished street anime. Avoid glossy polish, perfect symmetry, fantasy ornament, readable graffiti/text, rooftop postcard, bike as hero, gang pose, camera prop, corridor/market/library drift, or generic pretty anime face.',
    'SP05-326':
      'A rubber-reality sprint anime style-card with one original runner-dancer character mid-morph: elastic limbs, melting perspective, acid cyan/orange/purple blocks, rough brush taper, warped dance curve, and explosive timing shapes. Reference lineage: Masaaki Yuasa kinetic expressionism, Mind Game / Ping Pong elastic motion language, Science SARU rough animation boil, and anti-model sakuga energy, without copying any franchise, artist asset, studio asset, logo, or named character. Must read as Yuasa-like rubber reality through anatomy distortion, color rupture, and velocity-first staging, not generic shonen speed art. Avoid still pose, clean model-sheet anatomy, generic power aura, sports arena, bike/skate prop, weapon, readable SFX/text, camera prop, corridor/market/library drift, gore, or over-detailed particle noise.',
    'SP05-327':
      'A postcard-memory freeze anime style-card with one original melodrama character locked in absolute emotional pause: sepia gold, crimson rose accents, royal blue shadow, diagonal glare streaks, soft film grain, aerographed cel bloom, and symbolic flower overlay. Reference lineage: Osamu Dezaki iconic postcard memories, 1970s-1980s shojo/sports melodrama freeze frames, dramatic highlight lines, and theatrical emotional close-up direction, without copying any franchise, artist asset, studio asset, costume, logo, or named character. Must read as Dezaki-like time-stop melodrama through freeze-frame composition, glare, grain, and concentrated feeling, not modern idol polish or magical-girl sparkle. Avoid casual snapshot, pink moon glamour, crystal jewelry overload, literal stage set, palace corridor, readable text, camera prop, flat documentary light, muddy color, or generic pretty anime portrait.',
    'SP05-328':
      'A retrofuture distance-melancholy anime style-card with one original noble spacefarer silhouette and vast star-distance framing: deep navy, brass gold, wine red, velvet cape flow, aged metal panels, long horizon line, and solemn backlight. Reference lineage: Leiji Matsumoto romantic space opera, Galaxy Express / Harlock-era elongated retrofuturism, noble travel melancholy, and cel-era cosmic scale, without copying any franchise, artist asset, ship design, train design, costume, logo, or named character. Must read as Matsumoto-like cosmic farewell through long forms, aged brass, star depth, and resigned heroism, not hard-sci-fi UI clutter. Avoid cockpit screen wall, photoreal spaceship, gun/weapon focus, copied pirate captain silhouette, literal train corridor, bright candy palette, contemporary streetwear, camera prop, readable insignia/text, or shallow generic space backdrop.',
    'SP05-329':
      'A spiral panic engraving anime style-card with one original retro horror face-and-clean-hand fragment filling the card, trapped against a flat optical spiral disc: bone-white skin shapes, pitch-black ink masses, sickly mint shadows, bruise-violet halftone, screentone rasp, and corrosive engraved line pressure. Reference lineage: Kazuo Umezz classic horror manga panic, high-contrast 1960s-1970s theatrical terror, obsessive line pattern, and printed nightmare texture, without copying any franchise, artist asset, page, logo, or named character. Must read as Umezz-like graphic panic through black-white pressure, spiral distortion, and terrified shape rhythm, not generic gore horror or corridor scene. Avoid any red marks, blood, wounds, cut wrist, hallway, corridor, tunnel, path, road, stairs, realistic blood, tears of blood, body horror closeup, monster attack scene, readable panels/text/SFX, cute mascot, polished modern anime face, camera prop, market/library drift, or dense fine-noise dirt.',
    'SP05-330':
      'A folkloric deadpan ink-catalog anime style-card with one original friendly-grotesque spirit and one tiny deadpan witness silhouette: sumi black, lantern orange as small accent only, moss green, mud brown, washi bleed, brushy vernacular contour, and pseudo-documentary spacing. Reference lineage: Shigeru Mizuki yokai folklore illustration, GeGeGe-era dry humor, earthy ink catalog framing, and nocturnal rural oddity, without copying any franchise, artist asset, creature design, logo, or named character. Must read as Mizuki-like folkloric catalog through brush ink, calm oddness, and friendly grotesque logic, not cute mascot fantasy. Avoid lantern as hero, shrine/corridor/market/library scene lock, parade crowd clutter, photoreal creature rendering, glossy digital polish, neon palette, readable labels/text, camera prop, empty flat background, or generic monster portrait.',
    'SP05-331':
      'A chrome impact spectacle anime style-card with one original heroic action figure in extreme foreshortening: crisp anatomy, chrome-like highlights, steel grey, explosion orange, hero red, electric cyan rim light, clean fracture arcs, and scale-shatter perspective. Reference lineage: Yusuke Murata hyperdefined manga action, One-Punch-era polish, surgical motion clarity, and premium editorial impact frames, without copying any franchise, artist asset, costume, logo, or named character. Must read as Murata-like spectacle through anatomy precision, force compression, and glossy impact readability, not generic shonen aura. Avoid bald cape likeness, superhero logo, punch-contact violence, city rubble panorama, weapon, gore, readable SFX/text, camera prop, corridor/market/library drift, excessive debris noise, or static model pose.',
    'SP05-332':
      'A ritual allegory icon-system anime style-card with two original ceremonial figures arranged in strict symbolic symmetry: rose-crimson icon shapes, candle gold, cathedral violet, shadow navy, velvet-black negative space, mirrored hand poses, and floating abstract emblems. Reference lineage: Kunihiko Ikuhara theatrical allegory, Revolutionary Girl Utena / Penguindrum symbolic staging, ceremonial repetition, and emotion-coded visual systems, without copying any franchise, artist asset, uniform, rose crest, logo, or named character. Must read as Ikuhara-like ritual symbolism through symmetry, icon repetition, and allegorical scale shifts, not generic fantasy altar. Avoid literal duel arena, train car, school uniform copy, altar/church corridor, random prop clutter, readable symbols/text, weapon focus, camera prop, market/library drift, or low-symbolism room scene.',
    'SP05-333':
      'A quiet human naturalism anime style-card with one original person in open overcast daylight, caught in a small believable microgesture: shifting weight, sleeve tug, lowered gaze, lived-in cotton, denim blue, soft beige, rainy grey, muted green, natural skin warmth, and restrained human-scale depth. Reference lineage: Hiroyuki Okiura grounded character animation, A Letter to Momo / Jin-Roh-level body weight, observational acting, and modest natural light realism, without copying any franchise, artist asset, costume, logo, or named character. Must read as Okiura-like quiet naturalism through posture, anatomy weight, and everyday materiality, not pretty anime portrait or indoor mood scene. Avoid interior room, window frame, lamp, kitchen, doorway pose, classroom/corridor/market/library scene lock, camera prop, glamour anatomy, action pose, fantasy effects, chibi simplification, neon spectacle, or plastic 3D render.',
    'SP05-334':
      'An emergency storyboard tension anime style-card with one original anxious figure and abstract machinery pressure reduced to rough production marks: pencil grey, photocopy black, alarm orange, warning red as small arrows only, smudged graphite, blank panel crops, unreadable margin ticks, and harsh emergency-angle framing. Reference lineage: Hideaki Anno raw storyboard tension, Evangelion-era operational anxiety, production-layout urgency, and emotionally diagrammed crisis composition, without copying any franchise, artist asset, mecha design, cockpit, logo, or named character. Must read as Anno-like emergency storyboard through unfinished marks, tactical framing, and anxious diagram energy, not finished mecha poster. Avoid readable notes/text, UI panels, missiles as hero, cockpit screen wall, giant robot silhouette, military insignia, weapon focus, corridor/market/library drift, camera prop, gore, or cluttered technical fetish.',
    'SP05-335':
      'A mineral void serenity anime style-card with one original fragile translucent figure standing in vast negative space: opal white, seafoam cyan, glacial blue, quartz pink, pale gold edge light, faceted limbs, clean crystal silhouette, and matte empty terrain. Reference lineage: Haruko Ichikawa mineral minimalism, Land of the Lustrous faceted melancholy, spacious posthuman figure design, and contemplative void composition, without copying any franchise, artist asset, gem body design, costume, logo, or named character. Must read as Ichikawa-like mineral serenity through translucency, sparse posture, and open-space isolation, not generic crystal fantasy. Avoid crowded landscape, cave/corridor/market/library drift, sword or weapon, school uniform, noisy maximalism, gritty horror texture, warm muddy palette, heavy cartoon outline, opaque plastic surfaces, camera prop, or empty abstract gemstone only.',
    'SP05-336':
      'A razorline velocity poster anime style-card with one original lunging human figure compressed into a red-black-chrome speed wedge: blade-sharp ink contours, racing red planes, toxic yellow slash accents, electric blue rim, asphalt violet shadows, lacquer shine, and poster-depth distortion. Reference lineage: Takeshi Koike neon-noir velocity illustration, Redline-era razor anatomy, pulp racing poster energy, and high-contrast screenprint action, without copying any franchise, artist asset, vehicle design, logo, or named character. Must read as Koike-like velocity through cutting silhouette, hard shadows, and impossible speed, not car poster or generic shonen sprint. Avoid car, motorcycle, cockpit, steering wheel, road, racetrack, pilot helmet, weapon, gore, readable title/text, camera prop, corridor/market/library drift, or static fashion pose.',
    'SP05-337':
      'A technomagic draftsmanship burst anime style-card with one original engineer-mage figure surrounded by readable magical hardware arcs: festival orange, cobalt blue, emerald sparks, parchment cream, ruby red joints, twilight purple shadow, confident construction lines, and joyful explosion timing. Reference lineage: Yoh Yoshinari dynamic fantasy draftsmanship, Little Witch Academia / BNA-era energetic drawing, complex but legible mechanical-magic forms, and celebratory animation design, without copying any franchise, artist asset, costume, logo, or named character. Must read as Yoshinari-like technomagic through precise drawing, engineered whimsy, and burst composition, not generic fantasy fireworks. Avoid festival crowd, fireworks-only card, workshop clutter, toolbench, readable runes/text, wand or weapon as hero, school uniform copy, camera prop, corridor/market/library drift, or noisy microdetail.',
    'SP05-338':
      'An angular combustion iconography anime style-card with one original street-goth character built from triangular flame rhythm: carbon black silhouette, fire orange geometry, bone-white accents, acid lime sparks, ember red underglow, toothlike graphic cuts, clean cel edges, and mischievous grin-led focal design. Reference lineage: Atsushi Ohkubo angular character design, Soul Eater / Fire Force-era graphic combustion language, sharp triangular posing, and clean dark contrast, without copying any franchise, artist asset, uniform, logo, weapon, or named character. Must read as Ohkubo-like angular combustion through grin geometry, flame icons, and hard diagonals, not generic fire mage. Avoid scythe, gun, sword, skull logo, copied uniforms, burning people, realistic fire disaster, readable symbols/text, camera prop, corridor/market/library drift, gore, or over-rendered sparks.',
    'SP05-339':
      'An adult suspense microgesture anime style-card with one original adult character in grounded public space, caught in tiny moral-pressure acting: muted khaki, asphalt grey, skin-warm taupe, rainy blue, burgundy pin accent, tired eyes, half-turned posture, hand pausing near coat seam, and restrained natural perspective. Reference lineage: Naoki Urasawa adult suspense manga, Monster / Pluto-era human realism, procedural moral tension, and unsentimental close-up acting, without copying any franchise, artist asset, costume, logo, or named character. Must read as Urasawa-like adult suspense through microexpression, ordinary materials, and ethical pressure, not detective stock scene. Avoid office wall, file folder as hero, gun, crime-scene gore, police badge, cigarette/smoke focus, neon cyberpunk, chibi, readable documents/text, camera prop, corridor/market/library drift, or melodramatic speed lines.',
    'SP05-340':
      'A velvet-lash refined tension anime style-card with one original elegant adult figure in classic old-cel close portrait: burgundy jacket plane, ivory collar, smoky mauve shadow, navy silk accent, gold trim as thin line, warm peach skin, lash-heavy eyes, swan-neck posture, and restrained velvet background gradient. Reference lineage: Akio Sugino refined beauty anime, The Rose of Versailles / Aim for the Ace-era classic elegance, luxurious 1970s-1980s linework, and mature romantic tension, without copying any franchise, artist asset, costume, logo, or named character. Must read as Sugino-like refined glamour through lashes, posture, old-cel softness, and velvet restraint, not generic modern fantasy beauty. Avoid exposed glamour pose, moon/garden backdrop, jewelry overload, literal curtain room, throne, palace corridor, school uniform copy, copied aristocrat costume, lamp/chair/studio setup, readable text, camera prop, neon glitch, chibi proportions, or plastic 3D polish.',
    'SP05-341':
      'A mechanical warmth ensemble anime style-card with two original workwear characters sharing practical machine repair in warm industrial light: steel blue, workwear brown, ember orange, cream cloth, engine red accents, soot grey, readable bolts, worn leather, grease marks, and humanist team chemistry. Reference lineage: Hiromu Arakawa mechanical-humanist manga, Fullmetal-era robust anatomy, practical engineering detail, and warm humor/grief ensemble energy, without copying any franchise, artist asset, automail design, uniform, logo, or named character. Must read as Arakawa-like mechanical warmth through sturdy figures, legible craft, and family-coded teamwork, not sterile machine render or flat workshop stock. Avoid weapon prosthetic focus, armor villain pose, glossy sci-fi UI, isolated product shot, generic workshop wall, alchemy circle copy, readable insignia/text, camera prop, corridor/market/library drift, or cynical grimdark tone.',
    'SP05-342':
      'A reality-slip reflection continuity anime style-card with one original adult performer-like figure in sober trench coat and scarf, fractured across offset poster-glass and street-window planes: cool steel, screen blue, neutral beige, shadow plum, skin peach, tiny crimson poster accent, precise anxious face acting, mismatched reflection expressions, and seamless impossible match-cut framing. Reference lineage: Satoshi Kon psychological cinema, Perfect Blue / Millennium Actress / Paprika-era identity slippage, polished adult realism, and reflection-continuity breakage, without copying any franchise, artist asset, costume, logo, scene, or named character. Must read as Kon-like reality slip through perceptual edits, performance-memory drift, and subtle identity fracture, not generic beauty mirror portrait. Avoid exposed shoulders, low neckline, wet hair glamour, bathroom/vanity mirror, jewelry/fashion ad, hallway/corridor scene lock, mirror as only subject, literal screen wall, idol costume copy, blunt horror gore, chaotic collage, readable UI/text, camera prop, market/library drift, fantasy ornament, or obvious symbolism.',
    'SP05-141':
      'A gothic resonance punk anime style-card with one original sharp-eyed vocalist or street performer caught mid-riff: black-crimson cel blocks, white sound-wave arcs, torn poster shapes without readable text, brass mic-stand silhouette as secondary rhythm only, and angular early-2000s punk energy. Reference lineage: Atsushi Ohkubo graphic gothic action, Nana/Ai Yazawa fashion attitude, and Bones-era clean edge polish, without copying any franchise, artist asset, costume, logo, or named character. Must read as music-body resonance and punk poise, not generic dark idol. Avoid stage spotlight idol setup, literal band photo, guitar-as-product, skull logo, school hallway, alley corridor, library, market, camera prop, overbusy microdetails, or object-only music gear.',
    'SP05-145':
      'A sky-surf romantic momentum anime style-card with one original airborne rider and one visible emotional counterbalance figure or far companion: turquoise sky, coral sunset rim, cream cloud planes, wind-torn scarf shape, boardlike silhouette as motion cue, and open romantic distance. Reference lineage: Eureka Seven aerial romance, Bones 2000s clean kinetic cel, and soft adventure shojo longing, without copying any franchise, artist asset, vehicle design, logo, or named character. Must read as skyborne romance through body lean, cloud depth, and tender momentum, not generic surfer poster. Avoid beach surf scene, skateboard ramp, cockpit, literal mecha, weapon, crowd, market/library/corridor drift, camera prop, same-face idol portrait, or empty sky abstraction.',
    'SP05-156':
      'A summer loop paranoia anime style-card with one original teen or young adult in bright heat haze, turning back as if time repeated: bleached yellow sunlight, cicada-green shadow, red thread-like accent, soft cute facial design under uneasy framing, and one repeated silhouette echo behind them. Reference lineage: Higurashi-era rural suspense mood, 2000s cute-horror contrast, and Satoshi Kon repetition anxiety as broad grammar, without copying any franchise, artist asset, costume, logo, or named character. Must read as intimate loop dread through warmth plus suspicion, not gore horror or village tourism. Avoid shrine, festival mask, knife, blood, school corridor, house hallway, camera prop, market/library drift, object-only talisman, excessive noise, or generic summer romance.',
    'SP05-165':
      'A spirit pressure rivalry anime style-card with two original rivals in a compressed 1990s confrontation: teal-black shadow, hot white aura edge, purple smoke plane, clenched stance, heavy cel ink, and eye-line pressure across the frame. Reference lineage: Yu Yu Hakusho tournament tension, Togashi rival body language, Dragon Ball Z power-up staging, and 1990s Toei/Madhouse cel contrast, without copying any franchise, artist asset, uniform, logo, attack pose, or named character. Must read as spirit rivalry through opposing silhouettes and pressure, not generic aura wallpaper. Avoid arena crowd, rubble field, punch contact, weapon, named attack graphics, readable SFX/text, corridor/market/library drift, camera prop, or same shonen face as neighboring cards.',
    'SP05-281':
      'A temporal memory cinema anime style-card with one original adult character stepping through overlapping ages of the same emotional moment: warm sepia, snow-blue glints, soft red scarf accent, filmic match-cut layers, handwritten-looking shapes with no readable text, and gentle face continuity across time. Reference lineage: Satoshi Kon Millennium Actress memory cinema, Mamoru Hosoda time-emotion softness, and art-anime montage grammar, without copying any franchise, artist asset, costume, logo, scene, or named character. Must read as cinematic memory folding, not generic dream collage. Avoid film camera prop, theater seats, literal timeline UI, school corridor, library, market, excessive fragments, object-only clock, or noisy fine pattern.',
    'SP05-288':
      'An elastic summer time anime style-card with one original running or floating youth in a playful impossible time skip: flat summer cyan, melon orange, cream highlights, elongated limbs, bending horizon, and one exaggerated shadow showing delayed motion. Reference lineage: Mamoru Hosoda summer adventure warmth, Masaaki Yuasa elastic timing, and Studio Chizu lightness cues, without copying any franchise, artist asset, costume, logo, or named character. Must read as youthful elastic time and regret-light momentum, not generic sky portrait. Avoid rooftop/school jump cliche, literal clock, classroom, hallway, market/library drift, camera prop, sports race literalism, over-rendered sparkles, or empty beach landscape.',
    'SP05-298':
      'A nocturnal social whirl anime style-card with three original adults in a warm chaotic encounter spiral: midnight blue, sake-amber glow without alcohol focus, magenta laugh streak, loose street-comedy body language, and circular composition that feels spontaneous. Reference lineage: Masaaki Yuasa night-comedy motion, The Night Is Short social whirl energy, and hand-drawn adult ensemble warmth, without copying any franchise, artist asset, costume, logo, city, or named character. Must read as social chance and nocturnal comedy, not bar advertisement. Avoid pub interior, alcohol bottle hero, crowd clutter, alley corridor, market/library drift, camera prop, object-only lanterns, readable signs/text, or generic party anime.',
    'SP05-299':
      'A dream invasion carnival anime style-card with one original dream-runner figure crossing a controlled carnival of morphing masks, ribbons, animal-shadow fragments, and stylized threat-red splashes as graphic color beats: saturated red, lemon yellow, electric cyan, violet shadow, crisp Kon-like montage cuts, and one readable human anchor. Reference lineage: Satoshi Kon Paprika dream invasion, 2000s Madhouse surreal cinema, and adult-anime color montage, without copying any franchise, artist asset, costume, logo, parade scene, or named character. Must read as mind-carnival intrusion through surreal edits, danger, and character reaction, not empty psychedelic pattern. Avoid parade crowd, toy clutter, literal bed/dreamer, market aisle, library aisle, camera prop, readable signs, mascot-only card, explicit gore, injury detail, or dense fine-noise confetti.',
    'SP05-320':
      'A charismatic space rogue pulp anime style-card with one original long-coated rogue leaning into danger with a crooked smile: wine-red coat plane, antique brass star-map light, black-violet starfield, teal rim, worn leather, and 1970s-1980s cel softness. Reference lineage: Leiji Matsumoto romantic space opera, Cobra-era pulp swagger, Tsukasa Hojo adult cool, and retro sci-fi magazine drama, without copying any franchise, artist asset, costume, logo, ship design, or named character. Must read as seductive space-pulp charisma through posture and star-noir palette, not generic astronaut. Avoid lounge/bar scene, glass prop, gun/laser, cockpit UI, spaceship product shot, camera prop, market/library/corridor drift, object-only compass, or over-detailed sci-fi panels.',
    'SP05-345':
      'A nineties physical rivalry sports anime style-card with two original athletes shoulder-to-shoulder in a close body-contact stare: warm gym wood color, red cream and black uniform blocks without numbers/logos, sweat highlights, thick 1990s cel anatomy, and narrow eye-line tension. Reference lineage: Takehiko Inoue sports anatomy, Slam Dunk-era competitive heat, and Production I.G motion clarity, without copying any franchise, artist asset, jersey, logo, team, or named character. Must read as physical rivalry through anatomy, proximity, and eye duel, not generic solo athlete. Avoid hoop, ball hero, scoreboard, numbered jersey, crowd, bench, camera prop, corridor/market/library drift, object-only sneakers, or glossy modern idol face.',
    'SP05-350':
      'An aquatic relay glow anime style-card with two original swimmers or water-athletes at the instant of handoff, seen half-submerged through glowing waterline: turquoise, cobalt, coral rim, refracted cel limbs, lane-like rhythm as abstract bands, and clean relay energy. Reference lineage: Kyoto Animation water acting, Free!-era liquid polish, and sports-anime handoff tension, without copying any franchise, artist asset, uniform, logo, pool design, or named character. Must read as aquatic transition and teamwork through hands and water movement, not swimsuit glamour. Avoid poolside pose, lane-number text, goggles product shot, crowd, podium, camera prop, corridor/market/library drift, object-only water, or noisy bubble texture.',
    'SP05-352':
      'A neon trick flow anime style-card with one original trick athlete frozen in a curved low-angle motion arc: cyan-magenta concrete glow, lime edge streak, loose streetwear silhouette, board or wheel implied only as motion geometry, and expressive confident grin. Reference lineage: Takeshi Koike speed poster anatomy, Studio 4C urban kinetic color, and 1990s-2000s trick-sport anime energy, without copying any franchise, artist asset, brand, logo, or named character. Must read as stylized trick flow through body arc and neon curve, not generic cyber portrait. Avoid skatepark ramp cliche, graffiti text, masked face, camera prop, market/library/corridor drift, vehicle hero, crowd, or empty neon abstraction.',
    'SP05-354':
      'A telemetry apex precision anime style-card with one original racer-athlete silhouette carving a precise wet-track apex line: titanium grey, cyan telemetry arcs without readable UI, amber brake-glow accent, reflective visor or focused eyes, gloved hand, and clean technical restraint. Reference lineage: Production I.G precision staging, cyber-anime layout discipline, and motorsport/cycling apex poster energy, without copying any franchise, artist asset, vehicle design, logo, or named character. Must read as data-guided control and apex precision, not car advertisement. Avoid full car hero, cockpit screen wall, dashboard UI, readable graphs/text, coast road scene, camera prop, corridor/market/library drift, object-only helmet, or microdetail overload.',
    'SP05-355':
      'A festive sprint idol energy anime style-card with one original runner-performer mid-stride, supported by broad ribbon bands and abstract cheering color blocks: hot pink, sunny yellow, aqua, white highlights, clean smile-through-effort acting, and celebratory speed. Reference lineage: sports festival anime rhythm, idol-anime color staging, and Kyoto Animation performance microacting, without copying any franchise, artist asset, costume, logo, team, or named character. Must read as competitive sprint spectacle, not stage idol pinup. Avoid idol stage, microphone, exposed glamour outfit, finish-line tape, numbered jersey, crowd faces, camera prop, market/library/corridor drift, confetti noise, or generic cute portrait.',
    'SP05-356':
      'A graphic impact duel anime style-card with two original opponents locked across a single huge impact curve: ultramarine court shadow, white speed slash, orange contact spark, crisp foreshortened arms, and paddle/racket shapes reduced to readable silhouettes. Reference lineage: Haikyuu!! / Ping Pong competition clarity, Production I.G body-language timing, and graphic sports poster composition, without copying any franchise, artist asset, uniform, logo, or named character. Must read as theatrical duel through trajectory and opposition, not tennis stock art. Avoid tennis baseline, ball as hero, literal scoreboard, crowd, weapon-like racket pose, camera prop, corridor/market/library drift, object-only equipment, or dense particles.',
    'SP05-358':
      'A comeback grit impact anime style-card with one original combat-sport athlete rising from fatigue, wrapped hands near chest, bruised but non-graphic determination, steel red and dirty white lighting, sweat as broad cel highlights, and one shadowed rival shape in back. Reference lineage: Ashita no Joe boxing melancholy, Hajime no Ippo comeback rhythm, and 1990s sports cel grit, without copying any franchise, artist asset, uniform, logo, ring design, or named character. Must read as comeback grit through posture and recovery, not violence spectacle. Avoid blood, gore, punch contact, ring ropes as main subject, coach bench, weapon, camera prop, corridor/market/library drift, object-only gloves, or overgritty noise.',
    'SP05-360':
      'A poetic reflex focus anime style-card with one original focused competitor lunging toward a small abstract target, held in near-silent negative space: tatami beige as flat field, ink navy hair/cloth, vermilion accent, soft hand motion blur, and memory-like light. Reference lineage: Chihayafuru poetic sports tension, Madhouse clean hand-action clarity, and Naoko Yamada microgesture restraint, without copying any franchise, artist asset, uniform, logo, card design, poem text, or named character. Must read as reflex plus emotion through hand, breath, and silence, not generic training pose. Avoid literal playing cards, readable poems/text, classroom clubroom, crowded tatami hall, camera prop, market/library/corridor drift, object-only target, or glossy idol face.',
    'SP05-362':
      'A glam precision rivalry anime style-card with one original elegant athlete in a controlled swing or aiming gesture, rival silhouette as distant counterpoint, emerald green, champagne gold, black lacquer shadow, magenta trajectory arc, and refined fashion-sport poise. Reference lineage: Ai Yazawa fashion linework, Tsukasa Hojo adult cool, and sports-anime precision staging, without copying any franchise, artist asset, luxury brand, logo, course, or named character. Must read as glamorous precision rivalry through pose and trajectory, not golf brochure. Avoid fairway postcard, golf club product shot, hole/flag focus, country-club crowd, casino glam, camera prop, corridor/market/library drift, object-only ball, or excessive sparkle noise.',
    'SP06-022':
      'An oil-pastel style-card showing one expressive human-scale silhouette and surrounding color motion built entirely from chunky wax pigment, scraped marks, pressure ridges, saturated nonblended blocks, and tactile paper drag. Keep it figurative enough to read, but do not show drawing tools, paper pads, classroom materials, a child-art setup, tabletop still life, hands holding crayons, lamps, studio furniture, or corridor/market/library staging.',
    'SP06-023':
      'A silverpoint style-card with one delicate original folded metal flower, shell-like garment clasp, pale architectural fragment, mineral-botanical construction, or hand-scale mechanical clasp emerging from prepared warm ground through pale metal hairlines, sepia tarnish, irreversible contour discipline, and delicate value modeling. Keep it representative and refined without becoming a head, bust, animal relic, skull, or mask-face shortcut; do not show the artist, hands, stylus, tools, museum framing, drapery study, religious scene, lamp, chair, wall-prop studio, corridor, market, or library.',
    'SP06-024':
      'A conte-crayon style-card with one classical full-body or bust figure suggested through sanguine, sepia, black, and white square-stick strokes on textured paper, warm value structure, and disciplined modeling. Let the material and pose carry the preset; do not show masks, still-life props, sketchbooks, tools, hands drawing, anatomy plates, lamps, curtains, chairs, staged studio corners, corridors, markets, or libraries.',
    'SP06-025':
      'A technical-pen style-card showing one original architectural-object hybrid or precise wearable/mechanical silhouette drawn with uniform black line hierarchy, measured hatching, vellum-smooth negative space, and schematic restraint. Keep it readable as a finished subject, not a blueprint sheet; do not show labels, annotations, grids of plans, drafting tools, rulers, compasses, pens, desks, machines-as-clutter, buildings as corridors, UI, logos, or readable text.',
    'SP06-026':
      'A Copic-marker style-card with one clean original character, garment-focused figure, creature-mask courier, fashion-object hybrid, or human-scale product form with a body-language/context cue, rendered through translucent alcohol-ink layers, smooth gradients, reserved white highlights, soft edge bleed, and saturated marker-paper stain. Keep it illustrative, stylish, and representative; do not show isolated product-design objects alone, visible marker tools, product sketch boards, fashion plates, manga-face cliches, desks, studios, lamps, shelves, corridors, markets, libraries, logos, or readable text.',
    'SP06-027':
      'A chalk-dust style-card with one strong animal, dancer, or object silhouette drawn in powdery white marks on dark tooth, with dust halos, erased ghost trails, and rough handmade contrast. Keep the dark surface as material, not a classroom board; do not show written notes, menus, equations, classrooms, chalk sticks, hands drawing, cafe signage, blackboard frames, lamps, shelves, corridors, markets, libraries, or readable text.',
    'SP06-028':
      'A scratchboard style-card with one dramatic original animal or botanical form carved from black ground through white incised lines, excavated highlights, dense hatch cuts, and high-contrast tactile drama. Keep it subject-led and medium-led, with no secondary object. Do not show fantasy architecture, arches, doors, ruins, corridors, weapons, spears, blades, staffs, masks, compass, pocket watch, pendant, necklace, emblem, logo, text, engraving borders, tools, hands scratching, studio desks, markets, libraries, or empty black-card texture.',
    'SP06-029':
      'A silhouette style-card with one crisp dancer, animal, tree, or everyday object contour in solid black against clean pale space, using paper-edge sharpness, total shape reliance, and strong figure-ground design. Keep the subject immediately readable and calm; do not show heroic cliff poses, weapons, hammers, swords, staffs, capes, fantasy adventure scenes, sunset scenes, theatre screens, profile-portrait cliches, cut-paper tools, hands, lamps, curtains, rooms, corridors, markets, libraries, logos, or text.',
    'SP06-030':
      'A continuous-line style-card with one elegant readable figure, animal, or object built from a single unbroken black contour path, looping simplification, expressive detours, and minimal negative space. Keep it representative, not empty abstraction; do not show sketchbooks, cafe scenes, hands drawing, pens, desks, face-only cliches, framed prints, rooms, lamps, corridors, markets, libraries, logos, or readable text.',
    'SP06-031':
      'An etching style-card with one original animal, figure, or sculptural object rendered through acid-bitten copper lines, fuzzy ink grooves, plate-pressure emboss, fine crosshatching, and cream paper tone. Keep it antique but not literal; do not show old maps, buildings, botanical plates, portraits in frames, tools, press, workshop, labels, signatures, borders, corridors, markets, libraries, logos, or readable text.',
    'SP06-003':
      'A modern acrylic style-card with one bold subject embedded in thick opaque paint planes: partial figure silhouette, botanical wall fragment, weathered ceramic shrine-piece, mineral-mask form, or cropped civic mural animal. Use confident blocky pigment, saturated but curated palette such as coral, teal, smoke violet, bone cream, and acid yellow accent, visible palette-knife edges, matte acrylic opacity, and strong graphic shadow. No stair, hallway, corridor, vase still life, studio wall, curtain, lamp, easel, table, fan, classroom demo, generic abstract swatches, or bland primary-color sampler.',
    'SP06-012':
      'A spray-paint aerosol style-card with one original non-avian street courier silhouette or concrete-signal figure integrated into a cropped freight-door panel, utility-box face, or sunburned exterior slab. Build a bold humanlike stencil subject plus surrounding surface context, not a blank wall: black asphalt, seafoam, hot coral, pale cream, electric cyan, and one acidic yellow glint. Use overspray halos, stencil bridges, cap-dot texture, chipped paint, and controlled drips. No bird, raven, owl, beak, feathers, wings, wing shapes, plume mask, leaf-feather silhouette, animal head, spray-can hero, hand close-up, readable tag, generic graffiti letters, alley corridor, market wall, flat neon smear, or empty city-wall demo.',
    'SP06-032':
      'A woodcut style-card with one original masked pilgrim-plant idol or storm-bent guardian tree cut from black ink and gouged white channels, set against a compact cliff, river, or shrine-like landscape fragment. Use black, warm bone, oxblood, moss green, and sharp ochre accent with visible wood grain, rough relief edges, and stark angular contrast. Keep it print-force first and characterful, not decorative. Do not show folk-scene cliches, waves, historical costume tableau, tools, carved block, press, workshop, weapon, corridor, market, library, logo, readable text, or bland cup/mask default.',
    'SP06-033':
      'A linocut style-card with one clean original animal, figure, plant, or symbolic object built from smooth carved curves, bold negative-space cuts, flat ink planes, slight registration wobble, and hand-pulled pressure texture. Keep it graphic and representative; do not show protest posters, slogans, workshop tools, carved blocks, hands, desks, lamps, corridors, markets, libraries, logos, or readable text.',
    'SP06-034':
      'A lithography style-card with one soft original figure, animal, or object rendered through crayon-like stone grain, soft tonal transfer, paper pressure, and subtle speckled print texture. Keep it gentle and subject-led; do not show theatre bills, posters with text, edition marks, stones, tools, press, workshop, framed portraits, corridors, markets, libraries, logos, or readable text.',
    'SP06-035':
      'A screenprint style-card with one bold original protagonist-emblem: cropped night dancer, desert flower-machine rider, chunky transit creature, or angular city animal made from flat separated color passes. Use cobalt, tomato red, butter yellow, charcoal, mint, and one off-register pink shadow, with mesh-pulled texture, opaque poster planes, and deliberate registration offsets. Make it feel designed and alive, not a product demo. Do not show slogans, product ads, celebrity portraits, cans, packages, halftone text, tools, press, workshop, corridors, markets, libraries, logos, readable text, or plain household fan/product demo.',
    'SP06-036':
      'A monotype style-card with one visible side/front human-scale anchor: translucent dancer blur, turning repair worker, botanical press-shadow wrapped around a figure, or close torso in motion, softened by single-pull transfer, glass-plate smear, accidental blending, pressure blur, and unrepeatable painterly marks. Keep it representative, not an abstract plate, harbor postcard, lighthouse scene, dock scene, or back-view watcher; do not show lone figure staring across water, sea, lighthouse, pier, harbor, studio tools, glass plates, presses, hands, botanical specimen sheets, edition marks, corridors, markets, libraries, logos, or readable text.',
    'SP06-037':
      'An aquatint style-card with one moody original figure, animal, or object emerging from granular rosin tone, acid-built darkness, stop-out highlights, particulate shadow, and atmospheric intaglio fields. Keep it tonal and representative; do not show landscapes as default, storm scenes, old plates, narrative illustration, tools, press, workshop, frames, corridors, markets, libraries, logos, or readable text.',
    'SP06-038':
      'A mezzotint style-card with one quiet original animal, bust-like figure, or sculptural object emerging from velvet black through burnished highlights, rocked-plate grain, smoky tonal transitions, and scraped light. Keep it nocturnal but not candle/interior cliche; do not show candles, old-master rooms, antique frames, tools, press, workshop, corridors, markets, libraries, logos, or readable text.',
    'SP06-039':
      'A Risograph style-card with one playful art-directed character-object: courier with a plant helmet, soft geometric creature carrying a folded charm, garment-fruit hybrid mascot, or tiny architectural spirit. Use fluorescent pink, seafoam, sunflower yellow, deep indigo, warm paper cream, and a tiny red-orange accent, with soy-ink grain, dithered tonal fields, paper absorption, and charming misregistration. Keep it zine-like and representative without becoming a flyer. Do not show typography, posters, slogans, student-print tables, tools, press, workshop, corridors, markets, libraries, logos, readable text, or generic toy-block still life.',
    'SP06-040':
      'A cyanotype style-card with one original animal, object, garment, or abstract-but-readable silhouette in Prussian blue monochrome, UV softness, paper fiber, contact-print whites, and rinsed edges. Keep it scientific and calm; do not show specimen-sheet layout, labels, blueprints, architecture plans, botanical requirement, catalog grids, borders, tools, corridors, markets, libraries, logos, or readable text.',
    'SP06-041':
      'A rubber-stamp style-card where repeated imperfect impressions assemble one memorable harbor-wanderer emblem, cactus mask character, tiny ferry spirit, ritual boot mascot, or weather-signal guardian. Use worn vermilion, faded navy, bottle green, warm cream, soot-black, and a muted turquoise accent, with pressure gaps, alignment wobble, ink fatigue, and paper tooth. Keep it visual-only and graphic, not office stationery. Do not show readable stamp text, forms, postage, labels, logos, ink pads, stamp tools, desks, corridors, markets, libraries, document layouts, or generic lamp product still life.',
    'SP06-042':
      'A newspaper-halftone style-card with one bold original figure, animal, object, or scene fragment reproduced through visible dot matrix, cheap yellowing paper, ink smudge, coarse grey spacing, and gritty mass-print texture. Keep it image-led; do not show headlines, captions, columns, newspaper layout, political figures, logos, readable text, desks, corridors, markets, or libraries.',
    'SP06-043':
      'A security-engraving style-card with one single original flower, animal, or sculptural object rendered through guilloche precision, ultra-fine parallel lines, anti-counterfeit hatch density, green-grey cotton-paper tone, and exact curvature. Use no secondary props. Keep official-detail without currency; do not show banknotes, certificates, seals, portraits, denominations, serial numbers, borders, jewelry, pendant, coin, compass, medallion, logos, readable text, desks, corridors, markets, or libraries.',
    'SP06-044':
      'A drypoint style-card with one close side/front human-scale figure, coat-wrapped dancer, courtyard repair worker, or wind-bent performer rendered through needle-scratched lines, burr-held ink halos, warm paper, plate-pressure softness, and fragile short-run wear. Keep it direct and intimate; do not show animal mascot, harbor, sea, dock, ship masts, back-view coat figure, backpack traveler, antique plates, landscapes, portraits in frames, tools, press, workshop, corridors, markets, libraries, logos, or readable text.',
    'SP06-045':
      'A collagraph style-card with one tactile original animal, figure, or object built from raised sand/glue/fiber relief, ink-filled valleys, irregular pressure, cardboard memory, and rough organic print texture. Keep it subject-readable, not empty abstraction; do not show literal collage scraps, recognizable found objects, landscape scenes, printing plates, tools, hands, workshop, corridors, markets, libraries, logos, or readable text.',
    'SP06-046':
      'A digital-painting style-card with one polished original non-anime outdoor figure, creature, vehicle, or object rendered through pressure-sensitive brushwork, layer-corrected gradients, crisp focal edges, clean modern illustration polish, and open-air color depth. Keep it representative and finished; do not show anime character-card finish, studio setups, art desks, paint tools, lamps, vases, masks on pedestals, tablet UI, layer panels, concept-sheet grids, fantasy armor default, weapons, corridors, markets, libraries, logos, or readable text.',
    'SP06-047':
      'A speedpaint style-card with one dynamic original hybrid rider-creature, weatherproof courier, broken hover vehicle, or abstract action silhouette crossing an open storm field. Use broad gestural strokes, fast value grouping, loose edges, compressed detail, and a vivid color script of burnt orange, storm teal, bruised violet, bone white, and lime spark. Keep it energetic, readable, and cinematic; do not show humans at desks, tablets, screens, UI panels, process frames, YouTube UI, sketch borders, studios, desks, lamps, brushes, palettes, art tools, fantasy warrior default, weapons, corridors, markets, libraries, logos, or readable text.',
    'SP06-048':
      'A matte-painting-extension style-card with one grounded cinematic exterior landmark expanded by seamless paint-over, but anchored by a readable repair pilot, archaeologist-mechanic, or maintenance operator in the foreground/midground. Place the operator against an eroded cliff elevator, coastal industrial gate, desert weather station, or weathered sci-fi landing rim so scale and extension read together. Use slate blue, oxidized orange, pale dust, deep teal shadow, and amber rim light with atmospheric perspective and phototexture integration. Keep it VFX-coherent without becoming a generic vista; do not show weapons, held tools as hero props, studio rooms, pedestals, tabletop objects, long corridors, fantasy halls, markets, libraries, plate-photo contact sheets, UI, labels, logos, readable text, car-only plates, or empty landscape-only composition.',
    'SP06-049':
      'A flat vector-art style-card with one clean original animal, figure, plant, or object built from precise Bezier contours, solid color fills, geometric hierarchy, and resolution-independent edges. Show one finished subject only on a plain graphic field. Do not show studio rooms, desks, tools, brushes, cups, palettes, swatches, reference sheets, pinned sketches, labels, logos, brand marks, app UI, infographic symbols, icons-only sheets, text, corridors, markets, libraries, or website-like layout.',
    'SP06-050':
      'A visibly 16-bit pixel-art style-card with one original character, animal, object, or compact outdoor scene fragment built only from hard square pixels, limited palette clusters, crisp grid scale, dithered shade ramps, tile rhythm, and hard aliasing. It must look like enlarged sprite/tile art, not smooth digital painting, not brush illustration, not modern concept art, and not a painterly scene. Keep game-era construction without HUD; do not show computer screens, UI, health bars, menus, workstations, posters, cartridges, franchise sprite copies, readable text, corridors, markets, libraries, or generic level-map layout.',
    'SP06-051':
      'A low-poly style-card with one original human-scale explorer, angular vehicle, crystalline landmark with scale figure, or traversal scenelet in a clean open exterior or abstract color field, formed from visible triangular facets, flat-shaded planes, simplified geometry, crisp ambient occlusion, and origami-like light breaks. Keep polygon beauty subject-led; do not show animal mascots, fox/wolf/deer heads, asset turntable, game terrain default, empty landscape, studio pedestal, lamps, work lights, UI, labels, corridors, markets, libraries, logos, or readable text.',
    'SP06-052':
      'A voxel-art style-card with one original animal, vehicle, or harmless everyday object built from disciplined cube units, stepped curves, crevice ambient occlusion, and toy-like volumetric readability. Keep voxel grammar without Minecraft drift; do not show blocky humanoid warriors, weapons, swords, tools, pencils, work desks, pixel props, blocky buildings, landscapes, game dioramas, terrain maps, UI, labels, corridors, markets, libraries, logos, or readable text.',
    'SP06-053':
      'A concept-art style-card with one original non-anime designed figure, hybrid creature, vehicle, costume silhouette, or landmark encounter showing mood-first lighting, readable design intent, photobash-paint hybrid texture, production-ready shapes, and exploratory polish. Keep visual-direction utility and specific shape language; do not show callout sheets, model-sheet grids, UI, labels, generic teal-orange fantasy, armored warrior default, anime hero finish, weapons, long corridors, markets, libraries, logos, or readable text.',
    'SP06-054':
      'An isometric style-card with one compact playable scenelet: human-scale resident, traveler, courier, tiny vehicle, modular plaza, rooftop, or room fragment using parallel nonconverging lines, thirty-degree tilt, equal plane attention, stacked grid logic, and miniature dimensional clarity. Keep one clear focal idea with environment context, not a floating asset icon. Do not show concept sheets, taped sketches, callouts, swatches, full buildings, city blocks, world maps, playset dioramas, UI, labels, corridors, markets, libraries, logos, or readable text.',
    'SP06-055':
      'A glitch-art style-card with one original animal, figure, object, or abstract-but-readable silhouette corrupted by RGB channel displacement, data tearing, compression blocks, scanline breaks, algorithmic offsets, and malfunction-as-medium structure. Keep it subject-led; do not show computer screens, hacker rooms, cyberpunk interiors, UI overlays, code panels, readable text, logos, corridors, markets, or libraries.',
    'SP06-056':
      'A synthwave style-card with one original animal, figure, or abstract chrome form on a plain retrofuturist graphic field, using magenta-cyan bloom, neon grid rhythm, scanline haze, reflective bands, and synthetic glow. Keep remembered-future energy without stock props; do not show desks, tabletop displays, lamps, light tubes, crystal pedestals, cars, roads, palm trees, suns/sunsets as main subject, city corridors, UI, logos, readable text, markets, or libraries.',
    'SP06-057':
      'A double-exposure style-card with one original animal, object, or non-profile silhouette on plain negative space, containing layered imagery through tonal masking, transparent overlap, additive density, and negative-space fusion. Keep layered-memory logic without a desk/studio scene; do not show tabletop displays, tools, hanging objects, human profile portraits, forests, mountains, birds-in-head cliche, readable text, logos, corridors, markets, or libraries.',
    'SP06-058':
      'A polygon-art style-card with one original animal, object, plant, or figure floating on a plain light graphic field, built from triangular facets, angular tonal decisions, low-resolution form memory, and flat geometric patchwork. Keep geometry as the whole art system. No desk, no tabletop, no tools, no pencil cup, no pen, no brush, no palette, no floor props, no screens, no monitors, no UI panels, no studio rooms, no pedestals, no background artwork, no stock low-poly mountains, no labels, logos, readable text, corridors, markets, or libraries.',
    'SP06-059':
      'A digital paper-cutout style-card with one original animal, plant, object, or figure on a clean paper field, built from layered flat paper planes, clean cut edges, soft drop shadows, staged depth, and machine-perfect craft illusion. Keep simulated handmade charm; do not show screens, tablet pads, glowing platforms, greeting cards, tabletop craft scenes, scissors, glue, hands, desks, labels, logos, readable text, corridors, markets, or libraries.',
    'SP06-060':
      'An ASCII-art style-card with one original animal, object, or simple figure on a plain dark terminal-like field, built from monospaced glyph density, symbol fields as tonal pixels, terminal-era spacing, low-resolution contrast, and character-set geometry. Keep text-as-image abstraction; do not show rooms, desks, tools, screens-with-UI, readable words, code snippets, UI windows, hacker desks, logos, captions, signatures, corridors, markets, or libraries.',
    'SP06-061':
      'An analog cut-paper collage style-card with one original traveler-mask, garment-torso fragment, architectural paper facade, vehicle scrap saint, or surreal non-animal emblem assembled from mismatched paper fragments. Use vermilion, petrol blue, ochre, dirty lilac, newsprint grey without readable text, and cream negative space; show scissor edges, glue seams, scale jumps, and clashing print textures. Keep seams visible and subject readable; do not show animals, birds, fox/cat/wolf heads, craft tables, boards, hands, scissors, glue bottles, readable clippings, fire, studio setup, corridors, markets, libraries, logos, or readable text.',
    'SP06-062':
      'A photomontage style-card with one uncanny original animal, object, or scene fragment blended through seamless photo-like scale shifts, transparent joins, unified grading, and plausible impossible relationships. Keep it composition-led; do not show passport-photo framing, face gags, city default, object-joke default, camera gear, UI, labels, corridors, markets, libraries, logos, or readable text.',
    'SP06-063':
      'A decoupage style-card with one readable full-body or three-quarter human-scale carnival figure, botanical coat panel on a wearer, architectural miniature reliquary with scale figure, or vessel-character with body-language sealed under glossy varnished paper skin. Use lacquer red, bottle green, faded peach, black tea brown, ivory, and cobalt scraps; include softened torn edges, aged adhesive depth, crackle glaze, and surface-wrap palimpsest. Keep it material-led and scene-readable without becoming a craft sample, mask-face portrait, centered mask, bust, mannequin, or face-only crop. Do not show animals, birds, cat/fox/wolf forms, decorative plates, craft-table scenes, scissors, glue, hands, readable printed motifs, labels, corridors, markets, libraries, logos, or readable text.',
    'SP06-064':
      'An assemblage style-card with one coherent found-material wanderer, abstract machine relic with scale cue, garment shrine with body-scale presence, small vehicle shell, or architectural object composed from rust, wood, glass, paper, and plastic-like fragments. Use oxidized copper, tar black, bone, faded turquoise, hazard yellow flecks, and deep cast shadow for object-scale tension. Keep it one coherent focal subject with character, not a bust, mannequin torso, shelf collection, or boxed diorama. Do not show animals, birds, fox/cat/wolf heads, literal collections, shelves, cabinets, craft tables, tools, labels, corridors, markets, libraries, logos, or readable text.',
    'SP06-065':
      'A scrapbook-layer style-card with one readable character silhouette, garment fragment on a body, vehicle ticket-world, or architectural memory scene made from layered ephemera-like papers, tape edges, stickers, torn corners, soft shadows, and pastel/vintage paper rhythm. Keep nostalgia material, not literal notes or a beige craft sample; do not show animals, birds, cute mascots, stationery objects, tickets, readable handwriting, flowers as requirement, people photos, desks, craft tables, labels, corridors, markets, libraries, logos, or readable text.',
    'SP06-066':
      'A trash-polka style-card with one original human-scale figure silhouette, vehicle scar, ritual garment fragment, or aggressive scene emblem colliding black realism shards, red vector strikes, splatter, smear, stencil blocks, and high-contrast graphic tension. Keep it dangerous through contrast, not gore or tattoo-demo styling; do not show animal heads, tattoos on skin, arms, blood, weapons, skull piles, readable lettering, logos, corridors, markets, libraries, or readable text.',
    'SP06-067':
      'A mixed-media canvas style-card with one original hybrid figure silhouette, garment-plant guardian, architectural material emblem, or object-creature built from thick paint, grit, fibers, paper relief, sand texture, and layered pigment. Use black plum, rust orange, turquoise oxide, dusty cream, sap green, and a sharp magenta scrape. Keep material relief and subject readable; do not show animals, birds, fox/cat/wolf heads, readable newspaper, fabric as required prop, literal canvas on easel, craft table, tools, hands, studio setup, corridors, markets, libraries, logos, or readable text.',
    'SP06-068':
      'A zine-aesthetic style-card with one original street-scale figure, cutout dancer, patched vehicle, protest-free scenelet, or punk material silhouette flattened through Xerox contrast, toner grain, tape shadows, rough crop edges, repeated-copy degradation, and black-white paper burn. Keep DIY reproduction without slogans or emblem-only design; do not show animal mascots, booklets, staples, pages with text, readable slogans, posters, hands, desks, corridors, markets, libraries, logos, or readable text.',
    'SP06-069':
      'A moodboard color-story style-card with one coherent abstract object cluster or material emblem built from coordinated color fragments, swatches, texture samples, spacing rhythm, and provisional design logic. Keep palette as subject; do not show literal photo collections, captions, pinned boards, labels, notes, readable text, desks, craft tables, corridors, markets, libraries, logos, or UI.',
    'SP06-070':
      'A pinned planning-board style-card with one visible planning archivist, courier, designer, or map-runner as the primary subject, three-quarter view, crossing through oversized blank planning shapes made from cork-like texture, colored pins, thread arcs, tape fragments, and clustered relationship lines. Use cobalt blueprint blue, tomato red route-string, citron note blocks, warm cork only as secondary texture, graphite shadows, and clean ivory gaps. Character-world read first, planning surface second. Do not show boat, ship, expedition emblem, route relic, machine-plan creature, object system, mannequin, garment torso, conspiracy board, readable goals, map labels, clippings, photos, hand-written notes, craft tables, studio setup, corridors, markets, libraries, logos, or readable text.',
    'SP06-071':
      'A torn-paper mosaic style-card with one original textile courier silhouette, botanical vessel, city-shrine fragment, or abstract human-scale figure assembled from torn paper tesserae, fiber edges, print residue, color scraps, and distance-read coherence. Use indigo, tomato red, butter yellow, pale mint, charcoal, and paper-white fracture lines. Keep scrap material visible and figure readable; do not show animals, birds, fox/cat/wolf heads, beaks, feathers, feather headdress, plume crown, wing-like strips, tribal costume cliche, readable typography, advertisements, magazine headlines, school craft scene, craft table, hands, tools, corridors, markets, libraries, logos, or readable text.',
    'SP06-072':
      'A tape-art style-card with one original geometric animal, object, plant, or figure constructed from straight adhesive strips, masking/duct tape color, matte-gloss catches, layered tape edges, and installation-like precision. Keep tape as medium; do not show wall murals as requirement, street context, craft table, tape rolls, hands, scissors, tools, boards, corridors, markets, libraries, logos, or readable text.',
    'SP06-073':
      'An embroidery-on-photo style-card with one original raincoat traveler silhouette, garment panel, architectural threshold, botanical object, or abstract figure altered by visible thread stitches, needle-hole dots, floss accents, matte thread over flat print texture, and tactile mend geometry. Use desaturated photo blue, cream thread, coral floss, moss green, graphite, and small gold knots. Keep stitch-over-image logic without literal family photo or portrait cliche; do not show animals, birds, fox/cat/wolf heads, family snapshots, frames, sewing tools, needles, hands, hoops, craft tables, labels, corridors, markets, libraries, logos, or readable text.',
    'SP06-074':
      'A paint-over-photo style-card with one original figure, traveler, vehicle, garment fragment on a body, or architectural scenelet partly obscured by thick acrylic strokes, smeared opacity, scraped gesture, and printed-surface friction. Keep overpainted-print tension and a readable subject; do not show animal mascots, literal photo realism, portrait default, brushes, palettes, hands, easels, studio setup, labels, corridors, markets, libraries, logos, or readable text.',
    'SP06-075':
      'A digital-collage style-card with one original surreal object cluster, animal, or figure assembled from clean cut-screen edges, layer logic, impossible scale play, and vibrant screen-native composite polish. Keep cut-and-paste logic visible; do not show software UI, transform handles, app windows, vaporwave props, desktop/workstation scenes, labels, corridors, markets, libraries, logos, or readable text.',
    'SP06-076':
      'A fumage smoke-art style-card with one ghostly original animal, plant, object, or figure emerging from soot residue, airflow gradients, carbon haze, soft smoke trails, and delicate black-on-light surface. Keep smoke-drawn materiality; do not show visible flames, candles, torches, burners, fire, studio setup, craft table, labels, corridors, markets, libraries, logos, or readable text.',
    'SP06-077':
      'A coffee-painting style-card with one warm narrative side/front human-scale scenelet: rain-shelter worker, old transit-corner person turning toward light, boat-repair figure away from water, or garment silhouette on a body, painted through sepia stains, absorbent paper blooms, brown tide marks, granules, and fluid organic pigment. Keep stained warmth without beverage props; do not show back-view traveler, lone person staring at water, boat/dock/harbor postcard, mugs, cups, saucers, kitchens, cafe tables, coffee beans, ring-only compositions, labels, corridors, markets, libraries, logos, or readable text.',
    'SP06-078':
      'A gold-leaf art style-card with one original plant, animal, object, or ornamental figure made from black/gold flat areas, metallic foil cracks, reflective leaf patches, and precious material radiance. Keep gilding material-led; do not show religious icons, halos as literal saint imagery, craft tables, foil tools, hands, frames, labels, corridors, markets, libraries, logos, or readable text.',
    'SP06-079':
      'A paper-marbling style-card with one original plant, animal, object, or abstract-but-readable emblem submerged in suminagashi/ebru fluid swirls, oil-slick pigment veins, combed turbulence, and single-pull paper transfer texture. Keep liquid pattern as medium; do not show trays, comb tools, hands, craft table, boards, labels, corridors, markets, libraries, logos, or readable text.',
    'SP06-080':
      'A stencil-art style-card with one bold original animal, object, plant, or figure silhouette made from hard cut bridges, spray-edge urgency, simplified repeatable shapes, black/red/white contrast, and visible stencil logic. Keep it graphic and reproducible; do not show street walls, protest scenes, slogans, letters, spray cans, hands, craft table, corridors, markets, libraries, logos, or readable text.',
    'SP06-081':
      'A Game Boy green-monochrome style-card with one original animal, object, or compact scene fragment reduced to four olive-green values, chunky 8x8 tile masses, LCD pixel gaps, passive-matrix ghosting, and pocket-screen nostalgia. Keep it image-led; do not show HUD, menus, game UI, cartridge, console hardware, logos, readable text, modern color, corridors, markets, or libraries.',
    'SP06-082':
      'A SNES Mode 7 style-card with one original abstract vehicle, creature, object, or emblem warped across an affine-transformed flat plane with scaled sprite depth, scanline artifacts, banded 16-bit color, and pseudo-3D hardware trickery. Keep Mode 7 transform as subject; do not show literal racing track, cars as requirement, HUD, lap UI, maps, menus, logos, readable text, modern 3D, corridors, markets, or libraries.',
    'SP06-083':
      'A vector-arcade-wireframe style-card with one original animal, ship-like object, abstract vehicle, or geometric creature drawn only from glowing phosphor vector lines on black, wireframe contours, line-intersection bloom, and electron-beam afterglow. Keep pure line display; do not show UI panels, cockpit screens, filled surfaces, raster pixels, text, logos, score numbers, corridors, markets, or libraries.',
    'SP06-084':
      'An FMV pre-rendered-sprite style-card with one compact original character, creature, vehicle, or object baked from chunky 90s CGI into a flat 2D sprite-plane. Use visible 256-color quantization, dithered gradient banding, baked highlights, compression ghosts, chunky silhouette edges, and pre-rendered cartridge charm. It must feel like a single enlarged 90s pre-rendered game sprite, not a full low-poly environment, not smooth modern sci-fi concept art, not a blue neon vehicle scene, and not a clean high-resolution render. Do not show monitors, screens, arcade cabinets, UI, sprite sheet grid, text, logos, corridors, markets, libraries, or modern glossy render.',
    'SP06-085':
      'A visual-novel-screen style-card with one quiet original object, animal, or non-school figure in cel-clean ADV composite grammar: softened support layer, translucent lower-third glass panel with no markings, gentle vignette, and emotional stillness. Keep interface framing abstract. Do not show monitors, computer screens, control rooms, readable dialogue, choice text, school classroom, dating-sim cliches, UI buttons with symbols, logos, corridors, markets, libraries, or readable text.',
    'SP06-086':
      'An RPG-Maker-chibi-tileworld style-card with one compact original animal, object, or tiny character rebuilt from top-down 16x16 tile grammar, grid-snapped modules, chibi scale, and cozy indie-RPG color. Keep it one miniature scene fragment; do not show dialogue boxes, HUD, menus, map labels, full dungeon map, franchise sprites, logos, corridors, markets, libraries, or readable text.',
    'SP06-087':
      'A GBA tactical-pixel style-card with one compact original unit, object, or terrain-emblem on a clean tactical grid, using bright handheld palette, small-sprite readability, isometric/top-down tile logic, and turn-based calm. Keep tactical clarity as image, not interface. Do not show decorative frames, badges, menu panels, readable UI windows, stats, portraits with text, battle HUD, weapon foreground, logos, corridors, markets, libraries, or readable text.',
    'SP06-088':
      'A PSX-vertex-wobble style-card reading like a HUD-free in-engine 32-bit screencap: one original low-poly side-view player, rescue vehicle with driver cue, shrine-machine with scale figure, or playable companion at an open cliff, train yard, or foggy plaza edge. Use teal fog, dirty violet sky, sodium orange highlight, olive shadow, and pale polygon seams with affine texture swim, dithered fog, chunky unfiltered textures, and unstable vertices. Keep PSX instability and scene identity; do not show back-view wanderer wallpaper, horror corridors, hospital hallways, UI, inventory screens, weapon foreground, logos, readable text, markets, libraries, or modern clean 3D.',
    'SP06-089':
      'A text-mode-roguelike ANSI style-card with one original creature, object, or symbolic room fragment built from fixed-width glyph cells, CP437-like symbols, 16-color ANSI palette, terminal glow, and symbolic dungeon logic. Keep glyphs as image; do not show readable words, code lines, menus, command prompts, UI window chrome, logos, corridors, markets, libraries, or modern graphical sprites.',
    'SP06-090':
      'A voxel-block-sprites style-card with one original harmless animal, vehicle, plant, or object built from visible cube units, block-stepped contours, isometric grid alignment, ambient-occlusion block edges, and bright toy-block colors on plain neutral space. Keep cube construction; do not show display capsules, glowing frames, UI cards, Minecraft branding, blocky warriors, weapons, full terrain maps, labels, corridors, markets, libraries, logos, or readable text.',
    'SP06-091':
      'A Vectrex-vector-display style-card with one original space-manta rider, lunar rescue craft, geometric creature, or abstract vehicle drawn only as pure glowing vector lines on black. Use white phosphor, faint teal overlay bands, tiny magenta afterglow, CRT bloom, wireframe transparency, and electron-beam persistence. Keep the beam drawing elegant and unmistakable; do not show UI panels, score text, cabinet hardware, filled surfaces, raster pixels, logos, corridors, markets, libraries, or readable text.',
    'SP06-092':
      'A C64 Commodore-palette style-card with one original animal, object, vehicle, or compact scene fragment forced through C64 16-color muted palette, fat 8x8 character blocks, wide-pixel aspect, dither value shifts, and CRT composite blur. Keep home-computer pixel warmth as the image itself; do not show computers, keyboards, cassette tapes, hardware, BASIC screens, readable text, UI menus, game HUD, logos, corridors, markets, libraries, modern smooth pixels, or high-color output.',
    'SP06-093':
      'An MSX2 Japanese-computer style-card with one original animal, object, vehicle, or compact scene fragment compressed into bright Japanese 8-bit pixels, SCREEN-mode layering, compact 256x212 proportions, vivid emerald/red/blue/yellow palette, and character-cell texture without words. Do not show UI menus, readable Japanese text, cartridge/console hardware, logos, corridors, markets, libraries, modern smooth pixels, or franchise copies.',
    'SP06-094':
      'An Atari-2600 extreme-limitation style-card with one original animal, object, vehicle, or primitive scene fragment reduced to 40-fat-pixel forms, scanline color stripes, blocky playfield logic, sprite flicker, black background, and TIA hardware artifacts. Keep impossible memory pressure visible; do not show UI, score numbers, cartridge/console hardware, detailed maps, logos, corridors, markets, libraries, readable text, or rich modern palette.',
    'SP06-095':
      'A Sega-Genesis dither-heavy style-card with one original creature, vehicle, object, or compact scene fragment using crunchy 16-bit sprite logic, heavy checkerboard dithering, 64-color grit, parallax bands, scanlines, and composite-video blur. Keep dither as signature; do not show consoles, controllers, cartridges, hardware props, Sonic-like mascot copies, beat-em-up franchise scenes, HUD, UI, score text, logos, corridors, markets, libraries, or smooth modern gradients.',
    'SP06-096':
      'A Neo-Geo sprite-king style-card with one original large arcade-sprite creature, vehicle, object, or non-weapon fighter-like silhouette using lavish pixel detail, rich arcade palette, dense animation-frame implication, background parallax, and premium sprite polish. Keep peak pixel art without franchise imitation; do not show swords, blades, weapons, fighting-game duel scene, readable HUD, lifebars, UI, logos, corridors, markets, libraries, readable text, or modern HD illustration.',
    'SP06-097':
      'An Amiga DeluxePaint HAM style-card with one original chunky sprite-scale performer, demo-scene beast, mask, or fantasy computer-art mascot inside flat 320x256-style screen-space: 4096-color HAM shimmer, magenta-cyan fringing, copper-list rainbow gradient sky, PAL interlace texture, stair-stepped pixel contours, and DeluxePaint brush-pattern logic. Keep color-machine artifact as the image; it must feel like old Amiga art captured from software, not modern neon concept art. Use flat screen composition, hard pixel edges, and impossible HAM color bleed rather than perspective depth. Do not show glossy human portrait, realistic tunnel, vaporwave hallway, hovercraft, vehicle chase, smooth 3D craft, modern game scene, Workbench windows, software UI, computer hardware, video toaster gear, readable text, logos, corridors, markets, or libraries.',
    'SP06-098':
      'A TurboGrafx/PC-Engine style-card with one original creature, vehicle, object, or compact scene fragment in bright compact Japanese console pixels, HuCard restraint, CD-ROM2 richness, 482-color brightness, and clean sprite confidence. Keep alternate-history console mood; do not show HuCard/CD hardware, console, UI, HUD, franchise copies, logos, readable text, corridors, markets, or libraries.',
    'SP06-099':
      'A DS Flipnote Studio style-card with one original animal, object, or simple figure drawn in crude black stylus lines on white, with jittery flipbook marks, memo-grid texture, low-res LCD compression, and homemade animation charm. Keep drawing-only charm; do not show DS hardware, app UI, toolbar icons, readable text, logos, screens-with-frame, corridors, markets, or libraries.',
    'SP06-100':
      'A Game Boy Camera thermal-print style-card with one original animal, object, or simple figure rendered in four-shade greyscale, 128x112 CMOS grain, thermal printer dot matrix, fisheye distortion, stamp-tile hint, and fading paper chemistry. Keep print artifact as image; do not show Game Boy hardware, printer hardware, UI, photo booth, readable text, logos, corridors, markets, or libraries.',
    'SP06-101':
      'A JRPG pixel-diorama style-card with one original compact object, creature, tiny vehicle, or environment fragment in 16-bit isometric diorama grammar, warm limited ramps, tidy grid rhythm, blocky cast shadows, and charm-first simplification. Show one finished card, not a hero scene. Do not show swords, weapons, armed characters, frame grids, UI, HUD, NPC crowds, literal town requirement, readable text, logos, corridors, markets, or libraries.',
    'SP06-102':
      'A roguelike tile-glyph-system style-card with one original symbolic object, safe creature, or tile cluster in stark glyph silhouettes, strict modular grid, black gutters, low-count palette, chipped pixel edges, and harsh tactical readability. Show one finished card, not a sprite sheet. Do not show icon sheets, inventory icons, swords, weapons, armed characters, frame grids, UI, command prompts, readable text, literal dungeon corridor, monster requirement, logos, markets, or libraries.',
    'SP06-103':
      'A Metroidvania parallax-gloom style-card with one original side-view explorer silhouette, creature, relic, or compact biome fragment using layered foreground/midground/background planes, cool shadow depth, toxic accent glow, moss-mineral pixel clusters, and traversal-readable shape rhythm. Show one finished atmospheric card, not a level mockup. Do not show literal cavern corridors, door/platform layouts, HUD, UI, maps, weapons, readable text, logos, markets, or libraries.',
    'SP06-104':
      'A cyberpunk diegetic-HUD-glow style-card with one original non-anime courier silhouette inside a street-scale signal moment, wrapped in translucent tactical glow, scanline grime, cyan-magenta glass layers, target brackets, and signal haze. Keep the graphics non-readable and atmospheric around the person, not a software screen. Do not show drones, camera props, tripods, weapons, readable interface copy, hacker workstation, monitors-as-subject, logos, text, markets, libraries, or corridors.',
    'SP06-105':
      'A retro fighting-game-select style-card with one original animal mascot, armored object, creature bust, or non-weapon character emblem in 90s arcade pixel paint, saturated impact gradients, chunky anti-aliasing, diagonal energy slashes, and bold selectable presence. Keep it characterful and representational without turning into UI. Do not show selection grids, character names, lifebars, versus screens, arena fights, weapons, readable text, logos, markets, libraries, or corridors.',
    'SP06-106':
      'An isometric strategy-tile-language style-card with one original tiny settlement fragment, resource machine, creature habitat, or modular object cluster built from crisp 2:1 isometric blocks, bevel highlights, contact shadows, walkable-vs-blocked value logic, and repeatable tile seams. Show one composed card, not a tile atlas. Do not show people, soldiers, weapons, armies, bases, maps, grid overlays, UI panels, frame sheets, readable text, logos, markets, libraries, or corridors.',
    'SP06-107':
      'A MOBA splash-rendering style-card with one original creature, elemental guardian, vehicle-beast hybrid, or non-weapon champion-like focal form in cinematic digital paint, dramatic ability-color lighting, sculpted silhouette, energy trails, and polished poster crop. Keep epic but not franchise-like. Do not show battle scenes, arenas, swords, guns, weapons, UI, title text, logos, markets, libraries, corridors, or generic fantasy hallway staging.',
    'SP06-108':
      'A visual-novel neon-backdrop-wash style-card with one original intimate story character occupying 45-65 percent of the card height in front or side three-quarter view: quiet archivist, night courier, laundromat witness, vending-machine shelter figure, or rainlit street-edge lead. Use clean anime background style, neon emotional grading, dialogue-safe negative space, and soft colored rim light. Keep character staging first, not empty background. Do not show back-view black coat, hooded train-platform silhouette, tiny figure in window, object-only storefront, dialogue boxes, UI chrome, classrooms, desks, students, readable signs/text, logos, markets, libraries, or corridors.',
    'SP06-109':
      'A Soulslike tarnished-atmosphere style-card with one original burdened wanderer silhouette, eroded relic with tiny scale figure, monumental gate fragment, burdened stone idol, or ancient creature silhouette in ash-gray, old gold, bruised umber, dust, soot, corroded metal, and thin sacred backlight. Keep decayed grandeur, human scale, and material poetry, not a black boss poster. Do not show swords, guns, weapons, armored knight portraits, castles, throne rooms, fantasy corridors, boss fights, readable text, logos, markets, or libraries.',
    'SP06-110':
      'A chibi platformer-sprite-bounce style-card with one original cute creature, toy vehicle, fruit mascot, or compact object posed as a single polished sprite, using squashy proportions, candy palette, rounded pixel outlines, tiny highlight caps, and bouncy silhouette rhythm. Show one finished card, not a sprite sheet. Do not show frame grids, multiple animation frames, platforms, UI, HUD, costumes, readable text, logos, markets, libraries, or corridors.',
    'SP06-111':
      'A battle-royale compression-colorway style-card with one original supply capsule, mascot creature, signal beacon, or terrain-safe focal object under cyan-violet pressure glow, warm danger accents, vivid live-service polish, stormlike color gradient, and high-visibility silhouette separation. Keep competitive energy without shooter props. Do not show guns, weapons, soldiers, players, vehicles, arena map, literal storm wall, HUD, UI labels, readable text, logos, markets, libraries, or corridors.',
    'SP06-112':
      'A sci-fi arsenal-icon-kit style-card with a coherent set of 3-5 non-weapon support-device icons in a shallow in-world equipment spread: shield core, med capsule, scanner puck, field pack, drone battery, rescue beacon, or repair module. The first read must be icon-system clarity, shared scale, crisp silhouettes, flat rarity accents, blue emissive seams, bevel/contact shadows, floor-pad context, and 2-3 flat ghost-icon silhouettes as non-readable design echoes. Show one finished card, not a lone product render, icon sheet, or character scene. Do not show people, anime mechanics, cute mascot helpers, humanoid faces, guns, ammo, blades, soldiers, weapon racks, black tabletop plinth, centered glowing cube/capsule alone, frame grids, UI labels, readable text, logos, markets, libraries, or corridors.',
    'SP06-113':
      'A fantasy MMO parchment-interface style-card where parchment becomes a tiny world scene, not a document prop: one quest courier, route-beast, relic carrier, or sealed gate token crossing torn paper cliffs, ink coastlines, wax-red seals, jade route marks, and lapis water. Keep fibrous paper grain and game-interface material read without legible UI. Do not show readable map labels, centered compass, circular medallion hero, document still life, continents, castles, text, UI windows, menus, markets, libraries, or corridors.',
    'SP06-114':
      'An anime gacha-foil-frame style-card with one original magical creature, charm object, small spirit, or collectible centerpiece inside iridescent foil border, rarity glow, opal-gold accents, prismatic highlights, clean anime contours, and controlled sparkle density. Keep premium card feel without stats. Do not show readable card text, numbers, UI stats, weapons, generic character portrait, school uniform, logos, markets, libraries, corridors, or cluttered interface.',
    'SP06-115':
      'A survival-horror save-room-lighting style-card with one original safe-but-uneasy human-scale scenelet: seated survivor silhouette, worn storage case, herbarium tin, old radio shell, ritual key box, or low-poly chair shape under weak warm lamp-pool lighting, greenish blacks, tobacco browns, dusty cream highlights, PS2 grime, and off-frame darkness. Keep dread through lighting and restraint while preserving readable midtones. Do not show monsters, gore, readable text, typewriter, literal room formula, corridor, weapon, camera, logos, markets, or libraries.',
    'SP06-116':
      'A stealth-game shadow-readability style-card with one original quiet object, rooftop vent form, small drone shadow, or architectural occluder study split into blue-black safe shadows, sodium detection-light pools, sharp visibility contrast, and silent tactical composition. Keep readable concealment zones without guards. Do not show guards, soldiers, weapons, city rooftop cliché, security camera prop, UI markers, readable text, logos, markets, libraries, or corridors.',
    'SP06-117':
      'An arcade-racing velocity-neon style-card with one original sleek hover object, aerodynamic creature silhouette, route marker, or abstract vehicle-fragment pushed through magenta-cyan-lime speed trails, glossy reflections, diagonal lane rhythm, and forward momentum. Keep racing energy without needing a car. Do not show readable billboards, UI overlays, city street cliché, cockpit, guns, text, logos, markets, libraries, or corridors.',
    'SP06-118':
      'An RPG pixel-inventory-icon-system style-card rendered as one enlarged crisp pixel-art loot icon, not a realistic object scene: tide compass shell, seed charm with ceramic face, sealed spice tin, weathered courier boot, moss rune stone, or crafting gem creature on a flat card-ready field. Use visible square pixels, 32x32 or 48x48 icon logic scaled up cleanly, limited earthy ramps, emerald or ruby jewel accent, warm top-left glints, black or dark outline clusters, compact silhouette, and tiny material storytelling. Show one finished card, not an icon sheet. Do not show realistic shell render, 3D object, photoreal material, stone path, landscape background, natural scene, swords, guns, weapons, potions, bags, frame grids, UI labels, readable text, logos, markets, libraries, or corridors.',
    'SP06-119':
      'A cozy-sim seasonal-palette style-card with one friendly original non-anime tiny villager, sprite-scale courier, or scenelet: quilted courier beside a knitted mailbox, tea-cart sprite, seed-calendar charm, seasonal basket house, or garden bundle without blade in soft pixel warmth. Use four-season palette logic: spring mint, summer honey, autumn pumpkin, winter periwinkle, cocoa shadow, and cream highlights with gentle contact shadows and handmade pattern accents. Show one finished card, not a sprite sheet, not gacha/anime character art. Do not show farm/crop/animal requirement, frame grids, UI labels, readable text, logos, markets, libraries, or corridors.',
    'SP06-120':
      'A boss-encounter key-art-tension style-card with one huge original non-weapon threat form plus one tiny unarmed player figure in a readable arena/route state: living architecture, ritual machine, sea-beast silhouette, mountain-idol, or abstract colossal guardian. Use open ash-grey and storm-teal midtones, one menacing accent hue, clear silhouette ratio, and surrounding encounter context so it reads as playable scale tension, not wallpaper. Keep cinematic challenge without combat and avoid black-mush darkness. Do not show swords, guns, weapons, heroic attack pose, active fight scene, castle corridor, brown fog monolith, arena UI, title text, logos, markets, libraries, corridors, or recognizable game boss.',
  };
  return overrides[preset.id];
}

function pack06SubjectVarietyPrompt(key: string) {
  if (!key.startsWith('pack_06__')) return '';
  const shared =
    'Subject variety: do not solve the card with birds, ravens, owls, wing shapes, feathered silhouettes, cute animal mascots, isolated flowers, anime faces, or repeated object icons by default. If nearby SP06 cards already used an animal/object shortcut, choose a medium-led non-anime figure, human-scale scenelet, vehicle, landmark, or environment anchor instead. Animals and objects are allowed only when they are clearly preset-specific and staged with context, not as the generic thumbnail shortcut.';
  const byCategory: Record<string, string> = {
    pack_06__traditional_painting:
      'Rotate toward original figures, human-scale scenelets, fabric/ceramic/metal forms with setting, landscape fragments, architectural details, botanical arrangements, or symbolic material subjects. Avoid repeated studio walls, chairs, curtains, lamps, easels, artist rooms, generic prop arrangements, and default vase/fruit still life.',
    pack_06__drawing_and_sketching:
      'Rotate toward figure studies without hand/tool staging, garment folds on a wearer, vehicles, plants, mineral forms, masks, shoes, furniture fragments, or object construction studies with cast-shadow context.',
    pack_06__printmaking:
      'Rotate toward bold figures, civic scenelets, vessels, plants, masks, machines, architectural cuts, landscape fragments, invented creatures, or object silhouettes with carved/etched mark logic and enough setting to avoid product-icon read.',
    pack_06__digital_art:
      'Rotate toward original non-anime figures, hybrid subjects, devices in use, vehicles in motion, creatures in environment, environment slices, material props, or graphic emblems chosen for the preset rather than generic workstation, flower icon, cute animal, anime face, or bird motifs.',
    pack_06__mixed_media:
      'Rotate toward human/garment fragments, character silhouettes, torn-color worlds, botanical pressings, mask pieces, vehicle scraps, architectural paper, fabric swatches, ticket-like shapes without readable text, and material specimens with scale; avoid bird collage or loose decorative object as the recurring mixed-media answer.',
    pack_06__retro_game_visual_systems:
      'Rotate toward sprites, vehicles, tiles, creatures, props, platform chunks, color palettes, machines, and era-specific display constraints; avoid bird sprites unless the preset clearly asks for them.',
    pack_06__game_art_directions_and_ui:
      'Rotate toward playable silhouettes, vehicles, relics, arenas, interface-adjacent motifs, environment landmarks, and non-weapon props; avoid default winged or bird boss silhouettes.',
  };
  return `\n${shared} ${byCategory[key] ?? ''}`.trimEnd();
}

function pack06ArtDirectionPrompt(key: string, preset?: StyleRuntimePreset) {
  if (!key.startsWith('pack_06__')) return '';
  const presetName = preset ? sanitizeStylePromptName(preset.name) : 'this medium';
  const constrainedColor = preset
    ? pack06UsesConstrainedPalette(key, preset)
    : key === 'pack_06__retro_game_visual_systems';
  const colorDirection = constrainedColor
    ? 'Use deliberate value zones, ink/display states, paper tone, or one controlled accent allowed by the medium. Avoid beige/blue default, muddy monochrome, generic rainbow, stock orange-teal, and weak low-contrast palettes.'
    : 'Use a deliberate color script with 3-5 memorable hues, one surprising accent, and strong warm/cool or value contrast. Avoid beige/blue default, muddy monochrome, generic rainbow, flat primary-color sampler, stock orange-teal, and weak low-contrast palettes.';
  const shared = [
    'PACK 06 ART DIRECTION:',
    `Make ${presetName} feel like a strong finished card, not a basic technique demo, school exercise, simple object study, or generic color sample.`,
    'A merely correct medium demo is still a failed SP06 card: make it feel curated, tasteful, and worth clicking as a thumbnail.',
    colorDirection,
    'Choose a subject/scenario with taste: unusual material scale, cropped world fragment, symbolic object with context, hybrid specimen, figure fragment, environmental slice, or graphic emblem. If the subject is an object, make it feel like a hero artifact from a larger world, not a tabletop prop. Avoid vase/fan/lantern/still-life defaults unless the preset specifically benefits from them.',
    'Build a clear foreground, midground, and background relationship even in graphic media; avoid a lonely centered icon floating on empty beige/blue space unless the preset is explicitly icon-system.',
    'Keep texture controlled and medium-readable, but make large shapes and color hierarchy carry the thumbnail before fine marks.',
  ];
  const byCategory: Record<string, string> = {
    pack_06__traditional_painting:
      'For painting media, use painterly atmosphere, pigment mass, and a subject with context: weathered object in landscape light, cropped architectural relic, dramatic fabric/ceramic form, botanical cluster, or partial figure. No studio setup, no curtain/chair/lamp formula.',
    pack_06__drawing_and_sketching:
      'For drawing media, make line pressure, negative space, and construction logic elegant: cropped garment fold, vehicle shell, mask, plant, mineral, shoe, or figure fragment. Avoid classroom anatomy sheet and hand/tool staging.',
    pack_06__printmaking:
      'For printmaking, use bold poster-like composition, limited but specific inks, registration logic, carved/mesh/press marks, and one memorable emblem or scene fragment. Avoid product-demo objects, office stationery, generic fans/lamps, and bland primary-color blocks.',
    pack_06__digital_art:
      'For digital art, use a more authored non-anime image: designed figure fragment, device, vehicle, landmark, or environment slice with purposeful lighting, shape language, and palette. Avoid anime protagonist grammar, workstation scenes, generic fantasy corridors, and same blue-orange concept-art lighting.',
    pack_06__mixed_media:
      'For mixed media, build a distinctive material-world focal form: garment/architectural/botanical/mechanical fragment, mask, vessel, or human-scale silhouette. Avoid cute animal heads, collage mascots, basic cut-paper face plates, and beige craft-table palettes.',
    pack_06__retro_game_visual_systems:
      'For retro game systems, make the hardware constraint beautiful and unmistakable: unusual sprite silhouette, tile logic, scanline rhythm, palette limitation, vector glow, or cartridge-era composition. Avoid generic pixel creature, plain icon, and UI/screenshot clutter.',
    pack_06__game_art_directions_and_ui:
      'For game-art direction, make it production-useful but card-ready: one playable silhouette, landmark, vehicle, relic, or environment beat with clear loop identity. Avoid concept-sheet grids, weapon focus, HUD, and generic fantasy/market corridors.',
  };
  return `\n${[...shared, byCategory[key] ?? ''].filter(Boolean).join(' ')}`;
}

function pack06HeroPrompt(key: string, preset?: StyleRuntimePreset) {
  if (!key.startsWith('pack_06__')) return '';
  const presetName = preset ? sanitizeStylePromptName(preset.name) : 'the preset';
  if (preset?.id === 'SP06-049') {
    return 'One stylish non-anime human Vector Art figure as the mandatory primary subject: clean face or masked face, readable torso and limbs, flat hard-edged silhouette, poster-like transit or dance scene, and crisp vector color planes. No animal, creature, wings, horns, mascot, emblem-only, flower, anime face, or logo-like symbol.';
  }
  if (preset?.id === 'SP06-112') {
    return 'No character hero. Focal anchor is a coherent sci-fi support-equipment icon kit: 3-5 non-weapon devices sharing scale, contour language, rarity accents, bevel/contact shadows, and atlas-like spacing. The kit must read as collectible game UI art without becoming a character scene, anime mechanic, cute mascot, weapon display, or single product render.';
  }
  const byCategory: Record<string, string> = {
    pack_06__traditional_painting: `One art-directed ${presetName} subject with context: partial figure, dramatic fabric/ceramic form, architectural relic, botanical cluster, vessel, mask, landscape fragment, or symbolic material subject. It must feel selected for taste and color, not a classroom medium sample.`,
    pack_06__drawing_and_sketching: `One elegant ${presetName} drawing subject: figure fragment, garment fold, vehicle shell, mask, plant, mineral form, shoe, furniture fragment, or constructed object. Structure and line pressure must be the first read, not tools or a studio exercise.`,
    pack_06__printmaking: `One bold ${presetName} print subject: emblematic figure, vessel, machine, plant, architectural cut, landscape fragment, invented creature, or graphic scenelet with handmade print force. Make it designed and alive, not office/product stationery.`,
    pack_06__digital_art: `One authored ${presetName} digital-art subject: non-anime designed figure, hybrid creature, vehicle, device, landmark, or environment slice with clear world context. It must read as a finished illustration moment, not anime character-card art, workstation process art, or generic concept-art wallpaper.`,
    pack_06__mixed_media: `One human-scale ${presetName} mixed-material focal form: garment/torso fragment, mask, vessel, architectural/mechanical relic, botanical construction, or figure silhouette with visible material logic. Avoid cute animal-head shortcut and craft-demo object alone.`,
    pack_06__retro_game_visual_systems: `One ${presetName} game-native subject or playable scenelet: sprite, vehicle, tile creature, platform chunk, low-poly figure, symbolic room fragment, or machine constrained by the exact old-system grammar. No generic pixel mascot if a scene would sell the preset better.`,
    pack_06__game_art_directions_and_ui: `One ${presetName} game-useful focal idea in-world: playable silhouette, landmark, relic, vehicle, creature, safe item, encounter beat, or environment node. It must feel designed for a game loop while staying card-ready and HUD-free; do not solve non-anime game presets as anime portrait cards.`,
  };
  return (
    byCategory[key] ??
    `One distinctive ${presetName} subject with medium-specific identity, context, and strong color separation.`
  );
}

function pack06EnvironmentPrompt(key: string, preset?: StyleRuntimePreset) {
  if (!key.startsWith('pack_06__')) return '';
  if (preset?.id === 'SP06-112') {
    return 'Use shallow icon-system context only: floor pads, colored trim planes, clean contact shadows, ghost-icon silhouettes, and a controlled equipment-spread layout. Do not use a mechanic workshop, operator scene, character scale pose, anime helper, UI screen, inventory grid, corridor, market, or library.';
  }
  const byCategory: Record<string, string> = {
    pack_06__traditional_painting:
      'Use purposeful painterly context: atmospheric exterior light, cropped architecture, tabletop only if unusual and art-directed, or shallow material space. No repeated studio wall, chair, curtain, lamp, easel, or vase formula.',
    pack_06__drawing_and_sketching:
      'Use paper surface and negative space as environment, plus one subtle support plane or cast shadow. Avoid classroom, atelier, desk, hand/tool staging, and anatomy-school default.',
    pack_06__printmaking:
      'Use paper, ink fields, registration shifts, carved/etched planes, or compact scene context as environment. Avoid workshop/press/table staging and bland product-demo backgrounds.',
    pack_06__digital_art:
      'Use a purposeful world fragment: open exterior, atmospheric slice, stylized terrain, graphic stage plane, or design-space backdrop. Avoid workstations, UI screens, generic fantasy corridors, and same blue-orange key art.',
    pack_06__mixed_media:
      'Use layered material space with foreground scraps, midground focal silhouette, and background paper/paint field. Avoid craft table, pinboard default, cute collage mascot wall, and beige scrapbook sameness.',
    pack_06__retro_game_visual_systems:
      'Use HUD-free playable screen-space, era-specific ground/space logic, tile depth, scan behavior, vector void, or low-poly fog. Avoid hardware props, menus, screenshots with UI, and plain centered icon when a scenelet fits.',
    pack_06__game_art_directions_and_ui:
      'Use game-world context around the focal idea: traversal lane, encounter space, collectible setting, landmark edge, or material base. Avoid UI boards, inventory screens, concept-sheet grids, and marketing poster layout.',
  };
  return (
    byCategory[key] ??
    'Use specific context with foreground, midground, and background planes; no stock staging.'
  );
}

const PACK06_PALETTE_LOCKS = [
  'oxide red, celadon green, deep aubergine, warm bone, and one acid-lemon accent',
  'lacquer magenta, petrol teal, dirty peach, navy black, and citron yellow',
  'ultramarine, vermilion, sage gray, pearl white, and one sharp black contour',
  'malachite green, bruised violet, sunlit ochre, ink blue, and coral',
  'deep indigo, old gold, moss green, shell white, and one hot-pink edge',
  'tomato red, graphite blue, dry grass, cream paper, and electric cyan',
  'burnt sienna, cobalt glass, sulfur yellow, rose ash, and bottle-black',
  'mango orange, wet slate, pale mint, mulberry shadow, and bone white',
  'signal red, mineral turquoise, tobacco brown, lavender gray, and warm ivory',
  'blue-black ink, opera pink, brass ochre, seafoam green, and clay orange',
  'bitter chartreuse, oxblood, chalk white, storm lavender, and soot green',
  'cobalt violet, persimmon, tarnished silver, cactus green, and warm black',
  'peacock blue, saffron, dried rose, ink plum, and cold porcelain',
  'iron blue, fluorescent peach, swamp olive, rice paper, and black cherry',
  'cinnabar, faded cyanotype blue, dusty lilac, olive black, and raw linen',
];

const PACK06_PALETTE_FAILURE_BREAKERS = [
  'Palette breaker: reject the safe teal-orange, coral-cream-teal, beige-blue, gray-brown, and generic violet-cyan solutions. Pick one dominant color family, one counter-family, one dirty neutral, and one tiny high-chroma accent that is specific to this preset.',
  'Palette breaker: avoid pleasant concept-art harmony. Use a riskier authored split such as acidic warm accent over cold paper, dark botanical green against mineral pink, or antique ink plus synthetic highlight.',
  'Palette breaker: each SP06 retry must look unlike nearby cards at thumbnail scale through color first, then silhouette. If the first read is another muted blue/ochre/teal fantasy card, the image failed.',
  'Palette breaker: keep medium authenticity, but make the color decision memorable; old media can still use sharp accent ink, strange paper color, copper-list bands, or constrained display color.',
];

const PACK06_COLOR_CONSTRAINED_PRESETS = new Set([
  'SP06-008',
  'SP06-017',
  'SP06-018',
  'SP06-025',
  'SP06-027',
  'SP06-028',
  'SP06-029',
  'SP06-031',
  'SP06-032',
  'SP06-034',
  'SP06-036',
  'SP06-037',
  'SP06-038',
  'SP06-040',
  'SP06-042',
  'SP06-043',
  'SP06-044',
  'SP06-076',
  'SP06-077',
  'SP06-078',
  'SP06-081',
  'SP06-082',
  'SP06-083',
  'SP06-089',
  'SP06-091',
  'SP06-092',
  'SP06-093',
  'SP06-094',
  'SP06-095',
  'SP06-096',
  'SP06-097',
  'SP06-098',
  'SP06-099',
  'SP06-100',
]);

function pack06UsesConstrainedPalette(key: string, preset: StyleRuntimePreset) {
  return (
    PACK06_COLOR_CONSTRAINED_PRESETS.has(preset.id) || key === 'pack_06__retro_game_visual_systems'
  );
}

function pack06VaguePalette(value: string) {
  return /^(varied|mood lighting|muted|muted,\s*blended|cinematic|atmospheric|soft|natural|standard|none|n\/a)$/i.test(
    value.trim(),
  );
}

const PACK06_PRESET_PALETTE_AUTHORITIES: Record<string, string> = {
  'SP06-041':
    'Rubber-stamp authority: two or three ink colors maximum, but make them punchy and unusual: tomato red, bottle green, violet black, cobalt stamp blue, or mustard over rough ivory. Avoid cute pastel mascot colors, harbor postcard blues, and beige office-stationery dullness.',
  'SP06-042':
    'Halftone newspaper authority: newsprint off-white plus coarse black rosettes, with one or two strong spot inks such as warning red, cyan, sulfur yellow, or bruised violet. Avoid hooded-commuter blue/gray, fashion neutrals, and clean comic-book gradient color.',
  'SP06-039':
    'Risograph spot inks: neon pink, cobalt or sky blue, lemon yellow, paper off-white, and optional black only for structure. Keep soy-ink misregistration and grain; do not smooth into generic rainbow digital color.',
  'SP06-040':
    'Cyanotype authority: Prussian blue, deep blueprint blue, washed cyan, and paper white only. Richness must come from UV contact-print value, edge softness, and white negative shapes, not added warm accents.',
  'SP06-056':
    'Synthwave authority: magenta and cyan neon may dominate, but add one authored supporting accent and clean dark-violet value blocks. Avoid stock purple sunset, car-road nostalgia, and generic pasted neon glow.',
  'SP06-081':
    'Game Boy authority: four olive-green values only, from pea-soup highlight to moss-black shadow. No extra modern color; make palette rich through tile silhouette and LCD value separation.',
  'SP06-083':
    'Vector arcade authority: mostly phosphor green, amber, or blue-white glowing beam lines on open black. No filled modern color blocks; make variation through vector geometry, glow intensity, and play-space composition.',
  'SP06-091':
    'Vectrex authority: white-green vector phosphor on black, with possible translucent overlay tint. No full-color raster palette; contrast comes from beam density and line hierarchy.',
  'SP06-092':
    'C64 authority: muted Commodore 16-color logic, especially brown, grey, orange, cyan, purple, green, blue, yellow, red, white, and black. Keep chunky multicolor pixels; no modern smooth gradients.',
  'SP06-093':
    'MSX2 authority: bright Japanese home-computer palette with emerald, cherry red, sky blue, golden yellow, and pastel pink. Keep compact screen-mode clarity; no generic 16-bit fantasy palette.',
  'SP06-094':
    'Atari 2600 authority: extreme scanline color limits, bright primaries, rainbow stripes, black ground, and hard 4-color-per-line constraints. No HD richness or smooth shading.',
  'SP06-095':
    'Genesis authority: dark crunchy 64-on-screen color, electric blue, orange sunset accent, bronze warmth, and visible dithering. Avoid modern neon gradients and clean anime lighting.',
  'SP06-096':
    'Neo Geo authority: lavish arcade sprite color with deep saturated ramps, clean highlights, and expensive pixel clusters. Avoid muddy concept art and washed-out fantasy lighting.',
  'SP06-097':
    'Amiga HAM authority: copper-list rainbow gradients, jewel gold, steel grey, Workbench blue, and magenta-cyan fringing. Keep retro computer-art color, not generic synthwave.',
  'SP06-108':
    'Visual-novel neon authority: no default violet-blue wallpaper. Use a story-specific night palette such as sodium amber over wet teal-black, magenta train glow over green shadow, rose neon over graphite rain, or cold cyan window light with persimmon skin accent. Keep open negative space, but color must carry emotion.',
  'SP06-110':
    'Chibi platformer authority: playful clean palette with distinct tiles: melon green, toy red, sky cyan, butter yellow, ink outline, or lavender shadow. Avoid generic pink-purple sparkle, glossy mascot gradients, and object-charm colors.',
  'SP06-098':
    'PC Engine authority: compact bright Japanese console color, orange-brown, gothic red-purple, Hudson yellow, and clean sprite contrast. Avoid dark mascot icon or generic pixel landscape.',
  'SP06-099':
    'Flipnote authority: black-only-on-white or DS-LCD grey with rare red/blue experiment accents. No full-color polish, no frame grid, no UI.',
  'SP06-100':
    'Game Boy Camera authority: four greyscale thermal-dot values, paper white, dark grey, black, and faint chemical blue only if useful. No modern photo color.',
  'SP06-070':
    'Pinned-board palette authority: cork tan and warm paper must be secondary only; primary identity comes from cobalt blueprint blue, tomato red string/routes, citron yellow note blocks, matte black graphite marks, and clean ivory gaps. Avoid beige scrapbook dominance, brown-gray planning walls, fashion-mannequin neutrals, and muted office colors.',
  'SP06-073':
    'Embroidery-photo palette authority: faded cyan or sea-glass photographic base with charcoal grain, then saturated floss accents in vermilion, turquoise, saffron, and hot pink. Thread color must visibly outperform the photo; avoid red-white-blue raincoat sameness, dull train-station blue, and back-view black figure palettes.',
  'SP06-074':
    'Paint-over-photo palette authority: washed photographic greys or pale cyan base aggressively transformed by acid chartreuse, coral red, cobalt, cream paint slabs, and one black scraper mark. It must not share the red-white-blue raincoat/back-view formula with embroidery-on-photo.',
  'SP06-112':
    'Sci-fi icon-kit palette authority: gunmetal and cold blue are allowed only as structure; add one clean rarity accent such as amber, mint, magenta, or white ceramic glow. Keep product-icon clarity but avoid black tabletop render, generic blue cube, weapon-case colors, and sterile grey UI object.',
  'SP06-113':
    'Fantasy MMO parchment palette authority: parchment, ink brown, wax red, jade route marks, lapis water, and warm gold edge wear. Avoid compass-prop still life, sepia-only old map, readable map marks, and centered document object.',
  'SP06-120':
    'Boss-encounter palette authority: open ash grey and storm teal midtones plus one threatening accent family: ember orange, toxic green, crimson, or violet. Dark drama is allowed, but no pure black demon slab, brown fog monolith, or invisible-scale silhouette.',
};

const PACK06_STYLE_TASTE_LOCKS: Record<string, string> = {
  pack_06__traditional_painting:
    'Taste target: gallery-grade painterly illustration. Use bold pigment masses, unusual but harmonious historical color, and a subject chosen for form and atmosphere. Avoid fantasy character-card polish, costume portrait sameness, stock saint/icon poses, and dull brown-blue realism.',
  pack_06__drawing_and_sketching:
    'Taste target: elegant finished drawing plate. Paper, line rhythm, value restraint, and construction must be beautiful before the subject is interesting. Avoid generic character sketch, fashion torso, anime face, messy anatomy, and lifeless classroom study.',
  pack_06__printmaking:
    'Taste target: strong handmade print/poster object. Limited inks must feel intentional and graphic; registration, grain, carve, dot, or plate pressure should read from thumbnail. Avoid muddy antique illustration, isolated decorative animal, and weak beige craft print.',
  pack_06__digital_art:
    'Taste target: art-directed digital illustration with designed shape language. Palette must feel authored and preset-specific, not stock fantasy teal-orange, generic neon purple, blue shadow concept art, or wallpaper-like environment painting.',
  pack_06__mixed_media:
    'Taste target: tactile editorial mixed-media card. Materials must create hierarchy and surprise, not scrapbook clutter. Use one confident color decision, visible seams/relief, and a subject with body or world scale. Avoid beige craft sample, animal-head collage, and object pile.',
  pack_06__retro_game_visual_systems:
    'Taste target: beautiful old-system image, not modern pixel art. Hardware limits, palette constraints, scanlines, vector beams, dithering, tile logic, or low-poly wobble must be first read. Avoid generic pixel creature, mascot icon, and modern concept-art lighting.',
  pack_06__game_art_directions_and_ui:
    'Taste target: polished game-art frame with strong loop identity but no HUD. It should feel playable or production-useful, not fantasy poster, inventory object render, UI mockup, or weapon/concept-sheet bait.',
};

function pack06PaletteLockLine(key: string, preset: StyleRuntimePreset, fallbackPalette: string) {
  const paletteAuthority = PACK06_PRESET_PALETTE_AUTHORITIES[preset.id];
  const stylePalette = valueOf(preset.style, 'color_and_tone', 'color_palette');
  const constrainedByPreset = pack06UsesConstrainedPalette(key, preset);

  if (paletteAuthority) {
    return `Palette authority: ${paletteAuthority} Keep value separation strong and thumbnail-readable; do not dilute into beige/blue, brown/teal, stock orange-teal, or generic purple-cyan sameness.`;
  }

  if (constrainedByPreset && stylePalette && !pack06VaguePalette(stylePalette)) {
    return `Palette authority from preset DNA: ${stylePalette}. Respect the exact medium/system limits; do not add broad modern color, cinematic orange-teal, fantasy brown/teal, or generic neon. Make richness through silhouette, value separation, texture, and crop rather than extra hues.`;
  }

  if (constrainedByPreset && (!stylePalette || pack06VaguePalette(stylePalette))) {
    return `Palette authority: the manifest palette is too vague for this SP06 card, so use ${fallbackPalette} as controlled ink/value/display states rather than full modern color. Respect the named medium/system limits, keep value separation strong, and avoid beige/blue, brown/teal, stock orange-teal, or generic purple-cyan sameness.`;
  }

  return `Palette must use this concrete color script: ${fallbackPalette}. Do not replace it with beige/blue, gray/brown, stock orange-teal, generic neon purple-cyan, or flat primary sampler.`;
}

function pack06TasteLockLine(key: string) {
  return PACK06_STYLE_TASTE_LOCKS[key] ?? '';
}

const PACK06_VALUE_LOCKS = [
  'dark subject against a bright color field, with one clean rim accent',
  'bright subject against saturated midtone shadow, with no muddy gradient',
  'split warm/cool background planes with a clear silhouette break',
  'high-key paper or paint ground with a single dense focal shape',
  'low-key colored darks kept open and denoised, never crushed black mush',
  'two bold flat color masses around one readable figure or scenelet, with texture kept secondary',
  'one saturated backdrop plane, one darker subject plane, and one small high-chroma accent',
];

const PACK06_DARK_READABILITY_PRESETS = new Set([
  'SP06-015',
  'SP06-028',
  'SP06-038',
  'SP06-055',
  'SP06-083',
  'SP06-089',
  'SP06-091',
  'SP06-094',
  'SP06-103',
  'SP06-109',
  'SP06-115',
  'SP06-116',
  'SP06-120',
]);

function pack06ThumbnailReadabilityLine(preset: StyleRuntimePreset) {
  if (PACK06_COLOR_CONSTRAINED_PRESETS.has(preset.id)) {
    return 'Thumbnail readability: preserve the preset/system palette, but separate at least three clear value zones. For vector or monochrome systems, use beam density, line hierarchy, tile silhouettes, or paper-white negative shapes instead of adding extra colors. Avoid near-black blank cards, crushed shadow masses, and tiny detail as the only read.';
  }

  if (PACK06_DARK_READABILITY_PRESETS.has(preset.id)) {
    return 'Thumbnail readability: dark mood is allowed, but keep open colored darks, a readable midtone subject, and one clean accent edge. No crushed black mush, no nearly invisible protagonist, no tiny glow-only focal point.';
  }

  return 'Thumbnail readability: large shapes, palette blocks, and silhouette must read first at card size; medium texture is secondary. Avoid low-contrast beige/blue haze, muddy gradients, and detail-only identity.';
}

const PACK06_CROP_LOCKS = [
  'medium-close crop where the subject fills 55-70 percent of the card height',
  'environmental crop where the subject sits off-center and the setting proves the preset',
  'close material crop with one contextual edge showing the larger world',
  'poster-flat crop with shallow depth, broad negative space, and one bold diagonal',
  'three-plane vertical crop: foreground material cue, midground subject, background color mass',
];

const PACK06_PRESENCE_LOCKS = [
  'Default to a protagonist, human-scale silhouette, worn garment fragment on a body, vehicle in action, landmark with scale figure, or compact scenelet; object-only is a deliberate exception, not the fallback.',
  'If the preset can support a person or hybrid subject, use one clean readable figure with simple anatomy and a preset-specific pose; props and animals stay secondary.',
  'If the preset must be object-led, embed the object in a world edge: cast shadow, terrain cut, architectural plane, hand-scale clue, weather, motion, or background color mass.',
  'Favor a distinctive scene read over a collectible icon: foreground cue, midground anchor, and background palette field must all participate.',
];

const PACK06_NON_ANIME_PRESENCE_LOCKS = [
  'Default to a medium-led figure fragment, human-scale silhouette, worn garment fragment on a body, vehicle in action, landmark with scale cue, or compact scenelet; object-only is a deliberate exception, not the fallback.',
  'If the preset can support a person or hybrid subject, use one clean readable non-anime figure with simple anatomy and a preset-specific pose; props and animals stay secondary.',
  'If the preset must be object-led, embed the object in a world edge: cast shadow, terrain cut, architectural plane, hand-scale clue, weather, motion, or background color mass.',
  'Favor a distinctive scene read over a collectible character icon: foreground cue, midground anchor, and background palette field must all participate.',
];

const PACK06_ANIME_ALLOWED_PRESET_IDS = new Set(['SP06-085', 'SP06-108', 'SP06-114']);

function pack06AllowsAnimePreset(preset: StyleRuntimePreset) {
  return PACK06_ANIME_ALLOWED_PRESET_IDS.has(preset.id);
}

function pack06AnimeScopeLine(preset: StyleRuntimePreset) {
  if (pack06AllowsAnimePreset(preset)) {
    return 'SP06 ANIME-ALLOWED SCOPE: anime, visual-novel, or gacha language is allowed only because this exact preset asks for it. Still keep anatomy clean, denoised, and preset-specific.';
  }
  return 'SP06 NON-ANIME SCOPE: this preset must not become an anime card. If a person or humanoid appears, render them as a medium-specific painterly, drawing, print, collage, sprite, vector, or game-art figure, not a cute anime face, big-eye cel character, shonen pose, visual-novel portrait, gacha framing, glossy cel hair, manga facial shorthand, or generic anime protagonist.';
}

const PACK06_GENERIC_FAILURE_RESET =
  'SP06 anti-generic reset: do not solve with a lone cloaked traveler, back-view raincoat, standing figure looking across water/cliff/arch/gate, red scarf/cape accent, hooded wanderer, generic robed pilgrim, arched ruin, sunset promenade, teal-orange concept-art split, coral/cream/teal fashion palette, or safe heroic silhouette unless the exact preset demands it. If a figure appears, make the body language, crop, palette, and medium treatment specific to this preset; if no figure appears, the material/system grammar must still feel authored rather than like a basic object demo.';

const PACK06_COLOR_TASTE_RESET =
  'SP06 color/taste reset: being medium-correct is not enough. Use a deliberate art-direction palette with one dominant field, one counter-temperature shadow, and one memorable accent. Avoid weak fantasy blues, beige wash, brown fog, stock coral/teal, stock orange/blue, default purple neon, and same-card dark traveler drama. The result should feel curated, stylish, and representative of the named medium rather than a generic adventure/fantasy card.';

const PACK06_CATEGORY_ROUTES: Record<string, string[]> = {
  pack_06__traditional_painting: [
    'partial figure with fabric, ceramic, or botanical context',
    'weathered architectural relic in dramatic painted light',
    'symbolic vessel, mask, or material object embedded in a small world fragment',
    'landscape fragment with one human-scale or object-scale focal anchor',
  ],
  pack_06__drawing_and_sketching: [
    'garment fold, hand-safe figure fragment, shoe, mask, or mineral form with elegant construction',
    'vehicle shell, furniture fragment, plant, or object study with cast-shadow context',
    'single expressive creature or dancer silhouette only when anatomy and contour stay clean',
    'line-led scenelet with one readable subject and lots of intentional paper breathing room',
  ],
  pack_06__printmaking: [
    'emblematic figure, vessel, plant, machine, or architectural cut with strong ink economy',
    'invented creature or mask in a compact print scene, not a decorative animal shortcut',
    'landscape or civic fragment reduced to bold handmade print planes',
    'graphic scenelet with one subject interacting with registration, grain, or carved edges',
  ],
  pack_06__digital_art: [
    'non-anime designed figure, vehicle, device, or landmark in a finished illustration moment',
    'hybrid creature or artifact with enough environment to avoid concept-art wallpaper',
    'open exterior slice or stylized terrain with one designed focal subject',
    'graphic stage plane with authored lighting and a non-default silhouette',
  ],
  pack_06__mixed_media: [
    'human-scale garment, torso, mask, vessel, or relic assembled from visible materials',
    'architectural/mechanical fragment with collage layers and painted context',
    'botanical construction or figure silhouette where material logic is the story',
    'torn-color world fragment with one readable non-animal focal form',
  ],
  pack_06__retro_game_visual_systems: [
    'playable scenelet, sprite, tile creature, vehicle, or platform chunk in exact old-system grammar',
    'era-native screen-space with palette limits, scan rhythm, or low-poly wobble as the world',
    'symbolic room fragment, machine, or game prop that reads as play, not an icon sheet',
    'one sprite-scale subject plus terrain/space logic, not a generic centered mascot',
  ],
  pack_06__game_art_directions_and_ui: [
    'playable silhouette, landmark, relic, vehicle, creature, or safe item inside a game-world beat',
    'encounter space or traversal node with loop identity and no HUD',
    'asset-in-world moment with environment context instead of presentation-board layout',
    'production-useful focal idea that remains a finished portrait card, not a concept sheet',
  ],
};

const PACK06_PRESET_QUALITY_LOCKS: Record<string, string> = {
  'SP06-001':
    'Oil Painting retry correction: do not make a coastline, beach relic, stone arch, ruin, cloaked musician, hooded traveler, cape figure, helmet, saint portrait, gallery still life, or fantasy postcard. Use a classic oil-painting scenelet with one memorable central subject: a ceramic workshop automaton repairing a cracked blue vessel, a red-lacquer theater puppet under side light, or a storm-lit botanical vessel with a tiny scale figure. Palette must feel old-master but alive: umber, malachite, carmine, lead white, deep ultramarine, and warm varnish glow. Thick impasto, glaze depth, and visible brush ridges must be the first read.',
  'SP06-004':
    'Gouache correction: do not make a vase, lemons, flat still life, wall poster, or decorative tabletop. Use flat gouache blocks to show one original raincoat courier, dancer, or masked pedestrian crossing a bold color plaza with oversized botanical/architectural shadows, matte paint edges, and a memorable non-primary palette.',
  'SP06-010':
    'Pointillism correction: do not make a wine glass, fruit, table still life, or decorative sparkle object. Use pointillist color dots for a human-scale promenade scene, harbor performer silhouette, lit carnival boat figure, or market-edge without aisle, with optical color vibration and clear warm/cool separation.',
  'SP06-015':
    'Black Velvet Painting correction: do not make a neon flamingo, lonely animal mascot, velvet poster icon, or object on black. Use a kitsch velvet night scene with one masked lounge figure, roadside shrine fragment, velvet carnival guardian, or glowing animal-shaped sign embedded in a small environment; saturated colors must glow against clean denoised black velvet.',
  'SP06-006':
    'Encaustic Wax retry correction: do not make a coast, ocean, shoreline, arch, cave, shrine, skull-like mask, crystal slab, dark vase, jar, fruit still-life, candle corner, face-in-arch, or brown museum object. Use luminous encaustic layers to show one side-view dancer silhouette, heat-fused garment relic, or tiny human shadow trapped beneath amber, resin yellow, cinnabar, turquoise, and milky beeswax planes. The first read must be wax: fused cloudy layers, scraped pigment, embedded translucent edges, and soft subsurface glow; no open landscape, no fantasy object drama.',
  'SP06-007':
    'Fresco correction: do not make a saint icon, religious portrait, old wall bust, or muddy heritage scene. Use a weathered public-wall fresco fragment with a civic dancer silhouette, cracked architectural animal relief without animal portrait, sun-faded mural figure, or pigment-worn courtyard scenelet.',
  'SP06-014':
    'Casein Paint correction: do not make a safe woman portrait, Tuscan postcard, generic vintage illustration, or muted editorial face. Use matte casein opacity for one crisp mid-century scenelet: canal courier, ceramic-market edge without aisle, subway musician, botanical mechanic, or angular theater figure. Palette must be high-chroma but dry: peacock blue, tomato red, milk white, mustard, pine green, and matte umber shadows. Big opaque shapes and velvety edges must carry the card.',
  'SP06-016':
    'Graphite Pencil correction: do not make a classical bust, fashion torso, garment mannequin, isolated helmet, stair-object, product sketch, or anatomy-school pose. Use a precise graphite scenelet with one readable explorer, courier, seated repair figure, or scale figure interacting with a folded expedition vehicle shell, compact architectural fragment, or root-and-stone specimen. Human-scale presence must be clear but simple; cast shadow and paper tooth carry the medium.',
  'SP06-017':
    'Charcoal correction: do not make a seated ape, bird, winged monster, beak shape, bust, crouched creature, dark animal portrait, hooded wanderer, cape blob, back-view traveler, or red-scarf silhouette. Use one storm-bent human dancer, night courier in a cropped side/front pose, or torn-cloth performer with clean head-torso-limb rhythm. Charcoal masses can be wild, but silhouette must stay human-readable with erased light, open midtones, and one warm accent.',
  'SP06-018':
    'Pen and Ink correction: do not make an anonymous black creature, bird-like silhouette, monster blob, or empty ink splash. Use confident pen linework for one readable street performer, traveler, market-edge without aisle, architectural courier, or compact figure-in-scene with clear hatching hierarchy and clean white-paper breathing room.',
  'SP06-019':
    'Ballpoint Pen correction: do not make a blank object study, product sketch, pen prop, technical doodle, or isolated vehicle shell on empty paper. Use blue-ink pressure lines for one lively courier, cyclist, compact street machine with scale figure, or hand-safe figure-in-motion scenelet. Keep crosshatching broad, silhouette readable, and paper breathing room intentional.',
  'SP06-023':
    'Silverpoint correction: do not make a classical head, human bust, animal head, horse/deer/unicorn creature relic, statue, saint, refined portrait, skull, mask-face shortcut, shell still life, flower object, pale ghost, or nearly invisible decorative specimen. Mandatory primary subject: one full or three-quarter quiet human-scale figure, botanical-machine caretaker, or cloaked traveler drawn in delicate but readable silverpoint, filling at least half the card height. Use warm prepared ground, visible pale metal hairlines, sepia tarnish, and enough midtone contrast to read at thumbnail. Secondary folded metal flower, shell clasp, pale architecture, or mineral-botanical construction may appear only beside the figure.',
  'SP06-025':
    'Technical Pen correction: do not make a helmet, mask, gun-like device, blueprint object, or floating mechanical icon. Use precise technical pen linework for one readable transit kiosk with a small user, cutaway vehicle shell with scale figure, compact architectural machine being entered, or engineered garment silhouette on a body, with measured hatching and no readable labels.',
  'SP06-024':
    'Conte Crayon correction: do not make another classical bust, mannequin, anatomy-school figure, warrior, shield-bearer, barefoot fantasy woman, shrine mask, or historical costume portrait. Use a sanguine/sepia conte scenelet with a side-view stagehand pulling a heavy curtain, a dancer tying red-clay ankle wraps, a ceramic repair figure beside stone blocks, or draped fabric caught by hard side light. Palette stays disciplined but not dull: sanguine red, sepia brown, ivory chalk, smoky black, and one muted blue-gray paper shadow. Human anatomy must be simple, stable, and not heroic fantasy.',
  'SP06-020':
    'Colored Pencil correction: do not make another fashion torso, cropped model, isolated fruit object, decorative relic, or colored costume study. Use a saturated colored-pencil scenelet with one readable courier, garden mechanic, fruit-market-edge traveler without aisle, or small character beside a botanical-mechanical relic. Figure/scene must lead; waxy pencil layering and bright color build support it.',
  'SP06-021':
    'Soft Pastel correction: do not make another bust, torso, fashion figure, hooded cloak, wrapped shawl portrait, back-view traveler, empty mountain postcard, beige haze, or academic model. Use broad soft-pastel color masses for one visible side/front kite-runner, open-faced fabric shelter figure, dancer with wind cloth, or luminous mineral-grove caretaker. Palette must be memorable: peach dusk, blue-violet shadow, mint haze, coral accent, and creamy paper glow; no gray-brown generic landscape.',
  'SP06-022':
    'Oil Pastel correction: do not make another torso, fashion pose, or character costume plate. Use a chunky oil-pastel kinetic subject: market cart silhouette without market aisle, wind-bent tree spirit, ceramic animal-vessel hybrid, or bold street-courier shape with scraped wax color and large pressure ridges.',
  'SP06-027':
    'Chalk Dust retry correction: do not make a horse, wolf, raven, animal portrait, classroom board, black void mascot, cyclist lost in darkness, smoky fantasy cloak, or object-only dust smear. Use powdery chalk on dark green or slate tooth to show one bright dancer-like motion ghost, acrobat, or torn-theater performer crossing a simple graphic ground. Use large white chalk masses plus pale lemon, coral, and cobalt dust accents. Human-scale motion must read first; keep three clear value zones and avoid crushed black mush.',
  'SP06-028':
    'Scratchboard correction: do not make a wolf, cat, owl, bird, beak, feather, leaf-creature, insect, creature portrait, weapon, gothic fantasy beast, or isolated black object. Mandatory primary subject: one readable human night courier, dancer silhouette, tide worker, or scale figure beside a lightning-split botanical form, ornate machine relic, or broken ceramic threshold. High contrast, but no black mush and no animal/plant head as hero.',
  'SP06-029':
    'Silhouette correction: do not make a generic ballet pose, stock sunset figure, cliff hero, animal logo, or empty black cutout. The first read must be silhouette design: one crisp black or dark cut-paper figure/object with beautiful negative-space contour, clear gesture, and two-color background plane. Use one stylish courier, dancer, vehicle, tree-person, or everyday object with context edge; no fantasy scene, no weapon, no face detail.',
  'SP06-030':
    'Continuous Line correction: do not make a classical statue, fashion mannequin, empty contour pose, or generic nude-like study. Use one unbroken-line style scenelet: cyclist, dancer, courier, garment wearer, or traveler interacting with a simple sun/sea/architectural plane. Keep the figure elegant, anatomy clean, and palette graphic enough to differ from nearby drawing cards.',
  'SP06-031':
    'Etching correction: do not make a monkey, insect, animal portrait, bird, beak, penguin-like figure, feathered mask, helmet-head, framed antique creature, old map, decorative plate, tiny traveler under an arch, or muddy ruin vignette. Mandatory primary subject: one human nomad pilot, harbor messenger, or mechanic standing beside a ceremonial engine/tide machine, with visible head/torso/limbs and no animal costume. Palette: limewashed paper, copper black, oxide red, dark cyan, and verdigris. It must read as authored print scene, not specimen icon or ruin postcard.',
  'SP06-032':
    'Woodcut correction: do not make a black monster, demon blob, bird/tree mask, decorative wave, historical costume tableau, or black-red generic beast. Use gouged woodcut planes for one masked pilgrim, storm-bent guardian tree with scale figure, river-crossing courier, or cliff shrine scenelet. Palette: warm bone, black ink, oxblood, moss green, and ochre. Big carved shapes first, wood grain second.',
  'SP06-033':
    'Linocut correction: do not make a decorative mask, fan, leaf emblem, bird-like face, or centered ornament. Use bold linocut blocks for one dancer, cyclist, market-edge courier without aisle, or angular civic guardian crossing a graphic street/bridge plane. Palette must be two or three punchy inks plus paper, with carved registration energy and a clear full-body or three-quarter silhouette.',
  'SP06-034':
    'Lithography correction: do not make a tiny traveler under an arch, back-view cloak watcher, balcony figure, ruin postcard, framed portrait, bill poster, flag/banner hero, or generic soft brown object. Use stone-crayon grain for one three-quarter theatrical guide, acrobat mid-step, or side-view rooftop courier crossing a mosaic plaza. Palette: dry coral, lapis, olive, matte gold, and warm paper. Subject must be readable before texture.',
  'SP06-036':
    'Monotype correction: do not make a muddy standing soldier, generic fantasy figure, gray-brown smudge, back-view harbor watcher, lighthouse scene, dock scene, raincoat traveler, red scarf/cape figure, lone figure staring across water, or object floating in fog. Use a single-pull transfer scenelet with a translucent dancer blur, turning repair worker, side/front human figure with visible gesture, or botanical press-shadow around a visible human-scale anchor. Keep open peach/teal/lilac midtones and one clean saturated accent.',
  'SP06-037':
    'Aquatint correction: do not make a dark mask, gothic object, storm ruin, anonymous brown-black artifact, harbor watcher, lighthouse, dock, water vista, standing man in coat, or near-black card. Use granular rosin tone for a soft gate with moving side-view figure, suspended vessel with scale cue, weather-lit dancer silhouette, or close threshold scenelet. Keep smoky tone elegant with open midtones, warm paper, blue-gray depth, and one coral or citron accent.',
  'SP06-038':
    'Mezzotint correction: do not make a candlelit goblet, helmet, bird, beak, animal statue, mask-head, antique room object, or black mush. Use velvet tonal transitions for one nocturnal figure at a shell-architecture threshold, burnished botanical relic with scale silhouette, folded black drapery over stone, or small moonlit scenelet emerging from clean denoised darkness. Add a visible silver, plum, or amber edge so it reads at thumbnail size.',
  'SP06-040':
    'Cyanotype correction: do not make a butterfly, wing specimen, shell, flower, or isolated blueprint object. Use cyanotype blue to show one human-scale botanical explorer silhouette, moonlit shoreline figure, translucent garment in wind, or architectural sun-print scenelet with crisp white negative shapes.',
  'SP06-041':
    'Rubber stamp correction: do not make a cute animal mascot, panda, owl, toy figure, harbor postcard, object logo, or decorative stamp icon. Use a bold handmade rubber-stamp scenelet with one readable civic dancer, courier, workboat figure, transit worker, or compact machine-animal hybrid pressed into 2-3 flat ink colors plus paper. Require visible ink squash, imperfect stamp edges, repeated offset stamp ghost, and broad graphic shape. No readable postal marks, text, logo, or postcard layout.',
  'SP06-042':
    'Halftone newspaper correction: do not make a raven, bird, beak, monochrome animal, headline page, poster with readable type, hooded traveler, backpack commuter, trench-coat figure, or generic reportage sidewalk. Use coarse halftone dots and rosette fields for one graphic street-level dancer, courier, vehicle-scenelet, or public-event silhouette under a huge red/yellow/cyan ink accent, cropped like text-free reportage with bold dot economy and no readable marks.',
  'SP06-043':
    'Security engraving correction: do not make a pale flower certificate, banknote flower, decorative guilloche sample, or currency copy. Use precise guilloche linework around one invented civic guardian figure, transit landmark, machine relic, or architectural threshold, with non-currency color accents and no readable marks.',
  'SP06-044':
    'Drypoint correction: do not make a fox, animal portrait, pet sketch, sepia creature on blank paper, back-view coat traveler, harbor worker at dock, ship-mast scene, or waterfront silhouette. Use burr-rich scratched lines for one close side/front coat-wrapped dancer, courtyard repair worker, night courier turning toward light, or wind-bent human-scale scene with acidic accent color and rough plate edge.',
  'SP06-045':
    'Collagraph correction: do not make a fox/deer/animal mascot, beige craft animal, textured pet portrait, generic masked sci-fi guard, or dull brown relief sample. Use layered collagraph texture for a masked festival dancer, patched coat transit figure, battered city relic with scale figure, or tactile architectural scenelet. Palette must feel print-authored: clay orange, bottle green, black ink, dusty pink, paper cream, and one ultramarine or citron block. Relief pressure, fabric grain, glue ridges, and chunky ink edges must be visible without becoming clutter.',
  'SP06-046':
    'Digital Painting correction: do not make a cute blue animal mascot, generic fantasy pet, anime hero, or polished creature-on-rock concept. Use a finished non-anime digital illustration moment with one designed figure, hybrid traveler, or vehicle/landmark encounter and a deliberate saturated palette that is not blue-orange fantasy lighting.',
  'SP06-047':
    'Speedpaint correction: do not make a muddy fantasy warrior, creature-only action blur, storm-brown landscape, or brush-demo smear. Use one readable courier, rider, hybrid traveler, or broken vehicle crossing weather, with broad confident strokes, strong value blocks, and one vivid accent that survives thumbnail size.',
  'SP06-048':
    'Matte painting extension correction: do not make an empty vista, empty landing pad, fantasy hall, corridor, generic sci-fi cliff wallpaper, ruin-only scene, tiny unreadable scale dot, or car-only plate. Mandatory anchor: one readable archaeologist-mechanic, repair pilot, or maintenance operator occupying 45-60 percent of card height in the foreground/midground while the expanded landmark remains behind. Palette: oxidized jade, copper, petroleum blue, pale dust, and warm rim light. No empty environment concept art.',
  'SP06-053':
    'Concept Art correction: do not make another generic teal-orange fantasy landscape, spaceship wallpaper, armored warrior, anime hero, or vague creature render. Use one original non-anime designed figure, vehicle, creature, costume silhouette, or landmark encounter with clear design intent, readable shape language, and a color script specific to this card.',
  'SP06-049':
    'Vector Art correction: do not make a lone flower icon, leaf logo, botanical mark, animal, deer, fox, horse, mascot, anime face, or isolated emblem. Use flat vector geometry for one stylish non-anime human figure, transit scene, dance pose, or architectural world fragment with crisp silhouette, hard color planes, and one surprising accent.',
  'SP06-054':
    'Isometric correction: do not make a floating boat, vehicle icon, diorama object, tiny gadget platform, empty platform, or cute asset render. Use an isometric playable scenelet where one human-scale resident, traveler, or courier is clearly visible as the main subject moving through a compact blocky plaza, rooftop, or room fragment; vehicles and architecture stay secondary, no UI.',
  'SP06-051':
    'Low Poly correction: do not make a fox, wolf, animal statue, or polygon mascot. Use low-poly facets for a human-scale explorer, angular vehicle, crystalline landmark, or traversal scenelet with readable scale and bold color contrast.',
  'SP06-052':
    'Voxel Art correction: do not make a flying vehicle, canyon vista, smooth fantasy vehicle scene, tiny shop diorama, tabletop toy display, pixel painting, or painterly low-poly concept art. Mandatory primary subject: one close card-scale voxel courier, block-built creature, cube landmark guardian, or walking cube-machine in a simple isometric plaza. The whole image must be visibly built from hard cube units: square cube faces, stepped silhouettes, isometric block grid, ambient-occlusion seams, per-cube flat color, and no brushy/painterly terrain.',
  'SP06-055':
    'Glitch Art correction: do not make a winged figure, bird silhouette, dark feather mass, monitor prop, cyberpunk runner concept art, generic hooded courier, or noisy black-magenta blob. The first read must be image corruption: large RGB channel slips, compression block tears, scanline gaps, offset silhouette slices, and signal bands visibly breaking one simple subject. Keep backdrop flat/graphic and denoised; no cinematic alley, no fantasy cloak, no wallpaper scene.',
  'SP06-056':
    'Synthwave correction: do not make a generic neon driver, car poster, purple sunset, or chrome mascot. Use a stylized night-run scenelet with one original skater, cyclist, synth courier, or vehicle silhouette crossing bold horizon geometry; reserve magenta/cyan for this preset and keep anatomy/simple motion readable.',
  'SP06-057':
    'Double Exposure correction: do not make a wolf, animal portrait, mountain-animal overlay, generic photo composite, hooded fantasy traveler, back-view cloak silhouette, or empty standing silhouette. The first read must be double exposure: one clean human or object silhouette as mask, with a second readable city/shoreline/machinery scene clearly visible inside it and different from the outer background. Use crisp mask edge, transparent overlap, two-temperature color split, and one non-stock accent; no green fantasy concept art.',
  'SP06-058':
    'Polygon Art correction: do not make another fox, faceted animal, low-poly pet, gem creature, or stiff anatomy demo. Use polygon planes for a dancer, climber, cyclist, vehicle rider, or architectural traversal scenelet with strong angular color blocking, readable joints, and simplified clean anatomy. Palette must use one unexpected warm/cool clash, not gray-blue default.',
  'SP06-059':
    'Digital Paper Cutout retry correction: absolutely no fox, cat, dog, animal head, mascot, toy creature, floating potted plant, decorative boat, cute object island, craft-card object, black cloak, cape, hooded traveler, back-view coat, fantasy pedestrian, or generic street scene. Use layered cutout planes for one bright readable paper acrobat, paper courier, paper cyclist, or paper theater performer in side/front view, with visible cut edges, stacked drop shadows, and bold color slabs. Palette: coral, teal, butter yellow, ink navy, warm cream, and one magenta paper accent. It must read as paper-layer craft before it reads as character art.',
  'SP06-060':
    'ASCII Art correction: do not make a generic landscape, spaceship, aircraft, dark poster, weapon pose, spear, sword, gun, polearm, pixel-art scene, vector-art scene, or code-screen abstraction. Non-readable monospaced ASCII glyphs are required and allowed as image texture: @ # $ % + = . / \\ blocks, density fields, and terminal-era spacing, but no readable words, captions, menu, UI, or text panel. Use glyph-density logic to form one readable courier, rescue craft, vehicle, landmark, or gameplay-like scenelet entirely from character-grid value cells.',
  'SP06-062':
    'Photomontage correction: do not make a cutout bird, animal collage, floating face parts, magazine desk, or surreal object pile. Use photo-cut collage grammar for one original human-scale figure, transit scene, protest-free street vignette, or architectural memory scene with torn edges and no readable typography.',
  'SP06-063':
    'Decoupage correction: do not make a mask-face portrait, centered mask, face-only crop, bust, mannequin, animal head, decorative plate, craft object, or varnished prop alone. Use decoupage paper skin on one readable full-body or three-quarter human-scale carnival figure, garment panel on a wearer, vessel-character with body-language, or architectural reliquary scenelet with a scale figure; lacquer depth and visible torn-paper seams must support the body/scene read.',
  'SP06-064':
    'Assemblage hard retry: do not make any humanoid warrior, hood, cape, cloak, robe, mask-face portrait, armor suit, guard, pilgrim, fantasy figure, standing body, weapon-like pole, shelf collection, boxed diorama, or random object pile. Primary subject must be a non-humanoid found-material construction: a patched vehicle shell, walking market-cart machine, civic shrine-cart, or architectural relic assembled from rust, wood, plastic, wire, cloth, ceramic, bottle glass, and rubber. Add only a tiny scale silhouette if needed; it must not become the hero. Palette: rust orange, bottle green, off-white plastic, faded violet cloth, black rubber, and toy-red accent. Show screws, seams, glue ridges, wire joins, cast shadows, and tactile assemblage relief.',
  'SP06-065':
    'Scrapbook Layer correction: do not make a bird lantern, cute hanging animal, stationery object, or beige scrapbook craft. Use layered paper to show one character silhouette, garment fragment, vehicle ticket-world, or architectural memory scene with torn color planes and no readable text.',
  'SP06-066':
    'Trash Polka correction: do not make tattoo flash, skull pile, animal head, red-black splatter wallpaper, weapon poster, or gore. Use one human-scale silhouette, vehicle scar, ritual garment fragment, or aggressive scene emblem with black realism shards and clean red vector strikes; keep it graphic, text-free, and denoised.',
  'SP06-067':
    'Mixed Media Canvas correction: do not make an animal-head collage, muddy figure blob, generic fantasy portrait, or craft sample. Use one hybrid figure silhouette, garment-plant guardian, architectural material emblem, or object-creature with thick paint, fiber, relief, and a sharp color accent.',
  'SP06-068':
    'Zine correction: do not make an animal mascot, logo-like punk emblem, poster page, text block, or generic black-white icon. Use one street-scale figure, cutout dancer, patched vehicle, or protest-free scenelet with Xerox contrast, rough crop energy, and non-readable graphic noise only.',
  'SP06-069':
    'Moodboard Color Story correction: do not make a palette board, color swatch grid, fashion mannequin, mask bust, faceless torso, abstract layout, pinned object wall, or anime portrait. Mandatory primary subject: one full or three-quarter non-anime figure or human-scale scenelet moving through oversized color-story panels as environment. Broad blocks and material chips stay background rhythm; 4-5 distinctive hues must sell the preset without readable labels.',
  'SP06-070':
    'Pinned Planning Board correction: do not make a mannequin, garment torso, object display, corkboard still life, office wall, readable notes, conspiracy wall, boat, ship, route emblem, or planning-board UI. Use one visible designer, courier, map-runner, or hybrid planning archivist in three-quarter view, actively crossing or leaning into an oversized abstract planning surface made of blank cobalt/citron/coral shape blocks. Red string routes must behave as graphic composition around the figure, not literal evidence-board clutter. The character-world read is primary; pins, tape, cork, and paper are medium evidence only.',
  'SP06-071':
    'Torn Paper Mosaic correction: do not make a generic robed figure, saint icon, bird shape, or flat paper poster. Use torn-paper shards to build one dynamic full-body or three-quarter character, dancer, rider, or mythic traveler against a clear background field. Require chunky torn edges, uneven paper shadows, and a sharper palette than beige/brown craft paper.',
  'SP06-073':
    'Embroidery-on-photo hard retry: do not make a back-view person, hood, coat, raincoat, traveler, doorway watcher, train station, rail platform, wet street, lone dark figure, family snapshot, craft hoop, object-only garment, or plain photo with tiny stitches. Mandatory primary subject: one front-facing or clear side-facing dancer/festival performer with visible head, arms, torso, and legs, no coat and no hood. Thick raised floss must redraw the body and background: vermilion, turquoise, saffron, hot pink, and emerald thread crossing face, garment, arms, and backdrop with visible needle holes and thread shadows. Base photo is faded warm cyan/sepia; thread color must dominate at thumbnail size.',
  'SP06-074':
    'Paint-over-photo correction: do not make a muddy mask, animal head, object prop, generic overpainted portrait, back-view raincoat, or the same stitched-photo traveler as embroidery-on-photo. Use one vehicle corner, street performer, side-view figure, garment-on-body, or architectural scenelet where broad opaque paint slabs aggressively redraw the printed image. Paint must visibly cover, erase, and transform the photo with scraper edges, opaque patches, and mismatched colors while the subject remains readable.',
  'SP06-072':
    'Tape Art correction: do not make an origami crane, paper bird, tape bird, isolated tape sculpture, headless torso, hanging garment, mannequin bust, or fashion-object display. Use tape strips to build one complete dynamic human-scale figure, cyclist, dancer, rider, or doorway scene with visible head/torso/limb rhythm, vivid tape color blocks, and clear negative-space silhouette.',
  'SP06-076':
    'Fumage correction: do not make a moth, smoky insect, animal apparition, or gray-brown fog blob. Use smoke marks to reveal one elegant figure silhouette, garment-in-motion, ritual doorway, or mechanical relic emerging from controlled smoky value shapes with one hot accent.',
  'SP06-077':
    'Coffee Painting correction: do not make a flower, sepia botanical sample, cup stain demo, beige object, empty window, abstract wall crop, back-view harbor traveler, person staring across water, dock scene, or boat postcard. Mandatory primary subject: one warm narrative side/front human-scale scenelet, rain-shelter worker, old transit-corner person turning toward light, boat-repair figure away from water, or garment silhouette on a body. Coffee washes must create rich value range around the figure, with one colored accent if needed.',
  'SP06-078':
    'Gold Leaf correction: do not make a lone feather, decorative leaf, gilded ornament, or luxury product detail. Use gold leaf as broken light around one figure, mask, architectural relic, or ceremonial garment scene with matte dark counter-shapes and broad clean gilded planes.',
  'SP06-080':
    'Stencil Art correction: do not make a wolf, animal logo, streetwear beast icon, or red-black mascot. Use stencil layers for one original urban figure, dancer, rider, transit scene, or architectural silhouette with bold cut shapes, two strong inks, and no readable graffiti.',
  'SP06-081':
    'Game Boy green monochrome correction: do not make a turtle, frog, pet, animal mascot, or single creature icon. Use a green-monochrome gameplay-like scenelet with one tiny player sprite, vehicle, or traversal moment inside readable tile space, with chunky dithering and no UI text.',
  'SP06-082':
    'SNES Mode 7 correction: do not make a sunset boardwalk, pier promenade, generic blue-orange racing vista, lonely traveler, pretty perspective wallpaper, animal mount, ray, bird, dragon, winged creature, or aircraft-only object. Use a HUD-free 16-bit gameplay-like tilted plane: rotating tiled terrain, checkerboard road/river/airship deck, one readable sprite-scale human rider or kart-like vehicle with pilot cue, horizon compression, chunky sprite shadow, and a saturated SNES palette with violet sky, lime/cyan tiles, warm peach highlight, and deep navy outline. The first read must be Mode 7 screen-space with playable scale, not concept art or creature art.',
  'SP06-084':
    'FMV pre-rendered sprites correction: do not make a static anime portrait, card frame, menu box, smooth render, object sprite, or concept art. Use a gameplay-screencap-like pre-rendered sprite moment: one low-resolution character or creature sprite clearly acting in a chunky 90s background, with 256-color compression, aliasing, baked highlights, and no HUD/text.',
  'SP06-085':
    'Visual novel screen correction: do not make a UI card frame, dialogue box, lower-third panel, translucent rectangle, menu, empty background, object still life, or generic anime portrait. Use one quiet original character silhouette or partial figure occupying 45-65 percent of the card inside a mood-heavy ADV still: rain window, train glow, small room corner, or neon exterior plane. Represent visual-novel grammar through stillness, crop, mood lighting, and dialogue-safe negative space only; no visible interface box of any kind.',
  'SP06-083':
    'Vector arcade wireframe correction: do not make a wireframe bird, wing, animal, fish, dragon, spaceship-only object, or constellation pet. Use glowing vector lines for one gameplay-like rider, vehicle chase, tunnel traversal, geometric arena, rescue craft with pilot cue, or horizon-grid run. No creature silhouette unless clearly non-bird and scene-led.',
  'SP06-089':
    'ANSI roguelike correction: do not make a black empty terminal, readable words, command prompt, UI window, or modern pixel sprite. Use CP437-like glyph cells as image texture to form one symbolic room fragment, creature, altar, or item cluster with clear 16-color value separation and no text.',
  'SP06-091':
    'Vectrex correction: do not make a tiny abstract scribble, bird, fish, spaceship-only icon, or black empty card. Use vector beam lines to show one rider, rescue craft, arena traverse, or geometric creature with strong line hierarchy, visible play-space, and clean phosphor glow.',
  'SP06-094':
    'Atari 2600 correction: do not make a modern pixel-art scene, rich palette, detailed creature, or smooth landscape. Use primitive playfield logic, fat scanline blocks, sprite flicker, and a simple playable subject or scene fragment with extreme memory-limit charm.',
  'SP06-088':
    'PSX vertex wobble correction: do not make an empty fog vista, back-view cloak traveler, generic lonely wanderer wallpaper, horror corridor, bus-stop wallpaper, or clean modern low-poly render. Use a HUD-free in-engine screencap read with one readable low-poly side-view player, rescue vehicle with driver cue, shrine-machine with scale figure, or strange playable companion inside a plaza/cliff/train-yard edge. Show affine texture swim, chunky polygons, dithered fog, hard triangle seams, and a weird but readable sodium green, dirty violet, rust orange, and grey-blue palette. Playable screen grammar must beat mood-poster drama.',
  'SP06-095':
    'Sega Genesis dither-heavy correction: do not make a concert stage, generic night character, smooth anime portrait, or dark parallax wallpaper. Use crunchy 16-bit side-view or three-quarter gameplay energy with one readable sprite-scale hero, vehicle, or creature crossing a dithered foreground. Palette must feel Genesis: electric blue, bronze orange, dirty purple, deep black, and checkerboard ramps.',
  'SP06-097':
    'Amiga HAM correction: do not make a glossy neon corridor portrait, cyberpunk woman, modern vaporwave tunnel, hovercraft, vehicle chase, smooth synthwave scene, 3D craft, realistic 80s illustration, centered creature portrait, bird-beak mascot, staff holder, or fantasy beast key art. Use 1980s Amiga DeluxePaint screen-space: flat demo-scene composition, chunky sprite-scale dancer/robot/mask icon with no weapon or staff, copper-list gradient bands, Workbench blue panels, HAM color fringing, hard pixel stair steps, PAL interlace, and weird video-toaster color abundance. It should feel like an Amiga art screen captured from old software, not modern neon character art.',
  'SP06-086':
    'RPG Maker chibi tileworld correction: do not make a fox, cat, animal companion, cozy shop display, or object tile. Use one chibi human adventurer or villager in a readable tile-map scene with path, house edge, water/grass tile logic, and no menu/HUD/text.',
  'SP06-090':
    'Voxel block sprites correction: do not make a turtle, dinosaur, animal mount, toy creature, robot statue, vehicle display, or isolated voxel object. Use a voxel gameplay scenelet with one blocky human-scale character clearly acting inside a small environment, with chunked shadows, secondary props only, and no inventory/UI.',
  'SP06-098':
    'TurboGrafx PC Engine correction: do not make a tiny generic pixel creature, blank night landscape, or mascot icon. Use a colorful 16-bit gameplay-like scenelet with one player sprite, vehicle, or enemy form moving through a side-view/overhead play space, limited palette, readable tiles, and no UI text.',
  'SP06-099':
    'DS Flipnote correction: do not make a construction crane icon, object blueprint, UI frame, sticker drawing, or blank doodle. Use crude black stylus lines to show one simple but lively figure, creature, bicycle, or room gag mid-motion, with jittery flipbook marks and one rare red/blue accent. Keep it handmade and characterful, no readable text or app UI.',
  'SP06-100':
    'Game Boy Camera thermal print correction: do not make a gray object photo, blank isometric item, or camera-device prop. Use one strange low-res thermal snapshot of a person, toy-like vehicle, or room fragment translated into high-contrast monochrome dithering with a single ghostly focal silhouette and no hardware shown.',
  'SP06-102':
    'Roguelike tile-glyph correction: do not make a lone cube, item box, UI tile, inventory icon, or empty black grid. Use glyph-cell logic to form one readable dungeon-room moment with a tiny adventurer silhouette, strange safe creature, altar/object cluster, or trap layout; keep it symbolic, high-contrast, and text-free.',
  'SP06-103':
    'Metroidvania parallax correction: do not make a generic eclipse poster, soulslike ruin vista, tiny unreadable wanderer, or teal-black concept-art wallpaper. Use a side-view playable 2D frame with a clear player silhouette, foreground occluder, midground route, distant parallax layer, readable platform/traversal edge, and one unusual accent family such as amber spores, toxic mint, or rust magenta. It must feel like a game screen without HUD, not key art.',
  'SP06-104':
    'Cyberpunk diegetic HUD hard correction: mandatory primary subject is one readable non-anime courier silhouette occupying 45-65 percent of the card height inside a street-scale signal moment. HUD-like light strata wrap around the person as non-readable atmosphere only. Do not make a camera prop, drone, tripod, monitor wall, UI screen, object core, glowing device, dashboard closeup, floating interface panel, or abstract interface glow as the hero.',
  'SP06-105':
    'Retro fighting select-screen correction: do not make an animal-headed fighter, jackal/cat/fox/wolf mascot, museum fighter portrait, gallery concept art, or readable UI grid. Use fighting-game selection energy as a text-free card: one original human or humanoid combatant silhouette with bold portrait crop, color blocks, implied selector geometry, and simplified clean anatomy; no franchise costume, no labels.',
  'SP06-106':
    'Isometric strategy tile correction: do not make a board-game object, empty base, resource machine alone, or UI-like tile cluster. Use a compact strategy scene with one tiny worker, commander silhouette, creature habitat, or settlement beat inside readable 2:1 isometric blocks. Keep grid logic implied by terrain, not visible UI.',
  'SP06-108':
    'Visual novel neon backdrop correction: do not make an empty window, corridor, object still life, storefront-only card, tiny figure in a far window, wallpaper background, back-view black-coat train-platform silhouette, hooded commuter, or generic rain-station scene. Mandatory primary subject: one quiet archivist, tech courier, laundromat witness, vending-machine shelter figure, or story lead occupying 45-65 percent of the card height, front or side three-quarter, integrated into a rainlit street-edge neon moment. Keep dialogue-safe negative space but no actual dialogue UI. Emotional character staging must be the first read; background glow is support only.',
  'SP06-107':
    'MOBA splash correction: do not make a generic rendered beast, blue-orange fantasy creature, object boss portrait, or concept-art splash without game-read. Use one original champion-scale silhouette in a diagonal lane encounter with readable ability color shapes, secondary minion/tower/environment cues, and a non-stock palette such as jade-violet-gold, ember-cyan-ink, or orchid-lime-slate. Keep it stylized and game-illustration-ready, not muddy monster wallpaper.',
  'SP06-110':
    'Chibi platformer correction: do not make a glossy sticker mascot, floating cute blob, object charm, gacha pet, or pink generic kawaii creature. Use a HUD-free side-view platformer moment with one chibi human, hybrid kid adventurer, or creature-rider mid-bounce on readable platforms, squash-and-stretch pose, clean limbs, tile props, and a playful but specific palette beyond pink-purple sparkle.',
  'SP06-109':
    'Soulslike correction: do not make a black ruin, empty gothic object, armored knight portrait, sword pose, boss poster, back-view cloak traveler, backpack pilgrim, tiny lone wanderer, giant archway postcard, or unreadable darkness. Mandatory primary subject: one burdened mask carver or quarry artisan in front/side three-quarter view, 45-65 percent of card height, hands visible shaping or carrying a weathered mask/relic. Use old-gold backlight, open ash-gray midtones, malva shadow, copper, and mineral turquoise. Character gesture must beat generic ruin mood.',
  'SP06-112':
    'Sci-fi arsenal icon kit correction: do not make a gun, weapon rack, camera, anime mechanic, cute mascot helper, generic equipment render, sterile product icon, lone glowing device on a plinth, centered glowing cube/capsule alone, or black tabletop product shot. Use a small coherent kit of 3-5 non-weapon support-device icons staged as an in-world equipment spread: med capsule, shield core, scanner puck, field pack, drone battery, rescue beacon, or repair module with crisp outer contours and shared scale. Context must come from floor pads, ghost-icon silhouettes, color-coded trims, bevel/contact shadows, and atlas-like spacing, not from a character operating the object. Keep it icon-system-first, no visible human face, anime hair, mascot eyes, UI frame, labels, or weapon colorway.',
  'SP06-113':
    'Fantasy MMO parchment interface correction: do not make a readable map, compass rose, centered document still life, parchment prop, UI window, old-map product render, or single circular medallion. Use parchment material as living world grammar around one tiny quest courier, route-beast, relic carrier, sealed gate token, or top-down travel scene with visible figure scale. Non-readable route marks, wax seals, torn paper cliffs, and ink coastlines can become terrain; the card must feel like a game-world parchment scene, not a map object.',
  'SP06-114':
    'Anime gacha foil frame correction: do not make a cute mascot sticker, UI card frame, object charm only, or generic sparkle animal. Use one original magical character, spirit companion with human-scale cue, or premium summon moment inside abstract foil geometry. Keep sparkle controlled, anatomy cute but clean, and no readable stats/text.',
  'SP06-115':
    'Survival horror save-room correction: do not make a literal typewriter room, corridor, camera prop, weapon, black object cluster, or unreadable dark square. Use one safe-but-uneasy human-scale scenelet or seated silhouette with storage relics under warm lamp-pool lighting, green-black shadows kept open, and PS2 grime controlled by denoise.',
  'SP06-111':
    'Battle royale compression colorway correction: the primary subject must be one readable non-weapon human survivor taking 45-65 percent of the card height. Do not make a generic teal-orange ruin, beacon tower, crystal obelisk, loot pod, vehicle, supply crate, lone object, gun focus, or dark tactical concept art. Use compressed-gameplay color logic around the survivor crossing a shrinking-zone environment; environmental props must stay secondary, no HUD, no weapons foreground, and denoised darks.',
  'SP06-116':
    'Stealth shadow readability correction: do not make a camera prop, drone icon, guard scene, dark alley, black object, empty architecture, or abstract occluder study. Mandatory primary subject: one readable infiltrator silhouette occupying 35-55 percent of card height, crossing brutalist stair blocks, mosaic wall planes, light cone, and safe-shadow path in graphic blue-black, brick, glass green, and sodium shapes. Figure must remain legible at thumbnail size; no visible camera device, gun, UI, or text.',
  'SP06-117':
    'Arcade racing velocity correction: do not make an abstract neon tunnel, vehicle fragment, or light-trail wallpaper. Use one readable racer, hover-bike silhouette, vehicle, or creature-rider pushed through diagonal lane rhythm with magenta-cyan-lime speed trails. It must feel playable and kinetic, not empty VFX.',
  'SP06-118':
    'RPG inventory icon correction: object-icon grammar is allowed, but avoid realistic boot/product render, stone path, landscape, or generic item still life. Use one enlarged crisp pixel-art loot icon with clear 32x32 or 48x48 square-pixel logic, dark outline clusters, jewel accent, and compact material story on a flat field; no UI frame or text.',
  'SP06-120':
    'Boss encounter correction: do not make a pure black demon poster, weapon duel, castle corridor, title-card art, brown fog monolith, or generic fantasy boss doorway. Use one huge non-weapon threat form with an unmistakable scale ratio against one tiny unarmed player figure in open midtones. Threat can be living architecture, ritual machine, sea-beast silhouette, mountain-idol, or abstract colossal guardian, but it must have readable shape logic, one menacing accent hue, and enough surrounding arena/route context to feel like an encounter state rather than concept-art wallpaper.',
};

function pack06DiversityLockPrompt(key: string, preset: StyleRuntimePreset, seed: string) {
  if (!key.startsWith('pack_06__')) return '';
  const idNumber = Number(preset.id.match(/^SP06-(\d+)$/)?.[1] || 0);
  const seedHash = hashString(`${seed}:${preset.id}:${preset.name}:${key}`);
  const routes = PACK06_CATEGORY_ROUTES[key] ?? [
    'one readable subject or scenelet with medium identity and contextual color',
  ];
  const palette = PACK06_PALETTE_LOCKS[(idNumber + seedHash) % PACK06_PALETTE_LOCKS.length];
  const value = PACK06_VALUE_LOCKS[(idNumber * 3 + seedHash) % PACK06_VALUE_LOCKS.length];
  const crop = PACK06_CROP_LOCKS[(idNumber * 5 + seedHash) % PACK06_CROP_LOCKS.length];
  const presenceLocks = pack06AllowsAnimePreset(preset)
    ? PACK06_PRESENCE_LOCKS
    : PACK06_NON_ANIME_PRESENCE_LOCKS;
  const presence = presenceLocks[(idNumber * 11 + seedHash) % presenceLocks.length];
  const route = routes[(idNumber * 7 + seedHash) % routes.length];
  const paletteBreaker =
    PACK06_PALETTE_FAILURE_BREAKERS[
      (idNumber * 17 + seedHash) % PACK06_PALETTE_FAILURE_BREAKERS.length
    ];
  const paletteLine = pack06PaletteLockLine(key, preset, palette);
  const thumbnailReadability = pack06ThumbnailReadabilityLine(preset);
  const presetQualityLock = PACK06_PRESET_QUALITY_LOCKS[preset.id] || '';
  const earlyReset =
    idNumber >= 1 && idNumber <= 24
      ? 'EARLY SP06 RESET: do not make another classical bust, vase, goblet, saint icon, classroom study, or safe still-life. Use a subject with context, stronger color authorship, and more surprising shape language.'
      : '';
  return [
    'PACK 06 QUALITY LOCK:',
    presetQualityLock,
    pack06AnimeScopeLine(preset),
    PACK06_COLOR_TASTE_RESET,
    paletteLine,
    paletteBreaker,
    pack06TasteLockLine(key),
    'Medium-first read: the named medium/system must be obvious before narrative content. If viewer needs label to understand the preset, the image failed.',
    `Value/composition contrast: ${value}.`,
    thumbnailReadability,
    `Crop route: ${crop}.`,
    `Presence route: ${presence}`,
    `Subject route: ${route}.`,
    'At thumbnail size, this card must differ from neighboring SP06 cards by palette, silhouette, crop, scene logic, and medium treatment, not only by a character/object swap.',
    'Avoid poor default staging: centered academic bust, isolated vase/goblet/fan/lantern, single animal mascot, craft-table sample, workstation, pinboard, generic fantasy object, corridor, market aisle, library aisle, or empty abstract field.',
    'Avoid poor color: low-saturation beige/blue fog, muddy brown-gray, repeated teal-orange cinematic split, generic purple-cyan neon, same dark-cloak palette, and flat sampler primaries.',
    'Avoid poor genre drift: do not turn this into generic fantasy concept art, RPG character card, sci-fi wallpaper, cozy marketplace, library aisle, studio setup, or abstract design wallpaper unless the exact preset demands that grammar.',
    PACK06_GENERIC_FAILURE_RESET,
    'If a human or creature appears, keep anatomy simple and clean; if the medium is object-led, give the object a world/context edge so it is not product art.',
    earlyReset,
  ]
    .filter(Boolean)
    .join(' ');
}

function pack06CreativeBriefLine(preset: StyleRuntimePreset) {
  const brief = valueOf(preset.style, 'creative_brief');
  if (!brief) return '';
  const compact = brief.replace(/\s+/g, ' ').trim();
  const clipped = compact.length > 280 ? `${compact.slice(0, 277)}...` : compact;
  return `PRESET BRIEF: ${clipped} Use as positive identity and medium behavior, not as a required literal scene.`;
}

const PACK08_PALETTE_LOCKS = [
  'black, ivory, oxblood, and one cool silver accent',
  'warm sand, ink navy, muted coral, and ceramic white',
  'acid lime, charcoal, denim blue, and clean cream',
  'dusty rose, deep plum, brass, and soft gray',
  'cobalt, tangerine, pale mint, and matte black',
  'moss green, tobacco brown, faded lilac, and bone',
];

function pack08FashionLockPrompt(key: string, preset: StyleRuntimePreset, seed: string) {
  if (!key.startsWith('pack_08__')) return '';
  const index = hashString(`${seed}:${preset.id}:${preset.name}`) % PACK08_PALETTE_LOCKS.length;
  const presetCue: Record<string, string> = {
    'SP08-064':
      'Burlap/Rags correction: ragged cloth, frayed seams, rope belts, patched layers, and worn drape must define the outfit. Keep hands empty or naturally gestural; no blade, weapon, tool, bag, survival prop, or scavenger-action pose.',
  };
  return [
    'PACK 08 FASHION LOCK:',
    `Use one adult fashion subject with believable anatomy and a garment-first silhouette. Palette: ${PACK08_PALETTE_LOCKS[index]}.`,
    'The outfit must carry the preset identity through cut, fabric, drape, trim, layering, shoes, and posture; face, props, and set stay secondary.',
    'Keep hands empty or naturally gestural unless the preset explicitly requires a small worn accessory. No weapon, tool, handheld gadget, prop-first pose, or survival-action staging.',
    'Use a compact editorial background with one preset-specific cue, not runway crowd, fashion catalog page, mannequin display, closet, boutique aisle, object-only garment, or abstract textile field.',
    'Vary crop across cards: full-body when silhouette matters, three-quarter when garment construction matters, close crop only for fabric/texture categories.',
    presetCue[preset.id] || '',
  ].join(' ');
}

function pack09MaterialLockPrompt(key: string, preset: StyleRuntimePreset) {
  if (!key.startsWith('pack_09__')) return '';
  const presetCue: Record<string, string> = {
    'SP09-028':
      'Shattered glass correction: no gallery plinth, display stand, trophy shard, clean product render, upright sculpture, mirror prop, or window requirement. Show glass as a dangerous material event: impact spiderweb, suspended shards, cracked safety-glass sheet edge, refractive fragments across a rough surface, green edges, and light splitting through broken planes.',
    'SP09-031':
      'Shiny latex correction: no fetish body, boots, legs, corset, bodysuit, lingerie-like framing, skin-tight human pose, or pinup crop. Show latex as abstract material tension: inflated sheet, sealed glove-like non-body form, stretched membrane over a simple frame, glossy red/black folds, specular streaks, and smooth elastic surface behavior.',
    'SP09-053':
      'Smoke/Fog correction: no hooded figure, wizard, ghost-person, face, body, robe, doorway scene, orb, or anime-fantasy character read. Make grey-white volumetric fog the subject: layered density bands, soft edge loss, half-seen nonhuman slab silhouettes, damp atmospheric depth, and slow turbulence.',
    'SP09-058':
      'Sparks correction: no hammer, grinder, hand, worker, forge task, weapon, or tool as the card hero. Show sparks themselves as the subject: orange-white particle arcs from off-frame friction, dark worn metal planes, hot trails, warm pulses, and motion blur.',
    'SP09-061':
      'Dry Ice Fog correction: no crystal monument, altar, temple, stage prop, fantasy relic, person, or gothic room. Show low-lying cold fog as the subject: dense white vapor pooling over simple dark planes, pouring like liquid, gravity-hugging volume, and soft theatrical light.',
    'SP09-062':
      'Confetti correction: no carnival mask, party prop, table display, stage set, or decorative relic as the focal object. Show falling paper rectangles as the subject: layered color scraps suspended mid-air, random rotation, shallow depth, clean paper texture, and celebratory motion.',
    'SP09-063':
      'Cobweb correction: no ornate weapon, emblem, window, gothic wall, cathedral prop, spider, or fantasy relic as the hero. Show dusty filament architecture as the subject: chaotic grey strands, sticky intersections, draped veils, backlit silver thread, and dust gathered at line crossings.',
  };

  return [
    'PACK 09 MATERIAL LOCK: this pack is texture/materiality, not anime, character art, mascot art, creature hero, RPG relic art, fashion portrait, or x-punk. The first read must be the named material, surface, particle field, fluid, fracture, textile, or volumetric FX behavior itself.',
    'No human/anime face or body, no hooded figure, no character hero, no creature hero, no masks as subject, no weapons/tools as focal props, no symbolic emblem/glyph/badge, no decorative fantasy relic, no room/studio/corridor/market/library/altar/temple/showroom staging, no camera/lighting gear, no labels, logos, or text.',
    'Prefer one readable material/event anchor: macro surface, particle cloud, volumetric plume, fracture field, fluid pool, filament field, or worn tactile closeup. Any environment or object support must stay shallow, partial, secondary, and clearly subordinate to the material behavior.',
    'If the category label conflicts with the preset name, obey the preset name and visual DNA first; do not turn FX presets into metals/minerals artifacts or fantasy objects.',
    presetCue[preset.id] || '',
  ]
    .filter(Boolean)
    .join(' ');
}

function categoryBasePrompt(
  pack: StyleRuntimePack,
  category: string,
  seed?: string,
  preset?: StyleRuntimePreset,
) {
  const key = styleCategoryImageKey(pack.id, category);
  const presetBaseOverride = pack.id === 'pack_15' ? undefined : presetBasePromptOverride(preset);
  const pack16BaseOverride = pack16AnimeBasePromptOverride(pack, preset);
  const base =
    presetBaseOverride ??
    pack16BaseOverride ??
    (preset?.id === 'SP04-080'
      ? 'A finished brush-pen ink style-card on clean absorbent paper: one standalone creature, object, or abstract material subject made from broad expressive ink strokes, dry-brush skips, wash blooms, wet pooling, and strong negative space. No studio, workshop, table, print block, plate, press, brayer, tray, person, hand, brush prop, calligraphy text, scroll, bamboo, or landscape.'
      : preset?.id === 'SP02-038'
        ? 'A comic-offset 3D style-card with one original non-franchise kinetic subject: angular courier silhouette, black-cat creature, abstract city-leaper, or geometric vehicle fragment crossing blocky rooftop planes. Make the first read halftone shadows, CMYK/RGB misregistration, ink contours over simplified 3D forms, printed dot texture, offset color plates, and graphic motion panels without readable text. No anime girl, no manga face, no romance window, no school/cafe/library/corridor, no spider suit, no web motif, no superhero likeness, no logo, and no copied franchise composition.'
        : preset?.id === 'SP04-085'
          ? 'A mood color-script style-card made from broad palette blocks, atmosphere bands, value keys, and time-of-day color progression across one readable environment beat such as harbor, forest clearing, canyon gate, industrial dock, or storm-lit road. No person, hero, character, body, face, weapon, cape, cliff pose, castle, fantasy landscape painting, panel grid, storyboard frames, text, or finished render.'
          : preset?.id === 'SP04-082'
            ? 'A photobash-paintover style-card with one readable non-human concept: creature fragment, vehicle chunk, field kit, crashed pod, or material-heavy environment slice built from visible collage seams, photo-texture patches, lasso-cut shapes, painted integration strokes, and unified color grade. No fantasy gate, stone portal, corridor, full character portrait, heroic pose, weapon, fantasy cliff scene, clean final illustration, before-after layout, UI, text, labels, or tutorial board.'
            : preset?.id === 'SP04-088'
              ? 'A rough environment-pass style-card focused on macro-shape blockout, atmospheric recession, large painterly strokes, value grouping, and scale mood in one readable wide place such as canyon gate, industrial dock, forest shrine silhouette, alien plain, or coastal ruins. No person, hero, character, body, cape, weapon, cliff pose, corridor, hallway, finished fantasy vista, detailed landscape painting, or tiny render detail.'
              : preset?.id === 'SP04-092'
                ? 'A costume exploration style-card focused on readable garment language through cropped fragments only: textile swatches, sleeves, cuffs, collars, trims, folds, belts, color strips, material patches, and accessory rhythm. No full posed model, face, body, figure lineup, weapon, sword, staff, fashion catalog page, runway scene, lingerie read, readable labels, or single finished outfit.'
                : preset?.id === 'SP04-093'
                  ? 'A lighting scenario style-card showing the same readable non-human subject relit across several mood passes: mask, small shrine, vehicle shell, creature statue, or object silhouette with rim light, bounce color, exposure bands, shadow temperature, and haze variation. No person, hero, character, face, body, cape, weapon, fantasy vista, cliff pose, single scene, readable text, or UI.'
                  : preset?.id === 'SP04-096'
                    ? 'A weapon-tier progression style-card showing one original stylized weapon family evolving across 3-4 versions: ceremonial blade, staff, bow, axe, shield-weapon hybrid, or sci-fi tool-weapon silhouettes with increasing material rarity, silhouette complexity, ornament deltas, and modular upgrades. Keep it as concept-design progression, not a combat scene. No real firearm realism, no person holding a weapon, no arm/hand, no injury, no gore, no inventory UI, no readable labels, and no single isolated artifact.'
                    : preset?.id === 'SP04-097'
                      ? 'A composition thumbnail grid style-card made of rough grayscale value blocks and crop studies for one readable scene or object idea such as vehicle wreck, harbor gate, creature nest, shrine, or road bend. Multiple mini compositions with framing rectangles, focal masses, perspective alternates, and value grouping only. No brayer, roller, printmaking tool, hand, person, readable notes, storyboard story, film scene, polished render, or single prop repeated.'
                      : preset?.id === 'SP05-021'
                        ? 'An original shonen-adventure style-card built from motion scarf ribbons, training-charms, cel-shaded fabric folds, impact arcs, and a cropped non-famous costume/hand/boot fragment rather than a face. No forehead band, metal plate, spiral mark, orange jumpsuit, ninja village, kunai, shuriken, copied hairstyle, boy hero portrait, or recognizable franchise composition.'
                        : preset?.id === 'SP05-023'
                          ? 'An original elastic-adventure style-card built from nautical color blocks, rope arcs, exaggerated glove/boot/cloth fragments, sky-blue freedom energy, and one invented emblem-like costume crop rather than a face. No straw hat, red open vest, scar under eye, pirate skull flag, named-crew likeness, ship mast hero pose, exposed torso focus, or recognizable franchise composition.'
                          : preset?.id === 'SP05-028'
                            ? 'An original lo-fi rhythm-action style-card built from beat-synced cloth arcs, ink-brush movement, turntable-like motion rings, worn paper texture, and cropped sneaker/jacket/object fragments on a flat graphic outdoor backdrop. No person face, room, interior, lamp, window, chair, table, studio, sword, katana, blade, samurai outfit, dead bodies, duel pose, highway warrior portrait, named-series likeness, or weapon-first composition.'
                            : preset?.id === 'SP05-055'
                              ? 'An original gothic tech dread style-card focused on sacred industrial architecture and machine-shell fragments: black-metal towers, bio-synthetic cables, hollow vertical shafts, ritualized panel seams, and restrained cyan glow. No person, hero, full body, face, blade, spear, weapon, giant robot, exposed organs, gore, religious icon copy, hospital tube body, or franchise silhouette.'
                              : preset?.id === 'SP05-058'
                                ? 'An original remote command grief style-card focused on distant control environment and machine silhouettes: cold command table shapes, drone-like shadows as abstract machines, muted blue-gray panels without readable UI, and emotional distance through empty space. No person foreground, full body, readable screens, maps with labels, guns, missiles, drone strike, real military insignia, child soldier, or franchise uniform.'
                                : preset?.id === 'SP05-061'
                                  ? 'An original crosshatched doom-weight style-card focused on cursed armor fragments, cracked stone emblems, eclipse-black negative space, and dense ink hatching. No person, face, body, cloak hero, famous swordsman likeness, giant sword, weapon, ruined warrior portrait, gore, torture, skull pile, or readable occult text.'
                                  : preset?.id === 'SP05-062'
                                    ? 'An original crimson metamorphosis style-card focused on a split mask/emblem still life: broken lacquer mask halves, translucent membrane planes, sealed shadow voids, desaturated graphite, and restrained crimson pressure. No person, face, body, humanoid silhouette, robe, hand, weapon, sword, red blade, ribbon crossing a body, gothic ruin, cathedral, corridor, organs, gore, realistic blood, teeth-mouth focus, famous ghoul mask likeness, attack scene, or body-horror closeup.'
                                    : preset?.id === 'SP05-064'
                                      ? 'An original wind-scoured redemption style-card focused on weathered cloth fragments, eroded stone, sparse horizon bands, dry abrasion, and moral weight in object/environment form. No person, face, kneeling hero, samurai likeness, katana, duel pose, blood, battlefield, revenge scene, or historical flag.'
                                      : preset?.id === 'SP05-065'
                                        ? 'An original pale threshold horror style-card focused on porcelain threshold slabs, ash-matte ground, silver edge glints, moonlit negative space, and severe silhouette order without characters. No person, hunter, prey, monster, weapon, chase, blood, gore, corridor, doorway scene, confrontation, or literal horror event.'
                                        : preset?.id === 'SP05-066'
                                          ? 'An original invasive thriller style-card focused on ceramic-botanical seam geometry: clean pale panels, petal-like fractures, clinical graphite voids, restrained crimson stress, and abstract organic strategy. No person, face, body, anatomy, flesh, organs, skin, hands, surgical table, creature, gore, realistic blood, or body-horror closeup.'
                                          : preset?.id === 'SP05-067'
                                            ? 'An original lush abyssal toll style-card focused on a close mineral-bloom specimen: bioluminescent crystal petals, damp relic patina, mossy velvet darks, layered vertical pressure, and beautiful unsafe depth. No ruins, arches, cathedral, courtyard, architecture, explorer, cave tunnel, corridor, market, library, fantasy hallway, monster, map, lantern, lamp, rope, or expedition gear.'
                                            : preset?.id === 'SP05-068'
                                              ? 'An original grimy sorcery collision style-card focused on soot clouds, scraped enamel shards, warped circular crop interruptions, illegible occult-industrial stains, tar grime, and absurd menace through texture. No protagonist, mask portrait, readable sigils, readable text, weapon, alley, corridor, wizard likeness, franchise cue, or logo.'
                                              : preset?.id === 'SP05-069'
                                                ? 'An original procedural low-fantasy grit style-card focused on worn stone slabs, scuffed dirty metal plates, smoky shadow wedges, narrow practical light slices, and tactical severity as abstract material arrangement. No corridor, dungeon hallway, adventurer, enemy, torch, lamp, weapon, shield, blood, dry blood stain, dice, card, map, or game UI.'
                                                : preset?.id === 'SP05-070'
                                                  ? 'An original neon tragic metamorphosis style-card focused on blacklight glass shards, elastic smoke ribbons, acid magenta/cyan smears, bruised violet voids, and abstract silhouette pressure without a body. No franchise likeness, demon body, nude body, face, anatomy, gore, blood, club scene, crowd, attack, wings, horns, or readable text.'
                                                  : preset?.id === 'SP05-091'
                                                    ? 'An original glowing virtual-fantasy style-card focused on crystalline portal depth, cyan atmospheric planes, soft romantic scale, and tactile digital light around a non-famous silhouette or relic. No named VR franchise likeness, readable HUD, UI panel, icon, menu, sword foreground, logo, or costume copy.'
                                                    : preset?.id === 'SP05-092'
                                                      ? 'An original reset-loop dark fantasy style-card focused on violet-silver spiral pressure, fragile relic ribbons, repeated light echoes, ornate dread, and emotional recursion. No named character likeness, mansion copy, market scene, death scene, gore, maid/cat-ear costume cue, franchise color pairing, or readable text.'
                                                      : preset?.id === 'SP05-093'
                                                        ? 'An original wandering mage chronicle style-card focused on weathered travel relic, mana contour lines, parchment grain, mineral sky, and patient geographic wonder. No readable map labels, staff-wielding protagonist, school uniform, harem cue, road party, UI, logo, or text.'
                                                        : preset?.id === 'SP05-094'
                                                          ? 'An original party-quest comedy style-card focused on bright anticlimax magic burst, elastic prop fragments, cheerful fantasy color, and comic timing in one readable anchor. No fixed group, tavern interior, readable sign, lewd gag, canon costume, franchise party likeness, or text.'
                                                          : preset?.id === 'SP05-095'
                                                            ? 'An original afterquest melancholy fantasy style-card focused on relic meadow memory motes, soft horizon light, quiet spell traces, weathered keepsake, and time-softened grief. No named elf mage likeness, party lineup, road scene, ritual circle, staff pose, franchise costume copy, or text.'
                                                            : preset?.id === 'SP05-096'
                                                              ? 'An original hyper-saturated strategy fantasy style-card focused on candy-neon arena geometry, floating rule planes, impossible perspective folds, and confident color logic. No cards, chess pieces, dice, numbers, readable symbols, game UI, sibling character likeness, logo, or text.'
                                                              : preset?.id === 'SP05-097'
                                                                ? 'An original dark dominion style-card focused on bone-ivory monolith, baroque symmetry, cold magical dust, black stone mass, and oppressive authority. No skeletal ruler, literal throne, army, skull pile, cathedral copy, Nazi/fascist insignia, franchise likeness, or readable crest.'
                                                                : preset?.id === 'SP05-098'
                                                                  ? 'An original optimistic civic fantasy style-card focused on rounded growth motifs, gel-like blue accents, clean timber/stone harmony, sunlit cooperative brightness, and modular settlement energy. No literal slime creature, banners with symbols, kingdom crowd, named ruler likeness, franchise species cue, or readable signs.'
                                                                  : preset?.id === 'SP05-099'
                                                                    ? 'An original defensive underdog fantasy style-card focused on concentric barrier geometry, scarred bronze/stone relic, compressed forward pressure, and hard-earned protective glow. No literal shield, hero portrait, weapon, slave/collar cue, revenge scene, franchise likeness, or readable emblem.'
                                                                    : preset?.id === 'SP05-100'
                                                                      ? 'An original luminous ascent fantasy style-card focused on warm crystal well, vertical mineral depth, hopeful glow, darkness shaped by amber light, and mythic smallness. No dungeon corridor, lantern-as-only-prop, generic corridor adventurer, goddess/canon costume, monster, weapon, hallway perspective, or readable sign.'
                                                                      : preset?.id === 'SP05-121'
                                                                        ? 'An original lantern-elemental motion style-card focused on patterned warmth, breathlike luminous arcs, winter-blue/amber contrast, ceremonial pause, and tenderness in motion around a non-famous original silhouette or emblem. Keep it non-graphic and non-derivative; no famous costume copy, blade-forward pose, or readable text.'
                                                                        : preset?.id === 'SP05-122'
                                                                          ? 'An original grimy contract-panic action style-card focused on industrial grime, fluorescent fatigue, jagged impact rhythm, broken concrete planes, and deadpan absurdity. Keep it non-graphic and non-derivative; no tool-headed character, famous uniform copy, blade-forward pose, or readable sign.'
                                                                          : preset?.id ===
                                                                              'SP05-123'
                                                                            ? 'An original ceremonial inferno action style-card focused on ember halos, sacred heat geometry, black silhouette cuts, emergency brightness, flat heat panels, and scorched material seams. No stained glass, windows, chapel, cathedral, famous uniform copy, icon copy, injury scene, or readable insignia.'
                                                                            : preset?.id ===
                                                                                'SP05-124'
                                                                              ? 'An original predator-ego sports intensity style-card focused on electric-blue field-line abstractions, pressure zones, target-lock geometry, acid accents, and competitive focus as a non-figurative sports-pressure graphic. No person, athlete, body, face, hair, limbs, named soccer character, team logo, readable numbers, stadium crowd, ball closeup, violent assault, or readable text.'
                                                                              : preset?.id ===
                                                                                  'SP05-125'
                                                                                ? 'An original civic colossal-response action style-card focused on municipal hazard color, infrastructure scale markers, response-grid clarity, concrete/steel texture, and resilient order. No famous creature copy, monster face closeup, armed squad, readable signage, destruction aftermath, or logo.'
                                                                                : preset?.id ===
                                                                                    'SP05-126'
                                                                                  ? 'An original paranormal turbo comedy style-card focused on ghostly teal/hot pink collision, elastic reaction marks, alien-lime absurdity, speed-line warmth, and romantic recoil energy. No famous duo copy, readable glyphs, school corridor, creature attack, crude joke, or logo.'
                                                                                  : preset?.id ===
                                                                                      'SP05-129'
                                                                                    ? 'An original deadpan prestige impact satire style-card focused on pristine block forms, absurd scale contrast, flat reaction space, polished impact rings, and clean comic timing. No fighter, hero portrait, city destruction, bald hero copy, fist foreground, weapon, rubble panorama, crowd, or readable text.'
                                                                                    : preset?.id ===
                                                                                        'SP05-133'
                                                                                      ? 'An original deadpan magic-force comedy style-card focused on ornate spell curls, blunt blocky interruption, clean color planes, absurd force geometry, and comic pause spacing. No fighter, uniformed student, school hallway, classroom, readable crest, readable magic circle, weapon, brawl, or franchise likeness.'
                                                                                      : preset?.id ===
                                                                                          'SP05-137'
                                                                                        ? 'An original science-blueprint optimism style-card focused on a handmade invention fragment, chalk-schematic non-text marks, mineral sunlight, discovery glow, and practical material detail. No fighter, inventor portrait, lab classroom, readable formulas, tool pile, weapon, camera, desk clutter, or franchise likeness.'
                                                                                        : preset &&
                                                                                            PACK_01_TRANSFERABLE_PRESET_IDS.has(
                                                                                              preset.id,
                                                                                            )
                                                                                          ? 'A neutral transferable photography-treatment demo with one simple subject or material arrangement, plain background planes, readable surface behavior, controlled light, and no narrative location.'
                                                                                          : preset &&
                                                                                              isPack02CartoonMediaPreset(
                                                                                                pack,
                                                                                                preset,
                                                                                              )
                                                                                            ? 'A clean cartoon-media style specimen with one simple original graphic anchor: a non-famous cartoon figure, expressive silhouette, creature/object fragment, mascot-like shape, symbolic form, or small scene cue. Keep the anchor thumbnail-readable and style-led. Avoid real person, celebrity, franchise character, camera equipment, readable text, logo, or repeated stock prop sets; rooms, walls, floors, cast shadows, corners, horizon lines, lamps, curtains, fabric, markets, libraries, hallways, or fantasy locations are allowed when they clarify this preset instead of becoming filler.'
                                                                                            : preset &&
                                                                                                isPack02NonPortraitLightingPreset(
                                                                                                  pack,
                                                                                                  preset,
                                                                                                )
                                                                                              ? 'A grounded non-portrait cinematic lighting study using architectural planes, glass, fabric, metal, water, haze, or shadow geometry as the subject, with no human model, chair, curtain, cyclorama, camera equipment, or studio-session setup.'
                                                                                              : CATEGORY_BASE_PROMPTS[
                                                                                                  isPack10PatternTextureKey(
                                                                                                    key,
                                                                                                  )
                                                                                                    ? 'pack_10__pattern_and_texture'
                                                                                                    : key
                                                                                                ] ||
                                                                                                'A vertical scene with one clear original subject, foreground detail, midground context, background depth, varied materials, and no text.');
  const subjectVariety = pack06SubjectVarietyPrompt(key);
  const pack06ArtDirection = pack06ArtDirectionPrompt(key, preset);
  const pack13Identity = pack13AnimeIdentityRule(pack, preset);
  const pack16Identity = pack16AnimeIdentityRule(pack, preset);
  if (pack.id === 'pack_12') {
    return `Base: ${base}
Anchor: ${categorySceneAnchor(pack, category, seed, preset)}
Fit pack "${pack.name}" and category "${category}". Finished in-engine gameplay screencap, not a vertical card, reference sheet, concept sheet, poster, key art, or promo illustration. Landscape game-camera frame, output 1536x1024. No text, labels, logos, watermark, HUD, menu, or UI.`;
  }
  return `Base: ${base}${subjectVariety}${pack06ArtDirection}
${[pack13Identity, pack16Identity].filter(Boolean).join('\n')}
Anchor: ${categorySceneAnchor(pack, category, seed, preset)}
Fit pack "${pack.name}" and category "${category}". Finished style-card image, not a reference sheet. Portrait 2:3, usable in a 3:4 card crop. No text, labels, logos, watermark, or UI.`;
}

function sceneGuardrails(pack: StyleRuntimePack, category: string, preset: StyleRuntimePreset) {
  const key = styleCategoryImageKey(pack.id, category);
  if (pack.id === 'pack_17') {
    const acidZineRule =
      key === 'pack_17__acid_dungeon_zine'
        ? 'For acid dungeon zine cards, prioritize flat print fields, heavy clean black ink, controlled xerox texture, tidy halftone, misregistration, neon lime/lavender/hot-pink accents, and one centered bestiary-like focal silhouette. Avoid dirty speckle, noisy dark-color artifacts, crushed black mush, and ugly texture chatter.'
        : 'For painterly or futuristic medieval cards, prioritize original medieval material language, readable silhouettes, fortress/cathedral geometry, armor, relics, weathering, controlled atmosphere, smooth dark gradients, and one strong focal subject. Avoid dirty speckle, noisy dark-color artifacts, crushed black mush, and ugly texture chatter.';
    return [
      'Pack 17 guardrail: medieval fantasy representation must be original and style-led, not direct fan art or a copied game scene.',
      'Use illustration or digital painting language: defined lines, clean silhouettes, readable midtones, simple key light, clear rim/glow accent, and visible medium-sized details. Do not render as photorealistic dark fantasy, ultra-real cinematic concept art, or murky low-light realism.',
      'Avoid franchise likenesses, copied boss designs, copied armor sets, readable sigils, readable runes, text, logos, UI, maps, bookshelves, library rooms, market aisles, generic corridors, and default fantasy hallway staging.',
      'Horror, cult, plague, monster, and occult cues should stay non-graphic: no explicit gore, dismemberment, torture detail, shock injury, or blood-splatter focus.',
      acidZineRule,
    ].join(' ');
  }
  if (pack.id === 'pack_14') {
    return [
      'Pack 14 guardrail: mythic-noir cards must stay preset-specific, not a repeated ceremonial template.',
      'Vary anchor type and crop across neighboring presets: masked face, partial hands, profile, three-quarter figure, object-plus-gesture, creature/material specimen, small environment fragment, or action vignette when it fits the preset.',
      'Hoods, halos, masks, candles, chalices, altars, thrones, gothic arches, circular backlights, and ritual tables are allowed only when they are the best cue for that preset; do not reuse them as default set dressing.',
      'For Greek-epic presets, avoid repeating the same handsome laurel youth in profile; vary age, gender, role, crop, civic object, naval/river/court context, and posture by preset.',
      'Do not make Helios, memorial, academy, law, strategy, or river presets all read as young robed public speakers; use beacon keepers, elder jurists, ferrymen, relief fragments, council tables, naval omens, weathered shields, or partial figures when those better separate the preset.',
      'For Norse presets, avoid repeating the same young fur-cloak traveler in blue-gray cold light; vary elder skalds, map stones, ravens as primary intelligence anchors, ship prows, rune instruments, shield fragments, spirit departure silhouettes, and weather-scale compositions.',
      'For late mythic-noir cosmology, symbolism, ritual, and pantheon presets, avoid solving every card as a centered robed youth, circular sigil, relic on an altar, or dark temple interior.',
      'Use calibrated omen instruments, salt basins, threshold lanterns, named-symbol relics, partial witnesses, mirrored figures, procession silhouettes, oath bindings, river/storm bodies, hearth guardians, or environmental fragments when those better expose the preset identity.',
      'Object-led cards are allowed for relic/glyph presets, but rotate scale, crop, material, and context so neighboring cards do not become interchangeable icon plates.',
      'If an object or relic is the focal anchor, add scale, gesture, or spatial context when needed so it reads as a card for the preset rather than a generic still life.',
      'Use refined illustration, graphic novel, or clean digital painting with controlled medium-sized detail, readable midtones, and denoised surfaces; avoid photorealism, crushed-black noise, tiny ornamental chatter, and overpacked micro-detail.',
    ].join(' ');
  }
  const pack03LookdevCue = pack03LookdevSpecimenCue(preset);
  if (key === 'pack_03__lookdev_and_render_pipelines') {
    return [
      'Treat render-engine names as rendering technology, not literal hardware or scene content.',
      'Representative lookdev card: include one original subject, character, creature/object fragment, material specimen, or hero form when it helps the preset read. Avoid empty abstract-only fields and repeated stock staging. Reference sheets, contact sheets, grids, UI, screenshots, logos, readable text, camera gear, lamps, walls, curtains, showroom/gallery/studio setups, corridors, aisles, and fantasy halls are problems when they become default/repeated composition formulas rather than preset-specific choices.',
      pack03LookdevCue,
    ].join(' ');
  }
  if (PACK_01_TRANSFERABLE_PRESET_IDS.has(preset.id)) {
    return [
      'Treat the preset name as photographic treatment only, not required subject matter.',
      'Prefer a neutral style-demonstration subject: sculptural object, fabric, glass, geometric form, room corner, product block, or non-narrative material setup.',
      'Avoid posed human faces, fashion/editorial models, lifestyle portraits, celebrity energy, surprised expressions, and character-driven story beats.',
      'Avoid celebrity chase scenes, paparazzi cameras, houses for sale, real estate keys, cars, wheels, roads, bride, groom, veil, bouquet, baby, newborn, suspect, mugshot person, police narrative, and literal title nouns.',
      'Avoid luxury villas, courtyards, pools, arches, mansions, palace-like architecture, masks, relics, trophies, staged lifestyle travel, and aspirational real-estate locations.',
      'Show transferable lighting, lens behavior, color, texture, composition, surface response, and atmosphere instead of a literal scene.',
    ].join(' ');
  }
  if (key === 'pack_02__broadcast_and_tv_look') {
    return [
      'Avoid accidental cameras, lenses, phones, tripods, bookshelves, libraries, market aisles, fantasy halls, and generic long corridors.',
      'Broadcast sets, monitors without readable text, studio lighting, chroma, clean overlays, and TV graphics are allowed when they fit the preset.',
    ].join(' ');
  }
  if (key === 'pack_02__caricature_and_cartoon_styles') {
    return [
      'Treat cartoon and caricature names as style language, not as a required real person, political figure, news scene, or parody target.',
      'Avoid cameras, phones, bookshelves, libraries, market aisles, fantasy halls, long corridors, classrooms, offices, crowded streets, readable signs, flags, logos, and real politicians.',
      'Use simple subjects, clean silhouettes, minimal props, and neutral graphic/studio space so line shape, exaggeration, color, and texture carry the preset.',
    ].join(' ');
  }
  if (isPack02CartoonMediaPreset(pack, preset)) {
    return [
      'Treat cartoon, caricature, doodle, cutout, marker, zine, classroom, office, therapy, pool, monster, and sitcom names as style language, not required literal scenes.',
      'Use one simple original graphic anchor plus supporting silhouettes, mark clusters, flat color fields, paper texture, loose marks, and non-literal shape cues so line shape, exaggeration, color, marker, collage, or animation texture carries the preset.',
      'Rooms, walls, floors, lamps, chairs, curtains, shelves, desks, cameras, markets, libraries, corridors, and fantasy halls are allowed when they are the right representative choice for that preset, not as repeated automatic set dressing.',
    ].join(' ');
  }
  if (isPack02NonPortraitLightingPreset(pack, preset)) {
    return [
      'Use a non-human subject: architectural planes, glass, fabric, metal, water, haze, or shadow geometry.',
      'Avoid all people, portraits, models, faces, hands, chairs, stools, curtains, fabric drops, cycloramas, portrait-session furniture, cameras, lenses, phones, tripods, and studio-session layouts.',
      'Let softbox or flare behavior appear only through light falloff, reflection, bloom, shadow softness, and surface response.',
    ].join(' ');
  }
  if (key !== 'pack_02__cinematic_lighting_and_lenses') return '';
  return [
    'Treat camera, lens, pinhole, noir, night, underwater, and lighting names as rendering language only, never literal props.',
    'Do not show cameras, lenses, phones, tripods, booms, film crews, surveillance gear, or anyone holding photography equipment.',
    'Keep hands empty or naturally relaxed; do not add hero props, glowing orbs, glass spheres, relics, artifacts, tools, weapons, books, notebooks, maps, or symbolic objects.',
    'Avoid recurring studio props: stools, chairs, curtains, fabric drops, cyclorama setups, portrait-session furniture, and staged model-session layouts.',
    'Avoid posed studio portrait, fashion editorial model, headshot, test-shoot, casting-session, or portfolio-session staging unless the preset explicitly needs portrait photography.',
    'Avoid libraries, bookshelves, bookstores, archives, supermarket aisles, market aisles, warehouse aisles, fantasy halls, magical realms, dungeons, palace corridors, sci-fi corridors, transit tunnels, and generic long hallway staging.',
    'Keep the scene grounded: one subject, clean cinematic planes, restrained props, believable studio/interior/exterior space, and no genre worldbuilding unless the preset name explicitly requires it.',
  ].join(' ');
}

function repeatedSceneGuardrails(
  pack: StyleRuntimePack,
  category: string,
  preset: StyleRuntimePreset,
) {
  const key = styleCategoryImageKey(pack.id, category);
  if (pack.id === 'pack_04') {
    return [
      'Pack 04 card guardrail: make one readable illustration, comic, or poster anchor, not a room, market aisle, library, fantasy hallway, studio vignette, or abstract-only texture field.',
      'Avoid recurring lamps, curtains, chairs, shelves, desks, windows, wall-floor seams, corridors, markets, fantasy halls, studio props, glowing orbs, portals, maps, compasses, notebooks, generic plants, and hero props unless the preset explicitly names that object as the style subject.',
      'Props must stay secondary. Let medium evidence lead: cutline, ink, pencil tooth, print grain, paper cut, screenprint bands, collage seams, poster geometry, vector flatness, panel rhythm, shape design, and color treatment.',
    ].join(' ');
  }
  if (pack.id !== 'pack_02') return '';
  if (
    key === 'pack_02__caricature_and_cartoon_styles' ||
    isPack02CartoonMediaPreset(pack, preset)
  ) {
    return [
      'Repetition guardrail for this pack wave: do not fall back to the same literal environments or stock props every time.',
      'Lamps, walls, curtains, chairs, shelves, aisles, markets, libraries, corridors, cameras, phones, desks, windows, studio cyclorama, and decorative objects may appear when they are intentional and preset-specific; do not use them as default repeated filler.',
      'If the preset title names a place, profession, object, or character type, translate it into line, color, shape, texture, rhythm, composition, and at most one simple original graphic anchor; do not build the literal place, job, prop, or scene.',
    ].join(' ');
  }
  return [
    'Do not let style-card generation collapse into repeated stock scenes.',
    'Avoid accidental cameras, camera-like objects in hands, lamps, lamp shades, walls, wall-floor seams, curtains, chairs, stools, handkerchiefs, cloth props, shelves, aisles, markets, libraries, corridors, fantasy halls, desks, paperwork, windows, studio cyclorama, portrait-session setup, and repeated decorative objects unless the preset explicitly requires that exact object as the style subject.',
    'Prefer transferable style evidence: lighting behavior, color palette, surface response, lens behavior, grain, composition, texture, silhouette, and abstract motif.',
  ].join(' ');
}

function familyVariant(map: Record<string, string[]>, family: string, seed: string) {
  const source = map[family] || map.default;
  return source[Math.abs(hashString(seed)) % source.length];
}

function pack12GameplayRule(pack: StyleRuntimePack, preset: StyleRuntimePreset) {
  if (pack.id !== 'pack_12') return '';
  const cameraCueByCategory: Record<string, string[]> = {
    pack_12__neon_urban_and_night_ops: [
      'Use third-person stealth camera with cover corners and patrol sightlines.',
      'Use rooftop parkour chase camera with jump routes and vertical escape lanes.',
      'Use over-the-shoulder breach camera with objective door, flanking route, and neon detection light.',
    ],
    pack_12__arcane_temples_and_mythic_realms: [
      'Use over-the-shoulder exploration camera with readable relic interaction and traversal depth.',
      'Use boss-arena gameplay camera with dodge lanes, spell telegraphs, and safe zones.',
      'Use fixed adventure camera with puzzle route, shrine mechanism, and playable scale.',
    ],
    pack_12__sci_fi_frontiers_and_mech_zones: [
      'Use third-person cover camera with route markers implied through architecture, not UI.',
      'Use tactical overview camera with vehicle/mech positions, cover, and traversal lanes.',
      'Use over-the-shoulder systems-breach camera with interactable hardware and threat spacing.',
    ],
    pack_12__sieges_warfronts_and_last_stands: [
      'Use tactical battlefield overview with front line, cover lanes, and defend/breach objective.',
      'Use third-person squad camera with clear ally/enemy spacing and fortified route depth.',
      'Use defense-position camera with incoming pressure, fallback lane, and damaged objective.',
    ],
    pack_12__speed_sport_and_competitive_arenas: [
      'Use racing chase cam with apex line, rival spacing, and speed feedback through track geometry.',
      'Use arena side-view or three-quarter match camera with timing window and active contest spacing.',
      'Use rhythm/duel gameplay camera with lane markers, readable hazard timing, and momentum arc.',
    ],
    pack_12__wilderness_hunts_and_harsh_frontiers: [
      'Use third-person hunt camera with tracking route, creature spacing, and terrain affordances.',
      'Use survival traversal camera with resource landmark, weather hazard, and escape path.',
      'Use co-op monster-hunt camera with weak point, pursuit lane, and environmental cover.',
    ],
    pack_12__heists_horror_and_underworld_runs: [
      'Use stealth/heist camera with hiding places, patrol route, and interactable objective.',
      'Use survival-horror over-the-shoulder camera with escape lane, threat silhouette, and scarce light.',
      'Use underworld infiltration camera with cover, illicit objective, and danger gradient.',
    ],
    pack_12__puzzle_chambers_and_adventure_setpieces: [
      'Use fixed adventure camera with puzzle mechanism, traversal route, and next-action staging.',
      'Use isometric or three-quarter puzzle camera with spatial logic, interactables, and route hierarchy.',
      'Use finale/setpiece gameplay camera with playable foreground route and objective landmark.',
    ],
  };
  const key = styleCategoryImageKey(pack.id, sanitizeCategory(preset.category));
  const cameraCue = pickVariant(
    cameraCueByCategory[key] ?? [
      'Use a game camera with playable route, interactable objective, threat spacing, and traversal logic.',
    ],
    `${preset.id}:pack12-camera`,
  );
  return [
    'VIDEO GAME CARD RULE: render this as a plausible in-engine gameplay screencap or playable frame, not concept art, key art, promo art, poster art, character sheet, asset render, or menu screen.',
    'Show camera/gameplay evidence: route, cover, lane, interactable, weak point, objective, hazard, timing window, puzzle state, match state, resource pressure, or traversal decision tied to this preset.',
    cameraCue,
    'No visible HUD, UI overlay, readable interface, labels, logos, marketing layout, model-sheet grid, title-safe poster composition, or isolated asset showcase.',
    `Differentiate this preset by its own loop and camera from neighboring pack_12 cards: ${sanitizeStylePromptName(preset.name).toLowerCase()}.`,
  ].join(' ');
}

function buildStylePrompt(
  pack: StyleRuntimePack,
  preset: StyleRuntimePreset,
  attempt: number,
  sessionSuffix?: string,
  variantSlot?: number,
) {
  const category = sanitizeCategory(preset.category);
  const promptCategoryKey = styleCategoryImageKey(pack.id, category);
  const negative = preset.negativePrompt ? `\n\nAvoid:\n${preset.negativePrompt}` : '';
  const guardrails = sceneGuardrails(pack, category, preset);
  const repeatedGuardrails = repeatedSceneGuardrails(pack, category, preset);
  const allowsBooks = /book|library|textbook|comic book|storybook/i.test(
    `${preset.name} ${category} ${valueOf(preset.style, 'aesthetic', 'key_features')}`,
  );
  const avoidRepeatedLibrary = allowsBooks
    ? ''
    : ' Do not default to books, bookshelves, libraries, reading rooms, archives, stacked volumes, compass props, map symbols, notebook props, generic plants, or other stock desk clutter unless they are intentional and preset-specific.';
  const variantSeed = `${pack.id}:${preset.id}:${preset.name}:${attempt}:slot-${variantSlot ?? 'primary'}`;
  const sessionKey = sessionSuffix
    ? `${sanitizeStylePromptName(pack.name)} ${sessionSuffix}`
    : undefined;
  const family = broadPromptFamily(pack, category);
  const isGuroPreset = preset.id === 'SP05-107';
  const isAmanoPreset = preset.id === 'SP05-321';
  const cartoonMediaCard = isPack02CartoonMediaPreset(pack, preset);
  const pack06Card = pack.id === 'pack_06';
  const pack08Card = pack.id === 'pack_08';
  const pack09Card = pack.id === 'pack_09';
  const pack10PatternTextureCard = isPack10PatternTextureKey(promptCategoryKey);
  const pack15PunkCard = pack.id === 'pack_15';
  const pack17MedievalCard = pack.id === 'pack_17';
  const allowsAnimeGrammar = presetAllowsAnimeGrammar(pack, category, preset);
  const nonAnimeStyleLock = nonAnimeStyleLockLine(pack, category, preset);
  const basePrompt = pack15PunkCard
    ? normalizePack15PromptText(categoryBasePrompt(pack, category, `${variantSeed}:anchor`, preset))
    : categoryBasePrompt(pack, category, `${variantSeed}:anchor`, preset);
  const cartoonSafeDna = cartoonMediaCard ? pack02CartoonSafeStyleDna(preset) : undefined;
  const imagegenSafeDna = safeImagegenStyleDna(preset);
  const safeImagegenLabel = safeImagegenStyleLabel(preset);
  const targetStyleLabel = isGuroPreset
    ? 'UNSETTLING HORROR ANIME'
    : isAmanoPreset
      ? 'ETHER-WISP GOTHIC FANTASY ANIME'
      : cartoonMediaCard
        ? pack02CartoonCardStyleLabel(preset)
        : safeImagegenLabel;
  const recognitionLabel = isGuroPreset
    ? 'an unsettling horror anime style-card'
    : isAmanoPreset
      ? 'an ether-wisp gothic fantasy anime style-card'
      : cartoonMediaCard
        ? `a ${pack02CartoonCardStyleLabel(preset).toLowerCase()} style-card`
        : `a ${safeImagegenLabel.toLowerCase()} style-card`;
  const styleAesthetic = isGuroPreset
    ? 'Unsettling body-horror anime with distorted anatomy, organic corruption, eerie clinical unease, shadowed biological forms, surreal nightmare tension, and implied transformation rather than explicit gore'
    : isAmanoPreset
      ? 'Ethereal gothic fantasy anime with elongated silhouettes, ornamental drapery, moonlit melancholy, gilded accents, celestial voids, and weightless dreamlike elegance'
      : imagegenSafeDna
        ? imagegenSafeDna.aesthetic
        : cartoonSafeDna
          ? cartoonSafeDna.aesthetic
          : valueOf(preset.style, 'aesthetic');
  const styleSubject = isGuroPreset
    ? 'Distorted human or creature silhouette, shadowed anatomy, unsettling posture, and a clear horror read without explicit graphic detail'
    : isAmanoPreset
      ? 'Elegant fantasy figure with elongated silhouette, feather-light gesture, ornamental costume logic, and a strong card-readable profile'
      : imagegenSafeDna
        ? imagegenSafeDna.subject
        : cartoonSafeDna
          ? pack02CartoonRepresentativeSubject(preset)
          : valueOf(preset.style, 'subject_treatment', 'form_and_line');
  const styleColor = isGuroPreset
    ? 'Sickly crimson accents, bruise-spectrum shadows, bone-white contrast, deep black voids, and restrained biological color cues'
    : isAmanoPreset
      ? 'Ivory, antique gold, moon-silver, abyssal indigo, pale orchid haze, and restrained gothic jewel tones'
      : imagegenSafeDna
        ? imagegenSafeDna.color
        : cartoonSafeDna
          ? cartoonSafeDna.color
          : valueOf(preset.style, 'color_and_tone', 'color_palette');
  const styleLighting = isGuroPreset
    ? 'Clinical single-source lighting, hard shadow edges, wet sheen highlights, and deep contrast that keeps the image eerie but readable'
    : isAmanoPreset
      ? 'Moonlit haze, diffuse celestial glow, soft metallic gleam, and spectral backlighting that preserves silhouette clarity'
      : imagegenSafeDna
        ? imagegenSafeDna.light
        : cartoonSafeDna
          ? cartoonSafeDna.light
          : valueOf(preset.style, 'lighting_and_shadow', 'lighting_setup');
  const styleTexture = isGuroPreset
    ? 'Organic membrane textures, slick surfaces, faint muscle-like striations, and corrupted biological surfaces without explicit gore'
    : isAmanoPreset
      ? 'Silk translucency, feathered ink edges, gilded ornament hints, velvet void gradients, and airbrushed dream textures'
      : imagegenSafeDna
        ? imagegenSafeDna.texture
        : cartoonSafeDna
          ? cartoonSafeDna.texture
          : valueOf(preset.style, 'texture_and_material', 'material_texture');
  const styleCamera = isGuroPreset
    ? 'Tight vertical framing, oppressive perspective, and silhouette-first composition that preserves card readability'
    : isAmanoPreset
      ? 'Tight vertical framing, floating negative space, graceful elongation, and silhouette-first composition for immediate card recognition'
      : imagegenSafeDna
        ? imagegenSafeDna.camera
        : cartoonSafeDna
          ? pack02CartoonRepresentativeCamera()
          : valueOf(preset.style, 'camera_and_composition', 'spatial_distortion');
  const styleMood = isGuroPreset
    ? 'Horrifying, transgressive, darkly beautiful, mesmerizing, and intentionally non-graphic'
    : isAmanoPreset
      ? 'Ethereal, sorrowful, celestial, dreamlike, and quietly majestic'
      : imagegenSafeDna
        ? imagegenSafeDna.mood
        : cartoonSafeDna
          ? cartoonSafeDna.mood
          : valueOf(preset.style, 'atmosphere_and_mood', 'atmosphere');
  const styleRender = isGuroPreset
    ? 'Nightmare-poetry anime rendering with unsettling precision, high detail, and no explicit gore'
    : isAmanoPreset
      ? 'Delicate fantasy-anime rendering with ornamental precision, dreamy softness, elegant detail, and no copyrighted character identity'
      : imagegenSafeDna
        ? imagegenSafeDna.render
        : cartoonSafeDna
          ? cartoonSafeDna.render
          : pack15PunkCard
            ? 'Art-directed stylized digital painting and speculative artbook-card illustration with x-punk world rules, drawn contours, controlled brush planes, readable dark-gray shadows, varied crop, and no American fantasy RPG/sourcebook hero styling.'
            : valueOf(preset.style, 'rendering_and_quality', 'render_quality');
  const styleFeatures = isGuroPreset
    ? 'Distorted anatomy, organic corruption, spiral contamination motifs, shadowed transformation cues, and horror atmosphere without exposed organs or blood spray'
    : isAmanoPreset
      ? 'Elongated figures, ornamental drapery, moonlit voids, feather-light motion, gilded detail accents, and ethereal gothic fantasy poise'
      : imagegenSafeDna
        ? imagegenSafeDna.features
        : cartoonSafeDna
          ? cartoonSafeDna.features
          : pack.id === 'pack_12'
            ? `${sanitizeStylePromptName(preset.name)} gameplay loop; ${valueOf(preset.style, 'camera_and_composition', 'spatial_distortion')}; ${valueOf(preset.style, 'rendering_and_quality', 'render_quality')}`
            : valueOf(preset.style, 'key_features');
  const pack15PromptField = (value: string) =>
    pack15PunkCard ? normalizePack15PromptText(value) : value;
  const pack06DiversityLock = pack06Card
    ? pack06DiversityLockPrompt(promptCategoryKey, preset, variantSeed)
    : '';
  const pack06NonAnimeMediumLock =
    pack06Card && !pack06AllowsAnimePreset(preset) ? PACK06_NON_ANIME_MEDIUM_LOCK : '';
  const pack06PresetBrief = pack06Card ? pack06CreativeBriefLine(preset) : '';
  const pack08FashionLock = pack08Card
    ? pack08FashionLockPrompt(promptCategoryKey, preset, variantSeed)
    : '';
  const pack09MaterialLock = pack09Card ? pack09MaterialLockPrompt(promptCategoryKey, preset) : '';
  const promptSafeImagegenLabel = pack15PromptField(safeImagegenLabel);
  const promptTargetStyleLabel = pack15PromptField(targetStyleLabel);
  const promptRecognitionLabel = pack15PromptField(recognitionLabel);
  const promptStyleAesthetic = pack15PromptField(styleAesthetic);
  const promptStyleSubject = pack15PromptField(styleSubject);
  const promptStyleColor = pack15PromptField(styleColor);
  const promptStyleLighting = pack15PromptField(styleLighting);
  const promptStyleTexture = pack15PromptField(styleTexture);
  const promptStyleCamera = pack15PromptField(styleCamera);
  const promptStyleMood = pack15PromptField(styleMood);
  const promptStyleRender = pack15PromptField(styleRender);
  const promptStyleFeatures = pack15PromptField(styleFeatures);
  const safeCompatibilityNote = isGuroPreset
    ? 'Keep it horror-forward but non-graphic: no exposed organs, no blood spray, no dismemberment, no explicit gore. Favor implication, distortion, shadow, and atmospheric unease.'
    : isAmanoPreset
      ? 'Keep it original and non-derivative: no recognizable franchise characters, no copyrighted costume designs, and no direct imitation of any named artist. Favor broad ethereal gothic fantasy language instead.'
      : '';
  const pack12Rule = pack12GameplayRule(pack, preset);
  const pack17IllustrationContract = pack17MedievalCard
    ? [
        'PACK 17 ILLUSTRATION CONTRACT:',
        'Render as a clean 2D fantasy RPG card illustration or graphic-novel/digital-painting hybrid, not a photoreal render, not cinematic concept art, not a realistic 3D-looking material study.',
        'Use large shape design, visible drawn contour logic, simplified value groups, poster-readable silhouettes, clean midtones, controlled brush planes, and a limited detail budget.',
        'Armor, stone, cloth, fog, monsters, and relics should feel illustrated and designed with broad readable planes, not physically simulated with noisy micro-texture.',
        'Avoid dense mesh patterns, chainmail/fishnet-like filler, tiny repeating scratches, lace-like filigree, black-on-black surfaces, and mostly-black palettes.',
      ].join(' ')
    : '';
  const pack15IllustrationContract = pack15PunkCard
    ? [
        'PACK 15 ILLUSTRATION CONTRACT:',
        'Render as art-directed stylized digital painting, speculative illustration, poster, or artbook plate, not American fantasy RPG character-card art, not superhero/sourcebook illustration, not YA adventure cover art, not generic semi-real game concept art, and not a realistic render.',
        'Do not use anime, manga, gacha, visual-novel, big-eye face, glossy cel-hair, or collectible-card character grammar for pack_15 unless a specific preset explicitly asks for it. Use non-anime stylized figures, poster design, graphic novel, printmaking, gouache, editorial card art, and controlled animation-background color discipline instead.',
        'Preferred aesthetic lineage: European and Latin American editorial poster design, Eastern European animation/poster restraint, Japanese environment-art color discipline, craft printmaking, folk-modernist shape language, and underground zine/risograph structure. Use these as broad design grammar only, not as a copy of any specific living artist.',
        'Keep one representative punk subject readable: a characteristic protagonist integrated with a thematic environment/background. Technology, relics, vehicles, machines, and symbols should read as setting, costume, social pressure, weather, architecture, signage shape, or distant background world logic, not as a foreground thing the character uses as the action. Keep hands empty, relaxed at the side, folded, hidden by cloth, bracing against weather, or used only for body-language gesture unless the preset absolutely requires otherwise. Vary age, body type, crop, pose, and role by preset: close crop, profile, three-quarter, side-view, partial face, seated/leaning, walking, looking back, sheltering, performing, waiting, or environmental vignette. Do not make every preset a centered full-body hero.',
        'People may appear, but they must not become generic rugged adventurers, retro American ad pinups, beauty portraits, uniformed poster operators, or worker-revolution figures. Avoid heroic pinup stance, young handsome protagonist sameness, handheld-gadget hero pose, hands-on-machine/control pose, signal-prop portrait, leather pouches, belts, boots, cloaks, capes, scarf hero styling, fantasy armor, weapon-first pose, marketable RPG costume design, and repeated tan/blue cloak palettes.',
        'If a large machine, antenna, dish, clock, engine, vehicle, shrine, or tower appears, it must frame the world and stay visually secondary to the character-world read. Do not let a single big object become the card hero unless the protagonist remains clearly first in silhouette, scale, color, or placement.',
        'Use large shape design first: clear silhouette hierarchy, asymmetric poster balance, stylized or partly obscured faces, expressive hands only when needed, matte color fields, controlled brushwork, graphic value groups, medium-large style cues, and denoised surfaces with breathing room.',
        'Limit image to a few bold color/value zones and a small number of readable detail clusters. Treat dark areas as charcoal, slate, blue-black, ink-wash, or colored shadow, not pure flat black fill or muddy crushed black. Prefer cultural/material specificity from the preset over generic cinematic polish: material symbols, engineered folk objects, graphic construction logic, and unusual palette choices.',
        'Keep aesthetics controlled and readable: moderate texture only, simplified brush planes, clean color design, expressive simplification over believable material physics, no hyper-detail, no high-frequency decorative chatter, no realistic paint finish, no realistic material simulation, no photographic lens depth, no HDR glare, no volumetric fog realism, no mirror-wet reflections, no dense cable webs, no window-panel grids, and no tiny black-line pattern carpets.',
        'Avoid photographic skin pores, realistic foreground portrait rendering, detailed tattoos, realistic uniform/officer portraits, generic soldier or guard pin-up, ultra-fine rivets everywhere, noisy grime, rendered metal realism, over-rendered machinery, micro-filigree, busy texture chatter, dense machinery wallpaper, overcrowded scenes, scratchy print noise, and crunchy sharpened detail.',
      ].join(' ')
    : '';
  const pack15CurrentArtDirection = pack15PunkCard
    ? [
        'PACK 15 CURRENT ART DIRECTION:',
        'Make this a good x-punk style card with one character in their world, not a generic object poster, hyperreal concept-art plate, or repeated character-card cast sheet.',
        'Finish should feel like controlled stylized digital painting, artbook illustration, editorial poster painting, graphic novel, printmaking, gouache poster, or stylized non-anime card art with drawn edges, tasteful lighting, denoise, and deliberate palette.',
        'The character should inhabit the world through posture, silhouette, clothing, weather, architecture, and background pressure, not by interacting with a handheld, mechanical, mystical, or screen-like prop as the focal point.',
        'Use dark grays, slate, charcoal, blue-black, or colored shadow instead of flat black masses.',
      ].join(' ')
    : '';
  const pack15DiversityLine = pack15PunkCard
    ? pack15DiversityGuide(category, preset, variantSeed)
    : '';
  const illustrationContract = [pack15IllustrationContract, pack17IllustrationContract]
    .filter(Boolean)
    .join('\n');

  if (pack.id === 'pack_12') {
    return appendImagegenDenoiseDirective(`Generate one in-engine gameplay screenshot.
TARGET GAME LOOK: ${targetStyleLabel}
PACK: ${pack.name}
CATEGORY: ${category}
${sessionKey ? `SESSION: ${sessionKey}\n` : ''}MODE: text-to-image
MODEL: ${IMAGEGEN_MODEL}, ${IMAGEGEN_REASONING_EFFORT}

${nonAnimeStyleLock ? `${nonAnimeStyleLock}\n` : ''}
${pack06NonAnimeMediumLock ? `${pack06NonAnimeMediumLock}\n` : ''}
${basePrompt}
${pack15CurrentArtDirection ? `${pack15CurrentArtDirection}\n` : ''}

GAMEPLAY SCREENSHOT CONTRACT:
Render as a plausible playable screencap from an original video game, not as concept art, key art, promo art, poster art, splash art, character sheet, asset render, loading screen, menu screen, or portfolio illustration.
Use landscape game-camera composition. If later cropped into a card, keep the main gameplay state readable in the center.
Show a real play state: route, cover, lane, interactable, weak point, objective, hazard, timing window, puzzle state, match state, resource pressure, traversal decision, enemy spacing, or squad/vehicle position tied to ${sanitizeStylePromptName(preset.name).toLowerCase()}.
Use a game camera suitable to the preset: third-person, isometric, top-down, side-view, racing chase cam, fixed adventure cam, tactical overview, or over-the-shoulder. Pick one; do not use cinematic poster framing.
No visible HUD, UI overlay, readable interface, minimap, health bars, subtitles, labels, logos, title text, marketing layout, model-sheet grid, or isolated asset showcase.
No pixel art, voxel art, retro 8-bit, or low-res sprite rendering unless this exact preset identity explicitly requires it.
Stylized blood, violence, weapons, threat, or horror intensity are allowed when the gameplay genre needs them; avoid explicit gore, dismemberment, torture detail, or shock imagery.

STYLE DNA: aesthetic=${styleAesthetic}; subject=${styleSubject}; color=${styleColor}; light=${styleLighting}; texture=${styleTexture}; camera=${styleCamera}; mood=${styleMood}; render=${styleRender}; gameplay-features=${styleFeatures}.

DIFFERENTIATION:
Do not reuse another pack_12 prompt composition. Make this screenshot distinct through camera angle, gameplay loop, environment affordance, color script, threat/objective type, and scale.
Avoid generic fantasy corridor, market aisle, library aisle, camera prop, studio setup, concept-art hero pose, centered character pinup, or pretty environment postcard unless it is clearly playable and preset-specific.

Output only the image, 1536x1024 landscape gameplay screencap.${negative}`);
  }

  if (pack15PunkCard) {
    const cardPrompt = PACK15_CARD_PROMPTS[preset.id];
    const fallbackRoute = pack15RouteFor(promptCategoryKey, preset);
    const promptBody =
      cardPrompt ||
      `${fallbackRoute.cardRoute.character}. Make the character specifically read as ${fallbackRoute.localActor}. Background: ${fallbackRoute.worldRoute.world}. Composition: ${fallbackRoute.cardRoute.composition}.`;

    // ponytail: SP15 uses one explicit brief per card; the route matrix is fallback only.
    return `Generate one portrait default style-card image.
TARGET STYLE: ${promptTargetStyleLabel}
PACK: ${pack.name}
CATEGORY: ${category}
${sessionKey ? `SESSION: ${sessionKey}\n` : ''}MODE: text-to-image
MODEL: ${IMAGEGEN_MODEL}, ${IMAGEGEN_REASONING_EFFORT}

${nonAnimeStyleLock ? `${nonAnimeStyleLock}\n` : ''}
CARD-SPECIFIC BRIEF:
${promptBody}

Use exactly this card's subject, pose, background, palette, and crop. Do not replace it with a generic punk portrait, a generic human, or a neighboring SP15 idea.
One main character/creature only; background silhouettes are allowed only as scale, never as a cast or crew.
The character is not holding, repairing, operating, presenting, or interacting with a communication device, gear, machine, relic, screen, or tool. The x-punk motif belongs to the background, architecture, costume shape, lighting, and atmosphere.
Hard avoid: anime face, manga face, gacha framing, visual-novel bust crop, glossy cel hair, generic anime protagonist, generic adult man, repeated old woman authority portrait, grandmother portrait, businessman, mafia boss, officer portrait, long coat, trench coat, suit, black overcoat, white lab coat, cloak, cape, poncho, robe, shawl, hooded silhouette, blanket wrap, full-body wrap, draped mantle, mohawk, punk crest, side-shaved hair, undercut, hands-behind-back pose, repeated stern fashion portrait, same-face anime cast, centered boss portrait, worker productivity demo, object-first card.

Render as stylized digital painting / artbook card art: strong silhouette, broad painted planes, readable midtones, dark grays instead of flat black, controlled lighting, heavy denoise. Not photoreal, not hyperreal, not generic American RPG/comic/sourcebook illustration, not glossy same-face anime cast.

Output only the image, 1024x1536 portrait. No text, labels, logos, watermark, UI.${negative}

apply heavy denoise to the image`;
  }

  if (pack17MedievalCard) {
    const zineMode = promptCategoryKey === 'pack_17__acid_dungeon_zine';
    const hunterMode = promptCategoryKey === 'pack_17__hunter_gothic_and_plague_courts';
    const monochromePlateMode =
      promptCategoryKey === 'pack_17__monochrome_tarot_and_bestiary_plates';
    const styleCreativeBrief =
      typeof preset.style.creative_brief === 'string' && preset.style.creative_brief.trim()
        ? preset.style.creative_brief.trim()
        : '';
    const presetIdentity = [
      `Aesthetic: ${styleAesthetic}`,
      `Focal grammar: ${styleSubject}`,
      `Palette and light: ${styleColor}; ${styleLighting}`,
      `Material and finish: ${styleTexture}; ${styleRender}`,
      `Composition and mood: ${styleCamera}; ${styleMood}`,
      styleCreativeBrief ? `Card route: ${styleCreativeBrief}` : '',
    ]
      .filter(Boolean)
      .join('\n');
    const routeLine = monochromePlateMode
      ? 'Clean black-and-white or limited-accent medieval tarot, bestiary plate, manuscript, woodcut, field-guide, and devotional icon language: warm paper, broad white space, crisp ink, sparse wash, and readable symbol design.'
      : zineMode
        ? 'Clean dungeon zine, risograph, screenprint, and monster-manual card language: flat color, bold black shapes, controlled halftone, and readable icon design.'
        : hunterMode
          ? 'Clean gothic fantasy sourcebook and graphic-novel illustration language: pale stone, ivory cloth, blue-gray moonlight, readable midtones, clear contours, and simple open shadows. Gothic horror mood without dark interior realism.'
          : 'Clean 2D fantasy RPG sourcebook, graphic novel, and board-game card illustration language: broad painted planes, clear contours, readable midtones, and simple dramatic light.';
    const subjectLine = monochromePlateMode
      ? 'Use the PRESET IDENTITY focal grammar as the main subject. Make one large readable original focal subject only: horror tarot omen, penitent icon, starved dungeon relic, woodcut beast, illuminated manuscript creature, marginalia monster, heraldic chimera, stained-glass beast, tapestry creature, field-guide wyvern, or oracle animal. Add at most 2-3 simple support symbols. No crowded page, no diagram sheet, no full inventory spread, no weapon-first pose.'
      : 'Use the PRESET IDENTITY focal grammar as the main subject. Make one large readable original focal subject only: monster, relic, shrine fragment, castle fragment, plague specialist, warband icon, rune-tech armor, dungeon beast, architectural sentinel, or medieval-fantasy object. Add at most 2-3 simple support shapes. No crowded battlefield, no busy ruins panorama, no full equipment sheet, no weapon-first pose.';
    const colorLine = monochromePlateMode
      ? 'Prefer warm ivory paper and clean black ink. Add only sparse smooth gray wash or one muted accent such as dull red, muted blue, olive, gold, or violet when it helps the preset. Keep large white-paper areas visible. Avoid dominant black fields, muddy grayscale, noisy night skies, black-on-black figures, and gray speckle clouds.'
      : hunterMode
        ? 'Use pale gothic midtones and visible color separation: ivory, bone, gray blue, desaturated teal, muted burgundy, old gold, and moonlit stone. Keep at least half the image in readable mid-value or light planes. Avoid dominant black robes, black interiors, crushed charcoal, muddy brown-black, dark red haze, and black-on-black figures.'
        : 'Use mid-value palettes and visible color separation: parchment, muted blue, oxidized green, dull gold, rust red, bone, lavender, poison green, or clean accent colors depending on the preset. Avoid dominant black, black-on-black armor, crushed charcoal, muddy gray-brown soup, and dark color fields full of artifacts.';
    const textureLine = monochromePlateMode
      ? 'Clean denoised ink, smooth wash, tidy paper tooth, and deliberate large print marks only. No dirty photocopy grain, dense hatch carpets, random speckle clouds, mesh-like shading, muddy black ink buildup, or low-light compression artifacts.'
      : 'Smooth denoised digital painting or clean print texture. If zine-like, use tidy halftone and clean xerox edge as intentional graphic marks, not dirty noise. No speckle clouds, no ugly dark texture chatter, no low-light compression artifacts.';

    return appendImagegenDenoiseDirective(`Generate one clean graphic 2D medieval fantasy illustration card.
TARGET LOOK: CLEAN ILLUSTRATED ${targetStyleLabel}
PACK: ${pack.name}
CATEGORY: ${category}
${sessionKey ? `SESSION: ${sessionKey}\n` : ''}MODE: text-to-image
MODEL: ${IMAGEGEN_MODEL}, ${IMAGEGEN_REASONING_EFFORT}

${nonAnimeStyleLock ? `${nonAnimeStyleLock}\n` : ''}
VISUAL LEVEL:
Polished but simplified tabletop RPG/sourcebook/card illustration. Use flat gouache-like digital painting, comic-book contour discipline, cel-shaded value groups, matte color planes, and visible designed edges.
Detail ratio: about 70 percent broad readable shapes, 20 percent clean linework, 10 percent texture/detail accents.
No cinematic key art, no semi-realistic concept-art polish, no realistic material rendering, no volumetric realism, no 3D-render look, no photobash look, and no ornate microdetail.

STYLE ROUTE:
${routeLine}
Read "${sanitizeStylePromptName(preset.name)}" as mood, silhouette, palette, and design language only. Do not render it as photoreal dark fantasy or hyper-detailed concept art.

PRESET IDENTITY:
${presetIdentity}
Use this preset identity as the source of subject, silhouette, palette, and composition. Do not reuse a neighboring Pack 17 subject formula.

SUBJECT:
${subjectLine}

FORM:
Large shapes first. Defined contour lines. Simplified armor plates. Broad cloak and stone planes. Medium-sized details only. Keep the design readable as a thumbnail.
If the preset suggests lace, chainmail, scale, ornament, cracks, cables, glowing runes, or etched marks, simplify them into a few large graphic shapes.
Avoid chainmail, mail mesh, fishnet texture, dense scale texture, tiny rivets everywhere, lace, lace-like filigree, repeated scratches, over-rendered cracks, dripping black cloak edges, and micro-detail carpets.

COLOR:
${colorLine}

LIGHTING:
Simple illustration lighting only: one clear key light plus one rim/glow accent. Open the shadows. Keep details visible in dark areas. No murky low-light realism, no smoky artifact buildup, no cinematic HDR, no realistic night photography.

TEXTURE:
${textureLine}

SCENE GUARDRAILS:
Original medieval fantasy only. No franchise likeness, copied boss design, copied armor set, readable sigils/runes/text, logos, UI, maps, book stacks, library rooms, market aisles, generic corridors, or default fantasy hallway.
Horror, plague, cult, monster, and occult cues must stay non-graphic: no explicit gore, dismemberment, torture detail, shock injury, or blood-splatter focus.
If a weapon-like prop appears, keep it small and secondary; prefer relics, beasts, shrines, armor silhouettes, omen symbols, or architecture fragments as the main read.

COMPOSITION:
Portrait 1024x1536, one finished image, card crop safe, no border text, no labels, no watermark.

Make it immediately recognizable as a ${safeImagegenLabel.toLowerCase()} style-card, but quieter, cleaner, flatter, and less overworked than dark realism.${negative}`);
  }
  const objectOnlyPromptOverrides: Record<
    string,
    {
      hero: string;
      environment: string;
      detail: string;
      feeling: string;
      cameraFocus: string;
      action: string;
    }
  > = {
    'SP11-012': {
      hero: 'No anime protagonist, no close portrait, no tool-use demo. Focal anchor is a clean solarpunk civic greenhouse node, solar-leaf canopy, seed-vault balcony, or bio-grown energy trellis with only tiny scale silhouettes if needed.',
      environment:
        'Use bright biophilic infrastructure as the subject: solar glass leaves, living walls, bamboo-composite arcs, water channels, roof gardens, and daylight air. No anime face, no character close-up, no handheld gadget, no lab worker, no market/library aisle, no generic glass utopia.',
      detail:
        'Secondary detail must be regenerative system design: photovoltaic leaf cells, irrigation glints, seed pods, living-wall seams, transparent energy glass, or modular green roof layers.',
      feeling:
        'Hope comes from civic ecology and breathable structure, not from a pretty character, portrait pose, or tool task.',
      cameraFocus:
        'Focus on architecture-as-ecosystem hierarchy; figures stay small or partial and non-anime.',
      action:
        'No character task scene. Suggest regeneration through leaf movement, water flow, sunlight, and tiny civic scale cues.',
    },
    'SP11-013': {
      hero: 'No human portrait, no armored creature, no weapon-like arm, no AAA game concept art. Focal anchor is a dieselpunk industrial machine mass: riveted engine shrine, pressure-tank stack, piston gate, treaded generator, or furnace relay.',
      environment:
        'Use stylized poster-like industrial depth with open midtones, soot haze, furnace glow, gauges, rivets, pipes, and oil-worn metal. No close-up man, no monster, no photoreal realism, no dark corridor, no combat stance, no handheld canister.',
      detail:
        'Secondary detail must be diesel grammar: pressure gauge, bolted plate, exhaust curl, rust seam, piston linkage, caged bulb, or tread texture kept medium-sized.',
      feeling:
        'Weight comes from machinery and soot-era infrastructure, not from a gritty hero portrait or creature threat.',
      cameraFocus:
        'Focus on broad mechanical silhouette and readable metal planes; no face, no anatomy, no cinematic character lensing.',
      action:
        'No character action. Suggest motion through steam, piston tension, furnace glow, and vibrating industrial mass.',
    },
    'SP10-032': {
      hero: 'No character hero. Focal anchor is an empty liminal threshold, vacant pool edge, carpeted corner, fluorescent doorway, or synthetic wall-floor junction.',
      environment:
        'Use empty transitional architecture only; no person, silhouette, statue, animal, plant, portrait, body, fashion figure, chair, curtain, lamp, market aisle, library aisle, or fantasy hallway.',
      detail:
        'Secondary detail must be vacant-space material: carpet seam, tile grid, fluorescent panel, pool ripple, blank doorway, or scuffed synthetic surface.',
      feeling:
        'Unease comes from absence, flat artificial light, wrong scale, and purpose removed, not from a character, face, event, or story prop.',
      cameraFocus:
        'Focus on empty perspective and material planes; no facial angle, no body crop, no figure silhouette.',
      action: 'No action scene. Show only still empty space with quiet wrongness.',
    },
    'SP10-037': {
      hero: 'No character hero. Focal anchor is impossible Escher geometry: recursive stairs, tessellated creatures-as-pattern, interlocking architectural planes, or a paradoxical black-and-white spatial loop.',
      environment:
        'Use impossible geometry only; no person, portrait, mannequin, library, market aisle, domestic room, furniture staging, lamp, camera, fantasy hallway, or realistic corridor.',
      detail:
        'Secondary detail must be geometric: stair reversal, tessellation seam, impossible shadow, woodcut hatch, figure-ground flip, or black-white plane transition.',
      feeling:
        'Surreal tension comes from spatial paradox and figure-ground logic, not from character dynamics, faces, props, or room drama.',
      cameraFocus:
        'Focus on impossible geometry hierarchy; no body pose, no facial angle, no product hero, no corridor depth.',
      action:
        'No action scene. Suggest motion only through recursive geometry and tessellation flow.',
    },
    'SP10-046': {
      hero: 'No character hero. Focal anchor is one bold paisley textile object, folded scarf, patterned vessel, or cropped fabric banner with boteh teardrops and floral curls.',
      environment:
        'Use shallow textile/material depth only; no person, portrait, mannequin, room, garden, paradise scene, wallpaper showroom, furniture, market aisle, library aisle, or fantasy hallway.',
      detail:
        'Secondary detail must be paisley pattern logic: bent teardrop forms, floral curls, woven edge, inked textile repeat, or color registration shift.',
      feeling:
        'Boho intricacy comes from ornamental flow and fabric rhythm, not from a character, interior, or literal garden.',
      cameraFocus:
        'Focus on textile curves and pattern hierarchy; no facial angle, no body crop, no figure silhouette.',
      action: 'No action scene. Suggest motion only through folded fabric and flowing ornament.',
    },
    'SP10-047': {
      hero: 'No character hero. Focal anchor is one luxurious damask textile panel, velvet fold, ornamental shield-like fabric crop, or two-tone silk surface.',
      environment:
        'Use shallow material depth only; no person, portrait, mannequin, drawing room, candlelit interior, wallpaper showroom, furniture, corridor, market aisle, library aisle, or fantasy hallway.',
      detail:
        'Secondary detail must be damask grammar: acanthus symmetry, fleur-de-lis rhythm, silk sheen, velvet pile, or two-tone ornamental repeat.',
      feeling:
        'Old-world luxury comes from controlled symmetry and textile sheen, not from characters, interiors, or prop staging.',
      cameraFocus:
        'Focus on repeat symmetry, fabric depth, and material sheen; no facial angle, no body crop, no figure silhouette.',
      action: 'No action scene. Let fabric fold and ornamental rhythm provide movement.',
    },
    'SP10-055': {
      hero: 'No character hero. Focal anchor is a cropped wood-grain surface, plank edge, veneer slice, or carved material plane with visible growth rings and flowing fibers.',
      environment:
        'Use shallow wood material depth only; no bowl, sphere, product still life, room, furniture, tabletop catalog scene, person, mannequin, corridor, market aisle, library aisle, or fantasy hallway.',
      detail:
        'Secondary detail must be wood material only: growth rings, fiber waves, cut edge, knot line, warm varnish transition, or carved-plane shadow.',
      feeling:
        'Warm tactility comes from flowing grain and material rhythm, not from decorative objects, product staging, or room context.',
      cameraFocus:
        'Focus on wood-grain hierarchy and surface flow; no product hero, no bowl, no sphere, no room perspective.',
      action: 'No action scene. Suggest movement only through grain flow and cut-surface rhythm.',
    },
    'SP10-057': {
      hero: 'No character hero. Focal anchor is a cropped knitted textile surface, folded swatch, cable-knit panel, or yarn ridge field with readable stitch structure.',
      environment:
        'Use shallow knit material depth only; no toy, animal, bird, creature, mascot, amigurumi, doll, product still life, room, furniture, person, mannequin, corridor, market aisle, library aisle, or fantasy hallway.',
      detail:
        'Secondary detail must be stitch material only: cable loops, ribbing, yarn fibers, purl ridges, color strand transitions, or fold shadows.',
      feeling:
        'Soft tactility comes from knit structure and yarn rhythm, not from cute objects, creature silhouettes, or lifestyle staging.',
      cameraFocus:
        'Focus on stitch hierarchy and textile relief; no toy face, no animal silhouette, no product hero, no room perspective.',
      action: 'No action scene. Suggest movement only through folds, loops, and stitch direction.',
    },
    'SP05-062': {
      hero: 'No character hero. Focal anchor is a split mask/emblem still life with fractured lacquer, membrane planes, and sealed shadow voids.',
      environment:
        'Use shallow abstract darkness or simple material planes only; no ruin, cathedral, corridor, street, room, or fantasy location.',
      detail:
        'Secondary detail must be material-only: fracture edge, membrane tension, lacquer chip, or shadow seam.',
      feeling:
        'Emotion comes from pressure, fracture, restraint, and sealed darkness, not from a face, posture, or body.',
      cameraFocus:
        'Prioritize the mask/emblem material read and silhouette hierarchy; no facial angle, no body pose.',
      action:
        'No action scene. Show quiet metamorphic tension through fracture, pressure, and membrane stretch.',
    },
    'SP05-065': {
      hero: 'No character hero. Focal anchor is pale threshold slabs, ash-matte planes, silver edge cuts, and moonlit negative space.',
      environment:
        'Use abstract exterior void and material planes only; no doorway scene, corridor, ruin, castle, person, monster, or chase setting.',
      detail:
        'Secondary detail must be a broad material cue: ash grain, silver edge, porcelain crack, or cold shadow cut.',
      feeling:
        'Dread comes from still spacing and severe figure-ground tension, not from faces, posture, bodies, monsters, or events.',
      cameraFocus:
        'Focus on slab geometry, edge light, and negative-space hierarchy; no facial angle, no prop hero.',
      action:
        'No action scene. Build dread through stillness, spacing, and severe silhouette geometry.',
    },
    'SP05-066': {
      hero: 'No character hero. Focal anchor is ceramic-botanical seam geometry: clean pale panels, petal fractures, and restrained crimson stress.',
      environment:
        'Use clinical abstract voids or simple tabletop-like material depth only; no cathedral, garden, body, laboratory, corridor, or room.',
      detail:
        'Secondary detail must be seam-only: petal fracture, ceramic split, graphite void, or restrained crimson stress line.',
      feeling:
        'Paranoia comes from invasive geometry and controlled seams, not from face, posture, body, surgery, or creature drama.',
      cameraFocus:
        'Focus on ceramic planes and seam hierarchy; no facial angle, no anatomical closeup, no body crop.',
      action:
        'No action scene. Show invasive pressure through seams, splits, and controlled organic growth.',
    },
    'SP05-067': {
      hero: 'One original abyssal witness or relic-bonded guardian as the readable focal subject: small non-glamorous silhouette partly lit by bioluminescent mineral bloom, damp relic patina, and layered vertical depth. Not an explorer, not expedition gear, not a pretty anime portrait.',
      environment:
        'Use compressed abyssal darkness, mineral bloom depth, mossy relic planes, and unsafe luminous pressure around the subject. No ruin, arch, cathedral, courtyard, architecture, cave tunnel, corridor, lantern, map, rope, expedition scene, or fantasy hallway.',
      detail:
        'Secondary detail must be environmental material: mineral bloom, damp patina, mossy edge, or pressure layer.',
      feeling:
        'Wonder and danger come from the figure being dwarfed by glow, depth, and material pressure, not from monster attack or face drama.',
      cameraFocus:
        'Focus on the small witness silhouette inside mineral bloom hierarchy and vertical compression; no face-only portrait, tunnel, corridor, or architecture.',
      action:
        'Use one restrained reaching, pausing, or recoiling gesture. Suggest cost through glow pressure and depth layering.',
    },
    'SP05-068': {
      hero: 'No character hero. Focal anchor is soot, scraped enamel shards, warped circular crop interruptions, and illegible occult-industrial stains.',
      environment:
        'Use smoky abstract grime field only; no alley, corridor, cathedral, mask portrait, wizard, weapon, or readable sigil wall.',
      detail:
        'Secondary detail must be texture-only: soot smear, enamel shard, warped crop edge, or illegible stain.',
      feeling:
        'Absurd menace comes from collision, grime, and warped framing, not from face, posture, wizard, mask portrait, or weapon.',
      cameraFocus:
        'Focus on overlapping frames and texture collision; no facial angle, no character pose, no wall scene.',
      action:
        'No action scene. Make collision readable through overlapping frames, stains, and warped crop cuts.',
    },
    'SP05-069': {
      hero: 'One original low-fantasy problem-solver as the readable focal subject: stocky armored scout, tired veteran, or practical survivor with empty hands, worn cloth, scuffed dirty metal, smoky shadow wedges, and narrow practical light slices. Not a sleek hero, not a black-haired cloak traveler, not a weapon pose.',
      environment:
        'Use a compact low-fantasy obstacle space around the subject: worn stone slabs, blocked threshold, smoky shadow wedges, and practical light cuts. No dungeon hallway, corridor, enemy, torch, lamp, shield, weapon, dice, cards, map, or game UI.',
      detail:
        'Secondary detail must be material-only: scuffed metal, chipped stone, smoke wedge, or narrow light slice.',
      feeling:
        'Severity comes from practical posture, ordered fragments, and constrained light, not from combat or fantasy glamour.',
      cameraFocus:
        'Focus on the survivor silhouette inside material order and narrow light hierarchy; no face-only portrait, no object trophy, no corridor perspective.',
      action:
        'Use one restrained checking, bracing, or stepping-over gesture. Suggest procedure through arranged slabs and tactical light slices.',
    },
    'SP05-123': {
      hero: 'No character hero. Focal anchor is ceremonial inferno material: ember halos, black silhouette cuts, heat-buckled panels, flat orange-cyan heat fields, and scorched seams.',
      environment:
        'Use shallow graphic heat space only; no stained glass, window, chapel interior, cathedral, corridor, uniformed person, injury scene, icon wall, or emergency crew.',
      detail:
        'Secondary detail must be heat/material-only: ember rim, soot edge, scorched panel seam, or heat-buckled surface.',
      feeling:
        'Urgency comes from heat geometry and contrast, not from face, posture, uniform, injury, or action scene.',
      cameraFocus:
        'Focus on heat-material hierarchy and silhouette cuts; no facial angle, no body pose, no heroic figure.',
      action: 'No action scene. Show pressure through ember flow, black cuts, and heat distortion.',
    },
    'SP05-124': {
      hero: 'No character hero. Focal anchor is electric-blue sports pressure geometry: field-line fragments, target-lock arcs, acid accents, and compressed competitive zones.',
      environment:
        'Use abstract field-plane depth only; no person, athlete, body, face, hair, limbs, stadium crowd, soccer player, ball closeup, locker room, scoreboard, numbers, or team logo.',
      detail:
        'Secondary detail must be graphic: field-line scratch, pressure zone edge, target arc, or acid accent shard.',
      feeling:
        'Competitive intensity comes from line pressure and spatial compression, not from athlete face, posture, team scene, or assault.',
      cameraFocus:
        'Focus on field-line geometry and color hierarchy; no facial angle, no sports portrait, no body crop, no ball hero.',
      action:
        'No action scene. Suggest motion through line convergence, pressure zones, and target geometry.',
    },
    'SP05-125': {
      hero: 'One original civic response protagonist in simplified armor or rescue gear, integrated with concrete/steel scale markers, hazard color blocks, and response-grid clarity. Keep them non-famous, practical, and secondary to civic-scale action.',
      environment:
        'Use municipal infrastructure slices with scale and operational order: bridge supports, floodlight planes, barrier blocks, or command-grid geometry. No monster face closeup, armed squad, destruction aftermath, readable signage, city disaster panorama, or logo.',
      detail:
        'Secondary detail must be scale/material: steel edge, concrete crack, hazard stripe, response-grid block, suit seam, floodlight cut, or bio-lime alert accent.',
      feeling:
        'Resilience comes from ordered infrastructure, practical body language, and hazard color, not from copied monster spectacle, squad lineup, or disaster panorama.',
      cameraFocus:
        'Focus on the responder silhouette against infrastructure scale markers; no face glamour, no creature closeup, no squad pose.',
      action:
        'Use a restrained response beat: bracing stance, signal gesture, evacuation-path cue, or floodlight sweep. No battle pose, weapon, or monster contact.',
    },
    'SP05-127': {
      hero: 'Focal anchor may include one restrained original figure or mask-like silhouette, but the real subject is poison-garden material: lotus bloom, toxic pollen haze, lacquered black ink cuts, and ceremonial petal geometry.',
      environment:
        'Use lush botanical depth or shallow sacred garden fragments only; no corridor, temple hall, throne room, weapon closeup, execution scene, gore, camera, market aisle, or library aisle.',
      detail:
        'Secondary detail must be botanical/material: petal translucency, jade tendril, pollen mist, lacquer edge, or wet ink seam.',
      feeling:
        'Danger comes from beauty under poison pressure, not from explicit violence, body horror, face drama, or weapon action.',
      cameraFocus:
        'Focus on floral-horror hierarchy and ceremonial color blocks; if a figure appears, keep it small/supporting, not portrait hero.',
      action:
        'No fight scene. Suggest fatal calm through bloom density, toxic color, and sharp negative space.',
    },
    'SP05-128': {
      hero: 'No weapon hero. Focal anchor is black ink/marble spiritual opera: sweeping black cloth-like forms, white marble planes, red accent cuts, and explosive calligraphic energy.',
      environment:
        'Use abstract stage depth or marble light planes only; no palace corridor, throne hall, sword closeup, battle pose, readable symbols, logo, or full armored hero.',
      detail:
        'Secondary detail must be graphic/material: ink stroke, marble edge, red seal-like accent, violet particle dust, or white-black light split.',
      feeling:
        'Authority comes from contrast, pageantry, and calligraphic force, not from a recognizable warrior, blade, face, or combat scene.',
      cameraFocus:
        'Focus on vertical black-white composition and energy hierarchy; no facial angle, no held prop.',
      action:
        'No action scene. Show spiritual opera through sweeping ink force and marble-light contrast.',
    },
    'SP05-129': {
      hero: 'No character hero. Focal anchor is deadpan impact geometry: pristine block forms, absurd scale contrast, flat reaction space, and polished impact rings.',
      environment:
        'Use clean abstract impact space only; no city destruction, bald hero, fist foreground, street fight, rubble panorama, weapon, or crowd.',
      detail:
        'Secondary detail must be comic-timing geometry: dust ring, cracked block, offset shadow, or flat reaction gap.',
      feeling:
        'Comedy comes from timing and scale mismatch, not from character dynamics, face, punch, or battle scene.',
      cameraFocus:
        'Focus on blocky impact hierarchy and negative space; no facial angle, no punch pose, no hero body.',
      action: 'No action scene. Show aftermath through one clean impact mark and deadpan spacing.',
    },
    'SP05-131': {
      hero: 'Focal anchor may include one original street-protector silhouette, but avoid face portrait and fight pose. Emphasize wind-shear jacket shapes, scuffed fabric, neon grit, and protector momentum.',
      environment:
        'Use open streetlight atmosphere or graphic asphalt planes only; no alley corridor, market aisle, school hallway, gang lineup, camera, weapon, readable signs, or storefront wall.',
      detail:
        'Secondary detail must be motion/material: wind streak, pavement grit, jacket edge, bruise-color glow, or neon rim accent.',
      feeling:
        'Swagger comes from motion and loyalty, not from assault, weapon threat, full-body hero posing, or literal brawl.',
      cameraFocus:
        'Focus on diagonal movement and streetlight color hierarchy; keep any figure integrated with motion, not centered portrait.',
      action:
        'No fight scene. Suggest protector rush through wind pressure, scuffed texture, and neon edge light.',
    },
    'SP05-132': {
      hero: 'Focal anchor may include one small original silhouette, but the subject is violet-black shadow ascension: aura crown, shadow swarm, rank-glow shards, and vertical power pressure.',
      environment:
        'Use abstract portal depth or smoky stage void only; no dungeon corridor, throne hall, raid party lineup, weapon, monster, city, or recognizable armor hero.',
      detail:
        'Secondary detail must be aura/material: violet rim, black smoke grain, silver rank glint, or shadow shard.',
      feeling:
        'Dominance comes from vertical pressure and shadow multiplication, not from face, weapon, body pose, or battle scene.',
      cameraFocus:
        'Focus on aura hierarchy and upward silhouette scale; keep any figure subordinate to shadow mass.',
      action:
        'No fight scene. Suggest rank-up through glow tiers, shadow depth, and calm pressure.',
    },
    'SP05-134': {
      hero: 'One calm original action protagonist with readable anatomy and empty hands, designed around mundane-action velocity: clean stunt vectors, product-color blocks, tile shine, and dead-calm timing.',
      environment:
        'Use graphic retail-light planes only; no supermarket aisle, shelf corridor, product labels, readable packaging, camera, gun, knife, crowd, storefront, or convenience-store literal interior.',
      detail:
        'Secondary detail must be abstract mundane material: glossy color block, tile reflection, motion streak, or yellow action cut.',
      feeling:
        'Comedy comes from calm precision inside everyday brightness, not from literal shopping scene or weapon threat.',
      cameraFocus:
        'Focus on full or three-quarter body choreography, action lanes, and clean negative space; no face portrait, no aisle perspective.',
      action:
        'Use one clean non-weapon stunt beat: sidestep, glide, package-color motion block, or impossible calm dodge. No fight pileup, knife, gun, or literal shopping scene.',
    },
    'SP05-135': {
      hero: 'No character hero. Focal anchor is rule-logic impact material: cause-effect arrows, unlucky rebound arcs, pop-symbol bursts, and fractured clean panels.',
      environment:
        'Use shallow graphic impact space only; no bodies, gore, hospital, street fight, weapon, readable symbols, text, or couple portrait.',
      detail:
        'Secondary detail must be conceptual: arrow fragment, rebound curve, pop burst, hazard green accent, or cracked panel edge.',
      feeling:
        'Chaos comes from rules breaking and domino timing, not from injury, face drama, violence, or romance pose.',
      cameraFocus:
        'Focus on cause-effect rhythm and readable panel hierarchy; no facial angle, no body crop.',
      action: 'No action scene. Show chain reaction through arrows, rebounds, and impact geometry.',
    },
    'SP05-136': {
      hero: 'Focal anchor may include a grimoire-like object or small squad rhythm silhouettes, but the subject is thunder page-glow force and scrappy underdog energy.',
      environment:
        'Use abstract spell-light depth only; no classroom, castle hall, library aisle, bookshop, weapon, full team lineup, readable runes, or logo.',
      detail:
        'Secondary detail must be material: parchment grain, torn cloth edge, thunder arc, rough stone dust, or page-glow seam.',
      feeling:
        'Determination comes from loud magical force and rough edges, not from shouting face, sword pose, or squad portrait.',
      cameraFocus: 'Focus on page-glow/thunder hierarchy; keep figures small if present.',
      action:
        'No fight scene. Suggest underdog force through page flashes, thunder diagonals, and ragged motion.',
    },
    'SP05-133': {
      hero: 'One original deadpan magic-comedy protagonist with readable simple anatomy and a straight-faced pose, surrounded by ornate spell curls, blunt blocky interruption, clean color planes, and absurd force geometry.',
      environment:
        'Use shallow graphic academy-color space only; no school hallway, classroom, uniformed student, crest, readable magic circle, weapon, or brawl.',
      detail:
        'Secondary detail must be abstract magic/material: curl edge, block impact, glow seam, or comic pause mark.',
      feeling:
        'Comedy comes from magical force interrupted by blunt geometry, not from faces, character dynamics, or fight choreography.',
      cameraFocus:
        'Focus on the character silhouette plus spell geometry/block collision hierarchy; no face glamour, no corridor.',
      action:
        'Use a single deadpan magic-comedy beat: calm stance, absurd block impact, or paused spell interruption. No brawl, weapon, school hallway, or copied uniform.',
    },
    'SP05-137': {
      hero: 'No character hero. Focal anchor is optimistic science-invention material: handmade machine fragment, chalk-schematic non-text marks, mineral sunlight, and discovery glow.',
      environment:
        'Use abstract workshop-light planes without a workshop set; no lab classroom, tool pile, readable formulas, inventor portrait, weapon, camera, or desk clutter.',
      detail:
        'Secondary detail must be invention/material-only: brass edge, chalk line, mineral glow, or handmade joint.',
      feeling:
        'Optimism comes from discovery light and handmade structure, not from face, posture, classroom scene, or tool pile.',
      cameraFocus:
        'Focus on invention fragment and light hierarchy; no facial angle, no person, no readable board.',
      action:
        'No action scene. Suggest discovery through glow, schematic rhythm, and material contrast.',
    },
    'SP05-138': {
      hero: 'Focal anchor may include one restrained original silhouette, but no sword hero. Emphasize neon rain, oathlike stillness, wet asphalt color, and blade-like light cuts as graphic energy.',
      environment:
        'Use open rain field or abstract noir planes only; no alley corridor, street duel, weapon closeup, camera, shopfront, readable signs, or full face portrait.',
      detail:
        'Secondary detail must be weather/light: rain streak, cyan rim, red accent cut, wet reflection, or occult particle edge.',
      feeling:
        'Severity comes from restraint and rain-light pressure, not from visible violence, weapon pose, or revenge tableau.',
      cameraFocus:
        'Focus on rain-layer hierarchy and silhouette restraint; no facial angle, no held blade.',
      action:
        'No fight scene. Suggest oath tension through stillness, rain diagonals, and narrow light cuts.',
    },
    'SP05-139': {
      hero: 'No character hero. Focal anchor is colossal rupture scale: cracked wall planes, dust shafts, tether-vector diagonals, smoke pressure, and tiny scale markers.',
      environment:
        'Use abstract breached-wall mass only; no giant humanoid, military squad portrait, city destruction panorama, weapon, gore, corridor, or recognizable uniform hero.',
      detail:
        'Secondary detail must be scale/material: cracked stone grain, dust cloud, cable sheen, falling-depth line, or cold sky gap.',
      feeling:
        'Desperation comes from scale and rupture, not from faces, monsters, soldiers, or battle choreography.',
      cameraFocus:
        'Focus on wall-scale hierarchy and dust-light depth; no facial angle, no creature closeup.',
      action:
        'No action scene. Suggest vertical terror through rupture geometry, dust, and tiny scale cues.',
    },
    'SP05-142': {
      hero: 'Focal anchor may include one hardboiled original silhouette, but no gun or weapon. Emphasize humid noir heat, salt haze, gunmetal texture, smoke curls, and tropical teal-rust contrast.',
      environment:
        'Use shallow humid noir atmosphere only; no dock, boat, gun closeup, cigarette portrait, bar interior, market aisle, corridor, camera, or vehicle chase.',
      detail:
        'Secondary detail must be material/weather: salt haze, brushed metal, rust edge, smoke curl, sweat sheen, or oily black shadow.',
      feeling:
        'Danger comes from heat, grit, and noir compression, not from visible firearms, face drama, or action pose.',
      cameraFocus:
        'Focus on humidity/material hierarchy; keep any figure integrated with atmosphere, not centered weapon hero.',
      action:
        'No shootout. Suggest lawless grit through heat glare, smoke, and hard material cuts.',
    },
    'SP05-148': {
      hero: 'Focal anchor may include overlapping original ensemble silhouettes, but no gang lineup or weapon display. Emphasize jazz-cut diagonals, brass glints, sepia motion, and nonlinear pulp rhythm.',
      environment:
        'Use abstract amber pulp space only; no train compartment, bar interior, corridor, stage, table scene, gun, camera, readable poster, or crowd row.',
      detail:
        'Secondary detail must be rhythm/material: brass glint, smoke grain, paper pulp edge, carriage-like stripe, or amber flash.',
      feeling:
        'Chaos comes from syncopated framing and ensemble rhythm, not from literal crime scene, weapon threat, or train setting.',
      cameraFocus:
        'Focus on overlapping angles and amber motion hierarchy; no face portrait, no prop hero.',
      action:
        'No action scene. Suggest momentum through diagonal cuts, smoke, and brass/sepia contrast.',
    },
    'SP05-221': {
      hero: 'One original pop-signal engineer, pilot-performer, or human-scale silhouette integrated with engineered motion: concert-light arcs, contrail calligraphy, alloy panels, cyan-pink signal layers, and hopeful gold edge light. Not an idol portrait or cockpit closeup.',
      environment:
        'Use sky/stage-light depth with mecha-scale or aircraft-scale context; no concert stage, cockpit closeup, missile barrage, readable UI, crowd, city, camera, or robot face closeup.',
      detail:
        'Secondary detail must be signal/material: contrail arc, panel seam, cyan-pink glow, alloy edge, or music-wave line.',
      feeling:
        'Romance comes from signal collision, human-scale silhouette, and motion, not from cockpit drama or literal performance.',
      cameraFocus:
        'Focus on the original silhouette woven into signal layers and hard mechanical contours; no face glamour, no UI panel.',
      action:
        'Use one graceful signal/motion beat: guiding gesture, wind-braced stance, flight-path cue, or mecha-scale contrail sweep. No battle, cockpit portrait, or idol stage pose.',
    },
    'SP05-223': {
      hero: 'One original chrome-noir armored protagonist or android silhouette as the focal anchor, readable full/three-quarter body with clean anatomy and no pinup pose. Emphasize segmented articulation, acid cyan-magenta voltage, graphite panels, and precision ornament.',
      environment:
        'Use cyber-noir light planes and hard machine geometry around the subject; no corridor, alley, lab, motorcycle, weapon, camera, readable UI, object-only armor display, or full fashion photoshoot setup.',
      detail:
        'Secondary detail must be mechanical/material: chrome seam, graphite plate, electric violet spark, hatch accent, or magenta-cyan rim.',
      feeling:
        'Elegance comes from armor geometry and analog voltage, not from glamour pose, face, or weapon threat.',
      cameraFocus:
        'Focus on the armored silhouette integrated with segmented material hierarchy; avoid face glamour and avoid empty material specimen.',
      action:
        'No action scene. Suggest noir voltage through rim light, seams, and hard contour rhythm.',
    },
    'SP05-224': {
      hero: 'No character hero. Focal anchor is sterile arcology control geometry: ceramic panels, severe grid slices, exoshell segmentation, cold cyan glass, and warning-red restraint.',
      environment:
        'Use abstract control-space planes only; no corridor perspective, hospital room, lab desk, command center, readable UI, camera, person, robot, or hallway.',
      detail:
        'Secondary detail must be sterile material: ceramic edge, glass reflection, tactical gray seam, warning red block, or cyan specular plane.',
      feeling:
        'Pressure comes from control geometry and sterile surfaces, not from people, hallway depth, or tech clutter.',
      cameraFocus:
        'Focus on severe panel hierarchy and clean material contrast; no face, no room scene.',
      action:
        'No action scene. Suggest restraint through hard grids, glass planes, and cold light.',
    },
    'SP05-225': {
      hero: 'Focal anchor may include compact scrap-mech force, but avoid humanoid chase hero. Emphasize rusted metal rhythm, spark-lit grit, stacked steel arcs, and resilient motion.',
      environment:
        'Use abstract workshop-dark or open spark field only; no corridor, alley chase, hangar tunnel, robot crouch, weapon, camera, readable signage, or market/mecha street.',
      detail:
        'Secondary detail must be material: rust edge, oil black plate, teal spark, bruised violet shadow, or scrap seam.',
      feeling:
        'Resilience comes from worn metal and motion pressure, not from chase scene, hero pose, or corridor depth.',
      cameraFocus:
        'Focus on scrap-metal arcs and spark hierarchy; no facial angle, no robot portrait.',
      action: 'No chase. Suggest velocity through compact arcs, sparks, and stacked metal rhythm.',
    },
    'SP05-226': {
      hero: 'No character hero. Focal anchor is cyber-goth concrete dread: black silhouette slabs, rain reflection, brutalist negative space, and cold machine glints.',
      environment:
        'Use shallow abstract concrete planes only; no mausoleum hall, corridor, chapel, throne room, person, camera, lamp, or readable signage.',
      detail:
        'Secondary detail must be material: wet concrete edge, black panel seam, rain reflection, cold cyan glint, or void shadow.',
      feeling:
        'Dread comes from emptiness and hard surfaces, not from faces, bodies, gothic props, or room staging.',
      cameraFocus:
        'Focus on slab hierarchy and negative space; no portrait, no hallway perspective.',
      action:
        'No action scene. Suggest anxiety through rain, concrete mass, and black-cyan restraint.',
    },
    'SP05-227': {
      hero: 'No character hero. Focal anchor is rust-wire descent: oxidized cable diagonals, failing light, amputated geometry, and hard shadow cuts.',
      environment:
        'Use abstract pressure field only; no tunnel corridor, sewer, alley, person, robot crouch, camera, lamp, or industrial hallway.',
      detail:
        'Secondary detail must be material: rust wire, cable abrasion, failing light strip, oil black plate, or brutal panel cut.',
      feeling:
        'Nihilism comes from downward pressure and cable decay, not from body harm, chase, or tunnel scene.',
      cameraFocus:
        'Focus on wire/material hierarchy; no face, no full body, no tunnel vanishing point.',
      action:
        'No action scene. Suggest descent through diagonals, failing light, and oxidized pressure.',
    },
    'SP05-229': {
      hero: 'No enforcement character. Focal anchor is punitive neon vice texture: warning-light blocks, analog surveillance mood, hard industrial etching, and black-red-cyan abrasion.',
      environment:
        'Use graphic industrial texture space only; no police portrait, camera prop, readable UI, city alley, corridor, weapon, dashboard, or control room.',
      detail:
        'Secondary detail must be texture/material: warning red strip, scratched metal, cyan scan glow, black ink edge, or analog noise block.',
      feeling:
        'Pressure comes from surveillance texture and warning discipline, not from people, guns, cameras, or interfaces.',
      cameraFocus:
        'Focus on abrasive panel composition; no face, no device closeup, no room scene.',
      action:
        'No action scene. Suggest punitive tech through warning color, etching, and dense shadow.',
    },
    'SP05-230': {
      hero: 'No character hero. Focal anchor is terminal megastructure silence: recursive concrete slabs, tiny scale markers, sparse machine light, and terminal void geometry.',
      environment:
        'Use abstract megastructure scale only; no corridor tunnel, hallway, city street, bridge walkway, person portrait, vehicle, camera, or readable signage.',
      detail:
        'Secondary detail must be scale/material: concrete seam, small light marker, distant void cut, hard panel edge, or dust haze.',
      feeling:
        'Silence comes from scale and repetition, not from literal hallway exploration or sci-fi city vista.',
      cameraFocus: 'Focus on scale hierarchy; tiny markers allowed, no central person.',
      action:
        'No action scene. Suggest civilization scale through recursive slabs and sparse lights.',
    },
    'SP05-231': {
      hero: 'No humanoid hero. Focal anchor is coral resonance liturgy: coral tectonic curves, biomechanical panels, sacred scale, and sonic ring rhythm.',
      environment:
        'Use abstract sacred bio-mechanical field only; no cathedral corridor, temple hall, person, robot crouch, altar, camera, readable symbol, or market/library aisle.',
      detail:
        'Secondary detail must be coral/material: pink mineral curve, bio-panel seam, sonic ring, pearl glow, or ceremonial edge.',
      feeling:
        'Melancholy comes from sacred scale and resonance, not from humanoid drama or architecture.',
      cameraFocus:
        'Focus on coral-machine hierarchy and ring rhythm; no face, no hall perspective.',
      action:
        'No action scene. Suggest ritual through resonance arcs, coral forms, and quiet light.',
    },
    'SP05-232': {
      hero: 'No soldier or pilot. Focal anchor is dustfront drone lament: low arthropod drone geometry, abrasive dust, functional joints, and horizontal tactical grief.',
      environment:
        'Use flat dusty horizon planes only; no battlefield squad, cockpit, war corridor, vehicle chase, weapon, camera, readable UI, or city ruins.',
      detail:
        'Secondary detail must be operational material: dust abrasion, joint hinge, low shadow, dull sensor glow, or sand-scored plate.',
      feeling:
        'Lament comes from austerity and dehumanized machinery, not from battle action, bodies, or explosions.',
      cameraFocus: 'Focus on low drone silhouette and horizon pressure; no portrait, no pilot.',
      action:
        'No action scene. Suggest operational grief through dust, low geometry, and sparse light.',
    },
    'SP05-233': {
      hero: 'No character hero. Focal anchor is closed-habitat survival: modular fortress blocks, sealed biotech membranes, airlock-like geometry, and cosmic negative space.',
      environment:
        'Use abstract vacuum-scale planes only; no spaceship corridor, control room, person, cockpit, camera, readable UI, or battle scene.',
      detail:
        'Secondary detail must be survival material: sealed panel, membrane seam, oxygen-blue glint, habitat block, or black void edge.',
      feeling:
        'Discipline comes from sealed structure and emptiness, not from crew drama or corridor exploration.',
      cameraFocus: 'Focus on modular habitat hierarchy; no face, no hallway perspective.',
      action: 'No action scene. Suggest hostile scale through closed forms and void pressure.',
    },
    'SP05-234': {
      hero: 'No commander or screen operator. Focal anchor is extinction command pressure: alarm color blocks, hostile mass abstraction, layered vector panels, and hard tactical geometry.',
      environment:
        'Use abstract command-pressure field only; no readable UI, control room, person, cockpit, city attack, monster, weapon, or camera.',
      detail:
        'Secondary detail must be graphic/material: red alarm block, vector slice, black mass, cyan edge, or scratched panel.',
      feeling:
        'Apocalypse comes from geometry and pressure, not from literal screens, battle, or faces.',
      cameraFocus: 'Focus on layered command composition; no text, no interface detail.',
      action: 'No action scene. Suggest attrition through mass shapes, alarms, and hard layering.',
    },
    'SP05-235': {
      hero: 'Focal anchor may include one tiny stylized youth silhouette, but the subject is pop-cyber simulation gloss: neon holography, glossy night surfaces, and concealed unease.',
      environment:
        'Use abstract glossy city-light planes only; no market aisle, storefront wall, readable sign, camera, phone, bedroom, or crowd.',
      detail:
        'Secondary detail must be simulation material: cyan-magenta reflection, holographic pane, chrome edge, scanline glow, or wet asphalt sheen.',
      feeling:
        'Freedom and unease come from glossy media layers, not from portrait, fashion pose, or literal city scene.',
      cameraFocus:
        'Focus on reflective layers and neon hierarchy; keep any figure small/supporting.',
      action:
        'No action scene. Suggest rebellion through color, speed lines, and simulation depth.',
    },
    'SP05-236': {
      hero: 'No humanoid robot crouch. Focal anchor is compact attrition hardware: low armored block, mud, rust, minimal optics, and logistical wear.',
      environment:
        'Use plain muddy ground or abstract maintenance shadow only; no corridor, hangar tunnel, battlefield squad, person, weapon, camera, or hero mecha pose.',
      detail:
        'Secondary detail must be functional material: mud scrape, rust seam, armor plate, tiny optic, or worn hinge.',
      feeling:
        'Pressure comes from utility and wear, not from spectacle, chase, or humanoid drama.',
      cameraFocus:
        'Focus on compact hardware silhouette and surface wear; no face-like robot portrait.',
      action: 'No action scene. Suggest attrition through weight, mud, and worn function.',
    },
    'SP05-237': {
      hero: 'One original hot-blooded pilot, mecha-hero silhouette, or human-scale figure dwarfed by a monumental ignition machine. Keep the subject readable, heroic, and original while emphasizing ignition plume, launch diagonals, luminous sacrifice, and rising scale.',
      environment:
        'Use launch-light depth, vertical machine scale, and cosmic flare around the subject; no cockpit closeup, face-only portrait, hangar corridor, weapon, crowd, readable markings, city battle, or object-only launch poster.',
      detail:
        'Secondary detail must be scale/material: ignition glow, heat plume, alloy edge, white-gold flare, or vertical pressure line.',
      feeling:
        'Heroism comes from rising scale and sacrifice light, not from posing, faces, or weapon action.',
      cameraFocus:
        'Focus on the readable heroic silhouette inside vertical launch hierarchy; no face-only portrait.',
      action:
        'No battle scene. Suggest sacrifice through one clean upward heroic beat, ignition, and luminous mass.',
    },
    'SP05-238': {
      hero: 'Focal anchor may include a clean colossus-scale silhouette, but keep it graphic and original. Emphasize digital lattice, nostalgic signal light, and layered scale.',
      environment:
        'Use abstract grid-scale atmosphere only; no city fight, tokusatsu street set, weapon, cockpit, camera, readable UI, or hero pose.',
      detail:
        'Secondary detail must be signal/material: digital lattice, clean rim, scale marker, cyan grid, or nostalgic glow.',
      feeling:
        'Melancholy comes from scale and signal light, not from monster fight or literal suit staging.',
      cameraFocus: 'Focus on scale layering and lattice rhythm; no face, no action tableau.',
      action:
        'No action scene. Suggest heroic scale through lattice overlays and clean silhouette geometry.',
    },
    'SP05-240': {
      hero: 'No character hero. Focal anchor is tricolor ignition geometry: cyan-magenta-yellow fire blocks, protest-poster diagonals, flat heat facets, and black shock cuts.',
      environment:
        'Use abstract poster space only; no street riot, crowd, police, camera, weapon, readable sign, wall mural, market, or city corridor.',
      detail:
        'Secondary detail must be graphic/material: heat facet, chroma collision, black cut, white thermal flash, or diagonal flame edge.',
      feeling:
        'Intensity comes from formal chaos and color collision, not from literal protest scene or people.',
      cameraFocus: 'Focus on poster hierarchy and bold shapes; no face, no scene perspective.',
      action: 'No action scene. Suggest ignition through color blocks and diagonal pressure.',
    },
    'SP05-241': {
      hero: 'One original civic fantasy coordinator, adventurer-administrator, or human-scale strategist as the readable focal subject, integrated with modular civic grid, arcane administration glow, emblem-like roles, and map-social clarity.',
      environment:
        'Use civic map/table planes and fantasy infrastructure around the subject; no tavern, market aisle, library, office, readable UI, document text, crowd, camera, council room, or object-only planning board.',
      detail:
        'Secondary detail must be system/material: polished stone block, wood tabular plane, arcane cyan node, emerald admin line, or warm amber role marker.',
      feeling:
        'Hope comes from visible cooperation and structure, not from literal bureaucracy or group portrait.',
      cameraFocus:
        'Focus on the strategist silhouette inside modular hierarchy and warm-cool role contrast; no text/UI detail or face-only portrait.',
      action:
        'Use one restrained planning, pointing, or moving-through-system gesture. Suggest society working through grids, nodes, and clear material layers.',
    },
    'SP05-242': {
      hero: 'A small vulnerable original figure or pair may appear, but the subject is smoke-mud survival: wet cloth, repaired leather, weak firelight, and humble defensive spacing.',
      environment:
        'Use shallow muddy camp/field atmosphere only; no marketplace, library, fantasy hall, weapon hero, monster, camera, tent corridor, or dramatic castle vista.',
      detail:
        'Secondary detail must be material: mud smear, patched leather, damp cloth, ember glow, unpolished metal, or low fog.',
      feeling:
        'Vulnerability comes from scale and worn materials, not from hero pose, melodrama, or epic battle.',
      cameraFocus:
        'Focus on human-scale fragility and material wear; keep figures quiet, not portrait heroes.',
      action: 'No action scene. Suggest survival through stillness, weak light, and repaired gear.',
    },
    'SP05-243': {
      hero: 'One original noble adventurer silhouette as the main subject, readable but not a lineup. Surround them with classic OVA tapestry cues: heraldic fabric, old stone, sapphire-gold depth, and tabletop quest hierarchy.',
      environment:
        'Use tapestry/landscape depth around the adventurer; no castle corridor, market town, tavern, weapon closeup, camera, crowd, readable banner, or object-only emblem poster.',
      detail:
        'Secondary detail must be mythic material: embroidered textile, heraldic color block, old stone edge, leather strap, or warm dawn rim.',
      feeling:
        'Adventure comes from timeless composition and noble material, not from generic fantasy hero posing.',
      cameraFocus:
        'Focus on the adventurer silhouette within tapestry hierarchy and classic color; no face-only portrait.',
      action:
        'Use one quiet quest-readiness gesture. Suggest quest through layered emblem, fabric, and horizon depth.',
    },
    'SP05-244': {
      hero: 'A ceremonial original figure may appear, but the subject is imperial destiny: jade-cinnabar authority, lacquered ritual planes, heavy silk folds, and vertical mandate geometry.',
      environment:
        'Use abstract court-ritual space only; no palace corridor, throne room, market, library, readable talisman text, weapon, camera, or crowd.',
      detail:
        'Secondary detail must be ceremonial material: lacquer edge, jade plane, bronze ornament, silk fold, mist-blue rim, or cinnabar block.',
      feeling:
        'Authority comes from hierarchy and ritual weight, not from portrait, throne staging, or costume display alone.',
      cameraFocus: 'Focus on vertical power geometry and material weight; no face closeup.',
      action: 'No action scene. Suggest mandate through symmetry, folds, and restrained ornament.',
    },
    'SP05-245': {
      hero: 'One romantic original prophecy silhouette as the main subject, with readable anatomy and wind-shaped pose. No tarot card text or mecha battle. Build identity through crimson dusk, arcane gold facets, swept cloth, and angular fate geometry.',
      environment:
        'Use wind/sky prophecy space around the subject; no market town, castle corridor, readable cards, cockpit, weapon, camera, full battle vista, or object-only relic poster.',
      detail:
        'Secondary detail must be prophecy material: wind-swept cloth, faceted glow, silver edge, crimson haze, or angular relic form.',
      feeling:
        'Romance and fate come from wind, color, and geometry, not from literal tarot card, face drama, or fantasy town.',
      cameraFocus:
        'Focus on the windblown prophecy silhouette inside diagonal wind hierarchy and crimson-blue contrast; no face-only portrait.',
      action:
        'Use one restrained turn, reaching, or wind-braced gesture. Suggest destiny through wind diagonals, relic light, and atmospheric tension.',
    },
    'SP05-246': {
      hero: 'A small caravan silhouette may appear, but the subject is amber-turquoise arabesque adventure: jewel facets, brass ornament, warm dust, and layered labyrinth curves.',
      environment:
        'Use abstract ornamental travel space only; no market aisle, bazaar stall, palace corridor, crowd, readable sign, weapon, camera, or treasure-room scene.',
      detail:
        'Secondary detail must be ornamental material: embroidered textile, brass edge, turquoise crystal, warm dust, limestone plane, or arabesque curve.',
      feeling:
        'Adventure comes from mobile ornament and jewel magic, not from shopping, market props, or hero pose.',
      cameraFocus: 'Focus on jewel/ornament hierarchy; keep figures secondary.',
      action: 'No action scene. Suggest travel through layered curves, dust, and warm-cool facets.',
    },
    'SP05-247': {
      hero: 'A quiet original figure or strange familiar may appear, but avoid portrait. Focal anchor is thorn-cottage enchantment: moss, bone-black curves, wet stone, old wood, and intimate ritual glow.',
      environment:
        'Use shallow garden/cottage material atmosphere only; no room interior, chair, curtain, lamp focus, library, market, corridor, readable parchment, camera, or gothic mansion scene.',
      detail:
        'Secondary detail must be domestic-occult material: moss fiber, wet stone, old wood, porcelain chip, thorn curl, or candlelike glow.',
      feeling:
        'Tender mystery comes from small ritual materials, not from furniture set dressing or dramatic portrait.',
      cameraFocus: 'Focus on intimate material hierarchy; no full room staging.',
      action: 'No action scene. Suggest enchantment through moss, bone, and low warm light.',
    },
    'SP05-248': {
      hero: 'No chef portrait. Focal anchor is functional fantasy cuisine: cast iron, herb green, broth gold, worked stone, and practical circular preparation rhythm.',
      environment:
        'Use abstract cooking surface or camp-kitchen close material only; no dungeon corridor, market stall, restaurant, kitchen room, monster body, camera, readable labels, or food hero closeup alone.',
      detail:
        'Secondary detail must be culinary material: iron rim, broth steam, herb edge, grease shine, stone texture, or spice-red accent.',
      feeling:
        'Humor and appetite come from process and materials, not from literal meal scene or group portrait.',
      cameraFocus: 'Focus on process geometry and warm material read; no face, no room scene.',
      action:
        'No action scene. Suggest cooking through circular rhythm, steam, and practical tools.',
    },
    'SP05-249': {
      hero: 'No child portrait. Focal anchor is printing/craft devotion: paper pulp, ink blue, wooden press geometry, metal type texture, and warm low reading light.',
      environment:
        'Use abstract craft table planes only; no library aisle, bookstore, classroom, office, readable text, stack-wall of books, camera, or cozy room scene.',
      detail:
        'Secondary detail must be craft material: vellum edge, ink stain, wood grain, press screw, metal type block, or red wax accent.',
      feeling:
        'Devotion comes from patient material process, not from bookshelves, documents, or portrait.',
      cameraFocus: 'Focus on paper/press hierarchy; no readable letters or UI.',
      action: 'No action scene. Suggest invention through steps, texture, and warm craft light.',
    },
    'SP05-250': {
      hero: 'A small vow-like pilgrim silhouette may appear, but no paladin portrait. Focal anchor is quiet sacred stone fantasy: dawn gold, vow-white cloth, eroded stone, and restrained relic glow.',
      environment:
        'Use abstract sanctuary-stone atmosphere only; no temple corridor, church interior, throne room, weapon, armor hero, camera, readable symbol, or city vista.',
      detail:
        'Secondary detail must be sacred material: eroded stone, blessed metal edge, travel cloth, dust mote, dawn shaft, or relic glow.',
      feeling:
        'Devotion comes from restraint and ethical clarity, not from religious set dressing or heroic combat.',
      cameraFocus: 'Focus on stone/light hierarchy; keep figure secondary if present.',
      action: 'No action scene. Suggest vow through vertical light, quiet stone, and worn cloth.',
    },
    'SP05-251': {
      hero: 'One original aerial mage or disciplined human-scale tactician silhouette as the readable focal subject, not a child soldier portrait and not a black-haired cloaked fantasy traveler. Integrate cold command vectors, steel gray planes, red mandate marks, and restrained arcane rings around the figure.',
      environment:
        'Use sky-map command space around the subject; no castle terrace, fantasy town, lantern balcony, battlefield, trench, airplane cockpit, uniform portrait, readable map text, weapon, camera, explosion scene, or object-only tactical diagram.',
      detail:
        'Secondary detail must be tactical material: steel plane, red vector, icy blue ring, dark leather strip, map-paper texture, or faceted amber calculation glow.',
      feeling:
        'Severity comes from command geometry and cold calculation, not from violence, uniforms, or war spectacle.',
      cameraFocus:
        'Focus on the aerial silhouette inside vectors and ring hierarchy; no face-only portrait or cockpit.',
      action:
        'Use one restrained hovering, pointing, or wind-braced command gesture. Suggest doctrine through aerial vectors, cold light, and compressed composition.',
    },
    'SP05-255': {
      hero: 'One original gem-engine magic protagonist with distinctive jewel-armored silhouette and two simplified support silhouettes allowed as background role cues, not a lineup and not a black-haired cloaked fantasy traveler. Build identity through ruby/cobalt/emerald roles, angular rune energy, polished mineral, and bright rescue momentum.',
      environment:
        'Use gem-engine fantasy space around the protagonist; no castle terrace, generic fantasy road, town street, palace hall, cockpit, weapon, readable rune text, camera, full team portrait, or object-only gem emblem.',
      detail:
        'Secondary detail must be gem/material: polished mineral, enchanted metal edge, ruby-blue-green flare, angular rune shard, or white energy seam.',
      feeling:
        'Cooperation comes from color roles and rescue geometry, not from character lineup or battle scene.',
      cameraFocus:
        'Focus on the protagonist inside jewel-engine hierarchy; support silhouettes stay simple and secondary.',
      action:
        'Use one restrained rescue or rising-magic gesture. Suggest cooperation through rising color, gem light, and coordinated geometry.',
    },
    'SP05-256': {
      hero: 'A small threshold-romance silhouette may appear, but no shrine portrait or combat pose. Focal anchor is folklore threshold: moss green, crimson dusk, talisman ivory, spiritual purple, and temporal portal tension.',
      environment:
        'Use abstract shrine-well/forest-threshold atmosphere only; no market town, corridor, shrine room, weapon, camera, readable talisman text, or full action chase.',
      detail:
        'Secondary detail must be folklore material: ritual fiber, talisman paper without text, worn metal, pigment earth, moss edge, or spirit particle.',
      feeling:
        'Romance and pursuit come from threshold tension, not from literal chase, face drama, or town scene.',
      cameraFocus: 'Focus on portal/threshold hierarchy; keep figures secondary.',
      action:
        'No action scene. Suggest pursuit through wind, threshold light, and opposing era materials.',
    },
    'SP05-258': {
      hero: 'A small practical helper silhouette may appear, but no hero portrait. Focal anchor is utility craft: toolbox geometry, rope green, worn leather, dull steel, warm work light, and careful competence.',
      environment:
        'Use abstract work-surface/adventure-material space only; no workshop room, market stall, dungeon corridor, tool pile clutter, camera, readable labels, or fantasy tavern.',
      detail:
        'Secondary detail must be functional material: braided fiber, dull metal, used leather, mineral dust, small latch, or warm portable light.',
      feeling:
        'Charm comes from competence and utility, not from spectacle, prop clutter, or group portrait.',
      cameraFocus: 'Focus on tools/material hierarchy; no face, no room staging.',
      action: 'No action scene. Suggest support through precise modules and warm work highlights.',
    },
    'SP05-261': {
      hero: 'No character hero. Focal anchor is eclipse scar weight: black crescent mass, scarred mineral planes, abraded hide texture, dried crimson stain, and heavy ink density.',
      environment:
        'Use abstract shadow/material field only; no warrior portrait, sword, cathedral, corridor, battlefield, monster, camera, or gore.',
      detail:
        'Secondary detail must be material: crosshatch scar, cracked mineral matte, black patina, dried red edge, or dusty midtone grain.',
      feeling:
        'Tragedy comes from burden and ink weight, not from violence, body, face, or weapon.',
      cameraFocus: 'Focus on dark mass hierarchy and scar texture; no portrait, no body crop.',
      action:
        'No action scene. Suggest fate pressure through eclipse shape, scars, and compressed shadow.',
    },
    'SP05-262': {
      hero: 'One original uneasy adult witness, investigator, or morally ambiguous human-scale silhouette as the readable focal subject, with ordinary matte danger, paper-dry planes, sterile fragments, faint grime, and one ambiguous warm trace around them. Not a black cloak figure, gothic traveler, or ruined-fantasy silhouette.',
      environment:
        'Use restrained ordinary surface/room-edge space around the subject; no ruins, tower, arch, courtyard, castle, hallway corridor, door, doorway, vertical door panel, classroom, office, hospital room, smiling face, camera, readable paper, domestic furniture, or object-only still life.',
      detail:
        'Secondary detail must be surface-only: brushed plane, paper grain, cold seam, faint grime, small tape edge, or restrained warm mark.',
      feeling:
        'Suspicion comes from ordinary surfaces and absence, not from portrait, room staging, or horror object.',
      cameraFocus:
        'Focus on the quiet human silhouette inside flat surface hierarchy and negative space; no face-only portrait, no readable document, no upright door-like form.',
      action:
        'Use one restrained pause, glance-away, or hand-near-surface gesture. Suggest unease through restrained surfaces and small ambiguous traces.',
    },
    'SP05-263': {
      hero: 'No character hero. Focal anchor is black signal nihilism: glossy void object, fluorescent rule lines, scratched glass, black polymer sheen, and synthetic dust.',
      environment:
        'Use abstract void/signal field only; no game arena, hallway, room, person, weapon, camera, readable UI, screen, or domestic set.',
      detail:
        'Secondary detail must be signal/material: fluorescent scan haze, black gloss edge, scratched glass, polymer seam, or synthetic dust.',
      feeling:
        'Nihilism comes from rules pressure and void objects, not from survival action or portrait drama.',
      cameraFocus: 'Focus on glossy object/signal hierarchy; no face, no screen text.',
      action:
        'No action scene. Suggest survival logic through black forms, fluorescent lines, and cold precision.',
    },
    'SP05-264': {
      hero: 'One original fragile adult survivor or human-scale silhouette as the readable focal subject, not a child or doll. Build clinical rupture through soft pastel shards, sterile white planes, cracked memory fragments, and invisible-force stress lines.',
      environment:
        'Use abstract clinical space around the subject; no hospital room, hallway, bed, child, doll, gore, camera, readable note, domestic/studio furniture, or object-only fracture poster.',
      detail:
        'Secondary detail must be material: porcelain crack, paper-white plane, pastel smear, cold seam, or tiny red stress mark.',
      feeling: 'Sadness comes from rupture and absence, not from bodies, injury, or room staging.',
      cameraFocus:
        'Focus on the fragile silhouette inside low surface hierarchy and negative space; no face-only portrait, no door, no room.',
      action:
        'Use one restrained bracing, reaching, or suspended-stillness gesture. Suggest trauma through fractured planes and restrained color.',
    },
    'SP05-265': {
      hero: 'One original rose-black gothic figure or decadent romance silhouette as the readable focal subject, not an aristocrat portrait or cape hero. Surround them with lacquered black curves, rose petal pressure, moonlit ornament, and decayed gold machinery.',
      environment:
        'Use gothic ornament field around the subject; no cathedral, corridor, throne room, weapon, cape hero, camera, rose garden scene, palace interior, or object-only ornament panel.',
      detail:
        'Secondary detail must be ornamental material: lacquer curve, rose-black petal, tarnished gold edge, moonlit filigree, or dark velvet plane.',
      feeling:
        'Decadence comes from ornament and pressure, not from character glamour or architecture.',
      cameraFocus:
        'Focus on the gothic figure inside baroque material hierarchy; no face-only portrait, no hallway perspective.',
      action:
        'Use one restrained turn, hand-to-chest, or wind-pulled silhouette gesture. Suggest predatory romance through curves, petals, and shadow.',
    },
    'SP05-266': {
      hero: 'No fugitive portrait. Focal anchor is black particle tension: matte spectral fragments, institutional pressure grids, identity-erasure haze, and cold black dust.',
      environment:
        'Use abstract system-stress space only; no corridor, chase, police, lab room, person, camera, readable UI, or city alley.',
      detail:
        'Secondary detail must be material: black particle cloud, matte shard, cold grid edge, institutional gray plane, or spectral smear.',
      feeling: 'Terror comes from erasure and pressure, not from pursuit scene or face drama.',
      cameraFocus: 'Focus on particles and system geometry; no person, no room.',
      action: 'No action scene. Suggest fugitive stress through dispersion and hard grid pressure.',
    },
    'SP05-267': {
      hero: 'One original weathered revenge survivor, ronin-like traveler, or human-scale silhouette as the readable focal subject, with no visible weapon. Build blood-ink severance rhythm through blunt torn paper islands, dried red ink stains, weathered brush blocks, and period-grit abrasion.',
      environment:
        'Use ink/material field and harsh weather around the subject; no sword, blade silhouette, spear, staff, long pointed shape, weapon-like prop, battlefield, castle corridor, samurai pose, explicit gore, camera, landscape duel, or object-only print field.',
      detail:
        'Secondary detail must be mark/material: blunt brush block, dried red stain, torn fiber patch, smoke-gray wash, or grit abrasion.',
      feeling:
        'Revenge pressure comes from ink rhythm and endurance, not from weapon action or body violence.',
      cameraFocus:
        'Focus on the weathered silhouette inside blunt collage hierarchy and paper/ink texture; no face-only portrait, no held object, no sharp weapon silhouette.',
      action:
        'Use one restrained walking-away, kneeling, or wind-braced gesture. Suggest severance through cut marks and red-black rhythm.',
    },
    'SP05-268': {
      hero: 'One original desperate older pressure-game survivor as the readable focal subject: gaunt side-profile, cropped gray-streak hair or shaved temples, hunched shoulders, fluorescent sweat gloss, cheap green-pink light, and jagged debt geometry around the body. Not a black-haired brooding young man, not a long dark coat, not a pretty anime hero, not a comedy caricature, not a gambling-table portrait.',
      environment:
        'Use a claustrophobic neon pressure space around the subject: tilted black panels, ugly light gaps, warped floor shadows, and abstract risk geometry. No casino, gambling table, office, alley, rain street, camera, readable numbers, cards, chips, signage, or corridor depth.',
      detail:
        'Secondary detail must be graphic/material: neon smear, jagged line, cheap paper grain, black gap, or oily highlight.',
      feeling:
        'Financial despair comes from posture, sweat, and pressure geometry, not from literal gambling props.',
      cameraFocus:
        'Focus on the character silhouette inside jagged neon stress; no face-only glamour, no text, no prop-first framing.',
      action:
        'Use one restrained collapse, frozen decision, or hand-near-face gesture. Suggest ruin through compressed lines and ugly light.',
    },
    'SP05-269': {
      hero: 'No strategist portrait. Focal anchor is smoke-filled calculation: ash-gray planes, ritual risk tokens without text, predatory shadow, and slow smoke curls.',
      environment:
        'Use abstract tabletop/smoke material space only; no casino room, office, bar, chair, lamp focus, person, camera, readable cards, or game board.',
      detail:
        'Secondary detail must be material: smoke curl, ash grain, black token, worn paper edge, low amber glint, or shadow seam.',
      feeling:
        'Menace comes from patience and calculation, not from gambling scene, face, or props overload.',
      cameraFocus: 'Focus on smoke/material hierarchy; no room staging, no readable symbols.',
      action: 'No action scene. Suggest risk through tokens, smoke, and restrained shadow.',
    },
    'SP05-270': {
      hero: 'One original cursed folk-horror caretaker as the readable focal subject: sturdy older woman or broad non-glamorous survivor, muddy patched cloth, cracked charm, warm ember trace, scarred silhouette, empty hands, and humane guarded posture. Not a black-haired brooding young man, not a long dark coat, not a sword/blade/weapon hero, not a monster attack, not a gore display.',
      environment:
        'Use a muddy folk-horror field edge, broken fence, rain-soft path, or charred village fragment around the subject. No corridor, battlefield, monster, weapon, camera, gore, shrine room, city ruins, or generic fantasy hallway.',
      detail:
        'Secondary detail must be material: mud smear, frayed cloth, cracked charm, warm ember, bone-cream shard, or red-brown seam.',
      feeling:
        'Compassion comes from the figure protecting warmth inside damage, not from violence or heroic suffering.',
      cameraFocus:
        'Focus on the survivor silhouette plus broken material hierarchy; no face-only portrait, no held weapon, no body-horror detail.',
      action:
        'Use one restrained bracing, sheltering, or kneeling gesture. Suggest severance through seams and repaired fragments.',
    },
    'SP05-271': {
      hero: 'No character hero. Focal anchor is sun-reclaimed concrete mystery: cracked institutional concrete, soft grass invasion, bleach sunlight, and quiet existential residue.',
      environment:
        'Use abstract concrete/growth planes only; no school hallway, corridor, room, person, camera, readable signage, city street, or abandoned building vista.',
      detail:
        'Secondary detail must be material: concrete crack, grass sprout, sun stain, rust mark, chalky edge, or pale dust.',
      feeling: 'Unease comes from bright quiet and remnants, not from exploration scene or figure.',
      cameraFocus: 'Focus on concrete/growth hierarchy; no hallway perspective.',
      action: 'No action scene. Suggest mystery through sun, concrete, and softened remnants.',
    },
    'SP05-272': {
      hero: 'One original humane synthetic mourner as the readable focal subject: pale rain hood, white or silver cropped hair, calm side silhouette, restrained grief posture, black glass reflection, soft alloy seams, and humane white light. Not a black-haired brooding young man, not a long dark coat, not a robot-face portrait, not a detective cosplay, not a weapon scene.',
      environment:
        'Use a rain-polished black-glass memorial, shallow city-machine fragment, wet canopy edge, or reflective forensic plane around the subject. No alley corridor, cathedral/gothic hall, lab room, readable UI, vehicle focus, camera, lamp-post cliche, police scene, or architectural tunnel.',
      detail:
        'Secondary detail must be material: alloy seam, rain bead, black glass plane, cold white edge, or muted red trace.',
      feeling:
        'Mourning comes from polished restraint, posture, and ethical weight, not from sci-fi spectacle.',
      cameraFocus:
        'Focus on the character within rain, seam, and reflection hierarchy; no face-only portrait, no robot close-up, no corridor depth.',
      action:
        'Use one restrained looking-down, reaching, or still witness gesture. Suggest grief through rain, seams, and quiet light.',
    },
    'SP05-273': {
      hero: 'No character hero. Focal anchor is luminous natural cycle calm: pale moss, moonlit medicine glow, soft ecological ring, and living haze.',
      environment:
        'Use abstract natural material field only; no forest path corridor, cottage, healer portrait, animal, monster, camera, shrine, or fantasy vista.',
      detail:
        'Secondary detail must be ecological material: moss grain, pale leaf, fungal glow, moonlit mist, damp stone, or soft root curve.',
      feeling: 'Calm comes from cycle and ecology, not from character scene or creature focus.',
      cameraFocus: 'Focus on organic material hierarchy; no face, no path perspective.',
      action: 'No action scene. Suggest healing through rings, moss, and moon haze.',
    },
    'SP05-274': {
      hero: 'No character hero. Focal anchor is winter guilt suspicion: frost-soft paper fragments, cold domestic cloth, faded memory stain, and protective dread shadow.',
      environment:
        'Use abstract winter surface field only; no bedroom, living room, chair, curtain, lamp, hallway, person, camera, readable note, or family scene.',
      detail:
        'Secondary detail must be surface/material: frost edge, worn cloth, cold paper, faded stain, pale wood grain, or blue-gray shadow.',
      feeling:
        'Suspicion comes from ordinary softness under threat, not from room staging or portrait.',
      cameraFocus: 'Focus on winter material stillness; no furniture, no room perspective.',
      action: 'No action scene. Suggest guilt through cold fragments and memory traces.',
    },
    'SP05-275': {
      hero: 'No character hero. Focal anchor is civic rumor breakdown: warped poster layers without readable text, public-surface scratches, panic color smear, and dream-logic distortion.',
      environment:
        'Use abstract civic surface field only; no street crowd, market, subway corridor, TV screen, camera, readable media, face, school hallway, city scene, window, cathedral, church glass, or room architecture.',
      detail:
        'Secondary detail must be material/graphic: torn poster edge, smear, halftone noise, civic paint layer, bent grid, or anxious red accent.',
      feeling:
        'Panic comes from collective pressure in surfaces, not from people, news screens, or literal crowd.',
      cameraFocus:
        'Focus on poster/surface hierarchy; no readable words, no face, no window-like frame.',
      action: 'No action scene. Suggest rumor through warped civic layers and pressure marks.',
    },
    'SP05-276': {
      hero: 'No character hero. Focal anchor is sun-bleached discipline material: heat-stripped stone, severe hierarchy blocks, dry cloth edge, and irreversible-motion tension.',
      environment:
        'Use abstract sun-baked material field only; no desert soldiers, courtyard, corridor, weapon, person, camera, palace, or execution scene.',
      detail:
        'Secondary detail must be material: bleached stone, dust edge, dry fabric strip, hard shadow, rust-red mark, or cracked hierarchy line.',
      feeling:
        'Cruelty comes from austere pressure and silence, not from people, weapons, or scene violence.',
      cameraFocus: 'Focus on harsh material hierarchy; no portrait, no room, no body.',
      action: 'No action scene. Suggest discipline through heat, blocks, and hard shadows.',
    },
    'SP05-277': {
      hero: 'No adolescent portrait. Focal anchor is rusted neon dread: broken timeline fragments, violet-night stains, rusted metal, and ordinary damage under unreal glow.',
      environment:
        'Use abstract night-surface field only; no bedroom, school hallway, street alley, person, camera, phone, readable poster, or domestic furniture.',
      detail:
        'Secondary detail must be material: rust scratch, violet glow, cracked plastic, damp concrete, torn paper, or soft red edge.',
      feeling:
        'Dread comes from fractured chronology and damaged surfaces, not from face drama or room staging.',
      cameraFocus: 'Focus on neon/rust hierarchy; no portrait, no corridor.',
      action: 'No action scene. Suggest broken youth memory through fragments and violet haze.',
    },
    'SP05-278': {
      hero: 'No character hero. Focal anchor is mineral loneliness: crystalline fracture, pale void, sharp mineral planes, and stripped luminous ecosystem texture.',
      environment:
        'Use abstract mineral void only; no cave corridor, cathedral, person, monster, camera, fantasy ruins, or landscape journey.',
      detail:
        'Secondary detail must be mineral/material: crystal edge, chalk dust, pale glow, sharp plane, fracture seam, or sparse moss grain.',
      feeling: 'Isolation comes from crystalline emptiness, not from figures or scene scale.',
      cameraFocus: 'Focus on fracture hierarchy and negative space; no path perspective.',
      action: 'No action scene. Suggest loneliness through mineral planes and pale light.',
    },
    'SP05-279': {
      hero: 'No character hero. Focal anchor is red-optic security noir as machine still-life: single red lens module, oppressive black metal plates, smoke-dense panels, and one buried warm trace.',
      environment:
        'Use abstract security-machine field only; no soldier, humanoid silhouette, gun, balcony, platform, building, hallway, checkpoint, camera prop, CCTV screen, readable UI, city street, or vehicle.',
      detail:
        'Secondary detail must be material: red optic, black metal seam, smoke grain, matte armor plate, small warm trace, or cable shadow.',
      feeling: 'Political dread comes from machinery and smoke, not from tactical character scene.',
      cameraFocus:
        'Focus on close red optic/material hierarchy; no face, no weapon, no corridor, no architecture.',
      action: 'No action scene. Suggest oppression through red lens and dense machine planes.',
    },
    'SP05-280': {
      hero: 'One original calm midnight messenger as the readable focal subject: adult woman or androgynous elder silhouette, ivory-crimson cloak shape, controlled posture, single lantern glow, crimson floral omen, folded paper edge, and quiet fatal pressure. Not a black-haired brooding young man, not a long dark coat, not a weapon executioner, not a gothic pin-up, not a shrine-maiden copy.',
      environment:
        'Use a shallow midnight threshold, water edge, single lantern pool, or abstract ritual garden plane around the subject. No temple corridor, shrine room, weapon, camera, hanging lantern row, readable letter, gothic interior, or raincoat noir repeat.',
      detail:
        'Secondary detail must be ritual material: lantern amber, crimson petal, folded paper edge, black ink stain, waxy glow, or midnight cloth.',
      feeling: 'Retribution comes from quiet ceremony, not from violence, face, or room staging.',
      cameraFocus:
        'Focus on the messenger silhouette within lantern/paper/floral hierarchy; no face-only portrait, no hallway perspective.',
      action:
        'Use one restrained offering, turning-away, or hand-near-paper gesture. Suggest fatal correspondence through stillness and warm shadow.',
    },
    'SP13-021': {
      hero: 'One original compact alley-rush protagonist as the readable focal subject: shaved-side runner, red-white impact jacket, low forward sprint, compressed shoulders, and broad cel shapes. Not black-haired crouching fighter, not ninja silhouette, not weapon pose, not franchise hero.',
      environment:
        'Use a shallow signage-free wall edge, rooftop lip, or broken concrete plane behind the sprint. Keep it compressed and abstracted; no corridor tunnel, market alley, library aisle, readable text, camera, weapon, or rubble storm.',
      detail:
        'Secondary detail must be rush-specific: red impact streak, white flash block, dust plume, diagonal speed band, or blue-black shadow wedge. No tiny debris noise.',
      feeling:
        'Urgency comes from forward compression and body angle, not from combat contact or generic battle pose.',
      cameraFocus:
        'Focus on horizontal rush silhouette and red-white force bands; no crouching hero clone, no face-only portrait.',
      action:
        'Use one clean side-sprint or shoulder-first dash. No landing crouch, leap kick, sword swing, or punch contact.',
    },
    'SP13-022': {
      hero: 'One original aerial crossing-energy lead as the readable focal subject: white-helmeted or short silver-haired figure twisting midair through cyan-orange vectors, arms open or bracing, with clean readable anatomy. Not black-haired crouching fighter, not ground-level sprint, not weapon pose.',
      environment:
        'Use vertigo-height negative space, lifted horizon, and crossing luminous trails around the figure. No alley, corridor, rooftop crouch, market/library aisle, rubble field, readable UI, or camera.',
      detail:
        'Secondary detail must be cyan-orange crossing vectors, wind-sheared cloth, shock flare, or clean particle arcs. No red-black rush palette.',
      feeling:
        'Epic tension comes from height and crossing vectors, not from melee impact or generic shonen aura.',
      cameraFocus:
        'Focus on aerial diagonal suspension and cyan-orange vector depth; no landing crouch, no black-haired face as first read.',
      action:
        'Use one airborne twist, suspended brace, or falling-cross motion. No ground strike, sword, punch, or running pose.',
    },
    'SP13-025': {
      hero: 'One original upward-thunder protagonist as the readable focal subject: white-haired or masked electric ascender, vertical silhouette, one arm raised or body pulled upward by blue-white current. Not black-haired crouching fighter, not red/cyan cross-energy, not weapon pose.',
      environment:
        'Use vertical storm void, dark negative-fill slabs, and blue-white radial current around the subject. No rooftop action lane, corridor, market/library aisle, city rubble, readable UI, camera, or weapon.',
      detail:
        'Secondary detail must be branching blue lightning, white core glow, vapor haze, ionized dust, or vertical current bands. No red slash trails.',
      feeling:
        'Determination comes from vertical overload and ascent, not from combat contact or crouched attack.',
      cameraFocus:
        'Focus on upward silhouette and blue-white electrical hierarchy; no face-only glamour, no crouching clone.',
      action:
        'Use one rising, levitating, or upward-bracing gesture. No landing crouch, sprint, sword, punch, or ground-level action beat.',
    },
    'SP05-097': {
      hero: 'No skeletal monarch, throne portrait, or shrine form. Focal anchor is dark dominion material as close abstract still-life: bone-ivory crown fragments, royal black slabs, grave violet glow, antique gold seams, and frozen authority.',
      environment:
        'Use abstract material space only; no cathedral, throne room, corridor, skeleton figure, cape hero, lantern, hanging lamp, shrine, window, weapon, camera, readable sigil, palace interior, or tall architectural silhouette.',
      detail:
        'Secondary detail must be dominion material: bone arch shard, black lacquer plane, violet rim, antique gold edge, cold emerald point, or crimson authority seam.',
      feeling:
        'Regality comes from hierarchy and material pressure, not from character, throne, or architecture.',
      cameraFocus:
        'Focus on close material hierarchy; no face, no room, no hallway, no architecture.',
      action:
        'No action scene. Suggest dominion through symmetry, bone-black contrast, and cold light.',
    },
  };
  const promptOverride = objectOnlyPromptOverrides[preset.id];
  const promptOverrideAllowsCharacter =
    promptOverride &&
    [
      'SP05-125',
      'SP05-133',
      'SP05-134',
      'SP05-221',
      'SP05-223',
      'SP05-237',
      'SP05-251',
      'SP05-241',
      'SP05-243',
      'SP05-245',
      'SP05-255',
      'SP05-262',
      'SP05-264',
      'SP05-265',
      'SP05-267',
      'SP05-067',
      'SP05-069',
      'SP05-268',
      'SP05-270',
      'SP05-272',
      'SP05-280',
      'SP13-021',
      'SP13-022',
      'SP13-025',
    ].includes(preset.id);
  const genericNonAnimeCard =
    !allowsAnimeGrammar &&
    !cartoonMediaCard &&
    !pack06Card &&
    !pack08Card &&
    !pack10PatternTextureCard &&
    !pack15PunkCard &&
    !pack17MedievalCard &&
    !promptOverride;
  const sp05178NoCorridor = preset.id === 'SP05-178';
  const heroLine = promptOverride
    ? promptOverride.hero
    : cartoonMediaCard
      ? `A flat representational cartoon-media specimen: ${pack02CartoonRepresentativeHeroCue(preset)}.`
      : pack15PunkCard
        ? 'Use one distinctive x-punk protagonist designed from this exact preset and obey the DIVERSITY LOCK for age, body type, crop, role, and silhouette. Let posture, wardrobe block, attitude, social role, and body language carry the style identity. Machines, vehicles, relics, creatures, signal motifs, and engineered shapes may appear beside or behind them as world context, but keep hands empty or naturally gestural and do not make object-use the pose. Do not use centered full-body fantasy adventurer, repeated young stylish anime protagonist, generic RPG hero, generic American stock character, uniformed worker, propaganda figure, cloak/pouch costume, or worker crew.'
        : pack08Card
          ? `One original adult fashion subject for ${sanitizeStylePromptName(preset.name)}: garment silhouette, posture, fabric behavior, and styling must be first read.`
          : pack06Card
            ? pack06HeroPrompt(promptCategoryKey, preset)
            : pack10PatternTextureCard
              ? `No character hero. Focal anchor is one cropped ${sanitizeStylePromptName(preset.name).toLowerCase()} material specimen, patterned object, folded surface, or shallow texture panel.`
              : genericNonAnimeCard
                ? nonAnimeRepresentativeHeroCue(preset)
                : familyVariant(HERO_VARIANTS, family, `${variantSeed}:hero`);
  const environmentLine = promptOverride
    ? promptOverride.environment
    : sp05178NoCorridor
      ? 'Use shallow layered broken-facade panels, invasive-shadow shapes, and wet asphalt texture fragments around the character; no walkable street, alley, hallway, road, sidewalk, shrine corridor, room, market, library, or long depth lane.'
      : cartoonMediaCard
        ? 'Environment optional: use a flat graphic field by default, or a simple concrete setting if it makes this preset easier to read. Do not repeat the same wall, lamp, shelf, corridor, studio, market, library, or furniture formula across cards.'
        : pack15PunkCard
          ? 'Use a compact art-directed x-punk world fragment tied to the protagonist: street corner, vehicle bay, shrine street, signal rooftop, flood barrier, salvage camp, weather rig, lunar garage, cave settlement, transit deck, public plaza, or gothic salon chosen only when preset-specific. Environment must sell the punk subtype around the character; it must not become object-only display, handheld-prop scene, control-surface demo, tool demo, generic fantasy scenery, market aisle, corridor, workshop crew scene, American stock backdrop, or concept-art panorama.'
          : pack08Card
            ? 'Use a restrained editorial setting with one preset-specific cue: street edge, studio plane, stage light, gym threshold, atelier wall, or clean interior detail. No runway crowd, boutique aisle, closet, catalog page, or prop clutter.'
            : pack06Card
              ? pack06EnvironmentPrompt(promptCategoryKey, preset)
              : pack10PatternTextureCard
                ? 'Use shallow material depth only; no person, portrait, mannequin, room, domestic props, showroom, furniture, corridor, market aisle, library aisle, or fantasy hallway.'
                : familyVariant(ENVIRONMENT_VARIANTS, family, `${variantSeed}:environment`);
  const compositionLine = sp05178NoCorridor
    ? 'Close-to-mid emergency-poster crop with compressed shallow layers, empty hands visible, occult hazard geometry behind the shoulder, and no vanishing-point lane or navigable corridor.'
    : cartoonMediaCard
      ? 'Poster-readable composition, one simple graphic anchor plus supporting marks, generous crop-safe negative space; perspective, floor contact, cast shadow, or a simple setting can appear when they make the preset more legible.'
      : pack15PunkCard
        ? 'Character-led 2D illustrated style-card composition with one clear protagonist plus thematic background, following the DIVERSITY LOCK crop exactly. Vary scale aggressively across presets: small environmental figure, medium-long full body, seated/leaning public-life vignette, back view, side view, masked/obscured face, or unusual poster angle. Strong silhouette first, shallow poster depth, broad foreground/midground/background planes, crop-safe graphic spacing, limited crowding, and no object-only poster, signal-prop portrait, mechanical focal prop, photo-session staging, cinematic close-up, repeated waist-up fashion bust, realistic perspective drama, propaganda poster crowd, or foreground uniform portrait.'
        : pack08Card
          ? 'Fashion editorial card composition: one model, readable garment silhouette, crop-safe full or three-quarter pose, simple background planes, and no object-only clothing display.'
          : pack06Card
            ? 'Strong style-card composition: one clear subject or scenelet with foreground/midground/background planes, crop-safe negative space, and a non-default silhouette. Avoid lonely centered object demo, school exercise sheet, or generic portrait bust unless the preset explicitly needs that read.'
            : pack10PatternTextureCard
              ? 'Material-card composition: one readable cropped surface or object edge, macro-to-mid textile/material depth, crop-safe negative space, and no character or room staging.'
              : pickVariant(COMPOSITION_VARIANTS, `${variantSeed}:composition`);
  const materialLine = cartoonMediaCard
    ? 'Let paper tooth, cel paint, ink, wax, marker, collage edge, or print texture carry the style; physical props or scene objects are useful only when they are a representative cue, not filler.'
    : pack15PunkCard
      ? 'Use broad illustrated material planes: simplified metal, cloth, smoke, neon, bio-material, stone, salvage, glass, or weather shapes with visible brush edges, clean drawn contours, optional subtle paper texture, and sparse graphic wear. Materials should look stylized, matte, painterly, and designed, not photoreal, physically simulated, or PBR-rendered. Avoid realistic metal/armor rendering, mirror rain reflections, noisy grime, tiny rivets everywhere, dense cable webs, panel-grid overload, over-rendered machinery, scratchy screenprint noise, and high-frequency surface detail.'
      : pack17MedievalCard
        ? 'Use readable illustrated material planes: clean armor edges, cloth folds, stone cuts, relic surfaces, controlled print texture, and medium-sized details. Avoid photoreal skin/material simulation, muddy grime, dirty dark speckle, and tiny noisy micro-texture.'
        : pack08Card
          ? 'Prioritize fabric behavior: drape, seam, weave, leather/knit/sheen contrast, layering, footwear, and accessory scale. No noisy textile microdetail.'
          : sp05178NoCorridor
            ? 'Use costume cloth, wet asphalt texture fragments, botanical silhouettes, talisman-gold lines, painted cel shadows, and hazard glow; no centered prop, sword, staff, wand, blade, weapon, or handheld object.'
            : promptOverride
              ? 'Use broad graphic/material surfaces tied to this preset; do not introduce skin, clothing, portrait, body, or lifestyle texture unless the override explicitly asks for it.'
              : pack06Card
                ? 'Use medium-specific material behavior as broad readable design: pigment body, paper tooth, ink pressure, pixel constraints, collage seams, vector edges, or digital brush planes. Let material support the subject and palette; avoid tiny noisy texture chatter.'
                : pack10PatternTextureCard
                  ? 'Let the named pattern or texture carry the full style signal through broad readable material behavior, not through props, people, interiors, or fashion staging.'
                  : genericNonAnimeCard
                    ? 'Prioritize preset-specific material behavior, surface rhythm, color fields, and environmental texture. Avoid skin/face/hair rendering as the main style signal unless the preset explicitly needs a person.'
                    : pickVariant(MATERIAL_VARIANTS, `${variantSeed}:material`);
  const lightingLine = cartoonMediaCard
    ? 'Prefer graphic color, paper/cel texture, and style-specific mark contrast; realistic lighting is fine only when it is a deliberate representative cue.'
    : pack15PunkCard
      ? 'Use stylized illustration lighting only: graphic value blocks, controlled color glow, clear rim or ambient accent, open midtones, and readable dark-gray shadow shapes. Avoid cinematic photoreal lensing, physically realistic light, crushed blacks, flat black fills, volumetric hyperreal smoke/fog, realistic night-war mood, HDR highlight noise, and bokeh/photo depth.'
      : pack17MedievalCard
        ? 'Use simple readable illustration lighting: one clear key light plus one rim or glow accent, open midtones, defined shadow shapes, and visible details in dark areas. Avoid cinematic low-light realism, crushed blacks, smoky artifact buildup, and noisy dark gradients.'
        : pack06Card
          ? 'Use color-script lighting, not generic realism: one dominant hue family, one counter-temperature shadow, one surprising accent, open midtones, and clean value grouping. Avoid weak beige/blue, stock orange-teal, muddy monochrome, or neon pasted over dark mush.'
          : pickVariant(LIGHT_VARIANTS, `${variantSeed}:light`);
  const detailLine = cartoonMediaCard
    ? 'Details must be broad style marks and readable from thumbnail size; avoid tiny noisy micro-detail, repeated props, signs, labels, or stock room clutter.'
    : pack15PunkCard
      ? 'Details must be few, medium-large, and aesthetic: character silhouette, garment mass, posture, age/body cue, social cue, background machine/biome/weather shape, material symbol embedded in the setting, or creature/environment feature. Clothing and environment should identify the punk subtype without becoming cosplay armor, worker uniform, fashionable jacket identity, handheld-gadget identity, or object-demo staging. Avoid repeated hair-as-identity, repeated high-collar jacket, lace-like microdetail, repeated decorative props, shields/badges unless explicitly required, realistic face/hair detail, tattoo-detail focus, leather-pouch costume detail, texture chatter, ultra-fine ornamental noise, cable lattice carpets, window-panel matrices, and machinery packed into every inch.'
      : pack17MedievalCard
        ? 'Details must be visible and drawn with clear edges: armor seams, border shapes, relic trim, monster features, cloth folds, masonry cuts, or graphic marks. Avoid over-texturing, black mush, dirty speckle, and ultra-fine clutter.'
        : pack08Card
          ? 'Details must be garment-scale: cut, hem, sleeve, collar, belt, texture block, shoe shape, or accessory rhythm. Avoid logos, readable text, jewelry clutter, prop-first styling, and ultra-fine noise.'
          : promptOverride
            ? promptOverride.detail
            : pack06Card
              ? 'Details must be medium-sized and style-specific: paint edge, ink break, paper seam, pixel cluster, stencil bridge, palette accent, garment/material cue, or environmental scale mark. No decorative filler, no repeated bird/animal shortcut, no ultra-fine noise.'
              : pack10PatternTextureCard
                ? 'Details must stay material-scale: repeat interval, weave ridge, pigment bleed, grain line, seam edge, marble vein, dot spacing, or folded-surface shadow. No pose nuance, face, body, garment model, room prop, or ultra-fine noise.'
                : genericNonAnimeCard
                  ? 'Details must be medium-sized preset cues: material edge, process mark, object contour, palette accent, environmental scale mark, or symbolic shape. No face glamour, hair-as-identity, costume microdetail, or ultra-fine noise.'
                  : pickVariant(DETAIL_VARIANTS, `${variantSeed}:detail`);
  const feelingLine = cartoonMediaCard
    ? 'Mood comes from line rhythm, deformation, crude pressure, color clash, texture, and anchor silhouette, not from a literal scene, celebrity likeness, prop, or known character.'
    : promptOverride
      ? promptOverride.feeling
      : pack06Card
        ? 'Feeling comes from the medium behaving with taste: confident color, subject choice, mark pressure, material contact, and a tiny implied story. Avoid sterile technique demo or asset-library placeholder mood.'
        : pack10PatternTextureCard
          ? 'Feeling comes from material rhythm, surface tactility, repeat scale, color separation, and clean crop tension; no character dynamics, face emotion, cute object, or lifestyle scene.'
          : genericNonAnimeCard
            ? 'Feeling comes from palette, material pressure, process trace, atmosphere, and composition. If a figure appears, keep acting restrained and non-anime; do not use big-eye emotion or character-card drama.'
            : pickVariant(FEELING_VARIANTS, `${variantSeed}:feeling`);
  const cameraFocusLine = cartoonMediaCard
    ? 'No camera logic: prioritize silhouette, line behavior, and texture rhythm as a flat graphic card.'
    : pack15PunkCard
      ? 'No photographic camera logic: no lens realism, no shallow DOF, no bokeh, no cinematic key-art depth, no dramatic real-world perspective. Prioritize flattened poster hierarchy, designed silhouette, drawn edges, shallow illustration depth, graphic focal hierarchy, and one representative subject or scene that sells the punk subtype.'
      : pack17MedievalCard
        ? 'Prioritize clean silhouette, defined linework, and card-readable focal hierarchy over photoreal camera depth or murky atmosphere.'
        : pack08Card
          ? 'Prioritize garment silhouette and body posture over face glamour or background. Keep hands, shoulders, hips, knees, and feet anatomically readable.'
          : sp05178NoCorridor
            ? 'Focus on the original face, empty hands, shoulder contour, and occult hazard geometry; do not focus down an alley, road, hallway, corridor, or handheld object.'
            : promptOverride
              ? promptOverride.cameraFocus
              : pack06Card
                ? 'Prioritize graphic focal hierarchy over camera realism: silhouette first, color block second, medium texture third. Keep anatomy simple when figures appear; keep objects contextual rather than isolated product shots.'
                : pack10PatternTextureCard
                  ? 'Prioritize material hierarchy over camera realism: one readable surface rhythm, one dominant scale, clean crop, and no lens drama, portrait framing, product pedestal, or room perspective.'
                  : genericNonAnimeCard
                    ? 'Prioritize the preset-specific anchor and material/composition hierarchy over face, pose, or character glamour. Keep any figure simple, non-anime, and secondary unless the preset explicitly needs people.'
                    : pickVariant(CAMERA_FOCUS_VARIANTS, `${variantSeed}:focus`);
  const representationRuleLine = promptOverride
    ? promptOverrideAllowsCharacter
      ? 'Prompt override character rule: include one readable original character or human-scale silhouette integrated with a preset-specific environment/background. Do not output object-only abstraction, franchise likeness, weapon-first action, UI/text, crowd lineup, or face-only portrait.'
      : 'Object/material safety exception: include one readable object, material specimen, symbolic focal form, or environment motif. Do not output an empty abstract-only field, but do not add characters, faces, bodies, portraits, or literal action scenes.'
    : pack15PunkCard
      ? 'Pack 15 rule: include one readable characteristic x-punk protagonist as primary subject, integrated with a thematic background/environment. Machines, relics, vehicles, weather systems, creatures, architecture, and symbolic objects may exist only as context around the protagonist; do not put the protagonist in a repeated object-use gesture or make a technical foreground element the card identity. Avoid object-only posters, abstract-only cards, worker crews, revolution/propaganda crowds, generic RPG heroes, and generic American stock illustration.'
      : pack08Card
        ? 'Pack 08 rule: include one adult fashion figure wearing the style. Garment and silhouette are mandatory; do not output object-only clothing, empty texture, mannequin, catalog flat lay, runway crowd, or abstract textile field.'
        : pack06Card
          ? preset.id === 'SP06-112'
            ? 'Pack 06 icon-kit rule: include a coherent non-weapon support-equipment icon kit with multiple readable device silhouettes and shallow in-world context. Do not add people, humanoids, mascot helpers, anime mechanics, portraits, creatures, or character scenes; the named icon-system grammar must read before any narrative content.'
            : pack06AllowsAnimePreset(preset)
              ? 'Pack 06 anime-allowed rule: include one readable subject or scenelet chosen from the base prompt while preserving the visual-novel, gacha, or anime-game system the preset explicitly asks for.'
              : 'Pack 06 rule: include one readable medium-led subject or scenelet chosen from the base prompt. Objects, creatures, vehicles, relics, material forms, environment fragments, and restrained non-anime figures are allowed when they prove the preset. The named medium/system must read before any character design. Do not reduce the card to anime character art, a basic object demo, palette swatch, centered mascot, technique sample, or empty abstraction.'
          : pack10PatternTextureCard
            ? 'Pack 10 Pattern & Texture rule: include one readable material specimen, patterned object, folded surface, textile crop, or texture panel. Do not add characters, portraits, mannequins, rooms, furniture, wallpaper-showroom staging, or literal lifestyle scenes.'
            : genericNonAnimeCard
              ? 'Non-anime rule: include one readable preset-specific anchor: material specimen, symbolic object, environment fragment, craft/process form, or restrained stylized figure only when useful. Do not output generic anime portrait, manga character card, visual-novel bust, gacha frame, or empty abstract-only card.'
              : representativeAnchorRule(pack, category, preset);
  const actionLine = promptOverride
    ? promptOverride.action
    : cartoonMediaCard
      ? 'No action scene: imply motion through anchor deformation, smear marks, elastic curves, repeated lines, or scribble pressure.'
      : pack15PunkCard
        ? 'Show one simple role-defining attitude or lived-world beat chosen by the DIVERSITY LOCK: walking through the place, waiting under strange weather, looking back, sheltering, performing, resting, guarding a threshold, crossing a transit space, riding, sitting, being dwarfed by the environment, or standing as the world moves around them. Keep it personal, iconic, and prop-free, not a task demo, worker productivity pose, military pose, crowd rally, repeated hands-in-pockets portrait, or action-hero combat.'
        : sp05178NoCorridor
          ? 'Imply a paused defensive reaction with empty hands and wind-tension only; no chase, weapon swing, attack pose, battle lane, or street confrontation.'
          : pack06Card
            ? 'Use a small readable beat when helpful: stance, drift, weather pressure, material pull, traversal cue, print registration slip, pixel motion, or collage tear direction. Static is fine only when the subject still feels intentionally composed and flavorful.'
            : pack10PatternTextureCard
              ? 'No action scene. Suggest movement only through folds, weave direction, grain, repeat rhythm, pigment bleed, or material flow.'
              : genericNonAnimeCard
                ? 'Use motion only when it clarifies the preset: process flow, material drift, environmental pressure, or a restrained non-anime figure gesture. Static is fine when the anchor is strong.'
                : pickVariant(ACTION_VARIANTS, `${variantSeed}:action`);
  const constraintSemanticsLine = pack15PunkCard
    ? 'Interpret avoid/no lists as anti-repetition guidance, but keep the pack contract strict: one protagonist in environment is required; technical, mystic, vehicle, signal, or machine motifs may appear only as world context, not as foreground focal equipment or object-use action.'
    : pack10PatternTextureCard
      ? 'For pack_10 Pattern & Texture, keep avoid/no lists strict against scene drift: do not add people, portraits, mannequins, rooms, furniture, lifestyle props, product staging, corridors, market aisles, library aisles, fantasy hallways, logos, readable codes, or decorative hero objects.'
      : constraintSemantics();
  const visualResetLine = pack15PunkCard
    ? 'If any earlier phrase sounds abstract-only, object-led, or no-scene, reinterpret it as anti-cliche guidance. The final card still needs one readable characteristic protagonist inside a thematic background/environment. Abstract marks, machinery, symbols, materials, and signal effects support that character-world read; they are not the whole image and not the foreground action.'
    : promptOverride
      ? 'If any earlier phrase sounds abstract-only, reinterpret it as anti-cliche guidance. The final card still needs one readable representative object, material form, symbolic focal form, or environment motif. Do not add a character, face, body, portrait, or literal scene when the override says object/material-first.'
      : pack08Card
        ? 'If any earlier phrase sounds object-only or abstract-only, reinterpret it as anti-cliche guidance. The final SP08 card still needs one adult fashion figure wearing a preset-specific garment in a restrained editorial context.'
        : pack06Card
          ? 'If any earlier phrase sounds like object-only, technique-demo, or abstract-only, reinterpret it as anti-cliche guidance. The final SP06 card still needs one tasteful readable subject or scenelet with medium identity, deliberate palette, and enough context to feel designed. Do not overcorrect into empty abstraction or isolated prop/product art.'
          : pack10PatternTextureCard
            ? 'If any earlier phrase sounds abstract-only, reinterpret it as anti-cliche guidance. The final pattern card still needs one readable material specimen or patterned object, but no character, portrait, room, or lifestyle scene.'
            : genericNonAnimeCard
              ? 'If any earlier phrase sounds abstract-only, reinterpret it as anti-cliche guidance. The final card still needs one readable preset-specific anchor, but do not solve it as anime, manga, visual-novel, gacha, or generic character-card art unless this exact preset explicitly asks for that.'
              : visualResetRule();
  const differentiationLine = pack10PatternTextureCard
    ? 'Keep the material/pattern anchor, but do not reuse generic staging from neighboring presets in this category; vary repeat scale, surface crop, fold/grain direction, tactile edge, and color identity for this preset specifically.'
    : 'Keep the anchor, but do not reuse generic staging from neighboring presets in this category; vary subject design, environment read, action cue, and color identity for this preset specifically.';

  const animeSafeCharacterCard =
    imagegenSafeDna &&
    (pack.id === 'pack_05' || pack.id === 'pack_13' || pack.id === 'pack_16') &&
    !promptOverride;
  const anatomyRuleLine =
    animeSafeCharacterCard ||
    pack08Card ||
    pack06Card ||
    pack.id === 'pack_05' ||
    pack.id === 'pack_13' ||
    pack.id === 'pack_16'
      ? 'ANATOMY QA: if human or humanoid figures appear, keep anatomy simple, intentional, and readable. Prioritize clean head-neck-shoulder-hip alignment, believable hand count, clear fingers, stable feet, and non-fused joints. Anime-style anatomy is allowed only when the preset explicitly asks for anime, manga, visual-novel, gacha, shonen, shojo, seinen, josei, moe, or isekai language. For complex action or ensemble scenes, reduce secondary figures to silhouettes or partial shapes instead of many full bodies. Hybrid character design is allowed, but it must not look like broken anatomy, extra limbs, melted hands, tangled instruments, or fused costumes.'
      : '';

  if (imagegenSafeDna && !promptOverride && !pack06Card) {
    return appendImagegenDenoiseDirective(
      `Generate one portrait default style-card image.
TARGET STYLE: ${promptSafeImagegenLabel}
MODE: text-to-image
MODEL: ${IMAGEGEN_MODEL}, ${IMAGEGEN_REASONING_EFFORT}

${nonAnimeStyleLock ? `${nonAnimeStyleLock}\n` : ''}
Create an original, clean, text-free illustrated style-card. ${
        animeSafeCharacterCard
          ? 'Use one full readable original anime protagonist as the primary anchor: face/pose/acting/costume silhouette must carry the preset identity. Props, relics, emblems, light motifs, and environment fragments support the character; they must not replace the character.'
          : pack15PunkCard
            ? 'Use one readable characteristic x-punk protagonist as the primary anchor: face/pose/wardrobe silhouette/body language must carry the subtype. Props, relics, machines, vehicles, creatures, and environment fragments support the character; they must not replace the character.'
            : 'Use one readable representative anchor: emblem, relic, material specimen, light motif, or environment fragment.'
      } Keep it non-graphic, non-derivative, polished, card-readable, and distinct from neighboring presets.

STYLE DNA: aesthetic=${styleAesthetic}; subject=${styleSubject}; color=${styleColor}; light=${styleLighting}; texture=${styleTexture}; camera=${styleCamera}; mood=${styleMood}; render=${styleRender}; features=${styleFeatures}.

${
  animeSafeCharacterCard || pack15PunkCard
    ? `HERO: ${heroLine}
ENVIRONMENT: ${environmentLine}
FEELING: ${feelingLine}
ACTION: ${actionLine}
`
    : ''
}REPRESENTATION RULE: ${representationRuleLine}
CONSTRAINT SEMANTICS: ${constraintSemantics()}
${anatomyRuleLine ? `${anatomyRuleLine}\n` : ''}${pack12Rule ? `VIDEO GAME GAMEPLAY RULE: ${pack12Rule}\n` : ''}COMPOSITION: Central readable anchor with offset secondary planes and crop-safe negative space.
MATERIAL: ${materialLine}
LIGHTING: ${lightingLine}
DETAIL: ${detailLine}
COLOR SEPARATION: ${pickVariant(COLOR_SEPARATION_VARIANTS, `${variantSeed}:color`)}
${illustrationContract ? `${illustrationContract}\n` : ''}

Make it immediately recognizable as ${recognitionLabel}. Distinct motif to avoid cross-pack convergence: ${presetMotifForPrompt(pack, category, preset)}. No franchise, brand, logo, or copyrighted identity.${avoidRepeatedLibrary} Output only image, 1024x1536 portrait. No text, labels, logos, watermark.${negative}`,
      pack10PatternTextureCard ? PACK10_PATTERN_TEXTURE_DENOISE_SUFFIX : undefined,
    );
  }

  return appendImagegenDenoiseDirective(
    `Generate one portrait default style-card image.
TARGET STYLE: ${promptTargetStyleLabel}
PACK: ${pack.name}
CATEGORY: ${category}
${sessionKey ? `SESSION: ${sessionKey}\n` : ''}MODE: text-to-image
MODEL: ${IMAGEGEN_MODEL}, ${IMAGEGEN_REASONING_EFFORT}

${nonAnimeStyleLock ? `${nonAnimeStyleLock}\n` : ''}
${basePrompt}
${pack06DiversityLock ? `${pack06DiversityLock}\n` : ''}
${pack06PresetBrief ? `${pack06PresetBrief}\n` : ''}
${pack08FashionLock ? `${pack08FashionLock}\n` : ''}
${pack09MaterialLock ? `${pack09MaterialLock}\n` : ''}
${pack15CurrentArtDirection ? `${pack15CurrentArtDirection}\n` : ''}
${pack15DiversityLine ? `${pack15DiversityLine}\n` : ''}
HERO: ${heroLine}
ENVIRONMENT: ${environmentLine}
COMPOSITION: ${compositionLine}
MATERIAL: ${materialLine}
LIGHTING: ${lightingLine}
DETAIL: ${detailLine}
FEELING: ${feelingLine}
CAMERA FOCUS: ${cameraFocusLine}
ACTION: ${actionLine}
COLOR SEPARATION: ${pickVariant(COLOR_SEPARATION_VARIANTS, `${variantSeed}:color`)}
${illustrationContract ? `${illustrationContract}\n` : ''}
REPRESENTATION RULE: ${representationRuleLine}
CONSTRAINT SEMANTICS: ${constraintSemanticsLine}
${anatomyRuleLine ? `${anatomyRuleLine}\n` : ''}${pack12Rule ? `VIDEO GAME GAMEPLAY RULE: ${pack12Rule}` : ''}
${safeCompatibilityNote ? `\nCOMPATIBILITY NOTE: ${safeCompatibilityNote}` : ''}
${guardrails ? `\nSCENE GUARDRAILS: ${guardrails}` : ''}
${repeatedGuardrails ? `\nREPEATED-SCENE GUARDRAILS: ${repeatedGuardrails}` : ''}

Style DNA: aesthetic=${promptStyleAesthetic}; subject=${promptStyleSubject}; color=${promptStyleColor}; light=${promptStyleLighting}; texture=${promptStyleTexture}; camera=${promptStyleCamera}; mood=${promptStyleMood}; render=${promptStyleRender}; features=${promptStyleFeatures}.

VISUAL RESET: ${visualResetLine}

Make it immediately recognizable as ${promptRecognitionLabel}. ${differentiationLine} Apply the style through rendering, mood, materials, optical framing, and treatment, not by adding literal camera equipment. Distinct motif to avoid cross-pack convergence: ${presetMotifForPrompt(pack, category, preset)}. No franchise, brand, character, logo, or copyrighted identity.${avoidRepeatedLibrary} Output only the image, 1024x1536 portrait.${negative}`,
    pack06Card
      ? pack06NonAnimeMediumLock
        ? `${PACK06_IMAGEGEN_DENOISE_SUFFIX} ${PACK06_NON_ANIME_MEDIUM_LOCK}`
        : PACK06_IMAGEGEN_DENOISE_SUFFIX
      : pack10PatternTextureCard
        ? PACK10_PATTERN_TEXTURE_DENOISE_SUFFIX
        : undefined,
  );
}

async function exists(filePath: string) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function cleanupExternalJobArtifacts(jobId: string, sourceAssetPath: string) {
  const transcriptPath = resolveLibraryPathFromRoot(
    libraryDir,
    'transcripts',
    jobId,
    'events.jsonl',
  );
  const codexHome = process.env.CODEX_HOME || defaultCodexHome;
  const transcript = await readFile(transcriptPath, 'utf8').catch(() => '');
  for (const line of transcript.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line) as any;
      const item = event.params?.item;
      if (item?.type !== 'imageGeneration' || !item.id || !event.params?.threadId) continue;
      await rm(path.join(codexHome, 'generated_images', event.params.threadId, `${item.id}.png`), {
        force: true,
      }).catch(() => {});
    } catch {
      // Ignore malformed transcript lines; cleanup is best-effort after the repo copy succeeds.
    }
  }
  const resolvedSourceAssetPath = path.resolve(sourceAssetPath);
  const resolvedRepoRoot = path.resolve(rootDir);
  if (!resolvedSourceAssetPath.startsWith(`${resolvedRepoRoot}${path.sep}`)) {
    await rm(sourceAssetPath, { force: true }).catch(() => {});
  }
  await rm(resolveLibraryPathFromRoot(libraryDir, 'transcripts', jobId), {
    recursive: true,
    force: true,
  }).catch(() => {});
}

function readJobStatusFromSqlite(jobId: string) {
  try {
    const db = new Database(studioDbPath, { readonly: true });
    try {
      return db.query('SELECT id, status, error FROM jobs WHERE id = ? LIMIT 1').get(jobId) as Pick<
        Job,
        'id' | 'status' | 'error'
      > | null;
    } finally {
      db.close(false);
    }
  } catch {
    return null;
  }
}

function readAssetForJobFromSqlite(jobId: string) {
  try {
    const db = new Database(studioDbPath, { readonly: true });
    try {
      return db
        .query(
          `SELECT id, project_id AS projectId, job_id AS jobId, file_path AS filePath,
                  thumbnail_path AS thumbnailPath, public_url AS publicUrl, prompt,
                  width, height, mime_type AS mimeType, created_at AS createdAt,
                  deleted_at AS deletedAt
             FROM assets
            WHERE job_id = ? AND deleted_at IS NULL
            ORDER BY created_at DESC
            LIMIT 1`,
        )
        .get(jobId) as Asset | null;
    } finally {
      db.close(false);
    }
  } catch {
    return null;
  }
}

async function waitForJob(jobId: string) {
  const pollEffect = pollWithScriptTimeout(
    () =>
      Effect.try({
        try: () =>
          readJobStatusFromSqlite(jobId) ??
          (() => {
            throw new Error(`Job ${jobId} is not visible in local studio.sqlite`);
          })(),
        catch: (error) => (error instanceof Error ? error : new Error(String(error))),
      }),
    {
      pollMs: WAIT_POLL_MS,
      timeoutMs: WAIT_TIMEOUT_MS > 0 ? WAIT_TIMEOUT_MS : Number.MAX_SAFE_INTEGER,
      timeoutMessage:
        WAIT_TIMEOUT_MS > 0
          ? `Job ${jobId} timed out after ${WAIT_TIMEOUT_MS} ms while waiting in local studio.sqlite`
          : `Job ${jobId} timed out while waiting in local studio.sqlite`,
      isTerminal: (job) =>
        job.status === 'completed' ||
        job.status === 'failed' ||
        job.status === 'cancelled' ||
        job.status === 'needs_review',
    },
  );

  const job = await Effect.runPromise(pollEffect);

  if (job.status === 'completed') return job;
  if (job.status === 'failed' || job.status === 'cancelled') {
    throw new Error(`Job ${jobId} ended as ${job.status}: ${job.error || 'no error'}`);
  }
  if (job.status === 'needs_review') {
    throw new Error(`Job ${jobId} status needs_review`);
  }

  throw new Error(`Job ${jobId} reached unsupported terminal status: ${job.status}`);
}

async function newestAssetForJob(jobId: string) {
  return readAssetForJobFromSqlite(jobId) ?? null;
}

function manifestPathForPack(packId: string) {
  return path.join(defaultsDir, `manifest-${packId}.json`);
}

function failuresPathForPack(packId: string) {
  return path.join(defaultsDir, `failures-${packId}.json`);
}

async function loadManifest(packId: string) {
  try {
    const parsed = JSON.parse(await readFile(manifestPathForPack(packId), 'utf8')) as
      | StyleDefaultManifestEntry[]
      | StyleDefaultManifestEntry;
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

async function saveManifest(packId: string, entries: StyleDefaultManifestEntry[]) {
  entries.sort((a, b) => a.presetId.localeCompare(b.presetId));
  await writeFile(manifestPathForPack(packId), `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
}

async function loadFailures(packId: string) {
  try {
    return JSON.parse(await readFile(failuresPathForPack(packId), 'utf8')) as unknown[];
  } catch {
    return [];
  }
}

async function saveFailures(packId: string, failures: unknown[]) {
  await writeFile(failuresPathForPack(packId), `${JSON.stringify(failures, null, 2)}\n`, 'utf8');
}

function isFailureEntry(
  value: unknown,
): value is { presetId: string; category?: string; failedAt?: string } {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.presetId === 'string';
}

function collectLatestFailedPresetIds(
  failuresByPack: ReadonlyMap<string, unknown[]>,
  options: {
    packFilter?: string;
    categoryFilters: ReadonlySet<string>;
    presetFilters: ReadonlySet<string>;
    limit: number;
  },
) {
  const latestByPresetId = new Map<string, { presetId: string; failedAt: string; order: number }>();
  let order = 0;

  for (const [packId, failures] of failuresByPack) {
    if (options.packFilter && packId !== options.packFilter) continue;

    for (const failure of failures) {
      if (!isFailureEntry(failure)) continue;
      if (
        options.categoryFilters.size > 0 &&
        !options.categoryFilters.has(sanitizeCategory(failure.category))
      ) {
        continue;
      }
      if (options.presetFilters.size > 0 && !options.presetFilters.has(failure.presetId)) {
        continue;
      }

      const failedAt = typeof failure.failedAt === 'string' ? failure.failedAt : '';
      const current = latestByPresetId.get(failure.presetId);
      const next = {
        presetId: failure.presetId,
        failedAt,
        order,
      };
      order += 1;
      if (
        !current ||
        failedAt > current.failedAt ||
        (failedAt === current.failedAt && next.order > current.order)
      ) {
        latestByPresetId.set(failure.presetId, next);
      }
    }
  }

  const ordered = Array.from(latestByPresetId.values())
    .sort((a, b) => {
      if (a.failedAt === b.failedAt) return b.order - a.order;
      return b.failedAt.localeCompare(a.failedAt);
    })
    .slice(0, options.limit)
    .map((entry) => entry.presetId);

  return new Set(ordered);
}

function argValue(name: string) {
  return process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1];
}

const limitArg = argValue('limit');
const limit = limitArg ? Number(limitArg) : Number.POSITIVE_INFINITY;
const failureLimitArg = argValue('failure-limit');
const failureLimit = failureLimitArg ? Number(failureLimitArg) : Number.POSITIVE_INFINITY;
const packFilter = argValue('pack');
const sessionSuffix = argValue('session-suffix');
const categoryFilterArg = argValue('category');
const presetFilterArg = argValue('preset');
const variantSlotArg = argValue('variant-slot');
const variantSlotsArg = argValue('variant-slots');
const variantCountArg = argValue('variant-count');
const retryFailures = process.argv.includes('--retry-failures');
const printPrompts =
  process.argv.includes('--print-prompts') ||
  process.argv.includes('--dry-run-prompts') ||
  process.argv.includes('--dry-run');
const auditStyleScope = process.argv.includes('--audit-style-scope');
const categoryFilters = new Set(
  (categoryFilterArg
    ? categoryFilterArg.includes('|')
      ? categoryFilterArg.split('|')
      : [categoryFilterArg]
    : []
  ).flatMap((value) => {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }),
);
const presetFilters = new Set(
  (presetFilterArg
    ? presetFilterArg.includes('|')
      ? presetFilterArg.split('|')
      : [presetFilterArg]
    : []
  ).flatMap((value) => {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }),
);
const force = process.argv.includes('--force');
const parallel = Math.max(1, Number(argValue('parallel') || 1));
const lockDir = path.join(defaultsDir, '.locks');
const variantDefaultsDir = path.join(defaultsDir, 'variants');

function parseVariantSlot(value: string, flagName: string) {
  const slot = Number(value);
  if (!Number.isInteger(slot) || slot < 1 || slot > 99) {
    throw new Error(`${flagName} must contain integers from 1 to 99`);
  }
  return slot;
}

function resolveVariantSlots() {
  const activeVariantFlags = [variantSlotArg, variantSlotsArg, variantCountArg].filter(Boolean);
  if (activeVariantFlags.length > 1) {
    throw new Error('Use only one of --variant-slot, --variant-slots, or --variant-count');
  }

  if (variantSlotArg) return [parseVariantSlot(variantSlotArg, '--variant-slot')];

  if (variantSlotsArg) {
    const slots = variantSlotsArg
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => parseVariantSlot(value, '--variant-slots'));
    return Array.from(new Set(slots)).sort((a, b) => a - b);
  }

  if (!variantCountArg) return [];
  const count = Number(variantCountArg);
  if (!Number.isInteger(count) || count < 1 || count > 99) {
    throw new Error('--variant-count must be an integer from 1 to 99');
  }
  return Array.from({ length: count }, (_, index) => index + 1);
}

const variantSlots = resolveVariantSlots();
const writesVariants = variantSlots.length > 0;

await mkdir(defaultsDir, { recursive: true });
if (writesVariants) await mkdir(variantDefaultsDir, { recursive: true });
await mkdir(lockDir, { recursive: true });

const packs = (await loadPacks(packFilter || undefined)).filter(
  (pack) => !packFilter || pack.id === packFilter,
);
let projectId: string | undefined;

const manifestByPack = new Map<string, Map<string, StyleDefaultManifestEntry>>();
const failuresByPack = new Map<string, unknown[]>();
const targetPresets: PendingPreset[] = [];
let attempted = 0;
let generated = 0;
let failed = 0;
let skipped = 0;
let cursor = 0;

for (const pack of packs) {
  const manifestEntries = await loadManifest(pack.id);
  manifestByPack.set(pack.id, new Map(manifestEntries.map((entry) => [entry.presetId, entry])));
  failuresByPack.set(pack.id, await loadFailures(pack.id));
}

const resolvedPresetFilters = retryFailures
  ? collectLatestFailedPresetIds(failuresByPack, {
      packFilter,
      categoryFilters,
      presetFilters,
      limit: failureLimit,
    })
  : presetFilters;
const effectiveForce = force || retryFailures;

if (retryFailures) {
  console.log(
    `[retry-failures] selected=${resolvedPresetFilters.size} pack=${packFilter || 'all'} limit=${
      Number.isFinite(failureLimit) ? failureLimit : 'all'
    }`,
  );
}

const existingDefaultFiles = new Set<string>();
function variantDestinationForPreset(presetId: string, slot: number) {
  return path.join(
    variantDefaultsDir,
    `${presetId}-${String(slot).padStart(2, '0')}${RECIPE_ASSET_EXTENSION}`,
  );
}

for (const pack of packs) {
  for (const preset of pack.presets) {
    const category = sanitizeCategory(preset.category);
    const destination = path.join(defaultsDir, `${preset.id}${RECIPE_ASSET_EXTENSION}`);

    if (resolvedPresetFilters.size > 0 && !resolvedPresetFilters.has(preset.id)) {
      existingDefaultFiles.add(destination);
      skipped += 1;
      continue;
    }

    if (categoryFilters.size > 0 && !categoryFilters.has(category)) {
      continue;
    }

    if (!writesVariants && !effectiveForce && (await exists(destination))) {
      existingDefaultFiles.add(destination);
      skipped += 1;
    }
  }
}

const plannedTargets = createStyleDefaultTargets({
  packs,
  existingFiles: existingDefaultFiles,
  force: effectiveForce,
  categoryFilters,
  presetFilters: resolvedPresetFilters,
  limit,
  defaultsDir,
  assetExtension: RECIPE_ASSET_EXTENSION,
});

for (const target of plannedTargets) {
  if (!writesVariants) {
    targetPresets.push(target);
    continue;
  }

  for (const variantSlot of variantSlots) {
    const destination = variantDestinationForPreset(target.preset.id, variantSlot);
    if (!effectiveForce && (await exists(destination))) {
      skipped += 1;
      continue;
    }
    targetPresets.push({ ...target, destination, variantSlot });
  }
}

if (auditStyleScope) {
  const issues = auditStyleScopeTargets(targetPresets, sessionSuffix);
  console.log(
    `[style-scope-audit] targets=${targetPresets.length} issues=${issues.length} packs=${
      packs.map((pack) => pack.id).join(',') || 'none'
    }`,
  );
  for (const issue of issues) console.error(`[style-scope-audit] ${issue}`);
  process.exit(issues.length > 0 ? 1 : 0);
}

if (printPrompts) {
  for (const target of targetPresets) {
    const slot = target.variantSlot
      ? ` variant-${String(target.variantSlot).padStart(2, '0')}`
      : ' primary';
    console.log(`\n--- ${target.preset.id}${slot} ${target.pack.name} / ${target.category} ---\n`);
    console.log(buildStylePrompt(target.pack, target.preset, 1, sessionSuffix, target.variantSlot));
  }
  console.log(
    `[dry-run] prompts=${targetPresets.length} skipped=${skipped} packs=${
      packs.map((pack) => pack.id).join(',') || 'none'
    }`,
  );
  process.exit(0);
}

const health = await request<{ ok: boolean }>('/api/health');
if (!health.ok) throw new Error('Local studio server is not healthy.');

const projects = await request<Project[]>('/api/projects');
projectId = projects[0]?.id;

async function processPreset(target: PendingPreset) {
  const { pack, preset, category, destination, variantSlot } = target;
  const manifestByPreset = manifestByPack.get(pack.id);
  if (!manifestByPreset) throw new Error(`Missing manifest map for pack ${pack.id}`);

  const variantLabel = variantSlot ? ` / variant-${String(variantSlot).padStart(2, '0')}` : '';
  console.log(`[txt2img] ${preset.id}${variantLabel} ${pack.name} / ${category} / ${preset.name}`);
  let lastError: string | null = null;

  for (let attempt = 1; attempt <= IMAGE_RETRY_ATTEMPTS + 1; attempt += 1) {
    try {
      if (attempt > 1) {
        console.log(
          `[txt2img-retry] ${preset.id} ${pack.name} / ${category} / ${preset.name} (${attempt}/${IMAGE_RETRY_ATTEMPTS + 1})`,
        );
      }

      const created = await request<Job>('/api/jobs', {
        method: 'POST',
        body: JSON.stringify(
          createStyleDefaultJobRequest({
            projectId,
            prompt: buildStylePrompt(pack, preset, attempt, sessionSuffix, variantSlot),
          }),
        ),
      });

      await waitForJob(created.id);
      const asset = await newestAssetForJob(created.id);
      if (!asset) throw new Error(`Completed job ${created.id} has no asset in /api/assets`);

      await writeRepoWebpAsset(asset.filePath, destination);
      await cleanupExternalJobArtifacts(created.id, asset.filePath);
      const repoFile = repoRelative(destination);
      if (!variantSlot) {
        manifestByPreset.set(
          preset.id,
          createStyleDefaultManifestEntry({
            pack,
            preset,
            category,
            file: repoFile,
            jobId: created.id,
            sourceAsset: repoFile,
            model: IMAGEGEN_MODEL,
            reasoningEffort: IMAGEGEN_REASONING_EFFORT,
            generatedAt: new Date().toISOString(),
          }),
        );
        await saveManifest(pack.id, Array.from(manifestByPreset.values()));
      }
      generated += 1;
      lastError = null;
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      lastError = message;

      if (!message.includes('status needs_review') || attempt > IMAGE_RETRY_ATTEMPTS) {
        break;
      }

      console.warn(
        `[txt2img-retry-needed] ${preset.id} ${pack.name} / ${category} / ${preset.name}: ${message}`,
      );
      await sleepWithEffect(RETRY_RETRY_DELAY_MS);
    }
  }

  failed += 1;
  console.error(
    `[txt2img-failed] ${preset.id} ${pack.name} / ${category} / ${preset.name}: ${lastError}`,
  );
  const failures = failuresByPack.get(pack.id);
  if (Array.isArray(failures)) {
    failures.push(
      createStyleDefaultFailureEntry({
        pack,
        preset,
        category,
        error: lastError || 'unknown',
        failedAt: new Date().toISOString(),
      }),
    );
    await saveFailures(pack.id, failures);
  }
}

async function worker() {
  while (cursor < targetPresets.length) {
    const target = targetPresets[cursor];
    cursor += 1;
    attempted += 1;
    await processPreset(target);
  }
}

await Promise.all(
  Array.from({ length: Math.min(parallel, targetPresets.length || 1) }, () => worker()),
);

for (const [packId, manifest] of manifestByPack) {
  if (manifest.size > 0) await saveManifest(packId, Array.from(manifest.values()));
}

for (const [packId, failures] of failuresByPack) {
  await saveFailures(packId, failures);
}

console.log(
  `[done] generated=${generated} attempted=${attempted} skipped=${skipped} failed=${failed} packs=${packs.map((pack) => pack.id).join(',') || 'none'}`,
);
