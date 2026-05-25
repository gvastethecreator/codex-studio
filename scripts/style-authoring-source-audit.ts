import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const defaultRootDir = process.cwd();

const legacyMarkers = ['LEGACY_STYLE_PACKS', 'legacyStylesData', 'styles/packs'] as const;

const ignoredPathParts = new Set(['.git', 'dist', 'logs', 'node_modules', 'tmp']);

const allowedLegacyFiles = new Set([
  'components/recipes/legacyStylesData.ts',
  'components/recipes/stylePresetManifests.test.ts',
  'scripts/split-style-preset-manifests.ts',
  'scripts/style-authoring-source-audit.ts',
  'scripts/style-authoring-source-audit.test.ts',
]);

export interface StyleAuthoringSourceAuditUsage {
  filePath: string;
  markers: string[];
}

export interface StyleAuthoringSourceAuditReport {
  scannedFiles: number;
  usages: StyleAuthoringSourceAuditUsage[];
  violations: StyleAuthoringSourceAuditUsage[];
}

function toRepoPath(rootDir: string, filePath: string) {
  return path.relative(rootDir, filePath).replace(/\\/g, '/');
}

function shouldScan(repoPath: string) {
  const parts = repoPath.split('/');
  if (parts.some((part) => ignoredPathParts.has(part))) return false;
  return /\.(ts|tsx)$/.test(repoPath);
}

function isAllowedLegacyFile(repoPath: string) {
  return allowedLegacyFiles.has(repoPath);
}

async function listSourceFiles(rootDir: string, currentDir = rootDir): Promise<string[]> {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    const repoPath = toRepoPath(rootDir, absolutePath);
    if (entry.isDirectory()) {
      if (repoPath.split('/').some((part) => ignoredPathParts.has(part))) continue;
      files.push(...(await listSourceFiles(rootDir, absolutePath)));
      continue;
    }
    if (entry.isFile() && shouldScan(repoPath)) {
      files.push(absolutePath);
    }
  }

  return files;
}

export async function createStyleAuthoringSourceAuditReport(
  rootDir = defaultRootDir,
): Promise<StyleAuthoringSourceAuditReport> {
  const usages: StyleAuthoringSourceAuditUsage[] = [];
  const files = await listSourceFiles(rootDir);

  for (const absolutePath of files) {
    const repoPath = toRepoPath(rootDir, absolutePath);
    const source = await readFile(absolutePath, 'utf8');
    const markers = legacyMarkers.filter((marker) => source.includes(marker));
    if (markers.length > 0) {
      usages.push({ filePath: repoPath, markers: [...markers] });
    }
  }

  return {
    scannedFiles: files.length,
    usages,
    violations: usages.filter((usage) => !isAllowedLegacyFile(usage.filePath)),
  };
}

if (import.meta.main) {
  const report = await createStyleAuthoringSourceAuditReport();

  console.log(
    `[styles:source] scanned=${report.scannedFiles} legacyUsages=${report.usages.length}`,
  );
  for (const usage of report.usages) {
    console.log(`- ${usage.filePath} markers=${usage.markers.join(',')}`);
  }

  if (report.violations.length > 0) {
    console.error(`[styles:source] violations=${report.violations.length}`);
    for (const usage of report.violations) {
      console.error(`- ${usage.filePath} markers=${usage.markers.join(',')}`);
    }
    process.exitCode = 1;
  } else {
    console.log('[styles:source] ok');
  }
}
