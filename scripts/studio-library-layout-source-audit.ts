import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const defaultRootDir = process.cwd();
const scannedRoots = ['apps/local-server/src', 'scripts'] as const;
const ignoredPathParts = new Set(['node_modules', 'dist', 'logs', 'tmp']);
const allowedFiles = new Set([
  'apps/local-server/src/library.ts',
  'scripts/migrate-studio-library-layout.ts',
  'scripts/studio-library-layout-source-audit.ts',
  'scripts/studio-library-layout-source-audit.test.ts',
]);

const rawLayoutPathPattern =
  /path\.join\(\s*libraryDir\s*,\s*['"](?:library\.sqlite|transcripts|assets|outputs|\.studio)['"]/g;

export interface StudioLibraryLayoutSourceAuditUsage {
  filePath: string;
  snippets: string[];
}

export interface StudioLibraryLayoutSourceAuditReport {
  scannedFiles: number;
  violations: StudioLibraryLayoutSourceAuditUsage[];
}

function toRepoPath(rootDir: string, filePath: string) {
  return path.relative(rootDir, filePath).replace(/\\/g, '/');
}

function shouldScan(repoPath: string) {
  if (allowedFiles.has(repoPath)) return false;
  return /\.(ts|tsx)$/.test(repoPath);
}

async function listSourceFiles(rootDir: string, currentDir: string): Promise<string[]> {
  const entries = await readdir(currentDir, { withFileTypes: true }).catch(() => []);
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    const repoPath = toRepoPath(rootDir, absolutePath);
    if (entry.isDirectory()) {
      if (repoPath.split('/').some((part) => ignoredPathParts.has(part))) continue;
      files.push(...(await listSourceFiles(rootDir, absolutePath)));
      continue;
    }
    if (entry.isFile() && shouldScan(repoPath)) files.push(absolutePath);
  }

  return files;
}

export async function createStudioLibraryLayoutSourceAuditReport(
  rootDir = defaultRootDir,
): Promise<StudioLibraryLayoutSourceAuditReport> {
  const files = (
    await Promise.all(
      scannedRoots.map((root) => listSourceFiles(rootDir, path.join(rootDir, root))),
    )
  ).flat();
  const violations: StudioLibraryLayoutSourceAuditUsage[] = [];

  for (const absolutePath of files) {
    const repoPath = toRepoPath(rootDir, absolutePath);
    const source = await readFile(absolutePath, 'utf8');
    const snippets = Array.from(source.matchAll(rawLayoutPathPattern)).map((match) => match[0]);
    if (snippets.length > 0) violations.push({ filePath: repoPath, snippets });
  }

  return { scannedFiles: files.length, violations };
}

if (import.meta.main) {
  const report = await createStudioLibraryLayoutSourceAuditReport();

  console.log(
    `[library:layout] scanned=${report.scannedFiles} violations=${report.violations.length}`,
  );
  for (const violation of report.violations) {
    console.error(`- ${violation.filePath}`);
    for (const snippet of violation.snippets) console.error(`  ${snippet}`);
  }

  if (report.violations.length > 0) {
    console.error(
      '[library:layout] Use resolveLibraryPathFromRoot(libraryDir, ...) for DB, transcripts, assets, outputs, and .studio paths outside library/migration internals.',
    );
    process.exitCode = 1;
  } else {
    console.log('[library:layout] ok');
  }
}
