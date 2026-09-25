import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it, vi } from 'vitest';

import {
  IMAGEGEN_DENOISE_SUFFIX,
  HttpStatusError,
  preserveReviewedChatgptLock,
  preservePreviousStyleDefault,
  request,
  removeStyleDefaultFailuresForPreset,
  sanitizeStylePromptName,
  writeRepoWebpAsset,
} from './style-default-utils';

describe('single-attempt job intake', () => {
  it('preserves a definite HTTP 400 rejection for lock cleanup', async () => {
    let calls = 0;
    vi.stubGlobal('fetch', async () => {
      calls += 1;
      return new Response('{"code":"invalid_request_body"}', { status: 400 });
    });

    try {
      await expect(
        request('/api/jobs', { method: 'POST', body: '{}' }, { attempts: 1 }),
      ).rejects.toMatchObject({ status: 400, name: HttpStatusError.name });
      expect(calls).toBe(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('moves only the reviewed per-preset lock to job evidence without overwriting it', async () => {
    const directory = mkdtempSync(path.join(tmpdir(), 'codex-studio-style-lock-'));
    const lockPath = path.join(directory, 'SP01-001.chatgpt.lock');
    const evidencePath = path.join(directory, 'SP01-001.reviewed-job.chatgpt.lock');

    try {
      writeFileSync(lockPath, 'prior uncertain request');
      await preserveReviewedChatgptLock(lockPath, evidencePath);

      expect(existsSync(lockPath)).toBe(false);
      expect(readFileSync(evidencePath, 'utf8')).toBe('prior uncertain request');

      writeFileSync(lockPath, 'current lock');
      await expect(preserveReviewedChatgptLock(lockPath, evidencePath)).rejects.toThrow();
      expect(readFileSync(lockPath, 'utf8')).toBe('current lock');
      expect(readFileSync(evidencePath, 'utf8')).toBe('prior uncertain request');
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});

describe('sanitizeStylePromptName', () => {
  it('keeps ordinary preset names intact', () => {
    expect(sanitizeStylePromptName('Veiled Grimoire Secrecy')).toBe('Veiled Grimoire Secrecy');
  });

  it('softens conflict-heavy weapon terms for generation labels only', () => {
    expect(sanitizeStylePromptName('Oath Knife Binding')).toBe('Oath Seal Binding');
    expect(sanitizeStylePromptName('Ceremonial Blades of Sacrifice')).toBe(
      'Ceremonial Edges of Rite',
    );
    expect(sanitizeStylePromptName('Vulnerable Performance Spin Style')).toBe(
      'Expressive Performance Spin Style',
    );
  });
});

describe('IMAGEGEN_DENOISE_SUFFIX', () => {
  it('does not make anime a global fallback style', () => {
    expect(IMAGEGEN_DENOISE_SUFFIX).not.toContain('anime-inspired illustration when useful');
    expect(IMAGEGEN_DENOISE_SUFFIX).toContain(
      'unless the preset, pack, or category explicitly calls for anime',
    );
  });
});

describe('removeStyleDefaultFailuresForPreset', () => {
  it('removes only the recovered preset from a provider failure ledger', () => {
    const failures = [
      { presetId: 'SP01-001', error: 'failed once' },
      { presetId: 'SP01-002', error: 'still failing' },
      { error: 'legacy entry without a preset id' },
    ];

    expect(removeStyleDefaultFailuresForPreset(failures, 'SP01-001')).toEqual([
      { presetId: 'SP01-002', error: 'still failing' },
      { error: 'legacy entry without a preset id' },
    ]);
  });
});

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
      const previousAlternate = path.join(directory, 'previous', 'output.webp');
      await preservePreviousStyleDefault(destinationPath, previousAlternate);
      expect(readFileSync(previousAlternate)).toEqual(firstCard);
      await preservePreviousStyleDefault(destinationPath, previousAlternate);
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
