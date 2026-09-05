import { useCallback, useEffect, useRef, useState } from 'react';
import type { CatalogWorkspaceSummary } from '../packages/shared/src';
import { queryCatalogWorkspaceSummaries } from '../services/studio-api/catalog';

export function useCatalogWorkspaceSummaries() {
  const [summaries, setSummaries] = useState<CatalogWorkspaceSummary[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const requestGeneration = ++generation.current;
    try {
      const next = await queryCatalogWorkspaceSummaries({ deleted: false });
      if (requestGeneration !== generation.current) return;
      setSummaries(next);
      setError(null);
    } catch (cause) {
      if (requestGeneration !== generation.current) return;
      const normalized = cause instanceof Error ? cause : new Error(String(cause));
      setError(normalized);
      throw normalized;
    }
  }, []);
  useEffect(() => {
    void refresh().catch(() => undefined);
    return () => {
      generation.current += 1;
    };
  }, [refresh]);
  return { summaries, error, refresh };
}
