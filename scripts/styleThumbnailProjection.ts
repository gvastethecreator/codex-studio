import { styleCategoryImageKey } from '../lib/recipeAssetKeys';

export const STYLE_LANDING_FOLDER_IMAGE_LIMIT = 6;

export function presetIdFromThumbnailAssetKey(key: string) {
  const normalized = key.trim();
  const grokMatch = normalized.match(/^(SP\d{2}-\d+)-grok$/i);
  if (grokMatch) return grokMatch[1];
  const variantMatch = normalized.match(/^(SP\d{2}-\d+)-\d{2}$/i);
  if (variantMatch) return variantMatch[1];
  const exactMatch = normalized.match(/^(SP\d{2}-\d+)$/i);
  return exactMatch?.[1] ?? null;
}

export function packIdFromThumbnailAssetKey(key: string) {
  const presetMatch = key.match(/^SP(\d{2})-/i);
  if (presetMatch) return `pack_${presetMatch[1]}`;
  const packMatch = key.match(/^(pack_\d{2})/i);
  return packMatch?.[1].toLowerCase() ?? null;
}

export function resolveThumbnailAssetPackId(
  key: string,
  packIdByPresetId: ReadonlyMap<string, string>,
) {
  const presetId = presetIdFromThumbnailAssetKey(key);
  if (presetId) {
    return packIdByPresetId.get(presetId) ?? packIdFromThumbnailAssetKey(key);
  }
  return packIdFromThumbnailAssetKey(key);
}

export function categoryImageSuffix(key: string) {
  const separator = key.indexOf('__');
  if (separator < 0) return null;
  const suffix = key.slice(separator + 2).trim();
  return suffix || null;
}

export function selectStyleLandingFolderImageKeys(
  preferredKeys: readonly string[],
  availableKeys: ReadonlySet<string>,
  limit = STYLE_LANDING_FOLDER_IMAGE_LIMIT,
) {
  const selected: string[] = [];
  const seen = new Set<string>();

  for (const key of preferredKeys) {
    if (!availableKeys.has(key) || seen.has(key)) continue;
    seen.add(key);
    selected.push(key);
    if (selected.length >= limit) break;
  }

  return selected;
}

export function collectStyleLandingFolderPreferredKeys({
  featuredPresetIds = [],
  categoryKeys = [],
  presetIds = [],
}: {
  featuredPresetIds?: readonly string[];
  categoryKeys?: readonly string[];
  presetIds?: readonly string[];
}) {
  return [...featuredPresetIds, ...categoryKeys, ...presetIds];
}

export function neededCategoryImageKey(packId: string, categoryName: string) {
  return styleCategoryImageKey(packId, categoryName);
}

export function groupThumbnailPackIds(packIds: readonly string[], packGroupSize = 1) {
  const size = Math.max(1, Math.floor(packGroupSize));
  return Array.from({ length: Math.ceil(packIds.length / size) }, (_, index) =>
    packIds.slice(index * size, index * size + size),
  );
}

export function isGeneratedThumbnailModuleStale({
  actual,
  referencedFiles,
  isIndex,
}: {
  actual: string;
  referencedFiles: readonly string[];
  isIndex: boolean;
}) {
  const referenceCount = isIndex
    ? (actual.match(/=>\s*import\(/g) ?? []).length
    : (actual.match(/new URL\(/g) ?? []).length;
  return (
    referenceCount !== referencedFiles.length ||
    referencedFiles.some((reference) => !actual.includes(reference))
  );
}

export function isLandingFolderIndexStale({
  actual,
  expectedIds,
  expectedCounts,
}: {
  actual: string;
  expectedIds: readonly string[];
  expectedCounts: readonly string[];
}) {
  return (
    !actual.includes('STYLE_LANDING_FOLDER_SUMMARIES_BY_ID') ||
    expectedIds.some((id) => !actual.includes(id)) ||
    expectedCounts.some((count) => !actual.includes(count))
  );
}
