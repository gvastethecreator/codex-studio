import { describe, expect, it } from 'vitest';

import type { CatalogImage } from '../packages/shared/src';
import { DEFAULT_GENERATION_CONFIG } from '../constants';
import {
  buildGenerationConfigFromCatalogImage,
  getCatalogRegenerateIssue,
} from './catalogImageGenerationConfig';

function createCatalogImage(overrides: Partial<CatalogImage> = {}): CatalogImage {
  return {
    id: 'asset-1',
    libraryId: 'library-1',
    filePath: 'D:/tmp/asset.png',
    thumbnailPath: null,
    publicUrl: '/library/assets/asset.png',
    thumbnailUrl: null,
    prompt: 'Plain prompt',
    negativePrompt: null,
    aspectRatio: null,
    imageSize: null,
    width: 1024,
    height: 1024,
    mimeType: 'image/png',
    fileSizeBytes: 1234,
    jobId: 'job-1',
    workspaceId: 'workspace-1',
    batchId: null,
    recipeId: null,
    isFavorite: false,
    isDeleted: false,
    deletedAt: null,
    tags: [],
    generationConfig: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('buildGenerationConfigFromCatalogImage', () => {
  it('rehydrates recipe identity and transport fields from final prompts', () => {
    const recipeContext = [
      '--- CODEX RECIPE CONTEXT ---',
      'protocol: codex-recipe-v1',
      'recipe: styles',
      'title: STYLE TRANSFER PROTOCOL',
      '',
      'TARGET STYLE: NEO NOIR',
      '--- END CODEX RECIPE CONTEXT ---',
    ].join('\n');

    const asset = createCatalogImage({
      prompt: [
        'Create a neon alley portrait of a masked courier.',
        ['Recipe instructions:', recipeContext].join('\n'),
        'Avoid:\nlow quality, blurry',
        'ImageGen output size: 1024x1536',
        'Aspect ratio: 2:3 (portrait)',
      ].join('\n\n'),
    });

    const config = buildGenerationConfigFromCatalogImage(asset);

    expect(config.prompt).toBe('Create a neon alley portrait of a masked courier.');
    expect(config.recipeId).toBe('styles');
    expect(config).not.toHaveProperty('recipeContext');
    expect(config.negativePrompt).toBe('low quality, blurry');
    expect(config.aspectRatio).toBe('2:3');
  });

  it('prefers persisted generationConfig when available', () => {
    const asset = createCatalogImage({
      generationConfig: {
        prompt: 'Recovered prompt',
        recipeContext:
          '--- CODEX RECIPE CONTEXT ---\nprotocol: codex-recipe-v1\nrecipe: timeline\n--- END CODEX RECIPE CONTEXT ---',
        aspectRatio: '3:2',
        negativePrompt: 'noise',
        batchCount: 3,
      },
    });

    const config = buildGenerationConfigFromCatalogImage(asset);

    expect(config.prompt).toBe('Recovered prompt');
    expect(config.recipeId).toBe('timeline');
    expect(config.aspectRatio).toBe('3:2');
    expect(config.negativePrompt).toBe('noise');
    expect(config.batchCount).toBe(3);
  });

  it('rehydrates execution model, reasoning, and speed from catalog generation config', () => {
    const config = buildGenerationConfigFromCatalogImage(
      createCatalogImage({
        generationConfig: {
          prompt: 'Hero portrait',
          aspectRatio: '1:1',
          imageSize: '1K',
          model: 'codex-imagegen',
          executionModel: 'gpt-5.3-codex-spark',
          executionReasoningEffort: 'medium',
          executionSpeed: 'fast',
        },
      }),
    );

    expect(config.executionModel).toBe('gpt-5.3-codex-spark');
    expect(config.executionReasoningEffort).toBe('medium');
    expect(config.executionSpeed).toBe('fast');
  });

  it('replays the saved source assets and stops Regenerate when a required source is gone', () => {
    const config = buildGenerationConfigFromCatalogImage(
      createCatalogImage({
        generationConfig: {
          prompt: 'Restore it',
          recipeId: 'remaster',
          attachments: [
            {
              role: 'input',
              name: 'old-photo.webp',
              localPath: 'D:/library/references/old-photo.webp',
              strength: 1,
            },
            { role: 'mask', name: 'mask.png', localPath: 'D:/library/masks/mask.png' },
          ],
        },
      }),
    );

    expect(config.attachments).toEqual([
      {
        id: 'source-asset-1-0',
        name: 'old-photo.webp',
        dataUrl: '',
        localPath: 'D:/library/references/old-photo.webp',
        strength: 1,
      },
    ]);
    expect(getCatalogRegenerateIssue(config)).toBeNull();
    expect(getCatalogRegenerateIssue({ ...config, attachments: [] })).toBe(
      'The source image for this result is no longer available. Add it again to regenerate.',
    );
  });

  it('falls back to generation defaults when execution fields are missing', () => {
    const config = buildGenerationConfigFromCatalogImage(createCatalogImage());

    expect(config.executionModel).toBe(DEFAULT_GENERATION_CONFIG.executionModel);
    expect(config.executionReasoningEffort).toBe(
      DEFAULT_GENERATION_CONFIG.executionReasoningEffort,
    );
    expect(config.executionSpeed).toBe(DEFAULT_GENERATION_CONFIG.executionSpeed);
  });
});
