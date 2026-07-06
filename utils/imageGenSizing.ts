import type { AspectRatio } from '../types';

export type ImageGenSize =
  | '1792x768'
  | '1536x864'
  | '1536x1152'
  | '1536x1024'
  | '1280x1024'
  | '1024x1024'
  | '1024x1280'
  | '1024x1536'
  | '1152x1536'
  | '864x1536';

export const IMAGE_GEN_RATIO_OPTIONS: {
  ratio: AspectRatio;
  label: string;
  size: ImageGenSize;
  width: number;
  height: number;
}[] = [
  { ratio: '21:9', label: 'Ultrawide', size: '1792x768', width: 1792, height: 768 },
  { ratio: '16:9', label: 'Wide', size: '1536x864', width: 1536, height: 864 },
  { ratio: '4:3', label: 'Classic', size: '1536x1152', width: 1536, height: 1152 },
  { ratio: '3:2', label: 'Landscape', size: '1536x1024', width: 1536, height: 1024 },
  { ratio: '5:4', label: 'Frame', size: '1280x1024', width: 1280, height: 1024 },
  { ratio: '1:1', label: 'Square', size: '1024x1024', width: 1024, height: 1024 },
  { ratio: '4:5', label: 'Portrait Frame', size: '1024x1280', width: 1024, height: 1280 },
  { ratio: '2:3', label: 'Portrait', size: '1024x1536', width: 1024, height: 1536 },
  { ratio: '3:4', label: 'Classic Portrait', size: '1152x1536', width: 1152, height: 1536 },
  { ratio: '9:16', label: 'Vertical', size: '864x1536', width: 864, height: 1536 },
];

export function getImageGenSizeForRatio(ratio: AspectRatio | null | undefined) {
  return (
    IMAGE_GEN_RATIO_OPTIONS.find((option) => option.ratio === ratio) || IMAGE_GEN_RATIO_OPTIONS[0]
  );
}

export function normalizeImageGenRatio(ratio: string | null | undefined): AspectRatio {
  if (
    ratio === '21:9' ||
    ratio === '16:9' ||
    ratio === '4:3' ||
    ratio === '3:2' ||
    ratio === '5:4' ||
    ratio === '1:1' ||
    ratio === '4:5' ||
    ratio === '2:3' ||
    ratio === '3:4' ||
    ratio === '9:16'
  )
    return ratio;
  if (ratio === '4:1' || ratio === '8:1') return '21:9';
  if (ratio === '1:4') return '9:16';
  return '1:1';
}
