import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import {
  createDefaultEditableStudioSettings,
  type StudioOutputSubfolderToken,
} from '../../../packages/shared/src';

import { buildOutputAssetRelativePath } from './outputOrganization';

describe('outputOrganization', () => {
  it('builds readable generated output paths from Studio Settings', () => {
    const settings = createDefaultEditableStudioSettings();

    expect(
      buildOutputAssetRelativePath(settings, {
        jobId: 'job-123',
        providerId: 'codex',
        model: 'gpt-5.4-mini',
        recipeId: 'styles',
        createdAt: new Date(2026, 4, 26, 2, 3, 4),
        extension: '.png',
      }),
    ).toBe(
      path.join('outputs', '2026-05-26', 'codex', 'styles', '20260526-020304-codex-job-123.png'),
    );
  });

  it('sanitizes provider model and recipe path parts', () => {
    const settings = {
      outputOrganization: {
        subfolderTokens: ['provider', 'model', 'recipe'] as StudioOutputSubfolderToken[],
        fileNameTemplate: '{recipe}-{jobId}',
      },
    };

    expect(
      buildOutputAssetRelativePath(settings, {
        jobId: 'job:1',
        providerId: 'fal.ai',
        model: 'fal/image model',
        recipeId: 'texture:tiles',
        createdAt: new Date(2026, 4, 26, 2, 3, 4),
        extension: 'bad',
      }),
    ).toBe(
      path.join('outputs', 'fal.ai', 'fal-image-model', 'texture-tiles', 'texture-tiles-job-1.png'),
    );
  });
});
