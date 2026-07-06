import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {
  createSpriteAtlasContract,
  createSpriteAtlasPresetSummaries,
  isSpriteAtlasBlockedReasonKind,
  type CreateSpriteAtlasRowJobsResponse,
  type CreateSpriteAtlasRunRequest,
  type ImportSpriteAtlasRowRequest,
  type SpriteAtlasBlockedReason,
  type SpriteAtlasQaReport,
  type SpriteAtlasRowHandoffJob,
  type SpriteAtlasRowPromptResponse,
  type SpriteAtlasRowState,
  type SpriteAtlasRun,
  type SpriteAtlasRunPaths,
} from '../../../packages/shared/src';

export interface SpriteAtlasService {
  listPresets(): ReturnType<typeof createSpriteAtlasPresetSummaries>;
  listRuns(): Promise<SpriteAtlasRun[]>;
  getRun(runId: string): Promise<SpriteAtlasRun | null>;
  createRun(input: CreateSpriteAtlasRunRequest): Promise<SpriteAtlasRun>;
  createRowJob(runId: string, rowId: string): Promise<SpriteAtlasRowHandoffJob | null>;
  createRowJobs(runId: string, rowIds?: string[]): Promise<CreateSpriteAtlasRowJobsResponse | null>;
  readRowPrompt(runId: string, rowId: string): Promise<SpriteAtlasRowPromptResponse | null>;
  importRow(runId: string, input: ImportSpriteAtlasRowRequest): Promise<SpriteAtlasRun | null>;
  composeFixture(runId: string): Promise<SpriteAtlasRun | null>;
  runQa(runId: string): Promise<SpriteAtlasRun | null>;
}

export interface CreateSpriteAtlasServiceOptions {
  readLibraryDir: () => string;
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

function createRunPaths(libraryDir: string, runId: string): SpriteAtlasRunPaths {
  const runDir = path.join(libraryDir, 'outputs', 'sprite-atlas', runId);
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

async function writeJson(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function createRowPrompt(run: SpriteAtlasRun, row: SpriteAtlasRowState, basePrompt: string) {
  const contract = run.contract;
  const rowSpec = contract.rows.find((item) => item.id === row.id);
  return [
    `Sprite Atlas Run: ${run.id}`,
    `Base prompt: ${basePrompt || run.title}`,
    `Preset: ${contract.presetId}`,
    `Asset kind: ${contract.assetKind}`,
    `Row: ${row.id}`,
    `Frames: ${row.frames}`,
    `Action: ${rowSpec?.action || row.id}`,
    `Camera: ${contract.camera}`,
    `Style: ${contract.customStyle || contract.stylePreset}`,
    `Cell: ${contract.cell.width}x${contract.cell.height}`,
    `Background: ${contract.backgroundRemoval} using ${contract.chromaKey} when chroma is active`,
    '',
    'Generate exactly one horizontal row strip for this state.',
    'Keep the character or asset identity, scale, baseline, outline weight, and palette stable.',
    'Use clean slot separation. No text, labels, guide marks, scene background, watermarks, or merged atlas pages.',
  ].join('\n');
}

async function writeLayoutGuide(run: SpriteAtlasRun, row: SpriteAtlasRowState) {
  const width = run.contract.cell.width * row.frames;
  const height = run.contract.cell.height;
  const lines = Array.from({ length: row.frames + 1 }, (_, index) => {
    const x = index * run.contract.cell.width;
    return `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="#22c55e" stroke-width="2" />`;
  }).join('');
  const labels = Array.from({ length: row.frames }, (_, index) => {
    const x = index * run.contract.cell.width + 8;
    return `<text x="${x}" y="20" fill="#e4e4e7" font-size="14" font-family="monospace">${index + 1}</text>`;
  }).join('');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="#0a0a0a"/>
      <rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="#71717a" stroke-width="2"/>
      ${lines}
      ${labels}
      <text x="8" y="${height - 10}" fill="#a1a1aa" font-size="14" font-family="monospace">${row.id}</text>
    </svg>
  `;
  await sharp(Buffer.from(svg)).png().toFile(row.layoutGuidePath);
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
      jobId: null,
      blocked: null,
      updatedAt: timestamp,
    };
  });
}

function resolveRunStatus(run: SpriteAtlasRun): SpriteAtlasRun['status'] {
  if (run.rows.some((row) => row.status === 'blocked')) return 'blocked';
  if (run.qa?.ok) return 'qa_passed';
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

export function createSpriteAtlasService({
  readLibraryDir,
  createId = randomUUID,
  now = () => new Date().toISOString(),
}: CreateSpriteAtlasServiceOptions): SpriteAtlasService {
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
    return readJson<SpriteAtlasRun>(paths.statusPath);
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
      identityAnchorPath: null,
      expectedOutputPath: path.join(run.paths.rawDir, `${safeSegment(row.id)}.png`),
      outboxPattern: `${jobId}-${safeSegment(row.id)}.png`,
      createdAt: timestamp,
    };

    await writeJson(path.join(run.paths.handoffInboxDir, `${jobId}.json`), job);
    row.status = 'handoff_ready';
    row.jobId = jobId;
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

    for (const row of run.rows) {
      if (requestedRows && !requestedRows.has(row.id)) continue;
      if (!options.force) {
        const alreadyHandled =
          row.status === 'handoff_ready' ||
          row.status === 'generating' ||
          row.status === 'raw_imported' ||
          row.status === 'extracted';
        if (alreadyHandled || Boolean(row.jobId) || Boolean(row.rawPath)) continue;
      }
      jobs.push(await writeRowJob(run, row, timestamp));
    }

    return {
      jobs,
      run: await saveRun(run),
    };
  }

  return {
    listPresets() {
      return createSpriteAtlasPresetSummaries();
    },
    async listRuns() {
      const root = path.join(readLibraryDir(), 'outputs', 'sprite-atlas');
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
      const runId = safeSegment(`atlas-${createId()}`);
      const timestamp = now();
      const paths = createRunPaths(readLibraryDir(), runId);
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
    async createRowJob(runId, rowId) {
      const run = await getRun(runId);
      if (!run) return null;
      const row = run.rows.find((item) => item.id === rowId);
      if (!row) return null;
      const result = await createRowJobsForRun(run, [rowId], { force: true });
      return result.jobs[0] ?? null;
    },
    async createRowJobs(runId, rowIds) {
      const run = await getRun(runId);
      if (!run) return null;
      return createRowJobsForRun(run, rowIds, { force: false });
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
    async importRow(runId, input) {
      const run = await getRun(runId);
      if (!run) return null;
      const row = run.rows.find((item) => item.id === input.rowId);
      if (!row) return null;

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
        return saveRun(run);
      }

      if (!input.sourcePath || !(await fileExists(input.sourcePath))) {
        row.status = 'blocked';
        row.blocked = {
          status: 'blocked',
          reasonKind: 'no_image_returned',
          userMessage: 'No source row image was available to import.',
          suggestion: 'Generate or select a real row strip, then import it into this row.',
        };
        row.updatedAt = timestamp;
        return saveRun(run);
      }

      const outputPath = path.join(
        run.paths.rawDir,
        `${safeSegment(row.id)}${path.extname(input.sourcePath) || '.png'}`,
      );
      await copyFile(input.sourcePath, outputPath);
      row.rawPath = outputPath;
      row.status = 'raw_imported';
      row.blocked = null;
      row.updatedAt = timestamp;
      return saveRun(run);
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
      await sharp(Buffer.from(svg)).png().toFile(run.paths.atlasPath);

      await writeJson(run.paths.manifestPath, {
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
            origin: { x: Math.floor(run.contract.cell.width / 2), y: run.contract.cell.height },
          })),
        })),
      });

      run.status = 'composed';
      run.updatedAt = now();
      return saveRun(run);
    },
    async runQa(runId) {
      const run = await getRun(runId);
      if (!run) return null;
      const issues: string[] = [];
      const hasGeneratedRows = run.rows.some((row) => Boolean(row.rawPath));
      const mode: SpriteAtlasQaReport['mode'] = hasGeneratedRows
        ? 'generated_art'
        : 'fixture_smoke';
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
      if (!hasGeneratedRows) {
        issues.push('No imagegen-backed row art has been imported; QA is fixture smoke only.');
      }

      const report: SpriteAtlasQaReport = {
        ok: issues.length === 0 || issues.every((issue) => issue.includes('fixture smoke only')),
        mode,
        checkedAt: now(),
        issues,
        summary:
          mode === 'generated_art'
            ? 'Generated row artifacts are present for atlas QA.'
            : 'Deterministic atlas fixture validates manifest and route workflow only.',
      };
      run.qa = report;
      await writeJson(run.paths.qaReportPath, report);
      return saveRun(run);
    },
  };
}
