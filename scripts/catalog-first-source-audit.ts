import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const defaultRootDir = process.cwd();

interface CatalogFirstRule {
  id: string;
  filePath: string;
  forbidden: string[];
  message: string;
}

interface CatalogFirstViolation {
  ruleId: string;
  filePath: string;
  forbidden: string;
  message: string;
}

interface LegacyCacheReference {
  filePath: string;
  forbidden: string;
}

interface LegacyVisualBatchReference {
  filePath: string;
  forbidden: string;
}

interface GeneratedLegacyAppendReference {
  filePath: string;
  forbidden: string;
}

interface LegacyVisualContextConsumerReference {
  filePath: string;
  forbidden: string;
}

interface LegacySnapshotHookReference {
  filePath: string;
  forbidden: string;
}

const legacySnapshotTypeTokens = [
  'import type { LegacyVisualBatchSnapshot',
  'type LegacyVisualBatchSnapshot',
  ': LegacyVisualBatchSnapshot',
  '<LegacyVisualBatchSnapshot',
  'as LegacyVisualBatchSnapshot',
];

const rules: CatalogFirstRule[] = [
  {
    id: 'catalog-view-no-visual-batch-adapter',
    filePath: 'lib/studioCatalogView.ts',
    forbidden: [
      'GenerationBatch',
      'studioVisualBatchCatalog',
      'catalogImageGenerationConfig',
      'materializeVisual',
    ],
    message:
      'Studio Catalog View must stay Catalog Entry-first; Visual Batch belongs in adapter seams.',
  },
  {
    id: 'use-catalog-no-idb-cache',
    filePath: 'hooks/useCatalog.ts',
    forbidden: ['catalog-cache', 'useIndexedDBStorage', 'GlobalContext'],
    message:
      'useCatalog must query the Image Catalog directly, not durable Visual Batch cache state.',
  },
  {
    id: 'legacy-visual-context-no-idb-persistence',
    filePath: 'contexts/LegacyVisualBatchContext.tsx',
    forbidden: ['useIndexedDBStorage', 'catalog-cache', 'catalog-trash', '../utils/idb'],
    message:
      'Legacy Visual Batch context must stay an in-memory compatibility cache; do not persist Visual Batches back to IndexedDB.',
  },
  {
    id: 'legacy-visual-context-no-snapshot-export',
    filePath: 'contexts/LegacyVisualBatchContext.tsx',
    forbidden: [
      'legacyVisualBatches: LegacyVisualBatchSnapshot',
      'legacyVisualBatches: state.legacyVisualBatches',
    ],
    message:
      'Legacy Visual Batch context must not expose the full snapshot; expose narrow IDs/actions only until compatibility can be deleted.',
  },
];

const legacyCacheAllowedFiles = new Set([
  'lib/studioLegacyVisualBatchStore.ts',
  'lib/studioLegacyVisualBatchStore.test.ts',
  'scripts/catalog-first-source-audit.ts',
  'scripts/catalog-first-source-audit.test.ts',
]);

const generationBatchAllowedFiles = new Set([
  'lib/studioCatalogView.ts',
  'lib/studioLegacyVisualBatchTypes.ts',
  'scripts/catalog-first-source-audit.ts',
  'scripts/catalog-first-source-audit.test.ts',
  'types.ts',
]);

const generatedLegacyAppendAllowedFiles = new Set([
  'contexts/GenerationContext.tsx',
  'contexts/LegacyVisualBatchContext.tsx',
  'contexts/legacyVisualBatchReducer.ts',
  'contexts/legacyVisualBatchReducer.test.ts',
  'lib/localGenerationVisualBatchCompat.ts',
  'lib/localGenerationVisualBatchCompat.test.ts',
  'scripts/catalog-first-source-audit.ts',
  'scripts/catalog-first-source-audit.test.ts',
]);

const legacyVisualContextConsumerAllowedFiles = new Set([
  'contexts/GenerationContext.tsx',
  'contexts/LegacyVisualBatchContext.tsx',
  'hooks/useStudioShell.ts',
  'scripts/catalog-first-source-audit.ts',
  'scripts/catalog-first-source-audit.test.ts',
]);

const legacySnapshotHookAllowedFiles = new Set(['hooks/useStudioStorageRecovery.ts']);

async function collectSourceFiles(rootDir: string, relativeDir = ''): Promise<string[]> {
  const dir = path.join(rootDir, relativeDir);
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (
      entry.name === 'node_modules' ||
      entry.name === 'dist' ||
      entry.name === '.git' ||
      entry.name === 'logs'
    ) {
      continue;
    }

    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(rootDir, relativePath)));
      continue;
    }

    if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(relativePath.replaceAll(path.sep, '/'));
    }
  }

  return files;
}

async function readRepoFile(rootDir: string, repoPath: string) {
  return readFile(path.join(rootDir, repoPath), 'utf8');
}

export async function createCatalogFirstSourceAuditReport(rootDir = defaultRootDir) {
  const violations: CatalogFirstViolation[] = [];
  const legacyCacheReferences: LegacyCacheReference[] = [];
  const legacyVisualBatchReferences: LegacyVisualBatchReference[] = [];
  const generatedLegacyAppendReferences: GeneratedLegacyAppendReference[] = [];
  const legacyVisualContextConsumerReferences: LegacyVisualContextConsumerReference[] = [];
  const legacySnapshotHookReferences: LegacySnapshotHookReference[] = [];

  for (const rule of rules) {
    const source = await readRepoFile(rootDir, rule.filePath);
    for (const forbidden of rule.forbidden) {
      if (source.includes(forbidden)) {
        violations.push({
          ruleId: rule.id,
          filePath: rule.filePath,
          forbidden,
          message: rule.message,
        });
      }
    }
  }

  const sourceFiles = await collectSourceFiles(rootDir);
  for (const filePath of sourceFiles) {
    if (legacyCacheAllowedFiles.has(filePath)) {
      const source = await readRepoFile(rootDir, filePath);
      if (!generationBatchAllowedFiles.has(filePath) && source.includes('GenerationBatch')) {
        legacyVisualBatchReferences.push({ filePath, forbidden: 'GenerationBatch' });
      }
      continue;
    }

    const source = await readRepoFile(rootDir, filePath);
    for (const forbidden of ['catalog-cache', 'catalog-trash']) {
      if (source.includes(forbidden)) {
        legacyCacheReferences.push({ filePath, forbidden });
      }
    }
    if (!generationBatchAllowedFiles.has(filePath) && source.includes('GenerationBatch')) {
      legacyVisualBatchReferences.push({ filePath, forbidden: 'GenerationBatch' });
    }
    if (!generatedLegacyAppendAllowedFiles.has(filePath)) {
      for (const forbidden of [
        'appendLocalGenerationResultToLegacyVisualBatches',
        'prependGeneratedLegacyVisualBatch',
        'registerGeneratedLegacyVisualBatchRef',
        'REGISTER_GENERATED_LEGACY_VISUAL_BATCH_REF',
      ]) {
        if (source.includes(forbidden)) {
          generatedLegacyAppendReferences.push({ filePath, forbidden });
        }
      }
    }
    if (
      !legacyVisualContextConsumerAllowedFiles.has(filePath) &&
      source.includes('useLegacyVisualBatches(')
    ) {
      legacyVisualContextConsumerReferences.push({
        filePath,
        forbidden: 'useLegacyVisualBatches(',
      });
    }
    if (filePath.startsWith('hooks/') && !legacySnapshotHookAllowedFiles.has(filePath)) {
      const forbidden = legacySnapshotTypeTokens.find((token) => source.includes(token));
      if (forbidden) {
        legacySnapshotHookReferences.push({
          filePath,
          forbidden,
        });
      }
    }
  }

  for (const reference of legacyCacheReferences) {
    violations.push({
      ruleId: 'legacy-visual-cache-keys-isolated',
      filePath: reference.filePath,
      forbidden: reference.forbidden,
      message:
        'Legacy Visual Batch cache key strings must stay centralized in studioLegacyVisualBatchStore.',
    });
  }

  for (const reference of legacyVisualBatchReferences) {
    violations.push({
      ruleId: 'generation-batch-compat-isolated',
      filePath: reference.filePath,
      forbidden: reference.forbidden,
      message:
        'GenerationBatch must stay isolated to explicit legacy compatibility adapters, tests, and shared legacy types.',
    });
  }

  for (const reference of generatedLegacyAppendReferences) {
    violations.push({
      ruleId: 'generated-legacy-append-edge-isolated',
      filePath: reference.filePath,
      forbidden: reference.forbidden,
      message:
        'Generated-job legacy Visual Batch append must stay behind the local generation compat edge and legacy context reducer.',
    });
  }

  for (const reference of legacyVisualContextConsumerReferences) {
    violations.push({
      ruleId: 'legacy-visual-context-consumers-isolated',
      filePath: reference.filePath,
      forbidden: reference.forbidden,
      message:
        'Legacy Visual Batch context consumers must stay limited to Studio Shell orchestration and generated-job compatibility edges.',
    });
  }

  for (const reference of legacySnapshotHookReferences) {
    violations.push({
      ruleId: 'legacy-visual-snapshot-hooks-isolated',
      filePath: reference.filePath,
      forbidden: reference.forbidden,
      message:
        'Hook-level LegacyVisualBatchSnapshot usage must stay limited to storage recovery compatibility edges.',
    });
  }

  return {
    scannedRules: rules.length + 5,
    violations,
  };
}

if (import.meta.main) {
  const report = await createCatalogFirstSourceAuditReport();
  console.log(
    `[catalog:source] rules=${report.scannedRules} violations=${report.violations.length}`,
  );

  for (const violation of report.violations) {
    console.error(
      `- ${violation.filePath} rule=${violation.ruleId} forbidden=${JSON.stringify(violation.forbidden)} ${violation.message}`,
    );
  }

  if (report.violations.length > 0) {
    console.error('[catalog:source] failed');
    process.exitCode = 1;
  } else {
    console.log('[catalog:source] ok');
  }
}
