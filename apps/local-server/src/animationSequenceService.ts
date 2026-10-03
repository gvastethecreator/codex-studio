import { isManagedGenerationAssetPath } from './managedAssetPolicy';
import { captureWorkflowOutput } from './outputDestination';
import { toPublicAssetUrl } from './library';
import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, rename, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { authoringSharp } from './sharpAuthoringAdapter';
import {
  createAnimationSequenceContract,
  createAnimationSequenceFramePlan,
  isAnimationSequenceFrameAwaitingJob,
  listAnimationSequenceFrameJobIds,
  type AnimationSequenceBlockedReason,
  type AnimationSequenceExportRecord,
  type AnimationSequenceFramePromptResponse,
  type AnimationSequenceFrameState,
  type AnimationSequenceQaReport,
  type AnimationSequenceRun,
  type AnimationSequenceRunPaths,
  type AttachAnimationSequenceFrameRequest,
  type CreateAnimationSequenceRunRequest,
  type ExportAnimationSequenceGifRequest,
} from '../../../packages/shared/src/animationSequenceContracts';
import type { GenerationTaskSpec } from '../../../packages/shared/src/generationContracts';
import type { JobLibraryContext, CatalogImage, Job } from '../../../packages/shared/src/types';
import { encodeGif, type GifRgbaFrame } from './animationGifEncoder';
import { resolveLibraryPathFromRoot } from './library';
import { getJob as getStoredJob } from './db/jobs';
import type { WorkflowRunDispatchIssue } from './workflowRunReconciler';

export interface AnimationSequenceService {
  listRuns(): Promise<AnimationSequenceRun[]>;
  getRun(runId: string): Promise<AnimationSequenceRun | null>;
  createRun(input: CreateAnimationSequenceRunRequest): Promise<AnimationSequenceRun>;
  readFramePrompt(
    runId: string,
    frameId: string,
  ): Promise<AnimationSequenceFramePromptResponse | null>;
  /** Manual Attach of a user-chosen image. */
  attachFrame(
    runId: string,
    input: AttachAnimationSequenceFrameRequest,
  ): Promise<AnimationSequenceRun | null>;
  /** Rejects a frame job whose run or frame does not exist. */
  validateDispatch(spec: GenerationTaskSpec): Promise<WorkflowRunDispatchIssue | null>;
  /** Links accepted frame jobs to their frames before a worker can start them. */
  recordDispatch(jobs: Job[]): Promise<void>;
  /** Folds a settled or requeued frame job into its run. True when the run changed. */
  settleJob(job: Job): Promise<boolean>;
  /** Re-reads every linked job of one run and settles what finished. */
  reconcileRun(runId: string): Promise<AnimationSequenceRun | null>;
  /** Startup repair: links unrecorded recoverable jobs and settles finished ones. */
  recoverRuns(recoverableJobs: Job[]): Promise<void>;
  exportGif(
    runId: string,
    input?: ExportAnimationSequenceGifRequest,
  ): Promise<{
    run: AnimationSequenceRun;
    export: AnimationSequenceExportRecord;
  } | null>;
  runQa(runId: string): Promise<AnimationSequenceRun | null>;
}

export interface CreateAnimationSequenceServiceOptions {
  readLibraryDir: () => string;
  readOutputContext?: (workspaceId?: string) => JobLibraryContext;
  getCatalogImage?: (imageId: string) => CatalogImage | null;
  /** Stored job reads for reconciliation. Defaults to the Studio database. */
  getJob?: (jobId: string) => Job | null;
  createId?: () => string;
  now?: () => string;
}

function safeSegment(value: string) {
  return (
    value
      .trim()
      .replace(/[^a-zA-Z0-9_.-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item'
  );
}

function isPathInside(parentPath: string, childPath: string) {
  const parent = path.resolve(parentPath);
  const child = path.resolve(childPath);
  const relative = path.relative(parent, child);
  return Boolean(relative) && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function createRunPaths(libraryDir: string, runId: string): AnimationSequenceRunPaths {
  const runDir = resolveLibraryPathFromRoot(libraryDir, 'state', 'animation-sequence', runId);
  return {
    runDir,
    requestPath: path.join(runDir, 'animation-request.json'),
    statusPath: path.join(runDir, 'animation-sequence-run.json'),
    framePlanPath: path.join(runDir, 'frame-plan.json'),
    promptsDir: path.join(runDir, 'prompts'),
    referencesDir: path.join(runDir, 'references'),
    rawDir: path.join(runDir, 'raw'),
    framesDir: path.join(runDir, 'frames'),
    exportsDir: path.join(runDir, 'exports'),
    gifPath: path.join(runDir, 'exports', 'animation.gif'),
    qaReportPath: path.join(runDir, 'qa', 'report.json'),
  };
}

function toPublicRunAssetUrl(libraryDir: string, filePath: string) {
  const relative = path.relative(libraryDir, filePath).replaceAll(path.sep, '/');
  return `/library/${encodeURIComponent(relative).replaceAll('%2F', '/')}`;
}

async function ensureRunDirs(paths: AnimationSequenceRunPaths) {
  await Promise.all([
    mkdir(paths.runDir, { recursive: true }),
    mkdir(paths.promptsDir, { recursive: true }),
    mkdir(paths.referencesDir, { recursive: true }),
    mkdir(paths.rawDir, { recursive: true }),
    mkdir(paths.framesDir, { recursive: true }),
    mkdir(paths.exportsDir, { recursive: true }),
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

async function fileSize(filePath: string | null | undefined) {
  if (!filePath) return null;
  try {
    const result = await stat(filePath);
    return result.size;
  } catch {
    return null;
  }
}

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(filePath, 'utf8')) as T;
  } catch {
    return null;
  }
}

// Write beside the target and rename, so a crash never leaves a truncated run record.
async function writeJson(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${randomUUID()}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(tempPath, filePath);
}

function createFrameStates(
  run: Pick<AnimationSequenceRun, 'framePlan' | 'paths'>,
  timestamp: string,
) {
  return run.framePlan.frames.map<AnimationSequenceFrameState>((frame) => ({
    id: frame.id,
    index: frame.index,
    ordinal: frame.ordinal,
    status: 'prompt_ready',
    promptPath: path.join(run.paths.promptsDir, `${frame.id}.txt`),
    rawPath: null,
    framePath: null,
    catalogImageId: null,
    jobId: null,
    dispatch: null,
    width: null,
    height: null,
    blocked: null,
    updatedAt: timestamp,
  }));
}

function resolveRunStatus(run: AnimationSequenceRun): AnimationSequenceRun['status'] {
  if (run.frames.some((frame) => frame.status === 'blocked')) return 'blocked';
  if (run.qa?.ok) return 'qa_passed';
  if (run.exports.some((item) => item.format === 'gif')) return 'exported';
  if (run.frames.length > 0 && run.frames.every((frame) => frame.status === 'generated')) {
    return 'ready_for_review';
  }
  if (run.frames.some((frame) => frame.status === 'generating')) return 'generating';
  if (run.frames.some((frame) => frame.status === 'correcting')) return 'correcting';
  if (run.frames.some((frame) => frame.status === 'generated')) return 'waiting_for_frame';
  return 'planned';
}

function invalidateGifExport(run: AnimationSequenceRun) {
  run.exports = run.exports.filter((item) => item.format !== 'gif');
  run.qa = null;
}

interface FrameDispatchTarget {
  runId: string;
  frameId?: string;
  frameIndex?: number;
  correctionMode: boolean;
}

/** Frame jobs carry their run and frame in the Animation Frame Handoff recipe params. */
function readDispatchTarget(
  spec: Pick<GenerationTaskSpec, 'recipeParams'> | null | undefined,
): FrameDispatchTarget | null {
  const params = spec?.recipeParams ?? {};
  const runId = typeof params.runId === 'string' ? params.runId.trim() : '';
  if (!runId) return null;
  return {
    runId,
    frameId: typeof params.frameId === 'string' ? params.frameId : undefined,
    frameIndex: typeof params.frameIndex === 'number' ? params.frameIndex : undefined,
    correctionMode: params.correctionMode === true,
  };
}

function groupJobsByRun(jobs: Job[]) {
  const groups = new Map<string, Job[]>();
  for (const job of jobs) {
    const runId = readDispatchTarget(job.sourceSpec)?.runId;
    if (runId) groups.set(runId, [...(groups.get(runId) ?? []), job]);
  }
  return groups;
}

const PENDING_JOB_STATUSES = new Set<Job['status']>(['queued', 'running']);

function readJobCatalogImageId(job: Job | null) {
  return job?.status === 'completed' ? (job.finalization?.catalogId ?? null) : null;
}

/** A job that may still attach an image to its frame. */
function canJobLand(job: Job | null) {
  return Boolean(job && (PENDING_JOB_STATUSES.has(job.status) || readJobCatalogImageId(job)));
}

/** Blocked frames whose jobs may still land stay linked, so a retried job can attach. */
function needsReconcile(frame: AnimationSequenceFrameState) {
  return (
    listAnimationSequenceFrameJobIds(frame).length > 0 &&
    (isAnimationSequenceFrameAwaitingJob(frame) || frame.status === 'blocked')
  );
}

function markFrameAwaiting(
  frame: AnimationSequenceFrameState,
  correctionMode: boolean,
  timestamp: string,
) {
  // A correction keeps the current image as its preview until the result lands.
  frame.status = correctionMode ? 'correcting' : 'generating';
  frame.blocked = null;
  frame.updatedAt = timestamp;
}

function blockedReason(
  reasonKind: AnimationSequenceBlockedReason['reasonKind'],
  userMessage: string,
  suggestion: string,
): AnimationSequenceBlockedReason {
  return { status: 'blocked', reasonKind, userMessage, suggestion };
}

const RETRY_SUGGESTION = 'Select Retry to queue this frame again.';

/** Why a settled job produced no frame image. */
function describeUnfinishedJob(job: Job | null) {
  if (!job) return blockedReason('unknown', 'The frame job no longer exists.', RETRY_SUGGESTION);
  if (job.status === 'failed') {
    return blockedReason(
      'runner_failed',
      job.error ? `The frame job failed: ${job.error}` : 'The frame job failed.',
      RETRY_SUGGESTION,
    );
  }
  if (job.status === 'cancelled') {
    return blockedReason('runner_failed', 'The frame job was cancelled.', RETRY_SUGGESTION);
  }
  if (job.status === 'needs_review') {
    return blockedReason(
      'no_image_returned',
      'The frame job needs review: the provider did not confirm an image.',
      'Resolve the job in Queue, then select Sync. Or select Retry to queue the frame again.',
    );
  }
  return blockedReason(
    'no_image_returned',
    'The frame job completed, but its image is not in the Catalog.',
    RETRY_SUGGESTION,
  );
}

function resolveFrame(
  run: AnimationSequenceRun,
  input: Pick<AttachAnimationSequenceFrameRequest, 'frameId' | 'frameIndex'>,
) {
  const requestedId = input.frameId?.trim();
  const requestedIndex =
    typeof input.frameIndex === 'number' && Number.isFinite(input.frameIndex)
      ? Math.round(input.frameIndex)
      : null;
  return (
    run.frames.find((frame) => frame.id === requestedId) ??
    run.frames.find((frame) => frame.index === requestedIndex) ??
    null
  );
}

function resolveSourcePath({
  input,
  getCatalogImage,
  libraryDir,
  libraryContext,
}: {
  input: AttachAnimationSequenceFrameRequest;
  getCatalogImage?: (imageId: string) => CatalogImage | null;
  libraryDir: string;
  libraryContext?: JobLibraryContext;
}) {
  const catalogImageId = input.catalogImageId?.trim();
  if (catalogImageId && getCatalogImage) {
    const image = getCatalogImage(catalogImageId);
    if (
      image?.filePath &&
      (isPathInside(libraryDir, image.filePath) ||
        (libraryContext && isManagedGenerationAssetPath(image.filePath, libraryContext)))
    ) {
      return { sourcePath: image.filePath, catalogImageId: image.id };
    }
  }

  const sourcePath = input.sourcePath?.trim();
  if (sourcePath && isPathInside(libraryDir, sourcePath)) {
    return { sourcePath, catalogImageId: catalogImageId || null };
  }

  return { sourcePath: null, catalogImageId: catalogImageId || null };
}

export function createAnimationSequenceService({
  readLibraryDir,
  readOutputContext,
  getCatalogImage,
  getJob = (jobId) => getStoredJob(jobId),
  createId = randomUUID,
  now = () => new Date().toISOString(),
}: CreateAnimationSequenceServiceOptions): AnimationSequenceService {
  const runLocks = new Map<string, Promise<void>>();

  function withRunLock<T>(runId: string, task: () => Promise<T>) {
    const key = safeSegment(runId);
    const result = (runLocks.get(key) ?? Promise.resolve()).then(task);
    const settled = result.then(
      () => undefined,
      () => undefined,
    );
    runLocks.set(key, settled);
    void settled.then(() => {
      if (runLocks.get(key) === settled) runLocks.delete(key);
    });
    return result;
  }

  async function saveRun(run: AnimationSequenceRun) {
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
    return (
      (await readJson<AnimationSequenceRun>(paths.statusPath)) ??
      readJson<AnimationSequenceRun>(
        resolveLibraryPathFromRoot(
          readLibraryDir(),
          'outputs',
          'animation-sequence',
          safeRunId,
          'animation-sequence-run.json',
        ),
      )
    );
  }

  /** Copies a managed source image into the frame. The frame blocks when it is missing or off-size. */
  async function applyFrameSource(
    run: AnimationSequenceRun,
    frame: AnimationSequenceFrameState,
    input: Pick<AttachAnimationSequenceFrameRequest, 'catalogImageId' | 'sourcePath'>,
  ) {
    const timestamp = now();
    const { sourcePath, catalogImageId } = resolveSourcePath({
      input,
      getCatalogImage,
      libraryDir: readLibraryDir(),
      libraryContext: readOutputContext?.(),
    });

    if (!sourcePath || !(await fileExists(sourcePath))) {
      frame.status = 'blocked';
      frame.blocked = {
        status: 'blocked',
        reasonKind: 'source_missing',
        userMessage: 'No managed source image was available for this frame.',
        suggestion: 'Generate or import the frame image into the Studio Library, then attach it.',
      };
      frame.updatedAt = timestamp;
      return;
    }

    const rawPath = path.join(run.paths.rawDir, `${frame.id}${path.extname(sourcePath) || '.png'}`);
    const framePath = path.join(run.paths.framesDir, `${frame.id}.png`);
    await copyFile(sourcePath, rawPath);
    const metadata = await authoringSharp(sourcePath).metadata();
    const exactSize =
      metadata.width === run.contract.dimensions.width &&
      metadata.height === run.contract.dimensions.height;
    const hasAlpha = metadata.hasAlpha === true;
    const hasTransparency = hasAlpha && !(await authoringSharp(sourcePath).stats()).isOpaque;
    if (!exactSize) {
      frame.status = 'blocked';
      frame.rawPath = rawPath;
      frame.framePath = null;
      frame.catalogImageId = catalogImageId;
      frame.width = metadata.width ?? null;
      frame.height = metadata.height ?? null;
      frame.blocked = {
        status: 'blocked',
        reasonKind: 'geometry_mismatch',
        userMessage: `This frame is ${metadata.width ?? 0}×${metadata.height ?? 0}. The contract is ${run.contract.dimensions.width}×${run.contract.dimensions.height}.`,
        suggestion:
          'Select Retry to generate the frame at the run size. This workflow does not crop or scale frames.',
      };
      frame.updatedAt = timestamp;
      return;
    }

    frame.warning =
      !hasTransparency && run.contract.background === 'transparent'
        ? 'Transparent output was requested, but this frame is opaque. The original frame is preserved.'
        : null;
    if (run.contract.background === 'solid') {
      await authoringSharp(sourcePath)
        .flatten({ background: run.contract.matteColor })
        .png()
        .toFile(framePath);
    } else {
      await authoringSharp(sourcePath).png().toFile(framePath);
    }
    const info = await authoringSharp(framePath).metadata();

    frame.status = 'generated';
    frame.rawPath = rawPath;
    frame.framePath = framePath;
    frame.catalogImageId = catalogImageId;
    frame.width = info.width ?? null;
    frame.height = info.height ?? null;
    frame.blocked = null;
    frame.updatedAt = timestamp;
  }

  /**
   * Every read-modify-write of one run record runs alone, so concurrent writers cannot drop
   * updates. The run is saved only when the edit reports a change.
   */
  function updateRun(runId: string, edit: (run: AnimationSequenceRun) => Promise<boolean>) {
    return withRunLock(runId, async () => {
      const run = await getRun(runId);
      if (!run) return null;
      if (!(await edit(run))) return { run, changed: false };
      invalidateGifExport(run);
      return { run: await saveRun(run), changed: true };
    });
  }

  /** A new job set replaces the frame's dispatch. Recorded jobs only reopen a blocked frame. */
  function recordFrameDispatch(run: AnimationSequenceRun, jobs: Job[]) {
    const jobsByFrame = new Map<AnimationSequenceFrameState, Job[]>();
    for (const job of jobs) {
      const target = readDispatchTarget(job.sourceSpec);
      const frame = target ? resolveFrame(run, target) : null;
      if (frame) jobsByFrame.set(frame, [...(jobsByFrame.get(frame) ?? []), job]);
    }
    const timestamp = now();
    let changed = false;
    for (const [frame, frameJobs] of jobsByFrame) {
      const correctionMode = readDispatchTarget(frameJobs[0]!.sourceSpec)?.correctionMode === true;
      const recordedJobIds = listAnimationSequenceFrameJobIds(frame);
      if (frameJobs.every((job) => recordedJobIds.includes(job.id))) {
        if (frame.status !== 'blocked') continue;
      } else {
        frame.dispatch = { jobIds: frameJobs.map((job) => job.id), dispatchedAt: timestamp };
        frame.jobId = frameJobs[0]!.id;
      }
      markFrameAwaiting(frame, correctionMode, timestamp);
      changed = true;
    }
    return changed;
  }

  /**
   * Folds one job of the frame's current dispatch into the frame. The first sibling with an
   * image wins; failures block the frame only when no sibling can still land.
   */
  async function settleFrameJob(
    run: AnimationSequenceRun,
    frame: AnimationSequenceFrameState,
    jobId: string,
    job: Job | null,
  ) {
    const jobIds = listAnimationSequenceFrameJobIds(frame);
    if (!jobIds.includes(jobId)) return false;
    if (job && PENDING_JOB_STATUSES.has(job.status)) {
      if (frame.status !== 'blocked') return false;
      markFrameAwaiting(frame, readDispatchTarget(job.sourceSpec)?.correctionMode === true, now());
      return true;
    }
    if (frame.status === 'generated') return false;
    const catalogImageId = readJobCatalogImageId(job);
    if (catalogImageId) {
      if (frame.status === 'blocked' && frame.catalogImageId === catalogImageId) return false;
      await applyFrameSource(run, frame, { catalogImageId });
      return true;
    }
    if (!isAnimationSequenceFrameAwaitingJob(frame)) return false;
    if (jobIds.some((siblingId) => siblingId !== jobId && canJobLand(getJob(siblingId)))) {
      return false;
    }
    frame.status = 'blocked';
    frame.blocked = describeUnfinishedJob(job);
    frame.updatedAt = now();
    return true;
  }

  function reconcileRun(runId: string, recoverableJobs: Job[] = []) {
    return updateRun(runId, async (run) => {
      let changed = recordFrameDispatch(
        run,
        recoverableJobs.filter((job) => {
          const target = readDispatchTarget(job.sourceSpec);
          const frame = target ? resolveFrame(run, target) : null;
          return frame && !listAnimationSequenceFrameJobIds(frame).includes(job.id);
        }),
      );
      for (const frame of run.frames) {
        if (!needsReconcile(frame)) continue;
        for (const jobId of listAnimationSequenceFrameJobIds(frame)) {
          // Siblings settle in dispatch order, so the first finished image wins.
          if (await settleFrameJob(run, frame, jobId, getJob(jobId))) changed = true;
        }
      }
      return changed;
    });
  }

  const service: AnimationSequenceService = {
    async listRuns() {
      const roots = ['state', 'outputs'].map((section) =>
        resolveLibraryPathFromRoot(readLibraryDir(), section, 'animation-sequence'),
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
      const runId = safeSegment(`anim-${createId()}`);
      const timestamp = now();
      const paths = createRunPaths(readLibraryDir(), runId);
      const outputContext = readOutputContext?.(input.workspaceId) ?? {
        libraryId: '',
        rootPath: readLibraryDir(),
      };
      const outputInput = {
        jobId: runId,
        recipeId: 'animation-sequence',
        createdAt: new Date(timestamp),
        extension: '.gif',
      };
      paths.gifPath = captureWorkflowOutput(outputContext, outputInput);
      paths.exportsDir = path.dirname(paths.gifPath);
      paths.outputContext = outputContext.output ?? outputContext;
      const contract = createAnimationSequenceContract(input);
      const framePlan = createAnimationSequenceFramePlan(contract);
      const run: AnimationSequenceRun = {
        id: runId,
        title: input.title?.trim() || `${contract.frameCount}-frame animation`,
        status: 'planned',
        createdAt: timestamp,
        updatedAt: timestamp,
        contract,
        framePlan,
        paths,
        frames: [],
        exports: [],
        qa: null,
      };
      run.frames = createFrameStates(run, timestamp);

      await ensureRunDirs(paths);
      await writeJson(paths.requestPath, {
        version: 1,
        prompt: contract.prompt,
        contract,
      });
      await writeJson(paths.framePlanPath, framePlan);
      await Promise.all(
        framePlan.frames.map((frame) =>
          writeFile(path.join(paths.promptsDir, `${frame.id}.txt`), frame.prompt, 'utf8'),
        ),
      );
      return saveRun(run);
    },
    async readFramePrompt(runId, frameId) {
      const run = await getRun(runId);
      if (!run) return null;
      const frame = run.frames.find((item) => item.id === frameId);
      if (!frame) return null;
      const prompt = await readFile(frame.promptPath, 'utf8').catch(() => null);
      if (prompt === null) return null;
      return { frameId: frame.id, prompt, promptPath: frame.promptPath };
    },
    async attachFrame(runId, input) {
      const result = await updateRun(runId, async (run) => {
        const frame = resolveFrame(run, input);
        if (!frame) return false;
        await applyFrameSource(run, frame, input);
        return true;
      });
      return result?.changed ? result.run : null;
    },
    async validateDispatch(spec) {
      const target = readDispatchTarget(spec);
      if (!target) return null;
      const run = await getRun(target.runId);
      if (!run) {
        return {
          code: 'animation_sequence_run_not_found',
          message: `Animation Sequence run ${target.runId} does not exist. Select an existing run, then queue the frame again.`,
        };
      }
      if (!resolveFrame(run, target)) {
        return {
          code: 'animation_sequence_frame_not_found',
          message: `Animation Sequence run ${run.id} has no frame ${target.frameId ?? target.frameIndex ?? '(missing)'}.`,
        };
      }
      return null;
    },
    async recordDispatch(jobs) {
      await Promise.all(
        [...groupJobsByRun(jobs)].map(([runId, runJobs]) =>
          updateRun(runId, async (run) => recordFrameDispatch(run, runJobs)),
        ),
      );
    },
    async settleJob(job) {
      const target = readDispatchTarget(job.sourceSpec);
      if (!target) return false;
      const result = await updateRun(target.runId, async (run) => {
        const frame = resolveFrame(run, target);
        return frame ? settleFrameJob(run, frame, job.id, job) : false;
      });
      return result?.changed ?? false;
    },
    async reconcileRun(runId) {
      return (await reconcileRun(runId))?.run ?? null;
    },
    async recoverRuns(recoverableJobs) {
      const recoverableByRun = groupJobsByRun(recoverableJobs);
      const runs = await service.listRuns();
      const results = await Promise.allSettled(
        runs
          .filter((run) => recoverableByRun.has(run.id) || run.frames.some(needsReconcile))
          .map((run) => reconcileRun(run.id, recoverableByRun.get(run.id))),
      );
      const failure = results.find(
        (result): result is PromiseRejectedResult => result.status === 'rejected',
      );
      if (failure) throw failure.reason;
    },
    async exportGif(runId, input = {}) {
      const run = await getRun(runId);
      if (!run) return null;
      const frames = run.frames.toSorted((a, b) => a.index - b.index);
      const missingResults = await Promise.all(
        frames.map((frame) =>
          frame.framePath ? fileExists(frame.framePath) : Promise.resolve(false),
        ),
      );
      const missingFrameIds = frames
        .filter((frame, index) => frame.status !== 'generated' || !missingResults[index])
        .map((frame) => frame.id);

      if (missingFrameIds.length > 0) {
        if (!input.force) {
          throw new Error(
            `Cannot export GIF until every frame is generated: ${missingFrameIds.join(', ')}`,
          );
        }
      }

      const fps = Math.min(30, Math.max(1, Math.round(input.fps ?? run.contract.fps)));
      const delayCentiseconds = Math.max(1, Math.round(100 / fps));
      const gifFrames = (
        await Promise.all(
          frames.map(async (frame): Promise<GifRgbaFrame | null> => {
            if (!frame.framePath || frame.status !== 'generated') return null;
            const metadata = await authoringSharp(frame.framePath).metadata();
            if (
              metadata.width !== run.contract.dimensions.width ||
              metadata.height !== run.contract.dimensions.height
            ) {
              return null;
            }
            const data = await authoringSharp(frame.framePath).ensureAlpha().raw().toBuffer();
            const expectedBytes =
              run.contract.dimensions.width * run.contract.dimensions.height * 4;
            if (data.length !== expectedBytes) return null;
            return { rgba: data, delayCentiseconds };
          }),
        )
      ).filter((frame): frame is GifRgbaFrame => frame !== null);
      if (gifFrames.length === 0) {
        throw new Error('Cannot export GIF without a frame at the contract size.');
      }

      const buffer = encodeGif({
        width: run.contract.dimensions.width,
        height: run.contract.dimensions.height,
        frames: gifFrames,
        loop: input.loop ?? run.contract.cyclic,
        matteColor: run.contract.matteColor,
        transparent: run.contract.background !== 'solid',
      });
      await mkdir(run.paths.exportsDir, { recursive: true });
      await writeFile(run.paths.gifPath, buffer);

      const record: AnimationSequenceExportRecord = {
        format: 'gif',
        path: run.paths.gifPath,
        publicUrl: run.paths.outputContext
          ? toPublicAssetUrl(run.paths.gifPath, run.paths.outputContext)
          : toPublicRunAssetUrl(readLibraryDir(), run.paths.gifPath),
        frameCount: gifFrames.length,
        fps,
        loop: input.loop ?? run.contract.cyclic,
        fileSizeBytes: await fileSize(run.paths.gifPath),
        createdAt: now(),
      };
      run.exports = [...run.exports.filter((item) => item.format !== 'gif'), record];
      run.qa = null;
      const updated = await saveRun(run);
      return { run: updated, export: record };
    },
    async runQa(runId) {
      const run = await getRun(runId);
      if (!run) return null;
      const issues: string[] = [];
      const frameChecks = await Promise.all(
        run.frames.map(async (frame) => ({
          frame,
          exists: await fileExists(frame.framePath),
        })),
      );

      for (const { frame, exists } of frameChecks) {
        if (frame.status !== 'generated' || !exists) {
          issues.push(`${frame.id} has no generated frame file.`);
        }
        if (
          frame.width !== null &&
          frame.height !== null &&
          (frame.width !== run.contract.dimensions.width ||
            frame.height !== run.contract.dimensions.height)
        ) {
          issues.push(`${frame.id} dimensions do not match the run contract.`);
        }
      }
      const gifExport = run.exports.find((item) => item.format === 'gif') ?? null;
      if (!gifExport || !(await fileExists(run.paths.gifPath))) {
        issues.push('GIF export is missing or stale.');
      }

      const report: AnimationSequenceQaReport = {
        ok: issues.length === 0,
        checkedAt: now(),
        issues,
        summary:
          issues.length === 0
            ? 'All frames are present at the contract dimensions and GIF export exists.'
            : 'Animation sequence has missing frame or export issues.',
      };
      run.qa = report;
      await writeJson(run.paths.qaReportPath, report);
      return saveRun(run);
    },
  };

  // Every read-modify-write of one run record runs alone, so concurrent writers cannot drop updates.
  return {
    ...service,
    exportGif: (runId, input) => withRunLock(runId, () => service.exportGif(runId, input)),
    runQa: (runId) => withRunLock(runId, () => service.runQa(runId)),
  };
}
