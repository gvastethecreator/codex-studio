import { copyFileSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { resolveLibraryPath } from '../library';
import { log } from '../logger';
import { resolvePlatformPath } from '../platformPaths';
import { closeImagegenSession, getImagegenSession, getImagegenSessionKey, type SessionHandle } from './sessionPool';
import type { JsonRpcMessage } from './rpcClient';

const IMAGEGEN_MODEL = process.env.CODEX_IMAGEGEN_MODEL || 'gpt-5.4-mini';
const IMAGEGEN_REASONING_EFFORT = process.env.CODEX_IMAGEGEN_REASONING_EFFORT || 'low';
const IMAGEGEN_SKILL_PATH = path.join(resolvePlatformPath('codex-skills-dir'), '.system', 'imagegen', 'SKILL.md');

export interface TurnParams {
  projectId: string;
  prompt: string;
  jobId: string;
  sessionKey?: string;
}

export interface TurnResult {
  assets: { type: 'file'; sourcePath: string; mimeType: string }[];
  transcript: string;
  turnId: string | null;
  threadId: string | null;
  durationMs: number;
}

export interface CodexTurn {
  runTurn(params: TurnParams): Promise<TurnResult>;
}

function extractImageResultFromNotifications(notifications: JsonRpcMessage[], jobId: string) {
  for (const message of notifications) {
    const raw = JSON.stringify(message);
    const pngMatch = raw.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
    const jpegMatch = raw.match(/data:image\/jpeg;base64,([A-Za-z0-9+/=]+)/);
    const webpMatch = raw.match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/);
    const match = pngMatch || jpegMatch || webpMatch;
    if (!match) continue;

    const ext = pngMatch ? 'png' : jpegMatch ? 'jpg' : 'webp';
    const outputPath = resolveLibraryPath('assets', `${jobId}-codex.${ext}`);
    writeFileSync(outputPath, Buffer.from(match[1], 'base64'));
    return outputPath;
  }
  return null;
}

function extractGeneratedImageItemPath(notifications: JsonRpcMessage[]) {
  const generatedImagesDir = resolvePlatformPath('codex-generated-images');
  for (let index = notifications.length - 1; index >= 0; index -= 1) {
    const message = notifications[index];
    const item = message.params?.item;
    if (item?.type !== 'imageGeneration' || !item.id) continue;

    const threadId = message.params?.threadId;
    if (!threadId) continue;

    const generatedPath = path.join(generatedImagesDir, threadId, `${item.id}.png`);
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
    ...raw.matchAll(/\/(?:[^"'\r\n])+?\.(?:png|jpg|jpeg|webp)/gi),
  ];
  const generatedImagesDir = resolvePlatformPath('codex-generated-images');

  const candidates = [...new Set(matches.map((match) => decodeJsonPath(match[0])))]
    .filter((filePath) => !/_image_id_\.(?:png|jpg|jpeg|webp)$/i.test(filePath))
    .filter((filePath) => filePath.includes(generatedImagesDir) || /(?:generated_images)/i.test(filePath))
    .filter((filePath) => existsSync(filePath) && statSync(filePath).mtimeMs >= sinceMs - 1000)
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);

  return candidates[0] ?? null;
}

function mimeForPath(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png';
}

function extractAssistantText(notifications: JsonRpcMessage[]) {
  return notifications
    .map((message) => {
      const item = message.params?.item;
      if (!item || item.type !== 'agentMessage') return '';
      if (typeof item.text === 'string') return item.text;
      return '';
    })
    .filter(Boolean)
    .join('\n');
}

async function runCodexImagegenTurn(
  session: SessionHandle,
  job: { id: string; prompt: string; projectId: string },
  transcriptPath: string,
  startedAt: number,
): Promise<TurnResult> {
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
    return {
      assets: [{ type: 'file', sourcePath: inlineImage, mimeType: mimeForPath(inlineImage) }],
      transcript: transcriptPath,
      turnId,
      threadId: session.threadId,
      durationMs: Date.now() - startedAt,
    };
  }

  const assistantText = extractAssistantText(notifications);
  if (
    /can[’']?t directly generate|image generation runtime\/tool isn[’']?t available|OPENAI_API_KEY/i.test(assistantText)
  ) {
    throw new Error(`Codex app-server thread lacks image generation capability for job ${job.id}`);
  }

  const discovered = extractGeneratedImageItemPath(notifications)
    ?? extractSavedImagePathFromNotifications(notifications, startedAt);

  if (!discovered) {
    return { assets: [], transcript: transcriptPath, turnId, threadId: session.threadId, durationMs: Date.now() - startedAt };
  }

  const outputPath = resolveLibraryPath('assets', `${job.id}-codex${path.extname(discovered).toLowerCase() || '.png'}`);
  copyFileSync(discovered, outputPath);
  return {
    assets: [{ type: 'file', sourcePath: outputPath, mimeType: mimeForPath(outputPath) }],
    transcript: transcriptPath,
    turnId,
    threadId: session.threadId,
    durationMs: Date.now() - startedAt,
  };
}

async function runImagegenJob(job: { id: string; prompt: string; projectId: string }): Promise<TurnResult> {
  const startedAt = Date.now();
  const transcriptDir = resolveLibraryPath('transcripts', job.id);
  mkdirSync(transcriptDir, { recursive: true });
  const transcriptPath = path.join(transcriptDir, 'events.jsonl');
  const sessionKey = getImagegenSessionKey(job.prompt);
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    let runResult!: TurnResult;
    const session = await getImagegenSession(sessionKey);
    const run = session.queue.then(async () => {
      try {
        runResult = await runCodexImagegenTurn(session, job, transcriptPath, startedAt);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const invalidatePersistedThread = /thread.+not found|unknown thread|invalid thread/i.test(message);
        closeImagegenSession(sessionKey, { invalidatePersistedThread });
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
      const retryable = /stream disconnected|Timed out waiting for Codex notification|thread.+not found|unknown thread|invalid thread/i.test(message);
      if (!retryable || attempt === 2) throw error;
      log('warn', 'codex-session', `Retrying ${job.id} after transient Codex failure on ${sessionKey}: ${message}`, job.id);
      await Bun.sleep(1_500);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export function createCodexTurn(): CodexTurn {
  return {
    runTurn(params) {
      return runImagegenJob({
        id: params.jobId,
        projectId: params.projectId,
        prompt: params.prompt,
      });
    },
  };
}
