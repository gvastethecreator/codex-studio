import {
  getNumber,
  getString,
  recipeDocument,
  RECIPE_CONTEXT_PROTOCOL,
  type RecipeContextBuilder,
  type RecipeContextParams,
} from './shared';

export function buildRemasterContext(params: RecipeContextParams) {
  const style = getString(params, 'style', 'Realistic Reconstruction');
  const lighting = getString(params, 'lighting', 'Lighting Correction');
  const camera = getString(params, 'camera', 'Sharp Focus');
  const anatomy = getString(params, 'anatomy', 'Fix Anatomy');
  const text = getString(params, 'text', 'Rewrite Logically');
  const color = getString(params, 'color', 'Expanded Dynamic Range');
  const fidelity = Math.max(0, Math.min(100, getNumber(params, 'fidelity', 35)));
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
- **Lighting Correction:** Adjust lighting based on '${lighting}'. Favor realistic light falloff and shadow detail.
- **Anatomical Correction:** ${anatomy}. Reduce visible structural inconsistencies or artifacts where possible.
- **Text Handling:** ${text}.
- **Lens & Detail:** Focus on '${camera}'. Enhance micro-contrast and edge sharpness.
- **Color Grading:** Apply '${color}' grading. Balance white levels and enhance tonal range.

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
