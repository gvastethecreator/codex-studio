import { readFileSync } from 'node:fs';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { resolveLibraryPath } from '../library';
import type { TurnResult } from '../codex/turn';
import type { ExternalProviderExecutor } from './externalProvider';
import type { ComfyWorkflowCompiledInput } from './externalProviderInputs';
import {
  fetchExternalProviderWithRetry,
  isRecord,
  storeHostedImageResult,
  type ExternalProviderFetch,
  type ExternalProviderFileDependencies,
} from './externalProviderResults';

type ReadTemplateFile = (filePath: string) => string;

export interface CreateComfyExecutorOptions {
  fetch?: ExternalProviderFetch;
  env?: Record<string, string | undefined>;
  readFile?: ReadTemplateFile;
  files?: ExternalProviderFileDependencies;
  sleep?: (durationMs: number) => Promise<unknown>;
  maxAttempts?: number;
  retryDelayMs?: number;
  maxPollAttempts?: number;
  pollIntervalMs?: number;
  now?: () => number;
}

interface ComfyImageRef {
  filename: string;
  subfolder?: string;
  type?: string;
}

const DEFAULT_COMFY_MODEL = 'workflow-template';

function resolveComfyApiBase(env: Record<string, string | undefined>) {
  return env.COMFY_API_URL?.trim() || env.COMFYUI_API_URL?.trim() || null;
}

function resolveWorkflowTemplatePath(env: Record<string, string | undefined>) {
  return env.COMFY_WORKFLOW_TEMPLATE_PATH?.trim() || null;
}

function endpoint(baseUrl: string, pathname: string) {
  return new URL(pathname, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString();
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
    const image = output.images.find(isRecord);
    if (!image || typeof image.filename !== 'string') continue;
    return {
      filename: image.filename,
      ...(typeof image.subfolder === 'string' && image.subfolder ? { subfolder: image.subfolder } : {}),
      ...(typeof image.type === 'string' && image.type ? { type: image.type } : {}),
    };
  }

  return null;
}

function createComfyViewUrl(baseUrl: string, image: ComfyImageRef) {
  const url = new URL(endpoint(baseUrl, '/view'));
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
  sleep = (durationMs) => new Promise((resolve) => setTimeout(resolve, durationMs)),
  maxAttempts = 3,
  retryDelayMs = 250,
  maxPollAttempts = 30,
  pollIntervalMs = 1000,
  now = () => Date.now(),
}: CreateComfyExecutorOptions = {}): ExternalProviderExecutor {
  return async ({ job, compiledInput }): Promise<TurnResult> => {
    if (compiledInput.providerId !== 'comfy' || compiledInput.payloadKind !== 'comfy_workflow') {
      throw new Error(`Comfy executor received unsupported payload: ${compiledInput.payloadKind}.`);
    }

    const comfyInput = compiledInput as ComfyWorkflowCompiledInput;
    const apiBase = resolveComfyApiBase(env);
    const templatePath = resolveWorkflowTemplatePath(env);
    if (!apiBase) throw new Error('Comfy executor missing COMFY_API_URL or COMFYUI_API_URL.');
    if (!templatePath) throw new Error('Comfy executor missing COMFY_WORKFLOW_TEMPLATE_PATH.');

    const startedAt = now();
    const workflow = parseWorkflowTemplate({
      filePath: templatePath,
      readFile,
      prompt: comfyInput.payload.prompt,
      negativePrompt: comfyInput.payload.negativePrompt,
    });

    const { response: promptResponse, attempts: requestAttempts } =
      await fetchExternalProviderWithRetry({
        label: 'comfy prompt',
        fetch,
        input: endpoint(apiBase, '/prompt'),
        init: {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ prompt: workflow, client_id: job.id }),
          signal: job.signal,
        },
        maxAttempts,
        retryDelayMs,
        sleep,
      });

    const promptJson = await promptResponse.json();
    if (!promptResponse.ok) {
      throw new Error(`Comfy prompt failed: ${promptResponse.status} ${promptResponse.statusText}`);
    }

    const promptId = getPromptId(promptJson);
    if (!promptId) {
      throw new Error('Comfy prompt response did not include prompt_id.');
    }

    let historyJson: unknown = null;
    let image: ComfyImageRef | null = null;
    for (let attempt = 1; attempt <= maxPollAttempts; attempt += 1) {
      const historyResponse = await fetch(endpoint(apiBase, `/history/${promptId}`), {
        signal: job.signal,
      });
      historyJson = await historyResponse.json();
      if (!historyResponse.ok) {
        throw new Error(
          `Comfy history failed: ${historyResponse.status} ${historyResponse.statusText}`,
        );
      }
      image = findFirstComfyImageRef(historyJson, promptId);
      if (image) break;
      await sleep(pollIntervalMs);
    }

    if (!image) {
      throw new Error(`Comfy prompt ${promptId} produced no image after polling.`);
    }

    return storeHostedImageResult({
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
      maxAttempts,
      retryDelayMs,
      sleep,
    });
  };
}
