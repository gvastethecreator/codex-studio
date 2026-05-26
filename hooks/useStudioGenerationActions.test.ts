import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import { prepareStudioGenerationRequest } from './useStudioGenerationActions';

describe('prepareStudioGenerationRequest', () => {
  it('keeps queued attachment copies and frees the composer for another upload', () => {
    const attachment = {
      id: 'att-1',
      name: 'ref.png',
      dataUrl: 'data:image/png;base64,AAAA',
      strength: 0.15,
    };

    const request = prepareStudioGenerationRequest({
      generationConfig: {
        ...DEFAULT_GENERATION_CONFIG,
        prompt: '',
        attachments: [attachment],
      },
    });

    expect(request.ok).toBe(true);
    if (!request.ok) return;

    attachment.strength = 0.75;

    expect(request.queuePrompt).toBe('Image-guided generation');
    expect(request.shouldClearComposerAttachments).toBe(true);
    expect(request.finalConfig.attachments).toEqual([
      {
        id: 'att-1',
        name: 'ref.png',
        dataUrl: 'data:image/png;base64,AAAA',
        strength: 0.15,
      },
    ]);
  });

  it('uses style override attachments without mutating the active config object', () => {
    const request = prepareStudioGenerationRequest({
      generationConfig: {
        ...DEFAULT_GENERATION_CONFIG,
        prompt: 'base prompt',
        attachments: [],
      },
      configOverrides: {
        recipeId: 'styles',
        attachments: [
          {
            id: 'fallback-1',
            name: 'style-base.jpg',
            dataUrl: 'data:image/jpeg;base64,BBBB',
            strength: 0.5,
          },
        ],
      },
    });

    expect(request.ok).toBe(true);
    if (!request.ok) return;

    expect(request.finalConfig.recipeId).toBe('styles');
    expect(request.finalConfig.attachments).toHaveLength(1);
    expect(request.shouldClearComposerAttachments).toBe(true);
  });

  it('rejects empty generation without prompt or reference image', () => {
    const request = prepareStudioGenerationRequest({
      generationConfig: {
        ...DEFAULT_GENERATION_CONFIG,
        prompt: '   ',
        attachments: [],
      },
    });

    expect(request).toEqual({
      ok: false,
      message: 'Type a prompt before generating',
    });
  });
});
