import {
  constants as fsConstants,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import type { TurnResult } from '../codex/turn';
import { resolveGrokExecutable, resolveGrokHome } from '../grokExecutable';
import { readGrokRuntimeDoctor } from '../grokRuntimeDoctor';
import { resolveLibraryPath, resolveLibraryPathFromRoot } from '../library';
import { terminateOwnedProcessTree } from '../ownedProcessTree';
import type {
  ExternalProviderExecutionContext,
  ExternalProviderExecutor,
} from './externalProvider';
import {
  GROK_IMAGINE_ASPECT_RATIOS,
  MAX_GROK_IMAGINE_SOURCE_IMAGES,
} from '../../../../packages/shared/src/grokImagineContract';
import type { GrokImagineCompiledInput, GrokImagineCompiledPayload } from './grokImagineInput';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
export { GROK_IMAGINE_ASPECT_RATIOS, MAX_GROK_IMAGINE_SOURCE_IMAGES };
const MAX_PROCESS_OUTPUT_BYTES = 4 * 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000;

export interface GrokCliRunResult {
  status: number;
  stdout: string;
  stderr: string;
}

export interface RunGrokCliInput {
  executable: string;
  args: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
  signal?: AbortSignal;
  timeoutMs: number;
}

export interface GrokImagineExecutorDependencies {
  env?: NodeJS.ProcessEnv;
  runCli?: (input: RunGrokCliInput) => Promise<GrokCliRunResult>;
  readRuntimeDoctor?: typeof readGrokRuntimeDoctor;
  resolveExecutable?: typeof resolveGrokExecutable;
  resolveGrokHome?: typeof resolveGrokHome;
  resolveDefaultLibraryPath?: typeof resolveLibraryPath;
  now?: () => number;
  createSessionId?: () => string;
  createTemporaryDirectory?: () => string;
}

interface GrokHeadlessResult {
  text?: unknown;
  stopReason?: unknown;
  sessionId?: unknown;
  requestId?: unknown;
  [key: string]: unknown;
}

function createAbortError() {
  const error = new Error('Grok Imagine job was cancelled.');
  error.name = 'AbortError';
  return error;
}

export function runGrokCliProcess({
  executable,
  args,
  cwd,
  env,
  signal,
  timeoutMs,
}: RunGrokCliInput): Promise<GrokCliRunResult> {
  if (signal?.aborted) return Promise.reject(createAbortError());

  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd,
      env,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    let outputBytes = 0;
    let terminalError: Error | null = null;
    let timedOut = false;
    let aborted = false;
    let settled = false;

    const stop = () => {
      try {
        terminateOwnedProcessTree(child);
      } catch {
        child.kill();
      }
    };
    const onAbort = () => {
      aborted = true;
      stop();
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    const timer = setTimeout(() => {
      timedOut = true;
      stop();
    }, timeoutMs);

    const append = (target: 'stdout' | 'stderr', chunk: unknown) => {
      const text = String(chunk);
      outputBytes += Buffer.byteLength(text);
      if (outputBytes > MAX_PROCESS_OUTPUT_BYTES) {
        terminalError = new Error('Grok Build output exceeded the safe process buffer limit.');
        stop();
        return;
      }
      if (target === 'stdout') stdout += text;
      else stderr += text;
    };
    child.stdout.on('data', (chunk) => append('stdout', chunk));
    child.stderr.on('data', (chunk) => append('stderr', chunk));
    child.once('error', (error) => {
      terminalError = error;
    });
    child.once('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      if (aborted) {
        reject(createAbortError());
        return;
      }
      if (timedOut) {
        reject(new Error(`Grok Imagine timed out after ${timeoutMs} ms.`));
        return;
      }
      if (terminalError) {
        reject(terminalError);
        return;
      }
      resolve({ status: code ?? 1, stdout, stderr });
    });
  });
}

function isInside(root: string, target: string) {
  const relative = path.relative(root, target);
  return (
    relative === '' ||
    (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
  );
}

function resolveManagedSourceFiles(payload: GrokImagineCompiledPayload, libraryRoot: string) {
  const sourceFiles = payload.assets.map((asset) => {
    if (asset.hasInlineData) {
      throw new Error(`Grok Imagine asset "${asset.name}" still contains unresolved inline data.`);
    }
    if (!asset.localPath) {
      throw new Error(
        `Grok Imagine asset "${asset.name}" must be imported into the Studio Library before execution.`,
      );
    }
    const source = path.resolve(asset.localPath);
    if (!existsSync(source) || !statSync(source).isFile()) {
      throw new Error(`Grok Imagine source image does not exist: ${source}.`);
    }
    const extension = path.extname(source).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(extension)) {
      throw new Error(`Grok Imagine source image must be PNG, JPEG, or WebP: ${source}.`);
    }
    const realRoot = realpathSync(libraryRoot);
    const realSource = realpathSync(source);
    if (!isInside(realRoot, realSource)) {
      throw new Error(`Grok Imagine source image is outside the Job Studio Library: ${source}.`);
    }
    return { ...asset, localPath: realSource };
  });
  if (sourceFiles.length > MAX_GROK_IMAGINE_SOURCE_IMAGES) {
    throw new Error(
      `Grok Imagine supports at most ${MAX_GROK_IMAGINE_SOURCE_IMAGES} managed source images per Job.`,
    );
  }
  return sourceFiles;
}

function validatePayload(payload: GrokImagineCompiledPayload, libraryRoot: string) {
  if (payload.output.count !== 1) {
    throw new Error('Grok Imagine requires exactly one output image per Persistent Job.');
  }
  const aspectRatio = payload.output.aspectRatio?.trim() || null;
  if (aspectRatio && !GROK_IMAGINE_ASPECT_RATIOS.has(aspectRatio)) {
    throw new Error(
      `Grok Imagine does not support aspect ratio "${aspectRatio}". Supported values: ${[
        ...GROK_IMAGINE_ASPECT_RATIOS,
      ].join(', ')}.`,
    );
  }
  const sources = resolveManagedSourceFiles(payload, libraryRoot);
  if (payload.operation === 'image_edit' && sources.length === 0) {
    throw new Error('Grok Imagine image editing requires at least one managed source image.');
  }
  if (payload.operation === 'image_generate' && sources.length > 0) {
    throw new Error('Grok Imagine image generation cannot include source images.');
  }
  return { aspectRatio, sources };
}

export function buildGrokImaginePrompt(
  payload: GrokImagineCompiledPayload,
  sources: ReturnType<typeof resolveManagedSourceFiles>,
) {
  const tool = payload.operation === 'image_edit' ? 'image_edit' : 'image_gen';
  const sections = [
    `Use ${tool} exactly once and produce exactly one image.`,
    'Do not return a text-only answer. Do not call any other tool.',
    '',
    'Image request:',
    payload.prompt,
  ];
  if (sources.length > 0) {
    sections.push(
      '',
      'Use exactly these managed source images, in this order:',
      ...sources.map(
        (source, index) =>
          `${index + 1}. ${source.role} ${JSON.stringify(source.name)}: ${source.localPath}`,
      ),
    );
  }
  const aspectRatio = payload.output.aspectRatio?.trim();
  if (aspectRatio) sections.push('', `Tool aspect_ratio: ${aspectRatio}`);
  sections.push('', 'After the media tool completes, return only a brief factual result summary.');
  return sections.join('\n');
}

export function buildGrokImagineArgs({
  cwd,
  promptFile,
  sessionId,
  payload,
}: {
  cwd: string;
  promptFile: string;
  sessionId: string;
  payload: GrokImagineCompiledPayload;
}) {
  const tool = payload.operation === 'image_edit' ? 'image_edit' : 'image_gen';
  const args = [
    '--no-auto-update',
    '--cwd',
    cwd,
    '--prompt-file',
    promptFile,
    '--output-format',
    'json',
    '--permission-mode',
    'dontAsk',
    '--sandbox',
    'strict',
    '--tools',
    tool,
    '--max-turns',
    '4',
    '--no-memory',
    '--disable-web-search',
    '--rules',
    `Call ${tool} exactly once. Do not use repository, shell, web, memory, planning, or subagent capabilities. Do not claim success unless the media tool completed.`,
    '--no-plan',
    '--no-subagents',
    '--session-id',
    sessionId,
    '--allow',
    tool,
  ];
  if (payload.model) args.push('--model', payload.model);
  if (payload.reasoningEffort) args.push('--reasoning-effort', payload.reasoningEffort);
  return args;
}

function normalizeStopReason(value: unknown) {
  return (typeof value === 'string' ? value : '').replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function displayStopReason(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return value == null ? 'missing' : 'invalid';
}

function parseHeadlessResult(output: string) {
  try {
    return JSON.parse(output.trim()) as GrokHeadlessResult;
  } catch {
    throw new Error('Grok Build returned invalid JSON output.');
  }
}

function resolveSessionDirectory(grokHome: string, cwd: string, sessionId: string) {
  const sessionsRoot = path.join(grokHome, 'sessions');
  const direct = path.join(sessionsRoot, encodeURIComponent(cwd), sessionId);
  if (existsSync(direct)) return direct;
  if (!existsSync(sessionsRoot)) return direct;
  for (const entry of readdirSync(sessionsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const candidate = path.join(sessionsRoot, entry.name, sessionId);
    if (existsSync(candidate)) return candidate;
  }
  return direct;
}

function listGeneratedImages(sessionDirectory: string) {
  const imagesDirectory = path.join(sessionDirectory, 'images');
  if (!existsSync(imagesDirectory) || !statSync(imagesDirectory).isDirectory()) return [];
  const pending = [imagesDirectory];
  const images: string[] = [];
  while (pending.length > 0) {
    const current = pending.pop()!;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) pending.push(target);
      else if (entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        images.push(target);
      }
    }
  }
  return images.sort((left, right) => left.localeCompare(right));
}

function sanitizeFilePart(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'job';
}

function mimeFromExtension(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  if (extension === '.webp') return 'image/webp';
  return 'image/png';
}

function resolveJobLibraryPath(
  job: ExternalProviderExecutionContext['job'],
  fallback: typeof resolveLibraryPath,
  ...segments: string[]
) {
  return job.libraryContext
    ? resolveLibraryPathFromRoot(job.libraryContext.rootPath, ...segments)
    : fallback(...segments);
}

function configuredTimeoutMs(env: NodeJS.ProcessEnv) {
  const value = Number(env.STUDIO_GROK_TIMEOUT_MS);
  return Number.isInteger(value) && value >= 30_000 && value <= 3_600_000
    ? value
    : DEFAULT_TIMEOUT_MS;
}

export function createGrokImagineExecutor({
  env = process.env,
  runCli = runGrokCliProcess,
  readRuntimeDoctor = readGrokRuntimeDoctor,
  resolveExecutable = resolveGrokExecutable,
  resolveGrokHome: resolveHome = resolveGrokHome,
  resolveDefaultLibraryPath = resolveLibraryPath,
  now = () => Date.now(),
  createSessionId = randomUUID,
  createTemporaryDirectory = () => mkdtempSync(path.join(os.tmpdir(), 'codex-studio-grok-')),
}: GrokImagineExecutorDependencies = {}): ExternalProviderExecutor {
  return async function executeGrokImagine({
    providerId,
    job,
    compiledInput,
  }: ExternalProviderExecutionContext): Promise<TurnResult> {
    if (
      providerId !== 'grok' ||
      compiledInput.providerId !== 'grok' ||
      compiledInput.payloadKind !== 'agent_cli_prompt'
    ) {
      throw new Error(`Grok Imagine executor received unsupported provider input.`);
    }

    const input = compiledInput as GrokImagineCompiledInput;
    const libraryRoot = job.libraryContext?.rootPath ?? resolveDefaultLibraryPath();
    const { sources } = validatePayload(input.payload, libraryRoot);
    const runtime = readRuntimeDoctor();
    if (!runtime.canRunJobs) {
      throw new Error(`Grok Build runtime is not ready: ${runtime.recommendedAction}`);
    }
    if (input.payload.model && !runtime.availableModels.includes(input.payload.model)) {
      throw new Error(
        `Grok model "${input.payload.model}" is unavailable. Available models: ${runtime.availableModels.join(', ') || 'none'}.`,
      );
    }

    const startedAt = now();
    const sessionId = createSessionId();
    const grokHome = resolveHome(env);
    const sessionDirectory = resolveSessionDirectory(grokHome, libraryRoot, sessionId);
    if (existsSync(sessionDirectory)) {
      throw new Error(`Refusing to reuse existing Grok session ${sessionId}.`);
    }
    const temporaryDirectory = createTemporaryDirectory();
    const promptFile = path.join(temporaryDirectory, 'prompt.md');
    writeFileSync(promptFile, `${buildGrokImaginePrompt(input.payload, sources)}\n`, 'utf8');

    try {
      const executable = resolveExecutable(env);
      const result = await runCli({
        executable,
        args: buildGrokImagineArgs({
          cwd: libraryRoot,
          promptFile,
          sessionId,
          payload: input.payload,
        }),
        cwd: libraryRoot,
        env: { ...env, GROK_HOME: grokHome },
        signal: job.signal,
        timeoutMs: configuredTimeoutMs(env),
      });
      if (result.status !== 0) {
        throw new Error(
          `Grok Imagine failed with exit ${result.status}. Check the local Grok Build login and runtime logs.`,
        );
      }
      const headless = parseHeadlessResult(result.stdout);
      if (headless.sessionId !== sessionId) {
        throw new Error('Grok Build returned an unexpected session id.');
      }
      if (normalizeStopReason(headless.stopReason) !== 'endturn') {
        throw new Error(
          `Grok Imagine stopped before completion: ${displayStopReason(headless.stopReason)}.`,
        );
      }
      const resolvedSessionDirectory = resolveSessionDirectory(grokHome, libraryRoot, sessionId);
      const images = listGeneratedImages(resolvedSessionDirectory);
      if (images.length !== 1) {
        throw new Error(`Grok Imagine expected one generated image and found ${images.length}.`);
      }
      const sourceImage = images[0]!;
      if (statSync(sourceImage).size === 0) {
        throw new Error('Grok Imagine generated an empty image file.');
      }

      const safeJobId = sanitizeFilePart(job.id);
      const extension = path.extname(sourceImage).toLowerCase();
      const outputPath = resolveJobLibraryPath(
        job,
        resolveDefaultLibraryPath,
        'assets',
        `${safeJobId}-grok-${now()}${extension}`,
      );
      mkdirSync(path.dirname(outputPath), { recursive: true });
      copyFileSync(sourceImage, outputPath, fsConstants.COPYFILE_EXCL);

      const transcriptDirectory = resolveJobLibraryPath(
        job,
        resolveDefaultLibraryPath,
        'transcripts',
        safeJobId,
      );
      mkdirSync(transcriptDirectory, { recursive: true });
      const transcriptPath = path.join(transcriptDirectory, 'grok.json');
      writeFileSync(
        transcriptPath,
        JSON.stringify(
          {
            providerId: 'grok',
            runtimeKind: 'agent_cli',
            executable,
            cliVersion: runtime.selectedVersionNumber,
            model: input.payload.model,
            reasoningEffort: input.payload.reasoningEffort,
            sourceSpecId: compiledInput.sourceSpecId,
            task: compiledInput.task,
            operation: input.payload.operation,
            sourceAssetCount: sources.length,
            sessionId,
            sessionDirectory: resolvedSessionDirectory,
            outputPath,
            stopReason: headless.stopReason,
            responseShape: Object.keys(headless).sort(),
          },
          null,
          2,
        ),
        'utf8',
      );

      return {
        assets: [{ type: 'file', sourcePath: outputPath, mimeType: mimeFromExtension(outputPath) }],
        transcript: transcriptPath,
        turnId: null,
        threadId: null,
        durationMs: Math.max(0, now() - startedAt),
      };
    } finally {
      rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  };
}
