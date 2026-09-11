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
  readResponseTextLimited,
  responseSnippet,
  storeInlineImageResult,
  type ExternalProviderFetch,
} from './externalProviderResults';
import { SubscriptionHttpError } from './subscriptionHttpError';
import { ProviderExecutionUncertainError } from '../workerErrors';
import { resolveCodexExecutionPolicy } from '../../../../packages/shared/src/codexExecutionContract';

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

function isUsageLimitMessage(message: string) {
  return /usage\s*(?:limit|quota)|rate[\s_-]*limit|usagelimitexceeded/i.test(message);
}

function createUsageLimitError(httpStatus?: number | null) {
  return new SubscriptionHttpError(
    'ChatGPT Sign in has no available usage for this HTTP route. Luna Reserve is available through Codex app; choose GPT-Reserve there or use separate API credits.',
    { code: 'source_limit', fallbackAllowed: false, httpStatus },
  );
}

function classifySseFailure(event: Record<string, unknown>, secrets: readonly string[]) {
  const message = sseFailureMessage(event, secrets);
  if (isUsageLimitMessage(message)) return createUsageLimitError();
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
  if (isUsageLimitMessage(message)) return createUsageLimitError(status);
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
        'This ChatGPT account is not authorized for HTTP image generation. Restore access to the accepted account before retrying.',
      { code: 'entitlement_denied', fallbackAllowed: false, httpStatus: status },
    );
  }
  if (status >= 500 || status === 429) {
    return new SubscriptionHttpError(message || `Codex Responses failed (${status}).`, {
      code: 'http_error',
      fallbackAllowed: false,
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
    if (job.remoteExecution) {
      if (job.remoteExecution.providerId === 'codex' && job.remoteExecution.phase === 'failed') {
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
    const { compileCodexImagegenInput } = await import('./codexProvider');
    const compiled = compileCodexImagegenInput(job);
    const startedAt = now();
    const policy = job.execution?.providerOptions?.codex;
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
    job.checkpointRemoteExecution({ providerId: 'codex', phase: 'submitting', startedAt });
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
    if (response.status >= 500) {
      throw new ProviderExecutionUncertainError(
        `ChatGPT HTTP returned ${response.status} after submission. Review this job before sending another request.`,
      );
    }
    if (!response.ok) {
      const failure = classifyCodexHttpFailure(response.status, summarizeCodexError(raw, [token]));
      if (response.status === 401) invalidateAccessToken(failure.message);
      job.checkpointRemoteExecution({ providerId: 'codex', phase: 'failed', startedAt });
      throw failure;
    }

    const events = parseSseJson(raw);
    for (const event of events) {
      if (isFailedSseEvent(event)) {
        job.checkpointRemoteExecution({ providerId: 'codex', phase: 'failed', startedAt });
        throw classifySseFailure(event, [token]);
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
        providerId: 'codex',
        providerSlug: 'codex-http',
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
      job.checkpointRemoteExecution({ providerId: 'codex', phase: 'completed', startedAt });
      return result;
    } catch {
      throw new ProviderExecutionUncertainError(
        'ChatGPT HTTP returned a result, but Studio could not save it. Review the result before creating another job.',
      );
    }
  };
}
