import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vite-plus/test';

import { createStyleAuthoringSourceAuditReport } from './style-authoring-source-audit';

async function writeRepoFile(rootDir: string, repoPath: string, source: string) {
  const filePath = path.join(rootDir, repoPath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, source, 'utf8');
}

describe('style authoring source audit', () => {
  it('allows legacy source usage only in migration and compatibility test seams', async () => {
    const rootDir = path.join(tmpdir(), `style-source-audit-${Date.now()}`);

    await writeRepoFile(
      rootDir,
      'scripts/split-style-preset-manifests.ts',
      "const packsDir = 'components/recipes/styles/packs';",
    );
    await writeRepoFile(
      rootDir,
      'components/recipes/StylesRecipe.tsx',
      "import { LEGACY_STYLE_PACKS } from './legacyStylesData';",
    );

    const report = await createStyleAuthoringSourceAuditReport(rootDir);

    expect(report.usages.map((usage) => usage.filePath).sort()).toEqual([
      'components/recipes/StylesRecipe.tsx',
      'scripts/split-style-preset-manifests.ts',
    ]);
    expect(report.violations).toEqual([
      {
        filePath: 'components/recipes/StylesRecipe.tsx',
        markers: ['LEGACY_STYLE_PACKS', 'legacyStylesData'],
      },
    ]);
    expect(report.generatedTempFiles).toEqual([]);
    expect(report.legacyOnlyPresetIds).toEqual([]);
  });

  it('reports generated runtime check temp files as source audit failures', async () => {
    const rootDir = path.join(tmpdir(), `style-source-temp-audit-${Date.now()}`);

    await writeRepoFile(
      rootDir,
      'components/recipes/styleRuntimeData.generated.check.123.tmp.ts',
      'export const temp = true;',
    );
    await writeRepoFile(
      rootDir,
      'components/recipes/styleRuntimePacks.generated/pack_01.check.123.tmp.ts',
      'export const temp = true;',
    );

    const report = await createStyleAuthoringSourceAuditReport(rootDir);

    expect(report.usages).toEqual([]);
    expect(report.violations).toEqual([]);
    expect(report.generatedTempFiles).toEqual([
      'components/recipes/styleRuntimeData.generated.check.123.tmp.ts',
      'components/recipes/styleRuntimePacks.generated/pack_01.check.123.tmp.ts',
    ]);
  });

  it('blocks presets that exist only in legacy pack YAML', async () => {
    const rootDir = path.join(tmpdir(), `style-source-legacy-only-${Date.now()}`);

    await writeRepoFile(
      rootDir,
      'components/recipes/styles/packs/pack_01.yaml',
      [
        '- id: pack_01',
        '  name: Pack 01',
        '  description: Legacy migration source',
        '  presets:',
        '    - id: SP01-999',
        '      name: Legacy Only',
        '      category: Editorial',
        '      style:',
        '        lighting: soft',
      ].join('\n'),
    );
    await writeRepoFile(
      rootDir,
      'components/recipes/styles/manifests/presets/pack_01/SP01-001.yaml',
      'id: SP01-001\n',
    );

    const report = await createStyleAuthoringSourceAuditReport(rootDir);

    expect(report.legacyPresetCount).toBe(1);
    expect(report.manifestPresetCount).toBe(1);
    expect(report.legacyOnlyPresetIds).toEqual(['SP01-999']);
  });
});
