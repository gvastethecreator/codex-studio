import type { GenerationRequirement, GenerationRequirementInput } from '../generationRequirements';

export type RecipePolicyParams = Record<string, unknown> | null | undefined;

/** Recipe rules that the browser and the local server both apply. */
export interface RecipePolicy {
  /** The prompt that requirement checks use when the composer prompt is empty. */
  effectivePrompt?(input: GenerationRequirementInput): string;
  /** Recipe form rules. They run before the generic prompt-or-image rule. */
  requirement?(input: GenerationRequirementInput, prompt: string): GenerationRequirement | null;
  /** The generic prompt-or-image rule does not apply. */
  promptOptional?: boolean;
  outputSummary?(params: RecipePolicyParams, count: number): string;
}

export function hasRecipeSource(input: GenerationRequirementInput) {
  return input.referenceCount > 0;
}

export function formatOutputFileCount(count: number) {
  return `${count} ${count === 1 ? 'file' : 'files'}`;
}

/** Cells per output from a grid label ("4x2", "1x6 Strip") or from rows and columns. */
export function countOutputCells(params: RecipePolicyParams) {
  const gridValue = params?.grid ?? params?.layout;
  const grid = typeof gridValue === 'string' ? gridValue : '';
  const dimensions = grid.match(/(\d+)\s*[x×]\s*(\d+)/i);
  return dimensions
    ? Number(dimensions[1]) * Number(dimensions[2])
    : grid.includes('Strip')
      ? 6
      : Number(params?.rows) * Number(params?.cols) || null;
}
