import yaml from 'js-yaml';
import type { StylePackManifest, StylePresetManifest } from './styles/types';
import { createStylePresetCatalog, validateStyleManifestGraph } from './stylePresetManifests';

const packManifestFiles = import.meta.glob('./styles/manifests/packs/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const presetManifestFiles = import.meta.glob('./styles/manifests/presets/**/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function parseYamlObjects<T>(files: Record<string, unknown>) {
  return Object.entries(files)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, yamlContent]) => yaml.load(String(yamlContent)) as T);
}

export const STYLE_PACK_MANIFESTS = parseYamlObjects<StylePackManifest>(packManifestFiles);

export const STYLE_PRESET_MANIFESTS = parseYamlObjects<StylePresetManifest>(presetManifestFiles);

export const STYLE_MANIFEST_GRAPH = validateStyleManifestGraph(
  STYLE_PACK_MANIFESTS,
  STYLE_PRESET_MANIFESTS,
);

export const STYLE_PRESET_CATALOG = createStylePresetCatalog(
  STYLE_PACK_MANIFESTS,
  STYLE_PRESET_MANIFESTS,
);
