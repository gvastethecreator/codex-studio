import {
  buildWorkspacesWithThumbs,
  mergeWorkspacesWithCatalogEntries,
  type WorkspaceWithThumbs,
} from '../lib/workspaceCatalogProjection';
import { useCallback, useEffect, useMemo } from 'react';
import type { CatalogWorkspaceSummary } from '../packages/shared/src';
import type { StudioCatalogView } from '../lib/studioCatalogView';
import {
  isDefaultWorkspace,
  runWorkspaceDeleteLifecycle,
  type RunWorkspaceDeleteLifecycleArgs,
} from '../lib/workspaceLifecycle';
import type { Workspace } from '../types';
import { startViewTransition } from '../utils/transitionUtils';

interface UseWorkspaceStripProps {
  workspaces: Workspace[];
  catalogView?: StudioCatalogView;
  workspaceSummaries?: CatalogWorkspaceSummary[];
  createWorkspace: (workspace: Workspace, options?: { activate?: boolean }) => void;
  deleteWorkspace: (id: string) => void;
  renameWorkspace: (id: string, name: string) => void;
  clearWorkspace?: RunWorkspaceDeleteLifecycleArgs['clearWorkspace'];
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  onRequestDeleteWorkspace?: (workspace: WorkspaceWithThumbs) => void;
}

/**
 * Build the workspace strip view model and its actions behind one seam so the
 * header receives a concise interface instead of batch math plus CRUD glue.
 */
export function useWorkspaceStrip({
  workspaces,
  catalogView,
  workspaceSummaries,
  createWorkspace,
  deleteWorkspace,
  renameWorkspace,
  clearWorkspace,
  addToast,
  onRequestDeleteWorkspace,
}: UseWorkspaceStripProps) {
  const syncedWorkspaces = useMemo(
    () => mergeWorkspacesWithCatalogEntries(workspaces, catalogView, workspaceSummaries),
    [catalogView, workspaceSummaries, workspaces],
  );

  useEffect(() => {
    if (syncedWorkspaces.length === workspaces.length) {
      return;
    }

    const existingIds = new Set(workspaces.map((workspace) => workspace.id));
    syncedWorkspaces.forEach((workspace) => {
      if (existingIds.has(workspace.id)) {
        return;
      }

      createWorkspace(workspace, { activate: false });
    });
  }, [createWorkspace, syncedWorkspaces, workspaces]);

  const workspacesWithThumbs = useMemo<WorkspaceWithThumbs[]>(() => {
    return buildWorkspacesWithThumbs({
      workspaces: syncedWorkspaces,
      catalogView,
      workspaceSummaries,
    });
  }, [catalogView, syncedWorkspaces, workspaceSummaries]);

  const handleAddWorkspace = useCallback(() => {
    startViewTransition(() => {
      const newId = `ws-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      createWorkspace({ id: newId, createdAt: Date.now() }, { activate: true });
      addToast('New workspace created', 'success');
    });
  }, [addToast, createWorkspace]);

  const handleDeleteWorkspace = useCallback(
    (id: string) => {
      if (isDefaultWorkspace(id)) {
        addToast('The default workspace cannot be deleted', 'error');
        return;
      }

      const workspace = workspacesWithThumbs.find((entry) => entry.id === id);
      if (workspace && onRequestDeleteWorkspace) {
        onRequestDeleteWorkspace(workspace);
        return;
      }

      if (clearWorkspace) {
        startViewTransition(() => {
          void runWorkspaceDeleteLifecycle({
            workspaceId: id,
            clearWorkspace,
            deleteWorkspace,
          })
            .then(() => {
              addToast('Workspace removed from the active Studio', 'info');
            })
            .catch((error) => {
              addToast(
                error instanceof Error ? error.message : 'Unable to remove workspace',
                'error',
              );
            });
        });
        return;
      }

      startViewTransition(() => {
        deleteWorkspace(id);
        addToast('Workspace removed from the active Studio', 'info');
      });
    },
    [addToast, clearWorkspace, deleteWorkspace, onRequestDeleteWorkspace, workspacesWithThumbs],
  );

  const handleRenameWorkspace = useCallback(
    (id: string, newName: string) => {
      startViewTransition(() => {
        renameWorkspace(id, newName);
        addToast('Workspace renamed', 'success');
      });
    },
    [addToast, renameWorkspace],
  );

  return {
    workspacesWithThumbs,
    handleAddWorkspace,
    handleDeleteWorkspace,
    handleRenameWorkspace,
  };
}
