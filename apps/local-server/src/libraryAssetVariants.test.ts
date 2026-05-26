import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vite-plus/test';
import {
  ensureThumbnailVariant,
  resolveLibraryThumbnailPath,
  resolveThumbnailMaxEdge,
} from './libraryAssetVariants';

function cleanupTempLibrary(libraryDir: string) {
  try {
    rmSync(libraryDir, { recursive: true, force: true });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException | undefined)?.code;
    if (code !== 'EPERM') {
      throw error;
    }
  }
}

describe('libraryAssetVariants', () => {
  it('clamps thumbnail max-edge values to safe bounds', () => {
    expect(resolveThumbnailMaxEdge(undefined)).toBe(512);
    expect(resolveThumbnailMaxEdge('12')).toBe(48);
    expect(resolveThumbnailMaxEdge('2048')).toBe(1024);
  });

  it('maps generated assets into the thumbnails folder', async () => {
    const libraryDir = mkdtempSync(path.join(os.tmpdir(), 'codex-studio-thumbs-'));

    try {
      const sourceFilePath = path.join(libraryDir, 'outputs', '2026-05-26', 'sample.png');
      mkdirSync(path.dirname(sourceFilePath), { recursive: true });
      await sharp({
        create: {
          width: 640,
          height: 480,
          channels: 3,
          background: '#663399',
        },
      })
        .png()
        .toFile(sourceFilePath);

      const thumbnailPath = resolveLibraryThumbnailPath(sourceFilePath, {
        libraryDir,
        maxEdge: 256,
      });

      expect(thumbnailPath).toContain(path.join('outputs', 'thumbnails', '2026-05-26'));
      expect(path.extname(thumbnailPath)).toBe('.webp');
    } finally {
      cleanupTempLibrary(libraryDir);
    }
  });

  it('creates a cached webp thumbnail inside the library', async () => {
    const libraryDir = mkdtempSync(path.join(os.tmpdir(), 'codex-studio-thumbs-'));

    try {
      const sourceFilePath = path.join(libraryDir, 'outputs', 'external', 'sample.png');
      mkdirSync(path.dirname(sourceFilePath), { recursive: true });
      await sharp({
        create: {
          width: 1200,
          height: 900,
          channels: 3,
          background: '#ff7f50',
        },
      })
        .png()
        .toFile(sourceFilePath);

      const thumbnailPath = await ensureThumbnailVariant(sourceFilePath, {
        libraryDir,
        maxEdge: 256,
      });
      const secondPassPath = await ensureThumbnailVariant(sourceFilePath, {
        libraryDir,
        maxEdge: 256,
      });

      expect(existsSync(thumbnailPath)).toBe(true);
      expect(secondPassPath).toBe(thumbnailPath);

      const metadata = await sharp(thumbnailPath).metadata();
      expect(metadata.format).toBe('webp');
      expect(metadata.width ?? 0).toBeLessThanOrEqual(256);
      expect(metadata.height ?? 0).toBeLessThanOrEqual(256);
    } finally {
      cleanupTempLibrary(libraryDir);
    }
  });
});