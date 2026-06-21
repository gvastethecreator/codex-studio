import {
  loadStylePresetCatalogPackDataFromGlobs,
  type ManifestGlobLoader,
} from './stylePresetCatalogYaml';

const packManifestFiles = import.meta.glob('./styles/manifests/packs/pack_17.yaml', {
  query: '?raw',
  import: 'default',
  eager: false,
}) as Record<string, ManifestGlobLoader>;

const presetManifestFiles = import.meta.glob('./styles/manifests/presets/pack_17/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: false,
}) as Record<string, ManifestGlobLoader>;

export function loadStylePresetCatalogPackData() {
  return loadStylePresetCatalogPackDataFromGlobs({ packManifestFiles, presetManifestFiles });
}
