/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastUiProvider } from './ToastUiContext';
import { WorkspaceProvider, useWorkspaceState } from './WorkspaceContext';
import {
  migrateIndexedDbWorkspacesToServer,
  loadDurableWorkspacesFromApi,
} from '../lib/workspaceIdbMigration';

vi.mock('../lib/workspaceIdbMigration', () => ({
  migrateIndexedDbWorkspacesToServer: vi.fn(),
  loadDurableWorkspacesFromApi: vi.fn(),
}));
vi.mock('../utils/idb', () => ({ set: vi.fn(async () => undefined) }));

function ActiveWorkspace() {
  const { activeWorkspaceId } = useWorkspaceState();
  return <div data-testid="active-workspace">{activeWorkspaceId}</div>;
}

afterEach(() => {
  vi.mocked(migrateIndexedDbWorkspacesToServer).mockReset();
  vi.mocked(loadDurableWorkspacesFromApi).mockReset();
});

describe('workspace startup', () => {
  it('waits for the saved workspace before mounting its content', async () => {
    const pending =
      Promise.withResolvers<Awaited<ReturnType<typeof migrateIndexedDbWorkspacesToServer>>>();
    vi.mocked(migrateIndexedDbWorkspacesToServer).mockReturnValueOnce(pending.promise);
    render(
      <ToastUiProvider>
        <WorkspaceProvider>
          <ActiveWorkspace />
        </WorkspaceProvider>
      </ToastUiProvider>,
    );
    expect(screen.getByRole('status').textContent).toContain('Loading workspace');
    expect(screen.queryByTestId('active-workspace')).toBeNull();
    pending.resolve({
      workspaces: [
        { id: 'default', createdAt: 1 },
        { id: 'current', createdAt: 2 },
      ],
      activeWorkspaceId: 'current',
      migrated: false,
    });
    await waitFor(() => expect(screen.getByTestId('active-workspace').textContent).toBe('current'));
  });

  it('keeps workspace content hidden when both workspace reads fail', async () => {
    vi.mocked(migrateIndexedDbWorkspacesToServer).mockRejectedValueOnce(new Error('offline'));
    vi.mocked(loadDurableWorkspacesFromApi).mockRejectedValueOnce(new Error('offline'));
    render(
      <ToastUiProvider>
        <WorkspaceProvider>
          <ActiveWorkspace />
        </WorkspaceProvider>
      </ToastUiProvider>,
    );
    await screen.findByRole('alert');
    expect(screen.queryByTestId('active-workspace')).toBeNull();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
  });
});
