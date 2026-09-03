import { describe, expect, it } from 'vite-plus/test';

import { buildStudioCommandCenterProjection } from './commandCenterProjection';

describe('buildStudioCommandCenterProjection', () => {
  it('combines settings, provider preflight, runtime, and queue facts', () => {
    const projection = buildStudioCommandCenterProjection({
      settings: {
        defaultProviderId: 'google',
        commandCenterCompactMode: true,
      },
      providerCapabilities: {
        providers: [
          {
            providerId: 'google',
            label: 'Google image API',
            runtimeKind: 'hosted_api',
            status: 'active',
            isDefault: true,
            hasAdapter: true,
            canExecute: true,
            secretState: 'configured',
            subscriptionAuthState: 'not_applicable',
            detail: 'Google adapter is available.',
          },
        ],
      },
      providerRuntimePreflight: {
        providers: [
          {
            providerId: 'google',
            runtimeKind: 'hosted_api',
            secretState: 'configured',
            secretSource: 'GOOGLE_API_KEY',
            localRuntimeState: 'not_required',
            localRuntimeSource: null,
            canAttemptExecution: true,
            diagnostics: [],
          },
        ],
      },
      statusItems: [
        {
          key: 'backend',
          label: 'Backend',
          value: 'Connected',
          detail: 'ready',
          tone: 'success',
        },
      ],
      queueResultPreviews: [{ id: 'result-1', src: '/library/assets/result-1.png' }],
      activeJobCount: 3,
      isQueueOpen: false,
      isGenerating: true,
    });

    expect(projection.compactMode).toBe(true);
    expect(projection.runtimeStatus).toEqual({
      label: 'Ready',
      tone: 'success',
      tooltip: 'Runtime ready.',
    });
    expect(projection.provider).toEqual(
      expect.objectContaining({
        id: 'google',
        label: 'Google image API',
        shortLabel: 'Google',
        toolbarLabel: 'Goo',
        tone: 'success',
        canExecute: true,
      }),
    );
    expect(projection.queue).toEqual({
      count: 3,
      isOpen: false,
      resultPreviews: [{ id: 'result-1', src: '/library/assets/result-1.png' }],
      hasResultPreviews: true,
      showCollapsedProgress: true,
    });
  });

  it('degrades provider tone when preflight blocks execution', () => {
    const projection = buildStudioCommandCenterProjection({
      settings: {
        defaultProviderId: 'comfy',
        commandCenterCompactMode: false,
      },
      providerCapabilities: {
        providers: [
          {
            providerId: 'comfy',
            label: 'ComfyUI local',
            runtimeKind: 'local_workflow',
            status: 'active',
            isDefault: true,
            hasAdapter: true,
            canExecute: true,
            secretState: 'not_required',
            subscriptionAuthState: 'not_applicable',
            detail: 'ComfyUI adapter is available.',
          },
        ],
      },
      providerRuntimePreflight: {
        providers: [
          {
            providerId: 'comfy',
            runtimeKind: 'local_workflow',
            secretState: 'not_required',
            secretSource: null,
            localRuntimeState: 'missing',
            localRuntimeSource: null,
            canAttemptExecution: false,
            diagnostics: ['Runtime endpoint is missing.'],
          },
        ],
      },
      statusItems: [],
      queueResultPreviews: [],
      activeJobCount: 0,
      isQueueOpen: true,
      isGenerating: true,
    });

    expect(projection.provider.tone).toBe('danger');
    expect(projection.provider.canExecute).toBe(false);
    expect(projection.provider.tooltip).toContain('Runtime endpoint is missing.');
    expect(projection.queue.showCollapsedProgress).toBe(false);
  });

  it('names the Grok login action when the local CLI is blocked', () => {
    const projection = buildStudioCommandCenterProjection({
      settings: {
        defaultProviderId: 'grok',
        commandCenterCompactMode: false,
      },
      providerCapabilities: {
        providers: [
          {
            providerId: 'grok',
            label: 'Grok Imagine',
            runtimeKind: 'agent_cli',
            status: 'not_configured',
            isDefault: true,
            hasAdapter: true,
            canExecute: false,
            secretState: 'not_required',
            subscriptionAuthState: 'logged_out',
            detail: 'Install Grok Build and run `grok login`.',
          },
        ],
      },
      providerRuntimePreflight: {
        providers: [
          {
            providerId: 'grok',
            runtimeKind: 'agent_cli',
            secretState: 'not_required',
            secretSource: null,
            localRuntimeState: 'invalid',
            localRuntimeSource: 'grok',
            canAttemptExecution: false,
            diagnostics: ['Grok Build does not have a usable local login. Run `grok login`.'],
          },
        ],
      },
      statusItems: [],
      queueResultPreviews: [],
      activeJobCount: 0,
      isQueueOpen: false,
      isGenerating: false,
    });

    expect(projection.provider).toMatchObject({
      id: 'grok',
      canExecute: false,
      statusDetail: 'Sign in with xAI',
    });
  });

  it('projects the primary providers as readiness-aware quick-switch options', () => {
    const projection = buildStudioCommandCenterProjection({
      settings: {
        defaultProviderId: 'codex',
        commandCenterCompactMode: false,
      },
      providerCapabilities: {
        providers: [
          {
            providerId: 'codex',
            label: 'Codex app-server',
            runtimeKind: 'codex_app_server',
            status: 'active',
            isDefault: true,
            hasAdapter: true,
            canExecute: true,
            secretState: 'not_required',
            subscriptionAuthState: 'logged_out',
            detail: 'Codex is ready.',
          },
          {
            providerId: 'grok',
            label: 'Grok Imagine',
            runtimeKind: 'agent_cli',
            status: 'active',
            isDefault: false,
            hasAdapter: true,
            canExecute: true,
            secretState: 'not_required',
            subscriptionAuthState: 'logged_out',
            detail: 'Grok is ready.',
          },
          {
            providerId: 'google',
            label: 'Google Nano Banana',
            runtimeKind: 'hosted_api',
            status: 'active',
            isDefault: false,
            hasAdapter: true,
            canExecute: true,
            secretState: 'configured',
            subscriptionAuthState: 'logged_in',
            detail: 'Google is ready.',
          },
          {
            providerId: 'antigravity',
            label: 'Antigravity',
            runtimeKind: 'agent_cli',
            status: 'not_configured',
            isDefault: false,
            hasAdapter: true,
            canExecute: false,
            secretState: 'not_required',
            subscriptionAuthState: 'not_applicable',
            detail: 'Antigravity login is required.',
          },
        ],
      },
      providerRuntimePreflight: {
        providers: [
          {
            providerId: 'codex',
            runtimeKind: 'codex_app_server',
            secretState: 'not_required',
            secretSource: null,
            localRuntimeState: 'configured',
            localRuntimeSource: 'codex',
            canAttemptExecution: true,
            diagnostics: [],
          },
          {
            providerId: 'grok',
            runtimeKind: 'agent_cli',
            secretState: 'not_required',
            secretSource: null,
            localRuntimeState: 'configured',
            localRuntimeSource: 'grok',
            canAttemptExecution: true,
            diagnostics: [],
          },
          {
            providerId: 'google',
            runtimeKind: 'hosted_api',
            secretState: 'configured',
            secretSource: 'Studio Google OAuth',
            localRuntimeState: 'not_required',
            localRuntimeSource: null,
            canAttemptExecution: true,
            diagnostics: [],
          },
          {
            providerId: 'antigravity',
            runtimeKind: 'agent_cli',
            secretState: 'not_required',
            secretSource: null,
            localRuntimeState: 'invalid',
            localRuntimeSource: 'agy',
            canAttemptExecution: false,
            diagnostics: ['Run agy and complete login.'],
          },
        ],
      },
      statusItems: [],
      queueResultPreviews: [],
      activeJobCount: 0,
      isQueueOpen: false,
      isGenerating: false,
    });

    expect(projection.providerOptions).toEqual([
      expect.objectContaining({
        id: 'codex',
        label: 'Codex app-server',
        canExecute: true,
        statusDetail: 'Ready',
      }),
      expect.objectContaining({
        id: 'grok',
        label: 'Grok Imagine',
        canExecute: true,
        statusDetail: 'Ready',
      }),
      expect.objectContaining({
        id: 'google',
        label: 'Google Nano Banana',
        canExecute: true,
        statusDetail: 'Ready',
      }),
      expect.objectContaining({
        id: 'antigravity',
        label: 'Antigravity',
        canExecute: false,
        statusDetail: 'Needs setup',
      }),
    ]);
  });
});
