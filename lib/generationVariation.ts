/**
 * How far sibling or repeated results may drift from the brief.
 * `open`: composition may change. `details`: the workflow fixes layout, framing, camera and
 * identity, so only small details vary between siblings. `none`: every result must follow the
 * workflow contract exactly, so no brief is sent.
 */
export type GenerationVariationScope = 'open' | 'details' | 'none';

export interface GenerationVariationArgs {
  batchIndex?: number;
  batchCount?: number;
  variationKey?: string | null;
  scope?: GenerationVariationScope;
}

const VARIATION_FOCUS_SEQUENCE = [
  'camera framing and composition',
  'pose or action beat',
  'lighting mood and color balance',
  'environment staging and background details',
  'silhouette, scale, and spatial rhythm',
  'surface treatment and material emphasis',
] as const;

function coercePositiveInt(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  const normalized = Math.trunc(value ?? fallback);
  return normalized > 0 ? normalized : fallback;
}

export function createGenerationVariationKey(prefix = 'variation') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildGenerationVariationBrief({
  batchIndex = 1,
  batchCount = 1,
  variationKey = null,
  scope = 'open',
}: GenerationVariationArgs = {}) {
  const normalizedBatchCount = coercePositiveInt(batchCount, 1);
  const normalizedBatchIndex = Math.min(normalizedBatchCount, coercePositiveInt(batchIndex, 1));
  if (scope === 'none') return null;
  if (scope === 'details') {
    if (normalizedBatchCount === 1) return null;
    return [
      `This is variation ${normalizedBatchIndex} of ${normalizedBatchCount}.`,
      'Keep the layout, framing, camera, identity and palette that the workflow sets.',
      'Vary only small details such as expression nuance, secondary accents, or texture detail.',
      variationKey ? `Variation key: ${variationKey}.` : null,
    ]
      .filter((line): line is string => Boolean(line))
      .join('\n');
  }
  const focus =
    VARIATION_FOCUS_SEQUENCE[(normalizedBatchIndex - 1) % VARIATION_FOCUS_SEQUENCE.length];

  const lines = [
    normalizedBatchCount > 1
      ? `This is variation ${normalizedBatchIndex} of ${normalizedBatchCount}. Make it clearly distinct from the sibling results while preserving the same core brief.`
      : 'Treat this as a fresh interpretation of the brief, not a near-duplicate of an earlier attempt.',
    `Push noticeable change in ${focus}.`,
    'Also vary at least one of: lighting, palette, lens distance, gesture, environment accents, or moment-in-time details.',
    'Avoid near-duplicate images or changes that are only cosmetic.',
    variationKey ? `Variation key: ${variationKey}.` : null,
  ].filter((line): line is string => Boolean(line));

  return lines.join('\n');
}
