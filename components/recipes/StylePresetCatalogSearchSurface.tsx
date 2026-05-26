import React, { useEffect, useMemo, useState } from 'react';
import { Search, X, ArrowRight, Database, Sparkles, LoaderCircle } from 'lucide-react';

import {
  searchStylePresetCatalog,
  type StylePresetCatalog,
  type StylePresetCatalogSearchResult,
} from './stylePresetManifests';

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

export const StylePresetCatalogSearchSurface: React.FC<StylePresetCatalogSearchSurfaceProps> = ({
  onClose,
  onSelectPreset,
  onApplyPreset,
}) => {
  const [catalog, setCatalog] = useState<StylePresetCatalog | null>(null);
  const [query, setQuery] = useState('');
  const [packId, setPackId] = useState('');
  const [task, setTask] = useState('');

  useEffect(() => {
    let cancelled = false;
    void import('./stylePresetCatalogData')
      .then(({ loadStylePresetCatalog }) => loadStylePresetCatalog())
      .then((loaded) => {
        if (!cancelled) setCatalog(loaded);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(
    () =>
      catalog
        ? searchStylePresetCatalog(catalog, {
            query,
            packId: packId || undefined,
            task: task || undefined,
            limit: 80,
          })
        : [],
    [catalog, packId, query, task],
  );

  return (
    <div
      data-style-catalog-root
      data-style-catalog-state={catalog ? 'ready' : 'loading'}
      data-style-catalog-results-count={catalog ? results.length : -1}
      className="absolute inset-0 z-40 flex flex-col bg-black/86 backdrop-blur-xl"
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300">
            <Database size={17} />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
              Style Catalog
            </h3>
            {catalog ? (
              <p className="mt-1 truncate text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                {catalog.presets.length} presets / {catalog.packs.length} packs
              </p>
            ) : (
              <div className="mt-1 flex items-center gap-1.5 text-zinc-500">
                <LoaderCircle size={10} className="animate-spin" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Loading...</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
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
            className="w-full border-none bg-transparent text-xs font-medium text-white outline-none placeholder:text-zinc-600"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear catalog search">
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
          {catalog?.packs.map((pack) => (
            <option key={pack.manifest.id} value={pack.manifest.id}>
              {pack.manifest.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/50 p-1">
          {TASK_FILTERS.map((filter) => (
            <button
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
        {!catalog ? (
          <div className="flex h-full min-h-80 flex-col items-center justify-center gap-4 text-zinc-600">
            <LoaderCircle size={32} className="animate-spin opacity-25" />
            <span className="text-xs font-black uppercase tracking-widest">Loading catalog...</span>
          </div>
        ) : results.length > 0 ? (
          <div data-style-catalog-results className="grid grid-cols-1 gap-3 2xl:grid-cols-2">
            {results.map((result) => (
              <div
                key={result.id}
                data-style-catalog-result
                data-style-catalog-result-id={result.id}
                className="group flex min-w-0 gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-3 transition-colors hover:border-white/15 hover:bg-white/[0.06]"
              >
                <div className="relative h-24 w-18 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-950">
                  {result.defaultImage ? (
                    <img
                      src={result.defaultImage}
                      alt={result.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-600">
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
                      onClick={() => onSelectPreset(result)}
                      className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <ArrowRight size={13} />
                      Select
                    </button>
                    <button
                      onClick={() => onApplyPreset(result)}
                      className="flex h-9 items-center gap-2 rounded-lg border border-accent-500/30 bg-accent-500/12 px-3 text-[10px] font-black uppercase tracking-widest text-accent-100 transition-colors hover:bg-accent-500/20"
                    >
                      <Sparkles size={13} />
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
