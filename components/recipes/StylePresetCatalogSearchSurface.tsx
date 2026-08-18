import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  IconCheck as Check,
  IconChevronDown as ChevronDown,
  IconSearch as Search,
  IconX as X,
  IconArrowRight as ArrowRight,
  IconDatabase as Database,
  IconSparkles as Sparkles,
  IconLoader as LoaderCircle,
} from '@tabler/icons-react';
import {
  getStyleCategoryImage,
  getStyleThumbnail,
  STYLE_CATEGORY_PREVIEWS,
} from '../../lib/styleThumbnailCatalog';
import { styleCategoryImageKey } from '../../lib/recipeAssetKeys';
import { resolveStylePreviewImage } from '../../lib/stylePresetVisuals';
import { DemandMountedGsapDropdown } from '../ui/DemandMountedGsapDropdown';

import {
  type StylePresetCatalogSearchIndex,
  type StylePresetCatalogSearchResult,
} from './stylePresetManifests';
import {
  STYLE_PRESET_CATALOG_SEARCH_PACK_SUMMARIES,
  loadStylePresetCatalogSearchIndex,
} from './stylePresetCatalogSearchData';
import {
  buildStyleSearchFilters,
  planStyleSearchPackIds,
  projectStyleSearchResultsFromIndex,
  STYLE_SEARCH_TASK_FILTERS,
} from './styleSearchProjection';

interface StylePresetCatalogSearchSurfaceProps {
  onClose: () => void;
  onSelectPreset: (result: StylePresetCatalogSearchResult) => void;
  onApplyPreset: (result: StylePresetCatalogSearchResult) => void;
}

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
  const [isPackFilterOpen, setIsPackFilterOpen] = useState(false);
  const packFilterButtonRef = useRef<HTMLButtonElement>(null);
  const packFilterId = useId();

  const filters = useMemo(
    () =>
      buildStyleSearchFilters({
        query,
        packId: packId || undefined,
        task: task || undefined,
        limit: 80,
      }),
    [packId, query, task],
  );
  const packIdsToLoad = useMemo(
    () =>
      planStyleSearchPackIds({
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
  const packFilterOptions = useMemo(
    () => [
      { id: '', name: 'All Packs', presetCount: totalPresetCount },
      ...STYLE_PRESET_CATALOG_SEARCH_PACK_SUMMARIES,
    ],
    [totalPresetCount],
  );
  const activePackFilter =
    packFilterOptions.find((pack) => pack.id === packId) ?? packFilterOptions[0];

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
    () =>
      searchIndex
        ? projectStyleSearchResultsFromIndex({
            searchIndex,
            filters,
          })
        : [],
    [filters, searchIndex],
  );

  return (
    <div
      data-style-catalog-root
      data-style-catalog-state={searchIndex ? 'ready' : isLoading ? 'loading' : 'empty'}
      data-style-catalog-results-count={searchIndex ? results.length : -1}
      className="absolute inset-0 z-40 flex flex-col bg-black/86"
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
              <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                {searchIndex.totalPresetCount} loaded / {totalPresetCount} presets
              </p>
            ) : (
              <div className="mt-1 flex items-center gap-1.5 text-zinc-500">
                <LoaderCircle size={10} className="animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
                  Loading...
                </span>
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

        <div className="relative min-w-[190px]">
          <button
            ref={packFilterButtonRef}
            type="button"
            onClick={() => setIsPackFilterOpen((open) => !open)}
            className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-xl border bg-black/50 px-3 text-left transition-[background-color,border-color,color,transform] ${
              isPackFilterOpen
                ? 'border-white/25 text-white'
                : 'border-white/10 text-zinc-300 hover:border-white/20 hover:bg-white/[0.04]'
            }`}
            aria-label={`Filter style catalog by pack: ${activePackFilter?.name ?? 'All Packs'}`}
            aria-haspopup="listbox"
            aria-expanded={isPackFilterOpen}
            aria-controls={packFilterId}
          >
            <span className="min-w-0">
              <span className="block truncate text-[10px] font-black uppercase tracking-widest">
                {activePackFilter?.name ?? 'All Packs'}
              </span>
              <span className="mt-0.5 block truncate text-[8px] font-bold uppercase tracking-widest text-zinc-600">
                {activePackFilter?.presetCount ?? totalPresetCount} presets
              </span>
            </span>
            <ChevronDown
              size={14}
              className={`shrink-0 text-zinc-600 transition-[color,transform] ${
                isPackFilterOpen ? 'rotate-180 text-white' : ''
              }`}
              aria-hidden="true"
            />
          </button>
          <DemandMountedGsapDropdown
            id={packFilterId}
            open={isPackFilterOpen}
            onOpenChange={setIsPackFilterOpen}
            triggerRef={packFilterButtonRef}
            placement="bottom-left"
            portal
            role="listbox"
            aria-label="Filter style catalog by pack"
            className="absolute left-0 top-[calc(100%+0.5rem)] z-50 max-h-80 w-72 overflow-y-auto p-1.5"
          >
            {packFilterOptions.map((pack) => {
              const selected = pack.id === packId;
              return (
                <button
                  type="button"
                  key={pack.id || 'all'}
                  role="option"
                  aria-selected={selected}
                  data-dropdown-item
                  onClick={() => {
                    setPackId(pack.id);
                    setIsPackFilterOpen(false);
                  }}
                  className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-[background-color,color] ${
                    selected
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[10px] font-black uppercase tracking-widest">
                      {pack.name}
                    </span>
                    <span
                      className={`mt-0.5 block text-[8px] font-bold uppercase tracking-widest ${
                        selected ? 'text-black/55' : 'text-zinc-600'
                      }`}
                    >
                      {pack.presetCount} presets
                    </span>
                  </span>
                  {selected ? <Check size={13} className="shrink-0" aria-hidden="true" /> : null}
                </button>
              );
            })}
          </DemandMountedGsapDropdown>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/50 p-1">
          {STYLE_SEARCH_TASK_FILTERS.map((filter) => (
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
              const resultImageFromDefault = getStyleThumbnail(result.id);
              const categoryImage = getStyleCategoryImage(
                styleCategoryImageKey(result.packId, result.categoryName),
              );
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
                          loading="lazy"
                          decoding="async"
                          className="size-full object-cover transition-transform duration-200 motion-safe:group-hover:scale-[1.02]"
                        />
                        {resultImageIsPreview ? (
                          <div className="absolute left-2 top-2 z-10 rounded-full border border-sky-400/30 bg-sky-500/15 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-sky-100 shadow-lg">
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
