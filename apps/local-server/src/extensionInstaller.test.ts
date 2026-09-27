import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import JSZip from 'jszip';
import { afterEach, describe, expect, it } from 'vitest';
import { installExtensionArchive } from './extensionInstaller';

const manifest = (version: string) => ({
  schemaVersion: 1,
  id: 'cozy.pack-14',
  kind: 'style-pack',
  version,
  studio: '>=0.1.0',
  title: 'Mythic Noir',
  files: {
    pack: 'pack.json',
    runtime: 'runtime.json',
    search: 'search.json',
    thumbnails: 'thumbnails.json',
  },
  stylePack: { id: 'pack_14', name: 'Mythic Noir', description: 'Myths.', presetCount: 197 },
  assets: [],
});

async function release(version: string, extra?: (zip: JSZip) => void) {
  const zip = new JSZip();
  zip.file('extension.json', JSON.stringify(manifest(version)));
  zip.file('pack.json', JSON.stringify({ version }));
  extra?.(zip);
  const archive = await zip.generateAsync({ type: 'uint8array' });
  const entry = {
    id: 'cozy.pack-14',
    version,
    title: 'Mythic Noir',
    archive: `cozy.pack-14-${version}.zip`,
    sha256: createHash('sha256').update(archive).digest('hex'),
    bytes: archive.byteLength,
  };
  return { archive, entry };
}

let installDir = '';
afterEach(() => rm(installDir, { recursive: true, force: true }));

describe('installExtensionArchive', () => {
  it('installs a verified release and replaces the previous version', async () => {
    installDir = await mkdtemp(path.join(tmpdir(), 'cozy-install-'));
    await installExtensionArchive({ ...(await release('1.0.0')), installDir });
    await installExtensionArchive({ ...(await release('1.1.0')), installDir });
    const pack = await readFile(path.join(installDir, 'cozy.pack-14', 'pack.json'), 'utf8');
    expect(JSON.parse(pack)).toEqual({ version: '1.1.0' });
  });

  it('keeps the installed version when a release is tampered with or escapes its folder', async () => {
    installDir = await mkdtemp(path.join(tmpdir(), 'cozy-install-'));
    await installExtensionArchive({ ...(await release('1.0.0')), installDir });

    const tampered = await release('1.1.0');
    await expect(
      installExtensionArchive({
        ...tampered,
        entry: { ...tampered.entry, sha256: '0'.repeat(64) },
        installDir,
      }),
    ).rejects.toThrow('sha256 mismatch');

    const escaping = await release('1.2.0', (zip) => zip.file('../outside.txt', 'x'));
    await expect(installExtensionArchive({ ...escaping, installDir })).rejects.toThrow('escapes');

    const pack = await readFile(path.join(installDir, 'cozy.pack-14', 'pack.json'), 'utf8');
    expect(JSON.parse(pack)).toEqual({ version: '1.0.0' });
    expect(existsSync(path.join(installDir, 'outside.txt'))).toBe(false);
  });
});
