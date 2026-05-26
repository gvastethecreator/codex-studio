import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vite-plus/test';

import { createRecipeModuleSourceAuditReport } from './recipe-module-source-audit';

async function writeRepoFile(rootDir: string, repoPath: string, source: string) {
  const filePath = path.join(rootDir, repoPath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, source, 'utf8');
}

describe('recipe module source audit', () => {
  it('blocks provider/task-building logic from React recipe surfaces', async () => {
    const rootDir = path.join(tmpdir(), `recipe-source-audit-${Date.now()}`);

    await writeRepoFile(
      rootDir,
      'components/recipes/StylesRecipe.tsx',
      "import { buildRecipeContext } from '../../lib/recipeContext';",
    );
    await writeRepoFile(rootDir, 'components/recipes/recipeModuleUi.ts', 'export const ok = true;');
    await writeRepoFile(rootDir, 'lib/recipeModules.ts', 'buildGenerationTaskSpecFromRecipe();');

    const report = await createRecipeModuleSourceAuditReport(rootDir);

    expect(report.scannedFiles).toBe(1);
    expect(report.violations).toEqual([
      {
        filePath: 'components/recipes/StylesRecipe.tsx',
        markers: ['buildRecipeContext'],
      },
    ]);
  });

  it('also scans TypeScript recipe support files except the UI projection helper', async () => {
    const rootDir = path.join(tmpdir(), `recipe-source-ts-audit-${Date.now()}`);

    await writeRepoFile(
      rootDir,
      'components/recipes/buildPrompt.ts',
      'export const bad = buildRecipeProviderDirectives;',
    );
    await writeRepoFile(
      rootDir,
      'components/recipes/recipeModuleUi.ts',
      'export const ok = buildRecipeProviderDirectives;',
    );

    const report = await createRecipeModuleSourceAuditReport(rootDir);

    expect(report.scannedFiles).toBe(1);
    expect(report.violations).toEqual([
      {
        filePath: 'components/recipes/buildPrompt.ts',
        markers: ['buildRecipeProviderDirectives'],
      },
    ]);
  });
});
