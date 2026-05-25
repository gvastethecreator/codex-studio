import { describe, expect, it } from 'vite-plus/test';

import type { HealthResponse, LocalCodexSessionResponse } from '../packages/shared/src';
import { buildStudioDiagnosticsSnapshot, formatCodexPlan } from './studioDiagnostics';

function createHealth(overrides?: Partial<HealthResponse>): HealthResponse {
  return {
    ok: true,
    checkedAt: '2026-05-07T00:00:00.000Z',
    libraryDir: 'D:/StudioLibrary',
    runtime: {
      platform: 'win32',
      arch: 'x64',
      bunVersion: '1.3.13',
      nodeVersion: '25.0.0',
      cwd: 'D:/DEV/codex-studio',
      envLocalPath: 'D:/DEV/codex-studio/.env.local',
      envLocalPresent: true,
    },
    config: {
      serverPort: 4317,
      codexWsPort: 4318,
    },
    library: {
      exists: true,
      writable: true,
      readmePresent: true,
      missingFolders: [],
    },
    codexCli: {
      available: true,
      version: 'codex 1.0.0',
      command: 'codex --version',
    },
    appServer: {
      running: true,
      wsUrl: 'ws://localhost:4318',
      pid: 1234,
      lastExitCode: null,
      lastExitAt: null,
      lastInvocation: 'codex app-server',
      lastStartAt: '2026-05-07T00:00:00.000Z',
      lastStartError: null,
      lastEnsureAt: '2026-05-07T00:00:00.000Z',
      lastEnsureReason: 'session',
    },
    checks: {
      libraryReady: true,
      codexReady: true,
      onboardingReady: true,
    },
    ...overrides,
  };
}

function createLocalCodexSession(
  overrides?: Partial<LocalCodexSessionResponse>,
): LocalCodexSessionResponse {
  return {
    authMode: 'chatgpt',
    planType: 'chatgpt_pro',
    usage: {
      available: 70,
      unit: 'quota_percent',
      display: '70%',
      path: 'rateLimitsByLimitId.codex.primary',
      limits: [
        {
          id: 'primary',
          label: '5h',
          usedPercent: 30,
          availablePercent: 70,
          windowMinutes: 300,
          resetsAt: null,
          path: 'rateLimitsByLimitId.codex.primary',
        },
        {
          id: 'secondary',
          label: 'Weekly',
          usedPercent: 45,
          availablePercent: 55,
          windowMinutes: 10080,
          resetsAt: null,
          path: 'rateLimitsByLimitId.codex.secondary',
        },
      ],
      raw: { primary: { used_percent: 30 }, secondary: { used_percent: 45 } },
    },
    source: 'app-server',
    fetchedAt: '2026-05-07T00:00:00.000Z',
    error: null,
    authLabel: 'ChatGPT login',
    state: 'ready',
    reason: null,
    isChatgptLogin: true,
    isSupportedAuthMode: true,
    canRunLocalJobs: true,
    ...overrides,
  };
}

describe('studioDiagnostics', () => {
  it('formats Codex plan labels for UI copy', () => {
    expect(formatCodexPlan('chatgpt_pro')).toBe('ChatGPT Pro');
    expect(formatCodexPlan(null)).toBe('Codex account');
  });

  it('builds an offline snapshot when the backend is unavailable', () => {
    const snapshot = buildStudioDiagnosticsSnapshot({
      health: null,
      localCodexSession: null,
      hasFetchedDiagnostics: false,
      isBackendConnected: false,
    });

    expect(snapshot.usage).toMatchObject({
      value: 'Offline',
      meta: 'Local backend offline',
      tone: 'offline',
      isLoading: false,
    });
    expect(snapshot.statusItems).toEqual([
      expect.objectContaining({ key: 'backend', value: 'Offline', tone: 'danger' }),
      expect.objectContaining({ key: 'codexCli', value: 'Checking', tone: 'warning' }),
      expect.objectContaining({ key: 'appServer', value: 'Checking', tone: 'warning' }),
      expect.objectContaining({ key: 'localCodexSession', value: 'Checking', tone: 'warning' }),
    ]);
  });

  it('builds a ready snapshot from health and account data', () => {
    const snapshot = buildStudioDiagnosticsSnapshot({
      health: createHealth(),
      localCodexSession: createLocalCodexSession(),
      hasFetchedDiagnostics: true,
      isBackendConnected: true,
    });

    expect(snapshot.usage).toMatchObject({
      value: '70%',
      meta: 'ChatGPT Pro',
      unitLabel: null,
      limits: [
        expect.objectContaining({ id: 'primary', label: '5h', availablePercent: 70 }),
        expect.objectContaining({ id: 'secondary', label: 'Weekly', availablePercent: 55 }),
      ],
      tone: 'available',
      isLoading: false,
    });
    expect(snapshot.statusItems).toEqual([
      expect.objectContaining({ key: 'backend', value: 'Connected', tone: 'success' }),
      expect.objectContaining({ key: 'codexCli', value: 'Ready', tone: 'success' }),
      expect.objectContaining({ key: 'appServer', value: 'Running', tone: 'success' }),
      expect.objectContaining({
        key: 'localCodexSession',
        value: 'ChatGPT Login',
        tone: 'success',
      }),
    ]);
  });

  it('surfaces local session fallback errors while keeping the backend online', () => {
    const snapshot = buildStudioDiagnosticsSnapshot({
      health: createHealth({
        appServer: {
          ...createHealth().appServer,
          running: false,
        },
      }),
      localCodexSession: createLocalCodexSession({
        planType: null,
        usage: null,
        error: 'rate limits unavailable',
        source: 'fallback',
        authLabel: 'Not signed in',
        state: 'requires_chatgpt_login',
        reason: 'chatgpt_login_required',
        isChatgptLogin: false,
        isSupportedAuthMode: true,
        canRunLocalJobs: false,
      }),
      hasFetchedDiagnostics: true,
      isBackendConnected: true,
    });

    expect(snapshot.usage).toMatchObject({
      value: 'Sign in with ChatGPT',
      meta: 'ChatGPT login required',
      tone: 'neutral',
    });
    expect(snapshot.usage.tooltip).toContain('rate limits unavailable');
    expect(snapshot.statusItems[2]).toEqual(
      expect.objectContaining({ key: 'appServer', value: 'Standby', tone: 'warning' }),
    );
    expect(snapshot.statusItems[3]).toEqual(
      expect.objectContaining({
        key: 'localCodexSession',
        value: 'Login Required',
        tone: 'warning',
      }),
    );
  });
});
