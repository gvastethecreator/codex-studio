export interface CarouselThumbnailWindowItem<T> {
  item: T;
  index: number;
}

export function buildCarouselThumbnailWindow<T>(
  items: T[],
  activeIndex: number,
  radius = 12,
): CarouselThumbnailWindowItem<T>[] {
  if (items.length === 0) return [];

  const windowSize = Math.max(1, radius * 2 + 1);
  if (items.length <= windowSize) {
    return items.map((item, index) => ({ item, index }));
  }

  const clampedActiveIndex = Math.min(Math.max(activeIndex, 0), items.length - 1);
  let start = Math.max(0, clampedActiveIndex - radius);
  let end = Math.min(items.length, clampedActiveIndex + radius + 1);

  if (end - start < windowSize) {
    if (start === 0) {
      end = Math.min(items.length, windowSize);
    } else {
      start = Math.max(0, items.length - windowSize);
    }
  }

  return items.slice(start, end).map((item, offset) => ({
    item,
    index: start + offset,
  }));
}
