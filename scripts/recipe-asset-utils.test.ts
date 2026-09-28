import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import { writeRepoWebpAsset } from './recipe-asset-utils';

describe('writeRepoWebpAsset', () => {
  it('can keep provider batches from duplicating every new asset into the archive', async () => {
    const directory = mkdtempSync(path.join(tmpdir(), 'codex-studio-style-asset-'));
    const sourcePath = path.join(directory, 'source.png');
    const destinationPath = path.join(directory, 'output.webp');
    const archivePath = path.join(directory, 'archive');
    const previousArchivePath = process.env.STYLE_DEFAULT_CARD_ARCHIVE_DIR;
    process.env.STYLE_DEFAULT_CARD_ARCHIVE_DIR = archivePath;

    try {
      const pixels = Buffer.from(Array.from({ length: 12 * 16 * 3 }, (_, i) => (i * 37) % 256));
      await sharp(pixels, { raw: { width: 12, height: 16, channels: 3 } })
        .png()
        .toFile(sourcePath);

      await writeRepoWebpAsset(sourcePath, destinationPath, { archive: false });

      expect(existsSync(destinationPath)).toBe(true);
      // Cards keep the provider resolution and every pixel (lossless).
      const written = await sharp(readFileSync(destinationPath))
        .raw()
        .toBuffer({ resolveWithObject: true });
      expect(written.info).toMatchObject({ width: 12, height: 16, channels: 3 });
      expect(written.data.equals(pixels)).toBe(true);
      expect(existsSync(archivePath)).toBe(false);
      const firstCard = readFileSync(destinationPath);
      await expect(
        writeRepoWebpAsset(sourcePath, destinationPath, { archive: false, exclusive: true }),
      ).rejects.toThrow();
      expect(readFileSync(destinationPath)).toEqual(firstCard);
    } finally {
      if (previousArchivePath === undefined) delete process.env.STYLE_DEFAULT_CARD_ARCHIVE_DIR;
      else process.env.STYLE_DEFAULT_CARD_ARCHIVE_DIR = previousArchivePath;
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
