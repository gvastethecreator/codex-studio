import { describe, expect, it, vi } from 'vitest';

import { createGenerationTaskSpec } from '../../../../packages/shared/src';
import { createCodexResponsesImageExecutor } from './codexResponsesImageExecutor';
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

describe('codex responses image executor', () => {
  it('saves only a final image_generation_call result from SSE', async () => {
    const writes: Array<{ filePath: string; content: unknown }> = [];
    let payload: Record<string, unknown> | undefined;
    const executor = createCodexResponsesImageExecutor({
      getAccessToken: async () => 'codex-secret',
      fetch: async (_url, init) => {
        payload = JSON.parse(typeof init?.body === 'string' ? init.body : '{}') as Record<
          string,
          unknown
        >;
        return new Response(
          [
            'event: response.output_item.done',
            `data: {"type":"image_generation_call","partial_image_b64":"partial","result":"${PNG_B64}"}`,
            '',
            'data: [DONE]',
            '',
          ].join('\n'),
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
      id: 'job-codex',
      workspaceId: 'workspace-1',
      prompt: 'stone keep',
      checkpointRemoteExecution: vi.fn(),
      execution: httpExecution('1536x864'),
      sourceSpec: createGenerationTaskSpec({
        id: 'spec-wide',
        task: 'image_generate',
        providerId: 'codex',
        prompt: 'stone keep',
        output: { aspectRatio: '16:9', imageSize: '1536x864' },
      }),
    });
    expect(result.assets).toHaveLength(1);
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
    const executor = createCodexResponsesImageExecutor({
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
    const executor = createCodexResponsesImageExecutor({
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

  it('reports HTTP usage exhaustion as a route-specific limit instead of empty output', async () => {
    const executor = createCodexResponsesImageExecutor({
      getAccessToken: async () => 'codex-secret',
      fetch: async () =>
        new Response(JSON.stringify({ error: { message: 'The usage limit has been reached' } }), {
          status: 429,
        }),
    });

    await expect(
      executor({
        id: 'job-http-usage-limit',
        workspaceId: 'workspace-1',
        prompt: 'stone keep',
        checkpointRemoteExecution: vi.fn(),
        execution: httpExecution(),
      }),
    ).rejects.toMatchObject({
      code: 'source_limit',
      fallbackAllowed: false,
      message: expect.stringContaining('GPT-Reserve'),
    } satisfies Partial<SubscriptionHttpError>);
  });

  it('does not fall back when the SSE reports a failed or moderated response', async () => {
    const executor = createCodexResponsesImageExecutor({
      getAccessToken: async () => 'codex-secret',
      fetch: async () =>
        new Response(
          [
            'event: response.failed',
            'data: {"type":"response.failed","error":{"message":"safety system rejected codex-secret\\u0000"}}',
            '',
          ].join('\n'),
          { headers: { 'content-type': 'text/event-stream' } },
        ),
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: (() => undefined) as typeof import('node:fs').writeFileSync,
    });
    await expect(
      executor({
        id: 'job-moderation',
        workspaceId: 'workspace-1',
        prompt: 'stone keep',
        checkpointRemoteExecution: vi.fn(),
        execution: httpExecution(),
      }),
    ).rejects.toMatchObject({
      code: 'moderation',
      fallbackAllowed: false,
      message: 'safety system rejected [redacted]',
    } satisfies Partial<SubscriptionHttpError>);
  });

  it('invalidates rejected credentials and redacts the access token from the error', async () => {
    const invalidations: string[] = [];
    const executor = createCodexResponsesImageExecutor({
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
    ).rejects.toMatchObject({ code: 'invalid_grant', message: 'rejected [redacted]' });
    expect(invalidations).toEqual(['rejected [redacted]']);
  });

  it('rejects source images beyond the HTTP limit before reading credentials', async () => {
    const assets = Array.from({ length: 17 }, (_, index) => ({
      role: 'input' as const,
      name: `source-${index}.png`,
      localPath: `D:/inputs/source-${index}.png`,
    }));
    const executor = createCodexResponsesImageExecutor({
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
    const executor = createCodexResponsesImageExecutor({ getAccessToken, fetch });
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
      expect(stored).toMatchObject({ providerId: 'codex', phase: 'submitting' });
      throw new Error('socket closed codex-secret');
    });
    const executor = createCodexResponsesImageExecutor({
      getAccessToken: async () => 'codex-secret',
      fetch,
    });
    await expect(
      executor({
        id: 'lost',
        workspaceId: 'a',
        prompt: 'prompt',
        execution: httpExecution(),
        checkpointRemoteExecution,
      }),
    ).rejects.toMatchObject({
      code: 'execution_uncertain',
      message: expect.not.stringContaining('codex-secret'),
    });
    const restarted = createCodexResponsesImageExecutor({
      getAccessToken: async () => 'codex-secret',
      fetch,
    });
    await expect(
      restarted({
        id: 'lost',
        workspaceId: 'a',
        prompt: 'prompt',
        execution: httpExecution(),
        remoteExecution: stored,
        checkpointRemoteExecution,
      }),
    ).rejects.toMatchObject({ code: 'execution_uncertain' });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
