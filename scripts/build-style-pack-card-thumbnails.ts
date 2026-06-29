import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const rootDir = path.resolve(import.meta.dir, '..');
const categoryBasesDir = path.join(rootDir, 'assets', 'recipes', 'styles', 'category-bases');
const defaultsDir = path.join(rootDir, 'assets', 'recipes', 'styles', 'defaults');
const variantsDir = path.join(defaultsDir, 'variants');
const outputDir = path.join(rootDir, 'assets', 'recipes', 'styles', 'style-card-thumbnails');
const thumbnailWidth = 384;
const thumbnailHeight = 512;

interface ThumbnailJob {
  sourcePath: string;
  outputName: string;
  kind: 'category' | 'default' | 'variant';
  packId: string;
}

interface ThumbnailResult extends ThumbnailJob {
  outputPath: string;
  bytes: number;
}

function assertSafeOutputDir() {
  const resolvedOutputDir = path.resolve(outputDir);
  const resolvedStylesDir = path.resolve(rootDir, 'assets', 'recipes', 'styles');
  if (!resolvedOutputDir.startsWith(`${resolvedStylesDir}${path.sep}`)) {
    throw new Error(`Refusing to write thumbnails outside style assets: ${resolvedOutputDir}`);
  }
}

async function listWebpFiles(dir: string) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.webp'))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

async function collectCategoryJobs(): Promise<ThumbnailJob[]> {
  const files = await listWebpFiles(categoryBasesDir);
  return files.flatMap((fileName) => {
    const match = fileName.match(/^(pack_\d+)__/i);
    if (!match) return [];
    return [
      {
        sourcePath: path.join(categoryBasesDir, fileName),
        outputName: fileName.toLowerCase(),
        kind: 'category' as const,
        packId: match[1],
      },
    ];
  });
}

async function collectDefaultJobs(): Promise<ThumbnailJob[]> {
  const files = await listWebpFiles(defaultsDir);
  return files.flatMap((fileName) => {
    const match = fileName.match(/^SP(\d{2})-\d{3}\.webp$/i);
    if (!match) return [];

    const packId = `pack_${match[1]}`;
    return [
      {
        sourcePath: path.join(defaultsDir, fileName),
        outputName: fileName,
        kind: 'default' as const,
        packId,
      },
    ];
  });
}

async function collectVariantJobs(): Promise<ThumbnailJob[]> {
  const files = await listWebpFiles(variantsDir);
  return files.flatMap((fileName) => {
    const match = fileName.match(/^SP(\d{2})-\d{3}-\d{2}\.webp$/i);
    if (!match) return [];

    const packId = `pack_${match[1]}`;
    return [
      {
        sourcePath: path.join(variantsDir, fileName),
        outputName: fileName,
        kind: 'variant' as const,
        packId,
      },
    ];
  });
}

async function writeThumbnail(job: ThumbnailJob): Promise<ThumbnailResult> {
  const outputPath = path.join(outputDir, job.outputName);
  await sharp(job.sourcePath, { failOn: 'none' })
    .resize({
      width: thumbnailWidth,
      height: thumbnailHeight,
      fit: 'cover',
      position: 'attention',
      withoutEnlargement: true,
    })
    .webp({
      quality: 74,
      effort: 4,
      smartSubsample: true,
    })
    .toFile(outputPath);

  const info = await stat(outputPath);
  return {
    ...job,
    outputPath,
    bytes: info.size,
  };
}

async function main() {
  assertSafeOutputDir();

  const jobs = [
    ...(await collectCategoryJobs()),
    ...(await collectDefaultJobs()),
    ...(await collectVariantJobs()),
  ].sort((left, right) => left.outputName.localeCompare(right.outputName));

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  const results: ThumbnailResult[] = [];
  for (const job of jobs) {
    results.push(await writeThumbnail(job));
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    size: {
      width: thumbnailWidth,
      height: thumbnailHeight,
    },
    count: results.length,
    totalBytes: results.reduce((total, result) => total + result.bytes, 0),
    packs: Object.fromEntries(
      [...new Set(results.map((result) => result.packId))]
        .sort()
        .map((packId) => [packId, results.filter((result) => result.packId === packId).length]),
    ),
  };

  await writeFile(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(
    `[style-card-thumbs] wrote ${manifest.count} thumbnails (${Math.round(
      manifest.totalBytes / 1024,
    )} KB) to ${path.relative(rootDir, outputDir)}`,
  );
}

await main();
