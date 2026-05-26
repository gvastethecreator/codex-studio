import { readFile } from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import type {
  StylePackManifest,
  StylePresetManifest,
} from '../components/recipes/styles/manifestTypes';
import {
  createStylePresetCatalog,
  validateStyleManifestGraph,
} from '../components/recipes/stylePresetManifests';

export const rootDir = process.cwd();
export const styleManifestsDir = path.join(
  rootDir,
  'components',
  'recipes',
  'styles',
  'manifests',
);
export const stylePackManifestsDir = path.join(styleManifestsDir, 'packs');
export const stylePresetManifestsDir = path.join(styleManifestsDir, 'presets');

export interface StylePresetManifestRecord {
  filePath: string;
  manifest: StylePresetManifest;
}

async function readYamlFile<T>(filePath: string) {
  return yaml.load(await readFile(filePath, 'utf8')) as T;
}

export async function loadStylePackManifests() {
  const glob = new Bun.Glob('*.yaml');
  const manifests: StylePackManifest[] = [];

  for await (const fileName of glob.scan(stylePackManifestsDir)) {
    manifests.push(
      await readYamlFile<StylePackManifest>(path.join(stylePackManifestsDir, fileName)),
    );
  }

  return manifests.sort((a, b) => a.id.localeCompare(b.id));
}

export async function loadStylePresetManifests() {
  return (await loadStylePresetManifestRecords()).map((record) => record.manifest);
}

export async function loadStylePresetManifestRecords() {
  const glob = new Bun.Glob('*/*.yaml');
  const records: StylePresetManifestRecord[] = [];

  for await (const fileName of glob.scan(stylePresetManifestsDir)) {
    const filePath = path.join(stylePresetManifestsDir, fileName);
    records.push({
      filePath,
      manifest: await readYamlFile<StylePresetManifest>(filePath),
    });
  }

  return records.sort((a, b) => a.manifest.id.localeCompare(b.manifest.id));
}

export async function loadStyleManifestGraph() {
  const [packManifests, presetManifests] = await Promise.all([
    loadStylePackManifests(),
    loadStylePresetManifests(),
  ]);
  const graph = validateStyleManifestGraph(packManifests, presetManifests);
  const catalog = createStylePresetCatalog(packManifests, presetManifests);

  return {
    packManifests,
    presetManifests,
    graph,
    catalog,
  };
}
