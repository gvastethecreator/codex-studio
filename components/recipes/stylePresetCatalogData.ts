import { STYLE_DEFAULT_IMAGES } from '../../lib/recipeAssetCatalog';
import type { StylePackManifest, StylePresetManifest } from './styles/manifestTypes';
import { compareStylePackIdsForDisplay } from './styles/packOrdering';
import {
  createStylePresetCatalog,
  validateStyleManifestGraph,
  type StylePresetCatalog,
} from './stylePresetManifests';

type ManifestGlobLoader = () => Promise<unknown>;
type ImportMetaGlobFn = (
  pattern: string,
  options: { query: '?raw'; import: 'default'; eager: false },
) => Record<string, ManifestGlobLoader>;

function safeImportMetaGlob(pattern: string): Record<string, ManifestGlobLoader> {
  const glob = (import.meta as ImportMeta & { glob?: ImportMetaGlobFn }).glob;
  if (typeof glob === 'function') {
    return glob(pattern, {
      query: '?raw',
      import: 'default',
      eager: false,
    });
  }
  return {};
}

const packManifestFiles = safeImportMetaGlob('./styles/manifests/packs/*.yaml');

const presetManifestFiles = safeImportMetaGlob('./styles/manifests/presets/**/*.yaml');

function hasManifestGlobs() {
  return Object.keys(packManifestFiles).length > 0 && Object.keys(presetManifestFiles).length > 0;
}

let yamlLoader: Promise<typeof import('js-yaml')> | null = null;

function loadYamlParser() {
  yamlLoader ??= import('js-yaml');
  return yamlLoader;
}

async function loadYamlObjects<T>(files: Record<string, () => Promise<unknown>>) {
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

async function readYamlFile(filePath: string): Promise<string> {
  const fs = await import('node:fs/promises');
  return fs.readFile(filePath, 'utf8');
}

async function listYamlFiles(directoryPath: string): Promise<string[]> {
  const fs = await import('node:fs/promises');
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = `${directoryPath}/${entry.name}`;
      if (entry.isDirectory()) {
        return listYamlFiles(fullPath);
      }
      return entry.isFile() && entry.name.toLowerCase().endsWith('.yaml') ? [fullPath] : [];
    }),
  );
  return files.flat();
}

async function loadYamlObjectsFromDisk<T>(directoryPath: string): Promise<T[]> {
  const yaml = await loadYamlParser();
  const filePaths = (await listYamlFiles(directoryPath)).sort((a, b) => a.localeCompare(b));
  const yamlContents = await Promise.all(filePaths.map((filePath) => readYamlFile(filePath)));
  return yamlContents.map((yamlContent) => yaml.load(String(yamlContent)) as T);
}

async function resolveFileUrlPath(url: URL): Promise<string> {
  const { fileURLToPath } = await import('node:url');
  return fileURLToPath(url);
}

export interface LoadedStylePresetCatalog extends StylePresetCatalog {
  packManifests: StylePackManifest[];
  presetManifests: StylePresetManifest[];
}

let catalogCache: LoadedStylePresetCatalog | null = null;
let catalogPromise: Promise<LoadedStylePresetCatalog> | null = null;

function normalizePresetAssetAvailability(preset: StylePresetManifest): StylePresetManifest {
  const defaultImageExists = Boolean(STYLE_DEFAULT_IMAGES[preset.id]);
  return {
    ...preset,
    assets: {
      ...preset.assets,
      ...(defaultImageExists ? {} : { defaultImage: undefined }),
    },
    taxonomy: {
      ...preset.taxonomy,
      hasDefaultImage: defaultImageExists,
    },
  };
}

export async function loadStylePresetCatalog(): Promise<LoadedStylePresetCatalog> {
  if (catalogCache) return catalogCache;
  if (catalogPromise) return catalogPromise;

  catalogPromise = (async () => {
    const [packsRaw, presetManifests] = hasManifestGlobs()
      ? await Promise.all([
          loadYamlObjects<StylePackManifest>(packManifestFiles),
          loadYamlObjects<StylePresetManifest>(presetManifestFiles),
        ])
      : await Promise.all([
          loadYamlObjectsFromDisk<StylePackManifest>(
            await resolveFileUrlPath(new URL('./styles/manifests/packs', import.meta.url)),
          ),
          loadYamlObjectsFromDisk<StylePresetManifest>(
            await resolveFileUrlPath(new URL('./styles/manifests/presets', import.meta.url)),
          ),
        ]);
    const packs = packsRaw.sort((a, b) => compareStylePackIdsForDisplay(a.id, b.id));
    const presets = presetManifests.map(normalizePresetAssetAvailability);
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
