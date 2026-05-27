import { describe, expect, it } from 'vite-plus/test';

import type { HealthResponse, LocalCodexSessionResponse } from '../packages/shared/src';
import { buildStudioReadinessSnapshot } from './studioReadiness';

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
      serverPort: 17223,
      codexWsPort: 17224,
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
      wsUrl: 'ws://localhost:17224',
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

function createSession(overrides?: Partial<LocalCodexSessionResponse>): LocalCodexSessionResponse {
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
    authLabel: 'ChatGPT login',
    state: 'ready',
    reason: null,
    isChatgptLogin: true,
    isSupportedAuthMode: true,
    canRunLocalJobs: true,
    ...overrides,
  };
}

describe('buildStudioReadinessSnapshot', () => {
  const runtime = { label: 'Desktop runtime' };

  it('returns a ready snapshot when the local session can run jobs', () => {
    const snapshot = buildStudioReadinessSnapshot({
      health: createHealth(),
      isBackendConnected: true,
      localCodexSession: createSession(),
      runtime,
    });

    expect(snapshot).toMatchObject({
      stage: 'ready',
      isReady: true,
      nextAction: null,
      title: 'Desktop runtime ready',
    });
    expect(snapshot.checks).toEqual(
      expect.arrayContaining([expect.objectContaining({ key: 'localCodexSession', ok: true })]),
    );
  });

  it('asks for a ChatGPT login when the local session is missing', () => {
    const snapshot = buildStudioReadinessSnapshot({
      health: createHealth(),
      isBackendConnected: true,
      localCodexSession: createSession({
        authMode: null,
        planType: null,
        usage: null,
        authLabel: 'Not signed in',
        state: 'requires_chatgpt_login',
        reason: 'chatgpt_login_required',
        isChatgptLogin: false,
        canRunLocalJobs: false,
      }),
      runtime,
    });

    expect(snapshot).toMatchObject({
      stage: 'action_required',
      isReady: false,
      nextAction: 'login-chatgpt',
      title: 'Use ChatGPT login',
    });
  });

  it('asks to start the app-server when the backend is up but codex app-server is down', () => {
    const snapshot = buildStudioReadinessSnapshot({
      health: createHealth({
        appServer: {
          ...createHealth().appServer,
          running: false,
        },
      }),
      isBackendConnected: true,
      localCodexSession: createSession({
        authLabel: 'Unavailable',
        state: 'unavailable',
        reason: 'app_server_unavailable',
        canRunLocalJobs: false,
      }),
      runtime,
    });

    expect(snapshot).toMatchObject({
      stage: 'action_required',
      isReady: false,
      nextAction: 'start-app-server',
      title: 'Start codex app-server',
    });
  });

  it('returns an offline snapshot when the backend is disconnected', () => {
    const snapshot = buildStudioReadinessSnapshot({
      health: null,
      isBackendConnected: false,
      localCodexSession: null,
      runtime,
    });

    expect(snapshot).toMatchObject({
      stage: 'offline',
      isReady: false,
      nextAction: 'retry',
      title: 'Reconnect the local backend',
    });
  });
});
