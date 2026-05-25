import yaml from 'js-yaml';
import type { StylePack, StylePackManifest, StylePresetManifest } from './styles/types';
import {
  composeStylePacksFromManifests,
  createStylePackManifests,
  createStylePresetManifests,
  validateStyleManifestGraph,
} from './stylePresetManifests';

// Import all yaml files in the packs directory as raw strings
const packFiles = import.meta.glob('./styles/packs/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
});

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

function parseYamlList<T>(files: Record<string, unknown>) {
  return Object.entries(files)
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([, yamlContent]) => yaml.load(String(yamlContent)) as T | T[]);
}

function parseYamlObjects<T>(files: Record<string, unknown>) {
  return Object.entries(files)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, yamlContent]) => yaml.load(String(yamlContent)) as T);
}

export const LEGACY_STYLE_PACKS = parseYamlList<StylePack>(packFiles);

const granularPackManifests = parseYamlObjects<StylePackManifest>(packManifestFiles);
const granularPresetManifests = parseYamlObjects<StylePresetManifest>(presetManifestFiles);
const hasGranularManifests =
  granularPackManifests.length > 0 && granularPresetManifests.length > 0;

export const STYLE_PACK_MANIFESTS = hasGranularManifests
  ? granularPackManifests
  : createStylePackManifests(LEGACY_STYLE_PACKS);

export const STYLE_PRESET_MANIFESTS = hasGranularManifests
  ? granularPresetManifests
  : createStylePresetManifests(LEGACY_STYLE_PACKS);

export const STYLE_MANIFEST_GRAPH = validateStyleManifestGraph(
  STYLE_PACK_MANIFESTS,
  STYLE_PRESET_MANIFESTS,
);

export const STYLE_PACKS: StylePack[] = composeStylePacksFromManifests(
  STYLE_PACK_MANIFESTS,
  STYLE_PRESET_MANIFESTS,
);

export * from './styles/types';
export * from './stylePresetManifests';
