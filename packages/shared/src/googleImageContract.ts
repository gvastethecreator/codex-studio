export const GOOGLE_IMAGE_MODELS = [
  'gemini-3.1-flash-lite-image',
  'gemini-3.1-flash-image',
  'gemini-3-pro-image',
] as const;

export type GoogleImageModel = (typeof GOOGLE_IMAGE_MODELS)[number];

export const DEFAULT_GOOGLE_IMAGE_MODEL: GoogleImageModel = 'gemini-3.1-flash-image';

export const GOOGLE_IMAGE_SIZES_BY_MODEL = {
  'gemini-3.1-flash-lite-image': ['1K'],
  'gemini-3.1-flash-image': ['512', '1K', '2K', '4K'],
  'gemini-3-pro-image': ['1K', '2K', '4K'],
} as const satisfies Record<GoogleImageModel, readonly string[]>;

export function isGoogleImageModel(value: string): value is GoogleImageModel {
  return (GOOGLE_IMAGE_MODELS as readonly string[]).includes(value);
}

export function isGoogleImageSizeSupported(model: GoogleImageModel, size: string) {
  return (GOOGLE_IMAGE_SIZES_BY_MODEL[model] as readonly string[]).includes(size);
}
