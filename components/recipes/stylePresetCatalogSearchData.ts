import { resolveStyleDefaultImageThumbnail } from '../../lib/styleThumbnailCatalog';
import { GENERATED_STYLE_RUNTIME_PACK_SUMMARIES } from './styleRuntimeData.generated';
import type {
  StylePresetCatalogSearchIndex,
  StylePresetCatalogSearchPackSummary,
} from './stylePresetManifests';

export const STYLE_PRESET_CATALOG_SEARCH_PACK_SUMMARIES =
  GENERATED_STYLE_RUNTIME_PACK_SUMMARIES satisfies StylePresetCatalogSearchPackSummary[];

const packIndexes = import.meta.glob<{ default: StylePresetCatalogSearchIndex }>(
  './styleSearchIndexes.generated/*.json',
);

export async function loadStylePresetCatalogSearchIndex(
  packIds: readonly string[],
): Promise<StylePresetCatalogSearchIndex> {
  const sources = await Promise.all(
    packIds.map(async (id) => {
      const load = packIndexes[`./styleSearchIndexes.generated/${id}.json`];
      if (!load) throw new Error(`Unknown style pack: ${id}`);
      return (await load()).default;
    }),
  );
  const packs = sources.flatMap((source) => source.packs);
  const presets = sources
    .flatMap((source) => source.presets)
    .map((preset) => ({ ...preset, defaultImage: resolveStyleDefaultImageThumbnail(preset.id) }));
  return { packs, presets, totalPresetCount: presets.length };
}
