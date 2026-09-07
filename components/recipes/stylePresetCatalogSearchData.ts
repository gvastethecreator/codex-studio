import { resolveStyleDefaultImageThumbnail } from '../../lib/styleThumbnailCatalog';
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

export async function loadStylePresetCatalogSearchIndex(
  packIds: readonly string[],
): Promise<StylePresetCatalogSearchIndex> {
  const packs = await Promise.all(packIds.map(loadGeneratedStyleRuntimePack));
  return createStylePresetCatalogSearchIndexFromRuntimePacks(
    packs.filter((pack): pack is StyleRuntimePack => Boolean(pack)),
    {
      resolveDefaultImage: resolveStyleDefaultImageThumbnail,
    },
  );
}
