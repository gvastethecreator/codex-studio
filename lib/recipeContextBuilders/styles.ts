import {
  getString,
  recipeDocument,
  RECIPE_CONTEXT_PROTOCOL,
  type RecipeContextBuilder,
  type RecipeContextParams,
} from './shared';

export function buildStylesContext(params: RecipeContextParams) {
  const presetName = getString(params, 'presetName', 'Unnamed Style');
  const mode = getString(params, 'mode', 'DIRECT_STYLE_SYNTHESIS');
  const roleInstruction = getString(params, 'roleInstruction');
  const compositionRule = getString(params, 'compositionRule');
  const styleEmphasis = getString(params, 'styleEmphasis');
  const aesthetic = getString(params, 'aesthetic', 'Standard');
  const subjectTreatment = getString(params, 'subjectTreatment', 'Standard');
  const colorTone = getString(params, 'colorTone', 'Standard');
  const lightingShadow = getString(params, 'lightingShadow', 'Standard');
  const textureMaterial = getString(params, 'textureMaterial', 'Standard');
  const cameraComposition = getString(params, 'cameraComposition', 'Standard');
  const atmosphereMood = getString(params, 'atmosphereMood', 'Standard');
  const renderingQuality = getString(params, 'renderingQuality', 'Standard');

  return recipeDocument(
    'styles',
    'STYLE TRANSFER PROTOCOL',
    `
TARGET STYLE: ${presetName.toUpperCase()}
MODE: ${mode}

[DIRECTIVES]
${roleInstruction}

[VISUAL DNA]
- Core Aesthetic: ${aesthetic}
- Subject Treatment: ${subjectTreatment}
- Color & Tone: ${colorTone}
- Lighting & Shadow: ${lightingShadow}
- Texture & Material: ${textureMaterial}
- Camera & Composition: ${cameraComposition}
- Atmosphere & Mood: ${atmosphereMood}
- Rendering & Quality: ${renderingQuality}

[EXECUTION RULES]
${compositionRule}
${styleEmphasis}
DO NOT output text or explanations. Just the image.
  `,
  );
}

export const stylesRecipeContextBuilder = {
  protocol: RECIPE_CONTEXT_PROTOCOL,
  title: 'STYLE TRANSFER PROTOCOL',
  buildContext: buildStylesContext,
} satisfies RecipeContextBuilder;
