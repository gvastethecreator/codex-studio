import { useCallback, useMemo } from 'react';
import type { GenerationBatch, Workspace } from '../types';
import { startViewTransition } from '../utils/transitionUtils';

export interface WorkspaceWithThumbs extends Workspace {
  lastImage?: string;
  imageCount: number;
}

interface UseWorkspaceStripProps {
  workspaces: Workspace[];
  batches: GenerationBatch[];
  createWorkspace: (workspace: Workspace, options?: { activate?: boolean }) => void;
  deleteWorkspace: (id: string) => void;
  renameWorkspace: (id: string, name: string) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  onRequestDeleteWorkspace?: (workspace: WorkspaceWithThumbs) => void;
}

/**
 * Build the workspace strip view model and its actions behind one seam so the
 * header receives a concise interface instead of batch math plus CRUD glue.
 */
export function useWorkspaceStrip({
  workspaces,
  batches,
  createWorkspace,
  deleteWorkspace,
  renameWorkspace,
  addToast,
  onRequestDeleteWorkspace,
}: UseWorkspaceStripProps) {
  const workspacesWithThumbs = useMemo<WorkspaceWithThumbs[]>(() => {
    return workspaces.map((workspace) => {
      const workspaceBatches = batches.filter(
        (batch) => batch.workspaceId === workspace.id || (!batch.workspaceId && workspace.id === 'default'),
      );
      const sortedBatches = workspaceBatches.sort((left, right) => right.createdAt - left.createdAt);
      const lastBatch = sortedBatches[0];
      const lastImage = lastBatch?.images[0]?.thumbnail || lastBatch?.images[0]?.src;
      const imageCount = workspaceBatches.reduce((total, batch) => total + batch.images.length, 0);

      return {
        ...workspace,
        lastImage,
        imageCount,
      };
    });
  }, [batches, workspaces]);

  const handleAddWorkspace = useCallback(() => {
    startViewTransition(() => {
      const newId = `ws-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      createWorkspace({ id: newId, createdAt: Date.now() }, { activate: true });
      addToast('New workspace created', 'success');
    });
  }, [addToast, createWorkspace]);

  const handleDeleteWorkspace = useCallback(
    (id: string) => {
      if (id === 'default') {
        addToast('The default workspace cannot be deleted', 'error');
        return;
      }

      const workspace = workspacesWithThumbs.find((entry) => entry.id === id);
      if (workspace && onRequestDeleteWorkspace) {
        onRequestDeleteWorkspace(workspace);
        return;
      }

      startViewTransition(() => {
        deleteWorkspace(id);
        addToast('Workspace removed from the active Studio', 'info');
      });
    },
    [addToast, deleteWorkspace, onRequestDeleteWorkspace, workspacesWithThumbs],
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