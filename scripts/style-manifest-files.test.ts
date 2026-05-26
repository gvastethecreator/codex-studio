import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vite-plus/test';

import { loadStylePackManifests, loadStylePresetManifestRecords } from './style-manifest-files';

describe('style-manifest-files', () => {
  const tempDirs: string[] = [];

  async function createTempDir() {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'style-manifest-files-'));
    tempDirs.push(tempDir);
    return tempDir;
  }

  afterEach(async () => {
    await Promise.all(
      tempDirs.splice(0).map((tempDir) => rm(tempDir, { recursive: true, force: true })),
    );
  });

  it('loads and sorts pack manifests with the Node fs fallback', async () => {
    const manifestsDir = await createTempDir();
    await writeFile(path.join(manifestsDir, 'pack_b.yaml'), 'id: pack_b\n', 'utf8');
    await writeFile(path.join(manifestsDir, 'pack_a.yaml'), 'id: pack_a\n', 'utf8');

    const manifests = await loadStylePackManifests(manifestsDir, { useNodeFs: true });

    expect(manifests.map((manifest) => manifest.id)).toEqual(['pack_a', 'pack_b']);
  });

  it('loads nested preset manifest records with the Node fs fallback', async () => {
    const manifestsDir = await createTempDir();
    await mkdir(path.join(manifestsDir, 'pack_b'));
    await mkdir(path.join(manifestsDir, 'pack_a'));
    await writeFile(path.join(manifestsDir, 'pack_b', 'preset_b.yaml'), 'id: PRESET-B\n', 'utf8');
    await writeFile(path.join(manifestsDir, 'pack_a', 'preset_a.yaml'), 'id: PRESET-A\n', 'utf8');

    const records = await loadStylePresetManifestRecords(manifestsDir, { useNodeFs: true });

    expect(records.map((record) => record.manifest.id)).toEqual(['PRESET-A', 'PRESET-B']);
    expect(
      records.map((record) => path.relative(manifestsDir, record.filePath).replaceAll('\\', '/')),
    ).toEqual(['pack_a/preset_a.yaml', 'pack_b/preset_b.yaml']);
  });
});
