import {
  getNumber,
  getString,
  recipeDocument,
  RECIPE_CONTEXT_PROTOCOL,
  type RecipeContextBuilder,
  type RecipeContextParams,
} from './shared';

function buildRemasterContext(params: RecipeContextParams) {
  const style = getString(params, 'style', 'Archive Restoration');
  const lighting = getString(params, 'lighting', 'Preserve Lighting');
  const camera = getString(params, 'camera', 'Preserve Detail');
  const anatomy = getString(params, 'anatomy', 'Preserve Geometry and Identity');
  const text = getString(params, 'text', 'Keep Original');
  const color = getString(params, 'color', 'Preserve Colors');
  const fidelity = Math.max(0, Math.min(100, getNumber(params, 'fidelity', 100)));
  const adherence = fidelity / 100;
  const creativity = (100 - fidelity) / 100;

  return recipeDocument(
    'remaster',
    'PRO RESTORATION',
    `
**Task:** Image Remastering and Restoration.
**Role:** Use the reference image as the main source for a polished local remaster.
**Goal:** Enhance the provided reference image while keeping its original composition and subject matter recognizable.

**Core Directives:**
- **Style Interpretation:** Apply a '${style}' aesthetic.
- **Lighting:** ${lighting}. Do not relight when preservation is selected.
- **Geometry and identity:** ${anatomy}. Do not reconstruct anatomy when preservation is selected.
- **Text Handling:** ${text}.
- **Lens & Detail:** ${camera}. Preserve framing and existing detail unless a change is selected.
- **Color:** ${color}. Do not apply new grading when preservation is selected.

**Fidelity Control:**
- **Adherence to Original Composition:** ${adherence.toFixed(2)} (High value means stay very close to the source structure and layout).
- **Creative Enhancement Freedom:** ${creativity.toFixed(2)} (High value allows for more stylistic interpretation and hallucination of missing details).

**Final Instruction:** Generate one clean remastered image, not a description. Avoid watermarks or added text unless explicitly requested.
  `,
  );
}

export const remasterRecipeContextBuilder = {
  protocol: RECIPE_CONTEXT_PROTOCOL,
  title: 'PRO RESTORATION',
  buildContext: buildRemasterContext,
} satisfies RecipeContextBuilder;
