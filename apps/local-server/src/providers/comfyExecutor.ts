import { readFileSync } from 'node:fs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import type { ComfyRemoteExecution } from '../../../../packages/shared/src';
import { resolveLibraryPath } from '../library';
import type { TurnResult } from '../codex/turn';
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
  resolveComfyRuntime,
  validateComfyWorkflow,
} from './comfyRuntime';

type ReadTemplateFile = (filePath: string) => string;

export interface CreateComfyExecutorOptions {
  fetch?: ExternalProviderFetch;
  env?: Record<string, string | undefined>;
  readFile?: ReadTemplateFile;
  files?: ExternalProviderFileDependencies;
  sleep?: (durationMs: number, signal?: AbortSignal) => Promise<unknown>;
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
  sleep = (durationMs, signal) => delay(durationMs, undefined, { signal }),
  maxAttempts = 3,
  retryDelayMs = 250,
  pollIntervalMs = 1000,
  now = () => Date.now(),
}: CreateComfyExecutorOptions = {}): ExternalProviderExecutor {
  return async ({ job, compiledInput }): Promise<TurnResult> => {
    if (compiledInput.providerId !== 'comfy' || compiledInput.payloadKind !== 'comfy_workflow') {
      throw new Error(`Comfy executor received unsupported payload: ${compiledInput.payloadKind}.`);
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
      await validateComfyWorkflow(workflow, apiBase, fetch, job.signal);
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
        const response = await fetch(comfyEndpoint(apiBase, 'prompt'), {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            prompt: workflow,
            client_id: job.id,
            prompt_id: submission.promptId,
          }),
          signal: job.signal
            ? AbortSignal.any([job.signal, AbortSignal.timeout(30_000)])
            : AbortSignal.timeout(30_000),
        });
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
        const promptId = getPromptId(await response.json());
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
    let failedReads = 0;
    let lastRemoteStatus: string | null = null;
    try {
      while (!image) {
        if (job.signal?.aborted) throw createAbortWorkerError();
        try {
          historyJson = await readComfyJson(
            fetch,
            comfyEndpoint(apiBase, `jobs/${encodeURIComponent(promptId)}`),
            job.signal,
          );
          failedReads = 0;
        } catch (error) {
          if (job.signal?.aborted) throw error;
          if (++failedReads >= 5)
            throw new ProviderExecutionUncertainError(
              'Comfy job status is unavailable. Restore the runtime and resume the stored remote ID.',
            );
          await sleep(Math.min(pollIntervalMs * 2 ** failedReads, 10_000), job.signal);
          continue;
        }
        if (!isRecord(historyJson) || typeof historyJson.status !== 'string') {
          throw new ProviderExecutionUncertainError(
            'Comfy returned an unrecognized job status. Inspect its runtime before resuming.',
          );
        }
        lastRemoteStatus = historyJson.status;
        if (historyJson.status === 'failed' || historyJson.status === 'cancelled') {
          save({ ...remote, phase: historyJson.status });
          if (historyJson.status === 'cancelled') throw createAbortWorkerError();
          throw new Error('Comfy workflow failed. Inspect its node error in the provider runtime.');
        }
        if (historyJson.status === 'completed') {
          save({ ...remote, phase: 'completed' });
          image = findFirstComfyImageRef(historyJson, promptId);
          if (!image)
            throw new ProviderExecutionUncertainError(
              'Comfy completed without a usable image. Inspect the provider output.',
            );
        } else if (!['pending', 'in_progress'].includes(historyJson.status)) {
          throw new ProviderExecutionUncertainError('Comfy returned an unknown execution state.');
        }
        if (!image) {
          if (checkpoint?.phase === 'submitting') save({ ...remote, phase: 'accepted' });
          await sleep(pollIntervalMs, job.signal);
        }
      }
    } catch (error) {
      if (!job.signal?.aborted) throw error;
      if (job.signal.reason === 'studio_shutdown') throw createAbortWorkerError();
      try {
        const response = await fetch(
          comfyEndpoint(apiBase, `jobs/${encodeURIComponent(promptId)}/cancel`),
          {
            method: 'POST',
            signal: AbortSignal.timeout(10_000),
          },
        );
        const result = await response.json();
        if (!response.ok || !isRecord(result) || result.cancelled !== true)
          throw new Error('Cancellation not confirmed');
        let confirmed = false;
        for (let attempt = 0; attempt < 5; attempt += 1) {
          const status = await fetch(
            comfyEndpoint(apiBase, `jobs/${encodeURIComponent(promptId)}`),
            { signal: AbortSignal.timeout(10_000) },
          );
          if (status.status === 404 && lastRemoteStatus === 'pending') {
            confirmed = true;
            break;
          }
          if (!status.ok) break;
          const state = await status.json();
          if (isRecord(state) && state.status === 'cancelled') {
            confirmed = true;
            break;
          }
          if (isRecord(state) && ['completed', 'failed'].includes(String(state.status))) break;
          await sleep(pollIntervalMs);
        }
        if (!confirmed) throw new Error('Cancellation not confirmed');
        save({ ...remote, phase: 'cancelled' });
      } catch {
        throw new ProviderExecutionUncertainError(
          'Comfy cancellation was not confirmed. Resume and inspect this job; other remote work was not interrupted.',
        );
      }
      throw createAbortWorkerError();
    }

    try {
      return await storeHostedImageResult({
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
      });
    } catch {
      throw new ProviderExecutionUncertainError(
        'Comfy completed, but its output could not be imported. Resume to import the existing result.',
      );
    }
  };
}
