import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname } from 'node:path';
import {
  DEFAULT_GROK_IMAGINE_HTTP_MODEL,
  GROK_IMAGINE_ASPECT_RATIOS,
  GROK_IMAGINE_HTTP_MODELS,
  MAX_GROK_IMAGINE_HTTP_SOURCE_IMAGES,
} from '../../../../packages/shared/src/grokImagineContract';
import { resolveLibraryPath } from '../library';
import { XAI_API_BASE_URL, studioUserAgent } from '../auth/constants';
import { getUsableAccessToken, readXaiApiKey } from '../auth/tokens';
import type {
  ExternalProviderExecutionContext,
  ExternalProviderExecutor,
} from './externalProvider';
import type { GrokImagineCompiledPayload } from './grokImagineInput';
import {
  isRecord,
  responseSnippet,
  storeHostedImageResult,
  storeInlineImageResult,
  type ExternalProviderFetch,
} from './externalProviderResults';
import { SubscriptionHttpError, isAbortError } from './subscriptionHttpError';

type ReadLocalFile = (path: string) => Uint8Array;

export interface GrokImagineHttpExecutorDependencies {
  env?: Record<string, string | undefined>;
  fetch?: ExternalProviderFetch;
  resolveLibraryPath?: typeof resolveLibraryPath;
  mkdir?: typeof mkdirSync;
  writeFile?: typeof writeFileSync;
  readFile?: ReadLocalFile;
  now?: () => number;
  getAccessToken?: () => Promise<string>;
}

const MIME_BY_EXTENSION: Record<string, string> = {
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function asGrokPayload(value: unknown): GrokImagineCompiledPayload {
  if (!isRecord(value) || typeof value.prompt !== 'string') {
    throw new Error('Compiled Grok Provider Input payload is invalid.');
  }
  return value as unknown as GrokImagineCompiledPayload;
}

function inferMimeType(filePath: string) {
  return MIME_BY_EXTENSION[extname(filePath).toLowerCase()] ?? 'image/png';
}

export function resolveGrokImagineHttpModel(
  requested: string | null | undefined,
  env: Record<string, string | undefined> = process.env,
) {
  const override = env.GROK_IMAGE_MODEL?.trim();
  const candidate = requested?.trim() || override || DEFAULT_GROK_IMAGINE_HTTP_MODEL;
  if (candidate.startsWith('grok-imagine-')) return candidate;
  if (override?.startsWith('grok-imagine-')) return override;
  return DEFAULT_GROK_IMAGINE_HTTP_MODEL;
}

export function resolveGrokImagineHttpAspectRatio(payload: GrokImagineCompiledPayload) {
  const aspect = payload.output.aspectRatio?.trim();
  if (aspect && GROK_IMAGINE_ASPECT_RATIOS.has(aspect) && aspect !== 'auto') return aspect;
  const size = payload.output.imageSize?.trim() ?? '';
  const [width, height] = size.split('x').map((part) => Number.parseInt(part, 10));
  if (Number.isFinite(width) && Number.isFinite(height)) {
    if (width > height) return '16:9';
    if (height > width) return '9:16';
  }
  return '1:1';
}

function resolveResolution(payload: GrokImagineCompiledPayload) {
  const size = payload.output.imageSize?.toLowerCase() ?? '';
  if (size.includes('2k') || size.includes('2048') || size.includes('1536')) return '2k';
  return '1k';
}

function toDataUri(filePath: string, readFile: ReadLocalFile) {
  const mime = inferMimeType(filePath);
  const data = Buffer.from(readFile(filePath)).toString('base64');
  return `data:${mime};base64,${data}`;
}

function grokErrorMessage(payload: unknown, fallback: string) {
  if (isRecord(payload)) {
    const error = payload.error;
    if (typeof error === 'string' && error.trim()) return error.trim();
    if (isRecord(error) && typeof error.message === 'string' && error.message.trim()) {
      return error.message.trim();
    }
  }
  return fallback;
}

function classifyGrokHttpFailure(status: number, message: string): SubscriptionHttpError {
  if (status === 403) {
    return new SubscriptionHttpError(
      'This xAI account is not authorized for API image generation. Grok Build CLI can still run if it is signed in.',
      { code: 'entitlement_denied', fallbackAllowed: true, httpStatus: status },
    );
  }
  if (status === 401) {
    return new SubscriptionHttpError(message || 'xAI credentials were rejected.', {
      code: 'invalid_grant',
      fallbackAllowed: false,
      httpStatus: status,
    });
  }
  if (status >= 500 || status === 429) {
    return new SubscriptionHttpError(message || `xAI image generation failed (${status}).`, {
      code: 'http_error',
      fallbackAllowed: true,
      httpStatus: status,
    });
  }
  const lower = message.toLowerCase();
  if (lower.includes('moderat') || lower.includes('safety')) {
    return new SubscriptionHttpError(message, {
      code: 'moderation',
      fallbackAllowed: false,
      httpStatus: status,
    });
  }
  return new SubscriptionHttpError(message || `xAI image generation failed (${status}).`, {
    code: 'invalid_request',
    fallbackAllowed: false,
    httpStatus: status,
  });
}

export function createGrokImagineHttpExecutor({
  env = process.env,
  fetch: fetchImpl = fetch,
  resolveLibraryPath: resolveLibraryPathFn = resolveLibraryPath,
  mkdir = mkdirSync,
  writeFile = writeFileSync,
  readFile = (filePath) => readFileSync(filePath),
  now = Date.now,
  getAccessToken = () => getUsableAccessToken('xai', { env, fetch: fetchImpl as typeof fetch }),
}: GrokImagineHttpExecutorDependencies = {}): ExternalProviderExecutor {
  return async (context: ExternalProviderExecutionContext) => {
    const startedAt = now();
    const payload = asGrokPayload(context.compiledInput.payload);
    const sources = payload.assets.filter((asset) => asset.localPath);
    if (sources.length > MAX_GROK_IMAGINE_HTTP_SOURCE_IMAGES) {
      throw new SubscriptionHttpError(
        `xAI HTTP image edits accept at most ${MAX_GROK_IMAGINE_HTTP_SOURCE_IMAGES} source images. Grok Build CLI can take more.`,
        { code: 'source_limit', fallbackAllowed: true },
      );
    }

    const isEdit = payload.operation === 'image_edit' || sources.length > 0;
    const model = isEdit
      ? payload.model?.startsWith('grok-imagine-image-2')
        ? resolveGrokImagineHttpModel(payload.model, env)
        : 'grok-imagine-image-quality'
      : resolveGrokImagineHttpModel(payload.model, env);
    const token = await getAccessToken();
    const endpointBase = env.XAI_BASE_URL?.trim().replace(/\/+$/, '') || XAI_API_BASE_URL;
    const endpoint = isEdit ? `${endpointBase}/images/edits` : `${endpointBase}/images/generations`;
    const body: Record<string, unknown> = {
      model,
      prompt: payload.prompt,
    };
    if (isEdit) {
      const images = sources.map((asset) => toDataUri(asset.localPath!, readFile));
      if (images.length === 0) {
        throw new SubscriptionHttpError(
          'Grok Imagine image editing requires a Studio Library source image.',
          {
            code: 'invalid_request',
            fallbackAllowed: false,
          },
        );
      }
      if (images.length === 1) body.image = images[0];
      else body.images = images;
    } else {
      body.aspect_ratio = resolveGrokImagineHttpAspectRatio(payload);
      body.resolution = resolveResolution(payload);
    }

    let response: Awaited<ReturnType<ExternalProviderFetch>>;
    try {
      response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': studioUserAgent(),
        },
        body: JSON.stringify(body),
        signal: context.job.signal,
      });
    } catch (error) {
      if (isAbortError(error)) throw error;
      throw new SubscriptionHttpError(
        error instanceof Error ? error.message : 'xAI image generation request failed.',
        { code: 'timeout', fallbackAllowed: true },
      );
    }
    let rawText = '';
    try {
      rawText = await response.text();
    } catch (error) {
      if (isAbortError(error)) throw error;
      throw new SubscriptionHttpError(
        error instanceof Error ? error.message : 'xAI image generation response failed.',
        { code: 'timeout', fallbackAllowed: true },
      );
    }
    let json: unknown = {};
    try {
      json = rawText ? JSON.parse(rawText) : {};
    } catch {
      json = { error: rawText.slice(0, 300) };
    }
    if (!response.ok) {
      throw classifyGrokHttpFailure(
        response.status,
        grokErrorMessage(json, responseSnippet(rawText, [token, readXaiApiKey(env) ?? ''])),
      );
    }
    const data = isRecord(json) && Array.isArray(json.data) ? json.data : [];
    const first = isRecord(data[0]) ? data[0] : null;
    const b64 = typeof first?.b64_json === 'string' ? first.b64_json : null;
    const url = typeof first?.url === 'string' ? first.url : null;
    const files = { resolveLibraryPath: resolveLibraryPathFn, mkdir, writeFile, now };
    if (b64) {
      return storeInlineImageResult({
        providerId: 'grok',
        providerSlug: 'grok-http',
        model,
        endpointBase,
        job: context.job,
        compiledInput: context.compiledInput,
        responseJson: { keys: isRecord(json) ? Object.keys(json) : [] },
        image: { data: b64, mimeType: 'image/png' },
        requestAttempts: 1,
        startedAt,
        diagnostics: {
          runtime: 'subscription_http',
          models: [...GROK_IMAGINE_HTTP_MODELS],
        },
        files,
      });
    }
    if (url) {
      return storeHostedImageResult({
        providerId: 'grok',
        providerSlug: 'grok-http',
        model,
        endpointBase,
        job: { id: context.job.id, signal: context.job.signal },
        compiledInput: context.compiledInput,
        responseJson: { keys: isRecord(json) ? Object.keys(json) : [] },
        imageUrl: url,
        requestAttempts: 1,
        startedAt,
        diagnostics: { runtime: 'subscription_http' },
        fetch: fetchImpl,
        files,
        maxAttempts: 3,
        retryDelayMs: 400,
        sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
      });
    }
    throw new SubscriptionHttpError('xAI returned no image data.', {
      code: 'empty_response',
      fallbackAllowed: true,
    });
  };
}
