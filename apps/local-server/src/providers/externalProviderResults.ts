import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { Effect } from 'effect';
import type { CompiledProviderInput } from '../../../../packages/shared/src';
import type { TurnResult } from '../codex/turn';
import { resolveLibraryPath } from '../library';
import {
  getExternalProviderRetryDelayMs,
  isRetryableProviderStatus,
  normalizeExternalProviderRetryPolicy,
} from './externalProviderRetryPolicy';

export type ExternalProviderFetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<
  Pick<Response, 'ok' | 'status' | 'statusText' | 'headers' | 'json' | 'text' | 'arrayBuffer'>
>;

export interface ExternalProviderRetryOptions {
  maxAttempts: number;
  retryDelayMs: number;
  sleep: (durationMs: number) => Promise<unknown>;
}

export interface ExternalProviderFileDependencies {
  resolveLibraryPath: typeof resolveLibraryPath;
  mkdir: typeof mkdirSync;
  writeFile: typeof writeFileSync;
  now: () => number;
}

export interface StoreHostedImageResultInput extends ExternalProviderRetryOptions {
  providerId: string;
  providerSlug: string;
  model: string;
  endpointBase: string;
  job: { id: string; signal?: AbortSignal };
  compiledInput: Pick<CompiledProviderInput, 'sourceSpecId' | 'task'>;
  responseJson: unknown;
  imageUrl: string;
  requestAttempts: number;
  startedAt: number;
  diagnostics?: Record<string, unknown>;
  fetch: ExternalProviderFetch;
  files: ExternalProviderFileDependencies;
}

export interface InlineImageData {
  data: string;
  mimeType: string | null;
}

export interface StoreInlineImageResultInput {
  providerId: string;
  providerSlug: string;
  model: string;
  endpointBase: string;
  job: { id: string };
  compiledInput: Pick<CompiledProviderInput, 'sourceSpecId' | 'task'>;
  responseJson: unknown;
  image: InlineImageData;
  requestAttempts: number;
  startedAt: number;
  diagnostics?: Record<string, unknown>;
  files: ExternalProviderFileDependencies;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function redactSecrets(value: string, secrets: readonly string[]) {
  return secrets.reduce(
    (result, secret) => (secret ? result.replaceAll(secret, '[redacted]') : result),
    value,
  );
}

export function responseSnippet(value: string, secrets: readonly string[] = []) {
  return redactSecrets(value, secrets).replace(/\s+/g, ' ').trim().slice(0, 500);
}

function isRetryableStatus(status: number) {
  return isRetryableProviderStatus(status);
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError';
}

export async function fetchExternalProviderWithRetry({
  label,
  fetch,
  input,
  init,
  maxAttempts,
  retryDelayMs,
  sleep,
}: {
  label: string;
  fetch: ExternalProviderFetch;
  input: string | URL | Request;
  init?: RequestInit;
} & ExternalProviderRetryOptions) {
  const retryPolicy = normalizeExternalProviderRetryPolicy({
    maxAttempts,
    retryDelayMs,
  });

  const program = Effect.gen(function* () {
    let lastNetworkError: unknown = null;

    for (let attempt = 1; attempt <= retryPolicy.maxAttempts; attempt += 1) {
      const attemptResult = yield* Effect.tryPromise({
        try: () => fetch(input, init),
        catch: (error) => error,
      }).pipe(
        Effect.map((response) => ({ type: 'response' as const, response })),
        Effect.catchAll((error) => Effect.succeed({ type: 'error' as const, error })),
      );

      if (attemptResult.type === 'response') {
        if (
          attemptResult.response.ok ||
          !isRetryableStatus(attemptResult.response.status) ||
          attempt === retryPolicy.maxAttempts
        ) {
          return { response: attemptResult.response, attempts: attempt };
        }
      } else {
        if (isAbortError(attemptResult.error) || attempt === retryPolicy.maxAttempts) {
          return yield* Effect.fail(attemptResult.error);
        }
        lastNetworkError = attemptResult.error;
      }

      const delayMs = getExternalProviderRetryDelayMs(retryPolicy.retryDelayMs, attempt);
      yield* Effect.tryPromise({
        try: () => sleep(delayMs),
        catch: (error) =>
          error instanceof Error ? error : new Error(`${label} retry delay failed.`),
      });
    }

    return yield* Effect.fail(
      lastNetworkError instanceof Error
        ? lastNetworkError
        : new Error(`${label} failed without a response.`),
    );
  });

  return await Effect.runPromise(program);
}

export function findFirstHostedImageUrl(value: unknown): string | null {
  if (!isRecord(value)) return null;

  const images = Array.isArray(value.images) ? value.images : null;
  const firstImage = images?.find(isRecord);
  if (firstImage && typeof firstImage.url === 'string') return firstImage.url;

  if (isRecord(value.image) && typeof value.image.url === 'string') return value.image.url;
  if (isRecord(value.output)) return findFirstHostedImageUrl(value.output);
  if (isRecord(value.data)) return findFirstHostedImageUrl(value.data);

  return null;
}

export function findFirstInlineImageData(value: unknown): InlineImageData | null {
  if (!isRecord(value)) return null;

  const inlineData = isRecord(value.inlineData) ? value.inlineData : null;
  if (inlineData && typeof inlineData.data === 'string') {
    return {
      data: inlineData.data,
      mimeType: typeof inlineData.mimeType === 'string' ? inlineData.mimeType : null,
    };
  }

  const inlineDataSnake = isRecord(value.inline_data) ? value.inline_data : null;
  if (inlineDataSnake && typeof inlineDataSnake.data === 'string') {
    return {
      data: inlineDataSnake.data,
      mimeType: typeof inlineDataSnake.mime_type === 'string' ? inlineDataSnake.mime_type : null,
    };
  }

  const candidates = Array.isArray(value.candidates) ? value.candidates : [];
  for (const candidate of candidates) {
    if (!isRecord(candidate) || !isRecord(candidate.content)) continue;
    const parts = Array.isArray(candidate.content.parts) ? candidate.content.parts : [];
    for (const part of parts) {
      const image = findFirstInlineImageData(part);
      if (image) return image;
    }
  }

  const parts = Array.isArray(value.parts) ? value.parts : [];
  for (const part of parts) {
    const image = findFirstInlineImageData(part);
    if (image) return image;
  }

  return null;
}

function sanitizeFilePart(value: string) {
  return value.replace(/[^a-zA-Z0-9_.-]+/g, '-').slice(0, 80) || 'job';
}

function extensionFromMime(mimeType: string | null) {
  if (mimeType === 'image/jpeg') return '.jpg';
  if (mimeType === 'image/webp') return '.webp';
  if (mimeType === 'image/png') return '.png';
  return null;
}

function extensionFromUrl(url: string) {
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : null;
  } catch {
    return null;
  }
}

function mimeFromExtension(ext: string) {
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  return 'image/png';
}

export async function storeHostedImageResult({
  providerId,
  providerSlug,
  model,
  endpointBase,
  job,
  compiledInput,
  responseJson,
  imageUrl,
  requestAttempts,
  startedAt,
  diagnostics,
  fetch,
  files,
  maxAttempts,
  retryDelayMs,
  sleep,
}: StoreHostedImageResultInput): Promise<TurnResult> {
  const { response: imageResponse, attempts: imageAttempts } = await fetchExternalProviderWithRetry(
    {
      label: `${providerId} image download`,
      fetch,
      input: imageUrl,
      init: { signal: job.signal },
      maxAttempts,
      retryDelayMs,
      sleep,
    },
  );
  if (!imageResponse.ok) {
    throw new Error(
      `${providerId} image download failed after ${imageAttempts} attempt(s): ${imageResponse.status} ${imageResponse.statusText}`,
    );
  }

  const responseMime = imageResponse.headers.get('content-type')?.split(';')[0]?.trim() ?? null;
  const ext = extensionFromMime(responseMime) ?? extensionFromUrl(imageUrl) ?? '.png';
  const mimeType = responseMime?.startsWith('image/') ? responseMime : mimeFromExtension(ext);
  const safeJobId = sanitizeFilePart(job.id);
  const outputPath = files.resolveLibraryPath(
    'assets',
    `${safeJobId}-${providerSlug}-${files.now()}${ext}`,
  );
  files.mkdir(path.dirname(outputPath), { recursive: true });
  const buffer = Buffer.from(await imageResponse.arrayBuffer());
  files.writeFile(outputPath, buffer);

  const transcriptDir = files.resolveLibraryPath('transcripts', safeJobId);
  files.mkdir(transcriptDir, { recursive: true });
  const transcriptPath = path.join(transcriptDir, `${providerSlug}.json`);
  files.writeFile(
    transcriptPath,
    JSON.stringify(
      {
        providerId,
        model,
        endpointBase,
        sourceSpecId: compiledInput.sourceSpecId,
        task: compiledInput.task,
        outputPath,
        requestAttempts,
        imageAttempts,
        ...(diagnostics ? { diagnostics } : {}),
        responseShape: isRecord(responseJson) ? Object.keys(responseJson).sort() : [],
      },
      null,
      2,
    ),
    'utf8',
  );

  return {
    assets: [{ type: 'file', sourcePath: outputPath, mimeType }],
    transcript: transcriptPath,
    turnId: null,
    threadId: null,
    durationMs: Math.max(0, files.now() - startedAt),
  };
}

export function storeInlineImageResult({
  providerId,
  providerSlug,
  model,
  endpointBase,
  job,
  compiledInput,
  responseJson,
  image,
  requestAttempts,
  startedAt,
  diagnostics,
  files,
}: StoreInlineImageResultInput): TurnResult {
  const responseMime = image.mimeType?.split(';')[0]?.trim() ?? null;
  const ext = extensionFromMime(responseMime) ?? '.png';
  const mimeType = responseMime?.startsWith('image/') ? responseMime : mimeFromExtension(ext);
  const safeJobId = sanitizeFilePart(job.id);
  const outputPath = files.resolveLibraryPath(
    'assets',
    `${safeJobId}-${providerSlug}-${files.now()}${ext}`,
  );
  files.mkdir(path.dirname(outputPath), { recursive: true });
  files.writeFile(outputPath, Buffer.from(image.data, 'base64'));

  const transcriptDir = files.resolveLibraryPath('transcripts', safeJobId);
  files.mkdir(transcriptDir, { recursive: true });
  const transcriptPath = path.join(transcriptDir, `${providerSlug}.json`);
  files.writeFile(
    transcriptPath,
    JSON.stringify(
      {
        providerId,
        model,
        endpointBase,
        sourceSpecId: compiledInput.sourceSpecId,
        task: compiledInput.task,
        outputPath,
        requestAttempts,
        imageAttempts: 0,
        ...(diagnostics ? { diagnostics } : {}),
        responseShape: isRecord(responseJson) ? Object.keys(responseJson).sort() : [],
      },
      null,
      2,
    ),
    'utf8',
  );

  return {
    assets: [{ type: 'file', sourcePath: outputPath, mimeType }],
    transcript: transcriptPath,
    turnId: null,
    threadId: null,
    durationMs: Math.max(0, files.now() - startedAt),
  };
}
