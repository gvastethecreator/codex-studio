import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CHARACTER_LAB_GLOBAL_OPTIONS } from '../lib/characterLabCatalog.generated';

const repoRoot = process.cwd();
const outDir = path.join(repoRoot, '.tmp', 'character-lab', 'option-icon-batches');
const batchSize = 4;
const sheetColumns = 2;
const sheetRows = 2;

type OptionField = 'aspect-ratio' | 'body-type' | 'clothing' | 'expression' | 'style';

interface OptionIconItem {
  id: string;
  field: OptionField;
  label: string;
  detail: string;
  visual: string;
}

interface OptionIconBatch {
  batchId: string;
  index: number;
  promptPath: string;
  items: OptionIconItem[];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
}

function splitOption(value: string) {
  const separator = value.indexOf(': ');
  if (separator === -1) return { label: value, detail: '' };
  return {
    label: value.slice(0, separator),
    detail: value.slice(separator + 2),
  };
}

function aspectRatioVisual(value: string) {
  if (value === '1:1') return 'a square crop frame around a neutral mannequin bust';
  if (['21:9', '16:9', '4:3', '3:2'].includes(value)) {
    return `a wide ${value} cinematic crop frame with a tiny centered mannequin silhouette`;
  }
  if (['9:16', '3:4', '2:3', '4:5'].includes(value)) {
    return `a vertical ${value} portrait crop frame with a centered mannequin silhouette`;
  }
  return `a crop frame marked by proportions ${value} using simple arrows and a mannequin silhouette`;
}

function expressionVisual(value: string) {
  return `a neutral mannequin head and upper torso clearly acting the ${value.toLowerCase()} expression through pose, head tilt, and simple face marks`;
}

function bodyTypeVisual(value: string) {
  if (value.toLowerCase().includes('preserve'))
    return 'a balanced full-body mannequin with a small source-reference spark';
  return `a full-body mannequin silhouette representing ${value.toLowerCase()} body proportions, respectful neutral anatomy, no caricature`;
}

function clothingVisual(value: string) {
  if (value.toLowerCase().includes('preserve'))
    return 'a mannequin beside a small reference image card, clothing unchanged';
  return `a neutral mannequin wearing ${value.toLowerCase()}, readable outfit silhouette, no face identity`;
}

function styleVisual(value: string) {
  const { label, detail } = splitOption(value);
  if (label.toLowerCase().includes('preserve')) {
    return 'a mannequin portrait beside a small reference card, original style preserved';
  }
  return `a mannequin portrait rendered as ${label.toLowerCase()} style; ${detail || 'use the style language as the main visual cue'}`;
}

const optionGroups: Array<{ key: OptionField; items: OptionIconItem[] }> = [
  {
    key: 'expression',
    items: CHARACTER_LAB_GLOBAL_OPTIONS.expressions.map((value) => {
      const { label, detail } = splitOption(value);
      return {
        id: `option:expression:${slugify(value)}`,
        field: 'expression' as const,
        label,
        detail,
        visual: expressionVisual(value),
      };
    }),
  },
  {
    key: 'aspect-ratio',
    items: CHARACTER_LAB_GLOBAL_OPTIONS.aspectRatios.flatMap((group) =>
      group.ratios.map((value) => ({
        id: `option:aspect-ratio:${slugify(value)}`,
        field: 'aspect-ratio' as const,
        label: value,
        detail: group.label,
        visual: aspectRatioVisual(value),
      })),
    ),
  },
  {
    key: 'style',
    items: CHARACTER_LAB_GLOBAL_OPTIONS.styles.map((value) => {
      const { label, detail } = splitOption(value);
      return {
        id: `option:style:${slugify(label)}`,
        field: 'style' as const,
        label,
        detail,
        visual: styleVisual(value),
      };
    }),
  },
  {
    key: 'clothing',
    items: CHARACTER_LAB_GLOBAL_OPTIONS.clothing.map((value) => {
      const { label, detail } = splitOption(value);
      return {
        id: `option:clothing:${slugify(value)}`,
        field: 'clothing' as const,
        label,
        detail,
        visual: clothingVisual(value),
      };
    }),
  },
  {
    key: 'body-type',
    items: CHARACTER_LAB_GLOBAL_OPTIONS.bodyTypes.map((value) => {
      const { label, detail } = splitOption(value);
      return {
        id: `option:body-type:${slugify(value)}`,
        field: 'body-type' as const,
        label,
        detail,
        visual: bodyTypeVisual(value),
      };
    }),
  },
];

const options = optionGroups.flatMap((group) => group.items);

function buildPrompt(batch: OptionIconBatch) {
  const slots = batch.items
    .map((item, index) => {
      const row = Math.floor(index / sheetColumns) + 1;
      const column = (index % sheetColumns) + 1;
      const detail = item.detail ? ` Detail cue: ${item.detail}.` : '';
      return `${index + 1}. Row ${row}, column ${column}: ${item.label} (${item.field}). ${item.visual}.${detail}`;
    })
    .join('\n');

  const emptySlots =
    batch.items.length < batchSize
      ? `\nLeave slots ${batch.items.length + 1}-${batchSize} perfectly empty black.`
      : '';

  return `
Use case: stylized-concept
Asset type: Character Lab option icon sheet
Primary request: Generate a single 2x2 grid icon sheet with 4 large square cells, each cell containing one distinct UI icon for the listed Character Lab option.

GLOBAL ART DIRECTION:
- Flat pure black #000000 background in every cell.
- No text, no labels, no letters, no numbers, no watermark.
- No button borders, no frames, no UI chrome, no rounded card container around icons.
- Neutral faceless warm ivory/gray artist mannequins as the main human form.
- Subtle dark ink outline and soft painterly/illustrated shading, not metallic chrome.
- Functional accent colors may appear only on particles, props, clothing, style cues, crop guides, or items.
- Avoid blue dominance, neon cyan dominance, glossy metal, white backgrounds, busy collage, and photoreal faces.
- Each cell must have one centered icon with generous padding and clear silhouette.
- The grid itself may be implicit; do not draw grid lines. Keep every slot isolated by black negative space.
- Composition must be readable after downscaling from 512px to 128px.

SHEET LAYOUT:
- Output one high-resolution square image, ideally 2048x2048.
- 2 columns by 2 rows.
- Each slot represents exactly one item in row-major order.
- Do not merge slots and do not add extra icons beyond the listed slot.

SLOTS:
${slots}${emptySlots}
`.trim();
}

await mkdir(outDir, { recursive: true });

const batches: OptionIconBatch[] = [];
for (const group of optionGroups) {
  for (
    let localIndex = 0;
    localIndex < Math.ceil(group.items.length / batchSize);
    localIndex += 1
  ) {
    const items = group.items.slice(localIndex * batchSize, (localIndex + 1) * batchSize);
    const batchId = `character-lab-option-icons-${group.key}-${String(localIndex).padStart(2, '0')}`;
    const promptPath = path.join(outDir, `${batchId}.prompt.txt`);
    const batch = {
      batchId,
      index: batches.length,
      promptPath: path.relative(repoRoot, promptPath).replaceAll(path.sep, '/'),
      items,
    };
    batches.push(batch);
    await writeFile(promptPath, `${buildPrompt(batch)}\n`);
  }
}

await writeFile(
  path.join(outDir, 'batches.json'),
  `${JSON.stringify(
    {
      version: 1,
      generatedAt: new Date().toISOString(),
      cellSize: 512,
      columns: sheetColumns,
      rows: sheetRows,
      optionCount: options.length,
      batches,
    },
    null,
    2,
  )}\n`,
);

console.log(`Prepared ${batches.length} option icon prompts for ${options.length} options.`);
