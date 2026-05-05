import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Asset, Job, Project } from "../packages/shared/src";
import type { StylePack, StylePresetDef } from "../components/recipes/styles/types";
import {
  categoryBasesDir,
  dataUrlFromBytes,
  defaultsDir,
  loadPacks,
  request,
  rootDir,
  sanitizeCategory,
  styleCategoryImageKey,
  valueOf,
} from "./style-default-utils";

const manifestPath = path.join(defaultsDir, "manifest.json");

interface ManifestEntry {
  presetId: string;
  presetName: string;
  packId: string;
  packName: string;
  category: string;
  file: string;
  jobId: string;
  sourceAsset: string;
  sourceBaseImage: string;
  generatedAt: string;
}

function buildStylePrompt(pack: StylePack, preset: StylePresetDef, baseFileName: string) {
  const category = sanitizeCategory(preset.category);
  const negative = preset.negativePrompt ? `\n\nAvoid:\n${preset.negativePrompt}` : "";

  return `Generate a default card image for Codex Image Studio's style preset browser.

*** STYLE TRANSFER PROTOCOL ***
TARGET STYLE: ${preset.name.toUpperCase()}
MODE: CATEGORY BASE STYLE APPLICATION
PACK: ${pack.name}
CATEGORY: ${category}

[BASE IMAGE]
Use the attached category base image (${baseFileName}) as the visual subject and composition baseline.
Preserve the broad composition and readable scene structure so all presets in this category can be compared against the same base image.
Re-render the base image through this preset's visual DNA. Do not simply copy the reference.

[VISUAL DNA]
- Core Aesthetic: ${valueOf(preset.style, "aesthetic")}
- Subject Treatment: ${valueOf(preset.style, "subject_treatment", "form_and_line")}
- Color & Tone: ${valueOf(preset.style, "color_and_tone", "color_palette")}
- Lighting & Shadow: ${valueOf(preset.style, "lighting_and_shadow", "lighting_setup")}
- Texture & Material: ${valueOf(preset.style, "texture_and_material", "material_texture")}
- Camera & Composition: ${valueOf(preset.style, "camera_and_composition", "spatial_distortion")}
- Atmosphere & Mood: ${valueOf(preset.style, "atmosphere_and_mood", "atmosphere")}
- Rendering & Quality: ${valueOf(preset.style, "rendering_and_quality", "render_quality")}

[EXECUTION RULES]
Produce a finished default representative image for this exact preset card.
Portrait orientation, composed for a vertical 3:4 card crop.
No text, no watermark, no logos, no UI.
Do not output explanations. Just the image.
*** END PROTOCOL ***${negative}

ImageGen output size: 1024x1536
Aspect ratio: 2:3 (portrait)`;
}

async function exists(filePath: string) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
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
      throw new Error(`Job ${jobId} needs review; no image was auto-discovered.`);
    }
    await Bun.sleep(3000);
  }
}

async function newestAssetForJob(jobId: string) {
  const assets = await request<Asset[]>("/api/assets");
  return assets.find((asset) => asset.jobId === jobId);
}

async function loadManifest() {
  try {
    return JSON.parse(await readFile(manifestPath, "utf8")) as ManifestEntry[];
  } catch {
    return [];
  }
}

async function saveManifest(entries: ManifestEntry[]) {
  entries.sort((a, b) => a.presetId.localeCompare(b.presetId));
  await writeFile(manifestPath, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
}

const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : Number.POSITIVE_INFINITY;
const force = process.argv.includes("--force");

await mkdir(defaultsDir, { recursive: true });

const health = await request<{ ok: boolean }>("/api/health");
if (!health.ok) throw new Error("Local studio server is not healthy.");

const projects = await request<Project[]>("/api/projects");
const projectId = projects[0]?.id;
const packs = await loadPacks();
const manifest = await loadManifest();
const manifestByPreset = new Map(manifest.map((entry) => [entry.presetId, entry]));

let generated = 0;
let skipped = 0;
let missingBase = 0;

for (const pack of packs) {
  for (const preset of pack.presets) {
    const category = sanitizeCategory(preset.category);
    const baseKey = styleCategoryImageKey(pack.id, category);
    const basePath = path.join(categoryBasesDir, `${baseKey}.png`);
    const destination = path.join(defaultsDir, `${preset.id}.png`);
    const existingManifest = manifestByPreset.get(preset.id);

    if (!(await exists(basePath))) {
      missingBase += 1;
      console.log(`[missing-base] ${preset.id} ${pack.name} / ${category}`);
      continue;
    }

    if (!force && await exists(destination) && existingManifest?.sourceBaseImage) {
      skipped += 1;
      continue;
    }

    if (generated >= limit) break;

    console.log(`[generate] ${preset.id} ${pack.name} / ${category} / ${preset.name}`);
    const baseFileName = path.basename(basePath);
    const baseBytes = await readFile(basePath);
    const created = await request<Job>("/api/jobs", {
      method: "POST",
      body: JSON.stringify({
        projectId,
        kind: "codex_imagegen",
        prompt: buildStylePrompt(pack, preset, baseFileName),
        references: [{
          name: baseFileName,
          dataUrl: dataUrlFromBytes(baseBytes),
          strength: 0.55,
        }],
      }),
    });

    await waitForJob(created.id);
    const asset = await newestAssetForJob(created.id);
    if (!asset) throw new Error(`Completed job ${created.id} has no asset in /api/assets`);

    await copyFile(asset.filePath, destination);
    manifestByPreset.set(preset.id, {
      presetId: preset.id,
      presetName: preset.name,
      packId: pack.id,
      packName: pack.name,
      category,
      file: path.relative(rootDir, destination).replaceAll(path.sep, "/"),
      jobId: created.id,
      sourceAsset: asset.filePath,
      sourceBaseImage: path.relative(rootDir, basePath).replaceAll(path.sep, "/"),
      generatedAt: new Date().toISOString(),
    });
    await saveManifest(Array.from(manifestByPreset.values()));
    generated += 1;
  }
  if (generated >= limit) break;
}

console.log(`[done] generated=${generated} skipped=${skipped} missingBase=${missingBase} total=${packs.reduce((sum, pack) => sum + pack.presets.length, 0)}`);
