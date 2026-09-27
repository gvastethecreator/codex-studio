// Compile the in-repo style packs into Cozy Extensions (ADR 0011): one folder per pack with
// extension.json, pack.json, runtime.json, search.json, thumbnails.json and thumbnails/, an
// archived.json when the pack retired presets, plus the optional cards/ layer of full-quality
// cards with --with-cards.
// Usage: bun scripts/build-style-extensions.ts [--out=<dir>] [--pack=pack_14] [--with-cards]
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import * as yaml from 'js-yaml';
import sharp from 'sharp';
import path from 'node:path';
import {
  composeStyleRuntimePacksFromManifests,
  createStylePresetCatalogSearchIndexFromRuntimePacks,
} from '../components/recipes/stylePresetManifests';
import type {
  StylePackManifest,
  StylePresetManifest,
} from '../components/recipes/styles/manifestTypes';
import { STYLE_COLLECTIONS } from '../components/recipes/styles/collections/styleCollectionDefinitions';
import {
  createStyleCollectionSourceIndex,
  resolveStyleCollection,
} from '../components/recipes/styles/collections/styleCollectionProjection';
import type { StyleCollectionEntry } from '../components/recipes/styles/collections/styleCollectionTypes';
import type {
  StyleRuntimeIntentional,
  StyleRuntimePack,
  StyleRuntimePreset,
} from '../components/recipes/styles/runtimeTypes';
import { styleCategoryImageKey } from '../lib/recipeAssetKeys';
import {
  EXTENSION_MANIFEST_FILE,
  EXTENSION_SCHEMA_VERSION,
  parseExtensionManifest,
  type ExtensionManifest,
  type StylePackLanding,
} from '../packages/shared/src/extensions';
import { loadStyleManifestGraph, rootDir, styleManifestsDir } from './style-manifest-files';
import {
  collectStyleLandingFolderPreferredKeys,
  selectStyleLandingFolderImageKeys,
  STYLE_LANDING_FOLDER_IMAGE_LIMIT,
} from './styleThumbnailProjection';

const BUILT_IN_PUBLISHER = 'cozy';
const STUDIO_RANGE = '>=0.1.0';
const BUILT_IN_VERSION = '1.0.0';
const argValue = (name: string) =>
  process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1];
const outDir = path.resolve(rootDir, argValue('out') ?? '.local/extensions/builtin');
const onlyPack = argValue('pack');
const withCards = process.argv.includes('--with-cards');

// Card image formats (measured on 40 cards): 512 px webp q80 thumbnails average 57 KB; full cards
// at native size and webp q85 average 244 KB and keep film grain that AVIF smooths away.
const THUMB_WIDTH = 512;
const THUMB_QUALITY = 80;
const CARD_QUALITY = 85;
const CARD_SLOTS = ['', '-01', '-02'];
const cacheRoot = path.join(rootDir, '.local', 'extensions', 'cache');
const cardsRoot = path.join(rootDir, 'assets', 'recipes', 'styles', 'defaults');
const categoryImagesRoot = path.join(
  rootDir,
  'assets',
  'recipes',
  'styles',
  'style-card-thumbnails',
);
const archiveRoot = path.join(styleManifestsDir, 'archive');
// Hand-written Intentional policies for presets whose manifests carry none.
const intentionalRegistryPath = path.join(
  rootDir,
  'components',
  'recipes',
  'styles',
  'intentional-v1',
  'policy-registry.json',
);
// Collections that Studio fills from the user's own data, not from style packs.
const USER_COLLECTION_IDS = new Set(['my_styles', 'favorites', 'recent']);

function cardSourcePath(key: string) {
  return /^SP\d\d-\d{3}$/.test(key)
    ? path.join(cardsRoot, `${key}.webp`)
    : path.join(cardsRoot, 'variants', `${key}.webp`);
}

/** Encodes a card once and reuses it until the source card changes. */
async function encodeCached(kind: 'thumb512' | 'cards-q85', key: string, source: string) {
  const target = path.join(cacheRoot, kind, `${key}.webp`);
  if (existsSync(target) && (await stat(target)).mtimeMs >= (await stat(source)).mtimeMs)
    return target;
  await mkdir(path.dirname(target), { recursive: true });
  const image = sharp(source);
  const encoded =
    kind === 'thumb512'
      ? image.resize({ width: THUMB_WIDTH }).webp({ quality: THUMB_QUALITY, effort: 5 })
      : image.webp({ quality: CARD_QUALITY, effort: 5 });
  await encoded.toFile(`${target}.tmp`);
  await rename(`${target}.tmp`, target);
  return target;
}

async function runPool<T>(items: T[], limit: number, task: (item: T) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) await task(items[next++]!);
    }),
  );
}

export function builtInExtensionId(packId: string) {
  return `${BUILT_IN_PUBLISHER}.${packId.replace(/_/g, '-')}`;
}

/** Category images are named `<packId>__<category>.webp`. */
async function loadCategoryImages() {
  const byPack = new Map<string, string[]>();
  for (const name of (await readdir(categoryImagesRoot)).sort()) {
    const match = /^(pack_\d+)__.+\.webp$/.exec(name);
    if (match) byPack.set(match[1]!, [...(byPack.get(match[1]!) ?? []), name]);
  }
  return byPack;
}

function collectCategoryEntries(
  entries: readonly StyleCollectionEntry[],
): { packId: string; categoryName: string }[] {
  return entries.flatMap((entry) => {
    if (entry.kind === 'manual_group') return collectCategoryEntries(entry.entries ?? []);
    if (entry.kind === 'category' && entry.packId && entry.categoryName)
      return [{ packId: entry.packId, categoryName: entry.categoryName }];
    return [];
  });
}

function preferredLandingKeys(input: {
  featuredPresetIds?: readonly string[];
  categoryNames: readonly { packId: string; categoryName: string }[];
  presetIds: readonly string[];
}) {
  return collectStyleLandingFolderPreferredKeys({
    featuredPresetIds: input.featuredPresetIds,
    categoryKeys: input.categoryNames.map((entry) =>
      styleCategoryImageKey(entry.packId, entry.categoryName),
    ),
    presetIds: input.presetIds,
  });
}

/** This pack's landing folder images and its share of every style collection. */
function buildLanding(runtime: StyleRuntimePack, imageKeys: Set<string>): StylePackLanding {
  const pick = (keys: readonly string[]) =>
    selectStyleLandingFolderImageKeys(keys, imageKeys, STYLE_LANDING_FOLDER_IMAGE_LIMIT);
  const index = createStyleCollectionSourceIndex([runtime]);
  const collections: StylePackLanding['collections'] = {};
  for (const collection of STYLE_COLLECTIONS) {
    if (USER_COLLECTION_IDS.has(collection.id)) continue;
    const resolved = resolveStyleCollection(collection, index);
    if (resolved.presets.length === 0) continue;
    collections[collection.id] = {
      presetCount: resolved.presets.length,
      imageKeys: pick(
        preferredLandingKeys({
          featuredPresetIds:
            'featuredPresetIds' in collection ? collection.featuredPresetIds : undefined,
          categoryNames: collectCategoryEntries(collection.entries),
          presetIds: [
            ...(resolved.summary.featuredPresetIds ?? []),
            ...resolved.presets.map((item) => item.presetId),
          ],
        }),
      ),
    };
  }
  return {
    imageKeys: pick(
      preferredLandingKeys({
        categoryNames: [
          ...new Set(runtime.presets.map((preset) => preset.category ?? 'General')),
        ].map((categoryName) => ({ packId: runtime.id, categoryName })),
        presetIds: runtime.presets.map((preset) => preset.id),
      }),
    ),
    collections,
  };
}

/** Presets that packs retired, from manifests/archive, so old favorites still resolve. */
async function loadArchivedPresets() {
  const byPack = new Map<string, Map<string, StyleRuntimePreset>>();
  if (!existsSync(archiveRoot)) return byPack;
  for (const archive of (await readdir(archiveRoot)).sort()) {
    const packsDir = path.join(archiveRoot, archive, 'packs');
    if (!existsSync(packsDir)) continue;
    for (const file of (await readdir(packsDir)).filter((name) => name.endsWith('.yaml'))) {
      const packManifest = yaml.load(
        await readFile(path.join(packsDir, file), 'utf8'),
      ) as StylePackManifest;
      const presetsDir = path.join(archiveRoot, archive, 'presets', packManifest.id);
      const presets = await Promise.all(
        (await readdir(presetsDir))
          .filter((name) => name.endsWith('.yaml'))
          .map(
            async (name) =>
              yaml.load(await readFile(path.join(presetsDir, name), 'utf8')) as StylePresetManifest,
          ),
      );
      const runtime = composeStyleRuntimePacksFromManifests([packManifest], presets)[0];
      const retired = byPack.get(packManifest.id) ?? new Map<string, StyleRuntimePreset>();
      for (const preset of runtime?.presets ?? []) {
        if (retired.has(preset.id))
          throw new Error(`Archived preset ${preset.id} appears in more than one archive`);
        retired.set(preset.id, preset);
      }
      byPack.set(packManifest.id, retired);
    }
  }
  return byPack;
}

/** Attaches registry policies to presets whose manifests carry none; manifests win. */
async function attachIntentionalPolicies(presetGroups: StyleRuntimePreset[][]) {
  const registry = JSON.parse(await readFile(intentionalRegistryPath, 'utf8')) as Record<
    string,
    Record<string, unknown> & { presetVersion?: number }
  >;
  for (const preset of presetGroups.flat()) {
    const entry = registry[preset.id];
    if (preset.intentional || !entry) continue;
    const { presetVersion, name: _name, packId: _packId, ...policy } = entry;
    preset.intentional = {
      policy: policy as unknown as StyleRuntimeIntentional['policy'],
      presetVersion: typeof presetVersion === 'number' ? presetVersion : 1,
    };
  }
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
const categoryImages = await loadCategoryImages();
const archivedPresets = await loadArchivedPresets();
await attachIntentionalPolicies([
  ...runtimePacks.map((pack) => pack.presets),
  ...[...archivedPresets.values()].map((presets) => [...presets.values()]),
]);
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
  for (const fileName of categoryImages.get(packManifest.id) ?? []) {
    await copyFile(
      path.join(categoryImagesRoot, fileName),
      path.join(stageDir, 'thumbnails', fileName),
    );
    thumbnailMap[path.basename(fileName, '.webp')] = `thumbnails/${fileName}`;
  }
  const currentIds = new Set(runtime.presets.map((preset) => preset.id));
  const archived = [...(archivedPresets.get(packManifest.id)?.values() ?? [])].filter(
    (preset) => !currentIds.has(preset.id),
  );
  const cardKeys = [...currentIds, ...archived.map((preset) => preset.id)]
    .flatMap((presetId) => CARD_SLOTS.map((slot) => `${presetId}${slot}`))
    .filter((key) => existsSync(cardSourcePath(key)));
  if (withCards) await mkdir(path.join(stageDir, 'cards'), { recursive: true });
  await runPool(cardKeys, 8, async (key) => {
    const source = cardSourcePath(key);
    const thumb = await encodeCached('thumb512', key, source);
    await copyFile(thumb, path.join(stageDir, 'thumbnails', `${key}.webp`));
    if (withCards) {
      const card = await encodeCached('cards-q85', key, source);
      await copyFile(card, path.join(stageDir, 'cards', `${key}.webp`));
    }
  });
  for (const key of cardKeys) thumbnailMap[key] = `thumbnails/${key}.webp`;

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
      ...(archived.length > 0 ? { archived: 'archived.json' } : {}),
    },
    stylePack: {
      id: packManifest.id,
      name: packManifest.name,
      description: packManifest.description,
      cardTitle: packManifest.cardTitle,
      cardDescription: packManifest.cardDescription,
      presetCount: runtime.presets.length,
      landing: buildLanding(runtime, new Set(Object.keys(thumbnailMap))),
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
  if (archived.length > 0)
    await writeJson(path.join(stageDir, 'archived.json'), {
      packName: packManifest.name,
      presets: archived,
    });

  await rm(finalDir, { recursive: true, force: true });
  await rename(stageDir, finalDir);
  built++;
  console.log(
    `[extensions:build] ${id} presets=${runtime.presets.length} archived=${archived.length} cards=${cardKeys.length} thumbnails=${Object.keys(thumbnailMap).length}${withCards ? ' +cards' : ''}`,
  );
}
console.log(`[extensions:build] built=${built} out=${path.relative(rootDir, outDir)}`);
