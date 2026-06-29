import { useCallback, useEffect, useMemo } from 'react';
import type { CatalogImage, CatalogWorkspaceSummary } from '../packages/shared/src';
import { resolveCatalogEntryThumbnailUrl } from '../lib/studioCatalogImageAdapter';
import type { StudioCatalogView } from '../lib/studioCatalogView';
import {
  isDefaultWorkspace,
  runWorkspaceDeleteLifecycle,
  type RunWorkspaceDeleteLifecycleArgs,
} from '../lib/workspaceLifecycle';
import type { Workspace } from '../types';
import { startViewTransition } from '../utils/transitionUtils';

export interface WorkspaceWithThumbs extends Workspace {
  lastImage?: string;
  imageCount: number;
  totalFileSizeBytes: number;
  knownFileSizeCount: number;
  libraryIds: string[];
  locationPath?: string;
  firstImageCreatedAt?: string;
  latestImageCreatedAt?: string;
}

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

interface BuildWorkspacesWithThumbsOptions {
  workspaces: Workspace[];
  catalogView?: StudioCatalogView;
  workspaceSummaries?: CatalogWorkspaceSummary[];
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
  isExactCount: boolean;
  lastImage?: string;
  totalFileSizeBytes: number;
  knownFileSizeCount: number;
  libraryIds: string[];
  locationPath?: string;
  firstImageCreatedAt?: string;
  latestImageCreatedAt?: string;
}

function buildWorkspaceCatalogSummaries(
  catalogView?: StudioCatalogView,
  workspaceSummaries: CatalogWorkspaceSummary[] = [],
): Map<string, WorkspaceCatalogSummary> {
  const summaries = new Map<string, WorkspaceCatalogSummary>();

  for (const summary of workspaceSummaries) {
    summaries.set(summary.workspaceId, {
      imageCount: summary.imageCount,
      isExactCount: true,
      lastImage: summary.lastImage ? resolveCatalogThumb(summary.lastImage) : undefined,
      totalFileSizeBytes: summary.totalFileSizeBytes,
      knownFileSizeCount: summary.knownFileSizeCount,
      libraryIds: summary.libraryIds,
      locationPath: summary.sampleFilePath ?? undefined,
      firstImageCreatedAt: summary.firstCreatedAt ?? undefined,
      latestImageCreatedAt: summary.latestCreatedAt ?? undefined,
    });
  }

  if (!catalogView) {
    return summaries;
  }

  for (const entry of catalogView.entries) {
    const workspaceId = entry.workspaceId || 'default';
    const existing = summaries.get(workspaceId);

    if (existing) {
      if (!existing.isExactCount) {
        existing.imageCount += 1;
        existing.totalFileSizeBytes += entry.fileSizeBytes ?? 0;
        existing.knownFileSizeCount += entry.fileSizeBytes === null ? 0 : 1;
        if (!existing.libraryIds.includes(entry.libraryId)) {
          existing.libraryIds.push(entry.libraryId);
        }
      }
      existing.lastImage ??= resolveCatalogThumb(entry);
      existing.locationPath ??= entry.filePath;
      existing.latestImageCreatedAt ??= entry.createdAt;
      continue;
    }

    summaries.set(workspaceId, {
      imageCount: 1,
      isExactCount: false,
      lastImage: resolveCatalogThumb(entry),
      totalFileSizeBytes: entry.fileSizeBytes ?? 0,
      knownFileSizeCount: entry.fileSizeBytes === null ? 0 : 1,
      libraryIds: [entry.libraryId],
      locationPath: entry.filePath,
      firstImageCreatedAt: entry.createdAt,
      latestImageCreatedAt: entry.createdAt,
    });
  }

  return summaries;
}

export function mergeWorkspacesWithCatalogEntries(
  workspaces: Workspace[],
  catalogView?: StudioCatalogView,
  workspaceSummaries: CatalogWorkspaceSummary[] = [],
): Workspace[] {
  if (!catalogView && workspaceSummaries.length === 0) {
    return workspaces;
  }

  const existingIds = new Set(workspaces.map((workspace) => workspace.id));
  const catalogDerivedWorkspaces: Workspace[] = [];

  for (const summary of workspaceSummaries) {
    const workspaceId = summary.workspaceId;
    if (existingIds.has(workspaceId)) {
      continue;
    }

    existingIds.add(workspaceId);
    catalogDerivedWorkspaces.push({
      id: workspaceId,
      createdAt: summary.firstCreatedAt ? Date.parse(summary.firstCreatedAt) : Date.now(),
      name: workspaceId === 'default' ? undefined : `Imported (${workspaceId.slice(-4)})`,
    });
  }

  for (const entry of catalogView?.entries ?? []) {
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
  workspaceSummaries = [],
}: BuildWorkspacesWithThumbsOptions): WorkspaceWithThumbs[] {
  if (catalogView || workspaceSummaries.length > 0) {
    const catalogSummaries = buildWorkspaceCatalogSummaries(catalogView, workspaceSummaries);

    return workspaces.map((workspace) => {
      const summary = catalogSummaries.get(workspace.id);

      return {
        ...workspace,
        lastImage: summary?.lastImage,
        imageCount: summary?.imageCount ?? 0,
        totalFileSizeBytes: summary?.totalFileSizeBytes ?? 0,
        knownFileSizeCount: summary?.knownFileSizeCount ?? 0,
        libraryIds: summary?.libraryIds ?? [],
        locationPath: summary?.locationPath,
        firstImageCreatedAt: summary?.firstImageCreatedAt,
        latestImageCreatedAt: summary?.latestImageCreatedAt,
      };
    });
  }

  return workspaces.map((workspace) => ({
    ...workspace,
    lastImage: undefined,
    imageCount: 0,
    totalFileSizeBytes: 0,
    knownFileSizeCount: 0,
    libraryIds: [],
  }));
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
