import { describe, expect, it } from 'vite-plus/test';

import { createGenerationTaskSpec } from '../../../packages/shared/src';
import { hydrateSourceSpecAssetPaths } from './referenceManager';

describe('referenceManager', () => {
  it('hydrates inline source spec assets with persisted local paths in request order', () => {
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
        dataUrl: 'data:image/png;base64,AAA',
        localPath: 'D:/AI-Studio-Library/references/job-1/input-image.png',
        strength: 1,
      },
      {
        role: 'mask',
        name: 'input-mask.png',
        dataUrl: 'data:image/png;base64,BBB',
        localPath: 'D:/AI-Studio-Library/references/job-1/input-mask.png',
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
});