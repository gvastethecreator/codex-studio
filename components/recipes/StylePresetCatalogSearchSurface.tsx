import React, { useEffect, useMemo, useState } from 'react';
import {
  IconSearch as Search,
  IconX as X,
  IconArrowRight as ArrowRight,
  IconDatabase as Database,
  IconSparkles as Sparkles,
  IconLoader as LoaderCircle,
} from '@tabler/icons-react';
import {
  STYLE_CATEGORY_IMAGES,
  STYLE_CATEGORY_PREVIEWS,
  STYLE_DEFAULT_IMAGES,
} from '../../lib/recipeAssetCatalog';
import { styleCategoryImageKey } from '../../lib/recipeAssetKeys';
import { resolveStylePreviewImage } from '../../lib/stylePresetVisuals';

import {
  resolveStylePresetCatalogSearchPackIds,
  searchStylePresetCatalogIndex,
  type StylePresetCatalogSearchIndex,
  type StylePresetCatalogSearchResult,
} from './stylePresetManifests';
import {
  STYLE_PRESET_CATALOG_SEARCH_PACK_SUMMARIES,
  loadStylePresetCatalogSearchIndex,
} from './stylePresetCatalogSearchData';

interface StylePresetCatalogSearchSurfaceProps {
  onClose: () => void;
  onSelectPreset: (result: StylePresetCatalogSearchResult) => void;
  onApplyPreset: (result: StylePresetCatalogSearchResult) => void;
}

const TASK_FILTERS = [
  { id: '', label: 'All' },
  { id: 'image_generate', label: 'Image' },
  { id: 'image_edit', label: 'Edit' },
  { id: 'style_preset_card', label: 'Cards' },
  { id: 'sprite_sheet', label: 'Sprites' },
  { id: 'texture_generate', label: 'Textures' },
];

type StyleCatalogLoadState = {
  searchIndex: StylePresetCatalogSearchIndex | null;
  isLoading: boolean;
};

export const StylePresetCatalogSearchSurface: React.FC<StylePresetCatalogSearchSurfaceProps> = ({
  onClose,
  onSelectPreset,
  onApplyPreset,
}) => {
  const [catalogLoad, setCatalogLoad] = useState<StyleCatalogLoadState>({
    searchIndex: null,
    isLoading: true,
  });
  const { searchIndex, isLoading } = catalogLoad;
  const [query, setQuery] = useState('');
  const [packId, setPackId] = useState('');
  const [task, setTask] = useState('');

  const filters = useMemo(
    () => ({
      query,
      packId: packId || undefined,
      task: task || undefined,
      limit: 80,
    }),
    [packId, query, task],
  );
  const packIdsToLoad = useMemo(
    () =>
      resolveStylePresetCatalogSearchPackIds({
        packSummaries: STYLE_PRESET_CATALOG_SEARCH_PACK_SUMMARIES,
        filters,
      }),
    [filters],
  );
  const packIdsToLoadKey = packIdsToLoad.join('|');
  const totalPresetCount = STYLE_PRESET_CATALOG_SEARCH_PACK_SUMMARIES.reduce(
    (total, pack) => total + pack.presetCount,
    0,
  );

  useEffect(() => {
    let cancelled = false;
    setCatalogLoad({ searchIndex: null, isLoading: true });
    void loadStylePresetCatalogSearchIndex(packIdsToLoad).then((loaded) => {
      if (!cancelled) {
        setCatalogLoad({ searchIndex: loaded, isLoading: false });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [packIdsToLoad, packIdsToLoadKey]);

  const results = useMemo(
    () => (searchIndex ? searchStylePresetCatalogIndex(searchIndex, filters) : []),
    [filters, searchIndex],
  );

  return (
    <div
      data-style-catalog-root
      data-style-catalog-state={searchIndex ? 'ready' : isLoading ? 'loading' : 'empty'}
      data-style-catalog-results-count={searchIndex ? results.length : -1}
      className="absolute inset-0 z-40 flex flex-col bg-black/86 backdrop-blur-xl"
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300">
            <Database size={17} />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
              Style Catalog
            </h3>
            {searchIndex ? (
              <p className="mt-1 truncate text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                {searchIndex.totalPresetCount} loaded / {totalPresetCount} presets
              </p>
            ) : (
              <div className="mt-1 flex items-center gap-1.5 text-zinc-500">
                <LoaderCircle size={10} className="animate-spin" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Loading…</span>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close style catalog"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-white/5 px-6 py-4">
        <div className="flex min-w-70 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-3 py-2">
          <Search size={15} className="text-zinc-500" />
          <input
            data-style-catalog-search-input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search presets, tags, DNA..."
            aria-label="Search presets"
            className="w-full border-none bg-transparent text-xs font-medium text-white outline-none placeholder:text-zinc-600"
            ref={(el) => el?.focus()}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear catalog search">
              <X size={13} className="text-zinc-500 hover:text-white" />
            </button>
          )}
        </div>

        <select
          value={packId}
          onChange={(event) => setPackId(event.target.value)}
          className="h-10 rounded-xl border border-white/10 bg-black/50 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-300 outline-none"
          aria-label="Filter style catalog by pack"
        >
          <option value="">All Packs</option>
          {STYLE_PRESET_CATALOG_SEARCH_PACK_SUMMARIES.map((pack) => (
            <option key={pack.id} value={pack.id}>
              {pack.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/50 p-1">
          {TASK_FILTERS.map((filter) => (
            <button
              type="button"
              key={filter.id || 'all'}
              onClick={() => setTask(filter.id)}
              className={`h-8 rounded-lg px-2.5 text-[9px] font-black uppercase tracking-widest transition-colors ${
                task === filter.id
                  ? 'bg-white text-black'
                  : 'text-zinc-500 hover:bg-white/8 hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
        {!searchIndex ? (
          <div className="flex h-full min-h-80 flex-col items-center justify-center gap-4 text-zinc-600">
            <LoaderCircle size={32} className="animate-spin opacity-25" />
            <span className="text-xs font-black uppercase tracking-widest">Loading catalog…</span>
          </div>
        ) : results.length > 0 ? (
          <div data-style-catalog-results className="grid grid-cols-1 gap-3 2xl:grid-cols-2">
            {results.map((result) => {
              const resultImageFromDefault = result.defaultImage || STYLE_DEFAULT_IMAGES[result.id];
              const categoryImage =
                STYLE_CATEGORY_IMAGES[styleCategoryImageKey(result.packId, result.categoryName)];
              const resultImageFromPreview = resolveStylePreviewImage({
                categoryImage,
                categoryPreviewImage: STYLE_CATEGORY_PREVIEWS[result.categoryName],
              });
              const resultImage = resultImageFromDefault || resultImageFromPreview;
              const resultImageIsPreview =
                !resultImageFromDefault && Boolean(resultImageFromPreview);
              return (
                <div
                  key={result.id}
                  data-style-catalog-result
                  data-style-catalog-result-id={result.id}
                  className="group flex min-w-0 gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-3 transition-colors hover:border-white/15 hover:bg-white/[0.06]"
                >
                  <div className="relative h-24 w-18 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-950">
                    {resultImage ? (
                      <>
                        <img
                          src={resultImage}
                          alt={result.name}
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {resultImageIsPreview ? (
                          <div className="absolute left-2 top-2 z-10 rounded-full border border-sky-400/30 bg-sky-500/15 px-2 py-1 text-[8px] font-black uppercase tracking-[0.22em] text-sky-100 shadow-lg backdrop-blur-md">
                            Preview
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="flex size-full items-center justify-center text-zinc-600">
                        <Sparkles size={18} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.2em] text-zinc-400">
                            {result.id}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.2em] text-zinc-400">
                            {result.categoryName}
                          </span>
                        </div>
                        <h4 className="mt-2 truncate text-sm font-black uppercase tracking-tight text-white">
                          {result.name}
                        </h4>
                        <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                          {result.packName}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {result.tags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-white/8 bg-black/35 px-1.5 py-1 text-[8px] font-bold text-zinc-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectPreset(result)}
                        className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <ArrowRight size={13} />
                        Select
                      </button>
                      <button
                        type="button"
                        onClick={() => onApplyPreset(result)}
                        className="flex h-9 items-center gap-2 rounded-lg border border-accent-500/30 bg-accent-500/12 px-3 text-[10px] font-black uppercase tracking-widest text-accent-100 transition-colors hover:bg-accent-500/20"
                      >
                        <Sparkles size={13} />
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full min-h-80 flex-col items-center justify-center gap-4 text-zinc-600">
            <Search size={32} className="opacity-25" />
            <span className="text-xs font-black uppercase tracking-widest">No presets found</span>
          </div>
        )}
      </div>
    </div>
  );
};
