import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import type { ImageGenerationConfig } from '../types';
import {
  buildJobAssets,
  buildLocalGenerationTaskPrompt,
  resolveLocalGenerationProviderId,
} from './localGenerationRun';

describe('localGenerationRun', () => {
  it('uses the explicit provider before Studio Settings defaults', () => {
    expect(
      resolveLocalGenerationProviderId({
        providerId: 'dry_run',
        settings: { defaultProviderId: 'fal' },
      }),
    ).toBe('dry_run');
  });

  it('uses the Studio Settings default provider when no override is provided', () => {
    expect(
      resolveLocalGenerationProviderId({
        settings: { defaultProviderId: 'fal' },
      }),
    ).toBe('fal');
  });

  it('falls back to Codex when settings are unavailable', () => {
    expect(resolveLocalGenerationProviderId({ settings: null })).toBe('codex');
  });

  it('keeps image-guided task prompt compact instead of embedding recipe transport text', () => {
    const config: ImageGenerationConfig = {
      ...DEFAULT_GENERATION_CONFIG,
      prompt: '',
      recipeId: 'styles',
      recipeContext: '--- CODEX RECIPE CONTEXT --- legacy block',
      negativePrompt: 'explicit, harsh',
      attachments: [
        {
          id: 'att-1',
          name: 'download.jpg',
          dataUrl: 'data:image/jpeg;base64,AAA',
          strength: 0.15,
        },
      ],
    };
    const prompt = buildLocalGenerationTaskPrompt({
      config,
    });

    expect(prompt).toBe('Apply the selected style using the provided reference image.');
    expect(prompt).not.toContain('CODEX RECIPE CONTEXT');
    expect(prompt).not.toContain('Avoid:');
  });

  it('materializes queued attachments as backend task assets', async () => {
    const assets = await buildJobAssets({
      config: {
        ...DEFAULT_GENERATION_CONFIG,
        attachments: [
          {
            id: 'att-1',
            name: 'download.jpg',
            dataUrl: 'data:image/jpeg;base64,AAA',
            strength: 0.15,
          },
        ],
      },
    });

    expect(assets).toEqual([
      {
        role: 'reference',
        name: 'download.jpg',
        dataUrl: 'data:image/jpeg;base64,AAA',
        strength: 0.15,
      },
    ]);
  });
});
