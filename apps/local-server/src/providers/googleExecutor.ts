import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname } from 'node:path';
import type { GenerationTaskKind } from '../../../../packages/shared/src';
import type { TurnResult } from '../codex/turn';
import { resolveLibraryPath } from '../library';
import type {
  ExternalProviderExecutionContext,
  ExternalProviderExecutor,
} from './externalProvider';
import type {
  HostedImageApiCompiledPayload,
  ProviderAssetInputRef,
} from './externalProviderInputs';
import {
  fetchExternalProviderWithRetry,
  findFirstInlineImageData,
  isRecord,
  responseSnippet,
  storeInlineImageResult,
  type ExternalProviderFetch,
} from './externalProviderResults';

type ReadLocalFile = (path: string) => Uint8Array;

export interface GoogleImageExecutorDependencies {
  env?: Record<string, string | undefined>;
  fetch?: ExternalProviderFetch;
  resolveLibraryPath?: typeof resolveLibraryPath;
  mkdir?: typeof mkdirSync;
  writeFile?: typeof writeFileSync;
  readFile?: ReadLocalFile;
  now?: () => number;
  sleep?: (durationMs: number) => Promise<unknown>;
  maxAttempts?: number;
  retryDelayMs?: number;
}

const DEFAULT_GOOGLE_MODEL = 'gemini-2.5-flash-image';
const DEFAULT_GOOGLE_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 750;

const MIME_BY_EXTENSION: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function asGooglePayload(value: unknown): HostedImageApiCompiledPayload {
  if (!isRecord(value) || value.apiFamily !== 'google_image' || typeof value.prompt !== 'string') {
    throw new Error('Compiled Google Provider Input payload is invalid.');
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

function inferMimeType(filePath: string) {
  return MIME_BY_EXTENSION[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
}

function createGooglePromptText(payload: HostedImageApiCompiledPayload) {
  return payload.negativePrompt
    ? `${payload.prompt}\n\nAvoid: ${payload.negativePrompt}`
    : payload.prompt;
}

function createGoogleAssetPart(asset: ProviderAssetInputRef, readFile: ReadLocalFile) {
  if (asset.sourceUrl) {
    throw new Error(
      `Google image asset "${asset.name}" must be imported as a localPath asset before execution.`,
    );
  }

  if (asset.hasInlineData && !asset.localPath) {
    throw new Error(
      `Google inline asset "${asset.name}" is not available in the compact Provider Input; import it as a localPath asset before execution.`,
    );
  }

  if (!asset.localPath) return null;

  return {
    inlineData: {
      mimeType: inferMimeType(asset.localPath),
      data: Buffer.from(readFile(asset.localPath)).toString('base64'),
    },
  };
}

function assertGoogleRequestBodySupportsTask(
  task: GenerationTaskKind,
  payload: HostedImageApiCompiledPayload,
) {
  if (
    task === 'image_edit' &&
    !payload.assets.some((asset) => asset.role === 'input' || asset.role === 'external_output')
  ) {
    throw new Error('Google image_edit task requires an input or external_output asset.');
  }
}

function createGoogleTranscriptDiagnostics(
  payload: HostedImageApiCompiledPayload,
  requestBody: Record<string, unknown>,
) {
  const parts =
    (requestBody.contents as Array<{ parts?: unknown[] }> | undefined)?.[0]?.parts ?? [];
  return {
    assetCount: payload.assets.length,
    assetRoles: payload.assets.map((asset) => asset.role).sort(),
    inlineImagePartCount: parts.filter((part) => isRecord(part) && isRecord(part.inlineData))
      .length,
    requestFieldNames: Object.keys(requestBody).sort(),
  };
}

function createGoogleRequestBody(
  payload: HostedImageApiCompiledPayload,
  task: GenerationTaskKind,
  readFile: ReadLocalFile,
) {
  assertGoogleRequestBodySupportsTask(task, payload);

  const assetParts = payload.assets.map((asset) => ({
    part: createGoogleAssetPart(asset, readFile),
    role: asset.role,
    strength: asset.strength,
  }));

  const inlineParts = assetParts
    .filter((entry): entry is { part: { inlineData: { mimeType: string; data: string } }; role: ProviderAssetInputRef['role']; strength: number | null } => entry.part !== null)
    .sort((a, b) => {
      const order: Record<string, number> = { input: 0, external_output: 0, mask: 1, control: 2, reference: 3 };
      return (order[a.role] ?? 4) - (order[b.role] ?? 4);
    })
    .map((entry) => entry.part);

  const editInstruction = task === 'image_edit'
    ? ' Edit the input image following the instructions above. Preserve the original composition, subject identity, and overall structure while applying the requested changes.'
    : '';

  const promptText = createGooglePromptText(payload) + editInstruction;
  const promptPart = { text: promptText };
  const parts = task === 'image_edit' ? [...inlineParts, promptPart] : [promptPart, ...inlineParts];

  return {
    contents: [
      {
        role: 'user',
        parts,
      },
    ],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  };
}

export function createGoogleImageExecutor({
  env = process.env,
  fetch: fetchFn = fetch,
  resolveLibraryPath: resolveLibrary = resolveLibraryPath,
  mkdir = mkdirSync,
  writeFile = writeFileSync,
  readFile = readFileSync,
  now = () => Date.now(),
  sleep = (durationMs) => Bun.sleep(durationMs),
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  retryDelayMs = DEFAULT_RETRY_DELAY_MS,
}: GoogleImageExecutorDependencies = {}): ExternalProviderExecutor {
  return async function executeGoogleImageJob({
    providerId,
    job,
    compiledInput,
  }: ExternalProviderExecutionContext): Promise<TurnResult> {
    if (providerId !== 'google' || compiledInput.providerId !== 'google') {
      throw new Error(`Google executor received provider "${providerId}".`);
    }
    if (compiledInput.payloadKind !== 'api_request') {
      throw new Error(`Google executor cannot run payload "${compiledInput.payloadKind}".`);
    }

    const startedAt = now();
    const payload = asGooglePayload(compiledInput.payload);
    const apiKey = firstConfiguredEnv(env, [
      'GOOGLE_API_KEY',
      'GEMINI_API_KEY',
      'NANO_BANANA_API_KEY',
    ]);
    if (!apiKey) {
      throw new Error(
        'Missing Provider Secret source: GOOGLE_API_KEY, GEMINI_API_KEY, or NANO_BANANA_API_KEY.',
      );
    }
    const model =
      payload.model?.trim() ||
      env.GOOGLE_IMAGE_MODEL?.trim() ||
      env.GEMINI_IMAGE_MODEL?.trim() ||
      DEFAULT_GOOGLE_MODEL;
    const apiBase = trimTrailingSlash(env.GOOGLE_API_BASE?.trim() || DEFAULT_GOOGLE_API_BASE);
    const endpoint = `${apiBase}/models/${model.replace(/^\/+/, '')}:generateContent`;
    const requestBody = createGoogleRequestBody(payload, compiledInput.task, readFile);
    const { response, attempts: requestAttempts } = await fetchExternalProviderWithRetry({
      label: 'Google image request',
      fetch: fetchFn,
      input: endpoint,
      init: {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
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
        `Google image request failed after ${requestAttempts} attempt(s): ${response.status} ${response.statusText}${body ? ` ${responseSnippet(body, [apiKey])}` : ''}`,
      );
    }

    const json = await response.json();
    const image = findFirstInlineImageData(json);
    if (!image) {
      throw new Error('Google image response did not include inline image data.');
    }

    return storeInlineImageResult({
      providerId: 'google',
      providerSlug: 'google',
      model,
      endpointBase: apiBase,
      job,
      compiledInput,
      responseJson: json,
      image,
      requestAttempts,
      startedAt,
      diagnostics: createGoogleTranscriptDiagnostics(payload, requestBody),
      files: {
        resolveLibraryPath: resolveLibrary,
        mkdir,
        writeFile,
        now,
      },
    });
  };
}
