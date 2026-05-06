import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { Database } from "bun:sqlite";
import type { StylePack, StylePresetDef } from "../components/recipes/styles/types";
import { defaultsDir, loadPacks, rootDir, sanitizeCategory } from "./style-default-utils";

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

interface JobAssetRow {
  job_id: string;
  final_prompt_used: string;
  status: string;
  file_path: string;
  asset_created_at: string;
}

const libraryDir = process.env.STUDIO_LIBRARY_DIR || "D:\\AI-Studio-Library";
const dbPath = path.join(libraryDir, "library.sqlite");
const dryRun = process.argv.includes("--dry-run");
const sinceArg = process.argv.find((arg) => arg.startsWith("--since="))?.slice("--since=".length);
const sinceTime = sinceArg ? Date.parse(sinceArg) : Number.NEGATIVE_INFINITY;
const reconciledModel = process.env.CODEX_IMAGEGEN_MODEL || "gpt-5.4";
const reconciledReasoningEffort = process.env.CODEX_IMAGEGEN_REASONING_EFFORT || "low";

function manifestPathForPack(packId: string) {
  return path.join(defaultsDir, `manifest-${packId}.json`);
}

async function exists(filePath: string) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
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

function buildPresetIndex(packs: StylePack[]) {
  const byTarget = new Map<string, { pack: StylePack; preset: StylePresetDef }>();
  const byName = new Map<string, { pack: StylePack; preset: StylePresetDef }[]>();

  for (const pack of packs) {
    for (const preset of pack.presets) {
      byTarget.set(preset.name.toUpperCase(), { pack, preset });
      const list = byName.get(preset.name) || [];
      list.push({ pack, preset });
      byName.set(preset.name, list);
    }
  }

  return { byTarget, byName };
}

function resolvePreset(row: JobAssetRow, index: ReturnType<typeof buildPresetIndex>) {
  const target = row.final_prompt_used.match(/TARGET STYLE:\s*([^\n]+)/i)?.[1]?.trim().toUpperCase();
  if (target && index.byTarget.has(target)) return index.byTarget.get(target);

  const explicit = row.final_prompt_used.match(/Make the result immediately recognizable as "([^"]+)"/i)?.[1]?.trim();
  if (explicit) {
    const matches = index.byName.get(explicit);
    if (matches?.length === 1) return matches[0];
  }

  return undefined;
}

await mkdir(defaultsDir, { recursive: true });

const packs = await loadPacks();
const index = buildPresetIndex(packs);
const db = new Database(dbPath, { readonly: true });
const rows = db
  .query(`
    SELECT
      jobs.id AS job_id,
      jobs.final_prompt_used,
      jobs.status,
      assets.file_path,
      assets.created_at AS asset_created_at
    FROM assets
    JOIN jobs ON jobs.id = assets.job_id
    WHERE jobs.kind = 'codex_imagegen'
      AND jobs.final_prompt_used LIKE '%TARGET STYLE:%'
      AND assets.deleted_at IS NULL
    ORDER BY assets.created_at ASC
  `)
  .all() as JobAssetRow[];

const manifestByPack = new Map<string, Map<string, ManifestEntry>>();
for (const pack of packs) {
  manifestByPack.set(pack.id, new Map((await loadManifest(pack.id)).map((entry) => [entry.presetId, entry])));
}

let copied = 0;
let skippedExisting = 0;
let unresolved = 0;
const unresolvedRows: Pick<JobAssetRow, "job_id" | "file_path" | "status">[] = [];
const latestByPreset = new Map<string, { pack: StylePack; preset: StylePresetDef; row: JobAssetRow }>();

for (const row of rows) {
  if (Date.parse(row.asset_created_at) < sinceTime) continue;
  const resolved = resolvePreset(row, index);
  if (!resolved) {
    unresolved += 1;
    unresolvedRows.push({ job_id: row.job_id, file_path: row.file_path, status: row.status });
    continue;
  }

  const { pack, preset } = resolved;
  const current = latestByPreset.get(preset.id);
  if (!current || Date.parse(row.asset_created_at) > Date.parse(current.row.asset_created_at)) {
    latestByPreset.set(preset.id, { pack, preset, row });
  }
}

for (const { pack, preset, row } of latestByPreset.values()) {
  const destination = path.join(defaultsDir, `${preset.id}.png`);
  const manifest = manifestByPack.get(pack.id);
  if (!manifest) continue;

  if (await exists(destination)) {
    skippedExisting += 1;
    if (!manifest.has(preset.id)) {
      manifest.set(preset.id, {
        presetId: preset.id,
        presetName: preset.name,
        packId: pack.id,
        packName: pack.name,
        category: sanitizeCategory(preset.category),
        file: path.relative(rootDir, destination).replaceAll(path.sep, "/"),
        jobId: row.job_id,
        sourceAsset: row.file_path,
        generationMode: "text-to-image",
        model: reconciledModel,
        reasoningEffort: reconciledReasoningEffort,
        generatedAt: row.asset_created_at,
      });
    }
    continue;
  }

  console.log(`[copy] ${preset.id} ${pack.id} ${preset.name} <- ${path.basename(row.file_path)}`);
  if (!dryRun) await copyFile(row.file_path, destination);
  manifest.set(preset.id, {
    presetId: preset.id,
    presetName: preset.name,
    packId: pack.id,
    packName: pack.name,
    category: sanitizeCategory(preset.category),
    file: path.relative(rootDir, destination).replaceAll(path.sep, "/"),
    jobId: row.job_id,
    sourceAsset: row.file_path,
    generationMode: "text-to-image",
    model: reconciledModel,
    reasoningEffort: reconciledReasoningEffort,
    generatedAt: row.asset_created_at,
  });
  copied += 1;
}

if (!dryRun) {
  for (const [packId, manifest] of manifestByPack) {
    if (manifest.size > 0) await saveManifest(packId, Array.from(manifest.values()));
  }
}

console.log(`[done] rows=${rows.length} considered=${latestByPreset.size} copied=${copied} skippedExisting=${skippedExisting} unresolved=${unresolved} dryRun=${dryRun} since=${sinceArg || "all"}`);
if (unresolvedRows.length > 0) {
  console.log(JSON.stringify(unresolvedRows.slice(0, 20), null, 2));
}
