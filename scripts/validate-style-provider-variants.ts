import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

import type { StyleDefaultManifestEntry } from '../lib/styleDefaultAssetPipeline';
import { defaultsDir, loadPacks, repoRelative } from './style-default-utils';

function argValue(name: string) {
  return process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1];
}

async function readJsonArray<T>(filePath: string): Promise<T[]> {
  try {
    const parsed = JSON.parse(await readFile(filePath, 'utf8')) as T[] | T;
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
) {
  let cursor = 0;
  async function runWorker() {
    for (;;) {
      const index = cursor;
      cursor += 1;
      const item = items[index];
      if (!item) return;
      await worker(item);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length || 1) }, () => runWorker()),
  );
}

const providerId = argValue('provider') ?? 'grok';
if (providerId !== 'grok') throw new Error('--provider currently supports only grok');

const allowIncomplete = process.argv.includes('--allow-incomplete');
const concurrency = Math.max(1, Number(argValue('concurrency') ?? 12));
const providerDir = path.join(defaultsDir, 'providers', providerId);
const packs = await loadPacks();
const expectedByPreset = new Map(
  packs.flatMap((pack) => pack.presets.map((preset) => [preset.id, { pack, preset }] as const)),
);
const expectedFileNames = new Set(
  [...expectedByPreset.keys()].map((presetId) => `${presetId}.webp`),
);
const actualFileNames = (await readdir(providerDir, { withFileTypes: true }).catch(() => []))
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.webp'))
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right));
const actualFileNameSet = new Set(actualFileNames);
const missing = [...expectedFileNames].filter((fileName) => !actualFileNameSet.has(fileName));
const unexpected = actualFileNames.filter((fileName) => !expectedFileNames.has(fileName));
const issues: string[] = [];

if (!allowIncomplete && missing.length > 0) {
  issues.push(
    `missing ${missing.length} provider variants; first=${missing.slice(0, 5).join(',')}`,
  );
}
if (unexpected.length > 0) {
  issues.push(`unexpected provider variants: ${unexpected.slice(0, 5).join(',')}`);
}

const manifestByPreset = new Map<string, StyleDefaultManifestEntry>();
let failureCount = 0;
for (const pack of packs) {
  const manifestPath = path.join(providerDir, `manifest-${pack.id}.json`);
  const entries = await readJsonArray<StyleDefaultManifestEntry>(manifestPath);
  for (const entry of entries) {
    if (manifestByPreset.has(entry.presetId)) {
      issues.push(`duplicate manifest entry for ${entry.presetId}`);
      continue;
    }
    manifestByPreset.set(entry.presetId, entry);
  }
  failureCount += (await readJsonArray<unknown>(path.join(providerDir, `failures-${pack.id}.json`)))
    .length;
}

for (const fileName of actualFileNames) {
  const presetId = path.parse(fileName).name;
  const entry = manifestByPreset.get(presetId);
  const expected = expectedByPreset.get(presetId);
  const exactFile = repoRelative(path.join(providerDir, fileName));
  if (!expected) continue;
  if (!entry) {
    issues.push(`${presetId} has an image but no manifest entry`);
    continue;
  }
  if (
    entry.providerId !== providerId ||
    entry.packId !== expected.pack.id ||
    entry.file !== exactFile ||
    entry.sourceAsset !== exactFile ||
    !entry.jobId ||
    !entry.model
  ) {
    issues.push(`${presetId} has invalid provider provenance`);
  }
}

for (const presetId of manifestByPreset.keys()) {
  if (!actualFileNameSet.has(`${presetId}.webp`)) {
    issues.push(`${presetId} has a manifest entry but no image`);
  }
}

await runWithConcurrency(actualFileNames, concurrency, async (fileName) => {
  const filePath = path.join(providerDir, fileName);
  const [info, metadata] = await Promise.all([stat(filePath), sharp(filePath).metadata()]);
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  const ratio = height > 0 ? width / height : 0;
  if (info.size <= 0 || metadata.format !== 'webp' || width < 384 || height < 512) {
    issues.push(`${fileName} is empty, undecodable, too small, or not WEBP`);
  } else if (Math.abs(ratio - 3 / 4) > 0.02) {
    issues.push(`${fileName} is not 3:4 (${width}x${height})`);
  }
});

if (failureCount > 0) issues.push(`${failureCount} generation failures remain recorded`);

console.log(
  `[style-provider-variants] provider=${providerId} expected=${expectedFileNames.size} images=${actualFileNames.length} manifests=${manifestByPreset.size} missing=${missing.length} failures=${failureCount}`,
);
for (const issue of issues.slice(0, 50)) console.error(`[style-provider-variants] ${issue}`);
if (issues.length > 50)
  console.error(`[style-provider-variants] ${issues.length - 50} more issues`);
if (issues.length > 0) process.exit(1);
