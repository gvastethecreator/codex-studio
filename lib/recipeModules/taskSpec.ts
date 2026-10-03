import {
  buildGenerationBackgroundInstruction,
  createGenerationTaskSpec,
  type GenerationProviderId,
  type GenerationQualityPresetId,
  type GenerationTaskAssetRef,
  type GenerationTaskKind,
} from '../../packages/shared/src/generationContracts';
import { resolveCodexHttpImageSize } from '../../packages/shared/src/codexExecutionContract';
import type { Attachment, ImageGenerationConfig } from '../../types';
import {
  projectGenerationBackgroundParams,
  resolveGenerationBackground,
} from '../generationBackground';
import type { GenerationVariationScope } from '../generationVariation';
import { isRecipeProviderSupported, isRecipeTaskSupported, validateRecipeParams } from './params';
import { DEFAULT_RECIPE, getRecipeBehavior, getRecipeModule } from './registry';
import type {
  RecipeBehavior,
  RecipeDirectiveContext,
  RecipeModule,
  RecipeParams,
  RecipePlan,
} from './types';

export interface BuildGenerationTaskSpecFromRecipeArgs {
  id: string;
  providerId?: GenerationProviderId | null;
  config: ImageGenerationConfig;
  task?: GenerationTaskKind;
}

type RecipeConfig = Pick<ImageGenerationConfig, 'recipeId' | 'recipeParams'>;

function resolveBehavior(recipeId: string | null | undefined): RecipeBehavior {
  return getRecipeBehavior(recipeId) ?? DEFAULT_RECIPE;
}

function isInlineAttachmentDataUrl(value: string | null | undefined) {
  return /^data:image\/[^;]+;base64,/i.test(value?.trim() ?? '');
}

function resolveRecipeAttachmentAssetLocation(
  attachment: Attachment,
): Pick<GenerationTaskAssetRef, 'dataUrl' | 'localPath' | 'sourceUrl'> {
  const localPath = attachment.localPath?.trim();
  if (localPath) return { localPath };

  const explicitSourceUrl = attachment.sourceUrl?.trim();
  if (explicitSourceUrl) return { sourceUrl: explicitSourceUrl };

  const attachmentSource = attachment.dataUrl.trim();
  if (isInlineAttachmentDataUrl(attachmentSource)) return { dataUrl: attachmentSource };
  if (/^https?:\/\//i.test(attachmentSource) || attachmentSource.startsWith('/')) {
    return { sourceUrl: attachmentSource };
  }

  return { dataUrl: attachmentSource };
}

export function buildRecipeProviderDirectives(
  module: RecipeModule,
  params: RecipeParams | null | undefined,
  context: RecipeDirectiveContext = { referenceCount: 0 },
) {
  return resolveBehavior(module.id).directives(params ?? {}, context);
}

export function resolveRecipeVariationScope(config: RecipeConfig): GenerationVariationScope {
  const module = getRecipeModule(config.recipeId ?? null);
  if (!module) return 'open';
  return resolveBehavior(module.id).variationScope?.(config.recipeParams ?? {}) ?? module.variation;
}

/** The first attachment is the image being edited, or the identity source, for some recipes. */
export function resolveRecipeAttachmentRole(config: RecipeConfig, index: number) {
  return (
    resolveBehavior(config.recipeId).attachmentRole?.(config.recipeParams ?? {}, index) ??
    ('reference' as const)
  );
}

function resolveQualityPresetId(
  behavior: RecipeBehavior,
  task: GenerationTaskKind,
  referenceCount: number,
): GenerationQualityPresetId {
  if (task === 'image_edit') return 'image_edit';
  if (task === 'sprite_sheet') return 'sprite_sheet';
  if (task === 'texture_generate') return 'texture';
  const recipePresetId = behavior.qualityPresetId?.(task, referenceCount);
  if (recipePresetId) return recipePresetId;
  if (task === 'style_preset_card') return 'product_or_ui_asset';
  return 'image_general';
}

function planValue<T>(value: T | undefined, fallback: T) {
  return value === undefined ? fallback : value;
}

export function buildGenerationTaskSpecFromRecipe({
  id,
  providerId = null,
  config,
  task,
}: BuildGenerationTaskSpecFromRecipeArgs) {
  const module = getRecipeModule(config.recipeId ?? null);
  const behavior = resolveBehavior(config.recipeId);
  const referenceCount = config.attachments.length;
  const params = projectGenerationBackgroundParams(config);
  const plan: RecipePlan = behavior.plan
    ? behavior.plan({ config, params, referenceCount })
    : { directives: behavior.directives(params, { referenceCount }) };
  const backgroundInstruction = buildGenerationBackgroundInstruction(
    resolveGenerationBackground(config),
    task === 'image_edit' || referenceCount > 0,
  );
  const prompt = config.prompt || 'Generate a high-quality image.';
  const requestedTask =
    typeof config.recipeParams?.task === 'string'
      ? (config.recipeParams.task as GenerationTaskKind)
      : null;
  const moduleTaskKind =
    module && requestedTask && isRecipeTaskSupported(module, requestedTask)
      ? requestedTask
      : (module?.defaultTask ?? 'image_generate');
  const recipeTaskKind = behavior.resolveTask
    ? behavior.resolveTask(moduleTaskKind, referenceCount)
    : moduleTaskKind;
  // An edit needs an image to edit. Without one the request is a generation.
  const taskKind =
    task ??
    (recipeTaskKind === 'image_edit' && referenceCount === 0 ? 'image_generate' : recipeTaskKind);
  const resolvedImageSize = config.aspectRatio
    ? resolveCodexHttpImageSize({
        aspectRatio: config.aspectRatio,
        imageSize: config.imageSize ?? '1K',
      })
    : (config.imageSize ?? null);
  const negativePrompt = plan.negativePrompt || config.negativePrompt || null;

  if (module && !isRecipeTaskSupported(module, taskKind)) {
    throw new Error(`Recipe Module ${module.id} does not support task ${taskKind}.`);
  }
  if (module && !isRecipeProviderSupported(module, providerId)) {
    throw new Error(`Recipe Module ${module.id} does not support provider ${providerId}.`);
  }
  if (module) {
    const validation = validateRecipeParams(module, config.recipeParams ?? null);
    if (!validation.valid) {
      throw new Error(validation.errors[0]);
    }
  }

  const quality = plan.quality ?? {};
  const recipeParams = config.recipeParams ?? {};

  return createGenerationTaskSpec({
    id,
    task: taskKind,
    providerId,
    prompt,
    negativePrompt,
    recipeId: config.recipeId ?? null,
    recipeParams: config.recipeParams ?? null,
    stylePresetId: plan.stylePresetId ?? null,
    assets: config.attachments.map((attachment, index) => ({
      role: resolveRecipeAttachmentRole(config, index),
      name: attachment.name,
      ...resolveRecipeAttachmentAssetLocation(attachment),
      strength: attachment.strength,
    })),
    quality: {
      qualityPresetId: resolveQualityPresetId(behavior, taskKind, referenceCount),
      subject: null,
      composition: null,
      style: planValue(quality.style, null),
      lighting: null,
      color: planValue(
        quality.color,
        typeof recipeParams.colorTone === 'string' ? recipeParams.colorTone : null,
      ),
      materials: planValue(quality.materials, null),
      constraints: [backgroundInstruction, ...(quality.constraints ?? [])],
      negative: quality.negative ?? [],
      referenceRoles: config.attachments.map((attachment, index) => ({
        role: resolveRecipeAttachmentRole(config, index),
        assetName: attachment.name,
        instruction: behavior.referenceInstruction(recipeParams, attachment, index),
      })),
    },
    output: {
      background: resolveGenerationBackground(config),
      count: config.batchCount,
      aspectRatio: config.aspectRatio,
      imageSize: resolvedImageSize,
      mimeType: 'image/png',
      requiresCatalogEntry: true,
      requiresLocalAsset: true,
      requiresExactPath: true,
    },
    metadata: {
      recipeProviderDirectives: plan.directives,
      spriteAtlas: plan.metadata?.spriteAtlas ?? null,
      animationSequence: plan.metadata?.animationSequence ?? null,
      recipeModule: module
        ? {
            id: module.id,
            title: module.title,
            defaultTask: module.defaultTask,
            supportedTasks: module.supportedTasks,
            supportedProviders: module.supportedProviders,
          }
        : null,
      execution: {
        model: config.executionModel,
        reasoningEffort: config.executionReasoningEffort,
        serviceTier: config.executionSpeed,
      },
    },
  });
}
