import { appendFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { getCodexWsUrl, getSettings } from './config';
import { resolveCodexInvocation } from './codexExecutable';
import { resolveLibraryPath, toPublicAssetUrl } from './library';
import { log } from './logger';

interface JsonRpcMessage {
  jsonrpc?: '2.0';
  id?: number | string;
  method?: string;
  params?: any;
  result?: any;
  error?: any;
}

interface RunImagegenResult {
  codexThreadId: string | null;
  codexTurnId: string | null;
  transcriptPath: string;
  discoveredImagePath: string | null;
}

interface AppServerDiagnostics {
  pid: number | null;
  lastExitCode: number | null;
  lastExitAt: string | null;
  lastInvocation: string[] | null;
  lastStartAt: string | null;
  lastStartError: string | null;
}

let appServerProcess: ReturnType<typeof Bun.spawn> | null = null;
const appServerDiagnostics: AppServerDiagnostics = {
  pid: null,
  lastExitCode: null,
  lastExitAt: null,
  lastInvocation: null,
  lastStartAt: null,
  lastStartError: null,
};

export function isAppServerRunning() {
  return appServerProcess !== null && appServerProcess.exitCode === null;
}

export function getAppServerDiagnostics() {
  return {
    ...appServerDiagnostics,
    lastInvocation: appServerDiagnostics.lastInvocation ? [...appServerDiagnostics.lastInvocation] : null,
  };
}

export function ensureAppServer() {
  if (isAppServerRunning()) return;

  const logPath = resolveLibraryPath('logs', 'app-server.log');
  const invocation = resolveCodexInvocation(['app-server', '--listen', getCodexWsUrl()]);
  appServerDiagnostics.lastInvocation = invocation;
  appServerDiagnostics.lastStartError = null;
  appServerDiagnostics.lastStartAt = new Date().toISOString();
  appServerDiagnostics.lastExitCode = null;
  appServerDiagnostics.lastExitAt = null;

  try {
    appServerProcess = Bun.spawn(invocation, {
      stdout: 'pipe',
      stderr: 'pipe',
      stdin: 'ignore',
      env: process.env,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    appServerDiagnostics.pid = null;
    appServerDiagnostics.lastStartError = message;
    log('error', 'app-server', `Failed to start codex app-server: ${message}`);
    throw error;
  }

  appServerDiagnostics.pid = appServerProcess.pid ?? null;

  const pipeOutput = async (stream: ReadableStream<Uint8Array> | null) => {
    if (!stream) return;
    const reader = stream.getReader();
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      appendFileSync(logPath, Buffer.from(chunk.value).toString('utf8'));
    }
  };
  if (appServerProcess.stdout instanceof ReadableStream) {
    void pipeOutput(appServerProcess.stdout);
  }
  if (appServerProcess.stderr instanceof ReadableStream) {
    void pipeOutput(appServerProcess.stderr);
  }

  log('info', 'app-server', `Started codex app-server on ${getCodexWsUrl()} with ${invocation.join(' ')} (pid ${appServerProcess.pid})`);
  appServerProcess.exited.then((code) => {
    appServerDiagnostics.pid = null;
    appServerDiagnostics.lastExitCode = code;
    appServerDiagnostics.lastExitAt = new Date().toISOString();
    log('warn', 'app-server', `codex app-server exited with code ${code}`);
    appServerProcess = null;
  });
}

class CodexRpcClient {
  private socket: WebSocket | null = null;
  private nextId = 1;
  private pending = new Map<number, { resolve: (value: any) => void; reject: (error: Error) => void }>();
  private notifications: JsonRpcMessage[] = [];

  async connect() {
    ensureAppServer();

    for (let attempt = 0; attempt < 25; attempt += 1) {
      try {
        await this.tryConnect();
        return;
      } catch {
        await Bun.sleep(200);
      }
    }

    throw new Error(`Unable to connect to ${getCodexWsUrl()}`);
  }

  private tryConnect() {
    return new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(getCodexWsUrl());
      const timeout = setTimeout(() => {
        socket.close();
        reject(new Error('Timed out connecting to codex app-server'));
      }, 1000);

      socket.addEventListener('open', () => {
        clearTimeout(timeout);
        this.socket = socket;
        socket.addEventListener('message', (event) => this.handleMessage(String(event.data)));
        socket.addEventListener('close', () => {
          this.socket = null;
        });
        resolve();
      });
      socket.addEventListener('error', () => {
        clearTimeout(timeout);
        reject(new Error('WebSocket connection failed'));
      });
    });
  }

  request(method: string, params: unknown) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Codex app-server socket is not open');
    }
    const id = this.nextId++;
    const message = { jsonrpc: '2.0', id, method, params };
    this.socket.send(JSON.stringify(message));
    return new Promise<any>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  notify(method: string, params?: unknown) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify({ jsonrpc: '2.0', method, params }));
  }

  waitForNotification(predicate: (message: JsonRpcMessage) => boolean, timeoutMs: number) {
    const existing = this.notifications.find(predicate);
    if (existing) return Promise.resolve(existing);

    return new Promise<JsonRpcMessage>((resolve, reject) => {
      const started = Date.now();
      const interval = setInterval(() => {
        const match = this.notifications.find(predicate);
        if (match) {
          clearInterval(interval);
          resolve(match);
          return;
        }
        if (Date.now() - started > timeoutMs) {
          clearInterval(interval);
          reject(new Error('Timed out waiting for Codex notification'));
        }
      }, 250);
    });
  }

  getNotifications() {
    return [...this.notifications];
  }

  getNotificationCount() {
    return this.notifications.length;
  }

  getNotificationsSince(index: number) {
    return this.notifications.slice(index);
  }

  close() {
    this.socket?.close();
    this.socket = null;
  }

  private handleMessage(raw: string) {
    let message: JsonRpcMessage;
    try {
      message = JSON.parse(raw);
    } catch {
      return;
    }

    if (message.id !== undefined && this.pending.has(Number(message.id))) {
      const pending = this.pending.get(Number(message.id))!;
      this.pending.delete(Number(message.id));
      if (message.error) {
        pending.reject(new Error(JSON.stringify(message.error)));
      } else {
        pending.resolve(message.result);
      }
      return;
    }

    this.notifications.push(message);
  }
}

function getNewestGeneratedImage(codexHome: string | null, sinceMs: number) {
  if (!codexHome) return null;
  const generatedDir = path.join(codexHome, 'generated_images');
  if (!existsSync(generatedDir)) return null;

  const candidates: string[] = [];
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath);
      } else if (/\.(png|jpg|jpeg|webp)$/i.test(entry.name)) {
        const stats = statSync(fullPath);
        if (stats.mtimeMs >= sinceMs) candidates.push(fullPath);
      }
    }
  };

  visit(generatedDir);
  candidates.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  return candidates[0] ?? null;
}

function extractImageResultFromNotifications(notifications: JsonRpcMessage[], jobId: string) {
  for (const message of notifications) {
    const raw = JSON.stringify(message);
    const pngMatch = raw.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
    const jpegMatch = raw.match(/data:image\/jpeg;base64,([A-Za-z0-9+/=]+)/);
    const webpMatch = raw.match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/);
    const match = pngMatch || jpegMatch || webpMatch;
    if (!match) continue;

    const mime = pngMatch ? 'png' : jpegMatch ? 'jpg' : 'webp';
    const outputPath = resolveLibraryPath('assets', `${jobId}-codex.${mime}`);
    writeFileSync(outputPath, Buffer.from(match[1], 'base64'));
    return outputPath;
  }
  return null;
}

function extractGeneratedImageItemPath(notifications: JsonRpcMessage[], codexHome: string | null) {
  if (!codexHome) return null;
  for (let index = notifications.length - 1; index >= 0; index -= 1) {
    const message = notifications[index];
    const item = message.params?.item;
    if (item?.type !== 'imageGeneration' || !item.id) continue;

    const threadId = message.params?.threadId;
    if (!threadId) continue;

    const generatedPath = path.join(codexHome, 'generated_images', threadId, `${item.id}.png`);
    if (existsSync(generatedPath)) return generatedPath;
  }
  return null;
}

function stripAnsi(value: string) {
  return value.replace(/\u001b\[[0-9;]*m/g, '');
}

function decodeJsonPath(value: string) {
  return value
    .replace(/\\\\/g, '\\')
    .replace(/\\u001b/g, '\u001b')
    .replace(/\\r|\\n/g, '')
    .trim();
}

function extractSavedImagePathFromNotifications(notifications: JsonRpcMessage[], sinceMs: number) {
  const raw = stripAnsi(JSON.stringify(notifications));
  const matches = [
    ...raw.matchAll(/[A-Z]:\\\\(?:[^"'\\r\\n]|\\\\(?!r|n))+?\.(?:png|jpg|jpeg|webp)/gi),
    ...raw.matchAll(/[A-Z]:\\(?:[^"'\\r\\n]|\\(?!r|n))+?\.(?:png|jpg|jpeg|webp)/gi),
  ];

  const candidates = [...new Set(matches.map((match) => decodeJsonPath(match[0])))]
    .filter((filePath) => !/_image_id_\.(?:png|jpg|jpeg|webp)$/i.test(filePath))
    .filter((filePath) => /(?:generated_images)/i.test(filePath))
    .filter((filePath) => {
      if (!existsSync(filePath)) return false;
      return statSync(filePath).mtimeMs >= sinceMs - 1000;
    })
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);

  return candidates[0] ?? null;
}

const IMAGEGEN_MODEL = process.env.CODEX_IMAGEGEN_MODEL || 'gpt-5.4';
const IMAGEGEN_REASONING_EFFORT = process.env.CODEX_IMAGEGEN_REASONING_EFFORT || 'low';
const IMAGEGEN_SKILL_PATH = 'C:\\Users\\user\\.codex\\skills\\.system\\imagegen\\SKILL.md';

interface ImagegenSession {
  client: CodexRpcClient;
  codexHome: string | null;
  threadId: string | null;
  queue: Promise<void>;
}

const imagegenSessions = new Map<string, ImagegenSession>();

function normalizeSessionToken(value: string | null) {
  return (value ?? 'unknown')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function extractPromptField(prompt: string, field: 'PACK' | 'CATEGORY') {
  const match = prompt.match(new RegExp(`^${field}:\\s*(.+)$`, 'im'));
  return match?.[1]?.trim() ?? null;
}

function getImagegenSessionKey(prompt: string) {
  const pack = normalizeSessionToken(extractPromptField(prompt, 'PACK'));
  const category = normalizeSessionToken(extractPromptField(prompt, 'CATEGORY'));
  return `${pack || 'unknown_pack'}__${category || 'unknown_category'}`;
}

async function createImagegenSession(sessionKey: string): Promise<ImagegenSession> {
  const client = new CodexRpcClient();
  await client.connect();

  const init = await client.request('initialize', {
    clientInfo: {
      name: 'codex-image-studio',
      title: 'Codex Image Studio',
      version: '0.1.0',
    },
    capabilities: null,
  });
  const codexHome = init?.codexHome ?? null;
  client.notify('initialized');

  const thread = await client.request('thread/start', {
    model: IMAGEGEN_MODEL,
    cwd: process.cwd(),
    approvalPolicy: 'never',
    sandbox: 'danger-full-access',
    sessionStartSource: 'startup',
    developerInstructions:
      `You are running inside Codex Image Studio in a persistent style-category thread (${sessionKey}). ` +
      'Generate exactly one image per user turn through the provided imagegen skill. ' +
      'Do not run shell commands to locate or copy the newest generated image. ' +
      'Do not copy files from C:\\Users\\user\\.codex\\generated_images manually. ' +
      'Report only the image generated by the current turn.',
  });

  const session: ImagegenSession = {
    client,
    codexHome,
    threadId: thread?.thread?.id ?? null,
    queue: Promise.resolve(),
  };
  imagegenSessions.set(sessionKey, session);
  log('info', 'codex-session', `Started persistent imagegen thread ${session.threadId ?? 'unknown'} for ${sessionKey}`);
  return session;
}

async function getImagegenSession(sessionKey: string) {
  const existing = imagegenSessions.get(sessionKey);
  if (existing) return existing;
  return createImagegenSession(sessionKey);
}

function closeImagegenSession(sessionKey: string) {
  const session = imagegenSessions.get(sessionKey);
  if (!session) return;
  session.client.close();
  imagegenSessions.delete(sessionKey);
}

export async function runCodexImagegenJob(job: { id: string; prompt: string; projectId: string }): Promise<RunImagegenResult> {
  const startedAt = Date.now();
  const transcriptDir = resolveLibraryPath('transcripts', job.id);
  mkdirSync(transcriptDir, { recursive: true });
  const transcriptPath = path.join(transcriptDir, 'events.jsonl');
  const sessionKey = getImagegenSessionKey(job.prompt);
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    let runResult!: RunImagegenResult;
    const session = await getImagegenSession(sessionKey);
    const run = session.queue.then(async () => {
      try {
        runResult = await runCodexImagegenTurn(session, job, transcriptPath, startedAt);
      } catch (error) {
        closeImagegenSession(sessionKey);
        throw error;
      }
    });
    session.queue = run.catch(() => {});

    try {
      await run;
      return runResult;
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const retryable = /stream disconnected|Timed out waiting for Codex notification/i.test(message);
      if (!retryable || attempt === 2) throw error;
      log('warn', 'codex-session', `Retrying ${job.id} after transient Codex failure on ${sessionKey}: ${message}`, job.id);
      await Bun.sleep(1_500);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function runCodexImagegenTurn(
  session: ImagegenSession,
  job: { id: string; prompt: string; projectId: string },
  transcriptPath: string,
  startedAt: number,
): Promise<RunImagegenResult> {
  const notificationStart = session.client.getNotificationCount();
  let turnId: string | null = null;

  const turn = await session.client.request('turn/start', {
    threadId: session.threadId,
    input: [
      { type: 'skill', name: 'imagegen', path: IMAGEGEN_SKILL_PATH },
      {
        type: 'text',
        text:
          'Generate exactly one portrait image for this Codex Image Studio style preset. ' +
          'Use txt2img from the full prompt below. Save or expose the resulting image so the local studio can import it, ' +
          'then report the exact local file path.\n\n' +
          `Prompt:\n${job.prompt}`,
        text_elements: [],
      },
    ],
    cwd: process.cwd(),
    approvalPolicy: 'never',
    model: IMAGEGEN_MODEL,
    effort: IMAGEGEN_REASONING_EFFORT,
  });
  turnId = turn?.turn?.id ?? null;

  await session.client.waitForNotification(
    (message) => message.method === 'turn/completed' && (!turnId || message.params?.turn?.id === turnId),
    600_000,
  );

  const notifications = session.client.getNotificationsSince(notificationStart);
  for (const notification of notifications) {
    writeFileSync(transcriptPath, `${JSON.stringify(notification)}\n`, { flag: 'a' });
  }

  const inlineImage = extractImageResultFromNotifications(notifications, job.id);
  if (inlineImage) {
    return { codexThreadId: session.threadId, codexTurnId: turnId, transcriptPath, discoveredImagePath: inlineImage };
  }

  const generatedImage = extractGeneratedImageItemPath(notifications, session.codexHome);
  if (generatedImage) {
    const outputPath = resolveLibraryPath('assets', `${job.id}-codex.png`);
    copyFileSync(generatedImage, outputPath);
    return { codexThreadId: session.threadId, codexTurnId: turnId, transcriptPath, discoveredImagePath: outputPath };
  }

  return { codexThreadId: session.threadId, codexTurnId: turnId, transcriptPath, discoveredImagePath: null };
}

export function codexAssetPublicUrl(filePath: string) {
  return toPublicAssetUrl(filePath);
}
