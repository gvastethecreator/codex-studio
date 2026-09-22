import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  loadStylePresetCatalogSearchIndex,
  STYLE_PRESET_CATALOG_SEARCH_PACK_SUMMARIES,
} from './stylePresetCatalogSearchData';
import type {
  StylePresetCatalogSearchIndex,
  StylePresetCatalogSearchIndexEntry,
} from './stylePresetManifests';
import type { StyleRuntimePack, StyleRuntimePreset } from './styles/runtimeTypes';
import type { StyleBrowserSortOrder } from './styleBrowserRenderPlan';

export function PagedStyleCatalog({
  query,
  sortOrder,
  favorites,
  favoritesOnly,
  extraIndex,
  loadedPacks,
  loadPacks,
  renderCard,
  columns,
  grouped,
  onWidthChange,
}: {
  query: string;
  sortOrder: StyleBrowserSortOrder;
  favorites: string[];
  favoritesOnly: boolean;
  extraIndex: StylePresetCatalogSearchIndex | null;
  loadedPacks: Record<string, StyleRuntimePack>;
  loadPacks: (ids: readonly string[]) => Promise<StyleRuntimePack[]>;
  renderCard: (preset: StyleRuntimePreset) => React.ReactNode;
  columns: number;
  grouped: boolean;
  onWidthChange: (width: number) => void;
}) {
  const [index, setIndex] = useState<StylePresetCatalogSearchIndex | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => onWidthChange(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, [onWidthChange]);
  useEffect(() => {
    let cancelled = false;
    loadStylePresetCatalogSearchIndex(
      STYLE_PRESET_CATALOG_SEARCH_PACK_SUMMARIES.map((pack) => pack.id),
    ).then(
      (value) => {
        if (!cancelled) {
          setIndex(value);
          setError(false);
        }
      },
      () => {
        if (!cancelled) setError(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);
  const results = useMemo(() => {
    const search = query.trim().toLowerCase();
    const entries = [...(extraIndex?.presets ?? []), ...(index?.presets ?? [])].filter(
      (entry) =>
        (!search || entry.searchableText.includes(search)) &&
        (!favoritesOnly || favorites.includes(entry.id)),
    );
    if (sortOrder === 'az' || sortOrder === 'za')
      entries.sort(
        (a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true }) *
          (sortOrder === 'za' ? -1 : 1),
      );
    else if (sortOrder !== 'source') {
      const key = sortOrder.startsWith('created') ? 'createdAt' : 'updatedAt';
      const timestamp = (entry: StylePresetCatalogSearchIndexEntry) =>
        typeof entry[key] === 'number'
          ? (entry[key] as number)
          : Date.parse(String(entry[key] ?? '')) || 0;
      entries.sort((a, b) => (timestamp(a) - timestamp(b)) * (sortOrder.endsWith('desc') ? -1 : 1));
    }
    return entries;
  }, [extraIndex, favorites, favoritesOnly, index, query, sortOrder]);
  const unloadedPackKey = [...new Set(results.map((entry) => entry.packId))]
    .filter((id) => !loadedPacks[id])
    .join('|');
  useEffect(() => {
    if (!unloadedPackKey) return;
    let cancelled = false;
    setError(false);
    void loadPacks(unloadedPackKey.split('|')).catch(() => {
      if (!cancelled) setError(true);
    });
    return () => {
      cancelled = true;
    };
  }, [unloadedPackKey, loadPacks, attempt]);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [query, sortOrder, favoritesOnly]);
  const groups = new Map<string, StylePresetCatalogSearchIndexEntry[]>();
  for (const entry of results) {
    const key = grouped ? `${entry.packName} / ${entry.categoryName}` : '';
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }
  return (
    <div className="paged-style-catalog">
      <div
        ref={scrollRef}
        className="paged-style-catalog-scroll custom-scrollbar"
        aria-busy={!index || Boolean(unloadedPackKey)}
      >
        {error ? (
          <button type="button" onClick={() => setAttempt((value) => value + 1)}>
            Could not load styles · Retry
          </button>
        ) : !index ? (
          <p role="status">Loading styles…</p>
        ) : !results.length ? (
          <p>No styles found matching criteria.</p>
        ) : null}
        {[...groups].map(([name, entries]) => (
          <section key={name}>
            {name && <h3>{name}</h3>}
            <div
              className="paged-style-grid"
              style={{ gridTemplateColumns: `repeat(${Math.max(1, columns)}, minmax(0, 1fr))` }}
            >
              {entries.map((entry) => {
                const preset = loadedPacks[entry.packId]?.presets.find(
                  (candidate) => candidate.id === entry.id,
                );
                return preset ? (
                  renderCard(preset)
                ) : (
                  <div
                    key={entry.id}
                    className="style-card-loading"
                    aria-label={`Loading ${entry.name}`}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
