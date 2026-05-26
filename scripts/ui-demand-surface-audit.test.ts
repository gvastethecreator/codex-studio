import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

import { createUiDemandSurfaceAuditReport, uiDemandSurfaceRules } from './ui-demand-surface-audit';

async function writeRepoFile(rootDir: string, repoPath: string, source: string) {
  const filePath = path.join(rootDir, repoPath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, source, 'utf8');
}

async function writePassingFixtures(rootDir: string) {
  for (const rule of uiDemandSurfaceRules) {
    await writeRepoFile(rootDir, rule.filePath, 'export const ok = true;');
  }
}

describe('UI demand surface audit', () => {
  it('passes when known heavy surfaces stay demand-loaded', async () => {
    const rootDir = path.join(tmpdir(), `ui-demand-audit-ok-${Date.now()}`);
    await writePassingFixtures(rootDir);

    const report = await createUiDemandSurfaceAuditReport(rootDir);

    expect(report.scannedRules).toBe(uiDemandSurfaceRules.length);
    expect(report.violations).toEqual([]);
  });

  it('reports eager imports that undo demand-mounted chunk splits', async () => {
    const rootDir = path.join(tmpdir(), `ui-demand-audit-fail-${Date.now()}`);
    await writePassingFixtures(rootDir);
    await writeRepoFile(rootDir, 'main.tsx', "import { scan } from 'react-scan';");
    await writeRepoFile(rootDir, 'hooks/useCameraViewport.ts', "import * as THREE from 'three';");
    await writeRepoFile(
      rootDir,
      'components/shell/StudioViewport.tsx',
      "import { StudioPage } from '../StudioPage';",
    );

    const report = await createUiDemandSurfaceAuditReport(rootDir);

    expect(report.violations.map((violation) => violation.ruleId)).toEqual([
      'prod-entry-no-static-react-scan',
      'camera-no-static-three',
      'viewport-no-static-route-pages',
    ]);
  });
});
