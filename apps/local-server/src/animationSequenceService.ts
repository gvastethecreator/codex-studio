import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {
  createAnimationSequenceContract,
  createAnimationSequenceFramePlan,
  isAnimationSequenceBlockedReasonKind,
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
import type { CatalogImage } from '../../../packages/shared/src/types';
import { encodeGif, type GifRgbaFrame } from './animationGifEncoder';
import { resolveLibraryPathFromRoot } from './library';

export interface AnimationSequenceService {
  listRuns(): Promise<AnimationSequenceRun[]>;
  getRun(runId: string): Promise<AnimationSequenceRun | null>;
  createRun(input: CreateAnimationSequenceRunRequest): Promise<AnimationSequenceRun>;
  readFramePrompt(
    runId: string,
    frameId: string,
  ): Promise<AnimationSequenceFramePromptResponse | null>;
  attachFrame(
    runId: string,
    input: AttachAnimationSequenceFrameRequest,
  ): Promise<AnimationSequenceRun | null>;
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
  getCatalogImage?: (imageId: string) => CatalogImage | null;
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
  const runDir = resolveLibraryPathFromRoot(
    libraryDir,
    'outputs',
    'animation-sequence',
    runId,
  );
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

async function writeJson(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
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
  if (run.frames.some((frame) => frame.status === 'generated')) return 'waiting_for_frame';
  return 'planned';
}

function invalidateGifExport(run: AnimationSequenceRun) {
  run.exports = run.exports.filter((item) => item.format !== 'gif');
  run.qa = null;
}

function isSafeBlockedReason(
  value: AnimationSequenceBlockedReason | null | undefined,
): value is AnimationSequenceBlockedReason {
  return (
    value?.status === 'blocked' &&
    isAnimationSequenceBlockedReasonKind(value.reasonKind) &&
    Boolean(value.userMessage.trim()) &&
    Boolean(value.suggestion.trim())
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
}: {
  input: AttachAnimationSequenceFrameRequest;
  getCatalogImage?: (imageId: string) => CatalogImage | null;
  libraryDir: string;
}) {
  const catalogImageId = input.catalogImageId?.trim();
  if (catalogImageId && getCatalogImage) {
    const image = getCatalogImage(catalogImageId);
    if (image?.filePath && isPathInside(libraryDir, image.filePath)) {
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
  getCatalogImage,
  createId = randomUUID,
  now = () => new Date().toISOString(),
}: CreateAnimationSequenceServiceOptions): AnimationSequenceService {
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
    return readJson<AnimationSequenceRun>(paths.statusPath);
  }

  return {
    async listRuns() {
      const root = resolveLibraryPathFromRoot(
        readLibraryDir(),
        'outputs',
        'animation-sequence',
      );
      try {
        const entries = await readdir(root, { withFileTypes: true });
        const runs = await Promise.all(
          entries.filter((entry) => entry.isDirectory()).map((entry) => getRun(entry.name)),
        );
        return runs
          .flatMap((run) => (run ? [run] : []))
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      } catch {
        return [];
      }
    },
    getRun,
    async createRun(input) {
      const runId = safeSegment(`anim-${createId()}`);
      const timestamp = now();
      const paths = createRunPaths(readLibraryDir(), runId);
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
      const run = await getRun(runId);
      if (!run) return null;
      const frame = resolveFrame(run, input);
      if (!frame) return null;
      const timestamp = now();
      invalidateGifExport(run);

      if (isSafeBlockedReason(input.blocked)) {
        frame.status = 'blocked';
        frame.blocked = input.blocked;
        frame.updatedAt = timestamp;
        return saveRun(run);
      }

      if (input.jobId?.trim() && !input.sourcePath && !input.catalogImageId) {
        frame.jobId = input.jobId.trim();
        frame.status = frame.status === 'generated' ? 'correcting' : 'generating';
        frame.blocked = null;
        frame.updatedAt = timestamp;
        run.status = frame.status;
        return saveRun(run);
      }

      const { sourcePath, catalogImageId } = resolveSourcePath({
        input,
        getCatalogImage,
        libraryDir: readLibraryDir(),
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
        return saveRun(run);
      }

      const rawPath = path.join(
        run.paths.rawDir,
        `${frame.id}${path.extname(sourcePath) || '.png'}`,
      );
      const framePath = path.join(run.paths.framesDir, `${frame.id}.png`);
      await copyFile(sourcePath, rawPath);
      const info = await sharp(sourcePath)
        .rotate()
        .resize(run.contract.dimensions.width, run.contract.dimensions.height, { fit: 'cover' })
        .flatten({ background: run.contract.matteColor })
        .png()
        .toFile(framePath);

      frame.status = 'generated';
      frame.rawPath = rawPath;
      frame.framePath = framePath;
      frame.catalogImageId = catalogImageId;
      frame.jobId = input.jobId?.trim() || frame.jobId;
      frame.width = info.width;
      frame.height = info.height;
      frame.blocked = null;
      frame.updatedAt = timestamp;
      return saveRun(run);
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
            if (!frame.framePath) return null;
            const { data } = await sharp(frame.framePath)
              .resize(run.contract.dimensions.width, run.contract.dimensions.height, {
                fit: 'cover',
              })
              .flatten({ background: run.contract.matteColor })
              .ensureAlpha()
              .raw()
              .toBuffer({ resolveWithObject: true });
            return { rgba: data, delayCentiseconds };
          }),
        )
      ).filter((frame): frame is GifRgbaFrame => frame !== null);

      const buffer = encodeGif({
        width: run.contract.dimensions.width,
        height: run.contract.dimensions.height,
        frames: gifFrames,
        loop: input.loop ?? run.contract.cyclic,
        matteColor: run.contract.matteColor,
      });
      await mkdir(run.paths.exportsDir, { recursive: true });
      await writeFile(run.paths.gifPath, buffer);

      const record: AnimationSequenceExportRecord = {
        format: 'gif',
        path: run.paths.gifPath,
        publicUrl: toPublicRunAssetUrl(readLibraryDir(), run.paths.gifPath),
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
}
