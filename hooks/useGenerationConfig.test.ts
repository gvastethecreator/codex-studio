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

  it('keeps handoff-backed attachments without persisting oversized inline bytes', () => {
    const prepared = prepareGenerationConfigForPersist({
      ...DEFAULT_GENERATION_CONFIG,
      attachments: [
        {
          id: 'large-ref',
          name: 'large.png',
          dataUrl: `data:image/png;base64,${'A'.repeat(600 * 1024)}`,
          localPath: 'D:/AI-Studio-Library/.studio/references/handoff-1/large.png',
          sourceUrl: 'http://127.0.0.1:4317/library/.studio/references/handoff-1/large.png',
          strength: 1,
        },
      ],
    });

    expect(prepared.attachments).toEqual([
      {
        id: 'large-ref',
        name: 'large.png',
        dataUrl: 'http://127.0.0.1:4317/library/.studio/references/handoff-1/large.png',
        localPath: 'D:/AI-Studio-Library/.studio/references/handoff-1/large.png',
        sourceUrl: 'http://127.0.0.1:4317/library/.studio/references/handoff-1/large.png',
        strength: 1,
      },
    ]);
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

  it('upgrades the old image defaults to GPT-5.4 medium when the catalog supports it', () => {
    const normalized = normalizeGenerationConfigForCodexModels(
      {
        ...DEFAULT_GENERATION_CONFIG,
        executionModel: 'gpt-5.4-mini',
        executionReasoningEffort: 'low',
        executionSpeed: 'standard',
      },
      [
        {
          id: 'gpt-5.4',
          model: 'gpt-5.4',
          displayName: 'GPT-5.4',
          description: 'Default image task model',
          hidden: false,
          defaultReasoningEffort: 'medium',
          supportedReasoningEfforts: [
            { reasoningEffort: 'low', description: null },
            { reasoningEffort: 'medium', description: null },
            { reasoningEffort: 'high', description: null },
          ],
          additionalSpeedTiers: [],
          inputModalities: ['text', 'image'],
          supportsPersonality: false,
          isDefault: true,
        },
        {
          id: 'gpt-5.4-mini',
          model: 'gpt-5.4-mini',
          displayName: 'GPT-5.4 mini',
          description: 'Old default',
          hidden: false,
          defaultReasoningEffort: 'low',
          supportedReasoningEfforts: [
            { reasoningEffort: 'low', description: null },
            { reasoningEffort: 'medium', description: null },
          ],
          additionalSpeedTiers: [],
          inputModalities: ['text', 'image'],
          supportsPersonality: false,
          isDefault: false,
        },
      ],
    );

    expect(normalized.executionModel).toBe('gpt-5.4');
    expect(normalized.executionReasoningEffort).toBe('medium');
    expect(normalized.executionSpeed).toBe('standard');
  });
});
