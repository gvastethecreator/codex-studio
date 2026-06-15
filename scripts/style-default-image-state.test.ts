import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vite-plus/test';

import {
  hasStyleDefaultImageFile,
  resolveStyleDefaultImageFilePath,
} from './style-default-image-state';

describe('style-default-image-state', () => {
  it('resolves repo-rooted default image paths', () => {
    expect(
      resolveStyleDefaultImageFilePath('D:\\repo', '/assets/recipes/styles/defaults/SP14-001.webp'),
    ).toBe(path.join('D:\\repo', 'assets', 'recipes', 'styles', 'defaults', 'SP14-001.webp'));
  });

  it('requires a real file instead of only a configured path', async () => {
    const rootDir = await mkdtemp(path.join(tmpdir(), 'style-default-image-state-'));
    const preset = {
      assets: {
        defaultImage: '/assets/recipes/styles/defaults/SP99-001.webp',
      },
    };

    expect(hasStyleDefaultImageFile(rootDir, preset)).toBe(false);

    const targetFile = path.join(
      rootDir,
      'assets',
      'recipes',
      'styles',
      'defaults',
      'SP99-001.webp',
    );
    await mkdir(path.dirname(targetFile), { recursive: true });
    await writeFile(targetFile, 'ok', 'utf8');

    expect(hasStyleDefaultImageFile(rootDir, preset)).toBe(true);
  });
});
