import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { startViewTransition } from '../../utils/transitionUtils';
import type { StyleBrowserSortOrder, StyleBrowserViewMode } from './styleBrowserRenderPlan';
import {
  getStyleTabHash as getStyleTabHashForRoute,
  readStyleTabIdFromHash as readStyleTabIdFromRouteHash,
  normalizeStyleTabId as normalizeStyleTabRouteId,
  STYLE_PACKS_TAB_ID,
  STYLE_RECIPE_HASH_PREFIX,
  type StyleTabId,
  type StyleTabRouteOptions,
} from './styleTabRouting';

/** Owns URL navigation, browse filters and favorites; runtime pack loading stays demand-driven. */
export function useStyleBrowserNavigation({
  routeOptions,
  defaultPackId,
  allCategoriesTabId,
  allCardsTabId,
}: {
  routeOptions: StyleTabRouteOptions;
  defaultPackId: string;
  allCategoriesTabId: string;
  allCardsTabId: string;
}) {
  const [currentPackId, setCurrentPackId] = useState(defaultPackId);
  const [isPackLandingOpen, setIsPackLandingOpen] = useState(true);
  const currentStyleTabRef = useRef<StyleTabId>(STYLE_PACKS_TAB_ID);
  const [browserState, setBrowserState] = useState({
    searchQuery: '',
    sortOrder: 'source' as StyleBrowserSortOrder,
    viewMode: 'grouped' as StyleBrowserViewMode,
    showFavoritesOnly: false,
    isCatalogSearchOpen: false,
  });
  const { searchQuery, sortOrder, viewMode, showFavoritesOnly, isCatalogSearchOpen } = browserState;
  const isAllStyleCategoriesTab = currentPackId === allCategoriesTabId;
  const isAllStyleCardsTab = currentPackId === allCardsTabId;
  const isGlobalStyleBrowseTab = isAllStyleCategoriesTab || isAllStyleCardsTab;
  const activeStyleViewMode: StyleBrowserViewMode = isAllStyleCardsTab
    ? 'flat'
    : isAllStyleCategoriesTab
      ? 'grouped'
      : viewMode;
  const [favorites, setFavorites] = useLocalStorage<string[]>('style-favorites', []);
  const writeStyleTabHash = useCallback(
    (tabId: StyleTabId, mode: 'push' | 'replace' = 'push') => {
      const nextHash = `#${getStyleTabHashForRoute(tabId, routeOptions)}`;
      if (window.location.hash === nextHash) return;

      const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
      if (mode === 'replace') {
        window.history.replaceState(null, '', nextUrl);
        return;
      }

      window.location.hash = nextHash.slice(1);
    },
    [routeOptions],
  );
  const applyStyleTab = useCallback(
    (
      tabId: StyleTabId,
      options: {
        resetSearch?: boolean;
        browserStatePatch?: Partial<typeof browserState>;
      } = {},
    ) => {
      const normalizedTabId = normalizeStyleTabRouteId(tabId, routeOptions);
      const tabBrowserStatePatch =
        normalizedTabId === allCardsTabId
          ? ({
              showFavoritesOnly: false,
              sortOrder: 'source',
              viewMode: 'flat',
            } satisfies Partial<typeof browserState>)
          : normalizedTabId === allCategoriesTabId
            ? ({
                showFavoritesOnly: false,
                sortOrder: 'source',
                viewMode: 'grouped',
              } satisfies Partial<typeof browserState>)
            : {};
      currentStyleTabRef.current = normalizedTabId;

      startViewTransition(() => {
        if (normalizedTabId === STYLE_PACKS_TAB_ID) {
          setIsPackLandingOpen(true);
        } else {
          setIsPackLandingOpen(false);
          setCurrentPackId(normalizedTabId);
        }

        if (
          options.resetSearch ||
          options.browserStatePatch ||
          Object.keys(tabBrowserStatePatch).length > 0
        ) {
          setBrowserState((prev) => ({
            ...prev,
            ...(options.resetSearch ? { searchQuery: '' } : {}),
            ...tabBrowserStatePatch,
            ...options.browserStatePatch,
          }));
        }
      });
    },
    [routeOptions, allCategoriesTabId, allCardsTabId],
  );

  const navigateToStyleTab = useCallback(
    (tabId: StyleTabId) => {
      const normalizedTabId = normalizeStyleTabRouteId(tabId, routeOptions);
      applyStyleTab(normalizedTabId, { resetSearch: true });
      writeStyleTabHash(normalizedTabId);
    },
    [applyStyleTab, routeOptions, writeStyleTabHash],
  );

  useEffect(() => {
    const syncStyleTabFromHash = () => {
      const hashTabId = readStyleTabIdFromRouteHash(window.location.hash, routeOptions);
      if (!hashTabId) return;

      if (window.location.hash === `#${STYLE_RECIPE_HASH_PREFIX}`) {
        writeStyleTabHash(hashTabId, 'replace');
      }

      if (currentStyleTabRef.current === hashTabId) return;
      applyStyleTab(hashTabId, { resetSearch: true });
    };

    syncStyleTabFromHash();
    window.addEventListener('hashchange', syncStyleTabFromHash);
    return () => window.removeEventListener('hashchange', syncStyleTabFromHash);
  }, [applyStyleTab, routeOptions, writeStyleTabHash]);

  const toggleFavorite = useCallback(
    (presetId: string) => {
      setFavorites((prev) =>
        prev.includes(presetId) ? prev.filter((id) => id !== presetId) : [...prev, presetId],
      );
    },
    [setFavorites],
  );

  const updateFilters = useCallback(
    (patch: Partial<Pick<typeof browserState, 'searchQuery' | 'sortOrder' | 'viewMode'>>) =>
      setBrowserState((current) => ({ ...current, ...patch })),
    [],
  );
  const setCatalogOpen = useCallback(
    (open: boolean) => setBrowserState((current) => ({ ...current, isCatalogSearchOpen: open })),
    [],
  );
  const toggleFavoritesOnly = useCallback(
    () =>
      setBrowserState((current) => ({ ...current, showFavoritesOnly: !current.showFavoritesOnly })),
    [],
  );
  return {
    currentPackId,
    isPackLandingOpen,
    searchQuery,
    sortOrder,
    viewMode,
    showFavoritesOnly,
    isCatalogSearchOpen,
    isAllStyleCategoriesTab,
    isAllStyleCardsTab,
    isGlobalStyleBrowseTab,
    activeStyleViewMode,
    favorites,
    applyStyleTab,
    navigateToStyleTab,
    writeStyleTabHash,
    toggleFavorite,
    updateFilters,
    setCatalogOpen,
    toggleFavoritesOnly,
  };
}
