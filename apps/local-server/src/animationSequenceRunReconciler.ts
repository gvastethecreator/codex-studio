import type { AnimationSequenceService } from './animationSequenceService';
import type { WorkflowRunParticipant } from './workflowRunReconciler';

/**
 * Animation Sequence lane of the workflow run reconciler. The service is the Animation
 * Sequence Run Coordinator: it records dispatch at intake and settles frames under its run lock.
 */
export function createAnimationSequenceRunParticipant(
  service: AnimationSequenceService,
): WorkflowRunParticipant {
  return {
    recipeId: 'animation-sequence',
    validateDispatch: (spec) => service.validateDispatch(spec),
    recordDispatch: (jobs) => service.recordDispatch(jobs),
    settle: (job) => service.settleJob(job),
    recover: (jobs) => service.recoverRuns(jobs),
  };
}
