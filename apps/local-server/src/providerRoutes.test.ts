import { describe, expect, it } from 'vitest';
import {
  type CodexRuntimeDoctorReport,
  createDefaultEditableStudioSettings,
  type GenerationProviderId,
} from '../../../packages/shared/src';
import { createProviderRoutes } from './providerRoutes';
import type { GrokRuntimeDoctorReport } from './grokRuntimeDoctor';
import type { AntigravityRuntimeDoctorReport } from './antigravityRuntimeDoctor';

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

function createAntigravityRuntimeReport(): AntigravityRuntimeDoctorReport {
  return {
    status: 'ready',
    canRunJobs: true,
    checkedAt: '2026-09-02T00:00:00.000Z',
    selectedExecutable: 'agy',
    selectedVersion: '1.1.24',
    selectedVersionNumber: '1.1.24',
    defaultModel: null,
    availableModels: ['gemini-3.8-flash-low'],
    headlessSupported: true,
    generateImageSupported: true,
    recommendedAction: 'Antigravity is ready.',
    issues: [],
    candidates: [],
  };
}

describe('providerRoutes', () => {
  it('uses one doctor snapshot per capability response', async () => {
    let codexReads = 0;
    let grokReads = 0;
    let antigravityReads = 0;
    const routes = createProviderRoutes({
      readSettings: () => createDefaultEditableStudioSettings(),
      readCodexRuntimeDoctor: () => {
        codexReads += 1;
        return createCodexRuntimeReport();
      },
      readGrokRuntimeDoctor: () => {
        grokReads += 1;
        return createGrokRuntimeReport();
      },
      readAntigravityRuntimeDoctor: () => {
        antigravityReads += 1;
        return createAntigravityRuntimeReport();
      },
    });
    const response = await routes.request('/');
    expect(response.status).toBe(200);
    expect([codexReads, grokReads, antigravityReads]).toEqual([1, 1, 1]);
  });

  it('returns provider capabilities from Studio Settings', async () => {
    const routes = createProviderRoutes({
      readSettings: () => createDefaultEditableStudioSettings(),
      readCodexRuntimeDoctor: () => createCodexRuntimeReport(),
      readGrokRuntimeDoctor: () => createGrokRuntimeReport(),
      readAntigravityRuntimeDoctor: () => createAntigravityRuntimeReport(),
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
      readAntigravityRuntimeDoctor: () => createAntigravityRuntimeReport(),
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
      readAntigravityRuntimeDoctor: () => createAntigravityRuntimeReport(),
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
      readAntigravityRuntimeDoctor: () => createAntigravityRuntimeReport(),
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
