import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp, { type OutputInfo, type OverlayOptions } from 'sharp';

const repoRoot = process.cwd();
const assetDir = path.join(repoRoot, 'assets', 'recipes', 'character-lab');
const sourceSheetDir = path.join(assetDir, 'sources', 'option-icons-v1');
const sourceFrameDir = path.join(sourceSheetDir, 'frames-512');
const tempPlanPath = path.join(
  repoRoot,
  '.tmp',
  'character-lab',
  'option-icon-batches',
  'batches.json',
);
const sourcePath = path.join(assetDir, 'character-lab-option-atlas.source.json');
const manifestPath = path.join(assetDir, 'character-lab-option-atlas.manifest.json');
const qaPath = path.join(assetDir, 'character-lab-option-atlas.qa.json');
const runtimeAtlasPath = path.join(assetDir, 'character-lab-option-atlas.png');
const generatedLibPath = path.join(repoRoot, 'lib', 'characterLabOptionIconAtlas.generated.ts');

const SOURCE_GRID_COLUMNS = 2;
const SOURCE_GRID_ROWS = 2;
const SOURCE_FRAME_CELL = 512;
const SOURCE_FRAME_CONTENT_BOX = 468;
const RUNTIME_CELL = 128;
const RUNTIME_COLUMNS = 16;
const RUNTIME_CONTENT_BOX = 116;
const VISIBLE_THRESHOLD = 24;
const SOURCE_PADDING = 10;
const EDGE_ARTIFACT_MARGIN_RATIO = 0.012;
const EDGE_ARTIFACT_AREA_RATIO = 0.006;
const RATIO_EDGE_ARTIFACT_AREA_RATIO = 0.00025;

interface OptionItem {
  id: string;
  field: 'expression' | 'aspect-ratio' | 'style' | 'clothing' | 'body-type';
  label: string;
  detail?: string;
  visual?: string;
}

interface OptionBatch {
  batchId: string;
  index: number;
  promptPath?: string;
  items: OptionItem[];
}

interface OptionPlan {
  batches: OptionBatch[];
}

interface RawImage {
  data: Buffer;
  info: OutputInfo;
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

interface FrameRecord {
  x: number;
  y: number;
  w: number;
  h: number;
  field: OptionItem['field'];
  label: string;
  detail: string;
  sourceSheet: string;
  sourceSlot: number;
  sourceFrame512: string;
  sourceBounds: Bounds | null;
  runtimeBounds: Bounds | null;
  cleanup: {
    removedComponents: number;
    removedPixels: number;
  };
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

function pixelIsVisible(raw: RawImage, x: number, y: number, threshold = VISIBLE_THRESHOLD) {
  const channels = raw.info.channels;
  const index = (y * raw.info.width + x) * channels;
  const alpha = channels >= 4 ? raw.data[index + 3] : 255;
  return (
    alpha > 0 &&
    (raw.data[index] > threshold ||
      raw.data[index + 1] > threshold ||
      raw.data[index + 2] > threshold)
  );
}

function collectVisibleComponents(raw: RawImage): ComponentBounds[] {
  const { width, height } = raw.info;
  const visited = new Uint8Array(width * height);
  const components: ComponentBounds[] = [];
  const stack: number[] = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const start = y * width + x;
      if (visited[start] || !pixelIsVisible(raw, x, y)) continue;

      let left = x;
      let top = y;
      let right = x;
      let bottom = y;
      let area = 0;
      visited[start] = 1;
      stack.push(start);

      while (stack.length > 0) {
        const index = stack.pop()!;
        const cx = index % width;
        const cy = Math.floor(index / width);
        area += 1;
        if (cx < left) left = cx;
        if (cx > right) right = cx;
        if (cy < top) top = cy;
        if (cy > bottom) bottom = cy;

        const neighbors = [index - 1, index + 1, index - width, index + width];
        for (const next of neighbors) {
          if (next < 0 || next >= visited.length || visited[next]) continue;
          const nx = next % width;
          const ny = Math.floor(next / width);
          if (Math.abs(nx - cx) + Math.abs(ny - cy) !== 1) continue;
          if (!pixelIsVisible(raw, nx, ny)) continue;
          visited[next] = 1;
          stack.push(next);
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

async function cleanEdgeArtifacts(input: Buffer, field: OptionItem['field']) {
  const raw = await cellRaw(input);
  const edgeMargin = Math.max(
    2,
    Math.round(Math.min(raw.info.width, raw.info.height) * EDGE_ARTIFACT_MARGIN_RATIO),
  );
  const maxArtifactArea =
    raw.info.width *
    raw.info.height *
    (field === 'aspect-ratio' ? RATIO_EDGE_ARTIFACT_AREA_RATIO : EDGE_ARTIFACT_AREA_RATIO);
  const removeMask = new Uint8Array(raw.info.width * raw.info.height);
  let removedComponents = 0;
  let removedPixels = 0;

  for (const component of collectVisibleComponents(raw)) {
    const touchesEdge =
      component.left <= edgeMargin ||
      component.top <= edgeMargin ||
      raw.info.width - 1 - component.right <= edgeMargin ||
      raw.info.height - 1 - component.bottom <= edgeMargin;
    if (!touchesEdge || component.area > maxArtifactArea) continue;

    for (let y = component.top; y <= component.bottom; y += 1) {
      for (let x = component.left; x <= component.right; x += 1) {
        if (!pixelIsVisible(raw, x, y)) continue;
        removeMask[y * raw.info.width + x] = 1;
      }
    }
    removedComponents += 1;
    removedPixels += component.area;
  }

  if (removedComponents === 0) return { buffer: input, removedComponents, removedPixels };

  const channels = raw.info.channels;
  const data = Buffer.from(raw.data);
  for (let index = 0; index < removeMask.length; index += 1) {
    if (!removeMask[index]) continue;
    const pixel = index * channels;
    data[pixel] = 0;
    data[pixel + 1] = 0;
    data[pixel + 2] = 0;
    if (channels >= 4) data[pixel + 3] = 255;
  }

  const buffer = await sharp(data, {
    raw: {
      width: raw.info.width,
      height: raw.info.height,
      channels,
    },
  })
    .png()
    .toBuffer();

  return { buffer, removedComponents, removedPixels };
}

async function sourceCellFromSheet(sheetPath: string, slot: number) {
  const metadata = await sharp(sheetPath).metadata();
  const sheetWidth = metadata.width ?? 0;
  const sheetHeight = metadata.height ?? 0;
  const cellWidth = Math.floor(sheetWidth / SOURCE_GRID_COLUMNS);
  const cellHeight = Math.floor(sheetHeight / SOURCE_GRID_ROWS);

  if (cellWidth <= 0 || cellHeight <= 0) {
    throw new Error(`Invalid option icon sheet dimensions for ${sheetPath}`);
  }

  return sharp(sheetPath)
    .extract({
      left: (slot % SOURCE_GRID_COLUMNS) * cellWidth,
      top: Math.floor(slot / SOURCE_GRID_COLUMNS) * cellHeight,
      width: cellWidth,
      height: cellHeight,
    })
    .png()
    .toBuffer();
}

async function normalizedCell(
  input: Buffer,
  targetSize: number,
  contentBox: number,
  field: OptionItem['field'],
) {
  const cleanup = await cleanEdgeArtifacts(input, field);
  const cleanedInput = cleanup.buffer;
  const raw = await cellRaw(cleanedInput);
  const bounds = visibleBounds(raw);

  if (!bounds) {
    const empty = await sharp({
      create: {
        width: targetSize,
        height: targetSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
    return { buffer: empty, sourceBounds: null, outputBounds: null, cleanup };
  }

  const crop = expandBounds(bounds, raw.info.width, raw.info.height, SOURCE_PADDING);
  const scale = Math.min(contentBox / crop.width, contentBox / crop.height);
  const width = Math.max(1, Math.round(crop.width * scale));
  const height = Math.max(1, Math.round(crop.height * scale));
  const left = Math.round((targetSize - width) / 2);
  const top = Math.round((targetSize - height) / 2);

  const icon = await sharp(cleanedInput)
    .extract({
      left: crop.left,
      top: crop.top,
      width: crop.width,
      height: crop.height,
    })
    .resize(width, height, { fit: 'fill', kernel: 'lanczos3' })
    .png()
    .toBuffer();

  const buffer = await sharp({
    create: {
      width: targetSize,
      height: targetSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([{ input: icon, left, top }])
    .png()
    .toBuffer();

  const outputBounds = visibleBounds(await cellRaw(buffer));
  return { buffer, sourceBounds: crop, outputBounds, cleanup };
}

function sourceFrameFileName(id: string) {
  return `${id
    .replace(/^option:/, 'option-')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()}.png`;
}

function centerStats(
  frames: Record<string, { runtimeBounds: Bounds | null }>,
  targetSize = RUNTIME_CELL,
) {
  const offsets = Object.values(frames)
    .map((frame) => {
      if (!frame.runtimeBounds) return null;
      const centerX = frame.runtimeBounds.left + frame.runtimeBounds.width / 2;
      const centerY = frame.runtimeBounds.top + frame.runtimeBounds.height / 2;
      return Math.max(Math.abs(centerX - targetSize / 2), Math.abs(centerY - targetSize / 2));
    })
    .filter((value): value is number => typeof value === 'number')
    .sort((a, b) => a - b);
  const coverage = Object.values(frames)
    .map((frame) =>
      frame.runtimeBounds
        ? (frame.runtimeBounds.width * frame.runtimeBounds.height) / (targetSize * targetSize)
        : 0,
    )
    .sort((a, b) => a - b);
  const percentile = (values: number[], p: number) =>
    values[Math.floor((values.length - 1) * p)] ?? null;

  return {
    maxOffset: offsets.at(-1) === undefined ? null : Number(offsets.at(-1)!.toFixed(2)),
    p95Offset:
      percentile(offsets, 0.95) === null ? null : Number(percentile(offsets, 0.95)!.toFixed(2)),
    minCoverage: coverage[0] === undefined ? null : Number(coverage[0].toFixed(4)),
    medianCoverage:
      percentile(coverage, 0.5) === null ? null : Number(percentile(coverage, 0.5)!.toFixed(4)),
  };
}

async function readPlan(): Promise<OptionPlan> {
  if (existsSync(tempPlanPath)) return readJson<OptionPlan>(tempPlanPath);
  if (existsSync(sourcePath)) return readJson<OptionPlan>(sourcePath);
  throw new Error(`Missing option icon batch plan: ${tempPlanPath}`);
}

function generatedTs(frames: Record<string, FrameRecord>, atlasWidth: number, atlasHeight: number) {
  const frameCoords = Object.fromEntries(
    Object.entries(frames).map(([id, frame]) => [
      id,
      {
        x: frame.x,
        y: frame.y,
        w: frame.w,
        h: frame.h,
      },
    ]),
  );
  const metadata = Object.fromEntries(
    Object.entries(frames).map(([id, frame]) => [
      id,
      {
        field: frame.field,
        label: frame.label,
        detail: frame.detail,
      },
    ]),
  );
  const sourceUrls = Object.entries(frames)
    .map(
      ([id, frame]) =>
        `  ${JSON.stringify(id)}: new URL(${JSON.stringify(`../${frame.sourceFrame512}`)}, import.meta.url).href,`,
    )
    .join('\n');

  return `// Generated from assets/recipes/character-lab/character-lab-option-atlas.manifest.json.
// Do not hand-edit frame coordinates or source URLs.
export const CHARACTER_LAB_OPTION_ICON_ATLAS_URL = new URL(
  '../assets/recipes/character-lab/character-lab-option-atlas.png',
  import.meta.url,
).href;
export const CHARACTER_LAB_OPTION_ICON_ATLAS_CELL_SIZE = ${RUNTIME_CELL};
export const CHARACTER_LAB_OPTION_ICON_ATLAS_WIDTH = ${atlasWidth};
export const CHARACTER_LAB_OPTION_ICON_ATLAS_HEIGHT = ${atlasHeight};
export const CHARACTER_LAB_OPTION_ICON_FRAMES = ${JSON.stringify(frameCoords, null, 2)} as const;
export const CHARACTER_LAB_OPTION_ICON_METADATA = ${JSON.stringify(metadata, null, 2)} as const;
export const CHARACTER_LAB_OPTION_ICON_SOURCE_URLS = {
${sourceUrls}
} as const;
`;
}

async function main() {
  const plan = await readPlan();
  const frameEntries = plan.batches.flatMap((batch) =>
    batch.items.map((item, sourceSlot) => ({ batch, item, sourceSlot })),
  );
  const rows = Math.ceil(frameEntries.length / RUNTIME_COLUMNS);
  const composites: OverlayOptions[] = [];
  const frames: Record<string, FrameRecord> = {};
  const missing: string[] = [];

  await mkdir(sourceFrameDir, { recursive: true });

  for (const [index, { batch, item, sourceSlot }] of frameEntries.entries()) {
    const sheetPath = path.join(sourceSheetDir, `${batch.batchId}.png`);
    if (!existsSync(sheetPath)) {
      missing.push(item.id);
      continue;
    }

    const sourceCell = await sourceCellFromSheet(sheetPath, sourceSlot);
    const source512 = await normalizedCell(
      sourceCell,
      SOURCE_FRAME_CELL,
      SOURCE_FRAME_CONTENT_BOX,
      item.field,
    );
    const sourceFramePath = path.join(sourceFrameDir, sourceFrameFileName(item.id));
    await sharp(source512.buffer)
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(sourceFramePath);

    const runtime = await normalizedCell(sourceCell, RUNTIME_CELL, RUNTIME_CONTENT_BOX, item.field);
    const x = (index % RUNTIME_COLUMNS) * RUNTIME_CELL;
    const y = Math.floor(index / RUNTIME_COLUMNS) * RUNTIME_CELL;
    composites.push({ input: runtime.buffer, left: x, top: y });

    frames[item.id] = {
      x,
      y,
      w: RUNTIME_CELL,
      h: RUNTIME_CELL,
      field: item.field,
      label: item.label,
      detail: item.detail ?? '',
      sourceSheet: relativePath(sheetPath),
      sourceSlot,
      sourceFrame512: relativePath(sourceFramePath),
      sourceBounds: source512.sourceBounds,
      runtimeBounds: runtime.outputBounds,
      cleanup: {
        removedComponents: source512.cleanup.removedComponents + runtime.cleanup.removedComponents,
        removedPixels: source512.cleanup.removedPixels + runtime.cleanup.removedPixels,
      },
    };
  }

  await sharp({
    create: {
      width: RUNTIME_COLUMNS * RUNTIME_CELL,
      height: rows * RUNTIME_CELL,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite(composites)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(runtimeAtlasPath);

  const atlasHash = await sha256(runtimeAtlasPath);
  const sourceSheets = plan.batches.map((batch) =>
    relativePath(path.join(sourceSheetDir, `${batch.batchId}.png`)),
  );
  const sourceSheetHashes = Object.fromEntries(
    await Promise.all(
      sourceSheets
        .filter((file) => existsSync(path.join(repoRoot, file)))
        .map(async (file) => [file, await sha256(path.join(repoRoot, file))]),
    ),
  );
  const stats = centerStats(frames);
  const manifest = {
    image: relativePath(runtimeAtlasPath),
    cellSize: RUNTIME_CELL,
    columns: RUNTIME_COLUMNS,
    rows,
    frameCount: frameEntries.length,
    source: relativePath(sourcePath),
    sourceFrames512Directory: relativePath(sourceFrameDir),
    frames: Object.fromEntries(
      Object.entries(frames).map(([id, frame]) => [
        id,
        { x: frame.x, y: frame.y, w: frame.w, h: frame.h },
      ]),
    ),
  };
  const source = {
    version: 1,
    tool: 'image_gen + scripts/build-character-lab-option-icon-assets.ts',
    artDirection:
      'Neutral mannequin Character Lab option icons on flat black backgrounds, generated as 2x2 source sheets and resized into runtime atlas cells.',
    sourceGrid: {
      columns: SOURCE_GRID_COLUMNS,
      rows: SOURCE_GRID_ROWS,
      intendedCellSize: SOURCE_FRAME_CELL,
      sourceDirectory: relativePath(sourceSheetDir),
      sourceFrames512Directory: relativePath(sourceFrameDir),
    },
    outputGrid: {
      columns: RUNTIME_COLUMNS,
      rows,
      cellSize: RUNTIME_CELL,
      frameCount: frameEntries.length,
      contentFit: {
        visibleThreshold: VISIBLE_THRESHOLD,
        runtimeContentBox: RUNTIME_CONTENT_BOX,
        sourceFrameContentBox: SOURCE_FRAME_CONTENT_BOX,
        edgeArtifactMarginRatio: EDGE_ARTIFACT_MARGIN_RATIO,
        edgeArtifactAreaRatio: EDGE_ARTIFACT_AREA_RATIO,
        ratioEdgeArtifactAreaRatio: RATIO_EDGE_ARTIFACT_AREA_RATIO,
      },
    },
    atlas: {
      path: relativePath(runtimeAtlasPath),
      size: [RUNTIME_COLUMNS * RUNTIME_CELL, rows * RUNTIME_CELL],
      sha256: atlasHash,
    },
    batches: plan.batches,
    frames,
  };
  const qa = {
    ok: missing.length === 0 && Object.keys(frames).length === frameEntries.length,
    generatedAt: new Date().toISOString(),
    sourceSheets: sourceSheets.length,
    sourceSheetHashes,
    sourceFrames512: Object.keys(frames).length,
    runtimeFrames: Object.keys(frames).length,
    expectedFrames: frameEntries.length,
    runtimeAtlas: relativePath(runtimeAtlasPath),
    runtimeAtlasSha256: atlasHash,
    missing,
    centerStats: stats,
    frames,
  };

  await writeJson(sourcePath, source);
  await writeJson(manifestPath, manifest);
  await writeJson(qaPath, qa);
  await writeFile(
    generatedLibPath,
    generatedTs(frames, RUNTIME_COLUMNS * RUNTIME_CELL, rows * RUNTIME_CELL),
  );

  if (!qa.ok) {
    console.error(`Character Lab option icon QA failed: ${missing.join(', ')}`);
    process.exit(1);
  }

  console.log(
    `Character Lab option icons rebuilt: ${qa.sourceSheets} source sheets, ${qa.runtimeFrames} option frames, atlas ${
      RUNTIME_COLUMNS * RUNTIME_CELL
    }x${rows * RUNTIME_CELL}, p95 center offset ${stats.p95Offset}px.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
