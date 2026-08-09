import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vite-plus/test';

import {
  IMAGEGEN_DENOISE_SUFFIX,
  removeStyleDefaultFailuresForPreset,
  sanitizeStylePromptName,
  writeRepoWebpAsset,
} from './style-default-utils';

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
      await sharp({
        create: { width: 12, height: 16, channels: 3, background: '#334455' },
      })
        .png()
        .toFile(sourcePath);

      await writeRepoWebpAsset(sourcePath, destinationPath, { archive: false });

      expect(existsSync(destinationPath)).toBe(true);
      expect(existsSync(archivePath)).toBe(false);
    } finally {
      if (previousArchivePath === undefined) delete process.env.STYLE_DEFAULT_CARD_ARCHIVE_DIR;
      else process.env.STYLE_DEFAULT_CARD_ARCHIVE_DIR = previousArchivePath;
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
