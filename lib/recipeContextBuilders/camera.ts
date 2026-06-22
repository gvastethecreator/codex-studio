import {
  getBoolean,
  getNumber,
  getString,
  recipeDocument,
  RECIPE_CONTEXT_PROTOCOL,
  type RecipeContextBuilder,
  type RecipeContextParams,
} from './shared';

function buildCameraContext(params: RecipeContextParams) {
  const azimuth = Math.round(getNumber(params, 'azimuth', 0));
  const elevation = Math.round(getNumber(params, 'elevation', 0));
  const distance = Math.round(getNumber(params, 'distance', 100));
  const hasReference = getBoolean(params, 'hasReference');
  const hPos = getString(params, 'hPos', 'FRONT CENTER (0°)');
  const vPos = getString(params, 'vPos', 'EYE-LEVEL');
  const framing = getString(params, 'framing', 'MEDIUM SHOT');
  const geometryConstraints = getString(params, 'geometryConstraints');

  return recipeDocument(
    'camera',
    'CAMERA VIEW PROMPT',
    `
ROLE: Image art director translating a reference and camera position into a plausible generated still.
${hasReference ? 'INPUT: A 2D reference image used as visual guidance for subject identity, style, and lighting.' : 'INPUT: A text description of the subject to be composed.'}
OBJECTIVE: Generate a ${hasReference ? 'plausible alternate view of the referenced subject' : 'subject image'} using the camera guidance below.

TARGET CAMERA TRANSFORM:
- ORBIT (Azimuth): ${azimuth}° (${hPos})
- PITCH (Elevation): ${elevation}° (${vPos})
- ZOOM (Field of View): ${distance}% (${framing})

VISUAL GUIDANCE:
${geometryConstraints}

GENERATION DIRECTIVES:
1. Keep subject identity, outfit, palette, and lighting as consistent as possible with the prompt/reference.
2. Use the requested orbit, pitch, and zoom as strong composition guidance.
3. Add plausible matching details for areas not visible in the reference.
4. Preserve the reference style where possible; prefer a neutral background when the source background is ambiguous.
  `,
  );
}

export const cameraRecipeContextBuilder = {
  protocol: RECIPE_CONTEXT_PROTOCOL,
  title: 'CAMERA VIEW PROMPT',
  buildContext: buildCameraContext,
} satisfies RecipeContextBuilder;
