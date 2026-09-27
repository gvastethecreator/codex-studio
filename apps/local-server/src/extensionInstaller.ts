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
  type ExtensionReleaseLayer,
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

function verifyArchive(
  label: string,
  archive: Uint8Array,
  expected: { sha256: string; bytes: number },
) {
  if (archive.byteLength !== expected.bytes)
    throw new ExtensionInstallError(`${label}: expected ${expected.bytes} bytes`);
  const sha256 = createHash('sha256').update(archive).digest('hex');
  if (sha256 !== expected.sha256) throw new ExtensionInstallError(`${label}: sha256 mismatch`);
}

async function extractZip(zip: JSZip, targetDir: string) {
  for (const file of Object.values(zip.files)) {
    const target = safeEntryPath(targetDir, file.name);
    if (file.dir) {
      await mkdir(target, { recursive: true });
      continue;
    }
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, await file.async('uint8array'));
  }
}

/** Extracts into a staging folder, then swaps it in; the previous folder survives any failure. */
async function replaceFolder(finalDir: string, fill: (stageDir: string) => Promise<void>) {
  const stageDir = `${finalDir}.stage-${process.pid}`;
  const previousDir = `${finalDir}.previous-${process.pid}`;
  await rm(stageDir, { recursive: true, force: true });
  try {
    await mkdir(stageDir, { recursive: true });
    await fill(stageDir);
    await mkdir(path.dirname(finalDir), { recursive: true });
    if (existsSync(finalDir)) await rename(finalDir, previousDir);
    await rename(stageDir, finalDir);
  } catch (error) {
    await rm(stageDir, { recursive: true, force: true });
    if (!existsSync(finalDir) && existsSync(previousDir)) await rename(previousDir, finalDir);
    throw error;
  }
  await rm(previousDir, { recursive: true, force: true });
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
  verifyArchive(entry.id, archive, entry);
  const zip = await JSZip.loadAsync(archive);
  const manifestFile = zip.file(EXTENSION_MANIFEST_FILE);
  if (!manifestFile) throw new ExtensionInstallError(`${entry.id}: archive has no extension.json`);
  const parsed = parseExtensionManifest(JSON.parse(await manifestFile.async('string')));
  if (!parsed.ok) throw new ExtensionInstallError(`${entry.id}: ${parsed.issues.join('; ')}`);
  if (parsed.manifest.id !== entry.id || parsed.manifest.version !== entry.version)
    throw new ExtensionInstallError(`${entry.id}: archive does not match the release index`);

  await replaceFolder(path.join(installDir, entry.id), (stageDir) => extractZip(zip, stageDir));
  return parsed.manifest;
}

/** Installs an optional layer, such as `cards`, into `<extensionRoot>/<layer name>/`. */
export async function installExtensionLayer({
  archive,
  layer,
  extensionRoot,
}: {
  archive: Uint8Array;
  layer: ExtensionReleaseLayer;
  extensionRoot: string;
}) {
  verifyArchive(`${path.basename(extensionRoot)} ${layer.name}`, archive, layer);
  const zip = await JSZip.loadAsync(archive);
  await replaceFolder(path.join(extensionRoot, layer.name), (stageDir) =>
    extractZip(zip, stageDir),
  );
}
