import type { CatalogImage } from '../packages/shared/src/types';
import { parsePromptTransport } from '../packages/shared/src/promptTransport';
import { getGenerationRequirement } from '../packages/shared/src/generationRequirements';
import { DEFAULT_GENERATION_CONFIG, MODELS } from '../constants';
import type { Attachment, ImageGenerationConfig, ImageSize, RecipeId } from '../types';
import { normalizeImageGenRatio } from './imageGenSizing';
import { parseRecipeIdFromContext } from '../lib/recipeShellMetadata';
import { isRegisteredRecipeId } from '../lib/recipeIds';

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

/** Old entries carry the recipe id only inside a stored or prompt-embedded recipe context. */
function normalizeRecipeId(candidate: unknown, legacyRecipeContext: string): RecipeId {
  if (isRegisteredRecipeId(candidate)) return candidate;

  return parseRecipeIdFromContext(legacyRecipeContext);
}

/** Source and reference assets saved with the job, so Regenerate replays the same inputs. */
function readSourceAttachments(record: RecordLike | null, catalogId: string): Attachment[] {
  const assets = Array.isArray(record?.attachments) ? record.attachments : [];
  return assets.flatMap((asset, index) => {
    if (!isRecordLike(asset) || (asset.role !== 'input' && asset.role !== 'reference')) return [];
    const localPath = readString(asset, 'localPath').trim();
    const sourceUrl = readString(asset, 'sourceUrl').trim();
    const dataUrl = readString(asset, 'dataUrl').trim();
    if (!localPath && !sourceUrl && !dataUrl) return [];
    return [
      {
        id: `source-${catalogId}-${index}`,
        name: readString(asset, 'name') || `source-${index + 1}`,
        dataUrl: dataUrl || sourceUrl,
        ...(localPath ? { localPath } : {}),
        ...(sourceUrl ? { sourceUrl } : {}),
        strength: readNumber(asset, 'strength') ?? 0.5,
      },
    ];
  });
}

/** Regenerate never borrows composer references; a missing required source stops it. */
export function getCatalogRegenerateIssue(config: ImageGenerationConfig) {
  const requirement = getGenerationRequirement({
    ...config,
    referenceCount: config.attachments.length,
  });
  return requirement?.field === 'source'
    ? 'The source image for this result is no longer available. Add it again to regenerate.'
    : null;
}

export function buildGenerationConfigFromCatalogImage(asset: CatalogImage): ImageGenerationConfig {
  const storedConfig = isRecordLike(asset.generationConfig) ? asset.generationConfig : null;
  const parsedPrompt = parsePromptTransport(asset.prompt);
  const recipeIdCandidate =
    readString(storedConfig, 'recipeId') || asset.recipeId || parsedPrompt.recipeId;
  const recipeId = normalizeRecipeId(
    recipeIdCandidate,
    readString(storedConfig, 'recipeContext') || parsedPrompt.recipeContext,
  );
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
    outputBackground: storedConfig?.outputBackground === 'transparent' ? 'transparent' : 'workflow',
    prompt,
    recipeId,
    recipeParams: readRecipeParams(storedConfig),
    attachments: readSourceAttachments(storedConfig, asset.id),
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
