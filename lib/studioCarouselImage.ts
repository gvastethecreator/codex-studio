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
  return isComparing && referenceSrc ? referenceSrc : image.preview || image.src;
}

export function resolveStudioCarouselFallbackSrc({
  image,
  displaySrc,
  isComparing,
}: {
  image: GeneratedImageWithConfig;
  displaySrc: string;
  isComparing: boolean;
}) {
  if (isComparing) return null;
  const candidates = [image.thumbnail, image.src].filter(
    (candidate): candidate is string => Boolean(candidate) && candidate !== displaySrc,
  );
  return candidates[0] ?? null;
}
