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
      'components/recipes/StylesRecipe.tsx',
      "import { LEGACY_STYLE_PACKS } from './legacyStylesData';",
    );

    const report = await createStyleAuthoringSourceAuditReport(rootDir);

    expect(report.usages.map((usage) => usage.filePath).sort()).toEqual([
      'components/recipes/StylesRecipe.tsx',
    ]);
    expect(report.violations).toEqual([
      {
        filePath: 'components/recipes/StylesRecipe.tsx',
        markers: ['LEGACY_STYLE_PACKS', 'legacyStylesData'],
      },
    ]);
    expect(report.generatedTempFiles).toEqual([]);
    expect(report.legacyMigrationPackFiles).toEqual([]);
    expect(report.unexpectedStyleYamlFiles).toEqual([]);
    expect(report.retiredRuntimeAliasViolations).toEqual([]);
  });

  it('blocks retired runtime alias names outside the source audit seam', async () => {
    const rootDir = path.join(tmpdir(), `style-source-runtime-alias-${Date.now()}`);

    await writeRepoFile(
      rootDir,
      'components/recipes/StylesRecipe.tsx',
      [
        "import { STYLE_PACK_SUMMARIES, loadStylePack, loadStylePacks } from './stylesData';",
        "import { loadGeneratedStylePack, loadGeneratedStylePacks } from './styleRuntimeData.generated';",
        "import type { StylePack, StylePresetDef } from './styles/types';",
        'const pack = {} as StylePack;',
        'const preset = {} as StylePresetDef;',
        'const composer = composeStylePacksFromManifests;',
      ].join('\n'),
    );

    const report = await createStyleAuthoringSourceAuditReport(rootDir);

    expect(report.retiredRuntimeAliasViolations).toEqual([
      {
        filePath: 'components/recipes/StylesRecipe.tsx',
        markers: [
          'StylePack',
          'StylePresetDef',
          'STYLE_PACK_SUMMARIES',
          'loadStylePack',
          'loadStylePacks',
          'loadGeneratedStylePack',
          'loadGeneratedStylePacks',
          'composeStylePacksFromManifests',
        ],
      },
    ]);
  });

  it('blocks new source from importing the compatibility style type barrel', async () => {
    const rootDir = path.join(tmpdir(), `style-source-type-barrel-${Date.now()}`);

    await writeRepoFile(
      rootDir,
      'components/recipes/StylesRecipe.tsx',
      "import type { StyleRuntimePack } from './styles/types';",
    );

    const report = await createStyleAuthoringSourceAuditReport(rootDir);

    expect(report.compatibilityTypeBarrelViolations).toEqual([
      {
        filePath: 'components/recipes/StylesRecipe.tsx',
        markers: ['./styles/types'],
      },
    ]);
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
    expect(report.retiredLegacyPackFiles).toEqual([]);
    expect(report.legacyMigrationPackFiles).toEqual([]);
    expect(report.unexpectedStyleYamlFiles).toEqual([]);
  });

  it('blocks remaining migration-only legacy pack YAML', async () => {
    const rootDir = path.join(tmpdir(), `style-source-legacy-migration-${Date.now()}`);

    await writeRepoFile(
      rootDir,
      'scripts/style-migration/legacy-packs/pack_01.yaml',
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

    const report = await createStyleAuthoringSourceAuditReport(rootDir);

    expect(report.manifestPresetCount).toBe(0);
    expect(report.legacyMigrationPackFiles).toEqual([
      'scripts/style-migration/legacy-packs/pack_01.yaml',
    ]);
    expect(report.retiredLegacyPackFiles).toEqual([]);
    expect(report.unexpectedStyleYamlFiles).toEqual([]);
  });

  it('reports accidental usage of the retired styles/packs path', async () => {
    const rootDir = path.join(tmpdir(), `style-source-retired-path-${Date.now()}`);

    await writeRepoFile(
      rootDir,
      'components/recipes/StylesRecipe.tsx',
      "const retired = 'components/recipes/styles/packs';",
    );

    const report = await createStyleAuthoringSourceAuditReport(rootDir);

    expect(report.violations).toEqual([
      {
        filePath: 'components/recipes/StylesRecipe.tsx',
        markers: ['styles/packs'],
      },
    ]);
  });

  it('blocks YAML files in the retired styles/packs directory', async () => {
    const rootDir = path.join(tmpdir(), `style-source-retired-yaml-${Date.now()}`);

    await writeRepoFile(
      rootDir,
      'components/recipes/styles/packs/pack_01.yaml',
      ['- id: pack_01', '  name: Pack 01', '  description: Retired path', '  presets: []'].join(
        '\n',
      ),
    );

    const report = await createStyleAuthoringSourceAuditReport(rootDir);

    expect(report.violations).toEqual([]);
    expect(report.retiredLegacyPackFiles).toEqual(['components/recipes/styles/packs/pack_01.yaml']);
    expect(report.unexpectedStyleYamlFiles).toEqual([
      'components/recipes/styles/packs/pack_01.yaml',
    ]);
  });

  it('blocks style YAML outside the manifest authoring tree', async () => {
    const rootDir = path.join(tmpdir(), `style-source-loose-yaml-${Date.now()}`);

    await writeRepoFile(rootDir, 'components/recipes/styles/loose.yaml', 'id: loose\n');
    await writeRepoFile(
      rootDir,
      'components/recipes/styles/manifests/presets/pack_01/SP01-001.yaml',
      'id: SP01-001\n',
    );

    const report = await createStyleAuthoringSourceAuditReport(rootDir);

    expect(report.retiredLegacyPackFiles).toEqual([]);
    expect(report.unexpectedStyleYamlFiles).toEqual(['components/recipes/styles/loose.yaml']);
  });

  it('allows authoring templates inside the manifest tree', async () => {
    const rootDir = path.join(tmpdir(), `style-source-template-yaml-${Date.now()}`);

    await writeRepoFile(
      rootDir,
      'components/recipes/styles/manifests/templates/style-preset.template.yaml',
      'schemaVersion: 1\nid: TEMPLATE\n',
    );

    const report = await createStyleAuthoringSourceAuditReport(rootDir);

    expect(report.retiredLegacyPackFiles).toEqual([]);
    expect(report.legacyMigrationPackFiles).toEqual([]);
    expect(report.unexpectedStyleYamlFiles).toEqual([]);
  });
});
