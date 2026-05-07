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
      startTransition: (callback) => {
        calls.push('transition');
        callback();
      },
    });

    props.onSwitchWorkspace('shots');
    props.onOpenOnboarding();

    expect(props.activeWorkspaceId).toBe('default');
    expect(props.trashCount).toBe(2);
    expect(props.usage.value).toBe('120');
    expect(calls).toEqual(['transition', 'switch:shots', 'transition', 'openOnboarding']);
  });
});