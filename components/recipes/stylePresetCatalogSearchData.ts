import { resolveStyleDefaultImageThumbnail } from '../../lib/styleThumbnailCatalog';
import {
  fetchStylePackFile,
  INSTALLED_STYLE_PACK_SUMMARIES,
  isInstalledStylePack,
} from '../../lib/installedStylePacks';
import type {
  StylePresetCatalogSearchIndex,
  StylePresetCatalogSearchPackSummary,
} from './stylePresetManifests';

/** Installed style packs (ADR 0011), filled at startup before React mounts. */
export const STYLE_PRESET_CATALOG_SEARCH_PACK_SUMMARIES: StylePresetCatalogSearchPackSummary[] =
  INSTALLED_STYLE_PACK_SUMMARIES;

export async function loadStylePresetCatalogSearchIndex(
  packIds: readonly string[],
): Promise<StylePresetCatalogSearchIndex> {
  const sources = await Promise.all(
    packIds.map((id) => {
      if (!isInstalledStylePack(id)) throw new Error(`Unknown style pack: ${id}`);
      return fetchStylePackFile<StylePresetCatalogSearchIndex>(id, 'search');
    }),
  );
  const packs = sources.flatMap((source) => source.packs);
  const presets = sources
    .flatMap((source) => source.presets)
    .map((preset) => ({ ...preset, defaultImage: resolveStyleDefaultImageThumbnail(preset.id) }));
  return { packs, presets, totalPresetCount: presets.length };
}
