import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CatalogImage, CatalogPage } from '../packages/shared/src';
import {
  createCatalogView,
  materializeVisualBatchesFromCatalog,
  type StudioCatalogView,
} from '../lib/studioCatalogView';
import { queryCatalog, type CatalogQueryParams } from '../services/localStudioService';

export interface UseCatalogOptions extends CatalogQueryParams {
  pageSize?: number;
  queryCatalogPage?: (params: CatalogQueryParams) => Promise<CatalogPage>;
}

export interface UseCatalogResult {
  entries: CatalogImage[];
  view: StudioCatalogView;
  visualBatches: ReturnType<typeof materializeVisualBatchesFromCatalog>;
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

function normalizeCatalogError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
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

  const loadPage = useCallback(
    async (offset: number, mode: 'replace' | 'append') => {
      setIsLoading(true);
      setError(null);
      try {
        const page = await queryCatalogPage({
          ...filters,
          offset,
          limit: filters.limit ?? pageSize,
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
    [
      filters.batchId,
      filters.deleted,
      filters.favorite,
      filters.jobId,
      filters.libraryId,
      filters.limit,
      filters.q,
      filters.workspaceId,
      pageSize,
      queryCatalogPage,
    ],
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
  const visualBatches = useMemo(() => materializeVisualBatchesFromCatalog(view), [view]);

  return {
    entries,
    view,
    visualBatches,
    total,
    hasMore,
    isLoading,
    error,
    refresh,
    loadMore,
  };
}
