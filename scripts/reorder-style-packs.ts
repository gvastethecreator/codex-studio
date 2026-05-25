import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import type { StylePack, StylePresetDef } from '../components/recipes/styles/types';

const packsDir = path.join(process.cwd(), 'components', 'recipes', 'styles', 'packs');
const defaultsDir = path.join(process.cwd(), 'assets', 'recipes', 'styles', 'defaults');

const categoryOrderByPack: Record<string, string[]> = {
  pack_01: [
    'Portrait Styles',
    'Lighting',
    'Film Stocks',
    'Genres',
    'Camera Types',
  ],
  pack_02: [
    'Film Genres',
    'TV & Broadcast',
    'Animation Styles',
    'Lighting & Atmosphere',
    'Photography Eras',
    'Caricature & Cartoon Styles',
  ],
  pack_03: [
    'Materials',
    'Lighting & Atmosphere',
    '3D Styles',
    'Applications',
    'Render Engines',
  ],
  pack_04: [
    'Comic Book Styles',
    "Children's Illustration",
    'Editorial & Poster',
    'Concept Art',
    'Ink & Print',
  ],
  pack_05: [
    'Modern Shonen & Action',
    '2000s Classics',
    '90s Golden Era',
    'Classic & Modern Shojo',
    'Slice of Life & Moe',
    'Sports, Competition & Performance',
    'Mecha & Cyberpunk',
    'Isekai & High Fantasy',
    'Dark Fantasy & Seinen',
    'Studio Masterpieces',
    '70s & 80s Retro Anime',
    'Anime Style Spectrum',
  ],
  pack_06: [
    'Digital Art',
    'Traditional Painting',
    'Drawing & Sketching',
    'Mixed Media',
    'Printmaking',
    'Video Game & Pixel Art Styles',
  ],
  pack_07: [
    'Interior Design',
    'Architectural Styles',
    'Environment',
    'Landscape Architecture',
    'Fantasy Architecture',
  ],
  pack_08: [
    'Contemporary Fashion',
    'Historical & Fantasy',
    'Subcultures',
    'Fabric & Texture Focus',
    'Fantasy/Sci-Fi Costume',
  ],
  pack_09: [
    'Natural Materials',
    'Man-Made Materials',
    'Tactile Surfaces',
    'Weathering & Decay',
    'Elemental & FX',
  ],
  pack_10: [
    'Geometric Abstraction',
    'Fluid & Organic',
    'Pattern & Texture',
    'Surrealism & Dream',
    'Digital Glitch & Noise',
  ],
  pack_11: [
    'Food & Drink',
    'Toys & Crafts',
    'Artistic Mediums',
    'Aesthetics',
    'Micro/Macro',
  ],
};

const raritySignals: Array<[RegExp, number]> = [
  [/\b(thermal|x-?ray|night-vision|heat-signature|ansi|wireframe|vector|voxel|flipnote|vectrex)\b/i, 90],
  [/\b(gore|guro|visceral|grotesque|body-horror|arterial|bone|dismember|surgical)\b/i, 80],
  [/\b(callout|orthographic|blueprint|wireframe|hud|ui\/hud|comparison|chart|sheet|massing|map|dimension)\b/i, 65],
  [/\b(glitch|surreal|dream|abstract|experimental|psychedelic|macro|micro|elemental|fx|decay)\b/i, 55],
  [/\b(doodle|scribble|cave painting|napkin|crayon|punk zine|whiteboard|kindergarten|newspaper funnies)\b/i, 50],
  [/\b(retro|vintage|old-school|silent|noir|western|woodblock|sumi-e|stained-glass)\b/i, 28],
  [/\b(fantasy|isekai|mecha|cyberpunk|gothic|cathedral|monster|creature)\b/i, 22],
  [/\b(material|texture|foliage|anatomy|weapon tier|composition thumbnail)\b/i, 18],
];

const commonSignals: Array<[RegExp, number]> = [
  [/\b(portrait|contemporary|modern|digital art|realism|realistic|cinematic|editorial|studio|interior|fashion)\b/i, -40],
  [/\b(classic|action|shonen|romance|shojo|slice of life|food|drink|comic|children|film genres)\b/i, -30],
  [/\b(lighting|materials|architectural|environment|painting|drawing|sketching|photography)\b/i, -18],
  [/\b(clean|practical|production|mainstream|hero|basic|standard)\b/i, -12],
];

function stripCategoryPrefix(category: string) {
  return category.replace(/^\d+\.\s*/, '').trim();
}

function presetSearchText(preset: StylePresetDef) {
  return [
    preset.name,
    preset.category,
    preset.negativePrompt,
    ...Object.values(preset.style).filter((value) => typeof value === 'string'),
  ]
    .join(' ')
    .toLowerCase();
}

function scorePreset(preset: StylePresetDef) {
  const text = presetSearchText(preset);
  let score = 0;
  for (const [pattern, weight] of raritySignals) {
    if (pattern.test(text)) score += weight;
  }
  for (const [pattern, weight] of commonSignals) {
    if (pattern.test(text)) score += weight;
  }
  return score;
}

function sortPresets(presets: StylePresetDef[]) {
  return presets
    .map((preset, index) => ({ preset, index, score: scorePreset(preset) }))
    .sort((left, right) => left.score - right.score || left.index - right.index)
    .map((entry) => entry.preset);
}

function syncPack(pack: StylePack) {
  const categoryOrder = categoryOrderByPack[pack.id];
  if (!categoryOrder) {
    throw new Error(`Missing category order for ${pack.id}`);
  }

  const groups = new Map<string, StylePresetDef[]>();
  for (const preset of pack.presets) {
    const baseCategory = stripCategoryPrefix(preset.category || 'General');
    if (!groups.has(baseCategory)) groups.set(baseCategory, []);
    groups.get(baseCategory)!.push(preset);
  }

  const actualCategories = Array.from(groups.keys()).sort();
  const expectedCategories = [...categoryOrder].sort();
  if (JSON.stringify(actualCategories) !== JSON.stringify(expectedCategories)) {
    throw new Error(
      `Category mismatch for ${pack.id}\nactual=${actualCategories.join(', ')}\nexpected=${expectedCategories.join(', ')}`,
    );
  }

  const reordered: StylePresetDef[] = [];
  const categoryByPresetId = new Map<string, string>();
  categoryOrder.forEach((categoryName, index) => {
    const numberedCategory = `${index + 1}. ${categoryName}`;
    const presets = sortPresets(groups.get(categoryName) || []);
    for (const preset of presets) {
      const nextPreset = { ...preset, category: numberedCategory };
      reordered.push(nextPreset);
      categoryByPresetId.set(nextPreset.id, numberedCategory);
    }
  });

  return {
    pack: { ...pack, presets: reordered },
    categoryByPresetId,
  };
}

async function syncJsonMetadata(
  filePath: string,
  categoryByPresetId: Map<string, string>,
  packName: string,
) {
  try {
    const parsed = JSON.parse(await readFile(filePath, 'utf8'));
    if (!Array.isArray(parsed)) return;
    let changed = false;
    for (const entry of parsed) {
      if (!entry || typeof entry !== 'object') continue;
      const presetId = typeof entry.presetId === 'string' ? entry.presetId : null;
      if (!presetId) continue;
      const nextCategory = categoryByPresetId.get(presetId);
      if (nextCategory && entry.category !== nextCategory) {
        entry.category = nextCategory;
        changed = true;
      }
      if (entry.packName !== packName) {
        entry.packName = packName;
        changed = true;
      }
    }
    if (changed) {
      await writeFile(filePath, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');
    }
  } catch {
    // Ignore missing or malformed metadata files; the YAML reorder is the source of truth.
  }
}

async function main() {
  const files = (await readdir(packsDir)).filter((file) => file.endsWith('.yaml')).sort();
  for (const file of files) {
    const fullPath = path.join(packsDir, file);
    const parsed = yaml.load(await readFile(fullPath, 'utf8')) as StylePack[];
    const rewrittenPacks: StylePack[] = [];

    for (const pack of parsed) {
      const { pack: syncedPack, categoryByPresetId } = syncPack(pack);
      rewrittenPacks.push(syncedPack);

      await syncJsonMetadata(
        path.join(defaultsDir, `manifest-${pack.id}.json`),
        categoryByPresetId,
        syncedPack.name,
      );
      await syncJsonMetadata(
        path.join(defaultsDir, `failures-${pack.id}.json`),
        categoryByPresetId,
        syncedPack.name,
      );
    }

    const dumped = yaml.dump(rewrittenPacks, {
      noRefs: true,
      lineWidth: -1,
      sortKeys: false,
    });
    await writeFile(fullPath, dumped, 'utf8');
  }
}

await main();
