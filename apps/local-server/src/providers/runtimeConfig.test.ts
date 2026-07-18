import { describe, expect, it } from 'vite-plus/test';

import {
  createCodexRuntimePreflight,
  createProviderReadinessMaps,
  getExternalProviderRuntimePreflight,
  readExternalProviderRuntimePreflights,
} from './runtimeConfig';

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

  it('creates capability readiness maps from preflight state', () => {
    const readiness = createProviderReadinessMaps({
      NANO_BANANA_API_KEY: 'nano-secret-value',
      COMFYUI_API_URL: 'ftp://127.0.0.1:8188',
    });

    expect(readiness.secretConfigured).toMatchObject({
      google: true,
      fal: false,
      comfy: true,
    });
    expect(readiness.localRuntimeConfigured).toMatchObject({
      comfy: false,
    });
    expect(JSON.stringify(readiness)).not.toContain('nano-secret-value');
  });

  it('maps Codex Runtime Doctor blockers into provider preflight diagnostics', () => {
    const preflight = createCodexRuntimePreflight({
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
    });

    expect(preflight).toMatchObject({
      providerId: 'codex',
      runtimeKind: 'codex_app_server',
      localRuntimeState: 'invalid',
      canAttemptExecution: false,
    });
    expect(preflight.diagnostics.join(' ')).toContain('legacy');
  });
});
