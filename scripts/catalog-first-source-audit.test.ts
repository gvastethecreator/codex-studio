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
    'contexts/LegacyVisualBatchContext.tsx',
    'export const legacyVisualBatches = [];',
  );
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
    await writeRepoFile(
      rootDir,
      'components/ImageGrid.tsx',
      'import type { GenerationBatch } from "../types";',
    );
    await writeRepoFile(
      rootDir,
      'hooks/useOtherAppend.ts',
      'appendLocalGenerationResultToLegacyVisualBatches(result, append);',
    );
    await writeRepoFile(
      rootDir,
      'components/LegacyConsumer.tsx',
      'const legacy = useLegacyVisualBatches();',
    );
    await writeRepoFile(
      rootDir,
      'hooks/useOtherLegacySnapshot.ts',
      'import type { LegacyVisualBatchSnapshot } from "../lib/studioLegacyVisualSnapshotImport";',
    );
    await writeRepoFile(
      rootDir,
      'contexts/LegacyVisualBatchContext.tsx',
      [
        "import useIndexedDBStorage from '../hooks/useIndexedDBStorage';",
        'interface LegacyVisualBatchContextType { legacyVisualBatches: LegacyVisualBatchSnapshot; }',
      ].join('\n'),
    );

    const report = await createCatalogFirstSourceAuditReport(rootDir);

    expect(report.violations.map((violation) => violation.ruleId)).toEqual([
      'catalog-view-no-visual-batch-adapter',
      'use-catalog-no-idb-cache',
      'legacy-visual-context-no-idb-persistence',
      'legacy-visual-context-no-snapshot-export',
      'legacy-visual-cache-keys-isolated',
      'legacy-visual-cache-keys-isolated',
      'generation-batch-compat-isolated',
      'generated-legacy-append-edge-isolated',
      'legacy-visual-context-consumers-isolated',
      'legacy-visual-snapshot-hooks-isolated',
    ]);
  });
});
