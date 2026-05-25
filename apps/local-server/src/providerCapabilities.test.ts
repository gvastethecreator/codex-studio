import { describe, expect, it } from 'vite-plus/test';

import { getProviderExecutionBlocker, readProviderCapabilities } from './providerCapabilities';

describe('providerCapabilities', () => {
  it('reports configured provider state without returning secret values', () => {
    const report = readProviderCapabilities(
      { defaultProviderId: 'google' },
      {
        GOOGLE_API_KEY: 'secret-google-key',
        FAL_KEY: undefined,
        COMFY_API_URL: 'http://127.0.0.1:8188',
      },
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
          status: 'planned',
        }),
      ]),
    );
    expect(JSON.stringify(report)).not.toContain('secret-google-key');
  });

  it('blocks planned or unknown providers from job execution', () => {
    const report = readProviderCapabilities(
      { defaultProviderId: 'google' },
      {
        GOOGLE_API_KEY: 'secret-google-key',
        FAL_KEY: 'secret-fal-key',
      },
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
});
