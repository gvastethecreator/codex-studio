import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  RECIPE_ASSET_EXTENSION,
  categoryBasesDir,
  loadPacks,
  repoRelative,
  rootDir,
  sanitizeCategory,
  styleCategoryImageKey,
} from './style-default-utils';

interface BaseRow {
  packId: string;
  packName: string;
  category: string;
  key: string;
  file: string;
  exists: boolean;
  presetNames: string[];
}

const outDir = path.join(rootDir, 'docs', 'active');
const outPath = path.join(outDir, 'style-category-bases-audit.md');

const rows: BaseRow[] = [];

for (const pack of await loadPacks()) {
  const groups = new Map<string, string[]>();
  for (const preset of pack.presets) {
    const category = sanitizeCategory(preset.category);
    const names = groups.get(category) || [];
    names.push(preset.name);
    groups.set(category, names);
  }

  for (const [category, presetNames] of groups.entries()) {
    const key = styleCategoryImageKey(pack.id, category);
    const fileName = `${key}${RECIPE_ASSET_EXTENSION}`;
    rows.push({
      packId: pack.id,
      packName: pack.name,
      category,
      key,
      file: repoRelative(path.join(categoryBasesDir, fileName)),
      exists: await Bun.file(path.join(categoryBasesDir, fileName)).exists(),
      presetNames,
    });
  }
}

const done = rows.filter((row) => row.exists);
const missing = rows.filter((row) => !row.exists);
const focusPackIds = ['pack_08', 'pack_09', 'pack_10', 'pack_11'];
const focusPackSummary = focusPackIds.map((packId) => {
  const packRows = rows.filter((row) => row.packId === packId);
  const generated = packRows.filter((row) => row.exists).length;
  return {
    packId,
    packName: packRows[0]?.packName ?? packId,
    generated,
    total: packRows.length,
  };
});

const lines = [
  '# Style Category Bases Audit',
  '',
  `Generated bases: ${done.length}/${rows.length}`,
  `Missing bases: ${missing.length}/${rows.length}`,
  '',
  'Objective slice `pack_08..pack_11`:',
  ...focusPackSummary.map(
    (pack) => `- ${pack.packName} (${pack.packId}): ${pack.generated}/${pack.total} generated`,
  ),
  '',
  '## Generated',
  '',
  ...done.flatMap((row) => [
    `### ${row.packName} / ${row.category}`,
    '',
    `Key: \`${row.key}\``,
    '',
    `![${row.key}](../../${row.file.replaceAll('\\', '/')})`,
    '',
    `Representative presets: ${row.presetNames.slice(0, 12).join(', ')}`,
    '',
    'Review: PENDING',
    '',
  ]),
  '## Missing',
  '',
  ...missing.map(
    (row) => `- ${row.packName} / ${row.category} -> \`${row.key}${RECIPE_ASSET_EXTENSION}\``,
  ),
  '',
];

await mkdir(outDir, { recursive: true });
await writeFile(outPath, lines.join('\n'), 'utf8');
console.log(outPath);
