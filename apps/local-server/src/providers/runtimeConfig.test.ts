import { describe, expect, it } from 'vite-plus/test';

import {
  createCodexRuntimePreflight,
  createAntigravityRuntimePreflight,
  createGrokRuntimePreflight,
  createProviderReadinessMaps,
  getExternalProviderRuntimePreflight,
  readExternalProviderRuntimePreflights,
} from './runtimeConfig';

const READY_GROK_RUNTIME = {
  status: 'ready' as const,
  canRunJobs: true,
  checkedAt: '2026-08-08T00:00:00.000Z',
  selectedExecutable: 'C:/Users/dev/.grok/bin/grok.exe',
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

const READY_ANTIGRAVITY_RUNTIME = {
  status: 'ready' as const,
  canRunJobs: true,
  checkedAt: '2026-09-02T00:00:00.000Z',
  selectedExecutable: 'C:/Users/dev/AppData/Local/agy/bin/agy.exe',
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

describe('provider runtime config', () => {
  it('reports configured secret sources without exposing secret values', () => {
    const preflights = readExternalProviderRuntimePreflights({
      GOOGLE_API_KEY: 'google-secret-value',
      FAL_KEY: 'fal-secret-value',
    });

    expect(preflights.map((preflight) => preflight.providerId)).toEqual(['google', 'fal', 'comfy']);

    expect(preflights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          providerId: 'google',
          secretState: 'configured',
          secretSource: 'GOOGLE_API_KEY',
          canAttemptExecution: true,
        }),
        expect.objectContaining({
          providerId: 'fal',
          secretState: 'configured',
          secretSource: 'FAL_KEY',
          canAttemptExecution: true,
        }),
      ]),
    );
    expect(JSON.stringify(preflights)).not.toContain('google-secret-value');
    expect(JSON.stringify(preflights)).not.toContain('fal-secret-value');
  });

  it('validates local runtime endpoint shape before Comfy can attempt execution', () => {
    const invalid = getExternalProviderRuntimePreflight('comfy', {
      COMFY_API_URL: 'not-a-url',
    });
    const missingTemplate = getExternalProviderRuntimePreflight('comfy', {
      COMFY_API_URL: 'http://127.0.0.1:8188',
    });
    const valid = getExternalProviderRuntimePreflight('comfy', {
      COMFY_API_URL: 'http://127.0.0.1:8188',
      COMFY_WORKFLOW_TEMPLATE_PATH: 'D:/comfy/workflows/studio.json',
    });

    expect(invalid).toMatchObject({
      providerId: 'comfy',
      secretState: 'not_required',
      localRuntimeState: 'invalid',
      localRuntimeSource: 'COMFY_API_URL',
      canAttemptExecution: false,
    });
    expect(invalid?.diagnostics).toEqual([
      'Invalid local runtime endpoint in COMFY_API_URL.',
      'Missing provider config source: COMFY_WORKFLOW_TEMPLATE_PATH.',
    ]);
    expect(missingTemplate).toMatchObject({
      providerId: 'comfy',
      localRuntimeState: 'configured',
      localRuntimeSource: 'COMFY_API_URL',
      canAttemptExecution: false,
      diagnostics: ['Missing provider config source: COMFY_WORKFLOW_TEMPLATE_PATH.'],
    });
    expect(valid).toMatchObject({
      providerId: 'comfy',
      localRuntimeState: 'configured',
      localRuntimeSource: 'COMFY_API_URL',
      canAttemptExecution: true,
      diagnostics: [],
    });
  });

  it('reports the missing Google OAuth configuration field', () => {
    expect(
      getExternalProviderRuntimePreflight('google', {
        GOOGLE_CLOUD_PROJECT_ID: 'studio-project',
      })?.diagnostics,
    ).toEqual(['Google OAuth requires a valid GOOGLE_OAUTH_CLIENT_ID.']);
    expect(
      getExternalProviderRuntimePreflight('google', {
        GOOGLE_OAUTH_CLIENT_ID: 'studio.apps.googleusercontent.com',
      })?.diagnostics,
    ).toEqual(['Google OAuth requires a valid GOOGLE_CLOUD_PROJECT_ID.']);
  });

  it('creates capability readiness maps from preflight state', () => {
    const readiness = createProviderReadinessMaps(
      {
        NANO_BANANA_API_KEY: 'nano-secret-value',
        COMFYUI_API_URL: 'ftp://127.0.0.1:8188',
      },
      READY_GROK_RUNTIME,
      {
        grokHttpReady: false,
        codexHttpReady: false,
        antigravityRuntime: READY_ANTIGRAVITY_RUNTIME,
      },
    );

    expect(readiness.secretConfigured).toMatchObject({
      google: true,
      fal: false,
      comfy: true,
      grok: true,
      antigravity: true,
    });
    expect(readiness.localRuntimeConfigured).toMatchObject({
      comfy: false,
      grok: true,
      antigravity: true,
    });
    expect(JSON.stringify(readiness)).not.toContain('nano-secret-value');
  });

  it('maps Codex Runtime Doctor blockers into provider preflight diagnostics', () => {
    const preflight = createCodexRuntimePreflight(
      {
        status: 'blocked',
        canRunJobs: false,
        checkedAt: '2026-05-31T00:00:00.000Z',
        selectedExecutable: 'C:/Users/dev/AppData/Roaming/npm/codex.cmd',
        selectedCommand: 'codex --version',
        selectedVersion: 'codex 0.2.3',
        selectedVersionNumber: '0.2.3',
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
        candidates: [],
      },
      { httpReady: false },
    );

    expect(preflight).toMatchObject({
      providerId: 'codex',
      runtimeKind: 'codex_app_server',
      localRuntimeState: 'invalid',
      canAttemptExecution: false,
    });
    expect(preflight.diagnostics.join(' ')).toContain('legacy');
  });

  it('maps the local Grok Build login into non-secret provider readiness', () => {
    const preflight = createGrokRuntimePreflight(READY_GROK_RUNTIME, { env: {}, httpReady: false });
    expect(preflight).toMatchObject({
      providerId: 'grok',
      runtimeKind: 'agent_cli',
      secretState: 'not_required',
      localRuntimeState: 'configured',
      canAttemptExecution: true,
    });
    expect(JSON.stringify(preflight)).not.toContain('auth');
  });

  it('maps the local Antigravity login into non-secret provider readiness', () => {
    expect(createAntigravityRuntimePreflight(READY_ANTIGRAVITY_RUNTIME)).toMatchObject({
      providerId: 'antigravity',
      runtimeKind: 'agent_cli',
      localRuntimeState: 'configured',
      canAttemptExecution: true,
      availableModels: ['gemini-3.8-flash-low'],
    });
  });

  it('lets Grok attempt execution from Studio Sign in when the CLI is missing', () => {
    const preflight = createGrokRuntimePreflight(
      { ...READY_GROK_RUNTIME, canRunJobs: false, status: 'blocked' },
      { env: {}, httpReady: true },
    );
    expect(preflight).toMatchObject({
      providerId: 'grok',
      runtimeKind: 'subscription_http',
      canAttemptExecution: true,
    });
    expect(JSON.stringify(preflight)).not.toContain('auth');
  });

  it('describes XAI_API_KEY readiness as HTTP credentials, not Studio Sign in', () => {
    const preflight = createGrokRuntimePreflight(
      { ...READY_GROK_RUNTIME, canRunJobs: false, status: 'blocked' },
      { env: { XAI_API_KEY: 'xai-secret' }, httpReady: true },
    );
    expect(preflight.diagnostics.join(' ')).toContain('xAI HTTP credentials are ready');
    expect(preflight.diagnostics.join(' ')).not.toContain('Studio Sign in is ready');
    expect(JSON.stringify(preflight)).not.toContain('xai-secret');
  });
});
