import { getStyleCategoryDisplayName } from '../components/recipes/styles/collections/categoryDisplayNames';
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import {
  auditStyleCuration,
  categoryContentHash,
  type CategoryReview,
} from './audit-style-curation';
import { loadStylePresetManifestRecords } from './style-manifest-files';
import type { StylePresetManifest } from '../components/recipes/styles/manifestTypes';
import { FIELDS } from '../packages/shared/src/styles/intentional-v1/types';

const preset: StylePresetManifest = {
  schemaVersion: 1,
  id: 'SP05-201',
  packId: 'pack_13',
  name: 'Fixture',
  category: 'Actual category',
  version: 1,
  supportedTasks: ['image_generate'],
  tags: ['fixture'],
  assets: {},
  avoidRules: ['noise'],
  visualDna: Object.fromEntries(
    FIELDS.map((field) => [field, `Portable ${field}`]),
  ) as StylePresetManifest['visualDna'],
};
function review(entries = [preset]): CategoryReview {
  return {
    packId: 'pack_13',
    category: 'Actual category',
    displayCategory: 'Short label',
    kind: 'style',
    expectedCount: entries.length,
    baselineHash: categoryContentHash(entries),
    problem: 'Overlapping vocabulary',
    preserve: 'Mark language',
    proposedAction: 'Compare distinct subjects',
    validation: 'Compare rendered evidence',
    evidencePresetIds: [preset.id],
    status: 'text-reviewed',
    visualValidation: 'pending',
  };
}

describe('category curation coverage', () => {
  it('verifies the complete live manifest inventory, not a hand-counted subset', async () => {
    const records = await loadStylePresetManifestRecords();
    const reviews = JSON.parse(
      await readFile('scripts/style-curation/category-reviews.json', 'utf8'),
    ) as CategoryReview[];
    const result = auditStyleCuration(
      records.map((record) => record.manifest),
      reviews,
    );
    expect(result.errors).toEqual([]);
    expect(result.totalPacks).toBe(new Set(records.map((record) => record.manifest.packId)).size);
    expect(result.totalCategories).toBe(reviews.length);
    expect(result.totalPresets).toBe(records.length);
    expect(result.reviewedCategories).toBe(result.totalCategories);
    expect(result.pendingVisualCategories).toBe(result.totalCategories);
    for (const review of reviews)
      expect(getStyleCategoryDisplayName(review.packId, review.category)).toBe(
        review.displayCategory,
      );
  });
  it('uses explicit pack ownership for legacy anime identifiers', () => {
    expect(auditStyleCuration([preset], [review()]).errors).toEqual([]);
  });
  it('detects missing reviews, stale source text, invalid evidence and duplicate reviews', () => {
    expect(auditStyleCuration([preset], []).errors.join(' ')).toContain('Unreviewed category');
    expect(
      auditStyleCuration([{ ...preset, name: 'Changed' }], [review()]).errors.join(' '),
    ).toContain('Source text changed');
    expect(
      auditStyleCuration([preset], [{ ...review(), evidencePresetIds: ['outside'] }]).errors.join(
        ' ',
      ),
    ).toContain('does not belong');
    expect(auditStyleCuration([preset], [review(), review()]).errors.join(' ')).toContain(
      'Duplicate category review',
    );
  });
  it('reports identical DNA without deleting, merging or declaring visual equivalence', () => {
    const entries = [
      preset,
      { ...preset, id: 'SP05-202', name: 'Other', avoidRules: ['different requirement'] },
    ];
    const before = JSON.stringify(entries);
    const result = auditStyleCuration(entries, [review(entries)]);
    expect(result.identicalDnaGroups).toEqual([['SP05-201', 'SP05-202']]);
    expect(result.totalPresets).toBe(2);
    expect(JSON.stringify(entries)).toBe(before);
    expect(result.duplicatePolicy).toContain('never an automatic deletion');
  });
});
