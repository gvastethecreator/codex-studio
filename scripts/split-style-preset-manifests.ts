import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

import type {
  StylePack,
  StylePackManifest,
  StylePackManifestCategory,
  StylePresetDef,
  StylePresetManifest,
  StylePresetManifestAttributes,
} from '../components/recipes/styles/types';

const repoRoot = process.cwd();
const packsDir = path.join(repoRoot, 'components', 'recipes', 'styles', 'packs');
const manifestsDir = path.join(repoRoot, 'components', 'recipes', 'styles', 'manifests');
const packManifestDir = path.join(manifestsDir, 'packs');
const presetManifestDir = path.join(manifestsDir, 'presets');

const passthroughAttributeKeys = [
  'camera',
  'render',
  'type',
  'ui',
  'layout',
  'materials',
  'print',
  'digital',
] as const;

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^[0-9]+[.)]\s*/, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeCategory(category?: string) {
  return category?.trim() || 'General';
}

function parseAvoidRules(negativePrompt?: string) {
  if (!negativePrompt) return [];
  return negativePrompt
    .split(',')
    .map((rule) => rule.trim())
    .filter(Boolean);
}

function createTags(pack: StylePack, preset: StylePresetDef, category: string) {
  const tags = new Set<string>([slugify(pack.name), slugify(category)]);
  if (preset.domain) tags.add(slugify(preset.domain));
  return [...tags].filter(Boolean);
}

function createAttributes(preset: StylePresetDef) {
  const attributes: StylePresetManifestAttributes = {};
  if (preset.negativePrompt) attributes.negativePrompt = preset.negativePrompt;

  for (const key of passthroughAttributeKeys) {
    const value = preset[key];
    if (value !== undefined) {
      attributes[key] = value;
    }
  }

  return Object.keys(attributes).length > 0 ? attributes : undefined;
}

function toPresetManifest(pack: StylePack, preset: StylePresetDef): StylePresetManifest {
  const category = normalizeCategory(preset.category);
  return {
    schemaVersion: 1,
    id: preset.id,
    packId: pack.id,
    name: preset.name,
    category,
    ...(preset.domain ? { domain: preset.domain } : {}),
    version: 1,
    supportedTasks: ['image_generate', 'image_edit', 'style_preset_card'],
    tags: createTags(pack, preset, category),
    visualDna: preset.style,
    avoidRules: parseAvoidRules(preset.negativePrompt),
    assets: {
      defaultImage: `/assets/recipes/styles/defaults/${preset.id}.webp`,
    },
    ...(createAttributes(preset) ? { attributes: createAttributes(preset) } : {}),
  };
}

function toPackManifest(pack: StylePack, presetRefsByCategory: Map<string, string[]>) {
  const categories: StylePackManifestCategory[] = [...presetRefsByCategory.entries()].map(
    ([name, presetRefs]) => ({
      id: slugify(name),
      name,
      presetRefs,
    }),
  );

  const manifest: StylePackManifest = {
    schemaVersion: 1,
    id: pack.id,
    name: pack.name,
    description: pack.description,
    categories,
    presetRefs: categories.flatMap((category) => category.presetRefs),
  };

  return manifest;
}

async function readLegacyPacks() {
  const files = (await readdir(packsDir)).filter((file) => file.endsWith('.yaml')).sort();
  const packs: StylePack[] = [];

  for (const file of files) {
    const raw = await readFile(path.join(packsDir, file), 'utf8');
    const parsed = yaml.load(raw) as StylePack[];
    packs.push(...parsed);
  }

  return packs;
}

async function writeYaml(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(
    filePath,
    yaml.dump(value, {
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    }),
    'utf8',
  );
}

async function main() {
  const packs = await readLegacyPacks();
  await rm(manifestsDir, { recursive: true, force: true });

  let presetCount = 0;
  for (const pack of packs) {
    const refsByCategory = new Map<string, string[]>();

    for (const preset of pack.presets) {
      const category = normalizeCategory(preset.category);
      const manifest = toPresetManifest(pack, preset);
      const relativeRef = `${pack.id}/${preset.id}.yaml`;
      const outputPath = path.join(presetManifestDir, pack.id, `${preset.id}.yaml`);
      await writeYaml(outputPath, manifest);
      refsByCategory.set(category, [...(refsByCategory.get(category) ?? []), relativeRef]);
      presetCount += 1;
    }

    await writeYaml(path.join(packManifestDir, `${pack.id}.yaml`), toPackManifest(pack, refsByCategory));
  }

  console.log(`Style pack manifests: ${packs.length}`);
  console.log(`Style preset manifests: ${presetCount}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
