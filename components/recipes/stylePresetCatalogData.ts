import type { StylePackManifest, StylePresetManifest } from './styles/manifestTypes';
import { compareStylePackIdsForDisplay } from './styles/packOrdering';
import { createStylePresetCatalog, type StylePresetCatalog } from './stylePresetManifests';
import type { StylePresetCatalogPackData } from './stylePresetCatalogYaml';

export interface LoadedStylePresetCatalog extends StylePresetCatalog {
  packManifests: StylePackManifest[];
  presetManifests: StylePresetManifest[];
}

export const STYLE_PRESET_CATALOG_PACK_IDS = [
  'pack_01',
  'pack_02',
  'pack_03',
  'pack_04',
  'pack_05',
  'pack_13',
  'pack_16',
  'pack_06',
  'pack_07',
  'pack_08',
  'pack_09',
  'pack_10',
  'pack_11',
  'pack_12',
  'pack_14',
  'pack_15',
] as const;

export type StylePresetCatalogPackId = (typeof STYLE_PRESET_CATALOG_PACK_IDS)[number];

const catalogPackDataLoaders: Record<
  StylePresetCatalogPackId,
  () => Promise<StylePresetCatalogPackData>
> = {
  pack_01: () =>
    import('./stylePresetCatalogData.pack_01').then((module) =>
      module.loadStylePresetCatalogPackData(),
    ),
  pack_02: () =>
    import('./stylePresetCatalogData.pack_02').then((module) =>
      module.loadStylePresetCatalogPackData(),
    ),
  pack_03: () =>
    import('./stylePresetCatalogData.pack_03').then((module) =>
      module.loadStylePresetCatalogPackData(),
    ),
  pack_04: () =>
    import('./stylePresetCatalogData.pack_04').then((module) =>
      module.loadStylePresetCatalogPackData(),
    ),
  pack_05: () =>
    import('./stylePresetCatalogData.pack_05').then((module) =>
      module.loadStylePresetCatalogPackData(),
    ),
  pack_13: () =>
    import('./stylePresetCatalogData.pack_13').then((module) =>
      module.loadStylePresetCatalogPackData(),
    ),
  pack_16: () =>
    import('./stylePresetCatalogData.pack_16').then((module) =>
      module.loadStylePresetCatalogPackData(),
    ),
  pack_06: () =>
    import('./stylePresetCatalogData.pack_06').then((module) =>
      module.loadStylePresetCatalogPackData(),
    ),
  pack_07: () =>
    import('./stylePresetCatalogData.pack_07').then((module) =>
      module.loadStylePresetCatalogPackData(),
    ),
  pack_08: () =>
    import('./stylePresetCatalogData.pack_08').then((module) =>
      module.loadStylePresetCatalogPackData(),
    ),
  pack_09: () =>
    import('./stylePresetCatalogData.pack_09').then((module) =>
      module.loadStylePresetCatalogPackData(),
    ),
  pack_10: () =>
    import('./stylePresetCatalogData.pack_10').then((module) =>
      module.loadStylePresetCatalogPackData(),
    ),
  pack_11: () =>
    import('./stylePresetCatalogData.pack_11').then((module) =>
      module.loadStylePresetCatalogPackData(),
    ),
  pack_12: () =>
    import('./stylePresetCatalogData.pack_12').then((module) =>
      module.loadStylePresetCatalogPackData(),
    ),
  pack_14: () =>
    import('./stylePresetCatalogData.pack_14').then((module) =>
      module.loadStylePresetCatalogPackData(),
    ),
  pack_15: () =>
    import('./stylePresetCatalogData.pack_15').then((module) =>
      module.loadStylePresetCatalogPackData(),
    ),
};

const packDataCache = new Map<string, Promise<StylePresetCatalogPackData>>();
let catalogCache: LoadedStylePresetCatalog | null = null;
let catalogPromise: Promise<LoadedStylePresetCatalog> | null = null;

function isStylePresetCatalogPackId(packId: string): packId is StylePresetCatalogPackId {
  return STYLE_PRESET_CATALOG_PACK_IDS.includes(packId as StylePresetCatalogPackId);
}

export function loadStylePresetCatalogPackData(
  packId: string,
): Promise<StylePresetCatalogPackData | null> {
  if (!isStylePresetCatalogPackId(packId)) return Promise.resolve(null);

  const cached = packDataCache.get(packId);
  if (cached) return cached;

  const promise = catalogPackDataLoaders[packId]();
  packDataCache.set(packId, promise);
  return promise;
}

export async function loadStylePresetCatalogPacksData(packIds = STYLE_PRESET_CATALOG_PACK_IDS) {
  const loaded = await Promise.all(packIds.map((packId) => loadStylePresetCatalogPackData(packId)));
  return loaded.filter((packData): packData is StylePresetCatalogPackData => Boolean(packData));
}

export async function loadStylePresetCatalog(): Promise<LoadedStylePresetCatalog> {
  if (catalogCache) return catalogCache;
  if (catalogPromise) return catalogPromise;

  catalogPromise = (async () => {
    const packData = await loadStylePresetCatalogPacksData();
    const packManifests = packData
      .map((data) => data.packManifest)
      .sort((a, b) => compareStylePackIdsForDisplay(a.id, b.id));
    const presetManifests = packData.flatMap((data) => data.presetManifests);
    const catalog = createStylePresetCatalog(packManifests, presetManifests);
    const loaded: LoadedStylePresetCatalog = {
      ...catalog,
      packManifests,
      presetManifests,
    };
    catalogCache = loaded;
    return loaded;
  })();

  return catalogPromise;
}
