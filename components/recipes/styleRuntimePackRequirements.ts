export interface StyleRuntimePackLoadRequest {
  requiredPackIds: string[];
  loadAll: boolean;
  requiredThumbnailPackIds: string[];
}

export interface ResolveStyleRuntimePackLoadRequestOptions {
  isPackLandingOpen: boolean;
  currentPackId: string;
  activeStyleCollectionId: string | null;
  activeCollectionSourcePackIds: readonly string[];
  isGlobalStyleBrowseTab: boolean;
  favoritesCount: number;
  isGlobalStyleSearchActive: boolean;
  runtimePackIds: readonly string[];
  favoritesPackId: string;
  visibleCollectionSourcePackIds?: readonly string[];
}

export function isStyleThumbnailPackId(packId: string) {
  return /^pack_\d+$/.test(packId);
}

function uniquePackIds(packIds: readonly string[]) {
  return [...new Set(packIds)];
}

function listNumericPackIds(packIds: readonly string[]) {
  return uniquePackIds(packIds.filter(isStyleThumbnailPackId));
}

/**
 * Landing needs thumbnail projections for folder covers. Runtime pack modules
 * stay unloaded until the user selects a pack, a collection, or a browse tab.
 */
export function resolveStyleRuntimePackLoadRequest({
  isPackLandingOpen,
  currentPackId,
  activeStyleCollectionId,
  activeCollectionSourcePackIds,
  isGlobalStyleBrowseTab,
  favoritesCount,
  isGlobalStyleSearchActive,
  runtimePackIds,
  favoritesPackId,
  visibleCollectionSourcePackIds = [],
}: ResolveStyleRuntimePackLoadRequestOptions): StyleRuntimePackLoadRequest {
  if (isPackLandingOpen) {
    return {
      requiredPackIds: [],
      loadAll: false,
      requiredThumbnailPackIds: listNumericPackIds(visibleCollectionSourcePackIds),
    };
  }

  const requiredPackIds = runtimePackIds.includes(currentPackId)
    ? [currentPackId, ...activeCollectionSourcePackIds]
    : [...activeCollectionSourcePackIds];

  const loadAll =
    isGlobalStyleBrowseTab ||
    (currentPackId === favoritesPackId && favoritesCount > 0) ||
    (isGlobalStyleSearchActive && !activeStyleCollectionId);

  return {
    requiredPackIds,
    loadAll,
    requiredThumbnailPackIds: listNumericPackIds(loadAll ? runtimePackIds : requiredPackIds),
  };
}
