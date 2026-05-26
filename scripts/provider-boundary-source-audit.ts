import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const defaultRootDir = process.cwd();

const scannedRoot = 'apps/local-server/src';
const providerBoundaryDir = 'apps/local-server/src/providers';
const ignoredPathParts = new Set(['node_modules', 'dist', 'logs', 'tmp']);

const forbiddenMarkers = [
  'providerInputCompiler',
  'compileProviderInputForJob',
  'externalProviderResults',
  'createGoogleImageExecutor',
  'createFalImageExecutor',
  'createComfyWorkflowExecutor',
  'googleExecutor',
  'falExecutor',
  'comfyExecutor',
] as const;

export interface ProviderBoundarySourceAuditUsage {
  filePath: string;
  markers: string[];
}

export interface ProviderBoundarySourceAuditReport {
  scannedFiles: number;
  violations: ProviderBoundarySourceAuditUsage[];
}

function toRepoPath(rootDir: string, filePath: string) {
  return path.relative(rootDir, filePath).replace(/\\/g, '/');
}

function shouldScan(repoPath: string) {
  if (!repoPath.startsWith(`${scannedRoot}/`)) return false;
  if (repoPath.startsWith(`${providerBoundaryDir}/`)) return false;
  return /\.(ts|tsx)$/.test(repoPath);
}

async function listSourceFiles(rootDir: string, currentDir = path.join(rootDir, scannedRoot)) {
  const entries = await readdir(currentDir, { withFileTypes: true }).catch(() => []);
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    const repoPath = toRepoPath(rootDir, absolutePath);
    if (entry.isDirectory()) {
      if (repoPath.split('/').some((part) => ignoredPathParts.has(part))) continue;
      if (repoPath === providerBoundaryDir || repoPath.startsWith(`${providerBoundaryDir}/`)) {
        continue;
      }
      files.push(...(await listSourceFiles(rootDir, absolutePath)));
      continue;
    }
    if (entry.isFile() && shouldScan(repoPath)) files.push(absolutePath);
  }

  return files;
}

export async function createProviderBoundarySourceAuditReport(
  rootDir = defaultRootDir,
): Promise<ProviderBoundarySourceAuditReport> {
  const files = await listSourceFiles(rootDir);
  const violations: ProviderBoundarySourceAuditUsage[] = [];

  for (const absolutePath of files) {
    const repoPath = toRepoPath(rootDir, absolutePath);
    const source = await readFile(absolutePath, 'utf8');
    const markers = forbiddenMarkers.filter((marker) => source.includes(marker));
    if (markers.length > 0) violations.push({ filePath: repoPath, markers: [...markers] });
  }

  return { scannedFiles: files.length, violations };
}

if (import.meta.main) {
  const report = await createProviderBoundarySourceAuditReport();

  console.log(
    `[providers:source] scanned=${report.scannedFiles} violations=${report.violations.length}`,
  );
  for (const violation of report.violations) {
    console.error(`- ${violation.filePath} markers=${violation.markers.join(',')}`);
  }

  if (report.violations.length > 0) {
    console.error(
      '[providers:source] Route handlers and non-provider backend modules must not import provider compilers or concrete executors. Keep execution behind apps/local-server/src/providers/.',
    );
    process.exitCode = 1;
  } else {
    console.log('[providers:source] ok');
  }
}
