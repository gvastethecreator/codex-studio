import { existsSync } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { resolveStudioDataRoot } from './config';
import {
  EXTENSION_LAYERS,
  EXTENSION_MANIFEST_FILE,
  parseExtensionManifest,
  type ExtensionManifest,
} from '../../../packages/shared/src/extensions';

/** One extension found in an Extension Source folder (ADR 0011). */
export interface InstalledExtension {
  manifest: ExtensionManifest;
  root: string;
  source: string;
  /** Optional layers present on disk, such as `cards`. */
  layers: string[];
}

export interface ExtensionListing {
  extensions: InstalledExtension[];
  /** Folders that looked like extensions but failed validation, with their issues. */
  invalid: { folder: string; issues: string[] }[];
}

export interface ExtensionStore {
  /** Cached listing; pass refresh after installing or removing an extension. */
  list(options?: { refresh?: boolean }): Promise<ExtensionListing>;
  /** Reads a file inside an extension; null when the extension or file does not exist. */
  readFile(extensionId: string, relativePath: string): Promise<Buffer | null>;
}

const DEFAULT_BUILT_IN_SOURCE = path.join('.local', 'extensions', 'builtin');

/** Folder that receives extensions installed from remote sources. */
export function resolveExtensionInstallDir(
  env: Record<string, string | undefined> = process.env,
  cwd = process.cwd(),
) {
  return env.STUDIO_EXTENSION_INSTALL_DIR
    ? path.resolve(cwd, env.STUDIO_EXTENSION_INSTALL_DIR)
    : path.join(resolveStudioDataRoot(env), 'Extensions');
}

/**
 * Local Extension Sources, in priority order: the install folder first, so an installed version
 * replaces a built-in one, then `STUDIO_EXTENSION_SOURCES` (path-delimited) or the built-in folder.
 */
export function resolveExtensionSources(
  env: Record<string, string | undefined> = process.env,
  cwd = process.cwd(),
) {
  const configured = env.STUDIO_EXTENSION_SOURCES?.split(path.delimiter).filter(Boolean);
  const sources = [
    resolveExtensionInstallDir(env, cwd),
    ...(configured?.length ? configured : [DEFAULT_BUILT_IN_SOURCE]).map((source) =>
      path.resolve(cwd, source),
    ),
  ];
  return [...new Set(sources)];
}

function insideRoot(root: string, relativePath: string) {
  const resolved = path.resolve(root, relativePath);
  return resolved.startsWith(`${path.resolve(root)}${path.sep}`) ? resolved : null;
}

export function createExtensionStore(sources: string[]): ExtensionStore {
  async function scan(): Promise<ExtensionListing> {
    const extensions: InstalledExtension[] = [];
    const invalid: ExtensionListing['invalid'] = [];
    const seen = new Set<string>();
    // Earlier sources win when two sources carry the same extension id.
    for (const source of sources) {
      if (!existsSync(source)) continue;
      for (const entry of await readdir(source, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name.includes('.stage-')) continue;
        const root = path.join(source, entry.name);
        const manifestPath = path.join(root, EXTENSION_MANIFEST_FILE);
        if (!existsSync(manifestPath)) continue;
        let raw: unknown;
        try {
          raw = JSON.parse(await readFile(manifestPath, 'utf8'));
        } catch {
          invalid.push({ folder: root, issues: ['extension.json is not valid JSON'] });
          continue;
        }
        const parsed = parseExtensionManifest(raw);
        if (!parsed.ok) {
          invalid.push({ folder: root, issues: parsed.issues });
          continue;
        }
        if (seen.has(parsed.manifest.id)) continue;
        seen.add(parsed.manifest.id);
        const layers = EXTENSION_LAYERS.filter((layer) => existsSync(path.join(root, layer)));
        extensions.push({ manifest: parsed.manifest, root, source, layers });
      }
    }
    extensions.sort((a, b) => a.manifest.id.localeCompare(b.manifest.id));
    return { extensions, invalid };
  }

  let cached: Promise<ExtensionListing> | null = null;
  function list(options: { refresh?: boolean } = {}) {
    if (!cached || options.refresh) cached = scan();
    return cached;
  }

  return {
    list,
    async readFile(extensionId, relativePath) {
      const extension = (await list()).extensions.find((item) => item.manifest.id === extensionId);
      if (!extension) return null;
      const filePath = insideRoot(extension.root, relativePath);
      if (!filePath || !existsSync(filePath) || !(await stat(filePath)).isFile()) return null;
      return readFile(filePath);
    },
  };
}
