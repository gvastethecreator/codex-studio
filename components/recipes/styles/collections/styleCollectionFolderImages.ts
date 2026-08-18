import { styleCategoryImageKey } from '../../../../lib/recipeAssetKeys';
import { getStyleThumbnailCatalog } from '../../../../lib/styleThumbnailCatalog';
import type { StyleCollection, StyleCollectionEntry } from './styleCollectionTypes';

export const STYLE_FOLDER_FILE_LIMIT = 5;

export interface StyleFolderFile {
  id: string;
  src: string | null;
  label: string;
}

export interface StyleFolderImages {
  cover: StyleFolderFile;
  files: StyleFolderFile[];
}

export interface StyleFolderImageCandidate {
  id: string;
  src: string;
  label: string;
}

type StyleThumbnailCatalog = Record<string, string | undefined>;

const PACK_CARD_PRESET_PREFIXES: Record<string, string[]> = {
  pack_16: ['SP05-', 'SP13-'],
};

function getStylePackPresetThumbnailPrefixes(packId: string) {
  const explicitPrefixes = PACK_CARD_PRESET_PREFIXES[packId];
  if (explicitPrefixes) return explicitPrefixes;

  const match = packId.match(/^pack_(\d+)$/);
  return match ? [`SP${match[1].padStart(2, '0')}-`] : [];
}

function formatStyleFolderFileLabel(sourceId: string, key: string, index: number) {
  const rawName = key.startsWith(`${sourceId}__`) ? key.slice(`${sourceId}__`.length) : key;
  const label = rawName
    .replace(/_/g, ' ')
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
    .trim();

  return label || `Style ${index + 1}`;
}

function formatStyleCategoryLabel(categoryName: string) {
  return categoryName.replace(/^\d+\.\s*/, '').trim() || 'Style category';
}

function createFallbackStyleFolderFile(id: string): StyleFolderFile {
  return {
    id: `${id}-fallback`,
    src: null,
    label: 'Style sample',
  };
}

function stableStyleFolderRank(seed: string, id: string) {
  let hash = 2166136261;
  const value = `${seed}:${id}`;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getSourcePackThumbnailFiles(
  sourcePackIds: readonly string[],
  seedId: string,
  thumbnailCatalog: StyleThumbnailCatalog,
) {
  const sourceIds = sourcePackIds.length > 0 ? sourcePackIds : [seedId];
  return sourceIds.flatMap((sourceId) => {
    const presetPrefixes = getStylePackPresetThumbnailPrefixes(sourceId);
    return Object.entries(thumbnailCatalog)
      .filter(([key, src]) => {
        if (!src) return false;
        if (key.startsWith(`${sourceId}__`)) return true;
        return presetPrefixes.some((prefix) => key.startsWith(prefix));
      })
      .map(([key, src], index) => ({
        id: `${sourceId}:${key}`,
        src: src ?? '',
        label: formatStyleFolderFileLabel(sourceId, key, index),
      }));
  });
}

export function getStyleFolderImages({
  seedId,
  sourcePackIds,
  imageCandidates = [],
  thumbnailCatalog = getStyleThumbnailCatalog(),
}: {
  seedId: string;
  sourcePackIds: readonly string[];
  imageCandidates?: readonly StyleFolderImageCandidate[];
  thumbnailCatalog?: StyleThumbnailCatalog;
}): StyleFolderImages {
  const fallbackFile = createFallbackStyleFolderFile(seedId);
  const candidateFiles = imageCandidates.map((candidate) => ({
    id: candidate.id,
    src: candidate.src,
    label: candidate.label,
  }));
  const sourceFiles = getSourcePackThumbnailFiles(sourcePackIds, seedId, thumbnailCatalog);
  const selectedFiles =
    candidateFiles.length > 0
      ? candidateFiles.slice(0, STYLE_FOLDER_FILE_LIMIT + 1)
      : (sourceFiles.length > 0 ? sourceFiles : [fallbackFile])
          .sort(
            (first, second) =>
              stableStyleFolderRank(seedId, first.id) - stableStyleFolderRank(seedId, second.id),
          )
          .slice(0, STYLE_FOLDER_FILE_LIMIT + 1);

  while (selectedFiles.length < STYLE_FOLDER_FILE_LIMIT + 1) {
    selectedFiles.push({
      id: `${seedId}-fallback-${selectedFiles.length}`,
      src: null,
      label: `Style sample ${selectedFiles.length + 1}`,
    });
  }

  return {
    cover: selectedFiles[0] ?? fallbackFile,
    files: selectedFiles.slice(1, STYLE_FOLDER_FILE_LIMIT + 1),
  };
}

export function getStyleCollectionFolderImageCandidates(
  collection: StyleCollection,
  thumbnailCatalog: StyleThumbnailCatalog = getStyleThumbnailCatalog(),
): StyleFolderImageCandidate[] {
  const candidates: StyleFolderImageCandidate[] = [];
  const seen = new Set<string>();

  const addCandidate = (candidate: StyleFolderImageCandidate | null) => {
    if (!candidate || seen.has(candidate.id)) return;
    seen.add(candidate.id);
    candidates.push(candidate);
  };

  const addPreset = (presetId: string, label: string) => {
    const src = thumbnailCatalog[presetId];
    if (!src) return;
    addCandidate({ id: `preset:${presetId}`, src, label });
  };

  const addCategory = (packId: string, categoryName: string) => {
    const key = styleCategoryImageKey(packId, categoryName);
    const src = thumbnailCatalog[key];
    if (!src) return;
    addCandidate({
      id: `category:${key}`,
      src,
      label: formatStyleCategoryLabel(categoryName),
    });
  };

  const addPack = (packId: string) => {
    for (const file of getSourcePackThumbnailFiles([packId], collection.id, thumbnailCatalog).sort(
      (first, second) =>
        stableStyleFolderRank(packId, first.id) - stableStyleFolderRank(packId, second.id),
    )) {
      addCandidate({ id: `pack:${file.id}`, src: file.src ?? '', label: file.label });
    }
  };

  const visitEntry = (entry: StyleCollectionEntry) => {
    if (entry.includeMode === 'exclude') return;

    if (entry.kind === 'manual_group') {
      for (const child of entry.entries ?? []) visitEntry(child);
      return;
    }

    if (entry.kind === 'preset') {
      const presetIds = entry.presetIds ?? (entry.presetId ? [entry.presetId] : []);
      for (const presetId of presetIds) addPreset(presetId, entry.title ?? presetId);
      return;
    }

    if (entry.kind === 'category' && entry.packId && entry.categoryName) {
      addCategory(entry.packId, entry.categoryName);
      return;
    }

    if (entry.kind === 'pack' && entry.packId) {
      addPack(entry.packId);
      return;
    }

    if (entry.kind === 'query') {
      for (const presetId of entry.query?.presetIds ?? []) addPreset(presetId, presetId);
      for (const packId of entry.query?.packIds ?? []) {
        for (const categoryName of entry.query?.categoryNames ?? []) {
          addCategory(packId, categoryName);
        }
      }
    }
  };

  collection.featuredPresetIds?.forEach((presetId, index) => {
    addPreset(presetId, `Featured style ${index + 1}`);
  });
  for (const entry of collection.entries) visitEntry(entry);

  return candidates;
}
