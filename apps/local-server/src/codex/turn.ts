import { Effect, Result } from 'effect';
import {
  providerOperation,
  providerPromise,
  providerFailure,
  type ProviderEffect,
  type ProviderSleep,
} from '../providers/providerEffect';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { resolveLibraryPath } from '../library';
import { log } from '../logger';
import { resolvePlatformPath } from '../platformPaths';
import { createAssetExtractor, type AssetExtractor } from './assetExtractor';
import { resolveJobExecutionOptions } from './executionOptions';
import { resolveCodexImagegenSessionIdentity } from './sessionIdentity';
import { buildCodexImagegenTurnInput } from './turnInput';
import {
  DEFAULT_CODEX_RETRY_POLICY,
  isTransientCodexRuntimeErrorMessage,
  normalizeCodexRetryPolicy,
} from './runtimePolicy';
import {
  closeImagegenSession,
  getImagegenSession,
  getImagegenSessionKey,
  type SessionHandle,
} from './sessionPool';
import type { JsonRpcMessage } from './rpcClient';
import type { JobExecutionOptions } from '../../../../packages/shared/src';
import type { CodexImagegenCompiledInput } from '../providers/codexProvider';

export interface TurnParams {
  prompt: string;
  jobId: string;
  sessionKey?: string;
  execution?: JobExecutionOptions | null;
  compiledInput?: CodexImagegenCompiledInput | null;
  signal?: AbortSignal;
}

export interface TurnResult {
  assets: { type: 'file'; sourcePath: string; mimeType: string }[];
  transcript: string;
  turnId: string | null;
  threadId: string | null;
  durationMs: number;
}

export interface CodexTurn {
  runTurn(params: TurnParams): ProviderEffect<TurnResult>;
}

export interface CodexTurnDependencies {
  createAssetExtractor?: (jobId?: string) => AssetExtractor;
  resolveExecutionOptions?: typeof resolveJobExecutionOptions;
  closeSession?: typeof closeImagegenSession;
  getSession?: typeof getImagegenSession;
  getSessionKey?: typeof getImagegenSessionKey;
  resolveLibraryPath?: typeof resolveLibraryPath;
  resolveProcessCwd?: () => string;
  imagegenSkillPath?: string;
  logger?: typeof log;
  sleep?: ProviderSleep;
  maxAttempts?: number;
  retryDelayMs?: number;
  turnStartTimeoutMs?: number;
  turnCompletionTimeoutMs?: number;
}

const DEFAULT_CODEX_TURN_START_TIMEOUT_MS = Math.max(
  1_000,
  Number(process.env.CODEX_TURN_START_TIMEOUT_MS || 90_000),
);
const DEFAULT_CODEX_TURN_COMPLETION_TIMEOUT_MS = Math.max(
  1_000,
  Number(process.env.CODEX_TURN_COMPLETION_TIMEOUT_MS || 420_000),
);

function createAbortError() {
  const error = new Error('Operation cancelled by user');
  error.name = 'AbortError';
  return error;
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError';
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw createAbortError();
  }
}

function mimeForPath(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.jpg' || ext === '.jpeg'
    ? 'image/jpeg'
    : ext === '.webp'
      ? 'image/webp'
      : 'image/png';
}

function extractAssistantText(notifications: JsonRpcMessage[]) {
  return notifications
    .flatMap((message) => {
      const item = message.params?.item;
      if (!item || item.type !== 'agentMessage') return [];
      if (typeof item.text === 'string') return [item.text];
      return [];
    })
    .join('\n');
}

const CODEX_USAGE_LIMIT_ERROR_MESSAGE =
  'Codex app-server reported no available usage for the selected model. Select GPT-Reserve to use the available Luna Reserve bucket, or wait for the regular bucket to reset.';

function isCodexUsageLimitValue(value: unknown) {
  const serialized =
    value instanceof Error
      ? value.message
      : typeof value === 'string'
        ? value
        : (() => {
            try {
              return JSON.stringify(value);
            } catch {
              return String(value);
            }
          })();

  return /usageLimitExceeded|(?:usage|rate)[\s_-]*(?:limit|quota)(?:[\s\S]{0,80})(?:reached|exceeded|exhausted|empty|depleted)/i.test(
    serialized,
  );
}

function createCodexUsageLimitError() {
  return new Error(CODEX_USAGE_LIMIT_ERROR_MESSAGE);
}

function shouldInvalidatePersistedThread(message: string) {
  return /thread.+not found|unknown thread|invalid thread|socket closed|timed out waiting for codex notification/i.test(
    message,
  );
}

interface ResolvedCodexTurnDependencies {
  createAssetExtractor: (jobId?: string) => AssetExtractor;
  resolveExecutionOptions: typeof resolveJobExecutionOptions;
  closeSession: typeof closeImagegenSession;
  getSession: typeof getImagegenSession;
  getSessionKey: typeof getImagegenSessionKey;
  resolveLibraryPath: typeof resolveLibraryPath;
  resolveProcessCwd: () => string;
  imagegenSkillPath: string;
  logger: typeof log;
  sleep: ProviderSleep;
  maxAttempts: number;
  retryDelayMs: number;
  turnStartTimeoutMs: number;
  turnCompletionTimeoutMs: number;
}

function runCodexImagegenTurn(
  session: SessionHandle,
  job: {
    id: string;
    prompt: string;
    execution?: JobExecutionOptions | null;
    compiledInput?: CodexImagegenCompiledInput | null;
  },
  transcriptPath: string,
  startedAt: number,
  sessionKey: string,
  dependencies: ResolvedCodexTurnDependencies,
  signal?: AbortSignal,
): ProviderEffect<TurnResult> {
  return providerOperation(
    Effect.gen(function* () {
      const executionOptions = dependencies.resolveExecutionOptions(job.execution);
      const assetExtractor = dependencies.createAssetExtractor(job.id);
      const notificationStart = session.client.getNotificationCount();
      let turnId: string | null = null;

      const invalidateSession = () =>
        dependencies.closeSession(sessionKey, {
          invalidatePersistedThread: true,
        });

      let turn;
      try {
        turn = Result.getOrThrowWith(
          yield* Effect.result(
            session.client
              .request('turn/start', {
                threadId: session.threadId,
                input: buildCodexImagegenTurnInput({
                  imagegenSkillPath: dependencies.imagegenSkillPath,
                  fallbackPrompt: job.prompt,
                  compiledInput: job.compiledInput ?? null,
                }),
                cwd: dependencies.resolveProcessCwd(),
                approvalPolicy: 'never',
                model: executionOptions.model,
                effort: executionOptions.reasoningEffort,
                serviceTier: executionOptions.serviceTier ?? undefined,
              })
              .pipe(Effect.onInterrupt(() => Effect.sync(invalidateSession)))
              .pipe(
                Effect.timeoutOrElse({
                  duration: dependencies.turnStartTimeoutMs,
                  orElse: () =>
                    Effect.fail(
                      providerFailure(
                        new Error('Timed out waiting for Codex notification (turn start)'),
                      ),
                    ),
                }),
              ),
          ),
          (error) => error,
        );
      } catch (error) {
        if (isCodexUsageLimitValue(error)) {
          throw createCodexUsageLimitError();
        }
        throw error;
      }
      turnId = turn?.turn?.id ?? null;

      yield* session.client
        .waitForNotification(
          (message) =>
            message.method === 'turn/completed' && (!turnId || message.params?.turn?.id === turnId),
          dependencies.turnCompletionTimeoutMs,
        )
        .pipe(Effect.onInterrupt(() => Effect.sync(invalidateSession)));

      throwIfAborted(signal);

      const notifications = session.client.getNotificationsSince(notificationStart);
      for (const notification of notifications) {
        writeFileSync(transcriptPath, `${JSON.stringify(notification)}\n`, {
          flag: 'a',
        });
      }

      if (notifications.some(isCodexUsageLimitValue)) {
        throw createCodexUsageLimitError();
      }

      const discoveredAssets = yield* providerPromise(() =>
        assetExtractor.extract(notifications, {
          threadId: session.threadId,
          sinceMs: startedAt,
        }),
      );
      const discoveredAsset = discoveredAssets[0];

      if (discoveredAsset?.origin === 'inline' && discoveredAsset.sourcePath) {
        return {
          assets: [
            {
              type: 'file',
              sourcePath: discoveredAsset.sourcePath,
              mimeType: discoveredAsset.mimeType,
            },
          ],
          transcript: transcriptPath,
          turnId,
          threadId: session.threadId,
          durationMs: Date.now() - startedAt,
        };
      }

      const assistantText = extractAssistantText(notifications);
      if (
        /can[’']?t directly generate|image generation runtime\/tool isn[’']?t available|OPENAI_API_KEY/i.test(
          assistantText,
        )
      ) {
        throw new Error(
          `Codex app-server thread lacks image generation capability for job ${job.id}`,
        );
      }

      if (!discoveredAsset?.sourcePath) {
        return {
          assets: [],
          transcript: transcriptPath,
          turnId,
          threadId: session.threadId,
          durationMs: Date.now() - startedAt,
        };
      }

      const outputPath = dependencies.resolveLibraryPath(
        'assets',
        `${job.id}-codex${path.extname(discoveredAsset.sourcePath).toLowerCase() || '.png'}`,
      );
      copyFileSync(discoveredAsset.sourcePath, outputPath);
      return {
        assets: [
          {
            type: 'file',
            sourcePath: outputPath,
            mimeType: discoveredAsset.mimeType || mimeForPath(outputPath),
          },
        ],
        transcript: transcriptPath,
        turnId,
        threadId: session.threadId,
        durationMs: Date.now() - startedAt,
      };
    }),
  );
}

function runImagegenJob(
  job: {
    id: string;
    prompt: string;
    sessionKey?: string;
    execution?: JobExecutionOptions | null;
    compiledInput?: CodexImagegenCompiledInput | null;
    signal?: AbortSignal;
  },
  dependencies: ResolvedCodexTurnDependencies,
): ProviderEffect<TurnResult> {
  return providerOperation(
    Effect.gen(function* () {
      const startedAt = Date.now();
      const transcriptDir = dependencies.resolveLibraryPath('transcripts', job.id);
      mkdirSync(transcriptDir, { recursive: true });
      const transcriptPath = path.join(transcriptDir, 'events.jsonl');
      const sessionIdentity = resolveCodexImagegenSessionIdentity({
        jobId: job.id,
        prompt: job.prompt,
        requestedSessionKey: job.sessionKey,
        hasImageInputs: (job.compiledInput?.payload.imageInputs.length ?? 0) > 0,
        getSessionKey: dependencies.getSessionKey,
      });
      const { sessionKey, reusable: reusableSession } = sessionIdentity;
      const retryPolicy = normalizeCodexRetryPolicy({
        maxAttempts: dependencies.maxAttempts,
        retryDelayMs: dependencies.retryDelayMs,
      });
      let attempt = 0;
      let enteredTurn = false;
      const runAttempt = Effect.suspend(() => {
        attempt += 1;
        enteredTurn = false;
        return Effect.scoped(
          Effect.gen(function* () {
            throwIfAborted(job.signal);
            const session = yield* Effect.acquireRelease(
              dependencies.getSession(sessionKey, job.execution),
              () =>
                Effect.sync(() => {
                  if (!reusableSession)
                    dependencies.closeSession(sessionKey, { invalidatePersistedThread: true });
                }),
              { interruptible: true },
            );
            enteredTurn = true;
            return yield* session.lock
              .withPermits(1)(
                runCodexImagegenTurn(
                  session,
                  job,
                  transcriptPath,
                  startedAt,
                  sessionKey,
                  dependencies,
                  job.signal,
                ),
              )
              .pipe(
                Effect.tapError((error) =>
                  Effect.sync(() => {
                    if (!isAbortError(error))
                      dependencies.closeSession(sessionKey, {
                        invalidatePersistedThread: shouldInvalidatePersistedThread(error.message),
                      });
                  }),
                ),
              );
          }),
        );
      });
      return yield* runAttempt.pipe(
        Effect.retry({
          while: (error) => {
            if (
              !enteredTurn ||
              isAbortError(error) ||
              job.signal?.aborted ||
              attempt >= retryPolicy.maxAttempts ||
              !isTransientCodexRuntimeErrorMessage(error.message)
            ) {
              return Effect.succeed(false);
            }
            return Effect.gen(function* () {
              dependencies.logger(
                'warn',
                'codex-session',
                `Retrying ${job.id} after transient Codex failure on ${sessionKey}: ${error.message}`,
                job.id,
              );
              yield* dependencies.sleep(retryPolicy.retryDelayMs);
              return true;
            });
          },
        }),
      );
    }),
  );
}

export function createCodexTurn({
  createAssetExtractor: createAssetExtractorFn = createAssetExtractor,
  resolveExecutionOptions = resolveJobExecutionOptions,
  closeSession = closeImagegenSession,
  getSession = getImagegenSession,
  getSessionKey = getImagegenSessionKey,
  resolveLibraryPath: resolveLibrary = resolveLibraryPath,
  resolveProcessCwd = () => process.cwd(),
  imagegenSkillPath = path.join(
    resolvePlatformPath('codex-skills-dir'),
    '.system',
    'imagegen',
    'SKILL.md',
  ),
  logger = log,
  sleep = (durationMs: number) => Effect.sleep(durationMs),
  maxAttempts = DEFAULT_CODEX_RETRY_POLICY.maxAttempts,
  retryDelayMs = DEFAULT_CODEX_RETRY_POLICY.retryDelayMs,
  turnStartTimeoutMs = DEFAULT_CODEX_TURN_START_TIMEOUT_MS,
  turnCompletionTimeoutMs = DEFAULT_CODEX_TURN_COMPLETION_TIMEOUT_MS,
}: CodexTurnDependencies = {}): CodexTurn {
  const dependencies: ResolvedCodexTurnDependencies = {
    createAssetExtractor: createAssetExtractorFn,
    resolveExecutionOptions,
    closeSession,
    getSession,
    getSessionKey,
    resolveLibraryPath: resolveLibrary,
    resolveProcessCwd,
    imagegenSkillPath,
    logger,
    sleep,
    maxAttempts,
    retryDelayMs,
    turnStartTimeoutMs,
    turnCompletionTimeoutMs,
  };

  return {
    runTurn(params) {
      return runImagegenJob(
        {
          id: params.jobId,
          prompt: params.prompt,
          sessionKey: params.sessionKey,
          execution: params.execution,
          compiledInput: params.compiledInput ?? null,
          signal: params.signal,
        },
        dependencies,
      );
    },
  };
}
