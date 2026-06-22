export interface PromptTransportSnapshot {
  prompt: string;
  recipeContext: string;
  recipeId: string | null;
  negativePrompt: string;
  aspectRatio: string | null;
  imageSize: string | null;
}

const RECIPE_CONTEXT_START = '--- CODEX RECIPE CONTEXT ---';
const RECIPE_CONTEXT_END = '--- END CODEX RECIPE CONTEXT ---';

function trimPrompt(prompt: string | null | undefined) {
  return (prompt ?? '').trim();
}

export function extractRecipeContextFromPrompt(prompt: string | null | undefined) {
  const source = trimPrompt(prompt);
  const startIndex = source.indexOf(RECIPE_CONTEXT_START);

  if (startIndex < 0) {
    return '';
  }

  const endIndex = source.indexOf(RECIPE_CONTEXT_END, startIndex);

  if (endIndex < 0) {
    return source.slice(startIndex).trim();
  }

  return source.slice(startIndex, endIndex + RECIPE_CONTEXT_END.length).trim();
}

export function extractRecipeIdFromRecipeContext(recipeContext: string | null | undefined) {
  const context = trimPrompt(recipeContext);
  const match = context.match(/^recipe:\s*(\w+)$/m);

  return match?.[1] ?? null;
}

function extractNegativePromptFromPrompt(prompt: string | null | undefined) {
  const source = trimPrompt(prompt);
  const match = source.match(
    /(?:^|\n\n)Avoid:\n([\s\S]*?)(?=\n\nImageGen output size:|\n\nAspect ratio:|$)/,
  );

  return match?.[1]?.trim() ?? '';
}

function extractAspectRatioFromPrompt(prompt: string | null | undefined) {
  return trimPrompt(prompt).match(/Aspect ratio:\s*([0-9]+:[0-9]+)/)?.[1] ?? null;
}

function extractImageSizeFromPrompt(prompt: string | null | undefined) {
  return (
    trimPrompt(prompt)
      .match(/ImageGen output size:\s*([^\n]+)/)?.[1]
      ?.trim() ?? null
  );
}

export function stripPromptTransportSections(prompt: string | null | undefined) {
  const source = trimPrompt(prompt);

  if (!source) {
    return '';
  }

  return source
    .replace(
      /(?:\n\n)?Recipe instructions:\n--- CODEX RECIPE CONTEXT ---[\s\S]*?--- END CODEX RECIPE CONTEXT ---/g,
      '',
    )
    .replace(/(?:\n\n)?Avoid:\n[\s\S]*?(?=\n\nImageGen output size:|\n\nAspect ratio:|$)/g, '')
    .replace(/(?:\n\n)?ImageGen output size:\s*[^\n]+/g, '')
    .replace(/(?:\n\n)?Aspect ratio:\s*[^\n]+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function parsePromptTransport(prompt: string | null | undefined): PromptTransportSnapshot {
  const recipeContext = extractRecipeContextFromPrompt(prompt);

  return {
    prompt: stripPromptTransportSections(prompt),
    recipeContext,
    recipeId: extractRecipeIdFromRecipeContext(recipeContext),
    negativePrompt: extractNegativePromptFromPrompt(prompt),
    aspectRatio: extractAspectRatioFromPrompt(prompt),
    imageSize: extractImageSizeFromPrompt(prompt),
  };
}
