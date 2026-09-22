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
  IconInfoCircle as Info,
  IconHeart as Heart,
  IconCopy as Copy,
  IconTextPlus as TextPlus,
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
  selectedIds?: ReadonlySet<string>;
  maxSlots?: number;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
  onCopyPrompt?: (result: StylePresetCatalogSearchResult) => void;
  onUsePrompt?: (result: StylePresetCatalogSearchResult) => void;
  onClose: () => void;
  onSelectPreset: (result: StylePresetCatalogSearchResult) => void;
  onApplyPreset: (result: StylePresetCatalogSearchResult) => void;
}

type StyleCatalogLoadState =
  | { status: 'loading' }
  | { status: 'ready'; searchIndex: StylePresetCatalogSearchIndex }
  | { status: 'error' };

export const StylePresetCatalogSearchSurface: React.FC<StylePresetCatalogSearchSurfaceProps> = ({
  onClose,
  onSelectPreset,
  onApplyPreset,
  selectedIds,
  maxSlots = 5,
  favorites = [],
  onToggleFavorite,
  onCopyPrompt,
  onUsePrompt,
}) => {
  const [catalogLoad, setCatalogLoad] = useState<StyleCatalogLoadState>({
    status: 'loading',
  });
  const searchIndex = catalogLoad.status === 'ready' ? catalogLoad.searchIndex : null;
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [query, setQuery] = useState('');
  const [information, setInformation] = useState<StylePresetCatalogSearchResult | null>(null);
  const informationRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (information) informationRef.current?.showModal();
  }, [information]);
  const [packId, setPackId] = useState('');
  const [task, setTask] = useState('');
  const [isPackFilterOpen, setIsPackFilterOpen] = useState(false);
  const packFilterButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const packFilterId = useId();

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const filters = useMemo(
    () =>
      buildStyleSearchFilters({
        query,
        packId: packId || undefined,
        task: task || undefined,
        limit: 100000,
      }),
    [packId, query, task],
  );
  const packIdsToLoadKey = useMemo(
    () =>
      planStyleSearchPackIds({
        packSummaries: STYLE_PRESET_CATALOG_SEARCH_PACK_SUMMARIES,
        filters,
      }).join('|'),
    [filters],
  );
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
    setCatalogLoad({ status: 'loading' });
    const packIds = packIdsToLoadKey ? packIdsToLoadKey.split('|') : [];
    void loadStylePresetCatalogSearchIndex(packIds).then(
      (loaded) => {
        if (!cancelled) setCatalogLoad({ status: 'ready', searchIndex: loaded });
      },
      () => {
        if (!cancelled) setCatalogLoad({ status: 'error' });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [packIdsToLoadKey, loadAttempt]);

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
      data-style-catalog-state={catalogLoad.status}
      data-style-catalog-results-count={searchIndex ? results.length : -1}
      className="absolute inset-0 z-40 flex flex-col bg-[color:var(--wba-bg)]"
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[color:var(--wb-line)] px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] text-[color:var(--wb-ink)]">
            <Database size={17} />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold tracking-normal text-[color:var(--wb-ink)]">
              Style Catalog
            </h3>
            {searchIndex ? (
              <p className="mt-1 truncate text-[length:var(--wbp-label)] font-bold tracking-[0.16em] text-[color:var(--wb-muted)]">
                {searchIndex.totalPresetCount} loaded / {totalPresetCount} presets
              </p>
            ) : catalogLoad.status === 'loading' ? (
              <div className="mt-1 flex items-center gap-1.5 text-[color:var(--wb-muted)]">
                <LoaderCircle size={10} className="animate-spin" />
                <span className="text-[length:var(--wbp-label)] font-bold tracking-[0.16em]">
                  Loading...
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex size-9 items-center justify-center rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] text-[color:var(--wb-muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]"
          aria-label="Close style catalog"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-[color:var(--wb-line)] px-6 py-4">
        <div className="flex min-w-70 flex-1 items-center gap-2 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-3 py-2">
          <Search size={15} className="text-[color:var(--wb-muted)]" />
          <input
            data-style-catalog-search-input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search presets, tags, DNA..."
            aria-label="Search presets"
            className="w-full border-none bg-transparent text-xs font-medium text-[color:var(--wb-ink)] outline-none placeholder:text-[color:var(--wb-dim)]"
            ref={searchInputRef}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear catalog search">
              <X
                size={13}
                className="text-[color:var(--wb-muted)] hover:text-[color:var(--wb-ink)]"
              />
            </button>
          )}
        </div>

        <div className="relative min-w-[190px]">
          <button
            ref={packFilterButtonRef}
            type="button"
            onClick={() => setIsPackFilterOpen((open) => !open)}
            className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-[var(--wb-radius)] border bg-[color:var(--wb-well)] px-3 text-left transition-[background-color,border-color,color,transform] ${
              isPackFilterOpen
                ? 'border-[color:var(--wb-line)] text-[color:var(--wb-ink)]'
                : 'border-[color:var(--wb-line)] text-[color:var(--wb-ink)] hover:border-[color:var(--wb-border)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_4%,transparent)]'
            }`}
            aria-label={`Filter style catalog by pack: ${activePackFilter?.name ?? 'All Packs'}`}
            aria-haspopup="listbox"
            aria-expanded={isPackFilterOpen}
            aria-controls={packFilterId}
          >
            <span className="min-w-0">
              <span className="block truncate text-[length:var(--wbp-label)] font-semibold tracking-normal">
                {activePackFilter?.name ?? 'All Packs'}
              </span>
              <span className="mt-0.5 block truncate text-[length:var(--wbp-label)] font-bold tracking-normal text-[color:var(--wb-dim)]">
                {activePackFilter?.presetCount ?? totalPresetCount} presets
              </span>
            </span>
            <ChevronDown
              size={14}
              className={`shrink-0 text-[color:var(--wb-dim)] transition-[color,transform] ${
                isPackFilterOpen ? 'rotate-180 text-[color:var(--wb-ink)]' : ''
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
                  className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-[var(--wb-radius)] px-3 py-2 text-left transition-[background-color,color] ${
                    selected
                      ? 'bg-white text-black'
                      : 'text-[color:var(--wb-muted)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[length:var(--wbp-label)] font-semibold tracking-normal">
                      {pack.name}
                    </span>
                    <span
                      className={`mt-0.5 block text-[length:var(--wbp-label)] font-bold tracking-normal ${
                        selected ? 'text-black/55' : 'text-[color:var(--wb-dim)]'
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

        <div className="flex items-center gap-1 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-1">
          {STYLE_SEARCH_TASK_FILTERS.map((filter) => (
            <button
              type="button"
              key={filter.id || 'all'}
              onClick={() => setTask(filter.id)}
              className={`h-8 rounded-[var(--wb-radius)] px-2.5 text-[length:var(--wbp-label)] font-semibold tracking-normal transition-colors ${
                task === filter.id
                  ? 'bg-white text-black'
                  : 'text-[color:var(--wb-muted)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
        {catalogLoad.status === 'error' ? (
          <div className="flex h-full min-h-80 flex-col items-center justify-center gap-4 text-[color:var(--wb-muted)]">
            <p role="alert" className="text-sm">
              Could not load the style catalog.
            </p>
            <button
              type="button"
              onClick={() => setLoadAttempt((attempt) => attempt + 1)}
              className="rounded-[var(--wb-radius)] border border-[color:var(--wb-border)] px-4 py-2 text-sm font-semibold text-[color:var(--wb-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Try again
            </button>
          </div>
        ) : !searchIndex ? (
          <div
            role="status"
            className="flex h-full min-h-80 flex-col items-center justify-center gap-4 text-[color:var(--wb-dim)]"
          >
            <LoaderCircle size={32} className="animate-spin opacity-25" />
            <span className="text-xs font-semibold tracking-normal">Loading catalog…</span>
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
                  className="group relative flex min-w-0 gap-4 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_3%,transparent)] p-3 transition-colors hover:border-[color:var(--wb-border)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)]"
                >
                  <button
                    type="button"
                    className="catalog-card-hit"
                    aria-label={`${selectedIds?.has(result.id) ? 'Remove' : 'Select'} style ${result.name}`}
                    aria-pressed={selectedIds?.has(result.id) ?? false}
                    disabled={(selectedIds?.size ?? 0) >= maxSlots && !selectedIds?.has(result.id)}
                    onClick={() => onApplyPreset(result)}
                  />
                  {selectedIds?.has(result.id) && (
                    <span className="catalog-selected-mark" aria-hidden="true">
                      ✓
                    </span>
                  )}
                  <div className="relative h-24 w-18 shrink-0 overflow-hidden rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)]">
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
                          <div className="absolute left-2 top-2 z-10 rounded-full border border-sky-400/2 bg-sky-500/15 px-2 py-1 text-[length:var(--wbp-label)] font-semibold tracking-[0.14em] text-[color:var(--wb-info)]  shadow-lg">
                            Preview
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="flex size-full items-center justify-center text-[color:var(--wb-dim)]">
                        <Sparkles size={18} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <span className="rounded-full border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] px-2 py-0.5 text-[7px] font-semibold tracking-normal text-[color:var(--wb-muted)]">
                            {result.id}
                          </span>
                          <span className="rounded-full border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] px-2 py-0.5 text-[7px] font-semibold tracking-normal text-[color:var(--wb-muted)]">
                            {result.categoryName}
                          </span>
                        </div>
                        <h4 className="mt-2 truncate text-sm font-semibold tracking-tight text-[color:var(--wb-ink)]">
                          {result.name}
                        </h4>
                        <p className="mt-1 truncate text-[length:var(--wbp-label)] font-bold tracking-normal text-[color:var(--wb-muted)]">
                          {result.packName}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {result.tags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-1.5 py-1 text-[length:var(--wbp-label)] font-bold text-[color:var(--wb-muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="catalog-hover-actions relative z-10 mt-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Information about ${result.name}`}
                        onClick={() => setInformation(result)}
                      >
                        <Info size={16} />
                      </button>
                      {onToggleFavorite && (
                        <button
                          type="button"
                          aria-label={`${favorites.includes(result.id) ? 'Unfavorite' : 'Favorite'} ${result.name}`}
                          aria-pressed={favorites.includes(result.id)}
                          onClick={() => onToggleFavorite(result.id)}
                        >
                          <Heart
                            size={16}
                            fill={favorites.includes(result.id) ? 'currentColor' : 'none'}
                          />
                        </button>
                      )}
                      {onCopyPrompt && (
                        <button
                          type="button"
                          aria-label={`Copy prompt for ${result.name}`}
                          onClick={() => onCopyPrompt(result)}
                        >
                          <Copy size={16} />
                        </button>
                      )}
                      {onUsePrompt && (
                        <button
                          type="button"
                          aria-label={`Use ${result.name} as prompt`}
                          onClick={() => onUsePrompt(result)}
                        >
                          <TextPlus size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full min-h-80 flex-col items-center justify-center gap-4 text-[color:var(--wb-dim)]">
            <Search size={32} className="opacity-25" />
            <span className="text-xs font-semibold tracking-normal">No presets found</span>
          </div>
        )}
      </div>
      {information && (
        <dialog
          ref={informationRef}
          className="style-detail-dialog"
          aria-label={`Information about ${information.name}`}
          onClose={() => setInformation(null)}
          onCancel={() => setInformation(null)}
        >
          <div className="flex items-center justify-between gap-4 p-4">
            <h3>{information.name}</h3>
            <button
              type="button"
              aria-label="Close style information"
              onClick={() => informationRef.current?.close()}
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <p>
              {information.packName} · {information.categoryName}
            </p>
            <p>{information.styleAnchors?.join(', ') || information.tags.join(', ')}</p>
            <p>Supports: {information.supportedTasks.join(', ')}</p>
            <button
              type="button"
              onClick={() => {
                onSelectPreset(information);
                setInformation(null);
              }}
            >
              <ArrowRight size={14} /> Browse category
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
};
