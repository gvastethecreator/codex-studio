import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CatalogImage, CatalogPage } from '../packages/shared/src';
import { useLatestRef } from './useLatestRef';
import { createCatalogRequestGate, type CatalogRequestToken } from '../lib/catalogRequestGate';
import { createCatalogView, type StudioCatalogView } from '../lib/studioCatalogView';
import {
  queryCatalog,
  getCatalogImageDetail,
  type CatalogQueryParams,
} from '../services/studio-api/catalog';

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

function normalizeCatalogError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}
function createCatalogFilterKey(filters: CatalogQueryParams) {
  return JSON.stringify(
    Object.entries(filters).sort(([left], [right]) => left.localeCompare(right)),
  );
}

export function useCatalogPage({
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

  const filtersRef = useLatestRef(filters);
  const filtersKey = createCatalogFilterKey(filters);
  const filtersKeyRef = useRef(filtersKey);
  const requestGateRef = useRef<ReturnType<typeof createCatalogRequestGate> | null>(null);
  requestGateRef.current ??= createCatalogRequestGate();
  const requestGate = requestGateRef.current;
  const detailRequestsRef = useRef(
    new Map<string, { generation: number; promise: Promise<void> }>(),
  );
  useLayoutEffect(() => {
    if (filtersKeyRef.current === filtersKey) return;
    filtersKeyRef.current = filtersKey;
    requestGate.invalidate();
    detailRequestsRef.current.clear();
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
  }, [filtersRef, loadPage, requestGate]);

  const loadMore = useCallback(async () => {
    if (!hasMore) return;
    const token = requestGate.beginAppend();
    if (!token) return;
    await loadPage(entries.length, 'append', token, { ...filtersRef.current });
  }, [entries.length, filtersRef, hasMore, loadPage, requestGate]);

  const hydrateDetail = useCallback(
    (imageId: string): Promise<void> => {
      const generation = requestGate.getGeneration();
      const existing = detailRequestsRef.current.get(imageId);
      if (existing?.generation === generation) return existing.promise;
      const promise = getCatalogImageDetail(imageId)
        .then((detail) => {
          if (requestGate.getGeneration() !== generation) return;
          setEntries((previous) =>
            previous.map((entry) => (entry.id === imageId ? detail : entry)),
          );
        })
        .finally(() => {
          if (detailRequestsRef.current.get(imageId)?.promise === promise) {
            detailRequestsRef.current.delete(imageId);
          }
        });
      detailRequestsRef.current.set(imageId, { generation, promise });
      return promise;
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
    return () => {
      requestGate.invalidate();
      detailRequestsRef.current.clear();
    };
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
