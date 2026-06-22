import {
  getNumber,
  getRecord,
  getString,
  recipeDocument,
  RECIPE_CONTEXT_PROTOCOL,
  type RecipeContextBuilder,
  type RecipeContextParams,
} from './shared';
import {
  createCinematicFrameInstructions,
  createCinematicLayoutInstruction,
} from '../recipePromptFragments';

function buildCinematicContext(params: RecipeContextParams) {
  const frames = Math.max(1, getNumber(params, 'frames', 9));
  const rows = Math.max(1, getNumber(params, 'rows', 3));
  const cols = Math.max(1, getNumber(params, 'cols', 3));
  const aspectRatio = getString(params, 'aspectRatio', '1:1');
  const frameShots = getRecord(params, 'frameShots');
  const genre = getString(params, 'genre', 'Auto-Detect');
  const tone = getString(params, 'tone', 'Auto-Detect');
  const lighting = getString(params, 'lighting', 'Auto-Detect');
  const time = getString(params, 'time', 'Auto-Detect');
  const weather = getString(params, 'weather', 'Auto-Detect');
  const movement = getString(params, 'movement', 'Auto-Detect');
  const lens = getString(params, 'lens', 'Auto-Detect');

  const layoutInstruction = createCinematicLayoutInstruction(frames, rows, cols);
  const frameInstructions = createCinematicFrameInstructions(frameShots);

  return recipeDocument(
    'cinematic',
    'STORYBOARD CONTACT SHEET',
    `
ROLE: Director of Photography, Colorist, and Storyboard Artist.
TASK: Create a storyboard-style image sequence based on the prompt/reference.
LAYOUT: ${layoutInstruction}
FRAMES: ${frames}
ASPECT RATIO: ${aspectRatio}

PARAMETERS:
- Genre: ${genre}
- Tone: ${tone}
- Lighting: ${lighting} (Keep light direction and quality coherent across frames where possible)
- Time: ${time}
- Weather: ${weather}
- Camera Movement: ${movement} (Use this as the visual camera language across frames)
- Lens/Focal Length: ${lens} (Apply appropriate depth of field and distortion)${frameInstructions}

DIRECTIVES:
1. CONTINUITY: Aim for visual continuity of character, setting, and lighting logic across all frames.
2. NARRATIVE: Suggest a micro-story: Setup -> Action -> Reaction.
3. AESTHETIC: High fidelity photorealism with professional color grading matching the chosen Tone and Genre.
4. COMPOSITION: Apply rule of thirds, leading lines, and cinematic framing techniques. Respect the specific frame shots if provided.
5. NO TEXT: Avoid text, UI elements, and watermarks in the generated frames.
  `,
  );
}

export const cinematicRecipeContextBuilder = {
  protocol: RECIPE_CONTEXT_PROTOCOL,
  title: 'STORYBOARD CONTACT SHEET',
  buildContext: buildCinematicContext,
} satisfies RecipeContextBuilder;
