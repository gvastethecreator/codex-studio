import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import {
  normalizeGenerationConfigForCodexModels,
  prepareGenerationConfigForPersist,
} from './useGenerationConfig';

describe('prepareGenerationConfigForPersist', () => {
  it('drops oversized inline attachments from composer recovery', () => {
    const prepared = prepareGenerationConfigForPersist({
      ...DEFAULT_GENERATION_CONFIG,
      attachments: [
        {
          id: 'large-ref',
          name: 'large.png',
          dataUrl: `data:image/png;base64,${'A'.repeat(600 * 1024)}`,
          strength: 1,
        },
      ],
    });

    expect(prepared.attachments).toEqual([]);
  });
});

describe('normalizeGenerationConfigForCodexModels', () => {
  it('uses the preferred available model and clamps unsupported execution options', () => {
    const normalized = normalizeGenerationConfigForCodexModels(
      {
        ...DEFAULT_GENERATION_CONFIG,
        executionModel: 'missing-model',
        executionReasoningEffort: 'xhigh',
        executionSpeed: 'fast',
      },
      [
        {
          id: 'gpt-5.4-mini',
          model: 'gpt-5.4-mini',
          displayName: 'GPT-5.4 mini',
          description: 'Mini',
          hidden: false,
          defaultReasoningEffort: 'medium',
          supportedReasoningEfforts: [
            { reasoningEffort: 'low', description: null },
            { reasoningEffort: 'medium', description: null },
          ],
          additionalSpeedTiers: [],
          inputModalities: ['text', 'image'],
          supportsPersonality: false,
          isDefault: true,
        },
      ],
    );

    expect(normalized.executionModel).toBe('gpt-5.4-mini');
    expect(normalized.executionReasoningEffort).toBe('medium');
    expect(normalized.executionSpeed).toBe('standard');
  });
});
