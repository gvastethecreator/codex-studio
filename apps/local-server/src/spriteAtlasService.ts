import { isManagedGenerationAssetPath } from './managedAssetPolicy';
import { captureWorkflowOutput } from './outputDestination';
import { createHash, randomUUID } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { authoringSharp, writePngFromSvg } from './sharpAuthoringAdapter';
import {
  createSpriteAtlasContract,
  createSpriteAtlasPresetSummaries,
  isSpriteAtlasBlockedReasonKind,
  isSpriteAtlasIdleRow,
  type CreateSpriteAtlasRowJobsResponse,
  type CreateSpriteAtlasRunRequest,
  type ImportSpriteAtlasRowRequest,
  type SpriteAtlasBlockedReason,
  type SpriteAtlasBlockedReasonKind,
  type SpriteAtlasQaReport,
  type SpriteAtlasRowHandoffJob,
  type SpriteAtlasRowNormalization,
  type SpriteAtlasRowPromptResponse,
  type SpriteAtlasRowState,
  type SpriteAtlasRun,
  type SpriteAtlasRunPaths,
} from '../../../packages/shared/src/spriteAtlasContracts';
import type { CatalogImage, Job, JobLibraryContext } from '../../../packages/shared/src/types';
import { resolveLibraryPathFromRoot } from './library';

export class SpriteAtlasActionError extends Error {
  readonly status = 409;
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'SpriteAtlasActionError';
    this.code = code;
  }
}

export interface SpriteAtlasService {
  listPresets(): ReturnType<typeof createSpriteAtlasPresetSummaries>;
  listRuns(): Promise<SpriteAtlasRun[]>;
  getRun(runId: string): Promise<SpriteAtlasRun | null>;
  createRun(input: CreateSpriteAtlasRunRequest): Promise<SpriteAtlasRun>;
  createRowJob(runId: string, rowId: string): Promise<SpriteAtlasRowHandoffJob | null>;
  createRowJobs(runId: string, rowIds?: string[]): Promise<CreateSpriteAtlasRowJobsResponse | null>;
  readRowPrompt(runId: string, rowId: string): Promise<SpriteAtlasRowPromptResponse | null>;
  importRow(runId: string, input: ImportSpriteAtlasRowRequest): Promise<SpriteAtlasRun | null>;
  compose(runId: string): Promise<SpriteAtlasRun | null>;
  composeFixture(runId: string): Promise<SpriteAtlasRun | null>;
  runQa(runId: string): Promise<SpriteAtlasRun | null>;
  acceptVisualReview(runId: string): Promise<SpriteAtlasRun | null>;
  /** Checks a provider job for a run row before it is committed. Null accepts it. */
  validateRowDispatch(runId: string, rowId: string): Promise<SpriteAtlasDispatchIssue | null>;
  /**
   * Records accepted provider jobs on a row. A new set replaces the previous one. A retry of
   * jobs already in the set only puts an awaiting row back to generating.
   */
  recordRowDispatch(runId: string, rowId: string, jobIds: string[]): Promise<SpriteAtlasRun | null>;
  /** Folds one job of the row's dispatch set into the row. True when the run changed. */
  settleRowJob(
    runId: string,
    rowId: string,
    job: Job,
    lookup: SpriteAtlasJobLookup,
  ): Promise<boolean>;
  /** Settles the dispatch sets of awaiting rows from the stored jobs. */
  reconcileRun(
    runId: string,
    lookup: SpriteAtlasJobLookup,
  ): Promise<{ run: SpriteAtlasRun; changed: boolean } | null>;
}

export interface SpriteAtlasDispatchIssue {
  code: string;
  message: string;
}

/** Stored job and Catalog reads that backend reconciliation needs. */
export interface SpriteAtlasJobLookup {
  getJob(jobId: string): Job | null;
  getCatalogImageByJobId(jobId: string): Pick<CatalogImage, 'id'> | null;
}

export interface CreateSpriteAtlasServiceOptions {
  readLibraryDir: () => string;
  allocateOutputGeneration?: (ownerKey: string) => number;
  readOutputContext?: (workspaceId?: string) => JobLibraryContext;
  getCatalogImage?: (imageId: string) => CatalogImage | null;
  createId?: () => string;
  now?: () => string;
}

function isPathInside(parentPath: string, childPath: string) {
  const parent = path.resolve(parentPath);
  const child = path.resolve(childPath);
  const relative = path.relative(parent, child);
  return Boolean(relative) && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function blockedReason(
  reasonKind: SpriteAtlasBlockedReasonKind,
  userMessage: string,
  suggestion: string,
): SpriteAtlasBlockedReason {
  return { status: 'blocked', reasonKind, userMessage, suggestion };
}

async function sha256File(filePath: string) {
  return createHash('sha256')
    .update(await readFile(filePath))
    .digest('hex');
}

async function directoryExists(filePath: string) {
  try {
    return (await stat(filePath)).isDirectory();
  } catch {
    return false;
  }
}

async function publishStagedCompose({
  framesDir,
  atlasPath,
  manifestPath,
  stagingFramesDir,
  stagingAtlasPath,
  stagingManifestPath,
}: {
  framesDir: string;
  atlasPath: string;
  manifestPath: string;
  stagingFramesDir: string;
  stagingAtlasPath: string;
  stagingManifestPath: string;
}) {
  const previousFramesDir = path.join(path.dirname(framesDir), 'frames-previous');
  await rm(previousFramesDir, { recursive: true, force: true });
  const hadFrames = await directoryExists(framesDir);
  if (hadFrames) await rename(framesDir, previousFramesDir);
  try {
    await rename(stagingFramesDir, framesDir);
    await copyFile(stagingAtlasPath, atlasPath);
    await copyFile(stagingManifestPath, manifestPath);
  } catch (error) {
    await rm(framesDir, { recursive: true, force: true });
    if (hadFrames) await rename(previousFramesDir, framesDir);
    throw error;
  }
  await rm(previousFramesDir, { recursive: true, force: true });
}

async function writeRepeatPreview(framePath: string, previewPath: string) {
  const metadata = await authoringSharp(framePath).metadata();
  const width = metadata.width ?? 1;
  const height = metadata.height ?? 1;
  const composites = Array.from({ length: 9 }, (_, index) => ({
    input: framePath,
    left: (index % 3) * width,
    top: Math.floor(index / 3) * height,
  }));
  await mkdir(path.dirname(previewPath), { recursive: true });
  await authoringSharp({
    create: {
      width: width * 3,
      height: height * 3,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toFile(previewPath);
}

export function spriteAtlasFramePath(run: SpriteAtlasRun, rowId: string, frameNumber: number) {
  return path.join(
    run.paths.framesDir,
    `${safeSegment(rowId)}-${String(frameNumber).padStart(2, '0')}.png`,
  );
}

function safeSegment(value: string) {
  return (
    value
      .trim()
      .replace(/[^a-zA-Z0-9_.-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item'
  );
}

function createRunPaths(libraryDir: string, runId: string): SpriteAtlasRunPaths {
  const runDir = resolveLibraryPathFromRoot(libraryDir, 'state', 'sprite-atlas', runId);
  const handoffDir = path.join(runDir, 'codex-handoff');
  return {
    runDir,
    requestPath: path.join(runDir, 'sprite-request.json'),
    statusPath: path.join(runDir, 'status.json'),
    promptsDir: path.join(runDir, 'prompts'),
    layoutGuidesDir: path.join(runDir, 'references', 'layout-guides'),
    rawDir: path.join(runDir, 'raw'),
    framesDir: path.join(runDir, 'frames'),
    handoffInboxDir: path.join(handoffDir, 'inbox'),
    handoffOutboxDir: path.join(handoffDir, 'outbox'),
    handoffStatusDir: path.join(handoffDir, 'status'),
    handoffLogsDir: path.join(handoffDir, 'logs'),
    atlasPath: path.join(runDir, 'atlas.png'),
    manifestPath: path.join(runDir, 'manifest.json'),
    qaReportPath: path.join(runDir, 'qa', 'report.json'),
  };
}

async function ensureRunDirs(paths: SpriteAtlasRunPaths) {
  await Promise.all([
    mkdir(paths.runDir, { recursive: true }),
    mkdir(path.dirname(paths.atlasPath), { recursive: true }),
    mkdir(paths.promptsDir, { recursive: true }),
    mkdir(paths.layoutGuidesDir, { recursive: true }),
    mkdir(paths.rawDir, { recursive: true }),
    mkdir(paths.framesDir, { recursive: true }),
    mkdir(paths.handoffInboxDir, { recursive: true }),
    mkdir(paths.handoffOutboxDir, { recursive: true }),
    mkdir(paths.handoffStatusDir, { recursive: true }),
    mkdir(paths.handoffLogsDir, { recursive: true }),
    mkdir(path.dirname(paths.qaReportPath), { recursive: true }),
  ]);
}

async function fileExists(filePath: string | null | undefined) {
  if (!filePath) return false;
  try {
    const result = await stat(filePath);
    return result.isFile();
  } catch {
    return false;
  }
}

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(filePath, 'utf8')) as T;
  } catch {
    return null;
  }
}

/** Writes a temp file and renames it, so a reader never sees a partial JSON file. */
async function writeJson(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${randomUUID()}.tmp`;
  try {
    await writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    await rename(tempPath, filePath);
  } catch (error) {
    await rm(tempPath, { force: true });
    throw error;
  }
}

/**
 * A stored row strip must be `frames` cells wide and one cell high. Import normalizes
 * provider images to this size, so a mismatch here means an old or changed strip.
 * Returns the blocked reason for a mismatch, or null when the strip fits.
 */
async function checkRowStripGeometry(
  run: SpriteAtlasRun,
  row: SpriteAtlasRowState,
  stripPath: string,
): Promise<SpriteAtlasBlockedReason | null> {
  const metadata = await authoringSharp(stripPath).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  const { cell } = run.contract;
  const expectedWidth = cell.width * row.frames;
  if (width === expectedWidth && height === cell.height) return null;
  return blockedReason(
    'geometry_mismatch',
    `${row.id} is ${width}×${height}. The stored strip must be ${expectedWidth}×${cell.height} (${row.frames} cells of ${cell.width}×${cell.height}).`,
    `Import ${row.id} again so it is normalized to the cell size.`,
  );
}

const NORMALIZE_MIN_SLOT_PX = 8;
/** Contain may not leave the art less than half of the cell on its short side. */
const NORMALIZE_MIN_COVERAGE = 0.5;
const NORMALIZE_ASPECT_TOLERANCE = 0.02;

type RowStripNormalization = Pick<
  SpriteAtlasRowNormalization,
  'normalized' | 'sourceSize' | 'kernel' | 'fit'
>;

/**
 * ADR 0010 row normalization. An exact-size image is not touched (returns `normalized: false`
 * and writes nothing). Any other image is split into `frames` equal slots across its full
 * width. Empty background above and below the art is trimmed first, so a strip drawn across a
 * square provider image keeps its scale. Each slot is resampled to one cell: nearest-neighbor
 * for pixel art, lanczos otherwise. A slot is never cropped or stretched by more than 2%:
 * a larger aspect gap is padded with transparency (contain).
 */
async function normalizeRowStrip(
  run: SpriteAtlasRun,
  row: SpriteAtlasRowState,
  sourcePath: string,
  stripPath: string,
): Promise<
  | { kind: 'blocked'; blocked: SpriteAtlasBlockedReason }
  | ({ kind: 'ready' } & RowStripNormalization)
> {
  const { cell } = run.contract;
  const metadata = await authoringSharp(sourcePath).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  const sourceSize = { w: width, h: height };
  if (width === cell.width * row.frames && height === cell.height) {
    return { kind: 'ready', normalized: false, sourceSize, kernel: null, fit: null };
  }

  const { info } = await authoringSharp(sourcePath).trim().toBuffer({ resolveWithObject: true });
  const top = -(info.trimOffsetTop ?? 0);
  const slotHeight = info.height;
  const slotWidth = width / row.frames;
  const cellAspect = cell.width / cell.height;
  const slotAspect = slotWidth / slotHeight;
  const coverage = Math.min(slotAspect / cellAspect, cellAspect / slotAspect);
  const block = (detail: string) => ({
    kind: 'blocked' as const,
    blocked: blockedReason(
      'geometry_mismatch',
      `${row.id} is ${width}×${height}. ${detail}`,
      `Generate one horizontal strip of ${row.frames} frames with the shape of ${cell.width * row.frames}×${cell.height}.`,
    ),
  });
  if (slotWidth < NORMALIZE_MIN_SLOT_PX || slotHeight < NORMALIZE_MIN_SLOT_PX) {
    return block(
      `Its ${row.frames} slots are ${Math.floor(slotWidth)}×${slotHeight} px. Each slot needs at least ${NORMALIZE_MIN_SLOT_PX} px per side.`,
    );
  }
  if (coverage < NORMALIZE_MIN_COVERAGE) {
    return block(
      `Its ${row.frames} slots are ${Math.round(slotWidth)}×${slotHeight} px. In a ${cell.width}×${cell.height} cell the art would fill only ${Math.round(coverage * 100)}% of one side.`,
    );
  }

  const kernel = run.contract.stylePreset === 'pixel-art' ? 'nearest' : 'lanczos3';
  const fit = 1 - coverage <= NORMALIZE_ASPECT_TOLERANCE ? 'scale' : 'contain';
  const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
  const slots = await Promise.all(
    Array.from({ length: row.frames }, async (_, index) => {
      const left = Math.round(index * slotWidth);
      const right = Math.round((index + 1) * slotWidth);
      const input = await authoringSharp(sourcePath)
        .extract({ left, top, width: right - left, height: slotHeight })
        .resize(cell.width, cell.height, {
          kernel,
          fit: fit === 'scale' ? 'fill' : 'contain',
          background: transparent,
        })
        .png()
        .toBuffer();
      return { input, left: index * cell.width, top: 0 };
    }),
  );
  await authoringSharp({
    create: {
      width: cell.width * row.frames,
      height: cell.height,
      channels: 4,
      background: transparent,
    },
  })
    .composite(slots)
    .png()
    .toFile(stripPath);
  return { kind: 'ready', normalized: true, sourceSize, kernel, fit };
}

function frameOrigin(run: SpriteAtlasRun) {
  const { cell, workflowLane } = run.contract;
  if (workflowLane === 'tileset') return { x: 0, y: 0 };
  if (workflowLane === 'animation') return { x: Math.floor(cell.width / 2), y: cell.height };
  return { x: Math.floor(cell.width / 2), y: Math.floor(cell.height / 2) };
}

function createRowPrompt(run: SpriteAtlasRun, row: SpriteAtlasRowState, basePrompt: string) {
  const contract = run.contract;
  const rowSpec = contract.rows.find((item) => item.id === row.id);
  return [
    `Row: ${row.id}`,
    `Action: ${rowSpec?.action || row.id}`,
    `Frames: ${row.frames}`,
    `Base prompt: ${basePrompt || run.title}`,
    `Preset: ${contract.presetId}`,
    `Asset kind: ${contract.assetKind}`,
    `Workflow lane: ${contract.workflowLane}`,
    `Frame semantics: ${contract.frameSemantics}`,
    `Camera: ${contract.camera}`,
    `Style: ${contract.customStyle || contract.stylePreset}`,
    `Cell: ${contract.cell.width}x${contract.cell.height}`,
    !contract.transparent
      ? 'Background: maintain the background requested in the prompt or source image, including any existing alpha.'
      : contract.backgroundRemoval === 'chroma'
        ? `Background: legacy key color ${contract.chromaKey}. This is a key color for a later import, not transparent pixels.`
        : 'Background: native transparency. Do not paint a green, blue, cyan, or magenta backdrop.',
    '',
    'Generate exactly one horizontal row strip for this state.',
    'Keep the character or asset identity, scale, baseline, outline weight, and palette stable.',
    contract.frameSemantics === 'temporal'
      ? 'Frames are temporal phases in order. Preserve contact points and use a coherent motion arc.'
      : contract.frameSemantics === 'tiles'
        ? 'Frames are adjacent tile states. Preserve edge continuity, projection, and pivot.'
        : 'Frames are distinct items or variants. Do not imply animation between slots.',
    'Keep every frame upright at the requested camera and scale. Do not rotate or resize individual frames.',
    'Use clean slot separation. No text, labels, guide marks, watermarks, or merged atlas pages.',
    '',
    `Sprite Atlas Run: ${run.id}`,
  ].join('\n');
}

async function writeLayoutGuide(run: SpriteAtlasRun, row: SpriteAtlasRowState) {
  const width = run.contract.cell.width * row.frames;
  const height = run.contract.cell.height;
  const lines = Array.from({ length: row.frames + 1 }, (_, index) => {
    const x = index * run.contract.cell.width;
    return `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="#71717a" stroke-width="2" />`;
  }).join('');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="#18181b"/>
      <rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="#71717a" stroke-width="2"/>
      ${lines}
      <text x="8" y="${height - 10}" fill="#a1a1aa" font-size="14" font-family="monospace">${row.id}</text>
    </svg>
  `;
  await writePngFromSvg(svg, row.layoutGuidePath);
}

function createRows(run: Pick<SpriteAtlasRun, 'contract' | 'paths'>, timestamp: string) {
  return run.contract.rows.map<SpriteAtlasRowState>((row) => {
    const rowId = safeSegment(row.id);
    return {
      id: row.id,
      status: 'planned',
      frames: row.frames,
      promptPath: path.join(run.paths.promptsDir, `${rowId}.txt`),
      layoutGuidePath: path.join(run.paths.layoutGuidesDir, `${rowId}.png`),
      rawPath: null,
      sourceSha256: null,
      catalogImageId: null,
      normalization: null,
      jobId: null,
      dispatch: null,
      blocked: null,
      updatedAt: timestamp,
    };
  });
}

function resolveRunStatus(run: SpriteAtlasRun): SpriteAtlasRun['status'] {
  if (run.rows.some((row) => row.status === 'blocked')) return 'blocked';
  if (run.qa?.ok) return 'qa_passed';
  if (run.status === 'composed') return 'composed';
  if (
    run.rows.length > 0 &&
    run.rows.every((row) => row.status === 'raw_imported' || row.status === 'extracted')
  ) {
    return 'ready_to_extract';
  }
  if (run.rows.some((row) => row.status === 'handoff_ready' || row.status === 'generating')) {
    return 'waiting_for_rows';
  }
  return run.status === 'draft' ? 'draft' : run.status;
}

/** A re-queued row voids the composed atlas checks until every row is imported again. */
function reopenRunForRows(run: SpriteAtlasRun) {
  run.qa = null;
  run.visualReview = { status: 'pending', acceptedAt: null };
  run.status = 'waiting_for_rows';
}

function isSafeBlockedReason(
  value: SpriteAtlasBlockedReason | null | undefined,
): value is SpriteAtlasBlockedReason {
  return (
    value?.status === 'blocked' &&
    isSpriteAtlasBlockedReasonKind(value.reasonKind) &&
    Boolean(value.userMessage.trim()) &&
    Boolean(value.suggestion.trim())
  );
}

async function resolveImportSource({
  input,
  libraryDir,
  libraryContext,
  getCatalogImage,
}: {
  input: ImportSpriteAtlasRowRequest;
  libraryDir: string;
  libraryContext?: JobLibraryContext;
  getCatalogImage?: (imageId: string) => CatalogImage | null;
}): Promise<
  | { kind: 'rejected' }
  | { kind: 'missing' }
  | { kind: 'ready'; sourcePath: string; catalogImageId: string | null }
> {
  const catalogImageId = input.catalogImageId?.trim() || null;
  if (catalogImageId) {
    const image = getCatalogImage?.(catalogImageId);
    if (!image) return { kind: 'missing' };
    if (
      !image.filePath ||
      !(
        isPathInside(libraryDir, image.filePath) ||
        (libraryContext && isManagedGenerationAssetPath(image.filePath, libraryContext))
      )
    )
      return { kind: 'rejected' };
    if (!(await fileExists(image.filePath))) return { kind: 'missing' };
    return { kind: 'ready', sourcePath: image.filePath, catalogImageId: image.id };
  }

  const sourcePath = input.sourcePath?.trim();
  if (!sourcePath) return { kind: 'missing' };
  if (!isPathInside(libraryDir, sourcePath)) return { kind: 'rejected' };
  if (!(await fileExists(sourcePath))) return { kind: 'missing' };
  return { kind: 'ready', sourcePath, catalogImageId: null };
}

function normalizeRun(run: SpriteAtlasRun): SpriteAtlasRun {
  const qa = run.qa
    ? {
        ...run.qa,
        filesReady: run.qa.filesReady ?? false,
        technical: run.qa.technical ?? {
          status: run.qa.ok ? ('pass' as const) : ('fail' as const),
          representative: run.qa.mode === 'generated_art' && run.qa.ok,
          issues: run.qa.issues ?? [],
        },
      }
    : null;
  return {
    ...run,
    qa,
    anchor: run.anchor ?? null,
    visualReview: run.visualReview ?? { status: 'pending', acceptedAt: null },
    rows: run.rows.map((row) => ({
      ...row,
      sourceSha256: row.sourceSha256 ?? null,
      catalogImageId: row.catalogImageId ?? null,
      normalization: row.normalization ?? null,
      // Older runs kept the one dispatched job id on a generating row.
      dispatch:
        row.dispatch ??
        (row.status === 'generating' && row.jobId
          ? { jobIds: [row.jobId], dispatchedAt: row.updatedAt }
          : null),
    })),
  };
}

const PENDING_JOB_STATUSES = new Set<Job['status']>(['queued', 'running']);

function isAwaitingRow(row: SpriteAtlasRowState) {
  return row.status === 'generating' || row.status === 'blocked';
}

function jobBlockedReason(rowId: string, jobId: string, job: Job | null) {
  const retry = `Queue ${rowId} again, or import a finished image by hand.`;
  if (!job) {
    return blockedReason('no_image_returned', `The ${rowId} job ${jobId} no longer exists.`, retry);
  }
  const detail = job.error ? ` ${job.error}` : '';
  if (job.status === 'failed') {
    return blockedReason('runner_failed', `The ${rowId} job failed.${detail}`, retry);
  }
  if (job.status === 'cancelled') {
    return blockedReason('runner_failed', `The ${rowId} job was cancelled.`, retry);
  }
  if (job.status === 'needs_review') {
    return blockedReason(
      'runner_failed',
      `The ${rowId} job needs review.${detail}`,
      `Resolve it in Queue, or queue ${rowId} again.`,
    );
  }
  return blockedReason('no_image_returned', `The ${rowId} job finished without an image.`, retry);
}

/** Run state without timestamps, so a settle that changes nothing is not saved. */
function runFingerprint(run: SpriteAtlasRun) {
  return JSON.stringify({
    ...run,
    updatedAt: null,
    rows: run.rows.map((row) => ({ ...row, updatedAt: null })),
  });
}

export function createSpriteAtlasService({
  readLibraryDir,
  allocateOutputGeneration,
  readOutputContext,
  getCatalogImage,
  createId = randomUUID,
  now = () => new Date().toISOString(),
}: CreateSpriteAtlasServiceOptions): SpriteAtlasService {
  const runLocks = new Map<string, Promise<unknown>>();

  /** Serializes every read-modify-write of one run's status.json. */
  function withRunLock<T>(runId: string, work: () => Promise<T>): Promise<T> {
    const key = safeSegment(runId);
    const result = (runLocks.get(key) ?? Promise.resolve()).then(work);
    const tail = result.catch(() => undefined);
    runLocks.set(key, tail);
    void tail.then(() => {
      if (runLocks.get(key) === tail) runLocks.delete(key);
    });
    return result;
  }

  async function saveRun(run: SpriteAtlasRun) {
    const updated = {
      ...run,
      status: resolveRunStatus(run),
      updatedAt: now(),
    };
    await writeJson(updated.paths.statusPath, updated);
    return updated;
  }

  async function getRun(runId: string) {
    const safeRunId = safeSegment(runId);
    const paths = createRunPaths(readLibraryDir(), safeRunId);
    const stored =
      (await readJson<SpriteAtlasRun>(paths.statusPath)) ??
      (await readJson<SpriteAtlasRun>(
        resolveLibraryPathFromRoot(
          readLibraryDir(),
          'outputs',
          'sprite-atlas',
          safeRunId,
          'status.json',
        ),
      ));
    return stored ? normalizeRun(stored) : null;
  }

  async function writeRowJob(run: SpriteAtlasRun, row: SpriteAtlasRowState, timestamp: string) {
    const jobId = safeSegment(`atlas-row-${row.id}-${createId()}`);
    const job: SpriteAtlasRowHandoffJob = {
      jobId,
      runId: run.id,
      rowId: row.id,
      status: 'ready',
      requestPath: run.paths.requestPath,
      promptPath: row.promptPath,
      layoutGuidePath: row.layoutGuidePath,
      identityAnchorPath: run.rows.find((item) => item.id === run.anchor?.rowId)?.rawPath ?? null,
      expectedOutputPath: path.join(run.paths.rawDir, `${safeSegment(row.id)}.png`),
      outboxPattern: `${jobId}-${safeSegment(row.id)}.png`,
      createdAt: timestamp,
    };

    await writeJson(path.join(run.paths.handoffInboxDir, `${jobId}.json`), job);
    row.status = 'handoff_ready';
    row.jobId = jobId;
    row.dispatch = null;
    row.blocked = null;
    row.updatedAt = timestamp;
    return job;
  }

  async function createRowJobsForRun(
    run: SpriteAtlasRun,
    rowIds: string[] | undefined,
    options: { force: boolean },
  ): Promise<CreateSpriteAtlasRowJobsResponse> {
    const requestedRows = rowIds?.length ? new Set(rowIds) : null;
    const timestamp = now();
    const jobs: SpriteAtlasRowHandoffJob[] = [];

    const rowsToWrite = run.rows.filter((row) => {
      if (requestedRows && !requestedRows.has(row.id)) return false;
      if (options.force) return true;
      const alreadyHandled =
        row.status === 'handoff_ready' ||
        row.status === 'generating' ||
        row.status === 'raw_imported' ||
        row.status === 'extracted';
      return !alreadyHandled && !row.jobId && !row.rawPath;
    });
    if (run.contract.workflowLane === 'animation' && !run.anchor) {
      const waiting = rowsToWrite.filter((row) => !isSpriteAtlasIdleRow(row.id));
      if (waiting.length > 0) {
        throw new SpriteAtlasActionError(
          'anchor_required',
          `Import an idle row before queueing ${waiting.map((row) => row.id).join(', ')}.`,
        );
      }
    }
    jobs.push(...(await Promise.all(rowsToWrite.map((row) => writeRowJob(run, row, timestamp)))));
    if (rowsToWrite.length > 0) reopenRunForRows(run);

    return {
      jobs,
      run: await saveRun(run),
    };
  }

  /** Imports an image into a row in memory and on disk. The caller saves the run. */
  async function importRowInRun(
    run: SpriteAtlasRun,
    row: SpriteAtlasRowState,
    input: ImportSpriteAtlasRowRequest,
  ) {
    const timestamp = now();
    if (isSafeBlockedReason(input.blocked)) {
      const jobId = row.jobId || safeSegment(`blocked-${row.id}-${createId()}`);
      await writeJson(
        path.join(run.paths.handoffOutboxDir, `${jobId}-blocked.json`),
        input.blocked,
      );
      row.status = 'blocked';
      row.blocked = input.blocked;
      row.updatedAt = timestamp;
      return;
    }

    const resolved = await resolveImportSource({
      input,
      libraryDir: readLibraryDir(),
      libraryContext: readOutputContext?.(),
      getCatalogImage,
    });
    const rejectImport = (failure: SpriteAtlasBlockedReason) => {
      if (row.rawPath && (row.status === 'raw_imported' || row.status === 'extracted')) {
        throw new SpriteAtlasActionError(
          failure.reasonKind,
          `${failure.userMessage} ${failure.suggestion} ${row.id} keeps its previous import.`,
        );
      }
      row.status = 'blocked';
      row.blocked = failure;
      row.updatedAt = timestamp;
    };
    if (resolved.kind === 'rejected') {
      return rejectImport(
        blockedReason(
          'path_rejected',
          'That image is outside the Studio Library.',
          'Import the image through Settings → Library & imports, then choose it here.',
        ),
      );
    }
    if (resolved.kind === 'missing') {
      return rejectImport(
        blockedReason(
          'no_image_returned',
          'No source row image was available to import.',
          'Generate or select a real row strip, then import it into this row.',
        ),
      );
    }
    const rowName = safeSegment(row.id);
    const sourceExtension = path.extname(resolved.sourcePath) || '.png';
    const normalizedPath = path.join(run.paths.rawDir, `${rowName}.png`);
    const strip = await normalizeRowStrip(run, row, resolved.sourcePath, normalizedPath);
    if (strip.kind === 'blocked') return rejectImport(strip.blocked);

    let outputPath = normalizedPath;
    let originalPath = normalizedPath;
    if (strip.normalized) {
      originalPath = path.join(run.paths.rawDir, `${rowName}.source${sourceExtension}`);
      await copyFile(resolved.sourcePath, originalPath);
    } else {
      outputPath = path.join(run.paths.rawDir, `${rowName}${sourceExtension}`);
      originalPath = outputPath;
      await copyFile(resolved.sourcePath, outputPath);
    }
    const digest = await sha256File(outputPath);
    row.rawPath = outputPath;
    row.sourceSha256 = digest;
    row.normalization = {
      normalized: strip.normalized,
      sourceSize: strip.sourceSize,
      kernel: strip.kernel,
      fit: strip.fit,
      sourcePath: originalPath,
      sourceSha256: strip.normalized ? await sha256File(originalPath) : digest,
    };
    row.catalogImageId = resolved.catalogImageId;
    row.status = 'raw_imported';
    row.blocked = null;
    row.updatedAt = timestamp;
    if (isSpriteAtlasIdleRow(row.id) && (!run.anchor || run.anchor.rowId === row.id)) {
      run.anchor = { rowId: row.id, sha256: digest };
    }
    run.qa = null;
    run.visualReview = { status: 'pending', acceptedAt: null };
    run.status = 'ready_to_extract';
  }

  /**
   * Folds one dispatched job into its row. A job outside the row's current set is stale. The
   * first finished image of the set is imported; later siblings stay in the Catalog. A failure
   * blocks the row only when no sibling is still pending or holds an image.
   */
  async function settleRowJobInRun(
    run: SpriteAtlasRun,
    row: SpriteAtlasRowState,
    jobId: string,
    job: Job | null,
    lookup: SpriteAtlasJobLookup,
  ) {
    const dispatch = row.dispatch;
    if (!dispatch?.jobIds.includes(jobId) || !isAwaitingRow(row)) return;
    if (job && PENDING_JOB_STATUSES.has(job.status)) {
      if (row.status !== 'blocked') return;
      row.status = 'generating';
      row.blocked = null;
      row.updatedAt = now();
      return;
    }
    const image = job?.status === 'completed' ? lookup.getCatalogImageByJobId(jobId) : null;
    if (image) {
      await importRowInRun(run, row, { rowId: row.id, catalogImageId: image.id });
      return;
    }
    if (row.status === 'blocked') return;
    const siblingAlive = dispatch.jobIds.some((siblingId) => {
      if (siblingId === jobId) return false;
      const sibling = lookup.getJob(siblingId);
      if (!sibling) return false;
      if (PENDING_JOB_STATUSES.has(sibling.status)) return true;
      return sibling.status === 'completed' && Boolean(lookup.getCatalogImageByJobId(siblingId));
    });
    if (siblingAlive) return;
    row.status = 'blocked';
    row.blocked = jobBlockedReason(row.id, jobId, job);
    row.updatedAt = now();
  }

  return {
    listPresets() {
      return createSpriteAtlasPresetSummaries();
    },
    async listRuns() {
      const roots = ['state', 'outputs'].map((section) =>
        resolveLibraryPathFromRoot(readLibraryDir(), section, 'sprite-atlas'),
      );
      const groups = await Promise.all(
        roots.map((root) => readdir(root, { withFileTypes: true }).catch(() => [])),
      );
      const ids = [
        ...new Set(
          groups.flatMap((entries) =>
            entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name),
          ),
        ),
      ];
      const runs = await Promise.all(ids.map(getRun));
      return runs
        .flatMap((run) => (run ? [run] : []))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    getRun,
    async createRun(input) {
      const runId = safeSegment(`atlas-${createId()}`);
      const timestamp = now();
      const paths = createRunPaths(readLibraryDir(), runId);
      const outputContext = readOutputContext?.(input.workspaceId) ?? {
        libraryId: '',
        rootPath: readLibraryDir(),
      };
      const outputInput = {
        jobId: runId,
        recipeId: 'sprite-atlas',
        createdAt: new Date(timestamp),
        extension: '.png',
      };
      paths.atlasPath = captureWorkflowOutput(outputContext, outputInput, allocateOutputGeneration);
      paths.manifestPath = captureWorkflowOutput(
        outputContext,
        { ...outputInput, extension: '.json' },
        allocateOutputGeneration,
      );
      const contract = createSpriteAtlasContract({ ...input });
      const run: SpriteAtlasRun = {
        id: runId,
        title: input.title?.trim() || `${contract.presetId} atlas`,
        status: 'prepared',
        createdAt: timestamp,
        updatedAt: timestamp,
        contract,
        paths,
        rows: [],
        qa: null,
        visualReview: { status: 'pending', acceptedAt: null },
        anchor: null,
      };
      run.rows = createRows(run, timestamp);

      await ensureRunDirs(paths);
      await writeJson(paths.requestPath, {
        version: 1,
        prompt: input.prompt ?? '',
        contract,
      });
      await Promise.all(
        run.rows.flatMap((row) => [
          writeFile(row.promptPath, createRowPrompt(run, row, input.prompt ?? ''), 'utf8'),
          writeLayoutGuide(run, row),
        ]),
      );
      return saveRun(run);
    },
    createRowJob(runId, rowId) {
      return withRunLock(runId, async () => {
        const run = await getRun(runId);
        if (!run) return null;
        const row = run.rows.find((item) => item.id === rowId);
        if (!row) return null;
        const result = await createRowJobsForRun(run, [rowId], { force: true });
        return result.jobs[0] ?? null;
      });
    },
    createRowJobs(runId, rowIds) {
      return withRunLock(runId, async () => {
        const run = await getRun(runId);
        if (!run) return null;
        return createRowJobsForRun(run, rowIds, { force: false });
      });
    },
    async readRowPrompt(runId, rowId) {
      const run = await getRun(runId);
      if (!run) return null;
      const row = run.rows.find((item) => item.id === rowId);
      if (!row) return null;
      const prompt = await readFile(row.promptPath, 'utf8').catch(() => null);
      if (prompt === null) return null;
      return {
        rowId: row.id,
        prompt,
        promptPath: row.promptPath,
      };
    },
    importRow(runId, input) {
      return withRunLock(runId, async () => {
        const run = await getRun(runId);
        if (!run) return null;
        const row = run.rows.find((item) => item.id === input.rowId);
        if (!row) return null;
        await importRowInRun(run, row, input);
        return saveRun(run);
      });
    },
    compose(runId) {
      return withRunLock(runId, async () => {
        const run = await getRun(runId);
        if (!run) return null;
        if (run.contract.workflowLane === 'static-items') {
          throw new SpriteAtlasActionError(
            'static_items_blocked',
            'Irregular item sheets stay in spritesheet-expert. Run run_item_atlas_workflow.py on the source sheet.',
          );
        }
        const missingRows = run.rows.filter(
          (row) => !row.rawPath || !(row.status === 'raw_imported' || row.status === 'extracted'),
        );
        if (missingRows.length > 0) {
          throw new SpriteAtlasActionError(
            'rows_missing',
            `Import every row before composing: ${missingRows.map((row) => row.id).join(', ')}`,
          );
        }

        const measured = await Promise.all(
          run.rows.map(async (row) => {
            const mismatch = await checkRowStripGeometry(run, row, row.rawPath!);
            return mismatch ? [{ row, mismatch }] : [];
          }),
        );
        const mismatched = measured.flat();
        if (mismatched.length > 0) {
          const timestamp = now();
          for (const { row, mismatch } of mismatched) {
            row.status = 'blocked';
            row.blocked = {
              ...mismatch,
              suggestion: `${mismatch.suggestion} The previous atlas was left in place.`,
            };
            row.updatedAt = timestamp;
          }
          await saveRun(run);
          throw new SpriteAtlasActionError(
            'geometry_mismatch',
            `Row strip size does not match the contract: ${mismatched.map((item) => item.row.id).join(', ')}.`,
          );
        }

        const columns = Math.max(1, run.contract.columns);
        const cellWidth = run.contract.cell.width;
        const cellHeight = run.contract.cell.height;
        const rowOffsets = new Map<string, number>();
        let atlasRowCount = 0;
        for (const row of run.rows) {
          rowOffsets.set(row.id, atlasRowCount);
          atlasRowCount += Math.ceil(row.frames / columns);
        }
        const width = columns * cellWidth;
        const height = Math.max(1, atlasRowCount) * cellHeight;
        const stagingDir = path.join(run.paths.runDir, '.compose-staging');
        const stagingFramesDir = path.join(stagingDir, 'frames');
        await rm(stagingDir, { recursive: true, force: true });
        await mkdir(stagingFramesDir, { recursive: true });
        const rowSpecs = new Map(run.contract.rows.map((row) => [row.id, row]));
        const origin = frameOrigin(run);
        const composites: Array<{ input: string; left: number; top: number }> = [];
        const frameLayout: Array<{
          id: string;
          fps: number;
          loop: boolean;
          normalized: boolean;
          sourceSize?: { w: number; h: number };
          kernel?: SpriteAtlasRowNormalization['kernel'];
          fit?: SpriteAtlasRowNormalization['fit'];
          frames: Array<{
            source: string;
            x: number;
            y: number;
            width: number;
            height: number;
            origin: { x: number; y: number };
          }>;
        }> = [];

        for (const row of run.rows) {
          const rawPath = row.rawPath!;
          const baseRow = rowOffsets.get(row.id) ?? 0;
          const frames = [];
          for (let frameIndex = 0; frameIndex < row.frames; frameIndex += 1) {
            const framePath = path.join(
              stagingFramesDir,
              `${safeSegment(row.id)}-${String(frameIndex + 1).padStart(2, '0')}.png`,
            );
            await authoringSharp(rawPath)
              .extract({
                left: frameIndex * cellWidth,
                top: 0,
                width: cellWidth,
                height: cellHeight,
              })
              .png()
              .toFile(framePath);
            const x = (frameIndex % columns) * cellWidth;
            const y = (baseRow + Math.floor(frameIndex / columns)) * cellHeight;
            composites.push({ input: framePath, left: x, top: y });
            frames.push({
              source: path.basename(framePath),
              x,
              y,
              width: cellWidth,
              height: cellHeight,
              origin,
            });
          }
          const rowSpec = rowSpecs.get(row.id);
          const normalization = row.normalization;
          frameLayout.push({
            id: row.id,
            fps: rowSpec?.fps ?? 1,
            loop: rowSpec?.loop ?? false,
            ...(normalization?.normalized
              ? {
                  normalized: true,
                  sourceSize: normalization.sourceSize,
                  kernel: normalization.kernel,
                  fit: normalization.fit,
                }
              : { normalized: false }),
            frames,
          });
        }

        const stagingAtlasPath = path.join(stagingDir, 'atlas.png');
        const stagingManifestPath = path.join(stagingDir, 'manifest.json');
        await authoringSharp({
          create: {
            width,
            height,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          },
        })
          .composite(composites)
          .png()
          .toFile(stagingAtlasPath);
        await writeJson(stagingManifestPath, {
          version: 1,
          mode: 'generated_art',
          workflow_lane: run.contract.workflowLane,
          frame_semantics: run.contract.frameSemantics,
          atlas: { file: path.basename(run.paths.atlasPath), width, height },
          cell: run.contract.cell,
          columns,
          frame_layout: frameLayout,
        });
        await publishStagedCompose({
          framesDir: run.paths.framesDir,
          atlasPath: run.paths.atlasPath,
          manifestPath: run.paths.manifestPath,
          stagingFramesDir,
          stagingAtlasPath,
          stagingManifestPath,
        });
        await rm(stagingDir, { recursive: true, force: true });
        const extractedAt = now();
        for (const row of run.rows) {
          row.status = 'extracted';
          row.blocked = null;
          row.updatedAt = extractedAt;
        }
        run.qa = null;
        run.visualReview = { status: 'pending', acceptedAt: null };
        run.status = 'composed';
        return saveRun(run);
      });
    },
    async composeFixture(runId) {
      const run = await getRun(runId);
      if (!run) return null;
      const rows =
        run.contract.rows.length > 0
          ? run.contract.rows
          : [{ id: 'custom', frames: 1, fps: 1, loop: false, action: '', mirrorPair: null }];
      const width = run.contract.cell.width * Math.max(1, run.contract.columns);
      const height = run.contract.cell.height * rows.length;
      const rects = rows
        .map((row, rowIndex) =>
          Array.from({ length: row.frames }, (_, frameIndex) => {
            const x = frameIndex * run.contract.cell.width;
            const y = rowIndex * run.contract.cell.height;
            const hue = (rowIndex * 47 + frameIndex * 19) % 360;
            return `<rect x="${x + 4}" y="${y + 4}" width="${run.contract.cell.width - 8}" height="${run.contract.cell.height - 8}" rx="4" fill="hsl(${hue}, 54%, 42%)"/>`;
          }).join(''),
        )
        .join('');
      const labels = rows
        .map((row, rowIndex) => {
          const y = rowIndex * run.contract.cell.height + 24;
          return `<text x="8" y="${y}" fill="#f4f4f5" font-size="14" font-family="monospace">${row.id}</text>`;
        })
        .join('');
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="none"/>${rects}${labels}</svg>`;
      // Test art stays beside the run. It never replaces the production atlas or its checks.
      const fixtureDir = path.join(run.paths.runDir, 'fixture');
      await mkdir(fixtureDir, { recursive: true });
      await writePngFromSvg(svg, path.join(fixtureDir, 'atlas.png'));

      const origin = frameOrigin(run);
      await writeJson(path.join(fixtureDir, 'manifest.json'), {
        version: 1,
        mode: 'fixture_smoke',
        frame_layout: rows.map((row, rowIndex) => ({
          id: row.id,
          fps: row.fps,
          loop: row.loop,
          frames: Array.from({ length: row.frames }, (_, frameIndex) => ({
            x: frameIndex * run.contract.cell.width,
            y: rowIndex * run.contract.cell.height,
            width: run.contract.cell.width,
            height: run.contract.cell.height,
            origin,
          })),
        })),
      });

      return run;
    },
    runQa(runId) {
      return withRunLock(runId, async () => {
        const run = await getRun(runId);
        if (!run) return null;
        const issues: string[] = [];
        const manifest = await readFile(run.paths.manifestPath, 'utf8')
          .then((contents) => JSON.parse(contents) as { mode?: string })
          .catch(() => null);
        const mode: SpriteAtlasQaReport['mode'] =
          manifest?.mode === 'generated_art' ? 'generated_art' : 'fixture_smoke';
        if (!manifest || !['generated_art', 'fixture_smoke'].includes(manifest.mode ?? ''))
          issues.push('The atlas manifest does not identify a valid composition mode.');
        const checks = await Promise.all([
          fileExists(run.paths.requestPath),
          fileExists(run.paths.atlasPath),
          fileExists(run.paths.manifestPath),
          ...run.rows.map((row) => fileExists(row.promptPath)),
          ...run.rows.map((row) => fileExists(row.layoutGuidePath)),
        ]);
        if (!checks[0]) issues.push('sprite-request.json is missing.');
        if (!checks[1]) issues.push('atlas.png is missing.');
        if (!checks[2]) issues.push('manifest.json is missing.');
        if (checks.slice(3).some((ok) => !ok))
          issues.push('One or more prompts or layout guides are missing.');
        const filesReady = checks.every(Boolean) && Boolean(manifest);

        if (mode === 'generated_art') {
          for (const row of run.rows) {
            if (!row.rawPath || !row.sourceSha256 || !(await fileExists(row.rawPath))) {
              issues.push(`${row.id} has no hashed source strip.`);
              continue;
            }
            const digest = await sha256File(row.rawPath);
            if (digest !== row.sourceSha256)
              issues.push(`${row.id} source hash does not match the import.`);
            const original = row.normalization?.normalized ? row.normalization : null;
            if (
              original &&
              (!(await fileExists(original.sourcePath)) ||
                (await sha256File(original.sourcePath)) !== original.sourceSha256)
            ) {
              issues.push(`${row.id} provider image hash does not match the import.`);
            }
            const metadata = await authoringSharp(row.rawPath).metadata();
            if (
              metadata.width !== run.contract.cell.width * row.frames ||
              metadata.height !== run.contract.cell.height
            ) {
              issues.push(`${row.id} strip size does not match the contract.`);
            }
            const framePaths = Array.from({ length: row.frames }, (_, index) =>
              path.join(
                run.paths.framesDir,
                `${safeSegment(row.id)}-${String(index + 1).padStart(2, '0')}.png`,
              ),
            );
            const frameChecks = await Promise.all(
              framePaths.map((framePath) => fileExists(framePath)),
            );
            if (frameChecks.some((exists) => !exists))
              issues.push(`${row.id} is missing an extracted frame.`);
          }
          if (run.contract.workflowLane === 'animation' && !run.anchor) {
            issues.push('Import an idle row before a technical pass.');
          }
          if (run.contract.workflowLane === 'tileset') {
            for (const spec of run.contract.rows) {
              if (!spec.repeatMode) {
                issues.push(`${spec.id} needs repeat mode self, adjacency, or overlay.`);
                continue;
              }
              if (spec.repeatMode === 'adjacency' && !spec.tileRole?.trim()) {
                issues.push(`${spec.id} needs a tile role.`);
              }
              if (spec.repeatMode === 'self') {
                const previewPath = path.join(
                  path.dirname(run.paths.qaReportPath),
                  `${safeSegment(spec.id)}-repeat-3x3.png`,
                );
                const framePath = path.join(run.paths.framesDir, `${safeSegment(spec.id)}-01.png`);
                if (await fileExists(framePath)) {
                  await writeRepeatPreview(framePath, previewPath);
                }
                if (!(await fileExists(previewPath))) {
                  issues.push(`${spec.id} is missing its 3×3 repeat preview.`);
                }
              }
            }
          }
          if (run.contract.workflowLane === 'static-items') {
            issues.push('Irregular item sheets are not a technical pass in this app.');
          }
        } else {
          issues.push('The composed atlas is test art. This is not a technical pass.');
        }

        const representative = mode === 'generated_art';
        const technical = {
          status: issues.length === 0 ? ('pass' as const) : ('fail' as const),
          representative: representative && issues.length === 0,
          issues,
        };
        const report: SpriteAtlasQaReport = {
          ok: technical.status === 'pass' && technical.representative,
          filesReady,
          mode,
          checkedAt: now(),
          issues,
          technical,
          summary:
            mode === 'generated_art'
              ? technical.status === 'pass'
                ? 'Technical check passed for representative row art.'
                : 'Technical check failed for representative row art.'
              : 'Fixture art can exercise the route. It is not a technical pass.',
        };
        run.qa = report;
        await writeJson(run.paths.qaReportPath, report);
        return saveRun(run);
      });
    },
    acceptVisualReview(runId) {
      return withRunLock(runId, async () => {
        const run = await getRun(runId);
        if (!run) return null;
        run.visualReview = { status: 'accepted', acceptedAt: now() };
        return saveRun(run);
      });
    },
    async validateRowDispatch(runId, rowId) {
      const run = await getRun(runId);
      if (!run) {
        return { code: 'run_not_found', message: `Sprite Atlas run ${runId} was not found.` };
      }
      const row = run.rows.find((item) => item.id === rowId);
      if (!row) {
        return { code: 'row_not_found', message: `${run.title} has no row named ${rowId}.` };
      }
      if (
        run.contract.workflowLane === 'animation' &&
        !isSpriteAtlasIdleRow(row.id) &&
        !run.anchor
      ) {
        return {
          code: 'anchor_required',
          message: `Import an idle row before queueing ${row.id}.`,
        };
      }
      return null;
    },
    recordRowDispatch(runId, rowId, jobIds) {
      return withRunLock(runId, async () => {
        const run = await getRun(runId);
        const row = run?.rows.find((item) => item.id === rowId);
        if (!run || !row) return null;
        const ids = [...new Set(jobIds.map((jobId) => jobId.trim()).filter(Boolean))];
        if (ids.length === 0) return run;
        const timestamp = now();
        const isRetry = ids.every((jobId) => row.dispatch?.jobIds.includes(jobId));
        if (isRetry) {
          // An imported row keeps its strip. A retried sibling stays in the Catalog.
          if (!isAwaitingRow(row) || row.status === 'generating') return run;
        } else {
          row.dispatch = { jobIds: ids, dispatchedAt: timestamp };
          row.jobId = ids[0]!;
          reopenRunForRows(run);
        }
        row.status = 'generating';
        row.blocked = null;
        row.updatedAt = timestamp;
        return saveRun(run);
      });
    },
    settleRowJob(runId, rowId, job, lookup) {
      return withRunLock(runId, async () => {
        const run = await getRun(runId);
        const row = run?.rows.find((item) => item.id === rowId);
        if (!run || !row) return false;
        const before = runFingerprint(run);
        await settleRowJobInRun(run, row, job.id, job, lookup);
        if (runFingerprint(run) === before) return false;
        await saveRun(run);
        return true;
      });
    },
    reconcileRun(runId, lookup) {
      return withRunLock(runId, async () => {
        const run = await getRun(runId);
        if (!run) return null;
        const before = runFingerprint(run);
        for (const row of run.rows) {
          for (const jobId of row.dispatch?.jobIds ?? []) {
            await settleRowJobInRun(run, row, jobId, lookup.getJob(jobId), lookup);
          }
        }
        if (runFingerprint(run) === before) return { run, changed: false };
        return { run: await saveRun(run), changed: true };
      });
    },
  };
}
