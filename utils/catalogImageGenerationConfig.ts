import type { CatalogImage } from '../packages/shared/src';
import { parsePromptTransport } from '../packages/shared/src';
import { DEFAULT_GENERATION_CONFIG, MODELS } from '../constants';
import type { ImageGenerationConfig, ImageSize, RecipeId } from '../types';
import { normalizeImageGenRatio } from './imageGenSizing';
import { detectRecipeFromContext } from './recipeUtils';

type RecordLike = Record<string, unknown>;

const VALID_IMAGE_SIZES = new Set<ImageSize>(['512px', '1K', '2K', '4K']);

function isRecordLike(value: unknown): value is RecordLike {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readString(record: RecordLike | null, key: string) {
  const value = record?.[key];
  return typeof value === 'string' ? value : '';
}

function readBoolean(record: RecordLike | null, key: string) {
  const value = record?.[key];
  return typeof value === 'boolean' ? value : null;
}

function readNumber(record: RecordLike | null, key: string) {
  const value = record?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readRecipeParams(record: RecordLike | null) {
  const value = record?.recipeParams;
  return isRecordLike(value) ? value : null;
}

function normalizeImageSize(value: unknown): ImageSize {
  if (typeof value === 'string' && VALID_IMAGE_SIZES.has(value as ImageSize)) {
    return value as ImageSize;
  }

  return DEFAULT_GENERATION_CONFIG.imageSize;
}

function normalizeExecutionSpeed(value: unknown): ImageGenerationConfig['executionSpeed'] {
  return value === 'fast' || value === 'flex' || value === 'standard'
    ? value
    : DEFAULT_GENERATION_CONFIG.executionSpeed;
}

function normalizeRecipeId(candidate: unknown, recipeContext: string): RecipeId {
  if (typeof candidate === 'string') {
    const normalized = candidate as Exclude<RecipeId, null>;
    if (
      normalized === 'remaster' ||
      normalized === 'spritesheet' ||
      normalized === 'cinematic' ||
      normalized === 'character' ||
      normalized === 'styles' ||
      normalized === 'camera' ||
      normalized === 'timeline'
    ) {
      return normalized;
    }
  }

  return detectRecipeFromContext(recipeContext);
}

export function buildGenerationConfigFromCatalogImage(asset: CatalogImage): ImageGenerationConfig {
  const storedConfig = isRecordLike(asset.generationConfig) ? asset.generationConfig : null;
  const parsedPrompt = parsePromptTransport(asset.prompt);
  const recipeContext = readString(storedConfig, 'recipeContext') || parsedPrompt.recipeContext;
  const recipeIdCandidate =
    readString(storedConfig, 'recipeId') || asset.recipeId || parsedPrompt.recipeId;
  const recipeId = normalizeRecipeId(recipeIdCandidate, recipeContext);
  const prompt = readString(storedConfig, 'prompt') || parsedPrompt.prompt || asset.prompt || '';
  const negativePrompt =
    readString(storedConfig, 'negativePrompt') ||
    asset.negativePrompt ||
    parsedPrompt.negativePrompt ||
    '';
  const aspectRatio = normalizeImageGenRatio(
    readString(storedConfig, 'aspectRatio') || asset.aspectRatio || parsedPrompt.aspectRatio,
  );
  const batchCount = Math.max(1, readNumber(storedConfig, 'batchCount') || 1);
  const temperature =
    readNumber(storedConfig, 'temperature') ?? DEFAULT_GENERATION_CONFIG.temperature;
  const useThinkingAndSearch =
    readBoolean(storedConfig, 'useThinkingAndSearch') ??
    DEFAULT_GENERATION_CONFIG.useThinkingAndSearch;
  const executionModel =
    readString(storedConfig, 'executionModel') || DEFAULT_GENERATION_CONFIG.executionModel;
  const executionReasoningEffort =
    readString(storedConfig, 'executionReasoningEffort') ||
    DEFAULT_GENERATION_CONFIG.executionReasoningEffort;
  const executionSpeed = normalizeExecutionSpeed(storedConfig?.executionSpeed);

  return {
    ...DEFAULT_GENERATION_CONFIG,
    prompt,
    recipeContext,
    recipeId,
    recipeParams: readRecipeParams(storedConfig),
    attachments: [],
    aspectRatio,
    imageSize: normalizeImageSize(
      readString(storedConfig, 'imageSize') || asset.imageSize || parsedPrompt.imageSize,
    ),
    negativePrompt,
    temperature,
    model: MODELS.CODEX_IMAGEGEN,
    executionModel,
    executionReasoningEffort,
    executionSpeed,
    batchCount,
    useThinkingAndSearch,
  };
}
