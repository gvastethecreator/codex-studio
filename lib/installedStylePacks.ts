// Style packs come from installed Cozy Extensions (ADR 0011). The app loads the list once at
// startup, before React mounts, so style surfaces can read pack summaries synchronously.
import type {
  ExtensionManifest,
  StylePackLandingFolder,
  StylePackSummary,
} from '../packages/shared/src/extensions';
import { compareStylePackIdsForDisplay } from '../components/recipes/styles/packOrdering';
import {
  extensionFileUrl,
  fetchExtensionJson,
  listInstalledExtensions,
  requestDefaultStylePack,
} from '../services/studio-api/extensions';

/** Live list of installed style pack summaries in display order; filled in place at startup. */
export const INSTALLED_STYLE_PACK_SUMMARIES: StylePackSummary[] = [];

const extensionByPackId = new Map<string, ExtensionManifest>();

const packIdsWithCards = new Set<string>();

// Copied presets, such as Essentials entries, hidden because their source pack is installed.
const hiddenPresetIdsByPack = new Map<string, Set<string>>();

export function registerInstalledStylePacks(
  extensions: readonly ExtensionManifest[],
  installedLayers: Readonly<Record<string, readonly string[]>> = {},
) {
  extensionByPackId.clear();
  packIdsWithCards.clear();
  hiddenPresetIdsByPack.clear();
  for (const extension of extensions) {
    if (extension.kind !== 'style-pack') continue;
    // Earlier sources win, matching the backend listing.
    if (extensionByPackId.has(extension.stylePack.id)) continue;
    extensionByPackId.set(extension.stylePack.id, extension);
    if (installedLayers[extension.id]?.includes('cards'))
      packIdsWithCards.add(extension.stylePack.id);
  }
  for (const { stylePack } of extensionByPackId.values()) {
    const hidden = Object.entries(stylePack.copiedFrom ?? {})
      .filter(
        ([, source]) => source.packId !== stylePack.id && extensionByPackId.has(source.packId),
      )
      .map(([presetId]) => presetId);
    if (hidden.length > 0) hiddenPresetIdsByPack.set(stylePack.id, new Set(hidden));
  }
  const summaries = [...extensionByPackId.values()]
    .map(({ stylePack }) => {
      const hiddenCount = hiddenPresetIdsByPack.get(stylePack.id)?.size ?? 0;
      return hiddenCount > 0
        ? { ...stylePack, presetCount: stylePack.presetCount - hiddenCount }
        : stylePack;
    })
    .filter((summary) => summary.presetCount > 0)
    .sort((a, b) => compareStylePackIdsForDisplay(a.id, b.id));
  INSTALLED_STYLE_PACK_SUMMARIES.splice(0, INSTALLED_STYLE_PACK_SUMMARIES.length, ...summaries);
}

/** True for a copied preset that Studio hides because its source pack is installed. */
export function isHiddenStylePreset(packId: string, presetId: string) {
  return hiddenPresetIdsByPack.get(packId)?.has(presetId) ?? false;
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
    .then(({ extensions, installedLayers }) => {
      loadError = null;
      registerInstalledStylePacks(extensions, installedLayers);
      // A new Studio has no style pack yet: the backend installs Essentials once in the background.
      if (!extensions.some((extension) => extension.kind === 'style-pack'))
        void requestDefaultStylePack().catch(() => undefined);
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
  const relativePath = extension.files[file];
  if (!relativePath) return Promise.reject(new Error(`Style pack ${packId} has no ${file} file.`));
  return fetchExtensionJson<T>(extension.id, relativePath);
}

/** Packs that ship retired presets for old favorites. */
export function stylePackIdsWithArchivedPresets() {
  return [...extensionByPackId.values()].flatMap((extension) =>
    extension.files.archived ? [extension.stylePack.id] : [],
  );
}

const LANDING_IMAGE_LIMIT = 6;

/**
 * Landing folder data for a style pack or a style collection, summed across the installed packs
 * in display order. Null when no installed pack contributes to it.
 */
export function getStyleLandingFolder(id: string): StylePackLandingFolder | null {
  const pack = INSTALLED_STYLE_PACK_SUMMARIES.find((summary) => summary.id === id);
  if (pack) return { presetCount: pack.presetCount, imageKeys: pack.landing?.imageKeys ?? [] };
  let folder: StylePackLandingFolder | null = null;
  for (const summary of INSTALLED_STYLE_PACK_SUMMARIES) {
    const share = summary.landing?.collections[id];
    if (!share) continue;
    folder ??= { presetCount: 0, imageKeys: [] };
    folder.presetCount += share.presetCount;
    folder.imageKeys.push(...share.imageKeys);
  }
  if (folder) folder.imageKeys = folder.imageKeys.slice(0, LANDING_IMAGE_LIMIT);
  return folder;
}

/** True when the pack's optional full-quality `cards` layer is installed. */
export function stylePackHasFullCards(packId: string) {
  return packIdsWithCards.has(packId);
}

export function stylePackFileUrl(packId: string, relativePath: string) {
  return extensionFileUrl(extensionForPack(packId).id, relativePath);
}
