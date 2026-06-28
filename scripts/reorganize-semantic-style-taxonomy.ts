import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as yaml from 'js-yaml';

type PackCategory = {
  id: string;
  name: string;
  presetRefs: string[];
};

type PackConfig = {
  packId: string;
  packName: string;
  packSlug: string;
  description?: string;
  categories: PackCategory[];
};

const rootDir = process.cwd();
const packsDir = path.join(rootDir, 'components', 'recipes', 'styles', 'manifests', 'packs');
const presetRoot = path.join(rootDir, 'components', 'recipes', 'styles', 'manifests', 'presets');

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function dumpYaml(value: unknown) {
  return `${yaml.dump(value, { lineWidth: -1, noRefs: true, sortKeys: false })}\n`;
}

function ref(packId: string, number: number) {
  const suffix = packId.replace('pack_', 'SP');
  return `${packId}/${suffix}-${String(number).padStart(3, '0')}.yaml`;
}

function rangeRefs(packId: string, start: number, end: number) {
  const refs: string[] = [];
  for (let current = start; current <= end; current += 1) {
    refs.push(ref(packId, current));
  }
  return refs;
}

function explicitRefs(packId: string, ids: number[]) {
  return ids.map((id) => ref(packId, id));
}

const PACK_CONFIGS: PackConfig[] = [
  {
    packId: 'pack_06',
    packName: 'Essential Art Styles',
    packSlug: 'essential-art-styles',
    description:
      'A broad survey of foundational art-making languages, from traditional pigment and draftsmanship to printmaking, digital workflows, mixed-media craft, and game-native visual systems.',
    categories: [
      {
        id: 'traditional-painting',
        name: '1. Traditional Painting',
        presetRefs: rangeRefs('pack_06', 1, 15),
      },
      {
        id: 'drawing-and-sketching',
        name: '2. Drawing & Sketching',
        presetRefs: rangeRefs('pack_06', 16, 30),
      },
      {
        id: 'printmaking',
        name: '3. Printmaking',
        presetRefs: rangeRefs('pack_06', 31, 45),
      },
      {
        id: 'digital-art',
        name: '4. Digital Art',
        presetRefs: rangeRefs('pack_06', 46, 60),
      },
      {
        id: 'mixed-media',
        name: '5. Mixed Media',
        presetRefs: rangeRefs('pack_06', 61, 80),
      },
      {
        id: 'retro-game-visual-systems',
        name: '6. Retro Game Visual Systems',
        presetRefs: rangeRefs('pack_06', 81, 100),
      },
      {
        id: 'game-art-directions-and-ui',
        name: '7. Game Art Directions & UI',
        presetRefs: rangeRefs('pack_06', 101, 120),
      },
    ],
  },
  {
    packId: 'pack_08',
    packName: 'Fashion & Costume',
    packSlug: 'fashion-and-costume',
    description:
      'A fashion and costume library spanning contemporary editorial looks, subcultural dress codes, historical silhouettes, character-costume fantasy, and material-forward transformation concepts.',
    categories: [
      {
        id: 'contemporary-fashion',
        name: '1. Contemporary Fashion',
        presetRefs: explicitRefs('pack_08', [1, 3, 5, 10, 16, 17, 18, 19, 20]),
      },
      {
        id: 'subcultures',
        name: '2. Subcultures',
        presetRefs: explicitRefs(
          'pack_08',
          [2, 4, 7, 8, 14, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
        ),
      },
      {
        id: 'historical-and-fantasy',
        name: '3. Historical & Fantasy',
        presetRefs: explicitRefs('pack_08', [11, 12, 31, 32, 33, 34, 35, 36, 37, 38, 39]),
      },
      {
        id: 'fantasy-sci-fi-costume',
        name: '4. Fantasy Sci-Fi Costume',
        presetRefs: explicitRefs(
          'pack_08',
          [6, 9, 13, 15, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 65, 78, 79, 80],
        ),
      },
      {
        id: 'fabric-and-texture-focus',
        name: '5. Fabric & Texture Focus',
        presetRefs: explicitRefs(
          'pack_08',
          [
            51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 66, 67, 68, 69, 70, 71, 72, 73,
            74, 75, 76, 77,
          ],
        ),
      },
    ],
  },
  {
    packId: 'pack_10',
    packName: 'Abstract & Experimental',
    packSlug: 'abstract-and-experimental',
    description:
      'A semantically grouped abstract library covering geometric systems, reactive material flows, glitch-native signal noise, dream-logic image spaces, and pattern- or texture-driven surfaces.',
    categories: [
      {
        id: 'geometric-abstraction',
        name: '1. Geometric Abstraction',
        presetRefs: rangeRefs('pack_10', 1, 10),
      },
      {
        id: 'fluid-and-organic',
        name: '2. Fluid & Organic',
        presetRefs: rangeRefs('pack_10', 11, 20),
      },
      {
        id: 'digital-glitch-and-noise',
        name: '3. Digital Glitch & Noise',
        presetRefs: rangeRefs('pack_10', 21, 30),
      },
      {
        id: 'surrealism-and-dream',
        name: '4. Surrealism & Dream',
        presetRefs: rangeRefs('pack_10', 31, 45),
      },
      {
        id: 'pattern-and-texture',
        name: '5. Pattern & Texture',
        presetRefs: rangeRefs('pack_10', 46, 80),
      },
    ],
  },
  {
    packId: 'pack_12',
    packName: 'Video Game Originals Vault',
    packSlug: 'video-game-originals-vault',
    description:
      'An original game-art vault organized by world fantasy and encounter type, from neon night districts and mech frontiers to sieges, hunting grounds, heists, and final setpiece spaces.',
    categories: [
      {
        id: 'neon-urban-and-night-ops',
        name: '1. Neon Urban & Night Ops',
        presetRefs: explicitRefs('pack_12', [1, 14, 25, 32, 43, 48, 56, 62, 71, 78]),
      },
      {
        id: 'arcane-temples-and-mythic-realms',
        name: '2. Arcane Temples & Mythic Realms',
        presetRefs: explicitRefs('pack_12', [6, 13, 15, 20, 28, 44, 53, 55, 61, 70]),
      },
      {
        id: 'sci-fi-frontiers-and-mech-zones',
        name: '3. Sci-Fi Frontiers & Mech Zones',
        presetRefs: explicitRefs('pack_12', [3, 5, 11, 18, 23, 33, 42, 45, 46, 68]),
      },
      {
        id: 'sieges-warfronts-and-last-stands',
        name: '4. Sieges, Warfronts & Last Stands',
        presetRefs: explicitRefs('pack_12', [7, 9, 26, 35, 38, 52, 60, 64, 76, 79]),
      },
      {
        id: 'speed-sport-and-competitive-arenas',
        name: '5. Speed, Sport & Competitive Arenas',
        presetRefs: explicitRefs('pack_12', [8, 17, 21, 31, 39, 47, 59, 63, 65, 75]),
      },
      {
        id: 'wilderness-hunts-and-harsh-frontiers',
        name: '6. Wilderness Hunts & Harsh Frontiers',
        presetRefs: explicitRefs('pack_12', [2, 10, 22, 27, 29, 34, 40, 41, 67, 73]),
      },
      {
        id: 'heists-horror-and-underworld-runs',
        name: '7. Heists, Horror & Underworld Runs',
        presetRefs: explicitRefs('pack_12', [16, 19, 24, 30, 49, 50, 54, 57, 66, 69]),
      },
      {
        id: 'puzzle-chambers-and-adventure-setpieces',
        name: '8. Puzzle Chambers & Adventure Setpieces',
        presetRefs: explicitRefs('pack_12', [4, 12, 36, 37, 51, 58, 72, 74, 77, 80]),
      },
    ],
  },
];

async function rewritePack(config: PackConfig) {
  const packManifestPath = path.join(packsDir, `${config.packId}.yaml`);
  const pack = yaml.load(await readFile(packManifestPath, 'utf8'));
  if (!isObject(pack)) throw new Error(`${config.packId} manifest is not an object`);

  const presetRefs = Array.isArray(pack.presetRefs) ? (pack.presetRefs as string[]) : [];
  const expected = new Set(presetRefs);
  const categoryRefs = config.categories.flatMap((category) => category.presetRefs);
  const seen = new Set<string>();
  for (const refPath of categoryRefs) {
    if (seen.has(refPath))
      throw new Error(`${config.packId} duplicate ref in categories: ${refPath}`);
    seen.add(refPath);
  }
  if (seen.size !== expected.size) {
    const missing = [...expected].filter((refPath) => !seen.has(refPath));
    const extra = [...seen].filter((refPath) => !expected.has(refPath));
    throw new Error(
      `${config.packId} category coverage mismatch. missing=${missing.join(', ') || 'none'} extra=${extra.join(', ') || 'none'}`,
    );
  }

  const nextPack = {
    ...pack,
    description: config.description ?? pack.description,
    categories: config.categories.map((category) => ({
      id: category.id,
      name: category.name,
      presetRefs: category.presetRefs,
    })),
    presetRefs,
  };

  await writeFile(packManifestPath, dumpYaml(nextPack), 'utf8');

  const categoryByRef = new Map<string, PackCategory>();
  for (const category of config.categories) {
    for (const refPath of category.presetRefs) {
      categoryByRef.set(refPath, category);
    }
  }

  for (const refPath of presetRefs) {
    const presetPath = path.join(presetRoot, refPath);
    const preset = yaml.load(await readFile(presetPath, 'utf8'));
    if (!isObject(preset)) throw new Error(`Preset manifest is not an object: ${refPath}`);
    const category = categoryByRef.get(refPath);
    if (!category) throw new Error(`No category found for ${refPath}`);
    const taxonomy = isObject(preset.taxonomy) ? preset.taxonomy : {};
    const assets = isObject(preset.assets) ? preset.assets : {};
    const supportedTasks = Array.isArray(preset.supportedTasks) ? preset.supportedTasks : [];
    const nextPreset = {
      ...preset,
      category: category.name,
      tags: [config.packSlug, category.id],
      taxonomy: {
        ...taxonomy,
        packId: config.packId,
        packName: config.packName,
        categoryId: category.id,
        categoryName: category.name,
        tags: [config.packSlug, category.id],
        supportedTasks,
        hasDefaultImage: Boolean(assets.defaultImage),
      },
    };
    await writeFile(presetPath, dumpYaml(nextPreset), 'utf8');
  }

  console.log(
    `[${config.packId}] rewrote ${presetRefs.length} presets across ${config.categories.length} categories`,
  );
}

async function renamePack05VisionaryBucket() {
  const packId = 'pack_05';
  const packSlug = 'anime-and-manga-spectrum';
  const packManifestPath = path.join(packsDir, `${packId}.yaml`);
  const pack = yaml.load(await readFile(packManifestPath, 'utf8'));
  if (!isObject(pack)) throw new Error('pack_05 manifest is not an object');
  const currentCategories = Array.isArray(pack.categories) ? pack.categories : [];
  const targetCategory = currentCategories.find(
    (entry) => isObject(entry) && entry.id === 'classic-and-modern-shojo',
  ) as Record<string, unknown> | undefined;
  if (!targetCategory) throw new Error('pack_05 classic-and-modern-shojo category not found');

  const nextName = '4. Shojo, Magical Girl & Visionary Classics';
  const nextId = 'shojo-magical-girl-and-visionary-classics';
  const presetRefs = Array.isArray(targetCategory.presetRefs)
    ? (targetCategory.presetRefs as string[])
    : [];

  const nextCategories = currentCategories.map((entry) => {
    if (!isObject(entry) || entry.id !== 'classic-and-modern-shojo') return entry;
    return {
      ...entry,
      id: nextId,
      name: nextName,
    };
  });

  const nextPack = {
    ...pack,
    categories: nextCategories,
  };
  await writeFile(packManifestPath, dumpYaml(nextPack), 'utf8');

  for (const refPath of presetRefs) {
    const presetPath = path.join(presetRoot, refPath);
    const preset = yaml.load(await readFile(presetPath, 'utf8'));
    if (!isObject(preset)) throw new Error(`Preset manifest is not an object: ${refPath}`);
    const taxonomy = isObject(preset.taxonomy) ? preset.taxonomy : {};
    const assets = isObject(preset.assets) ? preset.assets : {};
    const supportedTasks = Array.isArray(preset.supportedTasks) ? preset.supportedTasks : [];
    const nextPreset = {
      ...preset,
      category: nextName,
      tags: [packSlug, nextId],
      taxonomy: {
        ...taxonomy,
        packId,
        packName: 'Anime & Manga Spectrum',
        categoryId: nextId,
        categoryName: nextName,
        tags: [packSlug, nextId],
        supportedTasks,
        hasDefaultImage: Boolean(assets.defaultImage),
      },
    };
    await writeFile(presetPath, dumpYaml(nextPreset), 'utf8');
  }

  console.log(`[pack_05] renamed visionary shojo bucket across ${presetRefs.length} presets`);
}

for (const config of PACK_CONFIGS) {
  await rewritePack(config);
}

await renamePack05VisionaryBucket();
