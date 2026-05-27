import { describe, expect, it } from 'vite-plus/test';

import { buildGenerationVariationBrief, createGenerationVariationKey } from './generationVariation';

describe('generationVariation', () => {
  it('builds a sibling-aware brief for multi-image batches', () => {
    const brief = buildGenerationVariationBrief({
      batchIndex: 2,
      batchCount: 4,
      variationKey: 'batch-2',
    });

    expect(brief).toContain('variation 2 of 4');
    expect(brief).toContain('pose or action beat');
    expect(brief).toContain('Variation key: batch-2.');
  });

  it('builds a fresh-attempt brief for single-image retries or regenerations', () => {
    const brief = buildGenerationVariationBrief({
      batchIndex: 1,
      batchCount: 1,
    });

    expect(brief).toContain('fresh interpretation');
    expect(brief).toContain('camera framing and composition');
    expect(brief).not.toContain('variation 1 of 1');
  });

  it('generates unique variation keys with the requested prefix', () => {
    const first = createGenerationVariationKey('retry');
    const second = createGenerationVariationKey('retry');

    expect(first.startsWith('retry-')).toBe(true);
    expect(second.startsWith('retry-')).toBe(true);
    expect(first).not.toBe(second);
  });
});
