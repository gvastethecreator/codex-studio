import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CatalogImage, CatalogPage } from '../packages/shared/src';
import { createCatalogView, type StudioCatalogView } from '../lib/studioCatalogView';
import { queryCatalog, type CatalogQueryParams } from '../services/localStudioService';

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
    [
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
