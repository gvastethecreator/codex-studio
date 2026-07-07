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
const defaultConcurrency = 8;

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

function argValue(name: string) {
  return process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1];
}

function parseConcurrency() {
  const raw = argValue('concurrency') ?? process.env.STYLE_THUMBNAIL_CONCURRENCY;
  const parsed = raw ? Number(raw) : defaultConcurrency;
  if (!Number.isFinite(parsed) || parsed < 1) return defaultConcurrency;
  return Math.max(1, Math.floor(parsed));
}

function packIdFromOutputName(outputName: string) {
  const categoryMatch = outputName.match(/^(pack_\d+)__/i);
  if (categoryMatch) return categoryMatch[1].toLowerCase();

  const presetMatch = outputName.match(/^SP(\d{2})-\d{3}/i);
  if (presetMatch) return `pack_${presetMatch[1]}`;

  return 'unknown';
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

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
) {
  const results: R[] = [];
  let nextIndex = 0;

  async function runWorker() {
    for (;;) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      const item = items[currentIndex];
      if (!item) break;
      results[currentIndex] = await worker(item);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker());
  await Promise.all(workers);
  return results;
}

async function buildOutputManifest() {
  const files = await listWebpFiles(outputDir);
  const entries = await Promise.all(
    files.map(async (fileName) => {
      const filePath = path.join(outputDir, fileName);
      const info = await stat(filePath);
      return {
        fileName,
        packId: packIdFromOutputName(fileName),
        bytes: info.size,
      };
    }),
  );

  return {
    generatedAt: new Date().toISOString(),
    size: {
      width: thumbnailWidth,
      height: thumbnailHeight,
    },
    count: entries.length,
    totalBytes: entries.reduce((total, entry) => total + entry.bytes, 0),
    packs: Object.fromEntries(
      [...new Set(entries.map((entry) => entry.packId))]
        .sort()
        .map((packId) => [packId, entries.filter((entry) => entry.packId === packId).length]),
    ),
  };
}

async function main() {
  assertSafeOutputDir();

  const packFilter = argValue('pack');
  const concurrency = parseConcurrency();
  const allJobs = [
    ...(await collectCategoryJobs()),
    ...(await collectDefaultJobs()),
    ...(await collectVariantJobs()),
  ].sort((left, right) => left.outputName.localeCompare(right.outputName));
  const jobs = packFilter ? allJobs.filter((job) => job.packId === packFilter) : allJobs;

  await mkdir(outputDir, { recursive: true });
  if (!packFilter) {
    await rm(outputDir, { recursive: true, force: true });
    await mkdir(outputDir, { recursive: true });
  }

  await runWithConcurrency(jobs, concurrency, writeThumbnail);

  const manifest = await buildOutputManifest();

  await writeFile(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(
    `[style-card-thumbs] wrote ${jobs.length} requested / ${manifest.count} total thumbnails (${Math.round(
      manifest.totalBytes / 1024,
    )} KB) to ${path.relative(rootDir, outputDir)} concurrency=${concurrency}${packFilter ? ` pack=${packFilter}` : ''}`,
  );
}

await main();
