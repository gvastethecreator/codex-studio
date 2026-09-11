import { describe, expect, it } from 'vitest';

import type { CodexModel } from '../../../../packages/shared/src';
import { filterSelectableCodexModels } from './modelCatalog';

function model(id: string, hidden = false): CodexModel {
  return {
    id,
    model: id,
    displayName: id,
    description: null,
    hidden,
    defaultReasoningEffort: 'medium',
    supportedReasoningEfforts: [{ reasoningEffort: 'medium', description: null }],
    additionalSpeedTiers: [],
    inputModalities: ['text'],
    supportsPersonality: false,
    isDefault: false,
  };
}

describe('Codex model catalog selection', () => {
  it('keeps GPT-Reserve selectable while excluding other hidden system models', () => {
    expect(
      filterSelectableCodexModels([
        model('gpt-6-astra'),
        model('gpt-reserve', true),
        model('codex-auto-review', true),
      ]).map((entry) => entry.id),
    ).toEqual(['gpt-6-astra', 'gpt-reserve']);
  });
});
