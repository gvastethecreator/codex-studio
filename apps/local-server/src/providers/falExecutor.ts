import { mkdirSync, writeFileSync } from 'node:fs';
import type { GenerationTaskKind } from '../../../../packages/shared/src';
import type { TurnResult } from '../codex/turn';
import { resolveLibraryPath } from '../library';
import type {
  ExternalProviderExecutionContext,
  ExternalProviderExecutor,
} from './externalProvider';
import { createFalAssetRequestFields, type FalAssetUploadLocalFile } from './falAssetInputs';
import type { HostedImageApiCompiledPayload } from './externalProviderInputs';
import {
  fetchExternalProviderWithRetry,
  findFirstHostedImageUrl,
  isRecord,
  responseSnippet,
  storeHostedImageResult,
  type ExternalProviderFetch,
} from './externalProviderResults';
import { createFalLocalAssetUploader } from './falStorageUpload';

export interface FalImageExecutorDependencies {
  env?: Record<string, string | undefined>;
  fetch?: ExternalProviderFetch;
  resolveLibraryPath?: typeof resolveLibraryPath;
  mkdir?: typeof mkdirSync;
  writeFile?: typeof writeFileSync;
  now?: () => number;
  sleep?: (durationMs: number) => Promise<unknown>;
  maxAttempts?: number;
  retryDelayMs?: number;
  uploadLocalAsset?: FalAssetUploadLocalFile;
}

const DEFAULT_FAL_MODEL = 'fal-ai/flux/schnell';
const DEFAULT_FAL_API_BASE = 'https://fal.run';
const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 750;

function asFalPayload(value: unknown): HostedImageApiCompiledPayload {
  if (!isRecord(value) || value.apiFamily !== 'fal_image' || typeof value.prompt !== 'string') {
    throw new Error('Compiled fal.ai Provider Input payload is invalid.');
  }

  return value as unknown as HostedImageApiCompiledPayload;
}

function firstConfiguredEnv(
  env: Record<string, string | undefined>,
  names: readonly string[],
): string | null {
  for (const name of names) {
    const value = env[name]?.trim();
    if (value) return value;
  }
  return null;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

async function createFalRequestBody(
  payload: HostedImageApiCompiledPayload,
  dependencies: { uploadLocalAsset?: FalAssetUploadLocalFile } = {},
) {
  const body: Record<string, unknown> = {
    prompt: payload.prompt,
  };

  if (payload.negativePrompt) body.negative_prompt = payload.negativePrompt;
  if (payload.output.imageSize) body.image_size = payload.output.imageSize;
  if (payload.output.count > 1) body.num_images = payload.output.count;

  return {
    ...body,
    ...(await createFalAssetRequestFields(payload.assets, dependencies)),
  };
}

function assertFalRequestBodySupportsTask(
  task: GenerationTaskKind,
  requestBody: Record<string, unknown>,
) {
  if (task === 'image_edit' && typeof requestBody.image_url !== 'string') {
    throw new Error('fal.ai image_edit task requires an input or external_output asset.');
  }
}

function createFalTranscriptDiagnostics(
  payload: HostedImageApiCompiledPayload,
  requestBody: Record<string, unknown>,
) {
  return {
    assetCount: payload.assets.length,
    assetRoles: payload.assets.map((asset) => asset.role).sort(),
    requestFieldNames: Object.keys(requestBody).sort(),
    usesInputImage: typeof requestBody.image_url === 'string',
    usesMask: typeof requestBody.mask_url === 'string',
    referenceImageCount: Array.isArray(requestBody.reference_image_urls)
      ? requestBody.reference_image_urls.length
      : 0,
  };
}

export function createFalImageExecutor({
  env = process.env,
  fetch: fetchFn = fetch,
  resolveLibraryPath: resolveLibrary = resolveLibraryPath,
  mkdir = mkdirSync,
  writeFile = writeFileSync,
  now = () => Date.now(),
  sleep = (durationMs) => Bun.sleep(durationMs),
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  retryDelayMs = DEFAULT_RETRY_DELAY_MS,
  uploadLocalAsset,
}: FalImageExecutorDependencies = {}): ExternalProviderExecutor {
  return async function executeFalImageJob({
    providerId,
    job,
    compiledInput,
  }: ExternalProviderExecutionContext): Promise<TurnResult> {
    if (providerId !== 'fal' || compiledInput.providerId !== 'fal') {
      throw new Error(`Fal executor received provider "${providerId}".`);
    }
    if (compiledInput.payloadKind !== 'api_request') {
      throw new Error(`Fal executor cannot run payload "${compiledInput.payloadKind}".`);
    }

    const startedAt = now();
    const payload = asFalPayload(compiledInput.payload);
    const apiKey = firstConfiguredEnv(env, ['FAL_KEY', 'FAL_API_KEY']);
    if (!apiKey) {
      throw new Error('Missing Provider Secret source: FAL_KEY or FAL_API_KEY.');
    }
    const model = payload.model?.trim() || env.FAL_MODEL?.trim() || DEFAULT_FAL_MODEL;
    const apiBase = trimTrailingSlash(env.FAL_API_BASE?.trim() || DEFAULT_FAL_API_BASE);
    const endpoint = `${apiBase}/${model.replace(/^\/+/, '')}`;
    const requestBody = await createFalRequestBody(payload, {
      uploadLocalAsset: uploadLocalAsset ?? createFalLocalAssetUploader({ apiKey }),
    });
    assertFalRequestBodySupportsTask(compiledInput.task, requestBody);
    const { response, attempts: requestAttempts } = await fetchExternalProviderWithRetry({
      label: 'fal.ai request',
      fetch: fetchFn,
      input: endpoint,
      init: {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Key ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: job.signal,
      },
      maxAttempts,
      retryDelayMs,
      sleep,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(
        `fal.ai request failed after ${requestAttempts} attempt(s): ${response.status} ${response.statusText}${body ? ` ${responseSnippet(body, [apiKey])}` : ''}`,
      );
    }

    const json = await response.json();
    const imageUrl = findFirstHostedImageUrl(json);
    if (!imageUrl) {
      throw new Error('fal.ai response did not include an image URL.');
    }

    return storeHostedImageResult({
      providerId: 'fal',
      providerSlug: 'fal',
      model,
      endpointBase: apiBase,
      job,
      compiledInput,
      responseJson: json,
      imageUrl,
      requestAttempts,
      startedAt,
      diagnostics: createFalTranscriptDiagnostics(payload, requestBody),
      fetch: fetchFn,
      files: {
        resolveLibraryPath: resolveLibrary,
        mkdir,
        writeFile,
        now,
      },
      maxAttempts,
      retryDelayMs,
      sleep,
    });
  };
}
