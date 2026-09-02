import { describe, expect, it } from 'vite-plus/test';

import { createGenerationTaskSpec } from '../../../../packages/shared/src';
import { compileGrokImagineInput } from './grokImagineInput';
import {
  createGrokImagineHttpExecutor,
  isAllowedXaiImageUrl,
  resolveGrokImagineHttpModel,
  resolveXaiApiEndpointBase,
} from './grokImagineHttpExecutor';
import type { ProviderRuntimePreflight } from './runtimeConfig';
import { SubscriptionHttpError } from './subscriptionHttpError';

const PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const READY_PREFLIGHT: ProviderRuntimePreflight = {
  providerId: 'grok',
  runtimeKind: 'subscription_http',
  secretState: 'not_required',
  secretSource: null,
  localRuntimeState: 'configured',
  localRuntimeSource: 'grok',
  canAttemptExecution: true,
  diagnostics: [],
};

function inputToUrl(input: string | URL | Request) {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function createContext() {
  const sourceSpec = createGenerationTaskSpec({
    id: 'spec-grok',
    task: 'image_generate',
    providerId: 'grok',
    prompt: 'stone keep at dusk',
    output: { aspectRatio: '16:9', count: 1 },
  });
  const job = {
    id: 'job-grok',
    workspaceId: 'workspace-1',
    providerId: 'grok' as const,
    prompt: 'fallback',
    execution: { model: 'grok-4.5', reasoningEffort: 'low' as const, serviceTier: null },
    sourceSpec,
  };
  return {
    providerId: 'grok' as const,
    job,
    compiledInput: compileGrokImagineInput(job),
    preflight: READY_PREFLIGHT,
  };
}

function createEditContext() {
  const sourceSpec = createGenerationTaskSpec({
    id: 'spec-grok-edit',
    task: 'image_edit',
    providerId: 'grok',
    prompt: 'make the keep larger',
    assets: [{ role: 'input', name: 'keep.png', localPath: 'D:/studio-library/keep.png' }],
  });
  const job = {
    id: 'job-grok-edit',
    workspaceId: 'workspace-1',
    providerId: 'grok' as const,
    prompt: 'fallback',
    execution: { model: 'grok-4.5', reasoningEffort: 'low' as const, serviceTier: null },
    sourceSpec,
  };
  return {
    providerId: 'grok' as const,
    job,
    compiledInput: compileGrokImagineInput(job),
    preflight: READY_PREFLIGHT,
  };
}

describe('Grok Imagine HTTP executor', () => {
  it('accepts hosted image URLs only from xAI over HTTPS', () => {
    expect(isAllowedXaiImageUrl('https://cdn.x.ai/out.png')).toBe(true);
    expect(isAllowedXaiImageUrl('https://x.ai/out.png')).toBe(true);
    expect(isAllowedXaiImageUrl('http://cdn.x.ai/out.png')).toBe(false);
    expect(isAllowedXaiImageUrl('https://x.ai.evil.example/out.png')).toBe(false);
    expect(isAllowedXaiImageUrl('https://127.0.0.1/out.png')).toBe(false);
  });

  it('never sends an OAuth token to XAI_BASE_URL overrides', () => {
    expect(resolveXaiApiEndpointBase({ XAI_BASE_URL: 'https://token-sink.example/v1' })).toBe(
      'https://api.x.ai/v1',
    );
    expect(
      resolveXaiApiEndpointBase({
        XAI_API_KEY: 'explicit-api-key',
        XAI_BASE_URL: 'https://proxy.example/v1/',
      }),
    ).toBe('https://proxy.example/v1');
    expect(() =>
      resolveXaiApiEndpointBase({
        XAI_API_KEY: 'explicit-api-key',
        XAI_BASE_URL: 'http://proxy.example/v1',
      }),
    ).toThrow('must use HTTPS');
  });

  it('maps chat models to grok-imagine-image and stores inline PNG without leaking the token', async () => {
    expect(resolveGrokImagineHttpModel('grok-4.5', {})).toBe('grok-imagine-image');
    const writes: Array<{ filePath: string; content: unknown }> = [];
    const fetchMock = async (input: string | URL | Request, init?: RequestInit) => {
      expect(inputToUrl(input)).toBe('https://api.x.ai/v1/images/generations');
      if (typeof init?.body !== 'string') throw new Error('Expected string request body.');
      const body = JSON.parse(init.body) as Record<string, unknown>;
      expect(body.model).toBe('grok-imagine-image');
      expect(body.response_format).toBe('b64_json');
      expect(body.aspect_ratio).toBe('16:9');
      expect(JSON.stringify(init?.headers)).toContain('xai-secret');
      return new Response(JSON.stringify({ data: [{ b64_json: PNG_B64 }] }), {
        headers: { 'content-type': 'application/json' },
      });
    };
    const executor = createGrokImagineHttpExecutor({
      env: { XAI_API_KEY: 'xai-secret' },
      fetch: fetchMock,
      getAccessToken: async () => 'xai-secret',
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: ((filePath, content) => {
        writes.push({ filePath: String(filePath), content });
      }) as typeof import('node:fs').writeFileSync,
      now: () => 1000,
    });

    const result = await executor(createContext());
    expect(result.assets[0]?.mimeType).toBe('image/png');
    const transcript = writes.find((write) => write.filePath.includes('transcripts'));
    expect(String(transcript?.content)).not.toContain('xai-secret');
  });

  it('classifies xAI 403 as an entitlement failure that may fall back to CLI', async () => {
    const executor = createGrokImagineHttpExecutor({
      env: { XAI_API_KEY: 'xai-secret' },
      fetch: async () =>
        new Response(JSON.stringify({ error: { message: 'tier denied' } }), { status: 403 }),
      getAccessToken: async () => 'xai-secret',
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: (() => undefined) as typeof import('node:fs').writeFileSync,
    });
    try {
      await executor(createContext());
      throw new Error('expected failure');
    } catch (error) {
      expect(error).toBeInstanceOf(SubscriptionHttpError);
      expect(error).toMatchObject({ code: 'entitlement_denied', fallbackAllowed: true });
    }
  });

  it('classifies a dropped HTTP connection as a timeout that may fall back to CLI', async () => {
    const executor = createGrokImagineHttpExecutor({
      env: { XAI_API_KEY: 'xai-secret' },
      fetch: async () => {
        throw new TypeError('fetch failed');
      },
      getAccessToken: async () => 'xai-secret',
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: (() => undefined) as typeof import('node:fs').writeFileSync,
    });
    await expect(executor(createContext())).rejects.toMatchObject({
      code: 'timeout',
      fallbackAllowed: true,
    });
  });

  it('posts image_url objects for edits and maps chat models to grok-imagine-image', async () => {
    const fetchMock = async (_input: string | URL | Request, init?: RequestInit) => {
      if (typeof init?.body !== 'string') throw new Error('Expected string request body.');
      const body = JSON.parse(init.body) as Record<string, unknown>;
      expect(body.model).toBe('grok-imagine-image');
      expect(body.response_format).toBe('b64_json');
      expect(body.image).toEqual({
        url: expect.stringMatching(/^data:image\/png;base64,/),
        type: 'image_url',
      });
      expect(body.images).toBeUndefined();
      return new Response(JSON.stringify({ data: [{ b64_json: PNG_B64 }] }), {
        headers: { 'content-type': 'application/json' },
      });
    };
    const executor = createGrokImagineHttpExecutor({
      env: {},
      fetch: fetchMock,
      getAccessToken: async () => 'xai-secret',
      readFile: () => new Uint8Array([1, 2, 3]),
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: (() => undefined) as typeof import('node:fs').writeFileSync,
      now: () => 1000,
    });
    await executor(createEditContext());
  });

  it('falls back to CLI when a hosted image URL cannot be downloaded', async () => {
    const fetchMock = async (input: string | URL | Request) => {
      const url = inputToUrl(input);
      if (url.endsWith('/images/generations')) {
        return new Response(JSON.stringify({ data: [{ url: 'https://cdn.x.ai/out.png' }] }), {
          headers: { 'content-type': 'application/json' },
        });
      }
      return new Response('unavailable', { status: 503 });
    };
    const executor = createGrokImagineHttpExecutor({
      env: {},
      fetch: fetchMock,
      getAccessToken: async () => 'xai-secret',
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: (() => undefined) as typeof import('node:fs').writeFileSync,
    });
    await expect(executor(createContext())).rejects.toMatchObject({
      code: 'timeout',
      fallbackAllowed: true,
    });
  });

  it('does not misclassify Studio Library write failures as provider timeouts', async () => {
    const fetchMock = async (input: string | URL | Request) => {
      const url = inputToUrl(input);
      if (url.endsWith('/images/generations')) {
        return new Response(JSON.stringify({ data: [{ url: 'https://cdn.x.ai/out.png' }] }), {
          headers: { 'content-type': 'application/json' },
        });
      }
      return new Response(Buffer.from(PNG_B64, 'base64'), {
        headers: { 'content-type': 'image/png' },
      });
    };
    const executor = createGrokImagineHttpExecutor({
      env: {},
      fetch: fetchMock,
      getAccessToken: async () => 'xai-secret',
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: (() => {
        throw new Error('disk full');
      }) as typeof import('node:fs').writeFileSync,
    });

    await expect(executor(createContext())).rejects.toThrow('disk full');
  });

  it('invalidates rejected OAuth credentials', async () => {
    const invalidations: string[] = [];
    const executor = createGrokImagineHttpExecutor({
      env: {},
      fetch: async () =>
        new Response(JSON.stringify({ error: { message: 'rejected' } }), { status: 401 }),
      getAccessToken: async () => 'xai-secret',
      invalidateAccessToken: (message) => invalidations.push(message),
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: (() => undefined) as typeof import('node:fs').writeFileSync,
    });

    await expect(executor(createContext())).rejects.toMatchObject({ code: 'invalid_grant' });
    expect(invalidations).toEqual(['rejected']);
  });
});
