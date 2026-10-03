import { getRecipePolicy } from './recipePolicies';
import { hasRecipeSource } from './recipePolicies/types';

export interface GenerationRequirement {
  field: 'prompt' | 'source' | 'styles';
  message: string;
}

export interface GenerationRequirementInput {
  recipeId?: string | null;
  prompt?: string;
  referenceCount: number;
  recipeParams?: Record<string, unknown> | null;
  task?: string;
  stylePresetId?: string | null;
}

/** Form requirements only. Provider availability and job progress have separate owners. */
export function getGenerationRequirement(
  input: GenerationRequirementInput,
): GenerationRequirement | null {
  const policy = getRecipePolicy(input.recipeId);
  const prompt = input.prompt?.trim() || (policy.effectivePrompt?.(input) ?? '');
  const recipeRequirement = policy.requirement?.(input, prompt);
  if (recipeRequirement) return recipeRequirement;
  if (!prompt && !hasRecipeSource(input) && !policy.promptOptional) {
    return { field: 'prompt', message: 'Add a prompt or image.' };
  }
  return null;
}

export function getGenerationOutputSummary(
  recipeId: string | null | undefined,
  params: Record<string, unknown> | null | undefined,
  count: number,
) {
  const policy = getRecipePolicy(recipeId);
  if (policy.outputSummary) return policy.outputSummary(params, count);
  return `${count} ${count === 1 ? 'image' : 'images'}`;
}
