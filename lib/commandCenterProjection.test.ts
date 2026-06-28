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
      queueJobCount: 2,
      activeServerJobCount: 3,
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
        tone: 'success',
        canExecute: true,
      }),
    );
    expect(projection.queue).toEqual({
      count: 5,
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
      queueJobCount: 0,
      activeServerJobCount: 0,
      isQueueOpen: true,
      isGenerating: true,
    });

    expect(projection.provider.tone).toBe('danger');
    expect(projection.provider.canExecute).toBe(false);
    expect(projection.provider.tooltip).toContain('Runtime endpoint is missing.');
    expect(projection.queue.showCollapsedProgress).toBe(false);
  });
});
