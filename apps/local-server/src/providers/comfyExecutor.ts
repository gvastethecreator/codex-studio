import { Effect, Exit, Result } from 'effect';
import { providerOperation } from './providerEffect';
import { readFileSync } from 'node:fs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { type ProviderSleep } from './providerEffect';
import type { ComfyRemoteExecution } from '../../../../packages/shared/src';
import { resolveLibraryPath } from '../library';

import type { ExternalProviderExecutor } from './externalProvider';
import type { ComfyWorkflowCompiledInput } from './externalProviderInputs';
import {
  isRecord,
  storeHostedImageResult,
  type ExternalProviderFetch,
  type ExternalProviderFileDependencies,
} from './externalProviderResults';
import { DEFAULT_COMFY_MODEL } from './providerExecutionDefaults';
import { ProviderExecutionUncertainError, createAbortWorkerError } from '../workerErrors';
import {
  comfyEndpoint,
  readComfyJson,
  requestComfyJson,
  resolveComfyRuntime,
  validateComfyWorkflow,
} from './comfyRuntime';

type ReadTemplateFile = (filePath: string) => string;

export interface CreateComfyExecutorOptions {
  fetch?: ExternalProviderFetch;
  env?: Record<string, string | undefined>;
  readFile?: ReadTemplateFile;
  files?: ExternalProviderFileDependencies;
  sleep?: ProviderSleep;
  maxAttempts?: number;
  retryDelayMs?: number;
  pollIntervalMs?: number;
  now?: () => number;
}

interface ComfyImageRef {
  filename: string;
  subfolder?: string;
  type?: string;
}

function resolveWorkflowTemplatePath(env: Record<string, string | undefined>) {
  return env.COMFY_WORKFLOW_TEMPLATE_PATH?.trim() || null;
}

function replaceTemplateValue(value: unknown, replacements: Record<string, string>): unknown {
  if (typeof value === 'string') {
    return Object.entries(replacements).reduce(
      (result, [key, replacement]) => result.replaceAll(`{{${key}}}`, replacement),
      value,
    );
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceTemplateValue(item, replacements));
  }
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, replaceTemplateValue(item, replacements)]),
    );
  }
  return value;
}

function parseWorkflowTemplate({
  filePath,
  readFile,
  prompt,
  negativePrompt,
}: {
  filePath: string;
  readFile: ReadTemplateFile;
  prompt: string;
  negativePrompt: string | null;
}) {
  const parsed = JSON.parse(readFile(filePath)) as unknown;
  return replaceTemplateValue(parsed, {
    prompt,
    negativePrompt: negativePrompt ?? '',
  });
}

function getPromptId(responseJson: unknown) {
  if (!isRecord(responseJson) || typeof responseJson.prompt_id !== 'string') {
    return null;
  }
  return responseJson.prompt_id;
}

function findFirstComfyImageRef(historyJson: unknown, promptId: string): ComfyImageRef | null {
  if (!isRecord(historyJson)) return null;
  const promptHistory = isRecord(historyJson[promptId]) ? historyJson[promptId] : historyJson;
  const outputs = isRecord(promptHistory.outputs) ? promptHistory.outputs : null;
  if (!outputs) return null;

  for (const output of Object.values(outputs)) {
    if (!isRecord(output) || !Array.isArray(output.images)) continue;
    let image: Record<string, unknown> | undefined;
    for (const candidate of output.images) {
      if (isRecord(candidate)) {
        image = candidate;
        break;
      }
    }
    if (!image || typeof image.filename !== 'string') continue;
    return {
      filename: image.filename,
      ...(typeof image.subfolder === 'string' && image.subfolder
        ? { subfolder: image.subfolder }
        : {}),
      ...(typeof image.type === 'string' && image.type ? { type: image.type } : {}),
    };
  }

  return null;
}

function createComfyViewUrl(baseUrl: string, image: ComfyImageRef) {
  const url = new URL(comfyEndpoint(baseUrl, 'view'));
  url.searchParams.set('filename', image.filename);
  if (image.subfolder) url.searchParams.set('subfolder', image.subfolder);
  if (image.type) url.searchParams.set('type', image.type);
  return url.toString();
}

export function createComfyWorkflowExecutor({
  fetch = globalThis.fetch as ExternalProviderFetch,
  env = process.env,
  readFile = (filePath: string) => readFileSync(filePath, 'utf8'),
  files = {
    resolveLibraryPath,
    mkdir: mkdirSync,
    writeFile: writeFileSync,
    now: () => Date.now(),
  },
  sleep = (durationMs) => Effect.sleep(durationMs),
  maxAttempts = 3,
  retryDelayMs = 250,
  pollIntervalMs = 1000,
  now = () => Date.now(),
}: CreateComfyExecutorOptions = {}): ExternalProviderExecutor {
  return ({ job, compiledInput }) =>
    providerOperation(
      Effect.gen(function* () {
        if (
          compiledInput.providerId !== 'comfy' ||
          compiledInput.payloadKind !== 'comfy_workflow'
        ) {
          throw new Error(
            `Comfy executor received unsupported payload: ${compiledInput.payloadKind}.`,
          );
        }

        const comfyInput = compiledInput as ComfyWorkflowCompiledInput;
        let runtime: ReturnType<typeof resolveComfyRuntime>;
        try {
          runtime = resolveComfyRuntime(env);
        } catch (error) {
          if (job.remoteExecution)
            throw new ProviderExecutionUncertainError(
              'Restore the original Comfy runtime configuration to resume this job.',
            );
          throw error;
        }
        const apiBase = runtime.base;
        const templatePath = resolveWorkflowTemplatePath(env);
        if (job.remoteExecution && job.remoteExecution.providerId !== 'comfy') {
          throw new ProviderExecutionUncertainError(
            'This job checkpoint belongs to another provider. Review it before continuing.',
          );
        }
        let checkpoint: ComfyRemoteExecution | null = job.remoteExecution ?? null;
        if (checkpoint && checkpoint.runtimeIdentity !== runtime.identity) {
          throw new ProviderExecutionUncertainError(
            'This Comfy job belongs to a different runtime. Restore its original runtime configuration, then resume.',
          );
        }
        if (!checkpoint && !templatePath)
          throw new Error('Comfy executor missing COMFY_WORKFLOW_TEMPLATE_PATH.');
        if (!job.checkpointRemoteExecution)
          throw new Error('Comfy execution requires durable checkpoint storage.');
        const save = (value: ComfyRemoteExecution) => {
          try {
            job.checkpointRemoteExecution!(value);
          } catch (error) {
            if (checkpoint)
              throw new ProviderExecutionUncertainError(
                'Could not persist the Comfy result. Resume its existing remote ID to reconcile.',
              );
            throw error;
          }
          checkpoint = value;
        };
        if (!checkpoint) {
          const workflow = parseWorkflowTemplate({
            filePath: templatePath!,
            readFile,
            prompt: comfyInput.payload.prompt,
            negativePrompt: comfyInput.payload.negativePrompt,
          });
          Result.getOrThrowWith(
            yield* Effect.result(validateComfyWorkflow(workflow, apiBase, fetch, job.signal)),
            (error) => error,
          );
          if (job.signal?.aborted) throw createAbortWorkerError();
          save({
            providerId: 'comfy',
            runtimeIdentity: runtime.identity,
            promptId: randomUUID(),
            phase: 'submitting',
            startedAt: now(),
          });
          const submission = checkpoint! as ComfyRemoteExecution;
          let definitivelyRejected = false;
          try {
            // Never retry a POST whose acceptance is unknown. The local ID is durable
            // even when the acknowledgement is lost or Studio stops after submission.
            const response = Result.getOrThrowWith(
              yield* Effect.result(
                requestComfyJson(
                  fetch,
                  comfyEndpoint(apiBase, 'prompt'),
                  {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                      prompt: workflow,
                      client_id: job.id,
                      prompt_id: submission.promptId,
                    }),
                    signal: job.signal,
                  },
                  30_000,
                ),
              ),
              (error) => error,
            );
            if (!response.ok) {
              if (response.status === 400 || response.status === 422) {
                definitivelyRejected = true;
                save({ ...submission, phase: 'failed' });
                throw new Error(`Comfy rejected the workflow (HTTP ${response.status}).`);
              }
              throw new ProviderExecutionUncertainError(
                `Comfy submission has no confirmed result (HTTP ${response.status}). Resume to reconcile its ID.`,
              );
            }
            const promptId = getPromptId(response.body);
            if (!promptId)
              throw new ProviderExecutionUncertainError(
                'Comfy did not confirm a prompt ID. Resume to reconcile the stored ID.',
              );
            save({ ...submission, promptId, phase: 'accepted' });
          } catch (error) {
            if (definitivelyRejected) throw error;
            throw new ProviderExecutionUncertainError(
              'Comfy may have accepted the workflow. Resume its stored remote ID; do not submit it again.',
            );
          }
        }

        const remote = checkpoint as ComfyRemoteExecution;
        const promptId = remote.promptId;
        const startedAt = remote.startedAt;
        const requestAttempts = 1;
        let historyJson: unknown;
        let image: ComfyImageRef | null = null;
        let lastRemoteStatus: string | null = null;
        const cancelRemote = providerOperation(
          Effect.gen(function* () {
            const response = yield* requestComfyJson(
              fetch,
              comfyEndpoint(apiBase, `jobs/${encodeURIComponent(promptId)}/cancel`),
              { method: 'POST' },
            );
            if (!response.ok || !isRecord(response.body) || response.body.cancelled !== true)
              throw new Error('Cancellation not confirmed');
            const confirmed = yield* providerOperation(
              Effect.gen(function* () {
                const status = yield* requestComfyJson(
                  fetch,
                  comfyEndpoint(apiBase, `jobs/${encodeURIComponent(promptId)}`),
                );
                if (status.status === 404 && lastRemoteStatus === 'pending') return true;
                if (!status.ok) throw new Error('Cancellation not confirmed');
                const state = status.body;
                if (isRecord(state) && state.status === 'cancelled') return true;
                if (isRecord(state) && ['completed', 'failed'].includes(String(state.status)))
                  throw new Error('Cancellation not confirmed');
                yield* sleep(pollIntervalMs);
                return false;
              }),
            ).pipe(Effect.repeat({ times: 4, while: (confirmed) => !confirmed }));
            if (!confirmed) throw new Error('Cancellation not confirmed');
            save({ ...remote, phase: 'cancelled' });
          }),
        ).pipe(
          Effect.mapError(
            () =>
              new ProviderExecutionUncertainError(
                'Comfy cancellation was not confirmed. Resume and inspect this job; other remote work was not interrupted.',
              ),
          ),
        );
        return yield* Effect.uninterruptibleMask((restore) =>
          Effect.gen(function* () {
            const exit = yield* Effect.exit(
              restore(
                providerOperation(
                  Effect.gen(function* () {
                    try {
                      while (!image) {
                        if (job.signal?.aborted) throw createAbortWorkerError();
                        historyJson = yield* Effect.suspend(() => {
                          let failedReads = 0;
                          return readComfyJson(
                            fetch,
                            comfyEndpoint(apiBase, `jobs/${encodeURIComponent(promptId)}`),
                            job.signal,
                          ).pipe(
                            Effect.retry({
                              while: () => {
                                if (job.signal?.aborted || ++failedReads >= 5)
                                  return Effect.succeed(false);
                                return sleep(
                                  Math.min(pollIntervalMs * 2 ** failedReads, 10_000),
                                ).pipe(Effect.as(true));
                              },
                            }),
                            Effect.mapError((error) =>
                              job.signal?.aborted
                                ? error
                                : new ProviderExecutionUncertainError(
                                    'Comfy job status is unavailable. Restore the runtime and resume the stored remote ID.',
                                  ),
                            ),
                          );
                        });
                        if (!isRecord(historyJson) || typeof historyJson.status !== 'string') {
                          throw new ProviderExecutionUncertainError(
                            'Comfy returned an unrecognized job status. Inspect its runtime before resuming.',
                          );
                        }
                        lastRemoteStatus = historyJson.status;
                        if (historyJson.status === 'failed' || historyJson.status === 'cancelled') {
                          save({ ...remote, phase: historyJson.status });
                          if (historyJson.status === 'cancelled') throw createAbortWorkerError();
                          throw new Error(
                            'Comfy workflow failed. Inspect its node error in the provider runtime.',
                          );
                        }
                        if (historyJson.status === 'completed') {
                          save({ ...remote, phase: 'completed' });
                          image = findFirstComfyImageRef(historyJson, promptId);
                          if (!image)
                            throw new ProviderExecutionUncertainError(
                              'Comfy completed without a usable image. Inspect the provider output.',
                            );
                        } else if (!['pending', 'in_progress'].includes(historyJson.status)) {
                          throw new ProviderExecutionUncertainError(
                            'Comfy returned an unknown execution state.',
                          );
                        }
                        if (!image) {
                          if (checkpoint?.phase === 'submitting')
                            save({ ...remote, phase: 'accepted' });
                          Result.getOrThrowWith(
                            yield* Effect.result(sleep(pollIntervalMs)),
                            (error) => error,
                          );
                        }
                      }
                    } catch (error) {
                      if (job.signal?.aborted) throw createAbortWorkerError();
                      throw error;
                    }

                    try {
                      return Result.getOrThrowWith(
                        yield* Effect.result(
                          storeHostedImageResult({
                            providerId: 'comfy',
                            providerSlug: 'comfy',
                            model: comfyInput.payload.model ?? DEFAULT_COMFY_MODEL,
                            endpointBase: apiBase,
                            job,
                            compiledInput,
                            responseJson: historyJson,
                            imageUrl: createComfyViewUrl(apiBase, image),
                            requestAttempts,
                            startedAt,
                            diagnostics: {
                              workflowPreset: comfyInput.payload.workflowPreset,
                              assetCount: comfyInput.payload.assets.length,
                              requestFieldNames: ['prompt', 'client_id'],
                            },
                            fetch,
                            files,
                            fileTimestamp: startedAt,
                            maxAttempts,
                            retryDelayMs,
                            sleep,
                          }),
                        ),
                        (error) => error,
                      );
                    } catch {
                      throw new ProviderExecutionUncertainError(
                        'Comfy completed, but its output could not be imported. Resume to import the existing result.',
                      );
                    }
                  }),
                ),
              ),
            );
            if (
              Exit.isFailure(exit) &&
              job.signal?.aborted &&
              job.signal.reason !== 'studio_shutdown' &&
              checkpoint?.phase !== 'cancelled' &&
              checkpoint?.phase !== 'completed'
            ) {
              yield* Effect.scoped(cancelRemote);
            }
            return yield* exit;
          }),
        );
      }),
    );
}
