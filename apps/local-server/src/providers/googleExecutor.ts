import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname } from 'node:path';
import type { GenerationTaskKind } from '../../../../packages/shared/src';
import {
  DEFAULT_GOOGLE_IMAGE_MODEL,
  GOOGLE_IMAGE_MODELS,
  isGoogleImageModel,
  isGoogleImageSizeSupported,
  type GoogleImageModel,
} from '../../../../packages/shared/src/googleImageContract';
import { readGoogleOAuthConfig } from '../auth/googleOAuthConfig';
import {
  getUsableAccessToken,
  invalidateStoredAccessToken,
  readGoogleApiKey,
} from '../auth/tokens';
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
  getAccessToken?: (env: Record<string, string | undefined>) => Promise<string>;
  invalidateAccessToken?: (message: string) => void;
}

const DEFAULT_GOOGLE_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 750;
const MAX_INPUT_IMAGE_BYTES = 25 * 1024 * 1024;

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

  const bytes = Buffer.from(readFile(asset.localPath));
  if (bytes.byteLength > MAX_INPUT_IMAGE_BYTES) {
    throw new Error(`Google image asset "${asset.name}" exceeded the 25 MB limit.`);
  }
  return {
    type: 'image' as const,
    mime_type: inferMimeType(asset.localPath),
    data: bytes.toString('base64'),
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
  const inputs = Array.isArray(requestBody.input) ? requestBody.input : [];
  return {
    assetCount: payload.assets.length,
    assetRoles: payload.assets.map((asset) => asset.role).sort(),
    inlineImagePartCount: inputs.filter((input) => isRecord(input) && input.type === 'image')
      .length,
    requestFieldNames: Object.keys(requestBody).sort(),
  };
}

function normalizeGoogleImageSize(value: string | null, model: GoogleImageModel) {
  const normalized = value?.trim().toUpperCase() ?? '';
  if (['512', '1K', '2K', '4K'].includes(normalized)) {
    if (!isGoogleImageSizeSupported(model, normalized)) {
      throw new Error(`Google image model "${model}" does not support ${normalized} output.`);
    }
    return normalized;
  }
  const dimensions = normalized.match(/^(\d+)X(\d+)$/);
  if (!dimensions) return null;
  const largest = Math.max(Number(dimensions[1]), Number(dimensions[2]));
  const requested = largest <= 512 ? '512' : largest <= 1536 ? '1K' : largest <= 3072 ? '2K' : '4K';
  return isGoogleImageSizeSupported(model, requested) ? requested : '1K';
}

function normalizeGoogleMimeType(value: string | null) {
  const normalized = value?.trim().toLowerCase();
  return normalized === 'image/jpeg' || normalized === 'image/webp' ? normalized : 'image/png';
}

export function resolveGoogleApiBase(value: string | undefined) {
  const raw = trimTrailingSlash(value?.trim() || DEFAULT_GOOGLE_API_BASE);
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('GOOGLE_API_BASE is not a valid URL.');
  }
  const hostname = url.hostname.toLowerCase();
  const loopback = hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '::1';
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback))
  ) {
    throw new Error('GOOGLE_API_BASE must use HTTPS or a credential-free loopback URL.');
  }
  return trimTrailingSlash(url.href);
}

export function createGoogleRequestBody(
  payload: HostedImageApiCompiledPayload,
  task: GenerationTaskKind,
  readFile: ReadLocalFile,
  model: GoogleImageModel,
) {
  assertGoogleRequestBodySupportsTask(task, payload);

  const assetParts = payload.assets.map((asset) => ({
    part: createGoogleAssetPart(asset, readFile),
    role: asset.role,
    strength: asset.strength,
  }));

  const inlineParts = assetParts
    .filter(
      (
        entry,
      ): entry is {
        part: { type: 'image'; mime_type: string; data: string };
        role: ProviderAssetInputRef['role'];
        strength: number | null;
      } => entry.part !== null,
    )
    .sort((a, b) => {
      const order: Record<string, number> = {
        input: 0,
        external_output: 0,
        mask: 1,
        control: 2,
        reference: 3,
      };
      return (order[a.role] ?? 4) - (order[b.role] ?? 4);
    })
    .map((entry) => entry.part);

  const editInstruction =
    task === 'image_edit'
      ? ' Edit the input image following the instructions above. Preserve the original composition, subject identity, and overall structure while applying the requested changes.'
      : '';

  const promptText = createGooglePromptText(payload) + editInstruction;
  const promptPart = { type: 'text' as const, text: promptText };
  const parts = task === 'image_edit' ? [...inlineParts, promptPart] : [promptPart, ...inlineParts];

  const imageSize = normalizeGoogleImageSize(payload.output.imageSize, model);
  return {
    model,
    input: parts,
    response_format: {
      type: 'image',
      mime_type: normalizeGoogleMimeType(payload.output.mimeType),
      ...(payload.output.aspectRatio?.trim()
        ? { aspect_ratio: payload.output.aspectRatio.trim() }
        : {}),
      ...(imageSize ? { image_size: imageSize } : {}),
    },
    store: false,
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
  getAccessToken = (credentialEnv) =>
    getUsableAccessToken('google', { env: credentialEnv, fetch: fetchFn as typeof fetch }),
  invalidateAccessToken = (message) => invalidateStoredAccessToken('google', message),
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
    const apiKey = readGoogleApiKey(env);
    const oauthConfig = apiKey ? null : readGoogleOAuthConfig(env);
    const cloudProjectId = oauthConfig?.cloudProjectId ?? null;
    const accessToken = apiKey ? null : await getAccessToken(env);
    const model =
      payload.model?.trim() ||
      env.GOOGLE_IMAGE_MODEL?.trim() ||
      env.GEMINI_IMAGE_MODEL?.trim() ||
      DEFAULT_GOOGLE_IMAGE_MODEL;
    if (!isGoogleImageModel(model)) {
      throw new Error(
        `Google image model "${model}" is unsupported. Available models: ${GOOGLE_IMAGE_MODELS.join(', ')}.`,
      );
    }
    if (payload.output.count !== 1) {
      throw new Error('Google image generation requires exactly one output image per Job.');
    }
    const apiBase = resolveGoogleApiBase(env.GOOGLE_API_BASE);
    const endpoint = `${apiBase}/interactions`;
    const requestBody = createGoogleRequestBody(payload, compiledInput.task, readFile, model);
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(apiKey ? { 'x-goog-api-key': apiKey } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(!apiKey && cloudProjectId ? { 'x-goog-user-project': cloudProjectId } : {}),
    };
    const { response, attempts: requestAttempts } = await fetchExternalProviderWithRetry({
      label: 'Google image request',
      fetch: fetchFn,
      input: endpoint,
      init: {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: job.signal,
      },
      maxAttempts,
      retryDelayMs,
      sleep,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      if (!apiKey && response.status === 401) {
        invalidateAccessToken('Google rejected the stored access token. Sign in again.');
      }
      throw new Error(
        `Google image request failed after ${requestAttempts} attempt(s): ${response.status} ${response.statusText}${body ? ` ${responseSnippet(body, [apiKey ?? '', accessToken ?? '', cloudProjectId ?? ''])}` : ''}`,
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
