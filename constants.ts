import type { AspectRatio } from './types';

export const MODELS = {
  CODEX_IMAGEGEN: 'codex-imagegen',
} as const;

const DEFAULT_CODEX_EXECUTION_MODEL = 'gpt-5.4';
const DEFAULT_CODEX_EXECUTION_REASONING_EFFORT = 'medium';
const DEFAULT_CODEX_EXECUTION_SPEED = 'standard' as const;

export const DEFAULT_ASPECT_RATIO: AspectRatio = '1:1';

export const RATIO_MAP: Record<AspectRatio, number> = {
  '21:9': 21 / 9,
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '3:2': 3 / 2,
  '5:4': 5 / 4,
  '1:1': 1,
  '4:5': 4 / 5,
  '2:3': 2 / 3,
  '3:4': 3 / 4,
  '9:16': 9 / 16,
};

const SYSTEM_INSTRUCTIONS = {
  IMAGE_GENERATOR: `You are an AI Image Generator. Output ONLY the generated image data. Do not provide any text explanation.`,
};

const DEFAULT_BACKGROUND_CONFIG = {
  density: 0.4,
  speed: 0.002,
};
export const DEFAULT_GENERATION_CONFIG = {
  prompt: '',
  recipeContext: '',
  recipeId: null,
  recipeParams: null,
  attachments: [],
  aspectRatio: DEFAULT_ASPECT_RATIO,
  imageSize: '1K' as const,
  negativePrompt: '',
  temperature: 0.8,
  model: MODELS.CODEX_IMAGEGEN,
  executionModel: DEFAULT_CODEX_EXECUTION_MODEL,
  executionReasoningEffort: DEFAULT_CODEX_EXECUTION_REASONING_EFFORT,
  executionSpeed: DEFAULT_CODEX_EXECUTION_SPEED,
  batchCount: 1,
  useThinkingAndSearch: false,
};
