import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { publishPreparedProjections } from './generatedProjectionPublisher';

describe('generated projection publication', () => {
  it('preserves every previous projection if a staged path is missing', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'studio-projection-test-'));
    try {
      const targetDir = path.join(root, 'packs');
      const stagedDir = path.join(root, 'packs.stage-test');
      const targetIndex = path.join(root, 'index.ts');
      const missingIndex = path.join(root, 'index.ts.stage-missing');
      await mkdir(targetDir);
      await mkdir(stagedDir);
      await writeFile(path.join(targetDir, 'pack.ts'), 'old pack');
      await writeFile(path.join(stagedDir, 'pack.ts'), 'new pack');
      await writeFile(targetIndex, 'old index');

      await expect(
        publishPreparedProjections([
          { target: targetDir, staged: stagedDir, kind: 'directory' },
          { target: targetIndex, staged: missingIndex, kind: 'file' },
        ]),
      ).rejects.toThrow();

      expect(await readFile(path.join(targetDir, 'pack.ts'), 'utf8')).toBe('old pack');
      expect(await readFile(targetIndex, 'utf8')).toBe('old index');
      expect((await readdir(root)).filter((name) => name.includes('.backup-'))).toEqual([]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
