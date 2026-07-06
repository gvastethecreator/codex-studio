import type {
  StyleCollection,
  StyleCollectionEntry,
  StyleCollectionFamily,
} from './styleCollectionTypes';
import type { StyleCollectionSourceIndex } from './styleCollectionTypes';

export interface StyleCollectionValidationIssue {
  code: string;
  message: string;
  collectionId?: string;
  entryId?: string;
}

function addDuplicateIssue(
  issues: StyleCollectionValidationIssue[],
  code: string,
  label: string,
  values: string[],
) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      issues.push({ code, message: `Duplicate ${label}: ${value}` });
      continue;
    }
    seen.add(value);
  }
}

function validateEntry(
  entry: StyleCollectionEntry,
  collection: StyleCollection,
  index: StyleCollectionSourceIndex,
  issues: StyleCollectionValidationIssue[],
) {
  if (!entry.id.trim()) {
    issues.push({
      code: 'entry_missing_id',
      message: `Collection ${collection.id} has an entry without id.`,
      collectionId: collection.id,
    });
  }

  if (entry.kind === 'pack' && (!entry.packId || !index.packsById.has(entry.packId))) {
    issues.push({
      code: 'entry_missing_pack',
      message: `Entry ${entry.id} references a missing pack.`,
      collectionId: collection.id,
      entryId: entry.id,
    });
  }

  if (entry.kind === 'category') {
    const categories = entry.packId ? index.categoryNamesByPackId.get(entry.packId) : null;
    if (!entry.packId || !index.packsById.has(entry.packId)) {
      issues.push({
        code: 'entry_missing_category_pack',
        message: `Entry ${entry.id} references a missing category pack.`,
        collectionId: collection.id,
        entryId: entry.id,
      });
    } else if (!entry.categoryName || !categories?.has(entry.categoryName)) {
      issues.push({
        code: 'entry_missing_category',
        message: `Entry ${entry.id} references missing category ${entry.categoryName ?? ''}.`,
        collectionId: collection.id,
        entryId: entry.id,
      });
    }
  }

  if (entry.kind === 'preset') {
    const presetIds = entry.presetIds ?? (entry.presetId ? [entry.presetId] : []);
    if (presetIds.length === 0) {
      issues.push({
        code: 'entry_missing_preset_id',
        message: `Entry ${entry.id} has no preset id.`,
        collectionId: collection.id,
        entryId: entry.id,
      });
    }
    for (const presetId of presetIds) {
      const exists = entry.packId
        ? Boolean(
            index.packsById.get(entry.packId)?.presets.some((preset) => preset.id === presetId),
          )
        : index.presetsById.has(presetId);
      if (!exists) {
        issues.push({
          code: 'entry_missing_preset',
          message: `Entry ${entry.id} references missing preset ${presetId}.`,
          collectionId: collection.id,
          entryId: entry.id,
        });
      }
    }
  }

  if (entry.kind === 'query' && !entry.query) {
    issues.push({
      code: 'entry_missing_query',
      message: `Entry ${entry.id} has no query.`,
      collectionId: collection.id,
      entryId: entry.id,
    });
  }

  if (entry.kind === 'manual_group') {
    if (!entry.entries?.length) {
      issues.push({
        code: 'entry_empty_manual_group',
        message: `Entry ${entry.id} manual group is empty.`,
        collectionId: collection.id,
        entryId: entry.id,
      });
    }
    for (const child of entry.entries ?? []) validateEntry(child, collection, index, issues);
  }
}

export function validateStyleCollections({
  families,
  collections,
  sourceIndex,
}: {
  families: readonly StyleCollectionFamily[];
  collections: readonly StyleCollection[];
  sourceIndex: StyleCollectionSourceIndex;
}): StyleCollectionValidationIssue[] {
  const issues: StyleCollectionValidationIssue[] = [];
  addDuplicateIssue(
    issues,
    'duplicate_family_id',
    'family id',
    families.map((family) => family.id),
  );
  addDuplicateIssue(
    issues,
    'duplicate_collection_id',
    'collection id',
    collections.map((collection) => collection.id),
  );

  const familyIds = new Set(families.map((family) => family.id));
  for (const collection of collections) {
    if (!familyIds.has(collection.familyId)) {
      issues.push({
        code: 'collection_missing_family',
        message: `Collection ${collection.id} references missing family ${collection.familyId}.`,
        collectionId: collection.id,
      });
    }
    if (!collection.entries.length && collection.id !== 'recent') {
      issues.push({
        code: 'collection_empty_entries',
        message: `Collection ${collection.id} has no entries.`,
        collectionId: collection.id,
      });
    }
    const entryIds = new Set<string>();
    for (const entry of collection.entries) {
      if (entryIds.has(entry.id)) {
        issues.push({
          code: 'duplicate_entry_id',
          message: `Collection ${collection.id} has duplicate entry ${entry.id}.`,
          collectionId: collection.id,
          entryId: entry.id,
        });
      }
      entryIds.add(entry.id);
      validateEntry(entry, collection, sourceIndex, issues);
    }
  }

  return issues;
}
