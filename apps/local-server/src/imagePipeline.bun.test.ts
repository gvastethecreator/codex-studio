import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'bun:test';
import { isWebpPayload, readImageMetadata } from './imagePipeline';
import { ensureThumbnailVariant } from './libraryAssetVariants';
import { processReferences } from './referenceManager';

const ONE_BY_ONE_PNG = Uint8Array.from(
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  ),
);

describe('Bun.Image hot path', () => {
  it('creates a Catalog Entry thumbnail webp without sharp', async () => {
    const libraryDir = mkdtempSync(path.join(os.tmpdir(), 'studio-bun-thumbs-'));
    try {
      const sourceFilePath = path.join(libraryDir, 'outputs', 'sample.png');
      mkdirSync(path.dirname(sourceFilePath), { recursive: true });
      const largePng = await new Bun.Image(ONE_BY_ONE_PNG)
        .resize(640, 480, { fit: 'fill' })
        .png()
        .bytes();
      writeFileSync(sourceFilePath, largePng);

      const thumbnailPath = await ensureThumbnailVariant(sourceFilePath, {
        libraryDir,
        maxEdge: 256,
      });
      const encoded = readFileSync(thumbnailPath);
      const metadata = await readImageMetadata(encoded);

      expect(thumbnailPath).toContain(`${path.sep}outputs${path.sep}thumbnails${path.sep}`);
      expect(isWebpPayload(encoded)).toBe(true);
      expect(metadata.format).toBe('webp');
      expect(metadata.width ?? 0).toBeLessThanOrEqual(256);
      expect(metadata.height ?? 0).toBeLessThanOrEqual(256);
    } finally {
      rmSync(libraryDir, { recursive: true, force: true });
    }
  });

  it('persists a reference webp with Bun.Image', async () => {
    const libraryDir = mkdtempSync(path.join(os.tmpdir(), 'studio-bun-refs-'));
    try {
      const result = await processReferences(
        'handoff-test',
        'Reference handoff.',
        [
          {
            name: 'Hero Source.PNG',
            dataUrl: `data:image/png;base64,${Buffer.from(ONE_BY_ONE_PNG).toString('base64')}`,
            strength: 0.7,
          },
        ],
        libraryDir,
      );

      const reference = result.persistedRefs[0];
      expect(reference?.mimeType).toBe('image/webp');
      expect(reference?.path.replaceAll('\\', '/')).toMatch(
        /\.studio\/references\/handoff-test\/Hero-Source\.webp$/,
      );
      const encoded = readFileSync(reference!.path);
      const metadata = await readImageMetadata(encoded);
      expect(isWebpPayload(encoded)).toBe(true);
      expect(metadata.format).toBe('webp');
      expect(metadata.width).toBe(1);
      expect(metadata.height).toBe(1);
    } finally {
      rmSync(libraryDir, { recursive: true, force: true });
    }
  });
});
