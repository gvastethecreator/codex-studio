import type { GeneratedImageWithConfig } from '../types';

export type ImageGridSortOption = 'desc' | 'asc' | 'prompt' | 'ratio';

export const DEFAULT_THUMBNAIL_SIZE = 176;
export const MIN_THUMBNAIL_SIZE = 144;
export const MAX_THUMBNAIL_SIZE = 320;
export const THUMBNAIL_SIZE_STEP = 8;
export const IMAGE_GRID_COLUMN_GAP = 16;
export const IMAGE_GRID_MAX_COLUMNS = 12;
export const IMAGE_GRID_PRIORITY_VIEWPORT_OVERSCAN_PX = 96;

export function filterImageGridImages(
  images: GeneratedImageWithConfig[],
  showFavoritesOnly: boolean,
) {
  return showFavoritesOnly ? images.filter((image) => image.isFavorite) : images;
}

export function sortImageGridImages(
  images: GeneratedImageWithConfig[],
  sortOrder: ImageGridSortOption,
) {
  return [...images].sort((a, b) => {
    switch (sortOrder) {
      case 'asc':
        return a.createdAt - b.createdAt;
      case 'desc':
        return b.createdAt - a.createdAt;
      case 'prompt':
        return (a.config.prompt || '').localeCompare(b.config.prompt || '');
      case 'ratio':
        return a.config.aspectRatio.localeCompare(b.config.aspectRatio);
      default:
        return 0;
    }
  });
}

export function resolveImageGridColumnCount({
  viewportWidth,
  thumbnailSize,
  itemCount,
  horizontalPadding,
}: {
  viewportWidth: number;
  thumbnailSize: number;
  itemCount: number;
  horizontalPadding?: number;
}) {
  if (viewportWidth < 480) return 1;

  const resolvedHorizontalPadding = horizontalPadding ?? (viewportWidth >= 640 ? 64 : 24);
  const availableWidth = Math.max(MIN_THUMBNAIL_SIZE, viewportWidth - resolvedHorizontalPadding);
  const columnCount = Math.floor(
    (availableWidth + IMAGE_GRID_COLUMN_GAP) / (thumbnailSize + IMAGE_GRID_COLUMN_GAP),
  );
  const cappedColumnCount = Math.max(1, Math.min(IMAGE_GRID_MAX_COLUMNS, columnCount));
  return Math.max(1, Math.min(cappedColumnCount, Math.max(1, itemCount)));
}

export function resolveImageGridTemplateColumns(columnCount: number, thumbnailSize: number) {
  const safeColumnCount = Math.max(1, columnCount);
  if (safeColumnCount === 1) {
    return 'repeat(1, minmax(0, 1fr))';
  }

  return `repeat(${safeColumnCount}, ${thumbnailSize}px)`;
}

export function resolveImageGridAspectRatio(
  image: Pick<GeneratedImageWithConfig, 'config' | 'width' | 'height'>,
) {
  if (
    typeof image.width === 'number' &&
    Number.isFinite(image.width) &&
    image.width > 0 &&
    typeof image.height === 'number' &&
    Number.isFinite(image.height) &&
    image.height > 0
  ) {
    return `${image.width} / ${image.height}`;
  }

  const aspectRatio = image.config.aspectRatio;
  return /^\d+:\d+$/.test(aspectRatio) ? aspectRatio.replace(':', ' / ') : '1 / 1';
}

export function resolveImageGridIntrinsicSize(
  image: Pick<GeneratedImageWithConfig, 'width' | 'height'>,
) {
  if (
    typeof image.width === 'number' &&
    Number.isFinite(image.width) &&
    image.width > 0 &&
    typeof image.height === 'number' &&
    Number.isFinite(image.height) &&
    image.height > 0
  ) {
    return { width: image.width, height: image.height };
  }

  return { width: undefined, height: undefined };
}

export function estimateImageGridItemHeight({
  image,
  thumbnailSize,
}: {
  image: Pick<GeneratedImageWithConfig, 'config' | 'width' | 'height'>;
  thumbnailSize: number;
}) {
  const [width, height] = resolveImageGridAspectRatio(image)
    .split('/')
    .map((part) => Number(part.trim()));
  const ratio = width > 0 && height > 0 ? width / height : 1;
  return thumbnailSize / ratio;
}

export function shouldPriorityLoadImageGridItem({
  estimatedTop,
  viewportHeight,
}: {
  estimatedTop: number;
  viewportHeight: number;
}) {
  const priorityCutoff = Math.max(
    MIN_THUMBNAIL_SIZE * 2,
    viewportHeight + IMAGE_GRID_PRIORITY_VIEWPORT_OVERSCAN_PX,
  );
  return estimatedTop >= 0 && estimatedTop < priorityCutoff;
}
