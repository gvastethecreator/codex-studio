import { describe, expect, it, vi } from 'vite-plus/test';
import type {
  CodexRuntimeDoctorReport,
  LocalCodexSessionResponse,
  OnboardingProbe,
  StudioReadinessEnvelope,
} from '../../../packages/shared/src';
import { resolvePrimaryCta } from '../../../packages/shared/src';
import type { StudioReadinessLifecycle } from './studioReadinessLifecycle';
import { createRuntimeRoutes, normalizeReadinessRefreshRequest } from './runtimeRoutes';
import { applyOnboardingSetup } from './onboardingSetup';
import { applyOnboardingHostAction } from './hostTerminal';
import { subscribeEvents } from './events';

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

function createRoutes(overrides: Partial<Parameters<typeof createRuntimeRoutes>[0]> = {}) {
  return createRuntimeRoutes({
    readSubscriptionFacts: () => ({ codexSignedIn: false, grokSignedIn: false }),
    readSettings: () => ({
      libraryDir: 'D:/library',
      serverPort: 17223,
      codexWsPort: 17224,
      codexImagegenModel: 'gpt-image-1',
      codexImagegenReasoningEffort: 'medium',
      codexImagegenServiceTier: null,
      workerLimits: { global: 1, providers: {} },
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
    ensureAppServer: vi.fn(),
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
      providerLimits: {},
      activeByProvider: {},
      waiting: [],
      stopping: false,
    }),
    readiness: createReadiness(true),
    ...overrides,
  });
}

function createSetupHarness(existingEnv?: string) {
  const files = new Map<string, string>();
  if (existingEnv) files.set('D:/repo/.env.local', existingEnv);
  const writes: string[] = [];
  const applyOnboardingSetupFn = (raw: unknown, extra = {}) =>
    applyOnboardingSetup(raw, {
      readEnvLocalPath: () => 'D:/repo/.env.local',
      readFile: (filePath) => files.get(filePath) ?? null,
      writeFile: (filePath, contents) => {
        writes.push(filePath);
        files.set(filePath, contents);
      },
      setProcessEnv: () => {},
      initLibrary: () => {
        writes.push('init');
      },
      isAbsolutePath: () => true,
      readExistingLibraryDir: () =>
        existingEnv?.match(/^STUDIO_LIBRARY_DIR=(.*)$/m)?.[1]?.trim() ?? null,
      depsNeedInstall: () => false,
      ...extra,
    });
  return { files, writes, applyOnboardingSetupFn };
}

describe('runtimeRoutes', () => {
  it('returns health snapshot and bootstrap config', async () => {
    const ensureAppServer = vi.fn();
    const routes = createRuntimeRoutes({
      readSubscriptionFacts: () => ({ codexSignedIn: false, grokSignedIn: false }),
      readSettings: () => ({
        libraryDir: 'D:/library',
        serverPort: 17223,
        codexWsPort: 17224,
        codexImagegenModel: 'gpt-image-1',
        codexImagegenReasoningEffort: 'medium',
        codexImagegenServiceTier: null,
        workerLimits: { global: 1, providers: {} },
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
        providerLimits: {},
        activeByProvider: {},
        waiting: [],
        stopping: false,
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
      readSubscriptionFacts: () => ({ codexSignedIn: false, grokSignedIn: false }),
      readSettings: () => ({
        libraryDir: 'D:/library',
        serverPort: 17223,
        codexWsPort: 17224,
        codexImagegenModel: 'gpt-image-1',
        codexImagegenReasoningEffort: 'medium',
        codexImagegenServiceTier: null,
        workerLimits: { global: 1, providers: {} },
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
        providerLimits: {},
        activeByProvider: {},
        waiting: [],
        stopping: false,
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
      readSubscriptionFacts: () => ({ codexSignedIn: false, grokSignedIn: false }),
      readSettings: () => ({
        libraryDir: 'D:/library',
        serverPort: 17223,
        codexWsPort: 17224,
        codexImagegenModel: 'gpt-image-1',
        codexImagegenReasoningEffort: 'medium',
        codexImagegenServiceTier: null,
        workerLimits: { global: 1, providers: {} },
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
        providerLimits: {},
        activeByProvider: {},
        waiting: [],
        stopping: false,
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
      readSubscriptionFacts: () => ({ codexSignedIn: false, grokSignedIn: false }),
      readSettings: () => ({
        libraryDir: 'D:/library',
        serverPort: 17223,
        codexWsPort: 17224,
        codexImagegenModel: 'gpt-image-1',
        codexImagegenReasoningEffort: 'medium',
        codexImagegenServiceTier: null,
        workerLimits: { global: 1, providers: {} },
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
        providerLimits: {},
        activeByProvider: {},
        waiting: [],
        stopping: false,
      }),
      readiness: createReadiness(false),
    });

    const response = await routes.request('/health');
    const payload = (await response.json()) as { checks: { onboardingReady: boolean } };

    expect(payload.checks.onboardingReady).toBe(false);
  });

  it('treats Studio ChatGPT Sign in as onboarding-ready without app-server', async () => {
    vi.stubGlobal('Bun', { ...(globalThis as { Bun?: object }).Bun, version: '1.3.14' });
    try {
      const routes = createRoutes({
        isAppServerRunning: () => false,
        readiness: createReadiness(false),
        readSubscriptionFacts: () => ({ codexSignedIn: true, grokSignedIn: false }),
      });

      const health = (await (await routes.request('/health')).json()) as {
        checks: { onboardingReady: boolean; codexReady: boolean };
      };
      expect(health.checks.onboardingReady).toBe(true);
      expect(health.checks.codexReady).toBe(true);

      const probe = (await (await routes.request('/onboarding/probe')).json()) as OnboardingProbe;
      expect(probe.facts.chatgptLoggedIn).toBe(true);
      expect(probe.facts.codexSubscriptionReady).toBe(true);
      expect(probe.primaryCta).toBe('ready');
    } finally {
      vi.unstubAllGlobals();
    }
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
      readSubscriptionFacts: () => ({ codexSignedIn: false, grokSignedIn: false }),
      readSettings: () => ({
        libraryDir: 'D:/library',
        serverPort: 17223,
        codexWsPort: 17224,
        codexImagegenModel: 'gpt-image-1',
        codexImagegenReasoningEffort: 'medium',
        codexImagegenServiceTier: null,
        workerLimits: { global: 1, providers: {} },
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
        providerLimits: {},
        activeByProvider: {},
        waiting: [],
        stopping: false,
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

  it('returns an onboarding probe from cached readiness without a doctor call', async () => {
    const readCodexRuntimeDoctor = vi.fn(() => createCodexRuntimeReport());
    const routes = createRuntimeRoutes({
      readSubscriptionFacts: () => ({ codexSignedIn: false, grokSignedIn: false }),
      readSettings: () => ({
        libraryDir: 'D:/Codex Studio',
        serverPort: 17223,
        codexWsPort: 17224,
        codexImagegenModel: 'gpt-image-1',
        codexImagegenReasoningEffort: 'medium',
        codexImagegenServiceTier: null,
        workerLimits: { global: 1, providers: {} },
      }),
      inspectLibrary: () => ({
        exists: false,
        writable: false,
        readmePresent: false,
        missingFolders: ['.studio', 'outputs'],
      }),
      readCodexRuntimeDoctor,
      getCodexWsUrl: () => 'ws://127.0.0.1:17224',
      getEnvLocalPath: () => 'D:/repo/.env.local',
      hasEnvLocalFile: () => false,
      ensureAppServer: vi.fn(),
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
        providerLimits: {},
        activeByProvider: {},
        waiting: [],
        stopping: false,
      }),
      readiness: createReadiness(true),
    });

    const healthResponse = await routes.request('/health');
    const probeResponse = await routes.request('/onboarding/probe');
    const snapshotResponse = await routes.request('/runtime/snapshot');
    expect(healthResponse.status).toBe(200);
    expect(probeResponse.status).toBe(200);
    expect(readCodexRuntimeDoctor).not.toHaveBeenCalled();

    const probe = (await probeResponse.json()) as OnboardingProbe;
    expect(probe.studioLibraryPath).toBe('D:/Codex Studio');
    expect(probe.checks).toHaveLength(6);
    expect(probe.primaryCta).toBe(resolvePrimaryCta(probe.facts));
    expect(probe.facts.studioLibraryReady).toBe(false);
    expect(probe.facts.bootstrapConfigReady).toBe(false);
    expect(probe.facts.chatgptLoggedIn).toBe(true);

    const snapshot = (await snapshotResponse.json()) as { onboarding: OnboardingProbe };
    expect(snapshot.onboarding.primaryCta).toBe(probe.primaryCta);
  });

  it('reports optional Grok on the probe without changing a ready Studio CTA', async () => {
    const routes = createRoutes({
      readGrokOnboardingFacts: () => ({ grokCliAvailable: false, grokLoggedIn: false }),
    });
    const probeResponse = await routes.request('/onboarding/probe');
    const probe = (await probeResponse.json()) as OnboardingProbe;
    expect(probe.grok.cliAvailable).toBe(false);
    expect(probe.checks.map((check) => check.id)).not.toContain('grok');
    expect(probe.primaryCta).toBe(resolvePrimaryCta(probe.facts));
  });

  it('rejects Setup without consent and does not mutate', async () => {
    const { writes, applyOnboardingSetupFn } = createSetupHarness();
    const readiness = createReadiness(true);
    const routes = createRoutes({ applyOnboardingSetupFn, readiness });

    const response = await routes.request('/onboarding/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consent: false, libraryPath: 'D:/tmp/studio-lib' }),
    });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ code: 'consent_required' });
    expect(writes).toEqual([]);
    expect(readiness.refresh).not.toHaveBeenCalled();
  });

  it('applies Setup after consent, writes STUDIO_LIBRARY_DIR, and returns a probe', async () => {
    const { files, writes, applyOnboardingSetupFn } = createSetupHarness();
    const readiness = createReadiness(true);
    const routes = createRoutes({
      applyOnboardingSetupFn,
      readiness,
      hasEnvLocalFile: () => files.has('D:/repo/.env.local'),
      readSettings: () => ({
        libraryDir:
          files.get('D:/repo/.env.local')?.match(/^STUDIO_LIBRARY_DIR=(.*)$/m)?.[1] ??
          'D:/Codex Studio',
        serverPort: 17223,
        codexWsPort: 17224,
        codexImagegenModel: 'gpt-image-1',
        codexImagegenReasoningEffort: 'medium',
        codexImagegenServiceTier: null,
        workerLimits: { global: 1, providers: {} },
      }),
    });

    const response = await routes.request('/onboarding/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consent: true,
        libraryPath: 'D:/tmp/codex-studio-lib',
        initLibrary: true,
      }),
    });
    expect(response.status).toBe(200);
    const payload = (await response.json()) as {
      ok: boolean;
      libraryPath: string;
      probe: OnboardingProbe;
    };
    expect(payload.ok).toBe(true);
    expect(payload.libraryPath).toBe('D:/tmp/codex-studio-lib');
    expect(files.get('D:/repo/.env.local')).toContain('STUDIO_LIBRARY_DIR=D:/tmp/codex-studio-lib');
    expect(writes).toEqual(['D:/repo/.env.local', 'init']);
    expect(payload.probe.studioLibraryPath).toBe('D:/tmp/codex-studio-lib');
    expect(payload.probe.facts.bootstrapConfigReady).toBe(true);
    expect(readiness.refresh).toHaveBeenCalledWith({ reason: 'onboarding' });
  });

  it('keeps an existing STUDIO_LIBRARY_DIR when Setup omits a new path', async () => {
    const { files, applyOnboardingSetupFn } = createSetupHarness(
      'STUDIO_LIBRARY_DIR=D:/existing-library\n',
    );
    const routes = createRoutes({ applyOnboardingSetupFn });

    const response = await routes.request('/onboarding/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consent: true }),
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      libraryPath: 'D:/existing-library',
    });
    expect(files.get('D:/repo/.env.local')).toContain('STUDIO_LIBRARY_DIR=D:/existing-library');
  });

  it('returns 409 for a OneDrive-like path until cloud-sync is confirmed', async () => {
    const { writes, applyOnboardingSetupFn } = createSetupHarness();
    const routes = createRoutes({ applyOnboardingSetupFn });

    const blocked = await routes.request('/onboarding/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consent: true,
        libraryPath: 'C:/Users/a/OneDrive/Codex Studio',
      }),
    });
    expect(blocked.status).toBe(409);
    await expect(blocked.json()).resolves.toMatchObject({
      code: 'cloud_sync_confirm_required',
      cloudSyncProvider: 'OneDrive',
    });
    expect(writes).toEqual([]);

    const confirmed = await routes.request('/onboarding/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consent: true,
        confirmCloudSync: true,
        libraryPath: 'C:/Users/a/OneDrive/Codex Studio',
      }),
    });
    expect(confirmed.status).toBe(200);
    await expect(confirmed.json()).resolves.toMatchObject({
      ok: true,
      cloudSyncProvider: 'OneDrive',
    });
    expect(writes).toEqual(['D:/repo/.env.local', 'init']);
  });

  it('spawns a visible host terminal for login after consent', async () => {
    const spawned: unknown[] = [];
    const routes = createRoutes({
      applyOnboardingHostActionFn: (raw, extra = {}) =>
        applyOnboardingHostAction(raw, {
          runner: (request) => {
            spawned.push(request);
          },
          resolveCwd: () => 'D:/codex-studio',
          platform: 'win32',
          ...extra,
        }),
    });

    const blocked = await routes.request('/onboarding/host-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consent: false, action: 'codex_login' }),
    });
    expect(blocked.status).toBe(400);
    expect(spawned).toEqual([]);

    const opened = await routes.request('/onboarding/host-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consent: true, action: 'codex_login' }),
    });
    expect(opened.status).toBe(200);
    await expect(opened.json()).resolves.toMatchObject({
      ok: true,
      action: 'codex_login',
      command: 'codex login',
      cwd: 'D:/codex-studio',
    });
    expect(spawned).toHaveLength(1);
  });

  it('publishes onboarding stage then probe after consented Setup', async () => {
    vi.stubGlobal('Bun', { ...(globalThis as { Bun?: object }).Bun, version: '1.3.14' });
    const seen: Array<{ type: string; payload: unknown }> = [];
    const unsubscribe = subscribeEvents((event) => {
      seen.push({ type: event.type, payload: event.payload });
    });
    try {
      let libraryReady = false;
      const files = new Map<string, string>();
      const routes = createRoutes({
        hasEnvLocalFile: () => files.has('D:/repo/.env.local'),
        inspectLibrary: () => ({
          exists: libraryReady,
          writable: libraryReady,
          readmePresent: libraryReady,
          missingFolders: libraryReady ? [] : ['outputs'],
        }),
        isAppServerRunning: () => false,
        applyOnboardingSetupFn: (raw, extra = {}) =>
          applyOnboardingSetup(raw, {
            readEnvLocalPath: () => 'D:/repo/.env.local',
            readFile: (filePath) => files.get(filePath) ?? null,
            writeFile: (filePath, contents) => {
              files.set(filePath, contents);
            },
            setProcessEnv: () => {},
            initLibrary: () => {
              libraryReady = true;
            },
            isAbsolutePath: () => true,
            readExistingLibraryDir: () => null,
            depsNeedInstall: () => false,
            ...extra,
          }),
      });

      const before = await routes.request('/onboarding/probe');
      expect(((await before.json()) as { primaryCta: string }).primaryCta).toBe('in_app_setup');

      const response = await routes.request('/onboarding/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent: true,
          libraryPath: 'D:/tmp/codex-studio-lib',
          initLibrary: true,
        }),
      });
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({
        ok: true,
        probe: { primaryCta: 'start_app_server' },
      });

      const stageIndex = seen.findIndex((event) => event.type === 'onboarding.stage');
      const probeIndex = seen.findIndex((event) => event.type === 'onboarding.probe');
      expect(stageIndex).toBeGreaterThanOrEqual(0);
      expect(probeIndex).toBeGreaterThan(stageIndex);
      expect(seen[probeIndex]?.payload).toMatchObject({ primaryCta: 'start_app_server' });
      expect(seen.some((event) => event.type === 'log.created')).toBe(true);
    } finally {
      unsubscribe();
      vi.unstubAllGlobals();
    }
  });

  it('publishes host-action stage and probe after consent, and stays quiet without it', async () => {
    const seen: Array<{ type: string }> = [];
    const unsubscribe = subscribeEvents((event) => {
      seen.push({ type: event.type });
    });
    try {
      const routes = createRoutes({
        applyOnboardingHostActionFn: (raw, extra = {}) =>
          applyOnboardingHostAction(raw, {
            runner: () => {},
            resolveCwd: () => 'D:/codex-studio',
            platform: 'win32',
            ...extra,
          }),
      });

      const blocked = await routes.request('/onboarding/host-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent: false, action: 'codex_login' }),
      });
      expect(blocked.status).toBe(400);
      expect(seen.filter((event) => event.type.startsWith('onboarding.'))).toEqual([]);

      const opened = await routes.request('/onboarding/host-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent: true, action: 'codex_login' }),
      });
      expect(opened.status).toBe(200);
      expect(seen.some((event) => event.type === 'onboarding.stage')).toBe(true);
      expect(seen.some((event) => event.type === 'onboarding.probe')).toBe(true);
      expect(seen.some((event) => event.type === 'log.created')).toBe(true);
    } finally {
      unsubscribe();
    }
  });
});
