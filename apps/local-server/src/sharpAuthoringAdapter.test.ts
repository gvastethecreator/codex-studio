import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const srcDir = path.dirname(fileURLToPath(import.meta.url));

function listTsFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listTsFiles(absolutePath);
    return entry.isFile() && entry.name.endsWith('.ts') ? [absolutePath] : [];
  });
}

describe('sharpAuthoringAdapter boundary', () => {
  it('is the only local-server production sharp import', () => {
    const files = listTsFiles(srcDir).filter(
      (filePath) => !filePath.endsWith('.test.ts') && !filePath.endsWith('.bun.test.ts'),
    );
    const sharpImporters = files.filter((filePath) =>
      /from ['"]sharp['"]/.test(readFileSync(filePath, 'utf8')),
    );
    expect(
      sharpImporters.map((filePath) => path.relative(srcDir, filePath).replaceAll('\\', '/')),
    ).toEqual(['sharpAuthoringAdapter.ts']);
  });

  it('is not imported by runtime thumbnail or reference code', () => {
    expect(readFileSync(path.join(srcDir, 'libraryAssetVariants.ts'), 'utf8')).not.toMatch(
      /from ['"].*sharpAuthoringAdapter/,
    );
    expect(readFileSync(path.join(srcDir, 'referenceManager.ts'), 'utf8')).not.toMatch(
      /from ['"].*sharpAuthoringAdapter/,
    );
    expect(readFileSync(path.join(srcDir, 'imagePipeline.ts'), 'utf8')).not.toMatch(
      /from ['"].*sharpAuthoringAdapter/,
    );
  });

  it('is the Character Lab extract/composite import', () => {
    const repoRoot = path.resolve(srcDir, '../../..');
    for (const relativePath of [
      'scripts/build-character-lab-icon-assets.ts',
      'scripts/build-character-lab-option-icon-assets.ts',
    ]) {
      const source = readFileSync(path.join(repoRoot, relativePath), 'utf8');
      expect(source).toMatch(/from ['"]\.\.\/apps\/local-server\/src\/sharpAuthoringAdapter['"]/);
      expect(source).not.toMatch(/from ['"]sharp['"]/);
    }
  });
});
