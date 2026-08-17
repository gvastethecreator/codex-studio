import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import type { Attachment } from '../types';
import {
  prepareStudioGenerationRequest,
  resolveStudioGenerateRecipeId,
} from './studioGenerationRequest';

function attachment(id: string): Attachment {
  return {
    id,
    name: `${id}.png`,
    dataUrl: `data:image/png;base64,${id}`,
    strength: 0.5,
  };
}

describe('prepareStudioGenerationRequest', () => {
  it('keeps source plus three references for Character Lab requests', () => {
    const request = prepareStudioGenerationRequest({
      generationConfig: {
        ...DEFAULT_GENERATION_CONFIG,
        prompt: 'generate a character lab action',
        recipeId: 'character-lab',
        attachments: ['source', 'ref-1', 'ref-2', 'ref-3', 'extra'].map(attachment),
      },
    });

    expect(request.ok).toBe(true);
    if (!request.ok) return;
    expect(request.finalConfig.attachments.map((item) => item.id)).toEqual([
      'source',
      'ref-1',
      'ref-2',
      'ref-3',
    ]);
  });

  it('keeps an explicit Home recipeId even when the current route is a recipe', () => {
    expect(resolveStudioGenerateRecipeId({ recipeId: null }, 'styles')).toBeNull();
    expect(resolveStudioGenerateRecipeId(undefined, 'styles')).toBe('styles');
    expect(resolveStudioGenerateRecipeId({ prompt: 'boat' }, null)).toBeNull();
  });

  it('uses an explicit Home recipe override instead of a persisted Camera recipe', () => {
    const request = prepareStudioGenerationRequest({
      generationConfig: {
        ...DEFAULT_GENERATION_CONFIG,
        prompt: 'a red paper boat',
        recipeId: 'camera',
        aspectRatio: '1:1',
      },
      configOverrides: { recipeId: null },
      providerId: 'grok',
    });

    expect(request.ok).toBe(true);
    if (!request.ok) return;
    expect(request.finalConfig.recipeId).toBeNull();
    expect(request.finalConfig.prompt).toBe('a red paper boat');
  });

  it('blocks a Grok request for an unsupported recipe before the API call', () => {
    const request = prepareStudioGenerationRequest({
      generationConfig: {
        ...DEFAULT_GENERATION_CONFIG,
        prompt: 'orbit the subject',
        recipeId: 'camera',
        aspectRatio: '1:1',
      },
      providerId: 'grok',
    });

    expect(request).toEqual({
      ok: false,
      message: 'This recipe uses Codex. Switch provider or open a Grok recipe.',
    });
  });
});
