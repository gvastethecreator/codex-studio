import { describe, expect, it } from 'vite-plus/test';
import {
  type CodexRuntimeDoctorReport,
  createDefaultEditableStudioSettings,
  type GenerationProviderId,
} from '../../../packages/shared/src';
import { createProviderRoutes } from './providerRoutes';
import type { GrokRuntimeDoctorReport } from './grokRuntimeDoctor';

function createCodexRuntimeReport(
  overrides: Partial<CodexRuntimeDoctorReport> = {},
): CodexRuntimeDoctorReport {
  return {
    status: 'ready',
    canRunJobs: true,
    checkedAt: '2026-05-31T00:00:00.000Z',
    selectedExecutable: 'codex',
    selectedCommand: 'codex --version',
    selectedVersion: 'codex-cli 1.0.0',
    selectedVersionNumber: '1.0.0',
    appServerSupported: true,
    recommendedAction: 'Codex Product Runtime is ready.',
    issues: [],
    candidates: [],
    ...overrides,
  };
}

function createGrokRuntimeReport(): GrokRuntimeDoctorReport {
  return {
    status: 'ready',
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
}

describe('providerRoutes', () => {
  it('returns provider capabilities from Studio Settings', async () => {
    const routes = createProviderRoutes({
      readSettings: () => createDefaultEditableStudioSettings(),
      readCodexRuntimeDoctor: () => createCodexRuntimeReport(),
      readGrokRuntimeDoctor: () => createGrokRuntimeReport(),
    });

    const response = await routes.request('/');
    expect(response.status).toBe(200);

    const payload = (await response.json()) as { providers?: unknown[] };
    expect(Array.isArray(payload.providers)).toBe(true);
  });

  it('returns runtime preflight providers snapshot', async () => {
    const routes = createProviderRoutes({
      readSettings: () => createDefaultEditableStudioSettings(),
      readCodexRuntimeDoctor: () => createCodexRuntimeReport(),
      readGrokRuntimeDoctor: () => createGrokRuntimeReport(),
    });

    const response = await routes.request('/preflight');
    expect(response.status).toBe(200);

    const payload = (await response.json()) as {
      providers?: Array<{ providerId: string; canAttemptExecution: boolean }>;
    };
    expect(payload).toHaveProperty('providers');
    expect(payload.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ providerId: 'codex', canAttemptExecution: true }),
      ]),
    );
  });

  it('marks Codex preflight blocked when the Runtime Doctor blocks execution', async () => {
    const routes = createProviderRoutes({
      readSettings: () => createDefaultEditableStudioSettings(),
      readCodexRuntimeDoctor: () =>
        createCodexRuntimeReport({
          status: 'blocked',
          canRunJobs: false,
          appServerSupported: false,
          recommendedAction: 'Use the OpenAI Codex desktop CLI binary.',
          issues: [
            {
              code: 'codex_cli_legacy',
              severity: 'error',
              message: 'Selected Codex CLI looks legacy.',
              action: 'Use the OpenAI Codex desktop CLI binary.',
            },
          ],
        }),
      readGrokRuntimeDoctor: () => createGrokRuntimeReport(),
    });

    const response = await routes.request('/preflight');
    expect(response.status).toBe(200);
    const payload = (await response.json()) as {
      providers: Array<{ providerId: string; localRuntimeState: string; diagnostics: string[] }>;
    };
    expect(payload.providers[0]).toEqual(
      expect.objectContaining({
        providerId: 'codex',
        localRuntimeState: 'invalid',
      }),
    );
    expect(payload.providers[0].diagnostics.join(' ')).toContain('legacy');
  });

  it('reads Studio Settings fresh for every provider capability request', async () => {
    let defaultProviderId: GenerationProviderId = 'codex';
    const routes = createProviderRoutes({
      readSettings: () => ({ ...createDefaultEditableStudioSettings(), defaultProviderId }),
      readCodexRuntimeDoctor: () => createCodexRuntimeReport(),
      readGrokRuntimeDoctor: () => createGrokRuntimeReport(),
    });

    const first = (await (await routes.request('/')).json()) as {
      providers: Array<{ providerId: string; isDefault: boolean }>;
    };
    defaultProviderId = 'dry_run';
    const second = (await (await routes.request('/')).json()) as {
      providers: Array<{ providerId: string; isDefault: boolean }>;
    };

    expect(first.providers.find((provider) => provider.providerId === 'codex')?.isDefault).toBe(
      true,
    );
    expect(second.providers.find((provider) => provider.providerId === 'dry_run')?.isDefault).toBe(
      true,
    );
  });
});
