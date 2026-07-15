export interface StyleRuntimePackLoadRequest {
  requiredPackIds: string[];
  loadAll: boolean;
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
}

/**
 * Keep the landing surface metadata-only. Runtime pack modules are loaded only
 * after the user has selected a pack, a collection, or a global browsing mode.
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
}: ResolveStyleRuntimePackLoadRequestOptions): StyleRuntimePackLoadRequest {
  if (isPackLandingOpen) {
    return { requiredPackIds: [], loadAll: false };
  }

  const requiredPackIds = runtimePackIds.includes(currentPackId)
    ? [currentPackId, ...activeCollectionSourcePackIds]
    : [...activeCollectionSourcePackIds];

  return {
    requiredPackIds,
    loadAll:
      isGlobalStyleBrowseTab ||
      (currentPackId === favoritesPackId && favoritesCount > 0) ||
      (isGlobalStyleSearchActive && !activeStyleCollectionId),
  };
}
