import type { AspectRatio } from '../types';

export type ImageGenSize = '1024x1024' | '1536x1024' | '1024x1536';

export const IMAGE_GEN_RATIO_OPTIONS: {
  ratio: AspectRatio;
  label: string;
  size: ImageGenSize;
  width: number;
  height: number;
}[] = [
  { ratio: '1:1', label: 'Square', size: '1024x1024', width: 1024, height: 1024 },
  { ratio: '3:2', label: 'Landscape', size: '1536x1024', width: 1536, height: 1024 },
  { ratio: '2:3', label: 'Portrait', size: '1024x1536', width: 1024, height: 1536 },
];

export function getImageGenSizeForRatio(ratio: AspectRatio | null | undefined) {
  return (
    IMAGE_GEN_RATIO_OPTIONS.find((option) => option.ratio === ratio) || IMAGE_GEN_RATIO_OPTIONS[0]
  );
}

export function normalizeImageGenRatio(ratio: string | null | undefined): AspectRatio {
  if (ratio === '3:2' || ratio === '2:3' || ratio === '1:1') return ratio;
  if (
    ratio === '16:9' ||
    ratio === '21:9' ||
    ratio === '4:3' ||
    ratio === '5:4' ||
    ratio === '4:1' ||
    ratio === '8:1'
  )
    return '3:2';
  if (ratio === '9:16' || ratio === '3:4' || ratio === '4:5' || ratio === '1:4') return '2:3';
  return '1:1';
}
