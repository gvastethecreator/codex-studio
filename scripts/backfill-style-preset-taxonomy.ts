import { writeFile } from 'node:fs/promises';
import yaml from 'js-yaml';
import type {
  StylePackManifest,
  StylePresetEditorialTaxonomy,
  StylePresetManifest,
} from '../components/recipes/styles/manifestTypes';
import {
  loadStylePackManifests,
  loadStylePresetManifestRecords,
} from './style-manifest-files';

function argValue(name: string) {
  return process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1];
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^[0-9]+[.)]\s*/, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function refForPreset(preset: Pick<StylePresetManifest, 'packId' | 'id'>) {
  return `${preset.packId}/${preset.id}.yaml`;
}

function findCategory(pack: StylePackManifest, presetRef: string) {
  return pack.categories.find((category) => category.presetRefs.includes(presetRef));
}

function buildTaxonomy({
  pack,
  preset,
}: {
  pack: StylePackManifest;
  preset: StylePresetManifest;
}): StylePresetEditorialTaxonomy {
  const category = findCategory(pack, refForPreset(preset));
  return {
    packId: pack.id,
    packName: pack.name,
    categoryId: category?.id ?? slugify(preset.category),
    categoryName: category?.name ?? preset.category,
    ...(preset.domain ? { domain: preset.domain } : {}),
    tags: preset.tags,
    supportedTasks: preset.supportedTasks,
    hasDefaultImage: Boolean(preset.assets.defaultImage),
  };
}

function withTaxonomy(
  preset: StylePresetManifest,
  taxonomy: StylePresetEditorialTaxonomy,
): StylePresetManifest {
  return {
    ...preset,
    taxonomy,
  };
}

const packFilter = argValue('pack');
const presetFilter = argValue('preset');
const writeAll = process.argv.includes('--all');

if (!writeAll && !packFilter && !presetFilter) {
  console.error('[styles:taxonomy] Provide --preset=<id>, --pack=<pack_id>, or --all.');
  process.exit(1);
}

const packManifests = await loadStylePackManifests();
const packById = new Map(packManifests.map((pack) => [pack.id, pack]));
const presetRecords = await loadStylePresetManifestRecords();
let updated = 0;
let skipped = 0;

for (const record of presetRecords) {
  const { manifest } = record;
  if (presetFilter && manifest.id !== presetFilter) {
    skipped += 1;
    continue;
  }
  if (packFilter && manifest.packId !== packFilter) {
    skipped += 1;
    continue;
  }

  const pack = packById.get(manifest.packId);
  if (!pack) {
    throw new Error(`Missing Style Pack Manifest for ${manifest.packId}`);
  }

  const nextManifest = withTaxonomy(manifest, buildTaxonomy({ pack, preset: manifest }));
  await writeFile(
    record.filePath,
    yaml.dump(nextManifest, {
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    }),
    'utf8',
  );
  updated += 1;
}

console.log(`[styles:taxonomy] updated=${updated} skipped=${skipped}`);
