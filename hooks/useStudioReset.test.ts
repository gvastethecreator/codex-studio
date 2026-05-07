import { describe, expect, it } from 'vite-plus/test';

import { performStudioReset } from './useStudioReset';

describe('performStudioReset', () => {
  it('resets runtime state, clears storage, and refreshes diagnostics in order', async () => {
    const calls: string[] = [];

    const result = await performStudioReset({
      addToast: (message, type) => calls.push(`toast:${type}:${message}`),
      resetStudioState: () => calls.push('resetStudioState'),
      resetQueue: () => calls.push('resetQueue'),
      refreshRuntime: async () => {
        calls.push('refreshRuntime');
      },
      clearGenerationState: () => calls.push('clearGenerationState'),
      clearUiState: () => calls.push('clearUiState'),
      localStorageKeys: ['generation-config', 'isBackgroundEnabled'],
      requestStudioReset: async () => {
        calls.push('requestStudioReset');
      },
      clearIndexedDb: async () => {
        calls.push('clearIndexedDb');
      },
      removeLocalStorageItem: (key) => calls.push(`remove:${key}`),
      startTransition: (callback) => {
        calls.push('startTransition');
        callback();
      },
    });

    expect(result).toBe(true);
    expect(calls).toEqual([
      'requestStudioReset',
      'clearIndexedDb',
      'remove:generation-config',
      'remove:isBackgroundEnabled',
      'resetQueue',
      'clearGenerationState',
      'startTransition',
      'resetStudioState',
      'clearUiState',
      'refreshRuntime',
      'toast:success:Studio reset complete. The local library, workspace cache, and database were rebuilt.',
    ]);
  });

  it('reports failures without running the rest of the reset choreography', async () => {
    const calls: string[] = [];

    const result = await performStudioReset({
      addToast: (message, type) => calls.push(`toast:${type}:${message}`),
      resetStudioState: () => calls.push('resetStudioState'),
      resetQueue: () => calls.push('resetQueue'),
      refreshRuntime: async () => {
        calls.push('refreshRuntime');
      },
      clearGenerationState: () => calls.push('clearGenerationState'),
      clearUiState: () => calls.push('clearUiState'),
      requestStudioReset: async () => {
        throw new Error('backend reset failed');
      },
      clearIndexedDb: async () => {
        calls.push('clearIndexedDb');
      },
      removeLocalStorageItem: (key) => calls.push(`remove:${key}`),
      startTransition: (callback) => {
        calls.push('startTransition');
        callback();
      },
    });

    expect(result).toBe(false);
    expect(calls).toEqual(['toast:error:backend reset failed']);
  });
});
