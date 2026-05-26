import { describe, expect, it } from 'vite-plus/test';

import { createInitialGlobalState, globalReducer } from './globalReducer';

describe('globalReducer', () => {
  it('preserves existing slices when hydrate payload contains undefined values', () => {
    const initial = {
      ...createInitialGlobalState(),
      logs: [{ id: 'log-1', timestamp: 1, message: 'ready' }],
      bgConfig: { density: 0.2, speed: 0.01 },
      isBackgroundEnabled: false,
    };

    const next = globalReducer(initial, {
      type: 'HYDRATE_STATE',
      state: {
        logs: undefined,
        bgConfig: undefined,
        workspaces: undefined,
      },
    });

    expect(next.logs).toEqual(initial.logs);
    expect(next.bgConfig).toEqual(initial.bgConfig);
    expect(next.isBackgroundEnabled).toBe(false);
    expect(next.workspaces).toEqual(initial.workspaces);
    expect(next.activeWorkspaceId).toBe(initial.activeWorkspaceId);
  });

  it('hydrates the active workspace when the persisted id exists in the workspace list', () => {
    const initial = createInitialGlobalState();

    const next = globalReducer(initial, {
      type: 'HYDRATE_STATE',
      state: {
        workspaces: [
          { id: 'default', createdAt: 1 },
          { id: 'ws-1', createdAt: 2, name: 'Shots' },
        ],
        activeWorkspaceId: 'ws-1',
      },
    });

    expect(next.activeWorkspaceId).toBe('ws-1');
  });
});
