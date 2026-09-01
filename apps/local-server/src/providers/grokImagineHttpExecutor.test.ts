import { describe, expect, it } from 'vite-plus/test';

import { createGenerationTaskSpec } from '../../../../packages/shared/src';
import { compileGrokImagineInput } from './grokImagineInput';
import {
  createGrokImagineHttpExecutor,
  resolveGrokImagineHttpModel,
} from './grokImagineHttpExecutor';
import type { ProviderRuntimePreflight } from './runtimeConfig';
import { SubscriptionHttpError } from './subscriptionHttpError';

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

describe('grok HTTP executor', () => {
  it('maps chat models to grok-imagine-image and stores inline PNG without leaking the token', async () => {
    expect(resolveGrokImagineHttpModel('grok-4.5')).toBe('grok-imagine-image');
    const writes: Array<{ filePath: string; content: unknown }> = [];
    const fetchMock = async (input: string | URL | Request, init?: RequestInit) => {
      expect(inputToUrl(input)).toBe('https://api.x.ai/v1/images/generations');
      if (typeof init?.body !== 'string') throw new Error('Expected string request body.');
      const body = JSON.parse(init.body) as Record<string, unknown>;
      expect(body.model).toBe('grok-imagine-image');
      expect(body.aspect_ratio).toBe('16:9');
      expect(JSON.stringify(init?.headers)).toContain('xai-secret');
      return new Response(JSON.stringify({ data: [{ b64_json: 'AQID' }] }), {
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
});
