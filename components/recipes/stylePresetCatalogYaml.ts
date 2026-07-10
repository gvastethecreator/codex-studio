import {
  loadStyleThumbnailPack,
  resolveStyleDefaultImageThumbnail,
} from '../../lib/styleThumbnailCatalog';
import type { StylePackManifest, StylePresetManifest } from './styles/manifestTypes';

export type ManifestGlobLoader = () => Promise<unknown>;

let yamlLoader: Promise<typeof import('js-yaml')> | null = null;

function loadYamlParser() {
  yamlLoader ??= import('js-yaml');
  return yamlLoader;
}

async function loadYamlObjects<T>(files: Record<string, ManifestGlobLoader>) {
  const [yaml, entries] = await Promise.all([
    loadYamlParser(),
    Promise.all(
      Object.entries(files).map(async ([path, loader]) => [path, await loader()] as const),
    ),
  ]);

  return entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, yamlContent]) => yaml.load(String(yamlContent)) as T);
}

function normalizePresetAssetAvailability(
  preset: StylePresetManifest,
  thumbnailProjection?: Record<string, string>,
): StylePresetManifest {
  const resolvedDefaultImage =
    thumbnailProjection?.[preset.id] ?? resolveStyleDefaultImageThumbnail(preset.id);
  const defaultImageExists = Boolean(resolvedDefaultImage);
  return {
    ...preset,
    assets: {
      ...preset.assets,
      ...(defaultImageExists
        ? { defaultImage: resolvedDefaultImage }
        : { defaultImage: undefined }),
    },
    taxonomy: {
      ...preset.taxonomy,
      hasDefaultImage: defaultImageExists,
    },
  };
}

export interface StylePresetCatalogPackData {
  packManifest: StylePackManifest;
  presetManifests: StylePresetManifest[];
}

export async function loadStylePresetCatalogPackDataFromGlobs({
  packManifestFiles,
  presetManifestFiles,
}: {
  packManifestFiles: Record<string, ManifestGlobLoader>;
  presetManifestFiles: Record<string, ManifestGlobLoader>;
}): Promise<StylePresetCatalogPackData> {
  const [packManifests, presetManifests] = await Promise.all([
    loadYamlObjects<StylePackManifest>(packManifestFiles),
    loadYamlObjects<StylePresetManifest>(presetManifestFiles),
  ]);
  const packManifest = packManifests[0];
  if (!packManifest) {
    throw new Error('Missing style pack manifest for catalog data chunk.');
  }
  const thumbnailProjection = await loadStyleThumbnailPack(packManifest.id);

  return {
    packManifest,
    presetManifests: presetManifests.map((preset) =>
      normalizePresetAssetAvailability(preset, thumbnailProjection),
    ),
  };
}
