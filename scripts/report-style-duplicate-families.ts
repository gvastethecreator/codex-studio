import { loadStyleRuntimePacks } from '../components/recipes/stylesData';
import type {
  StyleRuntimePack,
  StyleRuntimePreset,
} from '../components/recipes/styles/runtimeTypes';

export type StyleDuplicateFamilyKind = 'seed_family' | 'normalized_name';
export type StyleDuplicateFamilyClassification =
  | 'exact_duplicate_candidate'
  | 'useful_variant_family'
  | 'false_positive_candidate';

export interface StyleDuplicatePresetRef {
  id: string;
  name: string;
  packId: string;
  packName: string;
  category: string;
}

export interface StyleDuplicateFamily {
  id: string;
  label: string;
  kind: StyleDuplicateFamilyKind;
  reviewHint: 'likely_variant_family' | 'exact_name_candidate';
  review: StyleDuplicateFamilyReview;
  presets: StyleDuplicatePresetRef[];
}

export interface StyleDuplicateFamilyReport {
  totalPacks: number;
  totalPresets: number;
  classificationCounts: Record<StyleDuplicateFamilyClassification, number>;
  families: StyleDuplicateFamily[];
}

export interface StyleDuplicateFamilyReview {
  classification: StyleDuplicateFamilyClassification;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  nextAction: string;
}

interface DuplicateFamilySeed {
  id: string;
  label: string;
  aliases: string[];
}

const FAMILY_SEEDS: DuplicateFamilySeed[] = [
  { id: 'golden-hour', label: 'Golden Hour', aliases: ['golden hour'] },
  { id: 'blue-hour', label: 'Blue Hour', aliases: ['blue hour'] },
  { id: 'rembrandt-lighting', label: 'Rembrandt Lighting', aliases: ['rembrandt'] },
  { id: 'split-lighting', label: 'Split Lighting', aliases: ['split lighting'] },
  { id: 'butterfly-lighting', label: 'Butterfly Lighting', aliases: ['butterfly lighting'] },
  { id: 'candlelight', label: 'Candlelight', aliases: ['candlelight', 'candle light'] },
  { id: 'neon-noir', label: 'Neon Noir', aliases: ['neon noir'] },
  { id: 'god-rays', label: 'God Rays', aliases: ['god rays', 'crepuscular rays'] },
  { id: 'rim-lighting', label: 'Rim Lighting', aliases: ['rim light', 'rim lighting'] },
  { id: 'silhouette', label: 'Silhouette', aliases: ['silhouette'] },
  { id: 'wet-plate', label: 'Wet Plate Collodion', aliases: ['wet plate', 'collodion'] },
  { id: 'pinhole', label: 'Pinhole Camera', aliases: ['pinhole'] },
  { id: 'disposable-camera', label: 'Disposable Camera', aliases: ['disposable camera'] },
  { id: 'infrared-film', label: 'Infrared Film', aliases: ['infrared film', 'aerochrome'] },
  { id: 'kodachrome', label: 'Kodachrome', aliases: ['kodachrome'] },
  { id: 'polaroid', label: 'Polaroid', aliases: ['polaroid'] },
  { id: 'cyanotype', label: 'Cyanotype', aliases: ['cyanotype'] },
  { id: 'etching', label: 'Etching', aliases: ['etching'] },
  { id: 'screenprint', label: 'Screenprint', aliases: ['screenprint', 'screen print'] },
  { id: 'monotype', label: 'Monotype', aliases: ['monotype'] },
  { id: 'mezzotint', label: 'Mezzotint', aliases: ['mezzotint'] },
  { id: 'aquatint', label: 'Aquatint', aliases: ['aquatint'] },
  { id: 'ballpoint-pen', label: 'Ballpoint Pen', aliases: ['ballpoint'] },
  { id: 'colored-pencil', label: 'Colored Pencil', aliases: ['colored pencil', 'coloured pencil'] },
  { id: 'scratchboard', label: 'Scratchboard', aliases: ['scratchboard'] },
  { id: 'rubber-stamp', label: 'Rubber Stamp', aliases: ['rubber stamp'] },
  { id: 'carbon-fiber', label: 'Carbon Fiber', aliases: ['carbon fiber', 'carbon fibre'] },
  { id: 'porcelain', label: 'Porcelain', aliases: ['porcelain'] },
  { id: 'gold-leaf', label: 'Gold Leaf', aliases: ['gold leaf'] },
  { id: 'bubble-wrap', label: 'Bubble Wrap', aliases: ['bubble wrap'] },
  { id: 'chainmail', label: 'Chainmail', aliases: ['chainmail', 'chain mail'] },
  { id: 'velcro', label: 'Velcro', aliases: ['velcro'] },
  { id: 'sequins', label: 'Sequins', aliases: ['sequins', 'sequin'] },
  { id: 'sandpaper', label: 'Sandpaper', aliases: ['sandpaper'] },
  { id: 'sponge', label: 'Sponge', aliases: ['sponge'] },
  { id: 'slime-goo', label: 'Slime/Goo', aliases: ['slime', 'goo'] },
  { id: 'x-ray', label: 'X-Ray', aliases: ['x-ray', 'x ray'] },
  { id: 'thermal', label: 'Thermal Camera / Thermal Vision', aliases: ['thermal'] },
  { id: 'cctv-security', label: 'CCTV / Security', aliases: ['cctv', 'security camera'] },
  { id: 'microscope', label: 'Microscope', aliases: ['microscope', 'electron microscope'] },
  { id: 'ascii-art', label: 'ASCII Art', aliases: ['ascii'] },
  { id: 'low-poly', label: 'Low Poly', aliases: ['low poly', 'low-poly'] },
  { id: 'voxel-art', label: 'Voxel Art', aliases: ['voxel'] },
  { id: 'stained-glass', label: 'Stained Glass', aliases: ['stained glass'] },
  { id: 'blueprint', label: 'Blueprint', aliases: ['blueprint'] },
  { id: 'circuit-board', label: 'Circuit Board', aliases: ['circuit board'] },
  { id: 'sticker-art', label: 'Sticker Art', aliases: ['sticker'] },
  { id: 'tattoo-flash', label: 'Tattoo Flash', aliases: ['tattoo flash'] },
  { id: 'solarpunk', label: 'Solarpunk', aliases: ['solarpunk'] },
] as const;

const NAME_STOP_WORDS = new Set([
  'and',
  'camera',
  'cameras',
  'style',
  'styles',
  'look',
  'looks',
  'photo',
  'photography',
  'the',
]);

const MANUAL_FAMILY_REVIEWS = new Map<string, StyleDuplicateFamilyReview>([
  [
    'seed:slime-goo',
    {
      classification: 'false_positive_candidate',
      confidence: 'medium',
      reason:
        'Shared slime/goo wording mixes material presets with a genre/world motif entry; split before assigning a family id.',
      nextAction:
        'Keep material presets together only after preview; exclude narrative motif entries.',
    },
  ],
  [
    'seed:sticker-art',
    {
      classification: 'false_positive_candidate',
      confidence: 'medium',
      reason:
        'Shared sticker wording mixes reusable sticker art with a location/scene preset; treat the scene as a collision.',
      nextAction: 'Review sticker art presets separately from sticker-bomb environment presets.',
    },
  ],
  [
    'name:graffiti',
    {
      classification: 'useful_variant_family',
      confidence: 'high',
      reason: 'Same pack contains intentional graffiti substyles rather than duplicate labels.',
      nextAction: 'Keep as siblings if previews preserve tag vs piece distinction.',
    },
  ],
  [
    'name:manga',
    {
      classification: 'useful_variant_family',
      confidence: 'high',
      reason: 'Same pack contains explicit shonen and shojo variants.',
      nextAction: 'Keep as siblings and use collection/facet grouping instead of merge.',
    },
  ],
]);

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function createNameKey(name: string) {
  return normalizeText(name)
    .split(' ')
    .filter((token) => token && !NAME_STOP_WORDS.has(token) && !/^\d+$/.test(token))
    .join(' ');
}

function createSeedSearchText(preset: StyleRuntimePreset) {
  return normalizeText(preset.name);
}

function flattenPacks(packs: StyleRuntimePack[]): StyleDuplicatePresetRef[] {
  return packs.flatMap((pack) =>
    pack.presets.map((preset) => ({
      id: preset.id,
      name: preset.name,
      packId: pack.id,
      packName: pack.name,
      category: preset.category ?? 'General',
    })),
  );
}

function presetRefKey(preset: StyleDuplicatePresetRef) {
  return `${preset.packId}:${preset.id}`;
}

function sortPresetRefs(first: StyleDuplicatePresetRef, second: StyleDuplicatePresetRef) {
  return (
    first.packId.localeCompare(second.packId) ||
    first.category.localeCompare(second.category) ||
    first.id.localeCompare(second.id)
  );
}

function aliasMatches(searchText: string, alias: string) {
  const normalizedAlias = normalizeText(alias);
  return new RegExp(`(^| )${normalizedAlias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}( |$)`).test(
    searchText,
  );
}

function createSeedFamilies(packs: StyleRuntimePack[]): StyleDuplicateFamily[] {
  const presets = flattenPacks(packs);
  const searchTextByKey = new Map<string, string>();
  for (const pack of packs) {
    for (const preset of pack.presets) {
      searchTextByKey.set(`${pack.id}:${preset.id}`, createSeedSearchText(preset));
    }
  }

  return FAMILY_SEEDS.flatMap((seed) => {
    const matched = presets
      .filter((preset) => {
        const searchText = searchTextByKey.get(presetRefKey(preset)) ?? '';
        return seed.aliases.some((alias) => aliasMatches(searchText, alias));
      })
      .sort(sortPresetRefs);

    if (matched.length < 2) return [];
    return [
      withFamilyReview({
        id: `seed:${seed.id}`,
        label: seed.label,
        kind: 'seed_family',
        reviewHint: 'likely_variant_family',
        presets: matched,
      }),
    ];
  });
}

function createNormalizedNameFamilies(packs: StyleRuntimePack[]): StyleDuplicateFamily[] {
  const groups = new Map<string, StyleDuplicatePresetRef[]>();
  for (const preset of flattenPacks(packs)) {
    const key = createNameKey(preset.name);
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), preset]);
  }

  return [...groups.entries()]
    .filter(([, presets]) => presets.length >= 2)
    .map(([key, presets]) =>
      withFamilyReview({
        id: `name:${key.replace(/\s+/g, '-')}`,
        label: key
          .split(' ')
          .map((token) => token.slice(0, 1).toUpperCase() + token.slice(1))
          .join(' '),
        kind: 'normalized_name',
        reviewHint: 'exact_name_candidate',
        presets: presets.sort(sortPresetRefs),
      }),
    );
}

function parentheticalVariants(name: string) {
  return [...name.matchAll(/\(([^)]+)\)/g)].map((match) => normalizeText(match[1] ?? ''));
}

function uniqueValues(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function inferFamilyReview(
  family: Omit<StyleDuplicateFamily, 'review'>,
): StyleDuplicateFamilyReview {
  const manualReview = MANUAL_FAMILY_REVIEWS.get(family.id);
  if (manualReview) return manualReview;

  const nameKeys = uniqueValues(family.presets.map((preset) => createNameKey(preset.name)));
  const packIds = uniqueValues(family.presets.map((preset) => preset.packId));
  const parentheticalValues = uniqueValues(
    family.presets.flatMap((preset) => parentheticalVariants(preset.name)),
  );
  const sameNormalizedPromise = nameKeys.length === 1;
  const sameSourcePack = packIds.length === 1;
  const hasDivergentParentheticalVariants = parentheticalValues.length > 1;

  if (sameSourcePack) {
    return {
      classification: 'useful_variant_family',
      confidence: 'high',
      reason:
        'Candidates live in the same source pack, so repeated wording usually marks curated siblings.',
      nextAction: 'Keep siblings unless preview evidence shows redundant output.',
    };
  }

  if (sameNormalizedPromise && !hasDivergentParentheticalVariants) {
    return {
      classification: 'exact_duplicate_candidate',
      confidence: family.kind === 'normalized_name' ? 'high' : 'medium',
      reason: 'Same normalized style promise appears across source packs.',
      nextAction: 'Generate side-by-side previews before merge, alias, or family-id assignment.',
    };
  }

  if (family.kind === 'normalized_name' && !hasDivergentParentheticalVariants) {
    return {
      classification: 'exact_duplicate_candidate',
      confidence: 'medium',
      reason:
        'Names normalize to the same label, but source categories may carry different intent.',
      nextAction: 'Preview before deciding whether to merge or keep as collection siblings.',
    };
  }

  return {
    classification: 'useful_variant_family',
    confidence: 'medium',
    reason:
      'Shared family wording spans different packs, categories, media, or explicit modifiers.',
    nextAction:
      'Prefer family grouping and provenance chips over merging until previews prove redundancy.',
  };
}

function withFamilyReview(family: Omit<StyleDuplicateFamily, 'review'>): StyleDuplicateFamily {
  return { ...family, review: inferFamilyReview(family) };
}

function compareFamilies(first: StyleDuplicateFamily, second: StyleDuplicateFamily) {
  return (
    second.presets.length - first.presets.length ||
    first.kind.localeCompare(second.kind) ||
    first.label.localeCompare(second.label)
  );
}

export function createStyleDuplicateFamilyReport(
  packs: StyleRuntimePack[],
): StyleDuplicateFamilyReport {
  const seedFamilies = createSeedFamilies(packs);
  const seedFamilySignatures = new Set(
    seedFamilies.map((family) => family.presets.map(presetRefKey).sort().join('|')),
  );
  const normalizedNameFamilies = createNormalizedNameFamilies(packs).filter(
    (family) => !seedFamilySignatures.has(family.presets.map(presetRefKey).sort().join('|')),
  );

  const families = [...seedFamilies, ...normalizedNameFamilies].sort(compareFamilies);
  const classificationCounts = {
    exact_duplicate_candidate: 0,
    useful_variant_family: 0,
    false_positive_candidate: 0,
  } satisfies Record<StyleDuplicateFamilyClassification, number>;
  for (const family of families) {
    classificationCounts[family.review.classification] += 1;
  }

  return {
    totalPacks: packs.length,
    totalPresets: packs.reduce((total, pack) => total + pack.presets.length, 0),
    classificationCounts,
    families,
  };
}

function formatPresetList(presets: StyleDuplicatePresetRef[], limit: number) {
  const visible = presets.slice(0, limit).map((preset) => {
    return `${preset.id} (${preset.packId}, ${preset.category}) ${preset.name}`;
  });
  if (presets.length > limit) visible.push(`...${presets.length - limit} more`);
  return visible.join('<br>');
}

export function formatStyleDuplicateFamilyReportMarkdown({
  report,
  familyLimit = 40,
  presetLimit = 8,
}: {
  report: StyleDuplicateFamilyReport;
  familyLimit?: number;
  presetLimit?: number;
}) {
  const lines = [
    '# Style Duplicate Family Report',
    '',
    'Non-destructive candidate report. Do not merge, archive, or assign `styleFamilyId` from this output without preview review.',
    '',
    `- Source packs: ${report.totalPacks}`,
    `- Presets scanned: ${report.totalPresets}`,
    `- Candidate families: ${report.families.length}`,
    `- Exact duplicate candidates: ${report.classificationCounts.exact_duplicate_candidate}`,
    `- Useful variant families: ${report.classificationCounts.useful_variant_family}`,
    `- False-positive candidates: ${report.classificationCounts.false_positive_candidate}`,
    '',
    '| Family | Kind | Classification | Confidence | Count | Presets |',
    '| --- | --- | --- | --- | ---: | --- |',
  ];

  for (const family of report.families.slice(0, familyLimit)) {
    lines.push(
      `| ${family.label} | ${family.kind} | ${family.review.classification} | ${family.review.confidence} | ${family.presets.length} | ${formatPresetList(family.presets, presetLimit)} |`,
    );
  }

  if (report.families.length > familyLimit) {
    lines.push(`| ... | ... | ... | ${report.families.length - familyLimit} more families | ... |`);
  }

  lines.push('');
  lines.push('## Next Review');
  lines.push('');
  lines.push('- Treat classification as triage, not a merge decision.');
  lines.push('- Use generated preview evidence before any merge/archive decision.');
  lines.push('- Add `styleFamilyId` only after review stabilizes.');

  return `${lines.join('\n')}\n`;
}

function argValue(name: string) {
  return process.argv
    .find((arg) => arg.startsWith(`--${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');
}

function numberArgValue(name: string) {
  const value = argValue(name);
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

if (import.meta.main) {
  const packs = await loadStyleRuntimePacks();
  const report = createStyleDuplicateFamilyReport(packs);
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(
      formatStyleDuplicateFamilyReportMarkdown({
        report,
        familyLimit: numberArgValue('family-limit') ?? 40,
        presetLimit: numberArgValue('preset-limit') ?? 8,
      }),
    );
  }
}
