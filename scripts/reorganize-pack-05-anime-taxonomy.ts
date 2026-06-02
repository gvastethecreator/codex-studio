import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

type PackCategory = {
  name: string;
  slug: string;
  start: number;
  end: number;
};

const rootDir = process.cwd();
const packId = 'pack_05';
const packSlug = 'anime-and-manga-spectrum';
const packManifestPath = path.join(
  rootDir,
  'components',
  'recipes',
  'styles',
  'manifests',
  'packs',
  `${packId}.yaml`,
);
const presetRoot = path.join(rootDir, 'components', 'recipes', 'styles', 'manifests', 'presets');

const categories: PackCategory[] = [
  { name: '1. Modern Shonen & Action', slug: 'modern-shonen-and-action', start: 1, end: 40 },
  { name: '2. 2000s Classics', slug: '2000s-classics', start: 41, end: 60 },
  { name: '3. 90s Golden Era', slug: '90s-golden-era', start: 61, end: 80 },
  {
    name: '4. Classic & Modern Shojo',
    slug: 'classic-and-modern-shojo',
    start: 81,
    end: 120,
  },
  { name: '5. Slice of Life & Moe', slug: 'slice-of-life-and-moe', start: 121, end: 150 },
  {
    name: '6. Sports, Competition & Performance',
    slug: 'sports-competition-and-performance',
    start: 151,
    end: 180,
  },
  { name: '7. Mecha & Cyberpunk', slug: 'mecha-and-cyberpunk', start: 181, end: 210 },
  { name: '8. Isekai & High Fantasy', slug: 'isekai-and-high-fantasy', start: 211, end: 240 },
  { name: '9. Dark Fantasy & Seinen', slug: 'dark-fantasy-and-seinen', start: 241, end: 270 },
  { name: '10. Studio Masterpieces', slug: 'studio-masterpieces', start: 271, end: 300 },
  {
    name: '11. 70s & 80s Retro Anime',
    slug: '70s-and-80s-retro-anime',
    start: 301,
    end: 330,
  },
  { name: '12. Anime Style Spectrum', slug: 'anime-style-spectrum', start: 331, end: 372 },
];

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function categoryForIndex(index: number) {
  const oneBased = index + 1;
  const category = categories.find((entry) => oneBased >= entry.start && oneBased <= entry.end);
  if (!category) {
    throw new Error(`No pack_05 category for preset index ${oneBased}`);
  }
  return category;
}

function dumpYaml(value: unknown) {
  return `${yaml.dump(value, { lineWidth: -1, noRefs: true, sortKeys: false })}\n`;
}

async function main() {
  const pack = yaml.load(await readFile(packManifestPath, 'utf8'));
  if (!isObject(pack)) throw new Error('pack_05 manifest is not an object');

  const presetRefs = Array.isArray(pack.presetRefs) ? pack.presetRefs : [];
  if (presetRefs.length !== 372) {
    throw new Error(`pack_05 expected 372 preset refs, found ${presetRefs.length}`);
  }

  const packCategories = categories.map((category) => ({
    id: category.slug,
    name: category.name,
    presetRefs: presetRefs.slice(category.start - 1, category.end),
  }));

  const nextPack = {
    ...pack,
    description:
      'A large curated collection of original anime and manga presets organized into 12 tightly separated substyles spanning retro cel language, modern action, romance, sports, performance, mecha, slice-of-life, fantasy, and creator-driven stylistic experiments.',
    categories: packCategories,
    presetRefs,
  };

  await writeFile(packManifestPath, dumpYaml(nextPack), 'utf8');

  for (let index = 0; index < presetRefs.length; index += 1) {
    const ref = presetRefs[index];
    const presetPath = path.join(presetRoot, ref);
    const preset = yaml.load(await readFile(presetPath, 'utf8'));
    if (!isObject(preset)) throw new Error(`Preset manifest is not an object: ${ref}`);
    const category = categoryForIndex(index);
    const taxonomy = isObject(preset.taxonomy) ? preset.taxonomy : {};
    const assets = isObject(preset.assets) ? preset.assets : {};
    const supportedTasks = Array.isArray(preset.supportedTasks) ? preset.supportedTasks : [];
    const nextPreset = {
      ...preset,
      category: category.name,
      tags: [packSlug, category.slug],
      taxonomy: {
        ...taxonomy,
        packId,
        packName: 'Anime & Manga Spectrum',
        categoryId: category.slug,
        categoryName: category.name,
        tags: [packSlug, category.slug],
        supportedTasks,
        hasDefaultImage: Boolean(assets.defaultImage),
      },
    };

    await writeFile(presetPath, dumpYaml(nextPreset), 'utf8');
  }

  console.log(
    `[pack_05] rewrote ${presetRefs.length} presets across ${categories.length} categories`,
  );
}

await main();
