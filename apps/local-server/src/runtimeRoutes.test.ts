import { describe, expect, it, vi } from 'vite-plus/test';
import type { CodexRuntimeDoctorReport } from '../../../packages/shared/src';
import { createRuntimeRoutes } from './runtimeRoutes';

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
    });

    const healthResponse = await routes.request('/health');
    expect(healthResponse.status).toBe(200);
    const healthPayload = (await healthResponse.json()) as {
      ok: boolean;
      checks: { onboardingReady: boolean };
      appServer: { running: boolean };
      codexRuntime: { canRunJobs: boolean };
    };
    expect(healthPayload.ok).toBe(true);
    expect(healthPayload.checks.onboardingReady).toBe(true);
    expect(healthPayload.appServer.running).toBe(true);
    expect(healthPayload.codexRuntime.canRunJobs).toBe(true);

    const doctorResponse = await routes.request('/runtime/doctor');
    expect(doctorResponse.status).toBe(200);
    await expect(doctorResponse.json()).resolves.toMatchObject({
      canRunJobs: true,
      selectedExecutable: 'codex',
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
});
