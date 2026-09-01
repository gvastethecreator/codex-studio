import { describe, expect, it } from 'vite-plus/test';

import { createGenerationTaskSpec } from '../../../../packages/shared/src';
import {
  createCodexResponsesImageExecutor,
  resolveCodexImageQuality,
  resolveCodexImageSize,
} from './codexResponsesImageExecutor';
import { SubscriptionHttpError } from './subscriptionHttpError';

const PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

describe('codex responses image executor', () => {
  it('maps quality and size from job options', () => {
    expect(resolveCodexImageQuality('gpt-image-2-high', 'low')).toBe('high');
    expect(resolveCodexImageQuality(null, 'minimal')).toBe('low');
    expect(resolveCodexImageQuality(null, null)).toBe('medium');
    const job = {
      id: 'job-1',
      workspaceId: 'workspace-1',
      prompt: 'key',
      execution: null,
      sourceSpec: createGenerationTaskSpec({
        id: 'spec-1',
        task: 'image_generate',
        providerId: 'codex',
        prompt: 'key',
        output: { aspectRatio: '2:3' },
      }),
    };
    expect(resolveCodexImageSize(job)).toBe('1024x1536');
    expect(
      resolveCodexImageSize({
        ...job,
        sourceSpec: createGenerationTaskSpec({
          id: 'spec-wide',
          task: 'image_generate',
          providerId: 'codex',
          prompt: 'key',
          output: { aspectRatio: '4:3', imageSize: '1536x1152' },
        }),
      }),
    ).toBe('1536x1024');
  });

  it('saves only a final image_generation_call result from SSE', async () => {
    const writes: Array<{ filePath: string; content: unknown }> = [];
    const executor = createCodexResponsesImageExecutor({
      getAccessToken: async () => 'codex-secret',
      fetch: async () =>
        new Response(
          [
            'event: response.output_item.done',
            `data: {"type":"image_generation_call","partial_image_b64":"partial","result":"${PNG_B64}"}`,
            '',
            'data: [DONE]',
            '',
          ].join('\n'),
          { headers: { 'content-type': 'text/event-stream' } },
        ),
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
      execution: { model: 'gpt-5.5', reasoningEffort: 'medium', serviceTier: null },
    });
    expect(result.assets).toHaveLength(1);
    const transcript = writes.find((write) => String(write.filePath).includes('transcripts'));
    expect(String(transcript?.content)).not.toContain('codex-secret');
  });

  it('treats a tool-less stream as empty_response so app-server can run', async () => {
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
        execution: null,
      }),
    ).rejects.toMatchObject({
      code: 'empty_response',
      fallbackAllowed: true,
    } satisfies Partial<SubscriptionHttpError>);
  });

  it('treats ChatGPT 403 as entitlement so app-server can still run', async () => {
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
        execution: null,
      }),
    ).rejects.toMatchObject({
      code: 'entitlement_denied',
      fallbackAllowed: true,
      httpStatus: 403,
    } satisfies Partial<SubscriptionHttpError>);
  });

  it('does not fall back when the SSE reports a failed or moderated response', async () => {
    const executor = createCodexResponsesImageExecutor({
      getAccessToken: async () => 'codex-secret',
      fetch: async () =>
        new Response(
          [
            'event: response.failed',
            'data: {"type":"response.failed","error":{"message":"safety system rejected the request"}}',
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
        execution: null,
      }),
    ).rejects.toMatchObject({
      code: 'moderation',
      fallbackAllowed: false,
    } satisfies Partial<SubscriptionHttpError>);
  });
});
