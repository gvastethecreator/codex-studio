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

interface RetiredStateReference {
  filePath: string;
  forbidden: string;
}

const rules: CatalogFirstRule[] = [
  {
    id: 'catalog-view-no-visual-batch-adapter',
    filePath: 'lib/studioCatalogView.ts',
    forbidden: ['studioVisualBatchCatalog', 'catalogImageGenerationConfig', 'materializeVisual'],
    message:
      'Studio Catalog View must stay Catalog Entry-first; export compatibility belongs outside it.',
  },
  {
    id: 'use-catalog-no-idb-cache',
    filePath: 'hooks/useCatalog.ts',
    forbidden: ['useIndexedDBStorage', 'GlobalContext'],
    message: 'useCatalog must query the Image Catalog directly, not retired browser batch state.',
  },
];

const auditFiles = new Set([
  'scripts/catalog-first-source-audit.ts',
  'scripts/catalog-first-source-audit.test.ts',
]);
const retiredStateTokens = [
  'catalog-cache',
  'catalog-trash',
  'GenerationBatch',
  'LegacyVisualBatch',
] as const;

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
  const retiredStateReferences: RetiredStateReference[] = [];

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
    if (auditFiles.has(filePath)) continue;

    const source = await readRepoFile(rootDir, filePath);
    for (const forbidden of retiredStateTokens) {
      if (source.includes(forbidden)) {
        retiredStateReferences.push({ filePath, forbidden });
      }
    }
  }

  for (const reference of retiredStateReferences) {
    violations.push({
      ruleId: 'retired-visual-batch-state',
      filePath: reference.filePath,
      forbidden: reference.forbidden,
      message:
        'Retired browser batch state must not return; Catalog Entry and Persistent Job are the live models.',
    });
  }

  return {
    scannedRules: rules.length + 1,
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
