import type { StyleRuntimePack, StyleRuntimePreset } from '../runtimeTypes';
import type {
  ResolvedStyleCollection,
  StyleCollection,
  StyleCollectionEntry,
  StyleCollectionRole,
  StyleCollectionRuntimePreset,
  StyleCollectionRuntimeSummary,
  StyleCollectionSourceIndex,
} from './styleCollectionTypes';

function fallbackRole(role: StyleCollectionEntry['role']): StyleCollectionRole {
  return role ?? 'primary';
}

export function createStyleCollectionSourceIndex(
  packs: StyleRuntimePack[],
): StyleCollectionSourceIndex {
  const packsById = new Map<string, StyleRuntimePack>();
  const presetsById = new Map<string, { pack: StyleRuntimePack; preset: StyleRuntimePreset }>();
  const categoryNamesByPackId = new Map<string, Set<string>>();

  for (const pack of packs) {
    packsById.set(pack.id, pack);
    const categoryNames = new Set<string>();
    for (const preset of pack.presets) {
      presetsById.set(preset.id, { pack, preset });
      if (preset.category) categoryNames.add(preset.category);
    }
    categoryNamesByPackId.set(pack.id, categoryNames);
  }

  return { packsById, presetsById, categoryNamesByPackId };
}

function findPresetInPack(
  index: StyleCollectionSourceIndex,
  packId: string | undefined,
  presetId: string,
) {
  if (!packId) return index.presetsById.get(presetId) ?? null;
  const pack = index.packsById.get(packId);
  const preset = pack?.presets.find((item) => item.id === presetId) ?? null;
  return pack && preset ? { pack, preset } : null;
}

function resolveIncludedEntry(
  entry: StyleCollectionEntry,
  index: StyleCollectionSourceIndex,
): Array<{ pack: StyleRuntimePack; preset: StyleRuntimePreset; entry: StyleCollectionEntry }> {
  if (entry.kind === 'manual_group') {
    return (entry.entries ?? []).flatMap((child) => resolveIncludedEntry(child, index));
  }

  if (entry.kind === 'pack') {
    const pack = entry.packId ? index.packsById.get(entry.packId) : null;
    return pack ? pack.presets.map((preset) => ({ pack, preset, entry })) : [];
  }

  if (entry.kind === 'category') {
    const pack = entry.packId ? index.packsById.get(entry.packId) : null;
    if (!pack || !entry.categoryName) return [];
    return pack.presets
      .filter((preset) => preset.category === entry.categoryName)
      .map((preset) => ({ pack, preset, entry }));
  }

  if (entry.kind === 'preset') {
    const presetIds = entry.presetIds ?? (entry.presetId ? [entry.presetId] : []);
    return presetIds.flatMap((presetId) => {
      const result = findPresetInPack(index, entry.packId, presetId);
      return result ? [{ ...result, entry }] : [];
    });
  }

  if (entry.kind === 'query') {
    const packIds = new Set(entry.query?.packIds ?? [...index.packsById.keys()]);
    const categoryNames = new Set(entry.query?.categoryNames ?? []);
    const presetIds = new Set(entry.query?.presetIds ?? []);
    const hasCategoryFilter = categoryNames.size > 0;
    const hasPresetFilter = presetIds.size > 0;

    return [...packIds].flatMap((packId) => {
      const pack = index.packsById.get(packId);
      if (!pack) return [];
      return pack.presets
        .filter((preset) => {
          if (hasPresetFilter && !presetIds.has(preset.id)) return false;
          if (hasCategoryFilter && (!preset.category || !categoryNames.has(preset.category))) {
            return false;
          }
          return true;
        })
        .map((preset) => ({ pack, preset, entry }));
    });
  }

  return [];
}

function collectExcludedPresetIds(
  entries: StyleCollectionEntry[],
  index: StyleCollectionSourceIndex,
): Set<string> {
  const excluded = new Set<string>();
  for (const entry of entries) {
    if (entry.includeMode === 'exclude') {
      for (const { preset } of resolveIncludedEntry({ ...entry, includeMode: 'include' }, index)) {
        excluded.add(preset.id);
      }
      continue;
    }
    if (entry.kind === 'manual_group') {
      for (const presetId of collectExcludedPresetIds(entry.entries ?? [], index)) {
        excluded.add(presetId);
      }
    }
  }
  return excluded;
}

export function resolveStyleCollection(
  collection: StyleCollection,
  index: StyleCollectionSourceIndex,
): ResolvedStyleCollection {
  const excludedPresetIds = collectExcludedPresetIds(collection.entries, index);
  const seenPresetIds = new Set<string>();
  const presets: StyleCollectionRuntimePreset[] = [];

  for (const entry of collection.entries) {
    if (entry.includeMode === 'exclude') continue;
    for (const resolved of resolveIncludedEntry(entry, index)) {
      if (excludedPresetIds.has(resolved.preset.id) || seenPresetIds.has(resolved.preset.id)) {
        continue;
      }
      seenPresetIds.add(resolved.preset.id);
      presets.push({
        preset: resolved.preset,
        presetId: resolved.preset.id,
        sourcePackId: resolved.pack.id,
        sourceCategory: resolved.preset.category ?? 'General',
        displayCategory: resolved.entry.displayCategory ?? resolved.preset.category ?? 'General',
        collectionId: collection.id,
        collectionEntryId: resolved.entry.id,
        collectionRole: fallbackRole(resolved.entry.role),
        facetOverrides: resolved.entry.facetOverrides,
      });
    }
  }

  const sourcePackIds = [...new Set(presets.map((preset) => preset.sourcePackId))];
  const summary: StyleCollectionRuntimeSummary = {
    id: collection.id,
    title: collection.title,
    familyId: collection.familyId,
    description: collection.description,
    icon: collection.icon,
    order: collection.order,
    presetCount: presets.length,
    sourcePackIds,
    featuredPresetIds:
      collection.featuredPresetIds ?? presets.slice(0, 5).map((item) => item.presetId),
    facets: collection.facets,
  };

  return { collection, summary, presets };
}

export function resolveStyleCollections(
  collections: readonly StyleCollection[],
  packs: StyleRuntimePack[],
): ResolvedStyleCollection[] {
  const index = createStyleCollectionSourceIndex(packs);
  return collections.map((collection) => resolveStyleCollection(collection, index));
}

export function createStyleCollectionRuntimeSummaries(
  collections: readonly StyleCollection[],
  packs: StyleRuntimePack[],
): StyleCollectionRuntimeSummary[] {
  return resolveStyleCollections(collections, packs).map((collection) => collection.summary);
}
