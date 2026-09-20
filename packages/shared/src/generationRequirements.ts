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
  const params = input.recipeParams ?? {};
  const hasSource = input.referenceCount > 0;
  const prompt =
    input.prompt?.trim() ||
    (input.recipeId === 'character-lab' && typeof params.subject === 'string'
      ? params.subject.trim()
      : '');
  if (input.recipeId === 'remaster' && !hasSource) {
    return { field: 'source', message: 'Add a source image to restore.' };
  }
  if (
    input.recipeId === 'spritesheet' &&
    !hasSource &&
    ((params.view ?? 'Match Source') === 'Match Source' ||
      (params.style ?? 'Preserve Style') === 'Preserve Style')
  ) {
    return { field: 'source', message: 'Add a source image, or choose From prompt.' };
  }
  if (
    input.recipeId === 'styles' &&
    input.task !== 'style_preset_card' &&
    !input.stylePresetId &&
    !(typeof params.presetId === 'string' && params.presetId.trim()) &&
    !(
      Array.isArray(params.selectedStyles) &&
      params.selectedStyles.some(
        (style) =>
          style &&
          typeof style === 'object' &&
          typeof style.presetId === 'string' &&
          style.presetId.trim() &&
          style.enabled !== false,
      )
    )
  ) {
    return { field: 'styles', message: 'Choose a style before generating.' };
  }
  if (input.recipeId === 'animation-sequence' && !prompt) {
    return { field: 'prompt', message: 'Add a motion prompt.' };
  }
  if (!prompt && !hasSource && input.recipeId !== 'styles') {
    return { field: 'prompt', message: 'Add a prompt or image.' };
  }
  return null;
}

export function getGenerationOutputSummary(
  recipeId: string | null | undefined,
  params: Record<string, unknown> | null | undefined,
  count: number,
) {
  const files = `${count} ${count === 1 ? 'file' : 'files'}`;
  const gridValue = params?.grid ?? params?.layout;
  const grid = typeof gridValue === 'string' ? gridValue : '';
  const dimensions = grid.match(/(\d+)\s*[x×]\s*(\d+)/i);
  const cells = dimensions
    ? Number(dimensions[1]) * Number(dimensions[2])
    : grid.includes('Strip')
      ? 6
      : Number(params?.rows) * Number(params?.cols) || null;
  if (recipeId === 'spritesheet')
    return `${count} ${count === 1 ? 'sheet' : 'sheets'}${cells ? ` · ${cells} cells each` : ''} · ${files}`;
  if (recipeId === 'cinematic')
    return `${count} ${count === 1 ? 'storyboard' : 'storyboards'}${cells ? ` · ${cells} scenes each` : ''} · ${files}`;
  if (recipeId === 'character')
    return `${count} character ${count === 1 ? 'sheet' : 'sheets'} · ${files}`;
  return `${count} ${count === 1 ? 'image' : 'images'}`;
}
