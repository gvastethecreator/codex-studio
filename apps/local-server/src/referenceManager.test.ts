import { describe, expect, it } from 'vite-plus/test';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

import { createGenerationTaskSpec } from '../../../packages/shared/src';
import {
  hydrateSourceSpecAssetPaths,
  processReferences,
  prepareReferencesForPersistence,
  ReferenceProcessingError,
} from './referenceManager';

function processedRef(pathValue: string, name = path.basename(pathValue), strength = 1) {
  return {
    name,
    path: pathValue,
    strength,
    mimeType: 'image/webp' as const,
    fileSizeBytes: 123,
    width: 16,
    height: 16,
  };
}

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
        maxOutputBytes: 1024,
      }),
    ).toThrow(ReferenceProcessingError);

    expect(() =>
      prepareReferencesForPersistence([smallReference], {
        maxCount: 1,
        maxBytes: 2,
        maxTotalBytes: 2048,
        maxOutputBytes: 1024,
      }),
    ).toThrow(ReferenceProcessingError);
  });

  it('persists uploaded references as bounded WebP files under the handoff folder', async () => {
    const tmp = mkdtempSync(path.join(os.tmpdir(), 'codex-studio-refs-'));
    try {
      const png = await sharp({
        create: {
          width: 32,
          height: 24,
          channels: 4,
          background: '#7c3aedff',
        },
      })
        .png()
        .toBuffer();

      const result = await processReferences(
        'handoff-test',
        'Reference handoff.',
        [
          {
            name: 'Hero Source.PNG',
            dataUrl: `data:image/png;base64,${png.toString('base64')}`,
            strength: 0.7,
          },
        ],
        tmp,
      );

      const reference = result.persistedRefs[0];
      expect(reference?.path.replaceAll('\\', '/')).toMatch(
        /\.studio\/references\/handoff-test\/Hero-Source\.webp$/,
      );
      expect(reference?.mimeType).toBe('image/webp');
      expect(reference?.fileSizeBytes).toBeGreaterThan(0);
      expect(reference?.fileSizeBytes).toBeLessThan(4 * 1024 * 1024);
      expect(result.augmentedPrompt).toContain(reference?.path);

      const metadata = await sharp(readFileSync(reference!.path)).metadata();
      expect(metadata.format).toBe('webp');
      expect(metadata.width).toBe(32);
      expect(metadata.height).toBe(24);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
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
        processedRef('D:/AI-Studio-Library/references/job-1/input-image.webp', 'input-image.png'),
        processedRef('D:/AI-Studio-Library/references/job-1/input-mask.webp', 'input-mask.png'),
        processedRef('D:/AI-Studio-Library/references/job-1/moodboard.webp', 'moodboard.png', 0.4),
      ],
    );

    expect(hydrated?.assets).toEqual([
      {
        role: 'input',
        name: 'input-image.png',
        dataUrl: undefined,
        localPath: 'D:/AI-Studio-Library/references/job-1/input-image.webp',
        strength: 1,
      },
      {
        role: 'mask',
        name: 'input-mask.png',
        dataUrl: undefined,
        localPath: 'D:/AI-Studio-Library/references/job-1/input-mask.webp',
        strength: 1,
      },
      {
        role: 'reference',
        name: 'moodboard.png',
        dataUrl: undefined,
        localPath: 'D:/AI-Studio-Library/references/job-1/moodboard.webp',
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
      [processedRef('D:/AI-Studio-Library/references/job-2/moodboard.webp', 'moodboard.png', 0.65)],
    );

    expect(hydrated?.assets.at(2)).toEqual(
      expect.objectContaining({
        role: 'reference',
        dataUrl: undefined,
        localPath: 'D:/AI-Studio-Library/references/job-2/moodboard.webp',
      }),
    );
  });

  it('hydrates Studio Library source URLs to local paths before provider execution', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-batch-1',
      task: 'image_generate',
      providerId: 'codex',
      prompt: 'Regenerate from this catalog result.',
      assets: [
        {
          role: 'reference',
          name: 'generated.png',
          sourceUrl: 'http://127.0.0.1:17223/library/outputs/generated%20image.png?variant=thumb',
          strength: 0.5,
        },
      ],
    });

    const hydrated = hydrateSourceSpecAssetPaths(sourceSpec, [], [], 'D:/AI-Studio-Library');

    expect(hydrated?.assets[0]).toEqual({
      role: 'reference',
      name: 'generated.png',
      sourceUrl: undefined,
      localPath: path.join('D:/AI-Studio-Library', 'outputs', 'generated image.png'),
      strength: 0.5,
    });
  });
});
