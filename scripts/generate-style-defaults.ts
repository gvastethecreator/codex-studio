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
  appendImagegenDenoiseDirective,
  defaultCodexHome,
  defaultStudioLibraryDir,
  defaultsDir,
  loadPacks,
  repoRelative,
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

  pack_06__traditional_painting:
    'A finished traditional painting scene with one original subject, studio-like composition, visible brushwork-ready surfaces, fabric, background depth, and lighting suited to classic painted media.',
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
  pack_07__architectural_styles:
    'An architectural portfolio image of one building or interior volume with structural lines, facade or spatial rhythm, material detail, scale cues, sky or landscape context, and clean vertical framing.',
  pack_07__environment:
    'A cinematic built environment with architecture, streetscape or interior-exterior transition, atmospheric light, readable scale, layered depth, materials, and a single compositional focal point.',
  pack_07__landscape_architecture:
    'A designed outdoor landscape with paths, planting, water or stone, seating or human-scale cues, architectural edge, layered vegetation, and controlled natural light.',
  pack_07__fantasy_architecture:
    'A fantasy architectural scene with one impossible building or interior, stairs, arches, towers or chambers, magical light, scale cues, atmospheric depth, and original worldbuilding.',

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
    'A close-up material study of one natural surface as the hero subject, with secondary scale cues, tactile relief, color variation, grazing light, and macro detail.',
  pack_09__man_made_materials:
    'A close-up studio material study of one manufactured surface or object, with clean edges, fabrication marks, reflections, wear, and controlled lighting.',
  pack_09__weathering_and_decay:
    'A close-up scene of aged material with corrosion, peeling, cracks, stains, residue, dust, and layered history under directional light.',
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
    'An original game key art scene set in a dense night-city district with one hero encounter, neon spill, tactical motion lanes, wet surfaces, and a strong playable-world identity.',
  pack_12__arcane_temples_and_mythic_realms:
    'An original fantasy game scene with sacred architecture, ritual objects, mythic atmosphere, and one central confrontation or discovery beat inside a storied realm.',
  pack_12__sci_fi_frontiers_and_mech_zones:
    'An original sci-fi game scene with mechanical scale, frontier infrastructure, advanced systems, and one clear exploration, breach, or contact moment.',
  pack_12__sieges_warfronts_and_last_stands:
    'An original warfront or defense scenario with fortified space, opposing pressure, readable battle lines, and a decisive hold-the-line or breakthrough focal point.',
  pack_12__speed_sport_and_competitive_arenas:
    'An original competitive game scene with velocity, spectacle, rules-of-play cues, and one central matchup, race line, duel lane, or arena climax.',
  pack_12__wilderness_hunts_and_harsh_frontiers:
    'An original frontier game scene with dangerous terrain, survival pressure, creature or weather threat, and a strong expedition or hunt read.',
  pack_12__heists_horror_and_underworld_runs:
    'An original infiltration or horror-action scene with shadow logic, illicit routes, lurking danger, and one clear underworld, stealth, or panic-inducing objective beat.',
  pack_12__puzzle_chambers_and_adventure_setpieces:
    'An original adventure setpiece with puzzle logic, hub-like worldbuilding, or endgame staging, built around one strong progression beat rather than generic combat clutter.',
};

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
    'Stage the subject inside a polished artist-workstation vignette with layered display panes, a lit desk surface, collectible props, and a strong focal object that feels made for digital painting.',
    'Use a stylized dev-studio corner with floating screen glow, drawing tablet reflections, and a clean object pedestal built into the desk.',
    'Set the subject in a concept-art pinup space with taped references, paint mess, display glare, and one central rendered focal object.',
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
  pack_06__retro_game_visual_systems: [
    'Use an old-console vignette with CRT bloom, limited palette logic, chunky silhouettes, and one display constraint that dominates the read.',
    'Stage the subject inside a retro game screen-space setup with tiled ground, pixel edge discipline, and unmistakable hardware-era texture.',
    'Build the frame around a nostalgia-heavy computer or console display world with scanlines, sprite layering, and one iconic era-specific focal cue.',
  ],
  pack_06__game_art_directions_and_ui: [
    'Use a studio-like key-art setup with one playable hero asset, secondary UI framing, icon clusters, and production-ready focal hierarchy.',
    'Stage the image as a modern game presentation board with a strong hero subject, supporting interface motifs, and one unmistakable gameplay read.',
    'Build the composition around a polished in-engine-meets-marketing moment with collectible props, world map cues, and readable UI-adjacent framing.',
  ],
  pack_12__neon_urban_and_night_ops: [
    'Use a rain-slick district, transit deck, or rooftop lane with dense signage glow, tactical sightlines, and one unmistakable urban objective.',
    'Stage the scene in a midnight city corridor with wet pavement, hard neon color separation, layered infrastructure, and a stealth-or-chase beat.',
    'Build the frame around a dense downtown choke point with cables, reflections, alley depth, and one hero-versus-system encounter.',
  ],
  pack_12__arcane_temples_and_mythic_realms: [
    'Use a shrine court, ritual hall, monastery bridge, or palace interior with sacred geometry, relic props, and one mythic confrontation axis.',
    'Stage the scene inside an ancient ceremonial space with banners, carved stone, ritual light, and a single magical focal object.',
    'Build the frame around legendary architecture, symbolic weather, and a discovery-or-duel beat that feels rooted in old world myth.',
  ],
  pack_12__sci_fi_frontiers_and_mech_zones: [
    'Use a breach corridor, orbital platform, mech convoy lane, or research habitat with machine scale, warning light, and a central systems event.',
    'Stage the image in a frontier-tech zone with armored surfaces, exposed conduits, and one exploration or combat beat around advanced hardware.',
    'Build the scene around future industry, colony infrastructure, or mechanized mobility with readable function and a strong sci-fi silhouette.',
  ],
  pack_12__sieges_warfronts_and_last_stands: [
    'Use a fortress edge, bridge hold, defense rail, or bastion breach with clear frontlines, layered pressure, and one pivotal holdout beat.',
    'Stage the scene at the exact moment a wall, bridge, or convoy line is about to break, with readable opposing force geometry.',
    'Build the frame around a fortified battlefield where position, attrition, and last-stand drama are visible at a glance.',
  ],
  pack_12__speed_sport_and_competitive_arenas: [
    'Use a racetrack, duel hall, rhythm stage, or arena lane with obvious rule-space, velocity paths, and one competition-defining focal moment.',
    'Stage the image around a polished match environment with audience depth, lane markers, and a clean rivalry read.',
    'Build the frame as a high-spectacle contest image with momentum arcs, score-space energy, and one central clash or finish line.',
  ],
  pack_12__wilderness_hunts_and_harsh_frontiers: [
    'Use a hostile biome, mine route, frozen outpost, or thunder plain with expedition gear, environmental threat, and one hunt or survival objective.',
    'Stage the scene across frontier terrain where weather, beasts, or unstable geography are as dangerous as the enemy.',
    'Build the frame around a rugged traversal or hunting beat with layered landscape scale and one immediate danger cue.',
  ],
  pack_12__heists_horror_and_underworld_runs: [
    'Use a cursed transit line, black-market corridor, shadow court, or criminal route with hiding places, illicit props, and one panic-inducing objective.',
    'Stage the scene in a low-trust environment where stealth, dread, or criminal intent dominate the read before open combat.',
    'Build the frame around a tense underworld operation or horror breach with narrow exits, suspicious silhouettes, and a sharp danger gradient.',
  ],
  pack_12__puzzle_chambers_and_adventure_setpieces: [
    'Use a puzzle chamber, quest hub, campaign finale room, or curiosity-heavy landmark with one central progression mechanic made spatially clear.',
    'Stage the image as a handcrafted adventure setpiece with navigable props, layered clue logic, and a strong “what happens next” focal beat.',
    'Build the frame around a memorable game-world landmark that feels designed for puzzle solving, narrative payoff, or chapter-ending spectacle.',
  ],
  pack_05__modern_shonen_and_action: [
    'Use one original anime-style character or costume fragment with clean motion arcs, bold cel shading, and readable shonen momentum; avoid franchise likeness, headband-copy design, named-series cues, dominant weapons, or combat injury.',
    'Stage one original action-study pose on a simplified graphic backdrop with speed lines, cloth motion, and expressive silhouette; no schoolyard/street/stair lock, no recognizable hero design, no sword-first composition.',
    'Build the frame around optimistic movement energy, color accents, and exaggerated expression physics while keeping props secondary and non-iconic; no gang fight, battle aftermath, arena duel, or IP-like emblem.',
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
  pack_13__slice_of_life_school_music: [
    'Use a rehearsal room, classroom, club room, or small live-house corner with instruments, notes, chairs, and a quiet emotional beat.',
    'Set the scene in a sunlit school hallway or commuter stop with everyday props and a soft slice-of-life rhythm.',
    'Stage the subject in a cozy indoor scene with posters, craft items, or music gear and a clean pastel read.',
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
};

const PRESET_MOTIFS = [
  'Include one original visual token tied to the preset name, never a compass, map symbol, notebook, generic plant, or other stock prop.',
  'Include a distinct costume trim, mask mark, crest fragment, or tech detail that only fits this preset.',
  'Include one sharp prop silhouette that is specific to this preset and not a generic desk object.',
  'Include a preset-specific accent element with a non-repeating shape language.',
  'Include one custom emblem, charm, patch, shard, or accessory that reinforces the preset identity.',
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
  'Include one specific micro-detail linked to the preset tone.',
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
  anime_fantasy: [
    'An original fantasy adventurer with layered costume logic, one magical prop, and a clear quest vibe.',
    'An original mage or traveler with readable gear, elegant silhouette, and story-driven pose.',
    'An original high-fantasy lead with cloak, artifact, and a clean heroic read from card distance.',
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
  anime_fantasy: [
    'Place the subject in a magical environment with clear worldbuilding layers and one glowing focal cue.',
    'Use a fantasy setting with path, ruins, city edge, or forest depth that suggests a larger world.',
    'Build an adventure-ready backdrop with scale cues, atmosphere, and one memorable landmark element.',
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

function broadPromptFamily(pack: StyleRuntimePack, category: string) {
  const key = styleCategoryImageKey(pack.id, category);
  if (key === 'pack_05__dark_fantasy_and_seinen') return 'anime_dark_fantasy';
  if (key === 'pack_05__studio_masterpieces') return 'anime_masterpieces';
  if (key === 'pack_05__slice_of_life_and_moe') return 'anime_slice';
  if (key === 'pack_05__sports_competition_and_performance') return 'anime_sports';
  if (key === 'pack_05__isekai_and_high_fantasy') return 'anime_fantasy';
  if (key === 'pack_05__anime_style_spectrum') return 'anime_masterpieces';
  if (key === 'pack_13__slice_of_life_school_music') return 'anime_slice';
  if (key === 'pack_12__speed_sport_and_competitive_arenas') return 'anime_sports';
  if (key === 'pack_04__ink_and_print') return 'illustration_print';
  if (key === 'pack_08__fabric_and_texture_focus') return 'fashion_texture';
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
      aesthetic: 'Glowing virtual fantasy with crystalline atmosphere, polished adventure scale, soft romance, and tactile digital light',
      subject: 'Clean fantasy contours, translucent luminous arcs, modular edge highlights, and readable original silhouettes or relics',
      color: 'Sky sapphire, cyan, warm amber, emerald glow, white bloom, and deep virtual blue',
      light: 'Atmospheric depth haze, soft rim auras, crystalline light planes, and luminous edge bloom',
      texture: 'Glassy overlays, polished cel surfaces, fine particles, synthetic fabric sheen, and smooth light gradients',
      camera: 'Layered depth, suspended luminous planes, and horizon expansion that feels software-shaped',
      mood: 'Adventurous, virtual, epic, romantic',
      render: 'Expansive digital-fantasy anime polish with high clarity and clean compositing',
      features: 'Virtual glow, clean adventure polish, synthetic depth, emotional immersion',
    },
    'SP05-092': {
      aesthetic: 'Ornate reset-loop dark fantasy with beautiful repetition, cold glow, and emotional pressure',
      subject: 'Elegant fantasy contours, spiral repeats, stress-fracture accents, and tightening visual rhythms',
      color: 'Icy violet, pale silver, bruised blue, candle amber, deep burgundy, and shadowed ivory',
      light: 'Beautiful surface glow with dread beneath it, cold rim halos, and looping highlight echoes',
      texture: 'Fine fabric grain, carved ornament, paper-thin magic particles, damp shadow glaze, and polished despair',
      camera: 'Spiral compression, deja-vu repetition, and ornamental depth closing inward',
      mood: 'Anxious, tragic, harrowing, relentless',
      render: 'High-polish fantasy anime with psychological tension and controlled emotional breakdown',
      features: 'Recursive fate, spiral dread, fragile hope, ornate emotional pressure',
    },
    'SP05-093': {
      aesthetic: 'Wandering mage chronicle with patient world texture, learned magic, natural wonder, and mature travel curiosity',
      subject: 'Soft fantasy linework, practical ornament, maplike flow lines, layered detail zones, and calm exploratory rhythm',
      color: 'Weathered sky blue, warm ochre, moss green, parchment cream, mineral violet, and soft mana glow',
      light: 'Long-horizon daylight, warm ambient bounce, gentle spell glows, and atmospheric depth',
      texture: 'Parchment grain, woven cloth, weathered leather, mineral dust, soft particles, and painted terrain color',
      camera: 'Maplike expansion, slow parallax depth, and open composition that rewards looking around',
      mood: 'Curious, expansive, wondrous, immersive',
      render: 'Expansive but intimate fantasy anime polish with rich cultural texture',
      features: 'Learned magic, lived-in texture, soft horizon depth, world curiosity',
    },
    'SP05-094': {
      aesthetic: 'Bright party-quest comedy with parody fantasy, theatrical mishap timing, and joyful failure',
      subject: 'Bouncy contours, exaggerated reaction shapes, clean fantasy trims, and elastic timing accents',
      color: 'Aqua blue, sunny gold, rosy blush, carnival green, comic violet, and warm amber notes',
      light: 'Cheerful high-key glow, sudden gag flashes, soft magical bloom, and clean readable contrast',
      texture: 'Polished cel surfaces, fluffy effect puffs, glossy magical sparks, and bright comedic overlays',
      camera: 'Small perspective exaggerations, reaction zooms, and anticlimax framing',
      mood: 'Comedic, chaotic, irreverent, satirical',
      render: 'Clean comedy-fantasy anime finish with expressive timing and controlled chaos',
      features: 'Parody brightness, elastic failure, gag-timed magic, cheerful disorder',
    },
    'SP05-095': {
      aesthetic: 'Afterquest melancholy fantasy with quiet post-heroic light, long memory, restrained spellcraft, and time-softened grief',
      subject: 'Gentle contours, delicate trim, small gesture emphasis, wide breathing spaces, and low-conflict silhouettes',
      color: 'Pale sky blue, sage green, soft wheat gold, faded violet, pearl white, and warm memory amber',
      light: 'Diffuse morning light, slow rim glow, transparent magical motes, and subtle shifts that make time visible',
      texture: 'Soft cloth grain, weathered parchment, grasslike brush texture, translucent particles, and watercolor cel softness',
      camera: 'Open breathing room, postcard stillness, and time-depth layering through light',
      mood: 'Reflective, serene, melancholic, timeless',
      render: 'Serene fantasy anime finish with high restraint and lyrical clarity',
      features: 'Post-heroic quiet, memory light, soft horizon, gentle spellcraft',
    },
    'SP05-096': {
      aesthetic: 'Hyper-saturated strategy fantasy with candy-neon logic, theatrical confidence, impossible geometry, and rule-like space',
      subject: 'Crisp decorative contours, grid-aware diagonals, playful scale shifts, geometric overlays, and theatrical rhythm',
      color: 'Electric magenta, cyan candy, saturated violet, acid yellow, luminous peach, and impossible sky blue',
      light: 'Overbright neon wash, prismatic rim bands, luminous grid bounce, and deliberate bloom',
      texture: 'Glossy cel polish, glassy surfaces, holographic gradients, candy plastic sheen, and sharp geometric overlays',
      camera: 'Boardlike planes, impossible perspective folds, floating rule geometry, and controlled elasticity',
      mood: 'Strategic, dazzling, hyper, confident',
      render: 'Ultra-clean anime finish with maximal saturation, strategic clarity, and surreal confidence',
      features: 'Candy-neon grids, rule-logic spectacle, overconfident saturation, geometric theater',
    },
    'SP05-121': {
      aesthetic: 'Lantern elemental motion with patterned tenderness, breathlike luminous arcs, and elegant tragedy',
      subject: 'Razor-clean contours, ribboned motion trails, patterned shape blocks, ceremonial pauses, and flow lines',
      color: 'Lantern amber, winter blue, deep crimson accents, charcoal black, snow white, and vivid elemental tones',
      light: 'Warm lantern glow against cold mist, precise rim cuts, soft memory bloom, and arc highlights',
      texture: 'Woven pattern grain, ink-wash mist, polished cel edges, snowlike particles, and luminous trails',
      camera: 'Curved motion space, expanded depth, and choreographic foreshortening that frames motion as dance',
      mood: 'Heroic, tragic, elegant, intense',
      render: 'Premium modern anime action polish with ornamental clarity and emotional pauses',
      features: 'Breathlike arcs, patterned emotion, lantern warmth, winter contrast, choreographic motion',
    },
    'SP05-122': {
      aesthetic: 'Grimy contract-panic action with industrial fatigue, deadpan panic, and jagged absurdity',
      subject: 'Jagged contours, broken impact strokes, exhausted rhythm, industrial diagonals, and unstable comic timing',
      color: 'Grease black, muted red, sickly yellow, concrete gray, rust orange, and harsh fluorescent green',
      light: 'Hard fluorescent glare, dirty rim light, overcast industrial bounce, and bleak shadow compression',
      texture: 'Grease, concrete dust, rust, torn paper, hard cel edges, and worn industrial surfaces',
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
  if (PACK_01_TRANSFERABLE_PRESET_IDS.has(preset.id)) {
    return 'Use one transferable photographic cue in lighting, color, surface response, framing, texture, or background geometry; do not literalize the preset title as the subject, scene, or person.';
  }
  if (isPack02CartoonMediaPreset(pack, preset)) {
    return 'Use one preset-specific cartoon media cue in line shape, proportion, paper texture, color fill, collage edge, or animation surface, plus one simple original graphic anchor when useful; do not force an adult model, realistic body, camera prop, or literal title scene.';
  }
  if (isPack02NonPortraitLightingPreset(pack, preset)) {
    return 'Use one preset-specific optical cue on architectural planes, glass, fabric, metal, water, haze, or shadow geometry; do not use a human model, portrait, chair, curtain, or studio-session setup.';
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
    return 'Use infographic-like hierarchy as abstract chart primitives, icons, modular blocks, and flow shapes around one readable subject; no readable labels, numbers, dashboard UI, arrows with text, or explainer page screenshot.';
  }
  if (preset.id === 'SP04-057') {
    return 'Use blueprint schematic grammar as white technical linework, orthographic fragments, grid, and exploded-view shapes around one simple object or structure; no readable labels, numbers, title blocks, fantasy character, weapon hero, or shaded 3D render.';
  }
  if (preset.id === 'SP04-058') {
    return 'Use low-poly constraint through faceted geometry, vertex-color ramps, hard silhouettes, and affine texture cues on one simple object, creature, or environment module; no epic fantasy hero, weapon pose, smooth high-res realism, or cinematic landscape.';
  }
  if (preset.id === 'SP04-059') {
    return 'Use HUD grammar as translucent reticles, modular frames, icon-like widgets, and cyan-orange vector hierarchy around one abstract subject; no readable UI text, numbers, map labels, helmet, gun sight, mission screen, or dashboard screenshot.';
  }
  if (preset.id === 'SP04-060') {
    return 'Use weapon-design language as component hierarchy, side-profile silhouettes, ergonomic arcs, material wear, and exploded mechanical fragments; avoid a literal gun/blade as the only subject, combat scene, armory wall, fantasy sword hero, or weapon held by a character.';
  }
  if (preset.id === 'SP04-061') {
    return 'Use linocut relief-print grammar with chunky carved marks, heavy black masses, gouge channels, and one simple emblematic object or landscape fragment; no readable text, poster title, workshop scene, portrait, animal mascot, fantasy hero, or fine-detail hatching.';
  }
  if (preset.id === 'SP04-062') {
    return 'Use etching grammar with dense crosshatch, burin-like incision, archival paper, and one simple architectural/object fragment; no banknote, seal, map label, readable document text, portrait bust, fantasy hero, or smooth shaded render.';
  }
  if (preset.id === 'SP04-063') {
    return 'Use ukiyo-e woodblock grammar through carved contour rhythm, bokashi gradients, flat perspective, and indigo restraint on one original scene fragment; no named masterwork imitation, seal signature, readable calligraphy, portrait actor, wave-only cliche, or 3D realism.';
  }
  if (preset.id === 'SP04-064') {
    return 'Use stipple dotwork through dot-density value, point clusters, and stroke-less monochrome form on one simple object or abstract subject; no tattoo skin, portrait, animal head, fantasy hero, continuous line drawing, or solid filled shapes.';
  }
  if (preset.id === 'SP04-065') {
    return 'Use lithograph grammar through grease-crayon grain, stone-soft tonal fields, waxy pressure marks, and one simple object or landscape fragment; no print studio, portrait, artist figure, poster layout, readable text, or sharp vector linework.';
  }
  if (preset.id === 'SP04-066') {
    return 'Use screenprint grammar with flat color separations, mesh texture, halftone rosettes, and offset layers on one simple graphic anchor; no celebrity, product/can, readable poster title, repeat-grid sheet, fantasy hero, or painterly gradients.';
  }
  if (preset.id === 'SP04-067') {
    return 'Use monotype grammar with one-pass ink transfer, ghost edges, smudged plate pressure, and non-repeatable ink movement on one simple subject; no print studio, artist portrait, clean repeat pattern, readable text, or polished fantasy scene.';
  }
  if (preset.id === 'SP04-068') {
    return 'Use cyanotype grammar through Prussian-blue wash, UV-contact silhouettes, soft exposure falloff, and coated-paper grain on one simple object cluster or abstract form; no botanicals-only cliche, science props, Victorian scene, portrait, readable notes, red, or yellow.';
  }
  if (preset.id === 'SP04-069') {
    return 'Use rubber-stamp grammar through broken thick contours, frame pressure gaps, ink starvation, and red-black stamp-pad economy on one simple emblematic object or creature silhouette; no readable document, official seal text, office desk, paperwork, bureaucracy scene, passport, signature, or perfect vector stamp.';
  }
  if (preset.id === 'SP04-070') {
    return 'Use mezzotint grammar through velvet black matrix, burnished highlight recovery, rocker-tooth softness, and smooth chiaroscuro on one simple object, mask-like form, or creature fragment; no museum wall, portrait bust, gothic room, candlelit scene, night landscape, or line-art dominance.';
  }
  if (preset.id === 'SP04-071') {
    return 'Use aquatint grammar through rosin-grain gradients, acid-bitten porous tone, soft shadow pools, and wash-like plate atmosphere on one simple structure or object fragment; no gothic castle, ruins, haunted hallway, literal landscape, portrait, or sharp etched-line dominance.';
  }
  if (preset.id === 'SP04-072') {
    return 'Use ballpoint pen grammar through blue pressure lines, cumulative hatching, ink clots, paper indent drag, and margin rhythm on one simple creature, object, or diagram-like form; no notebook page as main subject, study desk, classroom, readable notes, ballpoint pen prop, hand holding pen, or ultra-dense microdetail noise.';
  }
  if (preset.id === 'SP04-073') {
    return 'Use fountain-pen grammar through hairline-to-broad flex strokes, tapered entry marks, wet-ink pooling, and vellum warmth on one simple creature, object, or ornamental form; no readable writing, manuscript page, signature, letter, desk, fountain pen prop, or hand writing.';
  }
  if (preset.id === 'SP04-074') {
    return 'Use permanent-marker grammar through chisel-tip masses, blunt contour turns, fiber soak, back-bleed ghosts, and black-paper contrast on one simple emblematic subject; no readable poster, graffiti tag, signage, marker pen prop, hand drawing, or ultra-fine detail.';
  }
  if (preset.id === 'SP04-075') {
    return 'Use traditional tattoo-flash grammar through bold-will-hold contour, flat primaries, pepper shading, and compact emblem logic on one original friendly creature or object; no skull/rose/dagger cliche, skin, tattoo shop, flash sheet grid, readable banner text, or adult body framing.';
  }
  if (preset.id === 'SP04-076') {
    return 'Use graffiti tag grammar as abstract aerosol gesture, overspray halos, drip rhythm, chrome-black contrast, and motion curves around one non-text subject; no readable word, name, signature, wall mural, brick alley, vandal scene, spray-can prop, or font sample.';
  }
  if (preset.id === 'SP04-077') {
    return 'Use wildstyle graffiti-piece construction as interlocking abstract letterform architecture around one non-text creature or object silhouette; no readable word, mural wall, train, street scene, artist tag, spray-can prop, or messy tag sample.';
  }
  if (preset.id === 'SP04-078') {
    return 'Use protest-stencil grammar through bridged cutouts, one-ink silhouettes, registration slips, and overspray halos on one symbolic object or creature; no readable slogan, protest crowd, political figure, wall poster, named artist imitation, or literal street scene.';
  }
  if (preset.id === 'SP04-079') {
    return 'Use blackletter calligraphic architecture as ornamental broad-nib strokes, diamond joins, and vertical compression shaping one non-text emblem or creature; no readable word, manuscript page, scroll, religious document, illuminated capital letter, or calligrapher hand.';
  }
  if (preset.id === 'SP04-080') {
    return 'Use brush-pen ink grammar through one-breath gesture arcs, dry-brush fractures, wet pooling, rice-paper bloom, and strong negative space on one simple standalone subject; no person, portrait, hands, workshop, table, print block, brayer, ink tray, calligraphy text, bamboo cliche, mountain landscape, scroll, brush prop, or hand painting.';
  }
  if (preset.id === 'SP04-081') {
    return 'Use value-thumbnail silhouette exploration as 3-value shape-read study around one subject family or creature/object variants; no famous artist imitation, readable labels, character-sheet grid, UI board, polished render, color, tiny details, or final concept art.';
  }
  if (preset.id === 'SP04-082') {
    return 'Use photobash-paintover iteration through visible cut seams, lasso shapes, photo-texture patches, paint correction strokes, and grade cohesion on one object/creature/environment fragment; no before-after layout, robot kitbash default, software UI, text labels, clean final render, or tutorial board.';
  }
  if (preset.id === 'SP04-083') {
    return 'Use loose gesture energy through sweeping action arcs, search lines, smudge trails, and graphite/charcoal force marks on one moving creature/object silhouette; no named animator imitation, animation frame sheet, anatomy classroom pose, model sheet, readable notes, or polished character render.';
  }
  if (preset.id === 'SP04-084') {
    return 'Use material texture exploration as visual swatches, surface edge tests, wear patches, macro insets, and material contrast around one simple subject; no readable labels, arrows with text, product board, UI grid, workshop table, person, or literal sample catalog.';
  }
  if (preset.id === 'SP04-085') {
    return 'Use mood color-script language through broad color keys, atmosphere bands, value blocks, and time-of-day palette progression around one simple environment or abstract scene fragment; no character close-up, hero figure, panel grid, storyboard frames, readable notes, finished render, or literal film scene.';
  }
  if (preset.id === 'SP04-086') {
    return 'Use callout-detail sheet grammar as orthographic fragments, exploded cutaways, magnified inserts, tick marks, and graphic leader lines around one object or creature detail; no readable labels, dimensions, weapons, vehicle blueprint default, UI board, product manual page, or text annotations.';
  }
  if (preset.id === 'SP04-087') {
    return 'Use silhouette iteration as black-white shape families, proportion variants, negative-space tests, and thumbnail-read forms around one creature/object archetype; no single hero pose, sword silhouette, colored render, UI grid, readable labels, or polished concept art.';
  }
  if (preset.id === 'SP04-088') {
    return 'Use rough environment-pass rendering through broad macro shapes, atmospheric recession, value blocking, and large painterly strokes on one environment fragment; no named artist imitation, character close-up, hero figure, weapon pose, finished landscape painting, tiny details, or corridor/hallway default.';
  }
  if (preset.id === 'SP04-089') {
    return 'Use creature-design iteration as biomorphic anatomy studies, skeletal ghost overlays, locomotion variants, material biology swatches, and silhouette mutations around one original non-human creature family; no named artist imitation, human figure, cute pet, recognizable animal, final render, text labels, medical diagram, or single hero monster.';
  }
  if (preset.id === 'SP04-090') {
    return 'Use prop-variant design as object-shape families, side-view variants, material swaps, exploded mini parts, and graphic callout marks around one non-weapon object system; no readable labels, weapon set, inventory UI, single hero prop, text annotations, product catalog, or floating contextless object.';
  }
  if (preset.id === 'SP04-091') {
    return 'Use architecture massing model style as foam-core/chipboard block volumes, rough-cut planes, glue seams, shadow massing, and scale cues around one abstract structure; no finished building render, interior, furniture, workshop table, human hand, realistic photo, city block, or tiny text.';
  }
  if (preset.id === 'SP04-092') {
    return 'Use costume exploration board as textile swatches, silhouette fragments, trim systems, colorway strips, and material contrast around one abstract costume language; no full posed model, fashion catalog, readable labels, body-first portrait, lingerie read, single outfit final, or runway scene.';
  }
  if (preset.id === 'SP04-093') {
    return 'Use lighting scenario pass as same-form relighting studies, rim/bounce variants, shadow temperature shifts, exposure bands, and atmospheric value planning around one simple object or environment fragment; no character focus, hero pose, panel text, story frames, UI grid, or single finished scene.';
  }
  if (preset.id === 'SP04-094') {
    return 'Use anatomy reference sheet grammar as layered skeletal-like scaffolds, tendon/muscle-flow analogues, cutaways, transparent overlays, and inset structural details around one non-human creature/object system; no named artist imitation, human medical plate, gore, readable labels, classroom page, or realistic cadaver anatomy.';
  }
  if (preset.id === 'SP04-095') {
    return 'Use foliage design kit grammar as leaf-shape families, branching rhythms, canopy clusters, texture swatches, seasonal color strips, and growth-pattern variants; no named studio imitation, literal forest scene, garden path, house, market plant display, readable labels, or single finished landscape.';
  }
  if (preset.id === 'SP04-096') {
    return 'Use equipment-tier progression as non-weapon object evolution, modular silhouette escalation, material rarity changes, ornament deltas, and comparison rows; no literal gun, blade, combat weapon, inventory UI, readable labels, violent pose, held weapon, or single final artifact.';
  }
  if (preset.id === 'SP04-097') {
    return 'Use composition thumbnail grid grammar as rough grayscale value thumbnails, crop tests, focal hierarchy, lens-like framing, and shot-size alternatives around one abstract object/environment idea; no named director imitation, readable notes, full storyboard sequence, character acting scene, UI, labels, or polished render.';
  }
  if (preset.id === 'SP04-098') {
    return 'Use world-map concept as abstract cartographic plate: parchment, contour coastlines, rhumb-line geometry, terrain icons, route marks, cartouche shapes, and aged ink; no readable labels, compass hero prop, fantasy novel map cliche, political borders, modern map UI, city names, or text.';
  }
  if (preset.id === 'SP04-099') {
    return 'Use UI/HUD wireframe concept as abstract interface architecture: safe-zone frames, modular panels, reticle placeholders, stat-block boxes, scanline grids, and hierarchy guides; no readable UI text, numbers, screenshot, game scene, weapon targeting, dashboard app, logo, or polished final UI.';
  }
  if (preset.id === 'SP04-100') {
    return 'Use monster size comparison chart as clean baseline-aligned silhouette scale study with abstract creature forms, tick-like marks, and proportional hierarchy; no readable labels, numbers, human benchmark figure, city skyline, single creature, realistic monster portrait, or infographic text.';
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
    return 'Use an original ornamental fantasy-action anime style-card with calligraphic elemental arcs, ceremonial cloth, luminous petals, and a cropped non-famous costume/object fragment; no visible blade, sword-first pose, named demon-hunter likeness, checker haori copy, mouth gag, blood, or combat kill.';
  }
  if (preset.id === 'SP05-032') {
    return 'Use an original urban-occult anime style-card with abstract curse geometry, pressure-field ribbons, black-cyan-violet contrast, and one invented silhouette/hand/object anchor; no school uniform copy, finger/talisman fetish prop, monster gore, named sorcerer likeness, alley fight pileup, or readable sigils.';
  }
  if (preset.id === 'SP05-033') {
    return 'Use an original chaotic punk-action anime style-card with red ink splatter as graphic paint, jagged halftone ruptures, absurd creature/object fragments, and comedic shock energy; no chainsaw head, gore, severed limbs, blood realism, named character likeness, weapon-first composition, or horror torture.';
  }
  if (preset.id === 'SP05-034') {
    return 'Use an original bright hero-academy anime style-card with emblem-like costume fragments, upbeat motion arcs, civic color blocks, and aspirational cel polish; no school uniform copy, superhero franchise likeness, green-haired hero, numbered hero suit, cape-logo copy, classroom scene, or readable badges.';
  }
  if (preset.id === 'SP05-035') {
    return 'Use an original vertical-survival anime style-card with tether geometry, wind shear, wall-scale depth, and cropped gear/boot/cable fragments; no giant humanoid, titan likeness, blood, eaten-body implication, military insignia, named corps outfit, rooftop gore, or despair portrait.';
  }
  if (preset.id === 'SP05-036') {
    return 'Use an original colossal-war-drama anime style-card with severe silhouette hierarchy, ruined-mechanized scale, smoke planes, and mournful institutional geometry; no real-world uniforms, fascist insignia, giant humanoids, battlefield gore, guns foreground, named franchise likeness, or propaganda poster text.';
  }
  if (preset.id === 'SP05-037') {
    return 'Use an original impact-frame comedy anime style-card with deadpan stillness, blank reaction geometry, dust-cloud rings, shattered abstract debris, and satirical overpowered energy; no bald caped hero likeness, yellow suit, red gloves, punch contact, gore, destroyed city panorama, or franchise face.';
  }
  if (preset.id === 'SP05-038') {
    return 'Use an original psychedelic psychic minimalism anime style-card with rough sketch aura, pastel emotional rupture, simple school-age silhouette abstraction, and warped pop shapes; no bowl-cut psychic boy likeness, school uniform copy, city-destruction scene, readable symbols, gore, or franchise face.';
  }
  if (preset.id === 'SP05-039') {
    return 'Use an original tactical-adventure shonen style-card with diagrammatic motion vectors, ability-network motifs, discovery-map energy as abstract shapes, and one invented costume/object anchor; no hunter-license copy, card-game UI, readable labels, fishing-rod hero prop, green outfit copy, or franchise team likeness.';
  }
  if (preset.id === 'SP05-040') {
    return 'Use an original mythic urban-fantasy style-card with ceremonial opposition, repeated luminous emblems, reality-fold ribbons, and symbolic field geometry; no sword field, blade rain, red-cloaked archer likeness, servant duel, holy-grail iconography, weapon-first composition, or franchise face.';
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
    return 'Use an original luminous ascent fantasy style-card with warm crystal well, vertical mineral depth, hopeful glow, and mythic smallness; no dungeon corridor, lantern prop, adventurer, goddess/canon costume, monster, weapon, or hallway perspective.';
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
  if (preset.id === 'SP03-028') {
    return 'Use one freeform class-A CAD test surface or flowing curvature sculpture with zebra reflection bands and G2 continuity; no chair, seat, furniture, vehicle, showroom, lab room, circular wall light, studio setup, product pedestal, or interior scene.';
  }
  if (preset.id === 'SP03-029') {
    return 'Use one readable Mandelbulb/fractal creature bust or sculptural hero form with self-similar ridges at broad thumbnail scale; no cave, cathedral, corridor, fantasy hall, landscape fly-through, UI grid, or empty abstract-only field.';
  }
  if (preset.id === 'SP03-030') {
    return 'Use one corrupted 3D character bust, creature fragment, or mesh hero form with vertex explosion, UV tearing, and chromatic data-mosh seams; no camera, phone, monitor, screen, console, generic prop, UI, text, or device silhouette.';
  }
  if (preset.id === 'SP03-031') {
    return 'Use one simple organic/material hero subject showing soft bounced color, ambient occlusion, contact shadows, and indirect fill; no lamp, studio light, showroom, staged room, chair, curtain, plant, vase, pool, spa interior, window-wall formula, or direct-flash setup.';
  }
  if (preset.id === 'SP03-032') {
    return 'Use one single material bust or abstract hero object in a neutral volumetric lookdev test space with sculpted light shafts and layered air density; no cathedral, forest, cave, cavern, corridor, fantasy hall, shrine, orb prop, alien warrior, fantasy landscape, battlefield, sun-disk sky, secondary creature, window-beam formula, lamp, smoke machine, or empty fog-only landscape.';
  }
  if (preset.id === 'SP03-033') {
    return 'Use one original cyberpunk material bust or hero object with wet neon reflections, magenta/cyan emissive haze, and rain-slick shader evidence; no literal street, alley, city corridor, readable sign, kanji, storefront, billboard, crowd, vehicle, camera, device, or UI.';
  }
  if (preset.id === 'SP03-034') {
    return 'Use one clean original bust, product-like hero object, or material specimen where key/fill/rim separation is visible through light behavior only; no visible softbox, lamp, stand, camera, studio room, cyclorama, backdrop roll, chair, stool, curtain, portrait-session setup, readable text, engraving, decal, logo, label, or brand-like marking.';
  }
  if (preset.id === 'SP03-035') {
    return 'Use one reflective material hero object or CG creature/object fragment integrated into a neutral HDRI light-dome/probe field with matched reflections, contact shadows, and ambient color wrap; no studio background, sunset, sun disk, canyon, mountaintop, cliffs, desert, beach, city square, street, literal room, travel landscape, vehicle, camera, or generic prop scene.';
  }
  if (preset.id === 'SP03-036') {
    return 'Use one original material bust or refractive hero form covered by caustic photon webs and prismatic light pools; no underwater scene, swimming pool, aquarium, glassware prop, lens/camera, compass-like object, literal crystal product shot, floor-wall room, or empty light pattern.';
  }
  if (preset.id === 'SP03-037') {
    return 'Use one clay-white matte sculptural bust, creature fragment, or geometry hero form in a pure ambient-occlusion review pass with grey contact shadows and crevice gradients only; no colored light, rim light, bloom, swatches, props, room, turntable UI, direct light, or decorative scene.';
  }
  if (preset.id === 'SP03-038') {
    return 'Use one dark readable bust, creature fragment, or hero object defined by crisp edge rim glow and halo separation; no visible light fixture, lamp, studio setup, corridor, weapon prop, readable text, camera, UI, front-lit portrait, contact sheet, swatch strip, reference grid, bottom tile row, or multi-frame panel layout.';
  }
  if (preset.id === 'SP03-039') {
    return 'Use one bioluminescent organic creature/object fragment with branching cyan-violet glow, spore halos, and internal phosphorescent networks; no literal forest, Pandora landscape, floating mountains, tree canopy, path, corridor, shrine, human explorer, or franchise creature.';
  }
  if (preset.id === 'SP03-040') {
    return 'Use one original cel-shaded 3D character bust or hero object with bold black outlines, flat color bands, and hard shadow edges; no recognizable game/anime franchise, sword pose, UI, speech bubble, readable text, logo, screen capture, or realistic gradient rendering.';
  }
  if (preset.id === 'SP03-041') {
    return 'Use one clean material hero subject, simple CG figure, or sculptural object pierced by visible volumetric light shafts in a controlled lookdev space; no cathedral, temple, ruins, fantasy hall, magic ring, glowing portal, robed mystic figure, floating platform, shrine, forest canopy, corridor, window-beam cliche, UI, text, camera, or device prop.';
  }
  if (preset.id === 'SP03-046') {
    return 'Use one game-ready PBR asset such as an original sci-fi crate, stylized tool, modular door panel, shield-like prop, creature armor plate, or environment module with albedo/roughness/metalness/normal-map evidence as physical swatches; no human bust, mannequin, portrait head, showroom, UI, screenshot, text, logo, camera, weapon-first read, or generic product render.';
  }
  if (preset.id === 'SP03-049') {
    return 'Use one original rig-ready stylized character, robot, creature, or armored mascot in neutral A-pose or T-pose against a plain grey production backdrop, with front-facing silhouette, modest production outfit/armor, simple material callouts as physical swatches, and clean turnaround-sheet clarity; no sexualized body-first design, exposed lingerie-like armor, action pose, diagonal motion, fighting stance, weapon, narrative background, arch, courtyard, ruin, fountain, statue, plant, fantasy environment, multi-character lineup, contact sheet grid, UI, text, or labels.';
  }
  if (preset.id === 'SP03-050') {
    return 'Use one kinetic abstract 3D hero form made of glossy spheres, ribbons, splines, or elastic geometry with visible motion trails and gradient energy; no logo reveal, readable text, brand mark, UI, costume trim, character bust, office/corporate scene, camera, or static product display.';
  }
  if (preset.id === 'SP03-051') {
    return 'Use one clean non-gory diagnostic cutaway of an original organ-like system, botanical/creature anatomy, or mechanical-biological specimen with translucent layers and red/blue/white coding; no readable labels, text, UI, blood, gore, realistic surgery, hospital room, full human body, or horror mood.';
  }
  if (preset.id === 'SP03-052') {
    return 'Use one aerodynamic original surface form, vehicle fragment, wheel-arch slice, grille-like module, or metallic body-contour sculpture with long studio reflection sweeps and color-shift paint; no full generic car ad, brand/logo, showroom floor, road scene, camera, readable text, driver, or dealership setup.';
  }
  if (preset.id === 'SP03-053') {
    return 'Use one original high-jewelry material specimen, faceted sculptural object, gemstone cluster, or precious-metal micro-architecture with macro caustics, dispersion, polished metal, and carat-level clarity; no ring/proposal/wedding box/hand/model/bridal scene, logo, text, camera, or generic jewelry ad.';
  }
  if (preset.id === 'SP03-054') {
    return 'Use one appetizing CGI food hero form, fruit/gel/sauce/material specimen, or stylized edible construction with droplets, steam, glossy highlights, crumb texture, and subsurface glow; no burger/fries default, character bust, face, restaurant scene, table clutter, brand packaging, logo, readable text, or rotten/gross read.';
  }
  if (preset.id === 'SP03-055') {
    return 'Use one inhabitable VR-ready scene fragment or interactive-scale environment module with wide-FOV depth, parallax layers, player-scale cues, optimized surfaces, and clear interaction distance; no headset, goggles, person wearing VR gear, UI, controller, screenshot, full generic room, corridor, fantasy hall, readable text, or camera prop.';
  }
  if (preset.id === 'SP03-056') {
    return 'Use one scientific data hero form such as protein fold, particle cloud, molecule cluster, galaxy simulation, or volumetric measurement field with false-color data and scale cues; no UI, charts, readable labels, lab room, magic/fantasy glow, character, camera, logo, or text.';
  }
  if (preset.id === 'SP03-057') {
    return 'Use one original collectible 3D avatar bust, creature head, mask, or toy-like character fragment with glossy rarity traits, neon/gold accents, clean profile-picture readability, and materialized accessories; no ape copy, franchise/IP cue, NFT marketplace UI, crypto logo, readable text, screenshot, camera, or generic portrait studio.';
  }
  if (preset.id === 'SP03-058') {
    return 'Use one bold abstract glyph sculpture, invented letterform mass, or typographic-object construction with extruded bevels, material-built strokes, readable silhouette rhythm, and brand-color energy; no readable word, alphabet chart, slogan, logo, UI, poster layout, flat text, or signage.';
  }
  if (preset.id === 'SP03-059') {
    return 'Use one digital fashion hero garment, simulated textile form, or stylized figure fragment wearing impossible iridescent fabric with real drape, weave, seams, folds, and cloth dynamics; no curtain, generic fabric backdrop, showroom, retail store, runway crowd, logo, readable text, camera, or stiff cloth.';
  }
  if (preset.id === 'SP03-060') {
    return 'Use one original environment-design scene fragment, modular kit corner, terrain slice, or worldbuilding material study with baked-GI depth, atmospheric perspective, navigable scale, and environmental-storytelling cues; no library aisle, market aisle, generic corridor, fantasy hallway, shop shelves, drone, surveillance pod, chrome orb, tarp, fabric sheet, UI, logo, readable text, or camera prop.';
  }
  if (preset.id === 'SP03-061') {
    return 'Use one original hard-surface engineering hero form, mech torso fragment, industrial module, or machined armor panel with bevel hierarchy, panel lines, service seams, scratched metal, and functional component density; no weapon, gun, missile, battlefield, soldier, military insignia, cockpit UI, camera prop, readable text, or generic vehicle ad.';
  }
  if (preset.id === 'SP03-062') {
    return 'Use one organic sculpt hero form, creature bust fragment, botanical anatomy, or growth-like material specimen with flowing topology, dynamesh mass, subsurface warmth, bark/skin texture maps, and natural rhythm; no gore, horror monster, forest scene, hard robot edges, lab specimen jar, readable text, logo, or camera prop.';
  }
  if (preset.id === 'SP03-063') {
    return 'Use one isometric 3D cartographic terrain miniature, stacked contour island, elevation-coded scene fragment, or toy-like exploration map with topographic layers, terrain shadows, and clear height readability; no flat 2D paper map, parchment, atlas page, UI minimap, readable labels, compass rose, market/library aisle, logo, or text.';
  }
  if (preset.id === 'SP03-064') {
    return 'Use one original exploded-view assembly of a creature/object/module with separated layers, invisible axes, precise spacing, cross-section surfaces, and subsystem color coding; no readable labels, arrows with text, instruction manual page, UI, contact sheet, weapon assembly, camera prop, logo, or flat diagram.';
  }
  if (preset.id === 'SP03-065') {
    return 'Use one original 3D app-icon-like hero object, squircle glass/plastic emblem, or friendly platform-icon sculpt with rounded corners, gradient polish, soft shadow, and front-facing legibility; no real app logo, brand mark, readable letter, UI screen, phone mockup, app store layout, flat 2D icon, camera prop, or text.';
  }
  if (preset.id === 'SP03-066') {
    return 'Use one polished abstract 3D wallpaper composition with flowing sculptural ribbons, translucent gel forms, broad gradient fields, calm ambient lighting, and strong large-shape rhythm; no character, product, room, wall/floor seam, curtain, lamp, shelf, corridor, text, logo, UI, or noisy microdetail clutter.';
  }
  if (preset.id === 'SP03-067') {
    return 'Use one clean cybernetic integration hero form, prosthetic module, chrome/skin transition fragment, or augmented hand/face/torso detail with seamless seams and LED status glows; no gore, exposed wound, surgery, horror mood, weapon, UI, readable text, camera prop, logo, or fetishized body framing.';
  }
  if (preset.id === 'SP03-068') {
    return 'Use one grounded photogrammetry scan asset, photo-textured material chunk, scanned architectural fragment, or natural surface specimen with baked de-lit color, mesh imperfections, scan noise, and real-world scale cues; no generic rock pile, tree stump, ruined wall default, outdoor trail, market/library aisle, UI, labels, logo, text, or camera prop.';
  }
  if (preset.id === 'SP03-069') {
    return 'Use one controlled Houdini-style pyro simulation hero volume, smoke plume, heat vortex, or fire/smoke material specimen with turbulent density curls, self-illumination, layered black smoke, and visible fluid dynamics; no explosion disaster scene, weapon blast, burning building, person, battlefield, skull/monster, readable text, logo, UI, or camera prop.';
  }
  if (preset.id === 'SP03-070') {
    return 'Use one original retro-90s CGI hero object, simple polygon creature/object, checkerboard material study, or awkward low-poly scene fragment with Phong shading, primary colors, and nostalgic early-render charm; no Toy Story/Reboot/franchise likeness, mascot copy, readable text, logo, UI, modern PBR realism, camera prop, or crowded room.';
  }
  if (preset.id === 'SP03-071') {
    return 'Use one tactile glassmorphism material interface sculpture with frosted translucent cards, white border layers, blurred color fields, depth stacking, and diffuse transmission; no readable UI text, app screenshot, icons, brand logo, phone mockup, web page layout, dashboard chart, camera prop, or flat opaque panel.';
  }
  if (preset.id === 'SP03-072') {
    return 'Use one friendly clay-UI material sculpture with soft rounded cards, pill forms, molded buttons, pastel matte surfaces, and warm soft shadows; no readable UI text, app screenshot, icons, brand logo, phone mockup, web page layout, dashboard chart, camera prop, pottery studio scene, or flat sharp panel.';
  }
  if (preset.id === 'SP03-073') {
    return 'Use one original papercraft 3D hero form, layered cardstock creature/object, folded architectural fragment, or cut-paper material sculpture with visible fold lines, paper grain, cut edges, warm craft shadows, and clean layered depth; no craft table, scissors, glue, hands, instruction sheet, origami crane default, readable text, logo, UI, or camera prop.';
  }
  if (preset.id === 'SP03-074') {
    return 'Use one abstract neon-tube sculpture, bent-glass creature/object outline, or non-text emissive sign-form with gas glow, transformer fittings, colored bloom, and wall-reflection ambience; no readable word, letters, logo, bar sign, brick wall default, nightclub scene, brand mark, UI, camera prop, or flat print.';
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
  return 'Prefer a representative style-card with one clear subject, figure, object, material specimen, character, or symbolic focal form when the category allows; avoid empty abstract-only cards and avoid literal stock scenes.';
}

function constraintSemantics() {
  return 'Interpret avoid/no lists as anti-repetition guidance, not absolute bans. Concrete elements such as walls, lamps, furniture, curtains, corridors, props, cameras, people, or environments may appear when they are intentional, preset-specific, and not the repeated default staging. Do not overcorrect into empty abstraction.';
}

function visualResetRule() {
  return 'If any earlier phrase sounds like abstract-only, no-scene, or no-object, reinterpret it as anti-cliche guidance. The final card still needs one readable representative subject: character, figure, object, room fragment, scene fragment, material form, or environment motif. Abstract marks support that subject; they are not the whole image.';
}

function pickVariant(list: string[], seed: string) {
  return list[Math.abs(hashString(seed)) % list.length];
}

function categoryBasePrompt(
  pack: StyleRuntimePack,
  category: string,
  seed?: string,
  preset?: StyleRuntimePreset,
) {
  const key = styleCategoryImageKey(pack.id, category);
  const base =
    preset?.id === 'SP04-080'
      ? 'A finished brush-pen ink style-card on clean absorbent paper: one standalone creature, object, or abstract material subject made from broad expressive ink strokes, dry-brush skips, wash blooms, wet pooling, and strong negative space. No studio, workshop, table, print block, plate, press, brayer, tray, person, hand, brush prop, calligraphy text, scroll, bamboo, or landscape.'
      : preset?.id === 'SP04-085'
        ? 'A mood color-script style-card made from broad palette blocks, atmosphere bands, value keys, and time-of-day color progression across one abstract environment fragment. No person, hero, character, body, face, weapon, cape, cliff pose, castle, fantasy landscape painting, panel grid, storyboard frames, text, or finished render.'
      : preset?.id === 'SP04-082'
        ? 'A photobash-paintover style-card with one non-human object, creature fragment, vehicle fragment, or environment slice built from visible collage seams, photo-texture patches, lasso-cut shapes, painted integration strokes, and unified color grade. No full character portrait, heroic pose, weapon, fantasy cliff scene, clean final illustration, before-after layout, UI, text, labels, or tutorial board.'
        : preset?.id === 'SP04-088'
          ? 'A rough environment-pass style-card focused on macro-shape blockout, atmospheric recession, large painterly strokes, value grouping, and scale mood in one environment fragment. No person, hero, character, body, cape, weapon, cliff pose, corridor, hallway, finished fantasy vista, detailed landscape painting, or tiny render detail.'
          : preset?.id === 'SP04-092'
            ? 'A costume exploration style-card focused on abstract garment language: textile swatches, sleeves, cuffs, trims, folds, color strips, silhouettes cropped as fragments, material patches, and accessory rhythm. No full posed model, face, body-first portrait, fashion catalog page, runway scene, lingerie read, readable labels, or single finished outfit.'
            : preset?.id === 'SP04-093'
              ? 'A lighting scenario style-card showing the same simple non-human object or abstract structure relit across several mood passes: rim light, bounce color, exposure bands, shadow temperature, and haze variation. No person, hero, character, face, body, cape, weapon, fantasy vista, cliff pose, single scene, readable text, or UI.'
              : preset?.id === 'SP04-096'
                ? 'An equipment-tier progression style-card showing one non-weapon equipment/object family evolving across 3-4 versions with material rarity, silhouette complexity, ornament deltas, and modular upgrades. No blade, gun, combat weapon, held item, arm/hand, inventory UI, readable labels, single artifact, or violent object.'
                : preset?.id === 'SP04-097'
                  ? 'A composition thumbnail grid style-card made of rough grayscale value blocks and crop studies for one abstract scene or object idea. Multiple mini compositions with framing rectangles, focal masses, perspective alternates, and value grouping only. No brayer, roller, printmaking tool, hand, person, readable notes, storyboard story, film scene, polished render, or single prop repeated.'
                  : preset?.id === 'SP05-021'
                    ? 'An original shonen-adventure style-card built from motion scarf ribbons, training-charms, cel-shaded fabric folds, impact arcs, and a cropped non-famous costume/hand/boot fragment rather than a face. No forehead band, metal plate, spiral mark, orange jumpsuit, ninja village, kunai, shuriken, copied hairstyle, boy hero portrait, or recognizable franchise composition.'
                  : preset?.id === 'SP05-023'
                    ? 'An original elastic-adventure style-card built from nautical color blocks, rope arcs, exaggerated glove/boot/cloth fragments, sky-blue freedom energy, and one invented emblem-like costume crop rather than a face. No straw hat, red open vest, scar under eye, pirate skull flag, named-crew likeness, ship mast hero pose, exposed torso focus, or recognizable franchise composition.'
                  : preset?.id === 'SP05-028'
                    ? 'An original lo-fi rhythm-action style-card built from beat-synced cloth arcs, ink-brush movement, turntable-like motion rings, worn paper texture, and cropped sneaker/jacket/object fragments on a flat graphic outdoor backdrop. No person face, room, interior, lamp, window, chair, table, studio, sword, katana, blade, samurai outfit, dead bodies, duel pose, highway warrior portrait, named-series likeness, or weapon-first composition.'
                  : preset?.id === 'SP05-032'
                    ? 'An original urban-occult style-card made from abstract curse-pressure geometry, gloved hand crop, jacket fragments, cyan-violet aura ribbons, concrete texture, and symbolic energy planes. No weapon, sword, blade, katana, full hero portrait, school uniform, alley fight, monster gore, readable sigil, franchise face, or corridor scene.'
                  : preset?.id === 'SP05-036'
                    ? 'An original colossal-war-drama style-card made from ruined mechanized silhouettes, smoke planes, torn banners, institutional geometry, armor fragments, and scale contrast around architecture rather than a warrior. No weapon, sword, spear, gun, full hero portrait, giant humanoid, battlefield gore, real-world uniform, fascist insignia, or propaganda poster.'
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
                    ? 'An original lush abyssal toll style-card focused on bioluminescent mineral bloom, damp relic patina, layered vertical pressure, mossy velvet darks, and beautiful unsafe depth. No explorer, cave tunnel, corridor, market, library, fantasy hallway, monster, map, lantern, lamp, rope, or expedition gear.'
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
                    ? 'An original luminous ascent fantasy style-card focused on warm crystal well, vertical mineral depth, hopeful glow, darkness shaped by amber light, and mythic smallness. No dungeon corridor, lantern prop, adventurer, goddess/canon costume, monster, weapon, hallway perspective, or readable sign.'
                  : preset?.id === 'SP05-121'
                    ? 'An original lantern-elemental motion style-card focused on patterned warmth, breathlike luminous arcs, winter-blue/amber contrast, ceremonial pause, and tenderness in motion around a non-famous original silhouette or emblem. Keep it non-graphic and non-derivative; no famous costume copy, blade-forward pose, or readable text.'
                  : preset?.id === 'SP05-122'
                    ? 'An original grimy contract-panic action style-card focused on industrial grime, fluorescent fatigue, jagged impact rhythm, broken concrete planes, and deadpan absurdity. Keep it non-graphic and non-derivative; no tool-headed character, famous uniform copy, blade-forward pose, or readable sign.'
                  : preset?.id === 'SP05-123'
                    ? 'An original ceremonial inferno action style-card focused on ember halos, sacred heat geometry, black silhouette cuts, emergency brightness, and stained-glass color as abstract light. No famous uniform copy, literal chapel interior, icon copy, injury scene, or readable insignia.'
                  : preset?.id === 'SP05-124'
                    ? 'An original predator-ego sports intensity style-card focused on electric-blue field-line abstractions, pressure zones, target-lock geometry, acid accents, and competitive focus. No named soccer character, team logo, readable numbers, stadium crowd, ball closeup, violent assault, or readable text.'
                  : preset?.id === 'SP05-125'
                    ? 'An original civic colossal-response action style-card focused on municipal hazard color, infrastructure scale markers, response-grid clarity, concrete/steel texture, and resilient order. No famous creature copy, monster face closeup, armed squad, readable signage, destruction aftermath, or logo.'
                  : preset?.id === 'SP05-126'
                    ? 'An original paranormal turbo comedy style-card focused on ghostly teal/hot pink collision, elastic reaction marks, alien-lime absurdity, speed-line warmth, and romantic recoil energy. No famous duo copy, readable glyphs, school corridor, creature attack, crude joke, or logo.'
      : preset && PACK_01_TRANSFERABLE_PRESET_IDS.has(preset.id)
      ? 'A neutral transferable photography-treatment demo with one simple subject or material arrangement, plain background planes, readable surface behavior, controlled light, and no narrative location.'
      : preset && isPack02CartoonMediaPreset(pack, preset)
        ? 'A clean cartoon-media style specimen with one simple original graphic anchor: a non-famous cartoon figure, expressive silhouette, creature/object fragment, mascot-like shape, symbolic form, or small scene cue. Keep the anchor thumbnail-readable and style-led. Avoid real person, celebrity, franchise character, camera equipment, readable text, logo, or repeated stock prop sets; rooms, walls, floors, cast shadows, corners, horizon lines, lamps, curtains, fabric, markets, libraries, hallways, or fantasy locations are allowed when they clarify this preset instead of becoming filler.'
        : preset && isPack02NonPortraitLightingPreset(pack, preset)
          ? 'A grounded non-portrait cinematic lighting study using architectural planes, glass, fabric, metal, water, haze, or shadow geometry as the subject, with no human model, chair, curtain, cyclorama, camera equipment, or studio-session setup.'
          : CATEGORY_BASE_PROMPTS[key] ||
            'A vertical scene with one clear original subject, foreground detail, midground context, background depth, varied materials, and no text.';
  return `Base: ${base}
Anchor: ${categorySceneAnchor(pack, category, seed, preset)}
Fit pack "${pack.name}" and category "${category}". Finished style-card image, not a reference sheet. Portrait 2:3, usable in a 3:4 card crop. No text, labels, logos, watermark, or UI.`;
}

function sceneGuardrails(pack: StyleRuntimePack, category: string, preset: StyleRuntimePreset) {
  const key = styleCategoryImageKey(pack.id, category);
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

function buildStylePrompt(
  pack: StyleRuntimePack,
  preset: StyleRuntimePreset,
  attempt: number,
  sessionSuffix?: string,
  variantSlot?: number,
) {
  const category = sanitizeCategory(preset.category);
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
        : valueOf(preset.style, 'rendering_and_quality', 'render_quality');
  const styleFeatures = isGuroPreset
    ? 'Distorted anatomy, organic corruption, spiral contamination motifs, shadowed transformation cues, and horror atmosphere without exposed organs or blood spray'
    : isAmanoPreset
      ? 'Elongated figures, ornamental drapery, moonlit voids, feather-light motion, gilded detail accents, and ethereal gothic fantasy poise'
      : imagegenSafeDna
        ? imagegenSafeDna.features
      : cartoonSafeDna
        ? cartoonSafeDna.features
        : valueOf(preset.style, 'key_features');
  const safeCompatibilityNote = isGuroPreset
    ? 'Keep it horror-forward but non-graphic: no exposed organs, no blood spray, no dismemberment, no explicit gore. Favor implication, distortion, shadow, and atmospheric unease.'
    : isAmanoPreset
      ? 'Keep it original and non-derivative: no recognizable franchise characters, no copyrighted costume designs, and no direct imitation of any named artist. Favor broad ethereal gothic fantasy language instead.'
      : '';
  const objectOnlyPromptOverrides: Record<string, { hero: string; environment: string; action: string }> = {
    'SP05-062': {
      hero: 'No character hero. Focal anchor is a split mask/emblem still life with fractured lacquer, membrane planes, and sealed shadow voids.',
      environment: 'Use shallow abstract darkness or simple material planes only; no ruin, cathedral, corridor, street, room, or fantasy location.',
      action: 'No action scene. Show quiet metamorphic tension through fracture, pressure, and membrane stretch.',
    },
    'SP05-065': {
      hero: 'No character hero. Focal anchor is pale threshold slabs, ash-matte planes, silver edge cuts, and moonlit negative space.',
      environment: 'Use abstract exterior void and material planes only; no doorway scene, corridor, ruin, castle, person, monster, or chase setting.',
      action: 'No action scene. Build dread through stillness, spacing, and severe silhouette geometry.',
    },
    'SP05-066': {
      hero: 'No character hero. Focal anchor is ceramic-botanical seam geometry: clean pale panels, petal fractures, and restrained crimson stress.',
      environment: 'Use clinical abstract voids or simple tabletop-like material depth only; no cathedral, garden, body, laboratory, corridor, or room.',
      action: 'No action scene. Show invasive pressure through seams, splits, and controlled organic growth.',
    },
    'SP05-067': {
      hero: 'No character hero. Focal anchor is bioluminescent mineral bloom, relic patina, and layered vertical depth.',
      environment: 'Use compressed abstract abyssal depth only; no explorer, cave tunnel, corridor, lantern, map, rope, or expedition scene.',
      action: 'No action scene. Let glow, pressure, and depth imply costly wonder.',
    },
    'SP05-068': {
      hero: 'No character hero. Focal anchor is soot, scraped enamel shards, warped circular crop interruptions, and illegible occult-industrial stains.',
      environment: 'Use smoky abstract grime field only; no alley, corridor, cathedral, mask portrait, wizard, weapon, or readable sigil wall.',
      action: 'No action scene. Make collision readable through overlapping frames, stains, and warped crop cuts.',
    },
    'SP05-069': {
      hero: 'No character hero. Focal anchor is worn stone slabs, scuffed dirty metal plates, smoky shadow wedges, and narrow practical light slices.',
      environment: 'Use abstract material arrangement only; no dungeon hallway, corridor, adventurer, enemy, torch, lamp, shield, weapon, or game board.',
      action: 'No action scene. Suggest procedural severity through ordered fragments and constrained light.',
    },
  };
  const promptOverride = objectOnlyPromptOverrides[preset.id];
  const heroLine = promptOverride
    ? promptOverride.hero
    : cartoonMediaCard
    ? `A flat representational cartoon-media specimen: ${pack02CartoonRepresentativeHeroCue(preset)}.`
    : familyVariant(HERO_VARIANTS, family, `${variantSeed}:hero`);
  const environmentLine = promptOverride
    ? promptOverride.environment
    : cartoonMediaCard
    ? 'Environment optional: use a flat graphic field by default, or a simple concrete setting if it makes this preset easier to read. Do not repeat the same wall, lamp, shelf, corridor, studio, market, library, or furniture formula across cards.'
    : familyVariant(ENVIRONMENT_VARIANTS, family, `${variantSeed}:environment`);
  const compositionLine = cartoonMediaCard
    ? 'Poster-readable composition, one simple graphic anchor plus supporting marks, generous crop-safe negative space; perspective, floor contact, cast shadow, or a simple setting can appear when they make the preset more legible.'
    : pickVariant(COMPOSITION_VARIANTS, `${variantSeed}:composition`);
  const materialLine = cartoonMediaCard
    ? 'Let paper tooth, cel paint, ink, wax, marker, collage edge, or print texture carry the style; physical props or scene objects are useful only when they are a representative cue, not filler.'
    : pickVariant(MATERIAL_VARIANTS, `${variantSeed}:material`);
  const lightingLine = cartoonMediaCard
    ? 'Prefer graphic color, paper/cel texture, and style-specific mark contrast; realistic lighting is fine only when it is a deliberate representative cue.'
    : pickVariant(LIGHT_VARIANTS, `${variantSeed}:light`);
  const detailLine = cartoonMediaCard
    ? 'Details must be broad style marks and readable from thumbnail size; avoid tiny noisy micro-detail, repeated props, signs, labels, or stock room clutter.'
    : pickVariant(DETAIL_VARIANTS, `${variantSeed}:detail`);
  const feelingLine = cartoonMediaCard
    ? 'Mood comes from line rhythm, deformation, crude pressure, color clash, texture, and anchor silhouette, not from a literal scene, celebrity likeness, prop, or known character.'
    : pickVariant(FEELING_VARIANTS, `${variantSeed}:feeling`);
  const cameraFocusLine = cartoonMediaCard
    ? 'No camera logic: prioritize silhouette, line behavior, and texture rhythm as a flat graphic card.'
    : pickVariant(CAMERA_FOCUS_VARIANTS, `${variantSeed}:focus`);
  const actionLine = promptOverride
    ? promptOverride.action
    : cartoonMediaCard
    ? 'No action scene: imply motion through anchor deformation, smear marks, elastic curves, repeated lines, or scribble pressure.'
    : pickVariant(ACTION_VARIANTS, `${variantSeed}:action`);

  if (imagegenSafeDna) {
    return appendImagegenDenoiseDirective(`Generate one portrait default style-card image.
TARGET STYLE: ${safeImagegenLabel.replace(/\bANIME\b/g, 'ILLUSTRATED').replace(/\bACTION\b/g, 'MOTION')}
MODE: text-to-image
MODEL: ${IMAGEGEN_MODEL}, ${IMAGEGEN_REASONING_EFFORT}

Create an original, clean, text-free illustrated style-card. Use one readable representative anchor: emblem, relic, material specimen, light motif, or environment fragment. Keep it non-graphic, non-derivative, polished, card-readable, and distinct from neighboring presets.

STYLE DNA: aesthetic=${styleAesthetic}; color=${styleColor}; light=${styleLighting}; texture=${styleTexture}; composition=${styleCamera}; features=${styleFeatures}.

COMPOSITION: Central readable anchor with offset secondary planes and crop-safe negative space.
MATERIAL: ${materialLine}
LIGHTING: ${lightingLine}
DETAIL: ${detailLine}
COLOR SEPARATION: ${pickVariant(COLOR_SEPARATION_VARIANTS, `${variantSeed}:color`)}

Output only image, 1024x1536 portrait. No text, labels, logos, watermark.`);
  }

  return appendImagegenDenoiseDirective(`Generate one portrait default style-card image.
TARGET STYLE: ${targetStyleLabel}
PACK: ${pack.name}
CATEGORY: ${category}
${sessionKey ? `SESSION: ${sessionKey}\n` : ''}MODE: text-to-image
MODEL: ${IMAGEGEN_MODEL}, ${IMAGEGEN_REASONING_EFFORT}

${categoryBasePrompt(pack, category, `${variantSeed}:anchor`, preset)}
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
REPRESENTATION RULE: ${representativeAnchorRule(pack, category, preset)}
CONSTRAINT SEMANTICS: ${constraintSemantics()}
${safeCompatibilityNote ? `\nCOMPATIBILITY NOTE: ${safeCompatibilityNote}` : ''}
${guardrails ? `\nSCENE GUARDRAILS: ${guardrails}` : ''}
${repeatedGuardrails ? `\nREPEATED-SCENE GUARDRAILS: ${repeatedGuardrails}` : ''}

Style DNA: aesthetic=${styleAesthetic}; subject=${styleSubject}; color=${styleColor}; light=${styleLighting}; texture=${styleTexture}; camera=${styleCamera}; mood=${styleMood}; render=${styleRender}; features=${styleFeatures}.

VISUAL RESET: ${visualResetRule()}

Make it immediately recognizable as ${recognitionLabel}. Keep the anchor, but do not reuse generic staging from neighboring presets in this category; vary subject design, environment read, action cue, and color identity for this preset specifically. Apply the style through rendering, mood, materials, optical framing, and treatment, not by adding literal camera equipment. Distinct motif to avoid cross-pack convergence: ${presetMotifForPrompt(pack, category, preset)}. No franchise, brand, character, logo, or copyrighted identity.${avoidRepeatedLibrary} Output only the image, 1024x1536 portrait.${negative}`);
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
  await rm(sourceAssetPath, { force: true }).catch(() => {});
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
  process.argv.includes('--print-prompts') || process.argv.includes('--dry-run-prompts');
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

const packs = (await loadPacks()).filter((pack) => !packFilter || pack.id === packFilter);
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
