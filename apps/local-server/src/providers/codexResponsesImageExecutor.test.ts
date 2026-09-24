import { describe, expect, it, vi } from 'vitest';

import { createGenerationTaskSpec } from '../../../../packages/shared/src';
import { createChatgptResponsesImageExecutor } from './chatgptResponsesImageExecutor';
import {
  CODEX_HTTP_EXECUTION_DEFAULTS,
  CODEX_HTTP_IMAGE_MODEL,
  CODEX_HTTP_IMAGE_MODELS,
  type JobExecutionOptions,
  type JobRemoteExecution,
  resolveCodexExecutionPolicy,
} from '../../../../packages/shared/src';
import { SubscriptionHttpError } from './subscriptionHttpError';

const PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

function httpExecution(size = '1024x1024'): JobExecutionOptions {
  return {
    ...CODEX_HTTP_EXECUTION_DEFAULTS,
    providerOptions: {
      codex: {
        transport: 'subscription_http',
        image: { model: CODEX_HTTP_IMAGE_MODEL, size, quality: 'medium' },
      },
    },
  };
}

describe('ChatGPT responses image executor and captured Codex HTTP jobs', () => {
  it('sends a ChatGPT reference and saves only the final image result without an app-server thread', async () => {
    const writes: Array<{ filePath: string; content: unknown }> = [];
    let payload: Record<string, unknown> | undefined;
    const executor = createChatgptResponsesImageExecutor({
      readFile: () => Buffer.from(PNG_B64, 'base64'),
      getAccessToken: async () => 'codex-secret',
      fetch: async (_url, init) => {
        payload = JSON.parse(typeof init?.body === 'string' ? init.body : '{}') as Record<
          string,
          unknown
        >;
        const raw = [
          'event: response.output_item.done',
          `data: {"type":"image_generation_call","partial_image_b64":"partial","result":"${PNG_B64}"}`,
          '',
          'data: [DONE]',
          '',
        ].join('\n');
        return new Response(
          new ReadableStream<Uint8Array>({
            start(controller) {
              const bytes = new TextEncoder().encode(raw);
              controller.enqueue(bytes.slice(0, 23));
              controller.enqueue(bytes.slice(23, 57));
              controller.enqueue(bytes.slice(57));
              controller.close();
            },
          }),
          { headers: { 'content-type': 'text/event-stream' } },
        );
      },
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: ((filePath, content) => {
        writes.push({ filePath: String(filePath), content });
      }) as typeof import('node:fs').writeFileSync,
      now: () => 1,
    });
    const result = await executor({
      id: 'job-chatgpt',
      providerId: 'chatgpt',
      workspaceId: 'workspace-1',
      prompt: 'stone keep',
      checkpointRemoteExecution: vi.fn(),
      execution: {
        ...CODEX_HTTP_EXECUTION_DEFAULTS,
        providerOptions: {
          chatgpt: {
            image: { model: CODEX_HTTP_IMAGE_MODEL, size: '1536x864', quality: 'medium' },
          },
        },
      },
      sourceSpec: createGenerationTaskSpec({
        id: 'spec-wide',
        task: 'image_generate',
        providerId: 'chatgpt',
        prompt: 'stone keep',
        assets: [{ role: 'reference', name: 'ref.png', localPath: 'D:/studio-library/ref.png' }],
        output: { aspectRatio: '16:9', imageSize: '1536x864' },
      }),
    });
    expect(result.assets).toHaveLength(1);
    expect(result).toMatchObject({ threadId: null, turnId: null });
    expect(payload).toMatchObject({
      input: [
        {
          content: [
            expect.objectContaining({ type: 'input_text' }),
            { type: 'input_image', image_url: `data:image/png;base64,${PNG_B64}` },
          ],
        },
      ],
    });
    expect(payload).toMatchObject({
      model: 'gpt-5.5',
      tools: [
        {
          type: 'image_generation',
          model: CODEX_HTTP_IMAGE_MODEL,
          size: '1536x864',
          quality: 'medium',
        },
      ],
    });
    expect(payload).not.toHaveProperty('reasoning');
    expect(payload).not.toHaveProperty('service_tier');
    const transcript = writes.find((write) => String(write.filePath).includes('transcripts'));
    expect(String(transcript?.content)).not.toContain('codex-secret');
  });

  it('sends a 4K ChatGPT image size on the HTTP tool', async () => {
    let payload: Record<string, unknown> | undefined;
    const executor = createChatgptResponsesImageExecutor({
      getAccessToken: async () => 'codex-secret',
      fetch: async (_url, init) => {
        payload = JSON.parse(typeof init?.body === 'string' ? init.body : '{}') as Record<
          string,
          unknown
        >;
        return new Response(
          [
            'event: response.output_item.done',
            `data: {"type":"image_generation_call","result":"${PNG_B64}"}`,
            '',
            'data: [DONE]',
            '',
          ].join('\n'),
          { headers: { 'content-type': 'text/event-stream' } },
        );
      },
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: (() => undefined) as typeof import('node:fs').writeFileSync,
      now: () => 1,
    });
    await executor({
      id: 'job-4k',
      workspaceId: 'workspace-1',
      prompt: 'stone keep',
      checkpointRemoteExecution: vi.fn(),
      execution: httpExecution('3840x2160'),
      sourceSpec: createGenerationTaskSpec({
        id: 'spec-4k',
        task: 'image_generate',
        providerId: 'codex',
        prompt: 'stone keep',
        output: { aspectRatio: '16:9', imageSize: '3840x2160' },
      }),
    });
    expect(payload).toMatchObject({
      tools: [{ type: 'image_generation', size: '3840x2160' }],
    });
  });

  it('accepts each available GPT Image contract without changing the selected model', () => {
    for (const imageModel of CODEX_HTTP_IMAGE_MODELS) {
      const policy = resolveCodexExecutionPolicy(
        {
          ...CODEX_HTTP_EXECUTION_DEFAULTS,
          providerOptions: {
            codex: { transport: 'subscription_http', imageModel: imageModel.id },
          },
        },
        { output: { aspectRatio: '1:1' }, assets: [] },
        'subscription_http',
      );
      expect(policy.image?.model).toBe(imageModel.id);
    }
  });

  it('keeps a tool-less stream uncertain without permitting another submission', async () => {
    const executor = createChatgptResponsesImageExecutor({
      getAccessToken: async () => 'codex-secret',
      fetch: async () =>
        new Response('data: {"type":"response.completed"}\n\n', {
          headers: { 'content-type': 'text/event-stream' },
        }),
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: (() => undefined) as typeof import('node:fs').writeFileSync,
    });
    await expect(
      executor({
        id: 'job-empty',
        workspaceId: 'workspace-1',
        prompt: 'stone keep',
        checkpointRemoteExecution: vi.fn(),
        execution: httpExecution(),
      }),
    ).rejects.toMatchObject({
      code: 'execution_uncertain',
    });
  });

  it('reports ChatGPT 403 as entitlement without switching transports', async () => {
    const executor = createChatgptResponsesImageExecutor({
      getAccessToken: async () => 'codex-secret',
      fetch: async () =>
        new Response(JSON.stringify({ error: { message: 'forbidden' } }), { status: 403 }),
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: (() => undefined) as typeof import('node:fs').writeFileSync,
    });
    await expect(
      executor({
        id: 'job-forbidden',
        workspaceId: 'workspace-1',
        prompt: 'stone keep',
        checkpointRemoteExecution: vi.fn(),
        execution: httpExecution(),
      }),
    ).rejects.toMatchObject({
      code: 'entitlement_denied',
      fallbackAllowed: false,
      httpStatus: 403,
    } satisfies Partial<SubscriptionHttpError>);
  });

  it.each([
    {
      status: 429,
      error: { code: 'insufficient_quota', message: 'Usage exhausted' },
      expected: 'source_limit',
    },
    {
      status: 429,
      error: { code: 'rate_limit_exceeded', message: 'The usage limit has been reached' },
      expected: 'rate_limit',
    },
    { status: 429, error: { message: 'Too many requests' }, expected: 'rate_limit' },
    {
      status: 429,
      error: { message: 'The usage limit has been reached' },
      expected: 'source_limit',
    },
    {
      status: 400,
      error: { code: 'access_denied', message: 'Rate limit' },
      expected: 'entitlement_denied',
    },
  ])(
    'classifies HTTP $status/$expected from structured codes before text',
    async ({ status, error, expected }) => {
      const executor = createChatgptResponsesImageExecutor({
        getAccessToken: async () => 'codex-secret',
        fetch: async () =>
          new Response(JSON.stringify({ error }), { status, headers: { 'Retry-After': '30' } }),
      });
      await expect(
        executor({
          id: 'job-http-limit',
          workspaceId: 'workspace-1',
          prompt: 'stone keep',
          checkpointRemoteExecution: vi.fn(),
          execution: httpExecution(),
        }),
      ).rejects.toMatchObject({ code: expected, fallbackAllowed: false, retryAfterSeconds: 30 });
    },
  );

  it.each([
    {
      event: {
        type: 'response.failed',
        response: { error: { code: 'rate_limit_exceeded', message: 'quota exhausted' } },
      },
      code: 'rate_limit',
      message: expect.stringContaining('temporarily limited'),
    },
    {
      event: {
        type: 'response.failed',
        response: { error: { code: 'insufficient_quota', message: 'retry later' } },
      },
      code: 'source_limit',
      message: expect.stringContaining('exhausted usage'),
    },
    {
      event: {
        type: 'response.failed',
        error: { message: 'safety system rejected codex-secret\u0000' },
      },
      code: 'moderation',
      message: 'safety system rejected [redacted]',
    },
    {
      event: {
        type: 'response.failed',
        response: {
          status: 'failed',
          error: { message: 'safety system rejected codex-secret\u0000' },
        },
      },
      code: 'moderation',
      message: 'safety system rejected [redacted]',
    },
    {
      event: {
        type: 'response.failed',
        response: { status: 'failed', error: { message: 'The usage limit has been reached' } },
      },
      code: 'source_limit',
      message: expect.stringContaining('this HTTP route'),
    },
    {
      event: {
        type: 'response.incomplete',
        response: { status: 'incomplete', incomplete_details: { reason: 'content_filter' } },
      },
      code: 'moderation',
      message: expect.stringContaining('content_filter'),
    },
  ])(
    'reports terminal SSE failure details: $event.type $code',
    async ({ event, code, message }) => {
      const checkpoint = vi.fn();
      const executor = createChatgptResponsesImageExecutor({
        getAccessToken: async () => 'codex-secret',
        fetch: async () =>
          new Response([`event: ${event.type}`, `data: ${JSON.stringify(event)}`, ''].join('\n'), {
            headers: { 'content-type': 'text/event-stream' },
          }),
        resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
        mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
        writeFile: (() => undefined) as typeof import('node:fs').writeFileSync,
      });
      await expect(
        executor({
          id: 'job-moderation',
          workspaceId: 'workspace-1',
          prompt: 'stone keep',
          checkpointRemoteExecution: checkpoint,
          execution: httpExecution(),
        }),
      ).rejects.toMatchObject({
        code,
        fallbackAllowed: false,
        message,
      });
      expect(checkpoint).toHaveBeenLastCalledWith(expect.objectContaining({ phase: 'failed' }));
    },
  );

  it('invalidates rejected credentials and redacts the access token from the error', async () => {
    const invalidations: string[] = [];
    const executor = createChatgptResponsesImageExecutor({
      getAccessToken: async () => 'codex-secret',
      invalidateAccessToken: (message) => invalidations.push(message),
      fetch: async () =>
        new Response(JSON.stringify({ error: { message: 'rejected codex-secret' } }), {
          status: 401,
        }),
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: (() => undefined) as typeof import('node:fs').writeFileSync,
    });

    await expect(
      executor({
        id: 'job-unauthorized',
        workspaceId: 'workspace-1',
        prompt: 'stone keep',
        checkpointRemoteExecution: vi.fn(),
        execution: httpExecution(),
      }),
    ).rejects.toMatchObject({
      code: 'invalid_grant',
      message: expect.stringContaining('rejected [redacted]'),
    });
    expect(invalidations).toEqual([expect.stringContaining('rejected [redacted]')]);
  });

  it('rejects source images beyond the HTTP limit before reading credentials', async () => {
    const assets = Array.from({ length: 17 }, (_, index) => ({
      role: 'input' as const,
      name: `source-${index}.png`,
      localPath: `D:/inputs/source-${index}.png`,
    }));
    const executor = createChatgptResponsesImageExecutor({
      getAccessToken: async () => {
        throw new Error('must not load credentials');
      },
      fetch: async () => {
        throw new Error('must not fetch');
      },
      readFile: () => new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    });
    await expect(
      executor({
        id: 'job-too-many-sources',
        workspaceId: 'workspace-1',
        prompt: 'combine sources',
        checkpointRemoteExecution: vi.fn(),
        execution: httpExecution(),
        sourceSpec: createGenerationTaskSpec({
          id: 'spec-too-many-sources',
          task: 'image_edit',
          providerId: 'codex',
          prompt: 'combine sources',
          assets,
        }),
      }),
    ).rejects.toThrow('at most 16 input images');
  });
  it('rejects unsupported execution settings before credentials or submission', async () => {
    const getAccessToken = vi.fn();
    const fetch = vi.fn();
    const executor = createChatgptResponsesImageExecutor({ getAccessToken, fetch });
    await expect(
      executor({
        id: 'invalid',
        workspaceId: 'a',
        prompt: 'prompt',
        checkpointRemoteExecution: vi.fn(),
        execution: {
          ...httpExecution(),
          model: 'gpt-5.4',
          reasoningEffort: 'high',
          serviceTier: 'fast',
        },
      }),
    ).rejects.toThrow('Apply the HTTP settings');
    expect(getAccessToken).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('records submission before POST and prevents resending after restart or lost acknowledgement', async () => {
    let stored: JobRemoteExecution | null = null;
    const checkpointRemoteExecution = (value: JobRemoteExecution) => {
      stored = JSON.parse(JSON.stringify(value)) as JobRemoteExecution;
    };
    const fetch = vi.fn(async () => {
      expect(stored).toMatchObject({ providerId: 'chatgpt', phase: 'submitting' });
      throw new Error('socket closed codex-secret');
    });
    const executor = createChatgptResponsesImageExecutor({
      getAccessToken: async () => 'codex-secret',
      fetch,
    });
    await expect(
      executor({
        id: 'lost',
        providerId: 'chatgpt',
        workspaceId: 'a',
        prompt: 'prompt',
        execution: {
          ...CODEX_HTTP_EXECUTION_DEFAULTS,
          providerOptions: {
            chatgpt: {
              image: { model: CODEX_HTTP_IMAGE_MODEL, size: '1024x1024', quality: 'medium' },
            },
          },
        },
        checkpointRemoteExecution,
      }),
    ).rejects.toMatchObject({
      code: 'execution_uncertain',
      message: expect.not.stringContaining('codex-secret'),
    });
    const restarted = createChatgptResponsesImageExecutor({
      getAccessToken: async () => 'codex-secret',
      fetch,
    });
    await expect(
      restarted({
        id: 'lost',
        providerId: 'chatgpt',
        workspaceId: 'a',
        prompt: 'prompt',
        execution: {
          ...CODEX_HTTP_EXECUTION_DEFAULTS,
          providerOptions: {
            chatgpt: {
              image: { model: CODEX_HTTP_IMAGE_MODEL, size: '1024x1024', quality: 'medium' },
            },
          },
        },
        remoteExecution: stored,
        checkpointRemoteExecution,
      }),
    ).rejects.toMatchObject({ code: 'execution_uncertain' });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
