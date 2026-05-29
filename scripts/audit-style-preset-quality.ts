import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

const defaultRootDir = process.cwd();
const presetsRepoDir = path.join('components', 'recipes', 'styles', 'manifests', 'presets');

interface PresetManifestLike {
  id?: string;
  packId?: string;
  name?: string;
  category?: string;
  visualDna?: Record<string, unknown>;
}

interface PresetQualityRow {
  id: string;
  packId: string;
  name: string;
  category: string;
  filePath: string;
  aesthetic: string;
  cameraAndComposition: string;
  atmosphereAndMood: string;
}

interface RedundancyPair {
  packId: string;
  left: string;
  right: string;
  score: number;
  nameScore: number;
  aestheticScore: number;
  cameraScore: number;
  atmosphereScore: number;
}

interface PackCoverage {
  packId: string;
  presets: number;
  categories: number;
}

function argValue(name: string) {
  return process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
}

function parseThreshold() {
  const raw = Number(argValue('threshold') ?? '0.84');
  if (!Number.isFinite(raw)) return 0.84;
  return Math.min(0.95, Math.max(0.45, raw));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value: string) {
  const stopWords = new Set([
    'the',
    'and',
    'with',
    'for',
    'from',
    'into',
    'that',
    'this',
    'very',
    'dark',
    'light',
    'scene',
    'image',
    'style',
    'high',
    'low',
    'de',
    'la',
    'el',
    'y',
    'con',
    'para',
    'una',
    'un',
    'mythic',
    'noir',
    'solarpunk',
    'dreamscapes',
    'vault',
    'curated',
    'elegant',
    'futuristic',
    'community',
  ]);
  return new Set(
    normalizeText(value)
      .split(' ')
      .filter((token) => token.length >= 3 && !stopWords.has(token)),
  );
}

function jaccardScore(left: string, right: string) {
  const a = tokenize(left);
  const b = tokenize(right);
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function getVisualDnaValue(visualDna: Record<string, unknown> | undefined, keys: string[]) {
  if (!visualDna) return '';
  for (const key of keys) {
    const value = visualDna[key];
    if (isNonEmptyString(value)) return value.trim();
  }
  return '';
}

async function listPresetFiles(rootDir: string) {
  const baseDir = path.join(rootDir, presetsRepoDir);
  const packEntries = await readdir(baseDir, { withFileTypes: true });
  const files: string[] = [];

  for (const packEntry of packEntries) {
    if (!packEntry.isDirectory()) continue;
    const packDir = path.join(baseDir, packEntry.name);
    const presetEntries = await readdir(packDir, { withFileTypes: true });
    for (const presetEntry of presetEntries) {
      if (!presetEntry.isFile() || !presetEntry.name.endsWith('.yaml')) continue;
      files.push(path.join(packDir, presetEntry.name));
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
}

async function loadQualityRows(rootDir: string) {
  const rows: PresetQualityRow[] = [];
  for (const filePath of await listPresetFiles(rootDir)) {
    const manifest = yaml.load(await readFile(filePath, 'utf8')) as PresetManifestLike;
    if (
      !isNonEmptyString(manifest.id) ||
      !isNonEmptyString(manifest.packId) ||
      !isNonEmptyString(manifest.name) ||
      !isNonEmptyString(manifest.category)
    ) {
      continue;
    }

    rows.push({
      id: manifest.id,
      packId: manifest.packId,
      name: manifest.name,
      category: manifest.category,
      filePath: path.relative(rootDir, filePath).replace(/\\/g, '/'),
      aesthetic: getVisualDnaValue(manifest.visualDna, ['aesthetic']),
      cameraAndComposition: getVisualDnaValue(manifest.visualDna, [
        'camera_and_composition',
        'spatial_distortion',
      ]),
      atmosphereAndMood: getVisualDnaValue(manifest.visualDna, ['atmosphere_and_mood', 'atmosphere']),
    });
  }
  return rows;
}

function createCoverage(rows: PresetQualityRow[]): PackCoverage[] {
  const byPack = new Map<string, { presets: number; categories: Set<string> }>();

  for (const row of rows) {
    const entry = byPack.get(row.packId) ?? { presets: 0, categories: new Set<string>() };
    entry.presets += 1;
    entry.categories.add(row.category);
    byPack.set(row.packId, entry);
  }

  return [...byPack.entries()]
    .map(([packId, value]) => ({
      packId,
      presets: value.presets,
      categories: value.categories.size,
    }))
    .sort((a, b) => a.packId.localeCompare(b.packId));
}

function createRedundancyPairs(rows: PresetQualityRow[], threshold: number) {
  const pairs: RedundancyPair[] = [];
  const rowsByPack = new Map<string, PresetQualityRow[]>();

  for (const row of rows) {
    const packRows = rowsByPack.get(row.packId) ?? [];
    packRows.push(row);
    rowsByPack.set(row.packId, packRows);
  }

  for (const [packId, packRows] of rowsByPack.entries()) {
    for (let i = 0; i < packRows.length; i += 1) {
      for (let j = i + 1; j < packRows.length; j += 1) {
        const left = packRows[i];
        const right = packRows[j];

        const aestheticScore = jaccardScore(left.aesthetic, right.aesthetic);
        const cameraScore = jaccardScore(left.cameraAndComposition, right.cameraAndComposition);
        const atmosphereScore = jaccardScore(left.atmosphereAndMood, right.atmosphereAndMood);
        const nameScore = jaccardScore(left.name, right.name);
        const score = aestheticScore * 0.45 + cameraScore * 0.3 + atmosphereScore * 0.25;

        const sameCategory = left.category === right.category;
        const crossCategoryMatch =
          score >= Math.max(0.92, threshold + 0.08) &&
          aestheticScore >= 0.7 &&
          nameScore >= 0.28;

        const isStrongMatch =
          score >= threshold &&
          aestheticScore >= 0.58 &&
          nameScore >= 0.18 &&
          (cameraScore >= 0.42 || atmosphereScore >= 0.42) &&
          (sameCategory || crossCategoryMatch);

        if (isStrongMatch) {
          pairs.push({
            packId,
            left: `${left.id} (${left.name})`,
            right: `${right.id} (${right.name})`,
            score,
            nameScore,
            aestheticScore,
            cameraScore,
            atmosphereScore,
          });
        }
      }
    }
  }

  return pairs.sort((a, b) => b.score - a.score);
}

const threshold = parseThreshold();
const asJson = process.argv.includes('--json');
const verifyOnly = process.argv.includes('--verify');

const rows = await loadQualityRows(defaultRootDir);
const coverage = createCoverage(rows);
const pairs = createRedundancyPairs(rows, threshold);

if (asJson) {
  console.log(
    JSON.stringify(
      {
        threshold,
        presetCount: rows.length,
        coverage,
        redundantPairs: pairs,
      },
      null,
      2,
    ),
  );
} else {
  console.log(`[styles:quality] presets=${rows.length} threshold=${threshold.toFixed(2)}`);
  for (const pack of coverage) {
    console.log(
      `[styles:quality] coverage ${pack.packId} presets=${pack.presets} categories=${pack.categories}`,
    );
  }

  if (pairs.length === 0) {
    console.log('[styles:quality] redundancy: none above threshold');
  } else {
    console.log(`[styles:quality] redundancy pairs=${pairs.length}`);
    for (const pair of pairs.slice(0, 30)) {
      console.log(
        `- ${pair.packId} | score=${pair.score.toFixed(2)} | ${pair.left} <> ${pair.right} | name=${pair.nameScore.toFixed(2)} aesthetic=${pair.aestheticScore.toFixed(2)} camera=${pair.cameraScore.toFixed(2)} atmosphere=${pair.atmosphereScore.toFixed(2)}`,
      );
    }
  }
}

if (verifyOnly && pairs.length > 0) {
  process.exitCode = 1;
}
