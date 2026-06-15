import { resolveStyleDefaultImage } from '../../lib/recipeAssetCatalog';
import {
  GENERATED_STYLE_RUNTIME_PACK_SUMMARIES,
  loadGeneratedStyleRuntimePack,
} from './styleRuntimeData.generated';
import type { StyleRuntimePack } from './styles/runtimeTypes';
import {
  createStylePresetCatalogSearchIndexFromRuntimePacks,
  type StylePresetCatalogSearchIndex,
  type StylePresetCatalogSearchPackSummary,
} from './stylePresetManifests';

export const STYLE_PRESET_CATALOG_SEARCH_PACK_SUMMARIES =
  GENERATED_STYLE_RUNTIME_PACK_SUMMARIES satisfies StylePresetCatalogSearchPackSummary[];

const searchPackCache = new Map<string, Promise<StyleRuntimePack | null>>();

function loadSearchPack(packId: string) {
  const cached = searchPackCache.get(packId);
  if (cached) return cached;

  const promise = loadGeneratedStyleRuntimePack(packId);
  searchPackCache.set(packId, promise);
  return promise;
}

export async function loadStylePresetCatalogSearchIndex(
  packIds: readonly string[],
): Promise<StylePresetCatalogSearchIndex> {
  const packs = await Promise.all(packIds.map((packId) => loadSearchPack(packId)));
  return createStylePresetCatalogSearchIndexFromRuntimePacks(
    packs.filter((pack): pack is StyleRuntimePack => Boolean(pack)),
    {
      resolveDefaultImage: resolveStyleDefaultImage,
    },
  );
}
