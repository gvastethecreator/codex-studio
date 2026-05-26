import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vite-plus/test';

import { createProviderBoundarySourceAuditReport } from './provider-boundary-source-audit';

async function writeRepoFile(rootDir: string, repoPath: string, source: string) {
  const filePath = path.join(rootDir, repoPath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, source, 'utf8');
}

describe('provider boundary source audit', () => {
  it('blocks concrete provider execution imports from route/backend surfaces', async () => {
    const rootDir = path.join(tmpdir(), `provider-source-audit-${Date.now()}`);

    await writeRepoFile(
      rootDir,
      'apps/local-server/src/appFactory.ts',
      "import { compileProviderInputForJob } from './providers/providerInputCompiler';",
    );
    await writeRepoFile(
      rootDir,
      'apps/local-server/src/providers/externalProvider.ts',
      "import { compileProviderInputForJob } from './providerInputCompiler';",
    );

    const report = await createProviderBoundarySourceAuditReport(rootDir);

    expect(report.scannedFiles).toBe(1);
    expect(report.violations).toEqual([
      {
        filePath: 'apps/local-server/src/appFactory.ts',
        markers: ['providerInputCompiler', 'compileProviderInputForJob'],
      },
    ]);
  });
});
