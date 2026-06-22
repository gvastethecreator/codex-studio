import type { AspectRatio } from './types';

export const MODELS = {
  CODEX_IMAGEGEN: 'codex-imagegen',
} as const;

const DEFAULT_CODEX_EXECUTION_MODEL = 'gpt-5.4-mini';
const DEFAULT_CODEX_EXECUTION_REASONING_EFFORT = 'low';
const DEFAULT_CODEX_EXECUTION_SPEED = 'standard' as const;

const DEFAULT_ASPECT_RATIO: AspectRatio = '1:1';

const ALL_RATIOS: AspectRatio[] = ['1:1', '3:2', '2:3'];

export const RATIO_MAP: Record<AspectRatio, number> = {
  '1:1': 1,
  '3:2': 3 / 2,
  '2:3': 2 / 3,
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
  aspectRatio: '1:1' as AspectRatio,
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
