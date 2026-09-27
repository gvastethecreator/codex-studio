// Compile the in-repo style packs into Cozy Extensions (ADR 0011): one folder per pack with
// extension.json, pack.json, runtime.json, search.json, thumbnails.json and thumbnails/.
// Usage: bun scripts/build-style-extensions.ts [--out=<dir>] [--pack=pack_14]
import { copyFile, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  composeStyleRuntimePacksFromManifests,
  createStylePresetCatalogSearchIndexFromRuntimePacks,
} from '../components/recipes/stylePresetManifests';
import {
  EXTENSION_MANIFEST_FILE,
  EXTENSION_SCHEMA_VERSION,
  parseExtensionManifest,
  type ExtensionManifest,
} from '../packages/shared/src/extensions';
import { loadStyleManifestGraph, rootDir } from './style-manifest-files';

const BUILT_IN_PUBLISHER = 'cozy';
const STUDIO_RANGE = '>=0.1.0';
const BUILT_IN_VERSION = '1.0.0';
const argValue = (name: string) =>
  process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1];
const outDir = path.resolve(rootDir, argValue('out') ?? '.local/extensions/builtin');
const onlyPack = argValue('pack');

export function builtInExtensionId(packId: string) {
  return `${BUILT_IN_PUBLISHER}.${packId.replace(/_/g, '-')}`;
}

/** Reads lib/styleThumbnailPacks.generated so thumbnails follow the same keys as the app. */
async function loadThumbnailProjection() {
  const dir = path.join(rootDir, 'lib', 'styleThumbnailPacks.generated');
  const byPack = new Map<string, Map<string, string>>();
  for (const file of (await readdir(dir)).filter((name) => name.startsWith('thumbnail_group_'))) {
    let packId = '';
    const source = await readFile(path.join(dir, file), 'utf8');
    const token = /^ {2}(pack_\d+): \{|'?([\w-]+)'?: new URL\(\s*'\.\.\/\.\.\/([^']+)'/gm;
    for (const match of source.matchAll(token)) {
      if (match[1]) packId = match[1];
      // Only core card thumbnails ship in the extension. Provider comparison images
      // (defaults/providers/*) are full-size and belong to an optional asset.
      else if (packId && match[2] && match[3]?.includes('/style-card-thumbnails/')) {
        const entries = byPack.get(packId) ?? new Map<string, string>();
        entries.set(match[2], match[3]);
        byPack.set(packId, entries);
      }
    }
  }
  return byPack;
}

async function writeJson(filePath: string, value: unknown) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

const { graph, packManifests, presetManifests } = await loadStyleManifestGraph();
if (graph.errors.length > 0) {
  console.error(`[extensions:build] graph errors=${graph.errors.length}`);
  process.exit(1);
}

const runtimePacks = composeStyleRuntimePacksFromManifests(packManifests, presetManifests);
const searchIndex = createStylePresetCatalogSearchIndexFromRuntimePacks(runtimePacks, {
  includeStyleText: false,
});
const thumbnails = await loadThumbnailProjection();
await mkdir(outDir, { recursive: true });

let built = 0;
for (const packManifest of packManifests) {
  if (onlyPack && packManifest.id !== onlyPack) continue;
  const id = builtInExtensionId(packManifest.id);
  const runtime = runtimePacks.find((pack) => pack.id === packManifest.id);
  if (!runtime) throw new Error(`No runtime pack for ${packManifest.id}`);

  // Write into a staging folder, then swap it in so readers never see a half-built extension.
  const finalDir = path.join(outDir, id);
  const stageDir = `${finalDir}.stage-${process.pid}`;
  await rm(stageDir, { recursive: true, force: true });
  await mkdir(path.join(stageDir, 'thumbnails'), { recursive: true });

  const thumbnailMap: Record<string, string> = {};
  for (const [key, assetPath] of thumbnails.get(packManifest.id) ?? []) {
    const fileName = `${key}${path.extname(assetPath)}`;
    await copyFile(path.join(rootDir, assetPath), path.join(stageDir, 'thumbnails', fileName));
    thumbnailMap[key] = `thumbnails/${fileName}`;
  }

  const manifest: ExtensionManifest = {
    schemaVersion: EXTENSION_SCHEMA_VERSION,
    id,
    kind: 'style-pack',
    // Built-in packs have no release version yet; cozy-styles releases will set real ones.
    version: BUILT_IN_VERSION,
    studio: STUDIO_RANGE,
    title: packManifest.name,
    files: {
      pack: 'pack.json',
      runtime: 'runtime.json',
      search: 'search.json',
      thumbnails: 'thumbnails.json',
    },
    assets: [],
  };
  const parsed = parseExtensionManifest(manifest);
  if (!parsed.ok) throw new Error(`${id}: ${parsed.issues.join('; ')}`);

  await writeJson(path.join(stageDir, EXTENSION_MANIFEST_FILE), manifest);
  await writeJson(path.join(stageDir, 'pack.json'), {
    packManifest,
    presetManifests: presetManifests.filter((preset) => preset.packId === packManifest.id),
  });
  await writeJson(path.join(stageDir, 'runtime.json'), runtime);
  await writeJson(path.join(stageDir, 'search.json'), {
    packs: searchIndex.packs.filter((pack) => pack.id === packManifest.id),
    presets: searchIndex.presets.filter((preset) => preset.packId === packManifest.id),
    totalPresetCount: runtime.presets.length,
  });
  await writeJson(path.join(stageDir, 'thumbnails.json'), thumbnailMap);

  await rm(finalDir, { recursive: true, force: true });
  await rename(stageDir, finalDir);
  built++;
  console.log(
    `[extensions:build] ${id} presets=${runtime.presets.length} thumbnails=${Object.keys(thumbnailMap).length}`,
  );
}
console.log(`[extensions:build] built=${built} out=${path.relative(rootDir, outDir)}`);
