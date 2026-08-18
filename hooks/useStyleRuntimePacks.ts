import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  loadStyleRuntimePack,
  STYLE_RUNTIME_PACK_SUMMARIES,
  type StyleRuntimePack,
} from '../components/recipes/stylesData';

const STYLE_RUNTIME_PACK_ID_SET = new Set(STYLE_RUNTIME_PACK_SUMMARIES.map((pack) => pack.id));
export const STYLE_RUNTIME_PACK_LOAD_BATCH_SIZE = 3;

export function chunkStyleRuntimePackIds(
  packIds: readonly string[],
  batchSize = STYLE_RUNTIME_PACK_LOAD_BATCH_SIZE,
) {
  const size = Math.max(1, Math.floor(batchSize));
  const batches: string[][] = [];
  for (let index = 0; index < packIds.length; index += size) {
    batches.push(packIds.slice(index, index + size));
  }
  return batches;
}

export function resolveRequiredStyleRuntimePackIds({
  requiredPackIds,
  loadAll,
}: {
  requiredPackIds: readonly string[];
  loadAll: boolean;
}) {
  const source = loadAll ? STYLE_RUNTIME_PACK_SUMMARIES.map((pack) => pack.id) : requiredPackIds;
  return Array.from(new Set(source.filter((packId) => STYLE_RUNTIME_PACK_ID_SET.has(packId))));
}

export function useStyleRuntimePacks({
  requiredPackIds,
  loadAll,
}: {
  requiredPackIds: readonly string[];
  loadAll: boolean;
}) {
  const [packsById, setPacksById] = useState<Record<string, StyleRuntimePack>>({});
  const [loadState, setLoadState] = useState({
    isLoading: false,
    error: null as Error | null,
    retryVersion: 0,
  });
  const requiredPackKey = requiredPackIds.join('|');
  const requestedPackIds = useMemo(
    () =>
      resolveRequiredStyleRuntimePackIds({
        requiredPackIds: requiredPackKey ? requiredPackKey.split('|') : [],
        loadAll,
      }),
    [loadAll, requiredPackKey],
  );

  const loadPacks = useCallback(async (packIds: readonly string[]) => {
    try {
      const packs = await Promise.all(packIds.map((packId) => loadStyleRuntimePack(packId)));
      const loaded = packs.filter((pack): pack is StyleRuntimePack => pack !== null);
      if (loaded.length > 0) {
        setPacksById((current) => cacheLoadedPacks(current, loaded));
      }
      setLoadState((current) => ({ ...current, error: null }));
      return loaded;
    } catch (error) {
      setLoadState((current) => ({
        ...current,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
      throw error;
    }
  }, []);

  useEffect(() => {
    if (requestedPackIds.length === 0) return;
    let cancelled = false;
    setLoadState((current) => ({ ...current, isLoading: true, error: null }));
    void (async () => {
      try {
        for (const batch of chunkStyleRuntimePackIds(requestedPackIds)) {
          const packs = await Promise.all(batch.map((packId) => loadStyleRuntimePack(packId)));
          if (cancelled) return;
          const loaded = packs.filter((pack): pack is StyleRuntimePack => pack !== null);
          if (loaded.length > 0) {
            setPacksById((current) => cacheLoadedPacks(current, loaded));
          }
        }
        if (!cancelled) {
          setLoadState((current) => ({ ...current, isLoading: false, error: null }));
        }
      } catch (error) {
        if (cancelled) return;
        setLoadState((current) => ({
          ...current,
          isLoading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadState.retryVersion, requestedPackIds]);

  const retryStylePacks = useCallback(() => {
    setLoadState((current) => ({ ...current, retryVersion: current.retryVersion + 1 }));
  }, []);

  return {
    loadedStylePacksById: packsById,
    loadStyleRuntimePacks: loadPacks,
    isLoadingStylePacks: loadState.isLoading,
    styleRuntimeError: loadState.error,
    retryStylePacks,
  };
}

function cacheLoadedPacks(current: Record<string, StyleRuntimePack>, loaded: StyleRuntimePack[]) {
  let changed = false;
  const next = { ...current };
  for (const pack of loaded) {
    if (next[pack.id] === pack) continue;
    next[pack.id] = pack;
    changed = true;
  }
  return changed ? next : current;
}
