import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

import { createCatalogFirstSourceAuditReport } from './catalog-first-source-audit';

async function writeRepoFile(rootDir: string, repoPath: string, source: string) {
  const filePath = path.join(rootDir, repoPath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, source, 'utf8');
}

async function writePassingFixtures(rootDir: string) {
  await writeRepoFile(rootDir, 'lib/studioCatalogView.ts', 'export const view = true;');
  await writeRepoFile(rootDir, 'hooks/useCatalog.ts', 'export const hook = true;');
}

describe('catalog-first source audit', () => {
  it('passes when Catalog View stays independent from retired browser batch state', async () => {
    const rootDir = path.join(tmpdir(), `catalog-first-ok-${Date.now()}`);
    await writePassingFixtures(rootDir);

    const report = await createCatalogFirstSourceAuditReport(rootDir);

    expect(report.violations).toEqual([]);
  });

  it('reports source drift back toward retired browser batch state', async () => {
    const rootDir = path.join(tmpdir(), `catalog-first-fail-${Date.now()}`);
    await writePassingFixtures(rootDir);
    await writeRepoFile(
      rootDir,
      'lib/studioCatalogView.ts',
      'import type { GenerationBatch } from "../types";',
    );
    await writeRepoFile(rootDir, 'hooks/useCatalog.ts', "const key = 'catalog-cache';");
    await writeRepoFile(rootDir, 'hooks/other.ts', "const key = 'catalog-trash';");
    await writeRepoFile(
      rootDir,
      'components/ImageGrid.tsx',
      'import type { GenerationBatch } from "../types";',
    );

    const report = await createCatalogFirstSourceAuditReport(rootDir);

    expect(report.violations.map((violation) => violation.ruleId)).toEqual([
      'retired-visual-batch-state',
      'retired-visual-batch-state',
      'retired-visual-batch-state',
      'retired-visual-batch-state',
    ]);
  });
});
