// Compile the in-repo style packs into Cozy Extensions (ADR 0011): one folder per pack with
// extension.json, pack.json, runtime.json, search.json, thumbnails.json and thumbnails/, plus the
// optional cards/ layer of full-quality cards with --with-cards.
// Usage: bun scripts/build-style-extensions.ts [--out=<dir>] [--pack=pack_14] [--with-cards]
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
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
const withCards = process.argv.includes('--with-cards');

// Card image formats (measured on 40 cards): 512 px webp q80 thumbnails average 57 KB; full cards
// at native size and webp q85 average 244 KB and keep film grain that AVIF smooths away.
const THUMB_WIDTH = 512;
const THUMB_QUALITY = 80;
const CARD_QUALITY = 85;
const CARD_SLOTS = ['', '-01', '-02'];
const cacheRoot = path.join(rootDir, '.local', 'extensions', 'cache');
const cardsRoot = path.join(rootDir, 'assets', 'recipes', 'styles', 'defaults');

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

/** Reads lib/styleThumbnailPacks.generated for the category images of each pack. */
async function loadThumbnailProjection() {
  const dir = path.join(rootDir, 'lib', 'styleThumbnailPacks.generated');
  const byPack = new Map<string, Map<string, string>>();
  for (const file of (await readdir(dir)).filter((name) => name.startsWith('thumbnail_group_'))) {
    let packId = '';
    const source = await readFile(path.join(dir, file), 'utf8');
    const token = /^ {2}(pack_\d+): \{|'?([\w-]+)'?: new URL\(\s*'\.\.\/\.\.\/([^']+)'/gm;
    for (const match of source.matchAll(token)) {
      if (match[1]) packId = match[1];
      // Card thumbnails are rebuilt from the full cards below; only category images come from here.
      else if (
        packId &&
        match[2]?.startsWith('pack_') &&
        match[3]?.includes('/style-card-thumbnails/')
      ) {
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
  const cardKeys = presetManifests
    .filter((preset) => preset.packId === packManifest.id)
    .flatMap((preset) => CARD_SLOTS.map((slot) => `${preset.id}${slot}`))
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
    },
    stylePack: {
      id: packManifest.id,
      name: packManifest.name,
      description: packManifest.description,
      cardTitle: packManifest.cardTitle,
      cardDescription: packManifest.cardDescription,
      presetCount: runtime.presets.length,
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
    `[extensions:build] ${id} presets=${runtime.presets.length} cards=${cardKeys.length} thumbnails=${Object.keys(thumbnailMap).length}${withCards ? ' +cards' : ''}`,
  );
}
console.log(`[extensions:build] built=${built} out=${path.relative(rootDir, outDir)}`);
