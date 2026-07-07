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
  failedDisplaySrcs = [],
}: {
  image: GeneratedImageWithConfig;
  isComparing: boolean;
  failedDisplaySrcs?: string[];
}) {
  const referenceSrc = image.config.attachments?.[0]?.dataUrl;
  const candidates = resolveStudioCarouselDisplayCandidates({ image, isComparing });
  return candidates.find((candidate) => !failedDisplaySrcs.includes(candidate)) ?? candidates[0];
}

export function resolveStudioCarouselFallbackSrc({
  image,
  displaySrc,
  isComparing,
  failedDisplaySrcs = [],
}: {
  image: GeneratedImageWithConfig;
  displaySrc: string;
  isComparing: boolean;
  failedDisplaySrcs?: string[];
}) {
  const candidates = resolveStudioCarouselDisplayCandidates({ image, isComparing }).filter(
    (candidate) => candidate !== displaySrc && !failedDisplaySrcs.includes(candidate),
  );
  return candidates[0] ?? null;
}

export function resolveStudioCarouselDisplayCandidates({
  image,
  isComparing,
}: {
  image: GeneratedImageWithConfig;
  isComparing: boolean;
}) {
  const referenceSrc = image.config.attachments?.[0]?.dataUrl;
  const candidates =
    isComparing && referenceSrc ? [referenceSrc] : [image.preview, image.thumbnail, image.src];
  return candidates.filter((candidate, index): candidate is string => {
    return Boolean(candidate) && candidates.indexOf(candidate) === index;
  });
}
