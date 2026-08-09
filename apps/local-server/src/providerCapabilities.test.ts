import { describe, expect, it } from 'vite-plus/test';

import { getProviderExecutionBlocker, readProviderCapabilities } from './providerCapabilities';

const READY_GROK_RUNTIME = {
  status: 'ready' as const,
  canRunJobs: true,
  checkedAt: '2026-08-08T00:00:00.000Z',
  selectedExecutable: 'grok',
  selectedVersion: 'grok 1.0.0',
  selectedVersionNumber: '1.0.0',
  defaultModel: 'grok-4.5',
  availableModels: ['grok-4.5'],
  headlessSupported: true,
  imagineAvailable: true,
  recommendedAction: 'Grok Imagine is ready.',
  issues: [],
  candidates: [],
};

describe('providerCapabilities', () => {
  it('reports configured provider state without returning secret values', () => {
    const report = readProviderCapabilities(
      { defaultProviderId: 'google' },
      {
        GOOGLE_API_KEY: 'secret-google-key',
        FAL_KEY: undefined,
        COMFY_API_URL: 'http://127.0.0.1:8188',
      },
      undefined,
      READY_GROK_RUNTIME,
    );

    expect(report.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          providerId: 'google',
          isDefault: true,
          secretState: 'configured',
          status: 'active',
          canExecute: true,
        }),
        expect.objectContaining({
          providerId: 'comfy',
          status: 'not_configured',
          canExecute: false,
        }),
      ]),
    );
    expect(report.providers.map((provider) => provider.providerId)).toEqual([
      'codex',
      'grok',
      'google',
      'fal',
      'comfy',
      'dry_run',
    ]);
    expect(JSON.stringify(report)).not.toContain('secret-google-key');
  });

  it('marks Comfy executable only when endpoint and workflow template are configured', () => {
    const report = readProviderCapabilities(
      { defaultProviderId: 'comfy' },
      {
        COMFY_API_URL: 'http://127.0.0.1:8188',
        COMFY_WORKFLOW_TEMPLATE_PATH: 'D:/comfy/workflows/studio.json',
      },
      undefined,
      READY_GROK_RUNTIME,
    );

    expect(report.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          providerId: 'comfy',
          isDefault: true,
          status: 'active',
          canExecute: true,
        }),
      ]),
    );
    expect(JSON.stringify(report)).not.toContain('D:/comfy/workflows/studio.json');
  });

  it('blocks planned or unknown providers from job execution', () => {
    const report = readProviderCapabilities(
      { defaultProviderId: 'google' },
      {
        GOOGLE_API_KEY: 'secret-google-key',
        FAL_KEY: 'secret-fal-key',
      },
      undefined,
      READY_GROK_RUNTIME,
    );

    expect(getProviderExecutionBlocker(report, 'codex')).toBeNull();
    expect(getProviderExecutionBlocker(report, 'dry_run')).toBeNull();
    expect(getProviderExecutionBlocker(report, 'fal')).toBeNull();
    expect(getProviderExecutionBlocker(report, 'google')).toBeNull();
    expect(getProviderExecutionBlocker(report, 'local-experiment')).toEqual(
      expect.objectContaining({
        error: 'Provider is not registered.',
        providerId: 'local-experiment',
        status: 'unknown',
      }),
    );
  });

  it('blocks Codex provider execution when runtime preflight fails', () => {
    const report = readProviderCapabilities(
      { defaultProviderId: 'codex' },
      {},
      { canRunJobs: false },
      READY_GROK_RUNTIME,
    );

    expect(report.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          providerId: 'codex',
          status: 'not_configured',
          canExecute: false,
        }),
      ]),
    );
    expect(getProviderExecutionBlocker(report, 'codex')).toEqual(
      expect.objectContaining({
        error: 'Provider cannot execute jobs yet.',
        providerId: 'codex',
      }),
    );
  });

  it('enables Grok only from local CLI readiness and never from a Provider Secret', () => {
    const ready = readProviderCapabilities(
      { defaultProviderId: 'grok' },
      {},
      undefined,
      READY_GROK_RUNTIME,
    );
    expect(ready.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          providerId: 'grok',
          runtimeKind: 'agent_cli',
          isDefault: true,
          secretState: 'not_required',
          canExecute: true,
        }),
      ]),
    );
  });
});
