import { AnimatePresence } from '../../lib/gsapMotion';
import {
  IconCheck as Check,
  IconChevronDown as ChevronDown,
  IconChevronLeft as ChevronLeft,
  IconChevronRight as ChevronRight,
  IconChevronUp as ChevronUp,
  IconEye as Eye,
  IconFolder as Folder,
  IconHeart as Heart,
  IconLayoutGrid as LayoutGrid,
  IconPlayerPause as Pause,
  IconPlayerPlay as Play,
  IconPlus as Plus,
  IconSearch as Search,
  IconX as X,
} from '@tabler/icons-react';
import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { styleCategoryImageKey } from '../../lib/recipeAssetKeys';
import { workbenchAmbientPortalProps } from '../../lib/workbenchAmbient';
import {
  getStyleCategoryImage,
  getStyleThumbnail,
  loadStyleThumbnailPack,
  subscribeStyleThumbnailCatalog,
} from '../../lib/styleThumbnailCatalog';
import { getStyleRuntimePresetDisplayName } from './stylesData';
import { StyleCategoryGlyph } from './StyleCategoryGlyph';
import { resolveStyleCategoryIdentity } from './styleCategoryIdentity';
import {
  compactStyleMenuTitle,
  compactStyleParentRoute,
  filterCompactStyleCatalog,
  formatCompactStyleStrength,
  groupCompactStylePresetsByCategory,
  listCompactStylePacks,
  mergeCompactStyleSearchIndexes,
  planCompactStyleCatalogPackIds,
  type CompactStyleRoute,
} from './compactStyleCatalog';
import {
  loadStylePresetCatalogSearchIndex,
  STYLE_PRESET_CATALOG_SEARCH_PACK_SUMMARIES,
} from './stylePresetCatalogSearchData';
import type {
  StylePresetCatalogSearchIndex,
  StylePresetCatalogSearchPackSummary,
  StylePresetCatalogSearchResult,
} from './stylePresetManifests';
import { DEFAULT_SELECTED_STYLE_STRENGTH, type SelectedStyleSlot } from './styleLayerComposer';

export interface CompactStyleSelectorProps {
  selectedStyles: SelectedStyleSlot[];
  maxSlots: number;
  favorites: string[];
  extraIndex?: StylePresetCatalogSearchIndex | null;
  packSummaries?: readonly StylePresetCatalogSearchPackSummary[];
  loadIndex?: (packIds: readonly string[]) => Promise<StylePresetCatalogSearchIndex>;
  loadPreview?: (presetId: string, packId: string) => Promise<string | null>;
  onToggleFavorite: (presetId: string) => void;
  onChooseStyle: (result: StylePresetCatalogSearchResult) => void | Promise<void>;
  onRemove: (presetId: string) => void;
  onSetStrength: (presetId: string, strength: number) => void;
  onToggleEnabled: (presetId: string) => void;
  onMove: (presetId: string, direction: -1 | 1) => void;
  onBrowseCatalog: () => void;
  catalogOpen?: boolean;
}

type CatalogLoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; index: StylePresetCatalogSearchIndex }
  | { status: 'error' };

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

async function defaultLoadPreview(presetId: string, packId: string) {
  if (/^pack_\d+$/.test(packId)) await loadStyleThumbnailPack(packId);
  return getStyleThumbnail(presetId) ?? null;
}

export const CompactStyleSelector: React.FC<CompactStyleSelectorProps> = ({
  selectedStyles,
  maxSlots,
  favorites,
  extraIndex = null,
  packSummaries = STYLE_PRESET_CATALOG_SEARCH_PACK_SUMMARIES,
  loadIndex = loadStylePresetCatalogSearchIndex,
  loadPreview = defaultLoadPreview,
  onToggleFavorite,
  onChooseStyle,
  onRemove,
  onSetStrength,
  onToggleEnabled,
  onMove,
  onBrowseCatalog,
  catalogOpen = false,
}) => {
  const instanceId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const weightRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewAnchorRef = useRef<HTMLElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuHasOpened, setMenuHasOpened] = useState(false);
  const [weightId, setWeightId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [route, setRoute] = useState<CompactStyleRoute>({ view: 'packs' });
  const [catalog, setCatalog] = useState<CatalogLoadState>({ status: 'idle' });
  const [preview, setPreview] = useState<{
    result: StylePresetCatalogSearchResult | null;
    pinned: boolean;
    src: string | null;
    status: 'idle' | 'loading' | 'ready' | 'empty';
  }>({ result: null, pinned: false, src: null, status: 'idle' });
  const [thumbRevision, setThumbRevision] = useState(0);
  const hideTimerRef = useRef(0);
  const showTimerRef = useRef(0);
  const keyboardRef = useRef(false);
  const popoverId = `${instanceId}-popup`;
  const weightIdAttr = `${instanceId}-weight`;
  const previewId = `${instanceId}-preview`;
  const selectedCount = selectedStyles.length;
  const packs = useMemo(
    () => listCompactStylePacks(packSummaries, extraIndex),
    [extraIndex, packSummaries],
  );
  const mergedIndex = useMemo(() => {
    const loaded = catalog.status === 'ready' ? catalog.index : null;
    return mergeCompactStyleSearchIndexes(loaded, extraIndex);
  }, [catalog, extraIndex]);
  const results = useMemo(
    () =>
      filterCompactStyleCatalog({
        index: mergedIndex,
        route,
        query,
        favorites,
      }),
    [favorites, mergedIndex, query, route],
  );
  const categoryGroups = useMemo(
    () =>
      !query.trim() && route.view === 'categories'
        ? groupCompactStylePresetsByCategory(results)
        : [],
    [query, results, route.view],
  );
  const selectedIds = useMemo(
    () => new Set(selectedStyles.map((slot) => slot.preset.id)),
    [selectedStyles],
  );
  const packIdsKey = planCompactStyleCatalogPackIds({ route, query, packSummaries: packs }).join(
    '|',
  );
  const title = compactStyleMenuTitle({
    route,
    query,
    resultCount: results.length,
    packs,
  });
  const showBack = Boolean(query.trim()) || route.view !== 'packs';
  const browseLabel = query.trim() ? '' : route.view === 'all' ? 'Browse packs' : 'All styles';
  const portalProps = workbenchAmbientPortalProps();

  useEffect(() => {
    if (!menuOpen) return;
    const packIds = packIdsKey ? packIdsKey.split('|') : [];
    if (packIds.length === 0) {
      setCatalog({ status: 'ready', index: { packs: [], presets: [], totalPresetCount: 0 } });
      return;
    }
    let cancelled = false;
    setCatalog({ status: 'loading' });
    for (const packId of packIds) {
      if (/^pack_\d+$/.test(packId)) void loadStyleThumbnailPack(packId);
    }
    void loadIndex(packIds).then(
      (index) => {
        if (!cancelled) setCatalog({ status: 'ready', index });
      },
      () => {
        if (!cancelled) setCatalog({ status: 'error' });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [loadIndex, menuOpen, packIdsKey]);

  useEffect(() => subscribeStyleThumbnailCatalog(() => setThumbRevision((value) => value + 1)), []);

  const closePreview = useCallback((restore = false) => {
    window.clearTimeout(showTimerRef.current);
    window.clearTimeout(hideTimerRef.current);
    const anchor = previewAnchorRef.current;
    anchor?.removeAttribute('aria-describedby');
    setPreview((current) => ({
      result: null,
      pinned: false,
      src: current.src,
      status: current.src ? 'ready' : 'idle',
    }));
    if (restore) anchor?.focus({ preventScroll: true });
  }, []);

  const closeMenu = useCallback(
    (restoreFocus = true) => {
      setMenuOpen(false);
      closePreview();
      if (restoreFocus) {
        rootRef.current?.querySelector<HTMLElement>('[data-add]:not([hidden])')?.focus({
          preventScroll: true,
        });
      }
    },
    [closePreview],
  );

  const closeWeight = useCallback(
    (restoreFocus = true) => {
      const id = weightId;
      setWeightId(null);
      if (restoreFocus && id) {
        rootRef.current
          ?.querySelector<HTMLElement>(`[data-strength="${CSS.escape(id)}"]`)
          ?.focus({ preventScroll: true });
      }
    },
    [weightId],
  );

  const openMenu = useCallback(() => {
    closeWeight(false);
    closePreview();
    setMenuHasOpened(true);
    setMenuOpen(true);
  }, [closePreview, closeWeight]);

  const positionPopover = useCallback(() => {
    const pop = popRef.current;
    const root = rootRef.current;
    if (!pop || !root || !menuOpen) return;
    const tray = root.closest<HTMLElement>('.create-tools') ?? root;
    const trayRect = tray.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const width = Math.min(Math.max(rootRect.width, 320), vw - 16);
    pop.style.width = `${width}px`;
    const top = clamp(trayRect.top, 8, Math.max(8, vh - 200));
    const bottom = Math.min(vh - 8, Math.max(top + 200, trayRect.bottom));
    pop.style.height = `${bottom - top}px`;
    let left = trayRect.right + 8;
    if (left + width > vw - 8) {
      left = Math.max(8, trayRect.left - width - 8);
    }
    pop.style.transformOrigin = left >= trayRect.right ? 'top left' : 'top right';
    pop.style.left = `${clamp(left, 8, Math.max(8, vw - width - 8))}px`;
    pop.style.top = `${top}px`;
  }, [menuOpen]);

  const positionWeight = useCallback(() => {
    const panel = weightRef.current;
    const root = rootRef.current;
    if (!panel || !root || !weightId) return;
    const anchor = root.querySelector<HTMLElement>(`[data-strength="${CSS.escape(weightId)}"]`);
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    panel.style.left = `${clamp(rect.right - width, 8, Math.max(8, vw - width - 8))}px`;
    panel.style.top = `${clamp(
      rect.bottom + height + 7 <= vh - 8 ? rect.bottom + 7 : rect.top - height - 7,
      8,
      Math.max(8, vh - height - 8),
    )}px`;
  }, [weightId]);

  const positionPreview = useCallback(() => {
    const panel = previewRef.current;
    const anchor = previewAnchorRef.current;
    if (!panel || !anchor || !preview.result) return;
    const a = anchor.getBoundingClientRect();
    const dockToMenu = Boolean(menuOpen && popRef.current?.contains(anchor));
    const boundary = dockToMenu
      ? popRef.current!.getBoundingClientRect()
      : (rootRef.current?.getBoundingClientRect() ?? a);
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    let left: number;
    if (boundary.right + 10 + width <= vw - 8) {
      left = boundary.right + 10;
    } else if (boundary.left - 10 - width >= 8) {
      left = boundary.left - 10 - width;
    } else {
      left = clamp(a.left, 8, vw - width - 8);
    }
    const top = clamp(a.top + a.height / 2 - height / 2, 8, Math.max(8, vh - height - 8));
    panel.style.left = `${clamp(left, 8, Math.max(8, vw - width - 8))}px`;
    panel.style.top = `${top}px`;
  }, [menuOpen, preview.result]);

  useLayoutEffect(() => {
    positionPopover();
    positionWeight();
    positionPreview();
  }, [positionPopover, positionPreview, positionWeight, results.length, route, query, catalog]);

  useEffect(() => {
    const update = () => {
      positionPopover();
      positionWeight();
      positionPreview();
    };
    window.addEventListener('resize', update);
    document.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      document.removeEventListener('scroll', update, true);
    };
  }, [positionPopover, positionPreview, positionWeight]);

  const showPreview = useCallback(
    async (result: StylePresetCatalogSearchResult, anchor: HTMLElement, pinned: boolean) => {
      window.clearTimeout(hideTimerRef.current);
      window.clearTimeout(showTimerRef.current);
      previewAnchorRef.current?.removeAttribute('aria-describedby');
      previewAnchorRef.current = anchor;
      anchor.setAttribute('aria-describedby', previewId);
      setPreview((current) => ({
        result,
        pinned,
        src: result.defaultImage || current.src,
        status: current.result?.id === result.id && current.src ? current.status : 'loading',
      }));
      const src = result.defaultImage || (await loadPreview(result.id, result.packId));
      setPreview((current) =>
        current.result?.id === result.id
          ? {
              ...current,
              src: src || null,
              status: src ? 'ready' : 'empty',
            }
          : current,
      );
    },
    [loadPreview, previewId],
  );

  const queuePreview = useCallback(
    (result: StylePresetCatalogSearchResult, anchor: HTMLElement, delay = 220) => {
      window.clearTimeout(hideTimerRef.current);
      window.clearTimeout(showTimerRef.current);
      if (preview.result?.id === result.id) {
        previewAnchorRef.current?.removeAttribute('aria-describedby');
        previewAnchorRef.current = anchor;
        anchor.setAttribute('aria-describedby', previewId);
        positionPreview();
        return;
      }
      if (preview.result) {
        void showPreview(result, anchor, false);
        return;
      }
      showTimerRef.current = window.setTimeout(() => {
        if (anchor.isConnected) void showPreview(result, anchor, false);
      }, delay);
    },
    [positionPreview, preview.result, previewId, showPreview],
  );

  const deferHidePreview = useCallback(() => {
    if (preview.pinned) return;
    window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      if (previewRef.current?.matches(':hover')) return;
      closePreview();
    }, 260);
  }, [closePreview, preview.pinned]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      keyboardRef.current = false;
      const target = event.target as Node | null;
      if (!target) return;
      if (
        [rootRef.current, popRef.current, weightRef.current, previewRef.current].some((node) =>
          node?.contains(target),
        )
      ) {
        return;
      }
      closeMenu(false);
      closeWeight(false);
      closePreview();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      keyboardRef.current = true;
      if (
        event.altKey &&
        event.key.toLowerCase() === 's' &&
        rootRef.current?.getClientRects().length
      ) {
        if (document.querySelector('[data-style-browser-root]')) return;
        event.preventDefault();
        openMenu();
        return;
      }
      if (event.key !== 'Escape') return;
      if (preview.pinned && preview.result) {
        event.preventDefault();
        event.stopPropagation();
        closePreview(true);
        return;
      }
      if (weightId) {
        event.preventDefault();
        event.stopPropagation();
        closeWeight();
        return;
      }
      if (menuOpen) {
        event.preventDefault();
        event.stopPropagation();
        closeMenu();
        return;
      }
      if (preview.result) {
        event.preventDefault();
        event.stopPropagation();
        closePreview();
      }
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [closeMenu, closePreview, closeWeight, menuOpen, openMenu, preview, weightId]);

  useEffect(() => {
    if (menuOpen) searchRef.current?.focus({ preventScroll: true });
  }, [menuOpen]);

  const navigate = (next: CompactStyleRoute) => {
    closePreview();
    setRoute(next);
    setQuery('');
    if (listRef.current) listRef.current.scrollTop = 0;
  };

  const goBack = () => {
    if (query.trim()) {
      setQuery('');
      searchRef.current?.focus();
      return;
    }
    navigate(compactStyleParentRoute(route));
  };

  const selectedSlot = (id: string) => selectedStyles.find((slot) => slot.preset.id === id);

  const renderStyleChoice = (result: StylePresetCatalogSearchResult) => {
    const chosen = selectedIds.has(result.id);
    const full = selectedCount >= maxSlots && !chosen;
    const fav = favorites.includes(result.id);
    return (
      <div key={result.id} className="cs-option-wrap">
        <button
          type="button"
          className="cs-choice cs-style-choice"
          data-preview={result.id}
          aria-pressed={chosen}
          aria-disabled={full ? 'true' : undefined}
          aria-label={`${chosen ? 'Remove' : 'Add'} ${result.name}${full ? '; all slots are used' : ''}`}
          onClick={() => {
            if (full) return;
            void onChooseStyle(result);
          }}
          onPointerEnter={(event) => {
            if (event.pointerType === 'touch' || weightId) return;
            queuePreview(result, event.currentTarget);
          }}
          onPointerLeave={() => deferHidePreview()}
          onFocus={(event) => {
            if (keyboardRef.current) queuePreview(result, event.currentTarget, 0);
          }}
          onBlur={deferHidePreview}
        >
          <span className="cs-check">{chosen ? <Check size={14} /> : null}</span>
          <span className="cs-option-text">
            {result.name}
            {query.trim() ? <span className="cs-option-sub">{result.categoryName}</span> : null}
          </span>
        </button>
        <button
          type="button"
          className="cs-peek"
          aria-label={`Preview ${result.name}`}
          onClick={() => {
            const choice = listRef.current?.querySelector<HTMLElement>(
              `[data-preview="${CSS.escape(result.id)}"]`,
            );
            if (choice) void showPreview(result, choice, true);
          }}
        >
          <Eye size={13} />
        </button>
        <button
          type="button"
          className="cs-favorite-option"
          aria-label={`${fav ? 'Unfavorite' : 'Favorite'} ${result.name}`}
          aria-pressed={fav}
          onClick={() => onToggleFavorite(result.id)}
        >
          <Heart size={13} fill={fav ? 'currentColor' : 'none'} />
        </button>
      </div>
    );
  };

  const menu = menuHasOpened
    ? createPortal(
        <div
          {...portalProps}
          ref={popRef}
          id={popoverId}
          className={`${portalProps.className} cs-popover`}
          hidden={!menuOpen}
          inert={!menuOpen}
          data-keyboard={keyboardRef.current || undefined}
          role="dialog"
          aria-label="Add styles"
          onKeyDown={(event) => {
            const choices = [
              ...(listRef.current?.querySelectorAll<HTMLButtonElement>('.cs-choice') ?? []),
            ];
            const index = choices.indexOf(document.activeElement as HTMLButtonElement);
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              if (!choices.length) return;
              event.preventDefault();
              const next =
                index < 0
                  ? event.key === 'ArrowDown'
                    ? 0
                    : choices.length - 1
                  : clamp(index + (event.key === 'ArrowDown' ? 1 : -1), 0, choices.length - 1);
              choices[next]?.focus({ preventScroll: true });
              choices[next]?.scrollIntoView({ block: 'nearest' });
              return;
            }
            if ((event.key === 'Home' || event.key === 'End') && index >= 0) {
              event.preventDefault();
              choices[event.key === 'Home' ? 0 : choices.length - 1]?.focus({
                preventScroll: true,
              });
              return;
            }
            if (
              event.key === 'ArrowLeft' &&
              index >= 0 &&
              (query.trim() || route.view !== 'packs')
            ) {
              event.preventDefault();
              goBack();
              return;
            }
            if (event.key === 'ArrowRight' && index >= 0 && route.view === 'packs') {
              event.preventDefault();
              choices[index]?.click();
            }
          }}
        >
          <div className="cs-search">
            <Search size={15} aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              autoComplete="off"
              spellCheck={false}
              placeholder="Search styles…"
              aria-label="Search all styles"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                closePreview();
                if (listRef.current) listRef.current.scrollTop = 0;
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                listRef.current?.querySelector<HTMLButtonElement>('.cs-choice')?.click();
              }}
            />
            {query ? (
              <button
                type="button"
                className="cs-search-clear"
                aria-label="Clear search"
                onClick={() => {
                  setQuery('');
                  searchRef.current?.focus();
                }}
              >
                <X size={12} />
              </button>
            ) : null}
          </div>
          <div className="cs-breadcrumb">
            {showBack ? (
              <button type="button" className="cs-back" aria-label="Go back" onClick={goBack}>
                <ChevronLeft size={13} />
              </button>
            ) : null}
            <strong title={title}>{title}</strong>
            {browseLabel ? (
              <button
                type="button"
                className="cs-browse"
                onClick={() => navigate({ view: route.view === 'all' ? 'packs' : 'all' })}
              >
                {browseLabel}
                <ChevronRight size={12} />
              </button>
            ) : null}
          </div>
          <div
            ref={listRef}
            className={`cs-menu-list${route.view === 'categories' && !query.trim() ? ' is-pack' : ''}`}
            aria-label="Style catalog"
          >
            {catalog.status === 'loading' ? (
              <div className="cs-empty-result">
                <strong>Loading styles</strong>
                <p>The catalog stays in this menu so the prompt keeps its space.</p>
              </div>
            ) : catalog.status === 'error' ? (
              <div className="cs-empty-result">
                <strong>Could not load styles</strong>
                <p>Open the menu again to retry, or browse the full catalog.</p>
              </div>
            ) : !query.trim() && route.view === 'packs' ? (
              packs.map((pack) => (
                <div key={pack.id} className="cs-option-wrap">
                  <button
                    type="button"
                    className="cs-choice"
                    aria-label={`${pack.name}, ${pack.presetCount} ${pack.presetCount === 1 ? 'style' : 'styles'}`}
                    onClick={() => navigate({ view: 'categories', packId: pack.id })}
                  >
                    <Folder size={13} />
                    <span className="cs-option-text">{pack.name}</span>
                    <span className="cs-dir-count">{pack.presetCount}</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              ))
            ) : !query.trim() && route.view === 'categories' ? (
              categoryGroups.length === 0 ? (
                <div className="cs-empty-result">
                  <strong>No styles found</strong>
                  <p>Try another pack or search by name.</p>
                </div>
              ) : (
                categoryGroups.map((group) => {
                  const identity = resolveStyleCategoryIdentity(group.packId, group.name);
                  const thumb =
                    getStyleCategoryImage(styleCategoryImageKey(group.packId, group.name)) ??
                    getStyleThumbnail(styleCategoryImageKey(group.packId, group.name));
                  void thumbRevision;
                  return (
                    <div key={`${group.packId}:${group.id}`} className="cs-category-block">
                      <div className="cs-category-head" data-category-header={group.id}>
                        <span className={`cs-category-accent ${identity.accentClassName}`} />
                        <span className="cs-category-thumb">
                          {thumb ? (
                            <img src={thumb} alt="" />
                          ) : (
                            <StyleCategoryGlyph iconId={identity.iconId} size={14} />
                          )}
                        </span>
                        <span className={`cs-category-icon ${identity.titleClassName}`}>
                          <StyleCategoryGlyph iconId={identity.iconId} size={12} />
                        </span>
                        <strong className={identity.titleClassName}>{group.name}</strong>
                        <span className="cs-dir-count">{group.presets.length}</span>
                      </div>
                      {group.presets.map((result) => renderStyleChoice(result))}
                    </div>
                  );
                })
              )
            ) : results.length === 0 ? (
              <div className="cs-empty-result">
                <strong>
                  {route.view === 'favorites' && !query.trim()
                    ? 'No favorites yet'
                    : 'No styles found'}
                </strong>
                <p>
                  {route.view === 'favorites' && !query.trim()
                    ? 'Use the heart beside a style to save it.'
                    : 'Try another name, pack or category.'}
                </p>
              </div>
            ) : (
              results.map((result, index) => {
                const showGroup =
                  Boolean(query.trim()) || route.view === 'all' || route.view === 'favorites';
                const previous = results[index - 1];
                const heading =
                  showGroup && result.packName !== previous?.packName ? result.packName : null;
                return (
                  <React.Fragment key={result.id}>
                    {heading ? <div className="cs-group-heading">{heading}</div> : null}
                    {renderStyleChoice(result)}
                  </React.Fragment>
                );
              })
            )}
          </div>
          {selectedCount >= maxSlots ? (
            <div className="cs-limit-note">
              {maxSlots} styles selected. Remove one to add another.
            </div>
          ) : null}
          <div className="cs-footer">
            <button
              type="button"
              className="cs-favorites-view"
              aria-pressed={route.view === 'favorites'}
              onClick={() => navigate({ view: route.view === 'favorites' ? 'all' : 'favorites' })}
            >
              <Heart size={12} />
              Favorites
            </button>
            <span className="cs-footer-status" aria-live="polite">
              {selectedCount} / {maxSlots} selected
            </span>
            <button type="button" className="cs-done" onClick={() => closeMenu()}>
              Done
            </button>
          </div>
        </div>,
        document.body,
      )
    : null;

  const weightSlot = weightId ? selectedSlot(weightId) : null;
  const weightName = weightSlot ? getStyleRuntimePresetDisplayName(weightSlot.preset) : '';
  const weightIndex = weightSlot
    ? selectedStyles.findIndex((slot) => slot.preset.id === weightSlot.preset.id)
    : -1;
  const weight = createPortal(
    <AnimatePresence>
      {weightSlot ? (
        <div
          {...portalProps}
          ref={weightRef}
          id={weightIdAttr}
          className={`${portalProps.className} cs-weight`}
          data-keyboard={keyboardRef.current || undefined}
          role="dialog"
          aria-label="Style intensity"
        >
          <div className="cs-weight-head">
            <strong>Intensity</strong>
            <button
              type="button"
              disabled={weightSlot.strength === DEFAULT_SELECTED_STYLE_STRENGTH}
              onClick={() => onSetStrength(weightSlot.preset.id, DEFAULT_SELECTED_STYLE_STRENGTH)}
            >
              Reset
            </button>
          </div>
          <p className="cs-weight-name">{weightName}</p>
          <div className="cs-range-line">
            <input
              type="range"
              min={10}
              max={100}
              step={1}
              value={Math.round(weightSlot.strength * 100)}
              aria-label={`Intensity for ${weightName}`}
              onChange={(event) =>
                onSetStrength(weightSlot.preset.id, Number(event.target.value) / 100)
              }
            />
            <output>{formatCompactStyleStrength(weightSlot.strength)}</output>
          </div>
          <div className="cs-range-labels">
            <span>10%</span>
            <span>100%</span>
          </div>
          <div className="cs-weight-bottom">
            <button
              type="button"
              className="cs-pause-button"
              onClick={() => onToggleEnabled(weightSlot.preset.id)}
            >
              {weightSlot.enabled === false ? <Play size={12} /> : <Pause size={12} />}
              {weightSlot.enabled === false ? 'Enable style' : 'Pause style'}
            </button>
            <div
              className="cs-order"
              role="group"
              aria-label="Style order"
              hidden={selectedStyles.length < 2}
            >
              <button
                type="button"
                aria-label="Move style up"
                disabled={weightIndex <= 0}
                onClick={() => onMove(weightSlot.preset.id, -1)}
              >
                <ChevronUp size={12} />
              </button>
              <button
                type="button"
                aria-label="Move style down"
                disabled={weightIndex >= selectedStyles.length - 1}
                onClick={() => onMove(weightSlot.preset.id, 1)}
              >
                <ChevronDown size={12} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );

  const previewVisible = Boolean(preview.result);
  const previewPanel = createPortal(
    <div
      {...portalProps}
      ref={previewRef}
      id={previewId}
      className={`${portalProps.className} cs-preview`}
      data-keyboard={keyboardRef.current || undefined}
      data-pinned={String(preview.pinned)}
      data-visible={String(previewVisible)}
      hidden={!previewVisible}
      role={preview.pinned ? 'dialog' : 'tooltip'}
      aria-hidden={previewVisible ? undefined : true}
      aria-label={preview.pinned && preview.result ? `Preview ${preview.result.name}` : undefined}
      onPointerEnter={() => window.clearTimeout(hideTimerRef.current)}
      onPointerLeave={() => deferHidePreview()}
    >
      <button
        type="button"
        className="cs-preview-close"
        aria-label="Close preview"
        onClick={() => closePreview(true)}
      >
        <X size={14} />
      </button>
      <div className="cs-preview-image">
        {preview.src ? (
          <img src={preview.src} alt="" />
        ) : (
          <span className="cs-no-preview">
            {preview.status === 'loading' ? 'Loading preview…' : 'No preview available'}
          </span>
        )}
      </div>
      <div className="cs-preview-body">
        <h3>{preview.result?.name ?? ''}</h3>
        <p>
          {preview.result?.packName}
          {preview.result ? <br /> : null}
          {preview.result?.categoryName}
        </p>
      </div>
    </div>,
    document.body,
  );

  return (
    <div ref={rootRef} className="cs-root" data-compact-style-selector>
      <div className="cs-heading">
        <h2>Style mix</h2>
        <span className="cs-count" aria-label={`${selectedCount} of ${maxSlots} style slots`}>
          {selectedCount} / {maxSlots}
        </span>
        <button
          type="button"
          className="cs-catalog"
          data-open-style-catalog
          aria-label="Open style catalog"
          aria-expanded={catalogOpen}
          onClick={() => {
            closeMenu(false);
            closeWeight(false);
            closePreview();
            onBrowseCatalog();
          }}
        >
          <LayoutGrid size={13} />
          Catalog
        </button>
      </div>
      <div className="cs-rows">
        {selectedCount === 0 ? (
          <button
            type="button"
            className="cs-empty"
            data-add
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls={popoverId}
            onClick={() => (menuOpen ? closeMenu(false) : openMenu())}
          >
            <Plus size={14} />
            Add a style
            <ChevronDown size={14} />
          </button>
        ) : (
          selectedStyles.map((slot) => {
            const name = getStyleRuntimePresetDisplayName(slot.preset);
            const enabled = slot.enabled !== false;
            const result: StylePresetCatalogSearchResult = {
              id: slot.preset.id,
              name,
              ref: slot.preset.id,
              packId: slot.packId,
              packName: slot.packName,
              categoryId: slot.preset.category ?? '',
              categoryName: slot.preset.category ?? slot.packName,
              tags: [],
              supportedTasks: [],
            };
            return (
              <div
                key={slot.preset.id}
                className="cs-row"
                data-style-id={slot.preset.id}
                data-enabled={String(enabled)}
              >
                <button
                  type="button"
                  className="cs-enable"
                  aria-pressed={enabled}
                  aria-label={`${enabled ? 'Pause' : 'Enable'} ${name}`}
                  title={`${enabled ? 'Pause' : 'Enable'} style`}
                  onClick={() => onToggleEnabled(slot.preset.id)}
                />
                <button
                  type="button"
                  className="cs-name"
                  data-preview={slot.preset.id}
                  aria-label={`Preview ${name}`}
                  onClick={(event) => void showPreview(result, event.currentTarget, true)}
                  onPointerEnter={(event) => {
                    if (event.pointerType === 'touch' || weightId) return;
                    queuePreview(result, event.currentTarget);
                  }}
                  onPointerLeave={() => deferHidePreview()}
                >
                  {getStyleThumbnail(slot.preset.id) ? (
                    <img src={getStyleThumbnail(slot.preset.id)} alt="" loading="lazy" />
                  ) : (
                    <span className="cs-thumbnail-empty" aria-hidden="true">
                      <LayoutGrid size={16} />
                    </span>
                  )}
                  <span className="cs-name-text" title={name}>
                    {name}
                  </span>
                </button>
                <button
                  type="button"
                  className="cs-strength"
                  data-strength={slot.preset.id}
                  aria-haspopup="dialog"
                  aria-expanded={weightId === slot.preset.id}
                  aria-controls={weightIdAttr}
                  aria-label={`Intensity for ${name}: ${Math.round(slot.strength * 100)} percent`}
                  onClick={() => {
                    closeMenu(false);
                    closePreview();
                    setWeightId((current) => (current === slot.preset.id ? null : slot.preset.id));
                  }}
                >
                  {formatCompactStyleStrength(slot.strength)}
                </button>
                <button
                  type="button"
                  className="cs-remove"
                  aria-label={`Remove ${name}`}
                  onClick={() => onRemove(slot.preset.id)}
                >
                  <X size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>
      <button
        type="button"
        className="cs-add"
        data-add
        hidden={selectedCount === 0}
        aria-haspopup="dialog"
        aria-expanded={menuOpen}
        aria-controls={popoverId}
        onClick={() => (menuOpen ? closeMenu(false) : openMenu())}
      >
        <Plus size={13} />
        Add
        <ChevronDown size={11} />
      </button>
      <div className="cs-live sr-only" role="status" aria-live="polite" aria-atomic="true">
        {selectedCount} of {maxSlots} styles selected
      </div>
      {menu}
      {weight}
      {previewPanel}
    </div>
  );
};
