import { describe, expect, it } from 'vite-plus/test';

import type { CatalogImage } from '../packages/shared/src';
import { buildGenerationConfigFromCatalogImage } from './catalogImageGenerationConfig';

function createCatalogImage(overrides: Partial<CatalogImage> = {}): CatalogImage {
  return {
    id: 'asset-1',
    libraryId: 'lib-1',
    filePath: 'D:/tmp/image.png',
    thumbnailPath: null,
    publicUrl: '/library/assets/image.png',
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
    workspaceId: 'default',
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
    expect(config.recipeContext).toContain('recipe: styles');
    expect(config.negativePrompt).toBe('low quality, blurry');
    expect(config.aspectRatio).toBe('2:3');
  });

  it('prefers persisted generationConfig when available', () => {
    const asset = createCatalogImage({
      generationConfig: {
        prompt: 'Recovered prompt',
        recipeContext:
          '--- CODEX RECIPE CONTEXT ---\nprotocol: codex-recipe-v1\nrecipe: timeline\n--- END CODEX RECIPE CONTEXT ---',
        recipeId: 'timeline',
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
});
