import { describe, expect, it, vi } from 'vite-plus/test';
import type {
  CodexRuntimeDoctorReport,
  LocalCodexSessionResponse,
  StudioReadinessEnvelope,
} from '../../../packages/shared/src';
import type { StudioReadinessLifecycle } from './studioReadinessLifecycle';
import { createRuntimeRoutes, normalizeReadinessRefreshRequest } from './runtimeRoutes';

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
    candidates: [
      {
        executable: 'C:/private/codex.exe',
        source: 'test',
        exists: true,
        selected: true,
      },
    ],
    ...overrides,
  };
}

function createReadiness(
  canRunLocalJobs = true,
): StudioReadinessLifecycle & { refresh: ReturnType<typeof vi.fn> } {
  const localCodexSession: LocalCodexSessionResponse = {
    authMode: canRunLocalJobs ? 'chatgpt' : 'apikey',
    planType: null,
    usage: null,
    source: 'app-server',
    fetchedAt: '2026-05-31T00:00:00.000Z',
    error: null,
    authLabel: canRunLocalJobs ? 'ChatGPT login' : 'API key',
    state: canRunLocalJobs ? 'ready' : 'unsupported_auth',
    reason: canRunLocalJobs ? null : 'api_key_not_supported',
    isChatgptLogin: canRunLocalJobs,
    isSupportedAuthMode: canRunLocalJobs,
    canRunLocalJobs,
  };
  const snapshot: StudioReadinessEnvelope = {
    revision: 1,
    observedAt: '2026-05-31T00:00:00.000Z',
    freshness: 'fresh',
    refreshState: 'idle',
    lastAttemptAt: '2026-05-31T00:00:00.000Z',
    lastSuccessAt: '2026-05-31T00:00:00.000Z',
    codexRuntime: createCodexRuntimeReport(),
    localCodexSession,
  };
  return {
    readSnapshot: () => snapshot,
    refresh: vi.fn(async () => snapshot),
    dispose: vi.fn(),
  };
}

describe('runtimeRoutes', () => {
  it('returns health snapshot and bootstrap config', async () => {
    const ensureAppServer = vi.fn();
    const routes = createRuntimeRoutes({
      readSettings: () => ({
        libraryDir: 'D:/library',
        serverPort: 17223,
        codexWsPort: 17224,
        codexImagegenModel: 'gpt-image-1',
        codexImagegenReasoningEffort: 'medium',
        codexImagegenServiceTier: null,
        codexMaxConcurrentJobs: 1,
      }),
      inspectLibrary: () => ({
        exists: true,
        writable: true,
        readmePresent: true,
        missingFolders: [],
      }),
      readCodexRuntimeDoctor: () => createCodexRuntimeReport(),
      getCodexWsUrl: () => 'ws://127.0.0.1:17224',
      getEnvLocalPath: () => 'D:/repo/.env.local',
      hasEnvLocalFile: () => true,
      ensureAppServer,
      readAppServerDiagnostics: () => ({
        pid: 123,
        lastExitCode: null,
        lastExitAt: null,
        lastInvocation: ['codex', 'app-server'],
        lastStartAt: null,
        lastStartError: null,
        lastEnsureAt: null,
        lastEnsureReason: null,
      }),
      isAppServerRunning: () => true,
      readWorkerStatus: () => ({
        maxConcurrentJobs: 1,
        activeWorkerCount: 0,
        queuedJobs: 0,
        trackedJobs: 0,
      }),
      readiness: createReadiness(true),
    });

    const healthResponse = await routes.request('/health');
    expect(healthResponse.status).toBe(200);
    const healthPayload = (await healthResponse.json()) as {
      ok: boolean;
      checks: { onboardingReady: boolean };
      appServer: { running: boolean };
      codexRuntime: { canRunJobs: boolean; candidates: unknown[]; selectedExecutable: string };
    };
    expect(healthPayload.ok).toBe(true);
    expect(healthPayload.checks.onboardingReady).toBe(true);
    expect(healthPayload.appServer.running).toBe(true);
    expect(healthPayload.codexRuntime.canRunJobs).toBe(true);
    expect(healthPayload.codexRuntime.candidates).toEqual([]);
    expect(healthPayload.codexRuntime.selectedExecutable).toBe('codex');

    const doctorResponse = await routes.request('/runtime/doctor');
    expect(doctorResponse.status).toBe(200);
    await expect(doctorResponse.json()).resolves.toMatchObject({
      canRunJobs: true,
      selectedExecutable: 'codex',
      candidates: [expect.objectContaining({ executable: 'C:/private/codex.exe' })],
    });

    const bootstrapResponse = await routes.request('/bootstrap-config');
    expect(bootstrapResponse.status).toBe(200);
    await expect(bootstrapResponse.json()).resolves.toEqual(
      expect.objectContaining({ libraryDir: 'D:/library', serverPort: 17223 }),
    );
  });

  it('starts app-server and returns diagnostics', async () => {
    const ensureAppServer = vi.fn();
    const routes = createRuntimeRoutes({
      readSettings: () => ({
        libraryDir: 'D:/library',
        serverPort: 17223,
        codexWsPort: 17224,
        codexImagegenModel: 'gpt-image-1',
        codexImagegenReasoningEffort: 'medium',
        codexImagegenServiceTier: null,
        codexMaxConcurrentJobs: 1,
      }),
      inspectLibrary: () => ({
        exists: true,
        writable: true,
        readmePresent: true,
        missingFolders: [],
      }),
      readCodexRuntimeDoctor: () => createCodexRuntimeReport(),
      getCodexWsUrl: () => 'ws://127.0.0.1:17224',
      getEnvLocalPath: () => 'D:/repo/.env.local',
      hasEnvLocalFile: () => true,
      ensureAppServer,
      readAppServerDiagnostics: () => ({
        pid: 456,
        lastExitCode: null,
        lastExitAt: null,
        lastInvocation: ['codex', 'app-server'],
        lastStartAt: null,
        lastStartError: null,
        lastEnsureAt: null,
        lastEnsureReason: 'user',
      }),
      isAppServerRunning: () => true,
      readWorkerStatus: () => ({
        maxConcurrentJobs: 1,
        activeWorkerCount: 0,
        queuedJobs: 0,
        trackedJobs: 0,
      }),
    });

    const response = await routes.request('/app-server/start', { method: 'POST' });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        running: true,
        wsUrl: 'ws://127.0.0.1:17224',
        pid: 456,
        codexRuntime: expect.objectContaining({ canRunJobs: true }),
      }),
    );
    expect(ensureAppServer).toHaveBeenCalledWith('user');
  });

  it('does not start app-server when Runtime Doctor blocks Codex execution', async () => {
    const ensureAppServer = vi.fn();
    const routes = createRuntimeRoutes({
      readSettings: () => ({
        libraryDir: 'D:/library',
        serverPort: 17223,
        codexWsPort: 17224,
        codexImagegenModel: 'gpt-image-1',
        codexImagegenReasoningEffort: 'medium',
        codexImagegenServiceTier: null,
        codexMaxConcurrentJobs: 1,
      }),
      inspectLibrary: () => ({
        exists: true,
        writable: true,
        readmePresent: true,
        missingFolders: [],
      }),
      readCodexRuntimeDoctor: () =>
        createCodexRuntimeReport({
          status: 'blocked',
          canRunJobs: false,
          appServerSupported: false,
          recommendedAction: 'Use the OpenAI Codex desktop CLI binary.',
        }),
      getCodexWsUrl: () => 'ws://127.0.0.1:17224',
      getEnvLocalPath: () => 'D:/repo/.env.local',
      hasEnvLocalFile: () => true,
      ensureAppServer,
      readAppServerDiagnostics: () => ({
        pid: null,
        lastExitCode: null,
        lastExitAt: null,
        lastInvocation: null,
        lastStartAt: null,
        lastStartError: null,
        lastEnsureAt: null,
        lastEnsureReason: null,
      }),
      isAppServerRunning: () => false,
      readWorkerStatus: () => ({
        maxConcurrentJobs: 1,
        activeWorkerCount: 0,
        queuedJobs: 0,
        trackedJobs: 0,
      }),
    });

    const response = await routes.request('/app-server/start', { method: 'POST' });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      running: false,
      lastStartError: 'Use the OpenAI Codex desktop CLI binary.',
      codexRuntime: expect.objectContaining({ canRunJobs: false }),
    });
    expect(ensureAppServer).not.toHaveBeenCalled();
  });

  it('keeps onboarding blocked when the local Codex session cannot run jobs', async () => {
    const routes = createRuntimeRoutes({
      readSettings: () => ({
        libraryDir: 'D:/library',
        serverPort: 17223,
        codexWsPort: 17224,
        codexImagegenModel: 'gpt-image-1',
        codexImagegenReasoningEffort: 'medium',
        codexImagegenServiceTier: null,
        codexMaxConcurrentJobs: 1,
      }),
      inspectLibrary: () => ({
        exists: true,
        writable: true,
        readmePresent: true,
        missingFolders: [],
      }),
      getCodexWsUrl: () => 'ws://127.0.0.1:17224',
      getEnvLocalPath: () => 'D:/repo/.env.local',
      hasEnvLocalFile: () => true,
      ensureAppServer: vi.fn(),
      readAppServerDiagnostics: () => ({
        pid: 456,
        lastExitCode: null,
        lastExitAt: null,
        lastInvocation: ['codex', 'app-server'],
        lastStartAt: null,
        lastStartError: null,
        lastEnsureAt: null,
        lastEnsureReason: null,
      }),
      isAppServerRunning: () => true,
      readWorkerStatus: () => ({
        maxConcurrentJobs: 1,
        activeWorkerCount: 0,
        queuedJobs: 0,
        trackedJobs: 0,
      }),
      readiness: createReadiness(false),
    });

    const response = await routes.request('/health');
    const payload = (await response.json()) as { checks: { onboardingReady: boolean } };

    expect(payload.checks.onboardingReady).toBe(false);
  });

  it('defaults readiness refreshes to passive and only honors explicit force requests', async () => {
    expect(normalizeReadinessRefreshRequest(undefined)).toEqual({
      reason: 'passive',
      force: false,
    });
    expect(normalizeReadinessRefreshRequest({ force: true })).toEqual({
      reason: 'manual',
      force: true,
    });
    expect(normalizeReadinessRefreshRequest({ reason: 'passive', force: true })).toEqual({
      reason: 'passive',
      force: false,
    });

    const readiness = createReadiness(true);
    const routes = createRuntimeRoutes({
      readSettings: () => ({
        libraryDir: 'D:/library',
        serverPort: 17223,
        codexWsPort: 17224,
        codexImagegenModel: 'gpt-image-1',
        codexImagegenReasoningEffort: 'medium',
        codexImagegenServiceTier: null,
        codexMaxConcurrentJobs: 1,
      }),
      inspectLibrary: () => ({
        exists: true,
        writable: true,
        readmePresent: true,
        missingFolders: [],
      }),
      getCodexWsUrl: () => 'ws://127.0.0.1:17224',
      getEnvLocalPath: () => 'D:/repo/.env.local',
      hasEnvLocalFile: () => true,
      ensureAppServer: vi.fn(),
      readAppServerDiagnostics: () => ({
        pid: 456,
        lastExitCode: null,
        lastExitAt: null,
        lastInvocation: ['codex', 'app-server'],
        lastStartAt: null,
        lastStartError: null,
        lastEnsureAt: null,
        lastEnsureReason: null,
      }),
      isAppServerRunning: () => true,
      readWorkerStatus: () => ({
        maxConcurrentJobs: 1,
        activeWorkerCount: 0,
        queuedJobs: 0,
        trackedJobs: 0,
      }),
      readiness,
    });

    await routes.request('/readiness/refresh', { method: 'POST' });
    await routes.request('/readiness/refresh', {
      method: 'POST',
      body: JSON.stringify({ reason: 'manual', force: true }),
    });

    expect(readiness.refresh).toHaveBeenNthCalledWith(1, {
      reason: 'passive',
      force: false,
    });
    expect(readiness.refresh).toHaveBeenNthCalledWith(2, {
      reason: 'manual',
      force: true,
    });
  });
});
