import {
  createAnimationSequenceContract,
  createAnimationSequenceFramePlan,
} from '../../packages/shared/src/animationSequenceContracts';
import {
  getNumber,
  getString,
  recipeDocument,
  RECIPE_CONTEXT_PROTOCOL,
  type RecipeContextBuilder,
  type RecipeContextParams,
} from './shared';

function buildAnimationSequenceContext(params: RecipeContextParams) {
  const contract = createAnimationSequenceContract(params);
  const plan = createAnimationSequenceFramePlan(contract);
  const frameId = getString(params, 'frameId');
  const frameIndex = Math.round(getNumber(params, 'frameIndex', 0));
  const frame =
    plan.frames.find((item) => item.id === frameId) ??
    plan.frames.find((item) => item.index === frameIndex) ??
    plan.frames[0]!;
  const correctionMode = params.correctionMode === true;
  const executableReferenceFrameIds = Array.isArray(params.executableReferenceFrameIds)
    ? params.executableReferenceFrameIds.filter(
        (value): value is string => typeof value === 'string',
      )
    : frame.referenceFrameIds;

  const recipeSchema = {
    task_id: 'ANIMATION_SEQUENCE_FRAME',
    mode: correctionMode ? 'FRAME_CORRECTION' : 'FRAME_GENERATION',
    run_id: getString(params, 'runId', 'unprepared-run'),
    frame: {
      id: frame.id,
      ordinal: frame.ordinal,
      total: contract.frameCount,
      generation_order: frame.generationOrder,
      strategy: frame.strategy,
      keyframe: frame.isKeyframe,
      references: executableReferenceFrameIds,
    },
    sequence: {
      method: contract.method,
      fps: contract.fps,
      aspect_ratio: contract.aspectRatio,
      dimensions: contract.dimensions,
      cyclic: contract.cyclic,
      pin_edges: contract.pinEdges,
      continuity: contract.continuity,
      style_lock: contract.styleLock,
      background: contract.background,
    },
    instructions: [
      frame.prompt,
      correctionMode
        ? 'Correction mode: use the selected frame prompt plus neighbor references to repair only this frame.'
        : 'Generation mode: create only the requested frame as a standalone image.',
      'Output one finished image frame. Do not output video, sprite atlas, storyboard grid, captioned panels, UI, or text overlays.',
      'Keep identity, composition language, palette, and render style coherent with provided references.',
      'This frame will be assembled into a GIF by Codex Studio after image generation.',
    ],
  };

  return recipeDocument(
    'animation-sequence',
    'ANIMATION SEQUENCE FRAME PROMPT',
    JSON.stringify(recipeSchema, null, 2),
  );
}

export const animationSequenceRecipeContextBuilder = {
  protocol: RECIPE_CONTEXT_PROTOCOL,
  title: 'ANIMATION SEQUENCE FRAME PROMPT',
  buildContext: buildAnimationSequenceContext,
} satisfies RecipeContextBuilder;
