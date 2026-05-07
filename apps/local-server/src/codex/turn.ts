import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { getSettings } from '../config';
import { resolveLibraryPath } from '../library';
import { log } from '../logger';
import { resolvePlatformPath } from '../platformPaths';
import { createAssetExtractor } from './assetExtractor';
import { closeImagegenSession, getImagegenSession, getImagegenSessionKey, type SessionHandle } from './sessionPool';
import type { JsonRpcMessage } from './rpcClient';

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
  const settings = getSettings();
  const assetExtractor = createAssetExtractor(job.id);
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
    model: settings.codexImagegenModel,
    effort: settings.codexImagegenReasoningEffort,
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

  const discoveredAssets = await assetExtractor.extract(notifications, {
    threadId: session.threadId,
    sinceMs: startedAt,
  });
  const discoveredAsset = discoveredAssets[0];

  if (discoveredAsset?.origin === 'inline' && discoveredAsset.sourcePath) {
    return {
      assets: [{ type: 'file', sourcePath: discoveredAsset.sourcePath, mimeType: discoveredAsset.mimeType }],
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

  if (!discoveredAsset?.sourcePath) {
    return { assets: [], transcript: transcriptPath, turnId, threadId: session.threadId, durationMs: Date.now() - startedAt };
  }

  const outputPath = resolveLibraryPath('assets', `${job.id}-codex${path.extname(discoveredAsset.sourcePath).toLowerCase() || '.png'}`);
  copyFileSync(discoveredAsset.sourcePath, outputPath);
  return {
    assets: [{ type: 'file', sourcePath: outputPath, mimeType: discoveredAsset.mimeType || mimeForPath(outputPath) }],
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
