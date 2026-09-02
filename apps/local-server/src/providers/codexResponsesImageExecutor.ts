import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname } from 'node:path';
import { resolveLibraryPath } from '../library';
import {
  CODEX_RESPONSES_BASE_URL,
  studioCodexOriginator,
  studioUserAgent,
} from '../auth/constants';
import { readChatgptAccountId } from '../auth/jwt';
import { getUsableAccessToken, invalidateStoredAccessToken } from '../auth/tokens';
import type { CodexImagegenInputItem } from './codexProvider';
import type { GenerationProviderJob } from './types';
import {
  isRecord,
  ExternalProviderImageError,
  readResponseTextLimited,
  responseSnippet,
  storeInlineImageResult,
  type ExternalProviderFetch,
} from './externalProviderResults';
import { SubscriptionHttpError, isAbortError } from './subscriptionHttpError';

type ReadLocalFile = (path: string) => Uint8Array;

export interface CodexResponsesImageExecutorDependencies {
  env?: Record<string, string | undefined>;
  fetch?: ExternalProviderFetch;
  resolveLibraryPath?: typeof resolveLibraryPath;
  mkdir?: typeof mkdirSync;
  writeFile?: typeof writeFileSync;
  readFile?: ReadLocalFile;
  now?: () => number;
  getAccessToken?: () => Promise<string>;
  invalidateAccessToken?: (message: string) => void;
  requestTimeoutMs?: number;
}

const CODEX_CHAT_MODEL = 'gpt-5.5';
const CODEX_IMAGE_MODEL = 'gpt-image-2';
const CODEX_INSTRUCTIONS =
  'You are an assistant that must fulfill image generation and image editing requests by using the image_generation tool when provided.';
const MAX_INPUT_IMAGES = 16;
const MIME_BY_EXTENSION: Record<string, string> = {
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export function resolveCodexImageQuality(
  model: string | null | undefined,
  reasoningEffort: string | null | undefined,
): 'low' | 'medium' | 'high' {
  const hay = `${model ?? ''} ${reasoningEffort ?? ''}`.toLowerCase();
  if (hay.includes('high')) return 'high';
  if (hay.includes('low') || hay.includes('minimal')) return 'low';
  return 'medium';
}

export function resolveCodexImageSize(job: GenerationProviderJob) {
  const output = job.sourceSpec?.output;
  const size = output?.imageSize?.trim();
  if (size === '1536x1024' || size === '1024x1536' || size === '1024x1024') return size;
  const pixels = size?.match(/^(\d+)\s*x\s*(\d+)$/i);
  if (pixels) {
    const width = Number.parseInt(pixels[1] ?? '', 10);
    const height = Number.parseInt(pixels[2] ?? '', 10);
    if (width > height) return '1536x1024';
    if (height > width) return '1024x1536';
    return '1024x1024';
  }
  const aspect = output?.aspectRatio?.trim();
  if (!aspect) return '1024x1024';
  const parts = aspect.split(':').map((part) => Number.parseFloat(part));
  const width = parts[0];
  const height = parts[1];
  if (Number.isFinite(width) && Number.isFinite(height)) {
    if (width > height) return '1536x1024';
    if (height > width) return '1024x1536';
  }
  return '1024x1024';
}

function inferMimeType(filePath: string) {
  return MIME_BY_EXTENSION[extname(filePath).toLowerCase()] ?? 'image/png';
}

function toInputImagePart(item: CodexImagegenInputItem, readFile: ReadLocalFile) {
  if (item.type === 'image') {
    return { type: 'input_image', image_url: item.url };
  }
  const mime = inferMimeType(item.path);
  const data = Buffer.from(readFile(item.path)).toString('base64');
  return { type: 'input_image', image_url: `data:${mime};base64,${data}` };
}

function extractImageCandidates(value: unknown): { final: string | null; partial: string | null } {
  let finalB64: string | null = null;
  let partialB64: string | null = null;
  const walk = (node: unknown) => {
    if (Array.isArray(node)) {
      for (const child of node) walk(child);
      return;
    }
    if (!isRecord(node)) return;
    if (node.type === 'image_generation_call' && typeof node.result === 'string' && node.result) {
      if (node.status == null || node.status === 'completed') {
        finalB64 = node.result;
      }
    }
    if (typeof node.partial_image_b64 === 'string' && node.partial_image_b64) {
      partialB64 = node.partial_image_b64;
    }
    for (const child of Object.values(node)) walk(child);
  };
  walk(value);
  return { final: finalB64, partial: partialB64 };
}

function parseSseJson(raw: string): unknown[] {
  const events: unknown[] = [];
  let eventName: string | null = null;
  const dataLines: string[] = [];
  const flush = () => {
    if (dataLines.length === 0) {
      eventName = null;
      return;
    }
    const text = dataLines.join('\n').trim();
    dataLines.length = 0;
    const name = eventName;
    eventName = null;
    if (!text || text === '[DONE]') return;
    try {
      const payload = JSON.parse(text) as unknown;
      if (isRecord(payload) && name && !('type' in payload)) payload.type = name;
      events.push(payload);
    } catch {
      // Ignore malformed SSE frames.
    }
  };
  for (const line of raw.split(/\r?\n/)) {
    if (line === '') {
      flush();
      continue;
    }
    if (line.startsWith(':')) continue;
    if (line.startsWith('event:')) {
      eventName = line.slice('event:'.length).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice('data:'.length).trimStart());
    }
  }
  flush();
  return events;
}

function sseFailureMessage(event: Record<string, unknown>, secrets: readonly string[]) {
  const error = event.error;
  if (typeof error === 'string' && error.trim()) return responseSnippet(error, secrets);
  if (isRecord(error) && typeof error.message === 'string' && error.message.trim()) {
    return responseSnippet(error.message, secrets);
  }
  if (typeof event.message === 'string' && event.message.trim()) {
    return responseSnippet(event.message, secrets);
  }
  return 'Codex Responses rejected the image request.';
}

function classifySseFailure(event: Record<string, unknown>, secrets: readonly string[]) {
  const message = sseFailureMessage(event, secrets);
  const lower = message.toLowerCase();
  if (lower.includes('moderat') || lower.includes('safety')) {
    return new SubscriptionHttpError(message, {
      code: 'moderation',
      fallbackAllowed: false,
    });
  }
  return new SubscriptionHttpError(message, {
    code: 'invalid_request',
    fallbackAllowed: false,
  });
}

function isFailedSseEvent(event: unknown): event is Record<string, unknown> {
  if (!isRecord(event)) return false;
  return event.type === 'response.failed' || event.type === 'error' || event.status === 'failed';
}

function summarizeCodexError(body: string, secrets: readonly string[]) {
  try {
    const payload = JSON.parse(body) as unknown;
    if (isRecord(payload) && isRecord(payload.error) && typeof payload.error.message === 'string') {
      return responseSnippet(payload.error.message.trim(), secrets);
    }
  } catch {
    // Fall through to a bounded raw snippet.
  }
  return responseSnippet(body, secrets);
}

function classifyCodexHttpFailure(status: number, message: string): SubscriptionHttpError {
  if (status === 401) {
    return new SubscriptionHttpError(message || 'ChatGPT credentials were rejected.', {
      code: 'invalid_grant',
      fallbackAllowed: false,
      httpStatus: status,
    });
  }
  if (status === 403) {
    return new SubscriptionHttpError(
      message ||
        'This ChatGPT account is not authorized for HTTP image generation. Codex Product Runtime can still run if it is signed in.',
      { code: 'entitlement_denied', fallbackAllowed: true, httpStatus: status },
    );
  }
  if (status >= 500 || status === 429) {
    return new SubscriptionHttpError(message || `Codex Responses failed (${status}).`, {
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
  return new SubscriptionHttpError(message || `Codex Responses failed (${status}).`, {
    code: 'invalid_request',
    fallbackAllowed: false,
    httpStatus: status,
  });
}

export function createCodexResponsesImageExecutor({
  env = process.env,
  fetch: fetchImpl = fetch,
  resolveLibraryPath: resolveLibraryPathFn = resolveLibraryPath,
  mkdir = mkdirSync,
  writeFile = writeFileSync,
  readFile = (filePath) => readFileSync(filePath),
  now = Date.now,
  getAccessToken = () => getUsableAccessToken('codex', { env, fetch: fetchImpl as typeof fetch }),
  invalidateAccessToken = (message) => invalidateStoredAccessToken('codex', message),
  requestTimeoutMs = 120_000,
}: CodexResponsesImageExecutorDependencies = {}) {
  return async (job: GenerationProviderJob) => {
    const { compileCodexImagegenInput } = await import('./codexProvider');
    const compiled = compileCodexImagegenInput(job);
    const startedAt = now();
    const quality = resolveCodexImageQuality(job.execution?.model, job.execution?.reasoningEffort);
    const size = resolveCodexImageSize(job);
    if (compiled.payload.imageInputs.length > MAX_INPUT_IMAGES) {
      throw new SubscriptionHttpError(
        `Codex HTTP image edits accept at most ${MAX_INPUT_IMAGES} source images. Codex Product Runtime can take more.`,
        { code: 'source_limit', fallbackAllowed: true },
      );
    }
    const inputImages = compiled.payload.imageInputs.map((item) =>
      toInputImagePart(item, readFile),
    );
    const token = await getAccessToken();
    const payload = {
      model: CODEX_CHAT_MODEL,
      store: false,
      instructions: CODEX_INSTRUCTIONS,
      input: [
        {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text: compiled.payload.text }, ...inputImages],
        },
      ],
      tools: [
        {
          type: 'image_generation',
          model: CODEX_IMAGE_MODEL,
          size,
          quality,
          output_format: 'png',
          background: 'opaque',
          partial_images: 0,
        },
      ],
      stream: true,
    };
    const headers: Record<string, string> = {
      Accept: 'text/event-stream',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': studioUserAgent(),
      originator: studioCodexOriginator(env),
    };
    const accountId = readChatgptAccountId(token);
    if (accountId) headers['ChatGPT-Account-ID'] = accountId;

    let response: Awaited<ReturnType<ExternalProviderFetch>>;
    const requestSignal = job.signal
      ? AbortSignal.any([job.signal, AbortSignal.timeout(requestTimeoutMs)])
      : AbortSignal.timeout(requestTimeoutMs);
    try {
      response = await fetchImpl(`${CODEX_RESPONSES_BASE_URL}/responses`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        redirect: 'error',
        signal: requestSignal,
      });
    } catch (error) {
      if (isAbortError(error)) throw error;
      throw new SubscriptionHttpError(
        error instanceof Error ? error.message : 'Codex Responses request failed.',
        { code: 'timeout', fallbackAllowed: true },
      );
    }

    let raw = '';
    try {
      raw = await readResponseTextLimited(response, 5 * 1024 * 1024);
    } catch (error) {
      if (isAbortError(error) || job.signal?.aborted) {
        const abortError = error instanceof Error ? error : new Error('Codex Responses aborted.');
        abortError.name = 'AbortError';
        throw abortError;
      }
      throw new SubscriptionHttpError(
        error instanceof Error ? error.message : 'Codex Responses stream failed.',
        { code: 'timeout', fallbackAllowed: true },
      );
    }
    if (job.signal?.aborted) {
      const abortError = new Error('Codex Responses aborted.');
      abortError.name = 'AbortError';
      throw abortError;
    }
    if (!response.ok) {
      const failure = classifyCodexHttpFailure(response.status, summarizeCodexError(raw, [token]));
      if (response.status === 401) invalidateAccessToken(failure.message);
      throw failure;
    }

    const events = parseSseJson(raw);
    for (const event of events) {
      if (isFailedSseEvent(event)) throw classifySseFailure(event, [token]);
    }
    let finalB64: string | null = null;
    for (const event of events) {
      const found = extractImageCandidates(event);
      if (found.final) finalB64 = found.final;
    }
    if (!finalB64) {
      throw new SubscriptionHttpError('Codex Responses did not return a final image.', {
        code: 'empty_response',
        fallbackAllowed: true,
      });
    }

    try {
      return storeInlineImageResult({
        providerId: 'codex',
        providerSlug: 'codex-http',
        model: CODEX_IMAGE_MODEL,
        endpointBase: CODEX_RESPONSES_BASE_URL,
        job: { id: job.id },
        compiledInput: compiled,
        responseJson: { quality, size },
        image: { data: finalB64, mimeType: 'image/png' },
        requestAttempts: 1,
        startedAt,
        diagnostics: { runtime: 'subscription_http', quality, size },
        files: { resolveLibraryPath: resolveLibraryPathFn, mkdir, writeFile, now },
      });
    } catch (error) {
      if (!(error instanceof ExternalProviderImageError)) throw error;
      throw new SubscriptionHttpError(error.message, {
        code: 'empty_response',
        fallbackAllowed: true,
      });
    }
  };
}
