import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { StylePresetManifest } from '../components/recipes/styles/manifestTypes';
import { FIELDS } from '../packages/shared/src/styles/intentional-v1/types';
import { loadStylePresetManifestRecords } from './style-manifest-files';

export interface CategoryReview {
  packId: string;
  category: string;
  displayCategory: string;
  kind: 'style' | 'modifier' | 'profile' | 'theme' | 'mixed';
  expectedCount: number;
  baselineHash: string;
  problem: string;
  preserve: string;
  proposedAction: string;
  validation: string;
  evidencePresetIds: string[];
  status: 'text-reviewed' | 'text-authored';
  visualValidation: 'pending' | 'passed' | 'failed';
}

export function categoryContentHash(presets: StylePresetManifest[]) {
  const rows = [...presets]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((preset) =>
      [
        preset.id,
        preset.name,
        preset.displayName ?? '',
        String(preset.version),
        ...FIELDS.map((key) => String(preset.visualDna[key] ?? '')),
      ].join('\0'),
    );
  return createHash('sha256').update(rows.join('\n')).digest('hex');
}

function normalizedDna(preset: StylePresetManifest) {
  return FIELDS.map((key) =>
    String(preset.visualDna[key] ?? '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim(),
  ).join('\0');
}

export function auditStyleCuration(presets: StylePresetManifest[], reviews: CategoryReview[]) {
  const groups = new Map<string, StylePresetManifest[]>();
  const ids = new Set<string>();
  const errors: string[] = [];
  for (const preset of presets) {
    if (ids.has(preset.id)) errors.push(`Duplicate preset ID: ${preset.id}`);
    ids.add(preset.id);
    // Ownership is explicit. Anime packs contain legacy SP05 IDs outside pack_05.
    const key = `${preset.packId}::${preset.category}`;
    groups.set(key, [...(groups.get(key) ?? []), preset]);
  }
  const seenReviews = new Set<string>();
  const categories = reviews.map((review) => {
    const key = `${review.packId}::${review.category}`;
    if (seenReviews.has(key)) errors.push(`Duplicate category review: ${key}`);
    seenReviews.add(key);
    const entries = groups.get(key) ?? [];
    if (!entries.length) errors.push(`Review has no source category: ${key}`);
    if (entries.length !== review.expectedCount)
      errors.push(`Count changed: ${key}: ${entries.length} != ${review.expectedCount}`);
    const hash = categoryContentHash(entries);
    if (hash !== review.baselineHash)
      errors.push(`Source text changed; revisit the category review: ${key}`);
    for (const field of ['problem', 'preserve', 'proposedAction', 'validation'] as const) {
      if (!review[field]?.trim()) errors.push(`Missing ${field}: ${key}`);
    }
    if (!review.evidencePresetIds.length) errors.push(`Missing evidence: ${key}`);
    for (const id of review.evidencePresetIds) {
      if (!entries.some((entry) => entry.id === id))
        errors.push(`Evidence ${id} does not belong to ${key}`);
    }
    return { ...review, currentCount: entries.length, currentHash: hash };
  });
  for (const key of groups.keys()) {
    if (!seenReviews.has(key)) errors.push(`Unreviewed category: ${key}`);
  }
  const exact = new Map<string, string[]>();
  for (const preset of presets) {
    const key = normalizedDna(preset);
    exact.set(key, [...(exact.get(key) ?? []), preset.id]);
  }
  const identicalDnaGroups = [...exact.values()].filter((group) => group.length > 1);
  return {
    scope: 'Source/text audit. Image quality and cross-subject transfer are not certified.',
    totalPresets: presets.length,
    totalPacks: new Set(presets.map((preset) => preset.packId)).size,
    totalCategories: groups.size,
    reviewedCategories: seenReviews.size,
    pendingVisualCategories: reviews.filter((review) => review.visualValidation === 'pending')
      .length,
    identicalDnaGroups,
    duplicatePolicy:
      'Identical DNA is a comparison candidate, never an automatic deletion or merge decision. Names, negative rules, scope and rendered evidence still matter.',
    categories,
    errors,
  };
}

if (import.meta.main) {
  const records = await loadStylePresetManifestRecords();
  const reviews = JSON.parse(
    await readFile(path.resolve('scripts/style-curation/category-reviews.json'), 'utf8'),
  ) as CategoryReview[];
  const report = auditStyleCuration(
    records.map((record) => record.manifest),
    reviews,
  );
  const output = process.argv.find((arg) => arg.startsWith('--output='))?.slice('--output='.length);
  if (output) {
    await mkdir(path.dirname(path.resolve(output)), { recursive: true });
    await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }
  console.log(
    `[styles:curation] packs=${report.totalPacks} categories=${report.totalCategories} presets=${report.totalPresets} reviewed=${report.reviewedCategories} identicalDnaGroups=${report.identicalDnaGroups.length} visualPending=${report.pendingVisualCategories}`,
  );
  for (const error of report.errors) console.error(error);
  if (process.argv.includes('--verify') && report.errors.length) process.exitCode = 1;
}
