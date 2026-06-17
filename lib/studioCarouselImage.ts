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

export function resolveStudioCarouselDisplaySrc({
  image,
  isComparing,
}: {
  image: GeneratedImageWithConfig;
  isComparing: boolean;
}) {
  const referenceSrc = image.config.attachments?.[0]?.dataUrl;
  return isComparing && referenceSrc ? referenceSrc : image.src;
}
