import { spawn } from 'node:child_process';
import {
  constants as fsConstants,
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { TurnResult } from '../codex/turn';
import {
  createAntigravityChildEnvironment,
  resolveAntigravityExecutable,
  resolveAntigravityHome,
} from '../antigravityExecutable';
import {
  readAntigravityRuntimeDoctor,
  type AntigravityRuntimeDoctorReport,
} from '../antigravityRuntimeDoctor';
import { resolveLibraryPath, resolveLibraryPathFromRoot } from '../library';
import { terminateOwnedProcessTree } from '../ownedProcessTree';
import type {
  ExternalProviderExecutionContext,
  ExternalProviderExecutor,
} from './externalProvider';
import { isRecord, storeInlineImageResult } from './externalProviderResults';
import type {
  AntigravityImageCompiledInput,
  AntigravityImageCompiledPayload,
} from './antigravityImageInput';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
const MAX_SOURCE_IMAGES = 10;
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const MAX_PROCESS_OUTPUT_BYTES = 4 * 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000;
const CONVERSATION_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{7,127}$/;
const TEMPORARY_DIRECTORY_PREFIX = 'codex-studio-antigravity-';

export interface AntigravityCliRunResult {
  status: number;
  stdout: string;
  stderr: string;
}

export interface RunAntigravityCliInput {
  executable: string;
  args: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
  stdin: string;
  signal?: AbortSignal;
  timeoutMs: number;
}

export interface AntigravityImageExecutorDependencies {
  env?: NodeJS.ProcessEnv;
  runCli?: (input: RunAntigravityCliInput) => Promise<AntigravityCliRunResult>;
  readRuntimeDoctor?: () => AntigravityRuntimeDoctorReport;
  resolveExecutable?: typeof resolveAntigravityExecutable;
  resolveHome?: typeof resolveAntigravityHome;
  resolveDefaultLibraryPath?: typeof resolveLibraryPath;
  now?: () => number;
  createTemporaryDirectory?: () => string;
}

interface ParsedAntigravityStream {
  conversationId: string;
  cwd: string;
  resultStatus: string;
  toolStepCount: number;
  eventTypes: string[];
}

function createAbortError() {
  const error = new Error('Antigravity image job was cancelled.');
  error.name = 'AbortError';
  return error;
}

export function runAntigravityCliProcess({
  executable,
  args,
  cwd,
  env,
  stdin,
  signal,
  timeoutMs,
}: RunAntigravityCliInput): Promise<AntigravityCliRunResult> {
  if (signal?.aborted) return Promise.reject(createAbortError());
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd,
      env,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
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
        terminalError = new Error('Antigravity output exceeded the safe process buffer limit.');
        stop();
        return;
      }
      if (target === 'stdout') stdout += text;
      else stderr += text;
    };
    child.stdout.on('data', (chunk) => append('stdout', chunk));
    child.stderr.on('data', (chunk) => append('stderr', chunk));
    child.stdin.on('error', (error) => {
      terminalError ??= error;
    });
    child.once('error', (error) => {
      terminalError = error;
    });
    child.once('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      if (aborted) return reject(createAbortError());
      if (timedOut)
        return reject(new Error(`Antigravity image generation timed out after ${timeoutMs} ms.`));
      if (terminalError) return reject(terminalError);
      resolve({ status: code ?? 1, stdout, stderr });
    });
    child.stdin.end(stdin, 'utf8');
  });
}

function isInside(root: string, target: string) {
  const relative = path.relative(root, target);
  return (
    relative === '' ||
    (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
  );
}

function normalizeComparablePath(value: string) {
  const normalized = path.normalize(value);
  return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
}

function assertOwnedTemporaryDirectory(candidate: string) {
  const resolved = path.resolve(candidate);
  const info = lstatSync(resolved);
  const realTemporaryRoot = realpathSync(os.tmpdir());
  const realCandidate = realpathSync(resolved);
  if (
    !info.isDirectory() ||
    info.isSymbolicLink() ||
    !path.basename(resolved).startsWith(TEMPORARY_DIRECTORY_PREFIX) ||
    !isInside(realTemporaryRoot, realCandidate)
  ) {
    throw new Error('Antigravity temporary workspace is not a Studio-owned directory.');
  }
  return realCandidate;
}

function sanitizeFilePart(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'asset';
}

function stageManagedSources(
  payload: AntigravityImageCompiledPayload,
  libraryRoot: string,
  temporaryDirectory: string,
) {
  const assets = payload.assets.filter((asset) => asset.role !== 'mask');
  if (assets.length > MAX_SOURCE_IMAGES) {
    throw new Error(
      `Antigravity supports at most ${MAX_SOURCE_IMAGES} managed source images per Job.`,
    );
  }
  if (payload.operation === 'image_edit' && assets.length === 0) {
    throw new Error('Antigravity image editing requires at least one managed source image.');
  }
  if (payload.operation === 'image_generate' && assets.length > 0) {
    throw new Error('Antigravity image generation cannot include source images.');
  }
  const realLibraryRoot = realpathSync(libraryRoot);
  const inputDirectory = path.join(temporaryDirectory, 'inputs');
  mkdirSync(inputDirectory, { recursive: true });
  return assets.map((asset, index) => {
    if (asset.hasInlineData || asset.sourceUrl || !asset.localPath) {
      throw new Error(
        `Antigravity asset "${asset.name}" must be imported into the Studio Library before execution.`,
      );
    }
    const sourcePath = path.resolve(asset.localPath);
    if (!existsSync(sourcePath) || !statSync(sourcePath).isFile()) {
      throw new Error(`Antigravity source image does not exist: ${sourcePath}.`);
    }
    const extension = path.extname(sourcePath).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(extension)) {
      throw new Error(`Antigravity source image must be PNG, JPEG, GIF, or WebP: ${sourcePath}.`);
    }
    const realSourcePath = realpathSync(sourcePath);
    if (!isInside(realLibraryRoot, realSourcePath)) {
      throw new Error(`Antigravity source image is outside the Job Studio Library: ${sourcePath}.`);
    }
    const stagedPath = path.join(
      inputDirectory,
      `${String(index + 1).padStart(2, '0')}-${sanitizeFilePart(path.basename(sourcePath, extension))}${extension}`,
    );
    copyFileSync(realSourcePath, stagedPath, fsConstants.COPYFILE_EXCL);
    return { ...asset, localPath: stagedPath };
  });
}

export function buildAntigravityImagePrompt(
  payload: AntigravityImageCompiledPayload,
  stagedSources: ReturnType<typeof stageManagedSources>,
) {
  const constraints = [payload.prompt];
  if (payload.output.aspectRatio) {
    constraints.push(`Requested aspect ratio: ${payload.output.aspectRatio}.`);
  }
  if (payload.output.imageSize) {
    constraints.push(`Requested image size: ${payload.output.imageSize}.`);
  }
  return [
    'Call generate_image exactly once. Do not call any other tool.',
    'Produce exactly one image. Do not return success unless generate_image completes.',
    '',
    'Use these tool arguments:',
    `Prompt: ${JSON.stringify(constraints.join('\n\n'))}`,
    'ImageName: "studio-output.png"',
    ...(stagedSources.length > 0
      ? [`ImagePaths: ${JSON.stringify(stagedSources.map((source) => source.localPath))}`]
      : []),
    '',
    'After the tool completes, return only a brief factual result summary.',
  ].join('\n');
}

export function buildAntigravityImageArgs(payload: AntigravityImageCompiledPayload) {
  const args = [
    '--input-format',
    'stream-json',
    '--output-format',
    'stream-json',
    '--sandbox',
    '--disable-slash-commands',
    '--mode',
    'accept-edits',
    '--print-timeout',
    '15m',
  ];
  if (payload.model) args.push('--model', payload.model);
  if (payload.reasoningEffort) {
    if (!['low', 'medium', 'high'].includes(payload.reasoningEffort)) {
      throw new Error('Antigravity reasoning effort must be low, medium, or high.');
    }
    args.push('--effort', payload.reasoningEffort);
  }
  return args;
}

export function parseAntigravityStream(output: string): ParsedAntigravityStream {
  const events = output.split(/\r?\n/).flatMap((line, index) => {
    if (!line.trim()) return [];
    try {
      const parsed = JSON.parse(line) as unknown;
      if (!isRecord(parsed) || typeof parsed.event !== 'string') throw new Error('invalid');
      return [parsed];
    } catch {
      throw new Error(`Antigravity returned invalid stream JSON at line ${index + 1}.`);
    }
  });
  const initEvents = events.filter((event) => event.event === 'init');
  const resultEvents = events.filter((event) => event.event === 'result');
  if (
    initEvents.length !== 1 ||
    resultEvents.length !== 1 ||
    events[0]?.event !== 'init' ||
    events.at(-1)?.event !== 'result'
  ) {
    throw new Error('Antigravity stream requires exactly one init event and one result event.');
  }
  const init = initEvents[0]!;
  const conversationId = typeof init.conversation_id === 'string' ? init.conversation_id : '';
  if (!CONVERSATION_ID_PATTERN.test(conversationId)) {
    throw new Error('Antigravity stream returned an invalid conversation id.');
  }
  const initPayload = isRecord(init.init) ? init.init : null;
  if (!initPayload || initPayload.permission_mode !== 'request-review') {
    throw new Error('Antigravity did not use the required request-review permission mode.');
  }
  const tools = Array.isArray(initPayload.tools) ? initPayload.tools : [];
  if (!tools.includes('generate_image')) {
    throw new Error('Antigravity did not expose the generate_image tool for this run.');
  }
  const cwd = typeof initPayload.cwd === 'string' ? initPayload.cwd.trim() : '';
  if (!cwd || !path.isAbsolute(cwd)) {
    throw new Error('Antigravity did not report an absolute workspace path.');
  }
  const toolSteps = events.flatMap((event) => {
    if (event.event !== 'step_update' || !isRecord(event.step_update)) return [];
    return event.step_update.step_type === 'tool' ? [event.step_update] : [];
  });
  if (toolSteps.some((step) => step.tool_name !== 'generate_image')) {
    throw new Error('Antigravity called a tool other than generate_image.');
  }
  if (
    toolSteps.some(
      (step) =>
        step.conversation_id !== conversationId ||
        !Number.isInteger(step.step_index) ||
        Number(step.step_index) < 0,
    )
  ) {
    throw new Error('Antigravity returned a tool step for an unexpected conversation.');
  }
  const toolCallIndexes = new Set(toolSteps.map((step) => Number(step.step_index)));
  if (toolCallIndexes.size !== 1) {
    throw new Error(
      `Antigravity expected one generate_image call and found ${toolCallIndexes.size}.`,
    );
  }
  const completedImageSteps = toolSteps.filter(
    (step) => step.tool_name === 'generate_image' && step.state === 'DONE',
  );
  if (completedImageSteps.length !== 1) {
    throw new Error(
      `Antigravity expected one completed generate_image call and found ${completedImageSteps.length}.`,
    );
  }
  const toolInfo = completedImageSteps[0]!.tool_info;
  if (!isRecord(toolInfo) || toolInfo.name !== 'generate_image' || toolInfo.error != null) {
    throw new Error('Antigravity generate_image did not complete successfully.');
  }
  const result = resultEvents[0]!.result;
  if (!isRecord(result) || result.status !== 'SUCCESS' || result.num_turns !== 1) {
    throw new Error('Antigravity image generation did not finish with SUCCESS.');
  }
  if (result.conversation_id !== conversationId) {
    throw new Error('Antigravity result used an unexpected conversation id.');
  }
  return {
    conversationId,
    cwd,
    resultStatus: result.status,
    toolStepCount: toolSteps.length,
    eventTypes: events.map((event) => event.event as string),
  };
}

function resolveArtifactDirectory(home: string, conversationId: string) {
  if (!CONVERSATION_ID_PATTERN.test(conversationId)) {
    throw new Error('Antigravity conversation id cannot identify an artifact directory.');
  }
  const brainDirectory = path.join(home, 'brain');
  const artifactDirectory = path.join(brainDirectory, conversationId);
  if (!existsSync(artifactDirectory)) return artifactDirectory;
  const realBrainDirectory = realpathSync(brainDirectory);
  const realArtifactDirectory = realpathSync(artifactDirectory);
  if (!isInside(realBrainDirectory, realArtifactDirectory)) {
    throw new Error('Antigravity artifact directory escaped its configured brain directory.');
  }
  return realArtifactDirectory;
}

function listArtifactImages(artifactDirectory: string) {
  if (!existsSync(artifactDirectory) || !statSync(artifactDirectory).isDirectory()) return [];
  const realRoot = realpathSync(artifactDirectory);
  const pending = [realRoot];
  const images: string[] = [];
  while (pending.length > 0) {
    const current = pending.pop()!;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.name === '.system_generated') continue;
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) {
        pending.push(target);
      } else if (entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        const realTarget = realpathSync(target);
        if (!isInside(realRoot, realTarget)) {
          throw new Error('Antigravity artifact image escaped its conversation directory.');
        }
        images.push(realTarget);
      }
    }
  }
  return images.sort((left, right) => left.localeCompare(right));
}

function configuredTimeoutMs(env: NodeJS.ProcessEnv) {
  const value = Number(env.STUDIO_ANTIGRAVITY_TIMEOUT_MS);
  return Number.isInteger(value) && value >= 30_000 && value <= 3_600_000
    ? value
    : DEFAULT_TIMEOUT_MS;
}

export function createAntigravityImageExecutor({
  env = process.env,
  runCli = runAntigravityCliProcess,
  readRuntimeDoctor = readAntigravityRuntimeDoctor,
  resolveExecutable = resolveAntigravityExecutable,
  resolveHome = resolveAntigravityHome,
  resolveDefaultLibraryPath = resolveLibraryPath,
  now = () => Date.now(),
  createTemporaryDirectory = () => mkdtempSync(path.join(os.tmpdir(), 'codex-studio-antigravity-')),
}: AntigravityImageExecutorDependencies = {}): ExternalProviderExecutor {
  return async function executeAntigravityImage({
    providerId,
    job,
    compiledInput,
  }: ExternalProviderExecutionContext): Promise<TurnResult> {
    if (
      providerId !== 'antigravity' ||
      compiledInput.providerId !== 'antigravity' ||
      compiledInput.payloadKind !== 'agent_cli_prompt'
    ) {
      throw new Error('Antigravity executor received unsupported provider input.');
    }
    const input = compiledInput as AntigravityImageCompiledInput;
    if (input.payload.output.count !== 1) {
      throw new Error('Antigravity requires exactly one output image per Job.');
    }
    const runtime = readRuntimeDoctor();
    if (!runtime.canRunJobs) {
      throw new Error(`Antigravity runtime is not ready: ${runtime.recommendedAction}`);
    }
    if (input.payload.model && !runtime.availableModels.includes(input.payload.model)) {
      throw new Error(
        `Antigravity model "${input.payload.model}" is unavailable. Available models: ${runtime.availableModels.join(', ') || 'none'}.`,
      );
    }
    const startedAt = now();
    const libraryRoot = job.libraryContext?.rootPath ?? resolveDefaultLibraryPath();
    const temporaryDirectory = assertOwnedTemporaryDirectory(createTemporaryDirectory());
    try {
      const stagedSources = stageManagedSources(input.payload, libraryRoot, temporaryDirectory);
      const prompt = buildAntigravityImagePrompt(input.payload, stagedSources);
      const stdin = `${JSON.stringify({ event: 'user', message: { content: prompt } })}\n`;
      const executable = resolveExecutable(env);
      const result = await runCli({
        executable,
        args: buildAntigravityImageArgs(input.payload),
        cwd: temporaryDirectory,
        env: createAntigravityChildEnvironment(env),
        stdin,
        signal: job.signal,
        timeoutMs: configuredTimeoutMs(env),
      });
      if (result.status !== 0) {
        throw new Error(
          `Antigravity image generation failed with exit ${result.status}. Check the local CLI login and runtime logs.`,
        );
      }
      const stream = parseAntigravityStream(result.stdout);
      if (
        normalizeComparablePath(realpathSync(stream.cwd)) !==
        normalizeComparablePath(temporaryDirectory)
      ) {
        throw new Error('Antigravity reported an unexpected execution workspace.');
      }
      const artifactDirectory = resolveArtifactDirectory(resolveHome(env), stream.conversationId);
      const images = listArtifactImages(artifactDirectory);
      if (images.length !== 1) {
        throw new Error(`Antigravity expected one generated image and found ${images.length}.`);
      }
      const imagePath = images[0]!;
      const imageSize = statSync(imagePath).size;
      if (imageSize <= 0) throw new Error('Antigravity generated an empty image file.');
      if (imageSize > MAX_IMAGE_BYTES) {
        throw new Error('Antigravity generated an image larger than the 25 MB limit.');
      }
      const libraryPath = (...segments: string[]) =>
        job.libraryContext
          ? resolveLibraryPathFromRoot(job.libraryContext.rootPath, ...segments)
          : resolveDefaultLibraryPath(...segments);
      return storeInlineImageResult({
        providerId: 'antigravity',
        providerSlug: 'antigravity',
        model: input.payload.model || 'cli-default',
        endpointBase: 'local://antigravity-cli',
        job,
        compiledInput,
        responseJson: { events: stream.eventTypes, status: stream.resultStatus },
        image: { data: readFileSync(imagePath).toString('base64'), mimeType: null },
        requestAttempts: 1,
        startedAt,
        diagnostics: {
          runtimeKind: 'agent_cli',
          executable,
          cliVersion: runtime.selectedVersionNumber,
          conversationId: stream.conversationId,
          artifactDirectory,
          sourceAssetCount: stagedSources.length,
          toolStepCount: stream.toolStepCount,
        },
        files: {
          resolveLibraryPath: libraryPath,
          mkdir: mkdirSync,
          writeFile: writeFileSync,
          now,
        },
      });
    } finally {
      rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  };
}
