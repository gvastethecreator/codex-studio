import { copyFile, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Asset, Job, Project } from "../packages/shared/src";
import {
  categoryBasesDir,
  loadPacks,
  request,
  rootDir,
  sanitizeCategory,
  styleCategoryImageKey,
  subjectForCategory,
  valueOf,
} from "./style-default-utils";

interface ManifestEntry {
  packId: string;
  packName: string;
  category: string;
  key: string;
  file: string;
  jobId: string;
  sourceAsset: string;
  generatedAt: string;
}

const manifestPath = path.join(categoryBasesDir, "manifest.json");
const failuresPath = path.join(categoryBasesDir, "failures.json");
const libraryDir = process.env.STUDIO_LIBRARY_DIR || "D:\\AI-Studio-Library";

async function exists(filePath: string) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
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
    if (job.status === "failed" || job.status === "cancelled" || job.status === "needs_review") {
      throw new Error(`Job ${jobId} ended as ${job.status}: ${job.error || "no error"}`);
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
  entries.sort((a, b) => a.key.localeCompare(b.key));
  await writeFile(manifestPath, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
}

async function loadFailures() {
  try {
    return JSON.parse(await readFile(failuresPath, "utf8")) as unknown[];
  } catch {
    return [];
  }
}

async function saveFailure(entry: unknown) {
  const failures = await loadFailures();
  failures.push(entry);
  await writeFile(failuresPath, `${JSON.stringify(failures, null, 2)}\n`, "utf8");
}

function summarizePreset(preset: { name: string; style: Record<string, unknown> }) {
  return [
    preset.name,
    valueOf(preset.style as any, "aesthetic"),
    valueOf(preset.style as any, "subject_treatment", "form_and_line"),
    valueOf(preset.style as any, "camera_and_composition", "spatial_distortion"),
    valueOf(preset.style as any, "atmosphere_and_mood", "atmosphere"),
  ].filter(Boolean).join(" | ");
}

function buildCategoryPrompt(packName: string, category: string, presets: { name: string; style: Record<string, unknown> }[]) {
  const presetExamples = presets.slice(0, 18).map((preset, index) => `${index + 1}. ${summarizePreset(preset)}`).join("\n");
  return `Generate one representative base reference image for a style browser category.

PACK: ${packName}
CATEGORY: ${category}

This base image must be specifically tailored to this pack and category, not reused across unrelated packs.
It will later be processed through every preset in this exact category, so it must contain the subjects, materials, lighting opportunities, composition space, and visual cues needed for those presets.

PRESETS THIS BASE MUST SUPPORT:
${presetExamples}

Create ${subjectForCategory(`${packName} ${category}`)}.
Use the preset list above to choose a more focused subject, environment, props, and composition that can represent the whole category.
The result should be a neutral reference image, but it must still clearly belong to this pack/category.
Portrait orientation, 2:3 vertical composition, designed for a 3:4 card crop.
Use varied materials, readable foreground/midground/background, and a stable main subject.
No text, no watermark, no logos, no UI, no labels.
Neutral baseline unless the category explicitly requires non-photographic art. Avoid applying any single preset too strongly.

ImageGen output size: 1024x1536
Aspect ratio: 2:3 (portrait)`;
}

const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : Number.POSITIVE_INFINITY;

await mkdir(categoryBasesDir, { recursive: true });
const health = await request<{ ok: boolean }>("/api/health");
if (!health.ok) throw new Error("Local studio server is not healthy.");

const projects = await request<Project[]>("/api/projects");
const projectId = projects[0]?.id;
const packs = await loadPacks();
const manifestByKey = new Map((await loadManifest()).map((entry) => [entry.key, entry]));

let generated = 0;
let skipped = 0;

for (const pack of packs) {
  const categories = Array.from(new Set(pack.presets.map((preset) => sanitizeCategory(preset.category))));
  for (const category of categories) {
    const key = styleCategoryImageKey(pack.id, category);
    const destination = path.join(categoryBasesDir, `${key}.png`);
    if (await exists(destination)) {
      skipped += 1;
      continue;
    }
    if (generated >= limit) break;

    console.log(`[base] ${pack.id} ${pack.name} / ${category}`);
    const categoryPresets = pack.presets.filter((preset) => sanitizeCategory(preset.category) === category);
    try {
      const created = await request<Job>("/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          projectId,
          kind: "codex_imagegen",
          prompt: buildCategoryPrompt(pack.name, category, categoryPresets),
        }),
      });

      await waitForJob(created.id);
      const asset = await newestAssetForJob(created.id);
      if (!asset) throw new Error(`Completed job ${created.id} has no asset in /api/assets`);

      await copyFile(asset.filePath, destination);
      await cleanupExternalJobArtifacts(created.id, asset.filePath);
      const repoFile = path.relative(rootDir, destination).replaceAll(path.sep, "/");
      manifestByKey.set(key, {
        packId: pack.id,
        packName: pack.name,
        category,
        key,
        file: repoFile,
        jobId: created.id,
        sourceAsset: repoFile,
        generatedAt: new Date().toISOString(),
      });
      await saveManifest(Array.from(manifestByKey.values()));
      generated += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[base-failed] ${pack.id} ${pack.name} / ${category}: ${message}`);
      await saveFailure({
        packId: pack.id,
        packName: pack.name,
        category,
        key,
        error: message,
        failedAt: new Date().toISOString(),
      });
    }
  }
  if (generated >= limit) break;
}

console.log(`[done] generated=${generated} skipped=${skipped} totalCategories=${packs.reduce((sum, pack) => sum + new Set(pack.presets.map((preset) => sanitizeCategory(preset.category))).size, 0)}`);
