import {
  getBoolean,
  getNumber,
  getString,
  recipeDocument,
  RECIPE_CONTEXT_PROTOCOL,
  type RecipeContextBuilder,
  type RecipeContextParams,
} from './shared';

export function buildTimelineContext(params: RecipeContextParams) {
  const nextIndex = getNumber(params, 'nextIndex', 1);
  const direction = getString(params, 'direction', 'forward');
  const timeDeltaValue = getString(params, 'timeDeltaValue', 'SHORT_TERM_CONSEQUENCE');
  const timeDeltaLabel = getString(params, 'timeDeltaLabel', 'Seconds');
  const cameraMode = getString(params, 'cameraMode', 'locked');
  const motionAmount = getString(params, 'motionAmount', 'Subtle');
  const lightingMode = getString(params, 'lightingMode', 'Locked');
  const isAnchored = getBoolean(params, 'isAnchored');
  const directionPrompt =
    direction === 'forward'
      ? 'NEXT FRAME: Generate a plausible future state.'
      : 'PREVIOUS FRAME: Generate a plausible past state.';

  const recipeSchema = {
    task_id: 'TIMELINE_FRAME_GUIDANCE',
    sequence_index: nextIndex,
    direction: direction.toUpperCase(),
    time_delta: timeDeltaValue,
    visual_guidance: {
      camera_behavior: cameraMode.toUpperCase(),
      subject_motion: motionAmount.toUpperCase(),
      lighting_continuity: lightingMode.toUpperCase(),
    },
    context_mode: isAnchored ? 'ANCHORED_STABILITY' : 'FREE_FLOW',
    instructions: [
      directionPrompt,
      `Time elapsed: ${timeDeltaLabel}. Use this to guide the amount of scene change.`,
      `Motion Level: ${motionAmount}. Use this as a cue for pose, position, or state change.`,
      `Lighting: ${lightingMode}. Keep shadows and highlights coherent if time has passed.`,
      isAnchored
        ? "Use the 'Anchor' image as the identity/style guide, and the 'Ref' image as the current state guide."
        : 'Keep visual identity and style close to the reference image.',
      'Output should read like a neighboring storyboard frame in the same sequence.',
      'Avoid text, UI, and watermarks.',
    ],
  };

  return recipeDocument('timeline', 'TIMELINE FRAME PROMPT', JSON.stringify(recipeSchema, null, 2));
}

export const timelineRecipeContextBuilder = {
  protocol: RECIPE_CONTEXT_PROTOCOL,
  title: 'TIMELINE FRAME PROMPT',
  buildContext: buildTimelineContext,
} satisfies RecipeContextBuilder;
