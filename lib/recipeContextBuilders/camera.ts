import {
  getBoolean,
  getNumber,
  getString,
  recipeDocument,
  RECIPE_CONTEXT_PROTOCOL,
  type RecipeContextBuilder,
  type RecipeContextParams,
} from './shared';
import {
  getCameraDirectorInstructions,
  getCameraGeometryConstraints,
} from '../recipeDerivedParams';

function buildCameraContext(params: RecipeContextParams) {
  const azimuth = Math.round(getNumber(params, 'azimuth', 0));
  const elevation = Math.round(getNumber(params, 'elevation', 0));
  const distance = Math.round(getNumber(params, 'distance', 100));
  const hasReference = getBoolean(params, 'hasReference');
  const director = getCameraDirectorInstructions(azimuth, elevation, distance);
  const hPos = getString(params, 'hPos') || director.hPos;
  const vPos = getString(params, 'vPos') || director.vPos;
  const framing = getString(params, 'framing') || director.framing;
  const geometryConstraints =
    getString(params, 'geometryConstraints') || getCameraGeometryConstraints(azimuth, elevation);

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
4. ${getBoolean(params, 'transparentBackground') ? 'Preserve the reference style and render the subject on native transparent alpha.' : getBoolean(params, 'preserveBackground') ? 'Preserve the reference background unless the request explicitly changes the environment.' : 'Follow the requested scene and background; use a neutral background only when unspecified.'}
  `,
  );
}

export const cameraRecipeContextBuilder = {
  protocol: RECIPE_CONTEXT_PROTOCOL,
  title: 'CAMERA VIEW PROMPT',
  buildContext: buildCameraContext,
} satisfies RecipeContextBuilder;
