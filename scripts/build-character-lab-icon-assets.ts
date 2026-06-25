import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const repoRoot = process.cwd();
const assetDir = path.join(repoRoot, 'assets', 'recipes', 'character-lab');
const sourcePath = path.join(assetDir, 'character-lab-control-atlas.source.json');
const manifestPath = path.join(assetDir, 'character-lab-control-atlas.manifest.json');
const reportPath = path.join(assetDir, 'character-lab-control-atlas.report.json');
const runtimeAtlasPath = path.join(assetDir, 'character-lab-control-atlas.png');
const source512Dir = path.join(assetDir, 'sources', 'mannequin-v1-512');
const qaPath = path.join(assetDir, 'character-lab-icon-assets.qa.json');

const sourceFrameDir = path.join(
  repoRoot,
  '.tmp',
  'character-lab',
  'mannequin-v1-atlas-run',
  'source-frames-512',
);

const SOURCE_CELL = 512;
const RUNTIME_CELL = 128;
const RUNTIME_COLUMNS = 16;
const RUNTIME_CONTENT_BOX = 112;
const VISIBLE_THRESHOLD = 18;
const SOURCE_PADDING = 8;
const EDGE_ARTIFACT_VISIBLE_THRESHOLD = 24;
const EDGE_ARTIFACT_MARGIN_RATIO = 0.012;
const EDGE_ARTIFACT_AREA_RATIO = 0.006;

interface IconItem {
  id: string;
  label: string;
  mode?: string;
  accent?: string;
}

interface IconBatch {
  batchId: string;
  row: number;
  image: string;
  items: IconItem[];
}

interface SourceFrameRecord {
  sourceImage: string;
  sourceCrop: { x: number; y: number; w: number; h: number };
  sourceRow: number;
  sourceColumn: number;
  workFrame: string;
  runtimeFrame: string;
  label: string;
}

interface SourceContract {
  version: number;
  tool: string;
  artDirection: string;
  styleContract: unknown;
  sourceImageDirectory: string;
  sourceImages: string[];
  sourceGrid: unknown;
  workFrames: { cellSize: number; directory: string };
  outputGrid: {
    columns: number;
    rows: number;
    cellSize: number;
    frameCount: number;
    contentFit: {
      visibleThreshold: number;
      contentBox: number;
      edgeArtifactVisibleThreshold?: number;
      edgeArtifactMarginRatio?: number;
      edgeArtifactAreaRatio?: number;
    };
  };
  atlas: { path: string; size: [number, number]; sha256: string };
  batches: IconBatch[];
  frames: Record<string, SourceFrameRecord>;
  sourceImages512?: string[];
  qa?: unknown;
}

interface AtlasManifest {
  image: string;
  cellSize: number;
  columns: number;
  rows: number;
  frameCount: number;
  artDirection: string;
  source: string;
  builderReport: string;
  frames: Record<string, { x: number; y: number; w: number; h: number }>;
}

interface RawImage {
  data: Buffer;
  info: sharp.OutputInfo;
}

interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

interface ComponentBounds extends Bounds {
  area: number;
}

function relativePath(filePath: string) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, '/');
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, 'utf8')) as T;
}

async function writeJson(filePath: string, value: unknown) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function sha256(filePath: string) {
  const data = await readFile(filePath);
  return createHash('sha256').update(data).digest('hex');
}

function visibleBounds(raw: RawImage, threshold = VISIBLE_THRESHOLD): Bounds | null {
  const { data, info } = raw;
  const channels = info.channels;
  let left = info.width;
  let top = info.height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const index = (y * info.width + x) * channels;
      const alpha = channels >= 4 ? data[index + 3] : 255;
      const visible =
        alpha > 0 &&
        (data[index] > threshold || data[index + 1] > threshold || data[index + 2] > threshold);

      if (!visible) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }

  if (right === -1 || bottom === -1) return null;
  return {
    left,
    top,
    right,
    bottom,
    width: right - left + 1,
    height: bottom - top + 1,
  };
}

function pixelIsVisible(raw: RawImage, x: number, y: number, threshold = VISIBLE_THRESHOLD) {
  const { data, info } = raw;
  const index = (y * info.width + x) * info.channels;
  const alpha = info.channels >= 4 ? data[index + 3] : 255;
  return (
    alpha > 0 &&
    (data[index] > threshold || data[index + 1] > threshold || data[index + 2] > threshold)
  );
}

function collectVisibleComponents(raw: RawImage, threshold = VISIBLE_THRESHOLD): ComponentBounds[] {
  const { info } = raw;
  const visited = new Uint8Array(info.width * info.height);
  const components: ComponentBounds[] = [];
  const stack: number[] = [];

  for (let startY = 0; startY < info.height; startY += 1) {
    for (let startX = 0; startX < info.width; startX += 1) {
      const startIndex = startY * info.width + startX;
      if (visited[startIndex] || !pixelIsVisible(raw, startX, startY, threshold)) continue;

      let left = startX;
      let right = startX;
      let top = startY;
      let bottom = startY;
      let area = 0;

      visited[startIndex] = 1;
      stack.push(startIndex);

      while (stack.length > 0) {
        const current = stack.pop()!;
        const x = current % info.width;
        const y = Math.floor(current / info.width);
        area += 1;
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;

        const neighbors = [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1],
        ] as const;
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || ny < 0 || nx >= info.width || ny >= info.height) continue;
          const neighborIndex = ny * info.width + nx;
          if (visited[neighborIndex] || !pixelIsVisible(raw, nx, ny, threshold)) continue;
          visited[neighborIndex] = 1;
          stack.push(neighborIndex);
        }
      }

      components.push({
        left,
        top,
        right,
        bottom,
        width: right - left + 1,
        height: bottom - top + 1,
        area,
      });
    }
  }

  return components;
}

async function cleanEdgeArtifacts(input: Buffer) {
  const raw = await cellRaw(input);
  const edgeMargin = Math.max(2, Math.round(raw.info.width * EDGE_ARTIFACT_MARGIN_RATIO));
  const maxArtifactArea = raw.info.width * raw.info.height * EDGE_ARTIFACT_AREA_RATIO;
  const components = collectVisibleComponents(raw, EDGE_ARTIFACT_VISIBLE_THRESHOLD);
  const artifacts = components.filter((component) => {
    const touchesEdge =
      component.left <= edgeMargin ||
      component.top <= edgeMargin ||
      component.right >= raw.info.width - 1 - edgeMargin ||
      component.bottom >= raw.info.height - 1 - edgeMargin;
    return touchesEdge && component.area <= maxArtifactArea;
  });

  if (artifacts.length === 0) {
    return { buffer: input, removedComponents: 0, removedPixels: 0 };
  }

  const data = Buffer.from(raw.data);
  let removedPixels = 0;
  for (const component of artifacts) {
    for (let y = component.top; y <= component.bottom; y += 1) {
      for (let x = component.left; x <= component.right; x += 1) {
        if (!pixelIsVisible(raw, x, y, EDGE_ARTIFACT_VISIBLE_THRESHOLD)) continue;
        const index = (y * raw.info.width + x) * raw.info.channels;
        data[index] = 0;
        data[index + 1] = 0;
        data[index + 2] = 0;
        if (raw.info.channels >= 4) data[index + 3] = 255;
        removedPixels += 1;
      }
    }
  }

  const buffer = await sharp(data, {
    raw: {
      width: raw.info.width,
      height: raw.info.height,
      channels: raw.info.channels,
    },
  })
    .png()
    .toBuffer();

  return { buffer, removedComponents: artifacts.length, removedPixels };
}

function expandBounds(bounds: Bounds, maxWidth: number, maxHeight: number, padding: number) {
  const left = Math.max(0, bounds.left - padding);
  const top = Math.max(0, bounds.top - padding);
  const right = Math.min(maxWidth - 1, bounds.right + padding);
  const bottom = Math.min(maxHeight - 1, bounds.bottom + padding);
  return {
    left,
    top,
    right,
    bottom,
    width: right - left + 1,
    height: bottom - top + 1,
  };
}

async function cellRaw(input: Buffer): Promise<RawImage> {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, info };
}

async function sourceCellFromSheet(sheetPath: string, slot: number) {
  const col = slot % 4;
  const row = Math.floor(slot / 4);
  return sharp(sheetPath)
    .extract({
      left: col * SOURCE_CELL,
      top: row * SOURCE_CELL,
      width: SOURCE_CELL,
      height: SOURCE_CELL,
    })
    .png()
    .toBuffer();
}

async function buildSourceSheets(source: SourceContract) {
  await mkdir(source512Dir, { recursive: true });

  const sourceImages512: string[] = [];
  for (const batch of source.batches) {
    const sheetPath = path.join(source512Dir, `${batch.batchId}.png`);
    sourceImages512.push(relativePath(sheetPath));
    if (existsSync(sheetPath)) continue;

    const composites: sharp.OverlayOptions[] = [];
    for (let index = 0; index < batch.items.length; index += 1) {
      const framePath = path.join(
        sourceFrameDir,
        `row_${String(batch.row).padStart(2, '0')}`,
        `frame-${index}.png`,
      );
      if (!existsSync(framePath)) continue;

      const frame = await sharp(framePath)
        .resize(SOURCE_CELL, SOURCE_CELL, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 1 },
          kernel: 'lanczos3',
        })
        .png()
        .toBuffer();

      composites.push({
        input: frame,
        left: (index % 4) * SOURCE_CELL,
        top: Math.floor(index / 4) * SOURCE_CELL,
      });
    }

    await sharp({
      create: {
        width: SOURCE_CELL * 4,
        height: SOURCE_CELL * 4,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      },
    })
      .composite(composites)
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(sheetPath);
  }

  return sourceImages512;
}

async function runtimeCell(sheetPath: string, slot: number) {
  const dirtySourceCell = await sourceCellFromSheet(sheetPath, slot);
  const cleanup = await cleanEdgeArtifacts(dirtySourceCell);
  const sourceCell = cleanup.buffer;
  const raw = await cellRaw(sourceCell);
  const bounds = visibleBounds(raw);

  if (!bounds) {
    const empty = await sharp({
      create: {
        width: RUNTIME_CELL,
        height: RUNTIME_CELL,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
    return { buffer: empty, bounds: null, runtimeBounds: null, cleanup };
  }

  const crop = expandBounds(bounds, raw.info.width, raw.info.height, SOURCE_PADDING);
  const scale = Math.min(RUNTIME_CONTENT_BOX / crop.width, RUNTIME_CONTENT_BOX / crop.height);
  const width = Math.max(1, Math.round(crop.width * scale));
  const height = Math.max(1, Math.round(crop.height * scale));
  const left = Math.round((RUNTIME_CELL - width) / 2);
  const top = Math.round((RUNTIME_CELL - height) / 2);

  const icon = await sharp(sourceCell)
    .extract({ left: crop.left, top: crop.top, width: crop.width, height: crop.height })
    .resize(width, height, { fit: 'fill', kernel: 'lanczos3' })
    .png()
    .toBuffer();

  const cell = await sharp({
    create: {
      width: RUNTIME_CELL,
      height: RUNTIME_CELL,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([{ input: icon, left, top }])
    .png()
    .toBuffer();

  const runtimeBounds = visibleBounds(await cellRaw(cell));
  return { buffer: cell, bounds: crop, runtimeBounds, cleanup };
}

async function buildRuntimeAtlas(source: SourceContract, manifest: AtlasManifest) {
  const frameEntries = Object.entries(source.frames);
  const composites: sharp.OverlayOptions[] = [];
  const qaFrames: Record<
    string,
    {
      source: string;
      sourceBounds: Bounds | null;
      runtimeBounds: Bounds | null;
      centerOffset: { x: number; y: number } | null;
      maxCenterOffset: number | null;
      coverage: number;
      cleanup: {
        removedComponents: number;
        removedPixels: number;
      };
    }
  > = {};
  const missing: string[] = [];

  for (const [index, [id, frame]] of frameEntries.entries()) {
    const sheetPath = path.join(
      source512Dir,
      `character-lab-icons-${String(frame.sourceRow).padStart(2, '0')}.png`,
    );
    if (!existsSync(sheetPath)) {
      missing.push(id);
      continue;
    }

    const { buffer, bounds, runtimeBounds, cleanup } = await runtimeCell(
      sheetPath,
      frame.sourceColumn,
    );
    const x = (index % RUNTIME_COLUMNS) * RUNTIME_CELL;
    const y = Math.floor(index / RUNTIME_COLUMNS) * RUNTIME_CELL;
    composites.push({ input: buffer, left: x, top: y });

    let centerOffset: { x: number; y: number } | null = null;
    let maxCenterOffset: number | null = null;
    let coverage = 0;
    if (runtimeBounds) {
      const centerX = runtimeBounds.left + runtimeBounds.width / 2;
      const centerY = runtimeBounds.top + runtimeBounds.height / 2;
      centerOffset = {
        x: Number((centerX - RUNTIME_CELL / 2).toFixed(2)),
        y: Number((centerY - RUNTIME_CELL / 2).toFixed(2)),
      };
      maxCenterOffset = Math.max(Math.abs(centerOffset.x), Math.abs(centerOffset.y));
      coverage = Number(
        ((runtimeBounds.width * runtimeBounds.height) / (RUNTIME_CELL * RUNTIME_CELL)).toFixed(4),
      );
    }

    qaFrames[id] = {
      source: relativePath(sheetPath),
      sourceBounds: bounds,
      runtimeBounds,
      centerOffset,
      maxCenterOffset,
      coverage,
      cleanup: {
        removedComponents: cleanup.removedComponents,
        removedPixels: cleanup.removedPixels,
      },
    };

    manifest.frames[id] = { x, y, w: RUNTIME_CELL, h: RUNTIME_CELL };
  }

  await sharp({
    create: {
      width: RUNTIME_COLUMNS * RUNTIME_CELL,
      height: Math.ceil(frameEntries.length / RUNTIME_COLUMNS) * RUNTIME_CELL,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite(composites)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(runtimeAtlasPath);

  return { qaFrames, missing };
}

function reportCenterStats(
  frames: Record<string, { maxCenterOffset: number | null; coverage: number }>,
) {
  const offsets = Object.values(frames)
    .map((frame) => frame.maxCenterOffset)
    .filter((value): value is number => typeof value === 'number')
    .sort((a, b) => a - b);
  const coverage = Object.values(frames)
    .map((frame) => frame.coverage)
    .sort((a, b) => a - b);
  const percentile = (values: number[], p: number) =>
    values[Math.floor((values.length - 1) * p)] ?? null;

  return {
    maxOffset: offsets.at(-1) ?? null,
    p95Offset: percentile(offsets, 0.95),
    minCoverage: coverage[0] ?? null,
    medianCoverage: percentile(coverage, 0.5),
  };
}

async function main() {
  const source = await readJson<SourceContract>(sourcePath);
  const manifest = await readJson<AtlasManifest>(manifestPath);
  const report = await readJson<Record<string, unknown>>(reportPath);

  manifest.frames = {};
  manifest.cellSize = RUNTIME_CELL;
  manifest.columns = RUNTIME_COLUMNS;
  manifest.rows = Math.ceil(Object.keys(source.frames).length / RUNTIME_COLUMNS);
  manifest.frameCount = Object.keys(source.frames).length;

  const sourceImages512 = await buildSourceSheets(source);
  const { qaFrames, missing } = await buildRuntimeAtlas(source, manifest);
  const atlasHash = await sha256(runtimeAtlasPath);
  const atlasMetadata = await sharp(runtimeAtlasPath).metadata();

  source.tool = 'image_gen built-in + scripts/build-character-lab-icon-assets.ts';
  source.sourceImages512 = sourceImages512;
  source.workFrames = {
    cellSize: SOURCE_CELL,
    directory: 'assets/recipes/character-lab/sources/mannequin-v1-512',
  };
  source.outputGrid = {
    columns: manifest.columns,
    rows: manifest.rows,
    cellSize: manifest.cellSize,
    frameCount: manifest.frameCount,
    contentFit: {
      visibleThreshold: VISIBLE_THRESHOLD,
      contentBox: RUNTIME_CONTENT_BOX,
      edgeArtifactVisibleThreshold: EDGE_ARTIFACT_VISIBLE_THRESHOLD,
      edgeArtifactMarginRatio: EDGE_ARTIFACT_MARGIN_RATIO,
      edgeArtifactAreaRatio: EDGE_ARTIFACT_AREA_RATIO,
    },
  };
  source.atlas = {
    path: relativePath(runtimeAtlasPath),
    size: [atlasMetadata.width ?? 0, atlasMetadata.height ?? 0],
    sha256: atlasHash,
  };

  for (const frame of Object.values(source.frames)) {
    frame.workFrame = `assets/recipes/character-lab/sources/mannequin-v1-512/character-lab-icons-${String(
      frame.sourceRow,
    ).padStart(2, '0')}.png`;
    frame.runtimeFrame = relativePath(runtimeAtlasPath);
  }

  const sourceSheetHashes = Object.fromEntries(
    await Promise.all(
      sourceImages512.map(async (file) => [file, await sha256(path.join(repoRoot, file))]),
    ),
  );
  const centerStats = reportCenterStats(qaFrames);
  const qa = {
    ok: missing.length === 0,
    generatedAt: new Date().toISOString(),
    sourceSheets512: sourceImages512.length,
    sourceSlots: source.batches.reduce((total, batch) => total + batch.items.length, 0),
    runtimeFrames: manifest.frameCount,
    runtimeAtlas: relativePath(runtimeAtlasPath),
    runtimeAtlasSha256: atlasHash,
    sourceSheetHashes,
    missing,
    centerStats,
    frames: qaFrames,
  };

  source.qa = {
    file: relativePath(qaPath),
    ok: qa.ok,
    sourceSheets512: qa.sourceSheets512,
    sourceSlots: qa.sourceSlots,
    runtimeFrames: qa.runtimeFrames,
    centerStats,
  };
  report.ok = qa.ok;
  report.tool = 'sprite-atlas-builder + scripts/build-character-lab-icon-assets.ts';
  report.atlas = {
    path: relativePath(runtimeAtlasPath),
    size: source.atlas.size,
    sha256: atlasHash,
  };
  report.assetQa = source.qa;

  await writeJson(sourcePath, source);
  await writeJson(manifestPath, manifest);
  await writeJson(reportPath, report);
  await writeJson(qaPath, qa);

  if (!qa.ok) {
    console.error(`Character Lab icon asset QA failed: ${missing.join(', ')}`);
    process.exit(1);
  }

  console.log(
    `Character Lab icons rebuilt: ${qa.sourceSheets512} source sheets, ${qa.runtimeFrames} runtime frames, atlas ${source.atlas.size.join(
      'x',
    )}, p95 center offset ${centerStats.p95Offset}px.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
