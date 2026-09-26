import { describe, expect, it } from 'vitest';

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
  it('uses the same reference influence from the Styles button and the composer', () => {
    const generationConfig = {
      ...DEFAULT_GENERATION_CONFIG,
      prompt: 'red cube',
      recipeId: 'styles' as const,
      attachments: [attachment('current')],
    };
    const composer = prepareStudioGenerationRequest({ generationConfig });
    const recipe = prepareStudioGenerationRequest({
      generationConfig,
      configOverrides: { attachments: generationConfig.attachments },
    });
    expect(composer.ok && composer.finalConfig.attachments).toEqual(
      recipe.ok && recipe.finalConfig.attachments,
    );
    expect(composer.ok && composer.finalConfig.attachments[0]?.strength).toBe(0.15);
    expect(generationConfig.attachments[0]?.strength).toBe(0.5);
  });

  it('holds a preserved reference more strongly than a reinterpreted one', () => {
    const generationConfig = {
      ...DEFAULT_GENERATION_CONFIG,
      prompt: 'red cube',
      recipeId: 'styles' as const,
      attachments: [attachment('current')],
    };
    const preserved = prepareStudioGenerationRequest({
      generationConfig: {
        ...generationConfig,
        recipeParams: { styleReferenceMode: 'preserve' },
      },
    });
    const reinterpreted = prepareStudioGenerationRequest({
      generationConfig: {
        ...generationConfig,
        recipeParams: { styleReferenceMode: 'reinterpret' },
      },
    });
    expect(preserved.ok && preserved.finalConfig.attachments[0]?.strength).toBe(0.85);
    expect(reinterpreted.ok && reinterpreted.finalConfig.attachments[0]?.strength).toBe(0.35);
  });
  it('captures the displayed HTTP default while preserving an explicit transport choice', () => {
    const generationConfig = { ...DEFAULT_GENERATION_CONFIG, prompt: 'red cube' };
    const request = prepareStudioGenerationRequest({
      generationConfig,
      defaultCodexTransport: 'subscription_http',
    });
    expect(request.ok && request.finalConfig.codexTransport).toBe('subscription_http');
    const explicit = prepareStudioGenerationRequest({
      generationConfig: { ...generationConfig, codexTransport: 'codex_app_server' },
      defaultCodexTransport: 'subscription_http',
    });
    expect(explicit.ok && explicit.finalConfig.codexTransport).toBe('codex_app_server');
  });
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
