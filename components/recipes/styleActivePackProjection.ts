import type { StyleCollection } from './styles/collections';
import type { StyleRuntimePack } from './stylesData';
import { getStyleCollectionTabId } from './styleTabRouting';
import { USER_STYLE_PACK_ID } from './userStyleRuntimeAdapter';

type CollectionProjection = Pick<
  typeof import('./styles/collections'),
  'createStyleCollectionSourceIndex' | 'resolveStyleCollection'
>;

export interface ActiveStylePackInput {
  currentPackId: string;
  isGlobalStyleBrowseTab: boolean;
  isAllStyleCardsTab: boolean;
  activeStyleCollectionId: string | null;
  activeStyleCollection: StyleCollection | null;
  collectionProjection: CollectionProjection | null;
  collectionLoadError: string | null;
  allRuntimeStylePacksLoaded: boolean;
  globalStylePresetCount: number;
  globalStyleCategoryCount: number;
  globalStylePacks: StyleRuntimePack[];
  userStylePack: StyleRuntimePack;
  loadedStylePacksById: Record<string, StyleRuntimePack>;
  runtimePackIds: readonly string[];
  summaries: readonly Pick<StyleRuntimePack, 'id' | 'name' | 'description'>[];
  favoritesPackId: string;
}

export function projectActiveStylePack(input: ActiveStylePackInput): StyleRuntimePack {
  const {
    currentPackId,
    isGlobalStyleBrowseTab,
    isAllStyleCardsTab,
    activeStyleCollectionId,
    activeStyleCollection,
    collectionProjection,
    collectionLoadError,
    allRuntimeStylePacksLoaded,
    globalStylePresetCount,
    globalStyleCategoryCount,
    globalStylePacks,
    userStylePack,
    loadedStylePacksById,
    runtimePackIds,
    summaries,
    favoritesPackId,
  } = input;

  if (isGlobalStyleBrowseTab) {
    return {
      id: currentPackId,
      name: isAllStyleCardsTab ? 'All Style Cards' : 'All Style Categories',
      description: allRuntimeStylePacksLoaded
        ? isAllStyleCardsTab
          ? `${globalStylePresetCount} cards from every style pack.`
          : `${globalStyleCategoryCount} categories from every style pack.`
        : 'Loading the full style catalog.',
      presets: globalStylePacks.flatMap((pack) => pack.presets),
    };
  }

  if (activeStyleCollectionId) {
    if (!activeStyleCollection || !collectionProjection) {
      return {
        id: getStyleCollectionTabId(activeStyleCollectionId),
        name: 'Style Collection',
        description: collectionLoadError ?? 'Loading style collection.',
        presets: [],
      };
    }

    const sourcePacks = activeStyleCollection.sourcePackIds.flatMap((packId) => {
      if (packId === USER_STYLE_PACK_ID) return [userStylePack];
      const pack = loadedStylePacksById[packId];
      return pack ? [pack] : [];
    });
    const missingSourcePack = activeStyleCollection.sourcePackIds.some(
      (packId) => runtimePackIds.includes(packId) && !loadedStylePacksById[packId],
    );
    if (missingSourcePack) {
      return {
        id: getStyleCollectionTabId(activeStyleCollection.id),
        name: activeStyleCollection.title,
        description: 'Loading source packs for this style collection.',
        presets: [],
      };
    }

    const resolved = collectionProjection.resolveStyleCollection(
      activeStyleCollection,
      collectionProjection.createStyleCollectionSourceIndex(sourcePacks),
    );
    return {
      id: getStyleCollectionTabId(activeStyleCollection.id),
      name: activeStyleCollection.title,
      description: activeStyleCollection.description,
      presets: resolved.presets.map((item) => item.preset),
    };
  }

  if (currentPackId === favoritesPackId) {
    return {
      id: favoritesPackId,
      name: 'Your Favorites',
      description: 'A curated collection of your most used styles.',
      presets: [],
    };
  }
  if (currentPackId === USER_STYLE_PACK_ID) return userStylePack;
  const summary = summaries.find((pack) => pack.id === currentPackId) ?? summaries[0];
  return (
    loadedStylePacksById[currentPackId] ?? {
      id: summary?.id ?? 'pack_01',
      name: summary?.name ?? 'Styles',
      description: summary?.description ?? 'Loading style presets.',
      presets: [],
    }
  );
}
