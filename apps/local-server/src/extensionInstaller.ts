import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import JSZip from 'jszip';
import {
  EXTENSION_MANIFEST_FILE,
  parseExtensionManifest,
  type ExtensionManifest,
  type ExtensionReleaseEntry,
} from '../../../packages/shared/src/extensions';

export class ExtensionInstallError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExtensionInstallError';
  }
}

function safeEntryPath(root: string, name: string) {
  const target = path.resolve(root, name);
  if (!target.startsWith(`${path.resolve(root)}${path.sep}`))
    throw new ExtensionInstallError(`Archive entry escapes the extension folder: ${name}`);
  return target;
}

/**
 * Verifies a release archive against its index entry, extracts it into a staging folder and
 * swaps it in (ADR 0011). A failure at any step leaves the installed version untouched.
 */
export async function installExtensionArchive({
  archive,
  entry,
  installDir,
}: {
  archive: Uint8Array;
  entry: ExtensionReleaseEntry;
  installDir: string;
}): Promise<ExtensionManifest> {
  if (archive.byteLength !== entry.bytes)
    throw new ExtensionInstallError(`${entry.id}: expected ${entry.bytes} bytes`);
  const sha256 = createHash('sha256').update(archive).digest('hex');
  if (sha256 !== entry.sha256) throw new ExtensionInstallError(`${entry.id}: sha256 mismatch`);

  const zip = await JSZip.loadAsync(archive);
  const manifestFile = zip.file(EXTENSION_MANIFEST_FILE);
  if (!manifestFile) throw new ExtensionInstallError(`${entry.id}: archive has no extension.json`);
  const parsed = parseExtensionManifest(JSON.parse(await manifestFile.async('string')));
  if (!parsed.ok) throw new ExtensionInstallError(`${entry.id}: ${parsed.issues.join('; ')}`);
  if (parsed.manifest.id !== entry.id || parsed.manifest.version !== entry.version)
    throw new ExtensionInstallError(`${entry.id}: archive does not match the release index`);

  const finalDir = path.join(installDir, entry.id);
  const stageDir = `${finalDir}.stage-${process.pid}`;
  const previousDir = `${finalDir}.previous-${process.pid}`;
  await rm(stageDir, { recursive: true, force: true });
  try {
    for (const file of Object.values(zip.files)) {
      const target = safeEntryPath(stageDir, file.name);
      if (file.dir) {
        await mkdir(target, { recursive: true });
        continue;
      }
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, await file.async('uint8array'));
    }
    await mkdir(installDir, { recursive: true });
    if (existsSync(finalDir)) await rename(finalDir, previousDir);
    await rename(stageDir, finalDir);
  } catch (error) {
    await rm(stageDir, { recursive: true, force: true });
    if (!existsSync(finalDir) && existsSync(previousDir)) await rename(previousDir, finalDir);
    throw error;
  }
  await rm(previousDir, { recursive: true, force: true });
  return parsed.manifest;
}
