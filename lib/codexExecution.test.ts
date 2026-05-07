import { describe, expect, it } from 'vite-plus/test';

import type { CodexModel } from '../packages/shared/src';
import {
  getCodexSpeedOptions,
  normalizeCodexReasoningEffort,
  normalizeCodexSpeed,
  pickPreferredCodexModel,
} from './codexExecution';

function createModel(overrides: Partial<CodexModel>): CodexModel {
  return {
    id: 'gpt-5.4',
    model: 'gpt-5.4',
    displayName: 'GPT-5.4',
    description: null,
    hidden: false,
    defaultReasoningEffort: 'medium',
    supportedReasoningEfforts: [
      { reasoningEffort: 'low', description: 'Lower latency' },
      { reasoningEffort: 'medium', description: 'Balanced' },
      { reasoningEffort: 'high', description: 'More thinking' },
    ],
    additionalSpeedTiers: ['fast'],
    inputModalities: ['text', 'image'],
    supportsPersonality: true,
    isDefault: false,
    ...overrides,
  };
}

describe('codexExecution', () => {
  it('keeps the currently selected model when it is still available', () => {
    const models = [createModel({ id: 'gpt-5.4-mini' }), createModel({ id: 'gpt-5.5' })];

    expect(pickPreferredCodexModel(models, 'gpt-5.5')).toBe('gpt-5.5');
  });

  it('prefers GPT-5.4 mini before other defaults when the current model is unavailable', () => {
    const models = [
      createModel({ id: 'gpt-5.5', isDefault: true }),
      createModel({ id: 'gpt-5.4-mini', isDefault: false }),
    ];

    expect(pickPreferredCodexModel(models, 'missing-model')).toBe('gpt-5.4-mini');
  });

  it('falls back to the model default reasoning effort when the requested one is unsupported', () => {
    const spark = createModel({
      id: 'gpt-5.3-codex-spark',
      defaultReasoningEffort: 'low',
      supportedReasoningEfforts: [
        { reasoningEffort: 'low', description: 'Lower latency' },
        { reasoningEffort: 'medium', description: 'Balanced' },
      ],
      additionalSpeedTiers: [],
    });

    expect(normalizeCodexReasoningEffort(spark, 'high')).toBe('low');
  });

  it('only exposes supported speed tiers and normalizes unsupported selections back to standard', () => {
    const mini = createModel({ id: 'gpt-5.4-mini', additionalSpeedTiers: [] });

    expect(getCodexSpeedOptions(mini)).toEqual(['standard']);
    expect(normalizeCodexSpeed(mini, 'fast')).toBe('standard');
  });
});