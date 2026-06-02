import { describe, expect, it, vi } from 'vite-plus/test';

import {
  DEFAULT_WORKSPACE_ID,
  isDefaultWorkspace,
  runWorkspaceDeleteLifecycle,
  runWorkspaceSwitchLifecycle,
} from './workspaceLifecycle';

describe('workspaceLifecycle', () => {
  it('marks the default workspace id as protected', () => {
    expect(isDefaultWorkspace(DEFAULT_WORKSPACE_ID)).toBe(true);
    expect(isDefaultWorkspace('ws-123')).toBe(false);
  });

  it('switches workspace and normalizes the landing view to studio', () => {
    const setActiveWorkspace = vi.fn();
    const onViewChange = vi.fn();

    runWorkspaceSwitchLifecycle({
      workspaceId: 'ws-2',
      currentView: 'recipes',
      setActiveWorkspace,
      onViewChange,
    });

    expect(setActiveWorkspace).toHaveBeenCalledWith('ws-2');
    expect(onViewChange).toHaveBeenCalledWith('studio');
  });

  it('does not force a studio view change when already in studio', () => {
    const setActiveWorkspace = vi.fn();
    const onViewChange = vi.fn();

    runWorkspaceSwitchLifecycle({
      workspaceId: 'ws-3',
      currentView: 'studio',
      setActiveWorkspace,
      onViewChange,
    });

    expect(setActiveWorkspace).toHaveBeenCalledWith('ws-3');
    expect(onViewChange).not.toHaveBeenCalled();
  });

  it('keeps clear-before-delete ordering in workspace removal', async () => {
    const calls: string[] = [];
    const clearWorkspace = vi.fn(async () => {
      calls.push('clear');
    });
    const deleteWorkspace = vi.fn(async () => {
      calls.push('delete');
    });

    await runWorkspaceDeleteLifecycle({
      workspaceId: 'ws-4',
      clearWorkspace,
      deleteWorkspace,
    });

    expect(clearWorkspace).toHaveBeenCalledWith('ws-4');
    expect(deleteWorkspace).toHaveBeenCalledWith('ws-4');
    expect(calls).toEqual(['clear', 'delete']);
  });
});
