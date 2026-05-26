import { useCallback, useMemo } from 'react';
import type { CatalogImage } from '../packages/shared/src';
import type { StudioCatalogView } from '../lib/studioCatalogView';
import { toStudioAssetUrl } from '../services/localStudioService';
import type { GenerationBatch, Workspace } from '../types';
import { startViewTransition } from '../utils/transitionUtils';

export interface WorkspaceWithThumbs extends Workspace {
  lastImage?: string;
  imageCount: number;
}

interface UseWorkspaceStripProps {
  workspaces: Workspace[];
  catalogView?: StudioCatalogView;
  legacyVisualBatches?: GenerationBatch[];
  createWorkspace: (workspace: Workspace, options?: { activate?: boolean }) => void;
  deleteWorkspace: (id: string) => void;
  renameWorkspace: (id: string, name: string) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  onRequestDeleteWorkspace?: (workspace: WorkspaceWithThumbs) => void;
}

interface BuildWorkspacesWithThumbsOptions {
  workspaces: Workspace[];
  catalogView?: StudioCatalogView;
  legacyVisualBatches?: GenerationBatch[];
}

function belongsToWorkspace(workspaceId: string, entryWorkspaceId?: string | null) {
  return entryWorkspaceId === workspaceId || (!entryWorkspaceId && workspaceId === 'default');
}

function resolveCatalogThumb(entry: CatalogImage) {
  return toStudioAssetUrl(entry.thumbnailUrl || entry.publicUrl);
}

export function buildWorkspacesWithThumbs({
  workspaces,
  catalogView,
  legacyVisualBatches = [],
}: BuildWorkspacesWithThumbsOptions): WorkspaceWithThumbs[] {
  if (catalogView) {
    return workspaces.map((workspace) => {
      const workspaceEntries = catalogView.entries.filter((entry) =>
        belongsToWorkspace(workspace.id, entry.workspaceId),
      );
      const lastEntry = workspaceEntries[0];

      return {
        ...workspace,
        lastImage: lastEntry ? resolveCatalogThumb(lastEntry) : undefined,
        imageCount: workspaceEntries.length,
      };
    });
  }

  return workspaces.map((workspace) => {
    const workspaceBatches = legacyVisualBatches.filter(
      (batch) =>
        batch.workspaceId === workspace.id || (!batch.workspaceId && workspace.id === 'default'),
    );
    const sortedBatches = [...workspaceBatches].sort(
      (left, right) => right.createdAt - left.createdAt,
    );
    const lastBatch = sortedBatches[0];
    const lastImage = lastBatch?.images[0]?.thumbnail || lastBatch?.images[0]?.src;
    const imageCount = workspaceBatches.reduce((total, batch) => total + batch.images.length, 0);

    return {
      ...workspace,
      lastImage,
      imageCount,
    };
  });
}

/**
 * Build the workspace strip view model and its actions behind one seam so the
 * header receives a concise interface instead of batch math plus CRUD glue.
 */
export function useWorkspaceStrip({
  workspaces,
  catalogView,
  legacyVisualBatches = [],
  createWorkspace,
  deleteWorkspace,
  renameWorkspace,
  addToast,
  onRequestDeleteWorkspace,
}: UseWorkspaceStripProps) {
  const workspacesWithThumbs = useMemo<WorkspaceWithThumbs[]>(() => {
    return buildWorkspacesWithThumbs({ workspaces, catalogView, legacyVisualBatches });
  }, [catalogView, legacyVisualBatches, workspaces]);

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
