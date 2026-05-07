import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import {
  RECIPE_ASSET_EXTENSION,
  categoryBasesDir,
  packsDir,
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

const packFiles = (await readdir(packsDir)).filter((file) => file.endsWith('.yaml')).sort();
const rows: BaseRow[] = [];

for (const file of packFiles) {
  const packs = yaml.load(await readFile(path.join(packsDir, file), 'utf8')) as any[];
  for (const pack of packs) {
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
}

const done = rows.filter((row) => row.exists);
const missing = rows.filter((row) => !row.exists);

const lines = [
  '# Style Category Bases Audit',
  '',
  `Generated bases: ${done.length}/${rows.length}`,
  `Missing bases: ${missing.length}/${rows.length}`,
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
