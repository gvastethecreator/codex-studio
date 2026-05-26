import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { StyleRuntimePack } from '../components/recipes/styles/runtimeTypes';
import {
  defaultsDir,
  loadPacks,
  RECIPE_ASSET_EXTENSION,
  repoRelative,
  sanitizeCategory,
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

function manifestPathForPack(packId: string) {
  return path.join(defaultsDir, `manifest-${packId}.json`);
}

function failuresPathForPack(packId: string) {
  return path.join(defaultsDir, `failures-${packId}.json`);
}

async function loadManifest(packId: string) {
  try {
    const parsed = JSON.parse(
      await readFile(manifestPathForPack(packId), 'utf8'),
    ) as ManifestEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function loadFailures(packId: string) {
  try {
    const parsed = JSON.parse(await readFile(failuresPathForPack(packId), 'utf8')) as any[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function argValue(name: string) {
  return process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1];
}

async function exists(filePath: string) {
  try {
    return await stat(filePath);
  } catch {
    return null;
  }
}

function recoveredEntry(
  pack: StyleRuntimePack,
  preset: StyleRuntimePack['presets'][number],
  file: string,
  mtime: Date,
) {
  const repoFile = repoRelative(file);
  return {
    presetId: preset.id,
    presetName: preset.name,
    packId: pack.id,
    packName: pack.name,
    category: sanitizeCategory(preset.category),
    file: repoFile,
    jobId: 'recovered-local-file',
    sourceAsset: repoFile,
    generationMode: 'text-to-image' as const,
    model: 'recovered-local-file',
    reasoningEffort: 'unknown',
    generatedAt: mtime.toISOString(),
  };
}

async function main() {
  const packFilter = argValue('pack');
  const packs = (await loadPacks()).filter((pack) => !packFilter || pack.id === packFilter);

  for (const pack of packs) {
    const manifest = await loadManifest(pack.id);
    const manifestByPreset = new Map(manifest.map((entry) => [entry.presetId, entry]));
    const nextManifest: ManifestEntry[] = [];

    for (const preset of pack.presets) {
      const file = path.join(defaultsDir, `${preset.id}${RECIPE_ASSET_EXTENSION}`);
      const fileStat = await exists(file);
      if (!fileStat) continue;

      const existing = manifestByPreset.get(preset.id);
      if (existing) {
        nextManifest.push({
          ...existing,
          presetName: preset.name,
          packName: pack.name,
          category: sanitizeCategory(preset.category),
          file: repoRelative(file),
          sourceAsset: repoRelative(file),
        });
        continue;
      }

      nextManifest.push(recoveredEntry(pack, preset, file, fileStat.mtime));
    }

    nextManifest.sort((a, b) => a.presetId.localeCompare(b.presetId));
    await writeFile(
      manifestPathForPack(pack.id),
      `${JSON.stringify(nextManifest, null, 2)}\n`,
      'utf8',
    );

    const failures = await loadFailures(pack.id);
    const remainingFailures = failures.filter((entry) => {
      const presetId = typeof entry?.presetId === 'string' ? entry.presetId : '';
      if (!presetId) return true;
      return !nextManifest.some((item) => item.presetId === presetId);
    });
    await writeFile(
      failuresPathForPack(pack.id),
      `${JSON.stringify(remainingFailures, null, 2)}\n`,
      'utf8',
    );

    console.log(
      `[sync] ${pack.id} manifest=${nextManifest.length} failures=${remainingFailures.length}`,
    );
  }
}

await main();
