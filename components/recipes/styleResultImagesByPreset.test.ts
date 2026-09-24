import { describe, expect, it } from 'vitest';
import type { GeneratedImageWithConfig, ImageGenerationConfig } from '../../types';
import { groupStyleResultImagesByPreset } from './styleResultImagesByPreset';

const baseConfig: ImageGenerationConfig = {
  attachments: [],
  aspectRatio: '2:3',
  imageSize: '1K',
  model: 'codex-imagegen',
  executionModel: 'gpt-5.4-mini',
  executionReasoningEffort: 'low',
  executionSpeed: 'standard',
  batchCount: 1,
};

function image(
  id: string,
  createdAt: number,
  config: ImageGenerationConfig,
): GeneratedImageWithConfig {
  return { id, src: `/library/${id}.png`, batchId: id, createdAt, config };
}

describe('style result images by preset', () => {
  it('indexes multi-style results once per preset and newest first', () => {
    const older = image('older', 10, {
      ...baseConfig,
      recipeId: 'styles',
      recipeParams: { presetId: 'SP01-001' },
    });
    const newer = image('newer', 20, {
      ...baseConfig,
      recipeId: 'styles',
      recipeParams: {
        presetId: 'SP01-001',
        selectedStyles: [{ presetId: 'SP01-001' }, { presetId: 'SP02-010' }],
      },
    });
    const unrelated = image('other', 30, { ...baseConfig, recipeId: 'camera' });
    const result = groupStyleResultImagesByPreset([older, newer, unrelated]);
    expect(result.get('SP01-001')?.map((entry) => entry.id)).toEqual(['newer', 'older']);
    expect(result.get('SP02-010')?.map((entry) => entry.id)).toEqual(['newer']);
    expect(result.size).toBe(2);
  });
});
