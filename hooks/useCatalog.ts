import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CatalogImage, CatalogPage } from '../packages/shared/src';
import { buildArchivedImageGroupsFromCatalog } from '../lib/studioCatalogTrashView';
import { buildStudioQueueResultPreviews } from '../lib/studioQueueResults';
import { createCatalogView, type StudioCatalogView } from '../lib/studioCatalogView';
import {
  deleteCatalogImage as deleteCatalogImageRequest,
  purgeCatalogImage as purgeCatalogImageRequest,
  queryCatalog,
  restoreCatalogImage as restoreCatalogImageRequest,
  toStudioAssetUrl,
  type CatalogQueryParams,
  updateCatalogImage as updateCatalogImageRequest,
} from '../services/localStudioService';

export interface UseCatalogOptions extends CatalogQueryParams {
  pageSize?: number;
  queryCatalogPage?: (params: CatalogQueryParams) => Promise<CatalogPage>;
}

export interface UseCatalogResult {
  entries: CatalogImage[];
  view: StudioCatalogView;
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export interface UseStudioCatalogControllerOptions {
  activeWorkspaceId: string;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export interface UseStudioCatalogControllerResult {
  activeCatalog: UseCatalogResult;
  workspaceCatalog: UseCatalogResult;
  trashCatalog: UseCatalogResult;
  catalogVisualGroupCount: number;
  queueResults: ReturnType<typeof buildStudioQueueResultPreviews>;
  queueResultPreviews: Array<{ id: string; src: string }>;
  catalogTrashGroups: ReturnType<typeof buildArchivedImageGroupsFromCatalog>;
  refreshCatalogs: () => void;
  deleteCatalogImage: (imageId: string) => void;
  deleteCatalogImages: (imageIds: string[]) => void;
  toggleCatalogFavorite: (imageId: string) => void;
  clearCatalogWorkspace: (workspaceId: string) => void;
  restoreCatalogBatch: (batchId: string) => void;
  restoreAllCatalogTrash: () => void;
  emptyCatalogTrash: () => void;
}

function normalizeCatalogError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}

function belongsToWorkspace(workspaceId: string, entryWorkspaceId?: string | null) {
  return entryWorkspaceId === workspaceId || (!entryWorkspaceId && workspaceId === 'default');
}

function resolveCatalogMutationError(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage;
}

export function collectWorkspaceCatalogImageIds(entries: CatalogImage[], workspaceId: string) {
  return entries.reduce<string[]>((acc, entry) => {
    if (belongsToWorkspace(workspaceId, entry.workspaceId)) {
      acc.push(entry.id);
    }
    return acc;
  }, []);
}

export function useCatalog({
  pageSize = 200,
  queryCatalogPage = queryCatalog,
  ...filters
}: UseCatalogOptions = {}): UseCatalogResult {
  const [entries, setEntries] = useState<CatalogImage[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const loadPage = useCallback(
    async (offset: number, mode: 'replace' | 'append') => {
      setIsLoading(true);
      setError(null);
      try {
        const page = await queryCatalogPage({
          ...filtersRef.current,
          offset,
          limit: filtersRef.current.limit ?? pageSize,
        });
        setEntries((previous) => (mode === 'append' ? [...previous, ...page.images] : page.images));
        setTotal(page.total);
        setHasMore(page.hasMore);
      } catch (loadError) {
        setError(normalizeCatalogError(loadError));
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize, queryCatalogPage],
  );

  const refresh = useCallback(async () => {
    await loadPage(0, 'replace');
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await loadPage(entries.length, 'append');
  }, [entries.length, hasMore, isLoading, loadPage]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const view = useMemo(() => createCatalogView(entries), [entries]);

  return {
    entries,
    view,
    total,
    hasMore,
    isLoading,
    error,
    refresh,
    loadMore,
  };
}

export function useStudioCatalogController({
  activeWorkspaceId,
  addToast,
}: UseStudioCatalogControllerOptions): UseStudioCatalogControllerResult {
  const activeCatalog = useCatalog({
    workspaceId: activeWorkspaceId,
    deleted: false,
  });
  const workspaceCatalog = useCatalog({
    deleted: false,
  });
  const trashCatalog = useCatalog({
    deleted: true,
  });

  const catalogVisualGroupCount = activeCatalog.view.byBatchId.size;
  const queueResults = useMemo(
    () =>
      buildStudioQueueResultPreviews(activeCatalog.entries, {
        limit: 24,
        toAssetUrl: toStudioAssetUrl,
      }),
    [activeCatalog.entries],
  );
  const queueResultPreviews = useMemo(
    () => queueResults.slice(0, 3).map(({ id, src }) => ({ id, src })),
    [queueResults],
  );
  const catalogTrashGroups = useMemo(
    () => buildArchivedImageGroupsFromCatalog(trashCatalog.view),
    [trashCatalog.view],
  );

  const refreshCatalogs = useCallback(() => {
    void Promise.all([activeCatalog.refresh(), workspaceCatalog.refresh(), trashCatalog.refresh()]);
  }, [activeCatalog, trashCatalog, workspaceCatalog]);

  const runCatalogMutation = useCallback(
    (operation: Promise<unknown>, fallbackMessage: string) => {
      void operation
        .then(() => {
          refreshCatalogs();
        })
        .catch((error) => {
          addToast(resolveCatalogMutationError(error, fallbackMessage), 'error');
        });
    },
    [addToast, refreshCatalogs],
  );

  const deleteCatalogImage = useCallback(
    (imageId: string) => {
      runCatalogMutation(deleteCatalogImageRequest(imageId), `Unable to archive image ${imageId}`);
    },
    [runCatalogMutation],
  );

  const deleteCatalogImages = useCallback(
    (imageIds: string[]) => {
      if (imageIds.length === 0) {
        return;
      }

      runCatalogMutation(
        Promise.all(imageIds.map((imageId) => deleteCatalogImageRequest(imageId))),
        'Unable to archive selected images',
      );
    },
    [runCatalogMutation],
  );

  const toggleCatalogFavorite = useCallback(
    (imageId: string) => {
      const current = activeCatalog.view.byId.get(imageId);

      runCatalogMutation(
        updateCatalogImageRequest(imageId, {
          isFavorite: !(current?.isFavorite ?? false),
        }),
        'Unable to update favorite',
      );
    },
    [activeCatalog.view.byId, runCatalogMutation],
  );

  const clearCatalogWorkspace = useCallback(
    (workspaceId: string) => {
      const imageIds = collectWorkspaceCatalogImageIds(activeCatalog.entries, workspaceId);

      if (imageIds.length === 0) {
        return;
      }

      runCatalogMutation(
        Promise.all(imageIds.map((imageId) => deleteCatalogImageRequest(imageId))),
        'Unable to archive workspace images',
      );
    },
    [activeCatalog.entries, runCatalogMutation],
  );

  const restoreCatalogBatch = useCallback(
    (batchId: string) => {
      const entries = trashCatalog.view.byBatchId.get(batchId) ?? [];

      if (entries.length === 0) {
        return;
      }

      runCatalogMutation(
        Promise.all(entries.map((entry) => restoreCatalogImageRequest(entry.id))),
        'Unable to restore catalog batch',
      );
    },
    [runCatalogMutation, trashCatalog.view.byBatchId],
  );

  const restoreAllCatalogTrash = useCallback(() => {
    if (trashCatalog.entries.length === 0) {
      return;
    }

    runCatalogMutation(
      Promise.all(trashCatalog.entries.map((entry) => restoreCatalogImageRequest(entry.id))),
      'Unable to restore catalog trash',
    );
  }, [runCatalogMutation, trashCatalog.entries]);

  const emptyCatalogTrash = useCallback(() => {
    if (trashCatalog.entries.length === 0) {
      return;
    }

    runCatalogMutation(
      Promise.all(trashCatalog.entries.map((entry) => purgeCatalogImageRequest(entry.id))),
      'Unable to empty catalog trash',
    );
  }, [runCatalogMutation, trashCatalog.entries]);

  return {
    activeCatalog,
    workspaceCatalog,
    trashCatalog,
    catalogVisualGroupCount,
    queueResults,
    queueResultPreviews,
    catalogTrashGroups,
    refreshCatalogs,
    deleteCatalogImage,
    deleteCatalogImages,
    toggleCatalogFavorite,
    clearCatalogWorkspace,
    restoreCatalogBatch,
    restoreAllCatalogTrash,
    emptyCatalogTrash,
  };
}
