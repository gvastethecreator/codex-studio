import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vite-plus/test';

import { createStyleAuthoringSourceAuditReport } from './style-authoring-source-audit';

async function writeRepoFile(rootDir: string, repoPath: string, source: string) {
  const filePath = path.join(rootDir, repoPath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, source, 'utf8');
}

describe('style authoring source audit', () => {
  it('allows legacy source usage only in migration and compatibility test seams', async () => {
    const rootDir = path.join(tmpdir(), `style-source-audit-${Date.now()}`);

    await writeRepoFile(
      rootDir,
      'components/recipes/legacyStylesData.ts',
      'export const LEGACY_STYLE_PACKS = [];',
    );
    await writeRepoFile(
      rootDir,
      'scripts/split-style-preset-manifests.ts',
      "const packsDir = 'components/recipes/styles/packs';",
    );
    await writeRepoFile(
      rootDir,
      'components/recipes/StylesRecipe.tsx',
      "import { LEGACY_STYLE_PACKS } from './legacyStylesData';",
    );

    const report = await createStyleAuthoringSourceAuditReport(rootDir);

    expect(report.usages.map((usage) => usage.filePath).sort()).toEqual([
      'components/recipes/StylesRecipe.tsx',
      'components/recipes/legacyStylesData.ts',
      'scripts/split-style-preset-manifests.ts',
    ]);
    expect(report.violations).toEqual([
      {
        filePath: 'components/recipes/StylesRecipe.tsx',
        markers: ['LEGACY_STYLE_PACKS', 'legacyStylesData'],
      },
    ]);
  });
});
