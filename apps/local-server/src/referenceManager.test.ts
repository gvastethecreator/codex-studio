import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createGenerationTaskSpec } from '../../../packages/shared/src';
import { resolveLibraryPathFromRoot } from './library';
import {
  hydrateSourceSpecAssetPaths,
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

  it('does not import sharp on the reference hot path', () => {
    const source = readFileSync(
      fileURLToPath(new URL('./referenceManager.ts', import.meta.url)),
      'utf8',
    );
    expect(source).not.toMatch(/from ['"]sharp['"]/);
    expect(source).toMatch(/encodeResizedWebpFromBytes/);
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
    const libraryDir = path.resolve('tmp', 'AI-Studio-Library');
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

    const hydrated = hydrateSourceSpecAssetPaths(sourceSpec, [], [], libraryDir);

    expect(hydrated?.assets[0]).toEqual({
      role: 'reference',
      name: 'generated.png',
      sourceUrl: undefined,
      localPath: resolveLibraryPathFromRoot(libraryDir, 'outputs', 'generated image.png'),
      strength: 0.5,
    });
  });
});
