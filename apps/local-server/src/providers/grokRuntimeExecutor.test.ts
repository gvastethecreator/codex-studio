import { describe, expect, it } from 'vitest';

import { createGenerationTaskSpec } from '../../../../packages/shared/src';
import type { TurnResult } from '../codex/turn';
import { createGrokRuntimeExecutor } from './grokRuntimeExecutor';
import { SubscriptionHttpError } from './subscriptionHttpError';
import { compileGrokImagineInput } from './grokImagineInput';
import type { ProviderRuntimePreflight } from './runtimeConfig';

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

function turnResult(): TurnResult {
  return {
    assets: [{ type: 'file', sourcePath: 'out.png', mimeType: 'image/png' }],
    transcript: 't.json',
    turnId: null,
    threadId: null,
    durationMs: 5,
  };
}

function context() {
  const sourceSpec = createGenerationTaskSpec({
    id: 'spec-grok',
    task: 'image_generate',
    providerId: 'grok',
    prompt: 'banner',
  });
  const job = {
    id: 'job-grok',
    workspaceId: 'workspace-1',
    providerId: 'grok' as const,
    prompt: 'banner',
    execution: null,
    sourceSpec,
  };
  return {
    providerId: 'grok' as const,
    job,
    compiledInput: compileGrokImagineInput(job),
    preflight: READY_PREFLIGHT,
  };
}

describe('grok runtime executor fallback', () => {
  it('uses HTTP when ready and skips CLI', async () => {
    const calls: string[] = [];
    const executor = createGrokRuntimeExecutor({
      isHttpReady: () => true,
      canUseCli: () => true,
      http: async () => {
        calls.push('http');
        return turnResult();
      },
      cli: async () => {
        calls.push('cli');
        return turnResult();
      },
    });
    await executor(context());
    expect(calls).toEqual(['http']);
  });

  it('falls back to CLI for empty HTTP responses and not for invalid_grant', async () => {
    const allowed = createGrokRuntimeExecutor({
      isHttpReady: () => true,
      canUseCli: () => true,
      http: async () => {
        throw new SubscriptionHttpError('empty', { code: 'empty_response', fallbackAllowed: true });
      },
      cli: async () => turnResult(),
    });
    await expect(allowed(context())).resolves.toMatchObject({ transcript: 't.json' });

    const blocked = createGrokRuntimeExecutor({
      isHttpReady: () => true,
      canUseCli: () => true,
      http: async () => {
        throw new SubscriptionHttpError('relogin', {
          code: 'invalid_grant',
          fallbackAllowed: false,
        });
      },
      cli: async () => turnResult(),
    });
    await expect(blocked(context())).rejects.toMatchObject({ code: 'invalid_grant' });
  });
});
