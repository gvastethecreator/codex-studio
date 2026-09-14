import { useCatalogWorkspaceSummaries } from './useCatalogWorkspaceSummaries';
import { useCatalogPage, type UseCatalogResult } from './useCatalogPage';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { CatalogImage, CatalogWorkspaceSummary } from '../packages/shared/src';
import { buildArchivedImageGroupsFromCatalog } from '../lib/studioCatalogTrashView';
import {
  describeCatalogOperationResult,
  type CatalogRefreshScope,
} from '../lib/catalogOperationResult';
import { CATALOG_RENDER_BUDGET } from '../lib/catalogRenderBudget';
import { buildStudioQueueResultPreviews } from '../lib/studioQueueResults';
import {
  createCatalogMutationReconciliationPolicy,
  type CatalogMutationReconciliationPolicy,
} from './catalogMutationReconciliationPolicy';
import {
  deleteCatalogImage as deleteCatalogImageRequest,
  archiveCatalogByFilter,
  purgeCatalogByFilter,
  restoreCatalogByFilter,
  updateCatalogImage as updateCatalogImageRequest,
} from '../services/studio-api/catalog';
import { toStudioAssetUrl } from '../services/studio-api/assetUrls';

export interface UseStudioCatalogControllerOptions {
  query?: string;
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
  refreshCatalogs: (scope?: CatalogRefreshScope) => Promise<void>;
  deleteCatalogImage: (imageId: string) => void;
  deleteCatalogImages: (imageIds: string[]) => void;
  toggleCatalogFavorite: (imageId: string) => void;
  clearCatalogWorkspace: (workspaceId: string) => Promise<void>;
  restoreCatalogBatch: (batchId: string) => void;
  restoreAllCatalogTrash: () => void;
  emptyCatalogTrash: () => void;
  hydrateCatalogDetail: (imageId: string) => Promise<void>;
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

export function useStudioCatalogController({
  query = '',
  activeWorkspaceId,
  isTrashOpen,
  addToast,
}: UseStudioCatalogControllerOptions): UseStudioCatalogControllerResult {
  const activeCatalog = useCatalogPage({
    q: query,
    workspaceId: activeWorkspaceId,
    deleted: false,
    pageSize: CATALOG_RENDER_BUDGET.activePageSize,
  });
  const workspaceSummaryCatalog = useCatalogWorkspaceSummaries();
  const trashCatalog = useCatalogPage({
    deleted: true,
    enabled: isTrashOpen,
    pageSize: CATALOG_RENDER_BUDGET.trashPageSize,
  });

  const catalogVisualGroupCount = activeCatalog.view.byBatchId.size;
  const queueResults = useMemo(
    () =>
      buildStudioQueueResultPreviews(activeCatalog.view.entries, {
        alreadySorted: true,
        limit: CATALOG_RENDER_BUDGET.queuePreviewLimit,
        toAssetUrl: toStudioAssetUrl,
      }),
    [activeCatalog.view.entries],
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
        if (isTrashOpen) await refreshTrashCatalog();
        reconciliationPolicy?.acknowledge(scope, reconciliationGeneration);
        return;
      }

      await Promise.all([
        refreshActiveCatalog(),
        refreshWorkspaceSummaries(),
        ...(isTrashOpen ? [refreshTrashCatalog()] : []),
      ]);
      reconciliationPolicy?.acknowledge(scope, reconciliationGeneration);
    },
    [refreshActiveCatalog, refreshWorkspaceSummaries, refreshTrashCatalog, isTrashOpen],
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
