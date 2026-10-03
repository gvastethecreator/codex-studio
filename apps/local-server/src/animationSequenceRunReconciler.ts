import type { AnimationSequenceService } from './animationSequenceService';
import type { WorkflowRunParticipant } from './workflowRunReconciler';

/** Animation Sequence lane of the workflow run reconciler. */
export function createAnimationSequenceRunParticipant(
  _service: AnimationSequenceService,
): WorkflowRunParticipant {
  return {
    recipeId: 'animation-sequence',
    recordDispatch: async () => {},
    settle: async () => false,
    recover: async () => {},
  };
}
