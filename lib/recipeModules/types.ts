import type {
  GenerationOutputContract,
  GenerationProviderId,
  GenerationQualityPresetId,
  GenerationTaskKind,
} from '../../packages/shared/src/generationContracts';
import type { RecipePolicy } from '../../packages/shared/src/recipePolicies';
import type { RecipeProviderDirectives } from '../../packages/shared/src/recipeProviderDirectives';
import type { Attachment, ImageGenerationConfig } from '../../types';
import type { GenerationVariationScope } from '../generationVariation';
import type { RegisteredRecipeId } from '../recipeIds';

export type RecipeParameterKind = 'string' | 'number' | 'boolean' | 'record' | 'enum' | 'color';
export type RecipeParameterControlKind =
  | 'text'
  | 'select'
  | 'slider'
  | 'toggle'
  | 'color'
  | 'record';

export interface RecipeParameterDescriptor {
  id: string;
  label: string;
  kind: RecipeParameterKind;
  group?: string;
  control?: RecipeParameterControlKind;
  required?: boolean;
  defaultValue?: unknown;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export interface RecipeModule {
  id: RegisteredRecipeId;
  title: string;
  description: string;
  defaultTask: GenerationTaskKind;
  supportedTasks: GenerationTaskKind[];
  supportedProviders: GenerationProviderId[];
  /** How far repeated or sibling results may drift from the workflow contract. */
  variation: GenerationVariationScope;
  parameters: RecipeParameterDescriptor[];
}

export type RecipeParams = Record<string, unknown>;

export interface RecipeDirectiveContext {
  /** Attached images, including the source image. */
  referenceCount: number;
}

export interface RecipePlanInput {
  config: ImageGenerationConfig;
  /** Recipe params after the output background projection. */
  params: RecipeParams;
  referenceCount: number;
}

/** Quality intent fields a recipe sets. An undefined field keeps the generic value. */
export interface RecipeQualityPlan {
  style?: string | null;
  color?: string | null;
  materials?: string | null;
  /** Added after the background instruction. */
  constraints?: string[];
  negative?: string[];
}

export interface RecipePlan {
  directives: RecipeProviderDirectives | null;
  quality?: RecipeQualityPlan;
  negativePrompt?: string | null;
  stylePresetId?: string | null;
  metadata?: {
    spriteAtlas?: unknown;
    animationSequence?: unknown;
  };
}

export interface RecipeBackgroundBehavior {
  /** A background the workflow itself sets, before the generic rules. */
  native?(config: ImageGenerationConfig): GenerationOutputContract['background'] | undefined;
  /** The workflow fills the sheet with its chosen color, also when a reference is attached. */
  usesSheetFill?(params: RecipeParams): boolean;
  /** Extra effective params after the generic non-transparent projection. */
  project?(config: ImageGenerationConfig, params: RecipeParams): RecipeParams;
}

/** Recipe-specific behavior. Every hook is optional except the reference instruction. */
export interface RecipeBehavior {
  policy: RecipePolicy;
  /** Attachment cap that replaces the provider input-image limit. */
  maxReferences?: number;
  /** Strength sent with every attached reference. */
  referenceStrength?(params: RecipeParams): number;
  /** Task prompt when the composer prompt is empty and a reference is attached. */
  referencePromptFallback?: string;
  variationScope?(params: RecipeParams): GenerationVariationScope | undefined;
  /** Adjusts the task after the generic requested/default task choice. */
  resolveTask?(
    task: GenerationTaskKind,
    referenceCount: number,
    params: RecipeParams,
  ): GenerationTaskKind;
  attachmentRole?(params: RecipeParams, index: number): 'input' | 'reference';
  referenceInstruction(params: RecipeParams, attachment: Attachment, index: number): string;
  /** Quality preset for tasks without a task-bound preset. */
  qualityPresetId?(
    task: GenerationTaskKind,
    referenceCount: number,
  ): GenerationQualityPresetId | undefined;
  background?: RecipeBackgroundBehavior;
  directives(
    params: RecipeParams,
    context: RecipeDirectiveContext,
  ): RecipeProviderDirectives | null;
  /** Spec contributions. Without it, the spec carries only the directives. */
  plan?(input: RecipePlanInput): RecipePlan;
}

export interface RecipeDefinition extends RecipeBehavior {
  module: RecipeModule;
}
