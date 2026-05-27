import { describe, expect, it } from 'vite-plus/test';

import { createGenerationTaskSpec } from '../../../packages/shared/src';
import { hydrateSourceSpecAssetPaths } from './referenceManager';

describe('referenceManager', () => {
  it('hydrates only reference assets with persisted local paths', () => {
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
      [{ name: 'moodboard.png', dataUrl: 'data:image/png;base64,CCC', strength: 0.4 }],
      [
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
        localPath: 'D:/AI-Studio-Library/references/job-2/moodboard.png',
      }),
    );
  });
});
