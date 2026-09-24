import { readFile, writeFile, rm } from 'node:fs/promises';
import type { CategoryReview } from './audit-style-curation';
import { loadStylePresetManifestRecords } from './style-manifest-files';

const reviews = JSON.parse(
  await readFile('scripts/style-curation/category-reviews.json', 'utf8'),
) as CategoryReview[];
const records = await loadStylePresetManifestRecords();
const presets = new Map(records.map(({ manifest }) => [manifest.id, manifest]));
const lines = [
  `# Category review — ${reviews.length} categories`,
  '',
  'Generated from `scripts/style-curation/category-reviews.json` and current source manifests.',
  '',
  `**Scope:** source/text decisions covering ${presets.size.toLocaleString('en-US')} presets, including legacy categories, authored studies and the imported atlases. Each entry separates editorial state from cross-subject image validation. Representative evidence describes the source; generated cards alone do not certify transfer across subjects. Implementation details are recorded in README.md.`,
  '',
  'Types: style = visual language; modifier = scoped treatment; profile = deliberate output/camera format; theme = content/design/world direction; mixed = individual presets need separation.',
  '',
];
for (const review of reviews) {
  lines.push(
    `## ${review.packId} / ${review.category}`,
    `**Display:** ${review.displayCategory} · **Scope:** ${review.kind} · **Presets:** ${review.expectedCount}`,
    `**Editorial state:** ${review.status} · **Cross-subject image validation:** ${review.visualValidation}`,
    '',
    `**Problem:** ${review.problem}`,
    `**Retain:** ${review.preserve}`,
    `**Proposed action:** ${review.proposedAction}`,
    `**Image acceptance check:** ${review.validation}`,
    '',
  );
  for (const id of review.evidencePresetIds) {
    const preset = presets.get(id);
    if (!preset || preset.packId !== review.packId || preset.category !== review.category)
      throw new Error(`Invalid evidence ${id}`);
    const value = String(preset.visualDna.camera_and_composition)
      .replace(/\s+/g, ' ')
      .replace(/`/g, "'");
    const link = `../../../components/recipes/styles/manifests/presets/${preset.packId}/${id}.yaml`;
    lines.push(
      `Evidence [${id}](${link}) — ${preset.displayName || preset.name}: \`${value.slice(0, 260)}\`${value.length > 260 ? '…' : ''}`,
    );
  }
  lines.push('');
}
let output = `${lines.join('\n').trim()}\n`;
const target = 'docs/styles/curation-v2/CATEGORY-REVIEW.md';
const temporary = `docs/styles/curation-v2/.category-review-${process.pid}.tmp.md`;
try {
  await writeFile(temporary, output, 'utf8');
  const formatter = Bun.spawn(['bunx', 'vp', 'fmt', '--threads', '4', temporary], {
    stdout: 'inherit',
    stderr: 'inherit',
  });
  if ((await formatter.exited) !== 0) throw new Error('Category review formatting failed');
  output = await readFile(temporary, 'utf8');
} finally {
  await rm(temporary, { force: true });
}
if (process.argv.includes('--check')) {
  if ((await readFile(target, 'utf8')) !== output)
    throw new Error(
      'Category review document is stale. Run bun scripts/generate-style-curation-review-doc.ts.',
    );
} else await writeFile(target, output, 'utf8');
console.log(`[styles:curation:docs] ${reviews.length} category reviews`);
