import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import { prepareStudioGenerationRequest } from '../lib/studioGenerationRequest';
import {
  buildGenerateOverridesWithCurrentAttachments,
  buildRecipeRestoreConfig,
} from './useStudioGenerationActions';

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

describe('useStudioGenerationActions attachment reuse helpers', () => {
  it('replaces stale regenerate attachments with the current composer attachments', () => {
    const currentAttachment = {
      id: 'current-ref',
      name: 'current.png',
      dataUrl: 'data:image/png;base64,CURRENT',
      strength: 0.25,
    };
    const currentAttachments = [currentAttachment];

    const overrides = buildGenerateOverridesWithCurrentAttachments(
      {
        prompt: 'reuse config',
        attachments: [
          {
            id: 'stale-ref',
            name: 'stale.png',
            dataUrl: 'data:image/png;base64,STALE',
            strength: 0.9,
          },
        ],
      },
      currentAttachments,
    );

    expect(overrides).toEqual({
      prompt: 'reuse config',
      attachments: [currentAttachment],
    });
    expect(overrides?.attachments).not.toBe(currentAttachments);

    currentAttachment.strength = 0.8;
    expect(overrides?.attachments?.[0]?.strength).toBe(0.25);
  });

  it('preserves current composer attachments when loading a saved recipe config', () => {
    const currentAttachment = {
      id: 'live-ref',
      name: 'live.png',
      dataUrl: 'data:image/png;base64,LIVE',
      strength: 0.4,
    };
    const currentAttachments = [currentAttachment];

    const restoredConfig = buildRecipeRestoreConfig(
      {
        ...DEFAULT_GENERATION_CONFIG,
        prompt: 'saved recipe',
        recipeId: 'styles',
        attachments: [
          {
            id: 'old-ref',
            name: 'old.png',
            dataUrl: 'data:image/png;base64,OLD',
            strength: 0.95,
          },
        ],
      },
      currentAttachments,
    );

    expect(restoredConfig.attachments).toEqual([currentAttachment]);
    expect(restoredConfig.attachments).not.toBe(currentAttachments);

    currentAttachment.strength = 0.7;
    expect(restoredConfig.attachments[0]?.strength).toBe(0.4);
  });
});
