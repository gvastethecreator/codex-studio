import { describe, expect, it } from 'vite-plus/test';

import { buildStudioHeaderToolbarProps } from '../lib/buildStudioHeaderToolbarProps';

describe('buildStudioHeaderToolbarProps', () => {
  it('wraps workspace switching and derives command-center state inside the toolbar seam', () => {
    const calls: string[] = [];
    let nextQueueOpen = false;

    const props = buildStudioHeaderToolbarProps({
      view: {
        isGenerating: false,
        currentView: 'recipes',
        onViewChange: (view) => calls.push(`view:${view}`),
        activeRecipe: null,
        onCloseRecipe: () => calls.push('closeRecipe'),
        usage: {
          value: '120',
          meta: 'ChatGPT Pro',
          tooltip: 'Available usage for ChatGPT Pro',
          unitLabel: 'credits',
          limits: [],
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
        provider: {
          defaultProviderId: null,
        },
        queue: {
          statusItems: [
            {
              key: 'backend',
              label: 'Backend',
              value: 'Offline',
              detail: '...',
              tone: 'danger',
            },
          ],
          queueResultPreviews: [{ id: 'result-1', src: '/library/assets/result-1.png' }],
          queueJobCount: 3,
          activeServerJobCount: 1,
          isQueueOpen: false,
          setIsQueueOpen: (value) => {
            nextQueueOpen = typeof value === 'function' ? value(false) : value;
            calls.push(`toggleQueue:${String(nextQueueOpen)}`);
          },
        },
        actions: {
          onOpenSettings: () => calls.push('openSettings'),
        },
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
    expect(props.queueResultPreviews).toEqual([
      { id: 'result-1', src: '/library/assets/result-1.png' },
    ]);
    expect(props.activeProviderId).toBe('codex');
    expect(props.runtimeStatus).toEqual({
      label: 'Attention',
      tone: 'danger',
    });
    expect(calls).toEqual([
      'transition',
      'switch:shots',
      'view:studio',
      'transition',
      'openOnboarding',
      'toggleQueue:true',
      'openSettings',
    ]);
  });
});
