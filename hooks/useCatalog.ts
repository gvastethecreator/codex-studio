import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CatalogImage, CatalogPage, CatalogWorkspaceSummary } from '../packages/shared/src';
import { buildArchivedImageGroupsFromCatalog } from '../lib/studioCatalogTrashView';
import {
  describeCatalogOperationResult,
  type CatalogRefreshScope,
} from '../lib/catalogOperationResult';
import { CATALOG_RENDER_BUDGET } from '../lib/catalogRenderBudget';
import { createCatalogRequestGate, type CatalogRequestToken } from '../lib/catalogRequestGate';
import { buildStudioQueueResultPreviews } from '../lib/studioQueueResults';
import { createCatalogView, type StudioCatalogView } from '../lib/studioCatalogView';
import {
  createCatalogMutationReconciliationPolicy,
  type CatalogMutationReconciliationPolicy,
} from './catalogMutationReconciliationPolicy';
import {
  deleteCatalogImage as deleteCatalogImageRequest,
  archiveCatalogByFilter,
  purgeCatalogByFilter,
  queryCatalogWorkspaceSummaries,
  queryCatalog,
  getCatalogImageDetail,
  restoreCatalogByFilter,
  toStudioAssetUrl,
  type CatalogQueryParams,
  updateCatalogImage as updateCatalogImageRequest,
} from '../services/localStudioService';

export interface UseCatalogOptions extends CatalogQueryParams {
  pageSize?: number;
  enabled?: boolean;
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
  hydrateDetail: (imageId: string) => Promise<void>;
}

export interface UseStudioCatalogControllerOptions {
  activeWorkspaceId: string;
  isTrashOpen: boolean;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export interface UseStudioCatalogControllerResult {
  activeCatalog: UseCatalogResult;
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
  hydrateCatalogDetail: (imageId: string) => Promise<void>;
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
      const normalizedError = normalizeCatalogError(loadError);
      setError(normalizedError);
      throw normalizedError;
    }
  }, []);

  useEffect(() => {
    void refresh().catch(() => undefined);
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
  enabled = true,
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
  const filtersKeyRef = useRef(filtersKey);
  const requestGateRef = useRef<ReturnType<typeof createCatalogRequestGate> | null>(null);
  requestGateRef.current ??= createCatalogRequestGate();
  const requestGate = requestGateRef.current;
  const detailRequestIdsRef = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    if (filtersKeyRef.current === filtersKey) return;
    filtersKeyRef.current = filtersKey;
    requestGate.invalidate();
    detailRequestIdsRef.current.clear();
  }, [filtersKey, requestGate]);

  const loadPage = useCallback(
    async (
      offset: number,
      mode: 'replace' | 'append',
      token: CatalogRequestToken,
      requestFilters: CatalogQueryParams,
      propagateError = false,
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const page = await queryCatalogPage({
          ...requestFilters,
          offset,
          limit: requestFilters.limit ?? pageSize,
        });
        if (!requestGate.isCurrent(token)) return;
        setEntries((previous) => (mode === 'append' ? [...previous, ...page.images] : page.images));
        setTotal(page.total);
        setHasMore(page.hasMore);
      } catch (loadError) {
        if (!requestGate.isCurrent(token)) return;
        const normalizedError = normalizeCatalogError(loadError);
        setError(normalizedError);
        if (propagateError) throw normalizedError;
      } finally {
        if (requestGate.finish(token)) setIsLoading(false);
      }
    },
    [pageSize, queryCatalogPage, requestGate],
  );

  const refresh = useCallback(async () => {
    const token = requestGate.beginReplace();
    await loadPage(0, 'replace', token, { ...filtersRef.current }, true);
  }, [loadPage, requestGate]);

  const loadMore = useCallback(async () => {
    if (!hasMore) return;
    const token = requestGate.beginAppend();
    if (!token) return;
    await loadPage(entries.length, 'append', token, { ...filtersRef.current });
  }, [entries.length, hasMore, loadPage, requestGate]);

  const hydrateDetail = useCallback(
    async (imageId: string) => {
      const requestId = (detailRequestIdsRef.current.get(imageId) ?? 0) + 1;
      detailRequestIdsRef.current.set(imageId, requestId);
      const generation = requestGate.getGeneration();
      const detail = await getCatalogImageDetail(imageId);
      if (
        requestGate.getGeneration() !== generation ||
        detailRequestIdsRef.current.get(imageId) !== requestId
      ) {
        return;
      }
      setEntries((previous) => previous.map((entry) => (entry.id === imageId ? detail : entry)));
    },
    [requestGate],
  );

  useEffect(() => {
    if (!enabled) {
      requestGate.invalidate();
      setIsLoading(false);
      return;
    }
    void refresh().catch(() => undefined);
  }, [enabled, filtersKey, refresh, requestGate]);

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
    hydrateDetail,
  };
}

export function useStudioCatalogController({
  activeWorkspaceId,
  isTrashOpen,
  addToast,
}: UseStudioCatalogControllerOptions): UseStudioCatalogControllerResult {
  const activeCatalog = useCatalog({
    workspaceId: activeWorkspaceId,
    deleted: false,
    pageSize: CATALOG_RENDER_BUDGET.activePageSize,
  });
  const workspaceSummaryCatalog = useCatalogWorkspaceSummaries();
  const trashCatalog = useCatalog({
    deleted: true,
    enabled: isTrashOpen,
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
  const refreshWorkspaceSummaries = workspaceSummaryCatalog.refresh;
  const refreshTrashCatalog = trashCatalog.refresh;
  const mutationReconciliationRef = useRef<CatalogMutationReconciliationPolicy | null>(null);
  const refreshCatalogs = useCallback(
    async (scope: CatalogRefreshScope = { kind: 'all' }) => {
      const reconciliationPolicy = mutationReconciliationRef.current;
      const reconciliationGeneration = reconciliationPolicy?.getGeneration();
      if (scope.kind === 'active') {
        await refreshActiveCatalog();
        reconciliationPolicy?.acknowledge(scope, reconciliationGeneration);
        return;
      }

      if (scope.kind === 'workspace') {
        await Promise.all([refreshActiveCatalog(), refreshWorkspaceSummaries()]);
        reconciliationPolicy?.acknowledge(scope, reconciliationGeneration);
        return;
      }

      if (scope.kind === 'trash') {
        await refreshTrashCatalog();
        reconciliationPolicy?.acknowledge(scope, reconciliationGeneration);
        return;
      }

      await Promise.all([
        refreshActiveCatalog(),
        refreshWorkspaceSummaries(),
        refreshTrashCatalog(),
      ]);
      reconciliationPolicy?.acknowledge(scope, reconciliationGeneration);
    },
    [refreshActiveCatalog, refreshWorkspaceSummaries, refreshTrashCatalog],
  );

  useEffect(() => {
    const policy = createCatalogMutationReconciliationPolicy({
      reconcile: refreshCatalogs,
    });
    mutationReconciliationRef.current = policy;
    return () => {
      policy.dispose();
      if (mutationReconciliationRef.current === policy) {
        mutationReconciliationRef.current = null;
      }
    };
  }, [refreshCatalogs]);

  const runCatalogMutation = useCallback(
    async (operation: Promise<unknown>, fallbackMessage: string) => {
      try {
        const result = await operation;
        const toast = describeCatalogOperationResult(result);
        if (toast) addToast(toast.message, toast.type);
        mutationReconciliationRef.current?.request({ kind: 'all' });
      } catch (error) {
        addToast(resolveCatalogMutationError(error, fallbackMessage), 'error');
      }
    },
    [addToast],
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
        archiveCatalogByFilter({ ids: imageIds, isDeleted: false }),
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
        restoreCatalogByFilter({ batchId, isDeleted: true }),
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
    hydrateCatalogDetail: activeCatalog.hydrateDetail,
  };
}
