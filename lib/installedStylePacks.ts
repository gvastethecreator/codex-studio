// Style packs come from installed Cozy Extensions (ADR 0011). The app loads the list once at
// startup, before React mounts, so style surfaces can read pack summaries synchronously.
import type { ExtensionManifest, StylePackSummary } from '../packages/shared/src/extensions';
import { compareStylePackIdsForDisplay } from '../components/recipes/styles/packOrdering';
import {
  extensionFileUrl,
  fetchExtensionJson,
  listInstalledExtensions,
} from '../services/studio-api/extensions';

/** Live list of installed style pack summaries in display order; filled in place at startup. */
export const INSTALLED_STYLE_PACK_SUMMARIES: StylePackSummary[] = [];

const extensionByPackId = new Map<string, ExtensionManifest>();

export function registerInstalledStylePacks(extensions: readonly ExtensionManifest[]) {
  extensionByPackId.clear();
  for (const extension of extensions) {
    if (extension.kind !== 'style-pack') continue;
    // Earlier sources win, matching the backend listing.
    if (!extensionByPackId.has(extension.stylePack.id))
      extensionByPackId.set(extension.stylePack.id, extension);
  }
  const summaries = [...extensionByPackId.values()]
    .map((extension) => extension.stylePack)
    .sort((a, b) => compareStylePackIdsForDisplay(a.id, b.id));
  INSTALLED_STYLE_PACK_SUMMARIES.splice(0, INSTALLED_STYLE_PACK_SUMMARIES.length, ...summaries);
}

let loading: Promise<void> | null = null;
let loadError: Error | null = null;

/** Why the installed extensions could not be listed, or null. */
export function getInstalledStylePacksError() {
  return loadError;
}

const LIST_ATTEMPTS = 4;
const LIST_RETRY_MS = 600;
const LIST_TIMEOUT_MS = 4000;

// The dev UI can load before the backend listens, so retry briefly before giving up.
async function listWithRetry() {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await listInstalledExtensions({ signal: AbortSignal.timeout(LIST_TIMEOUT_MS) });
    } catch (error) {
      if (attempt >= LIST_ATTEMPTS) throw error;
      await new Promise((resolve) => setTimeout(resolve, LIST_RETRY_MS));
    }
  }
}

/** Fetches the installed extensions once. A failed request leaves the catalogue empty. */
export function loadInstalledStylePacks() {
  loading ??= listWithRetry()
    .then(({ extensions }) => {
      loadError = null;
      registerInstalledStylePacks(extensions);
    })
    .catch((error: unknown) => {
      loading = null;
      loadError = error instanceof Error ? error : new Error(String(error));
    });
  return loading;
}

function extensionForPack(packId: string) {
  const extension = extensionByPackId.get(packId);
  if (!extension) throw new Error(`Style pack ${packId} is not installed.`);
  return extension;
}

export function isInstalledStylePack(packId: string) {
  return extensionByPackId.has(packId);
}

export function fetchStylePackFile<T>(
  packId: string,
  file: keyof ExtensionManifest['files'],
): Promise<T> {
  const extension = extensionForPack(packId);
  return fetchExtensionJson<T>(extension.id, extension.files[file]);
}

export function stylePackFileUrl(packId: string, relativePath: string) {
  return extensionFileUrl(extensionForPack(packId).id, relativePath);
}
