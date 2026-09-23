import { buildLegacyStylePrompt } from '../../packages/shared/src/styles/legacyStylePrompt';
import {
  getString,
  recipeDocument,
  RECIPE_CONTEXT_PROTOCOL,
  type RecipeContextBuilder,
  type RecipeContextParams,
} from './shared';

function buildStylesContext(params: RecipeContextParams) {
  const effectivePrompt = getString(params, 'effectivePrompt');
  const styleRequestHash = getString(params, 'styleRequestHash');
  if (effectivePrompt && styleRequestHash) {
    return recipeDocument(
      'styles',
      'INTENTIONAL STYLE REQUEST',
      `
${effectivePrompt}

styleRequestHash: ${styleRequestHash}
DO NOT output text or explanations. Just the image.
`,
    );
  }

  // Reconstruct at the last boundary as well as in the composer. Historical
  // drafts can contain aliases and scene-bearing briefs in cached strings.
  return recipeDocument('styles', 'STYLE TRANSFER PROTOCOL', buildLegacyStylePrompt(params));
}

export const stylesRecipeContextBuilder = {
  protocol: RECIPE_CONTEXT_PROTOCOL,
  title: 'STYLE TRANSFER PROTOCOL',
  buildContext: buildStylesContext,
} satisfies RecipeContextBuilder;
