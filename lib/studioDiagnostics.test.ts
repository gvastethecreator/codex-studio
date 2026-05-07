import { describe, expect, it } from 'vite-plus/test';

import type { CodexAccountStatusResponse, HealthResponse } from '../packages/shared/src';
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
    },
    checks: {
      libraryReady: true,
      codexReady: true,
      onboardingReady: true,
    },
    ...overrides,
  };
}

function createAccountStatus(
  overrides?: Partial<CodexAccountStatusResponse>,
): CodexAccountStatusResponse {
  return {
    authMode: 'chatgpt',
    planType: 'chatgpt_pro',
    usage: {
      available: 42,
      unit: 'credits',
      display: '42',
      path: '/account/usage',
      raw: { available: 42 },
    },
    source: 'app-server',
    fetchedAt: '2026-05-07T00:00:00.000Z',
    error: null,
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
      codexAccountStatus: null,
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
    ]);
  });

  it('builds a ready snapshot from health and account data', () => {
    const snapshot = buildStudioDiagnosticsSnapshot({
      health: createHealth(),
      codexAccountStatus: createAccountStatus(),
      hasFetchedDiagnostics: true,
      isBackendConnected: true,
    });

    expect(snapshot.usage).toMatchObject({
      value: '42',
      meta: 'ChatGPT Pro',
      unitLabel: 'credits',
      tone: 'available',
      isLoading: false,
    });
    expect(snapshot.statusItems).toEqual([
      expect.objectContaining({ key: 'backend', value: 'Connected', tone: 'success' }),
      expect.objectContaining({ key: 'codexCli', value: 'Ready', tone: 'success' }),
      expect.objectContaining({ key: 'appServer', value: 'Running', tone: 'success' }),
    ]);
  });

  it('surfaces account fallback errors while keeping the backend online', () => {
    const snapshot = buildStudioDiagnosticsSnapshot({
      health: createHealth({
        appServer: {
          ...createHealth().appServer,
          running: false,
        },
      }),
      codexAccountStatus: createAccountStatus({
        planType: null,
        usage: null,
        error: 'rate limits unavailable',
        source: 'fallback',
      }),
      hasFetchedDiagnostics: true,
      isBackendConnected: true,
    });

    expect(snapshot.usage).toMatchObject({
      value: 'Unavailable',
      meta: 'Codex account',
      tone: 'neutral',
    });
    expect(snapshot.usage.tooltip).toContain('rate limits unavailable');
    expect(snapshot.statusItems[2]).toEqual(
      expect.objectContaining({ key: 'appServer', value: 'Standby', tone: 'warning' }),
    );
  });
});
