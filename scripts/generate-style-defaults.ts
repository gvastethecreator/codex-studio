import { copyFile, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Asset, Job, Project } from "../packages/shared/src";
import type { StylePack, StylePresetDef } from "../components/recipes/styles/types";
import { defaultsDir, loadPacks, request, rootDir, sanitizeCategory, styleCategoryImageKey, valueOf } from "./style-default-utils";

interface ManifestEntry {
  presetId: string;
  presetName: string;
  packId: string;
  packName: string;
  category: string;
  file: string;
  jobId: string;
  sourceAsset: string;
  generationMode: "text-to-image";
  model: string;
  reasoningEffort: string;
  generatedAt: string;
}

interface PendingPreset {
  pack: StylePack;
  preset: StylePresetDef;
  category: string;
  destination: string;
}

const IMAGEGEN_MODEL = process.env.CODEX_IMAGEGEN_MODEL || "gpt-5.4-mini";
const IMAGEGEN_REASONING_EFFORT = process.env.CODEX_IMAGEGEN_REASONING_EFFORT || "low";
const libraryDir = process.env.STUDIO_LIBRARY_DIR || "D:\\AI-Studio-Library";
const IMAGE_RETRY_ATTEMPTS = Math.max(1, Number(process.env.CODEX_IMAGEGEN_RETRY_ATTEMPTS || 2));
const WAIT_POLL_MS = 800;
const RETRY_RETRY_DELAY_MS = 600;

const CATEGORY_BASE_PROMPTS: Record<string, string> = {
  pack_01__portrait_styles:
    "A realistic half-body adult portrait with a clear face, visible eyes, natural posture, restrained wardrobe, skin detail, hair detail, and a simple background with enough depth for lens, lighting, grain, and facial rendering differences.",
  pack_01__film_stocks:
    "A documentary travel photograph of one adult subject on a rainy city street with practical lights, wet pavement, foliage, fabric, glass, signage-free architecture, skin tones, bright color accents, deep shadows, and sky detail for film stock behavior.",
  pack_01__camera_types:
    "A controlled vertical scene with one human-scale subject, a room or street plane, foreground tabletop objects, distant background geometry, reflective surfaces, fine details, straight lines, and scale cues that expose lens, camera, surveillance, aerial, macro, or thermal traits.",
  pack_01__lighting:
    "A simple interior or narrow street set with one adult figure, textured wall, fabric, wood, glass, haze, reflective floor, and visible practical or natural light sources so shadows, highlights, bounce, and atmosphere are readable.",
  pack_01__genres:
    "A genre-ready cinematic portrait scene with one protagonist, readable location, wardrobe, props, atmosphere, and narrative tension. Adapt the subject, era, and setting to the named genre while avoiding franchise-specific identities.",

  pack_02__film_genres:
    "A cinematic still with one protagonist in a practical set, strong production design, expressive blocking, foreground props, midground action cues, background depth, and no text. Adapt era, setting, and staging to the named film genre.",
  pack_02__tv_and_broadcast:
    "A vertical broadcast or field-production scene with presenter or subject, cameras, lights, set furniture, monitors without readable text, cables, practical equipment, and clean studio or location context.",
  pack_02__animation_styles:
    "A vertical character-and-environment composition with one young adventurer in a workshop or stage-like setting, clean silhouette, expressive pose, layered props, readable background, and room for the animation style to dominate.",
  pack_02__photography_eras:
    "A period-neutral street or portrait photograph with one subject, architecture, clothing texture, sky, skin, shadows, highlights, and tonal range designed to reveal photographic process, emulsion, age, grain, and color reproduction.",
  pack_02__lighting_and_atmosphere:
    "A cinematic subject in a sparse interior with windows, practical lights, reflective surfaces, haze, shadow planes, fabric, wood, and controlled negative space for atmosphere and lighting style.",

  pack_03__render_engines:
    "A hero 3D creature or sculptural product on a pedestal in a clean studio gallery, surrounded by material swatches, reflective floor, glass, metal, skin-like material, fine geometry, and controlled lighting to reveal render-engine traits.",
  pack_03__materials:
    "A studio still life of simple geometric objects and a small figurine, with the central object dominated by the named material, plus secondary metal, glass, fabric, stone, and organic details for material contrast.",
  pack_03__3d_styles:
    "A clean 3D object study with one central constructed form, support primitives, visible silhouette, neutral background, modeling cues, surface detail, and lighting that makes topology and style language legible.",
  pack_03__lighting_and_atmosphere:
    "A minimal 3D interior display room with one central bust or object, reflective floor, volumetric fog, practical light panels, hard and soft shadow areas, and layered depth.",
  pack_03__applications:
    "A purpose-specific 3D presentation scene adapted to the preset: product render, game asset, architectural visualization, scientific model, motion graphics frame, or VFX element, with a single clear focal subject and no text.",

  pack_04__comic_book_styles:
    "A vertical comic hero panel with one original protagonist, dynamic pose, urban or dramatic environment, action framing, props, depth layers, and clear space for ink, panel energy, halftone, line weight, and color treatment.",
  pack_04__children_s_illustration:
    "A whimsical storybook scene with one child or small original character, friendly environment, simple props, expressive gesture, warm narrative moment, and enough background detail for illustration texture and shape language.",
  pack_04__editorial_and_poster:
    "A vertical editorial poster-style composition with one bold symbolic subject, strong silhouette, graphic background shapes, visual hierarchy, and no lettering or logo.",
  pack_04__concept_art:
    "A vertical concept-art key image with one original character, creature, vehicle, or environment focal point, cinematic depth, design callouts expressed visually, believable scale, and mood-driven lighting.",
  pack_04__ink_and_print:
    "A printmaking-focused composition showing one strong subject and a few supporting objects as if prepared for a finished print, with visible paper, ink, plate, block, or press-like texture cues and no text.",

  pack_05__70s_and_80s_retro_anime:
    "A retro anime keyframe with one original adventurer, mechanical or city backdrop, dramatic pose, painted background, expressive face, and practical props suited to vintage cel-era treatment.",
  pack_05__90s_golden_era:
    "A dramatic 1990s anime-inspired keyframe with one original hero, moody urban or fantasy background, strong silhouette, cinematic cel lighting, and emotional close-to-mid shot staging.",
  pack_05__2000s_classics:
    "An early-2000s anime adventure scene with one original character, layered environment, energetic pose, clean background details, and enough color variety for era-specific digital-cel styling.",
  pack_05__modern_shonen_and_action:
    "A modern action anime battle moment with one original fighter, motion arcs, impact energy, dramatic camera angle, debris, layered background, and readable costume details without referencing any franchise.",
  pack_05__classic_and_modern_shojo:
    "An emotional shojo portrait or two-character scene with expressive eyes, elegant pose, soft background motifs, fashion detail, delicate lighting, and romantic or introspective atmosphere.",
  pack_05__mecha_and_cyberpunk:
    "A vertical scene with an original pilot, android, or mecha detail in a neon industrial environment, visible machinery, reflective armor, cockpit or alley context, and hard-edged sci-fi design.",
  pack_05__dark_fantasy_and_seinen:
    "A dark fantasy or mature anime scene with one original character, ruined architecture, ominous atmosphere, textured costume, dramatic shadows, and grounded narrative weight.",
  pack_05__studio_masterpieces:
    "A poetic anime film still with one original traveler in a richly painted natural or urban environment, wind, sky, warm human detail, layered depth, and quiet cinematic emotion.",
  pack_05__slice_of_life_and_moe:
    "A cozy everyday anime scene with one original character in a room, cafe, school-adjacent, or street setting, expressive pose, small props, warm light, and gentle background detail.",
  pack_05__isekai_and_high_fantasy:
    "A vertical fantasy anime scene with one original traveler, magical city, forest, dungeon, or floating landscape, costume detail, glowing artifact, atmospheric depth, and adventure mood.",

  pack_06__traditional_painting:
    "A finished traditional painting scene with one original subject, studio-like composition, visible brushwork-ready surfaces, fabric, background depth, and lighting suited to classic painted media.",
  pack_06__drawing_and_sketching:
    "A drawing study of one subject with clear silhouette, anatomy or object structure, simple props, paper-like surface, tonal planes, and visible opportunities for line, graphite, charcoal, or ink handling.",
  pack_06__printmaking:
    "A printmaking motif with one bold subject, simplified shapes, paper texture, carved or etched mark opportunities, high contrast, and a finished handmade-print feeling.",
  pack_06__digital_art:
    "A polished digital illustration or concept scene with one original character, object, or environment focal point, clean composition, layered lighting, material detail, and space for digital rendering choices.",
  pack_06__mixed_media:
    "A layered mixed-media composition with one central subject, collage fragments, paint, paper, texture, transparent overlays, found-material cues, and controlled visual hierarchy without text.",

  pack_07__interior_design:
    "A vertical interior room scene with furniture, decor, natural and practical light, textiles, wall materials, floor detail, human scale cues, and a clear design focal point.",
  pack_07__architectural_styles:
    "An architectural portfolio image of one building or interior volume with structural lines, facade or spatial rhythm, material detail, scale cues, sky or landscape context, and clean vertical framing.",
  pack_07__environment:
    "A cinematic built environment with architecture, streetscape or interior-exterior transition, atmospheric light, readable scale, layered depth, materials, and a single compositional focal point.",
  pack_07__landscape_architecture:
    "A designed outdoor landscape with paths, planting, water or stone, seating or human-scale cues, architectural edge, layered vegetation, and controlled natural light.",
  pack_07__fantasy_architecture:
    "A fantasy architectural scene with one impossible building or interior, stairs, arches, towers or chambers, magical light, scale cues, atmospheric depth, and original worldbuilding.",

  pack_08__contemporary_fashion:
    "A full-body vertical fashion editorial with one adult model, runway or studio setting, visible garment silhouette, fabric motion, accessories, lighting, and uncluttered background.",
  pack_08__subcultures:
    "A vertical subculture fashion portrait in a bedroom, street, club, or studio-like space with one adult model, wardrobe details, accessories, props, and environment cues tied to the style.",
  pack_08__historical_and_fantasy:
    "A historical or fantasy costume portrait with one adult model, full garment silhouette, period or fantasy setting, textiles, accessories, hair detail, and dramatic but readable lighting.",
  pack_08__fantasy_sci_fi_costume:
    "A vertical costume design portrait of one original character wearing fantasy or sci-fi attire, armor or fabric systems, props, material contrast, and environment cues.",
  pack_08__fabric_and_texture_focus:
    "A garment material study with one wearable item on a model or mannequin, fabric folds, stitching, surface texture, trim, highlights, and close enough framing to reveal textile behavior.",

  pack_09__natural_materials:
    "A close-up material study of one natural surface as the hero subject, with secondary scale cues, tactile relief, color variation, grazing light, and macro detail.",
  pack_09__man_made_materials:
    "A close-up studio material study of one manufactured surface or object, with clean edges, fabrication marks, reflections, wear, and controlled lighting.",
  pack_09__weathering_and_decay:
    "A close-up scene of aged material with corrosion, peeling, cracks, stains, residue, dust, and layered history under directional light.",
  pack_09__tactile_surfaces:
    "A tactile macro surface composition with folds, fibers, grains, pores, bumps, and touchable relief, framed vertically with strong texture hierarchy.",
  pack_09__elemental_and_fx:
    "A close-up elemental or visual-effects material scene with one dominant phenomenon, particles, glow, fluid, smoke, sparks, or frost interacting with a simple surface.",

  pack_10__geometric_abstraction:
    "A vertical abstract composition based on deliberate geometric logic, central structure, negative space, dimensional layering, controlled color, and clean edge relationships.",
  pack_10__fluid_and_organic:
    "A vertical abstract composition of flowing organic forms, liquid motion, soft boundaries, layered translucency, color gradients in material rather than UI, and tactile depth.",
  pack_10__digital_glitch_and_noise:
    "A vertical digital abstraction with one coherent focal structure, signal distortion, scan artifacts, pixel noise, data-like fragmentation, and no readable text.",
  pack_10__surrealism_and_dream:
    "A surreal vertical scene with one impossible focal subject, dreamlike spatial logic, symbolic props, atmospheric depth, and strange but coherent lighting.",
  pack_10__pattern_and_texture:
    "A vertical pattern and texture composition with a clear repeat or motif logic, tactile material detail, layered rhythm, and one dominant visual system.",

  pack_11__toys_and_crafts:
    "A centered vertical toy or craft object scene with one handmade or collectible focal subject, table surface, tools or materials, scale cues, and playful but clean lighting.",
  pack_11__artistic_mediums:
    "A single subject rendered as a finished artwork in the named medium, with visible material behavior, surface texture, studio context, and no text.",
  pack_11__aesthetics:
    "A stylized vertical scene with one clear subject, props, environment cues, color story, texture, and composition tailored to the named aesthetic.",
  pack_11__food_and_drink:
    "A vertical food or drink hero shot with one plated dish or beverage, utensils, fabric, tabletop, controlled highlights, appetizing texture, and background depth.",
  pack_11__micro_macro:
    "A close-up or miniature-scale vertical scene with one tiny or magnified subject, strong scale cues, macro detail, shallow depth, texture, and readable environment context.",
};

const CATEGORY_SCENE_ANCHORS: Record<string, string> = {
  pack_01__lighting:
    "Place the subject on a quiet rooftop walkway after recent rain, with distant skyline bokeh, puddle reflections, a waist-high concrete ledge, and one practical lamp in frame.",
  pack_02__lighting_and_atmosphere:
    "Place the subject in a narrow motel room with venetian blinds, a bedside practical lamp, a slightly open bathroom door, colored spill from outside, and cinematic negative space.",
  pack_03__3d_styles:
    "Build the scene as a clean display diorama on a white plinth with modular blocks, stepped platforms, and a sculptural silhouette that reads immediately as a designed 3D object.",
  pack_06__digital_art:
    "Stage the subject inside a polished artist-workstation vignette with layered display panes, a lit desk surface, collectible props, and a strong focal object that feels made for digital painting.",
};

const GENERIC_SCENE_ANCHORS = [
  "Use a window-side corner with a bench, one hanging plant, and a strong diagonal light wedge crossing the floor.",
  "Stage the scene beside a worn staircase landing with a handrail, a narrow side table, and layered depth behind the subject.",
  "Use a market-adjacent alley with stacked crates, fabric awnings, damp pavement, and a bright background opening.",
  "Place the focal subject near a studio cyclorama with one stool, a folded fabric drop, and a hard rim light from camera left.",
  "Build the composition around a tiled courtyard with one fountain edge, potted greenery, and a sunlit archway behind.",
  "Use a museum-gallery corner with a pedestal, polished floor reflection, and a tall shadow wall behind the subject.",
  "Stage the image inside a compact observatory-like room with circular framing, metal rails, and a cool backlight.",
  "Place the subject at the edge of a greenhouse aisle with condensation, glass structure, and layered foliage depth.",
  "Use a sheltered transit platform with structural beams, empty seating, reflected light, and a vanishing-point background.",
  "Build the scene around a workshop table with clamps, small tools, dust motes, and a bright opening in the rear plane.",
  "Place the subject in a canyon-like passage with textured walls, drifting haze, and a narrow vertical strip of sky.",
  "Use an atrium mezzanine with railings, geometric wall panels, warm pools of light, and deep perspective.",
];

const GENERIC_PRESET_MOTIFS = [
  "Include a brass compass-like object as a recurring prop.",
  "Include a folded amber cloth accent near the focal area.",
  "Include a cluster of suspended glass droplets catching light.",
  "Include a slim red lacquer object on a nearby surface.",
  "Include a carved stone fragment with chipped edges.",
  "Include a teal ceramic vessel with a distinctive silhouette.",
  "Include a strip of patterned tape or trim integrated into the set.",
  "Include a single triangular light opening in the background.",
  "Include a ring-shaped metallic element near the subject.",
  "Include a weathered leather notebook-sized object without text.",
  "Include a pale paper fan or folded sheet shape in the scene.",
  "Include a dark cobalt accent object that contrasts with the rest of the palette.",
];

const COMPOSITION_VARIANTS = [
  "Compose the subject slightly off-center with clear negative space.",
  "Use a diagonal composition with the subject layered across foreground and middle-ground.",
  "Set the subject in a deep foreground-to-background setup with one clear depth lane.",
  "Anchor the composition on a central subject with offset secondary elements.",
  "Use a clean three-plane composition to preserve vertical card readability.",
];

const LIGHT_VARIANTS = [
  "Keep lighting directional with a dramatic edge and controlled ambient fill.",
  "Use cinematic side light with soft practical spill and subtle contrast.",
  "Use cool rim light and warm bounce fill for a more dynamic tone.",
  "Use soft frontal fill with one pronounced practical back light source.",
  "Use high-contrast lighting to increase material legibility while preserving mood.",
];

const MATERIAL_VARIANTS = [
  "Prioritize readable skin, fabric, and structure texture differences.",
  "Include contrasting surface materials across subject, props, and background.",
  "Use clear edge and surface definition between object planes.",
  "Let material finish (metal/cloth/stone/paint) carry part of the style signal.",
  "Add a tactile foreground detail that reinforces the style treatment.",
];

const DETAIL_VARIANTS = [
  "Include one specific micro-detail linked to the preset tone.",
  "Keep one small secondary prop that supports the main story element.",
  "Use one distinct pose nuance that is not repeated in the base scene.",
  "Add a subtle asymmetry in object placement to avoid template repetition.",
  "Shift one secondary action detail (tilt, fold, ripple, or movement edge).",
];

const FEELING_VARIANTS = [
  "Keep the emotion anchored by the style’s strongest expression cue.",
  "Add a specific mood beat that changes the character dynamics.",
  "Let one facial or posture detail carry the scene’s emotional weight.",
  "Use subtle movement to suggest the scene’s implied beat.",
  "Keep the composition clean and readable from a quick card glance.",
];

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function categorySceneAnchor(pack: StylePack, category: string) {
  const key = styleCategoryImageKey(pack.id, category);
  const explicit = CATEGORY_SCENE_ANCHORS[key];
  if (explicit) return explicit;
  return GENERIC_SCENE_ANCHORS[hashString(key) % GENERIC_SCENE_ANCHORS.length];
}

function presetMotif(preset: StylePresetDef) {
  return GENERIC_PRESET_MOTIFS[hashString(`${preset.id}:${preset.name}`) % GENERIC_PRESET_MOTIFS.length];
}

function pickVariant(list: string[], seed: string) {
  return list[Math.abs(hashString(seed)) % list.length];
}

function categoryBasePrompt(pack: StylePack, category: string) {
  const key = styleCategoryImageKey(pack.id, category);
  const base = CATEGORY_BASE_PROMPTS[key] || "A vertical scene with one clear original subject, foreground detail, midground context, background depth, varied materials, and no text.";
  return `Base: ${base}
Anchor: ${categorySceneAnchor(pack, category)}
Fit pack "${pack.name}" and category "${category}". Finished style-card image, not a reference sheet. Portrait 2:3, usable in a 3:4 card crop. No text, labels, logos, watermark, or UI.`;
}

function buildStylePrompt(pack: StylePack, preset: StylePresetDef, attempt: number) {
  const category = sanitizeCategory(preset.category);
  const negative = preset.negativePrompt ? `\n\nAvoid:\n${preset.negativePrompt}` : "";
  const allowsBooks = /book|library|textbook|comic book|storybook/i.test(`${preset.name} ${category} ${valueOf(preset.style, "aesthetic", "key_features")}`);
  const avoidRepeatedLibrary = allowsBooks ? "" : " Avoid books, bookshelves, libraries, reading rooms, archives, and stacked volumes.";
  const variantSeed = `${pack.id}:${preset.id}:${preset.name}:${attempt}`;

  return `Generate one portrait default style-card image.
TARGET STYLE: ${preset.name.toUpperCase()}
PACK: ${pack.name}
CATEGORY: ${category}
MODE: text-to-image
MODEL: ${IMAGEGEN_MODEL}, ${IMAGEGEN_REASONING_EFFORT}

${categoryBasePrompt(pack, category)}
COMPOSITION: ${pickVariant(COMPOSITION_VARIANTS, `${variantSeed}:composition`)}
MATERIAL: ${pickVariant(MATERIAL_VARIANTS, `${variantSeed}:material`)}
LIGHTING: ${pickVariant(LIGHT_VARIANTS, `${variantSeed}:light`)}
DETAIL: ${pickVariant(DETAIL_VARIANTS, `${variantSeed}:detail`)}
FEELING: ${pickVariant(FEELING_VARIANTS, `${variantSeed}:feeling`)}

Style DNA: aesthetic=${valueOf(preset.style, "aesthetic")}; subject=${valueOf(preset.style, "subject_treatment", "form_and_line")}; color=${valueOf(preset.style, "color_and_tone", "color_palette")}; light=${valueOf(preset.style, "lighting_and_shadow", "lighting_setup")}; texture=${valueOf(preset.style, "texture_and_material", "material_texture")}; camera=${valueOf(preset.style, "camera_and_composition", "spatial_distortion")}; mood=${valueOf(preset.style, "atmosphere_and_mood", "atmosphere")}; render=${valueOf(preset.style, "rendering_and_quality", "render_quality")}; features=${valueOf(preset.style, "key_features")}.

Make it immediately recognizable as "${preset.name}". Keep the anchor; apply the style through rendering, mood, materials, camera, and treatment. Distinct motif to avoid cross-pack convergence: ${presetMotif(preset)}. No franchise, brand, character, logo, or copyrighted identity.${avoidRepeatedLibrary} Output only the image, 1024x1536 portrait.${negative}`;
}

async function exists(filePath: string) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureRepoDefaultCopy(sourcePath: string, destinationPath: string) {
  await copyFile(sourcePath, destinationPath);
  const destinationStats = await stat(destinationPath).catch(() => null);
  if (!destinationStats || destinationStats.size <= 0) {
    throw new Error(`Default repo copy failed for ${path.basename(destinationPath)} from ${sourcePath}`);
  }
}

async function cleanupExternalJobArtifacts(jobId: string, sourceAssetPath: string) {
  const transcriptPath = path.join(libraryDir, "transcripts", jobId, "events.jsonl");
  const codexHome = process.env.CODEX_HOME || path.join(process.env.USERPROFILE || "C:\\Users\\user", ".codex");
  const transcript = await readFile(transcriptPath, "utf8").catch(() => "");
  for (const line of transcript.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line) as any;
      const item = event.params?.item;
      if (item?.type !== "imageGeneration" || !item.id || !event.params?.threadId) continue;
      await rm(path.join(codexHome, "generated_images", event.params.threadId, `${item.id}.png`), { force: true }).catch(() => {});
    } catch {
      // Ignore malformed transcript lines; cleanup is best-effort after the repo copy succeeds.
    }
  }
  await rm(sourceAssetPath, { force: true }).catch(() => {});
  await rm(path.join(libraryDir, "transcripts", jobId), { recursive: true, force: true }).catch(() => {});
}

async function waitForJob(jobId: string) {
  while (true) {
    const jobs = await request<Job[]>("/api/jobs");
    const job = jobs.find((candidate) => candidate.id === jobId);
    if (!job) throw new Error(`Job ${jobId} disappeared from /api/jobs`);
    if (job.status === "completed") return job;
    if (job.status === "failed" || job.status === "cancelled") {
      throw new Error(`Job ${jobId} ended as ${job.status}: ${job.error || "no error"}`);
    }
    if (job.status === "needs_review") {
      throw new Error(`Job ${jobId} status needs_review`);
    }
    await Bun.sleep(WAIT_POLL_MS);
  }
}

async function newestAssetForJob(jobId: string) {
  const assets = await request<Asset[]>("/api/assets");
  return assets.find((asset) => asset.jobId === jobId);
}

function manifestPathForPack(packId: string) {
  return path.join(defaultsDir, `manifest-${packId}.json`);
}

function failuresPathForPack(packId: string) {
  return path.join(defaultsDir, `failures-${packId}.json`);
}

async function loadManifest(packId: string) {
  try {
    const parsed = JSON.parse(await readFile(manifestPathForPack(packId), "utf8")) as ManifestEntry[] | ManifestEntry;
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

async function saveManifest(packId: string, entries: ManifestEntry[]) {
  entries.sort((a, b) => a.presetId.localeCompare(b.presetId));
  await writeFile(manifestPathForPack(packId), `${JSON.stringify(entries, null, 2)}\n`, "utf8");
}

async function loadFailures(packId: string) {
  try {
    return JSON.parse(await readFile(failuresPathForPack(packId), "utf8")) as unknown[];
  } catch {
    return [];
  }
}

async function saveFailure(packId: string, entry: unknown) {
  const failures = await loadFailures(packId);
  failures.push(entry);
  await writeFile(failuresPathForPack(packId), `${JSON.stringify(failures, null, 2)}\n`, "utf8");
}

function argValue(name: string) {
  return process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split("=")[1];
}

const limitArg = argValue("limit");
const limit = limitArg ? Number(limitArg) : Number.POSITIVE_INFINITY;
const packFilter = argValue("pack");
const force = process.argv.includes("--force");
const parallel = Math.max(1, Number(argValue("parallel") || 1));
const lockDir = path.join(defaultsDir, ".locks");

await mkdir(defaultsDir, { recursive: true });
await mkdir(lockDir, { recursive: true });

const health = await request<{ ok: boolean }>("/api/health");
if (!health.ok) throw new Error("Local studio server is not healthy.");

const projects = await request<Project[]>("/api/projects");
const projectId = projects[0]?.id;
const packs = (await loadPacks()).filter((pack) => !packFilter || pack.id === packFilter);

const manifestByPack = new Map<string, Map<string, ManifestEntry>>();
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

  for (const preset of pack.presets) {
    const category = sanitizeCategory(preset.category);
    const destination = path.join(defaultsDir, `${preset.id}.png`);

    if (!force && await exists(destination)) {
      skipped += 1;
      continue;
    }

    targetPresets.push({ pack, preset, category, destination });
  }
}

if (Number.isFinite(limit)) {
  targetPresets.splice(limit);
}

async function processPreset(target: PendingPreset) {
  const { pack, preset, category, destination } = target;
  const manifestByPreset = manifestByPack.get(pack.id);
  if (!manifestByPreset) throw new Error(`Missing manifest map for pack ${pack.id}`);

  console.log(`[txt2img] ${preset.id} ${pack.name} / ${category} / ${preset.name}`);
  let lastError: string | null = null;

  for (let attempt = 1; attempt <= IMAGE_RETRY_ATTEMPTS + 1; attempt += 1) {
    try {
      if (attempt > 1) {
        console.log(`[txt2img-retry] ${preset.id} ${pack.name} / ${category} / ${preset.name} (${attempt}/${IMAGE_RETRY_ATTEMPTS + 1})`);
      }

      const created = await request<Job>("/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          projectId,
          kind: "codex_imagegen",
          prompt: buildStylePrompt(pack, preset, attempt),
        }),
      });

      await waitForJob(created.id);
      const asset = await newestAssetForJob(created.id);
      if (!asset) throw new Error(`Completed job ${created.id} has no asset in /api/assets`);

      await ensureRepoDefaultCopy(asset.filePath, destination);
      await cleanupExternalJobArtifacts(created.id, asset.filePath);
      const repoFile = path.relative(rootDir, destination).replaceAll(path.sep, "/");
      manifestByPreset.set(preset.id, {
        presetId: preset.id,
        presetName: preset.name,
        packId: pack.id,
        packName: pack.name,
        category,
        file: repoFile,
        jobId: created.id,
        sourceAsset: repoFile,
        generationMode: "text-to-image",
        model: IMAGEGEN_MODEL,
        reasoningEffort: IMAGEGEN_REASONING_EFFORT,
        generatedAt: new Date().toISOString(),
      });
      generated += 1;
      lastError = null;
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      lastError = message;

      if (!message.includes("status needs_review") || attempt > IMAGE_RETRY_ATTEMPTS) {
        break;
      }

      console.warn(`[txt2img-retry-needed] ${preset.id} ${pack.name} / ${category} / ${preset.name}: ${message}`);
      await Bun.sleep(RETRY_RETRY_DELAY_MS);
    }
  }

  failed += 1;
  console.error(`[txt2img-failed] ${preset.id} ${pack.name} / ${category} / ${preset.name}: ${lastError}`);
  const failures = failuresByPack.get(pack.id);
  if (Array.isArray(failures)) {
    failures.push({
      presetId: preset.id,
      presetName: preset.name,
      packId: pack.id,
      packName: pack.name,
      category,
      error: lastError || "unknown",
      failedAt: new Date().toISOString(),
    });
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

await Promise.all(Array.from({ length: Math.min(parallel, targetPresets.length || 1) }, () => worker()));

for (const [packId, manifest] of manifestByPack) {
  if (manifest.size > 0) await saveManifest(packId, Array.from(manifest.values()));
}

for (const [packId, failures] of failuresByPack) {
  await writeFile(failuresPathForPack(packId), `${JSON.stringify(failures, null, 2)}\n`, "utf8");
}

console.log(
  `[done] generated=${generated} attempted=${attempted} skipped=${skipped} failed=${failed} packs=${packs.map((pack) => pack.id).join(",") || "none"}`,
);
