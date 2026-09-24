import { composeStyleRuntimePacksFromManifests } from './stylePresetManifests';
import {
  loadStylePresetCatalogPackDataFromGlobs,
  type ManifestGlobLoader,
} from './stylePresetCatalogYaml';
import type { StyleRuntimePreset } from './styles/runtimeTypes';

const ARCHIVED_PACK_MANIFEST_FILES = {
  ...import.meta.glob(
    './styles/manifests/archive/conceptual-refactor-20260923/packs/pack_14.yaml',
    { query: '?raw', import: 'default', eager: false },
  ),
  ...import.meta.glob(
    './styles/manifests/archive/conceptual-refactor-20260923/packs/pack_15.yaml',
    { query: '?raw', import: 'default', eager: false },
  ),
  ...import.meta.glob('./styles/manifests/archive/identity-repair-20260923/packs/pack_14.yaml', {
    query: '?raw',
    import: 'default',
    eager: false,
  }),
  ...import.meta.glob('./styles/manifests/archive/identity-repair-20260923/packs/pack_15.yaml', {
    query: '?raw',
    import: 'default',
    eager: false,
  }),
} as Record<string, ManifestGlobLoader>;

const ARCHIVED_PRESET_MANIFEST_FILES = {
  ...import.meta.glob(
    './styles/manifests/archive/conceptual-refactor-20260923/presets/pack_14/*.yaml',
    { query: '?raw', import: 'default', eager: false },
  ),
  ...import.meta.glob(
    './styles/manifests/archive/conceptual-refactor-20260923/presets/pack_15/*.yaml',
    { query: '?raw', import: 'default', eager: false },
  ),
  ...import.meta.glob(
    './styles/manifests/archive/identity-repair-20260923/presets/pack_14/*.yaml',
    { query: '?raw', import: 'default', eager: false },
  ),
  ...import.meta.glob(
    './styles/manifests/archive/identity-repair-20260923/presets/pack_15/*.yaml',
    { query: '?raw', import: 'default', eager: false },
  ),
} as Record<string, ManifestGlobLoader>;

export interface ArchivedStylePresetEntry {
  preset: StyleRuntimePreset;
  packId: string;
  packName: string;
}

interface ArchivedPresetSource {
  presetId: string;
  packDirectory: string;
  presetManifestPath: string;
  packManifestPath: string;
  loadPresetManifest: ManifestGlobLoader;
}

interface RequestedArchivePack {
  packDirectory: string;
  packManifestPath: string;
  loadPackManifest: ManifestGlobLoader;
  packRequestedIds: Set<string>;
  presetManifestFiles: Record<string, ManifestGlobLoader>;
}

const archivedPresetRequests = new Map<string, Promise<ArchivedStylePresetEntry[]>>();

function getArchivedPresetSource(
  presetManifestPath: string,
  loadPresetManifest: ManifestGlobLoader,
): ArchivedPresetSource | null {
  const match = /^\.\/styles\/manifests\/archive\/[^/]+\/presets\/(pack_\d+)\/([^/]+)\.yaml$/.exec(
    presetManifestPath,
  );
  if (!match) return null;

  const packDirectory = match[1];
  const presetId = match[2];
  const archiveRoot = presetManifestPath.slice(0, presetManifestPath.indexOf('/presets/'));
  return {
    presetId,
    packDirectory,
    presetManifestPath,
    packManifestPath: archiveRoot + '/packs/' + packDirectory + '.yaml',
    loadPresetManifest,
  };
}

const archivedPresetSourcesById = new Map<string, ArchivedPresetSource[]>();
for (const [presetManifestPath, loadPresetManifest] of Object.entries(
  ARCHIVED_PRESET_MANIFEST_FILES,
)) {
  const source = getArchivedPresetSource(presetManifestPath, loadPresetManifest);
  if (!source) continue;

  const sources = archivedPresetSourcesById.get(source.presetId) ?? [];
  sources.push(source);
  archivedPresetSourcesById.set(source.presetId, sources);
}

async function loadArchivedStylePresetEntries(presetIds: readonly string[]) {
  const requestedIds = new Set(presetIds);
  const requestedPacks = new Map<string, RequestedArchivePack>();

  for (const presetId of requestedIds) {
    const matchingSources = archivedPresetSourcesById.get(presetId) ?? [];
    if (matchingSources.length === 0) continue;
    if (matchingSources.length > 1) {
      throw new Error('Ambiguous archived style preset ID: ' + presetId);
    }

    const source = matchingSources[0];
    const loadPackManifest = ARCHIVED_PACK_MANIFEST_FILES[source.packManifestPath];
    if (!loadPackManifest) {
      throw new Error('Missing archived style pack manifest for ' + source.packManifestPath + '.');
    }

    const archivePack: RequestedArchivePack = requestedPacks.get(source.packManifestPath) ?? {
      packDirectory: source.packDirectory,
      packManifestPath: source.packManifestPath,
      loadPackManifest,
      packRequestedIds: new Set<string>(),
      presetManifestFiles: {},
    };
    archivePack.packRequestedIds.add(presetId);
    archivePack.presetManifestFiles[source.presetManifestPath] = source.loadPresetManifest;
    requestedPacks.set(source.packManifestPath, archivePack);
  }

  const entriesById = new Map<string, ArchivedStylePresetEntry>();
  for (const archivePack of requestedPacks.values()) {
    const data = await loadStylePresetCatalogPackDataFromGlobs({
      packManifestFiles: {
        [archivePack.packManifestPath]: archivePack.loadPackManifest,
      },
      presetManifestFiles: archivePack.presetManifestFiles,
    });
    if (data.packManifest.id !== archivePack.packDirectory) {
      throw new Error(
        'Archived style pack path ' +
          archivePack.packDirectory +
          ' contains manifest ' +
          data.packManifest.id +
          '.',
      );
    }

    const runtimePack = composeStyleRuntimePacksFromManifests(
      [data.packManifest],
      data.presetManifests,
    )[0];
    if (!runtimePack) continue;

    for (const preset of runtimePack.presets) {
      if (!archivePack.packRequestedIds.has(preset.id)) continue;
      entriesById.set(preset.id, {
        preset,
        packId: runtimePack.id,
        packName: data.packManifest.name,
      });
    }
  }

  return [...requestedIds].flatMap((presetId) => {
    const entry = entriesById.get(presetId);
    return entry ? [entry] : [];
  });
}

export function loadArchivedStylePresetsByIds(presetIds: readonly string[]) {
  const cacheKey = [...new Set(presetIds)].sort().join('|');
  if (!cacheKey) return Promise.resolve([] as ArchivedStylePresetEntry[]);

  const cached = archivedPresetRequests.get(cacheKey);
  if (cached) return cached;

  const request = loadArchivedStylePresetEntries(presetIds).catch((error: unknown) => {
    archivedPresetRequests.delete(cacheKey);
    throw error;
  });
  archivedPresetRequests.set(cacheKey, request);
  return request;
}
