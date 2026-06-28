import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import * as yaml from 'js-yaml';
import type {
  StylePackManifest,
  StylePresetManifest,
} from '../components/recipes/styles/manifestTypes';
import {
  createStylePresetCatalog,
  validateStyleManifestGraph,
} from '../components/recipes/stylePresetManifests';
import { compareStylePackIdsForDisplay } from '../components/recipes/styles/packOrdering';

export const rootDir = process.cwd();
export const styleManifestsDir = path.join(rootDir, 'components', 'recipes', 'styles', 'manifests');
const stylePackManifestsDir = path.join(styleManifestsDir, 'packs');
export const stylePresetManifestsDir = path.join(styleManifestsDir, 'presets');

export interface StylePresetManifestRecord {
  filePath: string;
  manifest: StylePresetManifest;
}

export interface StyleManifestScanOptions {
  useNodeFs?: boolean;
}

async function readYamlFile<T>(filePath: string) {
  return yaml.load(await readFile(filePath, 'utf8')) as T;
}

async function scanFlatYamlFiles(dirPath: string, options: StyleManifestScanOptions = {}) {
  if (!options.useNodeFs && typeof Bun !== 'undefined') {
    const glob = new Bun.Glob('*.yaml');
    const fileNames: string[] = [];

    for await (const fileName of glob.scan(dirPath)) {
      fileNames.push(fileName);
    }

    return fileNames.sort((a, b) => a.localeCompare(b));
  }

  const entries = await readdir(dirPath, { withFileTypes: true });
  return entries
    .reduce<string[]>((acc, entry) => {
      if (entry.isFile() && entry.name.endsWith('.yaml')) acc.push(entry.name);
      return acc;
    }, [])
    .sort((a, b) => a.localeCompare(b));
}

async function scanNestedYamlFiles(dirPath: string, options: StyleManifestScanOptions = {}) {
  if (!options.useNodeFs && typeof Bun !== 'undefined') {
    const glob = new Bun.Glob('*/*.yaml');
    const fileNames: string[] = [];

    for await (const fileName of glob.scan(dirPath)) {
      fileNames.push(fileName);
    }

    return fileNames.sort((a, b) => a.localeCompare(b));
  }

  const parentEntries = await readdir(dirPath, { withFileTypes: true });
  const fileNames: string[] = [];

  for (const parentEntry of parentEntries) {
    if (!parentEntry.isDirectory()) {
      continue;
    }

    const childDirPath = path.join(dirPath, parentEntry.name);
    const childEntries = await readdir(childDirPath, { withFileTypes: true });
    for (const childEntry of childEntries) {
      if (childEntry.isFile() && childEntry.name.endsWith('.yaml')) {
        fileNames.push(path.join(parentEntry.name, childEntry.name));
      }
    }
  }

  return fileNames.sort((a, b) => a.localeCompare(b));
}

export async function loadStylePackManifests(
  manifestsDir = stylePackManifestsDir,
  options: StyleManifestScanOptions = {},
) {
  const manifests: StylePackManifest[] = [];

  for (const fileName of await scanFlatYamlFiles(manifestsDir, options)) {
    manifests.push(await readYamlFile<StylePackManifest>(path.join(manifestsDir, fileName)));
  }

  return manifests.sort((a, b) => compareStylePackIdsForDisplay(a.id, b.id));
}

async function loadStylePresetManifests(
  manifestsDir = stylePresetManifestsDir,
  options: StyleManifestScanOptions = {},
) {
  return (await loadStylePresetManifestRecords(manifestsDir, options)).map(
    (record) => record.manifest,
  );
}

export async function loadStylePresetManifestRecords(
  manifestsDir = stylePresetManifestsDir,
  options: StyleManifestScanOptions = {},
) {
  const records: StylePresetManifestRecord[] = [];

  for (const fileName of await scanNestedYamlFiles(manifestsDir, options)) {
    const filePath = path.join(manifestsDir, fileName);
    records.push({
      filePath,
      manifest: await readYamlFile<StylePresetManifest>(filePath),
    });
  }

  return records.sort((a, b) => a.manifest.id.localeCompare(b.manifest.id));
}

async function loadStylePresetManifestsForPack(packId: string) {
  const packPresetDir = path.join(stylePresetManifestsDir, packId);
  const manifests: StylePresetManifest[] = [];

  for (const fileName of await scanFlatYamlFiles(packPresetDir)) {
    manifests.push(await readYamlFile<StylePresetManifest>(path.join(packPresetDir, fileName)));
  }

  return manifests.sort((a, b) => a.id.localeCompare(b.id));
}

export async function loadStyleManifestGraph(packFilter?: string) {
  const [packManifests, presetManifests] = packFilter
    ? await Promise.all([
        readYamlFile<StylePackManifest>(
          path.join(stylePackManifestsDir, `${packFilter}.yaml`),
        ).then((manifest) => [manifest]),
        loadStylePresetManifestsForPack(packFilter),
      ])
    : await Promise.all([loadStylePackManifests(), loadStylePresetManifests()]);
  const graph = validateStyleManifestGraph(packManifests, presetManifests);
  const catalog = createStylePresetCatalog(packManifests, presetManifests);

  return {
    packManifests,
    presetManifests,
    graph,
    catalog,
  };
}
