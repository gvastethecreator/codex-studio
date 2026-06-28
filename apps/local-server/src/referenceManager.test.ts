import { describe, expect, it } from 'vite-plus/test';

import { createGenerationTaskSpec } from '../../../packages/shared/src';
import {
  hydrateSourceSpecAssetPaths,
  prepareReferencesForPersistence,
  ReferenceProcessingError,
} from './referenceManager';

describe('referenceManager', () => {
  it('rejects reference payloads that exceed count or byte budgets before persistence', () => {
    const smallReference = {
      name: 'ref.png',
      dataUrl: `data:image/png;base64,${Buffer.from('abc').toString('base64')}`,
      strength: 0.5,
    };

    expect(() =>
      prepareReferencesForPersistence([smallReference, smallReference], {
        maxCount: 1,
        maxBytes: 1024,
        maxTotalBytes: 2048,
      }),
    ).toThrow(ReferenceProcessingError);

    expect(() =>
      prepareReferencesForPersistence([smallReference], {
        maxCount: 1,
        maxBytes: 2,
        maxTotalBytes: 2048,
      }),
    ).toThrow(ReferenceProcessingError);
  });

  it('hydrates every inline task asset with its persisted local path', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-1',
      task: 'image_edit',
      providerId: 'codex',
      prompt: 'Edit the source image with a softer mood.',
      assets: [
        {
          role: 'input',
          name: 'input-image.png',
          dataUrl: 'data:image/png;base64,AAA',
          strength: 1,
        },
        {
          role: 'mask',
          name: 'input-mask.png',
          dataUrl: 'data:image/png;base64,BBB',
          strength: 1,
        },
        {
          role: 'reference',
          name: 'moodboard.png',
          dataUrl: 'data:image/png;base64,CCC',
          strength: 0.4,
        },
      ],
    });

    const hydrated = hydrateSourceSpecAssetPaths(
      sourceSpec,
      [
        { name: 'input-image.png', dataUrl: 'data:image/png;base64,AAA', strength: 1 },
        { name: 'input-mask.png', dataUrl: 'data:image/png;base64,BBB', strength: 1 },
        { name: 'moodboard.png', dataUrl: 'data:image/png;base64,CCC', strength: 0.4 },
      ],
      [
        {
          name: 'input-image.png',
          path: 'D:/AI-Studio-Library/references/job-1/input-image.png',
          strength: 1,
        },
        {
          name: 'input-mask.png',
          path: 'D:/AI-Studio-Library/references/job-1/input-mask.png',
          strength: 1,
        },
        {
          name: 'moodboard.png',
          path: 'D:/AI-Studio-Library/references/job-1/moodboard.png',
          strength: 0.4,
        },
      ],
    );

    expect(hydrated?.assets).toEqual([
      {
        role: 'input',
        name: 'input-image.png',
        dataUrl: undefined,
        localPath: 'D:/AI-Studio-Library/references/job-1/input-image.png',
        strength: 1,
      },
      {
        role: 'mask',
        name: 'input-mask.png',
        dataUrl: undefined,
        localPath: 'D:/AI-Studio-Library/references/job-1/input-mask.png',
        strength: 1,
      },
      {
        role: 'reference',
        name: 'moodboard.png',
        dataUrl: undefined,
        localPath: 'D:/AI-Studio-Library/references/job-1/moodboard.png',
        strength: 0.4,
      },
    ]);
  });

  it('still hydrates references when non-reference assets with inline data appear first', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-2',
      task: 'image_edit',
      providerId: 'codex',
      prompt: 'Stylize this image with a reference.',
      assets: [
        {
          role: 'input',
          name: 'base.png',
          dataUrl: 'data:image/png;base64,AAA',
          strength: 1,
        },
        {
          role: 'mask',
          name: 'mask.png',
          dataUrl: 'data:image/png;base64,BBB',
          strength: 1,
        },
        {
          role: 'reference',
          name: 'moodboard.png',
          dataUrl: 'data:image/png;base64,CCC',
          strength: 0.65,
        },
      ],
    });

    const hydrated = hydrateSourceSpecAssetPaths(
      sourceSpec,
      [{ name: 'moodboard.png', dataUrl: 'data:image/png;base64,CCC', strength: 0.65 }],
      [
        {
          name: 'moodboard.png',
          path: 'D:/AI-Studio-Library/references/job-2/moodboard.png',
          strength: 0.65,
        },
      ],
    );

    expect(hydrated?.assets.at(2)).toEqual(
      expect.objectContaining({
        role: 'reference',
        dataUrl: undefined,
        localPath: 'D:/AI-Studio-Library/references/job-2/moodboard.png',
      }),
    );
  });
});
