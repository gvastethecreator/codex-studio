import yaml from 'js-yaml';
import { StylePack } from './styles/types';

// Import all yaml files in the packs directory as raw strings
const packFiles = import.meta.glob('./styles/packs/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export const STYLE_PACKS: StylePack[] = [];

for (const path in packFiles) {
  const yamlContent = packFiles[path] as string;
  const parsedPacks = yaml.load(yamlContent) as StylePack[];
  STYLE_PACKS.push(...parsedPacks);
}

export * from './styles/types';
