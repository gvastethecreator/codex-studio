import { useCallback, useEffect, useMemo } from 'react';
import type { CatalogImage } from '../packages/shared/src';
import { resolveCatalogEntryThumbnailUrl } from '../lib/studioCatalogImageAdapter';
import type { StudioCatalogView } from '../lib/studioCatalogView';
import type { Workspace } from '../types';
import { startViewTransition } from '../utils/transitionUtils';

export interface WorkspaceWithThumbs extends Workspace {
  lastImage?: string;
  imageCount: number;
}

interface UseWorkspaceStripProps {
  workspaces: Workspace[];
  catalogView?: StudioCatalogView;
  createWorkspace: (workspace: Workspace, options?: { activate?: boolean }) => void;
  deleteWorkspace: (id: string) => void;
  renameWorkspace: (id: string, name: string) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  onRequestDeleteWorkspace?: (workspace: WorkspaceWithThumbs) => void;
}

interface BuildWorkspacesWithThumbsOptions {
  workspaces: Workspace[];
  catalogView?: StudioCatalogView;
}

function resolveCatalogThumb(entry: CatalogImage) {
  return resolveCatalogEntryThumbnailUrl(entry, 96);
}

function parseCatalogWorkspaceCreatedAt(entry: CatalogImage) {
  const createdAt = Date.parse(entry.createdAt);
  return Number.isFinite(createdAt) ? createdAt : Date.now();
}

interface WorkspaceCatalogSummary {
  imageCount: number;
  lastImage?: string;
}

function buildWorkspaceCatalogSummaries(
  catalogView: StudioCatalogView,
): Map<string, WorkspaceCatalogSummary> {
  const summaries = new Map<string, WorkspaceCatalogSummary>();

  for (const entry of catalogView.entries) {
    const workspaceId = entry.workspaceId || 'default';
    const existing = summaries.get(workspaceId);

    if (existing) {
      existing.imageCount += 1;
      continue;
    }

    summaries.set(workspaceId, {
      imageCount: 1,
      lastImage: resolveCatalogThumb(entry),
    });
  }

  return summaries;
}

export function mergeWorkspacesWithCatalogEntries(
  workspaces: Workspace[],
  catalogView?: StudioCatalogView,
): Workspace[] {
  if (!catalogView) {
    return workspaces;
  }

  const existingIds = new Set(workspaces.map((workspace) => workspace.id));
  const catalogDerivedWorkspaces: Workspace[] = [];

  for (const entry of catalogView.entries) {
    const workspaceId = entry.workspaceId || 'default';
    if (existingIds.has(workspaceId)) {
      continue;
    }

    existingIds.add(workspaceId);
    catalogDerivedWorkspaces.push({
      id: workspaceId,
      createdAt: parseCatalogWorkspaceCreatedAt(entry),
      name: workspaceId === 'default' ? undefined : `Imported (${workspaceId.slice(-4)})`,
    });
  }

  return catalogDerivedWorkspaces.length > 0
    ? [...workspaces, ...catalogDerivedWorkspaces]
    : workspaces;
}

export function buildWorkspacesWithThumbs({
  workspaces,
  catalogView,
}: BuildWorkspacesWithThumbsOptions): WorkspaceWithThumbs[] {
  if (catalogView) {
    const catalogSummaries = buildWorkspaceCatalogSummaries(catalogView);

    return workspaces.map((workspace) => {
      const summary = catalogSummaries.get(workspace.id);

      return {
        ...workspace,
        lastImage: summary?.lastImage,
        imageCount: summary?.imageCount ?? 0,
      };
    });
  }

  return workspaces.map((workspace) => ({
    ...workspace,
    lastImage: undefined,
    imageCount: 0,
  }));
}

/**
 * Build the workspace strip view model and its actions behind one seam so the
 * header receives a concise interface instead of batch math plus CRUD glue.
 */
export function useWorkspaceStrip({
  workspaces,
  catalogView,
  createWorkspace,
  deleteWorkspace,
  renameWorkspace,
  addToast,
  onRequestDeleteWorkspace,
}: UseWorkspaceStripProps) {
  const syncedWorkspaces = useMemo(
    () => mergeWorkspacesWithCatalogEntries(workspaces, catalogView),
    [catalogView, workspaces],
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
    });
  }, [catalogView, syncedWorkspaces]);

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
