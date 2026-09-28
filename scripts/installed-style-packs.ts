// Reads the installed style-pack extensions from disk for scripts that inspect the style UI
// (ADR 0011). Style authoring lives in cozy-styles-dev; Studio only sees installed packs.
import type {
  StylePackManifest,
  StylePresetManifest,
} from '../components/recipes/styles/manifestTypes';
import type { StyleRuntimePack } from '../components/recipes/styles/runtimeTypes';
import { compareStylePackIdsForDisplay } from '../components/recipes/styles/packOrdering';
import {
  createExtensionStore,
  resolveExtensionSources,
} from '../apps/local-server/src/extensionStore';

export interface InstalledStylePackData {
  runtimePacks: StyleRuntimePack[];
  packManifests: StylePackManifest[];
  presetManifests: StylePresetManifest[];
}

export async function loadInstalledStylePackData(): Promise<InstalledStylePackData> {
  const store = createExtensionStore(resolveExtensionSources());
  const readJson = async <T>(id: string, file: string) => {
    const bytes = await store.readFile(id, file);
    if (!bytes) throw new Error(`Extension ${id} has no ${file}`);
    return JSON.parse(bytes.toString('utf8')) as T;
  };
  const extensions = (await store.list()).extensions
    .filter(({ manifest }) => manifest.kind === 'style-pack')
    .toSorted((a, b) =>
      compareStylePackIdsForDisplay(a.manifest.stylePack.id, b.manifest.stylePack.id),
    );
  const data: InstalledStylePackData = { runtimePacks: [], packManifests: [], presetManifests: [] };
  for (const { manifest } of extensions) {
    const [runtime, pack] = await Promise.all([
      readJson<StyleRuntimePack>(manifest.id, manifest.files.runtime),
      readJson<{ packManifest: StylePackManifest; presetManifests: StylePresetManifest[] }>(
        manifest.id,
        manifest.files.pack,
      ),
    ]);
    data.runtimePacks.push(runtime);
    data.packManifests.push(pack.packManifest);
    data.presetManifests.push(...pack.presetManifests);
  }
  return data;
}
