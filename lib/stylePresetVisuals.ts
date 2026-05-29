export function packIdFromPresetId(presetId: string) {
  const match = presetId.match(/^SP(\d{2})-/i);
  if (!match) return null;
  return `pack_${match[1]}`;
}

export function buildPackFallbackCatalog(defaultImages: Record<string, string>) {
  const fallbackByPack: Record<string, string> = {};
  for (const presetId of Object.keys(defaultImages).sort()) {
    const packId = packIdFromPresetId(presetId);
    if (!packId || fallbackByPack[packId]) continue;
    fallbackByPack[packId] = defaultImages[presetId];
  }
  return fallbackByPack;
}

export function resolveStyleCatalogResultImage({
  presetId,
  packId,
  defaultImages,
  packFallbackImages,
}: {
  presetId: string;
  packId: string;
  defaultImages: Record<string, string>;
  packFallbackImages: Record<string, string>;
}) {
  return defaultImages[presetId] || packFallbackImages[packId];
}

export function resolveStylePreviewImage({
  categoryImage,
  categoryPreviewImage,
  packFallbackImage,
}: {
  categoryImage?: string;
  categoryPreviewImage?: string;
  packFallbackImage?: string;
}) {
  return categoryImage || categoryPreviewImage || packFallbackImage;
}
