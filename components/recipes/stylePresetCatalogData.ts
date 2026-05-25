import yaml from 'js-yaml';
import type { StylePackManifest, StylePresetManifest } from './styles/types';
import {
  createStylePresetCatalog,
  validateStyleManifestGraph,
  type StylePresetCatalog,
} from './stylePresetManifests';

const packManifestFiles = import.meta.glob('./styles/manifests/packs/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: false,
});

const presetManifestFiles = import.meta.glob('./styles/manifests/presets/**/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: false,
});

async function loadYamlObjects<T>(files: Record<string, () => Promise<unknown>>) {
  const entries = await Promise.all(
    Object.entries(files).map(async ([path, loader]) => [path, await loader()] as const),
  );
  return entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, yamlContent]) => yaml.load(String(yamlContent)) as T);
}

export interface LoadedStylePresetCatalog extends StylePresetCatalog {
  packManifests: StylePackManifest[];
  presetManifests: StylePresetManifest[];
}

let catalogCache: LoadedStylePresetCatalog | null = null;
let catalogPromise: Promise<LoadedStylePresetCatalog> | null = null;

export async function loadStylePresetCatalog(): Promise<LoadedStylePresetCatalog> {
  if (catalogCache) return catalogCache;
  if (catalogPromise) return catalogPromise;

  catalogPromise = (async () => {
    const packs = await loadYamlObjects<StylePackManifest>(packManifestFiles);
    const presets = await loadYamlObjects<StylePresetManifest>(presetManifestFiles);
    const graph = validateStyleManifestGraph(packs, presets);
    const catalog = createStylePresetCatalog(packs, presets);
    const loaded: LoadedStylePresetCatalog = {
      ...catalog,
      packManifests: packs,
      presetManifests: presets,
    };
    catalogCache = loaded;
    return loaded;
  })();

  return catalogPromise;
}
