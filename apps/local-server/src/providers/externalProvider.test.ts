import { describe, expect, it } from 'vite-plus/test';

import { createGenerationTaskSpec } from '../../../../packages/shared/src';
import type { TurnResult } from '../codex/turn';
import { createExternalGenerationProvider } from './externalProvider';
import { getExternalProviderRuntimePreflight } from './runtimeConfig';

function turnResult(overrides: Partial<TurnResult> = {}): TurnResult {
  return {
    assets: [],
    transcript: 'transcripts/external/job-1.jsonl',
    turnId: null,
    threadId: null,
    durationMs: 10,
    ...overrides,
  };
}

describe('externalProvider', () => {
  it('fails with preflight diagnostics before execution and does not expose secrets', async () => {
    const provider = createExternalGenerationProvider({
      readPreflight: (providerId) => getExternalProviderRuntimePreflight(providerId, {}),
    });

    await expect(
      provider.run({
        id: 'job-fal',
        projectId: 'project-1',
        providerId: 'fal',
        prompt: 'small brass key',
        execution: null,
      }),
    ).rejects.toThrow('Missing Provider Secret source: FAL_KEY or FAL_API_KEY.');
  });

  it('keeps configured Provider Secret values backend-only when executor is not wired', async () => {
    const provider = createExternalGenerationProvider({
      readPreflight: (providerId) =>
        getExternalProviderRuntimePreflight(providerId, {
          GOOGLE_API_KEY: 'secret-google-value',
        }),
      createDefaultExecutors: () => ({}),
    });

    let message = '';
    try {
      await provider.run({
        id: 'job-google',
        projectId: 'project-1',
        providerId: 'google',
        prompt: 'glass owl',
        execution: null,
      });
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }

    expect(message).toContain('no execution executor wired yet');
    expect(message).toContain('api_request');
    expect(message).not.toContain('secret-google-value');
  });

  it('delegates compiled provider input to an injected executor', async () => {
    const calls: unknown[] = [];
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-google',
      task: 'style_preset_card',
      providerId: 'google',
      prompt: 'glass owl',
      stylePresetId: 'SP09-006',
      output: { imageSize: '1024x1536', aspectRatio: '2:3' },
    });
    const provider = createExternalGenerationProvider({
      readPreflight: (providerId) =>
        getExternalProviderRuntimePreflight(providerId, {
          GOOGLE_API_KEY: 'secret-google-value',
        }),
      execute: async (context) => {
        calls.push(context);
        return turnResult({
          assets: [{ type: 'file', sourcePath: 'D:/out/image.png', mimeType: 'image/png' }],
        });
      },
    });

    const result = await provider.run({
      id: 'job-google',
      projectId: 'project-1',
      providerId: 'google',
      prompt: 'fallback prompt',
      execution: { model: 'nano-banana', reasoningEffort: 'minimal', serviceTier: null },
      sourceSpec,
    });

    expect(result.assets).toHaveLength(1);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      providerId: 'google',
      compiledInput: {
        providerId: 'google',
        payloadKind: 'api_request',
        sourceSpecId: 'spec-google',
      },
      preflight: {
        secretState: 'configured',
        secretSource: 'GOOGLE_API_KEY',
      },
    });
    expect(JSON.stringify(calls)).not.toContain('secret-google-value');
  });

  it('delegates to a provider-specific executor registry without enabling other providers', async () => {
    const calls: unknown[] = [];
    const provider = createExternalGenerationProvider({
      readPreflight: (providerId) =>
        getExternalProviderRuntimePreflight(providerId, {
          GOOGLE_API_KEY: 'secret-google-value',
        }),
      createDefaultExecutors: () => ({}),
      executors: {
        google: async (context) => {
          calls.push(context);
          return turnResult({
            assets: [{ type: 'file', sourcePath: 'D:/out/google.png', mimeType: 'image/png' }],
          });
        },
      },
    });

    const result = await provider.run({
      id: 'job-google',
      projectId: 'project-1',
      providerId: 'google',
      prompt: 'glass owl',
      execution: null,
    });

    expect(result.assets[0]?.sourcePath).toBe('D:/out/google.png');
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      providerId: 'google',
      compiledInput: {
        providerId: 'google',
        payloadKind: 'api_request',
      },
    });
    expect(JSON.stringify(calls)).not.toContain('secret-google-value');

    await expect(
      provider.run({
        id: 'job-fal',
        projectId: 'project-1',
        providerId: 'fal',
        prompt: 'small brass key',
        execution: null,
      }),
    ).rejects.toThrow('Provider runtime preflight failed for fal');
  });
});
