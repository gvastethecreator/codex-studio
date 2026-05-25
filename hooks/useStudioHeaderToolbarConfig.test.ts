import { describe, expect, it } from 'vite-plus/test';

import { buildStudioHeaderToolbarProps } from './useStudioHeaderToolbarConfig';

describe('buildStudioHeaderToolbarProps', () => {
  it('wraps workspace switching and onboarding with transitions', () => {
    const calls: string[] = [];

    const props = buildStudioHeaderToolbarProps({
      view: {
        isGenerating: false,
        currentView: 'studio',
        onViewChange: (view) => calls.push(`view:${view}`),
        activeRecipe: null,
        onCloseRecipe: () => calls.push('closeRecipe'),
        usage: {
          value: '120',
          meta: 'ChatGPT Pro',
          tooltip: 'Available usage for ChatGPT Pro',
          unitLabel: 'credits',
          tone: 'available',
          isLoading: false,
        },
      },
      workspace: {
        workspaces: [
          { id: 'default', name: 'Default', createdAt: 1, imageCount: 3 },
          { id: 'shots', name: 'Shots', createdAt: 2, imageCount: 7 },
        ],
        activeWorkspaceId: 'default',
        setActiveWorkspace: (workspaceId) => calls.push(`switch:${workspaceId}`),
        onAddWorkspace: () => calls.push('addWorkspace'),
        onDeleteWorkspace: (workspaceId) => calls.push(`delete:${workspaceId}`),
        onRenameWorkspace: (workspaceId, name) => calls.push(`rename:${workspaceId}:${name}`),
      },
      overlays: {
        onOpenDashboard: () => calls.push('openDashboard'),
        openOnboarding: () => calls.push('openOnboarding'),
        onOpenTrash: () => calls.push('openTrash'),
        trashCount: 2,
        onToggleDebug: () => calls.push('toggleDebug'),
      },
      commandCenter: {
        activeProviderId: 'codex',
        runtimeStatus: {
          label: 'Ready',
          tone: 'success',
        },
        queueCount: 4,
        isQueueOpen: false,
        onToggleQueue: () => calls.push('toggleQueue'),
        onOpenSettings: () => calls.push('openSettings'),
      },
      startTransition: (callback) => {
        calls.push('transition');
        callback();
      },
    });

    props.onSwitchWorkspace('shots');
    props.onOpenOnboarding();
    props.onToggleQueue();
    props.onOpenSettings();

    expect(props.activeWorkspaceId).toBe('default');
    expect(props.trashCount).toBe(2);
    expect(props.usage.value).toBe('120');
    expect(props.queueCount).toBe(4);
    expect(props.activeProviderId).toBe('codex');
    expect(props.runtimeStatus).toEqual({
      label: 'Ready',
      tone: 'success',
    });
    expect(calls).toEqual([
      'transition',
      'switch:shots',
      'transition',
      'openOnboarding',
      'toggleQueue',
      'openSettings',
    ]);
  });
});
