/**
 * @vitest-environment jsdom
 *
 * Runtime regression for §12.7: appending a runtime log must not re-render
 * workspace/shell descendants. Only a leaf useRuntimeLogs() consumer may update.
 */
import React, { useEffect, useRef } from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { RuntimeLogProvider, useRuntimeLogActions, useRuntimeLogs } from './RuntimeLogContext';
import { ToastUiProvider } from './ToastUiContext';
import { WorkspaceProvider, useWorkspaceState } from './WorkspaceContext';
import {
  appendRuntimeLog,
  getRuntimeLogsSnapshot,
  resetRuntimeLogStoreForTests,
} from './runtimeLogStore';

// Keep migration offline for this isolation harness.
vi.mock('../lib/workspaceIdbMigration', () => ({
  migrateIndexedDbWorkspacesToServer: vi.fn(async () => ({
    workspaces: [{ id: 'default', name: 'Default', createdAt: Date.now() }],
    activeWorkspaceId: 'default',
    migrated: false,
  })),
  loadDurableWorkspacesFromApi: vi.fn(async () => ({
    workspaces: [{ id: 'default', name: 'Default', createdAt: Date.now() }],
    activeWorkspaceId: 'default',
  })),
}));

vi.mock('../utils/idb', () => ({
  get: vi.fn(async () => undefined),
  set: vi.fn(async () => undefined),
  del: vi.fn(async () => undefined),
  clearAll: vi.fn(async () => undefined),
}));

type RenderCounter = { current: number };

function WorkspaceShellProbe({ renders }: { renders: RenderCounter }) {
  // Mirrors useStudioShell selective subscriptions: workspace + stable log actions only.
  const { activeWorkspaceId, workspaces } = useWorkspaceState();
  const { log } = useRuntimeLogActions();
  renders.current += 1;
  return (
    <div data-testid="workspace-shell-probe">
      <span data-testid="workspace-count">{workspaces.length}</span>
      <span data-testid="active-workspace">{activeWorkspaceId}</span>
      <button type="button" data-testid="append-via-actions" onClick={() => log('from-actions')}>
        append
      </button>
      <span data-testid="shell-render-count">{renders.current}</span>
    </div>
  );
}

function LogLeafProbe({ renders }: { renders: RenderCounter }) {
  const { logs } = useRuntimeLogs();
  renders.current += 1;
  return (
    <div data-testid="log-leaf-probe">
      <span data-testid="log-count">{logs.length}</span>
      <span data-testid="log-render-count">{renders.current}</span>
    </div>
  );
}

function ProviderTree({
  shellRenders,
  leafRenders,
}: {
  shellRenders: RenderCounter;
  leafRenders: RenderCounter;
}) {
  // Same nesting order as GlobalProvider: Toast → RuntimeLog(actions) → Workspace → app
  return (
    <ToastUiProvider>
      <RuntimeLogProvider>
        <WorkspaceProvider>
          <WorkspaceShellProbe renders={shellRenders} />
          <LogLeafProbe renders={leafRenders} />
        </WorkspaceProvider>
      </RuntimeLogProvider>
    </ToastUiProvider>
  );
}

describe('RuntimeLog isolation (runtime re-render regression)', () => {
  beforeEach(() => {
    resetRuntimeLogStoreForTests();
  });

  afterEach(() => {
    cleanup();
    resetRuntimeLogStoreForTests();
  });

  it('does not re-render workspace/shell descendants when a log is appended', async () => {
    const shellRenders: RenderCounter = { current: 0 };
    const leafRenders: RenderCounter = { current: 0 };

    render(<ProviderTree shellRenders={shellRenders} leafRenders={leafRenders} />);

    // Allow WorkspaceProvider hydrate effect to settle.
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const shellAfterMount = shellRenders.current;
    const leafAfterMount = leafRenders.current;
    expect(shellAfterMount).toBeGreaterThan(0);
    expect(leafAfterMount).toBeGreaterThan(0);
    expect(screen.getByTestId('log-count').textContent).toBe('0');

    await act(async () => {
      appendRuntimeLog('isolation-probe-1');
    });

    expect(getRuntimeLogsSnapshot()).toHaveLength(1);
    expect(screen.getByTestId('log-count').textContent).toBe('1');

    // Leaf that calls useRuntimeLogs() must update.
    expect(leafRenders.current).toBeGreaterThan(leafAfterMount);
    // Workspace/shell probe must not re-render solely because the log list changed.
    expect(shellRenders.current).toBe(shellAfterMount);
    expect(screen.getByTestId('active-workspace').textContent).toBe('default');
  });

  it('allows the leaf to update when logging through stable actions from the shell probe', async () => {
    const shellRenders: RenderCounter = { current: 0 };
    const leafRenders: RenderCounter = { current: 0 };

    render(<ProviderTree shellRenders={shellRenders} leafRenders={leafRenders} />);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const shellAfterMount = shellRenders.current;
    const leafAfterMount = leafRenders.current;

    await act(async () => {
      screen.getByTestId('append-via-actions').click();
    });

    expect(screen.getByTestId('log-count').textContent).toBe('1');
    expect(leafRenders.current).toBeGreaterThan(leafAfterMount);
    // Click handler runs in shell probe but the re-render from the event is only the
    // synthetic click path if any; log store must not force an extra workspace re-render
    // beyond the click's own act batch. Compare against post-click steady state:
    const shellAfterClick = shellRenders.current;
    await act(async () => {
      appendRuntimeLog('isolation-probe-2');
    });
    expect(screen.getByTestId('log-count').textContent).toBe('2');
    expect(shellRenders.current).toBe(shellAfterClick);
  });
});
