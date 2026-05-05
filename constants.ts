
import type { AspectRatio } from './types';

export const MODELS = {
    CODEX_IMAGEGEN: 'codex-imagegen',
} as const;

const DEFAULT_ASPECT_RATIO: AspectRatio = '1:1';

export const ALL_RATIOS: AspectRatio[] = [
    '1:1', '3:2', '2:3'
];

export const RATIO_MAP: Record<AspectRatio, number> = {
    '1:1': 1, 
    '3:2': 3/2, 
    '2:3': 2/3, 
};

export const SYSTEM_INSTRUCTIONS = {
    IMAGE_GENERATOR: `You are an AI Image Generator. Output ONLY the generated image data. Do not provide any text explanation.`,
};

export const DEFAULT_BACKGROUND_CONFIG = {
  density: 0.4,
  speed: 0.002
};
export const DEFAULT_GENERATION_CONFIG = {
    prompt: '',
    recipeContext: '',
    attachments: [],
    aspectRatio: '1:1' as AspectRatio,
    imageSize: '1K' as const,
    negativePrompt: '',
    temperature: 0.8,
    model: MODELS.CODEX_IMAGEGEN,
    batchCount: 1,
    useThinkingAndSearch: false,
};
