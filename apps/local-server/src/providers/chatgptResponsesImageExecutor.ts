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
import {
  compileChatgptImageInput,
  compileCodexImagegenInput,
  type CodexImagegenInputItem,
} from './openaiImageInput';
import type { GenerationProviderJob } from './types';
import {
  isRecord,
  readResponseTextLimited,
  responseSnippet,
  storeInlineImageResult,
  type ExternalProviderFetch,
} from './externalProviderResults';
import { SubscriptionHttpError } from './subscriptionHttpError';
import { ProviderExecutionUncertainError } from '../workerErrors';
import { resolveCodexExecutionPolicy } from '../../../../packages/shared/src/codexExecutionContract';

type ReadLocalFile = (path: string) => Uint8Array;

export interface ChatgptResponsesImageExecutorDependencies {
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

const CODEX_INSTRUCTIONS =
  'You are an assistant that must fulfill image generation and image editing requests by using the image_generation tool when provided.';

const MIME_BY_EXTENSION: Record<string, string> = {
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

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
  const response = isRecord(event.response) ? event.response : event;
  const error = response.error ?? event.error;
  if (typeof error === 'string' && error.trim()) return responseSnippet(error, secrets);
  if (isRecord(error) && typeof error.message === 'string' && error.message.trim()) {
    return responseSnippet(error.message, secrets);
  }
  if (typeof event.message === 'string' && event.message.trim()) {
    return responseSnippet(event.message, secrets);
  }
  if (
    isRecord(response.incomplete_details) &&
    typeof response.incomplete_details.reason === 'string'
  ) {
    return `ChatGPT HTTP response incomplete: ${responseSnippet(response.incomplete_details.reason, secrets)}`;
  }
  return 'ChatGPT HTTP rejected the image request.';
}

function classifyProviderFailure(
  payload: unknown,
  message: string,
  httpStatus: number | null,
  secrets: readonly string[],
  retryAfterSeconds: number | null = null,
) {
  const response = isRecord(payload) && isRecord(payload.response) ? payload.response : payload;
  const error = isRecord(response) && isRecord(response.error) ? response.error : response;
  const rawCode = isRecord(error) ? (error.code ?? error.type) : null;
  const providerCode = typeof rawCode === 'string' ? responseSnippet(rawCode, secrets) : null;
  const code = providerCode?.toLowerCase() ?? '';
  const lower = message.toLowerCase();
  let category: SubscriptionHttpError['code'] = 'invalid_request';
  let detail = message || 'ChatGPT rejected the image request.';
  const quotaCodes = [
    'usage_limit_reached',
    'usage_limit_exceeded',
    'insufficient_quota',
    'quota_exceeded',
    'usagelimitexceeded',
  ];
  const rateCodes = ['rate_limit', 'rate_limit_exceeded', 'rate_limit_error', 'too_many_requests'];
  // An explicit provider code takes precedence over status and message heuristics.
  if (['invalid_grant', 'invalid_token', 'token_expired'].includes(code))
    category = 'invalid_grant';
  else if (quotaCodes.includes(code)) category = 'source_limit';
  else if (rateCodes.includes(code)) category = 'rate_limit';
  else if (
    [
      'permission_denied',
      'access_denied',
      'insufficient_permissions',
      'entitlement_denied',
    ].includes(code)
  )
    category = 'entitlement_denied';
  else if (/moderat|safety|content_filter/.test(code)) category = 'moderation';
  else if (['server_error', 'internal_error', 'service_unavailable'].includes(code))
    category = 'http_error';
  else if (httpStatus === 401) category = 'invalid_grant';
  else if (httpStatus === 403) category = 'entitlement_denied';
  else if (httpStatus !== null && httpStatus >= 500) category = 'http_error';
  else if (
    !providerCode &&
    /(?:hit|reached|exceeded|exhausted) (?:your |the )?(?:usage limit|quota)|(?:usage limit|quota) (?:has been |is )?(?:reached|exceeded|exhausted)|no available usage/i.test(
      message,
    )
  )
    category = 'source_limit';
  else if (
    httpStatus === 429 ||
    (!providerCode && /rate[ _-]?limit|too many requests/i.test(message))
  )
    category = 'rate_limit';
  else if (!providerCode && /moderat|safety|content_filter/.test(lower)) category = 'moderation';
  if (category === 'invalid_grant')
    detail = 'ChatGPT session expired or was rejected. Sign in again in Studio Settings.';
  else if (category === 'source_limit')
    detail =
      'ChatGPT reported an exhausted usage limit for this HTTP route. Wait for the limit to reset.';
  else if (category === 'rate_limit')
    detail =
      'ChatGPT temporarily limited requests.' +
      (retryAfterSeconds === null
        ? ' Wait before retrying.'
        : ` Try again in ${retryAfterSeconds} seconds.`);
  else if (category === 'entitlement_denied')
    detail =
      'This account cannot access HTTP image generation. Check the accepted ChatGPT account.';
  else if (category === 'http_error') detail = 'ChatGPT reported a service failure.';
  // Keep bounded vendor detail for diagnosis; never include credentials.
  if (message && detail !== message) detail += ` ${message}`;
  return new SubscriptionHttpError(detail, {
    code: category,
    fallbackAllowed: false,
    httpStatus,
    providerCode,
    retryAfterSeconds,
  });
}

function classifySseFailure(
  event: Record<string, unknown>,
  secrets: readonly string[],
  retryAfterSeconds: number | null,
) {
  return classifyProviderFailure(
    event,
    sseFailureMessage(event, secrets),
    null,
    secrets,
    retryAfterSeconds,
  );
}

function readRetryAfter(value: string | null, now: number): number | null {
  if (!value?.trim()) return null;
  const seconds = /^\d+(?:\.\d+)?$/.test(value) ? Number(value) : (Date.parse(value) - now) / 1000;
  return Number.isFinite(seconds) && seconds >= 0 ? Math.ceil(seconds) : null;
}

function isFailedSseEvent(event: unknown): event is Record<string, unknown> {
  if (!isRecord(event)) return false;
  const response = isRecord(event.response) ? event.response : event;
  return (
    event.type === 'response.failed' ||
    event.type === 'response.incomplete' ||
    event.type === 'error' ||
    response.status === 'failed' ||
    response.status === 'incomplete'
  );
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

function classifyCodexHttpFailure(
  status: number,
  body: string,
  secrets: readonly string[],
  retryAfterSeconds: number | null,
) {
  let payload: unknown = null;
  try {
    payload = JSON.parse(body);
  } catch {
    /* Preserve a bounded non-JSON error. */
  }
  return classifyProviderFailure(
    payload,
    summarizeCodexError(body, secrets),
    status,
    secrets,
    retryAfterSeconds,
  );
}

export function createChatgptResponsesImageExecutor({
  env = process.env,
  fetch: fetchImpl = fetch,
  resolveLibraryPath: resolveLibraryPathFn = resolveLibraryPath,
  mkdir = mkdirSync,
  writeFile = writeFileSync,
  readFile = (filePath) => readFileSync(filePath),
  now = Date.now,
  getAccessToken = () => getUsableAccessToken('codex', { env, fetch: fetchImpl as typeof fetch }),
  invalidateAccessToken = (message) => invalidateStoredAccessToken('codex', message),
  // Four concurrent image streams can legitimately take longer than two minutes.
  // Keep the response observable before classifying an accepted submission as uncertain.
  requestTimeoutMs = 300_000,
}: ChatgptResponsesImageExecutorDependencies = {}) {
  return async (job: GenerationProviderJob) => {
    const providerId = job.providerId === 'chatgpt' ? 'chatgpt' : 'codex';
    if (job.remoteExecution) {
      if (job.remoteExecution.providerId === providerId && job.remoteExecution.phase === 'failed') {
        throw new Error(
          'The previous HTTP attempt was rejected. Retry this failed job after restoring access.',
        );
      }
      throw new ProviderExecutionUncertainError(
        'An HTTP submission is already recorded for this job. Review the existing result; Studio will not send it again.',
      );
    }
    if (!job.checkpointRemoteExecution)
      throw new Error('HTTP execution requires durable submission storage.');
    const compiled =
      providerId === 'chatgpt' ? compileChatgptImageInput(job) : compileCodexImagegenInput(job);
    const startedAt = now();
    const policy =
      providerId === 'chatgpt'
        ? { ...job.execution?.providerOptions?.chatgpt, transport: 'subscription_http' }
        : job.execution?.providerOptions?.codex;
    if (!job.execution || policy?.transport !== 'subscription_http' || !policy.image) {
      throw new ProviderExecutionUncertainError(
        'This job has no captured HTTP execution contract. Review it before creating another request.',
      );
    }
    const expected = resolveCodexExecutionPolicy(
      job.execution,
      job.sourceSpec,
      'subscription_http',
    );
    if (
      policy.image.model !== expected.image?.model ||
      policy.image.size !== expected.image?.size ||
      policy.image.quality !== expected.image?.quality
    ) {
      throw new Error('The saved HTTP execution contract does not match this job.');
    }
    const { quality, size, model: imageModel } = policy.image;
    const inputImages = compiled.payload.imageInputs.map((item) =>
      toInputImagePart(item, readFile),
    );
    const token = await getAccessToken();
    const payload = {
      model: job.execution.model,
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
          model: imageModel,
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
    job.signal?.throwIfAborted();
    job.checkpointRemoteExecution({ providerId, phase: 'submitting', startedAt });
    try {
      response = await fetchImpl(`${CODEX_RESPONSES_BASE_URL}/responses`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        redirect: 'error',
        signal: requestSignal,
      });
    } catch (error) {
      throw new ProviderExecutionUncertainError(
        `ChatGPT HTTP submission could not be confirmed. Review this job before sending another request. ${responseSnippet(error instanceof Error ? error.message : '', [token])}`,
      );
    }

    let raw = '';
    try {
      raw = await readResponseTextLimited(response, 32 * 1024 * 1024);
    } catch {
      throw new ProviderExecutionUncertainError(
        'ChatGPT HTTP response was interrupted. The provider may still have generated an image. Review this job before sending another request.',
      );
    }
    if (job.signal?.aborted) {
      throw new ProviderExecutionUncertainError(
        'Local observation stopped after HTTP submission. Remote cancellation is not confirmed.',
      );
    }
    const retryAfterSeconds = readRetryAfter(response.headers.get('retry-after'), now());
    if (response.status >= 500) {
      const failure = classifyCodexHttpFailure(response.status, raw, [token], retryAfterSeconds);
      throw new ProviderExecutionUncertainError(
        `ChatGPT HTTP returned ${response.status} after submission. Review this job before sending another request. ${failure.message}`,
        { cause: failure },
      );
    }
    if (!response.ok) {
      const failure = classifyCodexHttpFailure(response.status, raw, [token], retryAfterSeconds);
      if (response.status === 401) invalidateAccessToken(failure.message);
      job.checkpointRemoteExecution({ providerId, phase: 'failed', startedAt });
      throw failure;
    }

    const events = parseSseJson(raw);
    for (const event of events) {
      if (isFailedSseEvent(event)) {
        job.checkpointRemoteExecution({ providerId, phase: 'failed', startedAt });
        const failure = classifySseFailure(event, [token], retryAfterSeconds);
        if (failure.code === 'invalid_grant') invalidateAccessToken(failure.message);
        throw failure;
      }
    }
    let finalB64: string | null = null;
    for (const event of events) {
      const found = extractImageCandidates(event);
      if (found.final) finalB64 = found.final;
    }
    if (!finalB64) {
      throw new ProviderExecutionUncertainError(
        'ChatGPT HTTP returned no final image. Review the existing request before creating another job.',
      );
    }

    try {
      const result = storeInlineImageResult({
        providerId,
        providerSlug: providerId === 'chatgpt' ? 'chatgpt-http' : 'codex-http',
        model: imageModel,
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
      job.checkpointRemoteExecution({ providerId, phase: 'completed', startedAt });
      return result;
    } catch {
      throw new ProviderExecutionUncertainError(
        'ChatGPT HTTP returned a result, but Studio could not save it. Review the result before creating another job.',
      );
    }
  };
}
