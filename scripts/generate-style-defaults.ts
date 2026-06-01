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
    'A cinematic still with one protagonist in a practical set, strong production design, expressive blocking, foreground props, midground action cues, background depth, and no text. Adapt era, setting, and staging to the named film genre.',
  pack_02__tv_and_broadcast:
    'A vertical broadcast or field-production scene with presenter or subject, cameras, lights, set furniture, monitors without readable text, cables, practical equipment, and clean studio or location context.',
  pack_02__animation_styles:
    'A vertical character-and-environment composition with one young adventurer in a workshop or stage-like setting, clean silhouette, expressive pose, layered props, readable background, and room for the animation style to dominate.',
  pack_02__photography_eras:
    'A period-neutral street or portrait photograph with one subject, architecture, clothing texture, sky, skin, shadows, highlights, and tonal range designed to reveal photographic process, emulsion, age, grain, and color reproduction.',
  pack_02__lighting_and_atmosphere:
    'A cinematic subject in a sparse interior with windows, practical lights, reflective surfaces, haze, shadow planes, fabric, wood, and controlled negative space for atmosphere and lighting style.',

  pack_03__render_engines:
    'A hero 3D creature or sculptural product on a pedestal in a clean studio gallery, surrounded by material swatches, reflective floor, glass, metal, skin-like material, fine geometry, and controlled lighting to reveal render-engine traits.',
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
    'Place the subject in a narrow motel room with venetian blinds, a bedside practical lamp, a slightly open bathroom door, colored spill from outside, and cinematic negative space.',
    'Set the scene in a quiet backstage dressing area with mirrors, one glowing bulb row, hanging garments, and deep falloff into shadow.',
    'Use a half-empty late-night diner booth with window reflections, one overhead practical, table chrome, and hazy urban lights outside.',
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
  'Use a window-side corner with a bench, one hanging plant, and a strong diagonal light wedge crossing the floor.',
  'Stage the scene beside a worn staircase landing with a handrail, a narrow side table, and layered depth behind the subject.',
  'Use a market-adjacent alley with stacked crates, fabric awnings, damp pavement, and a bright background opening.',
  'Place the focal subject near a studio cyclorama with one stool, a folded fabric drop, and a hard rim light from camera left.',
  'Build the composition around a tiled courtyard with one fountain edge, potted greenery, and a sunlit archway behind.',
  'Use a museum-gallery corner with a pedestal, polished floor reflection, and a tall shadow wall behind the subject.',
  'Stage the image inside a compact observatory-like room with circular framing, metal rails, and a cool backlight.',
  'Place the subject at the edge of a greenhouse aisle with condensation, glass structure, and layered foliage depth.',
  'Use a sheltered transit platform with structural beams, empty seating, reflected light, and a vanishing-point background.',
  'Build the scene around a workshop table with clamps, small tools, dust motes, and a bright opening in the rear plane.',
  'Place the subject in a canyon-like passage with textured walls, drifting haze, and a narrow vertical strip of sky.',
  'Use an atrium mezzanine with railings, geometric wall panels, warm pools of light, and deep perspective.',
  'Place the subject beside a narrow bridge edge with layered mist below, strong parallax, and a single bright focal opening in the distance.',
  'Use a compact studio apartment corner with a side table, soft fabric, a plant shadow, and a long slice of afternoon light.',
  'Stage the composition in a weathered courtyard with stone paving, a side arch, and one reflective pool catching the sky.',
  'Use a workshop storage wall with hanging tools, a central stool, deep shadows, and one bright task light near the focal area.',
  'Set the scene inside a glass-roof passage with condensation, structural beams, and a bright depth lane behind the subject.',
  'Place the focal subject near a train-car vestibule with window reflections, overhead rails, and a strong vanishing line.',
  'Use a theatre-side rehearsal corner with curtains, floor marks, one spotlight spill, and stacked props at the edge of frame.',
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
    'Use a shattered rooftop or alley crossing with one clean motion lane, broken concrete, wind, and a single hero strike axis.',
    'Stage the subject against a schoolyard, street crossing, or stair landing with impact debris and a decisive action silhouette.',
    'Build the frame around a fast chase or clash beat with a compressed background and a sharp foreground-to-distance read.',
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

function categorySceneAnchor(pack: StyleRuntimePack, category: string, seed?: string) {
  const key = styleCategoryImageKey(pack.id, category);
  const explicit = PACK_SCENE_ANCHORS[key] || CATEGORY_SCENE_ANCHORS[key];
  const source = explicit && explicit.length > 0 ? explicit : GENERIC_SCENE_ANCHORS;
  return source[hashString(seed || `${key}:anchor`) % source.length];
}

function presetMotif(preset: StyleRuntimePreset) {
  return PRESET_MOTIFS[hashString(`${preset.id}:${preset.name}`) % PRESET_MOTIFS.length];
}

function pickVariant(list: string[], seed: string) {
  return list[Math.abs(hashString(seed)) % list.length];
}

function categoryBasePrompt(pack: StyleRuntimePack, category: string, seed?: string) {
  const key = styleCategoryImageKey(pack.id, category);
  const base =
    CATEGORY_BASE_PROMPTS[key] ||
    'A vertical scene with one clear original subject, foreground detail, midground context, background depth, varied materials, and no text.';
  return `Base: ${base}
Anchor: ${categorySceneAnchor(pack, category, seed)}
Fit pack "${pack.name}" and category "${category}". Finished style-card image, not a reference sheet. Portrait 2:3, usable in a 3:4 card crop. No text, labels, logos, watermark, or UI.`;
}

function familyVariant(map: Record<string, string[]>, family: string, seed: string) {
  const source = map[family] || map.default;
  return source[Math.abs(hashString(seed)) % source.length];
}

function buildStylePrompt(pack: StyleRuntimePack, preset: StyleRuntimePreset, attempt: number) {
  const category = sanitizeCategory(preset.category);
  const negative = preset.negativePrompt ? `\n\nAvoid:\n${preset.negativePrompt}` : '';
  const allowsBooks = /book|library|textbook|comic book|storybook/i.test(
    `${preset.name} ${category} ${valueOf(preset.style, 'aesthetic', 'key_features')}`,
  );
  const avoidRepeatedLibrary = allowsBooks
    ? ''
    : ' Avoid books, bookshelves, libraries, reading rooms, archives, stacked volumes, compass props, map symbols, notebook props, generic plants, and other stock desk clutter.';
  const variantSeed = `${pack.id}:${preset.id}:${preset.name}:${attempt}`;
  const family = broadPromptFamily(pack, category);
  const isGuroPreset = preset.id === 'SP05-107';
  const isAmanoPreset = preset.id === 'SP05-321';
  const targetStyleLabel = isGuroPreset
    ? 'UNSETTLING HORROR ANIME'
    : isAmanoPreset
      ? 'ETHER-WISP GOTHIC FANTASY ANIME'
      : preset.name.toUpperCase();
  const recognitionLabel = isGuroPreset
    ? 'an unsettling horror anime style-card'
    : isAmanoPreset
      ? 'an ether-wisp gothic fantasy anime style-card'
      : `"${preset.name}"`;
  const styleAesthetic = isGuroPreset
    ? 'Unsettling body-horror anime with distorted anatomy, organic corruption, eerie clinical unease, shadowed biological forms, surreal nightmare tension, and implied transformation rather than explicit gore'
    : isAmanoPreset
      ? 'Ethereal gothic fantasy anime with elongated silhouettes, ornamental drapery, moonlit melancholy, gilded accents, celestial voids, and weightless dreamlike elegance'
      : valueOf(preset.style, 'aesthetic');
  const styleSubject = isGuroPreset
    ? 'Distorted human or creature silhouette, shadowed anatomy, unsettling posture, and a clear horror read without explicit graphic detail'
    : isAmanoPreset
      ? 'Elegant fantasy figure with elongated silhouette, feather-light gesture, ornamental costume logic, and a strong card-readable profile'
      : valueOf(preset.style, 'subject_treatment', 'form_and_line');
  const styleColor = isGuroPreset
    ? 'Sickly crimson accents, bruise-spectrum shadows, bone-white contrast, deep black voids, and restrained biological color cues'
    : isAmanoPreset
      ? 'Ivory, antique gold, moon-silver, abyssal indigo, pale orchid haze, and restrained gothic jewel tones'
      : valueOf(preset.style, 'color_and_tone', 'color_palette');
  const styleLighting = isGuroPreset
    ? 'Clinical single-source lighting, hard shadow edges, wet sheen highlights, and deep contrast that keeps the image eerie but readable'
    : isAmanoPreset
      ? 'Moonlit haze, diffuse celestial glow, soft metallic gleam, and spectral backlighting that preserves silhouette clarity'
      : valueOf(preset.style, 'lighting_and_shadow', 'lighting_setup');
  const styleTexture = isGuroPreset
    ? 'Organic membrane textures, slick surfaces, faint muscle-like striations, and corrupted biological surfaces without explicit gore'
    : isAmanoPreset
      ? 'Silk translucency, feathered ink edges, gilded ornament hints, velvet void gradients, and airbrushed dream textures'
      : valueOf(preset.style, 'texture_and_material', 'material_texture');
  const styleCamera = isGuroPreset
    ? 'Tight vertical framing, oppressive perspective, and silhouette-first composition that preserves card readability'
    : isAmanoPreset
      ? 'Tight vertical framing, floating negative space, graceful elongation, and silhouette-first composition for immediate card recognition'
      : valueOf(preset.style, 'camera_and_composition', 'spatial_distortion');
  const styleMood = isGuroPreset
    ? 'Horrifying, transgressive, darkly beautiful, mesmerizing, and intentionally non-graphic'
    : isAmanoPreset
      ? 'Ethereal, sorrowful, celestial, dreamlike, and quietly majestic'
      : valueOf(preset.style, 'atmosphere_and_mood', 'atmosphere');
  const styleRender = isGuroPreset
    ? 'Nightmare-poetry anime rendering with unsettling precision, high detail, and no explicit gore'
    : isAmanoPreset
      ? 'Delicate fantasy-anime rendering with ornamental precision, dreamy softness, elegant detail, and no copyrighted character identity'
      : valueOf(preset.style, 'rendering_and_quality', 'render_quality');
  const styleFeatures = isGuroPreset
    ? 'Distorted anatomy, organic corruption, spiral contamination motifs, shadowed transformation cues, and horror atmosphere without exposed organs or blood spray'
    : isAmanoPreset
      ? 'Elongated figures, ornamental drapery, moonlit voids, feather-light motion, gilded detail accents, and ethereal gothic fantasy poise'
      : valueOf(preset.style, 'key_features');
  const safeCompatibilityNote = isGuroPreset
    ? 'Keep it horror-forward but non-graphic: no exposed organs, no blood spray, no dismemberment, no explicit gore. Favor implication, distortion, shadow, and atmospheric unease.'
    : isAmanoPreset
      ? 'Keep it original and non-derivative: no recognizable franchise characters, no copyrighted costume designs, and no direct imitation of any named artist. Favor broad ethereal gothic fantasy language instead.'
      : '';

  return appendImagegenDenoiseDirective(`Generate one portrait default style-card image.
TARGET STYLE: ${targetStyleLabel}
PACK: ${pack.name}
CATEGORY: ${category}
MODE: text-to-image
MODEL: ${IMAGEGEN_MODEL}, ${IMAGEGEN_REASONING_EFFORT}

${categoryBasePrompt(pack, category, `${variantSeed}:anchor`)}
HERO: ${familyVariant(HERO_VARIANTS, family, `${variantSeed}:hero`)}
ENVIRONMENT: ${familyVariant(ENVIRONMENT_VARIANTS, family, `${variantSeed}:environment`)}
COMPOSITION: ${pickVariant(COMPOSITION_VARIANTS, `${variantSeed}:composition`)}
MATERIAL: ${pickVariant(MATERIAL_VARIANTS, `${variantSeed}:material`)}
LIGHTING: ${pickVariant(LIGHT_VARIANTS, `${variantSeed}:light`)}
DETAIL: ${pickVariant(DETAIL_VARIANTS, `${variantSeed}:detail`)}
FEELING: ${pickVariant(FEELING_VARIANTS, `${variantSeed}:feeling`)}
CAMERA FOCUS: ${pickVariant(CAMERA_FOCUS_VARIANTS, `${variantSeed}:focus`)}
ACTION: ${pickVariant(ACTION_VARIANTS, `${variantSeed}:action`)}
COLOR SEPARATION: ${pickVariant(COLOR_SEPARATION_VARIANTS, `${variantSeed}:color`)}
${safeCompatibilityNote ? `\nCOMPATIBILITY NOTE: ${safeCompatibilityNote}` : ''}

Style DNA: aesthetic=${styleAesthetic}; subject=${styleSubject}; color=${styleColor}; light=${styleLighting}; texture=${styleTexture}; camera=${styleCamera}; mood=${styleMood}; render=${styleRender}; features=${styleFeatures}.

Make it immediately recognizable as ${recognitionLabel}. Keep the anchor, but do not reuse generic staging from neighboring presets in this category; vary subject design, environment read, action cue, and color identity for this preset specifically. Apply the style through rendering, mood, materials, camera, and treatment. Distinct motif to avoid cross-pack convergence: ${presetMotif(preset)}. No franchise, brand, character, logo, or copyrighted identity.${avoidRepeatedLibrary} Output only the image, 1024x1536 portrait.${negative}`);
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

function argValue(name: string) {
  return process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1];
}

const limitArg = argValue('limit');
const limit = limitArg ? Number(limitArg) : Number.POSITIVE_INFINITY;
const packFilter = argValue('pack');
const categoryFilterArg = argValue('category');
const presetFilterArg = argValue('preset');
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

await mkdir(defaultsDir, { recursive: true });
await mkdir(lockDir, { recursive: true });

const health = await request<{ ok: boolean }>('/api/health');
if (!health.ok) throw new Error('Local studio server is not healthy.');

const projects = await request<Project[]>('/api/projects');
const projectId = projects[0]?.id;
const packs = (await loadPacks()).filter((pack) => !packFilter || pack.id === packFilter);

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

const existingDefaultFiles = new Set<string>();
for (const pack of packs) {
  for (const preset of pack.presets) {
    const category = sanitizeCategory(preset.category);
    const destination = path.join(defaultsDir, `${preset.id}${RECIPE_ASSET_EXTENSION}`);

    if (presetFilters.size > 0 && !presetFilters.has(preset.id)) {
      existingDefaultFiles.add(destination);
      skipped += 1;
      continue;
    }

    if (categoryFilters.size > 0 && !categoryFilters.has(category)) {
      continue;
    }

    if (!force && (await exists(destination))) {
      existingDefaultFiles.add(destination);
      skipped += 1;
    }
  }
}

targetPresets.push(
  ...createStyleDefaultTargets({
    packs,
    existingFiles: existingDefaultFiles,
    force,
    categoryFilters,
    presetFilters,
    limit,
    defaultsDir,
    assetExtension: RECIPE_ASSET_EXTENSION,
  }),
);

async function processPreset(target: PendingPreset) {
  const { pack, preset, category, destination } = target;
  const manifestByPreset = manifestByPack.get(pack.id);
  if (!manifestByPreset) throw new Error(`Missing manifest map for pack ${pack.id}`);

  console.log(`[txt2img] ${preset.id} ${pack.name} / ${category} / ${preset.name}`);
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
            prompt: buildStylePrompt(pack, preset, attempt),
          }),
        ),
      });

      await waitForJob(created.id);
      const asset = await newestAssetForJob(created.id);
      if (!asset) throw new Error(`Completed job ${created.id} has no asset in /api/assets`);

      await writeRepoWebpAsset(asset.filePath, destination);
      await cleanupExternalJobArtifacts(created.id, asset.filePath);
      const repoFile = repoRelative(destination);
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
