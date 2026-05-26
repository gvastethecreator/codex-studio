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

  return {
    scannedRules: rules.length + 2,
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
