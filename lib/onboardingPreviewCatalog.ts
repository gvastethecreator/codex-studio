export interface OnboardingPreviewImage {
  src: string;
  srcSet: string;
}

const responsiveFiles = import.meta.glob('../assets/recipes/onboarding/*/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, unknown>;

const sourcesByPreset = new Map<string, Array<{ width: number; url: string }>>();

for (const [filePath, url] of Object.entries(responsiveFiles)) {
  const match = filePath.match(/\/onboarding\/(\d+)\/([^/]+)\.webp$/i);
  if (!match || typeof url !== 'string') continue;

  const [, widthText, presetId] = match;
  const sources = sourcesByPreset.get(presetId) ?? [];
  sources.push({ width: Number(widthText), url });
  sourcesByPreset.set(presetId, sources);
}

export function getOnboardingPreviewImage(
  presetId: string,
  fallbackUrl: string,
): OnboardingPreviewImage {
  const sources = sourcesByPreset.get(presetId) ?? [];
  const srcSet = [...sources, { width: 1024, url: fallbackUrl }]
    .sort((left, right) => left.width - right.width)
    .map(({ width, url }) => `${url} ${width}w`)
    .join(', ');

  return { src: fallbackUrl, srcSet };
}
