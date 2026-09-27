import { fetchStylePackFile, stylePackIdsWithArchivedPresets } from '../../lib/installedStylePacks';
import { loadStyleThumbnailPack } from '../../lib/styleThumbnailCatalog';
import type { StyleRuntimePreset } from './styles/runtimeTypes';

export interface ArchivedStylePresetEntry {
  preset: StyleRuntimePreset;
  packId: string;
  packName: string;
}

interface ArchivedStylePresetFile {
  packName: string;
  presets: StyleRuntimePreset[];
}

let archivedEntriesRequest: Promise<Map<string, ArchivedStylePresetEntry>> | null = null;

// Retired presets ship with their pack extension (archived.json), with their card thumbnails.
async function loadArchivedEntries() {
  const entriesById = new Map<string, ArchivedStylePresetEntry>();
  for (const packId of stylePackIdsWithArchivedPresets()) {
    const [file] = await Promise.all([
      fetchStylePackFile<ArchivedStylePresetFile>(packId, 'archived'),
      loadStyleThumbnailPack(packId),
    ]);
    for (const preset of file.presets)
      entriesById.set(preset.id, { preset, packId, packName: file.packName });
  }
  return entriesById;
}

export async function loadArchivedStylePresetsByIds(presetIds: readonly string[]) {
  if (presetIds.length === 0) return [];
  archivedEntriesRequest ??= loadArchivedEntries().catch((error: unknown) => {
    archivedEntriesRequest = null;
    throw error;
  });
  const entriesById = await archivedEntriesRequest;
  return [...new Set(presetIds)].flatMap((presetId) => {
    const entry = entriesById.get(presetId);
    return entry ? [entry] : [];
  });
}
