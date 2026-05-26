import { describe, expect, it } from 'vite-plus/test';

import { createGenerationProviderCapabilities } from './providerCapabilities';

describe('providerCapabilities', () => {
  it('marks Codex and dry run as executable adapters', () => {
    const report = createGenerationProviderCapabilities({
      settings: { defaultProviderId: 'codex' },
    });

    expect(report.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          providerId: 'codex',
          status: 'active',
          canExecute: true,
          isDefault: true,
          secretState: 'not_required',
        }),
        expect.objectContaining({
          providerId: 'dry_run',
          status: 'active',
          canExecute: true,
          secretState: 'not_required',
        }),
      ]),
    );
  });

  it('marks configured hosted adapters executable when concrete executors exist', () => {
    const report = createGenerationProviderCapabilities({
      settings: { defaultProviderId: 'google' },
      secretConfigured: { google: true, fal: true },
    });

    expect(report.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          providerId: 'google',
          status: 'active',
          canExecute: true,
          isDefault: true,
          secretState: 'configured',
        }),
        expect.objectContaining({
          providerId: 'fal',
          status: 'active',
          canExecute: true,
          secretState: 'configured',
        }),
      ]),
    );
  });

  it('marks configured local workflow adapters executable when runtime is ready', () => {
    const report = createGenerationProviderCapabilities({
      settings: { defaultProviderId: 'comfy' },
      localRuntimeConfigured: { comfy: true },
    });

    expect(report.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          providerId: 'comfy',
          status: 'active',
          canExecute: true,
          isDefault: true,
          secretState: 'not_required',
        }),
      ]),
    );
  });
});
