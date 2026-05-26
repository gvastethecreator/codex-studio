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
  await writeRepoFile(
    rootDir,
    'lib/studioLegacyVisualBatchStore.ts',
    "export const keys = ['catalog-cache', 'catalog-trash'];",
  );
}

describe('catalog-first source audit', () => {
  it('passes when Catalog View stays independent from Visual Batch adapters', async () => {
    const rootDir = path.join(tmpdir(), `catalog-first-ok-${Date.now()}`);
    await writePassingFixtures(rootDir);

    const report = await createCatalogFirstSourceAuditReport(rootDir);

    expect(report.violations).toEqual([]);
  });

  it('reports source drift back toward Visual Batch cache state', async () => {
    const rootDir = path.join(tmpdir(), `catalog-first-fail-${Date.now()}`);
    await writePassingFixtures(rootDir);
    await writeRepoFile(
      rootDir,
      'lib/studioCatalogView.ts',
      'import type { GenerationBatch } from "../types";',
    );
    await writeRepoFile(rootDir, 'hooks/useCatalog.ts', "const key = 'catalog-cache';");
    await writeRepoFile(rootDir, 'hooks/other.ts', "const key = 'catalog-trash';");

    const report = await createCatalogFirstSourceAuditReport(rootDir);

    expect(report.violations.map((violation) => violation.ruleId)).toEqual([
      'catalog-view-no-visual-batch-adapter',
      'use-catalog-no-idb-cache',
      'legacy-visual-cache-keys-isolated',
      'legacy-visual-cache-keys-isolated',
    ]);
  });
});
