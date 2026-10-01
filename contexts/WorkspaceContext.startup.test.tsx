/** @vitest-environment jsdom */
import { NuqsTestingAdapter, type UrlUpdateEvent } from 'nuqs/adapters/testing';
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
  const { activeWorkspaceId, hasInitialLibraryLink } = useWorkspaceState();
  return (
    <div data-testid="active-workspace" data-explicit={hasInitialLibraryLink}>
      {activeWorkspaceId}
    </div>
  );
}

afterEach(() => {
  vi.mocked(migrateIndexedDbWorkspacesToServer).mockReset();
  vi.mocked(loadDurableWorkspacesFromApi).mockReset();
  window.history.replaceState(null, '', '/');
});

describe('workspace startup', () => {
  it.each([
    ['', 'current', false],
    ['?workspace=default', 'default', true],
    ['?workspace=missing&sort=invalid&favorites=invalid&q=&foreign=kept', 'default', true],
  ] as const)(
    'resolves %s only after loading the workspace list',
    async (search, expected, explicit) => {
      window.history.replaceState(null, '', `/${search}`);
      const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>();
      const pending =
        Promise.withResolvers<Awaited<ReturnType<typeof migrateIndexedDbWorkspacesToServer>>>();
      vi.mocked(migrateIndexedDbWorkspacesToServer).mockReturnValueOnce(pending.promise);
      render(
        <NuqsTestingAdapter searchParams={search} onUrlUpdate={onUrlUpdate} hasMemory>
          <ToastUiProvider>
            <WorkspaceProvider>
              <ActiveWorkspace />
            </WorkspaceProvider>
          </ToastUiProvider>
        </NuqsTestingAdapter>,
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
      await waitFor(() =>
        expect(screen.getByTestId('active-workspace').textContent).toBe(expected),
      );
      expect(screen.getByTestId('active-workspace').getAttribute('data-explicit')).toBe(
        String(explicit),
      );
      await waitFor(() =>
        expect(onUrlUpdate.mock.lastCall?.[0].queryString).toBe(
          `?workspace=${expected}${search.includes('foreign') ? '&foreign=kept' : ''}`,
        ),
      );
    },
  );

  it('keeps workspace content hidden when both workspace reads fail', async () => {
    window.history.replaceState(null, '', '/?workspace=missing&q=retained&sort=invalid');
    const onUrlUpdate = vi.fn();
    vi.mocked(migrateIndexedDbWorkspacesToServer).mockRejectedValueOnce(new Error('offline'));
    vi.mocked(loadDurableWorkspacesFromApi).mockRejectedValueOnce(new Error('offline'));
    render(
      <NuqsTestingAdapter searchParams={window.location.search} onUrlUpdate={onUrlUpdate} hasMemory>
        <ToastUiProvider>
          <WorkspaceProvider>
            <ActiveWorkspace />
          </WorkspaceProvider>
        </ToastUiProvider>
      </NuqsTestingAdapter>,
    );
    await screen.findByRole('alert');
    expect(screen.queryByTestId('active-workspace')).toBeNull();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
    expect(window.location.search).toBe('?workspace=missing&q=retained&sort=invalid');
    expect(onUrlUpdate).not.toHaveBeenCalled();
  });
});
