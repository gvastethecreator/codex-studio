import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { legacyBriefPacks12to17 } from './legacy-card-briefs-packs12-17';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const packIds = ['pack_12', 'pack_13', 'pack_14', 'pack_15', 'pack_16', 'pack_17'] as const;

type ManifestPreset = { id: string; name: string; category?: string };
type ReviewedCardBriefs = Record<string, string>;

const presetRoot = resolve(repositoryRoot, 'components/recipes/styles/manifests/presets');
const archivedPresetRoot = resolve(
  repositoryRoot,
  'components/recipes/styles/manifests/archive/conceptual-refactor-20260923/presets',
);
const reviewedCardBriefs = JSON.parse(
  readFileSync(resolve(repositoryRoot, 'scripts/style-curation/card-briefs.json'), 'utf8'),
) as ReviewedCardBriefs;

function readPresets(directory: string): ManifestPreset[] {
  return readdirSync(directory)
    .filter((fileName) => fileName.endsWith('.yaml'))
    .map((fileName) => load(readFileSync(resolve(directory, fileName), 'utf8')) as ManifestPreset);
}

describe('legacy preview briefs for packs 12–17', () => {
  it('keeps legacy previews distinct for historical packs 12–17 presets', () => {
    for (const packId of packIds) {
      const presetDirectory =
        packId === 'pack_14' || packId === 'pack_15'
          ? resolve(archivedPresetRoot, packId)
          : resolve(presetRoot, packId);
      const presets = readPresets(presetDirectory);
      const byCategory = new Map<string, string[]>();
      const subjectsByCategory = new Map<string, string[]>();

      for (const preset of presets) {
        const brief = legacyBriefPacks12to17({ id: packId }, preset);
        expect(brief, `${packId}/${preset.id}`).toBeTruthy();
        expect(brief, `${packId}/${preset.id}`).not.toMatch(/\b(vase|jar|amphora)\b/i);
        expect(legacyBriefPacks12to17({ id: packId }, preset)).toBe(brief);
        const category = preset.category ?? '';
        const subject = brief!.match(/^Create a representative card image of (.+?); /)?.[1];
        expect(
          subject,
          `${packId}/${preset.id} should have one distinct preview subject`,
        ).toBeTruthy();
        byCategory.set(category, [...(byCategory.get(category) ?? []), brief!]);
        subjectsByCategory.set(category, [...(subjectsByCategory.get(category) ?? []), subject!]);
      }

      for (const [category, briefs] of byCategory) {
        expect(new Set(briefs).size, `${packId}/${category}`).toBe(briefs.length);
        expect(
          new Set(subjectsByCategory.get(category)).size,
          `${packId}/${category} subjects`,
        ).toBe(briefs.length);
      }
    }
  });

  it('keeps all active pack 14 and 15 canonical briefs present and distinct by category', () => {
    const activeBriefsByCategory = new Map<string, string[]>();
    let activePresetCount = 0;

    for (const packId of ['pack_14', 'pack_15'] as const) {
      const presets = readPresets(resolve(presetRoot, packId));
      for (const preset of presets) {
        const brief = reviewedCardBriefs[preset.id];
        expect(brief, `${packId}/${preset.id} canonical brief`).toBeDefined();
        expect(brief?.trim() ?? '', `${packId}/${preset.id} canonical brief`).not.toBe('');
        if (!brief?.trim()) continue;

        const categoryKey = `${packId}|${preset.category ?? ''}`;
        activeBriefsByCategory.set(categoryKey, [
          ...(activeBriefsByCategory.get(categoryKey) ?? []),
          brief,
        ]);
        activePresetCount += 1;
      }
    }

    expect(activePresetCount).toBe(44);
    for (const [category, briefs] of activeBriefsByCategory) {
      expect(new Set(briefs).size, `${category} canonical briefs`).toBe(briefs.length);
    }
  });

  it('does not claim historical packs whose content merely shares an ID prefix', () => {
    expect(
      legacyBriefPacks12to17(
        { id: 'pack_05' },
        { id: 'SP13-021', name: 'Action Burst Alley Rush', category: '5. Action Motion Setpieces' },
      ),
    ).toBeNull();
    expect(
      legacyBriefPacks12to17(
        { id: 'pack_18' },
        { id: 'SP18-001', name: 'Future', category: 'Future' },
      ),
    ).toBeNull();
  });

  it('does not assign an unrelated category the first category subject', () => {
    expect(
      legacyBriefPacks12to17(
        { id: 'pack_12' },
        { id: 'SP12-999', name: 'Unclassified TCG Finish', category: 'Pending TCG Finish Catalog' },
      ),
    ).toBeNull();
  });
});
