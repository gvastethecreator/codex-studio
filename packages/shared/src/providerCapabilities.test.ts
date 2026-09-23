import { describe, expect, it } from 'vitest';

import { createGenerationProviderCapabilities } from './providerCapabilities';

describe('providerCapabilities', () => {
  it('keeps ChatGPT executable without Codex and does not make Codex executable from HTTP auth', () => {
    const report = createGenerationProviderCapabilities({
      settings: { defaultProviderId: 'codex' },
      localRuntimeConfigured: { codex: false },
      subscriptionAuthConfigured: { chatgpt: true },
      subscriptionAuthState: { chatgpt: 'logged_in' },
    });

    expect(report.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          providerId: 'chatgpt',
          runtimeKind: 'subscription_http',
          canExecute: true,
          subscriptionAuthState: 'logged_in',
          secretState: 'configured',
        }),
        expect.objectContaining({ providerId: 'codex', canExecute: false }),
      ]),
    );
  });
  it('keeps the Codex app-server provider independent from HTTP auth', () => {
    const report = createGenerationProviderCapabilities({
      settings: { defaultProviderId: 'codex' },
      localRuntimeConfigured: { codex: true },
      subscriptionAuthConfigured: { chatgpt: true },
      subscriptionAuthState: { chatgpt: 'logged_in' },
    });

    expect(report.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          providerId: 'codex',
          runtimeKind: 'codex_app_server',
          canExecute: true,
          subscriptionAuthState: 'not_applicable',
        }),
      ]),
    );
  });

  it('marks Codex and dry run as executable adapters', () => {
    const report = createGenerationProviderCapabilities({
      settings: { defaultProviderId: 'codex' },
      localRuntimeConfigured: { codex: true },
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

  it('marks Google executable from OAuth without an API key', () => {
    const report = createGenerationProviderCapabilities({
      settings: { defaultProviderId: 'google' },
      subscriptionAuthConfigured: { google: true },
      subscriptionAuthState: { google: 'logged_in' },
    });

    expect(report.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          providerId: 'google',
          runtimeKind: 'hosted_api',
          status: 'active',
          canExecute: true,
          subscriptionAuthState: 'logged_in',
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

  it('marks Antigravity executable only when its local runtime is ready', () => {
    const report = createGenerationProviderCapabilities({
      settings: { defaultProviderId: 'antigravity' },
      localRuntimeConfigured: { antigravity: true },
    });

    expect(report.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          providerId: 'antigravity',
          runtimeKind: 'agent_cli',
          status: 'active',
          canExecute: true,
          isDefault: true,
        }),
      ]),
    );
  });
});
