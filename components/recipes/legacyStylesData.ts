import yaml from 'js-yaml';
import type { StylePack } from './styles/types';

const legacyPackFiles = import.meta.glob('./styles/packs/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function parseYamlList<T>(files: Record<string, unknown>) {
  return Object.entries(files)
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([, yamlContent]) => yaml.load(String(yamlContent)) as T | T[]);
}

export const LEGACY_STYLE_PACKS = parseYamlList<StylePack>(legacyPackFiles);
