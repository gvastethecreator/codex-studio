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

let appServerProcess: ReturnType<typeof Bun.spawn> | null = null;

export function isAppServerRunning() {
  return appServerProcess !== null && appServerProcess.exitCode === null;
}

export function ensureAppServer() {
  if (isAppServerRunning()) return;

  const settings = getSettings();
  const logPath = resolveLibraryPath('logs', 'app-server.log');
  const invocation = resolveCodexInvocation(['app-server', '--listen', getCodexWsUrl()]);
  appServerProcess = Bun.spawn(invocation, {
    stdout: 'pipe',
    stderr: 'pipe',
    stdin: 'ignore',
    env: process.env,
  });

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
    log('warn', 'app-server', `codex app-server exited with code ${code}`);
    appServerProcess = null;
  });

  void settings;
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

export async function runCodexImagegenJob(job: { id: string; prompt: string; projectId: string }): Promise<RunImagegenResult> {
  const client = new CodexRpcClient();
  const startedAt = Date.now();
  let codexHome: string | null = null;
  let threadId: string | null = null;
  let turnId: string | null = null;
  const transcriptDir = resolveLibraryPath('transcripts', job.id);
  mkdirSync(transcriptDir, { recursive: true });
  const transcriptPath = path.join(transcriptDir, 'events.jsonl');

  try {
    await client.connect();
    const init = await client.request('initialize', {
      clientInfo: {
        name: 'codex-image-studio',
        title: 'Codex Image Studio',
        version: '0.1.0',
      },
      capabilities: null,
    });
    codexHome = init?.codexHome ?? null;
    client.notify('initialized');

    const thread = await client.request('thread/start', {
      cwd: process.cwd(),
      approvalPolicy: 'never',
      sandbox: 'danger-full-access',
      sessionStartSource: 'startup',
      developerInstructions:
        'You are running inside Codex Image Studio. Generate images through the provided imagegen skill and report saved image paths succinctly.',
    });
    threadId = thread?.thread?.id ?? null;

    const imagegenSkillPath = 'C:\\Users\\cristian\\.codex\\skills\\.system\\imagegen\\SKILL.md';
    const turn = await client.request('turn/start', {
      threadId,
      input: [
        { type: 'skill', name: 'imagegen', path: imagegenSkillPath },
        {
          type: 'text',
          text: `Generate one image for this Codex Image Studio job. Save or expose the resulting image so the local studio can import it.\n\nPrompt:\n${job.prompt}`,
          text_elements: [],
        },
      ],
      cwd: process.cwd(),
      approvalPolicy: 'never',
    });
    turnId = turn?.turn?.id ?? null;

    await client.waitForNotification(
      (message) => message.method === 'turn/completed' && (!turnId || message.params?.turn?.id === turnId),
      180_000,
    );

    const notifications = client.getNotifications();
    for (const notification of notifications) {
      writeFileSync(transcriptPath, `${JSON.stringify(notification)}\n`, { flag: 'a' });
    }

    const inlineImage = extractImageResultFromNotifications(notifications, job.id);
    if (inlineImage) {
      return { codexThreadId: threadId, codexTurnId: turnId, transcriptPath, discoveredImagePath: inlineImage };
    }

    const newest = getNewestGeneratedImage(codexHome, startedAt);
    if (newest) {
      const ext = path.extname(newest) || '.png';
      const outputPath = resolveLibraryPath('assets', `${job.id}-codex${ext}`);
      copyFileSync(newest, outputPath);
      return { codexThreadId: threadId, codexTurnId: turnId, transcriptPath, discoveredImagePath: outputPath };
    }

    return { codexThreadId: threadId, codexTurnId: turnId, transcriptPath, discoveredImagePath: null };
  } finally {
    client.close();
  }
}

export function codexAssetPublicUrl(filePath: string) {
  return toPublicAssetUrl(filePath);
}
