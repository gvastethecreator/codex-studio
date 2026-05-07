import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { Database } from 'bun:sqlite';
import type { StylePack, StylePresetDef } from '../components/recipes/styles/types';
import {
  RECIPE_ASSET_EXTENSION,
  defaultCodexHome,
  defaultStudioLibraryDir,
  defaultsDir,
  loadPacks,
  repoRelative,
  sanitizeCategory,
  writeRepoWebpAsset,
} from './style-default-utils';

interface ManifestEntry {
  presetId: string;
  presetName: string;
  packId: string;
  packName: string;
  category: string;
  file: string;
  jobId: string;
  sourceAsset: string;
  generationMode: 'text-to-image';
  model: string;
  reasoningEffort: string;
  generatedAt: string;
}

interface JobRow {
  id: string;
  final_prompt_used: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TranscriptImage {
  jobId: string;
  threadId: string;
  imageId: string;
  filePath: string;
  createdAt: string;
}

const libraryDir = process.env.STUDIO_LIBRARY_DIR || defaultStudioLibraryDir;
const dbPath = path.join(libraryDir, 'library.sqlite');
const transcriptDir = path.join(libraryDir, 'transcripts');
const codexHome = process.env.CODEX_HOME || defaultCodexHome;
const generatedImagesDir = path.join(codexHome, 'generated_images');
const dryRun = process.argv.includes('--dry-run');
const force = process.argv.includes('--force');
const recoveredReportPath = path.join(defaultsDir, 'cache-recovery-report.json');
const model = process.env.CODEX_IMAGEGEN_MODEL || 'gpt-5.4-mini';
const reasoningEffort = process.env.CODEX_IMAGEGEN_REASONING_EFFORT || 'low';

function manifestPathForPack(packId: string) {
  return path.join(defaultsDir, `manifest-${packId}.json`);
}

async function loadManifest(packId: string) {
  try {
    const parsed = JSON.parse(await readFile(manifestPathForPack(packId), 'utf8')) as
      | ManifestEntry[]
      | ManifestEntry;
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

async function saveManifest(packId: string, entries: ManifestEntry[]) {
  entries.sort((a, b) => a.presetId.localeCompare(b.presetId));
  await writeFile(manifestPathForPack(packId), `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
}

function buildPresetIndex(packs: StylePack[]) {
  const byTarget = new Map<string, { pack: StylePack; preset: StylePresetDef }[]>();
  const byPackCategoryTarget = new Map<string, { pack: StylePack; preset: StylePresetDef }>();
  const byName = new Map<string, { pack: StylePack; preset: StylePresetDef }[]>();

  for (const pack of packs) {
    for (const preset of pack.presets) {
      const target = preset.name.toUpperCase();
      const category = sanitizeCategory(preset.category).toLowerCase();
      const packName = pack.name.toLowerCase();
      const targetList = byTarget.get(target) || [];
      targetList.push({ pack, preset });
      byTarget.set(target, targetList);
      byPackCategoryTarget.set(`${packName}::${category}::${target}`, { pack, preset });
      const nameList = byName.get(preset.name) || [];
      nameList.push({ pack, preset });
      byName.set(preset.name, nameList);
    }
  }

  return { byTarget, byPackCategoryTarget, byName };
}

function resolvePreset(finalPrompt: string, index: ReturnType<typeof buildPresetIndex>) {
  const target = finalPrompt
    .match(/TARGET STYLE:\s*([^\n]+)/i)?.[1]
    ?.trim()
    .toUpperCase();
  const packName = finalPrompt
    .match(/^PACK:\s*(.+)$/im)?.[1]
    ?.trim()
    .toLowerCase();
  const category = finalPrompt
    .match(/^CATEGORY:\s*(.+)$/im)?.[1]
    ?.trim()
    .toLowerCase();

  if (target && packName && category) {
    const exact = index.byPackCategoryTarget.get(`${packName}::${category}::${target}`);
    if (exact) return exact;
  }

  if (target) {
    const matches = index.byTarget.get(target);
    if (matches?.length === 1) return matches[0];
  }

  const explicit = finalPrompt
    .match(/Make the result immediately recognizable as "([^"]+)"/i)?.[1]
    ?.trim();
  if (explicit) {
    const matches = index.byName.get(explicit);
    if (matches?.length === 1) return matches[0];
  }

  return undefined;
}

async function readTranscriptImage(jobId: string): Promise<TranscriptImage | null> {
  const eventsPath = path.join(transcriptDir, jobId, 'events.jsonl');
  if (!existsSync(eventsPath)) return null;

  const lines = (await readFile(eventsPath, 'utf8')).split(/\r?\n/).filter(Boolean);
  let threadId: string | null = null;
  let imageId: string | null = null;

  for (const line of lines) {
    let event: any;
    try {
      event = JSON.parse(line);
    } catch {
      continue;
    }
    const item = event.params?.item;
    if (item?.type !== 'imageGeneration' || !item.id) continue;
    threadId = event.params?.threadId || threadId;
    imageId = item.id;
  }

  if (!threadId || !imageId) return null;
  const filePath = path.join(generatedImagesDir, threadId, `${imageId}.png`);
  if (!existsSync(filePath)) return null;
  const stats = await stat(filePath);
  return {
    jobId,
    threadId,
    imageId,
    filePath,
    createdAt: stats.mtime.toISOString(),
  };
}

await mkdir(defaultsDir, { recursive: true });

const packs = await loadPacks();
const index = buildPresetIndex(packs);
const db = new Database(dbPath, { readonly: true });
const jobs = db
  .query(
    `
    SELECT id, final_prompt_used, status, created_at, updated_at
    FROM jobs
    WHERE kind = 'codex_imagegen'
      AND final_prompt_used LIKE '%TARGET STYLE:%'
    ORDER BY created_at ASC
  `,
  )
  .all() as JobRow[];

const manifestByPack = new Map<string, Map<string, ManifestEntry>>();
for (const pack of packs) {
  manifestByPack.set(
    pack.id,
    new Map((await loadManifest(pack.id)).map((entry) => [entry.presetId, entry])),
  );
}

const latestByPreset = new Map<
  string,
  { pack: StylePack; preset: StylePresetDef; job: JobRow; image: TranscriptImage }
>();
const unresolved: Array<{ jobId: string; status: string; reason: string }> = [];

for (const job of jobs) {
  const resolved = resolvePreset(job.final_prompt_used, index);
  if (!resolved) {
    unresolved.push({ jobId: job.id, status: job.status, reason: 'preset_not_resolved' });
    continue;
  }

  const image = await readTranscriptImage(job.id);
  if (!image) {
    unresolved.push({ jobId: job.id, status: job.status, reason: 'cache_image_not_found' });
    continue;
  }

  const current = latestByPreset.get(resolved.preset.id);
  if (!current || Date.parse(image.createdAt) > Date.parse(current.image.createdAt)) {
    latestByPreset.set(resolved.preset.id, { ...resolved, job, image });
  }
}

let copied = 0;
let skippedExisting = 0;
let refreshedManifest = 0;

for (const { pack, preset, job, image } of latestByPreset.values()) {
  const destination = path.join(defaultsDir, `${preset.id}${RECIPE_ASSET_EXTENSION}`);
  const manifest = manifestByPack.get(pack.id);
  if (!manifest) continue;

  if (!force && existsSync(destination)) {
    skippedExisting += 1;
    if (!manifest.has(preset.id)) {
      const repoFile = repoRelative(destination);
      manifest.set(preset.id, {
        presetId: preset.id,
        presetName: preset.name,
        packId: pack.id,
        packName: pack.name,
        category: sanitizeCategory(preset.category),
        file: repoFile,
        jobId: job.id,
        sourceAsset: repoFile,
        generationMode: 'text-to-image',
        model,
        reasoningEffort,
        generatedAt: image.createdAt,
      });
      refreshedManifest += 1;
    }
    continue;
  }

  console.log(`[recover] ${preset.id} ${pack.id} ${preset.name} <- ${image.filePath}`);
  if (!dryRun) await writeRepoWebpAsset(image.filePath, destination);
  const repoFile = repoRelative(destination);
  manifest.set(preset.id, {
    presetId: preset.id,
    presetName: preset.name,
    packId: pack.id,
    packName: pack.name,
    category: sanitizeCategory(preset.category),
    file: repoFile,
    jobId: job.id,
    sourceAsset: repoFile,
    generationMode: 'text-to-image',
    model,
    reasoningEffort,
    generatedAt: image.createdAt,
  });
  copied += 1;
}

if (!dryRun) {
  for (const [packId, manifest] of manifestByPack) {
    if (manifest.size > 0) await saveManifest(packId, Array.from(manifest.values()));
  }

  await writeFile(
    recoveredReportPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        jobs: jobs.length,
        recoverablePresets: latestByPreset.size,
        copied,
        skippedExisting,
        refreshedManifest,
        unresolved,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
}

console.log(
  `[done] jobs=${jobs.length} recoverablePresets=${latestByPreset.size} copied=${copied} skippedExisting=${skippedExisting} refreshedManifest=${refreshedManifest} unresolved=${unresolved.length} dryRun=${dryRun} force=${force}`,
);
