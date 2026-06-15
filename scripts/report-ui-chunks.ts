import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

export interface UiChunkInfo {
  name: string;
  bytes: number;
  gzipBytes: number;
}

export interface UiChunkBudget {
  id: string;
  pattern: RegExp;
  maxBytes: number;
  required?: boolean;
  note: string;
}

export interface UiChunkBudgetResult {
  budget: UiChunkBudget;
  chunk: UiChunkInfo | null;
  ok: boolean;
  reason?: string;
}

export interface UiChunkReport {
  distDir: string;
  chunks: UiChunkInfo[];
  budgetResults: UiChunkBudgetResult[];
  unbudgetedLargeChunks: UiChunkInfo[];
  ok: boolean;
}

const DEFAULT_DIST_DIR = path.join(process.cwd(), 'dist', 'assets');
const KIB = 1024;
const LARGE_CHUNK_BYTES = 500 * KIB;

export const uiChunkBudgets: UiChunkBudget[] = [
  {
    id: 'main-index',
    pattern: /^index-[\w-]+\.js$/,
    maxBytes: 500 * KIB,
    required: true,
    note: 'Main startup shell should stay below Vite large chunk warning.',
  },
  {
    id: 'styles-recipe',
    pattern: /^StylesRecipe-[\w-]+\.js$/,
    maxBytes: 80 * KIB,
    required: true,
    note: 'Styles UI should import pack summaries only.',
  },
  {
    id: 'style-catalog-search-surface',
    pattern: /^StylePresetCatalogSearchSurface-[\w-]+\.js$/,
    maxBytes: 20 * KIB,
    required: true,
    note: 'Catalog search surface should be a small UI shell.',
  },
  {
    id: 'style-catalog-data-shell',
    pattern: /^stylePresetCatalogData-[\w-]+\.js$/,
    maxBytes: 32 * KIB,
    note: 'Full YAML catalog data should be absent from app startup/search; if present, keep it tiny.',
  },
  {
    id: 'style-catalog-pack-data',
    pattern: /^stylePresetCatalogData\.pack_[\w-]+-[\w-]+\.js$/,
    maxBytes: 32 * KIB,
    note: 'If full YAML pack loaders enter the app build, the largest pack glob map stays bounded.',
  },
  {
    id: 'camera-recipe',
    pattern: /^CameraAnglesRecipe-[\w-]+\.js$/,
    maxBytes: 40 * KIB,
    required: true,
    note: 'Camera UI should not statically import Three.js.',
  },
  {
    id: 'three-demand-chunk',
    pattern: /^three\.module-[\w-]+\.js$/,
    maxBytes: 800 * KIB,
    required: true,
    note: 'Three.js is allowed only as a demand-loaded Camera viewport chunk.',
  },
  {
    id: 'zip-export-demand-chunk',
    pattern: /^jszip\.min-[\w-]+\.js$/,
    maxBytes: 120 * KIB,
    required: true,
    note: 'ZIP export should stay out of startup and load only on export.',
  },
];

function formatKib(bytes: number) {
  return `${(bytes / KIB).toFixed(2)} KB`;
}

function parseArgs(args: string[]) {
  const options = {
    distDir: DEFAULT_DIST_DIR,
    verify: false,
    json: false,
  };

  for (const arg of args) {
    if (arg === '--verify') options.verify = true;
    else if (arg === '--json') options.json = true;
    else if (arg.startsWith('--dist=')) options.distDir = path.resolve(arg.slice('--dist='.length));
  }

  return options;
}

async function fileExists(filePath: string) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function listUiChunks(distDir = DEFAULT_DIST_DIR): Promise<UiChunkInfo[]> {
  if (!(await fileExists(distDir))) {
    throw new Error(`Missing UI dist assets directory: ${distDir}`);
  }

  const entries = await readdir(distDir, { withFileTypes: true });
  const chunkPromises: Promise<UiChunkInfo>[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const filePath = path.join(distDir, entry.name);
    chunkPromises.push(
      Bun.file(filePath)
        .arrayBuffer()
        .then((source) => ({
          name: entry.name,
          bytes: source.byteLength,
          gzipBytes: gzipSync(Buffer.from(source)).byteLength,
        })),
    );
  }
  const chunks = await Promise.all(chunkPromises);

  return chunks.sort((a, b) => b.bytes - a.bytes || a.name.localeCompare(b.name));
}

function matchBudget(chunks: UiChunkInfo[], budget: UiChunkBudget) {
  return chunks.find((chunk) => budget.pattern.test(chunk.name)) ?? null;
}

export function createUiChunkReport(
  chunks: UiChunkInfo[],
  distDir = DEFAULT_DIST_DIR,
): UiChunkReport {
  const budgetResults = uiChunkBudgets.map((budget): UiChunkBudgetResult => {
    const chunk = matchBudget(chunks, budget);
    if (!chunk) {
      return {
        budget,
        chunk,
        ok: !budget.required,
        reason: budget.required ? 'missing required chunk' : undefined,
      };
    }

    const ok = chunk.bytes <= budget.maxBytes;
    return {
      budget,
      chunk,
      ok,
      reason: ok ? undefined : `${formatKib(chunk.bytes)} exceeds ${formatKib(budget.maxBytes)}`,
    };
  });

  const budgetedNames = new Set(
    budgetResults.flatMap((result) => (result.chunk ? [result.chunk.name] : [])),
  );
  const unbudgetedLargeChunks = chunks.filter(
    (chunk) => chunk.bytes > LARGE_CHUNK_BYTES && !budgetedNames.has(chunk.name),
  );

  return {
    distDir,
    chunks,
    budgetResults,
    unbudgetedLargeChunks,
    ok: budgetResults.every((result) => result.ok) && unbudgetedLargeChunks.length === 0,
  };
}

export async function createUiChunkReportFromDist(distDir = DEFAULT_DIST_DIR) {
  const chunks = await listUiChunks(distDir);
  return createUiChunkReport(chunks, distDir);
}

function printReport(report: UiChunkReport) {
  const totalBytes = report.chunks.reduce((sum, chunk) => sum + chunk.bytes, 0);
  console.log(
    `[ui:chunks] chunks=${report.chunks.length} total=${formatKib(totalBytes)} dist=${report.distDir}`,
  );

  for (const result of report.budgetResults) {
    const chunkLabel = result.chunk
      ? `${result.chunk.name} size=${formatKib(result.chunk.bytes)} gzip=${formatKib(result.chunk.gzipBytes)}`
      : 'missing';
    const status = result.ok ? 'ok' : 'fail';
    console.log(
      `[ui:chunks] ${status} ${result.budget.id} ${chunkLabel} max=${formatKib(result.budget.maxBytes)}`,
    );
  }

  for (const chunk of report.unbudgetedLargeChunks) {
    console.error(
      `[ui:chunks] fail unbudgeted-large ${chunk.name} size=${formatKib(chunk.bytes)} gzip=${formatKib(chunk.gzipBytes)}`,
    );
  }
}

if (import.meta.main) {
  const options = parseArgs(Bun.argv.slice(2));
  const report = await createUiChunkReportFromDist(options.distDir);

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report);
  }

  if (options.verify && !report.ok) {
    process.exitCode = 1;
  }
}
