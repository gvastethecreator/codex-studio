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
  preserveLoadedPages?: boolean;
  selectedId?: string | null;
  queryCatalogPage?: (params: CatalogQueryParams) => Promise<CatalogPage>;
}

export interface UseCatalogResult {
  scopeKey?: string;
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
  preserveLoadedPages = false,
  selectedId,
  queryCatalogPage = queryCatalog,
  ...filters
}: UseCatalogOptions = {}): UseCatalogResult {
  const [entries, setEntries] = useState<CatalogImage[]>([]);
  const [retainedSelection, setRetainedSelection] = useState<CatalogImage | null>(null);
  const selectedIdRef = useLatestRef(selectedId);
  const entriesRef = useLatestRef(entries);
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
    entriesRef.current = [];
    setEntries([]);
    setRetainedSelection(null);
    setIsLoading(enabled);
    setTotal(0);
    setHasMore(false);
    setError(null);
    requestGate.invalidate();
    detailRequestsRef.current.clear();
  }, [enabled, entriesRef, filtersKey, requestGate]);

  const retainSelection = useCallback(
    async (
      images: CatalogImage[],
      requestFilters: CatalogQueryParams,
      token: CatalogRequestToken,
    ) => {
      const id = selectedIdRef.current;
      const selected =
        preserveLoadedPages && id && !images.some((image) => image.id === id)
          ? ((await queryCatalogPage({ ...requestFilters, id, offset: 0, limit: 1 })).images.find(
              (image) => image.id === id,
            ) ?? null)
          : null;
      if (requestGate.isCurrent(token)) setRetainedSelection(selected);
    },
    [preserveLoadedPages, queryCatalogPage, requestGate, selectedIdRef],
  );

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
        if (mode === 'replace') await retainSelection(page.images, requestFilters, token);
        if (!requestGate.isCurrent(token)) return;
        setEntries((previous) =>
          mode === 'append'
            ? [...new Map([...previous, ...page.images].map((entry) => [entry.id, entry])).values()]
            : page.images,
        );
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
    [pageSize, queryCatalogPage, requestGate, retainSelection],
  );

  const refresh = useCallback(async () => {
    const token = requestGate.beginReplace();
    if (!preserveLoadedPages || entriesRef.current.length <= pageSize) {
      await loadPage(0, 'replace', token, { ...filtersRef.current }, true);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const target = entriesRef.current.length;
      const refreshed: CatalogImage[] = [];
      let page: CatalogPage;
      do {
        page = await queryCatalogPage({
          ...filtersRef.current,
          offset: refreshed.length,
          limit: pageSize,
        });
        if (!requestGate.isCurrent(token)) return;
        refreshed.push(...page.images);
      } while (page.hasMore && page.images.length && refreshed.length < target);
      await retainSelection(refreshed, { ...filtersRef.current }, token);
      if (!requestGate.isCurrent(token)) return;
      setEntries([...new Map(refreshed.map((entry) => [entry.id, entry])).values()]);
      setTotal(page.total);
      setHasMore(page.hasMore);
    } catch (error) {
      if (requestGate.isCurrent(token)) setError(normalizeCatalogError(error));
    } finally {
      if (requestGate.finish(token)) setIsLoading(false);
    }
  }, [
    entriesRef,
    filtersRef,
    loadPage,
    pageSize,
    preserveLoadedPages,
    retainSelection,
    queryCatalogPage,
    requestGate,
  ]);

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
          setRetainedSelection((entry) => (entry?.id === imageId ? detail : entry));
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

  const visibleEntries = useMemo(
    () =>
      retainedSelection &&
      retainedSelection.id === selectedId &&
      !entries.some((entry) => entry.id === retainedSelection.id)
        ? [...entries, retainedSelection].sort(
            (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
          )
        : entries,
    [entries, retainedSelection, selectedId],
  );
  const view = useMemo(() => createCatalogView(visibleEntries), [visibleEntries]);

  return {
    scopeKey: filtersKey,
    entries: visibleEntries,
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
