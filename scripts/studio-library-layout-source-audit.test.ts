import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vite-plus/test';

import { createStudioLibraryLayoutSourceAuditReport } from './studio-library-layout-source-audit';

async function writeRepoFile(rootDir: string, repoPath: string, source: string) {
  const filePath = path.join(rootDir, repoPath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, source, 'utf8');
}

describe('studio library layout source audit', () => {
  it('blocks raw library layout paths outside the layout helper and migration script', async () => {
    const rootDir = path.join(tmpdir(), `studio-library-layout-source-audit-${Date.now()}`);

    await writeRepoFile(
      rootDir,
      'scripts/raw-layout.ts',
      "const dbPath = path.join(libraryDir, 'library.sqlite');",
    );
    await writeRepoFile(
      rootDir,
      'apps/local-server/src/library.ts',
      "const dbPath = path.join(libraryDir, 'library.sqlite');",
    );
    await writeRepoFile(
      rootDir,
      'scripts/migrate-studio-library-layout.ts',
      "const oldPath = path.join(libraryDir, 'assets');",
    );

    const report = await createStudioLibraryLayoutSourceAuditReport(rootDir);

    expect(report.violations).toEqual([
      {
        filePath: 'scripts/raw-layout.ts',
        snippets: ["path.join(libraryDir, 'library.sqlite'"],
      },
    ]);
  });
});
