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
  Pick<Response, 'ok' | 'status' | 'statusText' | 'headers' | 'json' | 'text' | 'arrayBuffer'> & {
    body?: Response['body'];
  }
>;

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

export class ExternalProviderImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExternalProviderImageError';
  }
}

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
  return redactSecrets(value, secrets)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

export async function readResponseTextLimited(
  response: Pick<Response, 'text'> & { body?: Response['body'] },
  maxBytes: number,
) {
  if (!response.body) {
    const text = await response.text();
    if (Buffer.byteLength(text, 'utf8') > maxBytes) {
      throw new Error(`Provider response exceeded ${maxBytes} bytes.`);
    }
    return text;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error(`Provider response exceeded ${maxBytes} bytes.`);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
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

  const outputImage = isRecord(value.output_image) ? value.output_image : null;
  if (outputImage && typeof outputImage.data === 'string') {
    return {
      data: outputImage.data,
      mimeType: typeof outputImage.mime_type === 'string' ? outputImage.mime_type : null,
    };
  }

  if (isRecord(value.interaction)) {
    const image = findFirstInlineImageData(value.interaction);
    if (image) return image;
  }

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

  const steps = Array.isArray(value.steps) ? value.steps : [];
  for (const step of steps) {
    if (!isRecord(step)) continue;
    const content = Array.isArray(step.content) ? step.content : [];
    for (const block of content) {
      if (isRecord(block) && block.type === 'image' && typeof block.data === 'string') {
        return {
          data: block.data,
          mimeType: typeof block.mime_type === 'string' ? block.mime_type : null,
        };
      }
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
  if (mimeType === 'image/gif') return '.gif';
  if (mimeType === 'image/png') return '.png';
  return null;
}

function extensionFromUrl(url: string) {
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    return ['.gif', '.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : null;
  } catch {
    return null;
  }
}

function imageMimeFromBytes(buffer: Buffer) {
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    return 'image/png';
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (buffer.length >= 6) {
    const signature = buffer.subarray(0, 6).toString('ascii');
    if (signature === 'GIF87a' || signature === 'GIF89a') return 'image/gif';
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
}

function decodeAndValidateInlineImage(data: string, declaredMime: string | null) {
  const normalized = data.replace(/\s+/g, '');
  if (!normalized || normalized.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) {
    throw new ExternalProviderImageError('Provider returned invalid base64 image data.');
  }
  if (normalized.length > Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 4) {
    throw new ExternalProviderImageError('Provider image exceeded the 25 MB limit.');
  }
  const buffer = Buffer.from(normalized, 'base64');
  return validateImageBuffer(buffer, declaredMime);
}

function validateImageBuffer(buffer: Buffer, declaredMime: string | null) {
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new ExternalProviderImageError('Provider image exceeded the 25 MB limit.');
  }
  const detectedMime = imageMimeFromBytes(buffer);
  if (!detectedMime) {
    throw new ExternalProviderImageError('Provider returned bytes that are not a supported image.');
  }
  if (declaredMime?.startsWith('image/') && declaredMime !== detectedMime) {
    throw new ExternalProviderImageError(
      `Provider image type mismatch: declared ${declaredMime}, received ${detectedMime}.`,
    );
  }
  return { buffer, mimeType: detectedMime };
}

async function readImageBytesLimited(
  response: Pick<Response, 'arrayBuffer' | 'headers'> & { body?: Response['body'] },
) {
  const contentLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_BYTES) {
    throw new ExternalProviderImageError('Provider image exceeded the 25 MB limit.');
  }
  if (!response.body) {
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_IMAGE_BYTES) {
      throw new ExternalProviderImageError('Provider image exceeded the 25 MB limit.');
    }
    return buffer;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_IMAGE_BYTES) {
      await reader.cancel();
      throw new ExternalProviderImageError('Provider image exceeded the 25 MB limit.');
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
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
  let imageResponse: Awaited<ReturnType<ExternalProviderFetch>>;
  let imageAttempts: number;
  try {
    const result = await fetchExternalProviderWithRetry({
      label: `${providerId} image download`,
      fetch,
      input: imageUrl,
      init: { signal: job.signal, redirect: 'error' },
      maxAttempts,
      retryDelayMs,
      sleep,
    });
    imageResponse = result.response;
    imageAttempts = result.attempts;
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new ExternalProviderImageError(
      error instanceof Error ? error.message : `${providerId} image download failed.`,
    );
  }
  if (!imageResponse.ok) {
    throw new ExternalProviderImageError(
      `${providerId} image download failed after ${imageAttempts} attempt(s): ${imageResponse.status} ${imageResponse.statusText}`,
    );
  }

  const responseMime = imageResponse.headers.get('content-type')?.split(';')[0]?.trim() ?? null;
  if (!responseMime?.startsWith('image/')) {
    throw new ExternalProviderImageError('Provider image download returned a non-image response.');
  }
  const validated = validateImageBuffer(await readImageBytesLimited(imageResponse), responseMime);
  const ext = extensionFromMime(validated.mimeType) ?? extensionFromUrl(imageUrl) ?? '.png';
  const mimeType = validated.mimeType;
  const safeJobId = sanitizeFilePart(job.id);
  const outputPath = files.resolveLibraryPath(
    'assets',
    `${safeJobId}-${providerSlug}-${files.now()}${ext}`,
  );
  files.mkdir(path.dirname(outputPath), { recursive: true });
  files.writeFile(outputPath, validated.buffer);

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
  const validated = decodeAndValidateInlineImage(image.data, responseMime);
  const ext = extensionFromMime(validated.mimeType) ?? '.png';
  const mimeType = validated.mimeType;
  const safeJobId = sanitizeFilePart(job.id);
  const outputPath = files.resolveLibraryPath(
    'assets',
    `${safeJobId}-${providerSlug}-${files.now()}${ext}`,
  );
  files.mkdir(path.dirname(outputPath), { recursive: true });
  files.writeFile(outputPath, validated.buffer);

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
