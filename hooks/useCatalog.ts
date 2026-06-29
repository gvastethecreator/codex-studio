import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CatalogImage, CatalogPage, CatalogWorkspaceSummary } from '../packages/shared/src';
import { buildArchivedImageGroupsFromCatalog } from '../lib/studioCatalogTrashView';
import {
  describeCatalogOperationResult,
  type CatalogRefreshScope,
} from '../lib/catalogOperationResult';
import { CATALOG_RENDER_BUDGET } from '../lib/catalogRenderBudget';
import { buildStudioQueueResultPreviews } from '../lib/studioQueueResults';
import { createCatalogView, type StudioCatalogView } from '../lib/studioCatalogView';
import {
  deleteCatalogImage as deleteCatalogImageRequest,
  archiveCatalogByFilter,
  purgeCatalogByFilter,
  queryCatalogWorkspaceSummaries,
  queryCatalog,
  restoreCatalogByFilter,
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
  workspaceSummaries: CatalogWorkspaceSummary[];
  trashCatalog: UseCatalogResult;
  catalogVisualGroupCount: number;
  queueResults: ReturnType<typeof buildStudioQueueResultPreviews>;
  queueResultPreviews: Array<{ id: string; src: string }>;
  catalogTrashGroups: ReturnType<typeof buildArchivedImageGroupsFromCatalog>;
  refreshCatalogs: (scope?: CatalogRefreshScope) => void;
  deleteCatalogImage: (imageId: string) => void;
  deleteCatalogImages: (imageIds: string[]) => void;
  toggleCatalogFavorite: (imageId: string) => void;
  clearCatalogWorkspace: (workspaceId: string) => Promise<void>;
  restoreCatalogBatch: (batchId: string) => void;
  restoreAllCatalogTrash: () => void;
  emptyCatalogTrash: () => void;
}

function useCatalogWorkspaceSummaries() {
  const [summaries, setSummaries] = useState<CatalogWorkspaceSummary[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      const nextSummaries = await queryCatalogWorkspaceSummaries({ deleted: false });
      setSummaries(nextSummaries);
      setError(null);
    } catch (loadError) {
      setError(normalizeCatalogError(loadError));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { summaries, error, refresh };
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

function useCatalog({
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
    pageSize: CATALOG_RENDER_BUDGET.activePageSize,
  });
  const workspaceCatalog = useCatalog({
    deleted: false,
    pageSize: CATALOG_RENDER_BUDGET.workspaceSummaryPageSize,
  });
  const workspaceSummaryCatalog = useCatalogWorkspaceSummaries();
  const trashCatalog = useCatalog({
    deleted: true,
    pageSize: CATALOG_RENDER_BUDGET.trashPageSize,
  });

  const catalogVisualGroupCount = activeCatalog.view.byBatchId.size;
  const queueResults = useMemo(
    () =>
      buildStudioQueueResultPreviews(activeCatalog.entries, {
        limit: CATALOG_RENDER_BUDGET.queuePreviewLimit,
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
  const refreshWorkspaceSummaries = workspaceSummaryCatalog.refresh;
  const refreshTrashCatalog = trashCatalog.refresh;
  const refreshCatalogs = useCallback(
    async (scope: CatalogRefreshScope = { kind: 'all' }) => {
      if (scope.kind === 'active') {
        await refreshActiveCatalog();
        return;
      }

      if (scope.kind === 'workspace') {
        await Promise.all([
          refreshActiveCatalog(),
          refreshWorkspaceCatalog(),
          refreshWorkspaceSummaries(),
        ]);
        return;
      }

      if (scope.kind === 'trash') {
        await refreshTrashCatalog();
        return;
      }

      await Promise.all([
        refreshActiveCatalog(),
        refreshWorkspaceCatalog(),
        refreshWorkspaceSummaries(),
        refreshTrashCatalog(),
      ]);
    },
    [refreshActiveCatalog, refreshWorkspaceCatalog, refreshWorkspaceSummaries, refreshTrashCatalog],
  );

  const runCatalogMutation = useCallback(
    async (
      operation: Promise<unknown>,
      fallbackMessage: string,
      refreshScope: CatalogRefreshScope = { kind: 'all' },
    ) => {
      try {
        const result = await operation;
        const toast = describeCatalogOperationResult(result);
        if (toast) addToast(toast.message, toast.type);
        await refreshCatalogs(refreshScope);
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
        { kind: 'all' },
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
        { kind: 'all' },
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
        { kind: 'workspace', workspaceId: current?.workspaceId ?? null },
      );
    },
    [activeCatalog.view.byId, runCatalogMutation],
  );

  const clearCatalogWorkspace = useCallback(
    async (workspaceId: string) => {
      await runCatalogMutation(
        archiveCatalogByFilter({ workspaceId, isDeleted: false }),
        'Unable to archive workspace images',
        { kind: 'all' },
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
        restoreCatalogByFilter({ batchId, isDeleted: true }),
        'Unable to restore catalog batch',
        { kind: 'all' },
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
      { kind: 'all' },
    );
  }, [runCatalogMutation, trashCatalog.entries]);

  const emptyCatalogTrash = useCallback(() => {
    if (trashCatalog.entries.length === 0) {
      return;
    }

    void runCatalogMutation(
      purgeCatalogByFilter({ isDeleted: true }),
      'Unable to empty catalog trash',
      { kind: 'trash' },
    );
  }, [runCatalogMutation, trashCatalog.entries]);

  return {
    activeCatalog,
    workspaceCatalog,
    workspaceSummaries: workspaceSummaryCatalog.summaries,
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
