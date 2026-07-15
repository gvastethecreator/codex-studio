import { describe, expect, it, vi } from 'vite-plus/test';
import type { CodexRuntimeDoctorReport } from '../../../packages/shared/src';
import { createStudioReadinessLifecycle } from './studioReadinessLifecycle';

const readyReport: CodexRuntimeDoctorReport = {
  status: 'ready',
  canRunJobs: true,
  checkedAt: '2026-07-10T00:00:00.000Z',
  selectedExecutable: 'codex',
  selectedCommand: 'codex --version',
  selectedVersion: 'codex-cli 1.0.0',
  selectedVersionNumber: '1.0.0',
  appServerSupported: true,
  recommendedAction: 'Codex Product Runtime is ready.',
  issues: [],
  candidates: [],
};

describe('Studio Readiness lifecycle', () => {
  it('returns immediately without probing and deduplicates concurrent refreshes', async () => {
    const probeCodexRuntime = vi.fn(async () => readyReport);
    const readLocalCodexSession = vi.fn(async () => ({
      authMode: 'chatgpt' as const,
      planType: null,
      usage: null,
      source: 'app-server' as const,
      fetchedAt: '2026-07-10T00:00:00.000Z',
      error: null,
      authLabel: 'ChatGPT login',
      state: 'ready' as const,
      reason: null,
      isChatgptLogin: true,
      isSupportedAuthMode: true,
      canRunLocalJobs: true,
    }));
    const lifecycle = createStudioReadinessLifecycle({
      isAppServerRunning: () => true,
      probeCodexRuntime,
      readLocalCodexSession,
    });

    expect(lifecycle.readSnapshot()).toMatchObject({ revision: 0, freshness: 'unknown' });
    expect(probeCodexRuntime).not.toHaveBeenCalled();
    const first = lifecycle.refresh({ reason: 'startup' });
    const second = lifecycle.refresh({ reason: 'onboarding' });
    const [a, b] = await Promise.all([first, second]);

    expect(a).toBe(b);
    expect(a).toMatchObject({ revision: 1, freshness: 'fresh' });
    expect(probeCodexRuntime).toHaveBeenCalledTimes(1);
    expect(readLocalCodexSession).toHaveBeenCalledTimes(1);
  });

  it('does not open a doomed session probe when Codex is blocked', async () => {
    const readLocalCodexSession = vi.fn();
    const lifecycle = createStudioReadinessLifecycle({
      isAppServerRunning: () => true,
      probeCodexRuntime: async () => ({ ...readyReport, status: 'blocked', canRunJobs: false }),
      readLocalCodexSession,
    });

    await lifecycle.refresh({ reason: 'manual' });
    expect(readLocalCodexSession).not.toHaveBeenCalled();
  });

  it('uses the fresh cache for passive refreshes and only probes again when forced', async () => {
    const probeCodexRuntime = vi
      .fn<() => Promise<CodexRuntimeDoctorReport>>()
      .mockResolvedValue(readyReport);
    const readLocalCodexSession = vi.fn(async () => ({
      authMode: 'chatgpt' as const,
      planType: null,
      usage: null,
      source: 'app-server' as const,
      fetchedAt: '2026-07-10T00:00:00.000Z',
      error: null,
      authLabel: 'ChatGPT login',
      state: 'ready' as const,
      reason: null,
      isChatgptLogin: true,
      isSupportedAuthMode: true,
      canRunLocalJobs: true,
    }));
    const lifecycle = createStudioReadinessLifecycle({
      isAppServerRunning: () => true,
      probeCodexRuntime,
      readLocalCodexSession,
    });

    await lifecycle.refresh({ reason: 'startup' });
    await lifecycle.refresh({ reason: 'passive' });
    await lifecycle.refresh({ reason: 'passive', force: true });
    expect(probeCodexRuntime).toHaveBeenCalledTimes(1);
    expect(readLocalCodexSession).toHaveBeenCalledTimes(1);

    await lifecycle.refresh({ reason: 'manual', force: true });
    expect(probeCodexRuntime).toHaveBeenCalledTimes(2);
    expect(readLocalCodexSession).toHaveBeenCalledTimes(2);
  });

  it('keeps local session truth in the readiness snapshot', async () => {
    const lifecycle = createStudioReadinessLifecycle({
      isAppServerRunning: () => true,
      probeCodexRuntime: async () => readyReport,
      readLocalCodexSession: async () => ({
        authMode: 'chatgpt' as const,
        planType: null,
        usage: null,
        source: 'app-server' as const,
        fetchedAt: '2026-07-10T00:00:00.000Z',
        error: null,
        authLabel: 'ChatGPT login',
        state: 'unsupported_auth' as const,
        reason: 'api_key_not_supported' as const,
        isChatgptLogin: false,
        isSupportedAuthMode: false,
        canRunLocalJobs: false,
      }),
    });

    const snapshot = await lifecycle.refresh({ reason: 'startup' });

    expect(snapshot.localCodexSession).toMatchObject({
      state: 'unsupported_auth',
      canRunLocalJobs: false,
    });
  });
});
