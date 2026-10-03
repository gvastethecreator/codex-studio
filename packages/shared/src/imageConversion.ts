import type { CatalogImage } from './types';

export type ImageConversionFormat = 'jpeg' | 'webp' | 'png';

export interface ImageConversionOptions {
  format: ImageConversionFormat;
  quality: number;
  lossless: boolean;
  pngCompressionLevel: number;
  background: string;
  preserveMetadata: boolean;
}

export interface ImageConversionRequest extends ImageConversionOptions {
  destination: 'library' | 'download';
}

export interface ImageConversionResult {
  image: CatalogImage;
  filename: string;
  sourceBytes: number;
  outputBytes: number;
}

export const DEFAULT_IMAGE_CONVERSION_OPTIONS: ImageConversionOptions = {
  format: 'webp',
  quality: 85,
  lossless: false,
  pngCompressionLevel: 9,
  background: '#ffffff',
  preserveMetadata: true,
};

export function parseImageConversionRequest(value: unknown): ImageConversionRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Provide image conversion options.');
  }
  const input = value as Record<string, unknown>;
  const format = input.format ?? DEFAULT_IMAGE_CONVERSION_OPTIONS.format;
  if (format !== 'jpeg' && format !== 'webp' && format !== 'png') {
    throw new Error('Choose JPG, WebP or PNG.');
  }
  const destination = input.destination ?? 'library';
  if (destination !== 'library' && destination !== 'download') {
    throw new Error('Choose a library copy or download.');
  }
  const quality = input.quality ?? DEFAULT_IMAGE_CONVERSION_OPTIONS.quality;
  if (typeof quality !== 'number' || !Number.isInteger(quality) || quality < 1 || quality > 100) {
    throw new Error('Quality must be a whole number from 1 to 100.');
  }
  const pngCompressionLevel =
    input.pngCompressionLevel ?? DEFAULT_IMAGE_CONVERSION_OPTIONS.pngCompressionLevel;
  if (
    typeof pngCompressionLevel !== 'number' ||
    !Number.isInteger(pngCompressionLevel) ||
    pngCompressionLevel < 0 ||
    pngCompressionLevel > 9
  ) {
    throw new Error('PNG compression must be a whole number from 0 to 9.');
  }
  const lossless = input.lossless ?? DEFAULT_IMAGE_CONVERSION_OPTIONS.lossless;
  const preserveMetadata =
    input.preserveMetadata ?? DEFAULT_IMAGE_CONVERSION_OPTIONS.preserveMetadata;
  if (typeof lossless !== 'boolean' || typeof preserveMetadata !== 'boolean') {
    throw new Error('Lossless and metadata options must be on or off.');
  }
  const background = input.background ?? DEFAULT_IMAGE_CONVERSION_OPTIONS.background;
  if (typeof background !== 'string' || !/^#[a-f\d]{6}$/i.test(background)) {
    throw new Error('Choose a valid JPG background color.');
  }
  return {
    format,
    destination,
    quality,
    pngCompressionLevel,
    lossless,
    preserveMetadata,
    background,
  };
}
