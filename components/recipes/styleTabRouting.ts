export const STYLE_PACKS_TAB_ID = 'packs';
export const STYLE_RECIPE_HASH_PREFIX = 'recipe-styles';
export const STYLE_COLLECTION_TAB_PREFIX = 'collection/';

export type StyleTabId = string;

export interface StyleTabRouteOptions {
  favoritesPackId: string;
  runtimePackIds: readonly string[];
  specialTabIds?: readonly string[];
  userStylePackId: string;
}

export function getStyleCollectionTabId(collectionId: string): StyleTabId {
  return `${STYLE_COLLECTION_TAB_PREFIX}${collectionId}`;
}

export function getStyleCollectionIdFromTabId(tabId: string | null | undefined) {
  const cleanTabId = (tabId ?? '').trim();
  if (!cleanTabId.startsWith(STYLE_COLLECTION_TAB_PREFIX)) return null;
  const collectionId = cleanTabId.slice(STYLE_COLLECTION_TAB_PREFIX.length).trim();
  return collectionId || null;
}

export function normalizeStyleTabId(
  tabId: string | null | undefined,
  options: StyleTabRouteOptions,
): StyleTabId {
  const cleanTabId = (tabId ?? '').trim();
  if (!cleanTabId || cleanTabId === 'landing' || cleanTabId === STYLE_PACKS_TAB_ID) {
    return STYLE_PACKS_TAB_ID;
  }

  if (cleanTabId === options.favoritesPackId || cleanTabId === options.userStylePackId) {
    return cleanTabId;
  }

  if (options.specialTabIds?.includes(cleanTabId)) {
    return cleanTabId;
  }

  const collectionId = getStyleCollectionIdFromTabId(cleanTabId);
  if (collectionId) return getStyleCollectionTabId(collectionId);

  return options.runtimePackIds.includes(cleanTabId) ? cleanTabId : STYLE_PACKS_TAB_ID;
}

export function readStyleTabIdFromHash(
  rawHash: string,
  options: StyleTabRouteOptions,
): StyleTabId | null {
  const hash = rawHash.replace(/^#/, '');
  if (!hash.startsWith(STYLE_RECIPE_HASH_PREFIX)) return null;

  const segment = hash
    .slice(STYLE_RECIPE_HASH_PREFIX.length)
    .replace(/^\//, '')
    .split(/[?#]/)[0]
    .replace(/\/$/, '');

  return normalizeStyleTabId(segment, options);
}

export function getStyleTabHash(tabId: StyleTabId, options: StyleTabRouteOptions) {
  return `${STYLE_RECIPE_HASH_PREFIX}/${normalizeStyleTabId(tabId, options)}`;
}
