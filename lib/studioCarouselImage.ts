import type { GeneratedImageWithConfig } from '../types';

export function resolveStudioCarouselImage({
  activeCarouselId,
  modalImage,
  images,
}: {
  activeCarouselId: string | null;
  modalImage: GeneratedImageWithConfig | null;
  images: GeneratedImageWithConfig[];
}) {
  if (!activeCarouselId) return modalImage;
  return images.find((image) => image.id === activeCarouselId) ?? modalImage;
}
