import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CatalogImage, CatalogPage } from '../packages/shared/src';
import { buildArchivedImageGroupsFromCatalog } from '../lib/studioCatalogTrashView';
import { buildStudioQueueResultPreviews } from '../lib/studioQueueResults';
import { createCatalogView, type StudioCatalogView } from '../lib/studioCatalogView';
import {
  deleteCatalogImage as deleteCatalogImageRequest,
  archiveCatalogByFilter,
  purgeCatalogByFilter,
  queryCatalog,
  restoreCatalogByFilter,
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
  clearCatalogWorkspace: (workspaceId: string) => Promise<void>;
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

function createCatalogFilterKey(filters: CatalogQueryParams) {
  return JSON.stringify(
    Object.entries(filters).sort(([left], [right]) => left.localeCompare(right)),
  );
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
  const filtersKey = createCatalogFilterKey(filters);

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
  }, [filtersKey, refresh]);

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

  const refreshActiveCatalog = activeCatalog.refresh;
  const refreshWorkspaceCatalog = workspaceCatalog.refresh;
  const refreshTrashCatalog = trashCatalog.refresh;
  const refreshCatalogs = useCallback(async () => {
    await Promise.all([refreshActiveCatalog(), refreshWorkspaceCatalog(), refreshTrashCatalog()]);
  }, [refreshActiveCatalog, refreshWorkspaceCatalog, refreshTrashCatalog]);

  const runCatalogMutation = useCallback(
    async (operation: Promise<unknown>, fallbackMessage: string) => {
      try {
        await operation;
        await refreshCatalogs();
      } catch (error) {
        addToast(resolveCatalogMutationError(error, fallbackMessage), 'error');
      }
    },
    [addToast, refreshCatalogs],
  );

  const deleteCatalogImage = useCallback(
    (imageId: string) => {
      void runCatalogMutation(
        deleteCatalogImageRequest(imageId),
        `Unable to archive image ${imageId}`,
      );
    },
    [runCatalogMutation],
  );

  const deleteCatalogImages = useCallback(
    (imageIds: string[]) => {
      if (imageIds.length === 0) {
        return;
      }

      void runCatalogMutation(
        Promise.all(imageIds.map((imageId) => deleteCatalogImageRequest(imageId))),
        'Unable to archive selected images',
      );
    },
    [runCatalogMutation],
  );

  const toggleCatalogFavorite = useCallback(
    (imageId: string) => {
      const current = activeCatalog.view.byId.get(imageId);

      void runCatalogMutation(
        updateCatalogImageRequest(imageId, {
          isFavorite: !(current?.isFavorite ?? false),
        }),
        'Unable to update favorite',
      );
    },
    [activeCatalog.view.byId, runCatalogMutation],
  );

  const clearCatalogWorkspace = useCallback(
    async (workspaceId: string) => {
      await runCatalogMutation(
        archiveCatalogByFilter({ workspaceId, isDeleted: false }),
        'Unable to archive workspace images',
      );
    },
    [runCatalogMutation],
  );

  const restoreCatalogBatch = useCallback(
    (batchId: string) => {
      const entries = trashCatalog.view.byBatchId.get(batchId) ?? [];

      if (entries.length === 0) {
        return;
      }

      void runCatalogMutation(
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

    void runCatalogMutation(
      restoreCatalogByFilter({ isDeleted: true }),
      'Unable to restore catalog trash',
    );
  }, [runCatalogMutation, trashCatalog.entries]);

  const emptyCatalogTrash = useCallback(() => {
    if (trashCatalog.entries.length === 0) {
      return;
    }

    void runCatalogMutation(
      purgeCatalogByFilter({ isDeleted: true }),
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
