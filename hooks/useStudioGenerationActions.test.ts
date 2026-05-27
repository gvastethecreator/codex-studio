import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import { prepareStudioGenerationRequest } from '../lib/studioGenerationRequest';

describe('prepareStudioGenerationRequest', () => {
  it('keeps queued attachment copies and preserves the composer attachment state', () => {
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
    expect(request.shouldClearComposerAttachments).toBe(false);
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
    expect(request.shouldClearComposerAttachments).toBe(false);
  });

  it('limits non-timeline requests to a single attachment to avoid cross-job leakage', () => {
    const request = prepareStudioGenerationRequest({
      generationConfig: {
        ...DEFAULT_GENERATION_CONFIG,
        prompt: 'single ref expected',
        attachments: [
          {
            id: 'att-1',
            name: 'one.png',
            dataUrl: 'data:image/png;base64,AAAA',
            strength: 0.5,
          },
          {
            id: 'att-2',
            name: 'two.png',
            dataUrl: 'data:image/png;base64,BBBB',
            strength: 0.5,
          },
        ],
      },
    });

    expect(request.ok).toBe(true);
    if (!request.ok) return;

    expect(request.finalConfig.attachments).toHaveLength(1);
    expect(request.finalConfig.attachments[0]?.id).toBe('att-1');
  });

  it('preserves timeline multi-image attachment payloads', () => {
    const request = prepareStudioGenerationRequest({
      generationConfig: {
        ...DEFAULT_GENERATION_CONFIG,
        prompt: 'timeline run',
        recipeId: 'timeline',
        attachments: [
          {
            id: 'att-1',
            name: 'one.png',
            dataUrl: 'data:image/png;base64,AAAA',
            strength: 0.5,
          },
          {
            id: 'att-2',
            name: 'two.png',
            dataUrl: 'data:image/png;base64,BBBB',
            strength: 0.5,
          },
        ],
      },
    });

    expect(request.ok).toBe(true);
    if (!request.ok) return;

    expect(request.finalConfig.attachments).toHaveLength(2);
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
